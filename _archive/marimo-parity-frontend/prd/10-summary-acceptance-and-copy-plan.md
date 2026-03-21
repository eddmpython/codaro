[Back to PRD Index](../PRD.md)

# 12. UI Inventory Summary

This file is the session-resume entry for the split frontend parity PRD archive.
Update `12.1 Current State`, `12.2 Next Action`, and `12.3 Verification Left` first when handing work off across sessions.

The marimo edit UI exposed by the traced sources is composed of these visible regions:

- root document shell and portal
- top-level chrome or chrome-hidden render branch
- left sidebar rail with reorderable panel icons, feedback item, and queued or running indicator
- helper sidebar for active sidebar panels
- developer panel with reorderable tabs, backend health, and LSP status
- context-aware side panel
- helper sidebar panel bodies for files, variables/data sources, dependencies, documentation, outline, packages, snippets, and AI
- developer panel bodies for errors, scratchpad, tracing, secrets, logs, terminal, and cache
- filename bar
- notebook banners and stdin waiting banner
- top-left status overlay and optional slotted layout sidebar
- notebook width wrapper and optional column footer creation strip
- find/replace overlay
- top-right utility controls
- notebook menu inventory and nested action trees
- bottom-right run and command controls
- multi-cell selection toolbar and pending-delete confirmation bar
- bottom-center pending AI cells bar
- command palette overlay
- notebook settings popover and user settings dialog
- shutdown confirm dialog
- save dialog and unsaved recovery dialog
- share static notebook dialog
- feedback dialog
- footer developer, runtime, and status region
- cell surface, cell action dropdown, editor overlay, hover actions, status rail, console, and output surface

#### 12.1 Current State

