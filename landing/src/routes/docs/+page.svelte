<script>
  let { data } = $props();
</script>

<div class="siteShell">
  <section class="pageHero">
    <div class="badge">Docs</div>
    <h1>Codaro public documentation</h1>
    <p>Guides, concepts, and reference pages generated from the root docs tree.</p>
  </section>

  <section class="pageSection">
    <div class="cardGrid">
      {#each data.docsSections as section}
        <article class="surfaceCard">
          <h3>{section.label}</h3>
          <p>{section.pages.length} pages in this section.</p>
          <div class="listStack" style="margin-top: 12px;">
            {#each section.pages.slice(0, 3) as page}
              <a href={page.url}>{page.title}</a>
            {/each}
          </div>
        </article>
      {/each}
    </div>
  </section>
</div>
