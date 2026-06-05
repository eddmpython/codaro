from __future__ import annotations

import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class AssignmentRelayError(RuntimeError):
    pass


class HttpAssignmentRelayClient:
    def __init__(self, baseUrl: str, *, timeoutSeconds: float = 10.0) -> None:
        self.baseUrl = baseUrl.rstrip("/")
        self.timeoutSeconds = timeoutSeconds

    def postJson(self, path: str, payload: dict[str, Any]) -> dict[str, Any]:
        request = Request(
            f"{self.baseUrl}{path}",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        return self._send(request)

    def getJson(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        query = f"?{urlencode(params)}" if params else ""
        request = Request(f"{self.baseUrl}{path}{query}", method="GET")
        return self._send(request)

    def _send(self, request: Request) -> dict[str, Any]:
        try:
            with urlopen(request, timeout=self.timeoutSeconds) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
            raise AssignmentRelayError(str(error)) from error
        if not isinstance(payload, dict):
            raise AssignmentRelayError("relay response must be a JSON object")
        return payload
