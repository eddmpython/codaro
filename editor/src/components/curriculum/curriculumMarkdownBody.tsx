import { blockLabel, stripMarkdown } from "@/lib/cellModel";
import { cn } from "@/lib/utils";
import type { BlockConfig } from "@/types";
import { AnatomyCell, AnnotatedCodeCell, BareList, CalloutCell, ChoiceCardsCell, CodeCompareCell, ComparisonPanel, ConceptRowCell, DefinitionCell, DoDontCell, LearningTable, LocalRunnerHero, MisconceptionCell, PracticePromptCell, ProseLearningCell, ResourceCardsCell, SectionLead, StatCell, StepPracticeCell, TerminalCell, TimelineCell, TopRuleGrid } from "./curriculumMarkdownDataCells";
import { payloadItems, payloadMap, payloadText, payloadTextList } from "./curriculumMarkdownHelpers";
import { MediaCell } from "./curriculumMarkdownMedia";
import { MarkdownBlock } from "./curriculumMarkdownRichText";

// 3계층 표면 모델 (curriculum-card-contract.md "카드 시각 규칙"의 SSOT 구현):
//   읽기 계층  = bare 타이포 (박스·아이콘칩 없음, max-w-3xl)
//   신호 계층  = 좌측 2px rail (border-l-2 + pl-4, 배경 없음)
//   자료/상호작용 계층 = hairline 박스 (rounded-lg border, 코드는 bg-code)
// 본문은 text-foreground 100%, muted는 키커·캡션·부제 전용.
// 유채색은 semantic 토큰(success/warning/destructive)과 accent-brand만 쓴다.
export function CurriculumMarkdownBody({ block }: { block: BlockConfig }) {
  const payload = payloadMap(block.payload);
  const displayKind = block.displayKind ?? "prose";

  if (displayKind === "title") {
    const title = payloadText(payload, "title") || block.title || blockLabel(block);
    const subtitle = payloadText(payload, "subtitle") || block.description;
    return (
      <div className="min-w-0 max-w-3xl">
        <h2 className="text-lg font-bold text-foreground">{stripMarkdown(title)}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{stripMarkdown(subtitle)}</p> : null}
      </div>
    );
  }

  if (displayKind === "hero") {
    if (block.sourceType === "localRunner") return <LocalRunnerHero block={block} payload={payload} />;

    const title = payloadText(payload, "title") || block.title || blockLabel(block);
    const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "goal");
    const description = payloadText(payload, "description");
    const points = payloadItems(payload, "points");
    return (
      <div className="space-y-4">
        <div className="min-w-0 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground">{stripMarkdown(title)}</h2>
          {subtitle ? <p className="mt-1.5 text-md font-normal text-foreground">{stripMarkdown(subtitle)}</p> : null}
          {description ? <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{stripMarkdown(description)}</p> : null}
        </div>
        {points.length ? <TopRuleGrid items={points.slice(0, 6)} /> : null}
      </div>
    );
  }

  if (displayKind === "resource") return <ResourceCardsCell block={block} payload={payload} />;

  if (displayKind === "cardGrid") {
    if (block.sourceType === "choiceCards") return <ChoiceCardsCell block={block} payload={payload} />;
    if (block.sourceType === "resourceCards") return <ResourceCardsCell block={block} payload={payload} />;

    const cards = payloadItems(payload, "cards").length
      ? payloadItems(payload, "cards")
      : payloadItems(payload, "links");
    const title = payloadText(payload, "title") || block.title || "";
    return (
      <div className="space-y-3">
        <SectionLead subtitle={payloadText(payload, "subtitle") || block.description} title={title} />
        {cards.length ? <TopRuleGrid items={cards} /> : <MarkdownBlock content={block.content} />}
      </div>
    );
  }

  if (displayKind === "comparison") {
    const cards = payloadItems(payload, "cards");
    const left = payloadMap(payload.left);
    const right = payloadMap(payload.right);
    const title = payloadText(payload, "title") || block.title || "비교";
    const panels = cards.length ? cards : [left, right].filter((item) => Object.keys(item).length);
    return (
      <div className="space-y-3">
        <SectionLead subtitle={payloadText(payload, "subtitle")} title={title} />
        <div className={cn("grid gap-x-8 gap-y-4", panels.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
          {panels.map((item, index) => <ComparisonPanel item={item} key={`${payloadText(item, "title")}-${index}`} />)}
        </div>
      </div>
    );
  }

  if (displayKind === "table") {
    const rows = payloadItems(payload, "rows");
    const title = payloadText(payload, "title") || block.title || "";
    return (
      <div className="space-y-3">
        <SectionLead subtitle={payloadText(payload, "subtitle")} title={title} />
        <LearningTable fallback={block.content} rows={rows} />
      </div>
    );
  }

  if (displayKind === "media") {
    return <MediaCell block={block} payload={payload} />;
  }

  if (displayKind === "callout") {
    return <CalloutCell block={block} payload={payload} />;
  }

  if (block.sourceType === "list") {
    const items = block.content
      .split("\n")
      .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim())
      .filter(Boolean);
    return <BareList items={items} />;
  }

  if (displayKind === "prose") {
    return <ProseLearningCell block={block} payload={payload} />;
  }

  if (displayKind === "quiz") {
    const question = payloadText(payload, "question") || block.title || "문제";
    const options = payloadTextList(payload.options);
    return (
      <div className="space-y-3">
        <div className="min-w-0 max-w-3xl">
          <div className="text-xs font-medium text-muted-foreground">확인 문제</div>
          <div className="mt-1 text-[15px] font-bold leading-6 text-foreground">{stripMarkdown(question)}</div>
        </div>
        <div className="grid max-w-3xl gap-2">
          {options.map((option, index) => (
            <div className="flex items-start gap-3 rounded-lg border px-4 py-2.5 text-md text-foreground" key={`${option}-${index}`}>
              <span className="mt-1 text-xs font-medium tabular-nums text-muted-foreground">{index + 1}</span>
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
        <SectionLead
          subtitle={payloadText(payload, "description") || payloadText(payload, "content") || block.description}
          title={title}
        />
        {items.length ? <TopRuleGrid items={items} /> : <MarkdownBlock content={block.content} />}
      </div>
    );
  }

  if (displayKind === "centerText") {
    const centerContent = payloadText(payload, "content") || block.content;
    return (
      <div className="mx-auto max-w-2xl py-2 text-center">
        <MarkdownBlock content={centerContent} />
      </div>
    );
  }

  if (displayKind === "conceptRow") {
    return <ConceptRowCell block={block} payload={payload} />;
  }

  if (displayKind === "doDont") {
    return <DoDontCell block={block} payload={payload} />;
  }

  if (displayKind === "definition") {
    return <DefinitionCell block={block} payload={payload} />;
  }

  if (displayKind === "misconception") {
    return <MisconceptionCell block={block} payload={payload} />;
  }

  if (displayKind === "timeline") {
    return <TimelineCell block={block} payload={payload} />;
  }

  if (displayKind === "stat") {
    return <StatCell block={block} payload={payload} />;
  }

  if (displayKind === "codeCompare") {
    return <CodeCompareCell block={block} payload={payload} />;
  }

  if (displayKind === "anatomy") {
    return <AnatomyCell block={block} payload={payload} />;
  }

  if (displayKind === "terminal") {
    return <TerminalCell block={block} payload={payload} />;
  }

  if (displayKind === "annotatedCode") {
    return <AnnotatedCodeCell block={block} payload={payload} />;
  }

  return (
    <div className="space-y-3">
      {block.description ? (
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{block.description}</p>
      ) : null}
      <MarkdownBlock content={block.content} />
    </div>
  );
}
