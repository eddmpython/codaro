var e=`meta:\r
  packages:\r
  - matplotlib\r
  - pandas\r
  - seaborn\r
  id: seaborn_09\r
  title: 자동차연비종합분석\r
  order: 9\r
  category: seaborn\r
  difficulty: ⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - seaborn\r
  - pairplot\r
  - jointplot\r
  - lmplot\r
  - mpg\r
  - 다변량분석\r
  seo:\r
    title: Seaborn 다변량 분석 - 자동차 연비 종합 분석\r
    description: Seaborn pairplot, jointplot, lmplot으로 자동차 연비 데이터의 다변량 관계를 분석합니다. 변수 간 상관관계와 회귀 분석을 배웁니다.\r
    keywords:\r
    - seaborn\r
    - pairplot\r
    - jointplot\r
    - lmplot\r
    - mpg\r
    - 다변량분석\r
intro:\r
  emoji: 🚗\r
  goal: mpg 데이터로 연비에 영향을 주는 변수들의 관계를 pairplot, jointplot, lmplot으로 분석합니다.\r
  description: mpg 데이터셋은 자동차의 연비(mpg), 실린더 수, 배기량, 마력, 무게, 출시 연도, 원산지 정보를 담고 있습니다. 다변량 분석 도구로 연비에 영향을\r
    주는 요인을 탐색합니다. 이전에 배운 displot, relplot, heatmap 개념을 함께 활용합니다.\r
  direction: 자동차연비종합분석에서 정리된 데이터를 통계 차트로 보고 분포와 관계를 검증합니다.\r
  benefits:\r
  - 분석용 테이블 확인 후 통계 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 자동차연비종합분석 결과를 분포, 그룹, 관계 패턴 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 탐색 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(분석용 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기본 pairplot 처리 실행\r
      detail: 통계 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 그룹별 pairplo 결과 검증\r
      detail: 분포, 그룹, 관계 패턴 기준으로 실행 결과를 비교합니다.\r
    - label: 자동차연비종합분석 재사용\r
      detail: 완성 코드를 탐색 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 통계 시각화 환경\r
      detail: matplotlib, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 자동차연비종합분석 실행\r
      detail: 셀을 실행해 분포, 그룹, 관계 패턴와 예외 상태를 확인합니다.\r
    - label: 자동차연비종합분석 완료\r
      detail: 검증된 코드를 탐색 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    seaborn과 matplotlib을 불러옵니다. mpg 데이터는 cylinders(실린더), displacement(배기량), horsepower(마력), weight(무게), acceleration(가속), model_year(연식), origin(원산지) 컬럼을 포함합니다.\r
\r
    mpg 데이터는 cylinders(실린더), displacement(배기량), horsepower(마력), weight(무게), acceleration(가속), model_year(연식), origin(원산지) 컬럼을 포함합니다.\r
  tips:\r
  - mpg 데이터는 cylinders(실린더), displacement(배기량), horsepower(마력), weight(무게), acceleration(가속), model_year(연식),\r
    origin(원산지) 컬럼을 포함합니다.\r
  snippet: |-\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    mpg = loadLocalDataset('mpg').dropna()\r
    mpg\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      mpg = loadLocalDataset('mpg').dropna()\r
      mpg\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_pairplot_basic\r
  title: 2단계. 기본 pairplot\r
  structuredPrimary: true\r
  subtitle: sns.pairplot()\r
  goal: 2단계. 기본 pairplot에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    pairplot으로 모든 수치 변수 간 관계를 한눈에 확인합니다. 대각선은 분포, 비대각선은 산점도를 표시합니다.\r
\r
    pairplot()은 모든 변수 쌍에 대해 산점도(비대각선)와 분포(대각선)를 자동 생성합니다. 변수 간 상관관계와 각 변수의 분포를 한눈에 파악할 수 있습니다. 변수가 많으면 시간이 오래 걸릴 수 있습니다.\r
  tips:\r
  - pairplot()은 모든 변수 쌍에 대해 산점도(비대각선)와 분포(대각선)를 자동 생성합니다. 변수 간 상관관계와 각 변수의 분포를 한눈에 파악할 수 있습니다. 변수가 많으면\r
    시간이 오래 걸릴 수 있습니다.\r
  snippet: |-\r
    mpgNumeric = mpg[['mpg', 'displacement', 'horsepower', 'weight', 'acceleration']]\r
    gPair = sns.pairplot(mpgNumeric, height=2)\r
    gPair.figure.suptitle('MPG Variables Pairplot', y=1.02)\r
    gPair.figure\r
  exercise:\r
    prompt: 2단계. 기본 pairplot 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      mpgNumeric = mpg[['mpg', 'displacement', 'horsepower', 'weight', 'acceleration']]\r
      gPair = sns.pairplot(mpgNumeric, height=2)\r
      gPair.figure.suptitle('MPG Variables Pairplot', y=1.02)\r
      gPair.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 기본 pairplot의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 기본 pairplot의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step3_pairplot_hue\r
  title: 3단계. 그룹별 pairplot\r
  structuredPrimary: true\r
  subtitle: hue, vars\r
  goal: 3단계. 그룹별 pairplot에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    원산지별로 색상을 구분합니다. vars로 특정 변수만 선택하여 분석 범위를 좁힐 수 있습니다.\r
\r
    vars로 특정 변수만 선택할 수 있습니다. hue로 그룹별 색상을 구분하면 그룹 간 패턴 차이를 비교할 수 있습니다. 대각선에는 그룹별 분포가 표시됩니다.\r
  snippet: |-\r
    gPairHue = sns.pairplot(mpg, vars=['mpg', 'horsepower', 'weight'], hue='origin', palette='Set1', height=2.5)\r
    gPairHue.figure.suptitle('Pairplot by Origin', y=1.02)\r
    gPairHue.figure\r
  exercise:\r
    prompt: 3단계. 그룹별 pairplot 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gPairHue = sns.pairplot(mpg, vars=['mpg', 'horsepower', 'weight'], hue='origin', palette='Set1', height=2.5)\r
      gPairHue.figure.suptitle('Pairplot by Origin', y=1.02)\r
      gPairHue.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 그룹별 pairplot의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 그룹별 pairplot의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step4_pairplot_reg\r
  title: 4단계. 회귀선 추가\r
  structuredPrimary: true\r
  subtitle: diag_kind, kind\r
  goal: 4단계. 회귀선 추가에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    대각선에 KDE를 사용하고 회귀선을 추가합니다. 변수 간 선형 관계의 방향과 강도를 파악할 수 있습니다.\r
\r
    diag_kind='kde'는 대각선에 KDE 곡선을 그립니다. kind='reg'는 산점도에 회귀선을 추가합니다. 이를 통해 변수 간 선형 관계의 방향과 강도를 파악할 수 있습니다.\r
  snippet: |-\r
    gPairKde = sns.pairplot(mpg, vars=['mpg', 'horsepower', 'weight'], hue='origin', diag_kind='kde', kind='reg', palette='Set1', height=2.5)\r
    gPairKde.figure.suptitle('Pairplot with Regression', y=1.02)\r
    gPairKde.figure\r
  exercise:\r
    prompt: 4단계. 회귀선 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gPairKde = sns.pairplot(mpg, vars=['mpg', 'horsepower', 'weight'], hue='origin', diag_kind='kde', kind='reg', palette='Set1', height=2.5)\r
      gPairKde.figure.suptitle('Pairplot with Regression', y=1.02)\r
      gPairKde.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 회귀선 추가의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 회귀선 추가의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_jointplot_basic\r
  title: 5단계. 기본 jointplot\r
  structuredPrimary: true\r
  subtitle: sns.jointplot()\r
  goal: 5단계. 기본 jointplot에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    jointplot()으로 두 변수의 관계와 분포를 상세히 분석합니다. 중앙에 산점도, 양 축에 분포를 표시합니다.\r
\r
    jointplot()은 두 변수의 산점도와 각 축의 주변 분포를 함께 보여줍니다. 변수 간 관계와 각 변수의 분포를 동시에 파악할 수 있어 탐색적 분석에 유용합니다.\r
  snippet: |-\r
    gJoint = sns.jointplot(data=mpg, x='weight', y='mpg', height=7)\r
    gJoint.figure.suptitle('Weight vs MPG', y=1.02)\r
    gJoint.figure\r
  exercise:\r
    prompt: 5단계. 기본 jointplot 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gJoint = sns.jointplot(data=mpg, x='weight', y='mpg', height=7)\r
      gJoint.figure.suptitle('Weight vs MPG', y=1.02)\r
      gJoint.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 기본 jointplot의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 기본 jointplot의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_jointplot_reg\r
  title: 6단계. jointplot 회귀\r
  structuredPrimary: true\r
  subtitle: kind='reg'\r
  goal: 6단계. jointplot 회귀에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    jointplot에 회귀선과 KDE를 추가합니다. kind 옵션으로 다양한 표시 방식을 선택할 수 있습니다.\r
\r
    jointplot의 kind 옵션으로 표시 방식을 선택합니다. 'scatter'(기본), 'reg'(회귀선), 'hex'(육각형 밀도), 'kde'(등고선), 'hist'(2D 히스토그램) 중 선택 가능합니다.\r
  tips:\r
  - jointplot의 kind 옵션으로 표시 방식을 선택합니다. 'scatter'(기본), 'reg'(회귀선), 'hex'(육각형 밀도), 'kde'(등고선), 'hist'(2D\r
    히스토그램) 중 선택 가능합니다.\r
  snippet: |-\r
    gJointReg = sns.jointplot(data=mpg, x='weight', y='mpg', kind='reg', height=7)\r
    gJointReg.figure.suptitle('Weight vs MPG with Regression', y=1.02)\r
    gJointReg.figure\r
  exercise:\r
    prompt: 6단계. jointplot 회귀 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gJointReg = sns.jointplot(data=mpg, x='weight', y='mpg', kind='reg', height=7)\r
      gJointReg.figure.suptitle('Weight vs MPG with Regression', y=1.02)\r
      gJointReg.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. jointplot 회귀의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. jointplot 회귀의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_jointplot_kde\r
  title: 7단계. KDE jointplot\r
  structuredPrimary: true\r
  subtitle: kind='kde'\r
  goal: 7단계. KDE jointplot에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: KDE 등고선으로 밀집 영역을 확인합니다. fill=True로 영역을 채워 더 명확하게 표시합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    gJointKde = sns.jointplot(data=mpg, x='horsepower', y='mpg', kind='kde', fill=True, height=7)\r
    gJointKde.figure.suptitle('Horsepower vs MPG (KDE)', y=1.02)\r
    gJointKde.figure\r
  exercise:\r
    prompt: 7단계. KDE jointplot 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gJointKde = sns.jointplot(data=mpg, x='horsepower', y='mpg', kind='kde', fill=True, height=7)\r
      gJointKde.figure.suptitle('Horsepower vs MPG (KDE)', y=1.02)\r
      gJointKde.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. KDE jointplot의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. KDE jointplot의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_jointplot_hue\r
  title: 8단계. 그룹별 jointplot\r
  structuredPrimary: true\r
  subtitle: hue 파라미터\r
  goal: 8단계. 그룹별 jointplot에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: hue로 그룹별 jointplot을 그립니다. 그룹 간 관계 패턴의 차이를 비교할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    gJointHue = sns.jointplot(data=mpg, x='weight', y='mpg', hue='origin', palette='Set1', height=7)\r
    gJointHue.figure.suptitle('Weight vs MPG by Origin', y=1.02)\r
    gJointHue.figure\r
  exercise:\r
    prompt: 8단계. 그룹별 jointplot 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gJointHue = sns.jointplot(data=mpg, x='weight', y='mpg', hue='origin', palette='Set1', height=7)\r
      gJointHue.figure.suptitle('Weight vs MPG by Origin', y=1.02)\r
      gJointHue.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 그룹별 jointplot의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 그룹별 jointplot의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_lmplot_basic\r
  title: 9단계. 기본 lmplot\r
  structuredPrimary: true\r
  subtitle: sns.lmplot()\r
  goal: 9단계. 기본 lmplot에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    lmplot()으로 그룹별 회귀 분석을 수행합니다. 각 그룹마다 독립적인 회귀선과 신뢰구간이 표시됩니다.\r
\r
    lmplot()은 Figure-level 회귀 분석 함수입니다. regplot()과 달리 hue, col, row로 그룹별 회귀를 비교할 수 있습니다. 각 그룹마다 독립적인 회귀선과 신뢰구간이 표시됩니다.\r
  tips:\r
  - lmplot()은 Figure-level 회귀 분석 함수입니다. regplot()과 달리 hue, col, row로 그룹별 회귀를 비교할 수 있습니다. 각 그룹마다 독립적인 회귀선과\r
    신뢰구간이 표시됩니다.\r
  snippet: |-\r
    gLm = sns.lmplot(data=mpg, x='weight', y='mpg', hue='origin', palette='Set1', height=5, aspect=1.3)\r
    gLm.figure.suptitle('Regression by Origin', y=1.02)\r
    gLm.figure\r
  exercise:\r
    prompt: 9단계. 기본 lmplot 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gLm = sns.lmplot(data=mpg, x='weight', y='mpg', hue='origin', palette='Set1', height=5, aspect=1.3)\r
      gLm.figure.suptitle('Regression by Origin', y=1.02)\r
      gLm.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 기본 lmplot의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 기본 lmplot의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_lmplot_col\r
  title: 10단계. 패널별 회귀\r
  structuredPrimary: true\r
  subtitle: col 파라미터\r
  goal: 10단계. 패널별 회귀에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 열 분할로 원산지별 패널을 만듭니다. 각 패널에서 독립적인 회귀 분석을 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    gLmCol = sns.lmplot(data=mpg, x='weight', y='mpg', col='origin', palette='Set1', height=4)\r
    gLmCol.figure.suptitle('Weight vs MPG by Origin', y=1.02)\r
    gLmCol.figure\r
  exercise:\r
    prompt: 10단계. 패널별 회귀 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gLmCol = sns.lmplot(data=mpg, x='weight', y='mpg', col='origin', palette='Set1', height=4)\r
      gLmCol.figure.suptitle('Weight vs MPG by Origin', y=1.02)\r
      gLmCol.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 패널별 회귀의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 패널별 회귀의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step11_lmplot_poly\r
  title: 11단계. 다항 회귀\r
  structuredPrimary: true\r
  subtitle: order 파라미터\r
  goal: 11단계. 다항 회귀에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    다항 회귀로 비선형 관계를 모델링합니다. order로 다항식 차수를 지정합니다.\r
\r
    order 파라미터로 다항 회귀 차수를 지정합니다. order=1이 기본(선형), order=2는 2차 곡선, order=3은 3차 곡선입니다. 비선형 관계에서 더 나은 적합도를 얻을 수 있습니다.\r
  tips:\r
  - order 파라미터로 다항 회귀 차수를 지정합니다. order=1이 기본(선형), order=2는 2차 곡선, order=3은 3차 곡선입니다. 비선형 관계에서 더 나은 적합도를\r
    얻을 수 있습니다.\r
  snippet: |-\r
    gLmOrder = sns.lmplot(data=mpg, x='horsepower', y='mpg', order=2, height=5, aspect=1.3)\r
    gLmOrder.figure.suptitle('Polynomial Regression (order=2)', y=1.02)\r
    gLmOrder.figure\r
  exercise:\r
    prompt: 11단계. 다항 회귀 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gLmOrder = sns.lmplot(data=mpg, x='horsepower', y='mpg', order=2, height=5, aspect=1.3)\r
      gLmOrder.figure.suptitle('Polynomial Regression (order=2)', y=1.02)\r
      gLmOrder.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 다항 회귀의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 다항 회귀의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step12_lmplot_grid\r
  title: 12단계. 다중 조건 회귀\r
  structuredPrimary: true\r
  subtitle: col과 hue\r
  goal: 12단계. 다중 조건 회귀에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 실린더 수별로 행과 열을 분할합니다. 여러 조건을 조합하여 세분화된 분석이 가능합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    mpgFiltered = mpg[mpg['cylinders'].isin([4, 6, 8])].copy()\r
    gLmGrid = sns.lmplot(data=mpgFiltered, x='weight', y='mpg', col='cylinders', hue='origin', palette='Set1', height=4)\r
    gLmGrid.figure.suptitle('Weight vs MPG by Cylinders and Origin', y=1.02)\r
    gLmGrid.figure\r
  exercise:\r
    prompt: 12단계. 다중 조건 회귀 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      mpgFiltered = mpg[mpg['cylinders'].isin([4, 6, 8])].copy()\r
      gLmGrid = sns.lmplot(data=mpgFiltered, x='weight', y='mpg', col='cylinders', hue='origin', palette='Set1', height=4)\r
      gLmGrid.figure.suptitle('Weight vs MPG by Cylinders and Origin', y=1.02)\r
      gLmGrid.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 다중 조건 회귀의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 12단계. 다중 조건 회귀의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step13_corr_heatmap\r
  title: 13단계. 상관계수 히트맵\r
  structuredPrimary: true\r
  subtitle: corr()\r
  goal: 13단계. 상관계수 히트맵에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    상관계수 히트맵으로 변수 간 관계를 요약합니다. mpg는 weight, displacement와 강한 음의 상관을 보입니다.\r
\r
    상관계수 히트맵은 모든 변수 쌍의 상관관계를 한눈에 보여줍니다. 양의 상관은 파란색, 음의 상관은 빨간색으로 표시됩니다. mpg는 weight, displacement와 강한 음의 상관을 보입니다.\r
  tips:\r
  - 상관계수 히트맵은 모든 변수 쌍의 상관관계를 한눈에 보여줍니다. 양의 상관은 파란색, 음의 상관은 빨간색으로 표시됩니다. mpg는 weight, displacement와 강한\r
    음의 상관을 보입니다.\r
  snippet: |-\r
    mpgCorr = mpg[['mpg', 'cylinders', 'displacement', 'horsepower', 'weight', 'acceleration']].corr()\r
    figCorr, axCorr = plt.subplots(figsize=(8, 6))\r
    sns.heatmap(mpgCorr, annot=True, fmt='.2f', cmap='RdBu_r', vmin=-1, vmax=1, center=0, ax=axCorr)\r
    axCorr.set_title('MPG Variables Correlation')\r
    figCorr\r
  exercise:\r
    prompt: 13단계. 상관계수 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      mpgCorr = mpg[['mpg', 'cylinders', 'displacement', 'horsepower', 'weight', 'acceleration']].corr()\r
      figCorr, axCorr = plt.subplots(figsize=(8, 6))\r
      sns.heatmap(mpgCorr, annot=True, fmt='.2f', cmap='RdBu_r', vmin=-1, vmax=1, center=0, ax=axCorr)\r
      axCorr.set_title('MPG Variables Correlation')\r
      figCorr\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 상관계수 히트맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 13단계. 상관계수 히트맵의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: workflow_validation\r
  title: 14단계. 자동차 연비 다변량 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 수정 → 검증 → 실무 변주\r
  goal: 14단계. 자동차 연비 다변량 검증 루프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    pairplot과 jointplot은 변수 관계를 빠르게 보여 주지만, 보고서에는 핵심 관계 하나를 검증 가능한 축으로 남겨야 합니다. 무게가 증가하면 연비가 낮아진다는 예측을 확인합니다.\r
\r
    다변량 차트는 탐색용으로 넓게 보고, 검증 가능한 핵심 관계를 하나씩 좁혀야 업무 분석으로 이어집니다.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    mpgFlow = loadLocalDataset("mpg").dropna()\r
    requiredColumns = {"mpg", "weight", "horsepower", "origin", "model_year"}\r
    missingColumns = requiredColumns - set(mpgFlow.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert mpgFlow[["mpg", "weight", "horsepower"]].gt(0).all().all()\r
\r
    weightMpgCorr = mpgFlow[["weight", "mpg"]].corr().loc["weight", "mpg"]\r
    assert weightMpgCorr < -0.5\r
    round(float(weightMpgCorr), 3)\r
  exercise:\r
    prompt: 14단계. 자동차 연비 다변량 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      mpgFlow = loadLocalDataset("mpg").dropna()\r
      requiredColumns = {"mpg", "weight", "horsepower", "origin", "model_year"}\r
      missingColumns = requiredColumns - set(mpgFlow.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert mpgFlow[["mpg", "weight", "horsepower"]].gt(0).all().all()\r
\r
      weightMpgCorr = mpgFlow[["weight", "mpg"]].corr().loc["weight", "mpg"]\r
      assert weightMpgCorr < -0.5\r
      round(float(weightMpgCorr), 3)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 자동차 연비 다변량 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 14단계. 자동차 연비 다변량 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 다변량 분석\r
  goal: 실습에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 개념을 활용하여 미션을 수행해봅시다. 각 미션은 독립적으로 실행 가능합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import matplotlib.pyplot as plt\r
\r
    data = loadLocalDataset('penguins').dropna()\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import matplotlib.pyplot as plt\r
\r
      data = loadLocalDataset('penguins').dropna()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};