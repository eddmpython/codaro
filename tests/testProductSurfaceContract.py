from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
EDITOR_SRC = ROOT / "editor" / "src"


def _read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def _editorFiles(*roots: str) -> list[Path]:
    files: list[Path] = []
    for root in roots:
        files.extend(
            path for path in (EDITOR_SRC / root).rglob("*")
            if path.suffix in {".ts", ".tsx"}
        )
    return sorted(files)


def _rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def testProductSurfaceNavKeepsConversationFirstFlow() -> None:
    source = _read("editor/src/lib/surfaceModel.ts")
    items = re.findall(
        r'\{ value: "([^"]+)", labelKey: "([^"]+)", flowRole: "([^"]+)", beta: (true|false), visibleInSidebar: (true|false) \}',
        source,
    )
    values = [item[0] for item in items]
    flowRoles = [item[2] for item in items]
    visibility = [item[4] for item in items]

    assert values[:5] == ["chat", "curriculum", "editor", "automation", "share"]
    assert flowRoles[:5] == ["entry", "learning", "notebook", "secondLoop", "support"]
    assert visibility[:5] == ["true", "true", "true", "true", "false"]
    assert 'value: "automation", labelKey: "nav.automation", flowRole: "secondLoop", beta: true, visibleInSidebar: true' in source
    assert 'value: "share", labelKey: "nav.share", flowRole: "support", beta: true, visibleInSidebar: false' in source
    assert 'DEFAULT_SURFACE: SurfaceMode = "chat"' in source
    assert "SURFACE_MODES: readonly SurfaceMode[] = PRODUCT_SURFACE_NAV.map" in source
    assert "PRODUCT_SIDEBAR_NAV: readonly ProductSurfaceNavItem[] = PRODUCT_SURFACE_NAV" in source
    assert "ProductSidebarFlowItem = ProductSurfaceNavItem &" in source
    assert "PRODUCT_SIDEBAR_FLOW_ITEMS: readonly ProductSidebarFlowItem[] = PRODUCT_SIDEBAR_NAV.map" in source
    assert "flowStep: index + 1" in source
    assert "SIDEBAR_SURFACES: readonly SurfaceMode[] = PRODUCT_SIDEBAR_NAV.map" in source
    assert "isSurfaceMode(value: string)" in source
    assert "surfaceNavItem(surface: SurfaceMode)" in source
    assert "surfaceFlowRole(surface: SurfaceMode)" in source
    assert "PRODUCT_SURFACE_NAV" in source
    assert "HIDDEN_SURFACES: readonly SurfaceMode[] = PRODUCT_SURFACE_NAV" in source


def testSurfaceRouteUsesSurfaceModelContract() -> None:
    source = _read("editor/src/hooks/useSurfaceRoute.ts")

    assert "DEFAULT_SURFACE" in source
    assert "isSurfaceMode" in source
    assert 'return "chat"' not in source
    assert 'value === "editor"' not in source


def testProductSidebarRendersCentralSurfaceNavOnly() -> None:
    source = _read("editor/src/components/app/productSidebar.tsx")
    flowNav = _read("editor/src/components/app/productFlowNav.tsx")

    assert "ProductFlowNav" in source
    assert "CurriculumSidebarTree" in source
    assert "AutomationSidebarTree" in source
    assert "PRODUCT_SIDEBAR_NAV" not in source
    assert "PRODUCT_SURFACE_NAV" not in source
    assert "allNavItems" not in source
    assert "HIDDEN_SURFACES" not in source
    assert ".filter((item) => item.visibleInSidebar)" not in source
    assert "buildSidebarCurriculumTree" not in source
    assert "CustomCurriculumDeleteDialog" not in source
    assert "surfaceIcons" not in source
    assert "categoryTitle" not in source
    assert "PRODUCT_SIDEBAR_FLOW_ITEMS" in flowNav
    assert "sidebarSurfaceIcons" in flowNav
    assert "sidebarIconForSurface" in flowNav
    assert "Unsupported sidebar surface" in flowNav
    assert "PackageOpen" not in flowNav
    assert "share:" not in flowNav
    assert "PRODUCT_SIDEBAR_NAV" not in flowNav
    assert "PRODUCT_SURFACE_NAV" not in flowNav
    assert "flowStep: index + 1" not in flowNav
    assert 'data-product-nav="flow"' in flowNav
    assert 'data-product-flow-hierarchy="chat-first"' in flowNav
    assert 'data-product-nav="utility"' in source
    assert 'data-product-flow-marker="true"' in flowNav
    assert "data-product-flow-role={flowRole}" in flowNav
    assert 'data-product-flow-second-loop={flowRole === "secondLoop" ? "true" : undefined}' in flowNav
    assert "data-product-flow-step={flowStep}" in flowNav
    assert 'flowRole === "entry" && "font-medium"' in flowNav
    assert 'flowRole === "secondLoop" && "border-t border-sidebar-border/60 bg-sidebar-accent/20"' in flowNav
    assert source.index("<ProductFlowNav") < source.index('data-product-nav="utility"')
    assert source.index('data-product-nav="utility"') < source.index('tooltip={t("terminal.title")}')


