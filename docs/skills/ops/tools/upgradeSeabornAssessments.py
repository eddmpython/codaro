from __future__ import annotations

import argparse

from assessment_authoring.common import ROOT, materialize, validateBlueprints
from assessment_authoring.seaborn_blueprints import BLUEPRINTS


TRACK = ROOT / "curricula" / "python" / "visualization" / "seaborn"


def main() -> int:
    parser = argparse.ArgumentParser(description="Materialize curated Seaborn assessment progression")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()
    validateBlueprints("seaborn", BLUEPRINTS)
    changed = materialize(TRACK, "seaborn", BLUEPRINTS, write=args.write, refresh=args.refresh)
    action = "updated" if args.write else "would update"
    print(f"{action}: {len(changed)} Seaborn lesson(s)")
    for path in changed:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
