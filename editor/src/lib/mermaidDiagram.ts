import DOMPurify from "dompurify";
import type { MermaidConfig } from "mermaid";

export const MERMAID_DIAGRAM_BUDGET = {
  edges: 40,
  labelCharacters: 160,
  lines: 160,
  nodes: 24,
  sourceCharacters: 12_000,
} as const;

let mermaidRenderQueue: Promise<void> = Promise.resolve();

export type MermaidPalette = {
  accent: string;
  accentSurface: string;
  background: string;
  border: string;
  fontFamily: string;
  muted: string;
  surface: string;
  text: string;
  theme: "dark" | "light";
};

export function readMermaidPalette(element: HTMLElement): MermaidPalette {
  const styles = getComputedStyle(element);
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  return {
    accent: read("--color-accent", theme === "dark" ? "#aeb4ff" : "#4f46c8"),
    accentSurface: read("--color-accent-muted", theme === "dark" ? "#292a4d" : "#ebeafe"),
    background: read("--color-background-body", theme === "dark" ? "#151619" : "#f5f6f8"),
    border: read("--color-border", theme === "dark" ? "#34373d" : "#d9dde3"),
    fontFamily: read("--font-family-body", "ui-sans-serif, system-ui, sans-serif"),
    muted: read("--color-text-secondary", theme === "dark" ? "#aeb3bd" : "#5d626d"),
    surface: read("--color-background-surface", theme === "dark" ? "#222327" : "#ffffff"),
    text: read("--color-text-primary", theme === "dark" ? "#f5f6f8" : "#18191d"),
    theme,
  };
}

