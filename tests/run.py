from __future__ import annotations

import argparse
from datetime import UTC, datetime
import json
import os
import re
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GATE_DOC = ROOT / "docs" / "skills" / "ops" / "foundation" / "testing-and-gates.md"
CI_WORKFLOW = ROOT / ".github" / "workflows" / "ci.yml"
GATE_WORK_ROOT = ROOT / "output" / "test-runner"
GATE_ARTIFACTS: dict[str, tuple[str, ...]] = {
    "ai-live-smoke": ("output/test-runner/ai-live-smoke/live-smoke-report.json",),
    "automation-ide-audit": ("output/test-runner/automation-ide-audit/automation-ide-report.json",),
    "curriculum-quality-matrix": (
        "output/test-runner/curriculum-quality-matrix/curriculum-quality-report.json",
        "output/test-runner/curriculum-quality-matrix/curriculum-flow-quality-report.json",
        "output/test-runner/curriculum-workflow-architecture/curriculum-workflow-architecture-report.json",
    ),
    "curriculum-top-tier-audit": ("output/test-runner/curriculum-top-tier-audit/curriculum-top-tier-report.json",),
    "curriculum-weakness-audit": ("output/test-runner/curriculum-weakness-audit/curriculum-weakness-report.json",),
    "diagnostic-summary-contract": ("output/test-runner/diagnostic-summary-contract/diagnostic-summary-report.json",),
    "dogfood-alpha-audit": ("output/test-runner/dogfood-alpha-audit/dogfood-alpha-report.json",),
    "frontend-performance-budget": ("output/test-runner/frontend-performance-budget/performance-report.json",),
    "install-launcher-smoke": ("output/test-runner/install-launcher-smoke/install-launcher-report.json",),
    "onboarding-browser": ("output/test-runner/onboarding-browser/onboarding-report.json",),
    "provider-settings-browser": ("output/test-runner/provider-settings-browser/provider-settings-report.json",),
    "playwright-curriculum-runtime": (
        "output/test-runner/playwright-curriculum-runtime/playwright-curriculum-runtime-report.json",
    ),
    "runtime-recovery-browser": ("output/test-runner/runtime-recovery-browser/runtime-recovery-report.json",),
    "quality-cycle": ("output/test-runner/quality-cycle/sequence-summary.json",),
    "objective-nineplus-audit": ("output/test-runner/objective-nineplus-audit/objective-nineplus-report.json",),
    "public-readiness-audit": ("output/test-runner/public-readiness-audit/public-readiness-report.json",),
    "preflight": ("output/test-runner/preflight/sequence-summary.json",),
}


@dataclass(frozen=True)
class GateCommand:
    args: tuple[str, ...]
    cwd: str = "."
    timeoutSeconds: int = 900


@dataclass(frozen=True)
class Gate:
    tier: str
    description: str
    commands: tuple[GateCommand, ...]
    blocking: bool = True
    ci_required: bool = True
    softExitCodes: tuple[int, ...] = ()


def command(args: tuple[str, ...], cwd: str = ".", timeoutSeconds: int = 900) -> GateCommand:
    return GateCommand(args=args, cwd=cwd, timeoutSeconds=timeoutSeconds)


