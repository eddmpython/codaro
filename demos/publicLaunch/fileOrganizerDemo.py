from __future__ import annotations

import csv
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DOWNLOADS_PATH = ROOT / "sampleDownloads.csv"
TARGET_BY_EXTENSION = {
    ".md": "notes",
    ".mp4": "videos",
    ".pdf": "documents",
    ".png": "images",
    ".py": "code",
    ".xlsx": "spreadsheets",
}


def loadFiles(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as stream:
        return list(csv.DictReader(stream))


def buildMovePlan(rows: list[dict[str, str]]) -> dict[str, list[str]]:
    plan: dict[str, list[str]] = defaultdict(list)
    for row in rows:
        fileName = row["fileName"]
        extension = Path(fileName).suffix.lower()
        target = TARGET_BY_EXTENSION.get(extension, "other")
        plan[target].append(fileName)
    return dict(sorted(plan.items()))


def main() -> int:
    rows = loadFiles(DOWNLOADS_PATH)
    plan = buildMovePlan(rows)

    print("Codaro public launch demo: safe file organizer")
    print("mode: dry-run")
    for target, fileNames in plan.items():
        joined = ", ".join(sorted(fileNames))
        print(f"{target}: {joined}")
    print("next step: ask before moving files, then save as an automation task")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
