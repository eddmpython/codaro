from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import subprocess
import sys
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[2]
REPORT_PATH = ROOT / "output" / "test-runner" / "removed-learning-concepts" / "report.json"
REMOVED_PATHS = (
    "src/codaro/curriculum/predictionDiff.py",
    "tests/learning/testPredictionDiff.py",
    "tests/curriculum/verifyPredictContractStrict.py",
    "tests/_predictStrictCategories.txt",
    "docs/skills/ops/tools/backfillPredictPrompts.py",
)
SCAN_ROOTS = (
    ROOT / "src" / "codaro",
    ROOT / "editor" / "src",
    ROOT / "tests",
    ROOT / "docs" / "skills" / "architecture",
    ROOT / "docs" / "skills" / "ops" / "foundation",
)
SCAN_SUFFIXES = {".py", ".ts", ".tsx", ".md", ".yml", ".yaml"}
FORBIDDEN_TOKENS = tuple(
    "".join(parts)
    for parts in (
        ("Learning", "PredictContract"),
        ("Learner", "PredictionPayload"),
        ("Predict", "Config"),
        ("Prediction", "Diff"),
        ("compare", "Prediction"),
        ("record-", "prediction-result"),
        ("propose-", "predict-prompts"),
        ("prediction", "Mismatch"),
        ("predict-contract-", "strict"),
    )
)


def currentGitHead() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def yamlPredictKeys() -> list[str]:
    matches: list[str] = []
    for path in sorted((ROOT / "curricula" / "python").rglob("*.yaml")):
        document = yaml.compose(path.read_text(encoding="utf-8"))
        if document is None:
            continue
        stack: list[yaml.Node] = [document]
        while stack:
            node = stack.pop()
            if isinstance(node, yaml.MappingNode):
                for key, value in node.value:
                    if isinstance(key, yaml.ScalarNode) and key.value == "predict":
                        relative = path.relative_to(ROOT).as_posix()
                        matches.append(f"{relative}:{key.start_mark.line + 1}")
                    stack.append(value)
            elif isinstance(node, yaml.SequenceNode):
                stack.extend(node.value)
    return matches


def forbiddenReferences() -> list[dict[str, Any]]:
    references: list[dict[str, Any]] = []
    verifierPath = Path(__file__).resolve()
    for scanRoot in SCAN_ROOTS:
        for path in sorted(scanRoot.rglob("*")):
            if path == verifierPath or not path.is_file() or path.suffix.lower() not in SCAN_SUFFIXES:
                continue
            text = path.read_text(encoding="utf-8")
            for lineNumber, line in enumerate(text.splitlines(), start=1):
                found = sorted(token for token in FORBIDDEN_TOKENS if token in line)
                if found:
                    references.append({
                        "path": path.relative_to(ROOT).as_posix(),
                        "line": lineNumber,
                        "tokens": found,
                    })
    return references


def main() -> int:
    startedAt = datetime.now(UTC)
    existingRemovedPaths = [relative for relative in REMOVED_PATHS if (ROOT / relative).exists()]
    predictKeys = yamlPredictKeys()
    references = forbiddenReferences()
    failures = [
        *[f"removed path still exists: {path}" for path in existingRemovedPaths],
        *[f"learner predict YAML key remains: {location}" for location in predictKeys],
        *[
            f"removed learner prediction reference: {row['path']}:{row['line']}"
            for row in references
        ],
    ]
    completedAt = datetime.now(UTC)
    report = {
        "schemaVersion": 1,
        "status": "passed" if not failures else "failed",
        "completionEligible": not failures,
        "gitHead": currentGitHead(),
        "startedAt": startedAt.isoformat(),
        "completedAt": completedAt.isoformat(),
        "durationMs": round((completedAt - startedAt).total_seconds() * 1000),
        "removedPathCount": len(REMOVED_PATHS),
        "existingRemovedPaths": existingRemovedPaths,
        "learnerPredictYamlKeyCount": len(predictKeys),
        "learnerPredictYamlKeys": predictKeys,
        "forbiddenReferenceCount": len(references),
        "forbiddenReferences": references,
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print("ok: removed learner prediction concepts remain absent")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
