import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code2,
  ExternalLink,
  FileText,
  ImageIcon,
  LinkIcon,
  Lightbulb,
  ListChecks,
  MonitorPlay,
  PanelTop,
  PlayCircle,
  Route,
  Sparkles,
  Target,
  TerminalSquare,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  blockLabel,
  stripMarkdown,
  type LearningCellKind,
} from "@/lib/cellModel";
import { cn } from "@/lib/utils";
import type { BlockConfig } from "@/types";
import type { ReactNode } from "react";

export function CurriculumMarkdownBody({ block, hideRepeatedTitle = false }: { block: BlockConfig; hideRepeatedTitle?: boolean }) {
  const payload = payloadMap(block.payload);
  const displayKind = block.displayKind ?? "prose";
  const repeatedTitle = hideRepeatedTitle ? blockLabel(block) : "";
  const leadHidden = (title: string) => shouldHideRepeatedTitle(title, repeatedTitle);

  if (displayKind === "title") {
    const title = payloadText(payload, "title") || block.title || blockLabel(block);
    const subtitle = payloadText(payload, "subtitle") || block.description;
    return (
      <div className="rounded-md border bg-background px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Target className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-normal">{stripMarkdown(title)}</h2>
            {subtitle ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{stripMarkdown(subtitle)}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  if (displayKind === "hero") {
    if (block.sourceType === "localRunner") return <LocalRunnerHero block={block} payload={payload} />;
    if (block.sourceType === "tiobeIndex") return <RankInsightHero block={block} payload={payload} />;

    const title = payloadText(payload, "title") || block.title || blockLabel(block);
    const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "goal");
    const description = payloadText(payload, "description");
    const points = payloadItems(payload, "points");
    return (
      <div className="space-y-3">
        <div className="rounded-md border bg-background px-4 py-4">
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">{stripMarkdown(title)}</h2>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-foreground">{stripMarkdown(subtitle)}</p> : null}
          {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{stripMarkdown(description)}</p> : null}
        </div>
        {points.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {points.slice(0, 6).map((point, index) => (
              <LearningValuePanel key={`${point.title}-${index}`} index={index + 1} item={point} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (displayKind === "resource") return <ResourceCardsCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;

  if (displayKind === "cardGrid") {
    if (block.sourceType === "choiceCards") return <ChoiceCardsCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;
    if (block.sourceType === "resourceCards") return <ResourceCardsCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;

    const primaryKey = "cards";
    const cards = payloadItems(payload, primaryKey).length
      ? payloadItems(payload, primaryKey)
      : payloadItems(payload, "links");
    const title = payloadText(payload, "title") || block.title || blockLabel(block);
    const subtitle = payloadText(payload, "subtitle");
    return (
      <div className="space-y-3">
        <LearningSectionLead hideTitle={leadHidden(title)} title={title} subtitle={subtitle || block.description} />
        <div className="grid gap-2 md:grid-cols-2">
          {cards.length ? cards.map((card, index) => (
            <LearningValuePanel key={`${card.title}-${index}`} index={index + 1} item={card} />
          )) : <MarkdownBlock content={block.content} dedupeTitle={repeatedTitle} />}
        </div>
      </div>
    );
  }

  if (displayKind === "comparison") {
    const cards = payloadItems(payload, "cards");
    const left = payloadMap(payload.left);
    const right = payloadMap(payload.right);
    const title = payloadText(payload, "title") || block.title || "비교";
    return (
      <div className="space-y-3">
        <LearningSectionLead hideTitle={leadHidden(title)} title={title} subtitle={payloadText(payload, "subtitle")} />
        {cards.length ? (
          <ComparisonGrid cards={cards} />
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            <ComparisonPanel item={left} fallback="왼쪽" index={1} />
            <ComparisonPanel item={right} fallback="오른쪽" index={2} />
          </div>
        )}
      </div>
    );
  }

  if (displayKind === "table") {
    const rows = payloadItems(payload, "rows");
    const title = payloadText(payload, "title") || block.title || "표";
    return (
      <div className="space-y-3">
        <LearningSectionLead hideTitle={leadHidden(title)} title={title} subtitle={payloadText(payload, "subtitle")} />
        <LearningTable rows={rows} fallback={block.content} />
      </div>
    );
  }

  if (displayKind === "media") {
    return <MediaCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;
  }

  if (displayKind === "callout") {
    return <CalloutCell block={block} payload={payload} />;
  }

  if (block.sourceType === "list") {
    const items = dedupeRepeatedItems(block.content
      .split("\n")
      .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim())
      .filter(Boolean), repeatedTitle);
    return (
      <div className="grid gap-2">
        {items.map((item, index) => (
          <div className="flex gap-2 rounded-md border bg-background px-3 py-2 text-sm leading-6" key={`${item}-${index}`}>
            <CheckCircle2 className="mt-1 size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">{stripMarkdown(item)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (displayKind === "prose") {
    return <ProseLearningCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;
  }

  if (displayKind === "quiz") {
    const question = payloadText(payload, "question") || block.title || "문제";
    const options = payloadTextList(payload.options);
    return (
      <div className="space-y-3">
        <div className="rounded-md border bg-background px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <ListChecks className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-medium uppercase text-muted-foreground">검증</div>
              <div className="mt-1 text-base font-semibold">{stripMarkdown(question)}</div>
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          {options.map((option, index) => (
            <div className="flex gap-2 rounded-md border bg-background px-3 py-2 text-sm" key={`${option}-${index}`}>
              <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-muted text-xs">{index + 1}</span>
              <span>{stripMarkdown(option)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (displayKind === "practice") {
    if (block.sourceType === "stepCard") return <StepPracticeCell block={block} payload={payload} />;
    if (block.sourceType === "practiceCard") return <PracticePromptCell block={block} payload={payload} />;

    const items = payloadItems(payload, "items");
    const title = payloadText(payload, "title") || block.title || "실습";
    return (
      <div className="space-y-3">
        <LearningSectionLead
          hideTitle={leadHidden(title)}
          title={title}
          subtitle={payloadText(payload, "description") || payloadText(payload, "content") || block.description}
        />
        {items.length ? (
          <div className="grid gap-2">
            {items.map((item, index) => <LearningValuePanel key={`${item.title}-${index}`} index={index + 1} item={item} />)}
          </div>
        ) : <MarkdownBlock content={block.content} dedupeTitle={repeatedTitle} />}
      </div>
    );
  }

  if (displayKind === "centerText") {
    const centerContent = payloadText(payload, "content") || block.content;
    return (
      <div className="rounded-md border bg-background px-5 py-6 text-center">
        <div className="mx-auto max-w-2xl">
          <MarkdownBlock content={centerContent} />
        </div>
      </div>
    );
  }

  if (displayKind === "conceptRow") {
    return <ConceptRowCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;
  }

  if (displayKind === "doDont") {
    return <DoDontCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;
  }

  if (displayKind === "definition") {
    return <DefinitionCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;
  }

  if (displayKind === "misconception") {
    return <MisconceptionCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;
  }

  if (displayKind === "timeline") {
    return <TimelineCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;
  }

  if (displayKind === "stat") {
    return <StatCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;
  }

  if (displayKind === "codeCompare") {
    return <CodeCompareCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;
  }

  if (displayKind === "anatomy") {
    return <AnatomyCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;
  }

  if (displayKind === "terminal") {
    return <TerminalCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;
  }

  if (displayKind === "annotatedCode") {
    return <AnnotatedCodeCell block={block} payload={payload} repeatedTitle={repeatedTitle} />;
  }

  return (
    <div className="space-y-3">
      {block.description ? (
        <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm leading-6 text-muted-foreground">
          {block.description}
        </div>
      ) : null}
      <MarkdownBlock content={block.content} dedupeTitle={repeatedTitle} />
    </div>
  );
}

export function curriculumCellTone(_kind: LearningCellKind, _role?: BlockConfig["role"], _displayKind?: BlockConfig["displayKind"]) {
  return { frame: "", icon: "" };
}

function LocalRunnerHero({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const title = payloadText(payload, "title") || block.title || "실행 셀";
  const description = payloadText(payload, "description") || "Python 셀을 실행하고 결과를 확인하는 학습 단계입니다.";
  const steps = [
    { title: "코드 작성", detail: "아래 실행 셀에서 값을 바꿔봅니다.", Icon: Code2 },
    { title: "실행", detail: "결과와 변수 변화를 바로 확인합니다.", Icon: TerminalSquare },
    { title: "질문", detail: "막히면 셀 단위로 Codaro에게 요청합니다.", Icon: Sparkles },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-background px-4 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <TerminalSquare className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold tracking-normal">{stripMarkdown(title)}</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{stripMarkdown(description)}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {steps.map(({ Icon, title: stepTitle, detail }) => (
          <div className="rounded-md border bg-background px-3 py-3" key={stepTitle}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Icon className="size-4 text-muted-foreground" />
              {stepTitle}
            </div>
            <div className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankInsightHero({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const title = payloadText(payload, "title") || block.title || "학습 지표";
  const description = payloadText(payload, "description") || payloadText(payload, "subtitle");
  const points = payloadItems(payload, "points").length ? payloadItems(payload, "points") : payloadTextList(payload.points).map((item) => ({ title: item }));

  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-background px-4 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <PanelTop className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold tracking-normal">{stripMarkdown(title)}</div>
            {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{stripMarkdown(description)}</p> : null}
          </div>
        </div>
      </div>
      {points.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {points.slice(0, 6).map((point, index) => <LearningValuePanel index={index + 1} item={point} key={`${payloadText(point, "title")}-${index}`} />)}
        </div>
      ) : null}
    </div>
  );
}

function ProseLearningCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const title = payloadText(payload, "title") || block.title || "";
  const subtitle = payloadText(payload, "subtitle") || block.description;
  const content = payloadText(payload, "content") || payloadText(payload, "text") || block.content;
  const showTitle = title && stripMarkdown(title) !== stripMarkdown(blockLabel(block));

  return (
    <div className="space-y-3">
      {showTitle || subtitle ? (
        <div className="flex min-w-0 items-start gap-3 rounded-md border bg-background px-4 py-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <BookOpen className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            {showTitle ? <div className="text-base font-semibold tracking-normal">{stripMarkdown(title)}</div> : null}
            {subtitle ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{stripMarkdown(subtitle)}</p> : null}
          </div>
        </div>
      ) : null}
      <div className="rounded-md border bg-background px-4 py-3">
        <MarkdownBlock content={content} dedupeTitle={repeatedTitle} />
      </div>
    </div>
  );
}

function ChoiceCardsCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const title = payloadText(payload, "title") || block.title || "선택지";
  const subtitle = payloadText(payload, "subtitle") || block.description;
  const cards = payloadItems(payload, "cards");

  return (
    <div className="space-y-3">
      <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={subtitle} />
      <div className="grid gap-2 lg:grid-cols-2">
        {cards.length ? cards.map((card, index) => (
          <ChoiceOptionCard item={card} index={index + 1} key={`${payloadText(card, "title")}-${index}`} />
        )) : <MarkdownBlock content={block.content} dedupeTitle={repeatedTitle} />}
      </div>
    </div>
  );
}

function ChoiceOptionCard({ item, index }: { item: Record<string, unknown>; index: number }) {
  const title = payloadText(item, "title") || payloadText(item, "text") || `선택 ${index}`;
  const subtitle = payloadText(item, "subtitle") || payloadText(item, "choiceType");
  const description = payloadText(item, "description") || payloadText(item, "content");
  const advantages = payloadItems(item, "advantages");
  const disadvantages = payloadItems(item, "disadvantages");
  const useCases = payloadItems(item, "useCases").length ? payloadItems(item, "useCases") : payloadItems(item, "items");

  return (
    <div className="min-w-0 rounded-md border bg-background px-3 py-3">
      <div className="flex min-w-0 items-start gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-5">{stripMarkdown(title)}</div>
          {subtitle ? <div className="mt-0.5 text-xs text-muted-foreground">{stripMarkdown(subtitle)}</div> : null}
        </div>
      </div>
      {description ? <p className="mt-3 text-xs leading-5 text-muted-foreground">{stripMarkdown(description)}</p> : null}
      <DetailList items={advantages} label="장점" tone="good" />
      <DetailList items={disadvantages} label="주의" tone="warn" />
      <DetailList items={useCases} label="쓸 때" tone="default" />
    </div>
  );
}

function ResourceCardsCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const title = payloadText(payload, "title") || block.title || "참고 자료";
  const subtitle = payloadText(payload, "subtitle") || block.description;
  const resources = payloadItems(payload, "cards").length
    ? payloadItems(payload, "cards")
    : payloadItems(payload, "links");

  return (
    <div className="space-y-3">
      <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={subtitle} />
      <div className="grid gap-2 md:grid-cols-2">
        {resources.length ? resources.map((resource, index) => (
          <ResourceCard item={resource} index={index + 1} key={`${payloadText(resource, "title")}-${index}`} />
        )) : <MarkdownBlock content={block.content} dedupeTitle={repeatedTitle} />}
      </div>
    </div>
  );
}

function ResourceCard({ item, index }: { item: Record<string, unknown>; index: number }) {
  const title = payloadText(item, "title") || payloadText(item, "text") || payloadText(item, "label") || payloadText(item, "name") || `자료 ${index}`;
  const description = payloadText(item, "description") || payloadText(item, "content") || payloadText(item, "subtitle");
  const url = payloadText(item, "url") || payloadText(item, "href") || payloadText(item, "buttonLink") || payloadText(item, "src");
  const stats = payloadItems(item, "stats");

  return (
    <div className="min-w-0 rounded-md border bg-background px-3 py-3">
      <div className="flex min-w-0 items-start gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <LinkIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-5">{stripMarkdown(title)}</div>
          {description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{stripMarkdown(description)}</p> : null}
        </div>
      </div>
      {stats.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {stats.map((stat, statIndex) => (
            <span className="inline-flex max-w-full items-center gap-1 rounded-md border bg-muted/20 px-2 py-1 text-[11px] text-muted-foreground" key={`${payloadText(stat, "title")}-${statIndex}`}>
              <BadgeCheck className="size-3 shrink-0" />
              <span className="truncate">{stripMarkdown(payloadText(stat, "title") || payloadText(stat, "label") || payloadText(stat, "description") || "정보")}</span>
            </span>
          ))}
        </div>
      ) : null}
      {url ? <InlineLink url={url} label={payloadText(item, "buttonText") || "자료 열기"} /> : null}
    </div>
  );
}

const CALLOUT_TONES: Record<string, { frame: string; Icon: typeof FileText }> = {
  warning: { frame: "border-border border-l-amber-500/70 bg-background text-foreground", Icon: ListChecks },
  danger: { frame: "border-border border-l-rose-500/70 bg-background text-foreground", Icon: TriangleAlert },
  tip: { frame: "border-border bg-background text-foreground", Icon: Lightbulb },
  success: { frame: "border-border border-l-emerald-500/70 bg-background text-foreground", Icon: CheckCircle2 },
  example: { frame: "border-border bg-background text-foreground", Icon: BookOpen },
  summary: { frame: "border-border bg-background text-foreground", Icon: ListChecks },
  note: { frame: "border-border bg-background text-foreground", Icon: FileText },
};

function CalloutCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const styleTone = payloadText(payload, "style");
  const tone = payloadText(payload, "tone") || (block.sourceType && block.sourceType !== "note" ? block.sourceType : styleTone) || block.sourceType || "note";
  const title = payloadText(payload, "title") || block.title || blockTypeLabel(tone);
  const content = payloadText(payload, "content") || block.content;
  const points = payloadTextList(payload.points).length ? payloadTextList(payload.points) : payloadTextList(payload.items);
  const resolved = CALLOUT_TONES[tone] ?? (block.role === "check" ? CALLOUT_TONES.warning : CALLOUT_TONES.note);
  const { frame, Icon } = resolved;

  return (
    <div className={cn("rounded-md border px-4 py-3", frame)}>
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold tracking-normal text-foreground">{stripMarkdown(title)}</div>
          {content ? <div className="mt-1 text-sm leading-6 text-muted-foreground">{renderInline(content)}</div> : null}
          {points.length ? (
            <div className="mt-2 space-y-1.5">
              {points.map((point, index) => (
                <div className="flex gap-2 text-sm leading-6 text-muted-foreground" key={`${point}-${index}`}>
                  <CheckCircle2 className="mt-1 size-3.5 shrink-0 text-current opacity-70" />
                  <span>{renderInline(point)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StepPracticeCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const title = payloadText(payload, "title") || block.title || "단계";
  const description = payloadText(payload, "description") || payloadText(payload, "content") || block.description;
  const stepNumber = payloadText(payload, "stepNumber");
  const tips = payloadTextList(payload.tips);
  const imageUrl = payloadText(payload, "imageUrl") || payloadText(payload, "image");
  const videoUrl = payloadText(payload, "videoUrl") || payloadText(payload, "video");
  const code = payloadText(payload, "code");
  const buttonText = payloadText(payload, "buttonText");
  const buttonLink = payloadText(payload, "buttonLink") || payloadText(payload, "url") || payloadText(payload, "href");

  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-background px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-md bg-muted px-2 text-xs font-semibold text-muted-foreground">
            {stepNumber || "STEP"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold tracking-normal">{stripMarkdown(title)}</div>
            {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{stripMarkdown(description)}</p> : null}
          </div>
        </div>
      </div>

      {imageUrl ? <VisualAsset src={imageUrl} title={title} /> : null}
      {!imageUrl && videoUrl ? <VisualAsset src={videoUrl} title={title} /> : null}

      {code ? (
        <div className="rounded-md border bg-code">
          <div className="flex items-center gap-1.5 px-3 pt-2 text-[10px] font-medium uppercase text-muted-foreground">
            <Code2 className="size-3" />
            실행 명령
          </div>
          <ScrollableCode code={code} />
        </div>
      ) : null}

      {tips.length ? (
        <div className="grid gap-2">
          {tips.map((tip, index) => (
            <div className="flex gap-2 rounded-md border bg-background px-3 py-2 text-sm leading-6" key={`${tip}-${index}`}>
              <CheckCircle2 className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">{stripMarkdown(tip)}</span>
            </div>
          ))}
        </div>
      ) : null}

      {buttonText && buttonLink ? <InlineLink url={buttonLink} label={buttonText} /> : null}
      {buttonText && !buttonLink ? (
        <div className="inline-flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground">
          <ExternalLink className="size-3.5" />
          {stripMarkdown(buttonText)}
        </div>
      ) : null}
    </div>
  );
}

function PracticePromptCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const title = payloadText(payload, "title") || block.title || "실습";
  const content = payloadText(payload, "content") || payloadText(payload, "description") || block.content;
  const code = payloadText(payload, "code");
  const footer = payloadMap(payload.footer);
  const footerText = payloadText(footer, "text");

  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-background px-4 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <PlayCircle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold tracking-normal">{stripMarkdown(title)}</div>
            {content ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{stripMarkdown(content)}</p> : null}
          </div>
        </div>
      </div>
      {code ? (
        <div className="rounded-md border bg-code">
          <div className="flex items-center gap-1.5 px-3 pt-2 text-[10px] font-medium uppercase text-muted-foreground">
            <Code2 className="size-3" />
            실습 예시
          </div>
          <ScrollableCode code={code} />
        </div>
      ) : null}
      {footerText ? (
        <div className="flex gap-2 rounded-md border bg-background px-3 py-2 text-sm leading-6 text-muted-foreground">
          <Sparkles className="mt-1 size-4 shrink-0 text-muted-foreground" />
          <span>{stripMarkdown(footerText)}</span>
        </div>
      ) : null}
    </div>
  );
}

function LearningSectionLead({ hideTitle = false, title, subtitle }: { hideTitle?: boolean; title: string; subtitle?: string }) {
  if (hideTitle && !subtitle) return null;

  return (
    <div className="min-w-0">
      {!hideTitle ? <div className="text-base font-semibold leading-6 tracking-normal">{stripMarkdown(title)}</div> : null}
      {subtitle ? <p className={cn("text-sm leading-6 text-muted-foreground", !hideTitle && "mt-1")}>{stripMarkdown(subtitle)}</p> : null}
    </div>
  );
}

function LearningValuePanel({ index: _index, item }: { index: number; item: Record<string, unknown> }) {
  const title = payloadText(item, "title") || payloadText(item, "text") || payloadText(item, "label") || payloadText(item, "name") || payloadText(item, "url") || "항목";
  const description = payloadText(item, "description") || payloadText(item, "content") || payloadText(item, "subtitle");
  const points = payloadTextList(item.points).length
    ? payloadTextList(item.points)
    : payloadTextList(item.tips).length
      ? payloadTextList(item.tips)
      : payloadTextList(item.items);
  const code = payloadText(item, "code");
  const youtube = payloadText(item, "youtube") || payloadText(item, "youtubeId");
  const url = payloadText(item, "url") || payloadText(item, "href") || payloadText(item, "buttonLink") || payloadText(item, "src") || youtubeUrl(youtube);
  const footer = payloadMap(item.footer);
  const footerText = payloadText(footer, "text");
  const stats = payloadItems(item, "stats");
  const advantages = payloadItems(item, "advantages");
  const disadvantages = payloadItems(item, "disadvantages");
  const PanelIcon = code ? Code2 : url ? ExternalLink : points.length ? Route : BookOpen;

  return (
    <div className="min-w-0 rounded-md border bg-background px-3 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <PanelIcon className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1 text-sm font-medium leading-5">{stripMarkdown(title)}</div>
        {url ? <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" /> : null}
      </div>
      {description ? <div className="mt-2 text-xs leading-5 text-muted-foreground">{stripMarkdown(description)}</div> : null}
      {points.length ? (
        <div className="mt-3 space-y-1.5">
          {points.slice(0, 5).map((point, pointIndex) => (
            <div className="flex gap-2 text-xs leading-5 text-muted-foreground" key={`${point}-${pointIndex}`}>
              <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
              <span>{stripMarkdown(point)}</span>
            </div>
          ))}
        </div>
      ) : null}
      <DetailList items={advantages} label="장점" tone="good" />
      <DetailList items={disadvantages} label="주의" tone="warn" />
      {stats.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {stats.map((stat, statIndex) => (
            <span className="inline-flex max-w-full items-center gap-1 rounded-md border bg-muted/20 px-2 py-1 text-[11px] text-muted-foreground" key={`${payloadText(stat, "title")}-${statIndex}`}>
              <BadgeCheck className="size-3 shrink-0" />
              <span className="truncate">{stripMarkdown(payloadText(stat, "title") || payloadText(stat, "label") || payloadText(stat, "description") || "정보")}</span>
            </span>
          ))}
        </div>
      ) : null}
      {code ? (
        <div className="mt-3 rounded-md bg-code">
          <div className="flex items-center gap-1.5 px-3 pt-2 text-[10px] font-medium uppercase text-muted-foreground">
            <Code2 className="size-3" />
            코드
          </div>
          <ScrollableCode code={code} />
        </div>
      ) : null}
      {footerText ? <div className="mt-3 rounded-md bg-muted/30 px-2 py-1.5 text-xs leading-5 text-muted-foreground">{stripMarkdown(footerText)}</div> : null}
      {url ? <InlineLink url={url} label={payloadText(item, "buttonText") || "자료 열기"} /> : null}
    </div>
  );
}

// 수평 설명카드 — 한 행 = 개념(좌) ↔ 비유/예시 + 선택 이미지(우). 공간 인접·듀얼코딩.
function ConceptRowCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const rows = payloadItems(payload, "rows").length ? payloadItems(payload, "rows") : payloadItems(payload, "items");
  const title = payloadText(payload, "title") || block.title || "";
  const subtitle = payloadText(payload, "description") || payloadText(payload, "subtitle");
  return (
    <div className="space-y-3">
      <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={subtitle} />
      {rows.length ? (
        <div className="space-y-2">
          {rows.map((row, index) => <ConceptRowItem index={index} key={`${payloadText(row, "concept")}-${index}`} row={row} />)}
        </div>
      ) : <MarkdownBlock content={block.content} dedupeTitle={repeatedTitle} />}
    </div>
  );
}

function ConceptRowItem({ index: _index, row }: { index: number; row: Record<string, unknown> }) {
  const concept = payloadText(row, "concept") || payloadText(row, "title") || payloadText(row, "term") || payloadText(row, "label") || "개념";
  const explain = payloadText(row, "explain") || payloadText(row, "explanation") || payloadText(row, "analogy") || payloadText(row, "description") || payloadText(row, "content");
  const image = payloadText(row, "image") || payloadText(row, "src");
  return (
    <div className="grid gap-2 rounded-md border bg-background px-3 py-3 md:grid-cols-[1fr_1.4fr] md:items-center">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Sparkles className="size-3.5" />
        </span>
        <div className="min-w-0 text-sm font-semibold">{stripMarkdown(concept)}</div>
      </div>
      <div className="min-w-0 text-sm leading-6 text-muted-foreground">
        {explain ? <div>{renderInline(explain)}</div> : null}
        {image ? <div className="mt-2"><VisualAsset src={image} title={concept} /></div> : null}
      </div>
    </div>
  );
}

// 권장/지양 규범 대조 — 좋은 예(녹색/체크) | 나쁜 예(적색/엑스) 좌우 병치
function DoDontCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const title = payloadText(payload, "title") || block.title || "권장 vs 지양";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  const doMap = payloadMap(payload.do).items ? payloadMap(payload.do) : payloadMap(payload.do || payload.good);
  const dontMap = payloadMap(payload.dont).items ? payloadMap(payload.dont) : payloadMap(payload.dont || payload.bad);
  const doItems = payloadTextList(doMap.items).length ? payloadTextList(doMap.items) : payloadTextList(payload.do);
  const dontItems = payloadTextList(dontMap.items).length ? payloadTextList(dontMap.items) : payloadTextList(payload.dont);
  const Side = ({ label, items, good }: { label: string; items: string[]; good: boolean }) => (
    <div className="rounded-md border bg-background px-3 py-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
        {good ? <CheckCircle2 className="size-3.5" /> : <TriangleAlert className="size-3.5" />}
        {label}
      </div>
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div className="flex gap-2 text-sm leading-6 text-muted-foreground" key={`${item}-${index}`}>
            {good ? <CheckCircle2 className="mt-1 size-3.5 shrink-0 text-muted-foreground" /> : <TriangleAlert className="mt-1 size-3.5 shrink-0 text-muted-foreground" />}
            <span>{renderInline(item)}</span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="space-y-3">
      <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={subtitle} />
      <div className="grid gap-2 md:grid-cols-2">
        <Side good label={payloadText(doMap, "title") || "권장 (Do)"} items={doItems} />
        <Side good={false} label={payloadText(dontMap, "title") || "지양 (Don't)"} items={dontItems} />
      </div>
    </div>
  );
}

// 용어 정의 — 용어(좌, 강조) ↔ 뜻 + 예시(우)
function DefinitionCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const rowsRaw = payloadItems(payload, "rows").length ? payloadItems(payload, "rows") : payloadItems(payload, "items");
  const rows = rowsRaw.length ? rowsRaw : payloadText(payload, "term") ? [payload] : [];
  const title = payloadText(payload, "title") || block.title || "정의";
  const subtitle = payloadText(payload, "subtitle");
  return (
    <div className="space-y-3">
      <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={subtitle} />
      {rows.length ? (
        <div className="space-y-2">
          {rows.map((row, index) => {
            const term = payloadText(row, "term") || payloadText(row, "title") || "용어";
            const english = payloadText(row, "english") || payloadText(row, "en");
            const meaning = payloadText(row, "meaning") || payloadText(row, "definition") || payloadText(row, "description");
            const example = payloadText(row, "example");
            return (
              <div className="grid gap-2 rounded-md border bg-background px-3 py-3 md:grid-cols-[260px_1fr] md:items-start" key={`${term}-${index}`}>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-foreground">{stripMarkdown(term)}</div>
                  {english ? <div className="mt-0.5 font-mono text-xs text-muted-foreground">{english}</div> : null}
                </div>
                <div className="min-w-0 space-y-2">
                  {meaning ? <div className="text-sm leading-6 text-muted-foreground">{renderInline(meaning)}</div> : null}
                  {example ? <div className="rounded-md bg-muted/30 px-2 py-1.5 text-xs leading-5 text-muted-foreground">예: {renderInline(example)}</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : <MarkdownBlock content={block.content} dedupeTitle={repeatedTitle} />}
    </div>
  );
}

// 오개념 교정 — 착각과 사실을 나란히 보여주는 대구
function MisconceptionCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const rows = payloadItems(payload, "items").length ? payloadItems(payload, "items") : payloadItems(payload, "rows");
  const title = payloadText(payload, "title") || block.title || "흔한 오해";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  return (
    <div className="space-y-3">
      <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={subtitle} />
      {rows.length ? (
        <div className="space-y-2">
          {rows.map((row, index) => {
            const myth = payloadText(row, "myth") || payloadText(row, "wrong") || payloadText(row, "misconception");
            const truth = payloadText(row, "truth") || payloadText(row, "right") || payloadText(row, "fact") || payloadText(row, "reality");
            return (
              <div className="rounded-md border bg-background px-3 py-3" key={`${myth}-${index}`}>
                <div className="flex gap-2 text-sm leading-6">
                  <TriangleAlert className="mt-1 size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground line-through decoration-rose-400/40">{renderInline(myth)}</span>
                </div>
                <div className="mt-1.5 flex gap-2 text-sm leading-6">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">{renderInline(truth)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : <MarkdownBlock content={block.content} dedupeTitle={repeatedTitle} />}
    </div>
  );
}

// 단계 타임라인 — 세로 rail + 번호 노드
function TimelineCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const rows = payloadItems(payload, "items").length ? payloadItems(payload, "items") : (payloadItems(payload, "steps").length ? payloadItems(payload, "steps") : payloadItems(payload, "events"));
  const title = payloadText(payload, "title") || block.title || "흐름";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  return (
    <div className="space-y-3">
      <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={subtitle} />
      <div className="space-y-0">
        {rows.map((row, index) => {
          const label = payloadText(row, "step") || payloadText(row, "label") || String(index + 1);
          const head = payloadText(row, "title") || payloadText(row, "name");
          const detail = payloadText(row, "description") || payloadText(row, "detail") || payloadText(row, "content");
          const last = index === rows.length - 1;
          return (
            <div className="flex gap-3" key={`${head}-${index}`}>
              <div className="flex flex-col items-center">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground">{label}</span>
                {!last ? <span className="my-1 w-px flex-1 bg-border" /> : null}
              </div>
              <div className={cn("min-w-0 flex-1", last ? "pb-0" : "pb-3")}>
                <div className="text-sm font-semibold text-foreground">{stripMarkdown(head)}</div>
                {detail ? <div className="mt-0.5 text-sm leading-6 text-muted-foreground">{renderInline(detail)}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 지표 강조 — 큰 숫자 + 라벨 + 증감
function StatCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const rows = payloadItems(payload, "items").length ? payloadItems(payload, "items") : (payloadItems(payload, "stats").length ? payloadItems(payload, "stats") : payloadItems(payload, "metrics"));
  const title = payloadText(payload, "title") || block.title || "";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  return (
    <div className="space-y-3">
      <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={subtitle} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row, index) => {
          const value = payloadText(row, "value") || payloadText(row, "number") || payloadText(row, "stat");
          const label = payloadText(row, "label") || payloadText(row, "title") || payloadText(row, "name");
          const delta = payloadText(row, "delta") || payloadText(row, "change");
          const trend = payloadText(row, "trend");
          return (
            <div className="rounded-md border bg-background px-3 py-4 text-center" key={`${label}-${index}`}>
              <div className="text-2xl font-bold tabular-nums text-foreground">{stripMarkdown(value)}</div>
              <div className="mt-1 text-xs text-muted-foreground">{stripMarkdown(label)}</div>
              {delta ? (
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <TrendingUp className={cn("size-3", trend === "down" && "rotate-180")} />
                  {stripMarkdown(delta)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Before/After 코드 비교 — 좌우 코드 패널
function CodeCompareCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const title = payloadText(payload, "title") || block.title || "코드 비교";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  const beforeMap = payloadMap(payload.before).code ? payloadMap(payload.before) : payloadMap(payload.before || payload.bad);
  const afterMap = payloadMap(payload.after).code ? payloadMap(payload.after) : payloadMap(payload.after || payload.good);
  const beforeCode = payloadText(beforeMap, "code") || payloadText(payload, "before");
  const afterCode = payloadText(afterMap, "code") || payloadText(payload, "after");
  const Pane = ({ label, code, good }: { label: string; code: string; good: boolean }) => (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 px-1 pb-1 text-[10px] font-semibold uppercase text-muted-foreground">
        {good ? <CheckCircle2 className="size-3" /> : <TriangleAlert className="size-3" />}
        {label}
      </div>
      <div className="rounded-md border bg-code">
        <ScrollableCode code={code} />
      </div>
    </div>
  );
  return (
    <div className="space-y-3">
      <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={subtitle} />
      <div className="grid gap-2 md:grid-cols-2">
        <Pane good={false} label={payloadText(beforeMap, "label") || "Before"} code={beforeCode} />
        <Pane good label={payloadText(afterMap, "label") || "After"} code={afterCode} />
      </div>
    </div>
  );
}

// 구조 분해 — 한 줄 명령/코드/경로를 토큰별 번호 카드로 해부(세그멘팅·시그널링)
function AnatomyCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const parts = payloadItems(payload, "parts").length
    ? payloadItems(payload, "parts")
    : (payloadItems(payload, "items").length ? payloadItems(payload, "items") : payloadItems(payload, "tokens"));
  const code = payloadText(payload, "code") || payloadText(payload, "line") || payloadText(payload, "target");
  const title = payloadText(payload, "title") || block.title || "구조 분해";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  return (
    <div className="space-y-3">
      <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={subtitle} />
      {code ? (
        <div className="rounded-md border bg-code">
          <div className="flex items-center gap-1.5 px-3 pt-2 text-[10px] font-medium uppercase text-muted-foreground">
            <Code2 className="size-3" />
            분해 대상
          </div>
          <ScrollArea className="min-w-0">
            <pre className="min-w-0 whitespace-pre-wrap break-words px-3 py-2 font-mono text-sm leading-6 text-code-foreground">{code}</pre>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      ) : null}
      {parts.length ? (
        <div className="grid gap-2 md:grid-cols-2">
          {parts.map((part, index) => {
            const token = payloadText(part, "token") || payloadText(part, "text") || payloadText(part, "part") || payloadText(part, "code");
            const label = payloadText(part, "label") || payloadText(part, "title") || payloadText(part, "name") || payloadText(part, "role");
            const explain = payloadText(part, "explain") || payloadText(part, "explanation") || payloadText(part, "description") || payloadText(part, "meaning");
            return (
              <div className="flex gap-2 rounded-md border bg-background px-3 py-2" key={`${token}-${index}`}>
                <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-muted text-[11px] font-semibold tabular-nums text-muted-foreground">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    {token ? <code className="font-mono text-xs text-foreground">{token}</code> : null}
                    {label ? <span className="text-[11px] text-muted-foreground">{stripMarkdown(label)}</span> : null}
                  </div>
                  {explain ? <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{renderInline(explain)}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : <MarkdownBlock content={block.content} dedupeTitle={repeatedTitle} />}
    </div>
  );
}

// 터미널 — 프롬프트($)+명령+출력 세션 재현. 명령은 풀강도, 출력은 dim(명도 위계만, 색 없음)
function TerminalCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const lines = payloadItems(payload, "lines").length
    ? payloadItems(payload, "lines")
    : (payloadItems(payload, "commands").length ? payloadItems(payload, "commands") : payloadItems(payload, "session"));
  const title = payloadText(payload, "title") || block.title || "터미널";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  const fallback = payloadText(payload, "content") || payloadText(payload, "code");
  return (
    <div className="space-y-3">
      <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={subtitle} />
      <div className="rounded-md border bg-code">
        <div className="flex items-center gap-1.5 px-3 pt-2 text-[10px] font-medium uppercase text-muted-foreground">
          <TerminalSquare className="size-3" />
          터미널
        </div>
        <ScrollArea className="max-h-72 min-w-0">
          <div className="px-3 py-2 font-mono text-xs leading-6">
            {lines.length ? lines.map((line, index) => {
              const cmd = payloadText(line, "cmd") || payloadText(line, "command") || payloadText(line, "input") || payloadText(line, "in");
              const out = payloadText(line, "out") || payloadText(line, "output") || payloadText(line, "result");
              return (
                <div key={index}>
                  {cmd ? (
                    <div className="text-code-foreground">
                      <span className="select-none text-muted-foreground/60">$ </span>
                      <span className="whitespace-pre-wrap break-words">{cmd}</span>
                    </div>
                  ) : null}
                  {out ? <div className="whitespace-pre-wrap break-words text-muted-foreground/80">{out}</div> : null}
                </div>
              );
            }) : <div className="whitespace-pre-wrap break-words text-muted-foreground/80">{fallback}</div>}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

// 코드 해설 — 라인별 거터(번호) + 우측 주석. worked example + self-explanation. 무채색 구분선만.
function AnnotatedCodeCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const lines = payloadItems(payload, "lines").length
    ? payloadItems(payload, "lines")
    : (payloadItems(payload, "items").length ? payloadItems(payload, "items") : payloadItems(payload, "rows"));
  const title = payloadText(payload, "title") || block.title || "코드 해설";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  const fallback = payloadText(payload, "code") || payloadText(payload, "content");
  return (
    <div className="space-y-3">
      <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={subtitle} />
      {lines.length ? (
        <div className="rounded-md border bg-code">
          <div className="flex items-center gap-1.5 px-3 pt-2 text-[10px] font-medium uppercase text-muted-foreground">
            <Code2 className="size-3" />
            코드 해설
          </div>
          <div className="divide-y divide-border/40">
            {lines.map((line, index) => {
              const code = payloadText(line, "code") || payloadText(line, "line") || payloadText(line, "text");
              const note = payloadText(line, "note") || payloadText(line, "annotation") || payloadText(line, "explain") || payloadText(line, "description");
              return (
                <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2 px-3 py-1.5 md:grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,18rem)]" key={index}>
                  <span className="text-right font-mono text-xs leading-6 tabular-nums text-muted-foreground/50">{index + 1}</span>
                  <div className="min-w-0">
                    <code className="block whitespace-pre-wrap break-words font-mono text-xs leading-6 text-code-foreground">{code}</code>
                    {note ? <p className="mt-0.5 text-xs leading-5 text-muted-foreground md:hidden">{renderInline(note)}</p> : null}
                  </div>
                  {note ? (
                    <span className="hidden text-xs leading-6 text-muted-foreground md:block md:border-l md:border-border/40 md:pl-2">{renderInline(note)}</span>
                  ) : <span className="hidden md:block" />}
                </div>
              );
            })}
          </div>
        </div>
      ) : (fallback ? (
        <div className="rounded-md border bg-code">
          <ScrollableCode code={fallback} />
        </div>
      ) : <MarkdownBlock content={block.content} dedupeTitle={repeatedTitle} />)}
    </div>
  );
}

function DetailList({
  items,
  label,
  tone,
}: {
  items: Array<Record<string, unknown>>;
  label: string;
  tone: "default" | "good" | "warn";
}) {
  if (!items.length) return null;
  const DetailIcon = tone === "warn" ? TriangleAlert : CheckCircle2;

  return (
    <div className="mt-3 space-y-1.5">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      {items.slice(0, 5).map((item, index) => {
        const title = payloadText(item, "title") || payloadText(item, "text") || payloadText(item, "label") || payloadText(item, "description") || "항목";
        const description = payloadText(item, "description") || payloadText(item, "content");
        return (
          <div className="flex gap-2 text-xs leading-5 text-muted-foreground" key={`${title}-${index}`}>
            <DetailIcon className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            <span>
              <span>{stripMarkdown(title)}</span>
              {description && description !== title ? <span className="text-muted-foreground/80"> — {stripMarkdown(description)}</span> : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function InlineLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      className="mt-3 inline-flex max-w-full items-center gap-1.5 truncate rounded-md border bg-muted/20 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <ExternalLink className="size-3 shrink-0" />
      <span className="truncate">{stripMarkdown(label || url)}</span>
    </a>
  );
}

function ComparisonGrid({ cards }: { cards: Array<Record<string, unknown>> }) {
  return (
    <div className="grid gap-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <ComparisonPanel
          fallback={`비교 ${index + 1}`}
          index={index + 1}
          item={card}
          key={`${payloadText(card, "title")}-${index}`}
        />
      ))}
    </div>
  );
}

function ComparisonPanel({ item, fallback, index }: { item: Record<string, unknown>; fallback: string; index: number }) {
  const title = payloadText(item, "title") || fallback;
  const subtitle = payloadText(item, "subtitle") || payloadText(item, "description");
  const items = payloadTextList(item.items).length ? payloadTextList(item.items) : payloadTextList(item.points);

  return (
    <div className="min-w-0 rounded-md border bg-background px-3 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
          {index}
        </span>
        <div className="min-w-0 flex-1 text-sm font-semibold leading-5">{stripMarkdown(title)}</div>
      </div>
      {subtitle ? <div className="mt-1 text-xs text-muted-foreground">{stripMarkdown(subtitle)}</div> : null}
      {items.length ? (
        <div className="mt-3 space-y-1.5">
          {items.map((entry, index) => (
            <div className="flex gap-2 text-xs leading-5 text-muted-foreground" key={`${entry}-${index}`}>
              <ChevronRight className="mt-0.5 size-3 shrink-0" />
              <span>{stripMarkdown(entry)}</span>
            </div>
          ))}
        </div>
      ) : null}
      {payloadText(item, "infoBox") ? (
        <div className="mt-3 rounded-md bg-muted/30 px-2 py-1.5 text-xs leading-5 text-muted-foreground">
          {stripMarkdown(payloadText(item, "infoBox"))}
        </div>
      ) : null}
    </div>
  );
}

function LearningTable({ rows, fallback }: { rows: Array<Record<string, unknown>>; fallback: string }) {
  if (!rows.length) return <MarkdownBlock content={fallback} />;
  const columns = Array.from(rows.reduce((keys, row) => {
    Object.keys(row).forEach((key) => keys.add(key));
    return keys;
  }, new Set<string>()));
  return (
    <ScrollArea className="rounded-md border">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            {columns.map((column) => <th className="px-3 py-2 font-medium" key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr className="border-t" key={rowIndex}>
              {columns.map((column) => (
                <td className="px-3 py-2 text-muted-foreground" key={column}>{payloadText(row, column)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function MediaCell({ block, payload, repeatedTitle }: { block: BlockConfig; payload: Record<string, unknown>; repeatedTitle: string }) {
  const src = payloadText(payload, "src") || payloadText(payload, "url") || youtubeUrl(payloadText(payload, "youtube"));
  const sourceType = payloadText(payload, "sourceType") || block.sourceType || "media";
  const title = payloadText(payload, "title") || block.title || blockLabel(block);
  const description = payloadText(payload, "description") || payloadText(payload, "subtitle");
  const items = payloadItems(payload, "items");

  if ((sourceType === "image" || sourceType === "video" || sourceType === "youtube") && src) {
    return (
      <div className="space-y-3">
        <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={description} />
        <VisualAsset src={src} title={title} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <LearningSectionLead hideTitle={shouldHideRepeatedTitle(title, repeatedTitle)} title={title} subtitle={description} />
      <div className="grid gap-2 md:grid-cols-2">
        {src ? <MediaResourceCard index={1} item={{ title: blockTypeLabel(sourceType), url: src, sourceType }} /> : null}
        {items.map((item, index) => <MediaResourceCard key={`${payloadText(item, "title")}-${index}`} index={index + 2} item={item} />)}
        {!src && !items.length ? <MarkdownBlock content={block.content} dedupeTitle={repeatedTitle} /> : null}
      </div>
    </div>
  );
}

function MediaResourceCard({ index, item }: { index: number; item: Record<string, unknown> }) {
  const title = payloadText(item, "title") || payloadText(item, "label") || `자료 ${index}`;
  const description = payloadText(item, "description") || payloadText(item, "subtitle");
  const youtube = payloadText(item, "youtube") || payloadText(item, "youtubeId");
  const url = payloadText(item, "url") || payloadText(item, "href") || payloadText(item, "src") || youtubeUrl(youtube);
  const thumb = youtube ? `https://img.youtube.com/vi/${youtube}/hqdefault.jpg` : "";

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      {thumb ? (
        <div className="relative aspect-video bg-muted/30">
          <img alt="" className="size-full object-cover" src={thumb} />
          <div className="absolute inset-0 grid place-items-center bg-black/20">
            <span className="grid size-10 place-items-center rounded-full bg-background/90 text-foreground">
              <PlayCircle className="size-5" />
            </span>
          </div>
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-muted/30 text-muted-foreground">
          <PlayCircle className="size-8" />
        </div>
      )}
      <div className="p-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium tabular-nums">{index}</span>
          <div className="min-w-0 flex-1 truncate text-sm font-medium">{stripMarkdown(title)}</div>
        </div>
        {description ? <div className="mt-2 text-xs leading-5 text-muted-foreground">{stripMarkdown(description)}</div> : null}
        {url ? <InlineLink url={url} label="자료 열기" /> : null}
      </div>
    </div>
  );
}

function isSafeHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("/");
}

// 마크다운 인라인 링크 [label](url)를 클릭 가능한 <a>로. 링크 외 텍스트는 stripMarkdown으로 정리.
// href는 스킴 화이트리스트(http/https/선두 /)만 앵커 — javascript:/data: 등은 평문으로 떨군다(XSS 차단).
function renderInline(text: string): ReactNode {
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(stripMarkdown(text.slice(lastIndex, match.index)));
    const label = match[1];
    const href = match[2].trim();
    if (isSafeHref(href)) {
      const external = !href.startsWith("/");
      parts.push(
        <a
          className="text-foreground underline underline-offset-2 hover:text-foreground/80"
          href={href}
          key={`lnk-${key++}`}
          rel={external ? "noopener noreferrer" : undefined}
          target={external ? "_blank" : undefined}
        >
          {label}
        </a>,
      );
    } else {
      parts.push(`${label} ${href}`);
    }
    lastIndex = linkRe.lastIndex;
  }
  if (lastIndex < text.length) parts.push(stripMarkdown(text.slice(lastIndex)));
  return parts.length ? parts : stripMarkdown(text);
}

function MarkdownBlock({ content, dedupeTitle = "" }: { content: string; dedupeTitle?: string }) {
  const lines = dedupeRepeatedLines(normalizeRichText(content).split("\n"), dedupeTitle);
  return (
    <div className="space-y-2 break-words text-sm leading-6">
      {lines.map((line, index) => {
        const key = `${index}-${line.slice(0, 12)}`;
        if (!line.trim()) return <div className="h-1" key={key} />;
        const imageMatch = line.match(/^!\[(.*)]\((.*)\)$/);
        if (imageMatch) {
          return <VisualAsset key={key} src={imageMatch[2]} title={imageMatch[1]} />;
        }
        if (line.startsWith("# ")) return <h2 className="text-xl font-semibold tracking-normal" key={key}>{line.replace(/^#\s+/, "")}</h2>;
        if (line.startsWith("## ")) return <h3 className="text-base font-semibold tracking-normal" key={key}>{line.replace(/^##\s+/, "")}</h3>;
        if (line.startsWith("### ")) return <h4 className="text-sm font-semibold tracking-normal" key={key}>{line.replace(/^###\s+/, "")}</h4>;
        if (line.startsWith("#### ")) return <h5 className="text-sm font-medium tracking-normal" key={key}>{line.replace(/^####\s+/, "")}</h5>;
        if (line.startsWith("> ")) {
          return (
            <div className="rounded-md border-l-2 border-border bg-muted/20 px-3 py-2 text-muted-foreground" key={key}>
              {renderInline(line.slice(2))}
            </div>
          );
        }
        if (line.startsWith("- ")) return <div className="rounded-md bg-muted/20 px-3 py-1.5 text-muted-foreground" key={key}>- {renderInline(line.slice(2))}</div>;
        if (/^\d+\.\s+/.test(line)) return <div className="rounded-md bg-muted/20 px-3 py-1.5 text-muted-foreground" key={key}>{renderInline(line)}</div>;
        if (line.trim().startsWith("|")) return <ScrollableInlineText key={key} text={line} />;
        return <p className="text-muted-foreground" key={key}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function ScrollableCode({ code }: { code: string }) {
  const compact = code.split("\n").length <= 8 && code.length < 520;
  return (
    <ScrollArea className={cn("min-w-0", compact ? "max-h-56" : "h-64")}>
      <pre className="min-w-0 whitespace-pre-wrap break-words p-3 pt-1 font-mono text-xs leading-5 text-code-foreground">{code}</pre>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function ScrollableInlineText({ text }: { text: string }) {
  return (
    <ScrollArea className="rounded-md bg-muted/30">
      <pre className="min-w-max px-3 py-1.5 font-mono text-xs text-muted-foreground">{text}</pre>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function normalizeRichText(content: string) {
  return content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|ul|ol)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function VisualAsset({ src, title }: { src: string; title: string }) {
  if (isRenderableImageSrc(src)) {
    return (
      <div className="overflow-hidden rounded-md border bg-muted/20">
        <img alt={title} className="max-h-96 w-full object-contain" src={resolveAssetSrc(src)} />
      </div>
    );
  }

  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(src)) {
    return (
      <div className="overflow-hidden rounded-md border bg-muted/20">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video className="max-h-96 w-full" controls preload="metadata" src={resolveAssetSrc(src)} />
      </div>
    );
  }

  const youtubeId = extractYoutubeId(src);
  if (youtubeId) {
    return (
      <div className="overflow-hidden rounded-md border bg-muted/20">
        <iframe
          allow="encrypted-media; picture-in-picture"
          className="aspect-video w-full"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
          title={title || "YouTube"}
        />
      </div>
    );
  }

  const Icon = /\.(mp4|webm|mov)/i.test(src) ? MonitorPlay : ImageIcon;
  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted/20 px-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-medium">자료</div>
        <div className="mt-1 truncate font-mono text-xs text-muted-foreground">{src}</div>
      </div>
    </div>
  );
}

function extractYoutubeId(src: string) {
  if (!src) return "";
  const match = src.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube-nocookie\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  );
  if (match) return match[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(src)) return src;
  return "";
}

function isRenderableImageSrc(src: string) {
  return (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) && /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(src);
}

function resolveAssetSrc(src: string) {
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src;
  return `/${src.replace(/^\.?\//, "")}`;
}

function youtubeUrl(id: string) {
  if (!id) return "";
  if (id.startsWith("http://") || id.startsWith("https://")) return id;
  return `https://www.youtube.com/watch?v=${id}`;
}

function payloadMap(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function payloadItems(payload: Record<string, unknown>, key: string): Array<Record<string, unknown>> {
  const value = payload[key];
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) return item as Record<string, unknown>;
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") return { title: String(item) };
      return {};
    })
    .filter((item) => Object.keys(item).length);
}

function payloadText(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function payloadTextList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") return String(item);
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;
      return payloadText(record, "title") || payloadText(record, "text") || payloadText(record, "label") || payloadText(record, "name") || payloadText(record, "description");
    }
    return "";
  }).filter(Boolean);
}

function dedupeRepeatedItems(items: string[], title: string) {
  if (!title) return items;
  const titleKey = comparableText(title);
  return items.filter((item, index) => index !== 0 || comparableText(item) !== titleKey);
}

function dedupeRepeatedLines(lines: string[], title: string) {
  if (!title) return lines;
  const titleKey = comparableText(title);
  let removed = false;
  return lines.filter((line) => {
    if (removed || !line.trim()) return true;
    removed = true;
    return comparableText(line) !== titleKey;
  });
}

function shouldHideRepeatedTitle(title: string, repeatedTitle: string) {
  return Boolean(title && repeatedTitle && comparableText(title) === comparableText(repeatedTitle));
}

function comparableText(value: string) {
  return stripMarkdown(value)
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*]\s+/, "")
    .replace(/^\d+\.\s+/, "")
    .replace(/[.:：。]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function blockTypeLabel(type: string) {
  const normalized = type.trim();
  const labels: Record<string, string> = {
    image: "이미지",
    pdf: "PDF",
    video: "비디오",
    youtube: "YouTube",
    MIME: "미디어",
    tip: "팁",
    tipCard: "팁",
    note: "노트",
    warning: "주의",
    info: "정보",
  };
  return labels[normalized] ?? labels[normalized.toLowerCase()] ?? normalized.replace(/([a-z])([A-Z])/g, "$1 $2");
}
