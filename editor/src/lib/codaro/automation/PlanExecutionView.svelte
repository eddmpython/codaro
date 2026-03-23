<script lang="ts">
  import {
    Play,
    Pause,
    RotateCcw,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    SkipForward,
    Monitor,
    MousePointer,
  } from "lucide-svelte";
  import {
    getActivePlan,
    pauseActivePlan,
    resumeActivePlan,
    clearActivePlan,
  } from "../stores/automationStore.svelte";
  import type { PlanStepStatus } from "../automationApi";

  let plan = $derived(getActivePlan());
  let expandedStep = $state<number | null>(null);

  function stepStatusIcon(status: string): typeof CheckCircle2 {
    switch (status) {
      case "completed": return CheckCircle2;
      case "failed": return XCircle;
      case "running": return Loader2;
      case "skipped": return SkipForward;
      default: return Clock;
    }
  }

  function stepStatusColor(status: string): string {
    switch (status) {
      case "completed": return "#4ade80";
      case "failed": return "#f87171";
      case "running": return "#60a5fa";
      case "skipped": return "#a1a1aa";
      default: return "#52525b";
    }
  }

  function progressPercent(plan: { currentStep: number; totalSteps: number }): number {
    if (plan.totalSteps === 0) return 0;
    return Math.round((plan.currentStep / plan.totalSteps) * 100);
  }

  function toggleStep(index: number): void {
    expandedStep = expandedStep === index ? null : index;
  }
</script>

