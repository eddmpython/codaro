var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  id: matplotlib_09\r
  title: 고급주석차트\r
  order: 9\r
  category: matplotlib\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - matplotlib\r
  - annotate\r
  - LaTeX\r
  - bbox\r
  - errorbar\r
  - annotation\r
  seo:\r
    title: Matplotlib 고급 주석 - annotate, LaTeX, errorbar로 전문 차트 만들기\r
    description: Matplotlib으로 전문적인 주석 차트를 만듭니다. annotate 화살표, LaTeX 수식, bbox 텍스트박스, errorbar 오차막대 사용법을\r
      배웁니다.\r
    keywords:\r
    - matplotlib\r
    - annotate\r
    - LaTeX\r
    - bbox\r
    - errorbar\r
    - 주석\r
    - 수식\r
intro:\r
  emoji: 📝\r
  goal: 주요 이벤트가 표시된 주가 차트를 만듭니다.\r
  description: annotate로 화살표와 주석을 추가하고, LaTeX로 수학 표현식을 넣으며, bbox로 텍스트 박스를 꾸밉니다. errorbar로 불확실성을 표현하는 방법도\r
    배웁니다. 이전에 배운 plot, figure, legend, spines 개념을 활용합니다.\r
  direction: 고급주석차트에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.\r
  benefits:\r
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 고급주석차트 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 11단계. 한글 폰트 설정 처리 실행\r
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 2단계. 주가 데이터 생성 결과 검증\r
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.\r
    - label: 고급주석차트 재사용\r
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 시각 리포트 환경\r
      detail: matplotlib, numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 고급주석차트 실행\r
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.\r
    - label: 고급주석차트 완료\r
      detail: 검증된 코드를 보고서 차트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    주가 데이터를 생성하고 주요 이벤트를 표시하는 고급 차트를 만듭니다. annotate로 화살표와 설명을 추가하고, LaTeX로 수식을 표현하며, bbox로 텍스트를 강조합니다.\r
\r
    import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. numpy는 np로, pandas는 pd로 줄여 쓰는 것이 데이터 과학 커뮤니티의 표준입니다.\r
  tips:\r
  - import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. numpy는 np로, pandas는\r
    pd로 줄여 쓰는 것이 데이터 과학 커뮤니티의 표준입니다.\r
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
  explanation: 1년간의 가상 주가 데이터를 생성합니다. 랜덤 워크 방식으로 현실적인 주가 변동을 시뮬레이션합니다. 주요 이벤트 날짜도 정의합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    np.random.seed(42)\r
\r
    days = pd.date_range('2024-01-01', periods=252, freq='B')\r
    returns = np.random.normal(0.001, 0.02, 252)\r
    price = 100 * np.cumprod(1 + returns)\r
\r
    stockData = pd.DataFrame({\r
        'date': days,\r
        'price': price\r
    })\r
\r
    stockData.head()\r
  exercise:\r
    prompt: 2단계. 주가 데이터 생성 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      np.random.seed(42)\r
\r
      days = pd.date_range('2024-01-01', periods=252, freq='B')\r
      returns = np.random.normal(0.001, 0.02, 252)\r
      price = 100 * np.cumprod(1 + returns)\r
\r
      stockData = pd.DataFrame({\r
          'date': days,\r
          'price': price\r
      })\r
\r
      stockData.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 주가 데이터 생성의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 주가 데이터 생성의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_basic_annotate\r
  title: 3단계. annotate 기본\r
  structuredPrimary: true\r
  subtitle: 화살표 주석\r
  goal: 3단계. annotate 기본에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    annotate는 특정 데이터 포인트에 화살표와 텍스트를 추가합니다. xy는 화살표가 가리키는 위치, xytext는 텍스트가 표시되는 위치입니다. arrowprops로 화살표 스타일을 지정합니다.\r
