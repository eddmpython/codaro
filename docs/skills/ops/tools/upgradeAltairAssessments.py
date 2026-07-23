from __future__ import annotations

import argparse

from assessment_authoring.altair_blueprints import BLUEPRINTS
from assessment_authoring.common import ROOT, materialize, validateBlueprints


TRACK = ROOT / "curricula" / "python" / "visualization" / "altair"


def main() -> int:
    parser = argparse.ArgumentParser(description="Materialize curated Altair assessment progression")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()
    validateBlueprints("altair", BLUEPRINTS)
    changed = materialize(TRACK, "altair", BLUEPRINTS, write=args.write, refresh=args.refresh)
    action = "updated" if args.write else "would update"
    print(f"{action}: {len(changed)} Altair lesson(s)")
    for path in changed:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
