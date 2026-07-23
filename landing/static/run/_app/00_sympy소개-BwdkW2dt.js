var e=`meta:\r
  packages:\r
  - sympy\r
  id: sympy_00\r
  title: SymPy소개\r
  order: 0\r
  category: sympy\r
  badge: 소개\r
  tags:\r
  - sympy\r
  - 기호수학\r
  - symbolic\r
  - 대수학\r
  - 미적분\r
  seo:\r
    title: SymPy 소개 - 파이썬 기호 수학 라이브러리\r
    description: SymPy로 수식을 기호로 다루고 미분, 적분, 방정식 풀이를 배웁니다. 수학 문제를 파이썬으로 해결하는 방법을 소개합니다.\r
    keywords:\r
    - sympy\r
    - 기호수학\r
    - symbolic math\r
    - 미분\r
    - 적분\r
    - 방정식\r
intro:\r
  direction: SymPy소개에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.
  - 수식과 기호 확인 후 기호 계산에 맞는 코드 입력을 고릅니다.\r
  - SymPy소개 결과를 간소화식, 해, 미분/적분 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 수학 계산 검증 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 손익분기 수식을 기호로 검증하 입력 확인\r
      detail: 입력 기준(수식과 기호)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기호 계산 처리 실행\r
      detail: 기호 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 간소화식, 해, 미분/적분 결 결과 검증\r
      detail: 간소화식, 해, 미분/적분 결과 기준으로 실행 결과를 비교합니다.\r
    - label: SymPy소개 재사용\r
      detail: 완성 코드를 수학 계산 검증 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 기호 계산 환경\r
      detail: sympy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: SymPy소개 실행\r
      detail: 셀을 실행해 간소화식, 해, 미분/적분 결과와 예외 상태를 확인합니다.\r
    - label: SymPy소개 완료\r
      detail: 검증된 코드를 수학 계산 검증 루틴로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 🔢\r
    title: SymPy\r
    subtitle: 파이썬 기호 수학 라이브러리\r
  - type: hero\r
    emoji: ∫\r
    title: 수식을 기호로 다루는 수학\r
    subtitle: 정확한 수학적 계산과 수식 조작\r
    points:\r
    - emoji: 📐\r
      title: 미분과 적분\r
    - emoji: 🎯\r
      title: 방정식 풀이\r
    - emoji: 📊\r
      title: 행렬 연산\r
    - emoji: ∞\r
      title: 극한과 급수\r
  goal: SymPy에서 기호식 입력과 계산 결과가 어떻게 달라지는지 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
- id: sympy_history\r
  blocks:\r
  - type: sectionHeader\r
    title: 🏛️ SymPy란?\r
    subtitle: 기호 수학의 세계\r
  - type: text\r
    content: SymPy(Symbolic Python)는 2006년 Ondřej Čertík가 개발한 파이썬 기호 수학 라이브러리입니다. 일반 계산기가 3+5=8처럼 숫자 결과를\r
      주는 것과 달리, SymPy는 x+y 같은 수식 자체를 다룹니다. (x+1)²을 전개하면 x²+2x+1이 되고, 이를 다시 인수분해할 수 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🔣\r
      title: 기호 계산\r
      description: x, y 같은 변수를 값 없이 수식으로 조작합니다\r
    - emoji: ✨\r
      title: 정확한 결과\r
      description: √2를 1.414...가 아닌 정확한 기호로 유지합니다\r
    - emoji: 🐍\r
      title: 순수 파이썬\r
      description: 외부 의존성 없이 어디서나 실행됩니다\r
  goal: 🏛️ SymPy란?에서 기호식 입력과 계산 결과가 어떻게 달라지는지 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
- id: numeric_vs_symbolic\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚖️ 숫자 vs 기호\r
    subtitle: 근본적인 차이\r
  - type: text\r
    content: 숫자 계산(Numeric)은 구체적인 값으로 결과를 얻습니다. sqrt(2)를 계산하면 1.4142...라는 근삿값이 나옵니다. 반면 기호 계산(Symbolic)은\r
      √2 그 자체를 유지하며, 정확한 값을 보존합니다.\r
  - type: table\r
    headers:\r
    - 구분\r
    - 숫자 계산\r
    - 기호 계산\r
    rows:\r
    - - √2\r
      - 1.41421356...\r
      - √2\r
    - - π\r
      - 3.14159265...\r
      - π\r
    - - (x+1)²\r
      - x 값 필요\r
      - x² + 2x + 1\r
    - - 미분\r
      - 수치 근사\r
      - 정확한 도함수\r
  - type: note\r
    title: 왜 기호 계산이 필요한가?\r
    content: 수치 계산은 반올림 오차가 누적됩니다. 기호 계산은 정확한 수식을 유지하므로 오차가 없습니다. 미분, 적분 같은 수학적 조작은 기호로 해야 정확한 결과를 얻습니다.\r
  goal: ⚖️ 숫자 vs 기호에서 기호식 입력과 계산 결과가 어떻게 달라지는지 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
- id: features\r
  blocks:\r
  - type: sectionHeader\r
    title: 🛠️ SymPy 주요 기능\r
    subtitle: 대학 수학의 모든 것\r
  - type: text\r
    content: SymPy는 대학 수학 과정의 거의 모든 내용을 다룰 수 있습니다. 기초 대수부터 고급 미적분, 선형대수, 미분방정식까지 폭넓게 지원합니다.\r
  - type: table\r
    headers:\r
    - 분야\r
    - 기능\r
    - 예시\r
    rows:\r
    - - 대수학\r
      - 전개, 인수분해, 방정식\r
      - factor(x²-1) → (x+1)(x-1)\r
    - - 미적분\r
      - 미분, 적분, 극한\r
      - diff(x³) → 3x²\r
    - - 급수\r
      - 테일러 급수, 합\r
      - series(sin(x)) → x - x³/6 + ...\r
    - - 선형대수\r
      - 행렬, 역행렬, 고유값\r
      - Matrix([[1,2],[3,4]]).det()\r
    - - 삼각함수\r
      - 항등식, 변환\r
      - trigsimp(sin²+cos²) → 1\r
  goal: 🛠️ SymPy 주요 기능에서 기호식 입력과 계산 결과가 어떻게 달라지는지 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
- id: comparison\r
  blocks:\r
  - type: sectionHeader\r
    title: 🔄 SymPy vs 다른 도구\r
    subtitle: 적재적소에 맞는 선택\r
  - type: table\r
    headers:\r
    - 도구\r
    - 특징\r
    - 적합한 용도\r
    rows:\r
    - - SymPy\r
      - 무료, 파이썬 통합, 기호 계산\r
      - 수학 학습, 공식 유도\r
    - - NumPy/SciPy\r
      - 빠른 수치 계산\r
      - 대용량 데이터 연산\r
    - - Mathematica\r
      - 상용, 강력한 기호 계산\r
      - 전문 연구\r
    - - WolframAlpha\r
      - 웹 서비스, 편리\r
      - 빠른 검색\r
  goal: 🔄 SymPy vs 다른 도구에서 기호식 입력과 계산 결과가 어떻게 달라지는지 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
- id: use_cases\r
  blocks:\r
  - type: sectionHeader\r
    title: 💡 활용 분야\r
    subtitle: SymPy가 사용되는 곳\r
  - type: text\r
    content: SymPy는 수학 학습, 과학 연구, 공학 계산 등 다양한 분야에서 활용됩니다.\r
  - type: table\r
    headers:\r
    - 분야\r
    - 활용 예시\r
    rows:\r
    - - 수학 학습\r
      - 미적분 풀이 검증, 복잡한 계산 확인\r
    - - 물리학\r
      - 운동 방정식 풀이, 라그랑지안 계산\r
    - - 공학\r
      - 제어 시스템, 신호 처리, 회로 해석\r
    - - 교육\r
      - 문제 자동 생성, 단계별 풀이 제공\r
  goal: 💡 활용 분야에서 기호식 입력과 계산 결과가 어떻게 달라지는지 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
- id: core_concepts\r
  blocks:\r
  - type: sectionHeader\r
    title: 📌 핵심 개념\r
    subtitle: 알아야 할 것들\r
  - type: featureCards\r
    cards:\r
    - emoji: 🔤\r
      title: 기호 (Symbol)\r
      description: x, y, z 같은 수학 변수를 정의합니다\r
    - emoji: 📝\r
      title: 표현식 (Expression)\r
      description: x² + 2x + 1 같은 수식입니다\r
    - emoji: ⚖️\r
      title: 방정식 (Equation)\r
      description: Eq(x², 4)처럼 등호를 포함한 수식입니다\r
    - emoji: 📈\r
      title: 함수 (Function)\r
      description: sin, cos, exp, log 같은 수학 함수입니다\r
  goal: 📌 핵심 개념에서 기호식 입력과 계산 결과가 어떻게 달라지는지 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
- id: workflow\r
  blocks:\r
  - type: sectionHeader\r
    title: 🔄 작업 흐름\r
    subtitle: SymPy 사용 순서\r
  - type: table\r
    headers:\r
    - 단계\r
    - 설명\r
    - 예시\r
    rows:\r
    - - 1. 기호 정의\r
      - 변수 생성\r
      - x, y = symbols('x y')\r
    - - 2. 수식 생성\r
      - 표현식 작성\r
      - expr = x**2 + 2*x + 1\r
    - - 3. 수식 조작\r
      - 전개, 인수분해\r
      - factor(expr)\r
    - - 4. 계산 수행\r
      - 미분, 적분, 풀이\r
      - diff(expr, x)\r
    - - 5. 결과 확인\r
      - 값 대입, 수치화\r
      - expr.subs(x, 2).evalf()\r
  goal: 🔄 작업 흐름에서 기호식 입력과 계산 결과가 어떻게 달라지는지 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
- id: curriculum\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 커리큘럼\r
    subtitle: 10개 프로젝트로 마스터\r
  - type: text\r
    content: 이 카테고리에서는 10개의 프로젝트를 통해 SymPy의 핵심 기능을 배웁니다.\r
  - type: table\r
    headers:\r
    - 프로젝트\r
    - 주제\r
    - 핵심 개념\r
    rows:\r
    - - 01. 기초 수식 계산\r
      - 대수학 입문\r
      - 기호, 전개, 인수분해\r
    - - 02. 대입과 계산\r
      - 수식 평가\r
      - subs, evalf, simplify\r
    - - 03. 방정식 풀이\r
      - 대수 방정식\r
      - solve, Eq, 연립방정식\r
    - - 04. 미분 기초\r
      - 미분법\r
      - diff, 고차미분, 편미분\r
    - - 05. 적분 기초\r
      - 적분법\r
      - integrate, 정적분\r
    - - 06. 극한과 급수\r
      - 해석학\r
      - limit, series, summation\r
    - - 07. 삼각함수 활용\r
      - 삼각법\r
      - trigsimp, 항등식\r
    - - 08. 행렬 연산\r
      - 선형대수\r
      - Matrix, 역행렬, 고유값\r
    - - 09. 수식 시각화\r
      - 그래프\r
      - plot, matplotlib 연동\r
    - - 10. 종합 수학 문제\r
      - 응용\r
      - 최적화, 미분방정식\r
  goal: 📚 커리큘럼에서 기호식 입력과 계산 결과가 어떻게 달라지는지 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
- id: start\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎯 시작하기\r
    subtitle: 첫 번째 프로젝트로\r
  - type: text\r
    content: SymPy를 배우면 파이썬으로 수학 문제를 정확하게 풀 수 있습니다. 손으로 푸는 것과 병행하며 검증하고, 복잡한 계산은 SymPy에게 맡기세요. 첫 번째 프로젝트에서\r
      기호를 정의하고 수식을 전개하는 것부터 시작합니다.\r
  goal: 🎯 시작하기에서 기호식 입력과 계산 결과가 어떻게 달라지는지 확인한다.\r
  why: 기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다.\r
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