var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - seaborn\r
  id: matplotlib_06\r
  title: 상관관계히트맵\r
  order: 6\r
  category: matplotlib\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - matplotlib\r
  - imshow\r
  - cmap\r
  - colorbar\r
  - heatmap\r
  - correlation\r
  seo:\r
    title: Matplotlib 히트맵 - 변수 간 상관관계 시각화\r
    description: Matplotlib으로 iris 데이터의 상관관계를 히트맵으로 시각화합니다. imshow, cmap, colorbar, text 사용법을 배웁니다.\r
    keywords:\r
    - matplotlib\r
    - heatmap\r
    - imshow\r
    - colorbar\r
    - 상관관계\r
    - correlation\r
intro:\r
  emoji: 🔥\r
  goal: 변수 간 상관관계를 히트맵으로 시각화합니다.\r
  description: 히트맵은 행렬 데이터를 색상으로 표현하는 차트입니다. 상관관계 분석에서 어떤 변수들이 관련성이 높은지 한눈에 파악할 수 있습니다. 이전에 배운 plot, hist,\r
    scatter, bar, boxplot, subplots, text 개념을 함께 활용합니다.\r
  direction: 상관관계히트맵에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.\r
  benefits:\r
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 상관관계히트맵 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 11단계. 한글 폰트 설정 처리 실행\r
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 2단계. 데이터 로드 및 상관 결과 검증\r
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.\r
    - label: 상관관계히트맵 재사용\r
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 시각 리포트 환경\r
      detail: matplotlib, numpy, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 상관관계히트맵 실행\r
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.\r
    - label: 상관관계히트맵 완료\r
      detail: 검증된 코드를 보고서 차트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    iris 데이터의 4가지 수치형 변수(꽃받침 길이/너비, 꽃잎 길이/너비) 간의 상관관계를 분석합니다. 상관계수는 -1에서 1 사이의 값으로, 1에 가까울수록 강한 양의 상관, -1에 가까울수록 강한 음의 상관을 나타냅니다.\r
\r
    import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. seaborn은 sns로, numpy는 np로 줄여 쓰는 것이 데이터 과학 커뮤니티의 표준입니다.\r
  tips:\r
  - import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. seaborn은 sns로, numpy는\r
    np로 줄여 쓰는 것이 데이터 과학 커뮤니티의 표준입니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import numpy as np\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
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
  title: 2단계. 데이터 로드 및 상관행렬\r
  structuredPrimary: true\r
  subtitle: corr()\r
  goal: 2단계. 데이터 로드 및 상관행렬에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: iris 데이터를 불러오고 수치형 컬럼만 선택하여 상관행렬을 계산합니다. pandas의 corr() 메서드는 피어슨 상관계수를 계산합니다. 결과는 4x4 대칭\r
    행렬로, 대각선은 항상 1입니다(자기 자신과의 상관).\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    iris = loadLocalDataset('iris')\r
    numericCols = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width']\r
    corrMatrix = iris[numericCols].corr()\r
    corrMatrix\r
  exercise:\r
    prompt: 2단계. 데이터 로드 및 상관행렬 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      iris = loadLocalDataset('iris')\r
      numericCols = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width']\r
      corrMatrix = iris[numericCols].corr()\r
      corrMatrix\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 로드 및 상관행렬의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 로드 및 상관행렬의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_imshow\r
  title: 3단계. 기본 히트맵\r
  structuredPrimary: true\r
  subtitle: ax.imshow()\r
  goal: 3단계. 기본 히트맵에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    imshow()는 2차원 배열을 이미지로 표시하는 함수입니다. 상관행렬을 imshow()에 전달하면 각 셀의 값에 따라 색상이 지정됩니다. 기본 컬러맵은 viridis로, 낮은 값은 보라색, 높은 값은 노란색으로 표시됩니다.\r
\r
    ax.imshow(2D배열)로 히트맵을 그립니다. 반환값(im)은 이미지 객체로, 나중에 컬러바를 추가할 때 사용합니다. 기본적으로 배열의 값 범위에 맞춰 색상이 자동으로 매핑됩니다.\r
  snippet: |-\r
    figHeat, axHeat = plt.subplots(figsize=(8, 6))\r
    im = axHeat.imshow(corrMatrix)\r
    axHeat.set_title('Iris 변수 간 상관관계', fontsize=14)\r
    figHeat\r
  exercise:\r
    prompt: 3단계. 기본 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHeat, axHeat = plt.subplots(figsize=(8, 6))\r
      im = axHeat.imshow(corrMatrix)\r
      axHeat.set_title('Iris 변수 간 상관관계', fontsize=14)\r
      figHeat\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 기본 히트맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 기본 히트맵의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step4_cmap\r
  title: 4단계. 컬러맵 설정\r
  structuredPrimary: true\r
  subtitle: cmap 파라미터\r
  goal: 4단계. 컬러맵 설정에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    컬러맵(colormap)은 수치를 색상으로 변환하는 규칙입니다. 상관관계에는 발산형(diverging) 컬러맵이 적합합니다. 'coolwarm'은 음수는 파란색, 양수는 빨간색으로 표시하여 상관관계의 방향을 직관적으로 보여줍니다.\r
