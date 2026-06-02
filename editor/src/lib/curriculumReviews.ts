import { codaroApi } from "@/lib/api";
import type { ReviewListPayload } from "@/types";

export async function loadCurriculumReviews(): Promise<ReviewListPayload> {
  return codaroApi.curriculumReviews();
}
