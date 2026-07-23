var e=`meta:\r
  id: inputCtl_02\r
  title: 화면 크기와 좌표 읽기\r
  order: 2\r
  category: inputCtl\r
  difficulty: easy\r
  audience: GUI 자동화에 입문하는 Python 학습자\r
  packages:\r
    - pyautogui\r
  tags:\r
    - pyautogui\r
    - coordinates\r
    - automation\r
intro:\r
  direction: pyautogui로 모니터 해상도와 현재 마우스 위치를 실제 호출로 읽고, 좌표가 화면 안에 있는지 검사해 자동화의 좌표 감각을 만든다.\r
  benefits:\r
    - pyautogui.size()로 실제 모니터 해상도를 읽는다.\r
    - pyautogui.position()으로 현재 마우스 좌표를 읽는다.\r
    - pyautogui.onScreen()으로 좌표가 화면 안인지 직접 검사한다.\r
    - 종합 함수로 자동화 시작 시점의 데스크톱 스냅숏을 만든다.\r
  diagram:\r
    steps:\r
      - label: 화면 해상도 읽기\r
        detail: pyautogui.size()는 width와 height 필드를 가진 namedtuple을 돌려준다.\r
      - label: 마우스 위치 읽기\r
        detail: pyautogui.position()은 현재 커서 좌표 (x, y) namedtuple을 돌려준다.\r
      - label: 영역 안인지 검사\r
        detail: pyautogui.onScreen(x, y)는 좌표가 화면 경계 안에 있을 때 True를 돌려준다.\r
      - label: 종합 스냅숏\r
        detail: 해상도, 마우스 위치, onScreen 결과를 한 dict로 묶어 자동화 시작 상태를 보고한다.\r
    runtime:\r
      - label: pyautogui 패키지 필요\r
        detail: meta.packages의 pyautogui가 로컬 가상환경에 설치돼 있어야 한다.\r
      - label: GUI 세션 필요\r
        detail: 실제 화면이 연결돼야 size()와 position()이 의미 있는 값을 돌려준다.\r
sections:\r
  - id: read-size\r
    title: 화면 해상도 읽기\r
    structuredPrimary: true\r
    subtitle: pyautogui.size()\r
    goal: pyautogui.size()를 호출해 모니터 해상도의 width와 height를 분리해 받는다.\r
    why: 자동화 좌표는 모니터 해상도에 따라 달라지므로 시작 시점에 실제 해상도를 확인해야 안전한 좌표 계산이 가능하다.\r
    explanation: pyautogui.size()는 collections.namedtuple Size를 돌려주며 width와 height 필드를 모두 가진다. 두 값은 항상 양의 정수다. 다중 모니터 환경에서는 주 모니터 해상도가 기준이 된다.\r
    tips:\r
      - Size 객체는 .width, .height 또는 인덱스 [0], [1]로 접근할 수 있다.\r
      - 해상도는 자동화 시작 시 한 번만 읽어 두면 충분하다.\r
    snippet: |-\r
      import pyautogui\r
\r
      screen = pyautogui.size()\r
      width, height = screen.width, screen.height\r
\r
      assert isinstance(width, int) and width > 0\r
      assert isinstance(height, int) and height > 0\r
      (width, height)\r
    exercise:\r
      prompt: pyautogui.size()를 호출해 width와 height를 분리한 뒤 두 값이 모두 양의 정수인지 검증하세요.\r
      starterCode: |-\r
        import pyautogui\r
\r
        screen = pyautogui.___()\r
        width, height = screen.width, screen.height\r
\r
        assert isinstance(width, int) and width > 0\r
        assert isinstance(height, int) and height > 0\r
        (width, height)\r
      solution: |-\r
        import pyautogui\r
\r
        screen = pyautogui.size()\r
        width, height = screen.width, screen.height\r
\r
        assert isinstance(width, int) and width > 0\r
        assert isinstance(height, int) and height > 0\r
        (width, height)\r
      hints:\r
        - 함수 이름은 size다.\r
        - 결과는 namedtuple이라 .width와 .height로 접근한다.\r
      check:\r
        noError: pyautogui.size() 호출이 실 환경에서 끝나야 한다.\r
        resultCheck: width와 height가 모두 양의 정수여야 한다.\r
    check:\r
      noError: pyautogui.size() 호출이 끝나야 한다.\r
      resultCheck: width와 height가 양의 정수여야 한다.\r
  - id: read-position\r
    title: 마우스 위치 읽기\r
    structuredPrimary: true\r
    subtitle: pyautogui.position()\r
    goal: pyautogui.position()으로 현재 마우스 좌표를 읽고 x, y 두 정수로 분리한다.\r
    why: 자동화는 마우스를 움직이기 전에 현재 위치를 기록해 둬야 작업 후 원위치 복귀 같은 안전 패턴을 만들 수 있다.\r
    explanation: pyautogui.position()은 Point namedtuple을 돌려주며 x와 y 필드를 가진다. 같은 호출을 두 번 해도 마우스가 움직이지 않았다면 같은 값이 돌아온다. 좌표는 모니터 좌상단을 (0, 0)으로 한다.\r
    tips:\r
      - 자동화 시작 직후 position()을 읽어 변수에 보관하면 작업 후 복귀가 쉽다.\r
      - 좌표는 정수형이라 dict, JSON 직렬화가 안전하다.\r
    snippet: |-\r
      import pyautogui\r
\r
      cursor = pyautogui.position()\r
      x, y = cursor.x, cursor.y\r
\r
      assert isinstance(x, int)\r
      assert isinstance(y, int)\r
      (x, y)\r
    exercise:\r
      prompt: pyautogui.position()으로 현재 마우스 좌표를 받고 두 값이 정수형인지 검증하세요.\r
      starterCode: |-\r
        import pyautogui\r
\r
        cursor = pyautogui.___()\r
        x, y = cursor.x, cursor.y\r
\r
        assert isinstance(x, int)\r
        assert isinstance(y, int)\r
        (x, y)\r
      solution: |-\r
        import pyautogui\r
\r
        cursor = pyautogui.position()\r
        x, y = cursor.x, cursor.y\r
\r
        assert isinstance(x, int)\r
        assert isinstance(y, int)\r
        (x, y)\r
      hints:\r
        - 함수 이름은 position이다.\r
        - namedtuple의 필드 이름은 x, y다.\r
      check:\r
        noError: pyautogui.position() 호출이 끝나야 한다.\r
        resultCheck: x와 y가 정수형이어야 한다.\r
    check:\r
      noError: pyautogui.position() 호출이 끝나야 한다.\r
      resultCheck: x와 y가 정수형이어야 한다.\r
  - id: on-screen\r
    title: 좌표가 화면 안인지 검사\r
    structuredPrimary: true\r
    subtitle: pyautogui.onScreen()\r
    goal: pyautogui.onScreen(x, y)로 임의 좌표가 모니터 경계 안에 있는지 boolean으로 확인한다.\r
    why: 자동화 좌표가 화면을 벗어나면 클릭 명령이 무시되거나 FAILSAFE 모서리를 잘못 건드릴 수 있어 사전 검사가 필요하다.\r
    explanation: pyautogui.onScreen(x, y)는 좌표가 화면 경계 안이면 True, 밖이면 False를 돌려준다. 좌상단 (0, 0)은 항상 True다. 음수 좌표나 해상도 초과 좌표는 False다.\r
    tips:\r
      - onScreen은 두 인자를 받는 형태와 (x, y) tuple 한 인자를 받는 형태가 모두 지원된다.\r
      - 화면 밖 좌표는 클릭하기 전에 onScreen으로 거른다.\r
    snippet: |-\r
      import pyautogui\r
\r
      inside = pyautogui.onScreen(0, 0)\r
      outside = pyautogui.onScreen(-1, -1)\r
\r
      assert inside is True\r
      assert outside is False\r
      (inside, outside)\r
    exercise:\r
      prompt: 좌표 (10, 10)이 화면 안인지, (-50, -50)이 화면 밖인지 onScreen으로 각각 확인하세요.\r
      starterCode: |-\r
        import pyautogui\r
\r
        inside = pyautogui.onScreen(10, 10)\r
        outside = pyautogui.___(-50, -50)\r
\r
        assert inside is True\r
        assert outside is False\r
        (inside, outside)\r
      solution: |-\r
        import pyautogui\r
\r
        inside = pyautogui.onScreen(10, 10)\r
        outside = pyautogui.onScreen(-50, -50)\r
\r
        assert inside is True\r
        assert outside is False\r
        (inside, outside)\r
      hints:\r
        - 함수 이름은 onScreen다.\r
        - 음수 좌표는 화면 밖으로 판정된다.\r
      check:\r
        noError: onScreen 두 호출이 끝나야 한다.\r
        resultCheck: inside가 True, outside가 False여야 한다.\r
    check:\r
      noError: onScreen 두 호출이 끝나야 한다.\r
      resultCheck: inside가 True, outside가 False여야 한다.\r
  - id: snapshot\r
    title: 종합 데스크톱 스냅숏\r
    structuredPrimary: true\r
    subtitle: 한 dict로 묶기\r
    goal: 화면 해상도와 현재 마우스 좌표를 한 함수에서 dict로 묶어 자동화 시작 보고를 만든다.\r
    why: 종합 스냅숏은 자동화 사고가 났을 때 시작 시점의 환경을 추적하는 첫 번째 단서가 된다.\r
    explanation: desktopSnapshot 함수는 pyautogui.size()와 position()을 호출해 screen, cursor 두 키를 가진 dict를 돌려준다. cursorOnScreen 키는 현재 마우스가 화면 안인지 boolean으로 함께 담는다. pyautogui.size()는 주 모니터 해상도만 돌려주므로, 다중 모니터에서 커서가 보조 모니터에 있으면 cursorOnScreen이 False가 된다. 그래서 스냅숏은 True/False를 단정하지 않고 boolean 타입만 검증한다 - 어느 모니터에서 실행해도 의미가 유지된다. 결과는 그대로 JSON 직렬화에 안전한 정수형 구조다.\r
    tips:\r
      - 시작 스냅숏은 자동화 로그의 첫 줄로 기록해 두면 사고 분석이 빨라진다.\r
      - 같은 함수를 두 번 호출하면 두 번째 cursor 값으로 마우스 이동량을 추적할 수 있다.\r
    snippet: |-\r
      import pyautogui\r
\r
\r
      def desktopSnapshot() -> dict:\r
          screen = pyautogui.size()\r
          cursor = pyautogui.position()\r
          return {\r
              "screen": {"width": screen.width, "height": screen.height},\r
              "cursor": {"x": cursor.x, "y": cursor.y},\r
              "cursorOnScreen": pyautogui.onScreen(cursor.x, cursor.y),\r
          }\r
\r
\r
      snapshot = desktopSnapshot()\r
\r
      assert snapshot["screen"]["width"] > 0\r
      assert isinstance(snapshot["cursorOnScreen"], bool)\r
      snapshot\r
    exercise:\r
      prompt: desktopSnapshot를 호출해 결과에 screen, cursor, cursorOnScreen 세 키가 정확히 있고 cursorOnScreen이 boolean인지 종합 검증하세요.\r
      starterCode: |-\r
        import pyautogui\r
\r
\r
        def desktopSnapshot() -> dict:\r
            screen = pyautogui.size()\r
            cursor = pyautogui.position()\r
            return {\r
                "screen": {"width": screen.width, "height": screen.height},\r
                "cursor": {"x": cursor.x, "y": cursor.y},\r
                "cursorOnScreen": pyautogui.___(cursor.x, cursor.y),\r
            }\r
\r
\r
        snapshot = desktopSnapshot()\r
\r
        assert set(snapshot.keys()) == {"screen", "cursor", "cursorOnScreen"}\r
        assert isinstance(snapshot["cursorOnScreen"], bool)\r
        snapshot\r
      solution: |-\r
        import pyautogui\r
\r
\r
        def desktopSnapshot() -> dict:\r
            screen = pyautogui.size()\r
            cursor = pyautogui.position()\r
            return {\r
                "screen": {"width": screen.width, "height": screen.height},\r
                "cursor": {"x": cursor.x, "y": cursor.y},\r
                "cursorOnScreen": pyautogui.onScreen(cursor.x, cursor.y),\r
            }\r
\r
\r
        snapshot = desktopSnapshot()\r
\r
        assert set(snapshot.keys()) == {"screen", "cursor", "cursorOnScreen"}\r
        assert isinstance(snapshot["cursorOnScreen"], bool)\r
        snapshot\r
      hints:\r
        - 화면 경계 검사 함수 이름은 onScreen이다.\r
        - size()는 주 모니터만 보므로 보조 모니터의 커서는 cursorOnScreen이 False다 - 값이 아니라 bool 타입을 검증한다.\r
      check:\r
        noError: desktopSnapshot 호출이 종합 결과를 돌려줘야 한다.\r
        resultCheck: snapshot에 screen, cursor, cursorOnScreen 세 키가 정확히 있고 cursorOnScreen이 boolean이어야 한다.\r
    check:\r
      noError: 종합 스냅숏 함수 호출이 끝나야 한다.\r
      resultCheck: snapshot이 screen, cursor, cursorOnScreen 세 키를 담아야 한다.\r
`;export{e as default};