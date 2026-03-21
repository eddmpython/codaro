<script lang="ts">
  interface TreeNode {
    name: string;
    path: string;
    isDirectory: boolean;
    notebookType: string;
    children?: TreeNode[];
  }

  interface Props {
    nodes?: TreeNode[];
    activePath?: string;
    onOpenPath?: (path: string) => void;
    level?: number;
  }

  let {
    nodes = [],
    activePath = "",
    onOpenPath = () => {},
    level = 0
  }: Props = $props();

  let expandedPaths = $state(new Set(
    nodes
      .filter((node) => node.isDirectory)
      .map((node) => node.path)
  ));

  function isExpanded(path: string): boolean {
    return expandedPaths.has(path);
  }

  function toggle(path: string): void {
    if (expandedPaths.has(path)) {
      expandedPaths = new Set([...expandedPaths].filter((entry) => entry !== path));
      return;
    }
    expandedPaths = new Set([...expandedPaths, path]);
  }
</script>

<div class="tree" style={`--level:${level};`}>
  {#each nodes as node}
    {#if node.isDirectory}
      <div class="branch">
        <button class="folder" onclick={() => toggle(node.path)}>
          <span>{isExpanded(node.path) ? "▾" : "▸"}</span>
          <span>{node.name}</span>
        </button>
        {#if isExpanded(node.path) && node.children}
          <svelte:self
            nodes={node.children || []}
            {activePath}
            {onOpenPath}
            level={level + 1}
          />
        {/if}
      </div>
    {:else}
      <button class:selected={activePath === node.path} class="file" onclick={() => onOpenPath(node.path)}>
        <span>{node.name}</span>
        <small>{node.notebookType}</small>
      </button>
    {/if}
  {/each}
</div>

<style>
  .tree {
    display: grid;
    gap: 4px;
    padding-left: calc(var(--level) * 10px);
  }

  .branch {
    display: grid;
    gap: 4px;
  }

  .folder,
  .file {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: var(--cd-radius-sm);
    background: transparent;
    color: var(--cd-text-muted);
    text-align: left;
    cursor: pointer;
  }

  .folder:hover,
  .file:hover,
  .file.selected {
    border-color: var(--cd-border);
    background: var(--cd-card);
    color: var(--cd-text);
  }

  small {
    color: var(--cd-text-soft);
    font: 10px/1 var(--cd-font-code);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
</style>