GATES: dict[str, Gate] = {
    "docs": Gate(
        tier="fast",
        description="운영 문서 포인터와 gate 정의가 현재 저장소 구조와 맞는지 검사한다.",
        commands=(
            command(("uv", "run", "python", "-X", "utf8", "docs/skills/ops/tools/syncAgentsMd.py", "--check")),
            command(("uv", "run", "python", "-X", "utf8", "tests/run.py", "audit-self")),
        ),
    ),
    "root-clean": Gate(
        tier="fast",
        description="저장소 루트에 로컬 실습 파일, 로그, 임시 산출물이 남지 않았는지 검사한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyRootClean.py")),),
    ),
    "backend": Gate(
        tier="fast",
        description="Python backend 전체 테스트를 실행한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "-m", "pytest", "tests/", "-q", "--tb=short")),),
    ),
    "widget-bridge": Gate(
        tier="fast",
        description="Python ui descriptor + 콜백 registry + traceback parser + widget TS 타입 동기 + React round-trip + chromium E2E.",
        commands=(
            command(("uv", "run", "python", "-X", "utf8", "tests/testWidgetBridge.py")),
            command(("uv", "run", "python", "-X", "utf8", "tests/testTracebackParser.py")),
            command(("uv", "run", "python", "-X", "utf8", "docs/skills/ops/tools/genWidgetTypes.py", "--check")),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyWidgetBridgeRoundTrip.py")),
            command(("uv", "run", "--with", "playwright", "python", "-X", "utf8", "tests/verifyPlaywrightAppRuntime.py")),
        ),
    ),
    "app-runtime": Gate(
        tier="fast",
        description="App 라이프사이클 hook, 포트 회피, 사용자 정의 컴포넌트, teacher tool registry, OAuth refresh, dogfood.",
        commands=(
            command(("uv", "run", "python", "-X", "utf8", "tests/testAppRuntime.py")),
            command(("uv", "run", "python", "-X", "utf8", "tests/testTeacherToolBridge.py")),
            command(("uv", "run", "python", "-X", "utf8", "tests/testOauthTokenRefresh.py")),
            command(("uv", "run", "--with", "playwright", "python", "-X", "utf8", "tests/verifyPlaywrightDogfood.py")),
        ),
    ),
    "mobile-layout": Gate(
        tier="fast",
        description="PWA manifest, service worker, viewport meta, 모바일 hook + chromium viewport 회귀.",
        commands=(
            command(("uv", "run", "python", "-X", "utf8", "tests/testMobileShell.py")),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyMobileLayout.py")),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyPwaArtifacts.py")),
            command(("uv", "run", "--with", "playwright", "python", "-X", "utf8", "tests/verifyPlaywrightMobile.py")),
        ),
    ),
    "teacher-eval": Gate(
        tier="fast",
        description="teacher tool policy, trace, golden eval 계약을 빠르게 확인한다.",
        commands=(command(("uv", "run", "pytest", "tests/testTeacherArchitecture.py", "-q", "--tb=short")),),
        ci_required=False,
    ),
    "teacher-e2e": Gate(
        tier="fast",
        description="teacher provider loop, provider error workloop, curriculum golden e2e harness를 실행한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyTeacherGoldenE2e.py")),),
        ci_required=False,
    ),
    "assistant-workloop-contract": Gate(
        tier="fast",
        description="assistant workloop/trace UI state가 clarification, provider error, tool detail을 보존하는지 확인한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyAssistantWorkloopContract.py")),),
        ci_required=False,
    ),
    "ai-live-smoke": Gate(
        tier="fast",
        description="실제 provider credential이 있을 때 provider 응답, OAuth 상태, live tool loop smoke를 확인한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyAiLiveSmoke.py")),),
        blocking=False,
        ci_required=False,
        softExitCodes=(2,),
    ),
    "editor-runtime-preflight": Gate(
        tier="fast",
        description="editor 직접 실행 경로가 패키지 확인, uv 설치, 셀 실행 순서를 지키는지 확인한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyEditorRuntimePreflight.py")),),
        ci_required=False,
    ),
    "learning-system-readiness": Gate(
        tier="fast",
        description="학습 YAML, 카드 UI, teacher loop, workloop, gate SSOT readiness score를 확인한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyLearningSystemReadiness.py")),),
        ci_required=False,
    ),
    "learning-goal-audit": Gate(
        tier="surface",
        description="목표 완료 전 docs, product quality, readiness, backend, landing build를 묶어 확인한다.",
        commands=(
            command(("uv", "run", "python", "-X", "utf8", "docs/skills/ops/tools/syncAgentsMd.py", "--check")),
            command(("uv", "run", "python", "-X", "utf8", "tests/run.py", "audit-self")),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyDogfoodAlphaAudit.py")),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyProductQualityAudit.py")),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyLearningGoalObjectiveAudit.py")),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyLearningSystemReadiness.py")),
            command(("uv", "run", "pytest", "tests/", "-q", "--tb=short")),
            command(("npm", "run", "build"), cwd="landing"),
        ),
        ci_required=False,
    ),
    "dogfood-alpha-audit": Gate(
        tier="surface",
        description="첫 사용자 provider 연결, 질문, 학습 생성, 셀 실행, 실패 복구 플로우의 증거를 확인한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyDogfoodAlphaAudit.py")),),
        ci_required=False,
    ),
    "product-quality-audit": Gate(
        tier="surface",
        description="제품 품질 기준과 새 내구성 gate 증거를 확인한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyProductQualityAudit.py")),),
        ci_required=False,
    ),
    "automation-ide-audit": Gate(
        tier="surface",
        description="자동화 IDE의 task/schedule/webhook/workflow/E-Stop/audit/frontend surface 연결을 확인한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyAutomationIdeAudit.py")),),
        ci_required=False,
    ),
    "service-readiness-audit": Gate(
        tier="surface",
        description="product-quality-audit의 기존 호환 alias다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyProductQualityAudit.py")),),
        ci_required=False,
    ),
    "diagnostic-summary-contract": Gate(
        tier="fast",
        description="local diagnostic summary가 실패 범주와 secret redaction 계약을 지키는지 확인한다.",
        commands=(
            command(("uv", "run", "pytest", "tests/testDiagnosticSummary.py", "-q", "--tb=short")),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyDiagnosticSummaryContract.py")),
        ),
        ci_required=False,
    ),
    "install-launcher-smoke": Gate(
        tier="release",
        description="launcher doctor, health check, rollback, exact artifact 설치 경계의 smoke 증거를 확인한다.",
        commands=(
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyInstallLauncherSmoke.py")),
            command(("cargo", "check"), cwd="launcher/codaro-launcher"),
        ),
        ci_required=False,
    ),
    "runtime-recovery-contract": Gate(
        tier="fast",
        description="runtime worker crash, package preflight, cell 실행 실패 복구 계약을 확인한다.",
        commands=(
            command(("uv", "run", "pytest", "tests/testRuntime.py", "-q", "--tb=short")),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyEditorRuntimePreflight.py")),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyRuntimeRecoveryContract.py")),
        ),
        ci_required=False,
    ),
    "runtime-recovery-browser": Gate(
        tier="surface",
        description="브라우저에서 package install 실패가 셀 근처 복구 UX로 보이는지 확인한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyRuntimeRecoveryPlaywright.py")),),
        ci_required=False,
    ),
    "curriculum-quality-matrix": Gate(
        tier="fast",
        description="대표 structured YAML과 실제 전체 curriculum YAML의 학습 흐름, 패키지, 실습 계약을 확인한다.",
        commands=(
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyCurriculumQualityMatrix.py")),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyCurriculumFlowQuality.py")),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyCurriculumWorkflowArchitecture.py")),
        ),
        ci_required=False,
    ),
    "curriculum-top-tier-audit": Gate(
        tier="fast",
        description="커리큘럼이 최상위 학습 자산 기준을 만족하는지 skills, 의존성, 소개 레슨, structured source 채택률로 점수화한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyCurriculumTopTierAudit.py")),),
        ci_required=False,
    ),
    "curriculum-weakness-audit": Gate(
        tier="fast",
        description="레슨 단위 약점(plan orphan, exercise/check 누락, hint 부재 등)을 Curriculum OS taxonomy 위에서 점검한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/auditCurriculumWeakness.py")),),
        ci_required=False,
    ),
    "playwright-curriculum-runtime": Gate(
        tier="fast",
        description="Playwright 학습 트랙의 structured YAML 계약과 예제/정답 코드가 실제 Chromium에서 실행되는지 확인한다.",
        commands=(
            command((
                "uv",
                "run",
                "--with",
                "playwright",
                "--with",
                "pytest",
                "python",
                "-X",
                "utf8",
                "tests/verifyPlaywrightCurriculumRuntime.py",
            ), timeoutSeconds=1200),
        ),
        ci_required=False,
    ),
    "onboarding-browser": Gate(
        tier="surface",
        description="브라우저에서 첫 화면 fallback과 provider 연결 후 상태를 확인한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyOnboardingPlaywright.py")),),
        ci_required=False,
    ),
    "frontend-performance-budget": Gate(
        tier="surface",
        description="editor build 후 chunk 분리와 asset size budget을 확인한다.",
        commands=(
            command(("npm", "run", "build"), cwd="editor"),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyFrontendPerformanceBudget.py")),
        ),
        ci_required=False,
    ),
    "learning-card-contract": Gate(
        tier="surface",
        description="structured learning section card marker와 editor build를 확인한다.",
        commands=(
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyLearningSectionCardContract.py")),
            command(("npm", "run", "build"), cwd="editor"),
        ),
        ci_required=False,
    ),
    "learning-card-browser": Gate(
        tier="surface",
        description="Playwright CLI로 lesson overview와 structured section card의 desktop/mobile 렌더링을 확인한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyLearningCardPlaywright.py")),),
        ci_required=False,
    ),
    "provider-settings-browser": Gate(
        tier="surface",
        description="Playwright CLI로 provider 설정 sheet의 fallback, 선택, 검증, 실패 안내 렌더링을 확인한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyProviderSettingsPlaywright.py")),),
        ci_required=False,
    ),
    "editor-build": Gate(
        tier="surface",
        description="제품 editor surface의 TypeScript/Vite build를 확인한다.",
        commands=(command(("npm", "run", "build"), cwd="editor"),),
    ),
    "landing-build": Gate(
        tier="surface",
        description="문서/landing surface의 static build와 docs content bundle split을 확인한다.",
        commands=(
            command(("npm", "run", "build"), cwd="landing"),
            command(("uv", "run", "python", "-X", "utf8", "tests/verifyLandingDocsBundleSplit.py")),
        ),
    ),
    "launcher-check": Gate(
        tier="release",
        description="launcher Rust crate의 type/build 계약을 확인한다.",
        commands=(command(("cargo", "check"), cwd="launcher/codaro-launcher"),),
    ),
    "launcher-test": Gate(
        tier="release",
        description="launcher Rust crate 테스트를 실행한다.",
        commands=(command(("cargo", "test", "--", "--test-threads=1"), cwd="launcher/codaro-launcher"),),
    ),
    "objective-nineplus-audit": Gate(
        tier="release",
        description="객관 9점대 scorecard의 모든 분야가 9.0 이상인지 최신 gate artifact와 기준 출처로 확인한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyObjectiveNinePlusScorecard.py")),),
        ci_required=False,
    ),
    "public-readiness-audit": Gate(
        tier="release",
        description="대중 사용 목표에서 보안, 개인정보, 공급망, 지원, 문서, 접근성, 최신 증거가 모두 9.0 이상인지 확인한다.",
        commands=(command(("uv", "run", "python", "-X", "utf8", "tests/verifyPublicReadinessAudit.py")),),
        ci_required=False,
    ),
}

