var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  id: matplotlib_07\r
  title: 시계열다중축차트\r
  order: 7\r
  category: matplotlib\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - matplotlib\r
  - twinx\r
  - fill_between\r
  - 시계열\r
  - 이중축\r
  seo:\r
    title: Matplotlib 이중 축 차트 - 온도와 강수량 시각화\r
    description: Matplotlib으로 온도와 강수량을 이중 축 차트로 시각화합니다. twinx, fill_between, 시계열 분석 기법을 배웁니다.\r
    keywords:\r
    - matplotlib\r
    - twinx\r
    - 이중축\r
    - fill_between\r
    - 시계열\r
    - 날씨\r
intro:\r
  emoji: 🌡️\r
  goal: 온도와 강수량을 이중 축 차트로 시각화합니다.\r
  description: 서로 다른 단위의 변수를 한 차트에 표시할 때 이중 축을 사용합니다. twinx()로 y축을 추가하고, fill_between()으로 영역을 채웁니다. 이전에\r
    배운 plot, bar, scatter, subplots, legend 개념을 함께 활용합니다.\r
  direction: 시계열다중축차트에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.\r
  benefits:\r
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 시계열다중축차트 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 11단계. 한글 폰트 설정 처리 실행\r
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 2단계. 날씨 데이터 생성 결과 검증\r
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.\r
    - label: 시계열다중축차트 재사용\r
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 시각 리포트 환경\r
      detail: matplotlib, numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 시계열다중축차트 실행\r
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.\r
    - label: 시계열다중축차트 완료\r
      detail: 검증된 코드를 보고서 차트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    가상의 월별 날씨 데이터를 생성하여 시계열 분석을 연습합니다. 온도(°C)와 강수량(mm)은 단위와 스케일이 완전히 다르므로, 이중 축을 사용해야 두 변수를 효과적으로 비교할 수 있습니다.\r
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
  title: 2단계. 날씨 데이터 생성\r
  structuredPrimary: true\r
  subtitle: 시뮬레이션 데이터\r
  goal: 2단계. 날씨 데이터 생성에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 한국의 전형적인 기후 패턴을 반영한 가상 데이터를 생성합니다. 여름(7-8월)에 고온다습하고, 겨울(12-2월)에 건조한 계절 변화를 담습니다. 실제 기상청\r
    데이터와 유사한 패턴입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    np.random.seed(42)\r
    months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']\r
\r
    temperature = np.array([-2, 1, 7, 14, 19, 24, 27, 28, 23, 16, 8, 1]) + np.random.randn(12) * 1.5\r
    rainfall = np.array([20, 25, 45, 65, 100, 135, 380, 320, 145, 50, 45, 25]) + np.random.randn(12) * 15\r
\r
    weatherData = pd.DataFrame({\r
        'month': months,\r
        'temp': temperature,\r
        'rain': rainfall\r
    })\r
    weatherData\r
  exercise:\r
    prompt: 2단계. 날씨 데이터 생성 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      np.random.seed(42)\r
      months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']\r
\r
      temperature = np.array([-2, 1, 7, 14, 19, 24, 27, 28, 23, 16, 8, 1]) + np.random.randn(12) * 1.5\r
      rainfall = np.array([20, 25, 45, 65, 100, 135, 380, 320, 145, 50, 45, 25]) + np.random.randn(12) * 15\r
