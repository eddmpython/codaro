from __future__ import annotations

import logging
import threading
import time
from collections.abc import Callable
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class FileChangeBatcher:
    onBatch: Callable[[list[Path]], None]
    debounceSeconds: float = 0.4
    _pending: set[Path] = field(default_factory=set)
    _timer: threading.Timer | None = None
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def submit(self, path: Path) -> None:
        with self._lock:
            self._pending.add(path)
            if self._timer is not None:
                self._timer.cancel()
            self._timer = threading.Timer(self.debounceSeconds, self._flush)
            self._timer.daemon = True
            self._timer.start()

    def _flush(self) -> None:
        with self._lock:
            if not self._pending:
                return
            batch = sorted(self._pending)
            self._pending.clear()
            self._timer = None
        try:
            self.onBatch(batch)
        except (RuntimeError, OSError, ValueError, AttributeError, TypeError) as error:
            logger.warning("hot-reload batch handler failed: %s", error)


class HotReloadWatcher:
    def __init__(
        self,
        root: Path,
        onChange: Callable[[list[Path]], None],
        *,
        patterns: tuple[str, ...] = ("*.py",),
        debounceSeconds: float = 0.4,
    ) -> None:
        self.root = Path(root).resolve()
        self.patterns = patterns
        self._batcher = FileChangeBatcher(onBatch=onChange, debounceSeconds=debounceSeconds)
        self._observer: Any = None

    def start(self) -> bool:
        try:
            from watchdog.events import FileSystemEventHandler
            from watchdog.observers import Observer
        except ImportError:
            logger.info("hot-reload disabled: watchdog package not installed")
            return False

        batcher = self._batcher
        patterns = self.patterns

        class _Handler(FileSystemEventHandler):
            def on_any_event(self, event):  # type: ignore[override]
                if event.is_directory:
                    return
                path = Path(getattr(event, "src_path", "") or "")
                if not path.name or not any(path.match(pattern) for pattern in patterns):
                    return
                batcher.submit(path)

        observer = Observer()
        observer.schedule(_Handler(), str(self.root), recursive=True)
        observer.daemon = True
        observer.start()
        self._observer = observer
        return True

    def stop(self) -> None:
        observer = self._observer
        if observer is None:
            return
        try:
            observer.stop()
            observer.join(timeout=2.0)
        except (RuntimeError, OSError):
            pass
        self._observer = None

    @property
    def isRunning(self) -> bool:
        return self._observer is not None


def startHotReload(
    root: Path,
    onChange: Callable[[list[Path]], None],
    *,
    patterns: tuple[str, ...] = ("*.py",),
    debounceSeconds: float = 0.4,
) -> HotReloadWatcher | None:
    watcher = HotReloadWatcher(root, onChange, patterns=patterns, debounceSeconds=debounceSeconds)
    if watcher.start():
        return watcher
    return None


def waitForBatch(batcher: FileChangeBatcher, timeoutSeconds: float = 2.0) -> None:
    deadline = time.monotonic() + timeoutSeconds
    while time.monotonic() < deadline:
        with batcher._lock:
            if not batcher._pending and batcher._timer is None:
                return
        time.sleep(0.05)
