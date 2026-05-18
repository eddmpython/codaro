import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { bracketMatching, defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, highlightActiveLine, keymap, lineNumbers, placeholder } from "@codemirror/view";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquare,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldAlert,
  TerminalSquare,
  Workflow,
} from "lucide-react";

import { codaroApi, optional, shouldUseApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  ExecutionOutput,
  IconButton,
  LoadingInline,
  Metric,
  PendingNotebookBar,
} from "@/components/app/appPrimitives";
import { TopBar } from "@/components/app/topBar";
import { ProductSidebar } from "@/components/app/productSidebar";
import {
  CollapsedAssistantButton,
  CurriculumCellToc,
  CurriculumView,
} from "@/components/curriculum/curriculumSurface";
import {
  categorySubtitle,
  categoryTitle,
  demoBootstrap,
  demoCategories,
  demoContents,
  demoEStop,
  demoLesson,
  demoScheduler,
  demoTasks,
} from "@/lib/demoData";
import {
  defaultRegistrySelection,
  registryCategories,
  registryContents,
  registryLesson,
} from "@/lib/curriculaRegistry";
import { shortPath, statusLabel, stringifyData } from "@/lib/displayFormat";
import type { SurfaceMode, ThemeMode } from "@/lib/surfaceModel";
import {
  blockLabel,
  buildCellAiPrompt,
  type CellAiAction,
} from "@/lib/cellModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import type {
  AiProfile,
  AiToolCall,
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

type ResultMap = Record<string, ExecutionResult>;
type TeacherScope = "cell" | "lesson" | "curriculum";

type AssistantMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  provider?: string;
  model?: string | null;
  toolCalls?: AiToolCall[];
  tone?: "default" | "warning" | "error";
};

const codeCellEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--code)",
    color: "var(--code-foreground)",
    fontSize: "13px",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-scroller": {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    lineHeight: "1.55",
    overflow: "auto",
  },
  ".cm-content": {
    padding: "0.375rem 0",
  },
  ".cm-line": {
    padding: "0 0.625rem",
  },
  ".cm-gutters": {
    backgroundColor: "var(--muted)",
    borderRight: "1px solid var(--border)",
    color: "var(--muted-foreground)",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 0.5rem",
  },
  ".cm-activeLine": {
    backgroundColor: "color-mix(in oklch, var(--accent) 55%, transparent)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--accent)",
    color: "var(--accent-foreground)",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--foreground)",
  },
  ".cm-selectionBackground": {
    backgroundColor: "color-mix(in oklch, var(--ring) 35%, transparent) !important",
  },
});

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

const starterDocument: CodaroDocument = {
  id: "new-notebook",
  title: "새 노트북",
  blocks: [
    {
      id: "cell-1",
      type: "code",
      content: "",
    },
  ],
  metadata: {
    sourceFormat: "codaro",
    tags: ["notebook"],
  },
  runtime: {
    defaultEngine: "local",
    reactiveMode: "hybrid",
    packages: [],
  },
};

