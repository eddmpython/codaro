export interface PendingDiff {
  id: string;
  blockId: string;
  originalContent: string;
  proposedContent: string;
  toolCallId: string;
  timestamp: number;
}

let pendingDiffs = $state<PendingDiff[]>([]);

export function getPendingDiffs(): PendingDiff[] {
  return pendingDiffs;
}

export function getDiffForBlock(blockId: string): PendingDiff | undefined {
  return pendingDiffs.find(d => d.blockId === blockId);
}

export function hasPendingDiff(blockId: string): boolean {
  return pendingDiffs.some(d => d.blockId === blockId);
}

export function addPendingDiff(diff: Omit<PendingDiff, "id">): void {
  const entry: PendingDiff = {
    ...diff,
    id: `diff-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
  pendingDiffs = [...pendingDiffs, entry];
}

export function acceptDiff(blockId: string): PendingDiff | undefined {
  const diff = pendingDiffs.find(d => d.blockId === blockId);
  if (diff) {
    pendingDiffs = pendingDiffs.filter(d => d.blockId !== blockId);
  }
  return diff;
}

export function rejectDiff(blockId: string): void {
  pendingDiffs = pendingDiffs.filter(d => d.blockId !== blockId);
}

export function acceptAllDiffs(): PendingDiff[] {
  const accepted = [...pendingDiffs];
  pendingDiffs = [];
  return accepted;
}

export function rejectAllDiffs(): void {
  pendingDiffs = [];
}

export function getPendingDiffCount(): number {
  return pendingDiffs.length;
}

export function clearDiffs(): void {
  pendingDiffs = [];
}
