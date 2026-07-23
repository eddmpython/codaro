var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - seaborn\r
  id: matplotlib_10\r
  title: 종합분석리포트\r
  order: 10\r
  category: matplotlib\r
  difficulty: ⭐⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - matplotlib\r
  - savefig\r
  - inset_axes\r
  - Normalize\r
  - comprehensive\r
  - report\r
  seo:\r
    title: Matplotlib 종합 분석 리포트 - 모든 개념 총정리\r
    description: Matplotlib의 모든 개념을 종합하여 6패널 분석 리포트를 만듭니다. savefig, inset_axes, Normalize 등 고급 기법을 마스터합니다.\r
    keywords:\r
    - matplotlib\r
    - savefig\r
    - inset_axes\r
    - Normalize\r
    - 분석리포트\r
    - 대시보드\r
intro:\r
  emoji: 📊\r
  goal: 6개 패널로 구성된 종합 분석 리포트를 만듭니다.\r
  description: 지금까지 배운 모든 개념(plot, scatter, bar, hist, boxplot, violin, pie, imshow, errorbar, fill_between,\r
    twinx, GridSpec, annotate, LaTeX, bbox, colormap 등)을 종합합니다. inset_axes로 인셋 차트를 추가하고, savefig로 고품질\r
    이미지로 저장하는 방법도 배웁니다.\r
  direction: 종합분석리포트에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.\r
  benefits:\r
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 종합분석리포트 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 11단계. 한글 폰트 설정 처리 실행\r
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 2단계. 데이터 로드 결과 검증\r
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.\r
    - label: 종합분석리포트 재사용\r
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 시각 리포트 환경\r
      detail: matplotlib, numpy, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 종합분석리포트 실행\r
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.\r
    - label: 종합분석리포트 완료\r
      detail: 검증된 코드를 보고서 차트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    모든 개념을 활용한 종합 분석 리포트를 만듭니다. gapminder와 tips 데이터를 사용하여 다양한 관점에서 데이터를 분석합니다. inset_axes와 Normalize 등 새로운 개념도 배웁니다.\r
\r
    종합 분석에는 다양한 matplotlib 서브모듈이 필요합니다. GridSpec은 레이아웃, inset_axes는 인셋 차트, Normalize와 cm은 컬러맵 설정에 사용됩니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    from matplotlib.gridspec import GridSpec\r
    from mpl_toolkits.axes_grid1.inset_locator import inset_axes\r
    from matplotlib.colors import Normalize\r
    import matplotlib.cm as cm\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import numpy as np\r
    import pandas as pd\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      from matplotlib.gridspec import GridSpec\r
      from mpl_toolkits.axes_grid1.inset_locator import inset_axes\r
      from matplotlib.colors import Normalize\r
      import matplotlib.cm as cm\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import numpy as np\r
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
  subtitle: gapminder + tips\r
  goal: 2단계. 데이터 로드에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: gapminder 데이터로 국가별 경제/인구 분석을, tips 데이터로 서비스업 분석을 수행합니다. 두 데이터셋을 조합하여 다양한 인사이트를 도출합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    gapminder = loadLocalDataset("gapminder")\r
    tips = loadLocalDataset("tips")\r
\r
    gapminder2007 = gapminder[gapminder['year'] == 2007].copy()\r
\r
    gapminder2007.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      gapminder = loadLocalDataset("gapminder")\r
      tips = loadLocalDataset("tips")\r
\r
      gapminder2007 = gapminder[gapminder['year'] == 2007].copy()\r
\r
      gapminder2007.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_inset_axes\r
  title: 3단계. 인셋 차트\r
  structuredPrimary: true\r
  subtitle: inset_axes\r
  goal: 3단계. 인셋 차트에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    inset_axes는 기존 Axes 안에 작은 차트를 삽입합니다. 메인 차트의 특정 부분을 확대하거나, 보조 정보를 표시할 때 유용합니다. 위치와 크기를 자유롭게 조절할 수 있습니다.\r
