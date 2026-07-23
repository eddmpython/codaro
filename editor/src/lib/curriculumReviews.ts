import { reviewListFromCanonicalProjection } from "@/lib/curriculumLearningProjection";
import { loadCanonicalCurriculumLearningState } from "@/lib/curriculumLearningState";
import type { ReviewListPayload } from "@/types";

export async function loadCurriculumReviews(): Promise<ReviewListPayload> {
  return reviewListFromCanonicalProjection(await loadCanonicalCurriculumLearningState());
}
