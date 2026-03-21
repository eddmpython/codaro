# 02 — Server App Factory & Middleware Contract

> Source: `marimo/_server/main.py`, `marimo/_server/asgi.py`, `marimo/_server/router.py`, `marimo/_server/api/middleware.py`, `marimo/_server/api/auth.py`

## 2.1 Starlette App Factory

### Entry Point

`_server/main.py` — `create_starlette_app()` builds the complete Starlette application.

```python
def create_starlette_app(
    *,
    base_url: str = "",
    middleware: list[Middleware] | None = None,
    lifespan: Callable | None = None,
) -> Starlette:
```

### App Construction Flow

1. Create `APIRouter` instance
2. Register all HTTP endpoint routers (kernel, files, packages, ai, export, etc.)
3. Register WebSocket routes (`/ws`, `/ws_sync`, `/terminal/ws`)
4. Register static file serving (`/assets/**`)
5. Register auth routes (`/auth/login`)
6. Register health endpoints (`/health`, `/healthz`)
7. Apply middleware stack (bottom-up order)
8. Attach lifespan handler
9. Return configured Starlette instance

### Route Registration Order

```
/api/kernel/*          — Cell execution, editing, config
/api/files/*           — File explorer CRUD
/api/packages/*        — Package management
/api/ai/*              — AI completion, chat
/api/export/*          — HTML/script/markdown/ipynb/PDF export
/api/datasources/*     — Data source connections
/api/sql/*             — SQL validation
/api/storage/*         — S3/blob storage
/api/documentation/*   — Snippets
/api/secrets/*         — Secret management
/api/cache/*           — Cache management
/api/home/*            — Workspace, recent files
/api/lsp/*             — LSP health/restart
/api/status            — Server status
/api/sessions          — Debug session list
/ws                    — Main session WebSocket
/ws_sync               — RTC sync WebSocket
/terminal/ws           — Interactive terminal
/auth/login            — Authentication
/health, /healthz      — Health checks
/assets/**             — Static frontend files
```

## 2.2 ASGI Mounting

> Source: `_server/asgi.py`

marimo를 다른 ASGI 앱에 마운팅하는 메커니즘.

```python
def create_asgi_app(
    *,
    quiet: bool = False,
    include_code: bool = False,
    token: str | bool | None = None,
    allow_origins: tuple[str, ...] | None = None,
) -> ASGIApp:
```

### Mounting Examples

```python
# FastAPI
from marimo._server.asgi import create_asgi_app
app.mount("/marimo", create_asgi_app())

# Django ASGI
from marimo._server.asgi import create_asgi_app
application = get_asgi_application()
# Route /marimo/* to marimo ASGI app

# Standalone
uvicorn.run(create_asgi_app(), host="0.0.0.0", port=2718)
```

### Dynamic Directory Mode

`create_asgi_app()` supports a directory mode where the server dynamically loads notebooks from a specified directory, creating sessions on demand.

## 2.3 Middleware Stack

> Source: `_server/api/middleware.py`

Middleware는 아래에서 위로 적용된다 (first in = outermost).

| Order | Middleware | Source | Purpose |
|-------|-----------|--------|---------|
| 1 | `CustomSessionMiddleware` | `middleware.py` | Session cookie management |
| 2 | `OpenTelemetryMiddleware` | `middleware.py` | Distributed tracing (optional) |
| 3 | `CustomAuthenticationMiddleware` | `middleware.py` | User context preservation |
| 4 | `CORSMiddleware` | Starlette built-in | CORS headers |
| 5 | `SkewProtectionMiddleware` | `middleware.py` | Client-server version mismatch detection |
| 6 | `ProxyMiddleware` | `middleware.py` | LSP server proxying (optional) |
| 7 | `TimeoutMiddleware` | `middleware.py` | Request timeout enforcement (optional) |

### SkewProtectionMiddleware

- Server generates a `skew_protection_token` at startup
- Frontend sends this token in `Marimo-Server-Token` header
- If tokens don't match → 400 error (forces frontend reload)
- Prevents stale frontend from talking to restarted server

### CustomSessionMiddleware

- Cookie-based session with configurable secret
- Session data available as `request.session`

### CustomAuthenticationMiddleware

- Preserves `request.user` from authentication backend
- Used by endpoint guards to check `read` vs `edit` permission

## 2.4 Authentication

> Source: `_server/api/auth.py`, `_server/token_manager.py`

### Auth Modes

1. **Token Auth** (default in edit mode)
   - Server generates random token at startup
   - Printed to console for user
   - Sent as query param `?access_token=<token>` or cookie

2. **Password Auth**
   - `--token-password` CLI flag
   - Login form at `/auth/login`
   - Sets session cookie on success

3. **Basic Auth**
   - `Authorization: Basic <base64(user:token)>` header
   - For programmatic API access

4. **No Auth**
   - `--no-token` CLI flag or `enable_auth=False`
   - All requests allowed

### Authorization Levels

| Level | Allowed Operations |
|-------|-------------------|
| `read` | View outputs, run in read-only mode, export |
| `edit` | All operations: edit cells, save, config, packages, files |

### Endpoint Guards

Each endpoint declares its required auth level:
```python
@router.post("/api/kernel/save")
async def save(request: Request):
    # Requires edit-level auth
    ...
```

## 2.5 Dependency Injection

> Source: `_server/api/deps.py`

### AppState

Request-scoped state available to all handlers:

```python
class AppState:
    session_manager: SessionManager
    config_manager: MarimoConfigManager
    base_url: str
    skew_protection_token: str

    def get_current_session() -> Optional[Session]
    def require_current_session() -> Session  # raises if None
```

### Session Access Pattern

```python
async def handler(request: Request):
    app_state = AppState(request)
    session = app_state.require_current_session()
    session.put_control_request(SomeCommand(...))
```

## 2.6 Response Patterns

### StructResponse

marimo uses a custom `StructResponse` class that auto-serializes msgspec.Struct to JSON:

```python
class StructResponse(Response):
    def __init__(self, content: msgspec.Struct):
        body = msgspec.json.encode(content)
        super().__init__(content=body, media_type="application/json")
```

### Streaming Response (SSE)

AI endpoints use Server-Sent Events:

```python
async def ai_completion(request):
    async def generate():
        async for chunk in provider.stream(...):
            yield f"data: {json.dumps(chunk)}\n\n"
    return StreamingResponse(generate(), media_type="text/event-stream")
```

## 2.7 Codaro Mapping Direction

| marimo | Codaro | Notes |
|--------|--------|-------|
| Starlette | FastAPI | Codaro already uses FastAPI; `_server/api/` 구조를 `src/codaro/api/`로 매핑 |
| SkewProtectionMiddleware | 필요 | Codaro도 프론트 빌드와 서버 버전 동기화 필요 |
| Token auth | 유지 | 동일한 토큰 기반 인증 |
| ASGI mounting | `createServerApp()` | CLAUDE.md 7번 원칙과 일치 |
| SessionMiddleware | 유지 | 쿠키 기반 세션 |
| OpenTelemetry | 후순위 | 초기에는 불필요 |
| RTC/Loro | 후순위 | 초기에는 단일 사용자 |