\r
      weatherData = pd.DataFrame({\r
          'month': months,\r
          'temp': temperature,\r
          'rain': rainfall\r
      })\r
      weatherData\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 날씨 데이터 생성의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 날씨 데이터 생성의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_single\r
  title: 3단계. 단일 축의 문제점\r
  structuredPrimary: true\r
  subtitle: 스케일 차이\r
  goal: 3단계. 단일 축의 문제점에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 온도와 강수량을 같은 y축에 표시하면 스케일 차이로 인해 제대로 비교할 수 없습니다. 온도는 -5~30 범위인데 강수량은 0~400 범위이므로, 온도 변화가\r
    거의 보이지 않게 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figSingle, axSingle = plt.subplots(figsize=(10, 6))\r
    axSingle.plot(weatherData['month'], weatherData['temp'], 'o-', label='온도')\r
    axSingle.plot(weatherData['month'], weatherData['rain'], 's-', label='강수량')\r
    axSingle.set_title('단일 축의 문제점', fontsize=14)\r
    axSingle.legend()\r
    figSingle\r
  exercise:\r
    prompt: 3단계. 단일 축의 문제점 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figSingle, axSingle = plt.subplots(figsize=(10, 6))\r
      axSingle.plot(weatherData['month'], weatherData['temp'], 'o-', label='온도')\r
      axSingle.plot(weatherData['month'], weatherData['rain'], 's-', label='강수량')\r
      axSingle.set_title('단일 축의 문제점', fontsize=14)\r
      axSingle.legend()\r
      figSingle\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 단일 축의 문제점의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 3단계. 단일 축의 문제점 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step4_twinx\r
  title: 4단계. 이중 축 생성\r
  structuredPrimary: true\r
  subtitle: ax.twinx()\r
  goal: 4단계. 이중 축 생성에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    twinx()는 기존 Axes와 x축을 공유하는 새로운 Axes를 생성합니다. 이 새로운 축은 오른쪽에 y축을 가지며, 독립적인 스케일을 사용합니다. 이제 온도와 강수량을 각각의 적절한 스케일로 표시할 수 있습니다.\r
\r
    ax.twinx()는 x축을 공유하는 새 Axes를 반환합니다. ax.twiny()는 y축을 공유합니다. 두 축의 색상을 다르게 설정하면 어느 축이 어느 데이터인지 쉽게 구분할 수 있습니다. tick_params(labelcolor)로 눈금 라벨 색상을 맞춥니다.\r
  tips:\r
  - ax.twinx()는 x축을 공유하는 새 Axes를 반환합니다. ax.twiny()는 y축을 공유합니다. 두 축의 색상을 다르게 설정하면 어느 축이 어느 데이터인지 쉽게 구분할\r
    수 있습니다. tick_params(labelcolor)로 눈금 라벨 색상을 맞춥니다.\r
  snippet: |-\r
    figTwin, ax1 = plt.subplots(figsize=(10, 6))\r
\r
    ax1.plot(weatherData['month'], weatherData['temp'], 'o-', color='#E74C3C', label='온도')\r
    ax1.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)\r
    ax1.tick_params(axis='y', labelcolor='#E74C3C')\r
    figTwin\r
  exercise:\r
    prompt: 4단계. 이중 축 생성 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figTwin, ax1 = plt.subplots(figsize=(10, 6))\r
\r
      ax1.plot(weatherData['month'], weatherData['temp'], 'o-', color='#E74C3C', label='온도')\r
      ax1.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)\r
      ax1.tick_params(axis='y', labelcolor='#E74C3C')\r
      figTwin\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 이중 축 생성의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 4단계. 이중 축 생성 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step5_legend\r
  title: 5단계. 범례 통합\r
  structuredPrimary: true\r
  subtitle: 두 축의 범례 합치기\r
  goal: 5단계. 범례 통합에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 이중 축 차트에서 두 데이터의 범례를 하나로 합치려면 각 축에서 범례 정보를 가져와 합쳐야 합니다. get_legend_handles_labels()로 핸들과\r
    라벨을 추출한 후 합쳐서 legend()에 전달합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figLegend, ax1Legend = plt.subplots(figsize=(10, 6))\r
\r
    line1, = ax1Legend.plot(weatherData['month'], weatherData['temp'], 'o-', color='#E74C3C', label='온도 (°C)')\r
    ax1Legend.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)\r
    ax1Legend.tick_params(axis='y', labelcolor='#E74C3C')\r
    figLegend\r
  exercise:\r
    prompt: 5단계. 범례 통합 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figLegend, ax1Legend = plt.subplots(figsize=(10, 6))\r
