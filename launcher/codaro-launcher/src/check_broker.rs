use crate::CheckBrokerArgs;
use crate::check_sandbox::{AppContainerSandbox, SandboxRequest};
use crate::paths::LauncherPaths;
use crate::provision::{InstallRecord, runtime_tree_sha256};
use crate::state::ActiveReleaseStore;
use anyhow::{Context, Result, bail};
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::Sha256;
use std::io::{BufRead, BufReader, Read, Write};

const PIPE_PREFIX: &str = r"\\.\pipe\codaro-check-";
const MAX_FRAME_BYTES: usize = 1024 * 1024;
type HmacSha256 = Hmac<Sha256>;

struct Secret(Vec<u8>);

impl Drop for Secret {
    fn drop(&mut self) {
        self.0.fill(0);
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Bootstrap {
    secret_hex: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RequestEnvelope {
    schema_version: u32,
    direction: String,
    nonce: String,
    payload: Value,
    mac: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ResponseEnvelope<'a> {
    schema_version: u32,
    direction: &'static str,
    nonce: &'a str,
    payload: &'a ResponsePayload,
    mac: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ResponsePayload {
    schema_version: u32,
    run_id: String,
    executor: &'static str,
    worker_response: Option<Value>,
    infrastructure_error: Option<String>,
}

pub fn run(paths: &LauncherPaths, args: CheckBrokerArgs) -> Result<()> {
    let run_id = validate_pipe_name(&args.pipe_name)?;
    validate_trusted_runtime(paths, &args)?;
    let secret = read_bootstrap_secret()?;
    let mut sandbox = AppContainerSandbox::create(paths, &run_id)?;
    let mut pipe = create_pipe(&args.pipe_name, sandbox.sid_string())?;
    let request_bytes = read_frame(&mut pipe)?;
    let envelope: RequestEnvelope = serde_json::from_slice(&request_bytes)
        .context("check broker request envelope is invalid")?;
    verify_request_envelope(&envelope, &secret.0)?;
    let request: SandboxRequest = serde_json::from_value(envelope.payload.clone())
        .context("check broker request payload is invalid")?;
    if request.schema_version != 1 || request.run_id != run_id {
        bail!("check broker request identity does not match the pipe");
    }
    validate_trusted_request(paths, &request)?;

    let (worker_response, infrastructure_error) =
        match sandbox.execute(&args.python_executable, &args.worker_path, &request) {
            Ok(response) => (Some(response), None),
            Err(error) => (
                None,
                Some(format!(
                    "Windows AppContainer 검증을 완료하지 못했습니다: {error:#}"
                )),
            ),
        };
    let payload = ResponsePayload {
        schema_version: 1,
        run_id,
        executor: "windows-appcontainer",
        worker_response,
        infrastructure_error,
    };
    let mac = sign("response", &envelope.nonce, &payload, &secret.0)?;
    let response = ResponseEnvelope {
        schema_version: 1,
        direction: "response",
        nonce: &envelope.nonce,
        payload: &payload,
        mac,
    };
    write_frame(&mut pipe, &serde_json::to_vec(&response)?)?;
    Ok(())
}

fn validate_trusted_request(paths: &LauncherPaths, request: &SandboxRequest) -> Result<()> {
    let fixture = request
        .fixture_root
        .canonicalize()
        .context("failed to resolve check fixture root")?;
    let temporary_root = std::env::temp_dir()
        .canonicalize()
        .context("failed to resolve the managed temporary directory")?;
    let fixture_name = fixture
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default();
    if !fixture.starts_with(&temporary_root) || !fixture_name.starts_with("codaro-strong-check-") {
        bail!("check broker rejected a fixture outside the per-run temporary root");
    }
    for name in ["HOME", "TEMP", "TMP"] {
        let configured = request
            .environment
            .get(name)
            .with_context(|| format!("check broker request is missing {name}"))?;
        if std::path::Path::new(configured)
            .canonicalize()
            .with_context(|| format!("failed to resolve check environment {name}"))?
            != fixture
        {
            bail!("check broker rejected a process directory outside the fixture");
        }
    }
    let installs = paths
        .installs_dir()
        .canonicalize()
        .context("failed to resolve the managed installs directory")?;
    for package in &request.package_paths {
        let package = package.canonicalize().with_context(|| {
            format!("failed to resolve package snapshot `{}`", package.display())
        })?;
        if !package.starts_with(&installs) {
            bail!("check broker rejected an unmanaged package snapshot");
        }
    }
    Ok(())
}

fn validate_trusted_runtime(paths: &LauncherPaths, args: &CheckBrokerArgs) -> Result<()> {
    let state = ActiveReleaseStore::new(paths.state_dir().join("active-release.json"))
        .load_optional()?
        .context("check broker requires an active managed release")?;
    let expected_python =
        LauncherPaths::resolve_python_executable(&paths.runtime_store_dir(&state.runtime_version))?
            .canonicalize()
            .context("failed to resolve managed check runtime")?;
    let actual_python = args
        .python_executable
        .canonicalize()
        .context("failed to resolve requested check runtime")?;
    if actual_python != expected_python {
        bail!("check broker rejected an unmanaged Python runtime");
    }
    let expected_worker = paths
        .release_dir(&state.release_id)
        .join("backend")
        .join("site-packages")
        .join("codaro")
        .join("curriculum")
        .join("_localStrongCheckWorker.py")
        .canonicalize()
        .context("failed to resolve managed check worker")?;
    let actual_worker = args
        .worker_path
        .canonicalize()
        .context("failed to resolve requested check worker")?;
    if actual_worker != expected_worker {
        bail!("check broker rejected an unmanaged worker");
    }
    let install_record_path = paths
        .release_dir(&state.release_id)
        .join("backend")
        .join("install-record.json");
    let install_record: InstallRecord =
        serde_json::from_slice(&std::fs::read(&install_record_path).with_context(|| {
            format!(
                "failed to read managed install record `{}`",
                install_record_path.display()
            )
        })?)
        .context("managed install record is invalid")?;
    let runtime_root = paths.runtime_store_dir(&state.runtime_version);
    let archive_marker = std::fs::read_to_string(runtime_root.join(".runtime-sha256"))
        .context("managed runtime archive marker is missing")?;
    let tree_marker = std::fs::read_to_string(runtime_root.join(".runtime-tree-sha256"))
        .context("managed runtime tree marker is missing")?;
    let expected_tree = install_record
        .python_runtime
        .tree_sha256
        .as_deref()
        .context("managed install record has no runtime tree hash")?;
    if install_record.release_id != state.release_id
        || install_record.python_runtime.version != state.runtime_version
        || archive_marker.trim() != install_record.python_runtime.sha256.to_ascii_lowercase()
        || tree_marker.trim() != expected_tree
        || runtime_tree_sha256(&runtime_root)? != expected_tree
    {
        bail!("check broker rejected a changed managed runtime tree");
    }
    Ok(())
}

fn validate_pipe_name(pipe_name: &str) -> Result<String> {
    let Some(run_id) = pipe_name.strip_prefix(PIPE_PREFIX) else {
        bail!("check broker pipe name is outside the reserved namespace");
    };
    if run_id.len() != 32
        || !run_id
            .bytes()
            .all(|item| item.is_ascii_digit() || (b'a'..=b'f').contains(&item))
    {
        bail!("check broker run id is invalid");
    }
    Ok(run_id.to_string())
}

fn read_bootstrap_secret() -> Result<Secret> {
    let mut line = String::new();
    BufReader::new(std::io::stdin().take(1024))
        .read_line(&mut line)
        .context("failed to read check broker bootstrap")?;
    let bootstrap: Bootstrap =
        serde_json::from_str(line.trim()).context("check broker bootstrap is invalid")?;
    Ok(Secret(decode_hex_256(&bootstrap.secret_hex)?))
}

fn verify_request_envelope(envelope: &RequestEnvelope, secret: &[u8]) -> Result<()> {
    if envelope.schema_version != 1
        || envelope.direction != "request"
        || envelope.nonce.len() != 32
        || !envelope
            .nonce
            .bytes()
            .all(|item| item.is_ascii_digit() || (b'a'..=b'f').contains(&item))
    {
        bail!("check broker request envelope contract is invalid");
    }
    let actual = decode_hex_256(&envelope.mac)?;
    let mac = signing_mac("request", &envelope.nonce, &envelope.payload, secret)?;
    mac.verify_slice(&actual)
        .map_err(|_| anyhow::anyhow!("check broker request authentication failed"))?;
    Ok(())
}

fn sign<T: Serialize>(direction: &str, nonce: &str, payload: &T, secret: &[u8]) -> Result<String> {
    Ok(encode_hex(
        &signing_mac(direction, nonce, payload, secret)?
            .finalize()
            .into_bytes(),
    ))
}

fn signing_mac<T: Serialize>(
    direction: &str,
    nonce: &str,
    payload: &T,
    secret: &[u8],
) -> Result<HmacSha256> {
    let mut mac = HmacSha256::new_from_slice(secret).context("invalid check broker secret")?;
    mac.update(direction.as_bytes());
    mac.update(b"\n");
    mac.update(nonce.as_bytes());
    mac.update(b"\n");
    mac.update(&canonical_json_bytes(payload)?);
    Ok(mac)
}

fn canonical_json_bytes<T: Serialize>(payload: &T) -> Result<Vec<u8>> {
    let value = serde_json::to_value(payload)?;
    serde_json::to_vec(&sorted_json_value(value)).map_err(Into::into)
}

fn sorted_json_value(value: Value) -> Value {
    match value {
        Value::Array(items) => Value::Array(items.into_iter().map(sorted_json_value).collect()),
        Value::Object(items) => {
            let mut entries = items.into_iter().collect::<Vec<_>>();
            entries.sort_by(|left, right| left.0.cmp(&right.0));
            let mut sorted = serde_json::Map::new();
            for (key, value) in entries {
                sorted.insert(key, sorted_json_value(value));
            }
            Value::Object(sorted)
        }
        scalar => scalar,
    }
}

fn decode_hex_256(value: &str) -> Result<Vec<u8>> {
    if value.len() != 64 {
        bail!("check broker secret or MAC must contain 32 bytes");
    }
    let mut output = Vec::with_capacity(32);
    for pair in value.as_bytes().chunks_exact(2) {
        let high = hex_nibble(pair[0])?;
        let low = hex_nibble(pair[1])?;
        output.push((high << 4) | low);
    }
    Ok(output)
}

fn hex_nibble(value: u8) -> Result<u8> {
    match value {
        b'0'..=b'9' => Ok(value - b'0'),
        b'a'..=b'f' => Ok(value - b'a' + 10),
        _ => bail!("check broker hexadecimal value is invalid"),
    }
}

fn encode_hex(value: &[u8]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut output = String::with_capacity(value.len() * 2);
    for byte in value {
        output.push(HEX[(byte >> 4) as usize] as char);
        output.push(HEX[(byte & 0x0f) as usize] as char);
    }
    output
}

fn read_frame(stream: &mut impl Read) -> Result<Vec<u8>> {
    let mut length_bytes = [0_u8; 4];
    stream
        .read_exact(&mut length_bytes)
        .context("failed to read check broker frame length")?;
    let length = u32::from_le_bytes(length_bytes) as usize;
    if !(2..=MAX_FRAME_BYTES).contains(&length) {
        bail!("check broker request frame exceeds the byte limit");
    }
    let mut payload = vec![0_u8; length];
    stream
        .read_exact(&mut payload)
        .context("failed to read complete check broker frame")?;
    Ok(payload)
}

fn write_frame(stream: &mut impl Write, payload: &[u8]) -> Result<()> {
    if payload.len() > MAX_FRAME_BYTES {
        bail!("check broker response frame exceeds the byte limit");
    }
    stream.write_all(&(payload.len() as u32).to_le_bytes())?;
    stream.write_all(payload)?;
    stream.flush()?;
    Ok(())
}

#[cfg(windows)]
fn create_pipe(pipe_name: &str, appcontainer_sid: &str) -> Result<std::fs::File> {
    use crate::check_sandbox::current_user_sid_string;
    use std::os::windows::io::FromRawHandle;
    use std::ptr;
    use windows_sys::Win32::Foundation::{
        ERROR_PIPE_CONNECTED, GetLastError, INVALID_HANDLE_VALUE, LocalFree,
    };
    use windows_sys::Win32::Security::Authorization::{
        ConvertStringSecurityDescriptorToSecurityDescriptorW, SDDL_REVISION_1,
    };
    use windows_sys::Win32::Security::{PSECURITY_DESCRIPTOR, SECURITY_ATTRIBUTES};
    use windows_sys::Win32::Storage::FileSystem::PIPE_ACCESS_DUPLEX;
    use windows_sys::Win32::System::Pipes::{
        ConnectNamedPipe, CreateNamedPipeW, PIPE_READMODE_BYTE, PIPE_TYPE_BYTE, PIPE_WAIT,
    };

    let user_sid = current_user_sid_string()?;
    let sddl = format!("D:P(A;;GA;;;SY)(A;;GA;;;{user_sid})(A;;GA;;;{appcontainer_sid})");
    let sddl_wide = wide(&sddl);
    let mut descriptor: PSECURITY_DESCRIPTOR = ptr::null_mut();
    let converted = unsafe {
        ConvertStringSecurityDescriptorToSecurityDescriptorW(
            sddl_wide.as_ptr(),
            SDDL_REVISION_1,
            &mut descriptor,
            ptr::null_mut(),
        )
    };
    if converted == 0 {
        return Err(std::io::Error::last_os_error())
            .context("failed to build check broker pipe security descriptor");
    }
    let attributes = SECURITY_ATTRIBUTES {
        nLength: std::mem::size_of::<SECURITY_ATTRIBUTES>() as u32,
        lpSecurityDescriptor: descriptor,
        bInheritHandle: 0,
    };
    let pipe_name_wide = wide(pipe_name);
    let handle = unsafe {
        CreateNamedPipeW(
            pipe_name_wide.as_ptr(),
            PIPE_ACCESS_DUPLEX
                | windows_sys::Win32::Storage::FileSystem::FILE_FLAG_FIRST_PIPE_INSTANCE,
            PIPE_TYPE_BYTE | PIPE_READMODE_BYTE | PIPE_WAIT,
            1,
            MAX_FRAME_BYTES as u32 + 4,
            MAX_FRAME_BYTES as u32 + 4,
            5_000,
            &attributes,
        )
    };
    unsafe {
        LocalFree(descriptor);
    }
    if handle == INVALID_HANDLE_VALUE {
        return Err(std::io::Error::last_os_error()).context("failed to create check broker pipe");
    }
    let connected = unsafe { ConnectNamedPipe(handle, ptr::null_mut()) };
    if connected == 0 && unsafe { GetLastError() } != ERROR_PIPE_CONNECTED {
        unsafe {
            windows_sys::Win32::Foundation::CloseHandle(handle);
        }
        return Err(std::io::Error::last_os_error()).context("failed to connect check broker pipe");
    }
    Ok(unsafe { std::fs::File::from_raw_handle(handle) })
}

#[cfg(windows)]
fn wide(value: &str) -> Vec<u16> {
    use std::os::windows::ffi::OsStrExt;
    std::ffi::OsStr::new(value)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect()
}

#[cfg(not(windows))]
fn create_pipe(_pipe_name: &str, _appcontainer_sid: &str) -> Result<std::fs::File> {
    bail!("check broker is only available on Windows")
}

#[cfg(test)]
mod tests {
    use super::{
        RequestEnvelope, decode_hex_256, sign, validate_pipe_name, verify_request_envelope,
    };

    #[test]
    fn pipe_namespace_and_mac_are_deterministic() {
        let run_id =
            validate_pipe_name(r"\\.\pipe\codaro-check-0123456789abcdef0123456789abcdef").unwrap();
        assert_eq!(run_id, "0123456789abcdef0123456789abcdef");
        assert_eq!(
            sign(
                "request",
                "0123456789abcdef0123456789abcdef",
                &serde_json::json!({"schemaVersion": 1, "value": "한글"}),
                &[7_u8; 32],
            )
            .unwrap(),
            "69362456dbcc3808cfe6a3deb42783142f7895c9650ef02faf5557777d11ce74"
        );
        assert!(decode_hex_256(&"00".repeat(32)).is_ok());
    }

    #[test]
    fn request_authentication_rejects_payload_tampering() {
        let secret = [11_u8; 32];
        let nonce = "0123456789abcdef0123456789abcdef";
        let mut payload = serde_json::json!({"runId": nonce, "schemaVersion": 1});
        let envelope = RequestEnvelope {
            schema_version: 1,
            direction: "request".to_string(),
            nonce: nonce.to_string(),
            mac: sign("request", nonce, &payload, &secret).unwrap(),
            payload: payload.clone(),
        };
        verify_request_envelope(&envelope, &secret).unwrap();

        payload["schemaVersion"] = serde_json::json!(2);
        let tampered = RequestEnvelope {
            payload,
            ..envelope
        };
        assert!(verify_request_envelope(&tampered, &secret).is_err());
    }
}