PREFLIGHT_GATES = (
    "root-clean",
    "docs",
    "backend",
    "widget-bridge",
    "app-runtime",
    "mobile-layout",
    "editor-build",
    "curriculum-quality-matrix",
)
PRODUCT_QUALITY_GATES = (
    "root-clean",
    "docs",
    "backend",
    "learning-system-readiness",
    "dogfood-alpha-audit",
    "product-quality-audit",
    "automation-ide-audit",
    "diagnostic-summary-contract",
    "ai-live-smoke",
    "provider-settings-browser",
    "install-launcher-smoke",
    "runtime-recovery-contract",
    "runtime-recovery-browser",
    "curriculum-quality-matrix",
    "curriculum-top-tier-audit",
    "playwright-curriculum-runtime",
    "onboarding-browser",
    "frontend-performance-budget",
    "landing-build",
    "launcher-test",
)
TIER_ORDER = ("fast", "surface", "release")


def runCommand(gateName: str, gateCommand: GateCommand) -> int:
    cwd = ROOT / gateCommand.cwd
    commandArgs = localGateArgs(gateName, gateCommand)
    env = localGateEnvironment(gateName, commandArgs)
    executable = shutil.which(commandArgs[0])
    args = (executable, *commandArgs[1:]) if executable else commandArgs
    displayCwd = gateCommand.cwd
    logPath = commandLogPath(gateName, commandArgs)
    logPath.parent.mkdir(parents=True, exist_ok=True)
    print(f"\n[{gateName}] {displayCwd}> {' '.join(commandArgs)}", flush=True)
    with logPath.open("w", encoding="utf-8", newline="", buffering=1) as log:
        log.write(f"[{gateName}] {displayCwd}> {' '.join(commandArgs)}\n")
        log.write(f"cwd: {displayPath(cwd)}\n\n")
        log.flush()
        try:
            process = subprocess.Popen(
                args,
                cwd=cwd,
                env=env,
                stdout=log,
                stderr=subprocess.STDOUT,
            )
        except OSError as exc:
            log.write(f"failed to start command: {type(exc).__name__}: {exc}\n")
            log.flush()
            print(f"[{gateName}] failed to start command; log: {displayPath(logPath)}", file=sys.stderr)
            return 127
        try:
            returnCode = process.wait(timeout=gateCommand.timeoutSeconds)
        except subprocess.TimeoutExpired:
            log.write(f"\ntimeout: exceeded {gateCommand.timeoutSeconds}s\n")
            log.flush()
            terminateProcess(process)
            returnCode = 124
        log.write(f"\nexit: {returnCode}\n")
        log.flush()
    if returnCode != 0:
        print(f"[{gateName}] command log: {displayPath(logPath)}", file=sys.stderr)
        printLogTail(logPath)
    return returnCode


