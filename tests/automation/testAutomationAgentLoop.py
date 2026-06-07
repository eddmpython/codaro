"""에이전트 라인(브라우저유즈/컴퓨터유즈) 회귀 — 실 브라우저/OS/LLM 없이 결정론 검증.

진짜 SessionRegistry 에 stub driver 를 주입하고 ScriptedPolicy/stub provider 로 고정해
observe→decide→act→verify 루프 + SafetyGate + AgentRunRegistry(confirm/cancel) 를 단언한다.
"""

import asyncio

import pytest

from codaro.ai.agentFlow import (
    BROWSER_VERB_CATALOG,
    LlmAgentPolicy,
    getAgentRunRegistry,
    parseAgentAction,
    resetAgentRunRegistry,
)
from codaro.automation.agent import (
    AgentAction,
    AgentLoop,
    AgentOutcome,
    ExecMode,
    LoopLimits,
    SafetyGate,
    SafetyPolicy,
    ScriptedPolicy,
    act,
    done,
)
from codaro.automation.eStop import getEmergencyStop
from codaro.automation.session import (
    SessionDefinition,
    SessionKind,
    getSessionRegistry,
    resetSessionRegistry,
)
from codaro.automation.session.desktopDriver import DesktopDriver


# ── stub browser driver ──────────────────────────────────────────────
def _el(index, name, selector):
    return {"index": index, "role": "button", "name": name, "selector": selector, "interactive": True}


def _frame(url, title, elements):
    return {
        "kind": "browser", "url": url, "title": title,
        "progressKey": f"{url}|{title}|{len(elements)}",
        "elements": elements, "textDigest": "", "screenshotRef": None,
    }


class FakeAgentBrowser:
    def __init__(self, frames, *, estopAtCall=None):
        self.frames = frames
        self.idx = 0
        self.sideEffects = []
        self.lastEls = {}
        self._calls = 0
        self._estopAtCall = estopAtCall

    def _frame(self):
        return self.frames[min(self.idx, len(self.frames) - 1)]

    def execute(self, action, params):
        self._calls += 1
        if self._estopAtCall is not None and self._calls == self._estopAtCall:
            getEmergencyStop().trigger("fake estop")
        if action in ("observe", "snapshot"):
            frame = self._frame()
            self.lastEls = {e["index"]: e["selector"] for e in frame["elements"]}
            return dict(frame)
        if action in ("clickIndex", "typeIndex", "navigate"):
            if action != "navigate" and int(params["index"]) not in self.lastEls:
                raise RuntimeError("stale index")
            self.sideEffects.append((action, dict(params)))
            if action in ("clickIndex", "navigate"):
                self.idx += 1
            frame = self._frame()
            return {"url": frame["url"], "title": frame["title"]}
        raise RuntimeError(f"unsupported {action}")

    async def close(self):
        pass


def fakeStepBuilder(action, params):
    async def step(driver):
        return driver.execute(action, params)
    return step


async def fakeState(driver):
    return {"kind": "browser"}


async def _ready(driver):
    return driver


def _loginFrames():
    return [
        _frame("https://app/login", "Login", [_el(0, "Email", "#e"), _el(1, "Go", "#go")]),
        _frame("https://app/home", "Home", [_el(0, "Home", "#h")]),
    ]


@pytest.fixture(autouse=True)
def cleanState():
    getEmergencyStop().clear()
    resetSessionRegistry()
    resetAgentRunRegistry()
    yield
    getEmergencyStop().clear()
    resetSessionRegistry()
    resetAgentRunRegistry()


async def _openBrowser(driver):
    registry = getSessionRegistry()
    definition = SessionDefinition(name="t", kind=SessionKind.BROWSER)
    await registry.open(definition, driverFactory=lambda: _ready(driver), stepBuilder=fakeStepBuilder, stateFn=fakeState)
    return definition.id


def _autonomous():
    return SafetyGate(SafetyPolicy(mode=ExecMode.AUTONOMOUS))


