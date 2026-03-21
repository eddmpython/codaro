# 06 — AST Analysis & Code Compilation Pipeline

> Source: `marimo/_ast/`

## 6.1 Document Model

### App Class

> Source: `_ast/app.py` (~35KB)

```python
class App:
    _cell_manager: CellManager
    _config: AppConfig

    @cell                          # Decorator for cell registration
    def my_cell(arg1, arg2):       # args = variable refs
        x = arg1 + arg2           # x becomes a cell "def"
        return x

    def run() -> tuple[dict, dict]
        # Script execution: returns (outputs, defs)

    def embed() -> None
        # Nested app embedding
```

### InternalApp

```python
class InternalApp:
    cell_manager: CellManager
    config: AppConfig

    def _maybe_initialize() -> None
        # Validate graph: cycles, multiple definitions

    @property
    def graph(self) -> DirectedGraph

    @property
    def runner(self) -> dataflow.Runner
```

### AppConfig

```python
class AppConfig:
    width: "normal" | "compact" | "medium" | "full" | "columns"
    app_title: Optional[str]
    layout_file: Optional[str]
    css_file: Optional[str]
    auto_download: list[str]       # Packages to auto-install
```

## 6.2 Cell Model

> Source: `_ast/cell.py` (~24KB)

### CellImpl (Immutable Compiled Cell)

```python
@dataclass(frozen=True)
class CellImpl:
    # Identity
    key: int                       # hash(code) for cache lookups
    cell_id: CellId_t

    # Source
    code: str                      # Raw source code

    # AST Analysis Results
    mod: ast.Module                # Parsed AST
    defs: frozenset[Name]          # Variables DEFINED by this cell
    refs: frozenset[Name]          # Variables USED by this cell
    sql_refs: frozenset[Name]      # SQL-specific references
    temporaries: frozenset[Name]   # Local-only variables (mangled)
    variable_data: dict[Name, list[VariableData]]  # Detailed var info

    # Compiled Bytecode
    body: CodeType                 # exec() bytecode (all statements)
    last_expr: Optional[CodeType]  # eval() bytecode (return value)

    # Metadata
    markdown: Optional[str]        # Extracted markdown if mo.md() cell
    is_import_block: bool          # All statements are imports
    _status: RuntimeState          # Mutable status field
    _stale: bool                   # Mutable stale flag
    _output: Optional[CellOutput]  # Mutable last output
    _test: bool                    # Contains pytest tests
```

### RuntimeState

```python
RuntimeState = Literal[
    "idle",                        # Not running
    "queued",                      # Waiting to execute
    "running",                     # Currently executing
    "disabled-transitively",       # Disabled by ancestor
]
```

### RunResultStatus

```python
RunResultStatus = Literal[
    "success",                     # Normal completion
    "exception",                   # Python exception raised
    "cancelled",                   # Ancestor failed, skipped
    "interrupted",                 # User Ctrl+C
    "marimo-error",                # marimo-specific error (cycle, multi-def)
    "disabled",                    # Cell explicitly disabled
]
```

### CellConfig

```python
class CellConfig:
    disabled: bool = False         # Don't execute this cell
    hide_code: bool = False        # Hide source in UI
    column: Optional[int] = None   # Column layout position
```

### ImportWorkspace

```python
class ImportWorkspace:
    # Tracks which imports have been loaded
    # Avoids re-executing import cells unnecessarily
    loaded_modules: set[str]
    import_cells: set[CellId_t]
```

## 6.3 CellManager

> Source: `_ast/cell_manager.py` (~16KB)

```python
class CellManager:
    _cell_data: dict[CellId_t, CellData]
    _unparsable_cells: dict[CellId_t, str]

    def register_cell(
        cell_id: CellId_t,
        code: str,
        name: str,
        config: CellConfig,
        cell: Optional[Cell],
    ) -> None

    def register_unparsable_cell(
        cell_id: CellId_t,
        code: str,
        name: str,
        config: CellConfig,
    ) -> None

    def cell_ids(self) -> list[CellId_t]
        # Ordered list of all cell IDs

    def codes(self) -> dict[CellId_t, str]

    def names(self) -> dict[CellId_t, str]

    def configs(self) -> dict[CellId_t, CellConfig]

    def valid_cells(self) -> dict[CellId_t, CellImpl]
```

## 6.4 AST Visitor — Variable Inference Engine

> Source: `_ast/visitor.py` (~43KB)

이것이 marimo의 **핵심 메커니즘**: 사용자 코드에서 `defs`(정의)와 `refs`(참조)를 자동 추론한다.

### ScopedVisitor

