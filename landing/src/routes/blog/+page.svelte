<script>
  let { data } = $props();
</script>

<div class="siteShell">
  <section class="pageHero">
    <div class="badge">Blog</div>
    <h1>Codaro writing surface</h1>
    <p>Posts on editor runtime, notebook mechanics, learning flows, and app automation.</p>
  </section>

  <section class="pageSection">
    <div class="sectionHeader">
      <div>
        <h2>Categories</h2>
        <p>Fixed public categories for build and archive pages.</p>
      </div>
    </div>
    <div class="cardGrid">
      {#each data.postCategories as category}
        <a class="surfaceCard" href={`/blog/category/${category.slug}`}>
          <h3>{category.label}</h3>
          <p>Archive for {category.slug}.</p>
        </a>
      {/each}
    </div>
  </section>

  <section class="pageSection">
    <div class="sectionHeader">
      <div>
        <h2>All posts</h2>
        <p>Sorted by date, newest first.</p>
      </div>
    </div>
    <div class="listStack">
      {#each data.posts as post}
        <a class="rowCard" href={post.url}>
          <strong>{post.title}</strong>
          <div class="rowMeta">
            <span>{post.date}</span>
            <span class="badge">{post.categoryLabel}</span>
            <span class="badge">{post.series}</span>
          </div>
          <div>{post.description}</div>
        </a>
      {/each}
    </div>
  </section>
</div>
