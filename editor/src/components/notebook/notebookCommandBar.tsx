import {
  CircleAlert,
  Loader2,
  Play,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { NotebookPersistenceState } from "@/lib/notebookPersistence";

export function NotebookCommandBar({
  apiOnline,
  canRun,
  notebookRunning,
  persistence,
  runningBlockId,
  title,
  onCommitTitle,
  onRunNotebook,
  onTitleChange,
}: {
  apiOnline: boolean;
  canRun: boolean;
  notebookRunning: boolean;
  persistence: NotebookPersistenceState;
  runningBlockId: string | null;
  title: string;
  onCommitTitle: (title: string) => void;
  onRunNotebook: () => void;
  onTitleChange: (title: string) => void;
}) {
  const running = notebookRunning || runningBlockId !== null;
  const persistenceView = notebookPersistenceView(persistence);
  const showPersistence = persistence.phase === "saving"
    || persistence.phase === "pending"
    || persistence.phase === "error";

  return (
    <>
      <header
        className="notebookCommandBar"
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

        <div className="notebookDocumentIdentity">
          <input
            aria-label="노트북 파일명"
            className="notebookTitleInput"
            value={title}
            onBlur={(event) => onCommitTitle(normalizeNotebookFilename(event.target.value))}
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </div>
      </header>

      <div className="notebookFloatingTools" role="toolbar" aria-label="노트북 실행">
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

function normalizeNotebookFilename(value: string) {
  const trimmed = value.trim() || "notebook.py";
  if (trimmed.toLowerCase().endsWith(".py")) return trimmed;
  return `${trimmed.replace(/\.[^/.]+$/, "")}.py`;
}
