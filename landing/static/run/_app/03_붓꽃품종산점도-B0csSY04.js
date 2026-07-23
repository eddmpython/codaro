var e=`meta:\r
  packages:\r
  - matplotlib\r
  - pandas\r
  - seaborn\r
  id: matplotlib_03\r
  title: 붓꽃품종산점도\r
  order: 3\r
  category: matplotlib\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - matplotlib\r
  - scatter\r
  - marker\r
  - legend\r
  - iris\r
  - 산점도\r
  seo:\r
    title: Matplotlib 산점도 - 붓꽃 품종별 특성 시각화\r
    description: Matplotlib으로 붓꽃 데이터의 품종별 특성을 산점도로 시각화합니다. scatter, marker, legend, text 사용법을 배웁니다.\r
    keywords:\r
    - matplotlib\r
    - scatter\r
    - 산점도\r
    - iris\r
    - marker\r
    - 품종분류\r
intro:\r
  emoji: 🌸\r
  goal: 붓꽃 품종별 꽃잎/꽃받침 특성을 산점도로 시각화합니다.\r
  description: 산점도로 두 변수 간의 관계를 파악하고, 색상과 마커로 그룹을 구분합니다. 이전에 배운 plot, hist, subplots 개념을 함께 활용합니다.\r
  direction: 붓꽃품종산점도에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.\r
  benefits:\r
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 붓꽃품종산점도 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 11단계. 한글 폰트 설정 처리 실행\r
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 2단계. 데이터 로드 결과 검증\r
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.\r
    - label: 붓꽃품종산점도 재사용\r
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 시각 리포트 환경\r
      detail: matplotlib, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 붓꽃품종산점도 실행\r
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.\r
    - label: 붓꽃품종산점도 완료\r
      detail: 검증된 코드를 보고서 차트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    iris(붓꽃) 데이터셋은 머신러닝의 가장 유명한 예제 데이터입니다. 3가지 품종(setosa, versicolor, virginica)의 꽃잎(petal)과 꽃받침(sepal)의 길이와 너비를 담고 있습니다. 품종 분류 문제의 대표적인 데이터셋으로, 시각화를 통해 품종별 특성 차이를 명확하게 파악할 수 있습니다.\r
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
  subtitle: iris 데이터\r
  goal: 2단계. 데이터 로드에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: loadLocalDataset()으로 iris 데이터를 불러옵니다. 150개의 샘플이 있으며, 각 품종당 50개씩 균등하게 분포되어 있습니다. 4개의 수치형\r
    특성과 1개의 범주형 특성(species)으로 구성됩니다. 로컬 데이터라 인터넷 연결과 무관하게 재현됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    iris = loadLocalDataset('iris')\r
    iris.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      iris = loadLocalDataset('iris')\r
      iris.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_explore\r
  title: 3단계. 품종 확인\r
  structuredPrimary: true\r
  subtitle: unique()\r
  goal: 3단계. 품종 확인에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
  explanation: species 컬럼의 고유값을 확인하여 어떤 품종이 있는지 파악합니다. 3가지 품종이 있으며, 각각 다른 특성을 가지고 있어 산점도에서 군집으로 나타납니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: iris['species'].unique()\r
  exercise:\r
    prompt: 3단계. 품종 확인 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: iris['species'].unique()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 품종 확인의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 3단계. 품종 확인 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step4_scatter\r
  title: 4단계. 기본 산점도\r
  structuredPrimary: true\r
  subtitle: ax.scatter()\r
  goal: 4단계. 기본 산점도에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    산점도는 두 변수 간의 관계를 점으로 표시하는 차트입니다. x축에 꽃받침 길이, y축에 꽃받침 너비를 배치하면 두 변수의 상관관계를 파악할 수 있습니다. 점들이 어떤 패턴을 보이는지 관찰해봅시다.\r
\r
    ax.scatter(x, y)로 산점도를 그립니다. x와 y에는 같은 길이의 배열이나 Series를 전달합니다. plot()과 달리 점들을 선으로 연결하지 않고 개별 점으로 표시합니다.\r
  snippet: |-\r
    figScatter, axScatter = plt.subplots(figsize=(10, 7))\r
    axScatter.scatter(iris['sepal_length'], iris['sepal_width'])\r
    axScatter.set_title('꽃받침 길이 vs 너비', fontsize=14)\r
    axScatter.set_xlabel('꽃받침 길이 (cm)', fontsize=12)\r
    axScatter.set_ylabel('꽃받침 너비 (cm)', fontsize=12)\r
    figScatter\r
  exercise:\r
    prompt: 4단계. 기본 산점도 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figScatter, axScatter = plt.subplots(figsize=(10, 7))\r
      axScatter.scatter(iris['sepal_length'], iris['sepal_width'])\r
      axScatter.set_title('꽃받침 길이 vs 너비', fontsize=14)\r
      axScatter.set_xlabel('꽃받침 길이 (cm)', fontsize=12)\r
      axScatter.set_ylabel('꽃받침 너비 (cm)', fontsize=12)\r
      figScatter\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 기본 산점도의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 4단계. 기본 산점도 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step5_color\r
  title: 5단계. 품종별 색상 구분\r
  structuredPrimary: true\r
  subtitle: c 파라미터\r
  goal: 5단계. 품종별 색상 구분에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 품종별로 다른 색상을 지정하면 그룹 간 차이를 명확하게 볼 수 있습니다. 각 품종을 순서대로 플롯하고 다른 색상과 라벨을 지정합니다. 이렇게 하면 setosa가\r
    다른 품종과 명확히 구분되는 것을 알 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figColor, axColor = plt.subplots(figsize=(10, 7))\r
\r
    speciesColor = ['setosa', 'versicolor', 'virginica']\r
    colorsColor = ['#E74C3C', '#27AE60', '#3498DB']\r
  exercise:\r
    prompt: 5단계. 품종별 색상 구분 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figColor, axColor = plt.subplots(figsize=(10, 7))\r
\r
      speciesColor = ['setosa', 'versicolor', 'virginica']\r
      colorsColor = ['#E74C3C', '#27AE60', '#3498DB']\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 품종별 색상 구분의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 품종별 색상 구분의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_marker\r
  title: 6단계. 마커 스타일 변경\r
  structuredPrimary: true\r
  subtitle: marker 파라미터\r
  goal: 6단계. 마커 스타일 변경에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    색상뿐만 아니라 마커 모양도 다르게 설정하면 흑백 인쇄에서도 구분이 가능합니다. 'o'(원), 's'(사각형), '^'(삼각형), 'd'(다이아몬드) 등 다양한 마커를 사용할 수 있습니다. 학술 논문에서는 색상과 마커를 함께 사용하는 것이 권장됩니다.\r
\r
    marker 파라미터로 점의 모양을 지정합니다. 주요 마커: 'o'(원), 's'(사각형), '^'(위 삼각형), 'v'(아래 삼각형), 'd'(다이아몬드), 'x'(X표), '+'(플러스). s 파라미터는 마커 크기입니다.\r
  tips:\r
  - 'marker 파라미터로 점의 모양을 지정합니다. 주요 마커: ''o''(원), ''s''(사각형), ''^''(위 삼각형), ''v''(아래 삼각형), ''d''(다이아몬드),\r
    ''x''(X표), ''+''(플러스). s 파라미터는 마커 크기입니다.'\r
  snippet: |-\r
    figMarker, axMarker = plt.subplots(figsize=(10, 7))\r
\r
    speciesMarker = ['setosa', 'versicolor', 'virginica']\r
    colorsMarker = ['#E74C3C', '#27AE60', '#3498DB']\r
    markersMarker = ['o', 's', '^']\r
  exercise:\r
    prompt: 6단계. 마커 스타일 변경 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figMarker, axMarker = plt.subplots(figsize=(10, 7))\r
\r
      speciesMarker = ['setosa', 'versicolor', 'virginica']\r
      colorsMarker = ['#E74C3C', '#27AE60', '#3498DB']\r
      markersMarker = ['o', 's', '^']\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 마커 스타일 변경의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 마커 스타일 변경의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_text\r
  title: 7단계. 텍스트 추가\r
  structuredPrimary: true\r
  subtitle: ax.text()\r
  goal: 7단계. 텍스트 추가에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    차트에 텍스트를 추가하면 중요한 정보를 직접 표시할 수 있습니다. 예를 들어 각 품종 군집의 중심에 품종명을 표시하거나, 특이값에 주석을 달 수 있습니다. text() 함수로 원하는 위치에 텍스트를 배치합니다.\r
\r
    ax.text(x, y, '텍스트')로 지정한 좌표에 텍스트를 표시합니다. ha(horizontal alignment)와 va(vertical alignment)로 정렬을 설정합니다. bbox로 텍스트 배경 상자를 추가할 수 있습니다.\r
  tips:\r
  - ax.text(x, y, '텍스트')로 지정한 좌표에 텍스트를 표시합니다. ha(horizontal alignment)와 va(vertical alignment)로 정렬을 설정합니다.\r
    bbox로 텍스트 배경 상자를 추가할 수 있습니다.\r
  snippet: |-\r
    figText, axText = plt.subplots(figsize=(10, 7))\r
\r
    speciesText = ['setosa', 'versicolor', 'virginica']\r
    colorsText = ['#E74C3C', '#27AE60', '#3498DB']\r
    markersText = ['o', 's', '^']\r
  exercise:\r
    prompt: 7단계. 텍스트 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figText, axText = plt.subplots(figsize=(10, 7))\r
\r
      speciesText = ['setosa', 'versicolor', 'virginica']\r
      colorsText = ['#E74C3C', '#27AE60', '#3498DB']\r
      markersText = ['o', 's', '^']\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 텍스트 추가의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 텍스트 추가의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_petal\r
  title: 8단계. 꽃잎 특성 산점도\r
  structuredPrimary: true\r
  subtitle: 다른 변수 조합\r
  goal: 8단계. 꽃잎 특성 산점도에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 꽃받침(sepal) 대신 꽃잎(petal) 특성으로 산점도를 그려봅니다. 꽃잎 특성에서는 품종 간 구분이 더 명확하게 나타납니다. 특히 setosa는 꽃잎이\r
    작아서 다른 품종과 완전히 분리됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figPetal, axPetal = plt.subplots(figsize=(10, 7))\r
\r
    speciesPetal = ['setosa', 'versicolor', 'virginica']\r
    colorsPetal = ['#E74C3C', '#27AE60', '#3498DB']\r
    markersPetal = ['o', 's', '^']\r
  exercise:\r
    prompt: 8단계. 꽃잎 특성 산점도 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figPetal, axPetal = plt.subplots(figsize=(10, 7))\r
\r
      speciesPetal = ['setosa', 'versicolor', 'virginica']\r
      colorsPetal = ['#E74C3C', '#27AE60', '#3498DB']\r
      markersPetal = ['o', 's', '^']\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 꽃잎 특성 산점도의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 꽃잎 특성 산점도의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_subplot\r
  title: 9단계. 2개 산점도 비교\r
  structuredPrimary: true\r
  subtitle: subplots로 비교\r
  goal: 9단계. 2개 산점도 비교에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 꽃받침과 꽃잎 특성을 나란히 비교하면 어느 특성이 품종 구분에 더 유용한지 파악할 수 있습니다. 이전에 배운 subplots를 활용하여 두 차트를 한 Figure에\r
    배치합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figCompare, (axSepal, axPetalCompare) = plt.subplots(1, 2, figsize=(14, 6))\r
\r
    speciesCompare = ['setosa', 'versicolor', 'virginica']\r
    colorsCompare = ['#E74C3C', '#27AE60', '#3498DB']\r
  exercise:\r
    prompt: 9단계. 2개 산점도 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figCompare, (axSepal, axPetalCompare) = plt.subplots(1, 2, figsize=(14, 6))\r
\r
      speciesCompare = ['setosa', 'versicolor', 'virginica']\r
      colorsCompare = ['#E74C3C', '#27AE60', '#3498DB']\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 2개 산점도 비교의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 2개 산점도 비교의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_final\r
  title: 10단계. 최종 시각화\r
  structuredPrimary: true\r
  subtitle: 완성된 산점도\r
  goal: 10단계. 최종 시각화에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 요소를 종합하여 완성도 높은 품종 분류 산점도를 만듭니다. 그리드, 범례, 마커 스타일을 모두 적용하고 tight_layout으로 레이아웃을\r
    정리합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal, axFinal = plt.subplots(figsize=(11, 8))\r
\r
    speciesFinal = ['setosa', 'versicolor', 'virginica']\r
    colorsFinal = ['#E74C3C', '#27AE60', '#3498DB']\r
    markersFinal = ['o', 's', '^']\r
    labelsFinal = ['Setosa', 'Versicolor', 'Virginica']\r
  exercise:\r
    prompt: 10단계. 최종 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal, axFinal = plt.subplots(figsize=(11, 8))\r
\r
      speciesFinal = ['setosa', 'versicolor', 'virginica']\r
      colorsFinal = ['#E74C3C', '#27AE60', '#3498DB']\r
      markersFinal = ['o', 's', '^']\r
      labelsFinal = ['Setosa', 'Versicolor', 'Virginica']\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 최종 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 최종 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 붓꽃 데이터 분석 프로젝트\r
  goal: 실습에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 내용을 활용해서 붓꽃 데이터를 다양한 관점에서 분석해봅시다. scatter, marker, text, legend, subplots 등 모든 개념을 종합적으로 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    iris2 = loadLocalDataset('iris')\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      iris2 = loadLocalDataset('iris')\r
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
    content: 산점도로 붓꽃 품종별 특성을 분석했습니다.\r
  - type: list\r
    items:\r
    - ax.scatter(x, y) - 산점도로 두 변수 관계 시각화\r
    - c, color - 점의 색상 지정\r
    - marker - 점의 모양 지정 (o, s, ^, d 등)\r
    - s - 점의 크기 지정\r
    - ax.text(x, y, text) - 차트에 텍스트 추가\r
    - alpha - 투명도 설정\r
    - legend(title) - 범례에 제목 추가\r
  - type: text\r
    content: 다음 시간에는 막대 그래프로 대륙별 인구를 비교합니다.\r
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