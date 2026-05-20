<script>
  import { base } from "$app/paths";
  import { brand } from "$lib/brand";
</script>

<div class="siteShell">
  <section class="mascotHero">
    <img
      class="mascotMain"
      src={brand.mascotUrl}
      alt="Codaro mascot"
      width="480"
      height="480"
    />
    <h1 class="mascotTitle">{brand.name}</h1>
    <p class="mascotTagline">{brand.tagline}</p>
    <div class="heroActions">
      <a class="primaryButton" href="{base}/docs/skills/ops/foundation/environment">
        Get started
      </a>
      <a class="ghostButton" href={brand.repoUrl}>
        GitHub
      </a>
    </div>
  </section>
</div>
