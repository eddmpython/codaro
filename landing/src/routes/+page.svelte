<script>
  import { BookOpen, NotebookPen, Search } from "lucide-svelte";
  import { brand } from "$lib/brand";
  import { posts } from "$lib/generated/posts";
  import { docsSections } from "$lib/generated/docsNav";

  const latestPosts = posts.slice(0, 3);
  const latestDocs = docsSections.flatMap((section) => section.pages.slice(0, 1)).slice(0, 3);
  const featureCards = [
    {
      title: "Editor runtime",
      description: "One surface for notebooks, guided learning, and automation flows.",
      icon: NotebookPen,
    },
    {
      title: "Public docs",
      description: "Concepts, guides, and reference pages built from root markdown sources.",
      icon: BookOpen,
    },
    {
      title: "Searchable knowledge",
      description: "A single index over docs and blog content.",
      icon: Search,
    },
  ];
</script>

<div class="siteShell">
  <section class="pageHero">
    <div class="badge">Programmable studio</div>
    <h1>{brand.name} public site</h1>
    <p>{brand.description}</p>
    <div class="heroActions">
      <a class="primaryButton" href="/docs/getting-started/installation">Start with docs</a>
      <a class="secondaryButton" href="/blog">Read the blog</a>
    </div>
  </section>

  <section class="pageSection">
    <div class="sectionHeader">
      <div>
        <h2>Core surfaces</h2>
        <p>The public site stays separate from the local editor runtime.</p>
      </div>
    </div>
    <div class="cardGrid">
      {#each featureCards as card}
        <article class="surfaceCard">
          <card.icon size={18} />
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </article>
      {/each}
    </div>
  </section>

  <section class="pageSection">
    <div class="sectionHeader">
      <div>
        <h2>Resources</h2>
        <p>Codaro links for docs, repo, blog, and search.</p>
      </div>
    </div>
    <div class="cardGrid">
      {#each brand.resources as resource}
        <a class="surfaceCard" href={resource.href}>
          <h3>{resource.title}</h3>
          <p>{resource.description}</p>
        </a>
      {/each}
    </div>
  </section>

  <section class="pageSection">
    <div class="sectionHeader">
      <div>
        <h2>Latest blog posts</h2>
        <p>Build notes from the public writing surface.</p>
      </div>
      <a class="ghostButton" href="/blog">View all</a>
    </div>
    <div class="listStack">
      {#each latestPosts as post}
        <a class="rowCard" href={post.url}>
          <strong>{post.title}</strong>
          <div class="rowMeta">
            <span>{post.date}</span>
            <span class="badge">{post.categoryLabel}</span>
          </div>
          <div>{post.description}</div>
        </a>
      {/each}
    </div>
  </section>

  <section class="pageSection">
    <div class="sectionHeader">
      <div>
        <h2>Docs sections</h2>
        <p>Public docs are generated from the root docs tree.</p>
      </div>
      <a class="ghostButton" href="/docs">Browse docs</a>
    </div>
    <div class="listStack">
      {#each latestDocs as doc}
        <a class="rowCard" href={doc.url}>
          <strong>{doc.title}</strong>
          <div class="rowMeta">
            <span class="badge">{doc.sectionLabel}</span>
          </div>
          <div>{doc.description}</div>
        </a>
      {/each}
    </div>
  </section>
</div>
