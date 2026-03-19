<script lang="ts">
  import DataFrameTable from "./DataFrameTable.svelte";
  import LayoutRenderer from "./LayoutRenderer.svelte";
  import { normalizeOutput } from "../outputAdapter";

  interface Props {
    result?: unknown;
  }

  let { result = null }: Props = $props();

  function isStructuredDescriptor(value: unknown): boolean {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return false;
    }
    const record = value as Record<string, unknown>;
    const type = record.type || record.kind;
    return typeof type === "string" && [
      "accordion",
      "callout",
      "column",
      "hstack",
      "html",
      "markdown",
      "plain",
      "sidebar",
      "stack",
      "stat",
      "tabs",
      "text",
      "ui",
      "vstack",
      "row"
    ].includes(type);
  }

  function imageSource(value: string): string {
    if (!value) {
      return "";
    }
    if (value.startsWith("data:")) {
      return value;
    }
    return `data:image/png;base64,${value}`;
  }

  let output = $derived(normalizeOutput(result));
  let payload = $derived(
    result && typeof result === "object" && "data" in (result as Record<string, unknown>)
      ? (result as Record<string, unknown>).data
      : null
  );
</script>

{#if output.type !== "empty" || output.stdout || output.stderr}
  <div class="output">
    {#if output.stdout}
      <pre class="stdout">{output.stdout}</pre>
    {/if}

    {#if output.type === "error"}
      <pre class="marimo-error">{output.stderr || output.text}</pre>
    {:else if output.type === "html"}
      <div class="htmlOutput">{@html output.html}</div>
    {:else if output.type === "image"}
      <div class="media">
        <img class="imageOutput" src={imageSource(output.image)} alt="Cell output" />
      </div>
    {:else if output.type === "dataframe" && output.dataframe}
      <DataFrameTable dataframe={output.dataframe} />
    {:else if isStructuredDescriptor(payload)}
      <LayoutRenderer value={payload} />
    {:else if output.text}
      <pre class="return">{output.text}</pre>
    {/if}

    {#if output.stderr && output.type !== "error"}
      <pre class="stderr">{output.stderr}</pre>
    {/if}
  </div>
{/if}

<style>
  .output {
    display: block;
  }

  .return,
  .stderr,
  .stdout,
  .marimo-error {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .htmlOutput {
    overflow-x: auto;
  }

  .media {
    width: 100%;
  }

  .imageOutput {
    max-width: 100%;
  }
</style>
