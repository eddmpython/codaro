

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

export type AgentRunStep = {
  id: string;
  index: number;
  decision: string;
  verb: string | null;
  params?: Record<string, unknown> | null;
  rationale?: string;
  label?: string;
  gateVerdict?: string | null;
  stepStatus?: string | null;
  stepError?: string | null;
  observationSummary?: string;
};

export type AgentRunPendingStep = {
  id: string;
  verb: string;
  params: Record<string, unknown>;
  label?: string;
  rationale?: string;
};

export type AgentRunStatus =
  | "running"
  | "awaiting-confirm"
  | "paused"
  | "done"
  | "stopped"
  | "error";

export type AgentRunPayload = {
  runId: string;
  kind: "browserUse" | "computerUse";
  goal: string;
  status: AgentRunStatus;
  outcome?: string | null;
  error?: string | null;
  steps: AgentRunStep[];
  pending?: AgentRunPendingStep | null;
};

export type TaskDefinition = {
  id: string;
  name: string;
  description: string;
  documentPath: string;
  inputs?: Record<string, unknown>;
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
