import { useCallback, useEffect, useState } from "react";
import {
  createCustomCurriculumEntry,
  createCustomCurriculumEntryFromDocument,
  customCurriculaStorageKey,
  loadCustomCurricula,
  upsertCustomCurriculumEntry,
  type CustomCurriculumEntry,
} from "@/lib/customCurricula";
import { translate } from "@/lib/localeCopy";
import type { AppNotice, BlockConfig, CodaroDocument } from "@/types";

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
        title: translate("system.customCurriculumStorageLimited.title"),
        detail: translate("system.customCurriculumStorageLimited.detail", { detail }),
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

  const saveCustomCurriculumDocumentEntry = useCallback((document: CodaroDocument, title?: string) => {
    const entry = createCustomCurriculumEntryFromDocument(document, title);
    setCustomCurricula((current) => upsertCustomCurriculumEntry(current, entry));
    return entry;
  }, []);

  const removeCustomCurriculumEntry = useCallback((id: string) => {
    setCustomCurricula((current) => current.filter((item) => item.id !== id));
    setSelectedCustomCurriculumId((current) => current === id ? "" : current);
  }, []);

  return {
    customCurricula,
    findCustomCurriculum,
    removeCustomCurriculumEntry,
    saveCustomCurriculumDocumentEntry,
    saveCustomCurriculumEntry,
    selectedCustomCurriculumId,
    setSelectedCustomCurriculumId,
  };
}
