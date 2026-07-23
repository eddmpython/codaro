var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  id: matplotlib_01\r
  title: 주가추세분석\r
  order: 1\r
  category: matplotlib\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - matplotlib\r
  - plot\r
  - figure\r
  - legend\r
  - grid\r
  - 주가\r
  seo:\r
    title: Matplotlib 선 그래프 - 일별 주가 변동 시각화\r
    description: Matplotlib으로 주가 추세를 선 그래프로 시각화합니다. plot, figure, title, legend, grid 사용법을 배웁니다.\r
    keywords:\r
    - matplotlib\r
    - plt.plot\r
    - 선그래프\r
    - 주가\r
    - 시계열\r
intro:\r
  emoji: 📈\r
  goal: 일별 주가 변동을 선 그래프로 시각화합니다.\r
  description: Matplotlib의 기본 워크플로우를 익힙니다. 데이터 생성 → Figure 생성 → 차트 그리기 → 스타일링의 흐름을 배웁니다.\r
  direction: 주가추세분석에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.\r
  benefits:\r
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 주가추세분석 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 11단계. 한글 폰트 설정 처리 실행\r
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 2단계. 주가 데이터 생성 결과 검증\r
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.\r
    - label: 주가추세분석 재사용\r
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 시각 리포트 환경\r
      detail: matplotlib, numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 주가추세분석 실행\r
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.\r
    - label: 주가추세분석 완료\r
      detail: 검증된 코드를 보고서 차트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    Matplotlib은 파이썬에서 가장 오래되고 널리 사용되는 시각화 라이브러리입니다. pyplot 모듈은 MATLAB 스타일의 인터페이스를 제공하여 간단한 명령으로 차트를 만들 수 있습니다. numpy는 수치 계산을 위한 라이브러리로, 주가 데이터를 생성하는 데 사용합니다. pandas는 데이터프레임을 다루기 위해 함께 불러옵니다. 이 세 라이브러리는 데이터 분석의 기본 조합으로, 대부분의 프로젝트에서 함께 사용됩니다. ⚠️ 처음 실행 시 "Matplotlib is building the font cache"라는 메시지가 나올 수 있습니다. 폰트 캐시를 만드는 정상 동작이며, 한 번만 발생하니 당황하지 마세요!\r
\r
    import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. plt.plot(), plt.figure()처럼 간결하게 사용할 수 있습니다. numpy는 np, pandas는 pd로 줄여 쓰는 것이 데이터 과학 커뮤니티의 표준입니다.\r
  tips:\r
  - import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. plt.plot(), plt.figure()처럼\r
    간결하게 사용할 수 있습니다. numpy는 np, pandas는 pd로 줄여 쓰는 것이 데이터 과학 커뮤니티의 표준입니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import numpy as np\r
    import pandas as pd\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      import numpy as np\r
      import pandas as pd\r
    hints:\r
    - 바꿀 지점은 시각화할 데이터을 만드는 첫 줄과 차트 구성 줄에서 찾으세요.\r
    - 실행 뒤 축/범례/파일 출력 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
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
  title: 2단계. 주가 데이터 생성\r
  structuredPrimary: true\r
  subtitle: 시뮬레이션 데이터\r
  goal: 2단계. 주가 데이터 생성에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    실제 주식 API를 사용하지 않고, 학습 목적으로 가상의 주가 데이터를 생성합니다. 랜덤 워크(Random Walk)는 주가 변동을 시뮬레이션하는 대표적인 방법입니다. 누적합(cumsum)을 사용하면 매일 랜덤한 변화가 누적되어 실제 주가처럼 움직이는 시계열을 만들 수 있습니다. 시드(seed)를 고정하면 매번 같은 결과가 나와서 학습에 유리합니다.\r
