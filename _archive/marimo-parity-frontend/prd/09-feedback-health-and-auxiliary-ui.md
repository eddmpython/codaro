[Back to PRD Index](../PRD.md)

# 11. Feedback, Health, and Auxiliary UI

[Resume from Summary](./10-summary-acceptance-and-copy-plan.md#121-current-state)

Installed asset evidence for this file:

- `./assets/error-banner-CAuK5DPN.js`
- `./assets/share-DdWa0mV7.js`
- `./assets/useInstallPackage-CO3hLMle.js`
- `./assets/edit-page-CTVRcSta.js`
- `./assets/index-CVpJvEAO.css`

#### 11.0 Shared Banner And Error Primitive

Source:

Installed assets:

- `./assets/error-banner-CAuK5DPN.js`
- `./assets/index-CVpJvEAO.css`

Readable source:

- `.__marimo_upstream/frontend/src/plugins/impl/common/error-banner.tsx`

`Banner` primitive:

- base class:
  - `text-sm p-2 border whitespace-pre-wrap overflow-hidden`
- `kind="danger"`:
  - `text-error border-(--red-6) shadow-md-solid shadow-error bg-(--red-1)`
- `kind="info"`:
  - `text-primary border-(--blue-6) shadow-md-solid shadow-accent bg-(--blue-1)`
- `kind="warn"`:
  - `border-(--yellow-6) bg-(--yellow-2) dark:bg-(--yellow-4) text-(--yellow-11) dark:text-(--yellow-12)`
- `clickable={true}` add-on:
  - `cursor-pointer`
- clickable hover branches:
  - danger -> `hover:bg-(--red-3)`
  - info -> `hover:bg-(--blue-3)`
  - warn -> `hover:bg-(--yellow-3)`

`ErrorBanner` contract:

- returns `null` when `!error`
- side effect:
  - `Logger.error(error)`
- message source:
  - `prettyError(error)`
- collapsed visible banner:
  - `Banner kind="danger" clickable={true}`
  - click path `setOpen(true)`
  - message shell `span.line-clamp-4`
  - optional action row `div.flex.justify-end`
- expanded dialog:
  - `AlertDialog open={open} onOpenChange={setOpen}`
  - `AlertDialogContent className="max-w-[80%] max-h-[80%] overflow-hidden flex flex-col"`
  - title `AlertDialogTitle className="text-error"` with text `Error`
  - body:
    - `AlertDialogDescription asChild={true}`
    - class `text-error text-sm p-2 font-mono overflow-auto whitespace-pre-wrap`
    - child `pre`
  - footer action:
    - `AlertDialogAction autoFocus={true}`
    - label `Ok`
    - click path `setOpen(false)`

#### 11.1 Feedback Dialog

Source:

Installed assets:

- `./assets/edit-page-CTVRcSta.js`
- `./assets/index-CVpJvEAO.css`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/components/feedback-button.tsx`

Trigger tooltip:

- `Send feedback!`

Trigger wrapper:

- `FeedbackButton` is a `Slot` wrapper
- it reads modal actions from `useImperativeModal()`
- click path:
  - `openModal(<FeedbackModal onClose={closeModal} />)`

Dialog title:

- `Send Feedback`

Dialog shell:

- outer dialog wrapper:
  - `DialogContent`
  - `className: "w-fit"`
- dialog title primitive:
  - `DialogTitle`
- body primitive:
  - `DialogDescription`
- root content is wrapped by:
  - `form`
- submit handler:
  - reads `rating` and `message` from `new FormData(event.target)`
  - POSTs JSON to feedback endpoint
  - calls `onClose()`

Body copy includes:

- `We want to hear from you - from minor bug reports to wishlist features and everything in between.`
- survey link text:
  - `two-minute survey.`
- GitHub link text:
  - `GitHub issue.`
- Discord link text:
  - `Discord.`
- link list wrapper:
  - `ul.list-disc.ml-8.my-2.prose.dark:prose-invert`
- each list item class:
  - `my-0`
- body paragraph classes:
  - `my-2 prose dark:prose-invert`

Submit target:

- `https://marimo.io/api/feedback`
- submit transport is fire-and-forget:
  - `fetch(... )` is not awaited
- current visible body exposes only informational prose and links:
  - no rendered rating control
  - no rendered message textarea
  - submit handler still reads `rating` and `message` from `FormData`

Success toast:

- title:
  - `Feedback sent!`
- description:
  - `Thank you for your feedback!`

#### 11.2 Backend Health and LSP Health

Backend health source:

Installed assets:

- `./assets/edit-page-CTVRcSta.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/backend-status.tsx`

Backend health contract:

- polling constant:
  - `CHECK_HEALTH_INTERVAL_MS = 30000`
- shared connection-status atom:
  - `connectionStatusAtom = atom<"healthy" | "unhealthy" | "connecting" | "disconnected">("connecting")`
- exported getter:
  - `getConnectionStatus() => store.get(connectionStatusAtom)`
- polling:
  - `delayMs: 30000`
  - only when `isAppConnected(connection)` is true
  - `whenVisible: true`
- tooltip testid:
  - `data-testid="footer-backend-status"`
- button testid:
  - `data-testid="backend-status"`
- tooltip wrapper:
  - `text-sm whitespace-pre-line`
- tooltip line assembly:
  - disconnected branch:
    - `Not connected to a runtime`
  - connected branch prepends:
    - `startCase(connection.toLowerCase())`
  - health line branch:
    - `✓ Healthy`
    - `✗ Unhealthy`
    - `Health: Unknown`
- error line:
  - `Error: ${error}`
- helper line when connected:
  - `Click to refresh health status`
- button class:
  - `p-1 hover:bg-accent rounded flex items-center gap-1.5 text-xs text-muted-foreground`
- label text:
  - `Kernel`
- wasm branch:
  - skips remote health check
  - sets `connectionStatusAtom` to `healthy`
  - returns `{ isHealthy: true, lastChecked: new Date(), error: undefined }`
- connected health path:
  - `runtime.isHealthy()`
  - stores `healthy` or `unhealthy` into `connectionStatusAtom`
- caught error path:
  - stores `unhealthy` into `connectionStatusAtom`
  - returns `isHealthy: false` plus `lastChecked` and `error.message`
- click behavior:
  - disconnected branch:
    - `connectToRuntime()`
  - connected branch:
    - `refetch()`
- icon branch:
  - loading or transitional:
    - `Spinner`
    - `size: "small"`
  - destructive transitional:
    - `Spinner`
    - `className: "text-destructive"`
  - connected healthy:
    - `CheckCircle2Icon`
    - `className: "w-4 h-4 text-(--green-9)"`
  - connected unhealthy after a check:
    - `AlertCircleIcon`
    - `className: "w-4 h-4 text-(--yellow-9)"`
  - connected before first health response:
    - `CheckCircle2Icon`
    - `className: "w-4 h-4"`
  - disconnected:
    - `PowerOffIcon`
    - `className: "w-4 h-4"`
  - disconnected error branch:
    - `PowerOffIcon`
    - `className: "w-4 h-4 text-red-500"`

LSP health source:

Installed assets:

- `./assets/edit-page-CTVRcSta.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/lsp-status.tsx`

LSP health contract:

- polling:
  - `GET /lsp/health`
  - `delayMs: 60000`
  - only when `isAppConnected(connection)` is true
  - `whenVisible: true`
- restart path:
  - `POST /lsp/restart`
- hidden branch:
  - returns `null` when `!data || data.servers.length === 0`
- button testid:
  - `data-testid="lsp-status"`
- tooltip testid:
  - `data-testid="footer-lsp-status"`
- status label text:
  - `LSP`
- tooltip heading:
  - `LSP Status`
- tooltip wrapper:
  - `text-sm`
- server list wrapper:
  - `mt-1 text-xs space-y-1`
- per-server row class:
  - `flex justify-between gap-2`
- per-server status text:
  - `running -> ✓ OK (${lastPingMs.toFixed(0)}ms)` when ping exists, else `✓ OK`
  - `starting -> ⋯ Starting`
  - `stopped -> ✗ Stopped`
  - `crashed -> ✗ Crashed`
  - `unresponsive -> ✗ Not responding`
- per-server status color:
  - `running -> text-(--green-9)`
  - `starting -> text-(--yellow-11)`
  - default error -> `text-(--red-9)`
- helper text when not healthy:
  - `Click to restart failed servers`
- button class:
  - `p-1 hover:bg-accent rounded flex items-center gap-1.5 text-xs text-muted-foreground`
- icon branch:
  - loading -> `Spinner size:"small"`
  - healthy -> `CheckCircle2Icon className:"w-4 h-4 text-(--green-9)"`
  - degraded -> `AlertCircleIcon className:"w-4 h-4 text-(--yellow-11)"`
  - unhealthy -> `AlertCircleIcon className:"w-4 h-4 text-(--yellow-11)"`
- click behavior:
  - only restarts when `status !== "healthy"`
- restart success toast:
  - title `LSP Servers Restarted`
  - description `Restarted: ${list}` or `No servers needed restart`
- restart failure toast:
  - title `LSP Restart Failed`
  - description from `errors` map or caught error message

#### 11.3 Share Static Notebook Dialog

Source:

Installed assets:

- `./assets/share-DdWa0mV7.js`
- `./assets/edit-page-CTVRcSta.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/actions/useNotebookActions.tsx`
- `.__marimo_upstream/frontend/src/components/static-html/share-modal.tsx`

Open path:

- notebook menu item `Share -> Publish HTML to web`

Derived URL contract:

- `BASE_URL = "https://static.marimo.app"`
- `randomHash = Math.random().toString(36).slice(2, 6)`
- `path = \`${slug}-${randomHash}\``
- `url = \`${BASE_URL}/static/${path}\``

Dialog contract:

- title:
  - `Share static notebook`
- body copy includes:
  - `You can publish a static, non-interactive version of this notebook to the public web.`
  - `We will create a link for you that lives on`
  - `https://static.marimo.app`
- dialog wrapper class:
  - `w-fit`

Slug field:

- input testid:
  - `data-testid="slug-input"`
- id:
  - `slug`
- placeholder:
  - `Notebook slug`
- attrs:
  - `autoFocus`
  - `required`
  - `autoComplete: "off"`
- input normalization:
  - lowercase
  - strip whitespace
  - strip characters outside `[0-9a-z-]`

URL preview:

- helper text:
  - `Anyone will be able to access your notebook at this URL:`
- preview wrapper:
  - `font-semibold text-sm text-muted-foreground gap-2 flex flex-col`
- preview row:
  - `flex items-center gap-2`
- URL text shell:
  - `span.text-primary`

Copy URL button:

- testid:
  - `data-testid="copy-static-notebook-url-button"`
- button size:
  - `xs`
- button variant:
  - `secondary`
- tooltip content:
  - `Copied!`
- tooltip open gate:
  - `open={copied}`
- copy click wrapper:
  - `Events.stopPropagation(async (e) => { e.preventDefault(); ... })`
- copied-state lifecycle:
  - `setCopied(true)`
  - `setTimeout(() => setCopied(false), 2000)`
- icon:
  - `CopyIcon`
  - `size: 14`
  - `strokeWidth: 1.5`

Dialog actions:

- cancel button:
  - `data-testid="cancel-share-static-notebook-button"`
  - variant `secondary`
  - label `Cancel`
- submit button:
  - `data-testid="share-static-notebook-button"`
  - `aria-label: "Save"`
  - variant `default`
  - type `submit`
  - label `Create`
  - `onClick` pre-copies the computed URL before form submission

Toast contract:

- submit order:
  - `onClose()`
  - `exportAsHTML({ download: false, includeCode: true, files: VirtualFileTracker.INSTANCE.filenames() })`
  - show upload-progress toast
  - `fetch("${BASE_URL}/api/static", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ html, path }) })`
- upload start:
  - title `Uploading static notebook...`
  - description `Please wait.`
- upload error:
  - title `Error uploading static page`
  - description includes GitHub issue link
- source fallthrough note:
  - the `catch()` branch does not abort the handler
  - after an upload error toast, source still dismisses the progress toast and shows the success toast
- upload success:
  - title `Static page uploaded!`
  - description includes:
    - `The URL has been copied to your clipboard.`
    - `You can share it with anyone.`

#### 11.4 Package Alerts and Install Widgets

Source:

Installed assets:

- `./assets/useInstallPackage-CO3hLMle.js`
- `./assets/edit-page-CTVRcSta.js`
- `./assets/index-CVpJvEAO.css`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/package-alert.tsx`

Top-level gates and helpers:

- returns `null` when `packageAlert === null`
- version-select support gate:
  - `userConfig.package_management.manager !== "pixi"`
- package spec parser:
  - `name[extra1,extra2] -> { name, extras }`
- package spec builder:
  - extras reassemble as `${name}[${extras.join(",")}]`

Package install CTA:

- button testid:
  - `data-testid="install-packages-button"`
- button primitive:
  - `variant: "outline"`
  - `size: "sm"`
- leading icon:
  - spinner icon `DownloadCloudIcon`
  - `className: "w-4 h-4 mr-2"`
- label shell:
  - `span.font-semibold`
- click path:
  - clears current package alert
  - fills missing version strings with `""`
  - calls `sendInstallMissingPackages({ manager, versions, source })`

Package banner shells:

- outer placement:
  - `flex flex-col gap-4 mb-5 fixed top-5 left-12 min-w-[400px] z-200 opacity-95 max-w-[600px] pointer-events-none`
- package-state card:
  - `flex flex-col rounded pt-3 pb-4 px-5 overflow-auto max-h-[80vh] scrollbar-thin pointer-events-auto`
- failure card variant:
  - `kind: "danger"`
- install or success card variant:
  - `kind: "info"`
- installed state auto-dismiss:
  - `setTimeout(removeBanner, 10000)`
- dismiss button:
  - `data-testid="remove-banner-button"`
  - `variant: "text"`
  - `size: "icon"`
- missing-package banner animation:
  - `animate-in slide-in-from-left`

Package banner text states from `getInstallationStatusElements(packages)`:

- installing:
  - title `Installing packages`
  - description `Installing packages:`
- installed:
  - title `All packages installed!`
  - description `Installed packages:`
- failed:
  - title `Some packages failed to install`
  - description `See error logs.`
- title icon mapping:
  - installing -> `DownloadCloudIcon className="w-5 h-5 inline-block mr-2"`
  - installed -> `PackageCheckIcon className="w-5 h-5 inline-block mr-2"`
  - failed -> `PackageXIcon className="w-5 h-5 inline-block mr-2"`

Missing-package branch:

- headline:
  - `Missing packages`
- intro text:
  - `The following packages were not found:`
- package row shell:
  - `tr.font-mono.text-sm`
- icon cell:
  - `BoxIcon size="1rem"`
- isolated branch:
  - shows install CTA and optional package-manager form
- non-isolated branch:
  - prose with external link to Python virtual-environment docs
- manager helper text:
  - `span.px-2.text-sm`
  - text `with`

Per-package list:

- wrapper:
  - `ul.list-disc.ml-2.mt-1`
- item shell:
  - `flex items-center gap-1 font-mono text-sm`
- installing item adds:
  - `font-semibold`
- failed item adds:
  - `text-destructive`
- installed item adds:
  - `text-accent-foreground`
- status icon mapping:
  - `queued -> BoxIcon size:"1rem"`
  - `installing -> DownloadCloudIcon size:"1rem"`
  - `installed -> CheckIcon size:"1rem"`
  - `failed -> XIcon size:"1rem"`
- installed item degraded branch:
  - when overall banner status is `failed`, already-installed rows become `text-muted-foreground`

Installation logs accordion:

- hidden when `Object.keys(packageLogs).length === 0`
- local open state default:
  - `true`
- toggle button class:
  - `flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors`
- toggle icon branch:
  - expanded -> `ChevronDownIcon`
  - collapsed -> `ChevronRightIcon`
- section wrapper:
  - `mt-4 border-t border-border pt-4 w-full`
- open content wrapper:
  - `mt-3 space-y-3 w-full`
- per-package log title:
  - `font-mono text-sm font-medium mb-2 text-foreground`
- log box:
  - `border border-border rounded w-full`
- log pre:
  - `p-3 text-xs font-mono bg-background max-h-64 overflow-y-auto text-muted-foreground whitespace-pre-wrap scrollbar-thin`
- empty log text:
  - `No logs available`

Package extras selector:

- extras metadata source:
  - `usePackageMetadata(packageName)`
- dropdown-open gate:
  - opens only when `!isPending && !error`
- selected extras shell:
  - `hover:bg-muted/50 rounded text-sm px-1 transition-colors border border-muted-foreground/30 hover:border-muted-foreground/60 min-w-0 flex-1 truncate text-left`
- selected extras title attr:
  - ``Selected extras: ${selectedExtras.join(", ")}``
- add-extras button class:
  - `hover:bg-muted/50 rounded text-sm ml-2 transition-colors border border-muted-foreground/30 hover:border-muted-foreground/60 h-5 w-5 flex items-center justify-center p-0`
- disabled add-extras state adds:
  - `opacity-50 cursor-not-allowed`
- add-extras title:
  - loaded `Add extras`
  - loading `Loading extras...`
- extras popover class:
  - `w-64 p-0 max-h-96 flex flex-col`
- extras header when no selection yet:
  - `p-2 bg-popover border-b border-border`
  - text `Package extras`
- selected chips wrapper:
  - `flex flex-wrap gap-1 p-1 min-h-[24px]`
- chip class:
  - `inline-flex items-center gap-1 px-1 py-0.5 text-sm font-mono border border-muted-foreground/30 hover:border-muted-foreground/60 rounded-sm cursor-pointer group transition-colors`
- removable chip trailing icon:
  - `XIcon`
  - `className: "w-3 h-3 opacity-60 group-hover:opacity-100"`
- extras list wrapper:
  - `overflow-y-auto flex-1`
- extras item class:
  - `font-mono text-sm`
- filtered extras rule:
  - exclude `/^(dev|test|testing)$/i`
- chip click behavior:
  - clicking a selected chip removes that extra from the set

Package version select:

- normal select class:
  - `inline-flex ml-2 w-24 text-ellipsis`
- loading option:
  - `latest`
- success options:
  - `["latest", ...versions.slice(0, 100)]`
- fetch-error tooltip:
  - `Failed to fetch package versions`
- fetch-error fallback:
  - disabled select with only `latest`
- pending state:
  - select stays disabled while metadata is loading

Package manager form:

- resolver:
  - `zodResolver(UserConfigSchema as unknown as z.ZodType<unknown, UserConfig>)`
- save trigger:
  - `form.handleSubmit(onSubmit)` on every `form.onChange`
- dirty-value send rule:
  - uses `getDirtyValues(values, form.formState.dirtyFields)`
  - returns early when there are no dirty values
- save path:
  - `saveUserConfig({ config: dirtyValues })`
- local merge path:
  - `setConfig(prev => ({ ...prev, ...values }))`
- select testid:
  - `install-package-manager-select`
- select class:
  - `inline-flex mr-2`

