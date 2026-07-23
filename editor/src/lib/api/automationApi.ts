import { deleteJson, postJson, putJson, requestJson } from "./transport";
import type { AgentRunPayload, AuditPayload, AutomationSessionCellPayload, EStopStatus, SchedulerStatus, TaskDefinition, TaskListPayload, TaskRun } from "@/types";

export const automationApi = {
tasks: () => requestJson<TaskListPayload>("/api/tasks"),
updateTask: (taskId: string, payload: { enabled?: boolean }) =>
    putJson<TaskDefinition>(`/api/tasks/${encodeURIComponent(taskId)}`, payload),
runTask: (taskId: string) => postJson<TaskRun>(`/api/tasks/${encodeURIComponent(taskId)}/run`, {}),
schedulerStatus: () => requestJson<SchedulerStatus>("/api/scheduler/status"),
eStop: () => requestJson<EStopStatus>("/api/automation/e-stop"),
triggerEStop: (reason: string) => postJson<EStopStatus>("/api/automation/e-stop", { reason }),
clearEStop: () => deleteJson<EStopStatus>("/api/automation/e-stop"),
audit: () => requestJson<AuditPayload>("/api/automation/audit?limit=8"),
runAutomationCell: (payload: {
    blockId: string;
    content: string;
    executionKind?: string | null;
    sessionId?: string | null;
  }) => postJson<AutomationSessionCellPayload>("/api/automation/session-cell", {
    blockId: payload.blockId,
    content: payload.content,
    executionKind: payload.executionKind ?? null,
    sessionId: payload.sessionId ?? null,
  }),
runBrowserAgent: (payload: { instruction: string; startUrl?: string | null }) =>
    postJson<AgentRunPayload>("/api/automation/agent/browser/run", {
      instruction: payload.instruction,
      startUrl: payload.startUrl ?? null,
    }),
runComputerAgent: (payload: { instruction: string }) =>
    postJson<AgentRunPayload>("/api/automation/agent/computer/run", {
      instruction: payload.instruction,
    }),
getAgentRun: (runId: string) =>
    requestJson<AgentRunPayload>(`/api/automation/agent/run/${encodeURIComponent(runId)}`),
confirmAgentStep: (runId: string, approved: boolean) =>
    postJson<AgentRunPayload>(`/api/automation/agent/run/${encodeURIComponent(runId)}/confirm`, { approved }),
pauseAgentRun: (runId: string) =>
    postJson<AgentRunPayload>(`/api/automation/agent/run/${encodeURIComponent(runId)}/pause`, {}),
resumeAgentRun: (runId: string) =>
    postJson<AgentRunPayload>(`/api/automation/agent/run/${encodeURIComponent(runId)}/resume`, {}),
stopAgentRun: (runId: string) =>
    postJson<AgentRunPayload>(`/api/automation/agent/run/${encodeURIComponent(runId)}/stop`, {})
};
