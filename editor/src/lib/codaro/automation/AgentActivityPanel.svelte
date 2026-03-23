<script lang="ts">
  import { Monitor, MousePointer, Keyboard, Eye, ScanLine, Trash2, RefreshCw } from "lucide-svelte";
  import {
    getAgentActions,
    clearAgentActions,
  } from "../stores/automationStore.svelte";

  let actions = $derived(getAgentActions());
  let expandedId = $state<string | null>(null);

  function actionIcon(type: string): typeof Monitor {
    if (type.includes("click") || type.includes("mouse") || type.includes("drag")) return MousePointer;
    if (type.includes("type") || type.includes("key") || type.includes("hotkey")) return Keyboard;
    if (type.includes("capture") || type.includes("screen")) return Monitor;
    if (type.includes("ocr") || type.includes("detect")) return ScanLine;
    return Eye;
  }

  function actionColor(result: string): string {
    if (result === "success") return "#4ade80";
    if (result === "failed" || result === "error") return "#f87171";
    if (result === "running") return "#60a5fa";
    return "#a1a1aa";
  }

  function formatTime(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return iso;
    }
  }

  function toggleExpand(id: string): void {
    expandedId = expandedId === id ? null : id;
  }
</script>

<div class="agent-activity">
  <div class="aa-header">
    <span class="section-label">Agent Activity</span>
    <div class="aa-header-actions">
      <span class="aa-count">{actions.length}</span>
      <button type="button" class="aa-icon-btn" onclick={clearAgentActions} title="Clear">
        <Trash2 class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>

  {#if actions.length === 0}
    <div class="aa-empty">
      <Eye class="h-5 w-5" />
      <span>No agent activity yet</span>
      <span class="aa-hint">Activity will appear here when the AI agent performs desktop actions</span>
    </div>
  {:else}
    <div class="aa-feed">
      {#each actions as action (action.id)}
        {@const Icon = actionIcon(action.actionType)}
        <div
          class="aa-item"
          class:expanded={expandedId === action.id}
          role="button"
          tabindex="0"
          onclick={() => toggleExpand(action.id)}
          onkeydown={(e) => { if (e.key === "Enter") toggleExpand(action.id); }}
        >
          <div class="aa-item-row">
            <div class="aa-item-icon" style="color: {actionColor(action.result)}">
              <Icon class="h-3.5 w-3.5" />
            </div>
            <div class="aa-item-info">
              <span class="aa-action-type">{action.actionType}</span>
              <span class="aa-description">{action.description}</span>
            </div>
            <span class="aa-time">{formatTime(action.timestamp)}</span>
          </div>

          {#if expandedId === action.id}
            <div class="aa-details">
              {#if action.screenshot}
                <div class="aa-detail-section">
                  <span class="aa-detail-label">Screenshot</span>
                  <img
                    src="data:image/png;base64,{action.screenshot}"
                    alt="Agent screenshot"
                    class="aa-screenshot"
                  />
                </div>
              {/if}

              {#if action.ocrText}
                <div class="aa-detail-section">
                  <span class="aa-detail-label">OCR Text</span>
                  <pre class="aa-text-box">{action.ocrText}</pre>
                </div>
              {/if}

              {#if action.clickPosition}
                <div class="aa-detail-section">
                  <span class="aa-detail-label">Click Position</span>
                  <span class="aa-coord">
                    <MousePointer class="h-3 w-3" />
                    ({action.clickPosition.x}, {action.clickPosition.y})
                  </span>
                </div>
              {/if}

              {#if action.inputText}
                <div class="aa-detail-section">
                  <span class="aa-detail-label">Input Text</span>
                  <code class="aa-input-text">{action.inputText}</code>
                </div>
              {/if}

              {#if action.planId}
                <div class="aa-detail-section">
                  <span class="aa-detail-label">Plan</span>
                  <span class="aa-plan-ref">
                    {action.planId}
                    {#if action.stepIndex !== null}
                      &middot; Step {action.stepIndex + 1}
                    {/if}
                  </span>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .agent-activity {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
    min-height: 0;
  }

  .aa-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
  }

  .aa-header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .aa-count {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
    color: var(--muted-foreground);
  }

  .aa-icon-btn {
    display: flex;
    align-items: center;
    padding: 4px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .aa-icon-btn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .aa-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 32px 16px;
    color: var(--muted-foreground);
    font-size: 12px;
    text-align: center;
  }

  .aa-hint {
    font-size: 11px;
    opacity: 0.7;
    max-width: 200px;
  }

  .aa-feed {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
    min-height: 0;
    flex: 1;
  }

  .aa-item {
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 6px 8px;
    cursor: pointer;
    transition: background 0.1s;
  }

  .aa-item:hover {
    background: color-mix(in srgb, var(--foreground) 4%, transparent);
  }

  .aa-item.expanded {
    border-color: var(--border);
    background: color-mix(in srgb, var(--foreground) 3%, transparent);
  }

  .aa-item-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .aa-item-icon {
    flex-shrink: 0;
    display: flex;
  }

  .aa-item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .aa-action-type {
    font-size: 11px;
    font-weight: 600;
    color: var(--foreground);
  }

  .aa-description {
    font-size: 10px;
    color: var(--muted-foreground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .aa-time {
    font-size: 10px;
    color: var(--muted-foreground);
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }

  .aa-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
  }

  .aa-detail-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .aa-detail-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
  }

  .aa-screenshot {
    max-width: 100%;
    max-height: 200px;
    border-radius: 4px;
    border: 1px solid var(--border);
    object-fit: contain;
    background: #000;
  }

  .aa-text-box {
    padding: 6px 8px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--foreground) 4%, transparent);
    font-size: 11px;
    font-family: var(--font-mono, monospace);
    color: var(--foreground);
    max-height: 100px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
  }

  .aa-coord {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--foreground);
  }

  .aa-input-text {
    padding: 4px 8px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--foreground) 4%, transparent);
    font-size: 11px;
    color: #a78bfa;
  }

  .aa-plan-ref {
    font-size: 11px;
    color: #60a5fa;
  }
</style>
