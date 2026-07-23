from __future__ import annotations

import argparse
from datetime import UTC, datetime
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import time
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[2]
INITIATIVE = ROOT / "mainPlan" / "astryx-product-experience"
LOOP = INITIATIVE / "00-product-contract" / "01-prd-improvement-loop"
RUBRIC_PATH = LOOP / "00-evaluation-contract" / "rubric.yml"
EVALUATION_SCHEMA_PATH = LOOP / "00-evaluation-contract" / "evaluation-report.schema.yml"
R10_MANIFEST_PATH = LOOP / "08-r10-independent-review" / "r10-input-manifest.yml"
NEGATIVE_FIXTURE_PATH = ROOT / "tests" / "product" / "bootstrapAfterUse.fixture.yml"
REPORT_PATH = ROOT / "output" / "test-runner" / "plan-quality" / "plan-fact-audit.json"
REQUIRED_SECTIONS = ("## 목표", "## 영향 파일", "## 영향 함수·심볼", "## 테스트", "## 롤백", "## 평가")
IMPLEMENTED_B0_PATHS = (
    "mainPlan/completion-evidence.schema.yml",
    "mainPlan/completion-transition.schema.yml",
    "mainPlan/completion-transition-ledger.yml",
    "docs/skills/ops/tools/completeMainPlanPacket.py",
    "docs/skills/ops/tools/genProductContracts.py",
    "contracts/artifactOwnership.schema.json",
    "contracts/artifactOwners.yml",
    "tests/plan/verifyMainPlanCompletion.py",
    "tests/product/verifyPlanFactAudit.py",
    "tests/product/bootstrapAfterUse.fixture.yml",
)


class PlanFactError(ValueError):
    pass


