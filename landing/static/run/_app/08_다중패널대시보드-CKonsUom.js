var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - seaborn\r
  id: matplotlib_08\r
  title: 다중패널대시보드\r
  order: 8\r
  category: matplotlib\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - matplotlib\r
  - GridSpec\r
  - style\r
  - tight_layout\r
  - dashboard\r
  - pie\r
  seo:\r
    title: Matplotlib 대시보드 - GridSpec으로 다중 패널 레이아웃\r
    description: Matplotlib으로 4개 이상의 차트를 조합한 대시보드를 만듭니다. GridSpec, style, tight_layout, pie 사용법을 배웁니다.\r
    keywords:\r
    - matplotlib\r
    - GridSpec\r
    - 대시보드\r
    - pie\r
    - 스타일\r
    - 레이아웃\r
intro:\r
  emoji: 📋\r
  goal: 4개 차트로 구성된 팁 데이터 분석 대시보드를 만듭니다.\r
  description: GridSpec으로 복잡한 레이아웃을 구성하고, 여러 차트 유형을 조합합니다. 이전에 배운 plot, hist, scatter, bar, boxplot, pie,\r
    subplots 개념을 모두 활용합니다.\r
  direction: 다중패널대시보드에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.\r
  benefits:\r
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 다중패널대시보드 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 11단계. 한글 폰트 설정 처리 실행\r
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 2단계. 데이터 로드 결과 검증\r
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.\r
    - label: 다중패널대시보드 재사용\r
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 시각 리포트 환경\r
      detail: matplotlib, numpy, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 다중패널대시보드 실행\r
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.\r
    - label: 다중패널대시보드 완료\r
      detail: 검증된 코드를 보고서 차트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    tips 데이터를 사용하여 레스토랑 팁 분석 대시보드를 만듭니다. GridSpec은 서브플롯보다 더 유연한 레이아웃을 구성할 수 있습니다. 스타일 시트를 적용하면 기본 디자인이 크게 개선됩니다.\r
\r
    import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. GridSpec은 복잡한 레이아웃을 구성할 때 사용합니다.\r
  tips:\r
  - import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. GridSpec은 복잡한 레이아웃을\r
    구성할 때 사용합니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    from matplotlib.gridspec import GridSpec\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import numpy as np\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      from matplotlib.gridspec import GridSpec\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import numpy as np\r
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
  subtitle: tips 데이터\r
  goal: 2단계. 데이터 로드에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: tips 데이터를 불러오고 기본 통계를 확인합니다. 대시보드에는 총 결제금액, 팁, 요일, 시간대, 인원수 등 다양한 변수를 활용합니다.\r
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
- id: step3_style\r
  title: 3단계. 스타일 시트 적용\r
  structuredPrimary: true\r
  subtitle: plt.style.use()\r
  goal: 3단계. 스타일 시트 적용에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    Matplotlib은 다양한 내장 스타일 시트를 제공합니다. 스타일을 적용하면 배경색, 그리드, 폰트 등이 일괄 변경됩니다. 'seaborn-v0_8-whitegrid'는 깔끔한 비즈니스 차트에 적합합니다.\r
\r
    plt.style.use('스타일명')으로 스타일을 적용합니다. 주요 스타일: 'seaborn-v0_8-whitegrid'(깔끔한 격자), 'ggplot'(R 스타일), 'dark_background'(어두운 배경), 'fivethirtyeight'(뉴스 사이트 스타일). plt.style.available로 전체 목록을 볼 수 있습니다.\r
  tips:\r
  - 'plt.style.use(''스타일명'')으로 스타일을 적용합니다. 주요 스타일: ''seaborn-v0_8-whitegrid''(깔끔한 격자), ''ggplot''(R 스타일),\r
    ''dark_background''(어두운 배경), ''fivethirtyeight''(뉴스 사이트 스타일). plt.style.available로 전체 목록을 볼 수 있습니다.'\r
  snippet: plt.style.available[:10]\r
  exercise:\r
    prompt: 3단계. 스타일 시트 적용 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: plt.style.available[:10]\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 스타일 시트 적용의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 3단계. 스타일 시트 적용 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step4_gridspec\r
  title: 4단계. GridSpec 기본\r
  structuredPrimary: true\r
  subtitle: 그리드 레이아웃\r
  goal: 4단계. GridSpec 기본에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    GridSpec은 Figure를 그리드로 분할하고, 각 셀에 차트를 배치합니다. 2x2 그리드를 만들고 각 위치에 다른 차트를 배치해봅니다. subplots보다 더 유연한 레이아웃이 가능합니다.\r
