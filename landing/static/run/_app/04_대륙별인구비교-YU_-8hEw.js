var e=`meta:\r
  packages:\r
  - matplotlib\r
  - pandas\r
  id: matplotlib_04\r
  title: 대륙별인구비교\r
  order: 4\r
  category: matplotlib\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - matplotlib\r
  - bar\r
  - barh\r
  - xticks\r
  - annotate\r
  - gapminder\r
  seo:\r
    title: Matplotlib 막대 그래프 - 대륙별 인구 비교\r
    description: Matplotlib으로 gapminder 데이터의 대륙별 인구를 막대 그래프로 시각화합니다. bar, barh, xticks, annotate 사용법을\r
      배웁니다.\r
    keywords:\r
    - matplotlib\r
    - bar\r
    - 막대그래프\r
    - gapminder\r
    - annotate\r
    - 인구\r
intro:\r
  emoji: 🌍\r
  goal: 대륙별 인구를 막대 그래프로 비교 분석합니다.\r
  description: 막대 그래프로 카테고리별 수치를 비교하고, annotate로 주석을 추가합니다. 이전에 배운 plot, hist, scatter, subplots 개념을 함께\r
    활용합니다.\r
  direction: 대륙별인구비교에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.\r
  benefits:\r
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 대륙별인구비교 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 11단계. 한글 폰트 설정 처리 실행\r
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 2단계. 데이터 로드 결과 검증\r
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.\r
    - label: 대륙별인구비교 재사용\r
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 시각 리포트 환경\r
      detail: matplotlib, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 대륙별인구비교 실행\r
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.\r
    - label: 대륙별인구비교 완료\r
      detail: 검증된 코드를 보고서 차트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    gapminder 데이터를 사용하여 대륙별 인구를 분석합니다. 이 데이터는 세계 각국의 발전 지표를 담고 있으며, Codaro 로컬 데이터셋에서 직접 불러와 인터넷 연결 없이 실행할 수 있습니다.\r
\r
    import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. pandas는 pd로 줄여 쓰는 것이 데이터 과학 커뮤니티의 표준입니다.\r
  tips:\r
  - import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. pandas는 pd로 줄여 쓰는\r
    것이 데이터 과학 커뮤니티의 표준입니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
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
  title: 2단계. 데이터 로드\r
  structuredPrimary: true\r
  subtitle: Codaro 로컬 데이터셋에서 로드\r
  goal: 2단계. 데이터 로드에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: gapminder 데이터를 Codaro 로컬 데이터셋에서 불러옵니다. 이 데이터는 세계 각국의 기대수명, 인구, GDP 정보를 담고 있어 대륙별 비교 연습에\r
    적합합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    gapminder = loadLocalDataset("gapminder")\r
    gapminder.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      gapminder = loadLocalDataset("gapminder")\r
      gapminder.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_filter\r
  title: 3단계. 2007년 데이터 필터링\r
  structuredPrimary: true\r
  subtitle: 최근 연도 선택\r
  goal: 3단계. 2007년 데이터 필터링에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 대륙별 비교를 위해 가장 최근 연도인 2007년 데이터만 추출합니다. 불리언 인덱싱으로 year 컬럼이 2007인 행만 선택합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    data2007 = gapminder[gapminder['year'] == 2007]\r
    data2007.shape\r
  exercise:\r
    prompt: 3단계. 2007년 데이터 필터링 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      data2007 = gapminder[gapminder['year'] == 2007]\r
      data2007.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 2007년 데이터 필터링에서 \`data2007\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 2007년 데이터 필터링 실행 뒤 \`data2007\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step4_groupby\r
  title: 4단계. 대륙별 인구 집계\r
  structuredPrimary: true\r
  subtitle: groupby().sum()\r
  goal: 4단계. 대륙별 인구 집계에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 대륙(continent)별로 인구(pop)를 합산합니다. groupby로 그룹화하고 sum()으로 합계를 구한 후, reset_index()로 DataFrame\r
    형태로 변환합니다. 억 단위로 표시하기 위해 10억으로 나눕니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    popByContinent = data2007.groupby('continent')['pop'].sum().reset_index()\r
    popByContinent['popBillion'] = popByContinent['pop'] / 1e9\r
    popByContinent\r
  exercise:\r
    prompt: 4단계. 대륙별 인구 집계 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      popByContinent = data2007.groupby('continent')['pop'].sum().reset_index()\r
      popByContinent['popBillion'] = popByContinent['pop'] / 1e9\r
      popByContinent\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 대륙별 인구 집계에서 \`popByContinent\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 대륙별 인구 집계 실행 뒤 \`popByContinent\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step5_bar\r
  title: 5단계. 기본 막대 그래프\r
  structuredPrimary: true\r
  subtitle: ax.bar()\r
  goal: 5단계. 기본 막대 그래프에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    ax.bar()로 수직 막대 그래프를 그립니다. 첫 번째 인자는 x축 위치(카테고리), 두 번째 인자는 막대 높이(수치)입니다. 대륙별 인구를 한눈에 비교할 수 있습니다.\r
\r
    ax.bar(x, height)로 수직 막대 그래프를 그립니다. x는 카테고리(문자열 배열), height는 막대 높이(숫자 배열)입니다. width 파라미터로 막대 너비를 조절할 수 있습니다(기본값 0.8).\r
  tips:\r
  - ax.bar(x, height)로 수직 막대 그래프를 그립니다. x는 카테고리(문자열 배열), height는 막대 높이(숫자 배열)입니다. width 파라미터로 막대 너비를 조절할\r
    수 있습니다(기본값 0.8).\r
  snippet: |-\r
    figBar, axBar = plt.subplots(figsize=(10, 6))\r
    axBar.bar(popByContinent['continent'], popByContinent['popBillion'])\r
    axBar.set_title('2007년 대륙별 인구', fontsize=14)\r
    axBar.set_xlabel('대륙', fontsize=12)\r
    axBar.set_ylabel('인구 (10억 명)', fontsize=12)\r
    figBar\r
  exercise:\r
    prompt: 5단계. 기본 막대 그래프 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBar, axBar = plt.subplots(figsize=(10, 6))\r
      axBar.bar(popByContinent['continent'], popByContinent['popBillion'])\r
      axBar.set_title('2007년 대륙별 인구', fontsize=14)\r
      axBar.set_xlabel('대륙', fontsize=12)\r
      axBar.set_ylabel('인구 (10억 명)', fontsize=12)\r
      figBar\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 기본 막대 그래프의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 5단계. 기본 막대 그래프 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step6_color\r
  title: 6단계. 색상 설정\r
  structuredPrimary: true\r
  subtitle: color 파라미터\r
  goal: 6단계. 색상 설정에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 각 막대에 다른 색상을 지정하면 시각적 구분이 명확해집니다. color 파라미터에 색상 리스트를 전달하면 각 막대에 순서대로 색상이 적용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figColor, axColor = plt.subplots(figsize=(10, 6))\r
    colorsBasic = ['#3498DB', '#E74C3C', '#27AE60', '#F39C12', '#9B59B6']\r
    axColor.bar(popByContinent['continent'], popByContinent['popBillion'], color=colorsBasic)\r
    axColor.set_title('2007년 대륙별 인구', fontsize=14)\r
    axColor.set_xlabel('대륙', fontsize=12)\r
    axColor.set_ylabel('인구 (10억 명)', fontsize=12)\r
    figColor\r
  exercise:\r
    prompt: 6단계. 색상 설정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figColor, axColor = plt.subplots(figsize=(10, 6))\r
      colorsBasic = ['#3498DB', '#E74C3C', '#27AE60', '#F39C12', '#9B59B6']\r
      axColor.bar(popByContinent['continent'], popByContinent['popBillion'], color=colorsBasic)\r
      axColor.set_title('2007년 대륙별 인구', fontsize=14)\r
      axColor.set_xlabel('대륙', fontsize=12)\r
      axColor.set_ylabel('인구 (10억 명)', fontsize=12)\r
      figColor\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 색상 설정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 색상 설정의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_xticks\r
  title: 7단계. x축 눈금 조정\r
  structuredPrimary: true\r
  subtitle: set_xticks(), rotation\r
  goal: 7단계. x축 눈금 조정에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    x축 라벨이 길거나 많을 때는 회전시키면 겹침을 방지할 수 있습니다. tick_params의 rotation으로 라벨 각도를 조정합니다. 한글 라벨로 변경하여 가독성을 높입니다.\r
\r
    ax.tick_params(axis='x', rotation=45)로 x축 라벨을 45도 회전합니다. labelsize로 글꼴 크기도 조절 가능합니다. set_xticklabels()로 라벨 텍스트를 직접 지정할 수도 있습니다.\r
  tips:\r
  - ax.tick_params(axis='x', rotation=45)로 x축 라벨을 45도 회전합니다. labelsize로 글꼴 크기도 조절 가능합니다. set_xticklabels()로\r
    라벨 텍스트를 직접 지정할 수도 있습니다.\r
  snippet: |-\r
    figTicks, axTicks = plt.subplots(figsize=(10, 6))\r
    colorsTicks = ['#3498DB', '#E74C3C', '#27AE60', '#F39C12', '#9B59B6']\r
    continentKrTicks = ['아프리카', '아메리카', '아시아', '유럽', '오세아니아']\r
\r
    barsTicks = axTicks.bar(continentKrTicks, popByContinent['popBillion'], color=colorsTicks)\r
    axTicks.set_title('2007년 대륙별 인구', fontsize=14)\r
    axTicks.set_xlabel('대륙', fontsize=12)\r
    axTicks.set_ylabel('인구 (10억 명)', fontsize=12)\r
    axTicks.tick_params(axis='x', rotation=0)\r
    figTicks\r
  exercise:\r
    prompt: 7단계. x축 눈금 조정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figTicks, axTicks = plt.subplots(figsize=(10, 6))\r
      colorsTicks = ['#3498DB', '#E74C3C', '#27AE60', '#F39C12', '#9B59B6']\r
      continentKrTicks = ['아프리카', '아메리카', '아시아', '유럽', '오세아니아']\r
\r
      barsTicks = axTicks.bar(continentKrTicks, popByContinent['popBillion'], color=colorsTicks)\r
      axTicks.set_title('2007년 대륙별 인구', fontsize=14)\r
      axTicks.set_xlabel('대륙', fontsize=12)\r
      axTicks.set_ylabel('인구 (10억 명)', fontsize=12)\r
      axTicks.tick_params(axis='x', rotation=0)\r
      figTicks\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. x축 눈금 조정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. x축 눈금 조정의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_annotate\r
  title: 8단계. 막대 위에 값 표시\r
  structuredPrimary: true\r
  subtitle: ax.annotate()\r
  goal: 8단계. 막대 위에 값 표시에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    각 막대 위에 정확한 수치를 표시하면 정보 전달력이 높아집니다. annotate()로 지정한 위치에 텍스트를 추가합니다. 막대의 x좌표와 높이를 이용해 위치를 계산합니다.\r
\r
    ax.annotate(text, xy=(x, y))로 텍스트를 추가합니다. xy는 텍스트 위치, ha(horizontal alignment)와 va(vertical alignment)로 정렬을 설정합니다. bar.get_x()와 bar.get_height()로 막대의 좌표와 높이를 얻습니다.\r
  tips:\r
  - ax.annotate(text, xy=(x, y))로 텍스트를 추가합니다. xy는 텍스트 위치, ha(horizontal alignment)와 va(vertical alignment)로\r
    정렬을 설정합니다. bar.get_x()와 bar.get_height()로 막대의 좌표와 높이를 얻습니다.\r
  snippet: |-\r
    figAnnotate, axAnnotate = plt.subplots(figsize=(10, 6))\r
    colorsAnnotate = ['#3498DB', '#E74C3C', '#27AE60', '#F39C12', '#9B59B6']\r
    continentKrAnnotate = ['아프리카', '아메리카', '아시아', '유럽', '오세아니아']\r
    valuesAnnotate = popByContinent['popBillion'].values\r
\r
    barsAnnotate = axAnnotate.bar(continentKrAnnotate, valuesAnnotate, color=colorsAnnotate)\r
    figAnnotate\r
  exercise:\r
    prompt: 8단계. 막대 위에 값 표시 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figAnnotate, axAnnotate = plt.subplots(figsize=(10, 6))\r
      colorsAnnotate = ['#3498DB', '#E74C3C', '#27AE60', '#F39C12', '#9B59B6']\r
      continentKrAnnotate = ['아프리카', '아메리카', '아시아', '유럽', '오세아니아']\r
      valuesAnnotate = popByContinent['popBillion'].values\r
\r
      barsAnnotate = axAnnotate.bar(continentKrAnnotate, valuesAnnotate, color=colorsAnnotate)\r
      figAnnotate\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 막대 위에 값 표시의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 막대 위에 값 표시의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_barh\r
  title: 9단계. 수평 막대 그래프\r
  structuredPrimary: true\r
  subtitle: ax.barh()\r
  goal: 9단계. 수평 막대 그래프에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    카테고리명이 길거나 비교 항목이 많을 때는 수평 막대 그래프가 더 읽기 쉽습니다. barh()를 사용하면 막대가 수평으로 그려집니다. 인구가 많은 순서로 정렬하면 순위를 쉽게 파악할 수 있습니다.\r
\r
    ax.barh(y, width)로 수평 막대 그래프를 그립니다. y는 카테고리, width는 막대 길이입니다. 데이터를 정렬(sort_values)한 후 그리면 순위를 쉽게 파악할 수 있습니다.\r
  tips:\r
  - ax.barh(y, width)로 수평 막대 그래프를 그립니다. y는 카테고리, width는 막대 길이입니다. 데이터를 정렬(sort_values)한 후 그리면 순위를 쉽게 파악할\r
    수 있습니다.\r
  snippet: |-\r
    figBarh, axBarh = plt.subplots(figsize=(10, 6))\r
\r
    popSortedBarh = popByContinent.sort_values('popBillion', ascending=True)\r
    continentKrSorted = ['오세아니아', '유럽', '아프리카', '아메리카', '아시아']\r
    colorsSorted = ['#9B59B6', '#F39C12', '#3498DB', '#E74C3C', '#27AE60']\r
\r
    barsBarh = axBarh.barh(continentKrSorted, popSortedBarh['popBillion'], color=colorsSorted)\r
    figBarh\r
  exercise:\r
    prompt: 9단계. 수평 막대 그래프 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBarh, axBarh = plt.subplots(figsize=(10, 6))\r
\r
      popSortedBarh = popByContinent.sort_values('popBillion', ascending=True)\r
      continentKrSorted = ['오세아니아', '유럽', '아프리카', '아메리카', '아시아']\r
      colorsSorted = ['#9B59B6', '#F39C12', '#3498DB', '#E74C3C', '#27AE60']\r
\r
      barsBarh = axBarh.barh(continentKrSorted, popSortedBarh['popBillion'], color=colorsSorted)\r
      figBarh\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 수평 막대 그래프의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 수평 막대 그래프의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_final\r
  title: 10단계. 최종 시각화\r
  structuredPrimary: true\r
  subtitle: 완성된 막대 그래프\r
  goal: 10단계. 최종 시각화에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 요소를 종합하여 완성도 높은 대륙별 인구 비교 차트를 만듭니다. 그리드, 스파인 제거, 값 레이블을 모두 적용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal, axFinal = plt.subplots(figsize=(11, 7))\r
\r
    popSortedFinal = popByContinent.sort_values('popBillion', ascending=True)\r
    continentKrFinal = ['오세아니아', '유럽', '아프리카', '아메리카', '아시아']\r
    colorsFinal = ['#9B59B6', '#F39C12', '#3498DB', '#E74C3C', '#27AE60']\r
\r
    barsFinal = axFinal.barh(continentKrFinal, popSortedFinal['popBillion'], color=colorsFinal, height=0.6)\r
    figFinal\r
  exercise:\r
    prompt: 10단계. 최종 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal, axFinal = plt.subplots(figsize=(11, 7))\r
\r
      popSortedFinal = popByContinent.sort_values('popBillion', ascending=True)\r
      continentKrFinal = ['오세아니아', '유럽', '아프리카', '아메리카', '아시아']\r
      colorsFinal = ['#9B59B6', '#F39C12', '#3498DB', '#E74C3C', '#27AE60']\r
\r
      barsFinal = axFinal.barh(continentKrFinal, popSortedFinal['popBillion'], color=colorsFinal, height=0.6)\r
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
  subtitle: 대륙별 데이터 분석 프로젝트\r
  goal: 실습에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 내용을 활용해서 gapminder 데이터를 다양한 관점에서 분석해봅시다. bar, barh, xticks, annotate 등 모든 개념을 종합적으로 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    data = loadLocalDataset("gapminder")\r
\r
    year2007 = data[data['year'] == 2007]\r
    lifeByContinent = year2007.groupby('continent')['lifeExp'].mean().reset_index()\r
    lifeSorted = lifeByContinent.sort_values('lifeExp', ascending=True)\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      data = loadLocalDataset("gapminder")\r
\r
      year2007 = data[data['year'] == 2007]\r
      lifeByContinent = year2007.groupby('continent')['lifeExp'].mean().reset_index()\r
      lifeSorted = lifeByContinent.sort_values('lifeExp', ascending=True)\r
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
    content: 막대 그래프로 대륙별 인구를 비교 분석했습니다.\r
  - type: list\r
    items:\r
    - ax.bar(x, height) - 수직 막대 그래프\r
    - ax.barh(y, width) - 수평 막대 그래프\r
    - color - 막대 색상 지정\r
    - tick_params(rotation) - 축 라벨 회전\r
    - ax.annotate(text, xy) - 막대 위에 값 표시\r
    - sort_values() - 데이터 정렬로 순위 시각화\r
    - spines[].set_visible(False) - 테두리 제거\r
  - type: text\r
    content: 다음 시간에는 펭귄 데이터로 바이올린 플롯과 박스플롯을 비교합니다.\r
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