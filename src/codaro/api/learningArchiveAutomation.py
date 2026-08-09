from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import re
from typing import Any

from ..automation.taskExecution import documentSourceHash
from ..automation.taskModel import TaskDefinition, TaskRun
from ..automation.taskRegistry import TaskRegistry, getTaskRegistry
from ..curriculum.capabilityProjection import projectCapability
from ..curriculum.evidenceArchive import digestBytes
from ..curriculum.learningArchive import (
    LearningArchiveError,
    confirmAutomationDraft,
    materializeLearningArchive,
    readCurrentLearningArchive,
)
from ..curriculum.learningArchiveFlow import learningArchiveMutationLock
from ..curriculum.taxonomy import loadTaxonomy
from ..document.models import BlockConfig, CodaroDocument, DocumentMetadata
from ..document.percentFormat import writePercentDocument
from ..document.service import loadDocument, saveDocument
from ..proof import (
    BuildArtifact,
    FunctionalCheckReceipt,
    OperationalRunReceipt,
    PermissionReceipt,
    ProofArchive,
    SourceRevision,
    canonicalJson,
    contentDigest,
    sealProofReceipt,
)
from ..publication import compileExecutableUnit


def adoptLearningArchiveAutomationDraft(
    draftId: str,
    *,
    storeRoot: str | Path,
    workspaceRoot: str | Path,
    taskRegistry: TaskRegistry | None = None,
) -> dict[str, Any]:
    """Adopt a validated learning recipe as a disabled, unscheduled Local task."""

    registry = taskRegistry or getTaskRegistry()
    with learningArchiveMutationLock:
        archive = readCurrentLearningArchive(storeRoot)
        materialized = materializeLearningArchive(archive)
        draft = next((item for item in materialized.automationDrafts if item.draftId == draftId), None)
        archiveDraft = next((item for item in archive["automationDrafts"] if item["draftId"] == draftId), None)
        if draft is None or archiveDraft is None:
            raise LearningArchiveError("현재 학습 archive에서 자동화 초안을 찾을 수 없습니다.")
        existing = next(
            (
                task
                for task in registry.listTasks()
                if (task.provenance or {}).get("kind") == "codaro.learning-draft-adoption"
                and (task.provenance or {}).get("draftId") == draftId
            ),
            None,
        )
        relativePath = _automationDraftDocumentPath(draft.name, draftId)
        if existing is not None:
            return {
                "adopted": False,
                "confirmation": "already-adopted",
                "documentPath": existing.documentPath,
                "task": existing.serialize(),
            }

        confirmation = confirmAutomationDraft(
            archive,
            draftId,
            {
                "confirmationId": f"learning-adoption:{draftId.split(':', 1)[-1]}",
                "confirmedAt": datetime.now(tz=UTC).isoformat(),
                "draftId": draftId,
                "recipeBlobHash": archiveDraft["recipeBlobHash"],
            },
        )
        try:
            recipe = draft.recipe.decode("utf-8")
        except UnicodeDecodeError as error:
            raise LearningArchiveError("자동화 초안 recipe가 UTF-8 텍스트가 아닙니다.") from error

        document = CodaroDocument(
            id=f"learning-automation-{draftId.split(':', 1)[-1][:12]}",
            title=draft.name,
            blocks=[BlockConfig(id="recipe", type="automation", content=recipe)],
            metadata=DocumentMetadata(sourceFormat="percent"),
        )
        saveDocument(str(Path(workspaceRoot).expanduser().resolve() / relativePath), document)
        adoptionCore = {
            "kind": "codaro.learning-draft-adoption",
            "schemaVersion": 1,
            "archiveId": archive["manifest"]["archiveId"],
            "lineageId": confirmation["lineageId"],
            "draftId": confirmation["sourceDraftId"],
            "recipeBlobHash": confirmation["recipeBlobHash"],
        }
        task = registry.create(
            name=draft.name,
            documentPath=relativePath,
            description=draft.description,
            schedule=None,
            inputs={},
            provenance={
                **adoptionCore,
                "adoptionHash": contentDigest(canonicalJson(adoptionCore)),
            },
            enabled=False,
        )
        return {
            "adopted": True,
            "confirmation": confirmation["confirmationId"],
            "documentPath": relativePath,
            "task": task.serialize(),
        }


