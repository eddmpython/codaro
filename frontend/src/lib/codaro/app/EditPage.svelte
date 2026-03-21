<script lang="ts">
  import type { Snippet } from "svelte";
  import AppChrome from "../chrome/AppChrome.svelte";
  import AppContainer from "./AppContainer.svelte";
  import FilenameForm from "../header/FilenameForm.svelte";

  interface Props {
    connectionState: string;
    documentLocation: string;
    documentTitle?: string;
    hasPath: boolean;
    shellError?: string;
    engineName?: string;
    engineStatus?: string;
    errorCount?: number;
    warningCount?: number;
    issueCount?: number;
    queuedOrRunningCount?: number;
    panelTitle?: string;
    hideControls?: boolean;
    helperPanelContent?: Snippet;
    floatingControls?: Snippet;
    onExport?: () => void;
    onFeedback?: () => void;
    children: Snippet;
  }

  let {
    connectionState,
    documentLocation,
    documentTitle,
    hasPath,
    shellError = "",
    engineName = "none",
    engineStatus = "idle",
    errorCount = 0,
    warningCount = 0,
    issueCount = 0,
    queuedOrRunningCount = 0,
    panelTitle = "",
    hideControls = false,
    helperPanelContent,
    floatingControls,
    onExport,
    onFeedback,
    children
  }: Props = $props();
</script>

<AppChrome
  {connectionState}
  {engineName}
  {engineStatus}
  {errorCount}
  {warningCount}
  {issueCount}
  {queuedOrRunningCount}
  {panelTitle}
  {helperPanelContent}
  {onExport}
  {onFeedback}
>
  <AppContainer {connectionState}>
    <FilenameForm {documentLocation} {documentTitle} {hasPath} />

    {#if connectionState === "CLOSED" && shellError}
      <div class="font-mono text-center text-base text-(--red-11)">
        <p>{shellError}</p>
      </div>
    {/if}

    {@render children()}

    {#if !hideControls && floatingControls}
      {@render floatingControls()}
    {/if}
  </AppContainer>
</AppChrome>
