<script lang="ts">
  interface Props {
    width?: string;
    height?: string;
    rounded?: string;
  }

  let {
    width = "100%",
    height = "16px",
    rounded = "6px",
  }: Props = $props();
</script>

<div
  class="skeleton"
  style="width: {width}; height: {height}; border-radius: {rounded};"
></div>

<style>
  .skeleton {
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--foreground) 5%, transparent) 25%,
      color-mix(in srgb, var(--foreground) 10%, transparent) 50%,
      color-mix(in srgb, var(--foreground) 5%, transparent) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
