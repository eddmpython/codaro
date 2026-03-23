import { apiUrl } from "./basePath";

async function parseJson<T>(response: Response, fallback: string): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }
  let message = fallback;
  try {
    const payload = await response.json();
    if (payload?.detail) message = payload.detail;
  } catch {
    /* ignore */
  }
  throw new Error(message);
}

export interface TaskSerialized {
  id: string;
  name: string;
  documentPath: string;
  description: string;
  schedule: string | null;
  enabled: boolean;
  createdAt: string;
  runCount: number;
  lastRun?: RunSerialized;
}

export interface RunSerialized {
  id: string;
  taskId: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  stdout: string;
  stderr: string;
  variables: Record<string, unknown>;
  error: string | null;
}

export interface EStopState {
  active: boolean;
  reason: string | null;
  triggeredAt: string | null;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actionType: string;
  source: string;
  details: Record<string, unknown>;
  result: string;
}

export interface SchedulerJob {
  taskId: string;
  schedule: string;
  nextRunAt: string | null;
}

export interface RecordingState {
  active: boolean;
  recordingId: string | null;
  actionCount: number;
}

export interface MessageChannel {
  name: string;
  channelType: string;
  webhookUrl: string;
  enabled: boolean;
}

export interface WorkflowSerialized {
  id: string;
  name: string;
  description: string;
  steps: Array<Record<string, unknown>>;
  createdAt: string;
}

export interface InputPolicy {
  maxActionsPerSecond: number;
  maxActionsPerMinute: number;
  humanDelay: boolean;
  enabled: boolean;
  allowedScreenRegion: { x: number; y: number; width: number; height: number } | null;
}

export async function listTasks(): Promise<{ tasks: TaskSerialized[]; total: number }> {
  const res = await fetch(apiUrl("/api/tasks"));
  return parseJson(res, "Failed to list tasks.");
}

export async function getTask(taskId: string): Promise<TaskSerialized> {
  const res = await fetch(apiUrl(`/api/tasks/${encodeURIComponent(taskId)}`));
  return parseJson(res, "Failed to get task.");
}

export async function createTask(payload: {
  name: string;
  documentPath: string;
  description?: string;
  schedule?: string;
}): Promise<TaskSerialized> {
  const res = await fetch(apiUrl("/api/tasks"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res, "Failed to create task.");
}

export async function updateTask(
  taskId: string,
  payload: { name?: string; description?: string; schedule?: string; enabled?: boolean },
): Promise<TaskSerialized> {
  const res = await fetch(apiUrl(`/api/tasks/${encodeURIComponent(taskId)}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res, "Failed to update task.");
}

export async function deleteTask(taskId: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/tasks/${encodeURIComponent(taskId)}`), {
    method: "DELETE",
  });
  return parseJson(res, "Failed to delete task.");
}

export async function runTask(taskId: string): Promise<RunSerialized> {
  const res = await fetch(apiUrl(`/api/tasks/${encodeURIComponent(taskId)}/run`), {
    method: "POST",
  });
  return parseJson(res, "Failed to run task.");
}

export async function getTaskRuns(
  taskId: string,
  limit: number = 20,
): Promise<{ runs: RunSerialized[] }> {
  const res = await fetch(apiUrl(`/api/tasks/${encodeURIComponent(taskId)}/runs?limit=${limit}`));
  return parseJson(res, "Failed to get task runs.");
}

export async function setTaskSchedule(
  taskId: string,
  schedule: string,
): Promise<{ ok: boolean; schedule: string }> {
  const res = await fetch(apiUrl(`/api/tasks/${encodeURIComponent(taskId)}/schedule`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schedule }),
  });
  return parseJson(res, "Failed to set schedule.");
}

export async function cancelTaskSchedule(taskId: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/tasks/${encodeURIComponent(taskId)}/schedule`), {
    method: "DELETE",
  });
  return parseJson(res, "Failed to cancel schedule.");
}

export async function getSchedulerStatus(): Promise<{
  activeJobs: SchedulerJob[];
  jobCount: number;
}> {
  const res = await fetch(apiUrl("/api/scheduler/status"));
  return parseJson(res, "Failed to get scheduler status.");
}

export async function getEStop(): Promise<EStopState> {
  const res = await fetch(apiUrl("/api/automation/e-stop"));
  return parseJson(res, "Failed to get E-Stop status.");
}

export async function triggerEStop(reason?: string): Promise<EStopState> {
  const res = await fetch(apiUrl("/api/automation/e-stop"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: reason ?? "Manual trigger" }),
  });
  return parseJson(res, "Failed to trigger E-Stop.");
}

export async function clearEStop(): Promise<EStopState> {
  const res = await fetch(apiUrl("/api/automation/e-stop"), { method: "DELETE" });
  return parseJson(res, "Failed to clear E-Stop.");
}

export async function getAuditLog(params?: {
  actionType?: string;
  date?: string;
  limit?: number;
}): Promise<{ entries: AuditEntry[]; count: number }> {
  const qs = new URLSearchParams();
  if (params?.actionType) qs.set("actionType", params.actionType);
  if (params?.date) qs.set("date", params.date);
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(apiUrl(`/api/automation/audit?${qs}`));
  return parseJson(res, "Failed to get audit log.");
}

export async function getInputPolicy(): Promise<InputPolicy> {
  const res = await fetch(apiUrl("/api/automation/input-policy"));
  return parseJson(res, "Failed to get input policy.");
}

export async function updateInputPolicy(
  payload: Partial<InputPolicy>,
): Promise<InputPolicy> {
  const res = await fetch(apiUrl("/api/automation/input-policy"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res, "Failed to update input policy.");
}

export async function startRecording(): Promise<{ recordingId: string; status: string }> {
  const res = await fetch(apiUrl("/api/automation/recording/start"), { method: "POST" });
  return parseJson(res, "Failed to start recording.");
}

export async function stopRecording(
  title?: string,
): Promise<{ recipe: string; summary: Record<string, unknown> }> {
  const res = await fetch(apiUrl("/api/automation/recording/stop"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return parseJson(res, "Failed to stop recording.");
}

export async function getRecordingStatus(): Promise<RecordingState> {
  const res = await fetch(apiUrl("/api/automation/recording/status"));
  return parseJson(res, "Failed to get recording status.");
}

export async function listChannels(): Promise<{ channels: MessageChannel[] }> {
  const res = await fetch(apiUrl("/api/automation/channels"));
  return parseJson(res, "Failed to list channels.");
}

export async function addChannel(channel: MessageChannel): Promise<MessageChannel> {
  const res = await fetch(apiUrl("/api/automation/channels"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(channel),
  });
  return parseJson(res, "Failed to add channel.");
}

export async function removeChannel(channelName: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/automation/channels/${encodeURIComponent(channelName)}`), {
    method: "DELETE",
  });
  return parseJson(res, "Failed to remove channel.");
}

