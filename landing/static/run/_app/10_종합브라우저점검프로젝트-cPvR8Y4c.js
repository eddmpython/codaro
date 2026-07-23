var e=`meta:
  id: playwright_10
  title: 종합 브라우저 점검 프로젝트
  order: 10
  category: playwright
  difficulty: medium
  audience: Python 기본 문법을 익힌 자동화 입문자
  packages:
    - playwright
  outcomes: ["automation.browser.audit"]
  prerequisites: ["automation.browser.testFlow","automation.browser.evidence"]
  estimatedMinutes: 80
  tags:
    - playwright
    - project
    - report
    - browser-audit
intro:
  direction: 로그인 폼, 네트워크 mock, 화면 검증, 스크린샷, JSON 리포트를 하나의 브라우저 점검 함수로 묶는다.
  benefits:
    - 앞 레슨의 locator, expect, route, storage, screenshot 흐름을 한 프로젝트로 연결한다.
    - 외부 네트워크 없이 재현 가능한 업무 점검 루틴을 완성한다.
    - 결과 파일과 completion 딕셔너리로 자동화 완료 기준을 남긴다.
  diagram:
    steps:
      - label: 점검 화면 정의
        detail: 로그인 폼, 대시보드, 주문 수 API를 포함한 로컬 앱 HTML을 준비합니다.
      - label: 사용자 흐름 실행
        detail: 이메일을 입력하고 버튼을 눌러 로그인 상태를 만듭니다.
      - label: API 응답 mock
        detail: /api/orders 응답을 route.fulfill로 고정해 주문 수를 검증합니다.
      - label: 증거 산출물 저장
        detail: 스크린샷과 JSON 리포트를 scratch 경로에 저장하고 completion을 반환합니다.
    runtime:
      - label: Playwright 통합 실행
        detail: locator, expect, route, screenshot, evaluate가 한 코드 흐름에서 동작해야 합니다.
      - label: 네트워크 없는 재현성
        detail: 모든 URL은 codaro.local mock route로 처리되어 외부 사이트에 접속하지 않습니다.
      - label: 파일 산출물 검증
        detail: screenshot과 report JSON은 CODARO_PLAYWRIGHT_OUTPUT_DIR 또는 OS temp 아래에만 생성합니다.
sections:
  - id: project-html
    title: 점검 화면 만들기
    structuredPrimary: true
    subtitle: 로그인 폼과 상태 영역
    goal: 프로젝트에서 사용할 로컬 HTML을 만들고 핵심 화면 요소가 포함됐는지 검증한다.
    why: 종합 자동화는 클릭부터 시작하지 않고, 어떤 화면 계약을 검증할지 먼저 고정해야 한다.
    explanation: 이 프로젝트의 HTML은 이메일 입력칸, 로그인 버튼, 상태 문구, 주문 수 영역을 포함합니다. 외부 앱을 열지 않고도 실제 업무 화면과 비슷한 흐름을 만들 수 있습니다. 먼저 문자열 안에 자동화할 요소가 모두 있는지 assert로 확인합니다.
    tips:
      - label과 button name은 나중에 role/label locator로 찾을 수 있게 의미 있게 씁니다.
      - data-testid는 상태 값처럼 명확히 검증할 대상에만 붙입니다.
    snippet: |-
      appHtml = """
      <main>
        <h1>운영 점검</h1>
        <label>이메일 <input name="email" /></label>
        <button type="button">로그인</button>
        <p data-testid="status">로그인 전</p>
        <p data-testid="orders">주문 0건</p>
      </main>
      """

      assert "이메일" in appHtml
      assert "로그인" in appHtml
      assert 'data-testid="orders"' in appHtml
      appHtml
    exercise:
      prompt: h1 제목을 "주문 운영 점검"으로 바꾸고 HTML 계약을 검증하세요.
      starterCode: |-
        appHtml = """
        <main>
          <h1>___</h1>
          <label>이메일 <input name="email" /></label>
          <button type="button">로그인</button>
          <p data-testid="status">로그인 전</p>
          <p data-testid="orders">주문 0건</p>
        </main>
        """

        assert "주문 운영 점검" in appHtml
        assert "이메일" in appHtml
        assert 'data-testid="orders"' in appHtml
        appHtml
      solution: |-
        appHtml = """
        <main>
          <h1>주문 운영 점검</h1>
          <label>이메일 <input name="email" /></label>
          <button type="button">로그인</button>
          <p data-testid="status">로그인 전</p>
          <p data-testid="orders">주문 0건</p>
        </main>
        """

        assert "주문 운영 점검" in appHtml
        assert "이메일" in appHtml
        assert 'data-testid="orders"' in appHtml
        appHtml
      hints:
        - h1 태그 안의 텍스트와 assert 문자열을 같게 맞추세요.
        - 자동화에 필요한 입력, 버튼, 상태 영역은 그대로 남겨야 합니다.
    check:
      noError: appHtml 문자열과 assert가 SyntaxError 없이 실행되어야 합니다.
      resultCheck: HTML에 제목, 입력 label, orders test id가 모두 포함되어야 합니다.
  - id: login-flow
    title: 로그인 흐름 검증
    structuredPrimary: true
    subtitle: fill, click, expect
    goal: 이메일을 입력하고 로그인 버튼을 눌러 화면 상태가 사용자 이름으로 바뀌는지 확인한다.
    why: 브라우저 자동화의 핵심은 함수 호출보다 사용자가 보는 흐름을 같은 순서로 재현하는 것이다.
    explanation: Playwright locator는 label과 role을 기준으로 사용자가 인식하는 요소를 찾습니다. 여기서는 이메일을 채우고 버튼을 누르면 JavaScript가 상태 문구를 바꾸도록 HTML에 script를 넣습니다. expect는 클릭 뒤 바뀐 화면을 기다리며 검증합니다.
    tips:
      - 버튼 클릭 전에 입력값을 먼저 채워야 상태 문구가 기대값으로 바뀝니다.
      - locator는 CSS보다 label, role, test id 순으로 의미를 드러내는 기준을 우선합니다.
    snippet: |-
      from playwright.sync_api import sync_playwright, expect

      html = """
      <main>
        <label>이메일 <input name="email" /></label>
        <button type="button">로그인</button>
        <p data-testid="status">로그인 전</p>
        <script>
          document.querySelector('button').addEventListener('click', () => {
            const email = document.querySelector('input[name=email]').value;
            document.querySelector('[data-testid=status]').textContent = \`\${email} 로그인 완료\`;
          });
        <\/script>
      </main>
      """

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(html)
          page.get_by_label("이메일").fill("ops@codaro.local")
          page.get_by_role("button", name="로그인").click()
          expect(page.get_by_test_id("status")).to_have_text("ops@codaro.local 로그인 완료")
          statusText = page.get_by_test_id("status").inner_text()
          browser.close()

      assert statusText.endswith("로그인 완료")
      statusText
    exercise:
      prompt: 이메일을 audit@codaro.local로 바꾸고 로그인 완료 검증을 맞추세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <main>
          <label>이메일 <input name="email" /></label>
          <button type="button">로그인</button>
          <p data-testid="status">로그인 전</p>
          <script>
            document.querySelector('button').addEventListener('click', () => {
              const email = document.querySelector('input[name=email]').value;
              document.querySelector('[data-testid=status]').textContent = \`\${email} 로그인 완료\`;
            });
          <\/script>
        </main>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_label("이메일").fill("___")
            page.get_by_role("button", name="로그인").click()
            expect(page.get_by_test_id("status")).to_have_text("audit@codaro.local 로그인 완료")
            statusText = page.get_by_test_id("status").inner_text()
            browser.close()

        assert statusText == "audit@codaro.local 로그인 완료"
        statusText
      solution: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <main>
          <label>이메일 <input name="email" /></label>
          <button type="button">로그인</button>
          <p data-testid="status">로그인 전</p>
          <script>
            document.querySelector('button').addEventListener('click', () => {
              const email = document.querySelector('input[name=email]').value;
              document.querySelector('[data-testid=status]').textContent = \`\${email} 로그인 완료\`;
            });
          <\/script>
        </main>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_label("이메일").fill("audit@codaro.local")
            page.get_by_role("button", name="로그인").click()
            expect(page.get_by_test_id("status")).to_have_text("audit@codaro.local 로그인 완료")
            statusText = page.get_by_test_id("status").inner_text()
            browser.close()

        assert statusText == "audit@codaro.local 로그인 완료"
        statusText
      hints:
        - fill에 넣는 이메일과 expect 문자열의 이메일을 같게 맞추세요.
        - statusText는 클릭 뒤 화면에 표시된 최종 상태입니다.
    check:
      noError: fill, click, expect 흐름이 timeout 없이 완료되어야 합니다.
      resultCheck: statusText가 audit@codaro.local 로그인 완료와 정확히 같아야 합니다.
  - id: api-and-evidence
    title: API mock과 증거 저장
    structuredPrimary: true
    subtitle: route, screenshot, report
    goal: mock API 주문 수를 화면에 반영하고 스크린샷과 JSON 리포트를 scratch에 저장한다.
    why: 실제 점검 루틴은 화면만 보는 것이 아니라 입력 데이터, API 응답, 증거 파일을 함께 남겨야 한다.
    explanation: page.route로 앱 HTML과 API JSON을 모두 mock하면 네트워크 없이 같은 결과를 반복할 수 있습니다. 화면 script는 /api/orders를 fetch해 주문 수를 표시합니다. 검증이 끝나면 screenshot과 report JSON을 저장해 자동화 산출물로 남깁니다.
    tips:
      - route는 page.goto보다 먼저 등록합니다.
      - JSON 리포트에는 화면에서 읽은 값과 파일명처럼 재확인 가능한 정보를 넣습니다.
    snippet: |-
      from pathlib import Path
      import json
      import os
      import tempfile
      from playwright.sync_api import sync_playwright, expect

      outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-project"
      outputDir.mkdir(parents=True, exist_ok=True)
      screenshotPath = outputDir / "orders-dashboard.png"
      reportPath = outputDir / "orders-report.json"
      appHtml = """
      <main>
        <h1>주문 운영 점검</h1>
        <p data-testid="orders">주문 로딩 중</p>
        <script>
          fetch('/api/orders').then(response => response.json()).then(data => {
            document.querySelector('[data-testid=orders]').textContent = \`주문 \${data.orders.length}건\`;
          });
        <\/script>
      </main>
      """

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.route("**/app", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body=appHtml))
          page.route("**/api/orders", lambda route: route.fulfill(status=200, content_type="application/json", body=json.dumps({"orders": [101, 102]})))
          page.goto("https://codaro.local/app")
          expect(page.get_by_test_id("orders")).to_have_text("주문 2건")
          ordersText = page.get_by_test_id("orders").inner_text()
          page.screenshot(path=screenshotPath)
          browser.close()

      reportPath.write_text(json.dumps({"ordersText": ordersText, "screenshot": screenshotPath.name}, ensure_ascii=False, indent=2), encoding="utf-8")
      assert screenshotPath.exists()
      assert json.loads(reportPath.read_text(encoding="utf-8"))["ordersText"] == "주문 2건"
      str(reportPath)
    exercise:
      prompt: mock 주문을 3개로 바꾸고 화면/리포트 검증을 "주문 3건"에 맞추세요.
      starterCode: |-
        from pathlib import Path
        import json
        import os
        import tempfile
        from playwright.sync_api import sync_playwright, expect

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-project"
        outputDir.mkdir(parents=True, exist_ok=True)
        screenshotPath = outputDir / "orders-dashboard.png"
        reportPath = outputDir / "orders-report.json"
        appHtml = """
        <main>
          <h1>주문 운영 점검</h1>
          <p data-testid="orders">주문 로딩 중</p>
          <script>
            fetch('/api/orders').then(response => response.json()).then(data => {
              document.querySelector('[data-testid=orders]').textContent = \`주문 \${data.orders.length}건\`;
            });
          <\/script>
        </main>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.route("**/app", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body=appHtml))
            page.route("**/api/orders", lambda route: route.fulfill(status=200, content_type="application/json", body=json.dumps({"orders": [101, 102, ___]})))
            page.goto("https://codaro.local/app")
            expect(page.get_by_test_id("orders")).to_have_text("주문 3건")
            ordersText = page.get_by_test_id("orders").inner_text()
            page.screenshot(path=screenshotPath)
            browser.close()

        reportPath.write_text(json.dumps({"ordersText": ordersText, "screenshot": screenshotPath.name}, ensure_ascii=False, indent=2), encoding="utf-8")
        assert screenshotPath.exists()
        assert json.loads(reportPath.read_text(encoding="utf-8"))["ordersText"] == "주문 3건"
        str(reportPath)
      solution: |-
        from pathlib import Path
        import json
        import os
        import tempfile
        from playwright.sync_api import sync_playwright, expect

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-project"
        outputDir.mkdir(parents=True, exist_ok=True)
        screenshotPath = outputDir / "orders-dashboard.png"
        reportPath = outputDir / "orders-report.json"
        appHtml = """
        <main>
          <h1>주문 운영 점검</h1>
          <p data-testid="orders">주문 로딩 중</p>
          <script>
            fetch('/api/orders').then(response => response.json()).then(data => {
              document.querySelector('[data-testid=orders]').textContent = \`주문 \${data.orders.length}건\`;
            });
          <\/script>
        </main>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.route("**/app", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body=appHtml))
            page.route("**/api/orders", lambda route: route.fulfill(status=200, content_type="application/json", body=json.dumps({"orders": [101, 102, 103]})))
            page.goto("https://codaro.local/app")
            expect(page.get_by_test_id("orders")).to_have_text("주문 3건")
            ordersText = page.get_by_test_id("orders").inner_text()
            page.screenshot(path=screenshotPath)
            browser.close()

        reportPath.write_text(json.dumps({"ordersText": ordersText, "screenshot": screenshotPath.name}, ensure_ascii=False, indent=2), encoding="utf-8")
        assert screenshotPath.exists()
        assert json.loads(reportPath.read_text(encoding="utf-8"))["ordersText"] == "주문 3건"
        str(reportPath)
      hints:
        - orders 배열 항목 수와 expect 문자열의 숫자가 같아야 합니다.
        - reportPath에 저장한 ordersText도 같은 화면 값을 사용합니다.
    check:
      noError: route mock, fetch 반영, screenshot 저장, JSON 리포트 쓰기가 오류 없이 완료되어야 합니다.
      resultCheck: 화면과 리포트 모두 주문 3건을 가리켜야 합니다.
  - id: final-browser-audit-completion
    title: 종합 점검 완료
    structuredPrimary: true
    subtitle: 함수형 자동화 리포트
    goal: 브라우저 점검 전체를 함수로 묶고 completion 딕셔너리로 성공 여부와 산출물을 반환한다.
    why: 학습의 끝은 셀 조각이 아니라 다시 실행 가능한 작은 자동화 함수와 그 결과 계약이어야 한다.
    explanation: runBrowserAudit 함수는 브라우저를 열고, 화면/API를 mock하고, 주문 수를 검증하고, 스크린샷과 JSON 리포트를 저장합니다. 반환값은 passed, orders, fileExists를 담아 이후 테스트나 자동화 스케줄러가 판단할 수 있는 형태입니다.
    tips:
      - 함수 안에서 만든 browser는 항상 close로 정리합니다.
      - completion은 사람이 읽기 쉬운 값과 자동 판단 가능한 boolean을 함께 둡니다.
    snippet: |-
      from pathlib import Path
      import json
      import os
      import tempfile
      from playwright.sync_api import sync_playwright, expect

      def runBrowserAudit():
          outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-project"
          outputDir.mkdir(parents=True, exist_ok=True)
          screenshotPath = outputDir / "final-dashboard.png"
          reportPath = outputDir / "final-report.json"
          appHtml = """
          <main>
            <h1>주문 운영 점검</h1>
            <label>이메일 <input name="email" /></label>
            <button type="button">로그인</button>
            <p data-testid="status">로그인 전</p>
            <p data-testid="orders">주문 로딩 중</p>
            <script>
              document.querySelector('button').addEventListener('click', () => {
                document.querySelector('[data-testid=status]').textContent = '점검 로그인 완료';
              });
              fetch('/api/orders').then(response => response.json()).then(data => {
                document.querySelector('[data-testid=orders]').textContent = \`주문 \${data.orders.length}건\`;
              });
            <\/script>
          </main>
          """

          with sync_playwright() as p:
              browser = p.chromium.launch(headless=True)
              page = browser.new_page()
              page.route("**/app", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body=appHtml))
              page.route("**/api/orders", lambda route: route.fulfill(status=200, content_type="application/json", body=json.dumps({"orders": [101, 102]})))
              page.goto("https://codaro.local/app")
              page.get_by_label("이메일").fill("ops@codaro.local")
              page.get_by_role("button", name="로그인").click()
              expect(page.get_by_test_id("status")).to_have_text("점검 로그인 완료")
              expect(page.get_by_test_id("orders")).to_have_text("주문 2건")
              page.screenshot(path=screenshotPath)
              browser.close()

          report = {"passed": True, "orders": 2, "screenshot": screenshotPath.name}
          reportPath.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
          return {"passed": report["passed"], "orders": report["orders"], "screenshotExists": screenshotPath.exists(), "reportExists": reportPath.exists()}

      completion = runBrowserAudit()
      assert completion == {"passed": True, "orders": 2, "screenshotExists": True, "reportExists": True}
      completion
    exercise:
      prompt: 주문 수를 4건으로 바꾸고 completion의 orders 검증을 맞추세요.
      starterCode: |-
        from pathlib import Path
        import json
        import os
        import tempfile
        from playwright.sync_api import sync_playwright, expect

        def runBrowserAudit():
            outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-project"
            outputDir.mkdir(parents=True, exist_ok=True)
            screenshotPath = outputDir / "final-dashboard.png"
            reportPath = outputDir / "final-report.json"
            appHtml = """
            <main>
              <h1>주문 운영 점검</h1>
              <label>이메일 <input name="email" /></label>
              <button type="button">로그인</button>
              <p data-testid="status">로그인 전</p>
              <p data-testid="orders">주문 로딩 중</p>
              <script>
                document.querySelector('button').addEventListener('click', () => {
                  document.querySelector('[data-testid=status]').textContent = '점검 로그인 완료';
                });
                fetch('/api/orders').then(response => response.json()).then(data => {
                  document.querySelector('[data-testid=orders]').textContent = \`주문 \${data.orders.length}건\`;
                });
              <\/script>
            </main>
            """

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.route("**/app", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body=appHtml))
                page.route("**/api/orders", lambda route: route.fulfill(status=200, content_type="application/json", body=json.dumps({"orders": [101, 102, 103, ___]})))
                page.goto("https://codaro.local/app")
                page.get_by_label("이메일").fill("ops@codaro.local")
                page.get_by_role("button", name="로그인").click()
                expect(page.get_by_test_id("status")).to_have_text("점검 로그인 완료")
                expect(page.get_by_test_id("orders")).to_have_text("주문 4건")
                page.screenshot(path=screenshotPath)
                browser.close()

            report = {"passed": True, "orders": 4, "screenshot": screenshotPath.name}
            reportPath.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
            return {"passed": report["passed"], "orders": report["orders"], "screenshotExists": screenshotPath.exists(), "reportExists": reportPath.exists()}

        completion = runBrowserAudit()
        assert completion == {"passed": True, "orders": 4, "screenshotExists": True, "reportExists": True}
        completion
      solution: |-
        from pathlib import Path
        import json
        import os
        import tempfile
        from playwright.sync_api import sync_playwright, expect

        def runBrowserAudit():
            outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-project"
            outputDir.mkdir(parents=True, exist_ok=True)
            screenshotPath = outputDir / "final-dashboard.png"
            reportPath = outputDir / "final-report.json"
            appHtml = """
            <main>
              <h1>주문 운영 점검</h1>
              <label>이메일 <input name="email" /></label>
              <button type="button">로그인</button>
              <p data-testid="status">로그인 전</p>
              <p data-testid="orders">주문 로딩 중</p>
              <script>
                document.querySelector('button').addEventListener('click', () => {
                  document.querySelector('[data-testid=status]').textContent = '점검 로그인 완료';
                });
                fetch('/api/orders').then(response => response.json()).then(data => {
                  document.querySelector('[data-testid=orders]').textContent = \`주문 \${data.orders.length}건\`;
                });
              <\/script>
            </main>
            """

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.route("**/app", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body=appHtml))
                page.route("**/api/orders", lambda route: route.fulfill(status=200, content_type="application/json", body=json.dumps({"orders": [101, 102, 103, 104]})))
                page.goto("https://codaro.local/app")
                page.get_by_label("이메일").fill("ops@codaro.local")
                page.get_by_role("button", name="로그인").click()
                expect(page.get_by_test_id("status")).to_have_text("점검 로그인 완료")
                expect(page.get_by_test_id("orders")).to_have_text("주문 4건")
                page.screenshot(path=screenshotPath)
                browser.close()

            report = {"passed": True, "orders": 4, "screenshot": screenshotPath.name}
            reportPath.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
            return {"passed": report["passed"], "orders": report["orders"], "screenshotExists": screenshotPath.exists(), "reportExists": reportPath.exists()}

        completion = runBrowserAudit()
        assert completion == {"passed": True, "orders": 4, "screenshotExists": True, "reportExists": True}
        completion
      hints:
        - orders 배열 항목 수, expect 문자열, report의 orders 값을 모두 4로 맞추세요.
        - completion은 passed, orders, screenshotExists, reportExists 네 키를 유지해야 합니다.
    check:
      noError: runBrowserAudit 함수가 브라우저 실행, mock, 파일 저장을 모두 완료해야 합니다.
      resultCheck: completion이 passed True, orders 4, 파일 존재 True를 모두 보여야 합니다.
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
  - id: playwright_10-browser-audit-report-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - project-html
    - final-browser-audit-completion
    title: 종합 브라우저 점검 report 판정하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 필수 scenario·viewport·접근성·network 증거가 모두 있는지 release 전에 감사한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - case 수가 아니라 필수 scenario와 viewport 집합을 직접 비교하고 JSON audit에 보존하세요.
    - 시각 통과와 접근성·network 경계를 한 release 판정에 묶으세요.
    exercise:
      prompt: audit_browser_report(report, required_scenarios, required_viewports, output_path)를 완성해 release 판정을 반환하고, output_path에는
        같은 결과를 한 행짜리 JSON table로 저장하세요.
      starterCode: |-
        def audit_browser_report(report, required_scenarios, required_viewports, output_path=None):
            raise NotImplementedError
      solution: |
        import json
        from pathlib import Path


        def audit_browser_report(report, required_scenarios, required_viewports, output_path=None):
            observed_scenarios = {case["scenario"] for case in report.get("cases", []) if case.get("passed")}
            observed_viewports = {f"{case['width']}x{case['height']}" for case in report.get("cases", []) if case.get("passed")}
            missing_scenarios = sorted(set(required_scenarios) - observed_scenarios)
            missing_viewports = sorted(set(required_viewports) - observed_viewports)
            failures = []
            if missing_scenarios:
                failures.append("scenario-coverage")
            if missing_viewports:
                failures.append("viewport-coverage")
            if report.get("accessibilityViolations", 0) != 0:
                failures.append("accessibility")
            if report.get("unexpectedRequests", 0) != 0:
                failures.append("network")
            result = {"releaseReady": not failures, "failures": failures, "missingScenarios": missing_scenarios, "missingViewports": missing_viewports}
            default_path = "output/ready-browser-audit.json" if result["releaseReady"] else "output/a11y-network-audit.json" if {"accessibility", "network"} & set(failures) else "output/coverage-gap-audit.json"
            target = Path(output_path or default_path)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(json.dumps([result], ensure_ascii=False, sort_keys=True, indent=2), encoding="utf-8")
            return result
      hints: *id001
    check:
      id: python.playwright.playwright_10.browser-audit-report.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_10.browser-audit-report.mastery.behavior.v1.fixture
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
        entry: audit_browser_report
        cases:
        - id: accepts-complete-report
          arguments:
          - value:
              cases:
              - scenario: home
                width: 390
                height: 844
                passed: true
              - scenario: run
                width: 1440
                height: 900
                passed: true
              accessibilityViolations: 0
              unexpectedRequests: 0
          - value:
            - home
            - run
          - value:
            - 390x844
            - 1440x900
          - value: output/ready-browser-audit.json
          expectedReturn:
            releaseReady: true
            failures: []
            missingScenarios: []
            missingViewports: []
        - id: reports-coverage-gaps
          arguments:
          - value:
              cases:
              - scenario: home
                width: 390
                height: 844
                passed: true
          - value:
            - home
            - error
          - value:
            - 390x844
            - 1440x900
          - value: output/coverage-gap-audit.json
          expectedReturn:
            releaseReady: false
            failures:
            - scenario-coverage
            - viewport-coverage
            missingScenarios:
            - error
            missingViewports:
            - 1440x900
        - id: reports-a11y-and-network
          arguments:
          - value:
              cases: []
              accessibilityViolations: 2
              unexpectedRequests: 1
          - value: []
          - value: []
          - value: output/a11y-network-audit.json
          expectedReturn:
            releaseReady: false
            failures:
            - accessibility
            - network
            missingScenarios: []
            missingViewports: []
        expectedPaths:
        - path: output/ready-browser-audit.json
          kind: table
          origin: created
          format: json
          columns:
          - failures
          - missingScenarios
          - missingViewports
          - releaseReady
        - path: output/coverage-gap-audit.json
          kind: table
          origin: created
          format: json
          columns:
          - failures
          - missingScenarios
          - missingViewports
          - releaseReady
        - path: output/a11y-network-audit.json
          kind: table
          origin: created
          format: json
          columns:
          - failures
          - missingScenarios
          - missingViewports
          - releaseReady
        normalizeReturnPaths: []
  transferVariants:
  - id: playwright_10-consecutive-release-decision-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - playwright_10-browser-audit-report-mastery
    title: 새 브라우저 audit의 연속 통과 조건 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 같은 source hash에서 연속 green과 증거 freshness를 검사한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 이전 source의 green report를 현재 release 증거로 합치지 마세요.
    - 마지막 한 번의 pass가 아니라 실패 뒤 다시 쌓인 연속 streak를 보세요.
    exercise:
      prompt: decide_browser_release(runs, required_consecutive, current_source_hash)를 완성하세요.
      starterCode: |-
        def decide_browser_release(runs, required_consecutive, current_source_hash):
            raise NotImplementedError
      solution: |
        def decide_browser_release(runs, required_consecutive, current_source_hash):
            if required_consecutive <= 0:
                raise ValueError("required consecutive must be positive")
            streak = 0
            stale = []
            for run in sorted(runs, key=lambda item: item["sequence"]):
                if run["sourceHash"] != current_source_hash:
                    stale.append(run["sequence"])
                    continue
                streak = streak + 1 if run["passed"] else 0
            return {"releaseReady": streak >= required_consecutive and not stale, "currentStreak": streak, "staleSequences": stale}
      hints: *id002
    check:
      id: python.playwright.playwright_10.consecutive-release-decision.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_10.consecutive-release-decision.transfer.behavior.v1.fixture
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
        entry: decide_browser_release
        cases:
        - id: accepts-two-current-greens
          arguments:
          - value:
            - sequence: 1
              sourceHash: abc
              passed: true
            - sequence: 2
              sourceHash: abc
              passed: true
          - value: 2
          - value: abc
          expectedReturn:
            releaseReady: true
            currentStreak: 2
            staleSequences: []
        - id: resets-streak-after-failure
          arguments:
          - value:
            - sequence: 1
              sourceHash: abc
              passed: true
            - sequence: 2
              sourceHash: abc
              passed: false
            - sequence: 3
              sourceHash: abc
              passed: true
          - value: 2
          - value: abc
          expectedReturn:
            releaseReady: false
            currentStreak: 1
            staleSequences: []
        - id: rejects-stale-evidence
          arguments:
          - value:
            - sequence: 1
              sourceHash: old
              passed: true
            - sequence: 2
              sourceHash: abc
              passed: true
          - value: 1
          - value: abc
          expectedReturn:
            releaseReady: false
            currentStreak: 1
            staleSequences:
            - 1
        - id: rejects-zero-requirement
          arguments:
          - value: []
          - value: 0
          - value: abc
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: playwright_10-browser-audit-capstone-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - playwright_10-consecutive-release-decision-transfer
    title: 종합 브라우저 점검 종료 조건 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 기능·시각·접근성·안전 증거의 완료 경계를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 브라우저 동작 성공과 사용자 목표 달성을 같은 것으로 취급하지 마세요.
    - 선택한 action과 함께 판정 가능한 evidence와 남는 risk를 기록하세요.
    exercise:
      prompt: choose_browser_audit_gate(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_browser_audit_gate(situation):
            raise NotImplementedError
      solution: |
        def choose_browser_audit_gate(situation):
            table = {'functional': {'action': 'run user-outcome scenarios', 'evidence': 'semantic assertions and artifacts', 'risk': 'route-only coverage'}, 'visual-accessible': {'action': 'test viewports and accessibility', 'evidence': 'screenshots axe manual matrix', 'risk': 'desktop-only green'}, 'release': {'action': 'require current consecutive green', 'evidence': 'source-bound reports', 'risk': 'stale or flaky pass'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.playwright.playwright_10.browser-audit-capstone-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_10.browser-audit-capstone-recall.retrieval.behavior.v1.fixture
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
        entry: choose_browser_audit_gate
        cases:
        - id: recalls-functional
          arguments:
          - value: functional
          expectedReturn:
            action: run user-outcome scenarios
            evidence: semantic assertions and artifacts
            risk: route-only coverage
        - id: recalls-visual-accessible
          arguments:
          - value: visual-accessible
          expectedReturn:
            action: test viewports and accessibility
            evidence: screenshots axe manual matrix
            risk: desktop-only green
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};