from __future__ import annotations

from datetime import UTC, datetime
import base64
import re
from typing import Any, Literal, Mapping, Sequence

from ..proof import (
    BuildArtifact,
    OperationalRunReceipt,
    ProofArchive,
    SourceRevision,
    canonicalJson,
    contentDigest,
    sealProofReceipt,
)
from ..proof.archive import ProofArchiveError
from ..proof.contracts import ProofContractError, validateBuildLink


PROMOTED_BLOCK_KIND = "codaro.promoted-block"
PROOF_LINEAGE_KIND = "codaro.proof-lineage"
PROOF_LINEAGE_SCHEMA_VERSION = 1
_HASH_PATTERN = re.compile(r"^sha256-(?:[0-9a-f]{64}|[A-Za-z0-9_-]{43})$")
_SOURCE_RECEIPT_PATTERN = re.compile(r"^sourceRevision:sha256-[A-Za-z0-9_-]{43}$")
_BUILD_RECEIPT_PATTERN = re.compile(r"^buildArtifact:sha256-[A-Za-z0-9_-]{43}$")
_PERMISSION_RECEIPT_PATTERN = re.compile(r"^permission:sha256-[A-Za-z0-9_-]{43}$")
_CHECK_RECEIPT_PATTERN = re.compile(r"^functionalCheck:sha256-[A-Za-z0-9_-]{43}$")
_OPERATIONAL_RECEIPT_PATTERN = re.compile(r"^operationalRun:sha256-[A-Za-z0-9_-]{43}$")
_LINEAGE_FIELDS = {
    "schemaVersion",
    "kind",
    "sourceRevisionReceiptId",
    "sourceBlockHash",
    "dependencyHash",
    "learningCreditIds",
    "learningCheckIds",
    "lineageHash",
}
_PUBLICATION_LINEAGE_FIELDS = _LINEAGE_FIELDS | {
    "promotionBuildArtifactReceiptId",
    "coveredBlockIds",
    "verificationStatus",
    "permissionReceiptId",
    "functionalCheckReceiptId",
    "operationalRunReceiptId",
    "artifactHashes",
}


class PublicationProofError(ValueError):
    pass


def createPromotedBlockPayload(
    *,
    sourceRevisionReceiptId: str,
    sourceBlockHash: str,
    dependencyHash: str,
    learningCreditIds: Sequence[str],
    learningCheckIds: Sequence[str],
) -> dict[str, object]:
    core = _lineageCore(
        sourceRevisionReceiptId=sourceRevisionReceiptId,
        sourceBlockHash=sourceBlockHash,
        dependencyHash=dependencyHash,
        learningCreditIds=learningCreditIds,
        learningCheckIds=learningCheckIds,
    )
    proof = {
        **core,
        "lineageHash": contentDigest(canonicalJson(core)),
    }
    _validateLineageReference(proof)
    return {
        "schemaVersion": PROOF_LINEAGE_SCHEMA_VERSION,
        "kind": PROMOTED_BLOCK_KIND,
        "proof": proof,
    }


def proofLineageHash(
    *,
    sourceRevisionReceiptId: str,
    sourceBlockHash: str,
    dependencyHash: str,
    learningCreditIds: Sequence[str],
    learningCheckIds: Sequence[str],
) -> str:
    core = _lineageCore(
        sourceRevisionReceiptId=sourceRevisionReceiptId,
        sourceBlockHash=sourceBlockHash,
        dependencyHash=dependencyHash,
        learningCreditIds=learningCreditIds,
        learningCheckIds=learningCheckIds,
    )
    return contentDigest(canonicalJson(core))


def _lineageCore(
    *,
    sourceRevisionReceiptId: str,
    sourceBlockHash: str,
    dependencyHash: str,
    learningCreditIds: Sequence[str],
    learningCheckIds: Sequence[str],
) -> dict[str, object]:
    return {
        "schemaVersion": PROOF_LINEAGE_SCHEMA_VERSION,
        "kind": PROOF_LINEAGE_KIND,
        "sourceRevisionReceiptId": sourceRevisionReceiptId,
        "sourceBlockHash": sourceBlockHash,
        "dependencyHash": dependencyHash,
        "learningCreditIds": sorted(set(learningCreditIds)),
        "learningCheckIds": sorted(set(learningCheckIds)),
    }


def promotedBlockProofLineage(sourceType: str | None, payload: object) -> dict[str, object] | None:
    if sourceType != "promoted":
        return None
    if not isinstance(payload, Mapping) or set(payload) != {"schemaVersion", "kind", "proof"}:
        raise PublicationProofError("promoted block payload fields are invalid")
    if payload.get("schemaVersion") != PROOF_LINEAGE_SCHEMA_VERSION:
        raise PublicationProofError("promoted block payload schemaVersion is not supported")
    if payload.get("kind") != PROMOTED_BLOCK_KIND:
        raise PublicationProofError("promoted block payload kind is invalid")
    proof = dict(payload["proof"]) if isinstance(payload.get("proof"), Mapping) else {}
    _validateLineageReference(proof)
    return proof


