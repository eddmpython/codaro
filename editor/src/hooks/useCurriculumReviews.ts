import { useCallback, useEffect, useState } from "react";

import { PROGRESS_UPDATED_EVENT } from "@/lib/curriculumCompletion";
import { loadCurriculumReviews } from "@/lib/curriculumReviews";
import type { ReviewListPayload } from "@/types";

const REVIEW_ERRORS = new Set(["NetworkError", "TypeError"]);

export type UseCurriculumReviewsResult = {
  reviews: ReviewListPayload | null;
  loading: boolean;
  reload: () => Promise<void>;
};

export function useCurriculumReviews(): UseCurriculumReviewsResult {
  const [reviews, setReviews] = useState<ReviewListPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const next = await loadCurriculumReviews();
      setReviews(next);
    } catch (error) {
      const name = (error as { name?: string } | null)?.name ?? "";
      if (!REVIEW_ERRORS.has(name)) {
        console.warn("review reload failed", error);
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

  return { reviews, loading, reload };
}
