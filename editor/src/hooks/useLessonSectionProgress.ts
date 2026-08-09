import { useCallback, useEffect, useState } from "react";

import { PROGRESS_UPDATED_EVENT } from "@/lib/curriculumProgressEvent";
import { loadCanonicalCurriculumLearningState } from "@/lib/curriculumLearningState";

export type UseLessonSectionProgressResult = {
  creditedSectionIds: string[];
  loading: boolean;
};

// 현재 레슨에서 strong check를 통과한 섹션 목록. assurance credit과 수업 내 진행은 분리한다.
export function useLessonSectionProgress(lessonRef: string): UseLessonSectionProgressResult {
  const [creditedSectionIds, setCreditedSectionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const projection = await loadCanonicalCurriculumLearningState();
      const lesson = projection.lessons.find((candidate) => candidate.lessonRef === lessonRef);
      setCreditedSectionIds(lesson?.verifiedSectionIds ?? []);
    } catch (error) {
      console.warn("lesson section progress reload failed", error);
    } finally {
      setLoading(false);
    }
  }, [lessonRef]);

  useEffect(() => {
    setCreditedSectionIds([]);
    setLoading(true);
    void reload();
  }, [reload]);

  useEffect(() => {
    const handler = () => void reload();
    window.addEventListener(PROGRESS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(PROGRESS_UPDATED_EVENT, handler);
  }, [reload]);

  return { creditedSectionIds, loading };
}
