from __future__ import annotations

from codaro.automation.voice.commandParser import CommandParser, ParsedCommand


def testParsedCommandSerialize() -> None:
    cmd = ParsedCommand(commandType="click", parameters={"target": "OK"}, rawText="click on OK")
    data = cmd.serialize()
    assert data["commandType"] == "click"
    assert data["parameters"]["target"] == "OK"
    assert data["rawText"] == "click on OK"


def testParseEmergencyStop() -> None:
    parser = CommandParser()
    cmd = parser.parse("emergency stop")
    assert cmd is not None
    assert cmd.commandType == "emergency-stop"


def testParseStop() -> None:
    parser = CommandParser()
    cmd = parser.parse("stop")
    assert cmd is not None
    assert cmd.commandType == "emergency-stop"


def testParsePause() -> None:
    parser = CommandParser()
    cmd = parser.parse("pause")
    assert cmd is not None
    assert cmd.commandType == "pause"


def testParseResume() -> None:
    parser = CommandParser()
    cmd = parser.parse("resume")
    assert cmd is not None
    assert cmd.commandType == "resume"


def testParseClickOn() -> None:
    parser = CommandParser()
    cmd = parser.parse("click on Submit button")
    assert cmd is not None
    assert cmd.commandType == "click"
    assert cmd.parameters["target"] == "Submit button"


def testParseType() -> None:
    parser = CommandParser()
    cmd = parser.parse("type hello world")
    assert cmd is not None
    assert cmd.commandType == "type"
    assert cmd.parameters["text"] == "hello world"


def testParseScrollDown() -> None:
    parser = CommandParser()
    cmd = parser.parse("scroll down 5")
    assert cmd is not None
    assert cmd.commandType == "scroll"
    assert cmd.parameters["direction"] == "down"
    assert cmd.parameters["amount"] == "5"


def testParseScrollUp() -> None:
    parser = CommandParser()
    cmd = parser.parse("scroll up")
    assert cmd is not None
    assert cmd.commandType == "scroll"
    assert cmd.parameters["direction"] == "up"


def testParseSave() -> None:
    parser = CommandParser()
    cmd = parser.parse("save")
    assert cmd.commandType == "save"


def testParseCopy() -> None:
    parser = CommandParser()
    cmd = parser.parse("copy")
    assert cmd.commandType == "copy"


def testParsePaste() -> None:
    parser = CommandParser()
    cmd = parser.parse("paste")
    assert cmd.commandType == "paste"


def testParseSelectAll() -> None:
    parser = CommandParser()
    cmd = parser.parse("select all")
    assert cmd.commandType == "select-all"


def testParseUndo() -> None:
    parser = CommandParser()
    cmd = parser.parse("undo")
    assert cmd.commandType == "undo"


def testParseUnknown() -> None:
    parser = CommandParser()
    cmd = parser.parse("something random and unrecognized")
    assert cmd is not None
    assert cmd.commandType == "unknown"
    assert cmd.confidence == 0.0


def testParseEmpty() -> None:
    parser = CommandParser()
    cmd = parser.parse("")
    assert cmd is None


def testParseToActionUndo() -> None:
    parser = CommandParser()
    action = parser.parseToAction("undo")
    assert action is not None
    assert action["tool"] == "press-hotkey"
    assert action["args"]["keys"] == ["ctrl", "z"]


def testParseToActionScrollDown() -> None:
    parser = CommandParser()
    action = parser.parseToAction("scroll down 5")
    assert action is not None
    assert action["tool"] == "scroll"
    assert action["args"]["clicks"] == -5


def testParseToActionScrollUp() -> None:
    parser = CommandParser()
    action = parser.parseToAction("scroll up")
    assert action is not None
    assert action["args"]["clicks"] == 3


def testParseToActionClick() -> None:
    parser = CommandParser()
    action = parser.parseToAction("click on Save")
    assert action is not None
    assert action["tool"] == "click-element"
    assert action["args"]["text"] == "Save"


def testCustomPattern() -> None:
    parser = CommandParser(customPatterns=[
        ("screenshot", r"\btake\s+screenshot\b", []),
    ])
    cmd = parser.parse("take screenshot")
    assert cmd is not None
    assert cmd.commandType == "screenshot"
