var e=`meta:
  id: 27_timeit
  title: timeit - 성능 측정
  category: builtins
  tags:
  - timeit
  - 성능
  - 벤치마크
  - 속도
  - 측정
  description: 코드 실행 시간 측정을 위한 timeit 모듈
  keywords:
  - timeit
  - 성능
  - 벤치마크
  - 속도
  - 측정
intro:
  emoji: ⏱️
  points:
  - 정확한 실행 시간 측정
  - 여러 번 반복 실행
  - 코드 성능 비교
  - 마이크로벤치마크
  direction: timeit 성능 측정에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - timeit 성능 측정 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 모듈 임포트 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 기본 측정 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: 반복 측정 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: timeit 성능 측정 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: timeit 성능 측정 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: timeit 성능 측정 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- id: module_import
  title: 모듈 임포트
  structuredPrimary: true
  subtitle: timeit 시작하기
  goal: 모듈 임포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    timeit는 파이썬 표준 라이브러리입니다. 작은 코드 조각의 실행 시간을 정확하게 측정할 수 있습니다.

    timeit는 가비지 컬렉션을 일시적으로 비활성화하여 더 정확한 측정을 합니다. number 파라미터로 반복 횟수를 지정합니다.
  snippet: |-
    import timeit

    duration = timeit.timeit('x = 2 + 2', number=100000)
    duration
  exercise:
    prompt: 모듈 임포트 예제에서 \`duration\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      import timeit

      duration = timeit.timeit('x = 2 + 2', number=100000)
      duration
    hints:
    - 바꿀 지점은 \`duration = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`duration\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 모듈 임포트에서 \`duration\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 모듈 임포트 실행 뒤 \`duration\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: basic_timing
  title: 기본 측정
  structuredPrimary: true
  subtitle: timeit 함수 사용
  goal: 기본 측정에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    timeit() 함수로 간단하게 코드의 실행 시간을 측정할 수 있습니다.

    number를 크게 설정하면 더 정확한 측정이 가능하지만, 실행 시간이 길어집니다. 적절한 균형을 찾으세요.
  snippet: |-
    import timeit

    addTime = timeit.timeit('sum([1, 2, 3, 4, 5])', number=100000)
    addTime
  exercise:
    prompt: 기본 측정 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      import timeit

      addTime = timeit.timeit('sum([1, 2, 3, 4, 5])', number=100000)
      addTime
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 기본 측정에서 \`addTime\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 기본 측정 실행 뒤 \`addTime\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: repeat_timing
  title: 반복 측정
  structuredPrimary: true
  subtitle: repeat 함수
  goal: 반복 측정에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    repeat() 함수로 여러 번 측정하여 최솟값을 얻을 수 있습니다. 이는 시스템 노이즈의 영향을 최소화합니다.

    시스템 부하나 다른 프로세스의 영향으로 측정값이 달라질 수 있으므로, 평균보다 최솟값을 사용하는 것이 권장됩니다.
  snippet: |-
    import timeit

    results = timeit.repeat('[x**2 for x in range(10)]', repeat=5, number=10000)
    results
  exercise:
    prompt: 반복 측정 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import timeit

      results = timeit.repeat('[x**2 for x in range(10)]', repeat=5, number=10000)
      results
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 반복 측정의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 반복 측정 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: timer_class
  title: Timer 클래스
  structuredPrimary: true
  subtitle: 재사용 가능한 타이머
  goal: Timer 클래스에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    Timer 클래스로 타이머 객체를 만들어 여러 번 재사용할 수 있습니다.

    Timer 객체는 같은 코드를 여러 번 측정할 때 유용합니다. 한 번 생성하고 여러 번 재사용할 수 있습니다.
  snippet: |-
    import timeit

    timer = timeit.Timer('x = [i for i in range(100)]')
    execution = timer.timeit(number=10000)
    execution
  exercise:
    prompt: Timer 클래스 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import timeit

      timer = timeit.Timer('x = [i for i in range(100)]')
      execution = timer.timeit(number=10000)
      execution
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: Timer 클래스의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: Timer 클래스 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: comparing_code
  title: 코드 비교
  structuredPrimary: true
  subtitle: 성능 차이 측정
  goal: 코드 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    여러 구현 방법의 성능을 비교하여 최적의 방법을 선택할 수 있습니다.

    비교할 때는 동일한 number와 repeat를 사용하고, 비율로 얼마나 빠른지 표현하면 이해하기 쉽습니다.
  snippet: |-
    import timeit

    listTime = timeit.timeit('[x**2 for x in range(100)]', number=10000)
    genTime = timeit.timeit('list(x**2 for x in range(100))', number=10000)

    listTime, genTime
  exercise:
    prompt: 코드 비교 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import timeit

      listTime = timeit.timeit('[x**2 for x in range(100)]', number=10000)
      genTime = timeit.timeit('list(x**2 for x in range(100))', number=10000)

      listTime, genTime
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 코드 비교의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 코드 비교 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: best_practices
  title: 모범 사례
  structuredPrimary: true
  subtitle: 정확한 측정을 위한 팁
  goal: 모범 사례에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    정확하고 신뢰할 수 있는 성능 측정을 위한 모범 사례들입니다.

    너무 빠른 코드는 number를 크게, 느린 코드는 작게 설정하여 측정 시간이 0.1초 이상이 되도록 조정하세요.
  snippet: |-
    import timeit

    testData = [1, 2, 3, 4, 5]

    def processData(items):
        return [x * 2 for x in items]

    withGlobals = timeit.timeit(
        'processData(testData)',
        globals=globals(),
        number=10000
    )
    withGlobals
  exercise:
    prompt: 모범 사례 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import timeit

      testData = [1, 2, 3, 4, 5]

      def processData(items):
          return [x * 2 for x in items]

      withGlobals = timeit.timeit(
          'processData(testData)',
          globals=globals(),
          number=10000
      )
      withGlobals
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 모범 사례의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 모범 사례 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: practical
  title: 실전 활용
  structuredPrimary: true
  subtitle: 실무 벤치마킹
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    실제 코드 최적화에서 사용되는 벤치마킹 패턴들입니다.

    실무에서는 여러 방법을 비교하여 가장 빠른 방법을 선택합니다. 단, 가독성과 유지보수성도 함께 고려해야 합니다.
  snippet: |-
    import timeit

    def fibonacci1(n):
        if n <= 1:
            return n
        return fibonacci1(n-1) + fibonacci1(n-2)

    def fibonacci2(n):
        a, b = 0, 1
        for _ in range(n):
            a, b = b, a + b
        return a

    recursiveTime = timeit.timeit('fibonacci1(10)', globals=globals(), number=1000)
    iterativeTime = timeit.timeit('fibonacci2(10)', globals=globals(), number=1000)

    speedup = recursiveTime / iterativeTime
    speedup
  exercise:
    prompt: 실전 활용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import timeit

      def fibonacci1(n):
          if n <= 1:
              return n
          return fibonacci1(n-1) + fibonacci1(n-2)

      def fibonacci2(n):
          a, b = 0, 1
          for _ in range(n):
              a, b = b, a + b
          return a

      recursiveTime = timeit.timeit('fibonacci1(10)', globals=globals(), number=1000)
      iterativeTime = timeit.timeit('fibonacci2(10)', globals=globals(), number=1000)

      speedup = recursiveTime / iterativeTime
      speedup
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 실전 활용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 실전 활용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '검증 루프: 재현 가능한 벤치마크 리포트'
  structuredPrimary: true
  subtitle: 예측 → 실행 → 오류 수정 → 검증
  goal: '검증 루프: 재현 가능한 벤치마크 리포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: timeit는 한 번 빠르게 나온 숫자를 믿는 도구가 아닙니다. 같은 입력, 같은 반복 횟수, 여러 번의 측정, 최솟값 선택, 비율 검증이 함께 있어야 업무에서
    설득력 있는 성능 비교가 됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def benchmarkStatement(stmt, setup='pass', repeat=3, number=1000):
        assert repeat >= 3, 'repeat는 최소 3 이상이어야 합니다'
        assert number > 0, 'number는 양수여야 합니다'
        runs = timeit.repeat(stmt, setup=setup, repeat=repeat, number=number)
        return {
            'best': min(runs),
            'average': sum(runs) / len(runs),
            'perCallMicroseconds': min(runs) * 1_000_000 / number
        }

    listBenchmark = benchmarkStatement('list(range(100))')
    tupleBenchmark = benchmarkStatement('tuple(range(100))')

    assert listBenchmark['best'] > 0
    assert tupleBenchmark['best'] > 0
    listBenchmark
  exercise:
    prompt: '검증 루프: 재현 가능한 벤치마크 리포트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      def benchmarkStatement(stmt, setup='pass', repeat=3, number=1000):
          assert repeat >= 3, 'repeat는 최소 3 이상이어야 합니다'
          assert number > 0, 'number는 양수여야 합니다'
          runs = timeit.repeat(stmt, setup=setup, repeat=repeat, number=number)
          return {
              'best': min(runs),
              'average': sum(runs) / len(runs),
              'perCallMicroseconds': min(runs) * 1_000_000 / number
          }

      listBenchmark = benchmarkStatement('list(range(100))')
      tupleBenchmark = benchmarkStatement('tuple(range(100))')

      assert listBenchmark['best'] > 0
      assert tupleBenchmark['best'] > 0
      listBenchmark
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '검증 루프: 재현 가능한 벤치마크 리포트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '검증 루프: 재현 가능한 벤치마크 리포트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 종합 복습의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import timeit

    simple = timeit.timeit('x = 10 + 20', number=100000)
    simple
  exercise:
    prompt: 종합 복습 예제에서 \`simple\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      import timeit

      simple = timeit.timeit('x = 10 + 20', number=100000)
      simple
    hints:
    - 바꿀 지점은 \`simple = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`simple\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 종합 복습에서 \`simple\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 종합 복습 실행 뒤 \`simple\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 27_timeit-sample-summary-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - workflow_validation
    - repeat_timing
    title: 반복 측정 샘플을 재현 가능한 리포트로 요약하기
    subtitle: repeat, number, best, spread
    goal: 측정 샘플 list와 repeat, number를 받아 정렬된 결과, 최솟값, 최댓값, spread, per-loop 시간을 반환한다.
    why: 숙달 검증은 현재 PC에서 몇 초가 나왔는지가 아니라, timeit 결과를 흔들림을 고려한 리포트로 해석하는 능력을 확인합니다.
    explanation: summarize_timing_samples(samples, repeat, number)를 완성해 샘플 수와 반복 설정을 검증하고, 최솟값 중심 리포트를 dict로 반환하세요.
    tips:
    - repeat와 number가 1보다 작으면 ValueError로 막으세요.
    - 샘플 수가 repeat와 다르면 측정 조건이 불완전하므로 ValueError로 막으세요.
    exercise:
      prompt: summarize_timing_samples(samples, repeat, number)를 완성해 ordered, best, worst, spread, perLoopBestMicroseconds를
        반환하세요.
      starterCode: |-
        def summarize_timing_samples(samples, repeat, number):
            raise NotImplementedError
      solution: |-
        def summarize_timing_samples(samples, repeat, number):
            if repeat < 1 or number < 1:
                raise ValueError("repeat and number must be positive")
            if len(samples) != repeat:
                raise ValueError("sample count must match repeat")
            ordered = sorted(samples)
            best = ordered[0]
            worst = ordered[-1]
            return {
                "repeat": repeat,
                "number": number,
                "best": round(best, 6),
                "worst": round(worst, 6),
                "spread": round(worst - best, 6),
                "perLoopBestMicroseconds": round(best / number * 1_000_000, 3),
                "ordered": [round(value, 6) for value in ordered],
            }
      hints:
      - 평균보다 best를 기준으로 잡으면 일시적인 시스템 노이즈 영향을 줄일 수 있습니다.
      - per-loop 시간은 best / number에 1_000_000을 곱해 microseconds로 표현하세요.
    check:
      id: python.builtins.timeit.sample-summary.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.timeit.empty.behavior.v1.fixture
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
        entry: summarize_timing_samples
        cases:
        - id: summarizes-repeat-samples
          arguments:
          - value:
            - 0.0152
            - 0.0148
            - 0.0161
          - value: 3
          - value: 1000
          expectedReturn:
            repeat: 3
            number: 1000
            best: 0.0148
            worst: 0.0161
            spread: 0.0013
            perLoopBestMicroseconds: 14.8
            ordered:
            - 0.0148
            - 0.0152
            - 0.0161
        - id: rejects-sample-count-mismatch
          arguments:
          - value:
            - 0.01
            - 0.02
          - value: 3
          - value: 1000
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 27_timeit-candidate-comparison-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - comparing_code
    - best_practices
    title: 여러 구현 후보의 샘플을 비교해 fastest와 speedup 산출하기
    subtitle: candidate best 비교
    goal: 후보별 측정 샘플을 받아 최솟값 기준으로 fastest, slowest, speedup, summaries를 반환한다.
    why: 전이 과제에서는 한 statement 요약에서 여러 구현 비교로 옮겨, 숫자를 판단 가능한 의사결정 리포트로 바꿉니다.
    explanation: compare_benchmark_samples(candidates)를 완성해 각 후보의 best/worst/sampleCount를 만들고 best 기준으로 정렬하세요.
    tips:
    - 후보가 비어 있으면 ValueError로 막으세요.
    - speedup은 slowest best / fastest best로 계산하고 소수 둘째 자리까지 반올림하세요.
    exercise:
      prompt: compare_benchmark_samples(candidates)를 완성해 fastest, slowest, speedup, summaries를 반환하세요.
      starterCode: |-
        def compare_benchmark_samples(candidates):
            raise NotImplementedError
      solution: |-
        def compare_benchmark_samples(candidates):
            if not candidates:
                raise ValueError("candidates required")
            summaries = []
            for item in candidates:
                samples = sorted(item["samples"])
                best = samples[0]
                summaries.append({
                    "name": item["name"],
                    "best": round(best, 6),
                    "worst": round(samples[-1], 6),
                    "sampleCount": len(samples),
                })
            summaries.sort(key=lambda item: item["best"])
            fastest = summaries[0]
            slowest = summaries[-1]
            return {
                "fastest": fastest["name"],
                "slowest": slowest["name"],
                "speedup": round(slowest["best"] / fastest["best"], 2),
                "summaries": summaries,
            }
      hints:
      - 후보별 샘플은 먼저 정렬해 best와 worst를 뽑으세요.
      - 반환 summaries도 best가 빠른 순서로 정렬되어야 읽기 쉽습니다.
    check:
      id: python.builtins.timeit.candidate-comparison.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.timeit.empty.behavior.v1.fixture
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
        entry: compare_benchmark_samples
        cases:
        - id: compares-three-candidates
          arguments:
          - value:
            - name: list-comprehension
              samples:
              - 0.011
              - 0.01
              - 0.012
            - name: for-loop
              samples:
              - 0.018
              - 0.017
              - 0.019
            - name: map
              samples:
              - 0.014
              - 0.015
              - 0.013
          expectedReturn:
            fastest: list-comprehension
            slowest: for-loop
            speedup: 1.7
            summaries:
            - name: list-comprehension
              best: 0.01
              worst: 0.012
              sampleCount: 3
            - name: map
              best: 0.013
              worst: 0.015
              sampleCount: 3
            - name: for-loop
              best: 0.017
              worst: 0.019
              sampleCount: 3
        - id: rejects-empty-candidates
          arguments:
          - value: []
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 27_timeit-command-plan-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 27_timeit-candidate-comparison-transfer
    title: timeit 실행 계획에서 total execution과 setup 사용 여부 회상하기
    subtitle: stmt, setup, number, repeat
    goal: statement와 setup, number, repeat를 받아 공백 정리, setup 사용 여부, 총 실행 횟수를 반환한다.
    why: 시간이 지나도 남아야 할 timeit 감각은 측정 숫자보다, number와 repeat가 실제 실행 횟수를 어떻게 만드는지 아는 것입니다.
    explanation: plan_timeit_command(stmt, setup="", number=1000, repeat=5)를 완성해 측정 계획을 dict로 반환하고 잘못된 반복 조건은 ValueError로
      막으세요.
    tips:
    - stmt와 setup은 strip해서 리포트에 남기세요.
    - totalExecutions는 number * repeat입니다.
    exercise:
      prompt: plan_timeit_command(stmt, setup="", number=1000, repeat=5)를 완성해 totalExecutions와 usesSetup을 반환하세요.
      starterCode: |-
        def plan_timeit_command(stmt, setup="", number=1000, repeat=5):
            raise NotImplementedError
      solution: |-
        def plan_timeit_command(stmt, setup="", number=1000, repeat=5):
            if number < 1 or repeat < 1:
                raise ValueError("number and repeat must be positive")
            return {
                "stmt": stmt.strip(),
                "setup": setup.strip(),
                "number": number,
                "repeat": repeat,
                "usesSetup": bool(setup.strip()),
                "totalExecutions": number * repeat,
            }
      hints:
      - setup 문자열이 공백뿐이면 usesSetup은 False여야 합니다.
      - 반복 횟수가 커질수록 실행 시간은 number * repeat만큼 늘어납니다.
    check:
      id: python.builtins.timeit.command-plan.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.timeit.empty.behavior.v1.fixture
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
        entry: plan_timeit_command
        cases:
        - id: plans-statement-with-setup
          arguments:
          - value: ' target() '
          - value: ' from __main__ import target '
          - value: 250
          - value: 4
          expectedReturn:
            stmt: target()
            setup: from __main__ import target
            number: 250
            repeat: 4
            usesSetup: true
            totalExecutions: 1000
        - id: rejects-zero-repeat
          arguments:
          - value: target()
          - value: ''
          - value: 100
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  schemaVersion: 1
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 행동과 데이터 계약을 검증하고, 외부 package·파일 artifact가 필요한 실행은 lesson Run 및 Local
    evidence로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-existing-assessment
    solutionVerification: required
    independentReview: pending
`;export{e as default};