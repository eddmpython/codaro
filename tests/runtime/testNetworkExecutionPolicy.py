from __future__ import annotations

from pathlib import Path
import socket

import pytest

from codaro.runtime.executionPolicy import (
    ExecutionPolicyError,
    ExecutionSecurityPolicy,
    canonicalNetworkOrigin,
    networkOriginEndpoint,
)
from codaro.runtime.localWorker import _NetworkDestinationGuard


def _policy(tmp_path: Path, *origins: str) -> ExecutionSecurityPolicy:
    return ExecutionSecurityPolicy.create(
        workspaceRoot=tmp_path,
        permissionScopes=["network"],
        policyHash="sha256-" + "1" * 64,
        networkOrigins=list(origins),
    )


def testNetworkOriginCanonicalizesSchemeHostAndDefaultPort(tmp_path: Path) -> None:
    assert canonicalNetworkOrigin("HTTP://LOCALHOST.:80/") == "http://localhost"
    assert canonicalNetworkOrigin("https://Example.COM:444") == "https://example.com:444"
    assert networkOriginEndpoint("https://example.com") == ("example.com", 443)
    policy = _policy(tmp_path, "HTTP://LOCALHOST.:80/", "http://localhost")
    assert policy.networkOrigins == ("http://localhost",)


@pytest.mark.parametrize(
    "origin",
    [
        "ftp://example.com",
        "https://user@example.com",
        "https://example.com/path",
        "https://example.com?query=1",
        "https://example.com#fragment",
        "https://example.com:99999",
    ],
)
def testNetworkOriginRejectsNonOriginValues(origin: str) -> None:
    with pytest.raises(ExecutionPolicyError):
        canonicalNetworkOrigin(origin)


def testDnsResolutionPinsDeclaredHostPortAndRejectsDirectIp(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        socket,
        "getaddrinfo",
        lambda host, port, **kwargs: [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("127.0.0.1", port))],
    )
    guard = _NetworkDestinationGuard(_policy(tmp_path, "http://localhost:8765"))

    with pytest.raises(PermissionError, match="destination is not declared"):
        guard.require("socket.connect", (object(), ("127.0.0.1", 8765)))

    guard.require("socket.getaddrinfo", ("localhost", 8765, 0, socket.SOCK_STREAM, 0))
    guard.require("socket.connect", (object(), ("127.0.0.1", 8765)))

    with pytest.raises(PermissionError, match="destination is not declared"):
        guard.require("socket.connect", (object(), ("127.0.0.1", 8765)))


def testDnsPinRejectsPortChangeUndeclaredHostAndReboundAddress(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        socket,
        "getaddrinfo",
        lambda host, port, **kwargs: [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("127.0.0.1", port))],
    )
    guard = _NetworkDestinationGuard(_policy(tmp_path, "http://localhost:8765"))

    for args in (
        ("localhost", 8766, 0, socket.SOCK_STREAM, 0),
        ("example.com", 8765, 0, socket.SOCK_STREAM, 0),
    ):
        with pytest.raises(PermissionError, match="destination is not declared"):
            guard.require("socket.getaddrinfo", args)

    guard.require("socket.getaddrinfo", ("localhost", 8765, 0, socket.SOCK_STREAM, 0))
    with pytest.raises(PermissionError, match="destination is not declared"):
        guard.require("socket.connect", (object(), ("127.0.0.2", 8765)))
