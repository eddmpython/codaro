var e=`meta:
  id: 07_functools
  title: functools - 함수형 프로그래밍
  category: builtins
  tags:
  - functools
  - partial
  - reduce
  - lru_cache
  - wraps
  seo:
    title: 파이썬 functools 모듈 완전 정복
    description: functools 모듈의 partial, reduce, lru_cache, wraps 등 함수형 프로그래밍 도구를 배웁니다.
    keywords:
    - functools
    - partial
    - reduce
    - lru_cache
    - 데코레이터
    - 함수형프로그래밍
intro:
  emoji: 🔧
  points:
  - partial로 함수 인자 고정
  - reduce로 누적 연산
  - lru_cache로 성능 최적화
  - wraps로 데코레이터 작성
  direction: functools 함수형 프로그래밍에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - functools 함수형 프로그래밍 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: functools 모듈 불러오 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: partial 부분 적용 함수 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: reduce 누적 연산 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: functools 함수형 프로 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: functools 함수형 프로 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: functools 함수형 프로 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- id: module_import
  title: functools 모듈 불러오기
  structuredPrimary: true
  subtitle: ⚠️ 가장 먼저 실행하세요
  goal: from functools import로 가져온 이름 하나를 실제로 호출해 쓸 수 있는 상태인지 확인한다.
  why: functools는 partial, reduce, lru_cache처럼 필요한 이름만 골라 가져오는 모듈이라 목록에서 빠뜨린 이름은 아래 섹션에서 NameError가 되고, 이 셀을 먼저 실행해야 나머지 예제가 같은 이름을 공유합니다.
  explanation: |-
    functools는 파이썬 표준 라이브러리입니다. 함수를 인자로 받거나 함수를 돌려주는 고차 함수 도구를 모아 둔 모듈이며, 별도 설치 없이 import만으로 사용할 수 있습니다.

    이 셀에서 가져오는 다섯 이름 partial, reduce, lru_cache, wraps, total_ordering이 아래 모든 예제의 재료입니다. 목록에서 빠진 이름은 아래에서 바로 NameError가 납니다.
  snippet: |-
    from functools import partial, reduce, lru_cache, wraps, total_ordering

    # 가져온 이름이 실제로 도는지 확인
    'functools 모듈이 정상적으로 로드되었습니다'
  exercise:
    prompt: |-
      마지막 줄의 문장은 로드되었다고 주장할 뿐 가져온 이름을 하나도 쓰지 않습니다. 마지막 줄 'functools 모듈이 정상적으로 로드되었습니다'를 partial(pow, 2)(10)으로 바꿔 가져온 이름을 직접 호출해 보세요. 첫 줄 import는 그대로 둡니다.

      partial(pow, 2)는 pow의 첫 인자를 2로 고정한 함수이므로 여기에 10을 넘기면 2의 10제곱인 1024가 나와야 합니다.
    starterCode: |-
      from functools import partial, reduce, lru_cache, wraps, total_ordering

      # 가져온 이름이 실제로 도는지 확인
      'functools 모듈이 정상적으로 로드되었습니다'
    solution: |-
      from functools import partial, reduce, lru_cache, wraps, total_ordering

      # 가져온 이름이 실제로 도는지 확인
      partial(pow, 2)(10)
    hints:
    - 마지막 줄의 문자열을 지우고 그 자리에 partial(pow, 2)(10) 을 씁니다. 괄호가 두 번 나오는데 앞은 함수를 만드는 호출이고 뒤는 만든 함수를 부르는 호출입니다.
    - "정답 형태: partial(pow, 2)(10)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '1024'
    resultCheck: "출력이 정확히 일치해야 합니다: '1024'"
- id: partial
  title: partial - 부분 적용 함수
  structuredPrimary: true
  subtitle: 인자를 미리 고정하기
  goal: 같은 함수에서 인자를 다르게 고정한 함수 두 개를 만들어 한 번에 비교한다.
  why: 설정값만 다른 호출을 매번 손으로 적으면 값이 코드 곳곳에 흩어져 한 곳만 고치는 실수가 나는데, partial로 미리 고정해 두면 설정은 이름에 붙고 호출부에는 실제로 달라지는 값만 남습니다.
  explanation: |-
    partial은 함수의 앞쪽 인자를 미리 채운 새 함수를 만듭니다. 원본 함수는 그대로 남아 있으므로 다른 곳에서 계속 쓸 수 있고, 만들어진 함수는 나머지 인자만 받습니다.

    콜백처럼 인자를 하나만 넘길 수 있는 자리에 설정값까지 함께 실어 보내야 할 때 특히 자주 쓰입니다. lambda x: multiply(2, x)로도 되지만 partial(multiply, 2)는 무엇을 고정했는지가 값으로 남습니다.
  snippet: |-
    def multiply(x, y):
        return x * y

    double = partial(multiply, 2)
    output = double(5)
    output
  exercise:
    prompt: |-
      double 아래에 triple = partial(multiply, 3) 한 줄을 추가하고, output = double(5)를 output = (double(5), triple(5))로 바꾸세요. def multiply는 그대로 둡니다.

      함수 하나에서 2배 함수와 3배 함수를 각각 만들어 같은 5에 적용하는 것이므로 (10, 15)가 나와야 합니다.
    starterCode: |-
      def multiply(x, y):
          return x * y

      double = partial(multiply, 2)
      output = double(5)
      output
    solution: |-
      def multiply(x, y):
          return x * y

      double = partial(multiply, 2)
      triple = partial(multiply, 3)
      output = (double(5), triple(5))
      output
    hints:
    - partial(multiply, 2) 줄을 그대로 흉내 내 한 줄 더 만들고 고정할 값만 3 으로 바꿉니다.
    - "정답 형태: output = (double(5), triple(5))"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(10, 15)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(10, 15)'"
- id: reduce
  title: reduce - 누적 연산
  structuredPrimary: true
  subtitle: 반복 가능한 객체 축소하기
  goal: 덧셈 누적을 곱셈 누적으로 바꾸고 초기값 인자까지 붙여 본다.
  why: 합계는 sum()이 이미 있어 reduce로 쓸 이유가 없고, reduce가 필요한 자리는 전용 함수가 없는 접기입니다. 초기값을 함께 주면 목록이 비었을 때 TypeError로 죽는 대신 그 값이 결과가 됩니다.
  explanation: |-
    reduce는 값 두 개를 받는 함수를 왼쪽부터 차례로 접어 하나의 값으로 줄입니다. 함수의 첫 인자는 지금까지의 누적값이고 둘째 인자는 다음 항목입니다.

    세 번째 인자로 초기값을 주면 그 값에서 접기를 시작합니다. 목록이 비어 있어도 초기값이 그대로 결과가 되므로 빈 입력에서 죽지 않습니다. 합계, 최댓값, 최솟값은 sum(), max(), min()이 더 명확하니 reduce는 그것들로 표현되지 않는 누적에만 씁니다.
  snippet: |-
    seq = [1, 2, 3, 4, 5]
    total = reduce(lambda x, y: x + y, seq)
    total
  exercise:
    prompt: |-
      합계는 sum(seq) 한 줄이면 되므로 여기서 reduce를 쓸 이유가 없습니다. lambda x, y: x + y를 lambda x, y: x * y로 바꾸고, seq 뒤에 초기값 1을 인자로 추가하세요.

      1부터 5까지 모두 곱하면 120이고 초기값 1은 곱셈의 항등원이라 결과를 바꾸지 않으므로 120이 나와야 합니다.
    starterCode: |-
      seq = [1, 2, 3, 4, 5]
      total = reduce(lambda x, y: x + y, seq)
      total
    solution: |-
      seq = [1, 2, 3, 4, 5]
      total = reduce(lambda x, y: x * y, seq, 1)
      total
    hints:
    - 람다 본문의 + 를 * 로 바꾸고, reduce(..., seq, 1) 처럼 seq 뒤에 쉼표와 1 을 붙입니다.
    - "정답 형태: total = reduce(lambda x, y: x * y, seq, 1)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '120'
    resultCheck: "출력이 정확히 일치해야 합니다: '120'"
- id: lru_cache
  title: lru_cache - 메모이제이션
  structuredPrimary: true
  subtitle: 함수 결과 캐싱하기
  goal: 캐시가 실제로 일했는지를 걸린 시간이 아니라 cache_info()의 hit와 miss 수로 확인한다.
  why: 캐시를 붙였다는 사실만으로는 효과를 알 수 없고 실행 시간은 잴 때마다 달라져 증거가 되지 못하므로, 같은 인자로 다시 부른 횟수가 hits로 잡히는지 보는 것이 유일하게 재현되는 확인입니다.
  explanation: |-
    lru_cache는 함수 호출 결과를 인자별로 저장해 두고 같은 인자가 다시 들어오면 함수 본문을 실행하지 않고 저장된 값을 돌려줍니다. 직접 dict를 만들어 저장해도 되지만 그러면 저장, 조회, 크기 제한을 전부 손으로 관리해야 합니다.

    cache_info()는 hits(저장된 값을 쓴 횟수), misses(본문을 실제로 실행한 횟수), currsize(지금 저장된 개수)를 알려 줍니다. 캐시가 일했다는 증거는 여기에 있습니다.
  snippet: |-
    @lru_cache(maxsize=128)
    def fibonacci(n):
        if n < 2:
            return n
        return fibonacci(n - 1) + fibonacci(n - 2)

    fib10 = fibonacci(10)
    fib10
  exercise:
    prompt: |-
      fib10만 보면 캐시가 일했는지 알 수 없습니다. fib10 줄 아래에 cacheInfo = fibonacci.cache_info() 한 줄을 추가하고, 마지막 줄 fib10을 (fib10, cacheInfo.hits, cacheInfo.misses)로 바꾸세요.

      fibonacci(10)은 0부터 10까지 열한 개의 인자를 각각 한 번씩만 계산하고 나머지 여덟 번은 저장된 값을 쓰므로 (55, 8, 11)이 나와야 합니다.
    starterCode: |-
      @lru_cache(maxsize=128)
      def fibonacci(n):
          if n < 2:
              return n
          return fibonacci(n - 1) + fibonacci(n - 2)

      fib10 = fibonacci(10)
      fib10
    solution: |-
      @lru_cache(maxsize=128)
      def fibonacci(n):
          if n < 2:
              return n
          return fibonacci(n - 1) + fibonacci(n - 2)

      fib10 = fibonacci(10)
      cacheInfo = fibonacci.cache_info()
      (fib10, cacheInfo.hits, cacheInfo.misses)
    hints:
    - cache_info() 는 감싼 함수 이름 뒤에 붙여 부릅니다. fibonacci.cache_info() 를 변수에 담아 두면 hits 와 misses 를 같은 시점 기준으로 읽습니다.
    - "정답 형태: (fib10, cacheInfo.hits, cacheInfo.misses)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(55, 8, 11)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(55, 8, 11)'"
- id: wraps
  title: wraps - 데코레이터 작성
  structuredPrimary: true
  subtitle: 함수 메타데이터 보존하기
  goal: 데코레이터를 씌운 함수의 __name__이 래퍼 이름으로 바뀐 것을 보고 @wraps로 되돌린다.
  why: 로그와 오류 추적은 함수의 __name__을 그대로 찍기 때문에 @wraps를 빼면 데코레이터를 쓴 모든 함수가 wrapper라는 같은 이름으로 기록되어, 장애가 났을 때 어느 함수였는지 로그만으로는 구분할 수 없습니다.
  explanation: |-
    데코레이터는 원본 함수를 안쪽 wrapper 함수로 바꿔치기합니다. 그래서 이름을 물어보면 원본이 아니라 wrapper라고 답합니다. 호출은 정상이지만 정체가 가려진 상태입니다.

    functools.wraps를 wrapper 위에 붙이면 원본의 __name__과 __doc__을 wrapper로 복사해 이 바꿔치기를 감춥니다. 데코레이터를 만들 때 사실상 항상 붙인다고 생각하면 됩니다.
  snippet: |-
    def announce(func):
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper

    @announce
    def buildReport():
        return '리포트 완료'

    buildReport.__name__, buildReport()
  exercise:
    prompt: |-
      지금 buildReport.__name__은 원본 이름이 아니라 wrapper라고 답합니다. def wrapper 바로 윗줄에 @wraps(func) 한 줄을 넣으세요. 다른 줄은 그대로 둡니다.

      이름만 원본으로 돌아오고 호출 결과는 원래대로 전달되므로 ('buildReport', '리포트 완료')가 나와야 합니다.
    starterCode: |-
      def announce(func):
          def wrapper(*args, **kwargs):
              return func(*args, **kwargs)
          return wrapper

      @announce
      def buildReport():
          return '리포트 완료'

      buildReport.__name__, buildReport()
    solution: |-
      def announce(func):
          @wraps(func)
          def wrapper(*args, **kwargs):
              return func(*args, **kwargs)
          return wrapper

      @announce
      def buildReport():
          return '리포트 완료'

      buildReport.__name__, buildReport()
    hints:
    - 붙일 자리는 데코레이터 안쪽 def wrapper 바로 위입니다. 감쌀 대상인 func 를 인자로 받습니다.
    - "정답 형태: def wrapper 위에 @wraps(func) 추가"
  check:
    type: outputExact
    evidence: practice
    outputExact: "('buildReport', '리포트 완료')"
    resultCheck: "출력이 정확히 일치해야 합니다: ('buildReport', '리포트 완료')"
- id: ordering
  title: total_ordering - 비교 연산자
  structuredPrimary: true
  subtitle: 클래스에 순서 부여하기
  goal: 두 점수를 같게 만들어 자동 생성된 크다와 크거나 같다가 동점에서 다르게 답하는 자리를 확인한다.
  why: 동점 처리는 순위표와 우선순위 큐에서 가장 자주 어긋나는 지점이고, total_ordering은 __eq__와 __lt__ 두 개만 보고 나머지를 유도하므로 __eq__를 대충 쓰면 크거나 같다까지 함께 틀립니다.
  explanation: |-
    total_ordering은 클래스에 __eq__와 순서 비교 하나만 정의하면 나머지 비교 연산자를 자동으로 만들어 줍니다. 여섯 개를 직접 쓰다가 한 개만 반대로 적는 사고를 막아 줍니다.

    유도 규칙을 알아 두면 결과를 예측할 수 있습니다. a >= b는 "a가 b보다 작지 않다"로, a > b는 "작지도 같지도 않다"로 만들어집니다. 그래서 두 값이 같을 때 크다는 False, 크거나 같다는 True가 됩니다.
  snippet: |-
    @total_ordering
    class Student:
        def __init__(self, name, score):
            self.name = name
            self.score = score
        def __eq__(self, other):
            return self.score == other.score
        def __lt__(self, other):
            return self.score < other.score

    alice = Student('Alice', 90)
    bob = Student('Bob', 85)
    alice > bob
  exercise:
    prompt: |-
      Student('Bob', 85)의 점수 85를 90으로 바꿔 alice와 동점으로 만들고, 마지막 줄 alice > bob을 (alice == bob, alice > bob, alice >= bob)으로 바꾸세요. 클래스 본문은 그대로 둡니다.

      직접 쓴 것은 __eq__와 __lt__뿐이지만 나머지 두 비교는 자동으로 만들어졌고 동점에서 서로 다르게 답하므로 (True, False, True)가 나와야 합니다.
    starterCode: |-
      @total_ordering
      class Student:
          def __init__(self, name, score):
              self.name = name
              self.score = score
          def __eq__(self, other):
              return self.score == other.score
          def __lt__(self, other):
              return self.score < other.score

      alice = Student('Alice', 90)
      bob = Student('Bob', 85)
      alice > bob
    solution: |-
      @total_ordering
      class Student:
          def __init__(self, name, score):
              self.name = name
              self.score = score
          def __eq__(self, other):
              return self.score == other.score
          def __lt__(self, other):
              return self.score < other.score

      alice = Student('Alice', 90)
      bob = Student('Bob', 90)
      (alice == bob, alice > bob, alice >= bob)
    hints:
    - 고칠 곳은 두 군데입니다. bob 의 점수 숫자와 마지막 줄입니다. 마지막 줄은 비교 세 개를 쉼표로 묶어 괄호에 넣습니다.
    - "정답 형태: (alice == bob, alice > bob, alice >= bob)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(True, False, True)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(True, False, True)'"
- id: practical
  title: 실전 활용
  structuredPrimary: true
  subtitle: functools 실무 패턴
  goal: 인자를 받는 데코레이터의 재시도 예산을 몇 번으로 잡아야 성공하는지 코드를 읽고 계산한다.
  why: 재시도 예산은 크게 잡으면 장애가 났을 때 응답이 그만큼 늦어지고 작게 잡으면 회복 가능한 실패까지 포기하므로, 실패가 몇 번까지 이어지는지 근거를 세고 숫자를 정해야 합니다.
  explanation: |-
    retry(times)처럼 설정을 받는 데코레이터는 함수가 세 겹입니다. 바깥 retry는 설정을 받고, 가운데 decorator는 감쌀 함수를 받고, 안쪽 wrapper가 실제 호출을 감쌉니다. @wraps는 가장 안쪽 wrapper 위에 붙습니다.

    여기서 loadQuota는 실패 기록이 세 건 쌓일 때까지 RuntimeError를 냅니다. 실패마다 attemptLog에 줄이 남으므로 몇 번 만에 넘어갔는지 결과에서 바로 셀 수 있습니다.
  snippet: |-
    attemptLog = []

    def retry(times):
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                for attempt in range(1, times + 1):
                    try:
                        return func(*args, **kwargs)
                    except RuntimeError:
                        attemptLog.append(f'{attempt}회 실패')
                return '재시도 포기'
            return wrapper
        return decorator

    @retry(2)
    def loadQuota():
        if len(attemptLog) < 3:
            raise RuntimeError('일시적 오류')
        return '조회 성공'

    loadQuota(), attemptLog
  exercise:
    prompt: |-
      @retry(2)는 두 번만 시도하고 포기합니다. loadQuota는 attemptLog에 실패가 세 건 쌓인 뒤부터 성공하므로, 성공을 볼 수 있는 최소 예산으로 @retry의 숫자를 올리세요. 다른 줄은 그대로 둡니다.

      세 번 실패한 다음 시도가 성공하고 실패 기록 세 건이 남으므로 ('조회 성공', ['1회 실패', '2회 실패', '3회 실패'])가 나와야 합니다.
    starterCode: |-
      attemptLog = []

      def retry(times):
          def decorator(func):
              @wraps(func)
              def wrapper(*args, **kwargs):
                  for attempt in range(1, times + 1):
                      try:
                          return func(*args, **kwargs)
                      except RuntimeError:
                          attemptLog.append(f'{attempt}회 실패')
                  return '재시도 포기'
              return wrapper
          return decorator

      @retry(2)
      def loadQuota():
          if len(attemptLog) < 3:
              raise RuntimeError('일시적 오류')
          return '조회 성공'

      loadQuota(), attemptLog
    solution: |-
      attemptLog = []

      def retry(times):
          def decorator(func):
              @wraps(func)
              def wrapper(*args, **kwargs):
                  for attempt in range(1, times + 1):
                      try:
                          return func(*args, **kwargs)
                      except RuntimeError:
                          attemptLog.append(f'{attempt}회 실패')
                  return '재시도 포기'
              return wrapper
          return decorator

      @retry(4)
      def loadQuota():
          if len(attemptLog) < 3:
              raise RuntimeError('일시적 오류')
          return '조회 성공'

      loadQuota(), attemptLog
    hints:
    - 실패 조건 len(attemptLog) < 3 을 먼저 읽고 몇 번째 시도부터 성공하는지 손으로 세어 봅니다. 실패 세 번 뒤가 답입니다.
    - "정답 형태: @retry(4)"
  check:
    type: outputExact
    evidence: practice
    outputExact: "('조회 성공', ['1회 실패', '2회 실패', '3회 실패'])"
    resultCheck: "출력이 정확히 일치해야 합니다: ('조회 성공', ['1회 실패', '2회 실패', '3회 실패'])"
- id: workflow_validation
  title: '검증 루프: 함수형 업무 파이프라인'
  structuredPrimary: true
  subtitle: partial, reduce, cache, wraps 검증
  goal: partial로 고정한 할인율을 바꾸고 그에 맞춰 assert 두 줄의 기대값까지 함께 고친다.
  why: 계산 규칙을 바꾸면 기대값도 같이 바뀌어야 하는데 assert를 그대로 두면 옛 기준에 맞춰 실패하므로, 규칙과 검증을 한 번에 같이 옮기는 습관이 집계 코드에서 가장 중요합니다.
  explanation: |-
    주문 집계는 줄마다 같은 규칙을 적용한 뒤 하나로 접는 형태입니다. 규칙은 partial로 고정하고, 접기는 reduce로 하고, 결과는 assert로 못 박습니다. 이 셋이 갖춰지면 규칙을 바꿔도 어디가 어긋났는지 실행 즉시 드러납니다.

    변주 실험
    orderRows에 수량 0인 줄을 추가하고 lineTotals와 orderTotal이 어떻게 달라지는지, assert 기대값을 어디까지 고쳐야 하는지 확인하세요.
  tips:
  - 변주 실험 orderRows에 수량 0인 줄을 추가하고 lineTotals와 orderTotal이 어떻게 달라지는지, assert 기대값을 어디까지 고쳐야 하는지 확인하세요.
  snippet: |-
    orderRows = [
        {'item': '키보드', 'qty': 2, 'price': 39000},
        {'item': '모니터', 'qty': 1, 'price': 259000},
        {'item': '마우스', 'qty': 3, 'price': 15000},
    ]

    def lineTotal(row, discountRate):
        return round(row['qty'] * row['price'] * (1 - discountRate), 2)

    memberTotal = partial(lineTotal, discountRate=0.0)

    lineTotals = [memberTotal(row) for row in orderRows]
    orderTotal = reduce(lambda acc, value: acc + value, lineTotals, 0)

    assert lineTotals == [78000.0, 259000.0, 45000.0]
    assert orderTotal == 382000.0
    assert len(lineTotals) == len(orderRows)

    {'lines': lineTotals, 'total': orderTotal}
  exercise:
    prompt: |-
      지금은 할인율이 0이라 정가 그대로 집계됩니다. discountRate=0.0을 discountRate=0.1로 바꾸고, 첫 assert의 기대 리스트를 [70200.0, 233100.0, 40500.0]으로, 둘째 assert의 합계를 343800.0으로 함께 고치세요. 셋째 assert는 그대로 둡니다.

      줄마다 10%를 깎은 금액이 나오고 그 합이 총액이 되므로 {'lines': [70200.0, 233100.0, 40500.0], 'total': 343800.0}이 나와야 합니다.
    starterCode: |-
      orderRows = [
          {'item': '키보드', 'qty': 2, 'price': 39000},
          {'item': '모니터', 'qty': 1, 'price': 259000},
          {'item': '마우스', 'qty': 3, 'price': 15000},
      ]

      def lineTotal(row, discountRate):
          return round(row['qty'] * row['price'] * (1 - discountRate), 2)

      memberTotal = partial(lineTotal, discountRate=0.0)

      lineTotals = [memberTotal(row) for row in orderRows]
      orderTotal = reduce(lambda acc, value: acc + value, lineTotals, 0)

      assert lineTotals == [78000.0, 259000.0, 45000.0]
      assert orderTotal == 382000.0
      assert len(lineTotals) == len(orderRows)

      {'lines': lineTotals, 'total': orderTotal}
    solution: |-
      orderRows = [
          {'item': '키보드', 'qty': 2, 'price': 39000},
          {'item': '모니터', 'qty': 1, 'price': 259000},
          {'item': '마우스', 'qty': 3, 'price': 15000},
      ]

      def lineTotal(row, discountRate):
          return round(row['qty'] * row['price'] * (1 - discountRate), 2)

      memberTotal = partial(lineTotal, discountRate=0.1)

      lineTotals = [memberTotal(row) for row in orderRows]
      orderTotal = reduce(lambda acc, value: acc + value, lineTotals, 0)

      assert lineTotals == [70200.0, 233100.0, 40500.0]
      assert orderTotal == 343800.0
      assert len(lineTotals) == len(orderRows)

      {'lines': lineTotals, 'total': orderTotal}
    hints:
    - 고칠 곳은 세 군데입니다. partial 의 discountRate 값, 첫 assert 의 리스트, 둘째 assert 의 합계입니다.
    - "정답 형태: memberTotal = partial(lineTotal, discountRate=0.1)"
  check:
    type: outputExact
    evidence: practice
    outputExact: "{'lines': [70200.0, 233100.0, 40500.0], 'total': 343800.0}"
    resultCheck: "출력이 정확히 일치해야 합니다: {'lines': [70200.0, 233100.0, 40500.0], 'total': 343800.0}"
- id: practice
  title: functools 모듈 종합 복습
  structuredPrimary: true
  subtitle: 함수형 프로그래밍 마스터하기
  goal: partial로 reduce의 접는 함수 자리를 고정해 목록만 넘기면 되는 합계 함수를 만든다.
  why: partial이 고정할 수 있는 것은 숫자 같은 값만이 아니라 함수 인자도 포함되므로, 고차 함수의 앞자리를 미리 채워 두면 호출부에 데이터만 남는 작은 유틸리티를 만들 수 있습니다.
  explanation: |-
    이 레슨의 도구를 이어 붙이는 마지막 연습입니다. reduce(add, 목록)은 add로 목록을 접고, partial(reduce, add)는 그 reduce에서 접는 함수 자리를 add로 미리 채운 새 함수입니다.

    남는 자리는 목록 하나뿐이라 sumAll(목록) 형태로 부를 수 있습니다. 앞 섹션에서 partial에 값을 고정했다면 여기서는 함수를 고정합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def add(a, b):
        return a + b

    add5 = partial(add, 5)
    add5(3)
  exercise:
    prompt: |-
      add5 = partial(add, 5)와 add5(3) 두 줄을 지우고, 그 자리에 sumAll = partial(reduce, add)와 sumAll([1, 2, 3, 4, 5])를 쓰세요. def add는 그대로 둡니다.

      partial이 reduce의 첫 인자인 접는 함수를 add로 고정했으므로 목록만 넘기면 1부터 5까지의 합인 15가 나와야 합니다.
    starterCode: |-
      def add(a, b):
          return a + b

      add5 = partial(add, 5)
      add5(3)
    solution: |-
      def add(a, b):
          return a + b

      sumAll = partial(reduce, add)
      sumAll([1, 2, 3, 4, 5])
    hints:
    - partial 의 첫 인자는 고정 대상 함수입니다. 여기서는 reduce 자체를 고정 대상으로 삼고 그 뒤에 접는 함수 add 를 채웁니다.
    - "정답 형태: sumAll = partial(reduce, add)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '15'
    resultCheck: "출력이 정확히 일치해야 합니다: '15'"
assessment:
  masteryVariants:
  - id: 07_functools-currency-orders-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - partial
    - workflow_validation
    - practice
    title: 통화별 주문 금액을 원화로 변환하기
    subtitle: partial로 환율과 수수료 고정
    goal: 주문 행에서 특정 통화만 골라 고정된 환율과 수수료로 KRW 값과 합계를 반환한다.
    why: partial은 같은 변환 규칙을 여러 행에 재사용할 때 설정값을 함수 호출마다 반복하지 않게 해줍니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 주문 목록과 환율표로 다시 호출합니다.
    tips:
    - convert_to_krw에 currency, fee_rate, rates를 partial로 고정하세요.
    - 반환값은 변환된 개별 값과 합계를 모두 담아야 합니다.
    exercise:
      prompt: summarize_currency_orders(rows, currency, fee_rate, rates)가 currency, count, values, totalKrw를 담은 dict를 반환하도록
        완성하세요.
      starterCode: |-
        def summarize_currency_orders(rows, currency, fee_rate, rates):
            raise NotImplementedError
      solution: |-
        from functools import partial

        def convert_to_krw(amount, currency, fee_rate, rates):
            return round(amount * rates[currency] * (1 + fee_rate), 2)

        def summarize_currency_orders(rows, currency, fee_rate, rates):
            converter = partial(convert_to_krw, currency=currency, fee_rate=fee_rate, rates=rates)
            converted = [converter(row["amount"]) for row in rows if row["currency"] == currency]
            return {
                "currency": currency,
                "count": len(converted),
                "values": converted,
                "totalKrw": round(sum(converted), 2),
            }
      hints:
      - 필터링할 통화와 변환할 통화를 같은 currency 인자로 맞추세요.
      - fee_rate는 0.015처럼 비율 값으로 들어옵니다.
    check:
      id: python.builtins.functools.currency-orders.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.functools.currency-orders.mastery.behavior.v1.fixture
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
        entry: summarize_currency_orders
        cases:
        - id: usd-with-fee
          arguments:
          - value:
            - amount: 10
              currency: USD
            - amount: 1000
              currency: JPY
            - amount: 3
              currency: USD
          - value: USD
          - value: 0.015
          - value:
              USD: 1350.0
              JPY: 9.0
              EUR: 1450.0
          expectedReturn:
            currency: USD
            count: 2
            values:
            - 13702.5
            - 4110.75
            totalKrw: 17813.25
        - id: eur-with-fee
          arguments:
          - value:
            - amount: 2
              currency: EUR
            - amount: 5
              currency: USD
            - amount: 1.5
              currency: EUR
          - value: EUR
          - value: 0.02
          - value:
              USD: 1350.0
              JPY: 9.0
              EUR: 1450.0
          expectedReturn:
            currency: EUR
            count: 2
            values:
            - 2958.0
            - 2218.5
            totalKrw: 5176.5
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 07_functools-weighted-signals-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 07_functools-currency-orders-mastery
    title: 가중 신호 점수 계산하기
    subtitle: reduce를 집계 계약에 적용
    goal: 신호 목록의 weight와 score를 누적해 weightedScore를 반환하고 총 weight 0은 거부한다.
    why: reduce는 단순 합보다 "누적 상태를 어떤 규칙으로 줄이는가"가 드러날 때 학습 가치가 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 통화 변환이 아니라 다른 집계 계약에 누적 개념을 옮기세요.
    tips:
    - totalWeight와 weightedTotal을 별도로 누적하세요.
    - totalWeight가 0이면 나눌 수 없으므로 ValueError를 일으키세요.
    exercise:
      prompt: score_weighted_signals(signals)가 signalCount, totalWeight, weightedScore를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def score_weighted_signals(signals):
            raise NotImplementedError
      solution: |-
        from functools import reduce

        def score_weighted_signals(signals):
            total_weight = reduce(lambda total, row: total + row["weight"], signals, 0)
            if total_weight == 0:
                raise ValueError("total weight must be positive")
            weighted_total = reduce(
                lambda total, row: total + row["score"] * row["weight"],
                signals,
                0,
            )
            return {
                "signalCount": len(signals),
                "totalWeight": total_weight,
                "weightedScore": round(weighted_total / total_weight, 2),
            }
      hints:
      - reduce의 세 번째 인자는 빈 목록에도 안전한 초기값입니다.
      - weightedScore는 소수점 둘째 자리까지 반올림하세요.
    check:
      id: python.builtins.functools.weighted-signals.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.functools.weighted-signals.transfer.behavior.v1.fixture
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
        entry: score_weighted_signals
        cases:
        - id: integer-weights
          arguments:
          - value:
            - score: 80
              weight: 2
            - score: 95
              weight: 1
            - score: 70
              weight: 3
          expectedReturn:
            signalCount: 3
            totalWeight: 6
            weightedScore: 77.5
        - id: fractional-weights
          arguments:
          - value:
            - score: 100
              weight: 1.5
            - score: 60
              weight: 0.5
          expectedReturn:
            signalCount: 2
            totalWeight: 2.0
            weightedScore: 90.0
        - id: rejects-zero-weight
          arguments:
          - value:
            - score: 100
              weight: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 07_functools-route-cache-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 07_functools-weighted-signals-transfer
    title: 반복 경로 비용을 캐시로 줄이기
    subtitle: lru_cache의 hit와 miss 확인
    goal: 반복 route 요청의 거리 조회를 캐시하고 비용 목록과 cache hit, miss 수를 반환한다.
    why: 캐시는 붙이는 것으로 끝이 아니라 같은 인자 재호출에서 실제 조회가 줄었는지 증거로 확인해야 합니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 해시 가능한 start, end 인자만 cached 함수에 넘기세요.
    tips:
    - 거리표 dict는 cached 함수 바깥 closure에 두고, cached 함수 인자는 start와 end만 사용하세요.
    - cache_info().hits와 misses를 반환값에 포함하세요.
    exercise:
      prompt: summarize_route_costs(distance_pairs, route_requests, cost_per_km)가 costs, cacheHits, cacheMisses, rawLookups를
        담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def summarize_route_costs(distance_pairs, route_requests, cost_per_km):
            raise NotImplementedError
      solution: |-
        from functools import lru_cache

        def summarize_route_costs(distance_pairs, route_requests, cost_per_km):
            distance_map = {(start, end): km for start, end, km in distance_pairs}
            lookup_counter = {"count": 0}

            @lru_cache(maxsize=None)
            def route_distance(start, end):
                lookup_counter["count"] += 1
                return distance_map[(start, end)]

            costs = []
            for start, end in route_requests:
                km = route_distance(start, end)
                costs.append({
                    "route": f"{start}->{end}",
                    "km": km,
                    "cost": round(km * cost_per_km, 2),
                })
            cache_info = route_distance.cache_info()
            return {
                "costs": costs,
                "cacheHits": cache_info.hits,
                "cacheMisses": cache_info.misses,
                "rawLookups": lookup_counter["count"],
            }
      hints:
      - 같은 start, end가 두 번째로 나오면 raw lookup이 늘지 않아야 합니다.
      - dict나 list를 cached 함수 인자로 넘기면 해시할 수 없어 실패합니다.
    check:
      id: python.builtins.functools.route-cache.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.functools.route-cache.retrieval.behavior.v1.fixture
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
        entry: summarize_route_costs
        cases:
        - id: repeated-route
          arguments:
          - value:
            - - A
              - B
              - 12.5
            - - B
              - C
              - 8.0
          - value:
            - - A
              - B
            - - B
              - C
            - - A
              - B
          - value: 1200
          expectedReturn:
            costs:
            - route: A->B
              km: 12.5
              cost: 15000.0
            - route: B->C
              km: 8.0
              cost: 9600.0
            - route: A->B
              km: 12.5
              cost: 15000.0
            cacheHits: 1
            cacheMisses: 2
            rawLookups: 2
        - id: two-repeated-routes
          arguments:
          - value:
            - - home
              - hub
              - 3.2
            - - hub
              - office
              - 5.5
          - value:
            - - home
              - hub
            - - home
              - hub
            - - hub
              - office
            - - hub
              - office
          - value: 900
          expectedReturn:
            costs:
            - route: home->hub
              km: 3.2
              cost: 2880.0
            - route: home->hub
              km: 3.2
              cost: 2880.0
            - route: hub->office
              km: 5.5
              cost: 4950.0
            - route: hub->office
              km: 5.5
              cost: 4950.0
            cacheHits: 2
            cacheMisses: 2
            rawLookups: 2
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
    independentReview: approved
    reviewerId: "curriculum-integrity-review"
    reviewedAt: "2026-08-02T13:06:47+09:00"
    evidenceCommit: "22505301c65a9621c9e3321759115562ffa5e136"
`;export{e as default};