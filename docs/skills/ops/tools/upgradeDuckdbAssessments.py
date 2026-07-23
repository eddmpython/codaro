from __future__ import annotations

import argparse

from assessment_authoring.common import ROOT, materialize, validateBlueprints
from assessment_authoring.duckdb_blueprints import BLUEPRINTS


TRACK = ROOT / "curricula" / "python" / "dataAnalysis" / "duckdb"


def main() -> int:
    parser = argparse.ArgumentParser(description="Materialize curated DuckDB assessment progression")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()
    validateBlueprints("duckdb", BLUEPRINTS)
    changed = materialize(TRACK, "duckdb", BLUEPRINTS, write=args.write, refresh=args.refresh)
    action = "updated" if args.write else "would update"
    print(f"{action}: {len(changed)} DuckDB lesson(s)")
    for path in changed:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
