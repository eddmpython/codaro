var e=`meta:
  id: playwright_08
  title: pytest 흐름
  order: 8
  category: playwright
  difficulty: medium
  audience: Python 기본 문법을 익힌 자동화 입문자
  packages:
    - playwright
    - pytest
  tags:
    - playwright
    - pytest
    - test
    - 자동검증
intro:
  direction: Playwright 브라우저 점검을 pytest 함수와 subprocess 실행으로 감싸 자동 검증 흐름을 익힌다.
  benefits:
    - 셀에서 검증한 브라우저 코드를 테스트 함수 형태로 정리할 수 있다.
    - 임시 테스트 파일을 만들어 pytest 결과를 확인할 수 있다.
    - 실패하는 테스트를 고친 뒤 완료 리포트를 만들 수 있다.
  diagram:
    steps:
      - label: 테스트 함수 모양 작성
        detail: 브라우저 실행과 assert를 test_ 함수 안에 넣어 반복 실행 가능한 단위로 만듭니다.
      - label: 임시 테스트 파일 생성
        detail: scratch/temp 경로에 pytest 파일을 쓰고 저장소 루트에는 산출물을 남기지 않습니다.
      - label: pytest 프로세스 실행
        detail: 현재 Python 실행기로 pytest를 호출해 테스트 통과 여부를 반환값으로 확인합니다.
      - label: 실패 수정 결과 정리
        detail: 실패하던 기대값을 고친 뒤 returncode와 stdout을 완료 리포트에 남깁니다.
    runtime:
      - label: pytest 패키지 준비
        detail: meta.packages에 pytest를 선언하고 테스트 실행 셀에서 import 또는 subprocess 호출이 가능해야 합니다.
      - label: Playwright 테스트 함수 실행
        detail: 테스트 파일 안의 sync_playwright 코드가 Chromium에서 동작해야 합니다.
      - label: 테스트 결과 assert
        detail: subprocess returncode가 0인지 확인해 자동 검증 완료를 판단합니다.
sections:
  - id: test-function
    title: 테스트 함수로 감싸기
    structuredPrimary: true
    subtitle: test_ 함수와 assert
    goal: 브라우저 점검 코드를 pytest가 인식하는 test_ 함수 형태로 작성한다.
    why: 테스트 함수로 정리하면 같은 브라우저 점검을 수동 셀 실행이 아니라 반복 가능한 검증 단위로 관리할 수 있다.
    explanation: pytest는 test_로 시작하는 함수를 테스트로 수집합니다. 함수 안에서 Playwright를 실행하고 assert를 두면 독립 실행 가능한 검증 단위가 됩니다. 먼저 문자열로 된 테스트 파일 내용을 만들고, 필수 문구가 들어 있는지 확인합니다.
    tips:
      - 테스트 함수 이름은 어떤 화면 기준을 검증하는지 드러나야 합니다.
      - 함수 안의 browser.close까지 포함해 자원을 정리합니다.
    snippet: |-
      testSource = '''
      from playwright.sync_api import sync_playwright

      def test_dashboard_title():
          with sync_playwright() as p:
              browser = p.chromium.launch(headless=True)
              page = browser.new_page()
              page.set_content("<title>Dashboard</title>")
              assert page.title() == "Dashboard"
              browser.close()
      '''

      assert "def test_dashboard_title" in testSource
      assert "sync_playwright" in testSource
      testSource.strip().splitlines()[0]
    exercise:
      prompt: 테스트 함수 이름을 test_order_title로 바꾸고 source 문자열 검증을 맞추세요.
      starterCode: |-
        testSource = '''
        from playwright.sync_api import sync_playwright

        def ___():
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.set_content("<title>Order</title>")
                assert page.title() == "Order"
                browser.close()
        '''

        assert "def test_order_title" in testSource
        assert "sync_playwright" in testSource
        testSource.strip().splitlines()[0]
      solution: |-
        testSource = '''
        from playwright.sync_api import sync_playwright

        def test_order_title():
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.set_content("<title>Order</title>")
                assert page.title() == "Order"
                browser.close()
        '''

        assert "def test_order_title" in testSource
        assert "sync_playwright" in testSource
        testSource.strip().splitlines()[0]
      hints:
        - pytest는 test_로 시작하는 함수를 자동 수집합니다.
        - 문자열 검증은 실제 함수 이름과 같아야 합니다.
    check:
      noError: testSource 문자열 생성과 assert가 Playwright 테스트 함수 이름을 확인해야 합니다.
      resultCheck: testSource에 test_order_title 함수 정의가 포함되어야 합니다.
  - id: write-test-file
    title: 임시 테스트 파일 만들기
    structuredPrimary: true
    subtitle: scratch 경로에 저장
    goal: Playwright 테스트 코드를 안전한 임시 경로의 Python 파일로 저장한다.
    why: 테스트 파일을 저장소 루트에 만들지 않아야 학습 산출물이 제품 소스와 섞이지 않는다.
    explanation: pytest는 파일 단위로 테스트를 실행하므로 실습에서는 테스트 파일을 만들어야 합니다. 하지만 루트에 test_tmp.py 같은 파일을 남기면 repository cleanliness를 깨뜨립니다. 출력 폴더나 OS temp 아래에 전용 디렉터리를 만들고 그 안에 테스트 파일을 씁니다.
    tips:
      - tempfile.gettempdir 또는 CODARO_PLAYWRIGHT_OUTPUT_DIR 아래를 사용합니다.
      - 파일을 쓴 뒤 exists와 내용을 함께 확인합니다.
    snippet: |-
      from pathlib import Path
      import os
      import tempfile

      outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-pytest"
      outputDir.mkdir(parents=True, exist_ok=True)
      testPath = outputDir / "test_smoke.py"
      testPath.write_text("def test_basic_math():\\n    assert 1 + 1 == 2\\n", encoding="utf-8")

      assert testPath.exists()
      assert "test_basic_math" in testPath.read_text(encoding="utf-8")
      str(testPath)
    exercise:
      prompt: 테스트 파일명을 test_order.py로 바꾸고 파일명 검증을 통과시키세요.
      starterCode: |-
        from pathlib import Path
        import os
        import tempfile

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-pytest"
        outputDir.mkdir(parents=True, exist_ok=True)
        testPath = outputDir / "___"
        testPath.write_text("def test_basic_math():\\n    assert 1 + 1 == 2\\n", encoding="utf-8")

        assert testPath.exists()
        assert testPath.name == "test_order.py"
        str(testPath)
      solution: |-
        from pathlib import Path
        import os
        import tempfile

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-pytest"
        outputDir.mkdir(parents=True, exist_ok=True)
        testPath = outputDir / "test_order.py"
        testPath.write_text("def test_basic_math():\\n    assert 1 + 1 == 2\\n", encoding="utf-8")

        assert testPath.exists()
        assert testPath.name == "test_order.py"
        str(testPath)
      hints:
        - 파일명은 test_로 시작해야 pytest가 자동 수집합니다.
        - assert의 파일명과 testPath에 넣은 문자열을 맞추세요.
    check:
      noError: 임시 경로 생성과 테스트 파일 쓰기가 pytest 대상 파일을 남겨야 합니다.
      resultCheck: testPath가 test_order.py 파일을 가리키고 실제로 존재해야 합니다.
  - id: run-pytest
    title: pytest로 브라우저 테스트 실행
    structuredPrimary: true
    subtitle: subprocess returncode
    goal: 임시 테스트 파일을 pytest로 실행하고 통과 returncode를 확인한다.
    why: 자동화 검증은 셀 내부 assert를 넘어 별도 테스트 프로세스로 반복 실행될 수 있어야 한다.
    explanation: subprocess로 현재 Python 실행기에서 pytest를 호출하면 실습 환경의 패키지를 그대로 사용합니다. 테스트 파일은 Playwright로 브라우저를 열고 title을 검증합니다. returncode가 0이면 테스트가 통과한 것입니다.
    tips:
      - sys.executable을 사용하면 현재 uv 실행 환경과 같은 Python으로 pytest를 실행합니다.
      - stdout은 실패 분석에 필요한 최소 로그로 남깁니다.
    snippet: |-
      from pathlib import Path
      import os
      import subprocess
      import sys
      import tempfile
      import textwrap

      outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-pytest"
      outputDir.mkdir(parents=True, exist_ok=True)
      testPath = outputDir / "test_playwright_smoke.py"
      testPath.write_text(textwrap.dedent('''
      from playwright.sync_api import sync_playwright

      def test_title_smoke():
          with sync_playwright() as p:
              browser = p.chromium.launch(headless=True)
              page = browser.new_page()
              page.set_content("<title>pytest smoke</title>")
              assert page.title() == "pytest smoke"
              browser.close()
      ''').lstrip(), encoding="utf-8")

      result = subprocess.run([sys.executable, "-m", "pytest", str(testPath), "-q"], capture_output=True, text=True, timeout=60)
      assert result.returncode == 0, result.stdout + result.stderr
      result.stdout.strip()
    exercise:
      prompt: 테스트 title을 "pytest order"로 바꾸고 pytest 실행을 통과시키세요.
      starterCode: |-
        from pathlib import Path
        import os
        import subprocess
        import sys
        import tempfile
        import textwrap

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-pytest"
        outputDir.mkdir(parents=True, exist_ok=True)
        testPath = outputDir / "test_playwright_smoke.py"
        testPath.write_text(textwrap.dedent('''
        from playwright.sync_api import sync_playwright

        def test_title_smoke():
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.set_content("<title>___</title>")
                assert page.title() == "pytest order"
                browser.close()
        ''').lstrip(), encoding="utf-8")

        result = subprocess.run([sys.executable, "-m", "pytest", str(testPath), "-q"], capture_output=True, text=True, timeout=60)
        assert result.returncode == 0, result.stdout + result.stderr
        result.stdout.strip()
      solution: |-
        from pathlib import Path
        import os
        import subprocess
        import sys
        import tempfile
        import textwrap

        outputDir = Path(os.environ.get("CODARO_PLAYWRIGHT_OUTPUT_DIR", tempfile.gettempdir())) / "codaro-playwright-pytest"
        outputDir.mkdir(parents=True, exist_ok=True)
        testPath = outputDir / "test_playwright_smoke.py"
        testPath.write_text(textwrap.dedent('''
        from playwright.sync_api import sync_playwright

        def test_title_smoke():
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.set_content("<title>pytest order</title>")
                assert page.title() == "pytest order"
                browser.close()
        ''').lstrip(), encoding="utf-8")

        result = subprocess.run([sys.executable, "-m", "pytest", str(testPath), "-q"], capture_output=True, text=True, timeout=60)
        assert result.returncode == 0, result.stdout + result.stderr
        result.stdout.strip()
      hints:
        - HTML title과 assert의 expected title을 같은 값으로 맞추세요.
        - returncode가 0이 아니면 stdout과 stderr를 먼저 읽으세요.
    check:
      noError: pytest subprocess가 timeout 없이 종료되어야 합니다.
      resultCheck: result.returncode가 0이고 테스트 파일이 통과해야 합니다.
  - id: pytest-completion
    title: 테스트 완료 리포트
    structuredPrimary: true
    subtitle: returncode와 통과 수
    goal: pytest 실행 결과를 completion 딕셔너리로 정리하고 통과 여부를 검증한다.
    why: 테스트 자동화는 실행 결과를 구조화해야 CI 로그, 태스크 리포트, 학습 진행 상태로 연결된다.
    explanation: 마지막 섹션은 pytest 실행 결과에서 returncode와 stdout을 읽어 completion 객체를 만듭니다. stdout에 "passed"가 들어 있는지 확인하면 몇 개의 테스트가 성공했는지 사람이 읽기 쉽습니다. 이 구조는 CI나 자동화 태스크 결과 요약에도 사용할 수 있습니다.
    tips:
      - returncode와 stdout을 함께 보관하면 실패 분석이 쉬워집니다.
      - 완료 리포트는 passed와 command 두 정보를 담으면 다음 실행에 유용합니다.
    snippet: |-
      import subprocess
      import sys

      result = subprocess.run([sys.executable, "-c", "assert 2 + 2 == 4; print('1 passed')"], capture_output=True, text=True, timeout=10)
      completion = {"returncode": result.returncode, "passedText": "passed" in result.stdout}

      assert completion == {"returncode": 0, "passedText": True}
      completion
    exercise:
      prompt: 내부 Python 명령이 "browser check passed"를 출력하게 바꾸고 completion 검증을 유지하세요.
      starterCode: |-
        import subprocess
        import sys

        result = subprocess.run([sys.executable, "-c", "assert 3 * 3 == 9; print('___')"], capture_output=True, text=True, timeout=10)
        completion = {"returncode": result.returncode, "passedText": "passed" in result.stdout}

        assert completion == {"returncode": 0, "passedText": True}
        completion
      solution: |-
        import subprocess
        import sys

        result = subprocess.run([sys.executable, "-c", "assert 3 * 3 == 9; print('browser check passed')"], capture_output=True, text=True, timeout=10)
        completion = {"returncode": result.returncode, "passedText": "passed" in result.stdout}

        assert completion == {"returncode": 0, "passedText": True}
        completion
      hints:
        - 출력 문자열 안에 passed가 포함되어야 passedText가 True가 됩니다.
        - returncode는 내부 assert가 통과해야 0입니다.
    check:
      noError: subprocess 실행과 completion 생성이 오류 없이 끝나야 합니다.
      resultCheck: completion이 returncode 0과 passedText True를 가져야 합니다.
`;export{e as default};