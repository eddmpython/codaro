from __future__ import annotations

import hashlib
import hmac
import json
import os
from pathlib import Path
import secrets
import subprocess
import time
from typing import Any, BinaryIO


BROKER_ENV = "CODARO_CHECK_BROKER_EXE"
MAX_FRAME_BYTES = 1024 * 1024
PIPE_PREFIX = r"\\.\pipe\codaro-check-"


class CheckSandboxBrokerError(OSError):
    pass


def checkSandboxBrokerAvailable() -> bool:
    configured = os.environ.get(BROKER_ENV, "").strip()
    return os.name == "nt" and bool(configured) and Path(configured).is_file()


def runCheckSandboxBroker(
    *,
    fixtureRoot: Path,
    packagePaths: list[str],
    environment: dict[str, str],
    timeoutMs: int,
    workerPath: Path,
    workerRequest: dict[str, Any],
) -> subprocess.CompletedProcess[str]:
    brokerPath = Path(os.environ[BROKER_ENV]).resolve()
    runId = secrets.token_hex(16)
    nonce = secrets.token_hex(16)
    secret = bytearray(secrets.token_bytes(32))
    pipeName = PIPE_PREFIX + runId
    payload = {
        "schemaVersion": 1,
        "runId": runId,
        "fixtureRoot": str(fixtureRoot.resolve()),
        "packagePaths": list(packagePaths),
        "environment": dict(environment),
        "timeoutMs": timeoutMs,
        "workerRequest": workerRequest,
    }
    envelope = signedEnvelope("request", nonce, payload, secret)
    command = [
        str(brokerPath),
        "check-broker",
        "--pipe-name",
        pipeName,
        "--python-executable",
        managedPythonExecutable(),
        "--worker-path",
        str(workerPath.resolve()),
    ]
    process = subprocess.Popen(
        command,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=False,
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )
    started = time.monotonic()
    try:
        if process.stdin is None:
            raise CheckSandboxBrokerError("검증 broker bootstrap 입력을 열지 못했습니다.")
        process.stdin.write(json.dumps({"secretHex": secret.hex()}, separators=(",", ":")).encode("ascii") + b"\n")
        process.stdin.flush()
        process.stdin.close()
        process.stdin = None
        waitForPipe(pipeName, process, min(5_000, timeoutMs + 1_500))
        with open(pipeName, "r+b", buffering=0) as stream:
            writeFrame(stream, canonicalBytes(envelope))
            responseEnvelope = json.loads(readFrame(stream))
        response = verifyResponseEnvelope(responseEnvelope, nonce, secret, runId)
        remaining = max(0.1, ((timeoutMs + 3_000) / 1000) - (time.monotonic() - started))
        stdout, stderr = process.communicate(timeout=remaining)
        if process.returncode != 0:
            detail = (stderr or stdout or b"").decode("utf-8", errors="replace").strip()
            raise CheckSandboxBrokerError(detail or f"검증 broker가 {process.returncode} 코드로 종료됐습니다.")
        return subprocess.CompletedProcess(
            command,
            0,
            json.dumps(response, ensure_ascii=False, separators=(",", ":")),
            (stderr or b"").decode("utf-8", errors="replace"),
        )
    except subprocess.TimeoutExpired:
        terminateBroker(process)
        raise
    except Exception:
        terminateBroker(process)
        raise
    finally:
        secret[:] = b"\0" * len(secret)


def managedPythonExecutable() -> str:
    """Return the executable selected by the managed launcher runtime."""
    return os.path.realpath(os.sys.executable)


def signedEnvelope(
    direction: str,
    nonce: str,
    payload: dict[str, Any],
    secret: bytes | bytearray,
) -> dict[str, Any]:
    payloadBytes = canonicalBytes(payload)
    signed = direction.encode("ascii") + b"\n" + nonce.encode("ascii") + b"\n" + payloadBytes
    return {
        "schemaVersion": 1,
        "direction": direction,
        "nonce": nonce,
        "payload": payload,
        "mac": hmac.new(secret, signed, hashlib.sha256).hexdigest(),
    }


def verifyResponseEnvelope(
    envelope: Any,
    nonce: str,
    secret: bytes | bytearray,
    runId: str,
) -> dict[str, Any]:
    if not isinstance(envelope, dict) or set(envelope) != {
        "schemaVersion",
        "direction",
        "nonce",
        "payload",
        "mac",
    }:
        raise CheckSandboxBrokerError("검증 broker 응답 envelope가 올바르지 않습니다.")
    payload = envelope.get("payload")
    expected = signedEnvelope("response", nonce, payload, secret) if isinstance(payload, dict) else None
    if (
        envelope.get("schemaVersion") != 1
        or envelope.get("direction") != "response"
        or envelope.get("nonce") != nonce
        or expected is None
        or not hmac.compare_digest(str(envelope.get("mac") or ""), expected["mac"])
        or payload.get("schemaVersion") != 1
        or payload.get("runId") != runId
        or payload.get("executor") != "windows-appcontainer"
        or set(payload) != {
            "schemaVersion",
            "runId",
            "executor",
            "workerResponse",
            "infrastructureError",
        }
    ):
        raise CheckSandboxBrokerError("검증 broker 응답 인증에 실패했습니다.")
    infrastructureError = payload.get("infrastructureError")
    workerResponse = payload.get("workerResponse")
    if isinstance(infrastructureError, str) and infrastructureError:
        raise CheckSandboxBrokerError(infrastructureError)
    if infrastructureError is not None or not isinstance(workerResponse, dict):
        raise CheckSandboxBrokerError("검증 broker 응답 payload가 올바르지 않습니다.")
    return workerResponse


def canonicalBytes(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def writeFrame(stream: BinaryIO, payload: bytes) -> None:
    if len(payload) > MAX_FRAME_BYTES:
        raise CheckSandboxBrokerError("검증 broker 요청이 허용 크기를 넘었습니다.")
    stream.write(len(payload).to_bytes(4, "little"))
    stream.write(payload)
    stream.flush()


def readFrame(stream: BinaryIO) -> bytes:
    length = int.from_bytes(readExact(stream, 4), "little")
    if length < 2 or length > MAX_FRAME_BYTES:
        raise CheckSandboxBrokerError("검증 broker 응답 frame 크기가 올바르지 않습니다.")
    return readExact(stream, length)


def readExact(stream: BinaryIO, length: int) -> bytes:
    chunks: list[bytes] = []
    remaining = length
    while remaining:
        chunk = stream.read(remaining)
        if not chunk:
            raise CheckSandboxBrokerError("검증 broker 연결이 응답 도중 닫혔습니다.")
        chunks.append(chunk)
        remaining -= len(chunk)
    return b"".join(chunks)


def waitForPipe(pipeName: str, process: subprocess.Popen[bytes], timeoutMs: int) -> None:
    import ctypes

    deadline = time.monotonic() + (timeoutMs / 1000)
    while time.monotonic() < deadline:
        if process.poll() is not None:
            _stdout, stderr = process.communicate()
            detail = (stderr or b"").decode("utf-8", errors="replace").strip()
            raise CheckSandboxBrokerError(detail or "검증 broker가 pipe 준비 전에 종료됐습니다.")
        if ctypes.windll.kernel32.WaitNamedPipeW(pipeName, 100):
            return
        time.sleep(0.025)
    raise subprocess.TimeoutExpired(process.args, timeoutMs / 1000)


def terminateBroker(process: subprocess.Popen[bytes]) -> None:
    if process.poll() is None:
        process.kill()
    try:
        process.communicate(timeout=2)
    except subprocess.TimeoutExpired:
        pass