def publicationProof(
    units: Sequence[Mapping[str, object]],
    executionBlockIds: Sequence[str],
    packages: Sequence[str],
    proofArchive: ProofArchive | None,
) -> dict[str, object]:
    references: dict[str, tuple[dict[str, object], Mapping[str, object]]] = {}
    for unit in units:
        rawReference = unit.get("proofLineage")
        if rawReference is None:
            continue
        if not isinstance(rawReference, Mapping):
            raise PublicationProofError("executable unit proof lineage is invalid")
        reference = dict(rawReference)
        _validateLineageReference(reference)
        sourceRevisionReceiptId = str(reference["sourceRevisionReceiptId"])
        existing = references.get(sourceRevisionReceiptId)
        if existing is not None and existing[0] != reference:
            raise PublicationProofError("one proof source root has conflicting lineage metadata")
        references[sourceRevisionReceiptId] = (reference, unit)

    lineages = [
        _publicationLineage(reference, unit, packages, proofArchive)
        for reference, unit in references.values()
    ]
    lineages.sort(key=lambda lineage: str(lineage["sourceRevisionReceiptId"]))
    verifiedCoverage = {
        blockId
        for lineage in lineages
        if lineage["verificationStatus"] == "verified"
        for blockId in lineage["coveredBlockIds"]
    }
    verificationStatus = (
        "verified"
        if lineages and set(executionBlockIds).issubset(verifiedCoverage)
        else "unverified"
    )
    core = {
        "schemaVersion": PROOF_LINEAGE_SCHEMA_VERSION,
        "verificationStatus": verificationStatus,
        "lineages": lineages,
    }
    return {**core, "proofHash": contentDigest(canonicalJson(core))}


def validatePublicationProof(
    value: object,
    *,
    executionBlockIds: Sequence[str] | None = None,
) -> dict[str, object]:
    if not isinstance(value, Mapping) or set(value) != {
        "schemaVersion",
        "verificationStatus",
        "lineages",
        "proofHash",
    }:
        raise PublicationProofError("publication proof fields are invalid")
    payload = dict(value)
    if payload.get("schemaVersion") != PROOF_LINEAGE_SCHEMA_VERSION:
        raise PublicationProofError("publication proof schemaVersion is not supported")
    if payload.get("verificationStatus") not in {"verified", "unverified"}:
        raise PublicationProofError("publication proof verificationStatus is invalid")
    rawLineages = payload.get("lineages")
    if not isinstance(rawLineages, list):
        raise PublicationProofError("publication proof lineages must be a list")
    lineages: list[dict[str, object]] = []
    for rawLineage in rawLineages:
        if not isinstance(rawLineage, Mapping) or set(rawLineage) != _PUBLICATION_LINEAGE_FIELDS:
            raise PublicationProofError("publication proof lineage fields are invalid")
        lineage = dict(rawLineage)
        _validateLineageReference(lineage)
        coveredBlockIds = _sortedTextList(lineage.get("coveredBlockIds"), "coveredBlockIds")
        status = lineage.get("verificationStatus")
        artifactHashes = lineage.get("artifactHashes")
        if not isinstance(artifactHashes, list) or artifactHashes != sorted(set(artifactHashes)):
            raise PublicationProofError("publication proof artifactHashes are invalid")
        if any(not isinstance(value, str) or not _HASH_PATTERN.fullmatch(value) for value in artifactHashes):
            raise PublicationProofError("publication proof artifactHashes are invalid")
        references = (
            lineage.get("permissionReceiptId"),
            lineage.get("functionalCheckReceiptId"),
            lineage.get("operationalRunReceiptId"),
        )
        if status == "verified":
            if (
                not artifactHashes
                or not isinstance(references[0], str)
                or not _PERMISSION_RECEIPT_PATTERN.fullmatch(references[0])
                or not isinstance(references[1], str)
                or not _CHECK_RECEIPT_PATTERN.fullmatch(references[1])
                or not isinstance(references[2], str)
                or not _OPERATIONAL_RECEIPT_PATTERN.fullmatch(references[2])
            ):
                raise PublicationProofError("verified publication proof lineage is incomplete")
        elif status != "unverified" or any(reference is not None for reference in references) or artifactHashes:
            raise PublicationProofError("unverified publication proof lineage must not claim operational proof")
        lineage["coveredBlockIds"] = coveredBlockIds
        lineages.append(lineage)
    expectedLineages = sorted(lineages, key=lambda lineage: str(lineage["sourceRevisionReceiptId"]))
    if lineages != expectedLineages:
        raise PublicationProofError("publication proof lineages must be canonical")
    expectedStatus = "verified" if lineages and all(
        lineage["verificationStatus"] == "verified" for lineage in lineages
    ) else "unverified"
    if executionBlockIds is not None:
        verifiedCoverage = {
            blockId
            for lineage in lineages
            if lineage["verificationStatus"] == "verified"
            for blockId in lineage["coveredBlockIds"]
        }
        expectedStatus = (
            "verified"
            if lineages and set(executionBlockIds).issubset(verifiedCoverage)
            else "unverified"
        )
    if payload["verificationStatus"] == "verified" and expectedStatus != "verified":
        raise PublicationProofError("publication proof cannot claim verified with incomplete lineages")
    core = {
        "schemaVersion": payload["schemaVersion"],
        "verificationStatus": payload["verificationStatus"],
        "lineages": lineages,
    }
    if payload.get("proofHash") != contentDigest(canonicalJson(core)):
        raise PublicationProofError("publication proof hash does not match its payload")
    return payload


