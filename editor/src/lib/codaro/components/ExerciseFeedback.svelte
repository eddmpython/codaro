<script lang="ts">
  import { CheckCircle2, XCircle, RotateCcw, Lightbulb } from "lucide-svelte";
  import { fly } from "svelte/transition";

  interface Props {
    passed: boolean | null;
    feedback?: string;
    hint?: boolean;
    onRetry?: () => void;
  }

  let { passed = null, feedback = "", hint = false, onRetry }: Props = $props();

  const tone = $derived(passed === true ? "passed" : passed === false ? "failed" : hint ? "hint" : null);
</script>

{#if tone}
  <div
    class="exercise-feedback"
    class:passed={tone === "passed"}
    class:failed={tone === "failed"}
    class:hint={tone === "hint"}
    data-testid="exercise-feedback"
    in:fly={{ y: 8, duration: 360 }}
  >
    <div class="feedback-icon">
      {#if tone === "passed"}
        <CheckCircle2 class="h-5 w-5 icon-bounce-in" />
      {:else if tone === "failed"}
        <XCircle class="h-5 w-5" />
      {:else}
        <Lightbulb class="h-5 w-5 icon-pulse-once" />
      {/if}
    </div>
    <div class="feedback-body">
      <div class="feedback-title">
        {#if tone === "passed"}Correct!{:else if tone === "failed"}Not quite right{:else}Hint{/if}
      </div>
      {#if feedback}
        <div class="feedback-text">{feedback}</div>
      {/if}
    </div>
    {#if tone === "failed" && onRetry}
      <button type="button" class="retry-btn" onclick={onRetry}>
        <RotateCcw class="h-3.5 w-3.5" />
        Try Again
      </button>
    {/if}
  </div>
{/if}

<style>
  .exercise-feedback {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 8px;
    border: 1px solid;
    font-size: 13px;
  }

  .exercise-feedback.passed {
    background: var(--state-success-soft);
    color: var(--state-success-fg);
    border-color: var(--state-success-border);
  }

  .exercise-feedback.failed {
    background: var(--state-destructive-soft);
    color: var(--state-destructive-fg);
    border-color: var(--state-destructive-border);
    animation: feedback-shake 240ms var(--ease-standard) 1;
  }

  .exercise-feedback.hint {
    background: var(--state-warning-soft);
    color: var(--state-warning-fg);
    border-color: var(--state-warning-border);
  }

  @keyframes feedback-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    75% { transform: translateX(3px); }
  }

  .feedback-icon {
    flex-shrink: 0;
    margin-top: 1px;
  }

  @keyframes icon-bounce-in {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }

  .icon-bounce-in {
    animation: icon-bounce-in 360ms var(--ease-spring);
  }

  @keyframes icon-pulse-once {
    0% { transform: scale(1); }
    50% { transform: scale(1.18); }
    100% { transform: scale(1); }
  }

  .icon-pulse-once {
    animation: icon-pulse-once 600ms var(--ease-standard);
  }

  .feedback-body {
    flex: 1;
    min-width: 0;
  }

  .feedback-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 2px;
    font-family: var(--font-heading);
    letter-spacing: -0.01em;
  }

  .feedback-text {
    line-height: 1.55;
    opacity: 0.92;
    font-family: var(--font-sans);
  }

  .retry-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding: 0 12px;
    border: 1px solid currentColor;
    border-radius: 6px;
    background: transparent;
    font-size: 12px;
    font-weight: 500;
    color: inherit;
    cursor: pointer;
    flex-shrink: 0;
    opacity: 0.85;
    transition: opacity var(--motion-quick) var(--ease-standard), background var(--motion-quick) var(--ease-standard);
  }

  .retry-btn:hover {
    opacity: 1;
    background: color-mix(in oklab, currentColor 8%, transparent);
  }

  .retry-btn:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 1px;
  }
</style>
