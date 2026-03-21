[Back to PRD Index](../PRD.md)

# 5. Workspace Chrome Contract

[Resume from Summary](./10-summary-acceptance-and-copy-plan.md#121-current-state)

Installed asset evidence for this file:

- `./assets/edit-page-CTVRcSta.js`
- `./assets/panels-BfLG6GHU.js`
- `./assets/file-explorer-panel-DclnBp04.js`
- `./assets/dependency-graph-panel-Cg4IqU-y.js`
- `./assets/chat-panel-CYOmGmIc.js`
- `./assets/agent-panel-DFVcMxMV.js`
- `./assets/terminal-D7RRO5NO.js`
- `./assets/panels-B4E3DsXP.css`
- `./assets/dependency-graph-panel-DZccg5W0.css`
- `./assets/terminal-ByuMlBP_.css`

#### 5.1 Left Chrome Rail

Source:

Installed assets:

- `./assets/edit-page-CTVRcSta.js`
- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/sidebar.tsx`
- `.__marimo_upstream/frontend/src/components/ui/reorderable-list.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.tsx`

Wrapper class:

- `h-full pt-4 pb-1 px-1 flex flex-col items-start text-muted-foreground text-md select-none text-sm z-50 dark:bg-background print:hidden hide-on-fullscreen`
- **Light mode has NO background color class** — only dark mode applies `dark:bg-background`

Base sidebar item shell:

- `flex items-center p-2 text-sm mx-px shadow-inset font-mono rounded`
- unselected state adds `hover:bg-(--sage-3)`
- selected state adds `bg-(--sage-4)`

Sidebar item element branch:

- render `button` when `onClick` exists
- render plain `div` when `onClick` is absent

Sidebar item tooltip rules:

- tooltip side is `right`
- tooltip delay is `200`

Sidebar registry contract:

- rail list is reorderable through `ReorderableList`
- `ariaLabel: "Sidebar panels"`
- drag type is `panels`
- list id is `sidebar`
- cross-list drag receiver can move items into the developer panel

Reorderable rail primitive contract:

- cross-list payload MIME:
  - `application/x-reorderable-${dragType}`
- cross-list payload body:
  - `{ itemId: String(key), sourceListId, item }`
- accepted drag types:
  - custom MIME first when cross-list drag is enabled
  - always also accepts `text/plain`
- cross-list receive gates:
  - ignore items whose `sourceListId === crossListDrag.listId`
  - ignore items already present in the destination list by `getKey(item)`
  - accepted receive path first calls `setValue([...])`
  - then calls `onReceive(item, fromListId, insertIndex)`
- intra-list reorder algorithm:
  - collect dragged items by `e.keys`
  - remove them from the current list
  - compute target index from `e.target.key` and `dropPosition`
  - reinsert the dragged block while preserving its relative order
- root collection primitive:
  - `ListBox`
  - `selectionMode: "none"`
- rendered draggable item wrapper:
  - `ListBoxItem`
  - `className: "active:cursor-grabbing data-[dragging]:opacity-60 outline-none"`
- empty placeholder branch:
  - `ListBoxItem`
  - `id: "__empty__"`
  - `className: "min-h-[40px] min-w-[40px]"`
- available-items branch wraps the list with:
  - trigger wrapper `ContextMenuTrigger asChild`
  - option list `ContextMenuContent`
  - combined shell `ContextMenu`
- available item checkbox rows use:
  - `ContextMenuCheckboxItem`
  - disabled when the item is selected and the list length is already at `minItems`
- context-menu toggle rule:
  - checked -> appends the item to the current list
  - unchecked -> removes the item only when `value.length > minItems`
- missing `onAction` target path logs:
  - `handleAction: item not found for key`
- helper label row for sidebar item pickers:
  - `span.flex.items-center.gap-2`
  - icon class `h-4 w-4 text-muted-foreground`

Sidebar panel registry:

- `files` -> `LazyFileExplorerPanel`
- `variables` -> `LazySessionPanel`
- `dependencies` -> `LazyDependencyGraphPanel`
- `packages` -> `LazyPackagesPanel`
- `outline` -> `LazyOutlinePanel`
- `documentation` -> `LazyDocumentationPanel`
- `snippets` -> `LazySnippetsPanel`
- `ai` -> `renderAiPanel()` returning `LazyAgentPanel` when `external_agents` is enabled and the selected AI tab is `agents`; otherwise `LazyChatPanel`
- `errors` -> `LazyErrorsPanel`
- `scratchpad` -> `LazyScratchpadPanel`
- `tracing` -> `LazyTracingPanel`
- `secrets` -> `LazySecretsPanel`
- `logs` -> `LazyLogsPanel`
- `terminal` -> `LazyTerminal` with `visible={isSidebarOpen && selectedPanel === "terminal"}`
- `cache` -> `LazyCachePanel`

Fixed extra rail items:

- feedback item wraps `SidebarItem` with tooltip `Send feedback!`
- running indicator is rendered at the bottom

Rail icon contract:

- generic rail icon renderer `renderIcon(panel, extraClass)` uses:
  - `panel.Icon`
  - base class `h-5 w-5`
- `errors` rail item uses `ErrorPanelIcon`
  - base icon class `h-5 w-5`
  - adds `text-destructive` when `cellErrorCount > 0`
- feedback rail icon:
  - `MessageCircleQuestionIcon`
  - `className: "h-5 w-5"`

Running indicator contract:

- tooltip string when idle: `No cells queued or running`
- tooltip string when non-zero: `${count} cell(s) queued or running`
- tooltip side:
  - `right`
- tooltip delay:
  - `200`
- bar stack wrapper:
  - `flex flex-col-reverse gap-px overflow-hidden`
- bar class:
  - `shrink-0 h-1 w-2 bg-(--grass-6) border border-(--grass-7)`

#### 5.2 Helper Sidebar

Source:

Installed assets:

- `./assets/edit-page-CTVRcSta.js`
- `./assets/panels-BfLG6GHU.js`
- `./assets/panels-B4E3DsXP.css`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/sidebar/sidebar.css`

Panel identity:

- `id="app-chrome-sidebar"`
- `data-testid="helper"`

Panel class:

- `dark:bg-(--slate-1) print:hidden hide-on-fullscreen`
- adds `border-r border-l border-(--slate-7)` when open

Resizable panel contract:

- `collapsedSize: 0`
- `collapsible: true`
- `minSize: 10`
- `defaultSize: 0`
- `maxSize: 75`

Resize handle contract:

- base class `border-border print:hidden z-10`
- collapsed token `resize-handle-collapsed`
- open token `resize-handle`
- orientation `vertical`
- CSS from `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.css`:
  - `.resize-handle, .resize-handle-collapsed { transition: 250ms linear background-color; outline: none }`
  - `.resize-handle.vertical, .resize-handle-collapsed.vertical { width: 4px }`
  - `.resize-handle:hover, .resize-handle[data-resize-handle-active], .resize-handle-collapsed:hover, .resize-handle-collapsed[data-resize-handle-active] { background-color: var(--slate-11) }`

Helper body wrapper:

- `flex flex-col h-full flex-1 overflow-hidden mr-[-4px]`

Header shell:

- `p-3 border-b flex justify-between items-center`

Close button contract:

- `data-testid="close-helper-pane"`
- `variant: "text"`
- `size: "xs"`
- `className: "m-0"`

Header title branch:

- default label class:
  - `text-sm text-(--slate-11) uppercase tracking-wide font-semibold flex-1`
- `dependencies` branch shows segmented control:
  - label `Dependencies`
  - tabs `Minimap`, `Graph`
  - tab item class `py-0.5 text-xs uppercase tracking-wide font-bold`
- `ai` branch with `external_agents` flag shows segmented control:
  - tabs `Chat`, `Agents`
  - tab item class `py-0.5 text-xs uppercase tracking-wide font-bold`

#### 5.2.0 Helper Panel Primitives

Source:

Installed assets:

- `./assets/panels-BfLG6GHU.js`
- `./assets/panels-B4E3DsXP.css`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/components.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`

`PanelAccordionItem`:

- primitive:
  - `AccordionItem`
- forwards ref
- `lastItem` branch:
  - adds `border-b-0`

`PanelAccordionTrigger`:

- primitive:
  - `AccordionTrigger`
- forwards ref
- base class:
  - `px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:no-underline`
- child wrapper:
  - `span.flex.items-center.gap-2`

`PanelAccordionContent`:

- primitive:
  - `AccordionContent`
- forwards ref
- wrapper padding override:
  - `wrapperClassName="p-0"`

`PanelBadge`:

- primitive:
  - `Badge`
- variant:
  - `secondary`
- base class:
  - `py-0 px-1.5 text-[10px]`

`PanelEmptyState`:

- outer wrapper:
  - `mx-6 my-6 flex flex-col gap-2`
- header row:
  - `flex flex-row gap-2 items-center`
- icon clone class:
  - `text-accent-foreground flex-shrink-0`
- title class:
  - `mt-1 text-accent-foreground`
- description class:
  - `text-muted-foreground text-sm`
- action wrapper:
  - `mt-2`

#### 5.2.1 Files Panel Body

Source:

Installed assets:

- `./assets/file-explorer-panel-DclnBp04.js`
- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/file-explorer-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/file-explorer.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/file-viewer.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/upload.tsx`

Top-level branch:

- feature flag:
  - `getFeatureFlag("storage_inspector")`
- when disabled:
  - renders only `FileExplorerComponent`
- when enabled:
  - renders accordion sections:
    - `remote-storage`
    - `files`

Files section header when storage inspector is enabled:

- label:
  - `Files`
- icon:
  - `FileIcon`
  - class `w-4 h-4`

Remote storage section header when storage inspector is enabled:

- label:
  - `Remote storage`
- icon:
  - `HardDrive`
  - class `w-4 h-4`
- count badge:
  - `PanelBadge`
  - shows namespace count when the section is closed and count is non-zero

Local files root body:

- source component:
  - `FileExplorerComponent`
- root class:
  - `flex flex-col overflow-hidden relative`
- root uses dropzone input
- active drag overlay class:
  - `absolute inset-0 flex items-center uppercase justify-center text-xl font-bold text-primary/90 bg-accent/85 z-10 border-2 border-dashed border-primary/90 rounded-lg pointer-events-none`
- active drag text:
  - `Drop files here`

Local files toolbar:

- source component:
  - `Toolbar`
- wrapper class:
  - `flex items-center justify-end px-2 shrink-0 border-b`
- buttons in exact order:
  - add notebook
  - add file
  - add folder
  - upload file
  - refresh
  - toggle hidden files
  - collapse all folders
- button testids:
  - `data-testid="file-explorer-add-notebook-button"`
  - `data-testid="file-explorer-add-file-button"`
  - `data-testid="file-explorer-add-folder-button"`
  - `data-testid="file-explorer-upload-button"`
  - `data-testid="file-explorer-refresh-button"`
  - `data-testid="file-explorer-hidden-files-button"`
  - `data-testid="file-explorer-collapse-button"`
- tooltip strings:
  - `Add notebook`
  - `Add file`
  - `Add folder`
  - `Upload file`
  - `Refresh`
  - `Toggle hidden files`
  - `Collapse all folders`

Local files branch states:

- loading:
  - `Spinner`
  - `size: "medium"`
  - `centered: true`
- error:
  - `ErrorBanner`
- selected file branch:
  - shows back button `data-testid="file-explorer-back-button"`
  - selected-file header class:
    - `flex items-center pl-1 pr-3 shrink-0 border-b justify-between`
  - file detail body is mounted lazily

Selected local file detail lazy body:

- source component:
  - `FileViewer`
- data fetch and draft cache:
  - loads file details with `sendFileDetails({ path: file.path })`
  - writes updates with `sendUpdateFile({ path: file.path, contents: draft })`
  - keeps unsaved drafts in local map `unsavedContentsForFile`, keyed by absolute file path
  - pending branch returns `null`
  - error branch renders `ErrorBanner`
- mime and editability gates:
  - `mimeType = fileDetails.mimeType || "text/plain"`
  - media preview branch when `mimeType in qt`
  - editable-text branch only when `!media && mimeType !== "text/csv"`
  - current-running-notebook warning only when:
    - current notebook path exists
    - selected file is a marimo file
    - selected file path equals current notebook path or ends with `/${currentNotebookPath}`
- empty non-preview branch:
  - when `!contents && !media`
  - root class:
    - `grid grid-cols-2 gap-2 p-6`
  - fields:
    - `Name`
    - `Type`
- top bar:
  - reuses `FilePreviewHeader`
  - `filename = fileDetails.file.name`
  - refresh action calls `refetch`
  - download action:
    - media mime uses `downloadByURL(base64ToDataURL(base64, mimeType), filename)`
    - text or binary uses `downloadBlob(new Blob([contents || draft], { type: mimeType }), filename)`
- top bar actions:
  - marimo-file action gate:
    - `file.isMarimoFile && !isWasm()`
  - marimo-file action tooltip:
    - `Open notebook`
  - marimo-file action button:
    - `variant: "text"`
    - `size: "xs"`
    - icon `ExternalLinkIcon`
    - icon class `h-3.5 w-3.5`
  - non-media actions:
    - `Copy contents to clipboard`
    - `renderShortcut("global.save")`
  - copy and save buttons:
    - `variant: "text"`
    - `size: "xs"`
  - copy icon:
    - `CopyIcon`
    - class `h-3.5 w-3.5`
  - save icon:
    - `SaveIcon`
    - class `h-3.5 w-3.5`
  - save disabled gate:
    - `draft === fileDetails.contents`
- running-notebook warning banner:
  - component:
    - `Alert`
  - props:
    - `variant: "warning"`
    - `className: "rounded-none"`
  - icon:
    - `AlertTriangleIcon`
    - class `h-4 w-4`
  - copy:
    - `Editing the notebook file directly while running in marimo's editor may cause unintended changes. Please use with caution.`
- file renderer:
  - component:
    - `FileContentRenderer`
  - props:
    - `mimeType = mimeType`
    - media branch uses `mediaSource: { base64: fileDetails.contents, mime: mimeType }`
    - editable-text branch uses `contents = draft`
    - readonly-text branch uses `contents = fileDetails.contents ?? undefined`
    - `readOnly = !editableText`
    - `onChange = setDraft`
- dirty-draft persistence:
  - on unmount, if original contents exist and draft differs, cache the draft in `unsavedContentsForFile`
  - if draft matches original contents, remove the cached draft entry
- save hotkey:
  - injects CodeMirror extension:
    - `keymap.of([{ key: hotkeys.getHotkey("global.save").key, stopPropagation: true, run: ... }])`
  - hotkey no-ops when draft equals original contents
  - hotkey triggers the same update path as the save button when dirty

Tree contract:

- tree component:
  - `Tree`
- root props:
  - `width: "100%"`
  - `ref: treeRef`
  - `height: number`
  - `className: "h-full"`
  - `data: fileTree`
  - `initialOpenState: object`
  - `openByDefault: false`
  - `dndManager: DnD manager instance`
  - `renderCursor: () => null`
  - `disableDrop: (parentNode) => !parentNode.data.isDirectory`
  - `onDelete: async callback`
  - `onRename: async callback`
  - `onMove: async callback`
  - `onSelect: callback`
  - `onToggle: async callback`
  - `padding: 15`
  - `rowHeight: 30`
  - `indent: 15`
  - `overscanCount: 1000`
  - `disableMultiSelection: true`
  - `children: Node renderer component`
- hidden-file gate:
  - files starting with `.` are excluded unless `showHiddenFiles` is enabled

Tree row contract:

- row wrapper class:
  - `flex items-center cursor-pointer ml-1 text-muted-foreground whitespace-nowrap group`
- item shell class:
  - `flex items-center pl-1 py-1 cursor-pointer hover:bg-accent/50 hover:text-accent-foreground rounded-l flex-1 overflow-hidden group`
- marimo file inline open affordance:
  - text `open`
  - external icon `ExternalLinkIcon`
- row more-menu button testid:
  - `data-testid="file-explorer-more-button"`
- row more-menu button visibility:
  - `opacity-0 group-hover:opacity-100 transition-opacity`
  - hidden by default, appears on row hover via parent `group` class
- drag-drop highlight state:
  - when a drop target is active, row adds `bg-accent/80`

File row dropdown inventory:

- `Open file`
- `Open file in external editor`
- `Create notebook`
- `Create file`
- `Create folder`
- `Rename`
- `Duplicate`
- `Copy path`
- `Copy relative path`
- `Insert snippet for reading file`
- `Copy snippet for reading file`
- `Open notebook`
- `Download`
- `Delete`

Local file prompts and dialogs:

- create-folder prompt title:
  - `Folder name`
- create-file prompt title:
  - `File name`
- create-notebook prompt title:
  - `Notebook name`
- delete confirm title:
  - `Delete file`
- delete confirm description:
  - `Are you sure you want to delete ${name}?`
- confirm button label:
  - `Delete`

Tree engine contract:

- explorer root props:
  - `width: "100%"`
  - `openByDefault: false`
- render cursor:
  - `wn -> null`
- disableDrop:
  - `!parentNode.data.isDirectory`
- select callback:
  - directories are ignored
  - files open preview pane

Local file row interaction detail:

- row container is `draggable: true`
- directory row click:
  - `toggle()`
- inline marimo open affordance:
  - hidden by default
  - `group-hover:inline`
- rename input class:
  - `flex-1 bg-transparent border border-border text-muted-foreground`
- rename input behavior:
  - focus on mount
  - select basename before extension
  - `Escape -> reset`
  - `Enter -> submit`
- row drop-highlight for directory target:
  - `bg-accent/80 hover:bg-accent/80 text-accent-foreground`

File row menu detail:

- dropdown class:
  - `print:hidden w-[220px]`
- separators:
  - `DropdownMenuSeparator`
- menu icon class token:
  - `MENU_ITEM_ICON_CLASS`
- duplicate name rule:
  - `${base}_copy${ext}`
- duplicate failure toast:
  - title `Failed to duplicate file`
  - description `Unable to create a duplicate of the file`
- copy-path toast:
  - title `Copied to clipboard`
- copy-read-snippet toast:
  - title `Copied to clipboard`
  - description `Code to open the file has been copied to your clipboard. You can also drag and drop this file into the editor`
- marimo notebook open path:
  - `openMarimoNotebook(event, tree.relativeFromRoot(path))`
- download branch gate:
  - hidden for directories
  - hidden when `disableFileDownloads` is true

Remote storage body:

- source component:
  - `StorageInspector`
- root class:
  - `border-b bg-background rounded-none h-full pb-10 overflow-auto outline-hidden scrollbar-thin`
- search input placeholder:
  - `Search entries...`
- clear-search button:
  - textless text-button with `XIcon`
- search-help tooltip:
  - `Filters loaded entries only. Expand directories to include their contents in the search.`

Remote storage empty state:

- title:
  - `No storage connected`
- description includes:
  - `Create an obstore or fsspec connection in your notebook.`
  - docs link to marimo remote storage guide
- action label:
  - `Add remote storage`

Remote storage namespace row:

- row class:
  - `flex flex-row font-semibold h-7 text-xs gap-1.5 bg-(--slate-2) text-muted-foreground rounded-none`
- refresh tooltip:
  - `Refresh storage connection`
- empty-state strings inside an opened namespace:
  - `Loading...`
  - `No entries`
  - `No matches`

Remote storage entry row:

- row class:
  - `text-xs flex items-center gap-1.5 cursor-pointer rounded-none group h-6.5`
- hover metadata shells:
  - size label class `text-[10px] text-muted-foreground pr-2 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums`
  - modified label class `text-[10px] text-muted-foreground pr-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`
- row dropdown inventory:
  - `View`
  - `Copy path`
  - `Download`
  - `Insert read snippet`
  - `Insert download snippet`

Remote storage preview pane:

- source component:
  - `StorageFileViewer`
- top bar component:
  - `FilePreviewHeader`
- top bar wrapper class:
  - `flex items-center shrink-0 border-b px-1 gap-1`
- back tooltip:
  - `Back to file list`
- refresh tooltip:
  - `Refresh`
- download tooltip:
  - `Download`
- metadata labels:
  - `Path`
  - `Type`
  - `Size`
  - `Modified`
- preview branch strings:
  - `File is too large to preview (...)`
  - `Loading preview...`
  - `Failed to load preview: ...`
  - `Retry`
  - `Preview not available for this file type.`

Remote storage detail pane:

- title row filename shell:
  - `flex items-center gap-1.5 flex-1 min-w-0 text-xs font-semibold truncate`
- top-right actions wrapper:
  - `flex items-center gap-0.5 shrink-0`
- metadata grid:
  - `grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 p-4 text-xs`
- path value shell:
  - `truncate flex items-center gap-1.5`
- raw path text:
  - `font-mono text-[11px]`
- oversize-file note:
  - `px-4 pb-4 text-xs text-muted-foreground italic`
- loading preview shell:
  - `flex-1 flex items-center justify-center gap-2 text-xs text-muted-foreground min-h-24`
- failed preview text:
  - `px-4 pb-4 text-xs text-destructive`
- retry button:
  - `variant: "secondary"`
  - `size: "xs"`
- unavailable-preview shell:
  - `p-4 flex items-center gap-2 text-xs text-muted-foreground`

Files panel local and remote accordion state:

- file explorer state atom key:
  - `marimo:file-explorer-panel:state`
- default atom value:
  - `{ openSections: ["files"], hasUserInteracted: false }`
- when `storage_inspector` is enabled and namespaces exist before user interaction:
  - auto-adds `remote-storage` to `openSections`
- header height constant:
  - `33`
- split rule when both accordion sections are open:
  - `remote-storage maxHeight = Math.round((height - 66) * 0.4)`
  - `files height = Math.max(200, availableHeight - remoteHeight)`

Local upload and drop contract:

- dropzone options:
  - `multiple: true`
  - `maxSize: 104857600`
- empty-drop guard:
  - returns early when `acceptedFiles.length === 0`
- upload progress titles:
  - single `Uploading file...`
  - plural `Uploading files...`
- success titles:
  - single `File uploaded`
  - plural `${count} files uploaded`
- failure title:
  - `File upload failed`
- rejection description row:
  - `${file.name} (${errors.join(", ")})`
- path derivation order:
  - `file.webkitRelativePath`
  - `file.path`
  - `file.relativePath`
- path normalization:
  - strips any leading `/` before path splitting
- directory target derivation:
  - when a relative path exists, parent directory comes from `PathBuilder.guessDeliminator(filePath).dirname(filePath)`
- upload body encoding:
  - `serializeBlob(file)` is split on `,`
  - upload sends the raw base64 tail as `contents`
- per-file create request:
  - `sendCreateFileOrFolder({ path: directoryPath, type: "file", name: file.name, contents: base64 })`
- post-upload side effect:
  - `refreshRoot()` runs after the file loop completes

#### 5.2.2 Variables and Data Sources Panel Body

Source:

Installed assets:

- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/datasources-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/session-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/variable-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/components.tsx`
- `.__marimo_upstream/frontend/src/components/datasources/datasources.tsx`
- `.__marimo_upstream/frontend/src/components/variables/variables-table.tsx`

Visible mount contract:

- `app-chrome.tsx` sidebar registry maps the visible `variables` panel key to:
  - `LazySessionPanel`
- `variable-panel.tsx` exists as a simpler standalone variable-only panel file
- current visible marimo chrome mounts `session-panel.tsx`, not `variable-panel.tsx`

Top-level sections:

- accordion type:
  - `multiple`
- sections:
  - `datasources`
  - `variables`
- root class:
  - `flex flex-col h-full overflow-auto`

Persistent accordion state:

- storage atom key:
  - `marimo:session-panel:state`
- default value:
  - `{ openSections: ["variables"], hasUserInteracted: false }`
- datasource count formula:
  - `tables.length + dataConnections.length`
- auto-open rule before user interaction:
  - when datasource count is greater than `0`, `openSections` expands to include `datasources`
- `onValueChange` path:
  - stores the new `openSections`
  - sets `hasUserInteracted: true`

Data sources section header:

- label:
  - `Data sources`
- icon:
  - `DatabaseIcon`
  - class `w-4 h-4`
- count badge:
  - `PanelBadge`
  - shown when there are data sources and the section is closed

Variables section header:

- label:
  - `Variables`
- icon:
  - `VariableIcon`
  - class `w-4 h-4`

Data sources body:

- source component:
  - `DataSources`
- root command primitive:
  - `Command`
  - `shouldFilter: false`
- empty state when both Python tables and external connections are absent:
  - title `No tables found`
  - description `Any datasets/dataframes in the global scope will be shown here.`
  - action `Add database or catalog`
- search input placeholder:
  - `Search tables...`
- search shell wrapper:
  - `flex items-center w-full border-b`
- search behavior:
  - `closeAllColumns(value.length > 0)`
  - then updates local `searchValue`
- search input class:
  - `h-6 m-1`
- search input rootClassName:
  - `flex-1 border-r border-b-0`
- clear-search button class:
  - `float-right border-b px-2 m-0 h-full hover:bg-accent hover:text-accent-foreground`
- add-connection button:
  - wrapped by `AddConnectionDialog`
  - `Button variant="ghost" size="sm" className="px-2 rounded-none focus-visible:outline-hidden"`
- body wrapper:
  - `border-b bg-background rounded-none h-full pb-10 overflow-auto outline-hidden`

Connection group contract:

- Python table sorting:
  - `sortedTablesAtom` sorts by the declaring variable's first `declaredBy` cell index
  - tables with no `variable_name` sort to the top via `-1`
- connection filtering and order:
  - `connectionsAtom` removes internal SQL engines with zero databases
  - it also removes an internal engine that has only the default DuckDB database and zero schemas
  - remaining internal engines sort after user-defined connections
- connection row class:
  - `pl-3 pr-2`
- in-memory connection display name:
  - `In-Memory`
- refresh tooltip for external connections:
  - `Refresh connection`
- empty strings:
  - `No databases available`
  - `No schemas available`
  - `No tables found`
  - `Loading tables...`
  - `Loading columns...`
  - `No columns found`

Table tree contract:

- table row base class:
  - `rounded-none group h-8 cursor-pointer`
- hover action tooltip:
  - `Add table to notebook`
- summary text format:
  - `${numRows} rows, ${numColumns} columns`
- add-table click prelude:
  - calls `maybeAddMarimoImport({ autoInstantiate, createNewCell, fromCellId: lastFocusedCellId })`
- add-table code branches:
  - catalog source -> `${engine}.load_table("${database}.${table}")` when database exists, otherwise `${engine}.load_table("${table}")`
  - local source -> `mo.ui.table(${table.name})`
  - duckdb or connection source -> `sqlCode({ table, columnName: "*", sqlTableContext })`
- add-table insertion path:
  - `useAddCodeToNewCell()(generatedCode)`

Column row contract:

- column copy tooltip:
  - `Copy column name`
- primary-key badge tooltip:
  - `Primary key`
- indexed badge tooltip:
  - `Indexed`
- preview wrapper adds:
  - `pr-2 py-2 bg-(--slate-1) shadow-inner border-b`
- local expansion side effects:
  - when expanded, adds `${table.name}:${column.name}` to `expandedColumnsAtom`
  - when collapsed, removes the same key
- close-all-columns gate:
  - when `closeAllColumnsAtom` becomes true while expanded, the column collapses immediately
- PK badge shell:
  - `text-xs text-black bg-gray-100 dark:invert rounded px-1`
- IDX badge shell:
  - `text-xs text-black bg-gray-100 dark:invert rounded px-1`

Variables body:

- when empty:
  - `No variables defined`
  - wrapper class:
    - `px-3 py-4 text-sm text-muted-foreground`
- otherwise renders:
  - `VariableTable`
  - props:
    - `cellIds={cellIds.inOrderIds}`
    - `variables={variables}`
- variable table search placeholder:
  - `Search`
- variable search input class:
  - `w-full`
- default variable sort:
  - when there is no explicit sort, rows sort by the index of `declaredBy[0]` in notebook order
- resolved variable naming:
  - internal cell names render as `cell-${index}`
  - unnamed cells also fall back to `cell-${index}`
- declared-by click path:
  - resolves `getCellEditorView(cellId)`
  - when an editor exists, calls `goToVariableDefinition(editorView, variableName)`
- used-by click path:
  - `CellLinkList` passes the same highlight callback
- type-value cell shell:
  - outer wrapper `max-w-[150px]`
  - data type line `text-ellipsis overflow-hidden whitespace-nowrap text-muted-foreground font-mono text-xs`
  - value line `text-ellipsis overflow-hidden whitespace-nowrap`
- table shell:
  - `w-full text-sm flex-1 border-separate border-spacing-0`
- header row class:
  - `whitespace-nowrap text-xs`
- sticky header cell class:
  - `sticky top-0 bg-background border-b`
- body row hover:
  - `hover:bg-accent`
- body cell border:
  - `border-b`

Variable table columns:

- column count:
  - `3`
- column 1 header:
  - `Name`
- column 2 header:
  - nested vertical layout `div.flex.flex-col.gap-1`
  - top sub-header `span`: `Type`
  - bottom sub-header `span`: `Value`
- column 3 header:
  - nested vertical layout `div.flex.flex-col.gap-1`
  - top sub-header `span`: `Declared By`
  - bottom sub-header `span`: `Used By`

Declared and used-by cell affordances:

- declared-by icon:
  - `SquareEqualIcon`
- used-by icon:
  - `WorkflowIcon`
- multiple declared-by cells use destructive text links

#### 5.2.3 Dependencies Panel Body

Source:

Installed assets:

- `./assets/dependency-graph-panel-Cg4IqU-y.js`
- `./assets/dependency-graph-panel-DZccg5W0.css`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/dependency-graph-panel.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/dependency-graph.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/dependency-graph.css`
- `.__marimo_upstream/frontend/src/components/dependency-graph/custom-node.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/minimap-content.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/panels.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/elements.ts`
- `.__marimo_upstream/frontend/src/components/dependency-graph/utils/layout.ts`
- `.__marimo_upstream/frontend/src/components/dependency-graph/utils/useFitToViewOnDimensionChange.ts`

Top-level root:

- class:
  - `w-full h-full flex-1 mx-auto -mb-4 flex flex-col`

Header tab row inside the helper sidebar:

- uses helper header segmented control documented in `5.2`
- values:
  - `minimap`
  - `graph`

Developer-panel-local tab row:

- only renders when `usePanelSection() === "developer-panel"`
- wrapper class:
  - `p-2 shrink-0`
- tabs:
  - `Minimap`
  - `Graph`
- tab item class:
  - `py-0.5 text-xs uppercase tracking-wide font-bold`

Content branch wrapper:

- class:
  - `flex-1 min-h-0 relative`
- branch:
  - `minimap -> MinimapContent`
  - `graph -> DependencyGraph`

Minimap branch:

- outer class:
  - `overflow-y-auto overflow-x-hidden flex-1 scrollbar-none h-full max-w-80`
- inner list class:
  - `py-3 pl-3 pr-4 relative min-h-full`
- hidden filler:
  - `h-0 overflow-hidden`
- column separator line:
  - `absolute left-5 w-[36px] h-px bg-(--gray-4) pointer-events-none`

Minimap row button contract:

- element:
  - `button`
- attributes:
  - `data-node-id={cellId}`
- base class:
  - `group bg-transparent text-left w-full flex relative justify-between items-center`
  - `border-none rounded cursor-pointer`
  - `h-[21px] pl-[51px] font-inherit`
- unfocused color branch:
  - `text-(--gray-8) hover:text-(--gray-9)`
- focused or selected graph branch:
  - `text-primary-foreground`

Minimap row inner shell:

- wrapper class:
  - `group-hover:bg-(--gray-2) flex h-full w-full px-0.5 items-center rounded`
- focused adds:
  - `bg-primary group-hover:bg-primary`
- code text shell:
  - `truncate px-1 font-mono text-sm flex gap-1`
- empty code fallback:
  - `italic`
  - text `empty`

Minimap relation SVG overlay:

- class base:
  - `absolute overflow-visible top-[10.5px] left-[calc(var(--spacing-extra-small,8px)+17px)] pointer-events-none`
- selected row adds:
  - `z-[1]`
- unselected row adds:
  - `z-0`
- focused-row path pitch:
  - vertical delta uses `21px` per row
- focused-row cycle path:
  - `M -3 0 H -7 v ${delta} h 14 v ${-delta} H 3`
- focused-row parent-only path:
  - `M -3 0 H -7 v ${delta} h -4`
- focused-row child-only path:
  - `M 3 0 H 7 v ${delta} h 4`
- focused-row connection lines:
  - `fill: "none"`
  - `strokeWidth: "2"`
  - `stroke: "currentColor"`

Graph branch:

- source component:
  - `DependencyGraph`
- graph element creation:
  - source builder:
    - `TreeElementsBuilder.createElements`
  - skips variable entry when:
    - `variable.name === "mo"`
    - `variable.value === "marimo"`
  - edge creation:
    - creates one edge per `declaredBy x usedBy` pair
    - deduplicates edges by key `${fromId}-${toId}` (no direction in dedup key)
    - final edge ID includes direction for VerticalElementsBuilder: `${source}-${target}-${direction}`
    - TreeElementsBuilder edge ID has no direction: `${source}-${target}`
  - node visibility filters only hide unconnected nodes:
    - `hidePureMarkdown` hides nodes whose trimmed code starts with `mo.md`
    - `hideReusableFunctions` hides nodes whose `runtime.serialization?.toLowerCase()` equals `"valid"` and have no edges
- graph node creation:
  - createNode returns:
    - `id = cellId`
    - `data = { atom, forceWidth: 300 }`
    - `width: 300`
    - `type: "custom"`
    - `position: { x: 0, y: 0 }`
- layout state atoms:
  - direction atom:
    - `graphViewAtom = atom<LayoutDirection>("TB")`
  - settings atom:
    - `graphViewSettings = atom<GraphSettings>({ hidePureMarkdown: true, hideReusableFunctions: false })`
- graph layout engine:
  - source helper:
    - `layoutElements`
  - engine:
    - `dagre graphlib`
  - graph config:
    - `rankdir = layoutDirection`
    - `nodesep: 150`
    - `ranksep: 200`
    - `ranker: "longest-path"`
  - each edge is inserted as:
    - `setEdge(edge.source, edge.target)`
  - each node width or height fallback:
    - `width ?? 0`
    - `height ?? 0`
- auto-fit effect:
  - source helper:
    - `useFitToViewOnDimensionChange`
  - watches canvas width and height selectors
  - calls `fitView({ duration: 100 })`
  - fit is debounced by `100ms`
- node type registry:
  - `nodeTypes = { custom: CustomNode }`
- graph canvas uses React Flow wrapper `ReactFlow`
- graph wrapper passes:
  - `minZoom: .2`
  - `fitView: true`
  - `zoomOnDoubleClick: false`
  - `nodesConnectable: false`
- fitView options:
  - `minZoom: .5`
  - `maxZoom: 1.5`
- background:
  - `Background`
  - `variant: BackgroundVariant.Dots`
  - `color: "#ccc"`
- jump-to-focused-cell overlay:
  - `Controls position="bottom-right" showInteractive={false}`
  - tooltip text:
    - `Jump to focused cell`
  - tooltip side:
    - `left`
- tooltip delay:
  - `200`

Custom graph node shell:

- source component:
  - `CustomNode`
- orientation context:
  - React context `EdgeMarkerContext`
  - default value `LR`
- handle color token:
  - selected node uses `var(--gray-9)`
  - unselected node uses `var(--gray-3)`
- input handles:
  - target handle testid `input-one`
  - source handle testid `input-two`
  - `LR` layout positions both on `Left`
  - `TB` layout positions both on `Top`
- output handles:
  - source handle testid `output-one`
  - target handle testid `output-two`
  - `LR` layout positions both on `Right`
  - `TB` layout positions both on `Bottom`
- handle ID sharing:
  - all nodes share the same two Handle IDs: `INPUTS_HANDLE_ID = "inputs"` and `OUTPUTS_HANDLE_ID = "outputs"`
  - each node renders 4 Handle elements (2 input positions, 2 output positions) but uses only 2 unique ID values
  - comment in source: `"The nodes must have the same handle IDs to ensure edges connect correctly"`
- node card shell class:
  - `flex flex-col bg-card border border-input/50 rounded-md mx-[2px] overflow-hidden`
- selected node adds:
  - `border-primary`
- width rule:
  - `forceWidth || clamp(containerWidth - 100, 100, 400)`
- title bar class:
  - `text-muted-foreground font-semibold text-xs py-1 px-2 bg-muted border-b`
- title text source:
  - `displayCellName(cell.name, cellIndex)`
- body renderer:
  - `TinyCode`
  - receives `code = cell.code`
- node memo equality:
  - compares only `data`, `selected`, and `id`

Graph toolbar:

- root uses React Flow panel:
  - `position: "top-right"`
  - `className: "flex flex-col items-end gap-2"`
- orientation buttons:
  - `Vertical Tree`
  - `Horizontal Tree`
- orientation buttons use:
  - `variant: "outline"`
  - `size: "xs"`
  - `className: "bg-background"`
  - `aria-selected` mirrors active layout
- vertical icon:
  - `NetworkIcon`
  - `className: "w-4 h-4 mr-1"`
- horizontal icon:
  - `NetworkIcon`
  - `className: "w-4 h-4 mr-1 transform -rotate-90"`

Graph settings popover:

- trigger:
  - text button
  - `variant: "text"`
  - `size: "xs"`
  - settings icon `SettingsIcon`
- popover body class:
  - `w-auto p-2 text-muted-foreground`
- title:
  - `Settings`
- checkbox rows:
  - `flex items-center gap-2`
- toggles:
  - `data-testid="hide-pure-markdown-checkbox"`
  - `data-testid="hide-reusable-functions-checkbox"`
- labels:
  - `Hide pure markdown`
  - `Hide reusable functions`

Graph selection panel:

- mounted as React Flow panel:
  - `position: "bottom-left"`
  - `className: "max-h-[90%] flex flex-col w-[calc(100%-5rem)]"`
- card shell:
  - `min-h-[100px] shadow-md rounded-md border max-w-[550px] border-primary/40 my-4 min-w-[240px] bg-(--slate-1) text-muted-foreground/80 flex flex-col overflow-y-auto`

Graph selection: node branch:

- header class:
  - `font-bold py-2 flex items-center gap-2 border-b px-3`
- header icons:
  - `SquareFunction`
  - cell menu trigger `ConnectionCellActionsDropdown` with `MoreVerticalIcon`
  - close button `variant: "text"`, `size: "icon"`
- section root:
  - `text-sm flex flex-col py-3 pl-2 pr-4 flex-1 justify-center`
- subsection shell:
  - `flex flex-col gap-2`
- subsection labels:
  - `Outputs`
  - `Inputs`
- divider:
  - `hr.border-divider.my-3`
- empty placeholder:
  - `--`
- variable grid:
  - `grid grid-cols-5 gap-3 items-center text-sm py-1 flex-1 empty:hidden`
- variable value cell:
  - `truncate col-span-2`
- type suffix:
  - `ml-1 truncate text-foreground/60 font-mono`
- related-cell column:
  - `truncate col-span-2 gap-1 items-center`

Graph selection: edge branch:

- header class:
  - `font-bold py-2 flex items-center gap-2 border-b px-3`
- header icons:
  - `WorkflowIcon`, `ArrowRightIcon`
- body grid:
  - `grid grid-cols-4 gap-3 max-w-[350px] items-center text-sm p-3 flex-1`
- type cell:
  - `truncate text-foreground/60 font-mono`
- value cell:
  - `truncate col-span-2`

Minimap relation glyph contract:

- independent cell circle radius:
  - `1.5`
- connected cell circle radius:
  - `3`
- selected relation shift:
  - `left -> translate(-14, 0)`
  - `right -> translate(14, 0)`
  - both or neither -> `translate(0, 0)`
- whisker paths:
  - left `M 0 0 h -8`
  - right `M 0 0 h 8`
- focused relation graph lines:
  - `strokeWidth: "2"`
  - `stroke: "currentColor"`
- color contract:
  - `hasError -> text-destructive`
  - `no selection and not isolated -> text-foreground`
  - `selected cell or adjacent relation -> text-primary`
  - fallback -> `text-(--gray-8)`

Graph interaction contract:

- single click on graph node:
  - selects node in local state
- edge click on graph canvas:
  - selects edge in local state as `{ type: "edge", source, target }`
- single click on focused minimap row:
  - blurs current focused cell
- single click on unfocused minimap row:
  - `focusCell({ cellId, where: "exact" })`
- double click on graph node:
  - `scrollAndHighlightCell(node.id as CellId, "focus")`
- jump-to-focused-cell action:
  - `fitView({ padding: 1, duration: 600, nodes: [focusedNode] })`
- auto-fit debounce:
  - `100ms`

#### 5.2.4 Documentation Panel Body

Source:

Installed assets:

- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/documentation-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`
- `.__marimo_upstream/frontend/src/documentation.css`

Codaro shipped-product fork:

- marimo source exposes a full documentation panel in this slot
- Codaro keeps the slot but ships `Context Help` instead of a docs browser
- internal repo docs such as `DEV.md`, `PRD.md`, `SPEC.md`, and launcher design notes must never surface here
- long-form docs, blog, and search always open the public `landing/` site

Empty state:

- title:
  - `View docs as you type`
- description:
  - `Move your text cursor over a symbol to see its documentation.`
- icon:
  - `TextSearchIcon`
- source state:
  - `useAtomValue(documentationAtom).documentation`

Non-empty body:

- root class:
  - `p-3 overflow-y-auto overflow-x-hidden h-full docs-documentation flex flex-col gap-4`
- content source:
  - `renderHTML`
- render path:
  - `renderHTML({ html: documentation })`
- imported stylesheet:
  - `../../documentation.css`

#### 5.2.5 Outline Panel Body

Source:

Installed assets:

- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/outline-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/outline/floating-outline.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/outline/useActiveOutline.ts`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/outline-panel.css`

Empty state:

- title:
  - `No outline found`
- description:
  - `Add markdown headings to your notebook to create an outline.`
- icon:
  - `ScrollTextIcon`

Non-empty body:

- source renderer:
  - `OutlineList`
- state source:
  - `activeHeaderId`
  - `activeOccurrences`
- `headerElements` source:
  - `findOutlineElements(items)`
- active-state hook:
  - `useActiveOutline(headerElements)`

Panel outline list contract:

- root class:
  - `flex flex-col overflow-auto py-4 pl-2`
- row base class:
  - `px-2 py-1 cursor-pointer hover:bg-accent/50 hover:text-accent-foreground rounded-l`
- level styling:
  - `level 1 -> font-semibold`
  - `level 2 -> ml-3`
  - `level 3 -> ml-6`
  - `level 4 -> ml-9`
- active row add:
  - `text-accent-foreground`
- click path:
  - `scrollToOutlineItem(item, occurrences)`
- html branch:
  - uses `dangerouslySetInnerHTML`
- plain-text branch:
  - renders `item.name`

Floating outline contract:

- hidden branch:
  - returns `null` when `items.length < 2`
- wrapper class:
  - `fixed top-[25vh] right-8 z-10000 print:hidden hidden md:block`
- hover state:
  - local `isHovered`
- sliding outline list class:
  - `-top-4 max-h-[70vh] bg-background rounded-lg shadow-lg absolute overflow-auto transition-all duration-300 w-[300px] border`
- hovered position:
  - `-left-[280px] opacity-100`
- idle position:
  - `left-[300px] opacity-0`

MiniMap contract:

- root class:
  - `flex flex-col gap-4 items-end max-h-[70vh] overflow-hidden`
- glyph base class:
  - `h-[2px] bg-muted-foreground/60`
- width by level:
  - `level 1 -> w-5`
  - `level 2 -> w-4`
  - `level 3 -> w-3`
  - `level 4 -> w-2`
- active glyph add:
  - `bg-foreground`
- glyph click path:
  - `scrollToOutlineItem(item, occurrences)`

Active-outline hook contract:

- scroll root:
  - edit mode uses `document.getElementById("App")`
- observer config:
  - `rootMargin: "0px"`
  - `threshold: 0`
- active selection rule:
  - chooses the topmost intersecting header
- scroll highlight path:
  - `element.scrollIntoView({ behavior: "smooth", block: "start" })`
  - adds `outline-item-highlight`
  - removes it after `3000ms`
- outline highlight CSS:
  - `text-decoration: underline`
  - `@apply decoration-primary`

#### 5.2.6 Packages Panel Body

Source:

Installed assets:

- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/packages-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/packages-utils.ts`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`

Loading and error branches:

- loading spinner:
  - `size: "medium"`
  - `centered: true`
- error renderer:
  - `ErrorBanner`

Top-level wrapper:

- class:
  - `flex-1 flex flex-col overflow-hidden`
- async load shape:
  - `Promise.all([getPackageList(), getDependencyTree()])`
  - result `{ list, tree }`
- package-manager source:
  - `useResolvedMarimoConfig().package_management.manager`

Install/search prompt row:

- wrapper class:
  - `flex items-center w-full border-b`
- input placeholder:
  - `Install packages with ${packageManager}...`
- input primitive:
  - `SearchInput`
- input id:
  - `PACKAGES_INPUT_ID`
- input root class:
  - `flex-1 border-none`
- leading branch:
  - loading spinner `small`
  - otherwise tooltip `Change package manager`
- package-manager icon:
  - `BoxIcon className="mr-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-80 cursor-pointer"`
  - click path `openSettings("packageManagementAndData")`
- atom handoff:
  - watches `packagesToInstallAtom`
  - when populated:
    - copies atom value into local input
    - clears atom to `null`
- add button:
  - text `Add`
- add button class:
  - `float-right px-2 m-0 h-full text-sm text-secondary-foreground ml-2`
- active-input add:
  - `bg-accent text-accent-foreground`
- disabled add state:
  - `disabled:cursor-not-allowed disabled:opacity-50`
- install path:
  - `stripPackageManagerPrefix(input)`
  - `handleInstallPackages([cleanedInput], onSuccessInstallPackages)`
- success side effect:
  - `onSuccess()`
  - local input reset to `""`
- tooltip help body documents accepted package formats:
  - package name
  - package and version
  - git
  - URL
  - path

Mode switch header:

- only renders when dependency tree exists
- wrapper class:
  - `flex items-center justify-between px-2 py-1 border-b`
- left switch labels:
  - `List`
  - `Tree`
- right environment pill class:
  - `items-center border px-2 py-0.5 text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground rounded-sm text-ellipsis block overflow-hidden max-w-fit font-medium`
- pill text:
  - `<root> -> sandbox`
  - otherwise `project`

List branch:

- empty state:
  - title `No packages`
  - description `No packages are installed in this environment.`
  - icon `BoxIcon`
- table columns:
  - `Name`
  - `Version`
  - empty actions column
- table wrapper:
  - `overflow-auto flex-1`
- row class:
  - `group`
- row click copies:
  - `${name}==${version}`
- row click success toast:
  - `Copied to clipboard`
- row actions:
  - `Upgrade`
  - `Remove`

Package action button primitive:

- loading branch:
  - `Spinner size="small" className="h-4 w-4 shrink-0 opacity-50"`
- button class:
  - `px-2 h-full text-xs text-muted-foreground hover:text-foreground`
  - `invisible group-hover:visible`
- click wrapper:
  - `Events.stopPropagation(onClick)`
- upgrade action:
  - hidden in WASM
  - calls `addPackage({ package, upgrade: true, group })`
  - success toast helper `showUpgradePackageToast`
- remove action:
  - calls `removePackage({ package, group })`
  - success toast helper `showRemovePackageToast`
- both actions derive `group` from the `group` tag when present

Tree branch:

- loading fallback:
  - `size: "medium"`
  - `centered: true`
- empty tree state:
  - title `No dependencies`
  - description `No package dependencies found in this environment.`
  - icon `BoxIcon`
- tree wrapper:
  - `flex-1 overflow-auto`
- expanded state reset:
  - `useEffect(() => setExpandedNodes(new Set()), [tree])`
- top-level node row class:
  - `flex items-center group cursor-pointer text-sm whitespace-nowrap`
  - `hover:bg-(--slate-2) focus:bg-(--slate-2) focus:outline-hidden`
- top-level row adds:
  - `px-2 py-0.5`
- nested row indent:
  - inline `paddingLeft`
- role/aria:
  - `role="treeitem"`
  - `tabIndex={0}`
  - `aria-selected={false}`
  - `aria-expanded={hasChildren ? isExpanded : undefined}`
- keyboard toggle:
  - `Enter` or `Space`
- tags:
  - `cycle`
  - `extra`
  - `group`

#### 5.2.7 Snippets Panel Body

Source:

Installed assets:

- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/snippets-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/components/contribute-snippet-button.tsx`

Loading and error branches:

- loading spinner:
  - `size: "medium"`
  - `centered: true`
- error renderer:
  - `ErrorBanner`

Contribute modal trigger:

- source component:
  - `ContributeSnippetButton`
- trigger button class:
  - `float-right px-2 m-0 h-full hover:bg-accent hover:text-accent-foreground`

Contribute modal:

- title:
  - `Contribute a Snippet`
- body text:
  - `Have a useful snippet you want to share with the community? Make a pull request on GitHub.`
- close button:
  - `data-testid="snippet-close-button"`
  - text `Close`

Split layout:

- left resizable panel:
  - `defaultSize: 40`
  - `minSize: 20`
  - `maxSize: 70`
- divider class:
  - `bg-border hover:bg-primary/50 transition-colors`
- right panel:
  - `defaultSize: 60`
  - `minSize: 20`

Search shell:

- wrapper class:
  - `flex items-center w-full border-b`
- search placeholder:
  - `Search snippets...`
- search input class:
  - `h-6 m-1`
- search input rootClassName:
  - `flex-1 border-r`
- empty search item:
  - `No results`

Snippet list:

- list wrapper class:
  - `flex flex-col overflow-auto`
- item class:
  - `rounded-none`
- item label shell:
  - `flex flex-row gap-2 items-center`
- text class:
  - `mt-1 text-accent-foreground`

Snippet viewer empty state:

- description:
  - `Click on a snippet to view its content.`

Snippet viewer shell:

- root class:
  - `h-full snippet-viewer flex flex-col overflow-hidden`
- header class:
  - `text-sm font-semibold bg-muted border-y px-2 py-1 flex justify-between items-center`
- close button:
  - `size: "sm"`
  - `variant: "ghost"`
  - `className: "h-6 w-6 p-0 hover:bg-muted-foreground/10"`
- content wrapper:
  - `px-2 py-2 space-y-4 overflow-auto flex-1`

Snippet insertion controls:

- main insert button text:
  - `Insert snippet`
- inline hover tooltip:
  - `Insert snippet`
- inline code-card insert button class:
  - `absolute -top-2 -right-1 z-10 hover-action px-2 bg-background`

#### 5.2.8 AI Chat Panel Body

Source:

Installed assets:

- `./assets/chat-panel-CYOmGmIc.js`
- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/chat/chat-panel.tsx`
- `.__marimo_upstream/frontend/src/components/chat/chat-history-popover.tsx`
- `.__marimo_upstream/frontend/src/components/chat/chat-display.tsx`
- `.__marimo_upstream/frontend/src/components/chat/reasoning-accordion.tsx`
- `.__marimo_upstream/frontend/src/components/chat/chat-components.tsx`
- `.__marimo_upstream/frontend/src/components/chat/tool-call-accordion.tsx`
- `.__marimo_upstream/frontend/src/components/ai/ai-model-dropdown.tsx`
- `.__marimo_upstream/frontend/src/components/mcp/mcp-status-indicator.tsx`

Unconfigured AI empty state:

- title:
  - `Chat with AI`
- description:
  - `No AI provider configured or Chat model not selected`
- action:
  - `Edit AI settings`
- icon:
  - `BotMessageSquareIcon`

Configured root shell:

- root class:
  - `flex flex-col h-[calc(100%-53px)]`

Header shell:

- class:
  - `flex border-b px-2 py-1 justify-between shrink-0 items-center`

Header controls:

- left tooltip/button:
  - `New chat`
- right controls:
  - `MCPStatusIndicator`
  - settings tooltip `AI Settings`
  - history popover tooltip `Previous chats`

MCP status indicator contract:

- trigger wrapper:
  - `Popover`
  - `Tooltip content="MCP Status"`
  - `PopoverTrigger asChild={true}`
- trigger button:
  - `Button variant="text" size="icon"`
- icon:
  - `PlugIcon className="h-4 w-4"`
- icon color branch:
  - `ok -> text-green-500`
  - `partial -> text-yellow-500`
  - `error && hasServers -> text-red-500`
- popover content:
  - `PopoverContent className="w-[320px]" align="start" side="right"`
- popover root body:
  - `div.space-y-3`
- title:
  - `MCP Server Status`
- refresh button:
  - `Button variant="ghost" size="xs"`
  - loading icon `Loader2 className="h-3 w-3 animate-spin"`
  - idle icon `RefreshCwIcon className="h-3 w-3"`
- no-server empty copy:
  - `No MCP servers configured.`
  - `Configure under Settings > AI > MCP`
- refresh success toast:
  - `MCP refreshed`
  - `MCP server configuration has been refreshed`
- refresh failure toast:
  - `Refresh failed`
  - `Failed to refresh MCP`

History popover:

- trigger wrapper:
  - `Popover`
  - `Tooltip content="Previous chats"`
  - `PopoverTrigger asChild={true}`
- trigger button:
  - `Button`
  - `variant: "text"`
  - `size: "icon"`
- trigger icon:
  - `ClockIcon`
  - `className: "h-4 w-4"`
- popover class:
  - `w-[480px] p-0`
- search input wrapper:
  - `pt-3 px-3 w-full`
- search placeholder:
  - `Search chat history...`
- search input class:
  - `text-xs`
- scroll area:
  - `h-[450px] p-2`
- grouped-chat root:
  - `div.space-y-3`
- grouping source:
  - `groupChatsByDate(filteredChats)`
- group label class:
  - `text-xs px-1 text-muted-foreground/60`
- per-chat row class:
  - `w-full p-1 rounded-md cursor-pointer text-left flex items-center justify-between`
- active row add:
  - `bg-accent`
- inactive row add:
  - `hover:bg-muted/20`
- title class:
  - `text-sm truncate`
- updated-time class:
  - `text-xs text-muted-foreground/60 ml-2 flex-shrink-0`
- relative time source:
  - `timeAgo(chat.updatedAt, locale)`
- click path:
  - `setActiveChat(chat.id)`
- group divider rule:
  - render `<hr />` between groups except after the last group
- empty states:
  - `No chats yet`
  - `Start a new chat to get started`
  - `No chats found`
  - `No chats match "${query}"`

Message area:

- wrapper class:
  - `flex-1 px-3 bg-(--slate-1) gap-4 py-3 flex flex-col overflow-y-auto`
- new-chat composer wrapper:
  - `rounded-md border bg-background`
- inline loading row:
  - `flex justify-center py-4`
- retry row:
  - `flex items-center justify-center space-x-2 mb-4`
- stop row while streaming:
  - `w-full flex justify-center items-center z-20 border-t`

Composer:

- empty-chat placeholder:
  - `Ask anything, @ to include context about tables or dataframes`
- standard input wrapper:
  - `relative shrink-0 min-h-[80px] flex flex-col border-t`
- footer wrapper:
  - `px-3 py-2 border-t border-border/20 flex flex-row flex-wrap items-center justify-between gap-1`

AI mode selector:

- label:
  - `AI Mode`
- options:
  - `Manual`
  - `Ask`
  - `Agent (beta)`
- trigger class:
  - `h-6 text-xs border-border shadow-none! ring-0! bg-muted hover:bg-muted/30 py-0 px-2 gap-1.5`

Chat footer controls:

- model trigger class:
  - `h-6 text-xs shadow-none! ring-0! bg-muted hover:bg-muted/30 rounded-sm`
- send placeholder during loading:
  - `Processing...`
- stop button text:
  - `Stop`

Chat model dropdown contract:

- source primitive:
  - `AIModelDropdown`
- chat-panel props:
  - `placeholder="Model"`
  - `triggerClassName="h-6 text-xs shadow-none! ring-0! bg-muted hover:bg-muted/30 rounded-sm"`
  - `iconSize="small"`
  - `showAddCustomModelDocs={true}`
  - `forRole="chat"`
- trigger root:
  - `DropdownMenuTrigger`
  - base class `flex items-center justify-between px-2 py-0.5 border rounded-md hover:bg-accent hover:text-accent-foreground`
- dropdown content:
  - `DropdownMenuContent className="w-[300px]"`
- current-model preview row:
  - rendered before provider groups when `activeModel` exists
  - followed by `DropdownMenuSeparator`
- provider groups:
  - rendered through `ProviderDropdownContent`
  - each provider is a `DropdownMenuSub`
  - submenu content class `max-h-[40vh] overflow-y-auto`
- provider info block:
  - optional description paragraph `text-sm text-muted-foreground p-2 max-w-[300px]`
  - provider-details link paragraph `text-sm text-muted-foreground p-2 pt-0`
- model row:
  - `DropdownMenuSubTrigger showChevron={false} className="py-2"`
  - embeds provider icon plus model name
  - thinking models show `BrainIcon` tooltip `Reasoning model`
  - custom models show `BotIcon` tooltip `Custom model`
- model info flyout:
  - `DropdownMenuSubContent className="p-4 w-80"`
- add-custom-model row:
  - only when `showAddCustomModelDocs` is true
  - item class `h-7 flex items-center gap-2`
  - icon `CircleHelpIcon className="h-3 w-3"`
  - click path `handleClick("ai", "ai-models")`

Chat message row contract:

- row base class:
  - `flex group relative`
- alignment split:
  - `user -> justify-end`
  - `assistant -> justify-start`
- user bubble shell:
  - `w-[95%] bg-background border p-1 rounded-sm`
- assistant bubble shell:
  - `w-[95%] wrap-break-word`
- assistant copy affordance:
  - `absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity`
  - `CopyClipboardIcon className="h-3 w-3"`
- user edit input primitive:
  - `PromptInput`
  - placeholder `Type your message...`
  - submit guard ignores blank trimmed values

`renderUIMessage` part mapping:

- root return:
  - `message.parts.map((part, index) => renderUIMessagePart(part, index))`
- `tool-*` parts:
  - render `ToolCallAccordion`
  - `className: "my-2"`
- `data-*` parts:
  - logged with `Logger.debug("Found data part", part)`
  - render `null`
- `text` parts:
  - when `part.text.includes("<marimo-")`:
    - render through `renderHTML({ html: part.text })`
  - otherwise:
    - render `MarkdownRenderer`
- `reasoning` parts:
  - render `ReasoningAccordion`
  - streaming gate is only true for the last part of the last streaming message
- `file` parts:
  - render `AttachmentRenderer`
- `dynamic-tool` parts:
  - render `ToolCallAccordion`
  - `toolName={part.toolName}`
- non-renderable parts:
  - `source-document`
  - `source-url`
  - `step-start`
  - all log debug and render `null`

Reasoning accordion contract:

- root primitive:
  - `Accordion type="single" collapsible={true}`
  - base class `w-full mb-2`
- open-state gate:
  - `value="reasoning"` only when `isStreaming` is true
- item primitive:
  - `AccordionItem value="reasoning" className="border-0"`
- trigger class:
  - `text-xs text-muted-foreground hover:bg-muted/50 px-2 py-1 h-auto rounded-sm [&[data-state=open]>svg]:rotate-180`
- trigger icon:
  - `BotMessageSquareIcon className="h-3 w-3"`
- trigger label branch:
  - streaming -> `Thinking (${reasoning.length} chars)`
  - settled -> `View reasoning (${reasoning.length} chars)`
- content wrapper:
  - `AccordionContent className="pb-2 px-2"`
- inner card:
  - `bg-muted/30 border border-muted/50 rounded-md p-3 italic text-muted-foreground/90 relative`
- markdown body wrapper:
  - `pr-6`
- renderer:
  - `MarkdownRenderer content={reasoning}`

Mode option metadata:

- `Manual` subtitle:
  - `Pure chat, no tool usage`
- `Ask` subtitle:
  - `Use AI with access to read-only tools like documentation search`
- `Agent (beta)` subtitle:
  - `Use AI with access to read and write tools`

Input and attachment shells:

- non-empty thread editor wrapper:
  - `px-2 py-3 flex-1`
- new-thread input override class:
  - `px-1 py-0`
- attachment row class:
  - `flex flex-row gap-1 flex-wrap p-1`
- empty-thread attachment row adds:
  - `py-2 px-1`

Footer button primitives from `chat-components.tsx`:

- send button:
  - wrapper tooltip text:
    - loading `Stop`
    - idle `Submit`
  - trigger class:
    - `h-6 min-w-6 p-0 hover:bg-muted/30 cursor-pointer`
  - idle icon:
    - `SendHorizontalIcon className="h-3.5 w-3.5"`
  - loading icon branch:
    - `StopCircleIcon className="size-4 text-error"`
  - labeled loading branch:
    - `div.flex.flex-row.items-center.gap-1.px-1.5`
    - text `Stop`
    - `Spinner size="small"`
- add-context button:
  - tooltip `Add context`
  - `Button variant="text" size="icon"`
  - icon `AtSignIcon className="h-3.5 w-3.5"`
- attach-file button:
  - tooltip `Attach a file`
  - `Button variant="text" size="icon"`
  - icon `PaperclipIcon className="h-3.5 w-3.5"`
  - hidden input:
    - `type: "file"`
    - `multiple: true`
    - `hidden: true`
    - `accept={SUPPORTED_ATTACHMENT_TYPES.join(",")}`
- file attachment pill:
  - base class:
    - `py-1 px-1.5 bg-muted rounded-md cursor-pointer flex flex-row gap-1 items-center text-xs`
  - hovered icon branch:
    - `XIcon className="h-3 w-3 mt-0.5"`
  - idle icon branch:
    - image -> `ImageIcon`
    - text -> `FileTextIcon`
    - fallback -> `FileIcon`
    - all use `className: "h-3 w-3 mt-0.5"`

#### 5.2.9 AI Agent Panel Body

Source:

Installed assets:

- `./assets/agent-panel-DFVcMxMV.js`
- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/chat/acp/agent-panel.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/agent-selector.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/thread.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/blocks.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/model-selector.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/scroll-to-bottom-button.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/session-tabs.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/agent-docs.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/common.tsx`

Empty-state branch:

- root class:
  - `flex flex-col h-full`
- header class:
  - `flex border-b px-3 py-2 justify-between shrink-0 items-center`
- header is followed immediately by:
  - `SessionTabs`
- title:
  - `No Agent Sessions`
- description:
  - `Create a new session to start a conversation`
- disconnected helper title:
  - `Connect to an agent`
- disconnected helper description prefix:
  - `Start agents by running these commands in your terminal:`
- disconnected helper note suffix:
  - `Note: This must be in the directory ${Paths.dirname(filename ?? "")}`

Connected root:

- class:
  - `flex flex-col flex-1 overflow-hidden mo-agent-panel`
- exact top-level child order:
  - `AgentPanelHeader`
  - `SessionTabs`
  - `renderBody()`

Header contract:

- class:
  - `flex border-b px-3 py-2 justify-between shrink-0 items-center`
- left info row:
  - `BotMessageSquareIcon className="h-4 w-4 text-muted-foreground"`
  - optional `AgentTitle`
  - optional `ConnectionStatus`
- right-side controls:
  - `Restart`
  - `Connect` or `Disconnect`

Connection status badge contract:

- primitive:
  - `Badge`
- connected branch:
  - icon `WifiIcon className="h-3 w-3"`
  - label `Connected`
  - variant `default`
  - class `bg-[var(--blue-3)] text-[var(--blue-11)] border-[var(--blue-5)]`
- connecting branch:
  - icon `PlugIcon className="h-3 w-3 animate-pulse"`
  - label `Connecting`
  - variant `secondary`
  - class `bg-[var(--yellow-3)] text-[var(--yellow-11)] border-[var(--yellow-5)]`
- disconnected branch:
  - icon `WifiOffIcon className="h-3 w-3"`
  - label `Disconnected`
  - variant `outline`
  - class `bg-[var(--red-3)] text-[var(--red-11)] border-[var(--red-5)]`
- fallback branch:
  - icon `WifiOffIcon className="h-3 w-3"`
  - label `status || "Unknown"`
  - variant `outline`
  - class `bg-[var(--gray-3)] text-[var(--gray-11)] border-[var(--gray-5)]`
- label text shell:
  - `span.ml-1.text-xs.font-medium`

Session tabs contract:

- empty-state root:
  - `flex items-center border-b bg-muted/20`
- empty-state child:
  - `AgentSelector className="h-6"`
- populated root:
  - `flex items-center border-b bg-muted/20 overflow-hidden`
- session-list wrapper:
  - `flex min-w-0 flex-1 overflow-x-auto`
- per-tab base class:
  - `flex items-center gap-1 px-2 py-1 text-xs border-r border-border bg-muted/30 hover:bg-muted/50 cursor-pointer min-w-0`
- active-tab adds:
  - `bg-background border-b-0 relative z-1`
- provider icon:
  - `AiProviderIcon className="h-3 w-3"`
- provider icon wrapper:
  - `text-muted-foreground text-[10px] font-medium`
- title shell:
  - `span.truncate`
  - `title={session.title}`
- close button:
  - `Button variant="ghost" size="sm"`
  - `className: "h-4 w-4 p-0 hover:bg-destructive/20 hover:text-destructive flex-shrink-0"`
  - icon `XIcon className="h-3 w-3"`
- select path:
  - `setActiveSession(sessionId)`
  - `updateSessionLastUsed(prev, sessionId)`
- close path:
  - `removeSession(prev, sessionId)`
- trailing selector in populated state:
  - `AgentSelector className="h-6 flex-shrink-0"`

Agent selector contract:

- root primitive:
  - `DropdownMenu`
  - controlled by local `isOpen`
- trigger:
  - `DropdownMenuTrigger asChild={true}`
  - `Button variant="ghost" size="sm"`
  - class:
    - `h-6 gap-1 px-2 text-xs bg-muted/30 hover:bg-muted/50 border border-border border-y-0 rounded-none focus-visible:ring-0`
  - label `New session`
  - icon `ChevronDownIcon className="h-3 w-3"`
- dropdown content:
  - `DropdownMenuContent align="start" className="w-fit"`
- agent inventory:
  - `Claude`
  - `Gemini`
  - `Codex`
  - `OpenCode`
- single-session reset branch:
  - `DropdownMenuItem className="cursor-pointer"`
  - text `Reset ${agent.displayName} session`
- normal create branch:
  - `DropdownMenuSub`
  - trigger:
    - `DropdownMenuSubTrigger`
    - `showChevron={false}`
    - `className: "cursor-pointer"`
  - submenu content:
    - `DropdownMenuSubContent className="w-120"`
    - wrapper `px-2 py-2`
    - helper copy class `text-xs font-medium text-muted-foreground mb-3`
    - helper copy includes terminal command note and `Paths.dirname(filename ?? "")`
    - embeds `AgentDocs agents={[agent.id]} showCopy={true}`
- create-session path:
  - `addSession(sessionState, { agentId })`
  - `setActiveTab(newState.activeTabId)`
  - `setIsOpen(false)`
  - optional `onSessionCreated?.(agentId)`

Connection/session transitional states:

- connecting text:
  - `Connecting to the agent...`
- creating-session text:
  - `Creating a new session...`
- waiting title:
  - `Waiting for agent`
- waiting description:
  - `Your AI agent will appear here when active`
- retry button text:
  - `Retry`

Notification/content area:

- content wrapper:
  - `flex-1 flex flex-col overflow-hidden flex-shrink-0 relative`
- pending-permission wrapper:
  - `p-3 border-b`
  - renders `PermissionRequest`
- scroll area:
  - `flex-1 bg-muted/20 w-full flex flex-col overflow-y-auto p-2`
- session id label:
  - `Session ID: ${id}`

Permission/loading footer:

- footer class:
  - `px-3 py-2 border-t bg-muted/30 flex-shrink-0`
- message strings:
  - `Waiting for permission to continue...`
  - `Agent is working...`
- stop button text:
  - `Stop`

Permission request contract:

- outer card:
  - `border border-[var(--amber-8)] bg-[var(--amber-2)] rounded-lg p-2`
- header row:
  - `flex items-center gap-2 mb-3`
- header icon:
  - `ShieldCheckIcon className="h-4 w-4 text-[var(--amber-11)]"`
- title:
  - `Permission Request`
- intro text:
  - `The AI agent is requesting permission to proceed:`
  - class `text-sm text-[var(--amber-11)] mb-3`
- body renderer:
  - `ToolBodyBlock data={permission.toolCall}`
- options row:
  - `flex gap-2`
- option button:
  - `Button size="xs" variant="text"`
  - allow color `text-[var(--blue-10)]`
  - reject color `text-[var(--red-10)]`
  - allow icon `CheckCircleIcon className="h-3 w-3 mr-1"`
  - reject icon `XCircleIcon className="h-3 w-3 mr-1"`
- resolve path:
  - `onResolve({ outcome: { outcome: "selected", optionId } })`

Prompt area:

- input wrapper:
  - `px-3 py-2 min-h-[80px]`
- placeholder:
  - `Ask anything, @ to include context about tables or dataframes`
- footer wrapper:
  - `px-3 py-2 border-t border-border/20 flex flex-row items-center justify-between`

Agent docs contract:

- root class:
  - `space-y-4`
- heading wrapper:
  - `space-y-2`
- title class:
  - `font-medium text-sm`
- description class:
  - `text-xs text-muted-foreground`
- item wrapper:
  - `space-y-2`
- agent title row:
  - `flex items-center gap-2`
- agent name shell:
  - `font-medium text-sm`
- beta suffix:
  - `(beta)`
  - `className: "text-muted-foreground ml-1"`
- command card:
  - `bg-muted/50 rounded-md p-2 border`
- command row:
  - `flex items-start gap-2 text-xs`
- command icon:
  - `TerminalIcon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0"`
- command code shell:
  - `text-xs font-mono break-words flex-1 whitespace-pre-wrap`
- copy button:
  - `Button size="xs" variant="outline" className="border"`
- terminal-run button gate:
  - shown only when `capabilities.terminal`
- terminal-run tooltip:
  - `Run in terminal`
  - `delayDuration: 100`
- terminal-run button:
  - `Button size="xs" variant="outline"`
  - `title: "Send to terminal"`
  - icon `TerminalSquareIcon className="h-3 w-3"`
- send-to-terminal path:
  - `sendCommand(getAgentConnectionCommand(agentId))`

Scroll-to-bottom button contract:

- null gate:
  - hidden when `isVisible` is false
- wrapper class:
  - `absolute bottom-2 right-6 z-10 animate-in fade-in-0 zoom-in-95 duration-200`
- button primitive:
  - `Button variant="secondary" size="sm"`
- button class:
  - `h-8 w-8 p-0 rounded-full`
  - `bg-background/90 backdrop-blur-sm`
  - `border border-border/50`
  - `shadow-md shadow-black/10`
  - `hover:bg-background hover:shadow-black/15`
  - `transition-all duration-200`
  - `focus:outline-none focus:ring-2 focus:ring-primary/50`
- icon:
  - `ArrowDownIcon className="h-4 w-4"`
- sr-only label:
  - `Scroll to bottom`

Agent mode selector:

- label:
  - `Agent Mode`
- trigger class:
  - `h-6 text-xs border-border shadow-none! ring-0! bg-muted hover:bg-muted/30 py-0 px-2 gap-1 capitalize`
- null gate:
  - hidden when `availableModes.length === 0`
- dropdown label:
  - `Agent Mode`
- item class:
  - `text-xs`
- subtitle shell:
  - `text-muted-foreground text-xs pt-1 block`

Model selector contract:

- null gate:
  - hidden when `!sessionModels || sessionModels.availableModels.length === 0`
- trigger class:
  - `h-6 text-xs border-border shadow-none! ring-0! bg-muted hover:bg-muted/30 py-0 px-2 gap-1`
- dropdown label:
  - `Model`
- item class:
  - `text-xs`
- current trigger text:
  - `currentModel?.name ?? currentModelId`
- item subtitle shell:
  - `text-muted-foreground text-xs pt-1 block`
- first item adds:
  - `(default)`
  - `className: "text-muted-foreground ml-1"`

Attachment and prompt shells:

- attachment row:
  - `flex flex-row gap-1 flex-wrap p-3 border-t`
- prompt area root:
  - `border-t bg-background flex-shrink-0`

Session notification block registry:

- `tool_call` and `tool_call_update`:
  - render `ToolNotificationsBlock`
- `agent_thought_chunk`:
  - render `AgentThoughtsBlock`
- `user_message_chunk`:
  - render `UserMessagesBlock`
- `agent_message_chunk`:
  - render `AgentMessagesBlock`
- `plan`:
  - render `PlansBlock`
- `available_commands_update`:
  - renders `null`
- `current_mode_update`:
  - renders `CurrentModeBlock` with `Mode: ${currentModeId}`
- unhandled grouped notification fallback:
  - `SimpleAccordion` titled by `sessionUpdate` with `JsonOutput`
- grouped notification wrapper:
  - `flex flex-col text-sm gap-2`
- grouped notification wrapper sets:
  - `data-block-type="${sessionUpdate}"`

Shared accordion primitive:

- root:
  - `Accordion type="single" collapsible={true} className="w-full"`
- item:
  - `AccordionItem value="tool-call" className="border-0"`
- trigger base:
  - `py-1 text-xs border-border shadow-none! ring-0! bg-muted hover:bg-muted/30 px-2 gap-1 rounded-sm [&[data-state=open]>svg]:rotate-180`
- trigger error add:
  - `text-destructive/80`
- trigger success add:
  - `text-[var(--blue-8)]`
- content:
  - `AccordionContent className="p-2"`
  - body wrapper `space-y-3 max-h-64 overflow-y-auto scrollbar-thin`
- loading icon:
  - `Loader2 className="h-3 w-3 animate-spin"`
- error icon:
  - `XCircleIcon className="h-3 w-3 text-destructive"`
- success icon:
  - `CheckCircleIcon className="h-3 w-3 text-[var(--blue-9)]"`
- title shell:
  - `code.font-mono.text-xs.truncate`
- error content card:
  - `bg-destructive/10 border border-destructive/20 rounded-md p-3 text-xs text-destructive`

Tool-call accordion contract:

- root primitive:
  - `Accordion type="single" collapsible={true}`
  - base class `w-full`
- item primitive:
  - `AccordionItem value="tool-call" className="border-0"`
- trigger base class:
  - `h-6 text-xs border-border shadow-none! ring-0! bg-muted/60 hover:bg-muted py-0 px-2 gap-1 rounded-sm [&[data-state=open]>svg]:rotate-180 hover:no-underline`
- status color adds:
  - error -> `text-[var(--red-11)]/80`
  - success -> `text-[var(--grass-11)]/80`
- status icon branch:
  - loading -> `Loader2 className="h-3 w-3 animate-spin"`
  - error -> `XCircleIcon className="h-3 w-3 text-[var(--red-11)]"`
  - success -> `CheckCircleIcon className="h-3 w-3 text-[var(--grass-11)]"`
- status text branch:
  - loading `Running`
  - error `Failed`
  - completed `Done`
  - fallback `Tool call`
- tool name formatting:
  - removes the `tool-` prefix
- content wrapper:
  - `AccordionContent className="py-2 px-2"`
- completion gate:
  - body only renders when `state === "output-available"` and there is `result` or `error`
- request block heading:
  - `Tool Request`
- result block heading:
  - `Tool Result`
- pretty-success wrapper:
  - `flex flex-col gap-1.5`
- success badge:
  - `text-xs px-2 py-0.5 bg-[var(--grass-2)] text-[var(--grass-11)] rounded-full font-medium capitalize`
- auth-required badge:
  - `text-xs px-2 py-0.5 bg-[var(--amber-2)] text-[var(--amber-11)] rounded-full`
- request/result pre shells:
  - `bg-[var(--slate-2)] p-2 text-muted-foreground border border-[var(--slate-4)] rounded text-xs overflow-auto scrollbar-thin max-h-64`
- error card shell:
  - `bg-[var(--red-2)] border border-[var(--red-6)] rounded-lg p-3`
- error heading row:
  - `text-xs font-semibold text-[var(--red-11)] mb-2 flex items-center gap-2`
- error body class:
  - `text-sm text-[var(--red-11)] leading-relaxed`

Agent connection idle block:

- root class:
  - `flex-1 flex items-center justify-center h-full min-h-[200px] flex-col`
- inner stack:
  - `text-center space-y-3`
- icon badge shell:
  - `w-12 h-12 mx-auto rounded-full bg-[var(--blue-3)] flex items-center justify-center`
- icon:
  - `BotMessageSquareIcon className="h-6 w-6 text-[var(--blue-10)]"`
- title:
  - `Agent is connected`
- description:
  - `You can start chatting with your agent now`

Agent error block:

- wrapper class:
  - `border border-[var(--red-6)] bg-[var(--red-2)] rounded-lg p-4 my-2`
- wrapper attribute:
  - `data-block-type="error"`
- title:
  - `Agent Error`
- message class:
  - `text-sm text-[var(--red-11)] leading-relaxed mb-3`
- retry button:
  - `size: "xs"`
  - `variant: "outline"`
  - `className: "text-[var(--red-11)] border-[var(--red-6)] hover:bg-[var(--red-3)]"`
- dismiss button:
  - `size: "xs"`
  - `variant: "ghost"`
  - `className: "text-[var(--red-10)] hover:bg-[var(--red-3)]"`

Connection change block:

- wrapper class template:
  - `border ${borderColor} ${bgColor} rounded-lg p-3 my-2`
- wrapper attributes:
  - `data-block-type="connection-change"`
  - `data-status="${status}"`
- header row:
  - `flex items-center gap-2 mb-1`
- timestamp class:
  - `text-xs text-muted-foreground`
- message class template:
  - `text-sm ${textColor} opacity-90 mb-2`
- disconnected or error branch button text:
  - `Retry Connection`
- state tokens:
  - `connected -> bg-[var(--blue-2)] / border-[var(--blue-6)] / text-[var(--blue-11)] / icon text-[var(--blue-10)]`
  - `disconnected -> bg-[var(--amber-2)] / border-[var(--amber-6)] / text-[var(--amber-11)] / icon text-[var(--amber-10)]`
  - `connecting -> bg-[var(--gray-2)] / border-[var(--gray-6)] / text-[var(--gray-11)] / icon text-[var(--gray-10)]`
  - `error -> bg-[var(--red-2)] / border-[var(--red-6)] / text-[var(--red-11)] / icon text-[var(--red-10)]`

Thought and plan blocks:

- thought wrapper:
  - `text-xs text-muted-foreground`
- thought tooltip title:
  - `Thought for ${seconds}s`
- thought content wrapper:
  - `flex flex-col gap-2 text-muted-foreground`
- plan wrapper:
  - `rounded-lg border bg-background p-2 text-xs`
- plan header row:
  - `flex items-center justify-between mb-2`
- plan heading:
  - `To-dos ${count}`
- plan list class:
  - `flex flex-col gap-1`
- plan item class:
  - `flex items-center gap-2 px-2 py-1 rounded`
- checkbox class:
  - `accent-primary h-4 w-4 rounded border border-muted-foreground/30`
- completed plan text adds:
  - `line-through text-muted-foreground`

User and agent message content blocks:

- `user_message_chunk` wrapper:
  - `flex flex-col gap-2 text-muted-foreground border p-2 bg-background rounded break-words overflow-x-hidden`
- `agent_message_chunk` wrapper:
  - `flex flex-col gap-2`
- adjacent text parts are merged before render:
  - `mergeConsecutiveTextBlocks(props.data.map((item) => item.content))`
- content registry:
  - `text -> MarkdownRenderer`
  - `image -> inline <img>`
  - `audio -> inline <audio controls>`
  - `resource -> ResourceBlock`
  - `resource_link -> ResourceLinkBlock`

Resource and diff shells:

- text resource trigger:
  - `flex items-center gap-1 hover:bg-muted rounded-md px-1`
- text resource helper:
  - `Formatted for agents, not humans.`
- text resource popover content:
  - `max-h-96 overflow-y-auto scrollbar-thin whitespace-pre-wrap w-full max-w-[500px]`
- plain-text resource preview:
  - `text-xs whitespace-pre-wrap p-2 bg-muted rounded-md break-words`
- remote http resource link class:
  - `text-link hover:underline px-1`
- image resource-link trigger:
  - `flex items-center gap-1 hover:bg-muted rounded-md px-1 cursor-pointer`
- image resource-link preview:
  - `w-auto max-w-[500px] p-2`
- diff block shell:
  - `border rounded-md overflow-hidden bg-[var(--gray-2)] overflow-y-auto scrollbar-thin max-h-64`
- diff block path row:
  - `px-2 py-1 bg-[var(--gray-2)] border-b text-xs font-medium text-[var(--gray-11)]`

Tool call accordion:

- wrapper class:
  - `w-full`
- accordion item:
  - `type: "single"`
  - `collapsible: true`
  - `className: "w-full"`
- item value:
  - `tool-${index}`
- trigger class:
  - `py-1 text-xs border-border shadow-none! ring-0! bg-muted hover:bg-muted/30 px-2 gap-1 rounded-sm [&[data-state=open]>svg]:rotate-180`
- trigger error text modifier:
  - `text-destructive/80`
- trigger success text modifier:
  - `text-[var(--blue-8)]`
- icon states:
  - `loading -> h-3 w-3 animate-spin`
  - `error -> h-3 w-3 text-destructive`
  - `success -> h-3 w-3 text-[var(--blue-9)]`
- title node:
  - `<code class="font-mono text-xs truncate">`
- content wrapper:
  - `p-2`
- content scroll shell:
  - `space-y-3 max-h-64 overflow-y-auto scrollbar-thin`
- non-error body label:
  - `text-xs font-medium text-muted-foreground mb-1`
- error body box:
  - `bg-destructive/10 border border-destructive/20 rounded-md p-3 text-xs text-destructive`

#### 5.3 Developer Panel

Source:

Installed assets:

- `./assets/edit-page-CTVRcSta.js`
- `./assets/panels-B4E3DsXP.css`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.css`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/backend-status.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/lsp-status.tsx`

Panel identity:

- `id="app-chrome-panel"`
- `data-testid="panel"`

Panel class:

- `dark:bg-(--slate-1) print:hidden hide-on-fullscreen`
- adds `border-t` when open

Resizable panel contract:

- `collapsedSize: 0`
- `collapsible: true`
- `minSize: 10`
- `defaultSize: 0`
- `maxSize: 75`

Resize handle contract:

- base class `border-border print:hidden z-20`
- collapsed token `resize-handle-collapsed`
- open token `resize-handle`
- orientation `horizontal`
- CSS from `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.css`:
  - `.resize-handle, .resize-handle-collapsed { transition: 250ms linear background-color; outline: none }`
  - `.resize-handle.horizontal, .resize-handle-collapsed.horizontal { height: 4px }`
  - `.resize-handle:hover, .resize-handle[data-resize-handle-active], .resize-handle-collapsed:hover, .resize-handle-collapsed[data-resize-handle-active] { background-color: var(--slate-11) }`

Header shell:

- `flex items-center justify-between border-b px-2 h-8 bg-background shrink-0`

Developer tab registry contract:

- list is reorderable through `ReorderableList`
- `ariaLabel: "Developer panel tabs"`
- `className: "flex flex-row gap-1"`
- drag type is `panels`
- list id is `developer-panel`
- cross-list drag receiver can move items back to the sidebar

Developer tab token:

- shared:
  - `text-sm flex gap-2 px-2 pt-1 pb-0.5 items-center leading-none rounded-sm cursor-pointer`
- selected adds:
  - `bg-muted`
- unselected adds:
  - `hover:bg-muted/50`

Developer header widgets:

- separator:
  - `border-l border-border h-4 mx-1`
- backend health button:
  - tooltip testid `data-testid="footer-backend-status"`
  - button testid `data-testid="backend-status"`
  - button class:
    - `p-1 hover:bg-accent rounded flex items-center gap-1.5 text-xs text-muted-foreground`
  - label text:
    - `Kernel`
  - tooltip strings:
    - `Not connected to a runtime`
    - `Health: Unknown`
    - `Click to refresh health status`
- LSP health button:
  - tooltip testid `data-testid="footer-lsp-status"`
  - button testid `data-testid="lsp-status"`
  - button class:
    - `p-1 hover:bg-accent rounded flex items-center gap-1.5 text-xs text-muted-foreground`
  - label text:
    - `LSP`
  - restart toast titles:
    - `LSP Servers Restarted`
    - `LSP Restart Failed`
  - degraded or failed tooltip adds:
    - `Click to restart failed servers`
- close button:
  - `variant: "text"`
  - `size: "xs"`

Developer panel registry:

- `errors`
- `scratchpad`
- `tracing`
- `secrets`
- `logs`
- `terminal`
- `cache`
- plus any tabs moved over from the sidebar registry

Panel body wrapper:

- `flex flex-col h-full`
- content area:
  - `flex-1 overflow-hidden`

#### 5.3.1 Errors Panel Body

Source:

Installed assets:

- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/error-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`

Empty state:

- title:
  - `No errors!`
- icon:
  - `PartyPopperIcon`

Non-empty body:

- root class:
  - `flex flex-col h-full overflow-auto`

Per-cell error block:

- header class:
  - `text-xs font-mono font-semibold bg-muted border-y px-2 py-1`
- header child:
  - `cell-link`
- body class:
  - `px-2`
- body renderer:
  - `MarimoErrorOutput`

#### 5.3.2 Scratchpad Panel Body

Source:

Installed assets:

- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/scratchpad-panel.tsx`
- `.__marimo_upstream/frontend/src/components/scratchpad/scratchpad.tsx`
- `.__marimo_upstream/frontend/src/components/scratchpad/scratchpad-history.ts`

Root shell:

- class:
  - `flex flex-col h-full overflow-hidden`
- root id:
  - `HTMLCellId.create(SCRATCH_CELL_ID)`
- scratch cell config:
  - `hide_code: false`
  - `disabled: false`
- runtime/data ownership:
  - output, status, and console output come from `notebookState.cellRuntime[SCRATCH_CELL_ID]`
  - editor code comes from `notebookState.cellData[SCRATCH_CELL_ID]?.code ?? ""`

Scratchpad history atoms:

- history storage key:
  - `marimo:scratchpadHistory:v1`
- max history items:
  - `15`
- visibility atom default:
  - `false`
- add-to-history behavior:
  - trims input
  - skips empty strings
  - de-duplicates identical entries
  - prepends the new item
  - truncates to the latest `15`

Toolbar:

- class:
  - `flex items-center shrink-0 border-b`
- run button:
  - `data-testid="scratchpad-run-button"`
- tooltip strings:
  - `cell.run`
  - `Clear code and outputs`
  - `Insert code`
  - `Toggle history`
  - `Use this scratchpad to experiment with code without restrictions on variable names. Variables defined here aren't saved to notebook memory, and the code is not saved in the notebook file.`

Toolbar button primitives:

- all use:
  - `variant: "text"`
  - `size: "xs"`
- running indicator:
  - visible when `status === "running" || status === "queued"`
  - `Spinner className="inline" size="small"`
- history toggle selected state:
  - `bg-(--sky-3) rounded-none`
- insert-code control:
  - wrapped in `HideInKioskMode`

Toolbar action paths:

- run:
  - `sendRunScratchpad({ code })`
  - `addToHistory(code)`
- insert code:
  - no-op when `!code.trim()`
  - otherwise `createNewCell({ code, before: false, cellId: lastFocusedCellId ?? "__end__" })`
- clear code:
  - `updateCellCode({ cellId, code: "", formattingChange: false })`
  - `sendRunScratchpad({ code: "" })`
  - if the live editor exists, dispatches a full-document replace with `""`
- select history item:
  - hides the overlay
  - updates notebook scratch code through `updateCellCode(...)`
  - mirrors the same text into the live editor via `EditorView.dispatch(...)`

History overlay:

- class:
  - `absolute inset-0 z-100 bg-background p-3 border-none overflow-auto`
- inner wrapper:
  - `overflow-auto flex flex-col gap-3`
- history card class:
  - `border rounded-md hover:shadow-sm cursor-pointer hover:border-input overflow-hidden`
- card renderer:
  - `LazyAnyLanguageCodeMirror`
  - `language: "python"`
  - `editable: false`
  - `readOnly: true`
  - renders `item.trim()`

Main split layout:

- outer resizable direction follows panel-context orientation
- root primitive:
  - `PanelGroup key={section} direction={orientation} className="h-full"`
- editor panel:
  - `Panel defaultSize={40} minSize={20} maxSize={70}`
- editor shell:
  - `h-full flex flex-col overflow-hidden relative`
- editor wrapper:
  - `flex-1 overflow-auto`
- editor primitive:
  - `CellEditor`
  - `showPlaceholder: false`
  - `status: "idle"`
  - `serializedEditorState: null`
  - `hidden: false`
  - `showHiddenCode: Functions.NOOP`
- output split shell:
  - `h-full flex flex-col divide-y overflow-hidden`
- output panel:
  - `Panel defaultSize={60} minSize={20}`
- output wrapper:
  - `flex-1 overflow-auto`
- console wrapper:
  - `overflow-auto shrink-0 max-h-[50%]`
- divider class:
  - `bg-border hover:bg-primary/50 transition-colors`
- divider orientation:
  - vertical panel layout -> `h-1`
  - horizontal panel layout -> `w-1`
- output area props:
  - `allowExpand: false`
  - `stale: false`
  - `loading: false`
- console output props:
  - `stale: false`
  - `cellName: DEFAULT_CELL_NAME`
  - `onSubmitDebugger: Functions.NOOP`
  - `debuggerActive: false`

#### 5.3.3 Tracing Panel Body

Source:

Installed assets:

- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/tracing-panel.tsx`
- `.__marimo_upstream/frontend/src/components/tracing/tracing.tsx`
- `.__marimo_upstream/frontend/src/components/tracing/tracing-spec.ts`

Fallback while lazy chunk loads:

- wrapper class:
  - `flex flex-col items-center justify-center h-full`
- child:
  - `Spinner`
- lazy import path:
  - `React.lazy(() => import("@/components/tracing/tracing").then((module) => ({ default: module.Tracing })))`

Empty state:

- title:
  - `No traces`
- description:
  - `Cells that have ran will appear here.`
- icon:
  - `ActivityIcon`

Top controls:

- wrapper class:
  - `flex flex-row justify-start gap-3`
- inline-chart label:
  - `Inline chart`
- checkbox:
  - `data-testid="chartPosition"`
  - class `h-3 cursor-pointer`
- clear button:
  - `dataTestId: "clear-traces-button"`

Tracing state and panel branches:

- expanded-run atom:
  - `atom<Map<RunId, boolean>>(new Map())`
- chart position local state:
  - default `"above"`
  - toggle flips between `"above"` and `"sideBySide"`
- sidebar branch:
  - returns the tracing component directly when `usePanelSection() === "sidebar"`
- developer-panel branch:
  - wraps with `PanelGroup direction="horizontal" className="h-full"`
  - left `Panel defaultSize={50} minSize={30} maxSize={80}`
  - middle `PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors"`
  - right `Panel defaultSize={50}` containing an empty `div`

Body wrapper:

- class:
  - `py-1 px-2 overflow-y-scroll h-full`
- run list class:
  - `flex flex-col gap-3`

Run item contract:

- collapsed title:
  - `Run - ${formattedStartTime}`
- collapsed shell:
  - `pre.font-mono.font-semibold`
- expanded `above` branch:
  - wrapper class `flex flex-col`
  - inner title shell `pre.font-mono.font-semibold`
- expanded `sideBySide` branch:
  - wrapper class `flex flex-row`
- default expansion rule:
  - explicit value from `expandedRunsAtom` wins
  - otherwise only the most recent run starts expanded
- title wrapper:
  - `span.text-sm.cursor-pointer`
- chevron icon branch:
  - expanded -> `ChevronDown`
  - collapsed -> `ChevronRight`
  - `height={16}`
- toggle path:
  - updates `expandedRunsAtom` with the flipped boolean for the current `runId`

Trace chart contract:

- renderer:
  - Vega canvas
- chart data shape:
  - `{ cell, cellNum, startTimestamp, endTimestamp, elapsedTime, status }`
- `cellNum` source:
  - `cellIds.inOrderIds.indexOf(cellRun.cellId)`
- hidden input id:
  - ``hiddenInputElement-${run.runId}``
- spec builder:
  - `createGanttBaseSpec(chartValues, hiddenInputElementId, chartPosition, theme)`
- embed options:
  - `theme: theme === "dark" ? "dark" : undefined`
  - `width: width - 50`
  - `height: chartPosition === "above" ? 120 : 100`
  - `actions: false`
  - `mode: "vega"`
  - `renderer: "canvas"`
- background:
  - dark theme uses `black`
- step height:
  - side-by-side `26`
  - above `21`
- `mark.cornerRadius`:
  - `2`
- y-axis:
  - hidden when `chartPosition === "sideBySide"`
- hover bridge:
  - Vega param binds to the hidden text input
  - signal name `VEGA_HOVER_SIGNAL = "cellHover"`
- signal listener lifecycle:
  - `embed.view.addSignalListener(...)`
  - cleanup removes the same listeners
- queue sorting transform:
  - queued cells receive `sortPriority = 9999999999999`
- color scale:
  - `success -> #37BE5F`
  - `error -> red`

Hovered cell detail list:

- wrapper class:
  - `text-xs mt-0.5 ml-3 flex flex-col gap-0.5`
- hidden bridge input:
  - `type: "text"`
  - `hidden: true`
  - `defaultValue={hoveredCellId || ""}`
- hover dispatch:
  - writes the hovered cell id into the hidden input
  - dispatches `new Event("input", { bubbles: true })`
- row class:
  - `flex flex-row gap-2 py-1 px-1 opacity-70 hover:bg-(--gray-3) hover:opacity-100`
- hovered row adds:
  - `bg-(--gray-3) opacity-100`
- status icon mapping:
  - `success -> CircleCheck color="green" size={14}`
  - `running -> CirclePlayIcon color="var(--blue-10)" size={14}`
  - `error -> CircleX color="red" size={14}`
  - `queued -> CircleEllipsis color="grey" size={14}`
- timestamp shell:
  - `text-(--gray-10) dark:text-(--gray-11)`
- cell shell:
  - `text-(--gray-10) w-16 overflow-hidden`
- code shell:
  - `w-40 truncate -ml-1`
- elapsed/status wrapper:
  - `flex flex-row gap-1 w-16 justify-end -ml-2`
- tooltip strings:
  - `This cell took ${elapsedTime} to run`
  - `This cell has not been run`

#### 5.3.4 Secrets Panel Body

Source:

Installed assets:

- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/secrets-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/write-secret-modal.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`

Loading and error branches:

- loading spinner:
  - `size: "medium"`
  - `centered: true`
- error renderer:
  - `ErrorBanner`

Empty state:

- title:
  - `No environment variables`
- description:
  - `No environment variables are available in this notebook.`
- icon:
  - `KeyIcon`

Top add-secret bar:

- wrapper class:
  - `flex justify-start h-8 border-b`
- button class:
  - `border-r px-2 m-0 h-full hover:bg-accent hover:text-accent-foreground`

Main split layout:

- direction:
  - `horizontal`
- left resizable panel:
  - `defaultSize: 50`
  - `minSize: 30`
  - `maxSize: 80`
- divider class:
  - `w-1 bg-border hover:bg-primary/50 transition-colors`
- right panel:
  - empty `div`

Environment variable table:

- wrapper class:
  - `overflow-auto flex-1 mb-16`
- columns:
  - `Environment Variable`
  - `Source`
  - empty copy-action column
- provider rows exclude:
  - `env`
- non-env provider badge:
  - `variant: "outline"`

Copy affordance:

- hidden until row hover:
  - `invisible group-hover:visible`
- copy text:
  - `os.environ["${key}"]`
- success toast:
  - title `Copied to clipboard`
  - description `${snippet} has been copied to your clipboard.`

Add Secret modal:

- source:
  - `WriteSecretModal`
- title:
  - `Add Secret`
- description:
  - `Add a new secret to your environment variables.`
- form body class:
  - `grid gap-4 py-4`
- field row class:
  - `grid gap-2`
- key label:
  - `Key`
- key placeholder:
  - `MY_SECRET_KEY`
- key normalization:
  - `replaceAll(/\W/g, "_")`
- value label:
  - `Value`
- value input:
  - `type: "password"`
  - `autoComplete: "off"`
- insecure transport warning:
  - `Note: You are sending this key over http.`
- location label:
  - `Location`
- location trigger placeholder:
  - `Select a provider`
- empty-location helper:
  - `No dotenv locations configured.`
- config helper:
  - `You can configure the location by setting the dotenv configuration.`
- footer buttons:
  - `Cancel`
  - `Add Secret`
- submit disabled gate:
  - `!key || !value || !location`
- validation toasts:
  - `No location selected for the secret.`
  - `Please fill in all fields.`
- success toast:
  - title `Secret created`
  - description `The secret has been created successfully.`
- failure toast:
  - `Failed to create secret. Please try again.`

#### 5.3.5 Logs Panel Body

Source:

Installed assets:

- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/logs-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`

Empty state:

- title:
  - `No logs`
- description includes pills:
  - `stdout`
  - `stderr`
- icon:
  - `FileTextIcon`

Non-empty root:

- class:
  - `flex flex-col h-full overflow-auto`

Top action row:

- class:
  - `flex flex-row justify-start px-2 py-1`
- clear button testid:
  - `clear-logs-button`
- clear action path:
  - `useCellActions().clearLogs`

Log viewer:

- wrapper class:
  - `flex flex-col`
- `<pre>` class:
  - `grid text-xs font-mono gap-1 whitespace-break-spaces font-semibold align-left`
- inner grid class:
  - `grid grid-cols-[30px_1fr]`
- row wrapper:
  - `div.contents.group`
- line-number class:
  - `text-right col-span-1 py-1 pr-1`
- message cell class:
  - `px-2 flex gap-x-1.5 py-1 flex-wrap`
- hover token:
  - `opacity-70 group-hover:bg-(--gray-3) group-hover:opacity-100`

Log row state colors:

- `stdout -> text-(--grass-9)`
- `stderr -> text-(--red-9)`

Rendered log fragment order:

- timestamp:
  - `[${formatLogTimestamp(log.timestamp)}]`
  - class `shrink-0 text-(--gray-10) dark:text-(--gray-11)`
- level:
  - `log.level.toUpperCase()`
  - class `shrink-0`
- cell link wrapper:
  - `(<CellLink cellId={log.cellId} />)`
  - class `shrink-0 text-(--gray-10)`
- message:
  - raw `log.message`

#### 5.3.6 Terminal Panel Body

Source:

Installed assets:

- `./assets/terminal-D7RRO5NO.js`
- `./assets/terminal-ByuMlBP_.css`

Readable source:

- `.__marimo_upstream/frontend/src/components/terminal/terminal.tsx`
- `.__marimo_upstream/frontend/src/components/terminal/state.ts`
- `.__marimo_upstream/frontend/src/components/terminal/theme.tsx`

Terminal root:

- class:
  - `relative w-full h-[calc(100%-4px)] bg-popover`

Terminal state ownership:

- state shape:
  - `pendingCommands: TerminalCommand[]`
  - `isReady: boolean`
- initial state:
  - `pendingCommands: []`
  - `isReady: false`
- command shape:
  - `{ id, text, timestamp }`
- actions:
  - `addCommand`
  - `removeCommand`
  - `setReady`
  - `clearCommands`

Xterm configuration:

- `fontFamily`:
  - `Menlo, DejaVu Sans Mono, Consolas, Lucida Console, monospace`
- `fontSize`:
  - `14`
- `scrollback`:
  - `10000`
- `cursorBlink`:
  - `true`
- `cursorStyle`:
  - `block`
- `allowTransparency`:
  - `false`
- `rightClickSelectsWord`:
  - `true`
- `wordSeparator`:
  - ` \t\r\n\"'`(){}[]<>|&;`
- `allowProposedApi`:
  - `true`
- addons loaded before mount:
  - `FitAddon`
  - `SearchAddon`
  - `CanvasAddon`
  - `Unicode11Addon`
  - `WebLinksAddon`
- websocket attach addon:
  - `AttachAddon`
- unicode version:
  - `"11"`
- theme source:
  - `createTerminalTheme("dark")`
- dark theme tokens:
  - background `#0f172a`
  - foreground `#f8fafc`
  - selection `rgba(148, 163, 184, 0.3)`

Context menu:

- wrapper class:
  - `xterm-context-menu fixed z-50 rounded-md shadow-lg py-1 min-w-[160px] border bg-popover`
- menu item class:
  - `w-full text-left px-3 py-2 text-sm flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted`
- items and shortcuts:
  - `Copy` / `mod-c`
  - `Paste` / `mod-v`
  - `Select all` / `mod-a`
  - `Clear terminal` / `mod-l`
- placement rule:
  - computes `spaceBelow = window.innerHeight - cursorY`
  - opens above when `spaceBelow < 200`
  - otherwise below the cursor
- outside-click close gate:
  - any click not inside `.xterm-context-menu` closes the menu

Keyboard shortcuts:

- `mod-c`:
  - copies only when `terminal.hasSelection()`
- `mod-v`:
  - reads clipboard text and pastes into the terminal
- `mod-a`:
  - `terminal.selectAll()`
- `mod-l`:
  - `terminal.clear()`

WebSocket and lifecycle:

- connection prelude:
  - `waitForConnectionOpen()`
- websocket URL:
  - `runtimeManager.getTerminalWsURL()`
- ready-state sync:
  - `setReady(socket.readyState === WebSocket.OPEN)`
- disconnect path:
  - `onClose()`
  - `attachAddon.dispose()`
  - `wsRef.current = null`
  - `terminal.clear()`
  - `setInitialized(false)`
  - `setReady(false)`
- connection failure path:
  - logs `Runtime health check failed for terminal`
  - calls `onClose()`
- visible effect:
  - when visible, runs `fitAddon.fit()` and `terminal.focus()`
- mount effect:
  - `terminal.open(terminalRef.current)`
  - delayed fit after `100ms`
  - registers window resize, keydown, contextmenu, document click listeners
- pending command flush:
  - while `terminalState.isReady` and queue is non-empty
  - `terminal.input(command.text)`
  - `terminal.focus()`
  - `removeCommand(command.id)`
- backend resize message:
  - `{"type":"resize","cols","rows"}`
  - debounced by `100ms`

#### 5.3.7 Cache Panel Body

Source:

Installed assets:

- `./assets/panels-BfLG6GHU.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/cache-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`

Loading state:

- spinner:
  - `size: "medium"`
  - `centered: true`
- loading gate:
  - only when `isPending && !cacheInfo`

Empty states:

- title:
  - `No cache data`
- description:
  - `Cache information is not available.`
- second title:
  - `No cache activity`
- second description:
  - `The cache has not been used yet. Cached functions will appear here once they are executed.`
- empty refresh action:
  - shared `refreshButton`
  - `Button variant="outline" size="sm"`
  - loading icon branch `Spinner size="small" className="w-4 h-4 mr-2"`
  - idle icon branch `RefreshCwIcon className="w-4 h-4 mr-2"`

Non-empty root:

- root class:
  - `flex flex-col h-full overflow-auto`
- inner class:
  - `flex flex-col gap-4 p-4 h-full`

Top refresh area:

- icon button:
  - `variant: "ghost"`
  - `size: "icon"`
  - `className: "h-6 w-6"`
- icon branch:
  - `RefreshCwIcon className="h-4 w-4 text-muted-foreground hover:text-foreground"`
  - while fetching adds `animate-[spin_0.5s]`
- outline refresh button text:
  - `Refresh`

Statistics section:

- section wrapper:
  - `space-y-3`
- heading:
  - `Statistics`
  - `text-sm font-semibold text-foreground`
- stat grid:
  - `grid grid-cols-2 gap-3`
- hit-rate formula:
  - `totalRequests = totalHits + totalMisses`
  - `hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0`
- cards:
  - `Time saved`
  - `Hit rate`
  - `Cache hits`
  - `Cache misses`
- stat card shell:
  - `flex flex-col gap-1 p-3 rounded-lg border bg-card`
- stat label class:
  - `text-xs text-muted-foreground`
- stat value class:
  - `text-lg font-semibold`
- stat description class:
  - `text-xs text-muted-foreground`

Storage section:

- render gate:
  - only when `diskTotal > 0`
- section wrapper:
  - `space-y-3 pt-2 border-t`
- heading:
  - `Storage`
- card description branch:
  - when `diskToFree > 0` -> `${formatBytes(diskToFree, locale)} can be freed`
  - otherwise `Cache storage on disk`

Purge action:

- confirmation wrapper:
  - `ConfirmationButton`
- title:
  - `Purge cache?`
- description:
  - `This will permanently delete all cached data. This action cannot be undone.`
- confirm text:
  - `Purge`
- destructive:
  - `true`
- onConfirm path:
  - `setPurging(true)`
  - `clearCache()`
  - success toast `Cache purged`
  - success description `All cached data has been cleared`
  - `refetch()`
  - finally `setPurging(false)`
- failure toast:
  - title `Error`
  - description `error.message` or `Failed to purge cache`
  - `variant: "danger"`
- trigger button:
  - `variant: "outlineDestructive"`
  - `size: "xs"`
  - `className: "w-full"`
- trigger label:
  - `Purge Cache`
- trigger icon branch:
  - purging -> `Spinner size="small" className="w-3 h-3 mr-2"`
  - idle -> `Trash2Icon className="w-3 h-3 mr-2"`

Section titles:

- `Statistics`
- `Storage`

Stat card class:

- `flex flex-col gap-1 p-3 rounded-lg border bg-card`

Purge flow:

- button text:
  - `Purge Cache`
- confirm title:
  - `Purge cache?`
- confirm description:
  - `This will permanently delete all cached data. This action cannot be undone.`
- confirm text:
  - `Purge`
- success toast title:
  - `Cache purged`
- success toast description:
  - `All cached data has been cleared`

#### 5.4 Chrome Layout Persistence and Panel Architecture

Source:

Installed assets:

- `./assets/edit-page-CTVRcSta.js`
- `./assets/panels-BfLG6GHU.js`
- `./assets/panels-B4E3DsXP.css`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.css`

Full PanelGroup DOM hierarchy:

```text
PanelGroup (horizontal, autoSaveId="marimo:chrome:v1:l2")
  Sidebar (icon rail, no Panel wrapper)
  Panel id="app-chrome-sidebar" (helper sidebar)
    span.flex.flex-row.h-full
      helpPaneBody
      helperResizeHandle (vertical)
  PanelResizeHandle (helper, vertical, z-10)
  Panel id="app-chrome-body"
    PanelGroup (vertical, autoSaveId="marimo:chrome:v1:l1")
      Panel id="app" (appBodyPanel)
      PanelResizeHandle (bottom, horizontal, z-20)
      Panel id="app-chrome-panel" (developer/bottom panel)
  ContextAwarePanel (right-side overlay, not inside PanelGroup)
```

Required wrapper IDs:

- `#app`
- `#app-chrome-body`
- `#app-chrome-sidebar`
- `#app-chrome-panel`

Resize handle CSS (`app-chrome.css`):

- `.resize-handle, .resize-handle-collapsed`: `transition: 250ms linear background-color; outline: none`
- `.resize-handle.horizontal, .resize-handle-collapsed.horizontal`: `height: 4px`
- `.resize-handle.vertical, .resize-handle-collapsed.vertical`: `width: 4px`
- `.resize-handle:hover, .resize-handle[data-resize-handle-active]`: `background-color: var(--slate-11)`
- same for `.resize-handle-collapsed` hover/active

Helper sidebar resize handle:

- `disabled={!isSidebarOpen}`
- `hitAreaMargins={{ coarse: 15, fine: 2 }}`
- class: `border-border print:hidden z-10` + `resize-handle` or `resize-handle-collapsed` + `vertical`

Developer panel resize handle:

- `disabled={!isDeveloperPanelOpen}`
- class: `border-border print:hidden z-20` + `resize-handle` or `resize-handle-collapsed` + `horizontal`

Developer panel root:

- Panel `id="app-chrome-panel"` `data-testid="panel"`
- class: `dark:bg-(--slate-1) print:hidden hide-on-fullscreen` + conditional `border-t` when open
- header class: `flex items-center justify-between border-b px-2 h-8 bg-background shrink-0`
- content wrapper class: `flex-1 overflow-hidden`

ContextAwarePanel:

- rendered as a sibling of the outer PanelGroup, not inside it
- overlays the right side when active

