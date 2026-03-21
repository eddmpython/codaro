# 07 — Runtime Engine & Reactive Dataflow Contract

> Source: `marimo/_runtime/runtime.py`, `marimo/_runtime/dataflow/`, `marimo/_runtime/runner/`, `marimo/_runtime/executor.py`, `marimo/_runtime/state.py`

## 7.1 Kernel (Main Coordinator)

> Source: `_runtime/runtime.py` (~3800 lines, ~137KB)

### Kernel Class

```python
class Kernel:
    graph: DirectedGraph           # Cell dependency graph
    globals: dict                  # Shared namespace (module.__dict__)
    errors: dict[CellId_t, tuple[Error, ...]]
    _module: ModuleType            # Synthetic module for globals
    execution_context: Optional[ExecutionContext]
    state_updates: dict[State, CellId_t]

    # Initialization
    def __init__(
        stream: Stream,
        app: InternalApp,
        user_config: MarimoConfig,
        app_metadata: AppMetadata,
    )
```

### Core Execution Methods

```python
class Kernel:
    async def run(
        execution_requests: Sequence[ExecuteCellCommand]
    ) -> None:
        """Main entry point: execute cell(s) and propagate reactively."""
        # 1. mutate_graph() — compile, register, validate
        # 2. _run_cells() — execute in dependency order
        # 3. Handle state updates → re-run affected cells

    async def delete_cell(request: DeleteCellCommand) -> None:
        """Remove cell from graph, clean up definitions."""

    async def sync_graph(
        cells: dict,
        run_ids: list,
        delete_ids: list,
    ) -> None:
        """Bulk sync: register new cells, delete old ones, run."""

    async def set_ui_element_value(
        request: UpdateUIElementCommand
    ) -> bool:
        """Update widget value, trigger dependent cells."""

    async def run_stale_cells() -> None:
        """Execute all cells marked stale (lazy mode catch-up)."""
```

### Graph Mutation Phase

```python
def mutate_graph(
    execution_requests: Sequence[ExecuteCellCommand],
) -> set[CellId_t]:
    """
    Phase 1: Compile and validate.
    Returns: set of cell IDs to execute.
    """

    # 1. For each request:
    for req in execution_requests:
        cell = _maybe_register_cell(req)
        # → compile_cell(code, cell_id)
        # → graph.register_cell(cell_id, cell_impl)

    # 2. Check for semantic errors
    semantic_errors = check_for_errors(graph)
    # Detects: cycles, multiple definitions, deleted nonlocal refs

    # 3. Determine cells to run
    cells_to_run = set()
    for req in execution_requests:
        if no_errors(req.cell_id):
            cells_to_run.add(req.cell_id)
            # In autorun mode: add all descendants too

    return cells_to_run
```

### Cell Execution Phase

```python
async def _run_cells(cells_to_run: set[CellId_t]) -> None:
    """Phase 2: Execute cells in dependency order."""

    runner = Runner(
        roots=cells_to_run,
        graph=self.graph,
        glbls=self.globals,
        execution_mode=config.on_cell_change,  # "autorun" | "lazy"
        execution_type=config.execution_type,   # "relaxed" | "strict"
        excluded_cells=errored_cells,
        hooks=run_hooks,
    )

    while runner.pending():
        cell_id = runner.pop_cell()

        # Pre-execution hooks
        for hook in hooks.pre_execution_hooks:
            hook(cell, context)

        # Execute
        run_result = await runner.run(cell_id)

        # Post-execution hooks
        for hook in hooks.post_execution_hooks:
            hook(cell, context, run_result)

        # Broadcast output
        stream.write(CellNotification(
            cell_id=cell_id,
            output=run_result.output,
            console=run_result.console,
            status=run_result.status,
        ))

    # Handle state updates
    if self.state_updates:
        cells_with_stale_state = runner.resolve_state_updates(
            self.state_updates
        )
        await self._run_cells(cells_with_stale_state)
```

## 7.2 Directed Graph (Dependency Tracking)

> Source: `_runtime/dataflow/graph.py`

### Data Structure

```python
class DirectedGraph:
    topology: MutableGraphTopology
    definition_registry: DefinitionRegistry
    cycle_tracker: CycleTracker
```

