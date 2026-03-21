# 03 — HTTP API Endpoint Catalog (Source-Verified)

> Source: `marimo/_server/api/endpoints/*.py` (20 endpoint files), `marimo/_server/models/*.py` (8 model files)
> Serialization: All `msgspec.Struct` models use `rename="camel"` — Python `snake_case` fields serialize as `camelCase` in JSON.

## 3.1 Execution Kernel (`execution.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/set_ui_element_value` | none | `UpdateUIElementValuesRequest` | `SuccessResponse` | L47 |
| POST | `/set_model_value` | none | `ModelRequest` | `SuccessResponse` | L87 |
| POST | `/instantiate` | edit | `InstantiateNotebookRequest` | `SuccessResponse` | L115 |
| POST | `/function_call` | none | `InvokeFunctionRequest` | `SuccessResponse` | L152 |
| POST | `/interrupt` | edit | (empty) | `SuccessResponse` | L180 |
| POST | `/run` | edit | `ExecuteCellsRequest` | `SuccessResponse` | L207 |
| POST | `/execute` | edit | `ExecuteScratchpadRequest` | `StreamingResponse` (SSE) | L244 |
| POST | `/scratchpad/run` | edit | `ExecuteScratchpadRequest` | `SuccessResponse` | L306 |
| POST | `/pdb/pm` | edit | `DebugCellRequest` | `SuccessResponse` | L335 |
| POST | `/restart_session` | edit | (empty) | `SuccessResponse` | L364 |
| POST | `/shutdown` | edit | (empty) | `SuccessResponse` | L408 |
| POST | `/takeover` | edit | (empty) | `JSONResponse` | L459 |

### Request Models (Verified Fields)

```
UpdateUIElementValuesRequest:
  - object_ids: list[UIElementId]
  - values: list[Any]

InstantiateNotebookRequest (extends UpdateUIElementValuesRequest):
  - object_ids: list[UIElementId]
  - values: list[Any]
  - auto_run: bool = True
  - codes: Optional[dict[CellId_t, str]] = None

InvokeFunctionRequest:
  - function_call_id: RequestId
  - namespace: str
  - function_name: str
  - args: dict[str, Any]

ExecuteCellsRequest:
  - cell_ids: list[CellId_t]
  - codes: list[str]
  - request: Optional[HTTPRequest] = None

ExecuteScratchpadRequest:
  - code: str
  - request: Optional[HTTPRequest] = None

DebugCellRequest:
  - cell_id: CellId_t
  - request: Optional[HTTPRequest] = None

ModelRequest (inherits ModelCommand):
  - model_id: WidgetModelId
  - message: ModelMessage
  - buffers: list[bytes]
  - token: str
```

## 3.2 Cell Editing (`editing.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/code_autocomplete` | edit | `CodeCompletionRequest` | `SuccessResponse` | L40 |
| POST | `/delete` | edit | `DeleteCellRequest` | `SuccessResponse` | L66 |
| POST | `/sync/cell_ids` | edit | `UpdateCellIdsRequest` | `SuccessResponse` | L92 |
| POST | `/format` | edit | `FormatCellsRequest` | `FormatResponse` | L125 |
| POST | `/set_cell_config` | edit | `UpdateCellConfigRequest` | `SuccessResponse` | L175 |
| POST | `/stdin` | edit | `StdinRequest` | `SuccessResponse` | L201 |
| POST | `/install_missing_packages` | edit | `InstallPackagesRequest` | `SuccessResponse` | L231 |

### Request Models (Verified Fields)

```
CodeCompletionRequest:
  - id: RequestId
  - document: str
  - cell_id: CellId_t

DeleteCellRequest:
  - cell_id: CellId_t

UpdateCellIdsRequest:
  - cell_ids: list[CellId_t]

FormatCellsRequest:
  - codes: dict[CellId_t, str]
  - line_length: int

FormatResponse:
  - codes: dict[CellId_t, str]

UpdateCellConfigRequest:
  - configs: dict[CellId_t, dict[str, Any]]

StdinRequest:
  - text: str

InstallPackagesRequest:
  - manager: str
  - versions: dict[str, str]
  - source: Literal["kernel", "server"] = "kernel"
```

## 3.3 File Operations (`files.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/read_code` | read | (empty) | `ReadCodeResponse` | L38 |
| POST | `/rename` | edit | `RenameNotebookRequest` | `SuccessResponse` | L85 |
| POST | `/save` | edit | `SaveNotebookRequest` | `PlainTextResponse` | L134 |
| POST | `/copy` | edit | `CopyNotebookRequest` | `PlainTextResponse` | L175 |
| POST | `/save_app_config` | edit | `SaveAppConfigurationRequest` | `PlainTextResponse` | L218 |

