<script lang="ts">
  import { marked } from "marked";
  import LayoutRendererSelf from "./LayoutRenderer.svelte";
  import WidgetRenderer from "./WidgetRenderer.svelte";

  interface Props {
    value?: unknown;
  }

  let { value = null }: Props = $props();

  let activeTab = $state(0);
  let openAccordion: number[] = $state([]);

  function descriptorType(payload: unknown): string {
    if (!payload || typeof payload !== "object") {
      return "plain";
    }
    const record = payload as Record<string, unknown>;
    if (typeof record.type === "string") {
      return record.type;
    }
    if (typeof record.kind === "string") {
      return record.kind;
    }
    return "plain";
  }

  function getItems(payload: unknown): Record<string, unknown>[] {
    if (!payload || typeof payload !== "object") {
      return [];
    }
    const record = payload as Record<string, unknown>;
    const itemsValue = record.items || record.children || record.tabs || record.sections;
    return Array.isArray(itemsValue) ? (itemsValue as Record<string, unknown>[]) : [];
  }

  function getRecord(payload: unknown): Record<string, unknown> {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return {};
    }
    return payload as Record<string, unknown>;
  }

  function getLabel(payload: Record<string, unknown>, fallback: string): string {
    const candidate = payload.label || payload.title || payload.name;
    return typeof candidate === "string" && candidate ? candidate : fallback;
  }

  function getContent(payload: Record<string, unknown>): unknown {
    if ("content" in payload) {
      return payload.content;
    }
    if ("value" in payload) {
      return payload.value;
    }
    if ("body" in payload) {
      return payload.body;
    }
    return payload;
  }

  function currentRecord(): Record<string, unknown> {
    return getRecord(value);
  }

  function currentTitle(): string {
    const record = currentRecord();
    return typeof record.title === "string" ? record.title : "";
  }

  function currentContentHtml(): string {
    const record = currentRecord();
    if ("content" in record) {
      return String(record.content ?? "");
    }
    return "";
  }

  function fallbackMarkdown(): string {
    const record = currentRecord();
    const source = "content" in record ? record.content : JSON.stringify(value, null, 2);
    return String(marked.parse(String(source ?? "")));
  }

  function calloutKind(): string {
    const record = currentRecord();
    return typeof record.kind === "string" ? record.kind : "neutral";
  }

  function stackStyle(direction: "row" | "column"): string {
    const record = currentRecord();
    const gap = typeof record.gap === "number" ? record.gap : 0.5;
    const justifyMap: Record<string, string> = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      "space-between": "space-between",
      "space-around": "space-around"
    };
    const alignMap: Record<string, string> = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      stretch: "stretch"
    };
    const justifyValue = typeof record.justify === "string" ? justifyMap[record.justify] || record.justify : direction === "row" ? "space-between" : "flex-start";
    const alignValue = typeof record.align === "string" ? alignMap[record.align] || record.align : "stretch";
    const wrap = direction === "row" && Boolean(record.wrap) ? "wrap" : "nowrap";
    return `display:flex;flex-direction:${direction};gap:${gap}rem;justify-content:${justifyValue};align-items:${alignValue};flex-wrap:${wrap};`;
  }

  function itemStyle(index: number): string {
    const record = currentRecord();
    const weights = (record.widths || record.heights) as unknown;
    if (!Array.isArray(weights) || typeof weights[index] !== "number") {
      return "";
    }
    return `flex:${weights[index]};min-width:0;min-height:0;`;
  }

  function currentTabIndex(): number {
    const record = currentRecord();
    const selected = typeof record.value === "string" ? record.value : "";
    const foundIndex = items.findIndex((item) => getLabel(item, "") === selected);
    return foundIndex >= 0 ? foundIndex : 0;
  }

  function multipleAccordion(): boolean {
    return Boolean(currentRecord().multiple);
  }

  function sidebarStyle(): string {
    const record = currentRecord();
    return typeof record.width === "string" && record.width ? `width:${record.width};` : "";
  }

  function toggleAccordion(index: number): void {
    if (openAccordion.includes(index)) {
      openAccordion = openAccordion.filter((entry) => entry !== index);
      return;
    }
    if (multipleAccordion()) {
      openAccordion = [...openAccordion, index];
      return;
    }
    openAccordion = [index];
  }

  let type = $derived(descriptorType(value));
  let items = $derived(getItems(value));

  $effect(() => {
    if (type === "tabs" && (activeTab < 0 || activeTab >= items.length)) {
      activeTab = currentTabIndex();
    }
  });
</script>

