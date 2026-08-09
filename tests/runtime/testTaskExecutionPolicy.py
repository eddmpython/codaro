from __future__ import annotations

import asyncio
from pathlib import Path
import sys

import pytest

from codaro.automation.eStop import EmergencyStopActive, getEmergencyStop
from codaro.automation.taskModel import TaskDefinition, TaskStatus
from codaro.automation.taskRunner import TaskRunner
from codaro.automation.taskSafety import confirmTaskSafety
from codaro.document.models import BlockConfig, CodaroDocument, DocumentMetadata
from codaro.document.service import saveDocument
from codaro.system.diagnosticSummary import safeDiagnosticText


ALL_SCOPES = [
    "filesystem.read",
    "filesystem.write",
    "network",
    "process.execute",
]


class _MemoryAudit:
    def __init__(self) -> None:
        self.records: list[dict[str, object]] = []

    def record(self, actionType, source, parameters=None, sessionId=None, success=True, error=None):
        self.records.append({
            "actionType": actionType,
            "source": source,
            "parameters": parameters or {},
            "sessionId": sessionId,
            "success": success,
            "error": error,
        })


def _task(
    workspace: Path,
    code: str,
    *,
    scopes: list[str] | None = None,
    outputContract: dict[str, object] | None = None,
    secretRefs: list[str] | None = None,
    blocks: list[str] | None = None,
) -> TaskDefinition:
    document = CodaroDocument(
        id="task-document",
        title="Task",
        blocks=[
            BlockConfig(id=f"block-{index}", type="code", content=content)
            for index, content in enumerate(blocks or [code], start=1)
        ],
        metadata=DocumentMetadata(sourceFormat="percent"),
    )
    saveDocument(str(workspace / "task.py"), document)
    return TaskDefinition(
        name="Task",
        documentPath="task.py",
        permissionScopes=list(scopes if scopes is not None else ALL_SCOPES),
        outputContract=outputContract,
        secretRefs=list(secretRefs or []),
    )


@pytest.mark.parametrize("operation", ["read", "write"])
def testTaskBrokerBlocksFilesystemOutsideWorkspace(tmp_path: Path, operation: str) -> None:
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    outside = tmp_path / "outside.txt"
    outside.write_text("outside-secret", encoding="utf-8")
    if operation == "read":
        code = f"from pathlib import Path\nprint(Path({str(outside)!r}).read_text(encoding='utf-8'))"
    else:
        code = f"from pathlib import Path\nPath({str(outside)!r}).write_text('changed', encoding='utf-8')"
    task = _task(workspace, code)

    run = asyncio.run(TaskRunner(workspaceRoot=workspace).run(task))

    assert run.status == TaskStatus.FAILED
    assert "outside the workspace" in (run.error or "")
    assert "outside-secret" not in run.output
    if operation == "write":
        assert outside.read_text(encoding="utf-8") == "outside-secret"


def testTaskBrokerBlocksUnapprovedNetworkAndChildProcess(tmp_path: Path) -> None:
    networkTask = _task(
        tmp_path,
        "import socket\nsocket.create_connection(('127.0.0.1', 9), timeout=0.1)",
        scopes=["filesystem.read", "filesystem.write"],
    )
    networkRun = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(networkTask))

    processTask = _task(
        tmp_path,
        f"import subprocess, sys\nsubprocess.run([{sys.executable!r}, '-c', 'print(1)'], check=True)",
        scopes=["filesystem.read", "filesystem.write"],
    )
    processRun = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(processTask))

    assert networkRun.status == TaskStatus.FAILED
    assert "missing scope network" in (networkRun.error or "")
    assert processRun.status == TaskStatus.FAILED
    assert "missing scope process.execute" in (processRun.error or "")


def testTaskBrokerAllowsExplicitEmptyScopeForPureComputation(tmp_path: Path) -> None:
    task = _task(
        tmp_path,
        "answer = 21 * 2\nprint(answer)",
        scopes=[],
        outputContract={
            "schemaVersion": 1,
            "stdoutEquals": "42",
            "requiredVariables": {"answer": "42"},
        },
    )
    task.safetyApproval = confirmTaskSafety(task, confirmation=task.id, workspaceRoot=tmp_path)

    run = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(task))

    assert run.status == TaskStatus.SUCCESS, run.error
    assert run.validated is True
    assert task.safetyApproval["permissionScopes"] == []


