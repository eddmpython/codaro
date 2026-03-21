# 10 — Widget System & Output Formatters Contract

> Source: `marimo/_plugins/`, `marimo/_output/`

## 10.1 Widget Architecture

### Plugin System Overview

```
_plugins/
├── validators.py              # Input validation
├── core/
│   ├── media.py               # Image, video, audio base
│   └── web_component.py       # Web component infrastructure
├── ui/
│   ├── __init__.py            # Public mo.ui.* API
│   ├── _core/                 # Widget infrastructure
│   └── _impl/                 # 30+ widget implementations
└── stateless/                 # Display-only components (30+ files)
```

### Widget Lifecycle

```
1. Python: widget = mo.ui.slider(start=0, stop=100)
   → Creates UIElement with unique object_id
   → Serializes initial state to JSON descriptor

2. Kernel → Frontend: Descriptor in cell output
   → Frontend renders corresponding Svelte/React component

3. User interaction: slider dragged to 42
   → Frontend → POST /api/kernel/set_ui_element_value
   → {object_id: "abc123", value: 42}

4. Server → Kernel: UpdateUIElementCommand
   → widget._value updated
   → Cells referencing widget.value → re-execute (reactive)

5. Kernel → Frontend: CellNotification for re-executed cells
```

## 10.2 UI Components Catalog (mo.ui.*)

### Input Controls

| Component | Source | Description |
|-----------|--------|-------------|
| `button` | `_impl/input.py` | Click button with callback |
| `checkbox` | `_impl/input.py` | Boolean toggle |
| `radio` | `_impl/input.py` | Single selection from options |
| `slider` | `_impl/input.py` | Numeric range slider |
| `range_slider` | `_impl/input.py` | Two-handle range slider |
| `number` | `_impl/input.py` | Numeric input with step |
| `text` | `_impl/input.py` | Single-line text input |
| `text_area` | `_impl/input.py` | Multi-line text input |
| `dropdown` | `_impl/input.py` | Single selection dropdown |
| `multiselect` | `_impl/input.py` | Multi selection dropdown |
| `switch` | `_impl/switch.py` | Toggle switch |
| `file` | `_impl/input.py` | File upload |
| `date` | `_impl/dates.py` | Date picker |
| `datetime` | `_impl/dates.py` | Datetime picker |
| `date_range` | `_impl/dates.py` | Date range picker |
| `code_editor` | `_impl/input.py` | Code editor with syntax highlighting |

### Complex Data Components

| Component | Source | Description |
|-----------|--------|-------------|
| `table` | `_impl/table.py` (~59KB) | Interactive data table with sort/filter/select |
| `data_editor` | `_impl/data_editor.py` | Editable spreadsheet |
| `dataframe` | `_impl/dataframes/` | DataFrame manipulation UI |
| `data_explorer` | `_impl/data_explorer.py` | Auto-generated data exploration |

### Visualization Components

| Component | Source | Description |
|-----------|--------|-------------|
| `altair_chart` | `_impl/altair_chart.py` (~33KB) | Altair/Vega-Lite with selection |
| `plotly` | `_impl/plotly.py` (~53KB) | Plotly chart with selection |
| `matplotlib` | `_impl/mpl.py` | Matplotlib interactive |

### Composite Components

| Component | Source | Description |
|-----------|--------|-------------|
| `form` | `_impl/input.py` | Wrap any element with submit button |
| `array` | `_impl/array.py` | Dynamic list of elements |
| `dictionary` | `_impl/dictionary.py` | Key-value pairs of elements |
| `matrix` | `_impl/matrix.py` | 2D grid of elements |
| `batch` | `_impl/batch.py` | Multiple elements as one |

### Special Components

