from __future__ import annotations

import socket
from pathlib import Path

from codaro.appRuntime import App
from codaro.server import resolveBindablePort


def testStartStopHookFiring() -> None:
    app = App(title="t")
    seq: list[str] = []

    @app.onStart
    def first() -> None:
        seq.append("start")

    @app.onStop
    def cleanup() -> None:
        seq.append("stop")

    app.fireStart()
    app.fireStop()
    assert seq == ["start", "stop"]


def testReloadHookCollects() -> None:
    app = App()
    counter: dict[str, int] = {"n": 0}

    @app.onReload
    def bump() -> None:
        counter["n"] += 1

    app.fireReload()
    app.fireReload()
    assert counter["n"] == 2


def testHookExceptionsDoNotPropagate() -> None:
    app = App()

    @app.onStart
    def explode() -> None:
        raise RuntimeError("boom")

    app.fireStart()  # 예외가 잡혀야 한다


def testResolvePortFallsBackWhenBusy() -> None:
    host = "127.0.0.1"
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as occupied:
        occupied.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        occupied.bind((host, 0))
        busyPort = occupied.getsockname()[1]
        occupied.listen(1)

        resolved = resolveBindablePort(host, busyPort, maxAttempts=10)
        assert resolved != busyPort
        assert resolved >= busyPort and resolved <= busyPort + 10


def testResolvePortReturnsRequestedWhenFree() -> None:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        probe.bind(("127.0.0.1", 0))
        freePort = probe.getsockname()[1]
    resolved = resolveBindablePort("127.0.0.1", freePort, maxAttempts=3)
    assert resolved == freePort


def testCustomComponentRegistration() -> None:
    app = App()

    @app.component("counter-card")
    def render(count: int = 0, label: str = ""):
        return {"type": "stat", "label": label, "value": str(count)}

    assert "counter-card" in app.components
    descriptor = app.renderComponent("counter-card", count=5, label="합계")
    assert descriptor["type"] == "stat"
    assert descriptor["value"] == "5"


def testCustomComponentPropsSchemaEnforced() -> None:
    app = App()

    @app.component(
        "labeled-number",
        propsSchema={
            "required": ["value"],
            "properties": {"value": {"type": "int"}, "label": {"type": "string"}},
        },
    )
    def render(value: int, label: str = ""):
        return {"type": "stat", "label": label, "value": value}

    app.renderComponent("labeled-number", value=42, label="ok")

    missing = False
    try:
        app.renderComponent("labeled-number", label="no value")
    except ValueError:
        missing = True
    assert missing

    wrongType = False
    try:
        app.renderComponent("labeled-number", value="not-int")
    except TypeError:
        wrongType = True
    assert wrongType


def testInvalidComponentNameRejected() -> None:
    app = App()
    raised = False
    try:
        app.component("bad name!")(lambda: None)
    except ValueError:
        raised = True
    assert raised


def testReloadAppModuleSurvivesMissingModule() -> None:
    app = App()
    @app.block("b1", "code")
    def first():
        return 1
    @app.component("widget-x")
    def render():
        return {"type": "custom", "name": "widget-x"}

    # 존재하지 않는 모듈 이름 → 기존 상태 보존 + False 반환
    result = app.reloadAppModule("definitely_not_a_module_name", paths=None)
    assert result is False
    assert len(app.blocks) == 1
    assert "widget-x" in app.components


def testReloadAppModuleAppliesActualReload(tmp_path) -> None:
    import importlib
    import sys

    module_dir = tmp_path / "hr_pkg"
    module_dir.mkdir()
    (module_dir / "__init__.py").write_text("", encoding="utf-8")
    module_file = module_dir / "hot_module.py"
    module_file.write_text(
        "from codaro.appRuntime import App\n"
        "app = App()\n"
        "@app.block('only-block', 'code')\n"
        "def first():\n"
        "    return 1\n",
        encoding="utf-8",
    )
    sys.path.insert(0, str(tmp_path))
    try:
        module = importlib.import_module("hr_pkg.hot_module")
        app = module.app
        assert len(app.blocks) == 1
        assert app.blocks[0].id == "only-block"

        module_file.write_text(
            "from codaro.appRuntime import App\n"
            "app = App()\n"
            "@app.block('only-block', 'code')\n"
            "def first():\n"
            "    return 1\n"
            "@app.block('second-block', 'code')\n"
            "def second():\n"
            "    return 2\n",
            encoding="utf-8",
        )

        ok = app.reloadAppModule("hr_pkg.hot_module")
        assert ok is True
        reloaded = sys.modules["hr_pkg.hot_module"]
        assert len(reloaded.app.blocks) == 2
        block_ids = {block.id for block in reloaded.app.blocks}
        assert block_ids == {"only-block", "second-block"}
    finally:
        sys.path.remove(str(tmp_path))
        sys.modules.pop("hr_pkg.hot_module", None)
        sys.modules.pop("hr_pkg", None)


if __name__ == "__main__":
    import inspect
    import tempfile

    for name, fn in list(globals().items()):
        if not (name.startswith("test") and callable(fn)):
            continue
        sig = inspect.signature(fn)
        if "tmp_path" in sig.parameters:
            with tempfile.TemporaryDirectory() as td:
                fn(Path(td))
        else:
            fn()
        print(f"ok {name}")