const builtInCurriculumCategories = registryCategories();
const defaultCurriculumSelection = defaultRegistrySelection();
const builtInCurriculumContents = registryContents(defaultCurriculumSelection.category);
const initialCurriculumDocument = registryLesson(
  defaultCurriculumSelection.category,
  defaultCurriculumSelection.contentId,
)?.document ?? null;

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
    builtInCurriculumCategories.categories.length ? builtInCurriculumCategories.categories : demoCategories.categories,
  );
  const [contents, setContents] = useState<CurriculumContentSummary[]>(
    builtInCurriculumContents.contents.length ? builtInCurriculumContents.contents : demoContents.contents,
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
  const [selectedBlockId, setSelectedBlockId] = useState(starterDocument.blocks[1]?.id ?? starterDocument.blocks[0]?.id ?? "");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [variables, setVariables] = useState<VariableInfo[]>([]);
  const [results, setResults] = useState<ResultMap>({});
  const [runningBlockId, setRunningBlockId] = useState<string | null>(null);
  const [notebookRunning, setNotebookRunning] = useState(false);
  const [tasks, setTasks] = useState<TaskListPayload>(demoTasks);
  const [scheduler, setScheduler] = useState<SchedulerStatus>(demoScheduler);
  const [eStop, setEStop] = useState<EStopStatus>(demoEStop);
  const [auditCount, setAuditCount] = useState(0);
  const [toolCatalog, setToolCatalog] = useState<AiToolCatalogPayload>(emptyToolCatalog);
  const [aiProfile, setAiProfile] = useState<AiProfile | null>(null);
  const [aiConnecting, setAiConnecting] = useState(false);
  const [query, setQuery] = useState("");
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = window.localStorage.getItem("codaro-theme");
    return stored === "light" ? "light" : "dark";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    setSidebarOpen(surface !== "chat");
    if (window.location.hash !== `#${surface}`) {
      window.history.replaceState(null, "", `#${surface}`);
    }
  }, [surface]);

  const refreshAutomation = useCallback(async () => {
    if (!shouldUseApi()) {
      setTasks(demoTasks);
      setScheduler(demoScheduler);
      setEStop(demoEStop);
      setAuditCount(0);
      return;
    }

    const [taskResult, schedulerResult, eStopResult, auditResult] = await Promise.all([
      optional(codaroApi.tasks, demoTasks),
      optional(codaroApi.schedulerStatus, demoScheduler),
      optional(codaroApi.eStop, demoEStop),
      optional(codaroApi.audit, { entries: [], count: 0 }),
    ]);

    setTasks(taskResult.data);
    setScheduler(schedulerResult.data);
    setEStop(eStopResult.data);
    setAuditCount(auditResult.data.count);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setLoadState("loading");
      if (!shouldUseApi()) {
        setApiOnline(false);
        setCategories(builtInCurriculumCategories.categories.length ? builtInCurriculumCategories.categories : demoCategories.categories);
        setContents(builtInCurriculumContents.contents.length ? builtInCurriculumContents.contents : demoContents.contents);
        setCurriculumDocument(initialCurriculumDocument);
        setToolCatalog(emptyToolCatalog);
        setAiProfile({
          activeProvider: "LLM 미연결",
          activeModel: null,
          ready: false,
        });
        setNotice(emptyNotice);
        setLoadState("ready");
        return;
      }

      const health = await optional(codaroApi.health, { status: "demo" });
      if (cancelled) return;

      const [
        bootstrapResult,
        categoryResult,
        toolsResult,
        profileResult,
      ] = await Promise.all([
        optional(codaroApi.bootstrap, demoBootstrap),
        optional(codaroApi.curriculumCategories, builtInCurriculumCategories.categories.length ? builtInCurriculumCategories : demoCategories),
        optional(codaroApi.aiTools, emptyToolCatalog),
        optional(codaroApi.aiProfile, {}),
      ]);

      if (cancelled) return;

      setApiOnline(health.online && bootstrapResult.online);
      setCategories(categoryResult.data.categories.length ? categoryResult.data.categories : demoCategories.categories);
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
      setContentsLoading(true);
      try {
        const registryFallback = registryContents(selectedCategory);
        const fallback = registryFallback.contents.length
          ? registryFallback
          : selectedCategory === demoContents.category
            ? demoContents
            : { ...demoContents, category: selectedCategory, categoryName: categoryTitle(selectedCategory) };
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
      setReferenceLoading(true);
      try {
        const registryFallback = registryLesson(selectedCategory, selectedContentId);
        const fallbackLesson = registryFallback ?? {
          ...demoLesson,
          category: selectedCategory,
          contentId: selectedContentId,
        };
        const result = shouldUseApi()
          ? await optional(() => codaroApi.curriculumLesson(selectedCategory, selectedContentId), fallbackLesson)
          : { data: fallbackLesson, online: false };
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

  const activeDocument = surface === "curriculum" && curriculumDocument ? curriculumDocument : document;
  const activeSelectedBlockId = surface === "curriculum" ? selectedCurriculumBlockId : selectedBlockId;
  const codeBlocks = useMemo(() => document.blocks.filter((block) => block.type === "code"), [document.blocks]);
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
      const result = previewExecutionResult(block, code, Object.keys(results).length + 1);
      setResults((current) => ({ ...current, [block.id]: result }));
      setVariables(result.variables);
      setNotice({
        tone: "success",
        title: "셀 실행 완료",
        detail: firstOutputLine(result) || "미리보기 출력 준비됨",
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
          previewExecutionResult(block, drafts[block.id] ?? block.content, index + 1),
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
    if (aiConnecting) return;
    if (!apiOnline) {
      setAiProfile({
        activeProvider: "Codaro",
        activeModel: "기본",
        ready: true,
      });
      setNotice({
        tone: "success",
        title: "Codaro 준비됨",
        detail: "기본 응답을 사용할 수 있습니다.",
      });
      return;
    }

    setAiConnecting(true);
    try {
      const auth = await codaroApi.oauthAuthorize();
      window.open(auth.authUrl, "_blank", "noopener,noreferrer");
      setNotice({ tone: "default", title: "제공자 로그인 열림", detail: "새 탭에서 제공자 로그인을 완료하세요." });

      for (let attempt = 0; attempt < 60; attempt += 1) {
        await sleep(1000);
        const status = await codaroApi.oauthStatus();
        if (!status.done) continue;
        if (status.error) throw new Error(status.error);
        const profile = await codaroApi.aiProfile();
        setAiProfile(profile);
        setNotice({ tone: "success", title: "제공자 연결됨", detail: aiProviderName(profile) });
        return;
      }

      setNotice({ tone: "warning", title: "제공자 로그인 대기 중", detail: "로그인 탭을 완료한 뒤 상태를 다시 확인하세요." });
    } catch (error) {
      setNotice({
        tone: "error",
        title: "제공자 로그인 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setAiConnecting(false);
    }
  }

  async function askAssistant(messageOverride?: string, scopeOverride?: TeacherScope) {
    const message = (messageOverride ?? prompt).trim();
    const activeScope = scopeOverride ?? inferTeacherScope(message, teacherScope);
    if (!message || assistantLoading) return;

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    };
    setMessages((current) => [...current, userMessage]);
    if (!messageOverride) {
      setPrompt("");
    }
    setAssistantLoading(true);

    if (!apiOnline) {
      const generatedBlocks = activeScope === "cell" ? [] : previewBlocksFromPrompt(message, activeScope);
      if (generatedBlocks.length) {
        setPendingBlocks((current) => {
          const knownIds = new Set(current.map((block) => block.id));
          return [...current, ...generatedBlocks.filter((block) => !knownIds.has(block.id))];
        });
      }
      setMessages((current) => [
        ...current,
        {
          id: `assistant-preview-${Date.now()}`,
          role: "assistant",
          content: previewAssistantAnswer(message, activeScope, generatedBlocks.length),
          provider: "LLM 미연결",
          model: "기본 안내",
        },
      ]);
      setNotice({
        tone: generatedBlocks.length ? "success" : "default",
        title: generatedBlocks.length ? "노트북 변경 준비됨" : "어시스턴트 답변 완료",
        detail: generatedBlocks.length ? `${generatedBlocks.length}개 블록을 생성했습니다.` : "셀 안내가 준비됐습니다.",
      });
      setAssistantLoading(false);
      return;
    }

    const context = {
      surface,
      teacherScope: activeScope,
      document: {
        id: document.id,
        title: document.title,
        blocks: materializeDrafts(document, drafts).blocks.slice(0, 24).map((block) => ({
          id: block.id,
          type: block.type,
          content: block.content,
        })),
      },
      selectedBlock: selectedBlock
        ? {
            id: selectedBlock.id,
            type: selectedBlock.type,
            content: drafts[selectedBlock.id] ?? selectedBlock.content,
            result: currentResult
              ? {
                  status: currentResult.status,
                  stdout: currentResult.stdout,
                  stderr: currentResult.stderr,
                  data: currentResult.data,
                }
              : null,
          }
        : null,
      variables: variables.slice(0, 24),
      tools: toolCatalog.tools.map((tool) => ({
        name: tool.name,
        category: tool.category,
        lane: tool.lane,
        target: tool.target,
        risk: tool.risk,
      })),
      instruction:
        `채팅 우선 노트북 생성을 기본으로 한다. 현재 판단 범위는 ${activeScope}이다. 학습 요청은 커리큘럼 YAML을 먼저 초안화하고 write-curriculum-yaml로 셀을 전개한 뒤 read-cells, write-cell, cell-call로 셀 단위 작업을 수행한다. 사용자가 레슨이나 전체 커리큘럼 재정의를 요청하면 적용 전에 검토 가능한 YAML diff를 제안한다.`,
    };

    try {
      const response = await codaroApi.teacherChat({
        conversationId,
        message,
        sessionId,
        role: "teacher",
        context,
      });
      setConversationId(response.conversationId);
      if (response.toolCalls.length) {
        const generatedDocument = documentFromToolCalls(response.toolCalls);
        if (generatedDocument) {
          applyDocument(generatedDocument);
          setSurface("editor");
        } else {
          const generatedBlocks = collectBlocksFromToolCalls(response.toolCalls);
          if (generatedBlocks.length) {
            setPendingBlocks((current) => {
              const knownIds = new Set(current.map((block) => block.id));
              return [...current, ...generatedBlocks.filter((block) => !knownIds.has(block.id))];
            });
          }
        }
      }
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.answer || "완료했습니다.",
          provider: response.provider,
          model: response.model,
          toolCalls: response.toolCalls,
        },
      ]);
      setNotice({
        tone: response.toolCalls.length ? "success" : "default",
        title: response.toolCalls.length ? "노트북 변경 준비됨" : "어시스턴트 답변 완료",
        detail: response.toolCalls.length ? "검토할 노트북 변경이 생성됐습니다." : response.provider,
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "system",
          tone: "error",
          content: detail,
        },
      ]);
      setNotice({ tone: "error", title: "어시스턴트 사용 불가", detail });
    } finally {
      setAssistantLoading(false);
    }
  }

  async function toggleEStop() {
    if (!apiOnline) {
      const next = eStop.active
        ? { active: false, reason: "", triggeredAt: null }
        : { active: true, reason: "Codaro에서 수동으로 정지함", triggeredAt: Date.now() };
      setEStop(next);
      setNotice({
        tone: next.active ? "warning" : "success",
        title: next.active ? "긴급 정지 활성화" : "긴급 정지 해제",
        detail: next.active ? next.reason : "자동화 작업을 다시 실행할 수 있습니다.",
      });
      return;
    }

    try {
      const next = eStop.active
        ? await codaroApi.clearEStop()
        : await codaroApi.triggerEStop("Codaro에서 수동으로 정지함");
      setEStop(next);
      setNotice({
        tone: next.active ? "warning" : "success",
        title: next.active ? "긴급 정지 활성화" : "긴급 정지 해제",
        detail: next.active ? next.reason : "자동화 작업을 다시 실행할 수 있습니다.",
      });
      await refreshAutomation();
    } catch (error) {
      setNotice({
        tone: "error",
        title: "긴급 정지 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function runTask(task: TaskDefinition) {
    if (!apiOnline) {
      setNotice({
        tone: "success",
        title: "태스크 성공",
        detail: `${task.name} 미리보기 실행을 완료했습니다.`,
      });
      return;
    }

    try {
      const run = await codaroApi.runTask(task.id);
      setNotice({
        tone: run.status === "success" ? "success" : "warning",
        title: `태스크 ${statusLabel(run.status)}`,
        detail: run.output || run.error || task.name,
      });
      await refreshAutomation();
    } catch (error) {
      setNotice({
        tone: "error",
        title: "태스크 실행 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  function acceptPendingBlocks() {
    if (!pendingBlocks.length) return;
    setDocument((current) => {
      const existingIds = new Set(current.blocks.map((block) => block.id));
      const nextBlocks = pendingBlocks.filter((block) => !existingIds.has(block.id));
      if (!nextBlocks.length) return current;
      return {
        ...current,
        title: current.title === "새 노트북" || current.title === "AI 노트북" ? "생성된 노트북" : current.title,
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
    setSurface("editor");
    setNotice({
      tone: "success",
      title: "노트북 변경 적용됨",
      detail: `${pendingBlocks.length}개 블록을 추가했습니다.`,
    });
  }

  function rejectPendingBlocks() {
    if (!pendingBlocks.length) return;
    setPendingBlocks([]);
    setNotice({
      tone: "default",
      title: "노트북 변경 버림",
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
    setSurface("curriculum");
  }

  function selectCurriculumContent(contentId: string) {
    setSelectedContentId(contentId);
    setSurface("curriculum");
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <ProductSidebar
        categories={filteredCategories}
        contentsLoading={contentsLoading}
        contents={contents}
        query={query}
        referenceLoading={referenceLoading}
        surface={surface}
        selectedCategory={selectedCategory}
        selectedContentId={selectedContentId}
        themeMode={themeMode}
        onQueryChange={setQuery}
        onSelectCategory={selectCurriculumCategory}
        onSelectContent={selectCurriculumContent}
        onSurfaceChange={setSurface}
        onToggleTheme={() => setThemeMode((current) => (current === "dark" ? "light" : "dark"))}
      />

      <SidebarInset className="grid h-svh min-h-0 min-w-0 grid-rows-[40px_minmax(0,1fr)] overflow-hidden">
        <TopBar
          assistantCollapsed={assistantCollapsed}
          canRun={canRun}
          loadState={loadState}
          notice={notice}
          showSidebarTrigger
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
          assistantLoading={assistantLoading}
          canRun={canRun}
          categories={filteredCategories}
          contents={contents}
          contentsLoading={contentsLoading}
          curriculumDocument={curriculumDocument}
          conversationId={conversationId}
          currentResult={currentResult}
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
          variables={variables}
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
          onSelectCategory={selectCurriculumCategory}
          onSelectContent={selectCurriculumContent}
          onSelectCurriculumBlock={setSelectedCurriculumBlockId}
          onSurfaceChange={setSurface}
          onToggleAssistant={() => setAssistantCollapsed((current) => !current)}
          onToggleEStop={toggleEStop}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

type MainSurfaceProps = {
  aiConnecting: boolean;
  aiProfile: AiProfile | null;
  apiOnline: boolean;
  auditCount: number;
  assistantLoading: boolean;
  canRun: boolean;
  categories: CurriculumCategory[];
  contents: CurriculumContentSummary[];
  contentsLoading: boolean;
  curriculumDocument: CodaroDocument | null;
  conversationId: string | null;
  currentResult?: ExecutionResult;
  document: CodaroDocument;
  drafts: Record<string, string>;
  eStop: EStopStatus;
  messages: AssistantMessage[];
  pendingBlocks: BlockConfig[];
  prompt: string;
  referenceLoading: boolean;
  results: ResultMap;
  runningBlockId: string | null;
  scheduler: SchedulerStatus;
  selectedCategory: string;
  selectedBlockId: string;
  selectedCurriculumBlockId: string;
  selectedContentId: string;
  surface: SurfaceMode;
  tasks: TaskListPayload;
  variables: VariableInfo[];
  loadState: LoadState;
  assistantCollapsed: boolean;
  onAddCell: (type: "code" | "markdown") => void;
  onAsk: (messageOverride?: string, scopeOverride?: TeacherScope) => void;
  onAcceptPendingBlocks: () => void;
  onCellAsk: (action: CellAiAction, block: BlockConfig) => void;
  onConnectAi: () => void;
  onDraftChange: (blockId: string, value: string) => void;
  onNewChat: () => void;
  onPromptChange: (value: string) => void;
  onRejectPendingBlocks: () => void;
  onRefreshAutomation: () => void;
  onRunBlock: (block: BlockConfig) => void;
  onRunTask: (task: TaskDefinition) => void;
  onSelectBlock: (blockId: string) => void;
  onSelectCategory: (key: string) => void;
  onSelectContent: (contentId: string) => void;
  onSelectCurriculumBlock: (blockId: string) => void;
  onSurfaceChange: (surface: SurfaceMode) => void;
  onToggleAssistant: () => void;
  onToggleEStop: () => void;
};

function MainSurface(props: MainSurfaceProps) {
  const activeDocument = props.surface === "curriculum" && props.curriculumDocument ? props.curriculumDocument : props.document;
  const activeBlockId = props.surface === "curriculum" ? props.selectedCurriculumBlockId : props.selectedBlockId;
  const selectedBlock =
    activeDocument.blocks.find((block) => block.id === activeBlockId) ??
    activeDocument.blocks.find((block) => block.type === "code") ??
    activeDocument.blocks[0];

  if (props.surface === "chat") {
    return (
      <ChatSurface
        loading={props.assistantLoading}
        loadState={props.loadState}
        messages={props.messages}
        pendingBlocks={props.pendingBlocks}
        prompt={props.prompt}
        onAsk={props.onAsk}
        onAcceptPendingBlocks={props.onAcceptPendingBlocks}
        onPromptChange={props.onPromptChange}
        onRejectPendingBlocks={props.onRejectPendingBlocks}
      />
    );
  }

  if (props.surface === "editor") {
    return (
      <div
        className={cn(
          "grid h-[calc(100vh-40px)] min-h-0 grid-cols-1",
          props.assistantCollapsed ? "xl:grid-cols-[minmax(0,1fr)_48px]" : "xl:grid-cols-[minmax(0,1fr)_380px]",
        )}
      >
        <NotebookPanel
          canRun={props.canRun}
          document={props.document}
          drafts={props.drafts}
          pendingBlocks={props.pendingBlocks}
          results={props.results}
          runningBlockId={props.runningBlockId}
          selectedBlockId={props.selectedBlockId}
          onAddCell={props.onAddCell}
          onDraftChange={props.onDraftChange}
          onAcceptPendingBlocks={props.onAcceptPendingBlocks}
          onCellAsk={props.onCellAsk}
          onRejectPendingBlocks={props.onRejectPendingBlocks}
          onRunBlock={props.onRunBlock}
          onSelectBlock={props.onSelectBlock}
        />
        {props.assistantCollapsed ? (
          <CollapsedAssistantButton onClick={props.onToggleAssistant} />
        ) : (
          <TeacherPanel
            aiConnecting={props.aiConnecting}
            aiProfile={props.aiProfile}
            apiOnline={props.apiOnline}
            conversationId={props.conversationId}
            loading={props.assistantLoading}
            messages={props.messages}
            pendingBlocks={props.pendingBlocks}
            placement="right"
            prompt={props.prompt}
          selectedBlock={selectedBlock}
          onAcceptPendingBlocks={props.onAcceptPendingBlocks}
          onAsk={props.onAsk}
          onConnectAi={props.onConnectAi}
            onNewChat={props.onNewChat}
            onPromptChange={props.onPromptChange}
            onRejectPendingBlocks={props.onRejectPendingBlocks}
          />
        )}
      </div>
    );
  }

  if (props.surface === "curriculum") {
    const curriculumDoc = props.curriculumDocument ?? props.document;
    const selectedCategoryLabel =
      props.categories.find((category) => category.key === props.selectedCategory)?.name ?? props.selectedCategory;
    const selectedContentLabel =
      props.contents.find((content) => content.contentId === props.selectedContentId)?.title ?? props.selectedContentId;
    return (
      <div
        className={cn(
          "grid h-[calc(100vh-40px)] min-h-0 grid-cols-1",
          props.assistantCollapsed
            ? "xl:grid-cols-[minmax(0,1fr)_48px] 2xl:grid-cols-[minmax(0,1fr)_44px_48px]"
            : "xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_44px_360px]",
        )}
      >
        <CurriculumView
          canRun={props.canRun}
          document={curriculumDoc}
          drafts={props.drafts}
          pendingBlocks={props.pendingBlocks}
          referenceLoading={props.referenceLoading}
          results={props.results}
          runningBlockId={props.runningBlockId}
          selectedBlockId={props.selectedCurriculumBlockId}
          selectedCategory={props.selectedCategory}
          selectedCategoryLabel={selectedCategoryLabel}
          selectedContentId={props.selectedContentId}
          selectedContentLabel={selectedContentLabel}
          renderCodeCellEditor={({ block, draft, onChange, onFocus, onRun }) => (
            <CodeCellEditor
              autoFocus
              placeholderText={block.role === "snippet" ? "예제를 보고 직접 입력하세요." : "여기에 Python 코드를 입력하세요."}
              value={draft}
              onChange={onChange}
              onFocus={onFocus}
              onRun={onRun}
            />
          )}
          onAcceptPendingBlocks={props.onAcceptPendingBlocks}
          onCellAsk={props.onCellAsk}
          onDraftChange={props.onDraftChange}
          onRejectPendingBlocks={props.onRejectPendingBlocks}
          onRunBlock={props.onRunBlock}
          onSelectBlock={props.onSelectCurriculumBlock}
        />
        <CurriculumCellToc
          document={curriculumDoc}
          selectedBlockId={props.selectedCurriculumBlockId}
          onSelectBlock={props.onSelectCurriculumBlock}
        />
        {props.assistantCollapsed ? (
          <CollapsedAssistantButton onClick={props.onToggleAssistant} />
        ) : (
          <TeacherPanel
            aiConnecting={props.aiConnecting}
            aiProfile={props.aiProfile}
            apiOnline={props.apiOnline}
            conversationId={props.conversationId}
            loading={props.assistantLoading}
            messages={props.messages}
            pendingBlocks={props.pendingBlocks}
            placement="right"
            prompt={props.prompt}
            selectedBlock={selectedBlock}
            onAcceptPendingBlocks={props.onAcceptPendingBlocks}
            onAsk={props.onAsk}
            onConnectAi={props.onConnectAi}
            onNewChat={props.onNewChat}
            onPromptChange={props.onPromptChange}
            onRejectPendingBlocks={props.onRejectPendingBlocks}
          />
        )}
      </div>
    );
  }

  return (
    <AutomationView
      auditCount={props.auditCount}
      eStop={props.eStop}
      scheduler={props.scheduler}
      tasks={props.tasks.tasks}
      onRefresh={props.onRefreshAutomation}
      onRunTask={props.onRunTask}
      onToggleEStop={props.onToggleEStop}
    />
  );
}

function ChatSurface({
  loading,
  loadState,
  messages,
  pendingBlocks,
  prompt,
  onAsk,
  onAcceptPendingBlocks,
  onPromptChange,
  onRejectPendingBlocks,
}: {
  loading: boolean;
  loadState: LoadState;
  messages: AssistantMessage[];
  pendingBlocks: BlockConfig[];
  prompt: string;
  onAsk: (messageOverride?: string, scopeOverride?: TeacherScope) => void;
  onAcceptPendingBlocks: () => void;
  onPromptChange: (value: string) => void;
  onRejectPendingBlocks: () => void;
}) {
  const isEmptyChat = !messages.length && !pendingBlocks.length && loadState !== "loading";
  if (isEmptyChat) {
    return (
      <div className="grid h-[calc(100vh-40px)] min-h-0 place-items-center px-4">
        <section className="w-full max-w-3xl">
          <img alt="" className="mx-auto mb-5 size-52 object-contain sm:size-56" src="/brand/avatar-small.png" />
          <div className="mb-5 text-center">
            <div className="text-xl font-semibold tracking-normal">Codaro로 무엇을 만들까요?</div>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              목표부터 말하세요. Codaro는 커리큘럼을 설계하고, 셀을 전개하고, 답을 확인하고, 루틴을 자동화로 바꿀 수 있습니다.
            </p>
          </div>
          <AssistantComposer
            loading={loading}
            placeholder="레슨, 실습 노트북, 브라우저 루틴, 리포트, 자동화를 요청하세요."
            prompt={prompt}
            variant="hero"
            onAsk={onAsk}
            onPromptChange={onPromptChange}
          />
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onAsk("실습 검증이 포함된 3단계 pandas 레슨을 만들어줘.", "curriculum")}>
              Pandas 레슨
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAsk("브라우저 자동화 학습 루틴을 처음부터 만들어줘.", "curriculum")}>
              브라우저 루틴
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAsk("반복 업무를 공유 가능한 자동화 노트북으로 바꿔줘.", "curriculum")}>
              자동화 노트북
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-40px)] min-h-0">
      <section className="mx-auto grid h-full min-h-0 w-full max-w-4xl grid-rows-[1fr_auto] p-3 pt-5">
        <AssistantMessages appLoading={loadState === "loading"} loading={loading} messages={messages} />
        <div>
          <PendingNotebookBar
            pendingBlocks={pendingBlocks}
            onAccept={onAcceptPendingBlocks}
            onReject={onRejectPendingBlocks}
          />
          <AssistantComposer
            loading={loading}
            prompt={prompt}
            variant="dock"
            onAsk={onAsk}
            onPromptChange={onPromptChange}
          />
        </div>
      </section>
    </div>
  );
}

function TeacherPanel({
  aiConnecting,
  aiProfile,
  apiOnline,
  conversationId,
  loading,
  messages,
  pendingBlocks,
  placement = "right",
  prompt,
  selectedBlock,
  onAcceptPendingBlocks,
  onAsk,
  onConnectAi,
  onNewChat,
  onPromptChange,
  onRejectPendingBlocks,
}: {
  aiConnecting: boolean;
  aiProfile: AiProfile | null;
  apiOnline: boolean;
  conversationId: string | null;
  loading: boolean;
  messages: AssistantMessage[];
  pendingBlocks: BlockConfig[];
  placement?: "left" | "right";
  prompt: string;
  selectedBlock?: BlockConfig;
  onAcceptPendingBlocks: () => void;
  onAsk: (messageOverride?: string, scopeOverride?: TeacherScope) => void;
  onConnectAi: () => void;
  onNewChat: () => void;
  onPromptChange: (value: string) => void;
  onRejectPendingBlocks: () => void;
}) {
  const selectedLabel = selectedBlock ? blockLabel(selectedBlock) : "선택된 셀 없음";

  return (
    <aside
      className={cn(
        "grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] border-t bg-background p-3",
        placement === "right" ? "xl:border-l xl:border-t-0" : "xl:border-r xl:border-t-0",
      )}
    >
      <div className="min-w-0">
        <AssistantHeader
          aiConnecting={aiConnecting}
          aiProfile={aiProfile}
          apiOnline={apiOnline}
          compact
          conversationId={conversationId}
          onConnectAi={onConnectAi}
          onNewChat={onNewChat}
        />

        <div className="mt-2 rounded-md border bg-muted/15 px-3 py-2">
          <div className="text-[11px] font-medium uppercase text-muted-foreground">선택</div>
          <div className="mt-1 truncate text-sm">{selectedLabel}</div>
          <div className="mt-1 text-xs leading-5 text-muted-foreground">
            셀, 레슨, 커리큘럼 범위는 대화 내용으로 판단합니다.
          </div>
        </div>

        <PendingNotebookBar
          pendingBlocks={pendingBlocks}
          onAccept={onAcceptPendingBlocks}
          onReject={onRejectPendingBlocks}
        />
      </div>

      <AssistantMessages appLoading={false} loading={loading} messages={messages} />

      <AssistantComposer
        className="mt-3"
        loading={loading}
        placeholder="설명, 답 확인, 셀 수정, 레슨 재구성, 자동화를 자연어로 요청하세요."
        prompt={prompt}
        variant="panel"
        onAsk={() => onAsk()}
        onPromptChange={onPromptChange}
      />
    </aside>
  );
}

function AssistantHeader({
  aiConnecting,
  aiProfile,
  apiOnline,
  compact = false,
  conversationId,
  onConnectAi,
  onNewChat,
}: {
  aiConnecting: boolean;
  aiProfile: AiProfile | null;
  apiOnline: boolean;
  compact?: boolean;
  conversationId: string | null;
  onConnectAi: () => void;
  onNewChat: () => void;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Bot className="size-4" />
          Codaro 어시스턴트
        </div>
        {compact ? (
          <div className="mt-1 text-xs leading-5 text-muted-foreground">{assistantStatusText(apiOnline, aiProfile)}</div>
        ) : (
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant={apiOnline && aiProfileReady(aiProfile) ? "secondary" : "outline"}>
              {apiOnline && aiProfileReady(aiProfile) ? "LLM 연결됨" : "LLM 미연결"}
            </Badge>
            <Badge variant={aiProfileReady(aiProfile) ? "secondary" : "outline"}>{aiProviderName(aiProfile)}</Badge>
            {conversationId ? <Badge variant="outline">{conversationId.slice(0, 14)}</Badge> : null}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {compact ? null : (
          <>
            <IconButton disabled={aiConnecting} label="제공자 연결" onClick={onConnectAi}>
              {aiConnecting ? <Loader2 className="animate-spin" /> : <Bot />}
            </IconButton>
            <IconButton label="새 채팅" onClick={onNewChat}>
              <RotateCcw />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
}

function AssistantMessages({
  appLoading,
  loading,
  messages,
}: {
  appLoading: boolean;
  loading: boolean;
  messages: AssistantMessage[];
}) {
  return (
    <ScrollArea className="min-h-0">
      <div className="space-y-3 pr-3">
        {appLoading ? (
          <LoadingState title="Codaro 여는 중" detail="노트북, 커리큘럼, 자동화 상태를 불러오고 있습니다." />
        ) : messages.length ? (
          messages.map((message) => (
            <Card
              className={cn(
                message.role === "user" && "bg-muted/30",
                message.tone === "error" && "bg-destructive/10",
                message.tone === "warning" && "bg-muted/40",
              )}
              key={message.id}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={message.role === "assistant" ? "secondary" : "outline"}>
                    {roleLabel(message.role)}
                  </Badge>
                  {message.provider ? <Badge variant="outline">{message.provider}</Badge> : null}
                  {message.model ? <Badge variant="outline">{message.model}</Badge> : null}
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{message.content}</div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            detail="Codaro에게 다음 설명, 실습 셀, 검증, 자동화를 만들어 달라고 요청하세요."
            title="채팅에서 시작"
          />
        )}
        {loading ? (
          <Card className="bg-muted/30">
            <CardContent className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              다음 노트북 단계를 만드는 중입니다.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </ScrollArea>
  );
}

function AssistantComposer({
  className,
  loading,
  placeholder = "Codaro에게 커리큘럼 생성, 실습 셀 구성, 코드 실행, 변수 확인, 워크플로 자동화를 요청하세요.",
  prompt,
  variant = "dock",
  onAsk,
  onPromptChange,
}: {
  className?: string;
  loading: boolean;
  placeholder?: string;
  prompt: string;
  variant?: "dock" | "hero" | "panel";
  onAsk: () => void;
  onPromptChange: (value: string) => void;
}) {
  const canAsk = Boolean(prompt.trim()) && !loading;
  const submit = () => {
    if (!canAsk) return;
    onAsk();
  };
  return (
    <form
      className={cn(
        "grid grid-cols-[1fr_auto] gap-2",
        variant === "dock" && "mt-3",
        variant === "hero" && "rounded-md border bg-card p-2 shadow-sm",
        variant === "panel" && "rounded-md border bg-background p-2",
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Textarea
        className={cn(
          "resize-none border-0 bg-transparent shadow-none focus-visible:ring-0",
          variant === "panel" ? "min-h-20" : "min-h-24",
        )}
        placeholder={placeholder}
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        onKeyDown={(event) => {
          const nativeEvent = event.nativeEvent as KeyboardEvent & { isComposing?: boolean };
          if (nativeEvent.isComposing) return;
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />
      <IconButton className="self-end" disabled={!canAsk} label="보내기" type="submit" variant="default">
        {loading ? <Loader2 className="animate-spin" /> : <Send />}
      </IconButton>
    </form>
  );
}

function LoadingState({ title, detail }: { title: string; detail: string }) {
  return (
    <Card className="bg-muted/20">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          {title}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </CardContent>
    </Card>
  );
}

function NotebookPanel({
  canRun,
  document,
  drafts,
  pendingBlocks,
  results,
  runningBlockId,
  selectedBlockId,
  onAddCell,
  onAcceptPendingBlocks,
  onCellAsk,
  onDraftChange,
  onRejectPendingBlocks,
  onRunBlock,
  onSelectBlock,
}: {
  canRun: boolean;
  document: CodaroDocument;
  drafts: Record<string, string>;
  pendingBlocks: BlockConfig[];
  results: ResultMap;
  runningBlockId: string | null;
  selectedBlockId: string;
  onAddCell: (type: "code" | "markdown") => void;
  onAcceptPendingBlocks: () => void;
  onCellAsk: (action: CellAiAction, block: BlockConfig) => void;
  onDraftChange: (blockId: string, value: string) => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig) => void;
  onSelectBlock: (blockId: string) => void;
}) {
  void onCellAsk;

  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_1fr] p-3">
      <div className="mb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-normal">{document.title}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <IconButton className="size-8" label="Python 셀 추가" onClick={() => onAddCell("code")}>
              <TerminalSquare />
            </IconButton>
            <IconButton className="size-8" label="Markdown 셀 추가" onClick={() => onAddCell("markdown")}>
              <MessageSquare />
            </IconButton>
          </div>
        </div>
        <PendingNotebookBar
          pendingBlocks={pendingBlocks}
          onAccept={onAcceptPendingBlocks}
          onReject={onRejectPendingBlocks}
        />
      </div>

      <ScrollArea className="min-h-0">
        <div className="space-y-2 pr-2">
          {document.blocks.map((block, index) => (
            <DocumentBlock
              block={block}
              canRun={canRun}
              draft={drafts[block.id] ?? block.content}
              isSelected={block.id === selectedBlockId}
              key={block.id}
              ordinal={index + 1}
              result={results[block.id]}
              isRunning={runningBlockId === block.id}
              onDraftChange={(value) => onDraftChange(block.id, value)}
              onRun={() => onRunBlock(block)}
              onSelect={() => onSelectBlock(block.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}

function DocumentBlock({
  block,
  canRun,
  draft,
  isSelected,
  isRunning,
  ordinal,
  result,
  onDraftChange,
  onRun,
  onSelect,
}: {
  block: BlockConfig;
  canRun: boolean;
  draft: string;
  isSelected: boolean;
  isRunning: boolean;
  ordinal: number;
  result?: ExecutionResult;
  onDraftChange: (value: string) => void;
  onRun: () => void;
  onSelect: () => void;
}) {
  const cellTitle = block.type === "markdown" ? "Markdown" : "Python";
  const lineCount = (block.type === "code" ? draft : block.content).split("\n").length;
  const resultStatus = isRunning ? "running" : result?.status ?? "idle";

  if (block.type === "markdown") {
    return (
      <section className={cn("group overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm", isSelected && "bg-muted/20 ring-1 ring-ring/30")}>
        <div className="grid grid-cols-[40px_minmax(0,1fr)]">
          <CellGutter ordinal={ordinal} selected={isSelected} onSelect={onSelect} />
          <div className="min-w-0">
            <CellHeader
              lineCount={lineCount}
              status={resultStatus}
              title={cellTitle}
              type="markdown"
              onSelect={onSelect}
            />
            <div className="px-3 pb-3">
              <Textarea
                className="min-h-24 resize-y bg-muted/20 font-sans text-sm leading-6"
                placeholder="Markdown을 입력하세요."
                value={draft}
                onChange={(event) => onDraftChange(event.target.value)}
                onFocus={onSelect}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("group overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm", isSelected && "bg-muted/20 ring-1 ring-ring/30")}>
      <div className="grid grid-cols-[40px_minmax(0,1fr)]">
        <CellGutter
          canRun={canRun}
          ordinal={ordinal}
          selected={isSelected}
          onSelect={onSelect}
          onRun={onRun}
          running={isRunning}
        />
        <div className="min-w-0">
          <CellHeader
            lineCount={lineCount}
            status={resultStatus}
            title={cellTitle}
            type="code"
            onSelect={onSelect}
          />
          <div className="space-y-2 px-3 pb-3">
            <CodeCellEditor
              value={draft}
              onChange={onDraftChange}
              onFocus={onSelect}
              onRun={onRun}
            />
            {result ? <div className="mt-3"><ExecutionOutput result={result} /></div> : null}
            {isRunning && !result ? (
              <div className="mt-2">
                <LoadingInline label="셀 실행 중" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function CodeCellEditor({
  autoFocus = false,
  placeholderText = "Python 코드를 입력하세요.",
  value,
  onChange,
  onFocus,
  onRun,
}: {
  autoFocus?: boolean;
  placeholderText?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onRun?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onFocusRef = useRef(onFocus);
  const onRunRef = useRef(onRun);

  useEffect(() => {
    onChangeRef.current = onChange;
    onFocusRef.current = onFocus;
    onRunRef.current = onRun;
  }, [onChange, onFocus, onRun]);

  useEffect(() => {
    if (!hostRef.current || viewRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        bracketMatching(),
        python(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        highlightActiveLine(),
        placeholder(placeholderText),
        EditorView.lineWrapping,
        Prec.high(keymap.of([
          {
            key: "Mod-Enter",
            run: () => {
              onRunRef.current?.();
              return true;
            },
          },
          {
            key: "Ctrl-Enter",
            run: () => {
              onRunRef.current?.();
              return true;
            },
          },
        ])),
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
        codeCellEditorTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
          if (update.focusChanged && update.view.hasFocus) {
            onFocusRef.current();
          }
        }),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: hostRef.current,
    });

    if (autoFocus) {
      window.requestAnimationFrame(() => viewRef.current?.focus());
    }

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentValue = view.state.doc.toString();
    if (currentValue === value) return;

    view.dispatch({
      changes: {
        from: 0,
        to: currentValue.length,
        insert: value,
      },
    });
  }, [value]);

  return (
    <div
      className="overflow-hidden rounded-md bg-code text-code-foreground"
      ref={hostRef}
    />
  );
}

function CellGutter({
  canRun = false,
  ordinal,
  running = false,
  selected,
  onSelect,
  onRun,
}: {
  canRun?: boolean;
  ordinal: number;
  running?: boolean;
  selected: boolean;
  onSelect?: () => void;
  onRun?: () => void;
}) {
  return (
    <div className={cn("flex min-h-full flex-col items-center gap-1.5 bg-muted/20 py-2 text-muted-foreground", selected && "bg-accent")}>
      <button
        className="flex size-6 items-center justify-center rounded-md text-[11px] font-medium tabular-nums hover:bg-accent hover:text-accent-foreground"
        type="button"
        onClick={onSelect}
      >
        {String(ordinal).padStart(2, "0")}
      </button>
      {onRun ? (
        <IconButton className="size-6" disabled={!canRun} label="셀 실행" size="icon" variant="ghost" onClick={onRun}>
          {running ? <Loader2 className="animate-spin" /> : <Play />}
        </IconButton>
      ) : null}
    </div>
  );
}

function CellHeader({
  lineCount,
  status,
  title,
  type,
  onSelect,
}: {
  lineCount: number;
  status: string;
  title: string;
  type: "code" | "markdown";
  onSelect: () => void;
}) {
  const Icon = type === "code" ? TerminalSquare : MessageSquare;

  return (
    <div className="flex min-h-10 w-full min-w-0 items-center gap-2 px-3 py-1.5">
      <button
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
        type="button"
        onClick={onSelect}
      >
        <Badge className="gap-1" variant="secondary">
          <Icon className="size-3" />
          {title}
        </Badge>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{type === "code" ? "파이썬 셀" : "마크다운 셀"}</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">{lineCount}줄</span>
        <Badge variant={status === "error" ? "destructive" : "outline"}>{statusLabel(status)}</Badge>
      </button>
    </div>
  );
}

function AutomationView({
  auditCount,
  eStop,
  scheduler,
  tasks,
  onRefresh,
  onRunTask,
  onToggleEStop,
}: {
  auditCount: number;
  eStop: EStopStatus;
  scheduler: SchedulerStatus;
  tasks: TaskDefinition[];
  onRefresh: () => void;
  onRunTask: (task: TaskDefinition) => void;
  onToggleEStop: () => void;
}) {
  return (
    <ScrollArea className="h-[calc(100vh-40px)] min-h-0">
      <div className="p-4">
        <div className="mx-auto max-w-6xl space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">자동화</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                자동화는 반복 작업을 스크립트로 만들고, 태스크는 그 스크립트를 정해진 시간에 실행합니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <IconButton label="새로고침" onClick={onRefresh}>
                <RefreshCw />
              </IconButton>
              <IconButton
                label={eStop.active ? "긴급 정지 해제" : "긴급 정지"}
                variant="destructive"
                onClick={onToggleEStop}
              >
                <ShieldAlert />
              </IconButton>
            </div>
          </div>

          <section className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Codaro 자동화</CardTitle>
                <CardDescription>기본 제공 자동화 템플릿입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["파일 정리", "웹 리포트 수집", "엑셀 반복 작업"].map((name) => (
                  <div className="flex items-center gap-3 rounded-md border bg-muted/10 px-3 py-2" key={name}>
                    <Workflow className="size-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{name}</div>
                      <div className="truncate text-xs text-muted-foreground">채팅에서 목표를 말하면 노트북/스크립트로 바꿉니다.</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>나만의 자동화</CardTitle>
                <CardDescription>사용자가 만든 자동화 스크립트입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.length ? (
                  tasks.map((task) => (
                    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/10 px-3 py-2" key={task.id}>
                      <TerminalSquare className="size-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{task.name || task.documentPath}</div>
                        <div className="truncate text-xs text-muted-foreground">{task.documentPath}</div>
                      </div>
                      <Badge variant={task.enabled ? "secondary" : "outline"}>{task.enabled ? "사용 중" : "꺼짐"}</Badge>
                      <IconButton
                        disabled={!task.enabled || eStop.active}
                        label={`${task.name || task.documentPath} 실행`}
                        onClick={() => onRunTask(task)}
                      >
                        <Play />
                      </IconButton>
                    </div>
                  ))
                ) : (
                  <EmptyState title="아직 없음" detail="채팅에서 반복 작업을 말하면 자동화가 생성됩니다." />
                )}
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>태스크</CardTitle>
              <CardDescription>자동화 스크립트를 몇 시 몇 분에 실행할지 정하는 예약입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Metric label="자동화" value={String(tasks.length)} />
                <Metric label="예약 중" value={String(scheduler.jobCount)} />
                <Metric label="상태" tone={eStop.active ? "warning" : "default"} value={eStop.active ? "정지" : "준비"} />
              </div>
              {tasks.length ? (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/10 px-3 py-2" key={`${task.id}-schedule`}>
                      <Clock3 className="size-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{task.name || task.documentPath}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {task.schedule ? `예약: ${task.schedule}` : "예약 없음"}
                        </div>
                      </div>
                      <Badge variant="outline">{task.enabled ? "활성" : "비활성"}</Badge>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className={cn("rounded-md bg-muted/30 p-3", eStop.active && "bg-destructive/10")}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {eStop.active ? <AlertTriangle className="size-4 text-destructive" /> : <CheckCircle2 className="size-4 text-muted-foreground" />}
                  {eStop.active ? "자동화 정지됨" : "자동화 준비됨"}
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {eStop.active ? eStop.reason : `최근 실행 기록 ${auditCount}개를 확인할 수 있습니다.`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}

function roleLabel(role: AssistantMessage["role"]) {
  if (role === "assistant") return "어시스턴트";
  if (role === "user") return "나";
  return "시스템";
}

function teacherScopeLabel(scope: TeacherScope) {
  if (scope === "lesson") return "레슨";
  if (scope === "curriculum") return "커리큘럼";
  return "셀";
}

function inferTeacherScope(message: string, fallback: TeacherScope): TeacherScope {
  const normalized = message.toLowerCase();
  if (/커리큘럼|학습\s*경로|전체\s*과정|로드맵|curriculum/.test(normalized)) return "curriculum";
  if (/레슨|강의|수업|lesson/.test(normalized)) return "lesson";
  if (/셀|코드|답|출력|에러|오류|cell|answer|output|error/.test(normalized)) return "cell";
  return fallback;
}

function aiProviderName(profile: AiProfile | null) {
  return String(profile?.activeProvider ?? profile?.provider ?? profile?.defaultProvider ?? "제공자 없음");
}

function aiProfileReady(profile: AiProfile | null) {
  return Boolean(profile?.ready ?? profile?.enabled);
}

function assistantStatusText(apiOnline: boolean, profile: AiProfile | null) {
  if (!apiOnline) return "LLM 미연결 - 지금은 기본 안내만 표시합니다.";
  if (!aiProfileReady(profile)) return "LLM 미설정 - 제공자 연결 후 실제 대화가 가능합니다.";
  return "대화로 셀, 레슨, 커리큘럼을 다룹니다.";
}

function previewBlocksFromPrompt(message: string, scope: TeacherScope): BlockConfig[] {
  const topic = inferPreviewTopic(message);
  const seed = `${Date.now()}-${slugifyText(topic)}`;
  const scopeLine = scope === "cell"
    ? "선택한 셀에서 시작해 작은 실습 단계로 확장합니다."
    : scope === "lesson"
      ? "현재 레슨을 집중 학습 흐름으로 다시 구성합니다."
      : "셀로 전개할 수 있는 커리큘럼 개요를 초안화합니다.";

  return [
    {
      id: `preview-${seed}-goal`,
      type: "markdown",
      content: `# ${topic}\n\n${scopeLine}\n\nCodaro는 먼저 커리큘럼 YAML을 만들고, 검토 가능한 학습 셀로 전개합니다.`,
    },
    {
      id: `preview-${seed}-concept`,
      type: "markdown",
      content: `## 개념\n\n- 학습자 목표를 정의합니다.\n- 실행 가능한 예제 하나를 만듭니다.\n- 학습자가 답을 확인할 수 있도록 검증 셀을 추가합니다.`,
    },
    {
      id: `preview-${seed}-practice`,
      type: "code",
      content: `topic = "${topic}"\nprint(f"실습: {topic}")\n# 이 줄을 바꾼 뒤 셀을 다시 실행하세요.`,
      guide: {
        exerciseType: "practice",
        hints: ["먼저 셀을 실행하세요.", "topic 텍스트를 바꿔 보세요.", "수정 후 검증 셀을 사용하세요."],
        checkConfig: {},
        difficulty: "easy",
        solution: `topic = "${topic}"\nprint(f"실습: {topic}")`,
        description: "생성된 실습 셀을 편집하고 실행합니다.",
        studentAnswer: "",
      },
    },
    {
      id: `preview-${seed}-check`,
      type: "code",
      content: `assert topic\nprint("검증 통과")`,
      guide: {
        exerciseType: "check",
        hints: ["topic 변수는 비어 있으면 안 됩니다."],
        checkConfig: {},
        difficulty: "easy",
        solution: `assert topic\nprint("검증 통과")`,
        description: "실습 상태를 검증합니다.",
        studentAnswer: "",
      },
    },
  ];
}

function previewAssistantAnswer(message: string, scope: TeacherScope, blockCount: number) {
  const topic = inferPreviewTopic(message);
  const scopeLabel = teacherScopeLabel(scope);
  if (scope === "cell") {
    return [
      "LLM 미연결 상태라 기본 안내만 표시합니다.",
      `${topic}에 대한 ${scopeLabel} 안내입니다.`,
      "선택한 셀을 읽고 실행한 뒤, 출력을 기대 학습 목표와 비교하세요.",
      "제공자를 연결하면 현재 셀과 실행 결과를 바탕으로 설명, 힌트, 검증을 이어갑니다.",
    ].join("\n\n");
  }
  return [
    "LLM 미연결 상태라 기본 커리큘럼 초안만 표시합니다.",
    `${topic}용 ${scopeLabel} 노트북을 초안화했습니다.`,
    `${blockCount}개 셀을 검토할 수 있습니다. 변경을 적용하면 에디터에서 열립니다.`,
    "제공자를 연결하면 커리큘럼 초안을 대화로 조정하고, 필요한 셀만 읽고 고치며 학습 흐름을 이어갑니다.",
  ].join("\n\n");
}

function previewExecutionResult(block: BlockConfig, code: string, executionCount: number): ExecutionResult {
  const assignmentMap = collectPreviewAssignments(code);
  const stdout = extractPreviewStdout(code, assignmentMap);
  const variables = extractPreviewVariables(code);
  return {
    type: "text",
    blockId: block.id,
    data: stdout,
    stdout,
    stderr: "",
    variables,
    stateDelta: {
      added: variables,
      updated: [],
      removed: [],
    },
    executionCount,
    status: "success",
  };
}

function extractPreviewStdout(code: string, assignmentMap: Record<string, string>) {
  const printMatches = [...code.matchAll(/print\(([^)]*)\)/g)];
  if (!printMatches.length) return "미리보기 실행 완료";
  return printMatches
    .map((match) => {
      const raw = match[1].trim();
      const text = raw.replace(/^f?["']|["']$/g, "");
      return text.replace(/\{([A-Za-z_]\w*)\}/g, (_, name: string) => assignmentMap[name] ?? name).trim();
    })
    .filter(Boolean)
    .join("\n");
}

function collectPreviewAssignments(code: string) {
  return Object.fromEntries(
    [...code.matchAll(/^\s*([A-Za-z_]\w*)\s*=\s*(.+)$/gm)].map((match) => [
      match[1],
      match[2].trim().replace(/^["']|["']$/g, ""),
    ]),
  );
}

function extractPreviewVariables(code: string): VariableInfo[] {
  return [...code.matchAll(/^\s*([A-Za-z_]\w*)\s*=\s*(.+)$/gm)]
    .slice(0, 12)
    .map((match) => ({
      name: match[1],
      typeName: inferPreviewTypeName(match[2]),
      repr: match[2].trim().slice(0, 80),
    }));
}

function inferPreviewTypeName(value: string) {
  const trimmed = value.trim();
  if (/^["']/.test(trimmed)) return "str";
  if (/^\d+(\.\d+)?$/.test(trimmed)) return trimmed.includes(".") ? "float" : "int";
  if (/^\[/.test(trimmed)) return "list";
  if (/^\{/.test(trimmed)) return "dict";
  return "object";
}

function inferPreviewTopic(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();
  if (/browser|브라우저/i.test(normalized)) return "브라우저 자동화 루틴";
  if (/pandas/i.test(normalized)) return "Pandas 실습 레슨";
  if (/automation|routine|task|workflow|자동화|루틴|태스크|업무/i.test(normalized)) return "자동화 노트북";
  if (/curriculum|커리큘럼/i.test(normalized)) return "학습 커리큘럼";
  return normalized.slice(0, 48) || "Codaro 노트북";
}

function slugifyText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}

function firstOutputLine(result: ExecutionResult) {
  return (result.stderr || result.stdout || stringifyData(result.data)).split("\n").find(Boolean) ?? "";
}

function draftsFromDocument(document: CodaroDocument) {
  return Object.fromEntries(
    document.blocks
      .filter((block) => block.type === "code" || block.type === "markdown")
      .map((block) => [block.id, block.content]),
  );
}

function materializeDrafts(document: CodaroDocument, drafts: Record<string, string>): CodaroDocument {
  return {
    ...document,
    blocks: document.blocks.map((block) =>
      block.type === "code" || block.type === "markdown"
        ? { ...block, content: drafts[block.id] ?? block.content }
        : block,
    ),
  };
}

function documentFromToolCalls(toolCalls: AiToolCall[]): CodaroDocument | null {
  for (const toolCall of toolCalls) {
    const result = toolCall.result;
    if (!isRecord(result)) continue;
    if (result.loadedInEditor === false) continue;
    const document = normalizeDocumentPayload(result.document);
    if (document) return document;
  }
  return null;
}

function normalizeDocumentPayload(raw: unknown): CodaroDocument | null {
  if (!isRecord(raw) || !Array.isArray(raw.blocks)) return null;

  const blocks = raw.blocks
    .filter(isRecord)
    .map((block, index) => normalizeBlockPayload(block, index))
    .filter((block): block is BlockConfig => block !== null);

  if (!blocks.length) return null;

  return {
    ...starterDocument,
    id: String(raw.id ?? `ai-${Date.now()}`),
    title: String(raw.title ?? "Codaro 노트북"),
    blocks,
    metadata: isRecord(raw.metadata) ? (raw.metadata as CodaroDocument["metadata"]) : starterDocument.metadata,
    runtime: isRecord(raw.runtime) ? (raw.runtime as CodaroDocument["runtime"]) : starterDocument.runtime,
    app: isRecord(raw.app) ? (raw.app as CodaroDocument["app"]) : starterDocument.app,
  };
}

function normalizeBlockPayload(raw: Record<string, unknown>, index: number): BlockConfig | null {
  const content = raw.content;
  if (content === undefined || content === null) return null;

  return {
    id: String(raw.id ?? `ai-cell-${index}-${Date.now()}`),
    type: normalizeBlockType(String(raw.type ?? "markdown")),
    content: String(content),
    collapsed: Boolean(raw.collapsed),
    execution: isRecord(raw.execution) ? (raw.execution as BlockConfig["execution"]) : undefined,
    guide: isRecord(raw.guide) ? (raw.guide as BlockConfig["guide"]) : null,
  };
}

function collectBlocksFromToolCalls(toolCalls: AiToolCall[]): BlockConfig[] {
  const generatedBlocks = toolCalls.flatMap((toolCall, index) => blocksFromToolCall(toolCall, index));
  const seenIds = new Set<string>();
  return generatedBlocks.filter((block) => {
    if (seenIds.has(block.id)) return false;
    seenIds.add(block.id);
    return true;
  });
}

function blocksFromToolCall(toolCall: AiToolCall, index: number): BlockConfig[] {
  const name = toolCallName(toolCall);
  const args = toolCallArguments(toolCall);
  if (!isRecord(args)) return [];

  if (name === "generate-notebook" && Array.isArray(args.blocks)) {
    return args.blocks
      .filter(isRecord)
      .map((block, blockIndex) =>
        createBlock(
          normalizeBlockType(String(block.type ?? "markdown")),
          String(block.content ?? ""),
          `gen-${index}-${blockIndex}`,
        ),
      );
  }

  if (name === "create-notebook-exercise" && Array.isArray(args.stages)) {
    const title = String(args.title ?? "생성된 연습");
    const blocks: BlockConfig[] = [createBlock("markdown", `## ${title}`, `exercise-${index}-title`)];
    args.stages.filter(isRecord).forEach((stage, stageIndex) => {
      blocks.push(createBlock("markdown", `### ${stage.stage ?? "단계"}\n\n${stage.instruction ?? ""}`, `exercise-${index}-${stageIndex}-guide`));
      blocks.push(createBlock("code", String(stage.starterCode ?? ""), `exercise-${index}-${stageIndex}-code`));
    });
    return blocks;
  }

  if (name === "create-learning-card") {
    return [
      createBlock("markdown", `## ${args.topic ?? "학습 카드"}\n\n${args.explanation ?? ""}`, `card-${index}-md`),
      createBlock("code", String(args.exampleCode ?? ""), `card-${index}-example`),
      createBlock("code", String(args.fillBlankCode ?? ""), `card-${index}-practice`),
    ];
  }

  if (name === "create-guide") {
    return [
      createBlock("markdown", `## 실습\n\n${args.description ?? ""}`, `guide-${index}-md`),
      createBlock("code", String(args.content ?? ""), `guide-${index}-code`),
    ];
  }

  if (name === "insert-block") {
    return [
      createBlock(
        normalizeBlockType(String(args.blockType ?? "markdown")),
        String(args.content ?? ""),
        `insert-${index}`,
      ),
    ];
  }

  return [];
}

function createBlock(type: BlockConfig["type"], content: string, prefix: string): BlockConfig {
  return {
    id: `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type,
    content,
  };
}

function normalizeBlockType(type: string): BlockConfig["type"] {
  if (type === "code") return "code";
  if (type === "automation") return "automation";
  return "markdown";
}

function toolCallName(toolCall: AiToolCall) {
  return toolCall.name ?? toolCall.function?.name ?? String(toolCall.toolCallId ?? toolCall.id ?? "tool-call");
}

function toolCallArguments(toolCall: AiToolCall): unknown {
  if (toolCall.arguments) return toolCall.arguments;
  const raw = toolCall.function?.arguments;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export default App;
