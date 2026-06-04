// 의존성 그래프의 순수 레이아웃 — 셀=노드, dependents=엣지, cycles로 back-edge를 분리해
// DAG에만 longest-path 레이어링(순환에서도 무한루프 없음). 셀 수가 적은 학습 노트북 기준.

export type GraphNodeLayout = {
  blockId: string;
  label: string;
  x: number;
  y: number;
  inCycle: boolean;
};

export type GraphEdgeLayout = {
  from: string;
  to: string;
  isBackEdge: boolean;
};

export type GraphLayout = {
  nodes: GraphNodeLayout[];
  edges: GraphEdgeLayout[];
  width: number;
  height: number;
};

export const GRAPH_NODE_WIDTH = 148;
export const GRAPH_NODE_HEIGHT = 40;
const LEVEL_GAP = 72;
const ROW_GAP = 18;
const PADDING = 12;

function sharesCycle(from: string, to: string, cycleSets: Set<string>[]): boolean {
  return cycleSets.some((cycle) => cycle.has(from) && cycle.has(to));
}

export function layoutDependencyGraph(
  blockIds: string[],
  dependents: Record<string, string[]>,
  cycles: string[][],
  labelById: (blockId: string) => string,
): GraphLayout {
  const present = new Set(blockIds);
  const cycleSets = cycles.map((cycle) => new Set(cycle));
  const inCycle = new Set<string>(cycles.flat());

  const edges: GraphEdgeLayout[] = [];
  for (const from of blockIds) {
    for (const to of dependents[from] ?? []) {
      if (!present.has(to)) continue;
      edges.push({ from, to, isBackEdge: sharesCycle(from, to, cycleSets) });
    }
  }

  // 레벨 = 순환 엣지를 뺀 DAG에서의 longest-path 깊이(메모이즈 DFS, back-edge 제거로 안전).
  const forward = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.isBackEdge) continue;
    const list = forward.get(edge.from) ?? [];
    list.push(edge.to);
    forward.set(edge.from, list);
  }
  const orderIndex = new Map(blockIds.map((blockId, index) => [blockId, index]));
  const levelMemo = new Map<string, number>();
  const computeLevel = (blockId: string, visiting: Set<string>): number => {
    const cached = levelMemo.get(blockId);
    if (cached !== undefined) return cached;
    if (visiting.has(blockId)) return 0; // 안전망(이론상 forward는 비순환)
    visiting.add(blockId);
    let level = 0;
    for (const other of blockIds) {
      if (other === blockId) continue;
      if ((forward.get(other) ?? []).includes(blockId)) {
        level = Math.max(level, computeLevel(other, visiting) + 1);
      }
    }
    visiting.delete(blockId);
    levelMemo.set(blockId, level);
    return level;
  };

  const byLevel = new Map<number, string[]>();
  for (const blockId of blockIds) {
    const level = computeLevel(blockId, new Set());
    const row = byLevel.get(level) ?? [];
    row.push(blockId);
    byLevel.set(level, row);
  }

  const nodes: GraphNodeLayout[] = [];
  let maxRows = 0;
  const levels = [...byLevel.keys()].sort((a, b) => a - b);
  for (const level of levels) {
    const row = (byLevel.get(level) ?? []).sort(
      (a, b) => (orderIndex.get(a) ?? 0) - (orderIndex.get(b) ?? 0),
    );
    maxRows = Math.max(maxRows, row.length);
    row.forEach((blockId, rowIndex) => {
      nodes.push({
        blockId,
        label: labelById(blockId),
        x: PADDING + level * (GRAPH_NODE_WIDTH + LEVEL_GAP),
        y: PADDING + rowIndex * (GRAPH_NODE_HEIGHT + ROW_GAP),
        inCycle: inCycle.has(blockId),
      });
    });
  }

  const width = PADDING * 2 + (levels.length || 1) * (GRAPH_NODE_WIDTH + LEVEL_GAP) - LEVEL_GAP;
  const height = PADDING * 2 + (maxRows || 1) * (GRAPH_NODE_HEIGHT + ROW_GAP) - ROW_GAP;
  return { nodes, edges, width: Math.max(width, GRAPH_NODE_WIDTH + PADDING * 2), height: Math.max(height, GRAPH_NODE_HEIGHT + PADDING * 2) };
}
