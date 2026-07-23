var e=`meta:
  id: playwright_09
  title: 트레이스와 디버깅
  order: 9
  category: playwright
  difficulty: medium
  audience: Python 기본 문법을 익힌 자동화 입문자
  packages:
    - playwright
  tags:
    - playwright
    - trace
    - debugging
    - evidence
intro:
  direction: 콘솔 로그, trace zip, 실패 스크린샷을 모아 브라우저 자동화 실패 원인을 설명 가능한 증거로 바꾼다.
  benefits:
    - 화면 실패를 "안 됨"이 아니라 콘솔, trace, screenshot 증거로 분해할 수 있다.
    - trace 파일과 스크린샷을 scratch 경로에 저장하는 습관을 익힌다.
    - 실패를 일부러 만들고 잡아내는 디버깅 루틴을 연습한다.
  diagram:
    steps:
      - label: 브라우저 콘솔 수집
        detail: page.on("console")로 화면 안 JavaScript 로그를 Python 리스트에 모읍니다.
      - label: trace 기록 시작
        detail: context.tracing.start로 스냅샷과 스크린샷을 기록합니다.
      - label: 실패 증거 저장
        detail: 검증 실패를 잡아낸 뒤 현재 화면을 screenshot으로 남깁니다.
      - label: 디버깅 리포트 완성
        detail: 수집한 로그, trace, screenshot 파일 존재 여부를 딕셔너리로 정리합니다.
    runtime:
      - label: Playwright trace API 실행
        detail: context.tracing.start/stop이 Chromium context에서 동작해야 합니다.
      - label: scratch 산출물 저장
        detail: trace zip과 screenshot은 CODARO_PLAYWRIGHT_OUTPUT_DIR 또는 OS temp 아래에만 저장합니다.
      - label: 실패 원인 assert
        detail: 실패를 잡는 코드도 최종 assert로 증거 생성 여부를 검증합니다.
sections:
  - id: console-capture
    title: 콘솔 로그 수집
    structuredPrimary: true
    subtitle: page.on("console")
    goal: 브라우저 안 JavaScript console.log 메시지를 Python 리스트로 수집한다.
    why: 화면이 기대대로 바뀌지 않을 때 콘솔 메시지는 프런트 코드가 어떤 상태를 지나갔는지 알려준다.
    explanation: Playwright는 page.on 이벤트로 브라우저에서 발생하는 콘솔 메시지를 받을 수 있습니다. 테스트 HTML 안에서 console.log를 실행하고 Python 리스트에 text 값을 저장하면, 화면 밖의 내부 신호까지 검증할 수 있습니다.
    tips:
      - 이벤트 핸들러는 console.log가 발생하기 전에 등록합니다.
      - 수집한 로그는 너무 길게 저장하지 말고 실패 분석에 필요한 키워드만 확인합니다.
    snippet: |-
      from playwright.sync_api import sync_playwright

      messages = []

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.on("console", lambda message: messages.append(message.text))
          page.set_content("<script>console.log('dashboard ready')<\/script>")
          browser.close()

      assert messages == ["dashboard ready"]
      messages
    exercise:
      prompt: console.log 메시지를 "orders loaded"로 바꾸고 수집 결과를 검증하세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright

        messages = []

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.on("console", lambda message: messages.append(message.text))
            page.set_content("<script>console.log('___')<\/script>")
            browser.close()

        assert messages == ["orders loaded"]
        messages
      solution: |-
        from playwright.sync_api import sync_playwright

        messages = []

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.on("console", lambda message: messages.append(message.text))
            page.set_content("<script>console.log('orders loaded')<\/script>")
            browser.close()

        assert messages == ["orders loaded"]
        messages
      hints:
        - console.log 문자열과 assert 리스트의 문자열을 같게 맞추세요.
        - page.on 등록은 set_content보다 앞에 있어야 합니다.
    check:
      noError: console 이벤트 등록과 set_content 실행이 오류 없이 끝나야 합니다.
      resultCheck: messages 리스트에 바꾼 콘솔 메시지가 정확히 하나 들어 있어야 합니다.
  - id: trace-file
    title: trace 파일 저장
    structuredPrimary: true
    subtitle: context.tracing
    goal: Playwright trace를 scratch zip 파일로 저장하고 파일 크기를 검증한다.
    why: trace는 클릭 전후 DOM, 네트워크, 스크린샷을 함께 담아 실패 재현 시간을 줄인다.
    explanation: trace는 browser context 단위로 시작하고 멈춥니다. snapshots와 screenshots 옵션을 켜면 나중에 trace viewer에서 화면 변화를 따라갈 수 있습니다. 학습에서는 trace 파일이 만들어졌는지만 확인하고, 저장 위치는 temp/scratch 아래로 제한합니다.
    tips:
      - trace start는 검증할 동작보다 앞에 둡니다.
      - trace 파일은 zip이라 저장 후 exists와 size를 함께 확인합니다.
    snippet: |-
      from pathlib import Path
      import os
      import tempfile
      from playwright.sync_api import sync_playwright

      outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-debug"
      outputDir.mkdir(parents=True, exist_ok=True)
      tracePath = outputDir / "dashboard-trace.zip"

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          context = browser.new_context()
          context.tracing.start(screenshots=True, snapshots=True)
          page = context.new_page()
          page.set_content("<main><h1>Trace target</h1><button>Save</button></main>")
          page.get_by_role("button", name="Save").click()
          context.tracing.stop(path=tracePath)
          browser.close()

      assert tracePath.exists()
      assert tracePath.stat().st_size > 0
      str(tracePath)
    exercise:
      prompt: trace 파일명을 orders-trace.zip으로 바꾸고 파일 저장 검증을 통과시키세요.
      starterCode: |-
        from pathlib import Path
        import os
        import tempfile
        from playwright.sync_api import sync_playwright

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-debug"
        outputDir.mkdir(parents=True, exist_ok=True)
        tracePath = outputDir / "___"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            context.tracing.start(screenshots=True, snapshots=True)
            page = context.new_page()
            page.set_content("<main><h1>Trace target</h1><button>Save</button></main>")
            page.get_by_role("button", name="Save").click()
            context.tracing.stop(path=tracePath)
            browser.close()

        assert tracePath.exists()
        assert tracePath.name == "orders-trace.zip"
        str(tracePath)
      solution: |-
        from pathlib import Path
        import os
        import tempfile
        from playwright.sync_api import sync_playwright

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-debug"
        outputDir.mkdir(parents=True, exist_ok=True)
        tracePath = outputDir / "orders-trace.zip"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            context.tracing.start(screenshots=True, snapshots=True)
            page = context.new_page()
            page.set_content("<main><h1>Trace target</h1><button>Save</button></main>")
            page.get_by_role("button", name="Save").click()
            context.tracing.stop(path=tracePath)
            browser.close()

        assert tracePath.exists()
        assert tracePath.name == "orders-trace.zip"
        str(tracePath)
      hints:
        - 파일명은 .zip으로 끝나야 trace viewer에서 다루기 쉽습니다.
        - path=tracePath 인자가 stop 호출에 들어 있어야 파일이 저장됩니다.
    check:
      noError: tracing.start와 tracing.stop(path=...)가 오류 없이 완료되어야 합니다.
      resultCheck: tracePath가 orders-trace.zip 파일을 가리키고 실제로 존재해야 합니다.
  - id: failure-screenshot
    title: 실패 스크린샷 남기기
    structuredPrimary: true
    subtitle: AssertionError 처리
    goal: 의도적으로 실패하는 expect를 잡고 현재 화면 screenshot을 저장한다.
    why: 실패 순간 화면이 남아 있으면 로그만으로 알 수 없는 UI 상태를 빠르게 확인할 수 있다.
    explanation: 자동화에서 실패를 무조건 숨기면 안 됩니다. 여기서는 학습을 위해 AssertionError를 잡고 스크린샷을 저장한 뒤, 오류 메시지와 파일 존재 여부를 함께 검증합니다. 실제 테스트에서는 스크린샷을 남긴 뒤 예외를 다시 발생시키는 방식도 사용할 수 있습니다.
    tips:
      - 실패 증거를 저장한 뒤에는 오류가 있었다는 사실도 별도 값으로 남깁니다.
      - screenshot 파일은 반복 실행해도 덮어쓸 수 있는 scratch 경로에 둡니다.
    snippet: |-
      from pathlib import Path
      import os
      import tempfile
      from playwright.sync_api import sync_playwright, expect

      outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-debug"
      outputDir.mkdir(parents=True, exist_ok=True)
      screenshotPath = outputDir / "failed-status.png"
      errorText = ""

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content("<p data-testid='status'>지연</p>")
          try:
              expect(page.get_by_test_id("status")).to_have_text("정상", timeout=200)
          except AssertionError as exc:
              errorText = str(exc)
              page.screenshot(path=screenshotPath)
          browser.close()

      assert screenshotPath.exists()
      assert "정상" in errorText
      {"screenshot": screenshotPath.name, "captured": True}
    exercise:
      prompt: 실패 스크린샷 파일명을 failed-order.png로 바꾸고 증거 저장을 확인하세요.
      starterCode: |-
        from pathlib import Path
        import os
        import tempfile
        from playwright.sync_api import sync_playwright, expect

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-debug"
        outputDir.mkdir(parents=True, exist_ok=True)
        screenshotPath = outputDir / "___"
        errorText = ""

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content("<p data-testid='status'>지연</p>")
            try:
                expect(page.get_by_test_id("status")).to_have_text("정상", timeout=200)
            except AssertionError as exc:
                errorText = str(exc)
                page.screenshot(path=screenshotPath)
            browser.close()

        assert screenshotPath.exists()
        assert screenshotPath.name == "failed-order.png"
        assert "정상" in errorText
        {"screenshot": screenshotPath.name, "captured": True}
      solution: |-
        from pathlib import Path
        import os
        import tempfile
        from playwright.sync_api import sync_playwright, expect

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-debug"
        outputDir.mkdir(parents=True, exist_ok=True)
        screenshotPath = outputDir / "failed-order.png"
        errorText = ""

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content("<p data-testid='status'>지연</p>")
            try:
                expect(page.get_by_test_id("status")).to_have_text("정상", timeout=200)
            except AssertionError as exc:
                errorText = str(exc)
                page.screenshot(path=screenshotPath)
            browser.close()

        assert screenshotPath.exists()
        assert screenshotPath.name == "failed-order.png"
        assert "정상" in errorText
        {"screenshot": screenshotPath.name, "captured": True}
      hints:
        - screenshotPath 파일명과 assert의 파일명을 같게 맞추세요.
        - except 블록이 실행되어야 screenshot 파일이 생깁니다.
    check:
      noError: 실패 expect를 잡고 screenshot 저장까지 실패 원인과 증거 경로를 남겨야 합니다.
      resultCheck: failed-order.png 파일이 존재하고 errorText에 기대 문자열이 포함되어야 합니다.
  - id: debug-report-completion
    title: 디버깅 리포트 완료
    structuredPrimary: true
    subtitle: 로그와 증거 묶기
    goal: 콘솔 로그, trace, screenshot 존재 여부를 completion 딕셔너리로 정리한다.
    why: 디버깅 산출물은 파일만 남기면 끝이 아니라 어떤 증거가 준비됐는지 구조화되어야 재사용된다.
    explanation: 마지막 섹션은 앞에서 배운 세 가지 증거를 하나의 리포트 형태로 묶습니다. 실제 프로젝트에서는 이 딕셔너리를 JSON으로 저장하거나 CI summary에 붙일 수 있습니다. 여기서는 파일 존재 여부와 로그 키워드를 assert로 고정합니다.
    tips:
      - 리포트에는 파일명과 boolean을 함께 넣으면 사람이 읽고 자동화도 판단하기 쉽습니다.
      - 완료 조건은 trace, screenshot, console 세 축이 모두 True가 되는 것입니다.
    snippet: |-
      debugReport = {
          "consoleMessages": ["dashboard ready"],
          "traceFile": "dashboard-trace.zip",
          "screenshotFile": "failed-status.png",
          "evidenceReady": True,
      }

      assert "dashboard ready" in debugReport["consoleMessages"]
      assert debugReport["traceFile"].endswith(".zip")
      assert debugReport["screenshotFile"].endswith(".png")
      assert debugReport["evidenceReady"] is True
      debugReport
    exercise:
      prompt: traceFile 값을 orders-trace.zip으로 바꾸고 완료 리포트 검증을 유지하세요.
      starterCode: |-
        debugReport = {
            "consoleMessages": ["orders loaded"],
            "traceFile": "___",
            "screenshotFile": "failed-order.png",
            "evidenceReady": True,
        }

        assert "orders loaded" in debugReport["consoleMessages"]
        assert debugReport["traceFile"] == "orders-trace.zip"
        assert debugReport["screenshotFile"].endswith(".png")
        assert debugReport["evidenceReady"] is True
        debugReport
      solution: |-
        debugReport = {
            "consoleMessages": ["orders loaded"],
            "traceFile": "orders-trace.zip",
            "screenshotFile": "failed-order.png",
            "evidenceReady": True,
        }

        assert "orders loaded" in debugReport["consoleMessages"]
        assert debugReport["traceFile"] == "orders-trace.zip"
        assert debugReport["screenshotFile"].endswith(".png")
        assert debugReport["evidenceReady"] is True
        debugReport
      hints:
        - traceFile은 앞 섹션에서 만든 파일명과 같은 문자열로 맞추세요.
        - evidenceReady는 모든 증거가 준비됐다는 최종 신호입니다.
    check:
      noError: debugReport 딕셔너리와 네 개의 assert가 trace, screenshot, message, status를 모두 확인해야 합니다.
      resultCheck: completion 리포트가 console, trace, screenshot 증거를 모두 포함해야 합니다.
assessment:
  schemaVersion: 1
  performanceClaim: 웹에서는 외부 패키지 없이 분석 판단과 데이터 계약을 검증하고, 실제 패키지 API와 산출물은 lesson Run 및 Local 실습 증거로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: pending
  masteryVariants:
  - id: playwright_09-trace-failure-diagnosis-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - console-capture
    - debug-report-completion
    title: trace event에서 최초 원인 후보 진단하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: console·network·assertion 실패를 시간순으로 연결해 가장 이른 원인을 찾는다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 마지막 assertion 실패보다 먼저 발생한 network·console 오류를 찾으세요.
    - 시간순 event와 종류별 failure 목록을 함께 남기세요.
    exercise:
      prompt: diagnose_trace(events)를 완성하세요.
      starterCode: |-
        def diagnose_trace(events):
            raise NotImplementedError
      solution: |
        def diagnose_trace(events):
            ordered = sorted(events, key=lambda event: event["atMs"])
            failures = [event for event in ordered if event.get("level") == "error" or event.get("status", 0) >= 400 or event.get("outcome") == "failed"]
            if not failures:
                return {"failed": False, "firstCause": None, "failureKinds": []}
            first = failures[0]
            kinds = []
            for event in failures:
                if event["kind"] not in kinds:
                    kinds.append(event["kind"])
            return {"failed": True, "firstCause": {"kind": first["kind"], "atMs": first["atMs"], "label": first["label"]}, "failureKinds": kinds}
      hints: *id001
    check:
      id: python.playwright.playwright_09.trace-failure-diagnosis.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_09.trace-failure-diagnosis.mastery.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: diagnose_trace
        cases:
        - id: finds-network-before-assertion
          arguments:
          - value:
            - kind: assertion
              atMs: 500
              label: notice
              outcome: failed
            - kind: network
              atMs: 200
              label: GET orders
              status: 500
          expectedReturn:
            failed: true
            firstCause:
              kind: network
              atMs: 200
              label: GET orders
            failureKinds:
            - network
            - assertion
        - id: finds-console-error
          arguments:
          - value:
            - kind: console
              atMs: 30
              label: boot
              level: error
            - kind: network
              atMs: 10
              label: asset
              status: 200
          expectedReturn:
            failed: true
            firstCause:
              kind: console
              atMs: 30
              label: boot
            failureKinds:
            - console
        - id: reports-clean-trace
          arguments:
          - value:
            - kind: network
              atMs: 10
              label: api
              status: 200
            - kind: assertion
              atMs: 20
              label: ready
              outcome: passed
          expectedReturn:
            failed: false
            firstCause: null
            failureKinds: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: playwright_09-trace-retention-plan-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - playwright_09-trace-failure-diagnosis-mastery
    title: 새 실행 결과에 trace 보존 정책 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 실패·재시도·민감정보 여부로 보존과 redaction 계획을 만든다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - flaky test는 실패 attempt만이 아니라 이어진 pass trace도 함께 보존하세요.
    - trace 보존과 비밀 redaction을 별도 결정으로 기록하세요.
    exercise:
      prompt: plan_trace_retention(runs)를 완성하세요.
      starterCode: |-
        def plan_trace_retention(runs):
            raise NotImplementedError
      solution: |
        def plan_trace_retention(runs):
            retain = []
            discard = []
            redact = []
            seen = {}
            for run in runs:
                seen.setdefault(run["test"], []).append(run)
            for test, attempts in sorted(seen.items()):
                unstable = len(attempts) > 1 and len({attempt["status"] for attempt in attempts}) > 1
                for attempt in attempts:
                    key = f"{test}#{attempt['attempt']}"
                    if attempt["status"] == "failed" or unstable:
                        retain.append(key)
                        if attempt.get("containsSecrets"):
                            redact.append(key)
                    else:
                        discard.append(key)
            return {"retain": retain, "discard": discard, "redact": redact}
      hints: *id002
    check:
      id: python.playwright.playwright_09.trace-retention-plan.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_09.trace-retention-plan.transfer.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: plan_trace_retention
        cases:
        - id: keeps-failure-and-redacts-secret
          arguments:
          - value:
            - test: login
              attempt: 1
              status: failed
              containsSecrets: true
          expectedReturn:
            retain:
            - login#1
            discard: []
            redact:
            - login#1
        - id: keeps-all-flaky-attempts
          arguments:
          - value:
            - test: search
              attempt: 1
              status: failed
            - test: search
              attempt: 2
              status: passed
          expectedReturn:
            retain:
            - search#1
            - search#2
            discard: []
            redact: []
        - id: discards-stable-pass
          arguments:
          - value:
            - test: home
              attempt: 1
              status: passed
          expectedReturn:
            retain: []
            discard:
            - home#1
            redact: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: playwright_09-trace-debug-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - playwright_09-trace-retention-plan-transfer
    title: trace 디버깅 순서 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: assertion 실패 전에 확인할 event 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 브라우저 동작 성공과 사용자 목표 달성을 같은 것으로 취급하지 마세요.
    - 선택한 action과 함께 판정 가능한 evidence와 남는 risk를 기록하세요.
    exercise:
      prompt: choose_trace_debug_step(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_trace_debug_step(situation):
            raise NotImplementedError
      solution: |
        def choose_trace_debug_step(situation):
            table = {'blank-page': {'action': 'inspect navigation and console first', 'evidence': 'response chain and boot error', 'risk': 'asserting absent content only'}, 'missing-data': {'action': 'inspect request and response', 'evidence': 'payload status timing', 'risk': 'mock mismatch'}, 'flaky-click': {'action': 'compare actionability timeline', 'evidence': 'locator state across attempts', 'risk': 'retry masking'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.playwright.playwright_09.trace-debug-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_09.trace-debug-recall.retrieval.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: choose_trace_debug_step
        cases:
        - id: recalls-blank-page
          arguments:
          - value: blank-page
          expectedReturn:
            action: inspect navigation and console first
            evidence: response chain and boot error
            risk: asserting absent content only
        - id: recalls-missing-data
          arguments:
          - value: missing-data
          expectedReturn:
            action: inspect request and response
            evidence: payload status timing
            risk: mock mismatch
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};