| Component | Source | Description |
|-----------|--------|-------------|
| `chat` | `_impl/chat/` | Conversational AI interface |
| `microphone` | `_impl/microphone.py` | Audio recording |
| `refresh` | `_impl/refresh.py` | Auto-refresh timer |
| `run_button` | `_impl/run_button.py` | Manual execution trigger |
| `file_browser` | `_impl/file_browser.py` | File system browser |
| `anywidget` | `_impl/from_anywidget.py` | AnyWidget wrapper |
| `panel` | `_impl/from_panel.py` | Panel integration |

## 10.3 Stateless Display Components (mo.*)

### Layout

| Function | Source | Description |
|----------|--------|-------------|
| `hstack(*items)` | `stateless/flex.py` | Horizontal stack |
| `vstack(*items)` | `stateless/flex.py` | Vertical stack |
| `sidebar(items)` | `stateless/sidebar.py` | Sidebar layout |
| `center(item)` | `stateless/flex.py` | Center alignment |
| `left(item)` | `stateless/flex.py` | Left alignment |
| `right(item)` | `stateless/flex.py` | Right alignment |
| `tabs(items)` | `stateless/tabs.py` | Tab container |
| `accordion(items)` | `stateless/accordion.py` | Collapsible sections |
| `carousel(items)` | `stateless/carousel.py` | Slideshow |
| `nav_menu(items)` | `stateless/nav_menu.py` | Navigation menu |
| `routes(routes)` | `stateless/routes.py` | URL routing |
| `lazy(fn)` | `stateless/lazy.py` | Lazy loading |

### Content

| Function | Source | Description |
|----------|--------|-------------|
| `md(text)` | `_output/md.py` | Markdown with variable interpolation |
| `Html(html)` | `_output/hypertext.py` | Raw HTML rendering |
| `plain_text(text)` | `stateless/plain_text.py` | Plain text |
| `callout(content)` | `stateless/callout.py` | Callout box |
| `stat(value, label)` | `stateless/stat.py` | Statistics card |
| `tree(data)` | `stateless/tree.py` | Tree view |
| `json(data)` | `stateless/json_component.py` | JSON viewer |

### Media

| Function | Source | Description |
|----------|--------|-------------|
| `image(src)` | `stateless/image.py` | Image display |
| `image_compare(a, b)` | `stateless/image_compare.py` | Side-by-side comparison |
| `video(src)` | `stateless/video.py` | Video player |
| `audio(src)` | `stateless/audio.py` | Audio player |
| `pdf(src)` | `stateless/pdf.py` | PDF viewer |
| `download(data)` | `stateless/download.py` | Download button |
| `icon(name)` | `stateless/icon.py` | Icon rendering |
| `mermaid(text)` | `stateless/mermaid.py` | Mermaid diagram |

### Styling

| Function | Source | Description |
|----------|--------|-------------|
| `style(elem, styles)` | `stateless/style.py` | Apply CSS styles |
| `as_html(obj)` | `_output/formatting.py` | Convert any object to HTML |

## 10.4 Output Formatting System

> Source: `_output/`

### Formatter Registry

> Source: `_output/formatters/formatters.py`

```python
@formatter(MyType)
def format_mytype(obj: MyType) -> tuple[KnownMimeType, str]:
    return ("text/html", "<div>...</div>")
```

### Resolution Order

```
1. _display_() method on object        # Highest precedence
2. Registered opinionated formatters    # @formatter(type)
3. _mime_() protocol method             # Protocol-based
4. repr() fallback                      # Default
```

### Built-in Formatters (25+)

| Formatter | Source | Types Handled |
|-----------|--------|---------------|
| `df_formatters` | `formatters/df_formatters.py` | pandas, polars DataFrames |
| `altair_formatters` | `formatters/altair_formatters.py` | Altair charts |
| `plotly_formatters` | `formatters/plotters.py` | Plotly figures |
| `matplotlib_formatters` | `formatters/matplotlib_formatters.py` | Matplotlib figures |
| `bokeh_formatters` | `formatters/bokeh_formatters.py` | Bokeh plots |
| `holoviews_formatters` | `formatters/holoviews_formatters.py` | HoloViews |
| `ai_formatters` | `formatters/ai_formatters.py` | AI model objects |
| `cell` | `formatters/cell.py` | Cell output formatting |

