from __future__ import annotations

from collections.abc import Iterable
from contextlib import contextmanager
from datetime import UTC, datetime
import json
from pathlib import Path, PurePosixPath
import re
import shutil
import tempfile
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urljoin, urlparse
from urllib.request import Request, urlopen
import zipfile

import yaml
from pydantic import ValidationError

from ..curriculum.converter import yamlToDocument
from .packModel import PackInstallRecord, PackIssue, PackManifest, PackPreview

MANIFEST_NAMES = ("codaroPack.yaml", "codaroPack.yml")


class PackService:
    def __init__(self, storageRoot: Path | None = None, workspaceRoot: Path | None = None) -> None:
        if storageRoot is None:
            import os

            configuredRoot = os.environ.get("CODARO_PACK_STORE")
            if configuredRoot:
                storageRoot = Path(configuredRoot).expanduser()
            else:
                baseRoot = workspaceRoot.expanduser().resolve() if workspaceRoot is not None else _projectRoot()
                storageRoot = baseRoot / "localData" / "sharePacks"
        self.storageRoot = storageRoot.resolve()
        self.installedRoot = self.storageRoot / "installed"
        self.archiveRoot = self.storageRoot / "archive"
        self.indexPath = self.storageRoot / "index.json"

    def inspect(self, source: str) -> PackPreview:
        with self._materializeSource(source) as sourceRoot:
            return self._inspectRoot(sourceRoot, source)

    def install(self, source: str) -> PackInstallRecord:
        with self._materializeSource(source) as sourceRoot:
            preview = self._inspectRoot(sourceRoot, source)
            if not preview.installable or preview.manifest is None:
                messages = "; ".join(issue.message for issue in preview.issues if issue.severity == "error")
                raise ValueError(messages or "pack is not installable")

            manifest = preview.manifest
            installKey = _safeInstallKey(manifest.id, manifest.version)
            targetRoot = (self.installedRoot / installKey).resolve()
            packRoot = _packRoot(sourceRoot)
            self._replaceInstallRoot(packRoot, targetRoot)
            record = PackInstallRecord(
                id=manifest.id,
                version=manifest.version,
                title=manifest.title,
                author=manifest.author,
                source=source,
                installedAt=datetime.now(UTC).isoformat(timespec="seconds"),
                rootPath=str(targetRoot),
                contentCounts=dict(preview.contentCounts),
                contents={
                    "curricula": [_normalizeRelativePath(entry.path) for entry in manifest.contents.curricula],
                    "automations": [_normalizeRelativePath(entry.path) for entry in manifest.contents.automations],
                    "assets": [_normalizeRelativePath(entry.path) for entry in manifest.contents.assets],
                },
                packages=list(manifest.packages),
                permissions=dict(manifest.permissions),
            )
            records = [item for item in self.listInstalled() if item.id != record.id or item.version != record.version]
            records.append(record)
            self._saveIndex(records)
            return record

    def listInstalled(self) -> list[PackInstallRecord]:
        if not self.indexPath.exists():
            return []
        try:
            payload = json.loads(self.indexPath.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError, UnicodeDecodeError):
            return []
        records: list[PackInstallRecord] = []
        for item in payload.get("packs", []):
            if not isinstance(item, dict):
                continue
            try:
                records.append(PackInstallRecord(**item))
            except ValidationError:
                continue
        return records

    def uninstall(self, packId: str, version: str | None = None) -> bool:
        records = self.listInstalled()
        matched = [
            record
            for record in records
            if record.id == packId and (version is None or record.version == version)
        ]
        if not matched:
            return False
        remaining = [record for record in records if record not in matched]
        self._saveIndex(remaining)
        for record in matched:
            self._archiveInstallRoot(Path(record.rootPath))
        return True

    def exportArchive(self, sourceDir: str | Path, outputPath: str | Path) -> Path:
        root = Path(sourceDir).expanduser().resolve()
        if not root.is_dir():
            raise FileNotFoundError(f"Pack source directory not found: {root}")
        preview = self._inspectRoot(root, str(root))
        if not preview.installable:
            messages = "; ".join(issue.message for issue in preview.issues if issue.severity == "error")
            raise ValueError(messages or "pack is not exportable")

        target = Path(outputPath).expanduser().resolve()
        target.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for filePath in _iterPackFiles(root):
                relative = filePath.relative_to(root).as_posix()
                archive.write(filePath, relative)
        return target

    def loadCurriculumDocument(self, packId: str, contentPath: str, version: str | None = None) -> dict[str, Any]:
        record = self._findInstalled(packId, version)
        normalizedPath = _normalizeRelativePath(contentPath)
        if normalizedPath not in record.contents.get("curricula", []):
            raise FileNotFoundError(f"Curriculum is not declared by pack: {contentPath}")
        filePath = _safeJoin(Path(record.rootPath), normalizedPath)
        with filePath.open("r", encoding="utf-8") as file:
            yamlContent = yaml.safe_load(file)
        if not isinstance(yamlContent, dict):
            raise ValueError(f"Curriculum YAML must be an object: {contentPath}")
        category = yamlContent.get("meta", {}).get("category") if isinstance(yamlContent.get("meta"), dict) else ""
        document, solutions = yamlToDocument(yamlContent, str(category or "imported"), Path(contentPath).stem)
        return {
            "document": document.model_dump(mode="json"),
            "solutions": dict(solutions),
            "category": category or "imported",
            "contentId": Path(contentPath).stem,
            "prevNext": {"prev": None, "next": None},
            "packId": record.id,
            "packVersion": record.version,
            "contentPath": normalizedPath,
        }

    def loadAutomationRecipe(self, packId: str, contentPath: str, version: str | None = None) -> dict[str, Any]:
        record = self._findInstalled(packId, version)
        recipePath = self.resolveAutomationRecipePath(record, contentPath)
        content = recipePath.read_text(encoding="utf-8", errors="replace")
        return {
            "packId": record.id,
            "packVersion": record.version,
            "contentPath": _normalizeRelativePath(contentPath),
            "documentPath": str(recipePath),
            "content": content,
        }

    def resolveAutomationRecipePath(self, record: PackInstallRecord, contentPath: str) -> Path:
        normalizedPath = _normalizeRelativePath(contentPath)
        if normalizedPath not in record.contents.get("automations", []):
            raise FileNotFoundError(f"Automation is not declared by pack: {contentPath}")
        filePath = _safeJoin(Path(record.rootPath), normalizedPath)
        if not filePath.is_file():
            raise FileNotFoundError(f"Automation recipe not found: {contentPath}")
        return filePath

    def findInstalled(self, packId: str, version: str | None = None) -> PackInstallRecord:
        return self._findInstalled(packId, version)

    def _inspectRoot(self, sourceRoot: Path, sourceLabel: str) -> PackPreview:
        issues: list[PackIssue] = []
        manifestPath = _findManifestPath(sourceRoot)
        if manifestPath is None:
            return PackPreview(
                source=sourceLabel,
                manifest=None,
                issues=[_issue("error", "manifest-missing", "codaroPack.yaml is required.")],
            )

        packRoot = manifestPath.parent
        manifest = _loadManifest(manifestPath, issues)
        files = [path.relative_to(packRoot).as_posix() for path in _iterPackFiles(packRoot)]
        if manifest is None:
            return PackPreview(source=sourceLabel, manifest=None, issues=issues, files=files)

        issues.extend(_validateManifest(manifest))
        remoteManifest = _isHttpUrl(sourceLabel) and not _isZipUrl(sourceLabel)
        issues.extend(_validateDeclaredContent(packRoot, manifest, remoteManifest=remoteManifest))
        return PackPreview(
            source=sourceLabel,
            manifest=manifest,
            issues=issues,
            contentCounts={
                "curricula": len(manifest.contents.curricula),
                "automations": len(manifest.contents.automations),
                "assets": len(manifest.contents.assets),
            },
            files=files,
        )

    def _materializeSource(self, source: str):
        if _isHttpUrl(source):
            return self._materializeRemote(source)
        sourcePath = Path(source).expanduser().resolve()
        if sourcePath.is_dir():
            return _existingRoot(sourcePath)
        if sourcePath.is_file() and sourcePath.suffix.lower() == ".zip":
            return _zipRoot(sourcePath)
        raise FileNotFoundError(f"Pack source not found: {source}")

    @contextmanager
    def _materializeRemote(self, source: str):
        with tempfile.TemporaryDirectory(prefix="codaro-pack-") as tempDir:
            root = Path(tempDir)
            if _isZipUrl(source):
                zipPath = root / "pack.zip"
                _downloadFile(source, zipPath)
                with zipfile.ZipFile(zipPath) as archive:
                    _extractZipSafely(archive, root / "source")
                yield root / "source"
                return

            manifestPath = root / "source" / "codaroPack.yaml"
            manifestPath.parent.mkdir(parents=True, exist_ok=True)
            _downloadFile(source, manifestPath)
            issues: list[PackIssue] = []
            manifest = _loadManifest(manifestPath, issues)
            if manifest is None:
                yield manifestPath.parent
                return
            for relativePath in _declaredPaths(manifest):
                normalized = _normalizeRelativePath(relativePath)
                targetPath = _safeJoin(manifestPath.parent, normalized)
                targetPath.parent.mkdir(parents=True, exist_ok=True)
                relativeUrl = "/".join(quote(part) for part in normalized.split("/"))
                _downloadFile(urljoin(source, relativeUrl), targetPath)
            yield manifestPath.parent

    def _replaceInstallRoot(self, sourceRoot: Path, targetRoot: Path) -> None:
        self.installedRoot.mkdir(parents=True, exist_ok=True)
        if targetRoot.exists():
            self._archiveInstallRoot(targetRoot)
        if not _isWithin(targetRoot, self.installedRoot):
            raise ValueError(f"Install target escapes pack store: {targetRoot}")
        shutil.copytree(sourceRoot, targetRoot)

    def _archiveInstallRoot(self, installRoot: Path) -> None:
        resolved = installRoot.resolve()
        if not resolved.exists():
            return
        if not _isWithin(resolved, self.installedRoot):
            raise ValueError(f"Refusing to archive path outside pack store: {resolved}")
        self.archiveRoot.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now(UTC).strftime("%Y%m%d%H%M%S")
        archiveTarget = (self.archiveRoot / f"{resolved.name}-{stamp}").resolve()
        if not _isWithin(archiveTarget, self.archiveRoot):
            raise ValueError(f"Archive target escapes pack store: {archiveTarget}")
        shutil.move(str(resolved), str(archiveTarget))

    def _saveIndex(self, records: list[PackInstallRecord]) -> None:
        self.storageRoot.mkdir(parents=True, exist_ok=True)
        payload = {
            "version": 1,
            "packs": [record.model_dump(mode="json") for record in sorted(records, key=lambda item: item.id)],
        }
        self.indexPath.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    def _findInstalled(self, packId: str, version: str | None) -> PackInstallRecord:
        matches = [record for record in self.listInstalled() if record.id == packId]
        if version is not None:
            matches = [record for record in matches if record.version == version]
        if not matches:
            raise FileNotFoundError(f"Pack is not installed: {packId}")
        return sorted(matches, key=lambda record: record.installedAt)[-1]


