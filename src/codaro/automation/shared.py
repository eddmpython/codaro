from __future__ import annotations

from typing import Any

_inputGuard = None
_recorder = None
_messageBridge = None


def getSharedInputGuard():
    global _inputGuard
    if _inputGuard is None:
        from .input.pyautoguiController import PyAutoGuiController
        from .input.inputGuard import InputGuard
        _inputGuard = InputGuard(PyAutoGuiController())
    return _inputGuard


def getSharedRecorder():
    global _recorder
    if _recorder is None:
        from .recorder.actionRecorder import ActionRecorder
        _recorder = ActionRecorder()
    return _recorder


def getSharedMessageBridge():
    global _messageBridge
    if _messageBridge is None:
        from .integrations.messageBridge import MessageBridge
        _messageBridge = MessageBridge()
    return _messageBridge
