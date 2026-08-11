use anyhow::{Context, Result, bail};
use reqwest::blocking::Client;
use semver::Version;
use sha2::{Digest, Sha256};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Child, Command};
use std::time::Duration;

const CURRENT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[derive(Debug, Clone)]
pub struct LauncherRelease {
    pub version: String,
    pub download_url: String,
    pub sha256: Option<String>,
    pub release_notes: Option<String>,
}

#[derive(Debug, Clone)]
pub struct SelfUpdateResult {
    pub from_version: String,
    pub to_version: String,
    pub downloaded_path: PathBuf,
    pub verified: bool,
}

#[derive(Debug, Clone)]
pub struct SelfUpdateCompletion {
    pub backup_path: PathBuf,
    pub relaunched_process_id: u32,
}

pub fn check_launcher_update(
    repo: &str,
    current_version: &str,
    include_prerelease: bool,
) -> Result<Option<LauncherRelease>> {
    let client = build_http_client()?;
    let api_root =
        std::env::var("CODARO_GITHUB_API_ROOT").unwrap_or_else(|_| "https://api.github.com".into());
    let url = format!("{}/repos/{}/releases", api_root, repo);

    let response: Vec<serde_json::Value> = client
        .get(&url)
        .header("User-Agent", format!("codaro-launcher/{}", CURRENT_VERSION))
        .header("Accept", "application/vnd.github+json")
        .send()
        .context("failed to fetch releases")?
        .json()
        .context("failed to parse releases")?;

    let current = Version::parse(current_version).context("invalid current version")?;

    let mut best: Option<(Version, &serde_json::Value)> = None;

    for release in &response {
        let is_prerelease = release
            .get("prerelease")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);
        if is_prerelease && !include_prerelease {
            continue;
        }

        let tag = match release.get("tag_name").and_then(|v| v.as_str()) {
            Some(t) => t,
            None => continue,
        };

        let exe_asset_name = launcher_asset_name();
        let assets = release.get("assets").and_then(|v| v.as_array());
        if !assets.is_some_and(|list| {
            list.iter()
                .any(|a| a.get("name").and_then(|n| n.as_str()) == Some(&exe_asset_name))
        }) {
            continue;
        }

        let version_str = tag.strip_prefix('v').unwrap_or(tag);
        let clean = version_str.strip_suffix("-launcher").unwrap_or(version_str);
        let version = match Version::parse(&clean) {
            Ok(v) => v,
            Err(_) => continue,
        };

        if version <= current {
            continue;
        }

        match &best {
            Some((best_ver, _)) if version <= *best_ver => continue,
            _ => best = Some((version, release)),
        }
    }

    let (version, release) = match best {
        Some(pair) => pair,
        None => return Ok(None),
    };

    let exe_asset_name = launcher_asset_name();
    let assets = release.get("assets").and_then(|v| v.as_array());

    let download_url = assets
        .and_then(|list| {
            list.iter()
                .find(|a| a.get("name").and_then(|n| n.as_str()) == Some(&exe_asset_name))
        })
        .and_then(|a| a.get("browser_download_url").and_then(|u| u.as_str()))
        .map(|s| s.to_string());

    let download_url = match download_url {
        Some(url) => url,
        None => bail!(
            "launcher asset '{}' not found in release v{}",
            exe_asset_name,
            version
        ),
    };

    let sha_asset_name = format!("{}.sha256", exe_asset_name);
    let sha256 = assets
        .and_then(|list| {
            list.iter()
                .find(|a| a.get("name").and_then(|n| n.as_str()) == Some(&sha_asset_name))
        })
        .and_then(|a| a.get("browser_download_url").and_then(|u| u.as_str()))
        .and_then(|sha_url| {
            client
                .get(sha_url)
                .header("User-Agent", format!("codaro-launcher/{}", CURRENT_VERSION))
                .send()
                .ok()
                .and_then(|r| r.text().ok())
                .map(|t| t.trim().split_whitespace().next().unwrap_or("").to_string())
        });

    let release_notes = release
        .get("body")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    Ok(Some(LauncherRelease {
        version: version.to_string(),
        download_url,
        sha256,
        release_notes,
    }))
}