@contextmanager
def _existingRoot(path: Path):
    yield path


@contextmanager
def _zipRoot(path: Path):
    with tempfile.TemporaryDirectory(prefix="codaro-pack-") as tempDir:
        root = Path(tempDir) / "source"
        with zipfile.ZipFile(path) as archive:
            _extractZipSafely(archive, root)
        yield root


def _loadManifest(path: Path, issues: list[PackIssue]) -> PackManifest | None:
    try:
        payload = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError, UnicodeDecodeError) as exc:
        issues.append(_issue("error", "manifest-read-failed", f"Manifest could not be read: {exc}", path.name))
        return None
    if not isinstance(payload, dict):
        issues.append(_issue("error", "manifest-invalid", "Manifest must be a YAML object.", path.name))
        return None
    try:
        return PackManifest(**payload)
    except ValidationError as exc:
        issues.append(_issue("error", "manifest-invalid", str(exc), path.name))
        return None


def _validateManifest(manifest: PackManifest) -> list[PackIssue]:
    issues: list[PackIssue] = []
    if manifest.kind != "codaroPack":
        issues.append(_issue("error", "kind-invalid", "kind must be codaroPack."))
    if manifest.specVersion != 1:
        issues.append(_issue("error", "spec-version-invalid", "Only codaroPack specVersion 1 is supported."))
    if not _validPackId(manifest.id):
        issues.append(_issue("error", "id-invalid", "id must contain letters, numbers, dots, underscores, or hyphens."))
    if not manifest.title.strip():
        issues.append(_issue("error", "title-missing", "title is required."))
    if not any([manifest.contents.curricula, manifest.contents.automations, manifest.contents.assets]):
        issues.append(_issue("error", "contents-missing", "At least one content entry is required."))
    for package in manifest.packages:
        if not _validPackageName(package):
            issues.append(_issue("error", "package-invalid", f"Invalid package name: {package}"))
    return issues