\r
    ax.annotate(텍스트, xy=(x, y), xytext=(tx, ty), arrowprops=dict())로 화살표 주석을 추가합니다. xy는 화살표 끝점, xytext는 텍스트 시작점입니다. arrowstyle에는 '->', '-|>', '<->', 'fancy', 'wedge' 등이 있습니다.\r
  tips:\r
  - ax.annotate(텍스트, xy=(x, y), xytext=(tx, ty), arrowprops=dict())로 화살표 주석을 추가합니다. xy는 화살표 끝점, xytext는\r
    텍스트 시작점입니다. arrowstyle에는 '->', '-|>', '<->', 'fancy', 'wedge' 등이 있습니다.\r
  snippet: |-\r
    figAnnotate, axAnnotate = plt.subplots(figsize=(12, 6))\r
\r
    axAnnotate.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)\r
\r
    maxIdx = stockData['price'].idxmax()\r
    maxDate = stockData.loc[maxIdx, 'date']\r
    maxPrice = stockData.loc[maxIdx, 'price']\r
\r
    axAnnotate.annotate('최고점',\r
                       xy=(maxDate, maxPrice),\r
                       xytext=(maxDate - pd.Timedelta(days=30), maxPrice + 10),\r
                       fontsize=11,\r
                       arrowprops=dict(arrowstyle='->', color='#E74C3C'))\r
\r
    axAnnotate.set_title('주가 추이 (기본 주석)', fontsize=14)\r
    axAnnotate.set_xlabel('날짜')\r
    axAnnotate.set_ylabel('주가 ($)')\r
\r
    figAnnotate\r
  exercise:\r
    prompt: 3단계. annotate 기본 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      figAnnotate, axAnnotate = plt.subplots(figsize=(12, 6))\r
\r
      axAnnotate.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)\r
\r
      maxIdx = stockData['price'].idxmax()\r
      maxDate = stockData.loc[maxIdx, 'date']\r
      maxPrice = stockData.loc[maxIdx, 'price']\r
\r
      axAnnotate.annotate('최고점',\r
                         xy=(maxDate, maxPrice),\r
                         xytext=(maxDate - pd.Timedelta(days=30), maxPrice + 10),\r
                         fontsize=11,\r
                         arrowprops=dict(arrowstyle='->', color='#E74C3C'))\r
\r
      axAnnotate.set_title('주가 추이 (기본 주석)', fontsize=14)\r
      axAnnotate.set_xlabel('날짜')\r
      axAnnotate.set_ylabel('주가 ($)')\r
\r
      figAnnotate\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. annotate 기본의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 3단계. annotate 기본의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step4_arrow_styles\r
  title: 4단계. 다양한 화살표 스타일\r
  structuredPrimary: true\r
  subtitle: arrowprops 옵션\r
  goal: 4단계. 다양한 화살표 스타일에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    arrowprops에는 다양한 옵션이 있습니다. connectionstyle로 화살표 경로를 조절하고, facecolor와 edgecolor로 색상을 지정합니다. shrink로 화살표 시작/끝 여백을 조절합니다.\r
\r
    connectionstyle로 화살표 곡선을 조절합니다. 'arc3,rad=0.3'은 호 형태로 rad 값이 클수록 많이 휩니다. 양수는 시계방향, 음수는 반시계방향입니다. 'angle,angleA=0,angleB=90'으로 꺾인 화살표도 가능합니다.\r
  tips:\r
  - connectionstyle로 화살표 곡선을 조절합니다. 'arc3,rad=0.3'은 호 형태로 rad 값이 클수록 많이 휩니다. 양수는 시계방향, 음수는 반시계방향입니다. 'angle,angleA=0,angleB=90'으로\r
    꺾인 화살표도 가능합니다.\r
  snippet: |-\r
    figArrow, axArrow = plt.subplots(figsize=(12, 7))\r
    axArrow.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)\r
