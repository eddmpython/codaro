var e=`meta:
  id: inputCtl_05
  title: 스크린샷 영역 캡처
  order: 5
  category: inputCtl
  difficulty: easy
  audience: GUI 자동화에 입문하는 Python 학습자
  packages:
    - pyautogui
  tags:
    - pyautogui
    - screenshot
    - automation
intro:
  direction: pyautogui.screenshot으로 화면 전체와 부분 영역을 실제로 캡처해 임시 파일에 저장하고 PIL.Image로 결과를 검증하는 흐름을 만든다.
  benefits:
    - pyautogui.screenshot()으로 화면 전체를 PIL Image로 받는다.
    - region 인자로 사각 영역만 잘라 캡처한다.
    - 캡처 결과를 tempfile 안 PNG 파일로 저장한다.
    - 종합 캡처 함수가 경로와 크기를 dict로 보고한다.
  diagram:
    steps:
      - label: 화면 전체 캡처
        detail: pyautogui.screenshot()을 호출해 PIL.Image 객체를 받는다.
      - label: 영역 캡처
        detail: region=(left, top, width, height) 인자로 부분 영역만 잘라 받는다.
      - label: 파일로 저장
        detail: Image.save로 tempfile 안 PNG 파일을 만든다.
      - label: 종합 캡처 함수
        detail: 영역, 저장 경로, 파일 크기를 한 dict로 묶어 자동화 캡처 결과를 보고한다.
    runtime:
      - label: pyautogui 패키지 필요
        detail: meta.packages의 pyautogui가 설치되면 PIL은 의존성으로 함께 들어온다.
      - label: GUI 세션 필요
        detail: 실제 디스플레이가 연결돼야 screenshot이 의미 있는 이미지를 돌려준다.
sections:
  - id: full-screenshot
    title: 화면 전체 캡처
    structuredPrimary: true
    subtitle: pyautogui.screenshot()
    goal: pyautogui.screenshot()을 호출해 PIL.Image 객체를 받고 size 속성으로 해상도를 확인한다.
    why: 자동화의 시각 검증은 캡처에서 시작하므로 화면 전체 캡처 흐름을 먼저 익혀야 다음 단계가 단순해진다.
    explanation: pyautogui.screenshot()은 인자 없이 호출하면 화면 전체를 PIL.Image 객체로 돌려준다. Image.size는 (width, height) tuple이며 화면 해상도와 일치한다. 같은 호출을 두 번 해도 화면이 바뀌지 않았다면 같은 크기의 이미지가 돌아온다.
    tips:
      - screenshot 결과는 PIL.Image라 save, crop, resize 등의 PIL API를 그대로 활용할 수 있다.
      - 화면 전체 캡처는 RAM 사용이 크므로 자주 호출하지 않는다.
    snippet: |-
      import pyautogui

      screenshot = pyautogui.screenshot()
      width, height = screenshot.size

      assert width > 0
      assert height > 0
      screenshot.size
    exercise:
      prompt: pyautogui.screenshot으로 화면 전체를 캡처하고 size tuple의 두 값이 양수인지 검증하세요.
      starterCode: |-
        import pyautogui

        screenshot = pyautogui.___()
        width, height = screenshot.size

        assert width > 0
        assert height > 0
        screenshot.size
      solution: |-
        import pyautogui

        screenshot = pyautogui.screenshot()
        width, height = screenshot.size

        assert width > 0
        assert height > 0
        screenshot.size
      hints:
        - 캡처 함수 이름은 screenshot이다.
        - 결과는 PIL.Image이며 size 속성으로 해상도를 확인한다.
      check:
        noError: screenshot 호출이 끝나야 한다.
        resultCheck: size의 두 값이 양수여야 한다.
    check:
      noError: pyautogui.screenshot 호출이 끝나야 한다.
      resultCheck: size 튜플의 width와 height가 양수여야 한다.
  - id: region-capture
    title: 영역만 잘라 캡처
    structuredPrimary: true
    subtitle: region 인자
    goal: pyautogui.screenshot(region=(left, top, width, height))로 부분 영역만 캡처한다.
    why: 자동화는 화면 일부만 보면 충분한 경우가 많아 영역 캡처가 메모리와 처리 시간을 크게 줄인다.
    explanation: region 인자는 (left, top, width, height) tuple이다. 결과 Image.size는 정확히 (width, height)다. 영역이 화면 밖으로 일부 나가도 pyautogui가 보정해 준다.
    tips:
      - 영역 좌표는 항상 정수로 둔다.
      - 좁은 영역만 캡처하면 자동화 사이클이 빨라진다.
    snippet: |-
      import pyautogui

      region = (0, 0, 100, 80)
      patch = pyautogui.screenshot(region=region)

      assert patch.size == (100, 80)
      patch.size
    exercise:
      prompt: region=(0, 0, 50, 40)로 영역 캡처하면 결과 size가 정확히 (50, 40)인지 검증하세요.
      starterCode: |-
        import pyautogui

        region = (0, 0, 50, 40)
        patch = pyautogui.screenshot(___=region)

        assert patch.size == (50, 40)
        patch.size
      solution: |-
        import pyautogui

        region = (0, 0, 50, 40)
        patch = pyautogui.screenshot(region=region)

        assert patch.size == (50, 40)
        patch.size
      hints:
        - 인자 이름은 region이다.
        - region tuple의 마지막 두 값이 결과 이미지 크기다.
      check:
        noError: 영역 screenshot 호출이 끝나야 한다.
        resultCheck: patch.size가 정확히 (50, 40)이어야 한다.
    check:
      noError: 영역 screenshot 호출이 끝나야 한다.
      resultCheck: patch.size가 (100, 80)이어야 한다.
  - id: save-png
    title: 캡처를 파일로 저장
    structuredPrimary: true
    subtitle: tempfile + Image.save
    goal: 캡처한 이미지를 tempfile 안 PNG 파일로 저장하고 파일 크기가 양수인지 확인한다.
    why: 자동화 보고에는 캡처 시점의 이미지를 파일로 남기는 것이 표준이라 저장 흐름을 정확히 익혀야 한다.
    explanation: PIL.Image.save(path)는 파일 확장자로 포맷을 결정한다. .png 확장자는 자동으로 PNG 인코딩을 적용한다. tempfile.TemporaryDirectory 컨텍스트가 끝나면 폴더가 자동 삭제돼 디스크가 어지러워지지 않는다.
    tips:
      - 파일 이름에 타임스탬프를 넣으면 자동화 사이클마다 캡처를 보존할 수 있다.
      - .png 외에 .jpg, .bmp 등 PIL이 지원하는 포맷을 그대로 쓸 수 있다.
    snippet: |-
      import tempfile
      from pathlib import Path

      import pyautogui

      with tempfile.TemporaryDirectory() as td:
          target = Path(td) / "snap.png"
          pyautogui.screenshot(region=(0, 0, 60, 40)).save(target)
          size = target.stat().st_size

      assert size > 0
      size
    exercise:
      prompt: tempfile 안에 region_snap.png 파일로 (0, 0, 40, 30) 영역 캡처를 저장하고 파일 크기가 양수인지 검증하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path

        import pyautogui

        with tempfile.TemporaryDirectory() as td:
            target = Path(td) / "region_snap.png"
            pyautogui.screenshot(region=(0, 0, 40, 30)).___(target)
            size = target.stat().st_size

        assert size > 0
        size
      solution: |-
        import tempfile
        from pathlib import Path

        import pyautogui

        with tempfile.TemporaryDirectory() as td:
            target = Path(td) / "region_snap.png"
            pyautogui.screenshot(region=(0, 0, 40, 30)).save(target)
            size = target.stat().st_size

        assert size > 0
        size
      hints:
        - PIL.Image 메서드 이름은 save다.
        - .png 확장자가 인코딩 포맷을 결정한다.
      check:
        noError: screenshot과 save 호출이 끝나야 한다.
        resultCheck: 저장된 파일의 크기가 0보다 커야 한다.
    check:
      noError: screenshot과 save 호출이 끝나야 한다.
      resultCheck: 저장된 PNG 파일의 크기가 양수여야 한다.
  - id: capture-report
    title: 종합 캡처 보고
    structuredPrimary: true
    subtitle: 경로와 크기 dict
    goal: 영역 캡처와 저장을 한 함수로 묶어 path, size, fileBytes를 dict로 돌려주는 종합 보고를 만든다.
    why: 종합 캡처 함수는 자동화 사이클이 어떤 영역을 어디에 얼마만큼 저장했는지 한눈에 보여 사고 추적에 결정적이다.
    explanation: captureRegion 함수는 영역 tuple과 저장 폴더, 파일 이름을 받아 screenshot + save를 수행한 뒤 path 문자열, size tuple, fileBytes 정수를 dict로 돌려준다. 결과 dict는 그대로 자동화 보고서에 들어간다.
    tips:
      - 보고 dict는 JSON 직렬화에 안전한 기본 타입만 담아 운영 환경 로그가 단순해진다.
      - 캡처 영역이 작아도 PNG 헤더 오버헤드 때문에 fileBytes는 항상 0보다 크다.
    snippet: |-
      import tempfile
      from pathlib import Path

      import pyautogui


      def captureRegion(region: tuple, base: Path, filename: str) -> dict:
          target = base / filename
          image = pyautogui.screenshot(region=region)
          image.save(target)
          return {
              "path": str(target),
              "size": image.size,
              "fileBytes": target.stat().st_size,
          }


      with tempfile.TemporaryDirectory() as td:
          report = captureRegion((0, 0, 80, 60), Path(td), "capture.png")

      assert report["size"] == (80, 60)
      assert report["fileBytes"] > 0
      assert report["path"].endswith("capture.png")
      report["size"]
    exercise:
      prompt: captureRegion에 (0, 0, 50, 50) 영역과 sample.png 이름을 넘기면 size가 (50, 50)이고 fileBytes가 양수이고 path가 sample.png로 끝나는지 종합 검증하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path

        import pyautogui


        def captureRegion(region: tuple, base: Path, filename: str) -> dict:
            target = base / filename
            image = pyautogui.screenshot(region=region)
            image.save(target)
            return {
                "path": str(target),
                "size": image.size,
                "fileBytes": target.stat().___,
            }


        with tempfile.TemporaryDirectory() as td:
            report = captureRegion((0, 0, 50, 50), Path(td), "sample.png")

        assert report["size"] == (50, 50)
        assert report["fileBytes"] > 0
        assert report["path"].endswith("sample.png")
        report["size"]
      solution: |-
        import tempfile
        from pathlib import Path

        import pyautogui


        def captureRegion(region: tuple, base: Path, filename: str) -> dict:
            target = base / filename
            image = pyautogui.screenshot(region=region)
            image.save(target)
            return {
                "path": str(target),
                "size": image.size,
                "fileBytes": target.stat().st_size,
            }


        with tempfile.TemporaryDirectory() as td:
            report = captureRegion((0, 0, 50, 50), Path(td), "sample.png")

        assert report["size"] == (50, 50)
        assert report["fileBytes"] > 0
        assert report["path"].endswith("sample.png")
        report["size"]
      hints:
        - stat 객체의 크기 속성 이름은 st_size다.
        - size 튜플은 region의 마지막 두 값과 같다.
      check:
        noError: captureRegion 호출이 종합 결과를 돌려줘야 한다.
        resultCheck: size, fileBytes, path가 본문 기대값과 같아야 한다.
    check:
      noError: captureRegion 호출이 끝나야 한다.
      resultCheck: size가 (80, 60)이고 fileBytes가 양수이고 path가 capture.png로 끝나야 한다.
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
  - id: inputCtl_05-screenshot-region-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - full-screenshot
    - capture-report
    title: 스크린샷 region의 화면 경계·pixel budget 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 양수 크기와 containment, 최대 pixel 수를 검사한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 전체 화면 대신 필요한 UI region만 캡처해 민감정보와 비용을 줄이세요.
    - region containment와 pixel budget을 캡처 전에 검사하세요.
    exercise:
      prompt: audit_screenshot_region(region, screen, maximum_pixels)를 완성하세요.
      starterCode: |-
        def audit_screenshot_region(region, screen, maximum_pixels):
            raise NotImplementedError
      solution: |
        def audit_screenshot_region(region, screen, maximum_pixels):
            failures = []
            if region["width"] <= 0 or region["height"] <= 0:
                failures.append("size")
            contained = region["x"] >= screen["x"] and region["y"] >= screen["y"] and region["x"] + region["width"] <= screen["x"] + screen["width"] and region["y"] + region["height"] <= screen["y"] + screen["height"]
            if not contained:
                failures.append("bounds")
            pixels = max(0, region["width"]) * max(0, region["height"])
            if pixels > maximum_pixels:
                failures.append("pixel-budget")
            return {"accepted": not failures, "failures": failures, "pixels": pixels, "contained": contained}
      hints: *id001
    check:
      id: python.inputctl.inputCtl_05.screenshot-region-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.inputctl.inputCtl_05.screenshot-region-audit.mastery.behavior.v1.fixture
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
        entry: audit_screenshot_region
        cases:
        - id: accepts-contained-region
          arguments:
          - value:
              x: 10
              y: 10
              width: 100
              height: 50
          - value:
              x: 0
              y: 0
              width: 200
              height: 100
          - value: 10000
          expectedReturn:
            accepted: true
            failures: []
            pixels: 5000
            contained: true
        - id: reports-bounds-and-budget
          arguments:
          - value:
              x: 150
              y: 0
              width: 100
              height: 100
          - value:
              x: 0
              y: 0
              width: 200
              height: 100
          - value: 5000
          expectedReturn:
            accepted: false
            failures:
            - bounds
            - pixel-budget
            pixels: 10000
            contained: false
        - id: reports-zero-size
          arguments:
          - value:
              x: 0
              y: 0
              width: 0
              height: 10
          - value:
              x: 0
              y: 0
              width: 100
              height: 100
          - value: 1000
          expectedReturn:
            accepted: false
            failures:
            - size
            pixels: 0
            contained: true
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: inputCtl_05-screenshot-mask-plan-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - inputCtl_05-screenshot-region-audit-mastery
    title: 새 화면 증거에 민감 region mask 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 필수 mask 누락과 화면 전체를 가리는 과도한 mask를 찾는다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 민감 region은 selector·ID 단위로 mask하고 화면 전체를 가리지 마세요.
    - required mask 목록과 실제 적용 목록을 evidence에 남기세요.
    exercise:
      prompt: audit_screenshot_masks(capture, masks, required_mask_ids)를 완성하세요.
      starterCode: |-
        def audit_screenshot_masks(capture, masks, required_mask_ids):
            raise NotImplementedError
      solution: |
        def audit_screenshot_masks(capture, masks, required_mask_ids):
            ids = {mask["id"] for mask in masks}
            missing = sorted(set(required_mask_ids) - ids)
            capture_area = capture["width"] * capture["height"]
            excessive = []
            for mask in masks:
                area = mask["width"] * mask["height"]
                if capture_area and area / capture_area > 0.5:
                    excessive.append(mask["id"])
            failures = []
            if missing:
                failures.append("missing-mask")
            if excessive:
                failures.append("excessive-mask")
            return {"accepted": not failures, "failures": failures, "missing": missing, "excessive": sorted(excessive)}
      hints: *id002
    check:
      id: python.inputctl.inputCtl_05.screenshot-mask-plan.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.inputctl.inputCtl_05.screenshot-mask-plan.transfer.behavior.v1.fixture
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
        entry: audit_screenshot_masks
        cases:
        - id: accepts-targeted-mask
          arguments:
          - value:
              width: 100
              height: 100
          - value:
            - id: email
              width: 20
              height: 10
          - value:
            - email
          expectedReturn:
            accepted: true
            failures: []
            missing: []
            excessive: []
        - id: reports-missing-mask
          arguments:
          - value:
              width: 100
              height: 100
          - value: []
          - value:
            - token
          expectedReturn:
            accepted: false
            failures:
            - missing-mask
            missing:
            - token
            excessive: []
        - id: reports-screen-covering-mask
          arguments:
          - value:
              width: 100
              height: 100
          - value:
            - id: all
              width: 90
              height: 90
          - value:
            - all
          expectedReturn:
            accepted: false
            failures:
            - excessive-mask
            missing: []
            excessive:
            - all
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: inputCtl_05-screenshot-region-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - inputCtl_05-screenshot-mask-plan-transfer
    title: 스크린샷 region 품질 기준 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 경계·민감정보·시각 evidence 역할을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 입력 자동화 action 전에 대상·경계·중단 방법을 검증하세요.
    - 화면 변화와 E-Stop evidence를 남기고 성공을 클릭 발생으로 판단하지 마세요.
    exercise:
      prompt: choose_screenshot_region(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_screenshot_region(situation):
            raise NotImplementedError
      solution: |
        def choose_screenshot_region(situation):
            table = {'bounds': {'action': 'validate contained positive region', 'evidence': 'screen and region geometry', 'risk': 'off-screen capture'}, 'privacy': {'action': 'mask targeted sensitive regions', 'evidence': 'mask IDs and areas', 'risk': 'secret exposure'}, 'evidence': {'action': 'bind state viewport and hash', 'evidence': 'capture manifest', 'risk': 'unidentified screenshot'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.inputctl.inputCtl_05.screenshot-region-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.inputctl.inputCtl_05.screenshot-region-recall.retrieval.behavior.v1.fixture
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
        entry: choose_screenshot_region
        cases:
        - id: recalls-bounds
          arguments:
          - value: bounds
          expectedReturn:
            action: validate contained positive region
            evidence: screen and region geometry
            risk: off-screen capture
        - id: recalls-privacy
          arguments:
          - value: privacy
          expectedReturn:
            action: mask targeted sensitive regions
            evidence: mask IDs and areas
            risk: secret exposure
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};