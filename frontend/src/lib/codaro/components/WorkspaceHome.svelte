<script lang="ts">
  export let workspaceRoot = "";
  export let index: {
    recentDocuments?: Array<{ name: string; path: string; notebookType: string; relativePath: string }>;
    compatibleDocuments?: Array<{ name: string; path: string; notebookType: string; relativePath: string }>;
    totalCodaroDocuments?: number;
    totalCompatibleDocuments?: number;
  } | null = null;
  export let onOpenPath = (path: string): void => {
    void path;
  };
  export let onCreateNew = (): void => {};
</script>

<section class="home">
  <div class="hero">
    <div>
      <p class="eyebrow">Workspace</p>
      <h1>Open a notebook or start a new one.</h1>
      <p class="copy">{workspaceRoot}</p>
    </div>
    <button class="primary" on:click={onCreateNew}>New notebook</button>
  </div>

  <div class="grid">
    <section class="card">
      <div class="sectionHead">
        <h2>Recent</h2>
        <span>{index?.recentDocuments?.length || 0}</span>
      </div>
      {#if index?.recentDocuments && index.recentDocuments.length > 0}
        <div class="list">
          {#each index.recentDocuments as document}
            <button class="row" on:click={() => onOpenPath(document.path)}>
              <strong>{document.name}</strong>
              <span>{document.relativePath}</span>
            </button>
          {/each}
        </div>
      {:else}
        <p class="empty">No recent notebooks.</p>
      {/if}
    </section>

    <section class="card">
      <div class="sectionHead">
        <h2>Compatible</h2>
        <span>{index?.totalCompatibleDocuments || 0}</span>
      </div>
      {#if index?.compatibleDocuments && index.compatibleDocuments.length > 0}
        <div class="list">
          {#each index.compatibleDocuments.slice(0, 8) as document}
            <button class="row" on:click={() => onOpenPath(document.path)}>
              <strong>{document.name}</strong>
              <span>{document.notebookType}</span>
            </button>
          {/each}
        </div>
      {:else}
        <p class="empty">No compatible imports found.</p>
      {/if}
    </section>
  </div>
</section>

<style>
  .home {
    display: grid;
    gap: 18px;
  }

  .hero,
  .card {
    padding: 20px;
    border: 1px solid var(--cd-border);
    border-radius: var(--cd-radius-lg);
    background: var(--cd-card);
    box-shadow: var(--cd-shadow);
  }

  .hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .eyebrow {
    margin: 0 0 6px;
    color: var(--cd-text-soft);
    font: 11px/1.4 var(--cd-font-code);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  h1,
  h2 {
    margin: 0;
    color: var(--cd-text);
  }

  h1 {
    font-size: clamp(1.5rem, 3vw, 2.3rem);
    letter-spacing: -0.04em;
  }

  .copy {
    margin: 8px 0 0;
    color: var(--cd-text-muted);
  }

  .primary,
  .row {
    border: 1px solid var(--cd-border);
    background: var(--cd-card);
    color: var(--cd-text);
    cursor: pointer;
  }

  .primary {
    padding: 10px 14px;
    border-radius: var(--cd-radius-pill);
    font-weight: 600;
  }

  .grid {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .sectionHead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .sectionHead span {
    color: var(--cd-text-soft);
    font: 11px/1.4 var(--cd-font-code);
  }

  .list {
    display: grid;
    gap: 8px;
  }

  .row {
    display: grid;
    gap: 4px;
    padding: 12px 14px;
    text-align: left;
    border-radius: var(--cd-radius-md);
  }

  .row strong {
    font-size: 14px;
  }

  .row span {
    color: var(--cd-text-muted);
    font-size: 12px;
  }

  .empty {
    margin: 0;
    color: var(--cd-text-muted);
  }
</style>
