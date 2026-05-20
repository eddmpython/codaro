import {
  BookOpen,
  Boxes,
  CheckCircle2,
  Code2,
  GraduationCap,
  Layers3,
  Lightbulb,
  ListChecks,
  Loader2,
  MessageSquare,
  Package,
  Play,
  RefreshCw,
  Route,
  Sparkles,
  Target,
  TerminalSquare,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";

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
import { codaroApi } from "@/lib/api";
import {
  blockLabel,
  classifyLearningCell,
  executionKindLabel,
  stripBullet,
  stripMarkdown,
  type CellAiAction,
  type LearningCellKind,
} from "@/lib/cellModel";
import { difficultyLabel, statusLabel } from "@/lib/displayFormat";
import { cn } from "@/lib/utils";
import type { BlockConfig, CodaroDocument, ExecutionResult, PackageInfo } from "@/types";
import {
  CurriculumMarkdownBody,
  curriculumCellTone,
} from "./curriculumMarkdownBody";

type ResultMap = Record<string, ExecutionResult>;

type RenderCodeCellEditor = (args: {
  block: BlockConfig;
  draft: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onRun: () => void;
}) => ReactNode;

export function CurriculumView({
  apiOnline,
  canRun,
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
  onSelectBlock,
}: {
  apiOnline: boolean;
  canRun: boolean;
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
  onCellAsk: (action: CellAiAction, block: BlockConfig) => void;
  onDraftChange: (blockId: string, value: string) => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig) => void;
  onSelectBlock: (blockId: string) => void;
}) {
  const curriculumSections = useMemo(() => groupCurriculumSections(document.blocks), [document.blocks]);
  const introBlock = curriculumSections.introBlocks[0] ?? document.blocks.find((block) => block.displayKind === "hero" || block.sourceType === "intro");

  return (
    <ScrollArea className="h-full min-h-0 min-w-0">
      <div className="min-w-0 p-4">
        <div className="mx-auto min-w-0 max-w-5xl space-y-4">
          <LearningOverviewHeader
            apiOnline={apiOnline}
            document={document}
            introBlock={introBlock}
            pendingBlocks={pendingBlocks}
            referenceLoading={referenceLoading}
            selectedCategory={selectedCategory}
            selectedCategoryLabel={selectedCategoryLabel}
            selectedContentId={selectedContentId}
            selectedContentLabel={selectedContentLabel}
            onAcceptPendingBlocks={onAcceptPendingBlocks}
            onRejectPendingBlocks={onRejectPendingBlocks}
          />

          <div className="space-y-4">
            {curriculumSections.sections.map((section, index) => (
              <CurriculumSectionCard
                canRun={canRun}
                drafts={drafts}
                index={index}
                key={section.id}
                renderCodeCellEditor={renderCodeCellEditor}
                results={results}
                runningBlockId={runningBlockId}
                section={section}
                selectedBlockId={selectedBlockId}
                onCellAsk={onCellAsk}
                onDraftChange={onDraftChange}
                onRunBlock={onRunBlock}
                onSelectBlock={onSelectBlock}
              />
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
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
};

type StructuredSectionPart = "snippet" | "check";

function LearningOverviewHeader({
  apiOnline,
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
}: {
  apiOnline: boolean;
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
}) {
  const overview = curriculumOverview(document, introBlock);

  return (
    <header id={introBlock ? cellDomId(introBlock.id) : undefined} className="overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm">
      <div className="grid gap-4 p-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">커리큘럼</Badge>
            <Badge variant="outline">{selectedCategoryLabel || selectedCategory}</Badge>
            {selectedContentLabel || selectedContentId ? <Badge variant="outline">{selectedContentLabel || selectedContentId}</Badge> : null}
            {referenceLoading ? <LoadingInline label="레슨 불러오는 중" /> : null}
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal">{overview.title}</h1>
          {overview.direction ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{overview.direction}</p>
          ) : null}
          {overview.benefits.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {overview.benefits.slice(0, 4).map((benefit, index) => (
                <div className="flex min-w-0 items-start gap-2 rounded-md border bg-background/60 px-3 py-2 text-sm leading-5" key={`${benefit}-${index}`}>
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                  <span className="min-w-0 text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          ) : null}
          <CurriculumDependencyPanel apiOnline={apiOnline} document={document} />
        </div>
        <LearningFlowDiagram diagram={overview.diagram} />
      </div>
      <PendingNotebookBar
        pendingBlocks={pendingBlocks}
        onAccept={onAcceptPendingBlocks}
        onReject={onRejectPendingBlocks}
      />
    </header>
  );
}

function LearningFlowDiagram({ diagram }: { diagram?: Record<string, unknown> }) {
  const customSteps = diagramSteps(diagram);
  const fallbackSteps = [
    { label: "목표", detail: "무슨 공부", Icon: Route, tone: "text-sky-500" },
    { label: "개념", detail: "설명과 팁", Icon: BookOpen, tone: "text-amber-500" },
    { label: "스니펫", detail: "따라 칠 코드", Icon: Code2, tone: "text-emerald-500" },
    { label: "실행", detail: "입력과 검증", Icon: Play, tone: "text-rose-500" },
  ];
  const stepIcons = [Route, BookOpen, Code2, Play];
  const stepTones = ["text-sky-500", "text-amber-500", "text-emerald-500", "text-rose-500"];
  const steps = customSteps.length
    ? customSteps.map((step, index) => ({
      ...step,
      Icon: stepIcons[index % stepIcons.length],
      tone: stepTones[index % stepTones.length],
    }))
    : fallbackSteps;

  return (
    <div className="rounded-md border bg-background/70 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Boxes className="size-4 text-muted-foreground" />
          학습 아키텍처
        </div>
        <Badge className="gap-1" variant="outline">
          <Wrench className="size-3" />
          uv
        </Badge>
      </div>
      <div className="relative grid gap-2">
        {steps.map(({ Icon, detail, label, tone }, index) => (
          <div className="relative flex items-center gap-3 rounded-md border bg-card px-3 py-2" key={label}>
            {index < steps.length - 1 ? <span className="absolute left-[21px] top-[36px] h-4 w-px bg-border" /> : null}
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md bg-muted", tone)}>
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{label}</span>
              <span className="block truncate text-xs text-muted-foreground">{detail}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CurriculumDependencyPanel({ apiOnline, document }: { apiOnline: boolean; document: CodaroDocument }) {
  const requiredPackages = useMemo(() => inferRequiredPackages(document), [document]);
  const [installedPackages, setInstalledPackages] = useState<PackageInfo[]>([]);
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const installedNames = useMemo(() => new Set(installedPackages.map((item) => normalizePackageName(item.name))), [installedPackages]);
  const missingPackages = requiredPackages.filter((item) => !installedNames.has(normalizePackageName(item)));
  const activeMessage = installing
    ? `${installing} 패키지를 uv로 설치 중입니다. 처음 설치는 네트워크와 wheel 준비 때문에 시간이 걸릴 수 있습니다.`
    : checking
      ? "필요한 라이브러리 설치 상태를 확인 중입니다."
      : null;

  useEffect(() => {
    let cancelled = false;
    if (!requiredPackages.length || !apiOnline) {
      setInstalledPackages([]);
      setError(null);
      setLastMessage(null);
      return undefined;
    }

    async function refreshPackages() {
      setChecking(true);
      setError(null);
      try {
        const packages = await codaroApi.packagesList();
        if (!cancelled) setInstalledPackages(packages);
      } catch (refreshError) {
        if (!cancelled) setError(errorText(refreshError));
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void refreshPackages();
    return () => {
      cancelled = true;
    };
  }, [apiOnline, requiredPackages]);

  if (!requiredPackages.length) return null;

  const installMissing = async () => {
    setError(null);
    setLastMessage(null);
    for (const packageName of missingPackages) {
      setInstalling(packageName);
      try {
        const result = await codaroApi.packageInstall(packageName);
        setLastMessage(firstMessageLine(result.message) || `${packageName} 설치 완료`);
        if (!result.success) {
          setError(firstMessageLine(result.message) || `${packageName} 설치에 실패했습니다.`);
          break;
        }
      } catch (installError) {
        setError(errorText(installError));
        break;
      } finally {
        setInstalling(null);
      }
    }

    try {
      setChecking(true);
      setInstalledPackages(await codaroApi.packagesList());
    } catch (refreshError) {
      setError(errorText(refreshError));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mt-4 rounded-md border bg-background/60 px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">라이브러리</span>
          <span className="text-xs text-muted-foreground">uv로 준비</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {checking ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : null}
          <Button
            className="h-7 gap-1.5 px-2 text-xs"
            disabled={!apiOnline || !missingPackages.length || checking || Boolean(installing)}
            size="sm"
            type="button"
            variant="outline"
            onClick={installMissing}
          >
            {installing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            {apiOnline ? (installing ? `${installing} 설치 중` : missingPackages.length ? "누락 설치" : "준비됨") : "서버 필요"}
          </Button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {requiredPackages.map((packageName) => {
          const installed = installedNames.has(normalizePackageName(packageName));
          return (
            <Badge className="gap-1" key={packageName} variant={installed ? "secondary" : "outline"}>
              <span className={cn("size-1.5 rounded-full", installed ? "bg-emerald-500" : "bg-amber-500")} />
              {packageName}
            </Badge>
          );
        })}
      </div>
      {!apiOnline ? <div className="mt-2 text-xs leading-5 text-muted-foreground">서버 세션이 열리면 uv 설치를 실행할 수 있습니다.</div> : null}
      {activeMessage ? <div className="mt-2 text-xs leading-5 text-muted-foreground">{activeMessage}</div> : null}
      {error ? <div className="mt-2 text-xs leading-5 text-destructive">{error}</div> : null}
      {!activeMessage && !error && lastMessage ? <div className="mt-2 text-xs leading-5 text-muted-foreground">{lastMessage}</div> : null}
    </div>
  );
}

function CurriculumSectionCard({
  canRun,
  drafts,
  index,
  renderCodeCellEditor,
  results,
  runningBlockId,
  section,
  selectedBlockId,
  onCellAsk,
  onDraftChange,
  onRunBlock,
  onSelectBlock,
}: {
  canRun: boolean;
  drafts: Record<string, string>;
  index: number;
  renderCodeCellEditor: RenderCodeCellEditor;
  results: ResultMap;
  runningBlockId: string | null;
  section: CurriculumSectionGroup;
  selectedBlockId: string;
  onCellAsk: (action: CellAiAction, block: BlockConfig) => void;
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
        className="flex w-full min-w-0 items-start gap-3 border-b bg-muted/15 px-4 py-3 text-left"
        type="button"
        onClick={() => onSelectBlock(section.anchorBlockId)}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-sm font-semibold text-muted-foreground">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold tracking-normal">{section.title}</span>
          {section.subtitle ? <span className="mt-1 block text-sm leading-6 text-muted-foreground">{section.subtitle}</span> : null}
        </span>
        <Badge className="mt-1 gap-1" variant="outline">
          <Layers3 className="size-3" />
          섹션
        </Badge>
      </button>

      <SectionContractOverview contract={section.contract} />

      {structured ? (
        <StructuredSectionLearningBody
          canRun={canRun}
          drafts={drafts}
          renderCodeCellEditor={renderCodeCellEditor}
          results={results}
          runningBlockId={runningBlockId}
          section={section}
          selectedBlockId={selectedBlockId}
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
              draft={drafts[block.id] ?? curriculumInitialDraft(block)}
              isRunning={runningBlockId === block.id}
              isSelected={block.id === selectedBlockId}
              key={block.id}
              renderCodeCellEditor={renderCodeCellEditor}
              result={results[block.id]}
              variant="embedded"
              onAsk={(action) => onCellAsk(action, block)}
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
    direction: stripMarkdown(goal || description || "한 섹션씩 개념, 예제, 직접 입력, 실행 결과를 연결해 학습합니다."),
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

function SectionContractOverview({ contract }: { contract?: CurriculumSectionContract }) {
  if (!contract) return null;
  const goal = stripMarkdown(readPayloadText(contract.goal));
  const why = stripMarkdown(readPayloadText(contract.why));
  const explanation = stripMarkdown(readPayloadText(contract.explanation));
  const tips = payloadTextList(contract.tips).map(stripMarkdown).slice(0, 4);
  if (!goal && !why && !explanation && !tips.length) return null;

  return (
    <div className="border-b bg-background/35 px-4 py-3" data-learning-section-part="overview">
      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]">
        <div className="min-w-0 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {goal ? (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Target className="size-3.5" />
                  이번 섹션에서 공부할 것
                </div>
                <p className="mt-1 text-sm leading-6">{goal}</p>
              </div>
            ) : null}
            {why ? (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CheckCircle2 className="size-3.5" />
                  왜 유용한지
                </div>
                <p className="mt-1 text-sm leading-6">{why}</p>
              </div>
            ) : null}
          </div>
          {explanation ? (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <BookOpen className="size-3.5" />
                상세 설명
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{explanation}</p>
            </div>
          ) : null}
        </div>
        {tips.length ? (
          <div className="min-w-0 border-t pt-3 lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Lightbulb className="size-3.5" />
              팁
            </div>
            <div className="mt-2 space-y-1.5">
              {tips.map((tip, index) => (
                <div className="flex gap-2 text-xs leading-5 text-muted-foreground" key={`${tip}-${index}`}>
                  <span className="mt-2 size-1 rounded-full bg-muted-foreground/60" />
                  <span className="min-w-0">{stripBullet(tip)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StructuredSectionLearningBody({
  canRun,
  drafts,
  renderCodeCellEditor,
  results,
  runningBlockId,
  section,
  selectedBlockId,
  onCellAsk,
  onDraftChange,
  onRunBlock,
  onSelectBlock,
}: {
  canRun: boolean;
  drafts: Record<string, string>;
  renderCodeCellEditor: RenderCodeCellEditor;
  results: ResultMap;
  runningBlockId: string | null;
  section: CurriculumSectionGroup;
  selectedBlockId: string;
  onCellAsk: (action: CellAiAction, block: BlockConfig) => void;
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
          <CodePayload value={parts.snippet.content} />
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
                {exercise.guide ? <Badge variant="outline">{difficultyLabel(exercise.guide.difficulty)}</Badge> : null}
              </div>
              <h3 className="mt-1 text-base font-semibold tracking-normal">{blockLabel(exercise)}</h3>
              {exercise.guide?.description || exercise.description ? (
                <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {stripMarkdown(exercise.guide?.description || exercise.description || "")}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge variant={exerciseResult?.status === "error" ? "destructive" : "outline"}>
                {statusLabel(exerciseRunning ? "running" : exerciseResult?.status ?? "idle")}
              </Badge>
              <IconButton
                className="size-8"
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
              <CellAiActions onAsk={(action) => onCellAsk(action, exercise)} selected={exerciseSelected} />
            </div>
          </div>

          {exercise.guide?.hints?.length ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {exercise.guide.hints.slice(0, 4).map((hint, index) => (
                <div className="flex min-w-0 items-start gap-2 text-xs leading-5 text-muted-foreground" key={`${hint}-${index}`}>
                  <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                  <span className="min-w-0">{stripBullet(stripMarkdown(hint))}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>실습 입력 셀</span>
              <Badge className="hidden sm:inline-flex" variant="outline">Ctrl+Enter 실행</Badge>
            </div>
            {exerciseSelected ? renderCodeCellEditor({
              block: exercise,
              draft: exerciseDraft,
              onChange: (value) => onDraftChange(exercise.id, value),
              onFocus: () => onSelectBlock(exercise.id),
              onRun: () => onRunBlock(exercise),
            }) : (
              <LightweightCodePreview
                draft={exerciseDraft}
                placeholder="클릭해서 직접 입력하세요."
                onSelect={() => onSelectBlock(exercise.id)}
              />
            )}
          </div>

          <div className="mt-3" data-learning-section-part="result">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <CheckCircle2 className="size-3.5" />
              실행 결과
            </div>
            {exerciseResult ? (
              <ExecutionOutput result={exerciseResult} />
            ) : exerciseRunning ? (
              <LoadingInline label="셀 실행 중" />
            ) : (
              <div className="rounded-md border border-dashed bg-background/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
                셀을 실행하면 결과와 오류가 여기에 표시됩니다.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {parts.check ? (
        <StructuredSectionBand
          icon={<CheckCircle2 className="size-3.5" />}
          label="검증/피드백"
          part="check"
          title={blockLabel(parts.check)}
        >
          <CurriculumMarkdownBody block={parts.check} />
        </StructuredSectionBand>
      ) : null}

      {parts.extraBlocks.length ? (
        <div className="divide-y">
          {parts.extraBlocks.map((block) => (
            <CurriculumLearningCell
              block={block}
              canRun={canRun}
              draft={drafts[block.id] ?? curriculumInitialDraft(block)}
              isRunning={runningBlockId === block.id}
              isSelected={block.id === selectedBlockId}
              key={block.id}
              renderCodeCellEditor={renderCodeCellEditor}
              result={results[block.id]}
              variant="embedded"
              onAsk={(action) => onCellAsk(action, block)}
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
      <div className="mb-3 min-w-0">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        {title ? <h3 className="mt-1 text-base font-semibold tracking-normal">{title}</h3> : null}
        {detail ? <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{stripMarkdown(detail)}</p> : null}
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

function inferRequiredPackages(document: CodaroDocument) {
  const packages = new Set<string>((document.runtime?.packages ?? []).map(String).filter(Boolean));
  for (const block of document.blocks) {
    if (block.type !== "code") continue;
    for (const match of block.content.matchAll(/^\s*(?:import|from)\s+([A-Za-z_][\w.]*)/gm)) {
      const packageName = importPackageName(match[1]?.split(".")[0] ?? "");
      if (packageName) packages.add(packageName);
    }
  }
  return Array.from(packages).sort((left, right) => left.localeCompare(right));
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

function diagramSteps(diagram?: Record<string, unknown>) {
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
    .slice(0, 5);
}

function readSectionContract(value: unknown): CurriculumSectionContract | undefined {
  return isRecord(value) ? value as CurriculumSectionContract : undefined;
}

function importPackageName(moduleName: string) {
  const normalized = moduleName.trim();
  if (!normalized || PYTHON_STDLIB_MODULES.has(normalized)) return "";
  return PACKAGE_ALIASES[normalized] ?? normalized;
}

const PACKAGE_ALIASES: Record<string, string> = {
  PIL: "pillow",
  cv2: "opencv-python",
  matplotlib: "matplotlib",
  numpy: "numpy",
  pandas: "pandas",
  sklearn: "scikit-learn",
  yaml: "pyyaml",
};

const PYTHON_STDLIB_MODULES = new Set([
  "__future__",
  "argparse",
  "asyncio",
  "base64",
  "collections",
  "contextlib",
  "csv",
  "dataclasses",
  "datetime",
  "decimal",
  "functools",
  "glob",
  "itertools",
  "json",
  "math",
  "os",
  "pathlib",
  "random",
  "re",
  "statistics",
  "string",
  "subprocess",
  "sys",
  "textwrap",
  "time",
  "typing",
  "urllib",
  "uuid",
]);

function normalizePackageName(value: string) {
  return value.toLowerCase().replace(/_/g, "-");
}

function firstMessageLine(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? "";
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : String(error);
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
    <aside className="group/toc relative hidden h-full min-h-0 border-l bg-background/95 2xl:block" aria-label="셀 목차">
      <div className="flex h-full min-h-0 w-11 flex-col items-center gap-2 py-3">
        <div className="flex size-7 items-center justify-center rounded-md border bg-card text-muted-foreground">
          <ListChecks className="size-3.5" />
        </div>
        <ScrollArea className="min-h-0 w-full flex-1">
          <div className="flex flex-col items-center gap-1 py-1">
            {items.map(({ block, label, meta }) => {
              const Icon = meta.Icon;
              const active = block.id === selectedBlockId;
              return (
                <button
                  aria-label={label}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-muted text-foreground ring-1 ring-border",
                  )}
                  key={block.id}
                  title={label}
                  type="button"
                  onClick={() => selectTocBlock(block.id, onSelectBlock)}
                >
                  <Icon className="size-3.5" />
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="pointer-events-none absolute right-full top-0 z-40 h-full w-72 -translate-x-2 border-r bg-background/98 opacity-0 shadow-xl shadow-background/40 transition duration-150 group-hover/toc:pointer-events-auto group-hover/toc:translate-x-0 group-hover/toc:opacity-100">
        <div className="border-b px-3 py-3">
          <div className="text-sm font-semibold tracking-normal">셀 목차</div>
          <div className="mt-1 text-xs leading-5 text-muted-foreground">마우스를 올려 현재 레슨의 셀로 이동합니다.</div>
        </div>
        <ScrollArea className="h-[calc(100%-57px)] min-h-0">
          <div className="space-y-0.5 p-1.5">
            {items.map(({ block, label, meta }) => {
              const Icon = meta.Icon;
              const active = block.id === selectedBlockId;
              return (
                <button
                  className={cn(
                    "flex h-7 w-full min-w-0 items-center gap-2 rounded-md px-2 text-left text-xs transition-colors hover:bg-muted/60",
                    active && "bg-muted text-foreground ring-1 ring-border",
                  )}
                  key={block.id}
                  title={label}
                  type="button"
                  onClick={() => selectTocBlock(block.id, onSelectBlock)}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-background text-muted-foreground">
                    <Icon className="size-3" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
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
  draft: string;
  isRunning: boolean;
  isSelected: boolean;
  renderCodeCellEditor: RenderCodeCellEditor;
  result?: ExecutionResult;
  variant?: "standalone" | "embedded";
  onAsk: (action: CellAiAction) => void;
  onDraftChange: (value: string) => void;
  onRun: () => void;
  onSelect: () => void;
}) {
  const kind = classifyLearningCell(block, draft);
  const meta = learningCellCatalog[kind];
  const Icon = meta.Icon;
  const role = block.role ?? (block.type === "code" ? "snippet" : "explanation");
  const resultStatus = isRunning ? "running" : result?.status ?? "idle";
  const lineCount = block.type === "code" ? draft.split("\n").filter((line) => line.trim()).length : 0;
  const tone = curriculumCellTone(kind, role, block.displayKind);
  const typeMeta = curriculumTypeMeta(block, kind);
  const TypeIcon = typeMeta.Icon;
  const bodyFirst = block.displayKind === "hero";
  const isSnippetCode = block.type === "code" && role === "snippet";
  const embedded = variant === "embedded";

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
            <Badge className="gap-1 bg-background/80" variant="outline">
              <TypeIcon className="size-3" />
              {typeMeta.label}
            </Badge>
            <CellAiActions onAsk={onAsk} selected={isSelected} />
          </div>
          <CurriculumMarkdownBody block={block} />
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
            <div className="flex items-center justify-end gap-2 px-3 pt-3">
          <Badge className="gap-1 bg-background/80" variant="outline">
            <TypeIcon className="size-3" />
            {typeMeta.label}
              </Badge>
              <CellAiActions onAsk={onAsk} selected={isSelected} />
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
              <Badge className="gap-1 bg-background/80" variant="outline">
                <TypeIcon className="size-3" />
                {typeMeta.label}
              </Badge>
              <CellAiActions onAsk={onAsk} selected={isSelected} />
            </div>
          )}
          <div className={cn("space-y-3 px-3 pb-3", bodyFirst ? "pt-2" : "pt-3")}>
            <CurriculumMarkdownBody block={block} />
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
          <Badge className="gap-1" variant="outline">
            <TypeIcon className="size-3" />
            {typeMeta.label}
          </Badge>
          <Badge variant={resultStatus === "error" ? "destructive" : "outline"}>{statusLabel(resultStatus)}</Badge>
          <IconButton
            className="size-7"
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
          <CellAiActions onAsk={onAsk} selected={isSelected} />
        </div>
        <div className={cn("space-y-3", embedded ? "px-4 pb-4" : "px-3 py-3")}>
          {isSnippetCode ? <SnippetPracticeIntro block={block} /> : null}
          {!isSnippetCode && block.guide ? <ExerciseBrief block={block} lineCount={lineCount} /> : null}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{isSnippetCode ? "연습 입력" : "코드 입력"}</span>
              <span className="flex items-center gap-1.5">
                <Badge className="hidden sm:inline-flex" variant="outline">Ctrl+Enter 실행</Badge>
                {isSnippetCode && !draft.trim() ? <Badge variant="outline">직접 입력</Badge> : null}
              </span>
            </div>
            {isSelected ? renderCodeCellEditor({
              block,
              draft,
              onChange: onDraftChange,
              onFocus: onSelect,
              onRun,
            }) : (
              <LightweightCodePreview
                draft={draft}
                placeholder={isSnippetCode ? "클릭해서 직접 입력하세요." : "클릭해서 코드를 편집하세요."}
                onSelect={onSelect}
              />
            )}
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
    <div className="border-l-2 border-emerald-400/40 pl-3">
      <div className="space-y-2 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <TerminalSquare className="size-3.5" />
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

function LightweightCodePreview({
  draft,
  placeholder,
  onSelect,
}: {
  draft: string;
  placeholder: string;
  onSelect: () => void;
}) {
  const preview = draft.trim() || placeholder;
  return (
    <button
      className="block w-full rounded-md bg-code px-3 py-2 text-left font-mono text-xs leading-5 text-code-foreground transition-colors hover:ring-1 hover:ring-ring/35"
      type="button"
      onClick={onSelect}
    >
      <pre className={cn("max-h-24 overflow-hidden whitespace-pre-wrap", !draft.trim() && "text-muted-foreground")}>{preview}</pre>
    </button>
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

function ExerciseBrief({ block, lineCount }: { block: BlockConfig; lineCount: number }) {
  if (!block.guide) return null;
  const hints = block.guide.hints ?? [];
  return (
    <div className="border-l-2 border-emerald-400/40 pl-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-normal">실습</div>
          {block.guide.description ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{stripMarkdown(block.guide.description)}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant="outline">{difficultyLabel(block.guide.difficulty)}</Badge>
          <Badge variant="outline">{lineCount}줄</Badge>
        </div>
      </div>
      {hints.length ? (
        <div className="mt-3 grid gap-1.5">
          {hints.slice(0, 3).map((hint, index) => (
            <div className="flex gap-2 text-xs leading-5 text-muted-foreground" key={`${hint}-${index}`}>
              <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
              <span>{stripBullet(hint)}</span>
            </div>
          ))}
        </div>
      ) : null}
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
