<script lang="ts">
  import { Search } from "lucide-svelte";

  interface VariableEntry {
    name: string;
    type: string;
    value: string;
    declaredBy: string;
    usedBy: string[];
  }

  interface Props {
    variables?: VariableEntry[];
  }

  let { variables = [] }: Props = $props();

  let searchQuery = $state("");

  let filtered = $derived(
    variables.filter((v) => {
      if (!searchQuery) {
        return true;
      }
      const lower = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(lower) ||
        v.type.toLowerCase().includes(lower)
      );
    })
  );
</script>

<div class="variables-panel" data-testid="variables-panel">
  <div class="searchWrap">
    <Search class="h-3.5 w-3.5 text-muted-foreground" />
    <input
      bind:value={searchQuery}
      class="searchInput"
      placeholder="Search variables..."
    />
  </div>

  <div class="tableWrap">
    {#if filtered.length === 0}
      <p class="empty text-muted-foreground text-sm p-4">
        {searchQuery ? "No matching variables." : "No variables defined."}
      </p>
    {:else}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type / Value</th>
            <th>Declared / Used</th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as variable}
            <tr>
              <td class="varName">{variable.name}</td>
              <td>
                <span class="varType">{variable.type}</span>
                {#if variable.value}
                  <span class="varValue">{variable.value}</span>
                {/if}
              </td>
              <td>
                <span class="varDeclared">{variable.declaredBy}</span>
                {#if variable.usedBy.length > 0}
                  <span class="varUsed">{variable.usedBy.join(", ")}</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>

<style>
  .variables-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .searchWrap {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--border);
  }

  .searchInput {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 12px;
    outline: none;
    color: var(--foreground);
  }

  .tableWrap {
    flex: 1;
    overflow: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }

  th {
    position: sticky;
    top: 0;
    padding: 6px 10px;
    text-align: left;
    font-weight: 500;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
    background: var(--background);
    border-bottom: 1px solid var(--border);
  }

  td {
    padding: 6px 10px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }

  .varName {
    font-family: var(--monospace-font, monospace);
    font-weight: 500;
    color: var(--foreground);
  }

  .varType {
    font-family: var(--monospace-font, monospace);
    font-size: 11px;
    color: var(--muted-foreground);
    display: block;
  }

  .varValue {
    font-size: 11px;
    color: var(--muted-foreground);
    display: block;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .varDeclared {
    font-size: 11px;
    color: var(--foreground);
    display: block;
  }

  .varUsed {
    font-size: 10px;
    color: var(--muted-foreground);
    display: block;
  }
</style>
