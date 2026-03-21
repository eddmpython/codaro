use anyhow::{Context, Result, bail};
use reqwest::blocking::Client;
use semver::Version;
use sha2::{Digest, Sha256};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

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

pub fn check_launcher_update(
    repo: &str,
    current_version: &str,
    include_prerelease: bool,
) -> Result<Option<LauncherRelease>> {
    let client = build_http_client()?;
    let api_root = std::env::var("CODARO_GITHUB_API_ROOT")
        .unwrap_or_else(|_| "https://api.github.com".into());
    let url = format!("{}/repos/{}/releases", api_root, repo);

    let response: Vec<serde_json::Value> = client
        .get(&url)
        .header("User-Agent", format!("codaro-launcher/{}", CURRENT_VERSION))
        .header("Accept", "application/vnd.github+json")
        .send()
        .context("failed to fetch releases")?
        .json()
        .context("failed to parse releases")?;

    let current = Version::parse(current_version)
        .context("invalid current version")?;

    let mut best: Option<(Version, &serde_json::Value)> = None;

    for release in &response {
        let is_prerelease = release.get("prerelease").and_then(|v| v.as_bool()).unwrap_or(false);
        if is_prerelease && !include_prerelease {
            continue;
        }

        let tag = match release.get("tag_name").and_then(|v| v.as_str()) {
            Some(t) => t,
            None => continue,
        };

        let version_str = tag.strip_prefix('v').unwrap_or(tag);
        if !version_str.contains("launcher") {
            continue;
        }

        let clean = version_str.replace("-launcher", "");
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
            list.iter().find(|a| {
                a.get("name").and_then(|n| n.as_str()) == Some(&exe_asset_name)
            })
        })
        .and_then(|a| a.get("browser_download_url").and_then(|u| u.as_str()))
        .map(|s| s.to_string());

    let download_url = match download_url {
        Some(url) => url,
        None => bail!("launcher asset '{}' not found in release v{}", exe_asset_name, version),
    };

    let sha_asset_name = format!("{}.sha256", exe_asset_name);
    let sha256 = assets
        .and_then(|list| {
            list.iter().find(|a| {
                a.get("name").and_then(|n| n.as_str()) == Some(&sha_asset_name)
            })
        })
        .and_then(|a| a.get("browser_download_url").and_then(|u| u.as_str()))
        .and_then(|sha_url| {
            client.get(sha_url)
                .header("User-Agent", format!("codaro-launcher/{}", CURRENT_VERSION))
                .send().ok()
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
    fs::create_dir_all(download_dir)
        .context("failed to create download directory")?;

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

    let mut file = fs::File::create(&dest)
        .context("failed to create destination file")?;
    let mut hasher = Sha256::new();
    let mut buf = [0u8; 8192];
    loop {
        let n = std::io::Read::read(&mut response, &mut buf)
            .context("read error during download")?;
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

pub fn apply_self_update(
    downloaded: &Path,
    current_exe: &Path,
) -> Result<PathBuf> {
    let backup = current_exe.with_extension("old");

    if backup.exists() {
        fs::remove_file(&backup)
            .context("failed to remove previous backup")?;
    }

    fs::rename(current_exe, &backup)
        .context("failed to rename current exe to backup")?;

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

fn launcher_asset_name() -> String {
    if cfg!(target_os = "windows") {
        "CodaroLauncher.exe".to_string()
    } else if cfg!(target_os = "macos") {
        "CodaroLauncher-macos".to_string()
    } else {
        "CodaroLauncher-linux".to_string()
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

    #[test]
    fn test_launcher_asset_name() {
        let name = launcher_asset_name();
        assert!(!name.is_empty());
        if cfg!(target_os = "windows") {
            assert_eq!(name, "CodaroLauncher.exe");
        }
    }

    #[test]
    fn test_current_version_valid() {
        let version = Version::parse(CURRENT_VERSION);
        assert!(version.is_ok(), "CARGO_PKG_VERSION must be valid semver");
    }

    #[test]
    fn test_apply_self_update_missing_source() {
        let tmp = std::env::temp_dir().join("codaro-test-self-update");
        let _ = fs::create_dir_all(&tmp);
        let fake_src = tmp.join("nonexistent.exe");
        let fake_dst = tmp.join("current.exe");
        fs::write(&fake_dst, b"current").unwrap();

        let result = apply_self_update(&fake_src, &fake_dst);
        assert!(result.is_err());

        let _ = fs::remove_dir_all(&tmp);
    }
}
