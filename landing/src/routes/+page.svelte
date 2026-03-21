<script>
  import { base } from "$app/paths";
  import { Code, BookOpen, Search, Zap, Layers, Monitor } from "lucide-svelte";
  import { brand } from "$lib/brand";
  import { posts } from "$lib/generated/posts";
  import { docsSections } from "$lib/generated/docsNav";

  const latestPosts = posts.slice(0, 3);
  const latestDocs = docsSections.flatMap((s) => s.pages.slice(0, 1)).slice(0, 3);

  const pillars = [
    {
      title: "Write code, not boilerplate",
      description: "Just write Python. The engine handles scope isolation, variable tracking, and dependency analysis behind the scenes.",
      icon: Code,
      pose: "coding",
    },
    {
      title: "Reactive by default",
      description: "Change one cell and every downstream dependency re-executes automatically. No manual re-run, no stale state.",
      icon: Zap,
      pose: "success",
    },
    {
      title: "Browser to local, same model",
      description: "Start in Pyodide, switch to a local kernel for heavy work. Same document, same API, same experience.",
      icon: Monitor,
      pose: "building",
    },
  ];

  const surfaces = [
    {
      title: "Editor runtime",
      description: "One surface for notebooks, guided learning, and automation flows.",
      icon: Layers,
      pose: "working",
    },
    {
      title: "Public docs",
      description: "Concepts, guides, and reference pages built from markdown sources.",
      icon: BookOpen,
      pose: "reading",
    },
    {
      title: "Searchable knowledge",
      description: "A single index over docs and blog content.",
      icon: Search,
      pose: "search",
    },
  ];
</script>

<div class="siteShell">
  <section class="heroSection">
    <div class="heroContent">
      <div class="badge">Programmable studio</div>
      <h1 class="heroTitle">
        Code. Learn. Automate.<br />
        <span class="heroAccent">One runtime.</span>
      </h1>
      <p class="heroSub">{brand.description}</p>
      <div class="heroActions">
        <a class="primaryButton" href="{base}/docs/getting-started/installation">
          Get started
        </a>
        <a class="secondaryButton" href="{base}/blog">
          Read the blog
        </a>
        <a class="ghostButton" href={brand.repoUrl}>
          GitHub
        </a>
      </div>
    </div>
    <div class="heroVisual">
      <div class="heroMascotWrap">
        <img
          class="heroMascot"
          src={brand.poses.hello}
          alt="Codaro mascot waving hello"
          width="320"
          height="320"
        />
      </div>
    </div>
  </section>

  <section class="pageSection">
    <div class="sectionHeader">
      <div>
        <h2>Why Codaro</h2>
        <p>Transparent scope isolation, reactive execution, and one model across environments.</p>
      </div>
    </div>
    <div class="cardGrid pillarsGrid">
      {#each pillars as pillar}
        <article class="pillarCard">
          <div class="pillarTop">
            <div class="pillarIcon">
              <pillar.icon size={20} />
            </div>
            <img
              class="pillarPose"
              src={brand.poses[pillar.pose]}
              alt="Codaro {pillar.pose}"
              width="64"
              height="64"
            />
          </div>
          <h3>{pillar.title}</h3>
          <p>{pillar.description}</p>
        </article>
      {/each}
    </div>
  </section>

  <section class="pageSection">
    <div class="sectionHeader">
      <div>
        <h2>Surfaces</h2>
        <p>The editor, docs, and search live as separate but connected layers.</p>
      </div>
    </div>
    <div class="cardGrid">
      {#each surfaces as card}
        <article class="surfaceCard surfaceWithPose">
          <img
            class="surfacePose"
            src={brand.poses[card.pose]}
            alt="Codaro {card.pose}"
            width="48"
            height="48"
          />
          <div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        </article>
      {/each}
    </div>
  </section>

  <section class="pageSection">
    <div class="sectionHeader">
      <div>
        <h2>Resources</h2>
        <p>Docs, repo, blog, and search in one place.</p>
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
        <h2>Latest posts</h2>
        <p>Notes on runtime design, learning flows, and automation.</p>
      </div>
      <a class="ghostButton" href="{base}/blog">View all</a>
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
        <h2>Docs</h2>
        <p>Concepts, guides, and reference pages.</p>
      </div>
      <a class="ghostButton" href="{base}/docs">Browse docs</a>
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
