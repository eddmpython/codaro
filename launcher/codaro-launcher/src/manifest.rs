use anyhow::{Context, Result, bail};
use semver::Version;
use serde::{Deserialize, Serialize};
use url::Url;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ReleaseManifest {
    pub manifest_version: u32,
    pub channel: String,
    pub release_id: String,
    pub launcher_version: String,
    pub min_launcher_version: String,
    pub python_runtime: RuntimeArtifact,
    pub frontend: RuntimeArtifact,
    pub backend: BackendArtifact,
    #[serde(default)]
    pub bundles: Vec<BundleArtifact>,
    pub rollback_to: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeArtifact {
    pub version: String,
    pub url: String,
    pub sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct BackendArtifact {
    pub name: String,
    pub version: String,
    pub wheel_url: String,
    pub sha256: String,
    pub entry_module: String,
    pub console_script: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct BundleArtifact {
    pub name: String,
    pub package_name: String,
    pub version: String,
    pub required: bool,
    pub wheel_url: String,
    pub sha256: String,
}

impl ReleaseManifest {
    pub fn validate(&self) -> Result<()> {
        if self.manifest_version == 0 {
            bail!("Manifest version must be greater than zero.");
        }
        ensure_present("channel", &self.channel)?;
        ensure_present("releaseId", &self.release_id)?;
        ensure_present("launcherVersion", &self.launcher_version)?;
        ensure_present("minLauncherVersion", &self.min_launcher_version)?;
        self.python_runtime.validate("pythonRuntime")?;
        self.frontend.validate("frontend")?;
        self.backend.validate()?;
        for bundle in &self.bundles {
            bundle.validate()?;
        }
        Ok(())
    }

    pub fn ensure_launcher_compatibility(&self, launcher_version: &str) -> Result<()> {
        let current = Version::parse(launcher_version).with_context(|| {
            format!("Launcher version `{launcher_version}` is not valid semver.")
        })?;
        let minimum = Version::parse(&self.min_launcher_version).with_context(|| {
            format!(
                "Manifest minLauncherVersion `{}` is not valid semver.",
                self.min_launcher_version
            )
        })?;
        if current < minimum {
            bail!(
                "Launcher `{launcher_version}` is older than manifest minimum `{}`.",
                self.min_launcher_version
            );
        }
        Ok(())
    }
}

impl RuntimeArtifact {
    fn validate(&self, field_name: &str) -> Result<()> {
        ensure_present(&format!("{field_name}.version"), &self.version)?;
        ensure_valid_url(&format!("{field_name}.url"), &self.url)?;
        ensure_sha256(&format!("{field_name}.sha256"), &self.sha256)?;
        Ok(())
    }
}

impl BackendArtifact {
    fn validate(&self) -> Result<()> {
        ensure_present("backend.name", &self.name)?;
        ensure_present("backend.version", &self.version)?;
        ensure_valid_url("backend.wheelUrl", &self.wheel_url)?;
        ensure_sha256("backend.sha256", &self.sha256)?;
        ensure_present("backend.entryModule", &self.entry_module)?;
        ensure_present("backend.consoleScript", &self.console_script)?;
        Ok(())
    }
}

impl BundleArtifact {
    fn validate(&self) -> Result<()> {
        ensure_present("bundles[].name", &self.name)?;
        ensure_present("bundles[].packageName", &self.package_name)?;
        ensure_present("bundles[].version", &self.version)?;
        ensure_valid_url("bundles[].wheelUrl", &self.wheel_url)?;
        ensure_sha256("bundles[].sha256", &self.sha256)?;
        Ok(())
    }
}

fn ensure_present(field_name: &str, value: &str) -> Result<()> {
    if value.trim().is_empty() {
        bail!("Manifest field `{field_name}` must not be empty.");
    }
    Ok(())
}

fn ensure_valid_url(field_name: &str, value: &str) -> Result<()> {
    let parsed = Url::parse(value)
        .with_context(|| format!("Manifest field `{field_name}` must be a valid URL."))?;
    match parsed.scheme() {
        "http" | "https" | "file" => Ok(()),
        other => bail!("Manifest field `{field_name}` uses unsupported scheme `{other}`."),
    }
}

fn ensure_sha256(field_name: &str, value: &str) -> Result<()> {
    if value.len() != 64 || !value.chars().all(|character| character.is_ascii_hexdigit()) {
        bail!("Manifest field `{field_name}` must be a 64-character hex sha256.");
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::ReleaseManifest;

    #[test]
    fn manifest_validation_accepts_expected_shape() {
        let manifest: ReleaseManifest = serde_json::from_str(
            r#"{
                "manifestVersion": 1,
                "channel": "stable",
                "releaseId": "2026.03.18-1",
                "launcherVersion": "0.3.0",
                "minLauncherVersion": "0.3.0",
                "pythonRuntime": {
                    "version": "3.12.12",
                    "url": "https://example.com/python.zip",
                    "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                },
                "frontend": {
                    "version": "0.3.0",
                    "url": "https://example.com/frontend.zip",
                    "sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
                },
                "backend": {
                    "name": "codaro",
                    "version": "0.3.0",
                    "wheelUrl": "https://example.com/codaro.whl",
                    "sha256": "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
                    "entryModule": "codaro.cli",
                    "consoleScript": "codaro"
                },
                "bundles": [
                    {
                        "name": "excel",
                        "packageName": "codaro-excel",
                        "version": "0.3.0",
                        "required": false,
                        "wheelUrl": "https://example.com/excel.whl",
                        "sha256": "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
                    }
                ],
                "rollbackTo": "2026.03.10-2"
            }"#,
        )
        .unwrap();

        manifest.validate().unwrap();
    }

    #[test]
    fn compatibility_rejects_older_launcher() {
        let manifest: ReleaseManifest = serde_json::from_str(
            r#"{
                "manifestVersion": 1,
                "channel": "stable",
                "releaseId": "2026.03.18-1",
                "launcherVersion": "0.3.0",
                "minLauncherVersion": "9.9.9",
                "pythonRuntime": {
                    "version": "3.12.12",
                    "url": "https://example.com/python.zip",
                    "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                },
                "frontend": {
                    "version": "0.3.0",
                    "url": "https://example.com/frontend.zip",
                    "sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
                },
                "backend": {
                    "name": "codaro",
                    "version": "0.3.0",
                    "wheelUrl": "https://example.com/codaro.whl",
                    "sha256": "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
                    "entryModule": "codaro.cli",
                    "consoleScript": "codaro"
                },
                "bundles": []
            }"#,
        )
        .unwrap();

        let result = manifest.ensure_launcher_compatibility("0.1.0");

        assert!(result.is_err());
        assert!(
            result
                .unwrap_err()
                .to_string()
                .contains("older than manifest minimum")
        );
    }
}
