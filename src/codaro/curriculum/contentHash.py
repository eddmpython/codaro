"""레슨 본문 해시의 SSOT.

원장(content-ledger)과 교육용 시각 자산 provenance가 같은 값을 가리켜야 하므로
계산 규칙을 한 곳에 둔다. 줄바꿈을 LF로 정규화한 뒤 해시한다. 저장소가 텍스트
파일을 LF로 보관하고 Windows 작업 트리에서는 CRLF로 펼쳐지기 때문에, 원본
바이트를 그대로 해시하면 같은 커밋인데도 OS마다 값이 달라진다. 실제로 Windows에서
찍은 값이 Linux CI에서 드리프트로 잡힌 적이 있다.
"""
from __future__ import annotations

import hashlib
from pathlib import Path


def normalizeLineEndings(content: bytes) -> bytes:
    """CRLF와 CR을 LF로 맞춘다. 저장소 보관 형식과 같은 바이트를 만든다."""
    return content.replace(b"\r\n", b"\n").replace(b"\r", b"\n")


def lessonContentHash(path: Path) -> str:
    """레슨 파일의 내용 해시(hex). 접두사 없이 돌려준다."""
    return hashlib.sha256(normalizeLineEndings(path.read_bytes())).hexdigest()
