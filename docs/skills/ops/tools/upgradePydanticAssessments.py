from __future__ import annotations

import argparse

from assessment_authoring.common import ROOT, materialize, validateBlueprints
from assessment_authoring.pydantic_blueprints import BLUEPRINTS


TRACK = ROOT / "curricula" / "python" / "dataAnalysis" / "pydantic"


def main() -> int:
    parser = argparse.ArgumentParser(description="Materialize curated pydantic assessment progression")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()
    validateBlueprints("pydantic", BLUEPRINTS)
    changed = materialize(TRACK, "pydantic", BLUEPRINTS, write=args.write, refresh=args.refresh)
    action = "updated" if args.write else "would update"
    print(f"{action}: {len(changed)} pydantic lesson(s)")
    for path in changed:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
