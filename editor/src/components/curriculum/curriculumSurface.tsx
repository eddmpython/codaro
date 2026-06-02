import {
  BookOpen,
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
import { learningCellCatalog } from "@/components/app/learningCellCatalog";
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
import type { BlockConfig, CheckResult, CodaroDocument, ExecutionResult, PredictConfig } from "@/types";
import { CheckResultPanel } from "./checkResultPanel";
import { CurriculumDependencyPanel } from "./curriculumDependencyPanel";
import { CurriculumProgressBadge } from "./curriculumProgressBadge";
import {
  CurriculumMarkdownBody,
  curriculumCellTone,
} from "./curriculumMarkdownBody";
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
            selectedCategory={selectedCategory}
            selectedCategoryLabel={selectedCategoryLabel}
            selectedContentId={selectedContentId}
            selectedContentLabel={selectedContentLabel}
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
      className="mt-3 overflow-hidden rounded-xl border border-rose-300/40 bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-orange-500/10 px-5 py-4 text-card-foreground shadow-sm dark:border-rose-400/20"
      data-curriculum-support="true"
    >
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-sm shadow-rose-500/30">
            <Heart className="size-5 fill-white" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold">{t("support.title")}</div>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{t("support.message")}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            asChild
            className="h-8 gap-1.5 border-0 bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-xs text-white shadow-sm transition-opacity hover:opacity-90"
            size="sm"
          >
            <a href={CODARO_LINKS.buyMeACoffee} rel="noreferrer noopener" target="_blank">
              <Coffee className="size-3.5" />
              {t("support.buyMeACoffee")}
            </a>
          </Button>
          <Button asChild className="h-8 gap-1.5 border-rose-300/50 px-2.5 text-xs hover:bg-rose-500/10" size="sm" variant="outline">
            <a href={CODARO_LINKS.githubSponsors} rel="noreferrer noopener" target="_blank">
              <Heart className="size-3.5 text-rose-500" />
              {t("support.githubSponsors")}
            </a>
          </Button>
          <Button asChild className="h-8 gap-1.5 border-amber-300/50 px-2.5 text-xs hover:bg-amber-500/10" size="sm" variant="outline">
            <a href={CODARO_LINKS.githubRepo} rel="noreferrer noopener" target="_blank">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
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

type StructuredSectionPart = "snippet" | "check";

function LearningOverviewHeader({
  apiOnline,
  contents = [],
  document,
  introBlock,
  pendingBlocks,
  referenceLoading,
  selectedCategory,
  selectedCategoryLabel,
  selectedContentId,
  selectedContentLabel,
  onAcceptPendingBlocks,
  onRejectPendingBlocks,
  onOpenTerminalCommand,
}: {
  apiOnline: boolean;
  contents?: Array<{ contentId: string; title: string }>;
  document: CodaroDocument;
  introBlock?: BlockConfig;
  pendingBlocks: BlockConfig[];
  referenceLoading: boolean;
  selectedCategory: string;
  selectedCategoryLabel: string;
  selectedContentId: string;
  selectedContentLabel: string;
  onAcceptPendingBlocks: () => void;
  onRejectPendingBlocks: () => void;
  onOpenTerminalCommand: (command: string) => void;
}) {
  const overview = curriculumOverview(document, introBlock);

  return (
    <header
      className="relative overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm"
      data-learning-overview="true"
      id={introBlock ? cellDomId(introBlock.id) : undefined}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        data-learning-overview-blueprint="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border) / 0.55) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.55) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-zinc-300 dark:bg-zinc-700"
        data-learning-overview-rail="true"
      />
      <div className="relative z-10 p-5">
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">커리큘럼</Badge>
            <Badge variant="outline">{selectedCategoryLabel || selectedCategory}</Badge>
            {selectedContentLabel || selectedContentId ? <Badge variant="outline">{selectedContentLabel || selectedContentId}</Badge> : null}
            <CurriculumHeaderProgress contents={contents} loading={referenceLoading} />
            {referenceLoading ? <LoadingInline label="레슨 불러오는 중" /> : null}
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal" data-learning-overview-part="title">{overview.title}</h1>
          {overview.direction ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground" data-learning-overview-part="direction">{overview.direction}</p>
          ) : null}
          <WorkflowArchitectureDiagram diagram={overview.diagram} />
          {overview.benefits.length ? (
            <div className="mt-5 grid gap-x-5 gap-y-2 border-t pt-4 sm:grid-cols-2">
              {overview.benefits.slice(0, 4).map((benefit, index) => (
                <div
                  className="flex min-w-0 items-start gap-2 text-sm leading-5"
                  data-learning-overview-part="benefit"
                  key={`${benefit}-${index}`}
                >
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                  <span className="min-w-0 text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="mt-auto">
            <CurriculumDependencyPanel
              apiOnline={apiOnline}
              document={document}
              onOpenTerminalCommand={onOpenTerminalCommand}
            />
          </div>
        </div>
      </div>
      <PendingNotebookBar
        pendingBlocks={pendingBlocks}
        onAccept={onAcceptPendingBlocks}
        onReject={onRejectPendingBlocks}
      />
    </header>
  );
}

function WorkflowArchitectureDiagram({ diagram }: { diagram?: Record<string, unknown> }) {
  const steps = workflowArchitectureSteps(diagram);
  if (steps.length < 3) return null;

  return (
    <section className="mt-5 border-t pt-4" data-learning-overview-part="workflow" data-learning-workflow-diagram="true">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <ListChecks className="size-3.5" />
        <span>실무 흐름</span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <div
            className="min-w-0 rounded-md border bg-background/70 px-3 py-2"
            data-learning-workflow-step="true"
            key={`${step.label}-${index}`}
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border bg-muted text-[11px] font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold tracking-normal">{step.label}</div>
                {step.detail ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{step.detail}</p> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
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
        "overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm",
        selected && "ring-1 ring-ring/35",
      )}
      data-learning-section-card={section.id}
      data-learning-section-structured={structured ? "true" : "false"}
      id={cellDomId(section.anchorBlockId)}
    >
      <button
        className="flex w-full min-w-0 items-stretch gap-3 border-b border-zinc-200 bg-zinc-100/80 px-4 py-3 text-left transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/85 dark:hover:bg-zinc-900"
        type="button"
        onClick={() => onSelectBlock(section.anchorBlockId)}
      >
        <span
          className="flex min-h-11 w-11 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-sm font-semibold tabular-nums text-zinc-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-950"
          data-learning-section-index="true"
        >
          {index + 1}
        </span>
        <span className="flex min-w-0 flex-1 flex-col justify-center" data-learning-section-heading="true">
          <span className="block text-lg font-semibold tracking-normal text-zinc-950 dark:text-zinc-50">{section.title}</span>
          {section.subtitle ? <span className="mt-1 block text-sm leading-6 text-zinc-600 dark:text-zinc-300">{section.subtitle}</span> : null}
        </span>
        <Badge className="mt-1 gap-1 border-zinc-300 bg-background/80 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-200" variant="outline">
          <Layers3 className="size-3" />
          섹션
        </Badge>
      </button>

      <SectionContractOverview contract={section.contract} />

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
        <div className="divide-y">
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

function curriculumOverview(document: CodaroDocument, introBlock?: BlockConfig) {
  const payload = isRecord(introBlock?.payload) ? introBlock.payload : {};
  const lessonContract = isRecord(payload.learningContract) ? payload.learningContract : {};
  const meta = isRecord(lessonContract.meta) ? lessonContract.meta : {};
  const intro = isRecord(lessonContract.intro) ? lessonContract.intro : {};
  const title = readPayloadText(meta.title) || readPayloadText(payload.title) || introBlock?.title || document.title;
  const goal = readPayloadText(intro.direction) || readPayloadText(payload.goal);
  const description = readPayloadText(payload.description) || introBlock?.description || textAfterHeading(introBlock?.content ?? "");
  const contractBenefits = payloadTextList(intro.benefits);
  const benefits = contractBenefits.length
    ? contractBenefits.map(stripMarkdown)
    : payloadTextList(payload.points).length
      ? payloadTextList(payload.points).map(stripMarkdown)
    : inferBenefits(document.blocks);
  return {
    title: stripMarkdown(title),
    direction: stripMarkdown(goal || description),
    benefits,
    diagram: isRecord(intro.diagram) ? intro.diagram : undefined,
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

const OVERVIEW_ACCENTS = {
  indigo: { border: "border-indigo-400/50", chip: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300" },
  emerald: { border: "border-emerald-400/50", chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" },
  sky: { border: "border-sky-400/50", chip: "bg-sky-500/10 text-sky-600 dark:text-sky-300" },
  amber: { border: "border-amber-400/50", chip: "bg-amber-500/10 text-amber-600 dark:text-amber-300" },
} as const;

function OverviewBlock({
  accent,
  icon,
  label,
  children,
}: {
  accent: keyof typeof OVERVIEW_ACCENTS;
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  const tone = OVERVIEW_ACCENTS[accent];
  return (
    <div className={cn("min-w-0 border-l-2 pl-3", tone.border)}>
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
        <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-md", tone.chip)}>{icon}</span>
        {label}
      </div>
      {children}
    </div>
  );
}

function SectionContractOverview({ contract }: { contract?: CurriculumSectionContract }) {
  if (!contract) return null;
  const goal = specificLearningCopy(readPayloadText(contract.goal));
  const why = specificLearningCopy(readPayloadText(contract.why));
  const explanation = specificLearningCopy(readPayloadText(contract.explanation));
  const tips = payloadTextList(contract.tips).map(specificLearningCopy).filter(Boolean).slice(0, 4);
  if (!goal && !why && !explanation && !tips.length) return null;

  return (
    <div className="border-b bg-background/35 px-4 py-3" data-learning-section-part="overview">
      <div className="min-w-0 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goal ? (
            <OverviewBlock accent="indigo" icon={<Target className="size-3" />} label="이번 섹션에서 공부할 것">
              <p className="mt-1.5 text-sm leading-6 text-foreground/90">{goal}</p>
            </OverviewBlock>
          ) : null}
          {why ? (
            <OverviewBlock accent="emerald" icon={<CheckCircle2 className="size-3" />} label="왜 유용한지">
              <p className="mt-1.5 text-sm leading-6 text-foreground/90">{why}</p>
            </OverviewBlock>
          ) : null}
          {tips.length ? (
            <OverviewBlock accent="amber" icon={<Lightbulb className="size-3" />} label="팁">
              <div className="mt-2 space-y-1.5">
                {tips.map((tip, index) => (
                  <div className="flex gap-2 text-xs leading-5 text-foreground/75" key={`${tip}-${index}`}>
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-amber-500/60" />
                    <span className="min-w-0">{stripBullet(tip)}</span>
                  </div>
                ))}
              </div>
            </OverviewBlock>
          ) : null}
        </div>
        {explanation ? (
          <OverviewBlock accent="sky" icon={<BookOpen className="size-3" />} label="상세 설명">
            <p className="mt-1.5 max-w-[68ch] text-sm leading-7 text-foreground/90">{explanation}</p>
          </OverviewBlock>
        ) : null}
      </div>
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

function toPredictionPayload(predict: PredictConfig | null | undefined) {
  if (!predict) return null;
  return {
    expectedShape: predict.expectedShape ?? "",
    expectedDtype: predict.expectedDtype ?? "",
    expectedValue: predict.expectedValue ?? "",
    expectedError: predict.expectedError ?? "",
  };
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
  const exerciseDescription = specificPracticeCopy(exercise?.guide?.description || exercise?.description || "");

  const sessionId = useWidgetSession();
  const checkConfig = exercise?.guide?.checkConfig ?? {};
  const checkType = checkConfig.type ?? "";
  const hintCount = exercise?.guide?.hints?.length ?? 0;
  const canCheck = Boolean(exercise && checkType && sessionId && canRun);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

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
        prediction: toPredictionPayload(exercise.guide?.predict),
      });
      setCheckResult(result);
      setHintLevel(result.hintLevel ?? level);
      if (result.passed && exercise && totalMissions > 0) {
        try {
          await recordLessonMissionComplete(category, contentId, exercise.id, totalMissions);
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
    <div className="divide-y">
      {parts.snippet ? (
        <StructuredSectionBand
          detail={parts.snippet.description || stripMarkdown(readPayloadText(section.contract?.goal))}
          icon={<TerminalSquare className="size-3.5" />}
          label="예제 스니펫"
          part="snippet"
          title={blockLabel(parts.snippet)}
        >
          <CodePayload label="코드" value={parts.snippet.content} />
        </StructuredSectionBand>
      ) : null}

      {exercise ? (
        <div
          className={cn("px-4 py-4", exerciseSelected && "bg-muted/20")}
          data-learning-section-part="exercise"
          id={cellDomId(exercise.id)}
          onClick={() => onSelectBlock(exercise.id)}
        >
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                <Play className="size-3.5" />
                <span>직접 입력 실습</span>
              </div>
              <h3 className="mt-1 text-base font-semibold tracking-normal">{blockLabel(exercise)}</h3>
              {exerciseDescription ? (
                <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
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
                  className="h-7 gap-1.5 rounded-md px-2.5 text-xs [&_svg]:size-3.5"
                  data-learning-exercise-check="true"
                  disabled={checking}
                  size="sm"
                  variant="secondary"
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
              aria-label={`${blockLabel(exercise)} 직접 입력 실습 코드 편집기`}
              className={cn(
                "rounded-md border bg-code shadow-inner transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
                exerciseSelected ? "border-ring ring-2 ring-ring/20" : "border-border hover:border-ring/60",
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
              <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <CheckCircle2 className="size-3.5" />
                실행 결과
              </div>
              {exerciseResult ? <ExecutionOutput result={exerciseResult} /> : <LoadingInline label="셀 실행 중" />}
            </div>
          ) : null}

          {checking || checkResult ? (
            <div className="mt-3" data-learning-section-part="check">
              <CheckResultPanel
                loading={checking && !checkResult}
                result={checkResult}
                onNextHint={() => void runCheck(Math.min(hintLevel + 1, hintCount))}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {parts.check ? (
        <StructuredSectionBand
          detail={parts.check.description || stripMarkdown(readPayloadText(section.contract?.why))}
          icon={<ListChecks className="size-3.5" />}
          label="검증 기준"
          part="check"
          title={blockLabel(parts.check)}
        >
          <CurriculumMarkdownBody block={parts.check} hideRepeatedTitle />
        </StructuredSectionBand>
      ) : null}

      {parts.extraBlocks.length ? (
        <div className="divide-y">
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

function StructuredSectionBand({
  children,
  detail,
  icon,
  label,
  part,
  title,
}: {
  children: ReactNode;
  detail?: string;
  icon: ReactNode;
  label: string;
  part: StructuredSectionPart;
  title?: string;
}) {
  return (
    <div className="px-4 py-4" data-learning-section-part={part}>
      <div className="mb-3 min-w-0 border-l-2 border-violet-400/50 pl-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-300">
            {icon}
          </span>
          <span>{label}</span>
        </div>
        {title ? <h3 className="mt-1.5 text-base font-semibold tracking-normal">{title}</h3> : null}
        {detail ? <p className="mt-1.5 max-w-[68ch] text-sm leading-6 text-foreground/80">{stripMarkdown(detail)}</p> : null}
      </div>
      {children}
    </div>
  );
}

function hasStructuredSectionBlocks(section: CurriculumSectionGroup) {
  return section.blocks.some((block) => block.sourceType?.startsWith("sectionContract:"));
}

function structuredSectionParts(section: CurriculumSectionGroup) {
  const snippet = section.blocks.find((block) => block.sourceType === "sectionContract:snippet");
  const exercise = section.blocks.find((block) => block.sourceType === "sectionContract:exercise");
  const check = section.blocks.find((block) => block.sourceType === "sectionContract:check");
  const extraBlocks = section.blocks.filter((block) => (
    block.sourceType !== "sectionContract:explanation"
    && block.sourceType !== "sectionContract:snippet"
    && block.sourceType !== "sectionContract:exercise"
    && block.sourceType !== "sectionContract:check"
  ));
  return { snippet, exercise, check, extraBlocks };
}

function specificLearningCopy(value: string) {
  const text = stripMarkdown(value);
  return isGenericLearningCopy(text) ? "" : text;
}

function specificPracticeCopy(value: string) {
  const text = stripMarkdown(value);
  return isGenericPracticeCopy(text) ? "" : text;
}

function isGenericLearningCopy(value: string) {
  const normalized = normalizeCopy(value);
  return [
    "예제를 실행하고 핵심 동작을 직접 변형한다.",
    "작은 실행과 검증 흐름이 실무 코드의 기본이다.",
    "한 섹션씩 개념, 예제, 직접 입력, 실행 결과를 연결해 학습합니다.",
  ].includes(normalized);
}

function isGenericPracticeCopy(value: string) {
  const normalized = normalizeCopy(value);
  return [
    /^예제를 실행한 뒤.*값 하나.*결과를 비교하세요\.$/,
    /^기준 실행 후.*값 하나.*결과를 비교하세요\.$/,
    /^위 예제 스니펫을 참고해.*값 하나를 바꾼 뒤 실행하세요\.$/,
    /^아래 코드 영역을 클릭해.*입력하세요\.$/,
    /^예제와 다르게.*결과 변화를 볼 수 있습니다\.$/,
  ].some((pattern) => pattern.test(normalized)) || (
    normalized.includes("값 하나") &&
    normalized.includes("결과") &&
    (normalized.includes("비교") || normalized.includes("변화"))
  );
}

function normalizeCopy(value: string) {
  return stripBullet(stripMarkdown(value)).replace(/\s+/g, " ").trim();
}

function inferBenefits(blocks: BlockConfig[]) {
  const benefits = blocks
    .filter((block) => block.type === "markdown" && block.displayKind !== "title")
    .map((block) => stripMarkdown(block.title || firstContentLine(block.content)))
    .filter(Boolean);
  return Array.from(new Set(benefits)).slice(0, 4);
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
          readPayloadText(item.emoji),
          readPayloadText(item.title ?? item.label ?? item.name ?? item.text),
          readPayloadText(item.description ?? item.content),
        ].filter(Boolean).join(" ");
      }
      return "";
    })
    .filter(Boolean);
}

function workflowArchitectureSteps(diagram?: Record<string, unknown>) {
  if (!diagram || !Array.isArray(diagram.steps)) return [];
  return diagram.steps
    .map((item) => {
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
        return { label: String(item), detail: "" };
      }
      if (!isRecord(item)) return null;
      const label = readPayloadText(item.label ?? item.title ?? item.name);
      const detail = readPayloadText(item.detail ?? item.description ?? item.content);
      return label ? { label, detail } : null;
    })
    .filter((item): item is { label: string; detail: string } => Boolean(item))
    .filter(isSpecificWorkflowStep)
    .slice(0, 4);
}

function isSpecificWorkflowStep(step: { label: string; detail: string }) {
  const label = normalizeCopy(step.label).replace(/\s+/g, "");
  const combined = normalizeCopy(`${step.label} ${step.detail}`);
  const genericLabels = new Set([
    "목표",
    "준비",
    "개념",
    "스니펫",
    "실습",
    "실행",
    "검증",
    "완료",
    "패키지",
    "첫실행",
    "환경",
  ]);
  if (genericLabels.has(label)) return false;
  if (combined.length < 8) return false;
  return ![
    "무슨 공부",
    "설명과 팁",
    "따라 칠 코드",
    "입력과 검증",
    "YAML 계약",
    "uv 패키지",
    "assert와 결과 비교",
    "결과 확인",
  ].some((phrase) => combined.includes(phrase));
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
                    active && "bg-muted text-foreground ring-1 ring-border",
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
  const kind = classifyLearningCell(block, draft);
  const meta = learningCellCatalog[kind];
  const Icon = meta.Icon;
  const role = block.role ?? (block.type === "code" ? "snippet" : "explanation");
  const resultStatus = isRunning ? "running" : result?.status ?? "idle";
  const tone = curriculumCellTone(kind, role, block.displayKind);
  const bodyFirst = block.displayKind === "hero";
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

    if (block.displayKind === "callout") {
      return (
        <section
          id={cellDomId(block.id)}
          className={cn("group min-w-0", isSelected && "rounded-md ring-1 ring-ring/30")}
          onClick={onSelect}
        >
          <CurriculumMarkdownBody block={block} />
        </section>
      );
    }

    if (embedded) {
      return (
        <section
          id={cellDomId(block.id)}
          className={cn(
            "group min-w-0 px-4 py-4",
            isSelected && "bg-muted/20",
            tone.frame,
          )}
          onClick={onSelect}
        >
          <div className="mb-2 flex min-w-0 items-center gap-2">
            <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/70 text-muted-foreground", tone.icon)}>
              <Icon className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{blockLabel(block)}</span>
            <CellAiActions helpState={cellHelp} onAsk={onAsk} selected={isSelected} />
          </div>
          <CurriculumMarkdownBody block={block} hideRepeatedTitle />
        </section>
      );
    }

    return (
      <section
        id={cellDomId(block.id)}
        className={cn(
          "group min-w-0 overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm",
          isSelected && "bg-muted/20 ring-1 ring-ring/30",
          tone.frame,
        )}
      >
        <div className="min-w-0">
          {bodyFirst ? (
            <div className="flex items-center justify-end px-3 pt-3">
              <CellAiActions helpState={cellHelp} onAsk={onAsk} selected={isSelected} />
            </div>
          ) : (
            <div className="flex items-center gap-3 border-b bg-muted/20 px-3 py-2">
              <button className="flex min-w-0 flex-1 items-center gap-2 text-left" type="button" onClick={onSelect}>
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground", tone.icon)}>
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-semibold tracking-normal">{blockLabel(block)}</span>
                </span>
              </button>
              <CellAiActions helpState={cellHelp} onAsk={onAsk} selected={isSelected} />
            </div>
          )}
          <div className={cn("space-y-3 px-3 pb-3", bodyFirst ? "pt-2" : "pt-3")}>
            <CurriculumMarkdownBody block={block} hideRepeatedTitle={!bodyFirst} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={cellDomId(block.id)}
      className={cn(
        embedded ? "group min-w-0 text-card-foreground" : "group min-w-0 overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm",
        isSelected && (embedded ? "bg-muted/20" : "bg-muted/20 ring-1 ring-ring/30"),
        tone.frame,
      )}
    >
      <div className="min-w-0">
        <div className={cn("flex items-center gap-3", embedded ? "px-4 py-3" : "border-b bg-muted/20 px-3 py-2")}>
          <button className="flex min-w-0 flex-1 items-center gap-2 text-left" type="button" onClick={onSelect}>
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/70 text-muted-foreground", !embedded && "bg-background", tone.icon)}>
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-semibold tracking-normal">{blockLabel(block)}</span>
            </span>
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
        <div className={cn("space-y-3", embedded ? "px-4 pb-4" : "px-3 py-3")}>
          {isSnippetCode && block.description ? <SnippetPracticeIntro block={block} /> : null}
          {!isSnippetCode && block.guide ? <ExerciseBrief block={block} /> : null}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{isSnippetCode ? "Python 연습 코드" : "Python 코드"}</span>
            </div>
            <div
              aria-label={`${blockLabel(block)} 코드 편집기`}
              className={cn(
                "rounded-md border bg-code shadow-inner transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
                isSelected ? "border-ring ring-2 ring-ring/20" : "border-border hover:border-ring/60",
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
    <div className="border-l-2 border-violet-400/50 pl-3">
      <div className="space-y-2 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-300">
            <TerminalSquare className="size-3.5" />
          </span>
          <span>예제 스니펫</span>
        </div>
        {description ? <p className="text-sm leading-6 text-foreground">{description}</p> : null}
      </div>
      <div>
        <CodePayload value={block.content} />
      </div>
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
    <section className="px-1 py-2" id={cellDomId(block.id)}>
      <button
        aria-label={cleanTitle}
        className={cn(
          "w-full rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/20",
          isSelected && "bg-muted/20 ring-1 ring-ring/25",
        )}
        type="button"
        onClick={onSelect}
      >
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border/70" />
          <Badge className="bg-background/80 text-[11px]" variant="outline">섹션</Badge>
          <span className="h-px flex-1 bg-border/70" />
        </div>
        <div className="mt-2 min-w-0">
          <h2 className="text-xl font-semibold tracking-normal">{cleanTitle}</h2>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{stripMarkdown(subtitle)}</p> : null}
        </div>
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

function ExerciseBrief({ block }: { block: BlockConfig }) {
  if (!block.guide) return null;
  const description = specificPracticeCopy(block.guide.description);
  if (!description) return null;

  return (
    <div className="rounded-md border bg-muted/20 px-3 py-2.5">
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
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
