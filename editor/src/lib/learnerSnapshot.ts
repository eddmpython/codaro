import { codaroApi } from "@/lib/api";
import type { LearnerSnapshotPayload } from "@/types";

export async function loadLearnerSnapshot(): Promise<LearnerSnapshotPayload> {
  return codaroApi.learnerSnapshot();
}
