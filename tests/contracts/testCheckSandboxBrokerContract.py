from __future__ import annotations

import hashlib
import hmac
import json
from pathlib import Path

import pytest

from codaro.curriculum import checkSandboxBrokerClient as brokerClient
from codaro.curriculum.checkSandboxBrokerClient import (
    CheckSandboxBrokerError,
    canonicalBytes,
    signedEnvelope,
    verifyResponseEnvelope,
)


ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = ROOT / "contracts" / "checkSandboxBroker.schema.json"
RUN_ID = "0123456789abcdef0123456789abcdef"
NONCE = "fedcba9876543210fedcba9876543210"
SECRET = bytes(range(32))


def testBrokerSchemaIsClosedAndBounded() -> None:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    definitions = schema["$defs"]

    assert schema["$schema"] == "https://json-schema.org/draft/2020-12/schema"
    assert schema["oneOf"] == [
        {"$ref": "#/$defs/RequestEnvelope"},
        {"$ref": "#/$defs/ResponseEnvelope"},
    ]
    for name in ("Request", "Response", "RequestEnvelope", "ResponseEnvelope"):
        assert definitions[name]["additionalProperties"] is False
        assert set(definitions[name]["required"]) == set(definitions[name]["properties"])
    assert definitions["Request"]["properties"]["timeoutMs"] == {
        "type": "integer",
        "minimum": 250,
        "maximum": 15000,
    }
    assert definitions["Request"]["properties"]["packagePaths"]["maxItems"] == 16
    assert definitions["Environment"]["maxProperties"] == 32
    assert definitions["Hex256"]["pattern"] == "^[0-9a-f]{64}$"
    assert definitions["Nonce"]["pattern"] == "^[0-9a-f]{32}$"


def testSignedEnvelopeUsesCanonicalUnicodePayload() -> None:
    payload = {"z": [3, 2, 1], "message": "한글", "nested": {"b": False, "a": None}}
    envelope = signedEnvelope("request", NONCE, payload, SECRET)
    expectedBytes = (
        b"request\n"
        + NONCE.encode("ascii")
        + b"\n"
        + canonicalBytes(payload)
    )

    assert canonicalBytes(payload) == (
        '{"message":"한글","nested":{"a":null,"b":false},"z":[3,2,1]}'.encode("utf-8")
    )
    assert envelope["mac"] == hmac.new(SECRET, expectedBytes, hashlib.sha256).hexdigest()


def testResponseAuthenticationRejectsTampering() -> None:
    payload = {
        "schemaVersion": 1,
        "runId": RUN_ID,
        "executor": "windows-appcontainer",
        "workerResponse": {"actual": "ok", "artifacts": [], "error": ""},
        "infrastructureError": None,
    }
    envelope = signedEnvelope("response", NONCE, payload, SECRET)

    assert verifyResponseEnvelope(envelope, NONCE, SECRET, RUN_ID) == payload["workerResponse"]

    envelope["payload"]["workerResponse"]["actual"] = "changed"
    with pytest.raises(CheckSandboxBrokerError, match="인증"):
        verifyResponseEnvelope(envelope, NONCE, SECRET, RUN_ID)


def testBrokerAvailabilityNeedsWindowsAndExistingExecutable(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    executable = tmp_path / "launcher.exe"
    executable.write_bytes(b"fixture")
    monkeypatch.setenv(brokerClient.BROKER_ENV, str(executable))
    assert brokerClient.checkSandboxBrokerAvailable() is (brokerClient.os.name == "nt")

    executable.unlink()
    assert brokerClient.checkSandboxBrokerAvailable() is False
