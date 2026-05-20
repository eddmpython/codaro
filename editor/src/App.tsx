import { useCallback, useEffect, useMemo, useState } from "react";
import {
  initialAppNotice,
  initialBootstrapState,
  loadAppBootstrapState,
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
  loadCurriculumContentsState,
  loadCurriculumLessonState,
  selectCategory,
  selectContent,
} from "@/lib/curriculumSelection";
import {
  buildCustomCurriculumApplication,
  type CustomCurriculumApplication,
  createCustomCurriculumEntry,
  customCurriculaStorageKey,
  loadCustomCurricula,
  upsertCustomCurriculumEntry,
  type CustomCurriculumEntry,
} from "@/lib/customCurricula";
import {
  draftsFromDocument,
  materializeDrafts,
  starterDocument,
} from "@/lib/documentModel";
import {
  fallbackAutomationSnapshot,
  loadAutomationSnapshot,
  runAutomationTask,
  toggleAutomationStop,
  type AutomationSnapshot,
} from "@/lib/automationState";
import {
  buildLocalAssistantDraft,
  completeLocalAssistantDraft,
} from "@/lib/localFallback";
import {
  resolveBlockRunCode,
  runNotebookBlock,
  runReactiveNotebook,
} from "@/lib/notebookRuntime";
import {
  buildAcceptPendingChangesApplication,
  buildRejectPendingChangesApplication,
  type PendingChangesApplication,
} from "@/lib/pendingChanges";
import type { AutomationSection, SurfaceMode, ThemeMode } from "@/lib/surfaceModel";
import { inferTeacherScope, type TeacherScope } from "@/lib/teacherScope";
import {
  blockLabel,
  buildCellAiPrompt,
  type CellAiAction,
} from "@/lib/cellModel";
import {
  buildAssistantContext,
  type ResultMap,
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
import { useProviderConnection } from "@/hooks/useProviderConnection";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import type {
  AppNotice,
  BlockConfig,
  CodaroDocument,
  EStopStatus,
  LoadState,
  SchedulerStatus,
  TaskDefinition,
  TaskListPayload,
  VariableInfo,
} from "@/types";

const initialAutomationSnapshot = fallbackAutomationSnapshot();

function initialSurfaceFromLocation(): SurfaceMode {
  const value = window.location.hash.replace(/^#/, "");
  if (value === "editor" || value === "curriculum" || value === "automation" || value === "chat") return value;
  return "chat";
}

function App() {
  const [surface, setSurface] = useState<SurfaceMode>(() => initialSurfaceFromLocation());
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [apiOnline, setApiOnline] = useState(initialBootstrapState.apiOnline);
  const [notice, setNotice] = useState<AppNotice>(initialAppNotice);
  const [categories, setCategories] = useState(initialBootstrapState.categories);
  const [contents, setContents] = useState(initialBootstrapState.contents);
  const [selectedCategory, setSelectedCategory] = useState(initialBootstrapState.selectedCategory);
  const [selectedContentId, setSelectedContentId] = useState(initialBootstrapState.selectedContentId);
  const [contentsLoading, setContentsLoading] = useState(false);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [document, setDocument] = useState<CodaroDocument>(starterDocument);
  const [curriculumDocument, setCurriculumDocument] = useState<CodaroDocument | null>(initialBootstrapState.curriculumDocument);
  const [selectedCurriculumBlockId, setSelectedCurriculumBlockId] = useState(initialBootstrapState.curriculumDocument?.blocks[0]?.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, string>>(
    draftsFromDocument(starterDocument),
  );
  const [pendingBlocks, setPendingBlocks] = useState<BlockConfig[]>([]);
  const [pendingTarget, setPendingTarget] = useState<PendingTarget>("notebook");
  const [customCurricula, setCustomCurricula] = useState<CustomCurriculumEntry[]>(() => loadCustomCurricula());
  const [selectedCustomCurriculumId, setSelectedCustomCurriculumId] = useState(initialBootstrapState.selectedCustomCurriculumId);
  const [selectedBlockId, setSelectedBlockId] = useState(starterDocument.blocks[1]?.id ?? starterDocument.blocks[0]?.id ?? "");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [variables, setVariables] = useState<VariableInfo[]>([]);
  const [results, setResults] = useState<ResultMap>({});
  const [runningBlockId, setRunningBlockId] = useState<string | null>(null);
  const [notebookRunning, setNotebookRunning] = useState(false);
  const [tasks, setTasks] = useState<TaskListPayload>(initialAutomationSnapshot.tasks);
  const [scheduler, setScheduler] = useState<SchedulerStatus>(initialAutomationSnapshot.scheduler);
  const [eStop, setEStop] = useState<EStopStatus>(initialAutomationSnapshot.eStop);
  const [auditCount, setAuditCount] = useState(initialAutomationSnapshot.auditCount);
  const [automationSection, setAutomationSection] = useState<AutomationSection>("codaro");
  const [toolCatalog, setToolCatalog] = useState(initialBootstrapState.toolCatalog);
  const [query, setQuery] = useState("");
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = window.localStorage.getItem("codaro-theme");
    return stored === "light" ? "light" : "dark";
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [teacherScope, setTeacherScope] = useState<TeacherScope>("cell");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [assistantLoading, setAssistantLoading] = useState(false);
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

  const applyDocument = useCallback((nextDocument: CodaroDocument) => {
    const nextDrafts = draftsFromDocument(nextDocument);
    const firstCodeBlock = nextDocument.blocks.find((block) => block.type === "code");

    setDocument(nextDocument);
    setDrafts(nextDrafts);
    setSelectedBlockId(firstCodeBlock?.id ?? nextDocument.blocks[0]?.id ?? "");
    setResults({});
    setVariables([]);
    setPendingBlocks([]);
    setPendingTarget("notebook");
  }, []);

  const addNotebookCell = useCallback((type: "code" | "markdown") => {
    const id = `${type}-${Date.now()}`;
    const nextBlock: BlockConfig = { id, type, content: "" };

    setDocument((current) => ({
      ...current,
      blocks: [...current.blocks, nextBlock],
    }));
    setDrafts((current) => ({ ...current, [id]: "" }));
    setSelectedBlockId(id);
  }, []);

  useEffect(() => {
    window.document.documentElement.classList.toggle("dark", themeMode === "dark");
    window.localStorage.setItem("codaro-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(customCurriculaStorageKey, JSON.stringify(customCurricula));
    } catch {
      setNotice({
        tone: "warning",
        title: "커리큘럼 저장 제한",
        detail: "브라우저 저장소에 나만의 커리큘럼을 기록하지 못했습니다.",
      });
    }
  }, [customCurricula]);

  useEffect(() => {
    if (window.location.hash !== `#${surface}`) {
      window.history.replaceState(null, "", `#${surface}`);
    }
  }, [surface]);

  const applyAutomationSnapshot = useCallback((snapshot: AutomationSnapshot) => {
    setTasks(snapshot.tasks);
    setScheduler(snapshot.scheduler);
    setEStop(snapshot.eStop);
    setAuditCount(snapshot.auditCount);
  }, []);

  const refreshAutomation = useCallback(async () => {
    applyAutomationSnapshot(await loadAutomationSnapshot());
  }, [applyAutomationSnapshot]);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setLoadState("loading");
      const bootstrap = await loadAppBootstrapState();
      if (cancelled) return;
      setApiOnline(bootstrap.apiOnline);
      setCategories(bootstrap.categories);
      setContents(bootstrap.contents);
      setCurriculumDocument(bootstrap.curriculumDocument);
      setToolCatalog(bootstrap.toolCatalog);
      setAiProfile(bootstrap.profile);
      if (bootstrap.sessionId) setSessionId(bootstrap.sessionId);
      if (bootstrap.documentToApply) applyDocument(bootstrap.documentToApply);
      if (bootstrap.notice) setNotice(bootstrap.notice);
      if (bootstrap.refreshAutomation) {
        await refreshAutomation();
      }
      if (!cancelled) setLoadState("ready");
    }

    void initialize().catch((error) => {
      if (cancelled) return;
      setLoadState("error");
      setNotice({
        tone: "error",
        title: "시작 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [applyDocument, refreshAutomation]);

  useEffect(() => {
    let cancelled = false;

    async function loadContents() {
      setContentsLoading(true);
      try {
        const result = await loadCurriculumContentsState(selectedCategory, selectedContentId);
        if (cancelled) return;
        if (result) {
          setContents(result.contents);
          setSelectedContentId(result.selectedContentId);
        }
      } finally {
        if (!cancelled) setContentsLoading(false);
      }
    }

    void loadContents();

    return () => {
      cancelled = true;
    };
  }, [selectedCategory, selectedContentId]);

  useEffect(() => {
    let cancelled = false;

    async function loadReferenceLesson() {
      setReferenceLoading(true);
      try {
        const result = await loadCurriculumLessonState(selectedCategory, selectedContentId);
        if (cancelled) return;
        if (result) {
          setCurriculumDocument(result.document);
          setDrafts((current) => ({
            ...current,
            ...result.draftUpdates,
          }));
          setSelectedCurriculumBlockId(result.selectedBlockId);
          setNotice(result.notice);
        }
      } finally {
        if (!cancelled) setReferenceLoading(false);
      }
    }

    void loadReferenceLesson();

    return () => {
      cancelled = true;
    };
  }, [applyDocument, selectedCategory, selectedContentId]);

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
  const codeBlocks = useMemo(() => document.blocks.filter((block) => block.type === "code"), [document.blocks]);
  const hasRunnableNotebook = codeBlocks.some((block) => (drafts[block.id] ?? block.content).trim());
  const selectedBlock = activeDocument.blocks.find((block) => block.id === activeSelectedBlockId) ?? activeDocument.blocks.find((block) => block.type === "code") ?? activeDocument.blocks[0];
  const currentResult = selectedBlock ? results[selectedBlock.id] : undefined;
  const canRun = apiOnline ? Boolean(sessionId) : true;

  async function runBlock(block: BlockConfig) {
    if (block.type !== "code") return;
    const code = resolveBlockRunCode(block, drafts, { emptySnippetFallback: surface === "curriculum" });
    if (surface === "curriculum") {
      setSelectedCurriculumBlockId(block.id);
    } else {
      setSelectedBlockId(block.id);
    }
    setRunningBlockId(block.id);
    setNotice({ tone: "default", title: "셀 실행 중", detail: blockLabel(block) });

    try {
      const outcome = await runNotebookBlock({
        apiOnline,
        block,
        code,
        localExecutionCount: Object.keys(results).length + 1,
        sessionId,
      });
      if (outcome.sessionId && outcome.sessionId !== sessionId) setSessionId(outcome.sessionId);
      if (outcome.result) {
        const result = outcome.result;
        setResults((current) => ({ ...current, [block.id]: result }));
      }
      if (outcome.variables) setVariables(outcome.variables);
      if (outcome.notice) setNotice(outcome.notice);
    } finally {
      setRunningBlockId(null);
    }
  }

  async function runNotebook() {
    const firstBlock = selectedBlock?.type === "code" ? selectedBlock : codeBlocks[0];
    if (!firstBlock) return;
    setNotice({ tone: "default", title: "노트북 실행 중", detail: document.title });
    setNotebookRunning(true);

    try {
      const outcome = await runReactiveNotebook({
        apiOnline,
        codeBlocks,
        document,
        drafts,
        firstBlock,
        previousVariables: variables,
        sessionId,
      });
      if (outcome.sessionId && outcome.sessionId !== sessionId) setSessionId(outcome.sessionId);
      if (outcome.results) setResults((current) => ({ ...current, ...outcome.results }));
      if (outcome.variables) setVariables(outcome.variables);
      if (outcome.notice) setNotice(outcome.notice);
    } finally {
      setNotebookRunning(false);
    }
  }

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

  async function toggleEStop() {
    try {
      const result = await toggleAutomationStop(eStop, apiOnline);
      setEStop(result.eStop);
      setNotice(result.notice);
      if (result.refresh) await refreshAutomation();
    } catch (error) {
      setNotice({
        tone: "error",
        title: "긴급 정지 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function runTask(task: TaskDefinition) {
    try {
      const result = await runAutomationTask(task, apiOnline);
      setNotice(result.notice);
      if (result.refresh) await refreshAutomation();
    } catch (error) {
      setNotice({
        tone: "error",
        title: "태스크 실행 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  function saveCustomCurriculum(blocks: BlockConfig[], title?: string) {
    if (!blocks.length) return null;
    const entry = createCustomCurriculumEntry(blocks, title);
    setCustomCurricula((current) => upsertCustomCurriculumEntry(current, entry));
    applyCustomCurriculumApplication(buildCustomCurriculumApplication(entry, { showNotice: true }));
    return entry;
  }

  function applyCustomCurriculumApplication(application: CustomCurriculumApplication) {
    setCurriculumDocument(application.document);
    setDrafts((current) => ({
      ...current,
      ...application.draftUpdates,
    }));
    setSelectedCategory(application.selectedCategory);
    setSelectedContentId(application.selectedContentId);
    setSelectedCustomCurriculumId(application.selectedCustomCurriculumId);
    setSelectedCurriculumBlockId(application.selectedBlockId);
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
      setDocument(application.documentToApply);
    }
    if (Object.keys(application.draftUpdates).length) {
      setDrafts((current) => ({
        ...current,
        ...application.draftUpdates,
      }));
    }
    if (application.selectedBlockId) {
      setSelectedBlockId(application.selectedBlockId);
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
      setSelectedBlockId(block.id);
    }
    setTeacherScope("cell");
    void askAssistant(buildCellAiPrompt(action, block), "cell");
  }

  function selectCurriculumCategory(key: string) {
    const selection = selectCategory(key);
    setSelectedCategory(selection.selectedCategory);
    setSelectedContentId(selection.selectedContentId);
    setSelectedCustomCurriculumId(selection.selectedCustomCurriculumId);
    setSurface("curriculum");
  }

  function selectCurriculumContent(contentId: string) {
    const selection = selectContent(contentId, selectedCategory);
    setSelectedCategory(selection.selectedCategory);
    setSelectedContentId(selection.selectedContentId);
    setSelectedCustomCurriculumId(selection.selectedCustomCurriculumId);
    setSurface("curriculum");
  }

  function selectCustomCurriculum(id: string) {
    const entry = customCurricula.find((item) => item.id === id);
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
        onToggleTheme={() => setThemeMode((current) => (current === "dark" ? "light" : "dark"))}
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
          onDraftChange={(blockId, value) => setDrafts((current) => ({ ...current, [blockId]: value }))}
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
          onSelectBlock={setSelectedBlockId}
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
