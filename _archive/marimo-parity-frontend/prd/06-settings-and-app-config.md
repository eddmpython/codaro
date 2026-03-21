[Back to PRD Index](../PRD.md)

# 8. Notebook Settings and App Config Contract

[Resume from Summary](./10-summary-acceptance-and-copy-plan.md#121-current-state)

Installed asset evidence for this file:

- `./assets/app-config-button-zy3OAtTs.js`
- `./assets/form-BEIQJWib.js`
- `./assets/field-9GctqEPJ.js`
- `./assets/select-Ch6m1k2G.js`
- `./assets/index-CVpJvEAO.css`

#### 8.1 App Config Trigger Modes

Source:

Installed assets:

- `./assets/app-config-button-zy3OAtTs.js`
- `./assets/index-CVpJvEAO.css`

Readable source:

- `.__marimo_upstream/frontend/src/components/app-config/app-config-button.tsx`

Trigger branches:

- `showAppConfig=false` opens a dialog modal directly
- `showAppConfig=true` opens a popover, then a `User settings` link opens the full dialog

Trigger button contract:

- `aria-label: "Config"`
- `data-testid="app-config-button"`
- `shape: "circle"`
- `size: "small"`
- `className: "h-[27px] w-[27px]"`
- enabled color:
  - `hint-green`
- disabled color:
  - `disabled`
- default tooltip:
  - `Settings`
- leading icon:
  - settings icon `SettingsIcon`
  - `strokeWidth: 1.8`

Direct dialog branch when `showAppConfig=false`:

- trigger wrapper:
  - `DialogTrigger`
- dialog root:
  - `Dialog`
- child order:
  - trigger
  - full `User settings` dialog

Popover branch when `showAppConfig=true`:

- trigger wrapper:
  - `PopoverTrigger`
  - `asChild: true`
- outer root:
  - `Popover`
- separate full dialog root is still mounted in parallel:
  - `Dialog`
- fragment order:
  - `Popover`
  - `Dialog`

Popover contract:

- class:
  - `w-[650px] overflow-auto max-h-[80vh] max-w-[80vw]`
- `align: "end"`
- `side: "bottom"`
- `onFocusOutside`
  - `preventDefault()`

Modal dialog contract:

- class:
  - `w-[90vw] h-[90vh] overflow-hidden sm:max-w-5xl top-[5vh] p-0`
- dialog shell:
  - `DialogContent`
- dialog header:
  - `VisuallyHidden`
  - title child `DialogTitle`
- dialog body:
  - `UserConfigForm`

Shared setting primitives from `common.tsx`:

- `SettingTitle` class:
  - `text-md font-semibold text-muted-foreground uppercase tracking-wide mb-1`
- `SettingSubtitle` class:
  - `text-base font-semibold underline-offset-2 text-accent-foreground uppercase tracking-wide`
- `SettingDescription` class:
  - `text-sm text-muted-foreground`
- `SettingGroup` (used in `UserConfigForm`):
  - wrapper class `flex flex-col gap-4 pb-4`
  - title uses `SettingSubtitle`
  - differs from `SettingSection` in `AppConfigForm` which uses `flex flex-col gap-y-2` and raw `h3` tag

Titles:

- popover form title:
  - `Notebook Settings` (rendered via `SettingTitle`)
- form description:
  - `Configure how your notebook or application looks and behaves.`
- dialog title:
  - `User settings`

Popover footer link:

- button variant:
  - `link`
- button class:
  - `px-0`
- leading icon:
  - settings icon `SettingsIcon`
  - `className: "w-4 h-4 mr-2"`
- label:
  - `User settings`
- divider above footer link:
  - `div.h-px.bg-border.my-2`
- footer click path:
  - `onClick: () => setOpen(true)`

#### 8.2 Notebook Settings Form

Source:

Installed assets:

- `./assets/app-config-button-zy3OAtTs.js`
- `./assets/form-BEIQJWib.js`
- `./assets/field-9GctqEPJ.js`
- `./assets/select-Ch6m1k2G.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/app-config/app-config-form.tsx`
- `.__marimo_upstream/frontend/src/components/app-config/common.tsx`

The form auto-saves through debounced submit:

- debounce:
  - `100ms`
- save path:
  - `saveAppConfig({config})`
- submit wiring:
  - `handleSubmit(debouncedSave)`
- local config sync after save:
  - success path calls `setConfig(config)`
  - catch path also calls `setConfig(config)`
- width side effect:
  - `useEffect(() => { window.dispatchEvent(new Event("resize")); }, [config.width])`

Form layout:

- root:
  - `flex flex-col gap-6`
- section grid:
  - `grid grid-cols-2 gap-x-8 gap-y-4`
- section wrapper:
  - `flex flex-col gap-y-2`
- section title class:
  - `text-base font-semibold mb-1`
- section helper component:
  - `SettingSection`

Form controller contract:

- schema resolver:
  - `zodResolver(AppConfigSchema as unknown as z.ZodType<unknown, AppConfig>)`
- form default values:
  - `defaultValues: config`
- root form primitive:
  - `Form`

Section inventory:

- `Display`
  - `width`
  - `app_title`
- `Custom Files`
  - `css_file`
  - `html_head_file`
- `Data`
  - `sql_output`
- `Exporting outputs`
  - `auto_download`

Required testids:

- `data-testid="app-width-select"`
- `data-testid="sql-output-select"`
- `data-testid="html-checkbox"`
- `data-testid="ipynb-checkbox"`

Important field strings:

- `Width`
- `App title`
- `Custom CSS`
- `HTML Head`
- `SQL Output Type`
- `HTML`
- `IPYNB`

Field shell details:

- `Width`
  - select class `inline-flex mr-2`
  - options come from `getAppWidths().map((option) => <option value={option}>{option}</option>)`
- `App title`
  - input syncs `document.title` when schema-safe
- `Custom CSS`
  - `FormLabel className="shrink-0"`
  - input placeholder `custom.css`
- `HTML Head`
  - `FormLabel className="shrink-0"`
  - input placeholder `head.html`
- `SQL Output Type`
  - select class `inline-flex mr-2`
- `Exporting outputs`
  - checkbox row wrapper `flex gap-4`
  - checkbox item wrapper `flex items-center space-x-2`

Important descriptions:

- App title:
  - `The application title is put in the title tag in the HTML code and typically displayed in the title bar of the browser window.`
- Custom CSS:
  - `A filepath to a custom css file to be injected into the notebook.`
- HTML Head:
  - `A filepath to an HTML file to be injected into the <head/> section of the notebook. Use this to add analytics, custom fonts, meta tags, or external scripts.`
- SQL output:
  - `The Python type returned by a SQL cell. For best performance with large datasets, we recommend using native.`
- Exporting outputs:
  - `When enabled, marimo will periodically save this notebook in your selected formats (HTML, IPYNB) to a folder named __marimo__ next to your notebook file.`

SQL output change toast:

- title:
  - `Kernel Restart Required`
- description:
  - `This change requires a kernel restart to take effect.`

#### 8.3 User Settings Package Management

Source:

Installed assets:

- `./assets/app-config-button-zy3OAtTs.js`
- `./assets/form-BEIQJWib.js`
- `./assets/field-9GctqEPJ.js`
- `./assets/select-Ch6m1k2G.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/app-config/user-config-form.tsx`

Form behavior:

- auto-submit path:
  - `handleSubmit(saveDirtyFields)`
- save function only persists dirty fields:
  - `getDirtyValues(values, form.formState.dirtyFields)`
- save path:
  - `saveUserConfig({ config: dirtyConfig })`
- successful save merges new values into local config with:
  - `setConfig(prev => ({ ...prev, ...values }))`

Form layout:

- root form:
  - `flex flex-col gap-5`
- inner stack:
  - `flex flex-col gap-3`
- wrapper primitive:
  - `Form`

Field inventory:

- `package_management.manager`
  - select testid `data-testid="package-manager-select"`
  - select class `inline-flex mr-2`
  - options source `PackageManagerNames.map((option) => <option value={option}>{option}</option>)`

Package management description:

- body includes two external links:
  - `https://docs.marimo.io/guides/editor_features/package_management.html` with label `docs`
  - `https://docs.marimo.io/guides/package_management/inlining_dependencies.html` with label `sandboxed environment`
- sandboxed environment note:
  - `Running marimo in a sandboxed environment is only supported by` followed by `Kbd className="inline"` with text `uv`

#### 8.4 User Settings Form Structure

Source:

Installed assets:

- `./assets/app-config-button-zy3OAtTs.js`
- `./assets/form-BEIQJWib.js`
- `./assets/field-9GctqEPJ.js`
- `./assets/select-Ch6m1k2G.js`
- `./assets/index-CVpJvEAO.css`

Readable source:

- `.__marimo_upstream/frontend/src/components/app-config/user-config-form.tsx`
- `.__marimo_upstream/frontend/src/components/app-config/common.tsx`

UserConfigForm differs significantly from AppConfigForm:

- uses a tab-based layout with sidebar navigation, not a simple 2-column grid
- debounce constant:
  - `FORM_DEBOUNCE = 100` ms
- form resolver:
  - `zodResolver(UserConfigSchema as unknown as z.ZodType<unknown, UserConfig>)`
- dirty-value save:
  - uses `getDirtyValues(values, form.formState.dirtyFields)` and returns early if empty
- save path:
  - `saveUserConfig({ config: dirtyValues })`
- local merge path:
  - `setConfig(prev => ({ ...prev, ...values }))`

Tab layout:

- root uses sidebar navigation in left column (1/3 width) and content area in right column (2/3 width)
- tab categories:
  - editor (autosave, formatting, autocomplete)
  - package management and data
  - runtime
  - AI configuration
  - keyboard shortcuts
  - UI settings
  - feature flags / experimental
- sections use `SettingGroup` component (from `common.tsx`) which differs from `SettingSection` in `AppConfigForm`

