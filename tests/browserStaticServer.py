from __future__ import annotations

import mimetypes
import posixpath
import threading
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEB_BUILD = ROOT / "src" / "codaro" / "webBuild"


class StaticAppServer:
    def __init__(self, *, port: int, apiBaseUrl: str | None = None) -> None:
        self.port = port
        self.apiBaseUrl = apiBaseUrl.rstrip("/") if apiBaseUrl else None
        self.baseUrl = f"http://127.0.0.1:{port}"
        self._server = ThreadingHTTPServer(("127.0.0.1", port), self._handler())
        self._thread = threading.Thread(target=self._server.serve_forever, daemon=True)

    def start(self) -> None:
        if not (WEB_BUILD / "index.html").exists():
            raise FileNotFoundError("editor webBuild is missing; run npm run build in editor first")
        self._thread.start()

    def stop(self) -> None:
        self._server.shutdown()
        self._server.server_close()
        self._thread.join(timeout=4)

    def _handler(self) -> type[BaseHTTPRequestHandler]:
        apiBaseUrl = self.apiBaseUrl
        webRoot = WEB_BUILD.resolve()

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self) -> None:
                self._handle()

            def do_HEAD(self) -> None:
                self._handle(sendBody=False)

            def do_POST(self) -> None:
                self._handle()

            def do_PUT(self) -> None:
                self._handle()

            def do_DELETE(self) -> None:
                self._handle()

            def do_OPTIONS(self) -> None:
                self._handle()

            def log_message(self, format: str, *args: object) -> None:
                return

            def _handle(self, *, sendBody: bool = True) -> None:
                path = urllib.parse.urlsplit(self.path).path
                if path.startswith("/api/"):
                    self._proxyApi(sendBody=sendBody)
                    return
                if self.command not in {"GET", "HEAD"}:
                    self.send_error(405)
                    return
                self._serveStatic(path, sendBody=sendBody)

            def _serveStatic(self, path: str, *, sendBody: bool) -> None:
                target = self._targetPath(path)
                if target is None or not target.exists() or not target.is_file():
                    self.send_error(404)
                    return

                data = target.read_bytes()
                contentType = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
                self.send_response(200)
                self.send_header("Content-Type", contentType)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                if sendBody:
                    self.wfile.write(data)

            def _targetPath(self, path: str) -> Path | None:
                if path in {"", "/"}:
                    return webRoot / "index.html"
                normalized = posixpath.normpath(urllib.parse.unquote(path).lstrip("/"))
                if normalized.startswith("../") or normalized == "..":
                    return None
                target = (webRoot / Path(*normalized.split("/"))).resolve()
                if webRoot not in target.parents and target != webRoot:
                    return None
                if target.is_dir():
                    return target / "index.html"
                if not target.exists() and "." not in Path(normalized).name:
                    return webRoot / "index.html"
                return target

            def _proxyApi(self, *, sendBody: bool) -> None:
                if not apiBaseUrl:
                    self.send_error(503, "API proxy is not configured")
                    return

                body = None
                length = int(self.headers.get("Content-Length", "0") or "0")
                if length:
                    body = self.rfile.read(length)

                headers = {
                    key: value
                    for key, value in self.headers.items()
                    if key.lower() not in {"host", "connection", "content-length"}
                }
                request = urllib.request.Request(
                    f"{apiBaseUrl}{self.path}",
                    data=body,
                    headers=headers,
                    method=self.command,
                )
                try:
                    with urllib.request.urlopen(request, timeout=8) as response:
                        data = response.read()
                        self.send_response(response.status)
                        self._copyHeaders(response.headers, len(data))
                        self.end_headers()
                        if sendBody:
                            self.wfile.write(data)
                except urllib.error.HTTPError as error:
                    data = error.read()
                    self.send_response(error.code)
                    self._copyHeaders(error.headers, len(data))
                    self.end_headers()
                    if sendBody:
                        self.wfile.write(data)
                except urllib.error.URLError:
                    self.send_error(502, "API proxy request failed")

            def _copyHeaders(self, headers: object, length: int) -> None:
                for key, value in headers.items():
                    if key.lower() in {"connection", "content-length", "transfer-encoding"}:
                        continue
                    self.send_header(key, value)
                self.send_header("Content-Length", str(length))

        return Handler