### Request Models (Verified Fields)

```
ReadCodeResponse:
  - contents: str

RenameNotebookRequest:
  - filename: str

SaveNotebookRequest:
  - cell_ids: list[CellId_t]
  - codes: list[str]
  - names: list[str]
  - configs: list[CellConfig]
  - filename: str
  - layout: Optional[dict[str, Any]] = None
  - persist: bool = True

CopyNotebookRequest:
  - source: str
  - destination: str

SaveAppConfigurationRequest:
  - config: dict[str, Any]
```

## 3.4 Configuration (`config.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/save_user_config` | edit | `SaveUserConfigurationRequest` | `SuccessResponse` | L37 |

```
SaveUserConfigurationRequest:
  - config: dict[str, Any]
```

## 3.5 File Explorer (`file_explorer.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/list_files` | edit | `FileListRequest` | `FileListResponse` | L48 |
| POST | `/file_details` | edit | `FileDetailsRequest` | `FileDetailsResponse` | L77 |
| POST | `/create` | edit | `FileCreateRequest` | `FileCreateResponse` | L103 |
| POST | `/delete` | edit | `FileDeleteRequest` | `FileDeleteResponse` | L140 |
| POST | `/move` | edit | `FileMoveRequest` | `FileMoveResponse` | L170 |
| POST | `/update` | edit | `FileUpdateRequest` | `FileUpdateResponse` | L200 |
| POST | `/open` | edit | `FileOpenRequest` | `SuccessResponse` | L236 |
| POST | `/search` | edit | `FileSearchRequest` | `FileSearchResponse` | L266 |

### Request/Response Models (Verified Fields)

```
FileInfo:
  - id: str
  - path: str
  - name: str
  - is_directory: bool
  - is_marimo_file: bool
  - last_modified: Optional[float] = None
  - children: list[FileInfo] = []
  - opengraph: OpenGraphMetadata | None = None

FileListRequest:
  - path: Optional[str] = None

FileListResponse:
  - files: list[FileInfo]
  - root: str

FileDetailsRequest:
  - path: str

FileDetailsResponse:
  - file: FileInfo
  - contents: Optional[str] = None
  - mime_type: Optional[str] = None

FileCreateRequest:
  - path: str
  - type: Literal["file", "directory", "notebook"]
  - name: str
  - contents: Optional[str] = None

FileCreateResponse:
  - success: bool
  - message: Optional[str] = None
  - info: Optional[FileInfo] = None

FileDeleteRequest:
  - path: str

FileDeleteResponse:
  - success: bool
  - message: Optional[str] = None

FileMoveRequest:
  - path: str
  - new_path: str

FileMoveResponse:
  - success: bool
  - message: Optional[str] = None
  - info: Optional[FileInfo] = None

FileUpdateRequest:
  - path: str
  - contents: str

FileUpdateResponse:
  - success: bool
  - message: Optional[str] = None
  - info: Optional[FileInfo] = None

FileOpenRequest:
  - path: str
  - line_number: Optional[int] = None

FileSearchRequest:
  - query: str
  - path: Optional[str] = None
  - include_directories: bool = True
  - include_files: bool = True
  - depth: int = 3
  - limit: int = 100

FileSearchResponse:
  - files: list[FileInfo]
  - query: str
  - total_found: int
```

## 3.6 Package Management (`packages.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/add` | edit | `AddPackageRequest` | `PackageOperationResponse` | L31 |
| POST | `/remove` | edit | `RemovePackageRequest` | `PackageOperationResponse` | L82 |
| GET | `/list` | edit | (empty) | `ListPackagesResponse` | L131 |
| GET | `/tree` | edit | (empty) | `DependencyTreeResponse` | L153 |

```
AddPackageRequest:
  - package: str
  - upgrade: Optional[bool] = False
  - group: Optional[str] = None

RemovePackageRequest:
  - package: str
  - group: Optional[str] = None

PackageOperationResponse:
  - success: bool
  - error: Optional[str] = None

ListPackagesResponse:
  - packages: list[PackageDescription]

DependencyTreeResponse:
  - tree: Optional[DependencyTreeNode]
```

## 3.7 AI/Completion (`ai.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/completion` | edit | `AiCompletionRequest` | `StreamingResponse` | L110 |
| POST | `/chat` | edit | `ChatRequest` | `StreamingResponse` | L193 |
| POST | `/inline_completion` | edit | `AiInlineCompletionRequest` | `PlainTextResponse` | L256 |
| POST | `/invoke_tool` | edit | `InvokeAiToolRequest` | `InvokeAiToolResponse` | L330 |
| GET | `/mcp/status` | edit | (empty) | `MCPStatusResponse` | L391 |
| POST | `/mcp/refresh` | edit | (empty) | `MCPRefreshResponse` | L482 |

