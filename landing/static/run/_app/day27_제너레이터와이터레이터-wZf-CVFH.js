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
  goal: next()를 한 번 부를 때마다 다음 yield까지만 실행된다는 것을 yield를 하나 더 늘려 확인한다.
  why: 결과를 한꺼번에 만들어 리스트에 담으면 데이터가 커질수록 메모리도 그만큼 필요하지만, yield로 하나씩 내주면 지금 다루는 값 하나만 들고 있으면 됩니다.
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
    prompt: |-
      yield 3 아래에 yield 4 한 줄을 추가하고, 마지막 줄 끝에 next(gen)을 하나 더 붙여 네 번 호출하게 만드세요.

      next(gen)은 부를 때마다 다음 yield까지만 실행하고 멈추므로 실행하면 (1, 2, 3, 4)가 나와야 합니다.
    starterCode: |-
      def simpleGen():
          yield 1
          yield 2
          yield 3

      gen = simpleGen()
      next(gen), next(gen), next(gen)
    solution: |-
      def simpleGen():
          yield 1
          yield 2
          yield 3
          yield 4

      gen = simpleGen()
      next(gen), next(gen), next(gen), next(gen)
    hints:
    - yield 3 다음 줄에 같은 들여쓰기로 yield 4 를 넣고, 마지막 줄을 next(gen) 네 번으로 바꿉니다. yield 개수보다 next() 를 더 많이 부르면 StopIteration 이 납니다.
    - "정답 형태: yield 4 추가, 마지막 줄 next(gen), next(gen), next(gen), next(gen)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(1, 2, 3, 4)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(1, 2, 3, 4)'"
- id: generator_expression
  title: 제너레이터 표현식
  structuredPrimary: true
  subtitle: 간결한 제너레이터 생성
  goal: 제너레이터 표현식의 반복 대상을 바꾸면 만들어지는 값 묶음이 통째로 달라지는 것을 확인한다.
  why: 대괄호를 소괄호로 바꾸는 것만으로 리스트를 미리 다 만들지 않고 필요할 때 하나씩 계산하게 되므로, 줄 수가 아주 많은 계산도 메모리를 거의 쓰지 않고 돌릴 수 있습니다.
  explanation: |-
    제너레이터 표현식은 리스트 컴프리헨션과 비슷하지만 괄호를 사용합니다. (표현식 for 변수 in 시퀀스) 형태로 작성하며, 리스트를 만들지 않고 제너레이터를 반환합니다. 대량의 데이터를 처리할 때 메모리를 절약할 수 있습니다.

    제너레이터 표현식은 sum(), max(), min() 같은 함수에 바로 전달할 수 있습니다.
  snippet: |-
    squares = (x ** 2 for x in range(5))
    list(squares)
  exercise:
    prompt: |-
      range(5)를 range(1, 6)으로 바꾸세요. 0부터가 아니라 1부터 5까지를 제곱하게 됩니다.

      실행하면 [1, 4, 9, 16, 25]가 나와야 합니다.
    starterCode: |-
      squares = (x ** 2 for x in range(5))
      list(squares)
    solution: |-
      squares = (x ** 2 for x in range(1, 6))
      list(squares)
    hints:
    - range(5) 를 range(1, 6) 으로 바꿉니다. 감싸는 소괄호와 list(squares) 줄은 그대로 둡니다.
    - "정답 형태: squares = (x ** 2 for x in range(1, 6))"
  check:
    type: outputExact
    evidence: practice
    outputExact: '[1, 4, 9, 16, 25]'
    resultCheck: "출력이 정확히 일치해야 합니다: '[1, 4, 9, 16, 25]'"
