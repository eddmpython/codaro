from __future__ import annotations

import pytest

from codaro.document import createEmptyDocument
from codaro.document.service import saveDocument

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
    assert normalizeArgs(["export", "notebook.py", "--format", "ipynb"]) == [
        "export",
        "notebook.py",
        "--format",
        "ipynb",
    ]


def testNormalizeArgsLeavesInspectUntouched() -> None:
    assert normalizeArgs(["inspect", "notebook.py", "--json"]) == ["inspect", "notebook.py", "--json"]


def testInspectPrintsCompilerReportWithoutStartingEditor(tmp_path, monkeypatch, capsys) -> None:
    document = createEmptyDocument("Inspectable")
    document.blocks[0].content = "value = 42"
    document.app.entryBlockIds = [document.blocks[0].id]
    path = saveDocument(str(tmp_path / "inspectable.py"), document)
    editorChecked = False

    def failIfEditorChecked(*args, **kwargs) -> None:
        del args, kwargs
        nonlocal editorChecked
        editorChecked = True

    monkeypatch.setattr(cliModule.sys, "argv", ["codaro", "inspect", str(path), "--json"])
    monkeypatch.setattr(cliModule, "requireEditorBuildReady", failIfEditorChecked)

    cliModule.main()

    payload = __import__("json").loads(capsys.readouterr().out)
    assert payload["runtimeTarget"] == "browser"
    assert payload["manifestHash"].startswith("sha256-")
    assert editorChecked is False


def testInspectReturnsNonzeroWhenCompilerBlocksDocument(tmp_path, monkeypatch, capsys) -> None:
    document = createEmptyDocument("Blocked")
    document.blocks[0].content = "value = eval('1 + 1')"
    document.app.entryBlockIds = [document.blocks[0].id]
    path = saveDocument(str(tmp_path / "blocked.py"), document)
    monkeypatch.setattr(cliModule.sys, "argv", ["codaro", "inspect", str(path)])

    with pytest.raises(SystemExit) as excInfo:
        cliModule.main()

    captured = capsys.readouterr()
    assert excInfo.value.code == 1
    assert "Target: blocked" in captured.out
    assert "DYNAMIC_CODE_BLOCKED" in captured.out


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
