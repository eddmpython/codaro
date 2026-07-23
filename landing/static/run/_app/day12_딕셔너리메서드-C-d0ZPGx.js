var e=`meta:
  id: day12
  title: 딕셔너리메서드
  day: 12
  category: 30days
  tags:
  - 딕셔너리
  - get
  - update
  - items
  - 설정병합
  - 검증
  seo:
    title: 파이썬 딕셔너리 메서드 - 효율적인 데이터 관리
    description: get, keys, values, items, update, pop, popitem, clear 메서드를 배웁니다.
    keywords:
    - 딕셔너리메서드
    - get
    - keys
    - values
    - items
    - update
intro:
  emoji: 🔧
  points:
  - 안전한 값 접근 get()
  - 키, 값, 아이템 순회
  - 딕셔너리 병합과 삭제
  - 실전 데이터 처리
  direction: 딕셔너리메서드에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 딕셔너리메서드 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: get() 메서드 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: keys() 메서드 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: values() 메서드 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 딕셔너리메서드 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 딕셔너리메서드 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 딕셔너리메서드 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: method_get
  title: get() 메서드
  structuredPrimary: true
  subtitle: 안전한 값 접근
  goal: dict[key]와 dict.get(key, default)의 동작 차이를 손으로 비교해 키 부재 안전 패턴을 익힙니다.
  why: 대괄호 접근은 키가 없으면 KeyError로 즉시 멈춥니다. 설정/옵션 처리에서는 누락 시 기본값으로 부드럽게 진행해야 하므로 dict.get이 표준 패턴입니다.
  explanation: |-
    get() 메서드는 대괄호[] 접근의 안전한 대안입니다. 키가 없어도 에러 없이 None을 반환하며, 기본값을 지정할 수도 있습니다. dict.get(key) 또는 dict.get(key, default) 형식으로 사용합니다.

    get()은 설정값이나 옵션 처리에 매우 유용합니다.
  snippet: |-
    config = {'host': 'localhost', 'port': 8080}
    config.get('host')
  exercise:
    prompt: get() 메서드 예제에서 조회 키나 기본값을 바꾸고 존재하지 않는 키를 안전하게 처리하는 결과를 확인하세요.
    starterCode: |-
      config = {'host': 'localhost', 'port': 8080}
      config.get('host')
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: get() 메서드의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: get() 메서드의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: method_keys
  title: keys() 메서드
  structuredPrimary: true
  subtitle: 모든 키 가져오기
  goal: keys() 메서드에서 \`grade\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    keys() 메서드는 딕셔너리의 모든 키를 dict_keys 객체로 반환합니다. list()로 변환하여 리스트로 사용할 수 있습니다. 키만 필요할 때 유용합니다.

    keys()는 딕셔너리 순회나 키 확인에 사용됩니다.
  snippet: |-
    grade = {'math': 85, 'english': 90, 'science': 88}
    grade.keys()
  exercise:
    prompt: keys() 메서드 예제에서 \`grade\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      grade = {'math': 85, 'english': 90, 'science': 88}
      grade.keys()
    hints:
    - 바꿀 지점은 \`grade = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`grade\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: keys() 메서드에서 \`grade\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: keys() 메서드 실행 뒤 \`grade\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: method_values
  title: values() 메서드
  structuredPrimary: true
  subtitle: 모든 값 가져오기
  goal: values() 메서드에서 \`exam\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    values() 메서드는 딕셔너리의 모든 값을 dict_values 객체로 반환합니다. list()로 변환하여 리스트로 사용할 수 있습니다. 값만 필요할 때 유용합니다.

    values()는 값의 존재 확인이나 통계 계산에 유용합니다.
  snippet: |-
    exam = {'math': 85, 'english': 90, 'science': 88}
    exam.values()
  exercise:
    prompt: values() 메서드 예제에서 \`exam\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      exam = {'math': 85, 'english': 90, 'science': 88}
      exam.values()
    hints:
    - 바꿀 지점은 \`exam = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`exam\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: values() 메서드에서 \`exam\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: values() 메서드 실행 뒤 \`exam\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: method_items
  title: items() 메서드
  structuredPrimary: true
  subtitle: 키-값 쌍 가져오기
  goal: items() 메서드에서 \`product\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    items() 메서드는 딕셔너리의 모든 키-값 쌍을 dict_items 객체로 반환합니다. 각 항목은 (키, 값) 튜플 형태입니다. list()로 변환하면 튜플의 리스트가 됩니다.

    items()는 딕셔너리 전체를 순회하거나 변환할 때 사용됩니다.
  snippet: |-
    product = {'name': '노트북', 'price': 1200000, 'stock': 5}
    product.items()
  exercise:
    prompt: items() 메서드 예제에서 \`product\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      product = {'name': '노트북', 'price': 1200000, 'stock': 5}
      product.items()
    hints:
    - 바꿀 지점은 \`product = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`product\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: items() 메서드에서 \`product\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: items() 메서드 실행 뒤 \`product\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: method_update
  title: update() 메서드
  structuredPrimary: true
  subtitle: 딕셔너리 병합
  goal: update() 메서드에서 \`user\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    update() 메서드는 다른 딕셔너리의 키-값 쌍을 현재 딕셔너리에 추가하거나 업데이트합니다. dict1.update(dict2) 형식으로 사용하며, dict2의 내용이 dict1에 병합됩니다. 같은 키가 있으면 값이 덮어씌워집니다.

    update()는 설정 병합이나 데이터 통합에 매우 유용합니다.
  snippet: |-
    user = {'name': '김철수', 'age': 30}
    extra = {'city': '서울', 'job': 'developer'}
    user.update(extra)
    user
  exercise:
    prompt: update() 메서드 예제에서 \`user\`, \`extra\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      user = {'name': '김철수', 'age': 30}
      extra = {'city': '서울', 'job': 'developer'}
      user.update(extra)
      user
    hints:
    - 바꿀 지점은 \`user = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`user\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: update() 메서드에서 \`user\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: update() 메서드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: method_pop
  title: pop() 메서드
  structuredPrimary: true
  subtitle: 키로 값 제거하고 반환
  goal: pop() 메서드에서 \`stock\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    pop() 메서드는 지정한 키의 값을 제거하고 그 값을 반환합니다. dict.pop(key) 형식으로 사용하며, 없는 키를 pop하면 에러가 발생합니다. dict.pop(key, default)로 기본값을 지정할 수 있습니다.

    pop()은 값을 꺼내면서 동시에 제거할 때 유용합니다.
  snippet: |-
    stock = {'laptop': 10, 'mouse': 50, 'keyboard': 30}
    stock.pop('mouse')
  exercise:
    prompt: pop() 메서드 예제에서 \`stock\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      stock = {'laptop': 10, 'mouse': 50, 'keyboard': 30}
      stock.pop('mouse')
    hints:
    - 바꿀 지점은 \`stock = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`stock\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: pop() 메서드에서 \`stock\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: pop() 메서드 실행 뒤 \`stock\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: method_popitem
  title: popitem() 메서드
  structuredPrimary: true
  subtitle: 마지막 키-값 쌍 제거
  goal: popitem() 메서드에서 \`queue\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    popitem() 메서드는 딕셔너리의 마지막 키-값 쌍을 제거하고 (키, 값) 튜플로 반환합니다. dict.popitem() 형식으로 사용하며, 빈 딕셔너리에 사용하면 에러가 발생합니다.

    popitem()은 LIFO(후입선출) 스택 구현에 유용합니다.
  snippet: |-
    queue = {'first': 1, 'second': 2, 'third': 3}
    queue.popitem()
  exercise:
    prompt: popitem() 메서드 예제에서 \`queue\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      queue = {'first': 1, 'second': 2, 'third': 3}
      queue.popitem()
    hints:
    - 바꿀 지점은 \`queue = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`queue\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: popitem() 메서드에서 \`queue\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: popitem() 메서드 실행 뒤 \`queue\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: method_clear
  title: clear() 메서드
  structuredPrimary: true
  subtitle: 모든 항목 제거
  goal: clear() 메서드에서 \`temp\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    clear() 메서드는 딕셔너리의 모든 키-값 쌍을 제거하여 빈 딕셔너리로 만듭니다. dict.clear() 형식으로 사용하며, 반환값은 None입니다. 리스트의 clear()와 동일하게 작동합니다.

    clear()는 원본 딕셔너리를 유지하면서 내용만 비웁니다.
  snippet: |-
    temp = {'a': 1, 'b': 2, 'c': 3}
    temp.clear()
    temp
  exercise:
    prompt: clear() 메서드 예제에서 \`temp\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      temp = {'a': 1, 'b': 2, 'c': 3}
      temp.clear()
      temp
    hints:
    - 바꿀 지점은 \`temp = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`temp\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: clear() 메서드에서 \`temp\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: clear() 메서드 실행 뒤 \`temp\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: method_setdefault
  title: setdefault() 메서드
  structuredPrimary: true
  subtitle: 키가 없으면 추가
  goal: setdefault() 메서드에서 \`cache\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    setdefault() 메서드는 키가 있으면 그 값을 반환하고, 없으면 지정한 기본값으로 키를 추가하고 그 값을 반환합니다. dict.setdefault(key, default) 형식으로 사용합니다.

    setdefault()는 딕셔너리 카운팅이나 그룹화에 매우 유용합니다.
  snippet: |-
    cache = {'name': '김철수', 'age': 30}
    cache.setdefault('name', '이영희')
  exercise:
    prompt: setdefault() 메서드 예제에서 \`cache\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      cache = {'name': '김철수', 'age': 30}
      cache.setdefault('name', '이영희')
    hints:
    - 바꿀 지점은 \`cache = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`cache\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: setdefault() 메서드에서 \`cache\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: setdefault() 메서드 실행 뒤 \`cache\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: method_comparison
  title: 메서드 비교
  structuredPrimary: true
  subtitle: 언제 어떤 메서드를 사용할까?
  goal: 메서드 비교에서 \`setting\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    딕셔너리 메서드는 각각 특정 상황에 최적화되어 있습니다. get()은 안전한 접근, keys/values/items는 순회, update는 병합, pop/popitem/clear는 제거 작업에 사용됩니다.

    상황에 맞는 메서드를 선택하면 코드가 간결해집니다.
  snippet: |-
    setting = {'host': 'localhost', 'port': 8080}
    setting.update({'user': 'admin', 'timeout': 30})
    setting.pop('port')
    setting
  exercise:
    prompt: 메서드 비교 예제에서 \`setting\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      setting = {'host': 'localhost', 'port': 8080}
      setting.update({'user': 'admin', 'timeout': 30})
      setting.pop('port')
      setting
    hints:
    - 바꿀 지점은 \`setting = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`setting\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 메서드 비교에서 \`setting\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 메서드 비교 실행 뒤 \`setting\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: workflow_validation
  title: '검증 루프: 기본 설정과 사용자 설정 병합하기'
  structuredPrimary: true
  subtitle: get, update, pop, items로 안전한 설정 레코드 만들기
  goal: '검증 루프: 기본 설정과 사용자 설정 병합하기에서 예상값과 실제 실행 결과를 비교하는 검증 흐름을 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 딕셔너리 메서드는 설정, 요청 파라미터, 사용자 입력처럼 일부 값이 빠질 수 있는 데이터를 다룰 때 강합니다. 기본값을 안전하게 읽고, 사용자 설정으로 덮어쓰고,
    내부 전용 키를 제거한 뒤 검증하는 흐름을 익혀야 합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    defaultConfig = {'timeout': 30, 'retries': 3, 'debug': False}
    userConfig = {'timeout': 60, 'region': 'kr'}
    finalConfig = {}
    finalConfig.update(defaultConfig)
    finalConfig.update(userConfig)

    timeout = finalConfig.get('timeout', 10)
    retries = finalConfig.get('retries', 1)
    locale = finalConfig.get('locale', 'ko-KR')

    assert timeout == 60
    assert retries == 3
    assert locale == 'ko-KR'
    assert finalConfig['region'] == 'kr'
  exercise:
    prompt: '검증 루프: 기본 설정과 사용자 설정 병합하기 예제에서 설정 키나 값을 바꾸고 병합 결과가 달라지는지 확인하세요.'
    starterCode: |-
      counters = {}
      counters.setdefault('success', 0)
      counters.setdefault('failed', 0)
      counters['success'] = counters['success'] + 1

      assert counters == {'success': 1, 'failed': 0}
      counters
    hints:
    - 바꿀 지점은 기본 설정 dict, 사용자 설정 dict, update 호출 순서입니다.
    - 실행 뒤 최종 설정의 키 우선순위와 병합 결과가 바꾼 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: '검증 루프: 기본 설정과 사용자 설정 병합하기에서 \`counters\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'
    resultCheck: '검증 루프: 기본 설정과 사용자 설정 병합하기에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'
- id: practice
  title: Day 12 종합 복습
  structuredPrimary: true
  subtitle: 딕셔너리 메서드 마스터하기
  goal: Day 12 종합 복습에서 \`cfg\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: Day 12에서 배운 딕셔너리 메서드를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로
    어떤 순서로 해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    cfg = {'host': 'localhost', 'port': 8080}
    cfg.get('user', 'admin')
  exercise:
    prompt: Day 12 종합 복습 예제에서 \`cfg\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      cfg = {'host': 'localhost', 'port': 8080}
      cfg.get('user', 'admin')
    hints:
    - 바꿀 지점은 \`cfg = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`cfg\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: Day 12 종합 복습에서 \`cfg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: Day 12 종합 복습 실행 뒤 \`cfg\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
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
  - id: day12-read-setting-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - method_get
    - practice
    title: 기본값이 있는 설정 읽기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: dict.get으로 누락 key를 안전하게 처리한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: read_setting(settings, key, default)가 key 값 또는 default를 반환하도록 완성하세요.
      starterCode: |-
        def read_setting(settings, key, default):
            raise NotImplementedError
      solution: |-
        def read_setting(settings, key, default):
            return settings.get(key, default)
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day12.read-setting.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day12.read-setting.mastery.behavior.v1.fixture
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
        entry: read_setting
        cases:
        - id: present
          arguments:
          - value:
              theme: dark
          - value: theme
          - value: light
          expectedReturn: dark
        - id: missing
          arguments:
          - value: {}
          - value: theme
          - value: light
          expectedReturn: light
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day12-count-categories-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day12-read-setting-mastery
    title: 항목별 범주 횟수 집계하기
    subtitle: 처음 보는 조건에 개념 적용
    goal: get 누적 패턴을 빈도표에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: count_categories(items)가 각 항목의 등장 횟수를 딕셔너리로 반환하도록 완성하세요.
      starterCode: |-
        def count_categories(items):
            raise NotImplementedError
      solution: |-
        def count_categories(items):
            counts = {}
            for item in items:
                counts[item] = counts.get(item, 0) + 1
            return counts
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day12.count-categories.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day12.count-categories.transfer.behavior.v1.fixture
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
        entry: count_categories
        cases:
        - id: colors
          arguments:
          - value:
            - red
            - blue
            - red
          expectedReturn:
            red: 2
            blue: 1
        - id: single
          arguments:
          - value:
            - python
          expectedReturn:
            python: 1
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day12-pop-copy-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day12-count-categories-transfer
    title: 복사본에서 key 꺼내기
    subtitle: 7일 뒤 기억에서 재구성
    goal: 원본 보존과 pop 반환값을 함께 회상한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: pop_copy(mapping, key)가 [꺼낸 값, 남은 복사본]을 반환하도록 완성하세요.
      starterCode: |-
        def pop_copy(mapping, key):
            raise NotImplementedError
      solution: |-
        def pop_copy(mapping, key):
            remaining = mapping.copy()
            value = remaining.pop(key)
            return [value, remaining]
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day12.pop-copy.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day12.pop-copy.retrieval.behavior.v1.fixture
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
        entry: pop_copy
        cases:
        - id: two
          arguments:
          - value:
              a: 1
              b: 2
          - value: a
          expectedReturn:
          - 1
          - b: 2
        - id: one
          arguments:
          - value:
              done: true
          - value: done
          expectedReturn:
          - true
          - {}
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};