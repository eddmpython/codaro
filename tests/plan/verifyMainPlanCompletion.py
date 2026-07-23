from __future__ import annotations

import argparse
import importlib.util
from pathlib import Path
import subprocess
import sys
from types import ModuleType
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[2]
TOOL_PATH = ROOT / "docs" / "skills" / "ops" / "tools" / "completeMainPlanPacket.py"
LEDGER_REL = "mainPlan/completion-transition-ledger.yml"


def loadCompletionTool() -> ModuleType:
    spec = importlib.util.spec_from_file_location("completeMainPlanPacket", TOOL_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load completion tool: {TOOL_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


completion = loadCompletionTool()
CompletionError = completion.CompletionError


def gitBytes(*args: str) -> bytes:
    try:
        result = subprocess.run(("git", *args), cwd=ROOT, check=True, capture_output=True)
    except (OSError, subprocess.CalledProcessError) as exc:
        detail = ""
        if isinstance(exc, subprocess.CalledProcessError):
            detail = exc.stderr.decode("utf-8", errors="replace").strip()
        raise CompletionError(f"git {' '.join(args)} failed{': ' + detail if detail else ''}") from exc
    return result.stdout


def gitText(*args: str) -> str:
    return gitBytes(*args).decode("utf-8").strip()


def committedBytes(commit: str, path: str) -> bytes:
    return gitBytes("cat-file", "blob", f"{commit}:{path}")


def committedYaml(commit: str, path: str) -> dict[str, Any]:
    try:
        payload = yaml.safe_load(committedBytes(commit, path).decode("utf-8"))
    except (UnicodeDecodeError, yaml.YAMLError) as exc:
        raise CompletionError(f"invalid committed YAML: {commit}:{path}") from exc
    if not isinstance(payload, dict):
        raise CompletionError(f"committed YAML root must be a mapping: {commit}:{path}")
    return payload


def commitHasPath(commit: str, path: str) -> bool:
    result = subprocess.run(
        ("git", "cat-file", "-e", f"{commit}:{path}"),
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return result.returncode == 0


def changedPaths(parent: str, transitionHead: str) -> list[tuple[str, ...]]:
    output = gitText(
        "diff-tree",
        "--no-commit-id",
        "--name-status",
        "-r",
        "-M",
        "--find-renames=50%",
        parent,
        transitionHead,
    )
    changes: list[tuple[str, ...]] = []
    for line in output.splitlines():
        parts = tuple(part.strip() for part in line.split("\t") if part.strip())
        if parts:
            changes.append(parts)
    return changes


def verifyAllowedDiff(parent: str, transitionHead: str, transition: dict[str, Any]) -> None:
    fromPath = transition["fromPath"]
    toPath = transition["toPath"]
    parentIndex = f"{fromPath.rsplit('/', 1)[0]}/README.md"
    exactAllowed = {LEDGER_REL, parentIndex}

    for change in changedPaths(parent, transitionHead):
        status = change[0]
        paths = change[1:]
        if not paths:
            raise CompletionError(f"invalid transition diff row: {change}")
        for path in paths:
            if path in exactAllowed:
                continue
            if path == fromPath or path.startswith(f"{fromPath}/"):
                continue
            if path == toPath or path.startswith(f"{toPath}/"):
                continue
            raise CompletionError(f"transition commit changes a forbidden path: {status} {path}")


def treeFiles(commit: str, prefix: str) -> set[str]:
    output = gitText("ls-tree", "-r", "--name-only", commit, "--", prefix)
    return {line[len(prefix) + 1 :] for line in output.splitlines() if line.startswith(f"{prefix}/")}


def verifyMovedTree(parent: str, transitionHead: str, transition: dict[str, Any]) -> None:
    fromPath = transition["fromPath"]
    toPath = transition["toPath"]
    if commitHasPath(transitionHead, fromPath):
        raise CompletionError("active packet path still exists after completion transition")
    if not commitHasPath(transitionHead, toPath):
        raise CompletionError("completed packet destination is missing")

    beforeFiles = treeFiles(parent, fromPath)
    afterFiles = treeFiles(transitionHead, toPath)
    if beforeFiles != afterFiles:
        missing = sorted(beforeFiles - afterFiles)
        extra = sorted(afterFiles - beforeFiles)
        raise CompletionError(f"packet move changed its file set; missing={missing}, extra={extra}")
    for relativePath in sorted(beforeFiles - {"README.md"}):
        before = committedBytes(parent, f"{fromPath}/{relativePath}")
        after = committedBytes(transitionHead, f"{toPath}/{relativePath}")
        if before != after:
            raise CompletionError(f"packet move mutated {relativePath}")

    readme = committedBytes(transitionHead, f"{toPath}/README.md").decode("utf-8")
    if "<!-- completion-record:v1 -->" not in readme:
        raise CompletionError("completed packet README is missing the completion record")


def verifyParentIndex(transitionHead: str, transition: dict[str, Any]) -> None:
    fromPath = transition["fromPath"]
    parentPath, packetFolder = fromPath.rsplit("/", 1)
    readmePath = f"{parentPath}/README.md"
    readme = committedBytes(transitionHead, readmePath).decode("utf-8")
    if f"](_done/{packetFolder}/)" not in readme:
        raise CompletionError("parent index does not link to the completed packet")
    if f"]({packetFolder}/)" in readme or f"](./{packetFolder}/)" in readme:
        raise CompletionError("parent index still links to the active packet path")


def verifyTransitionLedger(transitionHead: str) -> dict[str, Any]:
    evidenceCommit = gitText("rev-parse", f"{transitionHead}^")
    ledger = completion.validateTransitionLedger(committedYaml(transitionHead, LEDGER_REL))
    previousLedger = completion.validateTransitionLedger(committedYaml(evidenceCommit, LEDGER_REL))
    previous = previousLedger["transitions"]
    current = ledger["transitions"]
    if len(current) != len(previous) + 1 or current[: len(previous)] != previous:
        raise CompletionError("transition commit must append exactly one ledger row")
    transition = current[-1]
    if transition["transitionKind"] != "complete":
        raise CompletionError("--transition-head must point to a completion transition")
    if transition["evidenceCommit"] != evidenceCommit:
        raise CompletionError("transition commit parent is not the recorded evidence commit")
    implementationCommit = gitText("rev-parse", f"{evidenceCommit}^")
    if transition["implementationCommit"] != implementationCommit:
        raise CompletionError("evidence commit parent is not the recorded implementation commit")
    return transition


def verifyEvidence(transitionHead: str, transition: dict[str, Any]) -> None:
    implementationCommit = transition["implementationCommit"]
    evidenceCommit = transition["evidenceCommit"]
    evidenceBytes = committedBytes(transitionHead, transition["evidencePath"])
    if completion.sha256Bytes(evidenceBytes) != transition["evidenceHash"]:
        raise CompletionError("moved completion evidence hash does not match the ledger")
    beforeEvidencePath = f"{transition['fromPath']}/completion-evidence.yml"
    if committedBytes(evidenceCommit, beforeEvidencePath) != evidenceBytes:
        raise CompletionError("completion evidence changed during the transition")
    try:
        evidencePayload = yaml.safe_load(evidenceBytes.decode("utf-8"))
    except (UnicodeDecodeError, yaml.YAMLError) as exc:
        raise CompletionError("completion evidence is invalid YAML") from exc
    evidence = completion.validateCompletionEvidence(completion.requireMapping(evidencePayload, "completion evidence"))
    if evidence["gitCommit"] != implementationCommit:
        raise CompletionError("completion evidence does not point to the implementation commit")
    if evidence["initiativeId"] != transition["initiativeId"] or evidence["packetId"] != transition["packetId"]:
        raise CompletionError("completion evidence identity does not match the transition")

    for gate in evidence["gates"]:
        reportBytes = committedBytes(evidenceCommit, gate["reportPath"])
        if completion.sha256Bytes(reportBytes) != gate["reportHash"]:
            raise CompletionError(f"gate report hash mismatch: {gate['reportPath']}")
        report = completion.parseReportPayload(reportBytes, gate["reportPath"])
        if report.get("gitHead") != implementationCommit or not completion.reportPassed(report):
            raise CompletionError(f"gate report is stale or red: {gate['reportPath']}")


def verifyCompletionTransition(transitionHead: str) -> dict[str, Any]:
    resolvedHead = gitText("rev-parse", transitionHead)
    transition = verifyTransitionLedger(resolvedHead)
    evidenceCommit = transition["evidenceCommit"]
    verifyAllowedDiff(evidenceCommit, resolvedHead, transition)
    verifyMovedTree(evidenceCommit, resolvedHead, transition)
    verifyParentIndex(resolvedHead, transition)
    verifyEvidence(resolvedHead, transition)
    return transition


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Verify commit B for a mainPlan completion transition.")
    parser.add_argument("--transition-head", help="Full or resolvable Git commit B object ID.")
    parser.add_argument(
        "--ledger-only",
        action="store_true",
        help="Validate uniqueness and schema of the current transition ledger without requiring commit B.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = buildParser().parse_args(argv)
    if bool(args.transition_head) == bool(args.ledger_only):
        print("FAIL: choose exactly one of --transition-head or --ledger-only", file=sys.stderr)
        return 1
    try:
        if args.ledger_only:
            ledger = completion.validateTransitionLedger(completion.loadYamlMapping(ROOT / LEDGER_REL))
            print(f"ok: completion transition ledger valid ({len(ledger['transitions'])} rows)")
            return 0
        transition = verifyCompletionTransition(args.transition_head)
    except CompletionError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    print(f"ok: completion transition valid ({transition['transitionId']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
