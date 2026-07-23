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

_TESTS_ROOT = Path(__file__).resolve().parents[1]
if str(_TESTS_ROOT) not in sys.path:
    sys.path.insert(0, str(_TESTS_ROOT))

from browserStaticServer import StaticAppServer  # noqa: E402
from codaro.curriculum.converter import yamlToDocument
from playwrightCli import (  # noqa: E402
    PlaywrightCli,
    PlaywrightCliError,
    repoLocalPlaywrightWorkspace,
    resolvePlaywrightCli,
    uniquePlaywrightSessionName,
)


ROOT = Path(__file__).resolve().parents[2]
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
        entryEditor = cli.eval(jsAssertLearningEntryEditor())
        domIds = cli.eval(jsAssertLearningDomIdIntegrity())
        desktopOverview = cli.eval(jsAssertLearningOverview("desktop"))
        desktopDependency = cli.eval(jsAssertNoInactiveDependencyPanel("desktop"))
        desktop = cli.eval(jsAssertStructuredCardLayout("desktop"))
        desktopControls = cli.eval(jsAssertStructuredCardControls("desktop"))
        desktopVisual = cli.eval(jsAssertLearningVisualIntegrity("desktop"))
        desktopContractGaps = cli.eval(jsAssertContractGapSignalHidden("desktop"))
        desktopFocus = cli.eval(jsAssertCurriculumFocusMode("desktop"))
        narrowToc = cli.eval(jsAssertTocHiddenAtNarrowWidth())
        surfacePurity = cli.eval(jsAssertLearningSurfacePurity())
        cli.run("resize", "1680", "900")
        toc = cli.eval(jsAssertTocPushRail())
        topControlLane = cli.eval(jsAssertTopControlLane())
        cli.run("resize", "390", "844")
        cli.waitEval(jsLearningOverviewReady(), "learning overview after mobile resize")
        cli.waitEval(jsStructuredCardReady(), "structured learning card after mobile resize")
        mobileOverview = cli.eval(jsAssertLearningOverview("mobile"))
        mobileDependency = cli.eval(jsAssertNoInactiveDependencyPanel("mobile"))
        mobile = cli.eval(jsAssertStructuredCardLayout("mobile"))
        mobileControls = cli.eval(jsAssertStructuredCardControls("mobile"))
        mobileVisual = cli.eval(jsAssertLearningVisualIntegrity("mobile"))
        mobileContractGaps = cli.eval(jsAssertContractGapSignalHidden("mobile"))
        mobileFocus = cli.eval(jsAssertCurriculumFocusMode("mobile"))
        print(
            "ok: Playwright structured learning card verified "
            f"{deleteDialog} {entryEditor} {domIds} {desktopOverview} {desktopDependency} {desktop} {desktopControls} {desktopVisual} {desktopContractGaps} "
            f"{desktopFocus} {narrowToc} {surfacePurity} {toc} {topControlLane} "
            f"{mobileOverview} {mobileDependency} {mobile} {mobileControls} {mobileVisual} {mobileContractGaps} {mobileFocus}"
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
    compact = compactDocumentForBrowserStorage(payload)
    blocks = compact.get("blocks")
    if isinstance(blocks, list):
        blocks.insert(1, {
            "id": "fallback-preamble",
            "type": "markdown",
            "content": "첫 섹션 전에 필요한 내용을 바로 확인합니다.",
            "role": "learning",
            "displayKind": "prose",
        })
    return compact


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
    return "Boolean(document.querySelector('[data-learning-overview=\"true\"] [data-learning-overview-part=\"learn-list\"]'))"


def jsAssertLearningOverview(viewport: str) -> str:
    return compactJs(f"""
(() => {{
  const overview = document.querySelector('[data-learning-overview="true"]');
  if (!overview) throw new Error('learning overview not found');
  const title = overview.querySelector('[data-learning-overview-part="title"]');
  if (!title || !(title.textContent || '').trim()) throw new Error('learning title is missing');
  const direction = overview.querySelector('[data-learning-overview-part="direction"]');
  if (!direction || !(direction.textContent || '').includes('DataFrame 생성부터 직접 입력 실습과 검증까지')) {{
    throw new Error('learning direction is missing or incorrect');
  }}
  const learnList = overview.querySelector('[data-learning-overview-part="learn-list"]');
  if (!learnList) throw new Error('learn list is missing');
  if (!(learnList.textContent || '').includes('오늘 배우는 것')) {{
    throw new Error('learn list heading is missing');
  }}
  const learnRows = Array.from(learnList.querySelectorAll('li'));
  if (learnRows.length < 1) throw new Error('learn list rows are missing');
  if (!(learnList.textContent || '').includes('DataFrame 만들기')) {{
    throw new Error('learn list should surface section titles');
  }}
  const redundantStartButton = overview.querySelector('[data-learning-overview-start="true"]');
  if (redundantStartButton) throw new Error('lesson content must not require a redundant start action');
  if (overview.querySelector('[data-learning-workflow-diagram="true"], [data-learning-workflow-step="true"]')) {{
    throw new Error('workflow diagram should be removed');
  }}
  if (overview.querySelector('[data-learning-overview-blueprint="true"], [data-learning-overview-rail="true"]')) {{
    throw new Error('blueprint texture and rail should be removed');
  }}
  if (overview.querySelector('[data-learning-overview-part="benefit"]')) {{
    throw new Error('benefits grid should be removed');
  }}
  const progressBadge = overview.querySelector('[data-progress-badge]');
  if (progressBadge) {{
    const progressTitle = progressBadge.getAttribute('title') || '';
    if (progressTitle.includes('/-') || (progressBadge.textContent || '').includes('/-')) {{
      throw new Error('lesson progress exposes an unknown denominator');
    }}
  }}
  if ((overview.textContent || '').includes('0/-')) {{
    throw new Error('incomplete lesson progress placeholder leaked into the learning overview');
  }}
  const litColor = /(emerald|rose|amber|violet|sky|orange|cyan|indigo|fuchsia|zinc|slate|gray)-[0-9]/;
  const surfaceRoots = [overview, ...Array.from(document.querySelectorAll('[data-learning-section-card]'))];
  for (const root of surfaceRoots) {{
    const offender = [root, ...Array.from(root.querySelectorAll('[class]'))]
      .find((item) => litColor.test(item.getAttribute('class') || ''));
    if (offender) throw new Error('literal color class in curriculum surface: ' + offender.getAttribute('class'));
  }}

  const overviewRect = overview.getBoundingClientRect();
  if (overviewRect.width < Math.min(320, window.innerWidth - 24)) {{
    throw new Error('overview width is unexpectedly small: ' + overviewRect.width);
  }}
  const visibleBands = [title, direction, learnList].filter(Boolean).map((item) => item.getBoundingClientRect());
  visibleBands.forEach((rect, index) => {{
    if (rect.width <= 0 || rect.height <= 0) throw new Error('empty overview band at ' + index);
    if (rect.left < overviewRect.left - 1 || rect.right > overviewRect.right + 1) {{
      throw new Error('overview band escapes overview at ' + index);
    }}
  }});

  return JSON.stringify({{
    viewport: {json.dumps(viewport)},
    title: (title.textContent || '').trim(),
    learnRows: learnRows.length,
    redundantStartButton: false,
  }});
}})()
""")


def jsAssertNoInactiveDependencyPanel(_viewport: str) -> str:
    return compactJs("""
(() => {
  const panel = document.querySelector('[data-learning-package-panel="true"]');
  if (panel) throw new Error('inactive package management must not interrupt Web learning');
  return 'inactive-dependency-hidden';
})()
""")


def jsAssertLearningEntryEditor() -> str:
    return compactJs("""
(() => {
  const pane = document.querySelector('[data-learning-content-pane="true"] [data-radix-scroll-area-viewport]');
  const overview = document.querySelector('[data-learning-overview="true"]');
  const input = document.querySelector('[data-learning-exercise-input="editor"]');
  const textbox = input?.querySelector('.cm-content[role="textbox"]');
  if (!pane || !overview || !input || !textbox) throw new Error('learning entry editor scope missing');
  if (document.activeElement === textbox || textbox.contains(document.activeElement)) {
    throw new Error('learning editor stole focus on lesson entry');
  }
  if (pane.scrollTop > 4) {
    throw new Error('lesson entry skipped overview: scrollTop=' + Math.round(pane.scrollTop));
  }
  const label = textbox.getAttribute('aria-label') || '';
  if (!label.includes('DataFrame 만들기') || !label.includes('직접 해보기 코드 편집기')) {
    throw new Error('actual CodeMirror textbox is missing a section/practice accessible name: ' + label);
  }
  if (input.hasAttribute('aria-label')) {
    throw new Error('accessible name must be attached to the textbox, not only its wrapper');
  }
  return 'entry-focus-and-editor-name-ok';
})()
""")


def jsAssertLearningDomIdIntegrity() -> str:
    return compactJs("""
(() => {
  const pane = document.querySelector('[data-learning-content-pane="true"]');
  if (!pane) throw new Error('learning pane missing');
  const elements = Array.from(pane.querySelectorAll('[id]'));
  const counts = new Map();
  elements.forEach((element) => counts.set(element.id, (counts.get(element.id) || 0) + 1));
  const duplicates = Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([id, count]) => `${id}:${count}`);
  if (duplicates.length) {
    throw new Error('duplicate learning DOM ids: ' + duplicates.join(', '));
  }
  const fallbackCard = pane.querySelector('[data-learning-section-card^="section-fallback-"]');
  if (!fallbackCard) throw new Error('fallback section render path missing');
  if (fallbackCard.id) throw new Error('fallback section wrapper must not compete for its first cell anchor');
  const fallbackAnchor = fallbackCard.querySelector('[data-learning-cell][id]');
  if (!fallbackAnchor) throw new Error('fallback section cell anchor missing');
  if (document.getElementById(fallbackAnchor.id) !== fallbackAnchor) {
    throw new Error('fallback cell anchor does not resolve uniquely');
  }
  return JSON.stringify({
    learningDomIds: elements.length,
    duplicateIds: duplicates.length,
    fallbackAnchor: fallbackAnchor.id,
  });
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
  const required = ['overview', 'snippet', 'exercise'];
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
    card.querySelector(':scope > header'),
    card.querySelector(':scope > [data-learning-section-part="overview"]'),
    card.querySelector('[data-learning-section-part="snippet"]'),
    card.querySelector('[data-learning-section-part="exercise"]'),
  ].filter(Boolean);
  if (bands.length !== 4) throw new Error('learning flow band count ' + bands.length);

  const header = bands[0];
  const sectionIndex = header.querySelector('[data-learning-section-index="true"]');
  const sectionHeading = header.querySelector('[data-learning-section-heading="true"]');
  if (!sectionIndex || !sectionHeading) throw new Error('header marker missing');
  const indexRect = sectionIndex.getBoundingClientRect();
  if (indexRect.width <= 0 || indexRect.height <= 0) throw new Error('section index invisible');

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
  const wait = () => new Promise((resolve) => setTimeout(resolve, 120));
  const visible = (element) => {{
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
  }};
  const itemTitle = {json.dumps(FIXTURE_TITLE)};
  const deleteButtons = () => [...document.querySelectorAll('button')]
    .find((button) => button.getAttribute('aria-label') === `${{itemTitle}} 삭제`);
  const hiddenManagement = deleteButtons();
  if (hiddenManagement) {{
    throw new Error('custom curriculum management must not exist in curriculum DOM');
  }}
  const escape = document.querySelector('[data-product-brand="escape"]');
  if (!visible(escape)) throw new Error('curriculum escape action missing');
  escape.click();
  await wait();
  const settings = document.querySelector('[data-product-appearance-settings="true"]');
  if (!visible(settings)) throw new Error('product settings unavailable outside curriculum');
  settings.click();
  await wait();
  const button = deleteButtons();
  if (!visible(button)) throw new Error('custom curriculum management missing from product settings');
  button.click();
  await wait();
  let dialog = document.querySelector('[role="dialog"]');
  if (!dialog) throw new Error('delete confirmation dialog missing');
  if (!dialog.contains(document.activeElement)) throw new Error('delete dialog did not receive focus');
  const appRoot = document.querySelector('#root');
  if (!appRoot || appRoot.getAttribute('aria-hidden') !== 'true') {{
    throw new Error('delete dialog did not hide the background application');
  }}
  settings.focus();
  await wait();
  if (!dialog.contains(document.activeElement)) throw new Error('delete dialog did not trap focus');
  if (!(dialog.textContent || '').includes('나만의 커리큘럼 삭제')) throw new Error('delete dialog title missing');
  if (!(dialog.textContent || '').includes(itemTitle)) throw new Error('delete dialog item title missing');
  const cancel = [...dialog.querySelectorAll('button')].find((item) => item.textContent?.trim() === '취소');
  if (!cancel) throw new Error('delete cancel button missing');
  cancel.click();
  await wait();
  if (document.querySelector('[role="dialog"]')) throw new Error('delete dialog did not close on cancel');
  const stored = JSON.parse(localStorage.getItem({json.dumps(STORAGE_KEY)}) || '[]');
  if (!stored.some((item) => item.id === 'custom-playwright-structured-section-card')) {{
    throw new Error('custom curriculum disappeared after cancel');
  }}
  const curriculumUrl = new URL(window.location.href);
  curriculumUrl.searchParams.delete('surface');
  curriculumUrl.hash = '#curriculum';
  window.history.pushState({{}}, '', curriculumUrl);
  window.dispatchEvent(new PopStateEvent('popstate'));
  await wait();
  return 'custom-curriculum-management-settings-ok';
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
  const snippetKicker = snippet.querySelector('[data-learning-snippet-kicker="true"]');
  if (!snippetKicker || !(snippetKicker.textContent || '').includes('예제')) {{
    throw new Error('snippet kicker missing');
  }}
  if (!(snippetBox.textContent || '').includes('코드')) {{
    throw new Error('snippet code label missing');
  }}
  const exerciseInput = exercise.querySelector('[data-learning-exercise-input="editor"][data-learning-exercise-input-role="student-practice"]');
  if (!exerciseInput) throw new Error('student practice input missing');
  if (!['ready', 'selected'].includes(exerciseInput.getAttribute('data-learning-exercise-input-state') || '')) {{
    throw new Error('student practice state missing');
  }}
  if (!(exercise.textContent || '').includes('직접 해보기')) {{
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
  const densityRoot = exerciseInput.querySelector('[data-code-editor-density="content-fit"]');
  if (!densityRoot) throw new Error('lesson editor must use content-fit density');
  const scroller = exerciseEditor.querySelector('.cm-scroller');
  if (!scroller) throw new Error('editor scroller missing');
  if (Number.parseFloat(getComputedStyle(scroller).maxHeight) > 352.5) {{
    throw new Error('lesson editor max height is not bounded');
  }}
  const content = exerciseEditor.querySelector('.cm-content');
  const lines = Array.from(exerciseEditor.querySelectorAll('.cm-line'));
  if (!content || !lines.length) throw new Error('editor content lines missing');
  if (!(content.getAttribute('aria-label') || '').includes('직접 해보기 코드 편집기')) {{
    throw new Error('actual student practice textbox aria label missing');
  }}
  const contentStyle = window.getComputedStyle(content);
  const lineHeight = Number.parseFloat(window.getComputedStyle(lines[0]).lineHeight);
  const contentAllowance =
    (Number.isFinite(lineHeight) ? lineHeight * lines.length : 24 * lines.length)
    + Number.parseFloat(contentStyle.paddingTop)
    + Number.parseFloat(contentStyle.paddingBottom)
    + 4;
  if (content.getBoundingClientRect().height > contentAllowance) {{
    throw new Error(
      'lesson editor reserves empty height: '
      + Math.round(content.getBoundingClientRect().height)
      + ' > '
      + Math.round(contentAllowance)
    );
  }}
  if ((exercise.textContent || '').includes('클릭해서 직접 입력하세요.')) {{
    throw new Error('preview remains');
  }}
  if (!(exerciseEditor.textContent || '').includes('frame = ___')) {{
    throw new Error('starter missing');
  }}
  if (exercise.querySelector('[data-cell-ai-help-trigger], [data-cell-ai-popover]')) {{
    throw new Error('manual AI controls must stay out of curriculum cells');
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
    manualAiControls: 0,
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
    '[data-learning-overview-part="learn-list"]',
    '[data-learning-section-index="true"]',
    '[data-learning-section-heading="true"]',
    '[data-code-payload-copy="true"]',
  ];
  for (const heading of card.querySelectorAll('h2, h3')) {{
    const style = getComputedStyle(heading);
    if (style.whiteSpace === 'nowrap' || style.textOverflow === 'ellipsis') {{
      throw new Error('learning heading is clipped instead of wrapping: ' + (heading.textContent || '').trim());
    }}
    if (heading.scrollWidth > heading.clientWidth + 2) {{
      throw new Error('learning heading horizontal overflow: ' + (heading.textContent || '').trim());
    }}
  }}
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
(async () => {
  const wait = () => new Promise((resolve) => setTimeout(resolve, 220));
  const overlapX = (left, right) => Math.min(left.right, right.right) - Math.max(left.left, right.left);
  const assertNoContentOverlap = (tocRect, phase) => {
    const pane = document.querySelector('[data-learning-content-pane="true"]');
    if (!pane) throw new Error('learning content pane missing');
    const paneRect = pane.getBoundingClientRect();
    if (overlapX(tocRect, paneRect) > 1) {
      throw new Error(`push TOC overlaps lesson content during ${phase}`);
    }
  };
  const toc = document.querySelector('[data-learning-toc="push"]');
  if (!toc) throw new Error('push TOC marker is missing');
  let rect = toc.getBoundingClientRect();
  if (rect.width < 47 || rect.width > 49) {
    throw new Error('push TOC should render as a stable 48px rail, width=' + rect.width);
  }
  assertNoContentOverlap(rect, 'collapsed state');
  const buttons = Array.from(toc.querySelectorAll('button[title]'));
  if (!buttons.length) throw new Error('push TOC has no cell buttons');
  const sectionCards = Array.from(document.querySelectorAll('[data-learning-section-card]'));
  if (buttons.length !== sectionCards.length) {
    throw new Error('push TOC must have exactly one item per section');
  }
  const labels = buttons.map((button) => button.getAttribute('title') || '');
  const uniqueLabels = new Set(labels);
  if (uniqueLabels.size !== labels.length) {
    throw new Error('push TOC duplicates cell buttons/icons');
  }
  if (toc.querySelector('.absolute.right-full')) {
    throw new Error('push TOC still uses an overlay flyout');
  }
  buttons.forEach((button, index) => {
    const expectedIndex = String(index + 1).padStart(2, '0');
    if (button.getAttribute('data-learning-toc-section-index') !== expectedIndex) {
      throw new Error('push TOC section index mismatch');
    }
    if (button.querySelector('svg')) {
      throw new Error('push TOC section item must use its number instead of a generic type icon');
    }
  });

  toc.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  await wait();
  rect = toc.getBoundingClientRect();
  if (toc.getAttribute('data-learning-toc-expanded') !== 'true' || rect.width < 287 || rect.width > 289) {
    throw new Error('hover must expand the in-flow TOC to 288px, width=' + rect.width);
  }
  assertNoContentOverlap(rect, 'hover expansion');
  const label = buttons[0].querySelector('span:last-child');
  if (!label || Number(getComputedStyle(label).opacity) < 0.99 || buttons[0].getBoundingClientRect().width < 250) {
    throw new Error('hover expansion does not reveal the section label in the full-width button');
  }
  toc.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }));
  await wait();
  if (toc.getBoundingClientRect().width < 47 || toc.getBoundingClientRect().width > 49) {
    throw new Error('TOC did not return to its stable collapsed width after hover');
  }

  buttons[0].focus();
  await wait();
  rect = toc.getBoundingClientRect();
  if (toc.getAttribute('data-learning-toc-expanded') !== 'true' || rect.width < 287) {
    throw new Error('keyboard focus did not expand the TOC');
  }
  assertNoContentOverlap(rect, 'focus expansion');
  if (Number(getComputedStyle(label).opacity) < 0.99 || buttons[0].getBoundingClientRect().width < 250) {
    throw new Error('keyboard focus expansion does not reveal the label');
  }
  buttons[0].blur();
  await wait();
  if (toc.getBoundingClientRect().width < 47 || toc.getBoundingClientRect().width > 49) {
    throw new Error('TOC did not collapse after keyboard focus left');
  }
  return JSON.stringify({ toc: 'in-flow', collapsed: 48, expanded: Math.round(rect.width), items: buttons.length });
})()
""")


def jsAssertTocHiddenAtNarrowWidth() -> str:
    return compactJs("""
(() => {
  const root = document.querySelector('[data-learning-lesson-ref]');
  const pane = document.querySelector('[data-learning-content-pane="true"]');
  const toc = document.querySelector('[data-learning-toc="push"]');
  if (!root || !pane || !toc) throw new Error('narrow TOC scope missing');
  const tocRect = toc.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const paneRect = pane.getBoundingClientRect();
  if (tocRect.width !== 0 || tocRect.height !== 0) {
    throw new Error('TOC must stay hidden below the 2xl breakpoint');
  }
  if (Math.abs(rootRect.width - paneRect.width) > 1) {
    throw new Error('hidden TOC still reserves lesson width');
  }
  return JSON.stringify({ toc: 'hidden-narrow', contentWidth: Math.round(paneRect.width) });
})()
""")


def jsAssertCurriculumFocusMode(viewport: str) -> str:
    return compactJs(f"""
(() => {{
  const shell = document.querySelector('[data-learning-focus-mode="true"]');
  const mobileSidebarClosed = innerWidth < 768 && !shell;
  if (!shell && !mobileSidebarClosed) throw new Error('curriculum focus mode marker missing');
  const visible = (element) => {{
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
  }};
  const forbidden = [
    ...document.querySelectorAll('[data-product-nav="flow"], [data-product-nav="utility"], [data-product-provider-settings="true"], [data-product-appearance-settings="true"], [data-cell-ai-help-trigger], [data-topbar-diagnostic="desktop"], [data-provider-reconnect-bar], [data-provider-card]'),
  ].filter(visible);
  if (forbidden.length) throw new Error('non-learning controls remain visible in curriculum focus mode');
  const brand = shell?.querySelector('[data-product-brand="escape"]');
  if (!mobileSidebarClosed && (!brand || !brand.getAttribute('aria-label') || !brand.getAttribute('title'))) {{
    throw new Error('focus mode needs one named product escape action');
  }}
  const pane = document.querySelector('[data-learning-content-pane="true"]');
  if (!pane) throw new Error('learning content pane missing in focus mode');
  if (pane.querySelector('[data-learning-archive-menu], [data-learning-evidence-summary]')) {{
    throw new Error('learning data management leaked into the learning surface');
  }}
  if (document.querySelector('[data-accent-palette], [data-product-learning-data-settings="true"]')) {{
    throw new Error('product settings must not remain in curriculum DOM');
  }}
  return JSON.stringify({{
    viewport: {json.dumps(viewport)},
    focusMode: true,
    sidebar: mobileSidebarClosed ? 'closed' : 'focused',
    visibleDistractions: forbidden.length,
  }});
}})()
""")


def jsAssertLearningSurfacePurity() -> str:
    return compactJs("""
(() => {
  const pane = document.querySelector('[data-learning-content-pane="true"]');
  if (!pane) throw new Error('learning pane missing');
  for (const selector of [
    '[data-learning-archive-menu]',
    '[data-learning-evidence-summary]',
    '[data-cell-ai-help-trigger]',
    '[data-cell-ai-popover]',
  ]) {
    if (pane.querySelector(selector)) throw new Error('non-learning UI leaked into lesson: ' + selector);
  }
  if (document.querySelector('[data-product-learning-data-settings="true"], [data-accent-palette]')) {
    throw new Error('product learning-data settings must not exist while learning');
  }
  return JSON.stringify({ learningSurface: 'focused', managementControls: 0, manualAiControls: 0 });
})()
""")


def jsAssertTopControlLane() -> str:
    return compactJs("""
(() => {
  const lane = document.querySelector('[data-top-control-lane="true"]');
  const lesson = document.querySelector('[data-learning-lesson-ref]');
  const toc = document.querySelector('[data-learning-toc="push"]');
  if (!lane || !lesson || !toc) throw new Error('top control lane scope is missing');
  const laneRect = lane.getBoundingClientRect();
  const lessonRect = lesson.getBoundingClientRect();
  const tocRect = toc.getBoundingClientRect();
  if (laneRect.height < 32 || laneRect.height > 44) {
    throw new Error('top control lane height is invalid: ' + laneRect.height);
  }
  if (lessonRect.top < laneRect.bottom - 1 || tocRect.top < laneRect.bottom - 1) {
    throw new Error('lesson surface or TOC overlaps the top control lane');
  }
  const controls = Array.from(lane.querySelectorAll('button, a'))
    .map((item) => item.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0);
  for (const control of controls) {
    if (control.top < laneRect.top - 1 || control.bottom > laneRect.bottom + 1) {
      throw new Error('top control escapes its reserved lane');
    }
    const overlapX = Math.min(control.right, tocRect.right) - Math.max(control.left, tocRect.left);
    const overlapY = Math.min(control.bottom, tocRect.bottom) - Math.max(control.top, tocRect.top);
    if (overlapX > 1 && overlapY > 1) {
      throw new Error('top control overlaps curriculum TOC');
    }
  }
  return JSON.stringify({
    topControlLane: Math.round(laneRect.height),
    lessonTop: Math.round(lessonRect.top),
    tocTop: Math.round(tocRect.top),
    controls: controls.length,
  });
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
