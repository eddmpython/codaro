var e=`meta:\r
  id: 07_functools\r
  title: functools - 함수형 프로그래밍\r
  category: builtins\r
  tags:\r
  - functools\r
  - partial\r
  - reduce\r
  - lru_cache\r
  - wraps\r
  seo:\r
    title: 파이썬 functools 모듈 완전 정복\r
    description: functools 모듈의 partial, reduce, lru_cache, wraps 등 함수형 프로그래밍 도구를 배웁니다.\r
    keywords:\r
    - functools\r
    - partial\r
    - reduce\r
    - lru_cache\r
    - 데코레이터\r
    - 함수형프로그래밍\r
intro:\r
  emoji: 🔧\r
  points:\r
  - partial로 함수 인자 고정\r
  - reduce로 누적 연산\r
  - lru_cache로 성능 최적화\r
  - wraps로 데코레이터 작성\r
  direction: functools 함수형 프로그래밍에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - functools 함수형 프로그래밍 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: functools 모듈 불러오 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: partial 부분 적용 함수 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: reduce 누적 연산 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: functools 함수형 프로 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: functools 함수형 프로 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: functools 함수형 프로 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: functools 모듈 불러오기\r
  structuredPrimary: true\r
  subtitle: ⚠️ 가장 먼저 실행하세요\r
  goal: functools 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표준 라이브러리는 외부 의존성 없이 파일, 시간, 문자열, 직렬화 같은 업무 코드를 구성하는 기반입니다.\r
  explanation: |-\r
    functools은 파이썬 표준 라이브러리입니다. 고차 함수와 함수형 프로그래밍 도구를 제공하는 모듈입니다. 별도 설치 없이 import만으로 사용할 수 있습니다.\r
\r
    이 섹션을 먼저 실행하면 아래 모든 예제에서 functools 모듈을 사용할 수 있습니다.\r
  snippet: |-\r
    from functools import partial, reduce, lru_cache, wraps, total_ordering, cmp_to_key\r
\r
    # 모듈 로드 확인\r
    'functools 모듈이 정상적으로 로드되었습니다'\r
  exercise:\r
    prompt: functools 모듈 불러오기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: |-\r
      from functools import partial, reduce, lru_cache, wraps, total_ordering, cmp_to_key\r
\r
      # 모듈 로드 확인\r
      'functools 모듈이 정상적으로 로드되었습니다'\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: functools 모듈 불러오기의 수정 코드가 모듈 함수 호출 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: functools 모듈 불러오기 실행 결과가 반환값, stdout, 객체 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: partial\r
  title: partial - 부분 적용 함수\r
  structuredPrimary: true\r
  subtitle: 인자를 미리 고정하기\r
  goal: partial 부분 적용 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    partial은 함수의 일부 인자를 미리 고정한 새 함수를 만듭니다. 같은 함수를 다른 기본값으로 여러 번 사용할 때 코드 중복을 줄이고, 콜백 함수나 이벤트 핸들러에서 추가 인자를 전달할 때 유용합니다.\r
\r
    partial은 람다보다 명확하고 디버깅이 쉽습니다. lambda x: func(2, x) 대신 partial(func, 2)를 사용하세요.\r
  snippet: |-\r
    def multiply(x, y):\r
        return x * y\r
\r
    double = partial(multiply, 2)\r
    output = double(5)\r
    output\r
  exercise:\r
    prompt: partial 부분 적용 함수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def multiply(x, y):\r
          return x * y\r
\r
      double = partial(multiply, 2)\r
      output = double(5)\r
      output\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: partial 부분 적용 함수의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: partial 부분 적용 함수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: reduce\r
  title: reduce - 누적 연산\r
  structuredPrimary: true\r
  subtitle: 반복 가능한 객체 축소하기\r
  goal: reduce 누적 연산에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    reduce는 이항 함수를 누적 적용하여 반복 가능한 객체를 단일 값으로 줄입니다. 리스트의 모든 요소를 합치거나, 곱하거나, 최댓값을 찾는 등 누적 연산에 사용됩니다. Python 3에서는 functools 모듈로 이동되었습니다.\r
\r
    sum(), max(), min()이 있다면 reduce보다 그것을 사용하는 것이 더 명확합니다.\r
  snippet: |-\r
    seq = [1, 2, 3, 4, 5]\r
    total = reduce(lambda x, y: x + y, seq)\r
    total\r
  exercise:\r
    prompt: reduce 누적 연산 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      seq = [1, 2, 3, 4, 5]\r
      total = reduce(lambda x, y: x + y, seq)\r
      total\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: reduce 누적 연산에서 \`seq\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: reduce 누적 연산 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: lru_cache\r
  title: lru_cache - 메모이제이션\r
  structuredPrimary: true\r
  subtitle: 함수 결과 캐싱하기\r
  goal: lrucache 메모이제이션에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    lru_cache는 함수 호출 결과를 캐싱하여 같은 인자로 다시 호출될 때 저장된 값을 반환합니다. LRU(Least Recently Used) 알고리즘으로 캐시 크기를 관리하며, 재귀 함수나 비용이 큰 계산의 성능을 크게 향상시킵니다.\r
\r
    Python 3.9+에서는 @cache 데코레이터를 사용하면 무제한 캐시를 더 간단히 만들 수 있습니다.\r
  snippet: |-\r
    @lru_cache(maxsize=128)\r
    def fibonacci(n):\r
        if n < 2:\r
            return n\r
        return fibonacci(n - 1) + fibonacci(n - 2)\r
\r
    fib10 = fibonacci(10)\r
    fib10\r
  exercise:\r
    prompt: lrucache 메모이제이션 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      @lru_cache(maxsize=128)\r
      def fibonacci(n):\r
          if n < 2:\r
              return n\r
          return fibonacci(n - 1) + fibonacci(n - 2)\r
\r
      fib10 = fibonacci(10)\r
      fib10\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: lrucache 메모이제이션의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: lrucache 메모이제이션 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: wraps\r
  title: wraps - 데코레이터 작성\r
  structuredPrimary: true\r
  subtitle: 함수 메타데이터 보존하기\r
  goal: wraps 데코레이터 작성에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    wraps는 데코레이터를 만들 때 원본 함수의 메타데이터(__name__, __doc__ 등)를 보존합니다. 데코레이터로 함수를 감쌀 때 함수의 이름과 문서가 바뀌는 것을 방지하여 디버깅과 문서화를 돕습니다.\r
\r
    데코레이터를 만들 때는 항상 @wraps를 사용하여 원본 함수 정보를 보존하세요.\r
  snippet: |-\r
    import time\r
    def timer(func):\r
        @wraps(func)\r
        def wrapper(*args, **kwargs):\r
            start = time.time()\r
            result = func(*args, **kwargs)\r
            elapsed = time.time() - start\r
            return result\r
        return wrapper\r
\r
    @timer\r
    def slowFunc():\r
        time.sleep(0.1)\r
        return 'done'\r
\r
    slowFunc.__name__\r
  exercise:\r
    prompt: wraps 데코레이터 작성 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import time\r
      def timer(func):\r
          @wraps(func)\r
          def wrapper(*args, **kwargs):\r
              start = time.time()\r
              result = func(*args, **kwargs)\r
              elapsed = time.time() - start\r
              return result\r
          return wrapper\r
\r
      @timer\r
      def slowFunc():\r
          time.sleep(0.1)\r
          return 'done'\r
\r
      slowFunc.__name__\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: wraps 데코레이터 작성의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: wraps 데코레이터 작성 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: ordering\r
  title: total_ordering - 비교 연산자\r
  structuredPrimary: true\r
  subtitle: 클래스에 순서 부여하기\r
  goal: totalordering 비교 연산자에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    total_ordering은 클래스에 __eq__와 하나의 비교 메서드만 정의하면 나머지 비교 연산자를 자동 생성합니다. <, <=, >, >= 중 하나와 ==만 구현하면 되므로 코드를 줄이고 일관성을 보장합니다.\r
\r
    성능이 중요하다면 모든 비교 메서드를 직접 구현하는 것이 더 빠를 수 있습니다.\r
  snippet: |-\r
    @total_ordering\r
    class Student:\r
        def __init__(self, name, score):\r
            self.name = name\r
            self.score = score\r
        def __eq__(self, other):\r
            return self.score == other.score\r
        def __lt__(self, other):\r
            return self.score < other.score\r
\r
    alice = Student('Alice', 90)\r
    bob = Student('Bob', 85)\r
    alice > bob\r
  exercise:\r
    prompt: totalordering 비교 연산자 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      @total_ordering\r
      class Student:\r
          def __init__(self, name, score):\r
              self.name = name\r
              self.score = score\r
          def __eq__(self, other):\r
              return self.score == other.score\r
          def __lt__(self, other):\r
              return self.score < other.score\r
\r
      alice = Student('Alice', 90)\r
      bob = Student('Bob', 85)\r
      alice > bob\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: totalordering 비교 연산자의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: totalordering 비교 연산자 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practical\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: functools 실무 패턴\r
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    실무에서 자주 사용하는 functools 활용 패턴을 살펴봅니다. 성능 최적화, 데코레이터 체이닝, 함수 조합, 재사용 가능한 유틸리티 작성 등 다양한 문제를 functools로 해결할 수 있습니다.\r
\r
    여러 데코레이터를 조합할 때 @wraps는 가장 안쪽(함수에 가장 가까운 곳)에 위치해야 합니다.\r
  snippet: |-\r
    def retry(times, exceptionTypes=(RuntimeError,)):\r
        def decorator(func):\r
            @wraps(func)\r
            def wrapper(*args, **kwargs):\r
                for attempt in range(times):\r
                    try:\r
                        return func(*args, **kwargs)\r
                    except exceptionTypes as exc:\r
                        if attempt == times - 1:\r
                            raise RuntimeError("재시도 횟수를 모두 사용했습니다.") from exc\r
                return None\r
            return wrapper\r
        return decorator\r
\r
    @retry(3)\r
    def unstable():\r
        return 'success'\r
\r
    unstable()\r
  exercise:\r
    prompt: 실전 활용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def retry(times, exceptionTypes=(RuntimeError,)):\r
          def decorator(func):\r
              @wraps(func)\r
              def wrapper(*args, **kwargs):\r
                  for attempt in range(times):\r
                      try:\r
                          return func(*args, **kwargs)\r
                      except exceptionTypes as exc:\r
                          if attempt == times - 1:\r
                              raise RuntimeError("재시도 횟수를 모두 사용했습니다.") from exc\r
                  return None\r
              return wrapper\r
          return decorator\r
\r
      @retry(3)\r
      def unstable():\r
          return 'success'\r
\r
      unstable()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실전 활용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 함수형 업무 파이프라인'\r
  structuredPrimary: true\r
  subtitle: partial, reduce, cache, wraps 검증\r
  goal: '검증 루프: 함수형 업무 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    functools는 함수형 문법 자체보다 재사용 가능한 업무 파이프라인을 만들 때 가치가 큽니다. 부분 적용으로 설정을 고정하고, reduce로 집계하고, lru_cache와 wraps가 실제로 기대한 효과를 내는지 검증합니다.\r
\r
    변주 실험\r
    환율표를 함수 인자로 받도록 바꾸고, \`lru_cache\`를 붙일 때 dict가 해시 불가능하다는 점을 어떻게 우회할지 실험하세요.\r
  tips:\r
  - 변주 실험 환율표를 함수 인자로 받도록 바꾸고, \`lru_cache\`를 붙일 때 dict가 해시 불가능하다는 점을 어떻게 우회할지 실험하세요.\r
  snippet: |-\r
    exchangeRates = {"USD": 1350.0, "JPY": 9.0, "EUR": 1450.0}\r
\r
    def convertToKrw(amount, currency, feeRate):\r
        return round(amount * exchangeRates[currency] * (1 + feeRate), 2)\r
\r
    usdToKrwWithFee = partial(convertToKrw, currency="USD", feeRate=0.015)\r
    jpyToKrwWithoutFee = partial(convertToKrw, currency="JPY", feeRate=0.0)\r
\r
    assert usdToKrwWithFee(10) == 13702.5\r
    assert jpyToKrwWithoutFee(1000) == 9000.0\r
\r
    {"usd": usdToKrwWithFee(10), "jpy": jpyToKrwWithoutFee(1000)}\r
  exercise:\r
    prompt: '검증 루프: 함수형 업무 파이프라인 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      exchangeRates = {"USD": 1350.0, "JPY": 9.0, "EUR": 1450.0}\r
\r
      def convertToKrw(amount, currency, feeRate):\r
          return round(amount * exchangeRates[currency] * (1 + feeRate), 2)\r
\r
      usdToKrwWithFee = partial(convertToKrw, currency="USD", feeRate=0.015)\r
      jpyToKrwWithoutFee = partial(convertToKrw, currency="JPY", feeRate=0.0)\r
\r
      assert usdToKrwWithFee(10) == 13702.5\r
      assert jpyToKrwWithoutFee(1000) == 9000.0\r
\r
      {"usd": usdToKrwWithFee(10), "jpy": jpyToKrwWithoutFee(1000)}\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 함수형 업무 파이프라인의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: 함수형 업무 파이프라인 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: functools 모듈 종합 복습\r
  structuredPrimary: true\r
  subtitle: 함수형 프로그래밍 마스터하기\r
  goal: functools 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: functools 모듈의 다양한 기능을 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def add(a, b):\r
        return a + b\r
\r
    add5 = partial(add, 5)\r
    add5(3)\r
  exercise:\r
    prompt: functools 모듈 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def add(a, b):\r
          return a + b\r
\r
      add5 = partial(add, 5)\r
      add5(3)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: functools 모듈 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: functools 모듈 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 07_functools-currency-orders-mastery
    mode: mastery
    unseen: false
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
      prompt: summarize_currency_orders(rows, currency, fee_rate, rates)가 currency, count, values, totalKrw를 담은 dict를 반환하도록 완성하세요.
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
  retrievalVariants:
  - id: 07_functools-route-cache-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 07_functools-currency-orders-mastery
    title: 반복 경로 비용을 캐시로 줄이기
    subtitle: lru_cache의 hit와 miss 확인
    goal: 반복 route 요청의 거리 조회를 캐시하고 비용 목록과 cache hit, miss 수를 반환한다.
    why: 캐시는 붙이는 것으로 끝이 아니라 같은 인자 재호출에서 실제 조회가 줄었는지 증거로 확인해야 합니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 해시 가능한 start, end 인자만 cached 함수에 넘기세요.
    tips:
    - 거리표 dict는 cached 함수 바깥 closure에 두고, cached 함수 인자는 start와 end만 사용하세요.
    - cache_info().hits와 misses를 반환값에 포함하세요.
    exercise:
      prompt: summarize_route_costs(distance_pairs, route_requests, cost_per_km)가 costs, cacheHits, cacheMisses, rawLookups를 담은 dict를 반환하도록 완성하세요.
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
    minimumDelayHours: 24
`;export{e as default};