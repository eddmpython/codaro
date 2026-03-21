from __future__ import annotations

import asyncio
import json
import tempfile
from pathlib import Path

import pytest

from codaro.automation.taskModel import TaskDefinition, TaskRun, TaskStatus
from codaro.automation.taskRegistry import TaskRegistry
from codaro.automation.scheduler import parseScheduleSeconds, TaskScheduler
from codaro.automation.workflow import Workflow, WorkflowStep, WorkflowEngine


class TestTaskDefinition:
    def test_create_default(self):
        task = TaskDefinition()
        assert task.id.startswith("task-")
        assert task.name == ""
        assert task.enabled is True
        assert task.schedule is None

    def test_serialize(self):
        task = TaskDefinition(name="Test", documentPath="test.py")
        data = task.serialize()
        assert data["name"] == "Test"
        assert data["documentPath"] == "test.py"
        assert data["enabled"] is True

    def test_task_run_serialize(self):
        run = TaskRun(taskId="task-123", status=TaskStatus.SUCCESS, output="hello")
        data = run.serialize()
        assert data["taskId"] == "task-123"
        assert data["status"] == "success"
        assert data["output"] == "hello"

    def test_task_status_values(self):
        assert TaskStatus.PENDING.value == "pending"
        assert TaskStatus.RUNNING.value == "running"
        assert TaskStatus.SUCCESS.value == "success"
        assert TaskStatus.FAILED.value == "failed"
        assert TaskStatus.CANCELLED.value == "cancelled"


class TestTaskRegistry:
    def _makeRegistry(self, tmpdir):
        return TaskRegistry(storagePath=Path(tmpdir) / "tasks")

    def test_create_task(self, tmp_path):
        registry = self._makeRegistry(tmp_path)
        task = registry.create(name="My Task", documentPath="doc.py")
        assert task.name == "My Task"
        assert task.documentPath == "doc.py"
        assert registry.get(task.id) is task

    def test_list_tasks(self, tmp_path):
        registry = self._makeRegistry(tmp_path)
        registry.create(name="A", documentPath="a.py")
        registry.create(name="B", documentPath="b.py")
        assert len(registry.listTasks()) == 2

    def test_update_task(self, tmp_path):
        registry = self._makeRegistry(tmp_path)
        task = registry.create(name="Old", documentPath="doc.py")
        updated = registry.update(task.id, name="New")
        assert updated is not None
        assert updated.name == "New"

    def test_update_nonexistent(self, tmp_path):
        registry = self._makeRegistry(tmp_path)
        assert registry.update("nonexistent", name="X") is None

    def test_delete_task(self, tmp_path):
        registry = self._makeRegistry(tmp_path)
        task = registry.create(name="Del", documentPath="doc.py")
        assert registry.delete(task.id) is True
        assert registry.get(task.id) is None

    def test_delete_nonexistent(self, tmp_path):
        registry = self._makeRegistry(tmp_path)
        assert registry.delete("nonexistent") is False

    def test_persistence(self, tmp_path):
        storagePath = tmp_path / "tasks"
        registry1 = TaskRegistry(storagePath=storagePath)
        task = registry1.create(name="Persist", documentPath="p.py")
        taskId = task.id

        registry2 = TaskRegistry(storagePath=storagePath)
        loaded = registry2.get(taskId)
        assert loaded is not None
        assert loaded.name == "Persist"

    def test_add_and_get_runs(self, tmp_path):
        registry = self._makeRegistry(tmp_path)
        task = registry.create(name="R", documentPath="r.py")

        run1 = TaskRun(taskId=task.id, status=TaskStatus.SUCCESS, output="out1")
        run2 = TaskRun(taskId=task.id, status=TaskStatus.FAILED, error="err")
        registry.addRun(run1)
        registry.addRun(run2)

        runs = registry.getRuns(task.id)
        assert len(runs) == 2

    def test_get_last_run(self, tmp_path):
        registry = self._makeRegistry(tmp_path)
        task = registry.create(name="L", documentPath="l.py")
        assert registry.getLastRun(task.id) is None

        run = TaskRun(taskId=task.id, status=TaskStatus.SUCCESS)
        registry.addRun(run)
        assert registry.getLastRun(task.id) is run

    def test_run_limit(self, tmp_path):
        registry = self._makeRegistry(tmp_path)
        task = registry.create(name="Lim", documentPath="lim.py")
        for i in range(60):
            registry.addRun(TaskRun(taskId=task.id, status=TaskStatus.SUCCESS, output=str(i)))
        assert len(registry.getRuns(task.id, limit=100)) == 50


