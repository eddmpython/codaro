import { useEffect, useId, useRef, useState } from "react";

import { LoadingInline } from "@/components/app/appPrimitives";
import { readMermaidPalette, renderMermaidDiagram } from "@/lib/mermaidDiagram";

type MermaidRenderState =
  | { status: "idle"; svg: ""; error: "" }
  | { status: "loading"; svg: ""; error: "" }
  | { status: "ready"; svg: string; error: "" }
  | { status: "error"; svg: ""; error: string };

export function MermaidDiagram({ source, title }: { source: string; title: string }) {
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [themeRevision, setThemeRevision] = useState(0);
  const [renderState, setRenderState] = useState<MermaidRenderState>({
    error: "",
    status: "idle",
    svg: "",
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isVisible) return;
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeRevision((current) => current + 1));
    observer.observe(document.documentElement, {
      attributeFilter: ["data-accent", "data-theme"],
      attributes: true,
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isVisible) return;
    let active = true;
    setRenderState({ error: "", status: "loading", svg: "" });
    const id = `codaro-mermaid-${reactId.replace(/[^A-Za-z0-9_-]/g, "")}`;
    void renderMermaidDiagram({
      id,
      palette: readMermaidPalette(container),
      source,
      title,
    }).then(
      (svg) => {
        if (active) setRenderState({ error: "", status: "ready", svg });
      },
      (error: unknown) => {
        if (active) {
          setRenderState({
            error: error instanceof Error ? error.message : "다이어그램을 렌더링하지 못했습니다.",
            status: "error",
            svg: "",
          });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [isVisible, reactId, source, themeRevision, title]);

  return (
    <figure
      aria-busy={renderState.status === "loading"}
      className="markdownDiagramFigure"
      data-markdown-diagram={renderState.status}
      ref={containerRef}
    >
      <figcaption className="markdownDiagramCaption">{title}</figcaption>
      <pre className="sr-only" data-markdown-diagram-text-alternative="true">{source}</pre>
      {renderState.status === "idle" ? (
        <div className="markdownDiagramLoading" role="status">
          다이어그램이 보이는 위치에서 자동으로 렌더링합니다.
        </div>
      ) : null}
      {renderState.status === "loading" ? (
        <div className="markdownDiagramLoading" role="status">
          <LoadingInline label="다이어그램 렌더링 중" />
        </div>
      ) : null}
      {renderState.status === "ready" ? (
        <div
          aria-label={title}
          className="markdownDiagramViewport"
          data-markdown-diagram-svg="true"
          dangerouslySetInnerHTML={{ __html: renderState.svg }}
          role="group"
        />
      ) : null}
      {renderState.status === "error" ? (
        <div className="markdownDiagramError" role="alert">
          <strong>다이어그램을 표시할 수 없습니다.</strong>
          <span>{renderState.error}</span>
        </div>
      ) : null}
    </figure>
  );
}
