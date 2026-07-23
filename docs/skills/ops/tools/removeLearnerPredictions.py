from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[4]
CURRICULUM_ROOT = ROOT / "curricula" / "python"
EXPECTED_MIGRATION_COUNT = 332
ALLOWED_PREDICT_FIELDS = {"prompt", "expectedValue", "expectedDtype", "expectedError"}


@dataclass(frozen=True)
class Removal:
    startLine: int
    endLine: int


def mappingKeys(node: yaml.MappingNode) -> set[str]:
    return {
        key.value
        for key, _ in node.value
        if isinstance(key, yaml.ScalarNode)
    }


def collectRemovals(text: str, path: Path) -> list[Removal]:
    document = yaml.compose(text)
    if document is None:
        return []
    removals: list[Removal] = []
    stack: list[yaml.Node] = [document]
    while stack:
        node = stack.pop()
        if isinstance(node, yaml.MappingNode):
            parentKeys = mappingKeys(node)
            for key, value in node.value:
                if isinstance(key, yaml.ScalarNode) and key.value == "predict":
                    if "starterCode" not in parentKeys or "prompt" not in parentKeys:
                        raise ValueError(f"predict is not an exercise field: {path}:{key.start_mark.line + 1}")
                    if not isinstance(value, yaml.MappingNode):
                        raise ValueError(f"predict value is not a mapping: {path}:{key.start_mark.line + 1}")
                    unexpectedFields = mappingKeys(value) - ALLOWED_PREDICT_FIELDS
                    if unexpectedFields:
                        fields = ", ".join(sorted(unexpectedFields))
                        raise ValueError(
                            f"predict has unknown fields ({fields}): {path}:{key.start_mark.line + 1}"
                        )
                    startLine = key.start_mark.line
                    endLine = value.end_mark.line
                    if key.start_mark.column <= 0 or endLine <= startLine:
                        raise ValueError(f"predict is not a removable block: {path}:{startLine + 1}")
                    line = text.splitlines()[startLine]
                    if line[: key.start_mark.column].strip():
                        raise ValueError(f"predict does not start on its own line: {path}:{startLine + 1}")
                    removals.append(Removal(startLine=startLine, endLine=endLine))
                    continue
                stack.append(value)
        elif isinstance(node, yaml.SequenceNode):
            stack.extend(node.value)
    return removals


def stripPredictionValues(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: stripPredictionValues(child)
            for key, child in value.items()
            if key != "predict"
        }
    if isinstance(value, list):
        return [stripPredictionValues(child) for child in value]
    return value


def removeBlocks(text: str, removals: list[Removal], path: Path) -> str:
    lines = text.splitlines(keepends=True)
    for removal in sorted(removals, key=lambda row: row.startLine, reverse=True):
        del lines[removal.startLine : removal.endLine]
    updated = "".join(lines)
    expected = stripPredictionValues(yaml.safe_load(text))
    actual = yaml.safe_load(updated)
    if actual != expected:
        raise ValueError(f"non-predict curriculum content changed: {path}")
    if collectRemovals(updated, path):
        raise ValueError(f"predict blocks remain after migration: {path}")
    return updated


def scan() -> list[tuple[Path, str, list[Removal]]]:
    matches: list[tuple[Path, str, list[Removal]]] = []
    for path in sorted(CURRICULUM_ROOT.rglob("*.yaml")):
        text = path.read_text(encoding="utf-8")
        removals = collectRemovals(text, path)
        if removals:
            matches.append((path, text, removals))
    return matches


def main() -> int:
    parser = argparse.ArgumentParser(
        description="remove the redundant learner prediction step from curriculum exercises"
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--write", action="store_true")
    args = parser.parse_args()

    try:
        matches = scan()
        count = sum(len(removals) for _, _, removals in matches)
        if args.check:
            if count:
                print(f"FAIL: learner prediction blocks remain: {count} in {len(matches)} files")
                return 1
            print("ok: learner prediction blocks are absent")
            return 0
        if count == 0:
            print("ok: learner prediction blocks are already absent")
            return 0
        if count != EXPECTED_MIGRATION_COUNT:
            print(
                "FAIL: learner prediction migration count differs: "
                f"{count} != {EXPECTED_MIGRATION_COUNT}"
            )
            return 1
        for path, text, removals in matches:
            path.write_text(removeBlocks(text, removals, path), encoding="utf-8")
    except (OSError, ValueError, yaml.YAMLError) as exc:
        print(f"FAIL: {exc}")
        return 1

    print(f"ok: removed {count} learner prediction blocks from {len(matches)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