def testProductSidebarKeepsSurfaceTreesInFocusedFiles() -> None:
    productSidebar = _read("editor/src/components/app/productSidebar.tsx")
    curriculumTree = _read("editor/src/components/app/curriculumSidebarTree.tsx")
    automationTree = _read("editor/src/components/app/automationSidebarTree.tsx")
    navigationHook = _read("editor/src/hooks/useCurriculumNavigationState.ts")

    assert "buildSidebarCurriculumTree" in curriculumTree
    assert "CustomCurriculumDeleteDialog" in curriculumTree
    assert "useSidebarExpansionState" in curriculumTree
    assert "AutomationSidebarTree" in automationTree
    assert "selectedSection: AutomationSection" in automationTree
    assert "PRODUCT_SIDEBAR_NAV" not in curriculumTree
    assert "PRODUCT_SIDEBAR_NAV" not in automationTree
    assert "buildSidebarCurriculumTree" not in productSidebar
    assert 'from "@/lib/customCurricula"' in navigationHook
    assert 'from "@/components/app/curriculumSidebarTree"' not in navigationHook
    assert 'from "@/components/app/productSidebar"' not in navigationHook


def testProductSurfaceCopyMatchesFocusedFlow() -> None:
    locale = _read("editor/src/lib/localeCopy.ts")
    chat = _read("editor/src/components/chat/chatSurface.tsx")
    startExamples = _read("editor/src/lib/chatStartExamples.ts")

    for expected in (
        '"nav.chat": "대화"',
        '"nav.curriculum": "현재 학습"',
        '"nav.editor": "노트북"',
        '"nav.automation": "자동화"',
    ):
        assert expected in locale

    for expected in (
        "검증된 셀과 recipe를 태스크로 키울 때",
        "대화, 현재 학습, 노트북에서 검증한 자동화 셀과 스크립트",
        "채팅에서 반복 작업을 말하고 셀 또는 recipe를 검증하면",
        "기존 레슨을 먼저 찾아 학습 경로를 짜줘",
        "검증된 노트북 셀을 dry-run 자동화 recipe로 정리",
        "Automation stores cells and recipes validated from chat, current learning, or notebooks.",
        "First find existing lessons and compose a learning path",
        "Turn validated notebook cells into a dry-run automation recipe",
    ):
        assert expected in locale
    assert "바로 시작할 수 있는 자동화 출발점" not in locale
    assert "Ready-to-use starting points" not in locale
    assert "공유 가능한 자동화 노트북" not in locale
    assert "Turn repeated work into a shareable automation notebook" not in locale
    assert "defaultChatStartExamples(t)" in chat
    assert "chat.example.pandas" not in chat
    assert "chat.example.pandas" in startExamples


def testChatStartExamplesCarryDogfoodFlowMetadata() -> None:
    chat = _read("editor/src/components/chat/chatSurface.tsx")
    mainSurface = _read("editor/src/components/app/mainSurface.tsx")
    currentLearningSurface = _read("editor/src/components/app/currentLearningSurface.tsx")
    startExamples = _read("editor/src/lib/chatStartExamples.ts")

    assert 'surfaceFlowRole, type ProductSurfaceFlowRole, type SurfaceMode' in startExamples
    assert "CHAT_START_EXAMPLE_DEFINITIONS" in startExamples
    assert "CURRICULUM_GOAL_EXAMPLE_DEFINITIONS" in startExamples
    assert "translateExampleDefinitions(CHAT_START_EXAMPLE_DEFINITIONS, t)" in startExamples
    assert "translateExampleDefinitions(CURRICULUM_GOAL_EXAMPLE_DEFINITIONS, t)" in startExamples
    assert 'labelKey: "chat.example.pandas", promptKey: "chat.example.pandas.prompt", surface: "curriculum"' in startExamples
    assert 'labelKey: "chat.example.browser", promptKey: "chat.example.browser.prompt", surface: "curriculum"' in startExamples
    assert 'labelKey: "chat.example.automation", promptKey: "chat.example.automation.prompt", surface: "automation"' in startExamples
    assert 'labelKey: "curriculum.goal.example.report", promptKey: "curriculum.goal.example.report.prompt", surface: "curriculum"' in startExamples
    assert startExamples.index('"chat.example.pandas"') < startExamples.index('"chat.example.automation"')
    assert "flowRole: surfaceFlowRole(example.surface)" in startExamples
    assert 'flowRole: "secondLoop"' not in startExamples
    assert "CurrentLearningSurface" in mainSurface
    assert "curriculumGoalExamples(t)" in currentLearningSurface
    assert "curriculum.goal.example.report" not in mainSurface
    assert 'data-chat-start-example="true"' in chat
    assert "data-chat-start-flow-role={example.flowRole}" in chat
    assert 'data-chat-start-second-loop={example.flowRole === "secondLoop" ? "true" : undefined}' in chat
    assert "data-chat-start-surface={example.surface}" in chat


