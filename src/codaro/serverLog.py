from __future__ import annotations

import ctypes
import logging
import os
from pathlib import Path
import sys


LOGGER_NAME = "codaro"
VERBOSE_LOG_ENV = "CODARO_VERBOSE_LOGS"
RESET = "\x1b[0m"
BOLD = "\x1b[1m"
DIM = "\x1b[2m"
ANSI_ENABLED = False
KEY_COLOR = "\x1b[38;5;251m"
VALUE_COLOR = "\x1b[38;5;255m"
NUMBER_COLOR = "\x1b[38;5;189m"
BOOL_COLOR = "\x1b[38;5;153m"
PATH_COLOR = "\x1b[38;5;153m"

LEVEL_COLORS = {
    "INFO": "\x1b[38;5;39m",
    "WARNING": "\x1b[38;5;214m",
    "ERROR": "\x1b[38;5;203m",
    "CRITICAL": "\x1b[38;5;197m",
}

EVENT_COLORS = {
    "startup": "\x1b[38;5;81m",
    "ready": "\x1b[38;5;153m",
    "workspace": "\x1b[38;5;110m",
    "workspace-scan": "\x1b[38;5;117m",
    "editor": "\x1b[38;5;141m",
    "cli": "\x1b[38;5;75m",
    "browser": "\x1b[38;5;110m",
    "request": "\x1b[38;5;250m",
    "bootstrap": "\x1b[38;5;186m",
    "env": "\x1b[38;5;180m",
    "fs": "\x1b[38;5;116m",
    "packages": "\x1b[38;5;144m",
    "curriculum": "\x1b[38;5;141m",
    "document": "\x1b[38;5;111m",
    "document-load": "\x1b[38;5;111m",
    "document-save": "\x1b[38;5;150m",
    "document-export": "\x1b[38;5;180m",
    "document-block": "\x1b[38;5;146m",
    "document-run": "\x1b[38;5;117m",
    "kernel-session": "\x1b[38;5;75m",
    "kernel-execute": "\x1b[38;5;81m",
    "kernel-reactive": "\x1b[38;5;117m",
    "kernel-interrupt": "\x1b[38;5;214m",
    "kernel-reset": "\x1b[38;5;180m",
    "kernel-remove-definitions": "\x1b[38;5;145m",
    "kernel-variables": "\x1b[38;5;151m",
    "kernel-ws": "\x1b[38;5;111m",
    "api-error": "\x1b[38;5;203m",
    "http-error": "\x1b[38;5;203m",
    "validation-error": "\x1b[38;5;214m",
    "unhandled-error": "\x1b[38;5;197m",
    "lifespan": "\x1b[38;5;141m",
}


def enableAnsiColors() -> None:
    global ANSI_ENABLED
    if not hasattr(sys.stdout, "isatty") or not sys.stdout.isatty():
        ANSI_ENABLED = False
        return
    if os.name != "nt":
        ANSI_ENABLED = True
        return

    kernel32 = ctypes.windll.kernel32
    handle = kernel32.GetStdHandle(-11)
    mode = ctypes.c_uint()
    if kernel32.GetConsoleMode(handle, ctypes.byref(mode)) == 0:
        ANSI_ENABLED = False
        return
    kernel32.SetConsoleMode(handle, mode.value | 0x0004)
    ANSI_ENABLED = True


def colorizeLogText(text: str, color: str, *, bold: bool = False, dim: bool = False) -> str:
    if not ANSI_ENABLED:
        return text
    styles = [color]
    if bold:
        styles.append(BOLD)
    if dim:
        styles.append(DIM)
    return f"{''.join(styles)}{text}{RESET}"


def colorizeLogValue(value: object) -> str:
    text = shortenLogText(str(value))
    if not ANSI_ENABLED:
        return text
    if isinstance(value, bool):
        return colorizeLogText(text, BOOL_COLOR)
    if isinstance(value, int | float):
        return colorizeLogText(text, NUMBER_COLOR)
    if isLikelyPath(text):
        return colorizeLogText(text, PATH_COLOR)
    return colorizeLogText(text, VALUE_COLOR)


class CodaroLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        levelName = record.levelname
        levelColor = LEVEL_COLORS.get(levelName, "\x1b[38;5;245m")

        rawMessage = record.getMessage()
        eventName, _, remainder = rawMessage.partition(" ")
        eventColor = EVENT_COLORS.get(eventName, "\x1b[38;5;147m")
        eventText = colorizeLogText(eventName, eventColor, bold=True)

        if remainder:
            messageText = f"{eventText} {remainder}"
        else:
            messageText = eventText

        prefix = colorizeLogText("[codaro]", "\x1b[38;5;99m", bold=True)
        levelText = colorizeLogText(f"{levelName.lower():>7}", levelColor)
        return f"{prefix} {levelText} {messageText}"


def configureServerLogging() -> logging.Logger:
    logger = logging.getLogger(LOGGER_NAME)
    if logger.handlers:
        logger.setLevel(logging.DEBUG if isVerboseLoggingEnabled() else logging.INFO)
        return logger

    enableAnsiColors()
    handler = logging.StreamHandler()
    handler.setFormatter(CodaroLogFormatter())
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG if isVerboseLoggingEnabled() else logging.INFO)
    logger.propagate = False
    return logger


def getServerLogger() -> logging.Logger:
    return configureServerLogging()


def setVerboseLogging(enabled: bool) -> logging.Logger:
    if enabled:
        os.environ[VERBOSE_LOG_ENV] = "1"
    else:
        os.environ.pop(VERBOSE_LOG_ENV, None)
    logger = logging.getLogger(LOGGER_NAME)
    logger.setLevel(logging.DEBUG if enabled else logging.INFO)
    return configureServerLogging()


def isVerboseLoggingEnabled() -> bool:
    value = os.environ.get(VERBOSE_LOG_ENV, "")
    return value.lower() in {"1", "true", "yes", "on", "debug", "verbose"}


def formatLogFields(**fields: object) -> str:
    parts: list[str] = []
    for key, value in fields.items():
        if value is None:
            continue
        normalized = str(value).replace("\n", " ").strip()
        if not normalized:
            continue
        renderedKey = colorizeLogText(key, KEY_COLOR, bold=True)
        renderedValue = colorizeLogValue(value)
        parts.append(f"{renderedKey}={renderedValue}")
    return " ".join(parts)


def isLikelyPath(text: str) -> bool:
    if text.startswith("./") or text.startswith(".\\") or text.startswith("~/") or text.startswith("~\\"):
        return True
    if len(text) > 2 and text[1] == ":" and ("/" in text or "\\" in text):
        return True
    return "/" in text or "\\" in text


def shortenLogText(text: str) -> str:
    if not isLikelyPath(text):
        return text
    try:
        currentRoot = Path.cwd().resolve()
        currentRootText = str(currentRoot)
        if text == currentRootText:
            return "."
        if text.startswith(currentRootText + os.path.sep):
            return f".{os.path.sep}{Path(text).resolve().relative_to(currentRoot)}"
    except Exception:
        pass

    try:
        homeRoot = Path.home().resolve()
        homeRootText = str(homeRoot)
        if text == homeRootText:
            return "~"
        if text.startswith(homeRootText + os.path.sep):
            return f"~{os.path.sep}{Path(text).resolve().relative_to(homeRoot)}"
    except Exception:
        pass

    pathParts = [part for part in text.replace("\\", "/").split("/") if part]
    if len(pathParts) <= 4:
        return text
    return f".../{'/'.join(pathParts[-4:])}"