{#if plan}
  <div class="plan-view">
    <div class="pv-header">
      <div class="pv-title">
        <span class="pv-plan-id">Plan {plan.planId.slice(0, 8)}</span>
        <span class="pv-status" class:running={plan.status === "running"} class:paused={plan.status === "paused"} class:failed={plan.status === "failed"} class:completed={plan.status === "completed"}>
          {plan.status}
        </span>
      </div>
      <div class="pv-controls">
        {#if plan.status === "running"}
          <button type="button" class="pv-ctrl-btn" onclick={() => void pauseActivePlan()} title="Pause">
            <Pause class="h-3.5 w-3.5" />
          </button>
        {:else if plan.status === "paused"}
          <button type="button" class="pv-ctrl-btn resume" onclick={() => void resumeActivePlan()} title="Resume">
            <Play class="h-3.5 w-3.5" />
          </button>
        {/if}
        <button type="button" class="pv-ctrl-btn" onclick={clearActivePlan} title="Close">
          <XCircle class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <div class="pv-progress">
      <div class="pv-progress-bar">
        <div class="pv-progress-fill" style="width: {progressPercent(plan)}%"></div>
      </div>
      <span class="pv-progress-text">{plan.currentStep}/{plan.totalSteps} steps</span>
    </div>

    {#if plan.error}
      <div class="pv-error">{plan.error}</div>
    {/if}

    <div class="pv-steps">
      {#each plan.steps as step, i (step.index)}
        {@const Icon = stepStatusIcon(step.status)}
        <div
          class="pv-step"
          class:active={step.status === "running"}
          class:expanded={expandedStep === i}
          role="button"
          tabindex="0"
          onclick={() => toggleStep(i)}
          onkeydown={(e) => { if (e.key === "Enter") toggleStep(i); }}
        >
          <div class="pv-step-row">
            <div class="pv-step-icon" style="color: {stepStatusColor(step.status)}">
              <Icon class="h-3.5 w-3.5" />
            </div>
            <div class="pv-step-info">
              <span class="pv-step-index">Step {step.index + 1}</span>
              <span class="pv-step-action">{step.action}</span>
            </div>
            {#if step.status === "running"}
              <div class="pv-step-spinner">
                <Loader2 class="h-3 w-3 animate-spin" />
              </div>
            {/if}
          </div>

          {#if expandedStep === i}
            <div class="pv-step-details">
              {#if step.screenshot}
                <div class="pv-detail-group">
                  <span class="pv-detail-label">
                    <Monitor class="h-3 w-3" /> Screenshot
                  </span>
                  <img
                    src="data:image/png;base64,{step.screenshot}"
                    alt="Step {step.index + 1} screenshot"
                    class="pv-screenshot"
                  />
                </div>
              {/if}

              {#if step.ocrText}
                <div class="pv-detail-group">
                  <span class="pv-detail-label">OCR Text</span>
                  <pre class="pv-text-box">{step.ocrText}</pre>
                </div>
              {/if}

              {#if step.clickPosition}
                <div class="pv-detail-group">
                  <span class="pv-detail-label">
                    <MousePointer class="h-3 w-3" /> Click
                  </span>
                  <span class="pv-coord">({step.clickPosition.x}, {step.clickPosition.y})</span>
                </div>
              {/if}

              {#if step.inputText}
                <div class="pv-detail-group">
                  <span class="pv-detail-label">Input</span>
                  <code class="pv-input-val">{step.inputText}</code>
                </div>
              {/if}

              {#if step.result}
                <div class="pv-detail-group">
                  <span class="pv-detail-label">Result</span>
                  <span class="pv-result-text">{step.result}</span>
                </div>
              {/if}

              {#if step.error}
                <div class="pv-detail-group">
                  <span class="pv-detail-label">Error</span>
                  <span class="pv-error-text">{step.error}</span>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else}
  <div class="pv-empty">
    <RotateCcw class="h-5 w-5" />
    <span>No active plan</span>
    <span class="pv-hint">When AI executes a multi-step automation plan, its progress will appear here</span>
  </div>
{/if}

<style>
  .plan-view {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    overflow-y: auto;
  }

  .pv-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .pv-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pv-plan-id {
    font-size: 12px;
    font-weight: 600;
    color: var(--foreground);
    font-variant-numeric: tabular-nums;
  }

  .pv-status {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    padding: 1px 6px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
    color: var(--muted-foreground);
  }

  .pv-status.running { background: #172554; color: #60a5fa; }
  .pv-status.paused { background: #422006; color: #fbbf24; }
  .pv-status.failed { background: #450a0a; color: #f87171; }
  .pv-status.completed { background: #052e16; color: #4ade80; }

  .pv-controls {
    display: flex;
    gap: 4px;
  }

  .pv-ctrl-btn {
    display: flex;
    align-items: center;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .pv-ctrl-btn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .pv-ctrl-btn.resume {
    color: #4ade80;
    border-color: #166534;
  }

  .pv-progress {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .pv-progress-bar {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
    overflow: hidden;
  }

  .pv-progress-fill {
    height: 100%;
    border-radius: 2px;
    background: var(--codaro-accent, #a78bfa);
    transition: width 0.3s ease;
  }

  .pv-progress-text {
    font-size: 11px;
    color: var(--muted-foreground);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  .pv-error {
    padding: 6px 10px;
    border-radius: 4px;
    background: hsl(0 70% 50% / 0.08);
    color: hsl(0 70% 50%);
    font-size: 11px;
  }

  .pv-steps {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-height: 0;
    overflow-y: auto;
  }

  .pv-step {
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 6px 8px;
    cursor: pointer;
    transition: background 0.1s;
  }

  .pv-step:hover {
    background: color-mix(in srgb, var(--foreground) 4%, transparent);
  }

  .pv-step.active {
    border-color: #1e3a5f;
    background: #172554;
  }

  .pv-step.expanded {
    border-color: var(--border);
    background: color-mix(in srgb, var(--foreground) 3%, transparent);
  }

  .pv-step-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pv-step-icon {
    flex-shrink: 0;
    display: flex;
  }

  .pv-step-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .pv-step-index {
    font-size: 10px;
    color: var(--muted-foreground);
  }

  .pv-step-action {
    font-size: 12px;
    font-weight: 500;
    color: var(--foreground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pv-step-spinner {
    flex-shrink: 0;
    color: #60a5fa;
  }

  .pv-step-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
  }

  .pv-detail-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .pv-detail-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
  }

  .pv-screenshot {
    max-width: 100%;
    max-height: 180px;
    border-radius: 4px;
    border: 1px solid var(--border);
    object-fit: contain;
    background: #000;
  }

  .pv-text-box {
    padding: 6px 8px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--foreground) 4%, transparent);
    font-size: 11px;
    font-family: var(--font-mono, monospace);
    color: var(--foreground);
    max-height: 80px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
  }

  .pv-coord {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--foreground);
  }

  .pv-input-val {
    padding: 3px 6px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
    font-size: 11px;
    color: #a78bfa;
  }

  .pv-result-text {
    font-size: 11px;
    color: #4ade80;
  }

  .pv-error-text {
    font-size: 11px;
    color: #f87171;
  }

  .pv-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 32px 16px;
    color: var(--muted-foreground);
    font-size: 12px;
    text-align: center;
  }

  .pv-hint {
    font-size: 11px;
    opacity: 0.7;
    max-width: 220px;
  }
</style>
