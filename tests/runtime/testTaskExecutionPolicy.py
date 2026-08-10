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


def testProofIsolationBlocksChildProcessEvenWhenScopeIsApproved(tmp_path: Path) -> None:
    outside = tmp_path.parent / "outside-child.txt"
    outside.write_text("outside-secret", encoding="utf-8")
    task = _task(
        tmp_path,
        (
            "import subprocess, sys\n"
            f"subprocess.run([sys.executable, '-c', {f'from pathlib import Path; print(Path({str(outside)!r}).read_text())'!r}], check=True)"
        ),
        scopes=ALL_SCOPES,
    )

    run = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(task))

    assert run.status == TaskStatus.FAILED
    assert "child processes are disabled by the isolation profile" in (run.error or "")
    assert "outside-secret" not in run.output
    assert run.operationalCandidate is False


def testProofIsolationBlocksCtypesNativeInterop(tmp_path: Path) -> None:
    task = _task(
        tmp_path,
        "import ctypes\nctypes.CDLL('codaro-native-library-probe')",
        scopes=ALL_SCOPES,
    )

    run = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(task))

    assert run.status == TaskStatus.FAILED
    assert "native interop is disabled by the isolation profile" in (run.error or "")
    assert run.operationalCandidate is False


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


def testTaskWorkerExposesOnlyDeclaredSecretAndMinimumRuntimeEnvironment(
    tmp_path: Path,
    monkeypatch,
) -> None:
    undeclared = "undeclared-environment-canary-987654321"
    declared = "declared-environment-secret-123456789"
    monkeypatch.setenv("UNDECLARED_TASK_CANARY", undeclared)
    monkeypatch.setenv("DECLARED_TASK_SECRET", declared)
    task = _task(
        tmp_path,
        (
            "import os\n"
            "undeclared_value = os.environ.get('UNDECLARED_TASK_CANARY', 'missing')\n"
            "declared_value = os.environ['DECLARED_TASK_SECRET']\n"
            "environment_keys = sorted(os.environ)\n"
            "print(undeclared_value, declared_value)"
        ),
        scopes=[],
        outputContract={
            "schemaVersion": 1,
            "stdoutContains": ["missing"],
            "requiredVariables": {"undeclared_value": "'missing'"},
        },
        secretRefs=["DECLARED_TASK_SECRET"],
    )

    run = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(task))

    assert run.status == TaskStatus.SUCCESS, run.error
    assert run.validated is True
    assert undeclared not in str(run.serialize())
    assert declared not in str(run.serialize())
    assert "[redacted]" in run.output
    assert "UNDECLARED_TASK_CANARY" not in run.variables["environment_keys"]
    assert "DECLARED_TASK_SECRET" in run.variables["environment_keys"]


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
    assert run.isolationProfile == "codaro-local-restricted-v1"
    assert run.isolationPolicyHash is not None
    assert run.isolationTerminationStatus == "destroyed"
    assert run.isolationProofEligible is True
    assert run.validationErrors == []
    assert len(run.artifactDescriptors) == 1
    assert run.artifactDescriptors[0]["path"] == "report.txt"
    assert run.artifactDescriptors[0]["origin"] == "created"


def testUnchangedPreexistingArtifactCannotBecomeFreshOperationalEvidence(tmp_path: Path) -> None:
    (tmp_path / "report.json").write_text('{"count": 7}', encoding="utf-8")
    task = _task(
        tmp_path,
        "print('execution completed without writing the artifact')",
        scopes=["filesystem.read", "filesystem.write"],
        outputContract={
            "schemaVersion": 1,
            "artifacts": [{
                "path": "report.json",
                "minBytes": 2,
                "jsonSchema": {
                    "requiredFields": ["count"],
                    "fieldTypes": {"count": "integer"},
                },
            }],
        },
    )
    task.safetyApproval = confirmTaskSafety(task, confirmation=task.id, workspaceRoot=tmp_path)

    run = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(task))

    assert run.executionStatus == "success"
    assert run.semanticStatus == "contract-failed"
    assert run.status == TaskStatus.FAILED
    assert run.validationErrors == ["artifact-not-fresh:report.json"]
    assert run.artifactDescriptors == []
    assert run.operationalCandidate is False