\r
    cmap으로 컬러맵을 지정합니다. 상관관계에 적합한 발산형 컬러맵: 'coolwarm', 'RdBu_r', 'seismic'. vmin, vmax로 색상 매핑 범위를 지정합니다. 상관계수는 -1~1이므로 vmin=-1, vmax=1로 설정합니다.\r
  tips:\r
  - 'cmap으로 컬러맵을 지정합니다. 상관관계에 적합한 발산형 컬러맵: ''coolwarm'', ''RdBu_r'', ''seismic''. vmin, vmax로 색상 매핑 범위를\r
    지정합니다. 상관계수는 -1~1이므로 vmin=-1, vmax=1로 설정합니다.'\r
  snippet: |-\r
    figCmap, axCmap = plt.subplots(figsize=(8, 6))\r
    im = axCmap.imshow(corrMatrix, cmap='coolwarm', vmin=-1, vmax=1)\r
    axCmap.set_title('Iris 변수 간 상관관계', fontsize=14)\r
    figCmap\r
  exercise:\r
    prompt: 4단계. 컬러맵 설정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figCmap, axCmap = plt.subplots(figsize=(8, 6))\r
      im = axCmap.imshow(corrMatrix, cmap='coolwarm', vmin=-1, vmax=1)\r
      axCmap.set_title('Iris 변수 간 상관관계', fontsize=14)\r
      figCmap\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 컬러맵 설정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 컬러맵 설정의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_colorbar\r
  title: 5단계. 컬러바 추가\r
  structuredPrimary: true\r
  subtitle: plt.colorbar()\r
  goal: 5단계. 컬러바 추가에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    컬러바는 색상과 수치의 관계를 보여주는 범례입니다. 히트맵을 해석할 때 어떤 색이 어떤 값을 나타내는지 알 수 있습니다. plt.colorbar()에 이미지 객체와 축을 전달하여 추가합니다.\r
\r
    plt.colorbar(im, ax=ax)로 컬러바를 추가합니다. im은 imshow()의 반환값, ax는 히트맵이 그려진 축입니다. label로 컬러바 제목을 설정합니다. shrink 파라미터로 컬러바 크기를 조절할 수 있습니다.\r
  tips:\r
  - plt.colorbar(im, ax=ax)로 컬러바를 추가합니다. im은 imshow()의 반환값, ax는 히트맵이 그려진 축입니다. label로 컬러바 제목을 설정합니다. shrink\r
    파라미터로 컬러바 크기를 조절할 수 있습니다.\r
  snippet: |-\r
    figColorbar, axColorbar = plt.subplots(figsize=(9, 6))\r
    im = axColorbar.imshow(corrMatrix, cmap='coolwarm', vmin=-1, vmax=1)\r
    plt.colorbar(im, ax=axColorbar, label='상관계수')\r
    axColorbar.set_title('Iris 변수 간 상관관계', fontsize=14)\r
    figColorbar\r
  exercise:\r
    prompt: 5단계. 컬러바 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figColorbar, axColorbar = plt.subplots(figsize=(9, 6))\r
      im = axColorbar.imshow(corrMatrix, cmap='coolwarm', vmin=-1, vmax=1)\r
      plt.colorbar(im, ax=axColorbar, label='상관계수')\r
      axColorbar.set_title('Iris 변수 간 상관관계', fontsize=14)\r
      figColorbar\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 컬러바 추가의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 컬러바 추가의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_ticks\r
  title: 6단계. 축 눈금 설정\r
  structuredPrimary: true\r
  subtitle: set_xticks(), set_xticklabels()\r
  goal: 6단계. 축 눈금 설정에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    히트맵의 x축과 y축에 변수명을 표시해야 어떤 변수 간의 상관관계인지 알 수 있습니다. set_xticks()로 눈금 위치를 설정하고, set_xticklabels()로 라벨을 지정합니다. 한글 라벨로 변경하면 가독성이 높아집니다.\r
