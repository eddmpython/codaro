# 05 — Session Manager & Kernel Lifecycle Contract (Source-Verified)

> Source: `marimo/_session/` (26 files), `marimo/_server/session_manager.py`

## 5.1 Session Architecture

### Per-Client Isolated Kernel Model

```
Browser Tab A → Session A → Kernel Process A
Browser Tab B → Session B → Kernel Process B (same file, different session)
```

### Core Classes (Complete)

| Class | Source | Line | Responsibility |
|-------|--------|------|---------------|
| `SessionManager` | `_server/session_manager.py` | — | 전체 세션 관리, 생성/삭제/조회 |
| `SessionImpl` | `_session/session.py` | L73 | 개별 세션 (커널 + 소비자 + 확장) |
| `Room` | `_session/room.py` | L24 | 멀티 소비자 브로드캐스트 |
| `SessionConsumer` | `_session/consumer.py` | L15 | WebSocket 클라이언트 인터페이스 |
| `SessionEventBus` | `_session/events.py` | L81 | 이벤트 발행/구독 |
| `SessionEventListener` | `_session/events.py` | L22 | 이벤트 수신 인터페이스 |
| `KernelManagerImpl` | `_session/managers/kernel.py` | L35 | 커널 프로세스/스레드 관리 |
| `QueueManagerImpl` | `_session/managers/queue.py` | L17 | IPC 큐 관리 |
| `AppFileManager` | `_session/notebook/file_manager.py` | L46 | 노트북 파일 I/O |
| `NotebookSerializer` | `_session/notebook/serializer.py` | L15 | 직렬화 프로토콜 |
| `SessionView` | `_session/state/session_view.py` | L130 | 세션 상태 스냅샷 (리플레이) |
| `ConnectionState` | `_session/model.py` | L7 | 연결 상태 enum |
| `SessionMode` | `_session/model.py` | L16 | EDIT/RUN 모드 enum |

## 5.2 SessionImpl (source: `_session/session.py` L73-431)

### Factory Method (L80-180)

```python
@classmethod
def create(cls, *,
    initialization_id: str,
    session_consumer: SessionConsumer,
    mode: SessionMode,
    app_metadata: AppMetadata,
    app_file_manager: AppFileManager,
    config_manager: MarimoConfigManager,
    virtual_files_supported: bool,
    redirect_console_to_browser: bool,
    auto_instantiate: bool,
    ttl_seconds: int,
    extensions: Optional[list] = None,
    sandbox_mode: Optional[SandboxMode] = None,
) -> Session
```

### Constructor Fields (L182-217)

```python
class SessionImpl(Session):
    initialization_id: str
    app_file_manager: AppFileManager
    room: Room
    _kernel_manager: KernelManager
    ttl_seconds: int
    session_view: SessionView
    config_manager: MarimoConfigManager
    extensions: list[SessionExtension]
    scratchpad_lock: asyncio.Lock
    _event_bus: SessionEventBus
    _closed: bool
```

### Key Methods

| Method | Line | Signature |
|--------|------|-----------|
| `consumers` | L260 | `@property -> Mapping[SessionConsumer, ConsumerId]` |
| `flush_messages` | L265 | `() -> None` |
| `rename_path` | L274 | `async (new_path: str) -> None` |
| `try_interrupt` | L280 | `() -> None` |
| `kernel_state` | L284 | `() -> KernelState` |
| `kernel_pid` | L292 | `() -> int | None` |
| `put_control_request` | L296 | `(request, from_consumer_id) -> None` |
| `put_input` | L304 | `(text: str) -> None` |
| `disconnect_consumer` | L308 | `(session_consumer) -> None` |
| `disconnect_main_consumer` | L318 | `() -> None` |
| `connect_consumer` | L325 | `(session_consumer, *, main: bool) -> None` |
| `get_current_state` | L343 | `() -> SessionView` |
| `connection_state` | L347 | `() -> ConnectionState` |
| `notify` | L355 | `(operation, from_consumer_id) -> None` |
| `close` | L368 | `() -> None` |
| `instantiate` | L385 | `(request, *, http_request) -> None` |

### EDIT vs RUN Mode

| | EDIT Mode | RUN Mode |
|---|-----------|----------|
| Kernel type | `multiprocessing.Process` | `threading.Thread` |
| IPC | `multiprocessing.Pipe` | `queue.Queue` |
| Memory overhead | ~150MB per session | Shared process |
| Interrupt | `os.kill(pid, SIGINT)` (Unix) / Queue (Windows) | Thread interrupt |
| Use case | Interactive editing | Read-only app serving |

## 5.3 Session Extensions (source: `_session/extensions/`)

### Extension Protocol (L11-29, `types.py`)

