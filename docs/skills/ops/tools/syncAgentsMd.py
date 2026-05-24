"""CLAUDE.md -> AGENTS.md pointer sync gate.

Run modes:
    uv run python -X utf8 docs/skills/ops/tools/syncAgentsMd.py
    uv run python -X utf8 docs/skills/ops/tools/syncAgentsMd.py --check

CLAUDE.md is the local rule source of truth. AGENTS.md is a thin entrypoint
that tells agents to read CLAUDE.md first.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
CLAUDE_PATH = REPO_ROOT / "CLAUDE.md"
AGENTS_PATH = REPO_ROOT / "AGENTS.md"


def readText(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f"missing: {path}")
    return path.read_text(encoding="utf-8")


def writeText(path: Path, data: str) -> None:
    path.write_text(data, encoding="utf-8", newline="\n")


def buildAgentsPointer() -> str:
    return (
        "# Codaro 프로젝트 규칙\n"
        "\n"
        "이 파일은 에이전트 진입점 포인터입니다. 상세 규칙의 SSOT는 [CLAUDE.md](CLAUDE.md)입니다.\n"
        "\n"
        "작업 시작 전 반드시:\n"
        "\n"
        "1. `CLAUDE.md`를 먼저 읽는다.\n"
        "2. `C:\\Users\\MSI\\.claude\\projects\\c--Users-MSI-OneDrive-Desktop-sideProject-codaro\\memory\\MEMORY.md`를 읽는다.\n"
        "3. 관련 상세 규칙은 `docs/skills/`에서 확인한다.\n"
        "\n"
        "이 파일에는 전체 규칙을 복사하지 않는다. `uv run python -X utf8 docs/skills/ops/tools/syncAgentsMd.py`로 포인터를 재생성한다.\n"
    )


def runCheck() -> int:
    claudeExists = CLAUDE_PATH.exists()
    agentsExists = AGENTS_PATH.exists()
    if not claudeExists and not agentsExists:
        print("ok: local agent rule files are intentionally untracked")
        return 0
    if claudeExists != agentsExists:
        print("drift: CLAUDE.md and AGENTS.md must be both present locally or both absent", file=sys.stderr)
        return 1

    readText(CLAUDE_PATH)
    agentsText = readText(AGENTS_PATH)
    expectedText = buildAgentsPointer()
    if agentsText == expectedText:
        print("ok: AGENTS.md points to CLAUDE.md")
        return 0
    print("drift: AGENTS.md is not the expected CLAUDE.md pointer", file=sys.stderr)
    print(f"  expected {len(expectedText.encode('utf-8')):>6} bytes", file=sys.stderr)
    print(f"  actual   {len(agentsText.encode('utf-8')):>6} bytes", file=sys.stderr)
    print(
        "run 'uv run python -X utf8 docs/skills/ops/tools/syncAgentsMd.py' to regenerate",
        file=sys.stderr,
    )
    return 1


def runCopy() -> int:
    readText(CLAUDE_PATH)
    data = buildAgentsPointer()
    writeText(AGENTS_PATH, data)
    print(f"written: {AGENTS_PATH.name} -> CLAUDE.md pointer ({len(data.encode('utf-8'))} bytes)")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="exit 1 on drift")
    args = parser.parse_args()

    if args.check:
        return runCheck()
    return runCopy()


if __name__ == "__main__":
    sys.exit(main())
