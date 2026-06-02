import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialAppNotice,
  initialBootstrapState,
} from "@/lib/appBootstrap";
import { MainSurface } from "@/components/app/mainSurface";
import { ProductSidebar } from "@/components/app/productSidebar";
import { TopControls } from "@/components/app/topBar";
import { ProviderSettingsSheet } from "@/components/assistant/providerSettingsSheet";
import { TerminalPanel } from "@/components/terminal/terminalPanel";
import type { TerminalLaunchIntent } from "@/lib/terminalLaunch";
import { useAppBootstrapEffect } from "@/hooks/useAppBootstrapEffect";
import { useAssistantTurnState } from "@/hooks/useAssistantTurnState";
import { useAutomationState } from "@/hooks/useAutomationState";
import { useCustomCurriculaState } from "@/hooks/useCustomCurriculaState";
import { useCurriculumLibraryState } from "@/hooks/useCurriculumLibraryState";
import { useCurriculumNavigationState } from "@/hooks/useCurriculumNavigationState";
import { useNotebookDocumentState } from "@/hooks/useNotebookDocumentState";
import { useNotebookRuntimeState } from "@/hooks/useNotebookRuntimeState";
import { usePendingChangesState } from "@/hooks/usePendingChangesState";
import { useProductSurfaceSelection } from "@/hooks/useProductSurfaceSelection";
import { useProviderConnection } from "@/hooks/useProviderConnection";
import { useSurfaceRoute } from "@/hooks/useSurfaceRoute";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useLocaleState } from "@/hooks/useLocaleState";
import { useViewportInsets } from "@/hooks/useViewportInsets";
import { LocaleProvider } from "@/lib/localeContext";
import { isExecutableBlock } from "@/lib/cellModel";
import { loadSharePackCurriculum } from "@/lib/sharePackOperations";
import { loadSystemDiagnosticExport } from "@/lib/systemDiagnostics";
import { WidgetSessionProvider } from "@/lib/widgetSession";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import type {
  AppNotice,
  CodaroDocument,
  LoadState,
} from "@/types";

