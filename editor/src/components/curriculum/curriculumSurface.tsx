import {
  CheckCircle2,
  Coffee,
  GraduationCap,
  Heart,
  Layers3,
  Lightbulb,
  ListChecks,
  Loader2,
  MessageSquare,
  Play,
  Sparkles,
  Star,
  Target,
  TerminalSquare,
  Trophy,
} from "lucide-react";
import { useMemo, useState, type ComponentType, type ReactNode } from "react";

import { CellAiActions } from "@/components/app/cellAiActions";
import {
  CodePayload,
  ExecutionOutput,
  IconButton,
  LoadingInline,
  PendingNotebookBar,
} from "@/components/app/appPrimitives";
import { AssignmentRoomPanel } from "@/components/classroom/assignmentRoomPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurriculumProgress } from "@/hooks/useCurriculumProgress";
import type { CellAiHelpState } from "@/lib/assistantTypes";
import {
  blockLabel,
  classifyLearningCell,
  executionKindLabel,
  stripBullet,
  stripMarkdown,
  type CellAiAction,
  type LearningCellKind,
} from "@/lib/cellModel";
import { statusLabel } from "@/lib/displayFormat";
import { CODARO_LINKS } from "@/lib/externalLinks";
import { useLocale } from "@/lib/localeContext";
import { cn } from "@/lib/utils";
import { runExerciseCheck } from "@/lib/curriculumCheck";
import { recordLessonMissionComplete } from "@/lib/curriculumCompletion";
import { useWidgetSession } from "@/lib/widgetSession";
import type { BlockConfig, CheckResult, CodaroDocument, ExecutionResult } from "@/types";
import { CheckResultPanel } from "./checkResultPanel";
import { CurriculumDependencyPanel } from "./curriculumDependencyPanel";
import { CurriculumProgressBadge } from "./curriculumProgressBadge";
import { CurriculumMarkdownBody } from "./curriculumMarkdownBody";
import { LessonComments } from "./lessonComments";

type ResultMap = Record<string, ExecutionResult>;

type RenderCodeCellEditor = (args: {
  autoFocus?: boolean;
  block: BlockConfig;
  draft: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onRun: () => void;
}) => ReactNode;

export function CurriculumView({
  apiOnline,
  canRun,
  cellHelpByBlockId,
  contents = [],
  document,
  drafts,
  pendingBlocks,
  referenceLoading,
  renderCodeCellEditor,
  results,
  runningBlockId,
  selectedBlockId,
  selectedCategoryLabel,
  selectedCategory,
  selectedContentLabel,
  selectedContentId,
  onAcceptPendingBlocks,
  onCellAsk,
  onDraftChange,
  onRejectPendingBlocks,
  onRunBlock,
  onOpenTerminalCommand,
  onOpenAssignmentMaterial,
  onSelectBlock,
}: {
  apiOnline: boolean;
  canRun: boolean;
  cellHelpByBlockId: Record<string, CellAiHelpState>;
  contents?: Array<{ contentId: string; title: string }>;
  document: CodaroDocument;
  drafts: Record<string, string>;
  pendingBlocks: BlockConfig[];
  referenceLoading: boolean;
  renderCodeCellEditor: RenderCodeCellEditor;
  results: ResultMap;
  runningBlockId: string | null;
  selectedBlockId: string;
  selectedCategoryLabel: string;
  selectedCategory: string;
  selectedContentLabel: string;
  selectedContentId: string;
  onAcceptPendingBlocks: () => void;
  onCellAsk: (action: CellAiAction, block: BlockConfig, question?: string) => void;
  onDraftChange: (blockId: string, value: string) => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig) => void;
  onOpenTerminalCommand: (command: string) => void;
  onOpenAssignmentMaterial?: (document: CodaroDocument, title: string) => void;
  onSelectBlock: (blockId: string) => void;
}) {
  const curriculumSections = useMemo(() => groupCurriculumSections(document.blocks), [document.blocks]);
  const totalMissions = useMemo(
    () =>
      curriculumSections.sections.filter((section) =>
        Boolean(structuredSectionParts(section).exercise?.guide?.checkConfig?.type),
      ).length,
    [curriculumSections],
  );
  const introBlock = curriculumSections.introBlocks[0] ?? document.blocks.find((block) => block.displayKind === "hero" || block.sourceType === "intro");

  return (
    <ScrollArea className="h-full min-h-0 min-w-0">
      <div className="min-w-0 p-4">
        <div className="mx-auto min-w-0 max-w-5xl space-y-4">
          <LearningOverviewHeader
            apiOnline={apiOnline}
            contents={contents}
            document={document}
            introBlock={introBlock}
            pendingBlocks={pendingBlocks}
            referenceLoading={referenceLoading}
            sections={curriculumSections.sections}
            selectedCategory={selectedCategory}
            selectedCategoryLabel={selectedCategoryLabel}
            selectedContentId={selectedContentId}
            selectedContentLabel={selectedContentLabel}
            onOpenAssignmentMaterial={onOpenAssignmentMaterial}
            onOpenTerminalCommand={onOpenTerminalCommand}
            onAcceptPendingBlocks={onAcceptPendingBlocks}
            onRejectPendingBlocks={onRejectPendingBlocks}
          />

          <div className="space-y-4">
            {curriculumSections.sections.map((section, index) => (
              <CurriculumSectionCard
                canRun={canRun}
                category={selectedCategory}
                cellHelpByBlockId={cellHelpByBlockId}
                contentId={selectedContentId}
                drafts={drafts}
                index={index}
                key={section.id}
                renderCodeCellEditor={renderCodeCellEditor}
                results={results}
                runningBlockId={runningBlockId}
                section={section}
                selectedBlockId={selectedBlockId}
                totalMissions={totalMissions}
                onCellAsk={onCellAsk}
                onDraftChange={onDraftChange}
                onRunBlock={onRunBlock}
                onSelectBlock={onSelectBlock}
              />
            ))}
          </div>

          <LessonComments apiOnline={apiOnline} category={selectedCategory} contentId={selectedContentId} />

          <CurriculumSupportFooter />
        </div>
      </div>
    </ScrollArea>
  );
}

