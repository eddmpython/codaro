<script lang="ts">
  import {
    FilePlus,
    FolderPlus,
    RefreshCw,
    Upload,
    Download,
    Trash2,
    Search
  } from "lucide-svelte";

  interface FileNode {
    name: string;
    path: string;
    isDirectory: boolean;
    children?: FileNode[];
  }

  interface Props {
    files?: FileNode[];
    onOpenFile?: (path: string) => void;
    onNewFile?: () => void;
    onNewFolder?: () => void;
    onRefresh?: () => void;
    onUpload?: () => void;
    onDownload?: () => void;
    onDelete?: (path: string) => void;
  }

  let {
    files = [],
    onOpenFile = () => {},
    onNewFile = () => {},
    onNewFolder = () => {},
    onRefresh = () => {},
    onUpload = () => {},
    onDownload = () => {},
    onDelete = () => {}
  }: Props = $props();

  let searchQuery = $state("");
  let expandedPaths = $state(new Set<string>());

  function toggleExpand(path: string): void {
    const next = new Set(expandedPaths);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    expandedPaths = next;
  }

  function matchesSearch(node: FileNode): boolean {
    if (!searchQuery) {
      return true;
    }
    return node.name.toLowerCase().includes(searchQuery.toLowerCase());
  }
</script>

<div class="file-explorer" data-testid="file-explorer-panel">
  <div class="toolbar">
    <button class="toolBtn" onclick={onNewFile} title="New file" aria-label="New file">
      <FilePlus class="h-4 w-4" />
    </button>
    <button class="toolBtn" onclick={onNewFolder} title="New folder" aria-label="New folder">
      <FolderPlus class="h-4 w-4" />
    </button>
    <button class="toolBtn" onclick={onUpload} title="Upload" aria-label="Upload">
      <Upload class="h-4 w-4" />
    </button>
    <button class="toolBtn" onclick={onDownload} title="Download" aria-label="Download">
      <Download class="h-4 w-4" />
    </button>
    <div class="flex-1"></div>
    <button class="toolBtn" onclick={onRefresh} title="Refresh" aria-label="Refresh">
      <RefreshCw class="h-4 w-4" />
    </button>
  </div>

  <div class="searchWrap">
    <Search class="h-3.5 w-3.5 text-muted-foreground" />
    <input
      bind:value={searchQuery}
      class="searchInput"
      placeholder="Search files..."
    />
  </div>

  <div class="treeContainer">
    {#if files.length === 0}
      <p class="empty text-muted-foreground text-sm p-3">No files found.</p>
    {:else}
      {#each files as node}
        {#if matchesSearch(node)}
          {#if node.isDirectory}
            <button class="treeRow folder" onclick={() => toggleExpand(node.path)}>
              <span class="chevron">{expandedPaths.has(node.path) ? "▾" : "▸"}</span>
              <span>{node.name}</span>
            </button>
            {#if expandedPaths.has(node.path) && node.children}
              <div class="nested">
                {#each node.children as child}
                  {#if matchesSearch(child)}
                    {#if child.isDirectory}
                      <button class="treeRow folder" onclick={() => toggleExpand(child.path)}>
                        <span class="chevron">{expandedPaths.has(child.path) ? "▾" : "▸"}</span>
                        <span>{child.name}</span>
                      </button>
                    {:else}
                      <button class="treeRow file" onclick={() => onOpenFile(child.path)}>
                        <span>{child.name}</span>
                      </button>
                    {/if}
                  {/if}
                {/each}
              </div>
            {/if}
          {:else}
            <button class="treeRow file" onclick={() => onOpenFile(node.path)}>
              <span>{node.name}</span>
            </button>
          {/if}
        {/if}
      {/each}
    {/if}
  </div>
</div>

<style>
  .file-explorer {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px 8px;
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

  .searchWrap {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--border);
  }

  .searchInput {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 12px;
    outline: none;
    color: var(--foreground);
  }

  .treeContainer {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }

  .treeRow {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 4px 12px;
    border: none;
    background: transparent;
    color: var(--foreground);
    font-size: 13px;
    text-align: left;
    cursor: pointer;
  }

  .treeRow:hover {
    background: var(--accent);
  }

  .chevron {
    width: 12px;
    font-size: 10px;
    color: var(--muted-foreground);
  }

  .nested {
    padding-left: 16px;
  }
</style>