{#if value == null}
  <div class="plain"></div>
{:else if typeof value === "string"}
  <div class="plain markdown">{@html String(marked.parse(value))}</div>
{:else if Array.isArray(value)}
  <div class="stack vertical">
    {#each value as item}
      <LayoutRendererSelf value={item} />
    {/each}
  </div>
{:else if type === "markdown"}
  <div class="plain markdown">{@html String(marked.parse(currentContentHtml()))}</div>
{:else if type === "text" || type === "plain"}
  <div class="plain textual">{currentContentHtml()}</div>
{:else if type === "vstack" || type === "stack" || type === "column"}
  <div class="stack vertical" style={stackStyle("column")}>
    {#each items as item, index}
      <div class="stackItem" style={itemStyle(index)}>
        <LayoutRendererSelf value={getContent(item)} />
      </div>
    {/each}
  </div>
{:else if type === "hstack" || type === "row"}
  <div class="stack horizontal" style={stackStyle("row")}>
    {#each items as item, index}
      <div class="stackItem" style={itemStyle(index)}>
        <LayoutRendererSelf value={getContent(item)} />
      </div>
    {/each}
  </div>
{:else if type === "callout"}
  <section class={`callout kind-${calloutKind()}`}>
    {#if currentTitle()}
      <h4>{currentTitle()}</h4>
    {/if}
    <div class="calloutBody">
      <LayoutRendererSelf value={getContent(currentRecord())} />
    </div>
  </section>
{:else if type === "tabs"}
  <section class="tabs">
    <div class="tabList">
      {#each items as item, index}
        <button class:active={index === activeTab} onclick={() => (activeTab = index)}>
          {getLabel(item, `Tab ${index + 1}`)}
        </button>
      {/each}
    </div>
    {#if items[activeTab]}
      <div class="tabPanel">
        <LayoutRendererSelf value={getContent(items[activeTab])} />
      </div>
    {/if}
  </section>
{:else if type === "accordion"}
  <section class="accordion">
    {#each items as item, index}
      <div class="accordionItem">
        <button class="accordionButton" onclick={() => toggleAccordion(index)}>
          <span>{getLabel(item, `Section ${index + 1}`)}</span>
          <span>{openAccordion.includes(index) ? "−" : "+"}</span>
        </button>
        {#if openAccordion.includes(index)}
          <div class="accordionPanel">
            <LayoutRendererSelf value={getContent(item)} />
          </div>
        {/if}
      </div>
    {/each}
  </section>
{:else if type === "sidebar"}
  <section class="sidebarLayout">
    <aside style={sidebarStyle()}>
      <LayoutRendererSelf value={currentRecord().content} />
      {#if currentRecord().footer}
        <div class="sidebarFooter">
          <LayoutRendererSelf value={currentRecord().footer} />
        </div>
      {/if}
    </aside>
    <div>
      <div class="sidebarHint">Sidebar output</div>
    </div>
  </section>
{:else if type === "stat"}
  <section class={`stat kind-${calloutKind()}`}>
    <div class="statLabel">{String(currentRecord().label ?? "")}</div>
    <div class="statValue">{String(currentRecord().value ?? "")}</div>
    {#if currentRecord().caption}
      <div class="statCaption">{String(currentRecord().caption)}</div>
    {/if}
  </section>
{:else if type === "ui"}
  <WidgetRenderer value={currentRecord()} />
{:else if type === "html"}
  <div class="plain">{@html currentContentHtml()}</div>
{:else}
  <div class="plain markdown">{@html fallbackMarkdown()}</div>
{/if}

<style>
  .stack {
    display: grid;
    gap: 12px;
  }

  .vertical {
    grid-template-columns: 1fr;
  }

  .horizontal {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .stackItem {
    min-width: 0;
  }

  .plain {
    color: var(--cd-text);
  }

  .textual {
    white-space: pre-wrap;
    font: 12.5px/1.6 var(--cd-font-code);
  }

  .markdown :global(p),
  .markdown :global(ul),
  .markdown :global(ol) {
    margin: 0 0 10px;
    color: var(--cd-text-muted);
  }

  .callout,
  .stat,
  .tabPanel,
  .accordionItem,
  .sidebarLayout > aside,
  .sidebarLayout > div {
    padding: 14px;
    border: 1px solid var(--cd-border);
    border-radius: var(--cd-radius-md);
    background: var(--cd-card);
  }

  .callout h4 {
    margin: 0 0 8px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .kind-neutral {
    border-left: 3px solid var(--cd-border-strong);
  }

  .kind-info {
    border-left: 3px solid #2563eb;
  }

  .kind-success {
    border-left: 3px solid #15803d;
  }

  .kind-warn {
    border-left: 3px solid #b45309;
  }

  .kind-danger {
    border-left: 3px solid #b91c1c;
  }

  .tabs {
    display: grid;
    gap: 10px;
  }

  .tabList {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tabList button,
  .accordionButton {
    padding: 8px 12px;
    border: 1px solid var(--cd-border);
    border-radius: var(--cd-radius-pill);
    background: var(--cd-card);
    color: var(--cd-text-muted);
    cursor: pointer;
  }

  .tabList button.active {
    border-color: var(--cd-border-strong);
    color: var(--cd-text);
    background: var(--cd-surface);
  }

  .accordion {
    display: grid;
    gap: 8px;
  }

  .accordionButton {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .accordionPanel {
    padding-top: 12px;
  }

  .sidebarLayout {
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(180px, 240px) 1fr;
  }

  .sidebarFooter {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--cd-border);
  }

  .sidebarHint,
  .statLabel,
  .statCaption {
    color: var(--cd-text-muted);
  }

  .sidebarHint {
    font-size: 12px;
  }

  .stat {
    display: grid;
    gap: 6px;
  }

  .statLabel {
    font: 11px/1.4 var(--cd-font-code);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .statValue {
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    line-height: 1;
    letter-spacing: -0.05em;
    color: var(--cd-text);
  }

  .statCaption {
    font-size: 13px;
  }

  @media (max-width: 900px) {
    .sidebarLayout {
      grid-template-columns: 1fr;
    }
  }
</style>