```python
class SessionExtension(Protocol):
    def on_attach(self, session: Session, event_bus: SessionEventBus) -> None
    def on_detach(self) -> None
```

### Built-in Extensions (source: `extensions.py` L1-430)

| Extension | Line | Listener? | Purpose |
|-----------|------|-----------|---------|
| `HeartbeatExtension` | L53 | No | Keep-alive ping, TTL 관리 |
| `CachingExtension` | L106 | Yes | 셀 출력 캐시 (EDIT=READ_WRITE, RUN=READ), `SESSION_CACHE_INTERVAL_SECONDS=2` |
| `NotificationListenerExtension` | L206 | No | 커널 알림 → 소비자 라우팅 |
| `LoggingExtension` | L246 | Yes | 세션 이벤트 로깅 |
| `SessionViewExtension` | L290 | Yes | SessionView 스냅샷 유지 (command/stdin/notification 추적) |
| `QueueExtension` | L331 | Yes | 커맨드/stdin → 커널 큐 전달 |
| `ReplayExtension` | L367 | Yes | 재접속 시 상태 리플레이 |

**CacheMode (L48-50):**
```python
class CacheMode(Enum):
    READ = "read"
    READ_WRITE = "read_write"
```

## 5.4 Room (Multi-Consumer Broadcast)

> Source: `_session/room.py` L24-84

```python
class Room:
    main_consumer: Optional[SessionConsumer]
    consumers: dict[SessionConsumer, ConsumerId]

    @property
    def size(self) -> int                                          # L35

    def add_consumer(self, consumer, *, consumer_id, main: bool)   # L39
    def remove_consumer(self, consumer)                             # L55
    def broadcast(self, notification: KernelMessage, *,
                  except_consumer: Optional[ConsumerId] = None)     # L67
    def close(self)                                                 # L80
```

## 5.5 Kernel Manager

> Source: `_session/managers/kernel.py` L35-249

```python
class KernelManagerImpl(KernelManager):
    kernel_task: ProcessLike          # Process or Thread
    queue_manager: QueueManager
    mode: SessionMode
    configs: dict
    app_metadata: AppMetadata
    config_manager: MarimoConfigManager
    redirect_console_to_browser: bool
    _read_conn: Optional[TypedConnection]
    _virtual_files_supported: bool
```

### Methods

| Method | Line | Description |
|--------|------|-------------|
| `start_kernel()` | L65 | Process for EDIT, Thread for RUN. Sets up IPC pipes/queues |
| `pid` | L162 | `@property -> Optional[int]` |
| `profile_path` | L171 | `@property -> Optional[str]` (profiling output path) |
| `is_alive()` | L192 | `-> bool` |
| `interrupt_kernel()` | L195 | Unix: `os.kill(pid, SIGINT)`, Windows: `win32_interrupt_queue.put(True)` |
| `close_kernel()` | L212 | Graceful shutdown with optional profiling |
| `kernel_connection` | L246 | `@property -> TypedConnection[KernelMessage]` (read socket for EDIT) |

## 5.6 Queue Manager

> Source: `_session/managers/queue.py` L17-114

```python
class QueueManagerImpl(QueueManager):
    # EDIT mode: multiprocessing.Queue
    # RUN mode: queue.Queue
    control_queue: QueueType
    set_ui_element_queue: QueueType
    completion_queue: QueueType
    win32_interrupt_queue: Optional[QueueType]  # Windows only
    input_queue: QueueType
    stream_queue: Optional[QueueType]           # RUN mode only
```

### Queue Architecture

```
Frontend → Server → control_queue → Kernel
                                      ↓
Kernel → stream (pipe/queue) → Server → WebSocket → Frontend
```

| Queue | Direction | Purpose |
|-------|-----------|---------|
| `control_queue` | Server → Kernel | Commands (execute, delete, config, cache, model) |
| `set_ui_element_queue` | Server → Kernel | Widget state updates |
| `completion_queue` | Kernel → Server | Code completion results |
| `input_queue` | Server → Kernel | stdin responses |
| `stream_queue` | Kernel → Server | Console output (RUN mode only) |
| `win32_interrupt_queue` | Server → Kernel | Windows interrupt signal |

### Methods

| Method | Line | Description |
|--------|------|-------------|
| `close_queues()` | L67 | Gracefully drain and close all queues |
| `put_control_request(request)` | L96 | Enqueue command to kernel |
| `put_input(text)` | L112 | Send stdin to kernel |

## 5.7 Event Bus

> Source: `_session/events.py` L81-201

```python
class SessionEventBus:
    _listeners: list[SessionEventListener]

    def subscribe(listener)                                     # L90
    def unsubscribe(listener)                                   # L94
    async def emit_session_created(session)                     # L99
    async def emit_session_closed(session)                      # L112
    async def emit_session_resumed(session, old_id: SessionId)  # L125
    async def emit_session_notebook_renamed(session, old_path)  # L140
    def emit_notification_sent(session, notification)           # L155
    def emit_received_command(session, request, from_consumer_id) # L170
    def emit_received_stdin(session, stdin: str)                # L190
```