\r
      line1, = ax1Legend.plot(weatherData['month'], weatherData['temp'], 'o-', color='#E74C3C', label='온도 (°C)')\r
      ax1Legend.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)\r
      ax1Legend.tick_params(axis='y', labelcolor='#E74C3C')\r
      figLegend\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 범례 통합의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 5단계. 범례 통합 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step6_fill\r
  title: 6단계. 영역 채우기\r
  structuredPrimary: true\r
  subtitle: fill_between()\r
  goal: 6단계. 영역 채우기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    fill_between()은 선 그래프 아래 영역을 색상으로 채웁니다. 온도 변화를 영역으로 표시하면 시각적 임팩트가 커집니다. alpha로 투명도를 조절하여 뒤의 막대 그래프가 보이도록 합니다.\r
\r
    fill_between(x, y)은 y=0부터 y값까지의 영역을 채웁니다. fill_between(x, y1, y2)로 두 선 사이 영역도 채울 수 있습니다. set_zorder()로 레이어 순서를 조절하고, patch.set_visible(False)로 배경을 투명하게 만들어 뒤의 차트가 보이게 합니다.\r
  tips:\r
  - fill_between(x, y)은 y=0부터 y값까지의 영역을 채웁니다. fill_between(x, y1, y2)로 두 선 사이 영역도 채울 수 있습니다. set_zorder()로\r
    레이어 순서를 조절하고, patch.set_visible(False)로 배경을 투명하게 만들어 뒤의 차트가 보이게 합니다.\r
  snippet: |-\r
    figFill, ax1Fill = plt.subplots(figsize=(10, 6))\r
    xPos = range(len(months))\r
\r
    ax1Fill.fill_between(xPos, weatherData['temp'], alpha=0.3, color='#E74C3C', label='온도 (°C)')\r
    ax1Fill.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C')\r
    ax1Fill.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)\r
    ax1Fill.tick_params(axis='y', labelcolor='#E74C3C')\r
    ax1Fill.set_xticks(xPos)\r
    ax1Fill.set_xticklabels(months)\r
    figFill\r
  exercise:\r
    prompt: 6단계. 영역 채우기 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFill, ax1Fill = plt.subplots(figsize=(10, 6))\r
      xPos = range(len(months))\r
\r
      ax1Fill.fill_between(xPos, weatherData['temp'], alpha=0.3, color='#E74C3C', label='온도 (°C)')\r
      ax1Fill.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C')\r
      ax1Fill.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)\r
      ax1Fill.tick_params(axis='y', labelcolor='#E74C3C')\r
      ax1Fill.set_xticks(xPos)\r
      ax1Fill.set_xticklabels(months)\r
      figFill\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 영역 채우기의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 영역 채우기의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_style\r
  title: 7단계. 스타일링\r
  structuredPrimary: true\r
  subtitle: 색상과 선 스타일\r
  goal: 7단계. 스타일링에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 차트의 가독성을 높이기 위해 스타일을 세밀하게 조정합니다. 그리드, 마커 스타일, 범례 위치 등을 설정하여 전문적인 시각화를 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figStyle, ax1Style = plt.subplots(figsize=(12, 6))\r
    xPos = range(len(months))\r
\r
    ax1Style.fill_between(xPos, weatherData['temp'], alpha=0.2, color='#E74C3C')\r
    line1, = ax1Style.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C',\r
                          linewidth=2, markersize=8, label='온도 (°C)')\r
    ax1Style.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)\r
    ax1Style.tick_params(axis='y', labelcolor='#E74C3C')\r
    ax1Style.set_ylim(-10, 35)\r
    ax1Style.set_xticks(xPos)\r
    ax1Style.set_xticklabels(months)\r
    figStyle\r
  exercise:\r
    prompt: 7단계. 스타일링 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figStyle, ax1Style = plt.subplots(figsize=(12, 6))\r
      xPos = range(len(months))\r
