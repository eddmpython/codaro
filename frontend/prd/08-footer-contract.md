[Back to PRD Index](../PRD.md)

# 10. Footer Contract

[Resume from Summary](./10-summary-acceptance-and-copy-plan.md#121-current-state)

#### 10.0 Footer Item Primitive

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-item.tsx`

Primitive name:

- `FooterItem`

Base class:

- `h-full flex items-center p-2 text-sm shadow-inset font-mono cursor-pointer rounded`

Root element contract:

- component is `forwardRef`
- root element is `div`
- root spreads the remaining props directly onto that `div`

State classes:

- unselected adds:
  - `hover:bg-(--sage-3)`
- selected adds:
  - `bg-(--sage-4)`

Tooltip contract:

- wrapper exists only when `tooltip` prop is present
- tooltip side:
  - `top`
- tooltip delay:
  - `200`

#### 10.1 Footer Shell

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-item.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/runtime-settings.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/ai-status.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/backend-status.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/copilot-status.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/rtc-status.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/machine-stats.tsx`

Footer class:

- `h-10 py-1 gap-1 bg-background flex items-center text-muted-foreground text-md pl-2 pr-1 border-t border-border select-none print:hidden text-sm z-50 hide-on-fullscreen overflow-x-auto overflow-y-hidden scrollbar-thin`

Footer composition:

- developer panel toggle
- runtime reactivity dropdown
- middle spacer `mx-auto`
- optional kernel health button
- `ShowInKioskMode` kiosk label branch
- right cluster

Exact child order from `footer.tsx`:

- developer panel toggle `FooterItem`
- `RuntimeSettings`
- `div.mx-auto`
- `ConnectingKernelIndicatorItem`
- kiosk label tooltip block
- right cluster `div.flex.items-center.shrink-0.min-w-0`

Keyboard shortcuts registered in footer shell:

- `global.toggleTerminal`
- `global.togglePanel`
- `global.toggleMinimap`

Issue-count derivation:

- `errorsInSidebar = panelLayout.sidebar.includes("errors")`
- `hasConnectionIssue = connectionStatus === "unhealthy" || connectionStatus === "disconnected"`
- `issueCount = (errorsInSidebar ? 0 : errorCount) + (hasConnectionIssue ? 1 : 0)`
- `warningCount` is currently constant `0`

Connecting-kernel gate:

- `ConnectingKernelIndicatorItem` reads:
  - `isConnectingAtom`
- render branch:
  - returns `null` when `isConnecting` is false
  - otherwise returns `BackendConnectionStatus`

#### 10.2 Footer Developer Panel Button

Required testid:

- `data-testid="footer-panel"`

Tooltip text:

- `Toggle developer panel`
- includes shortcut render from `global.togglePanel`

Visual shell:

- wrapper:
  - `h-full`
- inner content:
  - `flex items-center gap-1 h-full`

Inner content contract from `footer.tsx`:

- first icon:
  - `XCircleIcon`
  - class `w-4 h-4 ${count > 0 ? "text-destructive" : ""}`
- first count:
  - `span`
  - value is the computed `issueCount`
  - formula:
    - `(errorsInSidebar ? 0 : errorCount) + (hasConnectionIssue ? 1 : 0)`
- second icon:
  - `AlertTriangleIcon`
  - class `` `w-4 h-4 ml-1 ${warningCount > 0 ? "text-yellow-500" : ""}` ``
- second count:
  - constant `0`

#### 10.3 Footer Runtime Settings

Required testid:

- `data-testid="footer-runtime-settings"`

Trigger shell:

- footer item shell with tooltip `Runtime reactivity`
- popover root:
  - `DropdownMenu`
- trigger wrapper:
  - `DropdownMenuTrigger`
  - `asChild: true`
- icon branch:
  - muted icon when runtime is effectively lazy
  - amber icon otherwise
- effective-lazy predicate:
  - `!runtime.auto_instantiate && runtime.on_cell_change === "lazy" && (isWasm() || runtime.auto_reload !== "autorun")`
- trigger inner wrapper:
  - `flex items-center gap-1`
- muted icon:
  - `ZapOffIcon`
  - `size: 16`
  - `className: "text-muted-foreground"`
- amber icon:
  - `ZapIcon`
  - `size: 16`
  - `className: "text-amber-500"`
- chevron icon:
  - `ChevronDownIcon`
  - `size: 14`

Popover contract:

- `className: "w-64"`
- `align: "start"`
- content primitive:
  - `DropdownMenuContent`
- child order:
  - header block
  - divider
  - `TooltipProvider` wrapping the runtime setting rows and separators

Header:

- wrapper:
  - `DropdownMenuLabel`
  - child `div.flex.items-center.justify-between.w-full`
- title:
  - `Runtime reactivity`
- docs link:
  - `https://links.marimo.app/runtime-configuration`
- docs label:
  - `Docs`
- docs label class:
  - `text-xs font-normal flex items-center gap-1`
- docs icon:
  - `ExternalLinkIcon`
  - `className: "w-3 h-3"`
- divider primitive:
  - `DropdownMenuSeparator`

Setting rows:

- `runtime.auto_instantiate`
  - row name `runtime.auto_instantiate`
  - title `On startup`
  - subtitle `autorun` or `lazy`
  - switch size `sm`
  - leading icon row:
    - `flex items-center space-x-2`
  - title shell:
    - `text-sm font-medium flex items-center gap-1`
  - row wrapper:
    - `flex items-center justify-between px-2 py-2`
  - tooltip:
    - `Whether to automatically run the notebook on startup`
- `runtime.on_cell_change`
  - row name `runtime.on_cell_change`
  - title `On cell change`
  - subtitle `autorun` or `lazy`
  - switch size `sm`
  - leading icon row:
    - `flex items-center space-x-2`
  - title shell:
    - `text-sm font-medium flex items-center gap-1`
  - row wrapper:
    - `flex items-center justify-between px-2 py-2`
  - tooltip:
    - `Whether to automatically run dependent cells after running a cell`
- `runtime.auto_reload`
  - row name `runtime.auto_reload`
  - hidden when `isWasm()` is true
  - title `On module change`
  - subtitle `off`, `lazy`, or `autorun`
  - outer wrapper:
    - `px-2 py-1`
  - heading row:
    - `flex items-center space-x-2 mb-2`
  - title shell:
    - `text-sm font-medium flex items-center gap-1`
  - option list wrapper:
    - `space-y-1`
  - option list button class:
    - `w-full flex items-center px-2 py-1 text-sm rounded hover:bg-accent`
  - selected row adds:
    - `bg-accent`
  - selected option trailing mark:
    - `span.ml-auto`
    - text `✓`
  - tooltip:
    - `Whether to run affected cells, mark them as stale, or do nothing when an external module is updated`
  - save path:
    - `saveUserConfig({ config: { runtime: { auto_reload: option } } })`
  - local merge path:
    - `setUserConfig(prev => ({ ...prev, runtime: { ...prev.runtime, auto_reload: option } }))`

#### 10.4 Footer Middle and Right Cluster

Kiosk label:

- wrapper:
  - `ShowInKioskMode`
- text:
  - `kiosk mode`
- tooltip:
  - `Kiosk mode is enabled. This allows you to view the outputs of the cells without the ability to edit them.`

Right cluster wrapper:

- `flex items-center shrink-0 min-w-0`

Exact right-cluster child order from `footer.tsx`:

- `MachineStats`
- `AIStatusIcon`
- `CopilotStatusIcon`
- `RTCStatus`

Usage stats cluster:

- wrapper:
  - `flex gap-2 items-center px-1`
- polls every `10s` while visible
- refetch state tick:
  - `setNonce((nonce) => nonce + 1)`
- fetch gate:
  - returns `null` when `isWasm()` is true
  - returns `null` when kernel connection state is not `WebSocketState.OPEN`
- shows GPU, memory, and CPU micro-widgets

Shared usage bar primitive:

- wrapper class:
  - `h-3 w-20 bg-(--slate-4) rounded-lg overflow-hidden border`
- fill width:
  - ``style.width = `${percent}%` ``
- every usage widget tooltip uses:
  - `Tooltip`
  - `delayDuration: 200`

GPU widget:

- only renders when `gpu.length > 0`
- testid:
  - `data-testid="gpu-bar"`
- icon:
  - `MicrochipIcon`
  - `className: "w-4 h-4"`
- displayed percent is:
  - `Math.round(sum(gpu.memory.percent) / gpu.length)`
- fill color:
  - `bg-(--grass-9)`
- tooltip wrapper:
  - `flex flex-col gap-1`
- per-GPU line text:
  - `GPU ${index} (${name}): ${used} / ${total} (${percent}%)`

Memory widget:

- testid:
  - `data-testid="memory-usage-bar"`
- icon:
  - `MemoryStickIcon`
  - `className: "w-4 h-4"`
- fill color:
  - `bg-primary`
- percent is rounded with:
  - `Math.round(memory.percent)`
- heading label branch:
  - `container memory:`
  - `computer memory:`
- value formatter:
  - values over `1073741824` bytes render as `${number} GB` with `maximumFractionDigits: 2`
  - smaller values render as `${number} MB` with `maximumFractionDigits: 0`
- total bar text shell:
  - `flex flex-col gap-1`
- tooltip can include:
  - `${used} / ${total} GB (${percent}%)`
  - `marimo server: ${memory}`
  - `kernel: ${memory}`
- `marimo server:` and `kernel:` rows render only when the source memory value exists

CPU widget:

- testid:
  - `data-testid="cpu-bar"`
- icon:
  - `CpuIcon`
  - `className: "w-4 h-4"`
- fill color:
  - `bg-primary`
- tooltip text:
  - `CPU: ${percent}%`

Footer AI button:

- disabled testid:
  - `data-testid="footer-ai-disabled"`
- enabled testid:
  - `data-testid="footer-ai-enabled"`
- default model fallback:
  - `chat_model ?? "openai/gpt-4o"`
  - `edit_model ?? chat_model`
- disabled tooltip:
  - `Assist is disabled`
- enabled tooltip includes:
  - `Chat model:`
  - `Edit model:`
- disabled icon:
  - `SparklesIcon`
  - `className: "h-4 w-4 opacity-60"`
- enabled icon:
  - `SparklesIcon`
  - `className: "h-4 w-4"`
- both branches use:
  - `FooterItem`
  - `selected: false`
  - `onClick -> handleClick("ai")`

Footer Copilot button:

- `data-testid="footer-copilot-status"`
- only renders when completion provider is exactly:
  - `"github"`
- tooltip starts with:
  - `GitHub Copilot:`
- primary status text branch:
  - `Ready`
  - `Not connected`
  - `Processing...`
  - `status.message`
- signed-in initialization path:
  - `useOnMount` acquires `const client = getCopilotClient()`
  - waits for `client.initializePromise`
  - initialize failure branch:
    - `logger.error("Failed to initialize", error)`
    - `client.close()`
    - rethrows into outer `catch`
  - success path then calls:
    - `client.signedIn()`
- local state transitions:
  - signed in -> `signedIn`
  - signed out -> `signedOut`
  - init failure -> `connectionError`
- mount safety:
  - local `mounted` flag blocks post-await writes after unmount
- disabled visual adds:
  - `opacity-60`
- tooltip wrapper:
  - `div.max-w-[200px]`
- tooltip detail branch:
  - `Status: ${kind}`
- warning or error color:
  - `text-(--yellow-11)`
- loading branch:
  - `Spinner`
  - `className: "h-4 w-4"`
- idle icon:
  - `GitHubCopilotIcon`
  - `className: "h-4 w-4"`
- connection error toast:
  - title `GitHub Copilot Connection Error`
  - description line `Failed to connect to GitHub Copilot. Check settings and try again.`
  - error block class `text-sm font-mono whitespace-pre-wrap`
  - action button:
    - variant `link`
    - label `Settings`
- click path:
  - `handleClick("ai")`

Footer RTC button:

- `data-testid="footer-rtc-status"`
- null gate:
  - returns `null` when `!isRtcEnabled()`
  - returns `null` when `connectedDoc === "disabled"`
- tooltip branch:
  - `Real-time collaboration active`
  - `Connecting to real-time collaboration`
- opens username popover
- popover root:
  - `Popover`
  - props:
    - `open={open}`
    - `onOpenChange={setOpen}`
- trigger:
  - `PopoverTrigger`
  - `asChild: true`
- icon:
  - `UsersIcon`
  - `className: "w-4 h-4"`
- popover content:
  - `PopoverContent`
  - `className: "w-80"`
- inner wrapper:
  - `div.space-y-4`
- heading block:
  - `div.space-y-2`
- title:
  - `Username`
- subtitle:
  - `Set your username for real-time collaboration`
- input shell:
  - `Input`
  - `placeholder: "Enter your username"`
  - `autoCapitalize: "off"`
  - `autoComplete: "off"`
  - `autoCorrect: "off"`
  - `onChange={(e) => setUsername(e.target.value)}`
- username popover title:
  - `Username`
- helper text:
  - `Set your username for real-time collaboration`
- trigger icon:
  - `UsersIcon`
  - `className: "w-4 h-4"`
- trigger wrapper:
  - `PopoverTrigger`
  - `asChild: true`
  - child is `FooterItem`
- popover root:
  - `Popover`
- popover card class:
  - `w-80`
- popover body class:
  - `space-y-4`
- heading wrapper class:
  - `space-y-2`
- title class:
  - `font-medium leading-none`
- helper class:
  - `text-sm text-muted-foreground`
- input placeholder:
  - `Enter your username`
- input attrs:
  - `autoCapitalize: "off"`
  - `autoComplete: "off"`
  - `autoCorrect: "off"`
- input change path:
  - `setUsername(event.target.value)`

