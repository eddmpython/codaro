<script lang="ts">
  import { FileText, Printer } from "lucide-svelte";

  interface Props {
    title?: string;
  }

  let { title = "" }: Props = $props();

  function handlePrint() {
    window.print();
  }
</script>

<div class="report-chrome">
  <div class="report-header">
    <div class="report-badge">
      <FileText size={14} />
      <span>Report view</span>
    </div>
    <div class="report-actions">
      <button class="print-btn" onclick={handlePrint} title="Print">
        <Printer size={14} />
      </button>
    </div>
  </div>
  {#if title}
    <h1 class="report-title">{title}</h1>
  {/if}
</div>

<style>
  .report-chrome {
    padding: 16px 24px 8px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 16px;
  }

  .report-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .report-badge {
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

  .report-actions {
    display: flex;
    gap: 4px;
  }

  .print-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--foreground);
    cursor: pointer;
  }

  .print-btn:hover {
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
  }

  .report-title {
    font-family: "Lora", serif;
    font-size: 1.8rem;
    font-weight: 700;
    margin: 16px 0 8px;
    letter-spacing: -0.02em;
  }

  @media print {
    .report-chrome {
      display: none;
    }
  }
</style>
