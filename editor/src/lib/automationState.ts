import { codaroApi, optional, shouldUseApi } from "@/lib/api";
import {
  fallbackEStop,
  fallbackScheduler,
  fallbackTasks,
} from "@/lib/fallbackData";
import { statusLabel } from "@/lib/displayFormat";
import { translate } from "@/lib/localeCopy";
import type {
  AppNotice,
  EStopStatus,
  SchedulerStatus,
  TaskDefinition,
  TaskListPayload,
} from "@/types";

export type AutomationSnapshot = {
  auditCount: number;
  eStop: EStopStatus;
  scheduler: SchedulerStatus;
  tasks: TaskListPayload;
};

export type AutomationActionResult = {
  notice: AppNotice;
  refresh: boolean;
};

export const AUTOMATION_UPDATED_EVENT = "codaro:automation-updated";

export function fallbackAutomationSnapshot(): AutomationSnapshot {
  return {
    auditCount: 0,
    eStop: fallbackEStop,
    scheduler: fallbackScheduler,
    tasks: fallbackTasks,
  };
}

export async function loadAutomationSnapshot(): Promise<AutomationSnapshot> {
  if (!shouldUseApi()) return fallbackAutomationSnapshot();

  const [taskResult, schedulerResult, eStopResult, auditResult] = await Promise.all([
    optional(codaroApi.tasks, fallbackTasks),
    optional(codaroApi.schedulerStatus, fallbackScheduler),
    optional(codaroApi.eStop, fallbackEStop),
    optional(codaroApi.audit, { entries: [], count: 0 }),
  ]);

  return {
    auditCount: auditResult.data.count,
    eStop: eStopResult.data,
    scheduler: schedulerResult.data,
    tasks: taskResult.data,
  };
}

export async function toggleAutomationStop(current: EStopStatus, apiOnline: boolean): Promise<AutomationActionResult & { eStop: EStopStatus }> {
  const manualStopReason = translate("automation.manualStopReason");
  const next = apiOnline
    ? current.active
      ? await codaroApi.clearEStop()
      : await codaroApi.triggerEStop(manualStopReason)
    : current.active
      ? { active: false, reason: "", triggeredAt: null }
      : { active: true, reason: manualStopReason, triggeredAt: Date.now() };

  return {
    eStop: next,
    refresh: apiOnline,
    notice: {
      tone: next.active ? "warning" : "success",
      title: next.active ? translate("automation.eStopActive.title") : translate("automation.eStopCleared.title"),
      detail: next.active ? next.reason : translate("automation.eStopCleared.detail"),
    },
  };
}

export async function runAutomationTask(task: TaskDefinition, apiOnline: boolean): Promise<AutomationActionResult> {
  if (!apiOnline) {
    return {
      refresh: false,
      notice: {
        tone: "success",
        title: translate("automation.taskSuccess.title"),
        detail: translate("automation.taskSuccess.detail", { name: task.name }),
      },
    };
  }

  const run = await codaroApi.runTask(task.id);
  return {
    refresh: true,
    notice: {
      tone: run.status === "success" ? "success" : "warning",
      title: translate("automation.taskStatus.title", { status: statusLabel(run.status) }),
      detail: run.output || run.error || task.name,
    },
  };
}

export async function setAutomationTaskEnabled(
  task: TaskDefinition,
  enabled: boolean,
  apiOnline: boolean,
): Promise<AutomationActionResult> {
  if (!apiOnline) {
    throw new Error(translate("automation.taskRunFailed.title"));
  }
  await codaroApi.updateTask(task.id, { enabled });
  return {
    refresh: true,
    notice: {
      tone: "success",
      title: enabled ? translate("automation.task.enabled") : translate("automation.task.disabled"),
      detail: task.name || task.documentPath,
    },
  };
}
