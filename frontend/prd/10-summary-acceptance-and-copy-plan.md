[Back to PRD Index](../PRD.md)

# 12. UI Inventory Summary

This file is the session-resume entry for the split frontend parity PRD.
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

- split PRD navigation is now explicit: `frontend/PRD.md` is the short index, `10-summary-acceptance-and-copy-plan.md` is the session-resume entry, and the section files link back into that resume path
- root shell, left rail, helper sidebar, developer panel, filename bar, footer, column chrome, banner stack, cell root, editor overlay, hover CSS, status rail, and output contracts have source-backed entries in this PRD
- `PanelsWrapper` and `ContextAwarePanel` now document top-level mount order, state atoms, pinned vs overlay branch, resize behavior, and slot ownership from upstream source
- find/replace overlay now documents its state atom, open/close gate, panel shell, replace/undo flow, and global search highlight wiring from upstream source
- `StatusOverlay` and `WrappedWithSidebar` now document top-left icon branches, noise/disconnected background, slot gate, desktop sidebar shell, and mobile sheet trigger from upstream source
- `Disconnected`, connection alerts, `FloatingAlert` or `Banner`, `PyodideLoader`, `LargeSpinner`, and `DynamicFavicon` now document their actual source branches instead of being left as parent-level inventory names
- `HideInKioskMode` and `ShowInKioskMode` now document their actual `kioskModeAtom` gate instead of only being mentioned as ownership notes
- shared `ErrorBanner` is now documented as a common primitive instead of being repeated as an unexplained error branch across panel sections
- the PRD source of truth has been shifted from installed `_static` chunks to upstream React or TS source under `.__marimo_upstream/frontend/src/...` wherever those files are now traced
- button primitives, button color variants, resize-handle CSS, filename hover and missing-filename shadows, bottom-right stack order, notebook menu inventory, and cell action dropdown group order are fixed from source
- app config popover, notebook settings form fields, user settings package manager field, share static notebook dialog, notebook menu footer, duplicate prompt, save or recovery filename flows, package install alert widgets, usage stats widgets, backend or LSP health, Copilot or AI or RTC footer states, footer item primitive, and console hover or stdin shell are now documented from upstream source instead of bundle reconstruction
- reorderable rail primitive, feedback modal shell, backend health button class, exact backend or LSP status strings, floating pending AI cells bar, and command palette overlay shell are now documented from source instead of inferred from screenshots
- helper sidebar `files`, `variables or data sources`, `dependencies`, `documentation`, `outline`, `packages`, `snippets`, and `AI chat or agents` panel bodies are now documented from source instead of inferred from screenshots
- developer panel `errors`, `scratchpad`, `tracing`, `secrets`, `logs`, `terminal`, and `cache` panel bodies are now documented from source instead of inferred from screenshots
- `write-secret-modal`, AI chat message-row and attachment shells, agent notification block registry, connection-change and error cards, plan or thought blocks, resource popovers, and tool-call accordions are now documented from source instead of inferred from screenshots
- dependency graph toolbar, settings popover, node or edge selection panel, minimap relation glyphs, file explorer prompts or delete dialog, duplicate naming, upload toasts, and remote preview metadata shell are now documented from source instead of inferred from screenshots
- selected local file detail lazy body, draft-cache behavior, running-notebook warning banner, local file save hotkey, dependency graph layout atoms, dagre layout config, graph node creation filters, custom node shell, and focused minimap path geometry are now documented from source instead of inferred from screenshots
- visible panel source blocks that still pointed at installed bundle chunks have now been switched to upstream `.__marimo_upstream/frontend/src/...` files across the traced visible edit UI
- recent cleanup also replaced many short bundle helper names in `file explorer`, `remote storage`, `notebook menu`, `controls`, `app config`, `cell action dropdown`, `console output`, `status rail`, and `machine stats` sections with upstream component or helper names
- top-level `EditPage -> AppChrome/EditApp -> LazyCommandPalette` branching, `EditApp` composition, `AppContainer` shell, `AppHeader` disconnected branch, and `CellsRenderer` layout override path are now documented from upstream source instead of bundle aliases
- command palette overlay is now documented beyond shell level, including recents sourcing, hotkey and notebook action flattening, group order, and per-item select behavior
- command palette supporting primitives now also document `smartMatchFilter`, `cmdk-input-wrapper`, list/group/item class tokens, disabled-token replacement, HTML-escaped values, and notebook-menu label-row child order from upstream source
- multi-cell selection toolbar and its pending-delete confirmation bar are now documented from upstream source, including action group order, disabled rules, overflow dropdown, and selection-clear behavior
- column footer `AddCellButtons` is now documented at branch level, including `createNewCell` payloads for Python or Markdown or SQL, the `maybeAddMarimoImport` pre-create side effect, and the AI-disabled redirect path to `handleClick("ai", "ai-providers")`
- notebook body contract now also documents `vertical-layout.tsx` read-mode action dropdown, empty-notebook alert, `groupCellsByColumn`, `showCode/canShowCode` gates, `shouldHideCode`, `FloatingOutline` hover-slide shell, and `ReadonlyCode` overlay buttons from source
- footer shell now documents `ConnectingKernelIndicatorItem`, issue-count derivation, `getCopilotClient -> initializePromise -> signedIn()` flow, and RTC username popover structure from upstream source rather than bundle aliases
- feedback dialog now documents its current source reality: informational prose only, fire-and-forget submit transport, and no rendered rating or message controls despite the submit handler reading both keys
- share static notebook dialog now documents URL derivation, copy-button tooltip lifecycle, and the source fallthrough where an upload error toast is followed by the success toast in the same handler
- shutdown and save or recovery flows now document `isWasm()` shutdown hiding, destructive confirm action wiring, delayed `window.close()`, `beforeunload` protection, `format_on_save`, empty-notebook save guard, and the exact serialized save payload keys
- variables panel mount ownership is now documented, including the fact that visible chrome mounts `session-panel.tsx` rather than the standalone `variable-panel.tsx`
- AI chat and agent sections now document nested visible widgets such as history popover rows, reasoning accordion, footer action buttons, session tabs, agent selector dropdown branches, model selector, agent docs cards, scroll-to-bottom button, and tool-call accordion status branches
- AI chat header/footer controls now also document `MCPStatusIndicator` and the nested `AIModelDropdown` provider/model menu branches from source
- AI message rendering and agent common primitives now also document `renderUIMessage` part mapping, `ConnectionStatus` badge branches, `PermissionRequest`, shared accordion shell, and `ReadyToChatBlock`
- helper sidebar panel primitives are now documented centrally, including `PanelAccordionItem`, `PanelAccordionTrigger`, `PanelAccordionContent`, `PanelBadge`, and `PanelEmptyState`
- documentation and outline panels now document `documentationAtom` render flow, `OutlineList` row classes, floating outline slide-in shell, minimap glyph sizing, and active-header observer behavior
- packages and logs panels now document install-form atom handoff, package action buttons, dependency-tree keyboard/aria behavior, and log row fragment formatting from source
- scratchpad history atoms, scratchpad action paths, tracing panel branch layout, Vega hover bridge, terminal websocket lifecycle, terminal command queue state, layout-select gate and icon mapping, package-alert missing/installing branches, cache-panel statistics/purge flow, backend-health connection-status atom, and menu-item primitive tokens are now documented from upstream source instead of inferred behavior
- bottom-right `KeyboardShortcuts` now documents its dialog portal ownership, duplicate-shortcut banner, editable-row capture rules, optimistic config save, and reset flows from upstream source
- editor contract now also documents `AiCompletionEditor`, RTC wait gate, completion banner and prompt row shells, and `LanguageAdapters.sql/markdown` source names instead of stale aliases
- shared AI completion handlers now document `Mod+Enter` accept, `Mod+Shift+Delete` decline, and the exact accept/reject button class tokens used by both editor and pending-AI surfaces
- output contract now also documents `OutputArea` null gates, `ExpandableOutput` fullscreen/expand buttons, mimebundle tab layout, console clear debounce, stdin response rows, `TextOutput`, `HtmlOutput`, `JsonOutput`, `MarimoTracebackOutput`, `MarimoErrorOutput`, and additional output CSS tokens directly from upstream source
- Codaro shipped product now treats the documentation slot as an explicit fork point: shell parity remains, but the rendered product panel is `Context Help` and external landing links rather than a full in-app docs viewer

