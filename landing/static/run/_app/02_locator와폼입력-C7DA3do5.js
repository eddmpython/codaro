var e=`meta:
  id: playwright_02
  title: locator와 폼 입력
  order: 2
  category: playwright
  difficulty: easy
  audience: Python 기본 문법을 익힌 자동화 입문자
  packages:
    - playwright
  outcomes: ["automation.browser.formInput"]
  prerequisites: ["automation.browser.basics"]
  estimatedMinutes: 45
  tags:
    - playwright
    - locator
    - form
    - 접근성
intro:
  direction: role, label, text, test id locator로 폼을 채우고 사용자 관점의 결과를 검증한다.
  benefits:
    - CSS 선택자보다 의도가 잘 보이는 locator를 고를 수 있다.
    - label 기반 입력과 button 클릭으로 폼 자동화를 만들 수 있다.
    - 목록과 카드 UI에서 특정 항목만 안정적으로 고를 수 있다.
  diagram:
    steps:
      - label: 접근성 이름 기준 선택
        detail: heading, button, textbox처럼 사용자가 인식하는 역할로 요소를 찾습니다.
      - label: 라벨 연결 입력 수행
        detail: get_by_label로 입력칸을 채우고 제출 버튼으로 결과를 만듭니다.
      - label: 목록 필터로 항목 좁히기
        detail: 여러 카드 중 텍스트가 포함된 항목을 골라 원하는 버튼만 클릭합니다.
      - label: 폼 자동화 완료 기록
        detail: 입력값, 선택 항목, 결과 문구를 딕셔너리로 묶어 완료 상태를 검증합니다.
    runtime:
      - label: playwright locator API 확인
        detail: sync API에서 get_by_role, get_by_label, get_by_test_id가 실행되어야 합니다.
      - label: 로컬 폼 HTML 실행
        detail: 외부 로그인 없이 page.set_content로 폼과 목록 UI를 만듭니다.
      - label: 사용자 결과 검증
        detail: 입력 뒤 화면 문구가 예상값으로 바뀌는지 expect와 assert로 확인합니다.
sections:
  - id: role-locator
    title: role locator로 화면 읽기
    structuredPrimary: true
    subtitle: heading과 button
    goal: get_by_role로 제목과 버튼을 찾고 화면에 보이는 이름을 검증한다.
    why: role locator는 실제 사용자가 조작하는 의미를 코드에 남겨 유지보수 비용을 줄인다.
    explanation: get_by_role은 버튼, 제목, 체크박스처럼 접근성 트리에 나타나는 역할을 기준으로 요소를 찾습니다. name을 함께 쓰면 같은 역할의 요소가 여러 개 있어도 의도를 명확히 지정할 수 있습니다. 이 방식은 자동화 코드가 화면 명세처럼 읽히게 만듭니다.
    tips:
      - role만 쓰면 여러 요소가 걸릴 수 있으니 name을 함께 쓰는 습관을 들입니다.
      - heading 이름은 화면 제목 변경을 바로 드러내는 좋은 검증 지점입니다.
    snippet: |-
      from playwright.sync_api import sync_playwright, expect

      html = """
      <main>
        <h1>재고 점검</h1>
        <button>새로고침</button>
      </main>
      """

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(html)
          expect(page.get_by_role("heading", name="재고 점검")).to_be_visible()
          buttonText = page.get_by_role("button", name="새로고침").inner_text()
          browser.close()

      assert buttonText == "새로고침"
      buttonText
    exercise:
      prompt: 버튼 이름을 "동기화"로 바꾸고 role locator와 assert를 함께 수정하세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <main>
          <h1>재고 점검</h1>
          <button>___</button>
        </main>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            expect(page.get_by_role("heading", name="재고 점검")).to_be_visible()
            buttonText = page.get_by_role("button", name="___").inner_text()
            browser.close()

        assert buttonText == "동기화"
        buttonText
      solution: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <main>
          <h1>재고 점검</h1>
          <button>동기화</button>
        </main>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            expect(page.get_by_role("heading", name="재고 점검")).to_be_visible()
            buttonText = page.get_by_role("button", name="동기화").inner_text()
            browser.close()

        assert buttonText == "동기화"
        buttonText
      hints:
        - 버튼 텍스트, locator name, assert 값을 같은 문자열로 맞춥니다.
        - heading 검증은 그대로 두고 버튼 기준만 바꾸면 됩니다.
    check:
      noError: role locator가 heading과 button을 각각 하나씩 찾아야 합니다.
      resultCheck: buttonText가 바꾼 버튼 이름과 일치해야 합니다.
  - id: label-input
    title: label로 입력칸 채우기
    structuredPrimary: true
    subtitle: get_by_label과 fill
    goal: label이 연결된 입력칸에 값을 넣고 제출 결과를 화면에서 확인한다.
    why: 실제 폼 자동화는 placeholder보다 label 기준으로 입력칸을 찾는 편이 의도와 접근성을 함께 지킨다.
    explanation: label 태그와 input id가 연결되어 있으면 get_by_label로 입력칸을 안정적으로 찾을 수 있습니다. fill은 기존 값을 지우고 새 값을 입력합니다. 제출 버튼 클릭 뒤 화면 결과를 읽으면 입력 자동화가 성공했는지 바로 검증할 수 있습니다.
    tips:
      - label의 for 값과 input id가 맞아야 get_by_label이 동작합니다.
      - 입력 후에는 value만 보지 말고 화면에 나타난 결과 문구를 함께 검증합니다.
    snippet: |-
      from playwright.sync_api import sync_playwright, expect

      html = """
      <label for="email">이메일</label>
      <input id="email" />
      <button onclick="document.querySelector('[data-testid=result]').textContent = document.querySelector('#email').value">등록</button>
      <p data-testid="result"></p>
      """

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(html)
          page.get_by_label("이메일").fill("ops@codaro.local")
          page.get_by_role("button", name="등록").click()
          result = page.get_by_test_id("result")
          expect(result).to_have_text("ops@codaro.local")
          submitted = result.inner_text()
          browser.close()

      assert submitted == "ops@codaro.local"
      submitted
    exercise:
      prompt: 이메일 입력값을 "team@codaro.local"로 바꾸고 제출 결과를 검증하세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <label for="email">이메일</label>
        <input id="email" />
        <button onclick="document.querySelector('[data-testid=result]').textContent = document.querySelector('#email').value">등록</button>
        <p data-testid="result"></p>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_label("이메일").fill("___")
            page.get_by_role("button", name="등록").click()
            result = page.get_by_test_id("result")
            expect(result).to_have_text("team@codaro.local")
            submitted = result.inner_text()
            browser.close()

        assert submitted == "___"
        submitted
      solution: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <label for="email">이메일</label>
        <input id="email" />
        <button onclick="document.querySelector('[data-testid=result]').textContent = document.querySelector('#email').value">등록</button>
        <p data-testid="result"></p>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_label("이메일").fill("team@codaro.local")
            page.get_by_role("button", name="등록").click()
            result = page.get_by_test_id("result")
            expect(result).to_have_text("team@codaro.local")
            submitted = result.inner_text()
            browser.close()

        assert submitted == "team@codaro.local"
        submitted
      hints:
        - fill 값, expect 값, assert 값을 같은 이메일 문자열로 맞춥니다.
        - button click 뒤에 result 텍스트가 채워집니다.
    check:
      noError: get_by_label fill과 button click이 제출 메시지 검증까지 이어져야 합니다.
      resultCheck: submitted 값이 입력한 이메일 문자열과 같아야 합니다.
  - id: filtered-list
    title: 목록에서 특정 항목 선택
    structuredPrimary: true
    subtitle: filter와 has_text
    goal: 여러 카드 중 텍스트가 포함된 항목만 골라 해당 버튼을 클릭한다.
    why: 실무 화면은 비슷한 카드와 버튼이 반복되므로 특정 행이나 카드로 범위를 좁히는 능력이 필요하다.
    explanation: locator.filter(has_text=...)는 반복 목록에서 특정 텍스트를 가진 항목만 좁혀 줍니다. 그 다음 get_by_role을 이어 쓰면 선택한 카드 안의 버튼만 클릭할 수 있습니다. 이 패턴은 테이블 행, 알림 카드, 주문 목록 자동화에서 자주 쓰입니다.
    tips:
      - 먼저 listitem을 찾고 filter로 범위를 줄인 뒤 버튼을 찾습니다.
      - 같은 버튼 이름이 여러 개 있어도 부모 locator를 좁히면 안전합니다.
    snippet: |-
      from playwright.sync_api import sync_playwright, expect

      html = """
      <ul>
        <li>주문 A <button>선택</button></li>
        <li>주문 B <button>선택</button></li>
        <li>주문 C <button>선택</button></li>
      </ul>
      <p data-testid="chosen"></p>
      <script>
      document.querySelectorAll('li').forEach(item => {
        item.querySelector('button').onclick = () => document.querySelector('[data-testid=chosen]').textContent = item.textContent.replace('선택', '').trim();
      });
      <\/script>
      """

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(html)
          page.get_by_role("listitem").filter(has_text="주문 B").get_by_role("button", name="선택").click()
          expect(page.get_by_test_id("chosen")).to_have_text("주문 B")
          chosen = page.get_by_test_id("chosen").inner_text()
          browser.close()

      assert chosen == "주문 B"
      chosen
    exercise:
      prompt: 선택 대상을 "주문 C"로 바꾸고 선택 결과를 검증하세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <ul>
          <li>주문 A <button>선택</button></li>
          <li>주문 B <button>선택</button></li>
          <li>주문 C <button>선택</button></li>
        </ul>
        <p data-testid="chosen"></p>
        <script>
        document.querySelectorAll('li').forEach(item => {
          item.querySelector('button').onclick = () => document.querySelector('[data-testid=chosen]').textContent = item.textContent.replace('선택', '').trim();
        });
        <\/script>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_role("listitem").filter(has_text="___").get_by_role("button", name="선택").click()
            expect(page.get_by_test_id("chosen")).to_have_text("주문 C")
            chosen = page.get_by_test_id("chosen").inner_text()
            browser.close()

        assert chosen == "___"
        chosen
      solution: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <ul>
          <li>주문 A <button>선택</button></li>
          <li>주문 B <button>선택</button></li>
          <li>주문 C <button>선택</button></li>
        </ul>
        <p data-testid="chosen"></p>
        <script>
        document.querySelectorAll('li').forEach(item => {
          item.querySelector('button').onclick = () => document.querySelector('[data-testid=chosen]').textContent = item.textContent.replace('선택', '').trim();
        });
        <\/script>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_role("listitem").filter(has_text="주문 C").get_by_role("button", name="선택").click()
            expect(page.get_by_test_id("chosen")).to_have_text("주문 C")
            chosen = page.get_by_test_id("chosen").inner_text()
            browser.close()

        assert chosen == "주문 C"
        chosen
      hints:
        - filter의 has_text와 assert의 문자열을 같은 주문명으로 맞추세요.
        - 버튼 이름은 모든 항목에서 같아도 부모 listitem을 좁히면 됩니다.
    check:
      noError: filter로 고른 listitem 안의 버튼 클릭이 strictness 위반 없이 목표 항목만 바꿔야 합니다.
      resultCheck: chosen 텍스트가 선택한 주문명과 일치해야 합니다.
  - id: form-completion
    title: 폼 입력 완료 리포트
    structuredPrimary: true
    subtitle: 입력값과 선택값 묶기
    goal: 폼 입력과 목록 선택 결과를 딕셔너리로 묶어 완료 상태를 검증한다.
    why: 자동화 결과를 구조화해야 다음 단계에서 JSON 저장, 알림, 테스트 실패 분석으로 확장할 수 있다.
    explanation: 폼 자동화는 보통 입력값, 선택값, 화면 결과를 함께 검증해야 의미가 있습니다. 이 섹션은 이메일 입력과 주문 선택을 한 페이지에서 수행한 뒤 결과를 딕셔너리로 묶습니다. 이렇게 만든 결과 객체는 리포트와 태스크 로그의 기본 단위가 됩니다.
    tips:
      - 입력과 선택을 함께 검증하면 폼 자동화의 앞뒤 맥락이 보입니다.
      - 결과 딕셔너리는 예상값과 직접 비교할 수 있어 테스트 작성이 쉽습니다.
    snippet: |-
      from playwright.sync_api import sync_playwright, expect

      html = """
      <label for="owner">담당자</label><input id="owner" />
      <button onclick="document.querySelector('[data-testid=owner]').textContent = document.querySelector('#owner').value">담당자 저장</button>
      <p data-testid="owner"></p>
      """

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(html)
          page.get_by_label("담당자").fill("Hana")
          page.get_by_role("button", name="담당자 저장").click()
          expect(page.get_by_test_id("owner")).to_have_text("Hana")
          report = {"owner": page.get_by_test_id("owner").inner_text(), "completed": True}
          browser.close()

      assert report == {"owner": "Hana", "completed": True}
      report
    exercise:
      prompt: 담당자 이름을 "Min"으로 바꾸고 report 딕셔너리 검증을 통과시키세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <label for="owner">담당자</label><input id="owner" />
        <button onclick="document.querySelector('[data-testid=owner]').textContent = document.querySelector('#owner').value">담당자 저장</button>
        <p data-testid="owner"></p>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_label("담당자").fill("___")
            page.get_by_role("button", name="담당자 저장").click()
            expect(page.get_by_test_id("owner")).to_have_text("Min")
            report = {"owner": page.get_by_test_id("owner").inner_text(), "completed": True}
            browser.close()

        assert report == {"owner": "___", "completed": True}
        report
      solution: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <label for="owner">담당자</label><input id="owner" />
        <button onclick="document.querySelector('[data-testid=owner]').textContent = document.querySelector('#owner').value">담당자 저장</button>
        <p data-testid="owner"></p>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_label("담당자").fill("Min")
            page.get_by_role("button", name="담당자 저장").click()
            expect(page.get_by_test_id("owner")).to_have_text("Min")
            report = {"owner": page.get_by_test_id("owner").inner_text(), "completed": True}
            browser.close()

        assert report == {"owner": "Min", "completed": True}
        report
      hints:
        - fill, expect, assert 안의 이름을 모두 같은 값으로 맞춥니다.
        - completed는 폼 자동화가 끝났다는 완료 신호입니다.
    check:
      noError: 담당자 입력, 저장 클릭, report 생성이 오류 없이 끝나야 합니다.
      resultCheck: report의 owner 값이 입력한 담당자 이름과 같아야 합니다.
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
  - id: playwright_02-locator-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - role-locator
    - form-completion
    title: locator의 유일성과 사용자 의미 판정하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: role·label·test id 전략과 실제 match 수를 함께 검사한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - locator 선언뿐 아니라 대상 화면에서 정확히 한 개가 매치되는지 확인하세요.
    - DOM 구조보다 사용자가 인지하는 role·label을 우선하세요.
    exercise:
      prompt: audit_locators(locators)를 완성하세요.
      starterCode: |-
        def audit_locators(locators):
            raise NotImplementedError
      solution: |
        def audit_locators(locators):
            failures = []
            accepted = []
            for locator in locators:
                name = locator["name"]
                if locator.get("matches") != 1:
                    failures.append({"name": name, "reason": "not-unique"})
                    continue
                if locator.get("strategy") not in {"role", "label", "placeholder", "test-id"}:
                    failures.append({"name": name, "reason": "brittle-strategy"})
                    continue
                accepted.append(name)
            return {"ready": not failures, "accepted": accepted, "failures": failures}
      hints: *id001
    check:
      id: python.playwright.playwright_02.locator-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_02.locator-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_locators
        cases:
        - id: accepts-semantic-locators
          arguments:
          - value:
            - name: email
              strategy: label
              matches: 1
            - name: save
              strategy: role
              matches: 1
          expectedReturn:
            ready: true
            accepted:
            - email
            - save
            failures: []
        - id: reports-duplicate-and-css
          arguments:
          - value:
            - name: row
              strategy: role
              matches: 3
            - name: submit
              strategy: css
              matches: 1
          expectedReturn:
            ready: false
            accepted: []
            failures:
            - name: row
              reason: not-unique
            - name: submit
              reason: brittle-strategy
        - id: keeps-valid-among-failures
          arguments:
          - value:
            - name: query
              strategy: placeholder
              matches: 1
            - name: missing
              strategy: test-id
              matches: 0
          expectedReturn:
            ready: false
            accepted:
            - query
            failures:
            - name: missing
              reason: not-unique
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: playwright_02-form-action-plan-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - playwright_02-locator-contract-audit-mastery
    title: 새 폼에 입력·검증 계획 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 필수 필드 누락과 예상 밖 입력을 찾고 입력 순서를 만든다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 입력값과 locator 계약을 분리해 값만 바뀌는 테스트를 재사용하세요.
    - 예상하지 않은 필드는 조용히 입력하지 말고 계획 단계에서 차단하세요.
    exercise:
      prompt: plan_form_actions(fields, values)를 완성하세요.
      starterCode: |-
        def plan_form_actions(fields, values):
            raise NotImplementedError
      solution: |
        def plan_form_actions(fields, values):
            field_names = {field["name"] for field in fields}
            required = {field["name"] for field in fields if field.get("required")}
            missing = sorted(name for name in required if name not in values or values[name] in {None, ""})
            unexpected = sorted(set(values) - field_names)
            actions = []
            for field in fields:
                name = field["name"]
                if name in values and values[name] not in {None, ""}:
                    actions.append({"name": name, "locator": field["locator"], "value": values[name]})
            return {"ready": not missing and not unexpected, "missing": missing, "unexpected": unexpected, "actions": actions}
      hints: *id002
    check:
      id: python.playwright.playwright_02.form-action-plan.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_02.form-action-plan.transfer.behavior.v1.fixture
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
        entry: plan_form_actions
        cases:
        - id: plans-required-and-optional
          arguments:
          - value:
            - name: email
              locator: label:Email
              required: true
            - name: note
              locator: label:Note
              required: false
          - value:
              email: a@example.test
              note: hello
          expectedReturn:
            ready: true
            missing: []
            unexpected: []
            actions:
            - name: email
              locator: label:Email
              value: a@example.test
            - name: note
              locator: label:Note
              value: hello
        - id: reports-missing-required
          arguments:
          - value:
            - name: email
              locator: label:Email
              required: true
          - value:
              email: ''
          expectedReturn:
            ready: false
            missing:
            - email
            unexpected: []
            actions: []
        - id: reports-unexpected-input
          arguments:
          - value:
            - name: query
              locator: role:searchbox
              required: false
          - value:
              query: docs
              admin: true
          expectedReturn:
            ready: false
            missing: []
            unexpected:
            - admin
            actions:
            - name: query
              locator: role:searchbox
              value: docs
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: playwright_02-locator-choice-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - playwright_02-form-action-plan-transfer
    title: 안정적인 locator 선택 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 접근 가능한 의미와 테스트 전용 계약의 우선순위를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 브라우저 동작 성공과 사용자 목표 달성을 같은 것으로 취급하지 마세요.
    - 선택한 action과 함께 판정 가능한 evidence와 남는 risk를 기록하세요.
    exercise:
      prompt: choose_locator_strategy(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_locator_strategy(situation):
            raise NotImplementedError
      solution: |
        def choose_locator_strategy(situation):
            table = {'named-button': {'action': 'get by role and name', 'evidence': 'unique accessible match', 'risk': 'duplicate label'}, 'labeled-input': {'action': 'get by label', 'evidence': 'label association', 'risk': 'missing accessible name'}, 'nonsemantic-widget': {'action': 'approved test id', 'evidence': 'stable product contract', 'risk': 'implementation coupling'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.playwright.playwright_02.locator-choice-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_02.locator-choice-recall.retrieval.behavior.v1.fixture
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
        entry: choose_locator_strategy
        cases:
        - id: recalls-named-button
          arguments:
          - value: named-button
          expectedReturn:
            action: get by role and name
            evidence: unique accessible match
            risk: duplicate label
        - id: recalls-labeled-input
          arguments:
          - value: labeled-input
          expectedReturn:
            action: get by label
            evidence: label association
            risk: missing accessible name
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};