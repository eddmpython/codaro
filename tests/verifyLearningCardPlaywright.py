from __future__ import annotations

import argparse
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path
from typing import Any

import yaml

from codaro.curriculum.converter import yamlToDocument


ROOT = Path(__file__).resolve().parents[1]
EDITOR_DIR = ROOT / "editor"
STORAGE_KEY = "codaro-custom-curricula"
FIXTURE_TITLE = "Playwright structured section card"


def main(argv: list[str] | None = None) -> int:
    args = buildParser().parse_args(argv)
    npx = shutil.which("npx")
    npm = shutil.which("npm")
    if not npx or not npm:
        print("FAIL: npx and npm are required for Playwright browser verification", file=sys.stderr)
        return 1

    port = args.port or freePort()
    url = f"http://127.0.0.1:{port}/#curriculum"
    tempRoot = Path(tempfile.mkdtemp(prefix="codaro-learning-card-pw-"))
    session = f"codaro-learning-card-{int(time.time())}"
    server = subprocess.Popen(
        [
            npm,
            "run",
            "dev",
            "--",
            "--host",
            "127.0.0.1",
            "--port",
            str(port),
        ],
        cwd=EDITOR_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.STDOUT,
    )
    cli: PlaywrightCli | None = None

    try:
        waitForHttp(url)
        cli = PlaywrightCli(npx=npx, cwd=tempRoot, session=session)
        cli.run("open", url)
        cli.run("resize", "1280", "900")
        cli.run("localstorage-set", STORAGE_KEY, json.dumps([customCurriculumEntry()], ensure_ascii=False))
        cli.run("reload")
        cli.waitEval(jsTextPresent(FIXTURE_TITLE), "custom curriculum item")
        cli.waitEval(jsReferenceLessonIdle(), "reference lesson loading to settle")
        clickCustomCurriculum(cli)
        cli.waitEval(jsStructuredCardReady(), "structured learning card")
        cli.waitEval(jsLearningOverviewReady(), "learning overview")
        desktopOverview = cli.eval(jsAssertLearningOverview("desktop"))
        desktop = cli.eval(jsAssertStructuredCard("desktop"))
        cli.run("resize", "390", "844")
        cli.waitEval(jsLearningOverviewReady(), "learning overview after mobile resize")
        cli.waitEval(jsStructuredCardReady(), "structured learning card after mobile resize")
        mobileOverview = cli.eval(jsAssertLearningOverview("mobile"))
        mobile = cli.eval(jsAssertStructuredCard("mobile"))
        print(f"ok: Playwright structured learning card verified {desktopOverview} {desktop} {mobileOverview} {mobile}")
        return 0
    except VerificationError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        if cli is not None:
            print(debugPageState(cli), file=sys.stderr)
        return 1
    finally:
        subprocess.run(
            [npx, "--yes", "--package", "@playwright/cli", "playwright-cli", "--session", session, "close"],
            cwd=tempRoot,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        server.terminate()
        try:
            server.wait(timeout=8)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait(timeout=8)
        shutil.rmtree(tempRoot, ignore_errors=True)


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Verify structured learning card rendering with Playwright CLI")
    parser.add_argument("--port", type=int, default=0)
    return parser


class VerificationError(RuntimeError):
    pass


class PlaywrightCli:
    def __init__(self, *, npx: str, cwd: Path, session: str) -> None:
        self._npx = npx
        self._cwd = cwd
        self._session = session

    def run(self, *args: str) -> str:
        command = [
            self._npx,
            "--yes",
            "--package",
            "@playwright/cli",
            "playwright-cli",
            "--session",
            self._session,
            *args,
        ]
        result = subprocess.run(
            command,
            cwd=self._cwd,
            text=True,
            encoding="utf-8",
            errors="replace",
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
        )
        if result.returncode != 0:
            raise VerificationError(f"playwright-cli {' '.join(args)} failed:\n{result.stdout}")
        return result.stdout.strip()

    def eval(self, expression: str) -> str:
        output = self.run("eval", expression, "--raw")
        if output.lstrip().startswith("### Error"):
            raise VerificationError(output)
        return output

    def waitEval(self, expression: str, label: str, timeout: float = 20.0) -> None:
        deadline = time.monotonic() + timeout
        lastOutput = ""
        while time.monotonic() < deadline:
            try:
                lastOutput = self.eval(expression)
                if lastOutput.strip() == "true":
                    return
            except VerificationError as exc:
                lastOutput = str(exc)
            time.sleep(0.35)
        raise VerificationError(f"timed out waiting for {label}: {lastOutput}")


def waitForHttp(url: str, timeout: float = 30.0) -> None:
    deadline = time.monotonic() + timeout
    lastError = ""
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=1.0) as response:
                if 200 <= response.status < 500:
                    return
        except (OSError, urllib.error.URLError) as exc:
            lastError = str(exc)
        time.sleep(0.25)
    raise VerificationError(f"dev server did not become ready: {lastError}")


