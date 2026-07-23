var e=`meta:
  packages:
  - sympy
  id: sympy_02
  title: 대입과계산
  order: 2
  category: sympy
  difficulty: ⭐
  badge: 입문
  tags:
  - sympy
  - subs
  - evalf
  - N
  - 대입
  - 수치계산
  seo:
    title: SymPy 대입과 계산 - subs, evalf 사용법
    description: SymPy로 수식에 값을 대입하고 수치 계산을 수행합니다. subs()와 evalf()로 기호에서 숫자로 변환하는 방법을 배웁니다.
    keywords:
    - sympy
    - subs
    - evalf
    - 대입
    - 수치계산
    - N
intro:
  emoji: 🔢
  goal: 수식에 값을 대입하고 수치 계산을 수행합니다.
  description: 기호 수학의 진정한 힘은 수식을 만든 후 원하는 값을 대입할 수 있다는 점입니다. 원의 넓이 πr²을 공식으로 정의해두고, r=5일 때, r=10일 때 값을
    바로 계산할 수 있습니다. subs()로 기호에 값을 대입하고, evalf()로 π나 √2 같은 무리수를 소수점으로 변환합니다. 물리 공식에 측정값을 넣거나, 수학 함수의 특정
    점에서 값을 구하거나, 복잡한 계산을 단계별로 검증할 때 이 기능들이 핵심입니다.
  direction: 대입과계산에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 수식과 기호 확인 후 기호 계산에 맞는 코드 입력을 고릅니다.
  - 대입과계산 결과를 간소화식, 해, 미분/적분 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 수학 계산 검증 루틴에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(수식과 기호)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 기본 대입 처리 실행
      detail: 기호 계산 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 기호로 대입 결과 검증
      detail: 간소화식, 해, 미분/적분 결과 기준으로 실행 결과를 비교합니다.
    - label: 대입과계산 재사용
      detail: 완성 코드를 수학 계산 검증 루틴에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기호 계산 환경
      detail: sympy 기준으로 로컬 Python 실행을 준비합니다.
    - label: 대입과계산 실행
      detail: 셀을 실행해 간소화식, 해, 미분/적분 결과와 예외 상태를 확인합니다.
    - label: 대입과계산 완료
      detail: 검증된 코드를 수학 계산 검증 루틴로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.
  explanation: SymPy에서 기호 정의, 수식 조작, 대입과 수치 계산에 필요한 함수들을 불러옵니다. 이번 프로젝트에서는 subs()와 evalf()가 핵심입니다. pi는
    원주율 3.14159..., E는 자연상수 2.71828...을 정확한 기호로 제공합니다. N()은 evalf()의 간편 버전으로, 수식을 빠르게 수치로 변환할 때 사용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from sympy import symbols, expand, factor, simplify, sqrt, Rational
    from sympy import pi, E, N
    from sympy import init_printing
    init_printing()
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.
    starterCode: |-
      from sympy import symbols, expand, factor, simplify, sqrt, Rational
      from sympy import pi, E, N
      from sympy import init_printing
      init_printing()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 1단계. 라이브러리 불러오기의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.
- id: step2_subs_basic
  title: 2단계. 기본 대입
  structuredPrimary: true
  subtitle: subs()
  goal: 2단계. 기본 대입에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.
  explanation: |-
    subs()는 substitute(대입)의 줄임말입니다. expr.subs(x, 3)은 수식 expr에서 x를 3으로 바꿉니다. 중요한 점은 원본 수식이 변경되지 않고 새로운 수식이 반환된다는 것입니다. 같은 공식에 여러 값을 대입해 비교할 때 원본을 보존하는 이 특성이 유용합니다. 예를 들어 이차함수 f(x) = x²+2x+1에서 f(0), f(1), f(2)를 각각 구할 수 있습니다.

    subs(기호, 값) 형식으로 사용합니다. 반환되는 것은 새로운 수식이며, 원본 expr은 그대로 유지됩니다.
  snippet: |-
    x = symbols('x')
    expr = x**2 + 2*x + 1
    expr
  exercise:
    prompt: 2단계. 기본 대입 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.
    starterCode: |-
      x = symbols('x')
      expr = x**2 + 2*x + 1
      expr
    hints:
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.
  check:
    noError: 2단계. 기본 대입의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.
    resultCheck: 2단계. 기본 대입 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.
- id: step3_subs_symbol
  title: 3단계. 기호로 대입
  structuredPrimary: true
  subtitle: 기호 치환
  goal: 3단계. 기호로 대입에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.
  explanation: |-
    subs()는 숫자뿐 아니라 다른 기호나 수식으로도 대입할 수 있습니다. x를 y로 바꾸면 변수명 변경, x를 y+1로 바꾸면 수식 변환이 됩니다. 이 기능은 수학에서 변수 치환(substitution)이라고 부르는 중요한 기법입니다. 예를 들어 적분에서 u = x+1로 치환하거나, 좌표 변환에서 x를 r*cos(θ)로 바꾸는 것과 같습니다.

    x를 y+1로 대입하면 (y+1)²+2(y+1)+1이 됩니다. expand()로 전개하면 정리된 결과를 얻습니다.
  snippet: |-
    y = symbols('y')
    replaced = expr.subs(x, y)
    replaced
  exercise:
    prompt: 3단계. 기호로 대입 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.
    starterCode: |-
      y = symbols('y')
      replaced = expr.subs(x, y)
      replaced
    hints:
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.
  check:
    noError: 3단계. 기호로 대입의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.
    resultCheck: 3단계. 기호로 대입 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.
- id: step4_subs_multiple
  title: 4단계. 여러 값 대입
  structuredPrimary: true
  subtitle: 딕셔너리 사용
  goal: 4단계. 여러 값 대입에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.
  explanation: |-
    여러 기호에 동시에 값을 대입할 때는 파이썬 딕셔너리를 사용합니다. {x: 1, y: 2, z: 3} 형식으로 전달하면 x, y, z 모두 한 번에 대입됩니다. 물리 공식에서 여러 상수(중력가속도, 질량, 속도 등)를 동시에 넣거나, 연립방정식의 해를 검증할 때 유용합니다. 일부 기호만 대입하고 나머지는 기호로 남겨둘 수도 있어, 단계별로 계산을 진행할 때 편리합니다.

    딕셔너리에 포함되지 않은 기호는 그대로 남습니다. 단계별로 값을 대입할 때 유용합니다.
  snippet: |-
    z = symbols('z')
    multi = x**2 + y**2 + z
    multi
  exercise:
    prompt: 4단계. 여러 값 대입 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.
    starterCode: |-
      z = symbols('z')
      multi = x**2 + y**2 + z
      multi
    hints:
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.
  check:
    noError: 4단계. 여러 값 대입의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.
    resultCheck: 4단계. 여러 값 대입 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.
- id: step5_evalf
  title: 5단계. 수치 계산
  structuredPrimary: true
  subtitle: evalf()
  goal: 5단계. 수치 계산에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.
  explanation: |-
    evalf()는 evaluate float의 줄임말로, 수식을 부동소수점 숫자로 계산합니다. √2는 1.4142135..., π는 3.1415926...으로 변환됩니다. 기본 정밀도는 15자리이지만, evalf(50)처럼 원하는 자릿수를 지정할 수 있습니다. 과학 계산에서 고정밀도가 필요하거나, 결과를 소수점으로 확인하고 싶을 때 사용합니다. 기호 계산으로 정확한 답을 구한 후, 마지막에 evalf()로 수치 결과를 얻는 것이 권장 패턴입니다.

    evalf(n)에서 n은 유효숫자 개수입니다. 기본값은 15자리입니다. 고정밀 계산이 필요할 때 자릿수를 늘릴 수 있습니다.
  snippet: |-
    root2 = sqrt(2)
    decimal = root2.evalf()
    decimal
  exercise:
    prompt: 5단계. 수치 계산 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.
    starterCode: |-
      root2 = sqrt(2)
      decimal = root2.evalf()
      decimal
    hints:
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.
  check:
    noError: 5단계. 수치 계산의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.
    resultCheck: 5단계. 수치 계산 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.
- id: step6_N
  title: 6단계. N() 함수
  structuredPrimary: true
  subtitle: 간편 수치화
  goal: 6단계. N() 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.
  explanation: |-
    N()은 evalf()의 간편 버전입니다. expr.evalf() 대신 N(expr)처럼 함수 형태로 호출할 수 있습니다. 기능은 동일하지만, 여러 수식을 연속으로 수치화할 때 N(sqrt(2)), N(pi), N(E)처럼 간결하게 쓸 수 있어 편리합니다. N(expr, 20)처럼 정밀도 지정도 가능합니다.

    E는 자연상수 e(≈2.718...)입니다. SymPy에서 대문자 E로 사용합니다. exp(1)과 같습니다.
  snippet: |-
    val1 = N(sqrt(3))
    val1
  exercise:
    prompt: 6단계. N() 함수 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.
    starterCode: |-
      val1 = N(sqrt(3))
      val1
    hints:
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.
  check:
    noError: 6단계. N() 함수의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.
    resultCheck: 6단계. N() 함수 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.
- id: step7_combine
  title: 7단계. 대입 후 수치화
  structuredPrimary: true
  subtitle: subs + evalf
  goal: 7단계. 대입 후 수치화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.
  explanation: |-
    실제 계산에서는 subs()로 값을 대입한 후 evalf()로 수치 결과를 얻는 패턴을 가장 많이 사용합니다. circle.subs(x, 5).evalf()처럼 체이닝으로 한 줄에 처리할 수 있습니다. 원의 넓이 πr²에 r=5를 넣고 수치로 변환하면 78.5398...이 나옵니다. 피타고라스 정리로 빗변 길이를 구하거나, 복리 이자를 계산하는 등 실생활 공식에 이 패턴을 적용할 수 있습니다.

    .subs().evalf() 체이닝으로 대입과 수치화를 한 줄에 처리합니다. 수학 공식에 값을 넣어 결과를 구할 때 유용합니다.
  snippet: |-
    circle = pi * x**2
    area = circle.subs(x, 5).evalf()
    area
  exercise:
    prompt: 7단계. 대입 후 수치화 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.
    starterCode: |-
      circle = pi * x**2
      area = circle.subs(x, 5).evalf()
      area
    hints:
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.
  check:
    noError: 7단계. 대입 후 수치화의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.
    resultCheck: 7단계. 대입 후 수치화 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.
- id: step8_simplify_subs
  title: 8단계. 간소화 후 대입
  structuredPrimary: true
  subtitle: 효율적 계산
  goal: 8단계. 간소화 후 대입에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.
  explanation: |-
    복잡한 수식은 먼저 simplify()로 간소화한 후 값을 대입하면 효율적입니다. (x²-1)/(x-1)을 x+1로 간소화하면 계산이 훨씬 간단해집니다. 또한 간소화되지 않은 분수식에 특정 값(예: x=1)을 대입하면 0/0이 되어 문제가 생길 수 있지만, 간소화 후에는 정상적으로 계산됩니다. 과학 계산에서 수식이 복잡할수록 먼저 정리하는 것이 오류를 줄이는 좋은 습관입니다.

    (x²-1)/(x-1) = x+1로 간소화됩니다. 간소화 후 대입하면 더 깔끔하고 빠릅니다.
  snippet: |-
    messy = (x**2 - 1)/(x - 1)
    messy
  exercise:
    prompt: 8단계. 간소화 후 대입 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.
    starterCode: |-
      messy = (x**2 - 1)/(x - 1)
      messy
    hints:
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.
  check:
    noError: 8단계. 간소화 후 대입의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.
    resultCheck: 8단계. 간소화 후 대입 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.
- id: step9_constants
  title: 9단계. 수학 상수
  structuredPrimary: true
  subtitle: pi, E, oo
  goal: 9단계. 수학 상수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.
  explanation: |-
    SymPy는 π(pi), e(E), ∞(oo) 같은 수학 상수를 기호로 제공합니다. 이 상수들은 정확한 값을 유지하므로 2*pi는 2π로, pi**2는 π²로 표현됩니다. 구의 부피 (4/3)πr³ 같은 공식을 정확하게 표현하고, 마지막에 evalf()로 수치 결과를 얻을 수 있습니다. 무한대 oo는 극한 계산 등에서 사용됩니다.

    oo는 무한대(infinity)입니다. 극한 계산 등에서 사용합니다. pi*r²처럼 공식을 정확하게 표현할 수 있습니다.
  snippet: |-
    from sympy import oo
    constants = pi, E, oo
    constants
  exercise:
    prompt: 9단계. 수학 상수 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.
    starterCode: |-
      from sympy import oo
      constants = pi, E, oo
      constants
    hints:
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.
  check:
    noError: 9단계. 수학 상수의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.
    resultCheck: 9단계. 수학 상수 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.
- id: step10_practical
  title: 10단계. 실전 예제
  structuredPrimary: true
  subtitle: 공식 계산
  goal: 10단계. 실전 예제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.
  explanation: 실제 수학/과학 공식에 값을 대입하는 실전 예제입니다. 이차방정식의 판별식 b²-4ac로 근의 개수를 판단하고, 피타고라스 정리 √(a²+b²)로 빗변 길이를
    구하고, 복리 이자 공식 P(1+r)ⁿ으로 미래 가치를 계산합니다. 공식을 기호로 정의해두면 여러 값에 대해 재사용할 수 있어 효율적입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    a, b, c = symbols('a b c')
    discriminant = b**2 - 4*a*c
    disc1 = discriminant.subs({a: 1, b: 5, c: 6})
    disc1
  exercise:
    prompt: 10단계. 실전 예제 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.
    starterCode: |-
      a, b, c = symbols('a b c')
      discriminant = b**2 - 4*a*c
      disc1 = discriminant.subs({a: 1, b: 5, c: 6})
      disc1
    hints:
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.
  check:
    noError: 10단계. 실전 예제의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.
    resultCheck: 10단계. 실전 예제 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 대입과 계산 연습
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.
  explanation: |-
    지금까지 배운 subs, evalf, N, simplify를 모두 활용하여 실전 문제를 풀어봅시다. 미션1은 원의 둘레와 넓이 공식에 값을 대입하고 비율을 분석합니다. 미션2는 물리학의 포물선 운동 방정식에 초기값을 대입하여 시간별 높이를 계산합니다. 각 미션은 독립적으로 실행 가능하므로 원하는 것부터 시작하세요.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    from sympy import symbols, pi, Rational, simplify

    radius = symbols('radius')

    perimeter = 2 * pi * radius
    surface = pi * radius**2

    perim5 = perimeter.subs(radius, 5)
    surf5 = surface.subs(radius, 5)
    perim5, surf5
  exercise:
    prompt: 실습 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.
    starterCode: |-
      from sympy import symbols, pi, Rational, simplify

      radius = symbols('radius')

      perimeter = 2 * pi * radius
      surface = pi * radius**2

      perim5 = perimeter.subs(radius, 5)
      surf5 = surface.subs(radius, 5)
      perim5, surf5
    hints:
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.
  check:
    noError: 실습의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.
    resultCheck: 실습 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 손익분기 수식을 기호로 검증하기'
  structuredPrimary: true
  subtitle: 예측 → 수식 구성 → 오류 수정 → 결과 검증 → 실무 변주
  goal: '현업 흐름 검증: 손익분기 수식을 기호로 검증하기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: SymPy는 계산기를 대신하는 도구가 아니라, 업무 규칙을 수식으로 고정하고 전제 조건을 검증하는 도구입니다. 여기서는 고정비와 단위 이익으로 손익분기점을
    구하고, 잘못된 계수를 먼저 실패시킨 뒤, 기준 변경 실험을 수행합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import sympy as sp

    x = sp.symbols('x', nonnegative=True)
    fixedCost = 120000
    unitPrice = 5000
    unitCost = 2000

    revenueExpr = unitPrice * x
    costExpr = fixedCost + unitCost * x
    profitExpr = sp.simplify(revenueExpr - costExpr)
    breakEvenQuantity = sp.solve(sp.Eq(profitExpr, 0), x)[0]

    assert profitExpr == 3000 * x - 120000
    assert breakEvenQuantity == 40
    profitExpr, breakEvenQuantity
  exercise:
    prompt: '현업 흐름 검증: 손익분기 수식을 기호로 검증하기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'
    starterCode: |-
      import sympy as sp

      x = sp.symbols('x', nonnegative=True)
      fixedCost = 120000
      unitPrice = 5000
      unitCost = 2000

      revenueExpr = unitPrice * x
      costExpr = fixedCost + unitCost * x
      profitExpr = sp.simplify(revenueExpr - costExpr)
      breakEvenQuantity = sp.solve(sp.Eq(profitExpr, 0), x)[0]

      assert profitExpr == 3000 * x - 120000
      assert breakEvenQuantity == 40
      profitExpr, breakEvenQuantity
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: '현업 흐름 검증: 손익분기 수식을 기호로 검증하기의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.'
    resultCheck: '현업 흐름 검증: 손익분기 수식을 기호로 검증하기 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.'
assessment:
  schemaVersion: 1
  performanceClaim: 웹에서는 외부 패키지 없이 분석 판단과 데이터 계약을 검증하고, 실제 패키지 API와 산출물은 lesson Run 및 Local 실습 증거로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: pending
  masteryVariants:
  - id: sympy_02-formula-substitution-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - workflow_validation
    title: 수식에 값을 안전하게 대입하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 변수 누락과 알 수 없는 값을 거부하고 선형 결합을 계산한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - free symbol이 하나라도 남으면 숫자 결과로 부르지 마세요.
    - 알 수 없는 입력 key도 조용히 무시하지 마세요.
    exercise:
      prompt: substitute_linear(coefficients, constant, values)를 완성하세요.
      starterCode: |-
        def substitute_linear(coefficients, constant, values):
            raise NotImplementedError
      solution: |
        def substitute_linear(coefficients, constant, values):
            missing = sorted(set(coefficients) - set(values)); unknown = sorted(set(values) - set(coefficients))
            if missing or unknown: raise ValueError("substitution contract mismatch")
            return constant + sum(coefficients[name] * values[name] for name in coefficients)
      hints: *id001
    check:
      id: python.sympy.sympy_02.formula-substitution.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.sympy.sympy_02.formula-substitution.mastery.behavior.v1.fixture
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
        entry: substitute_linear
        cases:
        - id: substitutes-all-symbols
          arguments:
          - value:
              x: 2
              y: -1
          - value: 3
          - value:
              x: 4
              y: 5
          expectedReturn: 6
        - id: handles-no-symbols
          arguments:
          - value: {}
          - value: 7
          - value: {}
          expectedReturn: 7
        - id: rejects-missing
          arguments:
          - value:
              x: 1
          - value: 0
          - value: {}
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: sympy_02-batch-evaluation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - sympy_02-formula-substitution-mastery
    title: 새 시나리오 batch에 대입 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 같은 quadratic 식을 여러 x에 exact하게 평가한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 식 구조는 한 번 정의하고 값만 바꾸세요.
    - 입력 순서를 결과에 보존하세요.
    exercise:
      prompt: evaluate_quadratic(a, b, c, values)를 완성하세요.
      starterCode: |-
        def evaluate_quadratic(a, b, c, values):
            raise NotImplementedError
      solution: |
        def evaluate_quadratic(a, b, c, values):
            return [{"x": x, "value": a*x*x + b*x + c} for x in values]
      hints: *id002
    check:
      id: python.sympy.sympy_02.batch-evaluation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.sympy.sympy_02.batch-evaluation.transfer.behavior.v1.fixture
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
        entry: evaluate_quadratic
        cases:
        - id: evaluates-batch
          arguments:
          - value: 2
          - value: -3
          - value: 1
          - value:
            - 0
            - 1
            - 2
          expectedReturn:
          - x: 0
            value: 1
          - x: 1
            value: 0
          - x: 2
            value: 3
        - id: handles-empty-batch
          arguments:
          - value: 1
          - value: 0
          - value: 0
          - value: []
          expectedReturn: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: sympy_02-substitution-policy-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - sympy_02-batch-evaluation-transfer
    title: 대입 정책 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 단일·batch·부분 대입을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 기호 계산의 가정과 정의역을 결과와 함께 남기세요.
    - 소수 근삿값과 exact 결과를 구분하세요.
    exercise:
      prompt: choose_substitution(situation)를 완성해 method, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_substitution(situation):
            raise NotImplementedError
      solution: |
        def choose_substitution(situation):
            table = {'all-known': {'method': 'full substitution', 'evidence': 'no free symbols', 'risk': 'unknown keys'}, 'many-scenarios': {'method': 'lambdify or batch evaluation', 'evidence': 'same expression hash', 'risk': 'numeric precision'}, 'keep-parameter': {'method': 'partial substitution', 'evidence': 'remaining free symbols', 'risk': 'called numeric result'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.sympy.sympy_02.substitution-policy.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.sympy.sympy_02.substitution-policy.retrieval.behavior.v1.fixture
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
        entry: choose_substitution
        cases:
        - id: recalls-all-known
          arguments:
          - value: all-known
          expectedReturn:
            method: full substitution
            evidence: no free symbols
            risk: unknown keys
        - id: recalls-many-scenarios
          arguments:
          - value: many-scenarios
          expectedReturn:
            method: lambdify or batch evaluation
            evidence: same expression hash
            risk: numeric precision
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};