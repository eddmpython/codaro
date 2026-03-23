import type {
  TaskSerialized,
  RunSerialized,
  EStopState,
  AuditEntry,
  SchedulerJob,
  RecordingState,
  MessageChannel,
  InputPolicy,
  AgentAction,
  PlanStatus,
} from "../automationApi";
import * as api from "../automationApi";

let tasks = $state<TaskSerialized[]>([]);
let selectedTaskId = $state<string | null>(null);
let selectedTaskRuns = $state<RunSerialized[]>([]);
let eStop = $state<EStopState>({ active: false, reason: null, triggeredAt: null });
let auditEntries = $state<AuditEntry[]>([]);
let schedulerJobs = $state<SchedulerJob[]>([]);
let recording = $state<RecordingState>({ active: false, recordingId: null, actionCount: 0 });
let generatedRecipe = $state<string>("");
let channels = $state<MessageChannel[]>([]);
let loading = $state(false);
let error = $state<string | null>(null);
let taskCreateOpen = $state(false);

let agentActions = $state<AgentAction[]>([]);
let activePlan = $state<PlanStatus | null>(null);
let inputPolicy = $state<InputPolicy | null>(null);
let agentPanelTab = $state<"activity" | "safety" | "plan">("activity");

export function getTasks() { return tasks; }
export function getSelectedTaskId() { return selectedTaskId; }
export function getSelectedTask(): TaskSerialized | null {
  return tasks.find((t) => t.id === selectedTaskId) ?? null;
}
export function getSelectedTaskRuns() { return selectedTaskRuns; }
export function getEStopState() { return eStop; }
export function getAuditEntries() { return auditEntries; }
export function getSchedulerJobs() { return schedulerJobs; }
export function getRecordingState() { return recording; }
export function getGeneratedRecipe() { return generatedRecipe; }
export function getChannels() { return channels; }
export function getAutomationLoading() { return loading; }
export function getAutomationError() { return error; }
export function getTaskCreateOpen() { return taskCreateOpen; }
export function setTaskCreateOpen(open: boolean) { taskCreateOpen = open; }

export function setSelectedTaskId(id: string | null) {
  selectedTaskId = id;
  if (id) {
    void loadTaskRuns(id);
  } else {
    selectedTaskRuns = [];
  }
}

export async function loadTasks(): Promise<void> {
  loading = true;
  error = null;
  try {
    const data = await api.listTasks();
    tasks = data.tasks;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  } finally {
    loading = false;
  }
}

export async function loadTaskRuns(taskId: string): Promise<void> {
  try {
    const data = await api.getTaskRuns(taskId);
    selectedTaskRuns = data.runs;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function runTaskNow(taskId: string): Promise<RunSerialized | null> {
  try {
    const run = await api.runTask(taskId);
    await loadTasks();
    if (selectedTaskId === taskId) {
      await loadTaskRuns(taskId);
    }
    return run;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    return null;
  }
}

export async function createTask(payload: {
  name: string;
  documentPath: string;
  description?: string;
  schedule?: string;
}): Promise<TaskSerialized | null> {
  try {
    const task = await api.createTask(payload);
    tasks = [...tasks, task];
    return task;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    return null;
  }
}

export async function removeTask(taskId: string): Promise<boolean> {
  try {
    await api.deleteTask(taskId);
    tasks = tasks.filter((t) => t.id !== taskId);
    if (selectedTaskId === taskId) {
      selectedTaskId = null;
      selectedTaskRuns = [];
    }
    return true;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    return false;
  }
}

export async function loadEStop(): Promise<void> {
  try {
    eStop = await api.getEStop();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function activateEStop(reason?: string): Promise<void> {
  try {
    eStop = await api.triggerEStop(reason);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function deactivateEStop(): Promise<void> {
  try {
    eStop = await api.clearEStop();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function loadAuditLog(): Promise<void> {
  try {
    const data = await api.getAuditLog({ limit: 100 });
    auditEntries = data.entries;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function loadSchedulerStatus(): Promise<void> {
  try {
    const data = await api.getSchedulerStatus();
    schedulerJobs = data.activeJobs;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function loadRecordingStatus(): Promise<void> {
  try {
    recording = await api.getRecordingStatus();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function startRecording(): Promise<void> {
  try {
    const result = await api.startRecording();
    recording = { active: true, recordingId: result.recordingId, actionCount: 0 };
    generatedRecipe = "";
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function stopRecording(title?: string): Promise<void> {
  try {
    const result = await api.stopRecording(title);
    recording = { active: false, recordingId: null, actionCount: 0 };
    generatedRecipe = result.recipe;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function loadChannels(): Promise<void> {
  try {
    const data = await api.listChannels();
    channels = data.channels;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function initAutomationStore(): Promise<void> {
  await Promise.all([
    loadTasks(),
    loadEStop(),
    loadSchedulerStatus(),
    loadRecordingStatus(),
  ]);
}

export function clearAutomationError(): void {
  error = null;
}

export function getAgentActions() { return agentActions; }
export function getActivePlan() { return activePlan; }
export function getInputPolicy() { return inputPolicy; }
export function getAgentPanelTab() { return agentPanelTab; }
export function setAgentPanelTab(tab: "activity" | "safety" | "plan") { agentPanelTab = tab; }

export function pushAgentAction(action: AgentAction): void {
  agentActions = [action, ...agentActions].slice(0, 200);
}

export function clearAgentActions(): void {
  agentActions = [];
}

export async function loadInputPolicy(): Promise<void> {
  try {
    inputPolicy = await api.getInputPolicy();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function saveInputPolicy(updates: Partial<InputPolicy>): Promise<void> {
  try {
    inputPolicy = await api.updateInputPolicy(updates);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function loadPlanStatus(planId: string): Promise<void> {
  try {
    activePlan = await api.getPlanStatus(planId);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function pauseActivePlan(): Promise<void> {
  if (!activePlan) return;
  try {
    await api.pausePlan(activePlan.planId);
    activePlan = { ...activePlan, status: "paused" };
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function resumeActivePlan(): Promise<void> {
  if (!activePlan) return;
  try {
    await api.resumePlan(activePlan.planId);
    activePlan = { ...activePlan, status: "running" };
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export function setActivePlan(plan: PlanStatus | null): void {
  activePlan = plan;
}

export function clearActivePlan(): void {
  activePlan = null;
}
