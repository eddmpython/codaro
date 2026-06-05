use crate::download::{self, DownloadConfig};
use crate::manifest::{BundleArtifact, ReleaseManifest};
use crate::paths::LauncherPaths;
use crate::state::{ActiveReleaseState, ActiveReleaseStore};
use anyhow::{Context, Result, bail};
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::fs::File;
use std::fs::OpenOptions;
use std::io;
#[cfg(unix)]
use std::os::unix::fs::PermissionsExt;
use std::path::{Component, Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use url::Url;
use zip::ZipArchive;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct StagedReleaseSummary {
    pub release_id: String,
    pub manifest_path: PathBuf,
    pub backend_wheel_path: PathBuf,
    pub editor_archive_path: Option<PathBuf>,
    pub editor_root_path: PathBuf,
    pub python_runtime_archive_path: PathBuf,
    pub python_executable_path: PathBuf,
    pub backend_site_packages_path: PathBuf,
    pub bundle_paths: Vec<PathBuf>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct InstallRecord {
    pub release_id: String,
    pub backend: InstalledArtifact,
    pub editor: InstalledArtifact,
    pub python_runtime: InstalledArtifact,
    pub bundles: Vec<InstalledArtifact>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct InstalledArtifact {
    pub name: String,
    pub version: String,
    pub sha256: String,
    pub source: String,
    pub staged_path: PathBuf,
}

pub fn load_manifest_from_source(source: &str) -> Result<ReleaseManifest> {
    let bytes = read_source_bytes(source)?;
    let content = String::from_utf8(bytes).context("Manifest is not valid UTF-8.")?;
    let manifest: ReleaseManifest = serde_json::from_str(&content)
        .with_context(|| format!("Failed to parse manifest from `{source}`."))?;
    manifest.validate()?;
    Ok(manifest)
}

pub fn stage_release(paths: &LauncherPaths, manifest_source: &str) -> Result<StagedReleaseSummary> {
    stage_release_with_progress(paths, manifest_source, &|_, _, _| {})
}

/// `stage_release`의 진행률 보고 버전. `progress(artifact_label, received, total)`로 각
/// 아티팩트의 다운로드 진척을 알린다. 네이티브 창이 이 콜백을 IPC 진행률로 중계한다.
pub fn stage_release_with_progress(
    paths: &LauncherPaths,
    manifest_source: &str,
    progress: &dyn Fn(&str, u64, Option<u64>),
) -> Result<StagedReleaseSummary> {
    let manifest = load_manifest_from_source(manifest_source)?;
    let release_dir = paths.release_dir(&manifest.release_id);
    let downloads_dir = paths.downloads_dir().join(&manifest.release_id);
    if release_dir.exists() {
        bail!(
            "Release `{}` is already staged at `{}`.",
            manifest.release_id,
            release_dir.display()
        );
    }
    if downloads_dir.exists() {
        fs::remove_dir_all(&downloads_dir).with_context(|| {
            format!(
                "Failed to clear previous download cache for release `{}`.",
                manifest.release_id
            )
        })?;
    }

    let backend_site_packages_path = release_dir.join("backend").join("site-packages");
    let backend_wheels_dir = release_dir.join("backend").join("wheels");
    let editor_archive_dir = release_dir.join("editor").join("archive");
    let staged_editor_root_path = paths.release_editor_dir(&manifest.release_id);
    let runtime_archive_dir = release_dir.join("runtime").join("archive");
    let python_runtime_dir = paths.release_python_runtime_dir(&manifest.release_id);
    let bundle_wheels_dir = release_dir.join("bundles").join("wheels");

    let mut directories = vec![
        backend_site_packages_path.clone(),
        backend_wheels_dir.clone(),
        runtime_archive_dir.clone(),
        python_runtime_dir.clone(),
        bundle_wheels_dir.clone(),
        downloads_dir.clone(),
    ];
    if !manifest.editor.is_backend_wheel_source() {
        directories.push(editor_archive_dir.clone());
        directories.push(staged_editor_root_path.clone());
    }
    for directory in directories {
        fs::create_dir_all(&directory).with_context(|| {
            format!(
                "Failed to create staged release directory `{}`.",
                directory.display()
            )
        })?;
    }

    let backend_wheel_path = stage_artifact(
        &downloads_dir.join("backend"),
        &backend_wheels_dir,
        &manifest.backend.wheel_url,
        &manifest.backend.sha256,
        &|received, total| progress("backend", received, total),
    )?;
    let python_runtime_archive_path = stage_artifact(
        &downloads_dir.join("runtime"),
        &runtime_archive_dir,
        &manifest.python_runtime.url,
        &manifest.python_runtime.sha256,
        &|received, total| progress("runtime", received, total),
    )?;
    let editor_archive_path = if manifest.editor.is_backend_wheel_source() {
        None
    } else {
        let editor_url = manifest
            .editor
            .url
            .as_deref()
            .context("editor.url is required for archive-backed editor releases.")?;
        let editor_sha256 = manifest
            .editor
            .sha256
            .as_deref()
            .context("editor.sha256 is required for archive-backed editor releases.")?;
        let archive_path = stage_artifact(
            &downloads_dir.join("editor"),
            &editor_archive_dir,
            editor_url,
            editor_sha256,
            &|received, total| progress("editor", received, total),
        )?;
        extract_zip_archive(&archive_path, &staged_editor_root_path)?;
        Some(archive_path)
    };
    extract_zip_archive(&python_runtime_archive_path, &python_runtime_dir)?;
    let python_executable_path = LauncherPaths::resolve_python_executable(&python_runtime_dir)?;

    let mut bundle_paths = Vec::new();
    let mut installed_bundles = Vec::new();
    for bundle in &manifest.bundles {
        let staged_path = stage_artifact(
            &downloads_dir.join("bundles"),
            &bundle_wheels_dir,
            &bundle.wheel_url,
            &bundle.sha256,
            &|received, total| progress(&format!("bundle:{}", bundle.package_name), received, total),
        )?;
        installed_bundles.push(installed_bundle(bundle, staged_path.clone()));
        bundle_paths.push(staged_path);
    }
    let mut wheel_paths = Vec::with_capacity(bundle_paths.len() + 1);
    wheel_paths.push(backend_wheel_path.clone());
    wheel_paths.extend(bundle_paths.iter().cloned());
    install_wheels_into_site_packages(
        &python_executable_path,
        &backend_site_packages_path,
        &wheel_paths,
        &paths.logs_dir(),
    )?;
    let editor_root_path = if manifest.editor.is_backend_wheel_source() {
        let bundled_editor_root =
            backend_wheel_editor_root(&backend_site_packages_path, &manifest.backend.name);
        verify_editor_build_root(&bundled_editor_root)?;
        bundled_editor_root
    } else {
        verify_editor_build_root(&staged_editor_root_path)?;
        staged_editor_root_path
    };
    let (editor_source, editor_sha256, editor_staged_path) =
        if manifest.editor.is_backend_wheel_source() {
            (
                "backendWheel:codaro/webBuild".to_string(),
                manifest.backend.sha256.clone(),
                editor_root_path.clone(),
            )
        } else {
            (
                manifest.editor.url.clone().unwrap_or_default(),
                manifest.editor.sha256.clone().unwrap_or_default(),
                editor_archive_path
                    .clone()
                    .context("editor archive path missing for archive-backed editor release.")?,
            )
        };

    let manifest_path = release_dir.join("manifest.json");
    fs::write(&manifest_path, serde_json::to_string_pretty(&manifest)?).with_context(|| {
        format!(
            "Failed to write staged manifest for release `{}`.",
            manifest.release_id
        )
    })?;

    let install_record = InstallRecord {
        release_id: manifest.release_id.clone(),
        backend: InstalledArtifact {
            name: manifest.backend.name.clone(),
            version: manifest.backend.version.clone(),
            sha256: manifest.backend.sha256.clone(),
            source: manifest.backend.wheel_url.clone(),
            staged_path: backend_wheel_path.clone(),
        },
        editor: InstalledArtifact {
            name: "editor".into(),
            version: manifest.editor.version.clone(),
            sha256: editor_sha256,
            source: editor_source,
            staged_path: editor_staged_path,
        },
        python_runtime: InstalledArtifact {
            name: "python-runtime".into(),
            version: manifest.python_runtime.version.clone(),
            sha256: manifest.python_runtime.sha256.clone(),
            source: manifest.python_runtime.url.clone(),
            staged_path: python_runtime_archive_path.clone(),
        },
        bundles: installed_bundles,
    };
    let install_record_path = release_dir.join("backend").join("install-record.json");
    fs::write(
        &install_record_path,
        serde_json::to_string_pretty(&install_record)?,
    )
    .with_context(|| {
        format!(
            "Failed to write install record for release `{}`.",
            manifest.release_id
        )
    })?;

    Ok(StagedReleaseSummary {
        release_id: manifest.release_id,
        manifest_path,
        backend_wheel_path,
        editor_archive_path,
        editor_root_path,
        python_runtime_archive_path,
        python_executable_path,
        backend_site_packages_path,
        bundle_paths,
    })
}

pub fn activate_release(paths: &LauncherPaths, release_id: &str) -> Result<ActiveReleaseState> {
    let manifest_path = paths.release_dir(release_id).join("manifest.json");
    if !manifest_path.is_file() {
        bail!(
            "Release `{release_id}` is not staged. Expected manifest `{}`.",
            manifest_path.display()
        );
    }
    let manifest = load_manifest_from_source(
        manifest_path
            .to_str()
            .context("Staged manifest path is not valid UTF-8.")?,
    )?;
    let state = ActiveReleaseState::from_manifest(&manifest);
    let store = ActiveReleaseStore::new(paths.state_dir().join("active-release.json"));
    store.save(&state)?;
    Ok(state)
}

/// 런처 자가진단 결과. `doctor`가 사람/게이트가 읽을 수 있게 노출한다. 네트워크·외부
/// 의존성 없이 로컬 상태만 본다(빠르고 오프라인 안전). 발행 아티팩트의 원격 reachability는
/// 별도 릴리즈 게이트(`verifyPublishedRelease.py`)가 담당한다.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SelfCheckReport {
    /// installs 디렉터리에 실제로 파일을 쓰고 지울 수 있는가.
    pub installs_writable: bool,
    /// 점검 대상이 된 활성 릴리즈 id(없으면 None).
    pub active_release_id: Option<String>,
    /// 스테이징된 백엔드 wheel을 재해시한 결과: `ok` / `mismatch` / `missing` /
    /// `missingRecord` / `noActiveRelease`.
    pub backend_wheel_integrity: String,
    /// 재해시로 무결성을 확인한 아티팩트 개수.
    pub checked_artifacts: u32,
}

/// 로컬 설치 상태를 자가진단한다. `doctor`에서 호출.
pub fn self_check(paths: &LauncherPaths) -> SelfCheckReport {
    let installs_writable = probe_writable(&paths.installs_dir());
    let store = ActiveReleaseStore::new(paths.state_dir().join("active-release.json"));
    let active = store.load_optional().ok().flatten();
    let Some(active) = active else {
        return SelfCheckReport {
            installs_writable,
            active_release_id: None,
            backend_wheel_integrity: "noActiveRelease".into(),
            checked_artifacts: 0,
        };
    };
    let record_path = paths
        .release_dir(&active.release_id)
        .join("backend")
        .join("install-record.json");
    let (integrity, checked) = match load_install_record(&record_path) {
        Some(record) => (
            verify_staged_artifact(&record.backend.staged_path, &record.backend.sha256),
            1,
        ),
        None => ("missingRecord".to_string(), 0),
    };
    SelfCheckReport {
        installs_writable,
        active_release_id: Some(active.release_id),
        backend_wheel_integrity: integrity,
        checked_artifacts: checked,
    }
}

fn probe_writable(dir: &Path) -> bool {
    if fs::create_dir_all(dir).is_err() {
        return false;
    }
    let probe = dir.join(".codaro-write-probe");
    match fs::write(&probe, b"ok") {
        Ok(()) => {
            fs::remove_file(&probe).ok();
            true
        }
        Err(_) => false,
    }
}

fn load_install_record(path: &Path) -> Option<InstallRecord> {
    let text = fs::read_to_string(path).ok()?;
    serde_json::from_str(&text).ok()
}

fn verify_staged_artifact(staged_path: &Path, expected_sha256: &str) -> String {
    match fs::read(staged_path) {
        Ok(bytes) => {
            if sha256_hex(&bytes) == expected_sha256.to_ascii_lowercase() {
                "ok".to_string()
            } else {
                "mismatch".to_string()
            }
        }
        Err(_) => "missing".to_string(),
    }
}

fn installed_bundle(bundle: &BundleArtifact, staged_path: PathBuf) -> InstalledArtifact {
    InstalledArtifact {
        name: bundle.package_name.clone(),
        version: bundle.version.clone(),
        sha256: bundle.sha256.clone(),
        source: bundle.wheel_url.clone(),
        staged_path,
    }
}

fn backend_wheel_editor_root(site_packages_dir: &Path, backend_package_name: &str) -> PathBuf {
    site_packages_dir
        .join(backend_package_name.replace('-', "_"))
        .join("webBuild")
}

fn verify_editor_build_root(editor_root: &Path) -> Result<()> {
    let index_path = editor_root.join("index.html");
    let assets_path = editor_root.join("_app");
    if index_path.is_file() && assets_path.is_dir() {
        return Ok(());
    }
    bail!(
        "Editor build root `{}` is incomplete. Expected `index.html` and `_app/`.",
        editor_root.display()
    );
}

fn stage_artifact(
    download_dir: &Path,
    destination_dir: &Path,
    source: &str,
    expected_sha256: &str,
    progress: &dyn Fn(u64, Option<u64>),
) -> Result<PathBuf> {
    fs::create_dir_all(download_dir).with_context(|| {
        format!(
            "Failed to create launcher download directory `{}`.",
            download_dir.display()
        )
    })?;
    fs::create_dir_all(destination_dir).with_context(|| {
        format!(
            "Failed to create launcher destination directory `{}`.",
            destination_dir.display()
        )
    })?;

    let file_name = source_file_name(source)?;
    let download_path = download_dir.join(&file_name);
    let destination_path = destination_dir.join(file_name);
    let expected = expected_sha256.to_ascii_lowercase();

    if is_remote_http_source(source) {
        // 느린/불안정 회선 내성: 스트리밍 + 재시도 + Range resume + stall timeout.
        download_remote_artifact(source, &download_path, &expected, progress)?;
    } else {
        // 로컬 경로 / file:// 는 작고 신뢰 가능하므로 통째로 읽어 검증.
        let bytes = read_source_bytes(source)?;
        let actual_sha256 = sha256_hex(&bytes);
        if actual_sha256 != expected {
            bail!(
                "Artifact sha256 mismatch for `{source}`. expected `{expected}`, got `{actual_sha256}`."
            );
        }
        fs::write(&download_path, &bytes).with_context(|| {
            format!(
                "Failed to write downloaded artifact cache `{}`.",
                download_path.display()
            )
        })?;
    }

    // 다운로드 캐시(downloads_dir) → 스테이징 위치(release dir)로 복사.
    fs::copy(&download_path, &destination_path).with_context(|| {
        format!(
            "Failed to write staged artifact `{}`.",
            destination_path.display()
        )
    })?;
    Ok(destination_path)
}

/// http/https 아티팩트를 견고하게 받아 `download_path`로 떨군다. sha 불일치 시 손상된
/// 캐시를 폐기하고 처음부터 1회 재다운로드한다(전송 손상은 일시적일 수 있으므로). 두 번째도
/// 불일치면 아티팩트 자체가 잘못된 것이므로 영구 실패.
fn download_remote_artifact(
    source: &str,
    download_path: &Path,
    expected: &str,
    progress: &dyn Fn(u64, Option<u64>),
) -> Result<()> {
    let config = DownloadConfig::default();
    let mut last_actual = String::new();
    for _ in 0..2 {
        let actual = download::download_to_file(source, download_path, &config, progress)
            .with_context(|| format!("Failed to download `{source}`."))?;
        if actual == expected {
            return Ok(());
        }
        last_actual = actual;
        fs::remove_file(download_path).ok();
    }
    bail!("Artifact sha256 mismatch for `{source}`. expected `{expected}`, got `{last_actual}`.");
}

/// 소스가 원격 http/https URL인지 판정한다. 존재하는 로컬 경로와 `file://`은 false.
fn is_remote_http_source(source: &str) -> bool {
    if Path::new(source).exists() {
        return false;
    }
    match Url::parse(source) {
        Ok(url) => matches!(url.scheme(), "http" | "https"),
        Err(_) => false,
    }
}

fn read_source_bytes(source: &str) -> Result<Vec<u8>> {
    let source_path = Path::new(source);
    if source_path.exists() {
        return fs::read(source_path)
            .with_context(|| format!("Failed to read local file source `{source}`."));
    }

    let url = Url::parse(source).with_context(|| format!("Unsupported source `{source}`."))?;
    match url.scheme() {
        "file" => {
            let path = url.to_file_path().map_err(|_| {
                anyhow::anyhow!("Failed to convert file URL `{source}` to a local path.")
            })?;
            fs::read(&path)
                .with_context(|| format!("Failed to read file URL source `{}`.", path.display()))
        }
        "http" | "https" => {
            // 이 경로는 작은 페이로드(매니페스트 JSON 등) 전용 — 큰 아티팩트는
            // `download::download_to_file`가 처리한다. 작은 본문이라 전체 timeout이 안전.
            let client = Client::builder()
                .connect_timeout(Duration::from_secs(15))
                .timeout(Duration::from_secs(60))
                .build()
                .context("Failed to build HTTP client for launcher download.")?;
            let response = client
                .get(url.clone())
                .send()
                .with_context(|| format!("Failed to download `{source}`."))?
                .error_for_status()
                .with_context(|| format!("Artifact request failed for `{source}`."))?;
            response
                .bytes()
                .map(|bytes| bytes.to_vec())
                .with_context(|| format!("Failed to read response bytes for `{source}`."))
        }
        other => bail!("Unsupported source scheme `{other}` for `{source}`."),
    }
}

fn source_file_name(source: &str) -> Result<String> {
    let source_path = Path::new(source);
    if source_path.exists() {
        let file_name = source_path
            .file_name()
            .context("Local source path does not have a file name.")?;
        return Ok(file_name.to_string_lossy().into_owned());
    }

    let url = Url::parse(source).with_context(|| format!("Unsupported source `{source}`."))?;
    match url.scheme() {
        "file" => {
            let path = url.to_file_path().map_err(|_| {
                anyhow::anyhow!("Failed to convert file URL `{source}` to a local path.")
            })?;
            let file_name = path
                .file_name()
                .context("File URL source does not have a file name.")?;
            Ok(file_name.to_string_lossy().into_owned())
        }
        "http" | "https" => {
            let file_name = Path::new(url.path())
                .file_name()
                .context("HTTP source URL does not include a file name.")?;
            Ok(file_name.to_string_lossy().into_owned())
        }
        other => bail!("Unsupported source scheme `{other}` for `{source}`."),
    }
}

fn sha256_hex(bytes: &[u8]) -> String {
    let digest = Sha256::digest(bytes);
    let mut output = String::with_capacity(digest.len() * 2);
    for byte in digest {
        output.push_str(&format!("{byte:02x}"));
    }
    output
}

fn extract_zip_archive(archive_path: &Path, destination_dir: &Path) -> Result<()> {
    if destination_dir.exists() {
        fs::remove_dir_all(destination_dir).with_context(|| {
            format!(
                "Failed to clear extraction directory `{}`.",
                destination_dir.display()
            )
        })?;
    }
    fs::create_dir_all(destination_dir).with_context(|| {
        format!(
            "Failed to create extraction directory `{}`.",
            destination_dir.display()
        )
    })?;

    let archive_file = File::open(archive_path)
        .with_context(|| format!("Failed to open archive `{}`.", archive_path.display()))?;
    let mut archive = ZipArchive::new(archive_file)
        .with_context(|| format!("Failed to read zip archive `{}`.", archive_path.display()))?;
    let entries = archive_entry_metadata(&mut archive)?;
    let strip_root = common_archive_root(&entries);

    for index in 0..archive.len() {
        let mut file = archive.by_index(index).with_context(|| {
            format!(
                "Failed to read archive entry {} from `{}`.",
                index,
                archive_path.display()
            )
        })?;
        let entry_name = file.name().to_string();
        let Some(relative_path) =
            archive_output_path(&entry_name, file.is_dir(), strip_root.as_deref())?
        else {
            continue;
        };
        let output_path = destination_dir.join(relative_path);
        if file.is_dir() {
            fs::create_dir_all(&output_path).with_context(|| {
                format!(
                    "Failed to create archive directory `{}`.",
                    output_path.display()
                )
            })?;
            continue;
        }
        if let Some(parent) = output_path.parent() {
            fs::create_dir_all(parent).with_context(|| {
                format!("Failed to create archive parent `{}`.", parent.display())
            })?;
        }
        let mut output = File::create(&output_path).with_context(|| {
            format!(
                "Failed to create extracted file `{}`.",
                output_path.display()
            )
        })?;
        io::copy(&mut file, &mut output).with_context(|| {
            format!(
                "Failed to extract archive file `{}`.",
                output_path.display()
            )
        })?;
        #[cfg(unix)]
        if let Some(mode) = file.unix_mode() {
            fs::set_permissions(&output_path, fs::Permissions::from_mode(mode)).with_context(
                || {
                    format!(
                        "Failed to set extracted permissions for `{}`.",
                        output_path.display()
                    )
                },
            )?;
        }
    }

    Ok(())
}

fn install_wheels_into_site_packages(
    python_executable: &Path,
    site_packages_dir: &Path,
    wheel_paths: &[PathBuf],
    logs_dir: &Path,
) -> Result<()> {
    if wheel_paths.is_empty() {
        return Ok(());
    }

    ensure_pip_available(python_executable, logs_dir)?;
    fs::create_dir_all(site_packages_dir).with_context(|| {
        format!(
            "Failed to create backend site-packages directory `{}`.",
            site_packages_dir.display()
        )
    })?;
    let (stdout_log, stderr_log) = open_process_logs(logs_dir, "provision-wheel-install")?;

    let mut command = Command::new(python_executable);
    command
        .arg("-m")
        .arg("pip")
        .arg("install")
        .arg("--disable-pip-version-check")
        .arg("--no-compile")
        .arg("--no-deps")
        .arg("--target")
        .arg(site_packages_dir)
        .stdout(Stdio::from(stdout_log))
        .stderr(Stdio::from(stderr_log));
    for wheel_path in wheel_paths {
        command.arg(wheel_path);
    }
    apply_no_window(&mut command);

    let status = command.status().with_context(|| {
        format!(
            "Failed to run wheel installer with `{}`.",
            python_executable.display()
        )
    })?;
    if status.success() {
        return Ok(());
    }
    bail!("Wheel installation exited with status {status}.");
}

fn ensure_pip_available(python_executable: &Path, logs_dir: &Path) -> Result<()> {
    let mut pip_probe = Command::new(python_executable);
    pip_probe
        .arg("-m")
        .arg("pip")
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null());
    apply_no_window(&mut pip_probe);
    let pip_status = pip_probe.status().with_context(|| {
        format!(
            "Failed to probe pip using `{}`.",
            python_executable.display()
        )
    })?;
    if pip_status.success() {
        return Ok(());
    }

    let (stdout_log, stderr_log) = open_process_logs(logs_dir, "provision-ensurepip")?;
    let mut ensurepip = Command::new(python_executable);
    ensurepip
        .arg("-m")
        .arg("ensurepip")
        .arg("--upgrade")
        .stdout(Stdio::from(stdout_log))
        .stderr(Stdio::from(stderr_log));
    apply_no_window(&mut ensurepip);
    let ensurepip_status = ensurepip.status().with_context(|| {
        format!(
            "Failed to bootstrap pip using `{}`.",
            python_executable.display()
        )
    })?;
    if ensurepip_status.success() {
        return Ok(());
    }
    bail!("ensurepip exited with status {ensurepip_status}.");
}

fn open_process_logs(logs_dir: &Path, prefix: &str) -> Result<(File, File)> {
    fs::create_dir_all(logs_dir).with_context(|| {
        format!(
            "Failed to create launcher log directory `{}`.",
            logs_dir.display()
        )
    })?;
    let path = logs_dir.join(format!("{prefix}-{}.log", unix_millis()));
    let stdout_log = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .with_context(|| format!("Failed to open launcher log `{}`.", path.display()))?;
    let stderr_log = stdout_log
        .try_clone()
        .with_context(|| format!("Failed to clone launcher log `{}`.", path.display()))?;
    Ok((stdout_log, stderr_log))
}

fn unix_millis() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or(0)
}

