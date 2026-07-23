var e=`meta:\r
  packages:\r
  - sympy\r
  id: sympy_10\r
  title: 종합수학문제\r
  order: 10\r
  category: sympy\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - sympy\r
  - 최적화\r
  - 미분방정식\r
  - 응용수학\r
  - 종합\r
  seo:\r
    title: SymPy 종합 - 실전 수학 문제 풀이\r
    description: SymPy로 최적화, 넓이/부피 계산, 미분방정식 등 실전 수학 문제를 풉니다. 모든 개념을 종합 활용합니다.\r
    keywords:\r
    - sympy\r
    - 최적화\r
    - 미분방정식\r
    - 응용수학\r
    - 종합문제\r
intro:\r
  emoji: 🎓\r
  goal: 지금까지 배운 모든 개념을 활용하여 실전 수학 문제를 풉니다.\r
  description: 이 프로젝트는 SymPy 시리즈의 최종 단계로, 모든 개념을 실전 문제에 적용합니다. 최적화 문제(상자 부피 최대화, 울타리 넓이 최대화)에서는 미분으로 극값을\r
    찾습니다. 회전체 부피, 곡선 길이는 적분의 응용입니다. 미분방정식 dy/dt = ky는 인구 성장, 방사성 붕괴를 모델링합니다. 경제학의 한계비용, 이윤 극대화도 미분 문제입니다.\r
    마르코프 체인은 행렬 거듭제곱으로 미래 상태를 예측합니다. 이 프로젝트를 완료하면 수학이 실제 문제에 어떻게 적용되는지 이해하게 됩니다.\r
  direction: 종합수학문제에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 수식과 기호 확인 후 기호 계산에 맞는 코드 입력을 고릅니다.\r
  - 종합수학문제 결과를 간소화식, 해, 미분/적분 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 수학 계산 검증 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(수식과 기호)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 최적화 문제 처리 실행\r
      detail: 기호 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 울타리 문제 결과 검증\r
      detail: 간소화식, 해, 미분/적분 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 종합수학문제 재사용\r
      detail: 완성 코드를 수학 계산 검증 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 기호 계산 환경\r
      detail: sympy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 종합수학문제 실행\r
      detail: 셀을 실행해 간소화식, 해, 미분/적분 결과와 예외 상태를 확인합니다.\r
    - label: 종합수학문제 완료\r
      detail: 검증된 코드를 수학 계산 검증 루틴로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 종합 문제에는 다양한 SymPy 기능이 필요합니다. diff, integrate는 미적분, solve, Eq는 방정식, limit, series, summation은\r
    해석학, Matrix는 선형대수, dsolve, Function은 미분방정식에 사용됩니다. plot은 결과를 시각화합니다. 이 모든 도구를 조합하여 실전 문제를 해결합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sympy import symbols, solve, Eq, diff, integrate, simplify\r
    from sympy import sin, cos, exp, log, sqrt, pi, Rational\r
    from sympy import limit, series, summation, oo\r
    from sympy import Matrix, dsolve, Function\r
    from sympy.plotting import plot\r
    from sympy import init_printing\r
    init_printing()\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, solve, Eq, diff, integrate, simplify\r
      from sympy import sin, cos, exp, log, sqrt, pi, Rational\r
      from sympy import limit, series, summation, oo\r
      from sympy import Matrix, dsolve, Function\r
      from sympy.plotting import plot\r
      from sympy import init_printing\r
      init_printing()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 라이브러리 불러오기의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step2_optimize\r
  title: 2단계. 최적화 문제\r
  structuredPrimary: true\r
  subtitle: 미분으로 극값\r
  goal: 2단계. 최적화 문제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    최적화는 주어진 조건에서 최대/최소를 찾는 문제입니다. 12×12 판에서 모서리를 x씩 잘라 접으면 (12-2x)×(12-2x)×x 상자가 됩니다. 부피 V(x)를 x에 대해 미분하여 V'(x)=0인 임계점을 찾고, V''(x)<0이면 최대입니다. x=2일 때 부피 128이 최대입니다. 이 방법은 공학 설계, 경영 최적화에 널리 사용됩니다.\r
\r
    12×12 판에서 모서리를 x씩 잘라 접어 상자를 만들 때, x=2일 때 부피 128이 최대입니다.\r
  snippet: |-\r
    x = symbols('x', positive=True)\r
    side = 12 - 2*x\r
    vol = x * side**2\r
    vol\r
  exercise:\r
    prompt: 2단계. 최적화 문제 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      x = symbols('x', positive=True)\r
      side = 12 - 2*x\r
      vol = x * side**2\r
      vol\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 최적화 문제의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 최적화 문제 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step3_fence\r
  title: 3단계. 울타리 문제\r
  structuredPrimary: true\r
  subtitle: 제약 조건 최적화\r
  goal: 3단계. 울타리 문제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    제약 조건이 있는 최적화 문제입니다. 둘레 100m의 울타리로 직사각형 목장을 만들 때 최대 넓이를 구합니다. 둘레 2w+2h=100에서 h=(100-2w)/2=50-w이고, 넓이 A=w×h=w(50-w)입니다. dA/dw=0에서 w=25, 따라서 정사각형 25×25=625m²가 최대입니다. 같은 둘레일 때 정사각형이 넓이가 최대라는 기하학적 사실을 미분으로 증명합니다.\r
\r
    둘레가 고정일 때 넓이가 최대인 직사각형은 정사각형입니다. 25×25 = 625m²입니다.\r
  snippet: |-\r
    w = symbols('w', positive=True)\r
    perimeter = 100\r
    h = (perimeter - 2*w) / 2\r
    area = w * h\r
    area\r
  exercise:\r
    prompt: 3단계. 울타리 문제 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      w = symbols('w', positive=True)\r
      perimeter = 100\r
      h = (perimeter - 2*w) / 2\r
      area = w * h\r
      area\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 울타리 문제의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 울타리 문제 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step4_volume\r
  title: 4단계. 회전체 부피\r
  structuredPrimary: true\r
  subtitle: 적분 응용\r
  goal: 4단계. 회전체 부피에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 곡선을 축 주위로 회전시키면 3D 입체가 됩니다. 원판법은 V = π∫[a,b]f(x)²dx로 얇은 원판들의 합입니다. y=√x를 x축으로 회전하면 V=π∫[0,4]x\r
    dx = 8π입니다. 반원 y=√(r²-x²)을 x축으로 회전하면 구가 되어 V = (4/3)πr³입니다. 원통껍질법은 y축 회전에 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    f = sqrt(x)\r
    vdisc = integrate(pi * f**2, (x, 0, 4))\r
    vdisc\r
  exercise:\r
    prompt: 4단계. 회전체 부피 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      f = sqrt(x)\r
      vdisc = integrate(pi * f**2, (x, 0, 4))\r
      vdisc\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 회전체 부피의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 회전체 부피 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step5_arc\r
  title: 5단계. 곡선 길이\r
  structuredPrimary: true\r
  subtitle: 호의 길이\r
  goal: 5단계. 곡선 길이에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 곡선의 길이는 미소 구간 ds = √(dx² + dy²)를 적분합니다. y = f(x)일 때 L = ∫[a,b]√(1 + (dy/dx)²) dx입니다. y\r
    = x^(3/2)의 0≤x≤4 구간 길이를 구하면 dy/dx = (3/2)x^(1/2)이고, 적분하면 약 9.07입니다. 이 공식은 도로 설계, 케이블 길이 계산에 사용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    y = x**Rational(3, 2)\r
    dydx = diff(y, x)\r
    arc = integrate(sqrt(1 + dydx**2), (x, 0, 4))\r
    arc\r
  exercise:\r
    prompt: 5단계. 곡선 길이 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      y = x**Rational(3, 2)\r
      dydx = diff(y, x)\r
      arc = integrate(sqrt(1 + dydx**2), (x, 0, 4))\r
      arc\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 곡선 길이의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 곡선 길이 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step6_diff_eq\r
  title: 6단계. 미분방정식\r
  structuredPrimary: true\r
  subtitle: dsolve()\r
  goal: 6단계. 미분방정식에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    미분방정식은 미지 함수와 그 도함수 사이의 관계입니다. dy/dt = y의 해는 y = Ce^t로, 시간에 따라 지수적으로 증가/감소합니다. dy/dt = ky의 해 y = Ce^(kt)는 k>0이면 성장, k<0이면 감쇠입니다. 인구 증가, 방사성 붕괴, 복리 이자가 이 모델입니다. dsolve()는 초기조건 없이 일반해 C를 포함하여 반환합니다.\r
\r
    dy/dt = ky의 해는 y = C×e^(kt)입니다. 이것은 지수적 성장/감쇠 모델로 인구, 방사선 붕괴 등에 적용됩니다.\r
  snippet: |-\r
    t = symbols('t')\r
    y = Function('y')\r
    eq = Eq(y(t).diff(t), y(t))\r
    sol = dsolve(eq, y(t))\r
    sol\r
  exercise:\r
    prompt: 6단계. 미분방정식 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      t = symbols('t')\r
      y = Function('y')\r
      eq = Eq(y(t).diff(t), y(t))\r
      sol = dsolve(eq, y(t))\r
      sol\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 미분방정식의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 미분방정식 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step7_physics\r
  title: 7단계. 물리 문제\r
  structuredPrimary: true\r
  subtitle: 운동과 일\r
  goal: 7단계. 물리 문제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 물리학에서 미적분은 핵심 도구입니다. 가속도를 적분하면 속도, 속도를 적분하면 위치입니다. 자유낙하에서 a=-g를 적분하면 v=-gt+v₀, 다시 적분하면\r
    s=-(1/2)gt²+v₀t+s₀입니다. 일(Work)은 W=∫F dx로 힘을 거리에 대해 적분합니다. 용수철의 일 W=(1/2)kx²은 탄성 퍼텐셜 에너지입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    g, t, v0, s0 = symbols('g t v0 s0')\r
    accel = -g\r
    velocity = integrate(accel, t) + v0\r
    position = integrate(velocity, t) + s0\r
    velocity, position\r
  exercise:\r
    prompt: 7단계. 물리 문제 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      g, t, v0, s0 = symbols('g t v0 s0')\r
      accel = -g\r
      velocity = integrate(accel, t) + v0\r
      position = integrate(velocity, t) + s0\r
      velocity, position\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 물리 문제의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 물리 문제 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step8_economics\r
  title: 8단계. 경제학 문제\r
  structuredPrimary: true\r
  subtitle: 한계비용과 수익\r
  goal: 8단계. 경제학 문제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 경제학에서 미분은 '한계(marginal)' 개념입니다. 비용함수 C(q)의 미분 C'(q)는 한계비용으로, 한 단위 더 생산할 때의 추가 비용입니다. 이윤\r
    π = 수익 - 비용 = pq - C(q)를 최대화하려면 dπ/dq = p - C'(q) = 0, 즉 가격 = 한계비용에서 생산합니다. 소비자 잉여는 수요곡선 아래 면적에서 실제\r
    지출을 뺀 값입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    q = symbols('q', positive=True)\r
    cost = 100 + 5*q + Rational(1, 100)*q**2\r
    mc = diff(cost, q)\r
    mc\r
  exercise:\r
    prompt: 8단계. 경제학 문제 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      q = symbols('q', positive=True)\r
      cost = 100 + 5*q + Rational(1, 100)*q**2\r
      mc = diff(cost, q)\r
      mc\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 경제학 문제의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 경제학 문제 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step9_series_app\r
  title: 9단계. 급수 응용\r
  structuredPrimary: true\r
  subtitle: 근사 계산\r
  goal: 9단계. 급수 응용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 테일러 급수는 복잡한 함수를 다항식으로 근사합니다. e^x = 1 + x + x²/2! + x³/3! + ...이므로 e^0.1 ≈ 1 + 0.1 + 0.005\r
    + ... ≈ 1.1052입니다. 계산기가 sin, cos, exp를 계산할 때 실제로 테일러 급수를 사용합니다. 항을 많이 포함할수록 정확도가 높아지지만 계산량도 증가합니다.\r
    근사의 오차 분석은 수치해석의 핵심 주제입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    eser = series(exp(x), x, 0, 5).removeO()\r
    eser\r
  exercise:\r
    prompt: 9단계. 급수 응용 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      eser = series(exp(x), x, 0, 5).removeO()\r
      eser\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 급수 응용의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 급수 응용 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step10_matrix_app\r
  title: 10단계. 행렬 응용\r
  structuredPrimary: true\r
  subtitle: 마르코프 체인\r
  goal: 10단계. 행렬 응용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    마르코프 체인은 확률적 상태 전이를 모델링합니다. 전이행렬 P[i,j]는 상태 i에서 j로 갈 확률입니다. 오늘 맑으면 내일 맑을 확률 0.7, 흐릴 확률 0.3입니다. P²은 2일 후 확률, Pⁿ은 n일 후 확률입니다. n이 커지면 정상 상태(stationary distribution)에 수렴하여 초기 상태와 무관하게 같은 확률 분포가 됩니다. 이 모델은 날씨 예측, 주식 가격, 웹 페이지 순위(PageRank)에 사용됩니다.\r
\r
    전이행렬을 여러 번 곱하면 정상 상태(stationary distribution)에 수렴합니다. 초기 상태와 무관하게 같은 확률 분포로 수렴합니다.\r
  snippet: |-\r
    P = Matrix([[Rational(7, 10), Rational(3, 10)],\r
                [Rational(4, 10), Rational(6, 10)]])\r
    P\r
  exercise:\r
    prompt: 10단계. 행렬 응용 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      P = Matrix([[Rational(7, 10), Rational(3, 10)],\r
                  [Rational(4, 10), Rational(6, 10)]])\r
      P\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 행렬 응용의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 행렬 응용 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 종합 문제\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    이제 모든 개념을 종합적으로 연습합니다. 미션1에서는 20×20 판으로 상자 부피를 최대화하고, 원뿔의 부피를 적분으로 계산합니다. 미션2에서는 성장 미분방정식 dM/ds = 0.1M의 해를 구하고, 마르코프 체인의 정상 상태를 확인합니다. 이 연습들은 수학이 실제 문제에 어떻게 적용되는지 보여줍니다. SymPy 시리즈를 완료하신 것을 축하합니다!\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from sympy import symbols, solve, diff, integrate, pi, sqrt, Rational\r
\r
    u = symbols('u', positive=True)\r
\r
    baseU = 20 - 2*u\r
    volU = u * baseU * baseU\r
    dvolU = diff(volU, u)\r
    critU = solve(dvolU, u)\r
    critU\r
  exercise:\r
    prompt: 실습 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, solve, diff, integrate, pi, sqrt, Rational\r
\r
      u = symbols('u', positive=True)\r
\r
      baseU = 20 - 2*u\r
      volU = u * baseU * baseU\r
      dvolU = diff(volU, u)\r
      critU = solve(dvolU, u)\r
      critU\r
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