import {
  CalendarClock,
  ChevronRight,
  FileCode2,
  Workflow,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { AutomationOperationStrip } from "@/components/automation/automationOperationStrip";
import { AutomationRunInspector } from "@/components/automation/automationRunInspector";
import { LiveAutomationView } from "@/components/automation/liveAutomationView";
import { RuntimeCapabilityRail } from "@/components/app/runtimeCapabilityRail";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { localeDateFormat } from "@/lib/localeCopy";
import { useLocale } from "@/lib/localeContext";
import { isLiveAutomationSection, type AutomationSection } from "@/lib/surfaceModel";
import { cn } from "@/lib/utils";
import type { EStopStatus, SchedulerStatus, TaskDefinition } from "@/types";

const codaroAutomationTemplates = [
  {
    titleKey: "automation.template.browser.title",
    descriptionKey: "automation.template.browser.description",
    tagKey: "automation.template.browser.tag",
    runtime: "web",
  },
  {
    titleKey: "automation.template.files.title",
    descriptionKey: "automation.template.files.description",
    tagKey: "automation.template.files.tag",
    runtime: "local",
  },
  {
    titleKey: "automation.template.excel.title",
    descriptionKey: "automation.template.excel.description",
    tagKey: "automation.template.excel.tag",
    runtime: "local",
  },
  {
    titleKey: "automation.template.screen.title",
    descriptionKey: "automation.template.screen.description",
    tagKey: "automation.template.screen.tag",
    runtime: "local",
  },
] as const;

export function AutomationView({
  activeSection,
  apiOnline,
  auditCount,
  eStop,
  scheduler,
  tasks,
  onRefresh,
  onRunTask,
  onToggleTask,
  onToggleEStop,
}: {
  activeSection: AutomationSection;
  apiOnline: boolean;
  auditCount: number;
  eStop: EStopStatus;
  scheduler: SchedulerStatus;
  tasks: TaskDefinition[];
  onRefresh: () => void;
  onRunTask: (task: TaskDefinition) => void;
  onToggleTask: (task: TaskDefinition) => void;
  onToggleEStop: () => void;
}) {
  const { locale, t } = useLocale();
  const hasMounted = useRef(false);
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id ?? "");
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null,
    [selectedTaskId, tasks],
  );

  useEffect(() => {
    if (!tasks.length) {
      setSelectedTaskId("");
      return;
    }
    if (!tasks.some((task) => task.id === selectedTaskId)) setSelectedTaskId(tasks[0].id);
  }, [selectedTaskId, tasks]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (isLiveAutomationSection(activeSection)) return;
    window.document
      .getElementById(automationSectionId(activeSection))
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [activeSection]);

  if (isLiveAutomationSection(activeSection)) {
    return <LiveAutomationView agentKind={activeSection as "browserUse" | "computerUse"} eStop={eStop} />;
  }

  const selectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    window.requestAnimationFrame(() => detailHeadingRef.current?.focus({ preventScroll: true }));
  };

  return (
    <ScrollArea className="h-full min-h-0">
      <div className="p-3 sm:p-4 xl:pt-12" data-automation-loop="second-loop" data-automation-source="validated-cell-recipe">
        <div className="mx-auto max-w-[1500px] space-y-3">
          <header className="flex min-w-0 items-start gap-3 pl-9">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold tracking-normal">{t("automation.section.title")}</h1>
              <p className="mt-1 max-w-4xl text-xs leading-5 text-muted-foreground">
                {t("automation.section.description")}
              </p>
            </div>
            <Badge variant={eStop.active ? "destructive" : "outline"}>
              {eStop.active ? t("automation.stopped") : t("automation.ready")}
            </Badge>
          </header>

          <RuntimeCapabilityRail apiOnline={apiOnline} surface="automation" />

          <AutomationOperationStrip
            apiOnline={apiOnline}
            auditCount={auditCount}
            eStop={eStop}
            scheduler={scheduler}
            tasks={tasks}
            onRefresh={onRefresh}
            onToggleEStop={onToggleEStop}
          />

          <div
            className="grid min-w-0 border-y border-border md:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] xl:grid-cols-[280px_minmax(380px,1fr)_360px]"
            data-automation-studio-layout="true"
          >
            <aside className="min-w-0 border-b border-border md:border-b-0 md:border-r">
              <section
                className={sectionClass(activeSection, "custom")}
                data-automation-artifact="validated-cell-recipe"
                id={automationSectionId("custom")}
              >
                <SectionHeading
                  count={tasks.length}
                  description={t("automation.custom.description")}
                  title={t("automation.custom.title")}
                />
                <div className="mt-2 divide-y divide-border border-y border-border" data-automation-task-list="true">
                  {tasks.length ? tasks.map((task) => {
                    const selected = task.id === selectedTask?.id;
                    return (
                      <button
                        aria-pressed={selected}
                        className={cn(
                          "grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 px-2 py-2.5 text-left outline-none transition-colors hover:bg-muted/45 focus-visible:bg-muted/55 focus-visible:ring-2 focus-visible:ring-ring/50",
                          selected && "border-l-2 border-l-accent-brand bg-muted/40 pl-1.5",
                        )}
                        data-automation-task-selected={selected ? "true" : "false"}
                        data-automation-task-selector={task.id}
                        key={task.id}
                        type="button"
                        onClick={() => selectTask(task.id)}
                      >
                        <FileCode2 className="mt-0.5 size-3.5 text-muted-foreground" />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold">{task.name || task.documentPath}</span>
                          <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span className="truncate">{scheduleLabel(task, t)}</span>
                            <span aria-hidden="true">·</span>
                            <span className="shrink-0">{lastRunLabel(task, t, locale)}</span>
                          </span>
                        </span>
                        <ChevronRight className={cn("mt-0.5 size-3.5 text-muted-foreground", selected && "text-accent-brand")} />
                      </button>
                    );
                  }) : (
                    <p className="px-2 py-5 text-xs leading-5 text-muted-foreground">
                      {t("automation.empty.detail")}
                    </p>
                  )}
                </div>
              </section>

              <section className={sectionClass(activeSection, "codaro")} id={automationSectionId("codaro")}>
                <SectionHeading
                  count={codaroAutomationTemplates.length}
                  description={t("automation.codaro.description")}
                  title={t("automation.task.referenceTemplates")}
                />
                <div className="mt-2 divide-y divide-border border-y border-border">
                  {codaroAutomationTemplates.map((template) => (
                    <div
                      className={cn(
                        "grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-2 px-2 py-2.5",
                        template.runtime === "local" && !apiOnline && "opacity-60",
                      )}
                      data-runtime-requirement={template.runtime}
                      key={template.titleKey}
                    >
                      <Workflow className="mt-0.5 size-3.5 text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate text-xs font-medium">{t(template.titleKey)}</span>
                          <Badge className="ml-auto" variant="outline">{t(template.tagKey)}</Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
                          {t(template.descriptionKey)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>

            <main
              className={cn("min-w-0 scroll-mt-3", activeSection === "tasks" && "bg-muted/15")}
              id={automationSectionId("tasks")}
            >
              <TaskDetail headingRef={detailHeadingRef} task={selectedTask} />
            </main>

            <div className="min-w-0 md:col-span-2 xl:col-span-1">
              <AutomationRunInspector
                apiOnline={apiOnline}
                eStop={eStop}
                task={selectedTask}
                onRunTask={onRunTask}
                onToggleTask={onToggleTask}
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function TaskDetail({
  headingRef,
  task,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  task: TaskDefinition | null;
}) {
  const { locale, t } = useLocale();
  if (!task) {
    return (
      <div className="grid min-h-72 place-items-center px-6 py-10 text-center" data-automation-task-detail="empty">
        <div>
          <FileCode2 className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">{t("automation.task.notSelected")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("automation.task.notSelectedDetail")}</p>
        </div>
      </div>
    );
  }
  const inputs = Object.entries(task.inputs ?? {});
  return (
    <article className="min-w-0" data-automation-task-detail={task.id}>
      <header className="border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-md font-semibold outline-none" ref={headingRef} tabIndex={-1}>
              {task.name || task.documentPath}
            </h2>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">
              {task.description || t("automation.task.defaultDescription")}
            </p>
          </div>
          <Badge variant={task.enabled ? "secondary" : "outline"}>
            {task.enabled ? t("automation.task.statusEnabled") : t("automation.task.statusDisabled")}
          </Badge>
        </div>
      </header>

      <div className="grid min-w-0 gap-0 lg:grid-cols-2">
        <DetailSection className="lg:border-r" icon={FileCode2} title={t("automation.task.path")}>
          <code className="block break-all font-mono text-xs leading-5">{task.documentPath}</code>
        </DetailSection>
        <DetailSection icon={CalendarClock} title={t("automation.task.trigger")}>
          <div className="text-xs font-medium">{task.schedule || t("automation.task.manual")}</div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            {task.schedule ? t("automation.task.scheduled") : t("automation.task.noSchedule")}
          </div>
        </DetailSection>
        <DetailSection className="lg:border-r" icon={Workflow} title={t("automation.task.inputs")}>
          {inputs.length ? (
            <dl className="divide-y divide-border/70">
              {inputs.map(([key, value]) => (
                <div className="grid grid-cols-[minmax(80px,0.45fr)_minmax(0,1fr)] gap-3 py-1.5" key={key}>
                  <dt className="truncate font-mono text-[10px] text-muted-foreground">{key}</dt>
                  <dd className="break-words font-mono text-[10px] text-foreground">{formatValue(value)}</dd>
                </div>
              ))}
            </dl>
          ) : <p className="text-xs text-muted-foreground">{t("common.none")}</p>}
        </DetailSection>
        <DetailSection icon={Workflow} title={t("automation.task.outputs")}>
          {task.outputs.length ? (
            <div className="flex flex-wrap gap-1.5">
              {task.outputs.map((output) => <Badge key={output} variant="outline">{output}</Badge>)}
            </div>
          ) : <p className="text-xs text-muted-foreground">{t("common.none")}</p>}
        </DetailSection>
      </div>

      <footer className="grid gap-2 border-t border-border px-4 py-2 text-[10px] text-muted-foreground sm:grid-cols-2">
        <span>{t("automation.task.updated")}: {formatDate(task.updatedAt, locale)}</span>
        <span className="sm:text-right">task id: <code className="font-mono">{task.id}</code></span>
      </footer>
    </article>
  );
}

function DetailSection({
  children,
  className,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  className?: string;
  icon: typeof FileCode2;
  title: string;
}) {
  return (
    <section className={cn("min-h-32 border-b border-border px-4 py-3", className)}>
      <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
        <Icon className="size-3" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function SectionHeading({ count, description, title }: { count: number; description: string; title: string }) {
  return (
    <header className="px-1">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-semibold">{title}</h2>
        <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">{count}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">{description}</p>
    </header>
  );
}

function automationSectionId(section: AutomationSection) {
  return `automation-section-${section}`;
}

function sectionClass(activeSection: AutomationSection, section: AutomationSection) {
  return cn(
    "scroll-mt-3 px-2 py-3 transition-colors",
    activeSection === section && "bg-muted/20",
  );
}

function scheduleLabel(task: TaskDefinition, t: (key: string, values?: Record<string, string | number>) => string) {
  return task.schedule ? t("automation.task.schedulePrefix", { schedule: task.schedule }) : t("automation.task.manual");
}

function lastRunLabel(
  task: TaskDefinition,
  t: (key: string, values?: Record<string, string | number>) => string,
  locale: "ko" | "en",
) {
  if (!task.lastRun) return t("automation.task.lastRunNone");
  if (!task.lastRun.finishedAt && !task.lastRun.startedAt) return task.lastRun.status;
  return formatShortDate(task.lastRun.finishedAt ?? task.lastRun.startedAt, locale);
}

function formatDate(value: string, locale: "ko" | "en") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(localeDateFormat(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

function formatValue(value: unknown) {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