#[cfg(windows)]
fn apply_no_window(command: &mut Command) {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    command.creation_flags(CREATE_NO_WINDOW);
}

#[cfg(not(windows))]
fn apply_no_window(_command: &mut Command) {}

#[derive(Debug, Clone)]
struct ArchiveEntryMetadata {
    name: String,
    is_dir: bool,
}

fn archive_entry_metadata(archive: &mut ZipArchive<File>) -> Result<Vec<ArchiveEntryMetadata>> {
    let mut output = Vec::with_capacity(archive.len());
    for index in 0..archive.len() {
        let file = archive
            .by_index(index)
            .with_context(|| format!("Failed to inspect archive entry {index}."))?;
        output.push(ArchiveEntryMetadata {
            name: file.name().to_string(),
            is_dir: file.is_dir(),
        });
    }
    Ok(output)
}

fn common_archive_root(entries: &[ArchiveEntryMetadata]) -> Option<String> {
    let mut root: Option<String> = None;
    for entry in entries {
        let normalized = entry.name.replace('\\', "/");
        let segments: Vec<&str> = normalized
            .split('/')
            .filter(|segment| !segment.is_empty())
            .collect();
        if segments.is_empty() || segments.first() == Some(&"__MACOSX") {
            continue;
        }
        if entry.is_dir && segments.len() == 1 {
            continue;
        }
        if segments.len() == 1 {
            return None;
        }
        match &root {
            Some(existing) if existing != segments[0] => return None,
            Some(_) => {}
            None => root = Some(segments[0].to_string()),
        }
    }
    root
}

