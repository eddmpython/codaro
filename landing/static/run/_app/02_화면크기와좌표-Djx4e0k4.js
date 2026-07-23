var e=`meta:
  id: inputCtl_02
  title: 화면 크기와 좌표 읽기
  order: 2
  category: inputCtl
  difficulty: easy
  audience: GUI 자동화에 입문하는 Python 학습자
  packages:
    - pyautogui
  tags:
    - pyautogui
    - coordinates
    - automation
intro:
  direction: pyautogui로 모니터 해상도와 현재 마우스 위치를 실제 호출로 읽고, 좌표가 화면 안에 있는지 검사해 자동화의 좌표 감각을 만든다.
  benefits:
    - pyautogui.size()로 실제 모니터 해상도를 읽는다.
    - pyautogui.position()으로 현재 마우스 좌표를 읽는다.
    - pyautogui.onScreen()으로 좌표가 화면 안인지 직접 검사한다.
    - 종합 함수로 자동화 시작 시점의 데스크톱 스냅숏을 만든다.
  diagram:
    steps:
      - label: 화면 해상도 읽기
        detail: pyautogui.size()는 width와 height 필드를 가진 namedtuple을 돌려준다.
      - label: 마우스 위치 읽기
        detail: pyautogui.position()은 현재 커서 좌표 (x, y) namedtuple을 돌려준다.
      - label: 영역 안인지 검사
        detail: pyautogui.onScreen(x, y)는 좌표가 화면 경계 안에 있을 때 True를 돌려준다.
      - label: 종합 스냅숏
        detail: 해상도, 마우스 위치, onScreen 결과를 한 dict로 묶어 자동화 시작 상태를 보고한다.
    runtime:
      - label: pyautogui 패키지 필요
        detail: meta.packages의 pyautogui가 로컬 가상환경에 설치돼 있어야 한다.
      - label: GUI 세션 필요
        detail: 실제 화면이 연결돼야 size()와 position()이 의미 있는 값을 돌려준다.
sections:
  - id: read-size
    title: 화면 해상도 읽기
    structuredPrimary: true
    subtitle: pyautogui.size()
    goal: pyautogui.size()를 호출해 모니터 해상도의 width와 height를 분리해 받는다.
    why: 자동화 좌표는 모니터 해상도에 따라 달라지므로 시작 시점에 실제 해상도를 확인해야 안전한 좌표 계산이 가능하다.
    explanation: pyautogui.size()는 collections.namedtuple Size를 돌려주며 width와 height 필드를 모두 가진다. 두 값은 항상 양의 정수다. 다중 모니터 환경에서는 주 모니터 해상도가 기준이 된다.
    tips:
      - Size 객체는 .width, .height 또는 인덱스 [0], [1]로 접근할 수 있다.
      - 해상도는 자동화 시작 시 한 번만 읽어 두면 충분하다.
    snippet: |-
      import pyautogui

      screen = pyautogui.size()
      width, height = screen.width, screen.height

      assert isinstance(width, int) and width > 0
      assert isinstance(height, int) and height > 0
      (width, height)
    exercise:
      prompt: pyautogui.size()를 호출해 width와 height를 분리한 뒤 두 값이 모두 양의 정수인지 검증하세요.
      starterCode: |-
        import pyautogui

        screen = pyautogui.___()
        width, height = screen.width, screen.height

        assert isinstance(width, int) and width > 0
        assert isinstance(height, int) and height > 0
        (width, height)
      solution: |-
        import pyautogui

        screen = pyautogui.size()
        width, height = screen.width, screen.height

        assert isinstance(width, int) and width > 0
        assert isinstance(height, int) and height > 0
        (width, height)
      hints:
        - 함수 이름은 size다.
        - 결과는 namedtuple이라 .width와 .height로 접근한다.
      check:
        noError: pyautogui.size() 호출이 실 환경에서 끝나야 한다.
        resultCheck: width와 height가 모두 양의 정수여야 한다.
    check:
      noError: pyautogui.size() 호출이 끝나야 한다.
      resultCheck: width와 height가 양의 정수여야 한다.
  - id: read-position
    title: 마우스 위치 읽기
    structuredPrimary: true
    subtitle: pyautogui.position()
    goal: pyautogui.position()으로 현재 마우스 좌표를 읽고 x, y 두 정수로 분리한다.
    why: 자동화는 마우스를 움직이기 전에 현재 위치를 기록해 둬야 작업 후 원위치 복귀 같은 안전 패턴을 만들 수 있다.
    explanation: pyautogui.position()은 Point namedtuple을 돌려주며 x와 y 필드를 가진다. 같은 호출을 두 번 해도 마우스가 움직이지 않았다면 같은 값이 돌아온다. 좌표는 모니터 좌상단을 (0, 0)으로 한다.
    tips:
      - 자동화 시작 직후 position()을 읽어 변수에 보관하면 작업 후 복귀가 쉽다.
      - 좌표는 정수형이라 dict, JSON 직렬화가 안전하다.
    snippet: |-
      import pyautogui

      cursor = pyautogui.position()
      x, y = cursor.x, cursor.y

      assert isinstance(x, int)
      assert isinstance(y, int)
      (x, y)
    exercise:
      prompt: pyautogui.position()으로 현재 마우스 좌표를 받고 두 값이 정수형인지 검증하세요.
      starterCode: |-
        import pyautogui

        cursor = pyautogui.___()
        x, y = cursor.x, cursor.y

        assert isinstance(x, int)
        assert isinstance(y, int)
        (x, y)
      solution: |-
        import pyautogui

        cursor = pyautogui.position()
        x, y = cursor.x, cursor.y

        assert isinstance(x, int)
        assert isinstance(y, int)
        (x, y)
      hints:
        - 함수 이름은 position이다.
        - namedtuple의 필드 이름은 x, y다.
      check:
        noError: pyautogui.position() 호출이 끝나야 한다.
        resultCheck: x와 y가 정수형이어야 한다.
    check:
      noError: pyautogui.position() 호출이 끝나야 한다.
      resultCheck: x와 y가 정수형이어야 한다.
  - id: on-screen
    title: 좌표가 화면 안인지 검사
    structuredPrimary: true
    subtitle: pyautogui.onScreen()
    goal: pyautogui.onScreen(x, y)로 임의 좌표가 모니터 경계 안에 있는지 boolean으로 확인한다.
    why: 자동화 좌표가 화면을 벗어나면 클릭 명령이 무시되거나 FAILSAFE 모서리를 잘못 건드릴 수 있어 사전 검사가 필요하다.
    explanation: pyautogui.onScreen(x, y)는 좌표가 화면 경계 안이면 True, 밖이면 False를 돌려준다. 좌상단 (0, 0)은 항상 True다. 음수 좌표나 해상도 초과 좌표는 False다.
    tips:
      - onScreen은 두 인자를 받는 형태와 (x, y) tuple 한 인자를 받는 형태가 모두 지원된다.
      - 화면 밖 좌표는 클릭하기 전에 onScreen으로 거른다.
    snippet: |-
      import pyautogui

      inside = pyautogui.onScreen(0, 0)
      outside = pyautogui.onScreen(-1, -1)

      assert inside is True
      assert outside is False
      (inside, outside)
    exercise:
      prompt: 좌표 (10, 10)이 화면 안인지, (-50, -50)이 화면 밖인지 onScreen으로 각각 확인하세요.
      starterCode: |-
        import pyautogui

        inside = pyautogui.onScreen(10, 10)
        outside = pyautogui.___(-50, -50)

        assert inside is True
        assert outside is False
        (inside, outside)
      solution: |-
        import pyautogui

        inside = pyautogui.onScreen(10, 10)
        outside = pyautogui.onScreen(-50, -50)

        assert inside is True
        assert outside is False
        (inside, outside)
      hints:
        - 함수 이름은 onScreen다.
        - 음수 좌표는 화면 밖으로 판정된다.
      check:
        noError: onScreen 두 호출이 끝나야 한다.
        resultCheck: inside가 True, outside가 False여야 한다.
    check:
      noError: onScreen 두 호출이 끝나야 한다.
      resultCheck: inside가 True, outside가 False여야 한다.
  - id: snapshot
    title: 종합 데스크톱 스냅숏
    structuredPrimary: true
    subtitle: 한 dict로 묶기
    goal: 화면 해상도와 현재 마우스 좌표를 한 함수에서 dict로 묶어 자동화 시작 보고를 만든다.
    why: 종합 스냅숏은 자동화 사고가 났을 때 시작 시점의 환경을 추적하는 첫 번째 단서가 된다.
    explanation: desktopSnapshot 함수는 pyautogui.size()와 position()을 호출해 screen, cursor 두 키를 가진 dict를 돌려준다. cursorOnScreen 키는 현재 마우스가 화면 안인지 boolean으로 함께 담는다. pyautogui.size()는 주 모니터 해상도만 돌려주므로, 다중 모니터에서 커서가 보조 모니터에 있으면 cursorOnScreen이 False가 된다. 그래서 스냅숏은 True/False를 단정하지 않고 boolean 타입만 검증한다 - 어느 모니터에서 실행해도 의미가 유지된다. 결과는 그대로 JSON 직렬화에 안전한 정수형 구조다.
    tips:
      - 시작 스냅숏은 자동화 로그의 첫 줄로 기록해 두면 사고 분석이 빨라진다.
      - 같은 함수를 두 번 호출하면 두 번째 cursor 값으로 마우스 이동량을 추적할 수 있다.
    snippet: |-
      import pyautogui


      def desktopSnapshot() -> dict:
          screen = pyautogui.size()
          cursor = pyautogui.position()
          return {
              "screen": {"width": screen.width, "height": screen.height},
              "cursor": {"x": cursor.x, "y": cursor.y},
              "cursorOnScreen": pyautogui.onScreen(cursor.x, cursor.y),
          }


      snapshot = desktopSnapshot()

      assert snapshot["screen"]["width"] > 0
      assert isinstance(snapshot["cursorOnScreen"], bool)
      snapshot
    exercise:
      prompt: desktopSnapshot를 호출해 결과에 screen, cursor, cursorOnScreen 세 키가 정확히 있고 cursorOnScreen이 boolean인지 종합 검증하세요.
      starterCode: |-
        import pyautogui


        def desktopSnapshot() -> dict:
            screen = pyautogui.size()
            cursor = pyautogui.position()
            return {
                "screen": {"width": screen.width, "height": screen.height},
                "cursor": {"x": cursor.x, "y": cursor.y},
                "cursorOnScreen": pyautogui.___(cursor.x, cursor.y),
            }


        snapshot = desktopSnapshot()

        assert set(snapshot.keys()) == {"screen", "cursor", "cursorOnScreen"}
        assert isinstance(snapshot["cursorOnScreen"], bool)
        snapshot
      solution: |-
        import pyautogui


        def desktopSnapshot() -> dict:
            screen = pyautogui.size()
            cursor = pyautogui.position()
            return {
                "screen": {"width": screen.width, "height": screen.height},
                "cursor": {"x": cursor.x, "y": cursor.y},
                "cursorOnScreen": pyautogui.onScreen(cursor.x, cursor.y),
            }


        snapshot = desktopSnapshot()

        assert set(snapshot.keys()) == {"screen", "cursor", "cursorOnScreen"}
        assert isinstance(snapshot["cursorOnScreen"], bool)
        snapshot
      hints:
        - 화면 경계 검사 함수 이름은 onScreen이다.
        - size()는 주 모니터만 보므로 보조 모니터의 커서는 cursorOnScreen이 False다 - 값이 아니라 bool 타입을 검증한다.
      check:
        noError: desktopSnapshot 호출이 종합 결과를 돌려줘야 한다.
        resultCheck: snapshot에 screen, cursor, cursorOnScreen 세 키가 정확히 있고 cursorOnScreen이 boolean이어야 한다.
    check:
      noError: 종합 스냅숏 함수 호출이 끝나야 한다.
      resultCheck: snapshot이 screen, cursor, cursorOnScreen 세 키를 담아야 한다.
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
  - id: inputCtl_02-screen-coordinate-normalization-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - read-size
    - snapshot
    title: 화면 좌표를 viewport 비율로 정규화하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: screen 경계 안의 point만 0~1 비율과 edge 거리를 반환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 현재 screen 크기 없이 저장한 절대 좌표를 재사용하지 마세요.
    - 가장 가까운 화면 edge 거리도 safety evidence로 남기세요.
    exercise:
      prompt: normalize_screen_point(x, y, width, height)를 완성하세요.
      starterCode: |-
        def normalize_screen_point(x, y, width, height):
            raise NotImplementedError
      solution: |
        def normalize_screen_point(x, y, width, height):
            if width <= 0 or height <= 0 or not 0 <= x < width or not 0 <= y < height:
                raise ValueError("point outside screen")
            return {
                "xRatio": round(x / width, 4),
                "yRatio": round(y / height, 4),
                "edgeDistance": min(x, y, width - 1 - x, height - 1 - y),
            }
      hints: *id001
    check:
      id: python.inputctl.inputCtl_02.screen-coordinate-normalization.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.inputctl.inputCtl_02.screen-coordinate-normalization.mastery.behavior.v1.fixture
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
        entry: normalize_screen_point
        cases:
        - id: normalizes-center
          arguments:
          - value: 500
          - value: 250
          - value: 1000
          - value: 500
          expectedReturn:
            xRatio: 0.5
            yRatio: 0.5
            edgeDistance: 249
        - id: normalizes-top-left
          arguments:
          - value: 0
          - value: 0
          - value: 100
          - value: 100
          expectedReturn:
            xRatio: 0.0
            yRatio: 0.0
            edgeDistance: 0
        - id: rejects-right-edge-outside
          arguments:
          - value: 100
          - value: 0
          - value: 100
          - value: 100
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: inputCtl_02-monitor-point-resolution-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - inputCtl_02-screen-coordinate-normalization-mastery
    title: 새 다중 모니터 배치에 point 소속 판정 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 음수 origin을 포함한 monitor rectangle에서 정확히 하나의 화면을 찾는다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 다중 모니터에서는 가상 desktop origin이 음수일 수 있습니다.
    - point가 정확히 한 monitor에 속하지 않으면 입력 action을 만들지 마세요.
    exercise:
      prompt: resolve_monitor_for_point(point, monitors)를 완성하세요.
      starterCode: |-
        def resolve_monitor_for_point(point, monitors):
            raise NotImplementedError
      solution: |
        def resolve_monitor_for_point(point, monitors):
            matches = []
            for monitor in monitors:
                if monitor["x"] <= point[0] < monitor["x"] + monitor["width"] and monitor["y"] <= point[1] < monitor["y"] + monitor["height"]:
                    matches.append(monitor["id"])
            if len(matches) != 1:
                return {"resolved": False, "monitor": None, "matches": sorted(matches)}
            return {"resolved": True, "monitor": matches[0], "matches": matches}
      hints: *id002
    check:
      id: python.inputctl.inputCtl_02.monitor-point-resolution.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.inputctl.inputCtl_02.monitor-point-resolution.transfer.behavior.v1.fixture
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
        entry: resolve_monitor_for_point
        cases:
        - id: resolves-negative-origin-monitor
          arguments:
          - value:
            - -100
            - 20
          - value:
            - id: left
              x: -1920
              y: 0
              width: 1920
              height: 1080
            - id: main
              x: 0
              y: 0
              width: 1920
              height: 1080
          expectedReturn:
            resolved: true
            monitor: left
            matches:
            - left
        - id: resolves-main-monitor
          arguments:
          - value:
            - 0
            - 0
          - value:
            - id: left
              x: -100
              y: 0
              width: 100
              height: 100
            - id: main
              x: 0
              y: 0
              width: 100
              height: 100
          expectedReturn:
            resolved: true
            monitor: main
            matches:
            - main
        - id: reports-outside-point
          arguments:
          - value:
            - 500
            - 500
          - value:
            - id: main
              x: 0
              y: 0
              width: 100
              height: 100
          expectedReturn:
            resolved: false
            monitor: null
            matches: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: inputCtl_02-screen-coordinate-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - inputCtl_02-monitor-point-resolution-transfer
    title: 화면 크기와 좌표 계약 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: viewport 비율·monitor origin·edge safety 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 입력 자동화 action 전에 대상·경계·중단 방법을 검증하세요.
    - 화면 변화와 E-Stop evidence를 남기고 성공을 클릭 발생으로 판단하지 마세요.
    exercise:
      prompt: choose_coordinate_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_coordinate_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_coordinate_evidence(situation):
            table = {'single-screen': {'action': 'validate bounds and normalize', 'evidence': 'screen dimensions and ratios', 'risk': 'resolution drift'}, 'multi-monitor': {'action': 'resolve virtual desktop rectangle', 'evidence': 'monitor identity and origin', 'risk': 'negative coordinate'}, 'edge': {'action': 'enforce safety margin', 'evidence': 'edge distance', 'risk': 'fail-safe corner'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.inputctl.inputCtl_02.screen-coordinate-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.inputctl.inputCtl_02.screen-coordinate-recall.retrieval.behavior.v1.fixture
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
        entry: choose_coordinate_evidence
        cases:
        - id: recalls-single-screen
          arguments:
          - value: single-screen
          expectedReturn:
            action: validate bounds and normalize
            evidence: screen dimensions and ratios
            risk: resolution drift
        - id: recalls-multi-monitor
          arguments:
          - value: multi-monitor
          expectedReturn:
            action: resolve virtual desktop rectangle
            evidence: monitor identity and origin
            risk: negative coordinate
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};