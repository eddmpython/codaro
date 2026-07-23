var e=`meta:
  id: playwright_03
  title: 기다림과 검증
  order: 3
  category: playwright
  difficulty: easy
  audience: Python 기본 문법을 익힌 자동화 입문자
  packages:
    - playwright
  tags:
    - playwright
    - expect
    - auto-wait
    - 오류수정
intro:
  direction: 수동 sleep 대신 Playwright의 자동 대기와 expect 검증으로 화면 변화를 안정적으로 확인한다.
  benefits:
    - 늦게 나타나는 상태 문구를 안정적으로 기다릴 수 있다.
    - strictness 오류를 읽고 locator 범위를 좁힐 수 있다.
    - 실패를 재현하고 고친 뒤 assert로 완료 신호를 남길 수 있다.
  diagram:
    steps:
      - label: 지연 상태 화면 구성
        detail: 버튼 클릭 뒤 setTimeout으로 늦게 바뀌는 화면을 만들어 자동 대기를 확인합니다.
      - label: expect 조건으로 결과 확인
        detail: visible, text, count 조건을 사용해 화면 상태가 준비될 때까지 기다립니다.
      - label: strictness 실패 읽기
        detail: 모호한 locator가 왜 실패하는지 오류 메시지를 잡고 범위를 좁힙니다.
      - label: 안정 검증 코드로 정리
        detail: sleep 없이 클릭, 대기, 결과 비교가 이어지는 완료 루틴을 만듭니다.
    runtime:
      - label: expect API 준비
        detail: playwright.sync_api의 expect가 locator 조건을 기다리는지 확인합니다.
      - label: 로컬 DOM 지연 실행
        detail: setTimeout을 가진 HTML을 headless Chromium에서 실행합니다.
      - label: 실패 후 수정 검증
        detail: 모호한 locator 실패를 재현한 뒤 더 구체적인 locator로 통과시킵니다.
sections:
  - id: delayed-status
    title: 늦게 바뀌는 상태 기다리기
    structuredPrimary: true
    subtitle: auto-wait 감각
    goal: 버튼 클릭 후 비동기로 바뀌는 상태 문구를 expect로 기다린다.
    why: 실무 웹 화면은 클릭 직후 바로 결과가 나오지 않으므로 고정 sleep보다 조건 기반 대기가 안전하다.
    explanation: Playwright의 expect는 locator 상태가 조건을 만족할 때까지 짧게 재시도합니다. 이 덕분에 setTimeout이나 화면 렌더링 지연이 있어도 불필요한 sleep 없이 검증할 수 있습니다. 조건이 끝까지 만족되지 않으면 명확한 timeout 실패로 남습니다.
    tips:
      - page.wait_for_timeout보다 expect(locator).to_have_text 같은 조건 대기를 우선합니다.
      - 대기 대상은 사용자가 실제로 보는 상태 문구로 잡습니다.
    snippet: |-
      from playwright.sync_api import sync_playwright, expect

      html = """
      <button onclick="setTimeout(() => document.querySelector('[data-testid=status]').textContent='완료', 80)">시작</button>
      <p data-testid="status">대기</p>
      """

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(html)
          page.get_by_role("button", name="시작").click()
          status = page.get_by_test_id("status")
          expect(status).to_have_text("완료")
          result = status.inner_text()
          browser.close()

      assert result == "완료"
      result
    exercise:
      prompt: 클릭 후 상태를 "동기화 완료"로 바꾸고 expect 검증을 통과시키세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <button onclick="setTimeout(() => document.querySelector('[data-testid=status]').textContent='___', 80)">시작</button>
        <p data-testid="status">대기</p>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_role("button", name="시작").click()
            status = page.get_by_test_id("status")
            expect(status).to_have_text("동기화 완료")
            result = status.inner_text()
            browser.close()

        assert result == "___"
        result
      solution: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <button onclick="setTimeout(() => document.querySelector('[data-testid=status]').textContent='동기화 완료', 80)">시작</button>
        <p data-testid="status">대기</p>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_role("button", name="시작").click()
            status = page.get_by_test_id("status")
            expect(status).to_have_text("동기화 완료")
            result = status.inner_text()
            browser.close()

        assert result == "동기화 완료"
        result
      hints:
        - setTimeout 안의 문구, expect 문구, assert 문구를 같게 맞추세요.
        - expect가 조건을 기다리므로 별도 sleep을 넣지 않아도 됩니다.
    check:
      noError: 버튼 클릭 뒤 expect(status).to_have_text가 timeout 없이 통과해야 합니다.
      resultCheck: result 값이 지연 후 바뀐 상태 문구와 같아야 합니다.
  - id: list-count
    title: 목록 개수 검증
    structuredPrimary: true
    subtitle: to_have_count
    goal: 반복 목록의 항목 수를 expect(locator).to_have_count로 검증한다.
    why: 목록 자동화는 항목 개수, 필터 결과, 빈 상태를 정확히 확인해야 누락을 줄일 수 있다.
    explanation: to_have_count는 locator가 가리키는 여러 요소의 개수를 검증합니다. 리스트 항목이 렌더링되는 화면에서 개수를 먼저 확인하면 이후 특정 항목 클릭이나 필터링이 더 안전해집니다. 결과 개수를 assert로도 남기면 Python 코드 흐름에서 재사용할 수 있습니다.
    tips:
      - count 검증은 목록 렌더링이 끝났는지 확인하는 기본 체크입니다.
      - 항목 텍스트까지 함께 확인하면 순서와 내용 오류도 잡을 수 있습니다.
    snippet: |-
      from playwright.sync_api import sync_playwright, expect

      html = "<ul><li>신규</li><li>처리중</li><li>완료</li></ul>"

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(html)
          items = page.get_by_role("listitem")
          expect(items).to_have_count(3)
          labels = items.all_inner_texts()
          browser.close()

      assert labels == ["신규", "처리중", "완료"]
      labels
    exercise:
      prompt: 목록에 "보류" 항목을 추가하고 count와 labels 검증을 함께 수정하세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright, expect

        html = "<ul><li>신규</li><li>처리중</li><li>완료</li><li>___</li></ul>"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            items = page.get_by_role("listitem")
            expect(items).to_have_count(___)
            labels = items.all_inner_texts()
            browser.close()

        assert labels == ["신규", "처리중", "완료", "보류"]
        labels
      solution: |-
        from playwright.sync_api import sync_playwright, expect

        html = "<ul><li>신규</li><li>처리중</li><li>완료</li><li>보류</li></ul>"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            items = page.get_by_role("listitem")
            expect(items).to_have_count(4)
            labels = items.all_inner_texts()
            browser.close()

        assert labels == ["신규", "처리중", "완료", "보류"]
        labels
      hints:
        - li 개수를 세어 to_have_count 숫자와 맞추세요.
        - labels 리스트는 화면 순서와 같아야 합니다.
    check:
      noError: listitem locator 개수 검증이 오류 없이 통과해야 합니다.
      resultCheck: labels 리스트가 화면 항목 텍스트와 같은 순서로 일치해야 합니다.
  - id: strictness-error
    title: strictness 오류 읽고 고치기
    structuredPrimary: true
    subtitle: 모호한 locator 수정
    goal: 같은 이름의 버튼이 여러 개일 때 strictness 오류를 재현하고 범위를 좁혀 해결한다.
    why: Playwright 실패를 학습 자산으로 다루면 자동화가 깨졌을 때 원인을 빠르게 좁힐 수 있다.
    explanation: Playwright는 클릭 대상이 여러 개이면 어느 요소를 클릭해야 할지 추측하지 않고 오류를 냅니다. 이 strictness 오류는 나쁜 신호가 아니라 locator가 모호하다는 친절한 경고입니다. 부모 카드나 listitem으로 범위를 좁히면 같은 버튼 이름을 안전하게 사용할 수 있습니다.
    tips:
      - 오류 메시지에서 "strict mode"와 후보 요소 수를 먼저 확인합니다.
      - 반복 UI에서는 부모 요소를 filter로 좁힌 뒤 그 안의 버튼을 찾습니다.
    snippet: |-
      from playwright.sync_api import Error as PlaywrightError
      from playwright.sync_api import sync_playwright, expect

      html = "<section><button>선택</button><button>선택</button></section>"

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(html)
          try:
              page.get_by_role("button", name="선택").click()
              strictnessMessage = ""
          except PlaywrightError as exc:
              strictnessMessage = str(exc)
          browser.close()

      assert "strict mode violation" in strictnessMessage
      "strictness 오류 확인"
    exercise:
      prompt: 두 번째 카드의 버튼만 클릭하도록 부모 listitem을 filter로 좁히세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <ul>
          <li>주문 A <button>선택</button></li>
          <li>주문 B <button>선택</button></li>
        </ul>
        <p data-testid="result"></p>
        <script>
        document.querySelectorAll('li').forEach(item => {
          item.querySelector('button').onclick = () => document.querySelector('[data-testid=result]').textContent = item.textContent.replace('선택', '').trim();
        });
        <\/script>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_role("listitem").filter(has_text="___").get_by_role("button", name="선택").click()
            expect(page.get_by_test_id("result")).to_have_text("주문 B")
            result = page.get_by_test_id("result").inner_text()
            browser.close()

        assert result == "___"
        result
      solution: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <ul>
          <li>주문 A <button>선택</button></li>
          <li>주문 B <button>선택</button></li>
        </ul>
        <p data-testid="result"></p>
        <script>
        document.querySelectorAll('li').forEach(item => {
          item.querySelector('button').onclick = () => document.querySelector('[data-testid=result]').textContent = item.textContent.replace('선택', '').trim();
        });
        <\/script>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_role("listitem").filter(has_text="주문 B").get_by_role("button", name="선택").click()
            expect(page.get_by_test_id("result")).to_have_text("주문 B")
            result = page.get_by_test_id("result").inner_text()
            browser.close()

        assert result == "주문 B"
        result
      hints:
        - 버튼이 아니라 버튼을 포함한 listitem을 먼저 좁히세요.
        - has_text와 assert 결과는 같은 주문명이어야 합니다.
    check:
      noError: 모호한 버튼 클릭 대신 필터링된 listitem 안의 버튼 클릭이 실행되어야 합니다.
      resultCheck: result 값이 선택한 두 번째 카드 텍스트와 일치해야 합니다.
  - id: stable-completion
    title: 안정 검증 완료 루틴
    structuredPrimary: true
    subtitle: click, wait, compare
    goal: 클릭과 자동 대기, 결과 딕셔너리 비교를 하나의 완료 루틴으로 묶는다.
    why: 안정적인 자동화는 기다림이 아니라 조건, 단일 값이 아니라 결과 객체, 눈 확인이 아니라 assert로 끝난다.
    explanation: 이 레슨의 마지막 코드는 sleep 없이 클릭 후 상태를 기다리고 결과를 딕셔너리로 남깁니다. 같은 패턴을 이후 스크린샷, 네트워크 mock, 종합 프로젝트에서 반복합니다. 안정 검증 루틴은 자동화가 실패했을 때 어느 조건이 깨졌는지 알려주는 최소 단위입니다.
    tips:
      - 상태 문자열은 expected 변수에 넣어 중복을 줄입니다.
      - 결과 딕셔너리는 assert 비교와 리포트 저장에 모두 사용할 수 있습니다.
    snippet: |-
      from playwright.sync_api import sync_playwright, expect

      expected = "처리 완료"
      html = f"""
      <button onclick="setTimeout(() => document.querySelector('[data-testid=status]').textContent='{expected}', 60)">처리</button>
      <p data-testid="status">대기</p>
      """

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(html)
          page.get_by_role("button", name="처리").click()
          status = page.get_by_test_id("status")
          expect(status).to_have_text(expected)
          report = {"status": status.inner_text(), "passed": True}
          browser.close()

      assert report == {"status": "처리 완료", "passed": True}
      report
    exercise:
      prompt: expected를 "검수 완료"로 바꾸고 report 비교가 통과하도록 수정하세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright, expect

        expected = "___"
        html = f"""
        <button onclick="setTimeout(() => document.querySelector('[data-testid=status]').textContent='{expected}', 60)">처리</button>
        <p data-testid="status">대기</p>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_role("button", name="처리").click()
            status = page.get_by_test_id("status")
            expect(status).to_have_text(expected)
            report = {"status": status.inner_text(), "passed": True}
            browser.close()

        assert report == {"status": "검수 완료", "passed": True}
        report
      solution: |-
        from playwright.sync_api import sync_playwright, expect

        expected = "검수 완료"
        html = f"""
        <button onclick="setTimeout(() => document.querySelector('[data-testid=status]').textContent='{expected}', 60)">처리</button>
        <p data-testid="status">대기</p>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_role("button", name="처리").click()
            status = page.get_by_test_id("status")
            expect(status).to_have_text(expected)
            report = {"status": status.inner_text(), "passed": True}
            browser.close()

        assert report == {"status": "검수 완료", "passed": True}
        report
      hints:
        - expected를 한 번 바꾸면 HTML과 expect는 같은 값을 사용합니다.
        - 마지막 assert의 딕셔너리 값도 expected와 같은 상태여야 합니다.
    check:
      noError: 클릭, expect 대기, report 생성이 모두 실행되어야 합니다.
      resultCheck: report의 status와 passed 값이 완료 기준을 정확히 표현해야 합니다.
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
  - id: playwright_03-wait-timeline-resolution-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - delayed-status
    - stable-completion
    title: 상태 변화 timeline에서 첫 준비 시점 찾기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 고정 sleep 없이 목표 상태가 timeout 안에 관찰되는지 판정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 기다린 시간 자체가 아니라 관찰할 사용자 상태를 명시하세요.
    - timeout 실패에서도 도달한 상태를 남겨 원인을 좁히세요.
    exercise:
      prompt: resolve_wait(events, target_state, timeout_ms)를 완성하세요.
      starterCode: |-
        def resolve_wait(events, target_state, timeout_ms):
            raise NotImplementedError
      solution: |
        def resolve_wait(events, target_state, timeout_ms):
            if timeout_ms < 0:
                raise ValueError("negative timeout")
            ordered = sorted(events, key=lambda event: event["atMs"])
            observed = [event["state"] for event in ordered if event["atMs"] <= timeout_ms]
            for event in ordered:
                if event["atMs"] <= timeout_ms and event["state"] == target_state:
                    return {"passed": True, "atMs": event["atMs"], "observed": observed}
            return {"passed": False, "atMs": None, "observed": observed}
      hints: *id001
    check:
      id: python.playwright.playwright_03.wait-timeline-resolution.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_03.wait-timeline-resolution.mastery.behavior.v1.fixture
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
        entry: resolve_wait
        cases:
        - id: finds-first-ready-event
          arguments:
          - value:
            - atMs: 300
              state: ready
            - atMs: 0
              state: loading
            - atMs: 500
              state: ready
          - value: ready
          - value: 400
          expectedReturn:
            passed: true
            atMs: 300
            observed:
            - loading
            - ready
        - id: times-out-with-observed-states
          arguments:
          - value:
            - atMs: 0
              state: loading
            - atMs: 900
              state: ready
          - value: ready
          - value: 500
          expectedReturn:
            passed: false
            atMs: null
            observed:
            - loading
        - id: rejects-negative-timeout
          arguments:
          - value: []
          - value: ready
          - value: -1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: playwright_03-assertion-policy-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - playwright_03-wait-timeline-resolution-mastery
    title: 새 테스트의 wait·assertion 정책 감사하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 고정 sleep과 즉시 snapshot 비교를 찾아 web-first assertion으로 교정한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - '\`sleep\`을 줄이는 것이 아니라 기다릴 상태와 실패 message를 설계하세요.'
    - 자동 retry가 가능한 assertion과 즉시 계산 assertion을 구분하세요.
    exercise:
      prompt: audit_assertion_policy(steps)를 완성하세요.
      starterCode: |-
        def audit_assertion_policy(steps):
            raise NotImplementedError
      solution: |
        def audit_assertion_policy(steps):
            failures = []
            retryable = []
            for index, step in enumerate(steps):
                kind = step.get("kind")
                if kind == "sleep":
                    failures.append({"index": index, "reason": "fixed-sleep"})
                elif kind == "assert" and not step.get("webFirst", False):
                    failures.append({"index": index, "reason": "non-retrying-assertion"})
                elif kind == "assert":
                    retryable.append(index)
            return {"ready": not failures, "retryableAssertions": retryable, "failures": failures}
      hints: *id002
    check:
      id: python.playwright.playwright_03.assertion-policy-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_03.assertion-policy-audit.transfer.behavior.v1.fixture
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
        entry: audit_assertion_policy
        cases:
        - id: accepts-web-first-assertions
          arguments:
          - value:
            - kind: action
            - kind: assert
              webFirst: true
            - kind: assert
              webFirst: true
          expectedReturn:
            ready: true
            retryableAssertions:
            - 1
            - 2
            failures: []
        - id: reports-sleep-and-snapshot
          arguments:
          - value:
            - kind: sleep
              ms: 1000
            - kind: assert
              webFirst: false
          expectedReturn:
            ready: false
            retryableAssertions: []
            failures:
            - index: 0
              reason: fixed-sleep
            - index: 1
              reason: non-retrying-assertion
        - id: keeps-good-assertion-among-failures
          arguments:
          - value:
            - kind: assert
              webFirst: true
            - kind: sleep
              ms: 20
          expectedReturn:
            ready: false
            retryableAssertions:
            - 0
            failures:
            - index: 1
              reason: fixed-sleep
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: playwright_03-wait-strategy-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - playwright_03-assertion-policy-audit-transfer
    title: 기다림과 검증 전략 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: navigation·요소 표시·비동기 응답의 관찰 대상을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 브라우저 동작 성공과 사용자 목표 달성을 같은 것으로 취급하지 마세요.
    - 선택한 action과 함께 판정 가능한 evidence와 남는 risk를 기록하세요.
    exercise:
      prompt: choose_wait_strategy(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_wait_strategy(situation):
            raise NotImplementedError
      solution: |
        def choose_wait_strategy(situation):
            table = {'navigation': {'action': 'assert destination URL and landmark', 'evidence': 'response and semantic state', 'risk': 'client redirect'}, 'element-ready': {'action': 'web-first visible or enabled assertion', 'evidence': 'locator state', 'risk': 'wrong duplicate'}, 'async-result': {'action': 'assert rendered outcome', 'evidence': 'user-visible result', 'risk': 'waiting on implementation detail'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.playwright.playwright_03.wait-strategy-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_03.wait-strategy-recall.retrieval.behavior.v1.fixture
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
        entry: choose_wait_strategy
        cases:
        - id: recalls-navigation
          arguments:
          - value: navigation
          expectedReturn:
            action: assert destination URL and landmark
            evidence: response and semantic state
            risk: client redirect
        - id: recalls-element-ready
          arguments:
          - value: element-ready
          expectedReturn:
            action: web-first visible or enabled assertion
            evidence: locator state
            risk: wrong duplicate
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};