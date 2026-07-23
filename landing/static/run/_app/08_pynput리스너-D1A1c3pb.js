var e=`meta:
  id: inputCtl_08
  title: pynput 키보드 리스너
  order: 8
  category: inputCtl
  difficulty: medium
  audience: GUI 자동화에 입문하는 Python 학습자
  packages:
    - pynput
  tags:
    - pynput
    - listener
    - automation
intro:
  direction: pynput.keyboard의 Key 상수와 KeyCode, Listener 클래스를 직접 다뤄 키 이벤트 수집과 정지 키 분기를 실 코드로 구현한다.
  benefits:
    - pynput.keyboard.Key 상수로 특수 키를 표현한다.
    - KeyCode.from_char로 일반 글자 키를 표현한다.
    - on_press 콜백을 정의해 키 이벤트를 리스트에 누적한다.
    - 종합 리스너 빌더가 정지 키와 콜백을 묶어 안전한 시퀀스를 만든다.
  diagram:
    steps:
      - label: Key 상수 사용
        detail: Key.enter, Key.esc 같은 특수 키 상수는 pynput.keyboard.Key 열거형에서 얻는다.
      - label: KeyCode 생성
        detail: KeyCode.from_char('a')로 일반 문자 키 객체를 만든다.
      - label: on_press 콜백
        detail: 콜백 함수가 매 이벤트마다 키 정보를 외부 리스트에 누적한다.
      - label: 종합 리스너 빌더
        detail: 정지 키와 콜백을 받아 Listener 객체를 만들어 자동화 표준 형태로 돌려준다.
    runtime:
      - label: pynput 패키지 필요
        detail: meta.packages의 pynput이 로컬 가상환경에 준비돼야 한다.
      - label: 콜백 직접 호출
        detail: snippet은 시스템 키보드 이벤트 대신 콜백을 직접 호출해 학습 결정성을 유지한다.
sections:
  - id: key-constants
    title: 특수 키 상수
    structuredPrimary: true
    subtitle: pynput.keyboard.Key
    goal: pynput.keyboard.Key 열거형에서 enter, esc, tab 상수를 확인한다.
    why: 자동화 리스너는 특수 키를 enum 상수로 표현해야 다른 키와 안전하게 비교할 수 있다.
    explanation: pynput.keyboard.Key는 열거형이며 enter, esc, tab, shift 같은 특수 키를 상수로 제공한다. 같은 상수는 콜백 안에서 == 연산으로 비교할 수 있고 .name 속성으로 문자열 이름을 얻을 수 있다.
    tips:
      - Key 상수는 모듈 간에 동일성을 유지해 비교가 안전하다.
      - Key.esc는 자동화 리스너의 표준 정지 키로 흔히 쓰인다.
    snippet: |-
      from pynput.keyboard import Key

      enter = Key.enter
      esc = Key.esc

      assert enter.name == "enter"
      assert esc is Key.esc
      (enter.name, esc.name)
    exercise:
      prompt: pynput.keyboard.Key에서 tab과 shift 상수를 얻어 .name 속성이 'tab'과 'shift'인지 검증하세요.
      starterCode: |-
        from pynput.keyboard import Key

        tab = Key.tab
        shift = Key.___

        assert tab.name == "tab"
        assert shift.name == "shift"
        (tab.name, shift.name)
      solution: |-
        from pynput.keyboard import Key

        tab = Key.tab
        shift = Key.shift

        assert tab.name == "tab"
        assert shift.name == "shift"
        (tab.name, shift.name)
      hints:
        - 상수 이름은 소문자 shift다.
        - 열거형 상수는 .name으로 문자열 이름을 얻는다.
      check:
        noError: Key 상수 접근이 끝나야 한다.
        resultCheck: tab.name과 shift.name이 본문 기대값이어야 한다.
    check:
      noError: Key 상수 접근이 끝나야 한다.
      resultCheck: enter.name이 'enter'이고 esc가 Key.esc여야 한다.
  - id: key-code
    title: 일반 문자 키
    structuredPrimary: true
    subtitle: KeyCode.from_char()
    goal: KeyCode.from_char('a')로 일반 문자 키 객체를 만들고 char 속성을 확인한다.
    why: 일반 글자 키는 enum이 아닌 KeyCode 객체라 별도 생성 방식과 비교 패턴을 알아 둬야 한다.
    explanation: pynput.keyboard.KeyCode는 문자 키 한 개를 표현하며 from_char(letter) 클래스 메서드로 만든다. .char 속성으로 원래 문자를 얻을 수 있고 같은 문자에서 만든 두 객체는 == 비교가 True다.
    tips:
      - 일반 영문 글자는 KeyCode, 특수 키는 Key 상수로 표기한다.
      - 콜백 안에서는 isinstance로 두 타입을 구분한다.
    snippet: |-
      from pynput.keyboard import KeyCode

      a = KeyCode.from_char("a")
      bAgain = KeyCode.from_char("b")

      assert a.char == "a"
      assert a == KeyCode.from_char("a")
      assert a != bAgain
      (a.char, bAgain.char)
    exercise:
      prompt: KeyCode.from_char로 'x'와 'y' 객체를 만들고 .char 속성이 각각 'x'와 'y'인지 검증하세요.
      starterCode: |-
        from pynput.keyboard import KeyCode

        x = KeyCode.___("x")
        y = KeyCode.from_char("y")

        assert x.char == "x"
        assert y.char == "y"
        (x.char, y.char)
      solution: |-
        from pynput.keyboard import KeyCode

        x = KeyCode.from_char("x")
        y = KeyCode.from_char("y")

        assert x.char == "x"
        assert y.char == "y"
        (x.char, y.char)
      hints:
        - 생성 메서드 이름은 from_char다.
        - char 속성은 원래 문자를 그대로 돌려준다.
      check:
        noError: KeyCode.from_char 호출이 끝나야 한다.
        resultCheck: x.char가 'x', y.char가 'y'여야 한다.
    check:
      noError: KeyCode.from_char 두 호출이 끝나야 한다.
      resultCheck: a.char가 'a'이고 a와 b가 다른 객체여야 한다.
  - id: press-callback
    title: on_press 콜백
    structuredPrimary: true
    subtitle: 키 이벤트 누적
    goal: 키 이벤트를 받아 외부 리스트에 누적하는 on_press 콜백을 정의하고 직접 호출해 동작을 검증한다.
    why: 리스너의 핵심은 콜백 함수의 신뢰성이므로 콜백 함수가 단독으로 정확히 동작하는지 먼저 검증한다.
    explanation: on_press 콜백은 키 객체(Key 또는 KeyCode) 한 개를 인자로 받는다. 자동화 학습에서는 시스템 이벤트 대신 콜백을 직접 호출해 결정성을 유지한다. 같은 콜백을 그대로 Listener에 넘기면 운영 환경에서도 동작한다.
    tips:
      - 콜백을 직접 호출해 단위 테스트하면 자동화 디버깅이 쉬워진다.
      - 누적 리스트는 클로저로 안전하게 보존된다.
    snippet: |-
      from pynput.keyboard import Key, KeyCode

      pressed: list[str] = []


      def onPress(key) -> None:
          if isinstance(key, Key):
              pressed.append(key.name)
          else:
              pressed.append(key.char)


      onPress(KeyCode.from_char("a"))
      onPress(Key.enter)
      onPress(KeyCode.from_char("b"))

      assert pressed == ["a", "enter", "b"]
      pressed
    exercise:
      prompt: 같은 콜백 패턴으로 'x', Key.tab, 'y' 세 이벤트를 직접 호출해 pressed 리스트가 ['x', 'tab', 'y']인지 검증하세요.
      starterCode: |-
        from pynput.keyboard import Key, KeyCode

        pressed: list[str] = []


        def onPress(key) -> None:
            if isinstance(key, Key):
                pressed.append(key.name)
            else:
                pressed.append(key.___)


        onPress(KeyCode.from_char("x"))
        onPress(Key.tab)
        onPress(KeyCode.from_char("y"))

        assert pressed == ["x", "tab", "y"]
        pressed
      solution: |-
        from pynput.keyboard import Key, KeyCode

        pressed: list[str] = []


        def onPress(key) -> None:
            if isinstance(key, Key):
                pressed.append(key.name)
            else:
                pressed.append(key.char)


        onPress(KeyCode.from_char("x"))
        onPress(Key.tab)
        onPress(KeyCode.from_char("y"))

        assert pressed == ["x", "tab", "y"]
        pressed
      hints:
        - KeyCode 속성 이름은 char다.
        - Key 상수는 .name 속성으로 이름을 얻는다.
      check:
        noError: onPress 세 호출이 끝나야 한다.
        resultCheck: pressed 리스트가 ['x', 'tab', 'y']여야 한다.
    check:
      noError: onPress 세 호출이 끝나야 한다.
      resultCheck: pressed가 ['a', 'enter', 'b']여야 한다.
  - id: listener-builder
    title: 종합 리스너 빌더
    structuredPrimary: true
    subtitle: Listener 인스턴스
    goal: 정지 키와 콜백을 받아 Listener 인스턴스를 만들고 사이즈 검증과 정지 분기를 함수로 묶는다.
    why: 종합 빌더는 자동화 코드가 일관된 형태로 Listener를 만들고 정지 키 분기를 결정성 있게 검증하게 한다.
    explanation: buildKeyboardListener 함수는 정지 키와 외부 누적 리스트를 받아 on_press 콜백과 Listener 인스턴스를 만들어 dict로 돌려준다. 콜백을 직접 호출하면 정지 키 도달 시 False를 돌려주고 그 외에는 None을 돌려준다. 같은 인스턴스를 .start()로 백그라운드 스레드에서 동작시키면 운영 자동화가 시작된다.
    tips:
      - 콜백이 False를 돌려주면 Listener는 즉시 정지된다.
      - 빌더는 인스턴스를 만들기만 하므로 실제 시작은 호출자가 책임진다.
    snippet: |-
      from pynput.keyboard import Key, KeyCode, Listener


      def buildKeyboardListener(stopKey, pressed: list) -> dict:
          def onPress(key):
              if key == stopKey:
                  return False
              if isinstance(key, Key):
                  pressed.append(key.name)
              else:
                  pressed.append(key.char)
              return None

          return {"listener": Listener(on_press=onPress), "callback": onPress}


      pressed: list[str] = []
      bundle = buildKeyboardListener(Key.esc, pressed)
      kept = bundle["callback"](KeyCode.from_char("a"))
      stopped = bundle["callback"](Key.esc)

      assert isinstance(bundle["listener"], Listener)
      assert kept is None
      assert stopped is False
      assert pressed == ["a"]
      (kept, stopped, pressed)
    exercise:
      prompt: buildKeyboardListener에 Key.tab을 정지 키로 넘기고 'x'와 Key.tab을 차례로 호출하면 pressed가 ['x']이고 두 번째 호출이 False를 돌려주는지 종합 검증하세요.
      starterCode: |-
        from pynput.keyboard import Key, KeyCode, Listener


        def buildKeyboardListener(stopKey, pressed: list) -> dict:
            def onPress(key):
                if key == stopKey:
                    return False
                if isinstance(key, Key):
                    pressed.append(key.name)
                else:
                    pressed.append(key.char)
                return None

            return {"listener": Listener(on_press=onPress), "callback": onPress}


        pressed: list[str] = []
        bundle = buildKeyboardListener(Key.tab, pressed)
        kept = bundle["callback"](KeyCode.from_char("x"))
        stopped = bundle["callback"](Key.___)

        assert kept is None
        assert stopped is False
        assert pressed == ["x"]
        (kept, stopped, pressed)
      solution: |-
        from pynput.keyboard import Key, KeyCode, Listener


        def buildKeyboardListener(stopKey, pressed: list) -> dict:
            def onPress(key):
                if key == stopKey:
                    return False
                if isinstance(key, Key):
                    pressed.append(key.name)
                else:
                    pressed.append(key.char)
                return None

            return {"listener": Listener(on_press=onPress), "callback": onPress}


        pressed: list[str] = []
        bundle = buildKeyboardListener(Key.tab, pressed)
        kept = bundle["callback"](KeyCode.from_char("x"))
        stopped = bundle["callback"](Key.tab)

        assert kept is None
        assert stopped is False
        assert pressed == ["x"]
        (kept, stopped, pressed)
      hints:
        - 정지 키는 Key.tab이다.
        - 정지 키 도달 시 콜백이 False를 돌려준다.
      check:
        noError: buildKeyboardListener 호출이 종합 결과를 돌려줘야 한다.
        resultCheck: pressed가 ['x']이고 두 번째 호출이 False여야 한다.
    check:
      noError: buildKeyboardListener 호출과 콜백 두 호출이 끝나야 한다.
      resultCheck: pressed가 ['a']이고 두 번째 호출이 False여야 한다.
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
  - id: inputCtl_08-listener-scope-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - key-constants
    - listener-builder
    title: 키보드·마우스 listener의 수집 범위와 종료 조건 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 허용 event·대상 앱·최대 시간·stop chord가 없는 listener를 차단한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 전역 listener를 무기한 실행하지 말고 앱·event·시간을 제한하세요.
    - typed text는 저장하지 않고 event count와 timestamp만 보존하세요.
    exercise:
      prompt: audit_listener_scope(scope)를 완성하세요.
      starterCode: |-
        def audit_listener_scope(scope):
            raise NotImplementedError
      solution: |
        def audit_listener_scope(scope):
            failures = []
            if not scope.get("eventKinds"):
                failures.append("events")
            if not scope.get("targetApps"):
                failures.append("apps")
            if scope.get("maximumSeconds", 0) <= 0:
                failures.append("duration")
            if not scope.get("stopChord"):
                failures.append("stop-chord")
            if scope.get("recordText", False):
                failures.append("text-capture")
            return {"ready": not failures, "failures": failures, "retention": "counts-and-timestamps-only"}
      hints: *id001
    check:
      id: python.inputctl.inputCtl_08.listener-scope-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.inputctl.inputCtl_08.listener-scope-audit.mastery.behavior.v1.fixture
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
        entry: audit_listener_scope
        cases:
        - id: accepts-bounded-listener
          arguments:
          - value:
              eventKinds:
              - click
              targetApps:
              - Editor
              maximumSeconds: 30
              stopChord: ctrl+shift+s
              recordText: false
          expectedReturn:
            ready: true
            failures: []
            retention: counts-and-timestamps-only
        - id: reports-unbounded-text-capture
          arguments:
          - value:
              eventKinds: []
              targetApps: []
              maximumSeconds: 0
              stopChord: ''
              recordText: true
          expectedReturn:
            ready: false
            failures:
            - events
            - apps
            - duration
            - stop-chord
            - text-capture
            retention: counts-and-timestamps-only
        - id: rejects-key-text-recording
          arguments:
          - value:
              eventKinds:
              - key
              targetApps:
              - Editor
              maximumSeconds: 5
              stopChord: esc
              recordText: true
          expectedReturn:
            ready: false
            failures:
            - text-capture
            retention: counts-and-timestamps-only
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: inputCtl_08-listener-event-summary-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - inputCtl_08-listener-scope-audit-mastery
    title: 새 listener event에 앱 이탈·stop 이후 수집 감사 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: stop 시점과 허용 앱을 기준으로 보존 가능한 event만 집계한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - stop event 이후 도착한 callback을 보존하지 마세요.
    - 허용 앱 밖 event는 원문 없이 ID와 거부 사유만 남기세요.
    exercise:
      prompt: summarize_listener_events(events, allowed_apps, stop_at)를 완성하세요.
      starterCode: |-
        def summarize_listener_events(events, allowed_apps, stop_at):
            raise NotImplementedError
      solution: |
        def summarize_listener_events(events, allowed_apps, stop_at):
            accepted = []
            rejected = []
            for event in events:
                if event["at"] > stop_at:
                    rejected.append({"id": event["id"], "reason": "after-stop"})
                elif event["app"] not in allowed_apps:
                    rejected.append({"id": event["id"], "reason": "app"})
                else:
                    accepted.append(event)
            counts = {}
            for event in accepted:
                counts[event["kind"]] = counts.get(event["kind"], 0) + 1
            return {"counts": counts, "acceptedIds": [event["id"] for event in accepted], "rejected": rejected}
      hints: *id002
    check:
      id: python.inputctl.inputCtl_08.listener-event-summary.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.inputctl.inputCtl_08.listener-event-summary.transfer.behavior.v1.fixture
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
        entry: summarize_listener_events
        cases:
        - id: counts-allowed-events
          arguments:
          - value:
            - id: a
              at: 1
              app: Editor
              kind: click
            - id: b
              at: 2
              app: Editor
              kind: key
          - value:
            - Editor
          - value: 5
          expectedReturn:
            counts:
              click: 1
              key: 1
            acceptedIds:
            - a
            - b
            rejected: []
        - id: rejects-app-and-after-stop
          arguments:
          - value:
            - id: a
              at: 1
              app: Mail
              kind: click
            - id: b
              at: 10
              app: Editor
              kind: key
          - value:
            - Editor
          - value: 5
          expectedReturn:
            counts: {}
            acceptedIds: []
            rejected:
            - id: a
              reason: app
            - id: b
              reason: after-stop
        - id: includes-event-at-stop
          arguments:
          - value:
            - id: a
              at: 5
              app: Editor
              kind: click
          - value:
            - Editor
          - value: 5
          expectedReturn:
            counts:
              click: 1
            acceptedIds:
            - a
            rejected: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: inputCtl_08-listener-privacy-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - inputCtl_08-listener-event-summary-transfer
    title: 입력 listener 개인정보 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 범위·중단·최소 보존 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 입력 자동화 action 전에 대상·경계·중단 방법을 검증하세요.
    - 화면 변화와 E-Stop evidence를 남기고 성공을 클릭 발생으로 판단하지 마세요.
    exercise:
      prompt: choose_listener_policy(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_listener_policy(situation):
            raise NotImplementedError
      solution: |
        def choose_listener_policy(situation):
            table = {'scope': {'action': 'limit event apps and duration', 'evidence': 'listener contract', 'risk': 'global surveillance'}, 'stop': {'action': 'register visible stop chord', 'evidence': 'stop timestamp', 'risk': 'unbounded capture'}, 'retain': {'action': 'store counts not text', 'evidence': 'aggregated event summary', 'risk': 'keystroke leakage'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.inputctl.inputCtl_08.listener-privacy-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.inputctl.inputCtl_08.listener-privacy-recall.retrieval.behavior.v1.fixture
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
        entry: choose_listener_policy
        cases:
        - id: recalls-scope
          arguments:
          - value: scope
          expectedReturn:
            action: limit event apps and duration
            evidence: listener contract
            risk: global surveillance
        - id: recalls-stop
          arguments:
          - value: stop
          expectedReturn:
            action: register visible stop chord
            evidence: stop timestamp
            risk: unbounded capture
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};