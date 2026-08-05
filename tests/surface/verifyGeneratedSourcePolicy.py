from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[2]
LANDING_ROOT = ROOT / "landing"
REPORT_PATH = ROOT / "output" / "test-runner" / "repository-simplification" / "generated-source-policy-report.json"
EXPECTED_OUTPUTS = {
    "brandMark.json",
    "curriculum.js",
    "curriculumLessons",
    "docsNav.js",
    "docsPages",
    "posts.js",
    "searchIndex.js",
    "visualAssetManifest.js",
}


def currentGitHead() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def trackedGeneratedPaths() -> list[str]:
    result = subprocess.run(
        ["git", "-c", "core.quotepath=false", "ls-files", "--", "landing/src/lib/generated"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return sorted(line.strip() for line in result.stdout.splitlines() if line.strip())


def main() -> int:
    manifest = json.loads((LANDING_ROOT / "scripts" / "generatedManifest.json").read_text(encoding="utf-8"))
    package = json.loads((LANDING_ROOT / "package.json").read_text(encoding="utf-8"))
    ignore = (ROOT / ".gitignore").read_text(encoding="utf-8")
    outputs = {row["path"] for row in manifest.get("outputs", [])}
    producers = {row["producer"] for row in manifest.get("outputs", [])}
    scripts = package.get("scripts", {})
    tracked = trackedGeneratedPaths()
    trackedAndPresent = [path for path in tracked if (ROOT / path).exists()]
    # editor는 자기 생성물의 owner다. 소스가 import하는 생성 모듈은 editor 빌드가 스스로
    # 만들어야 하며(그래야 새 체크아웃과 editor 단독 CI에서 컴파일된다), 추적되지 않는다.
    editorGenerated = {
        "editor/src/lib/generated/brandMark.json": ("editor brand mark copy", "brand:sync"),
        "editor/src/lib/generated/visualAssetManifest.ts": ("editor visual resolver", "visuals:sync"),
    }
    editorPackage = json.loads((ROOT / "editor" / "package.json").read_text(encoding="utf-8"))
    editorScripts = editorPackage.get("scripts", {})
    failures: list[str] = []

    if manifest.get("root") != "src/lib/generated" or manifest.get("tracked") is not False:
        failures.append("generated manifest root or tracking policy drift")
    if outputs != EXPECTED_OUTPUTS:
        failures.append(f"generated output declaration drift: {sorted(outputs)}")
    for producer in producers:
        if not (LANDING_ROOT / producer).is_file():
            failures.append(f"generated producer is missing: {producer}")
    for required in ("syncVisualAssets.js", "generateContent.js", "generateCurriculum.js", "generateOgImage.js"):
        if required not in scripts.get("content:generate", ""):
            failures.append(f"content lifecycle is missing {required}")
    if "cleanGeneratedSource.mjs" in scripts.get("content:generate", ""):
        failures.append("content lifecycle must preserve valid generated outputs for incremental reuse")
    if scripts.get("generated:clean") != "node scripts/cleanGeneratedSource.mjs":
        failures.append("generated:clean must retain the explicit full-clean command")
    for lifecycle in ("predev", "prebuild"):
        if scripts.get(lifecycle) != "npm run content:generate":
            failures.append(f"{lifecycle} must invoke content:generate")
    for output in EXPECTED_OUTPUTS:
        expectedIgnore = f"/landing/src/lib/generated/{output}"
        if output in {"curriculumLessons", "docsPages"}:
            expectedIgnore += "/"
        if expectedIgnore not in ignore:
            failures.append(f"generated output is not ignored: {output}")
    if trackedAndPresent:
        failures.append(f"generated modules are still tracked and present: {trackedAndPresent}")
    for modulePath, (label, lifecycleScript) in editorGenerated.items():
        if f"/{modulePath}" not in ignore:
            failures.append(f"{label} is not covered by generated-source ignore policy")
        if subprocess.run(
            ["git", "ls-files", "--error-unmatch", modulePath],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        ).returncode == 0:
            failures.append(f"{label} must remain lifecycle-generated and untracked")
        if lifecycleScript not in editorScripts:
            failures.append(f"{label} producer script is missing: {lifecycleScript}")
        if f"npm run {lifecycleScript}" not in editorScripts.get("build", ""):
            failures.append(f"{label} is not produced by the editor build: {lifecycleScript}")
    exceptions = manifest.get("trackedExceptions", [])
    if not any(row.get("path") == "src/styles/generated" and row.get("reason") for row in exceptions):
        failures.append("design token generated-source exception is undocumented")

    report = {
        "schemaVersion": 1,
        "gate": "repository-simplification",
        "check": "generated-source-policy",
        "passed": not failures,
        "completionEligible": not failures,
        "gitHead": currentGitHead(),
        "completedAt": datetime.now(UTC).isoformat(),
        "declaredOutputs": sorted(outputs),
        "trackedGeneratedPaths": tracked,
        "trackedAndPresent": trackedAndPresent,
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print("ok: landing generated source policy verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
