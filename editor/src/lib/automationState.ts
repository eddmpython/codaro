import { codaroApi, optional, shouldUseApi } from "@/lib/api";
import {
  fallbackEStop,
  fallbackScheduler,
  fallbackTasks,
} from "@/lib/fallbackData";
import { statusLabel } from "@/lib/displayFormat";
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
  const next = apiOnline
    ? current.active
      ? await codaroApi.clearEStop()
      : await codaroApi.triggerEStop("Codaro에서 수동으로 정지함")
    : current.active
      ? { active: false, reason: "", triggeredAt: null }
      : { active: true, reason: "Codaro에서 수동으로 정지함", triggeredAt: Date.now() };

  return {
    eStop: next,
    refresh: apiOnline,
    notice: {
      tone: next.active ? "warning" : "success",
      title: next.active ? "긴급 정지 활성화" : "긴급 정지 해제",
      detail: next.active ? next.reason : "자동화 작업을 다시 실행할 수 있습니다.",
    },
  };
}

export async function runAutomationTask(task: TaskDefinition, apiOnline: boolean): Promise<AutomationActionResult> {
  if (!apiOnline) {
    return {
      refresh: false,
      notice: {
        tone: "success",
        title: "태스크 성공",
        detail: `${task.name} 실행을 완료했습니다.`,
      },
    };
  }

  const run = await codaroApi.runTask(task.id);
  return {
    refresh: true,
    notice: {
      tone: run.status === "success" ? "success" : "warning",
      title: `태스크 ${statusLabel(run.status)}`,
      detail: run.output || run.error || task.name,
    },
  };
}
