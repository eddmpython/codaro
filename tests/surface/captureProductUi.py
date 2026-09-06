"""제품 시각 자산의 실제 화면을 저장소의 pyproc 공개 API로 캡처한다."""
from __future__ import annotations

import importlib.util
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("productFixtures", ROOT / "tests/surface/verifyProductExperiencePlaywright.py")
assert SPEC and SPEC.loader
FIXTURES = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(FIXTURES)


def main() -> int:
    runRoot = Path(os.environ["CODARO_CAPTURE_RUN_DIR"]).resolve()
    runRoot.mkdir(parents=True, exist_ok=True)
    buildRoot = Path(os.environ["CODARO_WEB_BUILD_ROOT"]).resolve()
    if not (buildRoot / "build-generation.json").is_file():
        raise ValueError("검증할 제품 빌드를 먼저 생성하세요")
    # 기존 합성 데이터와 서버만 재사용한다. 브라우저 실행 함수는 호출하지 않는다.
    FIXTURES.REPORT_ROOT = runRoot
    webServer, webThread, webPort = FIXTURES.startStaticServer(buildRoot)
    localServer = localThread = localState = None
    try:
        fixtureId = os.environ["CODARO_PRODUCT_CASE"]
        localPort = webPort
        if fixtureId.startswith("local-"):
            localServer, localThread, localPort, localState, _ = FIXTURES.startLocalServer()
        cases = {case["name"]: case for case in FIXTURES.browserCases(1, webPort, localPort)}
        case = cases[fixtureId]
        config = {
            "case": case,
            "theme": os.environ["CODARO_PRODUCT_COLOR_SCHEME"],
            "evidencePath": os.environ.get("CODARO_PRODUCT_EVIDENCE_PATH", ""),
            "reportPath": os.environ["CODARO_PRODUCT_REPORT_PATH"],
            "runRoot": str(runRoot),
            "auditScript": FIXTURES.AUDIT_SCRIPT,
            "gitHead": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
        }
        configPath = runRoot / "captureInput.json"
        configPath.write_text(json.dumps(config, ensure_ascii=False), encoding="utf-8")
        return subprocess.run(["node", "editor/scripts/captureProductUi.mjs", str(configPath)],
                              cwd=ROOT, check=False).returncode
    finally:
        webServer.shutdown()
        webServer.server_close()
        webThread.join(timeout=5)
        if localServer:
            localServer.should_exit = True
            localThread.join(timeout=10)
        if localState:
            localState.cleanup()


if __name__ == "__main__":
    raise SystemExit(main())