### Output Builder

> Source: `_output/builder.py`

```python
class OutputBuilder:
    """Build complex outputs from multiple elements."""

    def add(element: Any, mimetype: Optional[KnownMimeType] = None)
    def build() -> CellOutput
```

### Hypertext (HTML) Output

> Source: `_output/hypertext.py`

```python
class Html:
    """HTML output wrapper."""
    text: str

    def __init__(html: str):
        self.text = html

    def _mime_(self) -> tuple[str, str]:
        return ("text/html", self.text)

    def batch(**elements) -> batch:
        """Create interactive batch from HTML template."""

    def callout(**kwargs) -> Html:
        """Wrap in callout box."""

    def style(styles: dict) -> Html:
        """Apply CSS styles."""
```

### Markdown with Interpolation

> Source: `_output/md.py`

```python
def md(text: str) -> Html:
    """Markdown → HTML with Python variable interpolation.

    Usage:
        x = 42
        mo.md(f"The value is **{x}**")
        mo.md("The value is **{x}**")  # Also works via f-string-like syntax
    """
    # 1. Parse f-string-like {var} references
    # 2. Convert markdown to HTML
    # 3. Embed interactive elements (widgets in markdown)
    return Html(rendered_html)
```

## 10.5 MIME Type System

### KnownMimeType Enum

```python
KnownMimeType = Literal[
    "text/plain",
    "text/html",
    "text/markdown",
    "text/csv",
    "text/latex",
    "application/json",
    "application/javascript",
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/svg+xml",
    "image/webp",
    "image/avif",
    "video/mp4",
    "video/mpeg",
    "audio/mpeg",
    "audio/wav",
    "application/vnd.marimo+error",
    "application/vnd.marimo+traceback",
    "application/vnd.marimo+mimebundle",
]
```

### MIME Bundle

여러 형식을 동시에 포함:
```python
{
    "text/plain": "DataFrame (100 rows × 5 cols)",
    "text/html": "<table>...</table>",
    "application/json": {"columns": [...], "data": [...]}
}
```

## 10.6 Widget State Protocol

### UIElement Base

```python
class UIElement:
    _id: str                      # Unique object ID
    _value: T                     # Current value
    _initial_value: T             # Default value

    @property
    def value(self) -> T:
        """Reactive: accessing triggers dependency tracking."""
        return self._value

    def _update(self, value: Any) -> None:
        """Called when frontend sends new value."""
        self._value = self._convert_value(value)

    def _get_component_args(self) -> dict:
        """JSON descriptor for frontend rendering."""
```

### Component Registration

프론트엔드는 `component_name` 으로 올바른 컴포넌트를 렌더링:

```python
class slider(UIElement):
    _component_name = "marimo-slider"

    def _get_component_args(self):
        return {
            "start": self._start,
            "stop": self._stop,
            "step": self._step,
            "value": self._value,
            "label": self._label,
        }
```

## 10.7 Codaro Mapping Direction

| marimo | Codaro | Notes |
|--------|--------|-------|
| `mo.ui.*` 45+ widgets | Codaro 위젯 시스템 | CLAUDE.md 위젯/뷰 브리지 원칙과 일치 |
| Python → JSON descriptor | 수용 | "코드가 인터페이스가 되는 편집기" |
| `_display_()` protocol | 수용 | 사용자 정의 출력 형식 |
| Formatter registry | 수용 | DataFrame, chart 자동 렌더링 |
| `mo.md()` interpolation | 수용 | 마크다운 + 변수 삽입 |
| `Html` wrapper | 수용 | HTML 출력 기본 타입 |
| Layout components | 수용 | hstack, vstack, tabs, accordion |
| Chart integrations | 후순위 | altair, plotly, matplotlib |
| Widget reactive binding | 핵심 수용 | 위젯 값 변경 → 셀 재실행 |
| MIME bundle | 수용 | 다중 형식 출력 |
