use crate::paths::LauncherPaths;
use anyhow::{Context, Result, bail};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

const MAX_OUTPUT_BYTES: usize = 1024 * 1024;
const MAX_ENVIRONMENT_ENTRIES: usize = 32;
const MAX_PACKAGE_PATHS: usize = 16;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SandboxRequest {
    pub schema_version: u32,
    pub run_id: String,
    pub fixture_root: PathBuf,
    pub package_paths: Vec<PathBuf>,
    pub environment: BTreeMap<String, String>,
    pub timeout_ms: u32,
    pub worker_request: Value,
}

#[cfg(windows)]
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RunReceipt {
    schema_version: u32,
    run_id: String,
    profile_name: String,
    sid: String,
    mutex_name: String,
    broker_pid: u32,
    acl_roots: Vec<AclReceipt>,
}

#[cfg(windows)]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct AclReceipt {
    path: PathBuf,
    access: String,
}

#[cfg(windows)]
pub struct AppContainerSandbox {
    profile_name: Vec<u16>,
    sid: windows_sys::Win32::Security::PSID,
    sid_string: String,
    mutex: windows_sys::Win32::Foundation::HANDLE,
    receipt: RunReceipt,
    receipt_path: PathBuf,
}

#[cfg(not(windows))]
pub struct AppContainerSandbox;

impl AppContainerSandbox {
    #[cfg(windows)]
    pub fn create(paths: &LauncherPaths, run_id: &str) -> Result<Self> {
        use std::ptr;
        use windows_sys::Win32::Foundation::{CloseHandle, ERROR_ALREADY_EXISTS, GetLastError};
        use windows_sys::Win32::Security::Isolation::CreateAppContainerProfile;
        use windows_sys::Win32::Security::PSID;
        use windows_sys::Win32::System::Threading::CreateMutexW;

        if run_id.len() != 32 || !run_id.bytes().all(|item| item.is_ascii_hexdigit()) {
            bail!("AppContainer run id is invalid");
        }
        let profile_name_text = format!("Codaro.CheckSandbox.{run_id}");
        let profile_name = wide(&profile_name_text);
        let mutex_name = format!(r"Local\Codaro.CheckSandbox.{run_id}");
        let mutex_name_wide = wide(&mutex_name);
        let mutex = unsafe { CreateMutexW(ptr::null(), 1, mutex_name_wide.as_ptr()) };
        if mutex.is_null() {
            return Err(std::io::Error::last_os_error())
                .context("failed to create check sandbox run mutex");
        }
        if unsafe { GetLastError() } == ERROR_ALREADY_EXISTS {
            unsafe {
                CloseHandle(mutex);
            }
            bail!("check sandbox run id is already active");
        }
        let display_name = wide("Codaro learning check");
        let description = wide("Per-run isolated learning check");
        let mut sid: PSID = ptr::null_mut();
        let result = unsafe {
            CreateAppContainerProfile(
                profile_name.as_ptr(),
                display_name.as_ptr(),
                description.as_ptr(),
                ptr::null(),
                0,
                &mut sid,
            )
        };
        if result < 0 || sid.is_null() {
            unsafe {
                CloseHandle(mutex);
            }
            bail!(
                "CreateAppContainerProfile failed with HRESULT 0x{:08x}",
                result as u32
            );
        }
        let sid_string = match sid_to_string(sid) {
            Ok(value) => value,
            Err(error) => {
                unsafe {
                    windows_sys::Win32::Security::Isolation::DeleteAppContainerProfile(
                        profile_name.as_ptr(),
                    );
                    windows_sys::Win32::Security::FreeSid(sid);
                    CloseHandle(mutex);
                }
                return Err(error);
            }
        };
        let receipt_path = run_receipt_dir(paths).join(format!("{run_id}.json"));
        let receipt = RunReceipt {
            schema_version: 1,
            run_id: run_id.to_string(),
            profile_name: profile_name_text.clone(),
            sid: sid_string.clone(),
            mutex_name,
            broker_pid: std::process::id(),
            acl_roots: Vec::new(),
        };
        if let Err(error) = save_run_receipt(&receipt_path, &receipt) {
            unsafe {
                windows_sys::Win32::Security::Isolation::DeleteAppContainerProfile(
                    profile_name.as_ptr(),
                );
                windows_sys::Win32::Security::FreeSid(sid);
                CloseHandle(mutex);
            }
            return Err(error);
        }
        Ok(Self {
            profile_name,
            sid,
            sid_string,
            mutex,
            receipt,
            receipt_path,
        })
    }

    #[cfg(not(windows))]
    pub fn create(_paths: &LauncherPaths, _run_id: &str) -> Result<Self> {
        bail!("AppContainer checks are only supported on Windows")
    }

    #[cfg(windows)]
    pub fn sid_string(&self) -> &str {
        &self.sid_string
    }

    #[cfg(not(windows))]
    pub fn sid_string(&self) -> &str {
        ""
    }

