from __future__ import annotations

from collections.abc import Iterable, Mapping
from contextlib import closing
from datetime import UTC, datetime
import json
import os
from pathlib import Path
import sqlite3
from typing import Any

from .contracts import (
    BuildArtifact,
    DeploymentReceipt,
    FunctionalCheckReceipt,
    OperationalRunReceipt,
    PermissionReceipt,
    ProofContractError,
    ProofReceipt,
    SourceRevision,
    canonicalJson,
    contentDigest,
    validateBuildLink,
    validateDeploymentLink,
    validateFunctionalCheckLink,
    validateOperationalLink,
    validatePermissionLink,
    validateProofReceipt,
)


PROOF_ARCHIVE_KIND = "codaro.proof-archive"
PROOF_ARCHIVE_SCHEMA_VERSION = 1
MAX_ARCHIVE_RECEIPTS = 10_000
KIND_ORDER = {
    "sourceRevision": 0,
    "buildArtifact": 1,
    "permission": 2,
    "functionalCheck": 3,
    "operationalRun": 4,
    "deployment": 5,
}


class ProofArchiveError(ValueError):
    pass


class ProofArchive:
    def __init__(self, storagePath: str | Path | None = None) -> None:
        if storagePath is None:
            codaroHome = Path(os.environ.get("CODARO_HOME", Path.home() / ".codaro")).expanduser()
            storagePath = codaroHome / "proofArchive.sqlite3"
        self._storagePath = Path(storagePath).expanduser().resolve()

    @property
    def storagePath(self) -> Path:
        return self._storagePath

    def initialize(self) -> None:
        with closing(self._connect()):
            pass

    def summary(self) -> dict[str, int]:
        with closing(self._connect()) as connection:
            receiptCount = int(connection.execute("SELECT COUNT(*) FROM receipts").fetchone()[0])
            conflictCount = int(connection.execute("SELECT COUNT(*) FROM conflicts").fetchone()[0])
        return {"receipts": receiptCount, "conflicts": conflictCount}

    def buildArchive(self) -> dict[str, object]:
        return {
            "archiveKind": PROOF_ARCHIVE_KIND,
            "schemaVersion": PROOF_ARCHIVE_SCHEMA_VERSION,
            "receipts": [receipt.model_dump(mode="json") for receipt in self.receipts()],
        }

    def receipts(self, kind: str | None = None) -> list[ProofReceipt]:
        query = "SELECT payload_json FROM receipts"
        parameters: tuple[object, ...] = ()
        if kind is not None:
            if kind not in KIND_ORDER:
                raise ProofArchiveError("proof receipt kind is not supported")
            query += " WHERE kind = ?"
            parameters = (kind,)
        query += " ORDER BY receipt_id"
        with closing(self._connect()) as connection:
            rows = connection.execute(query, parameters).fetchall()
        try:
            return [validateProofReceipt(json.loads(str(row[0]))) for row in rows]
        except (json.JSONDecodeError, ProofContractError) as error:
            raise ProofArchiveError("stored proof receipt is corrupt") from error

    def receiptById(self, receiptId: str) -> ProofReceipt | None:
        with closing(self._connect()) as connection:
            row = connection.execute(
                "SELECT payload_json FROM receipts WHERE receipt_id = ?",
                (receiptId,),
            ).fetchone()
        if row is None:
            return None
        try:
            return validateProofReceipt(json.loads(str(row[0])))
        except (json.JSONDecodeError, ProofContractError) as error:
            raise ProofArchiveError("stored proof receipt is corrupt") from error

    def resolveLineage(self, receiptId: str) -> list[ProofReceipt]:
        rootReceipt = self.receiptById(receiptId)
        if rootReceipt is None:
            raise ProofArchiveError(f"proof receipt does not resolve: {receiptId}")
        sourceRevisionId = (
            rootReceipt.receiptId
            if isinstance(rootReceipt, SourceRevision)
            else rootReceipt.sourceRevisionId
        )
        receipts = [
            receipt
            for receipt in self.receipts()
            if receipt.receiptId == sourceRevisionId
            or getattr(receipt, "sourceRevisionId", None) == sourceRevisionId
        ]
        if not any(receipt.receiptId == rootReceipt.receiptId for receipt in receipts):
            raise ProofArchiveError(f"proof receipt is detached from its source revision: {receiptId}")
        connection = self._connect()
        try:
            for receipt in receipts:
                self._validateLinks(connection, receipt)
        except ProofContractError as error:
            raise ProofArchiveError(str(error)) from error
        finally:
            connection.close()
        return sorted(receipts, key=lambda receipt: (KIND_ORDER[receipt.kind], receipt.receiptId))

    def appendReceipt(self, value: Mapping[str, object] | ProofReceipt) -> dict[str, object]:
        payload = value.model_dump(mode="json") if hasattr(value, "model_dump") else dict(value)
        return self.mergeArchive({
            "archiveKind": PROOF_ARCHIVE_KIND,
            "schemaVersion": PROOF_ARCHIVE_SCHEMA_VERSION,
            "receipts": [payload],
        })

    def mergeArchive(self, value: object) -> dict[str, object]:
        rawReceipts = _validateArchiveEnvelope(value)
        try:
            parsed = [validateProofReceipt(receipt, verifyDigest=False) for receipt in rawReceipts]
        except ProofContractError as error:
            raise ProofArchiveError(str(error)) from error
        ordered = sorted(
            enumerate(parsed),
            key=lambda item: (KIND_ORDER[item[1].kind], item[0]),
        )
        result: dict[str, Any] = {
            "acceptedReceiptIds": [],
            "conflicted": 0,
            "inserted": 0,
            "skipped": 0,
        }
        connection = self._connect()
        try:
            connection.execute("BEGIN IMMEDIATE")
            for _index, untrustedReceipt in ordered:
                payload = untrustedReceipt.model_dump(mode="json")
                payloadJson = canonicalJson(payload)
                existing = connection.execute(
                    "SELECT payload_hash, payload_json FROM receipts WHERE receipt_id = ?",
                    (untrustedReceipt.receiptId,),
                ).fetchone()
                if existing is not None:
                    if str(existing[1]) == payloadJson:
                        result["skipped"] += 1
                        result["acceptedReceiptIds"].append(untrustedReceipt.receiptId)
                    else:
                        self._quarantineConflict(connection, untrustedReceipt.receiptId, str(existing[0]), payloadJson)
                        result["conflicted"] += 1
                    continue
                try:
                    receipt = validateProofReceipt(payload)
                    self._validateLinks(connection, receipt)
                except ProofContractError as error:
                    raise ProofArchiveError(str(error)) from error
                connection.execute(
                    """
                    INSERT INTO receipts(receipt_id, kind, payload_hash, payload_json, recorded_at)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        receipt.receiptId,
                        receipt.kind,
                        contentDigest(payloadJson),
                        payloadJson,
                        _recordedAt(receipt),
                    ),
                )
                result["inserted"] += 1
                result["acceptedReceiptIds"].append(receipt.receiptId)
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()
        result["acceptedReceiptIds"] = sorted(set(result["acceptedReceiptIds"]))
        return result

    def _validateLinks(self, connection: sqlite3.Connection, receipt: ProofReceipt) -> None:
        if isinstance(receipt, SourceRevision):
            return
        source = self._requiredReceipt(connection, receipt.sourceRevisionId, SourceRevision)
        if isinstance(receipt, BuildArtifact):
            validateBuildLink(receipt, source)
            return
        if isinstance(receipt, PermissionReceipt):
            validatePermissionLink(receipt, source)
            return
        build = self._requiredReceipt(connection, receipt.buildArtifactReceiptId, BuildArtifact)
        if isinstance(receipt, FunctionalCheckReceipt):
            validateFunctionalCheckLink(receipt, source, build)
            return
        if isinstance(receipt, OperationalRunReceipt):
            permission = self._requiredReceipt(connection, receipt.permissionReceiptId, PermissionReceipt)
            check = self._requiredReceipt(connection, receipt.functionalCheckReceiptId, FunctionalCheckReceipt)
            validateOperationalLink(receipt, source, build, permission, check)
            return
        if isinstance(receipt, DeploymentReceipt):
            validateDeploymentLink(receipt, source, build)
            return
        raise ProofArchiveError("proof receipt kind is not supported")

    @staticmethod
    def _requiredReceipt(
        connection: sqlite3.Connection,
        receiptId: str,
        expectedType: type[ProofReceipt],
    ) -> Any:
        row = connection.execute(
            "SELECT payload_json FROM receipts WHERE receipt_id = ?",
            (receiptId,),
        ).fetchone()
        if row is None:
            raise ProofContractError(f"proof chain dependency is missing: {receiptId}")
        try:
            receipt = validateProofReceipt(json.loads(str(row[0])))
        except (json.JSONDecodeError, ProofContractError) as error:
            raise ProofContractError(f"proof chain dependency is corrupt: {receiptId}") from error
        if not isinstance(receipt, expectedType):
            raise ProofContractError(f"proof chain dependency has the wrong kind: {receiptId}")
        return receipt

    @staticmethod
    def _quarantineConflict(
        connection: sqlite3.Connection,
        receiptId: str,
        existingHash: str,
        importedPayloadJson: str,
    ) -> None:
        importedHash = contentDigest(importedPayloadJson)
        conflictId = f"{receiptId}:{importedHash}"
        connection.execute(
            """
            INSERT OR IGNORE INTO conflicts(
                conflict_id, receipt_id, existing_payload_hash, imported_payload_hash,
                imported_payload_json, detected_at
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (conflictId, receiptId, existingHash, importedHash, importedPayloadJson, _utcTimestamp()),
        )

    def _connect(self) -> sqlite3.Connection:
        self._storagePath.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(self._storagePath, timeout=10.0)
        connection.execute("PRAGMA journal_mode = WAL")
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS receipts(
                receipt_id TEXT PRIMARY KEY,
                kind TEXT NOT NULL,
                payload_hash TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                recorded_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS conflicts(
                conflict_id TEXT PRIMARY KEY,
                receipt_id TEXT NOT NULL,
                existing_payload_hash TEXT NOT NULL,
                imported_payload_hash TEXT NOT NULL,
                imported_payload_json TEXT NOT NULL,
                detected_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS proof_conflicts_receipt_id ON conflicts(receipt_id);
            """
        )
        return connection


def _validateArchiveEnvelope(value: object) -> list[Mapping[str, object]]:
    if not isinstance(value, Mapping) or set(value) != {"archiveKind", "schemaVersion", "receipts"}:
        raise ProofArchiveError("proof archive envelope is invalid")
    if value.get("archiveKind") != PROOF_ARCHIVE_KIND or value.get("schemaVersion") != PROOF_ARCHIVE_SCHEMA_VERSION:
        raise ProofArchiveError("proof archive kind or schema version is unsupported")
    receipts = value.get("receipts")
    if (
        not isinstance(receipts, list)
        or len(receipts) > MAX_ARCHIVE_RECEIPTS
        or any(not isinstance(receipt, Mapping) for receipt in receipts)
    ):
        raise ProofArchiveError("proof archive receipts are invalid")
    return receipts


def _recordedAt(receipt: ProofReceipt) -> str:
    for fieldName in ("verifiedAt", "finishedAt", "checkedAt", "approvedAt", "createdAt"):
        value = getattr(receipt, fieldName, None)
        if isinstance(value, str) and value:
            return value
    return _utcTimestamp()


def _utcTimestamp() -> str:
    return datetime.now(tz=UTC).isoformat()