fn archive_output_path(
    entry_name: &str,
    is_dir: bool,
    strip_root: Option<&str>,
) -> Result<Option<PathBuf>> {
    let normalized = entry_name.replace('\\', "/");
    let mut parts = Vec::new();
    for component in Path::new(&normalized).components() {
        match component {
            Component::Normal(segment) => parts.push(segment.to_string_lossy().into_owned()),
            Component::CurDir => {}
            Component::Prefix(_) | Component::RootDir | Component::ParentDir => {
                bail!("Archive entry `{entry_name}` contains an unsafe path.");
            }
        }
    }
    if parts.is_empty() || parts.first().is_some_and(|part| part == "__MACOSX") {
        return Ok(None);
    }

    let mut start_index = 0;
    if let Some(root) = strip_root {
        if parts.first().is_some_and(|part| part == root) {
            start_index = 1;
        }
    }
    if start_index >= parts.len() {
        if is_dir {
            return Ok(None);
        }
        bail!("Archive entry `{entry_name}` does not contain a relative output path.");
    }

    let mut output = PathBuf::new();
    for part in parts.iter().skip(start_index) {
        output.push(part);
    }
    Ok(Some(output))
}

#[cfg(test)]
mod tests {
    use super::{
        InstallRecord, activate_release, load_manifest_from_source, sha256_hex, stage_release,
    };
    use crate::paths::LauncherPaths;
    use crate::state::ActiveReleaseStore;
    use std::env;
    use std::fs;
    use std::path::{Path, PathBuf};
    use std::process::Command;
    use tempfile::tempdir;
    use url::Url;
    use zip::CompressionMethod;
    use zip::write::SimpleFileOptions;