- on `2026-03-20`, the current marimo-matched `frontend/` state was frozen to `_backup/frontend/marimo-parity-baseline-2026-03-20/`
- this split PRD is now the reference archive for that frozen baseline, not an active claim that parity work is still open on the main path
- browser side-by-side verification and some deeper source-proof items were not closed before freeze, so this archive is a baseline reference, not a certified `marimo 1:1` completion
- split PRD navigation is explicit: `frontend/PRD.md` is the short index, `10-summary-acceptance-and-copy-plan.md` is the session-resume entry, and the section files link back into that resume path
- the PRD now explicitly locks to the installed `marimo==0.21.0` build and its `_static/index.html` entry, CSS load order, and key edit-surface bundle filenames recorded in `01-goal-rules-and-sources.md`
- file-level installed asset evidence blocks now exist at the top of `02` through `09`, so each split contract points to concrete `_static` bundles before dropping into readable source details
- every current `Source:`/`Width wrapper source:`/`Source branch:`/health-source block in the split PRD now places `Installed assets` before `Readable source`, so the readable mirror is no longer cited without a build-backed asset pointer
- section-level installed asset evidence now covers the major sections in `02-global-app-contract.md`, `03-workspace-chrome-contract.md`, `04-notebook-body-contract.md`, `05-floating-actions-save-recovery.md`, `06-settings-and-app-config.md`, `07-cell-editor-hover-output.md`, `08-footer-contract.md`, and `09-feedback-health-and-auxiliary-ui.md`, and lower-level subsection evidence is started in the deeper `03` and `07` contracts too
- a heuristic scan across `02` through `09` currently finds no visible `####` section heading left without a nearby source block, so the remaining gap is now the quality of proof, not the absence of source sections
- root shell, left rail, helper sidebar, developer panel, filename bar, footer, notebook body, floating controls, cell root, editor overlay, hover CSS, status rail, console, and output contracts all have split PRD sections with concrete DOM/class/testid coverage
- root/head evidence is already captured in the split docs, including `<marimo-filename hidden>`, hidden config tags, `#root`, `#portal[data-testid="glide-portal"]`, `window.__MARIMO_MOUNT_CONFIG__`, `#app-chrome-sidebar`, `#app-chrome-panel`, `cmdk-root`, `#save-button`, dialog testids, and `language-toggle-button`
- `PanelsWrapper`, `ContextAwarePanel`, find/replace, `StatusOverlay`, `WrappedWithSidebar`, `Disconnected`, floating alerts, kiosk gates, and shared `ErrorBanner` all have branch-level writeups rather than only inventory mentions
- helper sidebar and developer panel bodies have broad coverage for files, variables/data sources, dependencies, documentation, outline, packages, snippets, AI, errors, scratchpad, tracing, secrets, logs, terminal, and cache
- floating controls, notebook menu, save/recovery/shutdown flows, settings/app-config surfaces, footer widgets, AI chat/agent surfaces, and output subtype branches are all materially expanded compared with the earlier inventory-only pass
- many sections were written with readable support from `.__marimo_upstream/frontend/src/...`, but that tree is now treated as a secondary mirror rather than the primary source of truth
- `.__marimo_upstream/frontend/package.json` still carries the workspace placeholder version `0.0.0-placeholder`, so the readable mirror does not by itself prove equivalence to the installed `marimo==0.21.0` build
- recent PRD fixes that remain important are still preserved in the split docs, including the corrected `LazyCommandPalette` mount order, `ToolbarItem` variants, files-panel toolbar order, variables/dependencies table and graph contracts, save/recovery button details, and user settings testids
- Codaro shipped product documents one explicit fork point: the documentation slot keeps shell parity but renders `Context Help` and external landing links instead of an embedded docs browser
- **2026-03-20 implementation sweep**: 15 new components created to close previously missing marimo surfaces; total component count is now 71 `.svelte` files
- newly implemented surfaces since last PRD update:
  - `AppConfigButton` + `AppConfigForm` + `UserConfigDialog` — notebook and user settings with popover/dialog matching marimo's app-config-button, app-config-form, and user-config-form contracts; includes 7-tab vertical layout, `data-testid` on key controls
  - `NotebookMenuDropdown` — Actions menu with nested export submenu, version footer, `data-testid="notebook-menu-dropdown-${label}"` pattern
  - `FeedbackDialog` — survey/GitHub/Discord links in prose dialog
  - `ShareStaticDialog` — slug input, derived URL preview, copy-to-clipboard, `data-testid="slug-input"` and related testids
  - `PackageAlert` — fixed top-left banner with missing/installing/installed branches, per-package status icons, expandable logs
  - `PendingAICellsBar` — fixed bottom-center float with cell navigation, accept/reject all, cyan glow shadow
  - `StatusOverlay` — top-left engine/connection status (running/disconnected/kiosk priority logic)
  - `ErrorBanner` — reusable error/warning/info banner with expandable details
  - `DisconnectedOverlay` — full-screen disconnected state with noise/gradient background
  - `KioskModeGate` — conditional hide/show based on kiosk mode
  - `LayoutSelect` — layout view dropdown (vertical/grid/slides) with WASM feature gate
  - `LspStatus` — footer LSP connection indicator
  - Sidebar `Feedback` button wired through `onFeedback` prop chain (NotebookShell -> EditPage -> AppChrome -> Sidebar)
- existing components enhanced:
  - `CellFrame` — language toggle overlay (`data-testid="language-toggle-button"`), hide code toggle (`data-testid="cell-hide-code-button"`), selection ring (active: `ring-2 ring-primary/50`, error: `ring-2 ring-destructive/50`)
  - `OutputRenderer` — expandable output with show more/less + fullscreen portal, console output section (stdout/stderr with hover toolbar, wrap toggle, collapse), stdin prompt row, marimo class contracts (`.output-area`, `.stdout`, `.stderr`, `.return`, `.output`, `.marimo-error`)
  - `TopRightControls` — now renders `NotebookMenuDropdown` + `AppConfigButton` + `ShutdownButton` instead of disabled placeholder icons
  - `NotebookShell` — integrates `StatusOverlay`, `DisconnectedOverlay`, `PendingAICellsBar`, `FeedbackDialog`, `ShareStaticDialog`, `PackageAlert`; passes `queuedOrRunningCount` through full chain
  - `Footer` — added `LspStatus` between `BackendStatus` and spacer
  - `Sidebar` — added Feedback button with `onFeedback` callback
