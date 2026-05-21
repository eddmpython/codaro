import { useCallback, useEffect, useState } from "react";
import {
  type AppBootstrapState,
  initialBootstrapState,
} from "@/lib/appBootstrap";
import {
  loadCurriculumContentsState,
  loadCurriculumLessonState,
  selectCategory,
  selectContent,
  type CurriculumSelection,
} from "@/lib/curriculumSelection";
import type { AppNotice, CodaroDocument } from "@/types";

type CurriculumSelectionState = CurriculumSelection & {
  document: CodaroDocument;
  draftUpdates: Record<string, string>;
  selectedBlockId: string;
};

type UseCurriculumLibraryStateOptions = {
  onDraftUpdates: (updates: Record<string, string>) => void;
  onNotice: (notice: AppNotice) => void;
};

export function useCurriculumLibraryState({
  onDraftUpdates,
  onNotice,
}: UseCurriculumLibraryStateOptions) {
  const [categories, setCategories] = useState(initialBootstrapState.categories);
  const [categoryGroups, setCategoryGroups] = useState(initialBootstrapState.categoryGroups);
  const [contents, setContents] = useState(initialBootstrapState.contents);
  const [selectedCategory, setSelectedCategory] = useState(initialBootstrapState.selectedCategory);
  const [selectedContentId, setSelectedContentId] = useState(initialBootstrapState.selectedContentId);
  const [contentsLoading, setContentsLoading] = useState(false);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [curriculumDocument, setCurriculumDocument] = useState<CodaroDocument | null>(initialBootstrapState.curriculumDocument);
  const [selectedCurriculumBlockId, setSelectedCurriculumBlockId] = useState(initialBootstrapState.curriculumDocument?.blocks[0]?.id ?? "");

  useEffect(() => {
    let cancelled = false;

    async function loadContents() {
      setContentsLoading(true);
      try {
        const result = await loadCurriculumContentsState(selectedCategory, selectedContentId);
        if (cancelled) return;
        if (result) {
          setContents(result.contents);
          setSelectedContentId(result.selectedContentId);
        }
      } finally {
        if (!cancelled) setContentsLoading(false);
      }
    }

    void loadContents();

    return () => {
      cancelled = true;
    };
  }, [selectedCategory, selectedContentId]);

  useEffect(() => {
    let cancelled = false;

    async function loadReferenceLesson() {
      setReferenceLoading(true);
      try {
        const result = await loadCurriculumLessonState(selectedCategory, selectedContentId);
        if (cancelled) return;
        if (result) {
          setCurriculumDocument(result.document);
          onDraftUpdates(result.draftUpdates);
          setSelectedCurriculumBlockId(result.selectedBlockId);
          onNotice(result.notice);
        }
      } finally {
        if (!cancelled) setReferenceLoading(false);
      }
    }

    void loadReferenceLesson();

    return () => {
      cancelled = true;
    };
  }, [onDraftUpdates, onNotice, selectedCategory, selectedContentId]);

  const applyBootstrapCurriculumState = useCallback((bootstrap: AppBootstrapState) => {
    setCategories(bootstrap.categories);
    setCategoryGroups(bootstrap.categoryGroups);
    setContents(bootstrap.contents);
    setCurriculumDocument(bootstrap.curriculumDocument);
  }, []);

  const applyCurriculumSelectionState = useCallback((selection: CurriculumSelectionState) => {
    setCurriculumDocument(selection.document);
    onDraftUpdates(selection.draftUpdates);
    setSelectedCategory(selection.selectedCategory);
    setSelectedContentId(selection.selectedContentId);
    setSelectedCurriculumBlockId(selection.selectedBlockId);
  }, [onDraftUpdates]);

  const selectCurriculumCategoryState = useCallback((category: string) => {
    const selection = selectCategory(category);
    setSelectedCategory(selection.selectedCategory);
    setSelectedContentId(selection.selectedContentId);
    return selection;
  }, []);

  const selectCurriculumContentState = useCallback((contentId: string) => {
    const selection = selectContent(contentId, selectedCategory);
    setSelectedCategory(selection.selectedCategory);
    setSelectedContentId(selection.selectedContentId);
    return selection;
  }, [selectedCategory]);

  return {
    applyBootstrapCurriculumState,
    applyCurriculumSelectionState,
    categories,
    categoryGroups,
    contents,
    contentsLoading,
    curriculumDocument,
    referenceLoading,
    selectCurriculumCategoryState,
    selectCurriculumContentState,
    selectedCategory,
    selectedContentId,
    selectedCurriculumBlockId,
    setSelectedCurriculumBlockId,
  };
}
