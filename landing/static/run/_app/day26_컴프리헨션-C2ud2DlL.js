var e=`meta:
  id: day26
  title: 컴프리헨션
  day: 26
  category: 30days
  tags:
  - 컴프리헨션
  - 리스트
  - 딕셔너리
  - 집합
  - 데이터정제
  - 검증
  seo:
    title: 파이썬 컴프리헨션 - 간결한 데이터 구조 생성
    description: 리스트, 딕셔너리, 집합 컴프리헨션으로 간결하고 효율적인 코드를 작성합니다.
    keywords:
    - 컴프리헨션
    - list comprehension
    - dict comprehension
    - set comprehension
intro:
  emoji: 🔄
  points:
  - 리스트 컴프리헨션으로 간결한 코드
  - 딕셔너리 컴프리헨션으로 변환
  - 집합 컴프리헨션으로 중복 제거
  - 중첩 컴프리헨션으로 다차원 처리
  direction: 컴프리헨션에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 컴프리헨션 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 리스트 컴프리헨션 기초 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: 조건부 컴프리헨션 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: 고급 리스트 컴프리헨션 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 컴프리헨션 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 컴프리헨션 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 컴프리헨션 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: list_comprehension_basic
  title: 리스트 컴프리헨션 기초
  structuredPrimary: true
  subtitle: 간결한 리스트 생성
  goal: for 뒤 목록에 항목을 하나 더하면 결과 리스트도 같이 길어지는 것을 확인한다.
  why: 빈 리스트를 만들고 for로 돌면서 append 하던 세 줄짜리 패턴을 한 줄로 줄여 줍니다. 목록을 다른 목록으로 바꾸는 일은 거의 매일 하는 작업입니다.
  explanation: |-
    리스트 컴프리헨션은 for 반복문을 한 줄로 압축하여 새로운 리스트를 만드는 방법입니다. [표현식 for 변수 in 시퀀스] 형태로 작성하며, 기존 반복문보다 간결하고 읽기 쉬운 코드를 만들 수 있습니다. 파이썬스러운 코드 작성의 핵심 기법입니다.

    리스트 컴프리헨션은 간결하지만, 너무 복잡하면 가독성이 떨어지니 적절히 사용하세요.
  snippet: |-
    nums = [1, 2, 3, 4, 5]
    squared = [x ** 2 for x in nums]
    squared
  exercise:
    prompt: |-
      첫 줄 nums 리스트 끝에 6을 추가해 [1, 2, 3, 4, 5, 6]으로 만드세요.

      실행하면 [1, 4, 9, 16, 25, 36]이 나와야 합니다.
    starterCode: |-
      nums = [1, 2, 3, 4, 5]
      squared = [x ** 2 for x in nums]
      squared
    solution: |-
      nums = [1, 2, 3, 4, 5, 6]
      squared = [x ** 2 for x in nums]
      squared
    hints:
    - nums = [1, 2, 3, 4, 5] 를 nums = [1, 2, 3, 4, 5, 6] 으로 바꿉니다. 컴프리헨션 줄과 마지막 줄은 그대로 둡니다.
    - "정답 형태: nums = [1, 2, 3, 4, 5, 6]"
  check:
    type: outputExact
    evidence: practice
    outputExact: '[1, 4, 9, 16, 25, 36]'
    resultCheck: "출력이 정확히 일치해야 합니다: '[1, 4, 9, 16, 25, 36]'"
- id: list_comprehension_condition
  title: 조건부 컴프리헨션
  structuredPrimary: true
  subtitle: 필터링과 조건문
  goal: if 조건을 and로 하나 더 이어 붙여 결과에 남는 항목이 줄어드는 것을 확인한다.
  why: 목록에서 조건에 맞는 것만 골라내는 일은 데이터 정리의 절반입니다. 뒤에 if를 붙이면 거르기와 변환을 한 줄에서 끝낼 수 있습니다.
  explanation: |-
    리스트 컴프리헨션에 if 조건을 추가하여 특정 요소만 선택할 수 있습니다. [표현식 for 변수 in 시퀀스 if 조건] 형태로 작성하며, 조건을 만족하는 요소만 결과에 포함됩니다. 필터링과 변환을 동시에 수행할 수 있어 매우 강력합니다.

    if-else를 사용하려면 [표현식1 if 조건 else 표현식2 for 변수 in 시퀀스] 형태로 작성합니다.
  snippet: |-
    range10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    evens = [n for n in range10 if n % 2 == 0]
    evens
  exercise:
    prompt: |-
      조건 if n % 2 == 0 뒤에 and n > 5를 덧붙이세요. 짝수이면서 5보다 큰 값만 남습니다.

      실행하면 [6, 8, 10]이 나와야 합니다. 2와 4는 짝수지만 두 번째 조건에서 걸러집니다.
    starterCode: |-
      range10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      evens = [n for n in range10 if n % 2 == 0]
      evens
    solution: |-
      range10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      evens = [n for n in range10 if n % 2 == 0 and n > 5]
      evens
    hints:
    - "if n % 2 == 0 을 if n % 2 == 0 and n > 5 로 바꿉니다. 첫 줄 range10 과 마지막 줄은 그대로 둡니다."
    - "정답 형태: evens = [n for n in range10 if n % 2 == 0 and n > 5]"
  check:
    type: outputExact
    evidence: practice
    outputExact: '[6, 8, 10]'
    resultCheck: "출력이 정확히 일치해야 합니다: '[6, 8, 10]'"
- id: list_comprehension_advanced
  title: 고급 리스트 컴프리헨션
  structuredPrimary: true
  subtitle: 복잡한 표현식과 다중 조건
  goal: else 쪽 표현식만 바꿔서 짝수 자리 값만 달라지고 항목 개수는 그대로인 것을 확인한다.
  why: 앞쪽 if-else는 항목을 거르는 것이 아니라 항목마다 다른 값을 계산합니다. 뒤쪽 if와 역할이 달라서 이 차이를 모르면 결과 길이가 왜 그대로인지 헷갈립니다.
  explanation: |-
    리스트 컴프리헨션은 복잡한 표현식, if-else 구문, 다중 조건을 모두 지원합니다. 삼항 연산자를 활용하거나 여러 조건을 and/or로 연결할 수 있습니다. 다만 너무 복잡해지면 일반 반복문이 더 읽기 쉬울 수 있습니다.

    한 줄이 너무 길어지면 괄호 안에서 여러 줄로 나눌 수 있습니다.
  snippet: |-
    data = [1, 2, 3, 4, 5]
    result = [x if x % 2 == 1 else x * 2 for x in data]
    result
  exercise:
    prompt: |-
      else 뒤의 x * 2를 x * 10으로 바꾸세요. 홀수는 그대로 두고 짝수만 10배가 됩니다.

      실행하면 [1, 20, 3, 40, 5]가 나와야 합니다. 걸러내는 것이 아니라 값만 바뀌므로 항목은 다섯 개 그대로입니다.
    starterCode: |-
      data = [1, 2, 3, 4, 5]
      result = [x if x % 2 == 1 else x * 2 for x in data]
      result
    solution: |-
      data = [1, 2, 3, 4, 5]
      result = [x if x % 2 == 1 else x * 10 for x in data]
      result
    hints:
    - else x * 2 의 2 를 10 으로 바꿉니다. 앞의 x 와 조건 x % 2 == 1 은 그대로 둡니다.
    - "정답 형태: result = [x if x % 2 == 1 else x * 10 for x in data]"
  check:
    type: outputExact
    evidence: practice
    outputExact: '[1, 20, 3, 40, 5]'
    resultCheck: "출력이 정확히 일치해야 합니다: '[1, 20, 3, 40, 5]'"
- id: dict_comprehension
  title: 딕셔너리 컴프리헨션
  structuredPrimary: true
  subtitle: 딕셔너리 생성과 변환
  goal: 반복 범위를 옮겨 키와 값이 함께 달라지는 것을 확인한다.
  why: 아이디와 금액, 이름과 점수처럼 짝을 이루는 데이터를 만들 때 빈 딕셔너리와 for 반복문 없이 한 줄로 매핑을 만들 수 있습니다.
  explanation: |-
    딕셔너리 컴프리헨션은 리스트 컴프리헨션과 비슷하지만 중괄호를 사용하고 key: value 쌍을 생성합니다. {key: value for 변수 in 시퀀스} 형태로 작성하며, 기존 데이터를 딕셔너리로 변환하거나 딕셔너리를 필터링할 때 유용합니다.

    딕셔너리 컴프리헨션으로 두 리스트를 zip과 함께 사용하면 매핑을 쉽게 만들 수 있습니다.
  snippet: |-
    squares = {n: n ** 2 for n in range(5)}
    squares
  exercise:
    prompt: |-
      range(5)를 range(1, 6)으로 바꾸세요. 키가 0이 아니라 1부터 시작합니다.

      실행하면 아래 한 줄이 나와야 합니다. 키 0이 사라지고 키 5가 새로 생깁니다.
      {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}
    starterCode: |-
      squares = {n: n ** 2 for n in range(5)}
      squares
    solution: |-
      squares = {n: n ** 2 for n in range(1, 6)}
      squares
    hints:
    - range(5) 를 range(1, 6) 으로 바꿉니다. 콜론 앞뒤의 n 과 n ** 2 는 그대로 둡니다.
    - "정답 형태: squares = {n: n ** 2 for n in range(1, 6)}"
  check:
    type: outputExact
    evidence: practice
    outputExact: '{1: 1, 2: 4, 3: 9, 4: 16, 5: 25}'
    resultCheck: "출력이 정확히 일치해야 합니다: '{1: 1, 2: 4, 3: 9, 4: 16, 5: 25}'"
- id: set_comprehension
  title: 집합 컴프리헨션
  structuredPrimary: true
  subtitle: 중복 없는 집합 생성
  goal: 집합 컴프리헨션이 중복을 지운다는 것을 개수로 센다.
  why: 집합은 표시 순서가 실행할 때마다 달라질 수 있습니다. 화면에 보이는 순서를 믿지 말고 개수나 sorted() 결과로 확인해야 판단이 흔들리지 않습니다.
  explanation: |-
    집합 컴프리헨션은 중괄호를 사용하지만 key: value가 아닌 단일 값만 생성합니다. {표현식 for 변수 in 시퀀스} 형태로 작성하며, 자동으로 중복이 제거된 집합을 만듭니다. 유일한 값만 필요할 때 매우 유용합니다.

    집합 컴프리헨션과 딕셔너리 컴프리헨션은 중괄호로 구분이 어려우니 : 유무로 판단하세요.
  snippet: |-
    digits = [1, 2, 2, 3, 3, 3, 4, 4, 5]
    unique = {n for n in digits}
    unique
  exercise:
    prompt: |-
      마지막 줄 unique를 len(unique)로 바꾸세요. 집합은 표시 순서가 보장되지 않으므로 개수로 확인합니다.

      digits에는 값이 아홉 개 들어 있지만 중복이 사라져 5가 나와야 합니다.
    starterCode: |-
      digits = [1, 2, 2, 3, 3, 3, 4, 4, 5]
      unique = {n for n in digits}
      unique
    solution: |-
      digits = [1, 2, 2, 3, 3, 3, 4, 4, 5]
      unique = {n for n in digits}
      len(unique)
    hints:
    - 마지막 줄 unique 를 len(unique) 로 바꿉니다. 첫 두 줄은 그대로 둡니다.
    - "정답 형태: len(unique)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '5'
    resultCheck: "출력이 정확히 일치해야 합니다: '5'"
- id: nested_comprehension
  title: 중첩 컴프리헨션
  structuredPrimary: true
  subtitle: 다차원 데이터 처리
  goal: for 두 개 뒤에 if를 붙여 펼친 값 중 일부만 남기는 자리를 익힌다.
  why: 표처럼 리스트 안에 리스트가 든 데이터를 한 줄로 펼치면서 필요한 값만 남길 수 있습니다. for와 if의 순서를 한 번 몸에 익혀 두면 중첩이 깊어져도 읽힙니다.
  explanation: |-
    중첩 컴프리헨션은 여러 개의 for 문을 하나의 컴프리헨션에 작성하는 것입니다. 2차원 리스트를 평탄화하거나, 중첩 반복문을 간결하게 표현할 때 사용합니다. 다만 너무 복잡하면 가독성이 떨어지므로 2중 정도까지만 사용하는 것이 좋습니다.

    중첩 컴프리헨션의 for 순서는 일반 중첩 반복문과 같습니다. 왼쪽이 바깥쪽 반복문입니다.
  snippet: |-
    matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    flat = [num for row in matrix for num in row]
    flat
  exercise:
    prompt: |-
      둘째 줄 컴프리헨션 맨 뒤, for 두 개 다음에 if num % 2 == 0을 붙이세요.

      아홉 개 중 짝수만 남아 실행하면 [2, 4, 6, 8]이 나와야 합니다.
    starterCode: |-
      matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
      flat = [num for row in matrix for num in row]
      flat
    solution: |-
      matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
      flat = [num for row in matrix for num in row if num % 2 == 0]
      flat
    hints:
    - "for num in row 뒤에 if num % 2 == 0 을 붙입니다. 조건은 안쪽 변수 num 을 봅니다. matrix 줄과 마지막 줄은 그대로 둡니다."
    - "정답 형태: flat = [num for row in matrix for num in row if num % 2 == 0]"
  check:
    type: outputExact
    evidence: practice
    outputExact: '[2, 4, 6, 8]'
    resultCheck: "출력이 정확히 일치해야 합니다: '[2, 4, 6, 8]'"
- id: comprehension_practice
  title: 컴프리헨션 실전
  structuredPrimary: true
  subtitle: 실용적인 활용 패턴
  goal: 정제 규칙은 그대로 두고 원본 목록에 항목을 하나 더해 같은 규칙이 새 항목에도 걸리는 것을 확인한다.
  why: 외부에서 받은 값은 앞뒤 공백과 대소문자가 제각각입니다. 정제 규칙을 컴프리헨션 한 줄에 걸어 두면 항목이 늘어도 코드를 고칠 일이 없습니다.
  explanation: |-
    컴프리헨션은 데이터 변환, 필터링, 집계 등 다양한 실무 작업을 간결하게 처리할 수 있습니다. 리스트 처리, 딕셔너리 변환, 데이터 정제 등에서 자주 사용되는 패턴을 익히면 효율적인 코드를 작성할 수 있습니다.

    컴프리헨션은 강력하지만, 복잡한 로직은 일반 반복문이 더 명확할 수 있습니다.
  snippet: |-
    rawData = ['  Apple  ', '  BANANA  ', '  Cherry  ']
    trimmed = [d.strip().lower() for d in rawData]
    trimmed
  exercise:
    prompt: |-
      첫 줄 rawData 끝에 '  Durian' 항목을 추가해 네 개로 만드세요. 앞의 공백 두 칸도 그대로 넣습니다.

      strip()과 lower()가 새 항목에도 똑같이 걸려 실행하면 아래 한 줄이 나와야 합니다.
      ['apple', 'banana', 'cherry', 'durian']
    starterCode: |-
      rawData = ['  Apple  ', '  BANANA  ', '  Cherry  ']
      trimmed = [d.strip().lower() for d in rawData]
      trimmed
    solution: |-
      rawData = ['  Apple  ', '  BANANA  ', '  Cherry  ', '  Durian']
      trimmed = [d.strip().lower() for d in rawData]
      trimmed
    hints:
    - "'  Cherry  ' 뒤에 쉼표를 찍고 '  Durian' 을 추가합니다. 정제 줄과 마지막 줄은 그대로 둡니다."
    - "정답 형태: rawData = ['  Apple  ', '  BANANA  ', '  Cherry  ', '  Durian']"
  check:
    type: outputExact
    evidence: practice
    outputExact: "['apple', 'banana', 'cherry', 'durian']"
    resultCheck: "출력이 정확히 일치해야 합니다: \\"['apple', 'banana', 'cherry', 'durian']\\""
- id: workflow_validation
  title: '현업 흐름 검증: 주문 행을 컴프리헨션으로 정제하기'
  structuredPrimary: true
  subtitle: 예측 → 변환 → 필터링 → 오류 확인 → 검증
  goal: assert로 정제 결과를 검증한 다음, 결제 완료 주문의 금액 합계를 컴프리헨션으로 뽑아낸다.
  why: 정제와 검증까지만 하면 화면에 통과 문구만 남습니다. 검증된 데이터에서 필요한 숫자를 뽑아내야 보고나 다음 처리에 실제로 쓸 수 있습니다.
  explanation: 컴프리헨션은 짧게 쓰는 문법이 아니라, 입력 데이터에서 필요한 행을 고르고 같은 규칙으로 변환할 때 강력합니다. 다만 검증 로직이 복잡해지면 작은 함수와 함께
    써야 흐름이 읽힙니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    rawRows = [
        {"id": " A-100 ", "status": " PAID ", "amount": "50,000", "customer": "kim"},
        {"id": "A-101", "status": "cancelled", "amount": "8,000", "customer": "lee"},
        {"id": " A-102", "status": "paid", "amount": "120,000", "customer": "kim"},
        {"id": "A-103", "status": "pending", "amount": "30,000", "customer": "park"},
    ]

    def parseAmount(text):
        cleanedText = text.replace(",", "").strip()
        if not cleanedText.isdigit():
            raise ValueError(f"invalid amount: {text}")
        return int(cleanedText)

    activeRows = [
        {
            "id": row["id"].strip(),
            "status": row["status"].strip().lower(),
            "amount": parseAmount(row["amount"]),
            "customer": row["customer"].strip(),
        }
        for row in rawRows
        if row["status"].strip().lower() != "cancelled"
    ]

    paidRows = [row for row in activeRows if row["status"] == "paid"]
    amountByOrderId = {row["id"]: row["amount"] for row in paidRows}
    highValueOrderIds = {orderId for orderId, amount in amountByOrderId.items() if amount >= 100000}
    reportLines = [f"{orderId}:{amount}" for orderId, amount in sorted(amountByOrderId.items())]

    assert [row["id"] for row in activeRows] == ["A-100", "A-102", "A-103"]
    assert amountByOrderId == {"A-100": 50000, "A-102": 120000}
    assert highValueOrderIds == {"A-102"}
    assert reportLines == ["A-100:50000", "A-102:120000"]

    try:
        parseAmount("unknown")
    except ValueError as exc:
        assert "invalid amount" in str(exc)

    print("컴프리헨션 정제 흐름 통과")
  exercise:
    prompt: |-
      위쪽 데이터, parseAmount 함수, assert 네 줄은 모두 그대로 두고 마지막 줄만 바꿉니다.
      print("컴프리헨션 정제 흐름 통과")를 아래 줄로 바꾸세요.
      print(sum([row["amount"] for row in paidRows]))

      paidRows는 A-100(50000)과 A-102(120000) 두 건이므로 실행하면 170000이 나와야 합니다.
    starterCode: |-
      rawRows = [
          {"id": " A-100 ", "status": " PAID ", "amount": "50,000", "customer": "kim"},
          {"id": "A-101", "status": "cancelled", "amount": "8,000", "customer": "lee"},
          {"id": " A-102", "status": "paid", "amount": "120,000", "customer": "kim"},
          {"id": "A-103", "status": "pending", "amount": "30,000", "customer": "park"},
      ]

      def parseAmount(text):
          cleanedText = text.replace(",", "").strip()
          if not cleanedText.isdigit():
              raise ValueError(f"invalid amount: {text}")
          return int(cleanedText)

      activeRows = [
          {
              "id": row["id"].strip(),
              "status": row["status"].strip().lower(),
              "amount": parseAmount(row["amount"]),
              "customer": row["customer"].strip(),
          }
          for row in rawRows
          if row["status"].strip().lower() != "cancelled"
      ]

      paidRows = [row for row in activeRows if row["status"] == "paid"]
      amountByOrderId = {row["id"]: row["amount"] for row in paidRows}
      highValueOrderIds = {orderId for orderId, amount in amountByOrderId.items() if amount >= 100000}
      reportLines = [f"{orderId}:{amount}" for orderId, amount in sorted(amountByOrderId.items())]

      assert [row["id"] for row in activeRows] == ["A-100", "A-102", "A-103"]
      assert amountByOrderId == {"A-100": 50000, "A-102": 120000}
      assert highValueOrderIds == {"A-102"}
      assert reportLines == ["A-100:50000", "A-102:120000"]

      try:
          parseAmount("unknown")
      except ValueError as exc:
          assert "invalid amount" in str(exc)

      print("컴프리헨션 정제 흐름 통과")
    solution: |-
      rawRows = [
          {"id": " A-100 ", "status": " PAID ", "amount": "50,000", "customer": "kim"},
          {"id": "A-101", "status": "cancelled", "amount": "8,000", "customer": "lee"},
          {"id": " A-102", "status": "paid", "amount": "120,000", "customer": "kim"},
          {"id": "A-103", "status": "pending", "amount": "30,000", "customer": "park"},
      ]

      def parseAmount(text):
          cleanedText = text.replace(",", "").strip()
          if not cleanedText.isdigit():
              raise ValueError(f"invalid amount: {text}")
          return int(cleanedText)

      activeRows = [
          {
              "id": row["id"].strip(),
              "status": row["status"].strip().lower(),
              "amount": parseAmount(row["amount"]),
              "customer": row["customer"].strip(),
          }
          for row in rawRows
          if row["status"].strip().lower() != "cancelled"
      ]

      paidRows = [row for row in activeRows if row["status"] == "paid"]
      amountByOrderId = {row["id"]: row["amount"] for row in paidRows}
      highValueOrderIds = {orderId for orderId, amount in amountByOrderId.items() if amount >= 100000}
      reportLines = [f"{orderId}:{amount}" for orderId, amount in sorted(amountByOrderId.items())]

      assert [row["id"] for row in activeRows] == ["A-100", "A-102", "A-103"]
      assert amountByOrderId == {"A-100": 50000, "A-102": 120000}
      assert highValueOrderIds == {"A-102"}
      assert reportLines == ["A-100:50000", "A-102:120000"]

      try:
          parseAmount("unknown")
      except ValueError as exc:
          assert "invalid amount" in str(exc)

      print(sum([row["amount"] for row in paidRows]))
    hints:
    - '마지막 print 한 줄만 print(sum([row["amount"] for row in paidRows])) 로 바꿉니다. 위쪽 정제 코드와 assert 네 줄은 건드리지 않습니다.'
    - '정답 형태: print(sum([row["amount"] for row in paidRows]))'
  check:
    type: outputExact
    evidence: practice
    outputExact: '170000'
    resultCheck: "출력이 정확히 일치해야 합니다: '170000'"
- id: practice
  title: Day 26 종합 복습
  structuredPrimary: true
  subtitle: 컴프리헨션 마스터하기
  goal: 값을 바꾸는 표현식과 항목을 거르는 if를 한 컴프리헨션에 함께 써 본다.
  why: 실제로 가장 자주 쓰는 형태가 변환과 필터를 한 줄에 같이 쓰는 것입니다. 마지막으로 직접 붙여 보면서 각 조각의 자리를 굳힙니다.
  explanation: Day 26에서 배운 컴프리헨션을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    baseNums = [1, 2, 3, 4, 5]
    doubled = [n * 2 for n in baseNums]
    doubled
  exercise:
    prompt: |-
      둘째 줄 컴프리헨션 맨 뒤에 if n % 2 == 1을 붙이세요. 홀수만 남기고 두 배로 만듭니다.

      1, 3, 5만 남아 실행하면 [2, 6, 10]이 나와야 합니다.
    starterCode: |-
      baseNums = [1, 2, 3, 4, 5]
      doubled = [n * 2 for n in baseNums]
      doubled
    solution: |-
      baseNums = [1, 2, 3, 4, 5]
      doubled = [n * 2 for n in baseNums if n % 2 == 1]
      doubled
    hints:
    - "for n in baseNums 뒤에 if n % 2 == 1 을 붙입니다. 앞의 n * 2 는 그대로 둡니다."
    - "정답 형태: doubled = [n * 2 for n in baseNums if n % 2 == 1]"
  check:
    type: outputExact
    evidence: practice
    outputExact: '[2, 6, 10]'
    resultCheck: "출력이 정확히 일치해야 합니다: '[2, 6, 10]'"
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
  - id: day26-even-squares-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - list_comprehension_basic
    - practice
    title: 짝수의 제곱 딕셔너리 만들기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: 조건이 있는 dict comprehension을 구현한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: even_squares(numbers)가 짝수 원본 값을 key, 제곱을 value로 가진 딕셔너리를 반환하도록 완성하세요.
      starterCode: |-
        def even_squares(numbers):
            raise NotImplementedError
      solution: |-
        def even_squares(numbers):
            return {number: number ** 2 for number in numbers if number % 2 == 0}
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day26.even-squares.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day26.even-squares.mastery.behavior.v1.fixture
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
        entry: even_squares
        cases:
        - id: mixed
          arguments:
          - value:
            - 1
            - 2
            - 3
            - 4
          expectedReturn:
            '2': 4
            '4': 16
        - id: none
          arguments:
          - value:
            - 1
            - 3
          expectedReturn: {}
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day26-flatten-matrix-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day26-even-squares-mastery
    title: 중첩 목록을 한 줄로 펼치기
    subtitle: 처음 보는 조건에 개념 적용
    goal: 중첩 comprehension을 표 형태 데이터에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: flatten_matrix(matrix)가 행 순서를 유지한 단일 목록을 반환하도록 완성하세요.
      starterCode: |-
        def flatten_matrix(matrix):
            raise NotImplementedError
      solution: |-
        def flatten_matrix(matrix):
            return [value for row in matrix for value in row]
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day26.flatten-matrix.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day26.flatten-matrix.transfer.behavior.v1.fixture
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
        entry: flatten_matrix
        cases:
        - id: two
          arguments:
          - value:
            - - 1
              - 2
            - - 3
              - 4
          expectedReturn:
          - 1
          - 2
          - 3
          - 4
        - id: ragged
          arguments:
          - value:
            - - a
            - - b
              - c
          expectedReturn:
          - a
          - b
          - c
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day26-transpose-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day26-flatten-matrix-transfer
    title: 중첩 comprehension으로 행과 열 바꾸기
    subtitle: 7일 뒤 기억에서 재구성
    goal: index 순서를 기억에서 다시 구성한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: transpose(matrix)가 직사각형 matrix의 행과 열을 바꾼 목록을 반환하도록 완성하세요.
      starterCode: |-
        def transpose(matrix):
            raise NotImplementedError
      solution: |-
        def transpose(matrix):
            return [[row[index] for row in matrix] for index in range(len(matrix[0]))]
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day26.transpose.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day26.transpose.retrieval.behavior.v1.fixture
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
        entry: transpose
        cases:
        - id: rectangle
          arguments:
          - value:
            - - 1
              - 2
              - 3
            - - 4
              - 5
              - 6
          expectedReturn:
          - - 1
            - 4
          - - 2
            - 5
          - - 3
            - 6
        - id: column
          arguments:
          - value:
            - - 1
            - - 2
          expectedReturn:
          - - 1
            - 2
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};