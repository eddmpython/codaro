import DOMPurify from "dompurify";
import { marked } from "marked";

export const MAX_MERMAID_DIAGRAMS_PER_CELL = 4;

export type MarkdownPreviewSegment =
  | { kind: "html"; html: string; key: string }
  | { kind: "mermaid"; source: string; key: string };

const forbiddenMarkdownTags = [
  "button",
  "embed",
  "form",
  "iframe",
  "input",
  "link",
  "math",
  "meta",
  "object",
  "script",
  "select",
  "style",
  "svg",
  "textarea",
];

export function buildMarkdownPreviewSegments(source: string): MarkdownPreviewSegment[] {
  const rendered = marked.parse(source, {
    async: false,
    breaks: false,
    gfm: true,
  });
  const template = document.createElement("template");
  template.innerHTML = typeof rendered === "string" ? rendered : "";
  const segments: MarkdownPreviewSegment[] = [];
  let diagramCount = 0;

  for (const [index, node] of Array.from(template.content.childNodes).entries()) {
    const diagramSource = readMermaidFence(node);
    if (diagramSource !== null && diagramCount < MAX_MERMAID_DIAGRAMS_PER_CELL) {
      segments.push({
        key: `mermaid-${index}`,
        kind: "mermaid",
        source: diagramSource,
      });
      diagramCount += 1;
      continue;
    }
    const html = sanitizeMarkdownFragment(serializeNode(node));
    if (html) segments.push({ key: `html-${index}`, kind: "html", html });
  }

  if (diagramCount === MAX_MERMAID_DIAGRAMS_PER_CELL) {
    const totalDiagramCount = Array.from(template.content.querySelectorAll("pre > code"))
      .filter((code) => code.classList.contains("language-mermaid"))
      .length;
    if (totalDiagramCount > MAX_MERMAID_DIAGRAMS_PER_CELL) {
      segments.push({
        key: "diagram-budget",
        kind: "html",
        html: `<p role="status">한 Markdown 셀에는 Mermaid 다이어그램을 ${MAX_MERMAID_DIAGRAMS_PER_CELL}개까지 표시합니다.</p>`,
      });
    }
  }
  return segments;
}

export function sanitizeMarkdownFragment(html: string): string {
  const sanitized = String(DOMPurify.sanitize(html, {
    ALLOW_ARIA_ATTR: true,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    FORBID_ATTR: ["formaction", "srcdoc", "style"],
    FORBID_TAGS: forbiddenMarkdownTags,
    USE_PROFILES: { html: true },
  }));
  const template = document.createElement("template");
  template.innerHTML = sanitized;
  for (const anchor of template.content.querySelectorAll("a")) {
    anchor.removeAttribute("target");
    anchor.setAttribute("rel", "noreferrer noopener");
  }
  for (const image of template.content.querySelectorAll("img")) {
    image.setAttribute("loading", "lazy");
  }
  return template.innerHTML;
}

function readMermaidFence(node: Node): string | null {
  if (!(node instanceof HTMLPreElement)) return null;
  if (node.children.length !== 1) return null;
  const code = node.firstElementChild;
  if (!(code instanceof HTMLElement) || code.tagName !== "CODE") return null;
  if (!code.classList.contains("language-mermaid")) return null;
  return code.textContent?.trim() ?? "";
}

function serializeNode(node: Node): string {
  const container = document.createElement("div");
  container.append(node.cloneNode(true));
  return container.innerHTML;
}
