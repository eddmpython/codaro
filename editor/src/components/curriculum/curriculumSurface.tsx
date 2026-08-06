import type { BlockConfig, CodaroDocument, CurriculumContentSummary } from "@/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { readLearningEvidenceEvents } from "@/lib/learningEvidenceOperations";
import { PROGRESS_UPDATED_EVENT } from "@/lib/curriculumProgressEvent";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { RenderCodeCellEditor, ResultMap } from "./curriculumSurfaceModels";

export { CurriculumHeaderProgress } from "./curriculumOverview";
export { CurriculumCellToc } from "./curriculumToc";
import { LearningOverviewHeader } from "./curriculumOverview";
import { CurriculumSectionCard, dueAssessmentBlocks, groupCurriculumSections } from "./curriculumSectionRenderer";
import { lessonVerifySections } from "./curriculumSurfaceHelpers";

export function CurriculumView({
  apiOnline,
  canRun,
  contents = [],
  document,
  drafts,
  referenceLoading,
  renderCodeCellEditor,
  results,
  runningBlockId,
  selectedBlockId,
  selectedCategoryLabel,
  selectedCategory,
  selectedContentLabel,
  selectedContentId,
  storageError,
  onDraftChange,
  onNavigateBlock,
  onRunBlock,
  onSelectBlock,
  onSelectLesson,
}: {
  apiOnline: boolean;
  canRun: boolean;
  contents?: CurriculumContentSummary[];
  document: CodaroDocument;
  drafts: Record<string, string>;
  referenceLoading: boolean;
  renderCodeCellEditor: RenderCodeCellEditor;
  results: ResultMap;
  runningBlockId: string | null;
  selectedBlockId: string;
  selectedCategoryLabel: string;
  selectedCategory: string;
  selectedContentLabel: string;
  selectedContentId: string;
  storageError?: string;
  onDraftChange: (blockId: string, value: string) => void;
  onNavigateBlock: (blockId: string) => void;
  onRunBlock: (block: BlockConfig, sourceOverride?: string) => void;
  onSelectBlock: (blockId: string) => void;
  onSelectLesson: (contentId: string) => void;
}) {
  const [assessmentBlocks, setAssessmentBlocks] = useState<BlockConfig[]>([]);
  const visibleBlocks = useMemo(() => [...document.blocks, ...assessmentBlocks], [assessmentBlocks, document.blocks]);
  const curriculumSections = useMemo(() => groupCurriculumSections(visibleBlocks), [visibleBlocks]);
  // 검증 진행 분모는 기본 문서의 강한 검증 지점으로 고정한다. due 평가 섹션이
  // 동적으로 붙었다 떨어질 때 분모가 흔들리면 진행률을 믿을 수 없다.
  const verifySections = useMemo(
    () => lessonVerifySections(groupCurriculumSections(document.blocks).sections),
    [document.blocks],
  );
  // 완성 예제 자동 실행 큐.
  //
  // 예제는 코드만 보여 주고 결과는 감춰 두던 자리였다. 차트를 만드는 예제조차 학습자 화면에는
  // 글자만 남아, 그 절이 무엇을 만드는지 눈으로 볼 방법이 없었다. 예제가 만드는 결과는 시스템이
  // 이미 아는 내용이라 학습자가 따로 눌러 확인할 이유가 없다.
  //
  // 큐를 부모가 들고 한 번에 하나씩 보내는 이유는 두 가지다. 커널 세션이 하나라 동시에 보내면
  // 서로의 순서를 밀어내고, 앞 예제가 만든 변수를 뒤 예제가 그대로 쓰기 때문에 순서가 곧
  // 정확성이다.
  const autoRunQueueRef = useRef<string[]>([]);
  const autoRunLessonRef = useRef("");
  const autoRunPendingRef = useRef<string | null>(null);

  useEffect(() => {
    const lessonKey = `${selectedCategory}/${selectedContentId}`;
    if (autoRunLessonRef.current === lessonKey) return;
    autoRunLessonRef.current = lessonKey;
    autoRunPendingRef.current = null;
    autoRunQueueRef.current = document.blocks
      .filter((block) => block.type === "code" && block.role === "snippet" && block.content.trim())
      .map((block) => block.id);
  }, [document.blocks, selectedCategory, selectedContentId]);

  useEffect(() => {
    if (!canRun || runningBlockId) return;
    const pending = autoRunPendingRef.current;
    if (pending && !results[pending]) return;
    autoRunPendingRef.current = null;
    const queue = autoRunQueueRef.current;
    while (queue.length) {
      const nextId = queue.shift();
      if (!nextId || results[nextId]) continue;
      const block = document.blocks.find((item) => item.id === nextId);
      if (!block) continue;
      autoRunPendingRef.current = block.id;
      onRunBlock(block, block.content);
      return;
    }
  }, [canRun, document.blocks, onRunBlock, results, runningBlockId]);

  const introBlock = curriculumSections.introBlocks[0] ?? document.blocks.find((block) => block.displayKind === "hero" || block.sourceType === "intro");
  const selectedContentIndex = contents.findIndex((content) => content.contentId === selectedContentId);
  const previousLesson = selectedContentIndex > 0 ? contents[selectedContentIndex - 1] : null;
  const nextLesson = selectedContentIndex >= 0 && selectedContentIndex < contents.length - 1
    ? contents[selectedContentIndex + 1]
    : null;

  useEffect(() => {
    let active = true;
    const refreshAssessments = () => {
      void Promise.all([
        import("@/lib/curriculaRegistry").then(({ registryAssessmentBlocks }) => (
          registryAssessmentBlocks(selectedCategory, selectedContentId)
        )),
        readLearningEvidenceEvents(selectedCategory, selectedContentId),
      ]).then(async ([candidates, events]) => {
        const dueBlocks = await dueAssessmentBlocks(document.blocks, candidates, events);
        if (active) setAssessmentBlocks(dueBlocks);
      }).catch((error: unknown) => {
        if (!active) return;
        setAssessmentBlocks([]);
        console.error("learning assessment queue refresh failed", error);
      });
    };
    refreshAssessments();
    window.addEventListener(PROGRESS_UPDATED_EVENT, refreshAssessments);
    return () => {
      active = false;
      window.removeEventListener(PROGRESS_UPDATED_EVENT, refreshAssessments);
    };
  }, [document.blocks, selectedCategory, selectedContentId]);

  return (
    <ScrollArea className="h-full min-h-0 min-w-0" data-learning-content-pane="true">
      <div className="min-w-0 p-4">
        <div className="mx-auto min-w-0 max-w-5xl">
          <LearningOverviewHeader
            apiOnline={apiOnline}
            document={document}
            introBlock={introBlock}
            referenceLoading={referenceLoading}
            sections={curriculumSections.sections}
            verifySections={verifySections}
            onNavigateBlock={onNavigateBlock}
            selectedCategory={selectedCategory}
            selectedCategoryLabel={selectedCategoryLabel}
            selectedContentId={selectedContentId}
            selectedContentLabel={selectedContentLabel}
          />

          {storageError ? (
            <div
              className="border-b border-destructive px-4 py-2 text-sm text-destructive sm:px-6"
              data-learning-storage-alert="true"
              role="alert"
            >
              {storageError}
            </div>
          ) : null}

          <div className="space-y-8 pb-8 pt-5 sm:space-y-10 sm:pt-8" data-learning-section-stack="true">
            {curriculumSections.sections.map((section, index) => (
              <CurriculumSectionCard
                canRun={canRun}
                category={selectedCategory}
                contentId={selectedContentId}
                drafts={drafts}
                index={index}
                key={section.id}
                renderCodeCellEditor={renderCodeCellEditor}
                results={results}
                runningBlockId={runningBlockId}
                section={section}
                selectedBlockId={selectedBlockId}
                onDraftChange={onDraftChange}
                onRunBlock={onRunBlock}
                onSelectBlock={onSelectBlock}
              />
            ))}
          </div>
          {previousLesson || nextLesson ? (
            <nav
              aria-label="레슨 이동"
              className="mb-16 grid border-y border-border sm:grid-cols-2"
              data-learning-lesson-navigation="true"
            >
              {previousLesson ? (
                <Button
                  aria-label={`이전 레슨: ${previousLesson.title}`}
                  className={cn(
                    "h-auto min-h-16 justify-start rounded-none px-3 py-3 text-left sm:px-4",
                    nextLesson && "border-b border-border sm:border-b-0 sm:border-r",
                  )}
                  data-learning-control-intent="navigation"
                  data-learning-previous-lesson={previousLesson.contentId}
                  type="button"
                  variant="ghost"
                  onClick={() => onSelectLesson(previousLesson.contentId)}
                >
                  <ChevronLeft aria-hidden="true" />
                  <span className="min-w-0">
                    <small className="block text-xs font-normal text-muted-foreground">이전 레슨</small>
                    <strong className="block truncate text-sm text-foreground">{previousLesson.title}</strong>
                  </span>
                </Button>
              ) : null}
              {nextLesson ? (
                <Button
                  aria-label={`다음 레슨: ${nextLesson.title}`}
                  className={cn(
                    "h-auto min-h-16 justify-end rounded-none px-3 py-3 text-right sm:px-4",
                    !previousLesson && "sm:col-start-2",
                  )}
                  data-learning-control-intent="navigation"
                  data-learning-next-lesson={nextLesson.contentId}
                  type="button"
                  variant="ghost"
                  onClick={() => onSelectLesson(nextLesson.contentId)}
                >
                  <span className="min-w-0">
                    <small className="block text-xs font-normal text-muted-foreground">다음 레슨</small>
                    <strong className="block truncate text-sm text-foreground">{nextLesson.title}</strong>
                  </span>
                  <ChevronRight aria-hidden="true" />
                </Button>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>
    </ScrollArea>
  );
}
