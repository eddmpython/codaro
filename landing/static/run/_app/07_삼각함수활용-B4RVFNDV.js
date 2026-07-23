var e=`meta:\r
  packages:\r
  - sympy\r
  id: sympy_07\r
  title: 삼각함수활용\r
  order: 7\r
  category: sympy\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - sympy\r
  - sin\r
  - cos\r
  - tan\r
  - 삼각함수\r
  - 항등식\r
  seo:\r
    title: SymPy 삼각함수 - 항등식과 방정식 풀이\r
    description: SymPy로 삼각함수 항등식을 정리하고 삼각방정식을 풉니다. sin, cos, tan과 역삼각함수를 배웁니다.\r
    keywords:\r
    - sympy\r
    - sin\r
    - cos\r
    - tan\r
    - 삼각함수\r
    - 항등식\r
    - 역삼각함수\r
intro:\r
  emoji: 📐\r
  goal: 삼각함수 항등식을 정리하고 삼각방정식을 풀어봅니다.\r
  description: 삼각함수는 주기적인 현상(파동, 진동, 회전)을 수학적으로 표현하는 핵심 도구입니다. sin, cos, tan은 각도를 입력받아 비율을 반환하고, 역삼각함수는\r
    그 반대입니다. SymPy는 sin²x + cos²x = 1 같은 항등식을 자동으로 적용하여 복잡한 수식을 간소화합니다. 덧셈정리 sin(a+b) = sin(a)cos(b) +\r
    cos(a)sin(b), 배각공식 sin(2x) = 2sin(x)cos(x)도 자동 처리됩니다. 이 프로젝트를 완료하면 삼각함수 수식 정리, 삼각방정식 풀이, 삼각함수 미적분까지\r
    다룰 수 있게 됩니다.\r
  direction: 삼각함수활용에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 수식과 기호 확인 후 기호 계산에 맞는 코드 입력을 고릅니다.\r
  - 삼각함수활용 결과를 간소화식, 해, 미분/적분 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 수학 계산 검증 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(수식과 기호)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기본 삼각함수 처리 실행\r
      detail: 기호 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 피타고라스 항등식 결과 검증\r
      detail: 간소화식, 해, 미분/적분 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 삼각함수활용 재사용\r
      detail: 완성 코드를 수학 계산 검증 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 기호 계산 환경\r
      detail: sympy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 삼각함수활용 실행\r
      detail: 셀을 실행해 간소화식, 해, 미분/적분 결과와 예외 상태를 확인합니다.\r
    - label: 삼각함수활용 완료\r
      detail: 검증된 코드를 수학 계산 검증 루틴로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 삼각함수 작업에 필요한 함수들을 불러옵니다. sin, cos, tan은 기본 삼각함수이고, cot, sec, csc는 역수 관계입니다. asin, acos,\r
    atan은 역삼각함수로 각도를 구합니다. trigsimp()는 sin²+cos²=1 같은 항등식을 적용하여 수식을 간소화하고, expand_trig()는 sin(a+b) 같은\r
    합성을 풀어헤칩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sympy import symbols, sin, cos, tan, cot, sec, csc\r
    from sympy import asin, acos, atan, atan2\r
    from sympy import pi, sqrt, Rational, simplify\r
    from sympy import trigsimp, expand_trig, solve, diff, integrate\r
    from sympy import init_printing\r
    init_printing()\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, sin, cos, tan, cot, sec, csc\r
      from sympy import asin, acos, atan, atan2\r
      from sympy import pi, sqrt, Rational, simplify\r
      from sympy import trigsimp, expand_trig, solve, diff, integrate\r
      from sympy import init_printing\r
      init_printing()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 라이브러리 불러오기의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step2_basic\r
  title: 2단계. 기본 삼각함수\r
  structuredPrimary: true\r
  subtitle: sin, cos, tan\r
  goal: 2단계. 기본 삼각함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    sin, cos, tan은 직각삼각형의 변의 비율로 정의됩니다. 30°(π/6), 45°(π/4), 60°(π/3) 같은 특수각의 삼각비는 √2, √3을 포함한 정확한 값으로 표현됩니다. sin(π/6) = 1/2, cos(π/4) = √2/2, tan(π/3) = √3입니다. SymPy는 이 값들을 소수가 아닌 기호로 정확하게 표현합니다. tan(x) = sin(x)/cos(x) 관계도 자동으로 인식합니다.\r
\r
    sin(π/6) = 1/2, cos(π/4) = √2/2, tan(π/3) = √3입니다. SymPy는 정확한 값을 기호로 표현합니다.\r
  snippet: x = symbols('x')\r
  exercise:\r
    prompt: 2단계. 기본 삼각함수 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: x = symbols('x')\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 기본 삼각함수의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 기본 삼각함수 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step3_identity\r
  title: 3단계. 피타고라스 항등식\r
  structuredPrimary: true\r
  subtitle: sin² + cos² = 1\r
  goal: 3단계. 피타고라스 항등식에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    피타고라스 항등식 sin²x + cos²x = 1은 단위원에서 유도되는 가장 기본적인 관계입니다. 모든 x에 대해 성립하며, 이를 변형하면 tan²x + 1 = sec²x, 1 + cot²x = csc²x도 얻습니다. trigsimp()는 이 항등식을 자동으로 적용합니다. sin⁴x + 2sin²x·cos²x + cos⁴x = (sin²x + cos²x)² = 1도 계산합니다.\r
\r
    trigsimp()는 삼각함수 수식을 간소화합니다. 피타고라스 항등식을 적용하여 sin²+cos²=1로 변환합니다.\r
  snippet: |-\r
    identity = sin(x)**2 + cos(x)**2\r
    result = trigsimp(identity)\r
    result\r
  exercise:\r
    prompt: 3단계. 피타고라스 항등식 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      identity = sin(x)**2 + cos(x)**2\r
      result = trigsimp(identity)\r
      result\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 피타고라스 항등식의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 피타고라스 항등식 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step4_addition\r
  title: 4단계. 덧셈정리\r
  structuredPrimary: true\r
  subtitle: sin(a+b), cos(a+b)\r
  goal: 4단계. 덧셈정리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    덧셈정리는 두 각의 합/차에 대한 삼각함수를 개별 각의 삼각함수로 표현합니다. sin(a+b) = sin(a)cos(b) + cos(a)sin(b), cos(a+b) = cos(a)cos(b) - sin(a)sin(b)입니다. expand_trig()는 합성 각을 분리하고, trigsimp()는 분리된 형태를 다시 합칩니다. 이 공식은 벡터의 회전, 신호 처리, 푸리에 분석의 기초가 됩니다.\r
\r
    sin(a+b) = sin(a)cos(b) + cos(a)sin(b), cos(a+b) = cos(a)cos(b) - sin(a)sin(b)입니다. expand_trig()가 자동 적용합니다.\r
  tips:\r
  - sin(a+b) = sin(a)cos(b) + cos(a)sin(b), cos(a+b) = cos(a)cos(b) - sin(a)sin(b)입니다. expand_trig()가\r
    자동 적용합니다.\r
  snippet: a, b = symbols('a b')\r
  exercise:\r
    prompt: 4단계. 덧셈정리 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: a, b = symbols('a b')\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 덧셈정리의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 덧셈정리 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step5_double\r
  title: 5단계. 배각공식\r
  structuredPrimary: true\r
  subtitle: sin(2x), cos(2x)\r
  goal: 5단계. 배각공식에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 배각공식은 덧셈정리에서 a=b=x를 대입하여 유도됩니다. sin(2x) = 2sin(x)cos(x), cos(2x) = cos²x - sin²x = 2cos²x\r
    - 1 = 1 - 2sin²x입니다. 3배각, 4배각 공식도 expand_trig()로 전개됩니다. 반각공식 cos²x = (1+cos(2x))/2는 적분에서 자주 사용됩니다.\r
    이 공식들은 적분 계산과 삼각방정식 풀이에 필수적입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    s2x = expand_trig(sin(2*x))\r
    c2x = expand_trig(cos(2*x))\r
    s2x, c2x\r
  exercise:\r
    prompt: 5단계. 배각공식 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      s2x = expand_trig(sin(2*x))\r
      c2x = expand_trig(cos(2*x))\r
      s2x, c2x\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 배각공식의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 배각공식 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step6_inverse\r
  title: 6단계. 역삼각함수\r
  structuredPrimary: true\r
  subtitle: asin, acos, atan\r
  goal: 6단계. 역삼각함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    역삼각함수는 비율로부터 각도를 구합니다. asin(1/2)는 sin(θ)=1/2인 θ=π/6을 반환합니다. asin의 범위는 [-π/2, π/2], acos는 [0, π], atan은 (-π/2, π/2)입니다. sin(asin(x)) = x는 항상 성립하지만, asin(sin(x)) = x는 범위 내에서만 성립합니다. 역삼각함수의 미분 d/dx asin(x) = 1/√(1-x²)은 적분에서 자주 등장합니다.\r
\r
    asin(1/2) = π/6, acos(√2/2) = π/4, atan(1) = π/4입니다. 역삼각함수의 미분은 1/√(1-x²) 형태입니다.\r
  snippet: |-\r
    asin1 = asin(Rational(1, 2))\r
    acos1 = acos(sqrt(2)/2)\r
    atan1 = atan(1)\r
    asin1, acos1, atan1\r
  exercise:\r
    prompt: 6단계. 역삼각함수 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      asin1 = asin(Rational(1, 2))\r
      acos1 = acos(sqrt(2)/2)\r
      atan1 = atan(1)\r
      asin1, acos1, atan1\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 역삼각함수의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 역삼각함수 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step7_equations\r
  title: 7단계. 삼각방정식\r
  structuredPrimary: true\r
  subtitle: solve() 활용\r
  goal: 7단계. 삼각방정식에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    삼각방정식 sin(x) = 1/2의 해는 x = π/6 + 2nπ 또는 x = 5π/6 + 2nπ로 무한히 많습니다. solve()는 주기성을 제외한 주값(principal value)을 반환합니다. 복합 방정식 2sin(x)cos(x) = 1은 sin(2x) = 1로 변환되어 x = π/4가 됩니다. SymPy는 항등식을 활용하여 복잡한 삼각방정식도 풉니다.\r
\r
    삼각방정식의 해는 주기성이 있어 무한히 많습니다. SymPy는 주값(principal value)을 반환합니다.\r
  snippet: |-\r
    sol1 = solve(sin(x) - Rational(1, 2), x)\r
    sol1\r
  exercise:\r
    prompt: 7단계. 삼각방정식 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      sol1 = solve(sin(x) - Rational(1, 2), x)\r
      sol1\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 삼각방정식의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 삼각방정식 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step8_calculus\r
  title: 8단계. 삼각함수 미적분\r
  structuredPrimary: true\r
  subtitle: 미분과 적분\r
  goal: 8단계. 삼각함수 미적분에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 삼각함수의 미분은 순환 패턴을 따릅니다. (sin x)' = cos x, (cos x)' = -sin x, (-sin x)' = -cos x, (-cos x)'\r
    = sin x입니다. (tan x)' = sec²x = 1/cos²x입니다. 적분은 미분의 역과정으로 ∫sin(x)dx = -cos(x), ∫cos(x)dx = sin(x)입니다.\r
    이 패턴을 이해하면 복잡한 삼각함수 미적분도 쉽게 풀 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    dsin = diff(sin(x), x)\r
    dcos = diff(cos(x), x)\r
    dtan = diff(tan(x), x)\r
    dsin, dcos, simplify(dtan)\r
  exercise:\r
    prompt: 8단계. 삼각함수 미적분 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      dsin = diff(sin(x), x)\r
      dcos = diff(cos(x), x)\r
      dtan = diff(tan(x), x)\r
      dsin, dcos, simplify(dtan)\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 삼각함수 미적분의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 삼각함수 미적분 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step9_product\r
  title: 9단계. 곱을 합으로\r
  structuredPrimary: true\r
  subtitle: 적분 기법\r
  goal: 9단계. 곱을 합으로에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 삼각함수의 곱을 합차로 변환하면 적분이 쉬워집니다. sin(a)cos(b) = (sin(a+b) + sin(a-b))/2, cos(a)cos(b) = (cos(a+b)\r
    + cos(a-b))/2입니다. sin(x)sin(2x)의 적분은 직접 하기 어렵지만, 곱을 합으로 변환하면 각 항을 개별 적분할 수 있습니다. cos²x의 적분도 반각공식 (1+cos(2x))/2를\r
    사용하면 x/2 + sin(2x)/4가 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    prod = sin(a)*cos(b)\r
    expanded = expand_trig(prod)\r
    expanded\r
  exercise:\r
    prompt: 9단계. 곱을 합으로 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      prod = sin(a)*cos(b)\r
      expanded = expand_trig(prod)\r
      expanded\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 곱을 합으로의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 곱을 합으로 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step10_applications\r
  title: 10단계. 응용 문제\r
  structuredPrimary: true\r
  subtitle: 물리와 공학\r
  goal: 10단계. 응용 문제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 삼각함수는 물리학의 진동과 파동을 수학적으로 표현합니다. 단진동 x(t) = A·sin(ωt)에서 속도 v = Aω·cos(ωt), 가속도 a = -Aω²·sin(ωt)\r
    = -ω²x입니다. 가속도가 위치에 비례하고 반대 방향인 것이 진동의 특성입니다. sin(x) + cos(x) = √2·sin(x + π/4)로 합성하면 진폭과 위상을 알 수\r
    있습니다. 이 원리는 전자회로, 음향공학, 구조역학에 널리 적용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    t, A, omega = symbols('t A omega', positive=True)\r
    position = A*sin(omega*t)\r
    velocity = diff(position, t)\r
    accel = diff(velocity, t)\r
    position, velocity, simplify(accel)\r
  exercise:\r
    prompt: 10단계. 응용 문제 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      t, A, omega = symbols('t A omega', positive=True)\r
      position = A*sin(omega*t)\r
      velocity = diff(position, t)\r
      accel = diff(velocity, t)\r
      position, velocity, simplify(accel)\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 응용 문제의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 응용 문제 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 삼각함수 연습\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    이제 삼각함수의 항등식, 방정식, 미적분을 종합적으로 연습합니다. 미션1에서는 피타고라스 항등식의 변형들을 정리합니다. (1-cos²θ)/sinθ = sinθ임을 확인하고, sin⁴θ - cos⁴θ가 간단히 정리됨을 봅니다. 미션2에서는 sin(φ)+cos(φ)=0인 방정식을 풀고, sin³φ를 미분하고, sinφ·cos²φ를 적분합니다. 이 연습들은 물리학과 공학 문제의 기초가 됩니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from sympy import symbols, sin, cos, tan, trigsimp, expand_trig, simplify\r
\r
    theta = symbols('theta')\r
\r
    form1 = (1 - cos(theta)**2)/sin(theta)\r
    simp1 = trigsimp(form1)\r
    simp1\r
  exercise:\r
    prompt: 실습 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, sin, cos, tan, trigsimp, expand_trig, simplify\r
\r
      theta = symbols('theta')\r
\r
      form1 = (1 - cos(theta)**2)/sin(theta)\r
      simp1 = trigsimp(form1)\r
      simp1\r
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