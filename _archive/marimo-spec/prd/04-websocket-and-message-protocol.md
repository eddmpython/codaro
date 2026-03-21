# 04 — WebSocket & Message Protocol Contract (Source-Verified)

> Source: `marimo/_server/api/endpoints/ws/` (6 files), `marimo/_messaging/` (17 files)

## 4.1 WebSocket Endpoints

### Main Session WebSocket (`/ws`)

> Source: `ws_endpoint.py` L68-95

**Connection:**
```
ws://host:port/ws?session_id=<uuid>&file=<file_key>[&kiosk=true][&auto_instantiate=true][&rtc_enabled=true]
```

**Query Parameters (source: `ws_connection_validator.py` L19-32):**

| Param | Key Constant | Required | Type | Description |
|-------|-------------|----------|------|-------------|
| `session_id` | `SESSION_QUERY_PARAM_KEY` | Yes | `SessionId` | UUID identifying the client session |
| `file` | `FILE_QUERY_PARAM_KEY` | Yes | `MarimoFileKey` | File key or path of the notebook |
| `kiosk` | `KIOSK_QUERY_PARAM_KEY` | No | `bool` | Read-only kiosk mode |
| `auto_instantiate` | — | No | `bool` | Auto-execute on connect |
| `rtc_enabled` | — | No | `bool` | Enable real-time collaboration |

**ConnectionParams dataclass (L24-32):**
```python
@dataclass
class ConnectionParams:
    session_id: SessionId
    file_key: MarimoFileKey
    kiosk: bool
    auto_instantiate: bool
    rtc_enabled: bool
```

**Authentication (L42-53):**
- Cookie (from login)
- Query param `access_token=<token>`
- Basic auth header `Authorization: Basic <base64(user:token)>`

**Connection Flow:**
1. `WebSocketConnectionValidator.validate_auth()` → auth check
2. `WebSocketConnectionValidator.extract_connection_params()` → parse query
3. `SessionConnector.connect()` → find or create session
4. `ws_kernel_ready.build_kernel_ready()` → send initial state
5. `WebSocketMessageLoop.start()` → bidirectional message loop

### Connection Types (source: `ws_session_connector.py` L29-36)

```python
class ConnectionType(Enum):
    KIOSK = "kiosk"           # Read-only viewer
    RECONNECT = "reconnect"   # Same consumer reconnecting
    RTC_EXISTING = "rtc"      # RTC join existing session
    RESUME = "resume"         # Resume orphaned session
    NEW = "new"               # Brand new session
```

### WebSocketHandler (source: `ws_endpoint.py` L144-544)

```python
class WebSocketHandler(SessionConsumer):
    websocket: WebSocket
    manager: SessionManager
    params: ConnectionParams
    mode: SessionMode
    status: ConnectionState
    cancel_close_handle: Optional[asyncio.TimerHandle]
    message_queue: asyncio.Queue[KernelMessage]
    ws_future: Optional[asyncio.Task[None]]
    _consumer_id: ConsumerId
```

Key methods:
- `start()` L375-429 — Main entry, validates connection, starts message loop
- `_reconnect_session()` L243-278 — Replay session state on reconnect
- `_connect_kiosk()` L280-298 — Kiosk mode connection
- `_on_disconnect()` L311-373 — Handles disconnection with TTL
- `on_attach(session, event_bus)` L469-472
- `on_detach()` L474-488

### WebSocketMessageLoop (source: `ws_message_loop.py` L34-163)

```python
class WebSocketMessageLoop:
    websocket: WebSocket
    message_queue: asyncio.Queue[KernelMessage]
    kiosk: bool
    on_disconnect: Callable
    on_check_status_update: Callable
```

**Kiosk Filtering (L24-31):**
```python
KIOSK_ONLY_OPERATIONS = {FocusCellNotification.name}
KIOSK_EXCLUDED_OPERATIONS = {CompletionResultNotification.name}
```

### RTC Sync WebSocket (`/ws_sync`)

> Source: `ws_endpoint.py` L100-141, `ws_rtc_handler.py` L21-141

```
ws://host:port/ws_sync?file=<file_key>
```

