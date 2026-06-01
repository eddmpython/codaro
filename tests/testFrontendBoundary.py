from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def testNotebookPanelDoesNotCallTransportApiDirectly() -> None:
    source = _read("editor/src/components/notebook/notebookPanel.tsx")

    assert 'from "@/lib/api"' not in source
    assert "codaroApi" not in source
    assert "fetchCodeCompletions" in source


def testCodeCompletionOwnsCompletionApiBoundary() -> None:
    source = _read("editor/src/lib/codeCompletion.ts")

    assert 'import { codaroApi } from "@/lib/api"' in source
    assert "codaroApi.complete" in source
    assert "CodeCompletionContext" in source


def testCurriculumSurfaceDoesNotCallTransportApiDirectly() -> None:
    source = _read("editor/src/components/curriculum/curriculumSurface.tsx")

    assert 'from "@/lib/api"' not in source
    assert "codaroApi" not in source
    assert "listCurriculumPackages" in source
    assert "installCurriculumPackage" in source


def testCurriculumPackagePreparationOwnsPackageApiBoundary() -> None:
    source = _read("editor/src/lib/curriculumPackagePreparation.ts")

    assert 'import { codaroApi } from "@/lib/api"' in source
    assert "codaroApi.packagesList" in source
    assert "codaroApi.packageInstall" in source


def testWidgetHostDoesNotCallTransportApiDirectly() -> None:
    source = _read("editor/src/components/widgets/widgetHost.tsx")

    assert 'from "@/lib/api"' not in source
    assert "codaroApi" not in source
    assert "sendUiEvent" not in source
    assert "dispatchWidgetUiEvent" in source


def testWidgetUiEventsOwnsKernelUiEventBoundary() -> None:
    source = _read("editor/src/lib/widgetUiEvents.ts")

    assert 'import { codaroApi } from "@/lib/api"' in source
    assert "codaroApi.sendUiEvent" in source
    assert "codaro:reactive-trigger" in source


def testSharePackSurfaceDoesNotCallTransportApiDirectly() -> None:
    source = _read("editor/src/components/share/sharePackSurface.tsx")

    assert 'from "@/lib/api"' not in source
    assert "codaroApi" not in source
    assert "loadSharePackLibrary" in source
    assert "inspectSharePackSource" in source
    assert "createSharePackAutomationTask" in source


def testSharePackOperationsOwnsShareApiBoundary() -> None:
    source = _read("editor/src/lib/sharePackOperations.ts")

    assert 'import { codaroApi } from "@/lib/api"' in source
    assert "codaroApi.sharePackStatus" in source
    assert "codaroApi.sharePacks" in source
    assert "codaroApi.inspectSharePack" in source
    assert "codaroApi.installSharePack" in source
    assert "codaroApi.uninstallSharePack" in source
    assert "codaroApi.sharePackAutomation" in source
    assert "codaroApi.sharePackCurriculum" in source
    assert "codaroApi.createSharePackAutomationTask" in source
    assert "codaroApi.exportSharePack" in source


def testAppShellDoesNotCallTransportApiDirectly() -> None:
    source = _read("editor/src/App.tsx")

    assert 'from "@/lib/api"' not in source
    assert "codaroApi" not in source
    assert "loadSharePackCurriculum" in source
    assert "loadSystemDiagnosticExport" in source


def testSystemDiagnosticsOwnsDiagnosticExportBoundary() -> None:
    source = _read("editor/src/lib/systemDiagnostics.ts")

    assert 'import { codaroApi } from "@/lib/api"' in source
    assert "codaroApi.systemDiagnosticsExport" in source


def testMobileChatRouteDoesNotCallTransportApiDirectly() -> None:
    source = _read("editor/src/routes/mobileChat.tsx")

    assert 'from "@/lib/api"' not in source
    assert "codaroApi" not in source
    assert "sendMobileChatTurn" in source


def testMobileChatTurnOwnsTeacherChatBoundary() -> None:
    source = _read("editor/src/lib/mobileChatTurn.ts")

    assert 'import { codaroApi } from "@/lib/api"' in source
    assert "codaroApi.teacherChat" in source
    assert 'role: "teacher"' in source


def testCurriculumProgressHookDoesNotCallTransportApiDirectly() -> None:
    source = _read("editor/src/hooks/useCurriculumProgress.ts")

    assert 'from "@/lib/api"' not in source
    assert "codaroApi" not in source
    assert "loadCurriculumProgress" in source


def testCurriculumProgressOwnsProgressApiBoundary() -> None:
    source = _read("editor/src/lib/curriculumProgress.ts")

    assert 'import { codaroApi } from "@/lib/api"' in source
    assert "codaroApi.progress" in source


def testAssistantResponsePlanDoesNotPersistCurriculumDirectly() -> None:
    source = _read("editor/src/lib/assistantResponsePlan.ts")

    assert "saveCurriculum" not in source
    assert "curriculumToSave: plan.curriculumToSave" in source
    assert 'surfaceToOpen: plan.curriculumToSave ? "curriculum" : plan.documentToApply || plan.pendingBlocks.length ? "editor" : null' in source


def testAssistantContextSteersGoalDiscoveryBeforeYamlAuthoring() -> None:
    source = _read("editor/src/lib/assistantContext.ts")

    for expected in (
        "resolve-learning-goal",
        "search-curricula",
        "compose-master-plan",
        "Only call write-curriculum-yaml when compose-master-plan shows a real gap",
        "compose-master-plan이 기존 레슨으로 덮지 못하는 실제 gap",
    ):
        assert expected in source
    assert "draft curriculum YAML first" not in source
    assert "커리큘럼 YAML을 먼저" not in source


