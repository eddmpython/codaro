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
    { path: "/tools", label: "Tools" },
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
  <meta property="og:image" content="{brand.siteUrl}/brand/codaro-character.png" />
  <meta property="og:site_name" content={brand.name} />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="{brand.name} — {brand.tagline}" />
  <meta name="twitter:description" content={brand.description} />
  <meta name="twitter:image" content="{brand.siteUrl}/brand/codaro-character.png" />
  <link rel="alternate" type="application/atom+xml" title="Codaro Blog" href="{base}/feed.xml" />
  <link rel="canonical" href="{brand.siteUrl}{pathname}" />
  <meta name="theme-color" content="#09090b" />
  {@html `<script type="application/ld+json">${websiteJsonLd}</script>`}
  {@html `<script type="application/ld+json">${softwareJsonLd}</script>`}
</svelte:head>

<div class="siteShell">
  <header class="topNav">
    <a class="brandMark" href="{base}/">
      <img src={brand.mascotUrl} alt="Codaro" width="38" height="38" />
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
  <div class="siteShell footerBottom">
    <span>{brand.name}</span>
    <a href={brand.repoUrl}>GitHub</a>
  </div>
</footer>
