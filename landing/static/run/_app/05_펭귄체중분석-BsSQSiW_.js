var e=`meta:\r
  packages:\r
  - matplotlib\r
  - pandas\r
  - seaborn\r
  id: matplotlib_05\r
  title: 펭귄체중분석\r
  order: 5\r
  category: matplotlib\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - matplotlib\r
  - boxplot\r
  - violinplot\r
  - sharex\r
  - spines\r
  - penguins\r
  seo:\r
    title: Matplotlib 바이올린 플롯 - 펭귄 체중 분포 분석\r
    description: Matplotlib으로 펭귄 데이터의 종별 체중 분포를 바이올린 플롯과 박스플롯으로 비교합니다. violinplot, sharex, spines 사용법을\r
      배웁니다.\r
    keywords:\r
    - matplotlib\r
    - violinplot\r
    - boxplot\r
    - penguins\r
    - 분포\r
    - spines\r
intro:\r
  emoji: 🐧\r
  goal: 펭귄 종별 체중 분포를 바이올린 플롯과 박스플롯으로 비교 분석합니다.\r
  description: 바이올린 플롯은 분포의 밀도를 시각적으로 보여줍니다. 박스플롯과 함께 사용하면 분포 특성을 더 완전하게 파악할 수 있습니다. 이전에 배운 hist, scatter,\r
    bar, subplots 개념을 함께 활용합니다.\r
  direction: 펭귄체중분석에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.\r
  benefits:\r
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 펭귄체중분석 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 11단계. 한글 폰트 설정 처리 실행\r
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 2단계. 데이터 로드 결과 검증\r
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.\r
    - label: 펭귄체중분석 재사용\r
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 시각 리포트 환경\r
      detail: matplotlib, numpy, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 펭귄체중분석 실행\r
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.\r
    - label: 펭귄체중분석 완료\r
      detail: 검증된 코드를 보고서 차트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    penguins(펭귄) 데이터셋은 남극 펭귄 3종의 신체 측정 데이터입니다. 아델리(Adelie), 친스트랩(Chinstrap), 젠투(Gentoo) 펭귄의 부리 길이, 부리 깊이, 날개 길이, 체중 등이 포함되어 있습니다. iris 데이터와 유사하게 분류 문제에 자주 사용됩니다.\r
\r
    import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. seaborn은 sns로, pandas는 pd로 줄여 쓰는 것이 데이터 과학 커뮤니티의 표준입니다.\r
  tips:\r
  - import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. seaborn은 sns로, pandas는\r
    pd로 줄여 쓰는 것이 데이터 과학 커뮤니티의 표준입니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import pandas as pd\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import pandas as pd\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 축/범례/파일 출력 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step1_font\r
  title: 1-1단계. 한글 폰트 설정\r
  structuredPrimary: true\r
  subtitle: Codaro 로컬 Python 환경 폰트\r
  goal: 11단계. 한글 폰트 설정에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    Codaro 로컬 Python에서는 실행 환경에 따라 기본 폰트에 한글 글리프가 없을 수 있습니다. CDN 또는 로컬 폰트 파일을 matplotlib에 등록하는 방식으로 해결합니다. Pretendard는 무료 오픈소스 폰트로, 한글과 영문 모두 깔끔하게 표시됩니다.\r
\r
    font_manager로 현재 환경의 폰트 목록을 확인하고, 사용 가능한 한글 폰트를 rcParams에 설정합니다. axes.unicode_minus = False는 마이너스 기호가 깨지는 것을 방지합니다.\r
  tips:\r
  - font_manager로 현재 환경의 폰트 목록을 확인하고, 사용 가능한 한글 폰트를 rcParams에 설정합니다. axes.unicode_minus = False는 마이너스\r
    기호가 깨지는 것을 방지합니다.\r
  snippet: |-\r
    from matplotlib import font_manager\r
\r
    fontCandidates = ["Malgun Gothic", "AppleGothic", "NanumGothic", "DejaVu Sans"]\r
    availableFonts = {font.name for font in font_manager.fontManager.ttflist}\r
    for fontName in fontCandidates:\r
        if fontName in availableFonts:\r
            plt.rcParams["font.family"] = fontName\r
            break\r
    plt.rcParams["axes.unicode_minus"] = False\r
  exercise:\r
    prompt: 11단계. 한글 폰트 설정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      from matplotlib import font_manager\r
\r
      fontCandidates = ["Malgun Gothic", "AppleGothic", "NanumGothic", "DejaVu Sans"]\r
      availableFonts = {font.name for font in font_manager.fontManager.ttflist}\r
      for fontName in fontCandidates:\r
          if fontName in availableFonts:\r
              plt.rcParams["font.family"] = fontName\r
              break\r
      plt.rcParams["axes.unicode_minus"] = False\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 한글 폰트 설정의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 11단계. 한글 폰트 설정 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step2_data\r
  title: 2단계. 데이터 로드\r
  structuredPrimary: true\r
  subtitle: penguins 데이터\r
  goal: 2단계. 데이터 로드에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: loadLocalDataset()으로 penguins 데이터를 불러옵니다. 펭귄 종, 섬, 부리 길이, 날개 길이, 체중 같은 컬럼을 포함합니다. 로컬 데이터라\r
    인터넷 연결과 무관하게 같은 분석 흐름을 재현할 수 있습니다.\r
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
- id: step3_explore\r
  title: 3단계. 종별 통계\r
  structuredPrimary: true\r
  subtitle: groupby 집계\r
  goal: 3단계. 종별 통계에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
  explanation: 각 펭귄 종별로 체중의 기본 통계를 확인합니다. groupby와 agg를 사용하면 여러 통계량을 한 번에 계산할 수 있습니다. 젠투 펭귄이 가장 무겁고, 친스트랩\r
    펭귄이 가장 가벼운 것을 알 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: penguins.groupby('species')['body_mass_g'].agg(['mean', 'std', 'min', 'max'])\r
  exercise:\r
    prompt: 3단계. 종별 통계 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: penguins.groupby('species')['body_mass_g'].agg(['mean', 'std', 'min', 'max'])\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 종별 통계의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 3단계. 종별 통계 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step4_boxplot\r
  title: 4단계. 종별 박스플롯\r
  structuredPrimary: true\r
  subtitle: 그룹별 boxplot\r
  goal: 4단계. 종별 박스플롯에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 이전에 배운 박스플롯을 종별로 그려봅니다. 여러 그룹의 박스플롯을 한 번에 그리려면 각 그룹의 데이터를 리스트로 전달합니다. tick_labels로 각 박스에 라벨을\r
    지정합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figBox, axBox = plt.subplots(figsize=(10, 6))\r
\r
    speciesBox = ['Adelie', 'Chinstrap', 'Gentoo']\r
    weightBox = [penguins[penguins['species'] == sp]['body_mass_g'] for sp in speciesBox]\r
\r
    axBox.boxplot(weightBox, tick_labels=speciesBox)\r
    axBox.set_title('펭귄 종별 체중 분포', fontsize=14)\r
    axBox.set_xlabel('종', fontsize=12)\r
    axBox.set_ylabel('체중 (g)', fontsize=12)\r
    axBox.grid(True, axis='y', alpha=0.3)\r
    figBox\r
  exercise:\r
    prompt: 4단계. 종별 박스플롯 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBox, axBox = plt.subplots(figsize=(10, 6))\r
\r
      speciesBox = ['Adelie', 'Chinstrap', 'Gentoo']\r
      weightBox = [penguins[penguins['species'] == sp]['body_mass_g'] for sp in speciesBox]\r
\r
      axBox.boxplot(weightBox, tick_labels=speciesBox)\r
      axBox.set_title('펭귄 종별 체중 분포', fontsize=14)\r
      axBox.set_xlabel('종', fontsize=12)\r
      axBox.set_ylabel('체중 (g)', fontsize=12)\r
      axBox.grid(True, axis='y', alpha=0.3)\r
      figBox\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 종별 박스플롯의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 4단계. 종별 박스플롯 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step5_violin\r
  title: 5단계. 바이올린 플롯\r
  structuredPrimary: true\r
  subtitle: ax.violinplot()\r
  goal: 5단계. 바이올린 플롯에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    바이올린 플롯은 박스플롯과 커널 밀도 추정(KDE)을 결합한 차트입니다. 분포의 형태를 시각적으로 보여주어 박스플롯보다 더 풍부한 정보를 제공합니다. 데이터가 어디에 집중되어 있는지, 양봉 분포인지 등을 파악할 수 있습니다.\r
\r
    ax.violinplot(데이터리스트)로 바이올린 플롯을 그립니다. showmeans=True는 평균선, showmedians=True는 중앙값선을 표시합니다. positions로 x축 위치를 지정합니다. 반환값(parts)으로 각 요소의 스타일을 커스터마이징할 수 있습니다.\r
  tips:\r
  - ax.violinplot(데이터리스트)로 바이올린 플롯을 그립니다. showmeans=True는 평균선, showmedians=True는 중앙값선을 표시합니다. positions로\r
    x축 위치를 지정합니다. 반환값(parts)으로 각 요소의 스타일을 커스터마이징할 수 있습니다.\r
  snippet: |-\r
    figViolin, axViolin = plt.subplots(figsize=(10, 6))\r
\r
    speciesViolin = ['Adelie', 'Chinstrap', 'Gentoo']\r
    weightViolin = [penguins[penguins['species'] == sp]['body_mass_g'] for sp in speciesViolin]\r
\r
    partsViolin = axViolin.violinplot(weightViolin, positions=[1, 2, 3], showmeans=True, showmedians=True)\r
    axViolin.set_xticks([1, 2, 3])\r
    axViolin.set_xticklabels(speciesViolin)\r
    axViolin.set_title('펭귄 종별 체중 분포 (바이올린 플롯)', fontsize=14)\r
    axViolin.set_xlabel('종', fontsize=12)\r
    axViolin.set_ylabel('체중 (g)', fontsize=12)\r
    axViolin.grid(True, axis='y', alpha=0.3)\r
    figViolin\r
  exercise:\r
    prompt: 5단계. 바이올린 플롯 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figViolin, axViolin = plt.subplots(figsize=(10, 6))\r
\r
      speciesViolin = ['Adelie', 'Chinstrap', 'Gentoo']\r
      weightViolin = [penguins[penguins['species'] == sp]['body_mass_g'] for sp in speciesViolin]\r
\r
      partsViolin = axViolin.violinplot(weightViolin, positions=[1, 2, 3], showmeans=True, showmedians=True)\r
      axViolin.set_xticks([1, 2, 3])\r
      axViolin.set_xticklabels(speciesViolin)\r
      axViolin.set_title('펭귄 종별 체중 분포 (바이올린 플롯)', fontsize=14)\r
      axViolin.set_xlabel('종', fontsize=12)\r
      axViolin.set_ylabel('체중 (g)', fontsize=12)\r
      axViolin.grid(True, axis='y', alpha=0.3)\r
      figViolin\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 바이올린 플롯의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 5단계. 바이올린 플롯 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step6_violin_style\r
  title: 6단계. 바이올린 플롯 스타일링\r
  structuredPrimary: true\r
  subtitle: 색상 커스터마이징\r
  goal: 6단계. 바이올린 플롯 스타일링에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 바이올린 플롯의 색상을 커스터마이징하면 더 보기 좋은 차트를 만들 수 있습니다. violinplot이 반환하는 딕셔너리의 'bodies' 키로 각 바이올린에\r
    접근하여 색상을 변경합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figViolinColor, axViolinColor = plt.subplots(figsize=(10, 6))\r
\r
    speciesColor = ['Adelie', 'Chinstrap', 'Gentoo']\r
    colorsColor = ['#E74C3C', '#27AE60', '#3498DB']\r
    weightColor = [penguins[penguins['species'] == sp]['body_mass_g'] for sp in speciesColor]\r
\r
    partsColor = axViolinColor.violinplot(weightColor, positions=[1, 2, 3], showmeans=True)\r
    figViolinColor\r
  exercise:\r
    prompt: 6단계. 바이올린 플롯 스타일링 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figViolinColor, axViolinColor = plt.subplots(figsize=(10, 6))\r
\r
      speciesColor = ['Adelie', 'Chinstrap', 'Gentoo']\r
      colorsColor = ['#E74C3C', '#27AE60', '#3498DB']\r
      weightColor = [penguins[penguins['species'] == sp]['body_mass_g'] for sp in speciesColor]\r
\r
      partsColor = axViolinColor.violinplot(weightColor, positions=[1, 2, 3], showmeans=True)\r
      figViolinColor\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 바이올린 플롯 스타일링의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 6단계. 바이올린 플롯 스타일링 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step7_sharex\r
  title: 7단계. 축 공유 서브플롯\r
  structuredPrimary: true\r
  subtitle: sharex, sharey\r
  goal: 7단계. 축 공유 서브플롯에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    박스플롯과 바이올린 플롯을 같은 y축 범위로 비교하면 두 차트의 차이점을 명확하게 볼 수 있습니다. sharey=True로 y축을 공유하면 스케일이 동일하게 유지됩니다.\r
\r
    plt.subplots(sharex=True)는 x축을, sharey=True는 y축을 공유합니다. 같은 데이터를 다른 방식으로 시각화할 때 스케일을 통일하여 정확한 비교가 가능합니다. patch_artist=True로 박스플롯에 색상을 채울 수 있습니다.\r
  tips:\r
  - plt.subplots(sharex=True)는 x축을, sharey=True는 y축을 공유합니다. 같은 데이터를 다른 방식으로 시각화할 때 스케일을 통일하여 정확한 비교가 가능합니다.\r
    patch_artist=True로 박스플롯에 색상을 채울 수 있습니다.\r
  snippet: |-\r
    figShare, (axBoxShare, axViolinShare) = plt.subplots(1, 2, figsize=(14, 6), sharey=True)\r
\r
    speciesShare = ['Adelie', 'Chinstrap', 'Gentoo']\r
    colorsShare = ['#E74C3C', '#27AE60', '#3498DB']\r
    weightShare = [penguins[penguins['species'] == sp]['body_mass_g'] for sp in speciesShare]\r
\r
    bpShare = axBoxShare.boxplot(weightShare, tick_labels=speciesShare, patch_artist=True)\r
    for patch, color in zip(bpShare['boxes'], colorsShare):\r
        patch.set_facecolor(color)\r
        patch.set_alpha(0.7)\r
    axBoxShare.set_title('박스플롯', fontsize=12)\r
    axBoxShare.set_xlabel('종')\r
    axBoxShare.set_ylabel('체중 (g)')\r
    figShare\r
  exercise:\r
    prompt: 7단계. 축 공유 서브플롯 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figShare, (axBoxShare, axViolinShare) = plt.subplots(1, 2, figsize=(14, 6), sharey=True)\r
\r
      speciesShare = ['Adelie', 'Chinstrap', 'Gentoo']\r
      colorsShare = ['#E74C3C', '#27AE60', '#3498DB']\r
      weightShare = [penguins[penguins['species'] == sp]['body_mass_g'] for sp in speciesShare]\r
\r
      bpShare = axBoxShare.boxplot(weightShare, tick_labels=speciesShare, patch_artist=True)\r
      for patch, color in zip(bpShare['boxes'], colorsShare):\r
          patch.set_facecolor(color)\r
          patch.set_alpha(0.7)\r
      axBoxShare.set_title('박스플롯', fontsize=12)\r
      axBoxShare.set_xlabel('종')\r
      axBoxShare.set_ylabel('체중 (g)')\r
      figShare\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 축 공유 서브플롯의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 7단계. 축 공유 서브플롯 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step8_spines\r
  title: 8단계. 스파인 제거\r
  structuredPrimary: true\r
  subtitle: spines 설정\r
  goal: 8단계. 스파인 제거에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    스파인(spine)은 차트 영역의 테두리입니다. 불필요한 스파인을 제거하면 더 깔끔하고 현대적인 디자인이 됩니다. 보통 상단과 우측 스파인을 제거하고, 좌측과 하단만 남깁니다.\r
\r
    ax.spines['위치'].set_visible(False)로 스파인을 숨깁니다. 위치는 'top', 'bottom', 'left', 'right' 중 하나입니다. set_color(), set_linewidth()로 스파인 스타일도 변경할 수 있습니다.\r
  tips:\r
  - ax.spines['위치'].set_visible(False)로 스파인을 숨깁니다. 위치는 'top', 'bottom', 'left', 'right' 중 하나입니다. set_color(),\r
    set_linewidth()로 스파인 스타일도 변경할 수 있습니다.\r
  snippet: |-\r
    figSpines, axSpines = plt.subplots(figsize=(10, 6))\r
\r
    speciesSpines = ['Adelie', 'Chinstrap', 'Gentoo']\r
    colorsSpines = ['#E74C3C', '#27AE60', '#3498DB']\r
    weightSpines = [penguins[penguins['species'] == sp]['body_mass_g'] for sp in speciesSpines]\r
\r
    partsSpines = axSpines.violinplot(weightSpines, positions=[1, 2, 3], showmeans=True)\r
    for idx, body in enumerate(partsSpines['bodies']):\r
        body.set_facecolor(colorsSpines[idx])\r
        body.set_alpha(0.7)\r
    figSpines\r
  exercise:\r
    prompt: 8단계. 스파인 제거 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figSpines, axSpines = plt.subplots(figsize=(10, 6))\r
\r
      speciesSpines = ['Adelie', 'Chinstrap', 'Gentoo']\r
      colorsSpines = ['#E74C3C', '#27AE60', '#3498DB']\r
      weightSpines = [penguins[penguins['species'] == sp]['body_mass_g'] for sp in speciesSpines]\r
\r
      partsSpines = axSpines.violinplot(weightSpines, positions=[1, 2, 3], showmeans=True)\r
      for idx, body in enumerate(partsSpines['bodies']):\r
          body.set_facecolor(colorsSpines[idx])\r
          body.set_alpha(0.7)\r
      figSpines\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 스파인 제거의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 8단계. 스파인 제거 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step9_subplot_compare\r
  title: 9단계. 2x2 비교 차트\r
  structuredPrimary: true\r
  subtitle: 여러 특성 비교\r
  goal: 9단계. 2x2 비교 차트에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 체중뿐만 아니라 다른 신체 특성도 함께 비교합니다. 2x2 서브플롯으로 체중, 부리 길이, 부리 깊이, 날개 길이를 한눈에 볼 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figMulti, axesMulti = plt.subplots(2, 2, figsize=(12, 10))\r
\r
    speciesMulti = ['Adelie', 'Chinstrap', 'Gentoo']\r
    colorsMulti = ['#E74C3C', '#27AE60', '#3498DB']\r
    featuresMulti = ['body_mass_g', 'bill_length_mm', 'bill_depth_mm', 'flipper_length_mm']\r
    titlesMulti = ['체중 (g)', '부리 길이 (mm)', '부리 깊이 (mm)', '날개 길이 (mm)']\r
  exercise:\r
    prompt: 9단계. 2x2 비교 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figMulti, axesMulti = plt.subplots(2, 2, figsize=(12, 10))\r
\r
      speciesMulti = ['Adelie', 'Chinstrap', 'Gentoo']\r
      colorsMulti = ['#E74C3C', '#27AE60', '#3498DB']\r
      featuresMulti = ['body_mass_g', 'bill_length_mm', 'bill_depth_mm', 'flipper_length_mm']\r
      titlesMulti = ['체중 (g)', '부리 길이 (mm)', '부리 깊이 (mm)', '날개 길이 (mm)']\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 2x2 비교 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 2x2 비교 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_final\r
  title: 10단계. 최종 시각화\r
  structuredPrimary: true\r
  subtitle: 완성된 분포 비교\r
  goal: 10단계. 최종 시각화에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 요소를 종합하여 완성도 높은 펭귄 체중 분석 차트를 만듭니다. 바이올린 플롯과 박스플롯의 장점을 모두 활용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal, axFinal = plt.subplots(figsize=(11, 7))\r
\r
    speciesFinal = ['Adelie', 'Chinstrap', 'Gentoo']\r
    colorsFinal = ['#E74C3C', '#27AE60', '#3498DB']\r
    weightFinal = [penguins[penguins['species'] == sp]['body_mass_g'] for sp in speciesFinal]\r
\r
    partsFinal = axFinal.violinplot(weightFinal, positions=[1, 2, 3], showmeans=False, showmedians=False)\r
    for idx, body in enumerate(partsFinal['bodies']):\r
        body.set_facecolor(colorsFinal[idx])\r
        body.set_edgecolor('white')\r
        body.set_alpha(0.7)\r
    figFinal\r
  exercise:\r
    prompt: 10단계. 최종 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal, axFinal = plt.subplots(figsize=(11, 7))\r
\r
      speciesFinal = ['Adelie', 'Chinstrap', 'Gentoo']\r
      colorsFinal = ['#E74C3C', '#27AE60', '#3498DB']\r
      weightFinal = [penguins[penguins['species'] == sp]['body_mass_g'] for sp in speciesFinal]\r
\r
      partsFinal = axFinal.violinplot(weightFinal, positions=[1, 2, 3], showmeans=False, showmedians=False)\r
      for idx, body in enumerate(partsFinal['bodies']):\r
          body.set_facecolor(colorsFinal[idx])\r
          body.set_edgecolor('white')\r
          body.set_alpha(0.7)\r
      figFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 최종 시각화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 최종 시각화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 펭귄 데이터 분석 프로젝트\r
  goal: 실습에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 내용을 활용해서 펭귄 데이터를 다양한 관점에서 분석해봅시다. boxplot, violinplot, sharex/sharey, spines 등 모든 개념을 종합적으로 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    data = loadLocalDataset('penguins').dropna()\r
\r
    chart, (violin, box) = plt.subplots(1, 2, figsize=(14, 6), sharey=True)\r
\r
    islands = data['island'].unique()\r
    palette = ['#9B59B6', '#F39C12', '#1ABC9C']\r
    mass = [data[data['island'] == isl]['body_mass_g'] for isl in islands]\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      data = loadLocalDataset('penguins').dropna()\r
\r
      chart, (violin, box) = plt.subplots(1, 2, figsize=(14, 6), sharey=True)\r
\r
      islands = data['island'].unique()\r
      palette = ['#9B59B6', '#F39C12', '#1ABC9C']\r
      mass = [data[data['island'] == isl]['body_mass_g'] for isl in islands]\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: 바이올린 플롯과 박스플롯으로 펭귄 체중 분포를 분석했습니다.\r
  - type: list\r
    items:\r
    - ax.violinplot(data) - 분포 밀도를 시각화하는 바이올린 플롯\r
    - showmeans, showmedians - 평균선, 중앙값선 표시\r
    - parts['bodies'] - 바이올린 요소 접근 및 스타일링\r
    - plt.subplots(sharey=True) - y축 공유로 스케일 통일\r
    - patch_artist=True - 박스플롯에 색상 채우기\r
    - ax.spines[].set_visible(False) - 스파인 제거로 깔끔한 디자인\r
  - type: text\r
    content: 다음 시간에는 히트맵으로 상관관계를 시각화합니다.\r
  goal: 정리에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
- id: workflow_validation\r
  title: 업무 흐름 검증\r
  structuredPrimary: true\r
  subtitle: 보고서 차트 품질 게이트\r
  goal: 업무 흐름 검증에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: Matplotlib 학습은 차트를 그리는 데서 끝나면 부족합니다. 업무용 차트는 입력 데이터가 맞는지 검증하고, 잘못된 컬럼이나 음수 금액을 오류로 막고,\r
    제목·축·범례·기준선이 실제 보고서 기준을 만족하는지 확인해야 합니다. 마지막에는 목표선을 바꾸는 변주로 메시지가 어떻게 달라지는지 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    import matplotlib.pyplot as plt\r
\r
    reportData = pd.DataFrame({\r
        "month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],\r
        "revenue": [82, 91, 105, 112, 121, 130],\r
        "cost": [55, 58, 62, 64, 68, 72],\r
        "target": [100, 100, 100, 100, 100, 100],\r
    })\r
\r
    def validateChartFrame(frame: pd.DataFrame) -> bool:\r
        requiredColumns = {"month", "revenue", "cost", "target"}\r
        missingColumns = requiredColumns - set(frame.columns)\r
        if missingColumns:\r
            raise ValueError(f"필수 컬럼 누락: {sorted(missingColumns)}")\r
        if frame[["revenue", "cost", "target"]].lt(0).any().any():\r
            raise ValueError("금액 컬럼은 음수가 될 수 없습니다.")\r
        return True\r
\r
    validateChartFrame(reportData)\r
    reportData\r
  exercise:\r
    prompt: 업무 흐름 검증 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      targetScenario = pd.DataFrame({"target": [95, 100, 115]}).assign(\r
          monthsPassed=lambda frame: frame["target"].map(lambda target: int((reportData["revenue"] >= target).sum()))\r
      )\r
\r
      assert targetScenario["monthsPassed"].is_monotonic_decreasing\r
      targetScenario\r
    solution: |-\r
      import pandas as pd\r
      import matplotlib.pyplot as plt\r
\r
      reportData = pd.DataFrame({\r
          "month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],\r
          "revenue": [82, 91, 105, 112, 121, 130],\r
          "cost": [55, 58, 62, 64, 68, 72],\r
          "target": [100, 100, 100, 100, 100, 100],\r
      })\r
\r
      def validateChartFrame(frame: pd.DataFrame) -> bool:\r
          requiredColumns = {"month", "revenue", "cost", "target"}\r
          missingColumns = requiredColumns - set(frame.columns)\r
          if missingColumns:\r
              raise ValueError(f"필수 컬럼 누락: {sorted(missingColumns)}")\r
          if frame[["revenue", "cost", "target"]].lt(0).any().any():\r
              raise ValueError("금액 컬럼은 음수가 될 수 없습니다.")\r
          return True\r
\r
      validateChartFrame(reportData)\r
      reportData\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 업무 흐름 검증의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 업무 흐름 검증의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};