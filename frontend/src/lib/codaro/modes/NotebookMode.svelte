<script lang="ts">
  import { Code } from "lucide-svelte";
</script>

<div class="notebook-mode-indicator">
  <Code size={14} />
  <span>Notebook</span>
</div>

<style>
  .notebook-mode-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    background: hsl(var(--muted));
    color: hsl(var(--muted-foreground));
    font-size: 12px;
    font-weight: 500;
  }
</style>
