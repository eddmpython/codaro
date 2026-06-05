import { ChatSurface } from "@/components/chat/chatSurface";
import { CurriculumCellToc, CurriculumView } from "@/components/curriculum/curriculumSurface";
import { CodeCellEditor } from "@/components/notebook/notebookPanel";
import { TeacherPanel } from "@/components/assistant/teacherPanel";
import type { AssistantMessage, CellAiHelpState } from "@/lib/assistantTypes";
import { curriculumGoalExamples } from "@/lib/chatStartExamples";
import { CUSTOM_CURRICULUM_CATEGORY } from "@/lib/customCurricula";
import { useLocale } from "@/lib/localeContext";
import { cn } from "@/lib/utils";
import type { CellAiAction } from "@/lib/cellModel";
import type { TeacherScope } from "@/lib/teacherScope";
import type {
  AiProfile,
  BlockConfig,
  CodaroDocument,
  CurriculumCategory,
  CurriculumContentSummary,
  ExecutionResult,
  LoadState,
} from "@/types";

type ResultMap = Record<string, ExecutionResult>;

export type CurrentLearningSurfaceProps = {
  aiConnecting: boolean;
  aiProfile: AiProfile | null;
  apiOnline: boolean;
  assistantCollapsed: boolean;
  assistantLoading: boolean;
  canRun: boolean;
  cellHelpByBlockId: Record<string, CellAiHelpState>;
  categories: CurriculumCategory[];
  contents: CurriculumContentSummary[];
  curriculumDocument: CodaroDocument | null;
  drafts: Record<string, string>;
  loadState: LoadState;
  messages: AssistantMessage[];
  pendingBlocks: BlockConfig[];
  prompt: string;
  referenceLoading: boolean;
  results: ResultMap;
  runningBlockId: string | null;
  selectedCategory: string;
  selectedContentId: string;
  selectedCurriculumBlockId: string;
  onAcceptPendingBlocks: () => void;
  onAsk: (messageOverride?: string, scopeOverride?: TeacherScope) => void;
  onCellAsk: (action: CellAiAction, block: BlockConfig, question?: string) => void;
  onConnectAi: () => void;
  onDraftChange: (blockId: string, value: string) => void;
  onNewChat: () => void;
  onOpenAssignmentMaterial?: (document: CodaroDocument, title: string) => void;
  onOpenTerminalCommand: (command: string) => void;
  onPromptChange: (value: string) => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig) => void;
  onSelectCurriculumBlock: (blockId: string) => void;
};

export function CurrentLearningSurface(props: CurrentLearningSurfaceProps) {
  const { t } = useLocale();

  if (!props.curriculumDocument) {
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
        heroTitle={t("curriculum.goal.title")}
        heroDetail={t("curriculum.goal.detail")}
        placeholder={t("curriculum.goal.placeholder")}
        examples={curriculumGoalExamples(t)}
        onAsk={props.onAsk}
        onAcceptPendingBlocks={props.onAcceptPendingBlocks}
        onConnectAi={props.onConnectAi}
        onPromptChange={props.onPromptChange}
        onRejectPendingBlocks={props.onRejectPendingBlocks}
      />
    );
  }

  const curriculumDoc = props.curriculumDocument;
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
        "grid h-full min-h-0 grid-cols-1",
        props.assistantCollapsed
          ? "2xl:grid-cols-[minmax(0,1fr)_44px]"
          : "xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_44px_360px]",
      )}
    >
      <CurriculumView
        key={`${props.selectedCategory}/${props.selectedContentId}`}
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
        renderCodeCellEditor={({ autoFocus = true, draft, onChange, onFocus, onRun }) => (
          <CodeCellEditor
            autoFocus={autoFocus}
            placeholderText=""
            value={draft}
            onChange={onChange}
            onFocus={onFocus}
            onRun={onRun}
          />
        )}
        onAcceptPendingBlocks={props.onAcceptPendingBlocks}
        onCellAsk={props.onCellAsk}
        onDraftChange={props.onDraftChange}
        onOpenAssignmentMaterial={props.onOpenAssignmentMaterial}
        onOpenTerminalCommand={props.onOpenTerminalCommand}
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
