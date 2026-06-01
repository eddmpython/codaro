from __future__ import annotations

import argparse
import json
import os
import socket
import sys
import time
import urllib.request
from pathlib import Path
from typing import Any

import yaml

from browserStaticServer import StaticAppServer
from codaro.curriculum.converter import yamlToDocument
from playwrightCli import (
    PlaywrightCli,
    PlaywrightCliError,
    repoLocalPlaywrightWorkspace,
    resolvePlaywrightCli,
    uniquePlaywrightSessionName,
)


ROOT = Path(__file__).resolve().parents[1]
STORAGE_KEY = "codaro-custom-curricula"
FIXTURE_TITLE = "Playwright structured section card"


def main(argv: list[str] | None = None) -> int:
    args = buildParser().parse_args(argv)
    try:
        cliPath = resolvePlaywrightCli(ROOT)
    except PlaywrightCliError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1

    port = args.port or freePort()
    url = f"http://127.0.0.1:{port}/#curriculum"
    workspace = repoLocalPlaywrightWorkspace(ROOT, "learning-card-browser")
    session = uniquePlaywrightSessionName("codaro-learning-card")
    server = StaticAppServer(port=port)
    server.start()
    cli: PlaywrightCli | None = None

    try:
        waitForHttp(url)
        cli = PlaywrightCli(cliPath=cliPath, cwd=workspace, session=session)
        cli.run("open", url)
        cli.run("resize", "1280", "900")
        cli.run("localstorage-set", STORAGE_KEY, json.dumps([customCurriculumEntry()], ensure_ascii=False))
        cli.run("reload")
        cli.waitEval(jsTextPresent(FIXTURE_TITLE), "custom curriculum item")
        deleteDialog = cli.eval(jsAssertCustomCurriculumDeleteDialog())
        cli.run("localstorage-set", STORAGE_KEY, json.dumps([customCurriculumEntry()], ensure_ascii=False))
        cli.run("reload")
        cli.waitEval(jsTextPresent(FIXTURE_TITLE), "custom curriculum item after delete reset")
        cli.waitEval(jsReferenceLessonIdle(), "reference lesson loading to settle")
        clickCustomCurriculum(cli)
        cli.waitEval(jsStructuredCardReady(), "structured learning card")
        cli.waitEval(jsLearningOverviewReady(), "learning overview")
        desktopOverview = cli.eval(jsAssertLearningOverview("desktop"))
        desktopDependency = cli.eval(jsAssertDependencyPanel("desktop"))
        desktop = cli.eval(jsAssertStructuredCardLayout("desktop"))
        desktopControls = cli.eval(jsAssertStructuredCardControls("desktop"))
        desktopVisual = cli.eval(jsAssertLearningVisualIntegrity("desktop"))
        desktopContractGaps = cli.eval(jsAssertContractGapSignalHidden("desktop"))
        cli.run("resize", "1680", "900")
        toc = cli.eval(jsAssertTocPushRail())
        cli.run("resize", "390", "844")
        cli.waitEval(jsLearningOverviewReady(), "learning overview after mobile resize")
        cli.waitEval(jsStructuredCardReady(), "structured learning card after mobile resize")
        mobileOverview = cli.eval(jsAssertLearningOverview("mobile"))
        mobileDependency = cli.eval(jsAssertDependencyPanel("mobile"))
        mobile = cli.eval(jsAssertStructuredCardLayout("mobile"))
        mobileControls = cli.eval(jsAssertStructuredCardControls("mobile"))
        mobileVisual = cli.eval(jsAssertLearningVisualIntegrity("mobile"))
        mobileContractGaps = cli.eval(jsAssertContractGapSignalHidden("mobile"))
        print(
            "ok: Playwright structured learning card verified "
            f"{deleteDialog} {desktopOverview} {desktopDependency} {desktop} {desktopControls} {desktopVisual} {desktopContractGaps} "
            f"{toc} {mobileOverview} {mobileDependency} {mobile} {mobileControls} {mobileVisual} {mobileContractGaps}"
        )
        return 0
    except (VerificationError, PlaywrightCliError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        if cli is not None:
            print(debugPageState(cli), file=sys.stderr)
        return 1
    finally:
        if cli is not None:
            cli.close()
        server.stop()


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Verify structured learning card rendering with Playwright CLI")
    parser.add_argument("--port", type=int, default=0)
    return parser


class VerificationError(RuntimeError):
    pass


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
    gapSections = [
        block
        for block in blocks
        if isinstance(block, dict)
        and block.get("sourceType") == "section"
        and isinstance(block.get("payload"), dict)
        and isinstance(block["payload"].get("sectionContract"), dict)
        and block["payload"]["sectionContract"].get("title") == "부분 구조화 섹션"
    ]
    if not gapSections:
        raise VerificationError("materialized document missing partial contract gap section")
    gapContract = gapSections[0]["payload"]["sectionContract"]
    gaps = gapContract.get("contractGaps")
    if not isinstance(gaps, list) or "snippet" not in gaps or "exercise.starterCode" not in gaps:
        raise VerificationError(f"partial contract gaps not preserved: {gaps}")

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

    compactBlocks = []
    for index, block in enumerate(block for block in blocks if isinstance(block, dict)):
        compact = compactBlock(block)
        compact["id"] = f"b{index}"
        compactBlocks.append(compact)
    return {
        "id": document.get("id"),
        "title": document.get("title"),
        "blocks": compactBlocks,
        "runtime": document.get("runtime"),
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
                "sectionContractGaps": payload.get("sectionContractGaps"),
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
            "contractGaps": contract.get("contractGaps"),
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
      - label: DataFrame 입력 확인
        detail: sales 열과 행 값을 먼저 고정합니다.
      - label: DataFrame 처리 실행
        detail: pandas 생성 코드를 실행해 중간 결과를 확인합니다.
      - label: sales 결과 검증
        detail: 행/열 수와 요약값 기준으로 실행 결과를 비교합니다.
    runtime:
      - label: pandas 환경
        detail: pandas 기준으로 로컬 Python 실행을 준비합니다.
      - label: DataFrame 실행
        detail: 셀을 실행해 출력, 변수, 예외 상태를 확인합니다.
      - label: DataFrame 완료
        detail: 검증된 코드를 데이터 리포트 자동화로 남깁니다.
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
  - id: partial-contract
    title: 부분 구조화 섹션
    goal: goal만 있는 새 YAML 초안은 누락 필드를 카드에서 보여줍니다.
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
    return "Boolean(document.querySelector('[data-learning-overview=\"true\"] [data-learning-workflow-diagram=\"true\"]'))"


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
  const diagram = overview.querySelector('[data-learning-workflow-diagram="true"]');
  if (!diagram || !(diagram.textContent || '').includes('실무 흐름')) {{
    throw new Error('workflow diagram is missing');
  }}
  if ((diagram.textContent || '').includes('학습 아키텍처')) {{
    throw new Error('old generic architecture label remains');
  }}
  if (!overview.querySelector('[data-learning-overview-blueprint="true"]')) {{
    throw new Error('learning overview blueprint texture is missing');
  }}
  if (!overview.querySelector('[data-learning-overview-rail="true"]')) {{
    throw new Error('learning overview rail is missing');
  }}
  const steps = Array.from(diagram.querySelectorAll('[data-learning-workflow-step="true"]'));
  if (steps.length < 3) throw new Error('workflow steps are missing');
  const workflowText = diagram.textContent || '';
  const requiredSteps = ['DataFrame 입력 확인', 'DataFrame 처리 실행', 'sales 결과 검증'];
  const missingSteps = requiredSteps.filter((step) => !workflowText.includes(step));
  if (missingSteps.length) throw new Error('missing workflow steps: ' + missingSteps.join(', '));
  ['목표', '스니펫', '실행'].forEach((genericStep) => {{
    if (steps.some((step) => (step.textContent || '').trim() === genericStep)) {{
      throw new Error('generic workflow step rendered: ' + genericStep);
    }}
  }});

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

  return JSON.stringify({{
    viewport: {json.dumps(viewport)},
    title: (overview.querySelector('[data-learning-overview-part="title"]')?.textContent || '').trim(),
    benefitCount: benefits.length,
    steps: steps.length,
  }});
}})()
""")


def jsAssertDependencyPanel(viewport: str) -> str:
    return compactJs("""