- PRD 07 now documents: SortableCell wrapper (outline-hidden rounded-lg, drag handle, is-moving), CellLeftSideActions (TWO CreateCellButton at left-[-26px]), CreateCellButton dropdown (Python/Markdown/SQL/Setup with modifier-key trigger), CellToolbar (absolute right-2 -top-4 z-10, hover-action when !needsRun, RunButton + StopButton + CellActionsDropdown), CellRightSideActions (shoulder-right z-20, CellDragHandle, CellStatusComponent inline logic), shoulder-bottom DeleteButton, full Cell.css contract (border-radius 10px, divide-y, tray pseudo-elements, interactive/stale/disabled/needs-run/published/borderless states, CM editor padding with NO minHeight), hover contract corrected (display:none inside media query, show conditions OUTSIDE media query)
- PRD 02 corrected: LazyCommandPalette is CHILD of AppChrome (not sibling), EditApp structure shows AppHeader and CellsRenderer as children of AppContainer
- PRD 03 updated: sidebar explicitly states NO background color in light mode, full PanelGroup nested hierarchy documented (horizontal outer with vertical inner), ContextAwarePanel documented, resize handle hitAreaMargins/disabled/z-index differences, developer panel contract added
- PRD 04 updated: inner container m-auto and duplicated pb-24 documented, column resize handle pseudo-element hover area expansion and hover/column color states documented
- PRD 08 updated: AlertTriangleIcon warning count conditional text-yellow-500 class documented
- PRD 07 ToolbarItem CVA variants fully documented: default/stale/green/disabled/danger with exact class tokens from toolbar.tsx

