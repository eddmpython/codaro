<script lang="ts">
  interface Props {
    label?: string;
  }

  let { label = "static-panel" }: Props = $props();
</script>

<div data-testid={label}>{label}</div>
