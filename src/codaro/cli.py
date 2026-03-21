from __future__ import annotations

import argparse
from pathlib import Path
import sys
import webbrowser

from .document.service import exportDocument
from .serverLog import formatLogFields, setVerboseLogging
from .server import FrontendBuildError, requireFrontendBuildReady, runServer


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Codaro interactive notebook editor.",
        epilog=(
            "Examples:\n"
            "  codaro\n"
            "  codaro notebook.py\n"
            "  codaro app notebook.py\n"
            "  codaro export notebook.py --format marimo"
        ),
        formatter_class=argparse.RawTextHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="command", required=False)

    editParser = subparsers.add_parser("edit", aliases=["open"], help="Open the editor.")
    editParser.add_argument("path", nargs="?", help="Document path to open.")
    editParser.add_argument("--host", default="127.0.0.1")
    editParser.add_argument("--port", type=int, default=8765)
    editParser.add_argument("--no-browser", action="store_true")
    editParser.add_argument("--verbose", action="store_true")

    runParser = subparsers.add_parser("run", aliases=["app"], help="Open app mode.")
    runParser.add_argument("path", help="Document path to run.")
    runParser.add_argument("--host", default="127.0.0.1")
    runParser.add_argument("--port", type=int, default=8765)
    runParser.add_argument("--no-browser", action="store_true")
    runParser.add_argument("--verbose", action="store_true")

    exportParser = subparsers.add_parser("export", help="Export document.")
    exportParser.add_argument("path", help="Source document path.")
    exportParser.add_argument("--format", required=True, choices=["codaro", "marimo", "ipynb"])
    exportParser.add_argument("--output", help="Output file path.")

    taskParser = subparsers.add_parser("task", help="Manage automation tasks.")
    taskSubparsers = taskParser.add_subparsers(dest="task_command", required=True)

    taskRunParser = taskSubparsers.add_parser("run", help="Run a document as a task.")
    taskRunParser.add_argument("path", help="Document path to execute.")
    taskRunParser.add_argument("--verbose", action="store_true")

    taskListParser = taskSubparsers.add_parser("list", help="List registered tasks.")
    taskListParser.add_argument("--verbose", action="store_true")

    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-browser", action="store_true")
    parser.add_argument("--verbose", action="store_true")
    return parser


def main() -> None:
    parser = buildParser()
    normalizedArgs = normalizeArgs(sys.argv[1:])
    args = parser.parse_args(normalizedArgs)
    logger = setVerboseLogging(args.verbose)
    command = args.command or "edit"
    logger.info(
        "cli %s",
        formatLogFields(
            rawArgs=" ".join(sys.argv[1:]) if sys.argv[1:] else "(none)",
            normalizedArgs=" ".join(normalizedArgs),
            command=command,
        ),
    )

    if command == "task":
        _handleTask(args, logger)
        return

    if command == "export":
        outputPath = exportDocument(args.path, args.format, args.output)
        logger.info(
            "cli %s",
            formatLogFields(
                action="export",
                path=Path(args.path).expanduser().resolve(),
                format=args.format,
                outputPath=outputPath,
            ),
        )
        print(f"Exported to {outputPath}")
        return

    host = args.host
    port = args.port
    path = Path(args.path).expanduser().resolve() if getattr(args, "path", None) else None
    mode = "app" if command == "run" else "edit"
    url = _buildUrl(host, port, mode, path)
    logger.info(
        "cli %s",
        formatLogFields(
            action="start",
            mode=mode,
            host=host,
            port=port,
            path=path,
            noBrowser=args.no_browser,
            verbose=args.verbose,
            url=url,
        ),
    )

    try:
        requireFrontendBuildReady(logger=logger)
    except FrontendBuildError as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1) from error

    if not args.no_browser:
        openBrowser(url, logger)
    else:
        logger.info("browser %s", formatLogFields(action="skip", reason="no-browser", url=url))
    runServer(host=host, port=port, mode=mode, documentPath=path, verbose=args.verbose)


def _buildUrl(host: str, port: int, mode: str, documentPath: Path | None) -> str:
    basePath = "/app" if mode == "app" else "/"
    if not documentPath:
        return f"http://{host}:{port}{basePath}"
    return f"http://{host}:{port}{basePath}?path={documentPath.as_posix()}"


def _handleTask(args, logger) -> None:
    import asyncio
    from .automation.taskModel import TaskDefinition
    from .automation.taskRunner import TaskRunner
    from .automation.taskRegistry import getTaskRegistry

    if args.task_command == "run":
        docPath = Path(args.path).expanduser().resolve()
        if not docPath.exists():
            print(f"Document not found: {docPath}", file=sys.stderr)
            raise SystemExit(1)

        task = TaskDefinition(
            name=docPath.stem,
            documentPath=str(docPath),
        )
        runner = TaskRunner(workspaceRoot=str(docPath.parent))
        run = asyncio.run(runner.run(task))

        if run.output:
            print(run.output)
        if run.error:
            print(f"Error: {run.error}", file=sys.stderr)
            raise SystemExit(1)

        print(f"Task completed: {run.status.value} ({run.durationMs}ms)")

    elif args.task_command == "list":
        registry = getTaskRegistry()
        tasks = registry.listTasks()
        if not tasks:
            print("No registered tasks.")
            return
        for t in tasks:
            status = "enabled" if t.enabled else "disabled"
            schedule = t.schedule or "manual"
            print(f"  {t.id}  {t.name}  [{status}]  schedule={schedule}")


def normalizeArgs(rawArgs: list[str]) -> list[str]:
    if not rawArgs:
        return ["edit"]

    command = rawArgs[0].lower()
    knownCommands = {"edit", "run", "app", "export", "task"}

    if command == "app":
        return ["run", *rawArgs[1:]]

    if command in knownCommands:
        return rawArgs

    if rawArgs[0].startswith("-"):
        return ["edit", *rawArgs]

    return ["edit", *rawArgs]


def openBrowser(url: str, logger) -> None:
    try:
        opened = webbrowser.open(url)
    except Exception as error:
        logger.error("browser %s", formatLogFields(action="error", url=url, message=str(error)))
        return
    status = "opened" if opened else "not-confirmed"
    logger.info("browser %s", formatLogFields(action="open", status=status, url=url))