```python
class ScopedVisitor(ast.NodeVisitor):
    block_stack: list[Block]       # Nested scope stack
    ref_stack: list[set[Name]]     # Refs at each scope level
    obscured_scope_stack: list     # Exception handler vars
```

### Block (Scope Unit)

```python
class Block:
    defs: set[Name]                # Variables defined in this scope
    global_names: set[Name]        # Variables declared with `global`
    variable_data: dict[Name, list[VariableData]]
    is_comprehension: bool         # Comprehension-specific scoping
```

### VariableData

```python
class VariableData:
    kind: Literal[
        "function", "class", "import", "variable",
        "temporary", "table", "view", "schema", "catalog"
    ]
    required_refs: frozenset[Name]   # Vars needed at definition time
    unbounded_refs: frozenset[Name]  # Vars needed in function body
    annotation_data: Optional[AnnotationData]
    import_data: Optional[ImportData]
    qualified_name: Optional[str]    # SQL qualified names
```

### Inference Algorithm

**Step 1: Block Stack Traversal**
```
Global scope → Function → Class → Comprehension → ...
Each scope level has its own Block with defs/refs
```

**Step 2: Name Resolution Rules**

```python
visit_Name(node):
    if node.ctx == Store:
        # Define variable in current block
        current_block.defs.add(node.id)
    elif node.ctx == Load:
        # If NOT defined in current block → add to refs
        if node.id not in current_block.defs:
            current_refs.add(node.id)
    elif node.ctx == Del:
        # Track deletion (affects dependency)
        current_block.deleted_refs.add(node.id)
```

**Step 3: Assignment Handling**
```python
visit_Assign(node):
    # IMPORTANT: Visit RHS FIRST, then LHS
    # This handles: x = x + 1 (x is a ref before it's a def)
    visit(node.value)      # RHS → may add refs
    visit(node.targets)    # LHS → adds defs
```

**Step 4: Function/Class Handling**
```python
visit_FunctionDef(node):
    # 1. Collect function signature refs (defaults, annotations)
    required_refs = visit_signature(node)

    # 2. Enter new block scope
    push_block(Block(is_comprehension=False))

    # 3. Add parameters to new block's defs
    for param in node.args:
        current_block.defs.add(param.arg)

    # 4. Visit function body
    visit(node.body)

    # 5. Collect unbounded refs (used in body but not defined)
    unbounded_refs = current_refs - current_block.defs

    # 6. Pop block, register function name in parent block
    pop_block()
    parent_block.defs.add(node.name)
    parent_block.variable_data[node.name] = VariableData(
        kind="function",
        required_refs=required_refs,
        unbounded_refs=unbounded_refs,
    )
```

**Step 5: Global Statement**
```python
visit_Global(node):
    for name in node.names:
        current_block.global_names.add(name)
        # Moves definition to block_stack[0] (global scope)
```

**Step 6: Comprehension Scoping**
```python
visit_ListComp/SetComp/DictComp/GeneratorExp(node):
    push_block(Block(is_comprehension=True))
    # Comprehension variables DON'T leak to outer scope (Python 3)
    visit(node.generators)
    visit(node.elt)
    pop_block()
```

**Step 7: SQL Detection**
```python
visit_Call(node):
    if is_sql_call(node):  # mo.sql(), duckdb.execute()
        sql_string = extract_sql(node)
        sql_defs, sql_refs = parse_sql(sql_string)
        current_block.defs.update(sql_defs)
        current_block.sql_refs.update(sql_refs)
        variable_data[name] = VariableData(kind="table", ...)
```

**Step 8: Variable Mangling**
```python
# Local variables starting with _ get mangled:
# _foo → _{cell_uuid}_foo
# Prevents pollution of global namespace
if name.startswith("_") and not name.startswith("__"):
    mangled = f"_{cell_uuid}{name}"
    current_block.temporaries.add(mangled)
```

### Final Output

```python
# After visiting entire cell AST:
cell_defs = global_block.defs
cell_refs = global_block_refs - cell_defs  # Used but not defined here
cell_temporaries = global_block.temporaries
cell_variable_data = global_block.variable_data
```

## 6.5 Code Compilation Pipeline

> Source: `_ast/compiler.py` (~21KB)

### compile_cell()

```python
def compile_cell(
    code: str,
    cell_id: CellId_t,
    carried_imports: list[str] = [],
) -> CellImpl:
```

**Pipeline:**

1. **Parse to AST**
   ```python
   module = ast.parse(code, mode="exec")
   ```

2. **Visit for variable analysis**
   ```python
   visitor = ScopedVisitor()
   visitor.visit(module)
   defs = visitor.defs
   refs = visitor.refs
   variable_data = visitor.variable_data
   ```

