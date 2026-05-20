import type {
  blockTypes,
  cellDisplayKinds,
  cellRoles,
  executionKinds,
} from "@/lib/cellSchema";

export type LoadState = "idle" | "loading" | "ready" | "error";

export type BlockType = (typeof blockTypes)[number];

export type CellRole = (typeof cellRoles)[number];

export type ExecutionKind = (typeof executionKinds)[number];

export type CellDisplayKind = (typeof cellDisplayKinds)[number];

export type VariableInfo = {
  name: string;
  typeName: string;
  repr: string;
  size?: number | null;
};

export type PackageInfo = {
  name: string;
  version: string;
};

export type PackageInstallResult = {
  package: string;
  success: boolean;
  message: string;
  installer?: string;
  environment?: string;
  durationMs?: number | null;
  skipped?: boolean;
};

export type VariableDelta = {
  added: VariableInfo[];
  updated: VariableInfo[];
  removed: string[];
};

export type ExecutionResult = {
  type: string;
  blockId?: string | null;
  data: unknown;
  stdout: string;
  stderr: string;
  variables: VariableInfo[];
  stateDelta: VariableDelta;
  executionCount: number;
  status: string;
};

export type BlockExecution = {
  executionCount: number;
  status: string;
  lastRunAt?: string | null;
  lastOutput?: string | null;
};

export type GuideConfig = {
  exerciseType: string;
  hints: string[];
  checkConfig: Record<string, string>;
  difficulty: string;
  solution: string;
  description: string;
  studentAnswer: string;
};

export type BlockConfig = {
  id: string;
  type: BlockType;
  content: string;
  role?: CellRole;
  executionKind?: ExecutionKind;
  displayKind?: CellDisplayKind;
  sourceType?: string;
  payload?: unknown;
  title?: string;
  description?: string;
  collapsed?: boolean;
  execution?: BlockExecution;
  guide?: GuideConfig | null;
};

export type CodaroDocument = {
  id: string;
  title: string;
  blocks: BlockConfig[];
  metadata?: {
    sourceFormat: string;
    tags: string[];
    createdAt?: string;
    updatedAt?: string;
  };
  runtime?: {
    defaultEngine: string;
    reactiveMode: string;
    packages: string[];
  };
  app?: {
    title: string;
    layout: string;
    hideCode: boolean;
    entryBlockIds: string[];
  };
};

export type BootstrapPayload = {
  appMode: boolean;
  documentPath: string | null;
  workspaceRoot: string;
  rootPath: string;
};

export type CurriculumCategory = {
  key: string;
  name: string;
  description: string;
  count: number;
};

export type CurriculumContentSummary = {
  contentId: string;
  title: string;
};

export type CurriculumCategoriesPayload = {
  categories: CurriculumCategory[];
  groups: Record<string, string[]>;
  learningPaths: Record<string, { categories: string[]; description: string }>;
};

export type CurriculumContentsPayload = {
  category: string;
  categoryName: string;
  contents: CurriculumContentSummary[];
};

export type CurriculumLessonPayload = {
  document: CodaroDocument;
  solutions: Record<string, string>;
  category: string;
  contentId: string;
  prevNext: {
    prev: CurriculumContentSummary | null;
    next: CurriculumContentSummary | null;
  };
};

export type ProgressSummary = {
  totalAccessed: number;
  totalCompleted: number;
  updatedAt?: string;
};

export type CheckResult = {
  passed: boolean;
  feedback: string;
  hintLevel: number;
  hints: string[];
  studentOutput: string;
  expectedOutput: string;
  detail: string;
};

export type TaskDefinition = {
  id: string;
  name: string;
  description: string;
  documentPath: string;
  schedule?: string | null;
  enabled: boolean;
  outputs: string[];
  createdAt: string;
  updatedAt: string;
  lastRun?: TaskRun;
};

export type TaskRun = {
  id: string;
  taskId: string;
  status: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  durationMs?: number | null;
  output: string;
  error?: string | null;
  variables: Record<string, unknown>;
};