pub fn download_launcher_update(
    release: &LauncherRelease,
    download_dir: &Path,
) -> Result<SelfUpdateResult> {
    fs::create_dir_all(download_dir).context("failed to create download directory")?;

    let asset_name = launcher_asset_name();
    let dest = download_dir.join(&asset_name);

    let client = build_http_client()?;
    let mut response = client
        .get(&release.download_url)
        .header("User-Agent", format!("codaro-launcher/{}", CURRENT_VERSION))
        .send()
        .context("failed to download launcher update")?;

    if !response.status().is_success() {
        bail!("download failed with status {}", response.status());
    }

    let mut file = fs::File::create(&dest).context("failed to create destination file")?;
    let mut hasher = Sha256::new();
    let mut buf = [0u8; 8192];
    loop {
        let n =
            std::io::Read::read(&mut response, &mut buf).context("read error during download")?;
        if n == 0 {
            break;
        }
        file.write_all(&buf[..n])?;
        hasher.update(&buf[..n]);
    }
    file.flush()?;

    let computed_hash = format!("{:x}", hasher.finalize());
    let verified = match &release.sha256 {
        Some(expected) => {
            if computed_hash != *expected {
                bail!(
                    "SHA256 mismatch: expected {} got {}",
                    expected,
                    computed_hash
                );
            }
            true
        }
        None => false,
    };

    Ok(SelfUpdateResult {
        from_version: CURRENT_VERSION.to_string(),
        to_version: release.version.clone(),
        downloaded_path: dest,
        verified,
    })
}

pub fn apply_self_update(downloaded: &Path, current_exe: &Path) -> Result<PathBuf> {
    let backup = current_exe.with_extension("old");

    if backup.exists() {
        fs::remove_file(&backup).context("failed to remove previous backup")?;
    }

    fs::rename(current_exe, &backup).context("failed to rename current exe to backup")?;

    if let Err(err) = fs::copy(downloaded, current_exe) {
        fs::rename(&backup, current_exe).ok();
        bail!("failed to copy new exe into place: {}", err);
    }

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let perms = fs::Permissions::from_mode(0o755);
        fs::set_permissions(current_exe, perms).ok();
    }

    Ok(backup)
}

pub fn is_official_launcher_executable(path: &Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .is_some_and(|name| name.eq_ignore_ascii_case(&launcher_asset_name()))
}

pub fn verify_launcher_download(path: &Path, expected_sha256: &str) -> Result<()> {
    let expected = expected_sha256.trim().to_ascii_lowercase();
    if expected.len() != 64 || !expected.bytes().all(|value| value.is_ascii_hexdigit()) {
        bail!("launcher SHA256 must be a 64-character hexadecimal string");
    }
    let mut file = fs::File::open(path)
        .with_context(|| format!("failed to open launcher update `{}`", path.display()))?;
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 8192];
    loop {
        let count = std::io::Read::read(&mut file, &mut buffer)
            .context("failed to read launcher update for verification")?;
        if count == 0 {
            break;
        }
        hasher.update(&buffer[..count]);
    }
    let actual = format!("{:x}", hasher.finalize());
    if actual != expected {
        bail!("launcher SHA256 mismatch: expected {expected} got {actual}");
    }
    Ok(())
}

