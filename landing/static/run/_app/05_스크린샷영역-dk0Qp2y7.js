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
`;export{e as default};