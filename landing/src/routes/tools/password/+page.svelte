<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import CodeBlock from "$lib/components/tools/CodeBlock.svelte";
  import CopyButton from "$lib/components/tools/CopyButton.svelte";
  import DownloadButton from "$lib/components/tools/DownloadButton.svelte";

  const meta = findTool("password");

  let length = $state(20);
  let lower = $state(true);
  let upper = $state(true);
  let digits = $state(true);
  let symbols = $state(true);
  let excludeAmbiguous = $state(true);
  let count = $state(1);

  /** @type {string[]} */
  let passwords = $state([]);
  let entropy = $state(0);
  /** @type {{ label: string; color: string }} */
  let strength = $state({ label: "—", color: "weak" });
  let error = $state(/** @type {string | null} */ (null));

  async function generate() {
    const { generatePassword, passwordEntropyBits, strengthLabel } = await import("$lib/tools/password.js");
    const opts = {
      length: Math.max(4, Math.min(256, Math.floor(Number(length) || 4))),
      lower,
      upper,
      digits,
      symbols,
      excludeAmbiguous,
    };
    const safeCount = Math.max(1, Math.min(500, Math.floor(Number(count) || 1)));
    try {
      /** @type {string[]} */
      const arr = [];
      for (let i = 0; i < safeCount; i++) arr.push(generatePassword(opts));
      passwords = arr;
      entropy = passwordEntropyBits(opts);
      strength = strengthLabel(entropy);
      error = null;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      passwords = [];
    }
  }

  $effect(() => {
    void length;
    void lower;
    void upper;
    void digits;
    void symbols;
    void excludeAmbiguous;
    void count;
    generate();
  });

  let joined = $derived(passwords.join("\n"));
  let downloadBlob = $derived.by(() => {
    if (!joined) return null;
    return new Blob([joined], { type: "text/plain;charset=utf-8" });
  });
</script>

<svelte:head>
  <title>Password generator — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "Generate strong passwords in your browser."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/password" />
</svelte:head>

<ToolShell
  title="Password generator"
  description="Cryptographically random passwords using crypto.getRandomValues. Pick character classes, length, and how many to generate at once."
>
  <div class="optionRow">
    <label class="lengthLabel">
      <span>Length: <strong>{length}</strong></span>
      <input type="range" min="6" max="64" bind:value={length} />
    </label>

    <div class="checkRow">
      <label class="check"><input type="checkbox" bind:checked={lower} /> a-z</label>
      <label class="check"><input type="checkbox" bind:checked={upper} /> A-Z</label>
      <label class="check"><input type="checkbox" bind:checked={digits} /> 0-9</label>
      <label class="check"><input type="checkbox" bind:checked={symbols} /> !@#$</label>
      <label class="check"><input type="checkbox" bind:checked={excludeAmbiguous} /> Skip 0OoIl1</label>
    </div>

    <div class="countRow">
      <label class="count">
        Count
        <input type="number" min="1" max="500" bind:value={count} />
      </label>
      <button class="primaryButton" type="button" onclick={generate}>Regenerate</button>
    </div>
  </div>

  {#if error}
    <p class="errorBox">{error}</p>
  {/if}

  <div class="strengthRow">
    <span class="strengthBadge {strength.color}">{strength.label}</span>
    <span class="entropyText">≈ {entropy.toFixed(1)} bits of entropy</span>
  </div>

  <div class="resultHead">
    <span class="resultMeta">{passwords.length.toLocaleString()} password{passwords.length === 1 ? "" : "s"}</span>
    <div class="rightActions">
      <CopyButton value={joined} label="Copy all" />
      {#if downloadBlob && passwords.length > 1}
        <DownloadButton blob={downloadBlob} filename="passwords.txt" label="Download" />
      {/if}
    </div>
  </div>

  <CodeBlock value={joined} showLineNumbers={passwords.length > 1 && passwords.length <= 200} />
</ToolShell>

<style>
  .optionRow {
    display: grid;
    gap: 14px;
    padding: 16px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }

  .lengthLabel {
    display: flex;
    align-items: center;
    gap: 14px;
    color: var(--text-muted);
    font-size: 0.88rem;
  }

  .lengthLabel input[type="range"] {
    flex: 1;
    accent-color: var(--brand-accent);
  }

  .checkRow {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
  }

  .check {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--text-muted);
    font-size: 0.88rem;
    font-family: "Fira Mono", ui-monospace, monospace;
    cursor: pointer;
  }

  .check input {
    accent-color: var(--brand-accent);
  }

  .countRow {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .count {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--text-muted);
    font-size: 0.88rem;
  }

  .count input {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--text);
    width: 90px;
    font-family: "Fira Mono", ui-monospace, monospace;
  }

  .strengthRow {
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }

  .strengthBadge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 600;
  }

  .strengthBadge.weak {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
  }
  .strengthBadge.fair {
    background: rgba(251, 146, 60, 0.15);
    color: #fdba74;
  }
  .strengthBadge.strong {
    background: rgba(34, 197, 94, 0.15);
    color: #86efac;
  }
  .strengthBadge.excellent {
    background: rgba(168, 85, 247, 0.15);
    color: #d8b4fe;
  }

  .entropyText {
    color: var(--text-soft);
    font-size: 0.82rem;
  }

  .resultHead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .resultMeta {
    color: var(--text-soft);
    font-size: 0.85rem;
  }

  .rightActions {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .errorBox {
    margin: 0;
    padding: 12px 14px;
    border: 1px solid #ef4444;
    background: rgba(239, 68, 68, 0.08);
    color: #fca5a5;
    border-radius: var(--radius-sm);
    font-size: 0.88rem;
  }
</style>
