<script lang="ts">
  import { Maximize2, Minimize2 } from "lucide-svelte";

  interface GraphNode {
    id: string;
    label: string;
    status?: string;
  }

  interface GraphEdge {
    source: string;
    target: string;
  }

  interface Props {
    nodes?: GraphNode[];
    edges?: GraphEdge[];
  }

  let {
    nodes = [],
    edges = []
  }: Props = $props();

  let isFullscreen = $state(false);
</script>

<div
  class="dep-graph-panel"
  class:fullscreen={isFullscreen}
  data-testid="dependency-graph-panel"
>
  <div class="toolbar">
    <span class="text-xs text-muted-foreground">
      {nodes.length} cells · {edges.length} dependencies
    </span>
    <button
      class="toolBtn"
      onclick={() => { isFullscreen = !isFullscreen; }}
      aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
    >
      {#if isFullscreen}
        <Minimize2 class="h-4 w-4" />
      {:else}
        <Maximize2 class="h-4 w-4" />
      {/if}
    </button>
  </div>

  <div class="graphContainer">
    {#if nodes.length === 0}
      <div class="empty text-muted-foreground text-sm">
        No dependency graph available. Run cells to build the graph.
      </div>
    {:else}
      <div class="placeholder">
        <svg viewBox="0 0 200 200" class="miniGraph">
          {#each edges as edge}
            {@const source = nodes.find((n) => n.id === edge.source)}
            {@const target = nodes.find((n) => n.id === edge.target)}
            {#if source && target}
              {@const si = nodes.indexOf(source)}
              {@const ti = nodes.indexOf(target)}
              <line
                x1={40 + (si % 4) * 40}
                y1={30 + Math.floor(si / 4) * 40}
                x2={40 + (ti % 4) * 40}
                y2={30 + Math.floor(ti / 4) * 40}
                stroke="var(--border)"
                stroke-width="1"
              />
            {/if}
          {/each}
          {#each nodes as node, i}
            <circle
              cx={40 + (i % 4) * 40}
              cy={30 + Math.floor(i / 4) * 40}
              r="8"
              fill="var(--accent)"
              stroke="var(--border)"
              stroke-width="1"
            />
            <text
              x={40 + (i % 4) * 40}
              y={30 + Math.floor(i / 4) * 40 + 3}
              text-anchor="middle"
              font-size="6"
              fill="var(--foreground)"
            >
              {node.label.slice(0, 3)}
            </text>
          {/each}
        </svg>
      </div>
    {/if}
  </div>
</div>

<style>
  .dep-graph-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .dep-graph-panel.fullscreen {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--background);
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border-bottom: 1px solid var(--border);
  }

  .toolBtn {
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

  .toolBtn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .graphContainer {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .empty {
    padding: 24px;
    text-align: center;
  }

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .miniGraph {
    width: 100%;
    max-width: 240px;
    height: auto;
  }
</style>
