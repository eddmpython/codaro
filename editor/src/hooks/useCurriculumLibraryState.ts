import { useCallback, useEffect, useRef, useState } from "react";
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
import { lessonRefFromKey, type RunRouteLessonRef } from "@/lib/runRouteState";
import { isExecutableBlock } from "@/lib/cellModel";
import type { LearningArchiveMaterialization } from "@/lib/learningArchive";
import {
  canonicalLearningArchiveLessonRef,
  readPersistedLearningArchive,
} from "@/lib/browserLearningArchive";

type CurriculumSelectionState = CurriculumSelection & {
  document: CodaroDocument;
  draftUpdates: Record<string, string>;
  selectedBlockId: string;
};

type UseCurriculumLibraryStateOptions = {
  initialSelection?: RunRouteLessonRef | null;
  onDraftUpdates: (updates: Record<string, string>) => void;
  onNotice: (notice: AppNotice) => void;
};

export function useCurriculumLibraryState({
  initialSelection,
  onDraftUpdates,
  onNotice,
}: UseCurriculumLibraryStateOptions) {
  const [categories, setCategories] = useState(initialBootstrapState.categories);
  const [categoryGroups, setCategoryGroups] = useState(initialBootstrapState.categoryGroups);
  const [categoryTree, setCategoryTree] = useState(initialBootstrapState.categoryTree);
  const [contents, setContents] = useState(initialBootstrapState.contents);
  const [selectedCategory, setSelectedCategory] = useState(
    initialSelection?.category ?? initialBootstrapState.selectedCategory,
  );
  const [selectedContentId, setSelectedContentId] = useState(
    initialSelection?.contentId ?? initialBootstrapState.selectedContentId,
  );
  const [contentsLoading, setContentsLoading] = useState(false);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [curriculumDocument, setCurriculumDocument] = useState<CodaroDocument | null>(initialBootstrapState.curriculumDocument);
  const [selectedCurriculumBlockId, setSelectedCurriculumBlockId] = useState(initialBootstrapState.curriculumDocument?.blocks[0]?.id ?? "");
  const importedArchiveLessonRef = useRef<string | null>(null);
  const referenceRequestRevision = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function loadContents() {
      setContentsLoading(true);
      try {
        const result = await loadCurriculumContentsState(selectedCategory, selectedContentId);
        if (cancelled) return;
        if (result) {
          setContents(result.contents);
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
    const selectedLessonRef = `${selectedCategory}/${selectedContentId}`;
    const requestRevision = ++referenceRequestRevision.current;

    if (importedArchiveLessonRef.current === selectedLessonRef) {
      importedArchiveLessonRef.current = null;
      setReferenceLoading(false);
      return () => {
        cancelled = true;
      };
    }

    async function loadReferenceLesson() {
      setReferenceLoading(true);
      try {
        let persisted: LearningArchiveMaterialization | null = null;
        try {
          persisted = await readPersistedLearningArchive(selectedLessonRef);
        } catch (error) {
          console.error("저장한 학습 작업을 복원하지 못했습니다.", error);
        }
        if (cancelled || requestRevision !== referenceRequestRevision.current) return;
        if (persisted) {
          const document = persisted.document;
          setCurriculumDocument(document);
          onDraftUpdates(persisted.drafts);
          setSelectedCurriculumBlockId(
            document.blocks.find(isExecutableBlock)?.id ?? document.blocks[0]?.id ?? "",
          );
          onNotice({
            tone: "success",
            title: "저장한 학습 작업을 복원했습니다.",
            detail: document.title,
          });
          return;
        }

        const result = await loadCurriculumLessonState(selectedCategory, selectedContentId);
        if (cancelled || requestRevision !== referenceRequestRevision.current) return;
        if (result) {
          const canonicalLessonRef = `${selectedCategory}/${result.selectedContentId}`;
          try {
            persisted = await readPersistedLearningArchive(canonicalLessonRef);
          } catch (error) {
            console.error("저장한 학습 작업을 복원하지 못했습니다.", error);
          }
          if (cancelled || requestRevision !== referenceRequestRevision.current) return;

          const document = persisted?.document ?? result.document;
          const draftUpdates = persisted?.drafts ?? result.draftUpdates;
          const selectedBlockId = persisted
            ? document.blocks.find(isExecutableBlock)?.id ?? document.blocks[0]?.id ?? ""
            : result.selectedBlockId;
          setCurriculumDocument(document);
          onDraftUpdates(draftUpdates);
          setSelectedCurriculumBlockId(selectedBlockId);
          setSelectedContentId((current) => current === result.selectedContentId ? current : result.selectedContentId);
          onNotice(persisted ? {
            tone: "success",
            title: "저장한 학습 작업을 복원했습니다.",
            detail: document.title,
          } : result.notice);
        }
      } finally {
        if (!cancelled && requestRevision === referenceRequestRevision.current) {
          setReferenceLoading(false);
        }
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
    setCategoryTree(bootstrap.categoryTree);
    setContents(bootstrap.contents);
    setSelectedCategory(initialSelection?.category ?? bootstrap.selectedCategory);
    setSelectedContentId(initialSelection?.contentId ?? bootstrap.selectedContentId);
    if (!initialSelection && bootstrap.curriculumDocument) {
      setCurriculumDocument(bootstrap.curriculumDocument);
      setSelectedCurriculumBlockId(bootstrap.curriculumDocument.blocks[0]?.id ?? "");
    }
  }, [initialSelection]);

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

  const selectCurriculumLessonState = useCallback((category: string, contentId: string) => {
    const selection = selectContent(contentId, category);
    setSelectedCategory(selection.selectedCategory);
    setSelectedContentId(selection.selectedContentId);
    return selection;
  }, []);

  const restoreCurriculumRouteState = useCallback((selection: RunRouteLessonRef) => {
    setSelectedCategory(selection.category);
    setSelectedContentId(selection.contentId);
  }, []);

  const applyImportedLearningArchiveState = useCallback(async (materialized: LearningArchiveMaterialization) => {
    const archiveLessonRef = await canonicalLearningArchiveLessonRef(materialized);
    const selection = lessonRefFromKey(archiveLessonRef);
    if (!selection) throw new Error("학습 archive의 레슨 주소를 복원할 수 없습니다.");

    const nextLessonRef = `${selection.category}/${selection.contentId}`;
    const lessonChanged = selection.category !== selectedCategory || selection.contentId !== selectedContentId;
    referenceRequestRevision.current += 1;
    importedArchiveLessonRef.current = lessonChanged ? nextLessonRef : null;
    setReferenceLoading(false);
    setCurriculumDocument(materialized.document);
    onDraftUpdates(materialized.drafts);
    setSelectedCategory(selection.category);
    setSelectedContentId(selection.contentId);
    setSelectedCurriculumBlockId(
      materialized.document.blocks.find(isExecutableBlock)?.id
        ?? materialized.document.blocks[0]?.id
        ?? "",
    );
    return selection;
  }, [onDraftUpdates, selectedCategory, selectedContentId]);

  return {
    applyBootstrapCurriculumState,
    applyCurriculumSelectionState,
    applyImportedLearningArchiveState,
    categories,
    categoryGroups,
    categoryTree,
    contents,
    contentsLoading,
    curriculumDocument,
    referenceLoading,
    restoreCurriculumRouteState,
    selectCurriculumCategoryState,
    selectCurriculumContentState,
    selectCurriculumLessonState,
    selectedCategory,
    selectedContentId,
    selectedCurriculumBlockId,
    setSelectedCurriculumBlockId,
  };
}