\r
    inset_axes(ax, width, height, loc)로 인셋 차트를 만듭니다. width/height는 퍼센트('30%') 또는 고정값(1.5)으로 지정합니다. loc은 'upper left', 'lower right' 등 위치입니다. borderpad로 부모 Axes와의 간격을 조절합니다.\r
  tips:\r
  - inset_axes(ax, width, height, loc)로 인셋 차트를 만듭니다. width/height는 퍼센트('30%') 또는 고정값(1.5)으로 지정합니다. loc은\r
    'upper left', 'lower right' 등 위치입니다. borderpad로 부모 Axes와의 간격을 조절합니다.\r
  snippet: |-\r
    figInset, axInset = plt.subplots(figsize=(12, 7))\r
\r
    continentColors = {'Asia': '#E74C3C', 'Europe': '#3498DB', 'Africa': '#27AE60',\r
                      'Americas': '#9B59B6', 'Oceania': '#F39C12'}\r
\r
    for continent in continentColors:\r
        subset = gapminder2007[gapminder2007['continent'] == continent]\r
        axInset.scatter(subset['gdpPercap'], subset['lifeExp'],\r
                       s=subset['pop']/1e6, c=continentColors[continent],\r
                       alpha=0.6, label=continent, edgecolors='white')\r
\r
    axInset.set_xlabel('1인당 GDP ($)', fontsize=11)\r
    axInset.set_ylabel('기대수명 (세)', fontsize=11)\r
    axInset.set_title('국가별 경제수준과 기대수명 (2007)', fontsize=14, fontweight='bold')\r
    axInset.legend(loc='lower right')\r
    axInset.set_xlim(0, 50000)\r
    figInset\r
  exercise:\r
    prompt: 3단계. 인셋 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figInset, axInset = plt.subplots(figsize=(12, 7))\r
\r
      continentColors = {'Asia': '#E74C3C', 'Europe': '#3498DB', 'Africa': '#27AE60',\r
                        'Americas': '#9B59B6', 'Oceania': '#F39C12'}\r
\r
      for continent in continentColors:\r
          subset = gapminder2007[gapminder2007['continent'] == continent]\r
          axInset.scatter(subset['gdpPercap'], subset['lifeExp'],\r
                         s=subset['pop']/1e6, c=continentColors[continent],\r
                         alpha=0.6, label=continent, edgecolors='white')\r
\r
      axInset.set_xlabel('1인당 GDP ($)', fontsize=11)\r
      axInset.set_ylabel('기대수명 (세)', fontsize=11)\r
      axInset.set_title('국가별 경제수준과 기대수명 (2007)', fontsize=14, fontweight='bold')\r
      axInset.legend(loc='lower right')\r
      axInset.set_xlim(0, 50000)\r
      figInset\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 인셋 차트의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 3단계. 인셋 차트 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step4_normalize\r
  title: 4단계. 색상 정규화\r
  structuredPrimary: true\r
  subtitle: Normalize\r
  goal: 4단계. 색상 정규화에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    Normalize는 데이터 값을 0~1 범위로 변환하여 컬러맵에 매핑합니다. 연속적인 값에 따라 색상이 변하는 차트를 만들 때 사용합니다. 로그 스케일에는 LogNorm을 사용합니다.\r
\r
    Normalize(vmin, vmax)로 데이터 범위를 0~1로 매핑합니다. scatter의 c 파라미터에 연속값을 전달하고, cmap과 norm을 함께 사용합니다. LogNorm은 로그 스케일 데이터에 적합합니다. BoundaryNorm은 구간별 색상 매핑에 사용합니다.\r
  tips:\r
  - Normalize(vmin, vmax)로 데이터 범위를 0~1로 매핑합니다. scatter의 c 파라미터에 연속값을 전달하고, cmap과 norm을 함께 사용합니다. LogNorm은\r
    로그 스케일 데이터에 적합합니다. BoundaryNorm은 구간별 색상 매핑에 사용합니다.\r
  snippet: |-\r
    figNorm, axNorm = plt.subplots(figsize=(12, 7))\r
