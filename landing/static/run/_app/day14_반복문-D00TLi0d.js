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
  goal: 리스트에 항목을 하나 더 넣으면 for 누적 결과가 얼마나 커지는지 확인한다.
  why: 장바구니 금액이나 하루 판매량처럼 개수가 고정되지 않은 목록을 하나씩 훑어 합계를 낼 때 쓰는 가장 기본 패턴입니다.
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
    prompt: |-
      첫 줄 numbers 리스트 끝에 6을 추가해 [1, 2, 3, 4, 5, 6]으로 만드세요.

      실행하면 21이 나와야 합니다.
    starterCode: |-
      numbers = [1, 2, 3, 4, 5]
      total = 0
      for num in numbers:
          total = total + num
      total
    solution: |-
      numbers = [1, 2, 3, 4, 5, 6]
      total = 0
      for num in numbers:
          total = total + num
      total
    hints:
    - numbers = [1, 2, 3, 4, 5] 를 numbers = [1, 2, 3, 4, 5, 6] 으로 바꿉니다. 나머지 줄은 그대로 둡니다.
    - "정답 형태: numbers = [1, 2, 3, 4, 5, 6]"
  check:
    type: outputExact
    evidence: practice
    outputExact: '21'
    resultCheck: "출력이 정확히 일치해야 합니다: '21'"
- id: for_string
  title: for 문자열 순회
  structuredPrimary: true
  subtitle: 문자열의 각 문자 처리
  goal: for가 문자열을 한 글자씩 꺼낸다는 것을 세는 글자를 바꿔 확인한다.
  why: 문자열에 특정 글자가 몇 번 나오는지 세거나 글자마다 검사할 때, 리스트로 바꾸지 않고 문자열을 그대로 for에 넣으면 됩니다.
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
    prompt: |-
      세는 글자를 바꿉니다. if char == 'o': 를 if char == 'l': 로 바꾸세요.

      hello world에는 l이 세 개 있으므로 실행하면 3이 나와야 합니다.
    starterCode: |-
      msg = 'hello world'
      found = 0
      for char in msg:
          if char == 'o':
              found = found + 1
      found
    solution: |-
      msg = 'hello world'
      found = 0
      for char in msg:
          if char == 'l':
              found = found + 1
      found
    hints:
    - "if char == 'o': 의 'o' 를 'l' 로 바꿉니다. msg 문자열과 나머지 줄은 그대로 둡니다."
    - "정답 형태: if char == 'l':"
  check:
    type: outputExact
    evidence: practice
    outputExact: '3'
    resultCheck: "출력이 정확히 일치해야 합니다: '3'"
- id: for_dict
  title: for 딕셔너리 순회
  structuredPrimary: true
  subtitle: 키, 값, 아이템 순회
  goal: 딕셔너리를 그냥 for에 넣으면 값이 아니라 키가 나온다는 것을 확인한다.
  why: 설정이나 집계 결과에서 항목 이름만 먼저 훑어야 할 때가 많은데, for가 기본으로 키를 준다는 것을 모르면 값을 다룬다고 착각한 채 코드를 씁니다.
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
    prompt: |-
      첫 줄에서 세 번째 항목의 키 'science'를 'history'로, 값 88을 70으로 바꾸세요.

      for는 값이 아니라 키를 꺼내므로 실행하면 아래 한 줄이 나와야 합니다.
      math english history
    starterCode: |-
      grades = {'math': 85, 'english': 90, 'science': 88}
      subjects = ''
      for subject in grades:
          subjects = subjects + subject + ' '
      subjects
    solution: |-
      grades = {'math': 85, 'english': 90, 'history': 70}
      subjects = ''
      for subject in grades:
          subjects = subjects + subject + ' '
      subjects
    hints:
    - "'science': 88 을 'history': 70 으로 바꿉니다. for 줄과 마지막 줄은 그대로 둡니다."
    - "정답 형태: grades = {'math': 85, 'english': 90, 'history': 70}"
  check:
    type: outputExact
    evidence: practice
    outputExact: math english history
    resultCheck: "출력이 정확히 일치해야 합니다: 'math english history'"
