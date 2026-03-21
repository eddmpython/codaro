<script lang="ts">
  import { Activity, Cpu, HardDrive, Users, MessageSquare, RefreshCw } from "lucide-svelte";
  import { apiUrl } from "../basePath";

  interface HealthData {
    status: string;
    python: string;
    pid: number;
    processMemoryMb: number | null;
    sessions: { active: number };
    conversations: { active: number };
    engine: {
      status: string;
      executionCount: number;
      variableCount: number;
    };
  }

  let health = $state<HealthData | null>(null);
  let error = $state<string | null>(null);
  let loading = $state(false);
  let lastFetched = $state<number | null>(null);

  async function fetchHealth() {
    loading = true;
    error = null;
    try {
      const res = await fetch(apiUrl("/api/system/health"));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      health = await res.json();
      lastFetched = Date.now();
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to fetch health";
    } finally {
      loading = false;
    }
  }

  fetchHealth();
</script>

<div class="health-panel">
  <div class="panel-header">
    <Activity size={16} />
    <span class="panel-title">System Health</span>
    <button class="refresh-btn" onclick={fetchHealth} disabled={loading} aria-label="Refresh">
      <RefreshCw size={14} class={loading ? "animate-spin" : ""} />
    </button>
  </div>

  {#if error}
    <div class="error-banner">{error}</div>
  {/if}

  {#if health}
    <div class="status-badge" class:ok={health.status === "ok"} class:err={health.status !== "ok"}>
      {health.status.toUpperCase()}
    </div>

    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-icon"><Cpu size={14} /></div>
        <div class="metric-info">
          <span class="metric-label">Python</span>
          <span class="metric-value">{health.python.split(" ")[0]}</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon"><HardDrive size={14} /></div>
        <div class="metric-info">
          <span class="metric-label">Memory</span>
          <span class="metric-value">{health.processMemoryMb ? `${health.processMemoryMb} MB` : "N/A"}</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon"><Users size={14} /></div>
        <div class="metric-info">
          <span class="metric-label">Sessions</span>
          <span class="metric-value">{health.sessions.active}</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon"><MessageSquare size={14} /></div>
        <div class="metric-info">
          <span class="metric-label">Conversations</span>
          <span class="metric-value">{health.conversations.active}</span>
        </div>
      </div>
    </div>

    <div class="engine-section">
      <h4 class="section-title">Engine</h4>
      <div class="engine-stats">
        <div class="stat-row">
          <span class="stat-label">Status</span>
          <span class="stat-value" class:running={health.engine.status === "running"}>{health.engine.status}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Executions</span>
          <span class="stat-value">{health.engine.executionCount}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Variables</span>
          <span class="stat-value">{health.engine.variableCount}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">PID</span>
          <span class="stat-value">{health.pid}</span>
        </div>
      </div>
    </div>

    {#if lastFetched}
      <p class="last-fetched">Updated {new Date(lastFetched).toLocaleTimeString()}</p>
    {/if}
  {:else if !error}
    <p class="loading-text">Loading...</p>
  {/if}
</div>

<style>
  .health-panel {
    padding: 12px;
    font-size: 0.85rem;
    color: var(--foreground);
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .panel-title {
    font-weight: 600;
    flex: 1;
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--foreground);
    cursor: pointer;
    transition: background 0.15s;
  }

  .refresh-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
  }

  .refresh-btn:disabled {
    opacity: 0.4;
  }

  .error-banner {
    padding: 8px 10px;
    margin-bottom: 10px;
    border-radius: 6px;
    background: hsl(0 84% 60% / 0.1);
    color: hsl(0 84% 60%);
    font-size: 0.8rem;
  }

  .status-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
  }

  .status-badge.ok {
    background: hsl(142 71% 45% / 0.12);
    color: hsl(142 71% 45%);
  }

  .status-badge.err {
    background: hsl(0 84% 60% / 0.12);
    color: hsl(0 84% 60%);
  }

  .metric-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 14px;
  }

  .metric-card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--foreground) 4%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
  }

  .metric-icon {
    color: var(--accent);
    flex-shrink: 0;
  }

  .metric-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .metric-label {
    font-size: 0.7rem;
    color: color-mix(in srgb, var(--foreground) 50%, transparent);
  }

  .metric-value {
    font-weight: 600;
    font-size: 0.85rem;
  }

  .engine-section {
    margin-top: 4px;
  }

  .section-title {
    font-size: 0.78rem;
    font-weight: 600;
    color: color-mix(in srgb, var(--foreground) 60%, transparent);
    margin: 0 0 8px;
  }

  .engine-stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px solid color-mix(in srgb, var(--border) 30%, transparent);
  }

  .stat-label {
    color: color-mix(in srgb, var(--foreground) 55%, transparent);
    font-size: 0.8rem;
  }

  .stat-value {
    font-weight: 500;
    font-size: 0.8rem;
  }

  .stat-value.running {
    color: hsl(142 71% 45%);
  }

  .last-fetched {
    margin-top: 12px;
    text-align: center;
    font-size: 0.7rem;
    color: color-mix(in srgb, var(--foreground) 35%, transparent);
  }

  .loading-text {
    text-align: center;
    color: color-mix(in srgb, var(--foreground) 40%, transparent);
  }
</style>
