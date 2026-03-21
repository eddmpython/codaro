<script lang="ts">
  import { CheckCircle2, XCircle, RotateCcw } from "lucide-svelte";

  interface Props {
    passed: boolean | null;
    feedback?: string;
    onRetry?: () => void;
  }

  let { passed = null, feedback = "", onRetry }: Props = $props();
</script>

{#if passed !== null}
  <div class="exercise-feedback" class:passed class:failed={!passed} data-testid="exercise-feedback">
    <div class="feedback-icon">
      {#if passed}
        <CheckCircle2 class="h-5 w-5" />
      {:else}
        <XCircle class="h-5 w-5" />
      {/if}
    </div>
    <div class="feedback-body">
      <div class="feedback-title">
        {passed ? "Correct!" : "Not quite right"}
      </div>
      {#if feedback}
        <div class="feedback-text">{feedback}</div>
      {/if}
    </div>
    {#if !passed && onRetry}
      <button class="retry-btn" onclick={onRetry}>
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
    gap: 10px;
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 13px;
  }

  .exercise-feedback.passed {
    background: hsl(142 71% 45% / 0.1);
    color: hsl(142 71% 35%);
    border: 1px solid hsl(142 71% 45% / 0.2);
  }

  .exercise-feedback.failed {
    background: hsl(0 84% 60% / 0.08);
    color: hsl(0 65% 48%);
    border: 1px solid hsl(0 84% 60% / 0.15);
  }

  .feedback-icon {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .feedback-body {
    flex: 1;
    min-width: 0;
  }

  .feedback-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 2px;
  }

  .feedback-text {
    line-height: 1.5;
    opacity: 0.9;
  }

  .retry-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border: 1px solid currentColor;
    border-radius: 4px;
    background: transparent;
    font-size: 12px;
    font-weight: 500;
    color: inherit;
    cursor: pointer;
    flex-shrink: 0;
    opacity: 0.8;
  }

  .retry-btn:hover {
    opacity: 1;
    background: hsl(0 84% 60% / 0.05);
  }
</style>
