"""CLAUDE.md <-> AGENTS.md byte-identical sync gate.

Run modes:
    uv run python -X utf8 docs/skills/ops/tools/syncAgentsMd.py            # copy CLAUDE.md to AGENTS.md
    uv run python -X utf8 docs/skills/ops/tools/syncAgentsMd.py --check    # exit 1 if they drift
    uv run python -X utf8 docs/skills/ops/tools/syncAgentsMd.py --reverse  # copy AGENTS.md to CLAUDE.md

Source of truth defaults to CLAUDE.md. The two files must remain byte-identical
because Codaro entrypoint rules (see docs/skills/ops/doc-and-session.md) require
that AGENTS.md and CLAUDE.md never drift.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
CLAUDE_PATH = REPO_ROOT / "CLAUDE.md"
AGENTS_PATH = REPO_ROOT / "AGENTS.md"


def readBytes(path: Path) -> bytes:
    if not path.exists():
        raise FileNotFoundError(f"missing: {path}")
    return path.read_bytes()


def writeBytes(path: Path, data: bytes) -> None:
    path.write_bytes(data)


def runCheck() -> int:
    claudeBytes = readBytes(CLAUDE_PATH)
    agentsBytes = readBytes(AGENTS_PATH)
    if claudeBytes == agentsBytes:
        print("ok: CLAUDE.md and AGENTS.md are byte-identical")
        return 0
    print("drift: CLAUDE.md and AGENTS.md differ", file=sys.stderr)
    print(f"  CLAUDE.md  {len(claudeBytes):>6} bytes", file=sys.stderr)
    print(f"  AGENTS.md  {len(agentsBytes):>6} bytes", file=sys.stderr)
    print("run 'uv run python -X utf8 docs/skills/ops/tools/syncAgentsMd.py' to sync", file=sys.stderr)
    return 1


def runCopy(reverse: bool) -> int:
    src = AGENTS_PATH if reverse else CLAUDE_PATH
    dst = CLAUDE_PATH if reverse else AGENTS_PATH
    data = readBytes(src)
    writeBytes(dst, data)
    print(f"copied: {src.name} -> {dst.name} ({len(data)} bytes)")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="exit 1 on drift")
    parser.add_argument("--reverse", action="store_true", help="copy AGENTS.md to CLAUDE.md instead")
    args = parser.parse_args()

    if args.check:
        return runCheck()
    return runCopy(reverse=args.reverse)


if __name__ == "__main__":
    sys.exit(main())
