var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - sympy\r
  id: sympy_09\r
  title: 수식시각화\r
  order: 9\r
  category: sympy\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - sympy\r
  - plot\r
  - 시각화\r
  - 그래프\r
  - matplotlib\r
  seo:\r
    title: SymPy 시각화 - plot과 matplotlib 연동\r
    description: SymPy로 함수 그래프를 그리고 matplotlib과 연동합니다. 2D, 3D 시각화와 미적분 결과를 시각화합니다.\r
    keywords:\r
    - sympy\r
    - plot\r
    - 시각화\r
    - matplotlib\r
    - 그래프\r
intro:\r
  emoji: 📊\r
  goal: SymPy의 plot()으로 함수 그래프를 그리고 matplotlib과 연동합니다.\r
  description: 수학 수식을 시각화하면 추상적인 개념이 직관적으로 다가옵니다. 2차 함수 x²은 포물선, sin(x)는 파동, e^x는 폭발적 성장 곡선입니다. SymPy의\r
    plot()은 기호 함수를 바로 그래프로 변환합니다. 도함수를 함께 그리면 기울기 변화를 볼 수 있고, 적분 영역을 색칠하면 넓이의 의미를 이해합니다. 접선을 그리면 미분의 기하적\r
    의미가 보입니다. 이 프로젝트를 완료하면 함수 그래프, 미적분 시각화, 3D 곡면까지 다룰 수 있게 됩니다.\r
  direction: 수식시각화에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 수식과 기호 확인 후 기호 계산에 맞는 코드 입력을 고릅니다.\r
  - 수식시각화 결과를 간소화식, 해, 미분/적분 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 수학 계산 검증 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(수식과 기호)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기본 플롯 처리 실행\r
      detail: 기호 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 여러 함수 결과 검증\r
      detail: 간소화식, 해, 미분/적분 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 수식시각화 재사용\r
      detail: 완성 코드를 수학 계산 검증 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 기호 계산 환경\r
      detail: matplotlib, numpy, sympy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 수식시각화 실행\r
      detail: 셀을 실행해 간소화식, 해, 미분/적분 결과와 예외 상태를 확인합니다.\r
    - label: 수식시각화 완료\r
      detail: 검증된 코드를 수학 계산 검증 루틴로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 시각화에 필요한 함수들을 불러옵니다. sympy.plotting의 plot()은 2D 함수 그래프, plot_parametric()은 매개변수 곡선, plot3d()는\r
    3D 곡면을 그립니다. matplotlib.pyplot은 더 세밀한 커스터마이징에 사용합니다. SymPy 플롯은 기호 함수를 직접 받아들이므로 변환 없이 바로 그릴 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sympy import symbols, sin, cos, exp, log, sqrt, pi\r
    from sympy import diff, integrate, solve\r
    from sympy.plotting import plot, plot_parametric, plot3d\r
    import matplotlib.pyplot as plt\r
    from sympy import init_printing\r
    init_printing()\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, sin, cos, exp, log, sqrt, pi\r
      from sympy import diff, integrate, solve\r
      from sympy.plotting import plot, plot_parametric, plot3d\r
      import matplotlib.pyplot as plt\r
      from sympy import init_printing\r
      init_printing()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 라이브러리 불러오기의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step2_basic_plot\r
  title: 2단계. 기본 플롯\r
  structuredPrimary: true\r
  subtitle: plot()\r
  goal: 2단계. 기본 플롯에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    plot(f, (x, a, b))는 x가 a에서 b까지 변할 때 f(x)의 그래프를 그립니다. title, xlabel, ylabel로 제목과 축 라벨을 지정합니다. show=False로 설정하면 즉시 표시하지 않고 설정을 추가한 후 show()로 표시할 수 있습니다. 2차 함수 x²은 원점을 꼭지점으로 하는 아래로 볼록한 포물선입니다.\r
