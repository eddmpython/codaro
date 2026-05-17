<script>
  import { page } from "$app/state";
  import { base } from "$app/paths";
  import { tools, findTool, categories } from "$lib/tools/registry.js";

  let { children } = $props();

  let pathname = $derived(page.url.pathname);
  let currentSlug = $derived.by(() => {
    const indexHref = `${base}/tools`;
    if (pathname === indexHref || pathname === `${indexHref}/`) return null;
    if (!pathname.startsWith(`${indexHref}/`)) return null;
    const rest = pathname.slice(indexHref.length + 1);
    return rest.replace(/\/$/, "");
  });
  let currentTool = $derived(currentSlug ? findTool(currentSlug) : null);
  let currentCategory = $derived(currentTool?.category ?? null);

  let neighborTools = $derived(
    currentCategory
      ? tools.filter((t) => t.category === currentCategory && t.slug !== currentTool?.slug).slice(0, 5)
      : []
  );
</script>

<div class="siteShell toolsShell">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="{base}/tools">All tools</a>
    {#if currentTool && currentCategory}
      <span class="sep" aria-hidden="true">›</span>
      <span class="catBadge">{categories[currentCategory].label}</span>
      <span class="sep" aria-hidden="true">›</span>
      <span class="currentTitle">{currentTool.title}</span>
    {/if}
  </nav>

  {@render children()}

  {#if neighborTools.length > 0}
    <aside class="neighborStrip">
      <h3>More {currentCategory ? categories[currentCategory].label.toLowerCase() : ""} tools</h3>
      <ul>
        {#each neighborTools as tool}
          <li>
            <a href="{base}/tools/{tool.slug}">
              <span class="neighborIcon" aria-hidden="true">{tool.icon}</span>
              <span class="neighborTitle">{tool.title}</span>
              <span class="neighborDesc">{tool.description}</span>
            </a>
          </li>
        {/each}
      </ul>
    </aside>
  {/if}
</div>

<style>
  .toolsShell {
    padding-bottom: 24px;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin: 18px 0 4px;
    font-size: 0.85rem;
    color: var(--text-soft);
  }

  .breadcrumb a {
    color: var(--text-muted);
    transition: color 0.15s;
  }

  .breadcrumb a:hover {
    color: var(--text);
  }

  .sep {
    color: var(--text-soft);
  }

  .catBadge {
    color: var(--text-muted);
  }

  .currentTitle {
    color: var(--text);
    font-weight: 500;
  }

  .neighborStrip {
    margin-top: 36px;
    padding: 20px 22px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--surface) 80%, transparent);
  }

  .neighborStrip h3 {
    margin: 0 0 12px;
    font-size: 0.78rem;
    color: var(--text-soft);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
  }

  .neighborStrip ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
  }

  .neighborStrip a {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    column-gap: 10px;
    row-gap: 2px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--text);
    text-decoration: none;
    transition: border-color 0.15s, transform 0.15s;
  }

  .neighborStrip a:hover {
    border-color: var(--border-strong);
    transform: translateY(-1px);
  }

  .neighborIcon {
    grid-row: span 2;
    color: var(--accent);
    font-size: 1.2rem;
    align-self: center;
  }

  .neighborTitle {
    font-weight: 500;
    font-size: 0.92rem;
  }

  .neighborDesc {
    color: var(--text-soft);
    font-size: 0.78rem;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>
