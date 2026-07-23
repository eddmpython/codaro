var e=`meta:\r
  id: '03'\r
  title: 클로저와 상태 관리\r
  day: 3\r
  category: advancedPython\r
  tags:\r
  - closure\r
  - nonlocal\r
  - 상태관리\r
  - 메모이제이션\r
  - 검증\r
  - 캡슐화\r
  seo:\r
    title: 파이썬 클로저와 상태 관리 - 함수형 프로그래밍 핵심\r
    description: 클로저의 정의와 동작 원리를 이해하고 상태 캡슐화, 메모이제이션 패턴을 마스터합니다.\r
    keywords:\r
    - closure\r
    - 클로저\r
    - nonlocal\r
    - 메모이제이션\r
    - 상태관리\r
intro:\r
  emoji: 🔒\r
  points:\r
  - 클로저의 정의와 자유 변수 개념\r
  - nonlocal 키워드로 외부 스코프 변수 수정\r
  - 클로저를 이용한 상태 캡슐화 패턴\r
  - 메모이제이션으로 성능 최적화\r
  direction: 클로저와 상태 관리에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 클로저와 상태 관리 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 클로저 정의 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: 상태 캡슐화 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 팩토리 패턴 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 클로저와 상태 관리 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 클로저와 상태 관리 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 클로저와 상태 관리 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: closure_definition\r
  title: 클로저 정의\r
  structuredPrimary: true\r
  subtitle: 자유 변수를 기억하는 함수\r
  goal: 클로저 정의에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    클로저(Closure)는 자신이 정의된 스코프의 변수를 기억하는 함수입니다. 내부 함수가 외부 함수의 지역 변수를 참조하면, 외부 함수가 종료되어도 그 변수가 메모리에 유지됩니다. 이렇게 내부 함수에 의해 참조되는 외부 변수를 '자유 변수(free variable)'라고 합니다. 파이썬에서 클로저는 함수 객체의 __closure__ 속성에 셀(cell) 객체로 자유 변수를 저장합니다. 클로저는 데이터를 함수와 함께 묶어두는 방법으로, 객체지향의 인스턴스와 유사한 역할을 할 수 있습니다.\r
\r
    클로저는 함수가 일급 객체인 언어에서 강력한 패턴입니다. 데코레이터도 클로저를 활용합니다.\r
  snippet: |-\r
    def outer(x):\r
        def inner(y):\r
            return x + y\r
        return inner\r
\r
    addFive = outer(5)\r
    addFive(3)\r
  exercise:\r
    prompt: 클로저 정의 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def outer(x):\r
          def inner(y):\r
              return x + y\r
          return inner\r
\r
      addFive = outer(5)\r
      addFive(3)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 클로저 정의의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 클로저 정의 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: state_encapsulation\r
  title: 상태 캡슐화\r
  structuredPrimary: true\r
  subtitle: 프라이빗 변수 흉내내기\r
  goal: 상태 캡슐화에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    클로저를 사용하면 외부에서 직접 접근할 수 없는 '프라이빗' 상태를 만들 수 있습니다. 외부 함수의 지역 변수는 반환된 내부 함수를 통해서만 접근하거나 수정할 수 있습니다. 이 패턴은 데이터 은닉(data hiding)을 구현하는 함수형 프로그래밍 방식입니다. 클래스의 프라이빗 속성과 유사하지만 더 간결하게 표현할 수 있습니다. 카운터, 누산기, 토글 등 간단한 상태 관리에 자주 사용됩니다.\r
\r
    복잡한 상태 관리가 필요하면 클래스를 사용하세요. 클로저는 간단한 경우에 적합합니다.\r
  snippet: |-\r
    def makeCounter():\r
        count = 0\r
        def counter():\r
            nonlocal count\r
            count += 1\r
            return count\r
        return counter\r
\r
    counter1 = makeCounter()\r
    counter1(), counter1(), counter1()\r
  exercise:\r
    prompt: 상태 캡슐화 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def makeCounter():\r
          count = 0\r
          def counter():\r
              nonlocal count\r
              count += 1\r
              return count\r
          return counter\r
\r
      counter1 = makeCounter()\r
      counter1(), counter1(), counter1()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 상태 캡슐화의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 상태 캡슐화 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: factory_pattern\r
  title: 팩토리 패턴\r
  structuredPrimary: true\r
  subtitle: 함수 생성기\r
  goal: 팩토리 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    클로저는 특정 설정이 적용된 함수를 생성하는 팩토리로 활용됩니다. 외부 함수가 설정값을 받아 그 값이 적용된 함수를 반환합니다. 이 패턴은 비슷한 동작을 하지만 세부 설정이 다른 여러 함수를 만들 때 유용합니다. 예를 들어 특정 진법으로 변환하는 함수, 특정 형식으로 포맷팅하는 함수 등을 팩토리로 생성할 수 있습니다. 팩토리 패턴은 코드 재사용성을 높이고 설정의 분리를 가능하게 합니다.\r
\r
    functools.partial도 비슷한 역할을 하지만, 클로저는 더 복잡한 로직을 캡슐화할 수 있습니다.\r
  snippet: |-\r
    def makeFormatter(template):\r
        def formatter(value):\r
            return template.format(value=value)\r
        return formatter\r
\r
    dollarFormat = makeFormatter("\${value:.2f}")\r
    percentFormat = makeFormatter("{value:.1%}")\r
    dollarFormat(1234.5), percentFormat(0.856)\r
  exercise:\r
    prompt: 팩토리 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def makeFormatter(template):\r
          def formatter(value):\r
              return template.format(value=value)\r
          return formatter\r
\r
      dollarFormat = makeFormatter("\${value:.2f}")\r
      percentFormat = makeFormatter("{value:.1%}")\r
      dollarFormat(1234.5), percentFormat(0.856)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 팩토리 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 팩토리 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: memoization\r
  title: 메모이제이션\r
  structuredPrimary: true\r
  subtitle: 결과 캐싱으로 성능 최적화\r
  goal: 메모이제이션에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    메모이제이션(Memoization)은 함수 호출 결과를 저장하여 같은 인자로 다시 호출될 때 저장된 결과를 반환하는 최적화 기법입니다. 클로저를 사용하면 캐시를 함수와 함께 캡슐화할 수 있습니다. 재귀 함수에서 특히 효과적이며, 피보나치 수열 같은 중복 계산이 많은 알고리즘의 성능을 극적으로 향상시킵니다. 실제로는 functools.lru_cache를 사용하는 것이 더 편리하지만, 원리를 이해하는 것이 중요합니다.\r
\r
    실무에서는 @functools.lru_cache를 사용하세요. 스레드 안전하고 더 많은 기능을 제공합니다.\r
  snippet: |-\r
    def memoize(func):\r
        cache = {}\r
        def wrapper(*args):\r
            if args not in cache:\r
                cache[args] = func(*args)\r
            return cache[args]\r
        wrapper.cache = cache\r
        return wrapper\r
\r
    @memoize\r
    def slowAdd(a, b):\r
        return a + b\r
\r
    slowAdd(1, 2), slowAdd(1, 2), slowAdd.cache\r
  exercise:\r
    prompt: 메모이제이션 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def memoize(func):\r
          cache = {}\r
          def wrapper(*args):\r
              if args not in cache:\r
                  cache[args] = func(*args)\r
              return cache[args]\r
          wrapper.cache = cache\r
          return wrapper\r
\r
      @memoize\r
      def slowAdd(a, b):\r
          return a + b\r
\r
      slowAdd(1, 2), slowAdd(1, 2), slowAdd.cache\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 메모이제이션의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 메모이제이션 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: nonlocal_keyword\r
  title: nonlocal 키워드\r
  structuredPrimary: true\r
  subtitle: 외부 스코프 변수 수정\r
  goal: nonlocal 키워드에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    nonlocal 키워드는 내부 함수에서 외부 함수의 지역 변수를 수정할 때 사용합니다. 파이썬에서 변수에 값을 할당하면 기본적으로 가장 가까운 스코프에 새 변수를 생성합니다. nonlocal을 사용하면 바깥 스코프의 기존 변수를 참조하여 수정할 수 있습니다. global은 모듈 수준의 전역 변수를, nonlocal은 감싸고 있는 함수의 지역 변수를 수정합니다. 클로저에서 상태를 변경해야 할 때 필수적입니다.\r
\r
    nonlocal 없이도 리스트나 딕셔너리 같은 가변 객체의 내용은 수정할 수 있습니다.\r
  snippet: |-\r
    def outerBad():\r
        count = 0\r
        def inner():\r
            count = count + 1\r
            return count\r
        return inner\r
\r
    try:\r
        badCounter = outerBad()\r
        badCounter()\r
    except UnboundLocalError as e:\r
        str(e)[:50]\r
  exercise:\r
    prompt: nonlocal 키워드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def outerBad():\r
          count = 0\r
          def inner():\r
              count = count + 1\r
              return count\r
          return inner\r
\r
      try:\r
          badCounter = outerBad()\r
          badCounter()\r
      except UnboundLocalError as e:\r
          str(e)[:50]\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: nonlocal 키워드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: nonlocal 키워드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: closure_vs_class\r
  title: 클로저 vs 클래스\r
  structuredPrimary: true\r
  subtitle: 언제 무엇을 사용할까\r
  goal: 클로저 vs 클래스에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    클로저와 클래스는 둘 다 상태를 캡슐화할 수 있습니다. 클로저는 단일 동작과 간단한 상태에 적합하고, 클래스는 여러 메서드와 복잡한 상태에 적합합니다. 클로저는 코드가 더 간결하고 함수형 스타일에 맞지만, 디버깅이 어려울 수 있습니다. 클래스는 명시적이고 확장성이 좋으며, 타입 힌팅과 IDE 지원이 더 좋습니다. 콜백이나 데코레이터처럼 함수를 인자로 전달해야 하는 경우에는 클로저가 자연스럽습니다.\r
\r
    상태가 하나이고 동작도 하나라면 클로저, 그 외에는 클래스를 고려하세요.\r
  snippet: |-\r
    def makeClosureCounter():\r
        value = 0\r
        def increment():\r
            nonlocal value\r
            value += 1\r
            return value\r
        def get():\r
            return value\r
        return increment, get\r
\r
    inc, get = makeClosureCounter()\r
    inc(), inc(), get()\r
  exercise:\r
    prompt: 클로저 vs 클래스 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def makeClosureCounter():\r
          value = 0\r
          def increment():\r
              nonlocal value\r
              value += 1\r
              return value\r
          def get():\r
              return value\r
          return increment, get\r
\r
      inc, get = makeClosureCounter()\r
      inc(), inc(), get()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 클로저 vs 클래스의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 클로저 vs 클래스 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 클로저로 요청 제한기와 캐시 만들기'\r
  structuredPrimary: true\r
  subtitle: 예측 → 상태 캡슐화 → 초과 오류 → 캐시 검증\r
  goal: '현업 흐름 검증: 클로저로 요청 제한기와 캐시 만들기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    클로저는 간단한 상태를 함수 안에 숨기고, 외부에서는 정해진 동작으로만 상태를 바꾸게 할 때 좋습니다. 요청 제한기와 계산 캐시를 만들어 상태가 기대대로 유지되는지 확인합니다.\r
\r
    변주 실험\r
    요청 제한기를 사용자 ID별로 따로 동작하게 바꾸고, A 사용자의 초과가 B 사용자에게 영향을 주지 않는지 검증하세요.\r
  tips:\r
  - 변주 실험 요청 제한기를 사용자 ID별로 따로 동작하게 바꾸고, A 사용자의 초과가 B 사용자에게 영향을 주지 않는지 검증하세요.\r
  snippet: |-\r
    def makeRateLimiter(limit):\r
        if limit <= 0:\r
            raise ValueError("limit must be positive")\r
\r
        used = 0\r
\r
        def allowRequest():\r
            nonlocal used\r
            if used >= limit:\r
                raise RuntimeError("request limit exceeded")\r
            used += 1\r
            return {"allowed": True, "remaining": limit - used}\r
\r
        return allowRequest\r
\r
    def makeMemoizedSquare():\r
        cache = {}\r
        callCount = 0\r
\r
        def square(value):\r
            nonlocal callCount\r
            if value not in cache:\r
                callCount += 1\r
                cache[value] = value * value\r
            return cache[value]\r
\r
        def stats():\r
            return {"callCount": callCount, "cacheKeys": sorted(cache)}\r
\r
        return square, stats\r
\r
    limiter = makeRateLimiter(2)\r
    assert limiter() == {"allowed": True, "remaining": 1}\r
    assert limiter() == {"allowed": True, "remaining": 0}\r
\r
    try:\r
        limiter()\r
    except RuntimeError as exc:\r
        assert "limit" in str(exc)\r
\r
    square, stats = makeMemoizedSquare()\r
    assert [square(4), square(4), square(5)] == [16, 16, 25]\r
    assert stats() == {"callCount": 2, "cacheKeys": [4, 5]}\r
\r
    try:\r
        makeRateLimiter(0)\r
    except ValueError as exc:\r
        assert "positive" in str(exc)\r
\r
    print("클로저 상태 관리 흐름 통과")\r
  exercise:\r
    prompt: '현업 흐름 검증: 클로저로 요청 제한기와 캐시 만들기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      def makeRateLimiter(limit):\r
          if limit <= 0:\r
              raise ValueError("limit must be positive")\r
\r
          used = 0\r
\r
          def allowRequest():\r
              nonlocal used\r
              if used >= limit:\r
                  raise RuntimeError("request limit exceeded")\r
              used += 1\r
              return {"allowed": True, "remaining": limit - used}\r
\r
          return allowRequest\r
\r
      def makeMemoizedSquare():\r
          cache = {}\r
          callCount = 0\r
\r
          def square(value):\r
              nonlocal callCount\r
              if value not in cache:\r
                  callCount += 1\r
                  cache[value] = value * value\r
              return cache[value]\r
\r
          def stats():\r
              return {"callCount": callCount, "cacheKeys": sorted(cache)}\r
\r
          return square, stats\r
\r
      limiter = makeRateLimiter(2)\r
      assert limiter() == {"allowed": True, "remaining": 1}\r
      assert limiter() == {"allowed": True, "remaining": 0}\r
\r
      try:\r
          limiter()\r
      except RuntimeError as exc:\r
          assert "limit" in str(exc)\r
\r
      square, stats = makeMemoizedSquare()\r
      assert [square(4), square(4), square(5)] == [16, 16, 25]\r
      assert stats() == {"callCount": 2, "cacheKeys": [4, 5]}\r
\r
      try:\r
          makeRateLimiter(0)\r
      except ValueError as exc:\r
          assert "positive" in str(exc)\r
\r
      print("클로저 상태 관리 흐름 통과")\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 클로저로 요청 제한기와 캐시 만들기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 클로저로 요청 제한기와 캐시 만들기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: 클로저와 상태 관리 마스터하기\r
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Day 3에서 배운 클로저와 상태 관리를 난이도별로 복습합니다. 클로저는 외부 함수의 변수를 기억하는 내부 함수로, 상태를 캡슐화하는 핵심 메커니즘입니다.\r
    nonlocal 키워드로 외부 변수를 수정하고, 이를 활용해 카운터, 캐시, 팩토리 등을 만들 수 있습니다. 🟢 기본 문제로 클로저 생성과 변수 캡처를 익히고, 🟡 응용 문제로\r
    상태 관리 패턴을 연습하세요. 🔴 심화 문제에서는 메모이제이션, 지연 평가, 데코레이터 구현 등 고급 활용법을 다룹니다. 클로저를 이해하면 데코레이터, 콜백, 이벤트 핸들러 등\r
    고급 패턴의 동작 원리가 명확해집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def greetMaker(greeting):\r
        def greet(name):\r
            return f"{greeting}, {name}!"\r
        return greet\r
\r
    sayHello = greetMaker("Hello")\r
    sayHello("World")\r
  exercise:\r
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def greetMaker(greeting):\r
          def greet(name):\r
              return f"{greeting}, {name}!"\r
          return greet\r
\r
      sayHello = greetMaker("Hello")\r
      sayHello("World")\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 03_advanced_closure-independent-counter-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - closure_definition
    - state_encapsulation
    - nonlocal_keyword
    title: 클로저 카운터 두 개가 독립 상태를 유지하는지 검증하기
    subtitle: private state with nonlocal
    goal: 시작값과 증가량 목록을 받아 첫 번째 카운터의 변화, 두 번째 카운터의 독립성, 자유 변수를 반환한다.
    why: 클로저 학습의 핵심은 함수가 값을 기억한다는 설명보다, 반환된 함수마다 상태가 따로 살아 있음을 직접 증명하는 것입니다.
    explanation: run_independent_counters(start, steps)를 완성해 nonlocal 상태 변경, 독립 인스턴스, free variable 정보를 함께 확인하세요.
    tips:
    - steps가 비어 있으면 검증할 상태 변화가 없으므로 ValueError로 막으세요.
    - 두 번째 카운터를 따로 만들어 첫 번째 호출 기록과 섞이지 않는지 확인하세요.
    exercise:
      prompt: run_independent_counters(start, steps)를 완성해 첫 번째 카운터 값 변화와 두 번째 카운터의 독립성을 반환하세요.
      starterCode: |-
        def run_independent_counters(start, steps):
            raise NotImplementedError
      solution: |-
        def run_independent_counters(start, steps):
            if not steps:
                raise ValueError("steps are required")

            def make_counter(initial):
                count = initial

                def counter(delta=1):
                    nonlocal count
                    count += delta
                    return count

                return counter

            first = make_counter(start)
            second = make_counter(start)
            first_values = [first(delta) for delta in steps]
            second_first_value = second(10)
            return {
                "firstValues": first_values,
                "secondFirstValue": second_first_value,
                "independent": second_first_value != first_values[-1],
                "freeVars": sorted(first.__code__.co_freevars),
            }
      hints:
      - count를 다시 할당하려면 counter 안에서 nonlocal count가 필요합니다.
      - __code__.co_freevars는 내부 함수가 붙잡은 외부 변수 이름을 보여줍니다.
    check:
      id: python.advanced.closure.independent-counter.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.closure.empty.behavior.v1.fixture
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
        entry: run_independent_counters
        cases:
        - id: tracks-state-and-independent-counter
          arguments:
          - value: 0
          - value:
            - 1
            - 2
            - 3
          expectedReturn:
            firstValues:
            - 1
            - 3
            - 6
            secondFirstValue: 10
            independent: true
            freeVars:
            - count
        - id: rejects-empty-steps
          arguments:
          - value: 0
          - value: []
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 03_advanced_closure-quota-limiter-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - state_encapsulation
    - factory_pattern
    - workflow_validation
    title: 요청 비용을 기억하는 클로저 제한기로 승인과 거부 기록하기
    subtitle: quota limiter closure
    goal: 총 quota와 요청 목록을 받아 각 요청의 승인 여부, 남은 quota, 사용량을 반환한다.
    why: 전이 과제에서는 단순 카운터를 벗어나, 실제 요청 제한처럼 상태를 숨기고 정책만 함수로 노출하는 설계를 확인합니다.
    explanation: run_quota_limiter(limit, requests)를 완성해 각 요청 cost가 남은 quota 이하일 때만 승인하고, 거부된 요청은 상태를 바꾸지 않도록 만드세요.
    tips:
    - 남은 quota는 클로저 내부에 숨기세요.
    - 거부된 요청은 remaining 값을 그대로 유지해야 합니다.
    exercise:
      prompt: run_quota_limiter(limit, requests)를 완성해 요청별 decision과 최종 remaining, spent를 반환하세요.
      starterCode: |-
        def run_quota_limiter(limit, requests):
            raise NotImplementedError
      solution: |-
        def run_quota_limiter(limit, requests):
            if limit <= 0:
                raise ValueError("limit must be positive")

            remaining = limit

            def decide(request):
                nonlocal remaining
                cost = request["cost"]
                allowed = cost <= remaining
                if allowed:
                    remaining -= cost
                return {
                    "id": request["id"],
                    "allowed": allowed,
                    "remaining": remaining,
                }

            decisions = [decide(request) for request in requests]
            return {
                "decisions": decisions,
                "remaining": remaining,
                "spent": limit - remaining,
                "acceptedCount": sum(1 for decision in decisions if decision["allowed"]),
            }
      hints:
      - decide 안에서 remaining을 줄이려면 nonlocal이 필요합니다.
      - denied 요청은 remaining을 줄이지 않습니다.
    check:
      id: python.advanced.closure.quota-limiter.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.closure.empty.behavior.v1.fixture
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
        entry: run_quota_limiter
        cases:
        - id: records-allowed-and-denied-requests
          arguments:
          - value: 5
          - value:
            - id: R1
              cost: 2
            - id: R2
              cost: 4
            - id: R3
              cost: 1
          expectedReturn:
            decisions:
            - id: R1
              allowed: true
              remaining: 3
            - id: R2
              allowed: false
              remaining: 3
            - id: R3
              allowed: true
              remaining: 2
            remaining: 2
            spent: 3
            acceptedCount: 2
        - id: rejects-non-positive-limit
          arguments:
          - value: 0
          - value: []
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 03_advanced_closure-pattern-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - closure_vs_class
    - memoization
    - nonlocal_keyword
    title: 클로저, 클래스, 캐시 중 맞는 상태 관리 도구 고르기
    subtitle: state pattern recall
    goal: 상황 이름을 받아 적절한 패턴, 이유, nonlocal 필요 여부를 반환한다.
    why: 시간이 지나도 남아야 할 감각은 상태가 하나인 콜백은 클로저, 여러 동작과 필드는 클래스, 반복 계산은 캐시라는 선택 기준입니다.
    explanation: choose_state_pattern(situation)를 완성해 단일 숨김 상태, 여러 필드와 동작, 반복 계산 상황별 도구를 고르세요.
    tips:
    - 클로저는 간단한 상태와 단일 동작에 잘 맞습니다.
    - 상태를 다시 할당할 때만 nonlocal이 필요합니다.
    exercise:
      prompt: choose_state_pattern(situation)를 완성해 상황별 상태 관리 패턴을 반환하세요.
      starterCode: |-
        def choose_state_pattern(situation):
            raise NotImplementedError
      solution: |-
        def choose_state_pattern(situation):
            table = {
                "single-hidden-counter": {
                    "pattern": "closure",
                    "reason": "one private value and one behavior",
                    "usesNonlocal": True,
                },
                "many-fields-many-actions": {
                    "pattern": "class",
                    "reason": "several fields and methods need explicit names",
                    "usesNonlocal": False,
                },
                "expensive-repeat-call": {
                    "pattern": "lru_cache",
                    "reason": "same arguments should reuse a computed result",
                    "usesNonlocal": False,
                },
            }
            if situation not in table:
                raise ValueError("unknown state situation")
            return table[situation]
      hints:
      - nonlocal은 외부 스코프 변수를 다시 할당할 때 씁니다.
      - 메서드가 여러 개면 클래스가 더 읽기 쉽습니다.
    check:
      id: python.advanced.closure.pattern-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.closure.empty.behavior.v1.fixture
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
        entry: choose_state_pattern
        cases:
        - id: chooses-closure-for-one-hidden-counter
          arguments:
          - value: single-hidden-counter
          expectedReturn:
            pattern: closure
            reason: one private value and one behavior
            usesNonlocal: true
        - id: chooses-class-for-many-fields
          arguments:
          - value: many-fields-many-actions
          expectedReturn:
            pattern: class
            reason: several fields and methods need explicit names
            usesNonlocal: false
        - id: rejects-unknown-situation
          arguments:
          - value: global-magic
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};