- `data-testid` coverage now includes 75+ unique testid values across all components
- frontend build passes cleanly (client + server + adapter-static) with only a chunk-size warning on the main page bundle (517 kB)
- the current PRD still cannot honestly claim finished `marimo 1:1` because browser render side-by-side checks have not been completed and some panel bodies remain stubs rather than full branch-level implementations

#### 12.2 Next Action

- do not rewrite the archive in place; use `_backup/frontend/marimo-parity-baseline-2026-03-20/` as the frozen baseline
- use this split PRD to explain which parts of Codaro intentionally diverge from that baseline
- if parity work is ever reopened, resume from this archive and then run browser side-by-side verification plus the remaining source-proof checklist
- keep the split PRD structure stable: add detailed contracts in `frontend/prd/*.md`, and keep `frontend/PRD.md` as the short index and session entrypoint
- keep documenting Codaro fork points explicitly whenever shipped product behavior intentionally diverges from marimo source

#### 12.3 Verification Left

- the items below were still open when the archive was frozen; they matter if parity work is reopened or if Codaro changes need to be checked against the archived baseline
- confirm the installed build lock still is `marimo==0.21.0`, and that the recorded `_static/index.html`, entry module, and CSS filenames still match the actual installed build
- confirm each PRD section source block still records installed asset evidence first and readable mirror paths second after any further edits
- confirm the local `.__marimo_upstream` readable mirror really matches the installed build for every section where it is cited; if not, rewrite from `_static` evidence
- confirm actual browser render side-by-side, not just DOM/file reading, for the acceptance-critical surfaces
- confirm the `showChrome=false` branch still mounts the notebook page and command palette in the documented order
- confirm Codaro implementation uses the same split between notebook action buttons and text buttons
- confirm filename bar hover, stale shadow, and rounded radius match these tokens exactly
- confirm find/replace overlay matches source panel shell, hotkey/open gate, toggle row, replace/undo flow, and match counter strings
- confirm `StatusOverlay` and `WrappedWithSidebar` match source icon gates, top-left anchor classes, disconnected noise branch, sidebar width helpers, and mobile sheet trigger shell
- confirm `ContextAwarePanel` matches source null-return gate, slot ownership, pin/cell-aware toggles, pinned vs overlay branch, and resize handle shells
- confirm `Disconnected`, connection alerts, `FloatingAlert` or `Banner`, `PyodideLoader`, and `LargeSpinner` match source branch gates, copy, and shell tokens
- confirm kiosk-only and non-kiosk-only surfaces match the documented `HideInKioskMode` and `ShowInKioskMode` gates exactly
- confirm shared `ErrorBanner` matches source collapsed banner, expanded dialog, prettyError body, and action row behavior
- confirm the split PRD remains navigable, with `frontend/PRD.md` pointing to the correct section files and `10-summary-acceptance-and-copy-plan.md` remaining the session-resume entry
- confirm top-right row, notebook menu nested dropdowns, and bottom-right stack use the documented ownership split and state colors
- confirm the floating pending AI cells bar matches source wrapper tokens, count text, and accept or reject button shells
- confirm the multi-cell selection toolbar matches source overlay class, primary action group order, overflow dropdown rows, and pending-delete confirmation flow
- confirm the command palette overlay matches source dialog shell, cmdk attributes, group headings, and placeholder or empty strings
- confirm keyboard shortcuts dialog matches source portal ownership, duplicate-warning banner, group order, editable-row capture rules, and reset flows
- confirm the column footer add-cell strip matches source wrapper, hover reveal gate, button token, `createNewCell` payloads, AI tooltip, and `AddCellWithAI` open branch
- confirm notebook body contract matches source read-mode action dropdown, empty-notebook alert, `showCode` initialization, `canShowCode` predicate, `groupCellsByColumn`, `shouldHideCode`, floating outline hover-slide shell, and read-only code overlay buttons
- confirm helper sidebar `files`, `variables or data sources`, `dependencies`, `documentation`, `outline`, `packages`, `snippets`, and `AI` panel bodies match the documented section shells, toolbar buttons, search placeholders, empty states, and split layouts
- confirm shipped Codaro keeps the documented shell parity while routing the documentation slot to `Context Help` and public landing links instead of an embedded docs browser
- confirm helper sidebar `files` body also matches prompt titles, delete dialog copy, duplicate naming rule, upload toasts, drag or drop rules, and remote preview metadata layout
- confirm helper sidebar `files` body also matches selected local file detail lazy body, draft cache, warning banner, editability gates, and save hotkey behavior
- confirm helper sidebar `dependencies` body also matches graph node creation filters, custom node shell, graph toolbar orientation buttons, settings popover toggles, dagre layout defaults, minimap glyph shifts, focused-row path geometry, node or edge selection panels, and focus-jump behavior
- confirm helper sidebar `AI` bodies also match the documented message-row alignment, mode option subtitles, attachment shells, and retry or stop branches
- confirm developer panel `errors`, `scratchpad`, `tracing`, `secrets`, `logs`, `terminal`, and `cache` panel bodies match the documented empty states, toolbars, split shells, and action labels
- confirm `Add Secret` modal matches the documented field labels, placeholder strings, warning text, button states, and toast copy
- confirm agent notification blocks match the documented registry mapping, `data-block-type` values, connection status colors, plan checklist rows, tool-call accordion states, and resource or diff shells
- confirm cell action dropdown group order, rename dialog, and copy-link disabled branch match source
- confirm notebook menu footer locale/version rows and duplicate prompt match source strings and gating
- confirm save dialog and recovery dialog use the same filename derivation, disabled gates, and Escape handling
- confirm save button uses the same connected versus disconnected tooltip wrapper, persistent filename gate, and temp-path branching
- confirm usage stats, backend health, LSP health, Copilot footer states, and RTC username popover use the documented tooltip, icon, gate, and click branches
- confirm editor contract matches source `AiCompletionEditor`, RTC waiting gate, completion banner visibility, prompt row controls, merge editor branch, and language-toggle source names
- confirm shared AI completion handlers match source keyboard shortcuts and accept/reject button class chains across editor and pending-AI bars
- confirm scratchpad reproduces history storage, insert/clear/run paths, split-panel defaults, and editor/output ownership exactly
- confirm tracing reproduces expanded-run defaults, sidebar vs developer-panel split behavior, Vega hover bridge, queued sorting, and row shell details
- confirm terminal reproduces websocket attach lifecycle, pending-command flush, context-menu placement, resize message path, and dark terminal theme tokens
- confirm layout-select reproduces the WASM feature-flag gate, `View as` label, exact option set, and icon mapping
- confirm package-alert reproduces missing/installing/installed branches, extras/version selectors, package-manager form, and log accordion behavior
- confirm cache-panel reproduces loading/empty branches, stats grid, storage section, refresh states, and destructive purge flow
- confirm backend-health reproduces the connection-status atom, WASM fast-path, runtime health polling, and click-to-connect vs click-to-refresh branching
- confirm output contract matches source `OutputArea` null gates, `ExpandableOutput` fullscreen/expand controls, mimebundle tabs, unsupported-widget banner, and the `TextOutput` / `HtmlOutput` / `JsonOutput` / traceback / marimo-error subtype branches
- confirm console hover toolbar, clear debounce, wrap toggle, collapse button, stale title, stdin prompt, and stdin response rows use the documented shell and key handling
- after implementation changes, run build verification and then compare DOM contracts section by section