function App() {
  const localeState = useLocaleState();
  const viewportInsets = useViewportInsets();
  useEffect(() => {
    const root = window.document.documentElement;
    root.dataset.keyboardOpen = viewportInsets.isKeyboardOpen ? "true" : "false";
    root.style.setProperty("--keyboard-height", `${viewportInsets.keyboardHeight}px`);
  }, [viewportInsets.isKeyboardOpen, viewportInsets.keyboardHeight]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ blockIds?: string[]; sessionId?: string }>).detail;
      if (!detail || !Array.isArray(detail.blockIds)) return;
      const knownBlocks = activeDocumentRef.current.blocks;
      for (const blockId of detail.blockIds) {
        const target = knownBlocks.find((block) => block.id === blockId);
        if (target && isExecutableBlock(target)) {
          void runBlockRef.current?.(target);
        }
      }
    };
    window.addEventListener("codaro:reactive-trigger", handler);
    return () => window.removeEventListener("codaro:reactive-trigger", handler);
  }, []);
  const [surface, setSurface] = useSurfaceRoute();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [apiOnline, setApiOnline] = useState(initialBootstrapState.apiOnline);
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
    renameNotebookDocument,
    replaceDocument,
    selectedBlockId,
    selectBlock,
    updateDraft,
  } = useNotebookDocumentState();
  const {
    applyBootstrapCurriculumState,
    applyCurriculumSelectionState,
    categories,
    categoryGroups,
    categoryTree,
    contents,
    contentsLoading,
    curriculumDocument,
    referenceLoading,
    selectCurriculumCategoryState,
    selectCurriculumContentState,
    selectedCategory,
    selectedContentId,
    selectedCurriculumBlockId,
    setSelectedCurriculumBlockId,
  } = useCurriculumLibraryState({
    onDraftUpdates: applyDraftUpdates,
    onNotice: applyNotice,
  });
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
  const { themeMode, toggleThemeMode } = useThemeMode();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);
  const {
    auditCount,
    automationSection,
    eStop,
    refreshAutomation,
    runTask,
    scheduler,
    setAutomationSection,
    tasks,
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

  const {
    filteredCategories,
    deleteCustomCurriculum,
    openCustomCurriculum,
    query,
    saveCustomCurriculum,
    selectCustomCurriculum,
    selectCurriculumCategory,
    selectCurriculumContent,
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
    setSelectedCustomCurriculumId,
    setSurface,
    onNotice: applyNotice,
  });

  const activeDocument = surface === "curriculum" && curriculumDocument ? curriculumDocument : document;
  const activeSelectedBlockId = surface === "curriculum" ? selectedCurriculumBlockId : selectedBlockId;
  const selectedBlock = activeDocument.blocks.find((block) => block.id === activeSelectedBlockId) ?? activeDocument.blocks.find(isExecutableBlock) ?? activeDocument.blocks[0];
  const {
    canRun,
    currentResult,
    notebookRunning,
    resetRuntimeState,
    results,
    runBlock,
    runNotebook,
    runningBlockId,
    sessionId,
    setSessionId,
    variables,
  } = useNotebookRuntimeState({
    apiOnline,
    document: activeDocument,
    drafts,
    onNotice: applyNotice,
    selectCurriculumBlock: setSelectedCurriculumBlockId,
    selectNotebookBlock: selectBlock,
    selectedBlock,
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

  const activeDocumentRef = useRef(activeDocument);
  const runBlockRef = useRef(runBlock);
  useEffect(() => {
    activeDocumentRef.current = activeDocument;
    runBlockRef.current = runBlock;
  }, [activeDocument, runBlock]);

  useAppBootstrapEffect({
    applyBootstrapCurriculumState,
    applyDocument,
    onApiOnline: setApiOnline,
    onLoadState: setLoadState,
    onNotice: applyNotice,
    onProfile: setAiProfile,
    onSessionId: setSessionId,
    onToolCatalog: setToolCatalog,
    refreshAutomation,
  });

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
    drafts,
    profile: aiProfile,
    results,
    openCurriculum: openCustomCurriculum,
    saveCurriculum: saveCustomCurriculum,
    selectedBlock,
    selectCurriculumBlock: setSelectedCurriculumBlockId,
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
  const [terminalLaunchIntent, setTerminalLaunchIntent] = useState<TerminalLaunchIntent | null>(null);
  const openTerminalCommand = useCallback((command: string) => {
    setTerminalOpen(true);
    setTerminalLaunchIntent({ command, id: Date.now(), submit: true });
  }, []);

  return (
    <LocaleProvider value={localeState}>
    <WidgetSessionProvider sessionId={sessionId}>
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <ProductSidebar
        categories={filteredCategories}
        categoryGroups={categoryGroups}
        categoryTree={categoryTree}
        contentsLoading={contentsLoading}
        contents={contents}
        customCurricula={sidebarCustomCurricula}
        query={query}
        referenceLoading={referenceLoading}
        selectedAutomationSection={automationSection}
        surface={surface}
        selectedCategory={selectedCategory}
        selectedCustomCurriculumId={selectedCustomCurriculumId}
        selectedContentId={selectedContentId}
        themeMode={themeMode}
        aiConnecting={aiConnecting}
        onQueryChange={setQuery}
        onConnectProvider={connectAiProvider}
        onSelectAutomationSection={selectAutomationSection}
        onSelectCategory={selectCurriculumCategory}
        onSelectContent={selectCurriculumContent}
        onSelectCustomCurriculum={selectCustomCurriculum}
        onDeleteCustomCurriculum={deleteCustomCurriculum}
        onSurfaceChange={selectSurface}
        onToggleTheme={toggleThemeMode}
        terminalOpen={terminalOpen}
        onToggleTerminal={() => setTerminalOpen((current) => !current)}
      />

      <SidebarInset className="relative flex h-svh min-h-0 min-w-0 flex-col overflow-hidden">
        <TopControls
          assistantCollapsed={assistantCollapsed}
          notice={notice}
          showSidebarTrigger
          surface={surface}
          onCopyDiagnosticExport={copyDiagnosticExport}
          onToggleAssistant={() => setAssistantCollapsed((current) => !current)}
        />
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
              document={document}
              drafts={drafts}
              eStop={eStop}
              messages={messages}
              pendingBlocks={pendingBlocks}
              prompt={prompt}
              referenceLoading={referenceLoading}
              results={results}
              runningBlockId={runningBlockId}
              scheduler={scheduler}
              selectedCategory={selectedCategory}
              selectedBlockId={selectedBlockId}
              selectedCurriculumBlockId={selectedCurriculumBlockId}
              selectedContentId={selectedContentId}
              surface={surface}
              tasks={tasks}
              loadState={loadState}
              assistantCollapsed={assistantCollapsed}
              onAddCell={addNotebookCell}
              onAsk={askAssistant}
              onAcceptPendingBlocks={acceptPendingBlocks}
              onConnectAi={connectAiProvider}
              onCellAsk={askCellAssistant}
              onDraftChange={updateDraft}
              onDeleteCell={deleteNotebookCell}
              onNewChat={startNewChat}
              onOpenTerminalCommand={openTerminalCommand}
              onPromptChange={setPrompt}
              onRejectPendingBlocks={rejectPendingBlocks}
              onRefreshAutomation={refreshAutomation}
              onRenameDocument={renameNotebookDocument}
              onOpenSharePackCurriculum={openSharePackCurriculum}
              notebookRunning={notebookRunning}
              onRunBlock={runBlock}
              onRunNotebook={runNotebook}
              onRunTask={runTask}
              onSelectBlock={selectBlock}
              onSelectCategory={selectCurriculumCategory}
              onSelectCurriculumBlock={setSelectedCurriculumBlockId}
              onSelectCurriculumLesson={(category, contentId) => {
                selectCurriculumCategory(category);
                selectCurriculumContent(contentId);
              }}
              onToggleEStop={toggleEStop}
            />
        </div>
        {terminalOpen ? (
          <div className="h-72 min-h-0 shrink-0">
            <TerminalPanel
              launchIntent={terminalLaunchIntent}
              themeMode={themeMode}
              onClose={() => setTerminalOpen(false)}
            />
          </div>
        ) : null}
      </SidebarInset>

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
