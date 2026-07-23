import { Clock3, Play, TerminalSquare } from "lucide-react";

import { IconButton } from "@/components/app/appPrimitives";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { localeDateFormat } from "@/lib/localeCopy";
import { useLocale } from "@/lib/localeContext";
import { cn } from "@/lib/utils";
import type { EStopStatus, TaskDefinition, TaskRun } from "@/types";

export function AutomationRunInspector({
  apiOnline,
  eStop,
  task,
  onRunTask,
  onToggleTask,
}: {
  apiOnline: boolean;
  eStop: EStopStatus;
  task: TaskDefinition | null;
  onRunTask: (task: TaskDefinition) => void;
  onToggleTask: (task: TaskDefinition) => void;
}) {
  const { locale, t } = useLocale();
  const run = task?.lastRun ?? null;

  return (
    <aside
      className="min-w-0 border-t border-border bg-muted/10 xl:border-l xl:border-t-0"
      data-automation-run-inspector="true"
      data-automation-selected-task={task?.id ?? ""}
      id="automation-run-inspector"
    >
      <header className="flex min-h-14 items-center gap-3 border-b border-border px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold text-muted-foreground">{t("automation.task.inspector")}</div>
          <div className="mt-0.5 truncate text-sm font-semibold">
            {task ? task.name || task.documentPath : t("automation.task.notSelected")}
          </div>
        </div>
        {task ? <RunStatusBadge run={run} /> : null}
      </header>

      {task ? (
        <div className="min-w-0 divide-y divide-border">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5">
            <label className="inline-flex min-w-0 cursor-pointer items-center gap-2 text-xs font-medium">
              <input
                checked={task.enabled}
                className="size-4 accent-foreground"
                data-automation-task-enabled="true"
                disabled={!apiOnline}
                type="checkbox"
                onChange={() => onToggleTask(task)}
              />
              <span>{task.enabled ? t("automation.task.enabled") : t("automation.task.disabled")}</span>
            </label>
            <IconButton
              className="size-8"
              data-automation-run-command="true"
              disabled={!apiOnline || !task.enabled || eStop.active}
              label={t("automation.task.run", { name: task.name || task.documentPath })}
              onClick={() => onRunTask(task)}
            >
              <Play />
            </IconButton>
          </div>

          <div className="px-3 py-2.5" data-automation-run-endpoint="true">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
              <TerminalSquare className="size-3" />
              {t("automation.task.runCommand")}
            </div>
            <code className="block break-all font-mono text-[11px] text-foreground">
              POST /api/tasks/{encodeURIComponent(task.id)}/run
            </code>
          </div>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 px-3 py-3 text-xs">
            <RunDatum label={t("automation.task.trigger")} value={task.schedule || t("automation.task.manual")} />
            <RunDatum label={t("automation.metric.status")} value={runStatusText(run, t)} />
            <RunDatum label={t("automation.task.startedAt")} value={formatRunDate(run?.startedAt, locale, t)} />
            <RunDatum label={t("automation.task.finishedAt")} value={formatRunDate(run?.finishedAt, locale, t)} />
            <RunDatum label={t("automation.task.duration")} value={formatDuration(run?.durationMs, t)} />
            <RunDatum label="run id" value={run?.id || t("common.none")} mono />
          </dl>

          <RunStream
            empty={t("automation.task.noOutput")}
            kind="stdout"
            title={t("automation.task.stdout")}
            value={run?.output || ""}
          />
          <RunStream
            empty={t("automation.task.noError")}
            kind="stderr"
            title={t("automation.task.stderr")}
            value={run?.error || ""}
          />
          <div className="px-3 py-3" data-automation-run-variables="true">
            <div className="mb-1.5 text-[10px] font-semibold text-muted-foreground">
              {t("automation.task.variables")}
            </div>
            <ScrollArea className="max-h-28">
              <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-foreground">
                {run && Object.keys(run.variables).length
                  ? JSON.stringify(run.variables, null, 2)
                  : t("automation.task.noVariables")}
              </pre>
            </ScrollArea>
          </div>
        </div>
      ) : (
        <p className="px-3 py-6 text-xs leading-5 text-muted-foreground">
          {t("automation.task.notSelectedDetail")}
        </p>
      )}
    </aside>
  );
}

function RunStatusBadge({ run }: { run: TaskRun | null }) {
  const { t } = useLocale();
  const status = run?.status ?? "idle";
  const variant = status === "failed" || status === "error" || status === "cancelled"
    ? "destructive"
    : status === "running" ? "secondary" : "outline";
  return (
    <Badge data-automation-run-status={status} variant={variant}>
      {runStatusText(run, t)}
    </Badge>
  );
}

function RunDatum({ label, mono = false, value }: { label: string; mono?: boolean; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[10px] text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 break-words font-medium text-foreground", mono && "font-mono text-[11px]")}>{value}</dd>
    </div>
  );
}

function RunStream({
  empty,
  kind,
  title,
  value,
}: {
  empty: string;
  kind: "stderr" | "stdout";
  title: string;
  value: string;
}) {
  return (
    <section className="px-3 py-3" data-automation-run-stream={kind}>
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
        <Clock3 className="size-3" />
        {title}
      </div>
      <ScrollArea className="max-h-36 rounded-md bg-code">
        <pre className={cn(
          "min-h-14 whitespace-pre-wrap break-words p-2.5 font-mono text-[11px] leading-5 text-code-foreground",
          !value && "text-muted-foreground",
        )}>
          {value || empty}
        </pre>
      </ScrollArea>
    </section>
  );
}

function runStatusText(
  run: TaskRun | null,
  t: (key: string, values?: Record<string, string | number>) => string,
) {
  if (!run) return t("automation.run.statusIdle");
  const keyByStatus: Record<string, string> = {
    cancelled: "automation.run.statusCancelled",
    error: "automation.run.statusFailed",
    failed: "automation.run.statusFailed",
    pending: "automation.run.statusPending",
    running: "automation.run.statusRunning",
    success: "automation.run.statusSuccess",
  };
  return t(keyByStatus[run.status] ?? "automation.run.statusUnknown", { status: run.status });
}

function formatRunDate(
  value: string | null | undefined,
  locale: "en" | "ko",
  t: (key: string) => string,
) {
  if (!value) return t("common.none");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(localeDateFormat(locale), {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function formatDuration(value: number | null | undefined, t: (key: string) => string) {
  if (value === null || value === undefined) return t("common.none");
  if (value < 1_000) return `${value} ms`;
  return `${(value / 1_000).toFixed(value < 10_000 ? 1 : 0)} s`;
}
