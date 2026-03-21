<script lang="ts">
  import { ChevronRight, Lightbulb } from "lucide-svelte";

  interface Props {
    hints: string[];
    revealedCount?: number;
  }

  let { hints, revealedCount = 0 }: Props = $props();

  let revealed = $state(revealedCount);

  function revealNext() {
    if (revealed < hints.length) {
      revealed += 1;
    }
  }

  const hintLabels = ["Concept Hint", "Structure Hint", "Solution Hint"];
</script>

<div class="hint-accordion" data-testid="hint-accordion">
  {#each hints as hint, i}
    {#if i < revealed}
      <div class="hint-item revealed" data-hint-level={i + 1}>
        <div class="hint-header">
          <Lightbulb class="h-3.5 w-3.5 text-amber-500" />
          <span class="hint-label">{hintLabels[i] ?? `Hint ${i + 1}`}</span>
        </div>
        <div class="hint-body">{hint}</div>
      </div>
    {/if}
  {/each}

  {#if revealed < hints.length}
    <button class="hint-reveal-btn" onclick={revealNext}>
      <ChevronRight class="h-3.5 w-3.5" />
      <span>Show {hintLabels[revealed] ?? `Hint ${revealed + 1}`}</span>
      <span class="hint-counter">({revealed}/{hints.length})</span>
    </button>
  {:else if hints.length > 0}
    <div class="hint-all-shown">All hints revealed</div>
  {/if}
</div>

<style>
  .hint-accordion {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .hint-item {
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
  }

  .hint-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: hsl(45 93% 47% / 0.08);
    font-size: 11px;
    font-weight: 600;
    color: var(--foreground);
  }

  .hint-label {
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .hint-body {
    padding: 8px 10px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--foreground);
  }

  .hint-reveal-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border: 1px dashed var(--border);
    border-radius: 6px;
    background: transparent;
    font-size: 12px;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .hint-reveal-btn:hover {
    background: var(--accent);
    color: var(--foreground);
    border-style: solid;
  }

  .hint-counter {
    font-size: 10px;
    opacity: 0.7;
  }

  .hint-all-shown {
    font-size: 11px;
    color: var(--muted-foreground);
    text-align: center;
    padding: 4px;
  }
</style>
