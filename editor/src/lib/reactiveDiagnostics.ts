import type { ReactiveDiagnostics } from "@/types";

export const emptyReactiveDiagnostics: ReactiveDiagnostics = {
  cycles: [],
  multipleDefinitions: [],
  crossCellMutations: [],
  staleBlockIds: [],
  dependents: {},
  definedBy: {},
  nodes: [],
  selfImports: [],
  definitionOrder: [],
  emptyCells: [],
  unsafeCalls: [],
};

// dirty 셀 + 의존성 전이 다운스트림 = stale 집합(순수 BFS, 백엔드 dependents 인접 재사용).
export function computeStaleBlockIds(
  dependents: Record<string, string[]>,
  dirtyBlockIds: Set<string>,
): Set<string> {
  const stale = new Set<string>(dirtyBlockIds);
  const queue = [...dirtyBlockIds];
  while (queue.length) {
    const current = queue.shift() as string;
    for (const downstream of dependents[current] ?? []) {
      if (!stale.has(downstream)) {
        stale.add(downstream);
        queue.push(downstream);
      }
    }
  }
  return stale;
}

export type CellDiagnosticChip = {
  kind:
    | "multiple-definition"
    | "cross-cell-mutation"
    | "self-import"
    | "definition-order"
    | "empty-cell"
    | "unsafe-call";
  label: string;
};

// 셀에 표시할 노란 advisory 칩(순환은 conflict status + 상단 배너로 별도 처리).
export function cellDiagnosticChips(diagnostics: ReactiveDiagnostics, blockId: string): CellDiagnosticChip[] {
  const chips: CellDiagnosticChip[] = [];
  const multiVars = diagnostics.multipleDefinitions
    .filter(([, blockIds]) => blockIds.includes(blockId))
    .map(([name]) => name);
  if (multiVars.length) {
    chips.push({ kind: "multiple-definition", label: `다중정의: ${multiVars.join(", ")}` });
  }
  const mutatedVars = diagnostics.crossCellMutations
    .filter(([, mutatorBlockId]) => mutatorBlockId === blockId)
    .map(([name]) => name);
  if (mutatedVars.length) {
    chips.push({ kind: "cross-cell-mutation", label: `외부 변경: ${mutatedVars.join(", ")}` });
  }
  const selfImported = diagnostics.selfImports.filter(([cell]) => cell === blockId).map(([, module]) => module);
  if (selfImported.length) {
    chips.push({ kind: "self-import", label: `자기 import: ${selfImported.join(", ")}` });
  }
  const lateVars = diagnostics.definitionOrder.filter(([, useCell]) => useCell === blockId).map(([name]) => name);
  if (lateVars.length) {
    chips.push({ kind: "definition-order", label: `정의 순서: ${lateVars.join(", ")}` });
  }
  if (diagnostics.emptyCells.includes(blockId)) {
    chips.push({ kind: "empty-cell", label: "빈 셀" });
  }
  const unsafe = diagnostics.unsafeCalls.filter(([cell]) => cell === blockId).map(([, call]) => call);
  if (unsafe.length) {
    chips.push({ kind: "unsafe-call", label: `주의 호출: ${unsafe.join(", ")}` });
  }
  return chips;
}

export function blockInCycle(diagnostics: ReactiveDiagnostics, blockId: string): boolean {
  return diagnostics.cycles.some((cycle) => cycle.includes(blockId));
}

// 상단 배너 문구 — "a → b → a" 형태로 순환 경로를 보여준다.
export function formatCyclePaths(cycles: string[][]): string[] {
  return cycles.map((cycle) => [...cycle, cycle[0]].join(" → "));
}
