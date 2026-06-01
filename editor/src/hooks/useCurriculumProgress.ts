import { useCallback, useEffect, useState } from "react";

import { loadCurriculumProgress } from "@/lib/curriculumProgress";
import type { ProgressSummary } from "@/types";

const PROGRESS_ERRORS = new Set(["NetworkError", "TypeError"]);

export type UseCurriculumProgressResult = {
  summary: ProgressSummary | null;
  loading: boolean;
  reload: () => Promise<void>;
};

export function useCurriculumProgress(): UseCurriculumProgressResult {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const next = await loadCurriculumProgress();
      setSummary(next);
    } catch (error) {
      const name = (error as { name?: string } | null)?.name ?? "";
      if (!PROGRESS_ERRORS.has(name)) {
        console.warn("progress reload failed", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { summary, loading, reload };
}
