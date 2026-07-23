var e=`meta:
  id: playwright_06
  title: 로그인 상태와 스토리지
  order: 6
  category: playwright
  difficulty: medium
  audience: Python 기본 문법을 익힌 자동화 입문자
  packages:
    - playwright
  tags:
    - playwright
    - context
    - storage
    - login
intro:
  direction: 쿠키와 localStorage를 브라우저 context에 저장하고 새 페이지에서 상태가 유지되는지 검증한다.
  benefits:
    - 로그인 뒤 상태를 반복 실습에서 재사용하는 방법을 익힌다.
    - storage_state 파일을 안전한 scratch 경로에 저장할 수 있다.
    - 민감 정보를 다루는 자동화에서 저장 범위와 검증 기준을 분리할 수 있다.
  diagram:
    steps:
      - label: 브라우저 context 기준 이해
        detail: page보다 상위인 context가 쿠키와 저장소 상태를 담는다는 점을 확인합니다.
      - label: 쿠키와 localStorage 주입
        detail: 로컬 도메인에 테스트용 상태를 넣고 화면에서 읽어 검증합니다.
      - label: storage_state 파일 저장
        detail: 인증 상태를 scratch 경로의 JSON 파일로 저장하고 필수 키를 확인합니다.
      - label: 새 context에서 상태 재사용
        detail: 저장한 state 파일을 새 context에 적용해 로그인 상태가 이어지는지 확인합니다.
    runtime:
      - label: context API 실행
        detail: new_context, add_cookies, storage_state가 로컬 Chromium에서 동작해야 합니다.
      - label: scratch JSON 저장
        detail: 인증 state는 CODARO_PLAYWRIGHT_OUTPUT_DIR 또는 OS temp 아래에만 저장합니다.
      - label: 상태 유지 assert
        detail: 새 context에서 쿠키나 localStorage 값을 읽어 같은 사용자 상태를 확인합니다.
sections:
  - id: cookie-state
    title: 쿠키 상태 읽기
    structuredPrimary: true
    subtitle: context.add_cookies
    goal: 브라우저 context에 쿠키를 넣고 페이지에서 document.cookie로 읽어 검증한다.
    why: 로그인 자동화는 매번 로그인 폼을 반복하기보다 안전하게 상태를 준비하고 확인하는 흐름이 필요하다.
    explanation: 브라우저 context는 쿠키, 권한, 저장소 같은 세션 상태를 담습니다. add_cookies로 테스트용 쿠키를 넣고 같은 도메인의 페이지에서 읽으면 상태 주입이 제대로 됐는지 확인할 수 있습니다. 실제 비밀번호나 토큰 대신 학습용 값만 사용합니다.
    tips:
      - 쿠키의 url 또는 domain/path 기준이 현재 페이지와 맞아야 합니다.
      - 학습 코드에는 실제 서비스 토큰을 넣지 않습니다.
    snippet: |-
      from playwright.sync_api import sync_playwright

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          context = browser.new_context()
          context.add_cookies([{"name": "session", "value": "lesson-user", "url": "https://codaro.local"}])
          page = context.new_page()
          page.route("**/*", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body="<p>cookie check</p>"))
          page.goto("https://codaro.local")
          cookieText = page.evaluate("document.cookie")
          browser.close()

      assert "session=lesson-user" in cookieText
      cookieText
    exercise:
      prompt: 쿠키 값을 "ops-user"로 바꾸고 document.cookie 검증을 맞추세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            context.add_cookies([{"name": "session", "value": "___", "url": "https://codaro.local"}])
            page = context.new_page()
            page.route("**/*", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body="<p>cookie check</p>"))
            page.goto("https://codaro.local")
            cookieText = page.evaluate("document.cookie")
            browser.close()

        assert "session=ops-user" in cookieText
        cookieText
      solution: |-
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            context.add_cookies([{"name": "session", "value": "ops-user", "url": "https://codaro.local"}])
            page = context.new_page()
            page.route("**/*", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body="<p>cookie check</p>"))
            page.goto("https://codaro.local")
            cookieText = page.evaluate("document.cookie")
            browser.close()

        assert "session=ops-user" in cookieText
        cookieText
      hints:
        - cookie value와 assert에 들어간 문자열을 같게 맞추세요.
        - page.goto 도메인이 쿠키 url과 같은 기준이어야 합니다.
    check:
      noError: context.add_cookies와 document.cookie 평가가 세션 쿠키 문자열을 확인해야 합니다.
      resultCheck: cookieText에 바꾼 세션 쿠키 값이 포함되어야 합니다.
  - id: local-storage
    title: localStorage 상태 검증
    structuredPrimary: true
    subtitle: evaluate로 저장소 읽기
    goal: 페이지에서 localStorage 값을 설정하고 화면 상태로 반영해 검증한다.
    why: 많은 웹 앱은 로그인 이름, 선택한 팀, UI 설정을 localStorage에 저장하므로 상태 확인 능력이 필요하다.
    explanation: localStorage는 브라우저 origin별로 유지되는 문자열 저장소입니다. Playwright의 page.evaluate를 사용하면 브라우저 안에서 JavaScript를 실행해 값을 넣거나 읽을 수 있습니다. 여기서는 role 값을 저장하고 화면에 표시한 뒤 Python에서 검증합니다.
    tips:
      - localStorage는 페이지 origin이 있어야 안정적으로 동작하므로 mock URL로 이동한 뒤 사용합니다.
      - 저장값은 문자열이므로 비교할 때 따옴표나 대소문자를 확인합니다.
    snippet: |-
      from playwright.sync_api import sync_playwright, expect

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.route("**/*", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body="<main></main>"))
          page.goto("https://codaro.local")
          page.evaluate("localStorage.setItem('role', 'reviewer')")
          page.set_content("<p data-testid='role'></p><script>document.querySelector('[data-testid=role]').textContent = localStorage.getItem('role')<\/script>")
          expect(page.get_by_test_id("role")).to_have_text("reviewer")
          role = page.evaluate("localStorage.getItem('role')")
          browser.close()

      assert role == "reviewer"
      role
    exercise:
      prompt: role 값을 "operator"로 바꾸고 화면과 저장소 검증을 통과시키세요.
      starterCode: |-
        from playwright.sync_api import sync_playwright, expect

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.route("**/*", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body="<main></main>"))
            page.goto("https://codaro.local")
            page.evaluate("localStorage.setItem('role', '___')")
            page.set_content("<p data-testid='role'></p><script>document.querySelector('[data-testid=role]').textContent = localStorage.getItem('role')<\/script>")
            expect(page.get_by_test_id("role")).to_have_text("operator")
            role = page.evaluate("localStorage.getItem('role')")
            browser.close()

        assert role == "___"
        role
      solution: |-
        from playwright.sync_api import sync_playwright, expect

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.route("**/*", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body="<main></main>"))
            page.goto("https://codaro.local")
            page.evaluate("localStorage.setItem('role', 'operator')")
            page.set_content("<p data-testid='role'></p><script>document.querySelector('[data-testid=role]').textContent = localStorage.getItem('role')<\/script>")
            expect(page.get_by_test_id("role")).to_have_text("operator")
            role = page.evaluate("localStorage.getItem('role')")
            browser.close()

        assert role == "operator"
        role
      hints:
        - localStorage에 넣는 문자열, expect 문자열, assert 문자열을 같게 맞추세요.
        - page.goto 뒤에 localStorage를 설정해야 origin이 생깁니다.
    check:
      noError: localStorage set/get과 화면 반영이 role 문자열을 함께 확인해야 합니다.
      resultCheck: role 값이 저장소와 화면에서 같은 문자열이어야 합니다.
  - id: storage-state-file
    title: storage_state 파일 저장
    structuredPrimary: true
    subtitle: 인증 상태 JSON
    goal: context storage_state를 scratch JSON 파일로 저장하고 쿠키 목록을 검증한다.
    why: 로그인 상태를 재사용하려면 상태 파일을 만들 수 있지만 저장 위치와 민감 정보 관리를 명확히 해야 한다.
    explanation: context.storage_state(path=...)는 쿠키와 localStorage 상태를 JSON으로 저장합니다. 학습에서는 테스트용 쿠키만 저장하고, 출력 경로는 scratch/temp 아래로 고정합니다. 파일을 다시 읽어 cookies 배열에 기대한 이름이 있는지 검증합니다.
    tips:
      - 실제 서비스 인증 토큰은 커밋하거나 공유하지 않습니다.
      - storage_state 파일은 자동화 실행 작업공간 안에서만 사용합니다.
    snippet: |-
      from pathlib import Path
      import json
      import os
      import tempfile
      from playwright.sync_api import sync_playwright

      outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-state"
      outputDir.mkdir(parents=True, exist_ok=True)
      statePath = outputDir / "storage-state.json"

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          context = browser.new_context()
          context.add_cookies([{"name": "session", "value": "lesson-user", "url": "https://codaro.local"}])
          context.storage_state(path=statePath)
          browser.close()

      state = json.loads(statePath.read_text(encoding="utf-8"))
      cookieNames = [cookie["name"] for cookie in state["cookies"]]

      assert "session" in cookieNames
      cookieNames
    exercise:
      prompt: 쿠키 이름을 "reviewSession"으로 바꾸고 저장된 state에서 확인하세요.
      starterCode: |-
        from pathlib import Path
        import json
        import os
        import tempfile
        from playwright.sync_api import sync_playwright

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-state"
        outputDir.mkdir(parents=True, exist_ok=True)
        statePath = outputDir / "storage-state.json"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            context.add_cookies([{"name": "___", "value": "lesson-user", "url": "https://codaro.local"}])
            context.storage_state(path=statePath)
            browser.close()

        state = json.loads(statePath.read_text(encoding="utf-8"))
        cookieNames = [cookie["name"] for cookie in state["cookies"]]

        assert "reviewSession" in cookieNames
        cookieNames
      solution: |-
        from pathlib import Path
        import json
        import os
        import tempfile
        from playwright.sync_api import sync_playwright

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-state"
        outputDir.mkdir(parents=True, exist_ok=True)
        statePath = outputDir / "storage-state.json"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            context.add_cookies([{"name": "reviewSession", "value": "lesson-user", "url": "https://codaro.local"}])
            context.storage_state(path=statePath)
            browser.close()

        state = json.loads(statePath.read_text(encoding="utf-8"))
        cookieNames = [cookie["name"] for cookie in state["cookies"]]

        assert "reviewSession" in cookieNames
        cookieNames
      hints:
        - add_cookies의 name과 assert 문자열을 같게 맞추세요.
        - statePath는 outputDir 아래에 있어야 합니다.
    check:
      noError: storage_state 파일 저장과 JSON 읽기가 오류 없이 완료되어야 합니다.
      resultCheck: 저장된 cookies 배열에 바꾼 쿠키 이름이 포함되어야 합니다.
  - id: reuse-state-completion
    title: 저장 상태 재사용 결과 정리
    structuredPrimary: true
    subtitle: 새 context로 이어받기
    goal: 저장한 storage_state 파일을 새 context에 적용하고 세션 쿠키가 유지되는지 검증한다.
    why: 로그인 상태 재사용은 반복 자동화 시간을 줄이지만, 상태가 실제로 이어졌는지 검증해야 안전하다.
    explanation: storage_state 파일은 새 context 생성 시 storage_state 인자로 넘길 수 있습니다. 이렇게 만든 새 페이지에서 document.cookie를 읽으면 이전 context에서 저장한 쿠키가 이어졌는지 확인할 수 있습니다. 마지막 completion 딕셔너리는 상태 파일 존재와 재사용 성공 여부를 함께 증명합니다.
    tips:
      - 새 context를 만들기 전에 이전 context의 storage_state 저장이 끝나야 합니다.
      - 세션 재사용 검증도 실제 민감 토큰이 아닌 학습용 값으로 진행합니다.
    snippet: |-
      from pathlib import Path
      import os
      import tempfile
      from playwright.sync_api import sync_playwright

      outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-state"
      outputDir.mkdir(parents=True, exist_ok=True)
      statePath = outputDir / "reuse-state.json"

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          firstContext = browser.new_context()
          firstContext.add_cookies([{"name": "session", "value": "persisted", "url": "https://codaro.local"}])
          firstContext.storage_state(path=statePath)
          secondContext = browser.new_context(storage_state=statePath)
          page = secondContext.new_page()
          page.route("**/*", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body="<p>state reuse</p>"))
          page.goto("https://codaro.local")
          cookieText = page.evaluate("document.cookie")
          browser.close()

      completion = {"stateFile": statePath.exists(), "sessionRestored": "session=persisted" in cookieText}
      assert completion == {"stateFile": True, "sessionRestored": True}
      completion
    exercise:
      prompt: 세션 값을 "restored-user"로 바꾸고 새 context에서 복원됐는지 검증하세요.
      starterCode: |-
        from pathlib import Path
        import os
        import tempfile
        from playwright.sync_api import sync_playwright

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-state"
        outputDir.mkdir(parents=True, exist_ok=True)
        statePath = outputDir / "reuse-state.json"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            firstContext = browser.new_context()
            firstContext.add_cookies([{"name": "session", "value": "___", "url": "https://codaro.local"}])
            firstContext.storage_state(path=statePath)
            secondContext = browser.new_context(storage_state=statePath)
            page = secondContext.new_page()
            page.route("**/*", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body="<p>state reuse</p>"))
            page.goto("https://codaro.local")
            cookieText = page.evaluate("document.cookie")
            browser.close()

        completion = {"stateFile": statePath.exists(), "sessionRestored": "session=restored-user" in cookieText}
        assert completion == {"stateFile": True, "sessionRestored": True}
        completion
      solution: |-
        from pathlib import Path
        import os
        import tempfile
        from playwright.sync_api import sync_playwright

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-state"
        outputDir.mkdir(parents=True, exist_ok=True)
        statePath = outputDir / "reuse-state.json"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            firstContext = browser.new_context()
            firstContext.add_cookies([{"name": "session", "value": "restored-user", "url": "https://codaro.local"}])
            firstContext.storage_state(path=statePath)
            secondContext = browser.new_context(storage_state=statePath)
            page = secondContext.new_page()
            page.route("**/*", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body="<p>state reuse</p>"))
            page.goto("https://codaro.local")
            cookieText = page.evaluate("document.cookie")
            browser.close()

        completion = {"stateFile": statePath.exists(), "sessionRestored": "session=restored-user" in cookieText}
        assert completion == {"stateFile": True, "sessionRestored": True}
        completion
      hints:
        - 저장한 쿠키 값과 cookieText 검색 문자열을 같게 맞추세요.
        - completion은 파일 존재와 세션 복원 두 조건을 모두 확인합니다.
    check:
      noError: storage_state 저장과 새 context 복원이 오류 없이 완료되어야 합니다.
      resultCheck: completion이 상태 파일 존재와 세션 쿠키 복원을 모두 True로 보여야 합니다.
`;export{e as default};