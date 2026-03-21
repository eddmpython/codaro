<script>
  import { searchEntries } from "$lib/generated/searchIndex";

  let query = $state("");

  let filtered = $derived.by(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchEntries.slice(0, 20);
    return searchEntries
      .filter((entry) => `${entry.title} ${entry.description} ${entry.text}`.toLowerCase().includes(normalized))
      .slice(0, 40);
  });
</script>

<div class="siteShell">
  <section class="pageHero">
    <div class="badge">Search</div>
    <h1>Search</h1>
    <p>Find docs and blog posts from one place.</p>
  </section>

  <section class="pageSection">
    <input class="searchField" bind:value={query} placeholder="Search docs and blog..." />
  </section>

  <section class="pageSection">
    <div class="listStack">
      {#each filtered as entry}
        <a class="rowCard" href={entry.url}>
          <strong>{entry.title}</strong>
          <div class="rowMeta">
            <span class="badge">{entry.kind}</span>
            <span class="badge">{entry.category}</span>
          </div>
          <div>{entry.description}</div>
        </a>
      {/each}
    </div>
  </section>
</div>