- id: range_basic
  title: range() 함수
  structuredPrimary: true
  subtitle: 숫자 시퀀스 생성
  goal: range에 시작 값을 지정하고 끝 값이 포함되지 않는다는 것을 눈으로 확인한다.
  why: 반복할 숫자 목록을 손으로 적는 대신 range로 만들 수 있는데, 끝 값이 빠진다는 규칙을 모르면 한 번씩 덜 돌거나 더 도는 실수를 계속 하게 됩니다.
  explanation: |-
    range() 함수는 숫자 시퀀스를 생성합니다. range(끝), range(시작, 끝), range(시작, 끝, 간격) 형식으로 사용하며, list()로 변환하면 리스트로 볼 수 있습니다. 끝 값은 포함되지 않습니다.

    range()는 메모리 효율적입니다. 필요할 때만 값을 생성합니다.
  snippet: list(range(5))
  exercise:
    prompt: |-
      list(range(5))를 list(range(2, 6))으로 바꾸세요. 2가 시작, 6이 끝입니다.

      끝 값 6은 포함되지 않으므로 실행하면 [2, 3, 4, 5]가 나와야 합니다.
    starterCode: list(range(5))
    solution: list(range(2, 6))
    hints:
    - range(5) 를 range(2, 6) 으로 바꿉니다. 감싸는 list()는 그대로 둡니다.
    - "정답 형태: list(range(2, 6))"
  check:
    type: outputExact
    evidence: practice
    outputExact: '[2, 3, 4, 5]'
    resultCheck: "출력이 정확히 일치해야 합니다: '[2, 3, 4, 5]'"
- id: for_range
  title: range()와 for
  structuredPrimary: true
  subtitle: 정해진 횟수만큼 반복
  goal: range의 끝 값을 늘려 반복 횟수와 누적 합계가 함께 커지는 것을 확인한다.
  why: 1번부터 N번까지 같은 처리를 되풀이할 때 range의 숫자 하나만 고치면 전체 반복 횟수를 바꿀 수 있습니다.
  explanation: |-
    range()와 for를 함께 사용하면 정해진 횟수만큼 반복할 수 있습니다. 인덱스를 이용한 순회나 n번 반복하는 작업에 유용합니다.

    리스트 순회시 인덱스가 필요없다면 for item in items를 사용하세요.
  snippet: |-
    rangeSum = 0
    for i in range(1, 6):
        rangeSum = rangeSum + i
    rangeSum
  exercise:
    prompt: |-
      range(1, 6)을 range(1, 11)로 바꾸세요. 1부터 10까지 더하게 됩니다.

      실행하면 55가 나와야 합니다.
    starterCode: |-
      rangeSum = 0
      for i in range(1, 6):
          rangeSum = rangeSum + i
      rangeSum
    solution: |-
      rangeSum = 0
      for i in range(1, 11):
          rangeSum = rangeSum + i
      rangeSum
    hints:
    - range(1, 6) 의 끝 값 6 을 11 로 바꿉니다. 끝 값은 포함되지 않으므로 10까지 더해집니다.
    - "정답 형태: for i in range(1, 11):"
  check:
    type: outputExact
    evidence: practice
    outputExact: '55'
    resultCheck: "출력이 정확히 일치해야 합니다: '55'"
- id: while_basic
  title: while 기본
  structuredPrimary: true
  subtitle: 조건이 참인 동안 반복
  goal: while 조건의 기준 숫자를 바꿔 반복이 언제 멈추는지 누적값으로 확인한다.
  why: 몇 번 돌지 미리 알 수 없고 어떤 조건이 만족될 때까지 계속 돌려야 하는 작업은 for가 아니라 while로 씁니다.
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
    prompt: |-
      반복 조건 while idx < 5: 를 while idx < 8: 로 바꾸세요. 0부터 7까지 더하게 됩니다.

      실행하면 28이 나와야 합니다.
    starterCode: |-
      idx = 0
      acc = 0
      while idx < 5:
          acc = acc + idx
          idx = idx + 1
      acc
    solution: |-
      idx = 0
      acc = 0
      while idx < 8:
          acc = acc + idx
          idx = idx + 1
      acc
    hints:
    - "while idx < 5: 의 5 를 8 로 바꿉니다. idx = idx + 1 줄은 반드시 그대로 두세요. 이 줄이 없으면 조건이 영원히 참이라 멈추지 않습니다."
    - "정답 형태: while idx < 8:"
  check:
    type: outputExact
    evidence: practice
    outputExact: '28'
    resultCheck: "출력이 정확히 일치해야 합니다: '28'"
