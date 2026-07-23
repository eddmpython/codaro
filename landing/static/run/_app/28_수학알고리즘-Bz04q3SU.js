var e=`meta:\r
  id: '28'\r
  title: 수학 알고리즘\r
  day: 28\r
  category: advancedPython\r
  tags:\r
  - 수학\r
  - 알고리즘\r
  - 정수론\r
  - 행렬\r
  - 검증\r
  - 수치검증\r
  seo:\r
    title: 파이썬 수학 알고리즘\r
    description: 소수, GCD, 조합론, 행렬 연산 학습\r
    keywords:\r
    - 수학\r
    - 소수\r
    - GCD\r
    - 조합론\r
intro:\r
  emoji: 🔢\r
  points:\r
  - 소수 관련 알고리즘\r
  - 정수론 기초\r
  - 조합론과 확률\r
  - 행렬 연산\r
  direction: 수학 알고리즘에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 수학 알고리즘 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 소수 알고리즘 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: GCD와 LCM 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 조합론 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 수학 알고리즘 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 수학 알고리즘 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 수학 알고리즘 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: prime\r
  title: 소수 알고리즘\r
  structuredPrimary: true\r
  subtitle: 소수 판별과 생성\r
  goal: 소수 알고리즘에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 소수 판별은 √n까지만 확인하면 됩니다. 에라토스테네스의 체로 범위 내 모든 소수를 구합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def isPrime(n):\r
        if n < 2:\r
            return False\r
        if n == 2:\r
            return True\r
        if n % 2 == 0:\r
            return False\r
        for i in range(3, int(n ** 0.5) + 1, 2):\r
            if n % i == 0:\r
                return False\r
        return True\r
\r
    primeCheck = [isPrime(n) for n in [1, 2, 17, 20, 97]]\r
    primeResult = primeCheck\r
    primeResult\r
  exercise:\r
    prompt: 소수 알고리즘 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def isPrime(n):\r
          if n < 2:\r
              return False\r
          if n == 2:\r
              return True\r
          if n % 2 == 0:\r
              return False\r
          for i in range(3, int(n ** 0.5) + 1, 2):\r
              if n % i == 0:\r
                  return False\r
          return True\r
\r
      primeCheck = [isPrime(n) for n in [1, 2, 17, 20, 97]]\r
      primeResult = primeCheck\r
      primeResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 소수 알고리즘의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 소수 알고리즘 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: gcd_lcm\r
  title: GCD와 LCM\r
  structuredPrimary: true\r
  subtitle: 유클리드 알고리즘\r
  goal: GCD와 LCM에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: '유클리드 알고리즘: gcd(a, b) = gcd(b, a % b), b가 0이면 a 반환.'\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def gcd(a, b):\r
        while b:\r
            a, b = b, a % b\r
        return a\r
\r
    def lcm(a, b):\r
        return a * b // gcd(a, b)\r
\r
    gcdVal = gcd(48, 18)\r
    lcmVal = lcm(12, 18)\r
    glResult = (gcdVal, lcmVal)\r
    glResult\r
  exercise:\r
    prompt: GCD와 LCM 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def gcd(a, b):\r
          while b:\r
              a, b = b, a % b\r
          return a\r
\r
      def lcm(a, b):\r
          return a * b // gcd(a, b)\r
\r
      gcdVal = gcd(48, 18)\r
      lcmVal = lcm(12, 18)\r
      glResult = (gcdVal, lcmVal)\r
      glResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: GCD와 LCM의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: GCD와 LCM 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: combinatorics\r
  title: 조합론\r
  structuredPrimary: true\r
  subtitle: 순열, 조합, 이항계수\r
  goal: 조합론에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: nPr = n!/(n-r)!, nCr = n!/r!(n-r)!\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def factorial(n):\r
        if n <= 1:\r
            return 1\r
        result = 1\r
        for i in range(2, n + 1):\r
            result *= i\r
        return result\r
\r
    def perm(n, r):\r
        return factorial(n) // factorial(n - r)\r
\r
    def comb(n, r):\r
        return factorial(n) // (factorial(r) * factorial(n - r))\r
\r
    factVal = factorial(10)\r
    permVal = perm(5, 3)\r
    combVal = comb(10, 3)\r
    combResult = (factVal, permVal, combVal)\r
    combResult\r
  exercise:\r
    prompt: 조합론 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def factorial(n):\r
          if n <= 1:\r
              return 1\r
          result = 1\r
          for i in range(2, n + 1):\r
              result *= i\r
          return result\r
\r
      def perm(n, r):\r
          return factorial(n) // factorial(n - r)\r
\r
      def comb(n, r):\r
          return factorial(n) // (factorial(r) * factorial(n - r))\r
\r
      factVal = factorial(10)\r
      permVal = perm(5, 3)\r
      combVal = comb(10, 3)\r
      combResult = (factVal, permVal, combVal)\r
      combResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 조합론의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 조합론 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: modular\r
  title: 모듈러 연산\r
  structuredPrimary: true\r
  subtitle: 빠른 거듭제곱\r
  goal: 모듈러 연산에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 큰 수의 거듭제곱을 효율적으로 계산. O(log n).\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def modPow(base, exp, mod):\r
        result = 1\r
        base = base % mod\r
        while exp > 0:\r
            if exp % 2 == 1:\r
                result = (result * base) % mod\r
            exp = exp >> 1\r
            base = (base * base) % mod\r
        return result\r
\r
    MOD = 1000000007\r
    mpResult = modPow(2, 100, MOD)\r
    mpResult\r
  exercise:\r
    prompt: 모듈러 연산 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def modPow(base, exp, mod):\r
          result = 1\r
          base = base % mod\r
          while exp > 0:\r
              if exp % 2 == 1:\r
                  result = (result * base) % mod\r
              exp = exp >> 1\r
              base = (base * base) % mod\r
          return result\r
\r
      MOD = 1000000007\r
      mpResult = modPow(2, 100, MOD)\r
      mpResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 모듈러 연산의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 모듈러 연산 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: matrix\r
  title: 행렬 연산\r
  structuredPrimary: true\r
  subtitle: 행렬 곱셈과 거듭제곱\r
  goal: 행렬 연산에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 행렬 거듭제곱으로 피보나치를 O(log n)에 계산합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def matMul(a, b):\r
        rows = len(a)\r
        cols = len(b[0])\r
        inner = len(b)\r
        result = [[0] * cols for _ in range(rows)]\r
        for i in range(rows):\r
            for j in range(cols):\r
                for k in range(inner):\r
                    result[i][j] += a[i][k] * b[k][j]\r
        return result\r
\r
    matA = [[1, 2], [3, 4]]\r
    matB = [[5, 6], [7, 8]]\r
    matMulResult = matMul(matA, matB)\r
    matMulResult\r
  exercise:\r
    prompt: 행렬 연산 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def matMul(a, b):\r
          rows = len(a)\r
          cols = len(b[0])\r
          inner = len(b)\r
          result = [[0] * cols for _ in range(rows)]\r
          for i in range(rows):\r
              for j in range(cols):\r
                  for k in range(inner):\r
                      result[i][j] += a[i][k] * b[k][j]\r
          return result\r
\r
      matA = [[1, 2], [3, 4]]\r
      matB = [[5, 6], [7, 8]]\r
      matMulResult = matMul(matA, matB)\r
      matMulResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 행렬 연산의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 행렬 연산 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: geometry\r
  title: 기하학 기초\r
  structuredPrimary: true\r
  subtitle: 거리와 넓이\r
  goal: 기하학 기초에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 좌표 기하의 기본 연산들.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import math\r
\r
    def dist(p1, p2):\r
        return math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2)\r
\r
    def triArea(p1, p2, p3):\r
        return abs((p1[0] * (p2[1] - p3[1]) + p2[0] * (p3[1] - p1[1]) + p3[0] * (p1[1] - p2[1])) / 2)\r
\r
    distVal = dist((0, 0), (3, 4))\r
    triVal = triArea((0, 0), (4, 0), (2, 3))\r
    geoResult = (distVal, triVal)\r
    geoResult\r
  exercise:\r
    prompt: 기하학 기초 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import math\r
\r
      def dist(p1, p2):\r
          return math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2)\r
\r
      def triArea(p1, p2, p3):\r
          return abs((p1[0] * (p2[1] - p3[1]) + p2[0] * (p3[1] - p1[1]) + p3[0] * (p1[1] - p2[1])) / 2)\r
\r
      distVal = dist((0, 0), (3, 4))\r
      triVal = triArea((0, 0), (4, 0), (2, 3))\r
      geoResult = (distVal, triVal)\r
      geoResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기하학 기초의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 기하학 기초 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 배치 주기와 체크섬 계산'\r
  structuredPrimary: true\r
  subtitle: GCD/LCM, 빠른 거듭제곱, 입력 검증을 운영 계산에 적용합니다\r
  goal: '현업 흐름 검증: 배치 주기와 체크섬 계산에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    수학 알고리즘은 추상 문제가 아니라 운영 주기, 체크섬, 샤딩 같은 계산에 바로 쓰입니다. 정수론 함수가 경계값에서 틀리지 않는지 표준 함수와 비교하며 검증하세요.\r
\r
    변주 실험\r
    배치 주기가 하루 24시간을 넘으면 경고를 내도록 함수를 확장하고, \`[8, 9, 10]\` 같은 입력에서 경고가 필요한지 검증하세요.\r
  tips:\r
  - 변주 실험 배치 주기가 하루 24시간을 넘으면 경고를 내도록 함수를 확장하고, \`[8, 9, 10]\` 같은 입력에서 경고가 필요한지 검증하세요.\r
  snippet: |-\r
    from math import gcd\r
    from functools import reduce\r
\r
    def lcm(a, b):\r
        if a <= 0 or b <= 0:\r
            raise ValueError("period must be positive")\r
        return a * b // gcd(a, b)\r
\r
    def lcmMany(periods):\r
        return reduce(lcm, periods)\r
\r
    periods = [6, 10, 15]\r
\r
    assert lcmMany(periods) == 30\r
    assert [30 % period for period in periods] == [0, 0, 0]\r
  exercise:\r
    prompt: '현업 흐름 검증: 배치 주기와 체크섬 계산 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      from math import gcd\r
      from functools import reduce\r
\r
      def lcm(a, b):\r
          if a <= 0 or b <= 0:\r
              raise ValueError("period must be positive")\r
          return a * b // gcd(a, b)\r
\r
      def lcmMany(periods):\r
          return reduce(lcm, periods)\r
\r
      periods = [6, 10, 15]\r
\r
      assert lcmMany(periods) == 30\r
      assert [30 % period for period in periods] == [0, 0, 0]\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 배치 주기와 체크섬 계산의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 배치 주기와 체크섬 계산 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 연습\r
  structuredPrimary: true\r
  subtitle: 수학 알고리즘 실습\r
  goal: 종합 연습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Day 28에서 배운 수학 알고리즘을 난이도별로 복습합니다. GCD, 소수 판별, 에라토스테네스의 체는 정수론의 기초이며, 모듈러 연산과 빠른 거듭제곱은 암호학의\r
    기반입니다. 조합론과 확률은 경우의 수 문제와 시뮬레이션에 필수적입니다. 🟢 기본 문제로 완전수, 약수 합, 소인수분해 등을 구현하고, 🟡 응용 문제로 확장 유클리드, 중국인의\r
    나머지 정리를 연습하세요. 🔴 심화 문제에서는 밀러-라빈 소수 판별, 폴라드 로 인수분해 등 고급 알고리즘을 직접 구현해봅니다. 수학 알고리즘은 코딩 테스트와 암호학에서 핵심\r
    역할을 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def isPerfect(n):\r
        if n < 2:\r
            return False\r
        divSum = 1\r
        i = 2\r
        while i * i <= n:\r
            if n % i == 0:\r
                divSum += i\r
                if i != n // i:\r
                    divSum += n // i\r
            i += 1\r
        return divSum == n\r
\r
    ex1Result = [n for n in range(1, 1000) if isPerfect(n)]\r
    ex1Result\r
  exercise:\r
    prompt: 종합 연습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def isPerfect(n):\r
          if n < 2:\r
              return False\r
          divSum = 1\r
          i = 2\r
          while i * i <= n:\r
              if n % i == 0:\r
                  divSum += i\r
                  if i != n // i:\r
                      divSum += n // i\r
              i += 1\r
          return divSum == n\r
\r
      ex1Result = [n for n in range(1, 1000) if isPerfect(n)]\r
      ex1Result\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 연습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 연습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 28_math_algorithms-batch-cycle-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - gcd_lcm
    - modular
    - workflow_validation
    title: 배치 주기의 최소 공배수 계산하기
    subtitle: batch lcm planning
    goal: schedule_batch_cycle(periods)를 완성해 여러 배치 주기가 다시 동시에 만나는 cycle과 검증 나머지를 반환한다.
    why: 수학 알고리즘은 추상 문제가 아니라 스케줄, 체크섬, 분배처럼 자동화의 정확성을 보장하는 작은 엔진입니다.
    explanation: periods는 양의 정수 리스트여야 합니다. gcd로 lcm을 누적하고, cycle을 각 period로 나눈 나머지가 모두 0인지 반환하세요.
    tips:
    - lcm(a, b)는 a * b // gcd(a, b)로 계산합니다.
    - 입력이 비어 있거나 0 이하 값을 포함하면 ValueError로 거부하세요.
    exercise:
      prompt: schedule_batch_cycle(periods)를 완성해 cycle, remainders, periodCount를 반환하세요.
      starterCode: |-
        def schedule_batch_cycle(periods):
            raise NotImplementedError
      solution: |-
        def schedule_batch_cycle(periods):
            from math import gcd

            if not periods or any(period <= 0 for period in periods):
                raise ValueError("periods must be positive")

            def lcm(a, b):
                return a * b // gcd(a, b)

            cycle = periods[0]
            for period in periods[1:]:
                cycle = lcm(cycle, period)
            return {
                "cycle": cycle,
                "remainders": [cycle % period for period in periods],
                "periodCount": len(periods),
            }
      hints:
      - gcd는 표준 라이브러리 math에서 가져올 수 있습니다.
      - remainders가 모두 0이면 cycle이 모든 주기의 공배수입니다.
    check:
      id: python.advanced.math-algorithms.batch-cycle.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.math-algorithms.empty.behavior.v1.fixture
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
        entry: schedule_batch_cycle
        cases:
        - id: finds-common-batch-cycle
          arguments:
          - value:
            - 6
            - 10
            - 15
          expectedReturn:
            cycle: 30
            remainders:
            - 0
            - 0
            - 0
            periodCount: 3
        - id: rejects-zero-period
          arguments:
          - value:
            - 6
            - 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 28_math_algorithms-modular-checksum-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - prime
    - combinatorics
    - modular
    title: 모듈러 거듭제곱으로 체크섬 만들기
    subtitle: modular checksum transfer
    goal: modular_power_checksum(values, modulus)를 완성해 각 값의 위치 기반 거듭제곱을 modulus로 누적한다.
    why: 배치 주기에서 배운 정수 연산을 체크섬으로 옮기면, 큰 수를 직접 키우지 않고 나머지 연산으로 안전하게 계산하는 감각이 생깁니다.
    explanation: index는 1부터 시작합니다. 각 value를 index 제곱한 값을 modulus로 줄여 더하고, 최종 checksum도 modulus로 줄이세요.
    tips:
    - pow(value, exponent, modulus)는 큰 거듭제곱을 효율적으로 모듈러 계산합니다.
    - modulus가 1 이하이면 모든 결과가 의미 없어지므로 ValueError로 거부하세요.
    exercise:
      prompt: modular_power_checksum(values, modulus)를 완성해 checksum, modulus, termCount를 반환하세요.
      starterCode: |-
        def modular_power_checksum(values, modulus):
            raise NotImplementedError
      solution: |-
        def modular_power_checksum(values, modulus):
            if modulus <= 1:
                raise ValueError("modulus must be greater than 1")
            checksum = 0
            for index, value in enumerate(values, start=1):
                checksum = (checksum + pow(value, index, modulus)) % modulus
            return {"checksum": checksum, "modulus": modulus, "termCount": len(values)}
      hints:
      - enumerate(values, start=1)로 위치 기반 exponent를 만들 수 있습니다.
      - 매 단계마다 modulus를 적용하면 숫자가 커지는 것을 막습니다.
    check:
      id: python.advanced.math-algorithms.modular-checksum.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.math-algorithms.empty.behavior.v1.fixture
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
        entry: modular_power_checksum
        cases:
        - id: computes-position-based-modular-checksum
          arguments:
          - value:
            - 7
            - 11
            - 13
          - value: 97
          expectedReturn:
            checksum: 94
            modulus: 97
            termCount: 3
        - id: rejects-invalid-modulus
          arguments:
          - value:
            - 1
          - value: 1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 28_math_algorithms-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - prime
    - gcd_lcm
    - combinatorics
    - modular
    - matrix
    - geometry
    title: 수학 알고리즘 선택 기준 회상하기
    subtitle: math algorithm recall
    goal: choose_math_algorithm(need)를 완성해 문제 유형별 수학 도구와 주의점을 반환한다.
    why: 수학 알고리즘은 문제집용 공식이 아니라 자동화 로직의 전제와 불변식을 검증하는 도구입니다.
    explanation: co-prime-check, common-cycle, count-combinations, large-power-remainder, linear-transform, distance-or-area 상황별 도구를 선택하세요.
    tips:
    - 주기와 약분 문제는 gcd와 lcm을 먼저 떠올리세요.
    - 큰 거듭제곱은 pow의 세 번째 인자로 모듈러 계산할 수 있습니다.
    exercise:
      prompt: choose_math_algorithm(need)를 완성해 algorithm, useWhen, caution을 반환하세요.
      starterCode: |-
        def choose_math_algorithm(need):
            raise NotImplementedError
      solution: |-
        def choose_math_algorithm(need):
            table = {
                "co-prime-check": {
                    "algorithm": "gcd",
                    "useWhen": "shared divisors decide compatibility",
                    "caution": "handle zero and negative inputs explicitly",
                },
                "common-cycle": {
                    "algorithm": "lcm",
                    "useWhen": "several periods must align again",
                    "caution": "intermediate products can grow quickly",
                },
                "count-combinations": {
                    "algorithm": "combinatorics",
                    "useWhen": "order or selection count matters",
                    "caution": "distinguish permutation from combination",
                },
                "large-power-remainder": {
                    "algorithm": "modular-exponentiation",
                    "useWhen": "large powers only need remainders",
                    "caution": "modulus must be valid and intentional",
                },
                "linear-transform": {
                    "algorithm": "matrix",
                    "useWhen": "multiple linear equations or transforms combine",
                    "caution": "shape compatibility must be checked",
                },
                "distance-or-area": {
                    "algorithm": "geometry",
                    "useWhen": "coordinates define lengths, intersections, or areas",
                    "caution": "floating point tolerance may matter",
                },
            }
            if need not in table:
                raise ValueError("unknown math need")
            return table[need]
      hints:
      - 먼저 문제의 불변식이 나눗셈, 주기, 개수, 나머지, 좌표 중 어디에 있는지 보세요.
      - 수학 알고리즘은 입력 범위를 명시할수록 안전합니다.
    check:
      id: python.advanced.math-algorithms.choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.math-algorithms.empty.behavior.v1.fixture
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
        entry: choose_math_algorithm
        cases:
        - id: recalls-lcm-for-common-cycle
          arguments:
          - value: common-cycle
          expectedReturn:
            algorithm: lcm
            useWhen: several periods must align again
            caution: intermediate products can grow quickly
        - id: recalls-modular-power-for-remainder
          arguments:
          - value: large-power-remainder
          expectedReturn:
            algorithm: modular-exponentiation
            useWhen: large powers only need remainders
            caution: modulus must be valid and intentional
        - id: rejects-unknown-need
          arguments:
          - value: math-magic
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};