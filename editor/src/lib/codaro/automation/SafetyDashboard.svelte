<script lang="ts">
  import { onMount } from "svelte";
  import { Shield, Activity, Gauge, Lock, Unlock, RefreshCw } from "lucide-svelte";
  import {
    getEStopState,
    getAuditEntries,
    getInputPolicy,
    activateEStop,
    deactivateEStop,
    loadAuditLog,
    loadInputPolicy,
    saveInputPolicy,
  } from "../stores/automationStore.svelte";
  import type { InputPolicy } from "../automationApi";

  let eStop = $derived(getEStopState());
  let auditEntries = $derived(getAuditEntries());
  let policy = $derived(getInputPolicy());
  let editingPolicy = $state(false);
  let policyDraft = $state<Partial<InputPolicy>>({});

  let recentSuccessCount = $derived(
    auditEntries.filter((e) => e.result === "success").length
  );
  let recentFailCount = $derived(
    auditEntries.filter((e) => e.result === "failed" || e.result === "error").length
  );

  function startEditPolicy(): void {
    if (!policy) return;
    policyDraft = { ...policy };
    editingPolicy = true;
  }

  async function handleSavePolicy(): Promise<void> {
    await saveInputPolicy(policyDraft);
    editingPolicy = false;
  }

  function formatTime(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return iso;
    }
  }

  function resultColor(result: string): string {
    if (result === "success") return "#4ade80";
    if (result === "error" || result === "failed") return "#f87171";
    return "var(--muted-foreground)";
  }

  onMount(() => {
    void loadInputPolicy();
    void loadAuditLog();
  });
</script>