export async function sendNotification(
  message: string,
  channel?: string,
): Promise<Record<string, unknown>> {
  const res = await fetch(apiUrl("/api/automation/notify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, channel: channel ?? "all" }),
  });
  return parseJson(res, "Failed to send notification.");
}

export async function listWorkflows(): Promise<{
  workflows: WorkflowSerialized[];
  total: number;
}> {
  const res = await fetch(apiUrl("/api/workflows"));
  return parseJson(res, "Failed to list workflows.");
}

export async function createWorkflow(payload: {
  name: string;
  description?: string;
  steps: Array<Record<string, unknown>>;
}): Promise<WorkflowSerialized> {
  const res = await fetch(apiUrl("/api/workflows"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res, "Failed to create workflow.");
}

export async function deleteWorkflow(workflowId: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/workflows/${encodeURIComponent(workflowId)}`), {
    method: "DELETE",
  });
  return parseJson(res, "Failed to delete workflow.");
}

export async function runWorkflow(
  workflowId: string,
): Promise<Record<string, unknown>> {
  const res = await fetch(apiUrl(`/api/workflows/${encodeURIComponent(workflowId)}/run`), {
    method: "POST",
  });
  return parseJson(res, "Failed to run workflow.");
}

export async function getResourceUsage(): Promise<{
  sessions: Array<{
    sessionId: string;
    memoryMb: number;
    cpuPercent: number;
    uptime: number;
    alive: boolean;
  }>;
}> {
  const res = await fetch(apiUrl("/api/automation/resource-usage"));
  return parseJson(res, "Failed to get resource usage.");
}

export interface PlanStatus {
  planId: string;
  status: "running" | "paused" | "completed" | "failed" | "cancelled";
  currentStep: number;
  totalSteps: number;
  steps: PlanStepStatus[];
  error: string | null;
}

export interface PlanStepStatus {
  index: number;
  action: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  screenshot: string | null;
  ocrText: string | null;
  clickPosition: { x: number; y: number } | null;
  inputText: string | null;
  result: string | null;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface AgentAction {
  id: string;
  timestamp: string;
  actionType: string;
  description: string;
  screenshot: string | null;
  ocrText: string | null;
  clickPosition: { x: number; y: number } | null;
  inputText: string | null;
  result: string;
  planId: string | null;
  stepIndex: number | null;
}

export async function getPlanStatus(planId: string): Promise<PlanStatus> {
  const res = await fetch(apiUrl(`/api/automation/plan/${encodeURIComponent(planId)}/status`));
  return parseJson(res, "Failed to get plan status.");
}

export async function pausePlan(planId: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/automation/plan/${encodeURIComponent(planId)}/pause`), {
    method: "POST",
  });
  return parseJson(res, "Failed to pause plan.");
}

export async function resumePlan(planId: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/automation/plan/${encodeURIComponent(planId)}/resume`), {
    method: "POST",
  });
  return parseJson(res, "Failed to resume plan.");
}

export async function executePlan(payload: {
  steps: Array<Record<string, unknown>>;
  description?: string;
}): Promise<{ planId: string; status: string }> {
  const res = await fetch(apiUrl("/api/automation/plan/execute"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res, "Failed to execute plan.");
}


export interface IntegrationInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  configSchema: Record<string, unknown>;
}

export interface IntegrationAction {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export async function listIntegrations(): Promise<{
  integrations: IntegrationInfo[];
  total: number;
}> {
  const res = await fetch(apiUrl("/api/integrations"));
  return parseJson(res, "Failed to list integrations.");
}

export async function getIntegration(id: string): Promise<{
  info: IntegrationInfo;
  actions: IntegrationAction[];
}> {
  const res = await fetch(apiUrl(`/api/integrations/${encodeURIComponent(id)}`));
  return parseJson(res, "Failed to get integration.");
}

export async function configureIntegration(
  id: string,
  config: Record<string, unknown>,
): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/integrations/${encodeURIComponent(id)}/configure`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config }),
  });
  return parseJson(res, "Failed to configure integration.");
}

export async function testIntegration(id: string): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await fetch(apiUrl(`/api/integrations/${encodeURIComponent(id)}/test`), {
    method: "POST",
  });
  return parseJson(res, "Failed to test integration.");
}

export async function executeIntegration(
  id: string,
  action: string,
  params: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  const res = await fetch(apiUrl(`/api/integrations/${encodeURIComponent(id)}/execute`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return parseJson(res, "Failed to execute integration.");
}
