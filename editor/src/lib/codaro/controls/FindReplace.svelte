<script lang="ts">
  import { X, ChevronDown, ChevronUp, Replace } from "lucide-svelte";

  interface Props {
    open?: boolean;
    onClose?: () => void;
    onFind?: (query: string, options: { caseSensitive: boolean; regex: boolean }) => void;
    onReplace?: (query: string, replacement: string) => void;
    onReplaceAll?: (query: string, replacement: string) => void;
    matchCount?: number;
    currentMatch?: number;
    onNext?: () => void;
    onPrevious?: () => void;
  }

  let {
    open = false,
    onClose = () => {},
    onFind = () => {},
    onReplace = () => {},
    onReplaceAll = () => {},
    matchCount = 0,
    currentMatch = 0,
    onNext = () => {},
    onPrevious = () => {}
  }: Props = $props();

  let findQuery = $state("");
  let replaceQuery = $state("");
  let showReplace = $state(false);
  let caseSensitive = $state(false);
  let useRegex = $state(false);
  let findInput: HTMLInputElement | undefined = $state();

  $effect(() => {
    if (open && findInput) {
      requestAnimationFrame(() => findInput?.focus());
    }
  });

  $effect(() => {
    if (findQuery) {
      onFind(findQuery, { caseSensitive, regex: useRegex });
    }
  });

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onNext();
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      onPrevious();
    }
  }
</script>

{#if open}
  <div class="findReplace" role="dialog" aria-label="Find and replace" tabindex="-1" onkeydown={handleKeydown}>
    <div class="findRow">
      <input
        bind:this={findInput}
        bind:value={findQuery}
        class="findInput"
        placeholder="Find"
        cmdk-input=""
      />
      <span class="matchInfo">
        {#if findQuery}
          {currentMatch}/{matchCount}
        {/if}
      </span>
      <button class="iconBtn" onclick={onPrevious} aria-label="Previous match" disabled={matchCount === 0}>
        <ChevronUp class="h-3.5 w-3.5" />
      </button>
      <button class="iconBtn" onclick={onNext} aria-label="Next match" disabled={matchCount === 0}>
        <ChevronDown class="h-3.5 w-3.5" />
      </button>
      <button
        class="iconBtn"
        class:active={caseSensitive}
        onclick={() => { caseSensitive = !caseSensitive; }}
        aria-label="Case sensitive"
        title="Case sensitive"
      >
        Aa
      </button>
      <button
        class="iconBtn"
        class:active={useRegex}
        onclick={() => { useRegex = !useRegex; }}
        aria-label="Regular expression"
        title="Regular expression"
      >
        .*
      </button>
      <button
        class="iconBtn"
        onclick={() => { showReplace = !showReplace; }}
        aria-label="Toggle replace"
      >
        <Replace class="h-3.5 w-3.5" />
      </button>
      <button class="iconBtn" onclick={onClose} aria-label="Close">
        <X class="h-3.5 w-3.5" />
      </button>
    </div>

    {#if showReplace}
      <div class="replaceRow">
        <input
          bind:value={replaceQuery}
          class="findInput"
          placeholder="Replace"
        />
        <button
          class="iconBtn"
          onclick={() => onReplace(findQuery, replaceQuery)}
          aria-label="Replace"
          disabled={matchCount === 0}
        >
          Replace
        </button>
        <button
          class="iconBtn"
          onclick={() => onReplaceAll(findQuery, replaceQuery)}
          aria-label="Replace all"
          disabled={matchCount === 0}
        >
          All
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .findReplace {
    position: fixed;
    top: 10px;
    right: 20px;
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid var(--border, hsl(240 5.9% 90%));
    background: var(--background, hsl(0 0% 100%));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .findRow,
  .replaceRow {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .findInput {
    flex: 1;
    min-width: 180px;
    padding: 4px 8px;
    border: 1px solid var(--border, hsl(240 5.9% 90%));
    border-radius: 4px;
    background: transparent;
    font-size: 13px;
    outline: none;
    color: var(--foreground);
  }

  .findInput:focus {
    border-color: var(--ring, hsl(240 5.9% 65%));
  }

  .matchInfo {
    font-size: 11px;
    color: var(--muted-foreground);
    min-width: 36px;
    text-align: center;
  }

  .iconBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    font-size: 11px;
    cursor: pointer;
  }

  .iconBtn:hover {
    background: var(--accent, hsl(240 4.8% 95.9%));
    color: var(--foreground);
  }

  .iconBtn:disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .iconBtn.active {
    background: var(--accent, hsl(240 4.8% 95.9%));
    border-color: var(--border);
    color: var(--foreground);
  }
</style>
