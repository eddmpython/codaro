var e=`meta:
  id: day27
  title: 제너레이터와 이터레이터
  day: 27
  category: 30days
  tags:
  - 제너레이터
  - 이터레이터
  - yield
  - 스트리밍
  - 메모리효율
  - 검증
  seo:
    title: 파이썬 제너레이터와 이터레이터 - 효율적인 순회
    description: yield, generator, iter, next, iterator protocol을 배웁니다.
    keywords:
    - 제너레이터
    - generator
    - yield
    - iterator
    - iter
    - next
intro:
  emoji: ♻️
  points:
  - yield로 제너레이터 생성
  - 메모리 효율적인 순회
  - iter()와 next() 활용
  - 이터레이터 프로토콜 구현
  direction: 제너레이터와 이터레이터에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 제너레이터와 이터레이터 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 제너레이터 기초 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: 제너레이터 표현식 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: 이터레이터 기초 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 제너레이터와 이터레이터 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 제너레이터와 이터레이터 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 제너레이터와 이터레이터 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: generator_basic
  title: 제너레이터 기초
  structuredPrimary: true
  subtitle: yield 키워드
  goal: 제너레이터 기초에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    제너레이터는 yield 키워드를 사용하여 값을 하나씩 생성하는 함수입니다. return과 달리 yield는 함수 실행을 일시 중지하고 값을 반환한 후, 다음 호출 시 중지된 지점부터 계속 실행됩니다. 모든 값을 메모리에 저장하지 않고 필요할 때마다 생성하므로 매우 효율적입니다.

    제너레이터는 한 번만 순회할 수 있습니다. 다시 순회하려면 새로 생성해야 합니다.
  snippet: |-
    def simpleGen():
        yield 1
        yield 2
        yield 3

    gen = simpleGen()
    next(gen), next(gen), next(gen)
  exercise:
    prompt: 제너레이터 기초 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def simpleGen():
          yield 1
          yield 2
          yield 3

      gen = simpleGen()
      next(gen), next(gen), next(gen)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?
      expectedValue: (직접 실행해 본 결과를 적어주세요)
  check:
    type: noError
    noError: 제너레이터 기초의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 제너레이터 기초 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: generator_expression
  title: 제너레이터 표현식
  structuredPrimary: true
  subtitle: 간결한 제너레이터 생성
  goal: 제너레이터 표현식에서 반복 대상과 반복 결과의 개수나 값 변화를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    제너레이터 표현식은 리스트 컴프리헨션과 비슷하지만 괄호를 사용합니다. (표현식 for 변수 in 시퀀스) 형태로 작성하며, 리스트를 만들지 않고 제너레이터를 반환합니다. 대량의 데이터를 처리할 때 메모리를 절약할 수 있습니다.

    제너레이터 표현식은 sum(), max(), min() 같은 함수에 바로 전달할 수 있습니다.
  snippet: |-
    squares = (x ** 2 for x in range(5))
    list(squares)
  exercise:
    prompt: 제너레이터 표현식 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      squares = (x ** 2 for x in range(5))
      list(squares)
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
    predict:
      prompt: 셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?
      expectedValue: (직접 실행해 본 결과를 적어주세요)
  check:
    type: noError
    noError: 제너레이터 표현식의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 제너레이터 표현식 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: iterator_basic
  title: 이터레이터 기초
  structuredPrimary: true
  subtitle: iter()와 next()
  goal: 이터레이터 기초에서 \`nums\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    이터레이터는 순회 가능한 객체입니다. iter() 함수로 이터레이터를 생성하고, next() 함수로 다음 값을 가져옵니다. 리스트, 튜플, 문자열 등 모든 시퀀스는 iter()로 이터레이터를 만들 수 있으며, 더 이상 값이 없으면 StopIteration 예외가 발생합니다.

    for 루프는 내부적으로 iter()와 next()를 사용하여 순회합니다.
  snippet: |-
    nums = [1, 2, 3]
    it = iter(nums)
    next(it), next(it), next(it)
  exercise:
    prompt: 이터레이터 기초 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      nums = [1, 2, 3]
      it = iter(nums)
      next(it), next(it), next(it)
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
    predict:
      prompt: 셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?
      expectedValue: (직접 실행해 본 결과를 적어주세요)
  check:
    type: noError
    noError: 이터레이터 기초에서 \`nums\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 이터레이터 기초 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: iterator_protocol
  title: 이터레이터 프로토콜
  structuredPrimary: true
  subtitle: __iter__와 __next__ 구현
  goal: 이터레이터 프로토콜에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    이터레이터 프로토콜은 __iter__와 __next__ 메서드를 구현하여 객체를 순회 가능하게 만드는 규약입니다. __iter__는 self를 반환하고, __next__는 다음 값을 반환하거나 StopIteration을 발생시킵니다. 이를 통해 사용자 정의 객체를 for 루프에서 사용할 수 있습니다.

    제너레이터는 이터레이터 프로토콜을 자동으로 구현합니다.
  snippet: |-
    class Counter:
        def __init__(self, max):
            self.max = max
            self.current = 0

        def __iter__(self):
            return self

        def __next__(self):
            if self.current < self.max:
                self.current = self.current + 1
                return self.current
            raise StopIteration

    c = Counter(3)
    list(c)
  exercise:
    prompt: 이터레이터 프로토콜 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Counter:
          def __init__(self, max):
              self.max = max
              self.current = 0

          def __iter__(self):
              return self

          def __next__(self):
              if self.current < self.max:
                  self.current = self.current + 1
                  return self.current
              raise StopIteration

      c = Counter(3)
      list(c)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 이 코드를 실행하면 어떤 예외가 발생할까요?
      expectedError: StopIteration
  check:
    type: noError
    noError: 이터레이터 프로토콜의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 이터레이터 프로토콜 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: generator_advanced
  title: 고급 제너레이터
  structuredPrimary: true
  subtitle: 실전 활용 패턴
  goal: 고급 제너레이터에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    제너레이터는 파일 읽기, 무한 시퀀스 생성, 파이프라인 처리 등 다양한 실전 상황에서 활용됩니다. 메모리를 효율적으로 사용하면서도 코드를 간결하게 유지할 수 있어 대용량 데이터 처리에 매우 유용합니다.

    여러 제너레이터를 연결하여 데이터 파이프라인을 만들 수 있습니다.
  snippet: |-
    def fibonacci():
        a = 0
        b = 1
        while True:
            yield a
            a, b = b, a + b

    fib = fibonacci()
    sequence = []
    for i in range(10):
        sequence.append(next(fib))
    sequence
  exercise:
    prompt: 고급 제너레이터 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def fibonacci():
          a = 0
          b = 1
          while True:
              yield a
              a, b = b, a + b

      fib = fibonacci()
      sequence = []
      for i in range(10):
          sequence.append(next(fib))
      sequence
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 셀 마지막 표현식의 값은 어떻게 표시될까요?
      expectedValue: (직접 실행해 본 값을 적어주세요)
  check:
    type: noError
    noError: 고급 제너레이터의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 고급 제너레이터 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: practical_patterns
  title: 실전 패턴
  structuredPrimary: true
  subtitle: 제너레이터와 이터레이터 활용
  goal: 실전 패턴에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    제너레이터와 이터레이터는 실무에서 대용량 파일 처리, 배치 처리, 스트리밍 데이터 처리 등에 활용됩니다. 메모리를 절약하면서도 깔끔한 코드를 작성할 수 있어 파이썬의 강력한 기능 중 하나입니다.

    제너레이터는 필요한 만큼만 값을 생성하므로 대용량 데이터 처리에 이상적입니다.
  snippet: |-
    def batchGen(elements, size):
        chunk = []
        for item in elements:
            chunk.append(item)
            if len(chunk) == size:
                yield chunk
                chunk = []
        if chunk:
            yield chunk

    collection = [1, 2, 3, 4, 5, 6, 7]
    batches = list(batchGen(collection, 3))
    batches
  exercise:
    prompt: 실전 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def batchGen(elements, size):
          chunk = []
          for item in elements:
              chunk.append(item)
              if len(chunk) == size:
                  yield chunk
                  chunk = []
          if chunk:
              yield chunk

      collection = [1, 2, 3, 4, 5, 6, 7]
      batches = list(batchGen(collection, 3))
      batches
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 셀 마지막 표현식의 값은 어떻게 표시될까요?
      expectedValue: (직접 실행해 본 값을 적어주세요)
  check:
    type: noError
    noError: 실전 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 실전 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: 실무 스트리밍 처리 루프
  structuredPrimary: true
  subtitle: 예측 → 지연 처리 → 소진 확인 → 검증
  goal: 실무 스트리밍 처리 루프에서 \`eventRows\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    제너레이터는 단순히 yield를 쓰는 문법이 아니라, 로그나 이벤트처럼 많은 데이터를 한 번에 메모리에 올리지 않고 필요한 만큼만 처리하는 방식입니다. 실행 전에는 어떤 이벤트가 통과할지 예측하고, 제너레이터가 한 번 소진되면 다시 쓸 수 없다는 점까지 검증해야 합니다.

    제너레이터는 대용량 데이터에서 강력하지만 한 번 흘러간 스트림은 다시 읽을 수 없습니다. 필요한 결과는 리스트나 파일로 남기고, 검증은 작은 샘플 스트림으로 먼저 통과시키세요.
  snippet: |-
    eventRows = [
        {"id": "E-1", "level": "info", "service": "api", "latencyMs": 120},
        {"id": "E-2", "level": "warning", "service": "worker", "latencyMs": 480},
        {"id": "E-3", "level": "error", "service": "api", "latencyMs": 900},
        {"id": "E-4", "level": "info", "service": "web", "latencyMs": 80},
        {"id": "E-5", "level": "error", "service": "worker", "latencyMs": 1100},
    ]

    len(eventRows)
  exercise:
    prompt: 실무 스트리밍 처리 루프 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      eventRows = [
          {"id": "E-1", "level": "info", "service": "api", "latencyMs": 120},
          {"id": "E-2", "level": "warning", "service": "worker", "latencyMs": 480},
          {"id": "E-3", "level": "error", "service": "api", "latencyMs": 900},
          {"id": "E-4", "level": "info", "service": "web", "latencyMs": 80},
          {"id": "E-5", "level": "error", "service": "worker", "latencyMs": 1100},
      ]

      len(eventRows)
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
    predict:
      prompt: 셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?
      expectedValue: (직접 실행해 본 결과를 적어주세요)
  check:
    type: noError
    noError: 실무 스트리밍 처리 루프에서 \`eventRows\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 실무 스트리밍 처리 루프 실행 뒤 \`eventRows\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: practice
  title: Day 27 종합 복습
  structuredPrimary: true
  subtitle: 제너레이터와 이터레이터 마스터하기
  goal: Day 27 종합 복습에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: Day 27에서 배운 제너레이터와 이터레이터를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def simpleYield():
        yield 10
        yield 20
        yield 30

    generator = simpleYield()
    list(generator)
  exercise:
    prompt: Day 27 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def simpleYield():
          yield 10
          yield 20
          yield 30

      generator = simpleYield()
      list(generator)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?
      expectedValue: (직접 실행해 본 결과를 적어주세요)
  check:
    type: noError
    noError: Day 27 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: Day 27 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: day27-even-generator-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - generator_basic
    - practice
    title: yield로 짝수 흐름 만들기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: generator를 소비한 결과가 필요한 값만 포함하게 한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: even_values(limit)가 0 이상 limit 미만의 짝수를 generator로 만들고 목록으로 반환하도록 완성하세요.
      starterCode: |-
        def even_values(limit):
            raise NotImplementedError
      solution: |-
        def even_values(limit):
            def generate():
                for value in range(limit):
                    if value % 2 == 0:
                        yield value
            return list(generate())
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day27.even-generator.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day27.even-generator.mastery.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: even_values
        cases:
        - id: six
          arguments:
          - value: 6
          expectedReturn:
          - 0
          - 2
          - 4
        - id: one
          arguments:
          - value: 1
          expectedReturn:
          - 0
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day27-chunk-generator-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - day27-even-generator-mastery
    title: 목록을 일정 크기 묶음으로 지연 생성하기
    subtitle: 처음 보는 조건에 개념 적용
    goal: yield를 배치 처리 문맥에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: chunk_values(items, size)가 generator로 만든 묶음을 목록으로 반환하도록 완성하세요.
      starterCode: |-
        def chunk_values(items, size):
            raise NotImplementedError
      solution: |-
        def chunk_values(items, size):
            def chunks():
                for start in range(0, len(items), size):
                    yield items[start:start + size]
            return list(chunks())
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day27.chunk-generator.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day27.chunk-generator.transfer.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: chunk_values
        cases:
        - id: even
          arguments:
          - value:
            - 1
            - 2
            - 3
            - 4
          - value: 2
          expectedReturn:
          - - 1
            - 2
          - - 3
            - 4
        - id: remainder
          arguments:
          - value:
            - a
            - b
            - c
          - value: 2
          expectedReturn:
          - - a
            - b
          - - c
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day27-countdown-iterator-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - day27-even-generator-mastery
    title: 직접 iterator로 카운트다운 복원하기
    subtitle: 하루 뒤 기억에서 재구성
    goal: __iter__와 __next__ 상태 변화를 기억에서 구현한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: Countdown과 countdown_values(start)를 완성해 start부터 1까지 목록을 반환하세요.
      starterCode: |-
        class Countdown:
            pass

        def countdown_values(start):
            raise NotImplementedError
      solution: |-
        class Countdown:
            def __init__(self, start):
                self.current = start

            def __iter__(self):
                return self

            def __next__(self):
                if self.current <= 0:
                    raise StopIteration
                value = self.current
                self.current -= 1
                return value

        def countdown_values(start):
            return list(Countdown(start))
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day27.countdown-iterator.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day27.countdown-iterator.retrieval.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: countdown_values
        cases:
        - id: three
          arguments:
          - value: 3
          expectedReturn:
          - 3
          - 2
          - 1
        - id: zero
          arguments:
          - value: 0
          expectedReturn: []
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};