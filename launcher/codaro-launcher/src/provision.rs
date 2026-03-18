use crate::manifest::{BundleArtifact, ReleaseManifest};
use crate::paths::LauncherPaths;
use crate::state::{ActiveReleaseState, ActiveReleaseStore};
use anyhow::{Context, Result, bail};
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::fs::File;
use std::io;
#[cfg(unix)]
use std::os::unix::fs::PermissionsExt;
use std::path::{Component, Path, PathBuf};
use std::process::{Command, Stdio};
use url::Url;
use zip::ZipArchive;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct StagedReleaseSummary {
    pub release_id: String,
    pub manifest_path: PathBuf,
    pub backend_wheel_path: PathBuf,
    pub frontend_archive_path: PathBuf,
    pub frontend_root_path: PathBuf,
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
    pub frontend: InstalledArtifact,
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
    let frontend_archive_dir = release_dir.join("frontend").join("archive");
    let frontend_root_path = paths.release_frontend_dir(&manifest.release_id);
    let runtime_archive_dir = release_dir.join("runtime").join("archive");
    let python_runtime_dir = paths.release_python_runtime_dir(&manifest.release_id);
    let bundle_wheels_dir = release_dir.join("bundles").join("wheels");

    for directory in [
        backend_site_packages_path.clone(),
        backend_wheels_dir.clone(),
        frontend_archive_dir.clone(),
        frontend_root_path.clone(),
        runtime_archive_dir.clone(),
        python_runtime_dir.clone(),
        bundle_wheels_dir.clone(),
        downloads_dir.clone(),
    ] {
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
    )?;
    let frontend_archive_path = stage_artifact(
        &downloads_dir.join("frontend"),
        &frontend_archive_dir,
        &manifest.frontend.url,
        &manifest.frontend.sha256,
    )?;
    let python_runtime_archive_path = stage_artifact(
        &downloads_dir.join("runtime"),
        &runtime_archive_dir,
        &manifest.python_runtime.url,
        &manifest.python_runtime.sha256,
    )?;
    extract_zip_archive(&frontend_archive_path, &frontend_root_path)?;
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
    )?;

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
        frontend: InstalledArtifact {
            name: "frontend".into(),
            version: manifest.frontend.version.clone(),
            sha256: manifest.frontend.sha256.clone(),
            source: manifest.frontend.url.clone(),
            staged_path: frontend_archive_path.clone(),
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
        frontend_archive_path,
        frontend_root_path,
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

fn installed_bundle(bundle: &BundleArtifact, staged_path: PathBuf) -> InstalledArtifact {
    InstalledArtifact {
        name: bundle.package_name.clone(),
        version: bundle.version.clone(),
        sha256: bundle.sha256.clone(),
        source: bundle.wheel_url.clone(),
        staged_path,
    }
}

fn stage_artifact(
    download_dir: &Path,
    destination_dir: &Path,
    source: &str,
    expected_sha256: &str,
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
    let bytes = read_source_bytes(source)?;
    let actual_sha256 = sha256_hex(&bytes);
    if actual_sha256 != expected_sha256.to_ascii_lowercase() {
        bail!(
            "Artifact sha256 mismatch for `{source}`. expected `{expected_sha256}`, got `{actual_sha256}`."
        );
    }

    fs::write(&download_path, &bytes).with_context(|| {
        format!(
            "Failed to write downloaded artifact cache `{}`.",
            download_path.display()
        )
    })?;
    fs::write(&destination_path, &bytes).with_context(|| {
        format!(
            "Failed to write staged artifact `{}`.",
            destination_path.display()
        )
    })?;
    Ok(destination_path)
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
            let client = Client::builder()
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
) -> Result<()> {
    if wheel_paths.is_empty() {
        return Ok(());
    }

    ensure_pip_available(python_executable)?;
    fs::create_dir_all(site_packages_dir).with_context(|| {
        format!(
            "Failed to create backend site-packages directory `{}`.",
            site_packages_dir.display()
        )
    })?;

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
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit());
    for wheel_path in wheel_paths {
        command.arg(wheel_path);
    }

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

fn ensure_pip_available(python_executable: &Path) -> Result<()> {
    let pip_status = Command::new(python_executable)
        .arg("-m")
        .arg("pip")
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .with_context(|| {
            format!(
                "Failed to probe pip using `{}`.",
                python_executable.display()
            )
        })?;
    if pip_status.success() {
        return Ok(());
    }

    let ensurepip_status = Command::new(python_executable)
        .arg("-m")
        .arg("ensurepip")
        .arg("--upgrade")
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status()
        .with_context(|| {
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
                "https://example.com/frontend.zip",
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
        let frontend_path = write_frontend_archive(&source_dir, "frontend.zip");
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
                &Url::from_file_path(&frontend_path).unwrap().to_string(),
                sha256_hex(&fs::read(&frontend_path).unwrap()),
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
        assert!(summary.frontend_archive_path.is_file());
        assert!(summary.python_runtime_archive_path.is_file());
        assert!(summary.frontend_root_path.join("index.html").is_file());
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
    fn activate_release_writes_active_state() {
        let temp_dir = tempdir().unwrap();
        let source_dir = temp_dir.path().join("source");
        fs::create_dir_all(&source_dir).unwrap();

        let python_path = write_runtime_archive(&source_dir, "python-runtime.zip");
        let frontend_path = write_frontend_archive(&source_dir, "frontend.zip");
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
                &Url::from_file_path(&frontend_path).unwrap().to_string(),
                sha256_hex(&fs::read(&frontend_path).unwrap()),
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

    fn write_frontend_archive(directory: &Path, file_name: &str) -> PathBuf {
        let archive_path = directory.join(file_name);
        write_zip_archive(
            &archive_path,
            vec![(
                "frontend/index.html".into(),
                "<!doctype html><title>Codaro</title>".as_bytes().to_vec(),
            )],
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
        frontend_url: &str,
        frontend_sha256: String,
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
            "frontend": {
                "version": "0.3.0",
                "url": frontend_url,
                "sha256": frontend_sha256,
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
}
