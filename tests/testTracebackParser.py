from __future__ import annotations

import re
from pathlib import Path

PARSER_PATH = Path(__file__).resolve().parents[1] / "editor" / "src" / "lib" / "tracebackParser.ts"


def testParserSourceDefinesExpectedFunctions() -> None:
    source = PARSER_PATH.read_text(encoding="utf-8")
    assert "export function parseTracebackFrames" in source
    assert "export function extractCellErrorLines" in source
    assert "export function combineErrorSources" in source


def testParserMatchesCommonTraceback() -> None:
    source = PARSER_PATH.read_text(encoding="utf-8")
    assert 'File "([^"]+)", line (\\d+)' in source

    sample = 'Traceback (most recent call last):\n  File "<cell>", line 5, in <module>\n    1/0\nZeroDivisionError: division by zero'
    matches = re.findall(r'File "([^"]+)", line (\d+)', sample)
    lines = [int(line) for _, line in matches]
    assert lines == [5]


def testCellFrameHintsAreExhaustive() -> None:
    source = PARSER_PATH.read_text(encoding="utf-8")
    for hint in ("<cell>", "<string>", "<stdin>", "<ipython", "<frozen", "_block_", "<exec>"):
        assert hint in source, f"missing cell frame hint: {hint}"


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test") and callable(fn):
            fn()
            print(f"ok {name}")
