import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { stripMarkdown } from "@/lib/cellModel";
import { cn } from "@/lib/utils";
import type { BlockConfig } from "@/types";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  FileText,
  Lightbulb,
  TrendingUp,
  TriangleAlert,
  X,
} from "lucide-react";
import { payloadItems, payloadMap, payloadText, payloadTextList, payloadTextListLoose } from "./curriculumMarkdownHelpers";
import { VisualAsset, youtubeUrl } from "./curriculumMarkdownMedia";
import { InlineLink, MarkdownBlock, ScrollableCode, renderInline } from "./curriculumMarkdownRichText";

const CALLOUT_TONES: Record<string, { rail: string; labelTone: string; label: string; Icon: typeof FileText }> = {
  warning: { rail: "border-warning", labelTone: "text-warning", label: "주의", Icon: TriangleAlert },
  danger: { rail: "border-destructive", labelTone: "text-destructive", label: "위험", Icon: TriangleAlert },
  tip: { rail: "border-border", labelTone: "text-muted-foreground", label: "팁", Icon: Lightbulb },
  success: { rail: "border-success", labelTone: "text-success", label: "성공 기준", Icon: CheckCircle2 },
  example: { rail: "border-border", labelTone: "text-muted-foreground", label: "예시", Icon: FileText },
  summary: { rail: "border-border", labelTone: "text-muted-foreground", label: "핵심 정리", Icon: FileText },
  info: { rail: "border-border", labelTone: "text-muted-foreground", label: "참고", Icon: FileText },
  note: { rail: "border-border", labelTone: "text-muted-foreground", label: "노트", Icon: FileText },
};

export // 블록 소제목(L3) + 부제(L5). 박스·아이콘칩 없이 타이포만.
function SectionLead({ title, subtitle }: { title?: string; subtitle?: string }) {
  if (!title && !subtitle) return null;
  return (
    <div className="min-w-0 max-w-3xl">
      {title ? <h3 className="text-[15px] font-semibold leading-6 text-foreground">{stripMarkdown(title)}</h3> : null}
      {subtitle ? <p className={cn("text-sm leading-6 text-muted-foreground", title && "mt-0.5")}>{stripMarkdown(subtitle)}</p> : null}
    </div>
  );
}

