from __future__ import annotations

import importlib.util
import os
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[2]
RUNNER = ROOT / "tests" / "surface" / "verifyProductExperiencePlaywright.py"


def main() -> int:
    os.environ["CODARO_PRODUCT_CASE"] = "web-learning"
    os.environ["CODARO_PRODUCT_GATE"] = "web-learning"
    os.environ["CODARO_PRODUCT_REPORT_PATH"] = "output/test-runner/web-learning/web-learning-report.json"
    spec = importlib.util.spec_from_file_location("codaroWebLearningPlaywright", RUNNER)
    if spec is None or spec.loader is None:
        raise RuntimeError("web learning Playwright runner could not be loaded")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return int(module.main())


if __name__ == "__main__":
    raise SystemExit(main())
