import { useCallback, type Dispatch, type SetStateAction } from "react";

import { defaultRegistrySelection } from "@/lib/curriculaRegistry";
import type { AutomationSection, SurfaceMode } from "@/lib/surfaceModel";
import type { CurriculumCategory } from "@/types";

type UseProductSurfaceSelectionOptions = {
  categories: CurriculumCategory[];
  selectedCategory: string;
  selectCurriculumCategory: (category: string) => void;
  setAutomationSection: (section: AutomationSection) => void;
  setSurface: Dispatch<SetStateAction<SurfaceMode>>;
};

export function useProductSurfaceSelection({
  categories,
  selectedCategory,
  selectCurriculumCategory,
  setAutomationSection,
  setSurface,
}: UseProductSurfaceSelectionOptions) {
  const selectSurface = useCallback((nextSurface: SurfaceMode) => {
    if (nextSurface === "curriculum") {
      selectCurriculumCategory(productLearningCategory(categories, selectedCategory));
      return;
    }
    setSurface(nextSurface);
  }, [categories, selectCurriculumCategory, selectedCategory, setSurface]);

  const selectAutomationSection = useCallback((section: AutomationSection) => {
    setAutomationSection(section);
    setSurface("automation");
  }, [setAutomationSection, setSurface]);

  return {
    selectAutomationSection,
    selectSurface,
  };
}

export function productLearningCategory(categories: CurriculumCategory[], selectedCategory: string): string {
  if (categories.some((category) => category.key === selectedCategory)) {
    return selectedCategory;
  }
  const defaultCategory = defaultRegistrySelection().category;
  if (categories.some((category) => category.key === defaultCategory)) {
    return defaultCategory;
  }
  return categories[0]?.key ?? selectedCategory;
}