\r
    GridSpec(rows, cols, figure=fig)로 그리드를 정의합니다. fig.add_subplot(gs[row, col])로 특정 위치에 Axes를 추가합니다. gs[0:2, 0]처럼 슬라이싱으로 여러 셀을 합칠 수 있습니다.\r
  tips:\r
  - GridSpec(rows, cols, figure=fig)로 그리드를 정의합니다. fig.add_subplot(gs[row, col])로 특정 위치에 Axes를 추가합니다. gs[0:2,\r
    0]처럼 슬라이싱으로 여러 셀을 합칠 수 있습니다.\r
  snippet: |-\r
    figGrid = plt.figure(figsize=(12, 10))\r
    gs = GridSpec(2, 2, figure=figGrid)\r
\r
    ax1 = figGrid.add_subplot(gs[0, 0])\r
    ax2 = figGrid.add_subplot(gs[0, 1])\r
    ax3 = figGrid.add_subplot(gs[1, 0])\r
    ax4 = figGrid.add_subplot(gs[1, 1])\r
\r
    ax1.set_title('위치 [0, 0]')\r
    ax2.set_title('위치 [0, 1]')\r
    ax3.set_title('위치 [1, 0]')\r
    ax4.set_title('위치 [1, 1]')\r
\r
    plt.tight_layout()\r
    figGrid\r
  exercise:\r
    prompt: 4단계. GridSpec 기본 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figGrid = plt.figure(figsize=(12, 10))\r
      gs = GridSpec(2, 2, figure=figGrid)\r
\r
      ax1 = figGrid.add_subplot(gs[0, 0])\r
      ax2 = figGrid.add_subplot(gs[0, 1])\r
      ax3 = figGrid.add_subplot(gs[1, 0])\r
      ax4 = figGrid.add_subplot(gs[1, 1])\r
\r
      ax1.set_title('위치 [0, 0]')\r
      ax2.set_title('위치 [0, 1]')\r
      ax3.set_title('위치 [1, 0]')\r
      ax4.set_title('위치 [1, 1]')\r
\r
      plt.tight_layout()\r
      figGrid\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. GridSpec 기본의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. GridSpec 기본의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_hist_box\r
  title: 5단계. 히스토그램과 박스플롯\r
  structuredPrimary: true\r
  subtitle: 분포 시각화\r
  goal: 5단계. 히스토그램과 박스플롯에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 첫 번째 행에 팁 금액의 분포를 히스토그램과 박스플롯으로 표시합니다. 이전에 배운 기법들을 적용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figDist = plt.figure(figsize=(14, 5))\r
    gs = GridSpec(1, 2, figure=figDist)\r
\r
    axHist = figDist.add_subplot(gs[0, 0])\r
    axHist.hist(tips['tip'], bins=20, color='#3498DB', edgecolor='white', alpha=0.8)\r
    axHist.set_title('팁 금액 분포', fontsize=12)\r
    axHist.set_xlabel('팁 ($)')\r
    axHist.set_ylabel('빈도')\r
    figDist\r
  exercise:\r
    prompt: 5단계. 히스토그램과 박스플롯 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figDist = plt.figure(figsize=(14, 5))\r
      gs = GridSpec(1, 2, figure=figDist)\r
\r
      axHist = figDist.add_subplot(gs[0, 0])\r
      axHist.hist(tips['tip'], bins=20, color='#3498DB', edgecolor='white', alpha=0.8)\r
      axHist.set_title('팁 금액 분포', fontsize=12)\r
      axHist.set_xlabel('팁 ($)')\r
      axHist.set_ylabel('빈도')\r
      figDist\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 히스토그램과 박스플롯의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 히스토그램과 박스플롯의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_scatter_bar\r
  title: 6단계. 산점도와 막대 그래프\r
  structuredPrimary: true\r
  subtitle: 관계와 비교\r
  goal: 6단계. 산점도와 막대 그래프에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 두 번째 행에 결제금액-팁 관계 산점도와 시간대별 평균 팁 막대 그래프를 배치합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figRelation = plt.figure(figsize=(14, 5))\r
    gs = GridSpec(1, 2, figure=figRelation)\r