    #[cfg(windows)]
    pub fn execute(
        &mut self,
        python_executable: &Path,
        worker_path: &Path,
        request: &SandboxRequest,
    ) -> Result<Value> {
        validate_request(python_executable, worker_path, request)?;
        let python_executable = python_executable
            .canonicalize()
            .context("failed to resolve sandbox Python executable")?;
        let worker_path = worker_path
            .canonicalize()
            .context("failed to resolve sandbox worker")?;
        let fixture_root = request
            .fixture_root
            .canonicalize()
            .context("failed to resolve sandbox fixture root")?;
        let package_paths = request
            .package_paths
            .iter()
            .map(|path| {
                path.canonicalize().with_context(|| {
                    format!("failed to resolve sandbox package `{}`", path.display())
                })
            })
            .collect::<Result<Vec<_>>>()?;

        let mut acl_roots = Vec::new();
        for runtime_root in python_runtime_roots(&python_executable)? {
            self.record_acl_root(&runtime_root, AccessKind::ReadExecute)?;
            acl_roots.push(AclGrant::recursive(
                &runtime_root,
                self.sid,
                AccessKind::ReadExecute,
            )?);
        }
        let worker_root = worker_path
            .parent()
            .context("sandbox worker has no parent directory")?;
        self.record_acl_root(worker_root, AccessKind::ReadExecute)?;
        self.record_acl_root(&fixture_root, AccessKind::ReadWriteExecute)?;
        acl_roots.extend([
            AclGrant::recursive(worker_root, self.sid, AccessKind::ReadExecute)?,
            AclGrant::recursive(&fixture_root, self.sid, AccessKind::ReadWriteExecute)?,
        ]);
        for path in &package_paths {
            self.record_acl_root(path, AccessKind::ReadExecute)?;
            acl_roots.push(AclGrant::recursive(
                path,
                self.sid,
                AccessKind::ReadExecute,
            )?);
        }

        let output = launch_appcontainer_process(
            self.sid,
            &python_executable,
            &worker_path,
            &fixture_root,
            &request.environment,
            &request.worker_request,
            request.timeout_ms,
        )?;
        drop(acl_roots);
        self.receipt.acl_roots.clear();
        save_run_receipt(&self.receipt_path, &self.receipt)?;
        if output.stdout_exceeded || output.stderr_exceeded {
            bail!("AppContainer worker output exceeded the 1 MB limit");
        }
        if output.timed_out {
            bail!(
                "AppContainer worker exceeded the {}ms wall timeout",
                request.timeout_ms
            );
        }
        if output.exit_code != 0 {
            let detail = String::from_utf8_lossy(&output.stderr);
            bail!(
                "AppContainer worker exited with code {}: {}",
                output.exit_code,
                detail.trim()
            );
        }
        let response: Value = serde_json::from_slice(&output.stdout)
            .context("AppContainer worker returned invalid JSON")?;
        if !response.is_object() {
            bail!("AppContainer worker response must be an object");
        }
        Ok(response)
    }

    #[cfg(not(windows))]
    pub fn execute(
        &mut self,
        _python_executable: &Path,
        _worker_path: &Path,
        _request: &SandboxRequest,
    ) -> Result<Value> {
        bail!("AppContainer checks are only supported on Windows")
    }
}

pub fn reconcile(paths: &LauncherPaths) -> Result<()> {
    #[cfg(windows)]
    {
        let directory = run_receipt_dir(paths);
        if !directory.exists() {
            return Ok(());
        }
        for entry in std::fs::read_dir(&directory).with_context(|| {
            format!(
                "failed to inspect check sandbox receipts `{}`",
                directory.display()
            )
        })? {
            let path = entry?.path();
            if path.extension().and_then(|value| value.to_str()) == Some("tmp") {
                let _ = std::fs::remove_file(path);
                continue;
            }
            if path.extension().and_then(|value| value.to_str()) != Some("json") {
                continue;
            }
            let receipt: RunReceipt =
                serde_json::from_slice(&std::fs::read(&path).with_context(|| {
                    format!("failed to read check sandbox receipt `{}`", path.display())
                })?)
                .with_context(|| {
                    format!("failed to parse check sandbox receipt `{}`", path.display())
                })?;
            validate_run_receipt(&receipt)?;
            if run_mutex_active(&receipt.mutex_name) {
                continue;
            }
            cleanup_receipt_acl(&receipt)?;
            let profile_name = wide(&receipt.profile_name);
            unsafe {
                windows_sys::Win32::Security::Isolation::DeleteAppContainerProfile(
                    profile_name.as_ptr(),
                );
            }
            std::fs::remove_file(&path).with_context(|| {
                format!(
                    "failed to remove check sandbox receipt `{}`",
                    path.display()
                )
            })?;
        }
    }
    Ok(())
}

#[cfg(windows)]
fn run_receipt_dir(paths: &LauncherPaths) -> PathBuf {
    paths.state_dir().join("check-sandbox").join("runs")
}

#[cfg(windows)]
fn validate_run_receipt(receipt: &RunReceipt) -> Result<()> {
    if receipt.schema_version != 1
        || receipt.run_id.len() != 32
        || !receipt.run_id.bytes().all(|item| item.is_ascii_hexdigit())
        || receipt.profile_name != format!("Codaro.CheckSandbox.{}", receipt.run_id)
        || receipt.mutex_name != format!(r"Local\Codaro.CheckSandbox.{}", receipt.run_id)
        || receipt.sid.is_empty()
        || receipt.broker_pid == 0
        || receipt
            .acl_roots
            .iter()
            .any(|entry| entry.access != "readExecute" && entry.access != "readWriteExecute")
    {
        bail!("check sandbox run receipt contract is invalid");
    }
    use std::ptr;
    use windows_sys::Win32::Security::FreeSid;
    use windows_sys::Win32::Security::Isolation::DeriveAppContainerSidFromAppContainerName;

    let profile_name = wide(&receipt.profile_name);
    let mut derived_sid = ptr::null_mut();
    let result = unsafe {
        DeriveAppContainerSidFromAppContainerName(profile_name.as_ptr(), &mut derived_sid)
    };
    if result < 0 || derived_sid.is_null() {
        bail!("check sandbox receipt profile could not be derived");
    }
    let derived_sid_text = sid_to_string(derived_sid);
    unsafe {
        FreeSid(derived_sid);
    }
    if derived_sid_text? != receipt.sid {
        bail!("check sandbox receipt SID does not match its profile");
    }
    Ok(())
}

#[cfg(windows)]
fn run_mutex_active(name: &str) -> bool {
    use windows_sys::Win32::Foundation::CloseHandle;
    use windows_sys::Win32::System::Threading::OpenMutexW;

    const SYNCHRONIZE_ACCESS: u32 = 0x0010_0000;
    let name = wide(name);
    let mutex = unsafe { OpenMutexW(SYNCHRONIZE_ACCESS, 0, name.as_ptr()) };
    if mutex.is_null() {
        return false;
    }
    unsafe {
        CloseHandle(mutex);
    }
    true
}

