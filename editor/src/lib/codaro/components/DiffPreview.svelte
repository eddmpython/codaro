<script lang="ts">
  import { Check, X } from "lucide-svelte";

  interface Props {
    originalContent: string;
    proposedContent: string;
    onAccept: () => void;
    onReject: () => void;
  }

  let { originalContent, proposedContent, onAccept, onReject }: Props = $props();

  interface DiffLine {
    type: "same" | "added" | "removed";
    content: string;
    lineNumber: number | null;
    newLineNumber: number | null;
  }

  function computeDiff(original: string, proposed: string): DiffLine[] {
    const oldLines = original.split("\n");
    const newLines = proposed.split("\n");
    const result: DiffLine[] = [];

    const maxLen = Math.max(oldLines.length, newLines.length);
    const lcs = buildLCS(oldLines, newLines);

    let oi = 0;
    let ni = 0;
    let li = 0;

    while (oi < oldLines.length || ni < newLines.length) {
      if (li < lcs.length && oi < oldLines.length && ni < newLines.length && oldLines[oi] === lcs[li] && newLines[ni] === lcs[li]) {
        result.push({ type: "same", content: oldLines[oi], lineNumber: oi + 1, newLineNumber: ni + 1 });
        oi++;
        ni++;
        li++;
      } else if (li < lcs.length && oi < oldLines.length && oldLines[oi] !== lcs[li]) {
        result.push({ type: "removed", content: oldLines[oi], lineNumber: oi + 1, newLineNumber: null });
        oi++;
      } else if (li < lcs.length && ni < newLines.length && newLines[ni] !== lcs[li]) {
        result.push({ type: "added", content: newLines[ni], lineNumber: null, newLineNumber: ni + 1 });
        ni++;
      } else if (oi < oldLines.length) {
        result.push({ type: "removed", content: oldLines[oi], lineNumber: oi + 1, newLineNumber: null });
        oi++;
      } else if (ni < newLines.length) {
        result.push({ type: "added", content: newLines[ni], lineNumber: null, newLineNumber: ni + 1 });
        ni++;
      } else {
        break;
      }
    }

    return result;
  }

  function buildLCS(a: string[], b: string[]): string[] {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const result: string[] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        result.unshift(a[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    return result;
  }

  let diffLines = $derived(computeDiff(originalContent, proposedContent));
  let addedCount = $derived(diffLines.filter(l => l.type === "added").length);
  let removedCount = $derived(diffLines.filter(l => l.type === "removed").length);
</script>

<div class="diff-preview">
  <div class="diff-header">
    <div class="diff-stats">
      <span class="stat-added">+{addedCount}</span>
      <span class="stat-removed">-{removedCount}</span>
    </div>
    <div class="diff-actions">
      <button class="diff-btn accept" onclick={onAccept} title="Accept changes">
        <Check size={14} />
        <span>Accept</span>
      </button>
      <button class="diff-btn reject" onclick={onReject} title="Reject changes">
        <X size={14} />
        <span>Reject</span>
      </button>
    </div>
  </div>
  <div class="diff-content">
    {#each diffLines as line}
      <div class="diff-line {line.type}">
        <span class="line-number">{line.lineNumber ?? line.newLineNumber ?? ""}</span>
        <span class="line-marker">{line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}</span>
        <span class="line-text">{line.content || " "}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .diff-preview {
    border: 1px solid var(--codaro-border, #333);
    border-radius: 6px;
    overflow: hidden;
    font-family: var(--codaro-font-mono, "Fira Mono", monospace);
    font-size: 0.8125rem;
    margin: 4px 0;
  }

  .diff-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: var(--codaro-surface-2, #1a1a1a);
    border-bottom: 1px solid var(--codaro-border, #333);
  }

  .diff-stats {
    display: flex;
    gap: 8px;
    font-size: 0.75rem;
  }

  .stat-added {
    color: #4ade80;
  }

  .stat-removed {
    color: #f87171;
  }

  .diff-actions {
    display: flex;
    gap: 6px;
  }

  .diff-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border: none;
    border-radius: 4px;
    font-size: 0.6875rem;
    cursor: pointer;
    font-family: inherit;
  }

  .diff-btn.accept {
    background: #166534;
    color: #bbf7d0;
  }

  .diff-btn.accept:hover {
    background: #15803d;
  }

  .diff-btn.reject {
    background: #7f1d1d;
    color: #fecaca;
  }

  .diff-btn.reject:hover {
    background: #991b1b;
  }

  .diff-content {
    max-height: 300px;
    overflow-y: auto;
  }

  .diff-line {
    display: flex;
    line-height: 1.5;
    padding: 0 4px;
  }

  .diff-line.added {
    background: rgba(74, 222, 128, 0.1);
  }

  .diff-line.removed {
    background: rgba(248, 113, 113, 0.1);
  }

  .line-number {
    width: 36px;
    text-align: right;
    padding-right: 8px;
    color: var(--codaro-text-muted, #666);
    flex-shrink: 0;
    user-select: none;
  }

  .line-marker {
    width: 16px;
    flex-shrink: 0;
    text-align: center;
    user-select: none;
  }

  .diff-line.added .line-marker {
    color: #4ade80;
  }

  .diff-line.removed .line-marker {
    color: #f87171;
  }

  .line-text {
    white-space: pre;
    flex: 1;
    min-width: 0;
  }
</style>
