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

export type DiagnosticCategory = "provider" | "runtime" | "package" | "frontend";

export type DiagnosticSummaryItem = {
  category: DiagnosticCategory;
  code: string;
  message: string;
  action: string;
  severity: "info" | "warning" | "error";
  recoverable: boolean;
  detail?: string;
  metadata?: Record<string, unknown>;
};

export type DiagnosticSummary = {
  version: number;
  status: "ok" | "needs-action";
  items: DiagnosticSummaryItem[];
  categories: Record<DiagnosticCategory, number>;
  nextActions: string[];
  readableActions: string[];
  summaryText: string;
};

export type DiagnosticExportPayload = {
  version: number;
  kind: "codaro-local-diagnostic-export";
  generatedAt: string;
  status: DiagnosticSummary["status"] | "unknown";
  summaryText: string;
  readableActions: string[];
  categories: Record<DiagnosticCategory, number>;
  items: DiagnosticSummaryItem[];
  summary: DiagnosticSummary;
  context: Record<string, unknown>;
  redaction: {
    secrets: "redacted";
    policy: string;
  };
};

export type CurriculumCategory = {
  key: string;
  name: string;
  description: string;
  count: number;
  track?: string;
  path?: string[];
};

export type CurriculumCategoryTreeNode = {
  id: string;
  name: string;
  description?: string;
  categories?: string[];
  children?: CurriculumCategoryTreeNode[];
};

export type CurriculumContentSummary = {
  contentId: string;
  title: string;
};

export type CurriculumCategoriesPayload = {
  categories: CurriculumCategory[];
  groups: Record<string, string[]>;
  tree?: CurriculumCategoryTreeNode[];
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

export type CurriculumOutcome = {
  id: string;
  label: string;
  description: string;
};

export type CurriculumDomain = {
  id: string;
  label: string;
  description: string;
  targetOutcomes: string[];
};

export type CurriculumTaxonomyPayload = {
  outcomes: CurriculumOutcome[];
  domains: CurriculumDomain[];
};

export type MasterPlanStep = {
  order: number;
  category: string;
  contentId: string;
  key: string;
  title: string;
  outcomes: string[];
  prerequisites: string[];
  rationale: string;
  estimatedMinutes: number;
  completed: boolean;
};

export type MasterPlanGap = {
  outcomeId: string;
  outcomeLabel: string;
  reason: string;
  suggestedCategory?: string | null;
};

export type MasterPlanPayload = {
  goal: {
    domain: string | null;
    outcomes: string[];
    excludeCompleted: boolean;
    excludeKeys: string[];
    skipMasteredOutcomes?: boolean;
    maxMinutes?: number;
  };
  targetOutcomes: string[];
  steps: MasterPlanStep[];
  gaps: MasterPlanGap[];
  droppedSteps?: MasterPlanStep[];
  totalMinutes: number;
  summary: string;
  nextStepKey: string | null;
  completedCount: number;
};

export type CurriculumGapsPayload = {
  gaps: Array<{
    domainId: string;
    domainLabel: string;
    missing: Array<{ outcomeId: string; outcomeLabel: string }>;
  }>;
};

export type MasterPlanRequestBody = {
  domain?: string | null;
  outcomes?: string[];
  excludeCompleted?: boolean;
  excludeKeys?: string[];
  skipMasteredOutcomes?: boolean;
  maxMinutes?: number;
};

export type OutcomeMasteryEntry = {
  outcomeId: string;
  label: string;
  level: number;
  completedLessonKeys: string[];
  inProgressLessonKeys: string[];
  sourceLessonCount: number;
  validated: boolean;
};

export type DomainMasteryEntry = {
  domainId: string;
  label: string;
  level: number;
  masteredOutcomeCount: number;
  targetOutcomeCount: number;
};

export type MasteryReportPayload = {
  outcomes: OutcomeMasteryEntry[];
  domains: DomainMasteryEntry[];
  masteredOutcomeCount: number;
  totalOutcomeCount: number;
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

export type SharePackContentEntry = {
  path: string;
  title?: string;
  description?: string;
};

export type SharePackManifest = {
  kind: string;
  specVersion: number;
  id: string;
  version: string;
  title: string;
  description?: string;
  author?: string;
  license?: string;
  contents: {
    curricula: SharePackContentEntry[];
    automations: SharePackContentEntry[];
    assets: SharePackContentEntry[];
  };
  packages: string[];
  permissions: Record<string, unknown>;
  tags?: string[];
};

export type SharePackIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
  path?: string;
};

export type SharePackPreview = {
  source: string;
  manifest: SharePackManifest | null;
  issues: SharePackIssue[];
  contentCounts: Record<string, number>;
  files: string[];
  installable: boolean;
};

export type SharePackRecord = {
  id: string;
  version: string;
  title: string;
  author?: string;
  source: string;
  installedAt: string;
  rootPath: string;
  contentCounts: Record<string, number>;
  contents: Record<string, string[]>;
  packages: string[];
  permissions: Record<string, unknown>;
};

export type SharePackListPayload = {
  packs: SharePackRecord[];
  total: number;
};

export type SharePackAutomationPayload = {
  packId: string;
  packVersion: string;
  contentPath: string;
  documentPath: string;
  content: string;
};

export type SharePackStatusPayload = {
  enabled: boolean;
  devOnlySurface: boolean;
  storageRoot: string;
  workspaceRoot: string;
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
  pending?: boolean;
  model?: string | null;
  error?: string | null;
  diagnostic?: ProviderDiagnostic | null;
  probe?: string;
};

export type ProviderValidationSnapshot = ProviderValidationPayload & {
  provider: string;
  checkedAt: string;
  phase?: "login" | "select" | "save" | "manual" | "logout" | "failure";
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
  displayLocale?: "ko" | "en";
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
  provider?: string;
  diagnosticCode?: string;
  diagnosticAction?: string;
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
