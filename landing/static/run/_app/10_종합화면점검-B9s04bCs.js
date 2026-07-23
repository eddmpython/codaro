var e=`meta:
  id: inputCtl_10
  title: 종합 화면 점검 매크로
  order: 10
  category: inputCtl
  difficulty: medium
  audience: GUI 자동화에 입문하는 Python 학습자
  packages:
    - pyautogui
    - pyperclip
  tags:
    - capstone
    - automation
    - workflow
intro:
  direction: 안전 설정, 상태 관측, 영역 캡처, 이미지 매치, 클립보드 보고를 묶어 한 사이클로 동작하는 화면 점검 매크로를 직접 만들어 본다.
  benefits:
    - 자동화 진입에서 PAUSE와 FAILSAFE를 설정한다.
    - pyautogui.size와 position으로 시작 상태를 관측한다.
    - 화면 일부 영역을 캡처하고 위치를 다시 찾는다.
    - 종합 보고 dict를 만들고 클립보드에 JSON으로 올린다.
  diagram:
    steps:
      - label: 자동화 진입 설정
        detail: PAUSE 0.05, FAILSAFE True로 안전 환경을 만든다.
      - label: 시작 상태 관측
        detail: 시작 시 해상도와 마우스 좌표를 한 dict로 묶어 기록한다.
      - label: 영역 캡처와 매치
        detail: 화면 일부를 캡처하고 needle을 잘라 같은 위치에서 다시 찾는다.
      - label: 종합 보고 + 클립보드
        detail: 결과 dict를 JSON 직렬화해 클립보드에 올리고 다시 받아 보고의 라운드트립을 검증한다.
    runtime:
      - label: pyautogui와 pyperclip 패키지 필요
        detail: meta.packages의 두 라이브러리가 로컬에 준비돼야 한다.
      - label: GUI 세션과 시스템 클립보드
        detail: 실 호출이 마우스/화면/클립보드를 잠시 사용하므로 다른 작업과 겹치지 않게 한다.
sections:
  - id: bootstrap
    title: 자동화 진입 설정
    structuredPrimary: true
    subtitle: PAUSE + FAILSAFE
    goal: bootstrapAutomation 함수가 pyautogui PAUSE와 FAILSAFE를 설정하고 결과 dict로 보고한다.
    why: 자동화 매크로의 모든 사이클은 안전 설정에서 시작해야 사고 위험이 일관되게 제한된다.
    explanation: bootstrapAutomation은 pauseSeconds 인자를 받아 PAUSE에 할당하고 FAILSAFE를 True로 고정한 뒤 두 값을 dict로 돌려준다. 같은 함수가 자동화 사이클의 첫 단계로 호출돼야 후속 함수가 안심하고 동작한다.
    tips:
      - PAUSE는 0.05초처럼 짧게 두면 자동화 사이클 시간이 줄어든다.
      - FAILSAFE는 운영 환경에서 절대 False로 두지 않는다.
    snippet: |-
      import pyautogui


      def bootstrapAutomation(pauseSeconds: float = 0.05) -> dict:
          pyautogui.PAUSE = pauseSeconds
          pyautogui.FAILSAFE = True
          return {"pause": pyautogui.PAUSE, "failsafe": pyautogui.FAILSAFE}


      bootstrap = bootstrapAutomation(0.05)

      assert bootstrap == {"pause": 0.05, "failsafe": True}
      bootstrap
    exercise:
      prompt: bootstrapAutomation에 pauseSeconds=0.1을 넘기면 pause 0.1과 failsafe True가 dict로 돌아오는지 검증하세요.
      starterCode: |-
        import pyautogui


        def bootstrapAutomation(pauseSeconds: float = 0.05) -> dict:
            pyautogui.PAUSE = pauseSeconds
            pyautogui.FAILSAFE = ___
            return {"pause": pyautogui.PAUSE, "failsafe": pyautogui.FAILSAFE}


        bootstrap = bootstrapAutomation(0.1)

        assert bootstrap == {"pause": 0.1, "failsafe": True}
        bootstrap
      solution: |-
        import pyautogui


        def bootstrapAutomation(pauseSeconds: float = 0.05) -> dict:
            pyautogui.PAUSE = pauseSeconds
            pyautogui.FAILSAFE = True
            return {"pause": pyautogui.PAUSE, "failsafe": pyautogui.FAILSAFE}


        bootstrap = bootstrapAutomation(0.1)

        assert bootstrap == {"pause": 0.1, "failsafe": True}
        bootstrap
      hints:
        - FAILSAFE 값은 항상 True로 둔다.
        - 결과 dict는 pause와 failsafe 두 키를 가진다.
      check:
        noError: bootstrapAutomation 호출이 끝나야 한다.
        resultCheck: bootstrap이 pause 0.1과 failsafe True를 담아야 한다.
    check:
      noError: 안전 설정 함수 호출이 끝나야 한다.
      resultCheck: bootstrap이 pause 0.05와 failsafe True를 담아야 한다.
  - id: observe-state
    title: 시작 상태 관측
    structuredPrimary: true
    subtitle: size + position
    goal: observeStartState 함수가 해상도와 마우스 좌표를 한 dict로 묶어 시작 상태를 보고한다.
    why: 자동화 사이클은 시작 시점의 환경을 기록해 둬야 사고 발생 시 비교 추적이 쉽다.
    explanation: observeStartState는 pyautogui.size와 position을 호출해 screen, cursor 두 키를 가진 dict를 돌려준다. 결과는 정수 좌표만 담아 JSON 직렬화에 안전하다. 같은 함수를 사이클 끝에서 다시 호출해 변동량을 비교할 수 있다.
    tips:
      - 시작 상태는 자동화 로그의 첫 줄로 기록하면 추적이 쉽다.
      - 같은 함수를 사이클 끝에서도 호출하면 마우스 이동량을 알 수 있다.
    snippet: |-
      import pyautogui


      def observeStartState() -> dict:
          screen = pyautogui.size()
          cursor = pyautogui.position()
          return {
              "screen": {"width": screen.width, "height": screen.height},
              "cursor": {"x": cursor.x, "y": cursor.y},
          }


      startState = observeStartState()

      assert startState["screen"]["width"] > 0
      assert isinstance(startState["cursor"]["x"], int)
      startState["screen"]
    exercise:
      prompt: observeStartState를 호출해 screen.height가 양수이고 cursor.y가 정수인지 검증하세요.
      starterCode: |-
        import pyautogui


        def observeStartState() -> dict:
            screen = pyautogui.size()
            cursor = pyautogui.___()
            return {
                "screen": {"width": screen.width, "height": screen.height},
                "cursor": {"x": cursor.x, "y": cursor.y},
            }


        startState = observeStartState()

        assert startState["screen"]["height"] > 0
        assert isinstance(startState["cursor"]["y"], int)
        startState["screen"]
      solution: |-
        import pyautogui


        def observeStartState() -> dict:
            screen = pyautogui.size()
            cursor = pyautogui.position()
            return {
                "screen": {"width": screen.width, "height": screen.height},
                "cursor": {"x": cursor.x, "y": cursor.y},
            }


        startState = observeStartState()

        assert startState["screen"]["height"] > 0
        assert isinstance(startState["cursor"]["y"], int)
        startState["screen"]
      hints:
        - 좌표 함수 이름은 position이다.
        - cursor.y는 정수형이다.
      check:
        noError: observeStartState 호출이 끝나야 한다.
        resultCheck: screen.height가 양수이고 cursor.y가 정수여야 한다.
    check:
      noError: observeStartState 호출이 끝나야 한다.
      resultCheck: startState에 screen과 cursor가 있어야 한다.
  - id: capture-and-locate
    title: 영역 캡처와 매치
    structuredPrimary: true
    subtitle: screenshot + locate
    goal: captureAndLocate 함수가 영역 캡처에서 needle을 잘라 같은 영역에서 다시 찾는 사이클을 수행한다.
    why: 캡처와 매치는 화면 안 요소를 좌표로 잡는 자동화의 핵심 사이클이므로 한 함수로 표준화해 둔다.
    explanation: captureAndLocate는 영역 tuple을 받아 pyautogui.screenshot으로 캡처하고 결과 이미지의 중앙 사각형을 needle로 잘라 pyautogui.locate로 다시 찾는다. 결과 dict는 captureSize, needleSize, found, needleAt 네 키를 담아 사이클 결과를 한 행으로 보고한다.
    tips:
      - needle을 캡처 중앙에서 자르면 매치가 항상 보장돼 학습 결정성이 유지된다.
      - 매치 결과 Box의 좌표는 캡처 안 상대 좌표다.
    snippet: |-
      import pyautogui


      def captureAndLocate(region: tuple) -> dict:
          capture = pyautogui.screenshot(region=region)
          width, height = capture.size
          needle = capture.crop((width // 4, height // 4, 3 * width // 4, 3 * height // 4))
          box = pyautogui.locate(needle, capture)
          return {
              "captureSize": capture.size,
              "needleSize": needle.size,
              "found": box is not None,
              "needleAt": (box.left, box.top) if box else None,
          }


      result = captureAndLocate((0, 0, 80, 60))

      assert result["captureSize"] == (80, 60)
      assert result["found"] is True
      assert result["needleAt"] == (20, 15)
      result
    exercise:
      prompt: captureAndLocate에 (0, 0, 60, 40) 영역을 넘기면 captureSize가 (60, 40)이고 found가 True인지 종합 검증하세요.
      starterCode: |-
        import pyautogui


        def captureAndLocate(region: tuple) -> dict:
            capture = pyautogui.screenshot(region=region)
            width, height = capture.size
            needle = capture.crop((width // 4, height // 4, 3 * width // 4, 3 * height // 4))
            box = pyautogui.___(needle, capture)
            return {
                "captureSize": capture.size,
                "needleSize": needle.size,
                "found": box is not None,
                "needleAt": (box.left, box.top) if box else None,
            }


        result = captureAndLocate((0, 0, 60, 40))

        assert result["captureSize"] == (60, 40)
        assert result["found"] is True
        result
      solution: |-
        import pyautogui


        def captureAndLocate(region: tuple) -> dict:
            capture = pyautogui.screenshot(region=region)
            width, height = capture.size
            needle = capture.crop((width // 4, height // 4, 3 * width // 4, 3 * height // 4))
            box = pyautogui.locate(needle, capture)
            return {
                "captureSize": capture.size,
                "needleSize": needle.size,
                "found": box is not None,
                "needleAt": (box.left, box.top) if box else None,
            }


        result = captureAndLocate((0, 0, 60, 40))

        assert result["captureSize"] == (60, 40)
        assert result["found"] is True
        result
      hints:
        - 매치 함수 이름은 locate다.
        - needle은 캡처 중앙에서 잘라내 매치가 항상 성공한다.
      check:
        noError: captureAndLocate 호출이 종합 결과를 돌려줘야 한다.
        resultCheck: captureSize가 (60, 40)이고 found가 True여야 한다.
    check:
      noError: captureAndLocate 호출이 끝나야 한다.
      resultCheck: captureSize가 (80, 60)이고 found가 True여야 한다.
  - id: report-to-clipboard
    title: 종합 보고 + 클립보드
    structuredPrimary: true
    subtitle: JSON 라운드트립
    goal: 사이클 결과 dict를 JSON으로 직렬화해 클립보드에 올리고 paste로 다시 받아 같은 dict로 복원되는지 검증한다.
    why: 자동화 사이클이 보고를 클립보드로 전달하는 패턴은 운영자가 사이클 결과를 다른 도구에 즉시 붙여넣을 수 있어 매우 실용적이다.
    explanation: cycleReport 함수는 bootstrap, startState, locator 세 dict를 받아 종합 보고 dict를 만들고 json.dumps로 직렬화해 클립보드에 올린다. 그리고 paste 결과를 json.loads로 복원해 원본과 같은 dict인지 확인한다. 같은 라운드트립이 자동화 사이클의 결과 보존을 보장한다.
    tips:
      - JSON 라운드트립은 자동화 보고의 무결성을 한 번에 검증한다.
      - 클립보드 보고는 운영자가 다른 메모 앱에 즉시 붙여넣을 수 있어 편리하다.
    snippet: |-
      import json

      import pyperclip


      def cycleReport(bootstrap: dict, startState: dict, locator: dict) -> dict:
          report = {"bootstrap": bootstrap, "startState": startState, "locator": locator}
          pyperclip.copy(json.dumps(report, ensure_ascii=False))
          restored = json.loads(pyperclip.paste())
          return {"report": report, "restored": restored, "matches": report == restored}


      result = cycleReport(
          {"pause": 0.05, "failsafe": True},
          {"screen": {"width": 1920, "height": 1080}, "cursor": {"x": 100, "y": 200}},
          {"captureSize": [60, 40], "found": True, "needleAt": [15, 10]},
      )

      assert result["matches"] is True
      assert result["report"] == result["restored"]
      result["matches"]
    exercise:
      prompt: cycleReport에 임의 dict 세 개를 넘기면 matches가 True이고 report와 restored가 같은지 종합 검증하세요.
      starterCode: |-
        import json

        import pyperclip


        def cycleReport(bootstrap: dict, startState: dict, locator: dict) -> dict:
            report = {"bootstrap": bootstrap, "startState": startState, "locator": locator}
            pyperclip.copy(json.dumps(report, ensure_ascii=False))
            restored = json.loads(pyperclip.___())
            return {"report": report, "restored": restored, "matches": report == restored}


        result = cycleReport(
            {"pause": 0.1, "failsafe": True},
            {"screen": {"width": 800, "height": 600}, "cursor": {"x": 50, "y": 60}},
            {"captureSize": [40, 30], "found": False, "needleAt": None},
        )

        assert result["matches"] is True
        assert result["report"] == result["restored"]
        result["matches"]
      solution: |-
        import json

        import pyperclip


        def cycleReport(bootstrap: dict, startState: dict, locator: dict) -> dict:
            report = {"bootstrap": bootstrap, "startState": startState, "locator": locator}
            pyperclip.copy(json.dumps(report, ensure_ascii=False))
            restored = json.loads(pyperclip.paste())
            return {"report": report, "restored": restored, "matches": report == restored}


        result = cycleReport(
            {"pause": 0.1, "failsafe": True},
            {"screen": {"width": 800, "height": 600}, "cursor": {"x": 50, "y": 60}},
            {"captureSize": [40, 30], "found": False, "needleAt": None},
        )

        assert result["matches"] is True
        assert result["report"] == result["restored"]
        result["matches"]
      hints:
        - 클립보드 읽기 함수 이름은 paste다.
        - JSON 라운드트립 후 두 dict는 같아야 한다.
      check:
        noError: cycleReport 호출이 종합 결과를 돌려줘야 한다.
        resultCheck: matches가 True이고 report와 restored가 동일해야 한다.
    check:
      noError: 종합 사이클 보고 함수 호출이 끝나야 한다.
      resultCheck: matches가 True이고 report와 restored가 같아야 한다.
`;export{e as default};