- id: break_statement
  title: break 문
  structuredPrimary: true
  subtitle: 반복문 즉시 종료
  goal: break 조건을 낮춰 반복이 더 앞에서 멈추고 뒤쪽 항목은 아예 보지 않는 것을 확인한다.
  why: 목록에서 찾던 값을 만나면 나머지를 계속 훑을 이유가 없고, break로 즉시 빠져나오면 그만큼 일을 덜 합니다.
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
    prompt: |-
      멈추는 조건 if x > 5: 를 if x > 2: 로 바꾸세요. 3에서 처음 조건이 참이 됩니다.

      3을 만나자마자 break로 빠져나오므로 실행하면 3이 나와야 합니다. 4 이후 항목은 아예 보지 않습니다.
    starterCode: |-
      seq = [1, 2, 3, 4, 5, 6, 7, 8]
      hit = 0
      for x in seq:
          if x > 5:
              hit = x
              break
      hit
    solution: |-
      seq = [1, 2, 3, 4, 5, 6, 7, 8]
      hit = 0
      for x in seq:
          if x > 2:
              hit = x
              break
      hit
    hints:
    - "if x > 5: 의 5 를 2 로 바꿉니다. seq 리스트와 break 줄은 그대로 둡니다."
    - "정답 형태: if x > 2:"
  check:
    type: outputExact
    evidence: practice
    outputExact: '3'
    resultCheck: "출력이 정확히 일치해야 합니다: '3'"
- id: continue_statement
  title: continue 문
  structuredPrimary: true
  subtitle: 현재 반복 건너뛰기
  goal: 건너뛰는 조건을 바꿔 합계에서 빠지는 숫자가 달라지는 것을 확인한다.
  why: 취소된 주문이나 빈 줄처럼 처리 대상이 아닌 항목을 만났을 때 반복 전체를 멈추지 않고 그 건만 넘기는 방법입니다.
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
    prompt: |-
      건너뛰는 조건 if n % 2 == 0: 을 if n % 3 == 0: 으로 바꾸세요. 이제 3의 배수만 건너뜁니다.

      1부터 10까지의 합 55에서 3, 6, 9가 빠지므로 실행하면 37이 나와야 합니다.
    starterCode: |-
      odd = 0
      for n in range(1, 11):
          if n % 2 == 0:
              continue
          odd = odd + n
      odd
    solution: |-
      odd = 0
      for n in range(1, 11):
          if n % 3 == 0:
              continue
          odd = odd + n
      odd
    hints:
    - "if n % 2 == 0: 의 2 를 3 으로 바꿉니다. continue 줄과 누적 줄은 그대로 둡니다."
    - "정답 형태: if n % 3 == 0:"
  check:
    type: outputExact
    evidence: practice
    outputExact: '37'
    resultCheck: "출력이 정확히 일치해야 합니다: '37'"
- id: for_else
  title: for-else 절
  structuredPrimary: true
  subtitle: 정상 종료시 실행
  goal: 리스트에 큰 값을 하나 넣어 break가 걸리면 else가 실행되지 않는 것을 확인한다.
  why: 끝까지 찾아봤는데 없었던 상황과 찾자마자 멈춘 상황을 별도 플래그 변수 없이 구분할 수 있습니다.
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
    prompt: |-
      첫 줄 arr1의 마지막 항목 5를 50으로 바꾸세요.

      50에서 break가 걸려 else가 실행되지 않으므로 실행하면 found big이 나와야 합니다.
    starterCode: |-
      arr1 = [1, 2, 3, 4, 5]
      for a in arr1:
          if a > 10:
              flag = 'found big'
              break
      else:
          flag = 'all small'
      flag
    solution: |-
      arr1 = [1, 2, 3, 4, 50]
      for a in arr1:
          if a > 10:
              flag = 'found big'
              break
      else:
          flag = 'all small'
      flag
    hints:
    - arr1 = [1, 2, 3, 4, 5] 를 arr1 = [1, 2, 3, 4, 50] 으로 바꿉니다. for 아래 줄들은 그대로 둡니다.
    - "정답 형태: arr1 = [1, 2, 3, 4, 50]"
  check:
    type: outputExact
    evidence: practice
    outputExact: found big
    resultCheck: "출력이 정확히 일치해야 합니다: 'found big'"
