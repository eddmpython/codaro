from __future__ import annotations

import argparse
import hashlib
import json
import sys
import tomllib
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[4]
PYPROJECT = ROOT / "pyproject.toml"
LAUNCHER_MANIFEST = ROOT / "launcher" / "codaro-launcher" / "Cargo.toml"


def main(argv: list[str] | None = None) -> int:
    args = buildParser().parse_args(argv)
    project = readToml(PYPROJECT)["project"]
    launcherPackage = readToml(LAUNCHER_MANIFEST)["package"]

    packageName = args.package_name or project["name"]
    packageVersion = args.package_version or project["version"]
    launcherVersion = args.launcher_version or launcherPackage["version"]
    releaseTag = args.tag
    releaseBaseUrl = args.release_base_url or f"https://github.com/{args.repo}/releases/download/{releaseTag}"

    backendWheel = resolveBackendWheel(
        wheelUrl=args.backend_wheel_url,
        sha256=args.backend_sha256,
    )
    runtimeSha256 = sha256File(args.python_runtime_archive)
    channel = args.channel or inferChannel(packageVersion)
    releaseId = args.release_id or packageVersion

    manifest = {
        "manifestVersion": 1,
        "channel": channel,
        "releaseId": releaseId,
        "launcherVersion": launcherVersion,
        "minLauncherVersion": args.min_launcher_version or launcherVersion,
        "pythonRuntime": {
            "version": args.python_runtime_version,
            "url": f"{releaseBaseUrl}/{args.python_runtime_asset_name}",
            "sha256": runtimeSha256,
        },
        "editor": {
            "version": packageVersion,
            "source": "backendWheel",
        },
        "backend": {
            "name": packageName,
            "version": packageVersion,
            "wheelUrl": backendWheel["url"],
            "sha256": backendWheel["sha256"],
            "entryModule": args.backend_entry_module,
            "consoleScript": args.backend_console_script,
        },
        "bundles": [],
    }
    if args.rollback_to:
        manifest["rollbackTo"] = args.rollback_to

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"manifest": str(args.output), "releaseId": releaseId, "backendWheel": backendWheel["url"]}, indent=2))
    return 0


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Build Codaro launcher release manifest.")
    parser.add_argument("--tag", required=True, help="Git tag used for the GitHub Release.")
    parser.add_argument("--repo", default="eddmpython/codaro", help="GitHub repository in owner/name form.")
    parser.add_argument("--release-base-url", help="Override release asset base URL.")
    parser.add_argument("--release-id", help="Override manifest releaseId. Defaults to package version.")
    parser.add_argument("--channel", choices=("stable", "beta", "dev"), help="Override release channel.")
    parser.add_argument("--rollback-to", help="Optional releaseId to use as rollback target.")
    parser.add_argument("--package-name", help="Backend package name. Defaults to pyproject project.name.")
    parser.add_argument("--package-version", help="Backend package version. Defaults to pyproject project.version.")
    parser.add_argument("--launcher-version", help="Launcher version. Defaults to launcher Cargo.toml package.version.")
    parser.add_argument("--min-launcher-version", help="Minimum launcher version. Defaults to launcher version.")
    parser.add_argument("--backend-entry-module", default="codaro.cli")
    parser.add_argument("--backend-console-script", default="codaro")
    parser.add_argument("--backend-wheel-url", required=True, help="Exact backend wheel URL.")
    parser.add_argument("--backend-sha256", required=True, help="Exact backend wheel sha256.")
    parser.add_argument("--python-runtime-version", required=True)
    parser.add_argument("--python-runtime-asset-name", default="python-runtime-win-x64.zip")
    parser.add_argument("--python-runtime-archive", required=True, type=Path)
    parser.add_argument("--output", type=Path, default=Path("release-manifest.json"))
    return parser


def readToml(path: Path) -> dict[str, Any]:
    with path.open("rb") as handle:
        return tomllib.load(handle)


def resolveBackendWheel(
    *,
    wheelUrl: str,
    sha256: str,
) -> dict[str, str]:
    return {"url": wheelUrl, "sha256": normalizeSha256(sha256)}


def sha256File(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalizeSha256(value: str) -> str:
    value = value.strip().lower()
    if len(value) != 64 or any(character not in "0123456789abcdef" for character in value):
        raise ValueError("sha256 must be a 64-character hex string.")
    return value


def inferChannel(version: str) -> str:
    lowered = version.lower()
    if any(marker in lowered for marker in ("a", "b", "rc", "dev")):
        return "beta"
    return "stable"


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