def recordPublicationBuildArtifacts(
    proof: Mapping[str, object],
    proofArchive: ProofArchive | None,
    *,
    buildArtifactHash: str,
    manifestHash: str,
    target: Literal["browser", "server", "local"],
    createdAt: str | None = None,
) -> tuple[BuildArtifact, ...]:
    validated = validatePublicationProof(proof)
    if proofArchive is None:
        return ()
    results: list[BuildArtifact] = []
    for lineage in validated["lineages"]:
        sourceRevisionId = str(lineage["sourceRevisionReceiptId"])
        existing = next(
            (
                receipt
                for receipt in proofArchive.receipts("buildArtifact")
                if isinstance(receipt, BuildArtifact)
                and receipt.sourceRevisionId == sourceRevisionId
                and receipt.buildArtifactHash == buildArtifactHash
                and receipt.manifestHash == manifestHash
                and receipt.target == target
            ),
            None,
        )
        if existing is not None:
            results.append(existing)
            continue
        source = proofArchive.receiptById(sourceRevisionId)
        if not isinstance(source, SourceRevision):
            raise PublicationProofError("publication proof source revision does not resolve")
        receipt = sealProofReceipt({
            "kind": "buildArtifact",
            "sourceRevisionId": source.receiptId,
            "sourceHash": source.sourceHash,
            "buildArtifactHash": buildArtifactHash,
            "manifestHash": manifestHash,
            "target": target,
            "createdAt": createdAt or datetime.now(UTC).isoformat(),
        })
        assert isinstance(receipt, BuildArtifact)
        try:
            proofArchive.appendReceipt(receipt)
        except ProofArchiveError as error:
            raise PublicationProofError(str(error)) from error
        results.append(receipt)
    return tuple(results)


def publicationBuildArtifact(
    proofArchive: ProofArchive,
    *,
    sourceRevisionReceiptId: str,
    buildArtifactHash: str,
    manifestHash: str,
    target: Literal["browser", "server", "local"],
) -> BuildArtifact:
    try:
        receipt = next(
            (
                item
                for item in proofArchive.receipts("buildArtifact")
                if isinstance(item, BuildArtifact)
                and item.sourceRevisionId == sourceRevisionReceiptId
                and item.buildArtifactHash == buildArtifactHash
                and item.manifestHash == manifestHash
                and item.target == target
            ),
            None,
        )
    except ProofArchiveError as error:
        raise PublicationProofError(str(error)) from error
    if receipt is None:
        raise PublicationProofError("publication build artifact does not resolve from its proof source")
    return receipt


