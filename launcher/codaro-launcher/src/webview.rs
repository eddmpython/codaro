use anyhow::{Context, Result};
use std::path::Path;

#[derive(Debug, Clone)]
pub struct WebviewConfig {
    pub title: String,
    pub width: u32,
    pub height: u32,
    pub resizable: bool,
    pub url: String,
    pub init_script: Option<String>,
    pub data_dir: Option<std::path::PathBuf>,
}

impl Default for WebviewConfig {
    fn default() -> Self {
        Self {
            title: "Codaro".into(),
            width: 1280,
            height: 820,
            resizable: true,
            url: "http://127.0.0.1:8765".into(),
            init_script: None,
            data_dir: None,
        }
    }
}

impl WebviewConfig {
    pub fn with_url(mut self, url: &str) -> Self {
        self.url = url.into();
        self
    }

    pub fn with_title(mut self, title: &str) -> Self {
        self.title = title.into();
        self
    }

    pub fn with_size(mut self, width: u32, height: u32) -> Self {
        self.width = width;
        self.height = height;
        self
    }

    pub fn with_init_script(mut self, script: &str) -> Self {
        self.init_script = Some(script.into());
        self
    }

    pub fn with_data_dir(mut self, path: &Path) -> Self {
        self.data_dir = Some(path.into());
        self
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum WebviewBackend {
    Wry,
    SystemBrowser,
}

pub fn detect_webview_backend() -> WebviewBackend {
    if is_webview2_available() {
        WebviewBackend::Wry
    } else {
        WebviewBackend::SystemBrowser
    }
}

fn is_webview2_available() -> bool {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let check = Command::new("reg")
            .args([
                "query",
                r"HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}",
                "/v",
                "pv",
            ])
            .output();

        match check {
            Ok(output) => output.status.success(),
            Err(_) => false,
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        false
    }
}

pub fn open_in_system_browser(url: &str) -> Result<()> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/c", "start", "", url])
            .spawn()
            .context("failed to open browser")?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(url)
            .spawn()
            .context("failed to open browser")?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(url)
            .spawn()
            .context("failed to open browser")?;
    }

    Ok(())
}

pub fn build_loading_html(title: &str, status_message: &str) -> String {
    format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
    background: #09090b;
    color: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }}
  .container {{
    text-align: center;
    max-width: 400px;
    padding: 40px 24px;
  }}
  .title {{
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 16px;
  }}
  .status {{
    font-size: 14px;
    color: #a1a1aa;
    margin-bottom: 24px;
  }}
  .spinner {{
    width: 32px;
    height: 32px;
    border: 3px solid #27272a;
    border-top-color: #818cf8;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto;
  }}
  @keyframes spin {{
    to {{ transform: rotate(360deg); }}
  }}
  .error {{ display: none; color: #f87171; margin-top: 16px; font-size: 13px; }}
  .error.visible {{ display: block; }}
</style>
</head>
<body>
<div class="container">
  <div class="title">{title}</div>
  <div class="status" id="statusText">{status_message}</div>
  <div class="spinner" id="spinner"></div>
  <div class="error" id="errorText"></div>
</div>
<script>
  window.__CODARO_LAUNCHER__ = window.__CODARO_LAUNCHER__ || {{}};
  window.__CODARO_LAUNCHER__.setStatus = function(text) {{
    document.getElementById("statusText").textContent = text;
  }};
  window.__CODARO_LAUNCHER__.setError = function(text) {{
    var el = document.getElementById("errorText");
    el.textContent = text;
    el.classList.add("visible");
    document.getElementById("spinner").style.display = "none";
  }};
  window.__CODARO_LAUNCHER__.navigate = function(url) {{
    window.location.href = url;
  }};
</script>
</body>
</html>"#,
        title = title,
        status_message = status_message,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let cfg = WebviewConfig::default();
        assert_eq!(cfg.title, "Codaro");
        assert_eq!(cfg.width, 1280);
        assert_eq!(cfg.height, 820);
        assert!(cfg.resizable);
        assert!(cfg.url.contains("8765"));
    }

    #[test]
    fn test_config_builder() {
        let cfg = WebviewConfig::default()
            .with_url("http://localhost:9000")
            .with_title("Test")
            .with_size(800, 600);
        assert_eq!(cfg.url, "http://localhost:9000");
        assert_eq!(cfg.title, "Test");
        assert_eq!(cfg.width, 800);
    }

    #[test]
    fn test_detect_backend() {
        let backend = detect_webview_backend();
        assert!(
            backend == WebviewBackend::Wry || backend == WebviewBackend::SystemBrowser
        );
    }

    #[test]
    fn test_loading_html() {
        let html = build_loading_html("Codaro", "Starting server...");
        assert!(html.contains("Codaro"));
        assert!(html.contains("Starting server..."));
        assert!(html.contains("__CODARO_LAUNCHER__"));
    }
}
