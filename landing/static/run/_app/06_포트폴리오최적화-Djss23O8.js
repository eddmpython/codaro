var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scipy\r
  id: scipy_06\r
  title: 포트폴리오최적화\r
  order: 6\r
  category: scipy\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - scipy.optimize\r
  - minimize\r
  - 포트폴리오\r
  - 최적화\r
  - 제약조건\r
  seo:\r
    title: scipy.optimize minimize - 투자 포트폴리오 최적화\r
    description: scipy.optimize의 minimize로 포트폴리오 최적화를 수행합니다. 제약조건 하에서 위험 대비 수익을 최대화합니다.\r
    keywords:\r
    - scipy\r
    - optimize\r
    - minimize\r
    - 포트폴리오\r
    - 투자\r
intro:\r
  emoji: 💰\r
  goal: scipy.optimize로 위험 대비 수익이 최대인 포트폴리오를 찾습니다.\r
  description: 여러 자산에 투자할 때 각 자산의 비중을 어떻게 결정할까요? minimize 함수로 샤프 비율을 최대화하거나 위험을 최소화하는 최적 배분을 계산합니다.\r
  direction: 포트폴리오최적화에서 수치 데이터를 모델에 넣고 계산 결과와 오차를 검증합니다.\r
  benefits:\r
  - 수치 입력 확인 후 최적화/적분/신호 처리에 맞는 코드 입력을 고릅니다.\r
  - 포트폴리오최적화 결과를 오차와 결과 범위 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 과학 계산 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 데이터 로드 입력 확인\r
      detail: 입력 기준(수치 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 포트폴리오 지표 처리 실행\r
      detail: 최적화/적분/신호 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 제약조건 설정 결과 검증\r
      detail: 오차와 결과 범위 기준으로 실행 결과를 비교합니다.\r
    - label: 포트폴리오최적화 재사용\r
      detail: 완성 코드를 과학 계산 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 과학 계산 환경\r
      detail: matplotlib, numpy, pandas, scipy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 포트폴리오최적화 실행\r
      detail: 셀을 실행해 오차와 결과 범위와 예외 상태를 확인합니다.\r
    - label: 포트폴리오최적화 완료\r
      detail: 검증된 코드를 과학 계산 루틴로 남깁니다.\r
sections:\r
- id: load\r
  title: 데이터 로드\r
  structuredPrimary: true\r
  subtitle: 자산 수익률과 공분산\r
  goal: 데이터 로드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    포트폴리오 최적화는 여러 자산의 투자 비중을 결정하는 문제입니다. 각 자산의 예상 수익률과 자산 간 상관관계(공분산)를 알면 최적의 배분을 찾을 수 있습니다. 이 프로젝트에서는 주식 2종, 채권, 금 4개 자산으로 구성된 포트폴리오를 최적화합니다.\r
\r
    공분산 행렬의 대각원소는 각 자산의 분산(변동성²)입니다. 비대각원소는 자산 간 공분산으로, 양수면 같이 움직이고 음수면 반대로 움직입니다.\r
  snippet: |-\r
    import scipy\r
\r
    import numpy as np\r
    from scipy import optimize\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    assets = ['Stock A', 'Stock B', 'Bond', 'Gold']\r
    returns = np.array([0.12, 0.10, 0.05, 0.07])\r
\r
    covMatrix = np.array([\r
        [0.0225, 0.0135, 0.0020, 0.0010],\r
        [0.0135, 0.0196, 0.0015, 0.0005],\r
        [0.0020, 0.0015, 0.0025, 0.0002],\r
        [0.0010, 0.0005, 0.0002, 0.0100]\r
    ])\r
\r
    assetDf = pd.DataFrame({\r
        'Asset': assets,\r
        'Return': [f'{r*100:.1f}%' for r in returns],\r
        'Volatility': [f'{np.sqrt(covMatrix[i,i])*100:.1f}%' for i in range(len(assets))]\r
    })\r
    assetDf\r
  exercise:\r
    prompt: 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import scipy\r
\r
      import numpy as np\r
      from scipy import optimize\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      assets = ['Stock A', 'Stock B', 'Bond', 'Gold']\r
      returns = np.array([0.12, 0.10, 0.05, 0.07])\r
\r
      covMatrix = np.array([\r
          [0.0225, 0.0135, 0.0020, 0.0010],\r
          [0.0135, 0.0196, 0.0015, 0.0005],\r
          [0.0020, 0.0015, 0.0025, 0.0002],\r
          [0.0010, 0.0005, 0.0002, 0.0100]\r
      ])\r
\r
      assetDf = pd.DataFrame({\r
          'Asset': assets,\r
          'Return': [f'{r*100:.1f}%' for r in returns],\r
          'Volatility': [f'{np.sqrt(covMatrix[i,i])*100:.1f}%' for i in range(len(assets))]\r
      })\r
      assetDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 데이터 로드의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 데이터 로드 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: metrics\r
  title: 포트폴리오 지표\r
  structuredPrimary: true\r
  subtitle: 수익률, 위험, 샤프비율\r
  goal: 포트폴리오 지표에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 포트폴리오 수익률은 각 자산 수익률의 가중평균입니다. 위험(표준편차)은 공분산을 고려하여 계산합니다. 샤프 비율은 (수익률 - 무위험수익률) / 위험으로,\r
    위험 대비 초과수익을 측정합니다. 샤프 비율이 높을수록 효율적인 투자입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def portfolioReturn(weights, rets):\r
        return np.dot(weights, rets)\r
\r
    def portfolioRisk(weights, cov):\r
        return np.sqrt(np.dot(weights.T, np.dot(cov, weights)))\r
\r
    def sharpeRatio(weights, rets, cov, riskFree=0.02):\r
        pRet = portfolioReturn(weights, rets)\r
        pRisk = portfolioRisk(weights, cov)\r
        return (pRet - riskFree) / pRisk\r
  exercise:\r
    prompt: 포트폴리오 지표 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def portfolioReturn(weights, rets):\r
          return np.dot(weights, rets)\r
\r
      def portfolioRisk(weights, cov):\r
          return np.sqrt(np.dot(weights.T, np.dot(cov, weights)))\r
\r
      def sharpeRatio(weights, rets, cov, riskFree=0.02):\r
          pRet = portfolioReturn(weights, rets)\r
          pRisk = portfolioRisk(weights, cov)\r
          return (pRet - riskFree) / pRisk\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 포트폴리오 지표의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 포트폴리오 지표 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: constraints\r
  title: 제약조건 설정\r
  structuredPrimary: true\r
  subtitle: 합계와 범위 제한\r
  goal: 제약조건 설정에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    포트폴리오 최적화에는 제약조건이 필수입니다. 가장 기본적인 제약은 비중 합계가 100%여야 한다는 것과 공매도를 금지하는 비음수 조건입니다. scipy.optimize.minimize는 등식 제약('eq')과 부등식 제약('ineq'), 변수 범위(bounds)를 모두 지원합니다.\r
\r
    'eq' 제약은 함수 결과가 0이 되어야 함을 의미합니다. 따라서 sum(w) - 1 = 0, 즉 sum(w) = 1입니다. 'ineq'는 결과가 0 이상이어야 합니다.\r
  snippet: |-\r
    constraints = {'type': 'eq', 'fun': lambda w: np.sum(w) - 1}\r
\r
    bounds = tuple((0, 1) for _ in range(len(assets)))\r
\r
    initWeights = np.array([0.25, 0.25, 0.25, 0.25])\r
  exercise:\r
    prompt: 제약조건 설정 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      constraints = {'type': 'eq', 'fun': lambda w: np.sum(w) - 1}\r
\r
      bounds = tuple((0, 1) for _ in range(len(assets)))\r
\r
      initWeights = np.array([0.25, 0.25, 0.25, 0.25])\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 제약조건 설정의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 제약조건 설정 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: minrisk\r
  title: 최소위험 포트폴리오\r
  structuredPrimary: true\r
  subtitle: 변동성 최소화\r
  goal: 최소위험 포트폴리오에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 가장 보수적인 전략은 위험(변동성)을 최소화하는 것입니다. 수익률과 무관하게 변동성만 최소화합니다. 이 포트폴리오는 효율적 프론티어의 가장 왼쪽 끝에 위치하며,\r
    리스크 회피 투자자에게 적합합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def negRisk(weights):\r
        return portfolioRisk(weights, covMatrix)\r
\r
    minRiskResult = optimize.minimize(\r
        negRisk,\r
        initWeights,\r
        method='SLSQP',\r
        bounds=bounds,\r
        constraints=constraints\r
    )\r
\r
    minRiskW = minRiskResult.x\r
    minRiskRet = portfolioReturn(minRiskW, returns)\r
    minRiskVol = portfolioRisk(minRiskW, covMatrix)\r
    minRiskSharpe = sharpeRatio(minRiskW, returns, covMatrix)\r
\r
    minRiskDf = pd.DataFrame({\r
        'Asset': assets,\r
        'Weight': [f'{w*100:.1f}%' for w in minRiskW]\r
    })\r
    minRiskDf\r
  exercise:\r
    prompt: 최소위험 포트폴리오 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      def negRisk(weights):\r
          return portfolioRisk(weights, covMatrix)\r
\r
      minRiskResult = optimize.minimize(\r
          negRisk,\r
          initWeights,\r
          method='SLSQP',\r
          bounds=bounds,\r
          constraints=constraints\r
      )\r
\r
      minRiskW = minRiskResult.x\r
      minRiskRet = portfolioReturn(minRiskW, returns)\r
      minRiskVol = portfolioRisk(minRiskW, covMatrix)\r
      minRiskSharpe = sharpeRatio(minRiskW, returns, covMatrix)\r
\r
      minRiskDf = pd.DataFrame({\r
          'Asset': assets,\r
          'Weight': [f'{w*100:.1f}%' for w in minRiskW]\r
      })\r
      minRiskDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 최소위험 포트폴리오의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 최소위험 포트폴리오 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: maxsharpe\r
  title: 최대샤프 포트폴리오\r
  structuredPrimary: true\r
  subtitle: 위험대비 수익 최대화\r
  goal: 최대샤프 포트폴리오에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 샤프 비율을 최대화하면 위험 대비 가장 효율적인 포트폴리오를 찾습니다. minimize 함수는 최소화만 하므로, 음수 샤프 비율을 최소화하여 최대화 효과를\r
    냅니다. 이 포트폴리오가 일반적으로 가장 추천되는 배분입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def negSharpe(weights):\r
        return -sharpeRatio(weights, returns, covMatrix)\r
\r
    maxSharpeResult = optimize.minimize(\r
        negSharpe,\r
        initWeights,\r
        method='SLSQP',\r
        bounds=bounds,\r
        constraints=constraints\r
    )\r
\r
    maxSharpeW = maxSharpeResult.x\r
    maxSharpeRet = portfolioReturn(maxSharpeW, returns)\r
    maxSharpeVol = portfolioRisk(maxSharpeW, covMatrix)\r
    maxSharpeSharpe = sharpeRatio(maxSharpeW, returns, covMatrix)\r
\r
    maxSharpeDf = pd.DataFrame({\r
        'Asset': assets,\r
        'Weight': [f'{w*100:.1f}%' for w in maxSharpeW]\r
    })\r
    maxSharpeDf\r
  exercise:\r
    prompt: 최대샤프 포트폴리오 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      def negSharpe(weights):\r
          return -sharpeRatio(weights, returns, covMatrix)\r
\r
      maxSharpeResult = optimize.minimize(\r
          negSharpe,\r
          initWeights,\r
          method='SLSQP',\r
          bounds=bounds,\r
          constraints=constraints\r
      )\r
\r
      maxSharpeW = maxSharpeResult.x\r
      maxSharpeRet = portfolioReturn(maxSharpeW, returns)\r
      maxSharpeVol = portfolioRisk(maxSharpeW, covMatrix)\r
      maxSharpeSharpe = sharpeRatio(maxSharpeW, returns, covMatrix)\r
\r
      maxSharpeDf = pd.DataFrame({\r
          'Asset': assets,\r
          'Weight': [f'{w*100:.1f}%' for w in maxSharpeW]\r
      })\r
      maxSharpeDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 최대샤프 포트폴리오의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 최대샤프 포트폴리오 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: compare\r
  title: 전략 비교\r
  structuredPrimary: true\r
  subtitle: 세 포트폴리오 분석\r
  goal: 전략 비교에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 균등배분, 최소위험, 최대샤프 세 가지 전략을 비교합니다. 최소위험은 수익률이 낮지만 변동성도 낮고, 최대샤프는 위험 단위당 수익이 가장 높습니다. 투자 목적과\r
    위험 허용도에 따라 적절한 전략을 선택해야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    eqRet = portfolioReturn(initWeights, returns)\r
    eqRisk = portfolioRisk(initWeights, covMatrix)\r
    eqSharpe = sharpeRatio(initWeights, returns, covMatrix)\r
\r
    compareDf = pd.DataFrame({\r
        'Strategy': ['Equal Weight', 'Min Risk', 'Max Sharpe'],\r
        'Return': [f'{eqRet*100:.2f}%', f'{minRiskRet*100:.2f}%', f'{maxSharpeRet*100:.2f}%'],\r
        'Risk': [f'{eqRisk*100:.2f}%', f'{minRiskVol*100:.2f}%', f'{maxSharpeVol*100:.2f}%'],\r
        'Sharpe': [f'{eqSharpe:.3f}', f'{minRiskSharpe:.3f}', f'{maxSharpeSharpe:.3f}']\r
    })\r
    compareDf\r
  exercise:\r
    prompt: 전략 비교 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      eqRet = portfolioReturn(initWeights, returns)\r
      eqRisk = portfolioRisk(initWeights, covMatrix)\r
      eqSharpe = sharpeRatio(initWeights, returns, covMatrix)\r
\r
      compareDf = pd.DataFrame({\r
          'Strategy': ['Equal Weight', 'Min Risk', 'Max Sharpe'],\r
          'Return': [f'{eqRet*100:.2f}%', f'{minRiskRet*100:.2f}%', f'{maxSharpeRet*100:.2f}%'],\r
          'Risk': [f'{eqRisk*100:.2f}%', f'{minRiskVol*100:.2f}%', f'{maxSharpeVol*100:.2f}%'],\r
          'Sharpe': [f'{eqSharpe:.3f}', f'{minRiskSharpe:.3f}', f'{maxSharpeSharpe:.3f}']\r
      })\r
      compareDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 전략 비교의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 전략 비교의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: frontier\r
  title: 효율적 프론티어\r
  structuredPrimary: true\r
  subtitle: 수익-위험 곡선\r
  goal: 효율적 프론티어에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 효율적 프론티어는 주어진 위험 수준에서 달성 가능한 최대 수익의 집합입니다. 목표 수익률을 변화시키며 각 수준에서 최소 위험 포트폴리오를 찾으면 프론티어를\r
    그릴 수 있습니다. 프론티어 위의 점만이 효율적인 투자입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    targetRets = np.linspace(0.05, 0.12, 50)\r
    frontierRisks = []\r
    frontierWeights = []\r
\r
    for target in targetRets:\r
        cons = [\r
            {'type': 'eq', 'fun': lambda w: np.sum(w) - 1},\r
            {'type': 'eq', 'fun': lambda w, t=target: portfolioReturn(w, returns) - t}\r
        ]\r
        res = optimize.minimize(negRisk, initWeights, method='SLSQP', bounds=bounds, constraints=cons)\r
        if res.success:\r
            frontierRisks.append(portfolioRisk(res.x, covMatrix))\r
            frontierWeights.append(res.x)\r
        else:\r
            frontierRisks.append(np.nan)\r
            frontierWeights.append(None)\r
  exercise:\r
    prompt: 효율적 프론티어 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      targetRets = np.linspace(0.05, 0.12, 50)\r
      frontierRisks = []\r
      frontierWeights = []\r
\r
      for target in targetRets:\r
          cons = [\r
              {'type': 'eq', 'fun': lambda w: np.sum(w) - 1},\r
              {'type': 'eq', 'fun': lambda w, t=target: portfolioReturn(w, returns) - t}\r
          ]\r
          res = optimize.minimize(negRisk, initWeights, method='SLSQP', bounds=bounds, constraints=cons)\r
          if res.success:\r
              frontierRisks.append(portfolioRisk(res.x, covMatrix))\r
              frontierWeights.append(res.x)\r
          else:\r
              frontierRisks.append(np.nan)\r
              frontierWeights.append(None)\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 효율적 프론티어의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 효율적 프론티어 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: monte\r
  title: 몬테카를로 시뮬레이션\r
  structuredPrimary: true\r
  subtitle: 랜덤 포트폴리오 분포\r
  goal: 몬테카를로 시뮬레이션에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 수천 개의 랜덤 포트폴리오를 생성하여 가능한 수익-위험 조합을 시각화합니다. 효율적 프론티어가 모든 랜덤 포트폴리오의 상단 경계임을 확인할 수 있습니다. 샤프\r
    비율을 색상으로 표현하면 최대샤프 포트폴리오가 가장 밝게 표시됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    np.random.seed(42)\r
    nSim = 10000\r
    simRets = []\r
    simRisks = []\r
    simSharpes = []\r
\r
    for _ in range(nSim):\r
        w = np.random.random(len(assets))\r
        w /= w.sum()\r
        simRets.append(portfolioReturn(w, returns))\r
        simRisks.append(portfolioRisk(w, covMatrix))\r
        simSharpes.append(sharpeRatio(w, returns, covMatrix))\r
  exercise:\r
    prompt: 몬테카를로 시뮬레이션 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      np.random.seed(42)\r
      nSim = 10000\r
      simRets = []\r
      simRisks = []\r
      simSharpes = []\r
\r
      for _ in range(nSim):\r
          w = np.random.random(len(assets))\r
          w /= w.sum()\r
          simRets.append(portfolioReturn(w, returns))\r
          simRisks.append(portfolioRisk(w, covMatrix))\r
          simSharpes.append(sharpeRatio(w, returns, covMatrix))\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 몬테카를로 시뮬레이션의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 몬테카를로 시뮬레이션 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: result\r
  title: 최종 추천\r
  structuredPrimary: true\r
  subtitle: 투자 보고서\r
  goal: 최종 추천에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 최적화 결과를 종합하면 최대샤프 포트폴리오가 위험 대비 가장 효율적입니다. 그러나 실제 투자에서는 개인의 위험 허용도, 투자 기간, 유동성 필요 등을 고려해야\r
    합니다. 최소위험과 최대샤프 사이에서 본인에게 맞는 지점을 선택하세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    reportDf = pd.DataFrame({\r
        'Portfolio': ['Max Sharpe (Recommended)'],\r
        'Stock A': [f'{maxSharpeW[0]*100:.1f}%'],\r
        'Stock B': [f'{maxSharpeW[1]*100:.1f}%'],\r
        'Bond': [f'{maxSharpeW[2]*100:.1f}%'],\r
        'Gold': [f'{maxSharpeW[3]*100:.1f}%'],\r
        'Exp Return': [f'{maxSharpeRet*100:.2f}%'],\r
        'Risk': [f'{maxSharpeVol*100:.2f}%'],\r
        'Sharpe': [f'{maxSharpeSharpe:.3f}']\r
    })\r
    reportDf\r
  exercise:\r
    prompt: 최종 추천 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      reportDf = pd.DataFrame({\r
          'Portfolio': ['Max Sharpe (Recommended)'],\r
          'Stock A': [f'{maxSharpeW[0]*100:.1f}%'],\r
          'Stock B': [f'{maxSharpeW[1]*100:.1f}%'],\r
          'Bond': [f'{maxSharpeW[2]*100:.1f}%'],\r
          'Gold': [f'{maxSharpeW[3]*100:.1f}%'],\r
          'Exp Return': [f'{maxSharpeRet*100:.2f}%'],\r
          'Risk': [f'{maxSharpeVol*100:.2f}%'],\r
          'Sharpe': [f'{maxSharpeSharpe:.3f}']\r
      })\r
      reportDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 최종 추천의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 최종 추천의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 포트폴리오 프로젝트\r
  goal: 실습에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 투자 분석가가 되어 다양한 자산 조합과 제약조건으로 포트폴리오를 최적화해보세요. 자산 수를 늘리거나 특정 자산에 최대 비중 제한을 두는 등 실무적인 조건을\r
    추가해보세요.\r
  snippet: |-\r
    assets5 = ['Tech', 'Healthcare', 'Energy', 'Real Estate', 'Treasury']\r
    returns5 = np.array([0.15, 0.11, 0.08, 0.09, 0.03])\r
    cov5 = np.array([\r
        [0.0400, 0.0180, 0.0100, 0.0120, 0.0010],\r
        [0.0180, 0.0289, 0.0080, 0.0100, 0.0005],\r
        [0.0100, 0.0080, 0.0324, 0.0150, 0.0002],\r
        [0.0120, 0.0100, 0.0150, 0.0256, 0.0008],\r
        [0.0010, 0.0005, 0.0002, 0.0008, 0.0009]\r
    ])\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      assets5 = ['Tech', 'Healthcare', 'Energy', 'Real Estate', 'Treasury']\r
      returns5 = np.array([0.15, 0.11, 0.08, 0.09, 0.03])\r
      cov5 = np.array([\r
          [0.0400, 0.0180, 0.0100, 0.0120, 0.0010],\r
          [0.0180, 0.0289, 0.0080, 0.0100, 0.0005],\r
          [0.0100, 0.0080, 0.0324, 0.0150, 0.0002],\r
          [0.0120, 0.0100, 0.0150, 0.0256, 0.0008],\r
          [0.0010, 0.0005, 0.0002, 0.0008, 0.0009]\r
      ])\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`assets5\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: 업무 흐름 검증\r
  structuredPrimary: true\r
  subtitle: SLA 지연시간 통계 게이트\r
  goal: 업무 흐름 검증에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: SciPy는 공식을 호출하는 연습만으로는 부족합니다. 업무에서는 측정값이 분석 가능한지 먼저 검증하고, 기준값을 넘는지 통계 검정으로 확인한 뒤, 보고 가능한\r
    신뢰구간과 개선 기준을 함께 제시해야 합니다. 아래 흐름은 API 지연시간이 SLA 기준을 넘는지 판단하고, 기준을 바꾸는 변주까지 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import numpy as np\r
    from scipy import optimize, stats\r
\r
    latencySamples = np.array([245, 260, 255, 271, 268, 290, 276, 263, 282, 274, 269, 258], dtype=float)\r
\r
    def validateLatencySamples(samples):\r
        values = np.asarray(samples, dtype=float)\r
        if values.size < 5:\r
            raise ValueError("통계 검정에는 최소 5개 이상의 측정값이 필요합니다.")\r
        if not np.isfinite(values).all():\r
            raise ValueError("지연시간 샘플에는 결측값이나 무한대가 없어야 합니다.")\r
        if (values <= 0).any():\r
            raise ValueError("지연시간은 0보다 커야 합니다.")\r
        return values\r
\r
    cleanLatency = validateLatencySamples(latencySamples)\r
    cleanLatency.mean(), cleanLatency.std(ddof=1)\r
  exercise:\r
    prompt: 업무 흐름 검증 예제에서 기대 문자열이나 실제 출력 문구를 바꾸고 assert 비교가 맞는지 확인하세요.\r
    starterCode: |-\r
      allowedMean = 264\r
      capThreshold = optimize.brentq(\r
          lambda threshold: np.clip(cleanLatency, None, threshold).mean() - allowedMean,\r
          cleanLatency.min(),\r
          cleanLatency.max(),\r
      )\r
      cappedMean = np.clip(cleanLatency, None, capThreshold).mean()\r
\r
      assert abs(cappedMean - allowedMean) < 1e-6\r
      {\r
          "allowedMean": allowedMean,\r
          "capThreshold": round(float(capThreshold), 2),\r
          "cappedMean": round(float(cappedMean), 2),\r
      }\r
    solution: |-\r
      import numpy as np\r
      from scipy import optimize, stats\r
\r
      latencySamples = np.array([245, 260, 255, 271, 268, 290, 276, 263, 282, 274, 269, 258], dtype=float)\r
\r
      def validateLatencySamples(samples):\r
          values = np.asarray(samples, dtype=float)\r
          if values.size < 5:\r
              raise ValueError("통계 검정에는 최소 5개 이상의 측정값이 필요합니다.")\r
          if not np.isfinite(values).all():\r
              raise ValueError("지연시간 샘플에는 결측값이나 무한대가 없어야 합니다.")\r
          if (values <= 0).any():\r
              raise ValueError("지연시간은 0보다 커야 합니다.")\r
          return values\r
\r
      cleanLatency = validateLatencySamples(latencySamples)\r
      cleanLatency.mean(), cleanLatency.std(ddof=1)\r
    hints:\r
    - 바꿀 지점은 expected 값과 실제 print()/계산 호출입니다.\r
    - 실행 뒤 기대값과 실제 결과가 같을 때만 검증이 통과하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 업무 흐름 검증에서 \`allowedMean\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 업무 흐름 검증에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
`;export{e as default};