import { CurriculumCellToc, CurriculumView } from "@/components/curriculum/curriculumSurface";
import { CodeCellEditor } from "@/components/notebook/notebookPanel";
import { TeacherPanel } from "@/components/assistant/teacherPanel";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import type { AssistantMessage, CellAiHelpState } from "@/lib/assistantTypes";
import {
  captureBrowserLearningWorkspaceAutosave,
  persistBrowserLearningWorkspace,
  type BrowserLearningWorkspaceAutosaveInput,
} from "@/lib/browserLearningArchive";
import { CUSTOM_CURRICULUM_CATEGORY } from "@/lib/customCurricula";
import { useLocale } from "@/lib/localeContext";
import { cn } from "@/lib/utils";
import type { CellAiAction } from "@/lib/cellModel";
import type { TeacherScope } from "@/lib/teacherScope";
import type { LearningArchiveMaterialization } from "@/lib/learningArchive";
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
  onImportLearningArchive: (archive: LearningArchiveMaterialization) => Promise<void> | void;
  onNewChat: () => void;
  onOpenTerminalCommand: (command: string) => void;
  onPromptChange: (value: string) => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig, sourceOverride?: string) => void;
  onSelectCurriculumBlock: (blockId: string) => void;
};

export function CurrentLearningSurface(props: CurrentLearningSurfaceProps) {
  const { t } = useLocale();
  useBrowserLearningWorkspaceAutosave({
    document: props.curriculumDocument,
    drafts: props.drafts,
    referenceLoading: props.referenceLoading,
    selectedCategory: props.selectedCategory,
    selectedContentId: props.selectedContentId,
  });

  if (!props.curriculumDocument) {
    return (
      <div className="grid h-full place-items-center bg-background px-6" data-curriculum-loading="true">
        <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <Loader2 className="size-4 animate-spin text-accent-brand" aria-hidden="true" />
          <span>레슨을 불러오는 중입니다.</span>
        </div>
      </div>
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
      data-learning-lesson-ref={`${props.selectedCategory}/${props.selectedContentId}`}
      data-learning-reference-loading={props.referenceLoading ? "true" : "false"}
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
        onImportLearningArchive={props.onImportLearningArchive}
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
        <div className="hidden min-h-0 xl:block">
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
      )}
    </div>
  );
}

function useBrowserLearningWorkspaceAutosave({
  document,
  drafts,
  referenceLoading,
  selectedCategory,
  selectedContentId,
}: {
  document: CodaroDocument | null;
  drafts: Record<string, string>;
  referenceLoading: boolean;
  selectedCategory: string;
  selectedContentId: string;
}) {
  const activeLessonRef = useRef("");
  const pendingWorkspaceRef = useRef<BrowserLearningWorkspaceAutosaveInput | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const flushPendingWorkspace = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const pending = pendingWorkspaceRef.current;
    pendingWorkspaceRef.current = null;
    if (!pending) return;
    void persistBrowserLearningWorkspace(pending).catch((error) => {
      console.error("Web 학습 작업을 자동 저장하지 못했습니다.", error);
    });
  }, []);

  useEffect(() => {
    const lessonRef = selectedCategory && selectedContentId
      ? `${selectedCategory}/${selectedContentId}`
      : "";
    const lessonChanged = Boolean(activeLessonRef.current && activeLessonRef.current !== lessonRef);
    if (lessonChanged) {
      flushPendingWorkspace();
    } else if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    activeLessonRef.current = lessonRef;
    if (lessonChanged) return;

    if (referenceLoading) {
      pendingWorkspaceRef.current = null;
      return;
    }
    if (!document || !lessonRef) {
      flushPendingWorkspace();
      return;
    }
    const blockIds = new Set(document.blocks.map((block) => block.id));
    if (!Object.keys(drafts).some((blockId) => blockIds.has(blockId))) {
      pendingWorkspaceRef.current = null;
      return;
    }

    pendingWorkspaceRef.current = captureBrowserLearningWorkspaceAutosave({ document, drafts, lessonRef });
    timeoutRef.current = window.setTimeout(flushPendingWorkspace, 800);
  }, [
    document,
    drafts,
    flushPendingWorkspace,
    referenceLoading,
    selectedCategory,
    selectedContentId,
  ]);

  useEffect(() => {
    window.addEventListener("pagehide", flushPendingWorkspace);
    return () => {
      window.removeEventListener("pagehide", flushPendingWorkspace);
      flushPendingWorkspace();
    };
  }, [flushPendingWorkspace]);
}
