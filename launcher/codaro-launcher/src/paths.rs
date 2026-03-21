use anyhow::{Context, Result, bail};
use directories::BaseDirs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct LauncherPaths {
    root: PathBuf,
}

impl LauncherPaths {
    pub fn discover(root_override: Option<PathBuf>) -> Result<Self> {
        if let Some(root) = root_override {
            return Ok(Self { root });
        }
        if let Ok(value) = std::env::var("CODARO_LAUNCHER_ROOT") {
            return Ok(Self {
                root: PathBuf::from(value),
            });
        }
        let base_dirs = BaseDirs::new().context("Failed to resolve local app data directory.")?;
        let data_dir = base_dirs.data_local_dir();
        if data_dir.as_os_str().is_empty() {
            bail!("Local app data directory is empty.");
        }
        Ok(Self {
            root: data_dir.join("Codaro"),
        })
    }

    pub fn ensure_layout(&self) -> Result<()> {
        for directory in [
            self.root().to_path_buf(),
            self.launcher_dir(),
            self.runtime_dir(),
            self.installs_dir(),
            self.downloads_dir(),
            self.logs_dir(),
            self.state_dir(),
        ] {
            std::fs::create_dir_all(&directory).with_context(|| {
                format!(
                    "Failed to create launcher directory `{}`.",
                    directory.display()
                )
            })?;
        }
        Ok(())
    }

    pub fn root(&self) -> &Path {
        &self.root
    }

    pub fn launcher_dir(&self) -> PathBuf {
        self.root.join("launcher")
    }

    pub fn runtime_dir(&self) -> PathBuf {
        self.root.join("runtime")
    }

    pub fn python_runtime_dir(&self) -> PathBuf {
        self.runtime_dir().join("python")
    }

    pub fn python_executable(&self) -> PathBuf {
        default_python_executable_path(&self.python_runtime_dir())
    }

    pub fn release_runtime_dir(&self, release_id: &str) -> PathBuf {
        self.release_dir(release_id).join("runtime")
    }

    pub fn release_python_runtime_dir(&self, release_id: &str) -> PathBuf {
        self.release_runtime_dir(release_id).join("python")
    }

    pub fn release_editor_dir(&self, release_id: &str) -> PathBuf {
        self.release_dir(release_id).join("editor").join("app")
    }

    pub fn resolve_python_executable(runtime_root: &Path) -> Result<PathBuf> {
        for candidate in python_executable_candidates(runtime_root) {
            if candidate.is_file() {
                return Ok(candidate);
            }
        }
        bail!(
            "No Python executable was found under `{}`.",
            runtime_root.display()
        );
    }

    pub fn installs_dir(&self) -> PathBuf {
        self.root.join("installs")
    }

    pub fn release_dir(&self, release_id: &str) -> PathBuf {
        self.installs_dir().join(release_id)
    }

    pub fn downloads_dir(&self) -> PathBuf {
        self.root.join("downloads")
    }

    pub fn logs_dir(&self) -> PathBuf {
        self.root.join("logs")
    }

    pub fn state_dir(&self) -> PathBuf {
        self.root.join("state")
    }
}

fn default_python_executable_path(runtime_root: &Path) -> PathBuf {
    python_executable_candidates(runtime_root)
        .into_iter()
        .next()
        .unwrap_or_else(|| runtime_root.join("python"))
}

fn python_executable_candidates(runtime_root: &Path) -> Vec<PathBuf> {
    if cfg!(windows) {
        return vec![
            runtime_root.join("python.exe"),
            runtime_root.join("python.bat"),
            runtime_root.join("python.cmd"),
        ];
    }
    vec![
        runtime_root.join("bin").join("python3"),
        runtime_root.join("bin").join("python"),
        runtime_root.join("python3"),
        runtime_root.join("python"),
    ]
}

#[cfg(test)]
mod tests {
    use super::LauncherPaths;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn ensure_layout_creates_expected_directories() {
        let temp_dir = tempdir().unwrap();
        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();

        paths.ensure_layout().unwrap();

        assert!(paths.runtime_dir().is_dir());
        assert!(paths.installs_dir().is_dir());
        assert!(paths.downloads_dir().is_dir());
        assert!(paths.logs_dir().is_dir());
        assert!(paths.state_dir().is_dir());
    }

    #[test]
    fn resolve_python_executable_accepts_wrapper_scripts() {
        let temp_dir = tempdir().unwrap();
        let runtime_dir = temp_dir.path().join("python");
        fs::create_dir_all(&runtime_dir).unwrap();

        let executable_path = if cfg!(windows) {
            let path = runtime_dir.join("python.cmd");
            fs::write(&path, "@echo off\r\n").unwrap();
            path
        } else {
            let path = runtime_dir.join("bin").join("python3");
            fs::create_dir_all(path.parent().unwrap()).unwrap();
            fs::write(&path, "#!/bin/sh\n").unwrap();
            path
        };

        let resolved = LauncherPaths::resolve_python_executable(&runtime_dir).unwrap();

        assert_eq!(resolved, executable_path);
    }
}