\r
    np.random.seed(42)는 난수 생성기의 시드를 고정하여 매번 같은 난수가 생성되도록 합니다. 42는 관례적으로 많이 사용하는 숫자입니다. cumsum()은 누적합을 계산하는 함수로, [1, 2, 3]이면 [1, 3, 6]을 반환합니다.\r
  tips:\r
  - np.random.seed(42)는 난수 생성기의 시드를 고정하여 매번 같은 난수가 생성되도록 합니다. 42는 관례적으로 많이 사용하는 숫자입니다. cumsum()은 누적합을\r
    계산하는 함수로, [1, 2, 3]이면 [1, 3, 6]을 반환합니다.\r
  snippet: |-\r
    np.random.seed(42)\r
    days = 60\r
    dateRange = pd.date_range('2024-01-01', periods=days, freq='D')\r
    priceA = 100 + np.random.randn(days).cumsum()\r
    priceB = 120 + np.random.randn(days).cumsum() * 1.2\r
    priceC = 80 + np.random.randn(days).cumsum() * 0.8\r
  exercise:\r
    prompt: 2단계. 주가 데이터 생성 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      np.random.seed(42)\r
      days = 60\r
      dateRange = pd.date_range('2024-01-01', periods=days, freq='D')\r
      priceA = 100 + np.random.randn(days).cumsum()\r
      priceB = 120 + np.random.randn(days).cumsum() * 1.2\r
      priceC = 80 + np.random.randn(days).cumsum() * 0.8\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 주가 데이터 생성의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 주가 데이터 생성의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_dataframe\r
  title: 3단계. DataFrame 생성\r
  structuredPrimary: true\r
  subtitle: 데이터 정리\r
  goal: 3단계. DataFrame 생성에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 생성한 주가 데이터를 pandas DataFrame으로 정리합니다. 날짜를 인덱스로 설정하면 시계열 분석에 편리합니다. 세 종목(A사, B사, C사)의 주가를\r
    각 컬럼에 저장합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    stockData = pd.DataFrame({\r
        'A사': priceA,\r
        'B사': priceB,\r
        'C사': priceC\r
    }, index=dateRange)\r
    stockData.head()\r
  exercise:\r
    prompt: 3단계. DataFrame 생성 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      stockData = pd.DataFrame({\r
          'A사': priceA,\r
          'B사': priceB,\r
          'C사': priceC\r
      }, index=dateRange)\r
      stockData.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. DataFrame 생성의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 3단계. DataFrame 생성의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step4_figure\r
  title: 4단계. Figure 생성\r
  structuredPrimary: true\r
  subtitle: plt.figure()\r
  goal: 4단계. Figure 생성에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    Matplotlib에서 Figure는 전체 그림판입니다. figsize로 크기를 지정할 수 있으며, 단위는 인치입니다. (10, 6)은 가로 10인치, 세로 6인치를 의미합니다. Figure를 먼저 생성하고 그 위에 차트를 그리는 것이 Matplotlib의 기본 워크플로우입니다. ⚠️ 주의 : 아무것도 없는 그림판입니다. 당황하지 마세요!\r
\r
    plt.figure(figsize=(가로, 세로))로 Figure의 크기를 설정합니다. 기본값은 (6.4, 4.8)입니다. 프레젠테이션용은 (12, 8), 논문용은 (8, 6) 정도가 적당합니다. dpi 파라미터로 해상도도 설정할 수 있습니다.\r
  tips:\r
  - plt.figure(figsize=(가로, 세로))로 Figure의 크기를 설정합니다. 기본값은 (6.4, 4.8)입니다. 프레젠테이션용은 (12, 8), 논문용은 (8, 6)\r
    정도가 적당합니다. dpi 파라미터로 해상도도 설정할 수 있습니다.\r
  snippet: |-\r
    fig = plt.figure(figsize=(10, 6))\r
    fig\r
  exercise:\r
    prompt: 4단계. Figure 생성 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fig = plt.figure(figsize=(10, 6))\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. Figure 생성의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. Figure 생성의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_plot\r
  title: 5단계. 선 그래프 그리기\r
  structuredPrimary: true\r
  subtitle: plt.plot()\r
  goal: 5단계. 선 그래프 그리기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    plt.plot()은 가장 기본적인 선 그래프 함수입니다. x축에 날짜, y축에 주가를 배치합니다. label 파라미터를 지정하면 나중에 범례에 표시됩니다. 여러 선을 그릴 때는 plt.plot()을 여러 번 호출하면 됩니다. 각 선은 자동으로 다른 색상이 지정됩니다.\r
