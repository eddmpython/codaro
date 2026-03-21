<script>
  import { page as routePage } from "$app/state";
  import { ChevronLeft, ChevronRight } from "lucide-svelte";
  import { buildDocsPageJsonLd, buildBreadcrumbJsonLd } from "$lib/seo";
  import { brand } from "$lib/brand";

  let { data } = $props();

  let allPages = $derived(data.docsSections.flatMap((s) => s.pages));
  let currentIndex = $derived(allPages.findIndex((p) => p.url === routePage.url.pathname));
  let prevPage = $derived(currentIndex > 0 ? allPages[currentIndex - 1] : null);
  let nextPage = $derived(currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null);

  let pageJsonLd = $derived(JSON.stringify(buildDocsPageJsonLd(data.page)));
  let breadcrumbJsonLd = $derived(JSON.stringify(buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Docs", url: "/docs" },
    { name: data.page.sectionLabel, url: null },
    { name: data.page.title, url: data.page.url },
  ])));
</script>

<svelte:head>
  <title>{data.page.title} · Codaro Docs</title>
  <meta name="description" content={data.page.description} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{data.page.title} · Codaro Docs" />
  <meta property="og:description" content={data.page.description} />
  <meta property="og:url" content="{brand.siteUrl}{data.page.url}" />
  <link rel="canonical" href="{brand.siteUrl}{data.page.url}" />
  {@html `<script type="application/ld+json">${pageJsonLd}</script>`}
  {@html `<script type="application/ld+json">${breadcrumbJsonLd}</script>`}
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

    <nav class="docsPrevNext" aria-label="Previous and next pages">
      {#if prevPage}
        <a class="docsPrevNextLink docsPrev" href={prevPage.url}>
          <ChevronLeft size={16} />
          <div>
            <span class="docsPrevNextLabel">Previous</span>
            <span class="docsPrevNextTitle">{prevPage.title}</span>
          </div>
        </a>
      {:else}
        <span></span>
      {/if}
      {#if nextPage}
        <a class="docsPrevNextLink docsNext" href={nextPage.url}>
          <div>
            <span class="docsPrevNextLabel">Next</span>
            <span class="docsPrevNextTitle">{nextPage.title}</span>
          </div>
          <ChevronRight size={16} />
        </a>
      {/if}
    </nav>
  </div>
</div>
