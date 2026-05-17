<script>
  import { base } from "$app/paths";
  import { brand } from "$lib/brand";
  import { tools, categories, categoryOrder, searchTools, groupByCategory } from "$lib/tools/registry.js";

  /** @typedef {import("$lib/tools/registry.js").ToolCategory} ToolCategory */

  let query = $state("");
  /** @type {ToolCategory | null} */
  let activeCategory = $state(null);

  let filtered = $derived.by(() => {
    let list = searchTools(query);
    if (activeCategory) list = list.filter((t) => t.category === activeCategory);
    return list;
  });
  let grouped = $derived(groupByCategory(filtered));
  let totalCount = $derived(filtered.length);

  let visibleCategories = $derived(
    categoryOrder.filter((c) => grouped[c] && grouped[c].length > 0)
  );

  let categoryCounts = $derived.by(() => {
    /** @type {Record<string, number>} */
    const counts = {};
    for (const t of tools) {
      counts[t.category] = (counts[t.category] ?? 0) + 1;
    }
    return counts;
  });

  const promises = [
    {
      label: "Private",
      copy: "Files never leave your browser. No account, no upload, no logging.",
      icon: "●",
    },
    {
      label: "Fast",
      copy: "Runs locally with no network round-trip. Drop a file, get the result in a click.",
      icon: "▲",
    },
    {
      label: "Free forever",
      copy: "No paywall, no signup, no watermarks. Hosted as static pages on GitHub.",
      icon: "★",
    },
  ];

  /** @param {ToolCategory | null} cat */
  function setCategory(cat) {
    activeCategory = activeCategory === cat ? null : cat;
  }

  function clearFilters() {
    query = "";
    activeCategory = null;
  }
</script>

<svelte:head>
  <title>Tools — {brand.name}</title>
  <meta name="description" content="Free, private, browser-side file utilities by Codaro. Convert, generate, edit and automate without uploading anything." />
  <link rel="canonical" href="{brand.siteUrl}/tools" />
  <meta property="og:title" content="Tools — {brand.name}" />
  <meta property="og:description" content="Browser-side file utilities — your files never leave your browser." />
</svelte:head>

<section class="toolsHero">
  <span class="heroChip">Browser-side · Open source · {tools.length} tools</span>
  <h1>File &amp; data tools that don't touch a server.</h1>
  <p class="heroLead">
    Quick utilities that run entirely in your browser. Drop a file, get a result. No accounts, no
    uploads, no waiting on a queue. Built as a side surface of <a href="{base}/" class="brandLink">{brand.name}</a> —
    the programmable studio for code, learning, and automation.
  </p>
</section>

