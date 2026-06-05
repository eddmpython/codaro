from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EDITOR_SRC = ROOT / "editor/src"


def _read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def _editor_sources(*roots: str) -> list[Path]:
    paths: list[Path] = []
    for root in roots:
        base = EDITOR_SRC / root
        if base.is_file():
            paths.append(base)
            continue
        paths.extend(path for path in base.rglob("*") if path.suffix in {".ts", ".tsx"})
    return sorted(paths)


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
    assert "CurriculumDependencyPanel" in source
    assert "listCurriculumPackages" not in source
    assert "installCurriculumPackage" not in source


def testCurriculumHomeDelegatesProgressApiBoundary() -> None:
    source = _read("editor/src/components/curriculum/curriculumHome.tsx")

    assert 'from "@/lib/api"' not in source
    assert "codaroApi" not in source
    assert "useCurriculumProgress" in source
    assert 'data-curriculum-home="true"' in source


def testCurriculumDependencyPanelDelegatesPackageApiBoundary() -> None:
    source = _read("editor/src/components/curriculum/curriculumDependencyPanel.tsx")

    assert 'from "@/lib/api"' not in source
    assert "codaroApi" not in source
    assert "listCurriculumPackages" in source
    assert "installCurriculumPackage" in source
    assert "curriculumPackageInstallCommand" in source


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
    assert "export type AssistantResponseApplication = AssistantArtifactApplication" in source
    assert "return buildAssistantArtifactApplication(plan)" in source


def testAssistantArtifactRoutingOwnsChatArtifactSurfaceTransitions() -> None:
    route = _read("editor/src/lib/assistantArtifactRouting.ts")
    responsePlan = _read("editor/src/lib/assistantResponsePlan.ts")
    localTurn = _read("editor/src/lib/assistantLocalTurn.ts")
    pendingChanges = _read("editor/src/lib/pendingChanges.ts")
    pendingHook = _read("editor/src/hooks/usePendingChangesState.ts")
    ssotMap = _read("docs/skills/architecture/ssot-map.md")

    assert "export function routeAssistantArtifacts" in route
    assert "export type AssistantArtifactApplication" in route
    assert "export function buildAssistantArtifactApplication" in route
    assert "export function pendingTargetForAssistantArtifacts" in route
    assert "export function surfaceForAssistantArtifacts" in route
    assert "export function surfaceForAcceptedPendingTarget" in route
    assert "...input" in route
    assert 'pendingTarget: pendingTargetForAssistantArtifacts(input)' in route
    assert 'surfaceToOpen: surfaceForAssistantArtifacts(input)' in route
    assert 'return input.pendingBlocks.length > 0 ? "notebook" : null' in route
    assert 'if (input.curriculumToSave) return "curriculum"' in route
    assert 'if (input.documentToApply || input.pendingBlocks.length > 0) return "editor"' in route
    assert "buildAssistantArtifactApplication(plan)" in responsePlan
    assert "routeAssistantArtifacts(plan)" not in responsePlan
    assert "type AssistantLocalTurnApplication = AssistantArtifactApplication &" in localTurn
    assert "buildAssistantArtifactApplication({" in localTurn
    assert "documentToApply: null" in localTurn
    assert "clearPendingBlocks ? \"notebook\"" not in route
    assert 'surfaceToOpen: "automation"' not in route
    assert 'type PendingTarget = "notebook" | "curriculum"' in route
    assert 'from "@/lib/assistantArtifactRouting"' in responsePlan
    assert 'from "@/lib/assistantArtifactRouting"' in localTurn
    assert 'from "@/lib/assistantArtifactRouting"' in pendingChanges
    assert 'from "@/lib/assistantResponsePlan"' not in pendingHook
    assert "`editor/src/lib/assistantArtifactRouting.ts`" in ssotMap


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


def testAssistantTurnUsesLocalFallbackBeforeProviderWhenProfileIsNotReady() -> None:
    source = _read("editor/src/hooks/useAssistantTurnState.ts")
    providerConnection = _read("editor/src/lib/providerConnection.ts")

    assert "providerProfileReady" in source
    assert "const providerReady = providerProfileReady(profile)" in source
    assert "if (!apiOnline || !providerReady)" in source
    providerFallbackIndex = source.index("if (!apiOnline || !providerReady)")
    providerCallIndex = source.index("const { response, streamedContent } = await runAssistantProviderTurn")
    assert providerFallbackIndex < providerCallIndex
    assert "buildAssistantLocalTurnApplication" in source
    assert "providerConnectionRequiredNotice()" in source
    assert "const openProviderConnectionPromptOnce = useCallback" in source
    assert "shouldOpenProviderConnectionPrompt({" in source
    assert "shouldResetProviderConnectionPrompt({" in source
    assert "onProviderConnectionRequired?.()" in source
    assert source.count("onProviderConnectionRequired?.()") == 1
    assert source.count("shouldOpenProviderConnectionPrompt({") == 1
    assert "openProviderConnectionPromptOnce(!providerReady)" in source
    assert 'openProviderConnectionPromptOnce(failure.action === "connect-provider")' in source
    assert "export function providerConnectionRequiredNotice" in providerConnection
    assert "export function shouldOpenProviderConnectionPrompt" in providerConnection
    assert "export function shouldResetProviderConnectionPrompt" in providerConnection
    assert 'translate("provider.connectionRequired.title")' in providerConnection
    assert 'translate("assistant.providerLoginRequired")' in providerConnection