### Request/Response Models (Verified Fields)

```
AiCompletionRequest:
  - prompt: str
  - include_other_code: str
  - code: str
  - ui_messages: list[UIMessage] = []
  - selected_text: Optional[str] = None
  - context: Optional[AiCompletionContext] = None
  - language: Language = "python"

AiInlineCompletionRequest:
  - prefix: str
  - suffix: str
  - language: Language = "python"

ChatRequest:
  - context: AiCompletionContext
  - include_other_code: str
  - ui_messages: list[UIMessage]
  - tools: Optional[list[ToolDefinition]] = None
  - model: Optional[str] = None
  - variables: Optional[list[Union[VariableContext, str]]] = None

AiCompletionContext:
  - schema: list[SchemaTable] = []
  - variables: list[Union[VariableContext, str]] = []
  - plain_text: str = ""

SchemaTable:
  - name: str
  - columns: list[SchemaColumn]

SchemaColumn:
  - name: str
  - type: str
  - sample_values: list[Any]

VariableContext:
  - name: str
  - value_type: str
  - preview_value: Any

InvokeAiToolRequest:
  - tool_name: str
  - arguments: dict[str, Any]

InvokeAiToolResponse:
  - success: bool
  - tool_name: str
  - result: Any
  - error: Optional[str] = None

MCPStatusResponse:
  - status: Literal["ok", "partial", "error"]
  - error: Optional[str] = None
  - servers: dict[str, Literal["pending", "connected", "disconnected", "failed"]] = {}

MCPRefreshResponse:
  - success: bool
  - error: Optional[str] = None
  - servers: dict[str, bool] = {}
```

## 3.8 Secrets (`secrets.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/keys` | edit | `ListSecretKeysRequest` | `SuccessResponse` | L32 |
| POST | `/create` | edit | `CreateSecretRequest` | `SuccessResponse` | L59 |
| POST | `/delete` | edit | (none) | `JSONResponse` (501) | L98 |

```
ListSecretKeysRequest:
  - request_id: RequestId

CreateSecretRequest:
  - key: str
  - value: str
  - provider: SecretProviderType
  - name: str
```

## 3.9 Caching (`cache.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/clear` | edit | `ClearCacheCommand` (empty) | `SuccessResponse` | L20 |
| POST | `/info` | edit | `GetCacheInfoCommand` (empty) | `SuccessResponse` | L46 |

## 3.10 Data Sources (`datasources.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/preview_column` | edit | `PreviewDatasetColumnRequest` | `SuccessResponse` | L28 |
| POST | `/preview_sql_table` | edit | `PreviewSQLTableRequest` | `SuccessResponse` | L56 |
| POST | `/preview_sql_table_list` | edit | `ListSQLTablesRequest` | `SuccessResponse` | L82 |
| POST | `/preview_datasource_connection` | edit | `ListDataSourceConnectionRequest` | `SuccessResponse` | L108 |

```
PreviewDatasetColumnRequest:
  - source_type: DataTableSource
  - source: str
  - table_name: str
  - column_name: str
  - fully_qualified_table_name: Optional[str] = None

PreviewSQLTableRequest:
  - request_id: RequestId
  - engine: str
  - database: str
  - schema: str
  - table_name: str

ListSQLTablesRequest:
  - request_id: RequestId
  - engine: str
  - database: str
  - schema: str

ListDataSourceConnectionRequest:
  - engine: str
```

## 3.11 SQL (`sql.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/validate` | edit | `ValidateSQLRequest` | `SuccessResponse` | L19 |

```
ValidateSQLRequest:
  - request_id: RequestId
  - query: str
  - only_parse: bool
  - engine: Optional[str] = None
  - dialect: Optional[str] = None
```

## 3.12 Storage (`storage.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/list_entries` | edit | `StorageListEntriesRequest` | `SuccessResponse` | L25 |
| POST | `/download` | edit | `StorageDownloadRequest` | `SuccessResponse` | L51 |

```
StorageListEntriesRequest:
  - request_id: RequestId
  - namespace: str
  - limit: int
  - prefix: Optional[str] = None

StorageDownloadRequest:
  - request_id: RequestId
  - namespace: str
  - path: str
  - preview: bool = False
```

## 3.13 Documentation (`documentation.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| GET | `/snippets` | edit | (empty) | `Snippets` | L25 |

