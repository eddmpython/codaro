<script>
  import { Copy, Check, ChevronDown, ChevronUp } from "lucide-svelte";

  export let output = "";
  export let isError = false;
  export let multiDefVars = [];

  let collapsed = false;
  let copied = false;

  function isHtmlOutput(value) {
    return value && value.startsWith("__HTML__");
  }

  function getHtml(value) {
    return value.slice("__HTML__".length);
  }

  function copyOutput() {
    const text = isHtmlOutput(output) ? getHtml(output) : output;
    navigator.clipboard.writeText(text);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

{#if multiDefVars.length > 0 || output}
  <div class="outputPanel" class:error={isError} class:collapsed>
    {#if output}
      <div class="outputToolbar">
        <button
          class="outputAction"
          onclick={copyOutput}
          title={copied ? "Copied" : "Copy output"}
          aria-label="Copy output"
        >
          {#if copied}
            <Check size={11} />
          {:else}
            <Copy size={11} />
          {/if}
        </button>
        <button
          class="outputAction"
          onclick={() => (collapsed = !collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
          aria-label={collapsed ? "Expand output" : "Collapse output"}
        >
          {#if collapsed}
            <ChevronDown size={11} />
          {:else}
            <ChevronUp size={11} />
          {/if}
        </button>
      </div>
    {/if}

    {#if !collapsed}
      {#if multiDefVars.length > 0}
        <div class="multiDefBanner">
          <span class="multiDefIcon">!</span>
          <span>Multiple definitions: <strong>{multiDefVars.join(", ")}</strong></span>
        </div>
      {/if}

      {#if output}
        <div class="outputContent">
          {#if isHtmlOutput(output)}
            <div class="outputHtml">{@html getHtml(output)}</div>
          {:else}
            <pre class="outputPre">{output}</pre>
          {/if}
        </div>
      {/if}
    {:else}
      <div class="collapsedHint">Output collapsed</div>
    {/if}
  </div>
{/if}

<style>
  .outputPanel {
    border-top: 1px solid var(--nb-border);
    padding: 10px 14px;
    position: relative;
    transition: padding var(--nb-transition-fast);
  }

  .outputPanel.error {
    background: var(--nb-error-soft);
  }

  .outputPanel.collapsed {
    padding: 6px 14px;
  }

  .outputToolbar {
    position: absolute;
    top: 6px;
    right: 8px;
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity var(--nb-transition-fast);
    z-index: 2;
  }

  .outputPanel:hover .outputToolbar {
    opacity: 1;
  }

  .outputAction {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: var(--nb-radius-sm);
    background: var(--nb-card);
    border: 1px solid var(--nb-border);
    color: var(--nb-text-muted);
    cursor: pointer;
    transition: all var(--nb-transition-fast);
  }

  .outputAction:hover {
    border-color: var(--nb-border-strong);
    color: var(--nb-text);
  }

  .multiDefBanner {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 6px 10px;
    margin-bottom: 8px;
    background: var(--nb-warning-soft);
    border: 1px solid rgba(234, 179, 8, 0.25);
    border-radius: var(--nb-radius-sm);
    font-size: 12px;
    color: var(--nb-text-secondary);
    line-height: 1.5;
  }

  .multiDefIcon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--nb-warning);
    color: white;
    font-size: 10px;
    font-weight: 700;
    margin-top: 1px;
  }

  .outputContent {
    max-height: 400px;
    overflow-y: auto;
  }

  .outputPre {
    margin: 0;
    font-family: var(--nb-font-code);
    font-size: 13px;
    line-height: 1.5;
    color: var(--nb-text);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .error .outputPre {
    color: var(--nb-error);
  }

  .outputHtml {
    overflow-x: auto;
  }

  .collapsedHint {
    font-size: 11px;
    color: var(--nb-text-muted);
    font-family: var(--nb-font-code);
  }
</style>
