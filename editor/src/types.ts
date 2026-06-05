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
  shape?: string;
  dtype?: string;
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

export type PackageEnvironment = {
  installer: string;
  pythonPath: string;
  uvPath?: string | null;
  environment: string;
  mode: string;
  projectRoot: string;
  pathEntries: string[];
  uvAvailable: boolean;
};

export type PackageInstallCommand = {
  command: string;
  environment: PackageEnvironment;
  packages: string[];
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

export type AutomationSessionCellPayload = {
  sessionKey: string;
  sessionId: string | null;
  kind: string;
  op?: string;
  action: string;
  status: string;
  result?: unknown;
  step?: Record<string, unknown>;
  state?: Record<string, unknown> | null;
  opened?: boolean;
  closed?: boolean;
};

export type BlockExecution = {
  executionCount: number;
  status: string;
  lastRunAt?: string | null;
  lastOutput?: string | null;
};

// 리액티브 그래프 요약 + 정합성 진단 — 백엔드 KernelReactivePayload가 보내는 묶음(셀별 투영은 프론트가 한다).
export type ReactiveDiagnostics = {
  cycles: string[][];
  multipleDefinitions: Array<[string, string[]]>; // (변수, 정의 셀들)
  crossCellMutations: Array<[string, string, string]>; // (변수, 변경 셀, 소유 셀)
  staleBlockIds: string[]; // 영향받았으나 실행 못 한 셀(early-stop)
  dependents: Record<string, string[]>; // 셀 → 다운스트림 셀들(stale 전파용)
  definedBy: Record<string, string[]>; // 변수 → 정의 셀들(변수 탐색기)
  nodes: Array<{ blockId: string; defines: string[]; uses: string[] }>; // 셀별 정의/사용(의존성 그래프)
  selfImports: Array<[string, string]>; // (셀, 노트북명과 충돌하는 import)
  definitionOrder: Array<[string, string, string]>; // (변수, 쓰는 셀, 뒤에서 정의하는 셀)
  emptyCells: string[];
  unsafeCalls: Array<[string, string]>; // (셀, 위험 호출)
};

export type PredictConfig = {
  prompt?: string;
  expectedShape?: string;
  expectedDtype?: string;
  expectedValue?: string;
  expectedError?: string;
};

export type GuideConfig = {
  exerciseType: string;
  hints: string[];
  checkConfig: Record<string, string>;
  difficulty: string;
  solution: string;
  description: string;
  studentAnswer: string;
  predict?: PredictConfig | null;
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

export type CategoryProgressEntry = {
  completed: number;
  accessed: number;
};

export type ProgressResumeTarget = {
  category: string;
  contentId: string;
};

export type LearningPathTrack = {
  track: string;
  description: string;
  completed: number;
  total: number;
  ratio: number;
  state: "done" | "active" | "upcoming";
};

export type LearningPathRecommendation = {
  track: string;
  category: string | null;
  completed: number;
  total: number;
  description: string;
};

export type LearningPathSummary = {
  tracks: LearningPathTrack[];
  recommended: LearningPathRecommendation | null;
};

export type ProgressSummary = {
  totalAccessed: number;
  totalCompleted: number;
  updatedAt?: string;
  categoryProgress?: Record<string, CategoryProgressEntry>;
  resume?: ProgressResumeTarget | null;
  learningPath?: LearningPathSummary | null;
  validatedOutcomeCount?: number;
  autoValidatedOutcomeCount?: number;
  creditedOutcomeCount?: number;
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
  learnerMastery?: number | null;
  learnerConfidence?: number | null;
  lessonRole?: "concept" | "practice" | "project";
  estimatedSource?: "static" | "observed";
  observedSampleCount?: number;
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
    projectIntent?: string;
    deliverableOnly?: boolean;
  };
  targetOutcomes: string[];
  steps: MasterPlanStep[];
  gaps: MasterPlanGap[];
  dynamicGaps?: MasterPlanGap[];
  droppedSteps?: MasterPlanStep[];
  totalMinutes: number;
  summary: string;
  nextStepKey: string | null;
  completedCount: number;
  conceptSteps?: MasterPlanStep[];
  practiceSteps?: MasterPlanStep[];
  projectSteps?: MasterPlanStep[];
  projectMatches?: string[];
  goalResolution?: GoalResolutionPayload | null;
  adaptiveSkipped?: Array<{ outcomeId: string; outcomeLabel: string; reason: string }>;
};

export type GoalResolutionSuggestion = {
  outcomeId?: string;
  domainId?: string;
  label: string;
  score: number;
  reason?: string;
};

export type GoalResolutionPayload = {
  intentText: string;
  matchedKeywords: string[];
  boostedCategories: string[];
  aiSuggestedOutcomes: GoalResolutionSuggestion[];
  aiSuggestedDomains: GoalResolutionSuggestion[];
  source: "keyword" | "ai" | "blended" | "none";
  reasoning: string;
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
  projectIntent?: string;
  deliverableOnly?: boolean;
  adaptiveSkip?: boolean;
};

export type OutcomeMasteryEntry = {
  outcomeId: string;
  label: string;
  level: number;
  completedLessonKeys: string[];
  inProgressLessonKeys: string[];
  sourceLessonCount: number;
  creditCount: number;
  lastCreditAt: string | null;
  validated: boolean;
  autoValidated: boolean;
  fastTracked?: boolean;
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

export type ReviewItem = {
  lessonKey: string;
  title: string;
  category: string;
  contentId: string;
  interval: number;
  ease: number;
  streak: number;
  lastResult: "fresh" | "success" | "lapse";
  nextReviewAt: string;
  daysOverdue: number;
};

export type ReviewListPayload = {
  reviews: ReviewItem[];
  totalDue: number;
};

export type ReviewStatePayload = {
  lessonKey: string;
  interval: number;
  ease: number;
  streak: number;
  nextReviewAt: string;
  lastResult: "fresh" | "success" | "lapse";
  lastReviewedAt: string | null;
};

export type DailySnapshot = {
  date: string;
  masteredCount: number;
  totalOutcomes: number;
  lessonsCompletedToday: number;
  sectionsCompletedToday: number;
  creditsToday: number;
  domainsTouched: string[];
  hintLevelHistogram: Record<string, number>;
};

export type AnalyticsListPayload = {
  snapshots: DailySnapshot[];
  totalSnapshots: number;
};

export type LessonStatsRow = {
  key: string;
  title: string;
  static: number;
  observedEwma: number;
  sampleCount: number;
  deviation: string;
};

export type LessonStatsPayload = {
  lessons: LessonStatsRow[];
};

export type WeakCheckCoverageRow = {
  lessonKey: string;
  category: string;
  contentId: string;
  sectionId: string;
  outcomeId: string;
  outcomeLabel: string;
  currentCheckType: string | null;
  reason: string;
};

export type CheckProposalRow = {
  lessonKey: string;
  sectionId: string;
  outcomeId: string;
  proposedCheckType: string;
  proposedCheckYaml: string;
  starterCode: string;
  hints: string[];
  reasoning: string;
  confidence: number;
};

export type CheckProposalsPayload = {
  available: boolean;
  weak: WeakCheckCoverageRow[];
  proposals: CheckProposalRow[];
};

export type LessonQualityMetric = {
  lessonKey: string;
  title: string;
  sectionCount: number;
  averageHintLevel: number;
  averageAttemptCount: number;
  passRate: number;
  misconceptionHits: number;
  sampleSize: number;
  qualitySignal: "good" | "needs-attention" | "insufficient-data";
};

export type CurriculumQualityReportPayload = {
  lessons: LessonQualityMetric[];
  overallHintAverage: number;
  overallPassRate: number;
  flaggedCount: number;
};

export type AnalyticsSummaryPayload = {
  available: boolean;
  firstDate?: string;
  latestDate?: string;
  currentMastered?: number;
  totalOutcomes?: number;
  recent30?: {
    lessons: number;
    sections: number;
    credits: number;
    hintHistogram: Record<string, number>;
    domainTouches: Record<string, number>;
  };
  totalSnapshots?: number;
};

// Predict-Run-Reconcile-Adapt 루프 — 학습자 상태 (LearnerStateStore HTTP surface)
export type LearnerOutcomeMastery = {
  outcomeId: string;
  score: number;
  confidence: number;
  successCount: number;
  failureCount: number;
  lastTouched: string;
};

export type LearnerMisconceptionHit = {
  misconceptionId: string;
  outcomeId: string;
  outcomeLabel?: string;
  lessonCategory?: string;
  lessonContentId?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  hitCount: number;
  resolvedAt: string | null;
};

export type LearnerExecutionSummary = {
  totalExecutions: number;
  totalErrors: number;
  lastErrorClass: string;
  perOutcomeCounts: Record<string, { success: number; failure: number }>;
};

export type LearnerSnapshotPayload = {
  mastery: LearnerOutcomeMastery[];
  misconceptions: LearnerMisconceptionHit[];
  execution: LearnerExecutionSummary;
  repeatedMisconceptionCount: number;
  doneCriterionViolated: boolean;
};

export type LearnerOutcomePayload = {
  outcomeId: string;
  outcomeLabel: string;
  mastery: LearnerOutcomeMastery;
  misconceptionHits: LearnerMisconceptionHit[];
};

// Predict cell — 학습자가 코드 실행 전 예측을 적는 컨트랙트
export type LearningPredict = {
  prompt?: string;
  expectedShape?: string;
  expectedDtype?: string;
  expectedValue?: string;
  expectedError?: string;
};

export type MisconceptionMatch = {
  misconceptionId: string;
  outcomeId: string;
  label: string;
  summary: string;
  diagnostic: { message: string; references: string[] };
  correction: { hint: string; miniExercise: string };
  repeatStatus: "new" | "repeat";
  hitCount: number;
};

export type PredictionFieldDiff = {
  field: "shape" | "dtype" | "value" | "error";
  status: "match" | "mismatch" | "skipped";
  expected: string;
  actual: string;
  note?: string;
};

export type PredictionDiffPayload = {
  overall: "match" | "mismatch" | "skipped";
  fields: PredictionFieldDiff[];
};

export type CheckResult = {
  passed: boolean;
  feedback: string;
  hintLevel: number;
  hints: string[];
  studentOutput: string;
  expectedOutput: string;
  detail: string;
  // Predict-Run-Reconcile-Adapt 루프 — 매 check 마다 runtime이 채우는 진단 페이로드
  creditedOutcomes?: string[];
  autoValidatedOutcomes?: string[];
  misconceptionMatches?: MisconceptionMatch[];
  doneCriterionViolated?: boolean;
  predictionDiff?: PredictionDiffPayload | null;
  nextAction?: { kind: string; label: string } | null;
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

export type AssignmentEventType =
  | "materialOpened"
  | "sectionStarted"
  | "predictionLocked"
  | "checkSubmitted"
  | "checkPassed"
  | "checkFailed"
  | "hintUsed"
  | "missionCompleted"
  | "lessonCompleted"
  | "questionAsked"
  | "feedbackPosted"
  | "feedbackRead";

export type AssignmentMaterialPayload = {
  materialId: string;
  sourceKind: "document" | "sharePack" | "inlineYaml";
  title: string;
  category: string;
  contentId: string;
  document?: CodaroDocument | null;
  packId?: string;
  packVersion?: string;
  contentPath?: string;
  packages: string[];
};

export type AssignmentParticipantPayload = {
  participantId: string;
  role: "student" | "tutor";
  studentTag: string;
  displayName: string;
  joinedAt: string;
  lastSeenAt: string;
};

export type AssignmentRoomPayload = {
  assignmentId: string;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
  joinCode: string;
  material: AssignmentMaterialPayload;
  participants: Record<string, AssignmentParticipantPayload>;
  settings: {
    shareCode: "never" | "finalOnly" | "liveHelp";
    allowLateSubmission: boolean;
    syncMode: "local" | "relay";
  };
  dueAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AssignmentEventPayload = {
  eventId: string;
  assignmentId: string;
  participantId: string;
  eventType: AssignmentEventType;
  sequence: number;
  sectionId: string;
  category: string;
  contentId: string;
  createdAt: string;
  payload: Record<string, unknown>;
};

export type AssignmentDashboardParticipant = AssignmentParticipantPayload & {
  learningStatus: "notStarted" | "inProgress" | "stuck" | "completed";
  lastEventAt: string | null;
  currentSectionId: string;
  checkPassedCount: number;
  checkFailedCount: number;
  hintUsedCount: number;
  missionCompletedCount: number;
  completedSections: string[];
  failedSections: string[];
  latestFailure: AssignmentEventPayload | null;
};

export type AssignmentDashboardPayload = {
  assignment: AssignmentRoomPayload;
  participants: AssignmentDashboardParticipant[];
  statusCounts: Record<"notStarted" | "inProgress" | "stuck" | "completed", number>;
  sectionStats: Array<{ sectionId: string; started: number; passed: number; failed: number; hintUsed: number }>;
  eventCount: number;
};

export type AssignmentCreatePayload = {
  assignment: AssignmentRoomPayload;
  tutorToken: string;
};

export type AssignmentPublishPayload = AssignmentCreatePayload & {
  joinCode: string;
};

export type AssignmentJoinPayload = {
  assignment: AssignmentRoomPayload;
  participant: AssignmentParticipantPayload;
  participantToken: string;
};

export type AssignmentMaterialResponse = {
  assignment: AssignmentRoomPayload;
  material: AssignmentMaterialPayload;
};

export type AssignmentEventsPayload = {
  events: AssignmentEventPayload[];
  nextSequence: number;
};

export type ClassroomStatusPayload = {
  enabled: boolean;
  storageRoot: string;
  syncMode: "local" | "relay";
};

export type AssignmentListPayload = {
  assignments: AssignmentRoomPayload[];
  total: number;
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
