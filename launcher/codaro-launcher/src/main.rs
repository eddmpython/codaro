#![cfg_attr(all(target_os = "windows", not(test)), windows_subsystem = "windows")]

mod backend;
mod github;
mod ipc;
mod manifest;
mod paths;
mod provision;
mod self_update;
mod state;
mod webview;

use anyhow::{Context, Result, bail};
use backend::{BackendLaunchConfig, wait_for_backend_ready, wait_for_health};
use clap::{Args, Parser, Subcommand};
use github::{GitHubManifestDiscovery, discover_manifest_for_repo};
use paths::LauncherPaths;
use provision::{activate_release, load_manifest_from_source, stage_release};
use self_update::{apply_self_update, check_launcher_update, download_launcher_update};
use serde::Serialize;
use state::{
    ActiveReleaseState, ActiveReleaseStore, CrashState, CrashStateStore, CrashStatus,
    LastKnownGoodReleaseStore, RollbackMarker, RollbackMarkerStore, UpdateConfig,
    UpdateConfigStore,
};
use std::net::TcpListener;
use std::path::PathBuf;
use std::process::Child;
use std::time::Duration;

const LAUNCHER_VERSION: &str = env!("CARGO_PKG_VERSION");
const BACKEND_CRASH_RESTART_LIMIT: u32 = 3;
const BACKEND_CRASH_WINDOW: Duration = Duration::from_secs(60);
const BACKEND_RESTART_DELAY: Duration = Duration::from_millis(750);

#[derive(Parser, Debug)]
#[command(name = "codaro-launcher")]
#[command(about = "Codaro launcher bootstrap and runtime supervisor")]
struct Cli {
    #[arg(long)]
    root: Option<PathBuf>,
    // dartlab-desktop 런처처럼 서브커맨드는 선택이다. 인자 없이 실행(탐색기 더블클릭)하면
    // None이 되어 네이티브 창을 바로 띄운다. 서브커맨드는 디버그·운영 경로 전용.
    #[command(subcommand)]
    command: Option<Command>,
}

#[derive(Subcommand, Debug)]
enum Command {
    Doctor,
    Launch(LaunchArgs),
    Manifest(ManifestCommand),
    State(StateCommand),
    Release(ReleaseCommand),
    Update(UpdateCommand),
    SelfUpdate(SelfUpdateCommand),
    Backend(BackendCommand),
}

#[derive(Args, Debug)]
struct LaunchArgs {
    #[arg(long, default_value = "127.0.0.1")]
    host: String,
    #[arg(long, default_value_t = 0)]
    port: u16,
    #[arg(long)]
    no_webview: bool,
    #[arg(long)]
    workspace_root: Option<PathBuf>,
    path: Option<PathBuf>,
}

impl Default for LaunchArgs {
    // clap의 default_value는 파싱 시점에만 적용되므로, 더블클릭(no-arg) 경로에서 쓸
    // 기본값을 명시한다. host/port는 run_windowed가 자동 포트로 백엔드를 띄우는 값과 동일.
    fn default() -> Self {
        Self {
            host: "127.0.0.1".to_string(),
            port: 0,
            no_webview: false,
            workspace_root: None,
            path: None,
        }
    }
}

#[derive(Args, Debug)]
struct ManifestCommand {
    #[command(subcommand)]
    command: ManifestSubcommand,
}

#[derive(Subcommand, Debug)]
enum ManifestSubcommand {
    Inspect { source: String },
}

#[derive(Args, Debug)]
struct StateCommand {
    #[command(subcommand)]
    command: StateSubcommand,
}

#[derive(Subcommand, Debug)]
enum StateSubcommand {
    Show,
    Activate { manifest: PathBuf },
}

#[derive(Args, Debug)]
struct ReleaseCommand {
    #[command(subcommand)]
    command: ReleaseSubcommand,
}

#[derive(Subcommand, Debug)]
enum ReleaseSubcommand {
    Stage {
        manifest: String,
        #[arg(long)]
        activate: bool,
    },
    Activate {
        release_id: String,
    },
}

#[derive(Args, Debug)]
struct UpdateCommand {
    #[command(subcommand)]
    command: UpdateSubcommand,
}

#[derive(Subcommand, Debug)]
enum UpdateSubcommand {
    Check { manifest: Option<String> },
    Apply(UpdateApplyArgs),
    Sync(UpdateSyncArgs),
    Config(UpdateConfigCommand),
}

#[derive(Args, Debug)]
struct UpdateConfigCommand {
    #[command(subcommand)]
    command: UpdateConfigSubcommand,
}

#[derive(Subcommand, Debug)]
enum UpdateConfigSubcommand {
    Show,
    Set(UpdateConfigSetArgs),
}

#[derive(Args, Debug)]
struct BackendCommand {
    #[command(subcommand)]
    command: BackendSubcommand,
}

#[derive(Subcommand, Debug)]
enum BackendSubcommand {
    LaunchActive(LaunchActiveArgs),
    Healthcheck(HealthcheckArgs),
}

#[derive(Args, Debug)]
struct LaunchActiveArgs {
    #[arg(long, default_value = "127.0.0.1")]
    host: String,
    #[arg(long, default_value_t = 8765)]
    port: u16,
    #[arg(long)]
    sync_updates: bool,
    #[arg(long)]
    workspace_root: Option<PathBuf>,
    #[arg(long)]
    dry_run: bool,
}

#[derive(Args, Debug)]
struct HealthcheckArgs {
    #[arg(long)]
    url: String,
    #[arg(long, default_value_t = 10_000)]
    timeout_ms: u64,
}

#[derive(Args, Debug)]
struct UpdateApplyArgs {
    manifest: Option<String>,
    #[arg(long, default_value = "127.0.0.1")]
    host: String,
    #[arg(long)]
    port: Option<u16>,
    #[arg(long)]
    workspace_root: Option<PathBuf>,
}

#[derive(Args, Debug, Clone)]
struct UpdateSyncArgs {
    manifest: Option<String>,
    #[arg(long, default_value = "127.0.0.1")]
    host: String,
    #[arg(long)]
    port: Option<u16>,
    #[arg(long)]
    workspace_root: Option<PathBuf>,
}

#[derive(Args, Debug)]
struct UpdateConfigSetArgs {
    #[arg(long)]
    channel: Option<String>,
    #[arg(long)]
    auto_update_on_launch: Option<bool>,
    #[arg(long)]
    manifest_source: Option<String>,
    #[arg(long)]
    clear_manifest_source: bool,
    #[arg(long)]
    github_repo: Option<String>,
    #[arg(long)]
    manifest_asset_name: Option<String>,
}

#[derive(Args, Debug)]
struct SelfUpdateCommand {
    #[command(subcommand)]
    command: SelfUpdateSubcommand,
}

#[derive(Subcommand, Debug)]
enum SelfUpdateSubcommand {
    Check(SelfUpdateCheckArgs),
    Download(SelfUpdateDownloadArgs),
    Apply(SelfUpdateApplyArgs),
}

#[derive(Args, Debug)]
struct SelfUpdateCheckArgs {
    #[arg(long, default_value = "eddmpython/codaro")]
    repo: String,
    #[arg(long)]
    include_prerelease: bool,
}

#[derive(Args, Debug)]
struct SelfUpdateDownloadArgs {
    #[arg(long, default_value = "eddmpython/codaro")]
    repo: String,
    #[arg(long)]
    include_prerelease: bool,
    #[arg(long)]
    download_dir: Option<PathBuf>,
}

#[derive(Args, Debug)]
struct SelfUpdateApplyArgs {
    downloaded: PathBuf,
    #[arg(long)]
    current_exe: Option<PathBuf>,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
struct UpdateCheckReport {
    manifest_source: String,
    source_kind: String,
    release_id: String,
    channel: String,
    launcher_version: String,
    min_launcher_version: String,
    active_release_id: Option<String>,
    staged: bool,
    update_available: bool,
    compatible: bool,
    reason: Option<String>,
    github_release_tag: Option<String>,
    github_release_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
struct UpdateApplyReport {
    manifest_source: String,
    source_kind: String,
    release_id: String,
    activated: bool,
    staged_now: bool,
    probe_port: u16,
    previous_active_release_id: Option<String>,
    health_url: String,
    app_url: String,
    github_release_tag: Option<String>,
    github_release_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
struct UpdateSyncReport {
    checked: UpdateCheckReport,
    applied: Option<UpdateApplyReport>,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
struct ResolvedManifestSource {
    manifest_source: String,
    source_kind: String,
    github_release_tag: Option<String>,
    github_release_url: Option<String>,
}

struct LauncherStateStores {
    active_release: ActiveReleaseStore,
    last_known_good_release: LastKnownGoodReleaseStore,
    crash_state: CrashStateStore,
    rollback_marker: RollbackMarkerStore,
    update_config: UpdateConfigStore,
}

impl LauncherStateStores {
    fn new(paths: &LauncherPaths) -> Self {
        Self {
            active_release: ActiveReleaseStore::new(paths.state_dir().join("active-release.json")),
            last_known_good_release: LastKnownGoodReleaseStore::new(
                paths.state_dir().join("last-known-good-release.json"),
            ),
            crash_state: CrashStateStore::new(paths.state_dir().join("crash-state.json")),
            rollback_marker: RollbackMarkerStore::new(
                paths.state_dir().join("rollback-marker.json"),
            ),
            update_config: UpdateConfigStore::new(paths.state_dir().join("update-config.json")),
        }
    }
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    let paths = LauncherPaths::discover(cli.root)?;
    paths.ensure_layout()?;

