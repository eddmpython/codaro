<script lang="ts">
  import {
    FolderTree,
    Variable,
    Bot,
    GraduationCap,
    Settings2,
  } from "lucide-svelte";
  import type { Component } from "svelte";
  import {
    getSelectedPanel,
    setSelectedPanel,
    type SidebarPanel,
  } from "../stores/panels.svelte";

  interface TabItem {
    key: SidebarPanel;
    label: string;
    icon: Component<{ class?: string }>;
  }

  const tabs: TabItem[] = [
    { key: "files", label: "Files", icon: FolderTree },
    { key: "variables", label: "Vars", icon: Variable },
    { key: "ai", label: "AI", icon: Bot },
    { key: "curriculum", label: "Learn", icon: GraduationCap },
  ];

  let selected = $derived(getSelectedPanel());

  function handleTap(key: SidebarPanel): void {
    setSelectedPanel(key);
  }
</script>

<nav class="codaro-mobile-bottom-bar" aria-label="Mobile navigation">
  {#each tabs as tab (tab.key)}
    {@const Icon = tab.icon}
    {@const active = selected === tab.key}
    <button
      type="button"
      class:active
      onclick={() => handleTap(tab.key)}
      aria-label={tab.label}
    >
      <Icon class="h-5 w-5" />
      <span>{tab.label}</span>
    </button>
  {/each}
</nav>
