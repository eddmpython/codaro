var e=`meta:
  id: day10
  title: 집합
  day: 10
  category: 30days
  outcomes: ["python.dictsAndSets"]
  prerequisites: ["python.lists"]
  estimatedMinutes: 30
  tags:
  - 집합
  - 중복제거
  - 교집합
  - 차집합
  - 권한관리
  - 검증
  seo:
    title: 파이썬 집합(Set) - 중복 없는 데이터 관리
    description: 집합 자료구조와 합집합, 교집합, 차집합 연산을 배웁니다.
    keywords:
    - 집합
    - set
    - 중복제거
    - 합집합
    - 교집합
    - 차집합
intro:
  emoji: 🎯
  points:
  - 집합으로 중복 없는 데이터 관리
  - add/remove로 요소 추가/삭제
  - 합집합, 교집합, 차집합 연산
  - 수학의 집합 개념을 프로그래밍에
  direction: 집합에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 집합 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 집합이란? 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: 집합 생성하기 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: 중복 제거 특성 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 집합 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 집합 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 집합 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: set_intro
  title: 집합이란?
  structuredPrimary: true
  subtitle: 중복 없고 순서 없는 자료구조
  goal: 집합이란?에서 \`nums\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    집합(Set)은 중복을 허용하지 않고 순서가 없는 자료구조입니다. 중괄호 {}로 만들고, 쉼표로 값을 구분합니다. 같은 값을 여러 번 넣어도 하나만 저장됩니다. 인덱스가 없어서 특정 위치의 요소에 접근할 수 없습니다. 수학의 집합 개념과 동일하며, 집합 연산을 지원합니다.

    빈 집합은 {}가 아닌 set()으로 만듭니다. {}는 빈 딕셔너리입니다.
  snippet: |-
    nums = {1, 2, 3, 4, 5}
    nums
  exercise:
    prompt: 집합이란? 예제에서 \`nums\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      nums = {1, 2, 3, 4, 5}
      nums
    hints:
    - 바꿀 지점은 \`nums = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`nums\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 집합이란?에서 \`nums\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 집합이란? 실행 뒤 \`nums\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: set_create
  title: 집합 생성하기
  structuredPrimary: true
  subtitle: 다양한 방법으로 만들기
  goal: 집합 생성하기에서 \`direct\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    집합은 중괄호로 직접 만들거나 set() 함수를 사용합니다. set() 함수에 리스트, 튜플, 문자열을 넣으면 집합으로 변환됩니다. 빈 집합은 반드시 set()으로 만들어야 합니다. {}는 빈 딕셔너리를 만듭니다.

    set('hello')는 {'h', 'e', 'l', 'o'}가 됩니다. 'l'이 하나만 남습니다.
  snippet: |-
    direct = {1, 2, 3, 4, 5}
    direct
  exercise:
    prompt: 집합 생성하기 예제에서 \`direct\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      direct = {1, 2, 3, 4, 5}
      direct
    hints:
    - 바꿀 지점은 \`direct = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`direct\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 집합 생성하기에서 \`direct\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 집합 생성하기 실행 뒤 \`direct\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: set_unique
  title: 중복 제거 특성
  structuredPrimary: true
  subtitle: 자동으로 중복 삭제
  goal: 중복 제거 특성에서 \`dups\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    집합의 가장 큰 특징은 중복을 자동으로 제거한다는 것입니다. 같은 값을 여러 번 넣어도 하나만 유지됩니다. 이 특성을 이용하면 리스트의 중복을 쉽게 제거할 수 있습니다. 리스트를 집합으로 변환했다가 다시 리스트로 바꾸면 중복이 제거됩니다.

    집합은 순서를 보장하지 않으므로 정렬이 필요하면 sorted()를 사용하세요.
  snippet: |-
    dups = {1, 2, 2, 3, 3, 3, 4}
    dups
  exercise:
    prompt: 중복 제거 특성 예제에서 \`dups\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      dups = {1, 2, 2, 3, 3, 3, 4}
      dups
    hints:
    - 바꿀 지점은 \`dups = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`dups\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 중복 제거 특성에서 \`dups\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 중복 제거 특성 실행 뒤 \`dups\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: add_method
  title: add() 메서드
  structuredPrimary: true
  subtitle: 집합에 요소 추가
  goal: add() 메서드에서 \`fruits\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    add() 메서드는 집합에 새로운 요소를 추가합니다. 이미 있는 값을 추가하려고 해도 에러가 발생하지 않고 무시됩니다. 중복을 허용하지 않기 때문입니다. 원본 집합이 직접 변경됩니다.

    이미 있는 값을 add()해도 에러 없이 무시됩니다.
  snippet: |-
    fruits = {'사과', '바나나'}
    fruits.add('오렌지')
    fruits.add('사과')
    fruits
  exercise:
    prompt: add() 메서드 예제에서 \`fruits\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      fruits = {'사과', '바나나'}
      fruits.add('오렌지')
      fruits.add('사과')
      fruits
    hints:
    - 바꿀 지점은 \`fruits = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`fruits\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: add() 메서드에서 \`fruits\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: add() 메서드 실행 뒤 \`fruits\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: remove_discard
  title: remove()와 discard()
  structuredPrimary: true
  subtitle: 집합에서 요소 삭제
  goal: remove()와 discard()에서 \`nums\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    remove()와 discard() 모두 집합에서 요소를 삭제합니다. 차이점은 remove()는 없는 값을 삭제하려 하면 에러가 발생하지만, discard()는 에러 없이 무시한다는 것입니다. 안전하게 삭제하려면 discard()를 사용하는 것이 좋습니다.

    존재 여부가 불확실하면 discard()를 사용하세요.
  snippet: |-
    nums = {1, 2, 3, 4, 5}
    nums.remove(3)
    nums
  exercise:
    prompt: remove()와 discard() 예제에서 \`nums\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      nums = {1, 2, 3, 4, 5}
      nums.remove(3)
      nums
    hints:
    - 바꿀 지점은 \`nums = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`nums\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: remove()와 discard()에서 \`nums\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: remove()와 discard() 실행 뒤 \`nums\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: clear_method
  title: clear() 메서드
  structuredPrimary: true
  subtitle: 모든 요소 삭제
  goal: clear() 메서드에서 \`items\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    clear() 메서드는 집합의 모든 요소를 삭제하여 빈 집합으로 만듭니다. 리스트와 동일하게 작동합니다. 집합을 재사용할 때 유용합니다.

    clear() 후에는 빈 집합 set()이 됩니다.
  snippet: |-
    items = {1, 2, 3, 4, 5}
    items.clear()
    items
  exercise:
    prompt: clear() 메서드 예제에서 \`items\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      items = {1, 2, 3, 4, 5}
      items.clear()
      items
    hints:
    - 바꿀 지점은 \`items = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`items\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: clear() 메서드에서 \`items\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: clear() 메서드 실행 뒤 \`items\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: union_method
  title: 합집합 (union)
  structuredPrimary: true
  subtitle: 두 집합을 합치기
  goal: 합집합 (union)에서 \`setA\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    합집합은 두 집합의 모든 요소를 포함하는 새 집합을 만듭니다. union() 메서드나 | 연산자를 사용합니다. 중복된 요소는 하나만 포함됩니다. 원본 집합은 변경되지 않고 새로운 집합이 생성됩니다.

    합집합은 A ∪ B를 의미하며, 모든 요소를 포함합니다.
  snippet: |-
    setA = {1, 2, 3}
    setB = {3, 4, 5}
    setA.union(setB)
  exercise:
    prompt: 합집합 (union) 예제에서 \`setA\`, \`setB\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      setA = {1, 2, 3}
      setB = {3, 4, 5}
      setA.union(setB)
    hints:
    - 바꿀 지점은 \`setA = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`setA\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 합집합 (union)에서 \`setA\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 합집합 (union) 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: intersection_method
  title: 교집합 (intersection)
  structuredPrimary: true
  subtitle: 공통 요소만 추출
  goal: 교집합 (intersection)에서 \`setA\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    교집합은 두 집합에 모두 있는 요소만 포함하는 새 집합을 만듭니다. intersection() 메서드나 & 연산자를 사용합니다. 두 집합의 공통 부분을 찾을 때 유용합니다. 원본 집합은 변경되지 않습니다.

    교집합은 A ∩ B를 의미하며, 공통 요소만 포함합니다.
  snippet: |-
    setA = {1, 2, 3, 4}
    setB = {3, 4, 5, 6}
    setA.intersection(setB)
  exercise:
    prompt: 교집합 (intersection) 예제에서 \`setA\`, \`setB\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      setA = {1, 2, 3, 4}
      setB = {3, 4, 5, 6}
      setA.intersection(setB)
    hints:
    - 바꿀 지점은 \`setA = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`setA\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 교집합 (intersection)에서 \`setA\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 교집합 (intersection) 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: difference_method
  title: 차집합 (difference)
  structuredPrimary: true
  subtitle: 한쪽에만 있는 요소
  goal: 차집합 (difference)에서 \`setA\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    차집합은 첫 번째 집합에만 있고 두 번째 집합에는 없는 요소들을 포함하는 새 집합을 만듭니다. difference() 메서드나 - 연산자를 사용합니다. 순서가 중요하므로 A - B와 B - A는 다릅니다.

    차집합은 A - B를 의미하며, A에만 있는 요소입니다.
  snippet: |-
    setA = {1, 2, 3, 4, 5}
    setB = {4, 5, 6, 7}
    setA.difference(setB)
  exercise:
    prompt: 차집합 (difference) 예제에서 \`setA\`, \`setB\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      setA = {1, 2, 3, 4, 5}
      setB = {4, 5, 6, 7}
      setA.difference(setB)
    hints:
    - 바꿀 지점은 \`setA = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`setA\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 차집합 (difference)에서 \`setA\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 차집합 (difference) 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: symmetric_difference
  title: 대칭차집합 (symmetric_difference)
  structuredPrimary: true
  subtitle: 한쪽에만 있는 모든 요소
  goal: 대칭차집합 (symmetricdifference)에서 \`setA\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    대칭차집합은 두 집합 중 한쪽에만 있는 요소들을 모두 포함하는 새 집합을 만듭니다. symmetric_difference() 메서드나 ^ 연산자를 사용합니다. 교집합을 제외한 나머지 모든 요소입니다. (A - B) ∪ (B - A)와 같습니다.

    대칭차집합은 A △ B를 의미하며, 공통 부분을 제외한 모든 요소입니다.
  snippet: |-
    setA = {1, 2, 3, 4}
    setB = {3, 4, 5, 6}
    setA.symmetric_difference(setB)
  exercise:
    prompt: 대칭차집합 (symmetricdifference) 예제에서 \`setA\`, \`setB\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      setA = {1, 2, 3, 4}
      setB = {3, 4, 5, 6}
      setA.symmetric_difference(setB)
    hints:
    - 바꿀 지점은 \`setA = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`setA\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 대칭차집합 (symmetricdifference)에서 \`setA\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 대칭차집합 (symmetricdifference) 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: membership_method
  title: in/not in 연산자
  structuredPrimary: true
  subtitle: 요소 포함 확인
  goal: in/not in 연산자에서 \`colors\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    in과 not in 연산자로 집합에 특정 값이 있는지 확인할 수 있습니다. 집합은 해시 테이블로 구현되어 있어 리스트보다 훨씬 빠르게 검색됩니다. 대량의 데이터에서 값을 찾을 때 집합을 사용하면 성능이 향상됩니다.

    집합의 in 연산은 O(1) 시간복잡도로 매우 빠릅니다.
  snippet: |-
    colors = {'빨강', '초록', '파랑'}
    '초록' in colors
  exercise:
    prompt: in/not in 연산자 예제에서 \`colors\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      colors = {'빨강', '초록', '파랑'}
      '초록' in colors
    hints:
    - 바꿀 지점은 \`colors = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`colors\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: in/not in 연산자에서 \`colors\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: in/not in 연산자 실행 뒤 \`colors\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: set_length
  title: 집합 길이
  structuredPrimary: true
  subtitle: len() 함수
  goal: 집합 길이에서 \`sample\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    len() 함수는 집합의 요소 개수를 반환합니다. 리스트, 튜플과 동일하게 작동합니다. 중복이 제거된 후의 개수를 셉니다.

    set([1,2,2,3])의 길이는 3입니다. 중복이 제거되기 때문입니다.
  snippet: |-
    sample = {1, 2, 3, 4, 5}
    len(sample)
  exercise:
    prompt: 집합 길이 예제에서 \`sample\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      sample = {1, 2, 3, 4, 5}
      len(sample)
    hints:
    - 바꿀 지점은 \`sample = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`sample\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 집합 길이에서 \`sample\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 집합 길이 실행 뒤 \`sample\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: workflow_validation
  title: '검증 루프: 권한과 참석자 집합 비교하기'
  structuredPrimary: true
  subtitle: 중복 제거와 집합 연산을 운영 점검에 사용
  goal: '검증 루프: 권한과 참석자 집합 비교하기에서 예상값과 실제 실행 결과를 비교하는 검증 흐름을 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 집합은 중복을 지우는 도구를 넘어, 두 목록의 공통점과 차이를 빠르게 비교하는 도구입니다. 권한 관리, 참석자 확인, 캠페인 대상 선별처럼 실제 업무에서 '누가
    포함되고 빠졌는지'를 검증할 때 특히 유용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    approvedUsers = {'kim', 'lee', 'park', 'choi'}
    accessLog = ['kim', 'kim', 'lee', 'guest', 'park', 'guest']
    actualUsers = set(accessLog)

    validAccess = approvedUsers & actualUsers
    unauthorizedUsers = actualUsers - approvedUsers
    unusedApprovals = approvedUsers - actualUsers

    assert validAccess == {'kim', 'lee', 'park'}
    assert unauthorizedUsers == {'guest'}
    assert unusedApprovals == {'choi'}
    assert len(actualUsers) == 4
  exercise:
    prompt: '검증 루프: 권한과 참석자 집합 비교하기 예제에서 기대 문자열이나 실제 출력 문구를 바꾸고 assert 비교가 맞는지 확인하세요.'
    starterCode: |-
      dayOne = {'A', 'B', 'C', 'D'}
      dayTwo = {'B', 'D', 'E'}
      dayThree = {'C', 'D', 'F'}
      repeatAttendees = (dayOne & dayTwo) | (dayTwo & dayThree) | (dayOne & dayThree)

      assert repeatAttendees == {'B', 'C', 'D'}
      assert 'A' not in repeatAttendees
      repeatAttendees
    hints:
    - 바꿀 지점은 expected 값과 실제 print()/계산 호출입니다.
    - 실행 뒤 기대값과 실제 결과가 같을 때만 검증이 통과하는지 보세요.
  check:
    type: noError
    noError: '검증 루프: 권한과 참석자 집합 비교하기에서 \`dayOne\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'
    resultCheck: '검증 루프: 권한과 참석자 집합 비교하기에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'
- id: practice
  title: Day 10 종합 복습
  structuredPrimary: true
  subtitle: 집합 마스터하기
  goal: Day 10 종합 복습에서 \`nums\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: Day 10에서 배운 집합을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로
    해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    monday = {'철수', '영희', '민수'}
    monday
  exercise:
    prompt: Day 10 종합 복습 예제에서 \`nums\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      nums = {1, 2, 3, 4, 5}
      nums
    hints:
    - 바꿀 지점은 \`nums = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`nums\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: Day 10 종합 복습에서 \`nums\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: Day 10 종합 복습 실행 뒤 \`nums\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
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
  - id: day10-common-tags-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - set_intro
    - practice
    title: 두 태그 집합의 공통값 찾기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: 교집합을 정렬된 결과로 바꿔 안정적으로 반환한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: common_tags(left, right)가 공통 항목을 정렬한 목록으로 반환하도록 완성하세요.
      starterCode: |-
        def common_tags(left, right):
            raise NotImplementedError
      solution: |-
        def common_tags(left, right):
            return sorted(set(left) & set(right))
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day10.common-tags.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day10.common-tags.mastery.behavior.v1.fixture
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
        entry: common_tags
        cases:
        - id: overlap
          arguments:
          - value:
            - python
            - web
          - value:
            - web
            - data
          expectedReturn:
          - web
        - id: many
          arguments:
          - value:
            - 3
            - 1
            - 2
          - value:
            - 2
            - 3
            - 4
          expectedReturn:
          - 2
          - 3
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day10-unique-count-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day10-common-tags-mastery
    title: 중복 응답 수를 고유 개수로 바꾸기
    subtitle: 처음 보는 조건에 개념 적용
    goal: 집합의 중복 제거 성질을 집계 문제에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: unique_count(items)가 중복을 제외한 항목 개수를 반환하도록 완성하세요.
      starterCode: |-
        def unique_count(items):
            raise NotImplementedError
      solution: |-
        def unique_count(items):
            return len(set(items))
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day10.unique-count.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day10.unique-count.transfer.behavior.v1.fixture
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
        entry: unique_count
        cases:
        - id: numbers
          arguments:
          - value:
            - 1
            - 1
            - 2
            - 3
            - 3
          expectedReturn: 3
        - id: words
          arguments:
          - value:
            - a
            - b
            - a
          expectedReturn: 2
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day10-only-left-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day10-unique-count-transfer
    title: 왼쪽 집합에만 있는 값 찾기
    subtitle: 7일 뒤 기억에서 재구성
    goal: 차집합 연산을 기억에서 다시 구성한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: only_left(left, right)가 left에만 있는 항목을 정렬한 목록으로 반환하도록 완성하세요.
      starterCode: |-
        def only_left(left, right):
            raise NotImplementedError
      solution: |-
        def only_left(left, right):
            return sorted(set(left) - set(right))
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day10.only-left.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day10.only-left.retrieval.behavior.v1.fixture
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
        entry: only_left
        cases:
        - id: numbers
          arguments:
          - value:
            - 1
            - 2
            - 3
          - value:
            - 2
            - 4
          expectedReturn:
          - 1
          - 3
        - id: words
          arguments:
          - value:
            - red
            - blue
          - value:
            - blue
          expectedReturn:
          - red
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};