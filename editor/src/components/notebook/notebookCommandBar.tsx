import {
  CircleAlert,
  FileCode2,
  Globe2,
  HardDrive,
  Loader2,
  MessageSquarePlus,
  Play,
  Save,
  SquareTerminal,
} from "lucide-react";

import { IconButton } from "@/components/app/appPrimitives";
import { Button } from "@/components/ui/button";
import type { NotebookPersistenceState } from "@/lib/notebookPersistence";

export function NotebookCommandBar({
  activeCellLabel,
  apiOnline,
  canRun,
  notebookRunning,
  persistence,
  runningBlockId,
  title,
  onAddCodeCell,
  onAddMarkdownCell,
  onCommitTitle,
  onRunNotebook,
  onTitleChange,
}: {
  activeCellLabel: string;
  apiOnline: boolean;
  canRun: boolean;
  notebookRunning: boolean;
  persistence: NotebookPersistenceState;
  runningBlockId: string | null;
  title: string;
  onAddCodeCell: () => void;
  onAddMarkdownCell: () => void;
  onCommitTitle: (title: string) => void;
  onRunNotebook: () => void;
  onTitleChange: (title: string) => void;
}) {
  const running = notebookRunning || runningBlockId !== null;
  const RuntimeIcon = apiOnline ? HardDrive : Globe2;
  const runtimeLabel = apiOnline ? "Local" : "Web Run";
  const persistenceView = notebookPersistenceView(persistence);
  const PersistenceIcon = persistence.phase === "saving"
    ? Loader2
    : persistence.phase === "error"
      ? CircleAlert
      : Save;

  return (
    <header className="notebookCommandBar">
      <div className="notebookDocumentIdentity">
        <FileCode2 aria-hidden="true" className="notebookDocumentIcon" />
        <div className="notebookDocumentName">
          <input
            aria-label="노트북 파일명"
            className="notebookTitleInput"
            value={title}
            onBlur={(event) => onCommitTitle(normalizeNotebookFilename(event.target.value))}
            onChange={(event) => onTitleChange(event.target.value)}
          />
          <span className="notebookActiveCell" data-notebook-active-cell="true">
            {activeCellLabel}
          </span>
        </div>
      </div>

      <div className="notebookDocumentStatus" aria-label="실행 및 저장 상태">
        <span className="notebookStatusItem" data-notebook-runtime={apiOnline ? "local" : "web"}>
          <RuntimeIcon aria-hidden="true" />
          <span>{runtimeLabel}</span>
        </span>
        <span
          aria-live="polite"
          className="notebookStatusItem notebookPersistenceStatus"
          data-notebook-persistence={persistence.phase}
          data-notebook-persistence-mode={persistence.mode}
          title={persistenceView.detail}
        >
          <PersistenceIcon
            aria-hidden="true"
            className={persistence.phase === "saving" ? "animate-spin" : undefined}
          />
          <span>{persistenceView.label}</span>
        </span>
      </div>

      <div className="notebookCommandTools" role="toolbar" aria-label="노트북 명령">
        <IconButton
          className="notebookCommandIcon size-9 [&_svg]:size-4"
          label="Python 셀 추가"
          variant="ghost"
          onClick={onAddCodeCell}
        >
          <SquareTerminal />
        </IconButton>
        <IconButton
          className="notebookCommandIcon notebookMarkdownCommand size-9 [&_svg]:size-4"
          label="Markdown 셀 추가"
          variant="ghost"
          onClick={onAddMarkdownCell}
        >
          <MessageSquarePlus />
        </IconButton>
        <Button
          aria-label="모든 셀 실행"
          className="notebookRunAllButton h-10 px-3 max-[640px]:size-11 max-[640px]:px-0"
          disabled={!canRun || running}
          title="모든 셀 실행"
          type="button"
          onClick={onRunNotebook}
        >
          {running ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Play aria-hidden="true" />}
          <span>모두 실행</span>
        </Button>
      </div>
    </header>
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
  if (!persistence.ready) {
    return {
      detail: "문서를 불러온 뒤 저장을 시작합니다.",
      label: "저장 준비 중",
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
  if (persistence.phase === "pending") {
    return {
      detail: "입력이 멈추면 변경 내용을 자동 저장합니다.",
      label: "저장 대기",
    };
  }
  if (persistence.phase === "saved") {
    return {
      detail: persistence.detail
        ? `${persistence.detail}에 저장했습니다.`
        : "변경 내용을 저장했습니다.",
      label: persistence.mode === "local" ? "파일 저장됨" : "브라우저 저장됨",
    };
  }
  return {
    detail: "변경 내용이 생기면 자동 저장합니다.",
    label: "변경 사항 없음",
  };
}

function normalizeNotebookFilename(value: string) {
  const trimmed = value.trim() || "notebook.py";
  if (trimmed.toLowerCase().endsWith(".py")) return trimmed;
  return `${trimmed.replace(/\.[^/.]+$/, "")}.py`;
}
