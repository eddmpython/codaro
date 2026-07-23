from __future__ import annotations

import argparse
import hashlib
import json
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any

import yaml

from codaro.curriculum.lessonGraph import LessonGraph, buildLessonGraph
from codaro.curriculum.planComposer import PlanGoal, composeMasterPlan
from codaro.curriculum.studyLoader import StudyLoader
from codaro.curriculum.taxonomy import CurriculumTaxonomy, loadTaxonomy


ROOT = Path(__file__).resolve().parents[4]
IDENTITY_ROOT = ROOT / "mainPlan" / "astryx-product-experience" / "08-learning-content" / "00-identity-integrity"
CONTENT_ROOT = IDENTITY_ROOT / "content-ledger"
IDENTITY_LEDGER_ROOT = IDENTITY_ROOT / "identity-ledger"
IDENTITY_SUMMARY_PATH = IDENTITY_LEDGER_ROOT / "summary.yml"
EVIDENCE_ROOT = IDENTITY_ROOT / "evidence"
ALIAS_MIGRATION_PATH = EVIDENCE_ROOT / "legacy-alias-migration.yml"
TAXONOMY_TRANSITION_PATH = EVIDENCE_ROOT / "taxonomy-transition.yml"
LEARNING_CONTENT_ROOT = IDENTITY_ROOT.parent
SOURCE_ROOT = ROOT / "curricula" / "python"
TAXONOMY_PATH = SOURCE_ROOT / "_taxonomy.yml"
SUMMARY_PATH = CONTENT_ROOT / "summary.yml"


def loadYaml(path: Path) -> dict[str, Any]:
    value = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"YAML root must be a mapping: {path.relative_to(ROOT)}")
    return value


def identitySources() -> dict[str, str]:
    sources: dict[str, str] = {}
    for path in sorted((IDENTITY_ROOT / "identity-ledger").glob("*.yml")):
        for row in loadYaml(path).get("lessons", []):
            lessonRef = str(row.get("lessonRef", ""))
            sourcePath = str(row.get("sourcePath", ""))
            if not lessonRef or not sourcePath:
                raise ValueError(f"identity row missing lessonRef/sourcePath: {path.relative_to(ROOT)}")
            if lessonRef in sources:
                raise ValueError(f"duplicate identity lessonRef: {lessonRef}")
            sources[lessonRef] = sourcePath
    return sources


def identityRows() -> dict[str, tuple[Path, dict[str, Any]]]:
    rows: dict[str, tuple[Path, dict[str, Any]]] = {}
    for path in sorted(IDENTITY_LEDGER_ROOT.glob("*.yml")):
        if path == IDENTITY_SUMMARY_PATH:
            continue
        payload = loadYaml(path)
        category = str(payload.get("category", ""))
        lessons = payload.get("lessons", [])
        if not isinstance(lessons, list):
            raise ValueError(f"identity lessons must be a list: {path.relative_to(ROOT)}")
        if payload.get("sourceCount") != len(lessons):
            raise ValueError(f"identity sourceCount mismatch: {path.relative_to(ROOT)}")
        for row in lessons:
            if not isinstance(row, dict):
                raise ValueError(f"identity row must be a mapping: {path.relative_to(ROOT)}")
            lessonRef = str(row.get("lessonRef", ""))
            if not lessonRef or lessonRef in rows:
                raise ValueError(f"invalid or duplicate identity lessonRef: {lessonRef}")
            if lessonRef.split("/", 1)[0] != category:
                raise ValueError(f"identity category mismatch: {lessonRef}")
            rows[lessonRef] = (path, row)
    return rows


def contentRows() -> dict[str, tuple[Path, dict[str, Any]]]:
    rows: dict[str, tuple[Path, dict[str, Any]]] = {}
    for path in sorted(CONTENT_ROOT.glob("*.yml")):
        if path == SUMMARY_PATH:
            continue
        for row in loadYaml(path).get("lessons", []):
            lessonRef = str(row.get("lessonRef", ""))
            if not lessonRef:
                raise ValueError(f"content row missing lessonRef: {path.relative_to(ROOT)}")
            if lessonRef in rows:
                raise ValueError(f"duplicate content lessonRef: {lessonRef}")
            rows[lessonRef] = (path, row)
    return rows