```python
class MutableGraphTopology:
    cells: dict[CellId_t, CellImpl]      # All registered cells
    parents: dict[CellId_t, set[CellId_t]]   # Who I depend on
    children: dict[CellId_t, set[CellId_t]]  # Who depends on me
```

```python
class DefinitionRegistry:
    definitions: dict[Name, set[CellId_t]]
    # Which cells define each variable name
```

### Edge Computation

```python
def register_cell(cell_id: CellId_t, cell: CellImpl) -> None:
    # 1. Register variable definitions
    for name in cell.defs:
        definition_registry.register(cell_id, name)

    # 2. Compute edges
    parents = set()
    children = set()

    for ref in cell.refs:
        defining_cells = definition_registry.get(ref)
        for parent_id in defining_cells:
            parents.add(parent_id)         # I depend on parent
            children_of_parent.add(cell_id)  # Parent has me as child

    for name in cell.defs:
        for child_id in cells_using(name):
            children.add(child_id)         # Others depend on me

    topology.parents[cell_id] = parents
    topology.children[cell_id] = children

    # 3. Cycle detection
    cycle_tracker.detect_cycle_for_edges(new_edges)
```

### Key Graph Operations

```python
class DirectedGraph:
    def delete_cell(cell_id: CellId_t) -> set[CellId_t]:
        """Remove cell, return affected descendants."""

    def get_defining_cells(name: Name) -> set[CellId_t]:
        """Which cells define this variable?"""

    def get_referring_cells(name: Name) -> set[CellId_t]:
        """Which cells use this variable?"""

    def ancestors(cell_id: CellId_t) -> set[CellId_t]:
        """Transitive parents (all upstream cells)."""

    def descendants(cell_id: CellId_t) -> set[CellId_t]:
        """Transitive children (all downstream cells)."""

    def set_stale(
        cell_ids: set[CellId_t],
        prune_imports: bool = False
    ) -> None:
        """Mark cells and their descendants as stale."""
        cells_to_mark = transitive_closure(graph, cell_ids)
        for cid in cells_to_mark:
            graph.cells[cid].set_stale(True)

    def disable_cell(cell_id: CellId_t) -> None
    def enable_cell(cell_id: CellId_t) -> set[CellId_t]
```

### Topological Sort

```python
def topological_sort(
    graph: DirectedGraph,
    cells: set[CellId_t],
) -> list[CellId_t]:
    """Sort cells in dependency order (parents before children)."""
    # Standard Kahn's algorithm
    # Guarantees: all parents of cell C execute before C
```

### Transitive Closure

```python
def transitive_closure(
    graph: DirectedGraph,
    roots: set[CellId_t],
    children: bool = True,       # Follow children (downstream)?
    predicate: Callable = None,  # Filter function
    relatives: dict = None,      # Import block handling
) -> set[CellId_t]:
    """All cells reachable from roots following edges."""
```

### Cycle Detection

```python
class CycleTracker:
    cycles: set[tuple[tuple[CellId_t, CellId_t], ...]]

    def detect_cycle_for_edge(edge: tuple[CellId_t, CellId_t]) -> bool:
        """DFS-based cycle detection. Returns True if cycle found."""
```

## 7.3 Cell Runner

> Source: `_runtime/runner/cell_runner.py` (~900+ lines)

### Runner Class

```python
class Runner:
    def __init__(
        roots: set[CellId_t],
        graph: DirectedGraph,
        glbls: dict,
        execution_mode: Literal["autorun", "lazy"],
        execution_type: Literal["relaxed", "strict"],
        excluded_cells: set[CellId_t],
        hooks: RunHooks,
    ):
        self.cells_to_run = self.compute_cells_to_run(
            graph, roots, excluded_cells, execution_mode
        )
        self._queue = deque(topological_sort(graph, self.cells_to_run))
```

### Execution Order Computation

```python
@staticmethod
def compute_cells_to_run(graph, roots, excluded, mode):
    # 1. Always include stale ancestors
    cells = roots | stale_ancestors(graph, roots)

    # 2. In autorun mode: include all descendants
    if mode == "autorun":
        cells = transitive_closure(graph, cells)

    # 3. Remove excluded (errored) cells
    cells -= excluded

    # 4. Topological sort
    return topological_sort(graph, cells)
```

