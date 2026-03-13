from __future__ import annotations

import argparse
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from textwrap import dedent
import webbrowser


def _render_home() -> bytes:
    html = dedent(
        """\
        <!doctype html>
        <html lang="ko">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Codaro</title>
          <style>
            :root {
              color-scheme: light;
              --bg: #f6f2ea;
              --panel: rgba(255, 252, 246, 0.88);
              --ink: #1e1c19;
              --muted: #5f5a53;
              --line: rgba(30, 28, 25, 0.12);
              --accent: #d95d39;
              --accent-2: #2f6c5e;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              min-height: 100vh;
              font-family: "Segoe UI", "Apple SD Gothic Neo", sans-serif;
              color: var(--ink);
              background:
                radial-gradient(circle at top left, rgba(217, 93, 57, 0.22), transparent 36%),
                radial-gradient(circle at right 20%, rgba(47, 108, 94, 0.18), transparent 28%),
                linear-gradient(160deg, #f7f4ed 0%, #efe4d2 100%);
            }
            main {
              width: min(980px, calc(100% - 32px));
              margin: 48px auto;
              padding: 32px;
              border: 1px solid var(--line);
              border-radius: 28px;
              background: var(--panel);
              backdrop-filter: blur(12px);
              box-shadow: 0 20px 60px rgba(50, 40, 20, 0.08);
            }
            .eyebrow {
              display: inline-block;
              padding: 8px 12px;
              border-radius: 999px;
              background: rgba(217, 93, 57, 0.12);
              color: var(--accent);
              font-weight: 700;
              letter-spacing: 0.04em;
              text-transform: uppercase;
              font-size: 12px;
            }
            h1 {
              margin: 20px 0 12px;
              font-size: clamp(40px, 8vw, 82px);
              line-height: 0.94;
              letter-spacing: -0.04em;
            }
            p {
              margin: 0;
              max-width: 700px;
              color: var(--muted);
              font-size: clamp(16px, 2vw, 20px);
              line-height: 1.6;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
              gap: 16px;
              margin-top: 32px;
            }
            .card {
              padding: 18px;
              border-radius: 20px;
              border: 1px solid var(--line);
              background: rgba(255, 255, 255, 0.72);
            }
            .card strong {
              display: block;
              margin-bottom: 8px;
              font-size: 15px;
            }
            .footer {
              margin-top: 28px;
              padding-top: 18px;
              border-top: 1px solid var(--line);
              font-size: 14px;
              color: var(--muted);
            }
            code {
              padding: 2px 6px;
              border-radius: 8px;
              background: rgba(30, 28, 25, 0.06);
              font-family: Consolas, monospace;
            }
          </style>
        </head>
        <body>
          <main>
            <span class="eyebrow">Codaro Local Preview</span>
            <h1>화면이 뜨는 상태까지 연결했습니다.</h1>
            <p>
              지금은 최소 진입 화면입니다. <code>uv run codaro</code>를 실행하면
              브라우저에서 이 페이지가 열리고, 이후 여기에 편집기와 실행 런타임을 붙여가면 됩니다.
            </p>
            <section class="grid">
              <article class="card">
                <strong>문서 모델</strong>
                block 중심 편집기 구조를 붙일 자리
              </article>
              <article class="card">
                <strong>실행 엔진</strong>
                local / sandbox / pyodide 분리 지점
              </article>
              <article class="card">
                <strong>위젯 브리지</strong>
                Python이 만든 UI descriptor 렌더링 지점
              </article>
            </section>
            <div class="footer">
              서버가 실행 중입니다. 종료는 터미널에서 <code>Ctrl+C</code>.
            </div>
          </main>
        </body>
        </html>
        """
    )
    return html.encode("utf-8")


class CodaroHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        if self.path in {"/", "/index.html"}:
            body = _render_home()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if self.path == "/health":
            body = b"ok"
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Not Found")

    def log_message(self, format: str, *args: object) -> None:
        return


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run the Codaro local preview server.")
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind.")
    parser.add_argument("--port", type=int, default=8765, help="Port to bind.")
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Start the server without opening a browser window.",
    )
    return parser


def run_server(host: str, port: int, open_browser: bool) -> None:
    server = ThreadingHTTPServer((host, port), CodaroHandler)
    url = f"http://{host}:{port}"
    print(f"Codaro preview running at {url}")

    if open_browser:
        webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Codaro preview.")
    finally:
        server.server_close()


def main() -> None:
    args = build_parser().parse_args()
    run_server(host=args.host, port=args.port, open_browser=not args.no_browser)
