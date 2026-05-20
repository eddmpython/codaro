import { useCallback, useMemo, useState } from "react";
import {
  initialAppNotice,
  initialBootstrapState,
} from "@/lib/appBootstrap";
import { MainSurface } from "@/components/app/mainSurface";
import { TopBar } from "@/components/app/topBar";
import { ProductSidebar, type SidebarCustomCurriculum } from "@/components/app/productSidebar";
import { ProviderSettingsSheet } from "@/components/assistant/providerSettingsSheet";
import {
  categorySubtitle,
  categoryTitle,
} from "@/lib/fallbackData";
import {
  buildCustomCurriculumApplication,
  type CustomCurriculumApplication,
} from "@/lib/customCurricula";
import {
  buildAcceptPendingChangesApplication,
  buildRejectPendingChangesApplication,
  type PendingChangesApplication,
} from "@/lib/pendingChanges";
import type { AutomationSection } from "@/lib/surfaceModel";
import type { PendingTarget } from "@/lib/assistantResponsePlan";
import { useAppBootstrapEffect } from "@/hooks/useAppBootstrapEffect";
import { useAssistantTurnState } from "@/hooks/useAssistantTurnState";
import { useAutomationState } from "@/hooks/useAutomationState";
import { useCustomCurriculaState } from "@/hooks/useCustomCurriculaState";
import { useCurriculumLibraryState } from "@/hooks/useCurriculumLibraryState";
import { useNotebookDocumentState } from "@/hooks/useNotebookDocumentState";
import { useNotebookRuntimeState } from "@/hooks/useNotebookRuntimeState";
import { useProviderConnection } from "@/hooks/useProviderConnection";
import { useSurfaceRoute } from "@/hooks/useSurfaceRoute";
import { useThemeMode } from "@/hooks/useThemeMode";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import type {
  AppNotice,
  BlockConfig,
  CodaroDocument,
  LoadState,
} from "@/types";