# ── AgentLoop core ───────────────────────────────────────────────────
def testAgentLoopHappyPath():
    driver = FakeAgentBrowser(_loginFrames())
    policy = ScriptedPolicy([
        act("typeIndex", {"index": 0, "text": "x"}),
        act("clickIndex", {"index": 1}, label="Go"),
        done(),
    ])

    async def scenario():
        sessionId = await _openBrowser(driver)
        loop = AgentLoop(getSessionRegistry(), _autonomous(), source="agent:browserUse")
        result = await loop.run(sessionId, "로그인", policy)
        await getSessionRegistry().close(sessionId)
        return result

    result = asyncio.run(scenario())
    assert result.outcome is AgentOutcome.DONE
    assert [v for v, _ in driver.sideEffects] == ["typeIndex", "clickIndex"]


def testAgentLoopDryRunZeroSideEffects():
    driver = FakeAgentBrowser(_loginFrames())
    gate = SafetyGate(SafetyPolicy(mode=ExecMode.DRY_RUN))
    policy = ScriptedPolicy([act("clickIndex", {"index": 1}, label="삭제"), done()])

    async def scenario():
        sessionId = await _openBrowser(driver)
        loop = AgentLoop(getSessionRegistry(), gate)
        result = await loop.run(sessionId, "g", policy)
        await getSessionRegistry().close(sessionId)
        return result

    result = asyncio.run(scenario())
    assert result.outcome is AgentOutcome.DONE
    assert driver.sideEffects == []  # 부작용 verb 가 runStep 에 안 갔다


def testAgentLoopEstopHalts():
    driver = FakeAgentBrowser(_loginFrames(), estopAtCall=2)  # 첫 act 중 E-Stop
    policy = ScriptedPolicy([act("clickIndex", {"index": 1}) for _ in range(6)])

    async def scenario():
        sessionId = await _openBrowser(driver)
        loop = AgentLoop(getSessionRegistry(), _autonomous())
        result = await loop.run(sessionId, "g", policy)
        return result

    result = asyncio.run(scenario())
    assert result.outcome is AgentOutcome.ESTOP
    assert len(driver.sideEffects) <= 1


def testAgentLoopLoopGuards():
    frames = [_frame(f"https://x/{i}", f"P{i}", [_el(0, "b", "#b")]) for i in range(6)]
    driver = FakeAgentBrowser(frames)
    policy = ScriptedPolicy([act("clickIndex", {"index": 0}) for _ in range(6)])  # 동일 액션 반복

    async def scenario():
        sessionId = await _openBrowser(driver)
        loop = AgentLoop(getSessionRegistry(), _autonomous(), limits=LoopLimits(repeatActionLimit=3))
        return await loop.run(sessionId, "g", policy)

    result = asyncio.run(scenario())
    assert result.outcome is AgentOutcome.LOOP_GUARD


def testAgentLoopMaxConsecutiveFailures():
    # 모든 act 가 stale index → FAILED 연속 → ERROR
    driver = FakeAgentBrowser([_frame("https://x", "T", [_el(0, "b", "#b")])])
    policy = ScriptedPolicy([act("clickIndex", {"index": 99}) for _ in range(6)])

    async def scenario():
        sessionId = await _openBrowser(driver)
        loop = AgentLoop(getSessionRegistry(), _autonomous(), limits=LoopLimits(maxConsecutiveFailures=2))
        return await loop.run(sessionId, "g", policy)

    result = asyncio.run(scenario())
    assert result.outcome is AgentOutcome.ERROR


# ── SafetyGate ───────────────────────────────────────────────────────
def testSafetyGateClassification():
    gate = SafetyGate(SafetyPolicy(mode=ExecMode.AUTONOMOUS))
    from codaro.automation.agent import GateVerdict, RiskTier
    assert gate.classify(AgentAction("clickIndex", {"index": 0}, targetLabel="결제")) is RiskTier.CRITICAL
    assert gate.evaluate(AgentAction("clickIndex", {"index": 0}, targetLabel="결제")).verdict is GateVerdict.BLOCKED
    assert gate.evaluate(AgentAction("clickIndex", {"index": 0})).verdict is GateVerdict.ALLOW


# ── LlmAgentPolicy (stub provider) ───────────────────────────────────
def testParseAgentActionRobust():
    assert parseAgentAction('{"decision":"done"}').decision.value == "done"
    assert parseAgentAction("not json") is None
    fenced = parseAgentAction('```json\n{"decision":"act","verb":"navigate","params":{"url":"https://x"}}\n```')
    assert fenced.action.verb == "navigate"


