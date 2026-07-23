import { lazy, Suspense } from "react";
import type { AssistantMessage, CellAiHelpState } from "@/lib/assistantTypes";
import { useLocale } from "@/lib/localeContext";
import type { CellAiAction } from "@/lib/cellModel";
import type { AutomationSection, SurfaceMode } from "@/lib/surfaceModel";
import type { TeacherScope } from "@/lib/teacherScope";
import type { NotebookPersistenceState } from "@/lib/notebookPersistence";
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
const LocalHomeSurface = lazy(() => import("@/components/app/localHomeSurface").then((module) => ({ default: module.LocalHomeSurface })));
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
  notebookPersistence: NotebookPersistenceState;
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
  onPromptChange: (value: string) => void;
  onOpenSharePackCurriculum: (packId: string, path: string, version?: string | null) => Promise<void>;
  onRefreshAutomation: () => void;
  onRenameDocument: (title: string) => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig, sourceOverride?: string) => void;
  onRunNotebook: () => void;
  onRunTask: (task: TaskDefinition) => void;
  onSelectSurface: (surface: SurfaceMode) => void;
  onToggleTask: (task: TaskDefinition) => void;
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
  if (props.surface === "home") {
    const selectedLesson = props.contents.find((content) => content.contentId === props.selectedContentId);
    const selectedCategory = props.categories.find((category) => category.key === props.selectedCategory);
    const learningLabel = selectedLesson
      ? `${selectedCategory?.name ?? props.selectedCategory} · ${selectedLesson.title}`
      : selectedCategory?.name ?? props.selectedCategory;
    return (
      <LocalHomeSurface
        apiOnline={props.apiOnline}
        auditCount={props.auditCount}
        document={props.document}
        eStop={props.eStop}
        learningLabel={learningLabel}
        scheduler={props.scheduler}
        tasks={props.tasks.tasks}
        onNavigate={props.onSelectSurface}
        onRefreshAutomation={props.onRefreshAutomation}
        onToggleEStop={props.onToggleEStop}
      />
    );
  }

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
        notebookPersistence={props.notebookPersistence}
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
        apiOnline={props.apiOnline}
        canRun={props.canRun}
        categories={props.categories}
        contents={props.contents}
        curriculumDocument={props.curriculumDocument}
        drafts={props.drafts}
        loadState={props.loadState}
        referenceLoading={props.referenceLoading}
        results={props.results}
        runningBlockId={props.runningBlockId}
        selectedCategory={props.selectedCategory}
        selectedContentId={props.selectedContentId}
        selectedCurriculumBlockId={props.selectedCurriculumBlockId}
        onDraftChange={props.onDraftChange}
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
      apiOnline={props.apiOnline}
      auditCount={props.auditCount}
      eStop={props.eStop}
      scheduler={props.scheduler}
      tasks={props.tasks.tasks}
      onRefresh={props.onRefreshAutomation}
      onRunTask={props.onRunTask}
      onToggleTask={props.onToggleTask}
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
