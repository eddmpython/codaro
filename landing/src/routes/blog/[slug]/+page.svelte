<script>
  import { buildBlogPostJsonLd, buildBreadcrumbJsonLd } from "$lib/seo";
  import { brand } from "$lib/brand";

  let { data } = $props();

  let postJsonLd = $derived(JSON.stringify(buildBlogPostJsonLd(data.post)));
  let breadcrumbJsonLd = $derived(JSON.stringify(buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: data.post.categoryLabel, url: data.post.categoryPath },
    { name: data.post.title, url: data.post.url },
  ])));
</script>

<svelte:head>
  <title>{data.post.title} · Codaro Blog</title>
  <meta name="description" content={data.post.description} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{data.post.title} · Codaro Blog" />
  <meta property="og:description" content={data.post.description} />
  <meta property="og:url" content="{brand.siteUrl}{data.post.url}" />
  <meta property="og:image" content="{brand.siteUrl}{data.post.thumbnail}" />
  <meta property="article:published_time" content={data.post.date ? new Date(data.post.date).toISOString() : ""} />
  <link rel="canonical" href="{brand.siteUrl}{data.post.url}" />
  {@html `<script type="application/ld+json">${postJsonLd}</script>`}
  {@html `<script type="application/ld+json">${breadcrumbJsonLd}</script>`}
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
