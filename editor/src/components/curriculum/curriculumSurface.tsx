import type { CellAiHelpState } from "@/lib/assistantTypes";
import type { BlockConfig, CodaroDocument } from "@/types";
import type { CellAiAction } from "@/lib/cellModel";
import { useEffect, useMemo, useState } from "react";
import { readLearningEvidenceEvents, usesLocalLearningEvidence } from "@/lib/learningEvidenceOperations";
import { PROGRESS_UPDATED_EVENT } from "@/lib/curriculumProgressEvent";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RenderCodeCellEditor, ResultMap } from "./curriculumSurfaceModels";
import type { LearningArchiveMaterialization } from "@/lib/learningArchive";

export { CurriculumHeaderProgress } from "./curriculumOverview";
export { CurriculumCellToc } from "./curriculumToc";
import { LearningEvidenceBar, LearningOverviewHeader } from "./curriculumOverview";
import { CurriculumSectionCard, dueAssessmentBlocks, groupCurriculumSections } from "./curriculumSectionRenderer";

export function CurriculumView({
  apiOnline,
  canRun,
  cellHelpByBlockId,
  contents = [],
  document,
  drafts,
  pendingBlocks,
  referenceLoading,
  renderCodeCellEditor,
  results,
  runningBlockId,
  selectedBlockId,
  selectedCategoryLabel,
  selectedCategory,
  selectedContentLabel,
  selectedContentId,
  onAcceptPendingBlocks,
  onCellAsk,
  onDraftChange,
  onImportLearningArchive,
  onRejectPendingBlocks,
  onRunBlock,
  onOpenTerminalCommand,
  onSelectBlock,
}: {
  apiOnline: boolean;
  canRun: boolean;
  cellHelpByBlockId: Record<string, CellAiHelpState>;
  contents?: Array<{ contentId: string; title: string }>;
  document: CodaroDocument;
  drafts: Record<string, string>;
  pendingBlocks: BlockConfig[];
  referenceLoading: boolean;
  renderCodeCellEditor: RenderCodeCellEditor;
  results: ResultMap;
  runningBlockId: string | null;
  selectedBlockId: string;
  selectedCategoryLabel: string;
  selectedCategory: string;
  selectedContentLabel: string;
  selectedContentId: string;
  onAcceptPendingBlocks: () => void;
  onCellAsk: (action: CellAiAction, block: BlockConfig, question?: string) => void;
  onDraftChange: (blockId: string, value: string) => void;
  onImportLearningArchive: (archive: LearningArchiveMaterialization) => Promise<void> | void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig, sourceOverride?: string) => void;
  onOpenTerminalCommand: (command: string) => void;
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
    <ScrollArea className="h-full min-h-0 min-w-0">
      <div className="min-w-0 p-4">
        <div className="mx-auto min-w-0 max-w-5xl space-y-4">
          <LearningOverviewHeader
            apiOnline={apiOnline}
            contents={contents}
            document={document}
            introBlock={introBlock}
            pendingBlocks={pendingBlocks}
            referenceLoading={referenceLoading}
            sections={curriculumSections.sections}
            selectedCategory={selectedCategory}
            selectedCategoryLabel={selectedCategoryLabel}
            selectedContentId={selectedContentId}
            selectedContentLabel={selectedContentLabel}
            onOpenTerminalCommand={onOpenTerminalCommand}
            onAcceptPendingBlocks={onAcceptPendingBlocks}
            onRejectPendingBlocks={onRejectPendingBlocks}
          />

          <LearningEvidenceBar
            document={document}
            drafts={drafts}
            lessonRef={`${selectedCategory}/${selectedContentId}`}
            localRuntime={usesLocalLearningEvidence()}
            onImportArchive={onImportLearningArchive}
          />

          <div className="space-y-4">
            {curriculumSections.sections.map((section, index) => (
              <CurriculumSectionCard
                canRun={canRun}
                category={selectedCategory}
                cellHelpByBlockId={cellHelpByBlockId}
                contentId={selectedContentId}
                drafts={drafts}
                index={index}
                key={section.id}
                renderCodeCellEditor={renderCodeCellEditor}
                results={results}
                runningBlockId={runningBlockId}
                section={section}
                selectedBlockId={selectedBlockId}
                onCellAsk={onCellAsk}
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