(() => {
  const panel = document.querySelector('[data-learning-package-panel="true"]');
  if (!panel) throw new Error('learning package panel missing');
  const status = panel.getAttribute('data-learning-package-status');
  if (!['checking', 'missing', 'ready', 'error'].includes(status || '')) {
    throw new Error('unexpected package panel status: ' + status);
  }
  const installButton = panel.querySelector('[data-learning-package-install="true"]');
  if (!installButton) throw new Error('package install action missing');
  const commandRow = panel.querySelector('[data-learning-package-command-row="true"]');
  if (!commandRow) throw new Error('package terminal command row missing');
  const commandText = commandRow.querySelector('[data-learning-package-command="true"]');
  if (!commandText) throw new Error('package terminal command text missing');
  const terminalButton = commandRow.querySelector('[data-learning-package-terminal-open="true"]');
  if (!terminalButton) throw new Error('package terminal open action missing');
  const item = panel.querySelector('[data-learning-package-item="pandas"]');
  if (!item) throw new Error('pandas package badge missing');
  if (!item.hasAttribute('data-learning-package-installed')) {
    throw new Error('package installed marker missing');
  }
  const text = panel.textContent || '';
  if (!text.includes('라이브러리') || !text.includes('uv로 준비') || !text.includes('터미널 열기')) {
    throw new Error('package panel copy missing');
  }
  return 'dependency-panel-ok';
})()
""")


def jsAssertStructuredCardLayout(viewport: str) -> str:
    return compactJs(f"""
