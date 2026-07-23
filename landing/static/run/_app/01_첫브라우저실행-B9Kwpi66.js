var e=`meta:
  id: playwright_01
  title: 첫 브라우저 실행
  order: 1
  category: playwright
  difficulty: easy
  audience: Python 기본 문법을 익힌 자동화 입문자
  packages:
    - playwright
  tags:
    - playwright
    - chromium
    - page
    - assert
intro:
  direction: Playwright로 Chromium 페이지를 만들고 제목, 본문, 클릭 결과, 완료 상태를 순서대로 검증한다.
  benefits:
    - 브라우저 실행 실패와 페이지 검증 실패를 구분할 수 있다.
    - 외부 URL 없이 page.set_content로 안정적인 실습 페이지를 만들 수 있다.
    - 클릭 전후 상태를 assert로 비교하는 기본 자동화 흐름을 익힌다.
  diagram:
    steps:
      - label: HTML 제목 기준 작성
        detail: 브라우저가 읽을 title과 h1을 먼저 고정하고 예상 문자열을 변수로 둡니다.
      - label: Chromium 페이지 생성
        detail: sync_playwright 컨텍스트에서 browser와 page를 만들고 HTML을 주입합니다.
      - label: 클릭 후 상태 비교
        detail: 버튼 클릭으로 바뀐 DOM 문구를 읽어 예상 상태와 비교합니다.
      - label: 완료 상태 딕셔너리 반환
        detail: 제목, 본문, 버튼 결과를 하나의 결과 객체로 묶어 다음 실습에서 재사용합니다.
    runtime:
      - label: playwright 라이브러리 준비
        detail: meta.packages의 playwright를 로컬 Python 환경에서 확인합니다.
      - label: Chromium headless 실행
        detail: browser.new_page와 page.set_content가 같은 셀 안에서 완료되어야 합니다.
      - label: assert 기반 완료 판단
        detail: title, locator text, click result가 예상값과 맞을 때 레슨을 완료합니다.
sections:
  - id: page-title
    title: 페이지 제목 읽기
    structuredPrimary: true
    subtitle: browser, page, title
    goal: Chromium 페이지를 열고 HTML title을 읽어 첫 브라우저 실행 결과를 검증한다.
    why: 가장 작은 성공 조건을 title로 확인하면 브라우저 실행 문제와 locator 문제를 분리할 수 있다.
    explanation: Playwright의 기본 흐름은 브라우저 실행, 페이지 생성, 화면 주입 또는 이동, 상태 읽기입니다. 이 섹션은 외부 사이트를 열지 않고 HTML title만 확인합니다. title 검증이 통과하면 Python 패키지, Chromium 실행, page API가 모두 준비된 상태입니다.
    tips:
      - headless=True는 화면을 띄우지 않고 브라우저를 실행합니다.
      - HTML 문자열에 title 태그가 없으면 page.title은 빈 문자열일 수 있습니다.
    snippet: |-
      from playwright.sync_api import sync_playwright

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content("<title>Daily Check</title><main><h1>Ready</h1></main>")
          actualTitle = page.title()
          browser.close()

      assert actualTitle == "Daily Check"
      actualTitle
    exercise:
      prompt: title 문자열을 "Order Dashboard"로 바꾸고 page.title 결과를 검증하세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content("<title>___</title><main><h1>Ready</h1></main>")
            actualTitle = page.title()
            browser.close()

        assert actualTitle == "___"
        actualTitle
      solution: |-
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content("<title>Order Dashboard</title><main><h1>Ready</h1></main>")
            actualTitle = page.title()
            browser.close()

        assert actualTitle == "Order Dashboard"
        actualTitle
      hints:
        - title 태그 안의 문자열과 assert 문자열을 같은 값으로 맞추세요.
        - browser.close는 assert 전에 호출해도 이미 읽은 actualTitle에는 영향이 없습니다.
    check:
      noError: Chromium launch, page.set_content, page.title 호출이 순서대로 실행되어야 합니다.
      resultCheck: actualTitle 값이 HTML title과 정확히 같아야 합니다.
  - id: heading-text
    title: 본문 요소 읽기
    structuredPrimary: true
    subtitle: get_by_role로 h1 확인
    goal: 사용자에게 보이는 heading을 role locator로 찾아 텍스트를 검증한다.
    why: CSS 선택자보다 사용자 관점의 role과 name을 쓰면 화면 구조가 바뀌어도 의도가 더 오래 유지된다.
    explanation: Playwright locator는 요소를 지금 당장 찾는 값이 아니라 행동 시점에 요소를 찾는 규칙입니다. get_by_role은 접근성 역할과 이름을 기준으로 요소를 찾습니다. heading, button, textbox 같은 역할은 실제 사용자가 인식하는 UI와 가까워 테스트가 읽기 쉬워집니다.
    tips:
      - heading role은 h1부터 h6까지의 제목 요소를 찾을 수 있습니다.
      - accessible name은 화면 텍스트와 대체 텍스트를 기반으로 계산됩니다.
    snippet: |-
      from playwright.sync_api import sync_playwright, expect

      html = "<main><h1>주문 현황</h1><p>오늘 처리할 주문이 있습니다.</p></main>"

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(html)
          heading = page.get_by_role("heading", name="주문 현황")
          expect(heading).to_be_visible()
          text = heading.inner_text()
          browser.close()

      assert text == "주문 현황"
      text
    exercise:
      prompt: h1 텍스트와 locator name을 "배송 현황"으로 함께 바꾸고 검증하세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright, expect

        html = "<main><h1>___</h1><p>오늘 처리할 배송이 있습니다.</p></main>"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            heading = page.get_by_role("heading", name="___")
            expect(heading).to_be_visible()
            text = heading.inner_text()
            browser.close()

        assert text == "배송 현황"
        text
      solution: |-
        from playwright.sync_api import sync_playwright, expect

        html = "<main><h1>배송 현황</h1><p>오늘 처리할 배송이 있습니다.</p></main>"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            heading = page.get_by_role("heading", name="배송 현황")
            expect(heading).to_be_visible()
            text = heading.inner_text()
            browser.close()

        assert text == "배송 현황"
        text
      hints:
        - 화면 텍스트와 locator name이 다르면 요소를 찾지 못합니다.
        - expect는 locator가 실제로 보이는지 기다리며 확인합니다.
    check:
      noError: get_by_role과 expect 호출이 TimeoutError 없이 완료되어야 합니다.
      resultCheck: heading.inner_text 결과가 바꾼 h1 텍스트와 일치해야 합니다.
  - id: click-state
    title: 버튼 클릭으로 상태 바꾸기
    structuredPrimary: true
    subtitle: click과 DOM 변화
    goal: 버튼 클릭 후 화면 상태 문구가 바뀌는지 Playwright로 확인한다.
    why: 자동화는 단순 조회보다 클릭, 입력, 상태 변화 검증이 실제 업무에 더 자주 필요하다.
    explanation: 클릭 실습에서는 버튼을 누르기 전 상태와 누른 뒤 상태를 분리해서 봅니다. 버튼의 접근성 이름으로 클릭하면 CSS 클래스나 DOM 위치가 바뀌어도 의도가 유지됩니다. 상태 문구를 data-testid로 읽으면 결과 확인 지점을 명확히 고정할 수 있습니다.
    tips:
      - 버튼 텍스트는 name 인자로 정확히 지정합니다.
      - 상태 검증은 클릭 직후 바로 읽기보다 expect로 기다리는 편이 안정적입니다.
    snippet: |-
      from playwright.sync_api import sync_playwright, expect

      html = """
      <button onclick="document.querySelector('[data-testid=status]').textContent='처리 완료'">처리 시작</button>
      <p data-testid="status">대기 중</p>
      """

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(html)
          page.get_by_role("button", name="처리 시작").click()
          status = page.get_by_test_id("status")
          expect(status).to_have_text("처리 완료")
          result = status.inner_text()
          browser.close()

      assert result == "처리 완료"
      result
    exercise:
      prompt: 버튼 클릭 후 상태가 "검토 완료"가 되도록 HTML과 assert를 맞추세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <button onclick="document.querySelector('[data-testid=status]').textContent='___'">검토 시작</button>
        <p data-testid="status">대기 중</p>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_role("button", name="검토 시작").click()
            status = page.get_by_test_id("status")
            expect(status).to_have_text("검토 완료")
            result = status.inner_text()
            browser.close()

        assert result == "___"
        result
      solution: |-
        from playwright.sync_api import sync_playwright, expect

        html = """
        <button onclick="document.querySelector('[data-testid=status]').textContent='검토 완료'">검토 시작</button>
        <p data-testid="status">대기 중</p>
        """

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            page.get_by_role("button", name="검토 시작").click()
            status = page.get_by_test_id("status")
            expect(status).to_have_text("검토 완료")
            result = status.inner_text()
            browser.close()

        assert result == "검토 완료"
        result
      hints:
        - onclick 안에서 바꾸는 문자열, expect 문자열, assert 문자열을 같은 목표 상태로 맞춥니다.
        - data-testid는 결과 문구를 안정적으로 읽기 위한 명시적 계약입니다.
    check:
      noError: 버튼 클릭과 상태 locator 검증이 오류 없이 끝나야 합니다.
      resultCheck: 클릭 후 status 텍스트가 목표 상태 문자열로 바뀌어야 합니다.
  - id: completion-object
    title: 첫 실행 완료 객체 만들기
    structuredPrimary: true
    subtitle: title, heading, status 묶기
    goal: 첫 브라우저 실행에서 읽은 값을 딕셔너리로 묶고 완료 조건을 assert로 확인한다.
    why: 자동화 결과를 구조화하면 이후 리포트 저장, 태스크 실행, 테스트 비교에 그대로 재사용할 수 있다.
    explanation: 마지막 섹션은 title, heading, status를 하나의 결과 객체로 묶습니다. 단일 문자열만 확인하는 셀보다 결과 딕셔너리를 만들면 어떤 조건이 실패했는지 더 쉽게 알 수 있습니다. 이 방식은 종합 프로젝트에서 JSON 리포트로 이어집니다.
    tips:
      - 결과 키 이름은 나중에 보고서 컬럼이 되므로 의미 있게 고릅니다.
      - 완료 조건은 모든 핵심 키가 예상값을 가리키는지 확인합니다.
    snippet: |-
      from playwright.sync_api import sync_playwright

      html = "<title>점검</title><main><h1>주문</h1><p data-testid='status'>정상</p></main>"

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content(html)
          result = {
              "title": page.title(),
              "heading": page.get_by_role("heading").inner_text(),
              "status": page.get_by_test_id("status").inner_text(),
          }
          browser.close()

      assert result == {"title": "점검", "heading": "주문", "status": "정상"}
      result
    exercise:
      prompt: HTML의 heading과 status를 바꾸고 result 딕셔너리 assert를 같은 값으로 맞추세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright

        html = "<title>점검</title><main><h1>___</h1><p data-testid='status'>___</p></main>"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            result = {
                "title": page.title(),
                "heading": page.get_by_role("heading").inner_text(),
                "status": page.get_by_test_id("status").inner_text(),
            }
            browser.close()

        assert result == {"title": "점검", "heading": "배송", "status": "완료"}
        result
      solution: |-
        from playwright.sync_api import sync_playwright

        html = "<title>점검</title><main><h1>배송</h1><p data-testid='status'>완료</p></main>"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(html)
            result = {
                "title": page.title(),
                "heading": page.get_by_role("heading").inner_text(),
                "status": page.get_by_test_id("status").inner_text(),
            }
            browser.close()

        assert result == {"title": "점검", "heading": "배송", "status": "완료"}
        result
      hints:
        - HTML에 넣은 텍스트와 result assert의 값이 같아야 합니다.
        - 딕셔너리 키 이름은 그대로 두고 값만 바꾸면 비교가 쉬워집니다.
    check:
      noError: result 딕셔너리가 세 키를 모두 가진 상태로 만들어져야 합니다.
      resultCheck: title, heading, status 값이 HTML에서 읽은 실제 값과 일치해야 합니다.
`;export{e as default};