\r
    axScatter = figRelation.add_subplot(gs[0, 0])\r
    colors = {'Lunch': '#3498DB', 'Dinner': '#E74C3C'}\r
    for time in ['Lunch', 'Dinner']:\r
        subset = tips[tips['time'] == time]\r
        axScatter.scatter(subset['total_bill'], subset['tip'],\r
                         c=colors[time], label=time, alpha=0.6, s=50)\r
    axScatter.set_title('결제금액 vs 팁', fontsize=12)\r
    axScatter.set_xlabel('결제금액 ($)')\r
    axScatter.set_ylabel('팁 ($)')\r
    axScatter.legend()\r
    figRelation\r
  exercise:\r
    prompt: 6단계. 산점도와 막대 그래프 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figRelation = plt.figure(figsize=(14, 5))\r
      gs = GridSpec(1, 2, figure=figRelation)\r
\r
      axScatter = figRelation.add_subplot(gs[0, 0])\r
      colors = {'Lunch': '#3498DB', 'Dinner': '#E74C3C'}\r
      for time in ['Lunch', 'Dinner']:\r
          subset = tips[tips['time'] == time]\r
          axScatter.scatter(subset['total_bill'], subset['tip'],\r
                           c=colors[time], label=time, alpha=0.6, s=50)\r
      axScatter.set_title('결제금액 vs 팁', fontsize=12)\r
      axScatter.set_xlabel('결제금액 ($)')\r
      axScatter.set_ylabel('팁 ($)')\r
      axScatter.legend()\r
      figRelation\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 산점도와 막대 그래프의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 6단계. 산점도와 막대 그래프 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step7_pie\r
  title: 7단계. 파이 차트\r
  structuredPrimary: true\r
  subtitle: 비율 시각화\r
  goal: 7단계. 파이 차트에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    파이 차트는 전체 대비 각 부분의 비율을 보여줍니다. 요일별 주문 비율을 파이 차트로 시각화합니다. autopct로 퍼센트를 표시하고, explode로 특정 조각을 강조할 수 있습니다.\r
\r
    ax.pie(값, labels=라벨, autopct='%1.1f%%')로 파이 차트를 그립니다. explode로 조각을 떼어내어 강조하고, shadow=True로 그림자 효과를 줍니다. startangle로 시작 각도를 조절합니다.\r
  tips:\r
  - ax.pie(값, labels=라벨, autopct='%1.1f%%')로 파이 차트를 그립니다. explode로 조각을 떼어내어 강조하고, shadow=True로 그림자 효과를\r
    줍니다. startangle로 시작 각도를 조절합니다.\r
  snippet: |-\r
    figPie, axPie = plt.subplots(figsize=(8, 8))\r
\r
    dayCount = tips['day'].value_counts()\r
    colors = ['#E74C3C', '#27AE60', '#9B59B6', '#F39C12']\r
    explode = (0, 0, 0.05, 0)\r
\r
    axPie.pie(dayCount, labels=dayCount.index, autopct='%1.1f%%',\r
             colors=colors, explode=explode, shadow=True, startangle=90)\r
    axPie.set_title('요일별 주문 비율', fontsize=14, fontweight='bold')\r
\r
    figPie\r
  exercise:\r
    prompt: 7단계. 파이 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figPie, axPie = plt.subplots(figsize=(8, 8))\r
\r
      dayCount = tips['day'].value_counts()\r
      colors = ['#E74C3C', '#27AE60', '#9B59B6', '#F39C12']\r
      explode = (0, 0, 0.05, 0)\r
\r
      axPie.pie(dayCount, labels=dayCount.index, autopct='%1.1f%%',\r
               colors=colors, explode=explode, shadow=True, startangle=90)\r
      axPie.set_title('요일별 주문 비율', fontsize=14, fontweight='bold')\r
\r
      figPie\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 파이 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 파이 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_dashboard\r
  title: 8단계. 4패널 대시보드\r
  structuredPrimary: true\r
  subtitle: 모든 차트 조합\r
  goal: 8단계. 4패널 대시보드에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 만든 4가지 차트를 하나의 대시보드로 조합합니다. 2x2 GridSpec으로 레이아웃을 구성하고, 각 위치에 적절한 차트를 배치합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figDash = plt.figure(figsize=(14, 12))\r
    gs = GridSpec(2, 2, figure=figDash, hspace=0.3, wspace=0.3)\r
