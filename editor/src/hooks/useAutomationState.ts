import { useCallback, useEffect, useState } from "react";
import {
  AUTOMATION_UPDATED_EVENT,
  fallbackAutomationSnapshot,
  loadAutomationSnapshot,
  runAutomationTask,
  setAutomationTaskEnabled,
  toggleAutomationStop,
} from "@/lib/automationState";
import { translate } from "@/lib/localeCopy";
import type { AutomationSection } from "@/lib/surfaceModel";
import type { AppNotice, TaskDefinition } from "@/types";

const initialAutomationSnapshot = fallbackAutomationSnapshot();

export function useAutomationState({
  apiOnline,
  onNotice,
}: {
  apiOnline: boolean;
  onNotice: (notice: AppNotice) => void;
}) {
  const [tasks, setTasks] = useState(initialAutomationSnapshot.tasks);
  const [scheduler, setScheduler] = useState(initialAutomationSnapshot.scheduler);
  const [eStop, setEStop] = useState(initialAutomationSnapshot.eStop);
  const [auditCount, setAuditCount] = useState(initialAutomationSnapshot.auditCount);
  const [automationSection, setAutomationSection] = useState<AutomationSection>("codaro");

  const applyAutomationSnapshot = useCallback((snapshot = initialAutomationSnapshot) => {
    setTasks(snapshot.tasks);
    setScheduler(snapshot.scheduler);
    setEStop(snapshot.eStop);
    setAuditCount(snapshot.auditCount);
  }, []);

  const refreshAutomation = useCallback(async () => {
    applyAutomationSnapshot(await loadAutomationSnapshot());
  }, [applyAutomationSnapshot]);

  useEffect(() => {
    const refresh = () => void refreshAutomation();
    window.addEventListener(AUTOMATION_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(AUTOMATION_UPDATED_EVENT, refresh);
  }, [refreshAutomation]);

  const toggleEStop = useCallback(async () => {
    try {
      const result = await toggleAutomationStop(eStop, apiOnline);
      setEStop(result.eStop);
      onNotice(result.notice);
      if (result.refresh) await refreshAutomation();
    } catch (error) {
      onNotice({
        tone: "error",
        title: translate("automation.eStopFailed.title"),
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }, [apiOnline, eStop, onNotice, refreshAutomation]);

  const runTask = useCallback(async (task: TaskDefinition) => {
    try {
      const result = await runAutomationTask(task, apiOnline);
      onNotice(result.notice);
      if (result.refresh) await refreshAutomation();
    } catch (error) {
      onNotice({
        tone: "error",
        title: translate("automation.taskRunFailed.title"),
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }, [apiOnline, onNotice, refreshAutomation]);

  const toggleTask = useCallback(async (task: TaskDefinition) => {
    try {
      const result = await setAutomationTaskEnabled(task, !task.enabled, apiOnline);
      onNotice(result.notice);
      if (result.refresh) await refreshAutomation();
    } catch (error) {
      onNotice({
        tone: "error",
        title: translate("automation.taskRunFailed.title"),
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }, [apiOnline, onNotice, refreshAutomation]);

  return {
    auditCount,
    automationSection,
    eStop,
    refreshAutomation,
    runTask,
    scheduler,
    setAutomationSection,
    tasks,
    toggleTask,
    toggleEStop,
  };
}
