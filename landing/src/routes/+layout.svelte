<script>
  import { page } from "$app/state";
  import { base } from "$app/paths";
  import "../app.css";
  import { brand } from "$lib/brand";
  import { buildWebsiteJsonLd, buildSoftwareJsonLd } from "$lib/seo";

  let { children } = $props();

  let pathname = $derived(page.url.pathname);

  const navDefs = [
    { path: "/", label: "Home" },
    { path: "/blog", label: "Blog" },
    { path: "/docs", label: "Docs" },
    { path: "/search", label: "Search" },
  ];

  let navItems = $derived(navDefs.map((item) => ({ ...item, href: `${base}${item.path}` })));

  let mobileOpen = $state(false);

  function toggleMobile() {
    mobileOpen = !mobileOpen;
  }

  const websiteJsonLd = JSON.stringify(buildWebsiteJsonLd());
  const softwareJsonLd = JSON.stringify(buildSoftwareJsonLd());
</script>

<svelte:head>
  <title>{brand.name}</title>
  <meta name="description" content={brand.description} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="{brand.name} — {brand.tagline}" />
  <meta property="og:description" content={brand.description} />
  <meta property="og:url" content={brand.siteUrl} />
  <meta property="og:image" content="{brand.siteUrl}/brand/avatar-full.png" />
  <meta property="og:site_name" content={brand.name} />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="{brand.name} — {brand.tagline}" />
  <meta name="twitter:description" content={brand.description} />
  <meta name="twitter:image" content="{brand.siteUrl}/brand/avatar-full.png" />
  <link rel="alternate" type="application/atom+xml" title="Codaro Blog" href="{base}/feed.xml" />
  <link rel="canonical" href="{brand.siteUrl}{pathname}" />
  <meta name="theme-color" content="#18181b" media="(prefers-color-scheme: dark)" />
  <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
  {@html `<script type="application/ld+json">${websiteJsonLd}</script>`}
  {@html `<script type="application/ld+json">${softwareJsonLd}</script>`}
</svelte:head>

<div class="siteShell">
  <header class="topNav">
    <a class="brandMark" href="{base}/">
      <img src={brand.avatarSmallUrl} alt="Codaro avatar" width="38" height="38" />
      <span>{brand.name}</span>
    </a>
    <nav class="navLinks desktopNav" aria-label="Primary">
      {#each navItems as item}
        <a
          class:active={pathname === item.href || (item.path !== "/" && pathname.startsWith(item.href))}
          class="navPill"
          href={item.href}
        >
          {item.label}
        </a>
      {/each}
    </nav>
    <button class="mobileMenuBtn" onclick={toggleMobile} aria-label="Toggle menu">
      <span class="hamburger" class:open={mobileOpen}></span>
    </button>
  </header>
</div>

{#if mobileOpen}
  <nav class="mobileNav" aria-label="Mobile navigation">
    <div class="siteShell">
      {#each navItems as item}
        <a
          class:active={pathname === item.href || (item.path !== "/" && pathname.startsWith(item.href))}
          class="mobileNavLink"
          href={item.href}
          onclick={() => mobileOpen = false}
        >
          {item.label}
        </a>
      {/each}
    </div>
  </nav>
{/if}

{@render children()}

<footer class="siteFooter">
  <div class="siteShell footerGrid">
    <div class="footerCol">
      <div class="footerBrand">
        <img src={brand.avatarSmallUrl} alt="Codaro" width="28" height="28" />
        <strong>{brand.name}</strong>
      </div>
      <p class="footerTagline">{brand.tagline}</p>
      <img class="footerMascot" src={brand.poses.reading} alt="Codaro reading" width="72" height="72" />
    </div>
    <div class="footerCol">
      <h4>Product</h4>
      <a href="{base}/docs/getting-started/installation">Getting started</a>
      <a href="{base}/docs/concepts/block-model">Block model</a>
      <a href="{base}/docs/concepts/execution-runtime">Execution runtime</a>
    </div>
    <div class="footerCol">
      <h4>Resources</h4>
      <a href="{base}/docs">Docs</a>
      <a href="{base}/blog">Blog</a>
      <a href="{base}/search">Search</a>
    </div>
    <div class="footerCol">
      <h4>Community</h4>
      <a href={brand.repoUrl}>GitHub</a>
      <a href="{brand.repoUrl}/issues">Issues</a>
      <a href="{brand.repoUrl}/releases">Releases</a>
    </div>
  </div>
  <div class="siteShell footerBottom">
    <span>Codaro — interactive editor runtime</span>
  </div>
</footer>
