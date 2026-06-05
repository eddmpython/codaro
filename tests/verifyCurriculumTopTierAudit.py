from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
import json
import re
import subprocess
import sys
import time
import tomllib
from pathlib import Path
from typing import Any

import yaml

from codaro.curriculum.converter import yamlToDocument


ROOT = Path(__file__).resolve().parents[1]
CURRICULA_DIR = ROOT / "curricula" / "python"
REPORT_PATH = ROOT / "output" / "test-runner" / "curriculum-top-tier-audit" / "curriculum-top-tier-report.json"
MINIMUM_SCORE = 9.0

STUDY_TOPIC_PACKAGES = {
    "beautifulsoup4",
    "cv2",
    "folium",
    "geopandas",
    "matplotlib",
    "networkx",
    "numpy",
    "opencv-python",
    "pandas",
    "pillow",
    "plotly",
    "playwright",
    "polars",
    "pytest-playwright",
    "scikit-learn",
    "scipy",
    "seaborn",
    "selenium",
    "sklearn",
    "statsmodels",
    "sympy",
    "torch",
    "xgboost",
    "xlwings",
}
PACKAGE_ALIASES = {
    "PIL": "pillow",
    "bs4": "beautifulsoup4",
    "cv2": "opencv-python",
    "docx": "python-docx",
    "fitz": "pymupdf",
    "mpl_toolkits": "matplotlib",
    "pydantic_settings": "pydantic-settings",
    "sklearn": "scikit-learn",
}
STDLIB_MODULES = set(getattr(sys, "stdlib_module_names", set())) | {
    "__future__",
    "codaro",
    "typing_extensions",
}
IMPORT_RE = re.compile(r"^\s*(?:import\s+([A-Za-z_][\w.]*)|from\s+([A-Za-z_][\w.]*)\s+import\s+)", re.M)
BAD_INSTALL_COPY_RE = re.compile(r"(설치\s*없이|install\s*없이|pip\s+install)", re.I)
MISLEADING_IMPORT_SETUP_RE = re.compile(r"(설치\s*(?:및|와|과)?\s*import|import\s*(?:및|와|과)?\s*설치)", re.I)
VALID_PACKAGE_RE = re.compile(r"^[A-Za-z0-9]([A-Za-z0-9._-]*[A-Za-z0-9])?(\[.*\])?(([<>=!~]+)[\d.*]+)?$")
VISIBLE_INSTALL_LABEL_FIELDS = ("title", "subtitle", "goal", "prompt", "label")
ABILITY_TERMS = (
    "할 수",
    "만들",
    "분석",
    "자동화",
    "검증",
    "리포트",
    "비교",
    "저장",
    "처리",
    "집계",
    "시각화",
    "수집",
    "정제",
)
RUNTIME_PREP_TERMS = (
    "uv",
    "packages-check",
    "packages-install",
    "패키지",
    "라이브러리",
    "누락",
    "준비",
    "설치",
)
COMPLETION_TERMS = ("완료", "프로젝트", "검증", "산출물", "리포트", "자동화", "체크")
ORIENTATION_CATEGORIES = {"excel", "practical", "devTools"}
STRUCTURED_SECTION_FIELDS = (
    "subtitle",
    "goal",
    "why",
    "explanation",
    "tips",
    "snippet",
    "exercise",
    "check",
)


