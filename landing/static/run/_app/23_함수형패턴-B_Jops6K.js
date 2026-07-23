var e=`meta:\r
  id: '23'\r
  title: 함수형 패턴\r
  day: 23\r
  category: advancedPython\r
  tags:\r
  - functional\r
  - currying\r
  - monad\r
  - composition\r
  - pure-function\r
  - 검증\r
  - 데이터파이프라인\r
  seo:\r
    title: 파이썬 함수형 패턴 - 커링, 합성, 모나드\r
    description: 순수 함수, 고차 함수, 커링, 함수 합성, 모나드 패턴을 학습합니다.\r
    keywords:\r
    - 함수형\r
    - currying\r
    - monad\r
    - composition\r
    - pure function\r
intro:\r
  emoji: 🔗\r
  points:\r
  - 순수 함수와 불변성으로 부작용 최소화\r
  - 고차 함수와 클로저로 함수 팩토리 생성\r
  - 커링과 부분 적용으로 함수 재사용성 향상\r
  - 함수 합성과 파이프라인으로 데이터 변환\r
  direction: 함수형 패턴에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 함수형 패턴 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 순수 함수와 불변성 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: 고차 함수 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 커링과 부분 적용 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 함수형 패턴 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 함수형 패턴 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 함수형 패턴 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: pure_function\r
  title: 순수 함수와 불변성\r
  structuredPrimary: true\r
  subtitle: 부작용 없는 함수\r
  goal: 순수 함수와 불변성에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    순수 함수는 동일한 입력에 항상 동일한 출력을 반환하고 외부 상태를 변경하지 않습니다. 불변성은 데이터를 변경하지 않고 새로운 데이터를 생성합니다. 순수 함수는 테스트가 쉽고 병렬 처리에 안전합니다. 디버깅이 쉽고 예측 가능한 코드를 작성할 수 있습니다. 파이썬에서는 deepcopy를 활용하여 불변성을 구현합니다.\r
\r
    불변성을 유지하면 버그를 줄이고 상태 추적이 쉬워집니다.\r
  snippet: |-\r
    def pureAdd(a, b):\r
        return a + b\r
\r
    def pureMultiply(nums, factor):\r
        return [n * factor for n in nums]\r
\r
    def pureFilter(nums, predicate):\r
        return [n for n in nums if predicate(n)]\r
\r
    addResult = pureAdd(3, 5)\r
    mulResult = pureMultiply([1, 2, 3], 2)\r
    filterResult = pureFilter([1, 2, 3, 4, 5], lambda x: x % 2 == 0)\r
    pureResults = (addResult, mulResult, filterResult)\r
    pureResults\r
  exercise:\r
    prompt: 순수 함수와 불변성 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def pureAdd(a, b):\r
          return a + b\r
\r
      def pureMultiply(nums, factor):\r
          return [n * factor for n in nums]\r
\r
      def pureFilter(nums, predicate):\r
          return [n for n in nums if predicate(n)]\r
\r
      addResult = pureAdd(3, 5)\r
      mulResult = pureMultiply([1, 2, 3], 2)\r
      filterResult = pureFilter([1, 2, 3, 4, 5], lambda x: x % 2 == 0)\r
      pureResults = (addResult, mulResult, filterResult)\r
      pureResults\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 순수 함수와 불변성의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 순수 함수와 불변성 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: higher_order\r
  title: 고차 함수\r
  structuredPrimary: true\r
  subtitle: 함수를 다루는 함수\r
  goal: 고차 함수에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 고차 함수는 함수를 인자로 받거나 함수를 반환하는 함수입니다. map, filter, reduce가 대표적인 고차 함수입니다. 함수 합성과 파이프라인을 구성할\r
    수 있습니다. 클로저를 활용하여 함수 팩토리를 만들 수 있습니다. 코드 재사용성과 추상화 수준을 높입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def applyTwice(fn, x):\r
        return fn(fn(x))\r
\r
    def compose(f, g):\r
        return lambda x: f(g(x))\r
\r
    def pipe(*functions):\r
        def piped(value):\r
            result = value\r
            for fn in functions:\r
                result = fn(result)\r
            return result\r
        return piped\r
\r
    double = lambda x: x * 2\r
    addOne = lambda x: x + 1\r
\r
    twiceResult = applyTwice(double, 3)\r
    composed = compose(double, addOne)\r
    composeResult = composed(5)\r
    piped = pipe(addOne, double, addOne)\r
    pipeResult = piped(3)\r
    higherOrderResults = (twiceResult, composeResult, pipeResult)\r
    higherOrderResults\r
  exercise:\r
    prompt: 고차 함수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def applyTwice(fn, x):\r
          return fn(fn(x))\r
\r
      def compose(f, g):\r
          return lambda x: f(g(x))\r
\r
      def pipe(*functions):\r
          def piped(value):\r
              result = value\r
              for fn in functions:\r
                  result = fn(result)\r
              return result\r
          return piped\r
\r
      double = lambda x: x * 2\r
      addOne = lambda x: x + 1\r
\r
      twiceResult = applyTwice(double, 3)\r
      composed = compose(double, addOne)\r
      composeResult = composed(5)\r
      piped = pipe(addOne, double, addOne)\r
      pipeResult = piped(3)\r
      higherOrderResults = (twiceResult, composeResult, pipeResult)\r
      higherOrderResults\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 고차 함수의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 고차 함수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: currying\r
  title: 커링과 부분 적용\r
  structuredPrimary: true\r
  subtitle: 함수 인자 분리\r
  goal: 커링과 부분 적용에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 커링은 여러 인자를 받는 함수를 단일 인자 함수들의 체인으로 변환합니다. 부분 적용은 일부 인자를 미리 고정한 새 함수를 만듭니다. functools.partial로\r
    쉽게 부분 적용을 구현합니다. 함수 재사용성을 높이고 특화된 함수를 쉽게 생성합니다. 함수형 프로그래밍의 핵심 기법입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def curry2(fn):\r
        def curried(a):\r
            def inner(b):\r
                return fn(a, b)\r
            return inner\r
        return curried\r
\r
    def curry3(fn):\r
        def curried(a):\r
            def inner1(b):\r
                def inner2(c):\r
                    return fn(a, b, c)\r
                return inner2\r
            return inner1\r
        return curried\r
\r
    @curry2\r
    def addTwo(a, b):\r
        return a + b\r
\r
    @curry3\r
    def addThree(a, b, c):\r
        return a + b + c\r
\r
    add5 = addTwo(5)\r
    curryResult1 = add5(3)\r
    curryResult2 = addThree(1)(2)(3)\r
    curryResults = (curryResult1, curryResult2)\r
    curryResults\r
  exercise:\r
    prompt: 커링과 부분 적용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def curry2(fn):\r
          def curried(a):\r
              def inner(b):\r
                  return fn(a, b)\r
              return inner\r
          return curried\r
\r
      def curry3(fn):\r
          def curried(a):\r
              def inner1(b):\r
                  def inner2(c):\r
                      return fn(a, b, c)\r
                  return inner2\r
              return inner1\r
          return curried\r
\r
      @curry2\r
      def addTwo(a, b):\r
          return a + b\r
\r
      @curry3\r
      def addThree(a, b, c):\r
          return a + b + c\r
\r
      add5 = addTwo(5)\r
      curryResult1 = add5(3)\r
      curryResult2 = addThree(1)(2)(3)\r
      curryResults = (curryResult1, curryResult2)\r
      curryResults\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 커링과 부분 적용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 커링과 부분 적용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: composition\r
  title: 함수 합성\r
  structuredPrimary: true\r
  subtitle: 함수 조합\r
  goal: 함수 합성에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 함수 합성은 여러 함수를 조합하여 새로운 함수를 생성합니다. compose는 오른쪽에서 왼쪽으로, pipe는 왼쪽에서 오른쪽으로 실행합니다. reduce를\r
    활용하여 함수 체인을 구현합니다. 데이터 변환 파이프라인을 선언적으로 표현합니다. 코드 가독성과 재사용성이 향상됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from functools import reduce\r
\r
    def composeAll(*funcs):\r
        def composed(x):\r
            return reduce(lambda acc, fn: fn(acc), reversed(funcs), x)\r
        return composed\r
\r
    def pipeAll(*funcs):\r
        def piped(x):\r
            return reduce(lambda acc, fn: fn(acc), funcs, x)\r
        return piped\r
\r
    trim = str.strip\r
    upper = str.upper\r
    addExclaim = lambda s: s + "!"\r
\r
    processText = pipeAll(trim, upper, addExclaim)\r
    processResult = processText("  hello world  ")\r
\r
    negate = lambda x: -x\r
    absolute = abs\r
    doubleNum = lambda x: x * 2\r
\r
    processNum = composeAll(doubleNum, absolute, negate)\r
    numResult = processNum(-5)\r
    composeAllResults = (processResult, numResult)\r
    composeAllResults\r
  exercise:\r
    prompt: 함수 합성 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from functools import reduce\r
\r
      def composeAll(*funcs):\r
          def composed(x):\r
              return reduce(lambda acc, fn: fn(acc), reversed(funcs), x)\r
          return composed\r
\r
      def pipeAll(*funcs):\r
          def piped(x):\r
              return reduce(lambda acc, fn: fn(acc), funcs, x)\r
          return piped\r
\r
      trim = str.strip\r
      upper = str.upper\r
      addExclaim = lambda s: s + "!"\r
\r
      processText = pipeAll(trim, upper, addExclaim)\r
      processResult = processText("  hello world  ")\r
\r
      negate = lambda x: -x\r
      absolute = abs\r
      doubleNum = lambda x: x * 2\r
\r
      processNum = composeAll(doubleNum, absolute, negate)\r
      numResult = processNum(-5)\r
      composeAllResults = (processResult, numResult)\r
      composeAllResults\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 함수 합성의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 함수 합성 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: monad\r
  title: 펑터와 모나드\r
  structuredPrimary: true\r
  subtitle: 컨텍스트 내 값 변환\r
  goal: 펑터와 모나드에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 모나드는 값을 감싸고 변환하는 컨테이너 패턴입니다. Maybe 모나드는 null 안전한 연산을 제공합니다. Either 모나드는 성공/실패를 명시적으로 표현합니다.\r
    map은 값을 변환하고, flatMap은 중첩된 모나드를 평탄화합니다. 에러 처리를 우아하게 체이닝할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Maybe:\r
        def __init__(self, value):\r
            self._value = value\r
\r
        @staticmethod\r
        def just(value):\r
            return Maybe(value)\r
\r
        @staticmethod\r
        def nothing():\r
            return Maybe(None)\r
\r
        def isNothing(self):\r
            return self._value is None\r
\r
        def map(self, fn):\r
            if self.isNothing():\r
                return Maybe.nothing()\r
            return Maybe.just(fn(self._value))\r
\r
        def flatMap(self, fn):\r
            if self.isNothing():\r
                return Maybe.nothing()\r
            return fn(self._value)\r
\r
        def getOrElse(self, default):\r
            return default if self.isNothing() else self._value\r
\r
    def safeDivide(a, b):\r
        if b == 0:\r
            return Maybe.nothing()\r
        return Maybe.just(a / b)\r
\r
    maybeResult1 = Maybe.just(10).map(lambda x: x * 2).map(lambda x: x + 5)\r
    maybeResult2 = Maybe.nothing().map(lambda x: x * 2)\r
    maybeResult3 = Maybe.just(10).flatMap(lambda x: safeDivide(x, 2))\r
    maybeResult4 = Maybe.just(10).flatMap(lambda x: safeDivide(x, 0))\r
    maybeResults = (maybeResult1.getOrElse(0), maybeResult2.getOrElse(0), maybeResult3.getOrElse(0), maybeResult4.getOrElse(0))\r
    maybeResults\r
  exercise:\r
    prompt: 펑터와 모나드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class Maybe:\r
          def __init__(self, value):\r
              self._value = value\r
\r
          @staticmethod\r
          def just(value):\r
              return Maybe(value)\r
\r
          @staticmethod\r
          def nothing():\r
              return Maybe(None)\r
\r
          def isNothing(self):\r
              return self._value is None\r
\r
          def map(self, fn):\r
              if self.isNothing():\r
                  return Maybe.nothing()\r
              return Maybe.just(fn(self._value))\r
\r
          def flatMap(self, fn):\r
              if self.isNothing():\r
                  return Maybe.nothing()\r
              return fn(self._value)\r
\r
          def getOrElse(self, default):\r
              return default if self.isNothing() else self._value\r
\r
      def safeDivide(a, b):\r
          if b == 0:\r
              return Maybe.nothing()\r
          return Maybe.just(a / b)\r
\r
      maybeResult1 = Maybe.just(10).map(lambda x: x * 2).map(lambda x: x + 5)\r
      maybeResult2 = Maybe.nothing().map(lambda x: x * 2)\r
      maybeResult3 = Maybe.just(10).flatMap(lambda x: safeDivide(x, 2))\r
      maybeResult4 = Maybe.just(10).flatMap(lambda x: safeDivide(x, 0))\r
      maybeResults = (maybeResult1.getOrElse(0), maybeResult2.getOrElse(0), maybeResult3.getOrElse(0), maybeResult4.getOrElse(0))\r
      maybeResults\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 펑터와 모나드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 펑터와 모나드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: utilities\r
  title: 함수형 유틸리티\r
  structuredPrimary: true\r
  subtitle: 실용적 헬퍼\r
  goal: 함수형 유틸리티에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 함수형 프로그래밍에서 자주 사용하는 유틸리티 함수들입니다. identity는 입력을 그대로 반환합니다. constant는 항상 같은 값을 반환하는 함수를 만듭니다.\r
    memoize는 함수 결과를 캐싱합니다. head, tail, take, drop 등 리스트 유틸리티도 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def identity(x):\r
        return x\r
\r
    def constant(x):\r
        return lambda _: x\r
\r
    def flip(fn):\r
        return lambda a, b: fn(b, a)\r
\r
    def memoize(fn):\r
        cache = {}\r
        def memoized(*args):\r
            if args not in cache:\r
                cache[args] = fn(*args)\r
            return cache[args]\r
        return memoized\r
\r
    @memoize\r
    def fibonacci(n):\r
        if n <= 1:\r
            return n\r
        return fibonacci(n - 1) + fibonacci(n - 2)\r
\r
    identityResult = identity(42)\r
    alwaysFive = constant(5)\r
    constantResult = alwaysFive("anything")\r
    subtract = lambda a, b: a - b\r
    flippedSub = flip(subtract)\r
    flipResult = (subtract(10, 3), flippedSub(10, 3))\r
    fibResult = fibonacci(30)\r
    utilResults = (identityResult, constantResult, flipResult, fibResult)\r
    utilResults\r
  exercise:\r
    prompt: 함수형 유틸리티 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def identity(x):\r
          return x\r
\r
      def constant(x):\r
          return lambda _: x\r
\r
      def flip(fn):\r
          return lambda a, b: fn(b, a)\r
\r
      def memoize(fn):\r
          cache = {}\r
          def memoized(*args):\r
              if args not in cache:\r
                  cache[args] = fn(*args)\r
              return cache[args]\r
          return memoized\r
\r
      @memoize\r
      def fibonacci(n):\r
          if n <= 1:\r
              return n\r
          return fibonacci(n - 1) + fibonacci(n - 2)\r
\r
      identityResult = identity(42)\r
      alwaysFive = constant(5)\r
      constantResult = alwaysFive("anything")\r
      subtract = lambda a, b: a - b\r
      flippedSub = flip(subtract)\r
      flipResult = (subtract(10, 3), flippedSub(10, 3))\r
      fibResult = fibonacci(30)\r
      utilResults = (identityResult, constantResult, flipResult, fibResult)\r
      utilResults\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 함수형 유틸리티의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 함수형 유틸리티 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 주문 이벤트 함수형 파이프라인'\r
  structuredPrimary: true\r
  subtitle: 순수 함수, 합성, 불변 입력, 오류 값을 함께 확인합니다\r
  goal: '현업 흐름 검증: 주문 이벤트 함수형 파이프라인에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    함수형 패턴은 어렵게 보이는 문법보다 데이터 흐름을 예측하기 쉬워지는지가 핵심입니다. 주문 이벤트를 정규화하고, 결제 완료 건만 골라 합계를 내는 과정을 순수 함수로 분리해보세요.\r
\r
    변주 실험\r
    \`onlyPaid\` 대신 \`amount\`가 10,000 이상인 주문만 고르는 함수를 추가하고, 파이프라인 순서를 바꿨을 때 결과가 어떻게 달라지는지 확인하세요.\r
  tips:\r
  - 변주 실험 \`onlyPaid\` 대신 \`amount\`가 10,000 이상인 주문만 고르는 함수를 추가하고, 파이프라인 순서를 바꿨을 때 결과가 어떻게 달라지는지 확인하세요.\r
  snippet: |-\r
    from functools import reduce\r
\r
    def pipe(value, *functions):\r
        return reduce(lambda current, function: function(current), functions, value)\r
\r
    def normalize(events):\r
        return [\r
            {**event, "status": event["status"].lower(), "amount": int(event["amount"])}\r
            for event in events\r
        ]\r
\r
    def onlyPaid(events):\r
        return [event for event in events if event["status"] == "paid"]\r
\r
    def summarize(events):\r
        return {\r
            "count": len(events),\r
            "amount": sum(event["amount"] for event in events),\r
            "ids": [event["id"] for event in events],\r
        }\r
\r
    rawEvents = [\r
        {"id": "O-1", "status": "PAID", "amount": "12000"},\r
        {"id": "O-2", "status": "DRAFT", "amount": "8000"},\r
        {"id": "O-3", "status": "PAID", "amount": "5000"},\r
    ]\r
\r
    summary = pipe(rawEvents, normalize, onlyPaid, summarize)\r
\r
    assert summary == {"count": 2, "amount": 17000, "ids": ["O-1", "O-3"]}\r
    assert rawEvents[0]["status"] == "PAID"\r
  exercise:\r
    prompt: '현업 흐름 검증: 주문 이벤트 함수형 파이프라인 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      from functools import reduce\r
\r
      def pipe(value, *functions):\r
          return reduce(lambda current, function: function(current), functions, value)\r
\r
      def normalize(events):\r
          return [\r
              {**event, "status": event["status"].lower(), "amount": int(event["amount"])}\r
              for event in events\r
          ]\r
\r
      def onlyPaid(events):\r
          return [event for event in events if event["status"] == "paid"]\r
\r
      def summarize(events):\r
          return {\r
              "count": len(events),\r
              "amount": sum(event["amount"] for event in events),\r
              "ids": [event["id"] for event in events],\r
          }\r
\r
      rawEvents = [\r
          {"id": "O-1", "status": "PAID", "amount": "12000"},\r
          {"id": "O-2", "status": "DRAFT", "amount": "8000"},\r
          {"id": "O-3", "status": "PAID", "amount": "5000"},\r
      ]\r
\r
      summary = pipe(rawEvents, normalize, onlyPaid, summarize)\r
\r
      assert summary == {"count": 2, "amount": 17000, "ids": ["O-1", "O-3"]}\r
      assert rawEvents[0]["status"] == "PAID"\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 주문 이벤트 함수형 파이프라인의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 주문 이벤트 함수형 파이프라인 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 연습\r
  structuredPrimary: true\r
  subtitle: 함수형 패턴 마스터\r
  goal: 종합 연습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Day 23에서 배운 함수형 프로그래밍 패턴을 종합적으로 연습합니다. 순수 함수와 불변성은 부작용을 최소화하고, 커링과 부분 적용은 함수 재사용성을 극대화합니다.\r
    함수 합성과 파이프라인은 데이터 변환을 선언적으로 표현하는 강력한 도구입니다. 🟢 기본 문제로 map/filter/reduce와 고차 함수의 직접 구현을 익히고, 🟡 응용 문제로\r
    커링, 합성 패턴을 연습하세요. 🔴 심화 문제에서는 Maybe, Either 모나드와 함수형 에러 처리를 직접 구현해봅니다. 함수형 패턴은 React, Redux 등 현대 프레임워크의\r
    기반이므로 반드시 숙달해야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def myMap(fn, iterable):\r
        return [fn(x) for x in iterable]\r
\r
    def myFilter(predicate, iterable):\r
        return [x for x in iterable if predicate(x)]\r
\r
    def myReduce(fn, iterable, initial):\r
        acc = initial\r
        for x in iterable:\r
            acc = fn(acc, x)\r
        return acc\r
\r
    mapTest = myMap(lambda x: x ** 2, [1, 2, 3, 4])\r
    filterTest = myFilter(lambda x: x > 2, [1, 2, 3, 4])\r
    reduceTest = myReduce(lambda a, b: a + b, [1, 2, 3, 4], 0)\r
    ex1Result = (mapTest, filterTest, reduceTest)\r
    ex1Result\r
  exercise:\r
    prompt: 종합 연습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def myMap(fn, iterable):\r
          return [fn(x) for x in iterable]\r
\r
      def myFilter(predicate, iterable):\r
          return [x for x in iterable if predicate(x)]\r
\r
      def myReduce(fn, iterable, initial):\r
          acc = initial\r
          for x in iterable:\r
              acc = fn(acc, x)\r
          return acc\r
\r
      mapTest = myMap(lambda x: x ** 2, [1, 2, 3, 4])\r
      filterTest = myFilter(lambda x: x > 2, [1, 2, 3, 4])\r
      reduceTest = myReduce(lambda a, b: a + b, [1, 2, 3, 4], 0)\r
      ex1Result = (mapTest, filterTest, reduceTest)\r
      ex1Result\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 연습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 연습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 23_functional_patterns-paid-order-pipeline-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - pure_function
    - higher_order
    - composition
    - workflow_validation
    title: 주문 이벤트를 순수 함수 파이프라인으로 요약하기
    subtitle: pure pipeline summary
    goal: summarize_paid_orders(raw_events)를 완성해 원본을 바꾸지 않고 정규화, 필터, 요약을 순서대로 적용한다.
    why: 함수형 패턴의 가치는 멋진 용어가 아니라, 데이터 변환 단계를 작고 예측 가능한 함수로 나누어 실패 지점을 좁히는 데 있습니다.
    explanation: status는 소문자로 정규화하고 amount는 int로 변환한 뒤, paid 이벤트만 남겨 count, amount, ids를 반환하세요. 원본의 첫 status도 함께 반환해 불변성을 확인합니다.
    tips:
    - 새 dict를 만들어 반환하면 원본 이벤트를 바꾸지 않을 수 있습니다.
    - 파이프라인의 각 단계는 같은 종류의 데이터를 받아 다음 단계가 기대하는 형태로 돌려줘야 합니다.
    exercise:
      prompt: summarize_paid_orders(raw_events)를 완성해 paid 요약과 원본 보존 상태를 반환하세요.
      starterCode: |-
        def summarize_paid_orders(raw_events):
            raise NotImplementedError
      solution: |-
        def summarize_paid_orders(raw_events):
            def normalize(events):
                return [
                    {**event, "status": event["status"].lower(), "amount": int(event["amount"])}
                    for event in events
                ]

            def only_paid(events):
                return [event for event in events if event["status"] == "paid"]

            def summarize(events):
                return {
                    "count": len(events),
                    "amount": sum(event["amount"] for event in events),
                    "ids": [event["id"] for event in events],
                }

            normalized = normalize(raw_events)
            paid = only_paid(normalized)
            summary = summarize(paid)
            summary["originalFirstStatus"] = raw_events[0]["status"] if raw_events else None
            return summary
      hints:
      - normalize 단계에서 {**event, ...}를 쓰면 새 dict를 만들 수 있습니다.
      - 원본 보존 여부는 raw_events의 값을 다시 읽어 확인하세요.
    check:
      id: python.advanced.functional-pipeline.paid-orders.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.functional-pipeline.empty.behavior.v1.fixture
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
        entry: summarize_paid_orders
        cases:
        - id: normalizes-filters-and-preserves-original
          arguments:
          - value:
            - id: O-1
              status: PAID
              amount: "12000"
            - id: O-2
              status: DRAFT
              amount: "8000"
            - id: O-3
              status: PAID
              amount: "5000"
          expectedReturn:
            count: 2
            amount: 17000
            ids:
            - O-1
            - O-3
            originalFirstStatus: PAID
        - id: handles-empty-events
          arguments:
          - value: []
          expectedReturn:
            count: 0
            amount: 0
            ids: []
            originalFirstStatus: null
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 23_functional_patterns-text-pipeline-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - currying
    - composition
    - utilities
    title: 문자열 정제 파이프라인을 단계 목록으로 합성하기
    subtitle: composed text pipeline transfer
    goal: run_text_pipeline(value, steps)를 완성해 단계 이름 목록을 함수 테이블로 합성하고 trace를 반환한다.
    why: 함수 합성을 주문 이벤트가 아닌 텍스트 정제에 옮기면, 같은 사고가 데이터 종류와 관계없이 작동하는지 확인할 수 있습니다.
    explanation: strip, lower, digits-only, dash-groups 단계를 지원하세요. 알 수 없는 단계는 ValueError로 거부합니다.
    tips:
    - 단계 이름을 함수로 매핑하면 실행 순서를 데이터로 다룰 수 있습니다.
    - trace를 남기면 어느 단계에서 값이 바뀌었는지 학습자가 확인할 수 있습니다.
    exercise:
      prompt: run_text_pipeline(value, steps)를 완성해 최종 value와 단계별 trace를 반환하세요.
      starterCode: |-
        def run_text_pipeline(value, steps):
            raise NotImplementedError
      solution: |-
        def run_text_pipeline(value, steps):
            def dash_groups(text):
                chunks = [text[index:index + 3] for index in range(0, len(text), 3)]
                return "-".join(chunks)

            functions = {
                "strip": lambda text: text.strip(),
                "lower": lambda text: text.lower(),
                "digits-only": lambda text: "".join(ch for ch in text if ch.isdigit()),
                "dash-groups": dash_groups,
            }
            current = value
            trace = []
            for step in steps:
                if step not in functions:
                    raise ValueError("unknown pipeline step")
                current = functions[step](current)
                trace.append({"step": step, "value": current})
            return {"value": current, "trace": trace}
      hints:
      - 함수 테이블은 고차 함수와 합성의 작은 실무 형태입니다.
      - dash-groups는 현재 문자열을 3글자씩 잘라 다시 join하면 됩니다.
    check:
      id: python.advanced.functional-pipeline.text-pipeline.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.functional-pipeline.empty.behavior.v1.fixture
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
        entry: run_text_pipeline
        cases:
        - id: composes-cleaning-steps-in-order
          arguments:
          - value: "  Order #AB-120034  "
          - value:
            - strip
            - lower
            - digits-only
            - dash-groups
          expectedReturn:
            value: 120-034
            trace:
            - step: strip
              value: "Order #AB-120034"
            - step: lower
              value: "order #ab-120034"
            - step: digits-only
              value: "120034"
            - step: dash-groups
              value: 120-034
        - id: rejects-unknown-step
          arguments:
          - value: abc
          - value:
            - reverse
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 23_functional_patterns-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - pure_function
    - higher_order
    - currying
    - composition
    - monad
    - utilities
    title: 함수형 패턴 선택 기준 회상하기
    subtitle: functional pattern recall
    goal: choose_functional_pattern(need)를 완성해 요구사항별 함수형 도구와 주의점을 반환한다.
    why: 함수형 패턴은 모든 코드를 함수로 바꾸자는 구호가 아니라, 부작용 경계, 변환 합성, 실패 표현을 더 명확하게 만드는 선택지입니다.
    explanation: avoid-mutation, pass-behavior, preset-argument, chain-transforms, safe-missing-value, aggregate-list 상황별 패턴을 선택하세요.
    tips:
    - 순수 함수는 테스트하기 쉽지만 외부 입출력 경계는 별도로 설계해야 합니다.
    - reduce는 누적 규칙이 명확할 때만 읽기 쉽습니다.
    exercise:
      prompt: choose_functional_pattern(need)를 완성해 pattern, useWhen, caution을 반환하세요.
      starterCode: |-
        def choose_functional_pattern(need):
            raise NotImplementedError
      solution: |-
        def choose_functional_pattern(need):
            table = {
                "avoid-mutation": {
                    "pattern": "pure-function",
                    "useWhen": "same input should always produce the same output",
                    "caution": "copy mutable inputs before changing shape",
                },
                "pass-behavior": {
                    "pattern": "higher-order-function",
                    "useWhen": "the operation should be supplied as an argument",
                    "caution": "document the function contract",
                },
                "preset-argument": {
                    "pattern": "partial-application",
                    "useWhen": "some arguments are fixed for repeated calls",
                    "caution": "avoid hiding important context",
                },
                "chain-transforms": {
                    "pattern": "composition",
                    "useWhen": "small transformations form a pipeline",
                    "caution": "each step should return the next step input shape",
                },
                "safe-missing-value": {
                    "pattern": "maybe-or-either",
                    "useWhen": "failure should travel as data instead of an exception",
                    "caution": "do not obscure real programming errors",
                },
                "aggregate-list": {
                    "pattern": "reduce",
                    "useWhen": "many values collapse into one accumulator",
                    "caution": "a loop may be clearer for complex state",
                },
            }
            if need not in table:
                raise ValueError("unknown functional need")
            return table[need]
      hints:
      - 함수형 선택은 테스트 가능성과 데이터 흐름 가독성을 기준으로 판단하세요.
      - 실패를 값으로 다룰 때도 관측성과 오류 메시지는 남겨야 합니다.
    check:
      id: python.advanced.functional-pipeline.choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.functional-pipeline.empty.behavior.v1.fixture
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
        entry: choose_functional_pattern
        cases:
        - id: recalls-composition-for-pipelines
          arguments:
          - value: chain-transforms
          expectedReturn:
            pattern: composition
            useWhen: small transformations form a pipeline
            caution: each step should return the next step input shape
        - id: recalls-pure-function-for-mutation-boundary
          arguments:
          - value: avoid-mutation
          expectedReturn:
            pattern: pure-function
            useWhen: same input should always produce the same output
            caution: copy mutable inputs before changing shape
        - id: rejects-unknown-need
          arguments:
          - value: lambda-everywhere
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};