#[cfg(windows)]
fn save_run_receipt(path: &Path, receipt: &RunReceipt) -> Result<()> {
    use std::io::Write;
    use windows_sys::Win32::Storage::FileSystem::{
        MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH, MoveFileExW,
    };

    let parent = path
        .parent()
        .context("check sandbox receipt has no parent directory")?;
    std::fs::create_dir_all(parent).with_context(|| {
        format!(
            "failed to create check sandbox receipt directory `{}`",
            parent.display()
        )
    })?;
    let temporary = path.with_extension(format!("{}.tmp", std::process::id()));
    let result = (|| -> Result<()> {
        let mut file = std::fs::File::create(&temporary).with_context(|| {
            format!(
                "failed to create check sandbox receipt `{}`",
                temporary.display()
            )
        })?;
        file.write_all(&serde_json::to_vec_pretty(receipt)?)?;
        file.write_all(b"\n")?;
        file.sync_all()?;
        drop(file);
        let temporary_wide = wide_os(&temporary);
        let path_wide = wide_os(path);
        if unsafe {
            MoveFileExW(
                temporary_wide.as_ptr(),
                path_wide.as_ptr(),
                MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH,
            )
        } == 0
        {
            return Err(std::io::Error::last_os_error())
                .context("failed to atomically replace check sandbox receipt");
        }
        Ok(())
    })();
    if result.is_err() {
        let _ = std::fs::remove_file(&temporary);
    }
    result
}

#[cfg(windows)]
fn cleanup_receipt_acl(receipt: &RunReceipt) -> Result<()> {
    use std::ptr;
    use windows_sys::Win32::Foundation::LocalFree;
    use windows_sys::Win32::Security::Authorization::ConvertStringSidToSidW;
    use windows_sys::Win32::Security::PSID;

    validate_run_receipt(receipt)?;
    let sid_text = wide(&receipt.sid);
    let mut sid: PSID = ptr::null_mut();
    if unsafe { ConvertStringSidToSidW(sid_text.as_ptr(), &mut sid) } == 0 || sid.is_null() {
        return Err(std::io::Error::last_os_error())
            .context("failed to restore AppContainer SID from run receipt");
    }
    let mut first_error = None;
    for root in receipt.acl_roots.iter().rev() {
        if !root.path.exists() {
            continue;
        }
        if let Err(error) = update_path_acl(&root.path, sid, None)
            && first_error.is_none()
        {
            first_error = Some(error);
        }
    }
    unsafe {
        LocalFree(sid.cast());
    }
    if let Some(error) = first_error {
        return Err(error).context("failed to reconcile a check sandbox ACL");
    }
    Ok(())
}

#[cfg(windows)]
impl AppContainerSandbox {
    fn record_acl_root(&mut self, path: &Path, access: AccessKind) -> Result<()> {
        let path = path
            .canonicalize()
            .with_context(|| format!("failed to resolve ACL receipt path `{}`", path.display()))?;
        let entry = AclReceipt {
            path,
            access: access.receipt_name().to_string(),
        };
        if !self.receipt.acl_roots.contains(&entry) {
            self.receipt.acl_roots.push(entry);
            save_run_receipt(&self.receipt_path, &self.receipt)?;
        }
        Ok(())
    }
}

#[cfg(windows)]
impl Drop for AppContainerSandbox {
    fn drop(&mut self) {
        use windows_sys::Win32::Foundation::CloseHandle;
        use windows_sys::Win32::Security::FreeSid;
        use windows_sys::Win32::Security::Isolation::DeleteAppContainerProfile;

        let _ = cleanup_receipt_acl(&self.receipt);
        unsafe {
            DeleteAppContainerProfile(self.profile_name.as_ptr());
            FreeSid(self.sid);
            if !self.mutex.is_null() {
                CloseHandle(self.mutex);
            }
        }
        let _ = std::fs::remove_file(&self.receipt_path);
    }
}

#[cfg(windows)]
fn python_runtime_roots(python_executable: &Path) -> Result<Vec<PathBuf>> {
    let executable_parent = python_executable
        .parent()
        .context("sandbox Python executable has no parent directory")?;
    let environment_root = executable_parent
        .parent()
        .filter(|parent| parent.join("pyvenv.cfg").is_file());
    let Some(environment_root) = environment_root else {
        return Ok(vec![executable_parent.to_path_buf()]);
    };

    let config_path = environment_root.join("pyvenv.cfg");
    let config = std::fs::read_to_string(&config_path)
        .with_context(|| format!("failed to read `{}`", config_path.display()))?;
    let home = config.lines().find_map(|line| {
        let (key, value) = line.split_once('=')?;
        (key.trim().eq_ignore_ascii_case("home") && !value.trim().is_empty())
            .then(|| PathBuf::from(value.trim()))
    });
    let mut roots = vec![environment_root.to_path_buf()];
    if let Some(home) = home {
        roots.push(
            home.canonicalize()
                .context("failed to resolve sandbox base Python home")?,
        );
    }
    Ok(roots)
}

fn validate_request(
    python_executable: &Path,
    worker_path: &Path,
    request: &SandboxRequest,
) -> Result<()> {
    if request.schema_version != 1
        || request.run_id.len() != 32
        || !request.run_id.bytes().all(|item| item.is_ascii_hexdigit())
    {
        bail!("sandbox request identity is invalid");
    }
    if !(250..=15_000).contains(&request.timeout_ms) {
        bail!("sandbox timeout must be between 250 and 15000 milliseconds");
    }
    if !python_executable.is_file() {
        bail!("sandbox Python executable does not exist");
    }
    if !worker_path.is_file()
        || worker_path.file_name().and_then(|name| name.to_str())
            != Some("_localStrongCheckWorker.py")
    {
        bail!("sandbox worker path is not the approved worker");
    }
    if !request.fixture_root.is_dir() {
        bail!("sandbox fixture root does not exist");
    }
    if request.package_paths.len() > MAX_PACKAGE_PATHS
        || request.package_paths.iter().any(|path| !path.is_file())
    {
        bail!("sandbox package path contract is invalid");
    }
    if request.environment.len() > MAX_ENVIRONMENT_ENTRIES {
        bail!("sandbox environment contains too many entries");
    }
    for (name, value) in &request.environment {
        if !valid_environment_name(name)
            || !allowed_environment_name(name)
            || name.as_bytes().contains(&0)
            || value.as_bytes().contains(&0)
        {
            bail!("sandbox environment contains an invalid entry");
        }
    }
    if !request.worker_request.is_object() {
        bail!("sandbox worker request must be an object");
    }
    Ok(())
}

