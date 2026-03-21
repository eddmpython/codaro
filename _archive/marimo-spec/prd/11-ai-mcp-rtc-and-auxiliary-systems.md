# 11 — AI, MCP, RTC & Auxiliary Systems Contract

> Source: `marimo/_server/ai/`, `marimo/_ai/`, `marimo/_mcp/`, `marimo/_server/rtc/`, `marimo/_convert/`, `marimo/_lsp/`, `marimo/_pyodide/`

## 11.1 AI Integration

### AI Provider Architecture

> Source: `_server/ai/providers.py`, `_server/ai/config.py`

```python
class AiProvider(ABC):
    @abstractmethod
    async def stream_completion(
        prompt: str,
        code: str,
        context: str,
        language: str,
    ) -> AsyncIterator[str]:
        """Stream code completion tokens."""

    @abstractmethod
    async def stream_chat(
        messages: list[ChatMessage],
        code: str,
        context: str,
    ) -> AsyncIterator[str]:
        """Stream chat response tokens."""
```

### Supported Providers

| Provider | Config Key | Models |
|----------|-----------|--------|
| OpenAI | `ai.open_ai` | gpt-4o, gpt-4o-mini, gpt-4-turbo |
| Anthropic | `ai.anthropic` | claude-3.5-sonnet, claude-3-opus |
| Google | `ai.google` | gemini-1.5-pro |
| Ollama | via OpenAI-compatible base_url | Any local model |
| Custom | `ai.open_ai.base_url` | Any OpenAI-compatible API |

### AI Endpoint Flows

**Code Completion (SSE):**
```
POST /api/ai/completion
→ AiCompletionRequest { prompt, code, include_other_code, language }
→ Provider.stream_completion()
→ StreamingResponse (text/event-stream)
→ data: {"token": "..."}\n\n  (per chunk)
→ data: [DONE]\n\n
```

**Inline Completion (Fill-in-the-Middle):**
```
POST /api/ai/inline_completion
→ AiInlineCompletionRequest { prefix, suffix, language }
→ Provider.stream_inline_completion()
→ StreamingResponse (SSE)
```

**Chat:**
```
POST /api/ai/chat
→ ChatRequest { messages, code, include_other_code, context }
→ Provider.stream_chat()
→ StreamingResponse (SSE)
```

### AI System Prompts

> Source: `_server/ai/prompts.py`

```python
SYSTEM_PROMPT = """
You are a helpful assistant that generates Python code for marimo notebooks.
- Generate code that uses marimo features (mo.md, mo.ui, etc.)
- Use reactive patterns (no side effects, pure functions when possible)
- Follow Python best practices
- Use type hints when appropriate
{custom_rules}  # From ai.rules config
"""
```

### AI Tool Integration

> Source: `_server/ai/tools/`

```python
class AiTool:
    name: str
    description: str
    parameters: dict                # JSON schema

    async def execute(args: dict) -> dict:
        """Execute the tool and return result."""
```

Built-in tools:
- **Terminal tool**: Execute shell commands
- **File read/write**: Access notebook files

## 11.2 MCP (Model Context Protocol)

> Source: `marimo/_mcp/`

### MCP Server

marimo can expose an MCP server for external AI agents:

```
marimo edit --mcp tools       # Expose tools via MCP
marimo edit --mcp code-mode   # Expose code editing via MCP
```

### MCP Capabilities

```python
MCP_TOOLS = [
    "read_notebook",           # Read current notebook code
    "write_cell",              # Write/modify cell code
    "execute_cell",            # Run a cell
    "get_variables",           # List variables and values
    "get_cell_output",         # Get cell output
    "add_cell",                # Insert new cell
    "delete_cell",             # Remove cell
]
```

### MCP Status API

```
GET /api/ai/mcp/status → MCPStatusResponse
POST /api/ai/mcp/refresh → MCPRefreshResponse
```

## 11.3 RTC (Real-Time Collaboration)

> Source: `marimo/_server/rtc/`

### Loro CRDT

```python
# Requirements: Python 3.11+, loro package
class RtcDoc:
    """Loro CRDT document for collaborative editing."""

    def apply_update(update: bytes) -> None
    def get_update() -> bytes
    def subscribe(callback: Callable) -> None
```

### RTC WebSocket

```
ws://host:port/ws_sync?file=<file_key>

Protocol:
1. Client connects
2. Server sends full document state
3. Bidirectional delta updates (binary Loro format)
4. Server merges and broadcasts to all clients
```

## 11.4 Format Conversion

> Source: `marimo/_convert/`

### ipynb → marimo

> Source: `_convert/ipynb/to_ir.py`