\r
    plt.subplots()는 Figure와 Axes를 동시에 생성합니다. fig는 전체 그림판, ax는 실제 차트가 그려지는 영역입니다. ax.plot(x, y, label='이름')으로 선을 추가합니다. label은 범례에 표시될 이름입니다.\r
  tips:\r
  - plt.subplots()는 Figure와 Axes를 동시에 생성합니다. fig는 전체 그림판, ax는 실제 차트가 그려지는 영역입니다. ax.plot(x, y, label='이름')으로\r
    선을 추가합니다. label은 범례에 표시될 이름입니다.\r
  snippet: |-\r
    fig1, ax1 = plt.subplots(figsize=(10, 6))\r
    ax1.plot(stockData.index, stockData['A사'], label='A사')\r
    ax1.plot(stockData.index, stockData['B사'], label='B사')\r
    ax1.plot(stockData.index, stockData['C사'], label='C사')\r
    fig1\r
  exercise:\r
    prompt: 5단계. 선 그래프 그리기 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fig1, ax1 = plt.subplots(figsize=(10, 6))\r
      ax1.plot(stockData.index, stockData['A사'], label='A사')\r
      ax1.plot(stockData.index, stockData['B사'], label='B사')\r
      ax1.plot(stockData.index, stockData['C사'], label='C사')\r
      fig1\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 선 그래프 그리기의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 5단계. 선 그래프 그리기 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step6_title\r
  title: 6단계. 제목과 축 라벨 추가\r
  structuredPrimary: true\r
  subtitle: set_title(), set_xlabel(), set_ylabel()\r
  goal: 6단계. 제목과 축 라벨 추가에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    차트에 제목과 축 라벨을 추가하면 무엇을 보여주는지 명확해집니다. set_title()은 차트 제목, set_xlabel()은 x축 라벨, set_ylabel()은 y축 라벨을 설정합니다. fontsize로 글꼴 크기를 조정할 수 있습니다.\r
\r
    set_title(), set_xlabel(), set_ylabel()은 Axes 객체의 메서드입니다. fontsize로 글꼴 크기를, fontweight='bold'로 굵기를 설정할 수 있습니다. pad 파라미터로 제목과 차트 사이의 간격을 조정할 수 있습니다.\r
  tips:\r
  - set_title(), set_xlabel(), set_ylabel()은 Axes 객체의 메서드입니다. fontsize로 글꼴 크기를, fontweight='bold'로 굵기를\r
    설정할 수 있습니다. pad 파라미터로 제목과 차트 사이의 간격을 조정할 수 있습니다.\r
  snippet: |-\r
    fig2, ax2 = plt.subplots(figsize=(10, 6))\r
    ax2.plot(stockData.index, stockData['A사'], label='A사')\r
    ax2.plot(stockData.index, stockData['B사'], label='B사')\r
    ax2.plot(stockData.index, stockData['C사'], label='C사')\r
    ax2.set_title('2024년 1분기 주가 추세', fontsize=14)\r
    ax2.set_xlabel('날짜', fontsize=12)\r
    ax2.set_ylabel('주가 (원)', fontsize=12)\r
    fig2\r
  exercise:\r
    prompt: 6단계. 제목과 축 라벨 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fig2, ax2 = plt.subplots(figsize=(10, 6))\r
      ax2.plot(stockData.index, stockData['A사'], label='A사')\r
      ax2.plot(stockData.index, stockData['B사'], label='B사')\r
      ax2.plot(stockData.index, stockData['C사'], label='C사')\r
      ax2.set_title('2024년 1분기 주가 추세', fontsize=14)\r
      ax2.set_xlabel('날짜', fontsize=12)\r
      ax2.set_ylabel('주가 (원)', fontsize=12)\r
      fig2\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 제목과 축 라벨 추가의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 6단계. 제목과 축 라벨 추가 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step7_legend\r
  title: 7단계. 범례 추가\r
  structuredPrimary: true\r
  subtitle: legend()\r
  goal: 7단계. 범례 추가에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    여러 선이 있을 때 범례(legend)는 각 선이 무엇을 나타내는지 설명합니다. legend() 메서드를 호출하면 label로 지정한 이름이 범례에 표시됩니다. loc 파라미터로 범례 위치를 지정할 수 있습니다.\r
\r
    legend(loc='위치')로 범례 위치를 지정합니다. 'upper right', 'upper left', 'lower right', 'lower left', 'center', 'best' 등을 사용할 수 있습니다. 'best'는 데이터와 겹치지 않는 최적 위치를 자동으로 찾습니다.\r
  tips:\r
  - legend(loc='위치')로 범례 위치를 지정합니다. 'upper right', 'upper left', 'lower right', 'lower left', 'center',\r
    'best' 등을 사용할 수 있습니다. 'best'는 데이터와 겹치지 않는 최적 위치를 자동으로 찾습니다.\r
  snippet: |-\r
    fig3, ax3 = plt.subplots(figsize=(10, 6))\r
    ax3.plot(stockData.index, stockData['A사'], label='A사')\r
    ax3.plot(stockData.index, stockData['B사'], label='B사')\r
    ax3.plot(stockData.index, stockData['C사'], label='C사')\r
    ax3.set_title('2024년 1분기 주가 추세', fontsize=14)\r
    ax3.set_xlabel('날짜', fontsize=12)\r
    ax3.set_ylabel('주가 (원)', fontsize=12)\r
    ax3.legend(loc='upper right')\r
    fig3\r
  exercise:\r
    prompt: 7단계. 범례 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fig3, ax3 = plt.subplots(figsize=(10, 6))\r
      ax3.plot(stockData.index, stockData['A사'], label='A사')\r
      ax3.plot(stockData.index, stockData['B사'], label='B사')\r
      ax3.plot(stockData.index, stockData['C사'], label='C사')\r
      ax3.set_title('2024년 1분기 주가 추세', fontsize=14)\r
      ax3.set_xlabel('날짜', fontsize=12)\r
      ax3.set_ylabel('주가 (원)', fontsize=12)\r
      ax3.legend(loc='upper right')\r
      fig3\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 범례 추가의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 7단계. 범례 추가 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step8_linestyle\r
  title: 8단계. 선 스타일 변경\r
  structuredPrimary: true\r
  subtitle: linestyle, linewidth\r
  goal: 8단계. 선 스타일 변경에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    선의 스타일과 굵기를 변경하면 더 풍부한 시각적 표현이 가능합니다. linestyle(또는 ls)로 실선, 점선, 파선 등을 지정하고, linewidth(또는 lw)로 선의 굵기를 조정합니다. 색상은 color 파라미터로 직접 지정할 수도 있습니다.\r
