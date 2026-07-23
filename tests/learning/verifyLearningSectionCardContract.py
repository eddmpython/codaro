from __future__ import annotations

import base64
import hashlib
import json
import sys
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[2]
SURFACE = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumSurface.tsx"
SECTION_RENDERER = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumSectionRenderer.tsx"
CURRICULUM_OVERVIEW = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumOverview.tsx"
CURRICULUM_LEARNING_CELL = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumLearningCell.tsx"
CURRICULUM_TOC = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumToc.tsx"
MARKDOWN_DATA_CELLS = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumMarkdownDataCells.tsx"
MARKDOWN_RICH_TEXT = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumMarkdownRichText.tsx"
CURRICULUM_HOME = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumHome.tsx"
DEPENDENCY_PANEL = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumDependencyPanel.tsx"
MARKDOWN_BODY = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumMarkdownBody.tsx"
CURRICULA_REGISTRY = ROOT / "editor" / "src" / "lib" / "curriculaRegistry.ts"
APP_PRIMITIVES = ROOT / "editor" / "src" / "components" / "app" / "appPrimitives.tsx"
CURRENT_LEARNING_SURFACE = ROOT / "editor" / "src" / "components" / "app" / "currentLearningSurface.tsx"
NOTEBOOK_PANEL = ROOT / "editor" / "src" / "components" / "notebook" / "notebookPanel.tsx"
PRODUCT_SIDEBAR = ROOT / "editor" / "src" / "components" / "app" / "productSidebar.tsx"
TOP_BAR = ROOT / "editor" / "src" / "components" / "app" / "topBar.tsx"
CELL_ACTIONS = ROOT / "editor" / "src" / "components" / "app" / "cellAiActions.tsx"
AI_PANEL = ROOT / "editor" / "src" / "components" / "assistant" / "assistantPanel.tsx"
APP = ROOT / "editor" / "src" / "App.tsx"
TERMINAL_PANEL = ROOT / "editor" / "src" / "components" / "terminal" / "terminalPanel.tsx"
TERMINAL_LAUNCH = ROOT / "editor" / "src" / "lib" / "terminalLaunch.ts"
LOCALE_COPY = ROOT / "editor" / "src" / "lib" / "localeCopy.ts"
PACKAGE_INFERENCE = ROOT / "editor" / "src" / "lib" / "packageInference.ts"
PACKAGE_PREPARATION = ROOT / "editor" / "src" / "lib" / "curriculumPackagePreparation.ts"
PYTHON_STDLIB = ROOT / "editor" / "src" / "lib" / "pythonStdlib.ts"
CELL_MODEL = ROOT / "editor" / "src" / "lib" / "cellModel.ts"
LEARNING_ATTEMPT = ROOT / "editor" / "src" / "lib" / "learningAttemptCheck.ts"
LEARNING_CHECK_SPEC = ROOT / "editor" / "src" / "lib" / "learningCheckSpec.ts"
BROWSER_CHECK_EXECUTOR = ROOT / "editor" / "src" / "lib" / "browserLearningCheckExecutor.ts"
WEB_LEARNING_EVIDENCE = ROOT / "editor" / "src" / "lib" / "webLearningEvidence.ts"
LEARNING_EVIDENCE_OPERATIONS = ROOT / "editor" / "src" / "lib" / "learningEvidenceOperations.ts"
CURRICULUM_ASSESSMENT_QUEUE = ROOT / "editor" / "src" / "lib" / "curriculumAssessmentQueue.ts"
CURRICULUM_PROGRESS = ROOT / "editor" / "src" / "lib" / "curriculumProgress.ts"
CURRICULUM_LEARNING_STATE = ROOT / "editor" / "src" / "lib" / "curriculumLearningState.ts"
CURRICULUM_LEARNING_PROJECTION = ROOT / "editor" / "src" / "lib" / "curriculumLearningProjection.ts"
CODE_COMPLETION = ROOT / "editor" / "src" / "lib" / "codeCompletion.ts"
DAY_ONE = ROOT / "curricula" / "python" / "basics" / "30days" / "day01_헬로월드.yaml"
PATHLIB_LESSON = ROOT / "curricula" / "python" / "automation" / "os" / "fileOps" / "01_pathlib경로감각.yaml"
ZIP_LESSON = ROOT / "curricula" / "python" / "automation" / "os" / "fileOps" / "06_zip압축.yaml"
SCHEDULE_LESSON = ROOT / "curricula" / "python" / "automation" / "os" / "watchSched" / "05_schedule간단스케줄.yaml"
SCHEDULE_WHEEL = ROOT / "editor" / "public" / "check-packages" / "schedule-1.2.2-py3-none-any.whl"


def require(text: str, token: str, label: str, failures: list[str]) -> None:
    if token not in text:
        failures.append(f"missing {label}: {token}")


def require_order(text: str, before: str, after: str, label: str, failures: list[str]) -> None:
    before_index = text.find(before)
    after_index = text.find(after)
    if before_index == -1 or after_index == -1:
        failures.append(f"missing order tokens for {label}")
        return
    if before_index > after_index:
        failures.append(f"wrong order for {label}: expected {before} before {after}")


