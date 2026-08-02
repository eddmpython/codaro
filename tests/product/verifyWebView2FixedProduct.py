from __future__ import annotations

import os


os.environ["CODARO_WEBVIEW2_GATE_ID"] = "product-browser-webview2-fixed"
os.environ["CODARO_WEBVIEW2_RUNTIME_MODE"] = "fixed"
os.environ["CODARO_WEBVIEW2_REQUIRE_SUPPORTED_WINDOWS"] = "1"

from verifyWebView2ProductSmoke import main  # noqa: E402


if __name__ == "__main__":
    raise SystemExit(main())