\r
    ax1Dash = figDash.add_subplot(gs[0, 0])\r
    ax1Dash.hist(tips['tip'], bins=20, color='#3498DB', edgecolor='white', alpha=0.8)\r
    ax1Dash.set_title('팁 금액 분포', fontsize=12, fontweight='bold')\r
    ax1Dash.set_xlabel('팁 ($)')\r
    ax1Dash.set_ylabel('빈도')\r
    ax1Dash.spines['top'].set_visible(False)\r
    ax1Dash.spines['right'].set_visible(False)\r
    figDash\r
  exercise:\r
    prompt: 8단계. 4패널 대시보드 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figDash = plt.figure(figsize=(14, 12))\r
      gs = GridSpec(2, 2, figure=figDash, hspace=0.3, wspace=0.3)\r
\r
      ax1Dash = figDash.add_subplot(gs[0, 0])\r
      ax1Dash.hist(tips['tip'], bins=20, color='#3498DB', edgecolor='white', alpha=0.8)\r
      ax1Dash.set_title('팁 금액 분포', fontsize=12, fontweight='bold')\r
      ax1Dash.set_xlabel('팁 ($)')\r
      ax1Dash.set_ylabel('빈도')\r
      ax1Dash.spines['top'].set_visible(False)\r
      ax1Dash.spines['right'].set_visible(False)\r
      figDash\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 4패널 대시보드의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 4패널 대시보드의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_advanced\r
  title: 9단계. 고급 레이아웃\r
  structuredPrimary: true\r
  subtitle: 불균등 그리드\r
  goal: 9단계. 고급 레이아웃에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: GridSpec으로 불균등한 크기의 셀을 만들 수 있습니다. 위쪽에 큰 차트, 아래쪽에 작은 차트 3개를 배치하는 등 다양한 레이아웃이 가능합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figAdvanced = plt.figure(figsize=(14, 10))\r
    gs = GridSpec(2, 3, figure=figAdvanced, height_ratios=[2, 1], hspace=0.3, wspace=0.3)\r
\r
    axMain = figAdvanced.add_subplot(gs[0, :])\r
    for time in ['Lunch', 'Dinner']:\r
        subset = tips[tips['time'] == time]\r
        axMain.scatter(subset['total_bill'], subset['tip'],\r
                      c='#3498DB' if time == 'Lunch' else '#E74C3C',\r
                      label=time, alpha=0.6, s=60)\r
    axMain.set_title('결제금액과 팁의 관계', fontsize=14, fontweight='bold')\r
    axMain.set_xlabel('결제금액 ($)', fontsize=12)\r
    axMain.set_ylabel('팁 ($)', fontsize=12)\r
    axMain.legend(fontsize=11)\r
    axMain.grid(True, alpha=0.3)\r
    figAdvanced\r
  exercise:\r
    prompt: 9단계. 고급 레이아웃 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figAdvanced = plt.figure(figsize=(14, 10))\r
      gs = GridSpec(2, 3, figure=figAdvanced, height_ratios=[2, 1], hspace=0.3, wspace=0.3)\r
\r
      axMain = figAdvanced.add_subplot(gs[0, :])\r
      for time in ['Lunch', 'Dinner']:\r
          subset = tips[tips['time'] == time]\r
          axMain.scatter(subset['total_bill'], subset['tip'],\r
                        c='#3498DB' if time == 'Lunch' else '#E74C3C',\r
                        label=time, alpha=0.6, s=60)\r
      axMain.set_title('결제금액과 팁의 관계', fontsize=14, fontweight='bold')\r
      axMain.set_xlabel('결제금액 ($)', fontsize=12)\r
      axMain.set_ylabel('팁 ($)', fontsize=12)\r
      axMain.legend(fontsize=11)\r
      axMain.grid(True, alpha=0.3)\r
      figAdvanced\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 고급 레이아웃의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 고급 레이아웃 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_final\r
  title: 10단계. 최종 대시보드\r
  structuredPrimary: true\r
  subtitle: 완성된 분석 리포트\r
  goal: 10단계. 최종 대시보드에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 요소를 종합하여 완성도 높은 분석 대시보드를 만듭니다. 일관된 스타일, 명확한 제목, 적절한 여백으로 전문적인 리포트를 완성합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal = plt.figure(figsize=(16, 12))\r
    gs = GridSpec(2, 3, figure=figFinal, height_ratios=[1.2, 1], hspace=0.35, wspace=0.3)\r
    colorsPie = ['#E74C3C', '#27AE60', '#9B59B6', '#F39C12']\r
