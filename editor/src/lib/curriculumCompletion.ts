import { codaroApi } from "@/lib/api";

export async function recordLessonMissionComplete(
  category: string,
  contentId: string,
  missionId: string,
  totalMissions: number,
): Promise<void> {
  await codaroApi.updateProgress(category, contentId, missionId, totalMissions);
}
