from __future__ import annotations

import importlib.util
import os
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[2]
RUNNER = ROOT / "tests" / "surface" / "verifyProductExperiencePlaywright.py"


def main() -> int:
    os.environ["CODARO_PRODUCT_CASE"] = "local-automation-desktop"
    os.environ["CODARO_PRODUCT_GATE"] = "automation-proof-states-browser"
    os.environ["CODARO_PRODUCT_REPORT_PATH"] = (
        "output/test-runner/automation-ide-audit/automation-proof-states-browser.json"
    )
    spec = importlib.util.spec_from_file_location("codaroAutomationProofStatesPlaywright", RUNNER)
    if spec is None or spec.loader is None:
        raise RuntimeError("Automation proof state Playwright runner could not be loaded")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return int(module.main())


if __name__ == "__main__":
    raise SystemExit(main())
