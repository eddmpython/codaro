from __future__ import annotations

import argparse
from pathlib import Path
import webbrowser

from .document.service import exportDocument
from .server import runServer


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Codaro interactive notebook editor.")
    subparsers = parser.add_subparsers(dest="command", required=False)

    editParser = subparsers.add_parser("edit", help="Open the editor.")
    editParser.add_argument("path", nargs="?", help="Document path to open.")
    editParser.add_argument("--host", default="127.0.0.1")
    editParser.add_argument("--port", type=int, default=8765)
    editParser.add_argument("--no-browser", action="store_true")

    runParser = subparsers.add_parser("run", help="Open app mode.")
    runParser.add_argument("path", help="Document path to run.")
    runParser.add_argument("--host", default="127.0.0.1")
    runParser.add_argument("--port", type=int, default=8765)
    runParser.add_argument("--no-browser", action="store_true")

    exportParser = subparsers.add_parser("export", help="Export document.")
    exportParser.add_argument("path", help="Source document path.")
    exportParser.add_argument("--format", required=True, choices=["codaro", "marimo", "ipynb"])
    exportParser.add_argument("--output", help="Output file path.")

    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-browser", action="store_true")
    return parser


def main() -> None:
    parser = buildParser()
    args = parser.parse_args()
    command = args.command or "edit"

    if command == "export":
        outputPath = exportDocument(args.path, args.format, args.output)
        print(f"Exported to {outputPath}")
        return

    host = args.host
    port = args.port
    path = Path(args.path).expanduser().resolve() if getattr(args, "path", None) else None
    mode = "app" if command == "run" else "edit"
    url = _buildUrl(host, port, mode, path)
    if not args.no_browser:
        webbrowser.open(url)
    runServer(host=host, port=port, mode=mode, documentPath=path)


def _buildUrl(host: str, port: int, mode: str, documentPath: Path | None) -> str:
    basePath = "/app" if mode == "app" else "/"
    if not documentPath:
        return f"http://{host}:{port}{basePath}"
    return f"http://{host}:{port}{basePath}?path={documentPath.as_posix()}"
