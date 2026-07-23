var e=`meta:\r
  id: '01'\r
  title: 람다와 고차 함수\r
  day: 1\r
  category: advancedPython\r
  tags:\r
  - lambda\r
  - map\r
  - filter\r
  - reduce\r
  - 고차함수\r
  - 검증\r
  - 실무파이프라인\r
  seo:\r
    title: 파이썬 람다와 고차 함수 - 함수형 프로그래밍 마스터\r
    description: lambda 표현식과 map, filter, reduce를 완벽히 이해하고 고차 함수의 개념을 마스터합니다.\r
    keywords:\r
    - lambda\r
    - map\r
    - filter\r
    - reduce\r
    - 고차함수\r
    - 함수형프로그래밍\r
intro:\r
  emoji: ⚡\r
  points:\r
  - lambda 표현식으로 간결한 익명 함수 작성\r
  - map()으로 데이터 일괄 변환\r
  - filter()로 조건에 맞는 데이터 추출\r
  - reduce()로 데이터를 하나의 값으로 축약\r
  direction: 람다와 고차 함수에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 람다와 고차 함수 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 람다 표현식 기초 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: map() 함수 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: filter() 함수 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 람다와 고차 함수 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 람다와 고차 함수 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 람다와 고차 함수 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: lambda_basics\r
  title: 람다 표현식 기초\r
  structuredPrimary: true\r
  subtitle: 익명 함수의 힘\r
  goal: 람다 표현식 기초에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    람다(lambda)는 이름 없는 함수를 한 줄로 정의하는 파이썬의 강력한 기능입니다. 일반 함수가 def 키워드로 여러 줄에 걸쳐 정의되는 것과 달리, 람다는 lambda 인자: 표현식 형태로 단 한 줄에 작성됩니다. 람다는 단일 표현식만 허용하며, 그 표현식의 결과가 자동으로 반환됩니다. return 키워드를 사용할 수 없고, if문이나 for문 같은 복합문도 사용할 수 없습니다. 람다는 주로 다른 함수의 인자로 전달되는 일회성 함수가 필요할 때 사용합니다. 예를 들어 sorted()의 key 인자나 map(), filter()에 전달하는 함수로 자주 활용됩니다.\r
\r
    람다는 간단한 연산에만 사용하세요. 복잡한 로직은 일반 함수로 정의하는 것이 가독성이 좋습니다.\r
  snippet: |-\r
    add = lambda x, y: x + y\r
    add(3, 5)\r
  exercise:\r
    prompt: 람다 표현식 기초 예제에서 \`add\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      add = lambda x, y: x + y\r
      add(3, 5)\r
    hints:\r
    - 바꿀 지점은 \`add = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`add\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 람다 표현식 기초에서 \`add\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 람다 표현식 기초 실행 뒤 \`add\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: map_function\r
  title: map() 함수\r
  structuredPrimary: true\r
  subtitle: 데이터 일괄 변환\r
  goal: map() 함수에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    map() 함수는 iterable의 모든 요소에 함수를 적용하여 새로운 map 객체를 반환합니다. map(함수, iterable) 형태로 사용하며, 원본 데이터를 변경하지 않고 각 요소를 변환한 결과를 생성합니다. map은 지연 평가(lazy evaluation)를 수행하여 실제로 값이 필요할 때까지 계산을 미룹니다. 따라서 메모리 효율적이며, 무한 시퀀스에도 적용할 수 있습니다. 결과를 리스트로 얻으려면 list()로 변환해야 합니다. map은 여러 iterable을 동시에 받을 수 있어서 zip과 유사하게 병렬 처리가 가능합니다.\r
\r
    map 객체는 한 번만 순회할 수 있습니다. 여러 번 사용하려면 list로 변환해두세요.\r
  snippet: |-\r
    nums = [1, 2, 3, 4, 5]\r
    squared = map(lambda x: x ** 2, nums)\r
    list(squared)\r
  exercise:\r
    prompt: map() 함수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      nums = [1, 2, 3, 4, 5]\r
      squared = map(lambda x: x ** 2, nums)\r
      list(squared)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: map() 함수에서 \`nums\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: map() 함수 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: filter_function\r
  title: filter() 함수\r
  structuredPrimary: true\r
  subtitle: 조건부 데이터 추출\r
  goal: filter() 함수에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    filter() 함수는 iterable에서 조건을 만족하는 요소만 걸러내는 함수입니다. filter(함수, iterable) 형태로 사용하며, 함수가 True를 반환하는 요소만 포함하는 filter 객체를 생성합니다. map과 마찬가지로 지연 평가를 수행합니다. 첫 번째 인자로 None을 전달하면 요소 자체의 참/거짓을 기준으로 필터링합니다. 즉, filter(None, iterable)은 falsy 값(0, '', None, [], {} 등)을 제거하고 truthy 값만 남깁니다. 데이터 정제나 조건부 추출에 매우 유용합니다.\r
\r
    복잡한 조건은 별도의 함수로 분리하면 가독성이 좋아집니다.\r
  snippet: |-\r
    numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\r
    evens = filter(lambda x: x % 2 == 0, numbers)\r
    list(evens)\r
  exercise:\r
    prompt: filter() 함수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\r
      evens = filter(lambda x: x % 2 == 0, numbers)\r
      list(evens)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: filter() 함수에서 \`numbers\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: filter() 함수 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: reduce_function\r
  title: reduce() 함수\r
  structuredPrimary: true\r
  subtitle: 데이터 축약\r
  goal: reduce() 함수에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    reduce() 함수는 iterable의 요소들을 누적하여 하나의 값으로 축약합니다. functools 모듈에서 import해야 사용할 수 있습니다. reduce(함수, iterable, 초기값) 형태로 사용하며, 함수는 두 개의 인자(누적값, 현재값)를 받아 새로운 누적값을 반환합니다. 초기값을 지정하지 않으면 iterable의 첫 번째 요소가 초기값이 됩니다. 합계, 곱셈, 최댓값/최솟값 찾기, 문자열 연결 등 다양한 축약 연산에 활용됩니다. 그러나 sum(), max(), min() 같은 내장 함수가 있는 경우에는 그것을 사용하는 것이 더 명확합니다.\r
\r
    reduce가 복잡해지면 일반 for 루프가 더 읽기 쉬울 수 있습니다.\r
  snippet: |-\r
    from functools import reduce\r
    vals = [1, 2, 3, 4, 5]\r
    total = reduce(lambda acc, x: acc + x, vals)\r
    total\r
  exercise:\r
    prompt: reduce() 함수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from functools import reduce\r
      vals = [1, 2, 3, 4, 5]\r
      total = reduce(lambda acc, x: acc + x, vals)\r
      total\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: reduce() 함수에서 \`vals\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: reduce() 함수 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: higher_order\r
  title: 고차 함수\r
  structuredPrimary: true\r
  subtitle: 함수를 다루는 함수\r
  goal: 고차 함수에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    고차 함수(Higher-Order Function)는 함수를 인자로 받거나 함수를 반환하는 함수입니다. 파이썬에서 함수는 일급 객체(first-class object)이므로 변수에 할당하거나, 다른 함수에 전달하거나, 함수에서 반환할 수 있습니다. map, filter, reduce, sorted의 key 인자 등이 모두 고차 함수입니다. 고차 함수를 활용하면 코드 재사용성이 높아지고, 함수형 프로그래밍 스타일로 간결하게 로직을 표현할 수 있습니다. 함수를 반환하는 패턴은 팩토리, 데코레이터, 클로저 등에서 핵심적으로 사용됩니다.\r
\r
    고차 함수는 데코레이터와 클로저의 기반이 됩니다. 이 개념을 잘 이해하면 이후 학습이 수월해집니다.\r
  snippet: |-\r
    def applyTwice(func, x):\r
        return func(func(x))\r
\r
    double = lambda n: n * 2\r
    applyTwice(double, 3)\r
  exercise:\r
    prompt: 고차 함수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def applyTwice(func, x):\r
          return func(func(x))\r
\r
      double = lambda n: n * 2\r
      applyTwice(double, 3)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 고차 함수의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 고차 함수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practical_patterns\r
  title: 실전 패턴\r
  structuredPrimary: true\r
  subtitle: 함수형 프로그래밍 활용\r
  goal: 실전 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    함수형 프로그래밍에서는 map, filter, reduce를 조합하여 데이터 처리 파이프라인을 구성합니다. 원본 데이터를 변경하지 않고 변환과 필터링을 연쇄적으로 적용하여 최종 결과를 얻습니다. 이 방식은 부수 효과(side effect)가 없어 코드의 예측 가능성과 테스트 용이성이 높아집니다. 다만 파이썬에서는 리스트 컴프리헨션이나 제너레이터 표현식이 더 파이썬다운(Pythonic) 방식으로 여겨집니다. 상황에 따라 가독성이 좋은 방식을 선택하세요.\r
\r
    파이썬에서는 map/filter보다 리스트 컴프리헨션이 더 선호됩니다. 하지만 고차 함수 개념을 알아두면 데코레이터, 콜백 등에서 유용합니다.\r
  snippet: |-\r
    from functools import reduce\r
    data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\r
    step1 = map(lambda x: x ** 2, data)\r
    step2 = filter(lambda x: x > 20, step1)\r
    step3 = reduce(lambda a, b: a + b, step2)\r
    step3\r
  exercise:\r
    prompt: 실전 패턴 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from functools import reduce\r
      data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\r
      step1 = map(lambda x: x ** 2, data)\r
      step2 = filter(lambda x: x > 20, step1)\r
      step3 = reduce(lambda a, b: a + b, step2)\r
      step3\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 패턴에서 \`data\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실전 패턴 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 결제 이벤트를 고차 함수로 처리하기'\r
  structuredPrimary: true\r
  subtitle: 예측 → 변환 → 필터링 → 축약 → 검증\r
  goal: '현업 흐름 검증: 결제 이벤트를 고차 함수로 처리하기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    람다와 고차 함수는 문법 묘기가 아니라, 규칙이 짧고 명확한 데이터 파이프라인에서 힘을 발휘합니다. 아래 흐름은 결제 이벤트를 정제하고, 성공 결제만 골라 매출을 계산한 뒤, 잘못된 금액 입력까지 검증합니다.\r
\r
    변주 실험\r
    \`refunded\` 이벤트를 음수 매출로 처리할지 별도 환불 합계로 분리할지 정책을 정하고, 같은 입력에서 assert 기대값이 어떻게 달라지는지 확인하세요.\r
  tips:\r
  - 변주 실험 \`refunded\` 이벤트를 음수 매출로 처리할지 별도 환불 합계로 분리할지 정책을 정하고, 같은 입력에서 assert 기대값이 어떻게 달라지는지 확인하세요.\r
  snippet: |-\r
    from functools import reduce\r
\r
    rawEvents = [\r
        {"id": "P-100", "status": "paid", "amount": "12000"},\r
        {"id": "P-101", "status": "failed", "amount": "9000"},\r
        {"id": "P-102", "status": "paid", "amount": "18000"},\r
        {"id": "P-103", "status": "refunded", "amount": "5000"},\r
    ]\r
\r
    def normalizePayment(event):\r
        amountText = event["amount"].strip()\r
        if not amountText.isdigit():\r
            raise ValueError(f"invalid amount: {event['amount']}")\r
        return {\r
            "id": event["id"],\r
            "status": event["status"].lower(),\r
            "amount": int(amountText),\r
        }\r
\r
    normalizedEvents = list(map(normalizePayment, rawEvents))\r
    paidEvents = list(filter(lambda event: event["status"] == "paid", normalizedEvents))\r
    paidRevenue = reduce(lambda total, event: total + event["amount"], paidEvents, 0)\r
    paidIds = list(map(lambda event: event["id"], paidEvents))\r
\r
    assert paidIds == ["P-100", "P-102"]\r
    assert paidRevenue == 30000\r
    assert normalizedEvents[1]["status"] == "failed"\r
\r
    try:\r
        normalizePayment({"id": "P-999", "status": "paid", "amount": "unknown"})\r
    except ValueError as exc:\r
        assert "invalid amount" in str(exc)\r
\r
    print("고차 함수 결제 파이프라인 통과")\r
  exercise:\r
    prompt: '현업 흐름 검증: 결제 이벤트를 고차 함수로 처리하기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      from functools import reduce\r
\r
      rawEvents = [\r
          {"id": "P-100", "status": "paid", "amount": "12000"},\r
          {"id": "P-101", "status": "failed", "amount": "9000"},\r
          {"id": "P-102", "status": "paid", "amount": "18000"},\r
          {"id": "P-103", "status": "refunded", "amount": "5000"},\r
      ]\r
\r
      def normalizePayment(event):\r
          amountText = event["amount"].strip()\r
          if not amountText.isdigit():\r
              raise ValueError(f"invalid amount: {event['amount']}")\r
          return {\r
              "id": event["id"],\r
              "status": event["status"].lower(),\r
              "amount": int(amountText),\r
          }\r
\r
      normalizedEvents = list(map(normalizePayment, rawEvents))\r
      paidEvents = list(filter(lambda event: event["status"] == "paid", normalizedEvents))\r
      paidRevenue = reduce(lambda total, event: total + event["amount"], paidEvents, 0)\r
      paidIds = list(map(lambda event: event["id"], paidEvents))\r
\r
      assert paidIds == ["P-100", "P-102"]\r
      assert paidRevenue == 30000\r
      assert normalizedEvents[1]["status"] == "failed"\r
\r
      try:\r
          normalizePayment({"id": "P-999", "status": "paid", "amount": "unknown"})\r
      except ValueError as exc:\r
          assert "invalid amount" in str(exc)\r
\r
      print("고차 함수 결제 파이프라인 통과")\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 결제 이벤트를 고차 함수로 처리하기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 결제 이벤트를 고차 함수로 처리하기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: 람다와 고차 함수 마스터하기\r
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: Day 1에서 배운 람다, map, filter, reduce, 고차 함수를 난이도별로 복습합니다. 람다 표현식은 간결한 일회성 함수가 필요할 때 강력한 도구이며,\r
    map과 filter는 데이터 변환과 필터링의 기본입니다. reduce는 누적 연산에, 고차 함수는 코드 재사용성을 높이는 패턴입니다. 🟢 기본 문제로 각 함수의 기본 사용법을\r
    익히고, 🟡 응용 문제로 조합 패턴을 연습하세요. 🔴 심화 문제에서는 함수 합성, 커링, 파이프라인 등 고급 함수형 패턴을 직접 구현해봅니다. 실무에서는 리스트 컴프리헨션과 적절히\r
    혼용하는 것이 파이썬다운 코드 작성의 핵심입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    cube = lambda x: x ** 3\r
    cube(4)\r
  exercise:\r
    prompt: 종합 복습 예제에서 \`cube\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      cube = lambda x: x ** 3\r
      cube(4)\r
    hints:\r
    - 바꿀 지점은 \`cube = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`cube\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 복습에서 \`cube\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 종합 복습 실행 뒤 \`cube\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 01_advanced_lambda-payment-pipeline-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - map_function
    - filter_function
    - reduce_function
    - workflow_validation
    title: 결제 이벤트를 filter, map, reduce로 검증 가능한 요약으로 만들기
    subtitle: higher-order payment pipeline
    goal: 결제 이벤트에서 paid 상태와 최소 금액 조건을 통과한 항목만 골라 수수료 차감 금액과 합계를 반환한다.
    why: 람다와 고차 함수는 짧게 쓰는 기술이 아니라, 데이터 정제와 변환, 집계를 한 흐름으로 읽히게 만드는 도구입니다.
    explanation: summarize_payment_events(events, minimum_amount, fee_rate=0.1)를 완성해 filter로 대상 이벤트를 고르고 map으로 net 금액을 만들며 reduce로 합계를 계산하세요.
    tips:
    - 원본 events를 수정하지 마세요.
    - minimum_amount보다 작은 paid 이벤트와 refund 이벤트는 제외해야 합니다.
    exercise:
      prompt: summarize_payment_events(events, minimum_amount, fee_rate=0.1)를 완성해 선택된 id, net 금액, 합계를 반환하세요.
      starterCode: |-
        def summarize_payment_events(events, minimum_amount, fee_rate=0.1):
            raise NotImplementedError
      solution: |-
        def summarize_payment_events(events, minimum_amount, fee_rate=0.1):
            from functools import reduce

            if minimum_amount < 0:
                raise ValueError("minimum_amount must be non-negative")

            selected = list(filter(
                lambda event: event["status"] == "paid" and event["amount"] >= minimum_amount,
                events,
            ))
            net_amounts = list(map(
                lambda event: round(event["amount"] * (1 - fee_rate)),
                selected,
            ))
            total_net = reduce(lambda total, amount: total + amount, net_amounts, 0)
            return {
                "selectedIds": [event["id"] for event in selected],
                "netAmounts": net_amounts,
                "totalNet": total_net,
                "count": len(selected),
            }
      hints:
      - filter 조건은 status와 amount 조건을 모두 봐야 합니다.
      - reduce에는 초기값 0을 넣으면 빈 결과도 안전합니다.
    check:
      id: python.advanced.lambda.payment-pipeline.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.lambda.empty.behavior.v1.fixture
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
        entry: summarize_payment_events
        cases:
        - id: summarizes-paid-events-above-threshold
          arguments:
          - value:
            - id: A1
              status: paid
              amount: 120000
            - id: A2
              status: refund
              amount: 50000
            - id: A3
              status: paid
              amount: 45000
            - id: A4
              status: paid
              amount: 80000
          - value: 60000
          - value: 0.1
          expectedReturn:
            selectedIds:
            - A1
            - A4
            netAmounts:
            - 108000
            - 72000
            totalNet: 180000
            count: 2
        - id: rejects-negative-threshold
          arguments:
          - value: []
          - value: -1
          - value: 0.1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 01_advanced_lambda-transform-spec-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - higher_order
    - practical_patterns
    title: 이름 있는 변환 규칙을 고차 함수 파이프라인으로 적용하기
    subtitle: reusable transformation stages
    goal: stage 이름 목록과 숫자 목록을 받아 각 stage 함수를 순서대로 적용하고 중간 결과를 반환한다.
    why: 전이 과제에서는 map/filter/reduce를 결제 예시 밖으로 옮겨, 작은 함수를 조립하는 설계 감각을 확인합니다.
    explanation: apply_named_stages(values, stages)를 완성해 keep-even, square, positive-only, total stage를 조합하세요.
    tips:
    - stage 순서가 결과를 바꿉니다.
    - 모르는 stage는 ValueError로 막으세요.
    exercise:
      prompt: apply_named_stages(values, stages)를 완성해 각 stage 적용 뒤의 값을 기록하세요.
      starterCode: |-
        def apply_named_stages(values, stages):
            raise NotImplementedError
      solution: |-
        def apply_named_stages(values, stages):
            from functools import reduce

            handlers = {
                "keep-even": lambda items: list(filter(lambda value: value % 2 == 0, items)),
                "square": lambda items: list(map(lambda value: value * value, items)),
                "positive-only": lambda items: list(filter(lambda value: value > 0, items)),
                "total": lambda items: [reduce(lambda total, value: total + value, items, 0)],
            }
            current = list(values)
            trace = []
            for stage in stages:
                if stage not in handlers:
                    raise ValueError("unknown stage")
                current = handlers[stage](current)
                trace.append({"stage": stage, "values": current})
            return {
                "final": current,
                "trace": trace,
                "stageCount": len(stages),
            }
      hints:
      - handlers dict의 값은 함수를 담습니다.
      - 각 stage 뒤 current를 trace에 남기면 디버깅이 쉬워집니다.
    check:
      id: python.advanced.lambda.transform-spec.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.lambda.empty.behavior.v1.fixture
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
        entry: apply_named_stages
        cases:
        - id: applies-filter-map-reduce-stages-in-order
          arguments:
          - value:
            - -3
            - 2
            - 5
            - 4
          - value:
            - positive-only
            - keep-even
            - square
            - total
          expectedReturn:
            final:
            - 20
            trace:
            - stage: positive-only
              values:
              - 2
              - 5
              - 4
            - stage: keep-even
              values:
              - 2
              - 4
            - stage: square
              values:
              - 4
              - 16
            - stage: total
              values:
              - 20
            stageCount: 4
        - id: rejects-unknown-stage
          arguments:
          - value:
            - 1
          - value:
            - cube
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 01_advanced_lambda-tool-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - map_function
    - filter_function
    - reduce_function
    title: map, filter, reduce의 역할 회상하기
    subtitle: transform, select, collapse
    goal: 목적 이름을 받아 map, filter, reduce 중 맞는 고차 함수와 결과 shape를 반환한다.
    why: 시간이 지나도 남아야 할 감각은 map은 변환, filter는 선택, reduce는 축약이라는 역할 구분입니다.
    explanation: choose_higher_order_tool(goal)를 완성해 transform, select, collapse 목적별 tool과 outputShape를 반환하세요.
    tips:
    - map과 filter는 iterable을 돌려주고, reduce는 보통 단일 값을 돌려줍니다.
    - 내장 sum, max가 더 명확하면 reduce보다 그것을 우선할 수 있습니다.
    exercise:
      prompt: choose_higher_order_tool(goal)를 완성해 목적별 고차 함수 선택 결과를 반환하세요.
      starterCode: |-
        def choose_higher_order_tool(goal):
            raise NotImplementedError
      solution: |-
        def choose_higher_order_tool(goal):
            table = {
                "transform": {"tool": "map", "outputShape": "one output per input", "keepsLength": True},
                "select": {"tool": "filter", "outputShape": "zero or more original items", "keepsLength": False},
                "collapse": {"tool": "reduce", "outputShape": "single accumulated value", "keepsLength": False},
            }
            if goal not in table:
                raise ValueError("unknown higher-order goal")
            return table[goal]
      hints:
      - 변환은 각 입력마다 결과 하나가 필요합니다.
      - 축약은 여러 값을 하나로 모읍니다.
    check:
      id: python.advanced.lambda.tool-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.lambda.empty.behavior.v1.fixture
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
        entry: choose_higher_order_tool
        cases:
        - id: recalls-map-for-transform
          arguments:
          - value: transform
          expectedReturn:
            tool: map
            outputShape: one output per input
            keepsLength: true
        - id: recalls-reduce-for-collapse
          arguments:
          - value: collapse
          expectedReturn:
            tool: reduce
            outputShape: single accumulated value
            keepsLength: false
        - id: rejects-unknown-purpose
          arguments:
          - value: mutate-in-place
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};