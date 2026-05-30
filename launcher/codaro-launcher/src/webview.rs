use anyhow::{Context, Result};

/// 임베디드 네이티브 WebView2 창을 만들 수 없는 환경(또는 `--no-webview` 헤드리스/테스트 경로)에서
/// 백엔드 URL을 시스템 브라우저로 연다. 기본 launch 흐름은 `run_windowed`의 네이티브 창을 사용한다.
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