## 3.14 Export (`export.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/html` | read | `ExportAsHTMLRequest` | `HTMLResponse` | L54 |
| POST | `/auto_export/html` | edit | `ExportAsHTMLRequest` | `SuccessResponse` / 304 | L117 |
| POST | `/script` | edit | `ExportAsScriptRequest` | `PlainTextResponse` | L191 |
| POST | `/markdown` | edit | `ExportAsMarkdownRequest` | `PlainTextResponse` | L240 |
| POST | `/ipynb` | edit | `ExportAsIPYNBRequest` | `PlainTextResponse` | L297 |
| POST | `/auto_export/markdown` | edit | `ExportAsMarkdownRequest` | `SuccessResponse` / 304 | L356 |
| POST | `/auto_export/ipynb` | edit | `ExportAsIPYNBRequest` | `SuccessResponse` / 304 | L420 |
| POST | `/pdf` | edit | `ExportAsPDFRequest` | `Response` (application/pdf) | L498 |
| POST | `/update_cell_outputs` | edit | `UpdateCellOutputsRequest` | `SuccessResponse` | L562 |

```
ExportAsHTMLRequest:
  - download: bool
  - files: list[str]
  - include_code: bool
  - asset_url: Optional[str] = None

ExportAsScriptRequest:
  - download: bool

ExportAsMarkdownRequest:
  - download: bool

ExportAsIPYNBRequest:
  - download: bool

ExportAsPDFRequest:
  - webpdf: bool
  - preset: Literal["document", "slides"] = "document"
  - include_inputs: bool = False
  - rasterize_outputs: bool = True
  - raster_scale: float = 4.0
  - raster_server: Literal["static", "live"] = "static"

UpdateCellOutputsRequest:
  - cell_ids_to_output: dict[CellId_t, MimeBundleTuple]
```

## 3.15 LSP (`lsp.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| GET | `/health` | edit | (empty) | `LspHealthResponse` | L24 |
| POST | `/restart` | edit | `LspRestartRequest` | `LspRestartResponse` | L40 |

```
LspServerHealth:
  - server_id: LspServerId
  - status: LspServerStatus
  - port: int
  - last_ping_ms: Optional[float] = None
  - error: Optional[str] = None
  - started_at: Optional[float] = None

LspHealthResponse:
  - status: Literal["healthy", "degraded", "unhealthy"]
  - servers: list[LspServerHealth]

LspRestartRequest:
  - server_ids: Optional[list[LspServerId]] = None

LspRestartResponse:
  - success: bool
  - restarted: list[LspServerId]
  - errors: dict[LspServerId, str] = {}
```

## 3.16 Home/Workspace (`home.py`)

| Method | Path | Auth | Request Model | Response | Line |
|--------|------|------|---------------|----------|------|
| POST | `/recent_files` | edit | (empty) | `RecentFilesResponse` | L49 |
| POST | `/workspace_files` | read | `WorkspaceFilesRequest` | `WorkspaceFilesResponse` | L74 |
| POST | `/running_notebooks` | edit | (empty) | `RunningNotebooksResponse` | L218 |
| POST | `/shutdown_session` | edit | `ShutdownSessionRequest` | `RunningNotebooksResponse` | L237 |
| POST | `/tutorial/open` | edit | `OpenTutorialRequest` | `MarimoFile` | L263 |

```
MarimoFile:
  - name: str
  - path: str
  - last_modified: Optional[float] = None
  - session_id: Optional[SessionId] = None
  - initialization_id: Optional[str] = None

RecentFilesResponse:
  - files: list[MarimoFile]

RunningNotebooksResponse:
  - files: list[MarimoFile]

WorkspaceFilesRequest:
  - include_markdown: bool = False

WorkspaceFilesResponse:
  - root: str
  - files: list[FileInfo]
  - has_more: bool = False
  - file_count: int = 0

ShutdownSessionRequest:
  - session_id: SessionId

OpenTutorialRequest:
  - tutorial_id: Tutorial
```

## 3.17 Health & Status (`health.py`)

| Method | Path | Auth | Response | Line |
|--------|------|------|----------|------|
| GET | `/health` | none | `{"status": "healthy"}` | L38 |
| GET | `/healthz` | none | `{"status": "healthy"}` | L39 |
| GET | `/api/status` | edit | Server status JSON | L42 |
| GET | `/api/sessions` | edit | Session debug list | L100 |
| GET | `/api/version` | none | `PlainTextResponse` (version string) | L131 |
| GET | `/api/usage` | edit | Resource usage JSON | L146 |
| GET | `/api/status/connections` | none | `{"active": int}` | L352 |

### `/api/status` Response Shape

