<script lang="ts">
  import { Code, FileText, BarChart3, AlignLeft } from "lucide-svelte";
  import type { ArtifactEntry } from "../ai/aiStore.svelte";

  interface Props {
    artifact: ArtifactEntry;
  }

  let { artifact }: Props = $props();

  function formatTimestamp(ts: number): string {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
</script>

<div class="artifact-item" data-testid="artifact-item">
  <div class="artifact-header">
    <div class="artifact-icon">
      {#if artifact.type === "code"}
        <Code class="h-3.5 w-3.5" />
      {:else if artifact.type === "chart"}
        <BarChart3 class="h-3.5 w-3.5" />
      {:else if artifact.type === "table"}
        <FileText class="h-3.5 w-3.5" />
      {:else}
        <AlignLeft class="h-3.5 w-3.5" />
      {/if}
    </div>
    <div class="artifact-meta">
      <span class="artifact-title">{artifact.title}</span>
      <span class="artifact-time">{formatTimestamp(artifact.timestamp)}</span>
    </div>
    {#if artifact.toolName}
      <span class="artifact-tool">{artifact.toolName}</span>
    {/if}
  </div>

  <div class="artifact-body">
    {#if artifact.type === "code"}
      <pre class="artifact-code">{artifact.content}</pre>
    {:else}
      <div class="artifact-text">{artifact.content}</div>
    {/if}
  </div>
</div>

<style>
  .artifact-item {
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
  }

  .artifact-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: var(--accent);
    border-bottom: 1px solid var(--border);
  }

  .artifact-icon {
    display: flex;
    align-items: center;
    color: var(--muted-foreground);
  }

  .artifact-meta {
    flex: 1;
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
  }

  .artifact-title {
    font-size: 12px;
    font-weight: 500;
    color: var(--foreground);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .artifact-time {
    font-size: 10px;
    color: var(--muted-foreground);
    flex-shrink: 0;
  }

  .artifact-tool {
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 3px;
    background: var(--background);
    color: var(--muted-foreground);
    font-family: monospace;
    flex-shrink: 0;
  }

  .artifact-body {
    padding: 8px 10px;
    max-height: 200px;
    overflow: auto;
  }

  .artifact-code {
    font-family: monospace;
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
    color: var(--foreground);
  }

  .artifact-text {
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--foreground);
  }
</style>