export function validateMermaidSource(source: string): string | null {
  const trimmed = source.trim();
  if (!trimmed) return "다이어그램 원문이 비어 있습니다.";
  if (trimmed.length > MERMAID_DIAGRAM_BUDGET.sourceCharacters) {
    return `다이어그램 원문은 ${MERMAID_DIAGRAM_BUDGET.sourceCharacters.toLocaleString()}자 이하여야 합니다.`;
  }
  const lines = trimmed.split(/\r?\n/);
  if (lines.length > MERMAID_DIAGRAM_BUDGET.lines) {
    return `다이어그램은 ${MERMAID_DIAGRAM_BUDGET.lines}줄 이하여야 합니다.`;
  }
  if (lines.some((line) => line.length > MERMAID_DIAGRAM_BUDGET.labelCharacters)) {
    return `다이어그램의 한 줄은 ${MERMAID_DIAGRAM_BUDGET.labelCharacters}자 이하여야 합니다.`;
  }
  if (trimmed.startsWith("---") || /%%\s*\{\s*(?:init|initialize)\s*:/i.test(trimmed)) {
    return "셀별 Mermaid 설정은 사용할 수 없습니다. Codaro 디자인 토큰이 표시를 결정합니다.";
  }
  if (/^\s*click\s+/im.test(trimmed)) {
    return "다이어그램의 클릭 동작은 사용할 수 없습니다.";
  }
  if (/(?:[a-z][a-z\d+.-]*:\/\/|\bwww\.)/i.test(trimmed)) {
    return "다이어그램은 외부 리소스나 URL을 포함할 수 없습니다.";
  }
  if (/<\s*\/?\s*[a-z][^>]*>/i.test(trimmed)) {
    return "다이어그램 label에는 HTML을 사용할 수 없습니다.";
  }
  const edgeCount = (trimmed.match(/(?:--+>|==+>|-\.+>|--+|==+)/g) ?? []).length;
  if (edgeCount > MERMAID_DIAGRAM_BUDGET.edges) {
    return `다이어그램 연결은 ${MERMAID_DIAGRAM_BUDGET.edges}개 이하여야 합니다.`;
  }
  return null;
}

export function renderMermaidDiagram({
  id,
  palette,
  source,
  title,
}: {
  id: string;
  palette: MermaidPalette;
  source: string;
  title: string;
}): Promise<string> {
  const validationError = validateMermaidSource(source);
  if (validationError) return Promise.reject(new Error(validationError));

  return enqueueMermaidRender(async () => {
    const module = await import("mermaid");
    const mermaid = module.default;
    mermaid.initialize(mermaidConfig(id, palette));
    await mermaid.parse(source);
    const rendered = await mermaid.render(id, source);
    return sanitizeMermaidSvg(rendered.svg, title);
  });
}

function enqueueMermaidRender<T>(render: () => Promise<T>): Promise<T> {
  const task = mermaidRenderQueue.catch(() => undefined).then(render);
  mermaidRenderQueue = task.then(() => undefined, () => undefined);
  return task;
}

function mermaidConfig(seed: string, palette: MermaidPalette): MermaidConfig {
  return {
    deterministicIds: true,
    deterministicIDSeed: seed,
    fontFamily: palette.fontFamily,
    handDrawnSeed: 1,
    htmlLabels: false,
    logLevel: "fatal",
    look: "classic",
    maxEdges: MERMAID_DIAGRAM_BUDGET.edges,
    maxTextSize: MERMAID_DIAGRAM_BUDGET.sourceCharacters,
    secure: [
      "secure",
      "securityLevel",
      "startOnLoad",
      "maxTextSize",
      "maxEdges",
      "theme",
      "themeVariables",
      "themeCSS",
      "fontFamily",
      "htmlLabels",
    ],
    securityLevel: "strict",
    startOnLoad: false,
    suppressErrorRendering: true,
    theme: "base",
    themeVariables: {
      background: palette.background,
      darkMode: palette.theme === "dark",
      fontFamily: palette.fontFamily,
      lineColor: palette.muted,
      mainBkg: palette.surface,
      nodeBorder: palette.border,
      primaryBorderColor: palette.accent,
      primaryColor: palette.accentSurface,
      primaryTextColor: palette.text,
      secondaryBorderColor: palette.border,
      secondaryColor: palette.surface,
      secondaryTextColor: palette.text,
      tertiaryBorderColor: palette.border,
      tertiaryColor: palette.background,
      tertiaryTextColor: palette.text,
      textColor: palette.text,
    },
  };
}

function sanitizeMermaidSvg(svg: string, title: string): string {
  const sanitized = String(DOMPurify.sanitize(svg, {
    ALLOW_ARIA_ATTR: true,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    FORBID_TAGS: ["a", "foreignObject", "iframe", "image", "script"],
    USE_PROFILES: { svg: true, svgFilters: true },
  }));
  const parser = new DOMParser();
  const document = parser.parseFromString(sanitized, "image/svg+xml");
  if (document.querySelector("parsererror")) throw new Error("다이어그램 SVG를 안전하게 해석하지 못했습니다.");
  const svgElement = document.documentElement;
  for (const element of svgElement.querySelectorAll("[href], [xlink\\:href]")) {
    const href = element.getAttribute("href") ?? element.getAttribute("xlink:href") ?? "";
    if (!href.startsWith("#")) {
      element.removeAttribute("href");
      element.removeAttribute("xlink:href");
    }
  }
  const renderedNodeCount = countRenderedNodes(svgElement);
  if (renderedNodeCount > MERMAID_DIAGRAM_BUDGET.nodes) {
    throw new Error(`다이어그램 노드는 ${MERMAID_DIAGRAM_BUDGET.nodes}개 이하여야 합니다.`);
  }
  svgElement.setAttribute("aria-label", title);
  svgElement.setAttribute("role", "img");
  svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svgElement.removeAttribute("height");
  svgElement.removeAttribute("width");
  return new XMLSerializer().serializeToString(svgElement);
}

function countRenderedNodes(svg: Element): number {
  const identities = new Set<string>();
  const candidates = svg.querySelectorAll(
    "g.node, g.actor, g.classGroup, g.entityBox, g.mindmap-node, g.stateGroup, g.task, g.timeline-node",
  );
  for (const [index, node] of Array.from(candidates).entries()) {
    const actorIdentity = node.classList.contains("actor") ? node.textContent?.trim() : "";
    const identity = actorIdentity
      || node.getAttribute("data-id")
      || node.getAttribute("id")
      || node.textContent?.trim()
      || String(index);
    identities.add(identity.replace(/\s+/g, " "));
  }
  return identities.size;
}
