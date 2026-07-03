import {
  Languages,
  Loader2,
  Moon,
  Palette,
  Search,
  Settings,
  Sun,
  TerminalSquare,
} from "lucide-react";

import { AutomationSidebarTree } from "@/components/app/automationSidebarTree";
import { CurriculumSidebarTree } from "@/components/app/curriculumSidebarTree";
import { ProductFlowNav } from "@/components/app/productFlowNav";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { SidebarCustomCurriculum } from "@/lib/customCurricula";
import { useLocale } from "@/lib/localeContext";
import { cn } from "@/lib/utils";
import { ACCENT_COLORS, type AccentColor, type AutomationSection, type SurfaceMode, type ThemeMode } from "@/lib/surfaceModel";
import type { CurriculumCategory, CurriculumCategoryTreeNode, CurriculumContentSummary } from "@/types";

type ProductSidebarProps = {
  categories: CurriculumCategory[];
  categoryGroups: Record<string, string[]>;
  categoryTree: CurriculumCategoryTreeNode[];
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
  accentColor: AccentColor;
  aiConnecting: boolean;
  onQueryChange: (value: string) => void;
  onConnectProvider: () => void;
  onSelectAutomationSection: (section: AutomationSection) => void;
  onSelectCategory: (key: string) => void;
  onSelectContent: (contentId: string) => void;
  onSelectCustomCurriculum: (id: string) => void;
  onDeleteCustomCurriculum: (id: string) => void;
  onSurfaceChange: (surface: SurfaceMode) => void;
  onToggleTheme: () => void;
  onSelectAccentColor: (value: AccentColor) => void;
  terminalOpen: boolean;
  onToggleTerminal: () => void;
};

// 스와치 표시용 고정 색 — index.css html[data-accent] 팔레트의 라이트 값과 동일(oklch).
const ACCENT_SWATCHES: Record<AccentColor, { label: string; swatch: string }> = {
  zinc: { label: "기본", swatch: "oklch(0.552 0.016 285.938)" },
  blue: { label: "블루", swatch: "oklch(0.546 0.245 262.881)" },
  indigo: { label: "인디고", swatch: "oklch(0.511 0.262 276.966)" },
  violet: { label: "바이올렛", swatch: "oklch(0.541 0.281 293.009)" },
  teal: { label: "틸", swatch: "oklch(0.511 0.096 186.391)" },
};

export function ProductSidebar({
  categories,
  categoryGroups,
  categoryTree,
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
  accentColor,
  aiConnecting,
  onQueryChange,
  onConnectProvider,
  onSelectAutomationSection,
  onSelectCategory,
  onSelectContent,
  onSelectCustomCurriculum,
  onDeleteCustomCurriculum,
  onSurfaceChange,
  onToggleTheme,
  onSelectAccentColor,
  terminalOpen,
  onToggleTerminal,
}: ProductSidebarProps) {
  const { locale, t, toggleLocale } = useLocale();
  const themeLabel = themeMode === "dark" ? t("sidebar.lightMode") : t("sidebar.darkMode");
  const localeLabel = locale === "en" ? t("locale.switchToKorean") : t("locale.switchToEnglish");

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-0.5 sm:gap-1">
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
          <Popover>
            <PopoverTrigger
              aria-label="강조 색상 선택"
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
              title="강조 색상"
            >
              <Palette className="size-4" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-3" data-accent-palette="true">
              <div className="text-xs font-medium text-muted-foreground">강조 색상</div>
              <div className="mt-2 flex items-center gap-2">
                {ACCENT_COLORS.map((value) => {
                  const { label, swatch } = ACCENT_SWATCHES[value];
                  return (
                    <button
                      aria-label={label}
                      className={cn(
                        "size-6 rounded-full border border-border transition-transform hover:scale-110",
                        accentColor === value && "ring-2 ring-ring ring-offset-2 ring-offset-popover",
                      )}
                      data-accent-swatch={value}
                      key={value}
                      style={{ backgroundColor: swatch }}
                      title={label}
                      type="button"
                      onClick={() => onSelectAccentColor(value)}
                    />
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
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
          <div className="min-w-0 pr-3 group-data-[collapsible=icon]:pr-0">
            <ProductFlowNav surface={surface} onSurfaceChange={onSurfaceChange} />

            <SidebarGroup className="py-0.5" data-product-nav="utility">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="h-8 px-2 text-[13px] [&>svg]:size-3.5"
                      isActive={terminalOpen}
                      tooltip={t("terminal.title")}
                      onClick={onToggleTerminal}
                    >
                      <TerminalSquare />
                      <span>{t("terminal.title")}</span>
                      <span className="ml-auto rounded-sm border border-sidebar-border bg-sidebar-accent/40 px-1 text-[9px] font-medium uppercase leading-[1.4] tracking-wide text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
                        {t("nav.beta")}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {surface === "curriculum" ? (
              <div className="group-data-[collapsible=icon]:hidden">
                <CurriculumSidebarTree
                  categories={categories}
                  categoryGroups={categoryGroups}
                  categoryTree={categoryTree}
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
                    curriculumHome: t("sidebar.curriculumHome"),
                    loading: t("sidebar.curriculumLoading"),
                    myCurriculum: t("sidebar.myCurriculum"),
                    other: locale === "en" ? "Other" : "기타",
                  }}
                  onSelectCategory={onSelectCategory}
                  onSelectContent={onSelectContent}
                  onSelectCustomCurriculum={onSelectCustomCurriculum}
                  onDeleteCustomCurriculum={onDeleteCustomCurriculum}
                />
              </div>
            ) : null}

            {surface === "automation" ? (
              <AutomationSidebarTree
                selectedSection={selectedAutomationSection}
                text={{
                  automation: t("sidebar.automation"),
                  codaro: t("automation.codaro.title"),
                  custom: t("automation.custom.title"),
                  tasks: t("automation.tasks.title"),
                  browserUse: t("automation.browserUse.title"),
                  computerUse: t("automation.computerUse.title"),
                }}
                onSelectSection={onSelectAutomationSection}
              />
            ) : null}
          </div>
        </ScrollArea>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