- Loro CRDT document synchronization
- Binary protocol for efficient delta sync
- Requires Python 3.11+ (`LORO_ALLOWED = sys.version_info >= (3, 11)`)
- `RTCWebSocketHandler`: `_send_initial_sync()`, `_send_updates_to_client()`, `_receive_updates_from_client()`

### Terminal WebSocket (`/terminal/ws`)

> Source: `terminal.py` L340

- Interactive terminal session
- Text frames for I/O
- JSON resize: `{"type": "resize", "cols": int, "rows": int}`
- Edit-level auth required

## 4.2 Wire Format

> Source: `ws_formatter.py` L18-50

```python
def format_wire_message(op: str, data: bytes) -> str:
    # Returns: '{"op": "...", "data": ...}'

def serialize_notification_for_websocket(notification: NotificationMessage) -> str:
    # msgspec.json.encode() → format_wire_message()
```

All messages are JSON with tagged union pattern:
```json
{"op": "<operation_name>", "data": { ... }}
```

Serialization: `msgspec.json.encode()` / `msgspec.json.decode()`
Base: `msgspec.Struct` with `tag_field="op"`

## 4.3 Server → Frontend Notifications (49 Types, Source-Verified)

> Source: `marimo/_messaging/notification.py` L1-838

### Base

```python
class Notification(msgspec.Struct, tag_field="op"):
    name: ClassVar[str]  # Wire operation name
```

### Cell Operations

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 1 | `cell-op` | `CellNotification` | `cell_id: CellId_t`, `output: Optional[CellOutput]`, `console: Optional[Union[CellOutput, list[CellOutput]]]`, `status: Optional[RuntimeStateType]`, `stale_inputs: Optional[bool]`, `run_id: Optional[RunId_t]`, `serialization: Optional[str]`, `timestamp: float` | L55 |
| 2 | `completed-run` | `CompletedRunNotification` | (empty) | L234 |
| 3 | `interrupted` | `InterruptedNotification` | (empty) | L228 |

### Function Call

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 4 | `function-call-result` | `FunctionCallResultNotification` | `function_call_id: RequestId`, `return_value: JSONType`, `status: HumanReadableStatus` | L116 |

**HumanReadableStatus (L102-113):**
```
code: Literal["ok", "error"]
title: Union[str, None] = None
message: Union[str, None] = None
```

### UI Elements

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 5 | `remove-ui-elements` | `RemoveUIElementsNotification` | `cell_id: CellId_t` | L132 |
| 6 | `send-ui-element-message` | `UIElementMessageNotification` | `ui_element: UIElementId`, `message: dict[str, Any]`, `buffers: Optional[list[bytes]]` | L145 |

### Widget Model Lifecycle

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 7 | `model-lifecycle` | `ModelLifecycleNotification` | `model_id: WidgetModelId`, `message: ModelMessage` | L194 |

**ModelMessage Union (L162-191):**
```
ModelOpen:   state: dict, buffer_paths: list, buffers: list[bytes]
ModelUpdate: state: dict, buffer_paths: list, buffers: list[bytes]
ModelCustom: content: Any, buffers: list[bytes]
ModelClose:  (empty)
```

### Kernel Lifecycle

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 8 | `kernel-ready` | `KernelReadyNotification` | `cell_ids: tuple[CellId_t, ...]`, `codes: tuple[str, ...]`, `names: tuple[str, ...]`, `layout: Optional[LayoutConfig]`, `configs: tuple[CellConfig, ...]`, `resumed: bool`, `ui_values: Optional[dict[str, JSONType]]`, `last_executed_code: Optional[dict[CellId_t, str]]`, `last_execution_time: Optional[dict[CellId_t, float]]`, `app_config: _AppConfig`, `kiosk: bool`, `capabilities: KernelCapabilitiesNotification`, `auto_instantiated: bool = False` | L267 |
| 9 | `reconnected` | `ReconnectedNotification` | (empty) | L374 |
| 10 | `reload` | `ReloadNotification` | (empty) | L421 |
| 11 | `kernel-startup-error` | `KernelStartupErrorNotification` | `error: str` | L410 |

**KernelCapabilitiesNotification (L240-264):**
```
terminal: bool = False
pylsp: bool = False
ty: bool = False
basedpyright: bool = False
pyrefly: bool = False
```

