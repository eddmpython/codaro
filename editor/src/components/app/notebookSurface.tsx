import { TeacherPanel } from "@/components/assistant/teacherPanel";
import { NotebookPanel } from "@/components/notebook/notebookPanel";
import type { AssistantMessage, CellAiHelpState } from "@/lib/assistantTypes";
import type { CellAiAction } from "@/lib/cellModel";
import type { TeacherScope } from "@/lib/teacherScope";
import { cn } from "@/lib/utils";
import type {
  AiProfile,
  BlockConfig,
  CodaroDocument,
  ExecutionResult,
  ReactiveDiagnostics,
} from "@/types";

type ResultMap = Record<string, ExecutionResult>;

export type NotebookSurfaceProps = {
  aiConnecting: boolean;
  aiProfile: AiProfile | null;
  apiOnline: boolean;
  assistantCollapsed: boolean;
  assistantLoading: boolean;
  canRun: boolean;
  cellHelpByBlockId: Record<string, CellAiHelpState>;
  diagnostics: ReactiveDiagnostics;
  document: CodaroDocument;
  drafts: Record<string, string>;
  messages: AssistantMessage[];
  notebookRunning: boolean;
  pendingBlocks: BlockConfig[];
  prompt: string;
  results: ResultMap;
  runningBlockId: string | null;
  selectedBlockId: string;
  staleBlockIds: string[];
  onAcceptPendingBlocks: () => void;
  onAddCell: (type: "code" | "markdown", referenceBlockId?: string, placement?: "before" | "after") => void;
  onAsk: (messageOverride?: string, scopeOverride?: TeacherScope) => void;
  onCellAsk: (action: CellAiAction, block: BlockConfig, question?: string) => void;
  onConnectAi: () => void;
  onDeleteCell: (blockId: string) => void;
  onDraftChange: (blockId: string, value: string) => void;
  onNewChat: () => void;
  onPromptChange: (value: string) => void;
  onRejectPendingBlocks: () => void;
  onRenameDocument: (title: string) => void;
  onRunBlock: (block: BlockConfig) => void;
  onRunNotebook: () => void;
  onSelectBlock: (blockId: string) => void;
};

export function NotebookSurface(props: NotebookSurfaceProps) {
  return (
    <div
      className={cn(
        "grid h-full min-h-0 grid-cols-1",
        !props.assistantCollapsed && "xl:grid-cols-[minmax(0,1fr)_380px]",
      )}
    >
      <NotebookPanel
        canRun={props.canRun}
        cellHelpByBlockId={props.cellHelpByBlockId}
        diagnostics={props.diagnostics}
        document={props.document}
        drafts={props.drafts}
        notebookRunning={props.notebookRunning}
        pendingBlocks={props.pendingBlocks}
        results={props.results}
        runningBlockId={props.runningBlockId}
        selectedBlockId={props.selectedBlockId}
        staleBlockIds={props.staleBlockIds}
        onAddCell={props.onAddCell}
        onDraftChange={props.onDraftChange}
        onAcceptPendingBlocks={props.onAcceptPendingBlocks}
        onCellAsk={props.onCellAsk}
        onDeleteCell={props.onDeleteCell}
        onRenameDocument={props.onRenameDocument}
        onRejectPendingBlocks={props.onRejectPendingBlocks}
        onRunBlock={props.onRunBlock}
        onRunNotebook={props.onRunNotebook}
        onSelectBlock={props.onSelectBlock}
      />
      {props.assistantCollapsed ? null : (
        <TeacherPanel
          aiConnecting={props.aiConnecting}
          aiProfile={props.aiProfile}
          apiOnline={props.apiOnline}
          loading={props.assistantLoading}
          messages={props.messages}
          pendingBlocks={props.pendingBlocks}
          placement="right"
          prompt={props.prompt}
          onAcceptPendingBlocks={props.onAcceptPendingBlocks}
          onAsk={props.onAsk}
          onConnectAi={props.onConnectAi}
          onNewChat={props.onNewChat}
          onPromptChange={props.onPromptChange}
          onRejectPendingBlocks={props.onRejectPendingBlocks}
        />
      )}
    </div>
  );
}