\r
    minIdx = stockData['price'].idxmin()\r
    minDate = stockData.loc[minIdx, 'date']\r
    minPrice = stockData.loc[minIdx, 'price']\r
\r
    axArrow.annotate('최저점',\r
                    xy=(minDate, minPrice),\r
                    xytext=(minDate + pd.Timedelta(days=40), minPrice - 5),\r
                    fontsize=11, fontweight='bold', color='#27AE60',\r
                    arrowprops=dict(arrowstyle='fancy',\r
                                   facecolor='#27AE60',\r
                                   edgecolor='none',\r
                                   connectionstyle='arc3,rad=0.3'))\r
    figArrow\r
  exercise:\r
    prompt: 4단계. 다양한 화살표 스타일 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      figArrow, axArrow = plt.subplots(figsize=(12, 7))\r
      axArrow.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)\r
\r
      minIdx = stockData['price'].idxmin()\r
      minDate = stockData.loc[minIdx, 'date']\r
      minPrice = stockData.loc[minIdx, 'price']\r
\r
      axArrow.annotate('최저점',\r
                      xy=(minDate, minPrice),\r
                      xytext=(minDate + pd.Timedelta(days=40), minPrice - 5),\r
                      fontsize=11, fontweight='bold', color='#27AE60',\r
                      arrowprops=dict(arrowstyle='fancy',\r
                                     facecolor='#27AE60',\r
                                     edgecolor='none',\r
                                     connectionstyle='arc3,rad=0.3'))\r
      figArrow\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 다양한 화살표 스타일의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. 다양한 화살표 스타일의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_bbox\r
  title: 5단계. bbox 텍스트 박스\r
  structuredPrimary: true\r
  subtitle: 텍스트 강조\r
  goal: 5단계. bbox 텍스트 박스에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    bbox 파라미터로 텍스트 주위에 박스를 그릴 수 있습니다. boxstyle로 박스 모양을, facecolor로 배경색을, alpha로 투명도를 지정합니다. 주석 텍스트를 더 잘 보이게 만듭니다.\r
\r
    bbox=dict(boxstyle='스타일', facecolor=배경색, edgecolor=테두리색)로 텍스트 박스를 만듭니다. boxstyle 옵션: 'round'(둥근 모서리), 'square'(직각), 'circle', 'rarrow'(화살표), 'sawtooth'(톱니), 'roundtooth'(둥근톱니). pad로 여백을 조절합니다.\r
  tips:\r
  - 'bbox=dict(boxstyle=''스타일'', facecolor=배경색, edgecolor=테두리색)로 텍스트 박스를 만듭니다. boxstyle 옵션: ''round''(둥근\r
    모서리), ''square''(직각), ''circle'', ''rarrow''(화살표), ''sawtooth''(톱니), ''roundtooth''(둥근톱니). pad로 여백을\r
    조절합니다.'\r
  snippet: |-\r
    figBbox, axBbox = plt.subplots(figsize=(12, 7))\r
    axBbox.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)\r
\r
    axBbox.annotate('주요 저항선 돌파',\r
                   xy=(maxDate, maxPrice),\r
                   xytext=(maxDate - pd.Timedelta(days=50), maxPrice + 12),\r
                   fontsize=11, fontweight='bold',\r
                   bbox=dict(boxstyle='round,pad=0.5',\r
                            facecolor='#FDEBD0',\r
                            edgecolor='#E67E22',\r
                            linewidth=2),\r
                   arrowprops=dict(arrowstyle='->',\r
                                  color='#E67E22',\r
                                  connectionstyle='arc3,rad=0.2'))\r
    figBbox\r
  exercise:\r
    prompt: 5단계. bbox 텍스트 박스 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBbox, axBbox = plt.subplots(figsize=(12, 7))\r
      axBbox.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)\r
