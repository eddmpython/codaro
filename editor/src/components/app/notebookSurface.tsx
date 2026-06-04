import { useState } from "react";
import { TeacherPanel } from "@/components/assistant/teacherPanel";
import { NotebookPanel } from "@/components/notebook/notebookPanel";
import { DependencyGraphPanel } from "@/components/notebook/dependencyGraphPanel";
import { VariableExplorerPanel } from "@/components/notebook/variableExplorerPanel";
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
  VariableInfo,
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
  variables: VariableInfo[];
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
      {props.assistantCollapsed ? null : <NotebookInspector {...props} />}
    </div>
  );
}

type InspectorTab = "tutor" | "variables" | "graph";

const INSPECTOR_TABS: ReadonlyArray<{ value: InspectorTab; label: string }> = [
  { value: "tutor", label: "튜터" },
  { value: "variables", label: "변수" },
  { value: "graph", label: "의존성" },
];

// 우측 컬럼 — 튜터/변수 탐색기/의존성 그래프를 탭으로. 세 패널 모두 마운트 유지하고
// 비활성은 hidden 처리해 튜터 채팅 입력 상태를 보존한다(기본 탭=튜터).
function NotebookInspector(props: NotebookSurfaceProps) {
  const [tab, setTab] = useState<InspectorTab>("tutor");
  const codeBlocks = props.document.blocks;
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] border-t bg-background xl:border-l xl:border-t-0">
      <div className="flex items-center gap-0.5 border-b px-2 py-1.5">
        {INSPECTOR_TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={cn(
              "rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
              tab === item.value ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setTab(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="h-full min-h-0">
        <div className={cn("h-full min-h-0", tab !== "tutor" && "hidden")}>
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
        </div>
        <div className={cn("h-full min-h-0", tab !== "variables" && "hidden")}>
          <VariableExplorerPanel
            variables={props.variables}
            diagnostics={props.diagnostics}
            onSelectBlock={props.onSelectBlock}
          />
        </div>
        <div className={cn("h-full min-h-0", tab !== "graph" && "hidden")}>
          <DependencyGraphPanel
            blocks={codeBlocks}
            diagnostics={props.diagnostics}
            selectedBlockId={props.selectedBlockId}
            onSelectBlock={props.onSelectBlock}
          />
        </div>
      </div>
    </div>
  );
}
