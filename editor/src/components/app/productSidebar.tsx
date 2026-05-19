import {
  ChevronRight,
  Clock3,
  FileCode2,
  GraduationCap,
  Loader2,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Sun,
  TerminalSquare,
  Workflow,
} from "lucide-react";

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
import type { AutomationSection, SurfaceMode, ThemeMode } from "@/lib/surfaceModel";
import type { CurriculumCategory, CurriculumContentSummary } from "@/types";

type ProductSidebarProps = {
  categories: CurriculumCategory[];
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

const navItems: Array<{ value: SurfaceMode; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
  { value: "chat", label: "채팅", Icon: MessageSquare },
  { value: "editor", label: "에디터", Icon: FileCode2 },
  { value: "curriculum", label: "커리큘럼", Icon: GraduationCap },
  { value: "automation", label: "자동화", Icon: Workflow },
];

export function ProductSidebar({
  categories,
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
            aria-label="Provider 설정"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
            disabled={aiConnecting}
            title="Provider 설정"
            type="button"
            onClick={onConnectProvider}
          >
            {aiConnecting ? <Loader2 className="size-4 animate-spin" /> : <Settings className="size-4" />}
          </button>
          <button
            aria-label={themeMode === "dark" ? "라이트 모드" : "다크 모드"}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
            title={themeMode === "dark" ? "라이트 모드" : "다크 모드"}
            type="button"
            onClick={onToggleTheme}
          >
            {themeMode === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>

        {surface === "curriculum" ? (
          <div className="relative group-data-[collapsible=icon]:hidden">
            <Search className="pointer-events-none absolute left-2 top-2 size-3.5 text-muted-foreground" />
            <SidebarInput
              aria-label="커리큘럼 검색"
              className="h-7 pl-7 text-[13px]"
              placeholder="커리큘럼 검색"
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
                contents={contents}
                contentsLoading={contentsLoading}
                customCurricula={customCurricula}
                referenceLoading={referenceLoading}
                query={query}
                selectedCategory={selectedCategory}
                selectedCustomCurriculumId={selectedCustomCurriculumId}
                selectedContentId={selectedContentId}
                onSelectCategory={onSelectCategory}
                onSelectContent={onSelectContent}
                onSelectCustomCurriculum={onSelectCustomCurriculum}
              />
            </div>
          ) : null}

          {surface === "automation" ? (
            <AutomationTree
              selectedSection={selectedAutomationSection}
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
}: {
  categories: CurriculumCategory[];
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
}) {
  const customItems = customCurricula.filter((item) => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return true;
    return item.title.toLowerCase().includes(trimmed);
  });

  return (
    <>
      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel className="h-6 px-2 text-[11px]">Codaro 커리큘럼</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {categories.map((category) => {
              const isSelectedCategory = category.key === selectedCategory;
              const categoryLabel = category.name || categoryTitle(category.key);
              return (
                <SidebarMenuItem key={category.key}>
                  <SidebarMenuButton
                    className="h-7 px-2 text-[13px] [&>svg]:size-3.5"
                    isActive={isSelectedCategory}
                    tooltip={categoryLabel}
                    onClick={() => onSelectCategory(category.key)}
                  >
                    <ChevronRight className={isSelectedCategory ? "rotate-90 transition-transform" : "transition-transform"} />
                    <span>{categoryLabel}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{category.count}</SidebarMenuBadge>
                  {isSelectedCategory ? (
                    <SidebarMenuSub>
                      {contentsLoading ? (
                        <SidebarMenuSubItem>
                          <div className="flex h-7 items-center gap-2 px-2 text-xs text-muted-foreground">
                            <Loader2 className="size-3 animate-spin" />
                            불러오는 중
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
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel className="h-6 px-2 text-[11px]">나만의 커리큘럼</SidebarGroupLabel>
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
                  채팅에서 만든 커리큘럼이 여기에 쌓입니다.
                </div>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

function AutomationTree({
  selectedSection,
  onSelectSection,
}: {
  selectedSection: AutomationSection;
  onSelectSection: (section: AutomationSection) => void;
}) {
  const items: Array<{ section: AutomationSection; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
    { section: "codaro", label: "Codaro 자동화", Icon: Workflow },
    { section: "custom", label: "나만의 자동화", Icon: TerminalSquare },
    { section: "tasks", label: "태스크", Icon: Clock3 },
  ];

  return (
    <SidebarGroup className="py-0.5">
      <SidebarGroupLabel className="h-6 px-2 text-[11px]">자동화</SidebarGroupLabel>
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
