import { codaroApi } from "@/lib/api";
import type { ProgressSummary } from "@/types";

export async function loadCurriculumProgress(): Promise<ProgressSummary> {
  return codaroApi.progress();
}
