import { CurriculumCellToc, CurriculumView } from "@/components/curriculum/curriculumSurface";
import { CodeCellEditor } from "@/components/notebook/notebookPanel";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  captureBrowserLearningWorkspaceAutosave,
  persistBrowserLearningWorkspace,
  type BrowserLearningWorkspaceAutosaveInput,
} from "@/lib/browserLearningArchive";
import { CUSTOM_CURRICULUM_CATEGORY } from "@/lib/customCurricula";
import { useLocale } from "@/lib/localeContext";
import { cn } from "@/lib/utils";
import { groupCurriculumSections } from "@/components/curriculum/curriculumSectionRenderer";
import type {
  BlockConfig,
  CodaroDocument,
  CurriculumCategory,
  CurriculumContentSummary,
  ExecutionResult,
  LoadState,
} from "@/types";

type ResultMap = Record<string, ExecutionResult>;

export type CurrentLearningSurfaceProps = {
  apiOnline: boolean;
  canRun: boolean;
  categories: CurriculumCategory[];
  contents: CurriculumContentSummary[];
  curriculumDocument: CodaroDocument | null;
  drafts: Record<string, string>;
  loadState: LoadState;
  referenceLoading: boolean;
  results: ResultMap;
  runningBlockId: string | null;
  selectedCategory: string;
  selectedContentId: string;
  selectedCurriculumBlockId: string;
  onDraftChange: (blockId: string, value: string) => void;
  onRunBlock: (block: BlockConfig, sourceOverride?: string) => void;
  onSelectCurriculumBlock: (blockId: string) => void;
};

export function CurrentLearningSurface(props: CurrentLearningSurfaceProps) {
  const { t } = useLocale();
  const [tocExpanded, setTocExpanded] = useState(false);
  const storageError = useBrowserLearningWorkspaceAutosave({
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
  const showToc = groupCurriculumSections(curriculumDoc.blocks).sections.length >= 2;
  const tocLayoutStyle = showToc
    ? ({ "--learning-toc-width": tocExpanded ? "18rem" : "3rem" } as CSSProperties)
    : undefined;
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
        showToc && "2xl:grid-cols-[minmax(0,1fr)_var(--learning-toc-width)]",
        showToc && "2xl:transition-[grid-template-columns] 2xl:duration-150",
      )}
      data-learning-toc-layout={showToc ? (tocExpanded ? "expanded" : "collapsed") : "hidden"}
      data-learning-lesson-ref={`${props.selectedCategory}/${props.selectedContentId}`}
      data-learning-reference-loading={props.referenceLoading ? "true" : "false"}
      style={tocLayoutStyle}
    >
      <CurriculumView
        key={`${props.selectedCategory}/${props.selectedContentId}`}
        apiOnline={props.apiOnline}
        canRun={props.canRun}
        document={curriculumDoc}
        drafts={props.drafts}
        referenceLoading={props.referenceLoading}
        results={props.results}
        runningBlockId={props.runningBlockId}
        selectedBlockId={props.selectedCurriculumBlockId}
        selectedCategory={props.selectedCategory}
        selectedCategoryLabel={selectedCategoryLabel}
        selectedContentId={props.selectedContentId}
        selectedContentLabel={selectedContentLabel}
        storageError={storageError}
        renderCodeCellEditor={({ ariaLabel, autoFocus = false, draft, onChange, onFocus, onRun }) => (
          <CodeCellEditor
            ariaLabel={ariaLabel}
            autoFocus={autoFocus}
            density="content-fit"
            placeholderText=""
            value={draft}
            onChange={onChange}
            onFocus={onFocus}
            onRun={onRun}
          />
        )}
        onDraftChange={props.onDraftChange}
        onRunBlock={props.onRunBlock}
        onSelectBlock={props.onSelectCurriculumBlock}
      />
      {showToc ? (
        <CurriculumCellToc
          document={curriculumDoc}
          expanded={tocExpanded}
          selectedBlockId={props.selectedCurriculumBlockId}
          onExpandedChange={setTocExpanded}
          onSelectBlock={props.onSelectCurriculumBlock}
        />
      ) : null}
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
  const [storageError, setStorageError] = useState("");
  const activeLessonRef = useRef("");
  const pendingWorkspaceRef = useRef<BrowserLearningWorkspaceAutosaveInput | null>(null);
  const saveRevisionRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  const flushPendingWorkspace = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const pending = pendingWorkspaceRef.current;
    pendingWorkspaceRef.current = null;
    if (!pending) return;
    const revision = ++saveRevisionRef.current;
    void persistBrowserLearningWorkspace(pending)
      .then(() => {
        if (revision === saveRevisionRef.current && activeLessonRef.current === pending.lessonRef) {
          setStorageError("");
        }
      })
      .catch((error) => {
        if (revision === saveRevisionRef.current && activeLessonRef.current === pending.lessonRef) {
          setStorageError("학습 기록을 저장하지 못했습니다. 브라우저 저장 공간을 확인한 뒤 다시 실행해 주세요.");
        }
        console.error("Web 학습 작업을 자동 저장하지 못했습니다.", error);
      });
  }, []);

  useEffect(() => {
    const lessonRef = selectedCategory && selectedContentId
      ? `${selectedCategory}/${selectedContentId}`
      : "";
    const lessonChanged = Boolean(activeLessonRef.current && activeLessonRef.current !== lessonRef);
    if (lessonChanged) {
      setStorageError("");
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

  return storageError;
}