def testAutomationSurfaceFramesAutomationAsSecondLoop() -> None:
    source = _read("editor/src/components/automation/automationSurface.tsx")

    assert 'data-automation-loop="second-loop"' in source
    assert 'data-automation-source="validated-cell-recipe"' in source
    assert 'data-automation-artifact="validated-cell-recipe"' in source
    assert "automation.codaro.description" in source
    assert "automation.custom.description" in source
    assert "automation.empty.detail" in source


def testProductSurfaceDocsNameTheSameFlow() -> None:
    skillsReadme = _read("docs/skills/README.md")
    frontendDoc = _read("docs/skills/architecture/frontend-product-surface.md")
    dogfoodDoc = _read("docs/skills/ops/product/dogfood-alpha.md")
    identityDoc = _read("docs/skills/identity/multi-editor-modes.md")
    ssotMap = _read("docs/skills/architecture/ssot-map.md")

    assert "대화, 현재 학습, 노트북, 자동화" in skillsReadme
    assert "기존 커리큘럼 추천·조합" in skillsReadme
    assert "자동화는 검증된 스크립트를 태스크로 예약 실행" in skillsReadme
    assert "`대화 → 현재 학습 → 노트북 → 자동화`" in frontendDoc
    assert "`PRODUCT_SURFACE_NAV`" in frontendDoc
    assert "`entry`/`learning`/`notebook`/`secondLoop`/`support`" in frontendDoc
    assert "`editor/src/lib/teacherScope.ts`" in frontendDoc
    assert "`editor/src/lib/chatStartExamples.ts`" in ssotMap
    assert "`대화 → 현재 학습 → 노트북 → 자동화`" in dogfoodDoc
    assert "`대화 → 현재 학습 → 노트북 → 자동화`" in identityDoc
    assert "`대화 → 현재 학습 → 노트북 → 자동화` 사이드바 순서" in ssotMap
    assert "`editor/src/lib/teacherScope.ts`" in ssotMap


def testProductSurfaceDocsCarryConvergenceAssessmentAndRiskControls() -> None:
    frontendDoc = _read("docs/skills/architecture/frontend-product-surface.md")

    for heading in (
        "## 현재 구조 평가",
        "## 목표 구조와 영향 파일",
        "## 덕지덕지 위험과 제거 기준",
    ):
        assert heading in frontendDoc

    for expected in (
        "`editor/src/components/app/mainSurface.tsx`",
        "표면 선택과 큰 레이아웃 조립",
        "`editor/src/components/app/notebookSurface.tsx`",
        "노트북 표면 조립",
        "`editor/src/components/app/currentLearningSurface.tsx`",
        "현재 학습 표면 조립",
        "`editor/src/components/chat/chatSurface.tsx`",
        "`editor/src/lib/assistantArtifactRouting.ts`",
        "`editor/src/lib/assistantResponsePlan.ts`",
        "`editor/src/lib/pendingChanges.ts`",
        "`editor/src/lib/chatStartExamples.ts`",
        "target surface/flow role",
        "application payload",
        "`editor/src/lib/customCurricula.ts`",
        "`saveAndOpenCustomCurriculum`",
        "`editor/src/components/app/curriculumSidebarTree.tsx`",
        "`editor/src/components/app/automationSidebarTree.tsx`",
        "`tests/testProductSurfaceContract.py`",
        "`tests/verifyDogfoodAlphaAudit.py`",
        "`PRODUCT_SURFACE_NAV`",
        "`PRODUCT_SIDEBAR_NAV`",
        "`PRODUCT_SIDEBAR_FLOW_ITEMS`",
        "primary route",
        "second loop",
        "호환 레이어",
    ):
        assert expected in frontendDoc


