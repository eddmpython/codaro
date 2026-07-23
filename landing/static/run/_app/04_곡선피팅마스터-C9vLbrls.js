var e=`meta:
  packages:
  - matplotlib
  - numpy
  - pandas
  - scipy
  id: scipy_04
  title: 곡선피팅마스터
  order: 4
  category: scipy
  difficulty: ⭐⭐
  badge: 기초
  tags:
  - scipy.optimize
  - curve_fit
  - 비선형회귀
  - 모델피팅
  - 파라미터추정
  seo:
    title: scipy.optimize curve_fit - 데이터에 곡선 맞추기
    description: scipy.optimize의 curve_fit으로 데이터에 수학 함수를 피팅합니다. 지수함수, 로그함수, 다항식 피팅을 배웁니다.
    keywords:
    - scipy
    - curve_fit
    - 비선형회귀
    - 피팅
    - 파라미터추정
intro:
  emoji: 📐
  goal: 스타트업 사용자 증가 데이터를 지수 성장 모델로 피팅하여 미래 사용자를 예측합니다.
  description: 스타트업에서 12개월간 사용자 수를 기록했습니다. 이 데이터가 지수 성장을 따르는지 확인하고, 수학 모델 y = a × e^(bx)의 파라미터 a와 b를 찾아
    18개월 후 사용자 수를 예측합니다. scipy.optimize.curve_fit은 비선형 최소제곱법으로 데이터에 가장 잘 맞는 곡선의 파라미터를 자동으로 찾아줍니다. 성장률
    추정, 모델 검증, 예측까지 전체 워크플로우를 완성합니다.
  direction: 곡선피팅마스터에서 수치 데이터를 모델에 넣고 계산 결과와 오차를 검증합니다.
  benefits:
  - 수치 입력 확인 후 최적화/적분/신호 처리에 맞는 코드 입력을 고릅니다.
  - 곡선피팅마스터 결과를 오차와 결과 범위 기준으로 즉시 점검합니다.
  - 완료한 코드를 과학 계산 루틴에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 라이브러리 및 데이터 로드 입력 확인
      detail: 입력 기준(수치 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 데이터 탐색 처리 실행
      detail: 최적화/적분/신호 처리 코드를 실행해 중간 결과를 확인합니다.
    - label: 지수 성장 모델 정의 결과 검증
      detail: 오차와 결과 범위 기준으로 실행 결과를 비교합니다.
    - label: 곡선피팅마스터 재사용
      detail: 완성 코드를 과학 계산 루틴에 붙일 수 있게 정리합니다.
    runtime:
    - label: 과학 계산 환경
      detail: matplotlib, numpy, pandas, scipy 기준으로 로컬 Python 실행을 준비합니다.
    - label: 곡선피팅마스터 실행
      detail: 셀을 실행해 오차와 결과 범위와 예외 상태를 확인합니다.
    - label: 곡선피팅마스터 완료
      detail: 검증된 코드를 과학 계산 루틴로 남깁니다.
sections:
- id: load
  title: 라이브러리 및 데이터 로드
  structuredPrimary: true
  subtitle: scipy.optimize
  goal: 라이브러리 및 데이터 로드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    곡선 피팅(Curve Fitting)은 데이터에 가장 잘 맞는 수학 함수의 파라미터를 찾는 과정입니다. 사용자 증가율, 약물 농도 감소, 온도 냉각 등 자연 현상을 수학 모델로 표현하면 미래 예측이 가능해집니다. scipy.optimize.curve_fit은 비선형 함수도 피팅할 수 있어 선형 회귀보다 훨씬 유연합니다. 이 프로젝트에서는 가상의 스타트업 사용자 증가 데이터를 분석합니다.

    이 데이터는 y = 1000 × e^(0.15x) + 노이즈로 생성되었습니다. 월 15% 성장률을 가정한 지수 성장 모델입니다. curve_fit이 이 파라미터들을 얼마나 잘 찾아내는지 확인합니다.
  tips:
  - 이 데이터는 y = 1000 × e^(0.15x) + 노이즈로 생성되었습니다. 월 15% 성장률을 가정한 지수 성장 모델입니다. curve_fit이 이 파라미터들을 얼마나 잘
    찾아내는지 확인합니다.
  snippet: |-
    import scipy

    import numpy as np
    from scipy import optimize
    import matplotlib.pyplot as plt
    import pandas as pd

    np.random.seed(42)
    months = np.arange(1, 13)
    users = 1000 * np.exp(0.15 * months) + np.random.normal(0, 200, 12)
    users = np.maximum(users, 0).astype(int)
  exercise:
    prompt: 라이브러리 및 데이터 로드 예제에서 \`months\`, \`users\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      import scipy

      import numpy as np
      from scipy import optimize
      import matplotlib.pyplot as plt
      import pandas as pd

      np.random.seed(42)
      months = np.arange(1, 13)
      users = 1000 * np.exp(0.15 * months) + np.random.normal(0, 200, 12)
      users = np.maximum(users, 0).astype(int)
    hints:
    - 바꿀 지점은 \`months = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`months\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 라이브러리 및 데이터 로드에서 \`months\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 라이브러리 및 데이터 로드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: explore
  title: 데이터 탐색
  structuredPrimary: true
  subtitle: 성장 패턴 시각화
  goal: 데이터 탐색에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    피팅 전에 데이터를 시각화하여 어떤 모델이 적합한지 파악합니다. 사용자 수가 선형으로 증가하는지, 지수적으로 증가하는지에 따라 적용할 함수가 달라집니다. 그래프에서 증가 속도가 점점 빨라지면 지수 성장, 일정하면 선형 성장입니다. 로그 스케일로 그렸을 때 직선이면 지수 성장의 확실한 증거입니다.

    로그 스케일에서 거의 직선으로 보이면 지수 성장입니다. log(y) = log(a) + bx 형태가 되어 직선이 됩니다.
  snippet: |-
    figExplore, (axExplore1, axExplore2) = plt.subplots(1, 2, figsize=(14, 5))

    axExplore1.scatter(months, users, s=100, c='blue', label='Actual Users')
    axExplore1.set_xlabel('Month')
    axExplore1.set_ylabel('Users')
    axExplore1.set_title('User Growth (Linear Scale)')
    axExplore1.grid(True, alpha=0.3)

    axExplore2.scatter(months, users, s=100, c='blue')
    axExplore2.set_yscale('log')
    axExplore2.set_xlabel('Month')
    axExplore2.set_ylabel('Users (log scale)')
    axExplore2.set_title('User Growth (Log Scale)')
    axExplore2.grid(True, alpha=0.3)
    figExplore
  exercise:
    prompt: 데이터 탐색 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figExplore, (axExplore1, axExplore2) = plt.subplots(1, 2, figsize=(14, 5))

      axExplore1.scatter(months, users, s=100, c='blue', label='Actual Users')
      axExplore1.set_xlabel('Month')
      axExplore1.set_ylabel('Users')
      axExplore1.set_title('User Growth (Linear Scale)')
      axExplore1.grid(True, alpha=0.3)

      axExplore2.scatter(months, users, s=100, c='blue')
      axExplore2.set_yscale('log')
      axExplore2.set_xlabel('Month')
      axExplore2.set_ylabel('Users (log scale)')
      axExplore2.set_title('User Growth (Log Scale)')
      axExplore2.grid(True, alpha=0.3)
      figExplore
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 데이터 탐색의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 데이터 탐색 실행 결과가 오차와 결과 범위 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: define_model
  title: 지수 성장 모델 정의
  structuredPrimary: true
  subtitle: curve_fit용 함수
  goal: 지수 성장 모델 정의에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    curve_fit에 사용할 함수를 정의합니다. 함수의 첫 번째 인자는 반드시 독립변수(x)이고, 나머지 인자들이 찾을 파라미터입니다. 지수 성장 모델 y = a × e^(bx)에서 a는 초기 사용자 수, b는 성장률입니다. 함수는 numpy 배열을 입력받아 numpy 배열을 반환해야 합니다.

    def expGrowth(x, a, b)에서 x는 독립변수, a와 b가 curve_fit이 최적화할 파라미터입니다. 파라미터 수는 제한이 없습니다.
  snippet: |-
    def expGrowth(x, a, b):
        return a * np.exp(b * x)
  exercise:
    prompt: 지수 성장 모델 정의 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def expGrowth(x, a, b):
          return a * np.exp(b * x)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 지수 성장 모델 정의의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 지수 성장 모델 정의 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: fitting
  title: 곡선 피팅 실행
  structuredPrimary: true
  subtitle: curve_fit
  goal: 곡선 피팅 실행에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    curve_fit(함수, x데이터, y데이터)를 호출하면 최적 파라미터와 공분산 행렬을 반환합니다. p0 인자로 초기 추정값을 제공하면 수렴이 빠르고 안정적입니다. 비선형 최적화는 초기값에 따라 결과가 달라질 수 있으므로, 도메인 지식을 활용하여 합리적인 초기값을 설정하는 것이 중요합니다.

    p0=[1000, 0.1]은 '초기 사용자 약 1000명, 월 10% 성장률'이라는 초기 추정입니다. curve_fit은 이 값에서 시작하여 최적값을 찾습니다.
  snippet: |-
    params, covariance = optimize.curve_fit(expGrowth, months, users, p0=[1000, 0.1])
    aFit, bFit = params
    aFit, bFit
  exercise:
    prompt: 곡선 피팅 실행 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      params, covariance = optimize.curve_fit(expGrowth, months, users, p0=[1000, 0.1])
      aFit, bFit = params
      aFit, bFit
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 곡선 피팅 실행의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 곡선 피팅 실행 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: validate
  title: 피팅 검증
  structuredPrimary: true
  subtitle: R² 및 잔차 분석
  goal: 피팅 검증에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    피팅 품질을 평가하기 위해 R²(결정계수)와 잔차를 분석합니다. R²는 0~1 사이 값으로, 1에 가까울수록 모델이 데이터를 잘 설명합니다. 잔차(실제값 - 예측값)가 무작위로 분포하면 좋은 모델이고, 패턴이 있으면 모델이 데이터의 특성을 놓치고 있다는 의미입니다.

    잔차가 0 주위에 무작위로 분포하고 특별한 패턴이 없으면 모델이 적합합니다. 잔차에 곡선 패턴이 있으면 모델을 변경해야 합니다.
  snippet: |-
    usersPred = expGrowth(months, aFit, bFit)
    ssRes = np.sum((users - usersPred) ** 2)
    ssTot = np.sum((users - np.mean(users)) ** 2)
    rSquared = 1 - (ssRes / ssTot)
    rSquared
  exercise:
    prompt: 피팅 검증 예제에서 \`usersPred\`, \`ssRes\`, \`ssTot\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      usersPred = expGrowth(months, aFit, bFit)
      ssRes = np.sum((users - usersPred) ** 2)
      ssTot = np.sum((users - np.mean(users)) ** 2)
      rSquared = 1 - (ssRes / ssTot)
      rSquared
    hints:
    - 바꿀 지점은 \`usersPred = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`usersPred\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 피팅 검증에서 \`usersPred\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 피팅 검증 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: predict
  title: 미래 예측
  structuredPrimary: true
  subtitle: 18개월 후 사용자
  goal: 미래 예측에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 피팅된 모델로 미래 사용자 수를 예측합니다. 단, 외삽(데이터 범위 밖 예측)은 불확실성이 크므로 주의해야 합니다. 파라미터의 표준오차를 이용하여 예측의 신뢰구간도
    계산합니다. 공분산 행렬의 대각 원소 제곱근이 각 파라미터의 표준오차입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    futureMonths = np.arange(1, 19)
    futureUsers = expGrowth(futureMonths, aFit, bFit)

    predDf = pd.DataFrame({
        'Month': [12, 15, 18],
        'Predicted Users': [int(expGrowth(12, aFit, bFit)), int(expGrowth(15, aFit, bFit)), int(expGrowth(18, aFit, bFit))]
    })
    predDf
  exercise:
    prompt: 미래 예측 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      futureMonths = np.arange(1, 19)
      futureUsers = expGrowth(futureMonths, aFit, bFit)

      predDf = pd.DataFrame({
          'Month': [12, 15, 18],
          'Predicted Users': [int(expGrowth(12, aFit, bFit)), int(expGrowth(15, aFit, bFit)), int(expGrowth(18, aFit, bFit))]
      })
      predDf
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 미래 예측의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 미래 예측의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: result
  title: 최종 분석 보고서
  structuredPrimary: true
  subtitle: 성장률 및 예측 요약
  goal: 최종 분석 보고서에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 곡선 피팅 결과를 종합하여 비즈니스 인사이트를 도출합니다. 월별 성장률, 배증 시간(사용자가 2배가 되는 기간), 연간 성장률 등을 계산합니다. 이러한 지표는
    투자자 보고, 사업 계획, 인프라 확장 계획에 활용됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    monthlyGrowthRate = bFit
    doublingTime = np.log(2) / bFit
    annualGrowthRate = (np.exp(bFit * 12) - 1) * 100

    growthDf = pd.DataFrame({
        'Metric': ['Monthly Growth Rate', 'Doubling Time', 'Annual Growth Rate', 'Initial Users (a)', 'R² Score'],
        'Value': [f'{monthlyGrowthRate*100:.1f}%', f'{doublingTime:.1f} months', f'{annualGrowthRate:.0f}%', f'{aFit:.0f}', f'{rSquared:.4f}']
    })
    growthDf
  exercise:
    prompt: 최종 분석 보고서 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      monthlyGrowthRate = bFit
      doublingTime = np.log(2) / bFit
      annualGrowthRate = (np.exp(bFit * 12) - 1) * 100

      growthDf = pd.DataFrame({
          'Metric': ['Monthly Growth Rate', 'Doubling Time', 'Annual Growth Rate', 'Initial Users (a)', 'R² Score'],
          'Value': [f'{monthlyGrowthRate*100:.1f}%', f'{doublingTime:.1f} months', f'{annualGrowthRate:.0f}%', f'{aFit:.0f}', f'{rSquared:.4f}']
      })
      growthDf
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 최종 분석 보고서의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 최종 분석 보고서의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 곡선 피팅 프로젝트
  goal: 실습에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    지금까지 배운 curve_fit, 파라미터 해석, R² 계산, 예측을 활용하여 다양한 현상을 모델링합니다. 미션1은 배터리 방전 곡선(지수 감쇠), 미션2는 로지스틱 성장 모델(S자 곡선)입니다. 각 미션은 함수 정의, 피팅, 검증, 시각화를 포함합니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import numpy as np
    from scipy import optimize
    import matplotlib.pyplot as plt
    import pandas as pd

    def batteryDecay(t, v0, tau, vMin):
        return (v0 - vMin) * np.exp(-t / tau) + vMin

    np.random.seed(222)
    hours = np.arange(0, 25, 2)
    voltage = (4.2 - 3.0) * np.exp(-hours / 10) + 3.0 + np.random.normal(0, 0.05, len(hours))
  exercise:
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import numpy as np
      from scipy import optimize
      import matplotlib.pyplot as plt
      import pandas as pd

      def batteryDecay(t, v0, tau, vMin):
          return (v0 - vMin) * np.exp(-t / tau) + vMin

      np.random.seed(222)
      hours = np.arange(0, 25, 2)
      voltage = (4.2 - 3.0) * np.exp(-hours / 10) + 3.0 + np.random.normal(0, 0.05, len(hours))
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 실습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 실습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: 업무 흐름 검증
  structuredPrimary: true
  subtitle: SLA 지연시간 통계 게이트
  goal: 업무 흐름 검증에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: SciPy는 공식을 호출하는 연습만으로는 부족합니다. 업무에서는 측정값이 분석 가능한지 먼저 검증하고, 기준값을 넘는지 통계 검정으로 확인한 뒤, 보고 가능한
    신뢰구간과 개선 기준을 함께 제시해야 합니다. 아래 흐름은 API 지연시간이 SLA 기준을 넘는지 판단하고, 기준을 바꾸는 변주까지 확인합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import numpy as np
    from scipy import optimize, stats

    latencySamples = np.array([245, 260, 255, 271, 268, 290, 276, 263, 282, 274, 269, 258], dtype=float)

    def validateLatencySamples(samples):
        values = np.asarray(samples, dtype=float)
        if values.size < 5:
            raise ValueError("통계 검정에는 최소 5개 이상의 측정값이 필요합니다.")
        if not np.isfinite(values).all():
            raise ValueError("지연시간 샘플에는 결측값이나 무한대가 없어야 합니다.")
        if (values <= 0).any():
            raise ValueError("지연시간은 0보다 커야 합니다.")
        return values

    cleanLatency = validateLatencySamples(latencySamples)
    cleanLatency.mean(), cleanLatency.std(ddof=1)
  exercise:
    prompt: 업무 흐름 검증 예제에서 기대 문자열이나 실제 출력 문구를 바꾸고 assert 비교가 맞는지 확인하세요.
    starterCode: |-
      allowedMean = 264
      capThreshold = optimize.brentq(
          lambda threshold: np.clip(cleanLatency, None, threshold).mean() - allowedMean,
          cleanLatency.min(),
          cleanLatency.max(),
      )
      cappedMean = np.clip(cleanLatency, None, capThreshold).mean()

      assert abs(cappedMean - allowedMean) < 1e-6
      {
          "allowedMean": allowedMean,
          "capThreshold": round(float(capThreshold), 2),
          "cappedMean": round(float(cappedMean), 2),
      }
    solution: |-
      import numpy as np
      from scipy import optimize, stats

      latencySamples = np.array([245, 260, 255, 271, 268, 290, 276, 263, 282, 274, 269, 258], dtype=float)

      def validateLatencySamples(samples):
          values = np.asarray(samples, dtype=float)
          if values.size < 5:
              raise ValueError("통계 검정에는 최소 5개 이상의 측정값이 필요합니다.")
          if not np.isfinite(values).all():
              raise ValueError("지연시간 샘플에는 결측값이나 무한대가 없어야 합니다.")
          if (values <= 0).any():
              raise ValueError("지연시간은 0보다 커야 합니다.")
          return values

      cleanLatency = validateLatencySamples(latencySamples)
      cleanLatency.mean(), cleanLatency.std(ddof=1)
    hints:
    - 바꿀 지점은 expected 값과 실제 print()/계산 호출입니다.
    - 실행 뒤 기대값과 실제 결과가 같을 때만 검증이 통과하는지 보세요.
  check:
    type: noError
    noError: 업무 흐름 검증에서 \`allowedMean\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 업무 흐름 검증에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.
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
  - id: scipy_04-linear-fit-residuals-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - load
    - workflow_validation
    title: 직선 피팅의 계수와 잔차 근거 계산하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 최소제곱 slope·intercept·MAE를 반환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 계수만 반환하지 말고 각 관측의 residual을 남기세요.
    - 같은 x만 있으면 slope를 식별할 수 없습니다.
    exercise:
      prompt: fit_line(x_values, y_values)를 완성하세요.
      starterCode: |-
        def fit_line(x_values, y_values):
            raise NotImplementedError
      solution: |
        def fit_line(x_values, y_values):
            if len(x_values) != len(y_values) or len(x_values) < 2: raise ValueError("invalid fit data")
            x_mean = sum(x_values)/len(x_values); y_mean = sum(y_values)/len(y_values)
            denominator = sum((x-x_mean)**2 for x in x_values)
            if denominator == 0: raise ValueError("constant x")
            slope = sum((x-x_mean)*(y-y_mean) for x,y in zip(x_values,y_values))/denominator
            intercept = y_mean-slope*x_mean
            residuals = [y-(slope*x+intercept) for x,y in zip(x_values,y_values)]
            return {"slope": round(slope,6), "intercept": round(intercept,6), "mae": round(sum(abs(value) for value in residuals)/len(residuals),6), "residuals": [round(value,6) for value in residuals]}
      hints: *id001
    check:
      id: python.scipy.scipy_04.linear-fit-residuals.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.scipy.scipy_04.linear-fit-residuals.mastery.behavior.v1.fixture
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
        entry: fit_line
        cases:
        - id: fits-perfect-line
          arguments:
          - value:
            - 0
            - 1
            - 2
          - value:
            - 1
            - 3
            - 5
          expectedReturn:
            slope: 2.0
            intercept: 1.0
            mae: 0.0
            residuals:
            - 0.0
            - 0.0
            - 0.0
        - id: fits-noisy-line
          arguments:
          - value:
            - 0
            - 1
            - 2
          - value:
            - 0
            - 2
            - 3
          expectedReturn:
            slope: 1.5
            intercept: 0.166667
            mae: 0.222222
            residuals:
            - -0.166667
            - 0.333333
            - -0.166667
        - id: rejects-constant-x
          arguments:
          - value:
            - 1
            - 1
          - value:
            - 2
            - 3
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: scipy_04-fit-validation-split-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - scipy_04-linear-fit-residuals-mastery
    title: 새 curve fit에 검증 분리 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 시간 순서를 보존한 train·validation split과 누수 위험을 검사한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 시계열을 무작위로 섞지 말고 미래 구간을 검증에 두세요.
    - fit residual과 validation error를 별도 근거로 남기세요.
    exercise:
      prompt: plan_fit_validation(rows, validation_count)를 완성하세요.
      starterCode: |-
        def plan_fit_validation(rows, validation_count):
            raise NotImplementedError
      solution: |
        def plan_fit_validation(rows, validation_count):
            if validation_count <= 0 or validation_count >= len(rows): raise ValueError("invalid validation size")
            ordered = sorted(rows, key=lambda row: row["time"])
            train = ordered[:-validation_count]; validation = ordered[-validation_count:]
            return {"trainIds": [row["id"] for row in train], "validationIds": [row["id"] for row in validation], "boundary": validation[0]["time"], "leakage": max(row["time"] for row in train) >= min(row["time"] for row in validation)}
      hints: *id002
    check:
      id: python.scipy.scipy_04.fit-validation-split.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.scipy.scipy_04.fit-validation-split.transfer.behavior.v1.fixture
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
        entry: plan_fit_validation
        cases:
        - id: holds-out-latest
          arguments:
          - value:
            - id: c
              time: 3
            - id: a
              time: 1
            - id: b
              time: 2
          - value: 1
          expectedReturn:
            trainIds:
            - a
            - b
            validationIds:
            - c
            boundary: 3
            leakage: false
        - id: holds-out-two
          arguments:
          - value:
            - id: 1
              time: 1
            - id: 2
              time: 2
            - id: 3
              time: 3
            - id: 4
              time: 4
          - value: 2
          expectedReturn:
            trainIds:
            - 1
            - 2
            validationIds:
            - 3
            - 4
            boundary: 3
            leakage: false
        - id: rejects-all-validation
          arguments:
          - value:
            - id: 1
              time: 1
          - value: 1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: scipy_04-curve-fit-evidence-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - scipy_04-fit-validation-split-transfer
    title: curve fitting 검증 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 계수·잔차·일반화를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 수치 방법의 입력 가정과 오차 근거를 함께 남기세요.
    - p-value나 최적화 성공 flag 하나를 결론으로 사용하지 마세요.
    exercise:
      prompt: choose_fit_evidence(situation)를 완성해 method, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_fit_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_fit_evidence(situation):
            table = {'parameter-estimation': {'method': 'least squares', 'evidence': 'parameters covariance residuals', 'risk': 'local optimum'}, 'model-shape': {'method': 'candidate comparison', 'evidence': 'validation error', 'risk': 'training fit'}, 'time-series-fit': {'method': 'future holdout', 'evidence': 'split boundary', 'risk': 'temporal leakage'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.scipy.scipy_04.curve-fit-evidence.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.scipy.scipy_04.curve-fit-evidence.retrieval.behavior.v1.fixture
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
        entry: choose_fit_evidence
        cases:
        - id: recalls-parameter-estimation
          arguments:
          - value: parameter-estimation
          expectedReturn:
            method: least squares
            evidence: parameters covariance residuals
            risk: local optimum
        - id: recalls-model-shape
          arguments:
          - value: model-shape
          expectedReturn:
            method: candidate comparison
            evidence: validation error
            risk: training fit
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};