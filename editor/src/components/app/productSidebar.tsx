import {
  ChevronRight,
  Clock3,
  FileCode2,
  GraduationCap,
  Languages,
  Loader2,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Sun,
  TerminalSquare,
  Workflow,
} from "lucide-react";
import { useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { categoryTitle } from "@/lib/fallbackData";
import { useLocale } from "@/lib/localeContext";
import type { AutomationSection, SurfaceMode, ThemeMode } from "@/lib/surfaceModel";
import type { CurriculumCategory, CurriculumContentSummary } from "@/types";

type ProductSidebarProps = {
  categories: CurriculumCategory[];
  categoryGroups: Record<string, string[]>;
  contentsLoading: boolean;
  contents: CurriculumContentSummary[];
  customCurricula: SidebarCustomCurriculum[];
  query: string;
  referenceLoading: boolean;
  selectedAutomationSection: AutomationSection;
  surface: SurfaceMode;
  selectedCategory: string;
  selectedCustomCurriculumId: string;
  selectedContentId: string;
  themeMode: ThemeMode;
  aiConnecting: boolean;
  onQueryChange: (value: string) => void;
  onConnectProvider: () => void;
  onSelectAutomationSection: (section: AutomationSection) => void;
  onSelectCategory: (key: string) => void;
  onSelectContent: (contentId: string) => void;
  onSelectCustomCurriculum: (id: string) => void;
  onSurfaceChange: (surface: SurfaceMode) => void;
  onToggleTheme: () => void;
};

export type SidebarCustomCurriculum = {
  id: string;
  title: string;
  blockCount: number;
  createdAt: number;
};

export function ProductSidebar({
  categories,
  categoryGroups,
  contentsLoading,
  contents,
  customCurricula,
  query,
  referenceLoading,
  selectedAutomationSection,
  surface,
  selectedCategory,
  selectedCustomCurriculumId,
  selectedContentId,
  themeMode,
  aiConnecting,
  onQueryChange,
  onConnectProvider,
  onSelectAutomationSection,
  onSelectCategory,
  onSelectContent,
  onSelectCustomCurriculum,
  onSurfaceChange,
  onToggleTheme,
}: ProductSidebarProps) {
  const { locale, t, toggleLocale } = useLocale();
  const navItems: Array<{ value: SurfaceMode; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
    { value: "chat", label: t("nav.chat"), Icon: MessageSquare },
    { value: "editor", label: t("nav.editor"), Icon: FileCode2 },
    { value: "curriculum", label: t("nav.curriculum"), Icon: GraduationCap },
    { value: "automation", label: t("nav.automation"), Icon: Workflow },
  ];
  const themeLabel = themeMode === "dark" ? t("sidebar.lightMode") : t("sidebar.darkMode");
  const localeLabel = locale === "en" ? t("locale.switchToKorean") : t("locale.switchToEnglish");

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-1">
          <SidebarMenu className="min-w-0 flex-1">
            <SidebarMenuItem>
              <SidebarMenuButton className="h-10 px-2 text-[13px] group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-1!" size="lg" tooltip="Codaro">
                <img alt="" className="size-8 rounded-md object-contain group-data-[collapsible=icon]:size-8!" src="/brand/avatar-small.png" />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Codaro</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <button
            aria-label={t("provider.openSettings.title")}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
            disabled={aiConnecting}
            title={t("provider.openSettings.title")}
            type="button"
            onClick={onConnectProvider}
          >
            {aiConnecting ? <Loader2 className="size-4 animate-spin" /> : <Settings className="size-4" />}
          </button>
          <button
            aria-label={themeLabel}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
            title={themeLabel}
            type="button"
            onClick={onToggleTheme}
          >
            {themeMode === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            aria-label={localeLabel}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
            title={localeLabel}
            type="button"
            onClick={toggleLocale}
          >
            <Languages className="size-4" />
            <span className="sr-only">{localeLabel}</span>
          </button>
        </div>

        {surface === "curriculum" ? (
          <div className="relative group-data-[collapsible=icon]:hidden">
            <Search className="pointer-events-none absolute left-2 top-2 size-3.5 text-muted-foreground" />
            <SidebarInput
              aria-label={t("sidebar.curriculumSearch")}
              className="h-7 pl-7 text-[13px]"
              placeholder={t("sidebar.curriculumSearch")}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </div>
        ) : null}
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        <ScrollArea className="min-h-0 flex-1">
          <SidebarGroup className="py-0.5">
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ Icon, label, value }) => (
                  <SidebarMenuItem key={value}>
                    <SidebarMenuButton
                      className="h-8 px-2 text-[13px] [&>svg]:size-3.5"
                      isActive={surface === value}
                      tooltip={label}
                      onClick={() => onSurfaceChange(value)}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {surface === "curriculum" ? (
            <div className="group-data-[collapsible=icon]:hidden">
              <CurriculumTree
                categories={categories}
                categoryGroups={categoryGroups}
                contents={contents}
                contentsLoading={contentsLoading}
                customCurricula={customCurricula}
                referenceLoading={referenceLoading}
                query={query}
                selectedCategory={selectedCategory}
                selectedCustomCurriculumId={selectedCustomCurriculumId}
                selectedContentId={selectedContentId}
                text={{
                  codaroCurriculum: t("sidebar.codaroCurriculum"),
                  curriculumEmpty: t("sidebar.curriculumEmpty"),
                  loading: t("sidebar.curriculumLoading"),
                  myCurriculum: t("sidebar.myCurriculum"),
                  other: locale === "en" ? "Other" : "기타",
                }}
                onSelectCategory={onSelectCategory}
                onSelectContent={onSelectContent}
                onSelectCustomCurriculum={onSelectCustomCurriculum}
              />
            </div>
          ) : null}

          {surface === "automation" ? (
            <AutomationTree
              selectedSection={selectedAutomationSection}
              text={{
                automation: t("sidebar.automation"),
                codaro: t("automation.codaro.title"),
                custom: t("automation.custom.title"),
                tasks: t("automation.tasks.title"),
              }}
              onSelectSection={onSelectAutomationSection}
            />
          ) : null}
        </ScrollArea>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

function CurriculumTree({
  categories,
  categoryGroups,
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
}: {
  categories: CurriculumCategory[];
  categoryGroups: Record<string, string[]>;
  contents: CurriculumContentSummary[];
  contentsLoading: boolean;
  customCurricula: SidebarCustomCurriculum[];
  query: string;
  referenceLoading: boolean;
  selectedCategory: string;
  selectedCustomCurriculumId: string;
  selectedContentId: string;
  onSelectCategory: (key: string) => void;
  onSelectContent: (contentId: string) => void;
  onSelectCustomCurriculum: (id: string) => void;
  text: {
    codaroCurriculum: string;
    curriculumEmpty: string;
    loading: string;
    myCurriculum: string;
    other: string;
  };
}) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const customItems = customCurricula.filter((item) => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return true;
    return item.title.toLowerCase().includes(trimmed);
  });
  const groupedCategories = buildSidebarCategoryGroups(categories, categoryGroups, text.other);

  return (
    <>
      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel className="h-6 px-2 text-[11px]">{text.codaroCurriculum}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {groupedCategories.map((group) => {
              const hasSelectedCategory = group.categories.some((category) => category.key === selectedCategory);
              const isExpanded = Boolean(query.trim()) || hasSelectedCategory || expandedGroups[group.name] === true;
              return (
                <SidebarMenuItem key={group.name}>
                  <SidebarMenuButton
                    className="h-7 px-2 text-[13px] [&>svg]:size-3.5"
                    isActive={hasSelectedCategory}
                    tooltip={group.name}
                    onClick={() => setExpandedGroups((current) => ({ ...current, [group.name]: !isExpanded }))}
                  >
                    <ChevronRight className={isExpanded ? "rotate-90 transition-transform" : "transition-transform"} />
                    <span>{group.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{group.count}</SidebarMenuBadge>
                  {isExpanded ? (
                    <SidebarMenuSub>
                      {group.categories.map((category) => {
                        const isSelectedCategory = category.key === selectedCategory;
                        const categoryLabel = category.name || categoryTitle(category.key);
                        return (
                          <SidebarMenuSubItem key={category.key}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSelectedCategory}
                              size="sm"
                            >
                              <button
                                className="text-[12px]"
                                type="button"
                                onClick={() => onSelectCategory(category.key)}
                              >
                                <ChevronRight className={isSelectedCategory ? "rotate-90 transition-transform" : "transition-transform"} />
                                <span className="truncate">{categoryLabel}</span>
                                <span className="ml-auto text-[11px] text-sidebar-foreground/55">{category.count}</span>
                              </button>
                            </SidebarMenuSubButton>
                            {isSelectedCategory ? (
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
                      })}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              );
            })}
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
                  onClick={() => onSelectCustomCurriculum(item.id)}
                >
                  <GraduationCap />
                  <span>{item.title}</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>{item.blockCount}</SidebarMenuBadge>
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

function buildSidebarCategoryGroups(
  categories: CurriculumCategory[],
  categoryGroups: Record<string, string[]>,
  fallbackGroupName: string,
) {
  const categoriesByKey = new Map(categories.map((category) => [category.key, category]));
  const groupedKeys = new Set<string>();
  const groups = Object.entries(categoryGroups).map(([name, keys]) => {
    const groupCategories = keys
      .map((key) => categoriesByKey.get(key))
      .filter((category): category is CurriculumCategory => Boolean(category));
    groupCategories.forEach((category) => groupedKeys.add(category.key));
    return {
      name,
      categories: groupCategories,
      count: groupCategories.reduce((total, category) => total + category.count, 0),
    };
  }).filter((group) => group.categories.length);
  const remaining = categories.filter((category) => !groupedKeys.has(category.key));
  if (remaining.length) {
    groups.push({
      name: fallbackGroupName,
      categories: remaining,
      count: remaining.reduce((total, category) => total + category.count, 0),
    });
  }
  return groups;
}

function AutomationTree({
  selectedSection,
  text,
  onSelectSection,
}: {
  selectedSection: AutomationSection;
  text: {
    automation: string;
    codaro: string;
    custom: string;
    tasks: string;
  };
  onSelectSection: (section: AutomationSection) => void;
}) {
  const items: Array<{ section: AutomationSection; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
    { section: "codaro", label: text.codaro, Icon: Workflow },
    { section: "custom", label: text.custom, Icon: TerminalSquare },
    { section: "tasks", label: text.tasks, Icon: Clock3 },
  ];

  return (
    <SidebarGroup className="py-0.5">
      <SidebarGroupLabel className="h-6 px-2 text-[11px]">{text.automation}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ Icon, label, section }) => (
            <SidebarMenuItem key={section}>
              <SidebarMenuButton
                className="h-7 px-2 text-[13px] [&>svg]:size-3.5"
                isActive={selectedSection === section}
                tooltip={label}
                onClick={() => onSelectSection(section)}
              >
                <Icon />
                <span>{label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
