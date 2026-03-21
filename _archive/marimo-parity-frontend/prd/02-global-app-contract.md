[Back to PRD Index](../PRD.md)

# 4. Global App Contract

[Resume from Summary](./10-summary-acceptance-and-copy-plan.md#121-current-state)

Installed asset evidence for this file:

- `.venv/Lib/site-packages/marimo/_static/index.html`
- `./assets/index-CV-Vv3LK.js`
- `./assets/edit-page-CTVRcSta.js`
- `./assets/context-aware-panel-DScGcWey.js`
- `./assets/index-CVpJvEAO.css`

#### 4.1 Head, Hidden Mount Tags, and Portal

Source:

Installed assets:

- `.venv/Lib/site-packages/marimo/_static/index.html`
- `./assets/index-CV-Vv3LK.js`

Readable source:

- `.__marimo_upstream/frontend/index.html`

`index.html` requires these tags:

- `<meta charset="utf-8">`
- `<meta name="viewport" content="width=device-width, initial-scale=1">`
- `<meta name="theme-color" content="#000000">`
- `<meta name="description" content="a marimo app">`
- `<link rel="icon" href="./favicon.ico">`
- `<link rel="apple-touch-icon" href="./apple-touch-icon.png">`
- `<link rel="manifest" href="./manifest.json">`

Required preloads:

- `./assets/gradient-yHQUC_QB.png`
- `./assets/noise-60BoTA8O.png`
- `./assets/Lora-VariableFont_wght-B2ootaw-.ttf`
- `./assets/PTSans-Regular-CxL0S8W7.ttf`
- `./assets/PTSans-Bold-D9fedIX3.ttf`
- `./assets/FiraMono-Regular-BTCkDNvf.ttf`
- `./assets/FiraMono-Medium-DU3aDxX5.ttf`
- `./assets/FiraMono-Bold-CLVRCuM9.ttf`

Required hidden mount tags:

- `<marimo-filename hidden>`
- `<marimo-version data-version hidden>`
- `<marimo-user-config data-config hidden>`
- `<marimo-server-token data-token hidden>`

Required mount script:

- `window.__MARIMO_MOUNT_CONFIG__`

Portal contract:

- `#portal[data-testid="glide-portal"]`
- inline style:
  - `position: fixed`
  - `left: 0`
  - `top: 0`
  - `z-index: 9999`

Global CSS contract:

- `html { font-size: 90% }`
- `@media screen and (height>=1000px) { html { font-size: 100% } }`
- `:root { --content-width: 740px; --content-width-medium: 1110px }`
- `#App { z-index: 1; flex: 1; margin: auto; position: relative }`
- `.disconnected-gradient`
  - `background-image: url(./gradient-yHQUC_QB.png)`
  - `background-repeat: no-repeat`
  - `background-size: cover`
- `.noise`
  - `background-image: url(./noise-60BoTA8O.png)`
  - `background-repeat: repeat`
  - `opacity: .5`

#### 4.2 Root DOM Hierarchy

Source:

Installed assets:

- `.venv/Lib/site-packages/marimo/_static/index.html`
- `./assets/index-CV-Vv3LK.js`
- `./assets/edit-page-CTVRcSta.js`

Readable source:

- `.__marimo_upstream/frontend/index.html`
- `.__marimo_upstream/frontend/src/components/pages/edit-page.tsx`
- `.__marimo_upstream/frontend/src/core/edit-app.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.tsx`

`experiments/marimo-layout.dom.html` fixes the root shell:

```text
body.light.light-theme[data-theme="light"]
  marimo-filename
  marimo-version
  marimo-user-config
  marimo-server-token
  #root
    .contents[style="--marimo-code-editor-font-size: 0.875rem;"]
      .flex.flex-col.flex-1.overflow-hidden.absolute.inset-0.print:relative
        left chrome rail
        #app-chrome-sidebar[data-testid="helper"]
        #app-chrome-body
          #app
            .noise
            .disconnected-gradient
            #App
              filename bar
              notebook body
              floating action stack
              footer
        #app-chrome-panel[data-testid="panel"]
    #portal[data-testid="glide-portal"]
```

`#App` root class contract:

- `mathjax_ignore disconnected bg-background w-full h-full text-textColor flex flex-col overflow-y-auto overflow-x-hidden print:height-fit`

#### 4.2.1 Top-Level Render Branches

Source:

Installed assets:

- `./assets/index-CV-Vv3LK.js`
- `./assets/edit-page-CTVRcSta.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/pages/edit-page.tsx`
- `.__marimo_upstream/frontend/src/core/edit-app.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.tsx`

Chrome visibility branch:

- local gate:
  - `new URL(window.location.href).searchParams.get(KnownQueryParams.showChrome) === "false"`
- lazy command palette component:
  - `LazyCommandPalette`
- notebook page component:
  - `EditApp`

`showChrome=false` branch:

- notebook page renders as:
  - `<EditApp hideControls={true} {...props} />`
- command palette remains mounted in parallel:
  - `<LazyCommandPalette />`
- fragment child order:
  - `EditApp`
  - `LazyCommandPalette`

Default chrome branch:

- notebook page renders as:
  - `<EditApp {...props} />`
- chrome wrapper:
  - `AppChrome`
- command palette is a child of AppChrome, sibling of EditApp:
  - `<LazyCommandPalette />`
- child order inside AppChrome:
  - `EditApp`
  - `LazyCommandPalette`
- hideChrome branch child order (fragment):
  - `EditApp hideControls={true}`
  - `LazyCommandPalette`

#### 4.2.2 EditApp Composition

Source:

Installed assets:

- `./assets/index-CV-Vv3LK.js`
- `./assets/edit-page-CTVRcSta.js`

Readable source:

- `.__marimo_upstream/frontend/src/core/edit-app.tsx`
- `.__marimo_upstream/frontend/src/components/editor/app-container.tsx`
- `.__marimo_upstream/frontend/src/components/editor/header/app-header.tsx`
- `.__marimo_upstream/frontend/src/components/editor/renderers/cells-renderer.tsx`

`EditApp` top-level structure (fragment):

```text
<>
  AppContainer
    AppHeader (children: FilenameForm when editing)
    CellsRenderer (when hasCells) or NotStartedConnectionAlert (when !hasCells)
  MultiCellActionToolbar
  if !hideControls:
    TooltipProvider
      Controls
</>
```

- `AppContainer` receives `connection`, `isRunning`, `width` props
- `AppHeader` class: `pt-4 sm:pt-12 pb-2 mb-4 print:hidden z-50 sticky left-0`
- `CellsRenderer` receives `appConfig`, `mode`, children as `editableCellsArray`

`AppContainer` shell order (inside the component):

- `DynamicFavicon`
- `StatusOverlay`
- `PyodideLoader`
  - `WrappedWithSidebar`
    - `div#App` (receives {children} from EditApp — i.e. AppHeader + CellsRenderer)

`DynamicFavicon` side-effect contract:

- source:
  - `.__marimo_upstream/frontend/src/components/editor/dynamic-favicon.tsx`
- this component renders no visible DOM
- head behavior:
  - ensures `link[rel~='icon']` exists
  - idle favicon `./favicon.ico`
  - running favicon `circle-play.ico`
  - success favicon `circle-check.ico`
  - error favicon `circle-x.ico`
- update branch:
  - while running -> set favicon to `running`
  - when run completes -> `success` if `errors.length === 0`, else `error`
  - when the document has focus, reset back to idle after 3 seconds
  - when window refocuses and notebook is not running, reset to idle immediately
- background notification branch:
  - only when visibility is hidden and a run transitions from running -> idle
  - success title `Execution completed`
  - success body `Your notebook run completed successfully.`
  - failure title `Execution failed`
  - failure body ``Your notebook run encountered ${numErrors} error(s).``

`PyodideLoader` contract:

- source:
  - `.__marimo_upstream/frontend/src/core/wasm/PyodideLoader.tsx`
  - `.__marimo_upstream/frontend/src/components/icons/large-spinner.tsx`
- non-WASM branch:
  - returns `children` directly
- WASM branch:
  - waits on `PyodideBridge.INSTANCE.initialized.promise`
  - reads `hasAnyOutputAtom`
- spinner branch:
  - returns `WasmSpinner`
  - when async initialization is pending
  - or when all are true:
    - `!hasOutput`
    - `getInitialAppMode() === "read"`
    - `isCodeHidden() === true`
- error branch:
  - rethrows async error to the nearest error boundary
- `isCodeHidden()` returns true when either:
  - query param `showCode=false`
  - `showCodeInRunModeAtom` is false
- `WasmSpinner` primitive:
  - `LargeSpinner title={wasmInitialization}`
- `LargeSpinner` shell:
  - wrapper `div.flex.flex-col.h-full.flex-1.items-center.justify-center.p-4`
  - icon `Loader2Icon`
    - `data-testid="large-spinner"`
    - `className="size-20 animate-spin text-primary"`
    - `strokeWidth={1}`
  - title wrapper:
    - `mt-2 text-muted-foreground font-semibold text-lg transition-opacity duration-300`
    - opacity branch:
      - visible -> `opacity-100`
      - hidden -> `opacity-0`
  - title-change animation:
    - hides current text
    - waits 300ms
    - swaps title and fades back in

`AppContainer` root `#App` data and class contract:

- `id: "App"`
- `data-config-width: width`
- `data-connection-state: connection.state`
- class composition:
  - `mathjax_ignore`
  - adds `disconnected` when `isAppClosed(connection.state)`
  - `bg-background w-full h-full text-textColor`
  - `flex flex-col overflow-y-auto`
  - adds `config-width-full` when `width === "full"`
  - adds `overflow-x-auto` when `width === "columns"`
  - otherwise `overflow-x-hidden`
  - `print:height-fit`

`StatusOverlay` contract inside `AppContainer`:

- source:
  - `.__marimo_upstream/frontend/src/components/editor/header/status.tsx`
- top-left wrapper class:
  - `z-50 top-4 left-4`
- positioning branch:
  - `mode === "read"` -> `fixed`
  - otherwise -> `absolute`
- background noise branch:
  - renders `NoiseBackground` only when `connection.state === WebSocketState.CLOSED && !connection.canTakeover`
  - child order:
    - `div.noise`
    - `div.disconnected-gradient`
- shared status wrapper token:
  - `print:hidden pointer-events-auto hover:cursor-pointer`
- running branch:
  - gate `connection.state === WebSocketState.OPEN && isRunning`
  - tooltip `Jump to running cell`
  - tooltip side `right`
  - root `data-testid="loading-indicator"`
  - click path `notebookScrollToRunning`
  - icon `HourglassIcon className="running-app-icon" size={30} strokeWidth={1}`
- disconnected branch:
  - gate `connection.state === WebSocketState.CLOSED && !connection.canTakeover`
  - tooltip `App disconnected`
  - icon `UnlinkIcon className="w-[25px] h-[25px] text-(--red-11)"`
- locked branch:
  - gate `connection.state === WebSocketState.CLOSED && connection.canTakeover`
  - tooltip `Notebook locked`
  - icon `LockIcon className="w-[25px] h-[25px] text-(--blue-11)"`

`WrappedWithSidebar` contract:

- source:
  - `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/sidebar/wrapped-with-sidebar.tsx`
  - `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/sidebar/sidebar.tsx`
  - `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/sidebar/sheet-sidebar.tsx`
  - `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/sidebar/toggle.tsx`
  - `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/sidebar/sidebar-slot.tsx`
  - `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/sidebar/state.ts`
  - `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/sidebar/sidebar.css`
- slot gate:
  - `useSlot(SlotNames.SIDEBAR)`
  - when `elements.length === 0`, returns `children` directly
- state atom:
  - `sidebarAtom`
  - default `{ isOpen: true }`
  - actions:
    - `toggle`
    - `setWidth`
- width helpers:
  - closed width constant `68px`
  - default open width `288px`
  - `normalizeWidth(width)` appends `px` to numeric strings
- wrapped root when slots exist:
  - `div.inset-0.absolute.flex`
- desktop sidebar:
  - `aside`
  - `data-expanded={isOpen}`
  - inline width `isOpen ? openWidth : CLOSED_WIDTH`
  - class `app-sidebar auto-collapse-nav top-0 left-0 z-20 h-full hidden lg:block relative transition-[width] ease-in-out duration-300`
  - children:
    - `SidebarToggle`
    - inner slot wrapper `div.relative.h-full.flex.flex-col.px-3.pb-16.pt-14.overflow-y-auto.shadow-sm.border-l`
- `SidebarToggle` shell:
  - wrapper `div.invisible.lg:visible.absolute.top-[12px].right-[16px].z-20`
  - button `Button variant="ghost" size="icon" className="w-10 h-8"`
  - icon `ChevronLeft`
  - icon class `h-5 w-5 transition-transform ease-in-out duration-700`
  - rotation branch:
    - open -> `rotate-0`
    - closed -> `rotate-180`
- `SidebarSlot` primitive:
  - `Slot name={SlotNames.SIDEBAR}`
  - component export is `memo(...)`
- mobile menu anchor:
  - wrapper `div.absolute.top-3.left-4.flex.items-center.z-50`
  - child `SheetMenu openWidth={openWidth}`
- `SheetMenu` contract:
  - `Sheet`
  - `SheetTrigger className="lg:hidden" asChild={true}`
  - trigger button `Button variant="ghost" className="bg-background"`
  - trigger icon `MenuIcon className="w-5 h-5"`
  - `SheetContent side="left"`
  - class `w-full px-3 h-full flex flex-col overflow-y-auto`
  - inline style `maxWidth: openWidth`
  - body `SidebarSlot`
- sidebar CSS contract:
  - `.app-sidebar`
    - `container-type: inline-size`
    - `container-name: app-sidebar`
  - `.app-sidebar .markdown`
    - `display: block`
    - `@apply px-5`
  - `@container app-sidebar (max-width: 230px)` when collapsed:
    - `.app-sidebar[data-expanded="false"] .markdown { display: none }`

`AppHeader` contract inside `AppContainer`:

- class from `EditApp`:
  - `pt-4 sm:pt-12 pb-2 mb-4 print:hidden z-50 sticky left-0`
- render order:
  - `children`
  - disconnected banner when `connection.state === WebSocketState.CLOSED`
- child branch when `viewState.mode === "edit"`:
  - `div.flex.items-center.justify-center.container`
    - `FilenameForm`
- `FilenameForm` source contract:
  - `FilenameInput`
  - `placeholderText = filename ? Paths.basename(filename) : "untitled marimo notebook"`
  - `initialValue = filename`
  - `flexibleWidth = true`
  - `resetOnBlur = true`
  - `data-testid = "filename-input"`
  - class branch:
    - unnamed -> `missing-filename`
    - named -> `filename`
- filename rename path:
  - `updateFilename(newFilename)`
  - when the notebook was previously unnamed and the returned name is not null:
    - `saveNotebook(name, true)`
- disconnected add-on branch:
  - `Disconnected`
  - props:
    - `reason: connection.reason`
    - `canTakeover: connection.canTakeover`

`Disconnected` component contract:

- source:
  - `.__marimo_upstream/frontend/src/components/editor/Disconnected.tsx`
- takeover handler:
  - posts to ``/kernel/takeover?${searchParams.toString()}`` via `API.post`
  - success path `reloadSafe()`
  - failure toast:
    - title `Failed to take over session`
    - description `prettyError(error)`
    - variant `danger`
- `canTakeover === true` branch:
  - outer wrapper `div.flex.justify-center`
  - `Banner kind="info" className="mt-10 flex flex-col rounded p-3 max-w-[800px] mx-4"`
  - title row `div.flex.justify-between`
  - title shell `span.font-bold.text-xl.flex.items-center.mb-2`
  - title text `Notebook already connected`
  - body row `div.flex.justify-between.items-end.text-base.gap-20`
  - reason text rendered directly
  - takeover button:
    - `data-testid="takeover-button"`
    - `variant="outline"`
    - `className="shrink-0"`
    - icon `ArrowRightSquareIcon className="w-4 h-4 mr-2"`
    - label `Take over session`
- `canTakeover === false` branch:
  - wrapper `div.font-mono.text-center.text-base.text-(--red-11)`
  - only child `p` with `reason`

Notebook body branch inside `AppContainer`:

- when `hasCells`:
  - `CellsRenderer`
    - child `CellArray`
- when `!hasCells`:
  - `NotStartedConnectionAlert`

`CellsRenderer` branch contract:

- when `mode === "edit"` and kiosk mode is false:
  - returns `children` directly
- otherwise:
  - resolves `finalLayout` from `selectedLayout`
  - in `read` mode, `KnownQueryParams.viewAs` can override layout when included in `OVERRIDABLE_LAYOUT_TYPES`
  - finds the plugin in `cellRendererPlugins`
  - if no plugin exists, returns `children`
  - otherwise renders `plugin.Component` with:
    - `appConfig`
    - `mode`
    - `cells: flattenTopLevelNotebookCells(useNotebook())`
    - `layout: layoutData[finalLayout] || plugin.getInitialLayout(cells)`
    - `setLayout: setCurrentLayoutData`

Floating controls gate from `EditApp`:

- controls mount only when `hideControls === false`
- `Controls` props:
  - `presenting: viewState.mode === "present"`
  - `onTogglePresenting: togglePresenting`
  - `onInterrupt: sendInterrupt`
  - `onRun: runStaleCells`
  - `connectionState: connection.state`
  - `running: notebookIsRunningAtom`
  - `appConfig`

Kiosk visibility helpers:

- source:
  - `.__marimo_upstream/frontend/src/components/editor/kiosk-mode.tsx`
- `HideInKioskMode`
  - reads `kioskModeAtom`
  - returns `null` when kiosk mode is true
  - otherwise returns `children`
- `ShowInKioskMode`
  - reads `kioskModeAtom`
  - returns `children` only when kiosk mode is true
  - otherwise returns `null`

#### 4.2.3 AppChrome Wrapper and Context-Aware Panel

Source:

Installed assets:

- `./assets/edit-page-CTVRcSta.js`
- `./assets/panels-BfLG6GHU.js`
- `./assets/context-aware-panel-DScGcWey.js`
- `./assets/panels-B4E3DsXP.css`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/panels.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/context-aware-panel/context-aware-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/context-aware-panel/atoms.ts`

`PanelsWrapper` contract:

- root wrapper:
  - `div`
  - `className: "flex flex-col flex-1 overflow-hidden absolute inset-0 print:relative"`

`AppChrome` top-level child order inside `PanelsWrapper`:

- `PanelGroup autoSaveId="marimo:chrome:v1:l2" direction="horizontal"`
  - `TooltipProvider -> Sidebar`
  - helper sidebar panel
  - `Panel#app-chrome-body`
    - `PanelGroup autoSaveId="marimo:chrome:v1:l1" direction="vertical"`
      - app body panel
      - developer bottom panel
  - `ContextAwarePanel`
- `PendingAICells`
- `ErrorBoundary -> TooltipProvider -> Footer`

Context-aware panel state atoms:

- `contextAwarePanelOwner`
  - `atom<string | null>(null)`
- `contextAwarePanelType`
  - `atom<"row-viewer" | "column-explorer" | null>(null)`
- `contextAwarePanelOpen`
  - `atom<boolean>(false)`
- `isPinnedAtom`
  - `atom<boolean>(false)`
- `isCellAwareAtom`
  - `atom<boolean>(false)`

`ContextAwarePanel` render gate:

- returns `null` when any of these hold:
  - `slots.length === 0`
  - `owner === null`
  - `isPanelOpen === false`
- slot source:
  - `useSlot(SlotNames.CONTEXT_AWARE_PANEL)`

Context-aware panel body:

- body wrapper:
  - `div.mt-2.pb-7.mb-4.h-full.overflow-auto`
- top row:
  - `div.flex.flex-row.justify-between.items-center.mx-2`
- mode-toggle cluster:
  - `div.flex.flex-row.items-center.gap-3`
- close button:
  - `Button variant="linkDestructive" size="icon" aria-label="Close selection panel"`
  - icon `XIcon className="w-4 h-4"`
  - click path:
    - `setOwner(null)`
    - `setIsPanelOpen(false)`
- slotted content:
  - `ErrorBoundary -> Slot name={SlotNames.CONTEXT_AWARE_PANEL}`

Panel mode toggles:

- pin toggle:
  - `Toggle size="xs"`
  - tooltip copy:
    - pinned -> `Unpin panel`
    - unpinned -> `Pin panel`
  - aria-label matches the tooltip copy
  - icon branch:
    - pinned -> `PinIcon className="w-4 h-4"`
    - unpinned -> `PinOffIcon className="w-4 h-4"`
- cell-aware toggle:
  - `Toggle size="xs"`
  - aria-label:
    - cell-aware -> `Follow focused cell`
    - fixed -> `Fixed`
  - icon:
    - `CrosshairIcon className="w-4 h-4"`
    - adds `text-primary` when `isCellAware`
  - tooltip rich-copy branch:
    - cell-aware:
      - title `Follow focused table`
      - subcopy `The panel updates as cells that output tables are focused. Click to fix to the current cell.`
    - fixed:
      - title `Focus on current table`
      - subcopy `The panel is focused on the current table. Click to update based on which cell is focused.`

Pinned vs overlay branch:

- when `isPinned === false`
  - returns `ResizableComponent`
- when `isPinned === true`
  - prepends `PanelResizeHandle`
    - `className: "resize-handle border-border z-20 print:hidden border-l"`
    - `onDragging={handleDragging}`
  - then renders `Panel defaultSize={20} minSize={15} maxSize={80}`

Overlay `ResizableComponent` contract:

- uses `useResizeHandle`
  - `startingWidth: 400`
  - `minWidth: 300`
  - `maxWidth: 1500`
  - `onResize -> raf2(() => window.dispatchEvent(new Event("resize")))`
- outer shell:
  - `div.absolute.z-40.right-0.h-full.bg-background.flex.flex-row`
- left drag handle:
  - `div.w-1.h-full.cursor-col-resize.border-l`
- content container:
  - `div` with `ref={resizableDivRef}` and inline `style`

#### 4.3 Utility Token Resolution

Source:

Installed assets:

- `./assets/index-CVpJvEAO.css`

Readable source:

- `.__marimo_upstream/frontend/src/css/app/App.css`
- `.__marimo_upstream/frontend/src/css/globals.css`

These utility tokens are fixed by `index-CVpJvEAO.css`.

- `.rounded-md`
  - `border-radius: calc(var(--radius) - 2px)`
- `.rounded`
  - `border-radius: .25rem`
- `.border`
  - `border-style: var(--tw-border-style)`
  - `border-width: 1px`
- `.text-xs`
  - `font-size: var(--text-xs, .75rem)`
  - `line-height: var(--text-xs--line-height, 1.33333)`
- `.text-sm`
  - `font-size: var(--text-sm, .875rem)`
  - `line-height: var(--text-sm--line-height, 1.42857)`
- `.right-5`
  - `right: calc(var(--spacing, .25rem) * 5)`
- `.right-3`
  - `right: calc(var(--spacing, .25rem) * 3)`
- `.top-1`
  - `top: calc(var(--spacing, .25rem) * 1)`
- `.top-2`
  - `top: calc(var(--spacing, .25rem) * 2)`
- `.gap-1`
  - `gap: calc(var(--spacing, .25rem) * 1)`
- `.gap-2`
  - `gap: calc(var(--spacing, .25rem) * 2)`
- `.px-1`
  - `padding-inline: calc(var(--spacing, .25rem) * 1)`
- `.px-3`
  - `padding-inline: calc(var(--spacing, .25rem) * 3)`
- `.py-2`
  - `padding-block: calc(var(--spacing, .25rem) * 2)`
- `.p-2`
  - `padding: calc(var(--spacing, .25rem) * 2)`
- `.h-7`
  - `height: calc(var(--spacing, .25rem) * 7)`
- `.h-8`
  - `height: calc(var(--spacing, .25rem) * 8)`
- `.w-2`
  - `width: calc(var(--spacing, .25rem) * 2)`
- `.m-0`
  - `margin: 0`
- `.opacity-80`
  - `opacity: .8`
- `.leading-none`
  - `line-height: 1`
- `.items-center`
  - `align-items: center`
- `.justify-center`
  - `justify-content: center`
- `.pointer-events-auto`
  - `pointer-events: auto`
- `.z-30`
  - `z-index: 30`
- `.sticky`
  - `position: sticky`
- `.shadow-xs-solid`
  - `--tw-shadow: 1px 1px 0px 0px var(--tw-shadow-color, var(--base-shadow-darker)), 0px 0px 2px 0px var(--tw-shadow-color, #80808033)`
- `.container`
  - breakpoint `max-width` branches remain active and must not be flattened away

