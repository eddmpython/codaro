<script>
  /**
   * @typedef {Object} Props
   * @property {string | (() => string)} value
   * @property {string} [label]
   * @property {"chip" | "ghost" | "primary"} [variant]
   * @property {string} [ariaLabel]
   */

  /** @type {Props} */
  let { value, label = "Copy", variant = "chip", ariaLabel } = $props();

  let copied = $state(false);
  /** @type {ReturnType<typeof setTimeout> | null} */
  let timer = null;

  async function onCopy() {
    const text = typeof value === "function" ? value() : value;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        copied = false;
        timer = null;
      }, 1400);
    } catch (err) {
      console.warn("Clipboard write failed", err);
    }
  }
</script>

<button
  type="button"
  class="copyBtn {variant}"
  class:copied
  onclick={onCopy}
  aria-label={ariaLabel ?? label}
>
  <span class="icon" aria-hidden="true">{copied ? "✓" : "⧉"}</span>
  <span class="label">{copied ? "Copied" : label}</span>
</button>

<style>
  .copyBtn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-muted);
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .copyBtn:hover {
    color: var(--text);
    border-color: var(--border-strong);
  }

  .copyBtn.copied {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  .copyBtn.ghost {
    border-color: transparent;
    background: transparent;
  }

  .copyBtn.ghost:hover {
    background: var(--surface-muted);
  }

  .copyBtn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
  }

  .copyBtn.primary:hover {
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  .icon {
    font-size: 0.95em;
    line-height: 1;
  }
</style>