def testLlmAgentPolicyDrivesLoop():
    driver = FakeAgentBrowser(_loginFrames())
    responses = iter([
        '{"decision":"act","verb":"typeIndex","params":{"index":0,"text":"x"}}',
        '{"decision":"act","verb":"clickIndex","params":{"index":1}}',
        '{"decision":"done"}',
    ])
    policy = LlmAgentPolicy(BROWSER_VERB_CATALOG, complete=lambda prompt: next(responses))

    async def scenario():
        sessionId = await _openBrowser(driver)
        loop = AgentLoop(getSessionRegistry(), _autonomous())
        result = await loop.run(sessionId, "로그인", policy)
        await getSessionRegistry().close(sessionId)
        return result

    result = asyncio.run(scenario())
    assert result.outcome is AgentOutcome.DONE
    assert [v for v, _ in driver.sideEffects] == ["typeIndex", "clickIndex"]


# ── AgentRunRegistry orchestration ───────────────────────────────────
def testAgentRunRegistryConfirmFlow():
    driver = FakeAgentBrowser(_loginFrames())
    policy = ScriptedPolicy([act("clickIndex", {"index": 1}, label="Go"), done()])

    async def scenario():
        runRegistry = getAgentRunRegistry()
        run = await runRegistry.start(
            "browserUse", "로그인",
            policy=policy,
            gate=SafetyGate(SafetyPolicy(mode=ExecMode.STEP_APPROVAL)),
            sessionInjection={"driverFactory": lambda: _ready(driver), "stepBuilder": fakeStepBuilder, "stateFn": fakeState},
        )
        for _ in range(300):
            if run.status == "awaiting-confirm":
                break
            await asyncio.sleep(0.01)
        assert run.status == "awaiting-confirm", run.status
        assert run.pendingAction.verb == "clickIndex"
        assert driver.sideEffects == []  # 승인 전엔 실행 안 됨
        runRegistry.confirm(run.runId, True)
        await run.task
        return run, driver

    run, driver = asyncio.run(scenario())
    assert run.status == "done"
    assert [v for v, _ in driver.sideEffects] == ["clickIndex"]  # 승인 후 1회 실행


def testAgentRunRegistryCancel():
    frames = [_frame(f"https://x/{i}", f"P{i}", [_el(0, "b", "#b")]) for i in range(50)]
    driver = FakeAgentBrowser(frames)
    policy = ScriptedPolicy([act("clickIndex", {"index": 0}) for _ in range(50)])

    async def scenario():
        runRegistry = getAgentRunRegistry()
        run = await runRegistry.start(
            "browserUse", "g",
            policy=policy,
            gate=SafetyGate(SafetyPolicy(mode=ExecMode.AUTONOMOUS, maxActionsPerSecond=1000)),
            sessionInjection={"driverFactory": lambda: _ready(driver), "stepBuilder": fakeStepBuilder, "stateFn": fakeState},
        )
        await asyncio.sleep(0.05)
        runRegistry.cancel(run.runId)
        try:
            await run.task
        except asyncio.CancelledError:
            pass
        return run

    run = asyncio.run(scenario())
    assert run.status == "stopped"


# ── desktop detect grounding (fake capture + OCR) ────────────────────
class _FakeFrame:
    width = 1920
    height = 1080
    data = b"x"


class _FakeRegion:
    def __init__(self, x, y, w, h, text, conf):
        self.x = x; self.y = y; self.width = w; self.height = h; self.text = text; self.confidence = conf


class _FakeOcr:
    def readText(self, frame):
        return [_FakeRegion(100, 200, 80, 20, "저장", 0.9), _FakeRegion(300, 400, 60, 24, "취소", 0.8)]


class _FakeCapture:
    def grab(self, region=None):
        return _FakeFrame()

    def dispose(self):
        pass


def testDesktopDetectGrounding():
    driver = DesktopDriver(_FakeCapture(), inputGuard=None)
    driver._ocr = _FakeOcr()
    driver._ocrBackend = "paddle"
    obs = driver.detect(None, None, "paddle")
    assert obs["kind"] == "desktop"
    assert obs["screen"] == {"width": 1920, "height": 1080}
    assert [e["index"] for e in obs["elements"]] == [0, 1]
    assert obs["elements"][0]["centerX"] == 140 and obs["elements"][0]["centerY"] == 210
    assert obs["elements"][0]["text"] == "저장"
    assert obs["screenshotRef"] is None