#[cfg(windows)]
pub fn spawn_self_update_helper(
    downloaded: &Path,
    current_exe: &Path,
    expected_sha256: &str,
    parent_process_id: u32,
    relaunch_args: &[String],
) -> Result<Child> {
    use std::os::windows::process::CommandExt;

    verify_launcher_download(downloaded, expected_sha256)?;
    let relaunch_args_json = serde_json::to_string(relaunch_args)
        .context("failed to encode launcher relaunch arguments")?;
    let mut command = Command::new(downloaded);
    command
        .arg("self-update")
        .arg("finalize")
        .arg("--downloaded")
        .arg(downloaded)
        .arg("--current-exe")
        .arg(current_exe)
        .arg("--expected-sha256")
        .arg(expected_sha256)
        .arg("--parent-process-id")
        .arg(parent_process_id.to_string())
        .arg("--relaunch-args-json")
        .arg(relaunch_args_json);
    const CREATE_NO_WINDOW: u32 = 0x0800_0000;
    command.creation_flags(CREATE_NO_WINDOW);
    command.spawn().with_context(|| {
        format!(
            "failed to start launcher update helper `{}`",
            downloaded.display()
        )
    })
}

#[cfg(not(windows))]
pub fn spawn_self_update_helper(
    _downloaded: &Path,
    _current_exe: &Path,
    _expected_sha256: &str,
    _parent_process_id: u32,
    _relaunch_args: &[String],
) -> Result<Child> {
    bail!("automatic launcher replacement is currently supported on Windows only")
}

pub fn finalize_self_update(
    downloaded: &Path,
    current_exe: &Path,
    expected_sha256: &str,
    parent_process_id: u32,
    relaunch_args: &[String],
) -> Result<SelfUpdateCompletion> {
    wait_for_process_exit(parent_process_id, Duration::from_secs(60))?;
    if let Err(error) = verify_launcher_download(downloaded, expected_sha256) {
        let _ = spawn_launcher(current_exe, relaunch_args);
        return Err(error);
    }

    let backup_path = match apply_self_update(downloaded, current_exe) {
        Ok(path) => path,
        Err(error) => {
            let _ = spawn_launcher(current_exe, relaunch_args);
            return Err(error);
        }
    };
    match spawn_launcher(current_exe, relaunch_args) {
        Ok(child) => Ok(SelfUpdateCompletion {
            backup_path,
            relaunched_process_id: child.id(),
        }),
        Err(error) => {
            let restore_error = restore_launcher_backup(current_exe, &backup_path).err();
            let rollback_relaunch_error = spawn_launcher(current_exe, relaunch_args).err();
            bail!(
                "failed to relaunch updated launcher: {error}; restore error: {}; rollback relaunch error: {}",
                optional_error_text(restore_error),
                optional_error_text(rollback_relaunch_error),
            );
        }
    }
}

fn spawn_launcher(executable: &Path, args: &[String]) -> Result<Child> {
    let mut command = Command::new(executable);
    command.args(args);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        command.creation_flags(CREATE_NO_WINDOW);
    }
    command
        .spawn()
        .with_context(|| format!("failed to launch `{}`", executable.display()))
}

fn restore_launcher_backup(current_exe: &Path, backup_path: &Path) -> Result<()> {
    if current_exe.exists() {
        fs::remove_file(current_exe).with_context(|| {
            format!(
                "failed to remove `{}` during rollback",
                current_exe.display()
            )
        })?;
    }
    fs::rename(backup_path, current_exe).with_context(|| {
        format!(
            "failed to restore launcher backup `{}` to `{}`",
            backup_path.display(),
            current_exe.display(),
        )
    })
}

fn optional_error_text(error: Option<anyhow::Error>) -> String {
    error
        .map(|value| format!("{value:#}"))
        .unwrap_or_else(|| "none".into())
}

