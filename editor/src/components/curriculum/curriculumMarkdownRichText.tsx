import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { stripMarkdown } from "@/lib/cellModel";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { BareList } from "./curriculumMarkdownDataCells";
import { VisualAsset } from "./curriculumMarkdownMedia";

export function InlineLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate text-sm font-medium text-accent-brand underline-offset-4 hover:underline"
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <ExternalLink className="size-3.5 shrink-0" />
      <span className="truncate">{stripMarkdown(label || url)}</span>
    </a>
  );
}

export function isSafeHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("/");
}

export // 링크와 인라인 코드를 의미 있는 요소로 남긴다. 조각 경계의 공백을 보존해야
// `주석 (Comment)`와 `print(123)` 같은 교육 문장이 서로 붙지 않는다.
// href는 스킴 화이트리스트(http/https/선두 /)만 앵커 — javascript:/data: 등은 평문으로 떨군다(XSS 차단).
function renderInline(text: string): ReactNode {
  const tokenRe = /\[([^\]]+)\]\(([^)]+)\)|`([^`\n]+)`/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(cleanInlineSegment(text.slice(lastIndex, match.index)));
    if (match[3] !== undefined) {
      parts.push(
        <code
          className="rounded-sm bg-code px-1 py-0.5 font-mono text-[0.9em] text-code-foreground"
          key={`code-${key++}`}
        >
          {match[3]}
        </code>,
      );
      lastIndex = tokenRe.lastIndex;
      continue;
    }
    const label = match[1];
    const href = match[2].trim();
    if (isSafeHref(href)) {
      const external = !href.startsWith("/");
      parts.push(
        <a
          className="font-medium text-accent-brand underline-offset-4 hover:underline"
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
    lastIndex = tokenRe.lastIndex;
  }
  if (lastIndex < text.length) parts.push(cleanInlineSegment(text.slice(lastIndex)));
  return parts.length ? parts : cleanInlineSegment(text);
}

export function cleanInlineSegment(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/\s+/g, " ");
}

export function MarkdownBlock({ content }: { content: string }) {
  const lines = normalizeRichText(content).split("\n");
  const rendered: ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let orderedBuffer: string[] = [];

  const flushLists = (key: string) => {
    if (bulletBuffer.length) {
      rendered.push(<BareList items={bulletBuffer} key={`ul-${key}`} />);
      bulletBuffer = [];
    }
    if (orderedBuffer.length) {
      rendered.push(<BareList items={orderedBuffer} key={`ol-${key}`} ordered />);
      orderedBuffer = [];
    }
  };

  lines.forEach((line, index) => {
    const key = `${index}-${line.slice(0, 12)}`;
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (orderedBuffer.length) flushLists(key);
      bulletBuffer.push(line.slice(2));
      return;
    }
    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      if (bulletBuffer.length) flushLists(key);
      orderedBuffer.push(orderedMatch[1]);
      return;
    }
    flushLists(key);
    if (!line.trim()) return;
    const imageMatch = line.match(/^!\[(.*)]\((.*)\)$/);
    if (imageMatch) {
      rendered.push(<VisualAsset key={key} src={imageMatch[2]} title={imageMatch[1]} />);
      return;
    }
    if (line.startsWith("# ")) {
      rendered.push(<h2 className="text-lg font-semibold text-foreground" key={key}>{line.replace(/^#\s+/, "")}</h2>);
      return;
    }
    if (line.startsWith("## ")) {
      rendered.push(<h3 className="text-[15px] font-semibold leading-6 text-foreground" key={key}>{line.replace(/^##\s+/, "")}</h3>);
      return;
    }
    if (line.startsWith("### ")) {
      rendered.push(<h4 className="text-sm font-semibold text-foreground" key={key}>{line.replace(/^###\s+/, "")}</h4>);
      return;
    }
    if (line.startsWith("#### ")) {
      rendered.push(<h5 className="text-sm font-medium text-foreground" key={key}>{line.replace(/^####\s+/, "")}</h5>);
      return;
    }
    if (line.startsWith("> ")) {
      rendered.push(
        <blockquote className="border-l-2 border-border pl-4 text-md text-muted-foreground" key={key}>
          {renderInline(line.slice(2))}
        </blockquote>,
      );
      return;
    }
    if (line.trim().startsWith("|")) {
      rendered.push(<ScrollableInlineText key={key} text={line} />);
      return;
    }
    rendered.push(<p className="text-md text-foreground" key={key}>{renderInline(line)}</p>);
  });
  flushLists("tail");

  return <div className="min-w-0 max-w-3xl space-y-3 break-words">{rendered}</div>;
}

export function ScrollableCode({ code }: { code: string }) {
  const tall = code.split("\n").length > 24;
  return (
    <ScrollArea className={cn("min-w-0", tall && "max-h-96")}>
      <pre className="min-w-0 whitespace-pre-wrap break-words px-4 py-3 font-mono text-[13px] leading-6 text-code-foreground">{code}</pre>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export function ScrollableInlineText({ text }: { text: string }) {
  return (
    <ScrollArea className="min-w-0">
      <pre className="min-w-max py-0.5 font-mono text-xs text-muted-foreground">{text}</pre>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export function normalizeRichText(content: string) {
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
