var e=`meta:\r
  packages:\r
  - sympy\r
  id: sympy_05\r
  title: 적분기초\r
  order: 5\r
  category: sympy\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - sympy\r
  - integrate\r
  - 적분\r
  - 정적분\r
  - 부정적분\r
  - 넓이\r
  seo:\r
    title: SymPy 적분 - integrate 사용법과 넓이 계산\r
    description: SymPy로 부정적분과 정적분을 계산합니다. integrate()로 넓이와 부피를 구하는 방법을 배웁니다.\r
    keywords:\r
    - sympy\r
    - integrate\r
    - 적분\r
    - 정적분\r
    - 부정적분\r
    - 넓이\r
intro:\r
  emoji: 📊\r
  goal: integrate()로 부정적분과 정적분을 계산하고 넓이를 구합니다.\r
  description: 적분은 미분의 역연산이자 '누적'의 개념입니다. 속도를 적분하면 이동거리, 밀도를 적분하면 질량이 됩니다. 부정적분은 미분하면 원래 함수가 되는 원시함수를\r
    찾고, 정적분은 곡선 아래의 넓이를 정확하게 계산합니다. 손으로 적분하면 치환, 부분적분 등 복잡한 기법을 적용해야 하지만, SymPy의 integrate()는 이 모든 과정을\r
    자동으로 처리합니다. 이 프로젝트를 완료하면 넓이, 부피, 두 곡선 사이 넓이까지 구할 수 있게 됩니다.\r
  direction: 적분기초에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 수식과 기호 확인 후 기호 계산에 맞는 코드 입력을 고릅니다.\r
  - 적분기초 결과를 간소화식, 해, 미분/적분 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 수학 계산 검증 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(수식과 기호)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 부정적분 처리 실행\r
      detail: 기호 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 거듭제곱 적분 결과 검증\r
      detail: 간소화식, 해, 미분/적분 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 적분기초 재사용\r
      detail: 완성 코드를 수학 계산 검증 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 기호 계산 환경\r
      detail: sympy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 적분기초 실행\r
      detail: 셀을 실행해 간소화식, 해, 미분/적분 결과와 예외 상태를 확인합니다.\r
    - label: 적분기초 완료\r
      detail: 검증된 코드를 수학 계산 검증 루틴로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 적분에 필요한 함수들을 불러옵니다. integrate()가 핵심 함수이며, diff()로 적분 결과를 검증할 수 있습니다. oo는 무한대(infinity)를\r
    나타내며 이상적분에 사용합니다. Rational은 분수 계수를 정확하게 표현합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sympy import symbols, integrate, diff, simplify, expand\r
    from sympy import sin, cos, exp, log, sqrt, pi, oo, Rational\r
    from sympy import init_printing\r
    init_printing()\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, integrate, diff, simplify, expand\r
      from sympy import sin, cos, exp, log, sqrt, pi, oo, Rational\r
      from sympy import init_printing\r
      init_printing()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 라이브러리 불러오기의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step2_indefinite\r
  title: 2단계. 부정적분\r
  structuredPrimary: true\r
  subtitle: 원시함수 찾기\r
  goal: 2단계. 부정적분에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    부정적분(indefinite integral)은 미분하면 원래 함수가 되는 원시함수(antiderivative)를 찾습니다. ∫x²dx = x³/3 + C인데, SymPy는 적분상수 C를 생략합니다. 적분 결과를 미분하면 원래 함수가 되어야 하므로, diff(F, x) == f인지 확인하면 검증할 수 있습니다. 부정적분은 정적분의 기초가 됩니다.\r
\r
    ∫xⁿdx = xⁿ⁺¹/(n+1)입니다. x²을 적분하면 x³/3이 됩니다. 적분상수 +C는 SymPy에서 생략합니다.\r
  snippet: x = symbols('x')\r
  exercise:\r
    prompt: 2단계. 부정적분 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: x = symbols('x')\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 부정적분의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 부정적분 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step3_power\r
  title: 3단계. 거듭제곱 적분\r
  structuredPrimary: true\r
  subtitle: 다항식\r
  goal: 3단계. 거듭제곱 적분에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 거듭제곱 함수 xⁿ의 적분은 xⁿ⁺¹/(n+1)입니다(n≠-1). 다항식은 각 항을 따로 적분하고 더합니다. 3x² + 2x + 1을 적분하면 x³ + x²\r
    + x가 됩니다. 음의 거듭제곱 1/x²도 같은 규칙으로 -1/x가 됩니다. 제곱근 √x = x^(1/2)도 (2/3)x^(3/2)로 적분됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    poly = 3*x**2 + 2*x + 1\r
    ipoly = integrate(poly, x)\r
    ipoly\r
  exercise:\r
    prompt: 3단계. 거듭제곱 적분 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      poly = 3*x**2 + 2*x + 1\r
      ipoly = integrate(poly, x)\r
      ipoly\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 거듭제곱 적분의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 거듭제곱 적분 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step4_special\r
  title: 4단계. 특수 함수 적분\r
  structuredPrimary: true\r
  subtitle: sin, cos, exp, 1/x\r
  goal: 4단계. 특수 함수 적분에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    삼각함수와 지수함수의 적분은 미분의 역과정입니다. ∫sin(x)dx = -cos(x), ∫cos(x)dx = sin(x)입니다(미분의 부호가 바뀝니다). ∫eˣdx = eˣ로 지수함수는 자기 자신이 적분입니다. ∫(1/x)dx = ln|x|로 역수의 적분은 자연로그가 됩니다. 이 공식들은 미분 공식과 쌍을 이루어 암기해야 합니다.\r
\r
    ∫sin x dx = -cos x, ∫cos x dx = sin x, ∫eˣdx = eˣ, ∫(1/x)dx = ln|x|입니다. 미분의 역입니다.\r
  snippet: |-\r
    isin = integrate(sin(x), x)\r
    icos = integrate(cos(x), x)\r
    isin, icos\r
  exercise:\r
    prompt: 4단계. 특수 함수 적분 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      isin = integrate(sin(x), x)\r
      icos = integrate(cos(x), x)\r
      isin, icos\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 특수 함수 적분의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 특수 함수 적분 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step5_definite\r
  title: 5단계. 정적분\r
  structuredPrimary: true\r
  subtitle: 구간 적분\r
  goal: 5단계. 정적분에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    정적분(definite integral)은 구간 [a, b]에서 곡선 아래의 넓이를 계산합니다. integrate(f, (x, a, b))로 구간을 지정합니다. 미적분학의 기본 정리에 따라 ∫[a,b]f(x)dx = F(b) - F(a)입니다. 물리학에서 속도를 시간에 대해 정적분하면 이동거리, 힘을 거리에 대해 정적분하면 일(work)이 됩니다.\r
\r
    정적분 ∫[a,b] f(x)dx = F(b) - F(a)입니다. integrate(f, (x, a, b))로 계산합니다. 결과는 수치입니다.\r
  snippet: |-\r
    dint = integrate(x**2, (x, 0, 1))\r
    dint\r
  exercise:\r
    prompt: 5단계. 정적분 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      dint = integrate(x**2, (x, 0, 1))\r
      dint\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 정적분의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 정적분 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step6_improper\r
  title: 6단계. 이상적분\r
  structuredPrimary: true\r
  subtitle: 무한 구간\r
  goal: 6단계. 이상적분에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    이상적분(improper integral)은 적분 구간이 무한대까지 확장된 경우입니다. oo를 사용하여 ∫[0,∞]e⁻ˣdx = 1처럼 계산합니다. 함수가 충분히 빨리 0으로 감소해야 수렴하여 유한한 값이 나옵니다. 가우스 적분 ∫[-∞,∞]e⁻ˣ²dx = √π는 확률론과 통계학의 기초가 되는 유명한 결과입니다.\r
\r
    e⁻ˣ² 의 적분은 √π입니다. 이것은 유명한 가우스 적분으로, 확률론과 통계학에서 중요합니다.\r
  snippet: |-\r
    improper1 = integrate(exp(-x), (x, 0, oo))\r
    improper1\r
  exercise:\r
    prompt: 6단계. 이상적분 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      improper1 = integrate(exp(-x), (x, 0, oo))\r
      improper1\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 이상적분의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 이상적분 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step7_substitution\r
  title: 7단계. 치환적분\r
  structuredPrimary: true\r
  subtitle: 합성함수 적분\r
  goal: 7단계. 치환적분에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    치환적분(substitution)은 합성함수 형태를 적분하는 기법입니다. ∫2x·e^(x²)dx에서 u=x²로 치환하면 ∫eᵘdu = eᵘ = e^(x²)가 됩니다. 손으로 하면 u=..., du/dx=... 과정이 복잡하지만, SymPy는 자동으로 적절한 치환을 찾아 적용합니다. 1/(1+x²)의 적분은 arctan(x)로, 역삼각함수가 등장합니다.\r
\r
    1/(1+x²)의 적분은 arctan(x)입니다. SymPy에서는 atan(x)로 표시됩니다. 역삼각함수의 미분과 연결됩니다.\r
  snippet: |-\r
    subst1 = 2*x * exp(x**2)\r
    intSubst1 = integrate(subst1, x)\r
    intSubst1\r
  exercise:\r
    prompt: 7단계. 치환적분 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      subst1 = 2*x * exp(x**2)\r
      intSubst1 = integrate(subst1, x)\r
      intSubst1\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 치환적분의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 치환적분 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step8_parts\r
  title: 8단계. 부분적분\r
  structuredPrimary: true\r
  subtitle: 곱의 적분\r
  goal: 8단계. 부분적분에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 부분적분(integration by parts)은 곱의 적분 기법입니다. ∫u·dv = uv - ∫v·du 공식을 적용합니다. ∫x·eˣdx처럼 다항식×지수함수,\r
    ∫x·sin(x)dx처럼 다항식×삼각함수 형태에 유용합니다. ∫ln(x)dx는 u=ln(x), dv=dx로 놓아 x·ln(x)-x가 됩니다. SymPy는 적절한 u와 dv를 자동으로\r
    선택합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    parts1 = x * exp(x)\r
    intParts1 = integrate(parts1, x)\r
    intParts1\r
  exercise:\r
    prompt: 8단계. 부분적분 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      parts1 = x * exp(x)\r
      intParts1 = integrate(parts1, x)\r
      intParts1\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 부분적분의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 부분적분 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step9_double\r
  title: 9단계. 이중적분\r
  structuredPrimary: true\r
  subtitle: 넓이와 부피\r
  goal: 9단계. 이중적분에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    이중적분(double integral)은 두 변수에 대해 연속으로 적분합니다. ∬f(x,y)dxdy로 평면 영역의 넓이나 3D 입체의 부피를 계산합니다. integrate(f, (x, a, b), (y, c, d))는 먼저 x로 적분(내부)하고 그 결과를 y로 적분(외부)합니다. 단위원의 넓이 ∬1 dA = π를 이중적분으로 확인할 수 있습니다.\r
\r
    integrate(f, (x, a, b), (y, c, d))는 먼저 x로, 다음 y로 적분합니다. 순서대로 내부에서 외부로 계산합니다.\r
  snippet: y = symbols('y')\r
  exercise:\r
    prompt: 9단계. 이중적분 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: y = symbols('y')\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 이중적분의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 이중적분 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step10_area\r
  title: 10단계. 곡선 사이 넓이\r
  structuredPrimary: true\r
  subtitle: 응용 문제\r
  goal: 10단계. 곡선 사이 넓이에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    두 곡선 y=f(x)와 y=g(x) 사이의 넓이는 ∫[a,b](위쪽-아래쪽)dx로 계산합니다. 먼저 solve(f-g, x)로 교점을 구해 적분 구간 [a,b]를 결정합니다. y=x²와 y=x의 교점은 x=0, x=1이고, 그 사이 넓이는 ∫[0,1](x-x²)dx = 1/6입니다. 경제학에서 소비자잉여, 생산자잉여 계산에 이 기법을 사용합니다.\r
\r
    두 곡선 사이 넓이 = ∫[a,b] |f(x) - g(x)| dx입니다. 위쪽 함수에서 아래쪽 함수를 빼고 적분합니다.\r
  snippet: |-\r
    from sympy import solve\r
    f1 = x**2\r
    f2 = x\r
    f1, f2\r
  exercise:\r
    prompt: 10단계. 곡선 사이 넓이 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import solve\r
      f1 = x**2\r
      f2 = x\r
      f1, f2\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 곡선 사이 넓이의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 곡선 사이 넓이 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 적분 연습\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    지금까지 배운 integrate, diff, solve를 모두 활용하여 실전 문제를 풀어봅시다. 미션1은 다항식, 삼각함수, 지수함수의 적분과 정적분 계산입니다. 미션2는 두 곡선의 교점을 찾고 그 사이 넓이를 계산합니다. 반원의 넓이를 적분으로 확인하는 문제도 포함되어 있습니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from sympy import symbols, integrate, sin, cos, exp, sqrt, pi\r
\r
    r = symbols('r')\r
\r
    poly = integrate(r**3 - 2*r + 1, r)\r
    poly\r
  exercise:\r
    prompt: 실습 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, integrate, sin, cos, exp, sqrt, pi\r
\r
      r = symbols('r')\r
\r
      poly = integrate(r**3 - 2*r + 1, r)\r
      poly\r
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