<script lang="ts">
  import { Cog } from "lucide-svelte";
</script>

<div class="automation-mode-indicator">
  <Cog size={14} />
  <span>Automation</span>
</div>

<style>
  .automation-mode-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    background: hsl(25 95% 53% / 0.08);
    color: hsl(25 95% 53%);
    font-size: 12px;
    font-weight: 500;
  }
</style>