#[cfg(windows)]
fn wait_for_process_exit(process_id: u32, timeout: Duration) -> Result<()> {
    use windows_sys::Win32::Foundation::{CloseHandle, WAIT_OBJECT_0, WAIT_TIMEOUT};
    use windows_sys::Win32::System::Threading::{OpenProcess, WaitForSingleObject};

    const SYNCHRONIZE_ACCESS: u32 = 0x0010_0000;
    let process = unsafe { OpenProcess(SYNCHRONIZE_ACCESS, 0, process_id) };
    if process.is_null() {
        let error = std::io::Error::last_os_error();
        if error.raw_os_error() == Some(87) {
            return Ok(());
        }
        return Err(error).context("failed to open parent launcher process");
    }
    let timeout_millis = timeout.as_millis().min(u32::MAX as u128) as u32;
    let wait_result = unsafe { WaitForSingleObject(process, timeout_millis) };
    unsafe { CloseHandle(process) };
    match wait_result {
        WAIT_OBJECT_0 => Ok(()),
        WAIT_TIMEOUT => bail!("timed out waiting for parent launcher process to exit"),
        value => bail!("failed while waiting for parent launcher process: {value}"),
    }
}

#[cfg(not(windows))]
fn wait_for_process_exit(_process_id: u32, _timeout: Duration) -> Result<()> {
    bail!("automatic launcher replacement is currently supported on Windows only")
}

fn launcher_asset_name() -> String {
    if cfg!(target_os = "windows") {
        "Codaro.exe".to_string()
    } else if cfg!(target_os = "macos") {
        "Codaro-macos".to_string()
    } else {
        "Codaro-linux".to_string()
    }
}

fn build_http_client() -> Result<Client> {
    Client::builder()
        .timeout(std::time::Duration::from_secs(120))
        .build()
        .context("failed to build HTTP client")
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_launcher_asset_name() {
        let name = launcher_asset_name();
        assert!(!name.is_empty());
        if cfg!(target_os = "windows") {
            assert_eq!(name, "Codaro.exe");
        }
    }

    #[test]
    fn test_current_version_valid() {
        let version = Version::parse(CURRENT_VERSION);
        assert!(version.is_ok(), "CARGO_PKG_VERSION must be valid semver");
    }

    #[test]
    fn test_apply_self_update_missing_source() {
        let temp_dir = tempdir().unwrap();
        let fake_src = temp_dir.path().join("nonexistent.exe");
        let fake_dst = temp_dir.path().join("current.exe");
        fs::write(&fake_dst, b"current").unwrap();

        let result = apply_self_update(&fake_src, &fake_dst);
        assert!(result.is_err());
    }

    #[test]
    fn launcher_download_verification_rejects_tampering() {
        let temp_dir = tempdir().unwrap();
        let downloaded = temp_dir.path().join("Codaro.exe");
        fs::write(&downloaded, b"verified launcher").unwrap();
        let expected = format!("{:x}", Sha256::digest(b"verified launcher"));
        verify_launcher_download(&downloaded, &expected).unwrap();

        fs::write(&downloaded, b"tampered launcher").unwrap();
        assert!(verify_launcher_download(&downloaded, &expected).is_err());
    }

    #[test]
    fn official_launcher_name_is_case_insensitive() {
        let official = launcher_asset_name();
        assert!(is_official_launcher_executable(Path::new(&official)));
        assert!(is_official_launcher_executable(Path::new(
            &official.to_ascii_uppercase()
        )));
        assert!(!is_official_launcher_executable(Path::new(
            "codaro-launcher.exe"
        )));
    }

    #[cfg(windows)]
    #[test]
    fn finalize_self_update_restores_backup_when_relaunch_fails() {
        let temp_dir = tempdir().unwrap();
        let current = temp_dir.path().join("Codaro.exe");
        let downloaded = temp_dir.path().join("downloaded.exe");
        fs::write(&current, b"previous launcher").unwrap();
        fs::write(&downloaded, b"invalid replacement executable").unwrap();
        let expected = format!("{:x}", Sha256::digest(b"invalid replacement executable"));

        let result = finalize_self_update(&downloaded, &current, &expected, 0, &[]);

        assert!(result.is_err());
        assert_eq!(fs::read(&current).unwrap(), b"previous launcher");
        assert!(!current.with_extension("old").exists());
    }
}
