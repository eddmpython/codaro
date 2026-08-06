var e=`meta:
  id: day09
  title: 튜플
  day: 9
  category: 30days
  tags:
  - 튜플
  - 불변성
  - 언패킹
  - 좌표
  - 설정값
  - 검증
  seo:
    title: 파이썬 튜플 - 변경 불가능한 시퀀스
    description: 튜플의 생성, 사용, 패킹/언패킹, 리스트와의 차이를 배웁니다.
    keywords:
    - 튜플
    - tuple
    - immutable
    - 패킹
    - 언패킹
intro:
  emoji: 🔒
  points:
  - 튜플의 불변성과 리스트와의 차이
  - 소괄호로 튜플 생성하기
  - 튜플 패킹과 언패킹
  - 안전한 데이터 저장
  direction: 튜플에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 튜플 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 튜플이란? 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: 다양한 튜플 생성 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: 튜플 인덱싱 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 튜플 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 튜플 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 튜플 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: tuple_intro
  title: 튜플이란?
  structuredPrimary: true
  subtitle: 변경 불가능한 리스트
  goal: 여러 값을 소괄호 하나에 담아 튜플을 만들고 전체를 확인한다.
  why: 좌표나 설정값처럼 한 번 정해지면 바뀌면 안 되는 값 묶음을 통째로 보관할 때 씁니다.
  explanation: |-
    튜플(Tuple)은 리스트와 비슷하지만 한 번 만들면 내용을 변경할 수 없는 자료구조입니다. 소괄호 ()로 만들고, 쉼표로 값을 구분합니다. 리스트는 수정 가능(mutable)하지만 튜플은 수정 불가능(immutable)합니다. 이러한 특성 때문에 변경되면 안 되는 중요한 데이터를 저장할 때 사용합니다.

    튜플은 딕셔너리의 키로 사용할 수 있지만, 리스트는 불가능합니다.
  snippet: |-
    nums = (1, 2, 3, 4, 5)
    nums
  exercise:
    prompt: |-
      nums의 마지막 값 5를 50으로 바꾸세요.

      실행하면 (1, 2, 3, 4, 50)이 나와야 합니다.
    starterCode: |-
      nums = (1, 2, 3, 4, 5)
      nums
    solution: |-
      nums = (1, 2, 3, 4, 50)
      nums
    hints:
    - 소괄호 안 맨 뒤의 5를 50으로 바꿉니다. 마지막 줄 nums는 그대로 둡니다.
    - "정답 형태: nums = (1, 2, 3, 4, 50)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(1, 2, 3, 4, 50)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(1, 2, 3, 4, 50)'"
- id: tuple_create
  title: 다양한 튜플 생성
  structuredPrimary: true
  subtitle: 여러 형태의 튜플
  goal: 요소가 하나뿐인 튜플을 쉼표까지 붙여 정확히 만든다.
  why: 쉼표 하나를 빠뜨리면 튜플이 아니라 그냥 숫자가 되어 뒤에서 엉뚱한 에러로 이어지기 때문입니다.
  explanation: |-
    튜플은 리스트처럼 다양한 타입을 담을 수 있습니다. 숫자만, 문자열만, 또는 여러 타입을 섞어서 만들 수 있습니다. 요소가 하나인 튜플은 쉼표를 꼭 붙여야 합니다. 소괄호 없이 쉼표만으로도 튜플이 됩니다.

    요소가 하나일 때 (42)는 그냥 숫자이고, (42,)가 튜플입니다.
  snippet: |-
    digits = (10, 20, 30)
    digits
  exercise:
    prompt: |-
      digits를 요소가 하나뿐인 튜플 (42,)로 바꾸세요. 42 뒤의 쉼표를 빠뜨리면 튜플이 아니라 그냥 숫자가 됩니다.

      실행하면 (42,)가 나와야 합니다. 요소가 하나인 튜플은 쉼표가 붙은 채로 표시됩니다.
    starterCode: |-
      digits = (10, 20, 30)
      digits
    solution: |-
      digits = (42,)
      digits
    hints:
    - digits = (10, 20, 30) 을 digits = (42,) 로 바꿉니다. 42 뒤의 쉼표를 꼭 넣습니다.
    - "정답 형태: digits = (42,)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(42,)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(42,)'"
- id: tuple_indexing
  title: 튜플 인덱싱
  structuredPrimary: true
  subtitle: 리스트처럼 접근
  goal: 인덱스 번호로 튜플에서 원하는 항목 하나를 꺼낸다.
  why: 색상이나 좌표처럼 자리마다 의미가 정해진 묶음에서 특정 자리 값만 꺼내 쓸 때 필요합니다.
  explanation: |-
    튜플도 리스트처럼 인덱스로 요소에 접근할 수 있습니다. 0부터 시작하는 양수 인덱스와 -1부터 시작하는 음수 인덱스를 모두 사용할 수 있습니다. 접근 방법은 리스트와 완전히 동일합니다.

    튜플의 인덱싱은 리스트와 동일하게 작동합니다.
  snippet: |-
    palette = ('빨강', '초록', '파랑', '노랑')
    palette[0]
  exercise:
    prompt: |-
      마지막 줄 palette[0]을 palette[2]로 바꾸세요.

      인덱스는 0부터 세므로 파랑이 나와야 합니다.
    starterCode: |-
      palette = ('빨강', '초록', '파랑', '노랑')
      palette[0]
    solution: |-
      palette = ('빨강', '초록', '파랑', '노랑')
      palette[2]
    hints:
    - "palette[0] 을 palette[2] 로 바꿉니다. 첫 줄 튜플은 그대로 둡니다."
    - "정답 형태: palette[2]"
  check:
    type: outputExact
    evidence: practice
    outputExact: 파랑
    resultCheck: "출력이 정확히 일치해야 합니다: '파랑'"
- id: tuple_slicing
  title: 튜플 슬라이싱
  structuredPrimary: true
  subtitle: 부분 튜플 추출
  goal: 시작과 끝 인덱스를 지정해 튜플의 가운데 구간만 잘라낸다.
  why: 긴 값 묶음에서 필요한 구간만 떼어 볼 때 쓰고, 잘라낸 결과도 여전히 튜플이라 원본은 그대로 남습니다.
  explanation: |-
    튜플도 슬라이싱으로 부분 튜플을 추출할 수 있습니다. [시작:끝] 형식을 사용하며, 결과는 새로운 튜플입니다. step을 지정하여 간격을 두고 추출하거나 역순으로 만들 수도 있습니다. 슬라이싱 문법은 리스트와 완전히 동일합니다.

    슬라이싱 결과는 항상 새로운 튜플입니다.
  snippet: |-
    digits = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
    digits[:5]
  exercise:
    prompt: |-
      마지막 줄 digits[:5]를 digits[3:7]로 바꾸세요.

      실행하면 (3, 4, 5, 6)이 나와야 합니다. 끝 인덱스 7은 포함되지 않습니다.
    starterCode: |-
      digits = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
      digits[:5]
    solution: |-
      digits = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
      digits[3:7]
    hints:
    - "digits[:5] 를 digits[3:7] 로 바꿉니다. 첫 줄 튜플은 그대로 둡니다."
    - "정답 형태: digits[3:7]"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(3, 4, 5, 6)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(3, 4, 5, 6)'"
- id: tuple_immutable
  title: 튜플의 불변성
  structuredPrimary: true
  subtitle: 변경 불가능한 특성
  goal: 튜플은 자리 하나만 바꿀 수 없고 변수에 새 튜플을 통째로 다시 담아야 한다는 것을 확인한다.
  why: 리스트에서 되던 자리 바꾸기가 튜플에서는 에러가 나므로, 값을 바꿀 일이 있는지 먼저 정하고 자료형을 골라야 합니다.
  explanation: |-
    튜플은 한 번 만들면 요소를 추가, 삭제, 수정할 수 없습니다. 인덱스로 값을 변경하려고 하면 에러가 발생합니다. 이것이 리스트와 가장 큰 차이점입니다. 불변성 덕분에 안전하게 데이터를 보호할 수 있고, 딕셔너리의 키로 사용할 수 있습니다.

    튜플[0] = 새값 같은 코드는 에러가 발생합니다.
  snippet: |-
    fixed = (1, 2, 3)
    flex = [1, 2, 3]
    flex[0] = 10
    print('tuple:', fixed)
    print('list_before:', [1, 2, 3])
    print('list_after:', flex)
  exercise:
    prompt: |-
      첫 줄 fixed = (1, 2, 3)을 fixed = (7, 8, 9)로 바꾸세요. 튜플은 fixed[0] = 7처럼 한 자리만 바꿀 수 없지만, 변수에 새 튜플을 통째로 다시 담는 것은 됩니다.

      실행하면 아래 세 줄이 나와야 합니다.
      tuple: (7, 8, 9)
      list_before: [1, 2, 3]
      list_after: [10, 2, 3]
    starterCode: |-
      fixed = (1, 2, 3)
      flex = [1, 2, 3]
      flex[0] = 10
      print('tuple:', fixed)
      print('list_before:', [1, 2, 3])
      print('list_after:', flex)
    solution: |-
      fixed = (7, 8, 9)
      flex = [1, 2, 3]
      flex[0] = 10
      print('tuple:', fixed)
      print('list_before:', [1, 2, 3])
      print('list_after:', flex)
    hints:
    - fixed = (1, 2, 3) 을 fixed = (7, 8, 9) 로 바꿉니다. flex 줄과 print() 세 줄은 그대로 둡니다.
    - "정답 형태: fixed = (7, 8, 9)"
  check:
    type: outputExact
    evidence: practice
    outputExact: |-
      tuple: (7, 8, 9)
      list_before: [1, 2, 3]
      list_after: [10, 2, 3]
    resultCheck: "출력이 정확히 일치해야 합니다: 'tuple: (7, 8, 9)\\nlist_before: [1, 2, 3]\\nlist_after: [10, 2, 3]'"
- id: tuple_concat
  title: 튜플 연결과 반복
  structuredPrimary: true
  subtitle: + 와 * 연산자
  goal: '* 연산자로 튜플을 정해진 횟수만큼 반복한 새 튜플을 만든다.'
  why: 연결과 반복은 원본 튜플을 건드리지 않고 새 튜플을 만들기 때문에, 바뀌면 안 되는 값 묶음을 그대로 두고도 필요한 형태를 얻을 수 있습니다.
  explanation: |-
    튜플도 + 연산자로 연결하고 * 연산자로 반복할 수 있습니다. 이 연산들은 원본 튜플을 변경하지 않고 새로운 튜플을 만듭니다. 불변성을 유지하면서도 새로운 튜플을 생성할 수 있는 방법입니다.

    연결과 반복은 원본을 변경하지 않고 새 튜플을 만듭니다.
  snippet: |-
    left = (1, 2, 3)
    right = (4, 5, 6)
    left + right
  exercise:
    prompt: |-
      마지막 줄 left + right를 left * 3으로 바꾸세요.

      실행하면 (1, 2, 3, 1, 2, 3, 1, 2, 3)이 나와야 합니다.
    starterCode: |-
      left = (1, 2, 3)
      right = (4, 5, 6)
      left + right
    solution: |-
      left = (1, 2, 3)
      right = (4, 5, 6)
      left * 3
    hints:
    - "left + right 를 left * 3 으로 바꿉니다. 앞의 두 줄은 그대로 둡니다."
    - "정답 형태: left * 3"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(1, 2, 3, 1, 2, 3, 1, 2, 3)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(1, 2, 3, 1, 2, 3, 1, 2, 3)'"
- id: tuple_membership
  title: in/not in 연산자
  structuredPrimary: true
  subtitle: 요소 포함 여부 확인
  goal: in 연산자로 특정 값이 튜플에 들어 있는지 True와 False로 확인한다.
  why: 허용된 값 목록에 들어 있는지 먼저 검사하면 잘못된 입력을 조용히 통과시키지 않습니다.
  explanation: |-
    튜플도 in과 not in 연산자로 특정 값의 포함 여부를 확인할 수 있습니다. 사용법은 리스트와 완전히 동일합니다. True 또는 False를 반환합니다.

    in 연산자는 튜플에서도 리스트처럼 작동합니다.
  snippet: |-
    weekdays = ('월', '화', '수', '목', '금')
    '수' in weekdays
  exercise:
    prompt: |-
      마지막 줄에서 찾는 값 '수'를 '토'로 바꾸세요.

      weekdays에 토가 없으므로 False가 나와야 합니다.
    starterCode: |-
      weekdays = ('월', '화', '수', '목', '금')
      '수' in weekdays
    solution: |-
      weekdays = ('월', '화', '수', '목', '금')
      '토' in weekdays
    hints:
    - "'수' in weekdays 를 '토' in weekdays 로 바꿉니다. 첫 줄 튜플은 그대로 둡니다."
    - "정답 형태: '토' in weekdays"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'False'
    resultCheck: "출력이 정확히 일치해야 합니다: 'False'"
- id: tuple_packing
  title: 튜플 패킹
  structuredPrimary: true
  subtitle: 여러 값을 하나로 묶기
  goal: 소괄호 없이 쉼표만으로 값을 묶어도 튜플이 되는 것을 확인한다.
  why: 함수가 값을 여러 개 돌려줄 때 이 형태가 그대로 나오므로, 괄호 없는 튜플을 알아볼 수 있어야 합니다.
  explanation: |-
    여러 개의 값을 쉼표로 나열하면 자동으로 튜플이 만들어집니다. 이를 튜플 패킹(Tuple Packing)이라고 합니다. 소괄호 없이도 튜플이 생성됩니다. 함수에서 여러 값을 반환할 때 자주 사용되는 기법입니다.

    쉼표가 튜플을 만드는 핵심입니다. 소괄호는 선택사항입니다.
  snippet: |-
    coords = 10, 20
    coords
  exercise:
    prompt: |-
      coords에 값 하나를 더해 coords = 10, 20, 30으로 바꾸세요. 소괄호는 넣지 않습니다.

      괄호 없이 써도 튜플이므로 (10, 20, 30)이 나와야 합니다.
    starterCode: |-
      coords = 10, 20
      coords
    solution: |-
      coords = 10, 20, 30
      coords
    hints:
    - coords = 10, 20 을 coords = 10, 20, 30 으로 바꿉니다. 마지막 줄 coords는 그대로 둡니다.
    - "정답 형태: coords = 10, 20, 30"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(10, 20, 30)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(10, 20, 30)'"
- id: tuple_unpacking
  title: 튜플 언패킹
  structuredPrimary: true
  subtitle: 튜플을 여러 변수로 분리
  goal: 튜플의 값을 두 변수로 나눠 받고 순서를 바꿔 다시 묶어 본다.
  why: 함수가 돌려준 여러 값을 한 줄에 나눠 받을 때 어느 자리가 무엇인지 정확히 알아야 값을 뒤바꿔 쓰지 않습니다.
  explanation: |-
    튜플의 요소들을 여러 개의 변수에 한 번에 할당하는 것을 튜플 언패킹(Tuple Unpacking)이라고 합니다. 튜플의 요소 개수와 변수 개수가 정확히 일치해야 합니다. 값 교환이나 함수 반환값 받기에 매우 유용합니다.

    a, b = b, a 로 두 변수의 값을 간단히 교환할 수 있습니다.
  snippet: |-
    point = (100, 200)
    px, py = point
    px, py
  exercise:
    prompt: |-
      마지막 줄 px, py를 py, px로 바꾸세요.

      나눠 받은 두 값이 순서만 바뀌어 (200, 100)이 나와야 합니다.
    starterCode: |-
      point = (100, 200)
      px, py = point
      px, py
    solution: |-
      point = (100, 200)
      px, py = point
      py, px
    hints:
    - 마지막 줄 px, py 를 py, px 로 바꿉니다. 앞의 두 줄은 그대로 둡니다.
    - "정답 형태: py, px"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(200, 100)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(200, 100)'"
- id: tuple_list_convert
  title: 튜플과 리스트 변환
  structuredPrimary: true
  subtitle: tuple()과 list() 함수
  goal: tuple()로 리스트와 문자열을 튜플로 바꾼다.
  why: 수정해야 할 때는 리스트로, 더 이상 바뀌면 안 될 때는 튜플로 옮겨 담기 때문에 두 형태를 오갈 수 있어야 합니다.
  explanation: |-
    tuple() 함수는 리스트를 튜플로, list() 함수는 튜플을 리스트로 변환합니다. 데이터를 수정해야 할 때는 리스트로, 보호해야 할 때는 튜플로 변환합니다. 문자열도 tuple()이나 list()로 변환하면 문자들이 개별 요소가 됩니다.

    tuple('hello')는 ('h', 'e', 'l', 'l', 'o')가 됩니다.
  snippet: |-
    items = [1, 2, 3, 4, 5]
    tuple(items)
  exercise:
    prompt: |-
      items를 리스트 대신 문자열 'hello'로 바꾸세요.

      문자열을 tuple()에 넣으면 글자 하나하나가 요소가 되어 ('h', 'e', 'l', 'l', 'o')가 나와야 합니다.
    starterCode: |-
      items = [1, 2, 3, 4, 5]
      tuple(items)
    solution: |-
      items = 'hello'
      tuple(items)
    hints:
    - "items = [1, 2, 3, 4, 5] 를 items = 'hello' 로 바꿉니다. 마지막 줄 tuple(items)는 그대로 둡니다."
    - "정답 형태: items = 'hello'"
  check:
    type: outputExact
    evidence: practice
    outputExact: "('h', 'e', 'l', 'l', 'o')"
    resultCheck: "출력이 정확히 일치해야 합니다: \\"('h', 'e', 'l', 'l', 'o')\\""
- id: tuple_methods
  title: 튜플 메서드
  structuredPrimary: true
  subtitle: count()와 index()
  goal: index()로 값이 처음 나오는 위치를 찾는다.
  why: 튜플에 남은 메서드는 개수를 세는 count()와 위치를 찾는 index() 둘뿐이라, 무엇을 돌려주는지 구분해서 써야 합니다.
  explanation: |-
    튜플은 수정 불가능하기 때문에 리스트보다 메서드가 적습니다. count()는 특정 값의 개수를, index()는 특정 값의 위치를 반환합니다. 이 두 메서드는 리스트의 메서드와 완전히 동일하게 작동합니다.

    append, remove 같은 수정 메서드는 튜플에 없습니다.
  snippet: |-
    sample = (1, 2, 3, 2, 4, 2, 5)
    sample.count(2)
  exercise:
    prompt: |-
      마지막 줄 sample.count(2)를 sample.index(4)로 바꾸세요. count()는 개수를, index()는 위치를 돌려줍니다.

      위치는 0부터 세므로 4가 나와야 합니다.
    starterCode: |-
      sample = (1, 2, 3, 2, 4, 2, 5)
      sample.count(2)
    solution: |-
      sample = (1, 2, 3, 2, 4, 2, 5)
      sample.index(4)
    hints:
    - "sample.count(2) 를 sample.index(4) 로 바꿉니다. 첫 줄 튜플은 그대로 둡니다."
    - "정답 형태: sample.index(4)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '4'
    resultCheck: "출력이 정확히 일치해야 합니다: '4'"
- id: tuple_length
  title: 튜플 길이
  structuredPrimary: true
  subtitle: len() 함수
  goal: len()으로 튜플에 담긴 요소 개수를 센다.
  why: 튜플은 길이와 순서 자체가 약속이라, 받은 묶음의 개수가 맞는지 먼저 세어 확인합니다.
  explanation: |-
    len() 함수는 튜플의 요소 개수를 반환합니다. 리스트, 문자열과 동일하게 작동합니다. 튜플이 몇 개의 요소를 가지고 있는지 알 수 있습니다.

    len()은 문자열, 리스트, 튜플 모두에 사용 가능합니다.
  snippet: |-
    week = ('월', '화', '수', '목', '금', '토', '일')
    len(week)
  exercise:
    prompt: |-
      week에서 '토'와 '일'을 지워 평일 다섯 개만 남기세요.

      실행하면 5가 나와야 합니다.
    starterCode: |-
      week = ('월', '화', '수', '목', '금', '토', '일')
      len(week)
    solution: |-
      week = ('월', '화', '수', '목', '금')
      len(week)
    hints:
    - "튜플 끝의 , '토', '일' 부분을 지웁니다. 마지막 줄 len(week)는 그대로 둡니다."
    - "정답 형태: week = ('월', '화', '수', '목', '금')"
  check:
    type: outputExact
    evidence: practice
    outputExact: '5'
    resultCheck: "출력이 정확히 일치해야 합니다: '5'"
- id: workflow_validation
  title: '검증 루프: 변경되면 안 되는 설정값 다루기'
  structuredPrimary: true
  subtitle: 튜플의 불변성과 언패킹을 안전한 데이터 계약으로 사용
  goal: 언패킹으로 계산한 상자 크기가 기대한 튜플과 같은지 assert로 검증한다.
  why: 좌표는 자리 하나가 뒤바뀌어도 계산이 그냥 돌아가 버리기 때문에, 기준값을 assert로 코드에 못박아 둡니다.
  explanation: 튜플은 리스트의 불편한 버전이 아니라, 바뀌면 안 되는 값 묶음을 표현하는 방법입니다. 좌표, 색상, 설정값, 함수 반환값처럼 길이와 순서가 계약인 데이터를
    다룰 때 튜플을 쓰면 실수로 수정되는 일을 막을 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    serverConfig = ('localhost', 8080, True)
    hostName, portNumber, secureMode = serverConfig

    endpoint = f'http://{hostName}:{portNumber}'
    if secureMode:
        endpoint = endpoint.replace('http://', 'https://')

    assert len(serverConfig) == 3
    assert hostName == 'localhost'
    assert portNumber == 8080
    assert endpoint == 'https://localhost:8080'
  exercise:
    prompt: |-
      값은 바꾸지 말고 코드를 그대로 실행하세요.

      assert 두 줄이 모두 통과하고 마지막에 (60, 75)가 나와야 합니다.
    starterCode: |-
      topLeft = (10, 20)
      bottomRight = (70, 95)
      left, top = topLeft
      right, bottom = bottomRight
      boxSize = (right - left, bottom - top)

      assert boxSize == (60, 75)
      assert topLeft == (10, 20)
      boxSize
    solution: |-
      topLeft = (10, 20)
      bottomRight = (70, 95)
      left, top = topLeft
      right, bottom = bottomRight
      boxSize = (right - left, bottom - top)

      assert boxSize == (60, 75)
      assert topLeft == (10, 20)
      boxSize
    hints:
    - 좌표 숫자를 바꾸면 assert가 AssertionError로 멈춥니다. 그때는 원래 값으로 되돌리세요.
    - "정답 형태: 코드를 그대로 실행, 마지막 값 (60, 75)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(60, 75)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(60, 75)'"
- id: practice
  title: Day 9 종합 복습
  structuredPrimary: true
  subtitle: 튜플 마스터하기
  goal: 슬라이싱으로 튜플 가운데 구간만 잘라 오늘 배운 표기를 복습한다.
  why: 튜플도 리스트와 같은 인덱스와 슬라이스 표기를 쓴다는 것을 직접 손으로 확인해야 다음 강의에서 헷갈리지 않습니다.
  explanation: Day 9에서 배운 튜플을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로
    해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    start = 10, 20
    print('start:', start)
  exercise:
    prompt: |-
      마지막 줄 tpl을 tpl[1:4]로 바꾸세요.

      실행하면 (2, 3, 4)가 나와야 합니다. 끝 인덱스 4는 포함되지 않습니다.
    starterCode: |-
      tpl = (1, 2, 3, 4, 5)
      tpl
    solution: |-
      tpl = (1, 2, 3, 4, 5)
      tpl[1:4]
    hints:
    - "마지막 줄 tpl 을 tpl[1:4] 로 바꿉니다. 첫 줄 튜플은 그대로 둡니다."
    - "정답 형태: tpl[1:4]"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(2, 3, 4)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(2, 3, 4)'"
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
  - id: day09-coordinate-label-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - tuple_intro
    - practice
    title: 좌표 튜플을 문구로 바꾸기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: 튜플 언패킹으로 x와 y를 분리한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: coordinate_label(point)가 'x,y' 형식의 문자열을 반환하도록 완성하세요.
      starterCode: |-
        def coordinate_label(point):
            raise NotImplementedError
      solution: |-
        def coordinate_label(point):
            x, y = point
            return f"{x},{y}"
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day09.coordinate-label.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day09.coordinate-label.mastery.behavior.v1.fixture
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
        entry: coordinate_label
        cases:
        - id: positive
          arguments:
          - value:
            - 3
            - 5
          expectedReturn: 3,5
        - id: negative
          arguments:
          - value:
            - -1
            - 2
          expectedReturn: -1,2
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day09-swap-pair-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day09-coordinate-label-mastery
    title: 두 값을 새 순서로 교환하기
    subtitle: 처음 보는 조건에 개념 적용
    goal: 튜플 언패킹을 값 교환 문제에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: swap_pair(pair)가 두 값의 순서를 바꾼 튜플을 반환하도록 완성하세요.
      starterCode: |-
        def swap_pair(pair):
            raise NotImplementedError
      solution: |-
        def swap_pair(pair):
            left, right = pair
            return right, left
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day09.swap-pair.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day09.swap-pair.transfer.behavior.v1.fixture
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
        entry: swap_pair
        cases:
        - id: numbers
          arguments:
          - value:
            - 1
            - 2
          expectedReturn:
          - 2
          - 1
        - id: words
          arguments:
          - value:
            - first
            - second
          expectedReturn:
          - second
          - first
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day09-record-dict-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day09-swap-pair-transfer
    title: 고정 순서 레코드 다시 해석하기
    subtitle: 7일 뒤 기억에서 재구성
    goal: 튜플의 위치 의미를 기억해 이름 있는 dict로 바꾼다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: 'record_to_dict(record)가 (name, score)를 {''name'': ..., ''score'': ...}로 반환하도록 완성하세요.'
      starterCode: |-
        def record_to_dict(record):
            raise NotImplementedError
      solution: |-
        def record_to_dict(record):
            name, score = record
            return {'name': name, 'score': score}
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day09.record-dict.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day09.record-dict.retrieval.behavior.v1.fixture
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
        entry: record_to_dict
        cases:
        - id: first
          arguments:
          - value:
            - Mina
            - 92
          expectedReturn:
            name: Mina
            score: 92
        - id: second
          arguments:
          - value:
            - Jun
            - 80
          expectedReturn:
            name: Jun
            score: 80
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};