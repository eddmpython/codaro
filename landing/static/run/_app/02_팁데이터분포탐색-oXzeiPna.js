var e=`meta:\r
  packages:\r
  - matplotlib\r
  - pandas\r
  - seaborn\r
  id: matplotlib_02\r
  title: 팁데이터분포탐색\r
  order: 2\r
  category: matplotlib\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - matplotlib\r
  - hist\r
  - boxplot\r
  - subplots\r
  - tips\r
  - 분포\r
  seo:\r
    title: Matplotlib 히스토그램과 박스플롯 - 팁 데이터 분포 분석\r
    description: Matplotlib으로 팁 데이터의 분포를 히스토그램과 박스플롯으로 시각화합니다. hist, boxplot, subplots 사용법을 배웁니다.\r
    keywords:\r
    - matplotlib\r
    - histogram\r
    - boxplot\r
    - 분포\r
    - tips\r
    - subplots\r
intro:\r
  emoji: 💵\r
  goal: 레스토랑 팁 데이터의 분포를 히스토그램과 박스플롯으로 분석합니다.\r
  description: 데이터 분포를 파악하는 두 가지 핵심 차트를 배웁니다. 히스토그램으로 전체 분포를, 박스플롯으로 요약 통계를 시각화합니다.\r
  direction: 팁데이터분포탐색에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.\r
  benefits:\r
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 팁데이터분포탐색 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 11단계. 한글 폰트 설정 처리 실행\r
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 2단계. 데이터 로드 결과 검증\r
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.\r
    - label: 팁데이터분포탐색 재사용\r
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 시각 리포트 환경\r
      detail: matplotlib, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 팁데이터분포탐색 실행\r
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.\r
    - label: 팁데이터분포탐색 완료\r
      detail: 검증된 코드를 보고서 차트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    Codaro 로컬 데이터셋인 tips를 사용합니다. tips 데이터는 레스토랑에서 수집한 팁 정보로, 총 결제금액, 팁, 요일, 시간대, 인원수 등이 포함되어 있습니다. 실제 서비스업 데이터 분석에 자주 사용되는 예제입니다.\r
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
  subtitle: loadLocalDataset()\r
  goal: 2단계. 데이터 로드에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    loadLocalDataset() 함수로 tips 데이터를 불러옵니다. 이 데이터셋은 레스토랑 결제 기록을 담고 있으며, 팁 예측 모델이나 고객 분석에 자주 사용됩니다. 인터넷 연결 없이 같은 실습 흐름을 재현할 수 있습니다.\r
\r
    loadLocalDataset('tips')처럼 Codaro가 함께 제공하는 로컬 예제 데이터를 불러옵니다. 'tips', 'iris', 'penguins', 'titanic' 등 다양한 데이터셋을 인터넷 연결 없이 바로 재현할 수 있습니다.\r
  tips:\r
  - loadLocalDataset('tips')처럼 Codaro가 함께 제공하는 로컬 예제 데이터를 불러옵니다. 'tips', 'iris', 'penguins', 'titanic'\r
    등 다양한 데이터셋을 인터넷 연결 없이 바로 재현할 수 있습니다.\r
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
- id: step3_explore\r
  title: 3단계. 데이터 탐색\r
  structuredPrimary: true\r
  subtitle: 기본 통계\r
  goal: 3단계. 데이터 탐색에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
  explanation: 시각화 전에 데이터의 기본 통계를 확인합니다. describe()로 수치형 컬럼의 평균, 표준편차, 최소/최대값 등을 파악할 수 있습니다. 팁의 평균은 약\r
    3달러, 총 결제금액의 평균은 약 20달러입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: tips.describe()\r
  exercise:\r
    prompt: 3단계. 데이터 탐색 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: tips.describe()\r
    hints:\r
    - 바꿀 지점은 시각화할 데이터을 만드는 첫 줄과 차트 구성 줄에서 찾으세요.\r
    - 실행 뒤 축/범례/파일 출력 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 데이터 탐색의 수정 코드가 차트 구성 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 3단계. 데이터 탐색 실행 결과가 축/범례/파일 출력 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step4_hist\r
  title: 4단계. 히스토그램 그리기\r
  structuredPrimary: true\r
  subtitle: ax.hist()\r
  goal: 4단계. 히스토그램 그리기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    히스토그램은 데이터의 분포를 보여주는 차트입니다. 값의 범위를 구간(bin)으로 나누고, 각 구간에 속하는 데이터 개수를 막대로 표시합니다. 팁 금액이 어디에 집중되어 있는지, 이상치가 있는지 파악할 수 있습니다.\r
\r
    ax.hist(데이터, bins=구간수)로 히스토그램을 그립니다. bins는 구간 개수로, 숫자가 클수록 세밀한 분포를 보여줍니다. 기본값은 10이며, 20~30 정도가 적당합니다. edgecolor로 막대 테두리 색상을 지정하면 구간 구분이 명확해집니다.\r
  tips:\r
  - ax.hist(데이터, bins=구간수)로 히스토그램을 그립니다. bins는 구간 개수로, 숫자가 클수록 세밀한 분포를 보여줍니다. 기본값은 10이며, 20~30 정도가 적당합니다.\r
    edgecolor로 막대 테두리 색상을 지정하면 구간 구분이 명확해집니다.\r
  snippet: |-\r
    figHist, axHist = plt.subplots(figsize=(10, 6))\r
    axHist.hist(tips['tip'], bins=20, color='steelblue', edgecolor='white')\r
    axHist.set_title('팁 금액 분포', fontsize=14)\r
    axHist.set_xlabel('팁 ($)', fontsize=12)\r
    axHist.set_ylabel('빈도', fontsize=12)\r
    figHist\r
  exercise:\r
    prompt: 4단계. 히스토그램 그리기 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHist, axHist = plt.subplots(figsize=(10, 6))\r
      axHist.hist(tips['tip'], bins=20, color='steelblue', edgecolor='white')\r
      axHist.set_title('팁 금액 분포', fontsize=14)\r
      axHist.set_xlabel('팁 ($)', fontsize=12)\r
      axHist.set_ylabel('빈도', fontsize=12)\r
      figHist\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 히스토그램 그리기의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 4단계. 히스토그램 그리기 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step5_hist_color\r
  title: 5단계. 히스토그램 색상 설정\r
  structuredPrimary: true\r
  subtitle: color, alpha\r
  goal: 5단계. 히스토그램 색상 설정에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 히스토그램의 색상과 투명도를 조정하면 더 보기 좋은 차트를 만들 수 있습니다. alpha로 투명도를 설정하면 여러 히스토그램을 겹쳐서 비교할 때 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figHist2, axHist2 = plt.subplots(figsize=(10, 6))\r
    axHist2.hist(tips['tip'], bins=25, color='#E74C3C', edgecolor='white', alpha=0.7)\r
    axHist2.set_title('팁 금액 분포', fontsize=14)\r
    axHist2.set_xlabel('팁 ($)', fontsize=12)\r
    axHist2.set_ylabel('빈도', fontsize=12)\r
    axHist2.grid(True, alpha=0.3, axis='y')\r
    figHist2\r
  exercise:\r
    prompt: 5단계. 히스토그램 색상 설정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHist2, axHist2 = plt.subplots(figsize=(10, 6))\r
      axHist2.hist(tips['tip'], bins=25, color='#E74C3C', edgecolor='white', alpha=0.7)\r
      axHist2.set_title('팁 금액 분포', fontsize=14)\r
      axHist2.set_xlabel('팁 ($)', fontsize=12)\r
      axHist2.set_ylabel('빈도', fontsize=12)\r
      axHist2.grid(True, alpha=0.3, axis='y')\r
      figHist2\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 히스토그램 색상 설정의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 5단계. 히스토그램 색상 설정 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step6_boxplot\r
  title: 6단계. 박스플롯 그리기\r
  structuredPrimary: true\r
  subtitle: ax.boxplot()\r
  goal: 6단계. 박스플롯 그리기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    박스플롯(상자 그림)은 데이터의 요약 통계를 시각화합니다. 중앙값, 사분위수, 이상치를 한눈에 파악할 수 있습니다. 상자의 중앙선은 중앙값, 상자의 상하단은 1사분위수(25%)와 3사분위수(75%), 수염은 최소/최대값(이상치 제외), 점은 이상치를 나타냅니다.\r
\r
    ax.boxplot(데이터)로 박스플롯을 그립니다. vert=True는 수직(기본값), vert=False는 수평입니다. 박스 안의 선은 중앙값, 박스 범위는 IQR(사분위범위), 수염은 1.5*IQR 이내, 그 밖의 점은 이상치입니다.\r
  tips:\r
  - ax.boxplot(데이터)로 박스플롯을 그립니다. vert=True는 수직(기본값), vert=False는 수평입니다. 박스 안의 선은 중앙값, 박스 범위는 IQR(사분위범위),\r
    수염은 1.5*IQR 이내, 그 밖의 점은 이상치입니다.\r
  snippet: |-\r
    figBox, axBox = plt.subplots(figsize=(8, 6))\r
    axBox.boxplot(tips['tip'], vert=True)\r
    axBox.set_title('팁 금액 분포 (박스플롯)', fontsize=14)\r
    axBox.set_ylabel('팁 ($)', fontsize=12)\r
    axBox.grid(True, alpha=0.3, axis='y')\r
    figBox\r
  exercise:\r
    prompt: 6단계. 박스플롯 그리기 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBox, axBox = plt.subplots(figsize=(8, 6))\r
      axBox.boxplot(tips['tip'], vert=True)\r
      axBox.set_title('팁 금액 분포 (박스플롯)', fontsize=14)\r
      axBox.set_ylabel('팁 ($)', fontsize=12)\r
      axBox.grid(True, alpha=0.3, axis='y')\r
      figBox\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 박스플롯 그리기의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 6단계. 박스플롯 그리기 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step7_subplots\r
  title: 7단계. 서브플롯으로 비교\r
  structuredPrimary: true\r
  subtitle: plt.subplots(nrows, ncols)\r
  goal: 7단계. 서브플롯으로 비교에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    서브플롯을 사용하면 여러 차트를 한 Figure에 배치할 수 있습니다. 히스토그램과 박스플롯을 나란히 배치하여 같은 데이터를 다른 관점에서 비교할 수 있습니다. nrows와 ncols로 행과 열 개수를 지정합니다.\r
\r
    plt.subplots(행, 열)로 여러 Axes를 생성합니다. 반환값은 (fig, axes)이며, axes는 배열입니다. 1x2면 axes[0], axes[1]로, 2x2면 axes[0,0], axes[0,1] 등으로 접근합니다. 튜플 언패킹으로 (ax1, ax2)처럼 받을 수도 있습니다.\r
  tips:\r
  - plt.subplots(행, 열)로 여러 Axes를 생성합니다. 반환값은 (fig, axes)이며, axes는 배열입니다. 1x2면 axes[0], axes[1]로, 2x2면\r
    axes[0,0], axes[0,1] 등으로 접근합니다. 튜플 언패킹으로 (ax1, ax2)처럼 받을 수도 있습니다.\r
  snippet: |-\r
    figSub, (axSub1, axSub2) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
    axSub1.hist(tips['tip'], bins=20, color='steelblue', edgecolor='white')\r
    axSub1.set_title('팁 분포 (히스토그램)', fontsize=12)\r
    axSub1.set_xlabel('팁 ($)')\r
    axSub1.set_ylabel('빈도')\r
    figSub\r
  exercise:\r
    prompt: 7단계. 서브플롯으로 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figSub, (axSub1, axSub2) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
      axSub1.hist(tips['tip'], bins=20, color='steelblue', edgecolor='white')\r
      axSub1.set_title('팁 분포 (히스토그램)', fontsize=12)\r
      axSub1.set_xlabel('팁 ($)')\r
      axSub1.set_ylabel('빈도')\r
      figSub\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 서브플롯으로 비교의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 7단계. 서브플롯으로 비교 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step8_bill_hist\r
  title: 8단계. 총 결제금액 분포\r
  structuredPrimary: true\r
  subtitle: 다른 변수 분석\r
  goal: 8단계. 총 결제금액 분포에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 팁뿐만 아니라 총 결제금액(total_bill)의 분포도 분석해봅니다. 결제금액의 분포를 알면 레스토랑의 가격대나 고객 특성을 파악할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figBill, axBill = plt.subplots(figsize=(10, 6))\r
    axBill.hist(tips['total_bill'], bins=25, color='#27AE60', edgecolor='white', alpha=0.8)\r
    axBill.set_title('총 결제금액 분포', fontsize=14)\r
    axBill.set_xlabel('결제금액 ($)', fontsize=12)\r
    axBill.set_ylabel('빈도', fontsize=12)\r
    axBill.grid(True, alpha=0.3, axis='y')\r
    figBill\r
  exercise:\r
    prompt: 8단계. 총 결제금액 분포 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBill, axBill = plt.subplots(figsize=(10, 6))\r
      axBill.hist(tips['total_bill'], bins=25, color='#27AE60', edgecolor='white', alpha=0.8)\r
      axBill.set_title('총 결제금액 분포', fontsize=14)\r
      axBill.set_xlabel('결제금액 ($)', fontsize=12)\r
      axBill.set_ylabel('빈도', fontsize=12)\r
      axBill.grid(True, alpha=0.3, axis='y')\r
      figBill\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 총 결제금액 분포의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 8단계. 총 결제금액 분포 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step9_xlim\r
  title: 9단계. 축 범위 설정\r
  structuredPrimary: true\r
  subtitle: set_xlim(), set_ylim()\r
  goal: 9단계. 축 범위 설정에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    때로는 특정 범위에 집중하여 분석하고 싶을 때가 있습니다. set_xlim()과 set_ylim()으로 축의 표시 범위를 직접 설정할 수 있습니다. 이상치를 제외하고 주요 분포만 자세히 보고 싶을 때 유용합니다.\r
\r
    ax.set_xlim(최소, 최대)로 x축 범위를, ax.set_ylim(최소, 최대)로 y축 범위를 설정합니다. 범위 밖의 데이터는 표시되지 않습니다. None을 사용하면 해당 방향은 자동으로 설정됩니다.\r
  tips:\r
  - ax.set_xlim(최소, 최대)로 x축 범위를, ax.set_ylim(최소, 최대)로 y축 범위를 설정합니다. 범위 밖의 데이터는 표시되지 않습니다. None을 사용하면 해당\r
    방향은 자동으로 설정됩니다.\r
  snippet: |-\r
    figLim, axLim = plt.subplots(figsize=(10, 6))\r
    axLim.hist(tips['total_bill'], bins=30, color='#3498DB', edgecolor='white')\r
    axLim.set_title('총 결제금액 분포 (0~40$ 범위)', fontsize=14)\r
    axLim.set_xlabel('결제금액 ($)', fontsize=12)\r
    axLim.set_ylabel('빈도', fontsize=12)\r
    axLim.set_xlim(0, 40)\r
    axLim.grid(True, alpha=0.3)\r
    figLim\r
  exercise:\r
    prompt: 9단계. 축 범위 설정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figLim, axLim = plt.subplots(figsize=(10, 6))\r
      axLim.hist(tips['total_bill'], bins=30, color='#3498DB', edgecolor='white')\r
      axLim.set_title('총 결제금액 분포 (0~40$ 범위)', fontsize=14)\r
      axLim.set_xlabel('결제금액 ($)', fontsize=12)\r
      axLim.set_ylabel('빈도', fontsize=12)\r
      axLim.set_xlim(0, 40)\r
      axLim.grid(True, alpha=0.3)\r
      figLim\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 축 범위 설정의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 9단계. 축 범위 설정 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step10_final\r
  title: 10단계. 최종 비교 시각화\r
  structuredPrimary: true\r
  subtitle: 2x2 서브플롯\r
  goal: 10단계. 최종 비교 시각화에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 팁과 결제금액의 히스토그램, 박스플롯을 2x2 격자로 배치하여 종합적인 분포 분석 차트를 만듭니다. 이런 멀티 패널 차트는 데이터 탐색 초기 단계에서 전체적인\r
    분포를 파악하는 데 매우 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal, axes = plt.subplots(2, 2, figsize=(12, 10))\r
\r
    axes[0, 0].hist(tips['tip'], bins=20, color='#E74C3C', edgecolor='white')\r
    axes[0, 0].set_title('팁 분포', fontsize=12)\r
    axes[0, 0].set_xlabel('팁 ($)')\r
    axes[0, 0].set_ylabel('빈도')\r
\r
    axes[0, 1].boxplot(tips['tip'])\r
    axes[0, 1].set_title('팁 박스플롯', fontsize=12)\r
    axes[0, 1].set_ylabel('팁 ($)')\r
    figFinal\r
  exercise:\r
    prompt: 10단계. 최종 비교 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal, axes = plt.subplots(2, 2, figsize=(12, 10))\r
\r
      axes[0, 0].hist(tips['tip'], bins=20, color='#E74C3C', edgecolor='white')\r
      axes[0, 0].set_title('팁 분포', fontsize=12)\r
      axes[0, 0].set_xlabel('팁 ($)')\r
      axes[0, 0].set_ylabel('빈도')\r
\r
      axes[0, 1].boxplot(tips['tip'])\r
      axes[0, 1].set_title('팁 박스플롯', fontsize=12)\r
      axes[0, 1].set_ylabel('팁 ($)')\r
      figFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 최종 비교 시각화의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 10단계. 최종 비교 시각화 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 팁 데이터 분포 분석 프로젝트\r
  goal: 실습에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 내용을 활용해서 팁 데이터를 다양한 관점에서 분석해봅시다. hist, boxplot, subplots, xlim/ylim, color 등 모든 개념을 종합적으로 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    tips2 = loadLocalDataset('tips')\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      tips2 = loadLocalDataset('tips')\r
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
    content: 히스토그램과 박스플롯으로 데이터 분포를 분석했습니다.\r
  - type: list\r
    items:\r
    - ax.hist(data, bins) - 히스토그램으로 분포 시각화\r
    - ax.boxplot(data) - 박스플롯으로 요약 통계 시각화\r
    - plt.subplots(rows, cols) - 여러 차트를 한 Figure에 배치\r
    - color, alpha, edgecolor - 색상과 투명도 설정\r
    - set_xlim(), set_ylim() - 축 범위 설정\r
    - plt.suptitle() - 전체 Figure의 제목\r
  - type: text\r
    content: 다음 시간에는 붓꽃 데이터로 산점도와 마커 스타일을 배웁니다.\r
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