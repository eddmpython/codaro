from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
CHANGELOG = ROOT / "CHANGELOG.md"

# `## 0.0.3 - 2026-05-30` 또는 `## 0.0.3` 형태의 버전 헤딩을 매칭한다.
# 버전 토큰 뒤에 공백/하이픈/줄끝이 와야 하므로 `0.0.3` 이 `0.0.30` 을 잡지 않는다.
HEADING = re.compile(r"^##\s+(?P<version>\S+)")


def main(argv: list[str] | None = None) -> int:
    args = buildParser().parse_args(argv)
    changelogPath = Path(args.changelog) if args.changelog else CHANGELOG
    if not changelogPath.is_file():
        print(f"changelog not found: {changelogPath}", file=sys.stderr)
        return 2

    version = args.version.removeprefix("v")
    body = extractSection(changelogPath.read_text(encoding="utf-8"), version)
    if body is None:
        print(
            f"no '## {version}' section in {changelogPath.name} — "
            "릴리즈 전 CHANGELOG.md 에 해당 버전 섹션을 작성하세요.",
            file=sys.stderr,
        )
        return 1

    if args.output:
        outputPath = Path(args.output)
        outputPath.parent.mkdir(parents=True, exist_ok=True)
        outputPath.write_text(body + "\n", encoding="utf-8")
    else:
        sys.stdout.write(body + "\n")
    return 0


def extractSection(text: str, version: str) -> str | None:
    """`## {version}` 헤딩 다음 줄부터 다음 `## ` 헤딩 직전까지를 trim 해서 반환한다."""
    lines = text.splitlines()
    start: int | None = None
    for index, line in enumerate(lines):
        match = HEADING.match(line)
        if match and match.group("version") == version:
            start = index + 1
            break
    if start is None:
        return None

    end = len(lines)
    for index in range(start, len(lines)):
        if HEADING.match(lines[index]):
            end = index
            break

    body = "\n".join(lines[start:end]).strip()
    return body or None


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="CHANGELOG.md 에서 한 버전 섹션을 추출해 GitHub Release 본문으로 쓴다.",
    )
    parser.add_argument("--version", required=True, help="추출할 버전 (예: 0.0.3 또는 v0.0.3).")
    parser.add_argument("--changelog", default=None, help="CHANGELOG 경로 (기본: 저장소 루트 CHANGELOG.md).")
    parser.add_argument("--output", default=None, help="섹션을 쓸 파일 (기본: stdout).")
    return parser


if __name__ == "__main__":
    raise SystemExit(main())