\r
      axBbox.annotate('주요 저항선 돌파',\r
                     xy=(maxDate, maxPrice),\r
                     xytext=(maxDate - pd.Timedelta(days=50), maxPrice + 12),\r
                     fontsize=11, fontweight='bold',\r
                     bbox=dict(boxstyle='round,pad=0.5',\r
                              facecolor='#FDEBD0',\r
                              edgecolor='#E67E22',\r
                              linewidth=2),\r
                     arrowprops=dict(arrowstyle='->',\r
                                    color='#E67E22',\r
                                    connectionstyle='arc3,rad=0.2'))\r
      figBbox\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. bbox 텍스트 박스의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 5단계. bbox 텍스트 박스의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step6_latex\r
  title: 6단계. LaTeX 수식\r
  structuredPrimary: true\r
  subtitle: 수학 표현식\r
  goal: 6단계. LaTeX 수식에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    Matplotlib은 LaTeX 문법을 지원합니다. 달러 기호($) 안에 수식을 작성하면 수학 표현식으로 렌더링됩니다. 통계량, 공식, 그리스 문자 등을 표현할 수 있습니다.\r
\r
    LaTeX 문법은 r'$...$' 형태로 작성합니다. r은 raw string으로 역슬래시를 이스케이프하지 않습니다. 주요 기호: \\mu(μ), \\sigma(σ), \\alpha(α), \\beta(β), \\sum(Σ), \\frac{a}{b}(분수), ^{n}(위첨자), _{n}(아래첨자).\r
  tips:\r
  - 'LaTeX 문법은 r''$...$'' 형태로 작성합니다. r은 raw string으로 역슬래시를 이스케이프하지 않습니다. 주요 기호: \\mu(μ), \\sigma(σ), \\alpha(α),\r
    \\beta(β), \\sum(Σ), \\frac{a}{b}(분수), ^{n}(위첨자), _{n}(아래첨자).'\r
  snippet: |-\r
    figLatex, axLatex = plt.subplots(figsize=(12, 7))\r
    axLatex.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)\r
\r
    meanPrice = stockData['price'].mean()\r
    stdPrice = stockData['price'].std()\r
\r
    axLatex.axhline(y=meanPrice, color='#E74C3C', linestyle='--', linewidth=1.5, label='평균')\r
    axLatex.axhline(y=meanPrice + stdPrice, color='#3498DB', linestyle=':', linewidth=1.5)\r
    axLatex.axhline(y=meanPrice - stdPrice, color='#3498DB', linestyle=':', linewidth=1.5)\r
    figLatex\r
  exercise:\r
    prompt: 6단계. LaTeX 수식 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figLatex, axLatex = plt.subplots(figsize=(12, 7))\r
      axLatex.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)\r
\r
      meanPrice = stockData['price'].mean()\r
      stdPrice = stockData['price'].std()\r
\r
      axLatex.axhline(y=meanPrice, color='#E74C3C', linestyle='--', linewidth=1.5, label='평균')\r
      axLatex.axhline(y=meanPrice + stdPrice, color='#3498DB', linestyle=':', linewidth=1.5)\r
      axLatex.axhline(y=meanPrice - stdPrice, color='#3498DB', linestyle=':', linewidth=1.5)\r
      figLatex\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. LaTeX 수식의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. LaTeX 수식의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_latex_advanced\r
  title: 7단계. 복잡한 수식\r
  structuredPrimary: true\r
  subtitle: 공식 표현\r
  goal: 7단계. 복잡한 수식에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    더 복잡한 수식도 LaTeX로 표현할 수 있습니다. 분수, 제곱근, 합계 기호 등 다양한 수학 기호를 사용해봅니다. 금융 공식이나 통계 공식을 차트에 직접 표시할 수 있습니다.\r
