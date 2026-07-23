import {
  Activity,
  CalendarClock,
  History,
  RefreshCw,
  ShieldAlert,
  Wifi,
  WifiOff,
} from "lucide-react";

import { IconButton } from "@/components/app/appPrimitives";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/localeContext";
import { cn } from "@/lib/utils";
import type { EStopStatus, SchedulerStatus, TaskDefinition } from "@/types";

export function AutomationOperationStrip({
  apiOnline,
  auditCount,
  eStop,
  scheduler,
  tasks,
  onRefresh,
  onToggleEStop,
}: {
  apiOnline: boolean;
  auditCount: number;
  eStop: EStopStatus;
  scheduler: SchedulerStatus;
  tasks: TaskDefinition[];
  onRefresh: () => void;
  onToggleEStop: () => void;
}) {
  const { t } = useLocale();
  return (
    <section
      className="sticky top-0 z-20 overflow-x-auto border-y border-border bg-background/95 backdrop-blur-sm"
      data-automation-estop-state={eStop.active ? "active" : "clear"}
      data-automation-operation-strip="true"
    >
      <div className="grid min-w-[600px] grid-cols-[repeat(4,minmax(84px,1fr))_auto]">
        <OperationMetric
          icon={Activity}
          label={t("automation.operation.tasks")}
          value={String(tasks.length)}
        />
        <OperationMetric
          icon={CalendarClock}
          label={t("automation.operation.jobs")}
          value={String(scheduler.jobCount)}
        />
        <OperationMetric
          icon={History}
          label={t("automation.operation.audit")}
          value={String(auditCount)}
        />
        <OperationMetric
          icon={apiOnline ? Wifi : WifiOff}
          label={t("automation.operation.connection")}
          tone={eStop.active ? "danger" : apiOnline ? "ready" : "muted"}
          value={eStop.active
            ? t("automation.task.statusStopped")
            : apiOnline ? t("automation.operation.online") : t("automation.operation.offline")}
        />
        <div className="flex items-center gap-2 border-l border-border px-3 py-2">
          <IconButton
            className="size-8"
            label={t("automation.refresh")}
            onClick={onRefresh}
          >
            <RefreshCw />
          </IconButton>
          <Button
            aria-pressed={eStop.active}
            className="h-8 min-w-32 gap-2 px-3 text-xs"
            data-automation-estop-control="true"
            disabled={!apiOnline}
            size="sm"
            type="button"
            variant="destructive"
            onClick={onToggleEStop}
          >
            <ShieldAlert />
            {eStop.active ? t("automation.eStop.clear") : t("automation.eStop.trigger")}
          </Button>
        </div>
      </div>
      {eStop.active ? (
        <div
          className="border-t border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive"
          data-automation-estop-reason="true"
          role="status"
        >
          {eStop.reason || t("automation.stopped")}
        </div>
      ) : null}
    </section>
  );
}

function OperationMetric({
  icon: Icon,
  label,
  tone = "muted",
  value,
}: {
  icon: typeof Activity;
  label: string;
  tone?: "danger" | "muted" | "ready";
  value: string;
}) {
  return (
    <div className="min-w-0 border-l border-border px-3 py-2 first:border-l-0" data-automation-operation-metric={label}>
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
        <Icon className="size-3" />
        <span className="truncate">{label}</span>
      </div>
      <div className={cn(
        "mt-1 truncate text-sm font-semibold",
        tone === "danger" && "text-destructive",
        tone === "ready" && "text-success",
      )}>
        {value}
      </div>
    </div>
  );
}