def testTaskBrokerBlocksWorkspaceWriteWithoutDeclaredScope(tmp_path: Path) -> None:
    task = _task(
        tmp_path,
        "from pathlib import Path\nPath('undeclared.txt').write_text('blocked', encoding='utf-8')",
        scopes=[],
    )

    run = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(task))

    assert run.status == TaskStatus.FAILED
    assert "missing scope filesystem.write" in (run.error or "")
    assert not (tmp_path / "undeclared.txt").exists()


def testSemanticOutputContractCreatesValidatedCandidateWithSamePolicyHash(tmp_path: Path) -> None:
    task = _task(
        tmp_path,
        "from pathlib import Path\nPath('report.txt').write_text('done', encoding='utf-8')\nprint('READY')",
        scopes=["filesystem.read", "filesystem.write"],
        outputContract={
            "schemaVersion": 1,
            "stdoutContains": ["READY"],
            "artifacts": [{"path": "report.txt", "minBytes": 1}],
        },
    )
    task.safetyApproval = confirmTaskSafety(task, confirmation=task.id, workspaceRoot=tmp_path)

    run = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(task))

    assert run.status == TaskStatus.SUCCESS
    assert run.validated is True
    assert run.operationalCandidate is True
    assert run.enforcementPolicyHash == task.safetyApproval["policyHash"]
    assert run.validationErrors == []
    assert len(run.artifactDescriptors) == 1
    assert run.artifactDescriptors[0]["path"] == "report.txt"


def testExceptionFreeRunFailsDeclaredOutputContract(tmp_path: Path) -> None:
    task = _task(
        tmp_path,
        "print('WRONG')",
        outputContract={"schemaVersion": 1, "stdoutEquals": "EXPECTED"},
    )

    run = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(task))

    assert run.status == TaskStatus.FAILED
    assert run.validated is False
    assert run.operationalCandidate is False
    assert run.validationErrors == ["stdout-equals-mismatch"]


def testSecretCanaryIsRedactedFromPersistenceApiAuditNotificationAndDiagnostic(tmp_path: Path, monkeypatch) -> None:
    canary = "task-secret-canary-123456789"
    monkeypatch.setenv("TASK_SECRET_CANARY", canary)
    audit = _MemoryAudit()
    monkeypatch.setattr("codaro.automation.taskRunner.getAuditTrail", lambda: audit)
    task = _task(
        tmp_path,
        "import os\nsecret_value = os.environ['TASK_SECRET_CANARY']\nprint('prefix:' + secret_value)",
        outputContract={"schemaVersion": 1, "stdoutContains": ["prefix:"]},
        secretRefs=["TASK_SECRET_CANARY"],
    )

    run = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(task))
    serialized = run.serialize()

    assert run.status == TaskStatus.SUCCESS
    assert run.validated is True
    assert canary not in str(serialized)
    assert "[redacted]" in run.output
    assert canary not in str(audit.records)
    assert safeDiagnosticText(f"failure {canary}") == "failure [redacted]"

    from codaro.automation.reportDiff import RunDiff
    from codaro.automation.taskFlow import _taskNotificationMessage

    failed = _task(
        tmp_path,
        "import os\nraise RuntimeError(os.environ['TASK_SECRET_CANARY'])",
        secretRefs=["TASK_SECRET_CANARY"],
    )
    failedRun = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(failed))
    apiPayload = failedRun.serialize()
    message = _taskNotificationMessage(
        failed,
        failedRun,
        RunDiff(
            hasPrevious=True,
            previousStatus="success",
            currentStatus="failed",
            statusChanged=True,
            outputLineDelta=0,
            summary="failed",
        ),
    )

    assert canary not in str(apiPayload)
    assert canary not in message


def testEmergencyStopIsCheckedBetweenTaskBlocks(tmp_path: Path, monkeypatch) -> None:
    task = _task(
        tmp_path,
        "",
        blocks=["first = 1", "second = 2"],
    )
    eStop = getEmergencyStop()
    calls = 0

    def check() -> None:
        nonlocal calls
        calls += 1
        if calls >= 3:
            raise EmergencyStopActive("between blocks")

    monkeypatch.setattr(eStop, "check", check)

    run = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(task))

    assert calls == 3
    assert run.status == TaskStatus.CANCELLED
    assert "between blocks" in (run.error or "")
