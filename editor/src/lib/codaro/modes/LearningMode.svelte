<script lang="ts">
  import { BookOpen } from "lucide-svelte";
</script>

<div class="learning-mode-indicator">
  <BookOpen size={14} />
  <span>Learning mode active</span>
</div>

<style>
  .learning-mode-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    background: hsl(var(--accent) / 0.08);
    color: hsl(var(--accent));
    font-size: 12px;
    font-weight: 500;
  }
</style>