```json
{
  "status": "...",
  "filenames": ["..."],
  "mode": "edit|run",
  "sessions": 1,
  "version": "0.21.0",
  "python_version": "3.12.0",
  "requirements": ["..."],
  "node_version": "...",
  "lsp_running": true
}
```

### `/api/usage` Response Shape

```json
{
  "memory": {"total": 0, "available": 0, "percent": 0.0, "used": 0, "free": 0, "has_cgroup_mem_limit": false},
  "server": {"memory": 0},
  "kernel": {"memory": 0},
  "cpu": {"percent": 0.0},
  "gpu": [{"index": 0, "name": "...", "memory": {"total": 0, "used": 0, "free": 0, "percent": 0.0}}]
}
```

## 3.18 Authentication (`login.py`)

| Method | Path | Auth | Response | Line |
|--------|------|------|----------|------|
| GET | `/login` | none | `HTMLResponse` (login page) | L142 |
| POST | `/login` | none | `RedirectResponse` (302) or error HTML | L75 |

POST body: `application/x-www-form-urlencoded` with `password` field.

## 3.19 Terminal (`terminal.py`)

| Type | Path | Auth | Protocol | Line |
|------|------|------|----------|------|
| WebSocket | `/ws` | edit | Text frames (terminal I/O) + JSON resize `{"type":"resize","cols":N,"rows":N}` | L340 |

## 3.20 Assets & Static (`assets.py`)

| Method | Path | Auth | Response | Line |
|--------|------|------|----------|------|
| GET | `/og/thumbnail` | read | `FileResponse` / SVG placeholder | L106 |
| GET | `/` | read | `HTMLResponse` (index/home/notebook) | L216 |
| GET | `/@file/{filename_and_length}` | read | `StreamingResponse` (virtual file) | L373 |
| GET | `/public-files-sw.js` | none | Service worker JS | L428 |
| GET | `/public/{filepath}` | read | `FileResponse` | L462 |
| GET | `/{path}` (catch-all) | none | `FileResponse` (static) | L494 |

## 3.21 Shared Base Models

```
BaseResponse:
  - success: bool

SuccessResponse (extends BaseResponse):
  - success: bool = True

ErrorResponse (extends BaseResponse):
  - success: bool = False
  - message: Optional[str] = None
```

## 3.22 Total API Surface Count

| Category | Endpoint Count |
|----------|---------------|
| Kernel execution | 12 |
| Cell editing | 7 |
| File operations | 5 |
| Configuration | 1 |
| File explorer | 8 |
| Packages | 4 |
| AI/Completion | 6 |
| Secrets | 3 |
| Caching | 2 |
| Data sources | 4 |
| SQL | 1 |
| Storage | 2 |
| Documentation | 1 |
| Export | 9 |
| LSP | 2 |
| Home/Workspace | 5 |
| Health/Status | 7 |
| Auth | 2 |
| Terminal (WS) | 1 |
| Assets/Static | 6 |
| **Total** | **88** |

## 3.23 Codaro Mapping Direction

| marimo | Codaro | Notes |
|--------|--------|-------|
| `/api/kernel/*` (12) | `src/codaro/api/kernel.py` | 이미 유사 구조 존재, run/execute/scratchpad/pdb/restart/shutdown/takeover 추가 필요 |
| `/api/kernel/files/*` (5) | `src/codaro/api/document.py` | save/copy/rename/read_code/save_app_config |
| `/api/files/*` (8) | `src/codaro/system/fileOps.py` | 파일 CRUD + open + search 추가 필요 |
| `/api/packages/*` (4) | `src/codaro/system/packageOps.py` | add/remove/list/tree 이미 구현됨 |
| `/api/ai/*` (6) | 신규 | AI Teacher Provider 연동 시 |
| `/api/export/*` (9) | `src/codaro/document/` | html/script/markdown/ipynb/pdf + auto_export 3종 |
| `/api/datasources/*` (4) | 후순위 | SQL/data source |
| `/api/storage/*` (2) | 후순위 | S3/blob |
| `/api/home/*` (5) | 필요 | 워크스페이스 파일 목록, 최근 파일, 튜토리얼 |
| `/api/lsp/*` (2) | 필요 | LSP 서버 건강 체크 |
| `/api/secrets/*` (3) | 후순위 | .env 기반 비밀 관리 |
| `/api/cache/*` (2) | 필요 | 셀 캐시 관리 |
| `/api/sql/*` (1) | 후순위 | SQL 유효성 검사 |
| Health (7) | 필요 | /health, /status, /usage, /version, /connections |
| Assets (6) | `src/codaro/api/spa.py` | SPA 서빙, 가상 파일, 썸네일 |
