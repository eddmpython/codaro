import { lazy, Suspense } from "react";
import type { AssistantMessage, CellAiHelpState } from "@/lib/assistantTypes";
import { CUSTOM_CURRICULUM_CATEGORY } from "@/lib/customCurricula";
import { useLocale } from "@/lib/localeContext";
import { cn } from "@/lib/utils";
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
  SchedulerStatus,
  TaskDefinition,
  TaskListPayload,
} from "@/types";

type ResultMap = Record<string, ExecutionResult>;

const TeacherPanel = lazy(() => import("@/components/assistant/teacherPanel").then((module) => ({ default: module.TeacherPanel })));
const AutomationView = lazy(() => import("@/components/automation/automationSurface").then((module) => ({ default: module.AutomationView })));
const ChatSurface = lazy(() => import("@/components/chat/chatSurface").then((module) => ({ default: module.ChatSurface })));
const NotebookPanel = lazy(() => import("@/components/notebook/notebookPanel").then((module) => ({ default: module.NotebookPanel })));
const CodeCellEditor = lazy(() => import("@/components/notebook/notebookPanel").then((module) => ({ default: module.CodeCellEditor })));
const CurriculumView = lazy(() => import("@/components/curriculum/curriculumSurface").then((module) => ({ default: module.CurriculumView })));
const CurriculumCellToc = lazy(() => import("@/components/curriculum/curriculumSurface").then((module) => ({ default: module.CurriculumCellToc })));

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
  document: CodaroDocument;
  drafts: Record<string, string>;
  eStop: EStopStatus;
  loadState: LoadState;
  messages: AssistantMessage[];
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
  surface: SurfaceMode;
  tasks: TaskListPayload;
  onAcceptPendingBlocks: () => void;
  onAddCell: (type: "code" | "markdown") => void;
  onAsk: (messageOverride?: string, scopeOverride?: TeacherScope) => void;
  onCellAsk: (action: CellAiAction, block: BlockConfig, question?: string) => void;
  onConnectAi: () => void;
  onDraftChange: (blockId: string, value: string) => void;
  onNewChat: () => void;
  onPromptChange: (value: string) => void;
  onRefreshAutomation: () => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig) => void;
  onRunTask: (task: TaskDefinition) => void;
  onSelectBlock: (blockId: string) => void;
  onSelectCurriculumBlock: (blockId: string) => void;
  onToggleAssistant: () => void;
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
  const { t } = useLocale();
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
      <div
        className={cn(
          "grid h-[calc(100vh-40px)] min-h-0 grid-cols-1",
          !props.assistantCollapsed && "xl:grid-cols-[minmax(0,1fr)_380px]",
        )}
      >
        <NotebookPanel
          canRun={props.canRun}
          cellHelpByBlockId={props.cellHelpByBlockId}
          document={props.document}
          drafts={props.drafts}
          pendingBlocks={props.pendingBlocks}
          results={props.results}
          runningBlockId={props.runningBlockId}
          selectedBlockId={props.selectedBlockId}
          onAddCell={props.onAddCell}
          onDraftChange={props.onDraftChange}
          onAcceptPendingBlocks={props.onAcceptPendingBlocks}
          onCellAsk={props.onCellAsk}
          onRejectPendingBlocks={props.onRejectPendingBlocks}
          onRunBlock={props.onRunBlock}
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

  if (props.surface === "curriculum") {
    const curriculumDoc = props.curriculumDocument ?? props.document;
    const isCustomCurriculum = props.selectedCategory === CUSTOM_CURRICULUM_CATEGORY;
    const selectedCategoryLabel =
      isCustomCurriculum
        ? t("sidebar.myCurriculum")
        : props.categories.find((category) => category.key === props.selectedCategory)?.name ?? props.selectedCategory;
    const selectedContentLabel =
      isCustomCurriculum
        ? curriculumDoc.title
        : props.contents.find((content) => content.contentId === props.selectedContentId)?.title ?? props.selectedContentId;

    return (
      <div
        className={cn(
          "grid h-[calc(100vh-40px)] min-h-0 grid-cols-1",
          props.assistantCollapsed
            ? "2xl:grid-cols-[minmax(0,1fr)_44px]"
            : "xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_44px_360px]",
        )}
      >
        <CurriculumView
          apiOnline={props.apiOnline}
          canRun={props.canRun}
          cellHelpByBlockId={props.cellHelpByBlockId}
          document={curriculumDoc}
          drafts={props.drafts}
          pendingBlocks={props.pendingBlocks}
          referenceLoading={props.referenceLoading}
          results={props.results}
          runningBlockId={props.runningBlockId}
          selectedBlockId={props.selectedCurriculumBlockId}
          selectedCategory={props.selectedCategory}
          selectedCategoryLabel={selectedCategoryLabel}
          selectedContentId={props.selectedContentId}
          selectedContentLabel={selectedContentLabel}
          renderCodeCellEditor={({ autoFocus = true, block, draft, onChange, onFocus, onRun }) => (
            <CodeCellEditor
              autoFocus={autoFocus}
              placeholderText={block.role === "snippet" ? t("cell.placeholder.snippet") : t("cell.placeholder.code")}
              value={draft}
              onChange={onChange}
              onFocus={onFocus}
              onRun={onRun}
            />
          )}
          onAcceptPendingBlocks={props.onAcceptPendingBlocks}
          onCellAsk={props.onCellAsk}
          onDraftChange={props.onDraftChange}
          onRejectPendingBlocks={props.onRejectPendingBlocks}
          onRunBlock={props.onRunBlock}
          onSelectBlock={props.onSelectCurriculumBlock}
        />
        <CurriculumCellToc
          document={curriculumDoc}
          selectedBlockId={props.selectedCurriculumBlockId}
          onSelectBlock={props.onSelectCurriculumBlock}
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
    <div className="grid h-[calc(100vh-40px)] min-h-0 place-items-center px-4 text-sm text-muted-foreground">
      {t("surface.loading")}
    </div>
  );
}
