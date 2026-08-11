import type { BlockConfig } from "@/types";
import { useEffect, useState } from "react";
import { readLearningEvidenceEvents } from "@/lib/learningEvidenceOperations";
import { PROGRESS_UPDATED_EVENT } from "@/lib/curriculumProgressEvent";
import { dueAssessmentBlocks } from "./curriculumSectionRenderer";

export function useDueAssessmentBlocks({
  blocks,
  category,
  contentId,
}: {
  blocks: BlockConfig[];
  category: string;
  contentId: string;
}) {
  const [assessmentBlocks, setAssessmentBlocks] = useState<BlockConfig[]>([]);

  useEffect(() => {
    let active = true;
    const refreshAssessments = () => {
      void Promise.all([
        import("@/lib/curriculaRegistry").then(({ registryAssessmentBlocks }) => (
          registryAssessmentBlocks(category, contentId)
        )),
        readLearningEvidenceEvents(category, contentId),
      ]).then(async ([candidates, events]) => {
        const dueBlocks = await dueAssessmentBlocks(blocks, candidates, events);
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
  }, [blocks, category, contentId]);

  return assessmentBlocks;
}
