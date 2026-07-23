from __future__ import annotations

import argparse

from assessment_authoring.common import ROOT, materialize, validateBlueprints
from assessment_authoring.playwright_blueprints import BLUEPRINTS


TRACK = ROOT / "curricula" / "python" / "automation" / "browser" / "playwright"


def main() -> int:
    parser = argparse.ArgumentParser(description="Materialize curated Playwright assessment progression")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()
    validateBlueprints("playwright", BLUEPRINTS)
    changed = materialize(TRACK, "playwright", BLUEPRINTS, write=args.write, refresh=args.refresh)
    action = "updated" if args.write else "would update"
    print(f"{action}: {len(changed)} Playwright lesson(s)")
    for path in changed:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
