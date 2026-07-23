var e=`meta:\r
  packages:\r
  - sympy\r
  id: sympy_02\r
  title: 대입과계산\r
  order: 2\r
  category: sympy\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - sympy\r
  - subs\r
  - evalf\r
  - N\r
  - 대입\r
  - 수치계산\r
  seo:\r
    title: SymPy 대입과 계산 - subs, evalf 사용법\r
    description: SymPy로 수식에 값을 대입하고 수치 계산을 수행합니다. subs()와 evalf()로 기호에서 숫자로 변환하는 방법을 배웁니다.\r
    keywords:\r
    - sympy\r
    - subs\r
    - evalf\r
    - 대입\r
    - 수치계산\r
    - N\r
intro:\r
  emoji: 🔢\r
  goal: 수식에 값을 대입하고 수치 계산을 수행합니다.\r
  description: 기호 수학의 진정한 힘은 수식을 만든 후 원하는 값을 대입할 수 있다는 점입니다. 원의 넓이 πr²을 공식으로 정의해두고, r=5일 때, r=10일 때 값을\r
    바로 계산할 수 있습니다. subs()로 기호에 값을 대입하고, evalf()로 π나 √2 같은 무리수를 소수점으로 변환합니다. 물리 공식에 측정값을 넣거나, 수학 함수의 특정\r
    점에서 값을 구하거나, 복잡한 계산을 단계별로 검증할 때 이 기능들이 핵심입니다.\r
  direction: 대입과계산에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 수식과 기호 확인 후 기호 계산에 맞는 코드 입력을 고릅니다.\r
  - 대입과계산 결과를 간소화식, 해, 미분/적분 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 수학 계산 검증 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(수식과 기호)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기본 대입 처리 실행\r
      detail: 기호 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 기호로 대입 결과 검증\r
      detail: 간소화식, 해, 미분/적분 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 대입과계산 재사용\r
      detail: 완성 코드를 수학 계산 검증 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 기호 계산 환경\r
      detail: sympy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 대입과계산 실행\r
      detail: 셀을 실행해 간소화식, 해, 미분/적분 결과와 예외 상태를 확인합니다.\r
    - label: 대입과계산 완료\r
      detail: 검증된 코드를 수학 계산 검증 루틴로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: SymPy에서 기호 정의, 수식 조작, 대입과 수치 계산에 필요한 함수들을 불러옵니다. 이번 프로젝트에서는 subs()와 evalf()가 핵심입니다. pi는\r
    원주율 3.14159..., E는 자연상수 2.71828...을 정확한 기호로 제공합니다. N()은 evalf()의 간편 버전으로, 수식을 빠르게 수치로 변환할 때 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sympy import symbols, expand, factor, simplify, sqrt, Rational\r
    from sympy import pi, E, N\r
    from sympy import init_printing\r
    init_printing()\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, expand, factor, simplify, sqrt, Rational\r
      from sympy import pi, E, N\r
      from sympy import init_printing\r
      init_printing()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 라이브러리 불러오기의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step2_subs_basic\r
  title: 2단계. 기본 대입\r
  structuredPrimary: true\r
  subtitle: subs()\r
  goal: 2단계. 기본 대입에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    subs()는 substitute(대입)의 줄임말입니다. expr.subs(x, 3)은 수식 expr에서 x를 3으로 바꿉니다. 중요한 점은 원본 수식이 변경되지 않고 새로운 수식이 반환된다는 것입니다. 같은 공식에 여러 값을 대입해 비교할 때 원본을 보존하는 이 특성이 유용합니다. 예를 들어 이차함수 f(x) = x²+2x+1에서 f(0), f(1), f(2)를 각각 구할 수 있습니다.\r
\r
    subs(기호, 값) 형식으로 사용합니다. 반환되는 것은 새로운 수식이며, 원본 expr은 그대로 유지됩니다.\r
  snippet: |-\r
    x = symbols('x')\r
    expr = x**2 + 2*x + 1\r
    expr\r
  exercise:\r
    prompt: 2단계. 기본 대입 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      x = symbols('x')\r
      expr = x**2 + 2*x + 1\r
      expr\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 기본 대입의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 기본 대입 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step3_subs_symbol\r
  title: 3단계. 기호로 대입\r
  structuredPrimary: true\r
  subtitle: 기호 치환\r
  goal: 3단계. 기호로 대입에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    subs()는 숫자뿐 아니라 다른 기호나 수식으로도 대입할 수 있습니다. x를 y로 바꾸면 변수명 변경, x를 y+1로 바꾸면 수식 변환이 됩니다. 이 기능은 수학에서 변수 치환(substitution)이라고 부르는 중요한 기법입니다. 예를 들어 적분에서 u = x+1로 치환하거나, 좌표 변환에서 x를 r*cos(θ)로 바꾸는 것과 같습니다.\r
\r
    x를 y+1로 대입하면 (y+1)²+2(y+1)+1이 됩니다. expand()로 전개하면 정리된 결과를 얻습니다.\r
  snippet: |-\r
    y = symbols('y')\r
    replaced = expr.subs(x, y)\r
    replaced\r
  exercise:\r
    prompt: 3단계. 기호로 대입 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      y = symbols('y')\r
      replaced = expr.subs(x, y)\r
      replaced\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 기호로 대입의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 기호로 대입 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step4_subs_multiple\r
  title: 4단계. 여러 값 대입\r
  structuredPrimary: true\r
  subtitle: 딕셔너리 사용\r
  goal: 4단계. 여러 값 대입에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    여러 기호에 동시에 값을 대입할 때는 파이썬 딕셔너리를 사용합니다. {x: 1, y: 2, z: 3} 형식으로 전달하면 x, y, z 모두 한 번에 대입됩니다. 물리 공식에서 여러 상수(중력가속도, 질량, 속도 등)를 동시에 넣거나, 연립방정식의 해를 검증할 때 유용합니다. 일부 기호만 대입하고 나머지는 기호로 남겨둘 수도 있어, 단계별로 계산을 진행할 때 편리합니다.\r
\r
    딕셔너리에 포함되지 않은 기호는 그대로 남습니다. 단계별로 값을 대입할 때 유용합니다.\r
  snippet: |-\r
    z = symbols('z')\r
    multi = x**2 + y**2 + z\r
    multi\r
  exercise:\r
    prompt: 4단계. 여러 값 대입 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      z = symbols('z')\r
      multi = x**2 + y**2 + z\r
      multi\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 여러 값 대입의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 여러 값 대입 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step5_evalf\r
  title: 5단계. 수치 계산\r
  structuredPrimary: true\r
  subtitle: evalf()\r
  goal: 5단계. 수치 계산에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    evalf()는 evaluate float의 줄임말로, 수식을 부동소수점 숫자로 계산합니다. √2는 1.4142135..., π는 3.1415926...으로 변환됩니다. 기본 정밀도는 15자리이지만, evalf(50)처럼 원하는 자릿수를 지정할 수 있습니다. 과학 계산에서 고정밀도가 필요하거나, 결과를 소수점으로 확인하고 싶을 때 사용합니다. 기호 계산으로 정확한 답을 구한 후, 마지막에 evalf()로 수치 결과를 얻는 것이 권장 패턴입니다.\r
\r
    evalf(n)에서 n은 유효숫자 개수입니다. 기본값은 15자리입니다. 고정밀 계산이 필요할 때 자릿수를 늘릴 수 있습니다.\r
  snippet: |-\r
    root2 = sqrt(2)\r
    decimal = root2.evalf()\r
    decimal\r
  exercise:\r
    prompt: 5단계. 수치 계산 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      root2 = sqrt(2)\r
      decimal = root2.evalf()\r
      decimal\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 수치 계산의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 수치 계산 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step6_N\r
  title: 6단계. N() 함수\r
  structuredPrimary: true\r
  subtitle: 간편 수치화\r
  goal: 6단계. N() 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    N()은 evalf()의 간편 버전입니다. expr.evalf() 대신 N(expr)처럼 함수 형태로 호출할 수 있습니다. 기능은 동일하지만, 여러 수식을 연속으로 수치화할 때 N(sqrt(2)), N(pi), N(E)처럼 간결하게 쓸 수 있어 편리합니다. N(expr, 20)처럼 정밀도 지정도 가능합니다.\r
\r
    E는 자연상수 e(≈2.718...)입니다. SymPy에서 대문자 E로 사용합니다. exp(1)과 같습니다.\r
  snippet: |-\r
    val1 = N(sqrt(3))\r
    val1\r
  exercise:\r
    prompt: 6단계. N() 함수 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      val1 = N(sqrt(3))\r
      val1\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 6단계. N() 함수의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. N() 함수 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step7_combine\r
  title: 7단계. 대입 후 수치화\r
  structuredPrimary: true\r
  subtitle: subs + evalf\r
  goal: 7단계. 대입 후 수치화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    실제 계산에서는 subs()로 값을 대입한 후 evalf()로 수치 결과를 얻는 패턴을 가장 많이 사용합니다. circle.subs(x, 5).evalf()처럼 체이닝으로 한 줄에 처리할 수 있습니다. 원의 넓이 πr²에 r=5를 넣고 수치로 변환하면 78.5398...이 나옵니다. 피타고라스 정리로 빗변 길이를 구하거나, 복리 이자를 계산하는 등 실생활 공식에 이 패턴을 적용할 수 있습니다.\r
\r
    .subs().evalf() 체이닝으로 대입과 수치화를 한 줄에 처리합니다. 수학 공식에 값을 넣어 결과를 구할 때 유용합니다.\r
  snippet: |-\r
    circle = pi * x**2\r
    area = circle.subs(x, 5).evalf()\r
    area\r
  exercise:\r
    prompt: 7단계. 대입 후 수치화 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      circle = pi * x**2\r
      area = circle.subs(x, 5).evalf()\r
      area\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 대입 후 수치화의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 대입 후 수치화 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step8_simplify_subs\r
  title: 8단계. 간소화 후 대입\r
  structuredPrimary: true\r
  subtitle: 효율적 계산\r
  goal: 8단계. 간소화 후 대입에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    복잡한 수식은 먼저 simplify()로 간소화한 후 값을 대입하면 효율적입니다. (x²-1)/(x-1)을 x+1로 간소화하면 계산이 훨씬 간단해집니다. 또한 간소화되지 않은 분수식에 특정 값(예: x=1)을 대입하면 0/0이 되어 문제가 생길 수 있지만, 간소화 후에는 정상적으로 계산됩니다. 과학 계산에서 수식이 복잡할수록 먼저 정리하는 것이 오류를 줄이는 좋은 습관입니다.\r
\r
    (x²-1)/(x-1) = x+1로 간소화됩니다. 간소화 후 대입하면 더 깔끔하고 빠릅니다.\r
  snippet: |-\r
    messy = (x**2 - 1)/(x - 1)\r
    messy\r
  exercise:\r
    prompt: 8단계. 간소화 후 대입 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      messy = (x**2 - 1)/(x - 1)\r
      messy\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 간소화 후 대입의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 간소화 후 대입 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step9_constants\r
  title: 9단계. 수학 상수\r
  structuredPrimary: true\r
  subtitle: pi, E, oo\r
  goal: 9단계. 수학 상수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    SymPy는 π(pi), e(E), ∞(oo) 같은 수학 상수를 기호로 제공합니다. 이 상수들은 정확한 값을 유지하므로 2*pi는 2π로, pi**2는 π²로 표현됩니다. 구의 부피 (4/3)πr³ 같은 공식을 정확하게 표현하고, 마지막에 evalf()로 수치 결과를 얻을 수 있습니다. 무한대 oo는 극한 계산 등에서 사용됩니다.\r
\r
    oo는 무한대(infinity)입니다. 극한 계산 등에서 사용합니다. pi*r²처럼 공식을 정확하게 표현할 수 있습니다.\r
  snippet: |-\r
    from sympy import oo\r
    constants = pi, E, oo\r
    constants\r
  exercise:\r
    prompt: 9단계. 수학 상수 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import oo\r
      constants = pi, E, oo\r
      constants\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 수학 상수의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 수학 상수 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step10_practical\r
  title: 10단계. 실전 예제\r
  structuredPrimary: true\r
  subtitle: 공식 계산\r
  goal: 10단계. 실전 예제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 실제 수학/과학 공식에 값을 대입하는 실전 예제입니다. 이차방정식의 판별식 b²-4ac로 근의 개수를 판단하고, 피타고라스 정리 √(a²+b²)로 빗변 길이를\r
    구하고, 복리 이자 공식 P(1+r)ⁿ으로 미래 가치를 계산합니다. 공식을 기호로 정의해두면 여러 값에 대해 재사용할 수 있어 효율적입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    a, b, c = symbols('a b c')\r
    discriminant = b**2 - 4*a*c\r
    disc1 = discriminant.subs({a: 1, b: 5, c: 6})\r
    disc1\r
  exercise:\r
    prompt: 10단계. 실전 예제 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      a, b, c = symbols('a b c')\r
      discriminant = b**2 - 4*a*c\r
      disc1 = discriminant.subs({a: 1, b: 5, c: 6})\r
      disc1\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 실전 예제의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 실전 예제 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 대입과 계산 연습\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    지금까지 배운 subs, evalf, N, simplify를 모두 활용하여 실전 문제를 풀어봅시다. 미션1은 원의 둘레와 넓이 공식에 값을 대입하고 비율을 분석합니다. 미션2는 물리학의 포물선 운동 방정식에 초기값을 대입하여 시간별 높이를 계산합니다. 각 미션은 독립적으로 실행 가능하므로 원하는 것부터 시작하세요.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from sympy import symbols, pi, Rational, simplify\r
\r
    radius = symbols('radius')\r
\r
    perimeter = 2 * pi * radius\r
    surface = pi * radius**2\r
\r
    perim5 = perimeter.subs(radius, 5)\r
    surf5 = surface.subs(radius, 5)\r
    perim5, surf5\r
  exercise:\r
    prompt: 실습 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, pi, Rational, simplify\r
\r
      radius = symbols('radius')\r
\r
      perimeter = 2 * pi * radius\r
      surface = pi * radius**2\r
\r
      perim5 = perimeter.subs(radius, 5)\r
      surf5 = surface.subs(radius, 5)\r
      perim5, surf5\r
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