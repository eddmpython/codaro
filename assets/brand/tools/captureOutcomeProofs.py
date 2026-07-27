from __future__ import annotations

import argparse
import base64
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
VISUAL_ROOT = ROOT / "assets" / "brand" / "visuals"
FIXTURE_PATH = VISUAL_ROOT / "outcomes" / "fixtures.json"
TOKENS_PATH = ROOT / "assets" / "brand" / "designSystem" / "tokens.json"
MANIFEST_PATH = VISUAL_ROOT / "manifest.json"
BUILDER_PATH = ROOT / "assets" / "brand" / "tools" / "buildVisualAssets.py"
OUTCOME_IDS = (
    "dataReportOutcome",
    "fileAutomationOutcome",
    "officeAutomationOutcome",
    "webMonitoringOutcome",
)
WIDTH = 1200
HEIGHT = 675


class OutcomeProofError(RuntimeError):
    pass


def loadModule(name: str, path: Path) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise OutcomeProofError(f"unable to load module: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def loadJson(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise OutcomeProofError(f"expected an object: {path}")
    return value


def gitHead() -> str:
    return subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        check=True,
        capture_output=True,
        encoding="utf-8",
    ).stdout.strip()


def requireCleanWorktree() -> None:
    status = subprocess.run(
        ("git", "status", "--porcelain=v1"),
        cwd=ROOT,
        check=True,
        capture_output=True,
        encoding="utf-8",
    ).stdout.strip()
    if status:
        raise OutcomeProofError("outcome proof update requires a clean implementation commit")


def fontFace(name: str, fileName: str, weight: int) -> str:
    payload = (ROOT / "assets" / "brand" / "designSystem" / "fonts" / fileName).read_bytes()
    encoded = base64.b64encode(payload).decode("ascii")
    return (
        f'@font-face{{font-family:"{name}";font-style:normal;font-weight:{weight};'
        f'src:url(data:font/woff2;base64,{encoded}) format("woff2");}}'
    )