export function LocalRunnerHero({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const title = payloadText(payload, "title") || block.title || "실행 셀";
  const description = payloadText(payload, "description") || "Python 셀을 실행하고 결과를 확인하는 학습 단계입니다.";
  const steps = [
    { title: "코드 작성", detail: "아래 실행 셀에서 값을 바꿔봅니다." },
    { title: "실행", detail: "결과와 변수 변화를 바로 확인합니다." },
    { title: "질문", detail: "막히면 셀 단위로 Codaro에게 요청합니다." },
  ];

  return (
    <div className="space-y-4">
      <SectionLead subtitle={description} title={title} />
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
        {steps.map(({ title: stepTitle, detail }) => (
          <div className="min-w-0 border-t pt-3" key={stepTitle}>
            <div className="text-sm font-semibold text-foreground">{stepTitle}</div>
            <p className="mt-1 text-sm leading-6 text-foreground/75">{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProseLearningCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const title = payloadText(payload, "title") || block.title || "";
  const subtitle = payloadText(payload, "subtitle") || block.description;
  const content = payloadText(payload, "content") || payloadText(payload, "text") || block.content;

  return (
    <div className="space-y-3">
      <SectionLead subtitle={subtitle} title={title} />
      <MarkdownBlock content={content} />
    </div>
  );
}

export function ChoiceCardsCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const title = payloadText(payload, "title") || block.title || "선택지";
  const subtitle = payloadText(payload, "subtitle") || block.description;
  const cards = payloadItems(payload, "cards");

  return (
    <div className="space-y-3">
      <SectionLead subtitle={subtitle} title={title} />
      {cards.length ? (
        <div className="grid gap-x-8 gap-y-4 lg:grid-cols-2">
          {cards.map((card, index) => <ChoiceOptionCard item={card} key={`${payloadText(card, "title")}-${index}`} />)}
        </div>
      ) : <MarkdownBlock content={block.content} />}
    </div>
  );
}

export function ChoiceOptionCard({ item }: { item: Record<string, unknown> }) {
  const title = payloadText(item, "title") || payloadText(item, "text") || "선택지";
  const subtitle = payloadText(item, "subtitle") || payloadText(item, "choiceType");
  const description = payloadText(item, "description") || payloadText(item, "content");
  const advantages = payloadItems(item, "advantages");
  const disadvantages = payloadItems(item, "disadvantages");
  const useCases = payloadItems(item, "useCases").length ? payloadItems(item, "useCases") : payloadItems(item, "items");

  return (
    <div className="min-w-0 border-t pt-3">
      <div className="text-sm font-semibold text-foreground">{stripMarkdown(title)}</div>
      {subtitle ? <div className="mt-0.5 text-xs text-muted-foreground">{stripMarkdown(subtitle)}</div> : null}
      {description ? <p className="mt-1.5 text-sm leading-6 text-foreground/75">{stripMarkdown(description)}</p> : null}
      <DetailList items={advantages} label="장점" />
      <DetailList items={disadvantages} label="주의" />
      <DetailList items={useCases} label="쓸 때" />
    </div>
  );
}

export function ResourceCardsCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const title = payloadText(payload, "title") || block.title || "참고 자료";
  const subtitle = payloadText(payload, "subtitle") || block.description;
  const resources = payloadItems(payload, "cards").length
    ? payloadItems(payload, "cards")
    : payloadItems(payload, "links");

  return (
    <div className="space-y-3">
      <SectionLead subtitle={subtitle} title={title} />
      {resources.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {resources.map((resource, index) => (
            <ResourceCard item={resource} key={`${payloadText(resource, "title")}-${index}`} />
          ))}
        </div>
      ) : <MarkdownBlock content={block.content} />}
    </div>
  );
}

export function ResourceCard({ item }: { item: Record<string, unknown> }) {
  const title = payloadText(item, "title") || payloadText(item, "text") || payloadText(item, "label") || payloadText(item, "name") || "자료";
  const description = payloadText(item, "description") || payloadText(item, "content") || payloadText(item, "subtitle");
  const url = payloadText(item, "url") || payloadText(item, "href") || payloadText(item, "buttonLink") || payloadText(item, "src");
  const stats = payloadTextListLoose(item.stats);

  return (
    <div className="min-w-0 rounded-lg border p-4">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 text-sm font-semibold text-foreground">{stripMarkdown(title)}</div>
        {url ? <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /> : null}
      </div>
      {description ? <p className="mt-1 text-sm leading-6 text-foreground/75">{stripMarkdown(description)}</p> : null}
      {stats.length ? (
        <div className="mt-2 text-xs text-muted-foreground">{stats.join(" · ")}</div>
      ) : null}
      {url ? <InlineLink label={payloadText(item, "buttonText") || "자료 열기"} url={url} /> : null}
    </div>
  );
}

export function CalloutCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const styleTone = payloadText(payload, "style");
  const tone = payloadText(payload, "tone") || (block.sourceType && block.sourceType !== "note" ? block.sourceType : styleTone) || block.sourceType || "note";
  const resolved = CALLOUT_TONES[tone] ?? (block.role === "check" ? CALLOUT_TONES.warning : CALLOUT_TONES.note);
  const title = payloadText(payload, "title") || block.title || resolved.label;
  const content = payloadText(payload, "content") || block.content;
  const points = payloadTextList(payload.points).length ? payloadTextList(payload.points) : payloadTextList(payload.items);
  const { rail, labelTone, Icon } = resolved;

  return (
    <aside className={cn("min-w-0 max-w-3xl border-l-2 py-0.5 pl-4", rail)}>
      <div className={cn("flex items-center gap-1.5 text-xs font-semibold", labelTone)}>
        <Icon className="size-3.5" />
        {stripMarkdown(title)}
      </div>
      {content ? <div className="mt-1 text-md text-foreground">{renderInline(content)}</div> : null}
      {points.length ? (
        <ul className="mt-1.5 space-y-1">
          {points.map((point, index) => (
            <li className="flex gap-2.5 text-md text-foreground" key={`${point}-${index}`}>
              <span className="mt-[0.65em] size-1 shrink-0 rounded-full bg-foreground/40" />
              <span>{renderInline(point)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}

export function StepPracticeCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
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
      <div className="min-w-0 max-w-3xl">
        <div className="text-xs font-medium text-muted-foreground">{stepNumber ? `STEP ${stepNumber}` : "실습 단계"}</div>
        <h3 className="mt-1 text-[15px] font-semibold leading-6 text-foreground">{stripMarkdown(title)}</h3>
        {description ? <p className="mt-1 text-md text-foreground">{stripMarkdown(description)}</p> : null}
      </div>

      {imageUrl ? <VisualAsset src={imageUrl} title={title} /> : null}
      {!imageUrl && videoUrl ? <VisualAsset src={videoUrl} title={title} /> : null}

      {code ? (
        <div className="rounded-lg border bg-code">
          <ScrollableCode code={code} />
        </div>
      ) : null}

      {tips.length ? <BareList items={tips} /> : null}

      {buttonText && buttonLink ? <InlineLink label={buttonText} url={buttonLink} /> : null}
      {buttonText && !buttonLink ? (
        <div className="text-sm text-muted-foreground">{stripMarkdown(buttonText)}</div>
      ) : null}
    </div>
  );
}

export function PracticePromptCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const title = payloadText(payload, "title") || block.title || "실습";
  const content = payloadText(payload, "content") || payloadText(payload, "description") || block.content;
  const code = payloadText(payload, "code");
  const footer = payloadMap(payload.footer);
  const footerText = payloadText(footer, "text");

  return (
    <div className="space-y-3">
      <div className="min-w-0 max-w-3xl">
        <div className="text-xs font-medium text-muted-foreground">직접 해보기</div>
        <h3 className="mt-1 text-[15px] font-semibold leading-6 text-foreground">{stripMarkdown(title)}</h3>
        {content ? <p className="mt-1 text-md text-foreground">{stripMarkdown(content)}</p> : null}
      </div>
      {code ? (
        <div className="rounded-lg border bg-code">
          <ScrollableCode code={code} />
        </div>
      ) : null}
      {footerText ? <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{stripMarkdown(footerText)}</p> : null}
    </div>
  );
}

export // 순번 없는 항목 그리드 — 탑룰(border-t) 정의 그리드. 박스·아이콘칩 없음.
function TopRuleGrid({ items }: { items: Array<Record<string, unknown>> }) {
  return (
    <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {items.map((item, index) => <TopRuleItem item={item} key={`${payloadText(item, "title")}-${index}`} />)}
    </div>
  );
}

export function TopRuleItem({ item }: { item: Record<string, unknown> }) {
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
  const stats = payloadTextListLoose(item.stats);
  const advantages = payloadItems(item, "advantages");
  const disadvantages = payloadItems(item, "disadvantages");

  return (
    <div className="min-w-0 border-t pt-3">
      <div className="text-sm font-semibold text-foreground">{stripMarkdown(title)}</div>
      {description ? <p className="mt-1 text-sm leading-6 text-foreground/75">{stripMarkdown(description)}</p> : null}
      {points.length ? (
        <ul className="mt-2 space-y-1">
          {points.slice(0, 5).map((point, pointIndex) => (
            <li className="flex gap-2.5 text-sm leading-6 text-foreground/75" key={`${point}-${pointIndex}`}>
              <span className="mt-[0.65em] size-1 shrink-0 rounded-full bg-foreground/40" />
              <span>{stripMarkdown(point)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <DetailList items={advantages} label="장점" />
      <DetailList items={disadvantages} label="주의" />
      {stats.length ? <div className="mt-2 text-xs text-muted-foreground">{stats.join(" · ")}</div> : null}
      {code ? (
        <div className="mt-2 rounded-lg border bg-code">
          <ScrollableCode code={code} />
        </div>
      ) : null}
      {footerText ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{stripMarkdown(footerText)}</p> : null}
      {url ? <InlineLink label={payloadText(item, "buttonText") || "자료 열기"} url={url} /> : null}
    </div>
  );
}

export // 개념 ↔ 비유/예시 병치(듀얼코딩) — definition과 같은 bare 2열 그리드.
function ConceptRowCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const rows = payloadItems(payload, "rows").length ? payloadItems(payload, "rows") : payloadItems(payload, "items");
  const title = payloadText(payload, "title") || block.title || "";
  const subtitle = payloadText(payload, "description") || payloadText(payload, "subtitle");
  return (
    <div className="space-y-3">
      <SectionLead subtitle={subtitle} title={title} />
      {rows.length ? (
        <div className="max-w-3xl divide-y">
          {rows.map((row, index) => {
            const concept = payloadText(row, "concept") || payloadText(row, "title") || payloadText(row, "term") || payloadText(row, "label") || "개념";
            const explain = payloadText(row, "explain") || payloadText(row, "explanation") || payloadText(row, "analogy") || payloadText(row, "description") || payloadText(row, "content");
            const image = payloadText(row, "image") || payloadText(row, "src");
            return (
              <div className="grid gap-1.5 py-3 first:pt-0 last:pb-0 md:grid-cols-[200px_1fr] md:gap-4" key={`${concept}-${index}`}>
                <div className="text-sm font-semibold text-foreground">{stripMarkdown(concept)}</div>
                <div className="min-w-0 text-md text-foreground">
                  {explain ? <div>{renderInline(explain)}</div> : null}
                  {image ? <div className="mt-2"><VisualAsset src={image} title={concept} /></div> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : <MarkdownBlock content={block.content} />}
    </div>
  );
}

export // 권장 vs 지양 — bare 2열 + 열 헤더에만 의미색 아이콘 1개씩. 항목은 무채 불릿.
function DoDontCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const title = payloadText(payload, "title") || block.title || "";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  const doMap = payloadMap(payload.do).items ? payloadMap(payload.do) : payloadMap(payload.do || payload.good);
  const dontMap = payloadMap(payload.dont).items ? payloadMap(payload.dont) : payloadMap(payload.dont || payload.bad);
  const doItems = payloadTextList(doMap.items).length ? payloadTextList(doMap.items) : payloadTextList(payload.do);
  const dontItems = payloadTextList(dontMap.items).length ? payloadTextList(dontMap.items) : payloadTextList(payload.dont);
  const Side = ({ label, items, good }: { label: string; items: string[]; good: boolean }) => (
    <div className="min-w-0 sm:px-5 sm:first:pl-0 sm:last:pr-0">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        {good ? <Check className="size-3.5 text-success" /> : <X className="size-3.5 text-destructive" />}
        {label}
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, index) => (
          <li className="flex gap-2.5 text-md text-foreground" key={`${item}-${index}`}>
            <span className="mt-[0.65em] size-1 shrink-0 rounded-full bg-foreground/40" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="space-y-3">
      <SectionLead subtitle={subtitle} title={title} />
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-border">
        <Side good items={doItems} label={payloadText(doMap, "title") || "권장"} />
        <Side good={false} items={dontItems} label={payloadText(dontMap, "title") || "지양"} />
      </div>
    </div>
  );
}

export // 용어 정의 — bare 정의 그리드. 용어(좌) ↔ 뜻·예시(우).
function DefinitionCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const rowsRaw = payloadItems(payload, "rows").length ? payloadItems(payload, "rows") : payloadItems(payload, "items");
  const rows = rowsRaw.length ? rowsRaw : payloadText(payload, "term") ? [payload] : [];
  const title = payloadText(payload, "title") || block.title || "";
  const subtitle = payloadText(payload, "subtitle");
  return (
    <div className="space-y-3">
      <SectionLead subtitle={subtitle} title={title} />
      {rows.length ? (
        <div className="max-w-3xl divide-y">
          {rows.map((row, index) => {
            const term = payloadText(row, "term") || payloadText(row, "title") || "용어";
            const english = payloadText(row, "english") || payloadText(row, "en");
            const meaning = payloadText(row, "meaning") || payloadText(row, "definition") || payloadText(row, "description");
            const example = payloadText(row, "example");
            return (
              <div className="grid gap-1.5 py-3 first:pt-0 last:pb-0 md:grid-cols-[200px_1fr] md:gap-4" key={`${term}-${index}`}>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">{stripMarkdown(term)}</div>
                  {english ? <div className="mt-0.5 font-mono text-xs text-muted-foreground">{english}</div> : null}
                </div>
                <div className="min-w-0 space-y-1">
                  {meaning ? <div className="text-md text-foreground">{renderInline(meaning)}</div> : null}
                  {example ? <div className="text-sm leading-6 text-muted-foreground">예: {renderInline(example)}</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : <MarkdownBlock content={block.content} />}
    </div>
  );
}

export // 오개념 교정 — 라벨 2단어에만 의미색. 명도·굵기가 주 신호(취소선 없음).
function MisconceptionCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const rows = payloadItems(payload, "items").length ? payloadItems(payload, "items") : payloadItems(payload, "rows");
  const title = payloadText(payload, "title") || block.title || "흔한 오해";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  return (
    <div className="space-y-3">
      <SectionLead subtitle={subtitle} title={title} />
      {rows.length ? (
        <div className="max-w-3xl space-y-3">
          {rows.map((row, index) => {
            const myth = payloadText(row, "myth") || payloadText(row, "wrong") || payloadText(row, "misconception");
            const truth = payloadText(row, "truth") || payloadText(row, "right") || payloadText(row, "fact") || payloadText(row, "reality");
            return (
              <div className="space-y-1" key={`${myth}-${index}`}>
                <div className="flex gap-2.5 text-md">
                  <span className="w-7 shrink-0 text-xs font-semibold leading-6 text-destructive">오해</span>
                  <span className="text-muted-foreground">{renderInline(myth)}</span>
                </div>
                <div className="flex gap-2.5 text-md">
                  <span className="w-7 shrink-0 text-xs font-semibold leading-6 text-success">사실</span>
                  <span className="font-medium text-foreground">{renderInline(truth)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : <MarkdownBlock content={block.content} />}
    </div>
  );
}

export // 단계 타임라인 — 세로 rail + 번호 노드(무채 아웃라인).
function TimelineCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const rows = payloadItems(payload, "items").length ? payloadItems(payload, "items") : (payloadItems(payload, "steps").length ? payloadItems(payload, "steps") : payloadItems(payload, "events"));
  const title = payloadText(payload, "title") || block.title || "";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  return (
    <div className="space-y-3">
      <SectionLead subtitle={subtitle} title={title} />
      <div className="max-w-3xl space-y-0">
        {rows.map((row, index) => {
          const label = payloadText(row, "step") || payloadText(row, "label") || String(index + 1);
          const head = payloadText(row, "title") || payloadText(row, "name");
          const detail = payloadText(row, "description") || payloadText(row, "detail") || payloadText(row, "content");
          const last = index === rows.length - 1;
          return (
            <div className="flex gap-3" key={`${head}-${index}`}>
              <div className="flex flex-col items-center">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-medium tabular-nums text-muted-foreground">{label}</span>
                {!last ? <span className="my-1 w-px flex-1 bg-border" /> : null}
              </div>
              <div className={cn("min-w-0 flex-1", last ? "pb-0" : "pb-4")}>
                <div className="text-sm font-semibold text-foreground">{stripMarkdown(head)}</div>
                {detail ? <div className="mt-0.5 text-md text-foreground">{renderInline(detail)}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export // 지표 — 좌정렬 숫자 행. 증감만 의미색.
function StatCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const rows = payloadItems(payload, "items").length ? payloadItems(payload, "items") : (payloadItems(payload, "stats").length ? payloadItems(payload, "stats") : payloadItems(payload, "metrics"));
  const title = payloadText(payload, "title") || block.title || "";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  return (
    <div className="space-y-3">
      <SectionLead subtitle={subtitle} title={title} />
      <div className="flex flex-wrap">
        {rows.map((row, index) => {
          const value = payloadText(row, "value") || payloadText(row, "number") || payloadText(row, "stat");
          const label = payloadText(row, "label") || payloadText(row, "title") || payloadText(row, "name");
          const delta = payloadText(row, "delta") || payloadText(row, "change");
          const trend = payloadText(row, "trend");
          const down = trend === "down";
          return (
            <div className="border-l border-border px-5 py-1 first:border-l-0 first:pl-0" key={`${label}-${index}`}>
              <div className="text-2xl font-semibold tabular-nums text-foreground">{stripMarkdown(value)}</div>
              <div className="mt-0.5 text-xs font-medium text-muted-foreground">{stripMarkdown(label)}</div>
              {delta ? (
                <div className={cn("mt-0.5 inline-flex items-center gap-1 text-xs", down ? "text-destructive" : "text-success")}>
                  <TrendingUp className={cn("size-3", down && "rotate-180")} />
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

export // Before/After 코드 대비 — 박스는 무채 동일, after 라벨에만 신호 1개.
function CodeCompareCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const title = payloadText(payload, "title") || block.title || "";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  const beforeMap = payloadMap(payload.before).code ? payloadMap(payload.before) : payloadMap(payload.before || payload.bad);
  const afterMap = payloadMap(payload.after).code ? payloadMap(payload.after) : payloadMap(payload.after || payload.good);
  const beforeCode = payloadText(beforeMap, "code") || payloadText(payload, "before");
  const afterCode = payloadText(afterMap, "code") || payloadText(payload, "after");
  return (
    <div className="space-y-3">
      <SectionLead subtitle={subtitle} title={title} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="min-w-0">
          <div className="pb-1.5 text-xs text-muted-foreground">{payloadText(beforeMap, "label") || "Before"}</div>
          <div className="rounded-lg border bg-code">
            <ScrollableCode code={beforeCode} />
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 pb-1.5 text-xs font-medium text-foreground">
            <Check className="size-3 text-success" />
            {payloadText(afterMap, "label") || "After"}
          </div>
          <div className="rounded-lg border bg-code">
            <ScrollableCode code={afterCode} />
          </div>
        </div>
      </div>
    </div>
  );
}

export // 구조 분해 — 대상 코드만 박스, 토큰 해설은 탑룰 그리드.
function AnatomyCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const parts = payloadItems(payload, "parts").length
    ? payloadItems(payload, "parts")
    : (payloadItems(payload, "items").length ? payloadItems(payload, "items") : payloadItems(payload, "tokens"));
  const code = payloadText(payload, "code") || payloadText(payload, "line") || payloadText(payload, "target");
  const title = payloadText(payload, "title") || block.title || "";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  return (
    <div className="space-y-3">
      <SectionLead subtitle={subtitle} title={title} />
      {code ? (
        <div className="rounded-lg border bg-code">
          <ScrollArea className="min-w-0">
            <pre className="min-w-0 whitespace-pre-wrap break-words px-4 py-3 font-mono text-sm leading-6 text-code-foreground">{code}</pre>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      ) : null}
      {parts.length ? (
        <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">
          {parts.map((part, index) => {
            const token = payloadText(part, "token") || payloadText(part, "text") || payloadText(part, "part") || payloadText(part, "code");
            const label = payloadText(part, "label") || payloadText(part, "title") || payloadText(part, "name") || payloadText(part, "role");
            const explain = payloadText(part, "explain") || payloadText(part, "explanation") || payloadText(part, "description") || payloadText(part, "meaning");
            return (
              <div className="min-w-0 border-t pt-2.5" key={`${token}-${index}`}>
                <div className="flex flex-wrap items-baseline gap-2">
                  {token ? <code className="font-mono text-sm font-medium text-foreground">{token}</code> : null}
                  {label ? <span className="text-xs text-muted-foreground">{stripMarkdown(label)}</span> : null}
                </div>
                {explain ? <p className="mt-1 text-sm leading-6 text-foreground/75">{renderInline(explain)}</p> : null}
              </div>
            );
          })}
        </div>
      ) : <MarkdownBlock content={block.content} />}
    </div>
  );
}

export // 터미널 — 명령은 풀 강도, 출력은 dim 명도(색 없음). 시스템 응답 박스.
function TerminalCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const lines = payloadItems(payload, "lines").length
    ? payloadItems(payload, "lines")
    : (payloadItems(payload, "commands").length ? payloadItems(payload, "commands") : payloadItems(payload, "session"));
  const title = payloadText(payload, "title") || block.title || "";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  const fallback = payloadText(payload, "content") || payloadText(payload, "code");
  return (
    <div className="space-y-3">
      <SectionLead subtitle={subtitle} title={title} />
      <div className="rounded-lg border bg-code">
        <ScrollArea className="max-h-72 min-w-0">
          <div className="px-4 py-3 font-mono text-xs leading-6">
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

export // 코드 해설 — 라인 거터 + 우측 주석(worked example). 자료 박스.
function AnnotatedCodeCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const lines = payloadItems(payload, "lines").length
    ? payloadItems(payload, "lines")
    : (payloadItems(payload, "items").length ? payloadItems(payload, "items") : payloadItems(payload, "rows"));
  const title = payloadText(payload, "title") || block.title || "";
  const subtitle = payloadText(payload, "subtitle") || payloadText(payload, "description");
  const fallback = payloadText(payload, "code") || payloadText(payload, "content");
  return (
    <div className="space-y-3">
      <SectionLead subtitle={subtitle} title={title} />
      {lines.length ? (
        <div className="rounded-lg border bg-code">
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
        <div className="rounded-lg border bg-code">
          <ScrollableCode code={fallback} />
        </div>
      ) : <MarkdownBlock content={block.content} />)}
    </div>
  );
}

export function ComparisonPanel({ item }: { item: Record<string, unknown> }) {
  const title = payloadText(item, "title") || "항목";
  const subtitle = payloadText(item, "subtitle") || payloadText(item, "description");
  const items = payloadTextList(item.items).length ? payloadTextList(item.items) : payloadTextList(item.points);
  const infoBox = payloadText(item, "infoBox");

  return (
    <div className="min-w-0 border-t pt-3">
      <div className="text-sm font-semibold text-foreground">{stripMarkdown(title)}</div>
      {subtitle ? <div className="mt-0.5 text-xs text-muted-foreground">{stripMarkdown(subtitle)}</div> : null}
      {items.length ? (
        <ul className="mt-2 space-y-1">
          {items.map((entry, index) => (
            <li className="flex gap-2.5 text-sm leading-6 text-foreground/75" key={`${entry}-${index}`}>
              <span className="mt-[0.65em] size-1 shrink-0 rounded-full bg-foreground/40" />
              <span>{stripMarkdown(entry)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {infoBox ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{stripMarkdown(infoBox)}</p> : null}
    </div>
  );
}

export function DetailList({ items, label }: { items: Array<Record<string, unknown>>; label: string }) {
  if (!items.length) return null;
  return (
    <div className="mt-2 min-w-0">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <ul className="mt-1 space-y-1">
        {items.slice(0, 5).map((item, index) => {
          const title = payloadText(item, "title") || payloadText(item, "text") || payloadText(item, "label") || payloadText(item, "description") || "항목";
          const description = payloadText(item, "description") || payloadText(item, "content");
          return (
            <li className="flex gap-2.5 text-sm leading-6 text-foreground/75" key={`${title}-${index}`}>
              <span className="mt-[0.65em] size-1 shrink-0 rounded-full bg-foreground/40" />
              <span>
                <span>{stripMarkdown(title)}</span>
                {description && description !== title ? <span className="text-muted-foreground"> — {stripMarkdown(description)}</span> : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export // bare 불릿 리스트 — 읽기 계층. 항목별 박스·체크아이콘 없음.
function BareList({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  return (
    <ul className="max-w-3xl space-y-1.5">
      {items.map((item, index) => (
        <li className="flex gap-2.5 text-md text-foreground" key={`${item}-${index}`}>
          {ordered ? (
            <span className="mt-1 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">{index + 1}</span>
          ) : (
            <span className="mt-[0.65em] size-1 shrink-0 rounded-full bg-foreground/40" />
          )}
          <span>{renderInline(item)}</span>
        </li>
      ))}
    </ul>
  );
}

export function LearningTable({ rows, fallback }: { rows: Array<Record<string, unknown>>; fallback: string }) {
  if (!rows.length) return <MarkdownBlock content={fallback} />;
  const columns = Array.from(rows.reduce((keys, row) => {
    Object.keys(row).forEach((key) => keys.add(key));
    return keys;
  }, new Set<string>()));
  return (
    <ScrollArea className="rounded-lg border">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            {columns.map((column) => <th className="px-3 py-2 text-xs font-medium text-muted-foreground" key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, columnIndex) => (
                <td className={cn("px-3 py-2 text-foreground", columnIndex === 0 && "font-medium")} key={column}>{payloadText(row, column)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export function blockTypeLabel(type: string) {
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
