import {
  ChevronRight,
  GraduationCap,
  Home,
  Loader2,
} from "lucide-react";
import { useMemo, type Dispatch, type SetStateAction } from "react";

import { useSidebarExpansionState } from "@/hooks/useSidebarExpansionState";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { categoryTitle } from "@/lib/fallbackData";
import type { SidebarCustomCurriculum } from "@/lib/customCurricula";
import type { CurriculumCategory, CurriculumCategoryTreeNode, CurriculumContentSummary } from "@/types";

type CurriculumSidebarTreeProps = {
  categories: CurriculumCategory[];
  categoryGroups: Record<string, string[]>;
  categoryTree: CurriculumCategoryTreeNode[];
  contents: CurriculumContentSummary[];
  contentsLoading: boolean;
  customCurricula: SidebarCustomCurriculum[];
  query: string;
  referenceLoading: boolean;
  selectedCategory: string;
  selectedCustomCurriculumId: string;
  selectedContentId: string;
  text: {
    codaroCurriculum: string;
    curriculumEmpty: string;
    curriculumHome: string;
    loading: string;
    myCurriculum: string;
    other: string;
  };
  onSelectCategory: (key: string) => void;
  onSelectContent: (contentId: string) => void;
  onSelectCustomCurriculum: (id: string) => void;
};

