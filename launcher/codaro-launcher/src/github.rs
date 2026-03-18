use anyhow::{Context, Result, bail};
use reqwest::blocking::Client;
use reqwest::header::{ACCEPT, HeaderMap, HeaderValue, USER_AGENT};
use serde::{Deserialize, Serialize};

const DEFAULT_GITHUB_API_ROOT: &str = "https://api.github.com";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct GitHubManifestDiscovery {
    pub repo: String,
    pub release_tag: String,
    pub release_url: String,
    pub prerelease: bool,
    pub asset_name: String,
    pub manifest_source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct GitHubRelease {
    pub tag_name: String,
    pub html_url: String,
    pub draft: bool,
    pub prerelease: bool,
    #[serde(default)]
    pub assets: Vec<GitHubReleaseAsset>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct GitHubReleaseAsset {
    pub name: String,
    pub browser_download_url: String,
}

pub fn discover_manifest_for_repo(
    repo: &str,
    asset_name: &str,
    allow_prerelease: bool,
    launcher_version: &str,
) -> Result<GitHubManifestDiscovery> {
    discover_manifest_for_repo_with_api_root(
        repo,
        asset_name,
        allow_prerelease,
        launcher_version,
        None,
    )
}

fn discover_manifest_for_repo_with_api_root(
    repo: &str,
    asset_name: &str,
    allow_prerelease: bool,
    launcher_version: &str,
    api_root_override: Option<&str>,
) -> Result<GitHubManifestDiscovery> {
    let releases = fetch_releases(repo, launcher_version, api_root_override)?;
    let release = select_release(&releases, allow_prerelease).with_context(|| {
        format!("No GitHub release matched repo `{repo}` with allow_prerelease={allow_prerelease}.")
    })?;
    let asset = select_manifest_asset(release, asset_name).with_context(|| {
        format!(
            "GitHub release `{}` does not contain manifest asset `{asset_name}`.",
            release.tag_name
        )
    })?;
    Ok(GitHubManifestDiscovery {
        repo: repo.into(),
        release_tag: release.tag_name.clone(),
        release_url: release.html_url.clone(),
        prerelease: release.prerelease,
        asset_name: asset.name.clone(),
        manifest_source: asset.browser_download_url.clone(),
    })
}

pub fn select_release(
    releases: &[GitHubRelease],
    allow_prerelease: bool,
) -> Option<&GitHubRelease> {
    releases.iter().find(|release| {
        if release.draft {
            return false;
        }
        if !allow_prerelease && release.prerelease {
            return false;
        }
        true
    })
}

pub fn select_manifest_asset<'a>(
    release: &'a GitHubRelease,
    asset_name: &str,
) -> Option<&'a GitHubReleaseAsset> {
    release.assets.iter().find(|asset| asset.name == asset_name)
}

fn fetch_releases(
    repo: &str,
    launcher_version: &str,
    api_root_override: Option<&str>,
) -> Result<Vec<GitHubRelease>> {
    if repo.trim().is_empty() {
        bail!("GitHub repo must not be empty.");
    }
    let api_root = api_root_override
        .map(str::to_owned)
        .or_else(|| std::env::var("CODARO_GITHUB_API_ROOT").ok())
        .unwrap_or_else(|| DEFAULT_GITHUB_API_ROOT.into());
    let request_url = format!("{}/repos/{}/releases", api_root.trim_end_matches('/'), repo);
    let response = Client::builder()
        .default_headers(default_headers(launcher_version)?)
        .build()
        .context("Failed to build GitHub API client.")?
        .get(&request_url)
        .send()
        .with_context(|| format!("Failed to fetch GitHub releases from `{request_url}`."))?
        .error_for_status()
        .with_context(|| format!("GitHub releases request failed for `{request_url}`."))?;
    response
        .json()
        .with_context(|| format!("Failed to parse GitHub releases response from `{request_url}`."))
}

fn default_headers(launcher_version: &str) -> Result<HeaderMap> {
    let mut headers = HeaderMap::new();
    headers.insert(
        ACCEPT,
        HeaderValue::from_static("application/vnd.github+json"),
    );
    headers.insert(
        USER_AGENT,
        HeaderValue::from_str(&format!("codaro-launcher/{launcher_version}"))
            .context("Failed to build GitHub API User-Agent header.")?,
    );
    Ok(headers)
}

#[cfg(test)]
mod tests {
    use super::{
        GitHubRelease, discover_manifest_for_repo_with_api_root, select_manifest_asset,
        select_release,
    };

    #[test]
    fn select_release_skips_prerelease_for_stable() {
        let releases = sample_releases();

        let release = select_release(&releases, false).unwrap();

        assert_eq!(release.tag_name, "v0.3.0");
    }

    #[test]
    fn select_release_allows_prerelease_for_beta() {
        let releases = sample_releases();

        let release = select_release(&releases, true).unwrap();

        assert_eq!(release.tag_name, "v0.4.0-beta.1");
    }

    #[test]
    fn select_manifest_asset_matches_expected_name() {
        let releases = sample_releases();
        let asset = select_manifest_asset(&releases[0], "release-manifest.json").unwrap();

        assert_eq!(
            asset.browser_download_url,
            "https://example.com/beta-manifest.json"
        );
    }

    #[test]
    fn discover_manifest_for_repo_uses_local_api_root_override() {
        let server = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let address = server.local_addr().unwrap();

        let handle = std::thread::spawn(move || {
            let (mut stream, _) = server.accept().unwrap();
            let payload = serde_json::to_vec(&sample_releases()).unwrap();
            let body = String::from_utf8(payload).unwrap();
            use std::io::{Read, Write};
            let mut buffer = [0_u8; 1024];
            let _ = stream.read(&mut buffer).unwrap();
            let response = format!(
                "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nContent-Type: application/json\r\n\r\n{}",
                body.len(),
                body
            );
            stream.write_all(response.as_bytes()).unwrap();
        });

        let api_root = format!("http://{}", address);
        let discovery = discover_manifest_for_repo_with_api_root(
            "eddmpython/codaro",
            "release-manifest.json",
            false,
            "0.1.0",
            Some(&api_root),
        )
        .unwrap();

        handle.join().unwrap();

        assert_eq!(discovery.release_tag, "v0.3.0");
        assert_eq!(
            discovery.manifest_source,
            "https://example.com/stable-manifest.json"
        );
    }

    fn sample_releases() -> Vec<GitHubRelease> {
        serde_json::from_str(
            r#"[
                {
                    "tag_name": "v0.4.0-beta.1",
                    "html_url": "https://github.com/eddmpython/codaro/releases/tag/v0.4.0-beta.1",
                    "draft": false,
                    "prerelease": true,
                    "assets": [
                        {
                            "name": "release-manifest.json",
                            "browser_download_url": "https://example.com/beta-manifest.json"
                        }
                    ]
                },
                {
                    "tag_name": "v0.3.0",
                    "html_url": "https://github.com/eddmpython/codaro/releases/tag/v0.3.0",
                    "draft": false,
                    "prerelease": false,
                    "assets": [
                        {
                            "name": "release-manifest.json",
                            "browser_download_url": "https://example.com/stable-manifest.json"
                        }
                    ]
                }
            ]"#,
        )
        .unwrap()
    }
}
