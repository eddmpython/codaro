import { useCallback, useEffect, useMemo, useState } from "react";
import { codaroApi, optional, shouldUseApi } from "@/lib/api";
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
  fallbackBootstrap,
  fallbackCategories,
  fallbackContents,
  fallbackLesson,
} from "@/lib/fallbackData";
import {
  defaultRegistrySelection,
  registryCategories,
  registryContents,
  registryLesson,
} from "@/lib/curriculaRegistry";
import {
  CUSTOM_CURRICULUM_CATEGORY,
  createCustomCurriculumEntry,
  customCurriculaStorageKey,
  loadCustomCurricula,
  type CustomCurriculumEntry,
} from "@/lib/customCurricula";
import {
  draftsFromDocument,
  materializeDrafts,
  starterDocument,
} from "@/lib/documentModel";
import { shortPath } from "@/lib/displayFormat";
import {
  fallbackAutomationSnapshot,
  loadAutomationSnapshot,
  runAutomationTask,
  toggleAutomationStop,
  type AutomationSnapshot,
} from "@/lib/automationState";
import {
  buildLocalAssistantAnswer,
  buildLocalBlocksFromPrompt,
  buildLocalExecutionResult,
  firstOutputLine,
} from "@/lib/localFallback";
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
  applyAssistantStreamEvent,
  createAssistantPlaceholder,
  createUserMessage,
  failAssistantMessage,
  finalizeAssistantMessage,
} from "@/lib/assistantConversationState";
import {
  assistantResponseNotice,
  buildAssistantResponsePlan,
  mergePendingBlocks,
} from "@/lib/assistantResponsePlan";
import {
  isProviderAuthError,
  loginOauthProvider,
  logoutOauthProvider as logoutOauthProviderAction,
  openProviderSettings,
  providerAuthFailureNotice,
  saveApiProvider as saveApiProviderAction,
  selectProvider,
  type ProviderActionResult,
} from "@/lib/providerConnection";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import type {
  AiProfile,
  AiToolCatalogPayload,
  AppNotice,
  BlockConfig,
  CodaroDocument,
  CurriculumCategory,
  CurriculumContentSummary,
  EStopStatus,
  ExecutionResult,
  LoadState,
  SchedulerStatus,
  TaskDefinition,
  TaskListPayload,
  VariableInfo,
} from "@/types";

type PendingTarget = "notebook" | "curriculum";

const emptyNotice: AppNotice = {
  tone: "default",
  title: "준비됨",
  detail: "Codaro에게 커리큘럼, 실습 셀, 검증 셀, 자동화를 요청하세요.",
};

const emptyToolCatalog: AiToolCatalogPayload = {
  groups: [],
  lanes: [],
  tools: [],
  grouped: {},
  byLane: {},
};

const builtInCurriculumCategories = registryCategories();
const defaultCurriculumSelection = defaultRegistrySelection();
const builtInCurriculumContents = registryContents(defaultCurriculumSelection.category);
const initialCurriculumDocument = registryLesson(
  defaultCurriculumSelection.category,
  defaultCurriculumSelection.contentId,
)?.document ?? null;
const initialAutomationSnapshot = fallbackAutomationSnapshot();