def pathLedgers() -> dict[str, tuple[Path, dict[str, Any]]]:
    rows: dict[str, tuple[Path, dict[str, Any]]] = {}
    for path in sorted(LEARNING_CONTENT_ROOT.rglob("lesson-ledger.yml")):
        payload = loadYaml(path)
        pathId = str(payload.get("pathId", ""))
        if not pathId or pathId in rows:
            raise ValueError(f"invalid or duplicate pathId: {pathId}")
        rows[pathId] = (path, payload)
    return rows


def fileSha256(path: Path) -> str:
    content = path.read_bytes().replace(b"\r\n", b"\n").replace(b"\r", b"\n")
    return hashlib.sha256(content).hexdigest()


def aggregateHash(entries: list[dict[str, str]]) -> str:
    payload = json.dumps(entries, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def replaceQuotedScalar(text: str, key: str, old: str, new: str, context: str) -> str:
    token = f'{key}: "{old}"'
    if text.count(token) != 1:
        raise ValueError(f"cannot update {key} for {context}: expected one exact scalar")
    return text.replace(token, f'{key}: "{new}"', 1)


def replaceRowField(
    text: str,
    lessonRef: str,
    key: str,
    oldValue: Any,
    newValue: Any,
) -> str:
    rowToken = f'  - lessonRef: "{lessonRef}"'
    start = text.find(rowToken)
    if start < 0:
        raise ValueError(f"cannot find generated row: {lessonRef}")
    nextStart = text.find("\n  - lessonRef: ", start + len(rowToken))
    end = len(text) if nextStart < 0 else nextStart
    block = text[start:end]
    old = yamlFlowValue(oldValue)
    new = yamlFlowValue(newValue)
    token = f"    {key}: {old}"
    if block.count(token) != 1:
        raise ValueError(f"cannot update {key} for {lessonRef}: expected one exact field")
    block = block.replace(token, f"    {key}: {new}", 1)
    return text[:start] + block + text[end:]


def yamlFlowValue(value: Any) -> str:
    if isinstance(value, str):
        return value
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def dumpYaml(payload: dict[str, Any]) -> str:
    return yaml.safe_dump(payload, allow_unicode=True, sort_keys=False, width=1_000_000)


def reviewBlock(path: Path) -> dict[str, Any]:
    if path.is_file():
        review = loadYaml(path).get("review")
        if isinstance(review, dict):
            return dict(review)
    return {
        "status": "pending",
        "reviewerId": None,
        "reviewedAt": None,
        "evidenceCommit": None,
    }


def validateReview(review: dict[str, Any], label: str) -> list[str]:
    status = review.get("status")
    if status == "pending":
        if any(review.get(key) is not None for key in ("reviewerId", "reviewedAt", "evidenceCommit")):
            return [f"{label} pending review contains approval identity"]
        return []
    if status != "approved":
        return [f"{label} review status must be pending or approved"]
    missing = [key for key in ("reviewerId", "reviewedAt", "evidenceCommit") if not review.get(key)]
    if missing:
        return [f"{label} approved review missing: {', '.join(missing)}"]
    evidenceCommit = str(review.get("evidenceCommit", ""))
    if len(evidenceCommit) != 40 or any(character not in "0123456789abcdef" for character in evidenceCommit.lower()):
        return [f"{label} evidenceCommit must be a 40-hex git commit"]
    return []


def curriculumState() -> tuple[CurriculumTaxonomy, LessonGraph]:
    taxonomy = loadTaxonomy(TAXONOMY_PATH)
    graph = buildLessonGraph(StudyLoader(SOURCE_ROOT), taxonomy)
    return taxonomy, graph


def orderHash(lessonRefs: list[str]) -> str:
    payload = json.dumps(lessonRefs, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def expectedIdentitySummary(
    rows: dict[str, tuple[Path, dict[str, Any]]],
    graphKeys: set[str],
    snapshotDate: str,
) -> dict[str, Any]:
    aliases: dict[str, list[str]] = defaultdict(list)
    mismatchCount = 0
    approvedCount = 0
    for lessonRef, (_, row) in rows.items():
        contentId = lessonRef.split("/", 1)[1]
        metaId = str(row.get("metaId", ""))
        aliases[metaId].append(lessonRef)
        mismatchCount += int(metaId != contentId)
        approvedCount += int(row.get("reviewStatus") == "approved")
    duplicateAliases = {
        alias: sorted(lessonRefs)
        for alias, lessonRefs in sorted(aliases.items())
        if len(lessonRefs) > 1
    }
    missing = sorted(set(rows) - graphKeys)
    return {
        "schemaVersion": 1,
        "snapshotDate": snapshotDate,
        "canonicalIdentity": "category/contentId",
        "sourceRows": len(rows),
        "categoryFiles": len({path for path, _ in rows.values()}),
        "registeredRows": len(set(rows) & graphKeys),
        "missingRegistryRows": len(missing),
        "pendingHumanReviewRows": len(rows) - approvedCount,
        "approvedHumanReviewRows": approvedCount,
        "metaIdMismatchRows": mismatchCount,
        "globalDuplicateAliasCount": len(duplicateAliases),
        "globalDuplicateAliases": duplicateAliases,
        "missingLessonRefs": missing,
        "migrationLedger": "00-identity-integrity/evidence/legacy-alias-migration.yml",
        "completionRule": "registeredRows=472 and pendingHumanReviewRows=0 with evidence commits",
    }


def expectedAliasMigration(
    rows: dict[str, tuple[Path, dict[str, Any]]],
    review: dict[str, Any],
) -> dict[str, Any]:
    aliases: dict[str, list[str]] = defaultdict(list)
    for lessonRef, (_, row) in rows.items():
        aliases[str(row.get("metaId", ""))].append(lessonRef)
    migrations: list[dict[str, Any]] = []
    for lessonRef, (_, row) in sorted(rows.items()):
        category, contentId = lessonRef.split("/", 1)
        alias = str(row.get("metaId", ""))
        if alias == contentId:
            continue
        globalMatches = sorted(aliases[alias])
        categoryMatches = [candidate for candidate in globalMatches if candidate.startswith(f"{category}/")]
        migrations.append({
            "legacyLessonRef": f"{category}/{alias}",
            "canonicalLessonRef": lessonRef,
            "sourcePath": str(row.get("sourcePath", "")),
            "categoryScopedUnique": len(categoryMatches) == 1,
            "globalCollisionRefs": globalMatches if len(globalMatches) > 1 else [],
            "migrationDisposition": "canonicalize-on-read",
        })
    collisionAliases = sorted({
        str(row.get("metaId", ""))
        for _, row in rows.values()
        if len(aliases[str(row.get("metaId", ""))]) > 1
    })
    return {
        "schemaVersion": 1,
        "state": "draft" if review.get("status") != "approved" else "approved",
        "canonicalIdentity": "category/contentId",
        "migrationRowCount": len(migrations),
        "categoryScopedCollisionCount": sum(not row["categoryScopedUnique"] for row in migrations),
        "globalDuplicateAliasCount": len(collisionAliases),
        "globalDuplicateAliases": collisionAliases,
        "readerPolicy": {
            "requiresCategory": True,
            "unscopedDuplicateAliasResult": "migration-error",
            "writeFormat": "canonical-only",
            "legacyCreditUpgrade": False,
        },
        "migrations": migrations,
        "review": review,
    }


def expectedPlans(
    pathRows: dict[str, tuple[Path, dict[str, Any]]],
    graph: LessonGraph,
    taxonomy: CurriculumTaxonomy,
) -> dict[str, dict[str, Any]]:
    plans: dict[str, dict[str, Any]] = {}
    for pathId in sorted(pathRows):
        plan = composeMasterPlan(
            PlanGoal(domain=pathId, excludeCompleted=False, adaptiveSkip=False),
            graph,
            taxonomy,
        )
        plans[pathId] = {
            "targetOutcomes": list(plan.targetOutcomes),
            "gaps": [gap.model_dump() for gap in plan.gaps],
            "lessonRefs": [step.key for step in plan.steps],
        }
    return plans


def expectedTaxonomyTransition(
    summary: dict[str, Any],
    pathRows: dict[str, tuple[Path, dict[str, Any]]],
    plans: dict[str, dict[str, Any]],
    graph: LessonGraph,
    sourceSetHash: str,
    review: dict[str, Any],
) -> dict[str, Any]:
    plannedOutcomes = [str(value) for value in summary.get("plannedTaxonomyOutcomeIds", [])]
    addedLessonRefs = sorted(
        lesson.key
        for lesson in graph.lessons
        if set(lesson.outcomes) & set(plannedOutcomes)
    )
    pathDiffs: list[dict[str, Any]] = []
    for pathId, (path, payload) in sorted(pathRows.items()):
        fromRefs = [str(row.get("lessonRef", "")) for row in payload.get("lessons", [])]
        targetRefs = list(plans[pathId]["lessonRefs"])
        fromOrder = {lessonRef: index + 1 for index, lessonRef in enumerate(fromRefs)}
        targetOrder = {lessonRef: index + 1 for index, lessonRef in enumerate(targetRefs)}
        orderChanges = [
            {
                "lessonRef": lessonRef,
                "fromOrder": fromOrder[lessonRef],
                "toOrder": targetOrder[lessonRef],
            }
            for lessonRef in fromRefs
            if lessonRef in targetOrder and fromOrder[lessonRef] != targetOrder[lessonRef]
        ]
        pathDiffs.append({
            "pathId": pathId,
            "ledgerPath": path.relative_to(LEARNING_CONTENT_ROOT).as_posix(),
            "fromCount": len(fromRefs),
            "toCount": len(targetRefs),
            "fromOrderHash": orderHash(fromRefs),
            "toOrderHash": orderHash(targetRefs),
            "addedLessonRefs": [lessonRef for lessonRef in targetRefs if lessonRef not in fromOrder],
            "droppedLessonRefs": [lessonRef for lessonRef in fromRefs if lessonRef not in targetOrder],
            "orderChanges": orderChanges,
        })
    return {
        "schemaVersion": 1,
        "state": "draft" if review.get("status") != "approved" else "approved",
        "applyState": "proposed",
        "fromHash": str(summary.get("baselineTaxonomyHash", "")),
        "toHash": fileSha256(TAXONOMY_PATH),
        "composerVersionHash": fileSha256(ROOT / "src" / "codaro" / "curriculum" / "planComposer.py"),
        "sourceSetHash": sourceSetHash,
        "fromGraphCount": 469,
        "toGraphCount": len(graph.lessons),
        "addedOutcomeIds": plannedOutcomes,
        "addedLessonRefs": addedLessonRefs,
        "pathDiffs": pathDiffs,
        "review": review,
    }


def writeGeneratedYaml(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(dumpYaml(payload), encoding="utf-8")


def sameYaml(path: Path, payload: dict[str, Any]) -> bool:
    if not path.is_file():
        return False
    return loadYaml(path) == payload


def renderedPathLedger(
    current: dict[str, Any],
    plan: dict[str, Any],
    graphCount: int,
    taxonomyHash: str,
    sourceSetHash: str,
) -> dict[str, Any]:
    return {
        "schemaVersion": 1,
        "pathId": str(current.get("pathId", "")),
        "composerSnapshotDate": date.today().isoformat(),
        "composerGraphCount": graphCount,
        "composerVersionHash": fileSha256(ROOT / "src/codaro/curriculum/planComposer.py"),
        "taxonomySnapshotHash": taxonomyHash,
        "sourceSetHash": sourceSetHash,
        "ledgerTool": "uv run python -X utf8 docs/skills/ops/tools/buildLearningLedgers.py --check",
        "targetOutcomes": list(plan["targetOutcomes"]),
        "gaps": list(plan["gaps"]),
        "lessons": [
            {
                "order": order,
                "lessonRef": lessonRef,
                "canonicalContentRef": lessonRef,
            }
            for order, lessonRef in enumerate(plan["lessonRefs"], start=1)
        ],
    }


def validateAppliedTransition(
    transition: dict[str, Any],
    plans: dict[str, dict[str, Any]],
) -> list[str]:
    failures: list[str] = []
    pathDiffs = transition.get("pathDiffs")
    if not isinstance(pathDiffs, list):
        return ["applied taxonomy transition pathDiffs are absent"]
    byPath = {
        str(row.get("pathId", "")): row
        for row in pathDiffs
        if isinstance(row, dict)
    }
    if set(byPath) != set(plans):
        failures.append("applied taxonomy transition pathDiffs do not cover every path")
        return failures
    for pathId, plan in plans.items():
        targetRefs = list(plan["lessonRefs"])
        row = byPath[pathId]
        if row.get("toCount") != len(targetRefs) or row.get("toOrderHash") != orderHash(targetRefs):
            failures.append(f"applied taxonomy transition target differs: {pathId}")
    return failures


def evaluate(write: bool, applyTransition: bool = False) -> list[str]:
    taxonomy, graph = curriculumState()
    graphByKey = {lesson.key: lesson for lesson in graph.lessons}
    graphKeys = set(graphByKey)
    identity = identityRows()
    sources = {lessonRef: str(row.get("sourcePath", "")) for lessonRef, (_, row) in identity.items()}
    rows = contentRows()
    paths = pathLedgers()
    failures: list[str] = []
    if set(sources) != set(rows):
        failures.append(
            f"identity/content lesson sets differ: identity={len(sources)} content={len(rows)}"
        )
    if set(sources) != graphKeys:
        failures.append(f"identity/graph lesson sets differ: identity={len(sources)} graph={len(graphKeys)}")
    if len(paths) != len(taxonomy.domains):
        failures.append(f"path/domain count differs: paths={len(paths)} domains={len(taxonomy.domains)}")

    identityUpdates: dict[Path, list[tuple[str, str, Any, Any]]] = defaultdict(list)
    for lessonRef, (ledgerPath, row) in sorted(identity.items()):
        sourcePath = ROOT / str(row.get("sourcePath", ""))
        if not sourcePath.is_file() or SOURCE_ROOT not in sourcePath.parents:
            failures.append(f"invalid identity source path: {lessonRef} -> {sourcePath}")
            continue
        if sourcePath.stem != lessonRef.split("/", 1)[1]:
            failures.append(f"identity source stem mismatch: {lessonRef}")
        sourceMeta = loadYaml(sourcePath).get("meta")
        if not isinstance(sourceMeta, dict) or str(sourceMeta.get("id", "")) != str(row.get("metaId", "")):
            failures.append(f"identity metaId mismatch: {lessonRef}")
        expectedRegistryStatus = "registered" if lessonRef in graphKeys else "missing"
        recordedRegistryStatus = str(row.get("registryStatus", ""))
        if recordedRegistryStatus != expectedRegistryStatus:
            if write:
                identityUpdates[ledgerPath].append(
                    (lessonRef, "registryStatus", recordedRegistryStatus, expectedRegistryStatus)
                )
            else:
                failures.append(f"stale registryStatus: {lessonRef}")
        if row.get("reviewStatus") not in {"pending", "approved"}:
            failures.append(f"invalid identity reviewStatus: {lessonRef}")

    hashUpdates: dict[Path, list[tuple[str, str, str]]] = defaultdict(list)
    contentFieldUpdates: dict[Path, list[tuple[str, str, Any, Any]]] = defaultdict(list)
    entries: list[dict[str, str]] = []
    for lessonRef in sorted(set(sources) & set(rows)):
        sourcePath = ROOT / sources[lessonRef]
        if not sourcePath.is_file() or SOURCE_ROOT not in sourcePath.parents:
            failures.append(f"invalid curriculum source path: {lessonRef} -> {sources[lessonRef]}")
            continue
        ledgerPath, row = rows[lessonRef]
        expected = fileSha256(sourcePath)
        recorded = str(row.get("lessonContentHash", ""))
        if recorded != expected:
            if write:
                hashUpdates[ledgerPath].append((lessonRef, recorded, expected))
            else:
                failures.append(f"stale lessonContentHash: {lessonRef}")
        requiredFields = {
            "lessonRef", "identityLedgerRef", "lessonContentHash", "disposition", "ownerPacket",
            "eligiblePathIds", "outcomes", "prerequisites", "reinforcesOutcomeIds", "runtimeTier",
            "checkSpecId", "checkKinds", "retrievalVariantIds", "transferVariantIds", "artifactDecision",
            "visualDecision", "reviewerRoles", "authorReviewStatus", "evidenceCommitRequirement",
        }
        missingFields = sorted(requiredFields - set(row))
        if missingFields:
            failures.append(f"content row missing fields {missingFields}: {lessonRef}")
        outcomes = [str(value) for value in row.get("outcomes", [])]
        prerequisites = [str(value) for value in row.get("prerequisites", [])]
        if not outcomes:
            failures.append(f"content outcomes are empty: {lessonRef}")
        graphLesson = graphByKey.get(lessonRef)
        if graphLesson is not None:
            for key, recordedValues, expectedValues in (
                ("outcomes", outcomes, list(graphLesson.outcomes)),
                ("prerequisites", prerequisites, list(graphLesson.prerequisites)),
            ):
                if expectedValues and recordedValues != expectedValues:
                    if write:
                        contentFieldUpdates[ledgerPath].append((lessonRef, key, recordedValues, expectedValues))
                        if key == "outcomes":
                            outcomes = expectedValues
                        else:
                            prerequisites = expectedValues
                    else:
                        failures.append(f"content {key} differs from runtime graph: {lessonRef}")
        expectedReinforces = [value for value in outcomes if value in set(prerequisites)]
        recordedReinforces = [str(value) for value in row.get("reinforcesOutcomeIds", [])]
        if recordedReinforces != expectedReinforces:
            if write:
                contentFieldUpdates[ledgerPath].append(
                    (lessonRef, "reinforcesOutcomeIds", recordedReinforces, expectedReinforces)
                )
            else:
                failures.append(f"reinforcesOutcomeIds mismatch: {lessonRef}")
        ownerPacket = LEARNING_CONTENT_ROOT / str(row.get("ownerPacket", ""))
        if not ownerPacket.is_dir():
            failures.append(f"content owner packet is absent: {lessonRef} -> {row.get('ownerPacket')}")
        entries.append({
            "lessonContentHash": expected,
            "lessonRef": lessonRef,
            "sourcePath": sources[lessonRef],
        })

    summary = loadYaml(SUMMARY_PATH)
    expectedAggregate = aggregateHash(entries)
    recordedAggregate = str(summary.get("sourceSetHash", ""))
    plans = expectedPlans(paths, graph, taxonomy)
    aliasReview = reviewBlock(ALIAS_MIGRATION_PATH)
    recordedTransition = loadYaml(TAXONOMY_TRANSITION_PATH) if TAXONOMY_TRANSITION_PATH.is_file() else {}
    transitionReview = reviewBlock(TAXONOMY_TRANSITION_PATH)
    failures.extend(validateReview(aliasReview, "legacy alias migration"))
    failures.extend(validateReview(transitionReview, "taxonomy transition"))
    expectedAlias = expectedAliasMigration(identity, aliasReview)
    proposedTransition = expectedTaxonomyTransition(
        summary,
        paths,
        plans,
        graph,
        expectedAggregate,
        transitionReview,
    )
    transitionApplied = recordedTransition.get("applyState") == "applied"
    if transitionApplied:
        expectedTransition = dict(proposedTransition)
        expectedTransition["applyState"] = "applied"
        expectedTransition["pathDiffs"] = recordedTransition.get("pathDiffs", [])
        failures.extend(validateAppliedTransition(expectedTransition, plans))
    else:
        expectedTransition = proposedTransition
    recordedIdentitySummary = loadYaml(IDENTITY_SUMMARY_PATH)
    snapshotDate = date.today().isoformat() if write else str(recordedIdentitySummary.get("snapshotDate", ""))
    expectedIdentity = expectedIdentitySummary(identity, graphKeys, snapshotDate)

    forbiddenPathFields = {
        "outcomes", "prerequisites", "runtimeTier", "checkSpecId", "checkKinds", "artifactDecision",
        "visualDecision", "retrievalVariantIds", "transferVariantIds",
    }
    for pathId, (_, payload) in sorted(paths.items()):
        if taxonomy.domainById(pathId) is None:
            failures.append(f"path has no taxonomy domain: {pathId}")
        lessonRows = payload.get("lessons", [])
        if not isinstance(lessonRows, list):
            failures.append(f"path lessons must be a list: {pathId}")
            continue
        seen: set[str] = set()
        for expectedOrder, row in enumerate(lessonRows, start=1):
            if not isinstance(row, dict):
                failures.append(f"path row must be a mapping: {pathId}")
                continue
            lessonRef = str(row.get("lessonRef", ""))
            if lessonRef not in rows or lessonRef in seen:
                failures.append(f"path has invalid or duplicate lessonRef: {pathId}/{lessonRef}")
            seen.add(lessonRef)
            if row.get("canonicalContentRef") != lessonRef or row.get("order") != expectedOrder:
                failures.append(f"path canonical reference/order mismatch: {pathId}/{lessonRef}")
            duplicatedFields = sorted(forbiddenPathFields & set(row))
            if duplicatedFields:
                failures.append(f"path duplicates canonical fields {duplicatedFields}: {pathId}/{lessonRef}")

    if applyTransition:
        if transitionReview.get("status") != "approved":
            failures.append("taxonomy transition cannot apply before approved review")
        if transitionApplied:
            failures.append("taxonomy transition is already applied")
        if recordedTransition != proposedTransition:
            failures.append("taxonomy transition proposal must be current before apply")
        if failures:
            return failures
        targetHash = str(proposedTransition["toHash"])
        for pathId, (path, payload) in sorted(paths.items()):
            writeGeneratedYaml(
                path,
                renderedPathLedger(payload, plans[pathId], len(graph.lessons), targetHash, expectedAggregate),
            )
        summaryPayload = dict(summary)
        summaryPayload["snapshotDate"] = date.today().isoformat()
        summaryPayload["targetTaxonomyHash"] = targetHash
        summaryPayload["targetTaxonomyHashStatus"] = "approved-and-applied"
        writeGeneratedYaml(SUMMARY_PATH, summaryPayload)
        appliedPayload = dict(proposedTransition)
        appliedPayload["applyState"] = "applied"
        writeGeneratedYaml(TAXONOMY_TRANSITION_PATH, appliedPayload)
    elif write:
        currentComposerHash = fileSha256(ROOT / "src/codaro/curriculum/planComposer.py")
        for path, payload in paths.values():
            recordedComposerHash = str(payload.get("composerVersionHash", ""))
            if recordedComposerHash == currentComposerHash:
                continue
            text = path.read_text(encoding="utf-8")
            text = replaceQuotedScalar(
                text,
                "composerVersionHash",
                recordedComposerHash,
                currentComposerHash,
                f"path ledger {payload.get('pathId')}",
            )
            path.write_text(text, encoding="utf-8")
        for ledgerPath, changes in identityUpdates.items():
            text = ledgerPath.read_text(encoding="utf-8")
            for lessonRef, key, old, new in changes:
                text = replaceRowField(text, lessonRef, key, old, new)
            ledgerPath.write_text(text, encoding="utf-8")
        for ledgerPath, changes in hashUpdates.items():
            text = ledgerPath.read_text(encoding="utf-8")
            for lessonRef, old, new in changes:
                text = replaceQuotedScalar(text, "lessonContentHash", old, new, lessonRef)
            ledgerPath.write_text(text, encoding="utf-8")
        for ledgerPath, changes in contentFieldUpdates.items():
            text = ledgerPath.read_text(encoding="utf-8")
            for lessonRef, key, old, new in changes:
                text = replaceRowField(text, lessonRef, key, old, new)
            ledgerPath.write_text(text, encoding="utf-8")
        summaryText = SUMMARY_PATH.read_text(encoding="utf-8")
        summaryText = replaceQuotedScalar(
            summaryText, "sourceSetHash", recordedAggregate, expectedAggregate, "content-ledger summary"
        )
        oldDate = str(summary.get("snapshotDate", ""))
        summaryText = replaceQuotedScalar(
            summaryText, "snapshotDate", oldDate, date.today().isoformat(), "content-ledger summary"
        )
        SUMMARY_PATH.write_text(summaryText, encoding="utf-8")
        writeGeneratedYaml(IDENTITY_SUMMARY_PATH, expectedIdentity)
        writeGeneratedYaml(ALIAS_MIGRATION_PATH, expectedAlias)
        writeGeneratedYaml(TAXONOMY_TRANSITION_PATH, expectedTransition)
    else:
        if summary.get("canonicalRows") != len(rows):
            failures.append(f"canonicalRows mismatch: {summary.get('canonicalRows')} != {len(rows)}")
        if recordedAggregate != expectedAggregate:
            failures.append("content-ledger sourceSetHash is stale")
        if summary.get("ledgerToolStatus") != "implemented-check-and-write":
            failures.append("content-ledger summary does not mark the ledger tool implemented")
        if recordedIdentitySummary != expectedIdentity:
            failures.append("identity-ledger summary is stale")
        if not sameYaml(ALIAS_MIGRATION_PATH, expectedAlias):
            failures.append("legacy alias migration ledger is missing or stale")
        if not sameYaml(TAXONOMY_TRANSITION_PATH, expectedTransition):
            failures.append("taxonomy transition proposal is missing or stale")
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description="verify or refresh canonical curriculum source hashes")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--apply-taxonomy-transition", action="store_true")
    args = parser.parse_args()
    try:
        failures = evaluate(write=args.write, applyTransition=args.apply_taxonomy_transition)
    except (OSError, ValueError, yaml.YAMLError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    modeName = "transition-applied" if args.apply_taxonomy_transition else "updated" if args.write else "current"
    print(f"ok: learning ledgers {modeName}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