\r
    show=False로 즉시 표시를 막고, 설정 후 show()로 표시합니다. 또는 그냥 plot()만 호출하면 바로 표시됩니다.\r
  snippet: x = symbols('x')\r
  exercise:\r
    prompt: 2단계. 기본 플롯 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: x = symbols('x')\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 기본 플롯의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 기본 플롯 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step3_multiple\r
  title: 3단계. 여러 함수\r
  structuredPrimary: true\r
  subtitle: 동시 그리기\r
  goal: 3단계. 여러 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 여러 함수를 한 그래프에 비교하면 관계가 명확해집니다. plot(f1, f2, f3, (x, a, b))로 여러 함수를 동시에 그립니다. legend=True로\r
    범례를 표시하고, p[0].label로 각 함수에 이름을 붙입니다. sin(x)와 cos(x)를 비교하면 π/2의 위상차를 볼 수 있고, x, x², x³을 비교하면 거듭제곱에\r
    따른 성장 속도 차이를 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    p2 = plot(sin(x), cos(x), (x, -2*pi, 2*pi), legend=True, show=False)\r
    p2[0].label = 'sin(x)'\r
    p2[1].label = 'cos(x)'\r
    p2.show()\r
    p2\r
  exercise:\r
    prompt: 3단계. 여러 함수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      p2 = plot(sin(x), cos(x), (x, -2*pi, 2*pi), legend=True, show=False)\r
      p2[0].label = 'sin(x)'\r
      p2[1].label = 'cos(x)'\r
      p2.show()\r
      p2\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 여러 함수의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 여러 함수 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step4_style\r
  title: 4단계. 스타일 지정\r
  structuredPrimary: true\r
  subtitle: 색상과 선\r
  goal: 4단계. 스타일 지정에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 그래프의 시각적 스타일을 지정하면 구분이 쉬워집니다. line_color='red'로 색상을 지정합니다. 여러 함수를 그릴 때는 p[0].line_color\r
    = 'blue', p[1].line_color = 'orange'처럼 각각 다른 색을 지정합니다. 색상은 이름('red'), hex('#FF0000'), RGB 튜플로 지정할\r
    수 있습니다. 발표 자료나 논문에 사용할 때는 구분이 명확한 색상을 선택합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    p4 = plot(sin(x), (x, 0, 2*pi), line_color='red', show=False)\r
    p4.show()\r
    p4\r
  exercise:\r
    prompt: 4단계. 스타일 지정 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      p4 = plot(sin(x), (x, 0, 2*pi), line_color='red', show=False)\r
      p4.show()\r
      p4\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 스타일 지정의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 스타일 지정 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step5_matplotlib\r
  title: 5단계. Matplotlib 연동\r
  structuredPrimary: true\r
  subtitle: 더 세밀한 제어\r
  goal: 5단계. Matplotlib 연동에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    SymPy 플롯의 기능이 부족할 때는 matplotlib과 직접 연동합니다. lambdify로 SymPy 수식을 numpy 함수로 바꾸면 matplotlib의 Figure와 Axes를 완전히 제어할 수 있습니다. ax.grid(True)로 격자를 추가하고, ax.annotate()로 주석을 달고, ax.axhline()으로 보조선을 그립니다. matplotlib의 모든 기능을 활용하여 출판 품질의 그래프를 만들 수 있습니다.\r
\r
    lambdify(x, expr, 'numpy')는 기호 수식을 numpy 배열을 받는 함수로 변환합니다. SymPy 내부 백엔드에 의존하지 않아 버전 변화에도 안정적입니다.\r
  tips:\r
  - lambdify로 numpy 함수를 만든 뒤 plt.subplots()로 직접 그리면 축/주석/보조선을 자유롭게 추가할 수 있습니다.\r
  snippet: |-\r
    import numpy as np\r
    from sympy import lambdify\r
\r
    f = lambdify(x, x**2, 'numpy')\r
    xs = np.linspace(-3, 3, 200)\r
\r
    fig, ax = plt.subplots()\r
    ax.plot(xs, f(xs))\r
    ax.set_title('Parabola with Matplotlib')\r
    ax.grid(True)\r
    fig\r
  exercise:\r
    prompt: 5단계. Matplotlib 연동 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from sympy import lambdify\r
