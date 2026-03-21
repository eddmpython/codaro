# 09 — Configuration System & CLI Contract

> Source: `marimo/_config/`, `marimo/_cli/`

## 9.1 Configuration Schema

> Source: `_config/config.py` (~24KB)

### MarimoConfig (Full Schema)

```python
MarimoConfig = TypedDict({
    "display": DisplayConfig,
    "runtime": RuntimeConfig,
    "save": SaveConfig,
    "completion": CompletionConfig,
    "keymap": KeymapConfig,
    "server": ServerConfig,
    "ai": AiConfig,
    "package_management": PackageManagementConfig,
    "formatting": FormattingConfig,
    "language_servers": LanguageServersConfig,
})
```

### DisplayConfig

```python
DisplayConfig = TypedDict({
    "theme": Literal["light", "dark", "system"],  # Default: "light"
    "code_editor_font_size": int,                   # Default: 14
    "cell_output": Literal["above", "below"],       # Default: "below"
    "default_width": Literal[
        "normal", "compact", "medium", "full", "columns"
    ],                                               # Default: "normal"
    "dataframes": Literal["rich", "plain"],          # Default: "rich"
    "default_table_page_size": int,                  # Default: 10
    "locale": Optional[str],                         # e.g., "en-US"
})
```

### RuntimeConfig

```python
RuntimeConfig = TypedDict({
    "auto_instantiate": bool,                        # Default: True
    "auto_reload": Literal["off", "lazy", "autorun"],  # Default: "off"
    "on_cell_change": Literal["lazy", "autorun"],    # Default: "autorun"
    "reactive_tests": bool,                          # Default: False
    "output_max_bytes": int,                         # Default: 5_000_000 (5MB)
    "std_stream_max_bytes": int,                     # Default: 1_000_000 (1MB)
    "pythonpath": list[str],                         # Default: []
    "dotenv": list[str],                             # Default: []
    "default_sql_output": Literal[
        "auto", "native", "polars", "lazy-polars", "pandas"
    ],                                               # Default: "auto"
})
```

### SaveConfig

```python
SaveConfig = TypedDict({
    "autosave": Literal["off", "after_delay"],       # Default: "after_delay"
    "autosave_delay": int,                           # Default: 1000 (ms)
    "format_on_save": bool,                          # Default: False
})
```

### CompletionConfig

```python
CompletionConfig = TypedDict({
    "activate_on_typing": bool,                      # Default: True
    "copilot": Literal["none", "github", "codeium"], # Default: "none"
})
```

### KeymapConfig

```python
KeymapConfig = TypedDict({
    "preset": Literal["default", "vim"],             # Default: "default"
    "overrides": dict[str, str],                     # Custom bindings
})
```

### ServerConfig

```python
ServerConfig = TypedDict({
    "browser": Literal["default", "none"],           # Default: "default"
    "follow_symlink": bool,                          # Default: False
})
```

### AiConfig

```python
AiConfig = TypedDict({
    "rules": str,                                    # Custom AI rules
    "open_ai": OpenAiConfig,
    "anthropic": AnthropicConfig,
    "google": GoogleConfig,
})

OpenAiConfig = TypedDict({
    "api_key": str,
    "model": str,                                    # Default: "gpt-4o"
    "base_url": str,                                 # For custom endpoints
    "max_tokens": int,
})

AnthropicConfig = TypedDict({
    "api_key": str,
    "model": str,
})

GoogleConfig = TypedDict({
    "api_key": str,
    "model": str,
})
```

### PackageManagementConfig

```python
PackageManagementConfig = TypedDict({
    "manager": Literal["pip", "uv", "conda", "micromamba", "pixi", "rye"],
    # Default: "pip"
})
```

### FormattingConfig

```python
FormattingConfig = TypedDict({
    "line_length": int,                              # Default: 79
})
```

### LanguageServersConfig

```python
LanguageServersConfig = TypedDict({
    "pyright": LspConfig,
    "ruff": LspConfig,
})

LspConfig = TypedDict({
    "enabled": bool,                                 # Default: True
})
```

## 9.2 Configuration Manager Hierarchy

> Source: `_config/manager.py` (~15KB)

### Resolution Order (lowest → highest priority)

```
1. Defaults (hardcoded)
   ↓ overridden by
2. UserConfigManager (~/.marimo.toml)
   ↓ overridden by
3. ProjectConfigManager (pyproject.toml [tool.marimo])
   ↓ overridden by
4. ScriptConfigManager (PEP 723 inline metadata)
   ↓ overridden by
5. EnvConfigManager (environment variables)
```

### MarimoConfigManager Interface

```python
class MarimoConfigManager:
    def get_config(hide_secrets: bool = True) -> MarimoConfig
    def get_user_config() -> MarimoConfig
    def get_config_overrides() -> PartialMarimoConfig
    def with_overrides(overrides: PartialMarimoConfig) -> MarimoConfigManager
    def save_config(config: MarimoConfig) -> MarimoConfig

    @property
    def theme(self) -> Theme
    @property
    def default_width(self) -> WidthType
    @property
    def package_manager(self) -> PackageManagerKind
    @property
    def completion(self) -> CompletionConfig
    @property
    def is_auto_save_enabled(self) -> bool
```

### Config File Locations

| Level | File | Format |
|-------|------|--------|
| User | `~/.marimo.toml` | TOML |
| Project | `pyproject.toml` `[tool.marimo]` | TOML |
| Script | PEP 723 inline `# /// script` | TOML in comments |
| Env | `MARIMO_*` environment variables | Key=Value |

