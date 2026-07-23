import { useCallback, useEffect, useState } from "react";

import { PROGRESS_UPDATED_EVENT } from "@/lib/curriculumProgressEvent";
import { loadLearnerSnapshot } from "@/lib/learnerSnapshot";
import type { LearnerSnapshotPayload } from "@/types";

const SNAPSHOT_ERRORS = new Set(["NetworkError", "TypeError"]);

export type UseLearnerSnapshotResult = {
  snapshot: LearnerSnapshotPayload | null;
  loading: boolean;
  reload: () => Promise<void>;
};

export function useLearnerSnapshot(): UseLearnerSnapshotResult {
  const [snapshot, setSnapshot] = useState<LearnerSnapshotPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const next = await loadLearnerSnapshot();
      setSnapshot(next);
    } catch (error) {
      const name = (error as { name?: string } | null)?.name ?? "";
      if (!SNAPSHOT_ERRORS.has(name)) {
        console.warn("learner snapshot reload failed", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const handler = () => void reload();
    window.addEventListener(PROGRESS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(PROGRESS_UPDATED_EVENT, handler);
  }, [reload]);

  return { snapshot, loading, reload };
}
