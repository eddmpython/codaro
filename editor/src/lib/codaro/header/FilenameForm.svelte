<script lang="ts">
  interface Props {
    documentLocation: string;
    documentTitle?: string;
    hasPath: boolean;
  }

  let {
    documentLocation,
    documentTitle = "untitled notebook",
    hasPath,
  }: Props = $props();

  const inputClass =
    "filename w-full h-9 my-1 px-4 py-1 rounded-md bg-transparent font-mono text-[13px] text-fg/75 placeholder:text-fg-muted outline-none transition-[background,box-shadow,color] duration-quick ease-standard hover:bg-surface-2/60 focus-visible:bg-surface-2 focus-visible:text-fg focus-visible:ring-1 focus-visible:ring-accent-ring/60 disabled:cursor-not-allowed disabled:opacity-50";
</script>

<div class="pt-4 sm:pt-8 pb-2 mb-4 print:hidden z-50 sticky left-0">
  <div class="flex items-center justify-center container">
    <div
      tabindex="-1"
      class="flex h-full w-full flex-col overflow-hidden rounded-md text-fg bg-transparent group filename-input"
      id="filename-input"
      data-testid="filename-input"
      cmdk-root=""
    >
      <label
        cmdk-label=""
        for="codaro-filename-input"
        id="codaro-filename-label"
        class="sr-only"
      >Filename</label>
      <div
        class="max-h-[300px] overflow-y-auto overflow-x-hidden"
        cmdk-list=""
        role="listbox"
        tabindex="-1"
        aria-label="Suggestions"
        id="codaro-filename-list"
        style="--cmdk-list-height: 40px;"
      >
        <div cmdk-list-sizer="">
          <div>
            <div class="flex items-center justify-center px-1" cmdk-input-wrapper="">
              <input
                class="{inputClass} {hasPath ? 'filename' : 'missing-filename'}"
                data-testid="dir-completion-input"
                tabindex="-1"
                spellcheck="false"
                placeholder={documentTitle}
                autocomplete="off"
                cmdk-input=""
                autocorrect="off"
                aria-autocomplete="list"
                role="combobox"
                aria-expanded="true"
                aria-controls="codaro-filename-list"
                aria-labelledby="codaro-filename-label"
                id="codaro-filename-input"
                type="text"
                readonly
                value={documentLocation}
                style="max-width: 1000px;"
              />
            </div>
            <div class="codaro" style="display: contents;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