def commandLogPath(gateName: str, commandArgs: tuple[str, ...]) -> Path:
    commandName = Path(commandArgs[0]).name if commandArgs else "command"
    safeCommand = re.sub(r"[^A-Za-z0-9_.-]+", "-", commandName).strip("-") or "command"
    return localGateWorkspace(gateName) / "logs" / f"{time.time_ns()}-{safeCommand}.log"


def terminateProcess(process: subprocess.Popen[object]) -> None:
    if os.name == "nt" and shutil.which("taskkill"):
        try:
            subprocess.run(
                ("taskkill", "/PID", str(process.pid), "/T", "/F"),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=15,
            )
        except (OSError, subprocess.TimeoutExpired):
            process.kill()
    else:
        process.kill()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        pass


def printLogTail(logPath: Path, maxLines: int = 200) -> None:
    try:
        lines = logPath.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return
    if not lines:
        return
    if len(lines) > maxLines:
        print(f"[log tail] showing last {maxLines} of {len(lines)} lines from {displayPath(logPath)}")
        lines = lines[-maxLines:]
    for line in lines:
        print(line)


def localGateEnvironment(gateName: str, commandArgs: tuple[str, ...]) -> dict[str, str]:
    runRoot = localGateWorkspace(gateName)
    scratchDir = runRoot / "scratch"
    scratchDir.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    # TMP/TEMP override는 backend(전체 pytest) gate에서는 끄고, 그 외만 격리.
    if gateName != "backend":
        env["TMP"] = str(scratchDir)
        env["TEMP"] = str(scratchDir)
        env["TMPDIR"] = str(scratchDir)
    env["PYTHONUTF8"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"
    if uvCommandUsesWith(commandArgs):
        cacheDir = runRoot / "uv-cache"
        cacheDir.mkdir(parents=True, exist_ok=True)
        env.pop("UV_NO_CACHE", None)
        env["UV_CACHE_DIR"] = str(cacheDir)
        env["UV_LINK_MODE"] = "copy"
    else:
        env["UV_NO_CACHE"] = "1"
    return env


def localGateArgs(gateName: str, gateCommand: GateCommand) -> tuple[str, ...]:
    args = normalizeUvArgs(gateCommand.args)
    args = normalizePytestArgs(gateName, args)
    args = normalizeCargoArgs(gateName, args)
    return args


def normalizeUvArgs(args: tuple[str, ...]) -> tuple[str, ...]:
    if len(args) >= 2 and args[0] == "uv" and args[1] == "run":
        if uvCommandUsesWith(args):
            return args
        return ("uv", "--no-cache", *args[1:])
    return args


def uvCommandUsesWith(args: tuple[str, ...]) -> bool:
    return len(args) >= 3 and args[0] == "uv" and "run" in args[:3] and "--with" in args


def normalizePytestArgs(gateName: str, args: tuple[str, ...]) -> tuple[str, ...]:
    if "pytest" not in args:
        return args
    nextArgs = list(args)
    if "-p" not in nextArgs:
        nextArgs.extend(("-p", "no:cacheprovider"))
    if not any(item == "--basetemp" or item.startswith("--basetemp=") for item in nextArgs):
        nextArgs.extend(("--basetemp", str(localGatePytestBaseTemp(gateName))))
    return tuple(nextArgs)


def localGatePytestBaseTemp(gateName: str) -> Path:
    tempRoot = localGateWorkspace(gateName) / "pytest"
    tempRoot.mkdir(parents=True, exist_ok=True)
    return tempRoot / f"run-{os.getpid()}-{time.time_ns()}"


def normalizeCargoArgs(gateName: str, args: tuple[str, ...]) -> tuple[str, ...]:
    if not args or args[0] != "cargo":
        return args
    if any(item == "--target-dir" or item.startswith("--target-dir=") for item in args):
        return args
    targetDirArgs = ("--target-dir", str(localGateWorkspace(gateName) / "cargo-target"))
    if "--" in args:
        splitIndex = args.index("--")
        return (*args[:splitIndex], *targetDirArgs, *args[splitIndex:])
    return (*args, *targetDirArgs)


def localGateWorkspace(gateName: str) -> Path:
    safeName = re.sub(r"[^A-Za-z0-9_.-]+", "-", gateName).strip("-") or "gate"
    return GATE_WORK_ROOT / safeName


def runGate(gateName: str) -> int:
    gate = GATES[gateName]
    for gateCommand in gate.commands:
        returnCode = runCommand(gateName, gateCommand)
        if returnCode != 0:
            return returnCode
    return 0


def runGateSequence(gateNames: tuple[str, ...], *, sequenceName: str = "gate-sequence") -> int:
    startedAt = time.monotonic()
    sequenceStartedAt = utcTimestamp()
    sequenceGitHead = currentGitHead()
    results: list[dict[str, object]] = []
    for gateName in gateNames:
        gateStartedAt = time.monotonic()
        gateStartedAtNs = time.time_ns()
        commandReturnCode = runGate(gateName)
        artifacts = gateArtifactSummaries(gateName, gateStartedAtNs, expectedGitHead=sequenceGitHead)
        logs = commandLogSummaries(gateName, gateStartedAtNs)
        artifactFailure = commandReturnCode == 0 and hasArtifactEvidenceFailure(artifacts)
        returnCode = 1 if artifactFailure else commandReturnCode
        softFailure = isSoftGateExit(gateName, returnCode)
        durationMs = round((time.monotonic() - gateStartedAt) * 1000)
        results.append({
            "gate": gateName,
            "returnCode": returnCode,
            "commandReturnCode": commandReturnCode,
            "softFailure": softFailure,
            "artifactFailure": artifactFailure,
            "durationMs": durationMs,
            "logs": logs,
            "artifacts": artifacts,
        })
        if returnCode != 0 and not softFailure:
            writeGateSequenceSummary(
                sequenceName=sequenceName,
                gateNames=gateNames,
                results=results,
                totalMs=round((time.monotonic() - startedAt) * 1000),
                startedAt=sequenceStartedAt,
                gitHead=sequenceGitHead,
            )
            passed = tuple(f"{result['gate']}({result['durationMs']}ms)" for result in results if result["returnCode"] == 0)
            print(
                f"FAIL: gate sequence stopped at {gateName} after {len(passed)}/{len(gateNames)} gates "
                f"(exit {returnCode}, {durationMs} ms)",
                file=sys.stderr,
            )
            if passed:
                print(f"passed gates: {', '.join(passed)}", file=sys.stderr)
            return returnCode
    totalMs = round((time.monotonic() - startedAt) * 1000)
    writeGateSequenceSummary(
        sequenceName=sequenceName,
        gateNames=gateNames,
        results=results,
        totalMs=totalMs,
        startedAt=sequenceStartedAt,
        gitHead=sequenceGitHead,
    )
    passed = tuple(f"{result['gate']}({result['durationMs']}ms)" for result in results)
    softFailures = tuple(result for result in results if result.get("softFailure"))
    if softFailures:
        softLabels = ", ".join(f"{result['gate']}(exit {result['returnCode']})" for result in softFailures)
        print(
            f"ok: gate sequence completed {len(passed)}/{len(gateNames)} gates "
            f"with {len(softFailures)} soft status in {totalMs} ms"
        )
        print(f"soft gates: {softLabels}")
    else:
        print(f"ok: gate sequence passed {len(passed)}/{len(gateNames)} gates in {totalMs} ms")
    print(f"gates: {', '.join(passed)}")
    return 0


def isSoftGateExit(gateName: str, returnCode: int) -> bool:
    if returnCode == 0:
        return False
    gate = GATES[gateName]
    return returnCode in gate.softExitCodes


def writeGateSequenceSummary(
    *,
    sequenceName: str,
    gateNames: tuple[str, ...],
    results: list[dict[str, object]],
    totalMs: int,
    startedAt: str,
    gitHead: str | None,
) -> Path:
    summaryDir = localGateWorkspace(sequenceName)
    summaryDir.mkdir(parents=True, exist_ok=True)
    failed = next(
        (result for result in results if result["returnCode"] != 0 and not result.get("softFailure")),
        None,
    )
    summaryPath = summaryDir / "sequence-summary.json"
    payload = {
        "sequence": sequenceName,
        "passed": failed is None and len(results) == len(gateNames),
        "completedGateCount": sum(1 for result in results if result["returnCode"] == 0),
        "softFailureCount": sum(1 for result in results if result.get("softFailure")),
        "totalGateCount": len(gateNames),
        "totalMs": totalMs,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "gitHead": gitHead,
        "summaryPath": displayPath(summaryPath),
        "failedGate": failed["gate"] if failed else None,
        "gates": results,
    }
    summaryPath.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return summaryPath


def gateArtifactSummaries(
    gateName: str,
    gateStartedAtNs: int,
    *,
    expectedGitHead: str | None = None,
) -> list[dict[str, object]]:
    summaries: list[dict[str, object]] = []
    for relPath in GATE_ARTIFACTS.get(gateName, ()):
        path = ROOT / relPath
        if not path.exists():
            summaries.append({
                "path": relPath,
                "exists": False,
                "fresh": False,
                "modifiedAtNs": None,
            })
            continue
        modifiedAtNs = path.stat().st_mtime_ns
        summary: dict[str, object] = {
            "path": relPath,
            "exists": True,
            "fresh": modifiedAtNs >= gateStartedAtNs,
            "modifiedAtNs": modifiedAtNs,
        }
        summary.update(jsonArtifactEvidence(path, expectedGitHead=expectedGitHead))
        summaries.append(summary)
    return summaries


def commandLogSummaries(gateName: str, gateStartedAtNs: int) -> list[dict[str, object]]:
    logsDir = localGateWorkspace(gateName) / "logs"
    if not logsDir.exists():
        return []
    logPaths = list(logsDir.glob("*.log"))
    for logPath in logPaths:
        waitForLogFileStable(logPath)
    summaries: list[dict[str, object]] = []
    for logPath in sorted(logPaths, key=lambda path: path.stat().st_mtime_ns):
        modifiedAtNs = logPath.stat().st_mtime_ns
        if modifiedAtNs < gateStartedAtNs:
            continue
        summaries.append({
            "path": displayPath(logPath),
            "exists": True,
            "fresh": True,
            "modifiedAtNs": modifiedAtNs,
            "bytes": logPath.stat().st_size,
        })
    return summaries


def waitForLogFileStable(path: Path, *, timeoutSeconds: float = 3.0, stableSeconds: float = 0.25) -> None:
    deadline = time.monotonic() + timeoutSeconds
    lastState: tuple[int, int] | None = None
    stableSince: float | None = None
    while time.monotonic() < deadline:
        try:
            stat = path.stat()
        except OSError:
            return
        state = (stat.st_size, stat.st_mtime_ns)
        now = time.monotonic()
        if state == lastState:
            stableSince = stableSince or now
            if now - stableSince >= stableSeconds:
                return
        else:
            lastState = state
            stableSince = None
        time.sleep(0.05)


def jsonArtifactEvidence(path: Path, *, expectedGitHead: str | None) -> dict[str, object]:
    if path.suffix.lower() != ".json":
        return {}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, UnicodeDecodeError):
        return {"payloadReadable": False}
    if not isinstance(payload, dict):
        return {"payloadReadable": False}
    evidence: dict[str, object] = {"payloadReadable": True}
    copyScalarEvidence(evidence, payload, "passed", "payloadPassed", bool)
    copyScalarEvidence(evidence, payload, "status", "payloadStatus", str)
    copyScalarEvidence(evidence, payload, "startedAt", "payloadStartedAt", str)
    copyScalarEvidence(evidence, payload, "completedAt", "payloadCompletedAt", str)
    copyScalarEvidence(evidence, payload, "durationMs", "payloadDurationMs", int)
    copyScalarEvidence(evidence, payload, "softFailureCount", "payloadSoftFailureCount", int)
    gitHead = payload.get("gitHead")
    if isinstance(gitHead, str) and gitHead:
        evidence["payloadGitHead"] = gitHead
        if expectedGitHead:
            evidence["gitHeadMatches"] = gitHeadsMatch(gitHead, expectedGitHead)
    elif expectedGitHead:
        evidence["gitHeadMatches"] = False
    return evidence