### Cell Execution

```python
async def run(cell_id: CellId_t) -> RunResult:
    cell = graph.cells[cell_id]

    try:
        if cell.is_coroutine():
            return_value = await executor.execute_cell_async(
                cell, glbls, graph
            )
        else:
            return_value = executor.execute_cell(
                cell, glbls, graph
            )
        return RunResult(output=return_value, exception=None)

    except MarimoMissingRefError as e:
        self.cancel(cell_id)  # Cancel descendants
        return RunResult(output=error, exception=e)

    except MarimoRuntimeException as e:
        self.cancel(cell_id)  # Cancel descendants
        return RunResult(output=error, exception=e.__cause__)
```

### Error Propagation (Cancel Descendants)

```python
def cancel(cell_id: CellId_t) -> None:
    """Cancel this cell and all downstream dependents."""
    descendants = transitive_closure(graph, {cell_id})
    for desc_id in descendants:
        self.cancelled_cells.add(desc_id)
        graph.cells[desc_id].set_status("cancelled")
```

### Execution Hooks

```python
class RunHooks:
    pre_execution_hooks: list[PreExecutionHook]
    preparation_hooks: list[PreparationHook]
    post_execution_hooks: list[PostExecutionHook]
    on_finish_hooks: list[OnFinishHook]
```

**Pre-execution:** State setup, UI element registration
**Post-execution:** Broadcast output, variable tracking, state update detection
**On-finish:** Cleanup, final notifications

## 7.4 Executor (Code Runner)

> Source: `_runtime/executor.py`

### DefaultExecutor (Relaxed Mode)

```python
class DefaultExecutor(Executor):
    def execute_cell(
        cell: CellImpl,
        glbls: dict,
        graph: DirectedGraph,
    ) -> Any:
        exec(cell.body, glbls)              # Run all statements
        if cell.last_expr:
            return eval(cell.last_expr, glbls)  # Capture return
        return None
```

**Relaxed mode behavior:**
- Single shared `globals` namespace
- `NameError` caught and wrapped in `MarimoRuntimeException`
- Variables from all cells visible to all cells

### StrictExecutor (Isolated Mode)

```python
class StrictExecutor(Executor):
    def execute_cell(
        cell: CellImpl,
        glbls: dict,
        graph: DirectedGraph,
    ) -> Any:
        # 1. Sanitize inputs — clone only cell.refs
        local_glbls = self._sanitize_inputs(cell, glbls)

        # 2. Pre-check: verify all refs are defined
        for ref in cell.refs:
            if ref not in local_glbls:
                raise MarimoMissingRefError(ref)

        # 3. Execute in isolated namespace
        exec(cell.body, local_glbls)
        return_value = eval(cell.last_expr, local_glbls) if cell.last_expr else None

        # 4. Update outputs — only cell.defs go back to globals
        self._update_outputs(cell, glbls, local_glbls)

        return return_value
```

**Strict mode behavior:**
- Cloned namespace per cell (only `refs` injected)
- Pre-validation of all references
- Deep copies of primitives, shallow for modules/functions
- Only `defs` written back to global namespace

### Executor Interface

```python
class Executor(ABC):
    @abstractmethod
    def execute_cell(cell, glbls, graph) -> Any: ...

    @abstractmethod
    async def execute_cell_async(cell, glbls, graph) -> Any: ...
```

## 7.5 State System (Reactive State)

> Source: `_runtime/state.py`

### State Container

```python
class State(Generic[T]):
    _value: T
    _set_value: SetFunctor

    def __init__(value: T, allow_self_loops: bool = False):
        self._value = value
        self._set_value = SetFunctor(self)
        state_registry.register(self, name, context)

    def __call__(self) -> T:
        """Get current value."""
        return self._value
```

### SetFunctor (State Setter)

```python
class SetFunctor:
    def __call__(self, update: T | Callable[[T], T]) -> None:
        if callable(update):
            self.state._value = update(self.state._value)
        else:
            self.state._value = update

        # Notify kernel of state change
        ctx.register_state_update(self.state)
```

### State Update Resolution

