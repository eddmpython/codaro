<script>
  /**
   * @typedef {Object} Props
   * @property {number} [value] - 0..1, omit for indeterminate
   * @property {string} [label]
   */

  /** @type {Props} */
  let { value, label } = $props();

  let pct = $derived(value === undefined ? null : Math.max(0, Math.min(1, value)) * 100);
</script>

<div class="progressWrap" role="status" aria-live="polite">
  {#if label}<div class="label">{label}</div>{/if}
  <div class="track" class:indeterminate={pct === null}>
    {#if pct !== null}
      <div class="fill" style="width: {pct}%"></div>
    {:else}
      <div class="bar"></div>
    {/if}
  </div>
</div>

<style>
  .progressWrap {
    display: grid;
    gap: 6px;
  }

  .label {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .track {
    position: relative;
    height: 6px;
    border-radius: 999px;
    background: var(--surface-muted);
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background: var(--brand-accent);
    transition: width 0.2s ease;
    border-radius: 999px;
  }

  .indeterminate .bar {
    position: absolute;
    inset: 0;
    width: 30%;
    background: var(--brand-accent);
    border-radius: 999px;
    animation: slide 1.2s ease-in-out infinite;
  }

  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }
</style>
