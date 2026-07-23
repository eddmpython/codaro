var e=`meta:\r
  packages:\r
  - matplotlib\r
  - pandas\r
  - seaborn\r
  id: seaborn_04\r
  title: 광고비판매액회귀\r
  order: 4\r
  category: seaborn\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - seaborn\r
  - regplot\r
  - 회귀\r
  - scatter\r
  - ci\r
  - advertising\r
  seo:\r
    title: Seaborn 회귀 시각화 - 광고비와 판매액 관계 분석\r
    description: Seaborn regplot으로 광고비와 판매액의 회귀 관계를 시각화합니다. 신뢰구간과 다양한 회귀 옵션을 배웁니다.\r
    keywords:\r
    - seaborn\r
    - regplot\r
    - 회귀\r
    - 신뢰구간\r
    - advertising\r
intro:\r
  emoji: 📺\r
  goal: 광고비와 판매액의 관계를 회귀선으로 시각화합니다.\r
  description: regplot으로 산점도와 회귀선을 함께 그리고, 신뢰구간으로 불확실성을 표현합니다. 이전에 배운 scatterplot, histplot, boxplot 개념을\r
    함께 활용합니다.\r
  direction: 광고비판매액회귀에서 정리된 데이터를 통계 차트로 보고 분포와 관계를 검증합니다.\r
  benefits:\r
  - 분석용 테이블 확인 후 통계 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 광고비판매액회귀 결과를 분포, 그룹, 관계 패턴 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 탐색 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(분석용 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 통계 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 산점도 확인 결과 검증\r
      detail: 분포, 그룹, 관계 패턴 기준으로 실행 결과를 비교합니다.\r
    - label: 광고비판매액회귀 재사용\r
      detail: 완성 코드를 탐색 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 통계 시각화 환경\r
      detail: matplotlib, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 광고비판매액회귀 실행\r
      detail: 셀을 실행해 분포, 그룹, 관계 패턴와 예외 상태를 확인합니다.\r
    - label: 광고비판매액회귀 완료\r
      detail: 검증된 코드를 탐색 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: seaborn, matplotlib, pandas를 불러옵니다. 광고비 데이터는 TV, Radio, Newspaper 세 매체의 광고비와 판매액의 관계를 담고\r
    있습니다. 마케팅 분석에서 자주 사용되는 클래식한 데이터셋입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step2_data\r
  title: 2단계. 데이터 로드\r
  structuredPrimary: true\r
  subtitle: advertising 데이터셋\r
  goal: 2단계. 데이터 로드에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 광고비 데이터를 Codaro 로컬 데이터셋에서 불러옵니다. TV, Radio, Newspaper 광고비(천 달러)와 Sales(판매량, 천 단위)를 비교해\r
    어떤 매체가 판매에 가장 효과적인지 분석할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    adData = loadLocalDataset("advertising")\r
    adData.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      adData = loadLocalDataset("advertising")\r
      adData.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_scatter\r
  title: 3단계. 산점도 확인\r
  structuredPrimary: true\r
  subtitle: scatterplot으로 탐색\r
  goal: 3단계. 산점도 확인에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 먼저 scatterplot으로 TV 광고비와 판매액의 관계를 확인합니다. 이전 프로젝트에서 배운 scatterplot을 복습합니다. 두 변수 사이에 양의 상관관계가\r
    있는지, 이상치가 있는지 파악합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    fig, ax = plt.subplots(figsize=(8, 6))\r
    sns.scatterplot(data=adData, x='TV', y='Sales', alpha=0.7, ax=ax)\r
    ax.set_title('TV Advertising vs Sales')\r
    ax.set_xlabel('TV Advertising ($1000)')\r
    ax.set_ylabel('Sales (1000 units)')\r
    fig\r
  exercise:\r
    prompt: 3단계. 산점도 확인 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fig, ax = plt.subplots(figsize=(8, 6))\r
      sns.scatterplot(data=adData, x='TV', y='Sales', alpha=0.7, ax=ax)\r
      ax.set_title('TV Advertising vs Sales')\r
      ax.set_xlabel('TV Advertising ($1000)')\r
      ax.set_ylabel('Sales (1000 units)')\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 산점도 확인의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 산점도 확인 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step4_basic_reg\r
  title: 4단계. 기본 회귀선\r
  structuredPrimary: true\r
  subtitle: regplot()\r
  goal: 4단계. 기본 회귀선에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    regplot()은 산점도와 회귀선을 함께 그립니다. 기본적으로 선형 회귀(1차 함수)를 적용하고, 95% 신뢰구간을 음영으로 표시합니다. 회귀선의 기울기로 두 변수의 관계 강도를 파악할 수 있습니다.\r
\r
    sns.regplot(data, x, y)는 산점도 + 회귀선 + 95% 신뢰구간을 그립니다. 회귀선은 최소제곱법(OLS)으로 피팅됩니다. 음영 영역은 회귀선 추정의 불확실성을 나타냅니다.\r
  tips:\r
  - sns.regplot(data, x, y)는 산점도 + 회귀선 + 95% 신뢰구간을 그립니다. 회귀선은 최소제곱법(OLS)으로 피팅됩니다. 음영 영역은 회귀선 추정의 불확실성을\r
    나타냅니다.\r
  snippet: |-\r
    figReg, axReg = plt.subplots(figsize=(8, 6))\r
    sns.regplot(data=adData, x='TV', y='Sales', ax=axReg)\r
    axReg.set_title('TV Advertising vs Sales (Regression)')\r
    axReg.set_xlabel('TV Advertising ($1000)')\r
    axReg.set_ylabel('Sales (1000 units)')\r
    figReg\r
  exercise:\r
    prompt: 4단계. 기본 회귀선 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figReg, axReg = plt.subplots(figsize=(8, 6))\r
      sns.regplot(data=adData, x='TV', y='Sales', ax=axReg)\r
      axReg.set_title('TV Advertising vs Sales (Regression)')\r
      axReg.set_xlabel('TV Advertising ($1000)')\r
      axReg.set_ylabel('Sales (1000 units)')\r
      figReg\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 기본 회귀선의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 기본 회귀선 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step5_ci\r
  title: 5단계. 신뢰구간 조절\r
  structuredPrimary: true\r
  subtitle: ci 파라미터\r
  goal: 5단계. 신뢰구간 조절에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    ci 파라미터로 신뢰구간의 수준을 변경할 수 있습니다. 기본값은 95%이며, 99%, 68% 등으로 조절하거나 ci=None으로 음영을 제거할 수 있습니다. 신뢰구간이 넓을수록 추정의 불확실성이 큽니다.\r
\r
    ci=95(기본), ci=99, ci=68 등으로 신뢰구간을 설정합니다. ci=None으로 음영을 제거합니다. 신뢰구간은 부트스트랩 방법으로 계산됩니다.\r
  snippet: |-\r
    figCi, (axCi99, axCiNone) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
    sns.regplot(data=adData, x='TV', y='Sales', ci=99, ax=axCi99)\r
    axCi99.set_title('99% Confidence Interval')\r
\r
    sns.regplot(data=adData, x='TV', y='Sales', ci=None, ax=axCiNone)\r
    axCiNone.set_title('No Confidence Interval')\r
\r
    plt.tight_layout()\r
    figCi\r
  exercise:\r
    prompt: 5단계. 신뢰구간 조절 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figCi, (axCi99, axCiNone) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
      sns.regplot(data=adData, x='TV', y='Sales', ci=99, ax=axCi99)\r
      axCi99.set_title('99% Confidence Interval')\r
\r
      sns.regplot(data=adData, x='TV', y='Sales', ci=None, ax=axCiNone)\r
      axCiNone.set_title('No Confidence Interval')\r
\r
      plt.tight_layout()\r
      figCi\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 신뢰구간 조절의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 신뢰구간 조절 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step6_scatter_style\r
  title: 6단계. 산점도 스타일\r
  structuredPrimary: true\r
  subtitle: scatter_kws\r
  goal: 6단계. 산점도 스타일에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    scatter_kws 딕셔너리로 산점도 점의 스타일을 조절합니다. color, alpha, s(크기), edgecolor 등을 지정할 수 있습니다. line_kws로 회귀선 스타일도 변경할 수 있습니다.\r
\r
    scatter_kws={'alpha': 0.5, 's': 30}로 점 스타일을, line_kws={'color': 'red', 'lw': 2}로 선 스타일을 지정합니다. kws는 keyword arguments의 약자입니다.\r
  tips:\r
  - 'scatter_kws={''alpha'': 0.5, ''s'': 30}로 점 스타일을, line_kws={''color'': ''red'', ''lw'': 2}로 선 스타일을\r
    지정합니다. kws는 keyword arguments의 약자입니다.'\r
  snippet: |-\r
    figStyled, axStyled = plt.subplots(figsize=(8, 6))\r
    sns.regplot(data=adData, x='TV', y='Sales',\r
               scatter_kws={'color': '#3498DB', 'alpha': 0.6, 's': 50, 'edgecolor': 'white'},\r
               line_kws={'color': '#E74C3C', 'linewidth': 2},\r
               ax=axStyled)\r
    axStyled.set_title('Styled Regression Plot')\r
    axStyled.set_xlabel('TV Advertising ($1000)')\r
    axStyled.set_ylabel('Sales (1000 units)')\r
    figStyled\r
  exercise:\r
    prompt: 6단계. 산점도 스타일 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figStyled, axStyled = plt.subplots(figsize=(8, 6))\r
      sns.regplot(data=adData, x='TV', y='Sales',\r
                 scatter_kws={'color': '#3498DB', 'alpha': 0.6, 's': 50, 'edgecolor': 'white'},\r
                 line_kws={'color': '#E74C3C', 'linewidth': 2},\r
                 ax=axStyled)\r
      axStyled.set_title('Styled Regression Plot')\r
      axStyled.set_xlabel('TV Advertising ($1000)')\r
      axStyled.set_ylabel('Sales (1000 units)')\r
      figStyled\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 산점도 스타일의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 산점도 스타일의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_compare_media\r
  title: 7단계. 매체별 비교\r
  structuredPrimary: true\r
  subtitle: 세 매체 회귀선\r
  goal: 7단계. 매체별 비교에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: TV, Radio, Newspaper 세 매체의 광고비-판매액 관계를 비교합니다. 회귀선의 기울기와 신뢰구간을 비교하면 어떤 매체가 판매에 더 효과적인지 파악할\r
    수 있습니다. R² 값이 높을수록 설명력이 좋습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figMedia, (axTv, axRadio, axNews) = plt.subplots(1, 3, figsize=(15, 5))\r
\r
    sns.regplot(data=adData, x='TV', y='Sales', color='#E74C3C', ax=axTv)\r
    axTv.set_title('TV vs Sales')\r
\r
    sns.regplot(data=adData, x='Radio', y='Sales', color='#27AE60', ax=axRadio)\r
    axRadio.set_title('Radio vs Sales')\r
\r
    sns.regplot(data=adData, x='Newspaper', y='Sales', color='#3498DB', ax=axNews)\r
    axNews.set_title('Newspaper vs Sales')\r
\r
    plt.tight_layout()\r
    figMedia\r
  exercise:\r
    prompt: 7단계. 매체별 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figMedia, (axTv, axRadio, axNews) = plt.subplots(1, 3, figsize=(15, 5))\r
\r
      sns.regplot(data=adData, x='TV', y='Sales', color='#E74C3C', ax=axTv)\r
      axTv.set_title('TV vs Sales')\r
\r
      sns.regplot(data=adData, x='Radio', y='Sales', color='#27AE60', ax=axRadio)\r
      axRadio.set_title('Radio vs Sales')\r
\r
      sns.regplot(data=adData, x='Newspaper', y='Sales', color='#3498DB', ax=axNews)\r
      axNews.set_title('Newspaper vs Sales')\r
\r
      plt.tight_layout()\r
      figMedia\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 매체별 비교의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 매체별 비교 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step8_residuals\r
  title: 8단계. 잔차 분석\r
  structuredPrimary: true\r
  subtitle: fit_reg=False\r
  goal: 8단계. 잔차 분석에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 회귀 분석에서 잔차(residual)는 실제값과 예측값의 차이입니다. 잔차가 무작위로 분포하면 선형 회귀가 적합하고, 패턴이 있으면 비선형 관계가 있을 수\r
    있습니다. fit_reg=False로 회귀선 없이 산점도만 그릴 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figScatter, axScatter = plt.subplots(figsize=(8, 6))\r
    sns.regplot(data=adData, x='TV', y='Sales', fit_reg=False,\r
               scatter_kws={'alpha': 0.6}, ax=axScatter)\r
    axScatter.set_title('TV vs Sales (Scatter Only)')\r
    figScatter\r
  exercise:\r
    prompt: 8단계. 잔차 분석 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figScatter, axScatter = plt.subplots(figsize=(8, 6))\r
      sns.regplot(data=adData, x='TV', y='Sales', fit_reg=False,\r
                 scatter_kws={'alpha': 0.6}, ax=axScatter)\r
      axScatter.set_title('TV vs Sales (Scatter Only)')\r
      figScatter\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 잔차 분석의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 잔차 분석의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_histogram\r
  title: 9단계. 분포와 함께 분석\r
  structuredPrimary: true\r
  subtitle: 이전 개념 복습\r
  goal: 9단계. 분포와 함께 분석에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 회귀 분석과 함께 각 변수의 분포도 확인하면 데이터를 더 잘 이해할 수 있습니다. 이전에 배운 histplot으로 판매액 분포를, boxplot으로 매체별\r
    광고비 분포를 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figDist, (axDistReg, axDistHist) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
    sns.regplot(data=adData, x='TV', y='Sales', ax=axDistReg)\r
    axDistReg.set_title('TV vs Sales')\r
\r
    sns.histplot(data=adData, x='Sales', kde=True, color='#27AE60', ax=axDistHist)\r
    axDistHist.set_title('Sales Distribution')\r
\r
    plt.tight_layout()\r
    figDist\r
  exercise:\r
    prompt: 9단계. 분포와 함께 분석 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figDist, (axDistReg, axDistHist) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
      sns.regplot(data=adData, x='TV', y='Sales', ax=axDistReg)\r
      axDistReg.set_title('TV vs Sales')\r
\r
      sns.histplot(data=adData, x='Sales', kde=True, color='#27AE60', ax=axDistHist)\r
      axDistHist.set_title('Sales Distribution')\r
\r
      plt.tight_layout()\r
      figDist\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 분포와 함께 분석의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 분포와 함께 분석 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step10_final\r
  title: 10단계. 최종 분석 대시보드\r
  structuredPrimary: true\r
  subtitle: 종합 시각화\r
  goal: 10단계. 최종 분석 대시보드에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 요소를 종합하여 광고비-판매액 분석 대시보드를 완성합니다. 세 매체의 회귀선과 판매액 분포를 한눈에 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal, axesFinal = plt.subplots(2, 2, figsize=(14, 10))\r
\r
    sns.regplot(data=adData, x='TV', y='Sales', color='#E74C3C',\r
               scatter_kws={'alpha': 0.6}, ax=axesFinal[0, 0])\r
    axesFinal[0, 0].set_title('TV Advertising Effect')\r
\r
    sns.regplot(data=adData, x='Radio', y='Sales', color='#27AE60',\r
               scatter_kws={'alpha': 0.6}, ax=axesFinal[0, 1])\r
    axesFinal[0, 1].set_title('Radio Advertising Effect')\r
\r
    sns.regplot(data=adData, x='Newspaper', y='Sales', color='#3498DB',\r
               scatter_kws={'alpha': 0.6}, ax=axesFinal[1, 0])\r
    axesFinal[1, 0].set_title('Newspaper Advertising Effect')\r
\r
    adMelted = adData.melt(id_vars=['Sales'], value_vars=['TV', 'Radio', 'Newspaper'],\r
                          var_name='Media', value_name='Spending')\r
    sns.boxplot(data=adMelted, x='Media', y='Spending', hue='Media', palette='Set2', legend=False, ax=axesFinal[1, 1])\r
    axesFinal[1, 1].set_title('Advertising Spending by Media')\r
\r
    plt.tight_layout()\r
    figFinal\r
  exercise:\r
    prompt: 10단계. 최종 분석 대시보드 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal, axesFinal = plt.subplots(2, 2, figsize=(14, 10))\r
\r
      sns.regplot(data=adData, x='TV', y='Sales', color='#E74C3C',\r
                 scatter_kws={'alpha': 0.6}, ax=axesFinal[0, 0])\r
      axesFinal[0, 0].set_title('TV Advertising Effect')\r
\r
      sns.regplot(data=adData, x='Radio', y='Sales', color='#27AE60',\r
                 scatter_kws={'alpha': 0.6}, ax=axesFinal[0, 1])\r
      axesFinal[0, 1].set_title('Radio Advertising Effect')\r
\r
      sns.regplot(data=adData, x='Newspaper', y='Sales', color='#3498DB',\r
                 scatter_kws={'alpha': 0.6}, ax=axesFinal[1, 0])\r
      axesFinal[1, 0].set_title('Newspaper Advertising Effect')\r
\r
      adMelted = adData.melt(id_vars=['Sales'], value_vars=['TV', 'Radio', 'Newspaper'],\r
                            var_name='Media', value_name='Spending')\r
      sns.boxplot(data=adMelted, x='Media', y='Spending', hue='Media', palette='Set2', legend=False, ax=axesFinal[1, 1])\r
      axesFinal[1, 1].set_title('Advertising Spending by Media')\r
\r
      plt.tight_layout()\r
      figFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 최종 분석 대시보드의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 최종 분석 대시보드의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 회귀 분석 프로젝트\r
  goal: 실습에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 regplot, ci, scatter_kws, line_kws를 활용해서 다양한 회귀 시각화를 만들어봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import matplotlib.pyplot as plt\r
\r
    data = loadLocalDataset('tips')\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import matplotlib.pyplot as plt\r
\r
      data = loadLocalDataset('tips')\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: Seaborn regplot으로 광고비와 판매액의 회귀 관계를 시각화했습니다.\r
  - type: list\r
    items:\r
    - sns.regplot() - 산점도 + 회귀선 + 신뢰구간\r
    - ci=95/99/None - 신뢰구간 수준 조절\r
    - scatter_kws - 점 스타일 딕셔너리\r
    - line_kws - 선 스타일 딕셔너리\r
    - fit_reg=False - 회귀선 없이 산점도만\r
    - 회귀선 기울기로 관계 강도 파악\r
  - type: text\r
    content: 다음 시간에는 barplot과 catplot으로 타이타닉 생존 분석을 합니다.\r
  goal: 정리에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: workflow_validation\r
  title: 11단계. 광고 회귀 차트 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 수정 → 검증 → 실무 변주\r
  goal: 11단계. 광고 회귀 차트 검증 루프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    회귀선은 그럴듯해 보이기 쉽습니다. 광고비와 매출의 관계를 먼저 수치로 확인하고, 차트가 회귀선과 축 라벨을 제대로 담았는지 검증합니다.\r
\r
    회귀 차트는 모델링 전 탐색 도구입니다. 차트와 수치가 같은 방향을 가리키는지 항상 함께 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    adFlow = loadLocalDataset("advertising")\r
    requiredColumns = {"TV", "Radio", "Newspaper", "Sales"}\r
    missingColumns = requiredColumns - set(adFlow.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert adFlow[list(requiredColumns)].ge(0).all().all()\r
\r
    salesCorrelation = adFlow.corr(numeric_only=True)["Sales"].drop("Sales").sort_values(ascending=False)\r
    assert salesCorrelation.index[0] == "TV"\r
    salesCorrelation.round(3)\r
  exercise:\r
    prompt: 11단계. 광고 회귀 차트 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      adFlow = loadLocalDataset("advertising")\r
      requiredColumns = {"TV", "Radio", "Newspaper", "Sales"}\r
      missingColumns = requiredColumns - set(adFlow.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert adFlow[list(requiredColumns)].ge(0).all().all()\r
\r
      salesCorrelation = adFlow.corr(numeric_only=True)["Sales"].drop("Sales").sort_values(ascending=False)\r
      assert salesCorrelation.index[0] == "TV"\r
      salesCorrelation.round(3)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 광고 회귀 차트 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 광고 회귀 차트 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};