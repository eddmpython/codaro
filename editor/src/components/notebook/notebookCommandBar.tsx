import {
  AlignCenter,
  AlignJustify,
  CircleAlert,
  Loader2,
  Maximize,
  Play,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { NotebookPersistenceState } from "@/lib/notebookPersistence";

export type NotebookWidth = "compact" | "medium" | "full";

export function NotebookCommandBar({
  apiOnline,
  canRun,
  notebookRunning,
  persistence,
  reactiveEnabled,
  runningBlockId,
  width,
  onRunNotebook,
  onToggleReactive,
  onWidthChange,
}: {
  apiOnline: boolean;
  canRun: boolean;
  notebookRunning: boolean;
  persistence: NotebookPersistenceState;
  reactiveEnabled: boolean;
  runningBlockId: string | null;
  width: NotebookWidth;
  onRunNotebook: () => void;
  onToggleReactive: () => void;
  onWidthChange: (width: NotebookWidth) => void;
}) {
  const running = notebookRunning || runningBlockId !== null;
  const persistenceView = notebookPersistenceView(persistence);
  const showPersistence = persistence.phase === "saving"
    || persistence.phase === "pending"
    || persistence.phase === "error";

  return (
    <>
      <header
        className="notebookRuntimeStatusBar"
        data-notebook-runtime={apiOnline ? "local" : "web"}
      >
        <div className="notebookDocumentStatus" aria-label="실행 및 저장 상태">
          <span
            aria-hidden="true"
            className="notebookPersistenceProbe"
            data-notebook-persistence={persistence.phase}
            data-notebook-persistence-mode={persistence.mode}
          />
          {running ? (
            <span className="notebookStatusItem" aria-live="polite">
              <Loader2 aria-hidden="true" className="animate-spin" />
              <span>실행 중</span>
            </span>
          ) : null}
          {showPersistence ? (
            <span
              aria-live="polite"
              className="notebookStatusItem notebookPersistenceStatus"
              data-notebook-persistence={persistence.phase}
              data-notebook-persistence-mode={persistence.mode}
              title={persistenceView.detail}
            >
              {persistence.phase === "error"
                ? <CircleAlert aria-hidden="true" />
                : <Loader2 aria-hidden="true" className={persistence.phase === "saving" ? "animate-spin" : undefined} />}
              <span>{persistenceView.label}</span>
            </span>
          ) : null}
        </div>
      </header>

      <div className="notebookWidthTools" role="toolbar" aria-label="노트북 셀 폭">
        <button
          aria-label="좁은 셀 폭"
          aria-pressed={width === "compact"}
          className="notebookWidthButton"
          data-notebook-width-option="compact"
          onClick={() => onWidthChange("compact")}
          title="좁게"
          type="button"
        >
          <AlignCenter aria-hidden="true" />
        </button>
        <button
          aria-label="기본 셀 폭"
          aria-pressed={width === "medium"}
          className="notebookWidthButton"
          data-notebook-width-option="medium"
          onClick={() => onWidthChange("medium")}
          title="기본"
          type="button"
        >
          <AlignJustify aria-hidden="true" />
        </button>
        <button
          aria-label="전체 셀 폭"
          aria-pressed={width === "full"}
          className="notebookWidthButton"
          data-notebook-width-option="full"
          onClick={() => onWidthChange("full")}
          title="전체 너비"
          type="button"
        >
          <Maximize aria-hidden="true" />
        </button>
      </div>

      <div className="notebookFloatingTools" role="toolbar" aria-label="노트북 실행">
        <button
          aria-label={reactiveEnabled ? "자동 반응 실행 끄기" : "자동 반응 실행 켜기"}
          aria-pressed={reactiveEnabled}
          className="notebookReactiveButton"
          data-notebook-reactive-toggle="true"
          onClick={onToggleReactive}
          title={reactiveEnabled ? "자동 반응 실행 켜짐" : "자동 반응 실행 꺼짐"}
          type="button"
        >
          <Zap aria-hidden="true" />
        </button>
        <Button
          aria-label="모든 셀 실행"
          className="notebookRunAllButton"
          disabled={!canRun || running}
          title="모든 셀 실행"
          type="button"
          onClick={onRunNotebook}
        >
          {running
            ? <Loader2 aria-hidden="true" className="animate-spin" />
            : <Play aria-hidden="true" />}
        </Button>
      </div>
    </>
  );
}

function notebookPersistenceView(persistence: NotebookPersistenceState): {
  detail: string;
  label: string;
} {
  if (persistence.phase === "error") {
    return {
      detail: persistence.error ?? "저장 위치에 접근하지 못했습니다.",
      label: "저장 실패",
    };
  }
  if (persistence.phase === "saving") {
    return {
      detail: persistence.mode === "local"
        ? "현재 파일에 변경 내용을 저장하고 있습니다."
        : "이 브라우저에 변경 내용을 저장하고 있습니다.",
      label: "저장 중",
    };
  }
  return {
    detail: "입력이 멈추면 변경 내용을 자동 저장합니다.",
    label: "저장 대기",
  };
}