export type TaskListPayload = {
  tasks: TaskDefinition[];
  total: number;
};

export type SchedulerStatus = {
  activeJobs: string[];
  jobCount: number;
};

export type EStopStatus = {
  active: boolean;
  reason: string;
  triggeredAt: number | null;
};

export type AuditPayload = {
  entries: Array<Record<string, unknown>>;
  count: number;
};

export type AiProvider = {
  id?: string;
  name?: string;
  label?: string;
  public?: boolean;
  status?: string;
  description?: string;
  authKind?: string;
  setupKind?: string;
  envKey?: string;
  probePolicy?: string;
  defaultModel?: string;
  supportedRoles?: string[];
};

export type AiProviderCatalogPayload = {
  catalog: AiProvider[] | Record<string, AiProvider>;
};

export type ProviderDiagnostic = {
  code?: string;
  message?: string;
  action?: string;
  provider?: string;
  detail?: string;
  recoverable?: boolean;
  statusCode?: number;
};

export type ProviderValidationPayload = {
  valid: boolean;
  model?: string | null;
  error?: string | null;
  diagnostic?: ProviderDiagnostic | null;
  probe?: string;
};

export type AiToolCatalogPayload = {
  groups: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  lanes?: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  tools: Array<{
    name: string;
    description: string;
    handler: string;
    category: string;
    lane?: string;
    target?: string;
    risk: string;
    required: string[];
    parameters: string[];
  }>;
  grouped: Record<string, string[]>;
  byLane?: Record<string, string[]>;
};

export type AiProfile = {
  provider?: string;
  model?: string;
  enabled?: boolean;
  defaultProvider?: string;
  activeProvider?: string;
  activeModel?: string | null;
  ready?: boolean;
  [key: string]: unknown;
};

export type AiToolCall = {
  id?: string;
  toolCallId?: string;
  name?: string;
  arguments?: Record<string, unknown>;
  status?: string;
  error?: string | null;
  traceId?: string;
  traceEventIndex?: number;
  turnElapsedMs?: number;
  category?: string;
  lane?: string;
  target?: string;
  risk?: string;
  function?: {
    name?: string;
    arguments?: string;
  };
  result?: unknown;
  [key: string]: unknown;
};

export type AiChatRequest = {
  conversationId?: string | null;
  message: string;
  sessionId?: string | null;
  provider?: string | null;
  role?: string;
  context?: Record<string, unknown>;
};

export type AiTracePolicyViolation = {
  policyCode: string;
  toolName: string;
  message: string;
};

export type AiTraceWorkloopEvent = {
  eventIndex?: number;
  eventType?: string;
  toolCallId?: string;
  toolName?: string;
  status?: string;
  error?: string | null;
  category?: string;
  lane?: string;
  target?: string;
  risk?: string;
  workLabel?: string;
  workDetail?: string;
  elapsedMs?: number;
  [key: string]: unknown;
};

export type AiTraceEvent = {
  eventIndex?: number;
  eventType?: string;
  elapsedMs?: number;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
};

export type AiTraceSummary = {
  traceId?: string;
  conversationId?: string | null;
  elapsedMs?: number;
  eventCount?: number;
  toolCount?: number;
  errorCount?: number;
  policyViolationCount?: number;
  policyViolations?: AiTracePolicyViolation[];
  toolSequence?: string[];
  workloop?: AiTraceWorkloopEvent[];
  events?: AiTraceEvent[];
  yamlContractObserved?: boolean;
  [key: string]: unknown;
};

export type AiChatResponse = {
  conversationId: string;
  answer: string;
  provider: string;
  model?: string | null;
  usage?: unknown;
  toolCalls: AiToolCall[];
  trace?: AiTraceSummary;
};

export type OauthAuthorizePayload = {
  authUrl: string;
  state: string;
};

export type OauthStatusPayload = {
  done: boolean;
  error?: string | null;
  message?: string | null;
  diagnostic?: ProviderDiagnostic | null;
};

export type AppNotice = {
  tone: "default" | "success" | "warning" | "error";
  title: string;
  detail: string;
};
