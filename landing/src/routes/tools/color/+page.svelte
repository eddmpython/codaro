<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import LabeledField from "$lib/components/tools/LabeledField.svelte";
  import KeyValueOutput from "$lib/components/tools/KeyValueOutput.svelte";

  const meta = findTool("color");

  let inputColor = $state("#fb923c");
  let bgColor = $state("#09090b");

  /** @type {{ ok: boolean; rgb: string; hex: string; hsl: string; ratio: number; pass: { aaSmall: boolean; aaLarge: boolean; aaaSmall: boolean; aaaLarge: boolean } | null; error: string | null }} */
  let info = $state({ ok: false, rgb: "", hex: "", hsl: "", ratio: 0, pass: null, error: null });

  $effect(() => {
    const fg = inputColor;
    const bg = bgColor;
    let cancelled = false;
    (async () => {
      try {
        const { parseColor, toHex, toRgbString, rgbToHsl, toHslString, contrastRatio, wcagPass } = await import(
          "$lib/tools/colorOps.js"
        );
        const fgRgb = parseColor(fg);
        const bgRgb = parseColor(bg);
        if (!fgRgb) {
          if (!cancelled) info = { ok: false, rgb: "", hex: "", hsl: "", ratio: 0, pass: null, error: `Cannot parse "${fg}". Try #fb923c, rgb(251,146,60), or hsl(...).` };
          return;
        }
        const hex = toHex(fgRgb);
        const rgb = toRgbString(fgRgb);
        const hsl = toHslString(rgbToHsl(fgRgb));
        let ratio = 0;
        let pass = null;
        if (bgRgb) {
          ratio = contrastRatio(fgRgb, bgRgb);
          pass = wcagPass(ratio);
        }
        if (!cancelled) info = { ok: true, hex, rgb, hsl, ratio, pass, error: null };
      } catch (err) {
        if (!cancelled) info = { ok: false, rgb: "", hex: "", hsl: "", ratio: 0, pass: null, error: err instanceof Error ? err.message : String(err) };
      }
    })();
    return () => { cancelled = true; };
  });

  const presets = [
    "#fb923c",
    "#ef4444",
    "#22c55e",
    "#3b82f6",
    "#a855f7",
    "#eab308",
    "#06b6d4",
    "#09090b",
    "#fafafa",
  ];

  let pairs = $derived(
    info.ok
      ? [
          { key: "HEX", value: info.hex, mono: true },
          { key: "RGB", value: info.rgb, mono: true },
          { key: "HSL", value: info.hsl, mono: true },
        ]
      : []
  );
</script>

<svelte:head>
  <title>Color converter — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "HEX/RGB/HSL converter and WCAG contrast checker."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/color" />
</svelte:head>

<ToolShell
  title="Color converter"
  description="Convert between HEX, RGB, and HSL formats. Check WCAG AA / AAA contrast against any background."
>
  <div class="splitRow">
    <div class="card">
      <LabeledField label="Foreground" hint="Any of: #fb923c, rgb(251,146,60), hsl(24, 96%, 61%)">
        <input class="textInput mono" bind:value={inputColor} spellcheck="false" autocomplete="off" />
      </LabeledField>
      <div class="presetRow">
        {#each presets as preset}
          <button
            type="button"
            class="presetSwatch"
            style="background: {preset}"
            onclick={() => (inputColor = preset)}
            aria-label={preset}
          ></button>
        {/each}
      </div>
    </div>

    <div class="card">
      <LabeledField label="Background (for contrast)">
        <input class="textInput mono" bind:value={bgColor} spellcheck="false" autocomplete="off" />
      </LabeledField>
      <div class="presetRow">
        {#each presets as preset}
          <button
            type="button"
            class="presetSwatch"
            style="background: {preset}"
            onclick={() => (bgColor = preset)}
            aria-label={preset}
          ></button>
        {/each}
      </div>
    </div>
  </div>

  {#if info.error}
    <p class="errorBox">{info.error}</p>
  {/if}

  {#if info.ok}
    <div class="previewCard" style="background: {bgColor}; color: {info.hex};">
      <div class="previewSwatch" style="background: {info.hex}"></div>
      <div>
        <div class="previewBig">Aa</div>
        <p class="previewLine">The quick brown fox jumps over the lazy dog.</p>
        <p class="previewSmall">Smaller body text for legibility checks.</p>
      </div>
    </div>

    <KeyValueOutput {pairs} caption="Foreground formats" />

    {#if info.pass}
      <section class="contrastCard">
        <header class="contrastHead">
          <h3>Contrast vs background</h3>
          <span class="ratio mono">{info.ratio.toFixed(2)} : 1</span>
        </header>
        <ul class="grades">
          <li class:pass={info.pass.aaLarge}>AA Large <span>{info.pass.aaLarge ? "✓ Pass" : "✗ Fail"}</span></li>
          <li class:pass={info.pass.aaSmall}>AA Normal <span>{info.pass.aaSmall ? "✓ Pass" : "✗ Fail"}</span></li>
          <li class:pass={info.pass.aaaLarge}>AAA Large <span>{info.pass.aaaLarge ? "✓ Pass" : "✗ Fail"}</span></li>
          <li class:pass={info.pass.aaaSmall}>AAA Normal <span>{info.pass.aaaSmall ? "✓ Pass" : "✗ Fail"}</span></li>
        </ul>
      </section>
    {/if}
  {/if}
</ToolShell>

<style>
  .splitRow {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 14px;
  }

  .card {
    display: grid;
    gap: 12px;
    padding: 16px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }

  .textInput {
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--text);
  }

  .textInput.mono {
    font-family: "Fira Mono", ui-monospace, monospace;
    font-size: 0.95rem;
  }

  .textInput:focus {
    outline: none;
    border-color: var(--brand-accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .presetRow {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .presetSwatch {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid var(--border-strong);
    cursor: pointer;
    padding: 0;
  }

  .previewCard {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 22px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .previewSwatch {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-sm);
    border: 1px solid rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
  }

  .previewBig {
    font-size: 2.4rem;
    font-weight: 700;
    line-height: 1;
  }

  .previewLine {
    margin: 4px 0 0;
    font-size: 1.05rem;
  }

  .previewSmall {
    margin: 4px 0 0;
    font-size: 0.85rem;
    opacity: 0.85;
  }

  .contrastCard {
    padding: 16px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }

  .contrastHead {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .contrastHead h3 {
    margin: 0;
    font-size: 0.82rem;
    color: var(--text-soft);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
  }

  .ratio {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text);
  }

  .grades {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
  }

  .grades li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--surface-muted);
    color: var(--text-muted);
    font-size: 0.85rem;
    border: 1px solid var(--border);
  }

  .grades li.pass {
    background: rgba(34, 197, 94, 0.1);
    color: #86efac;
    border-color: rgba(34, 197, 94, 0.25);
  }

  .grades li:not(.pass) {
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.2);
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

  .mono {
    font-family: "Fira Mono", ui-monospace, monospace;
  }
</style>
