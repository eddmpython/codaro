<script>
  import { base } from "$app/paths";
  import { brand } from "$lib/brand";
  import {
    ArrowRight,
    BookOpen,
    CalendarClock,
    CheckCircle2,
    Download,
    ExternalLink,
    FileCheck2,
    Github,
    PackageCheck,
    ShieldCheck,
    Terminal,
    Workflow,
  } from "lucide-svelte";

  const surfaces = [
    {
      label: "Chat",
      title: "Start with intent",
      copy: "Turn a learning goal or recurring task into a notebook-backed plan.",
      icon: BookOpen,
    },
    {
      label: "Editor",
      title: "Run real cells",
      copy: "Write Python and Markdown cells that stay executable as normal files.",
      icon: Terminal,
    },
    {
      label: "Learning",
      title: "Practice in place",
      copy: "Study cards, snippets, exercises, and checks live in the same runtime.",
      icon: CheckCircle2,
    },
    {
      label: "Automation",
      title: "Schedule repeat work",
      copy: "Promote working cells into tasks, reports, and desktop automation flows.",
      icon: Workflow,
    },
  ];

  const trustItems = [
    {
      title: "Local-first runtime",
      copy: "The desktop launcher runs Codaro on your machine instead of turning your work into a hosted account flow.",
      icon: ShieldCheck,
    },
    {
      title: "Release integrity",
      copy: "Launcher builds attach the executable, SHA256 checksum, and SPDX SBOM to GitHub Releases.",
      icon: FileCheck2,
    },
    {
      title: "Open repository",
      copy: "Code, docs, security policy, privacy notes, and release workflows are visible in the public repo.",
      icon: Github,
    },
  ];

  const downloadChecks = [
    "Download CodaroLauncher.exe from the latest GitHub Release.",
    "Verify the SHA256 checksum before trusting the binary.",
    "Run the launcher and let it provision the curated local Codaro runtime.",
  ];
</script>

<svelte:head>
  <title>Codaro - Local Python learning and automation studio</title>
  <meta
    name="description"
    content="Download Codaro, a local-first desktop studio for Python notebooks, guided learning, and repeatable automation. Built in the open and distributed through GitHub Releases."
  />
  <meta
    name="keywords"
    content="Codaro, Python learning, notebook runtime, desktop automation, local-first developer tool, GitHub Pages, Codaro Launcher"
  />
  <meta property="og:title" content="Codaro - Local Python learning and automation studio" />
  <meta
    property="og:description"
    content="A programmable desktop studio where code, learning, and automation share one local runtime."
  />
  <meta name="twitter:title" content="Codaro - Local Python learning and automation studio" />
  <meta
    name="twitter:description"
    content="Download the Codaro desktop launcher and run a local-first studio for Python learning and automation."
  />
</svelte:head>

<section class="landingHero" aria-labelledby="hero-title">
  <img class="heroMascot" src={brand.mascotUrl} alt="" width="480" height="480" />
  <div class="siteShell heroShell">
    <div class="heroCopy">
      <p class="eyebrow">Open source / Local-first / Desktop launcher</p>
      <h1 id="hero-title">Codaro</h1>
      <p class="heroLead">
        Code, learning, and automation in one local studio. Start with a guided Python lesson,
        keep the work as executable notebook cells, then turn repeatable steps into desktop tasks.
      </p>
      <div class="heroActions">
        <a class="primaryButton" href={brand.launcherDownloadUrl}>
          <Download size={17} aria-hidden="true" />
          Download for Windows
        </a>
        <a class="ghostButton" href={brand.repoUrl}>
          <Github size={17} aria-hidden="true" />
          GitHub repo
        </a>
        <a class="textButton" href="{base}/docs">
          Read docs
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
      <div class="heroProof" aria-label="Release packaging summary">
        <span><PackageCheck size={15} aria-hidden="true" /> CodaroLauncher.exe</span>
        <span><FileCheck2 size={15} aria-hidden="true" /> SHA256 + SBOM</span>
        <span><ShieldCheck size={15} aria-hidden="true" /> GitHub Releases</span>
      </div>
    </div>

    <div class="runtimePreview" aria-label="Codaro product flow preview">
      <div class="previewTopbar">
        <span></span>
        <span></span>
        <span></span>
        <strong>codaro.local</strong>
      </div>
      <div class="previewGrid">
        <aside class="previewRail" aria-label="Product surfaces">
          <span class="railActive">Chat</span>
          <span>Editor</span>
          <span>Learning</span>
          <span>Automation</span>
        </aside>
        <div class="previewMain">
          <div class="chatLine userLine">Build a Python lesson for CSV cleanup.</div>
          <div class="chatLine systemLine">Created curriculum cells, starter code, and checks.</div>
          <div class="cellBlock">
            <div class="cellHeader">
              <span>Python cell</span>
              <button type="button">Run</button>
            </div>
            <pre><code>import pandas as pd

