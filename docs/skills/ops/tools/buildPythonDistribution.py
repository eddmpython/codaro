from __future__ import annotations

import argparse
from dataclasses import asdict, dataclass
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import tempfile
import tomllib
from typing import Any
import zipfile


ROOT = Path(__file__).resolve().parents[4]
DEFAULT_GATE_ROOT = ROOT / "output" / "test-runner" / "python-sdk"
DEFAULT_OUTPUT_ROOT = DEFAULT_GATE_ROOT / "dist"
PACKAGE_RELATIVE = Path("src") / "codaro"
REQUIRED_PROJECT_FILES = (
    "pyproject.toml",
    "README.md",
    "LICENSE",
    "uv.lock",
)
REQUIRED_WHEEL_FILES = {
    "codaro/webBuild/index.html",
    "codaro/curricula/python/__init__.py",
    "codaro/generatedContracts/artifactOwnership.py",
    "codaro/generatedContracts/artifactOwnership.schema.json",
}
REQUIRED_SDIST_SUFFIXES = {
    "/src/codaro/webBuild/index.html",
    "/src/codaro/curricula/python/__init__.py",
    "/src/codaro/generatedContracts/artifactOwnership.py",
    "/src/codaro/generatedContracts/artifactOwnership.schema.json",
}


class PythonDistributionError(RuntimeError):
    pass


