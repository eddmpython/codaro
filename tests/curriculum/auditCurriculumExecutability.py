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
import functools
import importlib.util
import io
import json
import os
import re
import sys
import tempfile
import traceback
import webbrowser
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import yaml


def _configureHeadless() -> None:
    """감사는 헤드리스다. 레슨 exec가 GUI 창(matplotlib)이나 브라우저 탭(plotly/folium/altair)을
    띄우지 못하도록 백엔드/렌더러를 강제하고 webbrowser 열기를 무력화한다."""
    os.environ["MPLBACKEND"] = "Agg"

    def _noopOpen(*_args: Any, **_kwargs: Any) -> bool:
        return False

    webbrowser.open = _noopOpen
    webbrowser.open_new = _noopOpen
    webbrowser.open_new_tab = _noopOpen

    # plotly fig.show()는 plotly.io.show를 호출해 브라우저 탭/서버를 띄운다. no-op으로 막는다.
    if importlib.util.find_spec("plotly") is not None:
        import plotly.io as plotlyIo

        plotlyIo.show = lambda *_args, **_kwargs: None

    _neutralizeInputControl()


# pyautogui에서 실제 OS를 움직이는 액추에이터(이동/클릭/드래그/타이핑/키)만 골라 무력화한다.
# size/position/onScreen/screenshot/locate/isValidKey/KEYBOARD_KEYS 같은 읽기 함수와 pynput
# 객체 생성은 그대로 두므로 inputCtl 레슨의 assert(실제 반환값 검증)는 정상 통과한다.
_INPUT_ACTUATORS = (
    "moveTo", "moveRel", "move", "dragTo", "dragRel",
    "click", "doubleClick", "tripleClick", "rightClick", "middleClick",
    "mouseDown", "mouseUp", "scroll", "hscroll", "vscroll",
    "typewrite", "write", "press", "keyDown", "keyUp", "hotkey",
)


def _neutralizeInputControl() -> None:
    """inputCtl 레슨이 실제 마우스·키보드를 조작하지 못하게 액추에이터만 no-op으로 바꾼다.
    functools.wraps로 원본 시그니처를 보존하므로 inspect.signature(pyautogui.write) 같은
    introspection(레슨 04)도 그대로 동작한다."""
    if importlib.util.find_spec("pyautogui") is None:
        return
    try:
        import pyautogui
    except (ImportError, OSError, KeyError, RuntimeError) as exc:
        # 디스플레이 없는 환경에서 pyautogui import가 실패해도 감사 전체를 죽이지 않는다.
        # 이 경우 inputCtl 레슨은 missing-package로 건너뛰기만 한다.
        print(f"note: pyautogui neutralization skipped ({type(exc).__name__}: {exc})")
        return

    pyautogui.FAILSAFE = False

    # inputCtl 레슨의 선언 패키지는 pyautogui+pillow뿐이라 pyscreeze는 순수 Pillow 매칭을 쓴다.
    # 공유 venv에 opencv가 있으면 pyscreeze가 import 시점에 opencv 매칭으로 바인딩돼 균일 패치에서
    # 오매치(NaN 상관도→(0,0))가 난다. 레슨 선언 환경을 충실히 재현하도록 Pillow 매칭으로 되돌린다.
    if importlib.util.find_spec("pyscreeze") is not None:
        import pyscreeze

        if hasattr(pyscreeze, "_locateAll_pillow"):
            pyscreeze.locateAll = pyscreeze._locateAll_pillow

    def _wrapNoop(original: Any) -> Any:
        @functools.wraps(original)
        def _noop(*_args: Any, **_kwargs: Any) -> None:
            return None

        return _noop

    for name in _INPUT_ACTUATORS:
        original = getattr(pyautogui, name, None)
        if callable(original):
            setattr(pyautogui, name, _wrapNoop(original))


ROOT = Path(__file__).resolve().parent.parent.parent
CURRICULA = ROOT / "curricula"
REPORT_PATH = ROOT / "output" / "test-runner" / "curriculum-executability" / "curriculum-executability-report.json"

