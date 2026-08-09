from __future__ import annotations

import json
from pathlib import Path

import pytest

from codaro.proof.contracts import (
    ProofContractError,
    canonicalJson,
    contentDigest,
    receiptDigest,
    sealProofReceipt,
)


ROOT = Path(__file__).resolve().parents[2]
CONTRACT_ROOT = ROOT / "contracts"
NOW = "2026-08-09T00:00:00+00:00"


def _sourcePayload() -> dict[str, object]:
    return {
        "schemaVersion": 1,
        "kind": "sourceRevision",
        "sourceHash": contentDigest("source"),
        "dependencyHash": contentDigest("dependencies"),
        "packageSetHash": contentDigest("packages"),
        "effectSetHash": contentDigest("effects"),
        "documentPath": "automations/report.py",
        "blockIds": ["load", "report"],
        "createdAt": NOW,
    }


def testProofSchemasAreVersionedClosedContracts() -> None:
    source = json.loads((CONTRACT_ROOT / "sourceRevision.schema.json").read_text(encoding="utf-8"))
    operational = json.loads((CONTRACT_ROOT / "operationalReceipt.schema.json").read_text(encoding="utf-8"))
    deployment = json.loads((CONTRACT_ROOT / "deploymentReceipt.schema.json").read_text(encoding="utf-8"))

    assert source["$schema"] == "https://json-schema.org/draft/2020-12/schema"
    assert source["additionalProperties"] is False
    assert source["properties"]["schemaVersion"] == {"const": 1}
    assert deployment["additionalProperties"] is False
    assert deployment["properties"]["schemaVersion"] == {"const": 1}
    assert all(
        operational["$defs"][name]["additionalProperties"] is False
        for name in ("BuildArtifact", "PermissionReceipt", "FunctionalCheckReceipt", "OperationalRunReceipt")
    )


def testProofReceiptRejectsUnknownVersionAndExtraField() -> None:
    unknownVersion = _sourcePayload()
    unknownVersion["schemaVersion"] = 2
    with pytest.raises(ProofContractError):
        sealProofReceipt(unknownVersion)

    extraField = _sourcePayload()
    extraField["displayName"] = "not part of the contract"
    with pytest.raises(ProofContractError):
        sealProofReceipt(extraField)


def testReceiptDigestUsesCanonicalJsonAndSortedIdentityLists() -> None:
    left = _sourcePayload()
    left["blockIds"] = ["report", "load", "load"]
    right = dict(reversed(list(_sourcePayload().items())))

    leftReceipt = sealProofReceipt(left)
    rightReceipt = sealProofReceipt(right)

    assert leftReceipt.receiptId == rightReceipt.receiptId
    assert leftReceipt.blockIds == ["load", "report"]
    assert receiptDigest(leftReceipt) == leftReceipt.receiptId.split(":", 1)[1]
    assert canonicalJson({"b": 2, "a": 1}) == '{"a":1,"b":2}'
