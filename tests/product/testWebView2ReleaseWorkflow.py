from __future__ import annotations

import ast
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[2]
WORKFLOW_PATH = ROOT / ".github" / "workflows" / "release-quality.yml"
RUNNER_PATH = ROOT / "tests" / "run.py"


def testReleaseQualityUsesHostedSupportedWindowsRunner() -> None:
    workflow = WORKFLOW_PATH.read_text(encoding="utf-8")

    assert "runs-on: windows-2025" in workflow
    assert "tests/run.py product-release" in workflow
    assert "tests/product/webview2-runtime.lock.json" in workflow


def testProductReleaseSequenceContainsFixedWebView2Blocker() -> None:
    module = ast.parse(RUNNER_PATH.read_text(encoding="utf-8"))
    sequence: tuple[str, ...] | None = None
    for node in module.body:
        if not isinstance(node, ast.Assign):
            continue
        if not any(
            isinstance(target, ast.Name) and target.id == "PRODUCT_RELEASE_GATES"
            for target in node.targets
        ):
            continue
        value = ast.literal_eval(node.value)
        if isinstance(value, tuple):
            sequence = value
    assert sequence is not None
    assert "product-browser-webview2-fixed" in sequence
    assert sequence.index("launcher-test") < sequence.index("product-browser-webview2-fixed")


def testFixedGateCannotFallBackToEvergreen() -> None:
    wrapper = (ROOT / "tests" / "product" / "verifyWebView2FixedProduct.py").read_text(
        encoding="utf-8"
    )

    assert re.search(r'CODARO_WEBVIEW2_RUNTIME_MODE"\]\s*=\s*"fixed"', wrapper)
    assert re.search(r'CODARO_WEBVIEW2_REQUIRE_SUPPORTED_WINDOWS"\]\s*=\s*"1"', wrapper)
