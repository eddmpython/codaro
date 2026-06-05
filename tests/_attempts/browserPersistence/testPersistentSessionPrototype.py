"""영속 객체 런타임 프로토타입 결정론 검증 (실브라우저 없이).

핵심 증명: 별개 asyncio.run() 호출(= 별개 task/요청 경계) 너머로 같은 라이브 driver 객체가
재사용된다 → "task 완료 != 객체 소멸" 불변식. tests/run.py gate attempts 전용.
"""

import asyncio

import pytest

from persistentSession import (
    PersistentSession,
    SessionEStopActive,
    SessionError,
    SessionState,
)


class StubDriver:
    """실제 Playwright browser 자리의 결정론적 stub. 생성 횟수를 클래스 변수로 센다."""

    instances = 0

    def __init__(self) -> None:
        type(self).instances += 1
        self.steps = 0
        self.closed = False

    async def close(self) -> None:
        self.closed = True


async def makeDriver() -> StubDriver:
    return StubDriver()


async def probe(driver: StubDriver) -> int:
    driver.steps += 1
    return id(driver)


async def slowProbe(driver: StubDriver) -> int:
    await asyncio.sleep(0.3)
    return id(driver)


def testObjectSurvivesAcrossTaskBoundaries() -> None:
    StubDriver.instances = 0
    session = PersistentSession()

    asyncio.run(session.open(makeDriver))            # task 경계 1: open
    assert session.state is SessionState.LIVE

    firstId = asyncio.run(session.runStep(probe))    # task 경계 2 (별개 caller 루프)
    secondId = asyncio.run(session.runStep(probe))   # task 경계 3
    thirdId = asyncio.run(session.runStep(probe))    # task 경계 4

    # 핵심 불변식: 별개 task 경계 너머로 같은 라이브 객체
    assert firstId == secondId == thirdId
    assert StubDriver.instances == 1                 # 1회 생성, 재사용 (소멸 안 됨)
    assert session.state is SessionState.LIVE        # step 완료해도 LIVE

    asyncio.run(session.close())
    assert session.state is SessionState.CLOSED


def testTeardownOnlyOnExplicitClose() -> None:
    StubDriver.instances = 0
    session = PersistentSession()
    asyncio.run(session.open(makeDriver))
    driverIdWhileLive = session.driverId
    asyncio.run(session.runStep(probe))
    # step 후에도 driver 정체성 동일 + 살아있음
    assert session.driverId == driverIdWhileLive
    assert session.isLive
    asyncio.run(session.close())
    # close 후에만 driver 해제
    assert session.driverId is None
    assert session.state is SessionState.CLOSED


def testRunStepRejectedBeforeOpen() -> None:
    session = PersistentSession()
    with pytest.raises(SessionError):
        asyncio.run(session.runStep(probe))


def testEstopBlocksStepButKeepsHandleLive() -> None:
    tripped = {"value": False}

    def estop() -> None:
        if tripped["value"]:
            raise SessionEStopActive("emergency stop active")

    session = PersistentSession(estopCheck=estop)
    asyncio.run(session.open(makeDriver))
    beforeId = asyncio.run(session.runStep(probe))   # 정지 전 정상

    tripped["value"] = True
    with pytest.raises(SessionEStopActive):
        asyncio.run(session.runStep(probe))
    # E-Stop 은 핸들을 죽이지 않고 freeze: 여전히 LIVE
    assert session.state is SessionState.LIVE

    tripped["value"] = False
    afterId = asyncio.run(session.runStep(probe))    # 해제 후 같은 객체로 재개
    assert afterId == beforeId

    asyncio.run(session.close())


def testStepTimeoutDoesNotCloseSession() -> None:
    StubDriver.instances = 0
    session = PersistentSession()
    asyncio.run(session.open(makeDriver))
    liveId = session.driverId

    with pytest.raises(asyncio.TimeoutError):
        asyncio.run(session.runStep(slowProbe, timeoutSeconds=0.05))

    # timeout != crash: 세션은 LIVE 유지, 같은 driver 로 후속 step 가능
    assert session.state is SessionState.LIVE
    assert session.driverId == liveId
    nextId = asyncio.run(session.runStep(probe))
    assert nextId == liveId
    assert StubDriver.instances == 1

    asyncio.run(session.close())