\r
    transform=ax.transAxes를 사용하면 데이터 좌표가 아닌 Axes 좌표(0~1)로 위치를 지정합니다. (0,0)은 좌하단, (1,1)은 우상단입니다. 차트 크기가 변해도 텍스트 위치가 고정됩니다.\r
  tips:\r
  - transform=ax.transAxes를 사용하면 데이터 좌표가 아닌 Axes 좌표(0~1)로 위치를 지정합니다. (0,0)은 좌하단, (1,1)은 우상단입니다. 차트 크기가\r
    변해도 텍스트 위치가 고정됩니다.\r
  snippet: |-\r
    figFormula, axFormula = plt.subplots(figsize=(12, 7))\r
    axFormula.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)\r
\r
    dailyReturns = stockData['price'].pct_change().dropna()\r
    sharpeRatio = np.sqrt(252) * dailyReturns.mean() / dailyReturns.std()\r
    figFormula\r
  exercise:\r
    prompt: 7단계. 복잡한 수식 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFormula, axFormula = plt.subplots(figsize=(12, 7))\r
      axFormula.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)\r
\r
      dailyReturns = stockData['price'].pct_change().dropna()\r
      sharpeRatio = np.sqrt(252) * dailyReturns.mean() / dailyReturns.std()\r
      figFormula\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 복잡한 수식의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 복잡한 수식의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_errorbar\r
  title: 8단계. 오차 막대\r
  structuredPrimary: true\r
  subtitle: errorbar\r
  goal: 8단계. 오차 막대에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    errorbar는 데이터의 불확실성이나 변동성을 표현합니다. 주간 평균 주가와 함께 표준편차를 오차 막대로 표시합니다. 과학 논문이나 통계 보고서에서 자주 사용됩니다.\r
