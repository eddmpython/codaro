from __future__ import annotations

import csv
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parent
EXPENSES_PATH = ROOT / "sampleExpenses.csv"


def loadExpenses(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as stream:
        return list(csv.DictReader(stream))


def summarizeByCategory(rows: list[dict[str, str]]) -> dict[str, float]:
    totals: dict[str, float] = defaultdict(float)
    for row in rows:
        totals[row["category"]] += float(row["amount"])
    return dict(sorted(totals.items()))


def main() -> int:
    rows = loadExpenses(EXPENSES_PATH)
    totals = summarizeByCategory(rows)
    topCategory, topAmount = max(totals.items(), key=lambda item: item[1])

    print("Codaro public launch demo: expense summary")
    print(f"rows: {len(rows)}")
    for category, amount in totals.items():
        print(f"{category}: ${amount:.2f}")
    print(f"top category: {topCategory} (${topAmount:.2f})")
    print("next step: turn this cell into a weekly expense report task")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