\r
    norm = Normalize(vmin=gapminder2007['lifeExp'].min(),\r
                    vmax=gapminder2007['lifeExp'].max())\r
    cmap = cm.RdYlGn\r
\r
    scatter = axNorm.scatter(gapminder2007['gdpPercap'], gapminder2007['pop']/1e6,\r
                            s=100, c=gapminder2007['lifeExp'],\r
                            cmap=cmap, norm=norm, alpha=0.7, edgecolors='white')\r
\r
    cbar = plt.colorbar(scatter, ax=axNorm)\r
    cbar.set_label('기대수명 (세)', fontsize=11)\r
\r
    axNorm.set_xlabel('1인당 GDP ($)', fontsize=11)\r
    axNorm.set_ylabel('인구 (백만 명)', fontsize=11)\r
    axNorm.set_title('GDP, 인구, 기대수명의 관계', fontsize=14, fontweight='bold')\r
    axNorm.set_xscale('log')\r
    axNorm.set_yscale('log')\r
\r
    figNorm\r
  exercise:\r
    prompt: 4단계. 색상 정규화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figNorm, axNorm = plt.subplots(figsize=(12, 7))\r
\r
      norm = Normalize(vmin=gapminder2007['lifeExp'].min(),\r
                      vmax=gapminder2007['lifeExp'].max())\r
      cmap = cm.RdYlGn\r
\r
      scatter = axNorm.scatter(gapminder2007['gdpPercap'], gapminder2007['pop']/1e6,\r
                              s=100, c=gapminder2007['lifeExp'],\r
                              cmap=cmap, norm=norm, alpha=0.7, edgecolors='white')\r
\r
      cbar = plt.colorbar(scatter, ax=axNorm)\r
      cbar.set_label('기대수명 (세)', fontsize=11)\r
\r
      axNorm.set_xlabel('1인당 GDP ($)', fontsize=11)\r
      axNorm.set_ylabel('인구 (백만 명)', fontsize=11)\r
      axNorm.set_title('GDP, 인구, 기대수명의 관계', fontsize=14, fontweight='bold')\r
      axNorm.set_xscale('log')\r
      axNorm.set_yscale('log')\r
\r
      figNorm\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 색상 정규화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 색상 정규화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_multi_panel\r
  title: 5단계. 6패널 레이아웃\r
  structuredPrimary: true\r
  subtitle: GridSpec 복잡 레이아웃\r
  goal: 5단계. 6패널 레이아웃에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: GridSpec으로 6개 패널을 배치합니다. 상단에 큰 메인 차트, 하단에 작은 보조 차트들을 배치하는 비대칭 레이아웃을 구성합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figLayout = plt.figure(figsize=(18, 12))\r
    gs = GridSpec(3, 4, figure=figLayout, height_ratios=[1.5, 1, 1],\r
                 hspace=0.35, wspace=0.3)\r
\r
    axMain = figLayout.add_subplot(gs[0, :3])\r
    axSide = figLayout.add_subplot(gs[0, 3])\r
    axBot1 = figLayout.add_subplot(gs[1, 0:2])\r
    axBot2 = figLayout.add_subplot(gs[1, 2:4])\r
    axBot3 = figLayout.add_subplot(gs[2, 0:2])\r
    axBot4 = figLayout.add_subplot(gs[2, 2:4])\r
\r
    for ax, title in zip([axMain, axSide, axBot1, axBot2, axBot3, axBot4],\r
                         ['메인', '사이드', '하단1', '하단2', '하단3', '하단4']):\r
        ax.set_title(title, fontsize=12)\r
        ax.spines['top'].set_visible(False)\r
        ax.spines['right'].set_visible(False)\r