export function CurriculumSidebarTree({
  categories,
  categoryGroups,
  categoryTree,
  contents,
  contentsLoading,
  customCurricula,
  query,
  referenceLoading,
  selectedCategory,
  selectedCustomCurriculumId,
  selectedContentId,
  onSelectCategory,
  onSelectContent,
  onSelectCustomCurriculum,
  text,
}: CurriculumSidebarTreeProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { expandedCategories, setExpandedCategories, expandedTreeNodes, setExpandedTreeNodes } = useSidebarExpansionState();
  const hasQuery = Boolean(query.trim());
  const customItems = customCurricula.filter((item) => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return true;
    return item.title.toLowerCase().includes(trimmed);
  });
  const curriculumTree = useMemo(
    () => buildSidebarCurriculumTree(categories, categoryGroups, categoryTree, text.other),
    [categories, categoryGroups, categoryTree, text.other],
  );
  const navigateToContent = (contentId: string) => {
    onSelectContent(contentId);
    if (isMobile) setOpenMobile(false);
  };
  const navigateToCustomCurriculum = (id: string) => {
    onSelectCustomCurriculum(id);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <>
      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel className="h-6 px-2 text-[11px]">{text.codaroCurriculum}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="h-7 px-2 text-[13px] [&>svg]:size-3.5"
                data-curriculum-home-entry="true"
                isActive={!selectedContentId}
                tooltip={text.curriculumHome}
                onClick={() => navigateToContent("")}
              >
                <Home />
                <span>{text.curriculumHome}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {curriculumTree.map((node) => (
              <CurriculumTreeNodeItem
                contents={contents}
                contentsLoading={contentsLoading}
                expandedCategories={expandedCategories}
                expandedTreeNodes={expandedTreeNodes}
                hasQuery={hasQuery}
                key={node.id}
                node={node}
                referenceLoading={referenceLoading}
                selectedCategory={selectedCategory}
                selectedContentId={selectedContentId}
                text={text}
                onSelectCategory={onSelectCategory}
                onSelectContent={navigateToContent}
                onToggleCategory={setExpandedCategories}
                onToggleTreeNode={setExpandedTreeNodes}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel className="h-6 px-2 text-[11px]">{text.myCurriculum}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {customItems.length ? customItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  className="h-7 px-2 text-[13px] [&>svg]:size-3.5"
                  isActive={item.id === selectedCustomCurriculumId}
                  tooltip={item.title}
                  onClick={() => navigateToCustomCurriculum(item.id)}
                >
                  <GraduationCap />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )) : (
              <SidebarMenuItem>
                <div className="px-2 py-2 text-xs leading-5 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                  {text.curriculumEmpty}
                </div>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

type SidebarCurriculumTreeNode = {
  id: string;
  name: string;
  categories: CurriculumCategory[];
  children: SidebarCurriculumTreeNode[];
  count: number;
};

function CurriculumTreeNodeItem({
  contents,
  contentsLoading,
  expandedCategories,
  expandedTreeNodes,
  hasQuery,
  node,
  referenceLoading,
  selectedCategory,
  selectedContentId,
  text,
  onSelectCategory,
  onSelectContent,
  onToggleCategory,
  onToggleTreeNode,
  depth = 0,
}: {
  contents: CurriculumContentSummary[];
  contentsLoading: boolean;
  expandedCategories: Record<string, boolean>;
  expandedTreeNodes: Record<string, boolean>;
  hasQuery: boolean;
  node: SidebarCurriculumTreeNode;
  referenceLoading: boolean;
  selectedCategory: string;
  selectedContentId: string;
  text: {
    loading: string;
  };
  onSelectCategory: (key: string) => void;
  onSelectContent: (contentId: string) => void;
  onToggleCategory: Dispatch<SetStateAction<Record<string, boolean>>>;
  onToggleTreeNode: Dispatch<SetStateAction<Record<string, boolean>>>;
  depth?: number;
}) {
  const hasSelectedCategory = Boolean(selectedContentId) && nodeHasCategory(node, selectedCategory);
  const isExpanded = hasQuery || (expandedTreeNodes[node.id] ?? hasSelectedCategory);
  const childContent = isExpanded ? (
    <SidebarMenuSub className={depth > 0 ? "ml-2" : undefined}>
      {node.children.map((child) => (
        <CurriculumTreeNodeItem
          contents={contents}
          contentsLoading={contentsLoading}
          depth={depth + 1}
          expandedCategories={expandedCategories}
          expandedTreeNodes={expandedTreeNodes}
          hasQuery={hasQuery}
          key={child.id}
          node={child}
          referenceLoading={referenceLoading}
          selectedCategory={selectedCategory}
          selectedContentId={selectedContentId}
          text={text}
          onSelectCategory={onSelectCategory}
          onSelectContent={onSelectContent}
          onToggleCategory={onToggleCategory}
          onToggleTreeNode={onToggleTreeNode}
        />
      ))}
      {node.categories.map((category) => (
        <CurriculumCategoryItem
          category={category}
          contents={contents}
          contentsLoading={contentsLoading}
          expandedCategories={expandedCategories}
          hasQuery={hasQuery}
          key={category.key}
          referenceLoading={referenceLoading}
          selectedCategory={selectedCategory}
          selectedContentId={selectedContentId}
          text={text}
          onSelectCategory={onSelectCategory}
          onSelectContent={onSelectContent}
          onToggleCategory={onToggleCategory}
        />
      ))}
    </SidebarMenuSub>
  ) : null;

  if (depth === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          aria-expanded={isExpanded}
          className="h-7 px-2 pr-10 text-[13px] [&>svg]:size-3.5"
          isActive={hasSelectedCategory}
          tooltip={node.name}
          onClick={() => onToggleTreeNode((current) => ({ ...current, [node.id]: !isExpanded }))}
        >
          <ChevronRight className={isExpanded ? "rotate-90 transition-transform" : "transition-transform"} />
          <span>{node.name}</span>
        </SidebarMenuButton>
        {selectedContentId ? <SidebarMenuBadge className="right-4">{node.count}</SidebarMenuBadge> : null}
        {childContent}
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={hasSelectedCategory} size="sm">
        <button
          aria-expanded={isExpanded}
          className="text-[12px]"
          type="button"
          onClick={() => onToggleTreeNode((current) => ({ ...current, [node.id]: !isExpanded }))}
        >
          <ChevronRight className={isExpanded ? "rotate-90 transition-transform" : "transition-transform"} />
          <span className="truncate">{node.name}</span>
          {selectedContentId ? <span className="ml-auto text-[11px] text-sidebar-foreground/55">{node.count}</span> : null}
        </button>
      </SidebarMenuSubButton>
      {childContent}
    </SidebarMenuSubItem>
  );
}

function CurriculumCategoryItem({
  category,
  contents,
  contentsLoading,
  expandedCategories,
  hasQuery,
  referenceLoading,
  selectedCategory,
  selectedContentId,
  text,
  onSelectCategory,
  onSelectContent,
  onToggleCategory,
}: {
  category: CurriculumCategory;
  contents: CurriculumContentSummary[];
  contentsLoading: boolean;
  expandedCategories: Record<string, boolean>;
  hasQuery: boolean;
  referenceLoading: boolean;
  selectedCategory: string;
  selectedContentId: string;
  text: {
    loading: string;
  };
  onSelectCategory: (key: string) => void;
  onSelectContent: (contentId: string) => void;
  onToggleCategory: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const isSelectedCategory = Boolean(selectedContentId) && category.key === selectedCategory;
  const isCategoryExpanded = hasQuery || (expandedCategories[category.key] ?? isSelectedCategory);
  const isCategoryOpen = isSelectedCategory && isCategoryExpanded;
  const categoryLabel = category.name || categoryTitle(category.key);

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        isActive={isSelectedCategory}
        size="sm"
      >
        <button
          aria-expanded={isCategoryOpen}
          className="text-[12px]"
          data-curriculum-category={category.key}
          type="button"
          onClick={() => {
            if (isSelectedCategory) {
              onToggleCategory((current) => ({
                ...current,
                [category.key]: !isCategoryExpanded,
              }));
              return;
            }
            onToggleCategory((current) => ({ ...current, [category.key]: true }));
            onSelectCategory(category.key);
          }}
        >
          <ChevronRight className={isCategoryOpen ? "rotate-90 transition-transform" : "transition-transform"} />
          <span className="truncate">{categoryLabel}</span>
          {selectedContentId ? <span className="ml-auto text-[11px] text-sidebar-foreground/55">{category.count}</span> : null}
        </button>
      </SidebarMenuSubButton>
      {isCategoryOpen ? (
        <SidebarMenuSub className="ml-2">
          {contentsLoading ? (
            <SidebarMenuSubItem>
              <div className="flex h-7 items-center gap-2 px-2 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                {text.loading}
              </div>
            </SidebarMenuSubItem>
          ) : contents.map((content) => (
            <SidebarMenuSubItem key={content.contentId}>
              <SidebarMenuSubButton
                asChild
                isActive={content.contentId === selectedContentId}
                size="sm"
              >
                <button
                  className="text-[12px]"
                  data-curriculum-content-id={content.contentId}
                  type="button"
                  onClick={() => onSelectContent(content.contentId)}
                >
                  <span className="truncate">{content.title}</span>
                  {referenceLoading && content.contentId === selectedContentId ? (
                    <Loader2 className="ml-auto size-3 animate-spin" />
                  ) : null}
                </button>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuSubItem>
  );
}

function buildSidebarCurriculumTree(
  categories: CurriculumCategory[],
  categoryGroups: Record<string, string[]>,
  categoryTree: CurriculumCategoryTreeNode[],
  fallbackGroupName: string,
) {
  const categoriesByKey = new Map(categories.map((category) => [category.key, category]));
  const groupedKeys = new Set<string>();
  const sourceTree = categoryTree.length ? categoryTree : treeFromGroups(categoryGroups);
  const tree = sourceTree
    .map((node) => buildSidebarTreeNode(node, categoriesByKey, groupedKeys))
    .filter((node): node is SidebarCurriculumTreeNode => Boolean(node));
  const remaining = categories.filter((category) => !groupedKeys.has(category.key));
  if (remaining.length) {
    tree.push({
      id: "fallback-curriculum-group",
      name: fallbackGroupName,
      categories: remaining,
      children: [],
      count: remaining.reduce((total, category) => total + category.count, 0),
    });
  }
  return tree;
}

function treeFromGroups(categoryGroups: Record<string, string[]>): CurriculumCategoryTreeNode[] {
  return Object.entries(categoryGroups).map(([name, categories]) => ({
    id: `group-${name}`,
    name,
    categories,
  }));
}

function buildSidebarTreeNode(
  node: CurriculumCategoryTreeNode,
  categoriesByKey: Map<string, CurriculumCategory>,
  groupedKeys: Set<string>,
): SidebarCurriculumTreeNode | null {
  const children = (node.children ?? [])
    .map((child) => buildSidebarTreeNode(child, categoriesByKey, groupedKeys))
    .filter((child): child is SidebarCurriculumTreeNode => Boolean(child));
  const directCategories = (node.categories ?? [])
    .map((key) => categoriesByKey.get(key))
    .filter((category): category is CurriculumCategory => Boolean(category))
    .filter((category) => !groupedKeys.has(category.key));
  directCategories.forEach((category) => groupedKeys.add(category.key));
  const count = directCategories.reduce((total, category) => total + category.count, 0)
    + children.reduce((total, child) => total + child.count, 0);
  if (!count && !directCategories.length && !children.length) return null;
  return {
    id: node.id || node.name,
    name: node.name,
    categories: directCategories,
    children,
    count,
  };
}

function nodeHasCategory(node: SidebarCurriculumTreeNode, categoryKey: string): boolean {
  return node.categories.some((category) => category.key === categoryKey)
    || node.children.some((child) => nodeHasCategory(child, categoryKey));
}