- id: while_else
  title: while-else 절
  structuredPrimary: true
  subtitle: 조건 거짓시 실행
  goal: else가 반복이 끝난 뒤에 실행된다는 것을 counter의 최종값으로 확인한다.
  why: 조건이 거짓이 되어 정상 종료했을 때만 할 마무리 작업을 else에 모아두면 반복문 뒤에서 조건을 한 번 더 쓰지 않아도 됩니다.
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
    prompt: |-
      else 블록의 completion = 'done'을 completion = counter로 바꾸세요. 따옴표 없이 변수 이름만 씁니다.

      else는 조건이 거짓이 된 뒤에 실행되고 그때 counter는 이미 3이므로 실행하면 3이 나와야 합니다.
    starterCode: |-
      counter = 0
      while counter < 3:
          counter = counter + 1
      else:
          completion = 'done'
      completion
    solution: |-
      counter = 0
      while counter < 3:
          counter = counter + 1
      else:
          completion = counter
      completion
    hints:
    - "completion = 'done' 을 completion = counter 로 바꿉니다. while 줄과 마지막 줄은 그대로 둡니다."
    - "정답 형태: completion = counter"
  check:
    type: outputExact
    evidence: practice
    outputExact: '3'
    resultCheck: "출력이 정확히 일치해야 합니다: '3'"
- id: nested_loop
  title: 중첩 반복문
  structuredPrimary: true
  subtitle: 반복문 안의 반복문
  goal: 안쪽 목록을 하나 늘려 조합 개수가 곱셈으로 늘어나는 것을 확인한다.
  why: 색상과 사이즈처럼 두 목록의 모든 짝을 만들어야 할 때 쓰며, 개수가 곱으로 늘어난다는 감각이 있어야 느려질 지점을 미리 예상할 수 있습니다.
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
    prompt: |-
      두 번째 줄 sizes에 'L'을 추가해 ['S', 'M', 'L']로 만드세요.

      조합이 2 곱하기 2에서 2 곱하기 3으로 늘어나므로 실행하면 아래 한 줄이 나와야 합니다.
      red-S red-M red-L blue-S blue-M blue-L
    starterCode: |-
      colors = ['red', 'blue']
      sizes = ['S', 'M']
      combinations = ''
      for color in colors:
          for size in sizes:
              combinations = combinations + color + '-' + size + ' '
      combinations
    solution: |-
      colors = ['red', 'blue']
      sizes = ['S', 'M', 'L']
      combinations = ''
      for color in colors:
          for size in sizes:
              combinations = combinations + color + '-' + size + ' '
      combinations
    hints:
    - "sizes = ['S', 'M'] 를 sizes = ['S', 'M', 'L'] 로 바꿉니다. colors와 두 for 줄은 그대로 둡니다."
    - "정답 형태: sizes = ['S', 'M', 'L']"
  check:
    type: outputExact
    evidence: practice
    outputExact: red-S red-M red-L blue-S blue-M blue-L
    resultCheck: "출력이 정확히 일치해야 합니다: 'red-S red-M red-L blue-S blue-M blue-L'"