    #[test]
    fn load_manifest_from_local_source_path() {
        let temp_dir = tempdir().unwrap();
        let manifest_path = temp_dir.path().join("manifest.json");
        fs::write(
            &manifest_path,
            sample_manifest_json(
                "2026.03.18-1",
                "https://example.com/python.zip",
                "a".repeat(64),
                "https://example.com/editor.zip",
                "b".repeat(64),
                "https://example.com/codaro.whl",
                "c".repeat(64),
                vec![],
            ),
        )
        .unwrap();

        let manifest = load_manifest_from_source(manifest_path.to_str().unwrap()).unwrap();

        assert_eq!(manifest.release_id, "2026.03.18-1");
    }

    #[test]
    fn stage_release_downloads_and_records_artifacts() {
        let temp_dir = tempdir().unwrap();
        let source_dir = temp_dir.path().join("source");
        fs::create_dir_all(&source_dir).unwrap();

        let python_path = write_runtime_archive(&source_dir, "python-runtime.zip");
        let editor_path = write_editor_archive(&source_dir, "editor.zip");
        let backend_path = write_wheel_archive(
            &source_dir,
            "codaro-0.3.0-py3-none-any.whl",
            "codaro",
            "0.3.0",
            vec![
                (
                    "codaro/__init__.py".into(),
                    "__all__ = ['cli']\n".as_bytes().to_vec(),
                ),
                (
                    "codaro/cli.py".into(),
                    "def main():\n    return 'ok'\n".as_bytes().to_vec(),
                ),
            ],
        );
        let bundle_path = write_wheel_archive(
            &source_dir,
            "codaro_excel-0.3.0-py3-none-any.whl",
            "codaro_excel",
            "0.3.0",
            vec![(
                "codaro_excel/__init__.py".into(),
                "__all__ = []\n".as_bytes().to_vec(),
            )],
        );

        let manifest_path = temp_dir.path().join("manifest.json");
        fs::write(
            &manifest_path,
            sample_manifest_json(
                "2026.03.18-1",
                &Url::from_file_path(&python_path).unwrap().to_string(),
                sha256_hex(&fs::read(&python_path).unwrap()),
                &Url::from_file_path(&editor_path).unwrap().to_string(),
                sha256_hex(&fs::read(&editor_path).unwrap()),
                &Url::from_file_path(&backend_path).unwrap().to_string(),
                sha256_hex(&fs::read(&backend_path).unwrap()),
                vec![(
                    "excel".into(),
                    "codaro-excel".into(),
                    Url::from_file_path(&bundle_path).unwrap().to_string(),
                    sha256_hex(&fs::read(&bundle_path).unwrap()),
                )],
            ),
        )
        .unwrap();

        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();

        let summary = stage_release(&paths, manifest_path.to_str().unwrap()).unwrap();
        let install_record: InstallRecord = serde_json::from_str(
            &fs::read_to_string(
                paths
                    .release_dir("2026.03.18-1")
                    .join("backend")
                    .join("install-record.json"),
            )
            .unwrap(),
        )
        .unwrap();

        assert!(summary.manifest_path.is_file());
        assert!(summary.backend_wheel_path.is_file());
        assert!(
            summary
                .editor_archive_path
                .as_ref()
                .is_some_and(|path| path.is_file())
        );
        assert!(summary.python_runtime_archive_path.is_file());
        assert!(summary.editor_root_path.join("index.html").is_file());
        assert!(
            summary
                .backend_site_packages_path
                .join("codaro")
                .join("cli.py")
                .is_file()
        );
        assert!(
            summary
                .backend_site_packages_path
                .join("codaro_excel")
                .join("__init__.py")
                .is_file()
        );
        assert!(summary.python_executable_path.is_file());
        assert_eq!(summary.bundle_paths.len(), 1);
        assert_eq!(install_record.release_id, "2026.03.18-1");
        assert_eq!(install_record.backend.name, "codaro");
        assert_eq!(install_record.bundles[0].name, "codaro-excel");
    }

