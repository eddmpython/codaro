from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

from .base import ConnectionTestResult, Integration, IntegrationInfo

logger = logging.getLogger(__name__)


class EmailIntegration(Integration):

    def __init__(self) -> None:
        self._host: str = ""
        self._port: int = 587
        self._username: str = ""
        self._password: str = ""
        self._fromAddress: str = ""
        self._useTls: bool = True

    def info(self) -> IntegrationInfo:
        return IntegrationInfo(
            id="email",
            name="Email (SMTP)",
            category="messaging",
            description="Send email notifications via SMTP.",
            icon="mail",
            configSchema={
                "type": "object",
                "properties": {
                    "host": {"type": "string", "description": "SMTP server hostname"},
                    "port": {"type": "integer", "description": "SMTP port (default: 587)"},
                    "username": {"type": "string", "description": "SMTP username"},
                    "password": {"type": "string", "description": "SMTP password"},
                    "fromAddress": {"type": "string", "description": "Sender email address"},
                    "useTls": {"type": "boolean", "description": "Use TLS (default: true)"},
                },
                "required": ["host", "username", "password", "fromAddress"],
            },
        )

    def configure(self, config: dict[str, Any]) -> None:
        self._host = config.get("host", "")
        self._port = config.get("port", 587)
        self._username = config.get("username", "")
        self._password = config.get("password", "")
        self._fromAddress = config.get("fromAddress", "")
        self._useTls = config.get("useTls", True)

    def testConnection(self) -> ConnectionTestResult:
        if not self._host:
            return ConnectionTestResult(success=False, message="SMTP host not configured")
        try:
            server = smtplib.SMTP(self._host, self._port, timeout=10)
            if self._useTls:
                server.starttls()
            if self._username and self._password:
                server.login(self._username, self._password)
            server.quit()
            return ConnectionTestResult(success=True, message=f"Connected to {self._host}:{self._port}")
        except (smtplib.SMTPException, OSError) as exc:
            return ConnectionTestResult(success=False, message=str(exc))

    def execute(self, action: str, params: dict[str, Any]) -> dict[str, Any]:
        if action == "send":
            return self._send(params)
        return {"error": f"Unknown action: {action}"}

    def listActions(self) -> list[dict[str, Any]]:
        return [
            {
                "name": "send",
                "description": "Send an email",
                "parameters": {
                    "to": {"type": "string", "required": True},
                    "subject": {"type": "string", "required": True},
                    "body": {"type": "string", "required": True},
                    "html": {"type": "boolean"},
                },
            },
        ]

    def _send(self, params: dict[str, Any]) -> dict[str, Any]:
        if not self._host:
            return {"error": "SMTP not configured"}
        to = params.get("to", "")
        subject = params.get("subject", "")
        body = params.get("body", "")
        if not to or not subject:
            return {"error": "to and subject are required"}

        msg = MIMEMultipart("alternative")
        msg["From"] = self._fromAddress
        msg["To"] = to
        msg["Subject"] = subject

        if params.get("html"):
            msg.attach(MIMEText(body, "html"))
        else:
            msg.attach(MIMEText(body, "plain"))

        try:
            server = smtplib.SMTP(self._host, self._port, timeout=15)
            if self._useTls:
                server.starttls()
            if self._username and self._password:
                server.login(self._username, self._password)
            server.sendmail(self._fromAddress, [to], msg.as_string())
            server.quit()
            return {"success": True, "to": to, "subject": subject}
        except (smtplib.SMTPException, OSError) as exc:
            return {"success": False, "error": str(exc)}