\r
      ax1Style.fill_between(xPos, weatherData['temp'], alpha=0.2, color='#E74C3C')\r
      line1, = ax1Style.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C',\r
                            linewidth=2, markersize=8, label='온도 (°C)')\r
      ax1Style.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)\r
      ax1Style.tick_params(axis='y', labelcolor='#E74C3C')\r
      ax1Style.set_ylim(-10, 35)\r
      ax1Style.set_xticks(xPos)\r
      ax1Style.set_xticklabels(months)\r
      figStyle\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 스타일링의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 스타일링의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_annotation\r
  title: 8단계. 주석 추가\r
  structuredPrimary: true\r
  subtitle: 최고/최저 표시\r
  goal: 8단계. 주석 추가에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 최고 온도, 최대 강수량 등 주요 포인트에 주석을 추가하면 차트의 정보 전달력이 높아집니다. annotate()로 화살표와 함께 텍스트를 배치합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figAnnot, ax1Annot = plt.subplots(figsize=(12, 7))\r
    xPos = range(len(months))\r
\r
    ax1Annot.fill_between(xPos, weatherData['temp'], alpha=0.2, color='#E74C3C')\r
    ax1Annot.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C', linewidth=2, markersize=8)\r
    ax1Annot.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)\r
    ax1Annot.tick_params(axis='y', labelcolor='#E74C3C')\r
    ax1Annot.set_xticks(xPos)\r
    ax1Annot.set_xticklabels(months)\r
    figAnnot\r
  exercise:\r
    prompt: 8단계. 주석 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figAnnot, ax1Annot = plt.subplots(figsize=(12, 7))\r
      xPos = range(len(months))\r
\r
      ax1Annot.fill_between(xPos, weatherData['temp'], alpha=0.2, color='#E74C3C')\r
      ax1Annot.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C', linewidth=2, markersize=8)\r
      ax1Annot.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)\r
      ax1Annot.tick_params(axis='y', labelcolor='#E74C3C')\r
      ax1Annot.set_xticks(xPos)\r
      ax1Annot.set_xticklabels(months)\r
      figAnnot\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 주석 추가의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 주석 추가의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_subplots\r
  title: 9단계. 서브플롯 비교\r
  structuredPrimary: true\r
  subtitle: 이중 축 vs 분리\r
  goal: 9단계. 서브플롯 비교에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 이중 축 차트와 분리된 서브플롯을 비교합니다. 상황에 따라 어떤 방식이 더 효과적인지 판단할 수 있습니다. 분리된 서브플롯은 각 변수를 더 자세히 볼 수 있고,\r
    이중 축은 관계를 직접 비교할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figCompare, axes = plt.subplots(2, 1, figsize=(12, 10), sharex=True)\r
    xPos = range(len(months))\r
\r
    axes[0].fill_between(xPos, weatherData['temp'], alpha=0.3, color='#E74C3C')\r
    axes[0].plot(xPos, weatherData['temp'], 'o-', color='#E74C3C', linewidth=2)\r
    axes[0].set_ylabel('온도 (°C)', fontsize=12)\r
    axes[0].set_title('월별 기온 변화', fontsize=12)\r
    axes[0].grid(True, alpha=0.3, linestyle='--')\r
    axes[0].axhline(y=0, color='gray', linestyle='-', alpha=0.5)\r
    figCompare\r
  exercise:\r
    prompt: 9단계. 서브플롯 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figCompare, axes = plt.subplots(2, 1, figsize=(12, 10), sharex=True)\r
      xPos = range(len(months))\r