    #[test]
    fn stage_release_can_use_editor_build_bundled_in_backend_wheel() {
        let temp_dir = tempdir().unwrap();
        let source_dir = temp_dir.path().join("source");
        fs::create_dir_all(&source_dir).unwrap();

        let python_path = write_runtime_archive(&source_dir, "python-runtime.zip");
        let backend_path = write_wheel_archive(
            &source_dir,
            "codaro-0.3.0-py3-none-any.whl",
            "codaro",
            "0.3.0",
            vec![
                (
                    "codaro/cli.py".into(),
                    "def main():\n    return 'ok'\n".as_bytes().to_vec(),
                ),
                (
                    "codaro/webBuild/index.html".into(),
                    "<!doctype html><title>Codaro</title>".as_bytes().to_vec(),
                ),
                (
                    "codaro/webBuild/_app/app.js".into(),
                    "console.log('codaro')\n".as_bytes().to_vec(),
                ),
            ],
        );

        let manifest_path = temp_dir.path().join("manifest.json");
        fs::write(
            &manifest_path,
            sample_backend_wheel_editor_manifest_json(
                "2026.03.18-wheel",
                &Url::from_file_path(&python_path).unwrap().to_string(),
                sha256_hex(&fs::read(&python_path).unwrap()),
                &Url::from_file_path(&backend_path).unwrap().to_string(),
                sha256_hex(&fs::read(&backend_path).unwrap()),
            ),
        )
        .unwrap();

        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();

        let summary = stage_release(&paths, manifest_path.to_str().unwrap()).unwrap();
        let install_record: InstallRecord = serde_json::from_str(
            &fs::read_to_string(
                paths
                    .release_dir("2026.03.18-wheel")
                    .join("backend")
                    .join("install-record.json"),
            )
            .unwrap(),
        )
        .unwrap();

        assert!(summary.editor_archive_path.is_none());
        assert!(summary.editor_root_path.join("index.html").is_file());
        assert!(summary.editor_root_path.join("_app").is_dir());
        assert!(
            summary
                .editor_root_path
                .ends_with(Path::new("site-packages").join("codaro").join("webBuild"))
        );
        assert_eq!(install_record.editor.source, "backendWheel:codaro/webBuild");
        assert_eq!(install_record.editor.staged_path, summary.editor_root_path);
    }