\r
    figLayout.suptitle('6패널 분석 리포트 레이아웃', fontsize=16, fontweight='bold')\r
    figLayout\r
  exercise:\r
    prompt: 5단계. 6패널 레이아웃 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figLayout = plt.figure(figsize=(18, 12))\r
      gs = GridSpec(3, 4, figure=figLayout, height_ratios=[1.5, 1, 1],\r
                   hspace=0.35, wspace=0.3)\r
\r
      axMain = figLayout.add_subplot(gs[0, :3])\r
      axSide = figLayout.add_subplot(gs[0, 3])\r
      axBot1 = figLayout.add_subplot(gs[1, 0:2])\r
      axBot2 = figLayout.add_subplot(gs[1, 2:4])\r
      axBot3 = figLayout.add_subplot(gs[2, 0:2])\r
      axBot4 = figLayout.add_subplot(gs[2, 2:4])\r
\r
      for ax, title in zip([axMain, axSide, axBot1, axBot2, axBot3, axBot4],\r
                           ['메인', '사이드', '하단1', '하단2', '하단3', '하단4']):\r
          ax.set_title(title, fontsize=12)\r
          ax.spines['top'].set_visible(False)\r
          ax.spines['right'].set_visible(False)\r
\r
      figLayout.suptitle('6패널 분석 리포트 레이아웃', fontsize=16, fontweight='bold')\r
      figLayout\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 6패널 레이아웃의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 5단계. 6패널 레이아웃 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step6_main_chart\r
  title: 6단계. 메인 차트\r
  structuredPrimary: true\r
  subtitle: 시계열 + 이벤트\r
  goal: 6단계. 메인 차트에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 메인 차트에 시계열 데이터와 중요 이벤트를 표시합니다. fill_between으로 영역을 강조하고, annotate로 주요 포인트를 설명합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    years = gapminder[gapminder['country'] == 'Korea, Rep.']['year'].values\r
    koreaGdp = gapminder[gapminder['country'] == 'Korea, Rep.']['gdpPercap'].values\r
    koreaLife = gapminder[gapminder['country'] == 'Korea, Rep.']['lifeExp'].values\r
\r
    figMain, axMain = plt.subplots(figsize=(14, 6))\r
    axMain.fill_between(years, koreaGdp, alpha=0.3, color='#3498DB')\r
    axMain.plot(years, koreaGdp, 'o-', color='#2C3E50', linewidth=2, markersize=8, label='1인당 GDP')\r
    axMain.set_ylabel('1인당 GDP ($)', fontsize=11, color='#3498DB')\r
    axMain.tick_params(axis='y', labelcolor='#3498DB')\r
    figMain\r
  exercise:\r
    prompt: 6단계. 메인 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      years = gapminder[gapminder['country'] == 'Korea, Rep.']['year'].values\r
      koreaGdp = gapminder[gapminder['country'] == 'Korea, Rep.']['gdpPercap'].values\r
      koreaLife = gapminder[gapminder['country'] == 'Korea, Rep.']['lifeExp'].values\r
\r
      figMain, axMain = plt.subplots(figsize=(14, 6))\r
      axMain.fill_between(years, koreaGdp, alpha=0.3, color='#3498DB')\r
      axMain.plot(years, koreaGdp, 'o-', color='#2C3E50', linewidth=2, markersize=8, label='1인당 GDP')\r
      axMain.set_ylabel('1인당 GDP ($)', fontsize=11, color='#3498DB')\r
      axMain.tick_params(axis='y', labelcolor='#3498DB')\r
      figMain\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 메인 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 메인 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_side_chart\r
  title: 7단계. 사이드 차트\r
  structuredPrimary: true\r
  subtitle: 파이 + 통계\r
  goal: 7단계. 사이드 차트에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 사이드 패널에 비율을 보여주는 파이 차트와 LaTeX로 표현된 통계 정보를 추가합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figSide, (axPie, axStats) = plt.subplots(2, 1, figsize=(6, 10))\r