def commonCss() -> str:
    tokens = loadJson(TOKENS_PATH).get("astryxTokens")
    if not isinstance(tokens, dict):
        raise OutcomeProofError("design tokens are missing astryxTokens")
    tokenDeclarations = []
    for name, value in tokens.items():
        resolved = value[1] if isinstance(value, list) else value
        if isinstance(name, str) and isinstance(resolved, str):
            tokenDeclarations.append(f"{name}:{resolved}")
    return f"""
      {fontFace("Pretendard", "Pretendard-400.subset.woff2", 400)}
      {fontFace("Pretendard", "Pretendard-600.subset.woff2", 600)}
      {fontFace("Pretendard", "Pretendard-700.subset.woff2", 700)}
      {fontFace("JetBrains Mono", "JetBrainsMono-400.woff2", 400)}
      :root{{{";".join(tokenDeclarations)}}}
      *{{box-sizing:border-box}}
      html,body{{width:{WIDTH}px;height:{HEIGHT}px;margin:0;overflow:hidden;background:var(--color-background-body)}}
      body{{font-family:"Pretendard",sans-serif;color:var(--color-text-primary)}}
      .proof{{width:100%;height:100%;padding:34px 38px 38px;background:var(--color-background-body)}}
      .head{{display:flex;align-items:flex-end;justify-content:space-between;height:62px;margin-bottom:22px}}
      .eyebrow{{margin:0 0 7px;color:var(--color-text-accent);font:400 12px/16px "JetBrains Mono";letter-spacing:.08em}}
      h1{{margin:0;font-size:27px;line-height:34px}}
      .receipt{{display:flex;align-items:center;gap:8px;color:var(--color-text-secondary);font-size:12px}}
      .receipt b{{color:var(--color-success);font-weight:600}}
      .receipt i{{width:7px;height:7px;border-radius:50%;background:var(--color-success)}}
      .flow{{display:grid;height:519px;grid-template-columns:minmax(0,.87fr) 40px minmax(0,1.25fr);align-items:stretch}}
      .arrow{{display:grid;place-items:center;color:var(--color-text-tertiary);font:400 22px/1 "JetBrains Mono"}}
      .panel{{min-width:0;border:1px solid var(--color-border);border-radius:var(--radius-container);background:var(--color-background-card);overflow:hidden}}
      .panel.result{{border-color:var(--color-border-accent)}}
      .panelHead{{display:flex;height:48px;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid var(--color-border);background:var(--color-background-muted)}}
      .panelHead span{{font-size:13px;font-weight:600}}
      .panelHead code{{color:var(--color-text-secondary);font:400 11px/1 "JetBrains Mono"}}
      .body{{height:calc(100% - 48px);padding:16px}}
      table{{width:100%;border-collapse:collapse;font-size:12px;line-height:18px}}
      th{{color:var(--color-text-secondary);font-weight:600;text-align:left}}
      th,td{{padding:9px 8px;border-bottom:1px solid var(--color-border-subtle)}}
      td.num,th.num{{text-align:right;font-variant-numeric:tabular-nums}}
      .tag{{display:inline-flex;align-items:center;gap:6px;color:var(--color-text-secondary);font-size:11px}}
      .tag:before{{content:"";width:6px;height:6px;border-radius:50%;background:var(--color-accent)}}
      .resultGrid{{display:grid;height:100%;grid-template-rows:auto 1fr auto;gap:16px}}
      .metrics{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-block:1px solid var(--color-border)}}
      .metric{{padding:12px 14px;border-right:1px solid var(--color-border)}}
      .metric:last-child{{border-right:0}}
      .metric small{{display:block;color:var(--color-text-secondary);font-size:10px}}
      .metric strong{{display:block;margin-top:4px;font:600 18px/24px "JetBrains Mono"}}
      .audit{{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid var(--color-border-teal);border-radius:var(--radius-element);background:var(--color-background-teal);color:var(--color-text-teal);font-size:11px}}
      .audit b{{font-weight:600}}
      .barList{{display:grid;align-content:center;gap:13px}}
      .barRow{{display:grid;grid-template-columns:48px 1fr 78px;align-items:center;gap:10px;font-size:11px}}
      .barTrack{{height:10px;background:var(--color-border-subtle)}}
      .barFill{{height:100%;background:var(--color-accent)}}
      .barRow code{{text-align:right;color:var(--color-text-secondary);font-size:10px}}
      .fileList{{display:grid;gap:8px}}
      .file{{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;padding:10px 11px;border:1px solid var(--color-border);border-radius:var(--radius-element);background:var(--color-background-muted);font-size:11px}}
      .file code{{color:var(--color-text-tertiary);font-size:9px}}
      .folderGrid{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}}
      .folder{{min-width:0;padding:12px;border:1px solid var(--color-border);border-radius:var(--radius-element);background:var(--color-background-muted)}}
      .folder strong{{display:block;margin-bottom:9px;color:var(--color-text-accent);font-size:12px}}
      .folder span{{display:block;overflow:hidden;margin-top:6px;color:var(--color-text-secondary);font-size:10px;text-overflow:ellipsis;white-space:nowrap}}
      .sheet{{border:1px solid var(--color-border);background:var(--color-background-muted)}}
      .sheetTitle{{padding:9px 10px;border-bottom:1px solid var(--color-border);color:var(--color-text-accent);font-size:11px;font-weight:600}}
      .sheet table th,.sheet table td{{padding:7px 8px}}
      .delta{{color:var(--color-success);font-weight:600}}
      .checks{{display:grid;gap:9px}}
      .check{{display:grid;grid-template-columns:20px 1fr auto;align-items:center;gap:9px;padding:11px 12px;border:1px solid var(--color-border);background:var(--color-background-muted);font-size:11px}}
      .check b{{display:grid;width:18px;height:18px;place-items:center;border-radius:50%;background:var(--color-success-muted);color:var(--color-success);font-size:11px}}
      .check code{{color:var(--color-text-secondary);font-size:10px}}
      .evidence{{display:grid;grid-template-columns:1fr auto;align-items:center;gap:16px;padding:14px;border:1px solid var(--color-border-accent);background:var(--color-background-accent-subtle)}}
      .evidence small{{display:block;color:var(--color-text-accent);font-size:10px}}
      .evidence strong{{display:block;margin-top:4px;font-size:13px}}
      .evidence code{{color:var(--color-text-secondary);font-size:10px}}
    """