\r
      f = lambdify(x, x**2, 'numpy')\r
      xs = np.linspace(-3, 3, 200)\r
\r
      fig, ax = plt.subplots()\r
      ax.plot(xs, f(xs))\r
      ax.set_title('Parabola with Matplotlib')\r
      ax.grid(True)\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. Matplotlib 연동의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. Matplotlib 연동 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step6_parametric\r
  title: 6단계. 매개변수 플롯\r
  structuredPrimary: true\r
  subtitle: plot_parametric()\r
  goal: 6단계. 매개변수 플롯에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    매개변수 곡선은 x(t), y(t)로 정의됩니다. plot_parametric(x(t), y(t), (t, a, b))로 그립니다. 원 x=cos(t), y=sin(t)는 가장 기본적인 예입니다. 리사주 곡선 x=sin(3t), y=sin(2t)은 진동수 비율에 따라 아름다운 패턴을 만듭니다. 매개변수 곡선은 물리학의 운동 궤적, 컴퓨터 그래픽스의 곡선 표현에 널리 사용됩니다.\r
\r
    매개변수 플롯은 시간에 따른 운동 궤적, 복잡한 곡선 등을 표현할 때 유용합니다.\r
  snippet: |-\r
    t = symbols('t')\r
    pcircle = plot_parametric(cos(t), sin(t), (t, 0, 2*pi), title='Circle', show=False)\r
    pcircle.show()\r
    pcircle\r
  exercise:\r
    prompt: 6단계. 매개변수 플롯 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      t = symbols('t')\r
      pcircle = plot_parametric(cos(t), sin(t), (t, 0, 2*pi), title='Circle', show=False)\r
      pcircle.show()\r
      pcircle\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 매개변수 플롯의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 매개변수 플롯 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step7_derivative_plot\r
  title: 7단계. 도함수 시각화\r
  structuredPrimary: true\r
  subtitle: 미분 결과\r
  goal: 7단계. 도함수 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    함수와 도함수를 함께 그리면 미분의 의미가 시각적으로 드러납니다. f(x) = x³-3x의 도함수 f'(x) = 3x²-3입니다. 도함수가 0인 x = ±1에서 원래 함수는 극값을 가집니다. 도함수가 양수인 구간에서 원래 함수는 증가하고, 음수인 구간에서 감소합니다. 그래프에서 이 관계를 직접 확인할 수 있습니다.\r
\r
    도함수가 0인 점에서 원래 함수는 극값을 가집니다. 그래프에서 교차점을 확인해보세요.\r
  snippet: |-\r
    func = x**3 - 3*x\r
    dfunc = diff(func, x)\r
    func, dfunc\r
  exercise:\r
    prompt: 7단계. 도함수 시각화 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      func = x**3 - 3*x\r
      dfunc = diff(func, x)\r
      func, dfunc\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 도함수 시각화의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 도함수 시각화 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step8_integral_plot\r
  title: 8단계. 적분 영역\r
  structuredPrimary: true\r
  subtitle: 넓이 시각화\r
  goal: 8단계. 적분 영역에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 정적분 ∫[a,b] f(x)dx는 곡선 y=f(x)와 x축 사이의 넓이입니다. matplotlib의 fill_between()으로 이 영역을 색칠하면 적분의\r
    기하적 의미가 명확해집니다. ∫[0,2] x²dx = 8/3은 포물선 아래 넓이입니다. 시각화와 수치 계산을 비교하면 적분의 개념이 직관적으로 이해됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import numpy as np\r
\r
    xarr = np.linspace(0, 2, 100)\r
    yarr = xarr**2\r
\r
    fig, ax = plt.subplots(figsize=(8, 5))\r
    ax.plot(xarr, yarr, 'b-', linewidth=2, label='y = x^2')\r
    ax.fill_between(xarr, yarr, alpha=0.3, color='blue')\r
    ax.set_xlabel('x')\r
    ax.set_ylabel('y')\r
    ax.set_title('Area under y = x^2 from 0 to 2')\r
    ax.legend()\r
    fig\r
  exercise:\r
    prompt: 8단계. 적분 영역 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