\r
    continentPop = gapminder2007.groupby('continent')['pop'].sum()\r
    colors = ['#E74C3C', '#3498DB', '#27AE60', '#9B59B6', '#F39C12']\r
    explode = (0, 0, 0.05, 0, 0)\r
\r
    axPie.pie(continentPop, labels=continentPop.index, autopct='%1.1f%%',\r
             colors=colors, explode=explode, shadow=True, startangle=90)\r
    axPie.set_title('대륙별 인구 비율 (2007)', fontsize=12, fontweight='bold')\r
    figSide\r
  exercise:\r
    prompt: 7단계. 사이드 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figSide, (axPie, axStats) = plt.subplots(2, 1, figsize=(6, 10))\r
\r
      continentPop = gapminder2007.groupby('continent')['pop'].sum()\r
      colors = ['#E74C3C', '#3498DB', '#27AE60', '#9B59B6', '#F39C12']\r
      explode = (0, 0, 0.05, 0, 0)\r
\r
      axPie.pie(continentPop, labels=continentPop.index, autopct='%1.1f%%',\r
               colors=colors, explode=explode, shadow=True, startangle=90)\r
      axPie.set_title('대륙별 인구 비율 (2007)', fontsize=12, fontweight='bold')\r
      figSide\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 사이드 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 사이드 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_bottom_charts\r
  title: 8단계. 하단 차트들\r
  structuredPrimary: true\r
  subtitle: 히스토그램, 박스플롯, 히트맵\r
  goal: 8단계. 하단 차트들에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 하단 패널에 다양한 차트 유형을 배치합니다. 히스토그램으로 분포를, 박스플롯으로 그룹별 비교를, 히트맵으로 상관관계를 시각화합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figBottom, axes = plt.subplots(2, 2, figsize=(14, 10))\r
    axHist, axBox, axHeat, axError = axes.flatten()\r
  exercise:\r
    prompt: 8단계. 하단 차트들 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBottom, axes = plt.subplots(2, 2, figsize=(14, 10))\r
      axHist, axBox, axHeat, axError = axes.flatten()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 하단 차트들의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 하단 차트들 실행 결과가 축/범례/파일 출력 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step9_savefig\r
  title: 9단계. 이미지 저장\r
  structuredPrimary: true\r
  subtitle: savefig\r
  goal: 9단계. 이미지 저장에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    savefig로 차트를 이미지 파일로 저장합니다. dpi로 해상도를, bbox_inches로 여백을, transparent로 배경 투명도를 설정합니다. 논문이나 보고서용 고품질 이미지를 생성할 수 있습니다.\r
\r
    fig.savefig('파일명.png', dpi=300, bbox_inches='tight')로 저장합니다. dpi는 해상도(논문용 300, 웹용 72-150). bbox_inches='tight'는 여백을 자동 조절합니다. format='pdf', 'svg', 'eps' 등 다양한 형식을 지원합니다. facecolor와 transparent로 배경을 설정합니다.\r
  tips:\r
  - fig.savefig('파일명.png', dpi=300, bbox_inches='tight')로 저장합니다. dpi는 해상도(논문용 300, 웹용 72-150). bbox_inches='tight'는\r
    여백을 자동 조절합니다. format='pdf', 'svg', 'eps' 등 다양한 형식을 지원합니다. facecolor와 transparent로 배경을 설정합니다.\r
  snippet: |-\r
    figSave, axSave = plt.subplots(figsize=(10, 6))\r
\r
    axSave.bar(['A', 'B', 'C', 'D'], [25, 40, 30, 55],\r
              color=['#E74C3C', '#3498DB', '#27AE60', '#9B59B6'])\r
    axSave.set_title('저장 테스트 차트', fontsize=14, fontweight='bold')\r
    axSave.spines['top'].set_visible(False)\r
    axSave.spines['right'].set_visible(False)\r
