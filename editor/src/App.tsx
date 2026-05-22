import { useCallback, useState } from "react";
import {
  initialAppNotice,
  initialBootstrapState,
} from "@/lib/appBootstrap";
import { MainSurface } from "@/components/app/mainSurface";
import { TopBar } from "@/components/app/topBar";
import { ProductSidebar } from "@/components/app/productSidebar";
import { ProviderSettingsSheet } from "@/components/assistant/providerSettingsSheet";
import type { AutomationSection } from "@/lib/surfaceModel";
import { useAppBootstrapEffect } from "@/hooks/useAppBootstrapEffect";
import { useAssistantTurnState } from "@/hooks/useAssistantTurnState";
import { useAutomationState } from "@/hooks/useAutomationState";
import { useCustomCurriculaState } from "@/hooks/useCustomCurriculaState";
import { useCurriculumLibraryState } from "@/hooks/useCurriculumLibraryState";
import { useCurriculumNavigationState } from "@/hooks/useCurriculumNavigationState";
import { useNotebookDocumentState } from "@/hooks/useNotebookDocumentState";
import { useNotebookRuntimeState } from "@/hooks/useNotebookRuntimeState";
import { usePendingChangesState } from "@/hooks/usePendingChangesState";
import { useProviderConnection } from "@/hooks/useProviderConnection";
import { useSurfaceRoute } from "@/hooks/useSurfaceRoute";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useLocaleState } from "@/hooks/useLocaleState";
import { codaroApi } from "@/lib/api";
import { LocaleProvider } from "@/lib/localeContext";
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
    document,
    drafts,
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
    saveCustomCurriculumEntry,
    selectCurriculumCategoryState,
    selectCurriculumContentState,
    setSelectedCustomCurriculumId,
    setSurface,
    onNotice: applyNotice,
  });

  const activeDocument = surface === "curriculum" && curriculumDocument ? curriculumDocument : document;
  const activeSelectedBlockId = surface === "curriculum" ? selectedCurriculumBlockId : selectedBlockId;
  const selectedBlock = activeDocument.blocks.find((block) => block.id === activeSelectedBlockId) ?? activeDocument.blocks.find((block) => block.type === "code") ?? activeDocument.blocks[0];
  const {
    canRun,
    currentResult,
    hasRunnableNotebook,
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
    replaceDocument,
    saveCurriculum: saveCustomCurriculum,
    selectNotebookBlock: selectBlock,
    setSurface,
    onNotice: applyNotice,
  });

  const applyDocument = useCallback((nextDocument: CodaroDocument) => {
    applyNotebookDocument(nextDocument);
    resetRuntimeState();
    clearPendingChanges();
  }, [applyNotebookDocument, clearPendingChanges, resetRuntimeState]);

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

  const copyDiagnosticExport = useCallback(async () => {
    const payload = await codaroApi.systemDiagnosticsExport();
    await writeClipboardText(JSON.stringify(payload, null, 2));
  }, []);

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
  });

  function selectAutomationSection(section: AutomationSection) {
    setAutomationSection(section);
    setSurface("automation");
  }

  return (
    <LocaleProvider value={localeState}>
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <ProductSidebar
        categories={filteredCategories}
        categoryGroups={categoryGroups}
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
        onSurfaceChange={setSurface}
        onToggleTheme={toggleThemeMode}
      />

      <SidebarInset className="grid h-svh min-h-0 min-w-0 grid-rows-[40px_minmax(0,1fr)] overflow-hidden">
        <TopBar
          assistantCollapsed={assistantCollapsed}
          canRun={canRun && hasRunnableNotebook}
          loadState={loadState}
          notice={notice}
          showSidebarTrigger={!sidebarOpen}
          surface={surface}
          notebookRunning={notebookRunning}
          onCopyDiagnosticExport={copyDiagnosticExport}
          onRunNotebook={runNotebook}
          onToggleAssistant={() => setAssistantCollapsed((current) => !current)}
        />

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
          onNewChat={startNewChat}
          onPromptChange={setPrompt}
          onRejectPendingBlocks={rejectPendingBlocks}
          onRefreshAutomation={refreshAutomation}
          onRunBlock={runBlock}
          onRunTask={runTask}
          onSelectBlock={selectBlock}
          onSelectCurriculumBlock={setSelectedCurriculumBlockId}
          onToggleAssistant={() => setAssistantCollapsed((current) => !current)}
          onToggleEStop={toggleEStop}
        />
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

async function writeClipboardText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textArea = globalThis.document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "true");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  globalThis.document.body.appendChild(textArea);
  textArea.select();
  try {
    globalThis.document.execCommand("copy");
  } finally {
    textArea.remove();
  }
}

export default App;
