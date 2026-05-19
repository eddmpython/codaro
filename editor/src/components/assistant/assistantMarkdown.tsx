import { Fragment } from "react";

type MarkdownBlock =
  | { type: "code"; code: string; language: string }
  | { type: "heading"; level: number; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

export function AssistantMarkdown({ content }: { content: string }) {
  const blocks = parseMarkdown(content);
  return (
    <div className="space-y-3 text-sm leading-7 text-foreground">
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <pre className="overflow-x-auto rounded-md bg-code p-3 font-mono text-xs leading-5 text-code-foreground" key={index}>
              <code>{block.code}</code>
            </pre>
          );
        }
        if (block.type === "heading") {
          const Heading = block.level <= 2 ? "h3" : "h4";
          return (
            <Heading className="pt-1 text-base font-semibold tracking-normal text-foreground" key={index}>
              {renderInline(block.text)}
            </Heading>
          );
        }
        if (block.type === "list") {
          return (
            <ul className="space-y-1 pl-4" key={index}>
              {block.items.map((item, itemIndex) => (
                <li className="list-disc pl-1 text-muted-foreground" key={itemIndex}>
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p className="whitespace-pre-wrap break-words text-muted-foreground" key={index}>
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

function parseMarkdown(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const codePattern = /```([^\n`]*)\n?([\s\S]*?)```/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = codePattern.exec(content))) {
    blocks.push(...parseProse(content.slice(cursor, match.index)));
    blocks.push({
      type: "code",
      language: match[1]?.trim() ?? "",
      code: match[2]?.replace(/\n$/, "") ?? "",
    });
    cursor = match.index + match[0].length;
  }

  blocks.push(...parseProse(content.slice(cursor)));
  return blocks;
}

function parseProse(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: paragraph.join("\n").trim() });
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push({ type: "list", items: listItems });
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }

    const list = /^[-*]\s+(.+)$/.exec(trimmed);
    if (list) {
      flushParagraph();
      listItems.push(list[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground" key={index}>
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong className="font-semibold text-foreground" key={index}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}