def testAssistantTurnStateMakesCurriculumOpenExplicit() -> None:
    source = _read("editor/src/hooks/useAssistantTurnState.ts")
    customCurricula = _read("editor/src/lib/customCurricula.ts")

    assert "const applyAssistantTurnApplication = useCallback" in source
    assert "application: AssistantArtifactApplication" in source
    assert "type AssistantTurnApplication" not in source
    assert "saveAndOpenCurriculum(application.curriculumToSave)" in source
    assert "saveAndOpenCustomCurriculum" in source
    assert "export function saveAndOpenCustomCurriculum" in customCurricula
    assert "applyAssistantTurnApplication(localApplication)" in source
    assert "applyAssistantTurnApplication(application)" in source
    assert "mergePendingBlocks(current, application.pendingBlocks)" in source
    assert "openCurriculum(entry)" not in source
    assert "completeAssistantLocalTurn" in source


def testTeacherScopeSeparatesAutomationLearningFromAutomationAuthoring() -> None:
    source = _read("editor/src/lib/teacherScope.ts")

    assert 'export type TeacherScope = "cell" | "lesson" | "curriculum" | "automation"' in source
    assert 'if (scope === "automation") return en ? "automation" : "자동화"' in source
    assert 'return "automation"' in source
    assert "function hasLearningIntent(value: string): boolean" in source
    assert "function hasAutomationAuthoringIntent(value: string): boolean" in source
    assert 'if (hasLearningIntent(normalized)) return "curriculum"' in source
    assert 'if (hasAutomationAuthoringIntent(normalized)) return "automation"' in source
    assert source.index("hasLearningIntent(normalized)") < source.index("hasAutomationAuthoringIntent(normalized)")
    assert "dry-?run" in source


def testLocalFallbackRoutesAutomationDraftsToNotebookPendingChanges() -> None:
    fallback = _read("editor/src/lib/localFallback.ts")
    localTurn = _read("editor/src/lib/assistantLocalTurn.ts")
    hook = _read("editor/src/hooks/useAssistantTurnState.ts")

    assert 'scope === "automation"' in fallback
    assert 'sourceType: "automationAuthoring"' in fallback
    assert "DRY_RUN = True" in fallback
    assert 'scope === "lesson" || scope === "curriculum"' in fallback
    assert "pendingBlocks = draft.shouldSaveCurriculum ? [] : draft.generatedBlocks" in localTurn
    assert "applyAssistantTurnApplication(localApplication)" in hook
    assert "mergePendingBlocks(current, application.pendingBlocks)" in hook
    assert "buildLocalExecutionResult" not in fallback
    assert "firstOutputLine" not in fallback


def testLocalRuntimeOwnsOfflineExecutionBoundary() -> None:
    localRuntime = _read("editor/src/lib/localRuntime.ts")
    notebookRuntime = _read("editor/src/lib/notebookRuntime.ts")
    ssotMap = _read("docs/skills/architecture/ssot-map.md")

    assert "export function buildLocalExecutionResult" in localRuntime
    assert "export function firstOutputLine" in localRuntime
    assert 'from "@/lib/localRuntime"' in notebookRuntime
    assert "`editor/src/lib/localRuntime.ts`" in ssotMap
    assert "로컬 실행 결과" not in _read("editor/src/lib/localFallback.ts")


def testAutomationBlocksRemainExecutableInNotebookModel() -> None:
    appShell = _read("editor/src/App.tsx")
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
    assert "isExecutableBlock(target)" in appShell
    assert 'target.type === "code"' not in appShell


def testFrontendStateDoesNotImportComponentImplementations() -> None:
    offenders: list[str] = []
    for path in _editor_sources("hooks", "lib"):
        source = path.read_text(encoding="utf-8")
        if '@/components/' in source:
            offenders.append(path.relative_to(ROOT).as_posix())

    assert offenders == []


def testUiAndHookLayersDoNotCallTransportApiDirectly() -> None:
    offenders: list[str] = []
    for path in _editor_sources("App.tsx", "components", "hooks", "routes"):
        source = path.read_text(encoding="utf-8")
        if '@/lib/api' in source or "codaroApi" in source:
            offenders.append(path.relative_to(ROOT).as_posix())

    assert offenders == []


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
    route = _read("editor/src/lib/assistantArtifactRouting.ts")
    customCurricula = _read("editor/src/lib/customCurricula.ts")

    assert "surfaceForAcceptedPendingTarget(pendingTarget)" in source
    assert 'return target === "curriculum" ? "curriculum" : "editor"' in route
    assert "saveAndOpenCustomCurriculum" in hook
    assert "openOptions: { showNotice: true }" in hook
    assert "openCurriculum(entry, { showNotice: true })" not in hook
    assert "export function saveAndOpenCustomCurriculum" in customCurricula
