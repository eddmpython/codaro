import { codaroApi } from "@/lib/api";
import { PROGRESS_UPDATED_EVENT } from "@/lib/curriculumCompletion";
import type { ReviewListPayload, ReviewStatePayload } from "@/types";

export async function loadCurriculumReviews(): Promise<ReviewListPayload> {
  return codaroApi.curriculumReviews();
}

export async function recordReviewResult(
  category: string,
  contentId: string,
  success: boolean,
): Promise<ReviewStatePayload> {
  const state = await codaroApi.curriculumRecordReview(category, contentId, success);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
  }
  return state;
}