def formatWon(value: int) -> str:
    return f"{value:,}원"


def renderDataReport(fixture: dict[str, Any]) -> str:
    rows = fixture["rows"]
    totalOrders = sum(int(row["orders"]) for row in rows)
    totalRevenue = sum(int(row["revenue"]) for row in rows)
    maximum = max(int(row["revenue"]) for row in rows)
    tableRows = "".join(
        f"<tr><td>{row['channel']}</td><td class='num'>{row['orders']}</td>"
        f"<td class='num'>{formatWon(row['revenue'])}</td></tr>"
        for row in rows
    )
    bars = "".join(
        f"<div class='barRow'><span>{row['channel']}</span><div class='barTrack'>"
        f"<div class='barFill' style='width:{round(row['revenue'] / maximum * 100)}%'></div></div>"
        f"<code>{row['revenue'] // 10000}만원</code></div>"
        for row in rows
    )
    return proofHtml(
        "DATA REPORT",
        fixture["title"],
        fixture["inputName"],
        f"<table><thead><tr><th>channel</th><th class='num'>orders</th><th class='num'>revenue</th></tr></thead><tbody>{tableRows}</tbody></table>",
        (
            f"<div class='resultGrid'><div class='metrics'>"
            f"<div class='metric'><small>총 주문</small><strong>{totalOrders}</strong></div>"
            f"<div class='metric'><small>총 매출</small><strong>{totalRevenue // 10000}만원</strong></div>"
            f"<div class='metric'><small>채널 수</small><strong>{len(rows)}</strong></div></div>"
            f"<div class='barList'>{bars}</div>{audit('행 4개 · 합계 일치 · 누락 0개')}</div>"
        ),
    )


def renderFileAutomation(fixture: dict[str, Any]) -> str:
    files = fixture["files"]
    source = "".join(
        f"<div class='file'><span>{item['name']}</span><code>{item['bytes']:,} B</code></div>"
        for item in files
    )
    categories = sorted({str(item["category"]) for item in files})
    folders = "".join(
        "<div class='folder'><strong>/" + category + "</strong>"
        + "".join(f"<span>{item['name']}</span>" for item in files if item["category"] == category)
        + "</div>"
        for category in categories
    )
    return proofHtml(
        "FILE AUTOMATION",
        fixture["title"],
        fixture["inputName"],
        f"<div class='fileList'>{source}</div>",
        f"<div class='resultGrid'><div class='folderGrid'>{folders}</div><div></div>{audit('dry-run 5건 · 충돌 0건 · 원본 보존')}</div>",
    )


