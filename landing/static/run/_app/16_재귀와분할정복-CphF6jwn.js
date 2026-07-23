var e=`meta:
  id: '16'
  title: 재귀와 분할정복
  day: 16
  category: advancedPython
  tags:
  - recursion
  - divide and conquer
  - memoization
  - fibonacci
  - 검증
  - 업무분할
  seo:
    title: 파이썬 재귀와 분할정복 - 알고리즘의 기초
    description: 재귀 함수와 분할정복 패턴을 마스터합니다. 메모이제이션, 꼬리 재귀, 반복 변환까지.
    keywords:
    - 재귀
    - 분할정복
    - memoization
    - fibonacci
    - recursion
intro:
  emoji: 🔁
  points:
  - 재귀 함수의 기저 조건과 재귀 조건
  - 메모이제이션으로 중복 계산 제거
  - 분할정복 패턴 이해
  - 재귀를 반복으로 변환
  direction: 재귀와 분할정복에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - 재귀와 분할정복 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 재귀 기초 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: 팩토리얼과 피보나치 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: 메모이제이션 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: 재귀와 분할정복 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 재귀와 분할정복 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: 재귀와 분할정복 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: recursion_basics
  title: 재귀 기초
  structuredPrimary: true
  subtitle: 자기 자신을 호출
  goal: 재귀 기초에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    재귀(recursion)는 함수가 자기 자신을 호출하는 기법입니다. 모든 재귀 함수는 두 가지 요소가 필요합니다. 기저 조건(base case)은 재귀를 멈추는 조건입니다. 재귀 조건(recursive case)은 문제를 더 작은 부분으로 나누어 자신을 호출합니다. 기저 조건이 없으면 무한 재귀에 빠집니다. 파이썬의 기본 재귀 제한은 약 1000입니다. sys.setrecursionlimit()으로 늘릴 수 있지만 권장하지 않습니다.

    재귀가 깊어지면 스택 오버플로가 발생합니다. 반복으로 변환하거나 꼬리 재귀를 고려하세요.
  snippet: |-
    def countdown(n):
        if n <= 0:
            return []
        return [n] + countdown(n - 1)

    countdown(5)
  exercise:
    prompt: 재귀 기초 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def countdown(n):
          if n <= 0:
              return []
          return [n] + countdown(n - 1)

      countdown(5)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 재귀 기초의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 재귀 기초 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: factorial_fibonacci
  title: 팩토리얼과 피보나치
  structuredPrimary: true
  subtitle: 전형적인 재귀 예제
  goal: 팩토리얼과 피보나치에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    팩토리얼(n!)과 피보나치 수열은 재귀의 대표적인 예제입니다. 팩토리얼은 n! = n × (n-1)!이고, 0! = 1입니다. 피보나치는 F(n) = F(n-1) + F(n-2)이고, F(0) = 0, F(1) = 1입니다. 단순 피보나치 재귀는 지수 시간 복잡도 O(2^n)입니다. 같은 값을 여러 번 계산하기 때문입니다. 메모이제이션으로 O(n)으로 최적화할 수 있습니다.

    fib(5) 계산 시 fib(2)가 3번, fib(1)이 5번 호출됩니다.
  snippet: |-
    def factorial(n):
        if n <= 1:
            return 1
        return n * factorial(n - 1)

    factorial(5), factorial(10)
  exercise:
    prompt: 팩토리얼과 피보나치 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def factorial(n):
          if n <= 1:
              return 1
          return n * factorial(n - 1)

      factorial(5), factorial(10)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 팩토리얼과 피보나치의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 팩토리얼과 피보나치 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: memoization
  title: 메모이제이션
  structuredPrimary: true
  subtitle: 결과 캐싱
  goal: 메모이제이션에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    메모이제이션은 이미 계산한 결과를 저장하여 재사용하는 기법입니다. 중복 계산을 제거하여 시간 복잡도를 크게 줄입니다. 딕셔너리로 직접 구현하거나 functools.lru_cache를 사용합니다. lru_cache는 데코레이터로 간편하게 적용할 수 있습니다. 피보나치의 경우 O(2^n)에서 O(n)으로 개선됩니다. 공간은 O(n)을 추가로 사용합니다.

    Python 3.9+에서 @cache는 maxsize=None인 lru_cache의 축약입니다.
  snippet: |-
    def fibMemo(n, cache=None):
        if cache is None:
            cache = {}
        if n in cache:
            return cache[n]
        if n <= 1:
            return n
        cache[n] = fibMemo(n - 1, cache) + fibMemo(n - 2, cache)
        return cache[n]

    fibMemo(50)
  exercise:
    prompt: 메모이제이션 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def fibMemo(n, cache=None):
          if cache is None:
              cache = {}
          if n in cache:
              return cache[n]
          if n <= 1:
              return n
          cache[n] = fibMemo(n - 1, cache) + fibMemo(n - 2, cache)
          return cache[n]

      fibMemo(50)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 메모이제이션의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 메모이제이션 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: divide_conquer
  title: 분할정복
  structuredPrimary: true
  subtitle: 나누고 정복하고 합치기
  goal: 분할정복에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    분할정복(Divide and Conquer)은 문제를 작은 부분으로 나누고, 각각을 해결한 후, 결과를 합치는 패턴입니다. 분할(Divide): 문제를 더 작은 하위 문제로 나눕니다. 정복(Conquer): 하위 문제를 재귀적으로 해결합니다. 결합(Combine): 하위 문제의 해를 합쳐 원래 문제의 해를 구합니다. 병합 정렬, 퀵 정렬, 이진 탐색 등이 분할정복입니다.

    분할정복의 시간 복잡도는 마스터 정리로 분석합니다.
  snippet: |-
    def binarySearch(arr, target, left=0, right=None):
        if right is None:
            right = len(arr) - 1
        if left > right:
            return -1
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] > target:
            return binarySearch(arr, target, left, mid - 1)
        else:
            return binarySearch(arr, target, mid + 1, right)

    binarySearch([1, 3, 5, 7, 9, 11], 7)
  exercise:
    prompt: 분할정복 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def binarySearch(arr, target, left=0, right=None):
          if right is None:
              right = len(arr) - 1
          if left > right:
              return -1
          mid = (left + right) // 2
          if arr[mid] == target:
              return mid
          elif arr[mid] > target:
              return binarySearch(arr, target, left, mid - 1)
          else:
              return binarySearch(arr, target, mid + 1, right)

      binarySearch([1, 3, 5, 7, 9, 11], 7)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 분할정복의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 분할정복 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: tail_recursion
  title: 꼬리 재귀
  structuredPrimary: true
  subtitle: 최적화 개념
  goal: 꼬리 재귀에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    꼬리 재귀(tail recursion)는 재귀 호출이 함수의 마지막 연산인 경우입니다. 일부 언어는 꼬리 재귀를 반복으로 최적화(TCO)하여 스택을 사용하지 않습니다. 그러나 파이썬은 꼬리 재귀 최적화를 지원하지 않습니다. 파이썬에서는 반복으로 변환하거나 누적자(accumulator) 패턴을 사용합니다. 꼬리 재귀 개념을 이해하면 재귀를 반복으로 변환하기 쉽습니다.

    꼬리 재귀 형태로 작성하면 반복으로 변환하기가 훨씬 쉽습니다.
  snippet: |-
    def factorialNormal(n):
        if n <= 1:
            return 1
        return n * factorialNormal(n - 1)

    def factorialTail(n, acc=1):
        if n <= 1:
            return acc
        return factorialTail(n - 1, n * acc)

    factorialNormal(5), factorialTail(5)
  exercise:
    prompt: 꼬리 재귀 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def factorialNormal(n):
          if n <= 1:
              return 1
          return n * factorialNormal(n - 1)

      def factorialTail(n, acc=1):
          if n <= 1:
              return acc
          return factorialTail(n - 1, n * acc)

      factorialNormal(5), factorialTail(5)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 꼬리 재귀의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 꼬리 재귀 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: iteration_conversion
  title: 반복 변환
  structuredPrimary: true
  subtitle: 재귀를 반복으로
  goal: 반복 변환에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    모든 재귀는 반복(루프)으로 변환할 수 있습니다. 반복은 스택 오버플로 위험이 없고 보통 더 빠릅니다. 꼬리 재귀 형태는 while 루프로 직접 변환됩니다. 일반 재귀는 명시적 스택을 사용하여 변환합니다. 트리 순회 같은 복잡한 재귀도 스택으로 변환 가능합니다. 실무에서는 상황에 따라 가독성과 성능을 고려하여 선택합니다.

    성능이 중요하면 반복, 가독성이 중요하면 재귀(+메모이제이션)를 선택하세요.
  snippet: |-
    def factorialIter(n):
        result = 1
        for i in range(2, n + 1):
            result *= i
        return result

    factorialIter(5), factorialIter(10)
  exercise:
    prompt: 반복 변환 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def factorialIter(n):
          result = 1
          for i in range(2, n + 1):
              result *= i
          return result

      factorialIter(5), factorialIter(10)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 반복 변환의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 반복 변환 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 조직 예산과 대사 오류를 재귀로 찾기'
  structuredPrimary: true
  subtitle: 재귀의 기저 사례와 분할정복의 병합 결과를 assert로 확인합니다
  goal: '현업 흐름 검증: 조직 예산과 대사 오류를 재귀로 찾기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    재귀는 피보나치보다 계층 데이터에서 먼저 빛납니다. 조직 예산처럼 같은 구조가 반복되는 데이터를 작은 하위 문제로 나누고, 분할정복으로 대사 오류 위치를 좁히는 흐름을 실행해보세요.

    변주 실험
    부서별 예산 한도를 추가하고, 한도를 넘긴 부서 이름만 재귀로 수집하는 함수를 작성해보세요.
  tips:
  - 변주 실험 부서별 예산 한도를 추가하고, 한도를 넘긴 부서 이름만 재귀로 수집하는 함수를 작성해보세요.
  snippet: |-
    def totalBudget(node):
        if "name" not in node:
            raise KeyError("node must have name")
        ownBudget = node.get("budget", 0)
        children = node.get("children", [])
        return ownBudget + sum(totalBudget(child) for child in children)

    company = {
        "name": "company",
        "budget": 10_000,
        "children": [
            {"name": "platform", "budget": 30_000},
            {
                "name": "growth",
                "budget": 20_000,
                "children": [
                    {"name": "ads", "budget": 5_000},
                    {"name": "content", "budget": 7_000},
                ],
            },
        ],
    }

    assert totalBudget(company) == 72_000
  exercise:
    prompt: '현업 흐름 검증: 조직 예산과 대사 오류를 재귀로 찾기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      def totalBudget(node):
          if "name" not in node:
              raise KeyError("node must have name")
          ownBudget = node.get("budget", 0)
          children = node.get("children", [])
          return ownBudget + sum(totalBudget(child) for child in children)

      company = {
          "name": "company",
          "budget": 10_000,
          "children": [
              {"name": "platform", "budget": 30_000},
              {
                  "name": "growth",
                  "budget": 20_000,
                  "children": [
                      {"name": "ads", "budget": 5_000},
                      {"name": "content", "budget": 7_000},
                  ],
              },
          ],
      }

      assert totalBudget(company) == 72_000
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 조직 예산과 대사 오류를 재귀로 찾기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '현업 흐름 검증: 조직 예산과 대사 오류를 재귀로 찾기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: 재귀와 분할정복 마스터하기
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: Day 16에서 배운 재귀와 분할정복을 난이도별로 복습합니다. 재귀는 함수가 자기 자신을 호출하는 기법으로, 복잡한 문제를 작은 하위 문제로 분해하는 핵심
    패턴입니다. 분할정복은 문제를 분할하고, 각각 해결한 뒤, 결과를 합치는 알고리즘 설계 전략입니다. 🟢 기본 문제로 팩토리얼, 피보나치, 리스트 합계 등 기본 재귀를 익히고,
    🟡 응용 문제로 이진 탐색, 거듭제곱 등 분할정복을 연습하세요. 🔴 심화 문제에서는 하노이 탑, 병합 정렬, 퀵 정렬 등 고급 분할정복 알고리즘을 구현해봅니다. 재귀는 스택 오버플로우와
    메모이제이션을 함께 고려해야 효율적으로 사용할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def factorial(n):
        if n <= 1:
            return 1
        return n * factorial(n - 1)

    factorial(6)
  exercise:
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def factorial(n):
          if n <= 1:
              return 1
          return n * factorial(n - 1)

      factorial(6)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 16_recursion_divide_conquer-budget-tree-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - recursion_basics
    - divide_conquer
    - workflow_validation
    title: 조직 예산 트리를 재귀로 집계하기
    subtitle: recursive tree aggregation
    goal: summarize_budget_tree(node)를 완성해 조직 트리의 총액, 노드 수, 최대 깊이, 부서별 합계를 반환한다.
    why: 재귀를 배운 뒤 실무에서 바로 마주치는 구조는 폴더, 조직, 카테고리처럼 깊이가 입력마다 달라지는 트리입니다. 반복문 한 겹으로는 풀리지 않는 입력을 작게 분해해 다시 합치는 힘을 확인합니다.
    explanation: 각 노드는 name, budget, children을 가질 수 있습니다. 자기 예산과 모든 하위 조직 예산을 더하고, 누락된 name이나 음수 예산은 잘못된 데이터로 거부하세요.
    tips:
    - base case는 children이 없거나 빈 리스트인 노드입니다.
    - 반환해야 하는 전체 total과 부서별 total을 재귀 호출 결과로 합치세요.
    exercise:
      prompt: summarize_budget_tree(node)를 완성해 트리 전체 집계와 부서별 집계를 반환하세요.
      starterCode: |-
        def summarize_budget_tree(node):
            raise NotImplementedError
      solution: |-
        def summarize_budget_tree(node):
            if not isinstance(node, dict) or "name" not in node:
                raise ValueError("node name required")

            rows = []

            def walk(current, depth):
                if "name" not in current:
                    raise ValueError("node name required")
                own_budget = current.get("budget", 0)
                if own_budget < 0:
                    raise ValueError("budget must be non-negative")
                children = current.get("children", [])
                child_totals = [walk(child, depth + 1) for child in children]
                total = own_budget + sum(child_totals)
                rows.append({"name": current["name"], "depth": depth, "total": total})
                return total

            total = walk(node, 0)
            return {
                "root": node["name"],
                "total": total,
                "nodeCount": len(rows),
                "maxDepth": max(row["depth"] for row in rows),
                "totalsByName": {row["name"]: row["total"] for row in rows},
            }
      hints:
      - 재귀 함수 walk가 현재 노드의 total을 반환하게 만들면 부모 노드에서 합치기 쉽습니다.
      - 전체 통계는 재귀 중 누적한 rows에서 다시 만들 수 있습니다.
    check:
      id: python.advanced.recursion-budget.tree.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.recursion-budget.empty.behavior.v1.fixture
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
        entry: summarize_budget_tree
        cases:
        - id: aggregates-nested-department-budgets
          arguments:
          - value:
              name: company
              budget: 100
              children:
              - name: platform
                budget: 40
              - name: growth
                budget: 20
                children:
                - name: ads
                  budget: 5
                - name: content
                  budget: 7
          expectedReturn:
            root: company
            total: 172
            nodeCount: 5
            maxDepth: 2
            totalsByName:
              company: 172
              platform: 40
              growth: 32
              ads: 5
              content: 7
        - id: rejects-node-without-name
          arguments:
          - value:
              budget: 10
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 16_recursion_divide_conquer-nested-numbers-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - recursion_basics
    - memoization
    - iteration_conversion
    title: 중첩 숫자 묶음을 재귀로 요약하기
    subtitle: recursive nested data transfer
    goal: summarize_nested_numbers(value)를 완성해 중첩 리스트 안 숫자의 합계, 잎 개수, 최대 깊이를 반환한다.
    why: 같은 재귀 원리를 조직 트리가 아닌 임의 중첩 데이터에 옮길 수 있어야, 문법 기억이 아니라 구조 사고로 남습니다.
    explanation: 입력은 정수 또는 리스트입니다. 정수는 잎 하나이고, 리스트는 내부 원소 결과를 합친 구조입니다. 그 외 타입은 TypeError로 거부하세요.
    tips:
    - 정수와 리스트를 서로 다른 base case와 recursive case로 나누세요.
    - 빈 리스트의 합계와 잎 개수는 0으로 처리하면 부모 계산이 단순해집니다.
    exercise:
      prompt: summarize_nested_numbers(value)를 완성해 중첩 구조의 합계, 잎 개수, 최대 깊이를 반환하세요.
      starterCode: |-
        def summarize_nested_numbers(value):
            raise NotImplementedError
      solution: |-
        def summarize_nested_numbers(value):
            if isinstance(value, int):
                return {"total": value, "leaves": 1, "maxDepth": 0}
            if isinstance(value, list):
                if not value:
                    return {"total": 0, "leaves": 0, "maxDepth": 1}
                summaries = [summarize_nested_numbers(item) for item in value]
                return {
                    "total": sum(item["total"] for item in summaries),
                    "leaves": sum(item["leaves"] for item in summaries),
                    "maxDepth": 1 + max(item["maxDepth"] for item in summaries),
                }
            raise TypeError("only int or nested list is supported")
      hints:
      - int를 먼저 처리해야 리스트가 아닌 값이 재귀로 내려가지 않습니다.
      - maxDepth는 현재 리스트 깊이 1에 자식의 최대 깊이를 더합니다.
    check:
      id: python.advanced.recursion-budget.nested-numbers.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.recursion-budget.empty.behavior.v1.fixture
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
        entry: summarize_nested_numbers
        cases:
        - id: summarizes-deep-nested-list
          arguments:
          - value:
            - - 1
              - - 2
                - 3
            - - 4
              - - 5
          expectedReturn:
            total: 15
            leaves: 5
            maxDepth: 3
        - id: rejects-string-node
          arguments:
          - value:
            - 1
            - bad
          expectedException: TypeError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 16_recursion_divide_conquer-strategy-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 16_recursion_divide_conquer-nested-numbers-transfer
    title: 재귀, 메모이제이션, 분할정복 선택 기준 회상하기
    subtitle: recursion strategy recall
    goal: choose_recursion_strategy(problem)를 완성해 문제 설명별 적절한 접근과 주의점을 반환한다.
    why: 시간이 지나도 남아야 할 지식은 재귀 코드 모양이 아니라, 어떤 입력 구조에서 재귀가 자연스럽고 어떤 경우 반복이나 메모이제이션이 필요한지 판단하는 기준입니다.
    explanation: tree-aggregate, overlapping-subproblem, sorted-half-search, long-linear-input, stack-depth-risk 목적에 맞는 전략을
      선택하세요.
    tips:
    - 중복 하위 문제가 반복되면 메모이제이션이 필요합니다.
    - 매우 긴 선형 입력은 재귀보다 반복 변환이 안전할 때가 많습니다.
    exercise:
      prompt: choose_recursion_strategy(problem)를 완성해 접근 이름과 이유를 반환하세요.
      starterCode: |-
        def choose_recursion_strategy(problem):
            raise NotImplementedError
      solution: |-
        def choose_recursion_strategy(problem):
            table = {
                "tree-aggregate": {
                    "strategy": "recursion",
                    "why": "the input branches into child nodes with the same shape",
                    "risk": "validate the base case for empty children",
                },
                "overlapping-subproblem": {
                    "strategy": "memoization",
                    "why": "the same subproblem appears many times",
                    "risk": "cache key must include every changing input",
                },
                "sorted-half-search": {
                    "strategy": "divide-and-conquer",
                    "why": "each step can discard half of a sorted range",
                    "risk": "bounds must shrink on every step",
                },
                "long-linear-input": {
                    "strategy": "iteration",
                    "why": "a loop avoids deep call stacks for simple sequences",
                    "risk": "keep the accumulator equivalent to the recursive return",
                },
                "stack-depth-risk": {
                    "strategy": "convert-to-loop",
                    "why": "Python does not optimize tail recursion",
                    "risk": "preserve the same stopping condition",
                },
            }
            if problem not in table:
                raise ValueError("unknown recursion problem")
            return table[problem]
      hints:
      - 재귀가 항상 좋은 선택은 아니며 입력 모양과 호출 깊이를 같이 봐야 합니다.
      - 분할정복은 나눈 문제를 해결하고 다시 합치는 구조입니다.
    check:
      id: python.advanced.recursion-budget.strategy-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.recursion-budget.empty.behavior.v1.fixture
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
        entry: choose_recursion_strategy
        cases:
        - id: recalls-memoization-for-overlap
          arguments:
          - value: overlapping-subproblem
          expectedReturn:
            strategy: memoization
            why: the same subproblem appears many times
            risk: cache key must include every changing input
        - id: recalls-loop-for-long-linear-input
          arguments:
          - value: long-linear-input
          expectedReturn:
            strategy: iteration
            why: a loop avoids deep call stacks for simple sequences
            risk: keep the accumulator equivalent to the recursive return
        - id: rejects-unknown-problem
          arguments:
          - value: magical-recursion
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  schemaVersion: 1
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 행동과 데이터 계약을 검증하고, 외부 package·파일 artifact가 필요한 실행은 lesson Run 및 Local
    evidence로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-existing-assessment
    solutionVerification: required
    independentReview: pending
`;export{e as default};