function App() {
  const [surface, setSurface] = useSurfaceRoute();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [apiOnline, setApiOnline] = useState(initialBootstrapState.apiOnline);
  const [notice, setNotice] = useState<AppNotice>(initialAppNotice);
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
    onNotice: setNotice,
  });
  const [pendingBlocks, setPendingBlocks] = useState<BlockConfig[]>([]);
  const [pendingTarget, setPendingTarget] = useState<PendingTarget>("notebook");
  const {
    customCurricula,
    findCustomCurriculum,
    saveCustomCurriculumEntry,
    selectedCustomCurriculumId,
    setSelectedCustomCurriculumId,
  } = useCustomCurriculaState({
    initialSelectedCustomCurriculumId: initialBootstrapState.selectedCustomCurriculumId,
    onNotice: setNotice,
  });
  const [toolCatalog, setToolCatalog] = useState(initialBootstrapState.toolCatalog);
  const [query, setQuery] = useState("");
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
  } = useAutomationState({ apiOnline, onNotice: setNotice });
  const {
    aiConnecting,
    aiProfile,
    connectProvider: connectAiProvider,
    logoutOauthProvider,
    providerSettingsOpen,
    saveApiProvider,
    selectAiProvider,
    setAiProfile,
    setProviderSettingsOpen,
    startOauthProviderLogin,
  } = useProviderConnection({ apiOnline, onNotice: setNotice });

  const filteredCategories = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return categories;
    return categories.filter((category) => {
      const label = `${category.name} ${category.description} ${categoryTitle(category.key)} ${categorySubtitle(category.key, category.description)} ${category.key}`;
      return label.toLowerCase().includes(trimmed);
    });
  }, [categories, query]);
  const sidebarCustomCurricula = useMemo<SidebarCustomCurriculum[]>(() => {
    return customCurricula.map((entry) => ({
      id: entry.id,
      title: entry.title,
      blockCount: entry.document.blocks.length,
      createdAt: entry.createdAt,
    }));
  }, [customCurricula]);

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
    document,
    drafts,
    onNotice: setNotice,
    selectCurriculumBlock: setSelectedCurriculumBlockId,
    selectNotebookBlock: selectBlock,
    selectedBlock,
    surface,
  });

  const applyDocument = useCallback((nextDocument: CodaroDocument) => {
    applyNotebookDocument(nextDocument);
    resetRuntimeState();
    setPendingBlocks([]);
    setPendingTarget("notebook");
  }, [applyNotebookDocument, resetRuntimeState]);

  useAppBootstrapEffect({
    applyBootstrapCurriculumState,
    applyDocument,
    onApiOnline: setApiOnline,
    onLoadState: setLoadState,
    onNotice: setNotice,
    onProfile: setAiProfile,
    onSessionId: setSessionId,
    onToolCatalog: setToolCatalog,
    refreshAutomation,
  });

  const {
    askAssistant,
    askCellAssistant,
    assistantLoading,
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
    onNotice: setNotice,
  });

  function saveCustomCurriculum(blocks: BlockConfig[], title?: string) {
    const entry = saveCustomCurriculumEntry(blocks, title);
    if (!entry) return null;
    applyCustomCurriculumApplication(buildCustomCurriculumApplication(entry, { showNotice: true }));
    return entry;
  }

  function applyCustomCurriculumApplication(application: CustomCurriculumApplication) {
    applyCurriculumSelectionState(application);
    setSelectedCustomCurriculumId(application.selectedCustomCurriculumId);
    setSurface(application.surfaceToOpen);
    if (application.notice) {
      setNotice(application.notice);
    }
  }

  function acceptPendingBlocks() {
    applyPendingChangesApplication(buildAcceptPendingChangesApplication({
      document,
      pendingBlocks,
      pendingTarget,
    }));
  }

  function rejectPendingBlocks() {
    applyPendingChangesApplication(buildRejectPendingChangesApplication(pendingBlocks));
  }

  function applyPendingChangesApplication(application: PendingChangesApplication | null) {
    if (!application) return;
    if (application.curriculumToSave) {
      saveCustomCurriculum(application.curriculumToSave.blocks, application.curriculumToSave.title);
    }
    if (application.documentToApply) {
      replaceDocument(application.documentToApply);
    }
    if (Object.keys(application.draftUpdates).length) {
      applyDraftUpdates(application.draftUpdates);
    }
    if (application.selectedBlockId) {
      selectBlock(application.selectedBlockId);
    }
    if (application.clearPendingBlocks) {
      setPendingBlocks([]);
    }
    setPendingTarget(application.pendingTarget);
    if (application.surfaceToOpen) {
      setSurface(application.surfaceToOpen);
    }
    if (application.notice) {
      setNotice(application.notice);
    }
  }

  function selectCurriculumCategory(key: string) {
    const selection = selectCurriculumCategoryState(key);
    setSelectedCustomCurriculumId(selection.selectedCustomCurriculumId);
    setSurface("curriculum");
  }

  function selectCurriculumContent(contentId: string) {
    const selection = selectCurriculumContentState(contentId);
    setSelectedCustomCurriculumId(selection.selectedCustomCurriculumId);
    setSurface("curriculum");
  }

  function selectCustomCurriculum(id: string) {
    const entry = findCustomCurriculum(id);
    if (!entry) return;
    applyCustomCurriculumApplication(buildCustomCurriculumApplication(entry));
  }

  function selectAutomationSection(section: AutomationSection) {
    setAutomationSection(section);
    setSurface("automation");
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <ProductSidebar
        categories={filteredCategories}
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
        onOauthLogin={startOauthProviderLogin}
        onOauthLogout={logoutOauthProvider}
        onOpenChange={setProviderSettingsOpen}
        onSaveApiProvider={saveApiProvider}
        onSelectProvider={selectAiProvider}
      />
    </SidebarProvider>
  );
}

export default App;