```python
def convert_ipynb_to_marimo(notebook: dict) -> NotebookSerialization:
    """Convert Jupyter notebook JSON to marimo IR."""

    # 1. Fix multiple definitions (rename conflicts)
    # 2. Add marimo imports if using mo.md/mo.sql
    # 3. Transform magic commands:
    #    %%sql → mo.sql()
    #    %cd → os.chdir()
    #    %html → mo.Html()
    #    Others → commented out
    # 4. Extract imports and dependencies
    # 5. Return marimo-compatible cell structure
```

### marimo → ipynb

> Source: `_convert/ipynb/from_ir.py`

```python
def convert_marimo_to_ipynb(
    notebook: NotebookSerialization,
    outputs: Optional[dict] = None,
) -> dict:
    """Export as Jupyter notebook JSON."""

    # 1. Convert each cell to ipynb cell format
    # 2. Preserve marimo metadata
    # 3. Include cell outputs if available
    # 4. Topological or top-down ordering
```

### Markdown ↔ marimo

```python
def convert_markdown_to_marimo(content: str) -> NotebookSerialization:
    """Parse fenced code blocks as cells."""

def convert_marimo_to_markdown(notebook: NotebookSerialization) -> str:
    """Export as markdown with fenced code blocks."""
```

## 11.5 LSP Integration

> Source: `marimo/_lsp/`

### Language Server Protocol

```
/api/lsp/health → Check if LSP servers are running
/api/lsp/restart → Restart LSP servers
```

### Supported LSP Servers

| Server | Purpose | Config |
|--------|---------|--------|
| Pyright | Type checking, completion | `language_servers.pyright.enabled` |
| Ruff | Linting, formatting | `language_servers.ruff.enabled` |

### Copilot Integration

> Source: `_lsp/copilot/`

```python
# GitHub Copilot integration via LSP
# Configured via completion.copilot = "github"
```

## 11.6 Pyodide Support

> Source: `marimo/_pyodide/`

브라우저에서 Python 실행을 위한 Pyodide 통합:

```python
class PyodideRunner:
    """Execute cells using Pyodide in browser."""

    async def execute_cell(code: str) -> CellOutput:
        # Pyodide-specific execution
        # No file I/O (virtual file system only)
        # Limited package availability (pure Python wheels)
        # Same reactive dataflow engine
```

### Pyodide vs Local Differences

| Feature | Pyodide | Local |
|---------|---------|-------|
| File I/O | Virtual only | Full OS access |
| Packages | Pure Python wheels | Any pip package |
| Performance | Slower (WASM) | Native speed |
| Network | Browser CORS restrictions | Unrestricted |
| DB access | None | Full |
| subprocess | None | Full |

## 11.7 Other Auxiliary Systems

### Scratchpad

> Source: `_server/scratchpad.py`

```python
class Scratchpad:
    """Temporary notebook for quick experiments."""
    # Not persisted to disk
    # Separate session from main notebook
```

### Recents

> Source: `_server/recents.py`

```python
class RecentFiles:
    """Track recently opened notebook files."""
    max_items: int = 50

    def add(filepath: str) -> None
    def list() -> list[RecentFileEntry]
    def clear() -> None
```

### Code Snippets

> Source: `marimo/_snippets/`

```python
class Snippets:
    """Built-in code snippet library."""
    # Categorized by topic (plotting, data, ui, etc.)
    # Served via GET /api/documentation/snippets
```

### Lint Rules

> Source: `marimo/_lint/`

```python
class LintRule:
    """marimo-specific lint rules."""
    # Checks for: shadowed variables, missing refs, etc.
```

### Islands Architecture

> Source: `marimo/_islands/`

```python
class Islands:
    """Partial rendering: embed individual cells in external HTML."""
    # Each cell is an "island" that can be independently rendered
    # For embedding marimo outputs in other web pages
```

## 11.8 Codaro Mapping Direction

| marimo | Codaro | Notes |
|--------|--------|-------|
| AI Providers (OpenAI/Anthropic/Google) | GPT/Ollama/Claude | CLAUDE.md AI 통합 원칙 |
| AI as code assistant | AI as Teacher | Codaro는 학습 목적 AI (tool_use 기반) |
| MCP server | 후순위 | 외부 AI 에이전트 연동 |
| RTC (Loro CRDT) | 후순위 | 초기에는 단일 사용자 |
| ipynb conversion | 이미 구현됨 | `src/codaro/document/` |
| Markdown conversion | 수용 | `.md` 파일 import/export |
| Pyodide support | 핵심 | CLAUDE.md 확정 사상 #4 |
| LSP integration | 수용 | 코드 자동완성, 타입 체크 |
| Copilot integration | 후순위 | AI Teacher가 우선 |
| Scratchpad | 유용 | 임시 실험 공간 |
| Snippets | 학습 콘텐츠 연동 | 커리큘럼 코드 예시 |
| Islands | 후순위 | 임베딩 시나리오 |