    match cli.command {
        // 인자 없이 실행 = 탐색기 더블클릭. dartlab처럼 바로 네이티브 창을 띄운다.
        None => run_launch(&paths, LaunchArgs::default())?,
        Some(Command::Doctor) => run_doctor(&paths)?,
        Some(Command::Launch(args)) => run_launch(&paths, args)?,
        Some(Command::Manifest(command)) => run_manifest(command)?,
        Some(Command::State(command)) => run_state(&paths, command)?,
        Some(Command::Release(command)) => run_release(&paths, command)?,
        Some(Command::Update(command)) => run_update(&paths, command)?,
        Some(Command::SelfUpdate(command)) => run_self_update(&paths, command)?,
        Some(Command::Backend(command)) => run_backend(&paths, command)?,
    }

    Ok(())
}

fn provision_and_spawn(paths: &LauncherPaths, args: &LaunchArgs) -> Result<(Child, String)> {
    use ipc::{ErrorPayload, IpcMessage, LaunchStatus, ProgressPayload, StatusPayload, encode_ipc};

    let stores = LauncherStateStores::new(paths);
    let active = stores.active_release.load_optional()?;

    println!(
        "{}",
        encode_ipc(&IpcMessage::SetStatus(StatusPayload {
            status: LaunchStatus::Initializing,
            url: None,
        }))
    );

    if active.is_none() {
        println!(
            "{}",
            encode_ipc(&IpcMessage::SetProgress(ProgressPayload {
                stage: "provision".into(),
                message: "No active release. Checking for updates...".into(),
                percent: None,
            }))
        );
        let update_config = load_update_config(&stores)?;
        let source = update_config
            .manifest_source
            .as_deref()
            .map(|s| s.to_string());

        if source.is_none() {
            println!(
                "{}",
                encode_ipc(&IpcMessage::SetProgress(ProgressPayload {
                    stage: "provision".into(),
                    message: "Discovering release from GitHub...".into(),
                    percent: Some(10.0),
                }))
            );
            let found = discover_manifest_for_repo(
                &update_config.github_repo,
                &update_config.github_manifest_asset_name,
                update_config.allows_prerelease(),
                LAUNCHER_VERSION,
            )?;
            println!(
                "{}",
                encode_ipc(&IpcMessage::SetProgress(ProgressPayload {
                    stage: "provision".into(),
                    message: format!("Staging release {}...", found.release_tag),
                    percent: Some(30.0),
                }))
            );
            let summary = stage_release(paths, &found.manifest_source)?;
            activate_release(paths, &summary.release_id)?;
        } else if let Some(manifest_source) = source {
            let summary = stage_release(paths, &manifest_source)?;
            activate_release(paths, &summary.release_id)?;
        }
    } else {
        let update_config = load_update_config(&stores)?;
        if update_config.auto_update_on_launch {
            println!(
                "{}",
                encode_ipc(&IpcMessage::SetProgress(ProgressPayload {
                    stage: "update".into(),
                    message: "Checking for release updates...".into(),
                    percent: Some(5.0),
                }))
            );
            match sync_updates(
                paths,
                UpdateSyncArgs {
                    manifest: None,
                    host: args.host.clone(),
                    port: launch_probe_port(args.port),
                    workspace_root: args.workspace_root.clone(),
                },
            ) {
                Ok(report) => {
                    let message = match report.applied {
                        Some(applied) => format!("Activated release {}.", applied.release_id),
                        None if report.checked.update_available => {
                            format!("Release {} is already staged.", report.checked.release_id)
                        }
                        None => "No release update available.".into(),
                    };
                    println!(
                        "{}",
                        encode_ipc(&IpcMessage::SetProgress(ProgressPayload {
                            stage: "update".into(),
                            message,
                            percent: Some(100.0),
                        }))
                    );
                }
                Err(error) => {
                    eprintln!(
                        "Codaro auto-update check failed; continuing with active release: {error:#}"
                    );
                    println!(
                        "{}",
                        encode_ipc(&IpcMessage::SetProgress(ProgressPayload {
                            stage: "update".into(),
                            message: "Update check failed. Continuing with active release.".into(),
                            percent: Some(100.0),
                        }))
                    );
                }
            }
        }
    }

    let active = stores
        .active_release
        .load_optional()?
        .context("no active release after provision")?;

    let port = if args.port == 0 {
        let listener = TcpListener::bind("127.0.0.1:0")?;
        listener.local_addr()?.port()
    } else {
        args.port
    };

    println!(
        "{}",
        encode_ipc(&IpcMessage::SetStatus(StatusPayload {
            status: LaunchStatus::Starting,
            url: None,
        }))
    );

    let workspace_root = args
        .workspace_root
        .clone()
        .unwrap_or(std::env::current_dir().context("Failed to resolve current directory.")?);
    let config = BackendLaunchConfig::from_active_release(
        paths,
        &active,
        args.host.clone(),
        port,
        workspace_root,
    )?;

    let mut child = config.spawn()?;
    let url = config.app_url();
    let health_url = config.health_url();

    match wait_for_backend_ready(&mut child, &health_url, Duration::from_secs(30)) {
        Ok(()) => {
            println!(
                "{}",
                encode_ipc(&IpcMessage::SetStatus(StatusPayload {
                    status: LaunchStatus::Healthy,
                    url: Some(url.clone()),
                }))
            );
        }
        Err(err) => {
            let _ = child.kill();
            println!(
                "{}",
                encode_ipc(&IpcMessage::SetError(ErrorPayload {
                    code: "HEALTH_TIMEOUT".into(),
                    message: "Backend failed to become healthy.".into(),
                    detail: Some(format!("{}", err)),
                    recoverable: false,
                }))
            );
            bail!("Backend health check failed: {}", err);
        }
    }

    Ok((child, url))
}

fn run_launch(paths: &LauncherPaths, args: LaunchArgs) -> Result<()> {
    use webview::open_in_system_browser;
    // --no-webview: 헤드리스/CLI/스모크 경로. 네이티브 창 없이 백엔드를 띄우고 시스템 브라우저로 연다.
    if args.no_webview {
        let (mut child, url) = provision_and_spawn(paths, &args)?;
        open_in_system_browser(&url)?;
        let _ = child.wait();
        return Ok(());
    }
    // 기본: 임베디드 WebView2 네이티브 창에서 UI를 띄운다(브라우저 탭이 아니라 런처 자체 창).
    run_windowed(paths, args)
}

fn run_windowed(paths: &LauncherPaths, args: LaunchArgs) -> Result<()> {
    use std::sync::{Arc, Mutex};
    use tao::dpi::{LogicalPosition, LogicalSize};
    use tao::event::{Event, WindowEvent};
    use tao::event_loop::{ControlFlow, EventLoopBuilder};
    use tao::window::WindowBuilder;
    use wry::{Rect, WebViewBuilder};

    hide_console_window();

    let event_loop = EventLoopBuilder::<AppEvent>::with_user_event().build();

    let mut window_builder = WindowBuilder::new()
        .with_title("Codaro")
        .with_inner_size(LogicalSize::new(1280.0, 860.0))
        .with_min_inner_size(LogicalSize::new(900.0, 640.0));
    if let Some(icon) = load_window_icon() {
        window_builder = window_builder.with_window_icon(Some(icon));
    }
    let window = window_builder
        .build(&event_loop)
        .context("failed to create launcher window")?;

    let mut web_ctx = wry::WebContext::new(Some(paths.root().join("webview2")));
    let launch_html = LAUNCH_HTML.replace("{{AVATAR_SRC}}", &avatar_data_uri());
    let webview = WebViewBuilder::with_web_context(&mut web_ctx)
        .with_background_color((9, 9, 11, 255))
        .with_html(launch_html)
        .build(&window)
        .context("failed to create webview")?;

    let child_slot: Arc<Mutex<Option<Child>>> = Arc::new(Mutex::new(None));

    {
        let setup_paths = paths.clone();
        let setup_proxy = event_loop.create_proxy();
        let setup_child = child_slot.clone();
        std::thread::spawn(move || match provision_and_spawn(&setup_paths, &args) {
            Ok((child, url)) => {
                if let Ok(mut slot) = setup_child.lock() {
                    *slot = Some(child);
                }
                let _ = setup_proxy.send_event(AppEvent::Ready(url));
            }
            Err(err) => {
                let _ = setup_proxy.send_event(AppEvent::Fail(format!("{err:#}")));
            }
        });
    }

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;
        match event {
            Event::UserEvent(AppEvent::Ready(url)) => {
                let _ = webview.load_url(&url);
                window.set_focus();
            }
            Event::UserEvent(AppEvent::Fail(msg)) => {
                let escaped = msg
                    .replace('\\', "\\\\")
                    .replace('\'', "\\'")
                    .replace('\n', "\\n");
                let _ = webview.evaluate_script(&format!("setError('{escaped}')"));
            }
            Event::WindowEvent {
                event: WindowEvent::Resized(size),
                ..
            } => {
                let _ = webview.set_bounds(Rect {
                    position: LogicalPosition::new(0, 0).into(),
                    size: LogicalSize::new(size.width, size.height).into(),
                });
            }
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            } => {
                if let Ok(mut slot) = child_slot.lock() {
                    if let Some(mut child) = slot.take() {
                        let _ = child.kill();
                    }
                }
                *control_flow = ControlFlow::Exit;
            }
            _ => {}
        }
    });
}

#[derive(Debug)]
enum AppEvent {
    Ready(String),
    Fail(String),
}

fn hide_console_window() {
    #[cfg(target_os = "windows")]
    unsafe {
        use windows_sys::Win32::System::Console::GetConsoleWindow;
        use windows_sys::Win32::UI::WindowsAndMessaging::{SW_HIDE, ShowWindow};
        let hwnd = GetConsoleWindow();
        if !hwnd.is_null() {
            ShowWindow(hwnd, SW_HIDE);
        }
    }
}

// 창/태스크바 아이콘으로 쓰는 Codaro 아바타(256x256 RGBA PNG). exe 파일 아이콘은 build.rs가
// 별도로 ICO를 굽고, 여기서는 실행 중 창에 보이는 아이콘을 설정한다.
const ICON_PNG: &[u8] = include_bytes!("../assets/codaro-icon.png");

// 로딩 화면(LAUNCH_HTML)에 브랜드 마스코트를 띄우려고 임베디드 PNG를 base64 data URI로 만든다.
// 로딩 화면은 네트워크/프로비저닝 전에 보이므로 원격 URL이 아니라 임베드 바이트를 쓴다.
fn avatar_data_uri() -> String {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let data = ICON_PNG;
    let mut out = String::with_capacity(data.len().div_ceil(3) * 4 + 24);
    out.push_str("data:image/png;base64,");
    for chunk in data.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = *chunk.get(1).unwrap_or(&0) as u32;
        let b2 = *chunk.get(2).unwrap_or(&0) as u32;
        let triple = (b0 << 16) | (b1 << 8) | b2;
        out.push(TABLE[((triple >> 18) & 0x3f) as usize] as char);
        out.push(TABLE[((triple >> 12) & 0x3f) as usize] as char);
        out.push(if chunk.len() > 1 {
            TABLE[((triple >> 6) & 0x3f) as usize] as char
        } else {
            '='
        });
        out.push(if chunk.len() > 2 {
            TABLE[(triple & 0x3f) as usize] as char
        } else {
            '='
        });
    }
    out
}

