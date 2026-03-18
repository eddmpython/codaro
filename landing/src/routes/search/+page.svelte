<script>
  import { searchEntries } from "$lib/generated/searchIndex";

  let query = "";

  $: normalized = query.trim().toLowerCase();
  $: filtered = normalized
    ? searchEntries
        .filter((entry) => `${entry.title} ${entry.description} ${entry.text}`.toLowerCase().includes(normalized))
        .slice(0, 40)
    : searchEntries.slice(0, 20);
</script>

<div class="siteShell">
  <section class="pageHero">
    <div class="badge">Search</div>
    <h1>Search docs and blog</h1>
    <p>Static search over generated docs and blog content.</p>
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