def _validateDeclaredContent(
    sourceRoot: Path,
    manifest: PackManifest,
    *,
    remoteManifest: bool,
) -> list[PackIssue]:
    issues: list[PackIssue] = []
    for path in _declaredPaths(manifest):
        try:
            normalizedPath = _normalizeRelativePath(path)
        except ValueError as exc:
            issues.append(_issue("error", "path-invalid", str(exc), path))
            continue
        filePath = _safeJoin(sourceRoot, normalizedPath)
        if remoteManifest and filePath.suffix == "":
            issues.append(_issue("error", "remote-directory-unsupported", "Remote manifest entries must be files.", normalizedPath))
            continue
        if not filePath.exists():
            issues.append(_issue("error", "content-missing", "Declared content file is missing.", normalizedPath))
            continue
        if filePath.is_dir():
            continue

    for entry in manifest.contents.curricula:
        issues.extend(_validateCurriculumEntry(sourceRoot, entry.path, manifest.packages))
    for entry in manifest.contents.automations:
        issues.extend(_validateAutomationEntry(sourceRoot, entry.path, manifest.permissions))
    return issues


def _validateCurriculumEntry(sourceRoot: Path, path: str, manifestPackages: list[str]) -> list[PackIssue]:
    issues: list[PackIssue] = []
    for filePath in _expandContentFiles(sourceRoot, path, suffix=".yaml"):
        relative = filePath.relative_to(sourceRoot).as_posix()
        try:
            payload = yaml.safe_load(filePath.read_text(encoding="utf-8"))
        except (OSError, yaml.YAMLError, UnicodeDecodeError) as exc:
            issues.append(_issue("error", "curriculum-yaml-invalid", f"Curriculum YAML could not be read: {exc}", relative))
            continue
        if not isinstance(payload, dict):
            issues.append(_issue("error", "curriculum-yaml-invalid", "Curriculum YAML must be an object.", relative))
            continue
        meta = payload.get("meta") if isinstance(payload.get("meta"), dict) else {}
        tags = payload.get("tags")
        for key in ("id", "category"):
            if not meta.get(key):
                issues.append(_issue("warning", f"curriculum-meta-{key}-missing", f"meta.{key} is recommended.", relative))
        if not isinstance(tags, list) or not tags:
            issues.append(_issue("warning", "curriculum-tags-missing", "tags are recommended.", relative))
        if not isinstance(payload.get("sections"), list) or not payload.get("sections"):
            issues.append(_issue("warning", "curriculum-sections-missing", "sections are recommended.", relative))
        lessonPackages = meta.get("packages", [])
        if lessonPackages and not manifestPackages:
            issues.append(_issue("warning", "manifest-packages-empty", "Manifest packages should mirror lesson dependencies.", relative))
    return issues