\r
    set_xticks(range(n))로 0, 1, 2, ...의 위치에 눈금을 설정합니다. set_xticklabels(리스트)로 각 눈금에 표시할 텍스트를 지정합니다. 라벨에 줄바꿈(\\\\n)을 사용하면 긴 라벨도 깔끔하게 표시됩니다.\r
  tips:\r
  - set_xticks(range(n))로 0, 1, 2, ...의 위치에 눈금을 설정합니다. set_xticklabels(리스트)로 각 눈금에 표시할 텍스트를 지정합니다. 라벨에\r
    줄바꿈(\\\\n)을 사용하면 긴 라벨도 깔끔하게 표시됩니다.\r
  snippet: |-\r
    figTicks, axTicks = plt.subplots(figsize=(9, 7))\r
    im = axTicks.imshow(corrMatrix, cmap='coolwarm', vmin=-1, vmax=1)\r
    plt.colorbar(im, ax=axTicks, label='상관계수')\r
    figTicks\r
  exercise:\r
    prompt: 6단계. 축 눈금 설정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figTicks, axTicks = plt.subplots(figsize=(9, 7))\r
      im = axTicks.imshow(corrMatrix, cmap='coolwarm', vmin=-1, vmax=1)\r
      plt.colorbar(im, ax=axTicks, label='상관계수')\r
      figTicks\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 축 눈금 설정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 축 눈금 설정의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_text\r
  title: 7단계. 셀에 값 표시\r
  structuredPrimary: true\r
  subtitle: ax.text()\r
  goal: 7단계. 셀에 값 표시에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 각 셀에 상관계수 값을 직접 표시하면 정확한 수치를 파악할 수 있습니다. 이중 for 루프로 모든 셀을 순회하며 text()로 값을 추가합니다. 배경색에 따라\r
    텍스트 색상을 조절하면 가독성이 높아집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figText, axText = plt.subplots(figsize=(9, 7))\r
    im = axText.imshow(corrMatrix, cmap='coolwarm', vmin=-1, vmax=1)\r
    plt.colorbar(im, ax=axText, label='상관계수')\r
\r
    labelsKr = ['꽃받침\\n길이', '꽃받침\\n너비', '꽃잎\\n길이', '꽃잎\\n너비']\r
    axText.set_xticks(range(len(labelsKr)))\r
    axText.set_yticks(range(len(labelsKr)))\r
    axText.set_xticklabels(labelsKr)\r
    axText.set_yticklabels(labelsKr)\r
    figText\r
  exercise:\r
    prompt: 7단계. 셀에 값 표시 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figText, axText = plt.subplots(figsize=(9, 7))\r
      im = axText.imshow(corrMatrix, cmap='coolwarm', vmin=-1, vmax=1)\r
      plt.colorbar(im, ax=axText, label='상관계수')\r
\r
      labelsKr = ['꽃받침\\n길이', '꽃받침\\n너비', '꽃잎\\n길이', '꽃잎\\n너비']\r
      axText.set_xticks(range(len(labelsKr)))\r
      axText.set_yticks(range(len(labelsKr)))\r
      axText.set_xticklabels(labelsKr)\r
      axText.set_yticklabels(labelsKr)\r
      figText\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 셀에 값 표시의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 셀에 값 표시의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_annotate\r
  title: 8단계. 상관관계 해석\r
  structuredPrimary: true\r
  subtitle: 패턴 분석\r
  goal: 8단계. 상관관계 해석에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 히트맵에서 발견한 패턴을 해석합니다. 꽃잎 길이와 너비는 0.96으로 매우 강한 양의 상관관계를 보입니다. 반면 꽃받침 너비는 다른 변수와 약한 상관(음의\r
    상관도 있음)을 보입니다. 이런 정보는 머신러닝에서 특성 선택에 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figHighlight, axHighlight = plt.subplots(figsize=(9, 7))\r
    im = axHighlight.imshow(corrMatrix, cmap='coolwarm', vmin=-1, vmax=1)\r
    plt.colorbar(im, ax=axHighlight, label='상관계수')\r
\r
    labelsKr = ['꽃받침\\n길이', '꽃받침\\n너비', '꽃잎\\n길이', '꽃잎\\n너비']\r
    axHighlight.set_xticks(range(len(labelsKr)))\r
    axHighlight.set_yticks(range(len(labelsKr)))\r
    axHighlight.set_xticklabels(labelsKr)\r
    axHighlight.set_yticklabels(labelsKr)\r
    figHighlight\r
  exercise:\r
    prompt: 8단계. 상관관계 해석 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHighlight, axHighlight = plt.subplots(figsize=(9, 7))\r
      im = axHighlight.imshow(corrMatrix, cmap='coolwarm', vmin=-1, vmax=1)\r
      plt.colorbar(im, ax=axHighlight, label='상관계수')\r