\r
      axes[0].fill_between(xPos, weatherData['temp'], alpha=0.3, color='#E74C3C')\r
      axes[0].plot(xPos, weatherData['temp'], 'o-', color='#E74C3C', linewidth=2)\r
      axes[0].set_ylabel('온도 (°C)', fontsize=12)\r
      axes[0].set_title('월별 기온 변화', fontsize=12)\r
      axes[0].grid(True, alpha=0.3, linestyle='--')\r
      axes[0].axhline(y=0, color='gray', linestyle='-', alpha=0.5)\r
      figCompare\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 서브플롯 비교의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 서브플롯 비교의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_final\r
  title: 10단계. 최종 시각화\r
  structuredPrimary: true\r
  subtitle: 완성된 이중 축 차트\r
  goal: 10단계. 최종 시각화에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 요소를 종합하여 완성도 높은 시계열 이중 축 차트를 만듭니다. 전문적인 스타일과 명확한 주석으로 기상 분석 보고서에 바로 사용할 수 있는\r
    품질입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal, ax1Final = plt.subplots(figsize=(13, 7))\r
    xPos = range(len(months))\r
\r
    ax1Final.fill_between(xPos, weatherData['temp'], alpha=0.15, color='#E74C3C')\r
    ax1Final.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C',\r
                 linewidth=2.5, markersize=9, label='평균 기온')\r
    ax1Final.set_ylabel('기온 (°C)', color='#E74C3C', fontsize=13)\r
    ax1Final.tick_params(axis='y', labelcolor='#E74C3C')\r
    ax1Final.set_ylim(-10, 40)\r
    ax1Final.axhline(y=0, color='gray', linestyle='-', alpha=0.3)\r
    ax1Final.set_xticks(xPos)\r
    ax1Final.set_xticklabels(months, fontsize=11)\r
    figFinal\r
  exercise:\r
    prompt: 10단계. 최종 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal, ax1Final = plt.subplots(figsize=(13, 7))\r
      xPos = range(len(months))\r
\r
      ax1Final.fill_between(xPos, weatherData['temp'], alpha=0.15, color='#E74C3C')\r
      ax1Final.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C',\r
                   linewidth=2.5, markersize=9, label='평균 기온')\r
      ax1Final.set_ylabel('기온 (°C)', color='#E74C3C', fontsize=13)\r
      ax1Final.tick_params(axis='y', labelcolor='#E74C3C')\r
      ax1Final.set_ylim(-10, 40)\r
      ax1Final.axhline(y=0, color='gray', linestyle='-', alpha=0.3)\r
      ax1Final.set_xticks(xPos)\r
      ax1Final.set_xticklabels(months, fontsize=11)\r
      figFinal\r
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
  subtitle: 시계열 분석 프로젝트\r
  goal: 실습에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 내용을 활용해서 다양한 시계열 데이터를 분석해봅시다. twinx, fill_between, annotate 등 모든 개념을 종합적으로 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import numpy as np\r
    import pandas as pd\r
\r
    np.random.seed(123)\r
    days = 30\r
    dates = pd.date_range('2024-01-01', periods=days, freq='D')\r
    price = 50000 + np.random.randn(days).cumsum() * 500\r
    volume = np.random.randint(100000, 500000, days)\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      import numpy as np\r
      import pandas as pd\r
\r
      np.random.seed(123)\r
      days = 30\r
      dates = pd.date_range('2024-01-01', periods=days, freq='D')\r
      price = 50000 + np.random.randn(days).cumsum() * 500\r
      volume = np.random.randint(100000, 500000, days)\r
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
    content: 이중 축 차트로 서로 다른 단위의 시계열 데이터를 시각화했습니다.\r
  - type: list\r
    items:\r
    - ax.twinx() - x축을 공유하는 오른쪽 y축 생성\r
    - ax.twiny() - y축을 공유하는 위쪽 x축 생성\r
    - fill_between(x, y) - 선 아래 영역 채우기\r
    - get_legend_handles_labels() - 범례 정보 추출\r
    - set_zorder() - 레이어 순서 조절\r
    - tick_params(labelcolor) - 축 눈금 색상 설정\r
  - type: text\r
    content: 다음 시간에는 GridSpec으로 복잡한 다중 패널 대시보드를 만듭니다.\r
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