    #[test]
    fn activate_release_writes_active_state() {
        let temp_dir = tempdir().unwrap();
        let source_dir = temp_dir.path().join("source");
        fs::create_dir_all(&source_dir).unwrap();

        let python_path = write_runtime_archive(&source_dir, "python-runtime.zip");
        let editor_path = write_editor_archive(&source_dir, "editor.zip");
        let backend_path = write_wheel_archive(
            &source_dir,
            "codaro-0.3.0-py3-none-any.whl",
            "codaro",
            "0.3.0",
            vec![(
                "codaro/cli.py".into(),
                "def main():\n    return 'ok'\n".as_bytes().to_vec(),
            )],
        );

        let manifest_path = temp_dir.path().join("manifest.json");
        fs::write(
            &manifest_path,
            sample_manifest_json(
                "2026.03.18-1",
                &Url::from_file_path(&python_path).unwrap().to_string(),
                sha256_hex(&fs::read(&python_path).unwrap()),
                &Url::from_file_path(&editor_path).unwrap().to_string(),
                sha256_hex(&fs::read(&editor_path).unwrap()),
                &Url::from_file_path(&backend_path).unwrap().to_string(),
                sha256_hex(&fs::read(&backend_path).unwrap()),
                vec![],
            ),
        )
        .unwrap();

        let paths = LauncherPaths::discover(Some(temp_dir.path().join("Codaro"))).unwrap();
        paths.ensure_layout().unwrap();
        stage_release(&paths, manifest_path.to_str().unwrap()).unwrap();

        let active = activate_release(&paths, "2026.03.18-1").unwrap();
        let stored = ActiveReleaseStore::new(paths.state_dir().join("active-release.json"))
            .load_optional()
            .unwrap()
            .unwrap();

        assert_eq!(active.release_id, "2026.03.18-1");
        assert_eq!(stored.backend_entry_module, "codaro.cli");
    }