\r
      xarr = np.linspace(0, 2, 100)\r
      yarr = xarr**2\r
\r
      fig, ax = plt.subplots(figsize=(8, 5))\r
      ax.plot(xarr, yarr, 'b-', linewidth=2, label='y = x^2')\r
      ax.fill_between(xarr, yarr, alpha=0.3, color='blue')\r
      ax.set_xlabel('x')\r
      ax.set_ylabel('y')\r
      ax.set_title('Area under y = x^2 from 0 to 2')\r
      ax.legend()\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 적분 영역의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 적분 영역 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step9_tangent_plot\r
  title: 9단계. 접선 시각화\r
  structuredPrimary: true\r
  subtitle: 미분의 기하적 의미\r
  goal: 9단계. 접선 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 미분값 f'(a)는 점 (a, f(a))에서 접선의 기울기입니다. 접선 방정식은 y - f(a) = f'(a)(x - a)입니다. x=1에서 y=x²의 접선은\r
    기울기 2로, y = 2(x-1) + 1 = 2x - 1입니다. 곡선과 접선을 함께 그리면 접선이 곡선에 '접하는' 모습을 볼 수 있습니다. 이것이 미분의 기하적 의미입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    curve = x**2\r
    dcurve = diff(curve, x)\r
    pt = 1\r
    yval = curve.subs(x, pt)\r
    slope = dcurve.subs(x, pt)\r
    tangent = slope * (x - pt) + yval\r
    curve, tangent\r
  exercise:\r
    prompt: 9단계. 접선 시각화 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      curve = x**2\r
      dcurve = diff(curve, x)\r
      pt = 1\r
      yval = curve.subs(x, pt)\r
      slope = dcurve.subs(x, pt)\r
      tangent = slope * (x - pt) + yval\r
      curve, tangent\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 접선 시각화의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 접선 시각화 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: step10_3d\r
  title: 10단계. 3D 플롯\r
  structuredPrimary: true\r
  subtitle: plot3d()\r
  goal: 10단계. 3D 플롯에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: 두 변수 함수 z = f(x, y)는 3D 곡면으로 표현됩니다. plot3d(f, (x, a, b), (y, c, d))로 그립니다. z = x² + y²은\r
    원뿔 모양의 포물면으로 최솟값이 원점에 있습니다. z = x² - y²은 안장면(saddle surface)으로 한 방향에서 극소, 다른 방향에서 극대입니다. 다변수 함수의 극값\r
    분석에서 3D 시각화는 필수적입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: y = symbols('y')\r
  exercise:\r
    prompt: 10단계. 3D 플롯 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.\r
    starterCode: y = symbols('y')\r
    hints:\r
    - 바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.\r
    - 실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 3D 플롯의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 3D 플롯 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 시각화 연습\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
  explanation: |-\r
    이제 다양한 함수의 시각화를 종합적으로 연습합니다. 미션1에서는 지수함수 e^u와 로그함수 ln(u)를 비교합니다. 두 함수는 역함수 관계로 y=x에 대해 대칭입니다. 미션2에서는 sin(v)와 그 도함수들 cos(v), -sin(v)를 함께 그려 미분의 순환 패턴을 확인합니다. 시각화는 수학적 관계를 직관적으로 이해하는 강력한 도구입니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from sympy import symbols, exp, log, pi\r
    from sympy.plotting import plot\r
\r
    u = symbols('u')\r
\r
    pExpLog = plot(exp(u), log(u), (u, 0.1, 3), legend=True, show=False)\r
    pExpLog[0].label = 'e^u'\r
    pExpLog[1].label = 'ln(u)'\r
    pExpLog.show()\r
    pExpLog\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sympy import symbols, exp, log, pi\r
      from sympy.plotting import plot\r
\r
      u = symbols('u')\r
\r
      pExpLog = plot(exp(u), log(u), (u, 0.1, 3), legend=True, show=False)\r
      pExpLog[0].label = 'e^u'\r
      pExpLog[1].label = 'ln(u)'\r
      pExpLog.show()\r
      pExpLog\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
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