- id: iterator_basic
  title: 이터레이터 기초
  structuredPrimary: true
  subtitle: iter()와 next()
  goal: 값을 다 꺼낸 이터레이터에 next()를 한 번 더 부르면 어떻게 되는지, 기본값을 주면 어떻게 달라지는지 확인한다.
  why: for가 뒤에서 하는 일이 iter()로 이터레이터를 만들고 next()로 하나씩 꺼내는 것이라, 이 둘을 직접 써 보면 순회 도중에 멈추거나 값 하나만 미리 꺼내 보는 코드를 쓸 수 있습니다.
  explanation: |-
    이터레이터는 순회 가능한 객체입니다. iter() 함수로 이터레이터를 생성하고, next() 함수로 다음 값을 가져옵니다. 리스트, 튜플, 문자열 등 모든 시퀀스는 iter()로 이터레이터를 만들 수 있으며, 더 이상 값이 없으면 StopIteration 예외가 발생합니다.

    for 루프는 내부적으로 iter()와 next()를 사용하여 순회합니다.
  snippet: |-
    nums = [1, 2, 3]
    it = iter(nums)
    next(it), next(it), next(it)
  exercise:
    prompt: |-
      마지막 줄 끝에 next(it, 'end')를 하나 더 붙여 네 번 호출하게 만드세요. nums 리스트와 iter 줄은 그대로 둡니다.

      앞의 세 번이 1, 2, 3을 모두 꺼내 가서 네 번째에는 남은 값이 없습니다. 이때 두 번째 인자를 준 next()는 StopIteration 대신 그 기본값을 돌려주므로 실행하면 (1, 2, 3, 'end')가 나와야 합니다.
    starterCode: |-
      nums = [1, 2, 3]
      it = iter(nums)
      next(it), next(it), next(it)
    solution: |-
      nums = [1, 2, 3]
      it = iter(nums)
      next(it), next(it), next(it), next(it, 'end')
    hints:
    - "마지막 줄을 next(it), next(it), next(it), next(it, 'end') 로 바꿉니다. 기본값 없이 next(it) 를 네 번 부르면 StopIteration 이 나서 셀이 실패합니다."
    - "정답 형태: next(it), next(it), next(it), next(it, 'end')"
  check:
    type: outputExact
    evidence: practice
    outputExact: "(1, 2, 3, 'end')"
    resultCheck: "출력이 정확히 일치해야 합니다: \\"(1, 2, 3, 'end')\\""
- id: iterator_protocol
  title: 이터레이터 프로토콜
  structuredPrimary: true
  subtitle: __iter__와 __next__ 구현
  goal: list()가 StopIteration이 날 때까지 __next__를 계속 부른다는 것을 한계값을 늘려 확인한다.
  why: __iter__와 __next__ 두 개만 갖추면 직접 만든 클래스도 for나 list()에 그대로 넣을 수 있어서, 그것을 쓰는 쪽 코드는 리스트를 다룰 때와 똑같이 유지됩니다.
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
    prompt: |-
      아래에서 두 번째 줄 c = Counter(3)을 c = Counter(5)로 바꾸세요. 클래스 본문은 그대로 둡니다.

      __next__는 current가 max에 닿을 때까지 값을 하나씩 내주고 그때 StopIteration을 내며, list()는 그 신호가 올 때까지 계속 받아 갑니다. 실행하면 [1, 2, 3, 4, 5]가 나와야 합니다.
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
    solution: |-
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

      c = Counter(5)
      list(c)
    hints:
    - c = Counter(3) 의 3 을 5 로 바꿉니다. __init__, __iter__, __next__ 와 마지막 list(c) 줄은 그대로 둡니다.
    - "정답 형태: c = Counter(5)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '[1, 2, 3, 4, 5]'
    resultCheck: "출력이 정확히 일치해야 합니다: '[1, 2, 3, 4, 5]'"
