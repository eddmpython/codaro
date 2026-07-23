import {
  Languages,
  Loader2,
  Monitor,
  Moon,
  Search,
  Settings,
  SlidersHorizontal,
  Sun,
  TerminalSquare,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";

import { AutomationSidebarTree } from "@/components/app/automationSidebarTree";
import { CurriculumSidebarTree } from "@/components/app/curriculumSidebarTree";
import { ProductFlowNav } from "@/components/app/productFlowNav";
import { LearningArchiveMenu } from "@/components/curriculum/curriculumOverview";
import { Button } from "@/components/ui/button";
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
import type { LearningArchiveMaterialization } from "@/lib/learningArchive";
import { useLocale } from "@/lib/localeContext";
import { resolvePublicAsset } from "@/lib/publicAsset";
import { cn } from "@/lib/utils";
import { ACCENT_COLORS, type AccentColor, type AutomationSection, type SurfaceMode, type ThemeMode } from "@/lib/surfaceModel";
import type { CodaroDocument, CurriculumCategory, CurriculumCategoryTreeNode, CurriculumContentSummary } from "@/types";
import { accentSwatches } from "@/styles/generated/codaroTheme";

type ProductSidebarProps = {
  categories: CurriculumCategory[];
  categoryGroups: Record<string, string[]>;
  categoryTree: CurriculumCategoryTreeNode[];
  contentsLoading: boolean;
  contents: CurriculumContentSummary[];
  customCurricula: SidebarCustomCurriculum[];
  learningDocument: CodaroDocument | null;
  learningDrafts: Record<string, string>;
  query: string;
  referenceLoading: boolean;
  runtimeTier: "local" | "web";
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
  onImportLearningArchive: (archive: LearningArchiveMaterialization) => Promise<void> | void;
  onSurfaceChange: (surface: SurfaceMode) => void;
  onToggleTheme: () => void;
  onSelectAccentColor: (value: AccentColor) => void;
  terminalOpen: boolean;
  onToggleTerminal: () => void;
};

const ACCENT_LABELS: Record<AccentColor, string> = {
  plum: "플럼",
  blue: "블루",
  teal: "틸",
};

export function ProductSidebar({
  categories,
  categoryGroups,
  categoryTree,
  contentsLoading,
  contents,
  customCurricula,
  learningDocument,
  learningDrafts,
  query,
  referenceLoading,
  runtimeTier,
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
  onImportLearningArchive,
  onSurfaceChange,
  onToggleTheme,
  onSelectAccentColor,
  terminalOpen,
  onToggleTerminal,
}: ProductSidebarProps) {
  const { locale, t, toggleLocale } = useLocale();
  const learningMode = surface === "curriculum";
  const [deleteTarget, setDeleteTarget] = useState<SidebarCustomCurriculum | null>(null);
  const learningLessonRef = selectedCategory && selectedContentId
    ? `${selectedCategory}/${selectedContentId}`
    : "";
  const themeLabel = themeMode === "system" ? "시스템 테마" : themeMode === "dark" ? "다크 테마" : "라이트 테마";
  const localeLabel = locale === "en" ? t("locale.switchToKorean") : t("locale.switchToEnglish");

  useEffect(() => {
    if (learningMode) setDeleteTarget(null);
  }, [learningMode]);

  return (
    <Sidebar
      collapsible="icon"
      data-learning-focus-mode={learningMode ? "true" : "false"}
      variant="sidebar"
    >
      <SidebarHeader>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <SidebarMenu className="min-w-0 flex-1">
            <SidebarMenuItem>
              <button
                aria-label={runtimeTier === "local" ? "Codaro 홈으로 이동" : "Codaro 도구로 이동"}
                className="flex h-10 w-full min-w-0 items-center gap-2 rounded-md px-2 text-left text-[13px] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-1!"
                data-product-brand="escape"
                title={runtimeTier === "local" ? "Codaro 홈으로 이동" : "Codaro 도구로 이동"}
                type="button"
                onClick={() => onSurfaceChange(runtimeTier === "local" ? "home" : "editor")}
              >
                <img
                  alt=""
                  className="size-8 rounded-md object-contain group-data-[collapsible=icon]:size-8!"
                  src={resolvePublicAsset("/brand/avatar-small.png")}
                />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Codaro</span>
                </div>
              </button>
            </SidebarMenuItem>
          </SidebarMenu>
          {learningMode ? null : (
            <button
              aria-label={t("provider.openSettings.title")}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
              data-product-provider-settings="true"
              disabled={aiConnecting}
              title={t("provider.openSettings.title")}
              type="button"
              onClick={onConnectProvider}
            >
              {aiConnecting ? <Loader2 className="size-4 animate-spin" /> : <Settings className="size-4" />}
            </button>
          )}
          {learningMode ? null : (
          <Popover>
            <PopoverTrigger
              aria-label="제품 설정"
              className={cn(
                "size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden",
                learningMode ? "hidden" : "flex",
              )}
              data-product-appearance-settings="true"
              title="제품 설정"
            >
              <SlidersHorizontal className="size-4" />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-64 p-3 data-[state=closed]:hidden"
              data-accent-palette="true"
              forceMount
            >
              <div className="text-xs font-semibold text-foreground">제품 설정</div>
              <div className="mt-3 text-xs font-medium text-muted-foreground">화면</div>
              <div className="mt-2 grid gap-1 border-b pb-2">
                <button
                  className="flex h-8 items-center gap-2 rounded-md px-2 text-left text-xs text-foreground hover:bg-muted"
                  type="button"
                  onClick={onToggleTheme}
                >
                  {themeMode === "system" ? <Monitor className="size-3.5" /> : themeMode === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                  <span>{themeLabel}</span>
                </button>
                <button
                  className="flex h-8 items-center gap-2 rounded-md px-2 text-left text-xs text-foreground hover:bg-muted"
                  type="button"
                  onClick={toggleLocale}
                >
                  <Languages className="size-3.5" />
                  <span>{localeLabel}</span>
                </button>
              </div>
              <div className="mt-3 text-xs font-medium text-muted-foreground">강조 색상</div>
              <div className="mt-2 flex items-center gap-2">
                {ACCENT_COLORS.map((value) => {
                  const label = ACCENT_LABELS[value];
                  return (
                    <button
                      aria-label={label}
                      className={cn(
                        "size-6 rounded-full border border-border transition-transform hover:scale-110",
                        accentColor === value && "ring-2 ring-ring ring-offset-2 ring-offset-popover",
                      )}
                      data-accent-swatch={value}
                      key={value}
                      style={{ backgroundColor: accentSwatches[value] }}
                      title={label}
                      type="button"
                      onClick={() => onSelectAccentColor(value)}
                    />
                  );
                })}
              </div>
              <div className="mt-4 border-t border-border pt-3" data-product-learning-data-settings="true">
                <div className="mb-2 text-xs font-semibold text-foreground">학습 데이터</div>
                <LearningArchiveMenu
                  document={learningDocument ?? undefined}
                  drafts={learningDrafts}
                  lessonRef={learningLessonRef}
                  localRuntime={runtimeTier === "local"}
                  onImportArchive={onImportLearningArchive}
                />
                {customCurricula.length ? (
                  <div className="mt-3 border-t border-border pt-3" data-product-custom-curriculum-settings="true">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">나만의 학습과정</div>
                    <div className="divide-y divide-border">
                      {customCurricula.map((item) => (
                        <div className="flex min-h-9 items-center gap-2" key={item.id}>
                          <span className="min-w-0 flex-1 truncate text-xs text-foreground">{item.title}</span>
                          <button
                            aria-label={`${item.title} 삭제`}
                            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            title="삭제"
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </PopoverContent>
          </Popover>
          )}
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
            {learningMode ? null : (
              <ProductFlowNav runtimeTier={runtimeTier} surface={surface} onSurfaceChange={onSurfaceChange} />
            )}

            {learningMode ? null : (
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
            )}

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

      {learningMode ? null : (
        <CustomCurriculumDeleteDialog
          item={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (!deleteTarget) return;
            onDeleteCustomCurriculum(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
      <SidebarRail />
    </Sidebar>
  );
}

function CustomCurriculumDeleteDialog({
  item,
  onCancel,
  onConfirm,
}: {
  item: SidebarCustomCurriculum | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!item) return null;

  return (
    <Dialog.Root open onOpenChange={(open) => {
      if (!open) onCancel();
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/55 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%_-_2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-md border bg-popover p-4 text-popover-foreground shadow-lg">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <Trash2 className="size-4" />
            </span>
            <div className="min-w-0">
              <Dialog.Title className="text-sm font-semibold">나만의 커리큘럼 삭제</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-6 text-muted-foreground">
                {item.title} 커리큘럼을 삭제할까요? 이 작업은 되돌릴 수 없습니다.
              </Dialog.Description>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button size="sm" type="button" variant="outline">
                취소
              </Button>
            </Dialog.Close>
            <Button size="sm" type="button" variant="destructive" onClick={onConfirm}>
              삭제
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
