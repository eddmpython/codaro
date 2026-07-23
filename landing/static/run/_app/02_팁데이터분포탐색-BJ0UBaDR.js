var e=`meta:\r
  packages:\r
  - matplotlib\r
  - seaborn\r
  id: seaborn_02\r
  title: 팁데이터분포탐색\r
  order: 2\r
  category: seaborn\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - seaborn\r
  - histplot\r
  - stripplot\r
  - swarmplot\r
  - multiple\r
  - tips\r
  seo:\r
    title: Seaborn 분포 시각화 - 팁 데이터 히스토그램과 산점 분포\r
    description: Seaborn histplot, stripplot, swarmplot으로 팁 데이터의 분포를 탐색합니다. hue와 multiple 파라미터 활용법을 배웁니다.\r
    keywords:\r
    - seaborn\r
    - histplot\r
    - stripplot\r
    - swarmplot\r
    - 분포\r
    - tips\r
intro:\r
  emoji: 💵\r
  goal: 팁 데이터의 분포를 히스토그램과 산점 분포로 탐색합니다.\r
  description: histplot으로 히스토그램을, stripplot과 swarmplot으로 개별 데이터 포인트를 시각화합니다. hue로 그룹별 분포를 비교하고, multiple\r
    파라미터로 분포 표시 방식을 조절합니다. 이전에 배운 scatterplot, palette 개념을 함께 활용합니다.\r
  direction: 팁데이터분포탐색에서 정리된 데이터를 통계 차트로 보고 분포와 관계를 검증합니다.\r
  benefits:\r
  - 분석용 테이블 확인 후 통계 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 팁데이터분포탐색 결과를 분포, 그룹, 관계 패턴 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 탐색 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(분석용 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 통계 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 기본 히스토그램 결과 검증\r
      detail: 분포, 그룹, 관계 패턴 기준으로 실행 결과를 비교합니다.\r
    - label: 팁데이터분포탐색 재사용\r
      detail: 완성 코드를 탐색 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 통계 시각화 환경\r
      detail: matplotlib, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 팁데이터분포탐색 실행\r
      detail: 셀을 실행해 분포, 그룹, 관계 패턴와 예외 상태를 확인합니다.\r
    - label: 팁데이터분포탐색 완료\r
      detail: 검증된 코드를 탐색 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: seaborn과 matplotlib을 불러옵니다. tips 데이터는 레스토랑에서 수집한 결제 정보와 팁 데이터입니다. 결제금액, 팁, 요일, 시간대, 테이블\r
    인원수 등 다양한 변수가 포함되어 있어 분포 분석에 적합합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import matplotlib.pyplot as plt\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import matplotlib.pyplot as plt\r
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
  subtitle: tips 데이터셋\r
  goal: 2단계. 데이터 로드에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: tips 데이터셋은 120개의 로컬 식사 기록을 담고 있습니다. total_bill(결제금액), tip(팁), sex(성별), smoker(흡연여부), day(요일),\r
    time(시간대), size(인원수) 컬럼이 있습니다. 이 데이터로 팁에 영향을 미치는 요인을 분석할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    tips = loadLocalDataset('tips')\r
    tips.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      tips = loadLocalDataset('tips')\r
      tips.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_basic_hist\r
  title: 3단계. 기본 히스토그램\r
  structuredPrimary: true\r
  subtitle: histplot()\r
  goal: 3단계. 기본 히스토그램에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    histplot()은 연속형 변수의 분포를 막대 그래프로 표현합니다. bins 파라미터로 구간 개수를 조절하고, kde=True로 커널 밀도 추정 곡선을 함께 표시할 수 있습니다. 팁 금액의 분포를 확인해봅니다.\r
\r
    sns.histplot(data, x='컬럼명')으로 히스토그램을 그립니다. bins로 구간 개수를 조절합니다. 구간이 많을수록 세밀하게, 적을수록 전체 추세를 파악하기 좋습니다.\r
  snippet: |-\r
    fig, ax = plt.subplots(figsize=(8, 6))\r
    sns.histplot(data=tips, x='tip', bins=20, ax=ax)\r
    ax.set_title('Tip Distribution')\r
    fig\r
  exercise:\r
    prompt: 3단계. 기본 히스토그램 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fig, ax = plt.subplots(figsize=(8, 6))\r
      sns.histplot(data=tips, x='tip', bins=20, ax=ax)\r
      ax.set_title('Tip Distribution')\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 기본 히스토그램의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 기본 히스토그램 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step4_kde\r
  title: 4단계. KDE 곡선 추가\r
  structuredPrimary: true\r
  subtitle: 커널 밀도 추정\r
  goal: 4단계. KDE 곡선 추가에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    kde=True를 설정하면 히스토그램 위에 부드러운 밀도 곡선이 그려집니다. KDE(Kernel Density Estimation)는 데이터의 확률 밀도 함수를 추정하는 방법입니다. 히스토그램의 계단 형태보다 분포의 모양을 더 잘 파악할 수 있습니다.\r
\r
    kde=True로 커널 밀도 추정 곡선을 추가합니다. 히스토그램의 막대 높이는 빈도(count)이고, KDE 곡선은 확률 밀도로 스케일이 다릅니다. stat='density'로 맞출 수 있습니다.\r
  tips:\r
  - kde=True로 커널 밀도 추정 곡선을 추가합니다. 히스토그램의 막대 높이는 빈도(count)이고, KDE 곡선은 확률 밀도로 스케일이 다릅니다. stat='density'로\r
    맞출 수 있습니다.\r
  snippet: |-\r
    figKde, axKde = plt.subplots(figsize=(8, 6))\r
    sns.histplot(data=tips, x='tip', bins=20, kde=True, ax=axKde)\r
    axKde.set_title('Tip Distribution with KDE')\r
    figKde\r
  exercise:\r
    prompt: 4단계. KDE 곡선 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figKde, axKde = plt.subplots(figsize=(8, 6))\r
      sns.histplot(data=tips, x='tip', bins=20, kde=True, ax=axKde)\r
      axKde.set_title('Tip Distribution with KDE')\r
      figKde\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. KDE 곡선 추가의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. KDE 곡선 추가 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step5_hue_hist\r
  title: 5단계. 그룹별 히스토그램\r
  structuredPrimary: true\r
  subtitle: hue 파라미터\r
  goal: 5단계. 그룹별 히스토그램에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: hue 파라미터로 범주형 변수에 따라 분포를 분리할 수 있습니다. 시간대(Lunch/Dinner)별로 팁 분포가 어떻게 다른지 비교해봅니다. 기본적으로 겹쳐서(layer)\r
    표시됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figHue, axHue = plt.subplots(figsize=(8, 6))\r
    sns.histplot(data=tips, x='tip', hue='time', bins=15, ax=axHue)\r
    axHue.set_title('Tip by Time')\r
    figHue\r
  exercise:\r
    prompt: 5단계. 그룹별 히스토그램 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHue, axHue = plt.subplots(figsize=(8, 6))\r
      sns.histplot(data=tips, x='tip', hue='time', bins=15, ax=axHue)\r
      axHue.set_title('Tip by Time')\r
      figHue\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 그룹별 히스토그램의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 그룹별 히스토그램 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step6_multiple\r
  title: 6단계. multiple 파라미터\r
  structuredPrimary: true\r
  subtitle: 분포 표시 방식\r
  goal: 6단계. multiple 파라미터에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    multiple 파라미터로 여러 그룹의 분포를 어떻게 표시할지 결정합니다. 'layer'는 겹쳐서, 'stack'은 쌓아서, 'fill'은 전체를 100%로 채워서 표시합니다. 각 방식은 다른 관점의 비교를 가능하게 합니다.\r
\r
    multiple 옵션: 'layer'(겹침, 기본값), 'stack'(쌓기), 'fill'(비율 채우기), 'dodge'(나란히). stack은 전체 빈도를, fill은 비율 비교에 적합합니다.\r
  tips:\r
  - 'multiple 옵션: ''layer''(겹침, 기본값), ''stack''(쌓기), ''fill''(비율 채우기), ''dodge''(나란히). stack은 전체 빈도를,\r
    fill은 비율 비교에 적합합니다.'\r
  snippet: |-\r
    figStack, axStack = plt.subplots(figsize=(8, 6))\r
    sns.histplot(data=tips, x='tip', hue='time', bins=15, multiple='stack', ax=axStack)\r
    axStack.set_title('Tip by Time (Stacked)')\r
    figStack\r
  exercise:\r
    prompt: 6단계. multiple 파라미터 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figStack, axStack = plt.subplots(figsize=(8, 6))\r
      sns.histplot(data=tips, x='tip', hue='time', bins=15, multiple='stack', ax=axStack)\r
      axStack.set_title('Tip by Time (Stacked)')\r
      figStack\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. multiple 파라미터의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. multiple 파라미터 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step7_fill\r
  title: 7단계. fill 모드\r
  structuredPrimary: true\r
  subtitle: 비율 비교\r
  goal: 7단계. fill 모드에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: multiple='fill'은 각 구간에서 그룹별 비율을 100%로 채워 표시합니다. 절대적인 빈도보다 상대적인 비율을 비교할 때 유용합니다. 팁 금액대별로\r
    Lunch와 Dinner의 비율이 어떻게 변하는지 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFill, axFill = plt.subplots(figsize=(8, 6))\r
    sns.histplot(data=tips, x='tip', hue='time', bins=15, multiple='fill', ax=axFill)\r
    axFill.set_title('Tip by Time (Ratio)')\r
    axFill.set_ylabel('Proportion')\r
    figFill\r
  exercise:\r
    prompt: 7단계. fill 모드 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFill, axFill = plt.subplots(figsize=(8, 6))\r
      sns.histplot(data=tips, x='tip', hue='time', bins=15, multiple='fill', ax=axFill)\r
      axFill.set_title('Tip by Time (Ratio)')\r
      axFill.set_ylabel('Proportion')\r
      figFill\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. fill 모드의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. fill 모드 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step8_stripplot\r
  title: 8단계. 스트립 플롯\r
  structuredPrimary: true\r
  subtitle: stripplot()\r
  goal: 8단계. 스트립 플롯에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    stripplot()은 범주형 변수와 연속형 변수의 관계를 개별 점으로 표시합니다. 히스토그램이 분포의 모양을 보여준다면, stripplot은 실제 데이터 포인트의 위치를 보여줍니다. 요일별 팁 분포를 점으로 확인해봅니다.\r
\r
    sns.stripplot(data, x='범주형', y='연속형')으로 범주별 데이터 포인트를 표시합니다. 점이 겹칠 수 있어 데이터가 많으면 jitter(좌우 흔들림)로 분산시킵니다.\r
  snippet: |-\r
    figStrip, axStrip = plt.subplots(figsize=(8, 6))\r
    sns.stripplot(data=tips, x='day', y='tip', ax=axStrip)\r
    axStrip.set_title('Tip by Day')\r
    figStrip\r
  exercise:\r
    prompt: 8단계. 스트립 플롯 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figStrip, axStrip = plt.subplots(figsize=(8, 6))\r
      sns.stripplot(data=tips, x='day', y='tip', ax=axStrip)\r
      axStrip.set_title('Tip by Day')\r
      figStrip\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 스트립 플롯의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 스트립 플롯 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step9_swarmplot\r
  title: 9단계. 스웜 플롯\r
  structuredPrimary: true\r
  subtitle: swarmplot()\r
  goal: 9단계. 스웜 플롯에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    swarmplot()은 stripplot과 비슷하지만 점이 겹치지 않도록 자동으로 배치합니다. 데이터의 분포 모양과 밀집 정도를 동시에 파악할 수 있습니다. 단, 데이터가 많으면 계산 시간이 오래 걸릴 수 있습니다.\r
\r
    swarmplot()은 점이 겹치지 않아 실제 데이터 분포를 정확히 보여줍니다. 단, 데이터가 1000개 이상이면 느려지므로 stripplot을 권장합니다.\r
  snippet: |-\r
    figSwarm, axSwarm = plt.subplots(figsize=(8, 6))\r
    sns.swarmplot(data=tips, x='day', y='tip', ax=axSwarm)\r
    axSwarm.set_title('Tip by Day (Swarm)')\r
    figSwarm\r
  exercise:\r
    prompt: 9단계. 스웜 플롯 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figSwarm, axSwarm = plt.subplots(figsize=(8, 6))\r
      sns.swarmplot(data=tips, x='day', y='tip', ax=axSwarm)\r
      axSwarm.set_title('Tip by Day (Swarm)')\r
      figSwarm\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 스웜 플롯의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 스웜 플롯 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step10_hue_strip\r
  title: 10단계. hue로 그룹 구분\r
  structuredPrimary: true\r
  subtitle: 색상으로 추가 변수\r
  goal: 10단계. hue로 그룹 구분에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: stripplot과 swarmplot에도 hue를 적용할 수 있습니다. 요일별로 점을 배치하면서 시간대(Lunch/Dinner)를 색상으로 구분하면 두 가지\r
    범주를 동시에 비교할 수 있습니다. dodge=True로 그룹을 나란히 배치할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figDodge, axDodge = plt.subplots(figsize=(10, 6))\r
    sns.stripplot(data=tips, x='day', y='tip', hue='time', palette='Set2', dodge=True, alpha=0.7, ax=axDodge)\r
    axDodge.set_title('Tip by Day and Time')\r
    axDodge.legend(title='Time')\r
    figDodge\r
  exercise:\r
    prompt: 10단계. hue로 그룹 구분 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figDodge, axDodge = plt.subplots(figsize=(10, 6))\r
      sns.stripplot(data=tips, x='day', y='tip', hue='time', palette='Set2', dodge=True, alpha=0.7, ax=axDodge)\r
      axDodge.set_title('Tip by Day and Time')\r
      axDodge.legend(title='Time')\r
      figDodge\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. hue로 그룹 구분의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. hue로 그룹 구분 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step11_comparison\r
  title: 11단계. 분포 시각화 비교\r
  structuredPrimary: true\r
  subtitle: 세 가지 방식\r
  goal: 11단계. 분포 시각화 비교에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 히스토그램, stripplot, swarmplot을 나란히 비교합니다. 같은 데이터를 다른 방식으로 시각화하면 각각 다른 인사이트를 얻을 수 있습니다. 히스토그램은\r
    전체 분포 모양을, stripplot은 개별 데이터와 이상치를, swarmplot은 밀집 정도를 보여줍니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figCompare, (axHist, axStripSub, axSwarmSub) = plt.subplots(1, 3, figsize=(15, 5))\r
\r
    sns.histplot(data=tips, x='tip', hue='time', multiple='stack', ax=axHist)\r
    axHist.set_title('Histogram')\r
\r
    sns.stripplot(data=tips, x='time', y='tip', hue='time', palette='Set2', ax=axStripSub, legend=False)\r
    axStripSub.set_title('Strip Plot')\r
\r
    sns.swarmplot(data=tips, x='time', y='tip', hue='time', palette='Set2', ax=axSwarmSub, legend=False)\r
    axSwarmSub.set_title('Swarm Plot')\r
\r
    plt.tight_layout()\r
    figCompare\r
  exercise:\r
    prompt: 11단계. 분포 시각화 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figCompare, (axHist, axStripSub, axSwarmSub) = plt.subplots(1, 3, figsize=(15, 5))\r
\r
      sns.histplot(data=tips, x='tip', hue='time', multiple='stack', ax=axHist)\r
      axHist.set_title('Histogram')\r
\r
      sns.stripplot(data=tips, x='time', y='tip', hue='time', palette='Set2', ax=axStripSub, legend=False)\r
      axStripSub.set_title('Strip Plot')\r
\r
      sns.swarmplot(data=tips, x='time', y='tip', hue='time', palette='Set2', ax=axSwarmSub, legend=False)\r
      axSwarmSub.set_title('Swarm Plot')\r
\r
      plt.tight_layout()\r
      figCompare\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 분포 시각화 비교의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 분포 시각화 비교 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step12_final\r
  title: 12단계. 최종 분석 차트\r
  structuredPrimary: true\r
  subtitle: 종합 시각화\r
  goal: 12단계. 최종 분석 차트에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 요소를 종합하여 팁 데이터의 분포를 완성도 높게 시각화합니다. 이전 프로젝트에서 배운 scatterplot도 함께 활용하여 다양한 관점에서\r
    데이터를 탐색합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal, axesFinal = plt.subplots(2, 2, figsize=(14, 10))\r
\r
    sns.histplot(data=tips, x='tip', hue='time', kde=True, palette='Set2', ax=axesFinal[0, 0])\r
    axesFinal[0, 0].set_title('Tip Distribution by Time')\r
\r
    sns.scatterplot(data=tips, x='total_bill', y='tip', hue='time', palette='Set2', alpha=0.7, ax=axesFinal[0, 1])\r
    axesFinal[0, 1].set_title('Total Bill vs Tip')\r
\r
    sns.stripplot(data=tips, x='day', y='tip', hue='time', palette='Set2', dodge=True, alpha=0.7, ax=axesFinal[1, 0])\r
    axesFinal[1, 0].set_title('Tip by Day')\r
\r
    sns.histplot(data=tips, x='total_bill', hue='day', multiple='stack', palette='Set1', ax=axesFinal[1, 1])\r
    axesFinal[1, 1].set_title('Bill Distribution by Day')\r
\r
    plt.tight_layout()\r
    figFinal\r
  exercise:\r
    prompt: 12단계. 최종 분석 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal, axesFinal = plt.subplots(2, 2, figsize=(14, 10))\r
\r
      sns.histplot(data=tips, x='tip', hue='time', kde=True, palette='Set2', ax=axesFinal[0, 0])\r
      axesFinal[0, 0].set_title('Tip Distribution by Time')\r
\r
      sns.scatterplot(data=tips, x='total_bill', y='tip', hue='time', palette='Set2', alpha=0.7, ax=axesFinal[0, 1])\r
      axesFinal[0, 1].set_title('Total Bill vs Tip')\r
\r
      sns.stripplot(data=tips, x='day', y='tip', hue='time', palette='Set2', dodge=True, alpha=0.7, ax=axesFinal[1, 0])\r
      axesFinal[1, 0].set_title('Tip by Day')\r
\r
      sns.histplot(data=tips, x='total_bill', hue='day', multiple='stack', palette='Set1', ax=axesFinal[1, 1])\r
      axesFinal[1, 1].set_title('Bill Distribution by Day')\r
\r
      plt.tight_layout()\r
      figFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 최종 분석 차트의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 12단계. 최종 분석 차트 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 분포 탐색 프로젝트\r
  goal: 실습에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 histplot, stripplot, swarmplot, hue, multiple을 활용해서 다양한 분포를 탐색해봅시다.\r
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
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: Seaborn으로 팁 데이터의 분포를 다양한 방식으로 탐색했습니다.\r
  - type: list\r
    items:\r
    - sns.histplot(data, x, bins, kde) - 히스토그램\r
    - hue로 그룹별 분포 비교\r
    - multiple='layer'/'stack'/'fill' - 분포 표시 방식\r
    - sns.stripplot() - 개별 점으로 분포 표시\r
    - sns.swarmplot() - 겹치지 않는 점 배치\r
    - dodge=True로 그룹 나란히 배치\r
  - type: text\r
    content: 다음 시간에는 boxplot과 violinplot으로 분포를 비교합니다.\r
  goal: 정리에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: workflow_validation\r
  title: 13단계. 팁 분포 분석 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 수정 → 검증 → 실무 변주\r
  goal: 13단계. 팁 분포 분석 검증 루프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    분포 차트는 평균만 보는 습관을 깨기 위한 도구입니다. 팁 금액이 한쪽으로 치우쳐 있는지 예측하고, 히스토그램이 그 질문을 정확히 보여 주는지 검증합니다.\r
\r
    분포 분석은 히스토그램을 그린 뒤 끝내지 말고, 어떤 집단의 분포가 왜 다른지 다음 질문을 뽑아야 합니다.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    tipsFlow = loadLocalDataset("tips")\r
    requiredColumns = {"total_bill", "tip", "time", "day", "size"}\r
    missingColumns = requiredColumns - set(tipsFlow.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert tipsFlow["tip"].between(0, tipsFlow["total_bill"]).all()\r
\r
    timeTipMean = tipsFlow.groupby("time")["tip"].mean()\r
    assert timeTipMean["Dinner"] > timeTipMean["Lunch"]\r
    timeTipMean.round(2)\r
  exercise:\r
    prompt: 13단계. 팁 분포 분석 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      tipsFlow = loadLocalDataset("tips")\r
      requiredColumns = {"total_bill", "tip", "time", "day", "size"}\r
      missingColumns = requiredColumns - set(tipsFlow.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert tipsFlow["tip"].between(0, tipsFlow["total_bill"]).all()\r
\r
      timeTipMean = tipsFlow.groupby("time")["tip"].mean()\r
      assert timeTipMean["Dinner"] > timeTipMean["Lunch"]\r
      timeTipMean.round(2)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 팁 분포 분석 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 13단계. 팁 분포 분석 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};