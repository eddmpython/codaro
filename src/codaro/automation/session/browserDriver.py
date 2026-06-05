from __future__ import annotations

import logging
from typing import Any, Awaitable, Callable

logger = logging.getLogger(__name__)


class BrowserDriverError(RuntimeError):
    """브라우저 driver 생성/조작 실패 (playwright 미설치 포함)."""


class BrowserDriver:
    """라이브 Playwright browser/context/page 묶음. step 사이에서 살아있다."""

    def __init__(self, playwright: Any, browser: Any, context: Any, page: Any) -> None:
        self._playwright = playwright
        self._browser = browser
        self._context = context
        self.page = page

    async def close(self) -> None:
        await self._browser.close()
        await self._playwright.stop()


async def createBrowserDriver(options: dict[str, Any]) -> BrowserDriver:
    """worker 루프에서 호출되어 라이브 브라우저를 1회 생성한다. playwright 는 lazy import."""
    try:
        from playwright.async_api import async_playwright
    except ImportError as exc:
        raise BrowserDriverError(
            "playwright 가 설치되어 있지 않습니다. 브라우저 세션을 쓰려면 "
            "playwright 설치 + 'playwright install chromium' 이 필요합니다."
        ) from exc

    browserType = str(options.get("browserType", "chromium"))
    headless = bool(options.get("headless", False))
    playwright = await async_playwright().start()
    launcher = getattr(playwright, browserType, None)
    if launcher is None:
        await playwright.stop()
        raise BrowserDriverError(f"지원하지 않는 browserType: {browserType}")
    browser = await launcher.launch(headless=headless)
    context = await browser.new_context(accept_downloads=True)
    page = await context.new_page()
    startUrl = options.get("startUrl")
    if startUrl:
        await page.goto(str(startUrl))
    return BrowserDriver(playwright, browser, context, page)


async def browserState(driver: BrowserDriver) -> dict[str, Any]:
    """라이브 브라우저의 현재 상태 스냅샷(읽기 전용)."""
    return {"url": driver.page.url, "title": await driver.page.title()}


def buildBrowserStep(action: str, params: dict[str, Any]) -> Callable[[BrowserDriver], Awaitable[dict[str, Any]]]:
    """action 이름을 라이브 page 에 대한 1개 step 코루틴으로 변환한다."""

    async def step(driver: BrowserDriver) -> dict[str, Any]:
        page = driver.page
        if action == "navigate":
            await page.goto(str(params["url"]))
        elif action == "click":
            await page.click(str(params["selector"]))
        elif action == "type":
            await page.fill(str(params["selector"]), str(params.get("text", "")))
        elif action == "press":
            await page.keyboard.press(str(params["keys"]))
        elif action == "waitFor":
            await page.wait_for_selector(str(params["selector"]), timeout=float(params.get("timeoutMs", 10000)))
        elif action == "extractText":
            text = await page.text_content(str(params["selector"]))
            state = await browserState(driver)
            return {**state, "text": text}
        elif action == "state":
            return await browserState(driver)
        else:
            raise BrowserDriverError(f"지원하지 않는 action: {action}")
        return await browserState(driver)

    return step
