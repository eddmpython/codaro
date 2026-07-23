var e=`meta:\r
  id: '04'\r
  title: functools 완벽 가이드\r
  day: 4\r
  category: advancedPython\r
  tags:\r
  - functools\r
  - partial\r
  - lru_cache\r
  - singledispatch\r
  - 검증\r
  - 실무유틸\r
  seo:\r
    title: 파이썬 functools 완벽 가이드 - partial, lru_cache, singledispatch\r
    description: functools 모듈의 핵심 함수들을 마스터합니다. partial, wraps, lru_cache, singledispatch, total_ordering\r
      완벽 이해.\r
    keywords:\r
    - functools\r
    - partial\r
    - lru_cache\r
    - singledispatch\r
    - total_ordering\r
intro:\r
  emoji: 🔧\r
  points:\r
  - partial로 함수 인자 고정하기\r
  - lru_cache로 결과 캐싱하여 성능 향상\r
  - singledispatch로 타입 기반 함수 오버로딩\r
  - total_ordering으로 비교 연산자 자동 생성\r
  direction: functools 완벽 가이드에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - functools 완벽 가이드 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: functools.partia 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: functools.wraps 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: functools.lrucac 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: functools 완벽 가이드 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: functools 완벽 가이드 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: functools 완벽 가이드 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: partial_function\r
  title: functools.partial\r
  structuredPrimary: true\r
  subtitle: 함수 인자 고정\r
  goal: functools.partial에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    partial은 함수의 일부 인자를 미리 고정하여 새로운 함수를 만드는 도구입니다. 원본 함수와 고정할 인자를 받아 partial 객체를 반환합니다. 이 객체는 함수처럼 호출할 수 있으며, 호출 시 나머지 인자만 전달하면 됩니다. 커링(currying)의 간편한 구현이며, 콜백 함수에 추가 인자를 전달하거나, 설정이 다른 여러 버전의 함수를 만들 때 유용합니다. 키워드 인자도 고정할 수 있어 유연하게 활용됩니다.\r
\r
    partial 객체의 func, args, keywords 속성으로 원본 함수와 고정된 인자를 확인할 수 있습니다.\r
  snippet: |-\r
    from functools import partial\r
\r
    def multiply(a, b):\r
        return a * b\r
\r
    double = partial(multiply, 2)\r
    triple = partial(multiply, 3)\r
    double(5), triple(5)\r
  exercise:\r
    prompt: functools.partial 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from functools import partial\r
\r
      def multiply(a, b):\r
          return a * b\r
\r
      double = partial(multiply, 2)\r
      triple = partial(multiply, 3)\r
      double(5), triple(5)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: functools.partial의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: functools.partial 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: wraps_decorator\r
  title: functools.wraps\r
  structuredPrimary: true\r
  subtitle: 데코레이터 메타데이터 보존\r
  goal: functools.wraps에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    wraps는 데코레이터에서 원본 함수의 메타데이터(__name__, __doc__, __annotations__ 등)를 wrapper 함수로 복사하는 데코레이터입니다. wraps 없이 데코레이터를 만들면 래핑된 함수가 원본 함수의 정보를 잃어버려 디버깅과 문서화에 문제가 됩니다. wraps는 __wrapped__ 속성도 설정하여 원본 함수에 접근할 수 있게 합니다. 데코레이터를 작성할 때 항상 wraps를 사용하는 것이 모범 사례입니다.\r
\r
    WRAPPER_ASSIGNMENTS와 WRAPPER_UPDATES 상수로 복사할 속성을 커스터마이징할 수 있습니다.\r
  snippet: |-\r
    from functools import wraps\r
\r
    def myDecorator(func):\r
        @wraps(func)\r
        def wrapper(*args, **kwargs):\r
            return func(*args, **kwargs)\r
        return wrapper\r
\r
    @myDecorator\r
    def exampleFunc():\r
        """Example function docstring"""\r
        return 42\r
\r
    exampleFunc.__name__, exampleFunc.__doc__\r
  exercise:\r
    prompt: functools.wraps 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from functools import wraps\r
\r
      def myDecorator(func):\r
          @wraps(func)\r
          def wrapper(*args, **kwargs):\r
              return func(*args, **kwargs)\r
          return wrapper\r
\r
      @myDecorator\r
      def exampleFunc():\r
          """Example function docstring"""\r
          return 42\r
\r
      exampleFunc.__name__, exampleFunc.__doc__\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: functools.wraps의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: functools.wraps 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: lru_cache\r
  title: functools.lru_cache\r
  structuredPrimary: true\r
  subtitle: LRU 캐싱으로 성능 최적화\r
  goal: functools.lrucache에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    lru_cache는 함수의 호출 결과를 캐싱하여 동일한 인자로 다시 호출될 때 계산 없이 캐시된 결과를 반환하는 데코레이터입니다. LRU는 Least Recently Used의 약자로, 캐시가 가득 차면 가장 오래 사용되지 않은 항목을 제거합니다. maxsize 인자로 캐시 크기를 지정하며, None이면 무제한입니다. 피보나치, 팩토리얼 같은 재귀 함수나 비용이 큰 계산에 매우 효과적입니다. Python 3.9+에서는 @cache가 @lru_cache(maxsize=None)의 단축형으로 제공됩니다.\r
\r
    가변 객체(리스트, 딕셔너리)는 해시할 수 없어 lru_cache와 함께 사용할 수 없습니다.\r
  snippet: |-\r
    from functools import lru_cache\r
\r
    @lru_cache(maxsize=128)\r
    def fib(n):\r
        if n < 2:\r
            return n\r
        return fib(n - 1) + fib(n - 2)\r
\r
    fib(50), fib.cache_info()\r
  exercise:\r
    prompt: functools.lrucache 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from functools import lru_cache\r
\r
      @lru_cache(maxsize=128)\r
      def fib(n):\r
          if n < 2:\r
              return n\r
          return fib(n - 1) + fib(n - 2)\r
\r
      fib(50), fib.cache_info()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: functools.lrucache의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: functools.lrucache 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: cache\r
  title: functools.cache\r
  structuredPrimary: true\r
  subtitle: Python 3.9+ 무제한 캐시\r
  goal: functools.cache에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    Python 3.9에서 추가된 cache는 lru_cache(maxsize=None)의 간편한 별칭입니다. 캐시 크기 제한 없이 모든 호출 결과를 저장합니다. 메모리 사용량에 제한이 없으므로 주의가 필요하지만, 반복 호출이 많고 인자 조합이 제한된 경우에 최적입니다. lru_cache와 마찬가지로 cache_info()와 cache_clear() 메서드를 제공합니다.\r
\r
    메모리가 제한된 환경에서는 maxsize를 지정한 lru_cache를 사용하세요.\r
  snippet: |-\r
    from functools import cache\r
\r
    @cache\r
    def factorial(n):\r
        if n <= 1:\r
            return 1\r
        return n * factorial(n - 1)\r
\r
    factorial(100), factorial.cache_info()\r
  exercise:\r
    prompt: functools.cache 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from functools import cache\r
\r
      @cache\r
      def factorial(n):\r
          if n <= 1:\r
              return 1\r
          return n * factorial(n - 1)\r
\r
      factorial(100), factorial.cache_info()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: functools.cache의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: functools.cache 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: singledispatch\r
  title: functools.singledispatch\r
  structuredPrimary: true\r
  subtitle: 타입 기반 함수 오버로딩\r
  goal: functools.singledispatch에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    singledispatch는 첫 번째 인자의 타입에 따라 다른 구현을 호출하는 제네릭 함수를 만드는 데코레이터입니다. 함수 오버로딩을 파이썬에서 구현하는 방법입니다. 기본 함수를 @singledispatch로 데코레이트하고, 각 타입별 구현을 @func.register로 등록합니다. 등록된 타입이 없으면 기본 함수가 호출됩니다. 다형성을 함수 수준에서 구현할 때 유용합니다.\r
\r
    메서드에는 singledispatchmethod를 사용하세요.\r
  snippet: |-\r
    from functools import singledispatch\r
\r
    @singledispatch\r
    def process(arg):\r
        return f"Default: {arg}"\r
\r
    @process.register(int)\r
    def _(arg):\r
        return f"Integer: {arg * 2}"\r
\r
    @process.register(str)\r
    def _(arg):\r
        return f"String: {arg.upper()}"\r
\r
    process(10), process("hello"), process([1, 2])\r
  exercise:\r
    prompt: functools.singledispatch 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from functools import singledispatch\r
\r
      @singledispatch\r
      def process(arg):\r
          return f"Default: {arg}"\r
\r
      @process.register(int)\r
      def _(arg):\r
          return f"Integer: {arg * 2}"\r
\r
      @process.register(str)\r
      def _(arg):\r
          return f"String: {arg.upper()}"\r
\r
      process(10), process("hello"), process([1, 2])\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: functools.singledispatch의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: functools.singledispatch 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: total_ordering\r
  title: functools.total_ordering\r
  structuredPrimary: true\r
  subtitle: 비교 연산자 자동 생성\r
  goal: functools.totalordering에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    total_ordering은 __eq__와 하나의 순서 비교 메서드(__lt__, __le__, __gt__, __ge__ 중 하나)만 정의하면 나머지 비교 메서드를 자동으로 생성해주는 클래스 데코레이터입니다. 완전한 비교 지원을 위해 6개의 비교 메서드를 모두 작성하는 번거로움을 줄여줍니다. 다만 자동 생성된 메서드는 직접 구현한 것보다 약간 느릴 수 있으니, 성능이 중요하면 직접 구현을 고려하세요.\r
\r
    dataclass(order=True)도 비슷한 기능을 제공합니다.\r
  snippet: |-\r
    from functools import total_ordering\r
\r
    @total_ordering\r
    class Student:\r
        def __init__(self, name, grade):\r
            self.name = name\r
            self.grade = grade\r
\r
        def __eq__(self, other):\r
            return self.grade == other.grade\r
\r
        def __lt__(self, other):\r
            return self.grade < other.grade\r
\r
    s1 = Student("Alice", 85)\r
    s2 = Student("Bob", 90)\r
    s1 < s2, s1 <= s2, s1 > s2, s1 >= s2\r
  exercise:\r
    prompt: functools.totalordering 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from functools import total_ordering\r
\r
      @total_ordering\r
      class Student:\r
          def __init__(self, name, grade):\r
              self.name = name\r
              self.grade = grade\r
\r
          def __eq__(self, other):\r
              return self.grade == other.grade\r
\r
          def __lt__(self, other):\r
              return self.grade < other.grade\r
\r
      s1 = Student("Alice", 85)\r
      s2 = Student("Bob", 90)\r
      s1 < s2, s1 <= s2, s1 > s2, s1 >= s2\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: functools.totalordering의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: functools.totalordering 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: functools로 리포트 유틸리티 구성하기'\r
  structuredPrimary: true\r
  subtitle: partial → cache → singledispatch → ordering 검증\r
  goal: '현업 흐름 검증: functools로 리포트 유틸리티 구성하기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    functools는 작은 함수형 도구를 실무 유틸리티로 묶을 때 유용합니다. 인자 고정, 캐싱, 타입별 포맷팅, 정렬 가능한 객체를 하나의 리포트 흐름에서 검증합니다.\r
\r
    변주 실험\r
    \`renderValue\`에 list 렌더러를 추가하고, dict 안에 list가 들어가도 원하는 문자열로 렌더링되는지 assert를 추가하세요.\r
  tips:\r
  - 변주 실험 \`renderValue\`에 list 렌더러를 추가하고, dict 안에 list가 들어가도 원하는 문자열로 렌더링되는지 assert를 추가하세요.\r
  snippet: |-\r
    from functools import lru_cache, partial, singledispatch, total_ordering\r
\r
    def formatCurrency(value, currency):\r
        return f"{currency}{value:,}"\r
\r
    won = partial(formatCurrency, currency="₩")\r
\r
    @lru_cache(maxsize=4)\r
    def taxIncluded(price, taxRate):\r
        return int(price * (1 + taxRate))\r
\r
    @singledispatch\r
    def renderValue(value):\r
        return str(value)\r
\r
    @renderValue.register\r
    def _(value: int):\r
        return won(value)\r
\r
    @renderValue.register\r
    def _(value: dict):\r
        return ", ".join(f"{key}={renderValue(item)}" for key, item in sorted(value.items()))\r
\r
    @total_ordering\r
    class ReportItem:\r
        def __init__(self, name, priority):\r
            self.name = name\r
            self.priority = priority\r
\r
        def __eq__(self, other):\r
            return self.priority == other.priority\r
\r
        def __lt__(self, other):\r
            return self.priority < other.priority\r
\r
        def __repr__(self):\r
            return f"ReportItem({self.name!r}, {self.priority})"\r
\r
    report = {\r
        "gross": taxIncluded(100000, 0.1),\r
        "net": 100000,\r
    }\r
    items = [ReportItem("later", 3), ReportItem("first", 1), ReportItem("middle", 2)]\r
\r
    assert won(120000) == "₩120,000"\r
    assert taxIncluded(100000, 0.1) == 110000\r
    assert taxIncluded.cache_info().hits >= 0\r
    assert renderValue(report) == "gross=₩110,000, net=₩100,000"\r
    assert [item.name for item in sorted(items)] == ["first", "middle", "later"]\r
\r
    try:\r
        taxIncluded([100000], 0.1)\r
    except TypeError as exc:\r
        assert "unhashable" in str(exc)\r
\r
    print("functools 리포트 유틸리티 통과")\r
  exercise:\r
    prompt: '현업 흐름 검증: functools로 리포트 유틸리티 구성하기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      from functools import lru_cache, partial, singledispatch, total_ordering\r
\r
      def formatCurrency(value, currency):\r
          return f"{currency}{value:,}"\r
\r
      won = partial(formatCurrency, currency="₩")\r
\r
      @lru_cache(maxsize=4)\r
      def taxIncluded(price, taxRate):\r
          return int(price * (1 + taxRate))\r
\r
      @singledispatch\r
      def renderValue(value):\r
          return str(value)\r
\r
      @renderValue.register\r
      def _(value: int):\r
          return won(value)\r
\r
      @renderValue.register\r
      def _(value: dict):\r
          return ", ".join(f"{key}={renderValue(item)}" for key, item in sorted(value.items()))\r
\r
      @total_ordering\r
      class ReportItem:\r
          def __init__(self, name, priority):\r
              self.name = name\r
              self.priority = priority\r
\r
          def __eq__(self, other):\r
              return self.priority == other.priority\r
\r
          def __lt__(self, other):\r
              return self.priority < other.priority\r
\r
          def __repr__(self):\r
              return f"ReportItem({self.name!r}, {self.priority})"\r
\r
      report = {\r
          "gross": taxIncluded(100000, 0.1),\r
          "net": 100000,\r
      }\r
      items = [ReportItem("later", 3), ReportItem("first", 1), ReportItem("middle", 2)]\r
\r
      assert won(120000) == "₩120,000"\r
      assert taxIncluded(100000, 0.1) == 110000\r
      assert taxIncluded.cache_info().hits >= 0\r
      assert renderValue(report) == "gross=₩110,000, net=₩100,000"\r
      assert [item.name for item in sorted(items)] == ["first", "middle", "later"]\r
\r
      try:\r
          taxIncluded([100000], 0.1)\r
      except TypeError as exc:\r
          assert "unhashable" in str(exc)\r
\r
      print("functools 리포트 유틸리티 통과")\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: '현업 흐름 검증: functools로 리포트 유틸리티 구성하기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '현업 흐름 검증: functools로 리포트 유틸리티 구성하기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: functools 마스터하기\r
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Day 4에서 배운 functools 모듈을 난이도별로 복습합니다. functools는 고차 함수와 함수형 프로그래밍을 지원하는 표준 라이브러리의 핵심 모듈입니다.\r
    partial로 부분 적용, lru_cache로 메모이제이션, wraps로 데코레이터 메타데이터 보존, singledispatch로 제네릭 함수를 구현합니다. 🟢 기본 문제로\r
    각 함수의 기본 사용법을 익히고, 🟡 응용 문제로 조합 패턴을 연습하세요. 🔴 심화 문제에서는 reduce 활용, 캐시 전략, 멀티메서드 구현 등 고급 기법을 다룹니다. 이 모듈을\r
    마스터하면 더 간결하고 성능 좋은 함수형 코드를 작성할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from functools import partial\r
\r
    def power(base, exp):\r
        return base ** exp\r
\r
    square = partial(power, exp=2)\r
    square(5)\r
  exercise:\r
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from functools import partial\r
\r
      def power(base, exp):\r
          return base ** exp\r
\r
      square = partial(power, exp=2)\r
      square(5)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 04_advanced_functools-cached-currency-mastery
    mode: mastery
    unseen: false
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
  retrievalVariants:
  - id: 04_advanced_functools-tool-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - partial_function
    - lru_cache
    - wraps_decorator
    - singledispatch
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
    minimumDelayHours: 24
`;export{e as default};