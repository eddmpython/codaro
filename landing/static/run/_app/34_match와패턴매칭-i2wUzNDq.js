var e=`meta:\r
  id: '34'\r
  title: match와 패턴매칭\r
  day: 34\r
  category: advancedPython\r
  tags:\r
  - match\r
  - case\r
  - structural-pattern-matching\r
  - guard\r
  - python310\r
  seo:\r
    title: 파이썬 match/case 구조 패턴 매칭 (3.10+)\r
    description: 리터럴/시퀀스/매핑/클래스 패턴, guard, as 바인딩, OR 패턴으로 분기를 명확하게 표현합니다.\r
    keywords:\r
    - match case\r
    - structural pattern matching\r
    - python 3.10\r
    - guard\r
    - 클래스 패턴\r
intro:\r
  emoji: 🪢\r
  points:\r
  - 리터럴과 캡처로 단순 분기를 짧게 작성\r
  - 시퀀스/매핑 패턴으로 구조 분해\r
  - 클래스 패턴으로 객체 속성 매칭\r
  - guard 절로 추가 조건 표현\r
  - OR 패턴, wildcard, as 바인딩 활용\r
  direction: match와 패턴매칭에서 분기 조건을 if/elif 사슬 대신 구조 패턴으로 표현하고 가독성이 어떻게 달라지는지 확인합니다.\r
  benefits:\r
  - dict/tuple 구조 분해를 if 분기 없이 한 자리에서 처리합니다.\r
  - 클래스 인스턴스의 속성 매칭을 표준 문법으로 표현합니다.\r
  - guard와 OR 패턴으로 if 사슬에서 흩어지던 조건을 모읍니다.\r
  diagram:\r
    steps:\r
    - label: 패턴 매칭 입력 확인\r
      detail: subject(매칭 대상)와 각 case의 패턴 형태를 먼저 고정합니다.\r
    - label: case 우선순위 처리 실행\r
      detail: 위에서 아래로 첫 매치되는 case 본문이 실행됩니다.\r
    - label: 캡처 변수 결과 검증\r
      detail: 패턴 안 캡처 변수가 호출자 스코프에 노출되었는지 확인합니다.\r
    - label: 패턴 매칭 재사용\r
      detail: 메시지 파서, 응답 분기, AST 처리 같은 코드에 같은 패턴을 붙입니다.\r
    runtime:\r
    - label: Python 3.10+ 환경\r
      detail: 표준 문법으로 추가 패키지 없이 실행합니다.\r
    - label: match 실행\r
      detail: 셀을 실행해 case 별 캡처와 분기 흐름을 확인합니다.\r
    - label: match 완료\r
      detail: 검증된 코드를 분기 패턴 유틸리티로 남깁니다.\r
sections:\r
- id: literal-capture\r
  title: 리터럴과 캡처 패턴\r
  structuredPrimary: true\r
  subtitle: 가장 단순한 case 형태\r
  goal: 리터럴 패턴과 변수 캡처 패턴이 어떻게 다르게 동작하는지 확인합니다.\r
  why: match가 if/elif와 다른 첫 번째 지점이 바로 캡처입니다. 변수 이름은 자동으로 매칭되는 모든 값을 받아 본문에서 사용할 수 있게 합니다.\r
  explanation: 리터럴 패턴(숫자, 문자열, True/False/None)은 값이 정확히 같을 때만 매칭됩니다. 식별자 단독은 캡처 패턴으로 항상 매칭되며 매칭된 값을 같은 이름의 변수에 바인딩합니다. wildcard '_'는 매칭하되 캡처하지 않습니다.\r
  tips:\r
  - 캡처 패턴은 항상 모든 값을 받으므로 가장 마지막에 두는 것이 안전합니다.\r
  - 점이 있는 이름(Status.OK 같은)은 값 비교 패턴으로 해석됩니다.\r
  snippet: |-\r
    def classify(value):\r
        match value:\r
            case 0:\r
                return "zero"\r
            case 1 | 2 | 3:\r
                return "small"\r
            case n if n < 0:\r
                return f"negative:{n}"\r
            case _:\r
                return "other"\r
\r
    [classify(value) for value in [-2, 0, 1, 3, 5, 10]]\r
  exercise:\r
    prompt: classify에 case "stop" 같은 문자열 리터럴 분기를 추가하고, 정수와 문자열 입력을 섞어 결과 리스트가 어떻게 나오는지 확인하세요.\r
    starterCode: |-\r
      def classify(value):\r
          match value:\r
              case 0:\r
                  return "zero"\r
              case "stop":\r
                  return "stop-token"\r
              case 1 | 2 | 3:\r
                  return "small"\r
              case int() as n if n < 0:\r
                  return f"negative:{n}"\r
              case _:\r
                  return "other"\r
\r
      [classify(value) for value in [-2, 0, "stop", 1, 3, "skip", 10]]\r
    hints:\r
    - 리터럴 패턴은 값이 같을 때만 매칭됩니다.\r
    - 캡처 변수에 int() 타입 가드를 붙이면 문자열 입력은 자연스럽게 wildcard로 떨어집니다.\r
  check:\r
    type: noError\r
    noError: classify 정의와 case 분기가 NameError, SyntaxError 없이 실행되어야 합니다.\r
    resultCheck: 결과 리스트가 [negative:-2, zero, stop-token, small, small, other, other] 순서로 채워져야 합니다.\r
- id: sequence-pattern\r
  title: 시퀀스 패턴으로 구조 분해\r
  structuredPrimary: true\r
  subtitle: 리스트/튜플 분해를 case에서\r
  goal: 시퀀스 패턴으로 첫 항목과 나머지를 분리하거나 길이별 분기를 만듭니다.\r
  why: 튜플/리스트의 구조를 if isinstance + 인덱싱 조합으로 풀면 코드가 길어집니다. 시퀀스 패턴이 한 줄에 표현합니다.\r
  explanation: '[a, b, *rest] 같은 시퀀스 패턴은 리스트/튜플의 길이와 항목을 동시에 검사하고 캡처합니다. *rest는 0개 이상 항목을 받습니다. 빈 시퀀스는 [] 패턴으로 매칭합니다.'\r
  tips:\r
  - 시퀀스 패턴은 str을 매칭하지 않습니다. 문자열은 별도 case로 처리하세요.\r
  - '*_ 는 캡처 없이 나머지를 흡수합니다.'\r
  snippet: |-\r
    def summarize(items):\r
        match items:\r
            case []:\r
                return "empty"\r
            case [single]:\r
                return f"only:{single}"\r
            case [first, *rest] if len(rest) <= 2:\r
                return f"head:{first} rest:{rest}"\r
            case [first, *_, last]:\r
                return f"first:{first} last:{last}"\r
            case _:\r
                return "unknown"\r
\r
    [summarize(seq) for seq in [[], [9], [1, 2], [1, 2, 3], [10, 20, 30, 40, 50]]]\r
  exercise:\r
    prompt: summarize에 정확히 두 항목인 case [a, b]를 추가해 결과가 [first:a second:b] 형태로 분기되도록 만들어 보세요.\r
    starterCode: |-\r
      def summarize(items):\r
          match items:\r
              case []:\r
                  return "empty"\r
              case [single]:\r
                  return f"only:{single}"\r
              case [first, second]:\r
                  return f"first:{first} second:{second}"\r
              case [first, *rest] if len(rest) <= 2:\r
                  return f"head:{first} rest:{rest}"\r
              case [first, *_, last]:\r
                  return f"first:{first} last:{last}"\r
              case _:\r
                  return "unknown"\r
\r
      [summarize(seq) for seq in [[], [9], [1, 2], [1, 2, 3], [10, 20, 30, 40, 50]]]\r
    hints:\r
    - case 두 항목 패턴이 case [first, *rest]보다 위에 있어야 먼저 매칭됩니다.\r
    - case 순서가 결과를 바꿉니다.\r
  check:\r
    type: noError\r
    noError: summarize 정의와 시퀀스 패턴 분기가 NameError, SyntaxError 없이 실행되어야 합니다.\r
    resultCheck: 결과가 [empty, only:9, first:1 second:2, head:1 rest:[2, 3], first:10 last:50] 처럼 두 항목 case가 우선 매칭되어야 합니다.\r
- id: mapping-pattern\r
  title: 매핑 패턴과 JSON 분기\r
  structuredPrimary: true\r
  subtitle: dict 키 매칭과 값 캡처\r
  goal: dict 패턴으로 API 응답 같은 JSON 형태를 case별로 분기합니다.\r
  why: dict에 어떤 키가 있고 어떤 값이 들어 있는지 if 사슬로 검사하면 코드가 빠르게 길어집니다. 매핑 패턴이 그 흐름을 case로 정리합니다.\r
  explanation: '{ "key": pattern } 형태로 매핑 패턴을 만듭니다. 명시한 키만 매칭하면 매칭으로 보고 나머지 키는 무시합니다. **rest로 나머지 모든 항목을 캡처할 수 있습니다.'\r
  tips:\r
  - 키 자체는 리터럴이고, 값 자리에 패턴(리터럴/캡처/시퀀스/중첩 매핑)이 옵니다.\r
  - 키가 있어야 매칭이고, 키가 없으면 매칭 실패입니다(값이 None이라도).\r
  snippet: |-\r
    def routeMessage(message):\r
        match message:\r
            case {"type": "ping"}:\r
                return "pong"\r
            case {"type": "echo", "text": text}:\r
                return f"echo:{text}"\r
            case {"type": "error", "code": code, "detail": detail}:\r
                return f"error:{code}:{detail}"\r
            case {"type": kind, **rest}:\r
                return f"unknown:{kind} extra:{sorted(rest)}"\r
            case _:\r
                return "no match"\r
\r
    samples = [\r
        {"type": "ping"},\r
        {"type": "echo", "text": "hi"},\r
        {"type": "error", "code": 500, "detail": "boom"},\r
        {"type": "user", "name": "alice"},\r
        ["not a dict"],\r
    ]\r
    [routeMessage(msg) for msg in samples]\r
  exercise:\r
    prompt: routeMessage에 case에서 echo의 text가 빈 문자열인 경우를 별도로 잡아 echo-empty를 돌려주도록 guard를 추가하세요.\r
    starterCode: |-\r
      def routeMessage(message):\r
          match message:\r
              case {"type": "ping"}:\r
                  return "pong"\r
              case {"type": "echo", "text": text} if not text:\r
                  return "echo-empty"\r
              case {"type": "echo", "text": text}:\r
                  return f"echo:{text}"\r
              case {"type": "error", "code": code, "detail": detail}:\r
                  return f"error:{code}:{detail}"\r
              case _:\r
                  return "no match"\r
\r
      samples = [\r
          {"type": "ping"},\r
          {"type": "echo", "text": "hi"},\r
          {"type": "echo", "text": ""},\r
          {"type": "error", "code": 500, "detail": "boom"},\r
      ]\r
      [routeMessage(msg) for msg in samples]\r
    hints:\r
    - 더 좁은 case(빈 문자열)가 위에 있어야 먼저 매칭됩니다.\r
    - guard에는 not text나 len(text) == 0 둘 다 가능합니다.\r
  check:\r
    type: noError\r
    noError: routeMessage 정의와 매핑 패턴 분기가 NameError, SyntaxError 없이 실행되어야 합니다.\r
    resultCheck: 결과가 [pong, echo:hi, echo-empty, error:500:boom] 처럼 빈 문자열 분기가 echo 일반 분기보다 먼저 매칭되어야 합니다.\r
- id: class-pattern\r
  title: 클래스 패턴\r
  structuredPrimary: true\r
  subtitle: 객체 속성 매칭\r
  goal: dataclass나 일반 클래스의 인스턴스를 클래스 패턴으로 분기하고 속성을 캡처합니다.\r
  why: 타입 별 분기를 isinstance 사슬로 작성하면 속성 접근까지 같은 case에 묶이지 않습니다. 클래스 패턴은 둘을 한 자리에서 처리합니다.\r
  explanation: ClassName(attr=pattern, ...) 형태로 클래스 인스턴스를 매칭합니다. __match_args__가 정의되어 있으면 위치 인자 패턴도 가능합니다. dataclass는 자동으로 __match_args__를 생성합니다.\r
  tips:\r
  - dataclass와 같이 쓰면 가독성이 가장 좋습니다.\r
  - __match_args__가 없으면 키워드 형태(attr=value)만 가능합니다.\r
  snippet: |-\r
    from dataclasses import dataclass\r
\r
    @dataclass\r
    class Move:\r
        direction: str\r
        steps: int\r
\r
    @dataclass\r
    class Wait:\r
        seconds: float\r
\r
    @dataclass\r
    class Quit:\r
        pass\r
\r
    def describe(command):\r
        match command:\r
            case Move(direction="up", steps=steps):\r
                return f"upward x{steps}"\r
            case Move(direction=direction, steps=steps) if steps > 1:\r
                return f"big move:{direction} x{steps}"\r
            case Move(direction=direction, steps=1):\r
                return f"small move:{direction}"\r
            case Wait(seconds=seconds):\r
                return f"wait:{seconds}"\r
            case Quit():\r
                return "quit"\r
            case _:\r
                return "unknown command"\r
\r
    commands = [Move("up", 3), Move("left", 4), Move("down", 1), Wait(0.5), Quit()]\r
    [describe(command) for command in commands]\r
  exercise:\r
    prompt: describe에 Move의 steps가 0인 경우를 잡아 idle을 돌려주는 case를 추가하고 결과 리스트에 idle이 나오는지 확인하세요.\r
    starterCode: |-\r
      from dataclasses import dataclass\r
\r
      @dataclass\r
      class Move:\r
          direction: str\r
          steps: int\r
\r
      def describe(command):\r
          match command:\r
              case Move(direction=_, steps=0):\r
                  return "idle"\r
              case Move(direction="up", steps=steps):\r
                  return f"upward x{steps}"\r
              case Move(direction=direction, steps=steps):\r
                  return f"move:{direction} x{steps}"\r
              case _:\r
                  return "unknown command"\r
\r
      commands = [Move("up", 3), Move("left", 0), Move("down", 1)]\r
      [describe(command) for command in commands]\r
    hints:\r
    - steps=0 패턴이 일반 Move 분기보다 위에 있어야 먼저 매칭됩니다.\r
    - direction을 wildcard로 두면 방향과 무관하게 idle 처리가 됩니다.\r
  check:\r
    noError: dataclass 정의와 describe 분기가 NameError, SyntaxError 없이 실행되어야 합니다.\r
    resultCheck: 결과가 [upward x3, idle, move:down x1] 처럼 0 steps 분기가 일반 Move 분기보다 먼저 매칭되어야 합니다.\r
- id: as-binding-or\r
  title: as 바인딩과 OR 패턴 합성\r
  structuredPrimary: true\r
  subtitle: 복잡한 case 한 자리에 표현\r
  goal: as 바인딩으로 매칭된 값을 캡처하고 OR 패턴으로 여러 형태를 같은 case에 모읍니다.\r
  why: 여러 형태가 같은 처리로 분기되어야 할 때 if문에서 isinstance 사슬을 만들면 본문이 중복됩니다. OR 패턴이 그 중복을 합쳐 줍니다.\r
  explanation: 'pattern as name으로 매칭된 객체 전체를 캡처할 수 있습니다. pat1 | pat2 형태의 OR 패턴은 둘 중 하나라도 매칭되면 본문으로 진입합니다. OR 패턴의 두 쪽이 같은 캡처 변수를 가져야 본문에서 사용할 수 있습니다.'\r
  tips:\r
  - OR 패턴의 모든 분기가 같은 캡처 이름을 가져야 본문에서 그 이름을 쓸 수 있습니다.\r
  - as 바인딩은 매칭된 객체 전체에 이름을 붙이는 데 유용합니다.\r
  snippet: |-\r
    def normalize(value):\r
        match value:\r
            case {"data": {"items": list() as items}} | {"items": list() as items}:\r
                return [f"item:{x}" for x in items]\r
            case {"data": data} as wrapper if isinstance(data, dict):\r
                return f"wrapper-keys:{sorted(wrapper)}"\r
            case int() | float() as number:\r
                return f"number:{number}"\r
            case str() as text:\r
                return f"text:{text}"\r
            case _:\r
                return "other"\r
\r
    samples = [\r
        {"data": {"items": [1, 2, 3]}},\r
        {"items": ["a", "b"]},\r
        {"data": {"meta": "x"}},\r
        42,\r
        "hello",\r
        None,\r
    ]\r
    [normalize(value) for value in samples]\r
  exercise:\r
    prompt: normalize에 list() as raw 단독 패턴을 추가해 raw 리스트 입력 [10, 20, 30]도 list-of-N 형태로 처리되도록 만들어 보세요.\r
    starterCode: |-\r
      def normalize(value):\r
          match value:\r
              case list() as raw:\r
                  return f"list-of-{len(raw)}"\r
              case {"items": list() as items}:\r
                  return [f"item:{x}" for x in items]\r
              case int() | float() as number:\r
                  return f"number:{number}"\r
              case str() as text:\r
                  return f"text:{text}"\r
              case _:\r
                  return "other"\r
\r
      samples = [[10, 20, 30], {"items": ["a", "b"]}, 42, "hello"]\r
      [normalize(value) for value in samples]\r
    hints:\r
    - list() as raw는 raw에 매칭된 리스트 전체를 바인딩합니다.\r
    - case 순서가 결과를 바꿉니다. 더 좁은 dict case가 list case보다 아래로 가야 합니다.\r
  check:
    type: noError
    noError: normalize 정의와 match 분기가 NameError, SyntaxError 없이 실행되어야 합니다.
    resultCheck: 결과가 [list-of-3, [item:a, item:b], number:42, text:hello] 처럼 OR/as 패턴이 의도한 대로 매칭되어야 합니다.
assessment:
  masteryVariants:
  - id: 34_pattern_matching-learning-event-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - literal-capture
    - mapping-pattern
    - as-binding-or
    title: 학습 이벤트를 match로 구조 분기하기
    subtitle: structural event routing
    goal: route_learning_event(event)를 완성해 dict, list, guard 패턴을 사용해 학습 이벤트를 설명 문자열로 변환한다.
    why: 패턴 매칭의 가치는 값을 비교하는 데서 끝나지 않고, 입력 구조를 분해하면서 필요한 값만 안전하게 꺼내는 데 있습니다.
    explanation: run 성공, check 통과, navigate 명령, 숫자 progress, 그 외 입력을 서로 다른 문자열로 반환하세요.
    tips:
    - mapping pattern은 필요한 key가 없으면 다음 case로 넘어갑니다.
    - guard는 구조가 맞은 뒤 추가 조건을 확인할 때 씁니다.
    exercise:
      prompt: route_learning_event(event)를 완성해 이벤트 구조별 설명 문자열을 반환하세요.
      starterCode: |-
        def route_learning_event(event):
            raise NotImplementedError
      solution: |-
        def route_learning_event(event):
            match event:
                case {"type": "run", "lesson": lesson, "ok": True}:
                    return f"run-ok:{lesson}"
                case {"type": "check", "result": {"passed": True, "score": score}} if score >= 90:
                    return f"mastery:{score}"
                case ["navigate", target]:
                    return f"go:{target}"
                case int() | float() as progress:
                    return f"progress:{progress}"
                case _:
                    return "unhandled"
      hints:
      - check case는 score guard가 90 이상일 때만 mastery로 처리합니다.
      - list 명령은 ["navigate", target] 형태만 처리하세요.
    check:
      id: python.advanced.pattern-matching.learning-event.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.pattern-matching.empty.behavior.v1.fixture
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
        entry: route_learning_event
        cases:
        - id: routes-successful-run-event
          arguments:
          - value:
              type: run
              lesson: advancedPython-34
              ok: true
          expectedReturn: run-ok:advancedPython-34
        - id: routes-high-score-check-event
          arguments:
          - value:
              type: check
              result:
                passed: true
                score: 95
          expectedReturn: mastery:95
        - id: routes-navigation-command-list
          arguments:
          - value:
            - navigate
            - /learn/python
          expectedReturn: go:/learn/python
        - id: leaves-low-score-unhandled
          arguments:
          - value:
              type: check
              result:
                passed: true
                score: 70
          expectedReturn: unhandled
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 34_pattern_matching-command-normalizer-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - sequence-pattern
    - class-pattern
    - as-binding-or
    title: 여러 명령 형태를 match로 표준화하기
    subtitle: command normalization transfer
    goal: normalize_command(command)를 완성해 list, dict, scalar 명령을 같은 dict 계약으로 표준화한다.
    why: 이벤트 라우팅에서 배운 구조 매칭을 명령 정규화로 옮기면, API 입력이 여러 형태를 가질 때 안전하게 표준 형태로 모으는 감각이 생깁니다.
    explanation: 'list move 명령, dict move 명령, stop 문자열을 처리하고 나머지는 ValueError로 거부하세요.'
    tips:
    - OR 패턴 양쪽에서 같은 변수 이름을 바인딩해야 본문에서 쓸 수 있습니다.
    - 더 구체적인 case를 위에 두어야 의도한 분기가 먼저 실행됩니다.
    exercise:
      prompt: normalize_command(command)를 완성해 type, direction, steps를 가진 dict로 표준화하세요.
      starterCode: |-
        def normalize_command(command):
            raise NotImplementedError
      solution: |-
        def normalize_command(command):
            match command:
                case ["move", str() as direction, int() as steps] | {"move": {"direction": str() as direction, "steps": int() as steps}}:
                    return {"type": "move", "direction": direction, "steps": steps}
                case "stop":
                    return {"type": "stop", "direction": None, "steps": 0}
                case _:
                    raise ValueError("unknown command shape")
      hints:
      - list와 dict 형태를 같은 move 결과로 합치세요.
      - steps가 int가 아니면 매칭되지 않아 ValueError로 떨어져야 합니다.
    check:
      id: python.advanced.pattern-matching.command-normalizer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.pattern-matching.empty.behavior.v1.fixture
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
        entry: normalize_command
        cases:
        - id: normalizes-list-move-command
          arguments:
          - value:
            - move
            - up
            - 3
          expectedReturn:
            type: move
            direction: up
            steps: 3
        - id: normalizes-dict-move-command
          arguments:
          - value:
              move:
                direction: left
                steps: 2
          expectedReturn:
            type: move
            direction: left
            steps: 2
        - id: rejects-unknown-command-shape
          arguments:
          - value:
            - move
            - up
            - three
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 34_pattern_matching-feature-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - literal-capture
    - sequence-pattern
    - mapping-pattern
    - class-pattern
    - as-binding-or
    title: match 패턴 선택 기준 회상하기
    subtitle: pattern matching recall
    goal: choose_match_pattern(need)를 완성해 구조 분기 상황별 패턴과 주의점을 반환한다.
    why: match는 모든 if문 대체품이 아니라, 입력 구조를 분해하면서 분기해야 할 때 가장 읽기 좋습니다.
    explanation: fixed-value, unpack-list, json-shape, dataclass-shape, combine-shapes, extra-condition 상황별 패턴을 선택하세요.
    tips:
    - mapping pattern은 JSON형 dict 분기에 잘 맞습니다.
    - guard는 case 뒤 if 조건으로 추가 검증을 붙입니다.
    exercise:
      prompt: choose_match_pattern(need)를 완성해 pattern, useWhen, caution을 반환하세요.
      starterCode: |-
        def choose_match_pattern(need):
            raise NotImplementedError
      solution: |-
        def choose_match_pattern(need):
            table = {
                "fixed-value": {
                    "pattern": "literal-pattern",
                    "useWhen": "a command or status value decides the branch",
                    "caution": "place specific cases before broad captures",
                },
                "unpack-list": {
                    "pattern": "sequence-pattern",
                    "useWhen": "position in a list or tuple carries meaning",
                    "caution": "length must match unless using star capture",
                },
                "json-shape": {
                    "pattern": "mapping-pattern",
                    "useWhen": "dict keys define the input shape",
                    "caution": "missing keys simply fall through",
                },
                "dataclass-shape": {
                    "pattern": "class-pattern",
                    "useWhen": "object type and attributes decide behavior",
                    "caution": "__match_args__ affects positional matching",
                },
                "combine-shapes": {
                    "pattern": "or-pattern-with-as",
                    "useWhen": "several shapes share one handling body",
                    "caution": "both sides must bind the same names",
                },
                "extra-condition": {
                    "pattern": "guard",
                    "useWhen": "shape matches but values need an additional condition",
                    "caution": "guards should stay small and readable",
                },
            }
            if need not in table:
                raise ValueError("unknown match need")
            return table[need]
      hints:
      - match가 좋은 문제는 보통 데이터 구조가 분기의 중심입니다.
      - 너무 복잡한 guard는 별도 함수로 빼는 편이 낫습니다.
    check:
      id: python.advanced.pattern-matching.feature-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.pattern-matching.empty.behavior.v1.fixture
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
        entry: choose_match_pattern
        cases:
        - id: recalls-mapping-pattern-for-json-shape
          arguments:
          - value: json-shape
          expectedReturn:
            pattern: mapping-pattern
            useWhen: dict keys define the input shape
            caution: missing keys simply fall through
        - id: recalls-or-as-for-combined-shapes
          arguments:
          - value: combine-shapes
          expectedReturn:
            pattern: or-pattern-with-as
            useWhen: several shapes share one handling body
            caution: both sides must bind the same names
        - id: rejects-unknown-need
          arguments:
          - value: if-but-fancier
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};