<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.post.title} · Codaro Blog</title>
  <meta name="description" content={data.post.description} />
</svelte:head>

<div class="siteShell articleShell">
  <div class="pageHero">
    <div class="badge">Blog post</div>
    <h1>{data.post.title}</h1>
    <div class="articleMeta">
      <span>{data.post.date}</span>
      <span class="badge">{data.post.categoryLabel}</span>
      <span class="badge">{data.post.series}</span>
    </div>
    <p>{data.post.description}</p>
  </div>

  <article class="contentCard">
    {@html data.post.html}
  </article>
</div>