### Code Completion

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 12 | `completion-result` | `CompletionResultNotification` | `completion_id: str`, `prefix_length: int`, `options: list[CompletionOption]` | L302 |

**CompletionOption (L11-21, `completion_option.py`):**
```
name: str
type: str
completion_info: Optional[str]
```

### Alerts & Packages

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 13 | `alert` | `AlertNotification` | `title: str`, `description: str`, `variant: Optional[Literal["danger"]]` | L317 |
| 14 | `missing-package-alert` | `MissingPackageAlertNotification` | `packages: list[str]`, `isolated: bool`, `source: Literal["kernel", "server"] = "kernel"` | L332 |
| 15 | `installing-package-alert` | `InstallingPackageAlertNotification` | `packages: PackageStatusType`, `logs: Optional[dict[str, str]]`, `log_status: Optional[Literal["append", "start", "done"]]` | L357 |
| 16 | `banner` | `BannerNotification` | `title: str`, `description: str`, `variant: Optional[Literal["danger"]]`, `action: Optional[Literal["restart"]]` | L393 |
| 17 | `startup-logs` | `StartupLogsNotification` | `content: str`, `status: Literal["append", "start", "done"]` | L380 |

**PackageStatusType:** `dict[str, Literal["queued", "installing", "installed", "failed"]]`

### Variables

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 18 | `variables` | `VariablesNotification` | `variables: list[VariableDeclarationNotification]` | L455 |
| 19 | `variable-values` | `VariableValuesNotification` | `variables: list[VariableValue]` | L466 |

**VariableDeclarationNotification (L427-438):**
```
name: str
declared_by: list[CellId_t]
used_by: list[CellId_t]
```

**VariableValue (L441-452, extends BaseStruct):**
```
name: str
value: Optional[str]
datatype: Optional[str]
```

### Data & SQL

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 20 | `datasets` | `DatasetsNotification` | `tables: list[DataTable]`, `clear_channel: Optional[DataTableSource]` | L477 |
| 21 | `sql-table-preview` | `SQLTablePreviewNotification` | `request_id: RequestId`, `metadata: SQLMetadata`, `table: Optional[DataTable]`, `error: Optional[str]` | L504 |
| 22 | `sql-table-list-preview` | `SQLTableListPreviewNotification` | `request_id: RequestId`, `metadata: SQLMetadata`, `tables: list[DataTable]`, `error: Optional[str]` | L521 |
| 23 | `data-column-preview` | `DataColumnPreviewNotification` | `table_name: str`, `column_name: str`, `chart_spec: Optional[str]`, `chart_code: Optional[str]`, `error: Optional[str]`, `missing_packages: Optional[list[str]]`, `stats: Optional[ColumnStats]` | L558 |
| 24 | `data-source-connections` | `DataSourceConnectionsNotification` | `connections: list[DataSourceConnection]` | L575 |
| 25 | `validate-sql-result` | `ValidateSQLResultNotification` | `request_id: RequestId`, `parse_result: Optional[SqlParseResult]`, `validate_result: Optional[SqlCatalogCheckResult]`, `error: Optional[str]` | L642 |

**SQLMetadata (L490-501):**
```
connection: str
database: str
schema: str
```

### Storage

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 26 | `storage-namespaces` | `StorageNamespacesNotification` | `namespaces: list[StorageNamespace]` | L588 |
| 27 | `storage-entries` | `StorageEntriesNotification` | `request_id: RequestId`, `entries: list[StorageEntry]`, `namespace: str`, `prefix: Optional[str]`, `query: Optional[str]`, `error: Optional[str]` | L599 |
| 28 | `storage-download-ready` | `StorageDownloadReadyNotification` | `request_id: RequestId`, `url: Optional[str]`, `filename: Optional[str]`, `error: Optional[str]` | L620 |

### Query Params

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 29 | `query-params-set` | `QueryParamsSetNotification` | `key: str`, `value: Union[str, list[str]]` | L659 |
| 30 | `query-params-append` | `QueryParamsAppendNotification` | `key: str`, `value: str` | L672 |
| 31 | `query-params-delete` | `QueryParamsDeleteNotification` | `key: str`, `value: Optional[str]` | L685 |
| 32 | `query-params-clear` | `QueryParamsClearNotification` | (empty) | L698 |

