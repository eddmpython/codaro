from __future__ import annotations

import pytest

import codaro.cli as cliModule
from codaro.cli import normalizeArgs
from codaro.server import EditorBuildError


def testNormalizeArgsDefaultsToEdit() -> None:
    assert normalizeArgs([]) == ["edit"]


def testNormalizeArgsTreatsPathAsEdit() -> None:
    assert normalizeArgs(["notebook.py"]) == ["edit", "notebook.py"]


def testNormalizeArgsKeepsEditOptions() -> None:
    assert normalizeArgs(["--no-browser"]) == ["edit", "--no-browser"]


def testNormalizeArgsMapsAppAliasToRun() -> None:
    assert normalizeArgs(["app", "notebook.py"]) == ["run", "notebook.py"]


def testNormalizeArgsLeavesExportUntouched() -> None:
    assert normalizeArgs(["export", "notebook.py", "--format", "marimo"]) == [
        "export",
        "notebook.py",
        "--format",
        "marimo",
    ]


def testMainFailsBeforeOpeningBrowserWhenFrontendBuildMissing(monkeypatch, capsys) -> None:
    browserOpened = False
    serverStarted = False

    def fakeOpenBrowser(url, logger) -> None:
        del url, logger
        nonlocal browserOpened
        browserOpened = True

    def fakeRunServer(**kwargs) -> None:
        del kwargs
        nonlocal serverStarted
        serverStarted = True

    def fakeRequireFrontendBuildReady(*args, **kwargs) -> None:
        del args, kwargs
        raise EditorBuildError("npm run build\nnpm run build:watch")

    monkeypatch.setattr(cliModule.sys, "argv", ["codaro"])
    monkeypatch.setattr(cliModule, "openBrowser", fakeOpenBrowser)
    monkeypatch.setattr(cliModule, "runServer", fakeRunServer)
    monkeypatch.setattr(cliModule, "requireEditorBuildReady", fakeRequireFrontendBuildReady)

    with pytest.raises(SystemExit) as excInfo:
        cliModule.main()

    captured = capsys.readouterr()
    assert excInfo.value.code == 1
    assert browserOpened is False
    assert serverStarted is False
    assert "npm run build" in captured.err
    assert "npm run build:watch" in captured.err
