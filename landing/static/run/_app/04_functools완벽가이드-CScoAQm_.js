var e=`meta:
  id: '04'
  title: functools 완벽 가이드
  day: 4
  category: advancedPython
  tags:
  - functools
  - partial
  - lru_cache
  - singledispatch
  - 검증
  - 실무유틸
  seo:
    title: 파이썬 functools 완벽 가이드 - partial, lru_cache, singledispatch
    description: functools 모듈의 핵심 함수들을 마스터합니다. partial, wraps, lru_cache, singledispatch, total_ordering
      완벽 이해.
    keywords:
    - functools
    - partial
    - lru_cache
    - singledispatch
    - total_ordering
intro:
  emoji: 🔧
  points:
  - partial로 함수 인자 고정하기
  - lru_cache로 결과 캐싱하여 성능 향상
  - singledispatch로 타입 기반 함수 오버로딩
  - total_ordering으로 비교 연산자 자동 생성
  direction: functools 완벽 가이드에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - functools 완벽 가이드 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: functools.partia 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: functools.wraps 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: functools.lrucac 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: functools 완벽 가이드 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: functools 완벽 가이드 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: functools 완벽 가이드 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: partial_function
  title: functools.partial
  structuredPrimary: true
  subtitle: 함수 인자 고정
  goal: 반복문이 만든 lambda와 partial이 인자를 붙잡는 시점이 다르다는 것을 같은 입력으로 가른다.
  why: 버튼 핸들러나 작업 큐를 반복문으로 등록하는 코드에서 lambda는 변수 이름을 호출 시점에 다시 읽어 전부 마지막 값으로 동작하는데, partial은 만드는 순간 값을 인자로 복사해 두므로 이 버그가 아예 생기지 않습니다.
  explanation: |-
    lambda가 바깥 변수를 쓰면 값을 복사하는 것이 아니라 그 변수를 가리키는 참조를 들고 있습니다. 반복이 끝난 뒤 변수에는 마지막 값만 남아 있으므로 나중에 부르는 모든 lambda가 같은 답을 냅니다. 이것을 늦은 바인딩(late binding)이라고 부릅니다.

    partial(scale, factor)는 그 시점의 factor 값을 인자로 저장합니다. 반복문이 계속 돌아도 이미 저장된 값은 바뀌지 않습니다. partial이 lambda보다 나은 자리는 문법이 짧아서가 아니라 값을 언제 붙잡는지가 다르기 때문입니다.
  snippet: |-
    from functools import partial

    def scale(factor, value):
        return factor * value

    scalers = [lambda value: factor * value for factor in (2, 3, 10)]
    [scaler(5) for scaler in scalers]
  exercise:
    prompt: |-
      scale 함수는 정의만 되어 있고 아무도 쓰지 않습니다. scalers를 만드는 줄의 lambda value: factor * value를 partial(scale, factor)로 바꿔 배수 함수 세 개를 partial로 만드세요. for 절과 마지막 줄은 그대로 둡니다.

      lambda는 셋 다 마지막 factor인 10을 읽어 [50, 50, 50]을 내지만 partial은 2, 3, 10을 각각 저장하므로 [10, 15, 50]이 나와야 합니다.
    starterCode: |-
      from functools import partial

      def scale(factor, value):
          return factor * value

      scalers = [lambda value: factor * value for factor in (2, 3, 10)]
      [scaler(5) for scaler in scalers]
    solution: |-
      from functools import partial

      def scale(factor, value):
          return factor * value

      scalers = [partial(scale, factor) for factor in (2, 3, 10)]
      [scaler(5) for scaler in scalers]
    hints:
    - 리스트 컴프리헨션 안의 lambda 식만 통째로 partial(scale, factor) 로 바꿉니다. scale 의 첫 매개변수가 factor 라서 그대로 앞자리에 고정됩니다.
    - "정답 형태: scalers = [partial(scale, factor) for factor in (2, 3, 10)]"
  check:
    type: outputExact
    evidence: practice
    outputExact: '[10, 15, 50]'
    resultCheck: "출력이 정확히 일치해야 합니다: '[10, 15, 50]'"
- id: wraps_decorator
  title: functools.wraps
  structuredPrimary: true
  subtitle: 데코레이터 메타데이터 보존
  goal: wraps가 심어 둔 __wrapped__로 원본 함수를 다시 꺼내고 inspect가 보는 서명까지 확인한다.
  why: 테스트에서 데코레이터를 우회해 원본만 부르거나 프레임워크가 매개변수 이름을 읽어 값을 주입하는 코드는 __wrapped__에 의존하므로, wraps는 이름을 예쁘게 만드는 장식이 아니라 도구가 함수를 들여다볼 수 있게 하는 계약입니다.
  explanation: |-
    wraps는 __name__과 __doc__만 복사하는 것이 아니라 __wrapped__ 속성에 원본 함수를 매달아 둡니다. inspect.signature는 기본적으로 이 고리를 따라가므로 wrapper가 (*args, **kwargs)로 선언되어 있어도 원본의 매개변수를 보여 줍니다.

    반대로 __wrapped__를 직접 부르면 데코레이터를 건너뛰고 원본 동작만 실행할 수 있습니다. 감싼 뒤에도 원본으로 되돌아갈 통로가 남는다는 뜻입니다.
  snippet: |-
    from functools import wraps

    def withSurcharge(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs) + 500
        return wrapper

    @withSurcharge
    def basePrice(amount):
        """할증을 붙이기 전 원래 금액을 돌려준다."""
        return amount

    basePrice(10000)
  exercise:
    prompt: |-
      맨 위에 import inspect 한 줄을 추가하고, 마지막 줄 basePrice(10000)을 (basePrice.__name__, str(inspect.signature(basePrice)), basePrice.__wrapped__(10000))으로 바꾸세요. 데코레이터 본문은 그대로 둡니다.

      wrapper는 (*args, **kwargs)로 선언했지만 inspect는 __wrapped__를 따라가 원본 서명을 읽고, __wrapped__를 직접 부르면 할증 500이 붙지 않으므로 ('basePrice', '(amount)', 10000)이 나와야 합니다.
    starterCode: |-
      from functools import wraps

      def withSurcharge(func):
          @wraps(func)
          def wrapper(*args, **kwargs):
              return func(*args, **kwargs) + 500
          return wrapper

      @withSurcharge
      def basePrice(amount):
          """할증을 붙이기 전 원래 금액을 돌려준다."""
          return amount

      basePrice(10000)
    solution: |-
      import inspect
      from functools import wraps

      def withSurcharge(func):
          @wraps(func)
          def wrapper(*args, **kwargs):
              return func(*args, **kwargs) + 500
          return wrapper

      @withSurcharge
      def basePrice(amount):
          """할증을 붙이기 전 원래 금액을 돌려준다."""
          return amount

      (basePrice.__name__, str(inspect.signature(basePrice)), basePrice.__wrapped__(10000))
    hints:
    - inspect.signature 는 Signature 객체를 돌려주므로 str() 로 감싸야 '(amount)' 라는 문자열이 됩니다.
    - "정답 형태: (basePrice.__name__, str(inspect.signature(basePrice)), basePrice.__wrapped__(10000))"
  check:
    type: outputExact
    evidence: practice
    outputExact: "('basePrice', '(amount)', 10000)"
    resultCheck: "출력이 정확히 일치해야 합니다: ('basePrice', '(amount)', 10000)"
- id: lru_cache
  title: functools.lru_cache
  structuredPrimary: true
  subtitle: LRU 캐싱으로 성능 최적화
  goal: maxsize를 올려 축출 때문에 사라졌던 캐시 항목이 살아남는 것을 hits와 실제 조회 기록으로 확인한다.
  why: maxsize는 메모리 상한이자 적중률의 상한이라 실제로 도는 서로 다른 인자 수보다 작게 잡으면 캐시가 자기들끼리 계속 밀어내며 조회는 조회대로 다 나가는 최악의 상태가 되므로, 붙이기 전에 인자 종류를 먼저 세야 합니다.
  explanation: |-
    LRU는 Least Recently Used의 약자입니다. 저장 칸이 maxsize를 넘으면 가장 오래 쓰지 않은 항목부터 버립니다. 버려진 인자가 다시 들어오면 hit가 아니라 miss가 되고 함수 본문이 다시 실행됩니다.

    여기서는 통화 세 종류가 도는데 칸이 두 개뿐입니다. lookupLog는 함수 본문이 실제로 실행될 때만 늘어나므로, 축출이 일어난 순간이 기록에 그대로 남습니다.
  snippet: |-
    from functools import lru_cache

    lookupLog = []

    @lru_cache(maxsize=2)
    def rateFor(currency):
        lookupLog.append(currency)
        return {'USD': 1350, 'JPY': 9, 'EUR': 1450}[currency]

    for code in ('USD', 'JPY', 'USD', 'EUR', 'JPY'):
        rateFor(code)

    rateFor.cache_info(), lookupLog
  exercise:
    prompt: |-
      서로 다른 통화가 셋인데 캐시 칸이 둘뿐이라 JPY가 EUR에게 밀려났다가 다시 조회됩니다. 데코레이터의 maxsize=2를 maxsize=3으로 바꾸세요. for 문의 호출 순서는 그대로 둡니다.

      칸이 셋이면 밀려나는 항목이 없어 실제 조회는 통화당 한 번씩만 나가고 두 번째 USD와 JPY는 캐시에서 나오므로 (CacheInfo(hits=2, misses=3, maxsize=3, currsize=3), ['USD', 'JPY', 'EUR'])가 나와야 합니다.
    starterCode: |-
      from functools import lru_cache

      lookupLog = []

      @lru_cache(maxsize=2)
      def rateFor(currency):
          lookupLog.append(currency)
          return {'USD': 1350, 'JPY': 9, 'EUR': 1450}[currency]

      for code in ('USD', 'JPY', 'USD', 'EUR', 'JPY'):
          rateFor(code)

      rateFor.cache_info(), lookupLog
    solution: |-
      from functools import lru_cache

      lookupLog = []

      @lru_cache(maxsize=3)
      def rateFor(currency):
          lookupLog.append(currency)
          return {'USD': 1350, 'JPY': 9, 'EUR': 1450}[currency]

      for code in ('USD', 'JPY', 'USD', 'EUR', 'JPY'):
          rateFor(code)

      rateFor.cache_info(), lookupLog
    hints:
    - 고칠 곳은 데코레이터의 maxsize 숫자 하나입니다. 바꾸기 전후로 lookupLog 의 길이가 어떻게 달라지는지 같이 보세요.
    - "정답 형태: @lru_cache(maxsize=3)"
  check:
    type: outputExact
    evidence: practice
    outputExact: "(CacheInfo(hits=2, misses=3, maxsize=3, currsize=3), ['USD', 'JPY', 'EUR'])"
    resultCheck: "출력이 정확히 일치해야 합니다: (CacheInfo(hits=2, misses=3, maxsize=3, currsize=3), ['USD', 'JPY', 'EUR'])"
- id: cache
  title: functools.cache
  structuredPrimary: true
  subtitle: Python 3.9+ 무제한 캐시
  goal: 축출 규칙이 없는 캐시에서 한 번의 호출로 몇 칸이 쌓이는지 currsize로 직접 센다.
  why: 축출이 없으면 적중률은 최고지만 저장된 항목이 프로세스가 사는 동안 그대로 남으므로, 인자 조합이 사용자 입력처럼 열려 있는 함수에 @cache를 붙이면 캐시가 그대로 메모리 누수가 됩니다.
  explanation: |-
    Python 3.9에서 추가된 cache는 lru_cache(maxsize=None)의 별칭입니다. maxsize가 None이면 버리는 규칙이 없으므로 서로 다른 인자를 부른 만큼 항목이 계속 쌓입니다.

    stepCount는 우박수 수열을 따라 1에 닿을 때까지 내려가면서 지나친 중간 값을 전부 각각 저장합니다. 27 하나를 물었을 뿐인데 칸이 몇 개나 잡히는지 앞 섹션의 currsize와 비교해 보세요.
  snippet: |-
    from functools import cache

    @cache
    def stepCount(n):
        if n == 1:
            return 0
        if n % 2 == 0:
            return 1 + stepCount(n // 2)
        return 1 + stepCount(3 * n + 1)

    stepCount(27)
  exercise:
    prompt: |-
      마지막 줄 stepCount(27)을 세 줄로 늘리세요. first = stepCount(27)과 second = stepCount(27)로 같은 인자를 두 번 부른 뒤, 마지막 줄을 (first, second, stepCount.cache_info().hits, stepCount.cache_info().maxsize, stepCount.cache_info().currsize)로 만드세요.

      두 번째 호출은 저장된 값을 그대로 쓰므로 hits가 1이고, 축출 규칙이 없어 maxsize는 None이며, 27에서 1까지 지나친 값이 전부 남아 있으므로 (111, 111, 1, None, 112)가 나와야 합니다.
    starterCode: |-
      from functools import cache

      @cache
      def stepCount(n):
          if n == 1:
              return 0
          if n % 2 == 0:
              return 1 + stepCount(n // 2)
          return 1 + stepCount(3 * n + 1)

      stepCount(27)
    solution: |-
      from functools import cache

      @cache
      def stepCount(n):
          if n == 1:
              return 0
          if n % 2 == 0:
              return 1 + stepCount(n // 2)
          return 1 + stepCount(3 * n + 1)

      first = stepCount(27)
      second = stepCount(27)
      (first, second, stepCount.cache_info().hits, stepCount.cache_info().maxsize, stepCount.cache_info().currsize)
    hints:
    - cache_info() 는 부를 때마다 그 시점 값을 새로 읽습니다. 두 번째 호출 뒤에 읽어야 hits 가 1 로 잡힙니다.
    - "정답 형태: (first, second, stepCount.cache_info().hits, stepCount.cache_info().maxsize, stepCount.cache_info().currsize)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(111, 111, 1, None, 112)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(111, 111, 1, None, 112)'"
- id: singledispatch
  title: functools.singledispatch
  structuredPrimary: true
  subtitle: 타입 기반 함수 오버로딩
  goal: bool이 int의 하위 타입이라 int 구현으로 흘러가는 것을 확인하고 bool 전용 구현을 등록한다.
  why: 파이썬에서 True는 int이기도 해서 타입 분기는 등록한 순서가 아니라 상속 관계로 결정되는데, 이 사실을 모르면 참과 거짓이 조용히 숫자 서식으로 렌더링되는 버그를 화면에서 처음 발견하게 됩니다.
  explanation: |-
    singledispatch는 첫 인자의 타입을 보고 구현을 고릅니다. 정확히 일치하는 등록이 없으면 상속 계층을 따라 올라가 가장 가까운 조상의 구현을 씁니다. isinstance 사슬과 달리 분기 조건이 등록 위치에 흩어져 있어도 규칙은 하나입니다.

    bool은 int를 상속합니다. 그래서 bool 등록이 없으면 int 구현이 잡히고, describe(True)는 True * 2가 2이므로 정수 서식으로 렌더링됩니다.
  snippet: |-
    from functools import singledispatch

    @singledispatch
    def describe(value):
        return f'기타: {value}'

    @describe.register
    def _(value: int):
        return f'정수: {value * 2}'

    @describe.register
    def _(value: str):
        return f'문자열: {value.upper()}'

    describe(10), describe('hello'), describe(True)
  exercise:
    prompt: |-
      describe(True)가 지금 정수 구현으로 흘러가 '정수: 2'로 나옵니다. str 등록 블록 아래에 @describe.register 한 줄과 def _(value: bool): 로 시작하는 함수를 추가하고 본문에서 f'불린: {value}'를 돌려주세요. 마지막 줄은 그대로 둡니다.

      bool이 int보다 가까운 타입이라 True는 새 구현으로 가고 나머지 두 호출은 그대로이므로 ('정수: 20', '문자열: HELLO', '불린: True')가 나와야 합니다.
    starterCode: |-
      from functools import singledispatch

      @singledispatch
      def describe(value):
          return f'기타: {value}'

      @describe.register
      def _(value: int):
          return f'정수: {value * 2}'

      @describe.register
      def _(value: str):
          return f'문자열: {value.upper()}'

      describe(10), describe('hello'), describe(True)
    solution: |-
      from functools import singledispatch

      @singledispatch
      def describe(value):
          return f'기타: {value}'

      @describe.register
      def _(value: int):
          return f'정수: {value * 2}'

      @describe.register
      def _(value: str):
          return f'문자열: {value.upper()}'

      @describe.register
      def _(value: bool):
          return f'불린: {value}'

      describe(10), describe('hello'), describe(True)
    hints:
    - 등록 함수의 이름은 앞의 둘처럼 밑줄 하나로 두고 매개변수 주석만 bool 로 씁니다. singledispatch 는 함수 이름이 아니라 주석의 타입을 봅니다.
    - "정답 형태: def _(value: bool): 에서 f'불린: {value}' 반환"
  check:
    type: outputExact
    evidence: practice
    outputExact: "('정수: 20', '문자열: HELLO', '불린: True')"
    resultCheck: "출력이 정확히 일치해야 합니다: ('정수: 20', '문자열: HELLO', '불린: True')"
- id: total_ordering
  title: functools.total_ordering
  structuredPrimary: true
  subtitle: 비교 연산자 자동 생성
  goal: __eq__를 정의하면서 사라진 __hash__를 직접 되살려 객체를 집합에 담을 수 있게 만든다.
  why: __eq__를 쓰는 순간 파이썬이 __hash__를 None으로 지워 그 객체는 set, dict 키, lru_cache 인자 어디에도 들어가지 못하는데, 이 규칙은 같으면 해시도 같아야 한다는 계약을 사람이 모르는 사이에 깨뜨리지 못하게 막는 안전장치입니다.
  explanation: |-
    total_ordering은 비교 연산자를 채워 주지만 해시는 손대지 않습니다. 오히려 __eq__를 직접 정의한 클래스는 __hash__가 자동으로 None이 되어 해시 불가능한 객체가 됩니다.

    되살리려면 __eq__가 보는 것과 같은 필드로 __hash__를 직접 정의해야 합니다. 여기서는 priority가 그 필드입니다. 같다고 판정한 두 객체가 서로 다른 해시를 가지면 dict와 set이 조용히 어긋나기 때문입니다.
  snippet: |-
    from functools import total_ordering

    @total_ordering
    class Ticket:
        def __init__(self, name, priority):
            self.name = name
            self.priority = priority

        def __eq__(self, other):
            return self.priority == other.priority

        def __lt__(self, other):
            return self.priority < other.priority

    deploy = Ticket('배포', 1)
    docs = Ticket('문서', 3)
    deploy < docs, deploy >= docs, Ticket.__hash__
  exercise:
    prompt: |-
      마지막 줄이 Ticket.__hash__를 None으로 보여 줍니다. 해시가 지워졌다는 뜻입니다. 클래스 안 __lt__ 아래에 def __hash__(self): return hash(self.priority)를 추가하고, 마지막 줄의 Ticket.__hash__를 len({deploy, docs})로 바꾸세요.

      해시가 살아나면 두 티켓을 집합에 담을 수 있고 priority가 1과 3으로 달라 서로 합쳐지지 않으므로 (True, False, 2)가 나와야 합니다.
    starterCode: |-
      from functools import total_ordering

      @total_ordering
      class Ticket:
          def __init__(self, name, priority):
              self.name = name
              self.priority = priority

          def __eq__(self, other):
              return self.priority == other.priority

          def __lt__(self, other):
              return self.priority < other.priority

      deploy = Ticket('배포', 1)
      docs = Ticket('문서', 3)
      deploy < docs, deploy >= docs, Ticket.__hash__
    solution: |-
      from functools import total_ordering

      @total_ordering
      class Ticket:
          def __init__(self, name, priority):
              self.name = name
              self.priority = priority

          def __eq__(self, other):
              return self.priority == other.priority

          def __lt__(self, other):
              return self.priority < other.priority

          def __hash__(self):
              return hash(self.priority)

      deploy = Ticket('배포', 1)
      docs = Ticket('문서', 3)
      deploy < docs, deploy >= docs, len({deploy, docs})
    hints:
    - __hash__ 는 __eq__ 가 비교에 쓰는 값과 같은 값으로 만들어야 합니다. 여기서는 hash(self.priority) 입니다.
    - "정답 형태: def __hash__(self): return hash(self.priority)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(True, False, 2)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(True, False, 2)'"
- id: workflow_validation
  title: '현업 흐름 검증: functools로 리포트 유틸리티 구성하기'
  structuredPrimary: true
  subtitle: partial → cache → singledispatch → ordering 검증
  goal: partial이 위치 인자를 앞에서부터 채운다는 규칙 때문에 깨진 통화 포매터를 키워드 고정으로 바로잡는다.
  why: partial로 뒤쪽 매개변수를 고정하려 할 때 값을 위치로 넘기면 첫 매개변수 자리에 들어가 엉뚱한 인자끼리 짝지어지고, 이 오류는 partial을 만든 줄이 아니라 한참 뒤 호출 지점에서 터지기 때문에 원인을 찾기 어렵습니다.
  explanation: |-
    이 셀은 리포트 유틸리티 하나에 이 레슨의 도구를 모두 넣었습니다. partial로 통화 기호를 고정하고, lru_cache로 세금 계산을 재사용하고, singledispatch로 타입별 렌더러를 고르고, total_ordering으로 항목을 정렬합니다.

    지금은 partial이 잘못 묶여 있어 렌더링 단계에서 ValueError로 멈춥니다. 오류 메시지가 가리키는 줄이 아니라 partial을 만든 줄을 보세요. 이것이 부분 적용을 디버깅하는 순서입니다.

    변주 실험
    renderValue에 list 렌더러를 등록하고 report 안에 리스트 값을 넣어도 같은 형식으로 렌더링되는지 assert로 확인하세요.
  tips:
  - 변주 실험 renderValue에 list 렌더러를 등록하고 report 안에 리스트 값을 넣어도 같은 형식으로 렌더링되는지 assert로 확인하세요.
  snippet: |-
    from functools import lru_cache, partial, singledispatch, total_ordering

    def formatCurrency(value, currency):
        return f'{currency}{value:,}'

    won = partial(formatCurrency, '₩')

    @lru_cache(maxsize=8)
    def taxIncluded(price, taxRate):
        return int(price * (1 + taxRate))

    @singledispatch
    def renderValue(value):
        return str(value)

    @renderValue.register
    def _(value: int):
        return won(value)

    @renderValue.register
    def _(value: dict):
        return ', '.join(f'{key}={renderValue(item)}' for key, item in sorted(value.items()))

    @total_ordering
    class ReportItem:
        def __init__(self, name, priority):
            self.name = name
            self.priority = priority

        def __eq__(self, other):
            return self.priority == other.priority

        def __lt__(self, other):
            return self.priority < other.priority

    report = {'gross': taxIncluded(100000, 0.1), 'net': 100000}
    items = [ReportItem('배포', 3), ReportItem('결산', 1), ReportItem('점검', 2)]

    assert taxIncluded(100000, 0.1) == 110000
    assert taxIncluded.cache_info().hits == 1
    assert renderValue(report) == 'gross=₩110,000, net=₩100,000'
    assert [item.name for item in sorted(items)] == ['결산', '점검', '배포']

    print(renderValue(report))
    print('|'.join(item.name for item in sorted(items)))
  exercise:
    prompt: |-
      그대로 실행하면 ValueError가 납니다. formatCurrency(value, currency)의 첫 매개변수는 value인데 partial(formatCurrency, '₩')가 기호를 그 자리에 밀어 넣기 때문입니다. 그 줄을 won = partial(formatCurrency, currency='₩')로 바꾸세요. 나머지 줄과 assert 네 개는 그대로 둡니다.

      통화 기호가 currency 자리에 고정되면 assert 네 줄이 모두 지나가고 렌더링 결과와 우선순위 정렬 결과가 한 줄씩 출력되므로 아래 두 줄이 나와야 합니다.
      gross=₩110,000, net=₩100,000
      결산|점검|배포
    starterCode: |-
      from functools import lru_cache, partial, singledispatch, total_ordering

      def formatCurrency(value, currency):
          return f'{currency}{value:,}'

      won = partial(formatCurrency, '₩')

      @lru_cache(maxsize=8)
      def taxIncluded(price, taxRate):
          return int(price * (1 + taxRate))

      @singledispatch
      def renderValue(value):
          return str(value)

      @renderValue.register
      def _(value: int):
          return won(value)

      @renderValue.register
      def _(value: dict):
          return ', '.join(f'{key}={renderValue(item)}' for key, item in sorted(value.items()))

      @total_ordering
      class ReportItem:
          def __init__(self, name, priority):
              self.name = name
              self.priority = priority

          def __eq__(self, other):
              return self.priority == other.priority

          def __lt__(self, other):
              return self.priority < other.priority

      report = {'gross': taxIncluded(100000, 0.1), 'net': 100000}
      items = [ReportItem('배포', 3), ReportItem('결산', 1), ReportItem('점검', 2)]

      assert taxIncluded(100000, 0.1) == 110000
      assert taxIncluded.cache_info().hits == 1
      assert renderValue(report) == 'gross=₩110,000, net=₩100,000'
      assert [item.name for item in sorted(items)] == ['결산', '점검', '배포']

      print(renderValue(report))
      print('|'.join(item.name for item in sorted(items)))
    solution: |-
      from functools import lru_cache, partial, singledispatch, total_ordering

      def formatCurrency(value, currency):
          return f'{currency}{value:,}'

      won = partial(formatCurrency, currency='₩')

      @lru_cache(maxsize=8)
      def taxIncluded(price, taxRate):
          return int(price * (1 + taxRate))

      @singledispatch
      def renderValue(value):
          return str(value)

      @renderValue.register
      def _(value: int):
          return won(value)

      @renderValue.register
      def _(value: dict):
          return ', '.join(f'{key}={renderValue(item)}' for key, item in sorted(value.items()))

      @total_ordering
      class ReportItem:
          def __init__(self, name, priority):
              self.name = name
              self.priority = priority

          def __eq__(self, other):
              return self.priority == other.priority

          def __lt__(self, other):
              return self.priority < other.priority

      report = {'gross': taxIncluded(100000, 0.1), 'net': 100000}
      items = [ReportItem('배포', 3), ReportItem('결산', 1), ReportItem('점검', 2)]

      assert taxIncluded(100000, 0.1) == 110000
      assert taxIncluded.cache_info().hits == 1
      assert renderValue(report) == 'gross=₩110,000, net=₩100,000'
      assert [item.name for item in sorted(items)] == ['결산', '점검', '배포']

      print(renderValue(report))
      print('|'.join(item.name for item in sorted(items)))
    hints:
    - partial 이 넘긴 위치 인자는 원본 함수의 첫 매개변수부터 차례로 채웁니다. 뒤쪽 매개변수를 고정하려면 이름을 붙여 넘겨야 합니다.
    - "정답 형태: won = partial(formatCurrency, currency='₩')"
  check:
    type: outputExact
    evidence: practice
    outputExact: "gross=₩110,000, net=₩100,000\\n결산|점검|배포"
    resultCheck: "출력이 정확히 일치해야 합니다: 첫 줄 'gross=₩110,000, net=₩100,000', 둘째 줄 '결산|점검|배포'"
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: functools 마스터하기
  goal: partial로 reduce의 적용 함수와 단계 목록까지 고정해 값 하나만 넣으면 도는 파이프라인을 만든다.
  why: 전처리 단계를 목록으로 들고 순서대로 적용하는 구조는 데이터 정제와 요청 미들웨어에서 반복해서 나오는데, reduce와 partial을 쓰면 단계 목록을 데이터처럼 다루면서 호출부는 값 하나만 넘기게 됩니다.
  explanation: |-
    Day 4의 도구를 조합하는 마지막 연습입니다. reduce(적용함수, 단계목록, 시작값)은 시작값에 단계를 차례로 적용합니다. 여기서 적용함수는 값과 단계를 받아 step(value)를 돌려주는 한 줄짜리 람다입니다.

    partial(reduce, 적용함수, 단계목록)은 그중 앞의 두 자리를 미리 채웁니다. 남는 자리는 시작값 하나뿐이므로 결과는 그대로 호출할 수 있는 파이프라인 함수가 됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from functools import partial

    def power(base, exp):
        return base ** exp

    square = partial(power, exp=2)
    square(5)
  exercise:
    prompt: |-
      첫 줄 import에 reduce를 추가하고, square 아래에 cube = partial(power, exp=3)과 runPipeline = partial(reduce, lambda value, step: step(value), [square, cube])를 넣은 뒤 마지막 줄 square(5)를 runPipeline(2)로 바꾸세요.

      2를 제곱해 4가 되고 그 4를 다시 세제곱하므로 64가 나와야 합니다.
    starterCode: |-
      from functools import partial

      def power(base, exp):
          return base ** exp

      square = partial(power, exp=2)
      square(5)
    solution: |-
      from functools import partial, reduce

      def power(base, exp):
          return base ** exp

      square = partial(power, exp=2)
      cube = partial(power, exp=3)
      runPipeline = partial(reduce, lambda value, step: step(value), [square, cube])
      runPipeline(2)
    hints:
    - reduce 의 세 번째 인자가 시작값입니다. partial 로 앞의 두 인자만 채우면 시작값 자리가 남아 runPipeline(2) 처럼 부를 수 있습니다.
    - "정답 형태: runPipeline = partial(reduce, lambda value, step: step(value), [square, cube])"
  check:
    type: outputExact
    evidence: practice
    outputExact: '64'
    resultCheck: "출력이 정확히 일치해야 합니다: '64'"
assessment:
  masteryVariants:
  - id: 04_advanced_functools-cached-currency-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - partial_function
    - lru_cache
    - workflow_validation
    title: partial과 lru_cache로 세금 포함 금액 리포트 만들기
    subtitle: cached currency formatter
    goal: 가격 목록과 세율을 받아 세금 포함 금액 문자열, 반복 호출 cache hit, miss 수를 반환한다.
    why: functools는 함수 이름 암기가 아니라, 인자 고정과 캐시를 조합해 반복 계산을 읽기 쉬운 유틸리티로 만드는 데 가치가 있습니다.
    explanation: build_taxed_currency_report(prices, tax_rate)를 완성해 partial로 통화 포매터를 만들고 lru_cache로 중복 가격 계산을 재사용하세요.
    tips:
    - 같은 price가 반복되면 cache_info().hits가 증가해야 합니다.
    - 빈 prices는 빈 rendered와 repeated None으로 처리하세요.
    exercise:
      prompt: build_taxed_currency_report(prices, tax_rate)를 완성해 rendered, repeated, cacheHits, cacheMisses를 반환하세요.
      starterCode: |-
        def build_taxed_currency_report(prices, tax_rate):
            raise NotImplementedError
      solution: |-
        def build_taxed_currency_report(prices, tax_rate):
            from functools import lru_cache, partial

            def format_currency(value, currency):
                return f"{currency}{value:,}"

            won = partial(format_currency, currency="₩")

            @lru_cache(maxsize=4)
            def tax_included(price):
                return int(price * (1 + tax_rate))

            rendered = [won(tax_included(price)) for price in prices]
            repeated = won(tax_included(prices[0])) if prices else None
            info = tax_included.cache_info()
            return {
                "rendered": rendered,
                "repeated": repeated,
                "cacheHits": info.hits,
                "cacheMisses": info.misses,
            }
      hints:
      - partial은 currency 인자를 미리 고정하는 데 쓰세요.
      - cache_info()는 hits와 misses를 named tuple처럼 제공합니다.
    check:
      id: python.advanced.functools.cached-currency.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.functools.empty.behavior.v1.fixture
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
        entry: build_taxed_currency_report
        cases:
        - id: formats-repeated-prices-with-cache-stats
          arguments:
          - value:
            - 1000
            - 2000
            - 1000
          - value: 0.1
          expectedReturn:
            rendered:
            - ₩1,100
            - ₩2,200
            - ₩1,100
            repeated: ₩1,100
            cacheHits: 2
            cacheMisses: 2
        - id: handles-empty-price-list
          arguments:
          - value: []
          - value: 0.1
          expectedReturn:
            rendered: []
            repeated: null
            cacheHits: 0
            cacheMisses: 0
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 04_advanced_functools-singledispatch-render-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - singledispatch
    - partial_function
    - workflow_validation
    title: singledispatch로 int, list, dict 값을 일관된 문자열로 렌더링하기
    subtitle: typed renderer utility
    goal: 여러 타입이 섞인 값을 받아 타입별 renderer를 적용한 문자열 목록을 반환한다.
    why: 전이 과제에서는 functools를 리포트 금액 밖으로 옮겨, 타입별 처리를 if 사슬 대신 등록 가능한 함수로 나누는 감각을 확인합니다.
    explanation: render_typed_values(values)를 완성해 int, list, dict, 기본 타입을 singledispatch로 처리하세요.
    tips:
    - dict는 key 순서가 흔들리지 않게 sorted(value.items())를 쓰세요.
    - list renderer는 내부 항목도 render 함수로 재귀 렌더링해야 합니다.
    exercise:
      prompt: render_typed_values(values)를 완성해 타입별 렌더링 결과 목록을 반환하세요.
      starterCode: |-
        def render_typed_values(values):
            raise NotImplementedError
      solution: |-
        def render_typed_values(values):
            from functools import singledispatch

            @singledispatch
            def render(value):
                return str(value)

            @render.register
            def _(value: int):
                return f"#{value}"

            @render.register
            def _(value: list):
                return "[" + "|".join(render(item) for item in value) + "]"

            @render.register
            def _(value: dict):
                return ", ".join(f"{key}={render(item)}" for key, item in sorted(value.items()))

            return [render(value) for value in values]
      hints:
      - singledispatch는 첫 번째 인자의 타입으로 구현을 고릅니다.
      - dict 안에 list가 있으면 list renderer가 다시 호출되어야 합니다.
    check:
      id: python.advanced.functools.singledispatch-render.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.functools.empty.behavior.v1.fixture
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
        entry: render_typed_values
        cases:
        - id: renders-nested-dict-and-list-by-type
          arguments:
          - value:
            - 3
            - b: 2
              a:
              - 1
              - 2
            - x
          expectedReturn:
          - '#3'
          - a=[#1|#2], b=#2
          - x
        - id: renders-empty-list
          arguments:
          - value:
            - []
          expectedReturn:
          - '[]'
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 04_advanced_functools-tool-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 04_advanced_functools-singledispatch-render-transfer
    title: partial, lru_cache, wraps, singledispatch 사용처 회상하기
    subtitle: functools tool recall
    goal: 목적 이름을 받아 적절한 functools 도구와 사용 이유, 상태성 여부를 반환한다.
    why: 시간이 지나도 남아야 할 지식은 각 도구의 이름보다 인자 고정, 반복 계산 캐싱, 메타데이터 보존, 타입별 분기의 선택 기준입니다.
    explanation: choose_functools_tool(goal)를 완성해 fix-argument, cache-repeat, keep-metadata, dispatch-by-type 목적별 도구를 고르세요.
    tips:
    - wraps는 실행 결과를 바꾸기보다 함수 정보를 보존합니다.
    - lru_cache는 내부 cache 상태를 가집니다.
    exercise:
      prompt: choose_functools_tool(goal)를 완성해 목적별 functools 도구 선택 결과를 반환하세요.
      starterCode: |-
        def choose_functools_tool(goal):
            raise NotImplementedError
      solution: |-
        def choose_functools_tool(goal):
            table = {
                "fix-argument": {
                    "tool": "partial",
                    "useWhen": "pre-fill one or more function arguments",
                    "stateful": False,
                },
                "cache-repeat": {
                    "tool": "lru_cache",
                    "useWhen": "reuse results for the same hashable arguments",
                    "stateful": True,
                },
                "keep-metadata": {
                    "tool": "wraps",
                    "useWhen": "preserve __name__ and __doc__ inside decorators",
                    "stateful": False,
                },
                "dispatch-by-type": {
                    "tool": "singledispatch",
                    "useWhen": "choose implementation from the first argument type",
                    "stateful": False,
                },
            }
            if goal not in table:
                raise ValueError("unknown functools goal")
            return table[goal]
      hints:
      - partial은 새 함수를 만들지만 cache를 만들지는 않습니다.
      - lru_cache는 인자가 hashable이어야 합니다.
    check:
      id: python.advanced.functools.tool-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.functools.empty.behavior.v1.fixture
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
        entry: choose_functools_tool
        cases:
        - id: recalls-partial-for-fixed-arguments
          arguments:
          - value: fix-argument
          expectedReturn:
            tool: partial
            useWhen: pre-fill one or more function arguments
            stateful: false
        - id: recalls-lru-cache-for-repeated-calls
          arguments:
          - value: cache-repeat
          expectedReturn:
            tool: lru_cache
            useWhen: reuse results for the same hashable arguments
            stateful: true
        - id: rejects-unknown-goal
          arguments:
          - value: monkeypatch-runtime
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
    independentReview: approved
    reviewerId: "curriculum-integrity-review"
    reviewedAt: "2026-08-02T13:06:47+09:00"
    evidenceCommit: "22505301c65a9621c9e3321759115562ffa5e136"
`;export{e as default};