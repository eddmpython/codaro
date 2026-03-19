<script lang="ts">
  import { Search, Copy } from "lucide-svelte";

  interface SnippetEntry {
    id: string;
    title: string;
    description?: string;
    code: string;
    category?: string;
  }

  interface Props {
    snippets?: SnippetEntry[];
    onInsert?: (code: string) => void;
  }

  let {
    snippets = [],
    onInsert = () => {}
  }: Props = $props();

  let searchQuery = $state("");
  let selectedSnippet: SnippetEntry | null = $state(null);

  let filtered = $derived(
    snippets.filter((s) => {
      if (!searchQuery) {
        return true;
      }
      const lower = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(lower) ||
        (s.description || "").toLowerCase().includes(lower) ||
        s.code.toLowerCase().includes(lower)
      );
    })
  );

  let categories = $derived(() => {
    const cats = new Set(filtered.map((s) => s.category || "General"));
    return [...cats];
  });

  function snippetsForCategory(cat: string): SnippetEntry[] {
    return filtered.filter((s) => (s.category || "General") === cat);
  }
</script>

<div class="snippets-panel" data-testid="snippets-panel">
  <div class="searchWrap">
    <Search class="h-3.5 w-3.5 text-muted-foreground" />
    <input
      bind:value={searchQuery}
      class="searchInput"
      placeholder="Search snippets..."
    />
  </div>

  <div class="splitView">
    <div class="snippetList">
      {#if filtered.length === 0}
        <p class="empty text-muted-foreground text-sm p-4">
          {searchQuery ? "No matching snippets." : "No snippets available."}
        </p>
      {:else}
        {#each categories() as category}
          <div class="category">
            <div class="catHeader">{category}</div>
            {#each snippetsForCategory(category) as snippet}
              <button
                class="snippetItem"
                class:selected={selectedSnippet?.id === snippet.id}
                onclick={() => { selectedSnippet = snippet; }}
              >
                <span class="snippetTitle">{snippet.title}</span>
                {#if snippet.description}
                  <span class="snippetDesc">{snippet.description}</span>
                {/if}
              </button>
            {/each}
          </div>
        {/each}
      {/if}
    </div>

    <div class="snippetPreview">
      {#if selectedSnippet}
        <div class="previewHeader">
          <h4>{selectedSnippet.title}</h4>
          <button
            class="insertBtn"
            onclick={() => selectedSnippet && onInsert(selectedSnippet.code)}
            aria-label="Insert snippet"
          >
            <Copy class="h-3.5 w-3.5" />
            <span>Insert</span>
          </button>
        </div>
        <pre class="previewCode">{selectedSnippet.code}</pre>
      {:else}
        <p class="empty text-muted-foreground text-sm p-4">
          Select a snippet to preview.
        </p>
      {/if}
    </div>
  </div>
</div>

<style>
  .snippets-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
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

  .splitView {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .snippetList {
    flex: 1;
    overflow-y: auto;
    border-bottom: 1px solid var(--border);
  }

  .category {
    margin-bottom: 4px;
  }

  .catHeader {
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
  }

  .snippetItem {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 6px 10px;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    color: var(--foreground);
  }

  .snippetItem:hover {
    background: var(--accent);
  }

  .snippetItem.selected {
    background: var(--accent);
  }

  .snippetTitle {
    font-size: 13px;
  }

  .snippetDesc {
    font-size: 11px;
    color: var(--muted-foreground);
  }

  .snippetPreview {
    flex: 1;
    min-height: 120px;
    overflow-y: auto;
  }

  .previewHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-bottom: 1px solid var(--border);
  }

  .previewHeader h4 {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
  }

  .insertBtn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    font-size: 12px;
    color: var(--foreground);
    cursor: pointer;
  }

  .insertBtn:hover {
    background: var(--accent);
  }

  .previewCode {
    margin: 0;
    padding: 10px 12px;
    font-family: var(--monospace-font, monospace);
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--foreground);
  }
</style>
