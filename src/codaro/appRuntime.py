from __future__ import annotations

from dataclasses import dataclass, field
import inspect
from pathlib import Path
from typing import Any, Callable

from .outputDescriptor import (
    accordion,
    callout,
    hstack,
    html,
    md,
    markdown,
    plain,
    sidebar,
    stat,
    tabs,
    text,
    ui,
    vstack,
)


@dataclass(slots=True)
class RuntimeBlock:
    id: str
    kind: str
    funcName: str
    function: Callable[..., Any]


@dataclass(slots=True)
class CustomComponentRegistration:
    name: str
    renderer: Callable[..., Any]
    propsSchema: dict[str, Any] | None = None


@dataclass(slots=True)
class App:
    title: str | None = None
    blocks: list[RuntimeBlock] = field(default_factory=list)
    startHooks: list[Callable[[], Any]] = field(default_factory=list)
    stopHooks: list[Callable[[], Any]] = field(default_factory=list)
    reloadHooks: list[Callable[[], Any]] = field(default_factory=list)
    components: dict[str, CustomComponentRegistration] = field(default_factory=dict)

    def block(self, id: str, kind: str) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        def decorator(function: Callable[..., Any]) -> Callable[..., Any]:
            self.blocks.append(
                RuntimeBlock(
                    id=id,
                    kind=kind,
                    funcName=function.__name__,
                    function=function,
                )
            )
            return function

        return decorator

    def onStart(self, function: Callable[[], Any]) -> Callable[[], Any]:
        self.startHooks.append(function)
        return function

    def onStop(self, function: Callable[[], Any]) -> Callable[[], Any]:
        self.stopHooks.append(function)
        return function

    def onReload(self, function: Callable[[], Any]) -> Callable[[], Any]:
        self.reloadHooks.append(function)
        return function

    def component(
        self,
        name: str,
        *,
        propsSchema: dict[str, Any] | None = None,
    ) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        if not name or not name.replace("-", "").replace("_", "").isalnum():
            raise ValueError(f"Component name must be alphanumeric (got {name!r}).")

        def decorator(renderer: Callable[..., Any]) -> Callable[..., Any]:
            self.components[name] = CustomComponentRegistration(
                name=name,
                renderer=renderer,
                propsSchema=propsSchema,
            )
            return renderer

        return decorator

    def renderComponent(self, name: str, **props: Any) -> Any:
        registration = self.components.get(name)
        if registration is None:
            raise KeyError(f"Component '{name}' is not registered.")
        _validateProps(registration, props)
        return registration.renderer(**props)

    def fireStart(self) -> None:
        _fireHooks(self.startHooks, "start")

    def fireStop(self) -> None:
        _fireHooks(self.stopHooks, "stop")

    def fireReload(self) -> None:
        _fireHooks(self.reloadHooks, "reload")

    def run(self, *, hotReload: bool = True) -> None:
        frame = inspect.currentframe()
        caller = frame.f_back if frame else None
        filePath = Path(caller.f_globals["__file__"]).resolve() if caller else Path.cwd()
        callerModule = caller.f_globals.get("__name__") if caller else None
        from .server import runServer

        watcher = None
        if hotReload:
            from .runtime.hotReload import startHotReload

            def _onChange(paths) -> None:
                self.reloadAppModule(callerModule, paths)

            watcher = startHotReload(filePath.parent, _onChange)

        try:
            self.fireStart()
            runServer(mode="app", documentPath=filePath)
        finally:
            if watcher is not None:
                watcher.stop()
            self.fireStop()

    def reloadAppModule(self, moduleName: str | None, paths: list[Any] | None = None) -> bool:
        import importlib
        import logging
        import sys as _sys

        logger = logging.getLogger(__name__)
        try:
            self.fireReload()
        except (RuntimeError, OSError, ValueError, AttributeError, TypeError) as error:
            logger.warning("reload hooks failed: %s", error)

        previousBlocks = list(self.blocks)
        previousStart = list(self.startHooks)
        previousStop = list(self.stopHooks)
        previousReload = list(self.reloadHooks)
        previousComponents = dict(self.components)
        self.blocks.clear()
        self.startHooks.clear()
        self.stopHooks.clear()
        self.reloadHooks.clear()
        self.components.clear()

        module = _sys.modules.get(moduleName) if moduleName else None
        if module is None:
            logger.info("hot-reload skipped: caller module not in sys.modules (paths=%s)", paths)
            self.blocks.extend(previousBlocks)
            self.startHooks.extend(previousStart)
            self.stopHooks.extend(previousStop)
            self.reloadHooks.extend(previousReload)
            self.components.update(previousComponents)
            return False
        try:
            importlib.reload(module)
            logger.info(
                "hot-reload applied: module=%s blocks %d->%d components %d->%d",
                moduleName,
                len(previousBlocks),
                len(self.blocks),
                len(previousComponents),
                len(self.components),
            )
            return True
        except (ImportError, SyntaxError, RuntimeError, OSError, ValueError, AttributeError, TypeError) as error:
            logger.warning("hot-reload failed for %s: %s — restoring previous state", moduleName, error)
            self.blocks.clear()
            self.startHooks.clear()
            self.stopHooks.clear()
            self.reloadHooks.clear()
            self.components.clear()
            self.blocks.extend(previousBlocks)
            self.startHooks.extend(previousStart)
            self.stopHooks.extend(previousStop)
            self.reloadHooks.extend(previousReload)
            self.components.update(previousComponents)
            return False


def _fireHooks(hooks: list[Callable[[], Any]], stage: str) -> None:
    for hook in list(hooks):
        try:
            hook()
        except (RuntimeError, OSError, ValueError, AttributeError, TypeError) as error:
            import logging

            logging.getLogger(__name__).warning("app %s hook failed: %s", stage, error)


_SCHEMA_TYPE_MAP: dict[str, tuple[type, ...]] = {
    "string": (str,),
    "int": (int,),
    "integer": (int,),
    "number": (int, float),
    "float": (int, float),
    "boolean": (bool,),
    "bool": (bool,),
    "array": (list, tuple),
    "list": (list, tuple),
    "object": (dict,),
    "dict": (dict,),
}


def _validateProps(registration: CustomComponentRegistration, props: dict[str, Any]) -> None:
    schema = registration.propsSchema
    if not schema:
        return
    required = schema.get("required") if isinstance(schema, dict) else None
    if isinstance(required, (list, tuple)):
        for key in required:
            if key not in props:
                raise ValueError(f"Component '{registration.name}' missing required prop: {key}")
    properties = schema.get("properties") if isinstance(schema, dict) else None
    if not isinstance(properties, dict):
        return
    for propName, value in props.items():
        spec = properties.get(propName)
        if not isinstance(spec, dict):
            continue
        expectedType = spec.get("type")
        if not isinstance(expectedType, str):
            continue
        allowedTypes = _SCHEMA_TYPE_MAP.get(expectedType.lower())
        if allowedTypes is None:
            continue
        if isinstance(value, bool) and bool not in allowedTypes and (int in allowedTypes or float in allowedTypes):
            raise TypeError(
                f"Component '{registration.name}' prop '{propName}' expected {expectedType}, got bool."
            )
        if not isinstance(value, allowedTypes):
            raise TypeError(
                f"Component '{registration.name}' prop '{propName}' expected {expectedType}, "
                f"got {type(value).__name__}."
            )
