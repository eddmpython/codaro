from __future__ import annotations

import argparse

from assessment_authoring.common import ROOT, materialize, validateBlueprints
from assessment_authoring.office_bridge_blueprints import EXCEL_BLUEPRINTS, PRACTICAL_BLUEPRINTS


def main() -> int:
    parser = argparse.ArgumentParser(description="Materialize curated Excel bridge and Office practical assessments")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()
    groups = [
        ("excel", ROOT / "curricula" / "python" / "automation" / "office" / "excel", EXCEL_BLUEPRINTS),
        ("office-practical", ROOT / "curricula" / "python" / "automation" / "office" / "practical", PRACTICAL_BLUEPRINTS),
    ]
    changed: list[str] = []
    for namespace, track, blueprints in groups:
        validateBlueprints(namespace, blueprints)
        changed.extend(materialize(track, namespace, blueprints, write=args.write, refresh=args.refresh))
    action = "updated" if args.write else "would update"
    print(f"{action}: {len(changed)} Office bridge lesson(s)")
    for path in changed:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