### Secret Masking

```python
def get_config(hide_secrets=True):
    config = deep_merge(all_layers)
    if hide_secrets:
        mask_secrets(config)  # Replace API keys with "****"
    return config
```

## 9.3 Settings (Global State)

> Source: `_config/settings.py`

```python
class Settings:
    DEVELOPMENT_MODE: bool = False
    QUIET: bool = False
    LOG_LEVEL: str = "WARN"
    YES: bool = False              # Auto-confirm prompts
```

## 9.4 CLI Command Structure

> Source: `_cli/cli.py` (~42KB)

### Root Command

```
marimo [OPTIONS] COMMAND [ARGS]

Options:
  --log-level TEXT    Log level (DEBUG, INFO, WARN, ERROR)
  --quiet             Suppress output
  --yes               Auto-confirm prompts
  --development-mode  Enable development features
  --version           Show version
  --help              Show help
```

### `marimo edit` — Interactive Editor

```
marimo edit [OPTIONS] [NAME]

Arguments:
  NAME                    Notebook file to open (optional, opens home if omitted)

Options:
  -p, --port INTEGER      Port number (default: 2718)
  --host TEXT              Host to bind (default: 127.0.0.1)
  --proxy TEXT             Proxy URL for reverse proxy setup
  --base-url TEXT          Base URL path prefix
  --headless              Don't open browser
  --token / --no-token    Enable/disable auth token
  --token-password TEXT   Use password-based auth
  --sandbox / --no-sandbox  Run in sandbox mode
  --trusted / --untrusted   Trust remote notebooks
  --watch                 Enable file watching
  --mcp [tools|code-mode]  Enable MCP server
  --session-ttl INTEGER   Session TTL in seconds (default: 120)
  --allow-origins TEXT    CORS origins (comma-separated)
  --redirect-console-to-browser  Send stdout/stderr to browser
```

### `marimo run` — Read-Only App

```
marimo run [OPTIONS] NAME

Arguments:
  NAME                    Notebook file to run (required)

Options:
  -p, --port INTEGER      Port number (default: 2718)
  --host TEXT              Host to bind (default: 127.0.0.1)
  --headless              Don't open browser
  --token / --no-token    Enable/disable auth
  --include-code          Show source code in read mode
  --allow-origins TEXT    CORS origins
  --base-url TEXT         Base URL path prefix
```

### `marimo export` — Format Conversion

```
marimo export [FORMAT] [OPTIONS] NAME

Formats:
  html       Export as standalone HTML
  script     Export as Python script
  md         Export as Markdown
  ipynb      Export as Jupyter notebook
  pdf        Export as PDF (requires playwright)

Common Options:
  --output TEXT           Output file path
  --watch                Watch for changes
  --sandbox / --no-sandbox  Sandbox mode
```

### `marimo convert` — Import from Other Formats

```
marimo convert [OPTIONS] NAME

Options:
  --output TEXT           Output file path
  # Auto-detects input format (ipynb, markdown, etc.)
```

### `marimo config` — Configuration Management

```
marimo config show        Show current configuration
marimo config show-schema Show JSON schema
```

### `marimo tutorial` — Built-in Tutorials

```
marimo tutorial [TOPIC]

Topics:
  intro, dataflow, ui, markdown, plots, layout, fileformat,
  sql, for-jupyter-users
```

### `marimo development` — Dev Utilities

```
marimo development [COMMAND]

Commands:
  env-info    Show environment information
  completion  Generate shell completion
```

## 9.5 CLI Validators

> Source: `_cli/cli_validators.py`

```python
def validate_port(port: int) -> int:
    if port < 0 or port > 65535:
        raise ValueError
    return port

def validate_host(host: str) -> str:
    # Validates host format

def validate_token(token: str) -> str:
    # Validates token format
```

## 9.6 Sandbox Mode

> Source: `_cli/sandbox.py` (~19KB)

```python
class Sandbox:
    """Per-notebook isolated virtual environment."""

    def create_venv(notebook_path: str) -> str:
        # Create isolated venv from notebook's PEP 723 dependencies

    def install_dependencies(venv_path: str, deps: list[str]) -> None:
        # Install packages in sandbox venv

    def activate(venv_path: str) -> None:
        # Activate sandbox for execution
```

## 9.7 Codaro Mapping Direction

| marimo | Codaro | Notes |
|--------|--------|-------|
| `MarimoConfig` | Codaro 설정 스키마 | 동일 계층 구조 수용 |
| `~/.marimo.toml` | `~/.codaro.toml` | 사용자 설정 파일 |
| `pyproject.toml [tool.marimo]` | `pyproject.toml [tool.codaro]` | 프로젝트 설정 |
| Config hierarchy (4 layers) | 동일 패턴 | User → Project → Script → Env |
| `marimo edit` | `codaro edit` | 이미 `src/codaro/cli.py` 존재 |
| `marimo run` | `codaro run` | 이미 존재 |
| `marimo export` | `codaro export` | 이미 존재 |
| Package manager: pip/uv/conda | `uv` 전용 | CLAUDE.md 규칙 |
| Sandbox mode | 후순위 | 초기에는 불필요 |
| AI config (OpenAI/Anthropic/Google) | GPT/Ollama/Claude | CLAUDE.md AI 통합 원칙 |
| Display config | 수용 | theme, width, font_size 등 |
| Runtime config | 핵심 수용 | on_cell_change, auto_instantiate |
| Save config | 수용 | autosave, format_on_save |