<section class="promiseRow" aria-label="What makes these tools different">
  {#each promises as p}
    <div class="promiseCard">
      <span class="promiseIcon" aria-hidden="true">{p.icon}</span>
      <div>
        <div class="promiseLabel">{p.label}</div>
        <p>{p.copy}</p>
      </div>
    </div>
  {/each}
</section>

<section class="filterBar" aria-label="Search and filter tools">
  <label class="searchWrap">
    <span class="searchIcon" aria-hidden="true">⌕</span>
    <input
      type="search"
      class="searchField"
      bind:value={query}
      placeholder="Search by name or tag — e.g. csv, pdf, regex"
      autocomplete="off"
    />
  </label>
  <div class="categoryChips" role="tablist" aria-label="Categories">
    <button
      type="button"
      class="catChip"
      class:active={activeCategory === null}
      onclick={() => setCategory(null)}
      aria-pressed={activeCategory === null}
    >
      All <span class="chipCount">{tools.length}</span>
    </button>
    {#each categoryOrder as cat}
      {@const count = categoryCounts[cat] ?? 0}
      {#if count > 0}
        <button
          type="button"
          class="catChip"
          class:active={activeCategory === cat}
          onclick={() => setCategory(cat)}
          aria-pressed={activeCategory === cat}
        >
          {categories[cat].label} <span class="chipCount">{count}</span>
        </button>
      {/if}
    {/each}
  </div>
</section>

{#if totalCount === 0}
  <div class="emptyState">
    <p>No tools match <strong>{query}</strong>{activeCategory ? ` in ${categories[activeCategory].label}` : ""}.</p>
    <button type="button" class="ghostButton" onclick={clearFilters}>Clear filters</button>
  </div>
{:else}
  {#each visibleCategories as cat}
    <section class="toolGroup">
      <header class="groupHead">
        <div>
          <h2>{categories[cat].label}</h2>
          <p class="groupDescription">{categories[cat].description}</p>
        </div>
        <span class="groupCount">{grouped[cat].length} tool{grouped[cat].length === 1 ? "" : "s"}</span>
      </header>
      <div class="cardGrid toolGrid">
        {#each grouped[cat] as tool}
          <a class="surfaceCard toolCard" href="{base}/tools/{tool.slug}">
            <span class="toolIcon" aria-hidden="true">{tool.icon}</span>
            <h3>{tool.title}</h3>
            <p>{tool.description}</p>
            <div class="tagRow">
              {#each tool.tags.slice(0, 4) as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/each}
{/if}

<section class="comingSoon">
  <h2>More tools are coming.</h2>
  <p>
    Have a request? Open an issue on
    <a href={brand.repoUrl} class="repoLink">GitHub</a>.
    These tools are built for repeatable office work — bulk processing, mail-merge style fan-out,
    and batch transforms. The full version of any tool here is a few lines of Python in
    <a href="{base}/" class="brandLink">{brand.name}</a>.
  </p>
</section>

<style>
  .toolsHero {
    display: grid;
    gap: 14px;
    padding: 36px 0 18px;
  }

  .heroChip {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    padding: 5px 12px;
    border-radius: 999px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .toolsHero h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 2.8rem);
    line-height: 1.1;
    letter-spacing: -0.015em;
  }

  .heroLead {
    margin: 0;
    max-width: 720px;
    color: var(--text-muted);
    font-size: 1.05rem;
    line-height: 1.6;
  }

  .promiseRow {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    margin-bottom: 22px;
  }

  .promiseCard {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--surface) 80%, transparent);
  }

  .promiseIcon {
    color: var(--accent);
    font-size: 0.82rem;
    margin-top: 4px;
  }

  .promiseLabel {
    font-weight: 600;
    margin-bottom: 2px;
  }

  .promiseCard p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.88rem;
    line-height: 1.5;
  }

  .filterBar {
    display: grid;
    gap: 12px;
    margin-bottom: 22px;
    padding: 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--surface) 80%, transparent);
    position: sticky;
    top: 8px;
    z-index: 4;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .searchWrap {
    position: relative;
    display: block;
  }

  .searchIcon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-soft);
    font-size: 1.1rem;
    pointer-events: none;
  }

  .searchField {
    width: 100%;
    padding: 10px 14px 10px 38px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .searchField:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .categoryChips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .catChip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-muted);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .catChip:hover {
    color: var(--text);
    border-color: var(--border-strong);
  }

  .catChip.active {
    color: var(--text);
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  .chipCount {
    color: var(--text-soft);
    font-size: 0.76rem;
    padding: 1px 6px;
    border-radius: 999px;
    background: var(--surface-muted);
  }

  .catChip.active .chipCount {
    color: var(--accent);
    background: rgba(255, 255, 255, 0.06);
  }

  .toolGroup {
    margin-bottom: 32px;
  }

  .groupHead {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 14px;
  }

  .groupHead h2 {
    margin: 0;
    font-size: 0.82rem;
    color: var(--text-soft);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
  }

  .groupDescription {
    margin: 4px 0 0;
    color: var(--text-soft);
    font-size: 0.85rem;
  }

  .groupCount {
    color: var(--text-soft);
    font-size: 0.78rem;
    white-space: nowrap;
  }

  .toolCard {
    display: grid;
    gap: 10px;
    color: var(--text);
    text-decoration: none;
    align-content: start;
  }

  .toolIcon {
    color: var(--accent);
    font-size: 1.4rem;
    line-height: 1;
    font-weight: 500;
  }

  .toolCard h3 {
    margin: 0;
    font-size: 1.05rem;
  }

  .tagRow {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 4px;
  }

  .tag {
    display: inline-flex;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--surface-muted);
    color: var(--text-soft);
    font-size: 0.72rem;
    letter-spacing: 0.02em;
  }

  .emptyState {
    display: grid;
    place-items: center;
    gap: 12px;
    padding: 40px 24px;
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    color: var(--text-muted);
    text-align: center;
  }

  .comingSoon {
    margin: 36px 0 0;
    padding: 24px;
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    text-align: center;
    color: var(--text-muted);
  }

  .comingSoon h2 {
    margin: 0 0 8px;
    font-size: 1.15rem;
    color: var(--text);
  }

  .comingSoon p {
    margin: 0;
    line-height: 1.65;
  }

  .repoLink,
  .brandLink {
    color: var(--accent);
    border-bottom: 1px dotted color-mix(in srgb, var(--accent) 50%, transparent);
  }
</style>