(() => {{
  const card = document.querySelector('[data-learning-section-card][data-learning-section-structured="true"]');
  if (!card) throw new Error('card missing');
  const parts = Array.from(card.querySelectorAll('[data-learning-section-part]')).map((item) =>
    item.getAttribute('data-learning-section-part')
  );
  const required = ['overview', 'snippet', 'exercise', 'check'];
  const missing = required.filter((part) => !parts.includes(part));
  if (missing.length) throw new Error('missing parts: ' + missing.join(', '));
  if (parts.includes('result')) throw new Error('empty result part should stay hidden before execution');

  const cardRect = card.getBoundingClientRect();
  if (cardRect.width < Math.min(320, window.innerWidth - 24)) {{
    throw new Error('small card width');
  }}
  if (document.documentElement.scrollWidth > window.innerWidth + 2) {{
    throw new Error('horizontal overflow');
  }}

  const bands = [
    card.querySelector(':scope > button'),
    card.querySelector(':scope > [data-learning-section-part="overview"]'),
    card.querySelector(':scope > div.divide-y > [data-learning-section-part="snippet"]'),
    card.querySelector(':scope > div.divide-y > [data-learning-section-part="exercise"]'),
    card.querySelector(':scope > div.divide-y > [data-learning-section-part="check"]'),
  ].filter(Boolean);
  if (bands.length !== 5) throw new Error('band count ' + bands.length);

  const header = bands[0];
  const sectionIndex = header.querySelector('[data-learning-section-index="true"]');
  const sectionHeading = header.querySelector('[data-learning-section-heading="true"]');
  if (!sectionIndex || !sectionHeading) throw new Error('header marker missing');
  const indexRect = sectionIndex.getBoundingClientRect();
  const headingRect = sectionHeading.getBoundingClientRect();
  if (Math.abs(indexRect.height - headingRect.height) > 2) {{
    throw new Error('index height mismatch');
  }}

  const rects = bands.map((item) => item.getBoundingClientRect());
  rects.forEach((rect, index) => {{
    if (rect.width <= 0 || rect.height <= 0) throw new Error('empty section band at ' + index);
    if (rect.left < cardRect.left - 1 || rect.right > cardRect.right + 1) {{
      throw new Error('band escapes card');
    }}
  }});
  for (let index = 1; index < rects.length; index += 1) {{
    if (rects[index].top < rects[index - 1].bottom - 1) {{
      throw new Error('band overlap');
    }}
  }}

  return JSON.stringify({{
    viewport: {json.dumps(viewport)},
    width: Math.round(cardRect.width),
    parts,
    bands: rects.length,
  }});
}})()
""")


def jsAssertCustomCurriculumDeleteDialog() -> str:
    return compactJs(f"""
