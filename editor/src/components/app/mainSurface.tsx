import { lazy, Suspense } from "react";
import type { AssistantMessage, CellAiHelpState } from "@/lib/assistantTypes";
import { useLocale } from "@/lib/localeContext";
import type { CellAiAction } from "@/lib/cellModel";
import type { AutomationSection, SurfaceMode } from "@/lib/surfaceModel";
import type { TeacherScope } from "@/lib/teacherScope";
import type {
  AiProfile,
  BlockConfig,
  CodaroDocument,
  CurriculumCategory,
  CurriculumContentSummary,
  EStopStatus,
  ExecutionResult,
  LoadState,
  ReactiveDiagnostics,
  SchedulerStatus,
  TaskDefinition,
  TaskListPayload,
  VariableInfo,
} from "@/types";

type ResultMap = Record<string, ExecutionResult>;

const AutomationView = lazy(() => import("@/components/automation/automationSurface").then((module) => ({ default: module.AutomationView })));
const ChatSurface = lazy(() => import("@/components/chat/chatSurface").then((module) => ({ default: module.ChatSurface })));
const CurrentLearningSurface = lazy(() => import("@/components/app/currentLearningSurface").then((module) => ({ default: module.CurrentLearningSurface })));
const CurriculumHome = lazy(() => import("@/components/curriculum/curriculumHome").then((module) => ({ default: module.CurriculumHome })));
const NotebookSurface = lazy(() => import("@/components/app/notebookSurface").then((module) => ({ default: module.NotebookSurface })));
const SharePackSurface = lazy(() => import("@/components/share/sharePackSurface").then((module) => ({ default: module.SharePackSurface })));

type MainSurfaceProps = {
  aiConnecting: boolean;
  aiProfile: AiProfile | null;
  apiOnline: boolean;
  auditCount: number;
  automationSection: AutomationSection;
  assistantCollapsed: boolean;
  assistantLoading: boolean;
  canRun: boolean;
  cellHelpByBlockId: Record<string, CellAiHelpState>;
  categories: CurriculumCategory[];
  contents: CurriculumContentSummary[];
  curriculumDocument: CodaroDocument | null;
  diagnostics: ReactiveDiagnostics;
  document: CodaroDocument;
  drafts: Record<string, string>;
  eStop: EStopStatus;
  loadState: LoadState;
  messages: AssistantMessage[];
  notebookRunning: boolean;
  pendingBlocks: BlockConfig[];
  prompt: string;
  referenceLoading: boolean;
  results: ResultMap;
  runningBlockId: string | null;
  scheduler: SchedulerStatus;
  selectedBlockId: string;
  selectedCategory: string;
  selectedContentId: string;
  selectedCurriculumBlockId: string;
  staleBlockIds: string[];
  surface: SurfaceMode;
  tasks: TaskListPayload;
  variables: VariableInfo[];
  onAcceptPendingBlocks: () => void;
  onAddCell: (type: "code" | "markdown", referenceBlockId?: string, placement?: "before" | "after") => void;
  onAsk: (messageOverride?: string, scopeOverride?: TeacherScope) => void;
  onCellAsk: (action: CellAiAction, block: BlockConfig, question?: string) => void;
  onConnectAi: () => void;
  onDeleteCell: (blockId: string) => void;
  onDraftChange: (blockId: string, value: string) => void;
  onNewChat: () => void;
  onOpenAssignmentMaterial?: (document: CodaroDocument, title: string) => void;
  onOpenTerminalCommand: (command: string) => void;
  onPromptChange: (value: string) => void;
  onOpenSharePackCurriculum: (packId: string, path: string, version?: string | null) => Promise<void>;
  onRefreshAutomation: () => void;
  onRenameDocument: (title: string) => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig) => void;
  onRunNotebook: () => void;
  onRunTask: (task: TaskDefinition) => void;
  onSelectBlock: (blockId: string) => void;
  onSelectCategory: (category: string) => void;
  onSelectCurriculumBlock: (blockId: string) => void;
  onSelectCurriculumLesson: (category: string, contentId: string) => void;
  onToggleEStop: () => void;
};

export function MainSurface(props: MainSurfaceProps) {
  return (
    <Suspense fallback={<SurfaceLoading />}>
      <MainSurfaceContent {...props} />
    </Suspense>
  );
}

