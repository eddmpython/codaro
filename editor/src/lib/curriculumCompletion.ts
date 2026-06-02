import { codaroApi } from "@/lib/api";

export const PROGRESS_UPDATED_EVENT = "codaro:progress-updated";

export async function recordLessonMissionComplete(
  category: string,
  contentId: string,
  missionId: string,
  totalMissions: number,
): Promise<void> {
  await codaroApi.updateProgress(category, contentId, missionId, totalMissions);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
  }
}
