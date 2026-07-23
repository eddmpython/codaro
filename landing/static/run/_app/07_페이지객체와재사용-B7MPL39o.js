var e=`meta:
  id: playwright_07
  title: 페이지 객체와 재사용
  order: 7
  category: playwright
  difficulty: medium
  audience: Python 기본 문법을 익힌 자동화 입문자
  packages:
    - playwright
  tags:
    - playwright
    - page-object
    - helper
    - 재사용
intro:
  direction: 반복되는 locator와 검증 코드를 함수와 클래스로 묶어 재사용 가능한 브라우저 점검 루틴을 만든다.
  benefits:
    - 같은 화면 점검을 여러 셀과 자동화 태스크에서 반복 사용할 수 있다.
    - locator 변경 지점을 한 곳으로 모을 수 있다.
    - 최종 점검 결과를 함수 반환값으로 구조화할 수 있다.
  diagram:
    steps:
      - label: 화면 생성 함수 분리
        detail: 테스트 HTML을 만드는 부분을 함수로 옮겨 입력값만 바꾸며 반복합니다.
      - label: locator 헬퍼 작성
        detail: 자주 쓰는 heading, status, action 버튼 접근을 함수나 메서드로 감쌉니다.
      - label: Page Object 클래스 구성
        detail: 페이지 조작과 검증을 클래스에 모아 호출 코드를 짧게 만듭니다.
      - label: 재사용 점검 완료
        detail: 같은 객체로 다른 상태 값을 검증하고 결과 딕셔너리를 반환합니다.
    runtime:
      - label: Python 함수와 클래스 실행
        detail: helper 함수와 Page Object 클래스가 Playwright page 객체를 인자로 받아 동작해야 합니다.
      - label: 로컬 화면 재사용
        detail: page.set_content로 만든 HTML을 여러 검증 함수에서 다시 사용합니다.
      - label: 결과 객체 검증
        detail: helper가 반환한 상태 딕셔너리를 assert로 확인합니다.
sections:
  - id: html-factory
    title: HTML 생성 함수 만들기
    structuredPrimary: true
    subtitle: 입력값만 바꾸는 화면
    goal: 제목과 상태를 인자로 받아 실습 HTML을 만드는 함수를 작성한다.
    why: 화면 fixture를 함수로 분리하면 같은 구조에서 값만 바꿔 여러 검증을 반복할 수 있다.
    explanation: Playwright 실습에서 HTML 문자열이 길어지면 핵심 검증 코드가 흐려집니다. HTML 생성 함수를 만들면 테스트 데이터와 화면 구조를 분리할 수 있습니다. 이 방식은 실제 테스트 fixture나 자동화 템플릿으로 확장하기 쉽습니다.
    tips:
      - 함수 인자는 화면에서 바뀌는 값만 받도록 작게 유지합니다.
      - data-testid 같은 자동화 계약은 함수 안에서 일관되게 유지합니다.
    snippet: |-
      def dashboardHtml(title: str, status: str) -> str:
          return f"<main><h1>{title}</h1><p data-testid='status'>{status}</p></main>"

      html = dashboardHtml("주문 대시보드", "정상")
      assert "<h1>주문 대시보드</h1>" in html
      assert "data-testid='status'" in html
      html
    exercise:
      prompt: dashboardHtml을 사용해 "배송 대시보드"와 "검토 필요" 상태를 가진 HTML을 만들고 검증하세요.
      starterCode: |-
        def dashboardHtml(title: str, status: str) -> str:
            return f"<main><h1>{title}</h1><p data-testid='status'>{status}</p></main>"

        html = dashboardHtml("___", "___")
        assert "배송 대시보드" in html
        assert "검토 필요" in html
        html
      solution: |-
        def dashboardHtml(title: str, status: str) -> str:
            return f"<main><h1>{title}</h1><p data-testid='status'>{status}</p></main>"

        html = dashboardHtml("배송 대시보드", "검토 필요")
        assert "배송 대시보드" in html
        assert "검토 필요" in html
        html
      hints:
        - 함수 본문은 그대로 두고 호출 인자만 바꾸세요.
        - assert 문자열은 호출 인자와 같아야 합니다.
    check:
      noError: dashboardHtml 함수 정의와 호출이 상태 텍스트 HTML을 만들어야 합니다.
      resultCheck: html 문자열에 바꾼 title과 status가 모두 포함되어야 합니다.
  - id: page-helper
    title: page 헬퍼 함수 작성
    structuredPrimary: true
    subtitle: 읽기 로직 감싸기
    goal: Playwright page에서 heading과 status를 읽어 딕셔너리로 반환하는 헬퍼를 만든다.
    why: 화면에서 값을 읽는 코드가 반복되면 locator 변경 때 여러 셀을 고쳐야 하므로 헬퍼로 모으는 편이 낫다.
    explanation: page 객체를 인자로 받는 함수는 Playwright 자동화에서 가장 단순한 재사용 단위입니다. locator가 바뀌어도 함수 안만 고치면 호출부는 그대로 둘 수 있습니다. 이 섹션은 readDashboard 함수로 heading과 status를 반환합니다.
    tips:
      - 함수는 page를 만들지 말고 이미 만들어진 page를 인자로 받게 합니다.
      - 반환값은 테스트하기 쉬운 dict로 둡니다.
    snippet: |-
      from playwright.sync_api import sync_playwright

      def readDashboard(page):
          return {
              "heading": page.get_by_role("heading").inner_text(),
              "status": page.get_by_test_id("status").inner_text(),
          }

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content("<main><h1>주문</h1><p data-testid='status'>정상</p></main>")
          result = readDashboard(page)
          browser.close()

      assert result == {"heading": "주문", "status": "정상"}
      result
    exercise:
      prompt: HTML 값을 "배송", "보류"로 바꾸고 readDashboard 결과 검증을 맞추세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright

        def readDashboard(page):
            return {
                "heading": page.get_by_role("heading").inner_text(),
                "status": page.get_by_test_id("status").inner_text(),
            }

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content("<main><h1>___</h1><p data-testid='status'>___</p></main>")
            result = readDashboard(page)
            browser.close()

        assert result == {"heading": "배송", "status": "보류"}
        result
      solution: |-
        from playwright.sync_api import sync_playwright

        def readDashboard(page):
            return {
                "heading": page.get_by_role("heading").inner_text(),
                "status": page.get_by_test_id("status").inner_text(),
            }

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content("<main><h1>배송</h1><p data-testid='status'>보류</p></main>")
            result = readDashboard(page)
            browser.close()

        assert result == {"heading": "배송", "status": "보류"}
        result
      hints:
        - HTML에 넣은 heading과 status를 assert 딕셔너리에 그대로 반영하세요.
        - readDashboard 함수는 고치지 않아도 됩니다.
    check:
      noError: readDashboard가 page locator를 통해 두 값을 모두 읽어야 합니다.
      resultCheck: result 딕셔너리가 화면의 heading과 status 값을 반영해야 합니다.
  - id: page-object-class
    title: Page Object 클래스 만들기
    structuredPrimary: true
    subtitle: DashboardPage
    goal: dashboard 조작과 상태 읽기를 DashboardPage 클래스로 묶는다.
    why: 화면이 커질수록 조작 함수가 흩어지기 쉬우므로 페이지 단위 객체가 변경 지점을 줄인다.
    explanation: Page Object는 page를 보관하고 화면에 대한 행동을 메서드로 제공합니다. 여기서는 markComplete와 statusText를 클래스에 넣습니다. 호출부는 "상태를 완료로 바꾼다"는 업무 흐름만 보여주므로 읽기 쉬워집니다.
    tips:
      - 클래스는 Playwright page를 직접 만들지 않고 생성자에서 받습니다.
      - 메서드 이름은 clickButton보다 업무 동작을 드러내는 이름이 좋습니다.
    snippet: |-
      from playwright.sync_api import sync_playwright, expect

      class DashboardPage:
          def __init__(self, page):
              self.page = page

          def markComplete(self):
              self.page.get_by_role("button", name="완료 처리").click()

          def statusText(self):
              return self.page.get_by_test_id("status").inner_text()

      html = "<button onclick=\\"document.querySelector('[data-testid=status]').textContent='완료'\\">완료 처리</button><p data-testid='status'>대기</p>"

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(html)
          dashboard = DashboardPage(page)
          dashboard.markComplete()
          expect(page.get_by_test_id("status")).to_have_text("완료")
          status = dashboard.statusText()
          browser.close()

      assert status == "완료"
      status
    exercise:
      prompt: 완료 상태 문구를 "검수 완료"로 바꾸고 DashboardPage 호출 결과를 검증하세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright, expect

        class DashboardPage:
            def __init__(self, page):
                self.page = page

            def markComplete(self):
                self.page.get_by_role("button", name="완료 처리").click()

            def statusText(self):
                return self.page.get_by_test_id("status").inner_text()

        html = "<button onclick=\\"document.querySelector('[data-testid=status]').textContent='___'\\">완료 처리</button><p data-testid='status'>대기</p>"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            dashboard = DashboardPage(page)
            dashboard.markComplete()
            expect(page.get_by_test_id("status")).to_have_text("검수 완료")
            status = dashboard.statusText()
            browser.close()

        assert status == "검수 완료"
        status
      solution: |-
        from playwright.sync_api import sync_playwright, expect

        class DashboardPage:
            def __init__(self, page):
                self.page = page

            def markComplete(self):
                self.page.get_by_role("button", name="완료 처리").click()

            def statusText(self):
                return self.page.get_by_test_id("status").inner_text()

        html = "<button onclick=\\"document.querySelector('[data-testid=status]').textContent='검수 완료'\\">완료 처리</button><p data-testid='status'>대기</p>"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            dashboard = DashboardPage(page)
            dashboard.markComplete()
            expect(page.get_by_test_id("status")).to_have_text("검수 완료")
            status = dashboard.statusText()
            browser.close()

        assert status == "검수 완료"
        status
      hints:
        - onclick에서 바꾸는 문구와 expect/assert 문구를 같게 맞추세요.
        - DashboardPage 메서드 이름은 그대로 둬도 됩니다.
    check:
      noError: DashboardPage 생성, markComplete 호출, statusText 읽기가 완료 상태 문자열을 반환해야 합니다.
      resultCheck: status 값이 클릭 후 바뀐 화면 상태와 일치해야 합니다.
  - id: reusable-completion
    title: 재사용 점검 완료
    structuredPrimary: true
    subtitle: helper와 클래스 조합
    goal: helper 함수와 Page Object를 조합해 같은 화면 구조의 다른 상태를 검증한다.
    why: 재사용 설계는 한 화면만 통과하는 코드가 아니라 값이 바뀌어도 유지되는 자동화를 만든다.
    explanation: 마지막 섹션은 HTML factory, Page Object, 결과 dict를 한 흐름으로 묶습니다. 같은 DashboardPage로 다른 상태를 읽어도 검증이 유지되어야 합니다. 이것이 종합 프로젝트에서 여러 화면을 점검하는 기본 구조입니다.
    tips:
      - 데이터만 바꿔 같은 함수와 클래스를 다시 사용하는지 확인합니다.
      - completion 결과는 passed와 details를 함께 담으면 읽기 쉽습니다.
    snippet: |-
      from playwright.sync_api import sync_playwright

      def dashboardHtml(name: str, status: str) -> str:
          return f"<main><h1>{name}</h1><p data-testid='status'>{status}</p></main>"

      class DashboardPage:
          def __init__(self, page):
              self.page = page

          def summary(self):
              return {
                  "name": self.page.get_by_role("heading").inner_text(),
                  "status": self.page.get_by_test_id("status").inner_text(),
              }

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(dashboardHtml("정산", "완료"))
          completion = DashboardPage(page).summary()
          browser.close()

      assert completion == {"name": "정산", "status": "완료"}
      completion
    exercise:
      prompt: 점검 대상을 "배송"과 "진행중"으로 바꾸고 completion 검증을 통과시키세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright

        def dashboardHtml(name: str, status: str) -> str:
            return f"<main><h1>{name}</h1><p data-testid='status'>{status}</p></main>"

        class DashboardPage:
            def __init__(self, page):
                self.page = page

            def summary(self):
                return {
                    "name": self.page.get_by_role("heading").inner_text(),
                    "status": self.page.get_by_test_id("status").inner_text(),
                }

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(dashboardHtml("___", "___"))
            completion = DashboardPage(page).summary()
            browser.close()

        assert completion == {"name": "배송", "status": "진행중"}
        completion
      solution: |-
        from playwright.sync_api import sync_playwright

        def dashboardHtml(name: str, status: str) -> str:
            return f"<main><h1>{name}</h1><p data-testid='status'>{status}</p></main>"

        class DashboardPage:
            def __init__(self, page):
                self.page = page

            def summary(self):
                return {
                    "name": self.page.get_by_role("heading").inner_text(),
                    "status": self.page.get_by_test_id("status").inner_text(),
                }

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(dashboardHtml("배송", "진행중"))
            completion = DashboardPage(page).summary()
            browser.close()

        assert completion == {"name": "배송", "status": "진행중"}
        completion
      hints:
        - dashboardHtml 호출 인자와 assert 딕셔너리 값을 같게 맞추세요.
        - summary 메서드가 어떤 locator를 읽는지 확인하세요.
    check:
      noError: helper와 Page Object 조합이 상태 전환과 텍스트 확인을 함께 수행해야 합니다.
      resultCheck: completion 딕셔너리가 바꾼 점검 대상과 상태를 반영해야 합니다.
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
  - id: playwright_07-page-object-contract-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - html-factory
    - reusable-completion
    title: Page Object의 locator 소유권과 action 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 외부 locator 노출과 assertion 혼합을 찾아 재사용 경계를 판정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - Page Object는 locator를 숨기고 사용자의 의미 있는 action을 제공해야 합니다.
    - 상태 변경 action과 기대 결과 assertion을 분리해 실패 원인을 보존하세요.
    exercise:
      prompt: audit_page_object(spec)를 완성하세요.
      starterCode: |-
        def audit_page_object(spec):
            raise NotImplementedError
      solution: |
        def audit_page_object(spec):
            failures = []
            if not spec.get("actions"):
                failures.append("no-actions")
            exposed = sorted(name for name, visibility in spec.get("locators", {}).items() if visibility == "public")
            if exposed:
                failures.append("public-locators")
            mixed = sorted(action["name"] for action in spec.get("actions", []) if action.get("asserts") and action.get("mutates"))
            if mixed:
                failures.append("mixed-action-assertion")
            return {"reusable": not failures, "failures": failures, "exposedLocators": exposed, "mixedActions": mixed}
      hints: *id001
    check:
      id: python.playwright.playwright_07.page-object-contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_07.page-object-contract.mastery.behavior.v1.fixture
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
        entry: audit_page_object
        cases:
        - id: accepts-encapsulated-actions
          arguments:
          - value:
              locators:
                email: private
                save: private
              actions:
              - name: fillProfile
                mutates: true
                asserts: false
              - name: readNotice
                mutates: false
                asserts: false
          expectedReturn:
            reusable: true
            failures: []
            exposedLocators: []
            mixedActions: []
        - id: reports-public-locator-and-mixing
          arguments:
          - value:
              locators:
                submit: public
              actions:
              - name: submitAndVerify
                mutates: true
                asserts: true
          expectedReturn:
            reusable: false
            failures:
            - public-locators
            - mixed-action-assertion
            exposedLocators:
            - submit
            mixedActions:
            - submitAndVerify
        - id: reports-empty-object
          arguments:
          - value:
              locators: {}
          expectedReturn:
            reusable: false
            failures:
            - no-actions
            exposedLocators: []
            mixedActions: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: playwright_07-journey-dependency-plan-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - playwright_07-page-object-contract-mastery
    title: 새 사용자 여정에 action 의존성 계획 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 제공되는 Page Object action만으로 여정이 구성되는지 순서대로 검사한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 여정 코드에서 locator를 다시 만들지 말고 공개 action 계약을 사용하세요.
    - 누락 action의 원래 step index를 남겨 설계 책임 위치를 찾으세요.
    exercise:
      prompt: plan_journey(actions, available_actions)를 완성하세요.
      starterCode: |-
        def plan_journey(actions, available_actions):
            raise NotImplementedError
      solution: |
        def plan_journey(actions, available_actions):
            available = set(available_actions)
            missing = []
            plan = []
            for index, action in enumerate(actions):
                name = action["action"]
                if name not in available:
                    missing.append({"index": index, "action": name})
                else:
                    plan.append({"step": index + 1, "object": action["object"], "action": name})
            return {"ready": not missing, "plan": plan, "missing": missing}
      hints: *id002
    check:
      id: python.playwright.playwright_07.journey-dependency-plan.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_07.journey-dependency-plan.transfer.behavior.v1.fixture
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
        entry: plan_journey
        cases:
        - id: plans-known-actions
          arguments:
          - value:
            - object: LoginPage
              action: signIn
            - object: OrdersPage
              action: openOrder
          - value:
            - signIn
            - openOrder
          expectedReturn:
            ready: true
            plan:
            - step: 1
              object: LoginPage
              action: signIn
            - step: 2
              object: OrdersPage
              action: openOrder
            missing: []
        - id: reports-missing-middle-action
          arguments:
          - value:
            - object: A
              action: open
            - object: B
              action: delete
            - object: B
              action: close
          - value:
            - open
            - close
          expectedReturn:
            ready: false
            plan:
            - step: 1
              object: A
              action: open
            - step: 3
              object: B
              action: close
            missing:
            - index: 1
              action: delete
        - id: handles-empty-journey
          arguments:
          - value: []
          - value:
            - open
          expectedReturn:
            ready: true
            plan: []
            missing: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: playwright_07-page-object-boundary-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - playwright_07-journey-dependency-plan-transfer
    title: Page Object 경계 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: locator·action·assertion의 책임 위치를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 브라우저 동작 성공과 사용자 목표 달성을 같은 것으로 취급하지 마세요.
    - 선택한 action과 함께 판정 가능한 evidence와 남는 risk를 기록하세요.
    exercise:
      prompt: choose_page_object_boundary(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_page_object_boundary(situation):
            raise NotImplementedError
      solution: |
        def choose_page_object_boundary(situation):
            table = {'locator-change': {'action': 'update inside page object', 'evidence': 'unchanged journey API', 'risk': 'locator leakage'}, 'user-action': {'action': 'expose intent-named method', 'evidence': 'stable action contract', 'risk': 'click-level API'}, 'expected-outcome': {'action': 'assert in scenario', 'evidence': 'business expectation', 'risk': 'hidden assertion in action'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.playwright.playwright_07.page-object-boundary-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_07.page-object-boundary-recall.retrieval.behavior.v1.fixture
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
        entry: choose_page_object_boundary
        cases:
        - id: recalls-locator-change
          arguments:
          - value: locator-change
          expectedReturn:
            action: update inside page object
            evidence: unchanged journey API
            risk: locator leakage
        - id: recalls-user-action
          arguments:
          - value: user-action
          expectedReturn:
            action: expose intent-named method
            evidence: stable action contract
            risk: click-level API
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};