class TestScheduler:
    def test_parse_presets(self):
        assert parseScheduleSeconds("@every_1m") == 60
        assert parseScheduleSeconds("@every_5m") == 300
        assert parseScheduleSeconds("@daily") == 86400

    def test_parse_custom(self):
        assert parseScheduleSeconds("@every_30s") == 30
        assert parseScheduleSeconds("@every_2h") == 7200
        assert parseScheduleSeconds("@every_10m") == 600

    def test_parse_invalid(self):
        assert parseScheduleSeconds("invalid") is None
        assert parseScheduleSeconds("0 * * * *") is None

    def test_schedule_and_cancel(self):
        async def _test():
            scheduler = TaskScheduler()

            async def callback():
                pass

            result = scheduler.schedule("t1", "@every_1m", callback)
            assert result is True
            assert scheduler.isScheduled("t1")
            assert scheduler.jobCount == 1

            scheduler.cancel("t1")
            assert not scheduler.isScheduled("t1")
            assert scheduler.jobCount == 0

        asyncio.run(_test())

    def test_cancel_nonexistent(self):
        scheduler = TaskScheduler()
        assert scheduler.cancel("nonexistent") is False

    def test_cancel_all(self):
        async def _test():
            scheduler = TaskScheduler()

            async def noop():
                pass

            scheduler.schedule("a", "@every_1m", noop)
            scheduler.schedule("b", "@every_5m", noop)
            count = scheduler.cancelAll()
            assert count == 2
            assert scheduler.jobCount == 0

        asyncio.run(_test())

    def test_invalid_schedule_returns_false(self):
        async def _test():
            scheduler = TaskScheduler()

            async def noop():
                pass

            assert scheduler.schedule("t1", "invalid", noop) is False

        asyncio.run(_test())

    def test_list_scheduled(self):
        async def _test():
            scheduler = TaskScheduler()

            async def noop():
                pass

            scheduler.schedule("x", "@every_1m", noop)
            scheduler.schedule("y", "@every_5m", noop)
            listed = scheduler.listScheduled()
            assert set(listed) == {"x", "y"}
            scheduler.cancelAll()

        asyncio.run(_test())


class TestWorkflow:

    def test_create_workflow(self):
        engine = WorkflowEngine()
        wf = engine.create(
            name="Test WF",
            steps=[{"taskId": "t1"}, {"taskId": "t2", "dependsOn": ["t1"]}],
        )
        assert wf.name == "Test WF"
        assert len(wf.steps) == 2
        assert wf.steps[1].dependsOn == ["t1"]

    def test_list_and_delete(self):
        engine = WorkflowEngine()
        wf = engine.create(name="WF1", steps=[{"taskId": "t1"}])
        assert len(engine.listWorkflows()) == 1
        assert engine.delete(wf.id)
        assert len(engine.listWorkflows()) == 0

    def test_delete_nonexistent(self):
        engine = WorkflowEngine()
        assert engine.delete("nonexistent") is False

    def test_serialize(self):
        engine = WorkflowEngine()
        wf = engine.create(name="S", steps=[{"taskId": "x"}])
        data = wf.serialize()
        assert data["name"] == "S"
        assert len(data["steps"]) == 1
        assert data["steps"][0]["taskId"] == "x"
