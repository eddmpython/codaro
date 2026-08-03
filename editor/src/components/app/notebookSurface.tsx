import { useState } from "react";
import { Database, GitBranch, GraduationCap, type LucideIcon } from "lucide-react";
import { TeacherPanel } from "@/components/assistant/teacherPanel";
import { NotebookPanel } from "@/components/notebook/notebookPanel";
import { DependencyGraphPanel } from "@/components/notebook/dependencyGraphPanel";
import { VariableExplorerPanel } from "@/components/notebook/variableExplorerPanel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AssistantMessage, CellAiHelpState } from "@/lib/assistantTypes";
import type { CellAiAction } from "@/lib/cellModel";
import type { TeacherScope } from "@/lib/teacherScope";
import { cn } from "@/lib/utils";
import type { NotebookPersistenceState } from "@/lib/notebookPersistence";
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
  notebookToolsOpen: boolean;
  assistantLoading: boolean;
  canRun: boolean;
  cellHelpByBlockId: Record<string, CellAiHelpState>;
  diagnostics: ReactiveDiagnostics;
  document: CodaroDocument;
  drafts: Record<string, string>;
  messages: AssistantMessage[];
  notebookRunning: boolean;
  notebookPersistence: NotebookPersistenceState;
  pendingBlocks: BlockConfig[];
  prompt: string;
  reactiveEnabled: boolean;
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
  onDuplicateCell: (blockId: string) => void;
  onMoveCell: (blockId: string, direction: "up" | "down") => void;
  onNewChat: () => void;
  onPromptChange: (value: string) => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig, sourceOverride?: string) => void;
  onRunNotebook: () => void;
  onSelectBlock: (blockId: string) => void;
  onToggleReactive: () => void;
};

export function NotebookSurface(props: NotebookSurfaceProps) {
  return (
    <div
      className="relative h-full min-h-0"
    >
      <NotebookPanel
        apiOnline={props.apiOnline}
        canRun={props.canRun}
        cellHelpByBlockId={props.cellHelpByBlockId}
        diagnostics={props.diagnostics}
        document={props.document}
        drafts={props.drafts}
        notebookRunning={props.notebookRunning}
        persistence={props.notebookPersistence}
        pendingBlocks={props.pendingBlocks}
        reactiveEnabled={props.reactiveEnabled}
        results={props.results}
        runningBlockId={props.runningBlockId}
        selectedBlockId={props.selectedBlockId}
        staleBlockIds={props.staleBlockIds}
        onAddCell={props.onAddCell}
        onDraftChange={props.onDraftChange}
        onAcceptPendingBlocks={props.onAcceptPendingBlocks}
        onCellAsk={props.onCellAsk}
        onDeleteCell={props.onDeleteCell}
        onDuplicateCell={props.onDuplicateCell}
        onMoveCell={props.onMoveCell}
        onRejectPendingBlocks={props.onRejectPendingBlocks}
        onRunBlock={props.onRunBlock}
        onRunNotebook={props.onRunNotebook}
        onSelectBlock={props.onSelectBlock}
        onToggleReactive={props.onToggleReactive}
      />
      {props.notebookToolsOpen ? (
        <div className="absolute inset-y-0 right-0 z-40 hidden w-[380px] min-h-0 shadow-[-16px_0_48px_rgba(0,0,0,0.16)] xl:block" data-notebook-tools-panel="desktop">
          <NotebookInspector {...props} />
        </div>
      ) : null}
    </div>
  );
}

type InspectorTab = "tutor" | "variables" | "graph";

const INSPECTOR_TABS: ReadonlyArray<{ value: InspectorTab; label: string; Icon: LucideIcon }> = [
  { value: "tutor", label: "튜터", Icon: GraduationCap },
  { value: "variables", label: "변수", Icon: Database },
  { value: "graph", label: "의존성", Icon: GitBranch },
];

function NotebookInspector(props: NotebookSurfaceProps) {
  const [tab, setTab] = useState<InspectorTab>("tutor");
  const codeBlocks = props.document.blocks;
  return (
    <div
      className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] border-t bg-background xl:grid-cols-[40px_minmax(0,1fr)] xl:grid-rows-1 xl:border-l xl:border-t-0"
    >
      <div className="flex items-center gap-1 border-b px-2 py-1.5 xl:flex-col xl:border-b-0 xl:border-r xl:px-1 xl:py-2">
        {INSPECTOR_TABS.map((item) => (
          <Tooltip key={item.value}>
            <TooltipTrigger asChild>
              <button
                aria-label={item.label}
                aria-pressed={tab === item.value}
                title={item.label}
                type="button"
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-accent-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                  tab === item.value && "border-border bg-accent-surface text-foreground shadow-sm",
                )}
                onClick={() => setTab(item.value)}
              >
                <item.Icon className="size-4" />
                <span className="sr-only">{item.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
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
