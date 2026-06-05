import {
  BookOpenCheck,
  Clipboard,
  DoorOpen,
  Loader2,
  RefreshCw,
  Send,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAssignmentRoomState } from "@/hooks/useAssignmentRoomState";
import type { AssignmentDashboardPayload, CodaroDocument } from "@/types";

export type AssignmentRoomPanelProps = {
  category: string;
  contentId: string;
  document: CodaroDocument;
  onOpenMaterial?: (document: CodaroDocument, title: string) => void;
};

export function AssignmentRoomPanel({
  category,
  contentId,
  document,
  onOpenMaterial,
}: AssignmentRoomPanelProps) {
  const [joinCode, setJoinCode] = useState("");
  const [studentTag, setStudentTag] = useState("");
  const {
    busy,
    clear,
    createFromCurrentLesson,
    dashboard,
    error,
    join,
    openMaterial,
    publish,
    reloadDashboard,
    session,
  } = useAssignmentRoomState({
    category,
    contentId,
    document,
    onOpenMaterial,
  });
  const published = Boolean(session?.joinCode);

  const dashboardSummary = useMemo(() => summarizeDashboard(dashboard), [dashboard]);

  const submitJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!joinCode.trim() || !studentTag.trim()) return;
    void join(joinCode.trim(), studentTag.trim());
  };

  return (
    <section className="mt-5 border-t pt-4" data-assignment-room-panel="true">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
            <Users className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold tracking-normal">과제방</h2>
              {session ? (
                <Badge variant={session.role === "tutor" ? "secondary" : "outline"}>
                  {session.role === "tutor" ? "튜터" : "학생"}
                </Badge>
              ) : null}
              {published ? <Badge variant="outline">공개됨</Badge> : null}
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {session?.title ?? document.title}
            </p>
          </div>
        </div>

        {session ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              className="h-8 gap-1.5 px-2.5 text-xs"
              data-assignment-room-open-material="true"
              disabled={busy}
              size="sm"
              variant="outline"
              onClick={() => void openMaterial()}
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <BookOpenCheck className="size-3.5" />}
              자료 열기
            </Button>
            <Button
              className="size-8 p-0"
              disabled={busy}
              size="icon"
              title="과제방 나가기"
              variant="ghost"
              onClick={clear}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>

      {session ? (
        <ActiveAssignmentRoom
          busy={busy}
          dashboard={dashboard}
          dashboardSummary={dashboardSummary}
          published={published}
          role={session.role}
          joinCode={session.joinCode ?? ""}
          onCopyJoinCode={() => void copyText(session.joinCode ?? "")}
          onPublish={() => void publish()}
          onReloadDashboard={() => void reloadDashboard()}
        />
      ) : (
        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]">
          <div className="flex min-w-0 flex-col gap-2 border-t pt-3 lg:border-t-0 lg:pt-0">
            <div className="text-xs font-medium text-muted-foreground">튜터</div>
            <Button
              className="h-8 w-fit gap-1.5 px-2.5 text-xs"
              data-assignment-room-create="true"
              disabled={busy}
              size="sm"
              variant="secondary"
              onClick={() => void createFromCurrentLesson()}
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              현재 레슨으로 과제 만들기
            </Button>
          </div>
          <form
            className="grid min-w-0 gap-2 border-t pt-3 sm:grid-cols-[1fr_1fr_auto] lg:border-t-0 lg:pt-0"
            data-assignment-room-join="true"
            onSubmit={submitJoin}
          >
            <Input
              className="h-8 text-xs uppercase"
              placeholder="입장 코드"
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
            />
            <Input
              className="h-8 text-xs"
              placeholder="학생 태그"
              value={studentTag}
              onChange={(event) => setStudentTag(event.target.value)}
            />
            <Button
              className="h-8 gap-1.5 px-2.5 text-xs"
              disabled={busy || !joinCode.trim() || !studentTag.trim()}
              size="sm"
              type="submit"
              variant="outline"
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <DoorOpen className="size-3.5" />}
              참가
            </Button>
          </form>
        </div>
      )}

      {error ? (
        <p className="mt-3 text-xs leading-5 text-destructive" data-assignment-room-error="true">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function ActiveAssignmentRoom({
  busy,
  dashboard,
  dashboardSummary,
  joinCode,
  published,
  role,
  onCopyJoinCode,
  onPublish,
  onReloadDashboard,
}: {
  busy: boolean;
  dashboard: AssignmentDashboardPayload | null;
  dashboardSummary: string;
  joinCode: string;
  published: boolean;
  role: "student" | "tutor";
  onCopyJoinCode: () => void;
  onPublish: () => void;
  onReloadDashboard: () => void;
}) {
  if (role !== "tutor") {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
        <Badge variant="outline">동기화 준비됨</Badge>
        <span>검증과 미션 완료가 과제방 진행 로그에 기록됩니다.</span>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3" data-assignment-room-dashboard="true">
      <div className="flex flex-wrap items-center gap-2 border-t pt-3">
        {published ? (
          <>
            <Badge className="h-7 rounded-md px-2 text-xs" variant="secondary">
              코드 {joinCode}
            </Badge>
            <Button className="h-7 gap-1.5 px-2 text-xs" size="sm" variant="outline" onClick={onCopyJoinCode}>
              <Clipboard className="size-3.5" />
              복사
            </Button>
          </>
        ) : (
          <Button
            className="h-7 gap-1.5 px-2 text-xs"
            data-assignment-room-publish="true"
            disabled={busy}
            size="sm"
            variant="secondary"
            onClick={onPublish}
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            공개 코드 발급
          </Button>
        )}
        <Button className="h-7 gap-1.5 px-2 text-xs" disabled={busy} size="sm" variant="outline" onClick={onReloadDashboard}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          대시보드
        </Button>
        {dashboardSummary ? <span className="text-xs text-muted-foreground">{dashboardSummary}</span> : null}
      </div>

      {dashboard?.participants.length ? (
        <div className="divide-y border-y text-xs">
          {dashboard.participants.slice(0, 6).map((participant) => (
            <div className="grid gap-1 py-2 sm:grid-cols-[minmax(120px,1fr)_auto_auto_auto]" key={participant.participantId}>
              <div className="min-w-0">
                <div className="truncate font-medium">{participant.displayName || participant.studentTag}</div>
                <div className="truncate text-muted-foreground">{participant.currentSectionId || "아직 시작 전"}</div>
              </div>
              <Badge className="w-fit" variant="outline">{statusText(participant.learningStatus)}</Badge>
              <span className="self-center text-muted-foreground">통과 {participant.checkPassedCount}</span>
              <span className="self-center text-muted-foreground">실패 {participant.checkFailedCount}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function summarizeDashboard(dashboard: AssignmentDashboardPayload | null): string {
  if (!dashboard) return "";
  const counts = dashboard.statusCounts;
  return `참가 ${dashboard.participants.length}명 · 진행 ${counts.inProgress}명 · 완료 ${counts.completed}명`;
}

function statusText(status: AssignmentDashboardPayload["participants"][number]["learningStatus"]): string {
  if (status === "completed") return "완료";
  if (status === "stuck") return "막힘";
  if (status === "inProgress") return "진행";
  return "대기";
}

async function copyText(value: string): Promise<void> {
  if (!value || !navigator.clipboard?.writeText) return;
  await navigator.clipboard.writeText(value);
}