def _validateAutomationEntry(sourceRoot: Path, path: str, permissions: dict[str, Any]) -> list[PackIssue]:
    issues: list[PackIssue] = []
    for filePath in _expandContentFiles(sourceRoot, path, suffix=".py"):
        relative = filePath.relative_to(sourceRoot).as_posix()
        text = filePath.read_text(encoding="utf-8", errors="replace")
        if "# %% [automation]" not in text:
            issues.append(_issue("error", "automation-cell-missing", "Automation recipe must include # %% [automation].", relative))
        if "DRY_RUN = True" not in text:
            issues.append(_issue("error", "automation-dry-run-missing", "Shared automation recipes must start with DRY_RUN = True.", relative))
        riskyMarkers = ("requests.", "urlopen(", "webbrowser.", "pyautogui.", "Path(", "open(")
        if not permissions and any(marker in text for marker in riskyMarkers):
            issues.append(_issue("warning", "automation-permissions-missing", "Risky automation markers need manifest permissions.", relative))
    return issues


def _expandContentFiles(sourceRoot: Path, path: str, *, suffix: str) -> Iterable[Path]:
    try:
        target = _safeJoin(sourceRoot, _normalizeRelativePath(path))
    except ValueError:
        return []
    if target.is_file():
        return [target] if target.suffix.lower() == suffix else []
    if target.is_dir():
        return sorted(item for item in target.rglob(f"*{suffix}") if item.is_file())
    return []