function initialSurfaceFromLocation(): SurfaceMode {
  const value = window.location.hash.replace(/^#/, "");
  if (value === "editor" || value === "curriculum" || value === "automation" || value === "chat") return value;
  return "chat";
}

function App() {
  const [surface, setSurface] = useState<SurfaceMode>(() => initialSurfaceFromLocation());
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [apiOnline, setApiOnline] = useState(false);
  const [notice, setNotice] = useState<AppNotice>(emptyNotice);
  const [categories, setCategories] = useState<CurriculumCategory[]>(
    builtInCurriculumCategories.categories.length ? builtInCurriculumCategories.categories : fallbackCategories.categories,
  );
  const [contents, setContents] = useState<CurriculumContentSummary[]>(
    builtInCurriculumContents.contents.length ? builtInCurriculumContents.contents : fallbackContents.contents,
  );
  const [selectedCategory, setSelectedCategory] = useState(defaultCurriculumSelection.category);
  const [selectedContentId, setSelectedContentId] = useState(defaultCurriculumSelection.contentId);
  const [contentsLoading, setContentsLoading] = useState(false);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [document, setDocument] = useState<CodaroDocument>(starterDocument);
  const [curriculumDocument, setCurriculumDocument] = useState<CodaroDocument | null>(initialCurriculumDocument);
  const [selectedCurriculumBlockId, setSelectedCurriculumBlockId] = useState(initialCurriculumDocument?.blocks[0]?.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, string>>(
    draftsFromDocument(starterDocument),
  );
  const [pendingBlocks, setPendingBlocks] = useState<BlockConfig[]>([]);
  const [pendingTarget, setPendingTarget] = useState<PendingTarget>("notebook");
  const [customCurricula, setCustomCurricula] = useState<CustomCurriculumEntry[]>(() => loadCustomCurricula());
  const [selectedCustomCurriculumId, setSelectedCustomCurriculumId] = useState("");
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
  const [toolCatalog, setToolCatalog] = useState<AiToolCatalogPayload>(emptyToolCatalog);
  const [aiProfile, setAiProfile] = useState<AiProfile | null>(null);
  const [aiConnecting, setAiConnecting] = useState(false);
  const [providerSettingsOpen, setProviderSettingsOpen] = useState(false);
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
      if (!shouldUseApi()) {
        setApiOnline(false);
        setCategories(builtInCurriculumCategories.categories.length ? builtInCurriculumCategories.categories : fallbackCategories.categories);
        setContents(builtInCurriculumContents.contents.length ? builtInCurriculumContents.contents : fallbackContents.contents);
        setCurriculumDocument(initialCurriculumDocument);
        setToolCatalog(emptyToolCatalog);
        setAiProfile({
          activeProvider: "provider 없음",
          activeModel: null,
          ready: false,
        });
        setNotice(emptyNotice);
        setLoadState("ready");
        return;
      }

      const health = await optional(codaroApi.health, { status: "offline" });
      if (cancelled) return;

      const [
        bootstrapResult,
        categoryResult,
        toolsResult,
        profileResult,
      ] = await Promise.all([
        optional(codaroApi.bootstrap, fallbackBootstrap),
        optional(codaroApi.curriculumCategories, builtInCurriculumCategories.categories.length ? builtInCurriculumCategories : fallbackCategories),
        optional(codaroApi.aiTools, emptyToolCatalog),
        optional(codaroApi.aiProfile, {}),
      ]);

      if (cancelled) return;

      setApiOnline(health.online && bootstrapResult.online);
      setCategories(categoryResult.data.categories.length ? categoryResult.data.categories : fallbackCategories.categories);
      setToolCatalog(toolsResult.data);
      setAiProfile(profileResult.data);
      if (health.online && bootstrapResult.online) {
        const sessionResult = await optional(() => codaroApi.createSession(), { sessionId: "", status: "offline" });
        if (!cancelled && sessionResult.data.sessionId) {
          setSessionId(sessionResult.data.sessionId);
        }
      }

      if (!cancelled && bootstrapResult.data.documentPath && bootstrapResult.online) {
        try {
          const loaded = await codaroApi.loadDocument(bootstrapResult.data.documentPath);
          applyDocument(loaded.document);
          setNotice({
            tone: "success",
            title: "노트북 불러옴",
            detail: shortPath(loaded.path),
          });
        } catch (error) {
          setNotice({
            tone: "warning",
            title: "노트북을 열 수 없음",
            detail: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (health.online) {
        await refreshAutomation();
      }

      if (!cancelled) {
        setLoadState("ready");
      }
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
      if (!selectedCategory) return;
      if (selectedCategory === CUSTOM_CURRICULUM_CATEGORY) {
        setContents([]);
        setContentsLoading(false);
        return;
      }
      setContentsLoading(true);
      try {
        const registryFallback = registryContents(selectedCategory);
        const fallback = registryFallback.contents.length
          ? registryFallback
          : selectedCategory === fallbackContents.category
            ? fallbackContents
            : { ...fallbackContents, category: selectedCategory, categoryName: categoryTitle(selectedCategory) };
        const result = shouldUseApi()
          ? await optional(() => codaroApi.curriculumContents(selectedCategory), fallback)
          : { data: fallback, online: false };
        if (cancelled) return;
        setContents(result.data.contents);
        if (result.data.contents.length && !result.data.contents.some((content) => content.contentId === selectedContentId)) {
          setSelectedContentId(result.data.contents[0].contentId);
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
      if (!selectedCategory || !selectedContentId) return;
      if (selectedCategory === CUSTOM_CURRICULUM_CATEGORY) {
        setReferenceLoading(false);
        return;
      }
      setReferenceLoading(true);
      try {
        const registryFallback = registryLesson(selectedCategory, selectedContentId);
        const lessonFallback = registryFallback ?? {
          ...fallbackLesson,
          category: selectedCategory,
          contentId: selectedContentId,
        };
        const result = shouldUseApi()
          ? await optional(() => codaroApi.curriculumLesson(selectedCategory, selectedContentId), lessonFallback)
          : { data: lessonFallback, online: false };
        if (cancelled) return;
        setCurriculumDocument(result.data.document);
        setDrafts((current) => ({
          ...current,
          ...Object.fromEntries(
            result.data.document.blocks
              .filter((block) => block.type === "code")
              .map((block) => [block.id, block.role === "snippet" ? "" : block.content]),
          ),
        }));
        setSelectedCurriculumBlockId(result.data.document.blocks[0]?.id ?? "");
        setNotice({
          tone: result.online ? "success" : "warning",
          title: "커리큘럼 열림",
          detail: result.data.document.title,
        });
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

  async function ensureSession() {
    if (sessionId) return sessionId;
    try {
      const created = await codaroApi.createSession();
      setSessionId(created.sessionId);
      return created.sessionId;
    } catch (error) {
      setNotice({
        tone: "error",
        title: "런타임 사용 불가",
        detail: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async function runBlock(block: BlockConfig) {
    if (block.type !== "code") return;
    const code = drafts[block.id] ?? (surface === "curriculum" && block.role === "snippet" ? "" : block.content);
    if (surface === "curriculum") {
      setSelectedCurriculumBlockId(block.id);
    } else {
      setSelectedBlockId(block.id);
    }
    setRunningBlockId(block.id);
    setNotice({ tone: "default", title: "셀 실행 중", detail: blockLabel(block) });

    if (!apiOnline) {
      await sleep(250);
      const result = buildLocalExecutionResult(block, code, Object.keys(results).length + 1);
      setResults((current) => ({ ...current, [block.id]: result }));
      setVariables(result.variables);
      setNotice({
        tone: "success",
        title: "셀 실행 완료",
        detail: firstOutputLine(result) || "출력 준비됨",
      });
      setRunningBlockId(null);
      return;
    }

    const activeSession = await ensureSession();
    if (!activeSession) {
      setRunningBlockId(null);
      return;
    }

    try {
      const result = await codaroApi.executeCode(activeSession, code, block.id);
      setResults((current) => ({ ...current, [block.id]: result }));
      setVariables(result.variables);
      setNotice({
        tone: result.status === "error" ? "error" : "success",
        title: result.status === "error" ? "셀 실행 실패" : "셀 실행 완료",
        detail: firstOutputLine(result) || "출력 없음",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        title: "실행 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setRunningBlockId(null);
    }
  }

  async function runNotebook() {
    const firstBlock = selectedBlock?.type === "code" ? selectedBlock : codeBlocks[0];
    if (!firstBlock) return;
    setNotice({ tone: "default", title: "노트북 실행 중", detail: document.title });
    setNotebookRunning(true);

    if (!apiOnline) {
      await sleep(350);
      const nextResults = Object.fromEntries(
        codeBlocks.map((block, index) => [
          block.id,
          buildLocalExecutionResult(block, drafts[block.id] ?? block.content, index + 1),
        ]),
      ) as ResultMap;
      setResults((current) => ({ ...current, ...nextResults }));
      const lastResult = Object.values(nextResults).at(-1);
      setVariables(lastResult?.variables ?? []);
      setNotice({
        tone: "success",
        title: "노트북 실행 완료",
        detail: `${codeBlocks.length}개 셀을 평가했습니다.`,
      });
      setNotebookRunning(false);
      return;
    }

    const activeSession = await ensureSession();
    if (!activeSession) {
      setNotebookRunning(false);
      return;
    }

    try {
      const blocks = document.blocks
        .filter((block): block is BlockConfig & { type: "code" | "markdown" } =>
          block.type === "code" || block.type === "markdown",
        )
        .map((block) => ({
          id: block.id,
          type: block.type,
          content: drafts[block.id] ?? block.content,
        }));
      const payload = await codaroApi.executeReactive(activeSession, firstBlock.id, blocks);
      const nextResults = Object.fromEntries(payload.results.map((result) => [result.blockId ?? "", result]));
      setResults((current) => ({ ...current, ...nextResults }));
      setVariables(payload.results.at(-1)?.variables ?? variables);
      setNotice({
        tone: "success",
        title: "노트북 실행 완료",
        detail: `${payload.executionOrder.length}개 셀을 평가했습니다.`,
      });
    } catch (error) {
      setNotice({
        tone: "error",
        title: "노트북 실행 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setNotebookRunning(false);
    }
  }

  async function connectAiProvider() {
    applyProviderActionResult(openProviderSettings(apiOnline));
  }

  async function startOauthProviderLogin(providerId = "oauth-chatgpt") {
    if (aiConnecting) return;
    const availability = openProviderSettings(apiOnline);
    if (!availability.openSettings) {
      applyProviderActionResult(availability);
      return;
    }

    setAiConnecting(true);
    try {
      setNotice({ tone: "default", title: "Provider 로그인 열림", detail: "새 탭에서 provider 로그인을 완료하세요." });
      applyProviderActionResult(await loginOauthProvider(providerId));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setNotice(providerAuthFailureNotice(detail));
    } finally {
      setAiConnecting(false);
    }
  }

  async function logoutOauthProvider(providerId = "oauth-chatgpt") {
    if (!apiOnline || aiConnecting) return;
    setAiConnecting(true);
    try {
      applyProviderActionResult(await logoutOauthProviderAction(providerId));
    } catch (error) {
      setNotice({
        tone: "error",
        title: "Provider 로그아웃 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setAiConnecting(false);
    }
  }

  async function selectAiProvider(providerId: string) {
    if (!apiOnline || aiConnecting) return;
    setAiConnecting(true);
    try {
      applyProviderActionResult(await selectProvider(providerId));
    } catch (error) {
      setNotice({
        tone: "error",
        title: "Provider 선택 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setAiConnecting(false);
    }
  }

  async function saveApiProvider(providerId: string, apiKey: string, baseUrl?: string) {
    if (!apiOnline || aiConnecting) return;
    setAiConnecting(true);
    try {
      applyProviderActionResult(await saveApiProviderAction(providerId, apiKey, baseUrl));
    } catch (error) {
      setNotice({
        tone: "error",
        title: "Provider 저장 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setAiConnecting(false);
    }
  }

  function applyProviderActionResult(result: ProviderActionResult) {
    if (result.profile) setAiProfile(result.profile);
    if (result.openSettings) setProviderSettingsOpen(true);
    if (result.closeSettings) setProviderSettingsOpen(false);
    setNotice(result.notice);
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
      const generatedBlocks = activeScope === "cell" ? [] : buildLocalBlocksFromPrompt(message, activeScope);
      const savedEntry = generatedBlocks.length && activeScope !== "cell"
        ? saveCustomCurriculum(generatedBlocks)
        : null;
      if (generatedBlocks.length) {
        if (activeScope === "cell") {
          setPendingTarget("notebook");
          setPendingBlocks((current) => {
            const knownIds = new Set(current.map((block) => block.id));
            return [...current, ...generatedBlocks.filter((block) => !knownIds.has(block.id))];
          });
        } else {
          setPendingBlocks([]);
          setPendingTarget("notebook");
        }
      }
      setMessages((current) => [
        ...current,
        {
          id: `assistant-preview-${Date.now()}`,
          role: "assistant",
          content: buildLocalAssistantAnswer(message, activeScope, generatedBlocks.length, Boolean(savedEntry)),
          provider: "기본 안내",
          model: "기본 안내",
        },
      ]);
      setNotice({
        tone: generatedBlocks.length ? "success" : "default",
        title: savedEntry ? "나만의 커리큘럼 저장됨" : generatedBlocks.length ? "커리큘럼 초안 준비됨" : "어시스턴트 답변 완료",
        detail: savedEntry?.title ?? (generatedBlocks.length ? `${generatedBlocks.length}개 학습 셀을 생성했습니다.` : "셀 안내가 준비됐습니다."),
      });
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
    let streamedContent = "";
    setMessages((current) => [
      ...current,
      createAssistantPlaceholder({
        id: assistantMessageId,
        provider: aiProviderName(aiProfile),
      }),
    ]);

    try {
      const response = await codaroApi.teacherChatStream(
        {
          conversationId,
          message,
          sessionId,
          role: "teacher",
          context,
        },
        (event) => {
          if (event.conversationId) {
            setConversationId(event.conversationId);
          }
          setMessages((current) => {
            const next = applyAssistantStreamEvent({
              assistantMessageId,
              event,
              messages: current,
              streamedContent,
            });
            streamedContent = next.streamedContent;
            return next.messages;
          });
        },
      );
      let savedCurriculumTitle = "";
      setConversationId(response.conversationId);

      const responsePlan = buildAssistantResponsePlan({ activeScope, message, response });
      if (responsePlan.documentToApply) {
        applyDocument(responsePlan.documentToApply);
        setSurface("editor");
      }
      if (responsePlan.pendingBlocks.length) {
        setPendingTarget("notebook");
        setPendingBlocks((current) => mergePendingBlocks(current, responsePlan.pendingBlocks));
      }
      if (responsePlan.curriculumToSave) {
        savedCurriculumTitle = saveCustomCurriculum(
          responsePlan.curriculumToSave.blocks,
          responsePlan.curriculumToSave.title,
        )?.title ?? responsePlan.curriculumToSave.title ?? "";
      }
      if (responsePlan.clearPendingBlocks) {
        setPendingBlocks([]);
        setPendingTarget("notebook");
      }
      setMessages((current) => finalizeAssistantMessage({
        assistantMessageId,
        messages: current,
        response,
        streamedContent,
      }));
      setNotice(assistantResponseNotice({ activeScope, response, savedCurriculumTitle }));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      const providerAuthIssue = isProviderAuthError(detail);
      const displayDetail = providerAuthIssue
        ? "provider 로그인이 필요합니다. Provider 설정에서 브라우저 로그인을 완료한 뒤 다시 요청하세요."
        : detail;
      setMessages((current) => failAssistantMessage({
        action: providerAuthIssue ? "connect-provider" : undefined,
        assistantMessageId,
        content: displayDetail,
        messages: current,
      }));
      setNotice({
        tone: "error",
        title: providerAuthIssue ? "Provider 연결 필요" : "어시스턴트 사용 불가",
        detail: displayDetail,
      });
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
    setCustomCurricula((current) => [entry, ...current.filter((item) => item.id !== entry.id)]);
    setCurriculumDocument(entry.document);
    setDrafts((current) => ({
      ...current,
      ...Object.fromEntries(
        entry.document.blocks
          .filter((block) => block.type === "code")
          .map((block) => [block.id, block.role === "snippet" ? "" : block.content]),
      ),
    }));
    setSelectedCategory(CUSTOM_CURRICULUM_CATEGORY);
    setSelectedContentId(entry.id);
    setSelectedCustomCurriculumId(entry.id);
    setSelectedCurriculumBlockId(entry.document.blocks[0]?.id ?? "");
    setSurface("curriculum");
    setNotice({
      tone: "success",
      title: "나만의 커리큘럼 저장됨",
      detail: entry.title,
    });
    return entry;
  }

  function acceptPendingBlocks() {
    if (!pendingBlocks.length) return;
    if (pendingTarget === "curriculum") {
      saveCustomCurriculum(pendingBlocks);
      setPendingBlocks([]);
      setPendingTarget("notebook");
      return;
    }
    setDocument((current) => {
      const existingIds = new Set(current.blocks.map((block) => block.id));
      const nextBlocks = pendingBlocks.filter((block) => !existingIds.has(block.id));
      if (!nextBlocks.length) return current;
      return {
        ...current,
        title: current.title === "새 노트북" || current.title === "생성 노트북" ? "생성된 노트북" : current.title,
        blocks: [...current.blocks, ...nextBlocks],
      };
    });
    setDrafts((current) => ({
      ...current,
      ...Object.fromEntries(
        pendingBlocks
          .filter((block) => block.type === "code" || block.type === "markdown")
          .map((block) => [block.id, block.content]),
      ),
    }));
    const firstCodeBlock = pendingBlocks.find((block) => block.type === "code");
    if (firstCodeBlock) {
      setSelectedBlockId(firstCodeBlock.id);
    }
    setPendingBlocks([]);
    setPendingTarget("notebook");
    setSurface("editor");
    setNotice({
      tone: "success",
      title: "노트북 변경 적용됨",
      detail: `${pendingBlocks.length}개 셀을 추가했습니다.`,
    });
  }

  function rejectPendingBlocks() {
    if (!pendingBlocks.length) return;
    setPendingBlocks([]);
    setPendingTarget("notebook");
    setNotice({
      tone: "default",
      title: "생성 항목 버림",
      detail: "현재 문서는 변경하지 않았습니다.",
    });
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
    const firstContentId = registryContents(key).contents[0]?.contentId ?? "";
    setSelectedCategory(key);
    setSelectedContentId(firstContentId);
    setSelectedCustomCurriculumId("");
    setSurface("curriculum");
  }

  function selectCurriculumContent(contentId: string) {
    setSelectedCustomCurriculumId("");
    setSelectedContentId(contentId);
    setSurface("curriculum");
  }

  function selectCustomCurriculum(id: string) {
    const entry = customCurricula.find((item) => item.id === id);
    if (!entry) return;
    setSelectedCategory(CUSTOM_CURRICULUM_CATEGORY);
    setSelectedContentId(id);
    setSelectedCustomCurriculumId(id);
    setCurriculumDocument(entry.document);
    setDrafts((current) => ({
      ...current,
      ...Object.fromEntries(
        entry.document.blocks
          .filter((block) => block.type === "code")
          .map((block) => [block.id, block.role === "snippet" ? "" : block.content]),
      ),
    }));
    setSelectedCurriculumBlockId(entry.document.blocks[0]?.id ?? "");
    setSurface("curriculum");
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

function sleep(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export default App;
