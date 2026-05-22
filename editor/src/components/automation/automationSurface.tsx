import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FileCode2,
  ListChecks,
  Play,
  RefreshCw,
  ShieldAlert,
  Workflow,
} from "lucide-react";
import { useEffect } from "react";

import {
  EmptyState,
  IconButton,
  Metric,
} from "@/components/app/appPrimitives";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocale } from "@/lib/localeContext";
import { localeDateFormat } from "@/lib/localeCopy";
import type { AutomationSection } from "@/lib/surfaceModel";
import { cn } from "@/lib/utils";
import type {
  EStopStatus,
  SchedulerStatus,
  TaskDefinition,
} from "@/types";

const codaroAutomationTemplates = [
  {
    titleKey: "automation.template.browser.title",
    descriptionKey: "automation.template.browser.description",
    tagKey: "automation.template.browser.tag",
  },
  {
    titleKey: "automation.template.files.title",
    descriptionKey: "automation.template.files.description",
    tagKey: "automation.template.files.tag",
  },
  {
    titleKey: "automation.template.excel.title",
    descriptionKey: "automation.template.excel.description",
    tagKey: "automation.template.excel.tag",
  },
  {
    titleKey: "automation.template.screen.title",
    descriptionKey: "automation.template.screen.description",
    tagKey: "automation.template.screen.tag",
  },
];

