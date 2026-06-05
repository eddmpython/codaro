from __future__ import annotations

import pytest
from codaro.automation.eStop import EmergencyStop, EmergencyStopActive


class TestEmergencyStop:

    def test_initialState(self):
        eStop = EmergencyStop()
        assert eStop.active is False
        assert eStop.reason == ""

    def test_triggerAndClear(self):
        eStop = EmergencyStop()
        triggered = eStop.trigger("Test reason")
        assert triggered is True
        assert eStop.active is True
        assert eStop.reason == "Test reason"
        assert eStop.triggeredAt > 0

        cleared = eStop.clear()
        assert cleared is True
        assert eStop.active is False
        assert eStop.reason == ""

    def test_doubleTriggerReturnsFalse(self):
        eStop = EmergencyStop()
        eStop.trigger("First")
        result = eStop.trigger("Second")
        assert result is False
        assert eStop.reason == "First"

    def test_doubleClearReturnsFalse(self):
        eStop = EmergencyStop()
        result = eStop.clear()
        assert result is False

    def test_checkRaisesWhenActive(self):
        eStop = EmergencyStop()
        eStop.trigger("Danger")
        with pytest.raises(EmergencyStopActive, match="Danger"):
            eStop.check()

    def test_checkPassesWhenInactive(self):
        eStop = EmergencyStop()
        eStop.check()

    def test_callbackOnTrigger(self):
        reasons = []
        eStop = EmergencyStop()
        eStop.onTrigger(lambda reason: reasons.append(reason))
        eStop.trigger("Alert!")
        assert reasons == ["Alert!"]

    def test_serialize(self):
        eStop = EmergencyStop()
        data = eStop.serialize()
        assert data["active"] is False
        assert data["reason"] == ""
        assert data["triggeredAt"] is None

        eStop.trigger("Serialize test")
        data = eStop.serialize()
        assert data["active"] is True
        assert data["reason"] == "Serialize test"
        assert data["triggeredAt"] is not None

    def test_callbackExceptionDoesNotBlock(self):
        eStop = EmergencyStop()

        def badCallback(reason):
            raise ValueError("broken callback")

        eStop.onTrigger(badCallback)
        triggered = eStop.trigger("Should not crash")
        assert triggered is True
        assert eStop.active is True