    fn write_runtime_archive(directory: &Path, file_name: &str) -> PathBuf {
        let archive_path = directory.join(file_name);
        let python = discover_test_python();
        if cfg!(windows) {
            write_zip_archive(
                &archive_path,
                vec![(
                    "python/python.cmd".into(),
                    format!("@echo off\r\n\"{}\" %*\r\n", python.display())
                        .as_bytes()
                        .to_vec(),
                )],
            );
            return archive_path;
        }

        write_zip_archive(
            &archive_path,
            vec![(
                "python/bin/python3".into(),
                format!("#!/bin/sh\n\"{}\" \"$@\"\n", python.display())
                    .as_bytes()
                    .to_vec(),
            )],
        );
        archive_path
    }

    fn write_editor_archive(directory: &Path, file_name: &str) -> PathBuf {
        let archive_path = directory.join(file_name);
        write_zip_archive(
            &archive_path,
            vec![
                (
                    "editor/index.html".into(),
                    "<!doctype html><title>Codaro</title>".as_bytes().to_vec(),
                ),
                (
                    "editor/_app/app.js".into(),
                    "console.log('codaro')\n".as_bytes().to_vec(),
                ),
            ],
        );
        archive_path
    }

    fn write_wheel_archive(
        directory: &Path,
        file_name: &str,
        package_name: &str,
        version: &str,
        package_files: Vec<(String, Vec<u8>)>,
    ) -> PathBuf {
        let wheel_path = directory.join(file_name);
        let distribution = package_name.replace('-', "_");
        let dist_info_dir = format!("{distribution}-{version}.dist-info");
        let mut entries = package_files;
        entries.push((
            format!("{dist_info_dir}/WHEEL"),
            b"Wheel-Version: 1.0\nGenerator: codaro-launcher-test\nRoot-Is-Purelib: true\nTag: py3-none-any\n".to_vec(),
        ));
        entries.push((
            format!("{dist_info_dir}/METADATA"),
            format!("Metadata-Version: 2.1\nName: {package_name}\nVersion: {version}\n")
                .as_bytes()
                .to_vec(),
        ));
        entries.push((format!("{dist_info_dir}/RECORD"), Vec::new()));
        write_zip_archive(&wheel_path, entries);
        wheel_path
    }

