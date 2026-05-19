import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Play,
  RefreshCw,
  ShieldAlert,
  TerminalSquare,
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
import type { AutomationSection } from "@/lib/surfaceModel";
import { cn } from "@/lib/utils";
import type {
  EStopStatus,
  SchedulerStatus,
  TaskDefinition,
} from "@/types";

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
              <h1 className="text-2xl font-semibold tracking-normal">자동화</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                자동화는 반복 작업을 스크립트로 만들고, 태스크는 그 스크립트를 정해진 시간에 실행합니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <IconButton label="새로고침" onClick={onRefresh}>
                <RefreshCw />
              </IconButton>
              <IconButton
                label={eStop.active ? "긴급 정지 해제" : "긴급 정지"}
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
                <CardTitle>Codaro 자동화</CardTitle>
                <CardDescription>기본 제공 자동화 템플릿입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["파일 정리", "웹 리포트 수집", "엑셀 반복 작업"].map((name) => (
                  <div className="flex items-center gap-3 rounded-md border bg-muted/10 px-3 py-2" key={name}>
                    <Workflow className="size-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{name}</div>
                      <div className="truncate text-xs text-muted-foreground">채팅에서 목표를 말하면 노트북/스크립트로 바꿉니다.</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card id={automationSectionId("custom")} className={sectionCardClass(activeSection, "custom")}>
              <CardHeader>
                <CardTitle>나만의 자동화</CardTitle>
                <CardDescription>사용자가 만든 자동화 스크립트입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.length ? (
                  tasks.map((task) => (
                    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/10 px-3 py-2" key={task.id}>
                      <TerminalSquare className="size-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{task.name || task.documentPath}</div>
                        <div className="truncate text-xs text-muted-foreground">{task.documentPath}</div>
                      </div>
                      <Badge variant={task.enabled ? "secondary" : "outline"}>{task.enabled ? "사용 중" : "꺼짐"}</Badge>
                      <IconButton
                        disabled={!task.enabled || eStop.active}
                        label={`${task.name || task.documentPath} 실행`}
                        onClick={() => onRunTask(task)}
                      >
                        <Play />
                      </IconButton>
                    </div>
                  ))
                ) : (
                  <EmptyState title="아직 없음" detail="채팅에서 반복 작업을 말하면 자동화가 생성됩니다." />
                )}
              </CardContent>
            </Card>
          </section>

          <Card id={automationSectionId("tasks")} className={sectionCardClass(activeSection, "tasks")}>
            <CardHeader>
              <CardTitle>태스크</CardTitle>
              <CardDescription>자동화 스크립트를 몇 시 몇 분에 실행할지 정하는 예약입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Metric label="자동화" value={String(tasks.length)} />
                <Metric label="예약 중" value={String(scheduler.jobCount)} />
                <Metric label="상태" tone={eStop.active ? "warning" : "default"} value={eStop.active ? "정지" : "준비"} />
              </div>
              {tasks.length ? (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/10 px-3 py-2" key={`${task.id}-schedule`}>
                      <Clock3 className="size-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{task.name || task.documentPath}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {task.schedule ? `예약: ${task.schedule}` : "예약 없음"}
                        </div>
                      </div>
                      <Badge variant="outline">{task.enabled ? "활성" : "비활성"}</Badge>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className={cn("rounded-md bg-muted/30 p-3", eStop.active && "bg-destructive/10")}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {eStop.active ? <AlertTriangle className="size-4 text-destructive" /> : <CheckCircle2 className="size-4 text-muted-foreground" />}
                  {eStop.active ? "자동화 정지됨" : "자동화 준비됨"}
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {eStop.active ? eStop.reason : `최근 실행 기록 ${auditCount}개를 확인할 수 있습니다.`}
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