def _publicationLineage(
    reference: dict[str, object],
    unit: Mapping[str, object],
    packages: Sequence[str],
    proofArchive: ProofArchive | None,
) -> dict[str, object]:
    coveredBlockIds = sorted({str(unit["entryBlockId"]), *map(str, unit["dependencyBlockIds"])})
    operational: OperationalRunReceipt | None = None
    if proofArchive is None:
        raise PublicationProofError("promoted block publication requires its ProofArchive")
    try:
        source = proofArchive.receiptById(str(reference["sourceRevisionReceiptId"]))
        promotionBuild = next(
            (
                receipt
                for receipt in proofArchive.receipts("buildArtifact")
                if isinstance(receipt, BuildArtifact)
                and receipt.sourceRevisionId == reference["sourceRevisionReceiptId"]
                and receipt.target == "local"
                and receipt.manifestHash == reference["lineageHash"]
                and receipt.buildArtifactHash == _base64DigestFromHex(str(unit["sourceFileHash"]))
            ),
            None,
        )
        if not isinstance(source, SourceRevision) or promotionBuild is None:
            raise PublicationProofError("promoted block proof source does not resolve")
        validateBuildLink(promotionBuild, source)
        if (
            source.sourceHash != reference["sourceBlockHash"]
            or source.sourceHash != unit["entryBlockHash"]
            or source.dependencyHash != reference["dependencyHash"]
            or source.dependencyHash != unit["dependencyHash"]
            or source.blockIds != coveredBlockIds
            or source.packageSetHash != contentDigest(canonicalJson(sorted(set(packages))))
            or source.effectSetHash != contentDigest(canonicalJson(unit["effects"]))
            or promotionBuild.manifestHash != reference["lineageHash"]
        ):
            raise PublicationProofError("promoted block proof does not match the compiled entry and dependencies")
        candidates = [
            receipt
            for receipt in proofArchive.receipts("operationalRun")
            if isinstance(receipt, OperationalRunReceipt)
            and receipt.sourceRevisionId == source.receiptId
            and receipt.learningEvidenceCreditIds == reference["learningCreditIds"]
        ]
        for candidate in candidates:
            proofArchive.resolveLineage(candidate.receiptId)
        if candidates:
            operational = max(candidates, key=lambda receipt: (receipt.finishedAt, receipt.receiptId))
        coveredBlockIds = source.blockIds
    except (ProofArchiveError, ProofContractError) as error:
        raise PublicationProofError(str(error)) from error

    return {
        **reference,
        "promotionBuildArtifactReceiptId": promotionBuild.receiptId,
        "coveredBlockIds": coveredBlockIds,
        "verificationStatus": "verified" if operational is not None else "unverified",
        "permissionReceiptId": operational.permissionReceiptId if operational is not None else None,
        "functionalCheckReceiptId": operational.functionalCheckReceiptId if operational is not None else None,
        "operationalRunReceiptId": operational.receiptId if operational is not None else None,
        "artifactHashes": operational.artifactHashes if operational is not None else [],
    }


def _validateLineageReference(value: Mapping[str, object]) -> None:
    fields = set(value)
    if fields != _LINEAGE_FIELDS and fields != _PUBLICATION_LINEAGE_FIELDS:
        raise PublicationProofError("proof lineage fields are invalid")
    if value.get("schemaVersion") != PROOF_LINEAGE_SCHEMA_VERSION or value.get("kind") != PROOF_LINEAGE_KIND:
        raise PublicationProofError("proof lineage kind or schemaVersion is invalid")
    sourceRevisionReceiptId = value.get("sourceRevisionReceiptId")
    if not isinstance(sourceRevisionReceiptId, str) or not _SOURCE_RECEIPT_PATTERN.fullmatch(sourceRevisionReceiptId):
        raise PublicationProofError("proof lineage source revision receipt is invalid")
    promotionBuildArtifactReceiptId = value.get("promotionBuildArtifactReceiptId")
    if fields == _PUBLICATION_LINEAGE_FIELDS and (
        not isinstance(promotionBuildArtifactReceiptId, str)
        or not _BUILD_RECEIPT_PATTERN.fullmatch(promotionBuildArtifactReceiptId)
    ):
        raise PublicationProofError("publication proof lineage promotion build receipt is invalid")
    for fieldName in ("sourceBlockHash", "dependencyHash", "lineageHash"):
        fieldValue = value.get(fieldName)
        if not isinstance(fieldValue, str) or not _HASH_PATTERN.fullmatch(fieldValue):
            raise PublicationProofError(f"proof lineage {fieldName} is invalid")
    creditIds = _sortedTextList(value.get("learningCreditIds"), "learningCreditIds")
    checkIds = _sortedTextList(value.get("learningCheckIds"), "learningCheckIds")
    core = {
        "schemaVersion": value["schemaVersion"],
        "kind": value["kind"],
        "sourceRevisionReceiptId": value["sourceRevisionReceiptId"],
        "sourceBlockHash": value["sourceBlockHash"],
        "dependencyHash": value["dependencyHash"],
        "learningCreditIds": creditIds,
        "learningCheckIds": checkIds,
    }
    if value.get("lineageHash") != contentDigest(canonicalJson(core)):
        raise PublicationProofError("proof lineage hash does not match its evidence inputs")


def _sortedTextList(value: object, fieldName: str) -> list[str]:
    if (
        not isinstance(value, list)
        or not value
        or any(not isinstance(item, str) or not item for item in value)
        or value != sorted(set(value))
    ):
        raise PublicationProofError(f"proof lineage {fieldName} must be a sorted unique non-empty list")
    return value


def _base64DigestFromHex(value: str) -> str:
    if not re.fullmatch(r"sha256-[0-9a-f]{64}", value):
        raise PublicationProofError("executable unit sourceFileHash is invalid")
    digest = bytes.fromhex(value.removeprefix("sha256-"))
    encoded = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
    return f"sha256-{encoded}"
