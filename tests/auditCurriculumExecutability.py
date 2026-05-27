"""커리큘럼 코드 실행 가능성 전수 audit.

각 yaml을 한 노트북처럼 다루고, sections[*]의 snippet을 **누적 namespace**에서 순서대로
exec 한 뒤 각 exercise의 solution을 같은 시점 namespace를 복사한 위에서 검증한다.

검증 대상:
- snippet: 단계별로 누적 실행. 이전 단계 import/변수 재사용 허용 (노트북 모델).
- exercise.solution: 직전 snippet 누적 namespace의 복사본에서 단독 실행. (starterCode 는
  학습자가 채우는 blank "___" 자리표시자라 검증 대상에서 제외.)

결과 카테고리:
- ok                : 정상 실행
- real-bug          : SyntaxError / NameError / TypeError 등 학습 자료 결함
- missing-package   : ModuleNotFoundError / ImportError (환경 설치 문제)
- runtime-other     : 그 외 예외 (OS 호출 등 실행 환경 의존)
- yaml-load-error   : YAML 로드 실패
"""
from __future__ import annotations

import argparse
import io
import os
import sys
import tempfile
import traceback
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parent.parent
CURRICULA = ROOT / "curricula"

REAL_BUG_TYPES = {
    "SyntaxError",
    "NameError",
    "AttributeError",
    "TypeError",
    "AssertionError",
    "IndexError",
    "KeyError",
    "ValueError",
    "ZeroDivisionError",
    "UnboundLocalError",
    "IndentationError",
    "TabError",
}


def loadYaml(path: Path) -> dict[str, Any] | None:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        return {"_loadError": f"utf8 decode: {exc}"}
    try:
        return yaml.safe_load(text)
    except yaml.YAMLError as exc:
        return {"_loadError": f"yaml: {exc}"}


IMPORT_TO_PKG = {
    "cv2": "opencv-python",
    "sklearn": "scikit-learn",
    "pil": "pillow",
    "yaml": "pyyaml",
    "bs4": "beautifulsoup4",
    "pydantic_settings": "pydantic-settings",
    "dotenv": "python-dotenv",
    "dateutil": "python-dateutil",
    "magic": "python-magic",
    "win32com": "pywin32",
    "win32api": "pywin32",
    "wx": "wxpython",
    "skimage": "scikit-image",
    "OpenSSL": "pyopenssl",
    "Crypto": "pycryptodome",
}


def declaredPackageNames(data: dict[str, Any]) -> set[str]:
    meta = data.get("meta") if isinstance(data.get("meta"), dict) else {}
    declared = meta.get("packages") if isinstance(meta, dict) else None
    if not isinstance(declared, list):
        return set()
    return {str(pkg).strip().lower().replace("_", "-") for pkg in declared if pkg}


def packageFromMissingDetail(detail: str) -> str | None:
    marker = "ModuleNotFoundError: "
    if detail.startswith(marker):
        name = detail[len(marker):].strip()
        if not name:
            return None
        importRoot = name.split(".")[0]
        mapped = IMPORT_TO_PKG.get(importRoot, importRoot)
        return mapped.lower().replace("_", "-")
    return None


def classifyException(exc: BaseException) -> tuple[str, str]:
    excType = type(exc).__name__
    summary = traceback.format_exception_only(type(exc), exc)[-1].strip()
    if isinstance(exc, ModuleNotFoundError):
        return ("missing-package", f"ModuleNotFoundError: {exc.name}")
    if isinstance(exc, ImportError):
        return ("missing-package", f"ImportError: {exc}")
    category = "real-bug" if excType in REAL_BUG_TYPES else "runtime-other"
    return (category, summary)


def execCode(code: str, namespace: dict[str, Any], label: str) -> tuple[str, str]:
    try:
        compiled = compile(code, label, "exec")
    except SyntaxError as exc:
        return ("real-bug", f"SyntaxError: {exc.msg} (line {exc.lineno})")
    stdoutBuf, stderrBuf = io.StringIO(), io.StringIO()
    savedOut, savedErr = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = stdoutBuf, stderrBuf
    try:
        exec(compiled, namespace)
    except SystemExit:
        return ("ok", "")
    except BaseException as exc:
        return classifyException(exc)
    finally:
        sys.stdout, sys.stderr = savedOut, savedErr
    return ("ok", "")