# 게이트 임계치 — 환경과 무관한 콘텐츠 결함만 차단한다.
# real-bug          : 학습 코드 결함(NameError/Syntax/Assert 등). 0 유지.
# yaml-load-error   : YAML 파싱 실패. 0 유지.
# undeclared-package: import 하지만 meta.packages 에 없는 패키지. 0 유지.
# 반면 missing-package / cascade-failure / runtime-other 는 실행 환경(라이브러리 미설치,
# OS/네트워크 의존)에 좌우되므로 정보성으로만 보고하고 게이트를 깨지 않는다.
THRESHOLDS: dict[str, int] = {
    "real-bug": 0,
    "yaml-load-error": 0,
    "undeclared-package": 0,
}

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


# keys are the real top-level import names; values are the pip distribution names.
IMPORT_TO_PKG = {
    "cv2": "opencv-python",
    "docx": "python-docx",
    "mpl_toolkits": "matplotlib",
    "sklearn": "scikit-learn",
    "PIL": "pillow",
    "yaml": "pyyaml",
    "bs4": "beautifulsoup4",
    "fitz": "pymupdf",
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

# Import-root → distribution lookup is case-insensitive so an import name's casing
# (PIL, OpenSSL, Crypto) can never cause a false undeclared-package classification.
_IMPORT_TO_PKG_LOWER = {key.lower(): value for key, value in IMPORT_TO_PKG.items()}
_NO_MODULE_RE = re.compile(r"No module named ['\"]([\w.]+)['\"]")


def declaredPackageNames(data: dict[str, Any]) -> set[str]:
    meta = data.get("meta") if isinstance(data.get("meta"), dict) else {}
    declared = meta.get("packages") if isinstance(meta, dict) else None
    if not isinstance(declared, list):
        return set()
    names = {str(pkg).strip().lower().replace("_", "-") for pkg in declared if pkg}
    # opencv-contrib-python is a superset of opencv-python (cv2). Declaring contrib
    # satisfies any cv2 import, so it covers the opencv-python provider name too.
    if "opencv-contrib-python" in names:
        names.add("opencv-python")
    return names


def packageFromMissingDetail(detail: str) -> str | None:
    marker = "ModuleNotFoundError: "
    if detail.startswith(marker):
        name = detail[len(marker):].strip()
        if not name:
            return None
        importRoot = name.split(".")[0]
        mapped = _IMPORT_TO_PKG_LOWER.get(importRoot.lower(), importRoot)
        return mapped.lower().replace("_", "-")
    return None


def declaredMissingModule(detail: str, declaredPackages: set[str]) -> str | None:
    """Return a declared package name when `detail` shows that a declared dependency is
    missing from this environment, even when the ImportError is surfaced indirectly — e.g. a
    subprocess/pytest step whose collection fails and is re-raised as an AssertionError.

    This lets the gate treat a declared-but-uninstalled package as an environment
    `missing-package` skip rather than a content `real-bug`. It only fires for packages the
    lesson actually declared, so a genuine code defect that never names a declared package
    stays a real-bug.
    """
    for match in _NO_MODULE_RE.finditer(detail):
        importRoot = match.group(1).split(".")[0]
        mapped = _IMPORT_TO_PKG_LOWER.get(importRoot.lower(), importRoot).lower().replace("_", "-")
        if mapped in declaredPackages:
            return mapped
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
            if category in ("real-bug", "runtime-other") and declaredMissingModule(detail, declaredPackages):
                category = "missing-package"
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
            if category in ("real-bug", "runtime-other") and declaredMissingModule(detail, declaredPackages):
                category = "missing-package"
            if category == "real-bug" and priorFailureSeen and detail.startswith("NameError"):
                category = "cascade-failure"
            if category == "missing-package":
                pkgName = packageFromMissingDetail(detail)
                if pkgName and pkgName not in declaredPackages:
                    category = "undeclared-package"
            results.append({"path": relPath, "section": sectionId, "kind": "solution",
                            "category": category, "detail": detail})
    return results


def runAudit(root: Path) -> list[dict[str, Any]]:
    """모든 yaml 을 격리 스크래치 디렉터리에서 누적 실행하고 결과 리스트를 반환한다."""
    _configureHeadless()
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
    allResults.insert(0, {"_fileCount": len(files)})
    return allResults


def _gitHead() -> str | None:
    headPath = ROOT / ".git" / "HEAD"
    if not headPath.exists():
        return None
    head = headPath.read_text(encoding="utf-8").strip()
    if head.startswith("ref: "):
        refPath = ROOT / ".git" / head.removeprefix("ref: ").strip()
        if refPath.exists():
            return refPath.read_text(encoding="utf-8").strip()
    return head or None


def _missingPackageCoverage(results: list[dict[str, Any]]) -> dict[str, int]:
    """라이브러리 미설치로 실행을 건너뛴 레슨을 카테고리별로 집계한다 (silent cap 방지)."""
    coverage: dict[str, int] = {}
    seen: set[str] = set()
    for result in results:
        if result.get("category") != "missing-package":
            continue
        path = str(result.get("path", ""))
        if path in seen:
            continue
        seen.add(path)
        parts = path.replace("\\", "/").split("/")
        category = parts[-2] if len(parts) >= 2 else "<root>"
        coverage[category] = coverage.get(category, 0) + 1
    return dict(sorted(coverage.items(), key=lambda kv: -kv[1]))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=str(CURRICULA))
    parser.add_argument("--only-real-bugs", action="store_true")
    parser.add_argument("--show-load-errors", action="store_true")
    parser.add_argument("--show-missing", action="store_true",
                        help="missing-package 항목도 출력 (환경 점검용)")
    parser.add_argument("--no-report", action="store_true", help="JSON 리포트를 쓰지 않는다")
    args = parser.parse_args()

    startedAt = datetime.now(UTC).isoformat()
    root = Path(args.root).resolve()
    rawResults = runAudit(root)
    fileCount = rawResults[0].get("_fileCount", 0) if rawResults else 0
    allResults = [r for r in rawResults if "_fileCount" not in r]

    counts: dict[str, int] = {}
    for result in allResults:
        counts[result["category"]] = counts.get(result["category"], 0) + 1
    print("\nsummary:")
    for category, count in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {category:20s} {count}")
    print(f"  {'TOTAL':20s} {len(allResults)}")

    realBugs = [r for r in allResults if r["category"] == "real-bug"]
    loadErrors = [r for r in allResults if r["category"] == "yaml-load-error"]
    undeclared = [r for r in allResults if r["category"] == "undeclared-package"]
    missingCoverage = _missingPackageCoverage(allResults)

    breaches = []
    for flag, threshold in THRESHOLDS.items():
        count = counts.get(flag, 0)
        if count > threshold:
            breaches.append({"flag": flag, "count": count, "threshold": threshold})
    passed = not breaches

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

    if undeclared:
        print(f"\nundeclared-package entries ({len(undeclared)}):")
        for r in undeclared[:20]:
            print(f"  {r['path']} [{r['section']}.{r['kind']}] {r['detail']}")

    if missingCoverage:
        skipped = sum(missingCoverage.values())
        print(
            f"\ncoverage note: {skipped} lessons skipped at import (library not installed). "
            "real-bugs inside them are NOT checked in this environment:"
        )
        for category, count in list(missingCoverage.items())[:30]:
            print(f"  {category:24s} {count}")

    if not args.no_report:
        report = {
            "gate": "curriculum-executability",
            "passed": passed,
            "status": "passed" if passed else "failed",
            "startedAt": startedAt,
            "completedAt": datetime.now(UTC).isoformat(),
            "gitHead": _gitHead(),
            "reportPath": str(REPORT_PATH.relative_to(ROOT)),
            "summary": {
                "fileCount": fileCount,
                "checkCount": len(allResults),
                "counts": dict(sorted(counts.items(), key=lambda kv: -kv[1])),
                "thresholds": THRESHOLDS,
                "breaches": breaches,
                "missingPackageCoverage": missingCoverage,
            },
            "realBugs": realBugs,
            "loadErrors": loadErrors,
            "undeclaredPackages": undeclared,
        }
        REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
        REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\nreport: {REPORT_PATH.relative_to(ROOT)}")

    if passed:
        print("\nok: curriculum executability audit passed (no real-bug / load-error / undeclared-package)")
        return 0
    print("\nFAIL: curriculum executability audit breached thresholds:")
    for breach in breaches:
        print(f"  - {breach['flag']}: {breach['count']} (threshold {breach['threshold']})")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