fn valid_environment_name(name: &str) -> bool {
    let mut bytes = name.bytes();
    let Some(first) = bytes.next() else {
        return false;
    };
    (first.is_ascii_alphabetic() || first == b'_')
        && bytes.all(|item| item.is_ascii_alphanumeric() || item == b'_')
}

fn allowed_environment_name(name: &str) -> bool {
    const CONTROLLED: &[&str] = &[
        "CODARO_CHECK_PACKAGE_PATHS",
        "COMSPEC",
        "HOME",
        "PATH",
        "PATHEXT",
        "PYTHONDONTWRITEBYTECODE",
        "PYTHONUTF8",
        "SYSTEMROOT",
        "TEMP",
        "TMP",
        "WINDIR",
    ];
    let upper = name.to_ascii_uppercase();
    CONTROLLED.contains(&upper.as_str())
        || (!upper.starts_with("CODARO_")
            && !upper.starts_with("PYTHON")
            && !matches!(
                upper.as_str(),
                "COMSPEC" | "PATH" | "PATHEXT" | "SYSTEMROOT" | "TEMP" | "TMP"
            ))
}

#[cfg(windows)]
pub fn current_user_sid_string() -> Result<String> {
    use std::ptr;
    use windows_sys::Win32::Foundation::{CloseHandle, ERROR_INSUFFICIENT_BUFFER, GetLastError};
    use windows_sys::Win32::Security::{GetTokenInformation, TOKEN_QUERY, TOKEN_USER, TokenUser};
    use windows_sys::Win32::System::Threading::{GetCurrentProcess, OpenProcessToken};

    let mut token = ptr::null_mut();
    if unsafe { OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut token) } == 0 {
        return Err(std::io::Error::last_os_error())
            .context("failed to open current process token");
    }
    let mut length = 0_u32;
    unsafe {
        GetTokenInformation(token, TokenUser, ptr::null_mut(), 0, &mut length);
    }
    if unsafe { GetLastError() } != ERROR_INSUFFICIENT_BUFFER || length == 0 {
        unsafe {
            CloseHandle(token);
        }
        return Err(std::io::Error::last_os_error())
            .context("failed to size current process token user");
    }
    let mut buffer = vec![0_u8; length as usize];
    let read = unsafe {
        GetTokenInformation(
            token,
            TokenUser,
            buffer.as_mut_ptr().cast(),
            length,
            &mut length,
        )
    };
    unsafe {
        CloseHandle(token);
    }
    if read == 0 {
        return Err(std::io::Error::last_os_error())
            .context("failed to read current process token user");
    }
    let token_user = unsafe { &*(buffer.as_ptr().cast::<TOKEN_USER>()) };
    sid_to_string(token_user.User.Sid)
}

#[cfg(not(windows))]
pub fn current_user_sid_string() -> Result<String> {
    bail!("Windows user SID is unavailable on this platform")
}

#[cfg(windows)]
fn sid_to_string(sid: windows_sys::Win32::Security::PSID) -> Result<String> {
    use std::ptr;
    use windows_sys::Win32::Foundation::LocalFree;
    use windows_sys::Win32::Security::Authorization::ConvertSidToStringSidW;

    let mut value = ptr::null_mut();
    if unsafe { ConvertSidToStringSidW(sid, &mut value) } == 0 {
        return Err(std::io::Error::last_os_error()).context("failed to format Windows SID");
    }
    let mut length = 0;
    unsafe {
        while *value.add(length) != 0 {
            length += 1;
        }
    }
    let text = String::from_utf16(unsafe { std::slice::from_raw_parts(value, length) })
        .context("Windows SID contains invalid UTF-16")?;
    unsafe {
        LocalFree(value.cast());
    }
    Ok(text)
}

#[cfg(windows)]
#[derive(Clone, Copy)]
enum AccessKind {
    ReadExecute,
    ReadWriteExecute,
}

#[cfg(windows)]
impl AccessKind {
    fn receipt_name(self) -> &'static str {
        match self {
            Self::ReadExecute => "readExecute",
            Self::ReadWriteExecute => "readWriteExecute",
        }
    }
}

#[cfg(windows)]
struct AclGrant {
    paths: Vec<PathBuf>,
    sid: windows_sys::Win32::Security::PSID,
}

#[cfg(windows)]
impl AclGrant {
    fn recursive(
        root: &Path,
        sid: windows_sys::Win32::Security::PSID,
        access: AccessKind,
    ) -> Result<Self> {
        let metadata = std::fs::symlink_metadata(root)
            .with_context(|| format!("failed to inspect sandbox ACL path `{}`", root.display()))?;
        if metadata.file_type().is_symlink() {
            bail!("sandbox ACL root may not be a symbolic link");
        }
        update_path_acl(root, sid, Some(access))?;
        Ok(Self {
            paths: vec![root.to_path_buf()],
            sid,
        })
    }
}

#[cfg(windows)]
impl Drop for AclGrant {
    fn drop(&mut self) {
        for path in self.paths.iter().rev() {
            let _ = update_path_acl(path, self.sid, None);
        }
    }
}