### 13. Acceptance Criteria

The implementation can only be called `marimo 1:1` when all of the following are true:

- the installed marimo version and exact `_static` asset filenames recorded in `01-goal-rules-and-sources.md` match the build being copied, and any readable source mirror references remain subordinate to that lock.
- root head tags, preload links, hidden mount tags, and portal structure match source.
- `#root`, `#app`, `#App`, `#portal`, `#app-chrome-sidebar`, and `#app-chrome-panel` match source hierarchy.
- left rail, helper sidebar, developer panel, filename bar, floating controls, footer, and cell wrapper all use source-backed class tokens and IDs.
- utility tokens such as `rounded-md`, `rounded`, `border`, `text-xs`, `text-sm`, `shadow-xs-solid`, and hover selectors resolve exactly as documented here.
- sidebar and developer panel registries match source panel inventory and drag behavior.
- settings popover, user settings dialog, feedback dialog, save dialog, recovery dialog, and shutdown dialog all expose the same strings and hooks.
- notebook menu top-level order, nested dropdown inventories, share-static dialog, and cell action dropdown match the documented source-backed branches.
- top-right utility row contains only the source-owned controls for that row, and the bottom-right stack owns save, preview, command palette, and run controls with the documented state branches and `data-testid` hooks.
- the floating pending AI cells bar and command palette overlay use the documented mount order, classes, labels, and button primitives.
- multi-cell selection toolbar and pending-delete confirmation bar reproduce the documented group order, disabled rules, overlay shells, and destructive confirmation behavior.
- column footer add-cell strip reproduces the documented reveal gate, text-button token, button order, create payloads, AI tooltip copy, and open-AI replacement branch.
- footer runtime settings reproduces the same rows, labels, toggles, and visibility rules.
- cell read branch and edit branch child order match source exactly.
- editor overlay, hover rules, status rail, console output, and output surface follow source tokens exactly.
- no wrapper, padding rule, hover rule, button mapping, or dialog branch exists without source support.

