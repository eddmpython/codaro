<script>
  let { title, description, children } = $props();
</script>

<section class="toolHero">
  <span class="privacyChip" title="All processing happens locally in your browser">
    <span class="lock" aria-hidden="true">●</span>
    Your files never leave your browser
  </span>
  <h1>{title}</h1>
  {#if description}
    <p class="toolDescription">{description}</p>
  {/if}
</section>

<section class="toolBody">
  {@render children()}
</section>

<style>
  .toolHero {
    display: grid;
    gap: 12px;
    padding: 24px 0 12px;
  }

  .toolHero h1 {
    margin: 0;
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    line-height: 1.1;
    letter-spacing: -0.01em;
  }

  .toolDescription {
    margin: 0;
    max-width: 720px;
    color: var(--text-muted);
    line-height: 1.6;
  }

  .privacyChip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    width: fit-content;
    border-radius: 999px;
    background: var(--accent-soft);
    color: var(--brand-accent);
    border: 1px solid color-mix(in srgb, var(--brand-accent) 30%, transparent);
    font-size: 0.78rem;
    font-weight: 500;
  }

  .lock {
    color: var(--brand-accent);
    font-size: 0.5rem;
  }

  .toolBody {
    display: grid;
    gap: 20px;
    padding: 16px 0 56px;
  }
</style>
