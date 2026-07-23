var e=`meta:
  id: day14
  title: 반복문
  day: 14
  category: 30days
  tags:
  - 반복문
  - for
  - while
  - break
  - continue
  - 주문처리
  - 검증
  seo:
    title: 파이썬 반복문 - for, while로 반복 작업
    description: for, while, range, break, continue, else절을 배웁니다.
    keywords:
    - 반복문
    - for
    - while
    - range
    - break
    - continue
intro:
  emoji: 🔁
  points:
  - for로 컬렉션 순회
  - while로 조건 반복
  - break, continue로 제어
  - 중첩 반복문 활용
  direction: 반복문에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 반복문 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: for 리스트 순회 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: for 문자열 순회 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: for 딕셔너리 순회 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 반복문 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 반복문 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 반복문 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: for_list
  title: for 리스트 순회
  structuredPrimary: true
  subtitle: 리스트의 모든 요소 처리
  goal: for 리스트 순회에서 반복 대상과 반복 결과의 개수나 값 변화를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    for문은 리스트의 요소를 하나씩 꺼내서 처리합니다. for 변수 in 리스트: 형식으로 쓰며, 리스트의 모든 요소에 대해 반복합니다. 들여쓰기로 반복할 코드 블록을 구분합니다.

    변수명은 의미있게 짓세요. for item in items보다 for fruit in fruits가 좋습니다.
  snippet: |-
    numbers = [1, 2, 3, 4, 5]
    total = 0
    for num in numbers:
        total = total + num
    total
  exercise:
    prompt: for 리스트 순회 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      numbers = [1, 2, 3, 4, 5]
      total = 0
      for num in numbers:
          total = total + num
      total
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: for 리스트 순회의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: for 리스트 순회 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: for_string
  title: for 문자열 순회
  structuredPrimary: true
  subtitle: 문자열의 각 문자 처리
  goal: for 문자열 순회에서 반복 대상과 반복 결과의 개수나 값 변화를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    for문은 문자열의 각 문자를 하나씩 꺼낼 수 있습니다. 문자열도 시퀀스이므로 리스트처럼 순회할 수 있습니다. 각 문자에 대해 반복 작업을 수행합니다.

    문자열은 변경 불가능하므로 새 문자열을 만들어야 합니다.
  snippet: |-
    msg = 'hello world'
    found = 0
    for char in msg:
        if char == 'o':
            found = found + 1
    found
  exercise:
    prompt: for 문자열 순회 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      msg = 'hello world'
      found = 0
      for char in msg:
          if char == 'o':
              found = found + 1
      found
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: for 문자열 순회의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: for 문자열 순회 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: for_dict
  title: for 딕셔너리 순회
  structuredPrimary: true
  subtitle: 키, 값, 아이템 순회
  goal: for 딕셔너리 순회에서 반복 대상과 반복 결과의 개수나 값 변화를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    딕셔너리는 keys(), values(), items()로 순회할 수 있습니다. 기본적으로 for문은 키를 순회하며, items()를 사용하면 키-값 쌍을 튜플로 받을 수 있습니다.

    items()를 사용하면 키와 값을 동시에 받을 수 있어 편리합니다.
  snippet: |-
    grades = {'math': 85, 'english': 90, 'science': 88}
    subjects = ''
    for subject in grades:
        subjects = subjects + subject + ' '
    subjects
  exercise:
    prompt: for 딕셔너리 순회 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      grades = {'math': 85, 'english': 90, 'science': 88}
      subjects = ''
      for subject in grades:
          subjects = subjects + subject + ' '
      subjects
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: for 딕셔너리 순회의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: for 딕셔너리 순회 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: range_basic
  title: range() 함수
  structuredPrimary: true
  subtitle: 숫자 시퀀스 생성
  goal: range() 함수에서 문자열, 숫자, 변수 같은 예제 값을 바꿨을 때 출력 또는 마지막 표현식 결과가 어떻게 달라지는지 확인한다.
  why: 기초 문법은 나중에 자동화 스크립트의 입력과 결과를 안정적으로 다루는 기준이 됩니다.
  explanation: |-
    range() 함수는 숫자 시퀀스를 생성합니다. range(끝), range(시작, 끝), range(시작, 끝, 간격) 형식으로 사용하며, list()로 변환하면 리스트로 볼 수 있습니다. 끝 값은 포함되지 않습니다.

    range()는 메모리 효율적입니다. 필요할 때만 값을 생성합니다.
  snippet: list(range(5))
  exercise:
    prompt: range() 함수 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: list(range(5))
    hints:
    - 바꿀 지점은 문자열, 숫자, 변수 같은 예제 값을 만드는 첫 줄과 기초 문법 줄에서 찾으세요.
    - 실행 뒤 출력 또는 마지막 표현식 결과 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: range() 함수의 수정 코드가 기초 문법 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: range() 함수 실행 결과가 출력 또는 마지막 표현식 결과 기준으로 바꾼 입력값을 반영해야 합니다.
- id: for_range
  title: range()와 for
  structuredPrimary: true
  subtitle: 정해진 횟수만큼 반복
  goal: range()와 for에서 반복 대상과 반복 결과의 개수나 값 변화를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    range()와 for를 함께 사용하면 정해진 횟수만큼 반복할 수 있습니다. 인덱스를 이용한 순회나 n번 반복하는 작업에 유용합니다.

    리스트 순회시 인덱스가 필요없다면 for item in items를 사용하세요.
  snippet: |-
    rangeSum = 0
    for i in range(1, 6):
        rangeSum = rangeSum + i
    rangeSum
  exercise:
    prompt: range()와 for 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      rangeSum = 0
      for i in range(1, 6):
          rangeSum = rangeSum + i
      rangeSum
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: range()와 for의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: range()와 for 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: while_basic
  title: while 기본
  structuredPrimary: true
  subtitle: 조건이 참인 동안 반복
  goal: while 기본에서 \`idx\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    while문은 조건이 True인 동안 계속 반복합니다. while 조건: 형식으로 쓰며, 조건이 False가 되면 반복을 멈춥니다. 무한 루프에 주의해야 합니다.

    while문에서는 조건을 변경하는 코드를 반드시 포함해야 합니다.
  snippet: |-
    idx = 0
    acc = 0
    while idx < 5:
        acc = acc + idx
        idx = idx + 1
    acc
  exercise:
    prompt: while 기본 예제에서 \`idx\`, \`acc\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      idx = 0
      acc = 0
      while idx < 5:
          acc = acc + idx
          idx = idx + 1
      acc
    hints:
    - 바꿀 지점은 \`idx = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`idx\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: while 기본에서 \`idx\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: while 기본 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: break_statement
  title: break 문
  structuredPrimary: true
  subtitle: 반복문 즉시 종료
  goal: break 문에서 반복 대상과 반복 결과의 개수나 값 변화를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    break는 반복문을 즉시 종료합니다. 조건을 만족하면 더 이상 반복하지 않고 빠져나올 때 사용합니다. for와 while 모두에서 사용할 수 있습니다.

    break는 가장 가까운 반복문 하나만 종료합니다.
  snippet: |-
    seq = [1, 2, 3, 4, 5, 6, 7, 8]
    hit = 0
    for x in seq:
        if x > 5:
            hit = x
            break
    hit
  exercise:
    prompt: break 문 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      seq = [1, 2, 3, 4, 5, 6, 7, 8]
      hit = 0
      for x in seq:
          if x > 5:
              hit = x
              break
      hit
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: break 문의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: break 문 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: continue_statement
  title: continue 문
  structuredPrimary: true
  subtitle: 현재 반복 건너뛰기
  goal: continue 문에서 반복 대상과 반복 결과의 개수나 값 변화를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    continue는 현재 반복을 건너뛰고 다음 반복으로 넘어갑니다. 특정 조건에서 처리를 생략하고 싶을 때 사용합니다. 반복문 자체는 종료되지 않습니다.

    continue는 if-else 구조를 단순화할 때 유용합니다.
  snippet: |-
    odd = 0
    for n in range(1, 11):
        if n % 2 == 0:
            continue
        odd = odd + n
    odd
  exercise:
    prompt: continue 문 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      odd = 0
      for n in range(1, 11):
          if n % 2 == 0:
              continue
          odd = odd + n
      odd
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: continue 문의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: continue 문 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: for_else
  title: for-else 절
  structuredPrimary: true
  subtitle: 정상 종료시 실행
  goal: forelse 절에서 반복 대상과 반복 결과의 개수나 값 변화를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    for문은 else 절을 가질 수 있습니다. 반복이 break 없이 정상적으로 완료되면 else 블록이 실행됩니다. break로 중단되면 else는 실행되지 않습니다.

    for-else는 검색 작업에서 찾았는지 여부를 판별할 때 유용합니다.
  snippet: |-
    arr1 = [1, 2, 3, 4, 5]
    for a in arr1:
        if a > 10:
            flag = 'found big'
            break
    else:
        flag = 'all small'
    flag
  exercise:
    prompt: forelse 절 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      arr1 = [1, 2, 3, 4, 5]
      for a in arr1:
          if a > 10:
              flag = 'found big'
              break
      else:
          flag = 'all small'
      flag
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: forelse 절의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: forelse 절 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: while_else
  title: while-else 절
  structuredPrimary: true
  subtitle: 조건 거짓시 실행
  goal: whileelse 절에서 \`counter\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    while문도 else 절을 가질 수 있습니다. 조건이 False가 되어 정상 종료되면 else가 실행됩니다. break로 중단되면 else는 실행되지 않습니다.

    while-else는 제한 조건 검사에 유용합니다.
  snippet: |-
    counter = 0
    while counter < 3:
        counter = counter + 1
    else:
        completion = 'done'
    completion
  exercise:
    prompt: whileelse 절 예제에서 \`counter\`, \`completion\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      counter = 0
      while counter < 3:
          counter = counter + 1
      else:
          completion = 'done'
      completion
    hints:
    - 바꿀 지점은 \`counter = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`counter\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: whileelse 절에서 \`counter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: whileelse 절 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: nested_loop
  title: 중첩 반복문
  structuredPrimary: true
  subtitle: 반복문 안의 반복문
  goal: 중첩 반복문에서 반복 대상과 반복 결과의 개수나 값 변화를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    반복문 안에 다시 반복문을 넣을 수 있습니다. 이를 중첩 반복문이라고 하며, 2차원 구조나 모든 조합을 처리할 때 사용합니다. 들여쓰기 단계가 늘어납니다.

    중첩이 깊어지면 성능에 영향을 줄 수 있으니 주의하세요.
  snippet: |-
    colors = ['red', 'blue']
    sizes = ['S', 'M']
    combinations = ''
    for color in colors:
        for size in sizes:
            combinations = combinations + color + '-' + size + ' '
    combinations
  exercise:
    prompt: 중첩 반복문 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      colors = ['red', 'blue']
      sizes = ['S', 'M']
      combinations = ''
      for color in colors:
          for size in sizes:
              combinations = combinations + color + '-' + size + ' '
      combinations
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 중첩 반복문의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 중첩 반복문 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: workflow_validation
  title: 실무 반복 처리 루프
  structuredPrimary: true
  subtitle: 예측 → 누적 → 오류 확인 → 검증
  goal: 실무 반복 처리 루프에서 \`dailyOrders\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    반복문은 리스트를 한 번 훑는 문법이 아니라, 업무 데이터를 규칙대로 걸러내고 누적하고 검증하는 도구입니다. 실행 전에는 어떤 주문이 합계에 들어갈지 예측하고, 누락된 컬럼이나 음수 금액 같은 오류를 반복문 안에서 확인해야 합니다.

    반복문은 많이 돌리는 것이 목표가 아닙니다. 어떤 건을 처리하고, 어떤 건을 건너뛰고, 언제 멈추며, 결과가 맞는지 검증하는 흐름까지 함께 설계해야 실제 업무 자동화가 됩니다.
  snippet: |-
    dailyOrders = [
        {"id": "O-101", "status": "paid", "amount": 120000},
        {"id": "O-102", "status": "cancelled", "amount": 50000},
        {"id": "O-103", "status": "paid", "amount": 45000},
        {"id": "O-104", "status": "pending", "amount": 90000},
        {"id": "O-105", "status": "paid", "amount": 210000},
    ]

    len(dailyOrders)
  exercise:
    prompt: 실무 반복 처리 루프 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      dailyOrders = [
          {"id": "O-101", "status": "paid", "amount": 120000},
          {"id": "O-102", "status": "cancelled", "amount": 50000},
          {"id": "O-103", "status": "paid", "amount": 45000},
          {"id": "O-104", "status": "pending", "amount": 90000},
          {"id": "O-105", "status": "paid", "amount": 210000},
      ]

      len(dailyOrders)
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 실무 반복 처리 루프에서 \`dailyOrders\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 실무 반복 처리 루프 실행 뒤 \`dailyOrders\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: practice
  title: Day 14 종합 복습
  structuredPrimary: true
  subtitle: 반복문 마스터하기
  goal: Day 14 종합 복습에서 반복 대상과 반복 결과의 개수나 값 변화를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: Day 14에서 배운 반복문을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤
    순서로 해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    evens = [2, 4, 6, 8, 10]
    evenSum = 0
    for e in evens:
        evenSum = evenSum + e
    evenSum
  exercise:
    prompt: Day 14 종합 복습 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      evens = [2, 4, 6, 8, 10]
      evenSum = 0
      for e in evens:
          evenSum = evenSum + e
      evenSum
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: Day 14 종합 복습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: Day 14 종합 복습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: reflection
  title: Day 14 회고 - 반복문 패턴 굳히기
  structuredPrimary: true
  subtitle: 기억 굳히기
  goal: Day 14에서 다룬 for/while과 흐름 제어(break, continue)의 차이를 자기 말로 정리한다.
  why: 반복문은 자동화의 핵심이라 패턴별로 머릿속 모델을 굳혀두면 다음 단계 업무 코드에서 즉시 활용할 수 있습니다.
  explanation: 오늘 다룬 for vs while, range(), enumerate, break/continue 중에서 가장 잘 이해된 한 가지와 아직 어색한 한 가지를 적어보세요.
  reflection:
    prompt: 같은 작업을 for와 while 두 가지로 적을 때 어느 쪽이 더 자연스러웠는지, 그 이유는 무엇인지 한 단락으로 적어주세요.
    expectedKeywords:
    - for
    - while
    - break
    aiFollowup: 학습자가 선호한 반복 패턴을 인정하고, 다른 쪽이 더 적합한 사례를 한 가지 제시한다.
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
    independentReview: pending
  masteryVariants:
  - id: day14-sum-even-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - for_list
    - reflection
    title: 반복해서 짝수만 합하기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: 반복과 조건을 결합해 누적값을 만든다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: sum_even(numbers)가 짝수만 더한 합계를 반환하도록 완성하세요.
      starterCode: |-
        def sum_even(numbers):
            raise NotImplementedError
      solution: |-
        def sum_even(numbers):
            total = 0
            for number in numbers:
                if number % 2 == 0:
                    total += number
            return total
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day14.sum-even.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day14.sum-even.mastery.behavior.v1.fixture
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
        entry: sum_even
        cases:
        - id: mixed
          arguments:
          - value:
            - 1
            - 2
            - 3
            - 4
          expectedReturn: 6
        - id: none
          arguments:
          - value:
            - 1
            - 3
            - 5
          expectedReturn: 0
        - id: negative
          arguments:
          - value:
            - -2
            - 3
            - 6
          expectedReturn: 4
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day14-running-totals-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day14-sum-even-mastery
    title: 값이 들어올 때마다 누적 합계 남기기
    subtitle: 처음 보는 조건에 개념 적용
    goal: 누적 루프를 시계열 진행값에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: running_totals(numbers)가 각 위치까지의 누적 합계를 목록으로 반환하도록 완성하세요.
      starterCode: |-
        def running_totals(numbers):
            raise NotImplementedError
      solution: |-
        def running_totals(numbers):
            total = 0
            result = []
            for number in numbers:
                total += number
                result.append(total)
            return result
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day14.running-totals.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day14.running-totals.transfer.behavior.v1.fixture
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
        entry: running_totals
        cases:
        - id: positive
          arguments:
          - value:
            - 2
            - 3
            - 5
          expectedReturn:
          - 2
          - 5
          - 10
        - id: signed
          arguments:
          - value:
            - 4
            - -1
            - 2
          expectedReturn:
          - 4
          - 3
          - 5
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day14-first-match-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day14-running-totals-transfer
    title: 처음 일치하는 위치 찾기
    subtitle: 7일 뒤 기억에서 재구성
    goal: break 대신 즉시 return하는 탐색 루프를 회상한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: first_match(items, target)가 처음 일치하는 index를, 없으면 -1을 반환하도록 완성하세요.
      starterCode: |-
        def first_match(items, target):
            raise NotImplementedError
      solution: |-
        def first_match(items, target):
            for index, item in enumerate(items):
                if item == target:
                    return index
            return -1
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day14.first-match.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day14.first-match.retrieval.behavior.v1.fixture
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
        entry: first_match
        cases:
        - id: duplicate
          arguments:
          - value:
            - a
            - b
            - a
          - value: a
          expectedReturn: 0
        - id: middle
          arguments:
          - value:
            - 3
            - 5
            - 7
          - value: 5
          expectedReturn: 1
        - id: missing
          arguments:
          - value:
            - 1
            - 2
          - value: 9
          expectedReturn: -1
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};