def relativePath(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def loadYaml(path: Path) -> Any:
    try:
        return yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        raise PlanFactError(f"invalid YAML {relativePath(path)}: {exc}") from exc


def loadMapping(path: Path) -> dict[str, Any]:
    payload = loadYaml(path)
    if not isinstance(payload, dict):
        raise PlanFactError(f"YAML root must be a mapping: {relativePath(path)}")
    return payload


def sha256File(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def currentGitHead() -> str | None:
    try:
        result = subprocess.run(
            ("git", "rev-parse", "HEAD"), cwd=ROOT, check=True, capture_output=True, text=True, timeout=5
        )
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() or None


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def activeReadmes() -> tuple[Path, ...]:
    return tuple(sorted(path for path in INITIATIVE.rglob("README.md") if "_done" not in path.parts))


def packetReadmes(readmes: tuple[Path, ...]) -> tuple[Path, ...]:
    return tuple(
        path
        for path in readmes
        if path != INITIATIVE / "README.md"
        and path.parent.name != "00-specialist-review"
        and re.match(r"^[0-9]{2}-", path.parent.name)
    )


def requiredSectionFailures(readmes: tuple[Path, ...]) -> list[str]:
    failures: list[str] = []
    for path in readmes:
        text = path.read_text(encoding="utf-8")
        missing = [section for section in REQUIRED_SECTIONS if section not in text]
        if missing:
            failures.append(f"{relativePath(path)} missing {', '.join(missing)}")
    return failures


def markdownLinkFacts(readmes: tuple[Path, ...]) -> tuple[int, list[str]]:
    count = 0
    failures: list[str] = []
    pattern = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
    for readme in readmes:
        for rawTarget in pattern.findall(readme.read_text(encoding="utf-8")):
            target = rawTarget.strip().split("#", 1)[0]
            if not target or target.startswith(("http://", "https://", "mailto:", "/")):
                continue
            count += 1
            if not (readme.parent / target.replace("%20", " ")).exists():
                failures.append(f"{relativePath(readme)} -> {target}")
    return count, failures


def yamlFacts() -> tuple[int, list[str]]:
    paths = tuple(sorted(INITIATIVE.rglob("*.yml"))) + tuple(sorted(INITIATIVE.rglob("*.yaml")))
    failures: list[str] = []
    for path in paths:
        try:
            loadYaml(path)
        except PlanFactError as exc:
            failures.append(str(exc))
    return len(paths), failures


def textHygieneFacts(readmes: tuple[Path, ...]) -> tuple[int, int, list[str]]:
    emDashCount = 0
    trailingCount = 0
    failures: list[str] = []
    for path in readmes:
        text = path.read_text(encoding="utf-8")
        currentEmDash = text.count("\u2014")
        currentTrailing = sum(1 for line in text.splitlines() if line.rstrip() != line)
        emDashCount += currentEmDash
        trailingCount += currentTrailing
        if currentEmDash:
            failures.append(f"{relativePath(path)} contains U+2014")
        if currentTrailing:
            failures.append(f"{relativePath(path)} has trailing whitespace")
    return emDashCount, trailingCount, failures


def registeredGateNames() -> set[str]:
    source = (ROOT / "tests" / "run.py").read_text(encoding="utf-8")
    return set(re.findall(r'^\s{4}"([a-z0-9-]+)": Gate\(', source, flags=re.MULTILINE))


def gateReferenceFailures(readmes: tuple[Path, ...]) -> list[str]:
    registered = registeredGateNames()
    pattern = re.compile(r"tests/run\.py\s+gate\s+([a-z0-9-]+)")
    planned = {
        name
        for path in readmes
        for line in path.read_text(encoding="utf-8").splitlines()
        if "신규" in line
        for name in pattern.findall(line)
    }
    return [
        f"{relativePath(path)} references absent gate {name}"
        for path in readmes
        for name in pattern.findall(path.read_text(encoding="utf-8"))
        if name not in registered and name not in planned
    ]


def creationOwnerFacts(readmes: tuple[Path, ...]) -> tuple[int, list[str]]:
    owners: dict[str, list[str]] = {}
    pathPattern = re.compile(r"`([^`]+(?:\.[A-Za-z0-9]+|/))`")
    for readme in readmes:
        for line in readme.read_text(encoding="utf-8").splitlines():
            if not line.strip().startswith("- 신규 "):
                continue
            for artifactPath in pathPattern.findall(line):
                if artifactPath.startswith("/"):
                    continue
                owners.setdefault(artifactPath, []).append(relativePath(readme))
    duplicates = {path: sorted(set(locations)) for path, locations in owners.items() if len(set(locations)) > 1}
    return len(duplicates), [f"duplicate creation owner for {path}: {', '.join(locations)}" for path, locations in duplicates.items()]


def rubricFacts() -> tuple[dict[str, Any], list[str]]:
    rubric = loadMapping(RUBRIC_PATH)
    dimensions = rubric.get("dimensions")
    failures: list[str] = []
    weight: int | float | None = None
    if isinstance(dimensions, list):
        values = [item.get("weight") for item in dimensions if isinstance(item, dict)]
        weight = sum(value for value in values if isinstance(value, (int, float)))
        if len(values) != 7 or weight != 100:
            failures.append(f"rubric dimensions/weight are {len(values)}/{weight}, expected 7/100")
    else:
        failures.append("rubric dimensions must be a list")
    if rubric.get("targetScore") is not None or rubric.get("passThreshold") is not None:
        failures.append("rubric targetScore and passThreshold must be null")
    return {
        "weight": weight,
        "targetScore": rubric.get("targetScore"),
        "passThreshold": rubric.get("passThreshold"),
        "sha256": sha256File(RUBRIC_PATH),
    }, failures


def evaluationSchemaFailures() -> list[str]:
    schema = loadMapping(EVALUATION_SCHEMA_PATH)
    failures: list[str] = []
    required = schema.get("required")
    expected = {"dimensions", "findings", "totalScore", "productEvidenceMaturity", "promptAudit"}
    if schema.get("type") != "object" or schema.get("additionalProperties") is not False:
        failures.append("evaluation report schema must be a closed object")
    if not isinstance(required, list) or not expected.issubset(set(required)):
        failures.append("evaluation report schema misses evidence fields")
    properties = schema.get("properties")
    totalScore = properties.get("totalScore") if isinstance(properties, dict) else None
    if not isinstance(totalScore, dict) or "const" in totalScore:
        failures.append("evaluation totalScore must preserve raw scores")
    return failures


def auditDependencyFixture(path: Path) -> list[str]:
    fixture = loadMapping(path)
    milestones = fixture.get("milestones")
    artifacts = fixture.get("artifacts")
    if not isinstance(milestones, dict) or not isinstance(artifacts, list):
        raise PlanFactError(f"invalid dependency fixture: {relativePath(path)}")
    failures: list[str] = []
    for artifact in artifacts:
        if not isinstance(artifact, dict):
            raise PlanFactError("dependency fixture artifact must be a mapping")
        owner = artifact.get("creationOwner")
        consumers = artifact.get("consumers")
        if not isinstance(owner, dict) or not isinstance(consumers, list):
            raise PlanFactError("dependency fixture must define one owner and consumers")
        ownerOrder = milestones.get(owner.get("milestone"))
        if not isinstance(ownerOrder, int):
            raise PlanFactError("dependency fixture creation milestone is unknown")
        for consumer in consumers:
            consumerOrder = milestones.get(consumer.get("milestone")) if isinstance(consumer, dict) else None
            if not isinstance(consumerOrder, int):
                raise PlanFactError("dependency fixture consumer milestone is unknown")
            if consumerOrder < ownerOrder:
                failures.append(
                    f"creation-after-consumption: {artifact.get('path')} is consumed before its creation owner"
                )
    return failures


def negativeFixtureFailures() -> tuple[int, list[str]]:
    if not NEGATIVE_FIXTURE_PATH.is_file():
        return 0, [f"negative fixture is absent: {relativePath(NEGATIVE_FIXTURE_PATH)}"]
    fixture = loadMapping(NEGATIVE_FIXTURE_PATH)
    detected = auditDependencyFixture(NEGATIVE_FIXTURE_PATH)
    expected = fixture.get("expectedFailure")
    if not detected:
        return 1, ["negative bootstrap-after-use fixture unexpectedly passed"]
    if not isinstance(expected, str) or not any(failure.startswith(expected) for failure in detected):
        return 1, [f"negative fixture did not produce {expected}"]
    return 1, []


def packetManifestFailures(packetId: str | None) -> list[str]:
    if packetId is None:
        return []
    manifest = loadMapping(R10_MANIFEST_PATH)
    remediations = manifest.get("remediations")
    if not isinstance(remediations, list):
        return ["R10 remediations must be a list"]
    packet = next((item for item in remediations if isinstance(item, dict) and item.get("packet") == packetId), None)
    if packet is None:
        return [f"R10 remediation packet is missing: {packetId}"]
    failures: list[str] = []
    if packet.get("factAuditCommandState") != "implemented":
        failures.append(f"{packetId} factAuditCommandState must be implemented")
    if packet.get("negativeFixtureState") != "present":
        failures.append(f"{packetId} negativeFixtureState must be present")
    fixturePath = packet.get("negativeFixture")
    if not isinstance(fixturePath, str) or not (ROOT / fixturePath).is_file():
        failures.append(f"{packetId} negative fixture path is absent")
    return failures


def verifyPlanFacts(packetId: str | None = None) -> dict[str, Any]:
    readmes = activeReadmes()
    packets = packetReadmes(readmes)
    linkCount, brokenLinks = markdownLinkFacts(readmes)
    yamlCount, yamlFailures = yamlFacts()
    emDashCount, trailingCount, hygieneFailures = textHygieneFacts(readmes)
    duplicateCount, ownerFailures = creationOwnerFacts(packets)
    rubric, currentRubricFailures = rubricFacts()
    fixtureCount, fixtureFailures = negativeFixtureFailures()
    implementationFailures = [f"B0 artifact is absent: {path}" for path in IMPLEMENTED_B0_PATHS if not (ROOT / path).exists()]
    failures = (
        requiredSectionFailures(packets)
        + brokenLinks
        + yamlFailures
        + hygieneFailures
        + gateReferenceFailures(readmes)
        + ownerFailures
        + currentRubricFailures
        + evaluationSchemaFailures()
        + fixtureFailures
        + packetManifestFailures(packetId)
        + implementationFailures
    )
    return {
        "passed": not failures,
        "scope": relativePath(INITIATIVE),
        "packet": packetId,
        "facts": {
            "activeReadmes": len(readmes),
            "packetReadmes": len(packets),
            "localLinks": linkCount,
            "brokenLinks": len(brokenLinks),
            "yamlFiles": yamlCount,
            "yamlParseFailures": len(yamlFailures),
            "emDashOccurrences": emDashCount,
            "trailingWhitespaceOccurrences": trailingCount,
            "duplicateCreationOwners": duplicateCount,
            "registeredGates": len(registeredGateNames()),
            "negativeFixtureCount": fixtureCount,
            "negativeFixturesRejected": fixtureCount - len(fixtureFailures),
            "rubric": rubric,
        },
        "failures": sorted(set(failures)),
    }


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Audit mainPlan claims against current repository facts.")
    parser.add_argument("--packet", help="Require a remediation packet's fact-audit wiring to be implemented.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = buildParser().parse_args(argv)
    startedAt = utcTimestamp()
    started = time.monotonic()
    try:
        result = verifyPlanFacts(args.packet)
    except PlanFactError as exc:
        result = {"passed": False, "scope": relativePath(INITIATIVE), "packet": args.packet, "facts": {}, "failures": [str(exc)]}
    payload = {
        "schemaVersion": 1,
        "gate": "plan-quality",
        "audit": "plan-fact-audit",
        "status": "passed" if result["passed"] else "failed",
        "passed": result["passed"],
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "reportPath": relativePath(REPORT_PATH),
        **{key: value for key, value in result.items() if key != "passed"},
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if not result["passed"]:
        print("FAIL: plan fact audit found repository contradictions", file=sys.stderr)
        for failure in result["failures"]:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    print(
        f"ok: plan facts valid ({payload['facts']['activeReadmes']} readmes, "
        f"{payload['facts']['negativeFixturesRejected']} negative fixtures rejected)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
