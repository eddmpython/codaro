var e=`meta:
  packages:
  - matplotlib
  - pandas
  - seaborn
  id: seaborn_04
  title: 광고비판매액회귀
  order: 4
  category: seaborn
  difficulty: ⭐⭐
  badge: 기초
  outcomes: ["viz.regression"]
  prerequisites: ["viz.statistical"]
  estimatedMinutes: 55
  tags:
  - seaborn
  - regplot
  - 회귀
  - scatter
  - ci
  - advertising
  seo:
    title: Seaborn 회귀 시각화 - 광고비와 판매액 관계 분석
    description: Seaborn regplot으로 광고비와 판매액의 회귀 관계를 시각화합니다. 신뢰구간과 다양한 회귀 옵션을 배웁니다.
    keywords:
    - seaborn
    - regplot
    - 회귀
    - 신뢰구간
    - advertising
intro:
  emoji: 📺
  goal: 광고비와 판매액의 관계를 회귀선으로 시각화합니다.
  description: regplot으로 산점도와 회귀선을 함께 그리고, 신뢰구간으로 불확실성을 표현합니다. 이전에 배운 scatterplot, histplot, boxplot 개념을
    함께 활용합니다.
  direction: 광고비판매액회귀에서 정리된 데이터를 통계 차트로 보고 분포와 관계를 검증합니다.
  benefits:
  - 분석용 테이블 확인 후 통계 차트 구성에 맞는 코드 입력을 고릅니다.
  - 광고비판매액회귀 결과를 분포, 그룹, 관계 패턴 기준으로 즉시 점검합니다.
  - 완료한 코드를 탐색 리포트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(분석용 테이블)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 데이터 로드 처리 실행
      detail: 통계 차트 구성 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 산점도 확인 결과 검증
      detail: 분포, 그룹, 관계 패턴 기준으로 실행 결과를 비교합니다.
    - label: 광고비판매액회귀 재사용
      detail: 완성 코드를 탐색 리포트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 통계 시각화 환경
      detail: matplotlib, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.
    - label: 광고비판매액회귀 실행
      detail: 셀을 실행해 분포, 그룹, 관계 패턴와 예외 상태를 확인합니다.
    - label: 광고비판매액회귀 완료
      detail: 검증된 코드를 탐색 리포트로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: seaborn, matplotlib, pandas를 불러옵니다. 광고비 데이터는 TV, Radio, Newspaper 세 매체의 광고비와 판매액의 관계를 담고
    있습니다. 마케팅 분석에서 자주 사용되는 클래식한 데이터셋입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import seaborn as sns
    from codaro.curriculum.localData import loadLocalDataset
    import matplotlib.pyplot as plt
    import pandas as pd
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import seaborn as sns
      from codaro.curriculum.localData import loadLocalDataset
      import matplotlib.pyplot as plt
      import pandas as pd
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 라이브러리 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step2_data
  title: 2단계. 데이터 로드
  structuredPrimary: true
  subtitle: advertising 데이터셋
  goal: 2단계. 데이터 로드에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 광고비 데이터를 Codaro 로컬 데이터셋에서 불러옵니다. TV, Radio, Newspaper 광고비(천 달러)와 Sales(판매량, 천 단위)를 비교해
    어떤 매체가 판매에 가장 효과적인지 분석할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from codaro.curriculum.localData import loadLocalDataset

    adData = loadLocalDataset("advertising")
    adData.head()
  exercise:
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      from codaro.curriculum.localData import loadLocalDataset

      adData = loadLocalDataset("advertising")
      adData.head()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step3_scatter
  title: 3단계. 산점도 확인
  structuredPrimary: true
  subtitle: scatterplot으로 탐색
  goal: 3단계. 산점도 확인에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 먼저 scatterplot으로 TV 광고비와 판매액의 관계를 확인합니다. 이전 프로젝트에서 배운 scatterplot을 복습합니다. 두 변수 사이에 양의 상관관계가
    있는지, 이상치가 있는지 파악합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    fig, ax = plt.subplots(figsize=(8, 6))
    sns.scatterplot(data=adData, x='TV', y='Sales', alpha=0.7, ax=ax)
    ax.set_title('TV Advertising vs Sales')
    ax.set_xlabel('TV Advertising ($1000)')
    ax.set_ylabel('Sales (1000 units)')
    fig
  exercise:
    prompt: 3단계. 산점도 확인 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      fig, ax = plt.subplots(figsize=(8, 6))
      sns.scatterplot(data=adData, x='TV', y='Sales', alpha=0.7, ax=ax)
      ax.set_title('TV Advertising vs Sales')
      ax.set_xlabel('TV Advertising ($1000)')
      ax.set_ylabel('Sales (1000 units)')
      fig
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 산점도 확인의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 3단계. 산점도 확인 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step4_basic_reg
  title: 4단계. 기본 회귀선
  structuredPrimary: true
  subtitle: regplot()
  goal: 4단계. 기본 회귀선에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    regplot()은 산점도와 회귀선을 함께 그립니다. 기본적으로 선형 회귀(1차 함수)를 적용하고, 95% 신뢰구간을 음영으로 표시합니다. 회귀선의 기울기로 두 변수의 관계 강도를 파악할 수 있습니다.

    sns.regplot(data, x, y)는 산점도 + 회귀선 + 95% 신뢰구간을 그립니다. 회귀선은 최소제곱법(OLS)으로 피팅됩니다. 음영 영역은 회귀선 추정의 불확실성을 나타냅니다.
  tips:
  - sns.regplot(data, x, y)는 산점도 + 회귀선 + 95% 신뢰구간을 그립니다. 회귀선은 최소제곱법(OLS)으로 피팅됩니다. 음영 영역은 회귀선 추정의 불확실성을
    나타냅니다.
  snippet: |-
    figReg, axReg = plt.subplots(figsize=(8, 6))
    sns.regplot(data=adData, x='TV', y='Sales', ax=axReg)
    axReg.set_title('TV Advertising vs Sales (Regression)')
    axReg.set_xlabel('TV Advertising ($1000)')
    axReg.set_ylabel('Sales (1000 units)')
    figReg
  exercise:
    prompt: 4단계. 기본 회귀선 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figReg, axReg = plt.subplots(figsize=(8, 6))
      sns.regplot(data=adData, x='TV', y='Sales', ax=axReg)
      axReg.set_title('TV Advertising vs Sales (Regression)')
      axReg.set_xlabel('TV Advertising ($1000)')
      axReg.set_ylabel('Sales (1000 units)')
      figReg
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 4단계. 기본 회귀선의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 4단계. 기본 회귀선 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step5_ci
  title: 5단계. 신뢰구간 조절
  structuredPrimary: true
  subtitle: ci 파라미터
  goal: 5단계. 신뢰구간 조절에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    ci 파라미터로 신뢰구간의 수준을 변경할 수 있습니다. 기본값은 95%이며, 99%, 68% 등으로 조절하거나 ci=None으로 음영을 제거할 수 있습니다. 신뢰구간이 넓을수록 추정의 불확실성이 큽니다.

    ci=95(기본), ci=99, ci=68 등으로 신뢰구간을 설정합니다. ci=None으로 음영을 제거합니다. 신뢰구간은 부트스트랩 방법으로 계산됩니다.
  snippet: |-
    figCi, (axCi99, axCiNone) = plt.subplots(1, 2, figsize=(14, 5))

    sns.regplot(data=adData, x='TV', y='Sales', ci=99, ax=axCi99)
    axCi99.set_title('99% Confidence Interval')

    sns.regplot(data=adData, x='TV', y='Sales', ci=None, ax=axCiNone)
    axCiNone.set_title('No Confidence Interval')

    plt.tight_layout()
    figCi
  exercise:
    prompt: 5단계. 신뢰구간 조절 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figCi, (axCi99, axCiNone) = plt.subplots(1, 2, figsize=(14, 5))

      sns.regplot(data=adData, x='TV', y='Sales', ci=99, ax=axCi99)
      axCi99.set_title('99% Confidence Interval')

      sns.regplot(data=adData, x='TV', y='Sales', ci=None, ax=axCiNone)
      axCiNone.set_title('No Confidence Interval')

      plt.tight_layout()
      figCi
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 5단계. 신뢰구간 조절의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 5단계. 신뢰구간 조절 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step6_scatter_style
  title: 6단계. 산점도 스타일
  structuredPrimary: true
  subtitle: scatter_kws
  goal: 6단계. 산점도 스타일에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    scatter_kws 딕셔너리로 산점도 점의 스타일을 조절합니다. color, alpha, s(크기), edgecolor 등을 지정할 수 있습니다. line_kws로 회귀선 스타일도 변경할 수 있습니다.

    scatter_kws={'alpha': 0.5, 's': 30}로 점 스타일을, line_kws={'color': 'red', 'lw': 2}로 선 스타일을 지정합니다. kws는 keyword arguments의 약자입니다.
  tips:
  - 'scatter_kws={''alpha'': 0.5, ''s'': 30}로 점 스타일을, line_kws={''color'': ''red'', ''lw'': 2}로 선 스타일을
    지정합니다. kws는 keyword arguments의 약자입니다.'
  snippet: |-
    figStyled, axStyled = plt.subplots(figsize=(8, 6))
    sns.regplot(data=adData, x='TV', y='Sales',
               scatter_kws={'color': '#3498DB', 'alpha': 0.6, 's': 50, 'edgecolor': 'white'},
               line_kws={'color': '#E74C3C', 'linewidth': 2},
               ax=axStyled)
    axStyled.set_title('Styled Regression Plot')
    axStyled.set_xlabel('TV Advertising ($1000)')
    axStyled.set_ylabel('Sales (1000 units)')
    figStyled
  exercise:
    prompt: 6단계. 산점도 스타일 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figStyled, axStyled = plt.subplots(figsize=(8, 6))
      sns.regplot(data=adData, x='TV', y='Sales',
                 scatter_kws={'color': '#3498DB', 'alpha': 0.6, 's': 50, 'edgecolor': 'white'},
                 line_kws={'color': '#E74C3C', 'linewidth': 2},
                 ax=axStyled)
      axStyled.set_title('Styled Regression Plot')
      axStyled.set_xlabel('TV Advertising ($1000)')
      axStyled.set_ylabel('Sales (1000 units)')
      figStyled
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 6단계. 산점도 스타일의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 6단계. 산점도 스타일의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step7_compare_media
  title: 7단계. 매체별 비교
  structuredPrimary: true
  subtitle: 세 매체 회귀선
  goal: 7단계. 매체별 비교에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: TV, Radio, Newspaper 세 매체의 광고비-판매액 관계를 비교합니다. 회귀선의 기울기와 신뢰구간을 비교하면 어떤 매체가 판매에 더 효과적인지 파악할
    수 있습니다. R² 값이 높을수록 설명력이 좋습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figMedia, (axTv, axRadio, axNews) = plt.subplots(1, 3, figsize=(15, 5))

    sns.regplot(data=adData, x='TV', y='Sales', color='#E74C3C', ax=axTv)
    axTv.set_title('TV vs Sales')

    sns.regplot(data=adData, x='Radio', y='Sales', color='#27AE60', ax=axRadio)
    axRadio.set_title('Radio vs Sales')

    sns.regplot(data=adData, x='Newspaper', y='Sales', color='#3498DB', ax=axNews)
    axNews.set_title('Newspaper vs Sales')

    plt.tight_layout()
    figMedia
  exercise:
    prompt: 7단계. 매체별 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figMedia, (axTv, axRadio, axNews) = plt.subplots(1, 3, figsize=(15, 5))

      sns.regplot(data=adData, x='TV', y='Sales', color='#E74C3C', ax=axTv)
      axTv.set_title('TV vs Sales')

      sns.regplot(data=adData, x='Radio', y='Sales', color='#27AE60', ax=axRadio)
      axRadio.set_title('Radio vs Sales')

      sns.regplot(data=adData, x='Newspaper', y='Sales', color='#3498DB', ax=axNews)
      axNews.set_title('Newspaper vs Sales')

      plt.tight_layout()
      figMedia
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 7단계. 매체별 비교의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 7단계. 매체별 비교 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step8_residuals
  title: 8단계. 잔차 분석
  structuredPrimary: true
  subtitle: fit_reg=False
  goal: 8단계. 잔차 분석에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 회귀 분석에서 잔차(residual)는 실제값과 예측값의 차이입니다. 잔차가 무작위로 분포하면 선형 회귀가 적합하고, 패턴이 있으면 비선형 관계가 있을 수
    있습니다. fit_reg=False로 회귀선 없이 산점도만 그릴 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figScatter, axScatter = plt.subplots(figsize=(8, 6))
    sns.regplot(data=adData, x='TV', y='Sales', fit_reg=False,
               scatter_kws={'alpha': 0.6}, ax=axScatter)
    axScatter.set_title('TV vs Sales (Scatter Only)')
    figScatter
  exercise:
    prompt: 8단계. 잔차 분석 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figScatter, axScatter = plt.subplots(figsize=(8, 6))
      sns.regplot(data=adData, x='TV', y='Sales', fit_reg=False,
                 scatter_kws={'alpha': 0.6}, ax=axScatter)
      axScatter.set_title('TV vs Sales (Scatter Only)')
      figScatter
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 8단계. 잔차 분석의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 8단계. 잔차 분석의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step9_histogram
  title: 9단계. 분포와 함께 분석
  structuredPrimary: true
  subtitle: 이전 개념 복습
  goal: 9단계. 분포와 함께 분석에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 회귀 분석과 함께 각 변수의 분포도 확인하면 데이터를 더 잘 이해할 수 있습니다. 이전에 배운 histplot으로 판매액 분포를, boxplot으로 매체별
    광고비 분포를 확인합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figDist, (axDistReg, axDistHist) = plt.subplots(1, 2, figsize=(14, 5))

    sns.regplot(data=adData, x='TV', y='Sales', ax=axDistReg)
    axDistReg.set_title('TV vs Sales')

    sns.histplot(data=adData, x='Sales', kde=True, color='#27AE60', ax=axDistHist)
    axDistHist.set_title('Sales Distribution')

    plt.tight_layout()
    figDist
  exercise:
    prompt: 9단계. 분포와 함께 분석 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figDist, (axDistReg, axDistHist) = plt.subplots(1, 2, figsize=(14, 5))

      sns.regplot(data=adData, x='TV', y='Sales', ax=axDistReg)
      axDistReg.set_title('TV vs Sales')

      sns.histplot(data=adData, x='Sales', kde=True, color='#27AE60', ax=axDistHist)
      axDistHist.set_title('Sales Distribution')

      plt.tight_layout()
      figDist
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 9단계. 분포와 함께 분석의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 9단계. 분포와 함께 분석 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step10_final
  title: 10단계. 최종 분석 대시보드
  structuredPrimary: true
  subtitle: 종합 시각화
  goal: 10단계. 최종 분석 대시보드에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 지금까지 배운 모든 요소를 종합하여 광고비-판매액 분석 대시보드를 완성합니다. 세 매체의 회귀선과 판매액 분포를 한눈에 비교합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figFinal, axesFinal = plt.subplots(2, 2, figsize=(14, 10))

    sns.regplot(data=adData, x='TV', y='Sales', color='#E74C3C',
               scatter_kws={'alpha': 0.6}, ax=axesFinal[0, 0])
    axesFinal[0, 0].set_title('TV Advertising Effect')

    sns.regplot(data=adData, x='Radio', y='Sales', color='#27AE60',
               scatter_kws={'alpha': 0.6}, ax=axesFinal[0, 1])
    axesFinal[0, 1].set_title('Radio Advertising Effect')

    sns.regplot(data=adData, x='Newspaper', y='Sales', color='#3498DB',
               scatter_kws={'alpha': 0.6}, ax=axesFinal[1, 0])
    axesFinal[1, 0].set_title('Newspaper Advertising Effect')

    adMelted = adData.melt(id_vars=['Sales'], value_vars=['TV', 'Radio', 'Newspaper'],
                          var_name='Media', value_name='Spending')
    sns.boxplot(data=adMelted, x='Media', y='Spending', hue='Media', palette='Set2', legend=False, ax=axesFinal[1, 1])
    axesFinal[1, 1].set_title('Advertising Spending by Media')

    plt.tight_layout()
    figFinal
  exercise:
    prompt: 10단계. 최종 분석 대시보드 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figFinal, axesFinal = plt.subplots(2, 2, figsize=(14, 10))

      sns.regplot(data=adData, x='TV', y='Sales', color='#E74C3C',
                 scatter_kws={'alpha': 0.6}, ax=axesFinal[0, 0])
      axesFinal[0, 0].set_title('TV Advertising Effect')

      sns.regplot(data=adData, x='Radio', y='Sales', color='#27AE60',
                 scatter_kws={'alpha': 0.6}, ax=axesFinal[0, 1])
      axesFinal[0, 1].set_title('Radio Advertising Effect')

      sns.regplot(data=adData, x='Newspaper', y='Sales', color='#3498DB',
                 scatter_kws={'alpha': 0.6}, ax=axesFinal[1, 0])
      axesFinal[1, 0].set_title('Newspaper Advertising Effect')

      adMelted = adData.melt(id_vars=['Sales'], value_vars=['TV', 'Radio', 'Newspaper'],
                            var_name='Media', value_name='Spending')
      sns.boxplot(data=adMelted, x='Media', y='Spending', hue='Media', palette='Set2', legend=False, ax=axesFinal[1, 1])
      axesFinal[1, 1].set_title('Advertising Spending by Media')

      plt.tight_layout()
      figFinal
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 10단계. 최종 분석 대시보드의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 10단계. 최종 분석 대시보드의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 회귀 분석 프로젝트
  goal: 실습에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    지금까지 배운 regplot, ci, scatter_kws, line_kws를 활용해서 다양한 회귀 시각화를 만들어봅시다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import seaborn as sns
    from codaro.curriculum.localData import loadLocalDataset
    import matplotlib.pyplot as plt

    data = loadLocalDataset('tips')
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import seaborn as sns
      from codaro.curriculum.localData import loadLocalDataset
      import matplotlib.pyplot as plt

      data = loadLocalDataset('tips')
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: summary
  title: 정리
  blocks:
  - type: text
    content: Seaborn regplot으로 광고비와 판매액의 회귀 관계를 시각화했습니다.
  - type: list
    items:
    - sns.regplot() - 산점도 + 회귀선 + 신뢰구간
    - ci=95/99/None - 신뢰구간 수준 조절
    - scatter_kws - 점 스타일 딕셔너리
    - line_kws - 선 스타일 딕셔너리
    - fit_reg=False - 회귀선 없이 산점도만
    - 회귀선 기울기로 관계 강도 파악
  - type: text
    content: 다음 시간에는 barplot과 catplot으로 타이타닉 생존 분석을 합니다.
  goal: 정리에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.
- id: workflow_validation
  title: 11단계. 광고 회귀 차트 검증 루프
  structuredPrimary: true
  subtitle: 예측 → 오류 수정 → 검증 → 실무 변주
  goal: 11단계. 광고 회귀 차트 검증 루프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    회귀선은 그럴듯해 보이기 쉽습니다. 광고비와 매출의 관계를 먼저 수치로 확인하고, 차트가 회귀선과 축 라벨을 제대로 담았는지 검증합니다.

    회귀 차트는 모델링 전 탐색 도구입니다. 차트와 수치가 같은 방향을 가리키는지 항상 함께 확인하세요.
  snippet: |-
    from codaro.curriculum.localData import loadLocalDataset

    adFlow = loadLocalDataset("advertising")
    requiredColumns = {"TV", "Radio", "Newspaper", "Sales"}
    missingColumns = requiredColumns - set(adFlow.columns)

    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"
    assert adFlow[list(requiredColumns)].ge(0).all().all()

    salesCorrelation = adFlow.corr(numeric_only=True)["Sales"].drop("Sales").sort_values(ascending=False)
    assert salesCorrelation.index[0] == "TV"
    salesCorrelation.round(3)
  exercise:
    prompt: 11단계. 광고 회귀 차트 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      from codaro.curriculum.localData import loadLocalDataset

      adFlow = loadLocalDataset("advertising")
      requiredColumns = {"TV", "Radio", "Newspaper", "Sales"}
      missingColumns = requiredColumns - set(adFlow.columns)

      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"
      assert adFlow[list(requiredColumns)].ge(0).all().all()

      salesCorrelation = adFlow.corr(numeric_only=True)["Sales"].drop("Sales").sort_values(ascending=False)
      assert salesCorrelation.index[0] == "TV"
      salesCorrelation.round(3)
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 11단계. 광고 회귀 차트 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 11단계. 광고 회귀 차트 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
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
  - id: seaborn_04-advertising-regression-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - workflow_validation
    title: 광고비와 판매액 회귀 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 회귀선이 인과 효과가 아니라 관측 관계임을 드러내는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_advertising_regression(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_advertising_regression(rows):
            raise NotImplementedError
      solution: |
        def prepare_advertising_regression(rows):
            required = ['adSpend', 'sales', 'channel']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'channel'
            for row in usable:
                key = "all" if group_field is None else str(row[group_field])
                groups[key] = groups.get(key, 0) + 1
            x_values = [row['adSpend'] for row in usable]
            y_values = [row['sales'] for row in usable]
            return {
                "usableCount": len(usable),
                "excludedCount": len(rows) - len(usable),
                "groupCounts": {key: groups[key] for key in sorted(groups)},
                "xExtent": None if not x_values else [min(x_values), max(x_values)],
                "yExtent": None if not y_values else [min(y_values), max(y_values)],
            }
      hints: *id001
    check:
      id: python.seaborn.seaborn_04.advertising-regression-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.seaborn.seaborn_04.advertising-regression-data-evidence.mastery.behavior.v1.fixture
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
        entry: prepare_advertising_regression
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - adSpend: 10
              sales: 20
              channel: web
            - adSpend: 20
              sales: 28
              channel: web
            - adSpend: 10
              sales: 18
              channel: store
          expectedReturn:
            usableCount: 3
            excludedCount: 0
            groupCounts:
              store: 1
              web: 2
            xExtent:
            - 10
            - 20
            yExtent:
            - 18
            - 28
        - id: handles-empty-data
          arguments:
          - value: []
          expectedReturn:
            usableCount: 0
            excludedCount: 0
            groupCounts: {}
            xExtent: null
            yExtent: null
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: seaborn_04-advertising-regression-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - seaborn_04-advertising-regression-data-evidence-mastery
    title: 광고비와 판매액 회귀 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 교육 시간과 평가 점수의 관측 관계를 cohort별 회귀와 interval로 탐색한다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_advertising_regression(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_advertising_regression(candidate):
            raise NotImplementedError
      solution: |
        def audit_advertising_regression(candidate):
            expected = {'mark': 'regression', 'x': 'adSpend', 'y': 'sales', 'group': 'channel', 'transforms': ['confidence-interval', 'fit-linear'], 'interaction': 'none'}
            errors = []
            for name in ["mark", "x", "y", "group", "transforms", "interaction"]:
                actual = sorted(candidate.get(name, [])) if name == "transforms" else candidate.get(name)
                if actual != expected[name]:
                    errors.append(name)
            if not str(candidate.get("description", "")).strip():
                errors.append("description")
            return {"valid": not errors, "errors": errors, "encoding": expected}
      hints: *id002
    check:
      id: python.seaborn.seaborn_04.advertising-regression-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.seaborn.seaborn_04.advertising-regression-encoding-transfer.transfer.behavior.v1.fixture
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
        entry: audit_advertising_regression
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: regression
              x: adSpend
              y: sales
              group: channel
              transforms:
              - confidence-interval
              - fit-linear
              interaction: none
              description: 교육 시간과 평가 점수의 관측 관계를 cohort별 회귀와 interval로 탐색한다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: regression
              x: adSpend
              y: sales
              group: channel
              transforms:
              - confidence-interval
              - fit-linear
              interaction: none
        - id: reports-misleading-encoding
          arguments:
          - value:
              mark: table
              x: sales
              y: adSpend
              group: null
              transforms: []
              interaction: none
              description: ''
          expectedReturn:
            valid: false
            errors:
            - mark
            - x
            - y
            - group
            - transforms
            - description
            encoding:
              mark: regression
              x: adSpend
              y: sales
              group: channel
              transforms:
              - confidence-interval
              - fit-linear
              interaction: none
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: seaborn_04-advertising-regression-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - seaborn_04-advertising-regression-encoding-transfer-transfer
    title: 광고비와 판매액 회귀 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 회귀선이 인과 효과가 아니라 관측 관계임을 드러내는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_advertising_regression(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_advertising_regression(situation):
            raise NotImplementedError
      solution: |
        def choose_advertising_regression(situation):
            table = {'linear-association': {'encoding': 'scatter plus regression', 'evidence': 'residuals and interval', 'risk': 'causal wording'}, 'nonlinear-pattern': {'encoding': 'scatter plus flexible smoother', 'evidence': 'held-out fit', 'risk': 'overfit curve'}, 'extrapolation': {'encoding': 'observed-domain only', 'evidence': 'x range', 'risk': 'line beyond data'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.seaborn.seaborn_04.advertising-regression-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.seaborn.seaborn_04.advertising-regression-interpretation-retrieval.retrieval.behavior.v1.fixture
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
        entry: choose_advertising_regression
        cases:
        - id: recalls-linear-association
          arguments:
          - value: linear-association
          expectedReturn:
            encoding: scatter plus regression
            evidence: residuals and interval
            risk: causal wording
        - id: recalls-nonlinear-pattern
          arguments:
          - value: nonlinear-pattern
          expectedReturn:
            encoding: scatter plus flexible smoother
            evidence: held-out fit
            risk: overfit curve
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};