#[cfg(windows)]
fn update_path_acl(
    path: &Path,
    sid: windows_sys::Win32::Security::PSID,
    access: Option<AccessKind>,
) -> Result<()> {
    use std::ptr;
    use windows_sys::Win32::Foundation::{ERROR_SUCCESS, LocalFree};
    use windows_sys::Win32::Security::Authorization::{
        EXPLICIT_ACCESS_W, GRANT_ACCESS, GetNamedSecurityInfoW, NO_MULTIPLE_TRUSTEE, REVOKE_ACCESS,
        SE_FILE_OBJECT, SetEntriesInAclW, SetNamedSecurityInfoW, TRUSTEE_IS_SID, TRUSTEE_IS_USER,
        TRUSTEE_W,
    };
    use windows_sys::Win32::Security::{
        ACL, DACL_SECURITY_INFORMATION, PSID, SUB_CONTAINERS_AND_OBJECTS_INHERIT,
    };
    use windows_sys::Win32::Storage::FileSystem::{
        DELETE, FILE_DELETE_CHILD, FILE_GENERIC_EXECUTE, FILE_GENERIC_READ, FILE_GENERIC_WRITE,
    };

    let mut path_wide = wide_os(path);
    let mut old_acl: *mut ACL = ptr::null_mut();
    let mut descriptor = ptr::null_mut();
    let status = unsafe {
        GetNamedSecurityInfoW(
            path_wide.as_ptr(),
            SE_FILE_OBJECT,
            DACL_SECURITY_INFORMATION,
            ptr::null_mut(),
            ptr::null_mut(),
            &mut old_acl,
            ptr::null_mut(),
            &mut descriptor,
        )
    };
    if status != ERROR_SUCCESS {
        bail!(
            "GetNamedSecurityInfoW failed for `{}` with {status}",
            path.display()
        );
    }
    let permissions = match access {
        Some(AccessKind::ReadExecute) => FILE_GENERIC_READ | FILE_GENERIC_EXECUTE,
        Some(AccessKind::ReadWriteExecute) => {
            FILE_GENERIC_READ
                | FILE_GENERIC_WRITE
                | FILE_GENERIC_EXECUTE
                | DELETE
                | FILE_DELETE_CHILD
        }
        None => 0,
    };
    let entry = EXPLICIT_ACCESS_W {
        grfAccessPermissions: permissions,
        grfAccessMode: if access.is_some() {
            GRANT_ACCESS
        } else {
            REVOKE_ACCESS
        },
        grfInheritance: SUB_CONTAINERS_AND_OBJECTS_INHERIT,
        Trustee: TRUSTEE_W {
            pMultipleTrustee: ptr::null_mut(),
            MultipleTrusteeOperation: NO_MULTIPLE_TRUSTEE,
            TrusteeForm: TRUSTEE_IS_SID,
            TrusteeType: TRUSTEE_IS_USER,
            ptstrName: sid.cast::<u16>(),
        },
    };
    let mut new_acl: *mut ACL = ptr::null_mut();
    let acl_status = unsafe { SetEntriesInAclW(1, &entry, old_acl, &mut new_acl) };
    if acl_status != ERROR_SUCCESS {
        unsafe {
            LocalFree(descriptor);
        }
        bail!(
            "SetEntriesInAclW failed for `{}` with {acl_status}",
            path.display()
        );
    }
    let set_status = unsafe {
        SetNamedSecurityInfoW(
            path_wide.as_mut_ptr(),
            SE_FILE_OBJECT,
            DACL_SECURITY_INFORMATION,
            ptr::null_mut::<core::ffi::c_void>() as PSID,
            ptr::null_mut::<core::ffi::c_void>() as PSID,
            new_acl,
            ptr::null(),
        )
    };
    unsafe {
        LocalFree(new_acl.cast());
        LocalFree(descriptor);
    }
    if set_status != ERROR_SUCCESS {
        bail!(
            "SetNamedSecurityInfoW failed for `{}` with {set_status}",
            path.display()
        );
    }
    Ok(())
}

#[cfg(windows)]
struct ProcessOutput {
    exit_code: u32,
    stderr: Vec<u8>,
    stderr_exceeded: bool,
    stdout: Vec<u8>,
    stdout_exceeded: bool,
    timed_out: bool,
}