```python
# In Kernel._run_cells():
if self.state_updates:
    # Find cells that reference the updated state
    cells_to_rerun = set()
    for state, setter_cell_id in self.state_updates.items():
        for cell_id in cells_referencing_state(state):
            if cell_id != setter_cell_id or state.allow_self_loops:
                cells_to_rerun.add(cell_id)

    self.state_updates.clear()
    await self._run_cells(cells_to_rerun)
```

### StateRegistry

```python
class StateRegistry:
    _states: dict[int, tuple[State, str, CellId_t]]
    # id(state) → (state_obj, variable_name, owning_cell)

    def register(state: State, name: str, cell_id: CellId_t)
    def unregister(state: State)
    def lookup(state: State) -> Optional[tuple[str, CellId_t]]
```

## 7.6 Execution Modes

### Autorun Mode (Default)

```
Cell A modified → compile → execute A → auto-execute B, C (descendants)
```

- `config.runtime.on_cell_change = "autorun"`
- `Runner.compute_cells_to_run()` includes full transitive closure
- Immediate reactive propagation

### Lazy Mode

```
Cell A modified → compile → execute A → mark B, C as stale (not executed)
User must explicitly run stale cells
```

- `config.runtime.on_cell_change = "lazy"`
- `Runner.compute_cells_to_run()` only includes roots
- Descendants marked stale via `graph.set_stale()`
- `run_stale_cells()` catches up on demand

### Strict vs Relaxed Execution

| | Relaxed (Default) | Strict |
|---|-------------------|--------|
| Namespace | Single shared `globals` | Cloned per cell |
| Variable access | All variables visible | Only `refs` injected |
| Validation | Runtime NameError | Pre-check before exec |
| Protection | None | Deep copy of primitives |
| Output | Variables persist in globals | Only `defs` written back |

## 7.7 Complete Execution Flow

```
User clicks "Run Cell A"
    │
    ▼
1. Frontend → POST /api/kernel/run  OR  WebSocket command
    │
    ▼
2. Session.put_control_request(ExecuteCellCommand(cell_id="A", code="..."))
    │
    ▼
3. control_queue → Kernel.run([ExecuteCellCommand])
    │
    ▼
4. mutate_graph():
   ├─ compile_cell(code) → CellImpl (defs, refs, bytecode)
   ├─ graph.register_cell(cell_id, cell_impl)
   ├─ check_for_errors() → cycles? multi-def? missing refs?
   └─ return cells_to_run = {A} ∪ descendants(A)  [if autorun]
    │
    ▼
5. _run_cells(cells_to_run):
   ├─ Runner(roots, graph, glbls, mode)
   ├─ sorted = topological_sort(graph, cells_to_run)
   │
   ├─ for cell_id in sorted:
   │   ├─ pre_hooks(cell)
   │   ├─ executor.execute_cell(cell, glbls)
   │   │   ├─ exec(cell.body, glbls)      → side effects
   │   │   └─ eval(cell.last_expr, glbls) → return value
   │   ├─ post_hooks(cell, result)
   │   └─ stream.write(CellNotification)  → frontend
   │
   └─ if state_updates:
       └─ resolve → _run_cells(affected_cells)  [recursive]
    │
    ▼
6. stream → Session → WebSocket → Frontend renders output
```

## 7.8 Codaro Mapping Direction

| marimo | Codaro | Notes |
|--------|--------|-------|
| `Kernel` | `src/codaro/kernel/` | 이미 유사 커널 존재 |
| `DirectedGraph` | `src/codaro/document/` dependency analysis | AST 의존 분석 이미 존재 |
| `Runner` + topological sort | Codaro reactive runner | 핵심 수용 대상 |
| `DefaultExecutor` (relaxed) | 기본 모드 | Codaro 초기 구현 |
| `StrictExecutor` | 장기 목표 | 투명 스코프 격리의 완성 형태 |
| `State` reactive | 수용 | 상태 변경 → 의존 셀 재실행 |
| Autorun / Lazy mode | 설정 가능하게 | 두 모드 모두 지원 |
| `PyCF_ALLOW_TOP_LEVEL_AWAIT` | 필수 | async cell 지원 |
| Error propagation (cancel descendants) | 수용 | 에러 시 하위 셀 취소 |