- PRD 01 source list corrected: `sidebar.css` path fixed from `chrome/wrapper/sidebar/sidebar.css` to `renderers/vertical-layout/sidebar/sidebar.css`, 19 missing component files added (SortableCell, CreateCellButton, toolbar, cell-actions, footer-item, 6 footer-items status components, keyboard-shortcuts, cell-array, vertical-layout-wrapper, wrapped-with-sidebar, Inputs.styles.ts, button.tsx, edit-app.tsx), 22 missing CSS files added (Cell.css, App.css, common.css, globals.css, index.css, and 17 others), 6 file-tree internal files added, 11 output component files added
- PRD 03 files panel corrected: Refresh tooltip added as 5th of 7 toolbar buttons, MoreActionsButton `opacity-0 group-hover:opacity-100 transition-opacity` documented, drag-drop highlight `bg-accent/80` documented
- PRD 03 variables panel corrected: column structure changed from 5 flat columns to 3 columns with nested vertical sub-headers (Name | Type+Value | Declared By+Used By), each nested pair uses `div.flex.flex-col.gap-1`
- PRD 03 dependencies corrected: `hideReusableFunctions` description rewritten from nonsensical "lowercases to valid" to `runtime.serialization?.toLowerCase() === "valid"` with `&& !hasEdge` condition, edge dedup key documented as `${fromId}-${toId}` without direction (but final edge ID includes direction for VerticalElementsBuilder), Handle ID sharing documented (all nodes share `INPUTS_HANDLE_ID = "inputs"` and `OUTPUTS_HANDLE_ID = "outputs"`)
- PRD 03 tree contract expanded: Tree component props increased from 6 to 21 props matching react-arborist API
- packages, snippets, AI, developer panels, documentation, outline panels all verified 100% accurate against upstream source — no fixes needed

- PRD 05 corrected: RecoveryButton `className="rectangle"` vs `shape="rectangle"` source bug documented — source passes rectangle as literal className string instead of CVA shape variant
- PRD 06 corrected: `data-testid="install-package-manager-select"` fixed to actual `"package-manager-select"`, shared setting primitives added (`SettingTitle` with `text-md font-semibold text-muted-foreground uppercase tracking-wide mb-1`, `SettingSubtitle` with `text-base font-semibold underline-offset-2 text-accent-foreground uppercase tracking-wide`, `SettingGroup` vs `SettingSection` difference), `FormLabel className="shrink-0"` on Custom CSS and HTML Head fields, section 8.4 added documenting UserConfigForm tab-based layout structure with sidebar navigation and 7 tab categories
- PRD 09 verified 100% accurate against upstream source — all error banner, feedback dialog, backend/LSP health, share modal, package alerts, kiosk mode, StatusOverlay, PyodideLoader, DynamicFavicon, LargeSpinner, FloatingAlert contracts match exactly — no fixes needed

- all 10 PRD files (01-10) have now been verified against marimo upstream source

#### 12.2 Next Action

- continue sweeping for any remaining terse helper or icon aliases that survived in prose outside the latest source-backed sections, especially any visible widget still described at shell level instead of branch level
- continue filling the remaining low-depth visible areas that still read like inventory rather than branch contracts, especially small modal/popover support surfaces, footer micro-widgets, and any remaining read-only notebook support primitive not yet expanded
- continue checking top-level import graphs so any visible companion surface mounted by `EditApp`, `AppChrome`, `Footer`, or the layout renderers is either source-documented or explicitly marked non-visual
- keep the split PRD structure stable: add detailed contracts in `frontend/prd/*.md`, and keep `frontend/PRD.md` as the short index and session entrypoint
- continue turning modal shells, popover content, and block-level renderer branches into upstream-file-backed PRD entries until no visible marimo surface remains only inventory-level documented
- keep the PRD source-backed and docs-only for now; implementation port starts only after visible marimo frontend coverage is complete
- after PRD completion, port each contract into Codaro Svelte without vendor import fallback
- keep documenting Codaro fork points explicitly whenever shipped product behavior intentionally diverges from marimo source, starting with the documentation slot -> `Context Help`

#### 12.3 Verification Left

- confirm the `showChrome=false` branch still mounts the notebook page and command palette in the documented order
- confirm each PRD section source block points to upstream React or TS files when upstream exists, not to installed bundle chunks
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

- freeze parity work to the traced marimo assets listed in section `3`
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