#[cfg(windows)]
fn launch_appcontainer_process(
    sid: windows_sys::Win32::Security::PSID,
    python_executable: &Path,
    worker_path: &Path,
    fixture_root: &Path,
    environment: &BTreeMap<String, String>,
    request: &Value,
    timeout_ms: u32,
) -> Result<ProcessOutput> {
    use std::io::Write;
    use std::mem::{self, size_of};
    use std::os::windows::io::FromRawHandle;
    use std::ptr;
    use windows_sys::Win32::Foundation::WAIT_TIMEOUT;
    use windows_sys::Win32::Security::{SECURITY_ATTRIBUTES, SECURITY_CAPABILITIES};
    use windows_sys::Win32::System::JobObjects::{
        AssignProcessToJobObject, CreateJobObjectW, JOB_OBJECT_LIMIT_ACTIVE_PROCESS,
        JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE, JOB_OBJECT_LIMIT_PROCESS_MEMORY,
        JOB_OBJECT_LIMIT_PROCESS_TIME, JOBOBJECT_EXTENDED_LIMIT_INFORMATION,
        JobObjectExtendedLimitInformation, SetInformationJobObject, TerminateJobObject,
    };
    use windows_sys::Win32::System::Threading::{
        CREATE_NO_WINDOW, CREATE_SUSPENDED, CREATE_UNICODE_ENVIRONMENT, CreateProcessW,
        DeleteProcThreadAttributeList, EXTENDED_STARTUPINFO_PRESENT, GetExitCodeProcess,
        InitializeProcThreadAttributeList, PROC_THREAD_ATTRIBUTE_HANDLE_LIST,
        PROC_THREAD_ATTRIBUTE_SECURITY_CAPABILITIES, PROCESS_INFORMATION, ResumeThread,
        STARTF_USESTDHANDLES, STARTUPINFOEXW, UpdateProcThreadAttribute, WaitForSingleObject,
    };

    let mut pipe_attributes = SECURITY_ATTRIBUTES {
        nLength: size_of::<SECURITY_ATTRIBUTES>() as u32,
        lpSecurityDescriptor: ptr::null_mut(),
        bInheritHandle: 1,
    };
    let (stdin_read, stdin_write) = create_anonymous_pipe(&mut pipe_attributes, true)?;
    let (stdout_read, stdout_write) = create_anonymous_pipe(&mut pipe_attributes, false)?;
    let (stderr_read, stderr_write) = create_anonymous_pipe(&mut pipe_attributes, false)?;

    let job = unsafe { CreateJobObjectW(ptr::null(), ptr::null()) };
    if job.is_null() {
        close_many(&[
            stdin_read,
            stdin_write,
            stdout_read,
            stdout_write,
            stderr_read,
            stderr_write,
        ]);
        return Err(std::io::Error::last_os_error()).context("failed to create sandbox Job Object");
    }
    let mut limits: JOBOBJECT_EXTENDED_LIMIT_INFORMATION = unsafe { mem::zeroed() };
    limits.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_ACTIVE_PROCESS
        | JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
        | JOB_OBJECT_LIMIT_PROCESS_MEMORY
        | JOB_OBJECT_LIMIT_PROCESS_TIME;
    limits.BasicLimitInformation.ActiveProcessLimit = 1;
    limits.BasicLimitInformation.PerProcessUserTimeLimit = 10 * 10_000_000;
    limits.ProcessMemoryLimit = 512 * 1024 * 1024;
    if unsafe {
        SetInformationJobObject(
            job,
            JobObjectExtendedLimitInformation,
            (&limits as *const JOBOBJECT_EXTENDED_LIMIT_INFORMATION).cast(),
            size_of::<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>() as u32,
        )
    } == 0
    {
        close_many(&[
            job,
            stdin_read,
            stdin_write,
            stdout_read,
            stdout_write,
            stderr_read,
            stderr_write,
        ]);
        return Err(std::io::Error::last_os_error())
            .context("failed to configure sandbox Job Object");
    }

    let mut attribute_size = 0_usize;
    unsafe {
        InitializeProcThreadAttributeList(ptr::null_mut(), 2, 0, &mut attribute_size);
    }
    if attribute_size == 0 {
        close_many(&[
            job,
            stdin_read,
            stdin_write,
            stdout_read,
            stdout_write,
            stderr_read,
            stderr_write,
        ]);
        return Err(std::io::Error::last_os_error())
            .context("failed to size sandbox process attribute list");
    }
    let mut attribute_buffer = vec![0_u8; attribute_size];
    let attribute_list = attribute_buffer.as_mut_ptr().cast();
    if unsafe { InitializeProcThreadAttributeList(attribute_list, 2, 0, &mut attribute_size) } == 0
    {
        close_many(&[
            job,
            stdin_read,
            stdin_write,
            stdout_read,
            stdout_write,
            stderr_read,
            stderr_write,
        ]);
        return Err(std::io::Error::last_os_error())
            .context("failed to initialize sandbox process attribute list");
    }
    let mut capabilities = SECURITY_CAPABILITIES {
        AppContainerSid: sid,
        Capabilities: ptr::null_mut(),
        CapabilityCount: 0,
        Reserved: 0,
    };
    if unsafe {
        UpdateProcThreadAttribute(
            attribute_list,
            0,
            PROC_THREAD_ATTRIBUTE_SECURITY_CAPABILITIES as usize,
            (&mut capabilities as *mut SECURITY_CAPABILITIES).cast(),
            size_of::<SECURITY_CAPABILITIES>(),
            ptr::null_mut(),
            ptr::null(),
        )
    } == 0
    {
        unsafe {
            DeleteProcThreadAttributeList(attribute_list);
        }
        close_many(&[
            job,
            stdin_read,
            stdin_write,
            stdout_read,
            stdout_write,
            stderr_read,
            stderr_write,
        ]);
        return Err(std::io::Error::last_os_error())
            .context("failed to assign AppContainer security capabilities");
    }
    let inherited_handles = [stdin_read, stdout_write, stderr_write];
    if unsafe {
        UpdateProcThreadAttribute(
            attribute_list,
            0,
            PROC_THREAD_ATTRIBUTE_HANDLE_LIST as usize,
            inherited_handles.as_ptr().cast(),
            std::mem::size_of_val(&inherited_handles),
            ptr::null_mut(),
            ptr::null(),
        )
    } == 0
    {
        unsafe {
            DeleteProcThreadAttributeList(attribute_list);
        }
        close_many(&[
            job,
            stdin_read,
            stdin_write,
            stdout_read,
            stdout_write,
            stderr_read,
            stderr_write,
        ]);
        return Err(std::io::Error::last_os_error())
            .context("failed to restrict AppContainer inherited handles");
    }

    let mut startup: STARTUPINFOEXW = unsafe { mem::zeroed() };
    startup.StartupInfo.cb = size_of::<STARTUPINFOEXW>() as u32;
    startup.StartupInfo.dwFlags = STARTF_USESTDHANDLES;
    startup.StartupInfo.hStdInput = stdin_read;
    startup.StartupInfo.hStdOutput = stdout_write;
    startup.StartupInfo.hStdError = stderr_write;
    startup.lpAttributeList = attribute_list;
    let mut process: PROCESS_INFORMATION = unsafe { mem::zeroed() };
    let mut command_line = command_line(python_executable, worker_path);
    let application = wide_os(python_executable);
    let current_directory = wide_os(fixture_root);
    let mut environment_block = environment_block(environment)?;
    let created = unsafe {
        CreateProcessW(
            application.as_ptr(),
            command_line.as_mut_ptr(),
            ptr::null(),
            ptr::null(),
            1,
            CREATE_NO_WINDOW
                | CREATE_SUSPENDED
                | CREATE_UNICODE_ENVIRONMENT
                | EXTENDED_STARTUPINFO_PRESENT,
            environment_block.as_mut_ptr().cast(),
            current_directory.as_ptr(),
            &startup.StartupInfo as *const _,
            &mut process,
        )
    };
    unsafe {
        DeleteProcThreadAttributeList(attribute_list);
    }
    close_many(&[stdin_read, stdout_write, stderr_write]);
    if created == 0 {
        close_many(&[job, stdin_write, stdout_read, stderr_read]);
        return Err(std::io::Error::last_os_error())
            .context("failed to create AppContainer worker process");
    }
    if unsafe { AssignProcessToJobObject(job, process.hProcess) } == 0 {
        unsafe {
            windows_sys::Win32::System::Threading::TerminateProcess(process.hProcess, 1);
        }
        close_many(&[
            process.hThread,
            process.hProcess,
            job,
            stdin_write,
            stdout_read,
            stderr_read,
        ]);
        return Err(std::io::Error::last_os_error())
            .context("failed to assign AppContainer worker to Job Object");
    }

    let stdout_thread = spawn_pipe_reader(stdout_read);
    let stderr_thread = spawn_pipe_reader(stderr_read);
    if unsafe { ResumeThread(process.hThread) } == u32::MAX {
        unsafe {
            TerminateJobObject(job, 1);
        }
        close_many(&[process.hThread, process.hProcess, job, stdin_write]);
        let _ = stdout_thread.join();
        let _ = stderr_thread.join();
        return Err(std::io::Error::last_os_error())
            .context("failed to resume AppContainer worker");
    }
    {
        let mut stdin_file = unsafe { std::fs::File::from_raw_handle(stdin_write) };
        stdin_file
            .write_all(&serde_json::to_vec(request)?)
            .context("failed to write AppContainer worker request")?;
    }
    let wait = unsafe { WaitForSingleObject(process.hProcess, timeout_ms) };
    let timed_out = wait == WAIT_TIMEOUT;
    if timed_out {
        unsafe {
            TerminateJobObject(job, 1460);
            WaitForSingleObject(process.hProcess, 2_000);
        }
    }
    let mut exit_code = 1_u32;
    unsafe {
        GetExitCodeProcess(process.hProcess, &mut exit_code);
    }
    close_many(&[process.hThread, process.hProcess, job]);
    let (stdout, stdout_exceeded) = stdout_thread
        .join()
        .map_err(|_| anyhow::anyhow!("sandbox stdout reader panicked"))??;
    let (stderr, stderr_exceeded) = stderr_thread
        .join()
        .map_err(|_| anyhow::anyhow!("sandbox stderr reader panicked"))??;
    Ok(ProcessOutput {
        exit_code,
        stderr,
        stderr_exceeded,
        stdout,
        stdout_exceeded,
        timed_out,
    })
}

