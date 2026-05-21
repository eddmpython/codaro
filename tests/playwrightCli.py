from __future__ import annotations

import os
import subprocess
import time
from pathlib import Path


class PlaywrightCliError(RuntimeError):
    pass


class PlaywrightCli:
    def __init__(self, *, cliPath: Path, cwd: Path, session: str) -> None:
        self._cliPath = cliPath
        self._cwd = cwd
        self._session = session
        self._daemonDir = cwd / "daemon"
        self._serverRegistryDir = cwd / "server-registry"

    def run(self, *args: str) -> str:
        self._daemonDir.mkdir(parents=True, exist_ok=True)
        self._serverRegistryDir.mkdir(parents=True, exist_ok=True)
        command = [
            str(self._cliPath),
            "--session",
            self._session,
            *args,
        ]
        result = subprocess.run(
            command,
            cwd=self._cwd,
            text=True,
            encoding="utf-8",
            errors="replace",
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
            env=self._env(),
        )
        if result.returncode != 0:
            raise PlaywrightCliError(f"playwright-cli {' '.join(args)} failed:\n{result.stdout}")
        return result.stdout.strip()

    def close(self) -> None:
        self._daemonDir.mkdir(parents=True, exist_ok=True)
        self._serverRegistryDir.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            [str(self._cliPath), "--session", self._session, "close"],
            cwd=self._cwd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
            env=self._env(),
        )

    def eval(self, expression: str) -> str:
        output = self.run("eval", expression, "--raw")
        if isPlaywrightEvalError(output):
            raise PlaywrightCliError(output)
        return output

    def waitEval(self, expression: str, label: str, timeout: float = 20.0) -> None:
        deadline = time.monotonic() + timeout
        lastOutput = ""
        while time.monotonic() < deadline:
            try:
                lastOutput = self.eval(expression)
                if lastOutput.strip() == "true":
                    return
            except PlaywrightCliError as exc:
                lastOutput = str(exc)
            time.sleep(0.35)
        raise PlaywrightCliError(f"timed out waiting for {label}: {lastOutput}")

    def _env(self) -> dict[str, str]:
        env = os.environ.copy()
        env.setdefault("PLAYWRIGHT_DAEMON_SESSION_DIR", str(self._daemonDir))
        env.setdefault("PLAYWRIGHT_SERVER_REGISTRY", str(self._serverRegistryDir))
        env.setdefault("PLAYWRIGHT_SKIP_BROWSER_GC", "1")
        return env


def resolvePlaywrightCli(root: Path) -> Path:
    envPath = os.environ.get("CODARO_PLAYWRIGHT_CLI")
    candidates: list[Path] = []
    if envPath:
        candidates.append(Path(envPath))

    candidates.extend(
        [
            root / "editor" / "node_modules" / ".bin" / "playwright-cli.cmd",
            root / "node_modules" / ".bin" / "playwright-cli.cmd",
            root / "editor" / "node_modules" / ".bin" / "playwright-cli",
            root / "node_modules" / ".bin" / "playwright-cli",
        ]
    )

    npmCache = Path(os.environ.get("npm_config_cache") or Path.home() / "AppData" / "Local" / "npm-cache")
    npxRoot = npmCache / "_npx"
    if npxRoot.exists():
        candidates.extend(sorted(npxRoot.glob("*/node_modules/.bin/playwright-cli.cmd")))
        candidates.extend(sorted(npxRoot.glob("*/node_modules/.bin/playwright-cli")))

    for candidate in candidates:
        if candidate.exists():
            return candidate

    raise PlaywrightCliError(
        "playwright-cli is not available locally. Install editor dev dependencies or set CODARO_PLAYWRIGHT_CLI "
        "to an existing playwright-cli executable."
    )


def isPlaywrightEvalError(output: str) -> bool:
    stripped = output.lstrip()
    if stripped.startswith("### Error"):
        return True
    errorPrefixes = (
        "Error:",
        "TypeError:",
        "ReferenceError:",
        "SyntaxError:",
        "TimeoutError:",
        "locator.",
    )
    return stripped.startswith(errorPrefixes)
