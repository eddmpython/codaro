from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GATE_DOC = ROOT / "docs" / "skills" / "ops" / "foundation" / "testing-and-gates.md"
CI_WORKFLOW = ROOT / ".github" / "workflows" / "ci.yml"


@dataclass(frozen=True)
class GateCommand:
    args: tuple[str, ...]
    cwd: str = "."


@dataclass(frozen=True)
class Gate:
    tier: str
    description: str
    commands: tuple[GateCommand, ...]
    blocking: bool = True
    ci_required: bool = True


def command(args: tuple[str, ...], cwd: str = ".") -> GateCommand:
    return GateCommand(args=args, cwd=cwd)


GATES: dict[str, Gate] = {
    "docs": Gate(
        tier="fast",
        description="운영 문서 포인터와 gate 정의가 현재 저장소 구조와 맞는지 검사한다.",
        commands=(
            command(("uv", "run", "python", "-X", "utf8", "docs/skills/ops/tools/syncAgentsMd.py", "--check")),
            command(("uv", "run", "python", "-X", "utf8", "tests/run.py", "audit-self")),
        ),
    ),
    "backend": Gate(
        tier="fast",
        description="Python backend 전체 테스트를 실행한다.",
        commands=(command(("uv", "run", "pytest", "tests/", "-q", "--tb=short")),),
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
    "editor-build": Gate(
        tier="surface",
        description="제품 editor surface의 TypeScript/Vite build를 확인한다.",
        commands=(command(("npm", "run", "build"), cwd="editor"),),
    ),
    "landing-build": Gate(
        tier="surface",
        description="문서/landing surface의 static build를 확인한다.",
        commands=(command(("npm", "run", "build"), cwd="landing"),),
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
}

PREFLIGHT_GATES = ("docs", "backend")
TIER_ORDER = ("fast", "surface", "release")


def runCommand(gateName: str, gateCommand: GateCommand) -> int:
    cwd = ROOT / gateCommand.cwd
    executable = shutil.which(gateCommand.args[0])
    args = (executable, *gateCommand.args[1:]) if executable else gateCommand.args
    displayCwd = gateCommand.cwd
    print(f"\n[{gateName}] {displayCwd}> {' '.join(gateCommand.args)}", flush=True)
    result = subprocess.run(args, cwd=cwd, check=False)
    return result.returncode


def runGate(gateName: str) -> int:
    gate = GATES[gateName]
    for gateCommand in gate.commands:
        returnCode = runCommand(gateName, gateCommand)
        if returnCode != 0:
            return returnCode
    return 0


def runGateSequence(gateNames: tuple[str, ...]) -> int:
    for gateName in gateNames:
        returnCode = runGate(gateName)
        if returnCode != 0:
            return returnCode
    return 0


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
    return 0


def ciGateNames() -> set[str]:
    if not CI_WORKFLOW.exists():
        return set()
    workflow = CI_WORKFLOW.read_text(encoding="utf-8")
    return set(re.findall(r"tests/run\.py\s+gate\s+([A-Za-z0-9_-]+)", workflow))


def auditSelf() -> int:
    failures: list[str] = []
    gateNames = set(GATES)

    if len(GATES) != 13:
        failures.append(f"expected 13 gates, found {len(GATES)}")

    unknownPreflight = [name for name in PREFLIGHT_GATES if name not in gateNames]
    if unknownPreflight:
        failures.append(f"unknown preflight gates: {', '.join(unknownPreflight)}")

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
        return runGateSequence(PREFLIGHT_GATES)
    if args.command == "audit-self":
        return auditSelf()
    if args.command == "gate":
        return runGate(args.name)
    if args.command == "tier":
        return runGateSequence(gateNamesForTier(args.name))

    raise ValueError(f"Unsupported command: {args.command}")


if __name__ == "__main__":
    raise SystemExit(main())
