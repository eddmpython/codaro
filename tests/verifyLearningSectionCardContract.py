from __future__ import annotations

import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SURFACE = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumSurface.tsx"


def require(text: str, token: str, label: str, failures: list[str]) -> None:
    if token not in text:
        failures.append(f"missing {label}: {token}")


def require_order(text: str, before: str, after: str, label: str, failures: list[str]) -> None:
    before_index = text.find(before)
    after_index = text.find(after)
    if before_index == -1 or after_index == -1:
        failures.append(f"missing order tokens for {label}")
        return
    if before_index > after_index:
        failures.append(f"wrong order for {label}: expected {before} before {after}")


def main() -> int:
    failures: list[str] = []

    if not SURFACE.exists():
        print(f"FAIL: missing editor surface: {SURFACE.relative_to(ROOT)}", file=sys.stderr)
        return 1

    text = SURFACE.read_text(encoding="utf-8")

    required_tokens = {
        "section card marker": "data-learning-section-card={section.id}",
        "structured section marker": 'data-learning-section-structured={structured ? "true" : "false"}',
        "overview marker": 'data-learning-section-part="overview"',
        "exercise marker": 'data-learning-section-part="exercise"',
        "exercise direct editor marker": 'data-learning-exercise-input="editor"',
        "result marker": 'data-learning-section-part="result"',
        "section overview renderer": "function SectionContractOverview",
        "structured body renderer": "function StructuredSectionLearningBody",
        "structured band renderer": "function StructuredSectionBand",
        "structured detector": "function hasStructuredSectionBlocks",
        "structured parts resolver": "function structuredSectionParts",
        "contract overview before body": "<SectionContractOverview contract={section.contract} />",
        "single-card structured branch": "structured ? (",
        "legacy fallback branch": "variant=\"embedded\"",
        "contract source detector": 'block.sourceType?.startsWith("sectionContract:")',
        "snippet source mapping": 'block.sourceType === "sectionContract:snippet"',
        "exercise source mapping": 'block.sourceType === "sectionContract:exercise"',
        "check source mapping": 'block.sourceType === "sectionContract:check"',
        "snippet part assignment": 'part="snippet"',
        "check part assignment": 'part="check"',
        "structured exercise direct editor": "autoFocus: exerciseSelected",
    }
    for label, token in required_tokens.items():
        require(text, token, label, failures)

    require_order(
        text,
        "<SectionContractOverview contract={section.contract} />",
        "<StructuredSectionLearningBody",
        "section card overview-to-practice flow",
        failures,
    )
    require_order(
        text,
        'part="snippet"',
        'data-learning-section-part="exercise"',
        "snippet before exercise",
        failures,
    )
    require_order(
        text,
        'data-learning-section-part="exercise"',
        'data-learning-section-part="result"',
        "exercise before result",
        failures,
    )
    require_order(
        text,
        'data-learning-section-part="result"',
        'part="check"',
        "result before check",
        failures,
    )

    marker_count = text.count("data-learning-section-part")
    if marker_count < 4:
        failures.append(f"expected at least 4 section part marker sites, found {marker_count}")

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1

    print("ok: structured learning section card contract is wired in the editor surface")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
