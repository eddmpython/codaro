<script lang="ts">
  import { marked } from "marked";

  interface Props {
    value?: string;
    active?: boolean;
    readOnly?: boolean;
    onChange?: (nextValue: string) => void;
  }

  let {
    value = "",
    active = false,
    readOnly = false,
    onChange = () => {}
  }: Props = $props();

  let renderedHtml = $derived(String(marked.parse(value || "")));
</script>

<div class="preview markdown mo-markdown-renderer" role="document">
  {#if value.trim()}
    {@html renderedHtml}
  {:else}
    <p class="text-muted-foreground italic">Write markdown</p>
  {/if}
</div>

<style>
  .preview {
    min-height: 24px;
    padding: 0 16px 18px 16px;
  }
</style>
