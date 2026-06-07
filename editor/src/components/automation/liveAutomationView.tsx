import { Globe, Loader2, MonitorCog, Pause, Play, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/lib/localeContext";
import {
  confirmAgentRunStep,
  pauseAgentRun,
  refreshAgentRun,
  resumeAgentRun,
  startAgentRun,
  stopAgentRun,
  type AgentKind,
} from "@/lib/agentRunOperations";
import type { AgentRunPayload, EStopStatus } from "@/types";

const ACTIVE_STATUSES = new Set(["running", "awaiting-confirm", "paused"]);

export function LiveAutomationView({
  agentKind,
  eStop,
}: {
  agentKind: AgentKind;
  eStop: EStopStatus;
}) {
  const { t } = useLocale();
  const [instruction, setInstruction] = useState("");
  const [run, setRun] = useState<AgentRunPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef<number | null>(null);

  const Icon = agentKind === "browserUse" ? Globe : MonitorCog;
  const titleKey = `automation.${agentKind}.title`;
  const descKey = `automation.${agentKind}.description`;
  const placeholderKey = `automation.${agentKind}.placeholder`;

  const statusLabel = (status: string): string => {
    const map: Record<string, string> = {
      running: t("automation.live.statusRunning"),
      "awaiting-confirm": t("automation.live.statusAwaiting"),
      paused: t("automation.live.statusPaused"),
      done: t("automation.live.statusDone"),
      stopped: t("automation.live.statusStopped"),
      error: t("automation.live.statusError"),
    };
    return map[status] ?? status;
  };

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  // 활성 run 을 폴링해 실시간 타임라인을 갱신한다.
  useEffect(() => {
    if (!run || !ACTIVE_STATUSES.has(run.status)) {
      stopPolling();
      return;
    }
    if (pollRef.current !== null) return;
    pollRef.current = window.setInterval(async () => {
      try {
        const next = await refreshAgentRun(run.runId);
        setRun(next);
      } catch {
        stopPolling();
      }
    }, 1000);
    return stopPolling;
  }, [run, stopPolling]);

  const onRun = useCallback(async () => {
    const text = instruction.trim();
    if (!text || busy || eStop.active) return;
    setBusy(true);
    setError("");
    try {
      setRun(await startAgentRun(agentKind, text));
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : String(runError));
    } finally {
      setBusy(false);
    }
  }, [agentKind, busy, eStop.active, instruction]);

  const guard = useCallback(
    async (action: (runId: string) => Promise<AgentRunPayload>) => {
      if (!run) return;
      setBusy(true);
      try {
        setRun(await action(run.runId));
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : String(actionError));
      } finally {
        setBusy(false);
      }
    },
    [run],
  );

  const isActive = run !== null && ACTIVE_STATUSES.has(run.status);

  return (
    <ScrollArea className="h-full min-h-0">
      <div className="mx-auto max-w-3xl space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="size-4" />
              {t(titleKey)}
              <Badge className="ml-1 h-4 px-1 text-[9px]" variant="outline">
                {t("automation.live.experiment")}
              </Badge>
            </CardTitle>
            <CardDescription>{t(descKey)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              className="min-h-16 resize-none"
              placeholder={t(placeholderKey)}
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              disabled={isActive}
            />
            <div className="flex flex-wrap gap-2">
              <Button disabled={busy || eStop.active || isActive || !instruction.trim()} onClick={onRun}>
                {busy && !run ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                {t("automation.live.run")}
              </Button>
              {run?.status === "running" ? (
                <Button variant="outline" onClick={() => guard(pauseAgentRun)}>
                  <Pause className="size-4" />
                  {t("automation.live.pause")}
                </Button>
              ) : null}
              {run?.status === "paused" ? (
                <Button variant="outline" onClick={() => guard(resumeAgentRun)}>
                  <Play className="size-4" />
                  {t("automation.live.resume")}
                </Button>
              ) : null}
              {isActive ? (
                <Button variant="destructive" onClick={() => guard(stopAgentRun)}>
                  <Square className="size-4" />
                  {t("automation.live.stop")}
                </Button>
              ) : null}
            </div>
            {error ? <p className="text-sm text-destructive">{t("automation.live.runFailed")}: {error}</p> : null}
          </CardContent>
        </Card>

        {run?.pending ? (
          <Card className="border-amber-500/40">
            <CardContent className="space-y-2 pt-4">
              <p className="text-xs text-muted-foreground">{t("automation.live.pending")}</p>
              <p className="text-sm font-medium">
                {run.pending.verb}
                {run.pending.label ? ` · ${run.pending.label}` : ""}
              </p>
              {run.pending.rationale ? (
                <p className="text-xs text-muted-foreground">{run.pending.rationale}</p>
              ) : null}
              <div className="flex gap-2 pt-1">
                <Button size="sm" disabled={busy} onClick={() => guard((id) => confirmAgentRunStep(id, true))}>
                  {t("automation.live.confirm")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => guard((id) => confirmAgentRunStep(id, false))}
                >
                  {t("automation.live.reject")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent className="space-y-2 pt-4">
            {run ? (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{run.goal}</span>
                <Badge variant="secondary">{statusLabel(run.status)}</Badge>
              </div>
            ) : null}
            {run && run.steps.length ? (
              run.steps.map((step) => (
                <div className="rounded-md border bg-muted/10 px-3 py-2 text-sm" key={step.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span>
                      {step.index + 1}. {step.verb ?? step.decision}
                      {step.label ? ` · ${step.label}` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">{step.stepStatus ?? step.gateVerdict ?? ""}</span>
                  </div>
                  {step.rationale ? (
                    <p className="mt-1 text-xs text-muted-foreground">{step.rationale}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t("automation.live.empty")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
