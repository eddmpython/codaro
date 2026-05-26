import { useCallback, useMemo, useState } from "react";

import type { SidebarCustomCurriculum } from "@/components/app/productSidebar";
import {
  categorySubtitle,
  categoryTitle,
} from "@/lib/fallbackData";
import {
  buildCustomCurriculumApplication,
  type CustomCurriculumApplication,
  type CustomCurriculumEntry,
} from "@/lib/customCurricula";
import type { SurfaceMode } from "@/lib/surfaceModel";
import type { AppNotice, BlockConfig, CurriculumCategory } from "@/types";

type UseCurriculumNavigationStateOptions = {
  applyCurriculumSelectionState: (selection: CustomCurriculumApplication) => void;
  categories: CurriculumCategory[];
  customCurricula: CustomCurriculumEntry[];
  findCustomCurriculum: (id: string) => CustomCurriculumEntry | undefined;
  removeCustomCurriculumEntry: (id: string) => void;
  saveCustomCurriculumEntry: (blocks: BlockConfig[], title?: string) => CustomCurriculumEntry | null;
  selectCurriculumCategoryState: (category: string) => {
    selectedCustomCurriculumId: string;
  };
  selectCurriculumContentState: (contentId: string) => {
    selectedCustomCurriculumId: string;
  };
  setSelectedCustomCurriculumId: (id: string) => void;
  setSurface: (surface: SurfaceMode) => void;
  onNotice: (notice: AppNotice) => void;
};

export function useCurriculumNavigationState({
  applyCurriculumSelectionState,
  categories,
  customCurricula,
  findCustomCurriculum,
  removeCustomCurriculumEntry,
  saveCustomCurriculumEntry,
  selectCurriculumCategoryState,
  selectCurriculumContentState,
  setSelectedCustomCurriculumId,
  setSurface,
  onNotice,
}: UseCurriculumNavigationStateOptions) {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return categories;
    return categories.filter((category) => {
      const label = `${category.name} ${category.description} ${category.track ?? ""} ${categoryTitle(category.key)} ${categorySubtitle(category.key, category.description)} ${category.key}`;
      return label.toLowerCase().includes(trimmed);
    });
  }, [categories, query]);

  const sidebarCustomCurricula = useMemo<SidebarCustomCurriculum[]>(() => {
    return customCurricula.map((entry) => ({
      id: entry.id,
      title: entry.title,
      blockCount: entry.document.blocks.length,
      createdAt: entry.createdAt,
    }));
  }, [customCurricula]);

  const applyCustomCurriculumApplication = useCallback((application: CustomCurriculumApplication) => {
    applyCurriculumSelectionState(application);
    setSelectedCustomCurriculumId(application.selectedCustomCurriculumId);
    setSurface(application.surfaceToOpen);
    if (application.notice) {
      onNotice(application.notice);
    }
  }, [applyCurriculumSelectionState, onNotice, setSelectedCustomCurriculumId, setSurface]);

  const saveCustomCurriculum = useCallback((blocks: BlockConfig[], title?: string) => {
    const entry = saveCustomCurriculumEntry(blocks, title);
    if (!entry) return null;
    applyCustomCurriculumApplication(buildCustomCurriculumApplication(entry, { showNotice: true }));
    return entry;
  }, [applyCustomCurriculumApplication, saveCustomCurriculumEntry]);

  const selectCurriculumCategory = useCallback((key: string) => {
    const selection = selectCurriculumCategoryState(key);
    setSelectedCustomCurriculumId(selection.selectedCustomCurriculumId);
    setSurface("curriculum");
  }, [selectCurriculumCategoryState, setSelectedCustomCurriculumId, setSurface]);

  const selectCurriculumContent = useCallback((contentId: string) => {
    const selection = selectCurriculumContentState(contentId);
    setSelectedCustomCurriculumId(selection.selectedCustomCurriculumId);
    setSurface("curriculum");
  }, [selectCurriculumContentState, setSelectedCustomCurriculumId, setSurface]);

  const selectCustomCurriculum = useCallback((id: string) => {
    const entry = findCustomCurriculum(id);
    if (!entry) return;
    applyCustomCurriculumApplication(buildCustomCurriculumApplication(entry));
  }, [applyCustomCurriculumApplication, findCustomCurriculum]);

  const deleteCustomCurriculum = useCallback((id: string) => {
    const entry = findCustomCurriculum(id);
    if (!entry) return;
    removeCustomCurriculumEntry(id);
    const fallbackCategory = categories[0]?.key ?? "30days";
    const selection = selectCurriculumCategoryState(fallbackCategory);
    setSelectedCustomCurriculumId(selection.selectedCustomCurriculumId);
    setSurface("curriculum");
    onNotice({
      tone: "success",
      title: "나만의 커리큘럼 삭제됨",
      detail: entry.title,
    });
  }, [categories, findCustomCurriculum, onNotice, removeCustomCurriculumEntry, selectCurriculumCategoryState, setSelectedCustomCurriculumId, setSurface]);

  return {
    deleteCustomCurriculum,
    filteredCategories,
    query,
    saveCustomCurriculum,
    selectCustomCurriculum,
    selectCurriculumCategory,
    selectCurriculumContent,
    setQuery,
    sidebarCustomCurricula,
  };
}
