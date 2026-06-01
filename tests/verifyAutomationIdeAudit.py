from __future__ import annotations

import json
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
REPORT_PATH = ROOT / "output" / "test-runner" / "automation-ide-audit" / "automation-ide-report.json"
MINIMUM_SCORE = 9.0


@dataclass(frozen=True)
class AutomationRequirement:
    requirementId: str
    requirement: str
    evidenceChecks: tuple[tuple[str, tuple[str, ...]], ...]
    forbiddenChecks: tuple[tuple[str, tuple[str, ...]], ...] = field(default_factory=tuple)

    def evaluate(self) -> dict[str, Any]:
        evidence: list[str] = []
        missing: list[str] = []
        for relPath, needles in self.evidenceChecks:
            found, absent = fileNeedleReport(relPath, needles)
            evidence.extend(found)
            missing.extend(absent)
        for relPath, needles in self.forbiddenChecks:
            absent, present = fileForbiddenNeedleReport(relPath, needles)
            evidence.extend(absent)
            missing.extend(present)
        return {
            "id": self.requirementId,
            "passed": not missing,
            "requirement": self.requirement,
            "evidence": evidence,
            "missing": missing,
        }


AUTOMATION_REQUIREMENTS = (
    AutomationRequirement(
        requirementId="automation-backend-product-boundary",
        requirement="Automation backend exposes task, schedule, webhook, workflow, plan, recording, notification, audit, and policy boundaries.",
        evidenceChecks=(
            ("src/codaro/api/automationRouter.py", (
                "/api/tasks",
                "/api/tasks/{taskId}/run",
                "/api/tasks/{taskId}/schedule",
                "/api/scheduler/status",
                "/api/webhooks/trigger/{taskId}",
                "/api/automation/e-stop",
                "/api/automation/audit",
                "/api/automation/input-policy",
                "/api/automation/recording/start",
                "/api/automation/recording/stop",
                "/api/automation/plan/execute",
                "/api/automation/plan/{planId}/pause",
                "/api/automation/plan/{planId}/resume",
                "/api/automation/channels",
                "/api/automation/notify",
                "/api/workflows",
                "/api/workflows/{workflowId}/run",
            )),
            ("src/codaro/automation/taskRegistry.py", (
                "class TaskRegistry",
                "listTasks",
                "addRun",
                "getRuns",
                "maxRuns = 50",
            )),
            ("src/codaro/automation/workflow.py", (
                "class WorkflowEngine",
                "dependsOn",
                "Dependency",
                "stepResults",
                "getRuns",
            )),
            ("src/codaro/automation/recordingFlow.py", (
                "startAutomationRecordingPayload",
                "stopAutomationRecordingPayload",
                "getAutomationRecordingStatusPayload",
                "RecipeGenerator",
            )),
            ("src/codaro/automation/notificationFlow.py", (
                "listAutomationChannelsPayload",
                "addAutomationChannelPayload",
                "removeAutomationChannelPayload",
                "sendAutomationNotificationPayload",
                "MessageChannel",
            )),
            ("src/codaro/automation/monitoringFlow.py", (
                "automationResourceUsagePayload",
                "automationAuditLogPayload",
                "getAuditTrail",
                "queryFromDisk",
            )),
            ("src/codaro/automation/integrationFlow.py", (
                "listAutomationIntegrationsPayload",
                "configureAutomationIntegrationPayload",
                "runAutomationIntegrationTestPayload",
                "executeAutomationIntegrationPayload",
                "getIntegrationRegistry",
            )),
        ),
    ),
    AutomationRequirement(
        requirementId="task-runner-safety-and-audit",
        requirement="Task execution is guarded by E-Stop and writes taskRun audit records for success, failure, and cancellation.",
        evidenceChecks=(
            ("src/codaro/automation/taskRunner.py", (
                "getEmergencyStop().check()",
                "except EmergencyStopActive as exc",
                "TaskStatus.CANCELLED",
                "getAuditTrail().record(",
                "\"taskRun\"",
                "\"task-runner\"",
                "\"durationMs\": run.durationMs",
                "manager.destroySession(session.sessionId)",
            )),
            ("tests/testAutomation.py", (
                "test_e_stop_cancels_task_before_document_execution",
                "TaskRunner",
                "objective safety check",
                "TaskStatus.CANCELLED",
                "\"taskRun\"",
                "\"cancelled\"",
            )),
            ("src/codaro/automation/eStop.py", (
                "class EmergencyStop",
                "def trigger",
                "def clear",
                "def check",
                "class EmergencyStopActive",
            )),
        ),
    ),
    AutomationRequirement(
        requirementId="automation-loop-durability",
        requirement="Automation loop covers retry, verification, consecutive failure abort, pause/resume/cancel, E-Stop, and audit trail.",
        evidenceChecks=(
            ("src/codaro/automation/loop/automationLoop.py", (
                "maxConsecutiveFailures",
                "getEmergencyStop().check()",
                "audit.record(",
                "\"automationStep\"",
                "asyncio.wait_for",
                "Verification failed",
                "def pause",
                "def resume",
                "def cancel",
            )),
            ("tests/testAutomationLoop.py", (
                "testLoopRetryOnFailure",
                "testLoopAbortOnConsecutiveFailures",
                "testLoopVerification",
                "testLoopPauseResume",
                "testLoopCancel",
            )),
        ),
    ),
    AutomationRequirement(
        requirementId="automation-frontend-surface",
        requirement="Frontend automation surface shows templates, custom tasks, schedules, audit count, E-Stop, and run affordances.",
        evidenceChecks=(
            ("editor/src/components/automation/automationSurface.tsx", (
                "codaroAutomationTemplates",
                "data-automation-loop=\"second-loop\"",
                "data-automation-source=\"validated-cell-recipe\"",
                "data-automation-artifact=\"validated-cell-recipe\"",
                "automation.codaro.title",
                "automation.codaro.description",
                "automation.custom.title",
                "automation.custom.description",
                "automation.empty.detail",
                "automation.tasks.title",
                "automation.metric.automations",
                "automation.metric.scheduled",
                "automation.metric.status",
                "automation.eStop.trigger",
                "automation.eStop.clear",
                "automation.recentAudit",
                "onRunTask(task)",
                "disabled={!task.enabled || eStop.active}",
                "automation.task.standard.title",
            )),
            ("editor/src/lib/localeCopy.ts", (
                "자동화 루틴",
                "Codaro 자동화",
                "나만의 자동화",
                "검증된 셀과 recipe를 태스크로 키울 때",
                "대화, 현재 학습, 노트북에서 검증한 자동화 셀과 스크립트",
                "Reference templates for turning validated cells and recipes into tasks.",
                "긴급 정지",
                "태스크 기준",
                "Automation Routines",
            )),
            ("editor/src/App.tsx", (
                "useAutomationState",
                "automationSection",
                "auditCount",
                "onRunTask={runTask}",
                "onToggleEStop={toggleEStop}",
            )),
        ),
        forbiddenChecks=(
            ("editor/src/lib/localeCopy.ts", (
                "바로 시작할 수 있는 자동화 출발점",
                "Ready-to-use starting points",
            )),
        ),
    ),
    AutomationRequirement(
        requirementId="automation-api-state-snapshot",
        requirement="Frontend automation state loads task, scheduler, E-Stop, and audit snapshot and refreshes after actions.",
        evidenceChecks=(
            ("editor/src/lib/api.ts", (
                "tasks: () => requestJson<TaskListPayload>(\"/api/tasks\")",
                "runTask: (taskId: string)",
                "schedulerStatus: () => requestJson<SchedulerStatus>(\"/api/scheduler/status\")",
                "eStop: () => requestJson<EStopStatus>(\"/api/automation/e-stop\")",
                "triggerEStop",
                "clearEStop",
                "audit: () => requestJson<AuditPayload>(\"/api/automation/audit?limit=8\")",
            )),
            ("editor/src/lib/automationState.ts", (
                "Promise.all",
                "optional(codaroApi.tasks, fallbackTasks)",
                "optional(codaroApi.schedulerStatus, fallbackScheduler)",
                "optional(codaroApi.eStop, fallbackEStop)",
                "optional(codaroApi.audit, { entries: [], count: 0 })",
                "toggleAutomationStop",
                "runAutomationTask",
                "refresh: true",
            )),
            ("editor/src/hooks/useAutomationState.ts", (
                "refreshAutomation",
                "toggleEStop",
                "runTask",
                "setAuditCount",
                "onNotice(result.notice)",
            )),
        ),
    ),
    AutomationRequirement(
        requirementId="automation-tool-and-input-policy",
        requirement="Automation tools and input policy cover guarded browser/OS interaction primitives.",
        evidenceChecks=(
            ("tests/testAutomationTools.py", (
                "testClickElementToolRegistered",
                "testTypeTextToolRegistered",
                "testPressHotkeyToolRegistered",
                "testFindElementToolRegistered",
                "testWaitForToolRegistered",
                "testAllToolsHaveRequiredFields",
            )),
            ("src/codaro/ai/toolHandlers/automation.py", (
                "clickElement",
                "typeText",
                "pressHotkey",
                "findElement",
                "waitFor",
            )),
            ("src/codaro/automation/input/inputGuard.py", (
                "maxActionsPerSecond",
                "maxActionsPerMinute",
                "humanDelay",
                "allowedScreenRegion",
                "getEmergencyStop().check()",
            )),
            ("src/codaro/api/automationRouter.py", (
                "/api/automation/input-policy",
            )),
            ("src/codaro/automation/inputPolicyFlow.py", (
                "maxActionsPerSecond",
                "maxActionsPerMinute",
                "humanDelay",
                "allowedScreenRegion",
                "Region(",
                "AutomationInputPolicyFlowError",
            )),
        ),
    ),
    AutomationRequirement(
        requirementId="automation-authoring-loop",
        requirement="Automation authoring is a first-class loop from cells to recipe, dry-run, validation, and task registration.",
        evidenceChecks=(
            ("docs/skills/architecture/automation-authoring-loop.md", (
                "read-cells",
                "write-automation-recipe",
                "write-cell",
                "packages-check",
                "cell-call",
                "create-automation-task",
                "dry-run",
            )),
            ("src/codaro/ai/toolDefinitions/automation.py", (
                "TOOL_WRITE_AUTOMATION_RECIPE",
                "TOOL_CREATE_AUTOMATION_TASK",
                "write-automation-recipe",
                "create-automation-task",
            )),
            ("src/codaro/ai/toolHandlers/automation.py", (
                "_handle_writeAutomationRecipe",
                "_handle_createAutomationTask",
                "automationAuthoring",
            )),
            ("src/codaro/automation/recipeAuthoring.py", (
                "class AutomationRecipeDraft",
                "class AutomationTaskDraft",
                "buildAutomationRecipeDraft",
                "buildAutomationTaskDraft",
                "DRY_RUN =",
                "automationRecipeSlug",
            )),
            ("src/codaro/ai/toolManifest.py", (
                "write-automation-recipe",
                "create-automation-task",
                "automation-recipe",
                "task-registry",
            )),
            ("src/codaro/ai/teacher/skillRegistry.py", (
                "automation-authoring",
                "write-automation-recipe",
                "create-automation-task",
                "percent-format recipe",
                "dry-run",
            )),
            ("src/codaro/ai/conversation.py", (
                "write-automation-recipe",
                "create-automation-task",
                "dry-run",
                "packages-check",
                "cell-call",
            )),
            ("src/codaro/ai/teacher/toolLifecycle.py", (
                "자동화 recipe 작성",
                "자동화 태스크 등록",
                "dry-run 우선",
                "write-automation-recipe",
                "create-automation-task",
            )),
            ("editor/src/lib/workLoop.ts", (
                "자동화 recipe 작성",
                "자동화 태스크 등록",
                "dry-run 우선",
                "write-automation-recipe",
                "create-automation-task",
            )),
            ("tests/testAiTools.py", (
                "test_write_automation_recipe_creates_file_and_automation_cell",
                "test_create_automation_task_registers_dry_run_recipe",
                "test_create_automation_task_rejects_missing_recipe",
            )),
            ("tests/verifyTeacherGoldenE2e.py", (
                "runAutomationAuthoringCase",
                "automation-authoring-second-loop",
                "provider did not receive successful cell-call result before task registration",
                "task registration did not preserve dry-run recipe validation",
            )),
            ("tests/testTeacherArchitecture.py", (
                "testAutomationRolePromptPromotesRecipeAuthoringLoop",
                "testToolWorkDetailSummarizesAutomationAuthoring",
                "automationTools[\"write-automation-recipe\"]",
                "schedulingTools[\"create-automation-task\"]",
            )),
            ("tests/verifyAssistantWorkloopContract.py", (
                "trace-automation-authoring",
                "자동화 recipe 작성",
                "자동화 태스크 등록",
            )),
            ("tests/testAutomationAuthoring.py", (
                "testBuildAutomationRecipeDraftCreatesPercentFormatRecipe",
                "testBuildAutomationTaskDraftNormalizesAndValidatesInputs",
                "testBuildAutomationTaskDraftRejectsInvalidSchedule",
            )),
        ),
    ),
    AutomationRequirement(
        requirementId="automation-docs-and-objective-scorecard",
        requirement="Automation product requirements are documented and tied to objective 9+ scoring.",
        evidenceChecks=(
            ("docs/skills/identity/automation-tasks-reports.md", (
                "스케줄",
                "웹훅",
                "워크플로우",
                "감사 로그",
                "비상 정지(E-Stop)",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "자동화 IDE 품질",
                "automation-ide-audit",
                "task/schedule/webhook/workflow/E-Stop/audit",
                "taskRun",
                "output/test-runner/automation-ide-audit/automation-ide-report.json",
            )),
            ("docs/skills/architecture/ssot-map.md", (
                "automation state",
                "automation state hook",
                "automation handlers",
            )),
        ),
    ),
)