def freePort() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def customCurriculumEntry() -> dict[str, Any]:
    createdAt = 1_700_000_000_000
    document = materializedStructuredLessonDocument()
    return {
        "id": "custom-playwright-structured-section-card",
        "title": FIXTURE_TITLE,
        "document": document,
        "createdAt": createdAt,
    }


def materializedStructuredLessonDocument() -> dict[str, Any]:
    document, _solutions = yamlToDocument(yaml.safe_load(structuredLessonYaml()), "playwright", "structured-section-card")
    payload = document.model_dump(mode="json")
    payload["id"] = "curriculum-playwright-structured-section-card"
    assertMaterializedContract(payload)
    return compactDocumentForBrowserStorage(payload)


def assertMaterializedContract(document: dict[str, Any]) -> None:
    blocks = document.get("blocks")
    if not isinstance(blocks, list):
        raise VerificationError("materialized document has no blocks")

    sourceTypes = [block.get("sourceType") for block in blocks if isinstance(block, dict)]
    expectedFlow = [
        "section",
        "sectionContract:explanation",
        "sectionContract:snippet",
        "sectionContract:exercise",
        "sectionContract:check",
    ]
    for sourceType in expectedFlow:
        if sourceType not in sourceTypes:
            raise VerificationError(f"materialized document missing {sourceType}")
    sectionIndex = sourceTypes.index("section")
    if sourceTypes[sectionIndex:sectionIndex + len(expectedFlow)] != expectedFlow:
        raise VerificationError(f"materialized section flow is not contiguous: {sourceTypes}")

    runtime = document.get("runtime")
    packages = runtime.get("packages") if isinstance(runtime, dict) else None
    if packages != ["pandas"]:
        raise VerificationError(f"materialized runtime packages not preserved: {packages}")

    intro = next((block for block in blocks if isinstance(block, dict) and block.get("sourceType") == "intro"), None)
    introPayload = intro.get("payload") if isinstance(intro, dict) else None
    if not isinstance(introPayload, dict) or "learningContract" not in introPayload:
        raise VerificationError("materialized intro is missing learningContract payload")


def compactDocumentForBrowserStorage(document: dict[str, Any]) -> dict[str, Any]:
    blocks = document.get("blocks")
    if not isinstance(blocks, list):
        return document

    compactBlocks = [compactBlock(block) for block in blocks if isinstance(block, dict)]
    return {
        "id": document.get("id"),
        "title": document.get("title"),
        "blocks": compactBlocks,
        "metadata": {
            "sourceFormat": "curriculum",
            "tags": ["playwright", "structured-section-card"],
        },
        "runtime": document.get("runtime"),
        "app": document.get("app"),
    }


def compactBlock(block: dict[str, Any]) -> dict[str, Any]:
    result = {
        key: block.get(key)
        for key in (
            "id",
            "type",
            "content",
            "role",
            "executionKind",
            "displayKind",
            "sourceType",
            "title",
            "description",
            "guide",
        )
        if block.get(key) not in (None, "", [], {})
    }
    payload = compactBlockPayload(block)
    if payload:
        result["payload"] = payload
    return result


