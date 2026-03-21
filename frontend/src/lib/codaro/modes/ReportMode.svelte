<script lang="ts">
  import { FileText } from "lucide-svelte";
</script>

<div class="report-mode-indicator">
  <FileText size={14} />
  <span>Report view</span>
</div>

<style>
  .report-mode-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    background: hsl(142 76% 36% / 0.08);
    color: hsl(142 76% 36%);
    font-size: 12px;
    font-weight: 500;
  }
</style>
