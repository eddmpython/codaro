var e=`meta:
  id: day11
  title: 딕셔너리기초
  day: 11
  category: 30days
  tags:
  - 딕셔너리
  - key-value
  - 중첩데이터
  - 주문데이터
  - KeyError
  - 검증
  seo:
    title: 파이썬 딕셔너리 기초 - 키-값 쌍 데이터 관리
    description: 딕셔너리의 생성, 접근, 수정, 추가, 삭제 방법을 배웁니다.
    keywords:
    - 딕셔너리
    - dict
    - key
    - value
    - 키-값
intro:
  emoji: 📖
  points:
  - 키-값 쌍으로 데이터 저장
  - 키로 빠르게 값에 접근
  - 딕셔너리 생성과 수정
  - 실전 데이터 구조 활용
  direction: 딕셔너리기초에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 딕셔너리기초 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 딕셔너리란? 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: 딕셔너리 생성하기 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: 키로 값 접근하기 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 딕셔너리기초 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 딕셔너리기초 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 딕셔너리기초 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: dict_intro
  title: 딕셔너리란?
  structuredPrimary: true
  subtitle: 키로 찾는 데이터 저장소
  goal: 딕셔너리란?에서 \`lang\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    딕셔너리(Dictionary)는 키(Key)와 값(Value)을 쌍으로 저장하는 자료구조입니다. 중괄호 {}로 만들고, 키:값 형태로 데이터를 저장합니다. 실제 사전처럼 단어(키)로 뜻(값)을 찾듯이, 키를 사용하여 값을 빠르게 찾을 수 있습니다. 리스트는 인덱스(숫자)로 접근하지만, 딕셔너리는 의미있는 키(문자열, 숫자 등)로 접근합니다.

    딕셔너리는 순서를 보장하지 않았지만, Python 3.7부터는 입력 순서를 유지합니다.
  snippet: |-
    lang = {'name': 'Python', 'type': 'Language', 'year': 1991}
    lang
  exercise:
    prompt: 딕셔너리란? 예제에서 \`lang\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      lang = {'name': 'Python', 'type': 'Language', 'year': 1991}
      lang
    hints:
    - 바꿀 지점은 \`lang = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`lang\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 딕셔너리란?에서 \`lang\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 딕셔너리란? 실행 뒤 \`lang\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: dict_create
  title: 딕셔너리 생성하기
  structuredPrimary: true
  subtitle: 다양한 방법으로 만들기
  goal: 딕셔너리 생성하기에서 \`person\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    딕셔너리는 중괄호로 직접 만들거나 dict() 함수를 사용합니다. 빈 딕셔너리는 {}나 dict()로 만듭니다. 키는 문자열, 숫자, 튜플 등 변경 불가능한(immutable) 타입이어야 합니다. 값은 어떤 타입이든 가능합니다.

    리스트는 키로 사용할 수 없지만, 튜플은 가능합니다.
  snippet: |-
    person = {'name': '홍길동', 'age': 25, 'city': '서울'}
    person
  exercise:
    prompt: 딕셔너리 생성하기 예제에서 \`person\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      person = {'name': '홍길동', 'age': 25, 'city': '서울'}
      person
    hints:
    - 바꿀 지점은 \`person = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`person\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 딕셔너리 생성하기에서 \`person\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 딕셔너리 생성하기 실행 뒤 \`person\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: dict_access
  title: 키로 값 접근하기
  structuredPrimary: true
  subtitle: 대괄호 [] 사용
  goal: 키로 값 접근하기에서 \`dev\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    딕셔너리에서 값을 가져올 때는 대괄호 [] 안에 키를 넣습니다. dict[key] 형식으로 사용하면 그 키에 해당하는 값을 반환합니다. 존재하지 않는 키를 사용하면 에러가 발생합니다. 리스트의 인덱스 접근과 비슷하지만, 숫자 대신 키를 사용합니다.

    키 이름을 정확히 입력해야 합니다. 대소문자도 구분합니다.
  snippet: |-
    dev = {'name': '김철수', 'age': 30, 'job': 'developer'}
    dev['name']
  exercise:
    prompt: 키로 값 접근하기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      dev = {'name': '김철수', 'age': 30, 'job': 'developer'}
      dev['name']
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 키로 값 접근하기에서 \`dev\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 키로 값 접근하기 실행 뒤 \`dev\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: dict_modify
  title: 키로 값 수정하기
  structuredPrimary: true
  subtitle: 기존 값 변경
  goal: 키로 값 수정하기에서 \`laptop\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    딕셔너리의 값을 수정할 때는 접근과 동일하게 대괄호를 사용하고 새 값을 할당합니다. dict[key] = new_value 형식입니다. 리스트처럼 원본이 직접 변경됩니다. 이미 있는 키에 값을 할당하면 기존 값이 새 값으로 교체됩니다.

    같은 키에 할당하면 값이 변경됩니다.
  snippet: |-
    laptop = {'name': '노트북', 'price': 1000000, 'stock': 5}
    laptop['price'] = 1200000
    laptop
  exercise:
    prompt: 키로 값 수정하기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      laptop = {'name': '노트북', 'price': 1000000, 'stock': 5}
      laptop['price'] = 1200000
      laptop
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 키로 값 수정하기에서 \`laptop\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 키로 값 수정하기 실행 뒤 \`laptop\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: dict_add
  title: 새 키-값 쌍 추가하기
  structuredPrimary: true
  subtitle: 없는 키에 값 할당
  goal: 새 키값 쌍 추가하기에서 \`member\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    딕셔너리에 새로운 키-값 쌍을 추가할 때도 대괄호를 사용합니다. 존재하지 않는 키에 값을 할당하면 자동으로 새 항목이 추가됩니다. dict[new_key] = value 형식입니다. 리스트의 append()처럼 별도의 메서드 없이 간단히 추가할 수 있습니다.

    없는 키에 할당하면 추가, 있는 키에 할당하면 수정됩니다.
  snippet: |-
    member = {'name': '이영희', 'age': 28}
    member['city'] = '부산'
    member
  exercise:
    prompt: 새 키값 쌍 추가하기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      member = {'name': '이영희', 'age': 28}
      member['city'] = '부산'
      member
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 새 키값 쌍 추가하기에서 \`member\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 새 키값 쌍 추가하기 실행 뒤 \`member\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: dict_delete
  title: del로 키-값 삭제
  structuredPrimary: true
  subtitle: 항목 제거하기
  goal: del로 키값 삭제에서 \`alpha\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    del 키워드를 사용하여 딕셔너리에서 특정 키-값 쌍을 삭제할 수 있습니다. del dict[key] 형식으로 사용하며, 해당 키와 값이 함께 제거됩니다. 존재하지 않는 키를 삭제하려 하면 에러가 발생합니다.

    del은 변수 자체를 삭제할 때도 사용됩니다.
  snippet: |-
    alpha = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
    del alpha['b']
    alpha
  exercise:
    prompt: del로 키값 삭제 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      alpha = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
      del alpha['b']
      alpha
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: del로 키값 삭제에서 \`alpha\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: del로 키값 삭제 실행 뒤 \`alpha\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: dict_membership
  title: in/not in 연산자
  structuredPrimary: true
  subtitle: 키 존재 확인
  goal: in/not in 연산자에서 \`grades\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    in과 not in 연산자로 딕셔너리에 특정 키가 있는지 확인할 수 있습니다. key in dict 형식으로 사용하며, 키의 존재 여부를 True/False로 반환합니다. 주의할 점은 키를 확인하는 것이지 값을 확인하는 것이 아닙니다.

    값의 존재를 확인하려면 values() 메서드를 사용해야 합니다(Day 12).
  snippet: |-
    grades = {'math': 85, 'english': 90, 'science': 88}
    'math' in grades
  exercise:
    prompt: in/not in 연산자 예제에서 \`grades\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      grades = {'math': 85, 'english': 90, 'science': 88}
      'math' in grades
    hints:
    - 바꿀 지점은 \`grades = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`grades\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: in/not in 연산자에서 \`grades\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: in/not in 연산자 실행 뒤 \`grades\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: dict_length
  title: 딕셔너리 길이
  structuredPrimary: true
  subtitle: len() 함수
  goal: 딕셔너리 길이에서 \`profile\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    len() 함수는 딕셔너리의 키-값 쌍 개수를 반환합니다. 리스트, 튜플, 집합과 동일하게 작동합니다. 딕셔너리가 몇 개의 항목을 가지고 있는지 알 수 있습니다.

    len()은 키의 개수를 셉니다. 값의 개수가 아닙니다.
  snippet: |-
    profile = {'name': '박민수', 'age': 35, 'city': '대구', 'job': 'teacher'}
    len(profile)
  exercise:
    prompt: 딕셔너리 길이 예제에서 \`profile\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      profile = {'name': '박민수', 'age': 35, 'city': '대구', 'job': 'teacher'}
      len(profile)
    hints:
    - 바꿀 지점은 \`profile = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`profile\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 딕셔너리 길이에서 \`profile\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 딕셔너리 길이 실행 뒤 \`profile\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: dict_multiple
  title: 여러 키-값 접근
  structuredPrimary: true
  subtitle: 한 번에 여러 값 가져오기
  goal: 여러 키값 접근에서 \`full\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    딕셔너리에서 여러 값을 가져와야 할 때는 각 키로 개별적으로 접근합니다. 리스트처럼 슬라이싱은 없지만, 필요한 키들로 값을 가져와 새 딕셔너리나 튜플로 만들 수 있습니다.

    필요한 정보만 선택하여 새 딕셔너리를 만들 수 있습니다.
  snippet: |-
    full = {'name': '정지은', 'age': 27, 'city': '인천', 'job': 'engineer', 'hobby': 'reading'}
    basic = {'name': full['name'], 'age': full['age']}
    basic
  exercise:
    prompt: 여러 키값 접근 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      full = {'name': '정지은', 'age': 27, 'city': '인천', 'job': 'engineer', 'hobby': 'reading'}
      basic = {'name': full['name'], 'age': full['age']}
      basic
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 여러 키값 접근에서 \`full\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 여러 키값 접근 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: dict_nested
  title: 중첩 딕셔너리
  structuredPrimary: true
  subtitle: 딕셔너리 안의 딕셔너리
  goal: 중첩 딕셔너리에서 \`team\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    딕셔너리의 값으로 다른 딕셔너리를 저장할 수 있습니다. 이를 중첩 딕셔너리라고 합니다. 복잡한 계층 구조의 데이터를 표현할 때 유용합니다. 중첩된 딕셔너리에 접근할 때는 대괄호를 연속으로 사용합니다.

    중첩 딕셔너리는 JSON 데이터 구조와 유사합니다.
  snippet: |-
    team = {
        'user1': {'name': '김개발', 'age': 28},
        'user2': {'name': '이디자인', 'age': 25}
    }
    team['user1']
  exercise:
    prompt: 중첩 딕셔너리 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      team = {
          'user1': {'name': '김개발', 'age': 28},
          'user2': {'name': '이디자인', 'age': 25}
      }
      team['user1']
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 중첩 딕셔너리에서 \`team\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 중첩 딕셔너리 실행 뒤 \`team\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: dict_keys_types
  title: 다양한 키 타입
  structuredPrimary: true
  subtitle: 문자열, 숫자, 튜플
  goal: 문자열·숫자·튜플 세 종류의 immutable 키로 딕셔너리를 만들고 각각 정상 동작하는지 확인합니다.
  why: 딕셔너리 키는 hash 가능한 immutable 타입이어야 합니다. 어떤 타입이 키로 가능한지 손으로 한 번 확인해 두면 list/dict를 잘못 키로 쓰는 흔한 실수를 피할 수 있습니다.
  explanation: |-
    딕셔너리 키는 immutable이고 hash 가능해야 합니다. 가장 흔한 건 문자열이지만, 정수와 튜플도 키가 됩니다. 튜플 키는 (x, y) 좌표나 (year, month) 같은 복합 키에 자주 쓰입니다.
    list, dict, set은 mutable이라 hash가 안 됩니다. 키로 넣으면 TypeError가 납니다. frozenset은 immutable이라 키로 쓸 수 있습니다.
    한 딕셔너리 안에서 여러 종류의 키 타입을 섞어도 됩니다. 단, 같은 값(예: 1과 True)이 같은 해시를 갖는 경우 같은 키로 취급되는 함정이 있습니다.
  tips:
  - "튜플 키 활용 - \`coords = {(0, 0): 'origin', (1, 0): 'right'}\` 같은 좌표 매핑."
  - "1과 True는 같은 키로 취급됩니다. d = {1: 'a', True: 'b'}는 결과적으로 {1: 'b'}가 됩니다."
  snippet: |-
    mixedKeyDict = {
        'name': 'Python',
        2026: 'year',
        ('x', 'y'): 'coordinate',
    }
    {
        'lookupString': mixedKeyDict['name'],
        'lookupInt': mixedKeyDict[2026],
        'lookupTuple': mixedKeyDict[('x', 'y')],
    }
  exercise:
    prompt: list를 키로 넣으면 TypeError가 난다는 점을 try/except로 확인하고, frozenset은 키로 사용 가능한지 함께 검증하세요.
    starterCode: |-
      keyTestDict = {}
      try:
          keyTestDict[[1, 2]] = 'list key'
          listMessage = 'unexpected pass'
      except TypeError as exc:
          listMessage = str(exc)

      keyTestDict[frozenset({1, 2})] = 'frozenset ___'

      {
          'listMessage': listMessage,
          'frozensetValue': keyTestDict[frozenset({1, 2})],
      }
    hints:
    - 빈칸에 들어갈 단어는 ok입니다.
    - frozenset은 immutable이라 키로 쓸 수 있습니다.
    check:
      noError: try/except와 frozenset 할당이 NameError 없이 끝나야 합니다.
      resultCheck: listMessage 안에 'unhashable' 단서가 있고 frozensetValue가 'frozenset ok'여야 합니다.
  check:
    type: noError
    noError: 세 가지 키 타입 딕셔너리 정의가 TypeError 없이 끝나야 합니다.
    resultCheck: lookupString이 'Python', lookupInt가 'year', lookupTuple이 'coordinate'여야 합니다.
- id: workflow_validation
  title: '검증 루프: 주문 레코드 만들고 필수 필드 확인'
  structuredPrimary: true
  subtitle: 딕셔너리를 업무 데이터의 작은 레코드로 사용하기
  goal: '검증 루프: 주문 레코드 만들고 필수 필드 확인에서 예상값과 실제 실행 결과를 비교하는 검증 흐름을 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 딕셔너리는 값을 담는 문법이 아니라, 이름이 붙은 업무 데이터를 표현하는 기본 단위입니다. 주문, 사용자, 설정, API 응답처럼 필드가 있는 데이터를 만들고,
    필요한 키가 없을 때 바로 실패하도록 검증해야 합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    order = {
        'orderId': 'ORD-2026-001',
        'customer': '김고객',
        'item': '키보드',
        'quantity': 2,
        'unitPrice': 80000
    }
    order['totalPrice'] = order['quantity'] * order['unitPrice']
    order['status'] = 'ready'

    assert order['orderId'] == 'ORD-2026-001'
    assert order['totalPrice'] == 160000
    assert 'status' in order
    assert len(order) == 7
  exercise:
    prompt: '검증 루프: 주문 레코드 만들고 필수 필드 확인 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'
    starterCode: |-
      storesByCoord = {
          (37, 127): '서울점',
          (35, 129): '부산점'
      }
      currentCoord = (37, 127)
      storeName = storesByCoord[currentCoord]

      assert storeName == '서울점'
      assert (33, 126) not in storesByCoord
      storeName
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: '검증 루프: 주문 레코드 만들고 필수 필드 확인에서 \`storesByCoord\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'
    resultCheck: '검증 루프: 주문 레코드 만들고 필수 필드 확인에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'
- id: practice
  title: Day 11 종합 복습
  structuredPrimary: true
  subtitle: 딕셔너리 기초 마스터하기
  goal: Day 11 종합 복습에서 \`info\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: Day 11에서 배운 딕셔너리 기초를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로
    어떤 순서로 해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    info = {'name': 'Python', 'year': 1991}
    info
  exercise:
    prompt: Day 11 종합 복습 예제에서 \`info\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      info = {'name': 'Python', 'year': 1991}
      info
    hints:
    - 바꿀 지점은 \`info = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`info\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: Day 11 종합 복습에서 \`info\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: Day 11 종합 복습 실행 뒤 \`info\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
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
  - id: day11-select-fields-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - dict_intro
    - practice
    title: 딕셔너리에서 필요한 필드만 고르기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: key 목록을 따라 새 딕셔너리를 구성한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: select_fields(record, fields)가 fields에 있는 key만 새 딕셔너리로 반환하도록 완성하세요.
      starterCode: |-
        def select_fields(record, fields):
            raise NotImplementedError
      solution: |-
        def select_fields(record, fields):
            return {field: record[field] for field in fields}
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day11.select-fields.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day11.select-fields.mastery.behavior.v1.fixture
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
        entry: select_fields
        cases:
        - id: profile
          arguments:
          - value:
              name: Mina
              age: 21
              city: Seoul
          - value:
            - name
            - city
          expectedReturn:
            name: Mina
            city: Seoul
        - id: score
          arguments:
          - value:
              id: 7
              score: 92
          - value:
            - score
          expectedReturn:
            score: 92
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day11-merge-inventory-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day11-select-fields-mastery
    title: 재고 수정값을 원본에 합치기
    subtitle: 처음 보는 조건에 개념 적용
    goal: 딕셔너리 병합을 재고 갱신 문맥에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: merge_inventory(base, updates)가 원본을 바꾸지 않고 수정값을 반영한 새 딕셔너리를 반환하도록 완성하세요.
      starterCode: |-
        def merge_inventory(base, updates):
            raise NotImplementedError
      solution: |-
        def merge_inventory(base, updates):
            result = base.copy()
            result.update(updates)
            return result
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day11.merge-inventory.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day11.merge-inventory.transfer.behavior.v1.fixture
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
        entry: merge_inventory
        cases:
        - id: replace
          arguments:
          - value:
              pen: 3
              book: 2
          - value:
              pen: 5
          expectedReturn:
            pen: 5
            book: 2
        - id: add
          arguments:
          - value:
              pen: 1
          - value:
              note: 4
          expectedReturn:
            pen: 1
            note: 4
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day11-invert-mapping-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day11-merge-inventory-transfer
    title: key와 value 관계 뒤집기
    subtitle: 7일 뒤 기억에서 재구성
    goal: 딕셔너리 순회를 기억에서 다시 구성한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: invert_mapping(mapping)이 각 value를 key로, 기존 key를 value로 바꾼 딕셔너리를 반환하도록 완성하세요.
      starterCode: |-
        def invert_mapping(mapping):
            raise NotImplementedError
      solution: |-
        def invert_mapping(mapping):
            return {value: key for key, value in mapping.items()}
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day11.invert-mapping.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day11.invert-mapping.retrieval.behavior.v1.fixture
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
        entry: invert_mapping
        cases:
        - id: letters
          arguments:
          - value:
              a: 1
              b: 2
          expectedReturn:
            '1': a
            '2': b
        - id: labels
          arguments:
          - value:
              kr: Korea
              jp: Japan
          expectedReturn:
            Korea: kr
            Japan: jp
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};