def copyScalarEvidence(
    evidence: dict[str, object],
    payload: dict[str, object],
    sourceKey: str,
    targetKey: str,
    expectedType: type,
) -> None:
    value = payload.get(sourceKey)
    if isinstance(value, expectedType):
        evidence[targetKey] = value


def gitHeadsMatch(artifactGitHead: str, expectedGitHead: str) -> bool:
    artifact = artifactGitHead.strip()
    expected = expectedGitHead.strip()
    if not artifact or not expected:
        return False
    return artifact == expected or artifact.startswith(expected) or expected.startswith(artifact)


def hasArtifactEvidenceFailure(summaries: list[dict[str, object]]) -> bool:
    for summary in summaries:
        if summary.get("exists") is False or summary.get("fresh") is False:
            return True
        if summary.get("payloadReadable") is False:
            return True
        if summary.get("gitHeadMatches") is False:
            return True
    return False


def displayPath(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def currentGitHead() -> str | None:
    gitDir = resolveGitDir()
    if gitDir is None:
        return None
    commonGitDir = resolveCommonGitDir(gitDir)
    headPath = gitDir / "HEAD"
    if not headPath.exists():
        return None
    head = headPath.read_text(encoding="utf-8").strip()
    if head.startswith("ref: "):
        refName = head.removeprefix("ref: ").strip()
        refPath = gitDir / refName
        if not refPath.exists():
            refPath = commonGitDir / refName
        if refPath.exists():
            return refPath.read_text(encoding="utf-8").strip()
        packedRefsPath = commonGitDir / "packed-refs"
        if packedRefsPath.exists():
            for line in packedRefsPath.read_text(encoding="utf-8").splitlines():
                if not line or line.startswith("#") or line.startswith("^"):
                    continue
                sha, _, name = line.partition(" ")
                if name == refName:
                    return sha
        return None
    return head or None


def resolveCommonGitDir(gitDir: Path) -> Path:
    commonDirPath = gitDir / "commondir"
    if not commonDirPath.exists():
        return gitDir
    rawPath = commonDirPath.read_text(encoding="utf-8").strip()
    path = Path(rawPath)
    if not path.is_absolute():
        path = gitDir / path
    return path.resolve()


def resolveGitDir() -> Path | None:
    gitPath = ROOT / ".git"
    if gitPath.is_dir():
        return gitPath
    if not gitPath.is_file():
        return None
    content = gitPath.read_text(encoding="utf-8").strip()
    if not content.startswith("gitdir:"):
        return None
    rawPath = content.removeprefix("gitdir:").strip()
    path = Path(rawPath)
    if not path.is_absolute():
        path = ROOT / path
    return path


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def gateNamesForTier(tier: str) -> tuple[str, ...]:
    return tuple(name for name, gate in GATES.items() if gate.tier == tier)


def listGates() -> int:
    for tier in TIER_ORDER:
        print(f"{tier}:")
        for name in gateNamesForTier(tier):
            gate = GATES[name]
            marker = "blocking" if gate.blocking else "nonblocking"
            print(f"  {name:<16} {marker:<11} {gate.description}")
    print("preflight:")
    for name in PREFLIGHT_GATES:
        print(f"  {name}")
    print("quality-cycle:")
    for name in PRODUCT_QUALITY_GATES:
        print(f"  {name}")
    return 0


def ciGateNames() -> set[str]:
    if not CI_WORKFLOW.exists():
        return set()
    workflow = CI_WORKFLOW.read_text(encoding="utf-8")
    return set(re.findall(r"tests/run\.py\s+gate\s+([A-Za-z0-9_-]+)", workflow))


def auditSelf() -> int:
    failures: list[str] = []
    gateNames = set(GATES)

    if len(GATES) != 35:
        failures.append(f"expected 35 gates, found {len(GATES)}")

    unknownPreflight = [name for name in PREFLIGHT_GATES if name not in gateNames]
    if unknownPreflight:
        failures.append(f"unknown preflight gates: {', '.join(unknownPreflight)}")

    unknownProductQuality = [name for name in PRODUCT_QUALITY_GATES if name not in gateNames]
    if unknownProductQuality:
        failures.append(f"unknown product quality gates: {', '.join(unknownProductQuality)}")

    unknownTiers = sorted({gate.tier for gate in GATES.values()} - set(TIER_ORDER))
    if unknownTiers:
        failures.append(f"unknown tiers: {', '.join(unknownTiers)}")

    ciNames = ciGateNames()
    unknownCiNames = sorted(ciNames - gateNames)
    if unknownCiNames:
        failures.append(f"ci references unknown gates: {', '.join(unknownCiNames)}")

    missingCiNames = sorted(name for name, gate in GATES.items() if gate.ci_required and name not in ciNames)
    if missingCiNames:
        failures.append(f"ci does not reference required gates: {', '.join(missingCiNames)}")

    if GATE_DOC.exists():
        docText = GATE_DOC.read_text(encoding="utf-8")
        missingDocNames = sorted(name for name in GATES if f"`{name}`" not in docText)
        if missingDocNames:
            failures.append(f"gate doc does not mention: {', '.join(missingDocNames)}")
        if "`quality-cycle`" not in docText:
            failures.append("gate doc does not mention: quality-cycle")
    else:
        failures.append(f"missing gate doc: {GATE_DOC.relative_to(ROOT)}")

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1

    print("ok: test gate definitions are aligned")
    return 0


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Codaro test gate runner")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("list", help="show available gates")
    subparsers.add_parser("preflight", help="run the default local preflight gates")
    subparsers.add_parser("quality-cycle", help="run the product quality gate sequence")
    subparsers.add_parser("audit-self", help="validate runner, docs, and CI wiring")

    gateParser = subparsers.add_parser("gate", help="run one named gate")
    gateParser.add_argument("name", choices=tuple(GATES))

    tierParser = subparsers.add_parser("tier", help="run all gates in a tier")
    tierParser.add_argument("name", choices=TIER_ORDER)

    return parser


def main(argv: list[str] | None = None) -> int:
    args = buildParser().parse_args(argv)

    if args.command == "list":
        return listGates()
    if args.command == "preflight":
        return runGateSequence(PREFLIGHT_GATES, sequenceName="preflight")
    if args.command == "quality-cycle":
        return runGateSequence(PRODUCT_QUALITY_GATES, sequenceName="quality-cycle")
    if args.command == "audit-self":
        return auditSelf()
    if args.command == "gate":
        return runGate(args.name)
    if args.command == "tier":
        return runGateSequence(gateNamesForTier(args.name), sequenceName=f"tier-{args.name}")

    raise ValueError(f"Unsupported command: {args.command}")


if __name__ == "__main__":
    raise SystemExit(main())