    fn write_zip_archive(path: &Path, entries: Vec<(String, Vec<u8>)>) {
        let file = fs::File::create(path).unwrap();
        let mut zip = zip::ZipWriter::new(file);
        for (name, bytes) in entries {
            let options =
                SimpleFileOptions::default().compression_method(CompressionMethod::Stored);
            #[cfg(unix)]
            let options = if name.ends_with("python3") || name.ends_with("python") {
                options.unix_permissions(0o755)
            } else {
                options
            };
            zip.start_file(name, options).unwrap();
            use std::io::Write;
            zip.write_all(&bytes).unwrap();
        }
        zip.finish().unwrap();
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

        panic!("No Python executable is available for launcher provisioning tests.");
    }

    fn sample_manifest_json(
        release_id: &str,
        python_url: &str,
        python_sha256: String,
        editor_url: &str,
        editor_sha256: String,
        backend_url: &str,
        backend_sha256: String,
        bundles: Vec<(String, String, String, String)>,
    ) -> String {
        let bundle_payload: Vec<serde_json::Value> = bundles
            .into_iter()
            .map(|(name, package_name, wheel_url, sha256)| {
                serde_json::json!({
                    "name": name,
                    "packageName": package_name,
                    "version": "0.3.0",
                    "required": false,
                    "wheelUrl": wheel_url,
                    "sha256": sha256,
                })
            })
            .collect();

        serde_json::json!({
            "manifestVersion": 1,
            "channel": "stable",
            "releaseId": release_id,
            "launcherVersion": "0.3.0",
            "minLauncherVersion": "0.3.0",
            "pythonRuntime": {
                "version": "3.12.12",
                "url": python_url,
                "sha256": python_sha256,
            },
            "editor": {
                "version": "0.3.0",
                "url": editor_url,
                "sha256": editor_sha256,
            },
            "backend": {
                "name": "codaro",
                "version": "0.3.0",
                "wheelUrl": backend_url,
                "sha256": backend_sha256,
                "entryModule": "codaro.cli",
                "consoleScript": "codaro",
            },
            "bundles": bundle_payload,
        })
        .to_string()
    }

    fn sample_backend_wheel_editor_manifest_json(
        release_id: &str,
        python_url: &str,
        python_sha256: String,
        backend_url: &str,
        backend_sha256: String,
    ) -> String {
        serde_json::json!({
            "manifestVersion": 1,
            "channel": "stable",
            "releaseId": release_id,
            "launcherVersion": "0.3.0",
            "minLauncherVersion": "0.3.0",
            "pythonRuntime": {
                "version": "3.12.12",
                "url": python_url,
                "sha256": python_sha256,
            },
            "editor": {
                "version": "0.3.0",
                "source": "backendWheel",
            },
            "backend": {
                "name": "codaro",
                "version": "0.3.0",
                "wheelUrl": backend_url,
                "sha256": backend_sha256,
                "entryModule": "codaro.cli",
                "consoleScript": "codaro",
            },
            "bundles": [],
        })
        .to_string()
    }
}
