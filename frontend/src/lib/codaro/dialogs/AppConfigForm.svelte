<script lang="ts">
  import { getAppConfig, setAppConfig, type AppConfig } from "../stores/config.svelte";

  let config = $derived(getAppConfig());
  let localWidth = $state<AppConfig["width"]>("normal");
  let localTitle = $state("");
  let localCss = $state("");
  let localHtml = $state("");
  let localSqlOutput = $state("auto");

  $effect(() => {
    const current = config;
    localWidth = current.width;
    localTitle = current.appTitle;
    localCss = current.cssFile;
    localHtml = current.htmlHeadFile;
    localSqlOutput = current.sqlOutput;
  });

  function handleChange() {
    setAppConfig({
      width: localWidth,
      appTitle: localTitle,
      cssFile: localCss,
      htmlHeadFile: localHtml,
      sqlOutput: localSqlOutput
    });
  }
</script>

<div class="flex flex-col gap-2">
  <h3 class="font-semibold text-lg">Notebook Settings</h3>
  <p class="text-sm text-muted-foreground mb-4">
    Configure how your notebook or application looks and behaves.
  </p>

  <div class="grid grid-cols-2 gap-x-8 gap-y-4">
    <div class="col-span-2">
      <h4 class="text-base font-semibold mb-1">Display</h4>
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium" for="app-width-select">Width</label>
      <select
        id="app-width-select"
        data-testid="app-width-select"
        class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
        bind:value={localWidth}
        oninput={handleChange}
      >
        <option value="compact">Compact</option>
        <option value="medium">Medium</option>
        <option value="normal">Normal</option>
        <option value="full">Full</option>
      </select>
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium" for="app-title-input">App title</label>
      <input
        id="app-title-input"
        class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        bind:value={localTitle}
        oninput={handleChange}
        placeholder="Untitled"
      />
    </div>

    <div class="col-span-2">
      <h4 class="text-base font-semibold mb-1">Custom Files</h4>
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium" for="css-file-input">Custom CSS</label>
      <input
        id="css-file-input"
        class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        bind:value={localCss}
        oninput={handleChange}
        placeholder="custom.css"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium" for="html-head-input">HTML Head</label>
      <input
        id="html-head-input"
        class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        bind:value={localHtml}
        oninput={handleChange}
        placeholder="head.html"
      />
    </div>

    <div class="col-span-2">
      <h4 class="text-base font-semibold mb-1">Data</h4>
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium" for="sql-output-select">SQL Output Type</label>
      <select
        id="sql-output-select"
        data-testid="sql-output-select"
        class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
        bind:value={localSqlOutput}
        oninput={handleChange}
      >
        <option value="auto">Auto</option>
        <option value="dataframe">Dataframe</option>
        <option value="table">Table</option>
      </select>
    </div>
  </div>
</div>
