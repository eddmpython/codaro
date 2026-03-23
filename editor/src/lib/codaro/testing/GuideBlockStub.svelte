<script lang="ts">
  interface CheckResult {
    passed: boolean;
    feedback: string;
  }

  interface Props {
    content: string;
    guide: Record<string, unknown> | null;
    onSubmit?: (answer: string) => void;
    checkResult?: CheckResult | null;
  }

  let { content, guide, onSubmit, checkResult = null }: Props = $props();
</script>

<div data-testid="guide-block-stub">{String(guide?.description ?? content)}</div>

<button type="button" data-testid="guide-block-submit" onclick={() => onSubmit?.("student answer")}>
  submit
</button>

{#if checkResult}
  <div data-testid="guide-block-result">{checkResult.feedback}</div>
{/if}
