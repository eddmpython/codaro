import {
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

export function NotebookCommandBar({
  activeCellLabel,
  apiOnline,
  canRun,
  notebookRunning,
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
          className="notebookStatusItem notebookPersistenceStatus"
          data-notebook-persistence="session"
          title="편집 내용은 현재 세션에 즉시 반영됩니다."
        >
          <Save aria-hidden="true" />
          <span>세션 자동 반영</span>
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

function normalizeNotebookFilename(value: string) {
  const trimmed = value.trim() || "notebook.py";
  if (trimmed.toLowerCase().endsWith(".py")) return trimmed;
  return `${trimmed.replace(/\.[^/.]+$/, "")}.py`;
}