(async () => {{
  const wait = () => new Promise((resolve) => setTimeout(resolve, 80));
  const itemTitle = {json.dumps(FIXTURE_TITLE)};
  const deleteButton = () => [...document.querySelectorAll('button')]
    .find((button) => button.getAttribute('aria-label') === `${{itemTitle}} 삭제`);
  let button = deleteButton();
  if (!button) throw new Error('custom curriculum delete button missing');
  button.click();
  await wait();
  let dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
  if (!dialog) throw new Error('delete confirmation dialog missing');
  if (!(dialog.textContent || '').includes('나만의 커리큘럼 삭제')) throw new Error('delete dialog title missing');
  if (!(dialog.textContent || '').includes(itemTitle)) throw new Error('delete dialog item title missing');
  const cancel = [...dialog.querySelectorAll('button')].find((item) => item.textContent?.trim() === '취소');
  if (!cancel) throw new Error('delete cancel button missing');
  cancel.click();
  await wait();
  if (document.querySelector('[role="dialog"][aria-modal="true"]')) throw new Error('delete dialog did not close on cancel');
  if (!deleteButton()) throw new Error('custom curriculum disappeared after cancel');
  button = deleteButton();
  button.click();
  await wait();
  dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
  if (!dialog) throw new Error('delete confirmation dialog missing after reopen');
  const confirm = [...dialog.querySelectorAll('button')].find((item) => item.textContent?.trim() === '삭제');
  if (!confirm) throw new Error('delete confirm button missing');
  confirm.click();
  await wait();
  if (deleteButton()) throw new Error('custom curriculum still visible after delete');
  const stored = JSON.parse(localStorage.getItem({json.dumps(STORAGE_KEY)}) || '[]');
  if (stored.some((item) => item.id === 'custom-playwright-structured-section-card')) {{
    throw new Error('custom curriculum remained in storage');
  }}
  return 'custom-curriculum-delete-dialog-ok';
}})()
""")


def jsAssertStructuredCardControls(viewport: str) -> str:
    return compactJs(f"""