\r
    ax.errorbar(x, y, yerr=오차)로 오차 막대를 그립니다. fmt='o-'는 마커와 선 스타일, ecolor는 오차 막대 색상, capsize는 캡 크기입니다. xerr로 x축 오차도 표시할 수 있습니다. yerr에 [하단오차, 상단오차] 배열을 전달하면 비대칭 오차도 가능합니다.\r
  tips:\r
  - ax.errorbar(x, y, yerr=오차)로 오차 막대를 그립니다. fmt='o-'는 마커와 선 스타일, ecolor는 오차 막대 색상, capsize는 캡 크기입니다.\r
    xerr로 x축 오차도 표시할 수 있습니다. yerr에 [하단오차, 상단오차] 배열을 전달하면 비대칭 오차도 가능합니다.\r
  snippet: |-\r
    stockData['week'] = stockData['date'].dt.isocalendar().week\r
    weeklyStats = stockData.groupby('week')['price'].agg(['mean', 'std']).reset_index()\r
    weeklyStats = weeklyStats.iloc[:20]\r
    weeklyStats.head()\r
  exercise:\r
    prompt: 8단계. 오차 막대 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      stockData['week'] = stockData['date'].dt.isocalendar().week\r
      weeklyStats = stockData.groupby('week')['price'].agg(['mean', 'std']).reset_index()\r
      weeklyStats = weeklyStats.iloc[:20]\r
      weeklyStats.head()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 오차 막대에서 \`weeklyStats\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 오차 막대 실행 뒤 \`weeklyStats\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step9_combined\r
  title: 9단계. 이벤트 차트\r
  structuredPrimary: true\r
  subtitle: 모든 기법 조합\r
  goal: 9단계. 이벤트 차트에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 annotate, LaTeX, bbox, errorbar를 모두 활용하여 주요 이벤트가 표시된 전문적인 주가 차트를 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figEvent, axEvent = plt.subplots(figsize=(14, 8))\r
    axEvent.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5, label='일별 종가')\r
    axEvent.axhline(y=meanPrice, color='#95A5A6', linestyle='--', linewidth=1, alpha=0.7)\r
\r
    events = [\r
        {'date': stockData['date'].iloc[50], 'label': '실적 발표', 'color': '#27AE60'},\r
        {'date': stockData['date'].iloc[120], 'label': '금리 인하', 'color': '#3498DB'},\r
        {'date': stockData['date'].iloc[180], 'label': '신제품 출시', 'color': '#9B59B6'}\r
    ]\r
    figEvent\r
  exercise:\r
    prompt: 9단계. 이벤트 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figEvent, axEvent = plt.subplots(figsize=(14, 8))\r
      axEvent.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5, label='일별 종가')\r
      axEvent.axhline(y=meanPrice, color='#95A5A6', linestyle='--', linewidth=1, alpha=0.7)\r
\r
      events = [\r
          {'date': stockData['date'].iloc[50], 'label': '실적 발표', 'color': '#27AE60'},\r
          {'date': stockData['date'].iloc[120], 'label': '금리 인하', 'color': '#3498DB'},\r
          {'date': stockData['date'].iloc[180], 'label': '신제품 출시', 'color': '#9B59B6'}\r
      ]\r
      figEvent\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 이벤트 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 이벤트 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_final\r
  title: 10단계. 최종 분석 차트\r
  structuredPrimary: true\r
  subtitle: 전문가급 차트\r
  goal: 10단계. 최종 분석 차트에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 모든 기법을 종합하여 논문이나 보고서에 바로 사용할 수 있는 전문가급 차트를 완성합니다. 주요 구간 표시, 통계 정보, 이벤트 주석을 모두 포함합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal, axFinal = plt.subplots(figsize=(16, 9))\r
\r
    axFinal.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.8, label='일별 종가')\r
    axFinal.fill_between(stockData['date'], meanPrice - stdPrice, meanPrice + stdPrice,\r
                        color='#3498DB', alpha=0.1, label=r'$\\pm 1\\sigma$ 범위')\r
    axFinal.axhline(y=meanPrice, color='#E74C3C', linestyle='--', linewidth=1.5)\r
    figFinal\r
  exercise:\r
    prompt: 10단계. 최종 분석 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal, axFinal = plt.subplots(figsize=(16, 9))\r
\r
      axFinal.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.8, label='일별 종가')\r
      axFinal.fill_between(stockData['date'], meanPrice - stdPrice, meanPrice + stdPrice,\r
                          color='#3498DB', alpha=0.1, label=r'$\\pm 1\\sigma$ 범위')\r
      axFinal.axhline(y=meanPrice, color='#E74C3C', linestyle='--', linewidth=1.5)\r
      figFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 최종 분석 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 최종 분석 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 고급 주석 프로젝트\r
  goal: 실습에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 annotate, LaTeX, bbox, errorbar를 활용해서 전문적인 분석 차트를 만들어봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import numpy as np\r
\r
    np.random.seed(123)\r
    periods = ['Q1', 'Q2', 'Q3', 'Q4']\r
    sales = np.array([120, 145, 138, 165])\r
    margin = np.array([8, 12, 10, 15])\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      import numpy as np\r
\r
      np.random.seed(123)\r
      periods = ['Q1', 'Q2', 'Q3', 'Q4']\r
      sales = np.array([120, 145, 138, 165])\r
      margin = np.array([8, 12, 10, 15])\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`periods\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: annotate, LaTeX, bbox, errorbar로 고급 주석 차트를 만들었습니다.\r
  - type: list\r
    items:\r
    - ax.annotate(text, xy, xytext, arrowprops) - 화살표 주석\r
    - 'arrowstyle: ''->'', ''fancy'', ''wedge'' 등 다양한 스타일'\r
    - 'connectionstyle: ''arc3,rad=0.3'' 곡선 화살표'\r
    - bbox=dict(boxstyle, facecolor, edgecolor) - 텍스트 박스\r
    - r'$\\mu$', r'$\\sigma$' - LaTeX 수식 표현\r
    - transform=ax.transAxes - Axes 좌표 사용\r
    - ax.errorbar(x, y, yerr) - 오차 막대 차트\r
  - type: text\r
    content: 다음 시간에는 모든 개념을 종합한 분석 리포트를 만듭니다.\r
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