from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[4]
CATALOG_PATH = ROOT / "contracts" / "publicLearningCatalog.json"
CURRICULA_ROOT = ROOT / "curricula" / "python"


class PublicLearningCatalogError(ValueError):
    pass


def loadYaml(path: Path) -> dict[str, Any]:
    value = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise PublicLearningCatalogError(f"YAML root must be an object: {path.relative_to(ROOT)}")
    return value


def curriculumLessonRefs() -> set[str]:
    lessonRefs: set[str] = set()
    for path in sorted(CURRICULA_ROOT.rglob("*.yaml")):
        if path.name.startswith("_") or path.name == "schema.yaml":
            continue
        payload = loadYaml(path)
        meta = payload.get("meta")
        if not isinstance(meta, dict) or not meta.get("category") or not meta.get("title"):
            continue
        lessonRef = f"{meta['category']}/{path.stem}"
        if lessonRef in lessonRefs:
            raise PublicLearningCatalogError(f"duplicate curriculum LessonRef: {lessonRef}")
        lessonRefs.add(lessonRef)
    return lessonRefs


def candidateLedgerRoots() -> list[Path]:
    candidates: list[Path] = []
    for path in (ROOT / "mainPlan").rglob("content-ledger"):
        if path.is_dir() and path.parent.name == "00-identity-integrity":
            candidates.append(path)
    return sorted(candidates)


def rowsFromLedgers() -> list[dict[str, object]]:
    curriculumRefs = curriculumLessonRefs()
    complete: list[tuple[Path, list[dict[str, object]]]] = []
    for directory in candidateLedgerRoots():
        rows: list[dict[str, object]] = []
        seen: set[str] = set()
        for path in sorted(directory.glob("*.yml")):
            payload = loadYaml(path)
            lessons = payload.get("lessons")
            if not isinstance(lessons, list):
                continue
            for source in lessons:
                if not isinstance(source, dict):
                    raise PublicLearningCatalogError(f"invalid content row: {path.relative_to(ROOT)}")
                lessonRef = str(source.get("lessonRef", ""))
                runtimeTier = str(source.get("runtimeTier", ""))
                eligiblePathIds = source.get("eligiblePathIds")
                checkSpecId = str(source.get("checkSpecId", ""))
                if (
                    not lessonRef
                    or lessonRef in seen
                    or runtimeTier not in {"browser", "local"}
                    or not isinstance(eligiblePathIds, list)
                    or not eligiblePathIds
                    or not all(isinstance(item, str) and item for item in eligiblePathIds)
                    or not checkSpecId
                ):
                    raise PublicLearningCatalogError(f"invalid content contract row: {lessonRef or path.name}")
                seen.add(lessonRef)
                rows.append({
                    "checkSpecId": checkSpecId,
                    "eligiblePathIds": sorted(set(eligiblePathIds)),
                    "lessonRef": lessonRef,
                    "runtimeTier": runtimeTier,
                })
        if seen == curriculumRefs:
            complete.append((directory, sorted(rows, key=lambda row: str(row["lessonRef"]))))
    if len(complete) != 1:
        labels = [str(path.relative_to(ROOT)) for path, _ in complete]
        raise PublicLearningCatalogError(f"expected one complete content ledger source, found {labels}")
    return complete[0][1]


def validateCatalog(value: object) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) != {"canonicalIdentity", "lessons", "schemaVersion"}:
        raise PublicLearningCatalogError("public learning catalog fields are invalid")
    if value.get("schemaVersion") != 1 or value.get("canonicalIdentity") != "category/contentId":
        raise PublicLearningCatalogError("public learning catalog version or identity is invalid")
    rows = value.get("lessons")
    if not isinstance(rows, list):
        raise PublicLearningCatalogError("public learning catalog lessons must be an array")
    lessonRefs: set[str] = set()
    for row in rows:
        if not isinstance(row, dict) or set(row) != {"checkSpecId", "eligiblePathIds", "lessonRef", "runtimeTier"}:
            raise PublicLearningCatalogError("public learning catalog row fields are invalid")
        lessonRef = row.get("lessonRef")
        eligiblePathIds = row.get("eligiblePathIds")
        if (
            not isinstance(lessonRef, str)
            or "/" not in lessonRef
            or lessonRef in lessonRefs
            or row.get("runtimeTier") not in {"browser", "local"}
            or not isinstance(row.get("checkSpecId"), str)
            or not row["checkSpecId"]
            or not isinstance(eligiblePathIds, list)
            or not eligiblePathIds
            or not all(isinstance(item, str) and item for item in eligiblePathIds)
            or eligiblePathIds != sorted(set(eligiblePathIds))
        ):
            raise PublicLearningCatalogError(f"invalid public learning catalog row: {lessonRef}")
        lessonRefs.add(lessonRef)
    curriculumRefs = curriculumLessonRefs()
    if lessonRefs != curriculumRefs:
        missing = sorted(curriculumRefs - lessonRefs)[:5]
        extra = sorted(lessonRefs - curriculumRefs)[:5]
        raise PublicLearningCatalogError(f"catalog/curriculum identity mismatch: missing={missing} extra={extra}")
    return value


def main() -> int:
    parser = argparse.ArgumentParser(description="build or verify the stable public learning catalog")
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    try:
        if args.write:
            payload = {
                "schemaVersion": 1,
                "canonicalIdentity": "category/contentId",
                "lessons": rowsFromLedgers(),
            }
            CATALOG_PATH.write_text(
                json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=False) + "\n",
                encoding="utf-8",
            )
        payload = validateCatalog(json.loads(CATALOG_PATH.read_text(encoding="utf-8")))
    except (OSError, json.JSONDecodeError, yaml.YAMLError, PublicLearningCatalogError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1
    browser = sum(row["runtimeTier"] == "browser" for row in payload["lessons"])
    local = len(payload["lessons"]) - browser
    print(f"ok: public learning catalog lessons={len(payload['lessons'])} browser={browser} local={local}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