### SessionEventListener (L22-79)

```python
class SessionEventListener:
    async def on_session_created(session) -> None
    async def on_session_closed(session) -> None
    async def on_session_resumed(session, old_id: SessionId) -> None
    async def on_session_notebook_renamed(session, old_path) -> None
    def on_notification_sent(session, notification: KernelMessage) -> None
    def on_received_command(session, request, from_consumer_id) -> None
    def on_received_stdin(session, stdin: str) -> None
```

## 5.8 SessionView (State Replay)

> Source: `_session/state/session_view.py` L130-665

### Fields (L144-194)

```python
class SessionView:
    cell_ids: list[CellId_t]
    cell_notifications: dict[CellId_t, CellNotification]
    datasets: dict[str, DataTable]
    data_connectors: list[DataSourceConnection]
    external_storage_namespaces: list[StorageNamespace]
    variable_notifications: list[VariableDeclarationNotification]
    variable_values: dict[str, VariableValue]
    ui_values: dict[str, JSONType]
    last_executed_code: dict[CellId_t, str]
    last_execution_time: dict[CellId_t, float]
    stale_code: dict[CellId_t, bool]
    model_states: dict[WidgetModelId, ModelReplayState]
    ui_element_messages: dict[UIElementId, dict]
    startup_logs: list[str]
    package_logs: dict[str, InstallingPackageAlertNotification]
    notified_server_packages: set[str]
    auto_export_state: AutoExportState
```

### ModelReplayState (L62-107)

```python
@dataclass
class ModelReplayState:
    model_id: WidgetModelId
    state: dict[str, Any]
    buffers: list[bytes]

    @staticmethod
    def from_open(model_id, msg: ModelOpen) -> ModelReplayState
    def apply_update(self, msg: ModelUpdate) -> None
    def to_notification(self) -> ModelLifecycleNotification
```

### AutoExportState (L110-127)

```python
@dataclass
class AutoExportState:
    html: bool = False
    md: bool = False
    ipynb: bool = False
    session: bool = False

    def mark_all_stale(self)
    def is_stale(self, export_type: str) -> bool
    def mark_exported(self, export_type: str)
```

### Notification Handling (L238-443)

`add_notification()` handles each type:
- `CellNotification` → merge per cell_id via `merge_cell_notification()`
- `VariablesNotification` → replace variable set
- `VariableValuesNotification` → update values, remove stale
- `InterruptedNotification` → ignored (transient)
- `DatasetsNotification` → deduplicate by table name, optional clear_channel
- `DataSourceConnectionsNotification` → replace connector list
- `StorageNamespacesNotification` → replace namespace list
- `SQLTablePreviewNotification` / `SQLTableListPreviewNotification` → ignored (transient)
- `UpdateCellIdsNotification` → reorder cell_ids
- `UpdateCellCodesNotification` → update stale_code tracking
- `UIElementMessageNotification` → store per element
- `ModelLifecycleNotification` → track open → update → close lifecycle
- `StartupLogsNotification` → append to startup_logs
- `InstallingPackageAlertNotification` → update per-package status

### Console Output Merge (L604-633)

```python
def _merge_consecutive_console_outputs(console: list[CellOutput]) -> list[CellOutput]:
    # Consecutive outputs with same channel+mimetype are merged
```

### Cell Notification Merge (L636-664)

```python
def merge_cell_notification(previous: CellNotification, current: CellNotification) -> CellNotification:
    # Merges: output (replace), console (append+merge), status (replace), stale_inputs (replace)
```

### Replay Protocol

재접속 시:
1. `KernelReadyNotification` 전송 (셀 코드, 설정, 레이아웃)
2. 각 셀의 `CellNotification` 리플레이 (출력, 상태)
3. `VariablesNotification` + `VariableValuesNotification` 리플레이
4. `ModelLifecycleNotification` 리플레이 (위젯 open 상태)
5. Dataset/connection/storage 알림 리플레이

## 5.9 Notebook File Management

> Source: `_session/notebook/file_manager.py` L46-607

### AppFileManager (L46-532)

```python
class AppFileManager:
    _filename: Optional[str | Path]
    storage: StorageInterface
    _defaults: Optional[dict]
    app: InternalApp
    _last_saved_content: Optional[str]
```