def promoteLearningArtifactToExecutableUnit(
    draftId: str,
    *,
    storeRoot: str | Path,
    workspaceRoot: str | Path,
    proofArchive: ProofArchive,
    taskRegistry: TaskRegistry | None = None,
    inputs: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Promote one strongly checked learning block without generating a code copy.

    The current learner draft is the source of the promoted document.  Application
    evidence only supplies authority and lineage.  A recipe blob, API input field,
    no-error run, or weak check can never substitute for that authority.
    """

    registry = taskRegistry or getTaskRegistry()
    with learningArchiveMutationLock:
        archive = readCurrentLearningArchive(storeRoot)
        materialized = materializeLearningArchive(archive)
        draft = next((item for item in materialized.automationDrafts if item.draftId == draftId), None)
        if draft is None:
            raise LearningArchiveError("현재 학습 archive에서 기능 블록 초안을 찾을 수 없습니다.")
        existing = next(
            (
                task
                for task in registry.listTasks()
                if (task.provenance or {}).get("draftId") == draftId
                and (task.provenance or {}).get("kind") == "codaro.learning-artifact-promotion"
            ),
            None,
        )
        if existing is not None:
            return {
                "promoted": False,
                "documentPath": existing.documentPath,
                "executableUnit": (existing.provenance or {}).get("executableUnit"),
                "promotion": existing.provenance,
                "task": existing.serialize(),
            }

        proof = _promotionCapabilityProof(archive, materialized, draft.lineageId)
        sourceBlockId, sourceCode, sourceBlockHash = _verifiedSourceBlock(
            materialized,
            draft.sourceBlockIds,
            proof["sourceCodeHashes"],
        )
        relativePath = _promotedDocumentPath(draft.name, sourceBlockHash)
        document = CodaroDocument(
            id=f"learning-feature-{sourceBlockHash.removeprefix('sha256-')[:12]}",
            title=draft.name,
            blocks=[BlockConfig(id=sourceBlockId, type="automation", content=sourceCode)],
            metadata=DocumentMetadata(sourceFormat="percent"),
        )
        sourceText = writePercentDocument(document)
        compiled = compileExecutableUnit(
            document,
            sourceBlockId,
            sourcePath=relativePath,
            sourceText=sourceText,
            workspaceRoot=workspaceRoot,
            checkScenarioIds=proof["taskVariantIds"],
            evidenceReceiptIds=proof["creditEventIds"],
        )
        if compiled.targetDecision.selected == "blocked":
            raise LearningArchiveError("이 학습 블록은 기능 블록으로 컴파일할 수 없습니다.")
        requiredInputs = list(compiled.unit["inputSchema"].get("required", []))
        selectedInputs = dict(inputs or {})
        if set(selectedInputs) != set(requiredInputs):
            raise LearningArchiveError(
                "기능 블록 입력은 컴파일된 입력 계약과 정확히 일치해야 합니다: "
                + ", ".join(requiredInputs)
            )
        outputContract = _applicationOutputContract(proof["artifacts"], proof["artifactContractIds"])
        permissionScopes = _permissionScopes(compiled.unit["effects"])
        effectSetHash = contentDigest(canonicalJson(compiled.unit["effects"]))
        sourceReceipt = sealProofReceipt({
            "kind": "sourceRevision",
            "sourceHash": sourceBlockHash,
            "dependencyHash": compiled.unit["dependencyHash"],
            "packageSetHash": contentDigest(canonicalJson(sorted(compiled.packages))),
            "effectSetHash": effectSetHash,
            "documentPath": relativePath,
            "blockIds": [sourceBlockId],
            "createdAt": datetime.now(tz=UTC).isoformat(),
        })
        assert isinstance(sourceReceipt, SourceRevision)
        buildReceipt = sealProofReceipt({
            "kind": "buildArtifact",
            "sourceRevisionId": sourceReceipt.receiptId,
            "sourceHash": sourceReceipt.sourceHash,
            "buildArtifactHash": contentDigest(sourceText),
            "manifestHash": compiled.manifestHash,
            "target": "local",
            "createdAt": datetime.now(tz=UTC).isoformat(),
        })
        assert isinstance(buildReceipt, BuildArtifact)
        targetPath = Path(workspaceRoot).expanduser().resolve() / relativePath
        saveDocument(str(targetPath), document)
        storedDocument = loadDocument(str(targetPath))
        if documentSourceHash(storedDocument) != sourceBlockHash:
            raise LearningArchiveError("저장 후 source block hash가 학습 evidence와 달라졌습니다.")
        proofArchive.appendReceipt(sourceReceipt)
        proofArchive.appendReceipt(buildReceipt)
        provenanceCore: dict[str, Any] = {
            "kind": "codaro.learning-artifact-promotion",
            "schemaVersion": 1,
            "archiveId": archive["manifest"]["archiveId"],
            "lineageId": draft.lineageId,
            "draftId": draftId,
            "capabilityDomainId": proof["capabilityDomainId"],
            "capabilityClaimIds": proof["capabilityClaimIds"],
            "creditEventIds": proof["creditEventIds"],
            "learningArtifactHashes": proof["artifactContentHashes"],
            "sourceBlockHash": sourceBlockHash,
            "publicationSourceHash": compiled.sourceRevision.sourceHash,
            "sourceRevisionReceiptId": sourceReceipt.receiptId,
            "buildArtifactReceiptId": buildReceipt.receiptId,
            "requiredInputNames": requiredInputs,
            "executableUnit": compiled.unit,
        }
        provenance = {
            **provenanceCore,
            "promotionHash": contentDigest(canonicalJson(provenanceCore)),
        }
        task = registry.createPromoted(
            name=draft.name,
            documentPath=relativePath,
            description=draft.description,
            inputs=selectedInputs,
            outputContract=outputContract,
            permissionScopes=permissionScopes,
            provenance=provenance,
        )
        return {
            "promoted": True,
            "documentPath": relativePath,
            "executableUnit": compiled.unit,
            "promotion": provenance,
            "task": task.serialize(),
        }


def learningArtifactPromotionStatus(
    draftId: str,
    *,
    storeRoot: str | Path,
    workspaceRoot: str | Path,
) -> dict[str, Any]:
    try:
        archive = readCurrentLearningArchive(storeRoot)
        materialized = materializeLearningArchive(archive)
        draft = next((item for item in materialized.automationDrafts if item.draftId == draftId), None)
        if draft is None:
            raise LearningArchiveError("현재 학습 archive에서 기능 블록 초안을 찾을 수 없습니다.")
        proof = _promotionCapabilityProof(archive, materialized, draft.lineageId)
        sourceBlockId, sourceCode, sourceBlockHash = _verifiedSourceBlock(
            materialized,
            draft.sourceBlockIds,
            proof["sourceCodeHashes"],
        )
        _applicationOutputContract(proof["artifacts"], proof["artifactContractIds"])
        document = CodaroDocument(
            id=f"learning-feature-{sourceBlockHash.removeprefix('sha256-')[:12]}",
            title=draft.name,
            blocks=[BlockConfig(id=sourceBlockId, type="automation", content=sourceCode)],
            metadata=DocumentMetadata(sourceFormat="percent"),
        )
        compiled = compileExecutableUnit(
            document,
            sourceBlockId,
            sourcePath=_promotedDocumentPath(draft.name, sourceBlockHash),
            sourceText=writePercentDocument(document),
            workspaceRoot=workspaceRoot,
            checkScenarioIds=proof["taskVariantIds"],
            evidenceReceiptIds=proof["creditEventIds"],
        )
        if compiled.targetDecision.selected == "blocked":
            raise LearningArchiveError("이 학습 블록은 기능 블록으로 컴파일할 수 없습니다.")
        return {
            "eligible": True,
            "reason": "strong-application-proof",
            "capabilityDomainId": proof["capabilityDomainId"],
            "sourceBlockHash": sourceBlockHash,
            "requiredInputNames": list(compiled.unit["inputSchema"].get("required", [])),
        }
    except (LearningArchiveError, ValueError) as error:
        return {
            "eligible": False,
            "reason": str(error),
            "capabilityDomainId": None,
            "sourceBlockHash": None,
            "requiredInputNames": [],
        }


def recordPromotedTaskOperationalRun(
    task: TaskDefinition,
    run: TaskRun,
    *,
    proofArchive: ProofArchive,
) -> OperationalRunReceipt | None:
    """Append an operational proof only for a fresh, semantically checked run."""

    provenance = task.provenance or {}
    if provenance.get("kind") != "codaro.learning-artifact-promotion":
        return None
    core = {key: value for key, value in provenance.items() if key != "promotionHash"}
    if provenance.get("promotionHash") != contentDigest(canonicalJson(core)):
        return None
    requiredInputs = provenance.get("requiredInputNames")
    if (
        run.operationalCandidate is not True
        or not isinstance(requiredInputs, list)
        or not requiredInputs
        or set(task.inputs) != set(requiredInputs)
        or run.sourceHash != provenance.get("sourceBlockHash")
        or not run.inputHash
        or not run.checkSpecHash
        or not run.startedAt
        or not run.finishedAt
    ):
        return None
    source = proofArchive.receiptById(str(provenance.get("sourceRevisionReceiptId") or ""))
    build = proofArchive.receiptById(str(provenance.get("buildArtifactReceiptId") or ""))
    if not isinstance(source, SourceRevision) or not isinstance(build, BuildArtifact):
        return None
    artifactHashes = sorted({
        str(item.get("contentHash"))
        for item in run.artifactDescriptors
        if isinstance(item, dict) and item.get("contentHash")
    })
    if not artifactHashes or not task.safetyApproval or not run.enforcementPolicyHash:
        return None
    permission = sealProofReceipt({
        "kind": "permission",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "effectSetHash": source.effectSetHash,
        "permissionSetHash": contentDigest(canonicalJson({
            "enforcementPolicyHash": run.enforcementPolicyHash,
            "permissionScopes": sorted(task.permissionScopes),
        })),
        "approvedAt": str(task.safetyApproval.get("confirmedAt") or run.startedAt),
    })
    assert isinstance(permission, PermissionReceipt)
    check = sealProofReceipt({
        "kind": "functionalCheck",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "buildArtifactReceiptId": build.receiptId,
        "buildArtifactHash": build.buildArtifactHash,
        "inputHash": run.inputHash,
        "checkSpecHash": run.checkSpecHash,
        "artifactHashes": artifactHashes,
        "passed": True,
        "checkedAt": run.finishedAt,
    })
    assert isinstance(check, FunctionalCheckReceipt)
    operational = sealProofReceipt({
        "kind": "operationalRun",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "buildArtifactReceiptId": build.receiptId,
        "buildArtifactHash": build.buildArtifactHash,
        "inputHash": check.inputHash,
        "permissionReceiptId": permission.receiptId,
        "permissionSetHash": permission.permissionSetHash,
        "functionalCheckReceiptId": check.receiptId,
        "artifactHashes": check.artifactHashes,
        "learningEvidenceCreditIds": list(provenance["creditEventIds"]),
        "learningEvidenceArtifactHashes": list(provenance["learningArtifactHashes"]),
        "capabilityDomainId": str(provenance["capabilityDomainId"]),
        "taskId": task.id,
        "runId": run.id,
        "runtimeTier": "local",
        "learnerSelectedInput": True,
        "startedAt": run.startedAt,
        "finishedAt": run.finishedAt,
    })
    assert isinstance(operational, OperationalRunReceipt)
    proofArchive.appendReceipt(permission)
    proofArchive.appendReceipt(check)
    proofArchive.appendReceipt(operational)
    return operational


def _automationDraftDocumentPath(name: str, draftId: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "learning-automation"
    digest = draftId.split(":", 1)[-1][:12]
    return f"automations/learning/{slug}-{digest}.py"


def _promotedDocumentPath(name: str, sourceBlockHash: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "learning-feature"
    digest = sourceBlockHash.removeprefix("sha256-")[:12]
    return f"features/learning/{slug}-{digest}.py"


def _promotionCapabilityProof(
    archive: dict[str, Any],
    materialized: object,
    lineageId: str,
) -> dict[str, Any]:
    lineage = next((item for item in archive["lineage"] if item["lineageId"] == lineageId), None)
    if not isinstance(lineage, dict):
        raise LearningArchiveError("기능 블록의 학습 계보를 찾을 수 없습니다.")
    evidenceIds = set(str(value) for value in lineage.get("evidenceEventIds", []))
    evidenceArchive = getattr(materialized, "evidenceArchive", {})
    outerEvents = evidenceArchive.get("events", []) if isinstance(evidenceArchive, dict) else []
    canonicalEvents = [
        canonical
        for outer in outerEvents
        if isinstance(outer, dict) and str(outer.get("eventId")) in evidenceIds
        for canonical in outer.get("canonicalEvents", [])
        if isinstance(canonical, dict)
    ]
    taxonomy = loadTaxonomy()
    projections = [
        projectCapability(taxonomy, domain.id, canonicalEvents)
        for domain in taxonomy.domains
    ]
    candidates = [projection for projection in projections if projection.application.receipts]
    if len(candidates) != 1:
        raise LearningArchiveError("현재 버전의 강한 application evidence가 한 능력 경로에 연결되어야 합니다.")
    projection = candidates[0]
    receipts = projection.application.receipts
    artifactHashes = sorted({
        contentHash
        for receipt in receipts
        for contentHash in receipt.artifactContentHashes
    })
    retainedHashes = {
        digestBytes(item.payload)
        for item in getattr(materialized, "virtualFiles", ())
        if any(item.path.startswith(f"proof/{contentHash.removeprefix('sha256-')}/") for contentHash in artifactHashes)
    }
    if not artifactHashes or not set(artifactHashes).issubset(retainedHashes):
        raise LearningArchiveError("application evidence의 산출물 바이트가 학습 archive에 보존되지 않았습니다.")
    eventsById = {str(event.get("eventId")): event for event in canonicalEvents}
    artifacts: list[dict[str, object]] = []
    artifactContractIds: set[tuple[str, int]] = set()
    for receipt in receipts:
        run = eventsById.get(receipt.runEventId)
        if not isinstance(run, dict):
            continue
        context = run.get("runContext") if isinstance(run.get("runContext"), dict) else {}
        contractId = context.get("artifactContractId")
        contractVersion = context.get("artifactContractVersion")
        if isinstance(contractId, str) and isinstance(contractVersion, int):
            artifactContractIds.add((contractId, contractVersion))
        artifacts.extend(
            dict(item)
            for item in run.get("artifactDescriptors", [])
            if isinstance(item, dict) and item.get("origin") == "created"
        )
    if not artifacts or len(artifactContractIds) != 1:
        raise LearningArchiveError("기능 블록 승격에는 하나의 strong artifact contract가 필요합니다.")
    claimIds = sorted({
        taxonomy.taskFamilyById(receipt.taskFamilyId).ownerClaimId
        for receipt in receipts
        if taxonomy.taskFamilyById(receipt.taskFamilyId) is not None
    })
    return {
        "capabilityDomainId": projection.domainId,
        "capabilityClaimIds": claimIds,
        "creditEventIds": sorted(receipt.creditEventId for receipt in receipts),
        "artifactContentHashes": artifactHashes,
        "sourceCodeHashes": sorted({receipt.sourceCodeHash for receipt in receipts}),
        "taskVariantIds": sorted({receipt.taskVariantId for receipt in receipts}),
        "artifacts": artifacts,
        "artifactContractIds": sorted(artifactContractIds),
    }


def _verifiedSourceBlock(
    materialized: object,
    sourceBlockIds: tuple[str, ...],
    evidenceSourceHashes: list[str],
) -> tuple[str, str, str]:
    drafts = getattr(materialized, "drafts", {})
    matches = [
        (blockId, str(drafts[blockId]), digestBytes(str(drafts[blockId]).encode("utf-8")))
        for blockId in sourceBlockIds
        if blockId in drafts and digestBytes(str(drafts[blockId]).encode("utf-8")) in evidenceSourceHashes
    ]
    if len(matches) != 1 or len(sourceBlockIds) != 1:
        raise LearningArchiveError("현재 승격은 strong evidence와 정확히 일치하는 단일 source block만 지원합니다.")
    return matches[0]


def _applicationOutputContract(
    artifacts: list[dict[str, object]],
    contractIds: list[tuple[str, int]],
) -> dict[str, object]:
    contractId, contractVersion = contractIds[0]
    safeId = re.fullmatch(r"[A-Za-z0-9._-]+", contractId)
    contractPath = Path(__file__).resolve().parents[3] / "contracts" / "learning-content" / "artifacts" / f"{contractId}.json"
    if safeId is None or not contractPath.is_file():
        raise LearningArchiveError("artifact contract 파일을 찾을 수 없습니다.")
    try:
        contract = json.loads(contractPath.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise LearningArchiveError("artifact contract를 읽을 수 없습니다.") from error
    if contract.get("artifactContractId") != contractId or contract.get("version") != contractVersion:
        raise LearningArchiveError("artifact contract identity가 application evidence와 일치하지 않습니다.")
    requiredFields = contract.get("requiredFields")
    fieldTypes = contract.get("fieldTypes")
    if not isinstance(requiredFields, list) or not isinstance(fieldTypes, dict):
        raise LearningArchiveError("artifact contract의 JSON 의미 검사가 유효하지 않습니다.")
    descriptors = []
    for artifact in artifacts:
        path = artifact.get("path")
        if not isinstance(path, str) or not path:
            continue
        descriptors.append({
            "path": path,
            "minBytes": 2,
            "jsonSchema": {
                "requiredFields": requiredFields,
                "fieldTypes": fieldTypes,
            },
        })
    if not descriptors:
        raise LearningArchiveError("application evidence에 재실행 산출물 경로가 없습니다.")
    return {"schemaVersion": 1, "artifacts": descriptors}


def _permissionScopes(effects: dict[str, Any]) -> list[str]:
    scopes: set[str] = set()
    if effects.get("filesystemRead"):
        scopes.add("filesystem.read")
    if effects.get("filesystemWrite"):
        scopes.add("filesystem.write")
    if effects.get("networkOrigins"):
        scopes.add("network")
    if effects.get("process"):
        scopes.add("process.execute")
    return sorted(scopes)