- id: generator_advanced
  title: 고급 제너레이터
  structuredPrimary: true
  subtitle: 실전 활용 패턴
  goal: 끝이 없는 제너레이터에서 앞의 몇 개만 안전하게 잘라 오는 방법을 islice로 확인한다.
  why: while True로 도는 제너레이터를 list()로 통째로 바꾸면 영원히 끝나지 않으므로, 필요한 개수만큼만 잘라 내는 방법을 알아야 무한 스트림을 실제로 쓸 수 있습니다.
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
    prompt: |-
      맨 위에 import itertools 한 줄을 추가하세요. 그리고 fib = fibonacci() 아래 네 줄을 list(itertools.islice(fib, 8)) 한 줄로 바꾸세요. 지울 네 줄은 sequence = [] 부터 마지막 sequence 까지입니다.

      islice는 끝없이 도는 fib에서 앞의 8개만 꺼내 오고 거기서 멈춥니다. 실행하면 [0, 1, 1, 2, 3, 5, 8, 13]이 나와야 합니다.
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
    solution: |-
      import itertools

      def fibonacci():
          a = 0
          b = 1
          while True:
              yield a
              a, b = b, a + b

      fib = fibonacci()
      list(itertools.islice(fib, 8))
    hints:
    - fibonacci 함수 본문은 그대로 둡니다. 맨 윗줄에 import itertools 를 넣고, fib = fibonacci() 다음의 네 줄을 지운 자리에 list(itertools.islice(fib, 8)) 한 줄만 씁니다.
    - "정답 형태: list(itertools.islice(fib, 8))"
  check:
    type: outputExact
    evidence: practice
    outputExact: '[0, 1, 1, 2, 3, 5, 8, 13]'
    resultCheck: "출력이 정확히 일치해야 합니다: '[0, 1, 1, 2, 3, 5, 8, 13]'"
- id: practical_patterns
  title: 실전 패턴
  structuredPrimary: true
  subtitle: 제너레이터와 이터레이터 활용
  goal: 묶음 크기를 바꾸면 묶음 개수와 마지막 묶음의 크기가 어떻게 달라지는지 확인한다.
  why: 한 번에 보낼 수 있는 건수가 정해진 외부 서비스 호출처럼, 긴 목록을 정해진 크기로 잘라 넘겨야 하는 일이 실무에서 반복해서 나옵니다.
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
    prompt: |-
      아래에서 두 번째 줄 batchGen(collection, 3)의 묶음 크기 3을 2로 바꾸세요. 함수 본문과 collection 리스트는 그대로 둡니다.

      항목 7개를 2개씩 묶으면 마지막에 1개가 남고 그것도 함수 끝의 if chunk 덕분에 버려지지 않습니다. 실행하면 [[1, 2], [3, 4], [5, 6], [7]]이 나와야 합니다.
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
    solution: |-
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
      batches = list(batchGen(collection, 2))
      batches
    hints:
    - batchGen(collection, 3) 의 3 을 2 로 바꿉니다. def batchGen 안의 줄들과 마지막 batches 줄은 그대로 둡니다.
    - "정답 형태: batches = list(batchGen(collection, 2))"
  check:
    type: outputExact
    evidence: practice
    outputExact: '[[1, 2], [3, 4], [5, 6], [7]]'
    resultCheck: "출력이 정확히 일치해야 합니다: '[[1, 2], [3, 4], [5, 6], [7]]'"