def auditLesson(path: Path) -> list[dict[str, Any]]:
    data = loadYaml(path)
    if data is None:
        return []
    if "_loadError" in data:
        return [{"path": str(path.relative_to(ROOT)), "section": "<file>", "kind": "load",
                 "category": "yaml-load-error", "detail": data["_loadError"]}]
    if not isinstance(data, dict):
        return []
    sections = data.get("sections") or []
    if not isinstance(sections, list):
        return []
    declaredPackages = declaredPackageNames(data)
    results: list[dict[str, Any]] = []
    relPath = str(path.relative_to(ROOT))
    namespace: dict[str, Any] = {"__name__": "__main__"}
    priorFailureSeen = False
    for section in sections:
        if not isinstance(section, dict):
            continue
        sectionId = section.get("id") or "<no-id>"
        snippet = section.get("snippet")
        if isinstance(snippet, str) and snippet.strip():
            category, detail = execCode(snippet, namespace, f"{relPath}::{sectionId}.snippet")
            if category == "real-bug" and priorFailureSeen and detail.startswith("NameError"):
                category = "cascade-failure"
            if category == "missing-package":
                pkgName = packageFromMissingDetail(detail)
                if pkgName and pkgName not in declaredPackages:
                    category = "undeclared-package"
            if category != "ok":
                priorFailureSeen = True
            results.append({"path": relPath, "section": sectionId, "kind": "snippet",
                            "category": category, "detail": detail})
        exercise = section.get("exercise") or {}
        if not isinstance(exercise, dict):
            continue
        solution = exercise.get("solution")
        if isinstance(solution, str) and solution.strip():
            solutionNs = dict(namespace)
            category, detail = execCode(solution, solutionNs, f"{relPath}::{sectionId}.solution")
            if category == "real-bug" and priorFailureSeen and detail.startswith("NameError"):
                category = "cascade-failure"
            if category == "missing-package":
                pkgName = packageFromMissingDetail(detail)
                if pkgName and pkgName not in declaredPackages:
                    category = "undeclared-package"
            results.append({"path": relPath, "section": sectionId, "kind": "solution",
                            "category": category, "detail": detail})
    return results


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=str(CURRICULA))
    parser.add_argument("--only-real-bugs", action="store_true")
    parser.add_argument("--show-load-errors", action="store_true")
    parser.add_argument("--show-missing", action="store_true",
                        help="missing-package 항목도 출력 (환경 점검용)")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    files = sorted(p.resolve() for p in root.rglob("*.yaml"))
    print(f"audit {len(files)} curriculum files under {root.relative_to(ROOT)}")
    allResults: list[dict[str, Any]] = []
    originalCwd = Path.cwd()
    os.environ.setdefault("PYTEST_DISABLE_PLUGIN_AUTOLOAD", "1")
    rootCacheBefore = (ROOT / ".pytest_cache").exists()
    with tempfile.TemporaryDirectory(prefix="codaroAudit-") as scratchDir:
        os.chdir(scratchDir)
        try:
            for path in files:
                allResults.extend(auditLesson(path))
        finally:
            os.chdir(originalCwd)
    rootCacheAfter = (ROOT / ".pytest_cache").exists()
    if rootCacheAfter and not rootCacheBefore:
        import shutil
        shutil.rmtree(ROOT / ".pytest_cache", ignore_errors=True)

    counts: dict[str, int] = {}
    for result in allResults:
        counts[result["category"]] = counts.get(result["category"], 0) + 1
    print("\nsummary:")
    for category, count in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {category:20s} {count}")
    print(f"  {'TOTAL':20s} {len(allResults)}")

    realBugs = [r for r in allResults if r["category"] == "real-bug"]
    loadErrors = [r for r in allResults if r["category"] == "yaml-load-error"]

    if args.only_real_bugs or realBugs:
        print(f"\nreal-bug entries ({len(realBugs)}):")
        for r in realBugs:
            print(f"  {r['path']} [{r['section']}.{r['kind']}] {r['detail']}")

    if args.show_load_errors or loadErrors:
        print(f"\nyaml load errors ({len(loadErrors)}):")
        for r in loadErrors:
            print(f"  {r['path']} {r['detail']}")

    if args.show_missing:
        missing = [r for r in allResults if r["category"] == "missing-package"]
        print(f"\nmissing-package entries ({len(missing)}):")
        for r in missing:
            print(f"  {r['path']} [{r['section']}.{r['kind']}] {r['detail']}")

    undeclared = [r for r in allResults if r["category"] == "undeclared-package"]
    if undeclared:
        print(f"\nundeclared-package entries ({len(undeclared)}):")
        for r in undeclared[:20]:
            print(f"  {r['path']} [{r['section']}.{r['kind']}] {r['detail']}")

    return 0 if not realBugs and not loadErrors else 1


if __name__ == "__main__":
    raise SystemExit(main())