function CurriculumSupportFooter() {
  const { t } = useLocale();
  return (
    <footer
      className="mt-3 rounded-lg border bg-card px-5 py-4 text-card-foreground"
      data-curriculum-support="true"
    >
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Heart className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <div className="text-sm font-semibold">{t("support.title")}</div>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{t("support.message")}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            asChild
            className="h-8 gap-1.5 border-0 bg-accent-brand px-3 text-xs text-accent-brand-foreground hover:bg-accent-brand/90"
            size="sm"
          >
            <a href={CODARO_LINKS.buyMeACoffee} rel="noreferrer noopener" target="_blank">
              <Coffee className="size-3.5" />
              {t("support.buyMeACoffee")}
            </a>
          </Button>
          <Button asChild className="h-8 gap-1.5 px-2.5 text-xs" size="sm" variant="outline">
            <a href={CODARO_LINKS.githubSponsors} rel="noreferrer noopener" target="_blank">
              <Heart className="size-3.5" />
              {t("support.githubSponsors")}
            </a>
          </Button>
          <Button asChild className="h-8 gap-1.5 px-2.5 text-xs" size="sm" variant="outline">
            <a href={CODARO_LINKS.githubRepo} rel="noreferrer noopener" target="_blank">
              <Star className="size-3.5" />
              {t("support.star")}
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}

type CurriculumSectionGroup = {
  id: string;
  title: string;
  subtitle: string;
  contract?: CurriculumSectionContract;
  anchorBlockId: string;
  titleBlock?: BlockConfig;
  blocks: BlockConfig[];
};

type CurriculumSectionContract = Record<string, unknown> & {
  title?: unknown;
  subtitle?: unknown;
  goal?: unknown;
  why?: unknown;
  explanation?: unknown;
  tips?: unknown;
  contractGaps?: unknown;
};


// 레슨 소개 — 시선 3정거장: 제목 → 오늘 배우는 것 → 학습 시작 버튼(화면 유일의 accent 면).
// blueprint 격자·rail·배지 행·워크플로 다이어그램·benefits 그리드는 폐지(스펙 §6).
function LearningOverviewHeader({
  apiOnline,
  contents = [],
  document,
  introBlock,
  pendingBlocks,
  referenceLoading,
  sections,
  selectedCategory,
  selectedCategoryLabel,
  selectedContentId,
  selectedContentLabel,
  onAcceptPendingBlocks,
  onRejectPendingBlocks,
  onOpenAssignmentMaterial,
  onOpenTerminalCommand,
}: {
  apiOnline: boolean;
  contents?: Array<{ contentId: string; title: string }>;
  document: CodaroDocument;
  introBlock?: BlockConfig;
  pendingBlocks: BlockConfig[];
  referenceLoading: boolean;
  sections: CurriculumSectionGroup[];
  selectedCategory: string;
  selectedCategoryLabel: string;
  selectedContentId: string;
  selectedContentLabel: string;
  onAcceptPendingBlocks: () => void;
  onRejectPendingBlocks: () => void;
  onOpenAssignmentMaterial?: (document: CodaroDocument, title: string) => void;
  onOpenTerminalCommand: (command: string) => void;
}) {
  const overview = curriculumOverview(document, introBlock);
  // intro.points가 있으면 그대로, 없으면 sections 제목 파생 목차(≤6행 + "외 N개").
  const learnItems = overview.points.length
    ? overview.points.slice(0, 6).map((point) => ({ label: point, anchorBlockId: "" }))
    : sections.slice(0, 6).map((section) => ({ label: section.title, anchorBlockId: section.anchorBlockId }));
  const overflowCount = overview.points.length ? 0 : Math.max(0, sections.length - 6);
  const firstSectionAnchor = sections[0]?.anchorBlockId ?? "";
  const categoryLabel = selectedCategoryLabel || selectedCategory;
  const contentLabel = selectedContentLabel || selectedContentId;

  return (
    <header
      className="rounded-lg border bg-card text-card-foreground"
      data-learning-overview="true"
      id={introBlock ? cellDomId(introBlock.id) : undefined}
    >
      <div className="px-6 py-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
          <span>{categoryLabel}</span>
          {contentLabel ? <span aria-hidden="true">·</span> : null}
          {contentLabel ? <span>{contentLabel}</span> : null}
          <span className="ml-auto flex items-center gap-2">
            <CurriculumHeaderProgress contents={contents} loading={referenceLoading} />
            {referenceLoading ? <LoadingInline label="레슨 불러오는 중" /> : null}
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground" data-learning-overview-part="title">{overview.title}</h1>
        {overview.direction ? (
          <p className="mt-2 max-w-[60ch] text-md text-foreground" data-learning-overview-part="direction">{overview.direction}</p>
        ) : null}

        {learnItems.length ? (
          <div className="mt-5" data-learning-overview-part="learn-list">
            <div className="text-xs font-medium text-muted-foreground">오늘 배우는 것</div>
            <ul className="mt-2 max-w-[60ch] space-y-1.5">
              {learnItems.map((item, index) => (
                <li className="flex gap-2.5 text-md text-foreground" key={`${item.label}-${index}`}>
                  <span className="mt-[0.65em] size-1 shrink-0 rounded-full bg-foreground/40" />
                  {item.anchorBlockId ? (
                    <button
                      className="text-left hover:underline hover:underline-offset-4"
                      type="button"
                      onClick={() => scrollToCell(item.anchorBlockId)}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </li>
              ))}
              {overflowCount > 0 ? (
                <li className="pl-3.5 text-sm text-muted-foreground">외 {overflowCount}개 섹션</li>
              ) : null}
            </ul>
          </div>
        ) : null}

        {firstSectionAnchor ? (
          <Button
            className="mt-5 h-9 gap-1.5 border-0 bg-accent-brand px-4 text-sm font-medium text-accent-brand-foreground hover:bg-accent-brand/90"
            data-learning-overview-start="true"
            onClick={() => scrollToCell(firstSectionAnchor)}
          >
            <Play className="size-3.5" />
            학습 시작
          </Button>
        ) : null}
      </div>

      <div className="border-t px-6 py-3 empty:hidden">
        <CurriculumDependencyPanel
          apiOnline={apiOnline}
          document={document}
          onOpenTerminalCommand={onOpenTerminalCommand}
        />
        <AssignmentRoomPanel
          category={selectedCategory}
          contentId={selectedContentId}
          document={document}
          onOpenMaterial={onOpenAssignmentMaterial}
        />
      </div>
      <PendingNotebookBar
        pendingBlocks={pendingBlocks}
        onAccept={onAcceptPendingBlocks}
        onReject={onRejectPendingBlocks}
      />
    </header>
  );
}

// 목차/학습 시작 클릭 → 해당 셀로 스크롤(선택 상태 변경 없음).
function scrollToCell(blockId: string) {
  window.requestAnimationFrame(() => {
    const target = window.document.getElementById(cellDomId(blockId));
    if (!target) return;
    const viewport = target.closest("[data-slot='scroll-area-viewport']") as HTMLElement | null;
    if (!viewport) {
      target.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }
    const targetTop = target.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop;
    viewport.scrollTo({ top: Math.max(0, targetTop - 12), behavior: "smooth" });
  });
}

function CurriculumSectionCard({
  canRun,
  category,
  cellHelpByBlockId,
  contentId,
  drafts,
  index,
  renderCodeCellEditor,
  results,
  runningBlockId,
  section,
  selectedBlockId,
  totalMissions,
  onCellAsk,
  onDraftChange,
  onRunBlock,
  onSelectBlock,
}: {
  canRun: boolean;
  category: string;
  cellHelpByBlockId: Record<string, CellAiHelpState>;
  contentId: string;
  drafts: Record<string, string>;
  index: number;
  renderCodeCellEditor: RenderCodeCellEditor;
  results: ResultMap;
  runningBlockId: string | null;
  section: CurriculumSectionGroup;
  selectedBlockId: string;
  totalMissions: number;
  onCellAsk: (action: CellAiAction, block: BlockConfig, question?: string) => void;
  onDraftChange: (blockId: string, value: string) => void;
  onRunBlock: (block: BlockConfig) => void;
  onSelectBlock: (blockId: string) => void;
}) {
  const selected = section.anchorBlockId === selectedBlockId || section.blocks.some((block) => block.id === selectedBlockId);
  const structured = hasStructuredSectionBlocks(section);

  return (
    <section
      aria-label={`${section.title} 학습 섹션`}
      className={cn(
        "overflow-hidden rounded-lg border bg-card text-card-foreground",
        selected && "ring-1 ring-ring/35",
      )}
      data-learning-section-card={section.id}
      data-learning-section-structured={structured ? "true" : "false"}
      id={cellDomId(section.anchorBlockId)}
    >
      <button
        className="flex w-full min-w-0 items-baseline gap-3 border-b bg-muted/30 px-5 py-4 text-left transition-colors hover:bg-muted/50"
        type="button"
        onClick={() => onSelectBlock(section.anchorBlockId)}
      >
        <span
          className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground"
          data-learning-section-index="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1" data-learning-section-heading="true">
          <span className="block text-lg font-semibold text-foreground">{section.title}</span>
          {section.subtitle ? <span className="mt-0.5 block text-sm leading-6 text-muted-foreground">{section.subtitle}</span> : null}
        </span>
      </button>

      <SectionNarrative contract={section.contract} />

      {structured ? (
        <StructuredSectionLearningBody
          canRun={canRun}
          category={category}
          cellHelpByBlockId={cellHelpByBlockId}
          contentId={contentId}
          drafts={drafts}
          renderCodeCellEditor={renderCodeCellEditor}
          results={results}
          runningBlockId={runningBlockId}
          section={section}
          selectedBlockId={selectedBlockId}
          totalMissions={totalMissions}
          onCellAsk={onCellAsk}
          onDraftChange={onDraftChange}
          onRunBlock={onRunBlock}
          onSelectBlock={onSelectBlock}
        />
      ) : (
        <div className="space-y-6 px-5 py-5">
          {section.blocks.map((block) => (
            <CurriculumLearningCell
              block={block}
              canRun={canRun}
              cellHelp={cellHelpByBlockId[block.id]}
              draft={drafts[block.id] ?? curriculumInitialDraft(block)}
              isRunning={runningBlockId === block.id}
              isSelected={block.id === selectedBlockId}
              key={block.id}
              renderCodeCellEditor={renderCodeCellEditor}
              result={results[block.id]}
              variant="embedded"
              onAsk={(action, question) => onCellAsk(action, block, question)}
              onDraftChange={(value) => onDraftChange(block.id, value)}
              onRun={() => onRunBlock(block)}
              onSelect={() => onSelectBlock(block.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function groupCurriculumSections(blocks: BlockConfig[]): { introBlocks: BlockConfig[]; sections: CurriculumSectionGroup[] } {
  const introBlocks: BlockConfig[] = [];
  const sections: CurriculumSectionGroup[] = [];
  let current: CurriculumSectionGroup | null = null;

  const flush = () => {
    if (!current) return;
    if (current.blocks.length || current.titleBlock) sections.push(current);
    current = null;
  };

  blocks.forEach((block, index) => {
    if (block.sourceType === "intro" || (block.displayKind === "hero" && block.role === "title")) {
      introBlocks.push(block);
      return;
    }

    if (isSectionTitleBlock(block)) {
      flush();
      const info = sectionInfo(block);
      current = {
        id: `section-${block.id}`,
        title: info.title || `섹션 ${sections.length + 1}`,
        subtitle: info.subtitle,
        contract: info.contract,
        anchorBlockId: block.id,
        titleBlock: block,
        blocks: [],
      };
      return;
    }

    if (!current) {
      current = {
        id: `section-fallback-${index}`,
        title: "학습 섹션",
        subtitle: "",
        anchorBlockId: block.id,
        blocks: [],
      };
    }
    current.blocks.push(block);
  });

  flush();
  if (!sections.length && introBlocks.length) {
    const firstIntro = introBlocks[0];
    sections.push({
      id: "section-overview",
      title: "학습 시작",
      subtitle: "",
      anchorBlockId: firstIntro.id,
      blocks: introBlocks.slice(1),
    });
  }
  return { introBlocks, sections };
}

function isSectionTitleBlock(block: BlockConfig) {
  if (block.sourceType === "section") return true;
  if (block.displayKind !== "title") return false;
  return block.role === "title" && block.sourceType !== "intro";
}

// 오버뷰 렌더 필드(스펙 §6): title·direction·points만 쓴다.
// intro.benefits/diagram은 boilerplate라 렌더에서 제외한다(YAML 스키마는 불변).
function curriculumOverview(document: CodaroDocument, introBlock?: BlockConfig) {
  const payload = isRecord(introBlock?.payload) ? introBlock.payload : {};
  const lessonContract = isRecord(payload.learningContract) ? payload.learningContract : {};
  const meta = isRecord(lessonContract.meta) ? lessonContract.meta : {};
  const intro = isRecord(lessonContract.intro) ? lessonContract.intro : {};
  const title = readPayloadText(meta.title) || readPayloadText(payload.title) || introBlock?.title || document.title;
  const goal = specificLearningCopy(readPayloadText(intro.direction) || readPayloadText(payload.goal));
  const description = readPayloadText(payload.description) || introBlock?.description || textAfterHeading(introBlock?.content ?? "");
  const points = payloadTextList(payload.points).map(stripMarkdown);
  return {
    title: stripMarkdown(title),
    direction: stripMarkdown(goal || description),
    points,
  };
}

function sectionInfo(block: BlockConfig) {
  const payload = isRecord(block.payload) ? block.payload : {};
  const contract = readSectionContract(payload.sectionContract);
  const title = readPayloadText(contract?.title) || readPayloadText(payload.title) || block.title || blockLabel(block);
  const contentLines = block.content
    .split("\n")
    .map((line) => stripMarkdown(line))
    .filter(Boolean);
  const cleanTitle = stripMarkdown(title);
  const subtitle =
    readPayloadText(contract?.subtitle) ||
    readPayloadText(payload.subtitle) ||
    block.description ||
    contentLines.find((line) => line !== cleanTitle) ||
    "";

  return {
    title: cleanTitle,
    subtitle: stripMarkdown(subtitle),
    contract,
  };
}

// 구조화 섹션 서사(스펙 §5 ①②) — 3열 그리드 대신 단일 컬럼: 리드(goal) → 이유(why) → 본문(explanation).
// 팁은 실습 직전에 배치되므로 StructuredSectionLearningBody가 렌더한다.
function SectionNarrative({ contract }: { contract?: CurriculumSectionContract }) {
  if (!contract) return null;
  const goal = specificLearningCopy(readPayloadText(contract.goal));
  const why = specificLearningCopy(readPayloadText(contract.why));
  const explanation = specificLearningCopy(readPayloadText(contract.explanation));
  if (!goal && !why && !explanation) return null;
  const explanationParagraphs = explanation.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);

  return (
    <div className="space-y-4 px-5 pt-5" data-learning-section-part="overview">
      {goal || why ? (
        <div className="min-w-0 max-w-[70ch]">
          {goal ? <p className="text-md font-medium text-foreground">{goal}</p> : null}
          {why ? <p className={cn("text-sm leading-6 text-muted-foreground", goal && "mt-1")}>{why}</p> : null}
        </div>
      ) : null}
      {explanationParagraphs.length ? (
        <div className="min-w-0 max-w-[70ch] space-y-3">
          {explanationParagraphs.map((paragraph, index) => (
            <p className="text-md text-foreground" key={`${paragraph.slice(0, 16)}-${index}`}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function parseRequiredPatterns(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function StructuredSectionLearningBody({
  canRun,
  category,
  cellHelpByBlockId,
  contentId,
  drafts,
  renderCodeCellEditor,
  results,
  runningBlockId,
  section,
  selectedBlockId,
  totalMissions,
  onCellAsk,
  onDraftChange,
  onRunBlock,
  onSelectBlock,
}: {
  canRun: boolean;
  category: string;
  cellHelpByBlockId: Record<string, CellAiHelpState>;
  contentId: string;
  drafts: Record<string, string>;
  renderCodeCellEditor: RenderCodeCellEditor;
  results: ResultMap;
  runningBlockId: string | null;
  section: CurriculumSectionGroup;
  selectedBlockId: string;
  totalMissions: number;
  onCellAsk: (action: CellAiAction, block: BlockConfig, question?: string) => void;
  onDraftChange: (blockId: string, value: string) => void;
  onRunBlock: (block: BlockConfig) => void;
  onSelectBlock: (blockId: string) => void;
}) {
  const parts = structuredSectionParts(section);
  const exercise = parts.exercise;
  const exerciseDraft = exercise ? drafts[exercise.id] ?? curriculumInitialDraft(exercise) : "";
  const exerciseResult = exercise ? results[exercise.id] : undefined;
  const exerciseRunning = exercise ? runningBlockId === exercise.id : false;
  const exerciseSelected = exercise ? selectedBlockId === exercise.id : false;
  // 실습 prompt는 사람이 쓴 학습 지시문 — 필터·자르기 없이 그대로 렌더한다(스펙 §5 ⑤).
  const exerciseDescription = stripMarkdown(exercise?.guide?.description || exercise?.description || "");
  const sectionTips = payloadTextList(section.contract?.tips).map(stripMarkdown).filter(Boolean).slice(0, 4);

  const sessionId = useWidgetSession();
  const checkConfig = exercise?.guide?.checkConfig ?? {};
  const checkType = checkConfig.type ?? "";
  const hintCount = exercise?.guide?.hints?.length ?? 0;
  const canCheck = Boolean(exercise && checkType && sessionId && canRun);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const runCheck = async (level: number) => {
    if (!exercise || !sessionId) return;
    setChecking(true);
    try {
      const result = await runExerciseCheck({
        sessionId,
        studentCode: drafts[exercise.id] ?? curriculumInitialDraft(exercise),
        expectedCode: checkConfig.expectedCode,
        checkType,
        variableName: checkConfig.variableName,
        expectedValue: checkConfig.expectedValue,
        requiredPatterns: parseRequiredPatterns(checkConfig.requiredPatterns),
        hints: exercise.guide?.hints ?? [],
        currentHintLevel: level,
        category,
        contentId,
        sectionId: section.id,
      });
      setCheckResult(result);
      setHintLevel(result.hintLevel ?? level);
      if (result.passed && exercise && totalMissions > 0) {
        try {
          const completion = await recordLessonMissionComplete(category, contentId, exercise.id, totalMissions);
          if (completion.lessonCompleted) setLessonCompleted(true);
        } catch (completionError) {
          console.warn("lesson completion record failed", completionError);
        }
      }
    } catch (error) {
      console.warn("exercise check failed", error);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6 px-5 py-5">
      {parts.snippet ? (
        <div data-learning-section-part="snippet">
          <div className="pb-1.5 text-xs font-medium text-muted-foreground" data-learning-snippet-kicker="true">예제</div>
          <CodePayload label="코드" value={parts.snippet.content} />
        </div>
      ) : null}

      {sectionTips.length ? (
        <aside className="min-w-0 max-w-[70ch] border-l-2 border-border py-0.5 pl-4" data-learning-section-part="tips">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Lightbulb className="size-3.5" />
            팁
          </div>
          <ul className="mt-1.5 space-y-1">
            {sectionTips.map((tip, index) => (
              <li className="flex gap-2.5 text-md text-foreground" key={`${tip}-${index}`}>
                <span className="mt-[0.65em] size-1 shrink-0 rounded-full bg-foreground/40" />
                <span>{stripBullet(tip)}</span>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}

      {exercise ? (
        <div
          data-learning-section-part="exercise"
          id={cellDomId(exercise.id)}
          onClick={() => onSelectBlock(exercise.id)}
        >
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-muted-foreground">직접 해보기</div>
              <h3 className="mt-1 text-[15px] font-semibold leading-6 text-foreground">{blockLabel(exercise)}</h3>
              {exerciseDescription ? (
                <p className="mt-1 max-w-[70ch] text-md text-foreground">
                  {exerciseDescription}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {exerciseRunning || exerciseResult ? (
                <Badge className="h-7 rounded-md px-2 text-xs" variant={exerciseResult?.status === "error" ? "destructive" : "outline"}>
                  {statusLabel(exerciseRunning ? "running" : exerciseResult?.status ?? "idle")}
                </Badge>
              ) : null}
              <IconButton
                className="size-7 rounded-md [&_svg]:size-3.5"
                disabled={!canRun}
                label="셀 실행"
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  onRunBlock(exercise);
                }}
              >
                {exerciseRunning ? <Loader2 className="animate-spin" /> : <Play />}
              </IconButton>
              {canCheck ? (
                <Button
                  className="h-7 gap-1.5 rounded-md border-0 bg-accent-brand px-2.5 text-xs text-accent-brand-foreground hover:bg-accent-brand/90 [&_svg]:size-3.5"
                  data-learning-exercise-check="true"
                  disabled={checking}
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    void runCheck(hintLevel);
                  }}
                >
                  {checking ? <Loader2 className="animate-spin" /> : <ListChecks />}
                  검증
                </Button>
              ) : null}
              <CellAiActions
                helpState={cellHelpByBlockId[exercise.id]}
                selected={exerciseSelected}
                onAsk={(action, question) => onCellAsk(action, exercise, question)}
              />
            </div>
          </div>

          <div className="mt-3">
            <div
              aria-label={`${blockLabel(exercise)} 직접 해보기 코드 편집기`}
              className={cn(
                "rounded-lg border bg-code transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-accent-brand/30",
                exerciseSelected ? "border-ring ring-2 ring-accent-brand/25" : "border-border hover:border-ring/60",
              )}
              data-learning-exercise-input="editor"
              data-learning-exercise-input-role="student-practice"
              data-learning-exercise-input-state={exerciseSelected ? "selected" : "ready"}
            >
              {renderCodeCellEditor({
                autoFocus: exerciseSelected,
                block: exercise,
                draft: exerciseDraft,
                onChange: (value) => onDraftChange(exercise.id, value),
                onFocus: () => onSelectBlock(exercise.id),
                onRun: () => onRunBlock(exercise),
              })}
            </div>
          </div>

          {exerciseResult || exerciseRunning ? (
            <div className="mt-3" data-learning-section-part="result">
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">실행 결과</div>
              {exerciseResult ? <ExecutionOutput result={exerciseResult} /> : <LoadingInline label="셀 실행 중" />}
            </div>
          ) : null}

          {checking || checkResult ? (
            <div className="mt-3" data-learning-section-part="check">
              <CheckResultPanel
                loading={checking && !checkResult}
                result={checkResult}
                onApplyCorrection={
                  exercise
                    ? (code) => {
                        onSelectBlock(exercise.id);
                        onDraftChange(exercise.id, code);
                      }
                    : undefined
                }
                onAskAssistant={
                  exercise ? (question) => onCellAsk("explain", exercise, question) : undefined
                }
                onNextHint={() => void runCheck(Math.min(hintLevel + 1, hintCount))}
              />
            </div>
          ) : null}

          {lessonCompleted ? (
            <div
              className="mt-3 border-l-2 border-success py-0.5 pl-4"
              data-lesson-completed="true"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Trophy className="size-4 text-success" />
                이 레슨의 실습을 모두 끝냈어요!
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {parts.extraBlocks.length ? (
        <div className="space-y-6">
          {parts.extraBlocks.map((block) => (
            <CurriculumLearningCell
              block={block}
              canRun={canRun}
              cellHelp={cellHelpByBlockId[block.id]}
              draft={drafts[block.id] ?? curriculumInitialDraft(block)}
              isRunning={runningBlockId === block.id}
              isSelected={block.id === selectedBlockId}
              key={block.id}
              renderCodeCellEditor={renderCodeCellEditor}
              result={results[block.id]}
              variant="embedded"
              onAsk={(action, question) => onCellAsk(action, block, question)}
              onDraftChange={(value) => onDraftChange(block.id, value)}
              onRun={() => onRunBlock(block)}
              onSelect={() => onSelectBlock(block.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function hasStructuredSectionBlocks(section: CurriculumSectionGroup) {
  return section.blocks.some((block) => block.sourceType?.startsWith("sectionContract:"));
}

function structuredSectionParts(section: CurriculumSectionGroup) {
  const snippet = section.blocks.find((block) => block.sourceType === "sectionContract:snippet");
  const exercise = section.blocks.find((block) => block.sourceType === "sectionContract:exercise");
  // 검증 기준(sectionContract:check)은 학습자에게 표시하지 않는다 — 내부 채점 메타이지 학습
  // 콘텐츠가 아니다. 남아 있어도 학습자 카드로 렌더하지 않도록 extraBlocks에서도 제외한다.
  const extraBlocks = section.blocks.filter((block) => (
    block.sourceType !== "sectionContract:explanation"
    && block.sourceType !== "sectionContract:snippet"
    && block.sourceType !== "sectionContract:exercise"
    && block.sourceType !== "sectionContract:check"
  ));
  return { snippet, exercise, extraBlocks };
}

function specificLearningCopy(value: string) {
  const text = stripMarkdown(value);
  return isGenericLearningCopy(text) ? "" : text;
}

// 유일하게 유지하는 런타임 카피 필터 — 자동생성 boilerplate 문구만 숨긴다.
// 신규 필터 추가 금지: 콘텐츠 결함은 YAML을 고친다(스펙 §1 원칙 5).
function isGenericLearningCopy(value: string) {
  const normalized = normalizeCopy(value);
  return [
    "예제를 실행하고 핵심 동작을 직접 변형한다.",
    "작은 실행과 검증 흐름이 실무 코드의 기본이다.",
    "한 섹션씩 개념, 예제, 직접 입력, 실행 결과를 연결해 학습합니다.",
  ].includes(normalized);
}

function normalizeCopy(value: string) {
  return stripBullet(stripMarkdown(value)).replace(/\s+/g, " ").trim();
}

function textAfterHeading(content: string) {
  return content
    .split("\n")
    .map((line) => stripMarkdown(line))
    .filter((line) => line && !line.startsWith("#"))
    .find(Boolean) ?? "";
}

function firstContentLine(content: string) {
  return content
    .split("\n")
    .map((line) => stripMarkdown(line).replace(/^[-*]\s*/, "").trim())
    .find(Boolean) ?? "";
}

function payloadTextList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") return String(item);
      if (isRecord(item)) {
        return [
          readPayloadText(item.title ?? item.label ?? item.name ?? item.text),
          readPayloadText(item.description ?? item.content),
        ].filter(Boolean).join(" ");
      }
      return "";
    })
    .filter(Boolean);
}

function readSectionContract(value: unknown): CurriculumSectionContract | undefined {
  return isRecord(value) ? value as CurriculumSectionContract : undefined;
}

export function CurriculumCellToc({
  document: curriculum,
  selectedBlockId,
  onSelectBlock,
}: {
  document: CodaroDocument;
  selectedBlockId: string;
  onSelectBlock: (blockId: string) => void;
}) {
  const rawItems = curriculum.blocks.map((block) => {
    const kind = classifyLearningCell(block, block.content);
    const meta = curriculumTypeMeta(block, kind);
    const label = blockLabel(block);
    return {
      block,
      label,
      meta,
    };
  });
  const meaningfulItems = rawItems.filter(({ block, label }) => shouldShowTocItem(block, label));
  const items = meaningfulItems.length ? meaningfulItems : rawItems;

  return (
    <aside
      aria-label="셀 목차"
      className="group/toc relative z-30 hidden h-full min-h-0 w-12 shrink-0 justify-self-end overflow-hidden border-l bg-background transition-[width,box-shadow] duration-150 hover:w-72 hover:border hover:border-border hover:bg-popover hover:shadow-2xl 2xl:block"
      data-learning-toc="push"
    >
      <div className="flex h-full min-h-0 w-72 flex-col bg-inherit py-3">
        <div className="flex h-8 items-center gap-2 px-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
          <ListChecks className="size-3.5" />
          </span>
          <span className="min-w-0 truncate text-sm font-semibold tracking-normal opacity-0 transition-opacity group-hover/toc:opacity-100">
            셀 목차
          </span>
        </div>
        <ScrollArea className="min-h-0 w-full flex-1">
          <div className="space-y-0.5 px-2 py-2">
            {items.map(({ block, label, meta }) => {
              const Icon = meta.Icon;
              const active = block.id === selectedBlockId;
              return (
                <button
                  aria-label={label}
                  className={cn(
                    "flex h-7 w-7 min-w-0 items-center gap-2 rounded-md px-1.5 text-left text-xs text-muted-foreground transition-[width,background-color,color] duration-150 hover:bg-muted/60 hover:text-foreground group-hover/toc:w-full group-hover/toc:px-2",
                    active && "bg-accent-brand text-accent-brand-foreground hover:bg-accent-brand/90 hover:text-accent-brand-foreground",
                  )}
                  key={block.id}
                  title={label}
                  type="button"
                  onClick={() => selectTocBlock(block.id, onSelectBlock)}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium opacity-0 transition-opacity group-hover/toc:opacity-100">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}

function selectTocBlock(blockId: string, onSelectBlock: (blockId: string) => void) {
  onSelectBlock(blockId);
  scrollToCell(blockId);
}

function shouldShowTocItem(block: BlockConfig, label: string) {
  const normalized = label.trim().replace(/[.!?。]+$/g, "").toLowerCase();
  const genericLabels = new Set([
    "팁",
    "힌트",
    "tip",
    "tips",
    "hint",
    "note",
    "주의",
    "참고",
  ]);
  if (genericLabels.has(normalized)) return false;
  if (block.displayKind === "callout") return false;
  if (block.sourceType === "tip" || block.sourceType === "tipCard" || block.sourceType === "note") return false;
  if (block.role === "title" || block.displayKind === "hero" || block.displayKind === "title") return true;
  if (block.type === "code") return true;
  if (block.type === "markdown" && block.sourceType === "expansion") return false;
  if (block.role === "exercise" || block.displayKind === "practice") return true;
  if (block.displayKind === "quiz") return true;
  return false;
}

function CurriculumLearningCell({
  block,
  canRun,
  cellHelp,
  draft,
  isRunning,
  isSelected,
  renderCodeCellEditor,
  result,
  variant = "standalone",
  onAsk,
  onDraftChange,
  onRun,
  onSelect,
}: {
  block: BlockConfig;
  canRun: boolean;
  cellHelp?: CellAiHelpState;
  draft: string;
  isRunning: boolean;
  isSelected: boolean;
  renderCodeCellEditor: RenderCodeCellEditor;
  result?: ExecutionResult;
  variant?: "standalone" | "embedded";
  onAsk: (action: CellAiAction, question?: string) => void;
  onDraftChange: (value: string) => void;
  onRun: () => void;
  onSelect: () => void;
}) {
  const role = block.role ?? (block.type === "code" ? "snippet" : "explanation");
  const resultStatus = isRunning ? "running" : result?.status ?? "idle";
  const isSnippetCode = block.type === "code" && role === "snippet";
  const embedded = variant === "embedded";
  const showStatus = isRunning || Boolean(result);

  if (block.type === "markdown") {
    if (block.displayKind === "title") {
      if (embedded) return null;
      return (
        <CurriculumSectionTitle
          block={block}
          isSelected={isSelected}
          onSelect={onSelect}
        />
      );
    }

    // 마크다운 셀 래퍼 — 아이콘칩+라벨 이중 헤더 폐지. 제목은 CurriculumMarkdownBody가
    // 유일하게 소유한다. 선택 상태는 좌측 accent rail 하나로만 표시한다.
    if (embedded || block.displayKind === "callout") {
      return (
        <section
          className={cn(
            "group relative -ml-4 min-w-0 scroll-mt-4 border-l-2 border-transparent pl-4",
            isSelected && "border-accent-brand",
          )}
          data-learning-cell="embedded"
          data-selected={isSelected ? "true" : "false"}
          id={cellDomId(block.id)}
          onClick={onSelect}
        >
          <div className="absolute right-0 top-0 z-10 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <CellAiActions helpState={cellHelp} onAsk={onAsk} selected={isSelected} />
          </div>
          <CurriculumMarkdownBody block={block} />
        </section>
      );
    }

    return (
      <section
        className={cn(
          "group relative min-w-0 rounded-lg border bg-card text-card-foreground",
          isSelected && "ring-1 ring-ring/30",
        )}
        id={cellDomId(block.id)}
        onClick={onSelect}
      >
        <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <CellAiActions helpState={cellHelp} onAsk={onAsk} selected={isSelected} />
        </div>
        <div className="p-5">
          <CurriculumMarkdownBody block={block} />
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        embedded
          ? "group relative -ml-4 min-w-0 scroll-mt-4 border-l-2 border-transparent pl-4"
          : "group min-w-0 rounded-lg border bg-card text-card-foreground",
        embedded && isSelected && "border-accent-brand",
        !embedded && isSelected && "ring-1 ring-ring/30",
      )}
      data-learning-cell={embedded ? "embedded" : "standalone"}
      data-selected={isSelected ? "true" : "false"}
      id={cellDomId(block.id)}
    >
      <div className={cn("min-w-0", !embedded && "p-5")}>
        <div className="flex items-center gap-2">
          <button className="min-w-0 flex-1 text-left" type="button" onClick={onSelect}>
            <span className="block truncate text-[15px] font-semibold leading-6 text-foreground">{blockLabel(block)}</span>
          </button>
          {showStatus ? (
            <Badge className="h-7 rounded-md px-2 text-xs" variant={resultStatus === "error" ? "destructive" : "outline"}>
              {statusLabel(resultStatus)}
            </Badge>
          ) : null}
          <IconButton
            className="size-7 rounded-md [&_svg]:size-3.5"
            disabled={!canRun}
            label="셀 실행"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              onRun();
            }}
          >
            {isRunning ? <Loader2 className="animate-spin" /> : <Play />}
          </IconButton>
          <CellAiActions helpState={cellHelp} onAsk={onAsk} selected={isSelected} />
        </div>
        <div className="mt-3 space-y-3">
          {isSnippetCode && block.description ? <SnippetPracticeIntro block={block} /> : null}
          {!isSnippetCode && block.guide?.description ? (
            <p className="max-w-[70ch] text-md text-foreground">{stripMarkdown(block.guide.description)}</p>
          ) : null}
          <div
            aria-label={`${blockLabel(block)} 코드 편집기`}
            className={cn(
              "rounded-lg border bg-code transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-accent-brand/30",
              isSelected ? "border-ring ring-2 ring-accent-brand/25" : "border-border hover:border-ring/60",
            )}
            data-learning-code-input="editor"
            data-learning-code-input-role={isSnippetCode ? "student-practice" : "code-edit"}
            data-learning-code-input-state={isSelected ? "selected" : "ready"}
            onClick={onSelect}
          >
            {renderCodeCellEditor({
              autoFocus: isSelected,
              block,
              draft,
              onChange: onDraftChange,
              onFocus: onSelect,
              onRun,
            })}
          </div>
          {result ? <ExecutionOutput result={result} /> : null}
          {isRunning && !result ? <LoadingInline label="셀 실행 중" /> : null}
        </div>
      </div>
    </section>
  );
}

function SnippetPracticeIntro({ block }: { block: BlockConfig }) {
  const description = block.description?.trim();

  return (
    <div className="min-w-0 space-y-2">
      <div className="text-xs font-medium text-muted-foreground">예제</div>
      {description ? <p className="max-w-[70ch] text-md text-foreground">{description}</p> : null}
      <CodePayload value={block.content} />
    </div>
  );
}

function CurriculumSectionTitle({
  block,
  isSelected,
  onSelect,
}: {
  block: BlockConfig;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const payload = isRecord(block.payload) ? block.payload : {};
  const title = readPayloadText(payload.title) || block.title || blockLabel(block);
  const cleanTitle = stripMarkdown(title);
  const contentLines = block.content
    .split("\n")
    .map((line) => stripMarkdown(line))
    .filter(Boolean);
  const subtitle =
    readPayloadText(payload.subtitle) ||
    block.description ||
    contentLines.find((line) => line !== cleanTitle) ||
    "";

  return (
    <section className="py-2" id={cellDomId(block.id)}>
      <button
        aria-label={cleanTitle}
        className={cn(
          "w-full rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/30",
          isSelected && "bg-muted/30 ring-1 ring-ring/25",
        )}
        type="button"
        onClick={onSelect}
      >
        <h2 className="text-lg font-semibold text-foreground">{cleanTitle}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{stripMarkdown(subtitle)}</p> : null}
      </button>
    </section>
  );
}

function curriculumTypeMeta(block: BlockConfig, kind: LearningCellKind): { label: string; Icon: ComponentType<{ className?: string }> } {
  const sourceType = block.sourceType ?? "";
  const displayKind = block.displayKind ?? "";
  const role = block.role ?? "";

  if (sourceType === "intro") return { label: "소개", Icon: Sparkles };
  if (sourceType === "section") return { label: "섹션", Icon: Layers3 };
  if (sourceType === "localRunner") return { label: "실행", Icon: TerminalSquare };
  if (sourceType === "expansion" || role === "exercise") return { label: "실습", Icon: Play };
  if (sourceType === "list") return { label: "목록", Icon: ListChecks };
  if (sourceType === "table" || displayKind === "table") return { label: "표", Icon: Layers3 };
  if (sourceType === "compare" || sourceType === "fullWidthComparison" || displayKind === "comparison") return { label: "비교", Icon: Layers3 };
  if (sourceType === "tip" || sourceType === "tipCard" || sourceType === "note" || displayKind === "callout") return { label: "노트", Icon: Lightbulb };
  if (sourceType === "warning" || role === "check" || displayKind === "quiz") return { label: "검증", Icon: CheckCircle2 };
  if (displayKind === "cardGrid") return { label: "카드", Icon: Sparkles };
  if (displayKind === "resource") return { label: "자료", Icon: MessageSquare };
  if (displayKind === "media") return { label: "미디어", Icon: Play };
  if (displayKind === "hero" || displayKind === "title" || role === "title") return { label: "타이틀", Icon: Target };
  if (block.type === "code") {
    if (role === "snippet") return { label: "스니펫", Icon: TerminalSquare };
    return { label: executionKindLabel(block.executionKind), Icon: TerminalSquare };
  }
  if (kind === "visual") return { label: "시각화", Icon: Sparkles };
  return { label: "개념", Icon: GraduationCap };
}

function curriculumInitialDraft(block: BlockConfig) {
  if (block.type !== "code") return block.content;
  if (block.role === "snippet") return "";
  return block.content;
}

function readPayloadText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cellDomId(blockId: string) {
  return `curriculum-cell-${blockId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function CurriculumHeaderProgress({
  contents,
  loading,
}: {
  contents: Array<{ contentId: string; title: string }>;
  loading?: boolean;
}) {
  const { summary } = useCurriculumProgress();
  if (loading) return null;
  return (
    <CurriculumProgressBadge
      completed={summary?.totalCompleted ?? 0}
      total={contents.length}
      label="레슨"
    />
  );
}