### 14. Verification Checklist

- [ ] installed `marimo==0.21.0` build lock, `_static/index.html`, entry module, and CSS load order still match the actual local install.
- [ ] every split PRD source block lists installed asset evidence before readable mirror paths.
- [ ] `index.html` meta tags, preload assets, hidden mount tags, mount config, and portal have been reproduced exactly.
- [ ] `body -> #root -> .contents -> chrome -> #app -> #App` hierarchy matches the captured DOM.
- [ ] top-level `showChrome=false` branch reproduces `EditApp(hideControls=true)` plus `LazyCommandPalette` sibling mounting without the chrome wrapper.
- [ ] left rail wrapper, sidebar item shell, feedback item, and queued or running indicator match source.
- [ ] helper sidebar id, testid, resize behavior, header, and special `Dependencies` and `AI` header branches match source.
- [ ] helper sidebar common primitives match source `PanelAccordionItem`, `PanelAccordionTrigger`, `PanelAccordionContent`, `PanelBadge`, and `PanelEmptyState` contracts.
- [ ] helper sidebar `files` panel body matches source top-level branches, toolbar order, testids, drag overlay, tree row menu inventory, and remote storage shells.
- [ ] helper sidebar `files` panel body matches source prompt titles, delete dialog copy, duplicate naming rule, upload toasts, drag or drop gates, and remote preview metadata shell.
- [ ] helper sidebar `variables` or `data sources` panel matches source visible mount ownership, accordion storage state, auto-open rule, search bars, empty states, variable table columns, and add-table affordances.
- [ ] helper sidebar `dependencies` panel matches source minimap and graph branch shells, minimap row button classes, graph fit-view overlay, and `Jump to focused cell` affordance.
- [ ] helper sidebar `dependencies` panel matches source graph toolbar, settings toggles, selection panel shells, minimap relation glyph shifts, and focus-on-double-click behavior.
- [ ] helper sidebar `documentation`, `outline`, `packages`, and `snippets` panels match source empty states, `documentationAtom` render flow, `OutlineList` row classes, floating outline shell, minimap glyph sizing, install-form atom handoff, dependency-tree keyboard/aria behavior, search or split layouts, header or toolbar shells, and action labels.
- [ ] helper sidebar `AI` panel matches source `chat` and `agents` bodies, `renderUIMessage` part mapping, header rows, `MCPStatusIndicator`, history popover rows, reasoning accordion, prompt shells, `AIModelDropdown`, mode selectors, model selector, footer action buttons, session tabs, agent selector dropdown branches, `ConnectionStatus`, `PermissionRequest`, shared accordion shell, agent docs cards, scroll-to-bottom button, loading states, stop or retry controls, tool-call accordion states, and agent notification blocks.
- [ ] developer panel id, testid, resize behavior, reorderable tabs, backend health, and LSP health match source.
- [ ] developer panel `errors`, `scratchpad`, `tracing`, `secrets`, `logs`, `terminal`, and `cache` bodies match source empty states, toolbars, split layouts, log row formatting, action strings, and the `Add Secret` modal contract.
- [ ] filename bar shell, cmdk root, list wrapper, input row, input class, hover shadow, and input testids match source.
- [ ] banner stack and stdin waiting banner match source strings and placement.
- [ ] column footer creation strip reproduces the reveal gate, `Python`, `Markdown`, `SQL`, and `Generate with AI` button order, wrapper tokens, `createNewCell` payloads, AI tooltip copy, and `AddCellWithAI` open branch.
- [ ] top-right utility row reproduces the connected-state row ownership, wrapper tokens, and config or menu or shutdown controls without placing save there.
- [ ] notebook menu dropdown reproduces `Actions` tooltip, helper row, `notebook-menu-dropdown-${label}` testid pattern, `w-[240px]` end-aligned popover, and the documented top-level and nested menu inventory.
- [ ] notebook menu dropdown reproduces `modal: false`, `DropdownMenuTrigger asChild={true}`, locale/version footer rows, and the duplicate-notebook prompt contract.
- [ ] bottom-right stack reproduces save, preview, command palette, `KeyboardShortcuts`, spacer, undo delete, run, and interrupt branches in the documented order.
- [ ] shutdown button matches source `isWasm()` hidden gate, tooltip wrapper, destructive confirm action, `Confirm Shutdown` aria-label, and delayed `window.close()` shutdown path.
- [ ] multi-cell selection toolbar reproduces the overlay shell, selected-count label, primary action groups, overflow dropdown rows, selection-clear listener, and pending-delete confirmation bar.
- [ ] floating pending AI cells bar reproduces the center-bottom wrapper, pending counter, ghost up or down buttons, divider, and accept or reject controls.
- [ ] notebook action button primitive and text button primitive match their source class contracts and color variants.
- [ ] command palette overlay matches the source dialog wrapper, command root class, input wrapper, list or group shells, empty state, and `cmdk-*` attribute contract.
- [ ] footer item primitive matches `FooterItem` base class, selected state, top-side tooltip behavior, and forwarded-ref `div` root contract.
- [ ] notebook settings popover and user settings dialog match source sections, strings, testids, field shells, and popover footer link.
- [ ] user settings package manager select, package install CTA, package banners, extras popover, version select, and installation logs match source shells and strings.
- [ ] reorderable sidebar or developer-panel primitives, cross-list payloads, empty slots, and picker wrappers match source.
- [ ] save dialog and recovery dialog match source titles, helper text, and button testids.
- [ ] save dialog and recovery dialog match source filename derivation, disabled gates, `Escape` close handling, `${proposedName}.json` download naming, `beforeunload` warning, and `format_on_save` pre-save path.
- [ ] save button matches source tooltip wrapper, `ControlButton` or `EditorButton` trigger primitive, connected or disconnected branch ownership, and temp-path persistence gate.
- [ ] share static notebook dialog matches source strings, testids, URL derivation, copy-button tooltip lifecycle, URL pre-copy click path, and toast fallthrough behavior.
- [ ] feedback dialog matches source copy, `Slot` trigger behavior, fire-and-forget submit transport, success toast, and the current no-input body contract.
- [ ] footer shell, developer toggle, runtime settings, kiosk label, usage stats, AI, Copilot, and RTC regions match source composition.
- [ ] GPU, memory, and CPU footer widgets match source testids, tooltip strings, and shared bar primitive.
- [ ] backend health and LSP health match source polling intervals, tooltip strings, icon branches, and click behavior.
- [ ] Copilot footer state matches source `getCopilotClient -> initializePromise -> signedIn()` flow, primary status text, warning color branch, and connection error toast contract.
- [ ] RTC footer state matches source null gates, tooltip strings, popover shell, username heading copy, and input attributes.
- [ ] `cellDomProps(cellId, cellName)` attributes and `VerticalCell` root classes and read and edit render branches match source.
- [ ] cell action dropdown matches source group order, hidden and disabled rules, rename modal branch, and copy-link branch.
- [ ] editor root, language toggle overlay, selection ring, and theme values match source.
- [ ] hover action show and hide selectors match source CSS conditions.
- [ ] status rail states and tooltip strings match source.
- [ ] console output wrapper, hover toolbar, stale title, stdin prompt, and badge tokens match source.
- [ ] `.output-area`, `.stdout`, `.stderr`, `.return`, `.output`, and `.marimo-error` contracts match source.
- [ ] there are no guessed DOM nodes, guessed spacing values, or guessed state mappings left in the implementation.