### Focus & Code Updates

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 33 | `focus-cell` | `FocusCellNotification` | `cell_id: CellId_t` | L704 |
| 34 | `update-cell-codes` | `UpdateCellCodesNotification` | `cell_ids: list[CellId_t]`, `codes: list[str]`, `code_is_stale: bool`, `names: list[str] = []`, `configs: list[CellConfig] = []` | L715 |
| 35 | `update-cell-ids` | `UpdateCellIdsNotification` | `cell_ids: list[CellId_t]` | L777 |

### Secrets

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 36 | `secret-keys-result` | `SecretKeysResultNotification` | `request_id: RequestId`, `secrets: list[SecretKeysWithProvider]` | L734 |

### Cache

| # | op | Class | Fields | Line |
|---|-----|-------|--------|------|
| 37 | `cache-cleared` | `CacheClearedNotification` | `bytes_freed: int` | L747 |
| 38 | `cache-info` | `CacheInfoNotification` | `hits: int`, `misses: int`, `time: float`, `disk_to_free: int`, `disk_total: int` | L758 |

### NotificationMessage Union (L788-838)

총 37개 타입의 Union:
```python
NotificationMessage = Union[
    CellNotification,
    FunctionCallResultNotification,
    RemoveUIElementsNotification,
    UIElementMessageNotification,
    ModelLifecycleNotification,
    InterruptedNotification,
    CompletedRunNotification,
    KernelReadyNotification,
    CompletionResultNotification,
    AlertNotification,
    MissingPackageAlertNotification,
    InstallingPackageAlertNotification,
    ReconnectedNotification,
    StartupLogsNotification,
    BannerNotification,
    KernelStartupErrorNotification,
    ReloadNotification,
    VariablesNotification,
    VariableValuesNotification,
    DatasetsNotification,
    SQLTablePreviewNotification,
    SQLTableListPreviewNotification,
    DataColumnPreviewNotification,
    DataSourceConnectionsNotification,
    StorageNamespacesNotification,
    StorageEntriesNotification,
    StorageDownloadReadyNotification,
    ValidateSQLResultNotification,
    QueryParamsSetNotification,
    QueryParamsAppendNotification,
    QueryParamsDeleteNotification,
    QueryParamsClearNotification,
    FocusCellNotification,
    UpdateCellCodesNotification,
    UpdateCellIdsNotification,
    SecretKeysResultNotification,
    CacheClearedNotification,
    CacheInfoNotification,
]
```

## 4.4 CellOutput Structure

> Source: `marimo/_messaging/cell_output.py` L1-88

```python
class CellOutput(msgspec.Struct):
    channel: CellChannel
    mimetype: KnownMimeType
    data: Union[str, list[Error], dict[str, Any]]
    timestamp: float
```

### CellChannel Enum (L17-29)

| Value | Description |
|-------|-------------|
| `STDOUT` | Standard output capture |
| `STDERR` | Standard error capture |
| `STDIN` | Input prompt |
| `PDB` | Debugger interaction |
| `OUTPUT` | Cell return value |
| `MARIMO_ERROR` | marimo-specific errors (cycles, multi-def, etc.) |
| `MEDIA` | Media output (images, etc.) |

### KnownMimeType (source: `mimetypes.py` L13-38, 22 types)

```
text/plain, text/html, text/markdown, text/css, text/csv,
application/json, application/javascript,
image/png, image/tiff, image/bmp, image/gif, image/jpeg, image/svg+xml, image/webp,
video/mp4, video/mpeg,
audio/mpeg, audio/wav,
application/vnd.marimo+error,
application/vnd.marimo+traceback,
application/vnd.marimo+mimebundle,
application/vnd.marimo+ui
```

### ConsoleMimeType (L40-45)

```
application/vnd.marimo+traceback, text/plain, text/password, image/png
```

### Static Constructors (L46-87)

```python
CellOutput.stdout(data, mimetype="text/plain")
CellOutput.stderr(data, mimetype="text/plain")
CellOutput.stdin(data, password=False)
CellOutput.empty()
CellOutput.errors(data: list[Error])
```

## 4.5 Error Types

> Source: `marimo/_messaging/errors.py` L1-180