function MainSurfaceContent(props: MainSurfaceProps) {
  if (props.surface === "chat") {
    return (
      <ChatSurface
        aiConnecting={props.aiConnecting}
        aiProfile={props.aiProfile}
        apiOnline={props.apiOnline}
        loading={props.assistantLoading}
        loadState={props.loadState}
        messages={props.messages}
        pendingBlocks={props.pendingBlocks}
        prompt={props.prompt}
        onAsk={props.onAsk}
        onAcceptPendingBlocks={props.onAcceptPendingBlocks}
        onConnectAi={props.onConnectAi}
        onPromptChange={props.onPromptChange}
        onRejectPendingBlocks={props.onRejectPendingBlocks}
      />
    );
  }

  if (props.surface === "editor") {
    return (
      <NotebookSurface
        aiConnecting={props.aiConnecting}
        aiProfile={props.aiProfile}
        apiOnline={props.apiOnline}
        assistantCollapsed={props.assistantCollapsed}
        assistantLoading={props.assistantLoading}
        canRun={props.canRun}
        cellHelpByBlockId={props.cellHelpByBlockId}
        diagnostics={props.diagnostics}
        document={props.document}
        drafts={props.drafts}
        messages={props.messages}
        notebookRunning={props.notebookRunning}
        pendingBlocks={props.pendingBlocks}
        prompt={props.prompt}
        results={props.results}
        runningBlockId={props.runningBlockId}
        selectedBlockId={props.selectedBlockId}
        staleBlockIds={props.staleBlockIds}
        variables={props.variables}
        onAcceptPendingBlocks={props.onAcceptPendingBlocks}
        onAddCell={props.onAddCell}
        onAsk={props.onAsk}
        onCellAsk={props.onCellAsk}
        onConnectAi={props.onConnectAi}
        onDeleteCell={props.onDeleteCell}
        onDraftChange={props.onDraftChange}
        onNewChat={props.onNewChat}
        onPromptChange={props.onPromptChange}
        onRejectPendingBlocks={props.onRejectPendingBlocks}
        onRenameDocument={props.onRenameDocument}
        onRunBlock={props.onRunBlock}
        onRunNotebook={props.onRunNotebook}
        onSelectBlock={props.onSelectBlock}
      />
    );
  }

  if (props.surface === "curriculum") {
    if (!props.selectedContentId) {
      return (
        <CurriculumHome
          categories={props.categories}
          onSelectCategory={props.onSelectCategory}
          onSelectLesson={props.onSelectCurriculumLesson}
        />
      );
    }
    return (
      <CurrentLearningSurface
        aiConnecting={props.aiConnecting}
        aiProfile={props.aiProfile}
        apiOnline={props.apiOnline}
        assistantCollapsed={props.assistantCollapsed}
        assistantLoading={props.assistantLoading}
        canRun={props.canRun}
        cellHelpByBlockId={props.cellHelpByBlockId}
        categories={props.categories}
        contents={props.contents}
        curriculumDocument={props.curriculumDocument}
        drafts={props.drafts}
        loadState={props.loadState}
        messages={props.messages}
        pendingBlocks={props.pendingBlocks}
        prompt={props.prompt}
        referenceLoading={props.referenceLoading}
        results={props.results}
        runningBlockId={props.runningBlockId}
        selectedCategory={props.selectedCategory}
        selectedContentId={props.selectedContentId}
        selectedCurriculumBlockId={props.selectedCurriculumBlockId}
        onAcceptPendingBlocks={props.onAcceptPendingBlocks}
        onAsk={props.onAsk}
        onCellAsk={props.onCellAsk}
        onConnectAi={props.onConnectAi}
        onDraftChange={props.onDraftChange}
        onNewChat={props.onNewChat}
        onOpenAssignmentMaterial={props.onOpenAssignmentMaterial}
        onOpenTerminalCommand={props.onOpenTerminalCommand}
        onPromptChange={props.onPromptChange}
        onRejectPendingBlocks={props.onRejectPendingBlocks}
        onRunBlock={props.onRunBlock}
        onSelectCurriculumBlock={props.onSelectCurriculumBlock}
      />
    );
  }

  if (props.surface === "share") {
    return (
      <SharePackSurface
        apiOnline={props.apiOnline}
        onOpenCurriculum={props.onOpenSharePackCurriculum}
        onTaskCreated={props.onRefreshAutomation}
      />
    );
  }

  return (
    <AutomationView
      activeSection={props.automationSection}
      auditCount={props.auditCount}
      eStop={props.eStop}
      scheduler={props.scheduler}
      tasks={props.tasks.tasks}
      onRefresh={props.onRefreshAutomation}
      onRunTask={props.onRunTask}
      onToggleEStop={props.onToggleEStop}
    />
  );
}

function SurfaceLoading() {
  const { t } = useLocale();
  return (
    <div className="grid h-full min-h-0 place-items-center px-4 text-sm text-muted-foreground sm:px-6">
      {t("surface.loading")}
    </div>
  );
}