@dataclass(frozen=True, slots=True)
class PythonDistributionResult:
    version: str
    wheelPath: Path
    sdistPath: Path
    wheelHash: str
    sdistHash: str
    lessonCount: int
    webAssetCount: int

    def toJson(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["wheelPath"] = self.wheelPath.as_posix()
        payload["sdistPath"] = self.sdistPath.as_posix()
        return payload


def sha256Path(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def isCurriculumLessonPath(path: Path | str) -> bool:
    value = path.as_posix() if isinstance(path, Path) else path.replace("\\", "/")
    return value.endswith(".yaml") and not value.endswith("/schema.yaml")


def directoryState(path: Path) -> tuple[bool, str]:
    if not path.exists():
        return False, ""
    if not path.is_dir():
        raise PythonDistributionError(f"expected directory state target: {path}")
    digest = hashlib.sha256()
    for filePath in sorted(
        (candidate for candidate in path.rglob("*") if candidate.is_file()),
        key=lambda candidate: candidate.relative_to(path).as_posix(),
    ):
        digest.update(filePath.relative_to(path).as_posix().encode("utf-8"))
        digest.update(b"\0")
        digest.update(filePath.read_bytes())
        digest.update(b"\0")
    return True, digest.hexdigest()


def resetDirectory(path: Path) -> Path:
    resolved = path.resolve()
    anchor = Path(resolved.anchor).resolve()
    if resolved == anchor or len(resolved.parts) < 3:
        raise PythonDistributionError(f"refusing to reset broad directory: {resolved}")
    if resolved.exists():
        if not resolved.is_dir():
            raise PythonDistributionError(f"reset target is not a directory: {resolved}")
        shutil.rmtree(resolved)
    resolved.mkdir(parents=True, exist_ok=True)
    return resolved


def copyIgnore(directory: str, names: list[str]) -> set[str]:
    del directory
    ignored = {
        name
        for name in names
        if name in {"__pycache__", ".pytest_cache", ".ruff_cache"}
        or name.endswith((".pyc", ".pyo"))
    }
    return ignored


def stagePythonBuildContext(
    contextRoot: Path,
    *,
    workspaceRoot: Path = ROOT,
) -> dict[str, int]:
    workspaceRoot = workspaceRoot.resolve()
    contextRoot = resetDirectory(contextRoot)
    for relativeValue in REQUIRED_PROJECT_FILES:
        sourcePath = workspaceRoot / relativeValue
        if not sourcePath.is_file():
            raise PythonDistributionError(f"required project file is missing: {sourcePath}")
        shutil.copy2(sourcePath, contextRoot / relativeValue)

    sourceRoot = workspaceRoot / "src"
    packageRoot = sourceRoot / "codaro"
    if not packageRoot.is_dir():
        raise PythonDistributionError(f"Python package source is missing: {packageRoot}")

    def sourceIgnore(directory: str, names: list[str]) -> set[str]:
        ignored = copyIgnore(directory, names)
        if Path(directory).resolve() == packageRoot.resolve():
            ignored.update({"curricula", "webBuild"}.intersection(names))
        return ignored

    stagedSourceRoot = contextRoot / "src"
    shutil.copytree(sourceRoot, stagedSourceRoot, ignore=sourceIgnore)
    stagedPackageRoot = contextRoot / PACKAGE_RELATIVE

    webBuildRoot = packageRoot / "webBuild"
    if not (webBuildRoot / "index.html").is_file() or not (webBuildRoot / "_app").is_dir():
        raise PythonDistributionError(
            "editor webBuild is missing; run npm --prefix editor run build before packaging"
        )
    shutil.copytree(
        webBuildRoot,
        stagedPackageRoot / "webBuild",
        ignore=copyIgnore,
    )

    curriculaRoot = workspaceRoot / "curricula"
    if not (curriculaRoot / "python" / "__init__.py").is_file():
        raise PythonDistributionError(f"root curriculum SSOT is incomplete: {curriculaRoot}")
    shutil.copytree(
        curriculaRoot,
        stagedPackageRoot / "curricula",
        ignore=copyIgnore,
    )

    lessonCount = sum(
        1
        for path in (curriculaRoot / "python").rglob("*.yaml")
        if path.is_file() and isCurriculumLessonPath(path)
    )
    webAssetCount = sum(1 for path in webBuildRoot.rglob("*") if path.is_file())
    if lessonCount < 1 or webAssetCount < 2:
        raise PythonDistributionError(
            f"staged package data is incomplete: lessons={lessonCount}, webAssets={webAssetCount}"
        )
    return {
        "lessonCount": lessonCount,
        "webAssetCount": webAssetCount,
    }


def readProjectVersion(workspaceRoot: Path = ROOT) -> str:
    with (workspaceRoot / "pyproject.toml").open("rb") as handle:
        value = tomllib.load(handle)["project"]["version"]
    if not isinstance(value, str) or not value:
        raise PythonDistributionError("project version is missing")
    return value


def verifyPythonDistribution(
    outputRoot: Path,
    *,
    workspaceRoot: Path = ROOT,
) -> PythonDistributionResult:
    outputRoot = outputRoot.resolve()
    wheels = sorted(outputRoot.glob("codaro-*.whl"))
    sdists = sorted(outputRoot.glob("codaro-*.tar.gz"))
    if len(wheels) != 1 or len(sdists) != 1:
        raise PythonDistributionError(
            f"expected one wheel and one sdist, found wheels={len(wheels)}, sdists={len(sdists)}"
        )
    wheelPath = wheels[0]
    sdistPath = sdists[0]
    version = readProjectVersion(workspaceRoot)
    expectedLessonCount = sum(
        1
        for path in (workspaceRoot / "curricula" / "python").rglob("*.yaml")
        if path.is_file() and isCurriculumLessonPath(path)
    )

    with zipfile.ZipFile(wheelPath) as archive:
        wheelNames = set(archive.namelist())
        missingWheel = sorted(REQUIRED_WHEEL_FILES - wheelNames)
        if missingWheel:
            raise PythonDistributionError(f"wheel missing required entries: {missingWheel}")
        wheelLessons = {
            name
            for name in wheelNames
            if name.startswith("codaro/curricula/python/") and isCurriculumLessonPath(name)
        }
        webAssets = {
            name
            for name in wheelNames
            if name.startswith("codaro/webBuild/_app/") and not name.endswith("/")
        }
        metadataNames = [name for name in wheelNames if name.endswith(".dist-info/METADATA")]
        if len(metadataNames) != 1:
            raise PythonDistributionError("wheel must contain one dist-info METADATA entry")
        metadataText = archive.read(metadataNames[0]).decode("utf-8")
    if len(wheelLessons) != expectedLessonCount:
        raise PythonDistributionError(
            f"wheel curriculum count differs: {len(wheelLessons)} != {expectedLessonCount}"
        )
    if not webAssets:
        raise PythonDistributionError("wheel missing codaro/webBuild/_app assets")
    if f"Name: codaro\n" not in metadataText or f"Version: {version}\n" not in metadataText:
        raise PythonDistributionError("wheel metadata name or version differs from pyproject")
    forbiddenWheel = sorted(
        name for name in wheelNames if "__pycache__" in name or name.endswith((".pyc", ".pyo"))
    )
    if forbiddenWheel:
        raise PythonDistributionError(f"wheel contains cache artifacts: {forbiddenWheel[:10]}")

    with tarfile.open(sdistPath, "r:gz") as archive:
        sdistNames = set(archive.getnames())
    missingSdist = sorted(
        suffix
        for suffix in REQUIRED_SDIST_SUFFIXES
        if not any(name.endswith(suffix) for name in sdistNames)
    )
    if missingSdist:
        raise PythonDistributionError(f"sdist missing required entries: {missingSdist}")
    sdistLessons = {
        name
        for name in sdistNames
        if "/src/codaro/curricula/python/" in name and isCurriculumLessonPath(name)
    }
    if len(sdistLessons) != expectedLessonCount:
        raise PythonDistributionError(
            f"sdist curriculum count differs: {len(sdistLessons)} != {expectedLessonCount}"
        )
    forbiddenSdist = sorted(
        name for name in sdistNames if "__pycache__" in name or name.endswith((".pyc", ".pyo"))
    )
    if forbiddenSdist:
        raise PythonDistributionError(f"sdist contains cache artifacts: {forbiddenSdist[:10]}")

    return PythonDistributionResult(
        version=version,
        wheelPath=wheelPath,
        sdistPath=sdistPath,
        wheelHash=sha256Path(wheelPath),
        sdistHash=sha256Path(sdistPath),
        lessonCount=len(wheelLessons),
        webAssetCount=len(webAssets),
    )


def buildPythonDistribution(
    buildRoot: Path | None = None,
    outputRoot: Path = DEFAULT_OUTPUT_ROOT,
    *,
    workspaceRoot: Path = ROOT,
) -> PythonDistributionResult:
    workspaceRoot = workspaceRoot.resolve()
    outputRoot = resetDirectory(outputRoot)
    packageCurricula = workspaceRoot / PACKAGE_RELATIVE / "curricula"
    curriculaBefore = directoryState(packageCurricula)

    def buildFromContext(contextRoot: Path) -> None:
        stagePythonBuildContext(contextRoot, workspaceRoot=workspaceRoot)
        completed = subprocess.run(
            (
                "uv",
                "--no-cache",
                "build",
                str(contextRoot),
                "--out-dir",
                str(outputRoot),
            ),
            cwd=workspaceRoot,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=False,
        )
        if completed.returncode != 0:
            detail = (completed.stderr or completed.stdout).strip()
            raise PythonDistributionError(f"uv build failed: {detail}")

    if buildRoot is None:
        with tempfile.TemporaryDirectory(prefix="codaro-python-dist-") as temporary:
            buildFromContext(Path(temporary) / "context")
    else:
        resolvedBuildRoot = resetDirectory(buildRoot)
        buildFromContext(resolvedBuildRoot / "context")

    curriculaAfter = directoryState(packageCurricula)
    if curriculaAfter != curriculaBefore:
        raise PythonDistributionError(
            "Python distribution build changed workspace src/codaro/curricula"
        )
    return verifyPythonDistribution(outputRoot, workspaceRoot=workspaceRoot)


def parseArgs(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build and verify Codaro wheel and sdist in a non-destructive context."
    )
    parser.add_argument("--build-root", type=Path)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument("--verify-only", action="store_true")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parseArgs(list(sys.argv[1:] if argv is None else argv))
    try:
        result = (
            verifyPythonDistribution(args.output_root)
            if args.verify_only
            else buildPythonDistribution(args.build_root, args.output_root)
        )
    except (OSError, subprocess.SubprocessError, tarfile.TarError, zipfile.BadZipFile, PythonDistributionError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    print(json.dumps(result.toJson(), ensure_ascii=False, indent=2))
    print("ok: Python distribution payload is complete and worktree-safe")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
