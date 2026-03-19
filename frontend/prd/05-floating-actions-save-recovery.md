[Back to PRD Index](../PRD.md)

# 7. Floating Actions, Save, and Recovery

[Resume from Summary](./10-summary-acceptance-and-copy-plan.md#121-current-state)

#### 7.0 Action Button and Text Button Primitives

Source:

- `.__marimo_upstream/frontend/src/components/editor/inputs/Inputs.tsx`
- `.__marimo_upstream/frontend/src/components/editor/inputs/Inputs.styles.ts`
- `.__marimo_upstream/frontend/src/components/editor/inputs/Inputs.css`
- `.__marimo_upstream/frontend/src/components/ui/button.tsx`
- `.__marimo_upstream/frontend/src/components/ui/menu-items.tsx`

Notebook action button primitive:

- base class:
  - `flex items-center justify-center m-0 leading-none font-medium border border-foreground/10 shadow-xs-solid active:shadow-none dark:border-border text-sm`
- color variants:
  - `gray` -> `mo-button gray`
  - `white` -> `mo-button white`
  - `green` -> `mo-button green`
  - `red` -> `mo-button red`
  - `yellow` -> `mo-button yellow`
  - `hint-green` -> `mo-button hint-green`
  - `disabled` -> `mo-button disabled active:shadow-xs-solid`
- shape variants:
  - `rectangle` -> `rounded`
  - `circle` -> `rounded-full`
- compound size and shape variants:
  - `small + circle` -> `h-[24px] w-[24px] px-[5.5px] py-[5.5px]`
  - `medium + circle` -> `px-2 py-2`
  - `small + rectangle` -> `px-1 py-1 h-[24px] w-[24px]`
  - `medium + rectangle` -> `px-3 py-2`

Button color styling:

- `.mo-button.gray`
  - `background-color: var(--slate-1)`
  - `border-color: var(--slate-6)`
  - `color: var(--slate-11)`
- `.mo-button.gray:hover`
  - `background-color: var(--slate-3)`
  - `border-color: var(--slate-8)`
- source selector `.mo-button.gray.selected .mo-button.gray:active`
  - `background-color: var(--slate-4)`
  - `border-color: var(--slate-7)`
- `.mo-button.hint-green`
  - `background-color: var(--background)`
  - `border-color: var(--slate-7)`
  - `color: var(--slate-11)`
- `@supports (color: color-mix(in lab, red, red))` branch for `.mo-button.hint-green`
  - `background-color: color-mix(in srgb, var(--background), transparent 0%)`
- `.mo-button.hint-green:hover`
  - `background-color: var(--grass-2)`
  - `border-color: var(--grass-7)`
  - `color: var(--grass-11)`
- source selector `.mo-button.hint-green.selected .mo-button.hint-green:active`
  - `background-color: var(--grass-4)`
  - `border-color: var(--grass-7)`
  - `color: var(--slate-11)`
- `.mo-button.disabled`
  - `background-color: var(--background)`
  - `border-color: var(--slate-6)`
  - `color: var(--slate-7)`
- `@supports (color: color-mix(in lab, red, red))` branch for `.mo-button.disabled`
  - `background-color: color-mix(in srgb, var(--background), transparent 0%)`
- `.mo-button.green`
  - `background-color: var(--grass-3)`
  - `border-color: var(--grass-6)`
  - `color: var(--grass-11)`
- `.mo-button.green:hover`
  - `background-color: var(--grass-2)`
  - `border-color: var(--grass-7)`
- source selector `.mo-button.green.selected .mo-button.green:active`
  - `background-color: var(--grass-4)`
  - `border-color: var(--grass-7)`
- `.mo-button.red`
  - `background-color: var(--red-3)`
  - `border-color: var(--red-6)`
  - `color: var(--red-11)`
- `.mo-button.red:hover`
  - `background-color: var(--red-4)`
  - `border-color: var(--red-8)`
- source selector `.mo-button.red.selected .mo-button.red:active`
  - `background-color: var(--red-5)`
  - `border-color: var(--red-7)`
- `.mo-button.yellow`
  - `background-color: var(--yellow-3)`
  - `border-color: var(--yellow-6)`
  - `color: var(--yellow-11)`
- `.mo-button.yellow:hover`
  - `background-color: var(--yellow-4)`
  - `border-color: var(--yellow-8)`
- source selector `.mo-button.yellow.selected .mo-button.yellow:active`
  - `background-color: var(--yellow-5)`
  - `border-color: var(--yellow-7)`

Generic text button primitive from `components/ui/button.tsx`:

- base class:
  - `disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center rounded-md text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background`
- `variant="text"`
  - `opacity-80 hover:opacity-100 active:opacity-100`
- `size="xs"`
  - `h-7 px-2 rounded-md text-xs`

Menu primitive tokens from `components/ui/menu-items.tsx`:

- common menu surface:
  - `z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md`
- subcontent adds:
  - `shadow-lg`
- disabled token:
  - `data-disabled:pointer-events-none data-disabled:opacity-50`
- sub-trigger base:
  - `flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground`
- sub-trigger inset add:
  - `pl-8`
- control row base:
  - `relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground`
- control check slot:
  - `absolute left-2 flex h-3.5 w-3.5 items-center justify-center`
- label base:
  - `px-2 py-1.5 text-sm font-semibold`
- label inset add:
  - `pl-8`
- item base:
  - `menu-item relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden`
- item variant `default`:
  - `focus:bg-accent focus:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground`
- item variant `danger`:
  - `focus:bg-(--red-5) focus:text-(--red-12) aria-selected:bg-(--red-5) aria-selected:text-(--red-12)`
- item variant `muted`:
  - `focus:bg-muted/70 focus:text-muted-foreground aria-selected:bg-muted/70 aria-selected:text-muted-foreground`
- item variant `success`:
  - `focus:bg-(--grass-3) focus:text-(--grass-11) aria-selected:bg-(--grass-3) aria-selected:text-(--grass-11)`
- item variant `disabled`:
  - `text-muted-foreground`
- separator:
  - `-mx-1 my-1 h-px bg-border last:hidden`
- `MenuShortcut`:
  - `ml-auto text-xs tracking-widest opacity-60`

#### 7.1 Top-Right Utility Stack

Source branch:

- `.__marimo_upstream/frontend/src/components/editor/controls/Controls.tsx`
- `.__marimo_upstream/frontend/src/components/editor/controls/notebook-menu-dropdown.tsx`
- `.__marimo_upstream/frontend/src/components/editor/controls/command-palette-button.tsx`
- `.__marimo_upstream/frontend/src/components/editor/renderers/layout-select.tsx`

Wrapper class:

- `absolute top-3 right-5 m-0 flex items-center gap-2 min-h-[28px] print:hidden pointer-events-auto z-30`

Render gate:

- the row does not render when connection state is `CLOSED`

Exact connected-state child order:

- `presenting && <LayoutSelect />`
- `NotebookMenuDropdown`
- `ConfigButton`
- `ShutdownButton`

Child ownership:

- `LayoutSelect`
  - presenting-only toggle branch
- `NotebookMenuDropdown`
  - notebook menu dropdown trigger
- `ConfigButton`
  - app config button
- `ShutdownButton`
  - shutdown button

This row does not own the save button. Save belongs to the bottom-right floating stack.

`LayoutSelect` contract:

- hidden gate:
  - returns `null` when `isWasm()` is true and `getFeatureFlag("wasm_layouts")` is false
- root primitive:
  - `Select`
  - `data-testid="layout-select"`
  - `value={selectedLayout}`
  - `onValueChange={(v) => setLayoutView(v as LayoutType)}`
- trigger:
  - `SelectTrigger className="min-w-[110px] border-border bg-background"`
  - `data-testid="layout-select"`
- placeholder:
  - `Select a view`
- content:
  - `SelectContent`
  - `SelectGroup`
  - `SelectLabel`
  - label text `View as`
- option source:
  - `LAYOUT_TYPES.map((layout) => ...)`
- option shell:
  - `div.flex.items-center.gap-1.5.leading-5`
- icon mapping:
  - `vertical -> ListIcon`
  - `grid -> Grid3x3Icon`
  - `slides -> PresentationIcon`
  - fallback -> `SquareIcon`
- label formatter:
  - `displayLayoutName(layoutType) = startCase(layoutType)`

Notebook menu dropdown contract:

- `data-testid="notebook-menu-dropdown"`
- `aria-label="Config"`
- `shape: "circle"`
- `size: "small"`
- `className: "h-[27px] w-[27px]"`
- enabled color:
  - `hint-green`
- disabled color:
  - `disabled`
- default tooltip:
  - `Actions`
- tooltip content wrapper:
  - `flex flex-col gap-2`
- enabled helper row text:
  - `Open command palette`
- enabled helper row shortcut:
  - `renderShortcut("global.commandPalette", false)`
- enabled helper row class:
  - `text-xs text-muted-foreground font-medium pt-1 -mt-2 border-t border-border flex items-center gap-2`
- trigger icon:
  - `MenuIcon`
  - `strokeWidth: 1.8`
- tooltip ownership:
  - `Tooltip content={tooltipContent}` wraps the `MenuIcon` inside the `Button`
- root popover primitive:
  - `DropdownMenu`
  - `modal: false`
- trigger primitive:
  - `DropdownMenuTrigger`
  - `asChild: true`
  - `disabled: disabled`
- popover alignment:
  - `align: "end"`
- popover class:
  - `print:hidden w-[240px]`
- root item testid pattern:
  - ``data-testid="notebook-menu-dropdown-${label}"``
- label row renderer from `renderLabel(action)`:
  - first optional icon shell:
    - `span.flex-0.mr-2`
  - then label shell:
    - `span.flex-1`
    - content is `action.labelElement ?? action.label`
  - then optional hotkey shell:
    - `MinimalShortcut className="ml-4"`
  - then `action.rightElement`
- plain item renderer:
  - `renderLeafAction` using `DropdownMenuItem`
- nested dropdown renderer:
  - `renderAction`
  - trigger `DropdownMenuSubTrigger`
  - submenu `DropdownMenuPortal -> DropdownMenuSubContent`
- item skip gate:
  - `hidden || redundant -> null`
- item tooltip branch:
  - wraps the leaf item with `Tooltip`
  - then wraps the result in a plain `span`
  - `side: "left"`
  - `delayDuration: 100`
- footer divider after menu items:
  - `DropdownMenuSeparator`
- locale and version footer wrapper:
  - `flex-1 px-2 text-xs text-muted-foreground flex flex-col gap-1`
- locale row text:
  - `Locale: ${locale}`
- version row text:
  - `Version: ${getMarimoVersion()}`

#### 7.1.1 Notebook Menu Item Inventory

Source:

- `.__marimo_upstream/frontend/src/components/editor/actions/useNotebookActions.tsx`

Menu construction contract:

- helper:
  - `NOOP_HANDLER(event?)`
  - calls `preventDefault()`
  - calls `stopPropagation()`
- `useNotebookActions()` returns:
  - `actions.filter((action) => !action.hidden).map((action) => { if (action.dropdown) return { ...action, dropdown: action.dropdown.filter((item) => !item.hidden) }; return action; })`
- top-level filtering:
  - `.filter((action) => !action.hidden)`
- nested dropdown filtering:
  - `.map((action) => { if (action.dropdown) return { ...action, dropdown: action.dropdown.filter((item) => !item.hidden) }; return action; })`

Exact top-level order after hidden filtering:

- `Download`
- `Share`
- `Helper panel`
- `Present as`
- `Duplicate notebook`
- `Copy code to clipboard`
- `Enable all cells`
- `Add setup cell`
- `Add database connection`
- `Add remote storage`
- `Undo cell deletion`
- `Restart kernel`
- `Re-run all cells`
- `Clear all outputs`
- `Hide all markdown code`
- `Collapse all sections`
- `Expand all sections`
- `Command palette`
- `Keyboard shortcuts`
- `User settings`
- `Resources`
- `Return home`
- `New notebook`

Duplicate notebook prompt contract:

- source helper:
  - `useCopyNotebook(filename)`
- open gate:
  - only visible when `filename` exists
  - hidden when `isWasm()` is true
- modal title:
  - `Copy notebook`
- description:
  - `Enter a new filename for the notebook copy.`
- default value:
  - ``_${Paths.basename(source)}``
- confirm button text:
  - `Copy notebook`
- prompt option:
  - `spellCheck: false`
- destination path:
  - `PathBuilder.guessDeliminator(source).join(Paths.dirname(source), filename)`
- success toast:
  - title `Notebook copied`
  - description `A copy of the notebook has been created.`

Download menu contract:

- top-level icon:
  - `DownloadIcon`
- top-level handle:
  - `NOOP_HANDLER`
- exact dropdown order:
  - `Download as HTML`
    - icon `FolderDownIcon`
    - handle `downloadAsHTML({ filename, includeCode: true })`
  - `Download as HTML (exclude code)`
    - icon `FolderDownIcon`
    - handle `downloadAsHTML({ filename, includeCode: false })`
  - `Download as Markdown`
    - icon `MarkdownIcon`
  - `Download as ipynb`
    - icon `NotebookIcon`
  - `Download Python code`
    - icon `CodeIcon`
  - `Download as PNG`
    - divider `true`
    - icon `ImageIcon`
    - disabled when `mode !== "present"`
    - disabled tooltip:
      - `Only available in app view.`
      - `Toggle with:`
      - `renderShortcut("global.hideCode", false)`
  - `Download as PDF`
    - non-slides branch:
      - divider `true`
      - icon `FileIcon`
      - direct handle `handleDocumentPDF`
    - slides-layout branch:
      - divider `true`
      - icon `FileIcon`
      - top-level handle `NOOP_HANDLER`
      - nested order:
        - `Document Layout`
          - icon `FileIcon`
          - handle `handleDocumentPDF`
        - `Slides Layout`
          - icon `FileIcon`
          - rightElement `renderRecommendedElement(true)`
          - hidden when `serverSidePdfEnabled` is false
          - handle downloads slides PDF

Recommended badge helper from `renderRecommendedElement(true)`:

- tag:
  - `span`
- class:
  - `ml-3 shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700`
- text:
  - `Recommended`

Share menu contract:

- top-level icon:
  - `Share2Icon`
- top-level hidden rule:
  - `hidden: !sharingHtmlEnabled && !sharingWasmEnabled`
- exact dropdown order:
  - `Publish HTML to web`
    - icon `GlobeIcon`
    - hidden when `!sharingHtmlEnabled`
    - opens `Share static notebook` dialog
  - `Create WebAssembly link`
    - icon `LinkIcon`
    - hidden when `!sharingWasmEnabled`
    - success toast:
      - title `Copied`
      - description `Link copied to clipboard.`

Helper panel menu contract:

- top-level icon:
  - `PanelLeftIcon`
- `redundant: true`
- top-level handle:
  - `NOOP_HANDLER`
- dropdown source:
  - `PANELS.flatMap(({ type: id, Icon, hidden, additionalKeywords }) => hidden ? [] : item)`
- dropdown item label:
  - `startCase(id)`
- dropdown item icon:
  - `panel.Icon`
- dropdown item rightElement:
  - `renderCheckboxElement(selectedPanel === id)`
  - exact wrapper class `w-8 flex justify-end`

Present as menu contract:

- top-level icon:
  - `PresentationIcon`
- top-level handle:
  - `NOOP_HANDLER`
- exact dropdown order:
  - `Toggle app view`
    - hotkey `global.hideCode`
    - icon `EditIcon` when `mode === "present"`
    - icon `LayoutTemplateIcon` otherwise
  - first layout option from `LAYOUT_TYPES.map(...)`
    - `divider: true`
  - remaining layout options from `LAYOUT_TYPES.map(...)`
- each layout option:
  - label `displayLayoutName(type)`
  - icon `getLayoutIcon(type)`
  - rightElement wrapper `div.w-8.flex.justify-end`
  - selected state renders `CheckIcon` check icon
  - handle sets layout via `setLayoutView(type)` and toggles app view when current mode is `edit`

Remaining direct notebook menu items:

- `Duplicate notebook`
  - icon `Files`
  - hidden when `!filename || isWasm()`
- `Copy code to clipboard`
  - icon `ClipboardCopyIcon`
  - hidden when `!filename`
- `Enable all cells`
  - icon `ZapIcon`
  - hidden when `!hasDisabledCells || kioskMode`
- `Add setup cell`
  - divider `true`
  - icon `DiamondPlusIcon`
- `Add database connection`
  - icon `DatabaseIcon`
- `Add remote storage`
  - icon `HardDrive`
- `Undo cell deletion`
  - icon `Undo2Icon`
  - hidden when `!canUndoDeletes || kioskMode`
- `Restart kernel`
  - icon `PowerSquareIcon`
  - `variant: "danger"`
  - `additionalKeywords: ["reset", "reload", "restart"]`
- `Re-run all cells`
  - icon `FastForwardIcon`
  - `redundant: true`
  - `hotkey: "global.runAll"`
- `Clear all outputs`
  - icon `XCircleIcon`
  - `redundant: true`
- `Hide all markdown code`
  - icon `EyeOffIcon`
  - `redundant: true`
- `Collapse all sections`
  - icon `ChevronRightCircleIcon`
  - `redundant: true`
  - `hotkey: "global.collapseAllSections"`
- `Expand all sections`
  - icon `ChevronDownCircleIcon`
  - `redundant: true`
  - `hotkey: "global.expandAllSections"`
- `Command palette`
  - icon `CommandIcon`
  - `hotkey: "global.commandPalette"`
- `Keyboard shortcuts`
  - icon `KeyboardIcon`
  - `hotkey: "global.showHelp"`
- `User settings`
  - icon `SettingsIcon`
  - `redundant: true`
  - `additionalKeywords: ["preferences", "options", "configuration"]`
- `Resources`
  - icon `ExternalLinkIcon`
  - top-level handle `NOOP_HANDLER`
  - exact dropdown order:
    - `Documentation`
      - icon `BookMarkedIcon`
    - `GitHub`
      - icon `GithubIcon`
    - `Discord Community`
      - icon `MessagesSquareIcon`
    - `YouTube`
      - icon `YoutubeIcon`
    - `Changelog`
      - icon `FileTextIcon`
- `Return home`
  - divider `true`
  - icon `Home`
  - hidden when `!location.search.includes("file")`
- `New notebook`
  - icon `FilePlus2Icon`
  - hidden when `!location.search.includes("file")`

#### 7.2 Bottom-Right Floating Stack

Wrapper class:

- `absolute bottom-5 right-5 flex flex-col gap-2 items-center print:hidden pointer-events-auto z-30`

Disconnected DOM order from `experiments/marimo-layout.dom.html`:

- `#save-button`
- `#preview-button[data-testid="hide-code-button"]`
- `button[data-testid="command-palette-button"]`
- empty spacer `<div></div>`
- run cluster wrapper `<div class="flex flex-col gap-2 items-center"></div>`

Known items in this stack:

- save button
- preview or hide-code toggle button
- command palette button
- spacer node
- run button cluster
- interrupt button
- undo delete button when applicable

Exact source order from `Controls.tsx`:

- `SaveComponent`
- preview or hide-code toggle button
- `CommandPaletteButton`
- `KeyboardShortcuts`
- empty `<div></div>`
- run cluster wrapper `div.flex.flex-col.gap-2.items-center`
  - child order inside cluster:
    - undo delete button when available
    - interrupt button when connected
    - run button when connected
- `HideInKioskMode` ownership:
  - wraps `SaveComponent`
  - separately wraps the entire run cluster

Keyboard shortcuts button:

- source component:
  - `KeyboardShortcuts`
- ownership:
  - lives between `CommandPaletteButton` and the spacer `<div />`
- visibility:
  - always rendered in the bottom-right stack, unlike save/run which are kiosk-gated

Save button contract from `save-component.tsx` and `RecoveryButton.tsx`:

- `data-testid="save-button"` in connected branch
- `id="save-button"` in both connected and disconnected branches
- `aria-label="Save"`
- shape intent `rectangle`, but RecoveryButton source passes it as `className="rectangle"` instead of `shape="rectangle"` (literal string, does not activate the CVA shape variant — likely a source bug)
- trigger wrapper:
  - `Tooltip`
- trigger primitive:
  - `ControlButton` or `EditorButton`
- disconnected branch:
  - source component `RecoveryButton`
  - color `gray` when clean
  - color `yellow` when dirty
- connected branch:
  - source component `SaveComponent`
  - color `hint-green` when clean
  - color `yellow` when dirty
- tooltip content:
  - `renderShortcut("global.save")`
- connected click path:
  - `saveOrNameNotebook`
- disconnected click path:
  - `openRecoveryModal`
- persistent filename gate from `isNamedPersistentFile(filename)`:
  - `filename !== null`
  - does not start with `/tmp/`
  - does not start with `/var/folders`
  - does not include `AppData\\Local\\Temp`
- disconnected DOM capture class:
  - `flex items-center justify-center m-0 leading-none font-medium border border-foreground/10 shadow-xs-solid active:shadow-none dark:border-border text-sm mo-button gray rounded px-3 py-2 rectangle`

Preview or hide-code button:

- `data-testid="hide-code-button"`
- `id="preview-button"`
- shape `rectangle`
- color `hint-green`
- tooltip comes from `renderShortcut("global.hideCode")`
- icon size:
  - `18`
- stroke width:
  - `1.5`
- icon branch when `presenting=true`:
  - `EditIcon`
- icon branch when `presenting=false`:
  - `LayoutTemplateIcon`

Command palette button:

- source component:
  - `.__marimo_upstream/frontend/src/components/editor/controls/command-palette-button.tsx`
- `data-testid="command-palette-button"`
- shape `rectangle`
- color `hint-green`
- wrapper:
  - `Tooltip content={renderShortcut("global.commandPalette")}`
- tooltip comes from `renderShortcut("global.commandPalette")`
- click path:
  - `setCommandPaletteOpen((value) => !value)`
- icon size:
  - `18`
- stroke width:
  - `1.5`
- icon:
  - `CommandIcon`

Keyboard shortcuts button and dialog:

- source component:
  - `.__marimo_upstream/frontend/src/components/editor/controls/keyboard-shortcuts.tsx`
  - `.__marimo_upstream/frontend/src/components/editor/controls/duplicate-shortcut-banner.tsx`
- mount gate:
  - returns `null` when `keyboardShortcutsAtom` is false
- open toggles:
  - bottom-right `KeyboardShortcuts` button in `Controls.tsx`
  - menu action `Keyboard shortcuts`
  - hotkey `global.showHelp`
- dialog root:
  - `Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}`
- portal ownership:
  - custom `DialogPortal className="sm:items-center sm:top-0"`
  - `DialogContent usePortal={false}`
- dialog content class:
  - `max-h-screen sm:max-h-[90vh] overflow-y-auto sm:max-w-[850px]`
- dialog title:
  - `Shortcuts`
- duplicate warning banner:
  - hidden when `duplicates.length === 0`
  - primitive `Alert variant="warning" className="mb-4"`
  - icon `AlertTriangleIcon className="h-4 w-4"`
  - title `Duplicate shortcuts`
  - intro copy `Multiple actions are assigned to the same keyboard shortcut:`
  - each duplicate row:
    - wrapper `li.text-xs`
    - key row `div.flex.items-center.gap-2.mb-1`
    - secondary list `ul.ml-6.list-disc`
- two-column body shell:
  - `div.flex.flex-row.gap-3`
  - left column `div.w-1/2`
  - right column `div.w-1/2`
- group render order:
  - left:
    - `Editing`
    - `Markdown`
  - right:
    - `Navigation`
    - `Running Cells`
    - `Creation and Ordering`
    - `Command`
    - `Other`
- group shell:
  - `div.mb-[40px].gap-2.flex.flex-col`
  - title `h3.text-lg.font-medium`
- command-group subheader:
  - `p.text-xs.text-muted-foreground.flex.items-center.gap-1`
  - copy `Press ... in a cell to enter command mode`
  - normal preset shows `Kbd>Esc`
  - vim preset shows `KeyboardHotkeys shortcut={Cmd|Ctrl}` then `Kbd>Esc`
- editable shortcut row:
  - root grid `grid grid-cols-[auto_2fr_3fr] gap-2 items-center`
  - edit icon `EditIcon className="cursor-pointer opacity-60 hover:opacity-100 text-muted-foreground w-3 h-3"`
  - non-editable placeholder `div.w-3.h-3`
  - current shortcut `KeyboardHotkeys className="justify-end"`
  - label row `div.flex.items-center.gap-1`
  - duplicate hover badge:
    - wrapper `div.group.relative.inline-flex`
    - icon `AlertTriangleIcon className="w-3 h-3 text-(--yellow-11)"`
    - tooltip shell `invisible group-hover:visible absolute left-0 top-5 z-10 w-max max-w-xs rounded-md bg-(--yellow-2) border border-(--yellow-7) p-2 text-xs text-(--yellow-11) shadow-md`
- editing row:
  - `Input autoFocus={true}`
  - placeholder `hotkey.name`
  - defaultValue `newShortcut.join("+")`
  - endAdornment button:
    - `Button variant="text" size="xs" className="mb-0"`
    - icon `XIcon className="w-4 h-4"`
  - helper row:
    - wrapper `flex items-center justify-between w-full`
    - left copy `Press a key combination`
  - reset-to-default link gate:
    - renders only when `defaultHotkey.key !== hotkey.key`
    - class `text-xs cursor-pointer text-primary`
    - copy `Reset to default:`
- shortcut capture rules:
  - ignores bare modifier keys `Meta|Control|Alt|Shift`
  - prepends pressed modifiers in order `Cmd|Meta`, `Ctrl`, `Alt`, `Shift`
  - rejects `-` as a bindable key
  - bare `Escape` cancels editing instead of saving a binding
  - single-character keys are lowercased
  - space becomes `Space`
- optimistic save path:
  - `saveConfigOptimistic(newConfig)`
  - updates local config first
  - rolls back to previous config on request failure
- reset-all button:
  - `Button variant="outline" size="xs" tabIndex={-1}`
  - `className: "mt-4 hover:bg-destructive/10 border-destructive hover:border-destructive"`
  - label wrapper `span.text-destructive`
  - copy `Reset all to default`
  - confirm text `Are you sure you want to reset all shortcuts to their default values?`

Undo delete button:

- `data-testid="undo-delete-cell"`
- size `medium`
- color `hint-green`
- shape `circle`
- icon size:
  - `16`
- stroke width:
  - `1.5`
- tooltip text:
  - `Undo cell deletion`

Run button:

- `data-testid="run-button"`
- dirty branch:
  - color `yellow`
  - size `medium`
  - shape `circle`
  - tooltip:
    - `renderShortcut("global.runStale")`
- idle-nothing-to-run branch:
  - color `disabled`
  - `className: "inactive-button"`
  - tooltip text:
    - `Nothing to run`

Interrupt button:

- visibility helper source:
  - `.__marimo_upstream/frontend/src/components/editor/cell/useShouldShowInterrupt.ts`
- delay constant:
  - `DELAY_MS = 200`
- `showInterrupt` predicate:
  - returns true only when `running === true` and the run has lasted at least 200ms
- `data-testid="interrupt-button"`
- size `medium`
- shape `circle`
- tooltip:
  - `renderShortcut("global.interrupt")`
- running branch color:
  - `yellow`
- inactive branch color:
  - `disabled`
- inactive class add:
  - `inactive-button active:shadow-xs-solid`
- inactive click handler:
  - `Functions.NOOP`
- icon:
  - `SquareIcon`
  - size `16`
  - stroke width `1.5`

#### 7.2.1 Find/Replace Overlay

Source:

- `.__marimo_upstream/frontend/src/components/find-replace/find-replace.tsx`
- `.__marimo_upstream/frontend/src/core/codemirror/find-replace/state.ts`
- `.__marimo_upstream/frontend/src/core/codemirror/find-replace/search-highlight.ts`

Mount ownership:

- `Controls.tsx` renders `<FindReplace />` before the top-right and bottom-right control stacks
- the component returns `null` when `findReplaceAtom.isOpen` is false
- the overlay is not gated by `presenting`; only the hotkey and open state control visibility

State contract:

- `findReplaceAtom` default state:
  - `findText: ""`
  - `replaceText: ""`
  - `caseSensitive: false`
  - `wholeWord: false`
  - `regexp: false`
  - `isOpen: false`
  - `currentView: undefined`
- reducer actions:
  - `setFind`
  - `setReplace`
  - `setCaseSensitive`
  - `setWholeWord`
  - `setRegex`
  - `setIsOpen`
  - `setCurrentView`
  - `clearCurrentView`

Open/close contract:

- `useHotkey("cell.findAndReplace", ...)` opens the overlay
- if the panel is already open and the input is focused, the handler returns `false` so the browser default can run
- `openFindReplacePanel(initialView?)` returns `false` when any open Radix dialog exists via `[role="dialog"][data-state="open"]` with children
- when `initialView` exists and selection text is non-empty:
  - preloads `findText` with the selected text
  - stores `currentView` with the selected range
- when already open:
  - closes first via `setIsOpen(false)`
  - then reopens inside `requestAnimationFrame`
- close paths:
  - close button
  - `Escape` on the overlay root
  - `closeFindReplacePanel()`

Overlay shell:

- root primitive:
  - `FocusScope restoreFocus={true} autoFocus={true}`
- panel wrapper class:
  - `fixed top-0 right-0 w-[500px] flex flex-col bg-(--sage-1) p-4 z-50 mt-2 mr-3 rounded-md shadow-lg border gap-2 print:hidden`
- click handler:
  - stops propagation
  - prevents default
- focus tracking:
  - `onFocus -> setIsFocused(true)`
  - `onBlur -> setIsFocused(false)`
- close button wrapper:
  - `absolute top-0 right-0`
- close button:
  - `data-testid="close-find-replace-button"`
  - `size="xs"`
  - `variant="text"`
  - icon `XIcon className="w-4 h-4"`

Body layout:

- main row:
  - `flex items-center gap-3`
- left input column:
  - `flex flex-col flex-2 gap-2 w-[55%]`
- right controls column:
  - `flex flex-col gap-2`
- bottom navigation row:
  - `flex items-center gap-2`
- footer hint:
  - `text-xs text-muted-foreground flex gap-1 mt-2`
  - copy `Press ... again to open the native browser search.`

Find/replace inputs:

- find input:
  - `Input`
  - `ref={findInputRef}`
  - `data-testid="find-input"`
  - `className: "mr-2 mb-0"`
  - `placeholder: "Find"`
  - focuses and selects all text when the panel opens
- replace input:
  - `Input`
  - `data-testid="replace-input"`
  - `placeholder: "Replace"`
- find input key handling:
  - `Enter` runs `findNext()`
  - `Shift+Enter` runs `findPrev()`
  - `Cmd/Ctrl+G` prevents browser default and runs next/prev depending on `Shift`

Toggle row:

- wrapper:
  - `flex items-center gap-[2px]`
- each toggle uses `Toggle size="sm"`
- case-sensitive toggle:
  - tooltip `Case Sensitive`
  - icon `CaseSensitiveIcon className="w-4 h-4"`
- whole-word toggle:
  - tooltip `Match Whole Word`
  - icon `WholeWordIcon className="w-4 h-4"`
- regex toggle:
  - tooltip `Use Regular Expression`
  - icon `RegexIcon className="w-4 h-4"`
- each toggle mirrors state through:
  - `pressed={state.*}`
  - `data-state={state.* ? "on" : "off"}`

Replace actions:

- controls row:
  - `flex items-center gap-[2px]`
- replace-next button:
  - `data-testid="replace-next-button"`
  - `size="xs"`
  - `variant="outline"`
  - `className: "h-6 text-xs"`
  - disabled when `state.findText === ""`
  - click path `replaceNext() && resetMatches()`
- replace-all button:
  - `data-testid="replace-all-button"`
  - `size="xs"`
  - `variant="outline"`
  - `className: "h-6 text-xs"`
  - disabled when `state.findText === ""`
  - click path:
    - `const undo = replaceAll()`
    - if no undo, return
    - `resetMatches()`
    - show toast `Replaced all occurrences`
    - toast action `UndoButton data-testid="undo-replace-all-button"`
    - undo click calls `undo()` then `dismiss()`

Find navigation row:

- previous button:
  - `data-testid="find-prev-button"`
  - `size="xs"`
  - `variant="secondary"`
  - tooltip `Find Previous`
  - icon `ArrowLeftIcon className="w-4 h-4"`
- next button:
  - `data-testid="find-next-button"`
  - `size="xs"`
  - `variant="secondary"`
  - tooltip `Find Next`
  - icon `ArrowRightIcon className="w-4 h-4"`
- match counter branch:
  - when `matches != null && currentMatch == null`
    - `${matches.count} matches`
  - when `matches != null && currentMatch != null`
    - `${currentMatch + 1} of ${matches.count}`

Highlight and match-state contract:

- `resetMatches()` calls `getMatches()`
- invalid regex branch:
  - when `getMatches() === false`, stores `undefined`
- open/close effect:
  - closed -> `clearGlobalSearchQuery()`
  - open with empty `findText` -> `setMatches(undefined)` then `clearGlobalSearchQuery()`
  - open with non-empty `findText` -> `resetMatches()` then `setGlobalSearchQuery()`
- `setGlobalSearchQuery()`:
  - iterates `getAllEditorViews()`
  - skips read-only views
  - dispatches `setSearchQuery.of(new SearchQuery(...))`
- `clearGlobalSearchQuery()`:
  - dispatches empty `SearchQuery({ search: "" })`
- selection highlight theme:
  - `&light .cm-searchMatch -> backgroundColor: "#99ff7780"`
  - `&dark .cm-searchMatch -> backgroundColor: "#22bb0070"`
  - `&light .cm-searchMatch-selected -> backgroundColor: "transparent"`
  - `&dark .cm-searchMatch.cm-searchMatch-selected -> backgroundColor: "#6199ff88 !important"`

#### 7.3 App Config Button and Shutdown Button

Source:

- `.__marimo_upstream/frontend/src/components/app-config/app-config-button.tsx`
- `.__marimo_upstream/frontend/src/components/editor/controls/shutdown-button.tsx`
- `.__marimo_upstream/frontend/src/components/editor/actions/useConfigActions.tsx`

App config button contract:

- `data-testid="app-config-button"`
- `aria-label="Config"`
- `shape: "circle"`
- `size: "small"`
- `className: "h-[27px] w-[27px]"`
- enabled color:
  - `hint-green`
- disabled color:
  - `disabled`
- default tooltip:
  - `Settings`

Shutdown button contract:

- `data-testid="shutdown-button"`
- `aria-label="Shutdown"`
- hidden branch:
  - returns `null` when `isWasm()` is true
- `shape: "circle"`
- `size: "small"`
- `className: "h-[27px] w-[27px]"`
- enabled color:
  - `red`
- disabled color:
  - `disabled`
- default tooltip:
  - `Shutdown`
- confirmation dialog title:
  - `Shutdown`
- confirmation action label:
  - `Shutdown`
- confirm action primitive:
  - `AlertDialogDestructiveAction`
  - `aria-label: "Confirm Shutdown"`
- destructive description in shell:
  - `This will terminate the Python kernel. You'll lose all data that's in memory.`
- trigger wrapper:
  - `Tooltip`
- trigger click behavior:
  - `event.stopPropagation()`
  - opens destructive confirm modal
- confirmed shutdown side effect order:
  - `sendShutdown()`
  - `setTimeout(() => window.close(), 200)`
  - `closeModal()`

#### 7.4 Save Dialog and Recovery Dialog

Save dialog source:

- `.__marimo_upstream/frontend/src/core/saving/save-component.tsx`
- `.__marimo_upstream/frontend/src/components/editor/RecoveryButton.tsx`
- `.__marimo_upstream/frontend/src/components/editor/header/filename-input.tsx`

Save dialog strings and hooks:

- title:
  - `Save notebook`
- field label:
  - `Save as`
- label class:
  - `text-md pt-6 px-1`
- filename placeholder:
  - `filename`
- filename input component:
  - `FilenameInput`
- filename input class:
  - `missing-filename`
- `onNameChange` callback behavior:
  - stores the raw value in local state
  - when `value.trim()` is non-empty, immediately calls `onSave(value)` and `onClose()`
- cancel button:
  - `data-testid="cancel-save-dialog-button"`
  - label `Cancel`
- submit button:
  - `data-testid="submit-save-dialog-button"`
  - label `Save`
  - `type: "submit"`
  - `disabled` when local filename state is falsy

Recovery ownership split:

- source wrapper:
  - `RecoveryButton`
- proposed filename base:
  - `filename === null ? "app" : Paths.basename(filename).split(".")[0]`
- top-level save branch:
  - `SaveComponent` returns `RecoveryButton` when `connection.state === WebSocketState.CLOSED`
  - otherwise returns the connected `ControlButton` save trigger
- connected save trigger click:
  - `preventDefault()`
  - `stopPropagation()`
  - `saveOrNameNotebook()`
- global hotkey:
  - `useHotkey("global.save", saveOrNameNotebook)`
- beforeunload protection:
  - active only when `needsSave` is true
  - sets `event.returnValue = "You have unsaved changes. Are you sure you want to leave?"`
- connected save action source:
  - `useSaveNotebook()`
  - `saveOrNameNotebook`
- connected save flow:
  - first calls `saveIfNotebookIsPersistent(true)`
  - opens `SaveDialog` only when the filename is not persistent and connection state is not `CLOSED`
- low-level `saveNotebook(filename, userInitiated)` gates:
  - returns immediately in kiosk mode
  - shows alert `Failed to save notebook: not connected to a kernel.` when connection state is not `OPEN`
  - runs `formatAll()` before serialization when `userInitiated && autoSaveConfig.format_on_save`
  - returns without saving when there are no cells
- serialized save payload includes:
  - `cellIds`
  - `codes`
  - `names`
  - `configs`
  - `layout: getSerializedLayout()`
  - `persist: true`
- post-save snapshot update:
  - `setLastSavedNotebook({ names, codes, configs, layout })`
- `global.save` hotkey is bound to recovery open path when the notebook is in the disconnected recovery branch
- disconnected save button color:
  - `gray`
- connected save button colors are documented in the floating save ownership section

Unsaved recovery dialog source:

- `.__marimo_upstream/frontend/src/components/editor/RecoveryButton.tsx`

Recovery dialog strings and hooks:

- title:
  - `Download unsaved changes?`
- wrapper class:
  - `w-fit`
- intro:
  - `This app has unsaved changes. To recover:`
- step text:
  - `Click the "Download" button. This will download a file called ...`
  - `marimo recover <name>.json > <name>.py`
- generated download filename:
  - `${proposedName}.json`
- download blob source:
  - `downloadBlob(new Blob([getNotebookJSON()], { type: "text/plain" }), \`${proposedName}.json\`)`
- form keydown handler:
  - `Escape -> closeModal()`
- cancel button:
  - `data-testid="cancel-recovery-button"`
  - label `Cancel`
- download button:
  - `data-testid="download-recovery-button"`
  - label `Download`

#### 7.5 Floating Pending AI Cells Bar

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/pending-ai-cells.tsx`
- `.__marimo_upstream/frontend/src/components/editor/ai/completion-handlers.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.tsx`

Render gate and ownership:

- source component:
  - `PendingAICells`
- reads staged-cell map from `stagedAICellsAtom`
- returns `null` when `stagedAiCells.size === 0`
- mounted by `app-chrome.tsx` as a floating overlay sibling inside the chrome wrapper

Wrapper class:

- `fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80 border border-border rounded-lg px-3 py-2 flex items-center justify-between gap-2.5 w-100 shadow-[0_0_6px_0_#00A2C733]`

State and navigation contract:

- staged cell id list source:
  - `[...stagedAiCells.keys()]`
- selected index local state starts as:
  - `null`
- focus helper:
  - `scrollAndHighlightCell(cellId, "focus")`
- directional navigation helper:
  - `getNextIndex(currentIndex, ids.length, direction)`
- up or down navigation side effect:
  - updates selected index
  - focuses `ids[nextIndex]`

Exact child order:

- leading status icon
- pending-count navigator
- divider
- accept or reject controls

Leading status icon:

- icon:
  - `SparklesIcon`
- class:
  - `h-4 w-4 text-primary`

Pending-count navigator:

- wrapper class:
  - `flex items-center`
- up button:
  - `Button`
  - `variant: "ghost"`
  - `size: "icon"`
  - icon `ChevronUp`
  - icon class `h-3.5 w-3.5`
- count label class:
  - `text-xs font-mono min-w-[3.5rem] text-center`
- count text branch:
  - when selected index is `null`:
    - `${ids.length} pending`
  - otherwise:
    - `${currentIndex + 1} / ${ids.length}`
- down button:
  - `Button`
  - `variant: "ghost"`
  - `size: "icon"`
  - icon `ChevronDown`
  - icon class `h-3.5 w-3.5`

Divider:

- `div.h-5.w-px.bg-border`

Accept or reject controls:

- wrapper class:
  - `flex items-center gap-1.5`

Accept control branch:

- source call:
  - `AcceptCompletionButton`
- props passed from `PendingAICells`:
  - `multipleCompletions: true`
  - `onAccept: acceptAll`
  - `isLoading: false`
  - `size: "xs"`
  - `buttonStyles: "h-6.5"`
  - `playButtonStyles: "h-6.5"`
  - `runCell: runStagedIds`
- `acceptAll` loop:
  - iterates every `[cellId, cell]` in the staged map
  - calls `acceptStagedCell(cellId, cell, removeStagedCell, deleteStagedCell)`
- `runStagedIds`:
  - `runCell(ids)`
- left text button label:
  - `Accept all`
- left text button contract:
  - `variant: "text"`
  - `size: "xs"`
  - class chain:
    - `h-6 text-(--grass-11) bg-(--grass-3)/60 hover:bg-(--grass-3) dark:bg-(--grass-4)/80 dark:hover:bg-(--grass-3) font-semibold active:bg-(--grass-5) dark:active:bg-(--grass-4) border-(--green-6) border hover:shadow-xs rounded-r-none h-6.5`
- right play button tooltip:
  - `Accept and run all cells`
- right play button contract:
  - `variant: "text"`
  - `size: "xs"`
  - class chain:
    - `h-6 text-(--grass-11) bg-(--grass-3)/60 hover:bg-(--grass-3) dark:bg-(--grass-4)/80 dark:hover:bg-(--grass-3) font-semibold active:bg-(--grass-5) dark:active:bg-(--grass-4) border-(--green-6) border hover:shadow-xs rounded-l-none px-1.5 h-6.5`
- right play icon:
  - play icon from `AcceptCompletionButton`
  - class `h-2.5 w-2.5`
- internal accept wrapper:
  - `div.flex`

Reject control branch:

- source call:
  - `RejectCompletionButton`
- props passed from `PendingAICells`:
  - `multipleCompletions: true`
  - `onDecline: rejectAll`
  - `size: "xs"`
  - `className: "h-6.5"`
- `rejectAll` loop:
  - iterates every `[cellId, cell]` in the staged map
  - calls `rejectStagedCell(cellId, cell, removeStagedCell, deleteStagedCell)`
- rendered label:
  - `Reject all`
- button contract:
  - `variant: "text"`
  - `size: "xs"`
  - class chain:
    - `h-6 text-(--red-10) bg-(--red-3)/60 hover:bg-(--red-3) dark:bg-(--red-4)/80 dark:hover:bg-(--red-3) rounded px-3 font-semibold active:bg-(--red-5) dark:active:bg-(--red-4) border-(--red-6) border hover:shadow-xs h-6.5`

#### 7.5.1 Multi-Cell Selection Toolbar

Source:

- `.__marimo_upstream/frontend/src/components/editor/navigation/multi-cell-action-toolbar.tsx`
- `.__marimo_upstream/frontend/src/components/editor/navigation/selection.ts`

Top-level gate:

- `MultiCellActionToolbar` reads `useCellSelectionState()`
- expands `selectedCells` from `selectionState.selected`
- returns `null` when `selectedCells.length < 2`
- otherwise renders in fragment order:
  - `MultiCellActionToolbarInternal`
  - `MultiCellPendingDeleteBar`

Toolbar overlay wrapper:

- outer wrapper class:
  - `absolute top-12 justify-center flex w-full left-0 right-0 z-50`
- attrs:
  - `data-keep-cell-selection={true}`
- inner surface class:
  - `bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 border border-(--slate-7) rounded-lg shadow-lg p-2 overflow-x-auto overflow-y-hidden mx-20 scrollbar-thin`

Toolbar leading label:

- class:
  - `text-sm font-medium text-muted-foreground px-2 shrink-0`
- text:
  - `${selectedCount} cells selected`

Selection-clear behavior:

- window `mousedown` listener clears selection unless:
  - the event target is inside `[data-keep-cell-selection]`
  - or the event target is `HTMLHtmlElement`
- clear path:
  - `pendingDeleteService.clear()`
  - `selectionActions.clear()`

Primary action groups from `useMultiCellActionButtons(cellIds)`:

- returned object keys:
  - `actions`
  - `moreActions`
- both are normalized by:
  - `.map((group) => group.filter((action) => !action.hidden))`
  - `.filter((group) => group.length > 0)`

Primary `actions` group order:

- group 1:
  - `Run cells`
- group 2:
  - `Move up`
  - `Move down`
- group 3:
  - `Delete cells`
  - `variant: "danger"`
  - hidden when `canDelete` is false

Overflow dropdown `moreActions` group order:

- group 1:
  - `Format cells`
  - `Clear outputs`
- group 2:
  - `Hide code`
  - `Show code`
- group 3:
  - `Move up`
  - `Move down`
  - `Send to top`
  - `Send to bottom`
- group 4:
  - `Disable cells`
  - `Enable cells`

Inline action button shell:

- primitive:
  - `Button`
- variant:
  - `linkDestructive` when `action.variant === "danger"`
  - otherwise `ghost`
- size:
  - `sm`
- class:
  - `h-8 px-2 gap-1 shrink-0 flex items-center`
- title attr:
  - `action.label`
- disabled rule:
  - `isPendingDelete && action.label !== "Delete cells"`

Inline hotkey badge:

- wrapper:
  - `div.ml-1.border.bg-muted.rounded-md.px-1`
- content:
  - `MinimalShortcut`

Group separator:

- local primitive:
  - `Separator`
- rendered DOM:
  - `div.h-4.w-px.bg-border.mx-1`

Overflow dropdown trigger:

- component:
  - `CellStateDropdown`
- disabled when:
  - `isPendingDelete`
- trigger button:
  - `Button`
  - `variant: "ghost"`
  - `size: "sm"`
  - `className: "h-8 px-2 gap-1"`
  - `title: "More actions"`
  - icon `MoreHorizontalIcon size={13} strokeWidth={1.5}`
- menu content:
  - `DropdownMenuContent align="start" data-keep-cell-selection={true}`
- menu rows:
  - `DropdownMenuItem`
  - `className: "flex items-center gap-2"`
  - icon slot wrapper `div.mr-2.w-5.text-muted-foreground`
  - label wrapper `div.flex-1`
  - hotkey slot `MinimalShortcut className="ml-4"`
- group divider:
  - `DropdownMenuSeparator`

Pending delete confirmation bar:

- render gate:
  - only when `pendingDeleteService.shouldConfirmDelete`
- outer wrapper class:
  - `absolute top-12 justify-center flex w-full left-0 right-0 z-50`
- inner surface class:
  - `bg-(--amber-2) border border-(--amber-6) rounded-lg shadow-lg mt-14 px-4 py-3 animate-in slide-in-from-top-2 duration-200`
- warning icon:
  - `AlertTriangleIcon`
  - `className: "w-4 h-4 text-(--amber-11) mt-0.5 shrink-0"`
- copy:
  - `Some cells in selection may contain expensive operations.`
  - `Are you sure you want to delete?`
- actions are wrapped in:
  - `FocusScope restoreFocus={true} autoFocus={true}`
- cancel button:
  - `size: "xs"`
  - `variant: "ghost"`
  - class `text-(--amber-11) hover:bg-(--amber-4) hover:text-(--amber-11)`
- delete button:
  - `size: "xs"`
  - `variant: "secondary"`
  - class `bg-(--amber-11) hover:bg-(--amber-12) text-white border-(--amber-11)`
- confirm path:
  - `deleteCell({ cellIds })`
  - `pendingDeleteService.clear()`
  - `selectionActions.clear()`

#### 7.6 Command Palette Overlay

Source:

- `.__marimo_upstream/frontend/src/components/editor/controls/command-palette.tsx`
- `.__marimo_upstream/frontend/src/components/ui/command.tsx`

Top-level behavior:

- the command palette component is mounted in parallel with the notebook page in both top-level render branches
- document keydown listener toggles `open` when the hotkey for `global.commandPalette` matches
- toggle function:
  - `setOpen(previous => !previous)`

Content composition from `components/editor/controls/command-palette.tsx`:

- state inputs:
  - `open`, `setOpen` from `commandPaletteAtom`
  - `lastFocusedCell` from `lastFocusedCellAtom`
  - `hotkeys` from `hotkeysAtom`
  - `registeredActions` from `useRegisteredActions()`
- cell action source:
  - `useCellActionButtons({ cell: lastFocusedCell }).flat()`
  - normalized through `flattenActions`
- notebook action source:
  - `useNotebookActions()`
  - `useConfigActions()`
  - both normalized through `flattenActions`
- notebook label lookup map:
  - `Objects.keyBy(notebookActionsWithoutHotkeys, (action) => action.label)`
- recents source:
  - `useRecentCommands()`
  - guard set `new Set(recentCommands)`
- root dialog:
  - `CommandDialog`
  - props `open`, `onOpenChange`
- input:
  - `CommandInput`
  - placeholder `Type to search...`
- empty state:
  - `CommandEmpty`
  - text `No results found.`
- optional section:
  - `Recently Used`
- main section:
  - `Commands`
- group ordering:
  - optional `Recently Used`
  - `CommandSeparator`
  - `Commands`
- cell command label prefix:
  - `Cell > ${label}`
- selecting an item:
  - stores the recent command key or label
  - closes the palette
  - runs the action inside `requestAnimationFrame`

`Recently Used` branch contract:

- renders only when `recentCommands.length > 0`
- group heading:
  - `Recently Used`
- each recent entry resolves in this order:
  - if `isHotkeyAction(shortcut)`: `renderShortcutCommandItem`
  - else if label maps to a non-parent notebook action: `renderCommandItem`
  - else `null`

`Commands` branch order:

- first `hotkeys.iterate()`
  - skips entries already present in `recentCommandsSet`
- then `notebookActionsWithoutHotkeys`
  - skips labels already present in `recentCommandsSet`
- then flattened `cellActions`
  - skips labels already present in `recentCommandsSet`

Shortcut item contract:

- root primitive:
  - `CommandItem`
- `key: shortcut`
- `value: hotkey.name`
- `keywords: hotkey.additionalKeywords`
- right slot:
  - `CommandShortcut`
    - `KeyboardHotkeys shortcut={hotkey.key}`
- select path:
  - `addRecentCommand(shortcut)`
  - `setOpen(false)`
  - `requestAnimationFrame(() => action())`

Generic command item contract:

- root primitive:
  - `CommandItem`
- `key: label`
- `value: label`
- `keywords: additionalKeywords`
- tooltip suffix when present:
  - `({props.tooltip})`
- optional right slot:
  - `CommandShortcut`
    - `KeyboardHotkeys shortcut={hotkeys.getHotkey(hotkey).key}`
- select path:
  - `addRecentCommand(label)`
  - `setOpen(false)`
  - `requestAnimationFrame(() => handle())`

Dialog shell from `components/ui/command.tsx`:

- outer dialog wrapper:
  - `Dialog`
- dialog content wrapper:
  - `DialogContent`
  - `className: "overflow-hidden p-0 shadow-2xl"`
  - `usePortal: true`
- command root component:
  - `Command`
  - forwards `ref` to `CommandPrimitive`
  - `filter={smartMatchFilter}`
  - class:
    - `flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground`
- extra root class injected by dialog wrapper:
  - `[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5`

`CommandInput` primitive contract:

- wrapper element:
  - `div`
  - `className: "flex items-center border-b px-3"`
  - optional `rootClassName` append
  - always sets attribute `cmdk-input-wrapper=""`
- default icon branch:
  - renders `Search`
  - `className: "mr-2 h-4 w-4 shrink-0 opacity-50"`
- null-icon branch:
  - when `icon === null`, no leading icon renders
- input primitive:
  - `CommandPrimitive.Input`
  - forwards `ref`
  - class:
    - `placeholder:text-foreground-muted flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50`

List and group primitives:

- `CommandList`
  - `CommandPrimitive.List`
  - class `max-h-[300px] overflow-y-auto overflow-x-hidden`
- `CommandEmpty`
  - `CommandPrimitive.Empty`
  - class `py-6 text-center text-sm`
- `CommandGroup`
  - `CommandPrimitive.Group`
  - class `overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground`
- `CommandSeparator`
  - `CommandPrimitive.Separator`
  - reuses `menuSeparatorVariants({ className })`

`CommandItem` bridge to menu tokens:

- primitive:
  - `CommandPrimitive.Item`
- variant source:
  - `menuItemVariants({ variant, inset })`
- disabled-token replacement:
  - replaces `MENU_ITEM_DISABLED` with `data-[disabled=false]:pointer-events-all data-[disabled=false]:opacity-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50`
- value normalization:
  - `value={Strings.htmlEscape(props.value)}`
- shortcut renderer alias:
  - `CommandShortcut = MenuShortcut`

Cmdk attribute contract:

- root:
  - `cmdk-root`
- input:
  - `cmdk-input`
- list:
  - `cmdk-list`
- item:
  - `cmdk-item`
- group:
  - `cmdk-group`
- empty:
  - `cmdk-empty`
- dialog:
  - `cmdk-dialog`
- overlay:
  - `cmdk-overlay`

Input shell:

- wrapper class:
  - `flex items-center border-b px-3`
- default icon:
  - `Search`
  - class `mr-2 h-4 w-4 shrink-0 opacity-50`
- input class:
  - `placeholder:text-foreground-muted flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50`

List and group shell:

- list class:
  - `max-h-[300px] overflow-y-auto overflow-x-hidden`
- group class:
  - `overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground`
- empty state class:
  - `py-6 text-center text-sm`

Command item contract:

- item primitive:
  - `CommandItem`
- item `value` is HTML-escaped before registration
- disabled state comes from the passed command or menu props
- matching uses `filter: yt`
  - primary match score `1`
  - keyword-only fallback score `0.8`
- root props from cmdk:
  - `loop`
  - `shouldFilter`
  - `disablePointerSelection`
  - `vimBindings`

