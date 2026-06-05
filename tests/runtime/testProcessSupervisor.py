from __future__ import annotations

import pytest
import codaro.runtime.processSupervisor as processSupervisorModule
from codaro.runtime.processSupervisor import ProcessSupervisor, ResourceLimits, ResourceSnapshot


class TestResourceLimits:

    def test_defaultValues(self):
        limits = ResourceLimits()
        assert limits.maxMemoryMb == 512
        assert limits.maxCpuPercent == 80
        assert limits.maxExecutionSeconds == 300
        assert limits.maxChildProcesses == 3

    def test_customValues(self):
        limits = ResourceLimits(maxMemoryMb=256, maxCpuPercent=50, maxExecutionSeconds=60)
        assert limits.maxMemoryMb == 256
        assert limits.maxCpuPercent == 50
        assert limits.maxExecutionSeconds == 60


class TestResourceSnapshot:

    def test_defaultSnapshot(self):
        snap = ResourceSnapshot()
        assert snap.memoryMb == 0.0
        assert snap.cpuPercent == 0.0
        assert snap.alive is False

    def test_aliveSnapshot(self):
        snap = ResourceSnapshot(memoryMb=100.5, cpuPercent=25.0, uptime=10.0, alive=True)
        assert snap.alive is True
        assert snap.memoryMb == 100.5


class TestProcessSupervisor:

    def test_snapshotWithoutProcess(self):
        supervisor = ProcessSupervisor(ResourceLimits())
        snap = supervisor.snapshot()
        assert snap.alive is False

    def test_detachWithoutAttach(self):
        supervisor = ProcessSupervisor(ResourceLimits())
        supervisor.detach()

    def test_limitsProperty(self):
        limits = ResourceLimits(maxMemoryMb=128)
        supervisor = ProcessSupervisor(limits)
        assert supervisor.limits.maxMemoryMb == 128

    def test_eventCallbackOnExceed(self):
        events = []

        def onEvent(eventType, data):
            events.append((eventType, data))

        supervisor = ProcessSupervisor(
            ResourceLimits(maxExecutionSeconds=0),
            onEvent=onEvent,
        )
        assert supervisor.limits.maxExecutionSeconds == 0

    def test_processDeadEventUsesDebugLogLevel(self, monkeypatch):
        calls = []

        def fakeDebug(*args, **kwargs):
            calls.append(("debug", args, kwargs))

        def fakeInfo(*args, **kwargs):
            calls.append(("info", args, kwargs))

        monkeypatch.setattr(processSupervisorModule.logger, "debug", fakeDebug)
        monkeypatch.setattr(processSupervisorModule.logger, "info", fakeInfo)
        supervisor = ProcessSupervisor(ResourceLimits())

        supervisor._emitEvent("process-dead", {"exitcode": 0})

        assert [call[0] for call in calls] == ["debug"]

    def test_resourceEventsUseInfoLogLevel(self, monkeypatch):
        calls = []

        def fakeDebug(*args, **kwargs):
            calls.append(("debug", args, kwargs))

        def fakeInfo(*args, **kwargs):
            calls.append(("info", args, kwargs))

        monkeypatch.setattr(processSupervisorModule.logger, "debug", fakeDebug)
        monkeypatch.setattr(processSupervisorModule.logger, "info", fakeInfo)
        supervisor = ProcessSupervisor(ResourceLimits())

        supervisor._emitEvent("resource-exceeded", {"reason": "timeout"})

        assert [call[0] for call in calls] == ["info"]


class TestLocalEngineIntegration:

    def test_engineHasResourceUsage(self):
        from codaro.runtime.localEngine import LocalEngine
        engine = LocalEngine(workspaceRoot=".")
        snap = engine.getResourceUsage()
        assert isinstance(snap, ResourceSnapshot)
        engine.dispose()

    def test_engineWithCustomLimits(self):
        from codaro.runtime.localEngine import LocalEngine
        limits = ResourceLimits(maxMemoryMb=256)
        engine = LocalEngine(workspaceRoot=".", resourceLimits=limits)
        assert engine._resourceLimits.maxMemoryMb == 256
        engine.dispose()

    def test_interruptReturnsResult(self):
        from codaro.runtime.localEngine import LocalEngine
        from codaro.runtime.executionEngine import InterruptResult
        engine = LocalEngine(workspaceRoot=".")
        result = engine.interrupt()
        assert isinstance(result, InterruptResult)
        assert result.interrupted is False
        assert result.appliedMode == "none"
        engine.dispose()
