import { useMemo } from "react";

import { MermaidDiagram } from "@/components/notebook/mermaidDiagram";
import { buildMarkdownPreviewSegments } from "@/lib/markdownPreview";

export function MarkdownPreview({ label, source, onSelect }: {
  label: string;
  source: string;
  onSelect: () => void;
}) {
  const segments = useMemo(() => buildMarkdownPreviewSegments(source), [source]);
  let diagramIndex = 0;
  return (
    <div
      className="astryxWorkCellFrame notebookMarkdownPreview prose prose-sm"
      data-notebook-markdown-preview="true"
      onClick={onSelect}
    >
      {segments.map((segment) => {
        if (segment.kind === "mermaid") {
          diagramIndex += 1;
          return (
            <MermaidDiagram
              key={segment.key}
              source={segment.source}
              title={`${label} 다이어그램 ${diagramIndex}`}
            />
          );
        }
        return <div key={segment.key} dangerouslySetInnerHTML={{ __html: segment.html }} />;
      })}
    </div>
  );
}
