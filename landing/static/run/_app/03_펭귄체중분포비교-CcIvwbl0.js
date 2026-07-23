var e=`meta:\r
  packages:\r
  - matplotlib\r
  - seaborn\r
  id: seaborn_03\r
  title: 펭귄체중분포비교\r
  order: 3\r
  category: seaborn\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - seaborn\r
  - boxplot\r
  - violinplot\r
  - penguins\r
  - 분포비교\r
  seo:\r
    title: Seaborn 박스플롯과 바이올린플롯 - 펭귄 체중 분포 비교\r
    description: Seaborn boxplot, violinplot으로 펭귄 종별/성별 체중 분포를 비교합니다. hue로 다중 그룹 비교를 배웁니다.\r
    keywords:\r
    - seaborn\r
    - boxplot\r
    - violinplot\r
    - penguins\r
    - 분포\r
    - 비교\r
intro:\r
  emoji: 🐧\r
  goal: 펭귄 종별/성별 체중 분포를 박스플롯과 바이올린플롯으로 비교합니다.\r
  description: boxplot으로 분포의 요약 통계량을, violinplot으로 분포의 모양을 시각화합니다. hue로 성별을 추가하여 다중 그룹을 비교합니다. 이전에 배운\r
    scatterplot, histplot, stripplot 개념을 함께 활용합니다.\r
  direction: 펭귄체중분포비교에서 정리된 데이터를 통계 차트로 보고 분포와 관계를 검증합니다.\r
  benefits:\r
  - 분석용 테이블 확인 후 통계 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 펭귄체중분포비교 결과를 분포, 그룹, 관계 패턴 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 탐색 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(분석용 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 통계 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 기본 박스플롯 결과 검증\r
      detail: 분포, 그룹, 관계 패턴 기준으로 실행 결과를 비교합니다.\r
    - label: 펭귄체중분포비교 재사용\r
      detail: 완성 코드를 탐색 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 통계 시각화 환경\r
      detail: matplotlib, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 펭귄체중분포비교 실행\r
      detail: 셀을 실행해 분포, 그룹, 관계 패턴와 예외 상태를 확인합니다.\r
    - label: 펭귄체중분포비교 완료\r
      detail: 검증된 코드를 탐색 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: seaborn과 matplotlib을 불러옵니다. penguins 데이터는 남극 팔머 군도에서 수집한 펭귄 데이터입니다. Adelie, Chinstrap,\r
    Gentoo 세 종의 부리 크기, 날개 길이, 체중 등이 측정되어 있습니다.\r
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
  subtitle: penguins 데이터셋\r
  goal: 2단계. 데이터 로드에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: penguins 데이터셋은 120개의 로컬 펭귄 관측 기록입니다. species(종), island(섬), bill_length_mm(부리 길이), bill_depth_mm(부리\r
    깊이), flipper_length_mm(날개 길이), body_mass_g(체중), sex(성별) 컬럼이 있습니다. 결측값이 있으므로 dropna()로 제거합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    penguins = loadLocalDataset('penguins').dropna()\r
    penguins.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      penguins = loadLocalDataset('penguins').dropna()\r
      penguins.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_basic_box\r
  title: 3단계. 기본 박스플롯\r
  structuredPrimary: true\r
  subtitle: boxplot()\r
  goal: 3단계. 기본 박스플롯에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    boxplot()은 분포의 5가지 요약 통계량을 시각화합니다. 박스의 아래/위는 1사분위수(Q1)와 3사분위수(Q3), 중앙선은 중앙값(median), 수염은 1.5*IQR 범위, 그 밖의 점은 이상치입니다. 종별 체중 분포를 비교해봅니다.\r
\r
    sns.boxplot(data, x='범주형', y='연속형')으로 범주별 분포를 비교합니다. 박스는 IQR(Q3-Q1)을, 수염은 Q1-1.5*IQR ~ Q3+1.5*IQR 범위를, 점은 이상치를 나타냅니다.\r
  tips:\r
  - sns.boxplot(data, x='범주형', y='연속형')으로 범주별 분포를 비교합니다. 박스는 IQR(Q3-Q1)을, 수염은 Q1-1.5*IQR ~ Q3+1.5*IQR\r
    범위를, 점은 이상치를 나타냅니다.\r
  snippet: |-\r
    fig, ax = plt.subplots(figsize=(8, 6))\r
    sns.boxplot(data=penguins, x='species', y='body_mass_g', ax=ax)\r
    ax.set_title('Body Mass by Species')\r
    ax.set_ylabel('Body Mass (g)')\r
    fig\r
  exercise:\r
    prompt: 3단계. 기본 박스플롯 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fig, ax = plt.subplots(figsize=(8, 6))\r
      sns.boxplot(data=penguins, x='species', y='body_mass_g', ax=ax)\r
      ax.set_title('Body Mass by Species')\r
      ax.set_ylabel('Body Mass (g)')\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 기본 박스플롯의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 기본 박스플롯 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step4_hue_box\r
  title: 4단계. hue로 성별 구분\r
  structuredPrimary: true\r
  subtitle: 다중 그룹 비교\r
  goal: 4단계. hue로 성별 구분에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: hue 파라미터로 두 번째 범주형 변수를 추가할 수 있습니다. 종별로 나누고 성별로 색상을 구분하면 두 가지 요인의 효과를 동시에 비교할 수 있습니다. 같은\r
    종에서도 수컷과 암컷의 체중 차이를 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figHue, axHue = plt.subplots(figsize=(10, 6))\r
    sns.boxplot(data=penguins, x='species', y='body_mass_g', hue='sex', palette='Set2', ax=axHue)\r
    axHue.set_title('Body Mass by Species and Sex')\r
    axHue.set_ylabel('Body Mass (g)')\r
    axHue.legend(title='Sex')\r
    figHue\r
  exercise:\r
    prompt: 4단계. hue로 성별 구분 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHue, axHue = plt.subplots(figsize=(10, 6))\r
      sns.boxplot(data=penguins, x='species', y='body_mass_g', hue='sex', palette='Set2', ax=axHue)\r
      axHue.set_title('Body Mass by Species and Sex')\r
      axHue.set_ylabel('Body Mass (g)')\r
      axHue.legend(title='Sex')\r
      figHue\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. hue로 성별 구분의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. hue로 성별 구분 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step5_violin\r
  title: 5단계. 바이올린플롯\r
  structuredPrimary: true\r
  subtitle: violinplot()\r
  goal: 5단계. 바이올린플롯에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    violinplot()은 박스플롯과 KDE를 결합한 형태입니다. 양쪽으로 대칭인 KDE 곡선으로 분포의 모양을 보여줍니다. 박스플롯보다 분포의 세부적인 형태(다봉분포, 비대칭 등)를 파악하기 좋습니다.\r
\r
    sns.violinplot()은 분포의 모양(밀도)을 시각화합니다. 폭이 넓은 부분은 데이터가 많은 구간입니다. inner 파라미터로 내부 표시를 조절할 수 있습니다.\r
  snippet: |-\r
    figViolin, axViolin = plt.subplots(figsize=(8, 6))\r
    sns.violinplot(data=penguins, x='species', y='body_mass_g', ax=axViolin)\r
    axViolin.set_title('Body Mass by Species (Violin)')\r
    axViolin.set_ylabel('Body Mass (g)')\r
    figViolin\r
  exercise:\r
    prompt: 5단계. 바이올린플롯 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figViolin, axViolin = plt.subplots(figsize=(8, 6))\r
      sns.violinplot(data=penguins, x='species', y='body_mass_g', ax=axViolin)\r
      axViolin.set_title('Body Mass by Species (Violin)')\r
      axViolin.set_ylabel('Body Mass (g)')\r
      figViolin\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 바이올린플롯의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 바이올린플롯 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step6_violin_hue\r
  title: 6단계. 바이올린플롯 hue\r
  structuredPrimary: true\r
  subtitle: split 옵션\r
  goal: 6단계. 바이올린플롯 hue에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    violinplot에 hue를 적용하면 두 그룹의 분포를 나란히 비교할 수 있습니다. split=True를 설정하면 한 바이올린을 반으로 나누어 두 그룹을 좌우에 표시합니다. 공간을 절약하면서 직접 비교가 가능합니다.\r
\r
    split=True는 두 그룹을 하나의 바이올린 좌우에 표시합니다. hue가 2개 범주일 때만 사용 가능하며, 직접적인 비교에 효과적입니다.\r
  snippet: |-\r
    figSplit, axSplit = plt.subplots(figsize=(10, 6))\r
    sns.violinplot(data=penguins, x='species', y='body_mass_g', hue='sex',\r
                  split=True, palette='Set2', ax=axSplit)\r
    axSplit.set_title('Body Mass by Species and Sex (Split)')\r
    axSplit.set_ylabel('Body Mass (g)')\r
    axSplit.legend(title='Sex')\r
    figSplit\r
  exercise:\r
    prompt: 6단계. 바이올린플롯 hue 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figSplit, axSplit = plt.subplots(figsize=(10, 6))\r
      sns.violinplot(data=penguins, x='species', y='body_mass_g', hue='sex',\r
                    split=True, palette='Set2', ax=axSplit)\r
      axSplit.set_title('Body Mass by Species and Sex (Split)')\r
      axSplit.set_ylabel('Body Mass (g)')\r
      axSplit.legend(title='Sex')\r
      figSplit\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 바이올린플롯 hue의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 바이올린플롯 hue의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_inner\r
  title: 7단계. inner 파라미터\r
  structuredPrimary: true\r
  subtitle: 내부 표시 옵션\r
  goal: 7단계. inner 파라미터에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: inner 파라미터로 바이올린 내부에 표시할 내용을 지정합니다. 'box'는 미니 박스플롯, 'quartile'은 사분위선, 'point'는 개별 점, 'stick'은\r
    막대, None은 빈 공간입니다. 목적에 따라 선택합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figInner, (axQuartile, axPoint) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
    sns.violinplot(data=penguins, x='species', y='body_mass_g', inner='quartile', ax=axQuartile)\r
    axQuartile.set_title('inner="quartile"')\r
\r
    sns.violinplot(data=penguins, x='species', y='body_mass_g', inner='point', ax=axPoint)\r
    axPoint.set_title('inner="point"')\r
\r
    plt.tight_layout()\r
    figInner\r
  exercise:\r
    prompt: 7단계. inner 파라미터 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figInner, (axQuartile, axPoint) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
      sns.violinplot(data=penguins, x='species', y='body_mass_g', inner='quartile', ax=axQuartile)\r
      axQuartile.set_title('inner="quartile"')\r
\r
      sns.violinplot(data=penguins, x='species', y='body_mass_g', inner='point', ax=axPoint)\r
      axPoint.set_title('inner="point"')\r
\r
      plt.tight_layout()\r
      figInner\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. inner 파라미터의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. inner 파라미터 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step8_comparison\r
  title: 8단계. 박스 vs 바이올린\r
  structuredPrimary: true\r
  subtitle: 두 방식 비교\r
  goal: 8단계. 박스 vs 바이올린에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 박스플롯과 바이올린플롯을 나란히 비교합니다. 박스플롯은 요약 통계량을 명확히 보여주고, 바이올린플롯은 분포의 세부 형태를 보여줍니다. 두 차트를 함께 보면\r
    데이터를 더 완전하게 이해할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figCompare, (axBox, axViol) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
    sns.boxplot(data=penguins, x='species', y='body_mass_g', hue='sex', palette='Set2', ax=axBox)\r
    axBox.set_title('Box Plot')\r
    axBox.set_ylabel('Body Mass (g)')\r
\r
    sns.violinplot(data=penguins, x='species', y='body_mass_g', hue='sex',\r
                  split=True, palette='Set2', ax=axViol)\r
    axViol.set_title('Violin Plot')\r
    axViol.set_ylabel('Body Mass (g)')\r
\r
    plt.tight_layout()\r
    figCompare\r
  exercise:\r
    prompt: 8단계. 박스 vs 바이올린 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figCompare, (axBox, axViol) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
      sns.boxplot(data=penguins, x='species', y='body_mass_g', hue='sex', palette='Set2', ax=axBox)\r
      axBox.set_title('Box Plot')\r
      axBox.set_ylabel('Body Mass (g)')\r
\r
      sns.violinplot(data=penguins, x='species', y='body_mass_g', hue='sex',\r
                    split=True, palette='Set2', ax=axViol)\r
      axViol.set_title('Violin Plot')\r
      axViol.set_ylabel('Body Mass (g)')\r
\r
      plt.tight_layout()\r
      figCompare\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 박스 vs 바이올린의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 박스 vs 바이올린의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_strip_overlay\r
  title: 9단계. 점 오버레이\r
  structuredPrimary: true\r
  subtitle: 박스플롯 + 스트립플롯\r
  goal: 9단계. 점 오버레이에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 박스플롯 위에 stripplot을 겹쳐서 개별 데이터 포인트를 함께 표시할 수 있습니다. 요약 통계량과 실제 데이터를 동시에 보여주어 분포의 특성을 더 잘\r
    파악할 수 있습니다. dodge 파라미터를 맞춰야 점이 올바른 위치에 표시됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figOverlay, axOverlay = plt.subplots(figsize=(10, 6))\r
\r
    sns.boxplot(data=penguins, x='species', y='body_mass_g', hue='sex', palette='Set2', ax=axOverlay)\r
    sns.stripplot(data=penguins, x='species', y='body_mass_g', hue='sex',\r
                 dodge=True, palette='dark:black', alpha=0.5, size=4, ax=axOverlay, legend=False)\r
\r
    axOverlay.set_title('Body Mass with Individual Points')\r
    axOverlay.set_ylabel('Body Mass (g)')\r
    axOverlay.legend(title='Sex')\r
    figOverlay\r
  exercise:\r
    prompt: 9단계. 점 오버레이 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figOverlay, axOverlay = plt.subplots(figsize=(10, 6))\r
\r
      sns.boxplot(data=penguins, x='species', y='body_mass_g', hue='sex', palette='Set2', ax=axOverlay)\r
      sns.stripplot(data=penguins, x='species', y='body_mass_g', hue='sex',\r
                   dodge=True, palette='dark:black', alpha=0.5, size=4, ax=axOverlay, legend=False)\r
\r
      axOverlay.set_title('Body Mass with Individual Points')\r
      axOverlay.set_ylabel('Body Mass (g)')\r
      axOverlay.legend(title='Sex')\r
      figOverlay\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 점 오버레이의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 점 오버레이의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_flipper\r
  title: 10단계. 다른 변수 탐색\r
  structuredPrimary: true\r
  subtitle: 날개 길이 분포\r
  goal: 10단계. 다른 변수 탐색에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 같은 방식으로 날개 길이(flipper_length_mm) 분포도 탐색해봅니다. 이전에 배운 scatterplot으로 체중과 날개 길이의 관계도 함께 확인하면\r
    더 풍부한 인사이트를 얻을 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFlipper, (axFlipBox, axFlipScatter) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
    sns.boxplot(data=penguins, x='species', y='flipper_length_mm', hue='sex', palette='Set2', ax=axFlipBox)\r
    axFlipBox.set_title('Flipper Length by Species')\r
    axFlipBox.set_ylabel('Flipper Length (mm)')\r
\r
    sns.scatterplot(data=penguins, x='flipper_length_mm', y='body_mass_g',\r
                   hue='species', palette='Set2', alpha=0.7, ax=axFlipScatter)\r
    axFlipScatter.set_title('Flipper vs Body Mass')\r
\r
    plt.tight_layout()\r
    figFlipper\r
  exercise:\r
    prompt: 10단계. 다른 변수 탐색 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFlipper, (axFlipBox, axFlipScatter) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
      sns.boxplot(data=penguins, x='species', y='flipper_length_mm', hue='sex', palette='Set2', ax=axFlipBox)\r
      axFlipBox.set_title('Flipper Length by Species')\r
      axFlipBox.set_ylabel('Flipper Length (mm)')\r
\r
      sns.scatterplot(data=penguins, x='flipper_length_mm', y='body_mass_g',\r
                     hue='species', palette='Set2', alpha=0.7, ax=axFlipScatter)\r
      axFlipScatter.set_title('Flipper vs Body Mass')\r
\r
      plt.tight_layout()\r
      figFlipper\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 다른 변수 탐색의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 다른 변수 탐색의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step11_final\r
  title: 11단계. 최종 종합 분석\r
  structuredPrimary: true\r
  subtitle: 네 가지 관점\r
  goal: 11단계. 최종 종합 분석에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 차트 유형을 종합하여 펭귄 데이터를 다각도로 분석합니다. 히스토그램으로 전체 분포, 박스플롯으로 요약 통계, 바이올린플롯으로 분포 형태,\r
    산점도로 변수 관계를 함께 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal, axesFinal = plt.subplots(2, 2, figsize=(14, 10))\r
\r
    sns.histplot(data=penguins, x='body_mass_g', hue='species', kde=True, palette='Set2', ax=axesFinal[0, 0])\r
    axesFinal[0, 0].set_title('Body Mass Distribution')\r
\r
    sns.boxplot(data=penguins, x='species', y='body_mass_g', hue='sex', palette='Set2', ax=axesFinal[0, 1])\r
    axesFinal[0, 1].set_title('Body Mass by Species and Sex')\r
\r
    sns.violinplot(data=penguins, x='species', y='flipper_length_mm',\r
                  hue='sex', split=True, palette='Set2', ax=axesFinal[1, 0])\r
    axesFinal[1, 0].set_title('Flipper Length Distribution')\r
\r
    sns.scatterplot(data=penguins, x='bill_length_mm', y='bill_depth_mm',\r
                   hue='species', style='sex', palette='Set2', ax=axesFinal[1, 1])\r
    axesFinal[1, 1].set_title('Bill Dimensions')\r
\r
    plt.tight_layout()\r
    figFinal\r
  exercise:\r
    prompt: 11단계. 최종 종합 분석 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal, axesFinal = plt.subplots(2, 2, figsize=(14, 10))\r
\r
      sns.histplot(data=penguins, x='body_mass_g', hue='species', kde=True, palette='Set2', ax=axesFinal[0, 0])\r
      axesFinal[0, 0].set_title('Body Mass Distribution')\r
\r
      sns.boxplot(data=penguins, x='species', y='body_mass_g', hue='sex', palette='Set2', ax=axesFinal[0, 1])\r
      axesFinal[0, 1].set_title('Body Mass by Species and Sex')\r
\r
      sns.violinplot(data=penguins, x='species', y='flipper_length_mm',\r
                    hue='sex', split=True, palette='Set2', ax=axesFinal[1, 0])\r
      axesFinal[1, 0].set_title('Flipper Length Distribution')\r
\r
      sns.scatterplot(data=penguins, x='bill_length_mm', y='bill_depth_mm',\r
                     hue='species', style='sex', palette='Set2', ax=axesFinal[1, 1])\r
      axesFinal[1, 1].set_title('Bill Dimensions')\r
\r
      plt.tight_layout()\r
      figFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 최종 종합 분석의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 최종 종합 분석의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 분포 비교 프로젝트\r
  goal: 실습에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 boxplot, violinplot, hue, split, inner를 활용해서 다양한 분포를 비교해봅시다.\r
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
    content: Seaborn boxplot과 violinplot으로 펭귄 체중 분포를 비교했습니다.\r
  - type: list\r
    items:\r
    - sns.boxplot() - 5가지 요약 통계량 시각화\r
    - sns.violinplot() - 분포 모양(KDE) 시각화\r
    - hue로 다중 그룹 비교\r
    - split=True - 바이올린을 좌우로 분할\r
    - inner='box'/'quartile'/'point' - 내부 표시 옵션\r
    - stripplot 오버레이로 개별 점 표시\r
  - type: text\r
    content: 다음 시간에는 regplot으로 회귀 분석을 시각화합니다.\r
  goal: 정리에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: workflow_validation\r
  title: 12단계. 펭귄 분포 비교 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 수정 → 검증 → 실무 변주\r
  goal: 12단계. 펭귄 분포 비교 검증 루프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    boxplot과 violinplot은 집단 간 차이를 빠르게 비교하지만, 결측값과 범주 수를 먼저 확인하지 않으면 차트 해석이 흔들립니다. Gentoo가 더 무겁다는 예측을 데이터와 차트 양쪽에서 확인합니다.\r
\r
    분포 비교는 “누가 큰가”에서 멈추지 말고, 다른 지표에서도 같은 결론이 유지되는지 확인해야 실무 보고서가 강해집니다.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    penguinFlow = loadLocalDataset("penguins").dropna()\r
    requiredColumns = {"species", "sex", "body_mass_g", "flipper_length_mm"}\r
    missingColumns = requiredColumns - set(penguinFlow.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert sorted(penguinFlow["species"].unique()) == ["Adelie", "Chinstrap", "Gentoo"]\r
\r
    massBySpecies = penguinFlow.groupby("species")["body_mass_g"].mean()\r
    assert massBySpecies["Gentoo"] == massBySpecies.max()\r
    massBySpecies.round(1)\r
  exercise:\r
    prompt: 12단계. 펭귄 분포 비교 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      penguinFlow = loadLocalDataset("penguins").dropna()\r
      requiredColumns = {"species", "sex", "body_mass_g", "flipper_length_mm"}\r
      missingColumns = requiredColumns - set(penguinFlow.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert sorted(penguinFlow["species"].unique()) == ["Adelie", "Chinstrap", "Gentoo"]\r
\r
      massBySpecies = penguinFlow.groupby("species")["body_mass_g"].mean()\r
      assert massBySpecies["Gentoo"] == massBySpecies.max()\r
      massBySpecies.round(1)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 펭귄 분포 비교 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 펭귄 분포 비교 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};