| # | Tag | Class | Fields |
|---|-----|-------|--------|
| 1 | `setup-refs` | `SetupRootError` | `edges_with_vars: tuple[EdgeWithVar, ...]` |
| 2 | `cycle` | `CycleError` | `edges_with_vars: tuple[EdgeWithVar, ...]` |
| 3 | `multiple-defs` | `MultipleDefinitionError` | `name: str`, `cells: tuple[CellId_t, ...]` |
| 4 | `import-star` | `ImportStarError` | `msg: str`, `lineno: Optional[int]` |
| 5 | `interruption` | `MarimoInterruptionError` | (empty) |
| 6 | `ancestor-prevented` | `MarimoAncestorPreventedError` | `msg: str`, `raising_cell: CellId_t`, `blamed_cell: Optional[CellId_t]` |
| 7 | `ancestor-stopped` | `MarimoAncestorStoppedError` | `msg: str`, `raising_cell: CellId_t` |
| 8 | `exception` | `MarimoExceptionRaisedError` | `msg: str`, `exception_type: str`, `raising_cell: Optional[CellId_t]` |
| 9 | `syntax` | `MarimoSyntaxError` | `msg: str`, `lineno: Optional[int]` |
| 10 | `unknown` | `UnknownError` | `msg: str`, `error_type: Optional[str]` |
| 11 | `strict-exception` | `MarimoStrictExecutionError` | `msg: str`, `ref: str`, `blamed_cell: Optional[CellId_t]` |
| 12 | `internal` | `MarimoInternalError` | `error_id: str`, `msg: str = ""` |
| 13 | `sql-error` | `MarimoSQLError` | `msg: str`, `sql_statement: str`, `hint: Optional[str]`, `sql_line: Optional[int]`, `sql_col: Optional[int]`, `node_lineno: int`, `node_col_offset: int` |

## 4.6 Frontend → Server Commands

> Source: `marimo/_runtime/commands.py` (command types from control queue)

| Command | Description | Queue |
|---------|-------------|-------|
| `ExecuteCellsCommand` | Run cells | control_queue |
| `DeleteCellCommand` | Remove a cell | control_queue |
| `UpdateCellConfigCommand` | Change cell metadata | control_queue |
| `UpdateUIElementCommand` | Widget state change | set_ui_element_queue |
| `CompletionCommand` | Request code completion | completion_queue |
| `FocusCellCommand` | Navigate to cell | control_queue |
| `InterruptCommand` | Stop execution | interrupt signal |
| `StdinCommand` | Input response | input_queue |
| `InstallPackagesCommand` | Install missing packages | control_queue |
| `ClearCacheCommand` | Clear cell cache | control_queue |
| `GetCacheInfoCommand` | Get cache stats | control_queue |
| `ModelCommand` | Widget model update | control_queue |
| `DebugCellCommand` | Post-mortem debug | control_queue |

## 4.7 Stream Architecture

> Source: `marimo/_messaging/streams.py` L1-457

### ThreadSafeStream (L87-145)

```python
class ThreadSafeStream(Stream):
    pipe: PipeProtocol              # IPC to session
    cell_id: Optional[CellId_t]
    redirect_console: bool
    stream_lock: Lock               # Thread safety
    console_msg_cv: Condition       # Console output batching
    console_msg_queue: deque        # Buffered console output
    buffered_console_thread: Thread # Batches console writes
    input_queue: Queue              # stdin messages
```

### ThreadSafeStdout / ThreadSafeStderr (L227-375)

```python
class ThreadSafeStdout(Stdout):
    # Wraps ThreadSafeStream
    # Captures sys.stdout writes and forwards to session
    # Supports fileno() for OS-level stream forwarding

class ThreadSafeStderr(Stderr):
    # Same pattern as ThreadSafeStdout
```

### ThreadSafeStdin (L378-445)

```python
class ThreadSafeStdin(Stdin):
    # readline(size) → reads from input_queue
    # _readline_with_prompt(prompt, password) → sends stdin CellOutput
```

### Output Limits (L56-71)

| Limit | Default | Config Key |
|-------|---------|-----------|
| Cell output max bytes | 5,000,000 (5MB) | `runtime.output_max_bytes` |
| Console stream max bytes | 1,000,000 (1MB) | `runtime.std_stream_max_bytes` |

### Console Output Worker (source: `console_output_worker.py` L1-133)

