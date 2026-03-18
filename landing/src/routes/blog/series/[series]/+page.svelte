<script>
  let { data } = $props();
</script>

<div class="siteShell">
  <section class="pageHero">
    <div class="badge">Series</div>
    <h1>{data.series.label}</h1>
    <p>Ordered posts inside the {data.series.slug} series.</p>
  </section>
  <section class="pageSection">
    <div class="listStack">
      {#each data.posts as post}
        <a class="rowCard" href={post.url}>
          <strong>{post.seriesOrder}. {post.title}</strong>
          <div class="rowMeta">
            <span>{post.date}</span>
            <span class="badge">{post.categoryLabel}</span>
          </div>
          <div>{post.description}</div>
        </a>
      {/each}
    </div>
  </section>
</div>
