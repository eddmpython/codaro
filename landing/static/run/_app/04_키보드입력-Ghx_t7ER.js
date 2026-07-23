var e=`meta:
  id: inputCtl_04
  title: 키보드 입력 기초
  order: 4
  category: inputCtl
  difficulty: easy
  audience: GUI 자동화에 입문하는 Python 학습자
  packages:
    - pyautogui
  tags:
    - pyautogui
    - keyboard
    - automation
intro:
  direction: pyautogui의 키보드 API에서 유효 키 집합과 write/press/hotkey 시그니처를 직접 다뤄 키 입력 자동화의 표준 래퍼를 만든다.
  benefits:
    - pyautogui.KEYBOARD_KEYS로 지원 키 이름을 확인한다.
    - pyautogui.isValidKey로 임의 키 이름의 유효성을 검사한다.
    - write/press/hotkey 시그니처를 inspect로 직접 확인한다.
    - 종합 입력 계획 함수가 유효 키만 받아 안전한 시퀀스를 만든다.
  diagram:
    steps:
      - label: 유효 키 집합 확인
        detail: pyautogui.KEYBOARD_KEYS는 자동화가 사용할 수 있는 키 이름 리스트다.
      - label: 키 이름 검사
        detail: pyautogui.isValidKey("enter")가 True인지 확인해 잘못된 키 호출을 막는다.
      - label: 입력 API 시그니처 확인
        detail: inspect.signature로 write/press/hotkey의 인자를 직접 본다.
      - label: 종합 입력 계획
        detail: 유효 키만 통과시키는 함수가 자동화 시퀀스의 잘못된 키 사고를 막는다.
    runtime:
      - label: pyautogui 패키지 필요
        detail: meta.packages의 pyautogui가 로컬 가상환경에 설치돼 있어야 한다.
      - label: 키 입력 호출 미실행
        detail: snippet은 키 입력을 실제로 보내지 않고 시그니처 검증과 계획 dict 구성으로만 학습한다.
sections:
  - id: keyboard-keys
    title: 유효 키 집합
    structuredPrimary: true
    subtitle: pyautogui.KEYBOARD_KEYS
    goal: pyautogui.KEYBOARD_KEYS에 'enter', 'tab', 'esc' 같은 필수 키가 포함돼 있는지 확인한다.
    why: 자동화가 잘못된 키 이름을 호출하면 pyautogui가 조용히 무시할 수 있으므로 사전에 유효 키 집합을 알아 둬야 한다.
    explanation: pyautogui.KEYBOARD_KEYS는 모듈 단위 리스트로 모든 지원 키 이름을 소문자 문자열로 담는다. 'enter', 'tab', 'esc', 'space', 'ctrl', 'shift' 등이 표준이다. 같은 이름이 press 함수의 키 인자에 그대로 들어간다.
    tips:
      - 키 이름은 항상 소문자 영문이다.
      - 특수 키 이름이 기억나지 않으면 KEYBOARD_KEYS를 직접 출력해 확인한다.
    snippet: |-
      import pyautogui

      keys = set(pyautogui.KEYBOARD_KEYS)
      required = {"enter", "tab", "esc"}

      assert required.issubset(keys)
      sorted(required & keys)
    exercise:
      prompt: "'shift', 'ctrl', 'space' 세 키가 pyautogui.KEYBOARD_KEYS 안에 모두 들어 있는지 검증하세요."
      starterCode: |-
        import pyautogui

        keys = set(pyautogui.___)
        required = {"shift", "ctrl", "space"}

        assert required.issubset(keys)
        sorted(required & keys)
      solution: |-
        import pyautogui

        keys = set(pyautogui.KEYBOARD_KEYS)
        required = {"shift", "ctrl", "space"}

        assert required.issubset(keys)
        sorted(required & keys)
      hints:
        - 모듈 상수 이름은 KEYBOARD_KEYS 대문자다.
        - 세 키는 모두 소문자 영문 문자열로 등록돼 있다.
      check:
        noError: KEYBOARD_KEYS 접근이 끝나야 한다.
        resultCheck: required 세 키가 모두 keys 안에 있어야 한다.
    check:
      noError: KEYBOARD_KEYS 접근이 끝나야 한다.
      resultCheck: required 키 세 개가 모두 KEYBOARD_KEYS 안에 있어야 한다.
  - id: validate-key
    title: 키 이름 검사
    structuredPrimary: true
    subtitle: pyautogui.isValidKey()
    goal: pyautogui.isValidKey로 임의 문자열이 유효한 키 이름인지 boolean으로 확인한다.
    why: 자동화 시퀀스에 잘못된 키 이름이 섞이면 디버깅이 어려워지므로 사전 검사로 막는 패턴이 표준이다.
    explanation: pyautogui.isValidKey(name)는 name이 KEYBOARD_KEYS에 있으면 True, 없으면 False를 돌려준다. 단일 문자 키 ('a', 'b')는 True, 멀티문자 'enter'도 True, 임의 문자열 'hello'는 False다. 검사는 대소문자에 민감하다.
    tips:
      - 자동화 입력은 isValidKey로 한 번 거른 뒤 press나 hotkey에 넘기는 편이 안전하다.
      - 대문자 'A'는 키 이름이 아니라 텍스트라 isValidKey가 False를 돌려준다.
    snippet: |-
      import pyautogui

      good = pyautogui.isValidKey("enter")
      bad = pyautogui.isValidKey("nope")

      assert good is True
      assert bad is False
      (good, bad)
    exercise:
      prompt: pyautogui.isValidKey로 'tab'은 True, 'fakekey'는 False가 돌아오는지 검증하세요.
      starterCode: |-
        import pyautogui

        good = pyautogui.isValidKey("tab")
        bad = pyautogui.___("fakekey")

        assert good is True
        assert bad is False
        (good, bad)
      solution: |-
        import pyautogui

        good = pyautogui.isValidKey("tab")
        bad = pyautogui.isValidKey("fakekey")

        assert good is True
        assert bad is False
        (good, bad)
      hints:
        - 검사 함수 이름은 isValidKey다.
        - 임의 문자열 'fakekey'는 등록된 키 이름이 아니다.
      check:
        noError: isValidKey 두 호출이 끝나야 한다.
        resultCheck: good이 True, bad가 False여야 한다.
    check:
      noError: isValidKey 두 호출이 끝나야 한다.
      resultCheck: 유효 키는 True, 잘못된 이름은 False여야 한다.
  - id: write-signature
    title: 입력 API 시그니처
    structuredPrimary: true
    subtitle: inspect로 인자 보기
    goal: inspect.signature로 pyautogui.write의 인자 이름을 확인해 자동화 호출 시 어떤 인자를 넘겨야 하는지 파악한다.
    why: 자동화 코드는 라이브러리 시그니처를 직접 확인해 둬야 인자를 잘못 넘기는 사고를 막을 수 있다.
    explanation: pyautogui.write(message, interval, ...)는 문자열을 한 글자씩 입력하는 함수다. interval 인자는 글자 사이 대기 시간이다. inspect.signature로 호출 형태를 확인하면 자동화 코드 작성이 빨라진다.
    tips:
      - inspect.signature는 모든 함수에서 동작해 라이브러리 학습에 자주 쓰인다.
      - 자동화 코드는 키워드 인자로 호출하면 가독성이 좋다.
    snippet: |-
      import inspect
      import pyautogui

      signature = inspect.signature(pyautogui.write)
      params = list(signature.parameters)

      assert "message" in params
      assert "interval" in params
      params[:2]
    exercise:
      prompt: inspect.signature로 pyautogui.write의 첫 인자 이름이 'message'이고 두 번째가 'interval'인지 검증하세요.
      starterCode: |-
        import inspect
        import pyautogui

        signature = inspect.___(pyautogui.write)
        params = list(signature.parameters)

        assert params[0] == "message"
        assert params[1] == "interval"
        params[:2]
      solution: |-
        import inspect
        import pyautogui

        signature = inspect.signature(pyautogui.write)
        params = list(signature.parameters)

        assert params[0] == "message"
        assert params[1] == "interval"
        params[:2]
      hints:
        - inspect 모듈 함수 이름은 signature다.
        - write의 첫 인자는 입력할 문자열을 받는 message다.
      check:
        noError: inspect.signature 호출이 끝나야 한다.
        resultCheck: params의 앞 두 인자가 message, interval이어야 한다.
    check:
      noError: inspect.signature 호출이 끝나야 한다.
      resultCheck: pyautogui.write의 인자에 message와 interval이 있어야 한다.
  - id: input-plan
    title: 종합 입력 계획
    structuredPrimary: true
    subtitle: 유효 키만 통과
    goal: 입력 계획 함수가 isValidKey로 거른 유효 키만 시퀀스에 담아 자동화 표준 입력을 만든다.
    why: 자동화 실행 전 유효 키만 통과시키는 게이트를 두면 잘못된 키가 운영 환경에서 실패하는 사고를 막을 수 있다.
    explanation: planKeyboardSequence 함수는 키 이름 리스트와 텍스트를 받아 유효 키는 press 명령, 텍스트는 write 명령으로 묶어 dict 리스트로 돌려준다. 결과 dict 안의 모든 key는 isValidKey 검사를 통과한 값만 들어간다. 잘못된 키는 skipped 키에 모아 보고한다.
    tips:
      - skipped 리스트가 비어 있어야 자동화 실행이 안전하다.
      - 입력 계획 함수가 실행 단계와 검증 단계를 분리해 사고 추적이 쉽다.
    snippet: |-
      import pyautogui


      def planKeyboardSequence(keys: list, message: str) -> dict:
          accepted = []
          skipped = []
          for name in keys:
              if pyautogui.isValidKey(name):
                  accepted.append({"action": "press", "key": name})
              else:
                  skipped.append(name)
          accepted.append({"action": "write", "message": message, "interval": 0.0})
          return {"sequence": accepted, "skipped": skipped}


      plan = planKeyboardSequence(["enter", "fakekey", "tab"], "ok")

      assert plan["skipped"] == ["fakekey"]
      assert plan["sequence"][0] == {"action": "press", "key": "enter"}
      assert plan["sequence"][-1]["action"] == "write"
      plan
    exercise:
      prompt: planKeyboardSequence에 ['enter', 'bogus']와 'hi'를 넘기면 skipped가 ['bogus']이고 sequence의 첫 항목이 enter press인지 종합 검증하세요.
      starterCode: |-
        import pyautogui


        def planKeyboardSequence(keys: list, message: str) -> dict:
            accepted = []
            skipped = []
            for name in keys:
                if pyautogui.___(name):
                    accepted.append({"action": "press", "key": name})
                else:
                    skipped.append(name)
            accepted.append({"action": "write", "message": message, "interval": 0.0})
            return {"sequence": accepted, "skipped": skipped}


        plan = planKeyboardSequence(["enter", "bogus"], "hi")

        assert plan["skipped"] == ["bogus"]
        assert plan["sequence"][0] == {"action": "press", "key": "enter"}
        plan
      solution: |-
        import pyautogui


        def planKeyboardSequence(keys: list, message: str) -> dict:
            accepted = []
            skipped = []
            for name in keys:
                if pyautogui.isValidKey(name):
                    accepted.append({"action": "press", "key": name})
                else:
                    skipped.append(name)
            accepted.append({"action": "write", "message": message, "interval": 0.0})
            return {"sequence": accepted, "skipped": skipped}


        plan = planKeyboardSequence(["enter", "bogus"], "hi")

        assert plan["skipped"] == ["bogus"]
        assert plan["sequence"][0] == {"action": "press", "key": "enter"}
        plan
      hints:
        - 검사 함수 이름은 isValidKey다.
        - "'bogus'는 KEYBOARD_KEYS에 없어 skipped로 분류된다."
      check:
        noError: planKeyboardSequence 호출이 종합 결과를 돌려줘야 한다.
        resultCheck: "skipped가 ['bogus']이고 sequence 첫 항목이 enter press여야 한다."
    check:
      noError: planKeyboardSequence 호출이 끝나야 한다.
      resultCheck: skipped 리스트가 유효하지 않은 키를 담고 sequence가 enter press로 시작해야 한다.
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
  - id: inputCtl_04-keyboard-sequence-plan-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - keyboard-keys
    - input-plan
    title: 텍스트 입력과 hotkey를 분리한 keyboard sequence 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: plain text·key press·hotkey를 typed action으로 구성하고 금지 chord를 차단한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 문자열과 special key, hotkey를 같은 \`write\` 호출로 섞지 마세요.
    - 앱 종료·시스템 전환 chord는 명시적 blocklist로 차단하세요.
    exercise:
      prompt: plan_keyboard_sequence(items, blocked_hotkeys)를 완성하세요.
      starterCode: |-
        def plan_keyboard_sequence(items, blocked_hotkeys):
            raise NotImplementedError
      solution: |
        def plan_keyboard_sequence(items, blocked_hotkeys):
            blocked = {tuple(keys) for keys in blocked_hotkeys}
            actions = []
            rejected = []
            for index, item in enumerate(items):
                if item["kind"] == "text":
                    actions.append({"kind": "write", "text": item["value"]})
                elif item["kind"] == "key":
                    actions.append({"kind": "press", "key": item["value"]})
                elif item["kind"] == "hotkey":
                    keys = tuple(item["keys"])
                    if keys in blocked:
                        rejected.append({"index": index, "reason": "blocked-hotkey"})
                    else:
                        actions.append({"kind": "hotkey", "keys": list(keys)})
                else:
                    rejected.append({"index": index, "reason": "unknown-kind"})
            return {"ready": not rejected, "actions": actions, "rejected": rejected}
      hints: *id001
    check:
      id: python.inputctl.inputCtl_04.keyboard-sequence-plan.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.inputctl.inputCtl_04.keyboard-sequence-plan.mastery.behavior.v1.fixture
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
        entry: plan_keyboard_sequence
        cases:
        - id: plans-text-key-and-hotkey
          arguments:
          - value:
            - kind: text
              value: hello
            - kind: key
              value: enter
            - kind: hotkey
              keys:
              - ctrl
              - s
          - value: []
          expectedReturn:
            ready: true
            actions:
            - kind: write
              text: hello
            - kind: press
              key: enter
            - kind: hotkey
              keys:
              - ctrl
              - s
            rejected: []
        - id: rejects-blocked-hotkey
          arguments:
          - value:
            - kind: hotkey
              keys:
              - alt
              - f4
          - value:
            - - alt
              - f4
          expectedReturn:
            ready: false
            actions: []
            rejected:
            - index: 0
              reason: blocked-hotkey
        - id: rejects-unknown-kind
          arguments:
          - value:
            - kind: macro
          - value: []
          expectedReturn:
            ready: false
            actions: []
            rejected:
            - index: 0
              reason: unknown-kind
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: inputCtl_04-keyboard-focus-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - inputCtl_04-keyboard-sequence-plan-mastery
    title: 새 키보드 입력에 focus·value 변화 감사 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: planned field와 실제 focus, 입력 전후 value를 비교한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 입력 직전에 실제 focus field identity를 확인하세요.
    - 비밀번호는 value 대신 길이와 redacted marker만 evidence에 남기세요.
    exercise:
      prompt: audit_keyboard_focus(observation, secret_input)를 완성하세요.
      starterCode: |-
        def audit_keyboard_focus(observation, secret_input):
            raise NotImplementedError
      solution: |
        def audit_keyboard_focus(observation, secret_input):
            failures = []
            if observation.get("plannedField") != observation.get("focusedField"):
                failures.append("focus")
            if observation.get("beforeValue") == observation.get("afterValue"):
                failures.append("no-value-change")
            if observation.get("expectedLength") != observation.get("observedLength"):
                failures.append("length")
            return {"passed": not failures, "failures": failures, "recordedValue": "[REDACTED]" if secret_input else observation.get("afterValue")}
      hints: *id002
    check:
      id: python.inputctl.inputCtl_04.keyboard-focus-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.inputctl.inputCtl_04.keyboard-focus-audit.transfer.behavior.v1.fixture
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
        entry: audit_keyboard_focus
        cases:
        - id: accepts-focused-text-change
          arguments:
          - value:
              plannedField: query
              focusedField: query
              beforeValue: ''
              afterValue: hello
              expectedLength: 5
              observedLength: 5
          - value: false
          expectedReturn:
            passed: true
            failures: []
            recordedValue: hello
        - id: reports-wrong-focus-and-length
          arguments:
          - value:
              plannedField: email
              focusedField: search
              beforeValue: ''
              afterValue: abc
              expectedLength: 5
              observedLength: 3
          - value: false
          expectedReturn:
            passed: false
            failures:
            - focus
            - length
            recordedValue: abc
        - id: redacts-secret-value
          arguments:
          - value:
              plannedField: password
              focusedField: password
              beforeValue: ''
              afterValue: secret
              expectedLength: 6
              observedLength: 6
          - value: true
          expectedReturn:
            passed: true
            failures: []
            recordedValue: '[REDACTED]'
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: inputCtl_04-keyboard-input-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - inputCtl_04-keyboard-focus-audit-transfer
    title: 키보드 자동화 안전 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: text·special key·secret 입력 증거를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 입력 자동화 action 전에 대상·경계·중단 방법을 검증하세요.
    - 화면 변화와 E-Stop evidence를 남기고 성공을 클릭 발생으로 판단하지 마세요.
    exercise:
      prompt: choose_keyboard_input(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_keyboard_input(situation):
            raise NotImplementedError
      solution: |
        def choose_keyboard_input(situation):
            table = {'text': {'action': 'verify focus then write', 'evidence': 'field and length change', 'risk': 'wrong focus'}, 'hotkey': {'action': 'allowlist chord', 'evidence': 'typed key sequence', 'risk': 'system shortcut'}, 'secret': {'action': 'use approved secret input', 'evidence': 'redacted length only', 'risk': 'clipboard or log leakage'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.inputctl.inputCtl_04.keyboard-input-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.inputctl.inputCtl_04.keyboard-input-recall.retrieval.behavior.v1.fixture
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
        entry: choose_keyboard_input
        cases:
        - id: recalls-text
          arguments:
          - value: text
          expectedReturn:
            action: verify focus then write
            evidence: field and length change
            risk: wrong focus
        - id: recalls-hotkey
          arguments:
          - value: hotkey
          expectedReturn:
            action: allowlist chord
            evidence: typed key sequence
            risk: system shortcut
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};