<script lang="ts">
  import {
    BookOpen,
    Code2,
    FileBarChart,
    Cpu,
  } from "lucide-svelte";
  import type { Component } from "svelte";
  import {
    getActiveMode,
    setActiveMode,
    type AppMode,
  } from "../modes/modeStore.svelte";
  import { setSelectedPanel } from "../stores/panels.svelte";

  interface ModeOption {
    key: AppMode;
    label: string;
    icon: Component<{ class?: string }>;
  }

  const modes: ModeOption[] = [
    { key: "notebook", label: "Code", icon: Code2 },
    { key: "learning", label: "Learn", icon: BookOpen },
    { key: "automation", label: "Automate", icon: Cpu },
    { key: "report", label: "Report", icon: FileBarChart },
  ];

  let active = $derived(getActiveMode());

  function select(mode: AppMode) {
    setActiveMode(mode);
    if (mode === "learning") {
      setSelectedPanel("curriculum");
    }
  }
</script>

<div class="mode-switcher" role="tablist" aria-label="Editor mode">
  {#each modes as mode (mode.key)}
    {@const Icon = mode.icon}
    {@const selected = active === mode.key}
    <button
      type="button"
      role="tab"
      class="mode-btn"
      class:active={selected}
      aria-selected={selected}
      title={mode.label}
      onclick={() => select(mode.key)}
    >
      <Icon class="h-3.5 w-3.5" />
      <span class="mode-label">{mode.label}</span>
    </button>
  {/each}
</div>

<style>
  .mode-switcher {
    display: flex;
    align-items: center;
    gap: 1px;
    padding: 2px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
  }

  .mode-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.1s;
    white-space: nowrap;
  }

  .mode-btn:hover {
    color: var(--foreground);
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
  }

  .mode-btn.active {
    color: var(--foreground);
    background: var(--background);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 640px) {
    .mode-label {
      display: none;
    }
  }
</style>
