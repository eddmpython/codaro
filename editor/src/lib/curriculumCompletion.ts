import { codaroApi } from "@/lib/api";
import { recordAssignmentMissionEvent } from "@/lib/classroomEvents";

export const PROGRESS_UPDATED_EVENT = "codaro:progress-updated";

export async function recordLessonMissionComplete(
  category: string,
  contentId: string,
  missionId: string,
  totalMissions: number,
): Promise<{ lessonCompleted: boolean }> {
  const lesson = await codaroApi.updateProgress(category, contentId, missionId, totalMissions);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
  }
  const completedAt = (lesson as { completedAt?: unknown } | null)?.completedAt;
  const lessonCompleted = typeof completedAt === "string" && completedAt.length > 0;
  try {
    await recordAssignmentMissionEvent({
      category,
      contentId,
      missionId,
      totalMissions,
      lessonCompleted,
    });
  } catch (error) {
    console.warn("assignment mission event record failed", error);
  }
  return { lessonCompleted };
}
