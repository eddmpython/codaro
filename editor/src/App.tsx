import { useCallback, useMemo, useState } from "react";
import {
  initialAppNotice,
  initialBootstrapState,
} from "@/lib/appBootstrap";
import { MainSurface } from "@/components/app/mainSurface";
import { TopBar } from "@/components/app/topBar";
import { ProductSidebar, type SidebarCustomCurriculum } from "@/components/app/productSidebar";
import {
  aiProviderName,
  type AssistantMessage,
} from "@/components/assistant/assistantPanel";
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
  materializeDrafts,
} from "@/lib/documentModel";
import {
  buildLocalAssistantDraft,
  completeLocalAssistantDraft,
} from "@/lib/localFallback";
import {
  buildAcceptPendingChangesApplication,
  buildRejectPendingChangesApplication,
  type PendingChangesApplication,
} from "@/lib/pendingChanges";
import type { AutomationSection } from "@/lib/surfaceModel";
import { inferTeacherScope, type TeacherScope } from "@/lib/teacherScope";
import {
  buildCellAiPrompt,
  type CellAiAction,
} from "@/lib/cellModel";
import {
  buildAssistantContext,
} from "@/lib/assistantContext";
import {
  createAssistantPlaceholder,
  createUserMessage,
  failAssistantMessage,
  finalizeAssistantMessage,
} from "@/lib/assistantConversationState";
import { runAssistantProviderTurn } from "@/lib/assistantProviderTurn";
import {
  buildAssistantResponseApplication,
  mergePendingBlocks,
  type PendingTarget,
} from "@/lib/assistantResponsePlan";
import { providerAssistantFailure } from "@/lib/providerConnection";
import { useAppBootstrapEffect } from "@/hooks/useAppBootstrapEffect";
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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [teacherScope, setTeacherScope] = useState<TeacherScope>("cell");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [assistantLoading, setAssistantLoading] = useState(false);
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

  async function askAssistant(messageOverride?: string, scopeOverride?: TeacherScope) {
    const message = (messageOverride ?? prompt).trim();
    const activeScope = scopeOverride ?? inferTeacherScope(message, teacherScope);
    if (!message || assistantLoading) return;

    const userMessage = createUserMessage(message);
    setMessages((current) => [...current, userMessage]);
    setPrompt("");
    setAssistantLoading(true);

    if (!apiOnline) {
      const localDraft = buildLocalAssistantDraft(message, activeScope);
      const savedEntry = localDraft.shouldSaveCurriculum
        ? saveCustomCurriculum(localDraft.generatedBlocks)
        : null;
      if (localDraft.clearPendingBlocks) {
        setPendingBlocks([]);
        setPendingTarget("notebook");
      }
      const localResult = completeLocalAssistantDraft({
        draft: localDraft,
        message,
        savedTitle: savedEntry?.title,
        scope: activeScope,
      });
      setMessages((current) => [...current, localResult.assistantMessage]);
      setNotice(localResult.notice);
      setAssistantLoading(false);
      return;
    }

    const contextDocument = materializeDrafts(activeDocument, drafts);
    const context = buildAssistantContext({
      surface,
      activeScope,
      document: contextDocument,
      drafts,
      message,
      results,
      selectedBlock,
      currentResult: currentResult ?? null,
      variables,
      tools: toolCatalog.tools.map((tool) => ({
        name: tool.name,
        category: tool.category,
        lane: tool.lane,
        target: tool.target,
        risk: tool.risk,
      })),
    });

    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((current) => [
      ...current,
      createAssistantPlaceholder({
        id: assistantMessageId,
        provider: aiProviderName(aiProfile),
      }),
    ]);

    try {
      const { response, streamedContent } = await runAssistantProviderTurn({
        assistantMessageId,
        onConversationId: setConversationId,
        request: {
          conversationId,
          message,
          sessionId,
          role: "teacher",
          context,
        },
        updateMessages: setMessages,
      });
      setConversationId(response.conversationId);

      const application = buildAssistantResponseApplication({
        activeScope,
        message,
        response,
        saveCurriculum: saveCustomCurriculum,
      });
      if (application.documentToApply) {
        applyDocument(application.documentToApply);
      }
      if (application.surfaceToOpen) {
        setSurface(application.surfaceToOpen);
      }
      if (application.pendingBlocks.length) {
        setPendingBlocks((current) => mergePendingBlocks(current, application.pendingBlocks));
      }
      if (application.pendingTarget) {
        setPendingTarget(application.pendingTarget);
      }
      if (application.clearPendingBlocks) {
        setPendingBlocks([]);
      }
      setMessages((current) => finalizeAssistantMessage({
        assistantMessageId,
        messages: current,
        response,
        streamedContent,
      }));
      setNotice(application.notice);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      const failure = providerAssistantFailure(detail);
      setMessages((current) => failAssistantMessage({
        action: failure.action,
        assistantMessageId,
        content: failure.content,
        messages: current,
      }));
      setNotice(failure.notice);
    } finally {
      setAssistantLoading(false);
    }
  }

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

  function askCellAssistant(action: CellAiAction, block: BlockConfig) {
    if (surface === "curriculum") {
      setSelectedCurriculumBlockId(block.id);
    } else {
      selectBlock(block.id);
    }
    setTeacherScope("cell");
    void askAssistant(buildCellAiPrompt(action, block), "cell");
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
          onNewChat={() => {
            setConversationId(null);
            setMessages([]);
            setPrompt("");
          }}
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
