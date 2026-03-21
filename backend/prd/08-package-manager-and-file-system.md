# 08 — Package Manager & File System Contract

> Source: `marimo/_runtime/packages/`, `marimo/_server/files/`

## 8.1 Package Manager Interface

> Source: `_runtime/packages/package_manager.py`

### Abstract Base

```python
class PackageManager(ABC):
    @abstractmethod
    def module_to_package(module_name: str) -> str:
        """Map import name to package name.
        e.g., 'PIL' → 'pillow', 'numpy' → 'numpy'"""

    @abstractmethod
    def package_to_module(package_name: str) -> str:
        """Map package name to import name.
        e.g., 'pillow' → 'PIL', 'numpy' → 'numpy'"""

    @abstractmethod
    async def install(
        package: str,
        version: Optional[str] = None,
        group: Optional[str] = None,
    ) -> bool:
        """Install package. Returns True on success."""

    @abstractmethod
    async def uninstall(
        package: str,
        group: Optional[str] = None,
    ) -> bool:
        """Remove package. Returns True on success."""

    @abstractmethod
    def list_packages(self) -> list[PackageDescription]:
        """List installed packages."""

    @abstractmethod
    def dependency_tree(
        filename: Optional[str] = None,
    ) -> Optional[DependencyTreeNode]:
        """Get dependency structure."""
```

### PackageDescription

```python
class PackageDescription:
    name: str
    version: str
    summary: Optional[str]
```

### DependencyTreeNode

```python
class DependencyTreeNode:
    package: str
    version: str
    dependencies: list[DependencyTreeNode]
```

## 8.2 Package Manager Implementations

> Source: `_runtime/packages/package_managers.py`

### Factory

```python
def create_package_manager(
    kind: PackageManagerKind,
) -> PackageManager:
    match kind:
        case "pip": return PipPackageManager()
        case "uv": return UvPackageManager()
        case "conda": return CondaPackageManager()
        case "micromamba": return MicromambaPackageManager()
        case "pixi": return PixiPackageManager()
        case "rye": return RyePackageManager()
```

### PackageManagerKind

```python
PackageManagerKind = Literal[
    "pip", "uv", "conda", "micromamba", "pixi", "rye"
]
```

### PyPI Package Manager

> Source: `_runtime/packages/pypi_package_manager.py`

```python
class PipPackageManager(PackageManager):
    async def install(package, version, group):
        cmd = [sys.executable, "-m", "pip", "install"]
        if version:
            cmd.append(f"{package}=={version}")
        else:
            cmd.append(package)
        process = await asyncio.create_subprocess_exec(*cmd)
        return process.returncode == 0
```

### Module ↔ Package Name Mapping

> Source: `_runtime/packages/module_name_to_pypi_name.py`

내장 매핑 테이블 (수백 개의 매핑):
```python
MODULE_TO_PYPI = {
    "PIL": "pillow",
    "cv2": "opencv-python",
    "sklearn": "scikit-learn",
    "bs4": "beautifulsoup4",
    "yaml": "pyyaml",
    "gi": "pygobject",
    # ... 수백 개
}
```

### Import Error Analysis

> Source: `_runtime/packages/import_error_extractors.py`

```python
def extract_missing_module_from_import_error(
    error: ModuleNotFoundError,
) -> Optional[str]:
    """Parse error message to find missing module name."""
    # Handles various error message patterns
```

## 8.3 Auto-Install Flow

커널이 `ModuleNotFoundError`를 잡으면:

```
1. Cell raises ModuleNotFoundError
   │
   ▼
2. extract_missing_module_from_import_error(error)
   → module_name = "numpy"
   │
   ▼
3. package_manager.module_to_package("numpy")
   → package_name = "numpy"
   │
   ▼
4. Broadcast MissingPackageAlertNotification
   → Frontend shows "numpy is not installed. Install?"
   │
   ▼
5. User confirms (or auto-install if configured)
   │
   ▼
6. Broadcast InstallingPackageAlertNotification
   │
   ▼
7. await package_manager.install("numpy")
   │
   ▼
8. Broadcast PackageInstalledNotification(success=True/False)
   │
   ▼
9. If success → re-execute failed cell + descendants
```

