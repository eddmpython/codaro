from __future__ import annotations

import logging
from typing import Any, Awaitable, Callable

logger = logging.getLogger(__name__)


class DesktopDriverError(RuntimeError):
    """OS 자동화 driver 생성/조작 실패 (capture/입력/OCR 의존성 미설치 포함)."""


def _region(params: dict[str, Any]) -> Any:
    regionArg = params.get("region")
    if not regionArg:
        return None
    from ..vision.capture import Region

    return Region(
        x=int(regionArg["x"]),
        y=int(regionArg["y"]),
        width=int(regionArg["width"]),
        height=int(regionArg["height"]),
    )


class DesktopDriver:
    """라이브 OS 자동화 객체 — resident 화면 capture + (lazy) resident OCR 엔진 + 공유 input guard.

    기존 자동화 핸들러는 매 호출 createCapture/dispose 하고 OCR 모델을 재로딩한다. DESKTOP 세션은
    이 비용 큰 객체를 step 사이 상주시켜 연속 OS 자동화를 빠르게 한다. 입력은 공유 InputGuard 를
    통해 rate-limit·region·E-Stop 가드를 받는다.
    """

    def __init__(self, capture: Any, inputGuard: Any) -> None:
        self._capture = capture
        self._guard = inputGuard
        self._ocr: Any = None
        self._ocrBackend: str | None = None

    def _ocrEngine(self, backend: str) -> Any:
        if self._ocr is not None and self._ocrBackend == backend:
            return self._ocr
        self._disposeOcr()
        if backend == "easyocr":
            from ..vision.easyOcr import EasyOcrEngine

            self._ocr = EasyOcrEngine()
        else:
            from ..vision.paddleOcr import PaddleOcrEngine

            self._ocr = PaddleOcrEngine()
        self._ocrBackend = backend
        return self._ocr

    def capture(self, region: Any) -> dict[str, Any]:
        frame = self._capture.grab(region=region)
        return {"width": frame.width, "height": frame.height, "empty": not frame.data}

    def readText(self, region: Any, backend: str) -> dict[str, Any]:
        frame = self._capture.grab(region=region)
        regions = self._ocrEngine(backend).readText(frame)
        return {
            "fullText": " ".join(r.text for r in regions),
            "regionCount": len(regions),
        }

    def click(self, x: int, y: int, button: str, clicks: int) -> dict[str, Any]:
        self._guard.click(x, y, button=button, clicks=clicks)
        return {"clicked": True, "x": x, "y": y, "button": button}

    def typeText(self, text: str, interval: float) -> dict[str, Any]:
        self._guard.typeText(text, interval=interval)
        return {"typed": True, "length": len(text)}

    def hotkey(self, keys: Any) -> dict[str, Any]:
        keyList = keys if isinstance(keys, list) else [str(keys)]
        self._guard.hotkey(*keyList)
        return {"pressed": True, "keys": keyList}

    def _disposeOcr(self) -> None:
        if self._ocr is None:
            return
        try:
            self._ocr.dispose()
        except Exception as exc:  # noqa: BLE001 — OCR teardown best-effort
            logger.warning("desktop OCR dispose 실패: %s", exc)
        self._ocr = None
        self._ocrBackend = None

    async def close(self) -> None:
        try:
            self._capture.dispose()
        except Exception as exc:  # noqa: BLE001 — capture teardown best-effort
            logger.warning("desktop capture dispose 실패: %s", exc)
        self._disposeOcr()


async def createDesktopDriver(options: dict[str, Any]) -> DesktopDriver:
    """worker 루프에서 호출되어 resident capture + 공유 input guard 를 묶는다. 의존성은 lazy import."""
    try:
        from ..shared import getSharedInputGuard
        from ..vision.captureFactory import createCapture
    except ImportError as exc:
        raise DesktopDriverError(
            "OS 자동화 의존성이 없습니다. 화면 capture/입력 자동화 패키지 설치가 필요합니다."
        ) from exc
    try:
        capture = createCapture()
    except Exception as exc:  # noqa: BLE001 — capture backend init boundary (dxcam/mss optional)
        raise DesktopDriverError(f"화면 capture 백엔드 생성 실패: {exc}") from exc
    return DesktopDriver(capture, getSharedInputGuard())


async def desktopState(driver: DesktopDriver) -> dict[str, Any]:
    return {"kind": "desktop", "ready": True}


def buildDesktopStep(action: str, params: dict[str, Any]) -> Callable[[DesktopDriver], Awaitable[dict[str, Any]]]:
    """action 이름을 라이브 OS 자동화 객체에 대한 1개 step 코루틴으로 변환한다.

    입력 action(click/type/press)은 InputGuard 내부 E-Stop/rate 가드를 통과한다.
    """

    async def step(driver: DesktopDriver) -> dict[str, Any]:
        from codaro.automation.audit import getAuditTrail

        if action == "capture":
            return driver.capture(_region(params))
        if action == "readText":
            return driver.readText(_region(params), str(params.get("backend", "paddle")))
        if action == "click":
            result = driver.click(
                int(params["x"]),
                int(params["y"]),
                str(params.get("button", "left")),
                int(params.get("clicks", 1)),
            )
            getAuditTrail().record(
                "desktopClick", "session-registry", {"x": result["x"], "y": result["y"]}, success=True
            )
            return result
        if action == "type":
            return driver.typeText(str(params["text"]), float(params.get("interval", 0.02)))
        if action == "press":
            return driver.hotkey(params["keys"])
        if action == "state":
            return await desktopState(driver)
        raise DesktopDriverError(f"지원하지 않는 desktop action: {action}")

    return step