\r
    linestyle 옵션: '-'(실선), '--'(파선), '-.'(점파선), ':'(점선). linewidth는 선의 굵기로, 기본값은 1.5입니다. color로 색상을 직접 지정할 수 있으며, 'red', 'blue', '#FF5733', 'C0'(기본 색상 순서) 등을 사용합니다.\r
  tips:\r
  - 'linestyle 옵션: ''-''(실선), ''--''(파선), ''-.''(점파선), '':''(점선). linewidth는 선의 굵기로, 기본값은 1.5입니다. color로\r
    색상을 직접 지정할 수 있으며, ''red'', ''blue'', ''#FF5733'', ''C0''(기본 색상 순서) 등을 사용합니다.'\r
  snippet: |-\r
    fig4, ax4 = plt.subplots(figsize=(10, 6))\r
    ax4.plot(stockData.index, stockData['A사'], label='A사', linestyle='-', linewidth=2)\r
    ax4.plot(stockData.index, stockData['B사'], label='B사', linestyle='--', linewidth=2)\r
    ax4.plot(stockData.index, stockData['C사'], label='C사', linestyle='-.', linewidth=2)\r
    ax4.set_title('2024년 1분기 주가 추세', fontsize=14)\r
    ax4.set_xlabel('날짜', fontsize=12)\r
    ax4.set_ylabel('주가 (원)', fontsize=12)\r
    ax4.legend(loc='upper right')\r
    fig4\r
  exercise:\r
    prompt: 8단계. 선 스타일 변경 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fig4, ax4 = plt.subplots(figsize=(10, 6))\r
      ax4.plot(stockData.index, stockData['A사'], label='A사', linestyle='-', linewidth=2)\r
      ax4.plot(stockData.index, stockData['B사'], label='B사', linestyle='--', linewidth=2)\r
      ax4.plot(stockData.index, stockData['C사'], label='C사', linestyle='-.', linewidth=2)\r
      ax4.set_title('2024년 1분기 주가 추세', fontsize=14)\r
      ax4.set_xlabel('날짜', fontsize=12)\r
      ax4.set_ylabel('주가 (원)', fontsize=12)\r
      ax4.legend(loc='upper right')\r
      fig4\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 선 스타일 변경의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 8단계. 선 스타일 변경 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step9_grid\r
  title: 9단계. 그리드 추가\r
  structuredPrimary: true\r
  subtitle: grid()\r
  goal: 9단계. 그리드 추가에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    그리드(격자선)를 추가하면 데이터 값을 더 정확하게 읽을 수 있습니다. 특히 주가처럼 정확한 수치가 중요한 차트에서 유용합니다. alpha로 투명도를 조절하면 그리드가 데이터를 방해하지 않습니다.\r