\r
    figSave\r
  exercise:\r
    prompt: 9단계. 이미지 저장 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figSave, axSave = plt.subplots(figsize=(10, 6))\r
\r
      axSave.bar(['A', 'B', 'C', 'D'], [25, 40, 30, 55],\r
                color=['#E74C3C', '#3498DB', '#27AE60', '#9B59B6'])\r
      axSave.set_title('저장 테스트 차트', fontsize=14, fontweight='bold')\r
      axSave.spines['top'].set_visible(False)\r
      axSave.spines['right'].set_visible(False)\r
\r
      figSave\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 이미지 저장의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 이미지 저장의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_final\r
  title: 10단계. 최종 리포트\r
  structuredPrimary: true\r
  subtitle: 모든 개념 종합\r
  goal: 10단계. 최종 리포트에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 개념을 종합하여 완성도 높은 6패널 분석 리포트를 만듭니다. 각 패널은 서로 다른 인사이트를 제공하며, 전체적으로 일관된 스타일을 유지합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figReport = plt.figure(figsize=(20, 14))\r
    gs = GridSpec(3, 4, figure=figReport, height_ratios=[1.3, 1, 1],\r
                 hspace=0.4, wspace=0.35)\r
  exercise:\r
    prompt: 10단계. 최종 리포트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figReport = plt.figure(figsize=(20, 14))\r
      gs = GridSpec(3, 4, figure=figReport, height_ratios=[1.3, 1, 1],\r
                   hspace=0.4, wspace=0.35)\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 최종 리포트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 최종 리포트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 종합 프로젝트\r
  goal: 실습에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 모든 개념을 활용해서 나만의 종합 분석 리포트를 만들어봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    from matplotlib.gridspec import GridSpec\r
    from mpl_toolkits.axes_grid1.inset_locator import inset_axes\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import numpy as np\r
\r
    data = loadLocalDataset('penguins').dropna()\r
\r
    chart = plt.figure(figsize=(16, 12))\r
    grid = GridSpec(2, 3, figure=chart, hspace=0.35, wspace=0.3)\r
\r
    palette = {'Adelie': '#E74C3C', 'Chinstrap': '#27AE60', 'Gentoo': '#3498DB'}\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      from matplotlib.gridspec import GridSpec\r
      from mpl_toolkits.axes_grid1.inset_locator import inset_axes\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import numpy as np\r
\r
      data = loadLocalDataset('penguins').dropna()\r
\r
      chart = plt.figure(figsize=(16, 12))\r
      grid = GridSpec(2, 3, figure=chart, hspace=0.35, wspace=0.3)\r
\r
      palette = {'Adelie': '#E74C3C', 'Chinstrap': '#27AE60', 'Gentoo': '#3498DB'}\r
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
    content: Matplotlib의 모든 개념을 종합하여 6패널 분석 리포트를 만들었습니다.\r
  - type: list\r
    items:\r
    - inset_axes(ax, width, height, loc) - 인셋 차트 추가\r
    - Normalize(vmin, vmax) - 연속값을 0~1로 정규화\r
    - GridSpec으로 복잡한 비대칭 레이아웃 구성\r
    - 여러 차트 유형 조합 (scatter, bar, hist, box, violin, pie, heatmap)\r
    - annotate, LaTeX, bbox로 전문적인 주석 추가\r
    - errorbar로 불확실성 표현\r
    - fill_between으로 영역 강조\r
    - twinx로 이중 축 차트 생성\r
    - fig.savefig(path, dpi, bbox_inches) - 고품질 이미지 저장\r
  - type: text\r
    content: Matplotlib 커리큘럼을 완료했습니다. 이제 논문, 보고서, 프레젠테이션에 사용할 수 있는 전문적인 시각화를 만들 수 있습니다.\r
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