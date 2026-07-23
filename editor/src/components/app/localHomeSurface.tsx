import {
  ArrowRight,
  BookOpen,
  FileCode2,
  History,
  Play,
  Workflow,
} from "lucide-react";

import { AutomationOperationStrip } from "@/components/automation/automationOperationStrip";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { localeDateFormat } from "@/lib/localeCopy";
import { useLocale } from "@/lib/localeContext";
import type { SurfaceMode } from "@/lib/surfaceModel";
import { cn } from "@/lib/utils";
import type {
  CodaroDocument,
  EStopStatus,
  SchedulerStatus,
  TaskDefinition,
} from "@/types";

export function LocalHomeSurface({
  apiOnline,
  auditCount,
  document,
  eStop,
  learningLabel,
  scheduler,
  tasks,
  onNavigate,
  onRefreshAutomation,
  onToggleEStop,
}: {
  apiOnline: boolean;
  auditCount: number;
  document: CodaroDocument;
  eStop: EStopStatus;
  learningLabel: string;
  scheduler: SchedulerStatus;
  tasks: TaskDefinition[];
  onNavigate: (surface: SurfaceMode) => void;
  onRefreshAutomation: () => void;
  onToggleEStop: () => void;
}) {
  const { locale, t } = useLocale();
  const recentRuns = [...tasks]
    .filter((task) => task.lastRun)
    .sort((left, right) => runTimestamp(right).localeCompare(runTimestamp(left)))
    .slice(0, 7);

  return (
    <ScrollArea className="h-full min-h-0" data-local-home-surface="true">
      <main className="min-h-full bg-background pb-10">
        <header className="border-b border-border px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1480px] flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-accent-brand">{t("local.home.eyebrow")}</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal">{t("local.home.title")}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t("local.home.description")}
              </p>
            </div>
            <div
              className={cn(
                "inline-flex min-h-8 items-center gap-2 border-l-2 px-3 text-xs font-medium",
                apiOnline ? "border-success text-foreground" : "border-destructive text-destructive",
              )}
              data-local-runtime-state={apiOnline ? "online" : "offline"}
              role="status"
            >
              <span className={cn("size-2 rounded-full", apiOnline ? "bg-success" : "bg-destructive")} />
              {apiOnline ? t("local.home.runtimeReady") : t("local.home.runtimeOffline")}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <section className="grid border-b border-border lg:grid-cols-2" data-local-home-resume="true">
            <ResumeRow
              detail={learningLabel || t("local.home.learningFallback")}
              icon={BookOpen}
              title={t("local.home.continueLearning")}
              onClick={() => onNavigate("curriculum")}
            />
            <ResumeRow
              className="border-t border-border lg:border-l lg:border-t-0"
              detail={t("local.home.notebookDetail", { count: document.blocks.length })}
              icon={FileCode2}
              title={document.title || t("local.home.currentNotebook")}
              onClick={() => onNavigate("editor")}
            />
          </section>

          <div className="mt-5">
            <AutomationOperationStrip
              apiOnline={apiOnline}
              auditCount={auditCount}
              eStop={eStop}
              scheduler={scheduler}
              tasks={tasks}
              onRefresh={onRefreshAutomation}
              onToggleEStop={onToggleEStop}
            />
          </div>

          <section className="grid gap-0 border-b border-border pt-5 xl:min-h-[300px] xl:grid-cols-[minmax(0,1fr)_360px]" data-local-home-operations="true">
            <div className="min-w-0 pb-5 xl:pr-6">
              <header className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-semibold">{t("local.home.recentRuns")}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{t("local.home.recentRunsDetail")}</p>
                </div>
                <History className="size-4 text-muted-foreground" />
              </header>
              {recentRuns.length ? (
                <div className="divide-y divide-border" data-local-home-run-list="true">
                  {recentRuns.map((task) => (
                    <RecentRunRow key={task.id} locale={locale} task={task} />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-sm text-muted-foreground xl:flex xl:min-h-48 xl:items-center" data-local-home-run-empty="true">
                  {t("local.home.noRuns")}
                </div>
              )}
            </div>

            <aside
              className="order-first border-b border-border pb-5 xl:order-none xl:border-b-0 xl:border-l xl:pl-6"
              data-local-home-commands="true"
            >
              <h2 className="text-base font-semibold">{t("local.home.commands")}</h2>
              <div className="mt-3 grid gap-2">
                <LocalCommand
                  detail={t("local.home.openAutomationDetail")}
                  icon={Workflow}
                  label={t("local.home.openAutomation")}
                  onClick={() => onNavigate("automation")}
                />
                <LocalCommand
                  detail={t("local.home.openNotebookDetail")}
                  icon={FileCode2}
                  label={t("local.home.openNotebook")}
                  onClick={() => onNavigate("editor")}
                />
                <LocalCommand
                  detail={t("local.home.openLearningDetail")}
                  icon={BookOpen}
                  label={t("local.home.openLearning")}
                  onClick={() => onNavigate("curriculum")}
                />
              </div>
            </aside>
          </section>
        </div>
      </main>
    </ScrollArea>
  );
}

function ResumeRow({
  className,
  detail,
  icon: Icon,
  title,
  onClick,
}: {
  className?: string;
  detail: string;
  icon: typeof BookOpen;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn("group grid min-h-24 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-4 text-left", className)}
      type="button"
      onClick={onClick}
    >
      <span className="grid size-9 place-items-center border border-border bg-muted/30 text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted-foreground">{title}</span>
        <span className="mt-1 block truncate text-sm font-semibold text-foreground">{detail}</span>
      </span>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </button>
  );
}

function RecentRunRow({ locale, task }: { locale: "ko" | "en"; task: TaskDefinition }) {
  const { t } = useLocale();
  const run = task.lastRun;
  if (!run) return null;
  const normalizedStatus = run.status.toLowerCase();
  const failed = normalizedStatus === "failed" || normalizedStatus === "error";
  const statusLabel = {
    cancelled: t("automation.run.statusCancelled"),
    error: t("automation.run.statusFailed"),
    failed: t("automation.run.statusFailed"),
    idle: t("automation.run.statusIdle"),
    pending: t("automation.run.statusPending"),
    running: t("automation.run.statusRunning"),
    success: t("automation.run.statusSuccess"),
    succeeded: t("automation.run.statusSuccess"),
  }[normalizedStatus] ?? t("automation.run.statusUnknown", { status: run.status });
  return (
    <div className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-2.5" data-local-home-run-status={run.status}>
      <Play className={cn("size-3.5", failed ? "text-destructive" : "text-muted-foreground")} />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{task.name || task.documentPath}</div>
        <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{run.output || run.error || task.documentPath}</div>
      </div>
      <div className="text-right text-[11px] text-muted-foreground">
        <div className={cn("font-medium", failed && "text-destructive")}>{statusLabel}</div>
        <time>{formatRunTime(run.finishedAt || run.startedAt, locale)}</time>
      </div>
    </div>
  );
}

function LocalCommand({
  detail,
  icon: Icon,
  label,
  onClick,
}: {
  detail: string;
  icon: typeof Workflow;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      className="h-10 justify-start gap-2 px-3 xl:h-auto xl:min-h-16 xl:items-start xl:py-3"
      type="button"
      variant="outline"
      onClick={onClick}
    >
      <Icon className="size-4 shrink-0 xl:mt-0.5" />
      <span className="min-w-0 text-left">
        <span className="block truncate">{label}</span>
        <span className="mt-1 hidden truncate text-[11px] font-normal text-muted-foreground xl:block">{detail}</span>
      </span>
    </Button>
  );
}

function runTimestamp(task: TaskDefinition) {
  return task.lastRun?.finishedAt || task.lastRun?.startedAt || "";
}

function formatRunTime(value: string | null | undefined, locale: "ko" | "en") {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(localeDateFormat(locale), {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