@dataclass(frozen=True)
class CheckResult:
    label: str
    passed: bool
    detail: str


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    lessons = [evaluateLesson(path) for path in sorted(CURRICULA_DIR.rglob("*.yaml")) if path.name != "schema.yaml"]
    summary = summarizeLessons(lessons)
    domains = buildDomains(summary, lessons)
    failedDomains = [
        domain
        for domain in domains
        if domain["score"] < MINIMUM_SCORE or domain["requirementFailures"]
    ]
    overallScore = round(sum(float(domain["score"]) for domain in domains) / len(domains), 2) if domains else 0.0
    payload = {
        "gate": "curriculum-top-tier-audit",
        "passed": not failedDomains,
        "status": "passed" if not failedDomains else "failed",
        "score": overallScore,
        "maxScore": 10,
        "minimumScore": MINIMUM_SCORE,
        "requiredScore": MINIMUM_SCORE,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "reportPath": displayPath(REPORT_PATH),
        "summary": summary,
        "domains": domains,
        "failedDomains": [domain["id"] for domain in failedDomains],
        "requirementFailures": [
            failure
            for domain in failedDomains
            for failure in domain["requirementFailures"]
        ],
        "actionableGaps": actionableGaps(lessons),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failedDomains:
        print("FAIL: curriculum top-tier audit has domains below 9.0", file=sys.stderr)
        return 1
    print(f"ok: curriculum top-tier audit score {overallScore}/10")
    return 0


def evaluateLesson(path: Path) -> dict[str, Any]:
    rel = path.relative_to(CURRICULA_DIR).as_posix()
    text = path.read_text(encoding="utf-8")
    content = safeYaml(path, text)
    meta = content.get("meta") if isinstance(content.get("meta"), dict) else {}
    sections = [section for section in content.get("sections", []) if isinstance(section, dict)]
    declaredPackages = uniqueTextList(meta.get("packages"))
    importedPackages = inferImportedPackages(content)
    stdlibDeclaredPackages = standardLibraryDeclaredPackages(declaredPackages)
    invalidDeclaredPackages = invalidPackageNames(declaredPackages)
    declaredNormalized = {normalizePackageName(package) for package in declaredPackages}
    if "opencv-contrib-python" in declaredNormalized:
        declaredNormalized.add("opencv-python")
    missingPackages = [
        package
        for package in importedPackages
        if normalizePackageName(package) not in declaredNormalized
    ]
    structuredSections = [section for section in sections if isStructuredSection(section)]
    corruptedStructuredSections = [
        section.get("id") or section.get("title") or f"section-{index}"
        for index, section in enumerate(structuredSections, start=1)
        if hasStructuredFieldEncodingLoss(section)
    ]
    sourceStructured = bool(structuredSections)
    orientation = isOrientation(rel, path.parent.name, content)
    introSignals = introSignalSummary(text, content, declaredPackages, orientation)
    conversionFailures: list[str] = []
    documentRuntimePackages: list[str] = []
    solutionCount = 0
    try:
        document, solutions = yamlToDocument(content, path.parent.name, path.stem)
        documentRuntimePackages = list(document.runtime.packages)
        solutionCount = len(solutions)
    except (TypeError, ValueError, KeyError, AttributeError) as exc:
        conversionFailures.append(f"{type(exc).__name__}: {exc}")

    return {
        "path": rel,
        "category": path.parent.name,
        "title": textValue(meta.get("title")) or path.stem,
        "orientation": orientation,
        "sectionCount": len(sections),
        "sourceStructured": sourceStructured,
        "structuredSectionCount": len(structuredSections),
        "structuredFieldEncodingLosses": corruptedStructuredSections,
        "declaredPackages": declaredPackages,
        "stdlibDeclaredPackages": stdlibDeclaredPackages,
        "invalidDeclaredPackages": invalidDeclaredPackages,
        "importedPackages": importedPackages,
        "missingPackages": missingPackages,
        "documentRuntimePackages": documentRuntimePackages,
        "solutionCount": solutionCount,
        "hasPractice": countBlocks(content, "expansion") > 0 or structuredPracticeCount(content) > 0,
        "codeBlockCount": countBlocks(content, "code") + structuredCodeCount(content),
        "directPipInstall": bool(re.search(r"\bpip\s+install\b", text)),
        "badInstallCopy": bool(BAD_INSTALL_COPY_RE.search(text) and declaredPackages),
        "misleadingImportSetupCopy": hasMisleadingImportSetupCopy(content),
        "visibleInstallLabelCopy": hasVisibleInstallLabelCopy(content),
        "packageIntroImportCheckMissing": bool(orientation and declaredPackages and not importedPackages),
        "externalUrlCount": len(re.findall(r"https?://", text)),
        "conversionFailures": conversionFailures,
        "introSignals": introSignals,
    }


def safeYaml(path: Path, text: str) -> dict[str, Any]:
    try:
        value = yaml.safe_load(text) or {}
    except yaml.YAMLError as exc:
        return {
            "meta": {"title": path.stem},
            "sections": [],
            "_yamlError": f"{type(exc).__name__}: {exc}",
        }
    return value if isinstance(value, dict) else {}


def introSignalSummary(
    text: str,
    content: dict[str, Any],
    declaredPackages: list[str],
    orientation: bool,
) -> dict[str, Any]:
    intro = content.get("intro") if isinstance(content.get("intro"), dict) else {}
    introText = "\n".join((
        json.dumps(intro, ensure_ascii=False),
        text[:4000],
    ))
    hasOutcomes = any(term in introText for term in ABILITY_TERMS)
    hasRuntimePrep = not declaredPackages or any(term in introText for term in RUNTIME_PREP_TERMS)
    hasFirstAssert = not declaredPackages or "assert" in introText
    hasRoadmapOrCompletion = any(term in introText for term in COMPLETION_TERMS)
    hasDiagramRuntime = "diagram" in intro and "runtime" in introText
    avoidsBadInstallCopy = not (declaredPackages and BAD_INSTALL_COPY_RE.search(introText))
    passed = (
        not orientation
        or (
            hasOutcomes
            and hasRuntimePrep
            and hasFirstAssert
            and hasRoadmapOrCompletion
            and avoidsBadInstallCopy
        )
    )
    return {
        "checked": orientation,
        "passed": passed,
        "hasOutcomes": hasOutcomes,
        "hasRuntimePrep": hasRuntimePrep,
        "hasFirstAssert": hasFirstAssert,
        "hasRoadmapOrCompletion": hasRoadmapOrCompletion,
        "hasDiagramRuntime": hasDiagramRuntime,
        "avoidsBadInstallCopy": avoidsBadInstallCopy,
    }


def inferImportedPackages(content: dict[str, Any]) -> list[str]:
    packages: set[str] = set()
    for code in codeSamples(content):
        for match in IMPORT_RE.finditer(code):
            moduleName = (match.group(1) or match.group(2) or "").split(".")[0]
            if not moduleName or moduleName in STDLIB_MODULES:
                continue
            packages.add(PACKAGE_ALIASES.get(moduleName, moduleName))
    return sorted(packages, key=str.lower)


def codeSamples(content: dict[str, Any]):
    for block in walkBlocks(content):
        if block.get("type") not in {"code", "expansion"}:
            continue
        yield textValue(block.get("code") if block.get("code") is not None else block.get("content"))
    for section in structuredSections(content):
        yield textValue(section.get("snippet"))
        exercise = section.get("exercise")
        if isinstance(exercise, dict):
            yield textValue(exercise.get("starterCode"))
            yield textValue(exercise.get("solution"))


def structuredSections(content: dict[str, Any]) -> list[dict[str, Any]]:
    sections = content.get("sections")
    if not isinstance(sections, list):
        return []
    return [
        section
        for section in sections
        if isinstance(section, dict)
        and (
            section.get("structuredPrimary") is True
            or any(key in section for key in ("goal", "snippet", "exercise", "check"))
        )
    ]


def structuredPracticeCount(content: dict[str, Any]) -> int:
    count = 0
    for section in structuredSections(content):
        exercise = section.get("exercise")
        if isinstance(exercise, dict) and any(
            textValue(exercise.get(key)) for key in ("prompt", "starterCode", "solution")
        ):
            count += 1
    return count


def structuredCodeCount(content: dict[str, Any]) -> int:
    count = 0
    for section in structuredSections(content):
        if textValue(section.get("snippet")):
            count += 1
        exercise = section.get("exercise")
        if isinstance(exercise, dict) and textValue(exercise.get("starterCode")):
            count += 1
    return count


def summarizeLessons(lessons: list[dict[str, Any]]) -> dict[str, Any]:
    orientationLessons = [lesson for lesson in lessons if lesson.get("orientation")]
    packageLessons = [lesson for lesson in lessons if lesson.get("declaredPackages")]
    structuredLessons = [lesson for lesson in lessons if lesson.get("sourceStructured")]
    introPassed = [
        lesson
        for lesson in orientationLessons
        if isinstance(lesson.get("introSignals"), dict) and lesson["introSignals"].get("passed") is True
    ]
    packageIntroRuntime = [
        lesson
        for lesson in orientationLessons
        if lesson.get("declaredPackages")
        and isinstance(lesson.get("introSignals"), dict)
        and lesson["introSignals"].get("hasRuntimePrep") is True
    ]
    return {
        "lessonCount": len(lessons),
        "sectionCount": sum(int(lesson.get("sectionCount", 0)) for lesson in lessons),
        "sourceStructuredLessonCount": len(structuredLessons),
        "sourceStructuredLessonRatio": ratio(len(structuredLessons), len(lessons)),
        "structuredSectionCount": sum(int(lesson.get("structuredSectionCount", 0)) for lesson in lessons),
        "structuredFieldEncodingLossLessonCount": sum(1 for lesson in lessons if lesson.get("structuredFieldEncodingLosses")),
        "structuredFieldEncodingLossSectionCount": sum(
            len(lesson.get("structuredFieldEncodingLosses", [])) for lesson in lessons
        ),
        "orientationLessonCount": len(orientationLessons),
        "orientationIntroPassCount": len(introPassed),
        "orientationIntroPassRatio": ratio(len(introPassed), len(orientationLessons)),
        "packageLessonCount": len(packageLessons),
        "packageOrientationRuntimePrepCount": len(packageIntroRuntime),
        "packageOrientationRuntimePrepRatio": ratio(len(packageIntroRuntime), len([lesson for lesson in orientationLessons if lesson.get("declaredPackages")])),
        "missingDeclaredPackageLessonCount": sum(1 for lesson in lessons if lesson.get("missingPackages")),
        "stdlibDeclaredPackageLessonCount": sum(1 for lesson in lessons if lesson.get("stdlibDeclaredPackages")),
        "invalidDeclaredPackageLessonCount": sum(1 for lesson in lessons if lesson.get("invalidDeclaredPackages")),
        "documentRuntimeMissingLessonCount": sum(
            1
            for lesson in lessons
            if lesson.get("declaredPackages") and not lesson.get("documentRuntimePackages")
        ),
        "practiceLessonCount": sum(1 for lesson in lessons if lesson.get("hasPractice")),
        "practiceSolutionMissingLessonCount": sum(
            1
            for lesson in lessons
            if lesson.get("hasPractice") and int(lesson.get("solutionCount", 0)) == 0
        ),
        "directPipInstallLessonCount": sum(1 for lesson in lessons if lesson.get("directPipInstall")),
        "badInstallCopyLessonCount": sum(1 for lesson in lessons if lesson.get("badInstallCopy")),
        "misleadingImportSetupCopyLessonCount": sum(1 for lesson in lessons if lesson.get("misleadingImportSetupCopy")),
        "visibleInstallLabelLessonCount": sum(1 for lesson in lessons if lesson.get("visibleInstallLabelCopy")),
        "packageIntroImportCheckMissingLessonCount": sum(1 for lesson in lessons if lesson.get("packageIntroImportCheckMissing")),
        "externalUrlLessonCount": sum(1 for lesson in lessons if int(lesson.get("externalUrlCount", 0)) > 0),
        "conversionFailureLessonCount": sum(1 for lesson in lessons if lesson.get("conversionFailures")),
    }


def buildDomains(summary: dict[str, Any], lessons: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        domain("skill-ssot-and-authoring-procedure", (
            textContains("curriculum authoring skill exists", "docs/skills/architecture/curriculum-authoring.md", "커리큘럼 작성 절차"),
            textContains("authoring skill has dependency policy", "docs/skills/architecture/curriculum-authoring.md", "packages-check → packages-install"),
            textContains("authoring skill has intro contract", "docs/skills/architecture/curriculum-authoring.md", "소개 레슨 계약"),
            textContains("learning YAML contract references authoring", "docs/skills/architecture/learning-yaml-contract.md", "커리큘럼 작성 절차"),
            textContains("teacher skill registry includes authoring skill", "src/codaro/ai/teacher/skillRegistry.py", "skillId=\"curriculum-authoring\""),
            textContains("teacher prompt requires structured YAML", "src/codaro/ai/conversation.py", "structured Codaro learning contract"),
        )),
        domain("lazy-uv-dependency-discipline", (
            projectDependenciesAvoidStudyPackages(),
            summaryEquals("all imports declared in meta.packages", summary, "missingDeclaredPackageLessonCount", 0),
            summaryEquals("no stdlib module is declared as a package", summary, "stdlibDeclaredPackageLessonCount", 0),
            summaryEquals("all declared package names are valid", summary, "invalidDeclaredPackageLessonCount", 0),
            summaryEquals("all declared packages preserved in document runtime", summary, "documentRuntimeMissingLessonCount", 0),
            summaryEquals("no direct pip install copy in curricula", summary, "directPipInstallLessonCount", 0),
            summaryEquals("package intro lessons have an import check", summary, "packageIntroImportCheckMissingLessonCount", 0),
            textContains("runtime preflight gate exists", "tests/run.py", "\"editor-runtime-preflight\""),
            textContains("local runtime documents uv only", "docs/skills/identity/local-first-runtime.md", "uv"),
        )),
        domain("practice-execution-and-verification", (
            summaryEquals("all YAML converts", summary, "conversionFailureLessonCount", 0),
            summaryEquals("practice solutions are captured", summary, "practiceSolutionMissingLessonCount", 0),
            ratioAtLeast("practice lesson coverage", int(summary["practiceLessonCount"]), int(summary["lessonCount"]), 0.90),
            textContains("curriculum flow verifier checks code count", "tests/verifyCurriculumFlowQuality.py", "non-orientation lesson needs executable code flow"),
            textContains("curriculum flow verifier checks completion signal", "tests/verifyCurriculumFlowQuality.py", "lesson needs a completion"),
            textContains("exercise checker exists", "src/codaro/curriculum/exerciseCheck.py", "runExerciseCheck"),
        )),
        domain("intro-onboarding-and-outcomes", (
            ratioAtLeast(
                "orientation intro pass ratio",
                int(summary["orientationIntroPassCount"]),
                int(summary["orientationLessonCount"]),
                0.90,
            ),
            ratioAtLeast(
                "package orientation uv/runtime prep ratio",
                int(summary["packageOrientationRuntimePrepCount"]),
                countPackageOrientationLessons(lessons),
                0.90,
            ),
            summaryEquals("no package lesson says install-free", summary, "badInstallCopyLessonCount", 0),
            summaryEquals("no import-check section is labeled as install", summary, "misleadingImportSetupCopyLessonCount", 0),
            summaryEquals("no visible lesson label asks the learner to install packages", summary, "visibleInstallLabelLessonCount", 0),
            textContains("authoring doc lists what learner can do", "docs/skills/architecture/curriculum-authoring.md", "무엇을 할 수 있는지"),
            textContains("authoring doc requires first assert", "docs/skills/architecture/curriculum-authoring.md", "assert"),
            textContains("learning contract requires intro runtime", "docs/skills/architecture/learning-yaml-contract.md", "intro.diagram.runtime"),
        )),
        domain("structured-source-contract-adoption", (
            ratioAtLeast(
                "built-in source structured lesson ratio",
                int(summary["sourceStructuredLessonCount"]),
                int(summary["lessonCount"]),
                0.60,
            ),
            ratioAtLeast(
                "structured section source coverage",
                int(summary["structuredSectionCount"]),
                int(summary["sectionCount"]),
                0.60,
            ),
            summaryEquals("no structured field encoding loss", summary, "structuredFieldEncodingLossSectionCount", 0),
            textContains("schema documents structured section fields", "curricula/python/schema.yaml", "goal:"),
            textContains("schema documents structured exercise solution", "curricula/python/schema.yaml", "starterCode"),
            textContains("matrix verifies structured samples", "tests/verifyCurriculumQualityMatrix.py", "REQUIRED_SECTION_FLOW"),
            textContains("browser verifies structured cards", "tests/verifyLearningCardPlaywright.py", "data-learning-section-structured"),
        )),
        domain("objective-evidence-and-gate-wiring", (
            textContains("runner has top-tier gate", "tests/run.py", "\"curriculum-top-tier-audit\""),
            textContains("gate docs mention top-tier audit", "docs/skills/ops/foundation/testing-and-gates.md", "`curriculum-top-tier-audit`"),
            textContains("product quality docs mention top-tier report", "docs/skills/ops/product/service-candidate.md", "curriculum-top-tier-report.json"),
            summaryEquals("top-tier report has current conversion baseline", summary, "conversionFailureLessonCount", 0),
        )),
    ]


def domain(domainId: str, checks: tuple[CheckResult, ...]) -> dict[str, Any]:
    passed = sum(1 for check in checks if check.passed)
    score = round((passed / len(checks)) * 10, 2) if checks else 0
    failures = [
        {"label": check.label, "detail": check.detail}
        for check in checks
        if not check.passed
    ]
    return {
        "id": domainId,
        "score": score,
        "maxScore": 10,
        "minimumScore": MINIMUM_SCORE,
        "passed": score >= MINIMUM_SCORE and not failures,
        "evidence": [
            {"label": check.label, "detail": check.detail}
            for check in checks
            if check.passed
        ],
        "requirementFailures": failures,
    }


def textContains(label: str, relPath: str, needle: str) -> CheckResult:
    path = ROOT / relPath
    if not path.is_file():
        return CheckResult(label, False, f"{relPath} missing")
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as exc:
        return CheckResult(label, False, f"{relPath}: {type(exc).__name__}: {exc}")
    passed = needle in text
    return CheckResult(label, passed, f"{relPath}: {needle}" if passed else f"{relPath}: missing {needle}")


def projectDependenciesAvoidStudyPackages() -> CheckResult:
    path = ROOT / "pyproject.toml"
    try:
        payload = tomllib.loads(path.read_text(encoding="utf-8"))
    except (OSError, tomllib.TOMLDecodeError, UnicodeDecodeError) as exc:
        return CheckResult("project dependencies parsed", False, f"pyproject.toml: {type(exc).__name__}: {exc}")
    project = payload.get("project")
    dependencies = project.get("dependencies") if isinstance(project, dict) else None
    if not isinstance(dependencies, list):
        return CheckResult("base dependencies avoid study packages", False, "project.dependencies missing")
    normalized = {normalizePackageName(str(item)) for item in dependencies}
    leaked = sorted(normalized & {normalizePackageName(package) for package in STUDY_TOPIC_PACKAGES})
    passed = not leaked
    detail = "study packages stay lesson-local" if passed else "base dependency leaks: " + ", ".join(leaked)
    return CheckResult("base dependencies avoid study packages", passed, detail)


def summaryEquals(label: str, summary: dict[str, Any], key: str, expected: Any) -> CheckResult:
    actual = summary.get(key)
    passed = actual == expected
    return CheckResult(label, passed, f"{key}: {expected!r}" if passed else f"{key}: expected {expected!r}, got {actual!r}")


def ratioAtLeast(label: str, numerator: int, denominator: int, minimum: float) -> CheckResult:
    actual = ratio(numerator, denominator)
    passed = denominator > 0 and actual >= minimum
    return CheckResult(
        label,
        passed,
        f"{numerator}/{denominator} = {actual:.3f} >= {minimum:.2f}"
        if passed
        else f"{numerator}/{denominator} = {actual:.3f} < {minimum:.2f}",
    )


def actionableGaps(lessons: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "legacyOnlyLessons": [
            lesson["path"]
            for lesson in lessons
            if not lesson.get("sourceStructured")
        ][:30],
        "weakIntroLessons": [
            lesson["path"]
            for lesson in lessons
            if lesson.get("orientation")
            and isinstance(lesson.get("introSignals"), dict)
            and lesson["introSignals"].get("passed") is not True
        ][:30],
        "badInstallCopyLessons": [
            lesson["path"]
            for lesson in lessons
            if lesson.get("badInstallCopy")
        ][:30],
        "misleadingImportSetupCopyLessons": [
            lesson["path"]
            for lesson in lessons
            if lesson.get("misleadingImportSetupCopy")
        ][:30],
        "visibleInstallLabelLessons": [
            lesson["path"]
            for lesson in lessons
            if lesson.get("visibleInstallLabelCopy")
        ][:30],
        "packageIntroImportCheckMissingLessons": [
            lesson["path"]
            for lesson in lessons
            if lesson.get("packageIntroImportCheckMissing")
        ][:30],
        "missingPackageDeclarationLessons": [
            {
                "path": lesson["path"],
                "missingPackages": lesson["missingPackages"],
            }
            for lesson in lessons
            if lesson.get("missingPackages")
        ][:30],
        "stdlibDeclaredPackageLessons": [
            {
                "path": lesson["path"],
                "stdlibDeclaredPackages": lesson["stdlibDeclaredPackages"],
            }
            for lesson in lessons
            if lesson.get("stdlibDeclaredPackages")
        ][:30],
        "invalidDeclaredPackageLessons": [
            {
                "path": lesson["path"],
                "invalidDeclaredPackages": lesson["invalidDeclaredPackages"],
            }
            for lesson in lessons
            if lesson.get("invalidDeclaredPackages")
        ][:30],
        "structuredFieldEncodingLossLessons": [
            {
                "path": lesson["path"],
                "sections": lesson["structuredFieldEncodingLosses"],
            }
            for lesson in lessons
            if lesson.get("structuredFieldEncodingLosses")
        ][:30],
        "externalUrlLessons": [
            lesson["path"]
            for lesson in lessons
            if int(lesson.get("externalUrlCount", 0)) > 0
        ][:30],
    }


def countPackageOrientationLessons(lessons: list[dict[str, Any]]) -> int:
    return sum(1 for lesson in lessons if lesson.get("orientation") and lesson.get("declaredPackages"))


def standardLibraryDeclaredPackages(packages: list[str]) -> list[str]:
    return [package for package in packages if isStandardLibraryPackage(package)]


def invalidPackageNames(packages: list[str]) -> list[str]:
    return [package for package in packages if not VALID_PACKAGE_RE.match(package)]


def isStandardLibraryPackage(package: str) -> bool:
    match = re.match(r"^[A-Za-z0-9][A-Za-z0-9._-]*", package.strip())
    if match is None:
        return False
    return match.group(0).replace("-", "_") in STDLIB_MODULES


def hasMisleadingImportSetupCopy(content: dict[str, Any]) -> bool:
    for node in walkMaps(content):
        for fieldName in ("title", "subtitle", "goal", "prompt", "noError"):
            value = textValue(node.get(fieldName))
            if value and MISLEADING_IMPORT_SETUP_RE.search(value):
                return True
    return False


def hasVisibleInstallLabelCopy(content: dict[str, Any]) -> bool:
    for node in walkMaps(content):
        for fieldName in VISIBLE_INSTALL_LABEL_FIELDS:
            value = textValue(node.get(fieldName))
            if "설치" in value:
                return True
    return False


def walkMaps(value: Any):
    if isinstance(value, dict):
        yield value
        for item in value.values():
            yield from walkMaps(item)
    elif isinstance(value, list):
        for item in value:
            yield from walkMaps(item)


def isStructuredSection(section: dict[str, Any]) -> bool:
    if isinstance(section.get("blocks"), list) and section["blocks"] and section.get("structuredPrimary") is not True:
        return False
    present = [field for field in STRUCTURED_SECTION_FIELDS if field in section]
    if len(present) < 5:
        return False
    exercise = section.get("exercise")
    return isinstance(exercise, dict) and any(key in exercise for key in ("starterCode", "solution", "hints"))


def hasStructuredFieldEncodingLoss(section: dict[str, Any]) -> bool:
    textParts: list[str] = []
    for key in ("subtitle", "goal", "why", "explanation"):
        textParts.append(textValue(section.get(key)))
    textParts.extend(uniqueTextList(section.get("tips")))
    exercise = section.get("exercise")
    if isinstance(exercise, dict):
        textParts.append(textValue(exercise.get("prompt")))
        textParts.extend(uniqueTextList(exercise.get("hints")))
        check = exercise.get("check")
        if isinstance(check, dict):
            textParts.extend(textValue(value) for value in check.values())
    check = section.get("check")
    if isinstance(check, dict):
        textParts.extend(textValue(value) for value in check.values())
    return any(looksLikeEncodingLoss(part) for part in textParts if part)


def looksLikeEncodingLoss(value: str) -> bool:
    return "??" in value


def countBlocks(content: dict[str, Any], sourceType: str) -> int:
    return sum(1 for block in walkBlocks(content) if block.get("type") == sourceType)


def walkBlocks(value: Any):
    if isinstance(value, dict):
        if "type" in value:
            yield value
        for item in value.values():
            yield from walkBlocks(item)
    elif isinstance(value, list):
        for item in value:
            yield from walkBlocks(item)


def isOrientation(rel: str, category: str, content: dict[str, Any]) -> bool:
    fileName = rel.rsplit("/", 1)[-1]
    if fileName.startswith("00_") or category in ORIENTATION_CATEGORIES:
        return True
    return structuredPracticeCount(content) == 0 and countBlocks(content, "expansion") == 0 and (
        countBlocks(content, "code") + structuredCodeCount(content)
    ) < 2


def uniqueTextList(value: Any) -> list[str]:
    if isinstance(value, str | int | float | bool):
        text = str(value).strip()
        return [text] if text else []
    if not isinstance(value, list):
        return []
    result: list[str] = []
    for item in value:
        if isinstance(item, str | int | float | bool):
            text = str(item).strip()
            if text:
                result.append(text)
    return list(dict.fromkeys(result))


def normalizePackageName(value: str) -> str:
    packageName = re.match(r"^[A-Za-z0-9_.-]+", value.strip())
    normalized = packageName.group(0) if packageName else value.strip()
    return normalized.lower().replace("_", "-")


def textValue(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, int | float | bool):
        return str(value)
    return ""


def ratio(numerator: int, denominator: int) -> float:
    return round(numerator / denominator, 4) if denominator else 0.0


def currentGitHead() -> str | None:
    try:
        result = subprocess.run(
            ("git", "rev-parse", "HEAD"),
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5,
            check=True,
        )
    except (FileNotFoundError, OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() or None


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def displayPath(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


if __name__ == "__main__":
    raise SystemExit(main())