def testAssistantContextSteersAutomationAuthoringAwayFromCurriculumYaml() -> None:
    source = _read("editor/src/lib/assistantContext.ts")

    for expected in (
        'activeScope === "automation"',
        "write-automation-recipe",
        "dry-run",
        "Do not turn automation authoring requests into curriculum YAML",
        "자동화 작성 요청을 커리큘럼 YAML로 바꾸지 않는다",
    ):
        assert expected in source


def testAssistantTurnStateMakesCurriculumOpenExplicit() -> None:
    source = _read("editor/src/hooks/useAssistantTurnState.ts")

    assert "saveAndOpenCurriculum(application.curriculumToSave)" in source
    assert "saveAndOpenCurriculum(localApplication.curriculumToSave)" in source
    assert "openCurriculum(entry)" in source
    assert "completeAssistantLocalTurn" in source


def testTeacherScopeSeparatesAutomationFromLearningRequests() -> None:
    source = _read("editor/src/lib/teacherScope.ts")

    assert 'export type TeacherScope = "cell" | "lesson" | "curriculum" | "automation"' in source
    assert 'if (scope === "automation") return en ? "automation" : "자동화"' in source
    assert 'return "automation"' in source
    assert source.index("배우|학습|공부|연습|실습") < source.index("자동화|루틴|태스크")


def testLocalFallbackRoutesAutomationDraftsToNotebookPendingChanges() -> None:
    fallback = _read("editor/src/lib/localFallback.ts")
    localTurn = _read("editor/src/lib/assistantLocalTurn.ts")
    hook = _read("editor/src/hooks/useAssistantTurnState.ts")

    assert 'scope === "automation"' in fallback
    assert 'sourceType: "automationAuthoring"' in fallback
    assert "DRY_RUN = True" in fallback
    assert 'scope === "lesson" || scope === "curriculum"' in fallback
    assert "pendingBlocks = draft.shouldSaveCurriculum ? [] : draft.generatedBlocks" in localTurn
    assert "mergePendingBlocks(current, localApplication.pendingBlocks)" in hook


def testAutomationBlocksRemainExecutableInNotebookModel() -> None:
    cellModel = _read("editor/src/lib/cellModel.ts")
    documentModel = _read("editor/src/lib/documentModel.ts")
    runtimeHook = _read("editor/src/hooks/useNotebookRuntimeState.ts")
    notebookRuntime = _read("editor/src/lib/notebookRuntime.ts")
    notebookPanel = _read("editor/src/components/notebook/notebookPanel.tsx")

    assert "export function isExecutableBlock(block: BlockConfig)" in cellModel
    assert 'block.type === "code" || block.type === "automation"' in cellModel
    assert ".filter((block) => isExecutableBlock(block)" in documentModel
    assert "document.blocks.filter(isExecutableBlock)" in runtimeHook
    assert 'type: isExecutableBlock(block) ? "code" : "markdown"' in notebookRuntime
    assert 'block.type === "automation" ? "Automation"' in notebookPanel


def testFrontendStateDoesNotImportComponentImplementations() -> None:
    for relativePath in (
        "editor/src/hooks/useAssistantTurnState.ts",
        "editor/src/lib/assistantProviderTurn.ts",
        "editor/src/lib/providerConnection.ts",
    ):
        source = _read(relativePath)
        assert 'from "@/components/' not in source


def testProviderProfileDisplayLogicLivesInLibBoundary() -> None:
    hook = _read("editor/src/hooks/useAssistantTurnState.ts")
    panel = _read("editor/src/components/assistant/assistantPanel.tsx")
    chat = _read("editor/src/components/chat/chatSurface.tsx")
    profileLib = _read("editor/src/lib/providerProfile.ts")

    assert "providerProfileName(profile)" in hook
    assert "providerProfileName" in panel
    assert "providerProfileReady" in panel
    assert "providerProfileReady" in chat
    assert "export function providerProfileName" in profileLib
    assert "export function providerProfileReady" in profileLib
    assert "export function aiProviderName" not in panel
    assert "export function aiProfileReady" not in panel
    assert 'from "@/components/assistant/assistantPanel"' not in hook


def testAssistantPanelKeepsWorkloopViewModelInLibBoundary() -> None:
    panel = _read("editor/src/components/assistant/assistantPanel.tsx")
    workLoop = _read("editor/src/lib/workLoop.ts")

    assert 'from "@/lib/workLoop"' in panel
    for symbol in (
        "formatDuration",
        "formatPayload",
        "groupAssistantSteps",
        "traceWorkloopEvents",
        "traceWorkloopRowDetail",
    ):
        assert symbol in panel
        assert f"export function {symbol}" in workLoop
        assert f"function {symbol}" not in panel
    assert "function laneLabel" not in panel
    assert "function categoryLabel" not in panel


def testPendingCurriculumChangesOpenCurrentLearningSurface() -> None:
    source = _read("editor/src/lib/pendingChanges.ts")
    hook = _read("editor/src/hooks/usePendingChangesState.ts")

    assert 'surfaceToOpen: "curriculum"' in source
    assert "openCurriculum(entry, { showNotice: true })" in hook
