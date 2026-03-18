use crate::manifest::ReleaseManifest;
use anyhow::{Context, Result, bail};
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use std::marker::PhantomData;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ActiveReleaseState {
    pub release_id: String,
    pub channel: String,
    pub launcher_version: String,
    pub backend_package_name: String,
    pub backend_version: String,
    pub backend_entry_module: String,
    pub backend_console_script: String,
    pub frontend_version: String,
    pub installed_at_unix_seconds: u64,
}

impl ActiveReleaseState {
    pub fn from_manifest(manifest: &ReleaseManifest) -> Self {
        Self {
            release_id: manifest.release_id.clone(),
            channel: manifest.channel.clone(),
            launcher_version: manifest.launcher_version.clone(),
            backend_package_name: manifest.backend.name.clone(),
            backend_version: manifest.backend.version.clone(),
            backend_entry_module: manifest.backend.entry_module.clone(),
            backend_console_script: manifest.backend.console_script.clone(),
            frontend_version: manifest.frontend.version.clone(),
            installed_at_unix_seconds: current_unix_seconds(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct UpdateConfig {
    pub channel: String,
    #[serde(default)]
    pub auto_update_on_launch: bool,
    pub manifest_source: Option<String>,
    pub github_repo: String,
    pub github_manifest_asset_name: String,
}

impl Default for UpdateConfig {
    fn default() -> Self {
        Self {
            channel: "stable".into(),
            auto_update_on_launch: false,
            manifest_source: None,
            github_repo: "eddmpython/codaro".into(),
            github_manifest_asset_name: "release-manifest.json".into(),
        }
    }
}

impl UpdateConfig {
    pub fn validate(&self) -> Result<()> {
        if self.channel.trim().is_empty() {
            bail!("Update config channel must not be empty.");
        }
        if self.github_repo.trim().is_empty() {
            bail!("Update config githubRepo must not be empty.");
        }
        if self.github_manifest_asset_name.trim().is_empty() {
            bail!("Update config githubManifestAssetName must not be empty.");
        }
        if let Some(source) = &self.manifest_source {
            if source.trim().is_empty() {
                bail!("Update config manifestSource must not be empty when provided.");
            }
        }
        Ok(())
    }

    pub fn allows_prerelease(&self) -> bool {
        !self.channel.eq_ignore_ascii_case("stable")
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CrashState {
    pub release_id: String,
    pub crash_count: u32,
    pub first_crash_unix_seconds: u64,
    pub last_crash_unix_seconds: u64,
    pub last_exit_code: Option<i32>,
    pub last_reason: String,
    pub status: CrashStatus,
}

impl CrashState {
    pub fn record(
        previous: Option<&Self>,
        release_id: impl Into<String>,
        last_exit_code: Option<i32>,
        last_reason: impl Into<String>,
        freeze_after_crashes: u32,
        crash_window_seconds: u64,
    ) -> Self {
        let release_id = release_id.into();
        let last_reason = last_reason.into();
        let now = current_unix_seconds();
        let should_reset_window = previous.is_none_or(|state| {
            state.release_id != release_id
                || now.saturating_sub(state.first_crash_unix_seconds) > crash_window_seconds
        });
        let (crash_count, first_crash_unix_seconds) = if should_reset_window {
            (1, now)
        } else {
            let state = previous.expect("previous crash state must exist when window is reused");
            (
                state.crash_count.saturating_add(1),
                state.first_crash_unix_seconds,
            )
        };
        let freeze_after_crashes = freeze_after_crashes.max(1);
        let status = if crash_count >= freeze_after_crashes {
            CrashStatus::Frozen
        } else {
            CrashStatus::Tracking
        };

        Self {
            release_id,
            crash_count,
            first_crash_unix_seconds,
            last_crash_unix_seconds: now,
            last_exit_code,
            last_reason,
            status,
        }
    }

    pub fn is_frozen_for(&self, release_id: &str) -> bool {
        self.release_id == release_id && self.status == CrashStatus::Frozen
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum CrashStatus {
    Tracking,
    Frozen,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct RollbackMarker {
    pub failed_release_id: String,
    pub rollback_release_id: Option<String>,
    pub reason: String,
    pub status: RollbackStatus,
    pub recorded_at_unix_seconds: u64,
}

impl RollbackMarker {
    pub fn pending(
        failed_release_id: impl Into<String>,
        rollback_release_id: Option<String>,
        reason: impl Into<String>,
    ) -> Self {
        Self {
            failed_release_id: failed_release_id.into(),
            rollback_release_id,
            reason: reason.into(),
            status: RollbackStatus::Pending,
            recorded_at_unix_seconds: current_unix_seconds(),
        }
    }

    pub fn mark_rolled_back(&mut self) {
        self.status = RollbackStatus::RolledBack;
    }

    pub fn mark_failed(&mut self, reason: impl Into<String>) {
        self.status = RollbackStatus::Failed;
        self.reason = reason.into();
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum RollbackStatus {
    Pending,
    RolledBack,
    Failed,
}

#[derive(Debug, Clone)]
pub struct JsonStateStore<T> {
    path: PathBuf,
    _marker: PhantomData<T>,
}

impl<T> JsonStateStore<T>
where
    T: Serialize + DeserializeOwned,
{
    pub fn new(path: PathBuf) -> Self {
        Self {
            path,
            _marker: PhantomData,
        }
    }

    pub fn load_optional(&self) -> Result<Option<T>> {
        if !self.path.exists() {
            return Ok(None);
        }
        let content = std::fs::read_to_string(&self.path)
            .with_context(|| format!("Failed to read launcher state `{}`.", self.path.display()))?;
        let state = serde_json::from_str(&content).with_context(|| {
            format!("Failed to parse launcher state `{}`.", self.path.display())
        })?;
        Ok(Some(state))
    }

    pub fn save(&self, state: &T) -> Result<()> {
        if let Some(parent) = self.path.parent() {
            std::fs::create_dir_all(parent).with_context(|| {
                format!("Failed to create state directory `{}`.", parent.display())
            })?;
        }
        let content = serde_json::to_string_pretty(state)?;
        std::fs::write(&self.path, content).with_context(|| {
            format!("Failed to write launcher state `{}`.", self.path.display())
        })?;
        Ok(())
    }

    pub fn clear(&self) -> Result<()> {
        if !self.path.exists() {
            return Ok(());
        }
        std::fs::remove_file(&self.path)
            .with_context(|| format!("Failed to remove launcher state `{}`.", self.path.display()))
    }
}

pub type ActiveReleaseStore = JsonStateStore<ActiveReleaseState>;
pub type LastKnownGoodReleaseStore = JsonStateStore<ActiveReleaseState>;
pub type CrashStateStore = JsonStateStore<CrashState>;
pub type RollbackMarkerStore = JsonStateStore<RollbackMarker>;
pub type UpdateConfigStore = JsonStateStore<UpdateConfig>;

fn current_unix_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

#[cfg(test)]
mod tests {
    use super::{
        ActiveReleaseState, ActiveReleaseStore, CrashState, CrashStateStore, CrashStatus,
        LastKnownGoodReleaseStore, RollbackMarker, RollbackMarkerStore, RollbackStatus,
        UpdateConfig, UpdateConfigStore,
    };
    use tempfile::tempdir;

    #[test]
    fn active_release_round_trips() {
        let temp_dir = tempdir().unwrap();
        let store =
            ActiveReleaseStore::new(temp_dir.path().join("state").join("active-release.json"));
        let state = ActiveReleaseState {
            release_id: "2026.03.18-1".into(),
            channel: "stable".into(),
            launcher_version: "0.3.0".into(),
            backend_package_name: "codaro".into(),
            backend_version: "0.3.0".into(),
            backend_entry_module: "codaro.cli".into(),
            backend_console_script: "codaro".into(),
            frontend_version: "0.3.0".into(),
            installed_at_unix_seconds: 1234,
        };

        store.save(&state).unwrap();
        let loaded = store.load_optional().unwrap();

        assert_eq!(loaded, Some(state));
    }

    #[test]
    fn last_known_good_round_trips() {
        let temp_dir = tempdir().unwrap();
        let store = LastKnownGoodReleaseStore::new(
            temp_dir
                .path()
                .join("state")
                .join("last-known-good-release.json"),
        );
        let state = ActiveReleaseState {
            release_id: "2026.03.10-2".into(),
            channel: "stable".into(),
            launcher_version: "0.3.0".into(),
            backend_package_name: "codaro".into(),
            backend_version: "0.3.0".into(),
            backend_entry_module: "codaro.cli".into(),
            backend_console_script: "codaro".into(),
            frontend_version: "0.3.0".into(),
            installed_at_unix_seconds: 1234,
        };

        store.save(&state).unwrap();
        let loaded = store.load_optional().unwrap();

        assert_eq!(loaded, Some(state));
    }

    #[test]
    fn rollback_marker_round_trips() {
        let temp_dir = tempdir().unwrap();
        let store =
            RollbackMarkerStore::new(temp_dir.path().join("state").join("rollback-marker.json"));
        let mut marker = RollbackMarker::pending(
            "2026.03.18-1",
            Some("2026.03.10-2".into()),
            "health check failed",
        );
        marker.mark_rolled_back();

        store.save(&marker).unwrap();
        let loaded = store.load_optional().unwrap();

        assert_eq!(loaded, Some(marker));
        assert_eq!(loaded.unwrap().status, RollbackStatus::RolledBack);
    }

    #[test]
    fn update_config_round_trips() {
        let temp_dir = tempdir().unwrap();
        let store =
            UpdateConfigStore::new(temp_dir.path().join("state").join("update-config.json"));
        let config = UpdateConfig {
            channel: "beta".into(),
            auto_update_on_launch: true,
            manifest_source: Some("https://example.com/release-manifest.json".into()),
            github_repo: "eddmpython/codaro".into(),
            github_manifest_asset_name: "release-manifest.json".into(),
        };

        store.save(&config).unwrap();
        let loaded = store.load_optional().unwrap();

        assert_eq!(loaded, Some(config));
    }

    #[test]
    fn crash_state_freezes_after_threshold() {
        let first = CrashState::record(None, "2026.03.18-1", Some(1), "crash", 3, 60);
        let second =
            CrashState::record(Some(&first), "2026.03.18-1", Some(1), "crash again", 3, 60);
        let third =
            CrashState::record(Some(&second), "2026.03.18-1", Some(1), "crash again", 3, 60);

        assert_eq!(third.crash_count, 3);
        assert_eq!(third.status, CrashStatus::Frozen);
        assert!(third.is_frozen_for("2026.03.18-1"));
    }

    #[test]
    fn crash_state_resets_when_window_expires() {
        let expired = CrashState {
            release_id: "2026.03.18-1".into(),
            crash_count: 2,
            first_crash_unix_seconds: 0,
            last_crash_unix_seconds: 0,
            last_exit_code: Some(1),
            last_reason: "old crash".into(),
            status: CrashStatus::Tracking,
        };

        let next = CrashState::record(Some(&expired), "2026.03.18-1", Some(1), "fresh crash", 3, 1);

        assert_eq!(next.crash_count, 1);
        assert_eq!(next.status, CrashStatus::Tracking);
    }

    #[test]
    fn crash_state_store_round_trips() {
        let temp_dir = tempdir().unwrap();
        let store = CrashStateStore::new(temp_dir.path().join("state").join("crash-state.json"));
        let state = CrashState {
            release_id: "2026.03.18-1".into(),
            crash_count: 2,
            first_crash_unix_seconds: 100,
            last_crash_unix_seconds: 200,
            last_exit_code: Some(1),
            last_reason: "backend exited with status exit code: 1".into(),
            status: CrashStatus::Tracking,
        };

        store.save(&state).unwrap();
        let loaded = store.load_optional().unwrap();

        assert_eq!(loaded, Some(state));
    }
}
