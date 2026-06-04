import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { blockLabel } from "@/lib/cellModel";
import {
  GRAPH_NODE_HEIGHT,
  GRAPH_NODE_WIDTH,
  layoutDependencyGraph,
} from "@/lib/dependencyGraphLayout";
import type { BlockConfig, ReactiveDiagnostics } from "@/types";

export function DependencyGraphPanel({
  blocks,
  diagnostics,
  selectedBlockId,
  onSelectBlock,
}: {
  blocks: BlockConfig[];
  diagnostics: ReactiveDiagnostics;
  selectedBlockId: string;
  onSelectBlock: (blockId: string) => void;
}) {
  const layout = useMemo(() => {
    const blockById = new Map(blocks.map((block) => [block.id, block]));
    const blockIds = diagnostics.nodes.map((node) => node.blockId);
    const labelById = (blockId: string) => {
      const block = blockById.get(blockId);
      return block ? blockLabel(block) : blockId;
    };
    return layoutDependencyGraph(blockIds, diagnostics.dependents, diagnostics.cycles, labelById);
  }, [blocks, diagnostics]);

  if (!layout.nodes.length) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-[12px] text-muted-foreground">
        셀을 실행하면 의존성 그래프가 여기 보입니다.
      </div>
    );
  }

  const nodeById = new Map(layout.nodes.map((node) => [node.blockId, node]));

  return (
    <ScrollArea className="h-full min-h-0">
      <svg width={layout.width} height={layout.height} role="img" aria-label="셀 의존성 그래프">
        <defs>
          <marker id="depArrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L7,3 L0,6 Z" style={{ fill: "var(--muted-foreground)" }} />
          </marker>
          <marker id="depArrowCycle" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L7,3 L0,6 Z" style={{ fill: "var(--destructive)" }} />
          </marker>
        </defs>
        {layout.edges.map((edge, index) => {
          const from = nodeById.get(edge.from);
          const to = nodeById.get(edge.to);
          if (!from || !to) return null;
          return (
            <line
              key={`${edge.from}-${edge.to}-${index}`}
              x1={from.x + GRAPH_NODE_WIDTH}
              y1={from.y + GRAPH_NODE_HEIGHT / 2}
              x2={to.x}
              y2={to.y + GRAPH_NODE_HEIGHT / 2}
              style={{
                stroke: edge.isBackEdge ? "var(--destructive)" : "var(--muted-foreground)",
                strokeWidth: 1.5,
                strokeDasharray: edge.isBackEdge ? "4 3" : undefined,
                opacity: edge.isBackEdge ? 0.9 : 0.55,
              }}
              markerEnd={edge.isBackEdge ? "url(#depArrowCycle)" : "url(#depArrow)"}
            />
          );
        })}
        {layout.nodes.map((node) => {
          const selected = node.blockId === selectedBlockId;
          return (
            <g
              key={node.blockId}
              style={{ cursor: "pointer" }}
              onClick={() => onSelectBlock(node.blockId)}
            >
              <rect
                x={node.x}
                y={node.y}
                width={GRAPH_NODE_WIDTH}
                height={GRAPH_NODE_HEIGHT}
                rx={6}
                style={{
                  fill: node.inCycle ? "color-mix(in oklch, var(--destructive) 12%, var(--card))" : "var(--card)",
                  stroke: selected ? "var(--ring)" : node.inCycle ? "var(--destructive)" : "var(--border)",
                  strokeWidth: selected ? 2 : 1,
                }}
              />
              <text
                x={node.x + 10}
                y={node.y + GRAPH_NODE_HEIGHT / 2 + 4}
                style={{ fill: "var(--foreground)", fontSize: "12px" }}
              >
                {truncate(node.label, 18)}
              </text>
            </g>
          );
        })}
      </svg>
    </ScrollArea>
  );
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