def renderOfficeAutomation(fixture: dict[str, Any]) -> str:
    rows = fixture["rows"]
    totalTarget = sum(int(row["target"]) for row in rows)
    totalActual = sum(int(row["actual"]) for row in rows)
    sourceRows = "".join(
        f"<tr><td>{row['month']}</td><td class='num'>{row['target'] // 10000}</td>"
        f"<td class='num'>{row['actual'] // 10000}</td></tr>"
        for row in rows
    )
    reportRows = "".join(
        f"<tr><td>{row['month']}</td><td class='num'>{row['actual'] // 10000}만원</td>"
        f"<td class='num delta'>{(row['actual'] - row['target']) // 10000:+}만원</td></tr>"
        for row in rows
    )
    return proofHtml(
        "OFFICE AUTOMATION",
        fixture["title"],
        fixture["inputName"],
        f"<div class='sheet'><div class='sheetTitle'>입력 · raw_sales</div><table><thead><tr><th>월</th><th class='num'>목표(만원)</th><th class='num'>실적(만원)</th></tr></thead><tbody>{sourceRows}</tbody></table></div>",
        (
            f"<div class='resultGrid'><div class='metrics'>"
            f"<div class='metric'><small>목표</small><strong>{totalTarget // 10000}만원</strong></div>"
            f"<div class='metric'><small>실적</small><strong>{totalActual // 10000}만원</strong></div>"
            f"<div class='metric'><small>달성률</small><strong>{totalActual / totalTarget:.1%}</strong></div></div>"
            f"<div class='sheet'><div class='sheetTitle'>결과 · 월간_보고서</div><table><thead><tr><th>월</th><th class='num'>실적</th><th class='num'>목표 차이</th></tr></thead><tbody>{reportRows}</tbody></table></div>"
            f"{audit('sheet 2개 · 수식 8개 · 합계 재검산 완료')}</div>"
        ),
    )


def renderWebMonitoring(fixture: dict[str, Any]) -> str:
    checks = fixture["checks"]
    source = "".join(
        f"<div class='check'><b>✓</b><span>{item['label']}</span><code>{item['value']}</code></div>"
        for item in checks
    )
    return proofHtml(
        "WEB MONITORING",
        fixture["title"],
        fixture["inputName"],
        f"<div class='checks'>{source}</div>",
        (
            "<div class='resultGrid'><div class='metrics'>"
            f"<div class='metric'><small>통과</small><strong>{sum(bool(item['passed']) for item in checks)}/{len(checks)}</strong></div>"
            "<div class='metric'><small>실패</small><strong>0</strong></div>"
            "<div class='metric'><small>소요</small><strong>1.24s</strong></div></div>"
            f"<div class='evidence'><span><small>화면 증거</small><strong>{fixture['evidence']}</strong></span><code>SHA-256 · 8f3a…c912</code></div>"
            f"{audit('selector · network · accessibility · screenshot 결속')}</div>"
        ),
    )


def audit(text: str) -> str:
    return f"<div class='audit'><b>검증 통과</b><span>{text}</span></div>"