def compactBlockPayload(block: dict[str, Any]) -> dict[str, Any] | None:
    payload = block.get("payload")
    if not isinstance(payload, dict):
        return None

    if block.get("sourceType") == "intro":
        contract = payload.get("learningContract")
        compactContract = compactLearningContract(contract) if isinstance(contract, dict) else None
        return {
            key: value
            for key, value in {
                "title": payload.get("title"),
                "direction": payload.get("direction"),
                "benefits": payload.get("benefits"),
                "diagram": payload.get("diagram"),
                "learningContract": compactContract,
            }.items()
            if value not in (None, "", [], {})
        }

    if block.get("sourceType") == "section":
        contract = payload.get("sectionContract")
        compactContract = compactSectionContract(contract) if isinstance(contract, dict) else None
        return {
            key: value
            for key, value in {
                "title": payload.get("title"),
                "subtitle": payload.get("subtitle"),
                "id": payload.get("id"),
                "sectionContract": compactContract,
            }.items()
            if value not in (None, "", [], {})
        }

    if block.get("sourceType") == "sectionContract:check":
        return {
            key: value
            for key, value in {
                "check": payload.get("check"),
                "sectionId": payload.get("sectionId"),
            }.items()
            if value not in (None, "", [], {})
        }

    return None


def compactLearningContract(contract: dict[str, Any]) -> dict[str, Any]:
    intro = contract.get("intro") if isinstance(contract.get("intro"), dict) else {}
    meta = contract.get("meta") if isinstance(contract.get("meta"), dict) else {}
    return {
        "meta": {
            key: value
            for key, value in {
                "title": meta.get("title"),
                "packages": meta.get("packages"),
            }.items()
            if value not in (None, "", [], {})
        },
        "intro": {
            key: value
            for key, value in {
                "direction": intro.get("direction"),
                "benefits": intro.get("benefits"),
                "diagram": intro.get("diagram"),
            }.items()
            if value not in (None, "", [], {})
        },
    }


def compactSectionContract(contract: dict[str, Any]) -> dict[str, Any]:
    return {
        key: value
        for key, value in {
            "id": contract.get("id"),
            "title": contract.get("title"),
            "subtitle": contract.get("subtitle"),
            "goal": contract.get("goal"),
            "why": contract.get("why"),
            "explanation": contract.get("explanation"),
            "tips": contract.get("tips"),
        }.items()
        if value not in (None, "", [], {})
    }


def structuredLessonYaml() -> str:
    return f"""
meta:
  title: {FIXTURE_TITLE}
  audience: 초급
  difficulty: easy
  packages:
    - pandas
intro:
  direction: DataFrame 생성부터 직접 입력 실습과 검증까지 한 카드에서 확인합니다.
  benefits:
    - 작은 카드 반복 없이 섹션 흐름을 유지합니다.
  diagram:
    steps:
      - label: 목표
        detail: 무슨 공부
      - label: 스니펫
        detail: 따라 칠 코드
      - label: 실행
        detail: 입력과 검증
sections:
  - id: dataframe
    title: DataFrame 만들기
    subtitle: 행과 열의 감각
    goal: dict에서 DataFrame을 만드는 흐름을 익힙니다.
    why: 표 자동화의 첫 단계입니다.
    explanation: pandas.DataFrame은 열 이름과 값 목록으로 표를 만듭니다.
    tips:
      - 모든 열의 길이는 같아야 합니다.
    snippet: |
      import pandas as pd
      frame = pd.DataFrame({{'sales': [10, 20]}})
      frame
    exercise:
      prompt: sales 열을 가진 DataFrame을 직접 만드세요.
      starterCode: |
        import pandas as pd
        frame = ___
      solution: |
        import pandas as pd
        frame = pd.DataFrame({{'sales': [10, 20]}})
      check:
        variable: frame
      hints:
        - dict의 key가 열 이름입니다.
      difficulty: easy
    check:
      variable: frame
""".strip()