<div class="safety-dashboard">
  <div class="sd-status-row">
    <div class="sd-card" class:danger={eStop.active}>
      <div class="sd-card-icon">
        <Shield class="h-4 w-4" />
      </div>
      <div class="sd-card-body">
        <span class="sd-card-label">E-Stop</span>
        <span class="sd-card-value" class:active={eStop.active}>
          {eStop.active ? "ACTIVE" : "Ready"}
        </span>
      </div>
      <button
        type="button"
        class="sd-action-btn"
        class:stop={!eStop.active}
        class:clear={eStop.active}
        onclick={() => { if (eStop.active) void deactivateEStop(); else void activateEStop("Dashboard trigger"); }}
      >
        {eStop.active ? "Clear" : "Trigger"}
      </button>
    </div>

    <div class="sd-card">
      <div class="sd-card-icon" style="color: #4ade80">
        <Activity class="h-4 w-4" />
      </div>
      <div class="sd-card-body">
        <span class="sd-card-label">Actions</span>
        <div class="sd-stat-row">
          <span class="sd-stat success">{recentSuccessCount}</span>
          <span class="sd-stat-sep">/</span>
          <span class="sd-stat fail">{recentFailCount}</span>
        </div>
      </div>
    </div>

    <div class="sd-card">
      <div class="sd-card-icon" style="color: #60a5fa">
        {#if policy?.enabled}
          <Lock class="h-4 w-4" />
        {:else}
          <Unlock class="h-4 w-4" />
        {/if}
      </div>
      <div class="sd-card-body">
        <span class="sd-card-label">Input Guard</span>
        <span class="sd-card-value">{policy?.enabled ? "Enabled" : "Disabled"}</span>
      </div>
    </div>
  </div>

  <div class="sd-section">
    <div class="sd-section-header">
      <span class="section-label">
        <Gauge class="h-3.5 w-3.5" />
        Input Policy
      </span>
      {#if !editingPolicy}
        <button type="button" class="sd-edit-btn" onclick={startEditPolicy}>Edit</button>
      {/if}
    </div>

    {#if policy}
      {#if editingPolicy}
        <div class="sd-policy-form">
          <label class="sd-field">
            <span>Max actions/sec</span>
            <input type="number" bind:value={policyDraft.maxActionsPerSecond} min="1" max="100" class="sd-input" />
          </label>
          <label class="sd-field">
            <span>Max actions/min</span>
            <input type="number" bind:value={policyDraft.maxActionsPerMinute} min="1" max="1000" class="sd-input" />
          </label>
          <label class="sd-field-check">
            <input type="checkbox" bind:checked={policyDraft.humanDelay} />
            <span>Human-like delay</span>
          </label>
          <label class="sd-field-check">
            <input type="checkbox" bind:checked={policyDraft.enabled} />
            <span>Guard enabled</span>
          </label>
          <div class="sd-form-actions">
            <button type="button" class="sd-save-btn" onclick={() => void handleSavePolicy()}>Save</button>
            <button type="button" class="sd-cancel-btn" onclick={() => { editingPolicy = false; }}>Cancel</button>
          </div>
        </div>
      {:else}
        <div class="sd-policy-grid">
          <div class="sd-policy-item">
            <span class="sd-policy-label">Rate Limit</span>
            <span class="sd-policy-value">{policy.maxActionsPerSecond}/s &middot; {policy.maxActionsPerMinute}/min</span>
          </div>
          <div class="sd-policy-item">
            <span class="sd-policy-label">Human Delay</span>
            <span class="sd-policy-value">{policy.humanDelay ? "On" : "Off"}</span>
          </div>
          {#if policy.allowedScreenRegion}
            <div class="sd-policy-item">
              <span class="sd-policy-label">Allowed Region</span>
              <span class="sd-policy-value">
                {policy.allowedScreenRegion.x},{policy.allowedScreenRegion.y}
                &rarr; {policy.allowedScreenRegion.width}&times;{policy.allowedScreenRegion.height}
              </span>
            </div>
          {/if}
        </div>
      {/if}
    {:else}
      <div class="sd-empty">Loading policy...</div>
    {/if}
  </div>

  <div class="sd-section">
    <div class="sd-section-header">
      <span class="section-label">Recent Audit</span>
      <button type="button" class="sd-icon-btn" onclick={() => void loadAuditLog()} title="Refresh">
        <RefreshCw class="h-3.5 w-3.5" />
      </button>
    </div>

    {#if auditEntries.length === 0}
      <div class="sd-empty">No audit entries</div>
    {:else}
      <div class="sd-audit-list">
        {#each auditEntries.slice(0, 30) as entry (entry.id)}
          <div class="sd-audit-item">
            <span class="sd-audit-dot" style="background: {resultColor(entry.result)}"></span>
            <span class="sd-audit-action">{entry.actionType}</span>
            <span class="sd-audit-source">{entry.source}</span>
            <span class="sd-audit-time">{formatTime(entry.timestamp)}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .safety-dashboard {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    overflow-y: auto;
  }

  .sd-status-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .sd-card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .sd-card.danger {
    border-color: hsl(0 70% 50%);
    background: hsl(0 70% 50% / 0.06);
  }

  .sd-card-icon {
    flex-shrink: 0;
    color: var(--muted-foreground);
  }

  .sd-card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sd-card-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
  }

  .sd-card-value {
    font-size: 12px;
    font-weight: 500;
    color: var(--foreground);
  }

  .sd-card-value.active {
    color: hsl(0 84% 60%);
    font-weight: 700;
  }

  .sd-action-btn {
    padding: 3px 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    font-size: 11px;
    cursor: pointer;
    color: var(--foreground);
    font-family: inherit;
  }

  .sd-action-btn.stop {
    color: hsl(0 70% 50%);
    border-color: hsl(0 70% 50% / 0.3);
  }

  .sd-action-btn.clear {
    color: hsl(142 71% 45%);
    border-color: hsl(142 71% 45% / 0.3);
  }

  .sd-stat-row {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .sd-stat {
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .sd-stat.success { color: #4ade80; }
  .sd-stat.fail { color: #f87171; }
  .sd-stat-sep { color: var(--muted-foreground); font-size: 11px; }

  .sd-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sd-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
  }

  .sd-icon-btn {
    display: flex;
    align-items: center;
    padding: 4px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .sd-icon-btn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .sd-edit-btn {
    padding: 2px 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    font-size: 11px;
    cursor: pointer;
    font-family: inherit;
  }

  .sd-edit-btn:hover {
    color: var(--foreground);
    background: var(--accent);
  }

  .sd-policy-grid {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .sd-policy-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  .sd-policy-label {
    color: var(--muted-foreground);
    font-size: 11px;
  }

  .sd-policy-value {
    color: var(--foreground);
    font-variant-numeric: tabular-nums;
  }

  .sd-policy-form {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .sd-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: var(--foreground);
  }

  .sd-input {
    width: 80px;
    padding: 3px 6px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--foreground);
    font-size: 12px;
    font-family: inherit;
  }

  .sd-field-check {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--foreground);
    cursor: pointer;
  }

  .sd-form-actions {
    display: flex;
    gap: 6px;
    margin-top: 4px;
  }

  .sd-save-btn {
    padding: 4px 12px;
    border: none;
    border-radius: 4px;
    background: var(--codaro-accent, #a78bfa);
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
  }

  .sd-cancel-btn {
    padding: 4px 12px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
  }

  .sd-empty {
    padding: 16px;
    text-align: center;
    color: var(--muted-foreground);
    font-size: 12px;
  }

  .sd-audit-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    max-height: 250px;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .sd-audit-item {
    display: grid;
    grid-template-columns: 6px 1fr 0.6fr auto;
    align-items: center;
    gap: 8px;
    padding: 5px 10px;
    font-size: 11px;
  }

  .sd-audit-item:not(:last-child) {
    border-bottom: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
  }

  .sd-audit-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .sd-audit-action {
    color: var(--foreground);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sd-audit-source {
    color: var(--muted-foreground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sd-audit-time {
    color: var(--muted-foreground);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .sd-status-row {
      grid-template-columns: 1fr;
    }
  }
</style>
