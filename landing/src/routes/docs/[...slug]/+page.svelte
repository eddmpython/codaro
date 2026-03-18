<script>
  import { page as routePage } from "$app/state";

  let { data } = $props();
</script>

<svelte:head>
  <title>{data.page.title} · Codaro Docs</title>
  <meta name="description" content={data.page.description} />
</svelte:head>

<div class="siteShell docsLayout">
  <aside class="surfaceCard docsSidebar">
    {#each data.docsSections as section}
      <div class="docsNavSection">
        <h3>{section.label}</h3>
        {#each section.pages as navPage}
          <a class:active={routePage.url.pathname === navPage.url} href={navPage.url}>
            {navPage.title}
          </a>
        {/each}
      </div>
    {/each}
  </aside>

  <div class="articleShell">
    <div class="pageHero">
      <div class="badge">{data.page.sectionLabel}</div>
      <h1>{data.page.title}</h1>
      <p>{data.page.description}</p>
    </div>

    <article class="contentCard">
      {@html data.page.html}
    </article>
  </div>
</div>
