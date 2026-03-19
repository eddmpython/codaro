[Back to PRD Index](../PRD.md)

# 9. Cell, Editor, Hover, and Output Contract

[Resume from Summary](./10-summary-acceptance-and-copy-plan.md#121-current-state)

#### 9.1 Cell Root

Source:

- `.__marimo_upstream/frontend/src/components/editor/notebook-cell.tsx`
- `.__marimo_upstream/frontend/src/components/editor/common.ts`
- `.__marimo_upstream/frontend/src/components/editor/Output.tsx`

Root attributes:

- `data-cell-id`
- `data-cell-name`
- `id = HTMLCellId.create(cellId)`
- `tabIndex = -1`

Attribute helper contract:

- `cellDomProps(cellId, cellName)` returns
  - `{ "data-cell-id": cellId, "data-cell-name": cellName, id: HTMLCellId.create(cellId) }`

Always-on classes:

- `marimo-cell`
- `hover-actions-parent`
- `z-10`

Conditional classes (EditableCellComponent):

- `interactive` — always true in edit mode
- `needs-run` when `cellData.edited || cellRuntime.interrupted || (cellRuntime.staleInputs && !disabledOrAncestorDisabled)`
- `has-error` when `cellRuntime.errored`
- `stopped` when `cellRuntime.stopped`
- `disabled` when `cellData.config.disabled`
- `stale` when `cellRuntime.status === "disabled-transitively"`
- `borderless` when `isMarkdownCodeHidden && hasOutput && !navigationProps["data-selected"]`

Conditional classes (ReadonlyCellComponent):

- `published` — always true in read mode

Focus ring (edit mode):

- `focus:ring-1 focus:ring-(--slate-8) focus:ring-offset-2`

Selection ring (from navigation props):

- `data-[selected=true]:ring-1`
- `data-[selected=true]:ring-(--blue-8)`
- `data-[selected=true]:ring-offset-1`

#### 9.1.1 SortableCell Wrapper Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/SortableCell.tsx`

SortableCell is the outermost wrapper around every cell in edit mode. The `marimo-cell` div is a child inside SortableCell.

SortableCell root element:

- `div`
- `tabIndex={-1}`
- base class: `outline-hidden rounded-lg`
- adds `is-moving` class when `Boolean(transform)` is true
- `data-is-dragging={isDragging}`
- `style.position = "relative"`
- `style.zIndex = 2` when dragging, `undefined` otherwise
- `style.transform` computed from `CSS.Transform.toString(...)`, x constrained to 0 when `!canMoveX`
- merges ref from parent and `setNodeRef` from `useSortable`

SortableCell children:

- `DragHandleSlot.Provider` wrapping all children

Drag handle contract:

- `CellDragHandle` renders via `React.use(DragHandleSlot)` context
- drag handle element:
  - `div`
  - `data-testid="drag-button"`
  - class: `py-px cursor-grab opacity-50 hover:opacity-100 hover-action hover:bg-muted rounded border border-transparent hover:border-border active:bg-accent`
  - icon: `GripVerticalIcon strokeWidth={1} size={20}`
  - `onMouseDown={Events.preventFocus}`

EditableCellComponent full DOM tree:

```text
TooltipProvider
  CellActionsContextMenu
    SortableCell[tabIndex=-1, data-status, outline-hidden rounded-lg]
      div.marimo-cell.hover-actions-parent.z-10.interactive...[tabIndex=-1, cellDomProps]
        CellLeftSideActions
        if cellOutput === "above": outputArea || emptyMarkdownPlaceholder
        div.tray[data-has-output-above, data-hidden]
          StagedAICellBackground
          div.absolute.right-2.-top-4.z-10
            CellToolbar
          CellEditor
          CellRightSideActions
          div.shoulder-bottom.hover-action
            DeleteButton (if canDelete && isCellCodeShown)
        SqlValidationErrorBanner
        if cellOutput === "below": outputArea || emptyMarkdownPlaceholder
        if serialization: reusable definition footer
        ConsoleOutput
        PendingDeleteConfirmation
      StagedAICellFooter
      if isCollapsed: CollapsedCellBanner
```

#### 9.1.2 CellLeftSideActions Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/notebook-cell.tsx` (CellLeftSideActions)

Root wrapper:

- `div`
- class: `absolute flex flex-col justify-center h-full left-[-26px] z-20 border-b-0!`

Child structure — **two** CreateCellButton instances:

```text
div.absolute.flex.flex-col.justify-center.h-full.left-[-26px].z-20.border-b-0!
  div.-mt-1.min-h-7
    CreateCellButton (create above)
  div.flex-1.pointer-events-none.w-3
  div.-mb-2.min-h-7
    CreateCellButton (create below)
```

Above button props:

- `tooltipContent={renderShortcut("cell.createAbove")}`
- `onClick={createAbove}` where `createAbove = actions.createNewCell({ cellId, before: true, ...opts })`
- `oneClickShortcut="mod"`

Below button props:

- `tooltipContent={renderShortcut("cell.createBelow")}`
- `onClick={createBelow}` where `createBelow = actions.createNewCell({ cellId, before: false, ...opts })`
- `oneClickShortcut="mod"`

#### 9.1.3 CreateCellButton Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/cell/CreateCellButton.tsx`

Root primitive:

- `DropdownMenu` with controlled `open` state

Trigger:

- `DropdownMenuTrigger asChild={true}`
- inner: `Button`
  - `size="small"`
  - `data-testid="create-cell-button"`
  - class: `border-none hover-action shadow-none! bg-transparent! focus-visible:outline-none`
  - adds `inactive-button` when `isAppInteractionDisabled(connectionState)`
  - `onPointerDownCapture` handles modifier key detection
  - `onContextMenuCapture` opens dropdown on right-click

Trigger icon:

- `PlusIcon strokeWidth={1.8} size={14} className="opacity-60 hover:opacity-90"`
- wrapped in `Tooltip content={finalTooltipContent}`

Tooltip content:

- when disabled: connection tooltip string
- when enabled: shortcut + "for other cell types" sub-line with border-t

Click behavior:

- plain click: `addPythonCell()` -> `onClick({ code: "" })`
- modifier click (mod or shift): opens dropdown
- right-click: opens dropdown

Dropdown content:

- `DropdownMenuContent side="bottom" sideOffset={-30}`
- items in order:
  1. Python cell — icon `PythonIcon`, first item has justOpened guard
  2. Markdown cell — icon `MarkdownIcon`, calls `maybeAddMarimoImport` + `hideCode: MARKDOWN_INITIAL_HIDE_CODE`
  3. SQL cell — icon `DatabaseIcon size={13} strokeWidth={1.5}`, calls `maybeAddMarimoImport`
  4. Setup cell — icon `DiamondPlusIcon size={13} strokeWidth={1.5}`, calls `addSetupCellIfDoesntExist`
- icon wrapper: `div.mr-3.text-muted-foreground`

#### 9.1.4 CellToolbar Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/notebook-cell.tsx` (CellToolbar)
- `.__marimo_upstream/frontend/src/components/editor/cell/toolbar.tsx`

Position in DOM:

- `div.absolute.right-2.-top-4.z-10` wrapping `CellToolbar`

Toolbar root:

- `ReactAriaToolbar` (react-aria-components)
- class: `flex items-center gap-1 bg-background m-[2px] rounded-full`
- appends `hover-action` class when `!needsRun` (i.e. toolbar is hidden by default, visible on hover, but always visible when cell needs run)

Toolbar children order:

1. `RunButton` — props: `edited`, `onClick={onRun}`, `connectionState`, `status`, `config`, `needsRun`
2. `StopButton` — props: `status`, `connectionState`
3. `CellActionsDropdown` (when `includeCellActions`, default `true`)
   - trigger child: `ToolbarItem variant="green" tooltip={null} data-testid="cell-actions-button"`
   - icon: `MoreHorizontalIcon strokeWidth={1.5}`

ToolbarItem CVA variants:

- base: `rounded-full shadow-xs-solid border p-[5px] transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 [&>svg]:size-3 active:shadow-none bg-background`
- `default`: `hover:bg-accent hover:text-accent-foreground`
- `stale`: `bg-(--yellow-3) hover:bg-(--yellow-4) text-(--yellow-11)`
- `green`: `hover:bg-(--grass-2) hover:text-(--grass-11) hover:border-[var(--grass-7)]`
- `disabled`: `opacity-50 cursor-not-allowed`
- `danger`: `hover:bg-(--red-3) hover:text-(--red-11)`

ToolbarItem tooltip:

- `side="top"`
- `delayDuration={200}`
- `usePortal={false}`

#### 9.1.5 CellRightSideActions Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/notebook-cell.tsx` (CellRightSideActions)

Root:

- `div.shoulder-right.z-20`
- appends incoming `className`
- special case: adds `top-14` when `isMarkdownCodeHidden && cellOutput === "below"`

Children order:

- when `!isCellStatusInline`: `CellStatusComponent` (above drag handle)
- `div.flex.gap-2.items-end`
  - `CellDragHandle`
  - when `isCellStatusInline`: `CellStatusComponent` (inline with drag handle)

`isCellStatusInline` is `true` when markdown code is hidden and cell is too short (`height < 68px`) or `cellOutput === "below"`.

#### 9.1.6 Shoulder and Delete Button Contract

Source:

- `.__marimo_upstream/frontend/src/css/app/Cell.css`
- `.__marimo_upstream/frontend/src/components/editor/notebook-cell.tsx`

`shoulder-right` CSS:

- `display: inline-flex`
- `flex-direction: column`
- `justify-content: flex-end`
- `height: 100%`
- `position: absolute`
- `left: calc(100% + 12px)`
- `width: fit-content`
- `gap: 4px`

`shoulder-bottom` CSS:

- `position: absolute`
- `bottom: -2px`
- `right: 2px`

Delete button location:

- wrapped in `div.shoulder-bottom.hover-action`
- renders only when `canDelete && isCellCodeShown`
- disabled gate: does not fire when `loading || isAppInteractionDisabled(connection.state)`

#### 9.1.7 Cell CSS Full Contract

Source:

- `.__marimo_upstream/frontend/src/css/app/Cell.css`

`.marimo-cell` root styles:

- `position: relative`
- `border-radius: 10px`
- `max-width: inherit`
- `width: 100%`
- `border: 1px solid var(--gray-4)`
- `@apply divide-y divide-(--gray-5)`
- `@apply bg-background`

Hover state:

- `border-color: var(--gray-6)`

Focus-within z-index:

- `z-index: 20`

Hover z-index:

- `z-index: 30`

Focus-visible:

- `outline: none`

`.marimo-cell.interactive` styles:

- `.output-area, .console-output-area`: `max-height: 610px; overflow: auto`
- special table case: `.output-area:has(> .output > marimo-ui-element > marimo-table)` — `max-height: none; overflow: hidden`
- `> :first-child`: `border-top-left-radius: 9px; border-top-right-radius: 9px`
- `> :last-child`: `border-bottom-left-radius: 9px; border-bottom-right-radius: 9px`
- `&:focus-within`: `@apply shadow-md-solid shadow-shade`
- `.cm`: `border-radius: 8px`

`.marimo-cell.stale` and `.marimo-cell.disabled.stale`:

- `.output-area, .cm-gutters, .cm`: `background-color: var(--gray-2); opacity: 0.5`

`.marimo-cell.disabled`:

- `.output-area, .cm-gutters, .cm`: `background-color: var(--gray-1); opacity: 0.5`

`.marimo-cell.has-error:not(.needs-run)`:

- `@apply border-error/20 border-1 divide-error/20 outline-1 outline-error/20`

`.marimo-cell.needs-run`:

- `@apply border-stale border-1 divide-stale outline-1 outline-stale`
- hover: `@apply border-action-foreground/30 outline-action-foreground/30`
- focus-within: `@apply border-1 outline-0 divide-stale shadow-md-solid shadow-stale`
- `.RunButton`: `visibility: visible`

`.marimo-cell.published`:

- `border: none; box-shadow: none`
- `.output-area`: `display: block; padding-top: 0; padding-bottom: 0; border: none; box-shadow: none; overflow: visible`

`.marimo-cell.borderless`:

- `border-color: transparent`
- `> *`: `border-bottom: none`
- focus: `border: 1px solid var(--gray-4)`

Hidden data attribute siblings:

- `> [data-hidden="true"] ~ *`: `border-top: none`
- `> * ~ [data-hidden="true"]`: `border-top: none`

`.tray` styles:

- `display: flex; position: relative; z-index: 1`
- `&[data-has-output-above="false"] .cm-editor`: top corners `border-radius: 9px`
- `div[data-ai-input-open="true"] .cm-editor`: top corners `border-radius: 0`
- `&:last-child .cm-editor`: bottom corners `border-radius: 9px`
- hover area pseudo-elements `::before` and `::after`:
  - `width: var(--gutter-width); max-width: var(--gutter-width); height: 100%`
  - `::before left: calc(var(--gutter-width) * -1)`
  - `::after right: calc(var(--gutter-width) * -1)`

`.marimo-cell.is-moving .tray::before, .tray::after`:

- `display: none`

`:root --gutter-width`:

- `100px`

CM editor padding (inside `.marimo-cell .cm-editor`):

- `border: 1px solid transparent`
- `padding: 3px`
- `padding-right: 24px`
- `.cm-content`: `font-size: var(--marimo-code-editor-font-size, 0.9rem); font-family: var(--monospace-font)`
- NO `minHeight` on `.cm-content`

CM editor focused active line:

- `.cm-activeLineGutter`: `background: #e2f2ff`
- `.cm-activeLine:not(.cm-error-line)`: `background: hsl(210deg 100% 50% / 3%)`

Output area styles:

- `max-width: inherit; width: 100%; padding: 1rem`
- `clear: both; display: flow-root; overflow: auto`

Setup cell styles:

- `#cell-setup, #cell-setup .cm-editor, #cell-setup .cm-gutter`: `background-color: var(--gray-2)`

Dark mode cell overrides:

- `.dark .marimo-cell`: `@apply border-border`
- hover: `border: 1px solid var(--gray-9)`

Disconnected state:

- `#App.disconnected .marimo-cell`: `background-color: transparent`
- `.cell-running-icon, .cell-queued-icon, .elapsed-time`: `visibility: hidden; animation: none`

AI-generated cell glow:

- `&:has(.mo-ai-generated-cell)::before`: `box-shadow: 0px 0px 10px 0px var(--cyan-9); opacity: 0.5; border-radius: 10px`
- setup variant: `border-radius: 2px`

AI-deleted cell:

- `opacity: 0.7`
- `.output-area, .cm-gutters, .cm`: `background-color: var(--red-2)`
- `::before`: `box-shadow: 0px 0px 10px 0px var(--red-9); opacity: 0.6`
- `.cm-content`: `text-decoration: line-through; text-decoration-color: var(--red-9)`

#### 9.2 Cell Render Branches

Read or kiosk branch condition:

- `(mode === "read" && showCode) || (kiosk && mode !== "present")`

Read or kiosk branch order:

```text
div.marimo-cell...
  if cellOutputArea === "above"
    OutputArea.output-area
  if !shouldHideCode(code, output)
    div.tray
      ReadonlyCode(initiallyHideCode = config.hide_code || kiosk, code)
  if cellOutputArea === "below"
    OutputArea.output-area
  ConsoleOutput
```

Read branch output props:

- `allowExpand: true`
- `className: "output-area"`
- source passes `className: CSSClasses.outputArea`
- source also passes:
  - `output`
  - `cellId`
  - `stale`
  - `loading`

Read branch wrapper contract:

- wrapper is `div`
- wrapper keeps `tabIndex = -1`
- wrapper keeps `ref = cellRef`
- wrapper class is the root class composition from `className`
- wrapper spreads the exact object returned by `cellDomProps(cellId, cellName)`

Hide helper `shouldHideCode(code, output)` returns true when:

- `new MarkdownLanguageAdapter().isSupported(code) && output is non-empty`
- or `code.trim() === ""`

Read branch child gates:

- `U = cellOutputArea === "above" && L`
- `K = !shouldHideCode(code, output) && <div className="tray"><ReadonlyCode initiallyHideCode={config.hide_code || kiosk} code={code} /></div>`
- `V = cellOutputArea === "below" && L`
- console child is always appended as:
  - `ConsoleOutput({ consoleOutputs, stale, cellName, onSubmitDebugger: () => null, cellId, debuggerActive: false })`

Edit branch condition:

- standard edit mode after the read or kiosk early branch

Edit branch early null return when:

- `errored`
- `interrupted`
- `stopped`
- `isErrorMime(output?.mimetype)`

Edit branch wrapper contract:

- wrapper is `div`
- wrapper keeps `tabIndex = -1`
- wrapper keeps `ref = cellRef`
- wrapper class is the root class composition from `className`
- wrapper spreads the exact object returned by `cellDomProps(cellId, cellName)`

Edit branch child order:

- `OutputArea.output-area`

Edit branch output props:

- `allowExpand: mode === "edit"`
- `className: "output-area"`
- source passes `className: CSSClasses.outputArea`
- source also passes:
  - `output`
  - `cellId`
  - `stale`
  - `loading`

#### 9.2.1 Readonly Code Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/code/readonly-python-code.tsx`
- `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/vertical-layout.tsx`

Read-mode call contract from `vertical-layout.tsx`:

- read branch passes only:
  - `initiallyHideCode={config.hide_code || kiosk}`
  - `code={code}`
- implicit defaults remain:
  - `showHideCode = true`
  - `showCopyCode = true`
  - `language = "python"`
  - `insertNewCell = undefined`

Readonly root shell:

- `relative hover-actions-parent w-full overflow-hidden`
- appends incoming `className`

Local state:

- `const [hideCode, setHideCode] = useState(initiallyHideCode)`

Overlay child order:

```text
div.relative.hover-actions-parent...
  if showHideCode && hideCode
    HideCodeButton
  div.absolute.top-0.right-0.my-1.mx-2.z-10.hover-action.flex.gap-2
    if showCopyCode
      CopyButton
    if insertNewCell
      InsertNewCell
    if showHideCode && !hideCode
      EyeCloseButton
  CodeMirror
```

Hidden reveal button contract:

- source component:
  - `HideCodeButton`
- wrapper:
  - `div`
- click path:
  - `setHideCode(false)`
- icon primitive:
  - `EyeIcon`
- icon class:
  - `hover-action w-5 h-5 text-muted-foreground cursor-pointer absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80 hover:opacity-100 z-20`
- tooltip:
  - `Tooltip usePortal={false}`
  - `content="Show code"`

Toolbar shell:

- `absolute top-0 right-0 my-1 mx-2 z-10 hover-action flex gap-2`

Copy button contract:

- source component:
  - `CopyButton`
- click path:
  - `Events.stopPropagation(async () => { await copyToClipboard(text); toast({ title: "Copied to clipboard" }); })`
- tooltip:
  - `Tooltip content="Copy code" usePortal={false}`
- primitive:
  - `Button`
  - `size="xs"`
  - `variant="secondary"`
  - `className="py-0"`
- icon:
  - `CopyIcon size={14} strokeWidth={1.5}`

Hide button contract:

- source component:
  - `EyeCloseButton`
- tooltip:
  - `Tooltip content="Hide code" usePortal={false}`
- primitive:
  - `Button`
  - `size="xs"`
  - `variant="secondary"`
  - `className="py-0"`
- icon:
  - `EyeOffIcon size={14} strokeWidth={1.5}`
- click path:
  - `setHideCode(true)`

Insert-new-cell button contract:

- source component:
  - `InsertNewCell`
- tooltip:
  - `Tooltip content="Add code to notebook" usePortal={false}`
- primitive:
  - `Button`
  - `size="xs"`
  - `variant="secondary"`
  - `className="py-0"`
- icon:
  - `PlusIcon size={14} strokeWidth={1.5}`
- click path:
  - `useAddCodeToNewCell()(code)`

Readonly CodeMirror contract:

- primitive:
  - `CodeMirror`
- class composition:
  - `cn("cm", hideCode && "opacity-20 h-8 overflow-hidden")`
- theme branch:
  - dark -> `"dark"`
  - otherwise -> `"light"`
- props:
  - `height="100%"`
  - `editable={!hideCode}`
  - `readOnly={true}`
  - `value={code}`
- extension branch:
  - python -> `customPythonLanguageSupport(), EditorView.lineWrapping`
  - sql -> `sql(), EditorView.lineWrapping`

#### 9.3 Editor Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/cell/code/cell-editor.tsx`
- `.__marimo_upstream/frontend/src/components/editor/cell/code/language-toggle.tsx`
- `.__marimo_upstream/frontend/src/components/editor/ai/ai-completion-editor.tsx`
- `.__marimo_upstream/frontend/src/components/editor/ai/completion-handlers.tsx`

Editor shell ownership:

- exported editor component is `CellEditor`
- non-RTC export is `memo(CellEditorInternal)`
- RTC export is `WithWaitUntilConnected(memo(CellEditorInternal))`
- `CellEditorInternal` owns:
  - `AiCompletionEditor`
  - `CellCodeMirrorEditor`
  - `LanguageToggles`

Outer editor wrapper:

- `div.relative.w-full`
- wrapper carries the keyboard props returned by `useCellEditorNavigationProps(...)`
- language toggle overlay only renders when:
  - `!hidden`
  - `showLanguageToggles === true`

Editor root:

- `div.cm.mathjax_ignore`
- `data-testid="cell-editor"`
- class composition is `cn("cm mathjax_ignore", className)`

Hidden code class branches:

- when `languageAdapter === "markdown" && hidden && hasOutput`
  - `className = "h-0 overflow-hidden"`
- otherwise when `hidden`
  - `className = "opacity-20 h-8 [&>div.cm-editor]:h-full [&>div.cm-editor]:overflow-hidden [&_.cm-panels]:hidden"`
- otherwise
  - no extra hidden-class token is added

Hidden code interaction contract:

- `CellCodeMirrorEditor` handles `onDoubleClick`
- it only fires the reveal path when `hidden && showHiddenCode`
- reveal call is:
  - `showHiddenCode({ focus: true })`

Language toggle overlay:

```text
div.relative.w-full
  div.cm.mathjax_ignore[data-testid="cell-editor"]
  div.absolute.top-1.right-5
    div.absolute.right-3.top-2.z-20.flex.hover-action.gap-1
      button[data-testid="language-toggle-button"]
```

Language toggle button props:

- `variant: "text"`
- `size: "xs"`
- `className: "opacity-80 px-1"`
- tooltip string branch:
  - `View as SQL`
  - `View as Markdown`
  - `View as Python`
- button does not render when:
  - `!canSwitchToLanguage`
  - or `currentLanguageAdapter === toType`

Language toggle branch gates:

- SQL toggle renders only when:
  - `LanguageAdapters.sql.isSupported(code) || code.trim() === ""`
  - and `currentLanguageAdapter === "python"`
- Markdown toggle renders only when:
  - `LanguageAdapters.markdown.isSupported(code) || code.trim() === ""`
  - and `currentLanguageAdapter === "python"`
- Python toggle renders whenever current adapter is not already `python`

Language adapter sync contract:

- editor extension array pushes:
  - `ViewPlugin.define((view) => { const languageAdapter = view.state.field(languageAdapterState); setLanguageAdapter(languageAdapter.type); return { update(view) { const languageAdapter = view.state.field(languageAdapterState); setLanguageAdapter(languageAdapter.type); } }; })`
- source of truth for adapter type is the CodeMirror field `languageAdapterState`

Selection ring:

- `data-[selected=true]:ring-1`
- `data-[selected=true]:ring-(--blue-8)`
- `data-[selected=true]:ring-offset-1`
- selection wrapper is built by:
  - `mergeProps(focusWithinProps, keyboardProps, { "data-selected": isSelected, className: "data-[selected=true]:ring-1 data-[selected=true]:ring-(--blue-8) data-[selected=true]:ring-offset-1" })`

Editor reveal-on-focus contract:

- extension array pushes:
  - `EditorView.updateListener.of((update) => { if (update.selectionSet && update.state.selection.ranges.some((range) => range.from !== range.to)) showHiddenCode({ focus: false }); })`
  - `EditorView.domEventHandlers({ focus: () => { showHiddenCode({ focus: false }); } })`

Editor state hydration contract:

- fresh editor path:
  - `new EditorView({ state: EditorState.create({ doc: code, extensions }) })`
- serialized restore path:
  - `new EditorView({ state: EditorState.fromJSON(serializedEditorState, { doc: code, extensions }, { history: historyField }) })`
- non-RTC branch immediately forces language sync with:
  - `switchLanguage(editorView, { language: getInitialLanguageAdapter(editorView.state).type })`
- mount target replacement:
  - `editorViewParentRef.current.replaceChildren(editorView.dom)`

Light editor colors:

- `background: #ffffff`
- `foreground: #000000`
- `caret: #000000`
- `selection: #d7d4f0`
- `lineHighlight: #cceeff44`
- `gutterBackground: var(--color-background)`
- `gutterForeground: var(--gray-10)`

Dark editor colors:

- `background: var(--cm-background)`
- `foreground: #abb2bf`
- `caret: #528bff`
- `selection: #3E4451`
- `lineHighlight: #2c313c`
- `gutterBackground: var(--color-background)`
- `gutterForeground: var(--gray-10)`

Reactive reference styling:

- `.mo-cm-reactive-reference`
  - `font-weight: 400`
  - `border-bottom: 2px solid #bad3de`
- light text color:
  - `#005f87`
- dark text color:
  - `#2a7aa5`
- `.mo-cm-reactive-reference-hover`
  - `cursor: pointer`
  - `border-bottom-width: 3px`
- dark hover border:
  - `#4a90a5`

Tooltip parent:

- `document.querySelector("#App") ?? undefined`

Editor keyboard shell:

- `useCellEditorNavigationProps(cellId, editorViewRef)` handles escape from editor focus shell
- non-vim branch:
  - `Escape` exits editor focus shell
- vim branch:
  - hotkey `command.vimEnterCommandMode` exits editor focus shell
- exit path:
  - remove cell from edit set
  - call `focusCell(cellId)`
  - `raf2(() => { scrollCellIntoView(cellId); })`

RTC wait gate:

- `WithWaitUntilConnected` wraps the exported editor only when `isRtcEnabled()` is true
- waiting branch renders when:
  - `isAppConnecting(connection.state)`
  - or `rtcDoc === undefined`
- waiting shell:
  - `div.flex.h-full.w-full.items-baseline.p-4`
  - child `DelayMount milliseconds={1000} fallback={null}`
  - text `Waiting for real-time collaboration connection...`
  - trailing button:
    - `Button variant="link"`
    - label `Turn off real-time collaboration`
    - click path `setRtcDoc("disabled")`

AI completion editor contract:

- root source:
  - `AiCompletionEditor`
- root shell:
  - `div`
  - `data-ai-input-open={showInput}`
  - `className: "flex flex-col w-full rounded-[inherit]"`
- enable gate:
  - `enabled = aiCompletionCell?.cellId === cellId`
- staged prior-code branch:
  - when `stagedAICells.get(cellId)?.type === "update_cell"`
  - `previousCellCode = updatedCell.previousCode`
- completion transport:
  - `useCompletion`
  - `api = runtimeManager.getAiURL("completion").toString()`
  - `headers = runtimeManager.headers()`
  - `streamProtocol = "text"`
  - `experimental_throttle = 100`
- completion body fields:
  - `includeOtherCode: includeOtherCells ? getCodes(currentCode) : ""`
  - `code: currentCode`
  - `language: currentLanguageAdapter`
- error toast:
  - title `Completion failed`
  - description `prettyError(error)`
- finish normalization:
  - `setCompletion(completion.trimEnd())`
- input-focus bootstrap when enabled:
  - `retryWithTimeout(..., { retries: 3, delay: 100, initialDelay: 100 })`
  - focuses `inputRef.current.view`
  - calls `initialSubmit()` when `triggerImmediately`
  - then `selectAllText(inputRef.current?.view)`
- initial prompt sync:
  - on enable, `setInput(initialPrompt || "")`
- completion banner visibility:
  - `showCompletionBanner = enabled && triggerImmediately && (completion || isLoading)`
- input row visibility:
  - `showInput = enabled && (!triggerImmediately || showInputPrompt)`
- output area default:
  - `below`

Prompt row shell:

- wrapper class:
  - `flex items-center gap-2 px-3 transition-all rounded-[inherit] rounded-b-none duration-300`
- open branch adds:
  - `max-h-[400px] border-b min-h-11 visible`
- closed branch adds:
  - `max-h-0 min-h-0 invisible`
- leading icon:
  - `SparklesIcon className="text-(--blue-10) shrink-0" size={16}`
- prompt input primitive:
  - `PromptInput`
  - `className: "h-full my-0 py-2 flex items-center"`
  - close path:
    - `declineChange()`
    - `setCompletion("")`
  - submit path:
    - when not loading, optionally `storePrompt(inputRef.current.view)`
    - then `handleSubmit()`
  - keydown bridge:
    - `createAiCompletionOnKeydown(...)`
    - `Mod+Enter` accepts when `!isLoading && hasCompletion`
    - `Mod+Shift+Delete` or `Mod+Shift+Backspace` declines
- right action column:
  - wrapper `div.-mr-1.5.py-1.5`
  - action row `div.flex.flex-row.items-center.justify-end.gap-0.5`
  - child order:
    - `SendButton`
    - `AddContextButton`
    - `AIModelDropdown`
  - dropdown props:
    - `triggerClassName: "h-7 text-xs"`
    - `iconSize: "small"`
    - `forRole: "edit"`
    - `displayIconOnly: true`
    - `placeholder: "Edit model"`
- completion buttons row:
  - renders only when `completion`
  - wrapper `div.mt-1.flex.items-center.gap-1`
- divider:
  - `div.h-full.w-px.bg-border.mx-2`
- include-other-cells checkbox:
  - wrapper `Tooltip content="Include code from other cells"`
  - row `div.flex.flex-row.items-start.gap-1.overflow-hidden`
  - checkbox testid `include-other-cells-checkbox`
  - label `All code`
- prompt-row decline button:
  - `data-testid="decline-completion-button"`
  - `variant="text"`
  - `size="icon"`
  - icon `XIcon className="text-(--red-10)" size={16}`
  - click path:
    - `stop()`
    - `declineChange()`
    - `setCompletion("")`

Completion editor body:

- merge editor renders when:
  - `completion && enabled`
  - or `!completion && previousCellCode`
- merge primitive:
  - `CodeMirrorMerge className="cm" theme={theme}`
  - `Original` pane:
    - `value={originalCode}`
    - `extensions={baseExtensions}`
    - `onChange={onChange}`
  - `Modified` pane:
    - `value={modifiedCode}`
    - `editable={false}`
    - `readOnly={true}`
    - `extensions={baseExtensions}`
- fallback children render only when:
  - `(!completion || !enabled) && !previousCellCode`

Completion banner contract:

- outer wrapper:
  - `div.w-full.bg-(--cm-background).flex.justify-center.transition-all.duration-300.ease-in-out.overflow-hidden`
- visible branch adds:
  - `max-h-20 opacity-100 translate-y-0`
- hidden branch adds:
  - `max-h-0 opacity-0 -translate-y-2`
- banner shell:
  - `flex flex-row items-center gap-6 rounded-md py-2 px-2.5 text-sm border border-border`
  - glow `shadow-[0_0_6px_1px_rgba(34,197,94,0.15)]`
- status icon branch:
  - loading -> `Loader2Icon className="animate-spin text-blue-600 mb-px" size={15} strokeWidth={2}`
  - generated -> `CircleCheckIcon className="text-green-600 mb-px" size={15} strokeWidth={2}`
- status copy:
  - loading -> `Generating fix...`
  - generated -> `Showing fix`
- show-prompt toggle row:
  - `Label` text `Show prompt`
  - `Switch size="xs"`
- action row:
  - `div.flex.flex-row.items-center.gap-2.ml-auto`
  - child order:
    - `AcceptCompletionButton`
    - `RejectCompletionButton`

Shared completion action buttons:

- `AcceptCompletionButton`
  - label:
    - single -> `Accept`
    - multiple -> `Accept all`
  - base classes:
    - `h-6 text-(--grass-11) bg-(--grass-3)/60 hover:bg-(--grass-3) dark:bg-(--grass-4)/80 dark:hover:bg-(--grass-3) font-semibold active:bg-(--grass-5) dark:active:bg-(--grass-4) border-(--green-6) border hover:shadow-xs`
  - with `runCell`:
    - outer wrapper `div.flex`
    - left button `rounded-r-none`
    - right play button `rounded-l-none px-1.5`
    - right tooltip:
      - multiple -> `Accept and run all cells`
      - single -> `Accept and run cell`
    - play icon `PlayIcon className="h-2.5 w-2.5"`
  - without `runCell`:
    - single button `rounded px-3`
  - optional hotkey render:
    - `MinimalHotkeys className="ml-1 inline"`
- `RejectCompletionButton`
  - label:
    - single -> `Reject`
    - multiple -> `Reject all`
  - base classes:
    - `h-6 text-(--red-10) bg-(--red-3)/60 hover:bg-(--red-3) dark:bg-(--red-4)/80 dark:hover:bg-(--red-3) rounded px-3 font-semibold active:bg-(--red-5) dark:active:bg-(--red-4) border-(--red-6) border hover:shadow-xs`
  - `borderless` add-on:
    - `border-none rounded-md`
  - optional hotkey render:
    - `MinimalHotkeys className="ml-1 inline"`

#### 9.3.1 Cell Action Dropdown Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/actions/useCellActionButton.tsx`
- hook `useCellActionButtons`

Group construction contract:

- the function returns grouped action arrays
- each group is filtered by:
  - `group.filter((action) => !action.hidden)`
- empty groups are removed by:
  - `filter((group) => group.length > 0)`

Guard contract:

- returns `[]` when `!cell`
- returns `[]` when `kioskMode` is truthy

Derived state gates:

- `isSetupCell = cellId === SETUP_CELL_ID`
- run-hidden gate:
  - `status === "running" || status === "queued" || status === "disabled-transitively" || config.disabled`

Exact action group order:

- group 1:
  - `Run cell`
  - `Refactor with AI`
  - `Split`
  - `Format`
  - `Show code` or `Hide code`
  - `Enable execution` or `Disable execution`
- group 2:
  - `Convert to Markdown`
  - `Convert to SQL`
  - `Toggle as Python`
- group 3:
  - `Create cell above`
  - `Create cell below`
  - `Move cell up`
  - `Move cell down`
  - `Move cell left`
  - `Move cell right`
  - `Send to top`
  - `Send to bottom`
  - `Break into new column`
- group 4:
  - `Export output as PNG`
  - `Clear output`
- group 5:
  - `Name`
  - `Copy link to cell`
- group 6:
  - `Delete`

Group 1 item rules:

- `Run cell`
  - icon `PlayIcon`
  - hotkey `cell.run`
  - hidden when the run-hidden gate is true
  - `redundant: true`
- `Refactor with AI`
  - icon `SparklesIcon`
  - hotkey `cell.aiCompletion`
  - hidden when `!aiEnabled`
- `Split`
  - icon `ScissorsIcon`
  - hotkey `cell.splitCell`
- `Format`
  - icon `Code2Icon`
  - hotkey `cell.format`
- code visibility toggle
  - `Hide code` uses icon `EyeOffIcon`
  - `Show code` uses icon `EyeIcon`
  - hotkey `cell.hideCode`
- execution toggle
  - `Disable execution` uses icon `ZapIcon`
  - `Enable execution` uses icon `ZapOffIcon`
  - hidden when `isSetupCell`

Group 2 item rules:

- `Convert to Markdown`
  - icon `MarkdownIcon`
  - hotkey `cell.viewAsMarkdown`
  - hidden when `isSetupCell`
  - source branch also forces `hide_code: true` when code is visible
- `Convert to SQL`
  - icon `DatabaseIcon`
  - hidden when `isSetupCell`
- `Toggle as Python`
  - icon `PythonIcon`
  - hidden when `isSetupCell`

Group 3 item rules:

- `Create cell above`
  - multi icon `MultiIcon(PlusCircleIcon + ChevronUpIcon)`
  - hotkey `cell.createAbove`
  - hidden when `isSetupCell`
  - `redundant: true`
- `Create cell below`
  - multi icon `MultiIcon(PlusCircleIcon + ChevronDownIcon)`
  - hotkey `cell.createBelow`
  - `redundant: true`
- `Move cell up`
  - icon `ChevronUpIcon`
  - hotkey `cell.moveUp`
  - hidden when `isSetupCell`
- `Move cell down`
  - icon `ChevronDownIcon`
  - hotkey `cell.moveDown`
  - hidden when `isSetupCell`
- `Move cell left`
  - icon `ChevronLeftIcon`
  - hotkey `cell.moveLeft`
  - hidden when `appWidth !== "columns" || isSetupCell`
- `Move cell right`
  - icon `ChevronRightIcon`
  - hotkey `cell.moveRight`
  - hidden when `appWidth !== "columns" || isSetupCell`
- `Send to top`
  - icon `ChevronsUpIcon`
  - hotkey `cell.sendToTop`
  - hidden when `isSetupCell`
- `Send to bottom`
  - icon `ChevronsDownIcon`
  - hotkey `cell.sendToBottom`
  - hidden when `isSetupCell`
- `Break into new column`
  - icon `Columns2Icon`
  - hotkey `cell.addColumnBreakpoint`
  - hidden when `appWidth !== "columns" || isSetupCell`

Group 4 item rules:

- `Export output as PNG`
  - icon `ImageIcon`
  - hidden when `!hasOutput`
- `Clear output`
  - icon `XCircleIcon`
  - hidden when `!(hasOutput || hasConsoleOutput)`

Group 5 item rules:

- `Name`
  - icon `TextCursorInputIcon`
  - `disableClick: true`
  - hidden when `isSetupCell`
  - rightElement:
    - inline name input placeholder `cell name`
  - headless modal title:
    - `Rename cell`
  - headless modal label:
    - `Cell name`
- `Copy link to cell`
  - icon `LinkIcon`
  - disabled when `!canLinkToCell(name)`
  - disabled tooltip:
    - `Only named cells can be linked to`
  - success toast:
    - description `Link copied to clipboard`

Group 6 item rules:

- `Delete`
  - icon `Trash2Icon`
  - `variant: "danger"`
  - hidden when `!canDelete`

#### 9.4 Hover Contract

Source:

- `.__marimo_upstream/frontend/src/css/common.css`

Hover behavior is CSS contract only.

Hidden-by-default (inside `@media (hover: hover) and (pointer: fine)`):

- `.hover-action` -> `display: none !important`
- `[data-is-dragging="true"] .hover-actions-parent.hover-actions-parent .hover-action:not(:hover)` -> `display: none !important`

Show conditions (OUTSIDE media query — always apply):

- `.hover-action:hover` -> `display: inline-flex !important`
- `.hover-action:focus` -> `display: inline-flex !important`
- `.hover-actions-parent:hover .hover-action` -> `display: inline-flex !important`
- `.hover-actions-parent:focus .hover-action` -> `display: inline-flex !important`
- `.hover-actions-parent:has([data-state="open"]) .hover-action` -> `display: inline-flex !important`

Fullscreen gate (OUTSIDE media query):

- `:root:has(:fullscreen) .hide-on-fullscreen` -> `display: none !important`

Additional common.css tokens:

- `.mo-dropdown-icon`: `@apply mr-2 h-3.5 w-3.5 text-muted-foreground/70`
- `.scrollbar-thin`: `scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track)`

#### 9.5 Status Rail

Source:

- `.__marimo_upstream/frontend/src/components/editor/cell/CellStatus.tsx`
- `.__marimo_upstream/frontend/src/components/editor/cell/cell-status.css`

Common classes:

- `.cell-status-icon`
  - `margin-top: 4px`
  - `margin-bottom: auto`
  - `margin-left: 3px`
- `.elapsed-time`
  - `color: var(--gray-11)`
  - `font-family: var(--monospace-font)`
  - `font-size: .75rem`
- `#App.disconnected .elapsed-time`
  - `visibility: hidden`
- `.cell-status-stale`
  - `color: var(--gray-10)`

Required hook:

- `data-testid="cell-status"`

Status DOM variants:

- `disabled`
- `disabled-transitively`
- `running`
- `queued`
- `outdated`
- `idle`

Required `data-status` values:

- `disabled`
- `disabled-transitively`
- `running`
- `queued`
- `outdated`
- `idle`

Tooltip strings:

- `This cell is stale, but it's disabled and can't be run`
- `This cell is disabled`
- `An ancestor of this cell is disabled, so it can't be run`
- `This cell is running`
- `This cell is queued to run`
- `This cell is stale, but an ancestor is disabled so it can't be run`
- `This cell was interrupted when it was last run`
- `This cell has been modified since it was last run`
- `This cell has not been run with the latest inputs`
- `This cell has not yet been run`
- idle and outdated tooltip detail rows include:
  - `This cell took ${elapsed} to run`
- interrupted outdated tooltip detail includes:
  - `This cell ran for ${elapsed} before being interrupted`

Elapsed time format:

- `>= 60s` -> `XmYs`
- `>= 1s` -> `x.toFixed(2)s`
- otherwise -> `Xms`

Status DOM and class contracts:

- stale disabled branch:
  - root class `cell-status-icon cell-status-stale`
  - `data-status="stale"`
  - icon stack:
    - `ban` icon `h-5 w-5`
    - `refresh` icon `h-3 w-3`
- disabled branch:
  - root class `cell-status-icon cell-status-disabled`
  - `data-status="disabled"`
  - icon:
    - `ban` icon `h-5 w-5`
- disabled-transitively branch without stale inputs:
  - root class `cell-status-icon cell-status-stale`
  - `data-status="disabled-transitively"`
  - icon stack:
    - `workflow` icon `h-5 w-5`
    - `ban` icon `h-3 w-3`
- disabled-transitively branch with stale inputs:
  - root class `cell-status-icon cell-status-stale`
  - `data-status="stale"`
  - icon stack:
    - `refresh` icon `h-5 w-5`
    - `ban` icon `h-3 w-3`
- running branch:
  - root class `cell-status-icon elapsed-time running`
  - `data-status="running"`
- queued branch:
  - root class `cell-status-icon cell-status-queued`
  - `data-status="queued"`
  - icon:
    - `ellipsis` icon `h-5 w-5`
- outdated branch:
  - stale icon root:
    - `cell-status-stale`
    - `data-status="outdated"`
  - elapsed badge root:
    - `elapsed-time hover-action`
    - `data-status="outdated"`
  - combined wrapper:
    - `cell-status-icon flex items-center gap-2`
- idle branch:
  - elapsed badge root:
    - `cell-status-icon elapsed-time hover-action`
    - `data-status="idle"`

Last-run time contract:

- source uses `runStartTimestamp ?? lastRunStartTimestamp`
- last-run tooltip starts with:
  - `Ran at`
- same-day timestamp format options:
  - `hour: "numeric"`
  - `minute: "numeric"`
  - `second: "numeric"`
  - `fractionalSecondDigits: 3`
  - `hour12: true`
- non-same-day timestamp format options:
  - `month: "numeric"`
  - `day: "numeric"`
  - `hour: "numeric"`
  - `minute: "numeric"`
  - `second: "numeric"`
  - `fractionalSecondDigits: 3`
  - `hour12: true`
- relative suffix shell:
  - `span.text-muted-foreground`
  - content `(${distance} ago)`

#### 9.6 Console Output Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/output/console/ConsoleOutput.tsx`

Wrapper ownership:

- exported `ConsoleOutput` is an `ErrorBoundary` wrapper around `ConsoleOutputInternal`

Clear debounce contract:

- `CONSOLE_CLEAR_DEBOUNCE_MS = 200`
- `useDebouncedConsoleOutputs(outputs)` behavior:
  - non-empty output arrays apply immediately
  - transitions to empty wait `200ms`
  - pending clear timeout is cancelled when new output arrives first

Wrapper:

- `relative group`
- auto-scroll effect:
  - when `scrollHeight - clientHeight - scrollTop < 120`, scrolls to bottom after layout

Early null gate:

- returns `null` when `!hasOutputs && isInternalCellName(cellName)`

Hover toolbar:

- `absolute top-1 right-4 z-10 opacity-0 group-hover:opacity-100 flex items-center gap-1 print:hidden`

Hover toolbar item order:

- copy console output control
  - component `CopyClipboardIcon`
  - tooltip `Copy console output`
  - class `h-4 w-4`
- wrap text toggle
  - tooltip branch:
    - `Wrap text`
    - `Disable wrap text`
  - control:
    - `ToggleButton`
  - `aria-label: "Toggle text wrapping"`
  - class:
    - `p-1 rounded bg-transparent text-muted-foreground data-hovered:text-foreground data-selected:text-foreground`
  - icon:
    - `WrapTextIcon`
    - `className: "h-4 w-4"`
- collapse or expand button
  - renders only when `isOverflowing || isExpanded` is truthy
  - root primitive:
    - `Button`
  - `size: "xs"`
  - `variant: null`
  - `className: "p-0 mb-px"`
  - `aria-label` branch:
    - `Collapse output`
    - `Expand output`
  - tooltip branch:
    - `Collapse output`
    - `Expand output`
  - collapse icon:
    - `ChevronsDownUpIcon`
    - `className: "h-4 w-4"`
  - expand icon:
    - `ChevronsUpDownIcon`
    - `className: "h-4 w-4 "`

Required hook:

- `data-testid="console-output-area"`

Console area class:

- `console-output-area overflow-hidden rounded-b-lg flex flex-col-reverse w-full gap-1 focus:outline-hidden`

State classes:

- `marimo-output-stale`
- non-empty padding:
  - `p-5`
- empty-ish padding:
  - `p-3`

Rendered output order contract:

- source renders `const reversedOutputs = [...consoleOutputs].reverse()`
- `isPdb` gate:
  - `reversedOutputs.some((output) => typeof output.data === "string" && output.data.includes("(Pdb)"))`
- `lastStdInputIdx` gate:
  - `reversedOutputs.findIndex((output) => output.channel === "stdin")`
- `channel === "pdb"` returns `null`
- `channel === "stdin"` uses interactive prompt branch `StdInput` only when `response == null` and it is the first pending stdin in reversed order
- all other `stdin` rows render `StdInputWithResponse`
- all other channels render `OutputRenderer`

Root attributes and stale handling:

- root `title` becomes `This console output is stale` when stale
- root `ref = ref`
- root spreads `useSelectAllContent(hasOutputs)` keyboard handler props
  - root `tabIndex = 0`
- expanded style branch:
  - `style = { maxHeight: "none" }` when expanded

Reply badge class:

- `bg-(--slate-4) border-(--slate-4) hover:bg-(--slate-5) dark:border-(--sky-5) dark:bg-(--sky-6) dark:text-(--sky-12) text-(--slate-12) rounded-l rounded-br-lg absolute right-0 bottom-0 text-xs px-1.5 py-0.5 font-mono max-w-[75%] whitespace-nowrap overflow-hidden`

Copy payload contract:

- `getOutputString()`:
  - filters out `channel === "pdb"`
  - maps each output through `processOutput(output)`
  - joins with `"\n"`

Select-all keyboard helper from `useSelectAllContent(nonEmpty)`:

- active only when console output is non-empty
- `Ctrl/Cmd + A` selects the current console area contents

Interactive stdin prompt contract:

- wrapper:
  - `div.flex.gap-2.items-center.pt-2`
- input testid:
  - `data-testid="console-input"`
- blocking attr:
  - `data-stdin-blocking="true"`
- type branch:
  - `password`
  - `text`
- attrs:
  - `autoComplete: "off"`
  - `autoFocus: true`
- class:
  - `m-0 h-8 focus-visible:shadow-xs-solid`
- icon:
  - `ChevronRightIcon className="w-5 h-5"`
- placeholder:
  - `stdin`
- key handling:
  - `ArrowUp` -> history up
  - `ArrowDown` -> history down
  - `Enter` without shift -> submit, add to history, clear input
  - `Meta+Enter` -> prevent default and stop propagation
- debugger branch:
  - when `isPdb`, appends `DebuggerControls`

Stdin response shell:

- source component:
  - `StdInputWithResponse`
- wrapper:
  - `div.flex.gap-2.items-center`
- prompt text render:
  - `RenderTextWithLinks`
- response render gate:
  - hidden when `isPassword`
- response text class:
  - `text-(--sky-11)`

#### 9.7 Output Surface Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/Output.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/Outputs.css`

OutputArea null gates:

- returns `null` when `output === null`
- returns `null` when `output.channel === "output" && output.data === ""`

OutputArea container selection:

- `allowExpand ? ExpandableOutput : Div`
- stale title:
  - `This output is stale`
- root id:
  - `CellOutputId.create(cellId)`
- root class composition:
  - `stale && "marimo-output-stale"`
  - `loading && "marimo-output-loading"`
  - incoming `className`
- child renderer:
  - `OutputRenderer cellId={cellId} message={output}`

Expandable output shell:

- outer structure:

```text
<>
  div
    div.relative.print:hidden
      div.absolute.-right-9.top-1.z-1.flex.flex-col.gap-1
        fullscreen button?
        expand button?
    div[data-cell-role=\"output\"]
  div.increase-pointer-area-x.contents.print:hidden
</>
```

- output root attrs:
  - `data-cell-role="output"`
  - `ref={containerRef}`
- output root class:
  - `relative fullscreen:bg-background fullscreen:flex fullscreen:items-center fullscreen:justify-center fullscreen:items-center-safe`
- expanded style branch:
  - `style = { maxHeight: "none" }` when `isExpanded || forceExpand`

Fullscreen button contract:

- render gate:
  - `hasFullscreen`
- tooltip:
  - `content="Fullscreen"`
  - `side="left"`
- primitive:
  - `Button`
  - `data-testid="fullscreen-output-button"`
  - `size="xs"`
  - `variant="text"`
  - `className="hover-action hover:bg-muted p-1 hover:border-border border border-transparent"`
- mouse handling:
  - `onMouseDown={Events.preventFocus}`
- click path:
  - `await containerRef.current?.requestFullscreen()`
- icon:
  - `ExpandIcon className="size-4 opacity-60 hover:opacity-80" strokeWidth={1.25}`

Expand button contract:

- render gate:
  - `(isOverflowing || isExpanded) && !forceExpand`
- primitive:
  - `Button`
  - `data-testid="expand-output-button"`
  - `size="xs"`
  - `variant="text"`
- class composition:
  - base `hover:border-border border border-transparent hover:bg-muted`
  - adds `hover-action` only when `!isExpanded`
- click path:
  - `setIsExpanded(!isExpanded)`
- expanded branch:
  - tooltip `Collapse output`
  - icon `ChevronsDownUpIcon className="h-4 w-4"`
- collapsed branch:
  - tooltip `Expand output`
  - icon `ChevronsUpDownIcon className="h-4 w-4 opacity-60"`

Mimebundle contract:

- metadata key:
  - `__metadata__`
- `MimeBundleOutputRenderer` first:
  - filters metadata out of entries
  - runs `processMimeBundle(rawEntries)`
- null gate:
  - returns `null` when no mime entries survive
- single-entry branch:
  - renders `OutputRenderer` directly with `metadata?.[first]`
- multi-entry branch:
  - `Tabs defaultValue={first} orientation="vertical"`
  - outer wrapper `div.flex`
  - tabs list class:
    - `self-start max-h-none flex flex-col gap-2 mr-3 shrink-0`
    - adds `mt-4` when `mode === "present" || mode === "read"`
  - trigger class:
    - `flex items-center space-x-2`
  - trigger tooltip:
    - `delayDuration={200}`
    - `content={mime}`
    - `side="right"`
  - trigger icon ownership:
    - `renderMimeIcon(mime)`
  - content wrapper:
    - `div.flex-1.w-full`
  - each `TabsContent` wraps `OutputRenderer` in `ErrorBoundary`

Required token:

- `output-area`

Width contract:

- `.marimo-error`
- `.media`
- `.output`
- `.return`
- `.stderr`
- `.stdout`
  - all `width: 100%`

Published output rhythm:

- `.marimo-cell.published .output-area .output`
  - `margin-top: 1rem`
  - `margin-bottom: 1rem`

Stdout and stderr typography:

- `font-family: var(--monospace-font)`
- `font-size: .813rem`

Error output:

- `color: var(--error)`
- `white-space: pre-wrap`
- `background: #ffc0cb30`
- `border-radius: 20px`
- `padding: 3%`
- `font-size: .8125rem`
- `font-weight: 700`

Additional output CSS contracts:

- `.output`
  - `position: relative`
- `.output > *`
  - `max-width: 100%`
- `.output .markdown`
  - `max-width: unset`
- `.stderr`
  - `color: var(--amber-12)`
- `.marimo-error a`
  - `@apply text-link`
- `.marimo-json-output`
  - `padding-top: 2px`
  - `padding-bottom: 2px`
  - `content-visibility: unset`
  - `overflow: auto`
  - `@apply text-xs`
- `.marimo-json-output .copy-button`
  - `@apply invisible`
- `.marimo-json-output .data-key-pair:hover > .copy-button`
  - `@apply visible`
- `.marimo-json-output .data-key-pair:hover > .data-key > .copy-button`
  - `@apply visible`
- `.traceback-cell-link`
  - `color: inherit`
  - `text-decoration: underline`
- `.traceback-cell-link:hover`
  - `font-weight: 500`

Unsupported-widget banner:

- mimetype:
  - `application/vnd.jupyter.widget-view+json`
- banner kind:
  - `warn`
- bold copy:
  - `Jupyter widgets are not supported in marimo.`
- follow-up copy:
  - `Please migrate this widget to anywidget.`
- link attrs:
  - `target="_blank"`
  - `rel="noopener noreferrer"`
  - `className="underline hover:text-(--amber-12)"`

#### 9.7.1 Text, HTML, and JSON Output Primitives

Source:

- `.__marimo_upstream/frontend/src/components/editor/output/TextOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/HtmlOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/JsonOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/ImageOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/VideoOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/renderMimeIcon.tsx`

Text output contract:

- source component:
  - `TextOutput`
- ANSI gate:
  - `channel === "stdout" || channel === "stderr"`
- ANSI branch:
  - inner wrapper `span`
  - wrap class branch:
    - wrapped -> `whitespace-pre-wrap break-words`
    - unwrapped -> `whitespace-pre`
  - inner renderer:
    - `RenderTextWithLinks`
- non-ANSI outer class branch:
  - wrapped -> `whitespace-pre-wrap break-words`
  - unwrapped -> `whitespace-pre`
- prose branch:
  - adds `font-prose` when `channel === "output"`
- outer root always also carries:
  - `channel`

HTML output contract:

- source component:
  - `HtmlOutput`
- null gate:
  - returns `null` when `!html`
- root class composition:
  - inline -> `inline-flex`
  - block -> `block`
  - appends incoming `className`
- renderer:
  - `renderHTML({ html, alwaysSanitizeHtml })`

Image output contract:

- source component:
  - `ImageOutput`
- wrapper:
  - `span`
- child primitive:
  - `img`
- forwarded attrs:
  - `className`
  - `src`
  - `alt`
  - `width`
  - `height`

Video output contract:

- source component:
  - `VideoOutput`
- primitive:
  - `iframe`
- forwarded attrs:
  - `className`
  - `src`

JSON output contract:

- source component:
  - `JsonOutput`
- `format="auto"` resolution:
  - object and non-null -> `tree`
  - otherwise -> `raw`
- tree branch primitive:
  - `JsonViewer`
- tree branch class:
  - `marimo-json-output`
- tree branch props:
  - `rootName={name}`
  - `theme={theme}`
  - `displayDataTypes={false}`
  - `value={data}`
  - `style={{ backgroundColor: "transparent" }}`
  - `collapseStringsAfterLength={100}`
  - `groupArraysAfterLength={Number.MAX_SAFE_INTEGER}`
  - `enableClipboard={false}`
  - `maxDisplayLength={determineMaxDisplayLength(data)}`
- value-type branch:
  - python -> `PYTHON_VALUE_TYPES`
  - json -> `JSON_VALUE_TYPES`
- raw branch:
  - `pre`
  - `JSON.stringify(data, null, 2)`

JSON copy-button contract:

- leaf copy button skip gate:
  - hidden when string value starts with:
    - `text/html:`
    - `image/`
    - `video/`
- copy button class:
  - `inline-flex ml-2 copy-button rounded w-6 h-3 justify-center items-center relative`
- aria label:
  - `Copy to clipboard`
- copied state duration:
  - `1000ms`
- idle icon:
  - `CopyIcon className="w-5 h-5 absolute -top-0.5 p-1 hover:bg-muted rounded"`
- copied icon:
  - `CheckIcon className="w-5 h-5 absolute -top-0.5 p-1 hover:bg-muted rounded"`

Collapsible text leaf contract:

- threshold:
  - `COLLAPSED_TEXT_LENGTH = 100`
- short text branch:
  - `span.break-all`
- collapsed branch:
  - `span.cursor-pointer.hover:opacity-90.break-all`
  - renders prefix then `...`
- expanded branch:
  - same class
  - click collapses back

#### 9.7.2 Traceback and Marimo Error Output

Source:

- `.__marimo_upstream/frontend/src/components/editor/output/MarimoTracebackOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/MarimoErrorOutput.tsx`

Traceback output shell:

- root class:
  - `flex flex-col gap-2 min-w-full w-fit`
- local state:
  - `expanded = true` initially
- header row class:
  - `flex gap-2 h-10 px-2 hover:bg-muted rounded-sm select-none items-center cursor-pointer transition-all`
- chevron class:
  - `h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0`
- chevron rotation branch:
  - expanded -> `rotate-180`
  - collapsed -> `rotate-0`
- title shell:
  - `div.text-sm.inline.font-mono`
- error label shell:
  - `span.text-destructive`
- accordion content class:
  - `text-muted-foreground px-4 pt-2 text-xs overflow-auto`

Traceback action-row gates:

- AI fix gate:
  - `onRefactorWithAI && aiEnabled && !isStaticNotebook()`
- debugger gate:
  - traceback info exists
  - traceback kind is `cell`
  - `!isWasm()`
  - `!isStaticNotebook()`
  - `cellId !== SCRATCH_CELL_ID`
- help-menu gate:
  - `!isStaticNotebook()`

Traceback actions row:

- wrapper:
  - `div.flex.gap-2`
- AI button:
  - `AIFixButton`
  - tooltip `Fix with AI`
  - prompt payload:
    - `My code gives the following error:\n\n${lastTracebackLine}`
- debugger button:
  - tooltip `Attach pdb to the exception point.`
  - `Button size="xs" variant="outline"`
  - icon `BugPlayIcon className="h-3 w-3 mr-2"`
  - label `Launch debugger`
  - click path:
    - `getRequestClient().sendPdb({ cellId: tracebackInfo.cellId })`
- help dropdown:
  - trigger `Button size="xs" variant="text"`
  - label `Get help`
  - chevron `ChevronDown className="h-3 w-3 ml-1"`
  - content `DropdownMenuContent align="end" className="w-56"`
  - item order:
    - `Search on Google`
    - `Ask in Discord`
    - `Copy to clipboard`

Traceback filename replacement contract:

- cell traceback row:
  - wraps `CellLinkTraceback`
  - when `!isWasm()`, appends inline breakpoint button
  - breakpoint button class:
    - `ml-1 p-1 rounded-sm hover:bg-muted transition-all inline`
  - tooltip copy:
    - `Insert a breakpoint() at this line`
  - click path:
    - `insertDebuggerAtLine(view, info.lineNumber)`
- file traceback row:
  - root class:
    - `inline-block cursor-pointer text-destructive hover:underline`
  - click path:
    - `getRequestClient().openFile({ path: info.filePath, lineNumber: info.lineNumber })`
- prefix replacement:
  - swaps `File` to `Cell` when traceback row targets a marimo cell file

Marimo error alert shell:

- root primitive:
  - `Alert`
- root class:
  - `border-none font-code text-sm text-[0.84375rem] px-0 text-muted-foreground normal [&:has(svg)]:pl-0 space-y-4`
- title primitive:
  - `AlertTitle`
- title class:
  - `font-code font-medium tracking-wide ${titleColor}`
- message stack wrapper:
  - `div.flex.flex-col.gap-8`

Marimo error title branches:

- default:
  - `This cell wasn't run because it has errors`
  - `alertVariant = "destructive"`
  - `titleColor = "text-error"`
- interruption:
  - `Interrupted`
- internal:
  - `An internal error occurred`
- ancestor-prevented:
  - `Ancestor prevented from running`
  - `alertVariant = "default"`
  - `titleColor = "text-secondary-foreground"`
- ancestor-stopped:
  - `Ancestor stopped`
  - `alertVariant = "default"`
  - `titleColor = "text-secondary-foreground"`
- sql-error:
  - `SQL error`
- exception type branch:
  - uses `exception_error.exception_type`

Error helper primitives:

- shared list item class:
  - `my-0.5 ml-8 text-muted-foreground/40`
- `Tip` primitive:
  - `Accordion type="single" collapsible={true}`
  - item class `text-muted-foreground`
  - trigger class `pt-2 pb-2 font-normal`
  - content class `mr-24 text-[0.84375rem]`

Syntax/unknown error contract:

- syntax/unknown messages render in `pre`
- pip-hint gate:
  - any syntax error message includes `!pip`
- shell-hint gate:
  - no pip hint
  - some syntax error message includes `use os.subprocess`
- pip CTA:
  - `Button size="xs" variant="outline" className="mt-2 font-normal"`
  - icon `PackageIcon className="h-3.5 w-3.5 mr-1.5 mb-0.5"`
  - label `Open package manager`
- shell CTA:
  - `Button size="xs" variant="outline" className="mt-2 font-normal"`
  - icon `TerminalIcon className="h-3.5 w-3.5 mr-1.5"`
  - label `Open terminal`
- autofix gate:
  - renders `AutoFixButton` when `cellId`

Selected error-specific contracts:

- setup refs:
  - header `The setup cell cannot be run because it has references.`
  - list rows show `CellLinkError` plus referenced vars
  - tip title `Why can't the setup cell have references?`
- cycle:
  - header `This cell is in a cycle.`
  - list rows render `CellLinkError -> vars -> CellLinkError`
  - tip title `What are cycles and how do I resolve them?`
- multiple defs:
  - header `This cell redefines variables from other cells.`
  - per-name copy `'name' was also defined by:`
  - scratchpad tip CTA:
    - `Button size="xs" variant="link" className="my-2 font-normal mx-0 px-0"`
    - icon `NotebookPenIcon className="h-3"`
    - label `Try the scratchpad`
- import star:
  - tip title `Why can't I use \`import *\`?`
- interruption:
  - copy `This cell was interrupted and needs to be re-run.`
- exception special cases:
  - `name 'mo' is not defined.` explains the `mo` import requirement for Markdown, SQL, and UI elements
  - `name '_...` branch explains underscore-prefixed variables are local to a cell and links docs
  - generic branch without raising cell adds `See the console area for a traceback.`
  - branch with `raising_cell` appends `CellLinkError`
- strict exception:
  - shows `CellLinkError` when `blamed_cell` exists
  - tip copy switches between:
    - `Ensure that the referenced cells define the required variables, or turn off strict execution.`
    - `Something is wrong with your declarations. Fix any discrepancies, or turn off strict execution.`
- ancestor-prevented:
  - renders `raising_cell`
  - optional `blamed_cell` sub-branch
- ancestor-stopped:
  - renders `CellLinkError` for `raising_cell`
- sql error:
  - message wrapper `div.space-y-2.mt-2`
  - message class `text-muted-foreground whitespace-pre-wrap`
  - `AutoFixButton` uses `className="mt-2.5"`