def testSuccessfulExecutionWithoutContractRemainsSemanticallyUnchecked(tmp_path: Path) -> None:
    task = _task(tmp_path, "print('done')", scopes=[])

    run = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(task))

    assert run.status == TaskStatus.SUCCESS
    assert run.executionStatus == "success"
    assert run.semanticStatus == "not-checked"
    assert run.proofStatus == "semantic-not-checked"
    assert run.validated is False


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


def testSecretBearingArtifactCannotBecomeOperationalProof(tmp_path: Path, monkeypatch) -> None:
    canary = "artifact-secret-canary-123456789"
    monkeypatch.setenv("TASK_ARTIFACT_SECRET", canary)
    task = _task(
        tmp_path,
        (
            "import os\n"
            "from pathlib import Path\n"
            "Path('secret-report.txt').write_text(os.environ['TASK_ARTIFACT_SECRET'], encoding='utf-8')"
        ),
        scopes=["filesystem.read", "filesystem.write"],
        outputContract={
            "schemaVersion": 1,
            "artifacts": [{"path": "secret-report.txt", "minBytes": 1}],
        },
        secretRefs=["TASK_ARTIFACT_SECRET"],
    )
    task.safetyApproval = confirmTaskSafety(task, confirmation=task.id, workspaceRoot=tmp_path)

    run = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(task))

    assert run.status == TaskStatus.FAILED
    assert run.validationErrors == ["artifact-secret-detected:secret-report.txt"]
    assert run.artifactDescriptors == []
    assert run.operationalCandidate is False
    assert canary not in str(run.serialize())


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


def testEmergencyStopDestroysRunningSingleBlockBeforeLaterWrite(tmp_path: Path) -> None:
    task = _task(
        tmp_path,
        (
            "import time\n"
            "from pathlib import Path\n"
            "time.sleep(10)\n"
            "Path('after-stop.txt').write_text('should-not-exist', encoding='utf-8')"
        ),
        scopes=["filesystem.read", "filesystem.write"],
    )
    eStop = getEmergencyStop()
    if eStop.active:
        eStop.clear()

    async def runAndStop():
        pending = asyncio.create_task(TaskRunner(workspaceRoot=tmp_path).run(task))
        for _ in range(250):
            if eStop.activeRunCount == 1:
                break
            await asyncio.sleep(0.02)
        assert eStop.activeRunCount == 1
        eStop.trigger("running-single-block")
        return await asyncio.wait_for(pending, timeout=5)

    try:
        run = asyncio.run(runAndStop())
    finally:
        if eStop.active:
            eStop.clear()

    assert run.status == TaskStatus.CANCELLED
    assert run.validationErrors == ["emergency-stop"]
    assert run.isolationTerminationStatus == "destroyed"
    assert not (tmp_path / "after-stop.txt").exists()
    assert eStop.activeRunCount == 0


def testEmergencyStopBetweenSessionBindAndFirstExecuteCannotRestartWorker(
    tmp_path: Path,
    monkeypatch,
) -> None:
    task = _task(
        tmp_path,
        "from pathlib import Path\nPath('race-write.txt').write_text('blocked', encoding='utf-8')",
        scopes=["filesystem.read", "filesystem.write"],
    )
    eStop = getEmergencyStop()
    if eStop.active:
        eStop.clear()

    async def triggerBeforeFirstExecute(
        document,
        *,
        manager,
        onSessionCreated,
        **_kwargs,
    ):
        session = manager.createSession()
        try:
            onSessionCreated(session)
            eStop.trigger("session-bind-race")
            await session.execute(document.blocks[0].content, blockId=document.blocks[0].id)
        finally:
            manager.destroySession(session.sessionId)

    monkeypatch.setattr(
        "codaro.kernel.documentExecution.captureDocument",
        triggerBeforeFirstExecute,
    )
    try:
        run = asyncio.run(TaskRunner(workspaceRoot=tmp_path).run(task))
    finally:
        if eStop.active:
            eStop.clear()

    assert run.status == TaskStatus.CANCELLED
    assert run.validationErrors == ["emergency-stop"]
    assert run.isolationTerminationStatus == "destroyed"
    assert not (tmp_path / "race-write.txt").exists()
    assert eStop.activeRunCount == 0
