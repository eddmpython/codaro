var e=`meta:
  id: playwright_04
  title: 스크린샷과 증거 저장
  order: 4
  category: playwright
  difficulty: easy
  audience: Python 기본 문법을 익힌 자동화 입문자
  packages:
    - playwright
  outcomes: ["automation.browser.evidence"]
  prerequisites: ["automation.browser.basics"]
  estimatedMinutes: 40
  tags:
    - playwright
    - screenshot
    - report
    - evidence
intro:
  direction: 브라우저 점검 결과를 스크린샷과 JSON 리포트로 남기고 저장 경로를 안전하게 관리한다.
  benefits:
    - 화면 상태를 파일 증거로 저장할 수 있다.
    - 저장소 루트가 아닌 scratch/temp 경로에 산출물을 남기는 습관을 익힌다.
    - 화면 텍스트와 파일 존재 여부를 함께 검증할 수 있다.
  diagram:
    steps:
      - label: 증거 저장 경로 계산
        detail: 환경 변수나 OS temp를 사용해 실습 산출물이 제품 루트에 남지 않게 합니다.
      - label: 화면 캡처 파일 생성
        detail: page.screenshot으로 현재 페이지 상태를 PNG 파일로 저장합니다.
      - label: JSON 점검 결과 작성
        detail: title, status, screenshot 경로를 구조화해 자동화 리포트로 남깁니다.
      - label: 파일 증거 완료 확인
        detail: 스크린샷과 JSON 파일이 실제로 생성됐고 비어 있지 않은지 assert로 확인합니다.
    runtime:
      - label: pathlib 기반 scratch 사용
        detail: CODARO_PLAYWRIGHT_OUTPUT_DIR가 있으면 그 아래, 없으면 OS temp 아래에 저장합니다.
      - label: Chromium 캡처 실행
        detail: 로컬 HTML을 headless 브라우저에 넣고 screenshot API를 호출합니다.
      - label: 파일 검증 마무리
        detail: 파일 존재 여부와 크기, JSON payload 값을 실행 결과로 확인합니다.
sections:
  - id: output-directory
    title: 안전한 출력 경로 만들기
    structuredPrimary: true
    subtitle: 환경 변수와 OS temp
    goal: 스크린샷을 저장할 출력 폴더를 저장소 루트가 아닌 안전한 위치로 만든다.
    why: 학습 코드가 루트에 png, json, log를 남기면 제품 저장소 청결 gate와 실제 작업 공간을 오염시킨다.
    explanation: Codaro 실습은 파일을 만들 수 있지만, 파일 산출물은 루트에 직접 쓰지 않습니다. 먼저 CODARO_PLAYWRIGHT_OUTPUT_DIR 환경 변수를 확인하고 없으면 OS temp 아래에 lesson 전용 폴더를 만듭니다. 이 패턴은 모든 증거 저장 실습의 시작점입니다.
    tips:
      - outputDir.mkdir(parents=True, exist_ok=True)로 폴더를 먼저 보장합니다.
      - Path.cwd에 바로 파일명을 붙이는 방식은 피합니다.
    snippet: |-
      from pathlib import Path
      import os
      import tempfile

      baseDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir()))
      outputDir = baseDir / "codaro-playwright-evidence"
      outputDir.mkdir(parents=True, exist_ok=True)

      assert outputDir.is_dir()
      assert outputDir.name == "codaro-playwright-evidence"
      str(outputDir)
    exercise:
      prompt: 출력 폴더 이름을 "codaro-playwright-screenshots"로 바꾸고 폴더 생성 여부를 검증하세요.
      starterCode: |-
        from pathlib import Path
        import os
        import tempfile

        baseDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir()))
        outputDir = baseDir / "___"
        outputDir.mkdir(parents=True, exist_ok=True)

        assert outputDir.is_dir()
        assert outputDir.name == "codaro-playwright-screenshots"
        str(outputDir)
      solution: |-
        from pathlib import Path
        import os
        import tempfile

        baseDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir()))
        outputDir = baseDir / "codaro-playwright-screenshots"
        outputDir.mkdir(parents=True, exist_ok=True)

        assert outputDir.is_dir()
        assert outputDir.name == "codaro-playwright-screenshots"
        str(outputDir)
      hints:
        - 폴더 이름 문자열과 assert의 outputDir.name 값을 같게 맞추세요.
        - 이 경로는 이후 스크린샷 파일 저장 위치가 됩니다.
    check:
      noError: outputDir 생성 코드가 scratch 경로를 만들고 Path.exists 검증까지 완료해야 합니다.
      resultCheck: outputDir이 실제 디렉터리이고 지정한 이름을 가져야 합니다.
  - id: page-screenshot
    title: 페이지 스크린샷 저장
    structuredPrimary: true
    subtitle: page.screenshot
    goal: 로컬 HTML 화면을 PNG 파일로 캡처하고 파일 크기를 검증한다.
    why: 자동화 결과를 공유하려면 텍스트 assert뿐 아니라 사용자가 볼 수 있는 화면 증거가 필요하다.
    explanation: page.screenshot은 현재 viewport를 이미지로 저장합니다. 저장 경로는 앞에서 만든 안전한 출력 폴더 아래여야 합니다. 파일 존재와 크기를 검증하면 캡처 호출이 실제 파일 산출물로 이어졌는지 확인할 수 있습니다.
    tips:
      - path 인자에는 Path 객체를 문자열로 변환하지 않아도 됩니다.
      - 스크린샷 파일명은 레슨이나 점검 대상이 드러나게 작성합니다.
    snippet: |-
      from pathlib import Path
      import os
      import tempfile
      from playwright.sync_api import sync_playwright

      outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-evidence"
      outputDir.mkdir(parents=True, exist_ok=True)
      screenshotPath = outputDir / "status-page.png"

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page(viewport={"width": 900, "height": 600})
          page.set_content("<main><h1>점검 정상</h1><p>스크린샷 증거</p></main>")
          page.screenshot(path=screenshotPath)
          browser.close()

      assert screenshotPath.exists()
      assert screenshotPath.stat().st_size > 1000
      str(screenshotPath)
    exercise:
      prompt: 스크린샷 파일명을 "dashboard-check.png"로 바꾸고 파일 생성 여부를 검증하세요.
      starterCode: |-
        from pathlib import Path
        import os
        import tempfile
        from playwright.sync_api import sync_playwright

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-evidence"
        outputDir.mkdir(parents=True, exist_ok=True)
        screenshotPath = outputDir / "___"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 900, "height": 600})
            page.set_content("<main><h1>대시보드 정상</h1><p>스크린샷 증거</p></main>")
            page.screenshot(path=screenshotPath)
            browser.close()

        assert screenshotPath.exists()
        assert screenshotPath.name == "dashboard-check.png"
        assert screenshotPath.stat().st_size > 1000
        str(screenshotPath)
      solution: |-
        from pathlib import Path
        import os
        import tempfile
        from playwright.sync_api import sync_playwright

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-evidence"
        outputDir.mkdir(parents=True, exist_ok=True)
        screenshotPath = outputDir / "dashboard-check.png"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 900, "height": 600})
            page.set_content("<main><h1>대시보드 정상</h1><p>스크린샷 증거</p></main>")
            page.screenshot(path=screenshotPath)
            browser.close()

        assert screenshotPath.exists()
        assert screenshotPath.name == "dashboard-check.png"
        assert screenshotPath.stat().st_size > 1000
        str(screenshotPath)
      hints:
        - screenshotPath 파일명과 assert의 name 값을 같게 맞추세요.
        - 파일 크기 검증은 빈 파일이나 저장 실패를 잡는 안전장치입니다.
    check:
      noError: page.screenshot 호출이 파일 쓰기 오류 없이 완료되어야 합니다.
      resultCheck: 지정한 PNG 파일이 존재하고 1000바이트보다 커야 합니다.
  - id: json-report
    title: JSON 리포트 저장
    structuredPrimary: true
    subtitle: 화면 상태를 구조화하기
    goal: 화면에서 읽은 title과 status를 JSON 파일로 저장하고 다시 읽어 검증한다.
    why: 자동화 결과는 사람이 보는 이미지와 기계가 읽는 구조화 데이터가 함께 있어야 후속 처리에 유리하다.
    explanation: JSON 리포트는 자동화의 상태를 다음 도구로 넘기는 형식입니다. 페이지에서 title과 status를 읽고 passed 값을 계산한 뒤 파일에 씁니다. 다시 파일을 읽어 같은 값을 검증하면 리포트 저장이 실제로 성공했는지 확인할 수 있습니다.
    tips:
      - ensure_ascii=False를 쓰면 한국어 상태 문구를 그대로 저장할 수 있습니다.
      - 파일을 다시 읽는 검증까지 포함하면 저장 실패를 놓치지 않습니다.
    snippet: |-
      from pathlib import Path
      import json
      import os
      import tempfile
      from playwright.sync_api import sync_playwright

      outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-evidence"
      outputDir.mkdir(parents=True, exist_ok=True)
      reportPath = outputDir / "status-report.json"

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content("<title>일일 점검</title><p data-testid='status'>정상</p>")
          payload = {"title": page.title(), "status": page.get_by_test_id("status").inner_text()}
          payload["passed"] = payload["status"] == "정상"
          browser.close()

      reportPath.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
      loaded = json.loads(reportPath.read_text(encoding="utf-8"))

      assert loaded == {"title": "일일 점검", "status": "정상", "passed": True}
      loaded
    exercise:
      prompt: status를 "주의"로 바꾸고 passed 계산 기준도 같은 상태에 맞추세요.
      starterCode: |-
        from pathlib import Path
        import json
        import os
        import tempfile
        from playwright.sync_api import sync_playwright

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-evidence"
        outputDir.mkdir(parents=True, exist_ok=True)
        reportPath = outputDir / "status-report.json"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content("<title>일일 점검</title><p data-testid='status'>___</p>")
            payload = {"title": page.title(), "status": page.get_by_test_id("status").inner_text()}
            payload["passed"] = payload["status"] == "주의"
            browser.close()

        reportPath.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        loaded = json.loads(reportPath.read_text(encoding="utf-8"))

        assert loaded == {"title": "일일 점검", "status": "주의", "passed": True}
        loaded
      solution: |-
        from pathlib import Path
        import json
        import os
        import tempfile
        from playwright.sync_api import sync_playwright

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-evidence"
        outputDir.mkdir(parents=True, exist_ok=True)
        reportPath = outputDir / "status-report.json"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content("<title>일일 점검</title><p data-testid='status'>주의</p>")
            payload = {"title": page.title(), "status": page.get_by_test_id("status").inner_text()}
            payload["passed"] = payload["status"] == "주의"
            browser.close()

        reportPath.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        loaded = json.loads(reportPath.read_text(encoding="utf-8"))

        assert loaded == {"title": "일일 점검", "status": "주의", "passed": True}
        loaded
      hints:
        - HTML 상태 문구와 passed 계산 기준을 같은 문자열로 맞추세요.
        - loaded는 실제 파일에서 다시 읽은 값입니다.
    check:
      noError: JSON 파일 쓰기와 읽기가 UnicodeDecodeError 없이 실행되어야 합니다.
      resultCheck: loaded payload가 화면에서 읽은 상태와 passed 계산 결과를 반영해야 합니다.
  - id: evidence-completion
    title: 증거 저장 완료 프로젝트
    structuredPrimary: true
    subtitle: screenshot과 JSON 함께 검증
    goal: 스크린샷 파일과 JSON 리포트를 함께 만들고 완료 객체로 검증한다.
    why: 실제 브라우저 점검은 화면 증거와 구조화 리포트가 함께 있어야 사람과 자동화가 모두 결과를 이해한다.
    explanation: 이 섹션은 레슨의 미니 프로젝트입니다. 화면 캡처와 JSON 리포트를 같은 출력 폴더에 저장하고, 두 파일의 존재 여부와 리포트 값을 하나의 completion 딕셔너리로 확인합니다. 이후 종합 프로젝트의 증거 저장 구조와 같은 패턴입니다.
    tips:
      - 파일 경로는 문자열로 리포트에 넣으면 다른 도구가 읽기 쉽습니다.
      - completion 딕셔너리는 자동화 태스크의 성공 결과로도 쓸 수 있습니다.
    snippet: |-
      from pathlib import Path
      import json
      import os
      import tempfile
      from playwright.sync_api import sync_playwright

      outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-evidence"
      outputDir.mkdir(parents=True, exist_ok=True)
      screenshotPath = outputDir / "completion.png"
      reportPath = outputDir / "completion.json"

      with sync_playwright() as p:
          browser = p.chromium.launch(headless=True)
          page = browser.new_page()
          page.set_content("<title>완료 점검</title><main><h1>완료</h1><p data-testid='status'>증거 저장</p></main>")
          page.screenshot(path=screenshotPath)
          report = {"title": page.title(), "status": page.get_by_test_id("status").inner_text(), "screenshot": str(screenshotPath)}
          browser.close()

      reportPath.write_text(json.dumps(report, ensure_ascii=False), encoding="utf-8")
      completion = {"screenshotExists": screenshotPath.exists(), "reportExists": reportPath.exists(), "status": report["status"]}

      assert completion == {"screenshotExists": True, "reportExists": True, "status": "증거 저장"}
      completion
    exercise:
      prompt: status를 "완료 증거"로 바꾸고 completion 딕셔너리 검증을 통과시키세요.
      starterCode: |-
        from pathlib import Path
        import json
        import os
        import tempfile
        from playwright.sync_api import sync_playwright

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-evidence"
        outputDir.mkdir(parents=True, exist_ok=True)
        screenshotPath = outputDir / "completion.png"
        reportPath = outputDir / "completion.json"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content("<title>완료 점검</title><main><h1>완료</h1><p data-testid='status'>___</p></main>")
            page.screenshot(path=screenshotPath)
            report = {"title": page.title(), "status": page.get_by_test_id("status").inner_text(), "screenshot": str(screenshotPath)}
            browser.close()

        reportPath.write_text(json.dumps(report, ensure_ascii=False), encoding="utf-8")
        completion = {"screenshotExists": screenshotPath.exists(), "reportExists": reportPath.exists(), "status": report["status"]}

        assert completion == {"screenshotExists": True, "reportExists": True, "status": "완료 증거"}
        completion
      solution: |-
        from pathlib import Path
        import json
        import os
        import tempfile
        from playwright.sync_api import sync_playwright

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-evidence"
        outputDir.mkdir(parents=True, exist_ok=True)
        screenshotPath = outputDir / "completion.png"
        reportPath = outputDir / "completion.json"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content("<title>완료 점검</title><main><h1>완료</h1><p data-testid='status'>완료 증거</p></main>")
            page.screenshot(path=screenshotPath)
            report = {"title": page.title(), "status": page.get_by_test_id("status").inner_text(), "screenshot": str(screenshotPath)}
            browser.close()

        reportPath.write_text(json.dumps(report, ensure_ascii=False), encoding="utf-8")
        completion = {"screenshotExists": screenshotPath.exists(), "reportExists": reportPath.exists(), "status": report["status"]}

        assert completion == {"screenshotExists": True, "reportExists": True, "status": "완료 증거"}
        completion
      hints:
        - HTML status 문구와 completion assert의 status 값을 같게 맞추세요.
        - screenshotExists와 reportExists는 파일 생성 여부를 나타냅니다.
    check:
      noError: 스크린샷과 JSON 리포트 생성, completion 비교가 오류 없이 끝나야 합니다.
      resultCheck: completion이 두 파일 존재와 바꾼 status 값을 모두 증명해야 합니다.
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
  - id: playwright_04-screenshot-manifest-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - output-directory
    - evidence-completion
    title: 스크린샷 증거 manifest 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: viewport·상태·mask·파일 identity가 빠진 캡처를 식별한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 파일명만 남기지 말고 viewport와 제품 상태를 manifest에 고정하세요.
    - 동적 요소 mask는 selector 단위로 기록하고 화면 전체를 가리지 마세요.
    exercise:
      prompt: build_screenshot_manifest(captures)를 완성하세요.
      starterCode: |-
        def build_screenshot_manifest(captures):
            raise NotImplementedError
      solution: |
        def build_screenshot_manifest(captures):
            required = {"name", "state", "width", "height", "path", "masked"}
            entries = []
            failures = []
            seen = set()
            for index, capture in enumerate(captures):
                missing = sorted(required - set(capture))
                if missing:
                    failures.append({"index": index, "reason": "missing", "fields": missing})
                    continue
                key = (capture["state"], capture["width"], capture["height"])
                if key in seen:
                    failures.append({"index": index, "reason": "duplicate-state-viewport", "fields": []})
                    continue
                seen.add(key)
                entries.append({name: capture[name] for name in ["name", "state", "width", "height", "path", "masked"]})
            return {"complete": not failures, "entries": entries, "failures": failures}
      hints: *id001
    check:
      id: python.playwright.playwright_04.screenshot-manifest.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_04.screenshot-manifest.mastery.behavior.v1.fixture
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
        entry: build_screenshot_manifest
        cases:
        - id: builds-two-state-manifest
          arguments:
          - value:
            - name: home-empty
              state: empty
              width: 390
              height: 844
              path: home-empty.png
              masked: []
            - name: home-error
              state: error
              width: 390
              height: 844
              path: home-error.png
              masked:
              - time
          expectedReturn:
            complete: true
            entries:
            - name: home-empty
              state: empty
              width: 390
              height: 844
              path: home-empty.png
              masked: []
            - name: home-error
              state: error
              width: 390
              height: 844
              path: home-error.png
              masked:
              - time
            failures: []
        - id: reports-missing-metadata
          arguments:
          - value:
            - name: partial
              state: ready
          expectedReturn:
            complete: false
            entries: []
            failures:
            - index: 0
              reason: missing
              fields:
              - height
              - masked
              - path
              - width
        - id: reports-duplicate-state-viewport
          arguments:
          - value:
            - name: a
              state: ready
              width: 800
              height: 600
              path: a.png
              masked: []
            - name: b
              state: ready
              width: 800
              height: 600
              path: b.png
              masked: []
          expectedReturn:
            complete: false
            entries:
            - name: a
              state: ready
              width: 800
              height: 600
              path: a.png
              masked: []
            failures:
            - index: 1
              reason: duplicate-state-viewport
              fields: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: playwright_04-evidence-bundle-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - playwright_04-screenshot-manifest-mastery
    title: 새 브라우저 점검에 증거 bundle 감사 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: assertion·screenshot·trace가 같은 scenario identity를 공유하는지 검사한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 증거 종류마다 별도 scenario 이름을 만들지 말고 같은 identity로 묶으세요.
    - 정상 화면만 캡처하지 말고 실패 상태의 assertion과 trace를 함께 보존하세요.
    exercise:
      prompt: audit_evidence_bundle(items, required_kinds)를 완성하세요.
      starterCode: |-
        def audit_evidence_bundle(items, required_kinds):
            raise NotImplementedError
      solution: |
        def audit_evidence_bundle(items, required_kinds):
            scenarios = {}
            for item in items:
                scenarios.setdefault(item["scenario"], set()).add(item["kind"])
            missing = {}
            required = set(required_kinds)
            for scenario, kinds in sorted(scenarios.items()):
                absent = sorted(required - kinds)
                if absent:
                    missing[scenario] = absent
            return {"complete": bool(scenarios) and not missing, "scenarios": sorted(scenarios), "missing": missing}
      hints: *id002
    check:
      id: python.playwright.playwright_04.evidence-bundle-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_04.evidence-bundle-audit.transfer.behavior.v1.fixture
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
        entry: audit_evidence_bundle
        cases:
        - id: accepts-complete-scenario
          arguments:
          - value:
            - scenario: login
              kind: assertion
            - scenario: login
              kind: screenshot
            - scenario: login
              kind: trace
          - value:
            - assertion
            - screenshot
            - trace
          expectedReturn:
            complete: true
            scenarios:
            - login
            missing: {}
        - id: reports-per-scenario-gaps
          arguments:
          - value:
            - scenario: a
              kind: assertion
            - scenario: b
              kind: screenshot
          - value:
            - assertion
            - screenshot
          expectedReturn:
            complete: false
            scenarios:
            - a
            - b
            missing:
              a:
              - screenshot
              b:
              - assertion
        - id: rejects-empty-evidence
          arguments:
          - value: []
          - value:
            - assertion
          expectedReturn:
            complete: false
            scenarios: []
            missing: {}
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: playwright_04-visual-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - playwright_04-evidence-bundle-audit-transfer
    title: 스크린샷과 실행 증거 역할 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 시각 회귀·동작 판정·실패 진단에 맞는 artifact를 선택한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 브라우저 동작 성공과 사용자 목표 달성을 같은 것으로 취급하지 마세요.
    - 선택한 action과 함께 판정 가능한 evidence와 남는 risk를 기록하세요.
    exercise:
      prompt: choose_visual_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_visual_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_visual_evidence(situation):
            table = {'layout-regression': {'action': 'viewport-bound screenshot', 'evidence': 'baseline metadata and pixel diff', 'risk': 'over-masking'}, 'behavior-pass': {'action': 'semantic assertion', 'evidence': 'observed user outcome', 'risk': 'pretty screenshot without proof'}, 'intermittent-failure': {'action': 'retain trace and screenshot', 'evidence': 'timeline network console', 'risk': 'secret leakage'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.playwright.playwright_04.visual-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.playwright.playwright_04.visual-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_visual_evidence
        cases:
        - id: recalls-layout-regression
          arguments:
          - value: layout-regression
          expectedReturn:
            action: viewport-bound screenshot
            evidence: baseline metadata and pixel diff
            risk: over-masking
        - id: recalls-behavior-pass
          arguments:
          - value: behavior-pass
          expectedReturn:
            action: semantic assertion
            evidence: observed user outcome
            risk: pretty screenshot without proof
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};