## 8.4 File System Interface

> Source: `_server/files/`

### File System Abstraction

```python
class FileSystem(Protocol):
    def list_directory(path: str) -> list[FileInfo]:
        """List directory contents."""

    def read_file(path: str) -> str:
        """Read file content."""

    def write_file(path: str, content: str) -> None:
        """Write file content."""

    def create_file_or_directory(
        path: str,
        type: Literal["file", "directory"],
        name: str,
        content: Optional[str] = None,
    ) -> FileInfo

    def delete_file_or_directory(path: str) -> bool

    def move(path: str, new_path: str) -> FileInfo

    def get_details(path: str) -> FileDetails
```

### OS File System Implementation

> Source: `_server/files/os_file_system.py`

```python
class OsFileSystem(FileSystem):
    root: str                      # Sandbox root directory

    def list_directory(path) -> list[FileInfo]:
        entries = os.listdir(full_path)
        return [FileInfo(
            id=entry_path,
            name=entry.name,
            path=entry_path,
            is_directory=entry.is_dir(),
            is_marimo_file=is_marimo_file(entry),
            last_modified=entry.stat().st_mtime,
        ) for entry in entries]
```

### FileInfo

```python
class FileInfo:
    id: str
    name: str
    path: str
    is_directory: bool
    is_marimo_file: bool           # Has marimo import
    last_modified: Optional[float]
```

### Path Validation

> Source: `_server/files/path_validator.py`

```python
class PathValidator:
    def validate(path: str, root: str) -> str:
        """Ensure path is within sandbox root.
        Prevents directory traversal attacks."""
        resolved = Path(path).resolve()
        if not resolved.is_relative_to(Path(root).resolve()):
            raise PermissionError("Path outside sandbox")
        return str(resolved)
```

### Directory Scanner

> Source: `_server/files/directory_scanner.py`

```python
class DirectoryScanner:
    def scan(
        root: str,
        pattern: str = "**/*.py",
        ignore_patterns: list[str] = [".git", "__pycache__", "node_modules"],
    ) -> list[FileInfo]

    def search(
        root: str,
        query: str,
    ) -> list[FileInfo]:
        """Search files by name pattern."""
```

## 8.5 Virtual File System

> Source: `_runtime/virtual_file/`

Pyodide (브라우저) 환경을 위한 가상 파일 시스템:

```python
class VirtualFileManager:
    def add(data: bytes, ext: str) -> str:
        """Add virtual file, return URL path."""

    def remove(url: str) -> None

    def read(url: str) -> bytes
```

- 실제 파일 I/O가 불가능한 Pyodide에서 파일 다운로드/업로드 지원
- URL 기반 파일 참조 시스템

## 8.6 Codaro Mapping Direction

| marimo | Codaro | Notes |
|--------|--------|-------|
| `PackageManager` ABC | `src/codaro/system/packageOps.py` | 이미 구현됨 |
| `pip`/`uv`/`conda` managers | `uv` 전용 (CLAUDE.md 규칙) | Codaro는 `uv`만 사용 |
| Module→Package mapping | 수용 | 동일 매핑 테이블 |
| Auto-install flow | 수용 | 에러 감지 → 자동 설치 제안 |
| `OsFileSystem` | `src/codaro/system/fileOps.py` | 이미 구현됨 |
| Path validation | 필수 | 보안: sandbox 탈출 방지 |
| `VirtualFileManager` | Pyodide 지원 시 | Pyodide 환경용 |
| Directory scanner | 워크스페이스 파일 목록용 | `/api/home/workspace_files` 구현 시 |
