var e=`meta:\r
  packages:\r
  - sympy\r
  id: sympy_01\r
  title: 기초수식계산\r
  order: 1\r
  category: sympy\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - sympy\r
  - symbols\r
  - expand\r
  - factor\r
  - simplify\r
  seo:\r
    title: SymPy 기초 - 기호 정의와 수식 정리\r
    description: SymPy로 기호를 정의하고 수식을 전개, 인수분해, 간소화합니다. 기호 수학의 첫걸음을 배웁니다.\r
    keywords:\r
    - sympy\r
    - symbols\r
    - expand\r
    - factor\r
    - simplify\r
    - 기호수학\r
intro:\r
  emoji: ✏️\r
  goal: 기호를 정의하고 수식을 만들어 전개, 인수분해, 간소화를 수행합니다.\r
  description: SymPy의 핵심은 기호(symbol)입니다. 일반 계산기는 숫자만 다루지만, SymPy는 x, y 같은 미지수를 그대로 수식으로 다룹니다. 중고등학교에서\r
    손으로 했던 (x+1)² = x²+2x+1 전개, x²-1 = (x+1)(x-1) 인수분해를 SymPy가 정확하게 수행합니다. 복잡한 분수식 약분, 동류항 정리까지 한 줄의 코드로\r
    해결됩니다. 이 프로젝트를 완료하면 어떤 다항식이든 전개하고 인수분해하며, 복잡한 수식을 간결하게 정리할 수 있게 됩니다.\r
  direction: 기초수식계산에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 수식과 기호 확인 후 기호 계산에 맞는 코드 입력을 고릅니다.\r
  - 기초수식계산 결과를 간소화식, 해, 미분/적분 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 수학 계산 검증 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(수식과 기호)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기호 정의 처리 실행\r
      detail: 기호 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 수식 생성 결과 검증\r
      detail: 간소화식, 해, 미분/적분 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 기초수식계산 재사용\r
      detail: 완성 코드를 수학 계산 검증 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 기호 계산 환경\r
      detail: sympy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 기초수식계산 실행\r
      detail: 셀을 실행해 간소화식, 해, 미분/적분 결과와 예외 상태를 확인합니다.\r
    - label: 기초수식계산 완료\r
      detail: 검증된 코드를 수학 계산 검증 루틴로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: SymPy는 파이썬의 기호 수학 라이브러리입니다. symbols로 변수를 정의하고, expand, factor, simplify로 수식을 조작합니다. sqrt와\r
    Rational은 제곱근과 분수를 정확하게 표현합니다. init_printing()을 호출하면 수식이 수학 교과서처럼 예쁘게 출력됩니다. 웹 환경에서는 LaTeX 렌더링으로 x²\r
    같은 표현이 그대로 보입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sympy import symbols, expand, factor, simplify, collect, sqrt, Rational\r
    from sympy import init_printing\r
    init_printing()\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, expand, factor, simplify, collect, sqrt, Rational\r
      from sympy import init_printing\r
      init_printing()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 라이브러리 불러오기의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step2_symbol\r
  title: 2단계. 기호 정의\r
  structuredPrimary: true\r
  subtitle: symbols()\r
  goal: 2단계. 기호 정의에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    symbols() 함수로 수학에서 사용하는 미지수를 만듭니다. x = symbols('x')를 실행하면 x는 더 이상 파이썬 변수가 아니라 수학 기호가 됩니다. 이 기호는 값이 정해지지 않은 상태로 수식에 참여합니다. 방정식의 미지수, 함수의 변수 등 모든 수학적 계산의 출발점입니다. y, z처럼 여러 기호가 필요하면 한 번에 정의할 수 있어 편리합니다.\r
\r
    symbols('x y z')처럼 공백으로 구분하면 여러 기호를 한 번에 만들 수 있습니다. 반환값을 같은 수의 변수에 할당합니다.\r
  snippet: |-\r
    x = symbols('x')\r
    x\r
  exercise:\r
    prompt: 2단계. 기호 정의 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      x = symbols('x')\r
      x\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 기호 정의의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 기호 정의 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step3_expr\r
  title: 3단계. 수식 생성\r
  structuredPrimary: true\r
  subtitle: 기본 연산\r
  goal: 3단계. 수식 생성에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    정의한 기호로 수식(expression)을 만듭니다. 파이썬의 +, -, *, / 연산자를 그대로 사용하고, 거듭제곱은 **를 씁니다. x**2 + 2*x + 1처럼 작성하면 SymPy가 자동으로 수학 수식 객체를 생성합니다. 이 수식은 단순한 문자열이 아니라, 전개, 인수분해, 미분 등 다양한 수학 연산이 가능한 객체입니다. 여러 변수를 섞어 다변수 다항식도 만들 수 있습니다.\r
\r
    SymPy 수식에서 곱셈은 *를 명시해야 합니다. 2x가 아니라 2*x로 씁니다. 거듭제곱 x²는 x**2로 표현합니다.\r
  snippet: |-\r
    expr = x**2 + 2*x + 1\r
    expr\r
  exercise:\r
    prompt: 3단계. 수식 생성 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      expr = x**2 + 2*x + 1\r
      expr\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 수식 생성의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 수식 생성 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step4_expand\r
  title: 4단계. 수식 전개\r
  structuredPrimary: true\r
  subtitle: expand()\r
  goal: 4단계. 수식 전개에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    expand()는 괄호를 풀어 전개하는 함수입니다. 중학교에서 배운 곱셈 공식 (a+b)² = a²+2ab+b²를 자동으로 적용합니다. 손으로 계산하면 실수하기 쉬운 (x+y)³ 같은 복잡한 전개도 정확하게 처리합니다. 물리학에서 테일러 급수 전개 후 정리할 때, 공학에서 제어 시스템 전달함수를 분석할 때 등 실무에서도 자주 사용됩니다. 복잡한 곱셈을 풀어헤쳐 각 항을 명확하게 보고 싶을 때 expand()를 사용합니다.\r
\r
    expand()는 분배법칙을 적용하여 모든 괄호를 풉니다. 복잡한 곱셈도 한 번에 전개할 수 있습니다.\r
  snippet: |-\r
    squared = (x + 1)**2\r
    expanded = expand(squared)\r
    expanded\r
  exercise:\r
    prompt: 4단계. 수식 전개 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      squared = (x + 1)**2\r
      expanded = expand(squared)\r
      expanded\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 수식 전개의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 수식 전개 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step5_factor\r
  title: 5단계. 인수분해\r
  structuredPrimary: true\r
  subtitle: factor()\r
  goal: 5단계. 인수분해에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    factor()는 expand()의 역연산으로, 다항식을 인수들의 곱으로 분해합니다. x²-1을 (x+1)(x-1)로, x²+5x+6을 (x+2)(x+3)으로 만듭니다. 인수분해는 방정식을 풀 때 핵심 기법입니다. x²-1=0을 (x+1)(x-1)=0으로 바꾸면 x=-1 또는 x=1이라는 해를 쉽게 찾을 수 있습니다. 복잡한 분수식을 약분하거나, 다항식의 근을 찾거나, 수식을 간결하게 표현할 때 factor()를 사용합니다.\r
\r
    factor()는 정수 계수 범위에서 인수분해합니다. 인수분해가 불가능하면 원래 수식을 그대로 반환합니다.\r
  snippet: |-\r
    diff2 = x**2 - 1\r
    factored = factor(diff2)\r
    factored\r
  exercise:\r
    prompt: 5단계. 인수분해 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      diff2 = x**2 - 1\r
      factored = factor(diff2)\r
      factored\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 인수분해의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 인수분해 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step6_simplify\r
  title: 6단계. 수식 간소화\r
  structuredPrimary: true\r
  subtitle: simplify()\r
  goal: 6단계. 수식 간소화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    simplify()는 수식을 가장 간단한 형태로 자동 정리합니다. 분수 (x²-1)/(x-1)을 x+1로 약분하고, 동류항을 합치고, 삼각함수 항등식 sin²x+cos²x=1을 적용합니다. expand()나 factor()와 달리 특정 방향으로 변환하는 것이 아니라, 가장 짧고 깔끔한 표현을 자동으로 찾아줍니다. 복잡한 계산 결과를 정리할 때, 답안을 검증할 때, 수식을 읽기 쉽게 만들 때 유용합니다.\r
\r
    simplify()는 다양한 기법을 시도하여 가장 짧은 표현을 찾습니다. 때로는 expand()나 factor()가 더 적절할 수 있습니다.\r
  snippet: |-\r
    frac = (x**2 - 1)/(x - 1)\r
    simplified = simplify(frac)\r
    simplified\r
  exercise:\r
    prompt: 6단계. 수식 간소화 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      frac = (x**2 - 1)/(x - 1)\r
      simplified = simplify(frac)\r
      simplified\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 수식 간소화의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 수식 간소화 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step7_collect\r
  title: 7단계. 변수로 정리\r
  structuredPrimary: true\r
  subtitle: collect()\r
  goal: 7단계. 변수로 정리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    collect()는 특정 변수를 기준으로 수식을 정리합니다. x*y + x² + 2*x + y*x² 같은 복잡한 다변수 수식을 x로 정리하면 x²(1+y) + x(2+y)처럼 x의 거듭제곱별로 계수가 묶입니다. 물리학에서 여러 매개변수가 섞인 수식을 특정 변수 관점으로 정리할 때, 미분방정식의 계수를 파악할 때 자주 사용합니다. expand()로 펼친 수식을 다시 특정 구조로 재정리하고 싶을 때 collect()가 유용합니다.\r
\r
    collect(expr, x)는 x의 거듭제곱별로 계수를 묶습니다. 여러 변수가 있을 때 특정 변수 기준으로 정리하고 싶을 때 사용합니다.\r
  snippet: |-\r
    y = symbols('y')\r
    mixed = x*y + x**2 + 2*x + y*x**2\r
    byX = collect(mixed, x)\r
    byX\r
  exercise:\r
    prompt: 7단계. 변수로 정리 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      y = symbols('y')\r
      mixed = x*y + x**2 + 2*x + y*x**2\r
      byX = collect(mixed, x)\r
      byX\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 변수로 정리의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 변수로 정리 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step8_rational\r
  title: 8단계. 정확한 분수\r
  structuredPrimary: true\r
  subtitle: Rational()\r
  goal: 8단계. 정확한 분수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    Rational()은 분수를 정확하게 표현합니다. 파이썬에서 1/3을 계산하면 0.3333333...으로 근사되어 오차가 발생합니다. 하지만 Rational(1, 3)은 정확히 1/3 그 자체를 유지합니다. Rational(1,3) + Rational(1,6) = Rational(1,2)처럼 분수 연산도 정확합니다. 과학 계산에서 반올림 오차가 누적되면 결과가 틀어질 수 있는데, Rational을 사용하면 최종 결과까지 정확한 값을 유지할 수 있습니다.\r
\r
    파이썬의 1/3은 0.333...으로 근사됩니다. Rational(1, 3)은 정확한 1/3을 유지합니다. 기호 수학에서는 정확한 값이 중요합니다.\r
  snippet: |-\r
    half = Rational(1, 2)\r
    third = Rational(1, 3)\r
    half, third\r
  exercise:\r
    prompt: 8단계. 정확한 분수 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      half = Rational(1, 2)\r
      third = Rational(1, 3)\r
      half, third\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 정확한 분수의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 정확한 분수 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step9_sqrt\r
  title: 9단계. 제곱근\r
  structuredPrimary: true\r
  subtitle: sqrt()\r
  goal: 9단계. 제곱근에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: sqrt()는 제곱근을 기호로 표현합니다. 파이썬의 math.sqrt(2)는 1.4142135...로 근사하지만, SymPy의 sqrt(2)는 √2 그 자체를\r
    유지합니다. sqrt(2) * sqrt(8) = sqrt(16) = 4처럼 제곱근끼리의 연산도 정확하게 처리합니다. 기하학에서 정확한 대각선 길이, 물리학에서 무리수가 포함된\r
    공식을 다룰 때 근사 없이 정확한 값을 유지할 수 있습니다. simplify()와 함께 사용하면 복잡한 제곱근 수식도 깔끔하게 정리됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    root2 = sqrt(2)\r
    root2\r
  exercise:\r
    prompt: 9단계. 제곱근 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      root2 = sqrt(2)\r
      root2\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 제곱근의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 제곱근 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step10_combine\r
  title: 10단계. 종합 예제\r
  structuredPrimary: true\r
  subtitle: 함께 사용하기\r
  goal: 10단계. 종합 예제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 지금까지 배운 expand(), factor(), simplify(), collect()를 조합하면 어떤 복잡한 수식도 원하는 형태로 변환할 수 있습니다.\r
    실제 수학 문제에서는 전개 후 정리, 인수분해 후 약분 등 여러 단계를 거칩니다. (a+b)²(a-b)를 전개하고, 그 결과를 다시 인수분해하면 원래 형태로 돌아오는지 확인할\r
    수 있습니다. 이렇게 역변환으로 검증하는 습관은 수학 계산의 정확성을 보장합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    a, b = symbols('a b')\r
    comb = (a + b)**2 * (a - b)\r
    step1 = expand(comb)\r
    step1\r
  exercise:\r
    prompt: 10단계. 종합 예제 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      a, b = symbols('a b')\r
      comb = (a + b)**2 * (a - b)\r
      step1 = expand(comb)\r
      step1\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 종합 예제의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 종합 예제 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 수식 조작 연습\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    지금까지 배운 symbols, expand, factor, simplify, collect를 모두 활용하여 실전 문제를 풀어봅시다. 미션1은 곱셈 공식의 전개와 인수분해를 연습합니다. (p+q)⁴ 같은 고차 전개도 SymPy면 한 줄입니다. 미션2는 분수식의 간소화를 다룹니다. 분자분모를 인수분해하고 약분하는 과정을 SymPy가 자동으로 처리합니다. 각 미션은 독립적으로 실행 가능하므로 원하는 것부터 시작하세요.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from sympy import symbols, expand, factor\r
\r
    p, q = symbols('p q')\r
\r
    formula = (p + q)**4\r
    spread = expand(formula)\r
    spread\r
  exercise:\r
    prompt: 실습 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, expand, factor\r
\r
      p, q = symbols('p q')\r
\r
      formula = (p + q)**4\r
      spread = expand(formula)\r
      spread\r
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