#[cfg(windows)]
fn create_anonymous_pipe(
    attributes: &mut windows_sys::Win32::Security::SECURITY_ATTRIBUTES,
    child_reads: bool,
) -> Result<(
    windows_sys::Win32::Foundation::HANDLE,
    windows_sys::Win32::Foundation::HANDLE,
)> {
    use std::ptr;
    use windows_sys::Win32::Foundation::{HANDLE_FLAG_INHERIT, SetHandleInformation};
    use windows_sys::Win32::System::Pipes::CreatePipe;

    let mut read = ptr::null_mut();
    let mut write = ptr::null_mut();
    if unsafe { CreatePipe(&mut read, &mut write, attributes, 0) } == 0 {
        return Err(std::io::Error::last_os_error()).context("failed to create sandbox stdio pipe");
    }
    let parent_end = if child_reads { write } else { read };
    if unsafe { SetHandleInformation(parent_end, HANDLE_FLAG_INHERIT, 0) } == 0 {
        close_many(&[read, write]);
        return Err(std::io::Error::last_os_error())
            .context("failed to protect sandbox parent pipe handle");
    }
    Ok((read, write))
}

#[cfg(windows)]
fn spawn_pipe_reader(
    handle: windows_sys::Win32::Foundation::HANDLE,
) -> std::thread::JoinHandle<Result<(Vec<u8>, bool)>> {
    use std::io::Read;
    use std::os::windows::io::FromRawHandle;

    let raw = handle as usize;
    std::thread::spawn(move || {
        let mut file = unsafe { std::fs::File::from_raw_handle(raw as _) };
        let mut output = Vec::new();
        file.by_ref()
            .take((MAX_OUTPUT_BYTES + 1) as u64)
            .read_to_end(&mut output)
            .context("failed to read sandbox worker pipe")?;
        let exceeded = output.len() > MAX_OUTPUT_BYTES;
        if exceeded {
            output.truncate(MAX_OUTPUT_BYTES);
        }
        Ok((output, exceeded))
    })
}

#[cfg(windows)]
fn close_many(handles: &[windows_sys::Win32::Foundation::HANDLE]) {
    use windows_sys::Win32::Foundation::CloseHandle;

    for handle in handles {
        if !handle.is_null() {
            unsafe {
                CloseHandle(*handle);
            }
        }
    }
}

#[cfg(windows)]
fn command_line(python_executable: &Path, worker_path: &Path) -> Vec<u16> {
    let command = format!(
        "{} -I -B -X utf8 {}",
        quote_windows_argument(python_executable.as_os_str()),
        quote_windows_argument(worker_path.as_os_str()),
    );
    wide(&command)
}

#[cfg(windows)]
fn quote_windows_argument(value: &std::ffi::OsStr) -> String {
    let text = value.to_string_lossy();
    let mut output = String::from("\"");
    let mut backslashes = 0;
    for character in text.chars() {
        if character == '\\' {
            backslashes += 1;
            continue;
        }
        if character == '"' {
            output.push_str(&"\\".repeat(backslashes * 2 + 1));
            output.push('"');
            backslashes = 0;
            continue;
        }
        output.push_str(&"\\".repeat(backslashes));
        backslashes = 0;
        output.push(character);
    }
    output.push_str(&"\\".repeat(backslashes * 2));
    output.push('"');
    output
}

#[cfg(windows)]
fn environment_block(environment: &BTreeMap<String, String>) -> Result<Vec<u16>> {
    use std::os::windows::ffi::OsStrExt;

    let mut completed = environment.clone();
    let isolated_home = completed
        .get("HOME")
        .cloned()
        .context("sandbox environment is missing HOME")?;
    for name in ["APPDATA", "LOCALAPPDATA", "USERPROFILE"] {
        completed.insert(name.to_string(), isolated_home.clone());
    }
    for name in [
        "ALLUSERSPROFILE",
        "CommonProgramFiles",
        "CommonProgramFiles(x86)",
        "CommonProgramW6432",
        "OS",
        "ProgramData",
        "ProgramFiles",
        "ProgramFiles(x86)",
        "ProgramW6432",
        "PUBLIC",
        "SystemDrive",
    ] {
        if !completed.contains_key(name)
            && let Some(value) = std::env::var_os(name)
        {
            completed.insert(name.to_string(), value.to_string_lossy().into_owned());
        }
    }
    let mut entries = completed
        .iter()
        .map(|(name, value)| format!("{name}={value}"))
        .collect::<Vec<_>>();
    entries.sort_by_key(|item| item.to_ascii_uppercase());
    let mut block = Vec::new();
    for entry in entries {
        block.extend(std::ffi::OsStr::new(&entry).encode_wide());
        block.push(0);
    }
    block.push(0);
    Ok(block)
}

#[cfg(windows)]
fn wide(value: &str) -> Vec<u16> {
    use std::os::windows::ffi::OsStrExt;

    std::ffi::OsStr::new(value)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect()
}