```python
TIMEOUT_S = 0.01  # 10ms batch interval

@dataclass
class ConsoleMsg:
    stream: StreamT
    cell_id: CellId_t
    data: str
    mimetype: ConsoleMimeType
```

Consecutive console outputs with same stream/cell/mimetype are merged.

### Traceback Formatting (source: `tracebacks.py` L1-57)

```python
def write_traceback(traceback: str) -> None:
    # 1. _trim_traceback() — remove internal executor.py frames
    # 2. _highlight_traceback() — Pygments PythonTracebackLexer → HTML
    # 3. Mimetype: "application/vnd.marimo+traceback"
```

## 4.8 Variable Preview Protocol

> Source: `marimo/_messaging/variables.py` L1-247

```python
def get_variable_preview(obj, max_items=5, max_str_len=50, max_bytes=32, _depth=0, _seen=None) -> str:
    # Handles: circular refs (id-based _seen set), recursion depth (max 5)
    # Sequences: first/last items with "..." ellipsis
    # Dicts: key: value pairs
    # Special: DataFrames → "DataFrame(rows×cols)", UIElements, Html, ModuleType
    # Fallback: str(obj)[:max_str_len]

def create_variable_value(name: str, value: object, datatype: str | None = None) -> VariableValue:
    # datatype defaults to type(value).__name__
    # value = _format_variable_value(value) → _stringify_variable_value()
```

## 4.9 Serialization Context

> Source: `marimo/_messaging/context.py` L1-55

```python
RunId_t = str
RUN_ID_CTX = ContextVar[Optional[RunId_t]]("run_id")
HTTP_REQUEST_CTX = ContextVar[Optional[HTTPRequest]]("http_request")

class run_id_context:  # generates uuid4 per execution batch
class http_request_context:  # tracks originating HTTP request
```

## 4.10 Message Serde

> Source: `marimo/_messaging/serde.py` L1-43

```python
def serialize_kernel_message(message: NotificationMessage) -> KernelMessage:
    # msgspec.json.encode(message) → bytes

def deserialize_kernel_message(message: KernelMessage) -> NotificationMessage:
    # msgspec.json.decode(message, type=NotificationMessage)

def deserialize_kernel_notification_name(message: KernelMessage) -> str:
    # Fast: decode only {"op": "..."} without full deserialization
```

## 4.11 KernelReady Build Process

> Source: `ws_kernel_ready.py` L30-183

```python
def build_kernel_ready(
    session, manager, resumed, ui_values,
    last_executed_code, last_execution_time,
    kiosk, rtc_enabled, file_key, mode,
    doc_manager, auto_instantiated=False
) -> KernelReadyNotification:
    # 1. _extract_cell_data(session, manager) → (codes, names, configs, cell_ids)
    # 2. is_rtc_available() — checks Python 3.11+ and loro package
    # 3. _should_init_rtc(rtc_enabled, mode) — only in EDIT mode
    # 4. _try_init_rtc_doc(cell_ids, codes, file_key, doc_manager)
    # 5. Build KernelReadyNotification with all fields
```

## 4.12 Codaro Mapping Direction

| marimo | Codaro | Notes |
|--------|--------|-------|
| `/ws` main WebSocket | `src/codaro/kernel/` | 이미 WebSocket 세션 존재 |
| `msgspec.Struct` serialization | Pydantic 또는 msgspec | Codaro는 현재 Pydantic 사용 |
| `CellOutput` 7 channels | Codaro output model | 동일 구조 수용 |
| 38 Notification types | Codaro notification | 핵심 10개 우선 (cell-op, kernel-ready, variables, variable-values, completed-run, interrupted, alert, missing-package, focus-cell, reload) |
| 13 Error types | Codaro error model | 핵심 7개 우선 (cycle, multiple-defs, syntax, exception, interruption, ancestor-prevented, unknown) |
| `KernelReadyNotification` | Codaro init message | 접속 시 전체 상태 전송 |
| Console output limits 5MB/1MB | 동일 적용 | |
| Console batch 10ms | 동일 적용 | |
| RTC `/ws_sync` (Loro CRDT) | 후순위 | 초기에는 단일 사용자 |
| Terminal `/terminal/ws` | 후순위 | |
