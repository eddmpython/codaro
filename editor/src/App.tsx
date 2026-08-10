import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialAppNotice,
  initialBootstrapState,
} from "@/lib/appBootstrap";
import { MainSurface } from "@/components/app/mainSurface";
import { AppProjection } from "@/components/app/appProjection";
import { useCodaroDesign } from "@/lib/codaroDesign";
import { ProductSidebar } from "@/components/app/productSidebar";
import { ProductMobileNav } from "@/components/app/productMobileNav";
import { ProviderReconnectBar } from "@/components/app/providerReconnectBar";
import { TopControls } from "@/components/app/topBar";
import { ProviderSettingsSheet } from "@/components/assistant/providerSettingsSheet";
import { TerminalPanel } from "@/components/terminal/terminalPanel";
import { useAppBootstrapEffect } from "@/hooks/useAppBootstrapEffect";
import { useAssistantTurnState } from "@/hooks/useAssistantTurnState";
import { useAutomationState } from "@/hooks/useAutomationState";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useProviderReconnect } from "@/hooks/useProviderReconnect";
import { useCustomCurriculaState } from "@/hooks/useCustomCurriculaState";
import { useCurriculumLibraryState } from "@/hooks/useCurriculumLibraryState";
import { useCurriculumNavigationState } from "@/hooks/useCurriculumNavigationState";
import { useNotebookDocumentState } from "@/hooks/useNotebookDocumentState";
import { useNotebookRuntimeState } from "@/hooks/useNotebookRuntimeState";
import { usePendingChangesState } from "@/hooks/usePendingChangesState";
import { useProductSurfaceSelection } from "@/hooks/useProductSurfaceSelection";
import { useProviderConnection } from "@/hooks/useProviderConnection";
import { useSurfaceRoute } from "@/hooks/useSurfaceRoute";
import { useAccentColor } from "@/hooks/useAccentColor";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useProductGuiControl } from "@/hooks/useProductGuiControl";
import { useLocaleState } from "@/hooks/useLocaleState";
import { useViewportInsets } from "@/hooks/useViewportInsets";
import { LocaleProvider } from "@/lib/localeContext";
import { isExecutableBlock } from "@/lib/cellModel";
import { focusCurriculumRouteSection } from "@/components/curriculum/curriculumNavigation";
import { loadSharePackCurriculum } from "@/lib/sharePackOperations";
import { loadSystemDiagnosticExport } from "@/lib/systemDiagnostics";
import type { LearningArchiveMaterialization } from "@/lib/learningArchive";
import { lessonKeyFromRef, lessonRefFromKey } from "@/lib/runRouteState";
import { providerProfileReady } from "@/lib/providerProfile";
import {
  reconnectVariantForSurface,
  type ReconnectVariant,
} from "@/lib/providerReconnectPolicy";
import { WidgetSessionProvider } from "@/lib/widgetSession";
import { isPublishedAppPage } from "@/lib/serverPublication";
import {
  installBlockEmbedFrameBridge,
  resolveBlockEmbedFrameConfig,
} from "@/embed/embedFrameBridge";
import {
  installBrowserPythonRuntimeDiagnostics,
  scheduleBrowserPythonRuntimeWarm,
} from "@/lib/browserPythonRuntime";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import type {
  AppNotice,
  CodaroDocument,
  LoadState,
} from "@/types";

const CURRICULUM_HOME_ROUTE = "__curriculum-home__";

