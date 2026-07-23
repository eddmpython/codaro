from __future__ import annotations

import argparse

from assessment_authoring.common import ROOT, materialize, validateBlueprints
from assessment_authoring.deep_vision_blueprints import BLUEPRINTS as DEEP_VISION
from assessment_authoring.opencv_blueprints import BLUEPRINTS as OPENCV
from assessment_authoring.pillow_blueprints import BLUEPRINTS as PILLOW
from assessment_authoring.vision_apps_blueprints import BLUEPRINTS as VISION_APPS
from assessment_authoring.vision_basics_blueprints import BLUEPRINTS as VISION_BASICS
from assessment_authoring.vision_features_blueprints import BLUEPRINTS as VISION_FEATURES


TRACKS = (
    ("opencv", "opencv", OPENCV),
    ("pillow", "pillow", PILLOW),
    ("vision-basics", "visionBasics", VISION_BASICS),
    ("vision-features", "visionFeatures", VISION_FEATURES),
    ("deep-vision", "deepVision", DEEP_VISION),
    ("vision-apps", "visionApps", VISION_APPS),
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Materialize curated image and vision assessment progressions")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()
    changed: list[str] = []
    for namespace, directory, blueprints in TRACKS:
        validateBlueprints(namespace, blueprints)
        track = ROOT / "curricula" / "python" / "imageVision" / directory
        changed.extend(materialize(track, namespace, blueprints, write=args.write, refresh=args.refresh))
    action = "updated" if args.write else "would update"
    print(f"{action}: {len(changed)} image/vision lesson(s)")
    for path in changed:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