| Method | Line | Signature |
|--------|------|-----------|
| `filename` | L75 | `@property + setter` |
| `from_app(app)` | L85 | `@staticmethod -> AppFileManager` |
| `reload()` | L99 | `-> set[CellId_t]` (changed cells) |
| `rename(new_filename)` | L274 | `-> str` |
| `read_layout_config()` | L312 | `-> Optional[LayoutConfig]` |
| `read_css_file()` | L325 | `-> Optional[str]` |
| `read_html_head_file()` | L336 | `-> Optional[str]` |
| `path` | L347 | `@property -> Optional[str]` |
| `save_app_config(config)` | L358 | `-> str` |
| `save(request)` | L376 | `(SaveNotebookRequest) -> str` |
| `copy(request)` | L431 | `(CopyNotebookRequest) -> str` |
| `to_code()` | L470 | `-> str` |
| `is_notebook_named` | L488 | `@property -> bool` |
| `read_file()` | L497 | `-> str` |
| `file_content_matches_last_save()` | L513 | `-> bool` |

### Serialization Formats (source: `serializer.py` L15-153)

```python
class NotebookSerializer(Protocol):
    def serialize(notebook: NotebookSerializationV1) -> str
    def deserialize(content: str, filepath=None) -> NotebookSerializationV1
    def extract_header(path: Path) -> Optional[str]
```

| Format | Serializer | Extensions |
|--------|-----------|------------|
| Python (percent) | `PythonNotebookSerializer` | `.py` |
| Markdown | `MarkdownNotebookSerializer` | `.md`, `.qmd` |

```python
DEFAULT_NOTEBOOK_SERIALIZERS = {".py": ..., ".md": ..., ".qmd": ...}
```

## 5.10 Connection States

```python
class ConnectionState(Enum):    # model.py L7-13
    CONNECTING = 0    # WebSocket handshake in progress
    OPEN = 1          # Active connection
    CLOSED = 2        # Graceful disconnect
    ORPHANED = 3      # Disconnect, waiting for reconnect (TTL)

class SessionMode(str, Enum):   # model.py L16-22
    EDIT = "edit"     # Read-write, full editing
    RUN = "run"       # Read-only, app mode
```

## 5.11 Session Consumer

> Source: `_session/consumer.py` L15-31

```python
class SessionConsumer(ABC, SessionExtension):
    @property
    @abstractmethod
    def consumer_id(self) -> ConsumerId

    @abstractmethod
    def notify(self, notification: KernelMessage) -> None

    @abstractmethod
    def connection_state(self) -> ConnectionState
```

## 5.12 Session Lifecycle Flow

```
1. WebSocket connect
   → SessionConnector.connect()
   → SessionManager.create_session() or find existing
   → SessionImpl.create() factory
   → KernelManagerImpl.start_kernel()
   → Extensions attached (HeartbeatExtension, CachingExtension, etc.)
   → Session attached to Room
   → KernelReadyNotification sent

2. Normal operation
   → Frontend sends commands via HTTP POST or WS
   → QueueExtension routes to kernel queues
   → Kernel processes and sends notifications
   → NotificationListenerExtension broadcasts to Room
   → SessionViewExtension updates snapshot

3. Client disconnects
   → Consumer removed from Room
   → If no consumers left:
     → Session enters ORPHANED state
     → HeartbeatExtension starts TTL timer (default configurable)
     → If no reconnect → close_session()

4. Client reconnects
   → SessionConnector detects existing session by file_key
   → New consumer attached to Room
   → ReplayExtension replays SessionView to new consumer
   → KernelReadyNotification sent

5. Session close
   → KernelManagerImpl.close_kernel()
   → All extensions detached
   → All consumers notified
   → SessionEventBus.emit_session_closed()
   → Session removed from manager
```

## 5.13 Codaro Mapping Direction

| marimo | Codaro | Notes |
|--------|--------|-------|
| `SessionManager` | `src/codaro/kernel/` SessionManager | 이미 유사 구조 존재 |
| `SessionImpl` | Codaro Session | 커널 + 소비자 래퍼 |
| EDIT=Process, RUN=Thread | `src/codaro/runtime/` LocalEngine | Codaro는 엔진 추상화 사용 |
| `Room` 멀티소비자 | 필요 | 같은 노트북 여러 탭 지원 |
| `SessionView` 리플레이 | 필요 | 재접속 시 상태 복원 |
| `AppFileManager` | `src/codaro/document/` | 이미 파서/직렬화 존재 |
| `SessionEventBus` 7이벤트 | 이벤트 버스 도입 | 확장성을 위해 권장 |
| 7 Extensions | 선택적 도입 | Heartbeat, Caching, Notification, SessionView 우선 |
| `QueueManagerImpl` 6큐 | IPC 큐 설계 | control/ui_element/completion/input/stream/win32 |
| `NotebookSerializer` protocol | `src/codaro/document/` | percent/markdown/ipynb 이미 존재 |
| `ConnectionState` 4상태 | 동일 적용 | CONNECTING, OPEN, CLOSED, ORPHANED |