export function AutomationView({
  activeSection,
  auditCount,
  eStop,
  scheduler,
  tasks,
  onRefresh,
  onRunTask,
  onToggleEStop,
}: {
  activeSection: AutomationSection;
  auditCount: number;
  eStop: EStopStatus;
  scheduler: SchedulerStatus;
  tasks: TaskDefinition[];
  onRefresh: () => void;
  onRunTask: (task: TaskDefinition) => void;
  onToggleEStop: () => void;
}) {
  const { locale, t } = useLocale();
  useEffect(() => {
    window.document
      .getElementById(automationSectionId(activeSection))
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [activeSection]);

  return (
    <ScrollArea className="h-[calc(100vh-40px)] min-h-0">
      <div className="p-4">
        <div className="mx-auto max-w-6xl space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">{t("automation.section.title")}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {t("automation.section.description")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <IconButton label={t("automation.refresh")} onClick={onRefresh}>
                <RefreshCw />
              </IconButton>
              <IconButton
                label={eStop.active ? t("automation.eStop.clear") : t("automation.eStop.trigger")}
                variant="destructive"
                onClick={onToggleEStop}
              >
                <ShieldAlert />
              </IconButton>
            </div>
          </div>

          <section className="grid gap-3 md:grid-cols-2">
            <Card id={automationSectionId("codaro")} className={sectionCardClass(activeSection, "codaro")}>
              <CardHeader>
                <CardTitle>{t("automation.codaro.title")}</CardTitle>
                <CardDescription>{t("automation.codaro.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {codaroAutomationTemplates.map((template) => (
                  <div className="flex items-start gap-3 rounded-md border bg-muted/10 px-3 py-2" key={template.titleKey}>
                    <Workflow className="size-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="truncate text-sm font-medium">{t(template.titleKey)}</div>
                        <Badge className="ml-auto shrink-0" variant="outline">{t(template.tagKey)}</Badge>
                      </div>
                      <div className="mt-1 text-xs leading-5 text-muted-foreground">{t(template.descriptionKey)}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card id={automationSectionId("custom")} className={sectionCardClass(activeSection, "custom")}>
              <CardHeader>
                <CardTitle>{t("automation.custom.title")}</CardTitle>
                <CardDescription>{t("automation.custom.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.length ? (
                  tasks.map((task) => (
                    <div className="flex flex-wrap items-start gap-3 rounded-md border bg-muted/10 px-3 py-2" key={task.id}>
                      <FileCode2 className="mt-0.5 size-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{task.name || task.documentPath}</div>
                        <div className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {task.description || t("automation.task.defaultDescription")}
                        </div>
                        <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{task.documentPath}</div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                        <Badge variant={task.enabled ? "secondary" : "outline"}>{task.enabled ? t("automation.task.enabled") : t("automation.task.disabled")}</Badge>
                        <Badge variant="outline">{task.schedule ? t("automation.task.scheduled") : t("automation.task.manual")}</Badge>
                      </div>
                      <IconButton
                        disabled={!task.enabled || eStop.active}
                        label={t("automation.task.run", { name: task.name || task.documentPath })}
                        onClick={() => onRunTask(task)}
                      >
                        <Play />
                      </IconButton>
                    </div>
                  ))
                ) : (
                  <EmptyState title={t("automation.empty.title")} detail={t("automation.empty.detail")} />
                )}
              </CardContent>
            </Card>
          </section>

          <Card id={automationSectionId("tasks")} className={sectionCardClass(activeSection, "tasks")}>
            <CardHeader>
              <CardTitle>{t("automation.tasks.title")}</CardTitle>
              <CardDescription>{t("automation.tasks.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Metric label={t("automation.metric.automations")} value={String(tasks.length)} />
                <Metric label={t("automation.metric.scheduled")} value={String(scheduler.jobCount)} />
                <Metric label={t("automation.metric.status")} tone={eStop.active ? "warning" : "default"} value={eStop.active ? t("automation.task.statusStopped") : t("automation.task.statusReady")} />
              </div>
              {tasks.length ? (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div className="flex flex-wrap items-start gap-3 rounded-md border bg-muted/10 px-3 py-2" key={`${task.id}-schedule`}>
                      <CalendarClock className="mt-0.5 size-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{task.name || task.documentPath}</div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs leading-5 text-muted-foreground">
                          <span>{scheduleLabel(task, t)}</span>
                          <span>{lastRunLabel(task, t, locale)}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{task.enabled ? t("automation.task.statusEnabled") : t("automation.task.statusDisabled")}</Badge>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className={cn("rounded-md bg-muted/30 p-3", eStop.active && "bg-destructive/10")}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {eStop.active ? <AlertTriangle className="size-4 text-destructive" /> : <CheckCircle2 className="size-4 text-muted-foreground" />}
                  {eStop.active ? t("automation.stopped") : t("automation.ready")}
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {eStop.active ? eStop.reason : t("automation.recentAudit", { count: auditCount })}
                </p>
              </div>
              <div className="rounded-md border bg-muted/10 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ListChecks className="size-4 text-muted-foreground" />
                  {t("automation.task.standard.title")}
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {t("automation.task.standard.detail")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}

function automationSectionId(section: AutomationSection) {
  return `automation-section-${section}`;
}

function sectionCardClass(activeSection: AutomationSection, section: AutomationSection) {
  return cn("scroll-mt-3", activeSection === section && "ring-1 ring-ring/40");
}

function scheduleLabel(task: TaskDefinition, t: (key: string, values?: Record<string, string | number>) => string) {
  return task.schedule ? t("automation.task.schedulePrefix", { schedule: task.schedule }) : t("automation.task.noSchedule");
}

function lastRunLabel(
  task: TaskDefinition,
  t: (key: string, values?: Record<string, string | number>) => string,
  locale: "ko" | "en",
) {
  if (!task.lastRun) return t("automation.task.lastRunNone");
  const status = task.lastRun.status === "success"
    ? t("automation.task.successRecent")
    : t("automation.task.recentStatus", { status: task.lastRun.status });
  if (!task.lastRun.finishedAt && !task.lastRun.startedAt) return status;
  const timestamp = task.lastRun.finishedAt ?? task.lastRun.startedAt;
  return `${status}: ${formatShortDate(timestamp, locale)}`;
}

function formatShortDate(value: string | null | undefined, locale: "ko" | "en") {
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