def testMainAndChatSurfacesDoNotAbsorbRoutingOrTreeInternals() -> None:
    mainSurface = _read("editor/src/components/app/mainSurface.tsx")
    chatSurface = _read("editor/src/components/chat/chatSurface.tsx")
    currentLearningSurface = _read("editor/src/components/app/currentLearningSurface.tsx")
    notebookSurface = _read("editor/src/components/app/notebookSurface.tsx")

    for forbidden in (
        "CUSTOM_CURRICULUM_CATEGORY",
        "CurriculumCellToc",
        "CurriculumView",
        "CodeCellEditor",
        "NotebookPanel",
        "TeacherPanel",
        "curriculumGoalExamples",
        "selectedCategoryLabel",
        "selectedContentLabel",
        "routeAssistantArtifacts",
        "buildAssistantResponseApplication",
        "buildAssistantResponsePlan",
        "buildAcceptPendingChangesApplication",
        "buildRejectPendingChangesApplication",
        "pendingTargetForAssistantArtifacts",
        "surfaceForAssistantArtifacts",
    ):
        assert forbidden not in mainSurface

    for expected in (
        "CUSTOM_CURRICULUM_CATEGORY",
        "CurriculumCellToc",
        "CurriculumView",
        "CodeCellEditor",
        "curriculumGoalExamples",
        "selectedCategoryLabel",
        "selectedContentLabel",
    ):
        assert expected in currentLearningSurface

    for expected in (
        "NotebookPanel",
        "TeacherPanel",
        "xl:grid-cols-[minmax(0,1fr)_380px]",
        "onRunNotebook",
        "onAddCell",
    ):
        assert expected in notebookSurface

    for forbidden in (
        "curriculumSidebarTree",
        "automationSidebarTree",
        "CurriculumSidebarTree",
        "AutomationSidebarTree",
        "CurriculumDependencyPanel",
        "curriculumPackagePreparation",
        "learningContract",
        "sectionContract",
        "Yaml",
        "YAML",
    ):
        assert forbidden not in chatSurface


def testFrontendStateAndComponentBoundariesStayLayered() -> None:
    directApiFailures: list[str] = []
    directApiTokens = (
        'from "@/lib/api"',
        "from '@/lib/api'",
        "codaroApi",
        "requestJson",
        "postJson",
        "fetch(",
    )
    for path in _editorFiles("components", "hooks"):
        source = path.read_text(encoding="utf-8")
        for token in directApiTokens:
            if token in source:
                directApiFailures.append(f"{_rel(path)} imports or calls API boundary token {token!r}")

    componentImportFailures: list[str] = []
    componentImportPattern = re.compile(r'from\s+["\']@/components/')
    for path in _editorFiles("lib", "hooks"):
        source = path.read_text(encoding="utf-8")
        if componentImportPattern.search(source):
            componentImportFailures.append(f"{_rel(path)} imports component implementation")

    assert not directApiFailures
    assert not componentImportFailures


def testAssistantArtifactsRouteToLearningOrNotebookBeforeAutomation() -> None:
    routing = _read("editor/src/lib/assistantArtifactRouting.ts")
    responsePlan = _read("editor/src/lib/assistantResponsePlan.ts")
    pendingChanges = _read("editor/src/lib/pendingChanges.ts")

    assert 'activeScope === "automation"' in responsePlan
    assert "plan.pendingBlocks = buildLocalBlocksFromPrompt(message, activeScope)" in responsePlan
    assert "buildAssistantArtifactApplication(plan)" in responsePlan
    assert "export type AssistantResponseApplication = AssistantArtifactApplication" in responsePlan
    assert "export type AssistantArtifactApplication" in routing
    assert "export function buildAssistantArtifactApplication" in routing
    assert "pendingTargetForAssistantArtifacts(input)" in routing
    assert "surfaceForAssistantArtifacts(input)" in routing
    assert 'return input.pendingBlocks.length > 0 ? "notebook" : null' in routing
    assert 'if (input.curriculumToSave) return "curriculum"' in routing
    assert 'if (input.documentToApply || input.pendingBlocks.length > 0) return "editor"' in routing
    assert "surfaceForAcceptedPendingTarget(pendingTarget)" in pendingChanges
    assert 'return target === "curriculum" ? "curriculum" : "editor"' in routing
    assert "clearPendingBlocks ? \"notebook\"" not in routing
    assert 'surfaceToOpen: "automation"' not in responsePlan
    assert 'surfaceToOpen: "automation"' not in routing
    assert '"automation"' not in pendingChanges