\r
      labelsKr = ['꽃받침\\n길이', '꽃받침\\n너비', '꽃잎\\n길이', '꽃잎\\n너비']\r
      axHighlight.set_xticks(range(len(labelsKr)))\r
      axHighlight.set_yticks(range(len(labelsKr)))\r
      axHighlight.set_xticklabels(labelsKr)\r
      axHighlight.set_yticklabels(labelsKr)\r
      figHighlight\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 상관관계 해석의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 상관관계 해석의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_subplots\r
  title: 9단계. 상관관계 + 산점도 비교\r
  structuredPrimary: true\r
  subtitle: 시각화 조합\r
  goal: 9단계. 상관관계 + 산점도 비교에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 히트맵에서 발견한 강한 상관관계(꽃잎 길이-너비)를 산점도로 확인합니다. 이전에 배운 산점도 기법을 활용하여 실제 데이터 포인트가 어떻게 분포하는지 봅니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figCombine, (axHeatCombine, axScatterCombine) = plt.subplots(1, 2, figsize=(14, 6))\r
\r
    im = axHeatCombine.imshow(corrMatrix, cmap='coolwarm', vmin=-1, vmax=1)\r
    plt.colorbar(im, ax=axHeatCombine, label='상관계수', shrink=0.8)\r
    labelsKr = ['꽃받침\\n길이', '꽃받침\\n너비', '꽃잎\\n길이', '꽃잎\\n너비']\r
    axHeatCombine.set_xticks(range(len(labelsKr)))\r
    axHeatCombine.set_yticks(range(len(labelsKr)))\r
    axHeatCombine.set_xticklabels(labelsKr)\r
    axHeatCombine.set_yticklabels(labelsKr)\r
    figCombine\r
  exercise:\r
    prompt: 9단계. 상관관계 + 산점도 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figCombine, (axHeatCombine, axScatterCombine) = plt.subplots(1, 2, figsize=(14, 6))\r
\r
      im = axHeatCombine.imshow(corrMatrix, cmap='coolwarm', vmin=-1, vmax=1)\r
      plt.colorbar(im, ax=axHeatCombine, label='상관계수', shrink=0.8)\r
      labelsKr = ['꽃받침\\n길이', '꽃받침\\n너비', '꽃잎\\n길이', '꽃잎\\n너비']\r
      axHeatCombine.set_xticks(range(len(labelsKr)))\r
      axHeatCombine.set_yticks(range(len(labelsKr)))\r
      axHeatCombine.set_xticklabels(labelsKr)\r
      axHeatCombine.set_yticklabels(labelsKr)\r
      figCombine\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 상관관계 + 산점도 비교의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 상관관계 + 산점도 비교의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_final\r
  title: 10단계. 최종 시각화\r
  structuredPrimary: true\r
  subtitle: 완성된 히트맵\r
  goal: 10단계. 최종 시각화에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 요소를 종합하여 완성도 높은 상관관계 히트맵을 만듭니다. 깔끔한 스타일링과 명확한 라벨로 전문적인 분석 결과물을 완성합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal, axFinal = plt.subplots(figsize=(10, 8))\r
\r
    im = axFinal.imshow(corrMatrix, cmap='RdBu_r', vmin=-1, vmax=1)\r
    cbar = plt.colorbar(im, ax=axFinal, shrink=0.8)\r
    cbar.set_label('피어슨 상관계수', fontsize=11)\r
    figFinal\r
  exercise:\r
    prompt: 10단계. 최종 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal, axFinal = plt.subplots(figsize=(10, 8))\r
\r
      im = axFinal.imshow(corrMatrix, cmap='RdBu_r', vmin=-1, vmax=1)\r
      cbar = plt.colorbar(im, ax=axFinal, shrink=0.8)\r
      cbar.set_label('피어슨 상관계수', fontsize=11)\r
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
  subtitle: 상관관계 분석 프로젝트\r
  goal: 실습에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 내용을 활용해서 다양한 데이터의 상관관계를 분석해봅시다. imshow, cmap, colorbar, text 등 모든 개념을 종합적으로 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    penguins = loadLocalDataset('penguins').dropna()\r
    measureCols = ['bill_length_mm', 'bill_depth_mm', 'flipper_length_mm', 'body_mass_g']\r
    matrix = penguins[measureCols].corr()\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      penguins = loadLocalDataset('penguins').dropna()\r
      measureCols = ['bill_length_mm', 'bill_depth_mm', 'flipper_length_mm', 'body_mass_g']\r
      matrix = penguins[measureCols].corr()\r
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
    content: 히트맵으로 변수 간 상관관계를 분석했습니다.\r
  - type: list\r
    items:\r
    - ax.imshow(2D배열) - 행렬 데이터를 히트맵으로 시각화\r
    - cmap='coolwarm' - 발산형 컬러맵으로 양/음의 상관 구분\r
    - vmin, vmax - 색상 매핑 범위 설정\r
    - plt.colorbar(im, ax) - 색상 범례 추가\r
    - set_xticks(), set_xticklabels() - 축 눈금과 라벨 설정\r
    - ax.text() - 셀에 값 표시\r
    - df.corr() - pandas 상관행렬 계산\r
  - type: text\r
    content: 다음 시간에는 이중 축 차트로 시계열 데이터를 분석합니다.\r
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