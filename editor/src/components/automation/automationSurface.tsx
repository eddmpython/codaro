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
import type { AutomationSection } from "@/lib/surfaceModel";
import { cn } from "@/lib/utils";
import type {
  EStopStatus,
  SchedulerStatus,
  TaskDefinition,
} from "@/types";

const codaroAutomationTemplates = [
  {
    title: "브라우저 루틴",
    description: "웹 입력, 수집, 반복 클릭을 셀 단위 자동화로 구성합니다.",
    tag: "브라우저",
  },
  {
    title: "파일 정리",
    description: "다운로드, 이름 변경, 폴더 분류 같은 로컬 작업을 스크립트로 묶습니다.",
    tag: "로컬",
  },
  {
    title: "엑셀 반복 작업",
    description: "워크북 정리, 표 변환, 리포트 생성을 재사용 가능한 자동화로 만듭니다.",
    tag: "문서",
  },
  {
    title: "화면/이미지 자동화",
    description: "화면 상태를 보고 마우스와 키보드 동작으로 이어지는 루틴을 설계합니다.",
    tag: "화면",
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
              <h1 className="text-2xl font-semibold tracking-normal">자동화 루틴</h1>
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
                <CardDescription>바로 시작할 수 있는 자동화 출발점입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {codaroAutomationTemplates.map((template) => (
                  <div className="flex items-start gap-3 rounded-md border bg-muted/10 px-3 py-2" key={template.title}>
                    <Workflow className="size-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="truncate text-sm font-medium">{template.title}</div>
                        <Badge className="ml-auto shrink-0" variant="outline">{template.tag}</Badge>
                      </div>
                      <div className="mt-1 text-xs leading-5 text-muted-foreground">{template.description}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card id={automationSectionId("custom")} className={sectionCardClass(activeSection, "custom")}>
              <CardHeader>
                <CardTitle>나만의 자동화</CardTitle>
                <CardDescription>에디터나 채팅에서 만든 자동화 노트북과 스크립트입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.length ? (
                  tasks.map((task) => (
                    <div className="flex flex-wrap items-start gap-3 rounded-md border bg-muted/10 px-3 py-2" key={task.id}>
                      <FileCode2 className="mt-0.5 size-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{task.name || task.documentPath}</div>
                        <div className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {task.description || "셀 조합으로 만든 자동화입니다."}
                        </div>
                        <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{task.documentPath}</div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                        <Badge variant={task.enabled ? "secondary" : "outline"}>{task.enabled ? "사용 중" : "꺼짐"}</Badge>
                        <Badge variant="outline">{task.schedule ? "예약됨" : "수동 실행"}</Badge>
                      </div>
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
                  <EmptyState title="아직 없음" detail="채팅에서 반복 작업을 말하거나 에디터에서 자동화 셀을 만들면 여기에 쌓입니다." />
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
                    <div className="flex flex-wrap items-start gap-3 rounded-md border bg-muted/10 px-3 py-2" key={`${task.id}-schedule`}>
                      <CalendarClock className="mt-0.5 size-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{task.name || task.documentPath}</div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs leading-5 text-muted-foreground">
                          <span>{scheduleLabel(task)}</span>
                          <span>{lastRunLabel(task)}</span>
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
              <div className="rounded-md border bg-muted/10 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ListChecks className="size-4 text-muted-foreground" />
                  태스크 기준
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  자동화는 실행할 셀/스크립트이고, 태스크는 그 자동화를 언제 실행할지 정한 예약입니다.
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

function scheduleLabel(task: TaskDefinition) {
  return task.schedule ? `예약: ${task.schedule}` : "예약 없음";
}

function lastRunLabel(task: TaskDefinition) {
  if (!task.lastRun) return "아직 실행 기록 없음";
  const status = task.lastRun.status === "success" ? "최근 성공" : `최근 ${task.lastRun.status}`;
  if (!task.lastRun.finishedAt && !task.lastRun.startedAt) return status;
  const timestamp = task.lastRun.finishedAt ?? task.lastRun.startedAt;
  return `${status}: ${formatShortDate(timestamp)}`;
}

function formatShortDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