def main() -> int:
    failures: list[str] = []

    requiredPaths = (
        SURFACE, SECTION_RENDERER, CURRICULUM_OVERVIEW, CURRICULUM_LEARNING_CELL,
        CURRICULUM_TOC, MARKDOWN_DATA_CELLS, MARKDOWN_RICH_TEXT, CURRICULUM_HOME,
        DEPENDENCY_PANEL, MARKDOWN_BODY, CURRICULA_REGISTRY,
        APP_PRIMITIVES, CURRENT_LEARNING_SURFACE, NOTEBOOK_PANEL, PRODUCT_SIDEBAR, TOP_BAR,
        CELL_ACTIONS, AI_PANEL, APP, TERMINAL_PANEL, TERMINAL_LAUNCH,
        LOCALE_COPY, PACKAGE_INFERENCE, PACKAGE_PREPARATION, PYTHON_STDLIB, CELL_MODEL,
        LEARNING_ATTEMPT, LEARNING_CHECK_SPEC, BROWSER_CHECK_EXECUTOR,
        WEB_LEARNING_EVIDENCE, LEARNING_EVIDENCE_OPERATIONS, CURRICULUM_PROGRESS,
        CURRICULUM_LEARNING_STATE, CURRICULUM_LEARNING_PROJECTION, CODE_COMPLETION,
        DAY_ONE, PATHLIB_LESSON, ZIP_LESSON,
        SCHEDULE_LESSON, SCHEDULE_WHEEL,
    )
    for path in requiredPaths:
        if not path.exists():
            print(f"FAIL: missing editor surface: {path.relative_to(ROOT)}", file=sys.stderr)
            return 1

    surfacePaths = (
        SURFACE,
        SECTION_RENDERER,
        CURRICULUM_OVERVIEW,
        CURRICULUM_LEARNING_CELL,
        CURRICULUM_TOC,
        MARKDOWN_DATA_CELLS,
        MARKDOWN_RICH_TEXT,
    )
    text = "\n".join(path.read_text(encoding="utf-8") for path in surfacePaths)
    curriculumHomeText = CURRICULUM_HOME.read_text(encoding="utf-8")
    dependencyPanelText = DEPENDENCY_PANEL.read_text(encoding="utf-8")
    cellActionsText = CELL_ACTIONS.read_text(encoding="utf-8")
    aiPanelText = AI_PANEL.read_text(encoding="utf-8")
    appText = APP.read_text(encoding="utf-8")
    terminalPanelText = TERMINAL_PANEL.read_text(encoding="utf-8")
    terminalLaunchText = TERMINAL_LAUNCH.read_text(encoding="utf-8")
    markdownBodyText = "\n".join(
        path.read_text(encoding="utf-8")
        for path in (MARKDOWN_BODY, MARKDOWN_DATA_CELLS, MARKDOWN_RICH_TEXT)
    )
    curriculaRegistryText = CURRICULA_REGISTRY.read_text(encoding="utf-8")
    appPrimitivesText = APP_PRIMITIVES.read_text(encoding="utf-8")
    currentLearningSurfaceText = CURRENT_LEARNING_SURFACE.read_text(encoding="utf-8")
    notebookPanelText = NOTEBOOK_PANEL.read_text(encoding="utf-8")
    productSidebarText = PRODUCT_SIDEBAR.read_text(encoding="utf-8")
    topBarText = TOP_BAR.read_text(encoding="utf-8")
    localeCopyText = LOCALE_COPY.read_text(encoding="utf-8")
    packageInferenceText = PACKAGE_INFERENCE.read_text(encoding="utf-8")
    packagePreparationText = PACKAGE_PREPARATION.read_text(encoding="utf-8")
    pythonStdlibText = PYTHON_STDLIB.read_text(encoding="utf-8")
    cellModelText = CELL_MODEL.read_text(encoding="utf-8")
    learningAttemptText = LEARNING_ATTEMPT.read_text(encoding="utf-8")
    learningCheckSpecText = LEARNING_CHECK_SPEC.read_text(encoding="utf-8")
    browserCheckExecutorText = BROWSER_CHECK_EXECUTOR.read_text(encoding="utf-8")
    webLearningEvidenceText = WEB_LEARNING_EVIDENCE.read_text(encoding="utf-8")
    learningEvidenceOperationsText = LEARNING_EVIDENCE_OPERATIONS.read_text(encoding="utf-8")
    curriculumAssessmentQueueText = CURRICULUM_ASSESSMENT_QUEUE.read_text(encoding="utf-8")
    curriculumProgressText = CURRICULUM_PROGRESS.read_text(encoding="utf-8")
    curriculumLearningStateText = CURRICULUM_LEARNING_STATE.read_text(encoding="utf-8")
    curriculumLearningProjectionText = CURRICULUM_LEARNING_PROJECTION.read_text(encoding="utf-8")
    codeCompletionText = CODE_COMPLETION.read_text(encoding="utf-8")

    required_tokens = {
        "section card marker": "data-learning-section-card={section.id}",
        "structured section marker": 'data-learning-section-structured={structured ? "true" : "false"}',
        "overview marker": 'data-learning-section-part="overview"',
        "overview learn list marker": 'data-learning-overview-part="learn-list"',
        "overview learn list heading": "오늘 배우는 것",
        "section goal heading": "이번 섹션의 목표",
        "section concept heading": "핵심 개념",
        "package dependency panel shell": "<CurriculumDependencyPanel",
        "package dependency panel import": 'from "./curriculumDependencyPanel"',
        "exercise marker": 'data-learning-section-part="exercise"',
        "exercise direct editor marker": 'data-learning-exercise-input="editor"',
        "exercise student practice role": 'data-learning-exercise-input-role="student-practice"',
        "exercise selected state marker": "data-learning-exercise-input-state={exerciseSelected ? \"selected\" : \"ready\"}",
        "exercise direct editor title": "직접 해보기",
        "exercise direct editor aria label": "직접 해보기 코드 편집기",
        "accent action token": "bg-accent-brand",
        "automatic attempt evaluation": "evaluateLearningAttempt",
        "strong evidence persistence": "storeStrongLearningEvidence",
        "automatic check result marker": "data-learning-check-result={attemptCheck.state}",
        "practice evidence marker": "data-learning-check-evidence={attemptCheck.evidence}",
        "result marker": 'data-learning-section-part="result"',
        "section narrative renderer": "function SectionNarrative",
        "structured body renderer": "function StructuredSectionLearningBody",
        "structured detector": "function hasStructuredSectionBlocks",
        "structured parts resolver": "function structuredSectionParts",
        "narrative before body": "<SectionNarrative contract={section.contract} />",
        "section index marker": 'data-learning-section-index="true"',
        "section heading marker": 'data-learning-section-heading="true"',
        "non-interactive section heading": '<header className="grid w-full min-w-0',
        "push toc marker": 'data-learning-toc="push"',
        "push toc state width expansion": 'expanded ? "w-72',
        "single-card structured branch": "structured ? (",
        "legacy fallback branch": "variant=\"embedded\"",
        "contract source detector": 'block.sourceType?.startsWith("sectionContract:")',
        "snippet source mapping": 'block.sourceType === "sectionContract:snippet"',
        "exercise source mapping": 'block.sourceType === "sectionContract:exercise"',
        "snippet part assignment": 'data-learning-section-part="snippet"',
        "snippet kicker marker": 'data-learning-snippet-kicker="true"',
        "structured exercise direct editor does not steal entry focus": "autoFocus: false",
        "structured exercise accessible editor name": "ariaLabel: `${blockLabel(exercise)} 직접 해보기 코드 편집기`",
        "code cell direct editor marker": 'data-learning-code-input="editor"',
        "code input role marker": 'data-learning-code-input-role={isSnippetCode ? "student-practice" : "code-edit"}',
        "code input selected marker": "data-learning-code-input-state={isSelected ? \"selected\" : \"ready\"}",
        "embedded bare cell marker": 'data-learning-cell="embedded"',
        "embedded selection rail": "border-l-2 border-transparent",
    }
    for label, token in required_tokens.items():
        require(text, token, label, failures)

    attempt_tokens = {
        "deterministic practice classifier": "isDeterministicPracticeCheckConfig",
        "Local done status is successful": '["success", "ok", "done"]',
        "exact output comparator": "if (actual !== expected)",
        "verified practice state": 'state: "verified"',
        "unsupported completion state": 'state: "unsupported"',
        "practice evidence only": 'evidence: "practice"',
        "strong evidence only after isolated check": 'evidence: checked.passed ? "strong" : "none"',
    }
    for label, token in attempt_tokens.items():
        require(learningAttemptText, token, label, failures)

    require(codeCompletionText, "if (!shouldUseApi()) return [];", "static Web completion API boundary", failures)

    progress_tokens = {
        "canonical learning state loader": "loadCanonicalCurriculumLearningState",
        "canonical progress projection": "progressSummaryFromCanonicalProjection",
        "legacy progress read-only key": 'legacyWebProgressStorageKey = "codaro-web-progress-v1"',
    }
    for label, token in progress_tokens.items():
        require(curriculumProgressText, token, label, failures)
    canonical_state_tokens = {
        "Web and Local evidence reader": "readLearningEvidenceEvents",
        "registry progress contract": "registryLessonProgressContract",
        "shared canonical reducer": "projectCanonicalCurriculumLearning",
    }
    for label, token in canonical_state_tokens.items():
        require(curriculumLearningStateText, token, label, failures)
    canonical_projection_tokens = {
        "MasteryPolicy v1 projection": "new MasteryPolicy().reduce",
        "accepted canonical credit filter": "creditEventIds",
        "required outcome completion": "completionTimestamp(orderedCredits, contract.requiredOutcomeIds)",
        "derived review list": "reviewListFromCanonicalProjection",
    }
    for label, token in canonical_projection_tokens.items():
        require(curriculumLearningProjectionText, token, label, failures)
    for forbidden in (
        "recordWebPracticeVerified",
        "recordWebStrongCheckVerified",
        "writeWebProgress",
        "codaroApi.progress",
        "completedAt: current?.completedAt",
    ):
        if forbidden in curriculumProgressText:
            failures.append(f"legacy/manual completion path remains: {forbidden}")

    dayOne = yaml.safe_load(DAY_ONE.read_text(encoding="utf-8"))
    exercises = [section for section in dayOne.get("sections", []) if section.get("exercise")]
    if len(exercises) != 10:
        failures.append(f"Day 1 must contain 10 runnable practices, found {len(exercises)}")
    strongSections = []
    practiceSections = []
    for section in exercises:
        check = section.get("check", {})
        if check.get("strength") == "strong":
            strongSections.append(section)
            required = ("id", "version", "kind", "executor", "timeoutMs", "fixtureId", "fixtureHash", "fixture", "payload")
            missing = [key for key in required if key not in check]
            if missing:
                failures.append(f"Day 1 strong check {section.get('id')} missing {missing}")
            if check.get("version") != 1 or check.get("kind") != "output" or check.get("executor") != "browser-worker":
                failures.append(f"Day 1 strong check {section.get('id')} has an invalid typed contract")
            fixtureBytes = json.dumps(check.get("fixture"), ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
            expectedHash = "sha256-" + base64.b64encode(hashlib.sha256(fixtureBytes).digest()).decode("ascii")
            if check.get("fixtureHash") != expectedHash:
                failures.append(f"Day 1 strong check {section.get('id')} fixture hash is stale")
        else:
            practiceSections.append(section)
            if check.get("type") != "outputExact" or check.get("evidence") != "practice":
                failures.append(f"Day 1 practice {section.get('id')} lacks deterministic practice evidence")
            if not isinstance(check.get("outputExact"), str) or not check["outputExact"].strip():
                failures.append(f"Day 1 practice {section.get('id')} lacks a non-empty exact output")
    if len(strongSections) != 1 or len(practiceSections) != 9:
        failures.append(f"Day 1 staged evidence must be 1 strong + 9 practice, got {len(strongSections)} + {len(practiceSections)}")
    elif strongSections[0].get("assessmentMode") != "mastery":
        failures.append("Day 1 strong section must be the visible mastery source")

    assessment = dayOne.get("assessment", {})
    assessmentExpectations = (("transferVariants", "transfer", 0), ("retrievalVariants", "retrieval", 7 * 24))
    for key, mode, minimumDelayHours in assessmentExpectations:
        variants = assessment.get(key, [])
        if len(variants) != 1:
            failures.append(f"Day 1 must own one real {mode} assessment variant")
            continue
        variant = variants[0]
        check = variant.get("check", {})
        exercise = variant.get("exercise", {})
        if (
            variant.get("mode") != mode
            or variant.get("unseen") is not True
            or not variant.get("sourceSectionIds")
            or variant.get("snippet")
            or not exercise.get("starterCode")
            or not exercise.get("solution")
            or check.get("strength") != "strong"
            or check.get("executor") != "browser-worker"
        ):
            failures.append(f"Day 1 {mode} variant is not an unseen independent strong task")
        if mode == "retrieval" and variant.get("minimumDelayHours", 0) < minimumDelayHours:
            failures.append("Day 1 retrieval variant must wait at least 24 hours")
        fixtureBytes = json.dumps(
            check.get("fixture"), ensure_ascii=False, sort_keys=True, separators=(",", ":")
        ).encode("utf-8")
        fixtureHash = "sha256-" + base64.b64encode(hashlib.sha256(fixtureBytes).digest()).decode("ascii")
        if check.get("fixtureHash") != fixtureHash:
            failures.append(f"Day 1 {mode} fixture hash is stale")

    strong_contract_tokens = {
        "typed output check parser": "parseStrongOutputCheckSpec",
        "typed behavior check parser": 'value.kind === "behavior"',
        "fixture hash validation": "verifyLearningFixtureHash",
        "exact output normalization": "normalizeLearningOutput",
        "fresh worker spawn": "new Worker(workerUrl",
        "worker timeout": "learning check timeout",
        "worker teardown": "worker?.terminate()",
        "process worker SRI": "check asset integrity mismatch",
        "clean namespace": 'namespace = {"__name__": "__main__", "__builtins__": __builtins__}',
        "behavior fixture arguments": 'behavior["cases"]',
        "behavior literal arguments": 'item.get("value")',
        "behavior expected exceptions": '"exception": type(case_error).__name__',
        "behavior side-effect rejection": "함수 호출 전에 fixture를 변경했습니다",
        "behavior return path normalization": "normalizeReturnPaths",
        "pinned package asset parser": "packageAssets: LearningCheckPackageAsset[]",
        "same-origin package asset verifier": "verifiedLearningPackageUrls",
        "package asset integrity failure": "learning package integrity mismatch",
    }
    for label, token in strong_contract_tokens.items():
        source = learningCheckSpecText if token in learningCheckSpecText else browserCheckExecutorText
        require(source, token, label, failures)

    pathlib = yaml.safe_load(PATHLIB_LESSON.read_text(encoding="utf-8"))
    pathlibExpectations = [
        ("temp-base", "create_order_workspace", 1, 2),
        ("path-parts", "create_invoice_versions", 1, 2),
        ("relative-absolute", "resolve_report", 4, 1),
        ("identity-summary", "build_archive_identity", 1, 1),
    ]
    if len(pathlib.get("sections", [])) != len(pathlibExpectations):
        failures.append("pathlib lesson must keep four staged behavior sections")
    for index, (sectionId, entry, caseCount, pathCount) in enumerate(pathlibExpectations):
        section = pathlib["sections"][index]
        check = section.get("check", {})
        if section.get("id") != sectionId:
            failures.append(f"pathlib section {index} must remain {sectionId}")
        if (
            check.get("version") != 1
            or check.get("kind") != "behavior"
            or check.get("strength") != "strong"
            or check.get("executor") != "browser-worker"
        ):
            failures.append(f"pathlib {sectionId} must use a typed strong browser behavior CheckSpec")
        fixtureBytes = json.dumps(
            check.get("fixture"), ensure_ascii=False, sort_keys=True, separators=(",", ":")
        ).encode("utf-8")
        fixtureHash = "sha256-" + base64.b64encode(hashlib.sha256(fixtureBytes).digest()).decode("ascii")
        if check.get("fixtureHash") != fixtureHash:
            failures.append(f"pathlib {sectionId} fixture hash is stale")
        payload = check.get("payload", {})
        if payload.get("entry") != entry:
            failures.append(f"pathlib {sectionId} must call {entry}")
        if len(payload.get("cases", [])) != caseCount:
            failures.append(f"pathlib {sectionId} must cover {caseCount} behavior cases")
        if len(payload.get("expectedPaths", [])) != pathCount:
            failures.append(f"pathlib {sectionId} must inspect {pathCount} filesystem paths")

    safetyCheck = pathlib["sections"][2]["check"]
    safetyCases = safetyCheck.get("payload", {}).get("cases", [])
    if [case.get("id") for case in safetyCases] != [
        "existing-relative-file",
        "other-relative-file",
        "rejects-traversal",
        "rejects-absolute",
    ]:
        failures.append("pathlib safety check must cover positive, transfer, traversal, and absolute cases")
    identityPayload = pathlib["sections"][3]["check"].get("payload", {})
    if identityPayload.get("normalizeReturnPaths") != ["absolute"]:
        failures.append("pathlib identity check must normalize the dynamic absolute return path")

    zipLesson = yaml.safe_load(ZIP_LESSON.read_text(encoding="utf-8"))
    zipExpectations = [
        ("create-zip", "create_docs_archive", 1),
        ("compression-ratio", "compare_compression", 3),
        ("extract-roundtrip", "archive_and_restore", 2),
        ("integrity-summary", "build_integrity_report", 3),
    ]
    if len(zipLesson.get("sections", [])) != len(zipExpectations):
        failures.append("zip lesson must keep four staged behavior sections")
    for index, (sectionId, entry, pathCount) in enumerate(zipExpectations):
        section = zipLesson["sections"][index]
        check = section.get("check", {})
        if section.get("id") != sectionId:
            failures.append(f"zip section {index} must remain {sectionId}")
        if (
            check.get("version") != 1
            or check.get("kind") != "behavior"
            or check.get("strength") != "strong"
            or check.get("executor") != "browser-worker"
        ):
            failures.append(f"zip {sectionId} must use a typed strong browser behavior CheckSpec")
        fixtureBytes = json.dumps(
            check.get("fixture"), ensure_ascii=False, sort_keys=True, separators=(",", ":")
        ).encode("utf-8")
        fixtureHash = "sha256-" + base64.b64encode(hashlib.sha256(fixtureBytes).digest()).decode("ascii")
        if check.get("fixtureHash") != fixtureHash:
            failures.append(f"zip {sectionId} fixture hash is stale")
        payload = check.get("payload", {})
        if payload.get("entry") != entry:
            failures.append(f"zip {sectionId} must call {entry}")
        if len(payload.get("cases", [])) != 1:
            failures.append(f"zip {sectionId} must have one deterministic behavior case")
        if len(payload.get("expectedPaths", [])) != pathCount:
            failures.append(f"zip {sectionId} must inspect {pathCount} filesystem paths")
        if any(item.get("origin") != "created" for item in payload.get("expectedPaths", [])):
            failures.append(f"zip {sectionId} generated paths must reject module-level pre-creation")

    scheduleLesson = yaml.safe_load(SCHEDULE_LESSON.read_text(encoding="utf-8"))
    scheduleExpectations = [
        ("job-skeleton", "build_job_results", 2, False),
        ("schedule-register", "registered_intervals", 2, True),
        ("run-now", "run_registered_jobs", 2, True),
        ("tick-summary", "run_cycle", 2, True),
    ]
    wheelBytes = SCHEDULE_WHEEL.read_bytes()
    wheelIntegrity = "sha256-" + base64.b64encode(hashlib.sha256(wheelBytes).digest()).decode("ascii")
    if hashlib.sha256(wheelBytes).hexdigest() != "5bef4a2a0183abf44046ae0d164cadcac21b1db011bdd8102e4a0c1e91e06a7d":
        failures.append("schedule 1.2.2 wheel bytes differ from the pinned PyPI release")
    if len(scheduleLesson.get("sections", [])) != len(scheduleExpectations):
        failures.append("schedule lesson must keep four staged behavior sections")
    for index, (sectionId, entry, caseCount, needsPackage) in enumerate(scheduleExpectations):
        section = scheduleLesson["sections"][index]
        check = section.get("check", {})
        if section.get("id") != sectionId:
            failures.append(f"schedule section {index} must remain {sectionId}")
        if (
            check.get("version") != 1
            or check.get("kind") != "behavior"
            or check.get("strength") != "strong"
            or check.get("executor") != "browser-worker"
        ):
            failures.append(f"schedule {sectionId} must use a typed strong browser behavior CheckSpec")
        fixtureBytes = json.dumps(
            check.get("fixture"), ensure_ascii=False, sort_keys=True, separators=(",", ":")
        ).encode("utf-8")
        fixtureHash = "sha256-" + base64.b64encode(hashlib.sha256(fixtureBytes).digest()).decode("ascii")
        if check.get("fixtureHash") != fixtureHash:
            failures.append(f"schedule {sectionId} fixture hash is stale")
        payload = check.get("payload", {})
        if payload.get("entry") != entry or len(payload.get("cases", [])) != caseCount:
            failures.append(f"schedule {sectionId} must call {entry} across {caseCount} cases")
        packageAssets = check.get("packageAssets", [])
        if needsPackage:
            if len(packageAssets) != 1:
                failures.append(f"schedule {sectionId} must pin one browser wheel")
                continue
            asset = packageAssets[0]
            if (
                asset.get("name") != "schedule"
                or asset.get("version") != "1.2.2"
                or asset.get("url") != "check-packages/schedule-1.2.2-py3-none-any.whl"
                or asset.get("integrity") != wheelIntegrity
            ):
                failures.append(f"schedule {sectionId} package asset does not match the pinned wheel")
        elif packageAssets:
            failures.append("schedule job-skeleton must not load a package it does not use")

    evidence_transaction_tokens = {
        "append-only evidence transaction": "appendWebStrongCheckEvidenceTransaction",
        "IndexedDB evidence store": 'const EVENT_STORE = "events"',
        "IndexedDB conflict store": 'const CONFLICT_STORE = "conflicts"',
        "IndexedDB cutover version": "const DATABASE_VERSION = 3",
        "IndexedDB metadata store": 'const METADATA_STORE = "metadata"',
        "IndexedDB store header reader": "readWebLearningEvidenceStoreHeader",
        "IndexedDB automatic cutover": "ensureWebLearningEvidenceCutover",
        "IndexedDB reader floor": "minimumReaderVersion: DATABASE_VERSION",
        "IndexedDB cutover marker": "cutoverMarker",
        "event insert not overwrite": ".add(event)",
        "attempt fingerprint unique index": 'createIndex("attemptFingerprint", "attemptFingerprint", { unique: true })',
        "source hash not raw source": "sourceHash",
        "strong event kind": 'kind: "StrongCheckVerified"',
        "content addressed archive": "buildWebLearningEvidenceArchive",
        "archive event set hash": "eventSetHash",
        "archive integrity validation": "validateWebLearningEvidenceArchive",
        "event set union import": "mergeArchiveEvents",
        "payload conflict isolation": 'kind: "EvidencePayloadConflict"',
        "no completion credit event": 'kind: "CreditGranted"',
    }
    for label, token in evidence_transaction_tokens.items():
        if label == "no completion credit event":
            if token in webLearningEvidenceText:
                failures.append("Web staged evidence must not grant completion credit")
            continue
        require(webLearningEvidenceText, token, label, failures)

    evidence_surface_tokens = {
        "automatic evidence saved state": "data-learning-evidence-state={",
        "Local automatic evidence append": "codaroApi.appendLearningEvidence",
        "shared strong event builder": "createWebStrongCheckEvidenceEvent",
        "settings evidence summary": 'data-learning-evidence-summary="true"',
        "evidence export command": "serializeWebLearningEvidenceArchive",
        "evidence import command": "importWebLearningEvidenceArchive",
        "evidence import file input": 'data-learning-evidence-import-input="true"',
        "visible transfer mode": 'data-learning-section-mode=',
        "mastery task label": "혼자 완성하기",
        "transfer task label": "새 조건에 적용",
        "automatic assessment queue": "dueAssessmentBlocks",
        "retrieval task label": "기억에서 다시 풀기",
        "retrieval source evidence match": "contract.sourceSectionIds.includes(credit.sectionId)",
        "retrieval seven day floor": "RETRIEVAL_MINIMUM_HOURS",
        "invalid credit exclusion": "creditEventIds.filter((eventId) => !invalid.has(eventId))",
    }
    for label, token in evidence_surface_tokens.items():
        source = "\n".join((text, learningEvidenceOperationsText, curriculumAssessmentQueueText))
        require(source, token, label, failures)

    require(
        productSidebarText,
        'data-product-learning-data-settings="true"',
        "learning data settings boundary",
        failures,
    )
    require(
        productSidebarText,
        'const learningMode = surface === "curriculum"',
        "curriculum focus mode",
        failures,
    )
    require(
        productSidebarText,
        'data-product-brand="escape"',
        "curriculum escape action",
        failures,
    )
    if "LearningArchiveMenu" in SURFACE.read_text(encoding="utf-8") or "LearningArchiveMenu" in curriculumHomeText:
        failures.append("learning archive management must stay outside curriculum surfaces")
    if "CellAiActions" in SECTION_RENDERER.read_text(encoding="utf-8") or "CellAiActions" in CURRICULUM_LEARNING_CELL.read_text(encoding="utf-8"):
        failures.append("curriculum cells must not expose manual AI controls")
    if "TeacherPanel" in currentLearningSurfaceText:
        failures.append("curriculum must not render a duplicate teacher panel")
    if "PendingNotebookBar" in CURRICULUM_OVERVIEW.read_text(encoding="utf-8"):
        failures.append("curriculum must not render pending AI authoring controls")
    for token, label in (
        ('maxHeight: "22rem"', "bounded content-fit editor"),
        ("revision === saveRevisionRef.current", "autosave request revision guard"),
        ("activeLessonRef.current === pending.lessonRef", "autosave lesson identity guard"),
        ('if (lessonChanged) {\n      setStorageError("");\n      flushPendingWorkspace();', "autosave lesson error reset"),
        ('if (surface === "curriculum") setTerminalOpen(false);', "curriculum terminal close"),
        ("!event.currentTarget.contains(document.activeElement)", "TOC focus-preserving pointer exit"),
        ('import { Dialog } from "radix-ui"', "accessible delete dialog primitive"),
        ("learningMode ? null : (", "curriculum management dialog suppression"),
    ):
        source = (
            notebookPanelText if label == "bounded content-fit editor"
            else currentLearningSurfaceText if label.startswith("autosave")
            else appText if "terminal" in label
            else CURRICULUM_TOC.read_text(encoding="utf-8") if label.startswith("TOC")
            else productSidebarText
        )
        require(source, token, label, failures)
    require(
        topBarText,
        'const showAssistantToggle = surface === "editor"',
        "editor-only assistant toggle",
        failures,
    )
    require(
        topBarText,
        'surface !== "curriculum" && showStatusNotice',
        "curriculum diagnostic export suppression",
        failures,
    )

    package_panel_tokens = {
        "package panel marker": 'data-learning-package-panel="true"',
        "package panel explicit package source": "declaredDocumentPackages(document)",
        "package status marker": "data-learning-package-status={packageStatus}",
        "package install action marker": 'data-learning-package-install="true"',
        "package item marker": "data-learning-package-item={packageName}",
        "package installed marker": 'data-learning-package-installed={installed ? "true" : "false"}',
        "package progress marker": 'data-learning-package-progress="true"',
        "package progress state import": "type PackageInstallProgress",
        "package installed names model": "installedCurriculumPackageNameSet(installedPackages)",
        "package missing model": "missingCurriculumPackages(requiredPackages, installedNames)",
        "package active message model": "curriculumPackageActiveMessage({ checking, installProgress })",
        "package status model": "curriculumPackageStatus({ checking, error, installProgress, missingPackages })",
        "package install button progress": "${installProgress.index}/${installProgress.total} 준비 중",
        "package prepare action": "라이브러리 준비",
        "package retry action": "다시 시도",
        "package success copy": "`${packageName} 준비 완료`",
        "package failure copy": "`${packageName}을 준비하지 못했습니다. 다시 시도하세요.`",
        "package install result copy": "packageInstallStatusText",
    }
    for label, token in package_panel_tokens.items():
        require(dependencyPanelText, token, label, failures)
    require(
        dependencyPanelText,
        "if (!apiOnline || !requiredPackages.length) return null;",
        "inactive Web package panel suppression",
        failures,
    )
    require(
        dependencyPanelText,
        "if (!missingPackages.length && !installProgress && !error) return null;",
        "ready package panel suppression",
        failures,
    )
    package_panel_forbidden_tokens = (
        "curriculumPackageInstallCommand",
        "curriculumPackageTerminalCommandReady",
        "packageInstallCommand",
        "installCommand",
        "installEnvironment",
        "commandError",
        "navigator.clipboard",
        "TerminalSquare",
        "data-learning-package-command",
        "data-learning-package-terminal-open",
        "터미널에서 실행",
        "result.environment",
        "result.installer",
        "result.message",
        "durationMs",
    )
    for token in package_panel_forbidden_tokens:
        if token in dependencyPanelText:
            failures.append(f"learning package panel leaks management or implementation detail: {token}")
    for forbiddenCopy in ('"서버 필요"', '"설치 필요 없음"', ': "준비됨"'):
        if forbiddenCopy in dependencyPanelText:
            failures.append(f"inactive package copy must not remain visible: {forbiddenCopy}")

    cell_action_tokens = {
        "cell help popover marker": 'data-cell-ai-popover="true"',
        "cell help question input": 'data-cell-ai-question="true"',
        "cell help answer marker": 'data-cell-ai-answer="true"',
        "cell help always visible marker": 'data-cell-ai-help-trigger="always-visible"',
        "cell-local question title": "이 셀에서 바로 질문",
        "cell-local answer label": "이 셀 답변",
        "visible help request label": "도움 요청",
        "custom cell question forwarding": "onAsk(action, question)",
    }
    for label, token in cell_action_tokens.items():
        require(cellActionsText, token, label, failures)

    ai_panel_tokens = {
        "Codaro AI label": "Codaro AI",
        "Codaro avatar": "/brand/avatar-small.png",
    }
    for label, token in ai_panel_tokens.items():
        require(aiPanelText, token, label, failures)

    learning_command_sources = "\n".join((
        dependencyPanelText,
        CURRICULUM_OVERVIEW.read_text(encoding="utf-8"),
        SURFACE.read_text(encoding="utf-8"),
        currentLearningSurfaceText,
    ))
    for token in (
        "onOpenTerminalCommand",
        "data-learning-package-command",
        "data-learning-package-terminal-open",
        "curriculumPackageInstallCommand",
    ):
        if token in learning_command_sources:
            failures.append(f"learning surface must not expose terminal command flow: {token}")

    markdown_body_tokens = {
        "reading column width": "max-w-3xl",
        "reading body token": "text-md text-foreground",
        "bare list renderer": "function BareList",
        "top rule grid renderer": "function TopRuleGrid",
        "callout signal rail": "border-l-2 py-0.5 pl-4",
        "misconception myth label": "text-destructive\">오해",
        "misconception truth label": "text-success\">사실",
        "center text ignores legacy emoji": 'const centerContent = payloadText(payload, "content") || block.content;',
        "semantic inline code": 'key={`code-${key++}`}',
        "inline boundary whitespace preservation": "function cleanInlineSegment",
    }
    for label, token in markdown_body_tokens.items():
        require(markdownBodyText, token, label, failures)

    curricula_registry_tokens = {
        "plain YAML display title": "const displayTitle = title;",
        "legacy visual fields filtered from unknown fallback": '"emoji", "titleEmoji", "endEmoji", "icon"',
        "web mastery assessment materializer": "assessment.masteryVariants",
        "web mastery section mode": 'assessmentMode: "mastery"',
        "deferred web transfer materializer": "assessment.transferVariants",
        "web transfer section mode": 'assessmentMode: "transfer"',
        "deferred web assessment materializer": "registryAssessmentBlocks",
        "web retrieval section mode": 'assessmentMode: "retrieval"',
        "web assessment payload": "learningContract, assessment",
    }
    for label, token in curricula_registry_tokens.items():
        require(curriculaRegistryText, token, label, failures)

    code_payload_tokens = {
        "snippet code box marker": 'data-code-payload="snippet"',
        "snippet copy marker": 'data-code-payload-copy="true"',
        "copy action label key": "system.copySnippet",
        "copy button text key": "common.copy",
        "snippet box label": "예제 스니펫",
    }
    for label, token in code_payload_tokens.items():
        require(appPrimitivesText, token, label, failures)

    learner_output_forbidden_tokens = {
        "learner output hides runtime artifact paths": "data-runtime-artifacts",
        "learner output hides runtime artifact kinds": "data-runtime-artifact-kind",
        "learner output hides execution counters": "#{result.executionCount}",
        "learner output hides internal artifact label": "system.runtimeArtifacts",
    }
    for label, token in learner_output_forbidden_tokens.items():
        if token in appPrimitivesText:
            failures.append(f"{label}: found {token}")

    learner_feedback_tokens = {
        "plain completed feedback": "연습 완료",
        "plain retry feedback": "다시 확인해 보세요",
        "silent successful evidence persistence": 'evidenceSaveState === "error"',
        "short evidence recovery": "학습 기록을 저장하지 못했습니다. 셀을 다시 실행해 주세요.",
    }
    for label, token in learner_feedback_tokens.items():
        require(text, token, label, failures)

    learner_feedback_forbidden_tokens = {
        "strong-check jargon": "격리 검증 통과",
        "practice-check jargon": "연습 검증 통과",
        "visible evidence implementation detail": "검증 증거가 이 브라우저에 저장되었습니다.",
        "duplicate exercise success badge": "statusLabel(exerciseRunning",
    }
    for label, token in learner_feedback_forbidden_tokens.items():
        if token in text:
            failures.append(f"{label}: found {token}")

    locale_copy_tokens = {
        "copy action label": "스니펫 복사",
        "copy button text": "복사",
        "irreversible-only browser approval": "되돌리기 어려운 단계만 승인받습니다",
        "irreversible-only computer approval": "되돌리기 어려운 동작만 승인받습니다",
    }
    for label, token in locale_copy_tokens.items():
        require(localeCopyText, token, label, failures)

    package_inference_tokens = {
        "stdlib helper import": "isPythonStdlibModule",
        "stdlib runtime package filter": "installablePackageName",
        "stdlib package name helper": "isPythonStdlibPackageName",
    }
    for label, token in package_inference_tokens.items():
        require(packageInferenceText, token, label, failures)

    package_preparation_tokens = {
        "package progress state": "export type PackageInstallProgress",
        "package status union": 'export type CurriculumPackageStatus = "installing" | "checking" | "error" | "missing" | "ready"',
        "installed package names projection": "function installedCurriculumPackageNameSet",
        "missing package projection": "function missingCurriculumPackages",
        "active package message": "function curriculumPackageActiveMessage",
        "package panel status": "function curriculumPackageStatus",
        "package progress text": "${installProgress.index}/${installProgress.total}",
        "package install API boundary kept": "codaroApi.packageInstall(packageName)",
    }
    for label, token in package_preparation_tokens.items():
        require(packagePreparationText, token, label, failures)
    for token in ("packageInstallCommand", "curriculumPackageTerminalCommandReady", "uv", "wheel"):
        if token in packagePreparationText:
            failures.append(f"learning package preparation exposes implementation detail: {token}")

    editor_accessibility_tokens = {
        "learning editor defaults to no autofocus": "autoFocus = false",
        "CodeMirror textbox receives accessible name": "EditorView.contentAttributes.of({",
        "CodeMirror textbox aria label": '"aria-label": ariaLabel',
        "CodeMirror textbox multiline semantics": '"aria-multiline": "true"',
        "standalone learning editor name": "ariaLabel: `${blockLabel(block)} 코드 편집기`",
        "learning title wraps": "whitespace-normal break-words",
        "section heading wraps": "max-w-3xl break-words",
    }
    editor_accessibility_sources = {
        "learning editor defaults to no autofocus": currentLearningSurfaceText,
        "CodeMirror textbox receives accessible name": notebookPanelText,
        "CodeMirror textbox aria label": notebookPanelText,
        "CodeMirror textbox multiline semantics": notebookPanelText,
        "standalone learning editor name": CURRICULUM_LEARNING_CELL.read_text(encoding="utf-8"),
        "learning title wraps": CURRICULUM_LEARNING_CELL.read_text(encoding="utf-8"),
        "section heading wraps": SECTION_RENDERER.read_text(encoding="utf-8"),
    }
    for label, token in editor_accessibility_tokens.items():
        require(editor_accessibility_sources[label], token, label, failures)
    for token in ("autoFocus: exerciseSelected", "autoFocus: isSelected", "block truncate text-[15px]"):
        if token in text:
            failures.append(f"learning editor focus or title clipping regression: {token}")

    stdlib_tokens = {
        "io is stdlib": '"io"',
        "zipfile is stdlib": '"zipfile"',
        "stdlib module helper": "function isPythonStdlibModule",
        "stdlib package helper": "function isPythonStdlibPackageName",
    }
    for label, token in stdlib_tokens.items():
        require(pythonStdlibText, token, label, failures)

    markdown_cleanup_tokens = {
        "preserve literal hash while removing heading prefix": '.replace(/^\\s{0,3}#{1,6}\\s+/, "")',
        "preserve literal parentheses while removing links": '.replace(/\\[([^\\]]+)\\]\\([^)]+\\)/g, "$1")',
        "preserve inline code content": '.replace(/`([^`]+)`/g, "$1")',
    }
    for label, token in markdown_cleanup_tokens.items():
        require(cellModelText, token, label, failures)

    require_order(
        text,
        "<SectionNarrative contract={section.contract} />",
        "<StructuredSectionLearningBody",
        "section card narrative-to-practice flow",
        failures,
    )
    require_order(
        text,
        'data-learning-section-part="snippet"',
        'data-learning-section-part="exercise"',
        "snippet before exercise",
        failures,
    )
    require_order(
        text,
        'data-learning-section-part="exercise"',
        'data-learning-section-part="result"',
        "exercise before result",
        failures,
    )
    marker_count = text.count("data-learning-section-part")
    if marker_count < 4:
        failures.append(f"expected at least 4 section part marker sites, found {marker_count}")

    forbidden_tokens = {
        SURFACE: (
            'data-learning-overview-start="true"',
            "학습 시작 버튼",
            "LightweightCodePreview",
            "클릭해서 직접 입력하세요.",
            "클릭해서 코드를 편집하세요.",
            "예제를 실행한 뒤 값 하나를 바꿔 결과를 비교하세요.",
            "기준 실행 후 값 하나를 바꿔 결과를 비교하세요.",
            "위 예제 스니펫을 참고해 아래 편집기에 직접 입력하고, 값 하나를 바꾼 뒤 실행하세요.",
            "아래 코드 영역을 클릭해 직접 입력하세요.",
            "학습 아키텍처",
            "AssignmentRoomPanel",
            'data-learning-assignment-tools="after-lesson"',
            "absolute right-full",
            "allInstalledVerified",
            "YAML 계약 보강 필요",
            "data-learning-section-contract-gaps",
            "sectionContractGapLabels",
            "AlertTriangle",
            "curriculumPackagePreparation",
            "installCurriculumPackage",
            "listCurriculumPackages",
            # 재설계에서 폐지된 구 크롬 — 회귀 차단(스펙 §9).
            "직접 입력 실습",
            "SectionContractOverview",
            "WorkflowArchitectureDiagram",
            "data-learning-workflow-step",
            "data-learning-overview-blueprint",
            "data-learning-overview-rail",
            "hideRepeatedTitle",
            "curriculumCellTone",
            "bg-gradient-to-br",
            "bg-gradient-to-r",
            'className="overflow-hidden rounded-lg border bg-card text-card-foreground"',
            "min-h-11 w-11",
            "bg-zinc-950",
            "border-zinc-200",
            "🎉",
            # 별도 검증 버튼은 폐지하고 실행 결과를 자동 평가한다.
            "data-learning-exercise-check",
            "CheckResultPanel",
            "runExerciseCheck",
            "recordLessonMissionComplete",
            'data-lesson-completed="true"',
            "strong check가 통과한 경우에만",
            '<button className="flex w-full min-w-0 items-baseline',
        ),
        AI_PANEL: (
            "Codaro 어시스턴트",
            "Bot,",
            "Robot",
            "robot",
        ),
        CELL_ACTIONS: (
            "group-hover:opacity-100",
            "lg:opacity-0",
            "tabIndex={selected ? 0 : -1}",
        ),
        TERMINAL_PANEL: (
            "export type TerminalLaunchIntent",
            "export function terminalLaunchInput",
        ),
        MARKDOWN_BODY: (
            "panelTone",
            "CONCEPT_ACCENTS",
            'payloadText(item, "emoji")',
            'payloadText(row, "emoji")',
            'payloadText(item, "icon")',
            'payloadText(row, "icon")',
            'payloadText(payload, "endEmoji")',
            "text-cyan-300",
            "text-emerald-300",
            "text-amber-300",
            "text-violet-300",
            "bg-cyan-400",
            "bg-emerald-400",
            "bg-amber-400",
            "bg-violet-400",
            "○",
            "✕",
            # 3계층 모델에서 폐지 — 회색 박스 + 아이콘칩 패턴과 제목 dedupe 기계의 회귀 차단.
            "hideRepeatedTitle",
            "dedupeRepeatedItems",
            "dedupeRepeatedLines",
            "shouldHideRepeatedTitle",
            "curriculumCellTone",
            "rounded-md border bg-background",
            "items-center justify-center rounded-md bg-muted",
            "line-through",
        ),
        CELL_MODEL: (
            'replace(/[#>*_`[\\]()]',
        ),
        LOCALE_COPY: (
            "모든 클릭은 먼저 확인받습니다",
            "Every click is confirmed first",
            "매 단계 먼저 보여드린 뒤 확인받아 실행합니다",
        ),
        LEARNING_ATTEMPT: (
            'strength: "strong"',
            "isStrongLearningCheckConfig",
            "강한 검증 기준과 정확히 일치",
        ),
        CURRICULUM_HOME: (
            'data-curriculum-home-review-pass="true"',
            'data-curriculum-home-review-lapse="true"',
            'data-curriculum-home-weak-areas="true"',
            "recordReviewResult",
            "기억남",
            "가물",
            "집중하면 좋은 영역",
            "bg-gradient-to-br",
        ),
        CURRICULA_REGISTRY: (
            "decoratedTitle",
            "card.emoji ?? card.icon",
            "row.emoji ?? row.icon",
            "point.emoji",
            "footer.icon",
        ),
    }
    sourceByPath = {
        SURFACE: text,
        AI_PANEL: aiPanelText,
        CELL_ACTIONS: cellActionsText,
        TERMINAL_PANEL: terminalPanelText,
        MARKDOWN_BODY: markdownBodyText,
        CURRICULA_REGISTRY: curriculaRegistryText,
        CELL_MODEL: cellModelText,
        LOCALE_COPY: localeCopyText,
        LEARNING_ATTEMPT: learningAttemptText,
        CURRICULUM_HOME: curriculumHomeText,
    }
    for path, tokens in forbidden_tokens.items():
        source = sourceByPath[path]
        for token in tokens:
            if token in source:
                failures.append(f"forbidden token remains in {path.relative_to(ROOT)}: {token}")

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1

    print("ok: structured learning section card contract is wired in the editor surface")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