(async () => {{
  const card = document.querySelector('[data-learning-section-card][data-learning-section-structured="true"]');
  if (!card) throw new Error('card missing');
  const exercise = card.querySelector('[data-learning-section-part="exercise"]');
  const snippet = card.querySelector('[data-learning-section-part="snippet"]');
  const snippetBox = snippet.querySelector('[data-code-payload="snippet"]');
  if (!snippetBox) throw new Error('snippet box missing');
  const copyButton = snippetBox.querySelector('[data-code-payload-copy="true"]');
  if (!copyButton) throw new Error('copy missing');
  if (!(snippet.textContent || '').includes('예제 스니펫')) {{
    throw new Error('snippet section label missing');
  }}
  if (!(snippetBox.textContent || '').includes('코드')) {{
    throw new Error('snippet code label missing');
  }}
  const exerciseInput = exercise.querySelector('[data-learning-exercise-input="editor"][data-learning-exercise-input-role="student-practice"]');
  if (!exerciseInput) throw new Error('student practice input missing');
  if (!['ready', 'selected'].includes(exerciseInput.getAttribute('data-learning-exercise-input-state') || '')) {{
    throw new Error('student practice state missing');
  }}
  if (!(exerciseInput.getAttribute('aria-label') || '').includes('직접 입력 실습 코드 편집기')) {{
    throw new Error('student practice aria label missing');
  }}
  if (!(exercise.textContent || '').includes('직접 입력 실습')) {{
    throw new Error('student practice section label missing');
  }}
  if ((exercise.textContent || '').includes('Python 실습 코드')) {{
    throw new Error('redundant practice code label leaked');
  }}
  if ((exercise.textContent || '').includes('학습자가 작성')) {{
    throw new Error('student authored badge leaked');
  }}
  if ((exercise.textContent || '').includes('Ctrl+Enter 실행')) {{
    throw new Error('keyboard shortcut badge leaked');
  }}
  const exerciseEditor = exerciseInput.querySelector('.cm-editor');
  if (!exerciseEditor) throw new Error('editor missing');
  const exerciseEditorRect = exerciseEditor.getBoundingClientRect();
  if (exerciseEditorRect.width <= 0 || exerciseEditorRect.height <= 0) {{
    throw new Error('editor size');
  }}
  if ((exercise.textContent || '').includes('클릭해서 직접 입력하세요.')) {{
    throw new Error('preview remains');
  }}
  if (!(exerciseEditor.textContent || '').includes('frame = ___')) {{
    throw new Error('starter missing');
  }}
  const helpButton = exercise.querySelector('button[aria-label="이 셀에서 AI 도움 요청"]');
  if (!helpButton) throw new Error('help missing');
  if (helpButton.getAttribute('data-cell-ai-help-trigger') !== 'always-visible') {{
    throw new Error('help marker');
  }}
  if (Number(window.getComputedStyle(helpButton).opacity) < 0.99) {{
    throw new Error('help hidden');
  }}
  let helpPopover = document.querySelector('[data-cell-ai-popover="true"]');
  if (!helpPopover) {{
    helpButton.click();
    await new Promise((resolve) => setTimeout(resolve, 60));
    helpPopover = document.querySelector('[data-cell-ai-popover="true"]');
  }}
  if (!helpPopover) throw new Error('popover missing');
  if (!helpPopover.querySelector('[data-cell-ai-question="true"]')) {{
    throw new Error('question missing');
  }}
  if (!(helpPopover.textContent || '').includes('이 셀에서 바로 질문')) {{
    throw new Error('popover title missing');
  }}
  const exerciseRect = exercise.getBoundingClientRect();
  if (exerciseEditorRect.left < exerciseRect.left - 1 || exerciseEditorRect.right > exerciseRect.right + 1) {{
    throw new Error('editor escapes');
  }}
  if (card.querySelector('[data-learning-section-part="result"]')) {{
    throw new Error('result should be hidden before execution');
  }}

  return JSON.stringify({{
    viewport: {json.dumps(viewport)},
    directEditor: true,
    snippetCopy: true,
    helpVisible: true,
  }});
}})()
""")


def jsAssertLearningVisualIntegrity(viewport: str) -> str:
    return compactJs(f"""
