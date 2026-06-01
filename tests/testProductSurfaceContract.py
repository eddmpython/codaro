from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]


def _read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


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
    assert "SIDEBAR_SURFACES: readonly SurfaceMode[] = PRODUCT_SIDEBAR_NAV.map" in source
    assert "isSurfaceMode(value: string)" in source
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
    assert "PRODUCT_SIDEBAR_NAV" in flowNav
    assert "PRODUCT_SURFACE_NAV" not in flowNav
    assert 'data-product-nav="flow"' in flowNav
    assert 'data-product-nav="utility"' in source
    assert "data-product-flow-role={flowRole}" in flowNav
    assert "data-product-flow-step={flowStep}" in flowNav
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
    assert 'from "@/components/app/curriculumSidebarTree"' in navigationHook
    assert 'from "@/components/app/productSidebar"' not in navigationHook


def testProductSurfaceCopyMatchesFocusedFlow() -> None:
    locale = _read("editor/src/lib/localeCopy.ts")

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
        "Automation stores cells and recipes validated from chat, current learning, or notebooks.",
    ):
        assert expected in locale
    assert "바로 시작할 수 있는 자동화 출발점" not in locale
    assert "Ready-to-use starting points" not in locale


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
    assert "`대화 → 현재 학습 → 노트북 → 자동화`" in dogfoodDoc
    assert "`대화 → 현재 학습 → 노트북 → 자동화`" in identityDoc
    assert "`대화 → 현재 학습 → 노트북 → 자동화` 사이드바 순서" in ssotMap
    assert "`editor/src/lib/teacherScope.ts`" in ssotMap


def testAssistantArtifactsRouteToLearningOrNotebookBeforeAutomation() -> None:
    routing = _read("editor/src/lib/assistantArtifactRouting.ts")
    responsePlan = _read("editor/src/lib/assistantResponsePlan.ts")
    pendingChanges = _read("editor/src/lib/pendingChanges.ts")

    assert 'activeScope === "automation"' in responsePlan
    assert "plan.pendingBlocks = buildLocalBlocksFromPrompt(message, activeScope)" in responsePlan
    assert "routeAssistantArtifacts(plan)" in responsePlan
    assert 'surfaceToOpen: input.curriculumToSave ? "curriculum" : hasNotebookArtifact ? "editor" : null' in routing
    assert "surfaceForAcceptedPendingTarget(pendingTarget)" in pendingChanges
    assert 'return target === "curriculum" ? "curriculum" : "editor"' in routing
    assert 'surfaceToOpen: "automation"' not in responsePlan
    assert 'surfaceToOpen: "automation"' not in routing
    assert '"automation"' not in pendingChanges
