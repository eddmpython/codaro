var e=`meta:\r
  packages:\r
  - sympy\r
  id: sympy_06\r
  title: 극한과급수\r
  order: 6\r
  category: sympy\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - sympy\r
  - limit\r
  - series\r
  - summation\r
  - 극한\r
  - 테일러급수\r
  seo:\r
    title: SymPy 극한과 급수 - limit, series 사용법\r
    description: SymPy로 극한값을 계산하고 테일러 급수를 전개합니다. limit()와 series()로 해석학의 기초를 배웁니다.\r
    keywords:\r
    - sympy\r
    - limit\r
    - series\r
    - summation\r
    - 극한\r
    - 테일러급수\r
intro:\r
  emoji: ∞\r
  goal: limit()로 극한값을 계산하고 series()로 급수 전개를 수행합니다.\r
  description: 극한(limit)은 해석학의 기초로, 함수가 특정 점에 가까워질 때의 값을 정의합니다. (x²-1)/(x-1)은 x=1에서 0/0이지만 극한값은 2입니다.\r
    급수(series)는 무한 합을 다루고, 테일러 급수는 sin(x), eˣ 같은 함수를 다항식으로 근사합니다. 이 개념들은 미분과 적분의 엄밀한 정의, 함수의 근사, 수치 계산의\r
    기초가 됩니다. 이 프로젝트를 완료하면 극한값 계산, 급수 전개, 무한급수의 합까지 다룰 수 있게 됩니다.\r
  direction: 극한과급수에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 수식과 기호 확인 후 기호 계산에 맞는 코드 입력을 고릅니다.\r
  - 극한과급수 결과를 간소화식, 해, 미분/적분 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 수학 계산 검증 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(수식과 기호)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기본 극한 처리 실행\r
      detail: 기호 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 무한대 극한 결과 검증\r
      detail: 간소화식, 해, 미분/적분 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 극한과급수 재사용\r
      detail: 완성 코드를 수학 계산 검증 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 기호 계산 환경\r
      detail: sympy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 극한과급수 실행\r
      detail: 셀을 실행해 간소화식, 해, 미분/적분 결과와 예외 상태를 확인합니다.\r
    - label: 극한과급수 완료\r
      detail: 검증된 코드를 수학 계산 검증 루틴로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 극한과 급수에 필요한 함수들을 불러옵니다. limit()는 극한값을 계산하고, series()는 테일러 급수를 전개합니다. summation()은 유한/무한\r
    합을 계산하고, factorial(n)은 n! = n×(n-1)×...×1입니다. oo는 무한대를 나타냅니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sympy import symbols, limit, series, summation, Sum\r
    from sympy import sin, cos, exp, log, sqrt, pi, oo, Rational\r
    from sympy import simplify, factorial\r
    from sympy import init_printing\r
    init_printing()\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, limit, series, summation, Sum\r
      from sympy import sin, cos, exp, log, sqrt, pi, oo, Rational\r
      from sympy import simplify, factorial\r
      from sympy import init_printing\r
      init_printing()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 라이브러리 불러오기의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step2_limit_basic\r
  title: 2단계. 기본 극한\r
  structuredPrimary: true\r
  subtitle: limit()\r
  goal: 2단계. 기본 극한에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    limit(f, x, a)는 x가 a에 가까워질 때 f(x)의 극한값을 계산합니다. x=a에서 함수값이 정의되지 않아도 극한은 존재할 수 있습니다. (x²-1)/(x-1)에 x=1을 대입하면 0/0이지만, 인수분해하면 x+1이 되어 극한값은 2입니다. limit()는 이런 부정형을 자동으로 처리합니다.\r
\r
    (x²-1)/(x-1)에 x=1을 대입하면 0/0이지만, 인수분해하면 x+1이 되어 극한값은 2입니다. limit()가 자동 처리합니다.\r
  snippet: x = symbols('x')\r
  exercise:\r
    prompt: 2단계. 기본 극한 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: x = symbols('x')\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 기본 극한의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 기본 극한 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step3_infinity\r
  title: 3단계. 무한대 극한\r
  structuredPrimary: true\r
  subtitle: x → ∞\r
  goal: 3단계. 무한대 극한에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: x가 무한대로 갈 때의 극한은 함수의 장기적 행동을 보여줍니다. limit(1/x, x, oo) = 0으로 x가 커지면 1/x는 0에 가까워집니다. 유리함수\r
    (2x+1)/(x+3)의 극한은 최고차항 계수의 비인 2입니다. 발산하는 경우 oo 또는 -oo가 반환됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    lim3 = limit(1/x, x, oo)\r
    lim3\r
  exercise:\r
    prompt: 3단계. 무한대 극한 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      lim3 = limit(1/x, x, oo)\r
      lim3\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 무한대 극한의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 무한대 극한 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step4_sided\r
  title: 4단계. 좌극한과 우극한\r
  structuredPrimary: true\r
  subtitle: 방향 지정\r
  goal: 4단계. 좌극한과 우극한에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    함수가 불연속인 점에서는 왼쪽에서 접근하는 값(좌극한)과 오른쪽에서 접근하는 값(우극한)이 다를 수 있습니다. 1/x의 x→0 극한은 오른쪽에서 +∞, 왼쪽에서 -∞입니다. limit(f, x, a, '+')는 우극한, limit(f, x, a, '-')는 좌극한입니다. 좌극한과 우극한이 같을 때만 극한이 존재합니다.\r
\r
    dir='+' 또는 '+'는 오른쪽(양의 방향)에서 접근합니다. dir='-' 또는 '-'는 왼쪽(음의 방향)에서 접근합니다.\r
  snippet: |-\r
    lright = limit(1/x, x, 0, '+')\r
    lright\r
  exercise:\r
    prompt: 4단계. 좌극한과 우극한 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      lright = limit(1/x, x, 0, '+')\r
      lright\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 좌극한과 우극한의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 좌극한과 우극한 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step5_special\r
  title: 5단계. 특수 극한\r
  structuredPrimary: true\r
  subtitle: 유명한 극한\r
  goal: 5단계. 특수 극한에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 미적분에서 반복적으로 등장하는 유명한 극한들이 있습니다. lim[x→0] sin(x)/x = 1은 삼각함수 미분의 기초입니다. lim[n→∞] (1+1/n)ⁿ\r
    = e는 자연상수 e의 정의입니다. lim[x→0] (eˣ-1)/x = 1은 지수함수 미분에 사용됩니다. 이 극한들은 암기할 가치가 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    lsin = limit(sin(x)/x, x, 0)\r
    lsin\r
  exercise:\r
    prompt: 5단계. 특수 극한 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      lsin = limit(sin(x)/x, x, 0)\r
      lsin\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 특수 극한의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 특수 극한 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step6_series\r
  title: 6단계. 테일러 급수\r
  structuredPrimary: true\r
  subtitle: series()\r
  goal: 6단계. 테일러 급수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    테일러 급수(Taylor series)는 함수를 다항식으로 근사합니다. eˣ = 1 + x + x²/2! + x³/3! + ..., sin(x) = x - x³/6 + x⁵/120 - ...입니다. series(f, x, 0, n)은 x=0에서 n항까지 전개합니다. 결과에 O(xⁿ)은 오차항을 나타냅니다. 컴퓨터가 삼각함수를 계산할 때 실제로 테일러 급수를 사용합니다.\r
\r
    series(f, x, 0, n)은 x=0에서 n항까지 전개합니다. O(x^n)은 나머지 오차항입니다. removeO()로 제거할 수 있습니다.\r
  snippet: |-\r
    sexp = series(exp(x), x, 0, 6)\r
    sexp\r
  exercise:\r
    prompt: 6단계. 테일러 급수 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      sexp = series(exp(x), x, 0, 6)\r
      sexp\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 테일러 급수의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 테일러 급수 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step7_remove_o\r
  title: 7단계. 급수 활용\r
  structuredPrimary: true\r
  subtitle: 다항식 추출\r
  goal: 7단계. 급수 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    series() 결과에서 removeO()를 호출하면 오차항 O(xⁿ)을 제거하고 순수한 다항식을 얻습니다. 이 다항식으로 원래 함수를 근사할 수 있습니다. sin(0.5)의 정확한 값 0.479...과 테일러 다항식의 근사값을 비교하면 매우 가깝습니다. 항이 많을수록 더 넓은 범위에서 정확하게 근사합니다.\r
\r
    테일러 다항식은 중심 근처에서 원래 함수를 잘 근사합니다. 항이 많을수록 더 넓은 범위에서 정확합니다.\r
  snippet: |-\r
    spoly = series(sin(x), x, 0, 7).removeO()\r
    spoly\r
  exercise:\r
    prompt: 7단계. 급수 활용 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      spoly = series(sin(x), x, 0, 7).removeO()\r
      spoly\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 급수 활용의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 급수 활용 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step8_summation\r
  title: 8단계. 급수 합\r
  structuredPrimary: true\r
  subtitle: summation()\r
  goal: 8단계. 급수 합에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    summation()은 Σ 기호로 표현되는 급수의 합을 계산합니다. summation(k, (k, 1, 10))은 1+2+...+10 = 55입니다. 변수 n을 사용하면 1+2+...+n = n(n+1)/2 같은 공식을 유도합니다. 무한급수도 수렴하면 정확한 값을 반환합니다. 기하급수 Σ(1/2)ᵏ = 2입니다.\r
\r
    summation(f, (k, a, b))는 k=a부터 k=b까지의 합입니다. b=oo로 무한급수를 계산합니다. 수렴하면 값을 반환합니다.\r
  snippet: |-\r
    n, k = symbols('n k')\r
    fsum = summation(k, (k, 1, 10))\r
    fsum\r
  exercise:\r
    prompt: 8단계. 급수 합 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      n, k = symbols('n k')\r
      fsum = summation(k, (k, 1, 10))\r
      fsum\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 급수 합의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 급수 합 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step9_famous\r
  title: 9단계. 유명한 급수\r
  structuredPrimary: true\r
  subtitle: 바젤 문제 등\r
  goal: 9단계. 유명한 급수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 수학사에서 중요한 급수들을 SymPy로 검증합니다. 바젤 문제 Σ(1/n²)은 1735년 오일러가 π²/6임을 증명하여 수학계를 놀라게 했습니다. 조화급수\r
    Σ(1/n)은 발산하여 무한대가 됩니다. 1/n²은 수렴하는데 1/n은 발산하는 이유는 항의 감소 속도 차이 때문입니다. 교대급수 Σ((-1)ⁿ/n)은 ln(2)에 수렴합니다.\r
    이런 급수들은 해석학의 기초 예제로 널리 사용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    basel = summation(1/n**2, (n, 1, oo))\r
    basel\r
  exercise:\r
    prompt: 9단계. 유명한 급수 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      basel = summation(1/n**2, (n, 1, oo))\r
      basel\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 유명한 급수의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 유명한 급수 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step10_combine\r
  title: 10단계. 극한과 급수 연결\r
  structuredPrimary: true\r
  subtitle: 종합\r
  goal: 10단계. 극한과 급수 연결에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 극한과 급수는 미적분학의 근간입니다. 미분의 정의 f'(x) = lim[h→0] (f(x+h)-f(x))/h는 극한으로 정의됩니다. x=2에서 x²의 미분값\r
    4를 극한 정의로 계산하면 limit((f(2+h)-f(2))/h, h, 0) = 4입니다. 자연상수 e도 급수 Σ(1/n!)으로 정의됩니다. SymPy는 미분을 극한 정의 없이\r
    diff()로 바로 계산하지만, 극한 정의를 이해하면 미분의 본질을 알 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sympy import diff\r
    h = symbols('h')\r
    f = x**2\r
    ddef = limit((f.subs(x, 2+h) - f.subs(x, 2))/h, h, 0)\r
    ddef\r
  exercise:\r
    prompt: 10단계. 극한과 급수 연결 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from sympy import diff\r
      h = symbols('h')\r
      f = x**2\r
      ddef = limit((f.subs(x, 2+h) - f.subs(x, 2))/h, h, 0)\r
      ddef\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 극한과 급수 연결의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 극한과 급수 연결 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 극한과 급수 연습\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    이제 limit(), series(), summation()을 종합적으로 활용합니다. 미션1에서는 다양한 부정형 극한을 계산합니다. (1-cos(u))/u²은 0/0형태이고, u·log(u)는 0·(-∞)형태입니다. 미션2에서는 ln(1+v)와 √(1+v)의 테일러 급수를 구하고, 1/k⁴의 무한합이 π⁴/90임을 확인합니다. 이런 계산은 물리학의 근사 계산, 수치해석의 오차 분석에 필수적입니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from sympy import symbols, limit, sin, cos, exp, log, oo\r
\r
    u = symbols('u')\r
\r
    val1 = limit((1 - cos(u))/u**2, u, 0)\r
    val1\r
  exercise:\r
    prompt: 실습 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, limit, sin, cos, exp, log, oo\r
\r
      u = symbols('u')\r
\r
      val1 = limit((1 - cos(u))/u**2, u, 0)\r
      val1\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 실습의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 실습 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 손익분기 수식을 기호로 검증하기'\r
  structuredPrimary: true\r
  subtitle: 예측 → 수식 구성 → 오류 수정 → 결과 검증 → 실무 변주\r
  goal: '현업 흐름 검증: 손익분기 수식을 기호로 검증하기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: SymPy는 계산기를 대신하는 도구가 아니라, 업무 규칙을 수식으로 고정하고 전제 조건을 검증하는 도구입니다. 여기서는 고정비와 단위 이익으로 손익분기점을\r
    구하고, 잘못된 계수를 먼저 실패시킨 뒤, 기준 변경 실험을 수행합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import sympy as sp\r
\r
    x = sp.symbols('x', nonnegative=True)\r
    fixedCost = 120000\r
    unitPrice = 5000\r
    unitCost = 2000\r
\r
    revenueExpr = unitPrice * x\r
    costExpr = fixedCost + unitCost * x\r
    profitExpr = sp.simplify(revenueExpr - costExpr)\r
    breakEvenQuantity = sp.solve(sp.Eq(profitExpr, 0), x)[0]\r
\r
    assert profitExpr == 3000 * x - 120000\r
    assert breakEvenQuantity == 40\r
    profitExpr, breakEvenQuantity\r
  exercise:\r
    prompt: '현업 흐름 검증: 손익분기 수식을 기호로 검증하기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import sympy as sp\r
\r
      x = sp.symbols('x', nonnegative=True)\r
      fixedCost = 120000\r
      unitPrice = 5000\r
      unitCost = 2000\r
\r
      revenueExpr = unitPrice * x\r
      costExpr = fixedCost + unitCost * x\r
      profitExpr = sp.simplify(revenueExpr - costExpr)\r
      breakEvenQuantity = sp.solve(sp.Eq(profitExpr, 0), x)[0]\r
\r
      assert profitExpr == 3000 * x - 120000\r
      assert breakEvenQuantity == 40\r
      profitExpr, breakEvenQuantity\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: '현업 흐름 검증: 손익분기 수식을 기호로 검증하기의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 손익분기 수식을 기호로 검증하기 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.'\r
`;export{e as default};