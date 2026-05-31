import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

type ExpansionMap = Record<string, boolean>;

const categoriesKey = "codaro.sidebar.categories";
const treeNodesKey = "codaro.sidebar.treeNodes";

function readStored(storageKey: string): ExpansionMap {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as ExpansionMap) : {};
  } catch {
    // localStorage may be unavailable in restricted webviews.
    return {};
  }
}

function usePersistentExpansion(storageKey: string): [ExpansionMap, Dispatch<SetStateAction<ExpansionMap>>] {
  const [value, setValue] = useState<ExpansionMap>(() => readStored(storageKey));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // localStorage may be unavailable in restricted webviews.
    }
  }, [storageKey, value]);

  return [value, setValue];
}

// 사이드바 커리큘럼 트리의 펼침 상태를 localStorage 에 보관한다.
// 서피스 전환으로 CurriculumTree 가 unmount/remount 돼도 펼쳤던 카테고리가
// 초기화되지 않아 네비게이션 시 사이드바가 버벅이지 않는다.
export function useSidebarExpansionState() {
  const [expandedCategories, setExpandedCategories] = usePersistentExpansion(categoriesKey);
  const [expandedTreeNodes, setExpandedTreeNodes] = usePersistentExpansion(treeNodesKey);
  return { expandedCategories, setExpandedCategories, expandedTreeNodes, setExpandedTreeNodes };
}