#[cfg(windows)]
fn wide_os(value: &Path) -> Vec<u16> {
    use std::os::windows::ffi::OsStrExt;

    value
        .as_os_str()
        .encode_wide()
        .chain(std::iter::once(0))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::{allowed_environment_name, valid_environment_name};

    #[test]
    fn environment_name_contract_rejects_process_controls() {
        assert!(valid_environment_name("LANG"));
        assert!(valid_environment_name("_LESSON_MODE"));
        assert!(!valid_environment_name(""));
        assert!(!valid_environment_name("BAD-NAME"));
        assert!(!valid_environment_name("1BAD"));
        assert!(allowed_environment_name("LANG"));
        assert!(allowed_environment_name("_LESSON_MODE"));
        assert!(allowed_environment_name("PYTHONUTF8"));
        assert!(!allowed_environment_name("PYTHONPATH"));
        assert!(!allowed_environment_name("CODARO_SECRET"));
    }

    #[cfg(windows)]
    #[test]
    fn appcontainer_enforces_os_boundaries_and_runs_the_worker() {
        use super::{AppContainerSandbox, SandboxRequest};
        use crate::paths::LauncherPaths;
        use serde_json::json;
        use std::collections::BTreeMap;
        use std::net::TcpListener;
        use std::path::PathBuf;
        use std::process::Command;
        use std::time::{SystemTime, UNIX_EPOCH};
        use tempfile::tempdir;

        let repository_python =
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../.venv/Scripts/python.exe");
        let configured_python = std::env::var_os("CODARO_TEST_PYTHON").unwrap_or_else(|| {
            if repository_python.is_file() {
                repository_python.into_os_string()
            } else {
                "python".into()
            }
        });
        let base_python = Command::new(configured_python)
            .args(["-I", "-c", "import sys; print(sys._base_executable)"])
            .output()
            .expect("test Python should start");
        assert!(
            base_python.status.success(),
            "test Python did not report its base executable"
        );
        let python_executable =
            PathBuf::from(String::from_utf8(base_python.stdout).unwrap().trim())
                .canonicalize()
                .unwrap();

        let fixture = tempdir().unwrap();
        let outside = tempdir().unwrap();
        let worker_directory = tempdir().unwrap();
        let outside_file = outside.path().join("outside.txt");
        std::fs::write(&outside_file, "private").unwrap();
        let worker_path = worker_directory.path().join("_localStrongCheckWorker.py");
        std::fs::write(
            &worker_path,
            r#"import json
import os
from pathlib import Path
import socket
import subprocess
import sys

def blocked(operation):
    try:
        operation()
    except OSError:
        return True
    return False

def connect():
    client = socket.socket()
    try:
        client.settimeout(1)
        client.connect(("127.0.0.1", request["port"]))
    finally:
        client.close()

request = json.loads(sys.stdin.read())
Path("created.txt").write_text("created", encoding="utf-8")
facts = {
    "childProcessBlocked": blocked(
        lambda: subprocess.run(
            [sys.executable, "-I", "-c", "print('child')"],
            check=True,
            capture_output=True,
        )
    ),
    "fixtureWriteAllowed": Path("created.txt").read_text(encoding="utf-8") == "created",
    "networkBlocked": blocked(connect),
    "outsideReadBlocked": blocked(
        lambda: Path(request["outside"]).read_text(encoding="utf-8")
    ),
    "requestReceived": request.get("probe") == "sandbox",
}
print(json.dumps({"facts": facts}, separators=(",", ":")))
"#,
        )
        .unwrap();
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let mut environment = BTreeMap::new();
        for name in ["COMSPEC", "PATH", "PATHEXT", "SYSTEMROOT", "WINDIR"] {
            if let Ok(value) = std::env::var(name) {
                environment.insert(name.to_string(), value);
            }
        }
        environment.insert(
            "HOME".to_string(),
            fixture.path().to_string_lossy().into_owned(),
        );
        environment.insert("PYTHONDONTWRITEBYTECODE".to_string(), "1".to_string());
        environment.insert("PYTHONUTF8".to_string(), "1".to_string());
        environment.insert(
            "TEMP".to_string(),
            fixture.path().to_string_lossy().into_owned(),
        );
        environment.insert(
            "TMP".to_string(),
            fixture.path().to_string_lossy().into_owned(),
        );
        let run_id = format!(
            "{:032x}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos()
                ^ u128::from(std::process::id())
        );
        let request = SandboxRequest {
            schema_version: 1,
            run_id: run_id.clone(),
            fixture_root: fixture.path().to_path_buf(),
            package_paths: Vec::new(),
            environment,
            timeout_ms: 5_000,
            worker_request: json!({
                "outside": outside_file,
                "port": listener.local_addr().unwrap().port(),
                "probe": "sandbox",
            }),
        };
        let launcher_root = tempdir().unwrap();
        let paths = LauncherPaths::discover(Some(launcher_root.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();
        let mut sandbox = AppContainerSandbox::create(&paths, &run_id).unwrap();
        let response = sandbox
            .execute(&python_executable, &worker_path, &request)
            .unwrap();

        assert_eq!(
            response["facts"],
            json!({
                "childProcessBlocked": true,
                "fixtureWriteAllowed": true,
                "networkBlocked": true,
                "outsideReadBlocked": true,
                "requestReceived": true,
            })
        );
    }

    #[cfg(windows)]
    #[test]
    fn startup_reconciliation_preserves_active_and_removes_stale_receipts() {
        use super::{AppContainerSandbox, reconcile};
        use crate::paths::LauncherPaths;
        use std::time::{SystemTime, UNIX_EPOCH};
        use tempfile::tempdir;
        use windows_sys::Win32::Foundation::CloseHandle;

        let launcher_root = tempdir().unwrap();
        let paths = LauncherPaths::discover(Some(launcher_root.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();
        let run_id = format!(
            "{:032x}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos()
                ^ (u128::from(std::process::id()) << 32)
        );
        let mut sandbox = AppContainerSandbox::create(&paths, &run_id).unwrap();
        let receipt_path = sandbox.receipt_path.clone();

        reconcile(&paths).unwrap();
        assert!(receipt_path.is_file());

        unsafe {
            CloseHandle(sandbox.mutex);
        }
        sandbox.mutex = std::ptr::null_mut();
        reconcile(&paths).unwrap();
        assert!(!receipt_path.exists());
    }
}
