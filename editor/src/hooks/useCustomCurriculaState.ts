import { useCallback, useEffect, useState } from "react";
import {
  createCustomCurriculumEntry,
  customCurriculaStorageKey,
  loadCustomCurricula,
  upsertCustomCurriculumEntry,
  type CustomCurriculumEntry,
} from "@/lib/customCurricula";
import type { AppNotice, BlockConfig } from "@/types";

type UseCustomCurriculaStateOptions = {
  initialSelectedCustomCurriculumId: string;
  onNotice: (notice: AppNotice) => void;
};

export function useCustomCurriculaState({
  initialSelectedCustomCurriculumId,
  onNotice,
}: UseCustomCurriculaStateOptions) {
  const [customCurricula, setCustomCurricula] = useState<CustomCurriculumEntry[]>(() => loadCustomCurricula());
  const [selectedCustomCurriculumId, setSelectedCustomCurriculumId] = useState(initialSelectedCustomCurriculumId);

  useEffect(() => {
    try {
      window.localStorage.setItem(customCurriculaStorageKey, JSON.stringify(customCurricula));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      onNotice({
        tone: "warning",
        title: "커리큘럼 저장 제한",
        detail: `브라우저 저장소에 나만의 커리큘럼을 기록하지 못했습니다. ${detail}`,
      });
    }
  }, [customCurricula, onNotice]);

  const findCustomCurriculum = useCallback((id: string) => {
    return customCurricula.find((item) => item.id === id);
  }, [customCurricula]);

  const saveCustomCurriculumEntry = useCallback((blocks: BlockConfig[], title?: string) => {
    if (!blocks.length) return null;
    const entry = createCustomCurriculumEntry(blocks, title);
    setCustomCurricula((current) => upsertCustomCurriculumEntry(current, entry));
    return entry;
  }, []);

  return {
    customCurricula,
    findCustomCurriculum,
    saveCustomCurriculumEntry,
    selectedCustomCurriculumId,
    setSelectedCustomCurriculumId,
  };
}
