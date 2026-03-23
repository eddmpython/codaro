<script lang="ts">
  import {
    FileText,
    Printer,
    Columns2,
    Maximize2,
    Presentation,
    Download,
    Share2,
    Clock,
    CheckCircle2,
  } from "lucide-svelte";

  type ReportLayout = "full" | "two-column" | "presentation";

  interface Props {
    title?: string;
    lastRunAt?: string | null;
    taskName?: string | null;
  }

  let { title = "", lastRunAt = null, taskName = null }: Props = $props();

  let layout = $state<ReportLayout>("full");

  function handlePrint(): void {
    window.print();
  }

  function formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return iso;
    }
  }

  const layoutOptions: { key: ReportLayout; label: string; icon: typeof Maximize2 }[] = [
    { key: "full", label: "Full width", icon: Maximize2 },
    { key: "two-column", label: "Two columns", icon: Columns2 },
    { key: "presentation", label: "Presentation", icon: Presentation },
  ];
</script>

<div class="report-chrome" data-layout={layout}>
  <div class="report-header">
    <div class="report-left">
      <div class="report-badge">
        <FileText size={14} />
        <span>Report</span>
      </div>

      {#if taskName}
        <div class="report-task-info">
          <CheckCircle2 class="h-3 w-3" />
          <span>{taskName}</span>
        </div>
      {/if}

      {#if lastRunAt}
        <div class="report-time">
          <Clock class="h-3 w-3" />
          <span>{formatDate(lastRunAt)}</span>
        </div>
      {/if}
    </div>

    <div class="report-actions">
      <div class="layout-switcher">
        {#each layoutOptions as opt (opt.key)}
          {@const Icon = opt.icon}
          <button
            type="button"
            class="layout-btn"
            class:active={layout === opt.key}
            title={opt.label}
            onclick={() => { layout = opt.key; }}
          >
            <Icon class="h-3.5 w-3.5" />
          </button>
        {/each}
      </div>

      <button class="action-btn" onclick={handlePrint} title="Print">
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
    padding: 12px 24px 8px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 16px;
  }

  .report-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }

  .report-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
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

  .report-task-info {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--muted-foreground);
  }

  .report-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--muted-foreground);
  }

  .report-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .layout-switcher {
    display: flex;
    gap: 1px;
    padding: 2px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
  }

  .layout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .layout-btn:hover {
    color: var(--foreground);
  }

  .layout-btn.active {
    background: var(--background);
    color: var(--foreground);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }

  .action-btn {
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

  .action-btn:hover {
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

  @media (max-width: 640px) {
    .report-chrome {
      padding: 8px 12px 6px;
    }

    .report-title {
      font-size: 1.3rem;
    }

    .layout-switcher {
      display: none;
    }
  }
</style>