df = pd.read_csv("downloads.csv")
clean = df.drop_duplicates()</code></pre>
          </div>
          <div class="resultStrip">
            <span>Ready</span>
            <strong>3 cells / 1 task draft / local runtime</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="landingSection">
  <div class="siteShell">
    <div class="sectionIntro">
      <p class="eyebrow">Product surface</p>
      <h2>One document model across the whole workflow.</h2>
      <p>
        Codaro is not a static course site or a loose script folder. Chat, editor, learning cards,
        and automation all point back to notebook cells that can be inspected and rerun.
      </p>
    </div>
    <div class="surfaceGrid">
      {#each surfaces as surface}
        <article class="surfaceCard">
          <svelte:component this={surface.icon} size={20} aria-hidden="true" />
          <p>{surface.label}</p>
          <h3>{surface.title}</h3>
          <span>{surface.copy}</span>
        </article>
      {/each}
    </div>
  </div>
</section>

<section class="landingBand">
  <div class="siteShell flowShell">
    <div class="sectionIntro compactIntro">
      <p class="eyebrow">Why Codaro</p>
      <h2>Learn by building the workflow you will automate.</h2>
      <p>
        Lessons are practical cells, not detached explanations. The same runtime that teaches a
        concept can keep the finished script and schedule it later.
      </p>
    </div>
    <div class="flowTrack" aria-label="Codaro workflow">
      <div>
        <span>01</span>
        <strong>Ask for a lesson or task</strong>
      </div>
      <div>
        <span>02</span>
        <strong>Practice in runnable cells</strong>
      </div>
      <div>
        <span>03</span>
        <strong>Keep the notebook as source</strong>
      </div>
      <div>
        <span>04</span>
        <strong>Promote repeat work to automation</strong>
      </div>
    </div>
  </div>
</section>

<section class="landingSection" id="download">
  <div class="siteShell downloadShell">
    <div class="sectionIntro">
      <p class="eyebrow">Desktop launcher</p>
      <h2>Download Codaro from GitHub Releases.</h2>
      <p>
        The public landing page is served from GitHub Pages. The desktop launcher is distributed
        as a release artifact so users can download the app and verify what they run.
      </p>
      <div class="downloadActions">
        <a class="primaryButton" href={brand.launcherDownloadUrl}>
          <Download size={17} aria-hidden="true" />
          Download CodaroLauncher.exe
        </a>
        <a class="ghostButton" href={brand.launcherChecksumUrl}>
          <FileCheck2 size={17} aria-hidden="true" />
          Checksum
        </a>
        <a class="textButton" href={brand.releaseUrl}>
          Release notes
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </div>
    </div>
    <div class="downloadPanel">
      <div class="downloadPanelHeader">
        <CalendarClock size={18} aria-hidden="true" />
        <strong>Install path</strong>
      </div>
      <ol>
        {#each downloadChecks as check}
          <li>{check}</li>
        {/each}
      </ol>
      <div class="releaseLinks">
        <a href={brand.launcherSbomUrl}>SPDX SBOM</a>
        <a href={brand.releaseUrl}>All release assets</a>
      </div>
    </div>
  </div>
</section>

<section class="landingSection trustSection">
  <div class="siteShell">
    <div class="sectionIntro">
      <p class="eyebrow">Public trust</p>
      <h2>Built like a repo people can inspect before installing.</h2>
    </div>
    <div class="trustGrid">
      {#each trustItems as item}
        <article class="trustItem">
          <svelte:component this={item.icon} size={20} aria-hidden="true" />
          <h3>{item.title}</h3>
          <p>{item.copy}</p>
        </article>
      {/each}
    </div>
  </div>
</section>

<section class="finalCta">
  <div class="siteShell finalCtaShell">
    <img src={brand.mascotUrl} alt="Codaro mascot" width="120" height="120" />
    <div>
      <p class="eyebrow">Start locally</p>
      <h2>Install the launcher, open the studio, keep the code.</h2>
    </div>
    <a class="primaryButton" href={brand.launcherDownloadUrl}>
      <Download size={17} aria-hidden="true" />
      Download for Windows
    </a>
  </div>
</section>

<style>
  .landingHero {
    position: relative;
    overflow: hidden;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: var(--background);
  }

  .heroMascot {
    position: absolute;
    right: max(24px, calc((100vw - 1120px) / 2));
    top: 18px;
    width: min(32vw, 360px);
    height: auto;
    opacity: 0.2;
    pointer-events: none;
  }

  .heroShell {
    position: relative;
    display: grid;
    align-content: center;
    gap: 32px;
    min-height: clamp(620px, 82svh, 820px);
    padding: 64px 0 40px;
  }

  .heroCopy {
    display: grid;
    justify-items: center;
    gap: 18px;
    max-width: 860px;
    margin: 0 auto;
    text-align: center;
  }

  .eyebrow {
    margin: 0;
    color: var(--text-soft);
    font-size: 0.78rem;
    font-weight: 650;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .heroCopy h1 {
    margin: 0;
    color: var(--text);
    font-size: clamp(4rem, 12vw, 9.2rem);
    line-height: 0.85;
    font-weight: 760;
  }

  .heroLead {
    margin: 0;
    max-width: 760px;
    color: var(--text-muted);
    font-size: clamp(1rem, 2vw, 1.24rem);
    line-height: 1.62;
  }

  .heroProof {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    color: var(--text-soft);
    font-size: 0.84rem;
  }

  .heroProof span,
  .releaseLinks a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 30px;
    padding: 5px 10px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--surface);
  }

  .runtimePreview {
    width: min(920px, 100%);
    margin: 0 auto;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: var(--shadow);
  }

  .previewTopbar {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 38px;
    padding: 0 14px;
    border-bottom: 1px solid var(--border);
    color: var(--text-soft);
    font-size: 0.78rem;
  }

  .previewTopbar span {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: var(--surface-muted);
    border: 1px solid var(--border-strong);
  }

  .previewTopbar strong {
    margin-left: 8px;
    font-weight: 600;
  }

  .previewGrid {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    min-height: 290px;
  }

  .previewRail {
    display: grid;
    align-content: start;
    gap: 6px;
    padding: 16px;
    border-right: 1px solid var(--border);
    background: var(--surface-subtle);
  }

  .previewRail span {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 0 10px;
    border-radius: 8px;
    color: var(--text-soft);
    font-size: 0.86rem;
  }

  .previewRail .railActive {
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border);
  }

  .previewMain {
    display: grid;
    align-content: start;
    gap: 10px;
    padding: 18px;
  }

  .chatLine {
    max-width: 72%;
    padding: 10px 12px;
    border-radius: 8px;
    line-height: 1.45;
    font-size: 0.88rem;
  }

  .userLine {
    justify-self: end;
    background: var(--text);
    color: var(--background);
  }

  .systemLine {
    justify-self: start;
    background: var(--surface-muted);
    color: var(--text-muted);
  }

  .cellBlock {
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: #0f172a;
    color: #e2e8f0;
  }

  .cellHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 36px;
    padding: 0 12px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.22);
    color: #94a3b8;
    font-size: 0.78rem;
  }

  .cellHeader button {
    height: 24px;
    padding: 0 10px;
    border: 1px solid rgba(148, 163, 184, 0.34);
    border-radius: 6px;
    background: rgba(15, 23, 42, 0.8);
    color: #e2e8f0;
  }

  .cellBlock pre {
    margin: 0;
    overflow-x: auto;
    padding: 14px;
    font-size: 0.86rem;
    line-height: 1.5;
  }

  .resultStrip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-muted);
    font-size: 0.84rem;
  }

  .resultStrip span {
    color: var(--success);
    font-weight: 700;
  }

  .landingSection,
  .landingBand {
    padding: 80px 0;
  }

  .landingBand {
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: var(--surface-subtle);
  }

  .sectionIntro {
    display: grid;
    gap: 10px;
    max-width: 760px;
    margin-bottom: 26px;
  }

  .sectionIntro h2,
  .finalCta h2 {
    margin: 0;
    color: var(--text);
    font-size: clamp(2rem, 4vw, 3.1rem);
    line-height: 1.06;
  }

  .sectionIntro p:not(.eyebrow) {
    margin: 0;
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1.65;
  }

  .surfaceGrid,
  .trustGrid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .surfaceCard,
  .trustItem,
  .downloadPanel {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: var(--shadow-sm);
  }

  .surfaceCard {
    display: grid;
    align-content: start;
    gap: 9px;
    min-height: 190px;
    padding: 18px;
  }

  .surfaceCard :global(svg),
  .trustItem :global(svg),
  .downloadPanelHeader :global(svg) {
    color: var(--text);
  }

  .surfaceCard p {
    margin: 0;
    color: var(--text-soft);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .surfaceCard h3,
  .trustItem h3 {
    margin: 0;
    font-size: 1.04rem;
  }

  .surfaceCard span,
  .trustItem p {
    color: var(--text-muted);
    font-size: 0.92rem;
    line-height: 1.58;
  }

  .flowShell {
    display: grid;
    gap: 24px;
  }

  .compactIntro {
    margin-bottom: 0;
  }

  .flowTrack {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .flowTrack div {
    display: grid;
    gap: 12px;
    min-height: 128px;
    padding: 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--background);
  }

  .flowTrack span {
    color: var(--text-soft);
    font-size: 0.78rem;
    font-weight: 800;
  }

  .flowTrack strong {
    color: var(--text);
    font-size: 1rem;
    line-height: 1.42;
  }

  .downloadShell {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
    gap: 32px;
    align-items: start;
  }

  .downloadActions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
  }

  .downloadPanel {
    display: grid;
    gap: 18px;
    padding: 20px;
  }

  .downloadPanelHeader {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .downloadPanel ol {
    display: grid;
    gap: 12px;
    margin: 0;
    padding-left: 24px;
    color: var(--text-muted);
    line-height: 1.55;
  }

  .releaseLinks {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .releaseLinks a {
    color: var(--text-muted);
    font-size: 0.84rem;
  }

  .trustSection {
    padding-top: 24px;
  }

  .trustGrid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .trustItem {
    display: grid;
    gap: 10px;
    padding: 18px;
  }

  .trustItem p {
    margin: 0;
  }

  .finalCta {
    padding: 34px 0 72px;
  }

  .finalCtaShell {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 22px;
    padding: 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: var(--shadow-sm);
  }

  .finalCta img {
    width: 82px;
    height: 82px;
    object-fit: contain;
  }

  @media (max-width: 920px) {
    .heroMascot {
      right: -40px;
      width: 280px;
    }

    .previewGrid,
    .downloadShell,
    .finalCtaShell {
      grid-template-columns: 1fr;
    }

    .previewRail {
      grid-auto-flow: column;
      grid-auto-columns: max-content;
      overflow-x: auto;
      border-right: none;
      border-bottom: 1px solid var(--border);
    }

    .surfaceGrid,
    .flowTrack,
    .trustGrid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .finalCtaShell {
      justify-items: start;
    }
  }

  @media (max-width: 620px) {
    .landingHero {
      border-top: 0;
    }

    .heroShell {
      min-height: auto;
      padding: 42px 0 26px;
    }

    .heroMascot {
      top: 16px;
      right: -88px;
      width: 250px;
      opacity: 0.12;
    }

    .heroCopy {
      justify-items: start;
      text-align: left;
    }

    .heroActions,
    .heroProof,
    .downloadActions {
      justify-content: flex-start;
    }

    .heroActions a,
    .downloadActions a,
    .finalCtaShell a {
      width: 100%;
    }

    .runtimePreview {
      border-radius: 8px;
    }

    .chatLine {
      max-width: 100%;
    }

    .landingSection,
    .landingBand {
      padding: 56px 0;
    }

    .surfaceGrid,
    .flowTrack,
    .trustGrid {
      grid-template-columns: 1fr;
    }

    .finalCta {
      padding-bottom: 48px;
    }
  }
</style>