function App() {
  const publishedAppPage = isPublishedAppPage();
  const blockEmbedFrame = useRef(resolveBlockEmbedFrameConfig()).current;
  const [surface, setSurface, runRouteState, navigateRunRoute, routeRestoreRevision] = useSurfaceRoute();
  const initialRouteLesson = lessonRefFromKey(runRouteState.lessonKey);
  const initialCurriculumSelection = useRef(
    initialRouteLesson ?? (surface === "curriculum"
      ? { category: initialBootstrapState.selectedCategory, contentId: "" }
      : null),
  ).current;
  const restoringLessonKeyRef = useRef<string | null>(null);
  const localeState = useLocaleState();
  const viewportInsets = useViewportInsets();
  useEffect(() => {
    const root = window.document.documentElement;
    root.dataset.keyboardOpen = viewportInsets.isKeyboardOpen ? "true" : "false";
    root.style.setProperty("--keyboard-height", `${viewportInsets.keyboardHeight}px`);
  }, [viewportInsets.isKeyboardOpen, viewportInsets.keyboardHeight]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("codaroBrowserRuntimeDiagnostics")) return undefined;
    return installBrowserPythonRuntimeDiagnostics();
  }, []);

  useEffect(() => (
    blockEmbedFrame ? installBlockEmbedFrameBridge(blockEmbedFrame) : undefined
  ), [blockEmbedFrame]);

  const { setDesignSurface } = useCodaroDesign();
  useEffect(() => {
    if (surface === "home") setDesignSurface("automation");
    else if (surface === "curriculum") setDesignSurface("curriculum");
    else if (surface === "editor") setDesignSurface("notebook");
    else if (surface === "automation") setDesignSurface("automation");
    else setDesignSurface("chat");
  }, [setDesignSurface, surface]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [serverAppMode, setServerAppMode] = useState<boolean | null>(publishedAppPage ? true : null);
  const [appPreviewOpen, setAppPreviewOpen] = useState(false);
  const [notebookDocumentPath, setNotebookDocumentPath] = useState<string | null>(null);
  // apiOnline 은 부트스트랩 1회가 아니라 라이브 연결 스토어가 소유한다(세션 중간 끊김 감지).
  const connection = useConnectionStatus();
  const apiOnline = connection.apiOnline;
  // 첫 페인트 뒤 idle에 브라우저 파이썬 런타임을 미리 올린다. Web Run 여부 판정은
  // 런타임 모듈이 소유하므로(Local Studio에서는 스스로 no-op) 여기서는 예약만 한다.
  useEffect(() => scheduleBrowserPythonRuntimeWarm(), []);
  const [notice, setNotice] = useState<AppNotice>(initialAppNotice);
  const applyNotice = useCallback((nextNotice: AppNotice) => {
    setNotice((currentNotice) =>
      shouldKeepCurrentNotice(currentNotice, nextNotice) ? currentNotice : nextNotice,
    );
  }, []);
  const {
    addNotebookCell,
    applyDraftUpdates,
    applyNotebookDocument,
    deleteNotebookCell,
    document,
    drafts,
    duplicateNotebookCell,
    loadNotebookDocument,
    moveNotebookCell,
    persistence: notebookPersistence,
    renameNotebookDocument,
    replaceDocument,
    selectedBlockId,
    selectBlock,
    updateDraft,
    updateNotebookApp,
  } = useNotebookDocumentState({
    localDocumentPath: notebookDocumentPath,
    persistenceEnabled: loadState === "ready",
    retryKey: apiOnline,
  });
  const {
    applyBootstrapCurriculumState,
    applyCurriculumDraftUpdates,
    applyCurriculumSelectionState,
    applyImportedLearningArchiveState,
    categories,
    categoryGroups,
    categoryTree,
    contents,
    contentsLoading,
    curriculumDocument,
    curriculumDrafts,
    referenceLoading,
    restoreCurriculumRouteState,
    selectCurriculumCategoryState,
    selectCurriculumContentState,
    selectCurriculumLessonState,
    selectedCategory,
    selectedContentId,
    selectedCurriculumBlockId,
    setSelectedCurriculumBlockId,
    updateCurriculumDraft,
  } = useCurriculumLibraryState({
    initialSelection: initialCurriculumSelection,
    onNotice: applyNotice,
  });

  useEffect(() => {
    if (surface !== "curriculum") {
      restoringLessonKeyRef.current = null;
      return;
    }
    const routeLesson = lessonRefFromKey(runRouteState.lessonKey);
    if (!routeLesson) {
      if (!selectedContentId) {
        restoringLessonKeyRef.current = null;
        return;
      }
      restoringLessonKeyRef.current = CURRICULUM_HOME_ROUTE;
      restoreCurriculumRouteState({ category: selectedCategory, contentId: "" });
      return;
    }
    const selectedLessonKey = lessonKeyFromRef(selectedCategory, selectedContentId);
    if (selectedLessonKey === runRouteState.lessonKey) {
      restoringLessonKeyRef.current = null;
      return;
    }
    restoringLessonKeyRef.current = runRouteState.lessonKey;
    restoreCurriculumRouteState(routeLesson);
  }, [restoreCurriculumRouteState, routeRestoreRevision, runRouteState.lessonKey, surface]);

  useEffect(() => {
    if (surface !== "curriculum") return;
    if (restoringLessonKeyRef.current === CURRICULUM_HOME_ROUTE) {
      if (!selectedContentId) restoringLessonKeyRef.current = null;
      return;
    }
    const selectedLessonKey = lessonKeyFromRef(selectedCategory, selectedContentId);
    if (!selectedLessonKey) return;
    if (restoringLessonKeyRef.current) {
      if (restoringLessonKeyRef.current === selectedLessonKey) restoringLessonKeyRef.current = null;
      return;
    }
    const lessonChanged = runRouteState.lessonKey !== selectedLessonKey;
    navigateRunRoute({
      lessonKey: selectedLessonKey,
      sectionId: lessonChanged ? null : runRouteState.sectionId,
    }, "replace");
  }, [navigateRunRoute, runRouteState.lessonKey, runRouteState.sectionId, selectedCategory, selectedContentId, surface]);

  const suppressedCurriculumRouteFocusRef = useRef<string | null>(null);

  useEffect(() => {
    if (surface !== "curriculum" || !runRouteState.sectionId || !curriculumDocument) return;
    if (!curriculumDocument.blocks.some((block) => block.id === runRouteState.sectionId)) return;
    setSelectedCurriculumBlockId(runRouteState.sectionId);
    if (suppressedCurriculumRouteFocusRef.current === runRouteState.sectionId) {
      suppressedCurriculumRouteFocusRef.current = null;
      return;
    }
    focusCurriculumRouteSection(runRouteState.sectionId);
  }, [curriculumDocument, routeRestoreRevision, runRouteState.sectionId, setSelectedCurriculumBlockId, surface]);

  const activateCurriculumBlock = useCallback((blockId: string) => {
    setSelectedCurriculumBlockId(blockId);
    suppressedCurriculumRouteFocusRef.current = blockId;
    navigateRunRoute({ sectionId: blockId }, "replace");
  }, [navigateRunRoute, setSelectedCurriculumBlockId]);

  const selectCurriculumRouteBlock = useCallback((blockId: string) => {
    setSelectedCurriculumBlockId(blockId);
    navigateRunRoute({ sectionId: blockId }, "replace");
  }, [navigateRunRoute, setSelectedCurriculumBlockId]);

  const navigateCurriculumSelection = useCallback((category: string, contentId: string) => {
    const lessonKey = lessonKeyFromRef(category, contentId);
    if (!lessonKey) {
      if (!contentId) {
        navigateRunRoute({
          surface: "curriculum",
          lessonKey: null,
          sectionId: null,
          documentId: null,
          taskId: null,
        }, "push");
      }
      return;
    }
    navigateRunRoute((current) => ({
      surface: "curriculum",
      lessonKey,
      sectionId: current.lessonKey === lessonKey ? current.sectionId : null,
      documentId: null,
      taskId: null,
    }), "push");
  }, [navigateRunRoute]);
  const {
    customCurricula,
    findCustomCurriculum,
    removeCustomCurriculumEntry,
    saveCustomCurriculumDocumentEntry,
    saveCustomCurriculumEntry,
    selectedCustomCurriculumId,
    setSelectedCustomCurriculumId,
  } = useCustomCurriculaState({
    initialSelectedCustomCurriculumId: initialBootstrapState.selectedCustomCurriculumId,
    onNotice: applyNotice,
  });
  const [toolCatalog, setToolCatalog] = useState(initialBootstrapState.toolCatalog);
  const { resolvedTheme, setThemeMode, themeMode, toggleThemeMode } = useThemeMode();
  const { accentColor, selectAccentColor } = useAccentColor();
  const [sidebarOpen, setSidebarOpen] = useState(() => surface !== "editor");
  const [notebookToolsOpen, setNotebookToolsOpen] = useState(false);
  useEffect(() => {
    if (surface !== "editor") return;
    setSidebarOpen(false);
    setNotebookToolsOpen(false);
  }, [surface]);
  const {
    auditCount,
    automationSection,
    confirmTaskSafety,
    eStop,
    refreshAutomation,
    runTask,
    scheduler,
    setAutomationSection,
    tasks,
    toggleTask,
    toggleEStop,
  } = useAutomationState({ apiOnline, onNotice: applyNotice });
  const {
    aiConnecting,
    aiProfile,
    connectProvider: connectAiProvider,
    logoutOauthProvider,
    providerValidation,
    providerSettingsOpen,
    saveApiProvider,
    selectAiProvider,
    setAiProfile,
    setProviderSettingsOpen,
    startOauthProviderLogin,
    validateAiProvider,
  } = useProviderConnection({ apiOnline, onNotice: applyNotice });

  useEffect(() => {
    if (surface === "curriculum" && providerSettingsOpen) {
      setProviderSettingsOpen(false);
    }
  }, [providerSettingsOpen, setProviderSettingsOpen, surface]);

  const providerReady = providerProfileReady(aiProfile);
  const reconnect = useProviderReconnect({
    apiOnline,
    appReady: loadState === "ready",
    initialized: connection.initialized,
    lastDropAt: connection.lastDropAt,
    phase: connection.phase,
    providerReady,
  });
  const visibleReconnectVariant = reconnectVariantForSurface(surface, reconnect.variant);
  const handleReconnectAction = useCallback((variant: ReconnectVariant) => {
    if (variant === "offline") {
      connection.probeNow();
    } else {
      void connectAiProvider();
    }
  }, [connection, connectAiProvider]);

  const {
    filteredCategories,
    deleteCustomCurriculum,
    openCustomCurriculum,
    query,
    saveCustomCurriculum,
    selectCustomCurriculum,
    selectCurriculumCategory,
    selectCurriculumContent,
    selectCurriculumLesson,
    setQuery,
    sidebarCustomCurricula,
  } = useCurriculumNavigationState({
    applyCurriculumSelectionState,
    categories,
    customCurricula,
    findCustomCurriculum,
    removeCustomCurriculumEntry,
    saveCustomCurriculumEntry,
    selectCurriculumCategoryState,
    selectCurriculumContentState,
    selectCurriculumLessonState,
    selectedCustomCurriculumId,
    setSelectedCustomCurriculumId,
    setSurface,
    onNavigateCurriculum: navigateCurriculumSelection,
    onNotice: applyNotice,
  });

  const activeDocument = surface === "curriculum" && curriculumDocument ? curriculumDocument : document;
  const activeDrafts = surface === "curriculum" ? curriculumDrafts : drafts;
  const activeSelectedBlockId = surface === "curriculum" ? selectedCurriculumBlockId : selectedBlockId;
  const selectedBlock = activeDocument.blocks.find((block) => block.id === activeSelectedBlockId) ?? activeDocument.blocks.find(isExecutableBlock) ?? activeDocument.blocks[0];
  const {
    canRun,
    cleanupCellDefinitions,
    currentResult,
    diagnostics,
    notebookRunning,
    reactiveEnabled,
    resetRuntimeState,
    results,
    runBlock,
    runNotebook,
    runningBlockId,
    sessionId,
    setSessionId,
    setUiValue,
    staleBlockIds,
    toggleReactive,
    variables,
  } = useNotebookRuntimeState({
    apiOnline,
    document: activeDocument,
    drafts: activeDrafts,
    onNotice: applyNotice,
    selectNotebookBlock: selectBlock,
    selectedBlock,
    sourcePath: surface === "editor" ? notebookDocumentPath : null,
    surface,
  });
  const {
    acceptPendingBlocks,
    clearPendingChanges,
    pendingBlocks,
    rejectPendingBlocks,
    setPendingBlocks,
    setPendingTarget,
  } = usePendingChangesState({
    applyCurriculumDraftUpdates,
    applyDraftUpdates,
    document,
    openCurriculum: openCustomCurriculum,
    replaceDocument,
    saveCurriculum: saveCustomCurriculum,
    selectNotebookBlock: selectBlock,
    setSurface,
    onNotice: applyNotice,
  });

  const openProviderSettingsFromFailure = useCallback(() => {
    if (apiOnline) setProviderSettingsOpen(true);
  }, [apiOnline, setProviderSettingsOpen]);

  const applyDocument = useCallback((nextDocument: CodaroDocument) => {
    applyNotebookDocument(nextDocument);
    resetRuntimeState();
    clearPendingChanges();
  }, [applyNotebookDocument, clearPendingChanges, resetRuntimeState]);

  const loadDocument = useCallback((nextDocument: CodaroDocument) => {
    loadNotebookDocument(nextDocument);
    resetRuntimeState();
    clearPendingChanges();
  }, [clearPendingChanges, loadNotebookDocument, resetRuntimeState]);

  const applyLearningArchive = useCallback(async (archive: LearningArchiveMaterialization) => {
    const selection = await applyImportedLearningArchiveState(archive);
    resetRuntimeState();
    clearPendingChanges();
    navigateRunRoute({
      surface: "curriculum",
      lessonKey: `${selection.category}/${selection.contentId}`,
      sectionId: archive.document.blocks.find(isExecutableBlock)?.id ?? archive.document.blocks[0]?.id ?? null,
      documentId: archive.document.id,
      taskId: null,
    }, "replace");
  }, [applyImportedLearningArchiveState, clearPendingChanges, navigateRunRoute, resetRuntimeState]);

  useAppBootstrapEffect({
    applyBootstrapCurriculumState,
    loadDocument,
    onDocumentPath: setNotebookDocumentPath,
    onAppMode: setServerAppMode,
    onLoadState: setLoadState,
    onNotice: applyNotice,
    onProfile: setAiProfile,
    onSessionId: setSessionId,
    onToolCatalog: setToolCatalog,
    refreshAutomation,
  });

  // 끊겼다가 다시 연결되면(offline→online) 자동화 스냅샷을 한 번 새로고침해 멈춰 있던 상태를 회복한다.
  const apiOnlinePrevRef = useRef(apiOnline);
  useEffect(() => {
    if (!publishedAppPage && !apiOnlinePrevRef.current && apiOnline) {
      void refreshAutomation();
    }
    apiOnlinePrevRef.current = apiOnline;
  }, [apiOnline, publishedAppPage, refreshAutomation]);

  const openSharePackCurriculum = useCallback(async (packId: string, path: string, version?: string | null) => {
    const payload = await loadSharePackCurriculum(packId, path, version);
    const entry = saveCustomCurriculumDocumentEntry(payload.document, payload.document.title);
    openCustomCurriculum(entry, { showNotice: true });
  }, [
    openCustomCurriculum,
    saveCustomCurriculumDocumentEntry,
  ]);

  const {
    askAssistant,
    askCellAssistant,
    assistantLoading,
    cellHelpByBlockId,
    messages,
    prompt,
    setPrompt,
    startNewChat,
  } = useAssistantTurnState({
    activeDocument,
    apiOnline,
    applyDocument,
    currentResult,
    drafts: activeDrafts,
    profile: aiProfile,
    results,
    openCurriculum: openCustomCurriculum,
    saveCurriculum: saveCustomCurriculum,
    selectedBlock,
    selectCurriculumBlock: selectCurriculumRouteBlock,
    selectNotebookBlock: selectBlock,
    sessionId,
    setPendingBlocks,
    setPendingTarget,
    setSurface,
    surface,
    toolCatalog,
    variables,
    displayLocale: localeState.locale,
    onNotice: applyNotice,
    onProviderConnectionRequired: openProviderSettingsFromFailure,
  });

  const {
    selectAutomationSection,
    selectSurface,
  } = useProductSurfaceSelection({
    categories,
    selectedCategory,
    selectCurriculumCategory,
    setAutomationSection,
    setSurface,
  });

  const copyDiagnosticExport = useCallback(async () => {
    const payload = await loadSystemDiagnosticExport();
    await writeClipboardText(JSON.stringify(payload, null, 2));
  }, []);

  const [terminalOpen, setTerminalOpen] = useState(false);
  const toggleTerminal = useCallback(() => {
    setTerminalOpen((current) => !current);
  }, []);

  useEffect(() => {
    if (surface === "curriculum") setTerminalOpen(false);
  }, [surface]);

  useProductGuiControl({
    accentColor,
    addNotebookCell,
    apiOnline,
    askAssistant,
    assistantLoading,
    auditCount,
    automationSection,
    cleanupCellDefinitions,
    curriculumDocument,
    deleteNotebookCell,
    document,
    drafts,
    duplicateNotebookCell,
    eStop,
    loadState,
    messages,
    moveNotebookCell,
    notebookPersistence,
    notebookRunning,
    notebookToolsOpen,
    notebookDocumentPath,
    notice,
    prompt,
    publicationTarget: diagnostics.capability?.runtimeTarget ?? null,
    reactiveEnabled,
    referenceLoading,
    refreshAutomation,
    renameNotebookDocument,
    resolvedTheme,
    results,
    runBlock,
    runNotebook,
    runRouteState,
    runTask,
    runningBlockId,
    scheduler,
    selectAccentColor,
    selectAutomationSection,
    selectBlock,
    selectCurriculumLesson,
    selectCurriculumRouteBlock,
    selectedBlockId,
    selectedCategory,
    selectedContentId,
    selectedCurriculumBlockId,
    selectSurface,
    setNotebookToolsOpen,
    setPrompt,
    setSidebarOpen,
    setTerminalOpen,
    setThemeMode,
    sidebarOpen,
    staleBlockIds,
    surface,
    tasks,
    terminalOpen,
    themeMode,
    toggleEStop,
    toggleReactive,
    toggleTask,
    updateDraft,
    viewportInsets,
  });

  const appProjectionMode = serverAppMode
    ? "server"
    : appPreviewOpen
      ? "preview"
      : null;
  const runEmbedEntry = useCallback(async (blockId: string, code: string) => {
    if (blockEmbedFrame?.mode !== "editable") return;
    const block = document.blocks.find((candidate) => candidate.id === blockId);
    if (!block || !isExecutableBlock(block)) return;
    updateDraft(blockId, code);
    await runBlock(block, code);
  }, [blockEmbedFrame, document.blocks, runBlock, updateDraft]);
  const appExecutionSignature = JSON.stringify({
    documentId: document.id,
    packages: document.runtime?.packages ?? [],
    blocks: document.blocks
      .filter((block) => isExecutableBlock(block) || block.type === "markdown")
      .map((block) => [block.id, drafts[block.id] ?? block.content]),
  });
  const lastAutomaticAppRunRef = useRef<string | null>(null);
  const runNotebookRef = useRef(runNotebook);
  const appExecutionBlocked = document.app?.statePolicy === "shared";
  useEffect(() => {
    runNotebookRef.current = runNotebook;
  }, [runNotebook]);
  useEffect(() => {
    if (!appProjectionMode || appExecutionBlocked || loadState !== "ready") return;
    if (lastAutomaticAppRunRef.current === appExecutionSignature) return;
    lastAutomaticAppRunRef.current = appExecutionSignature;
    void runNotebookRef.current();
  }, [appExecutionBlocked, appExecutionSignature, appProjectionMode, loadState]);

  if (serverAppMode === null) {
    return (
      <div
        aria-busy="true"
        className="grid h-svh place-items-center bg-background text-sm text-muted-foreground"
        data-app-bootstrap-pending="true"
        role="status"
      >
        Codaro를 여는 중입니다
      </div>
    );
  }

  if (appProjectionMode) {
    return (
      <LocaleProvider value={localeState}>
        <WidgetSessionProvider
          sessionId={sessionId}
          onUiValueChange={({ blockId, elementId, value }) => setUiValue(blockId ?? "", elementId, value)}
        >
          <AppProjection
            deploymentTarget={appProjectionMode === "preview" ? diagnostics.capability?.runtimeTarget ?? null : null}
            document={document}
            drafts={drafts}
            embedMode={blockEmbedFrame?.mode}
            mode={appProjectionMode}
            notebookRunning={notebookRunning}
            onDraftChange={blockEmbedFrame?.mode === "editable" ? updateDraft : undefined}
            onExitPreview={appProjectionMode === "preview" ? () => setAppPreviewOpen(false) : undefined}
            onRunEntry={blockEmbedFrame?.mode === "editable" ? runEmbedEntry : undefined}
            onUpdateApp={appProjectionMode === "preview" ? updateNotebookApp : undefined}
            results={results}
            staleBlockIds={staleBlockIds}
            sourcePath={appProjectionMode === "preview" ? notebookDocumentPath : null}
          />
        </WidgetSessionProvider>
      </LocaleProvider>
    );
  }

  return (
    <LocaleProvider value={localeState}>
    <WidgetSessionProvider
      sessionId={sessionId}
      onUiValueChange={({ blockId, elementId, value }) => setUiValue(blockId ?? "", elementId, value)}
    >
    <SidebarProvider
      data-active-product-surface={surface}
      data-run-route-lesson-key={runRouteState.lessonKey ?? undefined}
      data-run-route-path={runRouteState.pathId ?? undefined}
      data-run-route-runtime={runRouteState.runtimeTier}
      data-run-route-section={runRouteState.sectionId ?? undefined}
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
    >
      <ProductSidebar
        categories={filteredCategories}
        categoryGroups={categoryGroups}
        categoryTree={categoryTree}
        contentsLoading={contentsLoading}
        contents={contents}
        customCurricula={sidebarCustomCurricula}
        learningDocument={curriculumDocument}
        learningDrafts={curriculumDrafts}
        query={query}
        referenceLoading={referenceLoading}
        runtimeTier={runRouteState.runtimeTier}
        selectedAutomationSection={automationSection}
        surface={surface}
        selectedCategory={selectedCategory}
        selectedCustomCurriculumId={selectedCustomCurriculumId}
        selectedContentId={selectedContentId}
        themeMode={themeMode}
        accentColor={accentColor}
        aiConnecting={aiConnecting}
        onQueryChange={setQuery}
        onConnectProvider={connectAiProvider}
        onSelectAutomationSection={selectAutomationSection}
        onSelectCategory={selectCurriculumCategory}
        onSelectContent={selectCurriculumContent}
        onSelectCustomCurriculum={selectCustomCurriculum}
        onDeleteCustomCurriculum={deleteCustomCurriculum}
        onImportLearningArchive={applyLearningArchive}
        onSurfaceChange={selectSurface}
        onToggleTheme={toggleThemeMode}
        onSelectAccentColor={selectAccentColor}
        terminalOpen={terminalOpen}
        onToggleTerminal={toggleTerminal}
      />

      <SidebarInset className="relative flex h-svh min-h-0 min-w-0 flex-col overflow-clip">
        <div
          className={surface === "editor"
            ? "relative h-12 shrink-0 bg-background"
            : "relative h-9 shrink-0 bg-background"}
          data-top-control-lane="true"
        >
          <TopControls
            notebookToolsOpen={notebookToolsOpen}
            notebookTitle={surface === "editor" ? document.title : undefined}
            notice={notice}
            resolvedTheme={resolvedTheme}
            showSidebarTrigger
            surface={surface}
            onCopyDiagnosticExport={copyDiagnosticExport}
            onRenameNotebook={renameNotebookDocument}
            onPreviewApp={() => setAppPreviewOpen(true)}
            onToggleTheme={toggleThemeMode}
            onToggleNotebookTools={() => setNotebookToolsOpen((current) => !current)}
          />
        </div>
        <div className="min-h-0 flex-1">
            <MainSurface
              aiConnecting={aiConnecting}
              aiProfile={aiProfile}
              apiOnline={apiOnline}
              auditCount={auditCount}
              automationSection={automationSection}
              assistantLoading={assistantLoading}
              canRun={canRun}
              cellHelpByBlockId={cellHelpByBlockId}
              categories={filteredCategories}
              contents={contents}
              curriculumDocument={curriculumDocument}
              diagnostics={diagnostics}
              document={document}
              drafts={activeDrafts}
              eStop={eStop}
              messages={messages}
              pendingBlocks={pendingBlocks}
              prompt={prompt}
              reactiveEnabled={reactiveEnabled}
              referenceLoading={referenceLoading}
              results={results}
              runtimeTier={runRouteState.runtimeTier}
              runningBlockId={runningBlockId}
              scheduler={scheduler}
              selectedCategory={selectedCategory}
              selectedBlockId={selectedBlockId}
              selectedCurriculumBlockId={selectedCurriculumBlockId}
              selectedContentId={selectedContentId}
              staleBlockIds={staleBlockIds}
              surface={surface}
              tasks={tasks}
              variables={variables}
              loadState={loadState}
              notebookToolsOpen={notebookToolsOpen}
              onAddCell={addNotebookCell}
              onAsk={askAssistant}
              onAcceptPendingBlocks={acceptPendingBlocks}
              onConnectAi={connectAiProvider}
              onCellAsk={askCellAssistant}
              onConfirmTaskSafety={confirmTaskSafety}
              onDraftChange={surface === "curriculum" ? updateCurriculumDraft : updateDraft}
              onDeleteCell={(blockId) => {
                cleanupCellDefinitions(blockId);
                deleteNotebookCell(blockId);
              }}
              onDuplicateCell={duplicateNotebookCell}
              onMoveCell={moveNotebookCell}
              onNewChat={startNewChat}
              onPromptChange={setPrompt}
              onRejectPendingBlocks={rejectPendingBlocks}
              onRefreshAutomation={refreshAutomation}
              onOpenSharePackCurriculum={openSharePackCurriculum}
              notebookRunning={notebookRunning}
              notebookPersistence={notebookPersistence}
              onRunBlock={runBlock}
              onRunNotebook={runNotebook}
              onRunTask={runTask}
              onSelectSurface={selectSurface}
              onToggleTask={toggleTask}
              onSelectBlock={selectBlock}
              onSelectCategory={selectCurriculumCategory}
              onNavigateCurriculumBlock={selectCurriculumRouteBlock}
              onSelectCurriculumBlock={activateCurriculumBlock}
              onSelectCurriculumLesson={selectCurriculumLesson}
              onToggleEStop={toggleEStop}
              onToggleReactive={toggleReactive}
            />
        </div>
        {visibleReconnectVariant ? (
          <ProviderReconnectBar
            variant={visibleReconnectVariant}
            busy={aiConnecting}
            onAction={handleReconnectAction}
            onDismiss={reconnect.dismiss}
          />
        ) : null}
        {terminalOpen && surface !== "curriculum" ? (
          <div className="h-72 min-h-0 shrink-0">
            <TerminalPanel
              themeMode={resolvedTheme}
              onClose={() => {
                setTerminalOpen(false);
              }}
            />
          </div>
        ) : null}
        <ProductMobileNav
          keyboardOpen={viewportInsets.isKeyboardOpen}
          runtimeTier={runRouteState.runtimeTier}
          surface={surface}
          onSurfaceChange={selectSurface}
        />
      </SidebarInset>

      {surface === "curriculum" ? null : (
        <ProviderSettingsSheet
          aiConnecting={aiConnecting}
          aiProfile={aiProfile}
          apiOnline={apiOnline}
          open={providerSettingsOpen}
          providerValidation={providerValidation}
          onOauthLogin={startOauthProviderLogin}
          onOauthLogout={logoutOauthProvider}
          onOpenChange={setProviderSettingsOpen}
          onSaveApiProvider={saveApiProvider}
          onSelectProvider={selectAiProvider}
          onValidateProvider={validateAiProvider}
        />
      )}
    </SidebarProvider>
    </WidgetSessionProvider>
    </LocaleProvider>
  );
}

const backgroundNoticeTitles = new Set(["커리큘럼 열림", "Curriculum opened"]);

function shouldKeepCurrentNotice(currentNotice: AppNotice, nextNotice: AppNotice) {
  const currentIsDiagnostic = currentNotice.tone === "warning" || currentNotice.tone === "error";
  const nextIsBackground =
    nextNotice.tone === "success" && backgroundNoticeTitles.has(nextNotice.title);
  return currentIsDiagnostic && nextIsBackground;
}

export default App;

async function writeClipboardText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "true");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  try {
    const copied = document.execCommand("copy");
    if (!copied) {
      throw new Error("clipboard copy failed");
    }
  } finally {
    document.body.removeChild(textArea);
  }
}
