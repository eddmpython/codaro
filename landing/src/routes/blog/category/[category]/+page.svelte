<script>
  let { data } = $props();
</script>

<div class="siteShell">
  <section class="pageHero">
    <div class="badge">Category</div>
    <h1>{data.category.label}</h1>
    <p>Posts tagged under {data.category.slug}.</p>
  </section>
  <section class="pageSection">
    <div class="listStack">
      {#each data.posts as post}
        <a class="rowCard" href={post.url}>
          <strong>{post.title}</strong>
          <div class="rowMeta">
            <span>{post.date}</span>
            <span class="badge">{post.series}</span>
          </div>
          <div>{post.description}</div>
        </a>
      {/each}
    </div>
  </section>
</div>