def main() -> int:
    results = tuple(requirement.evaluate() for requirement in AUTOMATION_REQUIREMENTS)
    payload = buildReport(results)
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if payload["requirementFailures"]:
        print("FAIL: automation IDE audit requirements are incomplete", file=sys.stderr)
        return 1
    print(f"ok: automation IDE audit score {payload['score']}/{payload['maxScore']}")
    return 0


def buildReport(results: tuple[dict[str, Any], ...]) -> dict[str, Any]:
    passed = sum(1 for result in results if result["passed"])
    score = round((passed / len(results)) * 10, 2) if results else 0
    failures = [result for result in results if not result["passed"]]
    if score < MINIMUM_SCORE and not failures:
        failures.append({
            "id": "minimum-score",
            "passed": False,
            "requirement": f"automation IDE score must be at least {MINIMUM_SCORE}",
            "evidence": [],
            "missing": [f"score {score} < {MINIMUM_SCORE}"],
        })
    return {
        "gate": "automation-ide-audit",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "score": score,
        "maxScore": 10,
        "minimumScore": MINIMUM_SCORE,
        "requiredScore": MINIMUM_SCORE,
        "requirementFailures": failures,
        "requirements": list(results),
        "gitHead": currentGitHead(),
        "startedAt": utcTimestamp(),
        "completedAt": utcTimestamp(),
        "reportPath": displayPath(REPORT_PATH),
    }


def fileNeedleReport(relPath: str, needles: tuple[str, ...]) -> tuple[list[str], list[str]]:
    path = ROOT / relPath
    if not path.is_file():
        return [], [f"{relPath}: missing file"]
    text = path.read_text(encoding="utf-8")
    evidence: list[str] = []
    missing: list[str] = []
    for needle in needles:
        if needle in text:
            evidence.append(f"{relPath}: {needle}")
        else:
            missing.append(f"{relPath}: missing {needle}")
    return evidence, missing


def fileForbiddenNeedleReport(relPath: str, needles: tuple[str, ...]) -> tuple[list[str], list[str]]:
    path = ROOT / relPath
    if not path.is_file():
        return [], [f"{relPath}: missing file"]
    text = path.read_text(encoding="utf-8")
    evidence: list[str] = []
    failures: list[str] = []
    for needle in needles:
        if needle in text:
            failures.append(f"{relPath}: forbidden {needle}")
        else:
            evidence.append(f"{relPath}: absent forbidden {needle}")
    return evidence, failures


def currentGitHead() -> str | None:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip() if result.returncode == 0 else None


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def displayPath(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


if __name__ == "__main__":
    raise SystemExit(main())