def _declaredPaths(manifest: PackManifest) -> list[str]:
    return [
        *[entry.path for entry in manifest.contents.curricula],
        *[entry.path for entry in manifest.contents.automations],
        *[entry.path for entry in manifest.contents.assets],
    ]


def _findManifestPath(root: Path) -> Path | None:
    for name in MANIFEST_NAMES:
        candidate = root / name
        if candidate.is_file():
            return candidate
    nested = list(root.glob(f"*/{MANIFEST_NAMES[0]}"))
    if len(nested) == 1:
        return nested[0]
    return None


def _packRoot(root: Path) -> Path:
    manifestPath = _findManifestPath(root)
    if manifestPath is None:
        return root
    return manifestPath.parent


def _projectRoot() -> Path:
    return Path(__file__).resolve().parents[3]


def _iterPackFiles(root: Path) -> Iterable[Path]:
    ignoredParts = {".git", "__pycache__", ".pytest_cache", ".ruff_cache", "node_modules"}
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if any(part in ignoredParts for part in path.relative_to(root).parts):
            continue
        returnPath = path
        yield returnPath


def _safeJoin(root: Path, relativePath: str) -> Path:
    target = (root / relativePath).resolve()
    if not _isWithin(target, root.resolve()):
        raise ValueError(f"Path escapes pack root: {relativePath}")
    return target


def _normalizeRelativePath(rawPath: str) -> str:
    normalized = rawPath.replace("\\", "/").strip()
    path = PurePosixPath(normalized)
    if not normalized or path.is_absolute() or any(part in {"", ".", ".."} for part in path.parts):
        raise ValueError(f"Invalid relative path: {rawPath}")
    return path.as_posix()


def _extractZipSafely(archive: zipfile.ZipFile, targetRoot: Path) -> None:
    targetRoot.mkdir(parents=True, exist_ok=True)
    for member in archive.infolist():
        if member.is_dir():
            continue
        relative = _normalizeRelativePath(member.filename)
        target = _safeJoin(targetRoot, relative)
        target.parent.mkdir(parents=True, exist_ok=True)
        with archive.open(member) as source, target.open("wb") as destination:
            shutil.copyfileobj(source, destination)


def _downloadFile(url: str, targetPath: Path) -> None:
    request = Request(url, headers={"User-Agent": "Codaro-Pack-Importer/1"})
    try:
        with urlopen(request, timeout=30) as response:
            data = response.read()
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        raise RuntimeError(f"Failed to download {url}: {exc}") from exc
    targetPath.write_bytes(data)


def _isWithin(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def _isHttpUrl(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"}


def _isZipUrl(value: str) -> bool:
    return urlparse(value).path.lower().endswith(".zip")


def _safeInstallKey(packId: str, version: str) -> str:
    raw = f"{packId}-{version}".lower()
    safe = re.sub(r"[^a-z0-9_.-]+", "-", raw).strip(".-")
    return safe[:120] or "codaro-pack"


def _validPackId(value: str) -> bool:
    return bool(re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]{1,126}[A-Za-z0-9]", value))


def _validPackageName(value: str) -> bool:
    return bool(re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", value))


def _issue(severity: str, code: str, message: str, path: str = "") -> PackIssue:
    return PackIssue(severity=severity, code=code, message=message, path=path)