\r
    grid(True)로 그리드를 표시합니다. alpha는 투명도로 0(완전투명)~1(불투명) 사이 값입니다. linestyle, color로 그리드 스타일을 변경할 수 있습니다. axis='x' 또는 'y'로 한 방향만 표시할 수도 있습니다.\r
  tips:\r
  - grid(True)로 그리드를 표시합니다. alpha는 투명도로 0(완전투명)~1(불투명) 사이 값입니다. linestyle, color로 그리드 스타일을 변경할 수 있습니다.\r
    axis='x' 또는 'y'로 한 방향만 표시할 수도 있습니다.\r
  snippet: |-\r
    fig5, ax5 = plt.subplots(figsize=(10, 6))\r
    ax5.plot(stockData.index, stockData['A사'], label='A사', linestyle='-', linewidth=2)\r
    ax5.plot(stockData.index, stockData['B사'], label='B사', linestyle='--', linewidth=2)\r
    ax5.plot(stockData.index, stockData['C사'], label='C사', linestyle='-.', linewidth=2)\r
    ax5.set_title('2024년 1분기 주가 추세', fontsize=14)\r
    ax5.set_xlabel('날짜', fontsize=12)\r
    ax5.set_ylabel('주가 (원)', fontsize=12)\r
    ax5.legend(loc='upper right')\r
    ax5.grid(True, alpha=0.3)\r
    fig5\r
  exercise:\r
    prompt: 9단계. 그리드 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fig5, ax5 = plt.subplots(figsize=(10, 6))\r
      ax5.plot(stockData.index, stockData['A사'], label='A사', linestyle='-', linewidth=2)\r
      ax5.plot(stockData.index, stockData['B사'], label='B사', linestyle='--', linewidth=2)\r
      ax5.plot(stockData.index, stockData['C사'], label='C사', linestyle='-.', linewidth=2)\r
      ax5.set_title('2024년 1분기 주가 추세', fontsize=14)\r
      ax5.set_xlabel('날짜', fontsize=12)\r
      ax5.set_ylabel('주가 (원)', fontsize=12)\r
      ax5.legend(loc='upper right')\r
      ax5.grid(True, alpha=0.3)\r
      fig5\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 그리드 추가의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 9단계. 그리드 추가 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step10_final\r
  title: 10단계. 최종 시각화\r
  structuredPrimary: true\r
  subtitle: 완성된 차트\r
  goal: 10단계. 최종 시각화에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 요소를 조합하여 완성도 높은 주가 추세 차트를 만듭니다. tight_layout()을 호출하면 요소들이 겹치지 않도록 자동으로 간격을 조정합니다.\r
    이제 논문이나 보고서에 바로 사용할 수 있는 품질의 차트가 완성되었습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal, axFinal = plt.subplots(figsize=(10, 6))\r
    axFinal.plot(stockData.index, stockData['A사'], label='A사', linestyle='-', linewidth=2, color='#2E86AB')\r
    axFinal.plot(stockData.index, stockData['B사'], label='B사', linestyle='--', linewidth=2, color='#A23B72')\r
    axFinal.plot(stockData.index, stockData['C사'], label='C사', linestyle='-.', linewidth=2, color='#F18F01')\r
    figFinal\r
  exercise:\r
    prompt: 10단계. 최종 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal, axFinal = plt.subplots(figsize=(10, 6))\r
      axFinal.plot(stockData.index, stockData['A사'], label='A사', linestyle='-', linewidth=2, color='#2E86AB')\r
      axFinal.plot(stockData.index, stockData['B사'], label='B사', linestyle='--', linewidth=2, color='#A23B72')\r
      axFinal.plot(stockData.index, stockData['C사'], label='C사', linestyle='-.', linewidth=2, color='#F18F01')\r
      figFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 최종 시각화의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 10단계. 최종 시각화 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 주가 데이터 분석 프로젝트\r
  goal: 실습에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 내용을 활용해서 주가 데이터를 다양한 방식으로 시각화해봅시다. plot, figure, title, legend, grid, linestyle 등 모든 개념을 종합적으로 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import numpy as np\r
    import pandas as pd\r
\r
    np.random.seed(42)\r
    period = 90\r
    dates = pd.date_range('2024-01-01', periods=period, freq='D')\r
    price = 150 + np.random.randn(period).cumsum() * 1.5\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      import numpy as np\r
      import pandas as pd\r
\r
      np.random.seed(42)\r
      period = 90\r
      dates = pd.date_range('2024-01-01', periods=period, freq='D')\r
      price = 150 + np.random.randn(period).cumsum() * 1.5\r
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
    content: Matplotlib으로 첫 번째 선 그래프를 완성했습니다.\r
  - type: list\r
    items:\r
    - import matplotlib.pyplot as plt - Matplotlib 불러오기\r
    - plt.subplots(figsize=(w, h)) - Figure와 Axes 생성\r
    - ax.plot(x, y, label) - 선 그래프 그리기\r
    - ax.set_title(), set_xlabel(), set_ylabel() - 제목과 라벨\r
    - ax.legend(loc) - 범례 추가\r
    - linestyle, linewidth - 선 스타일\r
    - ax.grid(True, alpha) - 그리드 추가\r
  - type: text\r
    content: 다음 시간에는 팁 데이터로 히스토그램과 박스플롯을 배웁니다.\r
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