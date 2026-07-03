"""커리큘럼 tips 중복 감사·수리 도구.

구조화 섹션에서 tips 항목이 같은 섹션 explanation 안에 **정확히(verbatim substring)**
포함되면 화면에 같은 문장이 두 번 노출된다(본문 + 팁 콜아웃). 이 도구는:

1. --audit  : 중복 목록을 JSON 리포트로 출력한다 (기본, 파일 무변경).
2. --apply  : 정확 일치 항목만 YAML에서 한 줄 단위로 제거한다.

안전 규칙 (렌더 은폐 대신 원본 수정 — curriculum-card-contract.md 시각 규칙 5):
- 정확 substring 일치만 제거한다. 퍼지 매칭 자동 삭제 금지.
- 한 줄짜리 tips 항목만 제거한다(멀티라인 블록 스칼라는 건너뛰고 리포트에만 남긴다).
- converter가 section.tips를 exercise 힌트 fallback으로 쓰므로, 제거 후 힌트 소스가
  하나도 안 남는 섹션(exercise.hints 비어 있고 tips 전멸)은 제거하지 않는다.
- 적용 후 YAML을 재파싱해 "그 tips 항목 제거" 외의 구조 변화가 없음을 검증하고,
  달라지면 해당 파일을 원복한다.

실행: uv run python -X utf8 docs/skills/ops/tools/auditTipsDuplication.py [--apply] [--report PATH]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[4]
CURRICULA = ROOT / "curricula" / "python"


def loadYaml(path: Path):
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def sectionDuplicates(section: dict) -> list[str]:
    explanation = section.get("explanation")
    tips = section.get("tips")
    if not isinstance(explanation, str) or not isinstance(tips, list):
        return []
    return [tip for tip in tips if isinstance(tip, str) and tip and tip in explanation]


def exerciseHints(section: dict) -> list:
    exercise = section.get("exercise")
    if not isinstance(exercise, dict):
        return []
    hints = exercise.get("hints")
    return hints if isinstance(hints, list) else []


def parseTipLine(line: str) -> str | None:
    stripped = line.strip()
    if not stripped.startswith("- "):
        return None
    try:
        parsed = yaml.safe_load(stripped)
    except yaml.YAMLError:
        return None
    if isinstance(parsed, list) and len(parsed) == 1 and isinstance(parsed[0], str):
        return parsed[0]
    return None


def removeTipsFromText(text: str, sectionId: str, removeValues: list[str]) -> tuple[str, list[str]]:
    """섹션 id 블록 안 tips: 아래에서 removeValues와 정확히 일치하는 한 줄 항목을 지운다."""
    lines = text.split("\n")
    remaining = list(removeValues)
    out: list[str] = []
    index = 0
    inTargetSection = False
    inTips = False
    tipsIndent = 0
    removedLineIndexes: list[int] = []

    while index < len(lines):
        line = lines[index]
        stripped = line.strip()
        if stripped.startswith("- id:"):
            currentId = stripped.split(":", 1)[1].strip().strip("'\"")
            inTargetSection = currentId == sectionId
            inTips = False
        elif inTargetSection and stripped == "tips:":
            inTips = True
            tipsIndent = len(line) - len(line.lstrip())
            out.append(line)
            index += 1
            continue
        elif inTips:
            indent = len(line) - len(line.lstrip())
            isItem = stripped.startswith("- ") and indent <= tipsIndent + 2
            if isItem:
                # 다음 줄이 이어지는 멀티라인 스칼라면 건너뛴다(한 줄 항목만 처리).
                nextLine = lines[index + 1] if index + 1 < len(lines) else ""
                nextStripped = nextLine.strip()
                nextIndent = len(nextLine) - len(nextLine.lstrip()) if nextLine.strip() else 0
                continuation = bool(nextStripped) and not nextStripped.startswith("- ") and nextIndent > indent
                value = None if continuation else parseTipLine(line)
                if value is not None and value in remaining:
                    remaining.remove(value)
                    removedLineIndexes.append(index)
                    index += 1
                    continue
            else:
                inTips = False
        out.append(line)
        index += 1

    return "\n".join(out), remaining


def cleanupEmptyTips(text: str) -> str:
    """항목이 전부 제거돼 비어버린 tips: 키 라인을 지운다."""
    lines = text.split("\n")
    out: list[str] = []
    for index, line in enumerate(lines):
        if line.strip() == "tips:":
            nextLine = lines[index + 1] if index + 1 < len(lines) else ""
            nextStripped = nextLine.strip()
            indent = len(line) - len(line.lstrip())
            nextIndent = len(nextLine) - len(nextLine.lstrip()) if nextStripped else 0
            hasItem = nextStripped.startswith("- ") and nextIndent >= indent
            if not hasItem:
                continue
        out.append(line)
    return "\n".join(out)


def expectedAfterRemoval(original, removals: dict[str, list[str]]):
    """원본 파싱 구조에서 (sectionId → 제거 tips)를 적용한 기대 구조를 만든다."""
    import copy

    expected = copy.deepcopy(original)
    for section in expected.get("sections", []):
        if not isinstance(section, dict):
            continue
        sectionId = str(section.get("id"))
        if sectionId not in removals:
            continue
        toRemove = list(removals[sectionId])
        tips = section.get("tips")
        if not isinstance(tips, list):
            continue
        newTips = []
        for tip in tips:
            if isinstance(tip, str) and tip in toRemove:
                toRemove.remove(tip)
                continue
            newTips.append(tip)
        if newTips:
            section["tips"] = newTips
        else:
            section.pop("tips", None)
    return expected


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="정확 일치 tips를 YAML에서 제거")
    parser.add_argument("--report", type=Path, default=None, help="감사 리포트 JSON 경로")
    args = parser.parse_args()

    report = {"files": [], "totalDuplicates": 0, "removed": 0, "skipped": []}

    for path in sorted(CURRICULA.rglob("*.yaml")):
        if path.name in {"schema.yaml", "_taxonomy.yml"}:
            continue
        try:
            data = loadYaml(path)
        except yaml.YAMLError as exc:
            report["skipped"].append({"file": str(path.relative_to(ROOT)), "reason": f"yaml-error: {exc}"})
            continue
        if not isinstance(data, dict):
            continue
        sections = data.get("sections")
        if not isinstance(sections, list):
            continue

        removals: dict[str, list[str]] = {}
        fileEntry = {"file": str(path.relative_to(ROOT)), "sections": []}
        for section in sections:
            if not isinstance(section, dict):
                continue
            duplicates = sectionDuplicates(section)
            if not duplicates:
                continue
            report["totalDuplicates"] += len(duplicates)
            tips = section.get("tips") or []
            keepsHintSource = bool(exerciseHints(section)) or len(duplicates) < len(tips)
            entry = {
                "id": section.get("id"),
                "duplicates": duplicates,
                "removable": keepsHintSource,
            }
            fileEntry["sections"].append(entry)
            if keepsHintSource:
                removals[str(section.get("id"))] = duplicates
        if fileEntry["sections"]:
            report["files"].append(fileEntry)

        if not args.apply or not removals:
            continue

        original = path.read_text(encoding="utf-8")
        updated = original
        for sectionId, values in removals.items():
            updated, leftover = removeTipsFromText(updated, sectionId, values)
            if leftover:
                report["skipped"].append({
                    "file": str(path.relative_to(ROOT)),
                    "reason": f"multiline-or-unmatched tips in section {sectionId}: {leftover}",
                })
        updated = cleanupEmptyTips(updated)
        if updated == original:
            continue
        try:
            reparsed = yaml.safe_load(updated)
        except yaml.YAMLError as exc:
            report["skipped"].append({"file": str(path.relative_to(ROOT)), "reason": f"post-edit yaml-error: {exc}"})
            continue
        # 제거된 항목이 실제로 텍스트에서 지워진 만큼만 기대 구조에 반영한다.
        actualRemovals: dict[str, list[str]] = {}
        for section in sections:
            if not isinstance(section, dict):
                continue
            sectionId = str(section.get("id"))
            if sectionId not in removals:
                continue
            before = [tip for tip in (section.get("tips") or []) if isinstance(tip, str)]
            afterSection = next(
                (item for item in reparsed.get("sections", []) if isinstance(item, dict) and str(item.get("id")) == sectionId),
                None,
            )
            after = [tip for tip in ((afterSection or {}).get("tips") or []) if isinstance(tip, str)]
            gone = []
            afterPool = list(after)
            for tip in before:
                if tip in afterPool:
                    afterPool.remove(tip)
                else:
                    gone.append(tip)
            actualRemovals[sectionId] = gone
        if reparsed != expectedAfterRemoval(data, actualRemovals):
            report["skipped"].append({"file": str(path.relative_to(ROOT)), "reason": "post-edit structure drift — reverted"})
            continue
        path.write_text(updated, encoding="utf-8")
        report["removed"] += sum(len(values) for values in actualRemovals.values())

    output = json.dumps(report, ensure_ascii=False, indent=2)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(output, encoding="utf-8")
        print(f"report: {args.report} (duplicates={report['totalDuplicates']}, removed={report['removed']}, skipped={len(report['skipped'])})")
    else:
        print(output)
    return 0


if __name__ == "__main__":
    sys.exit(main())
