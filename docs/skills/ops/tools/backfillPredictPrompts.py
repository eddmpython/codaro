"""30days 류 강의에 LearningPredictContract 초안을 일괄 삽입한다.

Predict 백필 사이클 (PRD C4-C6) 의 운영 도구. exercise 블록의 끝(다음 section-level 키
직전)에 predict 블록을 삽입한다. 라인 단위로 동작 — multiline starterCode 의 내부를
침해하지 않는다.

사용:
    uv run python -X utf8 docs/skills/ops/tools/backfillPredictPrompts.py <PATH> [--dry-run]

휴리스틱 추정:
- print('...') 단일 호출 → expectedValue=따옴표 내용
- print(숫자) → expectedValue=숫자, expectedDtype=int
- 마지막 줄 변수 → expectedValue placeholder
- raise → expectedError=클래스명
- 그 외 → prompt 만 (작성자가 채우도록)
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


SECTION_KEY_PATTERN = re.compile(r"^  [a-zA-Z_]\w*:\s*(?:#.*)?$")
ARRAY_ITEM_PATTERN = re.compile(r"^- ")


def _safeYamlScalar(text: str) -> str:
    if not text:
        return "''"
    needsQuote = (
        text.startswith(("`", "{", "}", "[", "]", "&", "*", "!", "|", ">", "%", "@", "?", ":", "-", "#"))
        or text.strip() != text
        or ": " in text
        or " #" in text
    )
    if not needsQuote:
        return text
    return "'" + text.replace("'", "''") + "'"


def deriveDraft(starter: str) -> dict[str, str]:
    if not starter:
        return {"prompt": "셀을 실행하면 어떤 결과가 표시될까요? 예측해 보세요."}
    lines = [line.strip() for line in starter.splitlines() if line.strip()]
    if not lines:
        return {"prompt": "셀을 실행하면 어떤 결과가 표시될까요? 예측해 보세요."}
    lastLine = lines[-1]

    raiseMatch = re.search(r"raise\s+(\w+)", starter)
    if raiseMatch:
        return {
            "prompt": "이 코드를 실행하면 어떤 예외가 발생할까요?",
            "expectedError": raiseMatch.group(1),
        }

    onlyPrintLines = all(re.match(r"^print\((['\"])(.*?)\1\)$", line) for line in lines)
    if onlyPrintLines and lines:
        extracted = [
            re.match(r"^print\((['\"])(.*?)\1\)$", line).group(2)
            for line in lines
        ]
        joined = "\n".join(extracted)
        return {
            "prompt": "셀을 실행하면 출력 영역에 무엇이 표시될까요?",
            "expectedValue": joined,
        }

    printNumber = re.match(r"^print\((-?\d+(?:\.\d+)?)\)$", lastLine)
    if printNumber:
        number = printNumber.group(1)
        return {
            "prompt": "이 print() 호출의 출력 영역에는 어떤 숫자가 표시될까요?",
            "expectedValue": number,
            "expectedDtype": "float" if "." in number else "int",
        }

    printCalc = re.match(r"^print\(([^()]+)\)$", lastLine)
    if printCalc and any(op in printCalc.group(1) for op in ("+", "-", "*", "/")):
        return {
            "prompt": "이 계산식의 결과는 어떤 숫자일까요? 직접 계산해 본 뒤 실행과 비교하세요.",
            "expectedValue": "(계산 결과 숫자를 적어주세요)",
            "expectedDtype": "int",
        }

    if re.match(r"^[a-zA-Z_]\w*$", lastLine):
        return {
            "prompt": "셀 마지막 표현식의 값은 어떻게 표시될까요?",
            "expectedValue": "(직접 실행해 본 값을 적어주세요)",
        }
    if re.match(r"^['\"].*['\"]$", lastLine):
        return {
            "prompt": "셀 마지막 줄의 문자열은 어떻게 표시될까요?",
            "expectedValue": lastLine,
            "expectedDtype": "str",
        }

    return {
        "prompt": "셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?",
        "expectedValue": "(직접 실행해 본 결과를 적어주세요)",
    }


def formatPredictBlock(draft: dict[str, str]) -> list[str]:
    lines = ["    predict:"]
    promptText = draft.get("prompt", "")
    lines.append(f"      prompt: {_safeYamlScalar(promptText)}")
    if "expectedValue" in draft:
        value = draft["expectedValue"]
        if "\n" in value:
            lines.append("      expectedValue: |")
            for valueLine in value.split("\n"):
                lines.append(f"        {valueLine}")
        else:
            lines.append(f"      expectedValue: {_safeYamlScalar(value)}")
    if "expectedDtype" in draft:
        lines.append(f"      expectedDtype: {draft['expectedDtype']}")
    if "expectedShape" in draft:
        lines.append(f"      expectedShape: {draft['expectedShape']}")
    if "expectedError" in draft:
        lines.append(f"      expectedError: {draft['expectedError']}")
    return lines


def _extractStarterFromExerciseLines(exerciseLines: list[str]) -> str:
    """exercise 블록 라인 목록에서 starterCode 본문을 추출."""
    for index, line in enumerate(exerciseLines):
        match = re.match(r"^    starterCode:\s*(\|-?|>|[^\n]+)?", line)
        if not match:
            continue
        directive = match.group(1)
        if directive and directive.startswith(("|", ">")):
            collected: list[str] = []
            for follow in exerciseLines[index + 1:]:
                if follow.startswith("      "):
                    collected.append(follow[6:])
                elif follow.strip() == "":
                    collected.append("")
                else:
                    break
            return "\n".join(collected).strip("\n")
        # inline scalar
        inline = line.split("starterCode:", 1)[1].strip()
        if inline:
            return inline
    return ""


def _exerciseHasPredict(exerciseLines: list[str]) -> bool:
    return any(line.startswith("    predict:") for line in exerciseLines)


def processFile(path: Path, *, dryRun: bool) -> tuple[int, int]:
    rawText = path.read_text(encoding="utf-8")
    lines = rawText.splitlines(keepends=False)
    # exercise 블록 범위를 line index 로 찾는다.
    # block range: [start (the `  exercise:` line), end_exclusive].
    inserted = 0
    skipped = 0
    insertions: list[tuple[int, list[str]]] = []  # (insertAtIndex, blockLines)

    index = 0
    while index < len(lines):
        line = lines[index]
        if line == "  exercise:":
            bodyStart = index + 1
            bodyEnd = bodyStart
            while bodyEnd < len(lines):
                nextLine = lines[bodyEnd]
                # exercise body 는 4-space 또는 더 깊은 indent 또는 빈 줄.
                if nextLine == "":
                    bodyEnd += 1
                    continue
                if nextLine.startswith("    "):
                    bodyEnd += 1
                    continue
                break
            exerciseLines = lines[bodyStart:bodyEnd]
            if _exerciseHasPredict(exerciseLines):
                skipped += 1
            else:
                starter = _extractStarterFromExerciseLines(exerciseLines)
                draft = deriveDraft(starter)
                blockLines = formatPredictBlock(draft)
                # 빈 줄 trailing 제거 후 그 위치에 삽입.
                insertAt = bodyEnd
                while insertAt > bodyStart and lines[insertAt - 1] == "":
                    insertAt -= 1
                insertions.append((insertAt, blockLines))
                inserted += 1
            index = bodyEnd
            continue
        index += 1

    if not insertions:
        return inserted, skipped

    # 뒤에서부터 삽입해 line index 보존.
    newLines = list(lines)
    for insertAt, blockLines in sorted(insertions, key=lambda item: -item[0]):
        newLines[insertAt:insertAt] = blockLines

    newText = "\n".join(newLines)
    if rawText.endswith("\n"):
        newText += "\n"

    if not dryRun:
        path.write_text(newText, encoding="utf-8")
    return inserted, skipped


def collectFiles(targets: list[Path]) -> list[Path]:
    files: list[Path] = []
    for target in targets:
        if target.is_file() and target.suffix == ".yaml":
            files.append(target)
        elif target.is_dir():
            files.extend(sorted(p for p in target.rglob("*.yaml") if p.name != "schema.yaml"))
    return files


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="+", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)

    files = collectFiles(args.paths)
    if not files:
        print("처리할 yaml 없음.", file=sys.stderr)
        return 1

    totalInserted = 0
    totalSkipped = 0
    affectedFiles = 0
    for path in files:
        inserted, skipped = processFile(path, dryRun=args.dry_run)
        if inserted:
            affectedFiles += 1
            print(f"{'[dry]' if args.dry_run else '[ok]'} {path.as_posix()}: +{inserted} (skipped {skipped})")
        totalInserted += inserted
        totalSkipped += skipped

    mode = "dry-run" if args.dry_run else "applied"
    print(
        f"\n[{mode}] {affectedFiles}/{len(files)} files · "
        f"inserted {totalInserted} · skipped {totalSkipped} (already filled)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
