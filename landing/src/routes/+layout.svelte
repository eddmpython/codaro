<script>
  import { page } from "$app/state";
  import "../app.css";
  import { brand } from "$lib/brand";

  $: pathname = page.url.pathname;

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/docs", label: "Docs" },
    { href: "/search", label: "Search" },
  ];
</script>

<svelte:head>
  <title>{brand.name}</title>
  <meta name="description" content={brand.description} />
</svelte:head>

<div class="siteShell">
  <header class="topNav">
    <a class="brandMark" href="/">
      <img src={brand.avatarSmallUrl} alt="Codaro avatar" width="38" height="38" />
      <span>{brand.name}</span>
    </a>
    <nav class="navLinks" aria-label="Primary">
      {#each navItems as item}
        <a class:active={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))} class="navPill" href={item.href}>
          {item.label}
        </a>
      {/each}
    </nav>
  </header>
</div>

<slot />

<div class="siteShell">
  <footer class="footerBar">
    <div>Codaro public site. Built as a static Svelte surface for docs, blog, and search.</div>
  </footer>
</div>