\r
    axFinal1 = figFinal.add_subplot(gs[0, 0:2])\r
    for time in ['Lunch', 'Dinner']:\r
        subset = tips[tips['time'] == time]\r
        axFinal1.scatter(subset['total_bill'], subset['tip'],\r
                        c='#3498DB' if time == 'Lunch' else '#E74C3C',\r
                        label=time, alpha=0.6, s=70, edgecolors='white')\r
    axFinal1.set_title('결제금액과 팁의 관계', fontsize=13, fontweight='bold')\r
    axFinal1.set_xlabel('결제금액 ($)', fontsize=11)\r
    axFinal1.set_ylabel('팁 ($)', fontsize=11)\r
    axFinal1.legend(fontsize=10)\r
    axFinal1.grid(True, alpha=0.3)\r
    axFinal1.spines['top'].set_visible(False)\r
    axFinal1.spines['right'].set_visible(False)\r
    figFinal\r
  exercise:\r
    prompt: 10단계. 최종 대시보드 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal = plt.figure(figsize=(16, 12))\r
      gs = GridSpec(2, 3, figure=figFinal, height_ratios=[1.2, 1], hspace=0.35, wspace=0.3)\r
      colorsPie = ['#E74C3C', '#27AE60', '#9B59B6', '#F39C12']\r
\r
      axFinal1 = figFinal.add_subplot(gs[0, 0:2])\r
      for time in ['Lunch', 'Dinner']:\r
          subset = tips[tips['time'] == time]\r
          axFinal1.scatter(subset['total_bill'], subset['tip'],\r
                          c='#3498DB' if time == 'Lunch' else '#E74C3C',\r
                          label=time, alpha=0.6, s=70, edgecolors='white')\r
      axFinal1.set_title('결제금액과 팁의 관계', fontsize=13, fontweight='bold')\r
      axFinal1.set_xlabel('결제금액 ($)', fontsize=11)\r
      axFinal1.set_ylabel('팁 ($)', fontsize=11)\r
      axFinal1.legend(fontsize=10)\r
      axFinal1.grid(True, alpha=0.3)\r
      axFinal1.spines['top'].set_visible(False)\r
      axFinal1.spines['right'].set_visible(False)\r
      figFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 최종 대시보드의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 최종 대시보드 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 대시보드 프로젝트\r
  goal: 실습에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 내용을 활용해서 다양한 데이터로 대시보드를 만들어봅시다. GridSpec, pie, style, tight_layout 등 모든 개념을 종합적으로 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    from matplotlib.gridspec import GridSpec\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    data = loadLocalDataset('penguins').dropna()\r
\r
    chart = plt.figure(figsize=(14, 10))\r
    grid = GridSpec(2, 2, figure=chart, hspace=0.35, wspace=0.3)\r
\r
    kinds = data['species'].unique()\r
    palette = ['#E74C3C', '#27AE60', '#3498DB']\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      from matplotlib.gridspec import GridSpec\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      data = loadLocalDataset('penguins').dropna()\r
\r
      chart = plt.figure(figsize=(14, 10))\r
      grid = GridSpec(2, 2, figure=chart, hspace=0.35, wspace=0.3)\r
\r
      kinds = data['species'].unique()\r
      palette = ['#E74C3C', '#27AE60', '#3498DB']\r
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
    content: GridSpec으로 다중 패널 대시보드를 만들었습니다.\r
  - type: list\r
    items:\r
    - GridSpec(rows, cols) - 유연한 그리드 레이아웃 정의\r
    - fig.add_subplot(gs[row, col]) - 그리드 위치에 Axes 추가\r
    - gs[0:2, 0] - 슬라이싱으로 여러 셀 합치기\r
    - height_ratios, width_ratios - 불균등 크기 설정\r
    - ax.pie(values, autopct) - 파이 차트\r
    - plt.style.use() - 스타일 시트 적용\r
    - plt.tight_layout() - 자동 여백 조정\r
  - type: text\r
    content: 다음 시간에는 annotate와 LaTeX로 고급 주석 차트를 만듭니다.\r
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