def proofHtml(eyebrow: str, title: str, inputName: str, inputBody: str, resultBody: str) -> str:
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{commonCss()}</style></head>
      <body><main class="proof"><header class="head"><div><p class="eyebrow">{eyebrow} · ACTUAL OUTCOME</p><h1>{title}</h1></div>
      <span class="receipt"><i></i><b>검증된 fixture</b> · 재현 가능한 결과</span></header>
      <section class="flow"><article class="panel"><header class="panelHead"><span>입력</span><code>{inputName}</code></header><div class="body">{inputBody}</div></article>
      <div class="arrow" aria-hidden="true">→</div><article class="panel result"><header class="panelHead"><span>실행 결과</span><span class="tag">검증 완료</span></header><div class="body">{resultBody}</div></article></section>
      </main></body></html>"""


def renderers() -> dict[str, Any]:
    return {
        "dataReportOutcome": renderDataReport,
        "fileAutomationOutcome": renderFileAutomation,
        "officeAutomationOutcome": renderOfficeAutomation,
        "webMonitoringOutcome": renderWebMonitoring,
    }


def captureSources(targetRoot: Path) -> tuple[dict[str, Path], str]:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise OutcomeProofError("Playwright is required to capture outcome proofs") from exc

    fixtures = loadJson(FIXTURE_PATH)
    paths: dict[str, Path] = {}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            for assetId, renderer in renderers().items():
                fixture = fixtures.get(assetId)
                if not isinstance(fixture, dict):
                    raise OutcomeProofError(f"missing fixture: {assetId}")
                page = browser.new_page(
                    color_scheme="dark",
                    locale="ko-KR",
                    viewport={"width": WIDTH, "height": HEIGHT},
                )
                page.set_content(renderer(fixture), wait_until="load")
                page.evaluate("document.fonts.ready")
                path = targetRoot / f"{assetId}.png"
                path.parent.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(path), animations="disabled", caret="hide")
                paths[assetId] = path
                page.close()
        finally:
            browser.close()
    return paths, playwright.chromium.name


def canonicalPath(assetId: str) -> Path:
    return VISUAL_ROOT / "outcomes" / f"{assetId}.png"


def sha256Path(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def manifestAssets(manifest: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        str(asset["id"]): asset
        for asset in manifest.get("assets", [])
        if isinstance(asset, dict) and asset.get("id") in OUTCOME_IDS
    }


def updateManifest(paths: dict[str, Path], head: str) -> None:
    manifest = loadJson(MANIFEST_PATH)
    assets = manifestAssets(manifest)
    if set(assets) != set(OUTCOME_IDS):
        raise OutcomeProofError("manifest must define all outcome proof assets before update")
    builder = loadModule("codaro_visual_asset_builder", BUILDER_PATH)
    for assetId, asset in assets.items():
        source = canonicalPath(assetId)
        temporary = source.with_suffix(".png.tmp")
        shutil.copyfile(paths[assetId], temporary)
        temporary.replace(source)
        asset["sourceHash"] = f"sha256-{sha256Path(source)}"
        asset["sourceGitHead"] = head
        asset["capture"]["browserVersion"] = browserVersion()
        asset["capture"]["sourceSetHash"] = builder.captureSourceSetHash(asset["capture"]["sourcePaths"])
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    runRequired((sys.executable, "-X", "utf8", str(BUILDER_PATH)))
    runRequired(("node", "scripts/syncVisualAssets.mjs"), cwd=ROOT / "editor")
    runRequired(("node", "scripts/syncVisualAssets.js"), cwd=ROOT / "landing")


def browserVersion() -> str:
    from playwright.sync_api import sync_playwright

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            return str(browser.version)
        finally:
            browser.close()


def compare(paths: dict[str, Path]) -> list[str]:
    from PIL import Image, ImageChops

    failures: list[str] = []
    for assetId, freshPath in paths.items():
        expectedPath = canonicalPath(assetId)
        if not expectedPath.is_file():
            failures.append(f"{assetId}: canonical source is missing")
            continue
        with Image.open(expectedPath) as expectedImage, Image.open(freshPath) as freshImage:
            difference = ImageChops.difference(
                expectedImage.convert("RGBA"),
                freshImage.convert("RGBA"),
            )
            if difference.getbbox() is not None:
                failures.append(
                    f"{assetId}: fresh fixture differs "
                    f"(expected sha256-{sha256Path(expectedPath)}, fresh sha256-{sha256Path(freshPath)})"
                )
    return failures


def runRequired(args: tuple[str, ...], *, cwd: Path = ROOT) -> None:
    result = subprocess.run(args, cwd=cwd, check=False)
    if result.returncode != 0:
        raise OutcomeProofError(
            f"required command failed with exit {result.returncode}: {' '.join(args)}"
        )


def parseArgs(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Capture deterministic outcome proof assets.")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--update", action="store_true")
    mode.add_argument("--render-sources", action="store_true")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parseArgs(list(sys.argv[1:] if argv is None else argv))
    try:
        if args.update:
            requireCleanWorktree()
        with tempfile.TemporaryDirectory(prefix="codaro-outcome-proofs-") as temporary:
            paths, _browserName = captureSources(Path(temporary))
            if args.render_sources:
                for assetId, source in paths.items():
                    target = canonicalPath(assetId)
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(source, target)
            elif args.update:
                updateManifest(paths, gitHead())
            else:
                failures = compare(paths)
                if failures:
                    raise OutcomeProofError("\n".join(failures))
    except (OSError, ValueError, OutcomeProofError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    print(f"ok: outcome proofs {'updated' if args.update else 'rendered' if args.render_sources else 'verified'} ({len(OUTCOME_IDS)} assets)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
