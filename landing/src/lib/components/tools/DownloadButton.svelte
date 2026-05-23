<script>
  /**
   * @typedef {Object} Props
   * @property {Blob} blob
   * @property {string} filename
   * @property {string} [label]
   */

  /** @type {Props} */
  let { blob, filename, label = "Download" } = $props();

  let url = $derived(URL.createObjectURL(blob));

  $effect(() => {
    return () => URL.revokeObjectURL(url);
  });
</script>

<a class="downloadButton" href={url} download={filename}>
  <span aria-hidden="true">↓</span>
  {label} <span class="filename">— {filename}</span>
</a>

<style>
  .downloadButton {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-radius: var(--radius-sm);
    background: var(--brand-accent);
    color: var(--primary-foreground);
    font-weight: 600;
    text-decoration: none;
    box-shadow: 0 4px 14px rgba(249, 115, 22, 0.25);
    transition: all 0.2s ease;
    width: fit-content;
  }

  .downloadButton:hover {
    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.35);
    transform: translateY(-1px);
  }

  .filename {
    font-weight: 400;
    opacity: 0.9;
    font-size: 0.92rem;
  }
</style>