def jsTextPresent(text: str) -> str:
    return f"document.body.innerText.includes({json.dumps(text, ensure_ascii=False)})"


def jsClickCustomCurriculum() -> str:
    return compactJs(f"""
(() => {{
  const button = Array.from(document.querySelectorAll('button')).find((item) =>
    (item.textContent || '').includes({json.dumps(FIXTURE_TITLE, ensure_ascii=False)})
  );
  if (!button) throw new Error('custom curriculum button not found');
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  return true;
}})()
""")


def clickCustomCurriculum(cli: PlaywrightCli) -> None:
    try:
        cli.run("click", f"text={FIXTURE_TITLE}")
    except VerificationError:
        cli.eval(jsClickCustomCurriculum())


def jsReferenceLessonIdle() -> str:
    return "(!document.body.innerText.includes('불러오는 중') && !document.body.innerText.includes('레슨 불러오는 중'))"


def jsStructuredCardReady() -> str:
    return "Boolean(document.querySelector('[data-learning-section-card][data-learning-section-structured=\"true\"]'))"


def jsLearningOverviewReady() -> str:
    return "Boolean(document.querySelector('[data-learning-overview=\"true\"] [data-learning-flow-diagram=\"true\"]'))"


def jsAssertLearningOverview(viewport: str) -> str:
    return compactJs(f"""
(() => {{
  const overview = document.querySelector('[data-learning-overview="true"]');
  if (!overview) throw new Error('learning overview not found');
  const direction = overview.querySelector('[data-learning-overview-part="direction"]');
  if (!direction || !(direction.textContent || '').includes('DataFrame 생성부터 직접 입력 실습과 검증까지')) {{
    throw new Error('learning direction is missing or incorrect');
  }}
  const benefits = Array.from(overview.querySelectorAll('[data-learning-overview-part="benefit"]'));
  if (!benefits.some((item) => (item.textContent || '').includes('작은 카드 반복 없이 섹션 흐름'))) {{
    throw new Error('learning benefit is missing');
  }}
  const diagram = overview.querySelector('[data-learning-flow-diagram="true"]');
  if (!diagram || !(diagram.textContent || '').includes('학습 아키텍처')) {{
    throw new Error('learning architecture diagram is missing');
  }}
  const steps = Array.from(diagram.querySelectorAll('[data-learning-flow-step]')).map((item) =>
    item.getAttribute('data-learning-flow-step')
  );
  const requiredSteps = ['목표', '스니펫', '실행'];
  const missingSteps = requiredSteps.filter((step) => !steps.includes(step));
  if (missingSteps.length) throw new Error('missing learning flow steps: ' + missingSteps.join(', '));

  const overviewRect = overview.getBoundingClientRect();
  const diagramRect = diagram.getBoundingClientRect();
  if (overviewRect.width < Math.min(320, window.innerWidth - 24)) {{
    throw new Error('overview width is unexpectedly small: ' + overviewRect.width);
  }}
  if (diagramRect.width <= 0 || diagramRect.height <= 0) {{
    throw new Error('learning diagram has no visible size');
  }}
  if (diagramRect.left < overviewRect.left - 1 || diagramRect.right > overviewRect.right + 1) {{
    throw new Error('learning diagram escapes overview');
  }}

  const visibleBands = [direction, ...benefits, diagram].filter(Boolean).map((item) => item.getBoundingClientRect());
  visibleBands.forEach((rect, index) => {{
    if (rect.width <= 0 || rect.height <= 0) throw new Error('empty overview band at ' + index);
  }});
  for (let index = 1; index < visibleBands.length; index += 1) {{
    const previous = visibleBands[index - 1];
    const current = visibleBands[index];
    const sideBySide = Math.abs(previous.top - current.top) <= 2 && current.left >= previous.right - 1;
    const stacked = current.top >= previous.bottom - 1;
    if (!sideBySide && !stacked) {{
      throw new Error('overview content overlaps between ' + (index - 1) + ' and ' + index);
    }}
  }}

  return JSON.stringify({{
    viewport: {json.dumps(viewport)},
    title: (overview.querySelector('[data-learning-overview-part="title"]')?.textContent || '').trim(),
    benefitCount: benefits.length,
    steps,
  }});
}})()
""")


