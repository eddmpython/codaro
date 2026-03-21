from __future__ import annotations

import base64
import json
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any


def _codaroHome() -> Path:
    raw = os.environ.get("CODARO_HOME")
    if raw:
        return Path(raw)
    return Path.home() / ".codaro"


@dataclass(frozen=True)
class SecretEntry:
    backend: str
    value: str


class SecretStoreError(RuntimeError):
    pass


class SecretStore:
    def __init__(self, path: Path | None = None) -> None:
        self.path = path or (_codaroHome() / "secrets.json")

    def _load(self) -> dict[str, dict[str, str]]:
        if not self.path.exists():
            return {}
        raw = self.path.read_text(encoding="utf-8")
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise SecretStoreError("Secret store JSON parse failed") from exc
        if not isinstance(data, dict):
            raise SecretStoreError("Secret store format is invalid")
        return {
            str(key): value for key, value in data.items()
            if isinstance(value, dict) and isinstance(value.get("backend"), str) and isinstance(value.get("value"), str)
        }

    def _save(self, data: dict[str, dict[str, str]]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        content = json.dumps(data, ensure_ascii=False, indent=2)
        fd, tmpPath = tempfile.mkstemp(dir=self.path.parent, suffix=".tmp")
        try:
            os.write(fd, content.encode("utf-8"))
            os.close(fd)
            fd = -1
            tmp = Path(tmpPath)
            if os.name != "nt":
                tmp.chmod(0o600)
            tmp.replace(self.path)
        finally:
            if fd >= 0:
                os.close(fd)
            if os.path.exists(tmpPath):
                os.unlink(tmpPath)

    def get(self, name: str) -> str | None:
        data = self._load()
        entry = data.get(name)
        if not entry:
            return None
        return self._decodeEntry(SecretEntry(**entry))

    def set(self, name: str, value: str) -> None:
        data = self._load()
        entry = self._encodeEntry(value)
        data[name] = {"backend": entry.backend, "value": entry.value}
        self._save(data)

    def delete(self, name: str) -> None:
        data = self._load()
        if name in data:
            data.pop(name, None)
            self._save(data)

    def has(self, name: str) -> bool:
        return self.get(name) is not None

    def getJson(self, name: str) -> dict[str, Any] | None:
        raw = self.get(name)
        if not raw:
            return None
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise SecretStoreError("JSON secret parse failed") from exc
        return data if isinstance(data, dict) else None

    def setJson(self, name: str, value: dict[str, Any]) -> None:
        self.set(name, json.dumps(value, ensure_ascii=False))

    def _encodeEntry(self, value: str) -> SecretEntry:
        raw = value.encode("utf-8")
        if os.name == "nt":
            encrypted = _protectWindows(raw)
            return SecretEntry(backend="dpapi", value=base64.b64encode(encrypted).decode("ascii"))
        return SecretEntry(backend="plain", value=base64.b64encode(raw).decode("ascii"))

    def _decodeEntry(self, entry: SecretEntry) -> str:
        raw = base64.b64decode(entry.value.encode("ascii"))
        if entry.backend == "dpapi":
            decrypted = _unprotectWindows(raw)
            return decrypted.decode("utf-8")
        if entry.backend == "plain":
            return raw.decode("utf-8")
        raise SecretStoreError(f"Unsupported secret backend: {entry.backend}")


def _protectWindows(data: bytes) -> bytes:
    import ctypes
    from ctypes import wintypes

    class DATA_BLOB(ctypes.Structure):
        _fields_ = [("cbData", wintypes.DWORD), ("pbData", ctypes.POINTER(ctypes.c_char))]

    crypt32 = ctypes.windll.crypt32
    kernel32 = ctypes.windll.kernel32

    crypt32.CryptProtectData.argtypes = [
        ctypes.POINTER(DATA_BLOB), wintypes.LPCWSTR,
        ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p,
        wintypes.DWORD, ctypes.POINTER(DATA_BLOB),
    ]
    crypt32.CryptProtectData.restype = wintypes.BOOL
    kernel32.LocalFree.argtypes = [wintypes.HLOCAL]
    kernel32.LocalFree.restype = wintypes.HLOCAL

    buffer = ctypes.create_string_buffer(data, len(data))
    dataIn = DATA_BLOB(len(data), ctypes.cast(buffer, ctypes.POINTER(ctypes.c_char)))
    dataOut = DATA_BLOB()
    if not crypt32.CryptProtectData(ctypes.byref(dataIn), "codaro", None, None, None, 0, ctypes.byref(dataOut)):
        raise ctypes.WinError()
    try:
        return ctypes.string_at(dataOut.pbData, dataOut.cbData)
    finally:
        kernel32.LocalFree(ctypes.cast(dataOut.pbData, wintypes.HLOCAL))


def _unprotectWindows(data: bytes) -> bytes:
    import ctypes
    from ctypes import wintypes

    class DATA_BLOB(ctypes.Structure):
        _fields_ = [("cbData", wintypes.DWORD), ("pbData", ctypes.POINTER(ctypes.c_char))]

    crypt32 = ctypes.windll.crypt32
    kernel32 = ctypes.windll.kernel32

    crypt32.CryptUnprotectData.argtypes = [
        ctypes.POINTER(DATA_BLOB), ctypes.POINTER(wintypes.LPWSTR),
        ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p,
        wintypes.DWORD, ctypes.POINTER(DATA_BLOB),
    ]
    crypt32.CryptUnprotectData.restype = wintypes.BOOL
    kernel32.LocalFree.argtypes = [wintypes.HLOCAL]
    kernel32.LocalFree.restype = wintypes.HLOCAL

    buffer = ctypes.create_string_buffer(data, len(data))
    dataIn = DATA_BLOB(len(data), ctypes.cast(buffer, ctypes.POINTER(ctypes.c_char)))
    dataOut = DATA_BLOB()
    description = wintypes.LPWSTR()
    if not crypt32.CryptUnprotectData(
        ctypes.byref(dataIn), ctypes.byref(description),
        None, None, None, 0, ctypes.byref(dataOut),
    ):
        raise ctypes.WinError()
    try:
        return ctypes.string_at(dataOut.pbData, dataOut.cbData)
    finally:
        if description:
            kernel32.LocalFree(ctypes.cast(description, wintypes.HLOCAL))
        kernel32.LocalFree(ctypes.cast(dataOut.pbData, wintypes.HLOCAL))


def getSecretStore() -> SecretStore:
    return SecretStore()