(() => {{
  const overview = document.querySelector('[data-learning-overview="true"]');
  const card = document.querySelector('[data-learning-section-card][data-learning-section-structured="true"]');
  if (!overview || !card) throw new Error('visual integrity scope missing');
  if (document.documentElement.scrollWidth > window.innerWidth + 2) {{
    throw new Error('page horizontal overflow');
  }}

  const checked = [];
  const selectors = [
    '[data-learning-overview-part="title"]',
    '[data-learning-overview-part="direction"]',
    '[data-learning-overview-part="benefit"]',
    '[data-learning-workflow-step="true"]',
    '[data-learning-section-index="true"]',
    '[data-learning-section-heading="true"]',
    '[data-code-payload-copy="true"]',
    '[data-cell-ai-help-trigger="always-visible"]',
  ];
  for (const root of [overview, card]) {{
    const rootRect = root.getBoundingClientRect();
    selectors.forEach((selector) => {{
      Array.from(root.querySelectorAll(selector)).forEach((item) => {{
        if (item.closest('[data-cell-ai-popover="true"]')) return;
        const rect = item.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {{
          throw new Error('empty visual element: ' + selector);
        }}
        if (rect.left < rootRect.left - 2 || rect.right > rootRect.right + 2) {{
          throw new Error('visual element escapes root: ' + selector);
        }}
        if (item instanceof HTMLElement && item.tagName === 'BUTTON' && item.scrollWidth > item.clientWidth + 2) {{
          throw new Error('button text overflow: ' + (item.textContent || '').trim());
        }}
        checked.push(selector);
      }});
    }});
  }}

  const controlRects = Array.from(new Set(Array.from(card.querySelectorAll('button, [data-code-payload-copy="true"]'))))
    .filter((item) => !item.closest('[data-cell-ai-popover="true"]'))
    .map((item) => ({{ text: (item.textContent || item.getAttribute('aria-label') || '').trim(), rect: item.getBoundingClientRect() }}))
    .filter((item) => item.rect.width > 0 && item.rect.height > 0);
  for (let outer = 0; outer < controlRects.length; outer += 1) {{
    for (let inner = outer + 1; inner < controlRects.length; inner += 1) {{
      const a = controlRects[outer].rect;
      const b = controlRects[inner].rect;
      const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (overlapX > 1 && overlapY > 1) {{
        throw new Error('control overlap: ' + controlRects[outer].text + ' / ' + controlRects[inner].text);
      }}
    }}
  }}

  return JSON.stringify({{
    viewport: {json.dumps(viewport)},
    visualIntegrity: true,
    checked: checked.length,
    controls: controlRects.length,
  }});
}})()
""")


def jsAssertContractGapSignalHidden(viewport: str) -> str:
    return compactJs(f"""
(() => {{
  const cards = Array.from(document.querySelectorAll('[data-learning-section-card]'));
  const gapCard = cards.find((item) => (item.textContent || '').includes('부분 구조화 섹션'));
  if (!gapCard) throw new Error('contract gap section card missing');
  const warning = gapCard.querySelector('[data-learning-section-contract-gaps="true"]');
  if (warning) throw new Error('contract gap warning should stay out of product UI');
  const pageText = document.body.textContent || '';
  if (pageText.includes('YAML 계약 보강 필요')) {{
    throw new Error('internal contract gap copy leaked into product UI');
  }}
  const cardRect = gapCard.getBoundingClientRect();
  if (cardRect.width <= 0 || cardRect.height <= 0) throw new Error('contract gap card has no size');
  return JSON.stringify({{
    viewport: {json.dumps(viewport)},
    contractGapSignal: 'hidden',
  }});
}})()
""")


def jsAssertTocPushRail() -> str:
    return compactJs("""
(() => {
  const toc = document.querySelector('[data-learning-toc="push"]');
  if (!toc) throw new Error('push TOC marker is missing');
  const rect = toc.getBoundingClientRect();
  if (rect.width <= 0 || rect.width > 64) {
    throw new Error('push TOC should render as one collapsed rail, width=' + rect.width);
  }
  const buttons = Array.from(toc.querySelectorAll('button[title]'));
  if (!buttons.length) throw new Error('push TOC has no cell buttons');
  const labels = buttons.map((button) => button.getAttribute('title') || '');
  const uniqueLabels = new Set(labels);
  if (uniqueLabels.size !== labels.length) {
    throw new Error('push TOC duplicates cell buttons/icons');
  }
  if (toc.querySelector('.absolute.right-full')) {
    throw new Error('push TOC still uses an overlay flyout');
  }
  return JSON.stringify({ toc: 'push', width: Math.round(rect.width), items: buttons.length });
})()
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
