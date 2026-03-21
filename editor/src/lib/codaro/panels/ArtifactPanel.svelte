<script lang="ts">
  import { Layers, Trash2, X } from "lucide-svelte";
  import ArtifactRenderer from "./ArtifactRenderer.svelte";
  import {
    getArtifacts,
    getIsArtifactPanelOpen,
    setIsArtifactPanelOpen,
    clearArtifacts,
  } from "../ai/aiStore.svelte";

  let artifacts = $derived(getArtifacts());
  let isOpen = $derived(getIsArtifactPanelOpen());
</script>

{#if isOpen}
  <div class="artifact-panel" data-testid="artifact-panel">
    <div class="panel-header">
      <div class="header-left">
        <Layers class="h-4 w-4" />
        <span class="header-title">Artifacts</span>
        {#if artifacts.length > 0}
          <span class="count-badge">{artifacts.length}</span>
        {/if}
      </div>
      <div class="header-actions">
        {#if artifacts.length > 0}
          <button class="header-btn" onclick={clearArtifacts} title="Clear all">
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        {/if}
        <button class="header-btn" onclick={() => setIsArtifactPanelOpen(false)} title="Close">
          <X class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <div class="panel-body">
      {#if artifacts.length === 0}
        <div class="empty-state">
          <Layers class="h-8 w-8 text-muted-foreground/30" />
          <p>AI-generated artifacts will appear here.</p>
        </div>
      {:else}
        <div class="artifact-list">
          {#each artifacts as artifact (artifact.id)}
            <ArtifactRenderer {artifact} />
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .artifact-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--background);
    border-left: 1px solid var(--border);
    min-width: 280px;
    max-width: 400px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
    min-height: 36px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--foreground);
  }

  .header-title {
    font-size: 12px;
    font-weight: 600;
  }

  .count-badge {
    font-size: 10px;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--accent);
    color: var(--muted-foreground);
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    gap: 2px;
  }

  .header-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .header-btn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 32px 16px;
    color: var(--muted-foreground);
    font-size: 12px;
    text-align: center;
  }

  .artifact-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