3. **Separate body & expression**
   ```python
   if isinstance(module.body[-1], ast.Expr):
       if not code.rstrip().endswith(";"):
           last_expr = module.body.pop()  # Treat as return value
   ```

4. **Compile to bytecode**
   ```python
   body = compile(module, filename, "exec",
       flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)

   if last_expr:
       expr_module = ast.Expression(body=last_expr.value)
       last_expr_code = compile(expr_module, filename, "eval",
           flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
   ```

5. **Extract markdown**
   ```python
   if is_single_mo_md_call(module):
       markdown = extract_markdown_string(module.body[0])
   ```

6. **Cache in linecache**
   ```python
   linecache.cache[filename] = (len(code), None, code.splitlines(True), filename)
   # Enables debuggers and tracebacks to show correct source
   ```

7. **Return CellImpl**
   ```python
   return CellImpl(
       key=hash(code),
       cell_id=cell_id,
       code=code,
       mod=module,
       defs=frozenset(defs),
       refs=frozenset(refs),
       sql_refs=frozenset(sql_refs),
       temporaries=frozenset(temporaries),
       variable_data=variable_data,
       body=body,
       last_expr=last_expr_code,
       markdown=markdown,
       is_import_block=all_imports(module),
   )
   ```

### Cell Type Detection

```python
def is_coroutine(cell: CellImpl) -> bool:
    # True if code uses top-level await
    return cell.body.co_flags & CO_COROUTINE

def contains_only_tests(cell: CellImpl) -> bool:
    # True if all statements are test functions/fixtures

def is_import_block(cell: CellImpl) -> bool:
    # True if all statements are import/from statements
```

## 6.6 Notebook Parser

> Source: `_ast/parse.py` (~40KB)

### Parser Flow (marimo format)

```python
class Parser:
    def parse(source: str) -> ParsedNotebook:
        header = parse_header()       # Docstring/comments
        import_stmt = parse_import()  # require `import marimo`
        app_init = parse_app()        # `app = marimo.App(...)`
        setup = parse_setup()         # Optional `with app.setup(...):`
        cells = parse_body()          # @app.cell decorated functions
        return ParsedNotebook(header, app_init, setup, cells)
```

### Extractor

```python
class Extractor:
    def to_cell(node: ast.AST) -> CellDef:
        # Extract function body as cell code
        # Handle @app.cell, @app.function, @app.class_definition
        # Precise line/column mapping for source positions

    def to_cell_def(func_node: ast.FunctionDef) -> CellDef:
        # Body code extraction with correct indentation
        # Handles decorators, trailing comments, multiline
```

### Supported Formats

| Format | Parser | Cell Delimiter |
|--------|--------|----------------|
| marimo native | `Parser` | `@app.cell` decorated functions |
| Percent format | `PercentParser` | `# %% [code]`, `# %% [markdown]` |
| Jupyter notebook | `ipynb` converter | JSON cells array |
| Markdown | `MarkdownParser` | Fenced code blocks |

## 6.7 Code Generation

> Source: `_ast/codegen.py` (~20KB)

### Output Formats

```python
def generate_marimo_code(notebook: NotebookSerialization) -> str:
    # Generates @app.cell decorated Python code

def generate_percent_code(notebook: NotebookSerialization) -> str:
    # Generates # %% delimited Python code

def generate_script_code(notebook: NotebookSerialization) -> str:
    # Generates flat Python script (no marimo imports)
```

### Source Position Tracking

```python
class SourcePosition:
    filename: str
    lineno: int
    col_offset: int

def fix_source_position(module: ast.Module, offset: int) -> None:
    # Increment all AST node positions for correct error reporting
    # Maps cell code back to original file positions
```

## 6.8 Codaro Mapping Direction

| marimo | Codaro | Notes |
|--------|--------|-------|
| `ScopedVisitor` | `src/codaro/document/` AST 분석 | Codaro의 핵심 — 이미 유사 구현 존재 |
| `compile_cell()` | Codaro compiler | body/last_expr 분리 패턴 수용 |
| `CellImpl` | Codaro Cell/Block model | Codaro는 cell보다 block 중심으로 확장 |
| `CellManager` | Codaro document model | 셀 ID 관리, 순서, 설정 |
| Variable mangling | 수용 | `_` 접두사 변수 격리 패턴 |
| Percent format parser | 이미 구현됨 | `src/codaro/document/` percent parser |
| marimo native format | Import/export용 | 호환 유지 |
| SQL detection | 후순위 | 초기에는 Python만 |
| `PyCF_ALLOW_TOP_LEVEL_AWAIT` | 필수 | async cell 지원 |