- id: workflow_validation
  title: 실무 반복 처리 루프
  structuredPrimary: true
  subtitle: 예측 → 누적 → 오류 확인 → 검증
  goal: 주문 목록을 훑으면서 status가 paid인 건만 골라 금액을 누적한다.
  why: 실제 업무 데이터에는 취소와 대기 건이 섞여 있어서 전체 개수가 아니라 조건에 맞는 건만 골라 합산해야 쓸모 있는 숫자가 나옵니다.
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
    prompt: |-
      리스트는 그대로 두고, 마지막 줄 len(dailyOrders)를 아래 네 줄로 바꾸세요. 전체 건수 대신 paid 건의 금액 합계를 구합니다.
      paidTotal = 0
      for order in dailyOrders:
          if order['status'] == 'paid':
              paidTotal = paidTotal + order['amount']
      paidTotal

      paid는 O-101, O-103, O-105 세 건이므로 실행하면 375000이 나와야 합니다.
    starterCode: |-
      dailyOrders = [
          {"id": "O-101", "status": "paid", "amount": 120000},
          {"id": "O-102", "status": "cancelled", "amount": 50000},
          {"id": "O-103", "status": "paid", "amount": 45000},
          {"id": "O-104", "status": "pending", "amount": 90000},
          {"id": "O-105", "status": "paid", "amount": 210000},
      ]

      len(dailyOrders)
    solution: |-
      dailyOrders = [
          {"id": "O-101", "status": "paid", "amount": 120000},
          {"id": "O-102", "status": "cancelled", "amount": 50000},
          {"id": "O-103", "status": "paid", "amount": 45000},
          {"id": "O-104", "status": "pending", "amount": 90000},
          {"id": "O-105", "status": "paid", "amount": 210000},
      ]

      paidTotal = 0
      for order in dailyOrders:
          if order['status'] == 'paid':
              paidTotal = paidTotal + order['amount']
      paidTotal
    hints:
    - "len(dailyOrders) 한 줄을 지우고 그 자리에 누적 변수 paidTotal = 0, for order in dailyOrders:, if order['status'] == 'paid':, 누적 줄, 마지막 paidTotal 을 차례로 씁니다. 들여쓰기는 for 아래 4칸, if 아래 8칸입니다."
    - "정답 형태: if order['status'] == 'paid': 아래에서 paidTotal = paidTotal + order['amount']"
  check:
    type: outputExact
    evidence: practice
    outputExact: '375000'
    resultCheck: "출력이 정확히 일치해야 합니다: '375000'"
- id: practice
  title: Day 14 종합 복습
  structuredPrimary: true
  subtitle: 반복문 마스터하기
  goal: 오늘 배운 for 누적을 직접 다시 써서 리스트 합계를 구한다.
  why: 리스트를 훑으며 하나씩 더하는 이 형태가 앞으로 나올 집계 코드 대부분의 뼈대라서 손에 익혀 둘 가치가 있습니다.
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
    prompt: |-
      첫 줄 evens 리스트 끝에 12를 추가해 [2, 4, 6, 8, 10, 12]로 만드세요.

      실행하면 42가 나와야 합니다.
    starterCode: |-
      evens = [2, 4, 6, 8, 10]
      evenSum = 0
      for e in evens:
          evenSum = evenSum + e
      evenSum
    solution: |-
      evens = [2, 4, 6, 8, 10, 12]
      evenSum = 0
      for e in evens:
          evenSum = evenSum + e
      evenSum
    hints:
    - evens = [2, 4, 6, 8, 10] 를 evens = [2, 4, 6, 8, 10, 12] 로 바꿉니다. 누적 줄과 마지막 줄은 그대로 둡니다.
    - "정답 형태: evens = [2, 4, 6, 8, 10, 12]"
  check:
    type: outputExact
    evidence: practice
    outputExact: '42'
    resultCheck: "출력이 정확히 일치해야 합니다: '42'"
- id: reflection
  title: Day 14 회고 - 반복문 패턴 굳히기
  structuredPrimary: true
  subtitle: 기억 굳히기
  goal: for와 while, break와 continue를 각각 언제 쓰는지 자기 말로 구분해 적는다.
  why: 문법을 알아도 상황에 맞는 반복 형태를 고르지 못하면 코드가 길고 복잡해지는데, 고르는 기준을 한 번 말로 정리해 두면 다음에 고민이 줄어듭니다.
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
    independentReview: approved
    reviewerId: "curriculum-integrity-review"
    reviewedAt: "2026-08-02T13:06:47+09:00"
    evidenceCommit: "22505301c65a9621c9e3321759115562ffa5e136"
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