fn load_window_icon() -> Option<tao::window::Icon> {
    let decoder = png::Decoder::new(ICON_PNG);
    let mut reader = decoder.read_info().ok()?;
    if reader.info().color_type != png::ColorType::Rgba
        || reader.info().bit_depth != png::BitDepth::Eight
    {
        return None;
    }
    let mut buffer = vec![0u8; reader.output_buffer_size()];
    let frame = reader.next_frame(&mut buffer).ok()?;
    buffer.truncate(frame.buffer_size());
    tao::window::Icon::from_rgba(buffer, frame.width, frame.height).ok()
}

const LAUNCH_HTML: &str = r##"<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body { font-family: 'Segoe UI', -apple-system, sans-serif; background: #09090b; color: #fafafa;
    display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 18px; user-select: none; }
  .avatarWrap { position: relative; width: 148px; height: 148px; margin-bottom: 4px;
    opacity: 0; animation: fadeIn 0.5s 0.15s forwards; }
  .avatarWrap::before { content: ''; position: absolute; inset: -16px; border-radius: 50%;
    background: radial-gradient(circle, rgba(251,146,60,0.32) 0%, rgba(245,158,11,0.12) 52%, transparent 72%);
    filter: blur(18px); animation: pulse 3s ease-in-out infinite; }
  .avatar { position: relative; width: 100%; height: 100%; object-fit: contain;
    filter: drop-shadow(0 6px 22px rgba(0,0,0,0.45)); }
  .logo { font-size: 40px; font-weight: 800; letter-spacing: -1.5px; }
  .spinner { width: 32px; height: 32px; border: 3px solid #27272a; border-top-color: #a1a1aa;
    border-radius: 50%; animation: spin 0.9s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
  @keyframes fadeIn { to { opacity: 1; } }
  .status { color: #a1a1aa; font-size: 14px; text-align: center; padding: 0 24px; }
  .err { display: none; max-width: 580px; text-align: center; color: #fca5a5; font-size: 13px;
    line-height: 1.7; white-space: pre-wrap; padding: 0 28px; }
  .err.show { display: block; }
  .hide { display: none !important; }
</style></head><body>
  <div class="avatarWrap"><img class="avatar" src="{{AVATAR_SRC}}" alt="Codaro"></div>
  <div class="logo">Codaro</div>
  <div id="spin" class="spinner"></div>
  <div id="status" class="status">준비 중 — Python 런타임과 커리큘럼을 설치하고 있어요…<br>처음 실행은 다운로드 때문에 잠시 걸릴 수 있어요.</div>
  <div id="err" class="err"></div>
  <script>
    function setError(msg) {
      document.getElementById('spin').classList.add('hide');
      document.getElementById('status').classList.add('hide');
      var e = document.getElementById('err');
      e.textContent = '문제가 발생했어요:\n\n' + msg;
      e.classList.add('show');
    }
  </script>
</body></html>
"##;

fn launch_probe_port(port: u16) -> Option<u16> {
    if port == 0 { None } else { Some(port) }
}

fn run_doctor(paths: &LauncherPaths) -> Result<()> {
    let stores = LauncherStateStores::new(paths);
    let active_release = stores.active_release.load_optional()?;
    let update_config = load_update_config(&stores)?;
    let active_python_executable = active_release.as_ref().and_then(|state| {
        LauncherPaths::resolve_python_executable(
            &paths.release_python_runtime_dir(&state.release_id),
        )
        .ok()
        .map(|path| path.display().to_string())
    });
    let payload = serde_json::json!({
        "appRoot": paths.root(),
        "launcherVersion": LAUNCHER_VERSION,
        "runtimeDir": paths.runtime_dir(),
        "sharedPythonExecutableHint": paths.python_executable(),
        "activePythonExecutable": active_python_executable,
        "installsDir": paths.installs_dir(),
        "downloadsDir": paths.downloads_dir(),
        "logsDir": paths.logs_dir(),
        "stateDir": paths.state_dir(),
        "activeRelease": active_release,
        "lastKnownGoodRelease": stores.last_known_good_release.load_optional()?,
        "crashState": stores.crash_state.load_optional()?,
        "rollbackMarker": stores.rollback_marker.load_optional()?,
        "updateConfig": update_config,
    });
    println!("{}", serde_json::to_string_pretty(&payload)?);
    Ok(())
}

fn run_manifest(command: ManifestCommand) -> Result<()> {
    match command.command {
        ManifestSubcommand::Inspect { source } => {
            let manifest = load_manifest_from_source(&source)?;
            println!("{}", serde_json::to_string_pretty(&manifest)?);
        }
    }
    Ok(())
}

fn run_state(paths: &LauncherPaths, command: StateCommand) -> Result<()> {
    let stores = LauncherStateStores::new(paths);
    match command.command {
        StateSubcommand::Show => {
            let update_config = load_update_config(&stores)?;
            let payload = serde_json::json!({
                "activeRelease": stores.active_release.load_optional()?,
                "lastKnownGoodRelease": stores.last_known_good_release.load_optional()?,
                "crashState": stores.crash_state.load_optional()?,
                "rollbackMarker": stores.rollback_marker.load_optional()?,
                "updateConfig": update_config,
            });
            println!("{}", serde_json::to_string_pretty(&payload)?);
        }
        StateSubcommand::Activate { manifest } => {
            let manifest = load_manifest_from_source(
                manifest
                    .to_str()
                    .context("Manifest path is not valid UTF-8.")?,
            )?;
            let state = ActiveReleaseState::from_manifest(&manifest);
            stores.active_release.save(&state)?;
            stores.crash_state.clear()?;
            println!("{}", serde_json::to_string_pretty(&state)?);
        }
    }
    Ok(())
}

fn run_release(paths: &LauncherPaths, command: ReleaseCommand) -> Result<()> {
    let stores = LauncherStateStores::new(paths);
    match command.command {
        ReleaseSubcommand::Stage { manifest, activate } => {
            let summary = stage_release(paths, &manifest)?;
            println!("{}", serde_json::to_string_pretty(&summary)?);
            if activate {
                let state = activate_release(paths, &summary.release_id)?;
                stores.crash_state.clear()?;
                println!("{}", serde_json::to_string_pretty(&state)?);
            }
        }
        ReleaseSubcommand::Activate { release_id } => {
            let state = activate_release(paths, &release_id)?;
            stores.crash_state.clear()?;
            println!("{}", serde_json::to_string_pretty(&state)?);
        }
    }
    Ok(())
}

fn run_backend(paths: &LauncherPaths, command: BackendCommand) -> Result<()> {
    match command.command {
        BackendSubcommand::LaunchActive(args) => launch_active_backend(paths, args),
        BackendSubcommand::Healthcheck(args) => {
            wait_for_health(&args.url, Duration::from_millis(args.timeout_ms))?;
            println!("{}", serde_json::json!({ "status": "ok", "url": args.url }));
            Ok(())
        }
    }
}

fn run_update(paths: &LauncherPaths, command: UpdateCommand) -> Result<()> {
    match command.command {
        UpdateSubcommand::Check { manifest } => {
            let report = check_update(paths, manifest.as_deref())?;
            println!("{}", serde_json::to_string_pretty(&report)?);
        }
        UpdateSubcommand::Apply(args) => {
            let report = apply_update(paths, args)?;
            println!("{}", serde_json::to_string_pretty(&report)?);
        }
        UpdateSubcommand::Sync(args) => {
            let report = sync_updates(paths, args)?;
            println!("{}", serde_json::to_string_pretty(&report)?);
        }
        UpdateSubcommand::Config(command) => run_update_config(paths, command)?,
    }
    Ok(())
}

fn run_update_config(paths: &LauncherPaths, command: UpdateConfigCommand) -> Result<()> {
    let stores = LauncherStateStores::new(paths);
    match command.command {
        UpdateConfigSubcommand::Show => {
            let config = load_update_config(&stores)?;
            println!("{}", serde_json::to_string_pretty(&config)?);
        }
        UpdateConfigSubcommand::Set(args) => {
            let config = set_update_config(&stores, args)?;
            println!("{}", serde_json::to_string_pretty(&config)?);
        }
    }
    Ok(())
}

fn run_self_update(paths: &LauncherPaths, command: SelfUpdateCommand) -> Result<()> {
    match command.command {
        SelfUpdateSubcommand::Check(args) => {
            let release =
                check_launcher_update(&args.repo, LAUNCHER_VERSION, args.include_prerelease)?;
            println!(
                "{}",
                serde_json::to_string_pretty(&serde_json::json!({
                    "currentVersion": LAUNCHER_VERSION,
                    "updateAvailable": release.is_some(),
                    "release": release.map(|release| serde_json::json!({
                        "version": release.version,
                        "downloadUrl": release.download_url,
                        "sha256": release.sha256,
                        "releaseNotes": release.release_notes,
                    })),
                }))?
            );
        }
        SelfUpdateSubcommand::Download(args) => {
            let release =
                check_launcher_update(&args.repo, LAUNCHER_VERSION, args.include_prerelease)?
                    .context("No launcher update is available.")?;
            let download_dir = args
                .download_dir
                .unwrap_or_else(|| paths.downloads_dir().join("launcher"));
            let result = download_launcher_update(&release, &download_dir)?;
            println!(
                "{}",
                serde_json::to_string_pretty(&serde_json::json!({
                    "fromVersion": result.from_version,
                    "toVersion": result.to_version,
                    "downloadedPath": result.downloaded_path,
                    "verified": result.verified,
                }))?
            );
        }
        SelfUpdateSubcommand::Apply(args) => {
            let current_exe = args.current_exe.unwrap_or(
                std::env::current_exe()
                    .context("Failed to resolve current launcher executable.")?,
            );
            let backup = apply_self_update(&args.downloaded, &current_exe)?;
            println!(
                "{}",
                serde_json::to_string_pretty(&serde_json::json!({
                    "currentExe": current_exe,
                    "downloaded": args.downloaded,
                    "backup": backup,
                }))?
            );
        }
    }
    Ok(())
}

fn launch_active_backend(paths: &LauncherPaths, args: LaunchActiveArgs) -> Result<()> {
    let stores = LauncherStateStores::new(paths);
    let update_config = load_update_config(&stores)?;
    if args.sync_updates {
        let _report = sync_updates(
            paths,
            UpdateSyncArgs {
                manifest: None,
                host: args.host.clone(),
                port: Some(args.port),
                workspace_root: args.workspace_root.clone(),
            },
        )?;
    } else if update_config.auto_update_on_launch {
        if let Err(error) = sync_updates(
            paths,
            UpdateSyncArgs {
                manifest: None,
                host: args.host.clone(),
                port: Some(args.port),
                workspace_root: args.workspace_root.clone(),
            },
        ) {
            eprintln!("Codaro auto-update check failed; continuing with active release: {error:#}");
        }
    }
    let state = stores
        .active_release
        .load_optional()?
        .context("No active release is recorded. Run `state activate` first.")?;

    let workspace_root = args
        .workspace_root
        .unwrap_or(std::env::current_dir().context("Failed to resolve current directory.")?);
    if !args.dry_run
        && guard_against_frozen_release(
            paths,
            &stores,
            &state,
            &args.host,
            args.port,
            workspace_root.as_path(),
        )?
    {
        return Ok(());
    }
    let config = BackendLaunchConfig::from_active_release(
        paths,
        &state,
        args.host.clone(),
        args.port,
        workspace_root.clone(),
    )?;

    if args.dry_run {
        println!(
            "{}",
            serde_json::to_string_pretty(&config.command_preview())?
        );
        return Ok(());
    }

    match start_backend_for_state(
        paths,
        &state,
        &args.host,
        args.port,
        workspace_root.as_path(),
    ) {
        Ok((config, child)) => {
            stores.last_known_good_release.save(&state)?;
            supervise_backend_runtime(
                paths,
                &stores,
                &state,
                &args.host,
                args.port,
                workspace_root.as_path(),
                config,
                child,
                None,
            )
        }
        Err(error) => recover_backend_with_rollback(
            paths,
            &stores,
            &state,
            &args.host,
            args.port,
            workspace_root.as_path(),
            error,
        ),
    }
}

fn check_update(
    paths: &LauncherPaths,
    manifest_override: Option<&str>,
) -> Result<UpdateCheckReport> {
    let stores = LauncherStateStores::new(paths);
    let update_config = load_update_config(&stores)?;
    let resolved = resolve_manifest_source(&update_config, manifest_override)?;
    evaluate_update(paths, &stores, &resolved)
}

fn evaluate_update(
    paths: &LauncherPaths,
    stores: &LauncherStateStores,
    resolved: &ResolvedManifestSource,
) -> Result<UpdateCheckReport> {
    let manifest = load_manifest_from_source(&resolved.manifest_source)?;
    let compatibility_error = manifest
        .ensure_launcher_compatibility(LAUNCHER_VERSION)
        .err()
        .map(|error| error.to_string());
    let active_release = stores.active_release.load_optional()?;
    let active_release_id = active_release
        .as_ref()
        .map(|state| state.release_id.clone());
    let staged = paths
        .release_dir(&manifest.release_id)
        .join("manifest.json")
        .is_file();
    let update_available = active_release
        .as_ref()
        .is_none_or(|state| state.release_id != manifest.release_id);
    let reason = if let Some(reason) = compatibility_error.clone() {
        Some(reason)
    } else if !update_available {
        Some(format!(
            "Release `{}` is already active.",
            manifest.release_id
        ))
    } else {
        None
    };

    Ok(UpdateCheckReport {
        manifest_source: resolved.manifest_source.clone(),
        source_kind: resolved.source_kind.clone(),
        release_id: manifest.release_id,
        channel: manifest.channel,
        launcher_version: LAUNCHER_VERSION.into(),
        min_launcher_version: manifest.min_launcher_version,
        active_release_id,
        staged,
        update_available,
        compatible: compatibility_error.is_none(),
        reason,
        github_release_tag: resolved.github_release_tag.clone(),
        github_release_url: resolved.github_release_url.clone(),
    })
}

fn apply_update(paths: &LauncherPaths, args: UpdateApplyArgs) -> Result<UpdateApplyReport> {
    let stores = LauncherStateStores::new(paths);
    let update_config = load_update_config(&stores)?;
    let resolved = resolve_manifest_source(&update_config, args.manifest.as_deref())?;
    apply_update_from_resolved(paths, &stores, args, resolved)
}

fn apply_update_from_resolved(
    paths: &LauncherPaths,
    stores: &LauncherStateStores,
    args: UpdateApplyArgs,
    resolved: ResolvedManifestSource,
) -> Result<UpdateApplyReport> {
    let manifest = load_manifest_from_source(&resolved.manifest_source)?;
    manifest.ensure_launcher_compatibility(LAUNCHER_VERSION)?;

    let active_before = stores.active_release.load_optional()?;
    if active_before
        .as_ref()
        .is_some_and(|state| state.release_id == manifest.release_id)
    {
        let probe_port = resolve_probe_port(&args.host, args.port)?;
        let health_url = format!("http://{}:{}/api/health", args.host, probe_port);
        let app_url = format!("http://{}:{}/", args.host, probe_port);
        return Ok(UpdateApplyReport {
            manifest_source: resolved.manifest_source,
            source_kind: resolved.source_kind,
            release_id: manifest.release_id,
            activated: false,
            staged_now: false,
            probe_port,
            previous_active_release_id: active_before.map(|state| state.release_id),
            health_url,
            app_url,
            github_release_tag: resolved.github_release_tag,
            github_release_url: resolved.github_release_url,
        });
    }

    let staged_now = ensure_release_is_staged(paths, &resolved.manifest_source, &manifest)?;
    let staged_state = load_staged_state(paths, &manifest.release_id)?;
    let workspace_root = args
        .workspace_root
        .unwrap_or(std::env::current_dir().context("Failed to resolve current directory.")?);
    let probe_port = resolve_probe_port(&args.host, args.port)?;
    let (config, mut child) = start_backend_for_state(
        paths,
        &staged_state,
        &args.host,
        probe_port,
        workspace_root.as_path(),
    )?;
    stop_backend_probe(&mut child)?;

    if let Some(previous_active) = active_before.as_ref() {
        if previous_active.release_id != staged_state.release_id {
            stores.last_known_good_release.save(previous_active)?;
        }
    }
    stores.active_release.save(&staged_state)?;
    stores.crash_state.clear()?;
    stores.rollback_marker.clear()?;

    Ok(UpdateApplyReport {
        manifest_source: resolved.manifest_source,
        source_kind: resolved.source_kind,
        release_id: staged_state.release_id,
        activated: true,
        staged_now,
        probe_port,
        previous_active_release_id: active_before.map(|state| state.release_id),
        health_url: config.health_url(),
        app_url: config.app_url(),
        github_release_tag: resolved.github_release_tag,
        github_release_url: resolved.github_release_url,
    })
}

fn sync_updates(paths: &LauncherPaths, args: UpdateSyncArgs) -> Result<UpdateSyncReport> {
    let stores = LauncherStateStores::new(paths);
    let update_config = load_update_config(&stores)?;
    let resolved = resolve_manifest_source(&update_config, args.manifest.as_deref())?;
    let checked = evaluate_update(paths, &stores, &resolved)?;
    if !checked.compatible || !checked.update_available {
        return Ok(UpdateSyncReport {
            checked,
            applied: None,
        });
    }

    let applied = apply_update_from_resolved(
        paths,
        &stores,
        UpdateApplyArgs {
            manifest: Some(resolved.manifest_source.clone()),
            host: args.host,
            port: args.port,
            workspace_root: args.workspace_root,
        },
        resolved,
    )?;
    Ok(UpdateSyncReport {
        checked,
        applied: Some(applied),
    })
}

fn load_update_config(stores: &LauncherStateStores) -> Result<UpdateConfig> {
    let config = stores.update_config.load_optional()?.unwrap_or_default();
    config.validate()?;
    Ok(config)
}

fn set_update_config(
    stores: &LauncherStateStores,
    args: UpdateConfigSetArgs,
) -> Result<UpdateConfig> {
    if args.channel.is_none()
        && args.auto_update_on_launch.is_none()
        && args.manifest_source.is_none()
        && !args.clear_manifest_source
        && args.github_repo.is_none()
        && args.manifest_asset_name.is_none()
    {
        bail!("No update config changes were provided.");
    }

    let mut config = load_update_config(stores)?;
    if let Some(channel) = args.channel {
        config.channel = channel;
    }
    if let Some(auto_update_on_launch) = args.auto_update_on_launch {
        config.auto_update_on_launch = auto_update_on_launch;
    }
    if let Some(manifest_source) = args.manifest_source {
        config.manifest_source = Some(manifest_source);
    }
    if args.clear_manifest_source {
        config.manifest_source = None;
    }
    if let Some(github_repo) = args.github_repo {
        config.github_repo = github_repo;
    }
    if let Some(asset_name) = args.manifest_asset_name {
        config.github_manifest_asset_name = asset_name;
    }
    config.validate()?;
    stores.update_config.save(&config)?;
    Ok(config)
}

fn resolve_manifest_source(
    update_config: &UpdateConfig,
    manifest_override: Option<&str>,
) -> Result<ResolvedManifestSource> {
    if let Some(source) = manifest_override {
        return Ok(ResolvedManifestSource {
            manifest_source: source.into(),
            source_kind: "explicit".into(),
            github_release_tag: None,
            github_release_url: None,
        });
    }
    if let Some(source) = &update_config.manifest_source {
        return Ok(ResolvedManifestSource {
            manifest_source: source.clone(),
            source_kind: "configured-manifest".into(),
            github_release_tag: None,
            github_release_url: None,
        });
    }

    let discovery = discover_manifest_for_repo(
        &update_config.github_repo,
        &update_config.github_manifest_asset_name,
        update_config.allows_prerelease(),
        LAUNCHER_VERSION,
    )?;
    Ok(resolved_manifest_from_github(discovery))
}

fn resolved_manifest_from_github(discovery: GitHubManifestDiscovery) -> ResolvedManifestSource {
    ResolvedManifestSource {
        manifest_source: discovery.manifest_source,
        source_kind: "github-release".into(),
        github_release_tag: Some(discovery.release_tag),
        github_release_url: Some(discovery.release_url),
    }
}

fn recover_backend_with_rollback(
    paths: &LauncherPaths,
    stores: &LauncherStateStores,
    failed_state: &ActiveReleaseState,
    host: &str,
    port: u16,
    workspace_root: &std::path::Path,
    failure: anyhow::Error,
) -> Result<()> {
    let failure_reason = failure.to_string();
    let rollback_state = resolve_rollback_state(paths, stores, failed_state)?;
    let mut marker = RollbackMarker::pending(
        failed_state.release_id.clone(),
        rollback_state
            .as_ref()
            .map(|state| state.release_id.clone()),
        &failure_reason,
    );
    stores.rollback_marker.save(&marker)?;

    let Some(rollback_state) = rollback_state else {
        marker.mark_failed(failure_reason);
        stores.rollback_marker.save(&marker)?;
        return Err(
            failure.context("Backend health check failed and no rollback release is available.")
        );
    };

    match start_backend_for_state_with_retries(
        paths,
        &rollback_state,
        host,
        port,
        workspace_root,
        3,
    ) {
        Ok((config, child)) => {
            stores.active_release.save(&rollback_state)?;
            stores.last_known_good_release.save(&rollback_state)?;
            marker.mark_rolled_back();
            stores.rollback_marker.save(&marker)?;
            supervise_backend_runtime(
                paths,
                stores,
                &rollback_state,
                host,
                port,
                workspace_root,
                config,
                child,
                Some(&failed_state.release_id),
            )
        }
        Err(rollback_error) => {
            marker.mark_failed(format!(
                "{failure_reason}; rollback failed: {rollback_error}"
            ));
            stores.rollback_marker.save(&marker)?;
            Err(rollback_error.context(format!(
                "Rollback launch failed for release `{}`.",
                rollback_state.release_id
            )))
        }
    }
}

fn resolve_rollback_state(
    paths: &LauncherPaths,
    stores: &LauncherStateStores,
    failed_state: &ActiveReleaseState,
) -> Result<Option<ActiveReleaseState>> {
    if let Some(last_known_good) = stores.last_known_good_release.load_optional()? {
        if last_known_good.release_id != failed_state.release_id {
            return Ok(Some(last_known_good));
        }
    }

    let manifest_path = paths
        .release_dir(&failed_state.release_id)
        .join("manifest.json");
    if !manifest_path.is_file() {
        return Ok(None);
    }
    let manifest = load_manifest_from_source(
        manifest_path
            .to_str()
            .context("Staged manifest path is not valid UTF-8.")?,
    )?;
    let Some(rollback_release_id) = manifest
        .rollback_to
        .filter(|release_id| release_id != &failed_state.release_id)
    else {
        return Ok(None);
    };
    load_staged_state(paths, &rollback_release_id).map(Some)
}

fn ensure_release_is_staged(
    paths: &LauncherPaths,
    manifest_source: &str,
    manifest: &crate::manifest::ReleaseManifest,
) -> Result<bool> {
    let staged_manifest_path = paths
        .release_dir(&manifest.release_id)
        .join("manifest.json");
    if staged_manifest_path.is_file() {
        let staged_manifest = load_manifest_from_source(
            staged_manifest_path
                .to_str()
                .context("Staged manifest path is not valid UTF-8.")?,
        )?;
        if staged_manifest != *manifest {
            bail!(
                "Release `{}` is already staged, but the staged manifest does not match `{}`.",
                manifest.release_id,
                manifest_source
            );
        }
        return Ok(false);
    }

    stage_release(paths, manifest_source)?;
    Ok(true)
}

fn load_staged_state(paths: &LauncherPaths, release_id: &str) -> Result<ActiveReleaseState> {
    let manifest_path = paths.release_dir(release_id).join("manifest.json");
    if !manifest_path.is_file() {
        bail!(
            "Rollback target `{release_id}` is not staged. Expected `{}`.",
            manifest_path.display()
        );
    }
    let manifest = load_manifest_from_source(
        manifest_path
            .to_str()
            .context("Staged manifest path is not valid UTF-8.")?,
    )?;
    Ok(ActiveReleaseState::from_manifest(&manifest))
}

fn start_backend_for_state(
    paths: &LauncherPaths,
    state: &ActiveReleaseState,
    host: &str,
    port: u16,
    workspace_root: &std::path::Path,
) -> Result<(BackendLaunchConfig, Child)> {
    let config = BackendLaunchConfig::from_active_release(
        paths,
        state,
        host.to_string(),
        port,
        workspace_root.to_path_buf(),
    )?;
    let mut child = config.spawn()?;
    if let Err(error) =
        wait_for_backend_ready(&mut child, &config.health_url(), Duration::from_secs(10))
    {
        let _ = child.kill();
        let _ = child.wait();
        return Err(error.context(format!(
            "Backend failed health check for release `{}`.",
            state.release_id
        )));
    }
    Ok((config, child))
}

fn start_backend_for_state_with_retries(
    paths: &LauncherPaths,
    state: &ActiveReleaseState,
    host: &str,
    port: u16,
    workspace_root: &std::path::Path,
    attempts: u32,
) -> Result<(BackendLaunchConfig, Child)> {
    let attempts = attempts.max(1);
    let mut last_error = None;
    for attempt in 1..=attempts {
        match start_backend_for_state(paths, state, host, port, workspace_root) {
            Ok(result) => return Ok(result),
            Err(error) => {
                last_error = Some(error);
                if attempt < attempts {
                    std::thread::sleep(BACKEND_RESTART_DELAY);
                }
            }
        }
    }
    Err(last_error.expect("backend start retry must record the final error"))
}

fn resolve_probe_port(host: &str, requested_port: Option<u16>) -> Result<u16> {
    if let Some(port) = requested_port {
        return Ok(port);
    }
    let listener = TcpListener::bind(format!("{host}:0"))
        .with_context(|| format!("Failed to reserve a probe port on `{host}`."))?;
    let port = listener
        .local_addr()
        .context("Failed to read reserved probe port.")?
        .port();
    drop(listener);
    Ok(port)
}

fn stop_backend_probe(child: &mut Child) -> Result<()> {
    if child
        .try_wait()
        .context("Failed to poll staged backend probe process.")?
        .is_some()
    {
        return Ok(());
    }
    child
        .kill()
        .context("Failed to terminate staged backend probe process.")?;
    let _ = child.wait();
    Ok(())
}

fn guard_against_frozen_release(
    paths: &LauncherPaths,
    stores: &LauncherStateStores,
    state: &ActiveReleaseState,
    host: &str,
    port: u16,
    workspace_root: &std::path::Path,
) -> Result<bool> {
    let Some(crash_state) = stores.crash_state.load_optional()? else {
        return Ok(false);
    };
    if !crash_state.is_frozen_for(&state.release_id) {
        return Ok(false);
    }
    recover_backend_with_rollback(
        paths,
        stores,
        state,
        host,
        port,
        workspace_root,
        anyhow::anyhow!(freeze_error_message(&crash_state)),
    )?;
    Ok(true)
}

#[allow(clippy::too_many_arguments)]
fn supervise_backend_runtime(
    paths: &LauncherPaths,
    stores: &LauncherStateStores,
    state: &ActiveReleaseState,
    host: &str,
    port: u16,
    workspace_root: &std::path::Path,
    mut config: BackendLaunchConfig,
    mut child: Child,
    failed_release_id: Option<&str>,
) -> Result<()> {
    let mut restart_count = 0_u32;
    report_backend_ready(state, &config, &child, failed_release_id, restart_count)?;

    loop {
        let status = child
            .wait()
            .context("Failed while waiting for backend process.")?;
        if status.success() {
            clear_crash_state_for_release(stores, &state.release_id)?;
            return Ok(());
        }

        let crash_state = record_backend_crash(stores, state, &status)?;
        let will_restart = crash_state.status != CrashStatus::Frozen;
        report_backend_crash(state, &status, &crash_state, will_restart)?;

        if crash_state.status == CrashStatus::Frozen {
            return recover_backend_with_rollback(
                paths,
                stores,
                state,
                host,
                port,
                workspace_root,
                anyhow::anyhow!(freeze_error_message(&crash_state)),
            );
        }

        std::thread::sleep(BACKEND_RESTART_DELAY);
        let next_attempt = restart_count.saturating_add(1);
        match start_backend_for_state(paths, state, host, port, workspace_root) {
            Ok((next_config, next_child)) => {
                restart_count = next_attempt;
                config = next_config;
                child = next_child;
                report_backend_ready(state, &config, &child, failed_release_id, restart_count)?;
            }
            Err(error) => {
                return recover_backend_with_rollback(
                    paths,
                    stores,
                    state,
                    host,
                    port,
                    workspace_root,
                    error.context(format!(
                        "Automatic restart attempt {next_attempt} failed after backend crash."
                    )),
                );
            }
        }
    }
}

fn report_backend_ready(
    state: &ActiveReleaseState,
    config: &BackendLaunchConfig,
    child: &Child,
    failed_release_id: Option<&str>,
    restart_count: u32,
) -> Result<()> {
    println!(
        "{}",
        serde_json::json!({
            "status": "healthy",
            "pid": child.id(),
            "url": config.app_url(),
            "healthUrl": config.health_url(),
            "releaseId": state.release_id,
            "rolledBack": failed_release_id.is_some(),
            "failedReleaseId": failed_release_id,
            "restartCount": restart_count,
        })
    );
    Ok(())
}

fn record_backend_crash(
    stores: &LauncherStateStores,
    state: &ActiveReleaseState,
    status: &std::process::ExitStatus,
) -> Result<CrashState> {
    let previous = stores.crash_state.load_optional()?;
    let reason = format!("Backend exited with status {status}.");
    let crash_state = CrashState::record(
        previous.as_ref(),
        state.release_id.clone(),
        status.code(),
        reason,
        BACKEND_CRASH_RESTART_LIMIT,
        BACKEND_CRASH_WINDOW.as_secs(),
    );
    stores.crash_state.save(&crash_state)?;
    Ok(crash_state)
}

fn clear_crash_state_for_release(stores: &LauncherStateStores, release_id: &str) -> Result<()> {
    let Some(crash_state) = stores.crash_state.load_optional()? else {
        return Ok(());
    };
    if crash_state.release_id != release_id {
        return Ok(());
    }
    stores.crash_state.clear()
}

fn report_backend_crash(
    state: &ActiveReleaseState,
    status: &std::process::ExitStatus,
    crash_state: &CrashState,
    will_restart: bool,
) -> Result<()> {
    println!(
        "{}",
        serde_json::json!({
            "status": "crashed",
            "releaseId": state.release_id,
            "exitStatus": status.to_string(),
            "exitCode": status.code(),
            "crashCount": crash_state.crash_count,
            "firstCrashUnixSeconds": crash_state.first_crash_unix_seconds,
            "lastCrashUnixSeconds": crash_state.last_crash_unix_seconds,
            "frozen": crash_state.status == CrashStatus::Frozen,
            "willRestart": will_restart,
        })
    );
    Ok(())
}

fn freeze_error_message(crash_state: &CrashState) -> String {
    format!(
        "Release `{}` is frozen after {} crashes within {} seconds. Last reason: {}",
        crash_state.release_id,
        crash_state.crash_count,
        BACKEND_CRASH_WINDOW.as_secs(),
        crash_state.last_reason
    )
}

#[cfg(test)]
mod tests {
    use super::{
        LAUNCHER_VERSION, LaunchActiveArgs, LauncherStateStores, UpdateApplyArgs, UpdateSyncArgs,
        apply_update, check_update, launch_active_backend, resolve_rollback_state, sync_updates,
    };
    use crate::paths::LauncherPaths;
    use crate::state::{ActiveReleaseState, CrashStatus, RollbackStatus, UpdateConfig};
    use std::env;
    use std::fs;
    use std::net::TcpListener;
    use std::path::{Path, PathBuf};
    use std::process::Command;
    use std::sync::{Mutex, OnceLock};
    use tempfile::tempdir;

    #[test]
    fn launch_active_backend_rolls_back_to_last_known_good_on_health_failure() {
        let _guard = test_guard();
        let temp_dir = tempdir().unwrap();
        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();
        let stores = LauncherStateStores::new(&paths);
        let active_state = sample_state("2026.03.18-2");
        let rollback_state = sample_state("2026.03.10-2");
        stores.active_release.save(&active_state).unwrap();
        stores
            .last_known_good_release
            .save(&rollback_state)
            .unwrap();

        write_release_runtime(&paths, &active_state, FakeBackendBehavior::FailFast, None);
        write_release_runtime(
            &paths,
            &rollback_state,
            FakeBackendBehavior::HealthOnce,
            None,
        );

        let result = launch_active_backend(
            &paths,
            LaunchActiveArgs {
                host: "127.0.0.1".into(),
                port: find_free_port(),
                sync_updates: false,
                workspace_root: Some(temp_dir.path().to_path_buf()),
                dry_run: false,
            },
        );

        assert!(result.is_ok());
        let stored_active = stores.active_release.load_optional().unwrap().unwrap();
        let marker = stores.rollback_marker.load_optional().unwrap().unwrap();
        let stored_last_known_good = stores
            .last_known_good_release
            .load_optional()
            .unwrap()
            .unwrap();
        assert_eq!(stored_active.release_id, rollback_state.release_id);
        assert_eq!(stored_last_known_good.release_id, rollback_state.release_id);
        assert_eq!(marker.failed_release_id, active_state.release_id);
        assert_eq!(marker.rollback_release_id, Some(rollback_state.release_id));
        assert_eq!(marker.status, RollbackStatus::RolledBack);
    }

    #[test]
    fn launch_active_backend_restarts_after_runtime_crash_and_clears_crash_state() {
        let _guard = test_guard();
        let temp_dir = tempdir().unwrap();
        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();
        let stores = LauncherStateStores::new(&paths);
        let active_state = sample_state("2026.03.18-6");
        stores.active_release.save(&active_state).unwrap();

        write_release_runtime(
            &paths,
            &active_state,
            FakeBackendBehavior::HealthCrashOnceThenSuccess,
            None,
        );

        let result = launch_active_backend(
            &paths,
            LaunchActiveArgs {
                host: "127.0.0.1".into(),
                port: find_free_port(),
                sync_updates: false,
                workspace_root: Some(temp_dir.path().to_path_buf()),
                dry_run: false,
            },
        );

        assert!(result.is_ok());
        assert!(stores.crash_state.load_optional().unwrap().is_none());
        let stored_active = stores.active_release.load_optional().unwrap().unwrap();
        assert_eq!(stored_active.release_id, active_state.release_id);
    }

    #[test]
    fn launch_active_backend_freezes_release_after_repeated_crashes_and_rolls_back() {
        let _guard = test_guard();
        let temp_dir = tempdir().unwrap();
        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();
        let stores = LauncherStateStores::new(&paths);
        let active_state = sample_state("2026.03.18-7");
        let rollback_state = sample_state("2026.03.10-7");
        stores.active_release.save(&active_state).unwrap();
        stores
            .last_known_good_release
            .save(&rollback_state)
            .unwrap();

        write_release_runtime(
            &paths,
            &active_state,
            FakeBackendBehavior::HealthCrashForever,
            Some(&rollback_state.release_id),
        );
        write_release_runtime(
            &paths,
            &rollback_state,
            FakeBackendBehavior::HealthOnce,
            None,
        );

        let result = launch_active_backend(
            &paths,
            LaunchActiveArgs {
                host: "127.0.0.1".into(),
                port: find_free_port(),
                sync_updates: false,
                workspace_root: Some(temp_dir.path().to_path_buf()),
                dry_run: false,
            },
        );

        assert!(result.is_ok());
        let stored_active = stores.active_release.load_optional().unwrap().unwrap();
        let crash_state = stores.crash_state.load_optional().unwrap().unwrap();
        let marker = stores.rollback_marker.load_optional().unwrap().unwrap();

        assert_eq!(stored_active.release_id, rollback_state.release_id);
        assert_eq!(crash_state.release_id, active_state.release_id);
        assert_eq!(crash_state.crash_count, 3);
        assert_eq!(crash_state.status, CrashStatus::Frozen);
        assert_eq!(marker.failed_release_id, active_state.release_id);
        assert_eq!(marker.rollback_release_id, Some(rollback_state.release_id));
        assert_eq!(marker.status, RollbackStatus::RolledBack);
    }

    #[test]
    fn resolve_rollback_state_uses_manifest_when_last_known_good_is_missing() {
        let _guard = test_guard();
        let temp_dir = tempdir().unwrap();
        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();
        let stores = LauncherStateStores::new(&paths);
        let failed_state = sample_state("2026.03.18-2");
        let rollback_state = sample_state("2026.03.10-2");

        write_release_manifest(
            &paths,
            &failed_state.release_id,
            Some(&rollback_state.release_id),
        );
        write_release_manifest(&paths, &rollback_state.release_id, None);

        let resolved = resolve_rollback_state(&paths, &stores, &failed_state)
            .unwrap()
            .unwrap();

        assert_eq!(resolved.release_id, rollback_state.release_id);
    }

    #[test]
    fn update_check_reports_available_release() {
        let _guard = test_guard();
        let temp_dir = tempdir().unwrap();
        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();
        let stores = LauncherStateStores::new(&paths);
        stores
            .active_release
            .save(&sample_state("2026.03.10-2"))
            .unwrap();

        let manifest_source = temp_dir.path().join("update-manifest.json");
        write_external_manifest(&manifest_source, "2026.03.18-2", None);

        let report = check_update(&paths, Some(manifest_source.to_str().unwrap())).unwrap();

        assert_eq!(report.release_id, "2026.03.18-2");
        assert_eq!(report.active_release_id, Some("2026.03.10-2".into()));
        assert!(report.update_available);
        assert!(report.compatible);
        assert!(!report.staged);
        assert_eq!(report.source_kind, "explicit");
    }

    #[test]
    fn update_check_uses_persisted_manifest_source_when_no_override_is_given() {
        let _guard = test_guard();
        let temp_dir = tempdir().unwrap();
        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();
        let stores = LauncherStateStores::new(&paths);
        let manifest_source = temp_dir.path().join("configured-manifest.json");
        write_external_manifest(&manifest_source, "2026.03.18-3", None);
        stores
            .update_config
            .save(&UpdateConfig {
                channel: "stable".into(),
                auto_update_on_launch: false,
                manifest_source: Some(manifest_source.to_str().unwrap().into()),
                github_repo: "eddmpython/codaro".into(),
                github_manifest_asset_name: "release-manifest.json".into(),
            })
            .unwrap();

        let report = check_update(&paths, None).unwrap();

        assert_eq!(report.release_id, "2026.03.18-3");
        assert_eq!(report.source_kind, "configured-manifest");
    }

    #[test]
    fn sync_updates_applies_available_release() {
        let _guard = test_guard();
        let temp_dir = tempdir().unwrap();
        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();
        let stores = LauncherStateStores::new(&paths);
        let previous_active = sample_state("2026.03.10-2");
        let next_active = sample_state("2026.03.18-4");
        stores.active_release.save(&previous_active).unwrap();

        write_release_runtime(
            &paths,
            &next_active,
            FakeBackendBehavior::HealthForever,
            Some(&previous_active.release_id),
        );
        let manifest_source = temp_dir.path().join("sync-manifest.json");
        write_external_manifest(
            &manifest_source,
            &next_active.release_id,
            Some(&previous_active.release_id),
        );

        let report = sync_updates(
            &paths,
            UpdateSyncArgs {
                manifest: Some(manifest_source.to_str().unwrap().into()),
                host: "127.0.0.1".into(),
                port: Some(find_free_port()),
                workspace_root: Some(temp_dir.path().to_path_buf()),
            },
        )
        .unwrap();

        let stored_active = stores.active_release.load_optional().unwrap().unwrap();
        assert!(report.checked.update_available);
        assert!(report.applied.is_some());
        assert_eq!(stored_active.release_id, next_active.release_id);
    }

    #[test]
    fn launch_active_backend_can_sync_updates_before_dry_run() {
        let _guard = test_guard();
        let temp_dir = tempdir().unwrap();
        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();
        let stores = LauncherStateStores::new(&paths);
        let previous_active = sample_state("2026.03.10-2");
        let next_active = sample_state("2026.03.18-5");
        stores.active_release.save(&previous_active).unwrap();

        write_release_runtime(
            &paths,
            &previous_active,
            FakeBackendBehavior::HealthOnce,
            None,
        );
        write_release_runtime(
            &paths,
            &next_active,
            FakeBackendBehavior::HealthForever,
            Some(&previous_active.release_id),
        );
        let manifest_source = temp_dir.path().join("launch-manifest.json");
        write_external_manifest(
            &manifest_source,
            &next_active.release_id,
            Some(&previous_active.release_id),
        );
        stores
            .update_config
            .save(&UpdateConfig {
                channel: "stable".into(),
                auto_update_on_launch: true,
                manifest_source: Some(manifest_source.to_str().unwrap().into()),
                github_repo: "eddmpython/codaro".into(),
                github_manifest_asset_name: "release-manifest.json".into(),
            })
            .unwrap();

        let result = launch_active_backend(
            &paths,
            LaunchActiveArgs {
                host: "127.0.0.1".into(),
                port: find_free_port(),
                sync_updates: false,
                workspace_root: Some(temp_dir.path().to_path_buf()),
                dry_run: true,
            },
        );

        assert!(result.is_ok());
        let stored_active = stores.active_release.load_optional().unwrap().unwrap();
        assert_eq!(stored_active.release_id, next_active.release_id);
    }

    #[test]
    fn apply_update_promotes_staged_release_after_probe() {
        let _guard = test_guard();
        let temp_dir = tempdir().unwrap();
        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();
        let stores = LauncherStateStores::new(&paths);
        let previous_active = sample_state("2026.03.10-2");
        let next_active = sample_state("2026.03.18-2");
        stores.active_release.save(&previous_active).unwrap();
        stores
            .rollback_marker
            .save(&crate::state::RollbackMarker::pending(
                "2026.03.01-1",
                Some("2026.03.10-2".into()),
                "stale failure",
            ))
            .unwrap();

        write_release_runtime(
            &paths,
            &next_active,
            FakeBackendBehavior::HealthForever,
            Some(&previous_active.release_id),
        );
        let manifest_source = temp_dir.path().join("update-manifest.json");
        write_external_manifest(
            &manifest_source,
            &next_active.release_id,
            Some(&previous_active.release_id),
        );

        let report = apply_update(
            &paths,
            UpdateApplyArgs {
                manifest: Some(manifest_source.to_str().unwrap().into()),
                host: "127.0.0.1".into(),
                port: Some(find_free_port()),
                workspace_root: Some(temp_dir.path().to_path_buf()),
            },
        )
        .unwrap();

        let stored_active = stores.active_release.load_optional().unwrap().unwrap();
        let stored_last_known_good = stores
            .last_known_good_release
            .load_optional()
            .unwrap()
            .unwrap();
        let rollback_marker = stores.rollback_marker.load_optional().unwrap();

        assert!(report.activated);
        assert!(!report.staged_now);
        assert_eq!(report.source_kind, "explicit");
        assert_eq!(stored_active.release_id, next_active.release_id);
        assert_eq!(
            stored_last_known_good.release_id,
            previous_active.release_id
        );
        assert!(rollback_marker.is_none());
    }

    fn sample_state(release_id: &str) -> ActiveReleaseState {
        ActiveReleaseState {
            release_id: release_id.into(),
            channel: "stable".into(),
            launcher_version: "0.3.0".into(),
            backend_package_name: "codaro".into(),
            backend_version: "0.3.0".into(),
            backend_entry_module: "fakebackend".into(),
            backend_console_script: "codaro".into(),
            editor_version: "0.3.0".into(),
            installed_at_unix_seconds: 1234,
        }
    }

    fn write_release_runtime(
        paths: &LauncherPaths,
        state: &ActiveReleaseState,
        behavior: FakeBackendBehavior,
        rollback_to: Option<&str>,
    ) {
        let python = discover_test_python();
        let release_dir = paths.release_dir(&state.release_id);
        let runtime_dir = paths.release_python_runtime_dir(&state.release_id);
        let site_packages_dir = release_dir.join("backend").join("site-packages");
        let editor_dir = paths.release_editor_dir(&state.release_id);

        fs::create_dir_all(&runtime_dir).unwrap();
        fs::create_dir_all(&site_packages_dir).unwrap();
        fs::create_dir_all(&editor_dir).unwrap();
        fs::write(editor_dir.join("index.html"), "<!doctype html>").unwrap();
        write_python_wrapper(&runtime_dir, &python);
        write_fake_backend_module(&site_packages_dir, behavior);
        write_release_manifest(paths, &state.release_id, rollback_to);
    }

    fn write_python_wrapper(runtime_dir: &Path, python: &Path) {
        if cfg!(windows) {
            fs::write(
                runtime_dir.join("python.cmd"),
                format!("@echo off\r\n\"{}\" %*\r\n", python.display()),
            )
            .unwrap();
            return;
        }

        let bin_dir = runtime_dir.join("bin");
        fs::create_dir_all(&bin_dir).unwrap();
        let wrapper_path = bin_dir.join("python3");
        fs::write(
            &wrapper_path,
            format!("#!/bin/sh\n\"{}\" \"$@\"\n", python.display()),
        )
        .unwrap();
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let permissions = fs::Permissions::from_mode(0o755);
            fs::set_permissions(&wrapper_path, permissions).unwrap();
        }
    }

    fn write_fake_backend_module(site_packages_dir: &Path, behavior: FakeBackendBehavior) {
        let script = match behavior {
            FakeBackendBehavior::HealthOnce => {
                r#"
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

def arg_value(name, default):
    try:
        index = sys.argv.index(name)
    except ValueError:
        return default
    if index + 1 >= len(sys.argv):
        return default
    return sys.argv[index + 1]

host = arg_value("--host", "127.0.0.1")
port = int(arg_value("--port", "0"))

class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True

    def handle_error(self, request, client_address):
        return

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/health":
            self.server.seen_health = True
            body = b'{"status":"ok"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_response(404)
        self.end_headers()

    def log_message(self, format, *args):
        return

server = ReusableHTTPServer((host, port), Handler)
server.seen_health = False
while not server.seen_health:
    server.handle_request()
"#
            }
            FakeBackendBehavior::HealthForever => {
                r#"
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

def arg_value(name, default):
    try:
        index = sys.argv.index(name)
    except ValueError:
        return default
    if index + 1 >= len(sys.argv):
        return default
    return sys.argv[index + 1]

host = arg_value("--host", "127.0.0.1")
port = int(arg_value("--port", "0"))

class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True

    def handle_error(self, request, client_address):
        return

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/health":
            body = b'{"status":"ok"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_response(404)
        self.end_headers()

    def log_message(self, format, *args):
        return

server = ReusableHTTPServer((host, port), Handler)
server.serve_forever()
"#
            }
            FakeBackendBehavior::HealthCrashOnceThenSuccess => {
                r#"
import sys
import time
import threading
from pathlib import Path
from http.server import BaseHTTPRequestHandler, HTTPServer

def arg_value(name, default):
    try:
        index = sys.argv.index(name)
    except ValueError:
        return default
    if index + 1 >= len(sys.argv):
        return default
    return sys.argv[index + 1]

host = arg_value("--host", "127.0.0.1")
port = int(arg_value("--port", "0"))
counter_path = Path.cwd() / ".fakebackend-restart-count"
attempt = int(counter_path.read_text(encoding="utf-8")) if counter_path.exists() else 0
counter_path.write_text(str(attempt + 1), encoding="utf-8")

class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True

    def handle_error(self, request, client_address):
        return

def stop_server(server):
    time.sleep(0.6)
    server.shutdown()

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/health":
            if not self.server.seen_health:
                self.server.seen_health = True
                threading.Thread(target=stop_server, args=(self.server,), daemon=True).start()
            body = b'{"status":"ok"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_response(404)
        self.end_headers()

    def log_message(self, format, *args):
        return

server = ReusableHTTPServer((host, port), Handler)
server.seen_health = False
server.serve_forever()
if attempt == 0:
    raise SystemExit(1)
"#
            }
            FakeBackendBehavior::HealthCrashForever => {
                r#"
import sys
import time
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

def arg_value(name, default):
    try:
        index = sys.argv.index(name)
    except ValueError:
        return default
    if index + 1 >= len(sys.argv):
        return default
    return sys.argv[index + 1]

host = arg_value("--host", "127.0.0.1")
port = int(arg_value("--port", "0"))

class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True

    def handle_error(self, request, client_address):
        return

def stop_server(server):
    time.sleep(0.6)
    server.shutdown()

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/health":
            if not self.server.seen_health:
                self.server.seen_health = True
                threading.Thread(target=stop_server, args=(self.server,), daemon=True).start()
            body = b'{"status":"ok"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_response(404)
        self.end_headers()

    def log_message(self, format, *args):
        return

server = ReusableHTTPServer((host, port), Handler)
server.seen_health = False
server.serve_forever()
raise SystemExit(1)
"#
            }
            FakeBackendBehavior::FailFast => "raise SystemExit(1)\n",
        };
        fs::write(
            site_packages_dir.join("fakebackend.py"),
            script.trim_start(),
        )
        .unwrap();
    }

    fn write_release_manifest(paths: &LauncherPaths, release_id: &str, rollback_to: Option<&str>) {
        let manifest_path = paths.release_dir(release_id).join("manifest.json");
        if let Some(parent) = manifest_path.parent() {
            fs::create_dir_all(parent).unwrap();
        }
        let manifest = serde_json::json!({
            "manifestVersion": 1,
            "channel": "stable",
            "releaseId": release_id,
            "launcherVersion": LAUNCHER_VERSION,
            "minLauncherVersion": LAUNCHER_VERSION,
            "pythonRuntime": {
                "version": "3.12.12",
                "url": "file:///python-runtime.zip",
                "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
            },
            "editor": {
                "version": "0.3.0",
                "url": "file:///editor.zip",
                "sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
            },
            "backend": {
                "name": "codaro",
                "version": "0.3.0",
                "wheelUrl": "file:///codaro-0.3.0-py3-none-any.whl",
                "sha256": "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
                "entryModule": "fakebackend",
                "consoleScript": "codaro"
            },
            "bundles": [],
            "rollbackTo": rollback_to,
        });
        fs::write(
            manifest_path,
            serde_json::to_string_pretty(&manifest).unwrap(),
        )
        .unwrap();
    }

    fn write_external_manifest(path: &Path, release_id: &str, rollback_to: Option<&str>) {
        let manifest = serde_json::json!({
            "manifestVersion": 1,
            "channel": "stable",
            "releaseId": release_id,
            "launcherVersion": LAUNCHER_VERSION,
            "minLauncherVersion": LAUNCHER_VERSION,
            "pythonRuntime": {
                "version": "3.12.12",
                "url": "file:///python-runtime.zip",
                "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
            },
            "editor": {
                "version": "0.3.0",
                "url": "file:///editor.zip",
                "sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
            },
            "backend": {
                "name": "codaro",
                "version": "0.3.0",
                "wheelUrl": "file:///codaro-0.3.0-py3-none-any.whl",
                "sha256": "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
                "entryModule": "fakebackend",
                "consoleScript": "codaro"
            },
            "bundles": [],
            "rollbackTo": rollback_to,
        });
        fs::write(path, serde_json::to_string_pretty(&manifest).unwrap()).unwrap();
    }

    fn discover_test_python() -> PathBuf {
        for key in ["CODARO_TEST_PYTHON", "PYTHON", "PYTHON_EXECUTABLE"] {
            if let Some(value) = env::var_os(key) {
                let path = PathBuf::from(value);
                if path.is_file() {
                    return path;
                }
            }
        }

        for candidate in ["python", "python3"] {
            let output = Command::new(candidate)
                .arg("-c")
                .arg("import sys; print(sys.executable)")
                .output();
            if let Ok(output) = output {
                if output.status.success() {
                    let value = String::from_utf8_lossy(&output.stdout).trim().to_string();
                    if !value.is_empty() {
                        return PathBuf::from(value);
                    }
                }
            }
        }

        panic!("No Python executable is available for launcher supervisor tests.");
    }

    fn find_free_port() -> u16 {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        drop(listener);
        port
    }

    fn test_mutex() -> &'static Mutex<()> {
        static TEST_MUTEX: OnceLock<Mutex<()>> = OnceLock::new();
        TEST_MUTEX.get_or_init(|| Mutex::new(()))
    }

    fn test_guard() -> std::sync::MutexGuard<'static, ()> {
        test_mutex()
            .lock()
            .unwrap_or_else(|poison| poison.into_inner())
    }

    #[derive(Clone, Copy)]
    enum FakeBackendBehavior {
        FailFast,
        HealthOnce,
        HealthForever,
        HealthCrashOnceThenSuccess,
        HealthCrashForever,
    }
}
