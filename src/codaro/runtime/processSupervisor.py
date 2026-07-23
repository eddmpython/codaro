from __future__ import annotations

import logging
import sys
import threading
import time
from dataclasses import dataclass, field
from multiprocessing import Process
from typing import Any, Callable

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class ResourceLimits:
    maxMemoryMb: int = 512
    maxCpuPercent: int = 80
    maxExecutionSeconds: int = 300
    maxChildProcesses: int = 3
    heartbeatTimeoutSeconds: float = 0.0
    idleZombieCheckSeconds: float = 1.0


@dataclass(slots=True)
class ResourceSnapshot:
    memoryMb: float = 0.0
    cpuPercent: float = 0.0
    uptime: float = 0.0
    alive: bool = False


ResourceEventCallback = Callable[[str, dict[str, Any]], None]


class ProcessSupervisor:

    def __init__(
        self,
        limits: ResourceLimits,
        onEvent: ResourceEventCallback | None = None,
    ) -> None:
        self._limits = limits
        self._onEvent = onEvent
        self._process: Process | None = None
        self._startedAt: float = 0.0
        self._monitorThread: threading.Thread | None = None
        self._stopEvent = threading.Event()
        self._lastHeartbeat: float = 0.0

    @property
    def limits(self) -> ResourceLimits:
        return self._limits

    def attach(self, process: Process) -> None:
        self.detach()
        self._process = process
        self._startedAt = time.monotonic()
        self._lastHeartbeat = time.monotonic()
        self._stopEvent.clear()
        self._monitorThread = threading.Thread(
            target=self._monitorLoop,
            name="proc-supervisor",
            daemon=True,
        )
        self._monitorThread.start()
        self._applyOsLimits(process)

    def detach(self) -> None:
        self._stopEvent.set()
        if self._monitorThread is not None:
            self._monitorThread.join(timeout=2)
            self._monitorThread = None
        self._process = None

    def snapshot(self) -> ResourceSnapshot:
        process = self._process
        if process is None or not process.is_alive():
            return ResourceSnapshot(alive=False)
        return self._readProcessStats(process)

    def _monitorLoop(self) -> None:
        while not self._stopEvent.is_set():
            self._stopEvent.wait(timeout=max(0.1, self._limits.idleZombieCheckSeconds))
            if self._stopEvent.is_set():
                break
            process = self._process
            if process is None:
                break
            if not process.is_alive():
                self._emitEvent("process-dead", {
                    "exitcode": getattr(process, "exitcode", None),
                    "uptime": round(time.monotonic() - self._startedAt, 1),
                })
                self._process = None
                break
            self._checkLimits(process)

    def heartbeat(self) -> None:
        self._lastHeartbeat = time.monotonic()

    def isHeartbeatStale(self) -> bool:
        timeout = self._limits.heartbeatTimeoutSeconds
        if timeout <= 0 or self._lastHeartbeat == 0:
            return False
        return (time.monotonic() - self._lastHeartbeat) > timeout

    def _checkLimits(self, process: Process) -> None:
        snap = self._readProcessStats(process)

        if self.isHeartbeatStale():
            self._emitEvent("resource-exceeded", {
                "reason": "heartbeat-stale",
                "sinceHeartbeatSeconds": round(time.monotonic() - self._lastHeartbeat, 1),
                "limit": self._limits.heartbeatTimeoutSeconds,
            })
            self._killProcess(process)
            return

        if snap.memoryMb > self._limits.maxMemoryMb:
            self._emitEvent("resource-exceeded", {
                "reason": "memory",
                "memoryMb": round(snap.memoryMb, 1),
                "limit": self._limits.maxMemoryMb,
            })
            self._killProcess(process)
            return

        if snap.memoryMb > self._limits.maxMemoryMb * 0.9:
            self._emitEvent("resource-warning", {
                "reason": "memory",
                "memoryMb": round(snap.memoryMb, 1),
                "limit": self._limits.maxMemoryMb,
            })

    def _readProcessStats(self, process: Process) -> ResourceSnapshot:
        pid = process.pid
        if pid is None:
            return ResourceSnapshot(alive=False)
        try:
            import psutil
            proc = psutil.Process(pid)
            memInfo = proc.memory_info()
            cpuPercent = proc.cpu_percent(interval=0)
            return ResourceSnapshot(
                memoryMb=memInfo.rss / (1024 * 1024),
                cpuPercent=cpuPercent,
                uptime=time.monotonic() - self._startedAt,
                alive=True,
            )
        except ImportError:
            return self._readProcessStatsFallback(pid)
        except (OSError, ValueError) as exc:
            logger.debug("process stats read failed for pid %s: %s", pid, exc)
            return ResourceSnapshot(
                uptime=time.monotonic() - self._startedAt,
                alive=process.is_alive(),
            )

    def _readProcessStatsFallback(self, pid: int) -> ResourceSnapshot:
        if sys.platform == "win32":
            return self._readProcessStatsWindows(pid)
        return ResourceSnapshot(
            uptime=time.monotonic() - self._startedAt,
            alive=True,
        )

    def _readProcessStatsWindows(self, pid: int) -> ResourceSnapshot:
        try:
            import ctypes
            from ctypes import wintypes

            kernel32 = ctypes.windll.kernel32
            PROCESS_QUERY_INFORMATION = 0x0400
            PROCESS_VM_READ = 0x0010

            handle = kernel32.OpenProcess(
                PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, False, pid,
            )
            if not handle:
                return ResourceSnapshot(alive=False)

            try:

                class PROCESS_MEMORY_COUNTERS(ctypes.Structure):
                    _fields_ = [
                        ("cb", wintypes.DWORD),
                        ("PageFaultCount", wintypes.DWORD),
                        ("PeakWorkingSetSize", ctypes.c_size_t),
                        ("WorkingSetSize", ctypes.c_size_t),
                        ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
                        ("QuotaPagedPoolUsage", ctypes.c_size_t),
                        ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
                        ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                        ("PagefileUsage", ctypes.c_size_t),
                        ("PeakPagefileUsage", ctypes.c_size_t),
                    ]

                counters = PROCESS_MEMORY_COUNTERS()
                counters.cb = ctypes.sizeof(counters)
                psapi = ctypes.windll.psapi
                if psapi.GetProcessMemoryInfo(
                    handle,
                    ctypes.byref(counters),
                    ctypes.sizeof(counters),
                ):
                    return ResourceSnapshot(
                        memoryMb=counters.WorkingSetSize / (1024 * 1024),
                        uptime=time.monotonic() - self._startedAt,
                        alive=True,
                    )
            finally:
                kernel32.CloseHandle(handle)
        except (OSError, ValueError) as exc:
            logger.debug("win32 memory query failed for pid %s: %s", pid, exc)
        return ResourceSnapshot(
            uptime=time.monotonic() - self._startedAt,
            alive=True,
        )

    def _applyOsLimits(self, process: Process) -> None:
        if sys.platform == "win32":
            self._applyWindowsJobLimits(process)

    def _applyWindowsJobLimits(self, process: Process) -> None:
        pid = process.pid
        if pid is None:
            return
        try:
            import ctypes
            from ctypes import wintypes

            kernel32 = ctypes.windll.kernel32

            JOB_OBJECT_LIMIT_PROCESS_MEMORY = 0x00000100
            JobObjectExtendedLimitInformation = 9
            PROCESS_SET_QUOTA = 0x0100
            PROCESS_TERMINATE = 0x0001

            hJob = kernel32.CreateJobObjectW(None, None)
            if not hJob:
                return

            class JOBOBJECT_BASIC_LIMIT_INFORMATION(ctypes.Structure):
                _fields_ = [
                    ("PerProcessUserTimeLimit", ctypes.c_int64),
                    ("PerJobUserTimeLimit", ctypes.c_int64),
                    ("LimitFlags", wintypes.DWORD),
                    ("MinimumWorkingSetSize", ctypes.c_size_t),
                    ("MaximumWorkingSetSize", ctypes.c_size_t),
                    ("ActiveProcessLimit", wintypes.DWORD),
                    ("Affinity", ctypes.POINTER(ctypes.c_ulong)),
                    ("PriorityClass", wintypes.DWORD),
                    ("SchedulingClass", wintypes.DWORD),
                ]

            class IO_COUNTERS(ctypes.Structure):
                _fields_ = [
                    ("ReadOperationCount", ctypes.c_uint64),
                    ("WriteOperationCount", ctypes.c_uint64),
                    ("OtherOperationCount", ctypes.c_uint64),
                    ("ReadTransferCount", ctypes.c_uint64),
                    ("WriteTransferCount", ctypes.c_uint64),
                    ("OtherTransferCount", ctypes.c_uint64),
                ]

            class JOBOBJECT_EXTENDED_LIMIT_INFORMATION(ctypes.Structure):
                _fields_ = [
                    ("BasicLimitInformation", JOBOBJECT_BASIC_LIMIT_INFORMATION),
                    ("IoInfo", IO_COUNTERS),
                    ("ProcessMemoryLimit", ctypes.c_size_t),
                    ("JobMemoryLimit", ctypes.c_size_t),
                    ("PeakProcessMemoryUsed", ctypes.c_size_t),
                    ("PeakJobMemoryUsed", ctypes.c_size_t),
                ]

            extInfo = JOBOBJECT_EXTENDED_LIMIT_INFORMATION()
            extInfo.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_PROCESS_MEMORY
            extInfo.ProcessMemoryLimit = self._limits.maxMemoryMb * 1024 * 1024

            kernel32.SetInformationJobObject(
                hJob,
                JobObjectExtendedLimitInformation,
                ctypes.byref(extInfo),
                ctypes.sizeof(extInfo),
            )

            hProcess = kernel32.OpenProcess(
                PROCESS_SET_QUOTA | PROCESS_TERMINATE, False, pid,
            )
            if hProcess:
                kernel32.AssignProcessToJobObject(hJob, hProcess)
                kernel32.CloseHandle(hProcess)

        except Exception as exc:  # noqa: BLE001 — OS-level setup is best-effort
            logger.debug("Windows job limit setup failed: %s", exc)

    def _killProcess(self, process: Process) -> None:
        try:
            process.terminate()
            process.join(timeout=1)
            if process.is_alive():
                process.kill()
                process.join(timeout=1)
        except Exception as exc:  # noqa: BLE001 — kill must not raise
            logger.warning("Failed to kill supervised process: %s", exc)

    def _emitEvent(self, eventType: str, data: dict[str, Any]) -> None:
        logEvent = logger.debug if eventType == "process-dead" else logger.info
        logEvent("supervisor %s: %s", eventType, data)
        if self._onEvent is not None:
            try:
                self._onEvent(eventType, data)
            except Exception as exc:
                logger.error("supervisor callback failed: %s", exc, exc_info=True)
