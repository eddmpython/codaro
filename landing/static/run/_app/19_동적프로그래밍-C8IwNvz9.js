var e=`meta:
  id: '19'
  title: 동적 프로그래밍
  day: 19
  category: advancedPython
  tags:
  - dynamic-programming
  - memoization
  - tabulation
  - dp
  - 검증
  - 최적화
  seo:
    title: 파이썬 동적 프로그래밍 - 메모이제이션과 타뷸레이션
    description: 복잡한 문제를 하위 문제로 분해하고 메모이제이션과 타뷸레이션으로 효율적으로 해결합니다.
    keywords:
    - 동적프로그래밍
    - DP
    - 메모이제이션
    - 타뷸레이션
    - 최적화
intro:
  emoji: 🧩
  points:
  - 'DP의 핵심 개념: 중복 부분문제와 최적 부분구조'
  - 메모이제이션(Top-down)과 타뷸레이션(Bottom-up)
  - 상태 전이 방정식 설계 방법
  - 1D, 2D DP와 공간 최적화 기법
  direction: 동적 프로그래밍에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - 동적 프로그래밍 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 동적 프로그래밍 개념 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: 메모이제이션 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: 타뷸레이션 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: 동적 프로그래밍 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 동적 프로그래밍 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: 동적 프로그래밍 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: dp_intro
  title: 동적 프로그래밍 개념
  structuredPrimary: true
  subtitle: DP의 핵심 원리
  goal: 동적 프로그래밍 개념에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    동적 프로그래밍(DP)은 복잡한 문제를 작은 하위 문제로 나누어 해결하는 알고리즘 기법입니다. 핵심은 중복되는 하위 문제의 결과를 저장하여 재계산을 방지하는 것입니다. DP가 적용되려면 두 가지 조건이 필요합니다. 첫째, 최적 부분구조(Optimal Substructure) - 큰 문제의 최적해가 작은 문제의 최적해로 구성됩니다. 둘째, 중복 부분문제(Overlapping Subproblems) - 같은 하위 문제가 여러 번 계산됩니다.

    재귀 피보나치는 O(2^n), DP 피보나치는 O(n)입니다. 30번째 값도 즉시 계산됩니다.
  snippet: |-
    def fibRecursive(n):
        if n <= 1:
            return n
        return fibRecursive(n - 1) + fibRecursive(n - 2)

    def fibDP(n, memo=None):
        if memo is None:
            memo = {}
        if n in memo:
            return memo[n]
        if n <= 1:
            return n
        memo[n] = fibDP(n - 1, memo) + fibDP(n - 2, memo)
        return memo[n]

    f"DP 피보나치(30): {fibDP(30)}"
  exercise:
    prompt: 동적 프로그래밍 개념 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def fibRecursive(n):
          if n <= 1:
              return n
          return fibRecursive(n - 1) + fibRecursive(n - 2)

      def fibDP(n, memo=None):
          if memo is None:
              memo = {}
          if n in memo:
              return memo[n]
          if n <= 1:
              return n
          memo[n] = fibDP(n - 1, memo) + fibDP(n - 2, memo)
          return memo[n]

      f"DP 피보나치(30): {fibDP(30)}"
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 동적 프로그래밍 개념의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 동적 프로그래밍 개념 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: memoization
  title: 메모이제이션
  structuredPrimary: true
  subtitle: Top-down 방식
  goal: 메모이제이션에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    메모이제이션은 재귀 함수의 결과를 캐시에 저장하여 중복 계산을 방지하는 기법입니다. 위에서 아래로(Top-down) 문제를 해결하며, 필요한 하위 문제만 계산합니다. 파이썬의 functools.lru_cache 데코레이터로 쉽게 구현할 수 있습니다. 딕셔너리를 사용한 수동 구현도 가능합니다.

    lru_cache는 해시 가능한 인자만 캐싱합니다. 리스트는 튜플로 변환하세요.
  snippet: |-
    from functools import lru_cache

    @lru_cache(maxsize=None)
    def fibMemo(n):
        if n <= 1:
            return n
        return fibMemo(n - 1) + fibMemo(n - 2)

    fibMemoResult = [fibMemo(i) for i in range(15)]
    f"피보나치 수열: {fibMemoResult}"
  exercise:
    prompt: 메모이제이션 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from functools import lru_cache

      @lru_cache(maxsize=None)
      def fibMemo(n):
          if n <= 1:
              return n
          return fibMemo(n - 1) + fibMemo(n - 2)

      fibMemoResult = [fibMemo(i) for i in range(15)]
      f"피보나치 수열: {fibMemoResult}"
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: 메모이제이션의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 메모이제이션 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: tabulation
  title: 타뷸레이션
  structuredPrimary: true
  subtitle: Bottom-up 방식
  goal: 타뷸레이션에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    타뷸레이션은 작은 문제부터 차례로 해결하여 테이블을 채워나가는 방식입니다. 아래에서 위로(Bottom-up) 진행하며 반복문을 사용합니다. 재귀 호출 오버헤드가 없어 일반적으로 더 빠릅니다. 모든 하위 문제를 계산하므로 필요 없는 계산이 포함될 수 있습니다.

    이전 상태만 필요하면 전체 테이블 대신 변수 몇 개만 사용하세요.
  snippet: |-
    def fibTable(n):
        if n <= 1:
            return n
        dp = [0] * (n + 1)
        dp[1] = 1
        for i in range(2, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        return dp[n]

    fibTableResult = fibTable(30)
    f"타뷸레이션 피보나치(30): {fibTableResult}"
  exercise:
    prompt: 타뷸레이션 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def fibTable(n):
          if n <= 1:
              return n
          dp = [0] * (n + 1)
          dp[1] = 1
          for i in range(2, n + 1):
              dp[i] = dp[i - 1] + dp[i - 2]
          return dp[n]

      fibTableResult = fibTable(30)
      f"타뷸레이션 피보나치(30): {fibTableResult}"
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 타뷸레이션의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 타뷸레이션 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: classic_problems
  title: 클래식 DP 문제
  structuredPrimary: true
  subtitle: 계단 오르기와 배낭 문제
  goal: 클래식 DP 문제에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    DP의 대표적인 문제들을 살펴봅니다. 계단 오르기는 1칸 또는 2칸씩 오를 때 가능한 경우의 수를 구합니다. 0/1 배낭 문제는 제한된 용량에서 최대 가치를 구합니다. 동전 교환 문제는 최소 동전 개수를 구합니다. 이 문제들은 상태 전이 방정식을 설계하는 좋은 예시입니다.

    배낭 문제는 1차원 DP로 공간 최적화할 수 있습니다. 역순으로 순회하세요.
  snippet: |-
    def climbStairs(n):
        if n <= 2:
            return n
        dp = [0] * (n + 1)
        dp[1] = 1
        dp[2] = 2
        for i in range(3, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        return dp[n]

    stairsResult = climbStairs(10)
    f"10계단 오르기 경우의 수: {stairsResult}"
  exercise:
    prompt: 클래식 DP 문제 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def climbStairs(n):
          if n <= 2:
              return n
          dp = [0] * (n + 1)
          dp[1] = 1
          dp[2] = 2
          for i in range(3, n + 1):
              dp[i] = dp[i - 1] + dp[i - 2]
          return dp[n]

      stairsResult = climbStairs(10)
      f"10계단 오르기 경우의 수: {stairsResult}"
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 클래식 DP 문제의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 클래식 DP 문제 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: string_dp
  title: 문자열 DP
  structuredPrimary: true
  subtitle: LCS와 편집 거리
  goal: 문자열 DP에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    문자열 관련 DP 문제는 2차원 테이블을 사용합니다. LCS(최장 공통 부분수열)는 두 문자열의 공통 부분수열 중 가장 긴 것을 찾습니다. 편집 거리(Levenshtein Distance)는 한 문자열을 다른 문자열로 변환하는 최소 연산 횟수입니다. 두 문제 모두 dp[i][j]로 부분 문자열의 결과를 저장합니다.

    편집 거리는 맞춤법 검사, DNA 서열 비교 등에 활용됩니다.
  snippet: |-
    def lcsLength(s1, s2):
        m, n = len(s1), len(s2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s1[i - 1] == s2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]

    strA = "ABCDGH"
    strB = "AEDFHR"
    lcsResult = lcsLength(strA, strB)
    f"LCS 길이: {lcsResult}"
  exercise:
    prompt: 문자열 DP 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def lcsLength(s1, s2):
          m, n = len(s1), len(s2)
          dp = [[0] * (n + 1) for _ in range(m + 1)]
          for i in range(1, m + 1):
              for j in range(1, n + 1):
                  if s1[i - 1] == s2[j - 1]:
                      dp[i][j] = dp[i - 1][j - 1] + 1
                  else:
                      dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
          return dp[m][n]

      strA = "ABCDGH"
      strB = "AEDFHR"
      lcsResult = lcsLength(strA, strB)
      f"LCS 길이: {lcsResult}"
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 문자열 DP의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 문자열 DP 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: advanced_dp
  title: 고급 DP 패턴
  structuredPrimary: true
  subtitle: LIS와 구간 DP
  goal: 고급 DP 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    최장 증가 부분수열(LIS)은 배열에서 순서를 유지하며 증가하는 가장 긴 부분수열입니다. 이진 탐색으로 O(n log n)에 해결할 수 있습니다. 구간 DP는 구간을 분할하여 최적해를 구하는 패턴입니다. 행렬 체인 곱셈, 버스트 풍선 등이 대표적인 예시입니다.

    구간 DP는 대각선 방향으로 테이블을 채웁니다. 작은 구간부터 큰 구간으로 확장합니다.
  snippet: |-
    def lisLength(nums):
        n = len(nums)
        dp = [1] * n
        for i in range(1, n):
            for j in range(i):
                if nums[j] < nums[i]:
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)

    lisNums = [10, 9, 2, 5, 3, 7, 101, 18]
    lisResult = lisLength(lisNums)
    f"LIS 길이: {lisResult}"
  exercise:
    prompt: 고급 DP 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def lisLength(nums):
          n = len(nums)
          dp = [1] * n
          for i in range(1, n):
              for j in range(i):
                  if nums[j] < nums[i]:
                      dp[i] = max(dp[i], dp[j] + 1)
          return max(dp)

      lisNums = [10, 9, 2, 5, 3, 7, 101, 18]
      lisResult = lisLength(lisNums)
      f"LIS 길이: {lisResult}"
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 고급 DP 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 고급 DP 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 제한된 예산으로 캠페인 조합 고르기'
  structuredPrimary: true
  subtitle: 점화식, 테이블 채우기, 선택 복원을 한 번에 검증합니다
  goal: '현업 흐름 검증: 제한된 예산으로 캠페인 조합 고르기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    동적 프로그래밍은 코딩 테스트 공식이 아니라 제한 조건 아래에서 최선의 조합을 찾는 방식입니다. 캠페인 후보의 비용과 기대 효과를 보고 예산 안에서 최대 효과를 내는 조합을 구해보세요.

    변주 실험
    같은 캠페인을 여러 번 살 수 있는 무한 배낭 문제로 바꾸려면 반복문의 방향이 어떻게 달라지는지 실험하고 결과를 비교하세요.
  tips:
  - 변주 실험 같은 캠페인을 여러 번 살 수 있는 무한 배낭 문제로 바꾸려면 반복문의 방향이 어떻게 달라지는지 실험하고 결과를 비교하세요.
  snippet: |-
    def bestCampaigns(items, budget):
        if budget < 0:
            raise ValueError("budget must be non-negative")

        dp = [[0] * (budget + 1) for _ in range(len(items) + 1)]
        keep = [[False] * (budget + 1) for _ in range(len(items) + 1)]

        for row, item in enumerate(items, start=1):
            for costLimit in range(budget + 1):
                withoutItem = dp[row - 1][costLimit]
                withItem = -1
                if item["cost"] <= costLimit:
                    withItem = dp[row - 1][costLimit - item["cost"]] + item["value"]
                if withItem > withoutItem:
                    dp[row][costLimit] = withItem
                    keep[row][costLimit] = True
                else:
                    dp[row][costLimit] = withoutItem

        selected = []
        remaining = budget
        for row in range(len(items), 0, -1):
            if keep[row][remaining]:
                item = items[row - 1]
                selected.append(item["name"])
                remaining -= item["cost"]

        return dp[-1][budget], list(reversed(selected))

    campaigns = [
        {"name": "email", "cost": 1, "value": 5},
        {"name": "search", "cost": 3, "value": 12},
        {"name": "retargeting", "cost": 4, "value": 14},
        {"name": "content", "cost": 2, "value": 8},
    ]

    bestValue, selected = bestCampaigns(campaigns, budget=5)

    assert bestValue == 20
    assert selected == ["search", "content"]
  exercise:
    prompt: '현업 흐름 검증: 제한된 예산으로 캠페인 조합 고르기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      def bestCampaigns(items, budget):
          if budget < 0:
              raise ValueError("budget must be non-negative")

          dp = [[0] * (budget + 1) for _ in range(len(items) + 1)]
          keep = [[False] * (budget + 1) for _ in range(len(items) + 1)]

          for row, item in enumerate(items, start=1):
              for costLimit in range(budget + 1):
                  withoutItem = dp[row - 1][costLimit]
                  withItem = -1
                  if item["cost"] <= costLimit:
                      withItem = dp[row - 1][costLimit - item["cost"]] + item["value"]
                  if withItem > withoutItem:
                      dp[row][costLimit] = withItem
                      keep[row][costLimit] = True
                  else:
                      dp[row][costLimit] = withoutItem

          selected = []
          remaining = budget
          for row in range(len(items), 0, -1):
              if keep[row][remaining]:
                  item = items[row - 1]
                  selected.append(item["name"])
                  remaining -= item["cost"]

          return dp[-1][budget], list(reversed(selected))

      campaigns = [
          {"name": "email", "cost": 1, "value": 5},
          {"name": "search", "cost": 3, "value": 12},
          {"name": "retargeting", "cost": 4, "value": 14},
          {"name": "content", "cost": 2, "value": 8},
      ]

      bestValue, selected = bestCampaigns(campaigns, budget=5)

      assert bestValue == 20
      assert selected == ["search", "content"]
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: '현업 흐름 검증: 제한된 예산으로 캠페인 조합 고르기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '현업 흐름 검증: 제한된 예산으로 캠페인 조합 고르기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: 동적 프로그래밍 마스터하기
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: Day 19에서 배운 동적 프로그래밍을 난이도별로 복습합니다. DP는 중복되는 하위 문제를 한 번만 계산하고 결과를 저장하여 재사용하는 최적화 기법입니다.
    상향식(bottom-up) 테이블 채우기와 하향식(top-down) 메모이제이션 두 가지 접근법이 있습니다. 🟢 기본 문제로 계단 오르기, 피보나치 DP를 익히고, 🟡 응용 문제로
    최장 증가 부분 수열(LIS), 배낭 문제를 연습하세요. 🔴 심화 문제에서는 2차원 DP, 경로 문제, 문자열 DP 등 코딩 테스트 필수 유형을 다룹니다. DP 문제 해결의 핵심은
    점화식을 세우고 기저 사례를 정의하는 것입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def climbKSteps(n, k):
        dp = [0] * (n + 1)
        dp[0] = 1
        for i in range(1, n + 1):
            for step in range(1, min(k, i) + 1):
                dp[i] += dp[i - step]
        return dp[n]

    ex1Result = climbKSteps(10, 3)
    f"10계단 3칸까지: {ex1Result}"
  exercise:
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def climbKSteps(n, k):
          dp = [0] * (n + 1)
          dp[0] = 1
          for i in range(1, n + 1):
              for step in range(1, min(k, i) + 1):
                  dp[i] += dp[i - step]
          return dp[n]

      ex1Result = climbKSteps(10, 3)
      f"10계단 3칸까지: {ex1Result}"
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 19_dynamic_programming-campaign-budget-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - dp_intro
    - tabulation
    - classic_problems
    - workflow_validation
    title: 제한 예산 안에서 캠페인 조합 고르기
    subtitle: knapsack campaign budget
    goal: plan_campaign_budget(campaigns, budget)를 완성해 예산 안에서 가치가 가장 큰 캠페인 조합과 사용 금액을 반환한다.
    why: DP는 피보나치 암기가 아니라, 선택의 조합이 폭발하는 상황에서 같은 상태를 다시 계산하지 않고 최적 결정을 누적하는 기술입니다.
    explanation: 각 캠페인은 name, cost, value를 가집니다. 각 캠페인은 한 번만 고를 수 있으며, budget이 음수이면 ValueError로 거부하세요.
    tips:
    - 0/1 선택 문제에서는 capacity를 뒤에서 앞으로 순회해야 같은 캠페인을 두 번 쓰지 않습니다.
    - dp[capacity]에 현재 최선의 value와 선택된 이름 목록을 함께 저장하면 설명 가능한 결과가 됩니다.
    exercise:
      prompt: plan_campaign_budget(campaigns, budget)를 완성해 value, selected, spent를 반환하세요.
      starterCode: |-
        def plan_campaign_budget(campaigns, budget):
            raise NotImplementedError
      solution: |-
        def plan_campaign_budget(campaigns, budget):
            if budget < 0:
                raise ValueError("budget must be non-negative")

            dp = [(0, []) for _ in range(budget + 1)]
            costs_by_name = {}
            for campaign in campaigns:
                name = campaign["name"]
                cost = campaign["cost"]
                value = campaign["value"]
                costs_by_name[name] = cost
                for capacity in range(budget, cost - 1, -1):
                    previous_value, previous_names = dp[capacity - cost]
                    candidate = (previous_value + value, previous_names + [name])
                    if candidate[0] > dp[capacity][0]:
                        dp[capacity] = candidate

            best_value, selected = dp[budget]
            return {
                "value": best_value,
                "selected": selected,
                "spent": sum(costs_by_name[name] for name in selected),
            }
      hints:
      - capacity를 앞에서부터 돌면 같은 항목을 여러 번 고르는 unbounded 문제로 바뀝니다.
      - selected 목록을 같이 보관하면 숫자만 맞는 답보다 학습 검증이 강해집니다.
    check:
      id: python.advanced.dp-campaign.budget.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.dp-campaign.empty.behavior.v1.fixture
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
        entry: plan_campaign_budget
        cases:
        - id: chooses-best-value-within-budget
          arguments:
          - value:
            - name: email
              cost: 1
              value: 5
            - name: search
              cost: 3
              value: 12
            - name: retargeting
              cost: 4
              value: 14
            - name: content
              cost: 2
              value: 8
          - value: 5
          expectedReturn:
            value: 20
            selected:
            - search
            - content
            spent: 5
        - id: rejects-negative-budget
          arguments:
          - value: []
          - value: -1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 19_dynamic_programming-grid-cost-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - memoization
    - tabulation
    - advanced_dp
    title: 배송 격자에서 최소 비용 경로 찾기
    subtitle: grid path dynamic programming
    goal: min_delivery_cost(grid)를 완성해 오른쪽과 아래 이동만 허용될 때 최소 비용과 이동 경로를 반환한다.
    why: 예산 조합에서 배운 상태 누적을 격자 문제로 옮기면, DP가 특정 예제의 요령이 아니라 상태 정의의 기술이라는 점이 드러납니다.
    explanation: grid는 양의 비용 숫자로 이루어진 직사각형 2차원 리스트입니다. 빈 입력이나 들쭉날쭉한 행은 ValueError로 거부하세요.
    tips:
    - 각 칸의 최적 비용은 위쪽 또는 왼쪽 칸의 최적 비용 중 작은 값에 현재 비용을 더한 값입니다.
    - 비용과 함께 이동 경로를 저장하면 선택 과정을 검증할 수 있습니다.
    exercise:
      prompt: min_delivery_cost(grid)를 완성해 cost와 moves를 반환하세요.
      starterCode: |-
        def min_delivery_cost(grid):
            raise NotImplementedError
      solution: |-
        def min_delivery_cost(grid):
            if not grid or not grid[0]:
                raise ValueError("grid must not be empty")
            width = len(grid[0])
            if any(len(row) != width for row in grid):
                raise ValueError("grid must be rectangular")

            dp = []
            for row_index, row in enumerate(grid):
                dp_row = []
                for col_index, cost in enumerate(row):
                    if row_index == 0 and col_index == 0:
                        dp_row.append((cost, []))
                    else:
                        options = []
                        if row_index > 0:
                            prev_cost, prev_moves = dp[row_index - 1][col_index]
                            options.append((prev_cost + cost, prev_moves + ["down"]))
                        if col_index > 0:
                            prev_cost, prev_moves = dp_row[col_index - 1]
                            options.append((prev_cost + cost, prev_moves + ["right"]))
                        dp_row.append(min(options, key=lambda item: item[0]))
                dp.append(dp_row)

            best_cost, moves = dp[-1][-1]
            return {"cost": best_cost, "moves": moves}
      hints:
      - 현재 행의 왼쪽 값은 dp_row에서, 위쪽 값은 이전 dp 행에서 읽습니다.
      - tie가 중요한 문제라면 비용이 같을 때의 규칙도 명시해야 합니다.
    check:
      id: python.advanced.dp-campaign.grid-cost.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.dp-campaign.empty.behavior.v1.fixture
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
        entry: min_delivery_cost
        cases:
        - id: finds-lowest-cost-grid-route
          arguments:
          - value:
            - - 1
              - 4
              - 1
            - - 2
              - 1
              - 5
            - - 3
              - 1
              - 1
          expectedReturn:
            cost: 6
            moves:
            - down
            - right
            - down
            - right
        - id: rejects-ragged-grid
          arguments:
          - value:
            - - 1
              - 2
            - - 3
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 19_dynamic_programming-pattern-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 19_dynamic_programming-grid-cost-transfer
    title: DP 패턴 선택 기준 회상하기
    subtitle: dynamic programming pattern recall
    goal: choose_dp_pattern(problem)를 완성해 문제 유형별 상태 저장 방식과 주의점을 반환한다.
    why: 시간이 지나도 남아야 할 DP 지식은 점화식 표기보다, 중복 상태를 어디에 저장하고 어떤 방향으로 채울지 결정하는 판단입니다.
    explanation: overlapping-recursion, bounded-choice, grid-path, rolling-state, substring-match 목적별 패턴을 반환하세요.
    tips:
    - 메모이제이션은 재귀 구조를 유지하고, 타뷸레이션은 작은 상태부터 채웁니다.
    - 이전 행이나 이전 값만 필요하면 rolling array로 메모리를 줄일 수 있습니다.
    exercise:
      prompt: choose_dp_pattern(problem)를 완성해 pattern, state, warning을 반환하세요.
      starterCode: |-
        def choose_dp_pattern(problem):
            raise NotImplementedError
      solution: |-
        def choose_dp_pattern(problem):
            table = {
                "overlapping-recursion": {
                    "pattern": "memoization",
                    "state": "function arguments",
                    "warning": "cache every input that changes the result",
                },
                "bounded-choice": {
                    "pattern": "0-1-knapsack",
                    "state": "item index and capacity",
                    "warning": "iterate capacity backwards for one-time choices",
                },
                "grid-path": {
                    "pattern": "2d-tabulation",
                    "state": "row and column",
                    "warning": "define blocked or missing cells before filling",
                },
                "rolling-state": {
                    "pattern": "rolling-array",
                    "state": "previous row or previous few values",
                    "warning": "do not overwrite values still needed later",
                },
                "substring-match": {
                    "pattern": "string-dp",
                    "state": "prefix lengths",
                    "warning": "empty prefix base cases decide edge behavior",
                },
            }
            if problem not in table:
                raise ValueError("unknown dp problem")
            return table[problem]
      hints:
      - DP 문제는 상태와 전이를 먼저 말로 정의한 뒤 코드로 옮기세요.
      - 저장 방향이 잘못되면 같은 항목을 여러 번 쓰거나 필요한 값을 덮어쓸 수 있습니다.
    check:
      id: python.advanced.dp-campaign.pattern-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.dp-campaign.empty.behavior.v1.fixture
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
        entry: choose_dp_pattern
        cases:
        - id: recalls-knapsack-state-and-direction
          arguments:
          - value: bounded-choice
          expectedReturn:
            pattern: 0-1-knapsack
            state: item index and capacity
            warning: iterate capacity backwards for one-time choices
        - id: recalls-rolling-array-risk
          arguments:
          - value: rolling-state
          expectedReturn:
            pattern: rolling-array
            state: previous row or previous few values
            warning: do not overwrite values still needed later
        - id: rejects-unknown-problem
          arguments:
          - value: magic-table
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