### 15. Perfect Copy Plan

#### 15.1 Source Lock

- freeze parity work to the installed `marimo==0.21.0` assets listed in section `3` of `01-goal-rules-and-sources.md`
- treat `.__marimo_upstream/frontend/src/...` as readable support only after the section is mapped back to installed bundle evidence
- do not import marimo runtime or CSS into Codaro as implementation
- only recreate wrappers, class tokens, strings, ids, `data-testid`, and branch gates that are confirmed in those assets
- if a token or wrapper is not found in source, it is excluded until traced

#### 15.2 Shell Copy Order

Copy shell in this exact order so ownership boundaries do not blur:

1. `index.html` head tags, preload links, hidden mount tags, `window.__MARIMO_MOUNT_CONFIG__`, and `#portal`
2. `body -> #root -> .contents -> #app-chrome-body -> #app -> #App`
3. left rail and helper sidebar
4. developer panel and resize handles
5. filename bar and notebook width wrapper
6. top-right utility stack
7. bottom-right floating stack
8. footer shell and footer item primitive
9. notebook settings, save, recovery, shutdown, and feedback dialogs

#### 15.3 Cell Copy Order

Copy cells in this exact order so `VerticalCell` parity is not flattened:

1. `cellDomProps(cellId, cellName)` attribute helper
2. `marimo-cell` root class composition
3. read or kiosk branch gate
4. read branch child order `output above -> tray -> output below -> console`
5. `shouldHideCode(code, output)` hide helper
6. edit branch early-null gate
7. edit branch output surface
8. editor root and language toggle overlay
9. hover CSS gate and status rail
10. console output area and output surface tokens

#### 15.4 Primitive Rebuild Order

Rebuild the reusable primitives before wiring notebook pages:

1. notebook action button primitive from `.__marimo_upstream/frontend/src/components/editor/inputs/Inputs.tsx` and `Inputs.styles.ts`
2. text button primitive from `.__marimo_upstream/frontend/src/components/ui/button.tsx`
3. sidebar item primitive from `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/sidebar.tsx`
4. footer item primitive from `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-item.tsx`
5. filename input shell from `.__marimo_upstream/frontend/src/components/editor/header/filename-input.css`
6. notebook menu dropdown trigger and popover
7. app config and shutdown circle buttons
8. helper and developer resize handles

#### 15.5 Verification Gates

Parity cannot be claimed until all gates pass:

1. DOM gate
   - wrapper hierarchy, child order, ids, and `data-testid` match this PRD
2. token gate
   - class tokens, utility tokens, and color variants match traced source
3. branch gate
   - read/edit/kiosk/disconnected/disabled branches match traced source boundaries
4. primitive gate
   - sidebar, footer, action button, text button, filename, and resize handle primitives are source-backed
5. implementation gate
   - no vendor import fallback and no guessed wrapper remain in Codaro
6. build gate
   - frontend build passes after parity changes
