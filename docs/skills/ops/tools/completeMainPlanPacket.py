from __future__ import annotations

import argparse
from datetime import UTC, datetime
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
from typing import Any
import uuid

import yaml


ROOT = Path(__file__).resolve().parents[4]
MAIN_PLAN = ROOT / "mainPlan"
LEDGER_PATH = MAIN_PLAN / "completion-transition-ledger.yml"
HEX_64 = re.compile(r"^[a-f0-9]{64}$")
GIT_COMMIT = re.compile(r"^(?:[a-f0-9]{40}|[a-f0-9]{64})$")
KEBAB_ID = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class CompletionError(ValueError):
    pass


def loadYamlMapping(path: Path) -> dict[str, Any]:
    try:
        payload = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        raise CompletionError(f"cannot read YAML {displayPath(path)}: {exc}") from exc
    if not isinstance(payload, dict):
        raise CompletionError(f"YAML root must be a mapping: {displayPath(path)}")
    return payload


def displayPath(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def sha256Bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256File(path: Path) -> str:
    try:
        return sha256Bytes(path.read_bytes())
    except OSError as exc:
        raise CompletionError(f"cannot hash {displayPath(path)}: {exc}") from exc


def requireMapping(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise CompletionError(f"{label} must be a mapping")
    return value


def requireString(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise CompletionError(f"{label} must be a non-empty string")
    return value


def requireStringList(value: Any, label: str, *, allowEmpty: bool) -> list[str]:
    if not isinstance(value, list) or (not allowEmpty and not value):
        requirement = "a list" if allowEmpty else "a non-empty list"
        raise CompletionError(f"{label} must be {requirement}")
    if any(not isinstance(item, str) or not item.strip() for item in value):
        raise CompletionError(f"{label} must contain non-empty strings")
    return value


def requireTimestamp(value: Any, label: str) -> str:
    timestamp = requireString(value, label)
    normalized = timestamp[:-1] + "+00:00" if timestamp.endswith("Z") else timestamp
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError as exc:
        raise CompletionError(f"{label} must be an ISO 8601 timestamp") from exc
    if parsed.tzinfo is None:
        raise CompletionError(f"{label} must include a timezone")
    return timestamp


def validateCompletionEvidence(payload: dict[str, Any]) -> dict[str, Any]:
    allowed = {
        "schemaVersion",
        "initiativeId",
        "packetId",
        "completedAt",
        "gitCommit",
        "implementationPaths",
        "gates",
        "reviews",
        "docsUpdated",
        "parentIndexUpdated",
        "residualRisks",
    }
    unknown = sorted(set(payload) - allowed)
    if unknown:
        raise CompletionError(f"completion evidence has unknown fields: {', '.join(unknown)}")
    if payload.get("schemaVersion") != 1:
        raise CompletionError("completion evidence schemaVersion must be 1")

    for key in ("initiativeId", "packetId"):
        value = requireString(payload.get(key), key)
        if not KEBAB_ID.fullmatch(value):
            raise CompletionError(f"{key} must be kebab-case")
    requireTimestamp(payload.get("completedAt"), "completedAt")
    gitCommit = requireString(payload.get("gitCommit"), "gitCommit")
    if not GIT_COMMIT.fullmatch(gitCommit):
        raise CompletionError("gitCommit must be a full Git object ID")
    implementationPaths = requireStringList(payload.get("implementationPaths"), "implementationPaths", allowEmpty=False)
    if len(implementationPaths) != len(set(implementationPaths)):
        raise CompletionError("implementationPaths must be unique")

    gates = payload.get("gates")
    if not isinstance(gates, list) or not gates:
        raise CompletionError("gates must be a non-empty list")
    gateNames: set[str] = set()
    for index, rawGate in enumerate(gates):
        gate = requireMapping(rawGate, f"gates[{index}]")
        if set(gate) != {"name", "reportPath", "reportHash", "gitHead", "passedAt"}:
            raise CompletionError(f"gates[{index}] has an invalid field set")
        name = requireString(gate.get("name"), f"gates[{index}].name")
        if name in gateNames:
            raise CompletionError(f"duplicate gate evidence: {name}")
        gateNames.add(name)
        requireString(gate.get("reportPath"), f"gates[{index}].reportPath")
        reportHash = requireString(gate.get("reportHash"), f"gates[{index}].reportHash")
        if not HEX_64.fullmatch(reportHash):
            raise CompletionError(f"gates[{index}].reportHash must be SHA-256")
        gateHead = requireString(gate.get("gitHead"), f"gates[{index}].gitHead")
        if not GIT_COMMIT.fullmatch(gateHead):
            raise CompletionError(f"gates[{index}].gitHead must be a full Git object ID")
        requireTimestamp(gate.get("passedAt"), f"gates[{index}].passedAt")

    reviews = payload.get("reviews")
    if not isinstance(reviews, list):
        raise CompletionError("reviews must be a list")
    for index, rawReview in enumerate(reviews):
        review = requireMapping(rawReview, f"reviews[{index}]")
        expected = {"kind", "reviewerRole", "status", "assetPath", "ledgerHash", "reviewedAt"}
        if set(review) != expected:
            raise CompletionError(f"reviews[{index}] has an invalid field set")
        if review.get("kind") not in {"visual", "content", "accessibility", "security"}:
            raise CompletionError(f"reviews[{index}].kind is invalid")
        requireString(review.get("reviewerRole"), f"reviews[{index}].reviewerRole")
        if review.get("status") != "approved":
            raise CompletionError(f"reviews[{index}].status must be approved")
        requireString(review.get("assetPath"), f"reviews[{index}].assetPath")
        ledgerHash = requireString(review.get("ledgerHash"), f"reviews[{index}].ledgerHash")
        if not HEX_64.fullmatch(ledgerHash):
            raise CompletionError(f"reviews[{index}].ledgerHash must be SHA-256")
        requireTimestamp(review.get("reviewedAt"), f"reviews[{index}].reviewedAt")

    if payload.get("docsUpdated") is not True:
        raise CompletionError("docsUpdated must be true")
    if payload.get("parentIndexUpdated") is not True:
        raise CompletionError("parentIndexUpdated must be true")
    requireStringList(payload.get("residualRisks"), "residualRisks", allowEmpty=True)
    return payload


def validateTransitionLedger(payload: dict[str, Any]) -> dict[str, Any]:
    if set(payload) != {"schemaVersion", "transitions"}:
        raise CompletionError("transition ledger must contain only schemaVersion and transitions")
    if payload.get("schemaVersion") != 1:
        raise CompletionError("transition ledger schemaVersion must be 1")
    transitions = payload.get("transitions")
    if not isinstance(transitions, list):
        raise CompletionError("transition ledger transitions must be a list")

    nonces: set[str] = set()
    transitionIds: set[str] = set()
    completePackets: set[tuple[str, str]] = set()
    completeFromPaths: set[str] = set()
    correctedIds: set[str] = set()
    for index, rawTransition in enumerate(transitions):
        transition = validateTransition(requireMapping(rawTransition, f"transitions[{index}]"))
        nonce = transition["nonce"]
        transitionId = transition["transitionId"]
        if nonce in nonces:
            raise CompletionError(f"duplicate transition nonce: {nonce}")
        if transitionId in transitionIds:
            raise CompletionError(f"duplicate transition ID: {transitionId}")
        nonces.add(nonce)
        transitionIds.add(transitionId)
        if transition["transitionKind"] == "complete":
            packetKey = (transition["initiativeId"], transition["packetId"])
            if packetKey in completePackets:
                raise CompletionError(f"duplicate completed packet transition: {'/'.join(packetKey)}")
            if transition["fromPath"] in completeFromPaths:
                raise CompletionError(f"duplicate completion fromPath: {transition['fromPath']}")
            completePackets.add(packetKey)
            completeFromPaths.add(transition["fromPath"])
        else:
            correctedId = transition["correctsTransitionId"]
            if correctedId in correctedIds:
                raise CompletionError(f"transition already corrected: {correctedId}")
            correctedIds.add(correctedId)
    return payload


def validateTransition(transition: dict[str, Any]) -> dict[str, Any]:
    required = {
        "schemaVersion",
        "transitionKind",
        "nonce",
        "transitionId",
        "initiativeId",
        "packetId",
        "implementationCommit",
        "evidenceCommit",
        "fromPath",
        "toPath",
        "evidencePath",
        "evidenceHash",
        "preparedAt",
    }
    kind = transition.get("transitionKind")
    allowed = required | ({"correctsTransitionId"} if kind == "correction" else set())
    if set(transition) != allowed:
        raise CompletionError("transition has an invalid field set")
    if transition.get("schemaVersion") != 1:
        raise CompletionError("transition schemaVersion must be 1")
    if kind not in {"complete", "correction"}:
        raise CompletionError("transitionKind must be complete or correction")
    try:
        parsedNonce = uuid.UUID(requireString(transition.get("nonce"), "nonce"))
    except ValueError as exc:
        raise CompletionError("nonce must be UUIDv4") from exc
    if parsedNonce.version != 4:
        raise CompletionError("nonce must be UUIDv4")
    for key in ("transitionId", "evidenceHash"):
        if not HEX_64.fullmatch(requireString(transition.get(key), key)):
            raise CompletionError(f"{key} must be SHA-256")
    for key in ("initiativeId", "packetId"):
        if not KEBAB_ID.fullmatch(requireString(transition.get(key), key)):
            raise CompletionError(f"{key} must be kebab-case")
    for key in ("implementationCommit", "evidenceCommit"):
        if not GIT_COMMIT.fullmatch(requireString(transition.get(key), key)):
            raise CompletionError(f"{key} must be a full Git object ID")
    fromPath = normalRelativePath(requireString(transition.get("fromPath"), "fromPath"))
    toPath = normalRelativePath(requireString(transition.get("toPath"), "toPath"))
    evidencePath = normalRelativePath(requireString(transition.get("evidencePath"), "evidencePath"))
    if not fromPath.startswith("mainPlan/") or "/_done/" in fromPath:
        raise CompletionError("fromPath must be an active mainPlan path")
    if "/_done/" not in toPath:
        raise CompletionError("toPath must be under _done")
    if evidencePath != f"{toPath}/completion-evidence.yml":
        raise CompletionError("evidencePath must point to completion-evidence.yml under toPath")
    requireTimestamp(transition.get("preparedAt"), "preparedAt")
    if kind == "correction" and not HEX_64.fullmatch(
        requireString(transition.get("correctsTransitionId"), "correctsTransitionId")
    ):
        raise CompletionError("correctsTransitionId must be SHA-256")

    expectedId = calculateTransitionId(
        initiativeId=transition["initiativeId"],
        packetId=transition["packetId"],
        implementationCommit=transition["implementationCommit"],
        evidenceCommit=transition["evidenceCommit"],
        nonce=transition["nonce"],
    )
    if transition["transitionId"] != expectedId:
        raise CompletionError("transitionId does not match the canonical transition payload")
    return transition


def normalRelativePath(value: str) -> str:
    normalized = value.replace("\\", "/")
    path = Path(normalized)
    if path.is_absolute() or any(part in {"", ".", ".."} for part in path.parts):
        raise CompletionError(f"path must be a normalized repository-relative path: {value}")
    resolved = (ROOT / path).resolve()
    try:
        resolved.relative_to(ROOT.resolve())
    except ValueError as exc:
        raise CompletionError(f"path escapes the repository: {value}") from exc
    return path.as_posix()


def calculateTransitionId(
    *, initiativeId: str, packetId: str, implementationCommit: str, evidenceCommit: str, nonce: str
) -> str:
    payload = {
        "evidenceCommit": evidenceCommit,
        "implementationCommit": implementationCommit,
        "initiativeId": initiativeId,
        "nonce": nonce,
        "packetId": packetId,
    }
    canonical = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return sha256Bytes(canonical.encode("utf-8"))


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
    return gitBytes(*args).decode("utf-8", errors="strict").strip()


def requireCleanEvidenceCommit(implementationCommit: str, evidenceCommit: str | None) -> str:
    if not GIT_COMMIT.fullmatch(implementationCommit):
        raise CompletionError("--implementation-commit must be a full Git object ID")
    head = gitText("rev-parse", "HEAD")
    resolvedEvidenceCommit = evidenceCommit or head
    if not GIT_COMMIT.fullmatch(resolvedEvidenceCommit):
        raise CompletionError("--evidence-commit must be a full Git object ID")
    if head != resolvedEvidenceCommit:
        raise CompletionError(f"stale evidence commit: HEAD is {head}, expected {resolvedEvidenceCommit}")
    evidenceParent = gitText("rev-parse", f"{resolvedEvidenceCommit}^")
    if evidenceParent != implementationCommit:
        raise CompletionError(
            f"evidence commit parent is {evidenceParent}, expected implementation commit {implementationCommit}"
        )
    status = gitText("status", "--porcelain=v1", "--untracked-files=all")
    if status:
        raise CompletionError("worktree must be clean before preparing a completion transition")
    return resolvedEvidenceCommit


def findEvidencePath(implementationCommit: str, packetPath: str | None) -> Path:
    if packetPath:
        normalized = normalRelativePath(packetPath)
        packet = ROOT / normalized
        evidencePath = packet / "completion-evidence.yml"
        if not evidencePath.is_file():
            raise CompletionError(f"completion evidence is missing: {displayPath(evidencePath)}")
        return evidencePath

    matches: list[Path] = []
    for candidate in MAIN_PLAN.rglob("completion-evidence.yml"):
        relParts = candidate.relative_to(MAIN_PLAN).parts
        if "_done" in relParts:
            continue
        try:
            evidence = validateCompletionEvidence(loadYamlMapping(candidate))
        except CompletionError:
            continue
        if evidence["gitCommit"] == implementationCommit:
            matches.append(candidate)
    if len(matches) != 1:
        found = ", ".join(displayPath(path) for path in matches) or "none"
        raise CompletionError(f"expected one active evidence file for implementation commit; found {found}")
    return matches[0]


def parseReportPayload(data: bytes, reportPath: str) -> dict[str, Any]:
    try:
        if Path(reportPath).suffix.lower() == ".json":
            payload = json.loads(data.decode("utf-8"))
        else:
            payload = yaml.safe_load(data.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError, yaml.YAMLError) as exc:
        raise CompletionError(f"gate report is not valid JSON/YAML: {reportPath}") from exc
    return requireMapping(payload, f"gate report {reportPath}")


def reportPassed(payload: dict[str, Any]) -> bool:
    if payload.get("passed") is True:
        return True
    return payload.get("status") == "passed"


def committedFile(commit: str, relativePath: str) -> bytes:
    path = normalRelativePath(relativePath)
    return gitBytes("cat-file", "blob", f"{commit}:{path}")


def verifyEvidenceAgainstCommit(
    evidencePath: Path, evidence: dict[str, Any], implementationCommit: str, evidenceCommit: str
) -> None:
    evidenceRel = displayPath(evidencePath)
    committedEvidence = committedFile(evidenceCommit, evidenceRel)
    try:
        committedPayload = yaml.safe_load(committedEvidence.decode("utf-8"))
    except (UnicodeDecodeError, yaml.YAMLError) as exc:
        raise CompletionError("committed completion evidence is invalid YAML") from exc
    if committedPayload != evidence:
        raise CompletionError("completion evidence differs from the evidence commit")
    if evidence["gitCommit"] != implementationCommit:
        raise CompletionError("completion evidence gitCommit does not match --implementation-commit")

    for implementationPath in evidence["implementationPaths"]:
        committedFile(implementationCommit, implementationPath)

    for gate in evidence["gates"]:
        reportPath = normalRelativePath(gate["reportPath"])
        reportBytes = committedFile(evidenceCommit, reportPath)
        if sha256Bytes(reportBytes) != gate["reportHash"]:
            raise CompletionError(f"gate report hash mismatch: {reportPath}")
        if gate["gitHead"] != implementationCommit:
            raise CompletionError(f"gate evidence gitHead is stale: {gate['name']}")
        report = parseReportPayload(reportBytes, reportPath)
        reportHead = report.get("gitHead")
        if reportHead != implementationCommit:
            raise CompletionError(f"gate report gitHead is stale: {reportPath}")
        if not reportPassed(report):
            raise CompletionError(f"gate report is not passed: {reportPath}")

    for review in evidence["reviews"]:
        assetPath = normalRelativePath(review["assetPath"])
        assetBytes = committedFile(evidenceCommit, assetPath)
        if sha256Bytes(assetBytes) != review["ledgerHash"]:
            raise CompletionError(f"reviewed asset hash mismatch: {assetPath}")


def packetIdentity(evidencePath: Path, evidence: dict[str, Any]) -> tuple[str, str, Path, Path, Path]:
    packetPath = evidencePath.parent
    packetRel = packetPath.relative_to(MAIN_PLAN)
    if "_done" in packetRel.parts or len(packetRel.parts) < 2:
        raise CompletionError("completion evidence must be in an active initiative packet")
    initiativeId = packetRel.parts[0]
    packetFolder = packetRel.parts[-1]
    packetId = re.sub(r"^[0-9]+-", "", packetFolder)
    if evidence["initiativeId"] != initiativeId:
        raise CompletionError(f"initiativeId must match packet path: {initiativeId}")
    if evidence["packetId"] != packetId:
        raise CompletionError(f"packetId must match packet folder: {packetId}")
    parentPath = packetPath.parent
    destination = parentPath / "_done" / packetFolder
    parentReadme = parentPath / "README.md"
    if destination.exists():
        raise CompletionError(f"completion destination already exists: {displayPath(destination)}")
    if not parentReadme.is_file():
        raise CompletionError(f"parent index is missing: {displayPath(parentReadme)}")
    return initiativeId, packetId, packetPath, destination, parentReadme


def updatedParentIndex(parentReadme: Path, packetFolder: str) -> str:
    text = parentReadme.read_text(encoding="utf-8")
    replacements = (
        (f"]({packetFolder}/)", f"](_done/{packetFolder}/)"),
        (f"](./{packetFolder}/)", f"](_done/{packetFolder}/)"),
    )
    count = sum(text.count(source) for source, _ in replacements)
    if count != 1:
        raise CompletionError(
            f"parent index must contain exactly one active link to {packetFolder}/; found {count}"
        )
    for source, destination in replacements:
        text = text.replace(source, destination)
    return text


def completionReadme(readme: str, evidence: dict[str, Any], evidencePath: str) -> str:
    if "<!-- completion-record:v1 -->" in readme:
        raise CompletionError("packet README already has a completion record")
    lines = readme.splitlines()
    if not lines or not lines[0].startswith("# "):
        raise CompletionError("packet README must start with an H1")
    gateNames = ", ".join(gate["name"] for gate in evidence["gates"])
    risks = "; ".join(evidence["residualRisks"]) if evidence["residualRisks"] else "없음"
    record = [
        "",
        "<!-- completion-record:v1 -->",
        f"> 완료일: {evidence['completedAt']}",
        f"> 구현 커밋: `{evidence['gitCommit']}`",
        f"> 통과 게이트: {gateNames}",
        f"> 남은 위험: {risks}",
        f"> 증거: [`completion-evidence.yml`]({Path(evidencePath).name})",
    ]
    return "\n".join(lines[:1] + record + lines[1:]) + "\n"


def atomicWrite(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=f".{path.name}.", suffix=".tmp", delete=False) as handle:
        tempPath = Path(handle.name)
        handle.write(data)
        handle.flush()
        os.fsync(handle.fileno())
    try:
        os.replace(tempPath, path)
    except OSError:
        tempPath.unlink(missing_ok=True)
        raise


def dumpYaml(payload: dict[str, Any]) -> bytes:
    return yaml.safe_dump(payload, allow_unicode=True, sort_keys=False).encode("utf-8")


def prepareCompletionTransition(
    *,
    implementationCommit: str,
    evidenceCommit: str | None = None,
    packetPath: str | None = None,
    dryRun: bool = False,
) -> dict[str, Any]:
    resolvedEvidenceCommit = requireCleanEvidenceCommit(implementationCommit, evidenceCommit)
    evidencePath = findEvidencePath(implementationCommit, packetPath)
    evidence = validateCompletionEvidence(loadYamlMapping(evidencePath))
    verifyEvidenceAgainstCommit(evidencePath, evidence, implementationCommit, resolvedEvidenceCommit)
    initiativeId, packetId, source, destination, parentReadme = packetIdentity(evidencePath, evidence)
    parentText = updatedParentIndex(parentReadme, source.name)
    ledger = validateTransitionLedger(loadYamlMapping(LEDGER_PATH))

    nonce = str(uuid.uuid4())
    transition = {
        "schemaVersion": 1,
        "transitionKind": "complete",
        "nonce": nonce,
        "transitionId": calculateTransitionId(
            initiativeId=initiativeId,
            packetId=packetId,
            implementationCommit=implementationCommit,
            evidenceCommit=resolvedEvidenceCommit,
            nonce=nonce,
        ),
        "initiativeId": initiativeId,
        "packetId": packetId,
        "implementationCommit": implementationCommit,
        "evidenceCommit": resolvedEvidenceCommit,
        "fromPath": displayPath(source),
        "toPath": displayPath(destination),
        "evidencePath": f"{displayPath(destination)}/completion-evidence.yml",
        "evidenceHash": sha256Bytes(committedFile(resolvedEvidenceCommit, displayPath(evidencePath))),
        "preparedAt": datetime.now(UTC).isoformat(timespec="seconds"),
    }
    validateTransition(transition)
    nextLedger = {"schemaVersion": 1, "transitions": [*ledger["transitions"], transition]}
    validateTransitionLedger(nextLedger)

    if dryRun:
        return transition

    parentBefore = parentReadme.read_bytes()
    ledgerBefore = LEDGER_PATH.read_bytes()
    sourceReadmeBefore = (source / "README.md").read_bytes()
    destination.parent.mkdir(parents=True, exist_ok=True)
    moved = False
    try:
        shutil.move(str(source), str(destination))
        moved = True
        movedReadme = destination / "README.md"
        atomicWrite(
            movedReadme,
            completionReadme(
                movedReadme.read_text(encoding="utf-8"), evidence, transition["evidencePath"]
            ).encode("utf-8"),
        )
        atomicWrite(parentReadme, parentText.encode("utf-8"))
        atomicWrite(LEDGER_PATH, dumpYaml(nextLedger))
    except (OSError, CompletionError) as exc:
        atomicWrite(parentReadme, parentBefore)
        atomicWrite(LEDGER_PATH, ledgerBefore)
        if moved and destination.exists() and not source.exists():
            atomicWrite(destination / "README.md", sourceReadmeBefore)
            shutil.move(str(destination), str(source))
        raise CompletionError(f"completion transition was rolled back: {exc}") from exc
    return transition


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Prepare a verified mainPlan packet completion transition.")
    parser.add_argument("--implementation-commit", required=True, help="Full commit A object ID.")
    parser.add_argument(
        "--evidence-commit",
        help="Full commit E object ID. Defaults to HEAD and must have commit A as its parent.",
    )
    parser.add_argument(
        "--packet-path",
        help="Active packet path relative to the repository. Omit to locate the only matching evidence file.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Validate and print the transition without writing it.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = buildParser().parse_args(argv)
    try:
        transition = prepareCompletionTransition(
            implementationCommit=args.implementation_commit,
            evidenceCommit=args.evidence_commit,
            packetPath=args.packet_path,
            dryRun=args.dry_run,
        )
    except CompletionError as exc:
        print(f"FAIL: {exc}")
        return 1
    print(json.dumps(transition, ensure_ascii=False, indent=2))
    action = "validated" if args.dry_run else "prepared"
    print(f"ok: completion transition {action}; commit only the move, parent index, and ledger changes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
