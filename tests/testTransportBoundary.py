from pathlib import Path
import ast


ROOT = Path(__file__).resolve().parents[1]


def testAiRouterDoesNotImportProviderImplementations() -> None:
    source = (ROOT / "src/codaro/api/aiRouter.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all(".providers" not in module for module in importedModules)
    assert "ChatGPTOAuthError" not in source


def testAiRouterKeepsRuntimeAndCurriculumBehindTeacherBoundary() -> None:
    source = (ROOT / "src/codaro/api/aiRouter.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    blockedFragments = (".runtime", ".curriculum", ".document", ".kernel")
    assert all(
        not any(fragment in module for fragment in blockedFragments)
        for module in importedModules
    )
    assert "prepareTeacherRuntimeTurnFromRequest" in source
    assert "runtimeTurn.turn." not in source
    assert "runTeacherChatLoop" not in source
    assert "runTeacherChatStream" not in source
    assert "runTeacherRuntimeTurn" in source
    assert "streamTeacherRuntimeTurn" in source


def testTeacherRuntimeTurnExecutionOwnsPreparedTurnUnpacking() -> None:
    source = (ROOT / "src/codaro/ai/teacher/turnExecution.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "runtimeTurn.turn.provider" in source
    assert "runTeacherChatLoop" in source
    assert "runTeacherChatStream" in source


def testTeacherLoopCompatibilityShimStaysThinAndUnusedInternally() -> None:
    shimPath = ROOT / "src/codaro/ai/teacherLoop.py"
    source = shimPath.read_text(encoding="utf-8")

    assert "from .teacher.contextBuilder import injectContext" in source
    assert "from .teacher.toolLifecycle import toolCallResult, toolCallStart" in source
    assert '__all__ = ["injectContext", "toolCallResult", "toolCallStart"]' in source
    assert "providerLoop" not in source
    assert "providerStream" not in source
    assert "turnRuntime" not in source
    assert "turnExecution" not in source

    offenders: list[str] = []
    for path in (ROOT / "src/codaro").rglob("*.py"):
        if path == shimPath:
            continue
        tree = ast.parse(path.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom) and node.module in {"codaro.ai.teacherLoop", "teacherLoop"}:
                offenders.append(path.relative_to(ROOT).as_posix())
            if isinstance(node, ast.Import):
                for alias in node.names:
                    if alias.name == "codaro.ai.teacherLoop":
                        offenders.append(path.relative_to(ROOT).as_posix())

    assert offenders == []


def testCurriculumRouterKeepsCheckFlowBehindDomainBoundary() -> None:
    source = (ROOT / "src/codaro/api/curriculumRouter.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    blockedModules = {
        "curriculum.checker",
        "curriculum.exerciseCheck",
        "curriculum.misconceptionCatalog",
        "curriculum.predictionDiff",
        "curriculum.sectionContract",
    }
    assert all(
        not any(module.endswith(blocked) for blocked in blockedModules)
        for module in importedModules
    )
    assert "runCurriculumCheckFlow" in source


def testCurriculumRouterKeepsPlanningBehindDomainBoundary() -> None:
    source = (ROOT / "src/codaro/api/curriculumRouter.py").read_text(encoding="utf-8")

    assert "composeCurriculumMasterPlan" in source
    assert "buildCurriculumGapsPayload" in source
    assert "updateOutcomeValidation" in source
    assert "buildLearnerOutcomePayload" in source
    assert "CurriculumAnalyticsFlow" in source
    assert "buildCurriculumQualityReport" in source
    assert "buildCurriculumCheckProposalsPayload" in source
    assert "buildCurriculumLessonStatsPayload" in source
    assert "buildCurriculumReviewsPayload" in source
    assert "CurriculumContentFlow" in source
    assert "buildCurriculumProgressSummary" in source
    assert "updateCurriculumProgress" in source
    assert "buildCurriculumTaxonomyPayload" in source
    assert "buildLearningSpecPayload" in source
    assert "PlanGoal" not in source
    assert "composeMasterPlan" not in source
    assert "coveredOutcomes" not in source
    assert "targetOutcomes" not in source
    assert "domainById" not in source
    assert "hasOutcome" not in source
    assert "computeMastery" not in source
    assert "buildSnapshot" not in source
    assert "buildUnifiedMastery" not in source
    assert "analyticsRefreshState" not in source
    assert "computeQualityReport" not in source
    assert "weakCheckCoverage" not in source
    assert "lessonsProvidingOutcome" not in source
    assert "observedMinutesEwma" not in source
    assert "daysOverdue" not in source
    assert "listDueReviews" not in source
    assert "CurriculumContentCache" not in source
    assert "CATEGORY_GROUPS" not in source
    assert "CATEGORY_MAPPING" not in source
    assert "LEARNING_PATHS" not in source
    assert "curriculumCategoryTree" not in source
    assert "listCategories" not in source
    assert "listContents" not in source
    assert "markAccessed" not in source
    assert "completeMission" not in source
    assert "getSummary" not in source
    assert "AI_TEACHER_INSTRUCTIONS" not in source
    assert "EXERCISE_TYPES" not in source
    assert "HINT_STRATEGY" not in source
    assert "LESSON_STRUCTURE" not in source
    assert "PHILOSOPHY" not in source


def testCurriculumCheckFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/curriculum/checkFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "fail(" not in source


def testCurriculumPlanningFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/curriculum/planningFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "fail(" not in source


def testCurriculumCatalogFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/curriculum/catalogFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "fail(" not in source


def testCurriculumAuthoringProposalFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/curriculum/authoringProposalFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "fail(" not in source


def testLearnerProgressFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/curriculum/learnerProgressFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "fail(" not in source


def testCurriculumAnalyticsFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/curriculum/analyticsFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "fail(" not in source


def testCurriculumQualityFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/curriculum/qualityFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "fail(" not in source


def testCurriculumReviewFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/curriculum/reviewFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "fail(" not in source


def testCurriculumContentFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/curriculum/contentFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "fail(" not in source


def testCurriculumProgressFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/curriculum/progressFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "fail(" not in source


def testCurriculumOsToolHandlersUseCurriculumFlowBoundaries() -> None:
    source = (ROOT / "src/codaro/ai/toolHandlers/curriculumOs.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    blockedModules = {
        "curriculum.checkProposer",
        "curriculum.goalResolver",
        "curriculum.lessonGraph",
        "curriculum.outcomeMastery",
        "curriculum.planComposer",
        "curriculum.qualityAnalytics",
        "curriculum.sectionContract",
        "curriculum.taxonomy",
    }
    assert all(
        not any(module.endswith(blocked) for blocked in blockedModules)
        for module in importedModules
    )
    assert "CurriculumOsCache" in source
    assert "buildVariationProposalPayload" in source
    assert "buildPredictPromptProposalPayload" in source
    assert "buildCurriculumTaxonomyPayload" in source
    assert "resolveLearningGoalPayload" in source
    assert "searchCurriculaPayload" in source
    assert "inspectCurriculumPayload" in source
    assert "composeCurriculumMasterPlan" in source
    assert "buildCurriculumGapsPayload" in source
    assert "buildOutcomeMasteryPayload" in source
    assert "updateOutcomeValidationToolPayload" in source
    assert "buildCurriculumLessonStatsPayload" in source
    assert "buildCurriculumCheckProposalsPayload" in source
    assert "buildCurriculumQualityAnalysisPayload" in source
    assert "buildCurriculumDraftProposalPayload" in source
    assert "loadTaxonomy" not in source
    assert "buildLessonGraph" not in source
    assert "PlanGoal" not in source
    assert "resolveGoal" not in source
    assert "computeMastery" not in source
    assert "masteredOutcomeIds" not in source
    assert "weakCheckCoverage" not in source
    assert "targetOutcomes" not in source
    assert "domainById" not in source
    assert "outcomeById" not in source
    assert "lessonsProvidingOutcome" not in source
    assert "lessonContractFromYaml" not in source
    assert "_generateVariationDrafts" not in source
    assert "_predictDraftFromSection" not in source
    assert "_taxonomy" not in source
    assert "_graph" not in source
    assert ".markOutcomeValidated(" not in source
    assert ".clearOutcomeValidation(" not in source


def testShareRouterKeepsAutomationTaskCreationBehindShareBoundary() -> None:
    source = (ROOT / "src/codaro/api/shareRouter.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("automation." not in module for module in importedModules)
    assert "SharePackFlow" in source
    assert "buildAutomationTaskDraft" not in source
    assert "getTaskRegistry" not in source
    assert "PackService" not in source
    assert "createSharePackAutomationTask" not in source
    assert ".listInstalled()" not in source
    assert ".loadCurriculumDocument(" not in source
    assert ".loadAutomationRecipe(" not in source


def testSharePackAutomationTaskBoundaryDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/share/automationTask.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)


def testSharePackFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/share/packFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "HTTPException" not in source
    assert "createSharePackAutomationTask" in source


def testAutomationRouterKeepsTaskExecutionBehindAutomationBoundary() -> None:
    source = (ROOT / "src/codaro/api/automationRouter.py").read_text(encoding="utf-8")

    assert "runAutomationTaskPayload" in source
    assert "setAutomationTaskSchedulePayload" in source
    assert "triggerAutomationStopPayload" in source
    assert "triggerAutomationWebhookPayload" in source
    assert "TaskRunner" not in source
    assert "getTaskRegistry" not in source
    assert "getEmergencyStop" not in source
    assert "parseScheduleSeconds" not in source
    assert "TaskScheduler" not in source
    assert "_getScheduler" not in source


def testAutomationRouterKeepsPlanLoopBehindAutomationBoundary() -> None:
    source = (ROOT / "src/codaro/api/automationRouter.py").read_text(encoding="utf-8")

    assert "executeAutomationPlanPayload" in source
    assert "getAutomationPlanStatusPayload" in source
    assert "pauseAutomationPlanPayload" in source
    assert "resumeAutomationPlanPayload" in source
    assert "AutomationLoop" not in source
    assert "LoopConfig" not in source
    assert "_activePlans" not in source
    assert "loop.addSteps" not in source
    assert "loop.pause" not in source
    assert "loop.resume" not in source


def testAutomationRouterKeepsWorkflowEngineBehindAutomationBoundary() -> None:
    source = (ROOT / "src/codaro/api/automationRouter.py").read_text(encoding="utf-8")

    assert "listAutomationWorkflowsPayload" in source
    assert "createAutomationWorkflowPayload" in source
    assert "getAutomationWorkflowPayload" in source
    assert "deleteAutomationWorkflowPayload" in source
    assert "runAutomationWorkflowPayload" in source
    assert "listAutomationWorkflowRunsPayload" in source
    assert "getWorkflowEngine" not in source
    assert "WorkflowEngine" not in source
    assert ".listWorkflows()" not in source
    assert ".create(name=req.name" not in source
    assert ".get(workflowId)" not in source
    assert ".delete(workflowId)" not in source
    assert ".run(workflowId)" not in source
    assert ".getRuns(workflowId" not in source


def testAutomationRouterKeepsInputPolicyBehindAutomationBoundary() -> None:
    source = (ROOT / "src/codaro/api/automationRouter.py").read_text(encoding="utf-8")

    assert "getAutomationInputPolicyPayload" in source
    assert "updateAutomationInputPolicyPayload" in source
    assert "_getInputGuard" not in source
    assert "Region(" not in source
    assert "policy.maxActionsPerSecond" not in source
    assert "policy.allowedScreenRegion" not in source


def testAutomationRouterKeepsRecordingBehindAutomationBoundary() -> None:
    source = (ROOT / "src/codaro/api/automationRouter.py").read_text(encoding="utf-8")

    assert "startAutomationRecordingPayload" in source
    assert "stopAutomationRecordingPayload" in source
    assert "getAutomationRecordingStatusPayload" in source
    assert "_getRecorder" not in source
    assert "RecipeGenerator" not in source
    assert "recorder.start()" not in source
    assert "recorder.stop()" not in source


def testAutomationRouterKeepsNotificationBridgeBehindAutomationBoundary() -> None:
    source = (ROOT / "src/codaro/api/automationRouter.py").read_text(encoding="utf-8")

    assert "listAutomationChannelsPayload" in source
    assert "addAutomationChannelPayload" in source
    assert "removeAutomationChannelPayload" in source
    assert "sendAutomationNotificationPayload" in source
    assert "_getMessageBridgeApi" not in source
    assert "MessageChannel" not in source
    assert ".broadcast(" not in source
    assert ".send(channel" not in source
    assert ".removeChannel(" not in source


def testAutomationRouterKeepsVoiceEnginesBehindAutomationBoundary() -> None:
    source = (ROOT / "src/codaro/api/automationRouter.py").read_text(encoding="utf-8")

    assert "listenAutomationVoicePayload" in source
    assert "speakAutomationVoicePayload" in source
    assert "parseAutomationVoiceCommandPayload" in source
    assert "WhisperEngine" not in source
    assert "Pyttsx3Speaker" not in source
    assert "CommandParser" not in source
    assert "startListening" not in source
    assert "stopListening" not in source
    assert ".speak(text" not in source


def testAutomationRouterKeepsMonitoringBehindAutomationBoundary() -> None:
    source = (ROOT / "src/codaro/api/automationRouter.py").read_text(encoding="utf-8")

    assert "automationResourceUsagePayload" in source
    assert "automationAuditLogPayload" in source
    assert "getAuditTrail" not in source
    assert "queryFromDisk" not in source
    assert ".listSessions()" not in source
    assert "getResourceUsage" not in source
    assert "memoryMb" not in source
    assert "cpuPercent" not in source


def testIntegrationRouterKeepsRegistryBehindAutomationBoundary() -> None:
    source = (ROOT / "src/codaro/api/integrationRouter.py").read_text(encoding="utf-8")

    assert "listAutomationIntegrationsPayload" in source
    assert "configureAutomationIntegrationPayload" in source
    assert "runAutomationIntegrationTestPayload" in source
    assert "executeAutomationIntegrationPayload" in source
    assert "getIntegrationRegistry" not in source
    assert ".listIntegrations()" not in source
    assert ".listByCategory(" not in source
    assert ".testConnection(" not in source
    assert ".execute(integrationId" not in source


def testExtensionRouterKeepsRegistryBehindExtensionBoundary() -> None:
    source = (ROOT / "src/codaro/api/extensionRouter.py").read_text(encoding="utf-8")

    assert "listExtensionsPayload" in source
    assert "registerExtensionPayload" in source
    assert "listExtensionsByCapabilityPayload" in source
    assert "getExtensionRegistry" not in source
    assert "ExtensionCapability(" not in source
    assert ".listExtensions()" not in source
    assert ".listByCapability(" not in source
    assert ".register(" not in source


def testAutomationHandlersUseNotificationFlowForExternalChannels() -> None:
    source = (ROOT / "src/codaro/ai/toolHandlers/automation.py").read_text(encoding="utf-8")

    assert "sendAutomationNotificationPayload" in source
    assert "getSharedMessageBridge" not in source
    assert ".broadcast(message)" not in source
    assert ".send(channel, message)" not in source


def testAutomationHandlersUseVoiceFlowForVoiceEngines() -> None:
    source = (ROOT / "src/codaro/ai/toolHandlers/automation.py").read_text(encoding="utf-8")

    assert "listenAutomationVoicePayload" in source
    assert "speakAutomationVoicePayload" in source
    assert "WhisperEngine" not in source
    assert "Pyttsx3Speaker" not in source
    assert "startListening" not in source
    assert "stopListening" not in source


def testAutomationTaskFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/automation/taskFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "HTTPException" not in source


def testAutomationPlanFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/automation/planFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "HTTPException" not in source


def testAutomationWorkflowFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/automation/workflowFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "HTTPException" not in source


def testAutomationInputPolicyFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/automation/inputPolicyFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "HTTPException" not in source


def testAutomationRecordingFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/automation/recordingFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "HTTPException" not in source


def testAutomationNotificationFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/automation/notificationFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "HTTPException" not in source


def testAutomationVoiceFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/automation/voiceFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "HTTPException" not in source


def testAutomationMonitoringFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/automation/monitoringFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "HTTPException" not in source


def testAutomationIntegrationFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/automation/integrationFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "HTTPException" not in source


def testKernelRouterKeepsUiCallbackFlowBehindKernelBoundary() -> None:
    source = (ROOT / "src/codaro/api/kernelRouter.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all(not module.endswith("uiCallbacks") for module in importedModules)
    assert "handleKernelUiEvent" in source
    assert "invokeCallback" not in source
    assert "hasCallback" not in source
    assert "reactiveTriggerFromUiEventResult" not in source
    assert "_jsonSafeResult" not in source


def testKernelWebSocketKeepsUiCallbackFlowBehindKernelBoundary() -> None:
    source = (ROOT / "src/codaro/api/kernelWebSocket.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all(not module.endswith("uiCallbacks") for module in importedModules)
    assert "resetKernelUiCallbacks" in source
    assert "resetCallbacks" not in source
    assert "invokeCallback" not in source
    assert "hasCallback" not in source


def testKernelUiEventFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/kernel/uiEventFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "UiEventResponse" in source
    assert "reactiveTriggerFromUiEventResult" in source


def testSystemRouterKeepsDiagnosticsBehindSystemBoundary() -> None:
    source = (ROOT / "src/codaro/api/systemRouter.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    definedFunctions = {
        node.name
        for node in ast.walk(tree)
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    }

    assert "buildLocalDiagnosticSummary" in source
    assert "buildLocalDiagnosticExport" in source
    assert "from ..system.localDiagnostics import" in source
    assert "diagnosticExportContext" not in definedFunctions
    assert "providerDiagnostics" not in definedFunctions
    assert "packageDiagnostics" not in definedFunctions
    assert "runtimeDiagnostics" not in definedFunctions
    assert "frontendDiagnostics" not in definedFunctions


def testSystemRouterKeepsHealthBehindSystemBoundary() -> None:
    source = (ROOT / "src/codaro/api/systemRouter.py").read_text(encoding="utf-8")

    assert "buildSystemHealthPayload" in source
    assert "getConversationManager" not in source
    assert "conversationCount" not in source
    assert "sessionCount" not in source
    assert "getVariables()" not in source
    assert "processMemoryMb" not in source
    assert "psutil" not in source


def testLocalDiagnosticsDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/system/localDiagnostics.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "fail(" not in source


def testSystemHealthFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/system/healthFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "HTTPException" not in source


def testServerStateFactoryLivesOutsideTransportLayer() -> None:
    source = (ROOT / "src/codaro/system/serverState.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert "class ServerState" in source
    assert "def createServerState" in source
    for expected in (
        "AnalyticsTimeline",
        "LearnerStateStore",
        "CurriculumOsCache",
        "ProgressTracker",
        "StudyLoader",
        "SessionManager",
        "ExecutionEngine",
        "LocalEngine",
    ):
        assert expected in source
    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "HTTPException" not in source


def testApiAppStateCompatibilityShimStaysThinAndUnusedInternally() -> None:
    shimPath = ROOT / "src/codaro/api/appState.py"
    source = shimPath.read_text(encoding="utf-8")

    assert "from ..system.serverState import ServerState, createServerState" in source
    assert '__all__ = ["ServerState", "createServerState"]' in source
    for forbidden in (
        "dataclass",
        "AnalyticsTimeline",
        "LearnerStateStore",
        "CurriculumOsCache",
        "ProgressTracker",
        "StudyLoader",
        "SessionManager",
        "ExecutionEngine",
        "LocalEngine",
    ):
        assert forbidden not in source

    offenders: list[str] = []
    for path in (ROOT / "src/codaro").rglob("*.py"):
        if path == shimPath:
            continue
        tree = ast.parse(path.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom):
                if node.module == "codaro.api.appState":
                    offenders.append(path.relative_to(ROOT).as_posix())
                if node.module == "appState" and node.level > 0:
                    offenders.append(path.relative_to(ROOT).as_posix())
            if isinstance(node, ast.Import):
                for alias in node.names:
                    if alias.name == "codaro.api.appState":
                        offenders.append(path.relative_to(ROOT).as_posix())

    assert offenders == []


def testApiPackageReexportsServerStateFromSystemBoundary() -> None:
    source = (ROOT / "src/codaro/api/__init__.py").read_text(encoding="utf-8")

    assert "from ..system.serverState import ServerState, createServerState" in source
    assert "from .appState import ServerState" not in source
    assert "from .appState import ServerState, createServerState" not in source


def testExtensionFlowDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/extensions/extensionFlow.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "HTTPException" not in source


def testDocumentRouterKeepsBlockOperationsBehindDocumentBoundary() -> None:
    source = (ROOT / "src/codaro/api/documentRouter.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]
    definedFunctions = {
        node.name
        for node in ast.walk(tree)
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    }

    assert any(module.endswith("document.blockOperations") for module in importedModules)
    assert "insertBlock" in source
    assert "moveBlock" in source
    assert "updateBlock" in source
    assert "loadCodeBlockForExecution" in source
    assert "executeDocumentCodeBlock" in source
    assert "executeKernelBlock" not in source
    assert "findBlockIndex" not in definedFunctions
    assert "BlockConfig(" not in source
    assert "document.blocks.append" not in source
    assert "document.blocks.insert" not in source
    assert "document.blocks.pop" not in source


def testDocumentBlockOperationsDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/document/blockOperations.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "fail(" not in source


def testWorkbenchHandlersUseDocumentBlockOperations() -> None:
    source = (ROOT / "src/codaro/ai/toolHandlers/workbench.py").read_text(encoding="utf-8")

    assert "insertDocumentBlock" in source
    assert "updateDocumentBlock" in source
    assert "removeDocumentBlock" in source
    assert "from codaro.document.models import BlockConfig" not in source
    assert "document.blocks.append" not in source
    assert "document.blocks.insert" not in source
    assert "document.blocks.pop" not in source
    assert "doc.blocks.append" not in source
    assert "doc.blocks.insert" not in source
    assert "doc.blocks.pop" not in source


def testLearningAndAutomationHandlersUseDocumentBoundaryForCurrentDocumentWrites() -> None:
    for relativePath in (
        "src/codaro/ai/toolHandlers/learning.py",
        "src/codaro/ai/toolHandlers/automation.py",
    ):
        source = (ROOT / relativePath).read_text(encoding="utf-8")
        assert "insertDocumentBlock" in source
        assert "doc.blocks.append" not in source
        assert "doc.blocks.insert" not in source
        assert "doc.blocks.pop" not in source


def testLearningHandlersUseNotebookGenerationBoundary() -> None:
    source = (ROOT / "src/codaro/ai/toolHandlers/learning.py").read_text(encoding="utf-8")

    assert "buildGeneratedNotebookDocument" in source
    assert "buildSplitNotebookDocument" in source
    assert "safeNotebookFileName" in source
    assert "saveNotebookDocument" in source
    assert "from codaro.document.models import" not in source
    assert "from codaro.document.service import saveDocument" not in source
    assert "BlockConfig(" not in source
    assert "CodaroDocument(" not in source
    assert "saveDocument(filePath" not in source


def testNotebookGenerationDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/document/notebookGeneration.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "APIRouter" not in source
    assert "fail(" not in source


def testKernelDocumentExecutionDoesNotImportTransportLayer() -> None:
    source = (ROOT / "src/codaro/kernel/documentExecution.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    importedModules = [
        node.module
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    ]

    assert all("api." not in module and not module.endswith("api") for module in importedModules)
    assert "executeDocumentCodeBlock" in source
    assert "APIRouter" not in source
    assert "fail(" not in source
