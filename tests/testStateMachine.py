from __future__ import annotations

import asyncio

import pytest

from codaro.automation.loop.stateMachine import StateMachine, StateNode, Transition


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def _makeSm():
    actions: list[tuple[str, dict]] = []
    conditions: dict[str, bool] = {}

    async def actionExecutor(action, params):
        actions.append((action, params))
        return {"ok": True}

    async def conditionChecker(condition, params):
        return conditions.get(condition, False)

    sm = StateMachine(actionExecutor=actionExecutor, conditionChecker=conditionChecker)
    return sm, actions, conditions


def testStateNodeSerialize() -> None:
    node = StateNode(name="idle", onEnter="setup", isFinal=False)
    data = node.serialize()
    assert data["name"] == "idle"
    assert data["onEnter"] == "setup"
    assert data["isFinal"] is False


def testTransitionSerialize() -> None:
    t = Transition(fromState="a", toState="b", condition="ready")
    data = t.serialize()
    assert data["from"] == "a"
    assert data["to"] == "b"
    assert data["condition"] == "ready"


def testSimpleTransition() -> None:
    sm, actions, _ = _makeSm()
    sm.addState(StateNode(name="start"))
    sm.addState(StateNode(name="end", isFinal=True))
    sm.addTransition(Transition(fromState="start", toState="end"))

    _run(sm.start())
    assert sm.currentState == "start"

    _run(sm.step())
    assert sm.currentState == "end"
    assert sm.isFinished


def testConditionalTransition() -> None:
    sm, _, conditions = _makeSm()
    sm.addState(StateNode(name="waiting"))
    sm.addState(StateNode(name="done", isFinal=True))
    sm.addTransition(Transition(fromState="waiting", toState="done", condition="ready"))

    _run(sm.start())

    _run(sm.step())
    assert sm.currentState == "waiting"

    conditions["ready"] = True
    _run(sm.step())
    assert sm.currentState == "done"


def testOnEnterOnExit() -> None:
    sm, actions, _ = _makeSm()
    sm.addState(StateNode(name="a", onExit="exitA"))
    sm.addState(StateNode(name="b", onEnter="enterB", isFinal=True))
    sm.addTransition(Transition(fromState="a", toState="b"))

    _run(sm.start())
    _run(sm.step())

    actionNames = [a[0] for a in actions]
    assert "exitA" in actionNames
    assert "enterB" in actionNames


def testTransitionAction() -> None:
    sm, actions, _ = _makeSm()
    sm.addState(StateNode(name="a"))
    sm.addState(StateNode(name="b", isFinal=True))
    sm.addTransition(Transition(fromState="a", toState="b", action="doTransition"))

    _run(sm.start())
    _run(sm.step())
    assert any(a[0] == "doTransition" for a in actions)


def testRunUntilFinished() -> None:
    sm, _, _ = _makeSm()
    sm.addState(StateNode(name="s1"))
    sm.addState(StateNode(name="s2"))
    sm.addState(StateNode(name="s3", isFinal=True))
    sm.addTransition(Transition(fromState="s1", toState="s2"))
    sm.addTransition(Transition(fromState="s2", toState="s3"))

    result = _run(sm.runUntilFinished())
    assert result == "s3"
    assert sm.isFinished
    assert sm.history == ["s1", "s2", "s3"]


def testNoInitialStateRaises() -> None:
    sm, _, _ = _makeSm()
    with pytest.raises(RuntimeError):
        _run(sm.start())


def testStepBeforeStartRaises() -> None:
    sm, _, _ = _makeSm()
    sm.addState(StateNode(name="a"))
    with pytest.raises(RuntimeError):
        _run(sm.step())


def testReset() -> None:
    sm, _, _ = _makeSm()
    sm.addState(StateNode(name="a"))
    sm.addState(StateNode(name="b", isFinal=True))
    sm.addTransition(Transition(fromState="a", toState="b"))

    _run(sm.runUntilFinished())
    sm.reset()
    assert sm.currentState is None
    assert sm.history == []


def testSetInitialState() -> None:
    sm, _, _ = _makeSm()
    sm.addState(StateNode(name="a"))
    sm.addState(StateNode(name="b", isFinal=True))
    sm.setInitialState("b")

    _run(sm.start())
    assert sm.currentState == "b"
    assert sm.isFinished


def testSetInitialStateInvalid() -> None:
    sm, _, _ = _makeSm()
    with pytest.raises(ValueError):
        sm.setInitialState("nonexistent")


def testSerialize() -> None:
    sm, _, _ = _makeSm()
    sm.addState(StateNode(name="a"))
    sm.addState(StateNode(name="b", isFinal=True))
    sm.addTransition(Transition(fromState="a", toState="b"))

    _run(sm.start())
    data = sm.serialize()
    assert "id" in data
    assert data["currentState"] == "a"
    assert len(data["states"]) == 2
    assert len(data["transitions"]) == 1
