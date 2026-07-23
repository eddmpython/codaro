import { useCallback, useMemo, useState } from "react";

import {
  categorySubtitle,
  categoryTitle,
} from "@/lib/fallbackData";
import {
  buildCustomCurriculumApplication,
  sidebarCustomCurriculumFromEntry,
  type CustomCurriculumApplication,
  type CustomCurriculumEntry,
  type SidebarCustomCurriculum,
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
    selectedCategory: string;
    selectedContentId: string;
    selectedCustomCurriculumId: string;
  };
  selectCurriculumContentState: (contentId: string) => {
    selectedCategory: string;
    selectedContentId: string;
    selectedCustomCurriculumId: string;
  };
  selectCurriculumLessonState: (category: string, contentId: string) => {
    selectedCategory: string;
    selectedContentId: string;
    selectedCustomCurriculumId: string;
  };
  selectedCustomCurriculumId: string;
  setSelectedCustomCurriculumId: (id: string) => void;
  setSurface: (surface: SurfaceMode) => void;
  onNavigateCurriculum: (category: string, contentId: string) => void;
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
  selectCurriculumLessonState,
  selectedCustomCurriculumId,
  setSelectedCustomCurriculumId,
  setSurface,
  onNavigateCurriculum,
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
    return customCurricula.map(sidebarCustomCurriculumFromEntry);
  }, [customCurricula]);

  const applyCustomCurriculumApplication = useCallback((application: CustomCurriculumApplication) => {
    applyCurriculumSelectionState(application);
    setSelectedCustomCurriculumId(application.selectedCustomCurriculumId);
    setSurface(application.surfaceToOpen);
    if (application.notice) {
      onNotice(application.notice);
    }
  }, [applyCurriculumSelectionState, onNotice, setSelectedCustomCurriculumId, setSurface]);

  const openCustomCurriculum = useCallback((
    entry: CustomCurriculumEntry,
    options: { showNotice?: boolean } = {},
  ) => {
    applyCustomCurriculumApplication(buildCustomCurriculumApplication(entry, options));
  }, [applyCustomCurriculumApplication]);

  const saveCustomCurriculum = useCallback((blocks: BlockConfig[], title?: string) => {
    return saveCustomCurriculumEntry(blocks, title);
  }, [saveCustomCurriculumEntry]);

  const selectCurriculumCategory = useCallback((key: string) => {
    const selection = selectCurriculumCategoryState(key);
    setSelectedCustomCurriculumId(selection.selectedCustomCurriculumId);
    onNavigateCurriculum(selection.selectedCategory, selection.selectedContentId);
    setSurface("curriculum");
  }, [onNavigateCurriculum, selectCurriculumCategoryState, setSelectedCustomCurriculumId, setSurface]);

  const selectCurriculumContent = useCallback((contentId: string) => {
    const selection = selectCurriculumContentState(contentId);
    setSelectedCustomCurriculumId(selection.selectedCustomCurriculumId);
    onNavigateCurriculum(selection.selectedCategory, selection.selectedContentId);
    setSurface("curriculum");
  }, [onNavigateCurriculum, selectCurriculumContentState, setSelectedCustomCurriculumId, setSurface]);

  const selectCurriculumLesson = useCallback((category: string, contentId: string) => {
    const selection = selectCurriculumLessonState(category, contentId);
    setSelectedCustomCurriculumId(selection.selectedCustomCurriculumId);
    onNavigateCurriculum(selection.selectedCategory, selection.selectedContentId);
    setSurface("curriculum");
  }, [onNavigateCurriculum, selectCurriculumLessonState, setSelectedCustomCurriculumId, setSurface]);

  const selectCustomCurriculum = useCallback((id: string) => {
    const entry = findCustomCurriculum(id);
    if (!entry) return;
    applyCustomCurriculumApplication(buildCustomCurriculumApplication(entry));
  }, [applyCustomCurriculumApplication, findCustomCurriculum]);

  const deleteCustomCurriculum = useCallback((id: string) => {
    const entry = findCustomCurriculum(id);
    if (!entry) return;
    removeCustomCurriculumEntry(id);
    if (id === selectedCustomCurriculumId) {
      const fallbackCategory = categories[0]?.key ?? "30days";
      const selection = selectCurriculumCategoryState(fallbackCategory);
      setSelectedCustomCurriculumId(selection.selectedCustomCurriculumId);
    }
    onNotice({
      tone: "success",
      title: "나만의 커리큘럼 삭제됨",
      detail: entry.title,
    });
  }, [categories, findCustomCurriculum, onNotice, removeCustomCurriculumEntry, selectCurriculumCategoryState, selectedCustomCurriculumId, setSelectedCustomCurriculumId]);

  return {
    deleteCustomCurriculum,
    filteredCategories,
    openCustomCurriculum,
    query,
    saveCustomCurriculum,
    selectCustomCurriculum,
    selectCurriculumCategory,
    selectCurriculumContent,
    selectCurriculumLesson,
    setQuery,
    sidebarCustomCurricula,
  };
}
