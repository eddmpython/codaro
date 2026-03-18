use crate::paths::LauncherPaths;
use crate::state::ActiveReleaseState;
use anyhow::{Context, Result, bail};
use reqwest::blocking::Client;
use serde::Serialize;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::thread;
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct CommandPreview {
    pub program: String,
    pub args: Vec<String>,
    pub current_dir: String,
    pub python_path: String,
}

#[derive(Debug, Clone)]
pub struct BackendLaunchConfig {
    python_executable: PathBuf,
    backend_python_path: PathBuf,
    frontend_root: PathBuf,
    workspace_root: PathBuf,
    entry_module: String,
    host: String,
    port: u16,
}

impl BackendLaunchConfig {
    pub fn from_active_release(
        paths: &LauncherPaths,
        state: &ActiveReleaseState,
        host: String,
        port: u16,
        workspace_root: PathBuf,
    ) -> Result<Self> {
        let release_dir = paths.release_dir(&state.release_id);
        let python_runtime_dir = paths.release_python_runtime_dir(&state.release_id);
        Ok(Self {
            python_executable: LauncherPaths::resolve_python_executable(&python_runtime_dir)?,
            backend_python_path: release_dir.join("backend").join("site-packages"),
            frontend_root: paths.release_frontend_dir(&state.release_id),
            workspace_root,
            entry_module: state.backend_entry_module.clone(),
            host,
            port,
        })
    }

    pub fn spawn(&self) -> Result<Child> {
        let preview = self.command_preview();
        let mut command = Command::new(&self.python_executable);
        command.args(&preview.args);
        command.current_dir(&self.workspace_root);
        command.env("PYTHONPATH", &self.backend_python_path);
        command.env("CODARO_WEB_BUILD_ROOT", &self.frontend_root);
        command.stdin(Stdio::null());
        command.stdout(Stdio::inherit());
        command.stderr(Stdio::inherit());
        command.spawn().with_context(|| {
            format!(
                "Failed to spawn backend with `{}`.",
                self.python_executable.display()
            )
        })
    }

    pub fn health_url(&self) -> String {
        format!("http://{}:{}/api/health", self.host, self.port)
    }

    pub fn app_url(&self) -> String {
        format!("http://{}:{}/", self.host, self.port)
    }

    pub fn command_preview(&self) -> CommandPreview {
        CommandPreview {
            program: self.python_executable.display().to_string(),
            args: self.command_args(),
            current_dir: self.workspace_root.display().to_string(),
            python_path: self.backend_python_path.display().to_string(),
        }
    }

    fn command_args(&self) -> Vec<String> {
        vec![
            "-m".into(),
            self.entry_module.clone(),
            "edit".into(),
            "--host".into(),
            self.host.clone(),
            "--port".into(),
            self.port.to_string(),
            "--no-browser".into(),
        ]
    }
}

pub fn wait_for_health(url: &str, timeout: Duration) -> Result<()> {
    let client = build_healthcheck_client()?;
    wait_for_health_with_client(&client, url, timeout)
}

pub fn wait_for_backend_ready(child: &mut Child, url: &str, timeout: Duration) -> Result<()> {
    let client = build_healthcheck_client()?;
    let started_at = Instant::now();
    loop {
        if let Some(status) = child
            .try_wait()
            .context("Failed to poll backend child process.")?
        {
            bail!("Backend exited with status {status} before becoming healthy.");
        }
        if started_at.elapsed() > timeout {
            bail!("Health check timed out for `{url}`.");
        }
        if healthcheck_succeeds(&client, url) {
            return Ok(());
        }
        thread::sleep(Duration::from_millis(200));
    }
}

fn build_healthcheck_client() -> Result<Client> {
    Client::builder()
        .timeout(Duration::from_millis(500))
        .build()
        .context("Failed to build HTTP client for launcher health check.")
}

fn wait_for_health_with_client(client: &Client, url: &str, timeout: Duration) -> Result<()> {
    let started_at = Instant::now();
    loop {
        if started_at.elapsed() > timeout {
            bail!("Health check timed out for `{url}`.");
        }
        if healthcheck_succeeds(client, url) {
            return Ok(());
        }
        thread::sleep(Duration::from_millis(200));
    }
}

fn healthcheck_succeeds(client: &Client, url: &str) -> bool {
    if let Ok(response) = client.get(url).send() {
        return response.status().is_success();
    }
    false
}

#[cfg(test)]
mod tests {
    use super::{BackendLaunchConfig, wait_for_backend_ready, wait_for_health};
    use crate::paths::LauncherPaths;
    use crate::state::ActiveReleaseState;
    use std::fs;
    use std::io::{Read, Write};
    use std::net::TcpListener;
    use std::process::Command;
    use std::thread;
    use std::time::Duration;
    use tempfile::tempdir;

    #[test]
    fn launch_config_builds_expected_command() {
        let temp_dir = tempdir().unwrap();
        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();
        let runtime_dir = paths.release_python_runtime_dir("2026.03.18-1");
        fs::create_dir_all(&runtime_dir).unwrap();
        if cfg!(windows) {
            fs::write(runtime_dir.join("python.cmd"), "@echo off\r\n").unwrap();
        } else {
            fs::create_dir_all(runtime_dir.join("bin")).unwrap();
            fs::write(runtime_dir.join("bin").join("python3"), "#!/bin/sh\n").unwrap();
        }
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
        let config = BackendLaunchConfig::from_active_release(
            &paths,
            &state,
            "127.0.0.1".into(),
            8765,
            temp_dir.path().to_path_buf(),
        )
        .unwrap();

        let preview = config.command_preview();

        assert_eq!(
            preview.args,
            vec![
                "-m",
                "codaro.cli",
                "edit",
                "--host",
                "127.0.0.1",
                "--port",
                "8765",
                "--no-browser",
            ]
        );
        assert!(preview.python_path.contains("site-packages"));
        assert!(preview.program.contains("python"));
        assert!(
            preview
                .current_dir
                .contains(temp_dir.path().to_string_lossy().as_ref())
        );
    }

    #[test]
    fn health_check_succeeds_when_server_replies() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        let url = format!("http://{}/api/health", address);

        let handle = thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let mut buffer = [0_u8; 1024];
            let _ = stream.read(&mut buffer).unwrap();
            stream
                .write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 15\r\nContent-Type: application/json\r\n\r\n{\"status\":\"ok\"}")
                .unwrap();
        });

        wait_for_health(&url, Duration::from_secs(2)).unwrap();
        handle.join().unwrap();
    }

    #[test]
    fn wait_for_backend_ready_fails_when_process_exits_early() {
        let mut child = if cfg!(windows) {
            Command::new("cmd").args(["/C", "exit 1"]).spawn().unwrap()
        } else {
            Command::new("sh").args(["-c", "exit 1"]).spawn().unwrap()
        };

        let result = wait_for_backend_ready(
            &mut child,
            "http://127.0.0.1:9/api/health",
            Duration::from_secs(2),
        );

        assert!(result.is_err());
        assert!(
            result
                .unwrap_err()
                .to_string()
                .contains("before becoming healthy")
        );
    }
}
