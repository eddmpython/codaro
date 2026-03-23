from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Awaitable

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class Transition:
    fromState: str
    toState: str
    condition: str | None = None
    action: str | None = None
    actionParams: dict[str, Any] = field(default_factory=dict)

    def serialize(self) -> dict[str, Any]:
        return {
            "from": self.fromState,
            "to": self.toState,
            "condition": self.condition,
            "action": self.action,
        }


@dataclass(slots=True)
class StateNode:
    name: str
    onEnter: str | None = None
    onEnterParams: dict[str, Any] = field(default_factory=dict)
    onExit: str | None = None
    onExitParams: dict[str, Any] = field(default_factory=dict)
    isFinal: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)

    def serialize(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "onEnter": self.onEnter,
            "onExit": self.onExit,
            "isFinal": self.isFinal,
        }


ConditionChecker = Callable[[str, dict[str, Any]], Awaitable[bool]]
ActionExecutor = Callable[[str, dict[str, Any]], Awaitable[dict[str, Any]]]


class StateMachine:

    def __init__(
        self,
        actionExecutor: ActionExecutor | None = None,
        conditionChecker: ConditionChecker | None = None,
    ) -> None:
        self._id = f"sm-{uuid.uuid4().hex[:10]}"
        self._states: dict[str, StateNode] = {}
        self._transitions: list[Transition] = []
        self._currentState: str | None = None
        self._initialState: str | None = None
        self._history: list[str] = []
        self._actionExecutor = actionExecutor
        self._conditionChecker = conditionChecker

    @property
    def id(self) -> str:
        return self._id

    @property
    def currentState(self) -> str | None:
        return self._currentState

    @property
    def history(self) -> list[str]:
        return list(self._history)

    @property
    def isFinished(self) -> bool:
        if self._currentState is None:
            return False
        node = self._states.get(self._currentState)
        return node.isFinal if node else False

    def addState(self, node: StateNode) -> None:
        self._states[node.name] = node
        if self._initialState is None:
            self._initialState = node.name

    def addTransition(self, transition: Transition) -> None:
        self._transitions.append(transition)

    def setInitialState(self, name: str) -> None:
        if name not in self._states:
            raise ValueError(f"State not found: {name}")
        self._initialState = name

    async def start(self) -> str | None:
        if self._initialState is None:
            raise RuntimeError("No initial state defined")
        self._currentState = self._initialState
        self._history = [self._initialState]

        node = self._states[self._initialState]
        if node.onEnter and self._actionExecutor:
            await self._actionExecutor(node.onEnter, node.onEnterParams)

        return self._currentState

    async def step(self) -> str | None:
        if self._currentState is None:
            raise RuntimeError("State machine not started")
        if self.isFinished:
            return self._currentState

        currentNode = self._states[self._currentState]
        candidates = [t for t in self._transitions if t.fromState == self._currentState]

        for transition in candidates:
            if transition.condition and self._conditionChecker:
                satisfied = await self._conditionChecker(transition.condition, {})
                if not satisfied:
                    continue
            elif transition.condition:
                continue

            if currentNode.onExit and self._actionExecutor:
                await self._actionExecutor(currentNode.onExit, currentNode.onExitParams)

            if transition.action and self._actionExecutor:
                await self._actionExecutor(transition.action, transition.actionParams)

            self._currentState = transition.toState
            self._history.append(transition.toState)

            nextNode = self._states.get(transition.toState)
            if nextNode and nextNode.onEnter and self._actionExecutor:
                await self._actionExecutor(nextNode.onEnter, nextNode.onEnterParams)

            return self._currentState

        return self._currentState

    async def runUntilFinished(self, maxSteps: int = 100) -> str | None:
        if self._currentState is None:
            await self.start()

        for _ in range(maxSteps):
            if self.isFinished:
                break
            prev = self._currentState
            await self.step()
            if self._currentState == prev:
                break

        return self._currentState

    def reset(self) -> None:
        self._currentState = None
        self._history.clear()

    def serialize(self) -> dict[str, Any]:
        return {
            "id": self._id,
            "currentState": self._currentState,
            "isFinished": self.isFinished,
            "states": [s.serialize() for s in self._states.values()],
            "transitions": [t.serialize() for t in self._transitions],
            "history": self._history,
        }
