import type { BlockConfig, CodaroDocument } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { readLearningEvidenceEvents } from "@/lib/learningEvidenceOperations";
import { PROGRESS_UPDATED_EVENT } from "@/lib/curriculumProgressEvent";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RenderCodeCellEditor, ResultMap } from "./curriculumSurfaceModels";

export { CurriculumHeaderProgress } from "./curriculumOverview";
export { CurriculumCellToc } from "./curriculumToc";
import { LearningOverviewHeader } from "./curriculumOverview";
import { CurriculumSectionCard, dueAssessmentBlocks, groupCurriculumSections } from "./curriculumSectionRenderer";

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
  onRunBlock,
  onSelectBlock,
}: {
  apiOnline: boolean;
  canRun: boolean;
  contents?: Array<{ contentId: string; title: string }>;
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
  onRunBlock: (block: BlockConfig, sourceOverride?: string) => void;
  onSelectBlock: (blockId: string) => void;
}) {
  const [assessmentBlocks, setAssessmentBlocks] = useState<BlockConfig[]>([]);
  const visibleBlocks = useMemo(() => [...document.blocks, ...assessmentBlocks], [assessmentBlocks, document.blocks]);
  const curriculumSections = useMemo(() => groupCurriculumSections(visibleBlocks), [visibleBlocks]);
  const introBlock = curriculumSections.introBlocks[0] ?? document.blocks.find((block) => block.displayKind === "hero" || block.sourceType === "intro");

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
        if (active) setAssessmentBlocks([]);
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
            contents={contents}
            document={document}
            introBlock={introBlock}
            referenceLoading={referenceLoading}
            sections={curriculumSections.sections}
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

          <div>
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
        </div>
      </div>
    </ScrollArea>
  );
}