def jsAssertStructuredCard(viewport: str) -> str:
    return compactJs(f"""
(() => {{
  const card = document.querySelector('[data-learning-section-card][data-learning-section-structured="true"]');
  if (!card) throw new Error('structured learning section card not found');
  const parts = Array.from(card.querySelectorAll('[data-learning-section-part]')).map((item) =>
    item.getAttribute('data-learning-section-part')
  );
  const required = ['overview', 'snippet', 'exercise', 'result', 'check'];
  const missing = required.filter((part) => !parts.includes(part));
  if (missing.length) throw new Error('missing section parts: ' + missing.join(', '));

  const cardRect = card.getBoundingClientRect();
  if (cardRect.width < Math.min(320, window.innerWidth - 24)) {{
    throw new Error('card width is unexpectedly small: ' + cardRect.width);
  }}
  if (document.documentElement.scrollWidth > window.innerWidth + 2) {{
    throw new Error('horizontal overflow: ' + document.documentElement.scrollWidth + ' > ' + window.innerWidth);
  }}

  const bands = [
    card.querySelector(':scope > button'),
    card.querySelector(':scope > [data-learning-section-part="overview"]'),
    card.querySelector(':scope > div.divide-y > [data-learning-section-part="snippet"]'),
    card.querySelector(':scope > div.divide-y > [data-learning-section-part="exercise"]'),
    card.querySelector(':scope > div.divide-y > [data-learning-section-part="check"]'),
  ].filter(Boolean);
  if (bands.length !== 5) throw new Error('expected 5 visible section bands, found ' + bands.length);

  const rects = bands.map((item) => item.getBoundingClientRect());
  rects.forEach((rect, index) => {{
    if (rect.width <= 0 || rect.height <= 0) throw new Error('empty section band at ' + index);
    if (rect.left < cardRect.left - 1 || rect.right > cardRect.right + 1) {{
      throw new Error('section band escapes card at ' + index);
    }}
  }});
  for (let index = 1; index < rects.length; index += 1) {{
    if (rects[index].top < rects[index - 1].bottom - 1) {{
      throw new Error('section bands overlap between ' + (index - 1) + ' and ' + index);
    }}
  }}

  const exercise = card.querySelector('[data-learning-section-part="exercise"]');
  const result = card.querySelector('[data-learning-section-part="result"]');
  const exerciseRect = exercise.getBoundingClientRect();
  const resultRect = result.getBoundingClientRect();
  if (resultRect.top < exerciseRect.top || resultRect.bottom > exerciseRect.bottom + 1) {{
    throw new Error('result part is not inside the exercise flow');
  }}

  return JSON.stringify({{
    viewport: {json.dumps(viewport)},
    width: Math.round(cardRect.width),
    parts,
    bands: rects.length,
  }});
}})()
""")


def compactJs(source: str) -> str:
    return " ".join(line.strip() for line in source.strip().splitlines() if line.strip())


def debugPageState(cli: PlaywrightCli) -> str:
    try:
        return "DEBUG: " + cli.eval(
            "(() => { const storage = localStorage.getItem('codaro-custom-curricula') || ''; "
            "return JSON.stringify({hash: window.location.hash, title: document.title, "
            "bodyText: document.body.innerText.slice(0, 800), customStorage: storage.slice(0, 160), "
            "structuredCards: document.querySelectorAll('[data-learning-section-card][data-learning-section-structured=\"true\"]').length, "
            "cards: document.querySelectorAll('[data-learning-section-card]').length, "
            "buttons: Array.from(document.querySelectorAll('button')).map((button) => button.textContent.trim()).filter(Boolean).slice(0, 20)}); })()"
        )
    except VerificationError as exc:
        return f"DEBUG unavailable: {exc}"


if __name__ == "__main__":
    raise SystemExit(main())