- id: workflow_validation
  title: 실무 스트리밍 처리 루프
  structuredPrimary: true
  subtitle: 예측 → 지연 처리 → 소진 확인 → 검증
  goal: 이벤트 목록을 제너레이터로 걸러 합계를 내고, 그 제너레이터가 한 번 쓰고 나면 비어 있다는 것까지 확인한다.
  why: 로그나 이벤트는 한 번 흘러가면 되돌릴 수 없어서, 필요한 집계는 흐르는 동안 한 번에 끝내고 나중에 다시 볼 값은 그때 따로 담아 두어야 합니다.
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
    prompt: |-
      eventRows 리스트는 그대로 두고, 마지막 줄 len(eventRows)를 아래 코드로 바꾸세요. 전체 건수 대신 error 이벤트만 흘려보내 지연시간 합계를 구합니다.
      def errorEvents(rows):
          for row in rows:
              if row['level'] == 'error':
                  yield row

      errors = errorEvents(eventRows)
      errorLatency = sum(event['latencyMs'] for event in errors)
      errorLatency, list(errors)

      error는 E-3의 900과 E-5의 1100 두 건이라 합계는 2000입니다. sum()이 errors를 이미 끝까지 소진했기 때문에 그다음 list(errors)는 빈 리스트가 됩니다. 실행하면 (2000, [])가 나와야 합니다.
    starterCode: |-
      eventRows = [
          {"id": "E-1", "level": "info", "service": "api", "latencyMs": 120},
          {"id": "E-2", "level": "warning", "service": "worker", "latencyMs": 480},
          {"id": "E-3", "level": "error", "service": "api", "latencyMs": 900},
          {"id": "E-4", "level": "info", "service": "web", "latencyMs": 80},
          {"id": "E-5", "level": "error", "service": "worker", "latencyMs": 1100},
      ]

      len(eventRows)
    solution: |-
      eventRows = [
          {"id": "E-1", "level": "info", "service": "api", "latencyMs": 120},
          {"id": "E-2", "level": "warning", "service": "worker", "latencyMs": 480},
          {"id": "E-3", "level": "error", "service": "api", "latencyMs": 900},
          {"id": "E-4", "level": "info", "service": "web", "latencyMs": 80},
          {"id": "E-5", "level": "error", "service": "worker", "latencyMs": 1100},
      ]

      def errorEvents(rows):
          for row in rows:
              if row['level'] == 'error':
                  yield row

      errors = errorEvents(eventRows)
      errorLatency = sum(event['latencyMs'] for event in errors)
      errorLatency, list(errors)
    hints:
    - "len(eventRows) 한 줄을 지우고 그 자리에 errorEvents 제너레이터 함수를 정의합니다. for 안에서 row['level'] == 'error' 인 행만 yield row 하고, 그 아래에서 errors = errorEvents(eventRows) 로 스트림을 만든 뒤 sum() 으로 latencyMs 를 더합니다. 들여쓰기는 for 4칸, if 8칸, yield 12칸입니다."
    - "정답 형태: 마지막 줄 errorLatency, list(errors)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(2000, [])'
    resultCheck: "출력이 정확히 일치해야 합니다: '(2000, [])'"
- id: practice
  title: Day 27 종합 복습
  structuredPrimary: true
  subtitle: 제너레이터와 이터레이터 마스터하기
  goal: 같은 제너레이터를 두 번 순회하면 두 번째는 비어 있다는 것을 직접 확인한다.
  why: 결과를 두 번 써야 하는데 제너레이터를 그대로 넘기면 두 번째에서 에러도 없이 빈 결과가 나오므로, 다시 쓸 값은 리스트로 받아 두는 습관이 필요합니다.
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
    prompt: |-
      마지막 줄 list(generator)를 list(generator), list(generator)로 바꾸세요. 같은 제너레이터를 두 번 리스트로 만듭니다.

      첫 번째 list()가 세 값을 모두 꺼내 가면 generator에는 남은 값이 없습니다. 그래서 실행하면 ([10, 20, 30], [])가 나와야 합니다.
    starterCode: |-
      def simpleYield():
          yield 10
          yield 20
          yield 30

      generator = simpleYield()
      list(generator)
    solution: |-
      def simpleYield():
          yield 10
          yield 20
          yield 30

      generator = simpleYield()
      list(generator), list(generator)
    hints:
    - 마지막 줄 list(generator) 를 list(generator), list(generator) 로 바꿉니다. simpleYield 함수와 generator = simpleYield() 줄은 그대로 둡니다.
    - "정답 형태: list(generator), list(generator)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '([10, 20, 30], [])'
    resultCheck: "출력이 정확히 일치해야 합니다: '([10, 20, 30], [])'"
assessment:
  schemaVersion: 1
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 Python 행동을 검증하고, 파일 산출물이 있는 과제는 Local 재실행 증거를 추가로 요구합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: approved
    reviewerId: "curriculum-integrity-review"
    reviewedAt: "2026-08-02T13:06:47+09:00"
    evidenceCommit: "22505301c65a9621c9e3321759115562ffa5e136"
  masteryVariants:
  - id: day27-even-generator-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
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
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
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
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day27-chunk-generator-transfer
    title: 직접 iterator로 카운트다운 복원하기
    subtitle: 7일 뒤 기억에서 재구성
    goal: __iter__와 __next__ 상태 변화를 기억에서 구현한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
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
    minimumDelayHours: 168
`;export{e as default};