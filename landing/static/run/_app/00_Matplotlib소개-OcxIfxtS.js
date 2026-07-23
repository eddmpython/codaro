var e=`meta:\r
  packages:\r
  - matplotlib\r
  - pandas\r
  id: matplotlib_00\r
  title: Matplotlib소개\r
  order: 0\r
  category: matplotlib\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - Matplotlib\r
  - 시각화\r
  - 정적 차트\r
  - Figure\r
  - Axes\r
  - pyplot\r
  seo:\r
    title: Matplotlib 입문 - 파이썬 시각화의 기본\r
    description: Matplotlib으로 고품질 정적 차트를 만들어보세요. 논문, 보고서에 적합한 출판 품질의 시각화를 경험합니다.\r
    keywords:\r
    - Matplotlib\r
    - pyplot\r
    - 정적 차트\r
    - 데이터 시각화\r
    - Figure\r
    - Axes\r
intro:\r
  direction: Matplotlib소개에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.\r
  benefits:\r
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.\r
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - Matplotlib소개 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 업무 흐름 검증 입력 확인\r
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 차트 구성 처리 실행\r
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 축/범례/파일 출력 결과 검증\r
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.\r
    - label: Matplotlib소개 재사용\r
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 시각 리포트 환경\r
      detail: matplotlib, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: Matplotlib소개 실행\r
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.\r
    - label: Matplotlib소개 완료\r
      detail: 검증된 코드를 보고서 차트로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 📈\r
    title: Matplotlib\r
    subtitle: 파이썬 시각화의 시작점\r
  - type: hero\r
    emoji: 🎨\r
    title: 출판 품질의 시각화\r
    subtitle: 논문과 보고서를 위한 정적 차트\r
    points:\r
    - emoji: 📄\r
      title: PNG, PDF, SVG 고품질 저장\r
    - emoji: 🔧\r
      title: 픽셀 단위 세밀한 조정\r
    - emoji: 📊\r
      title: 모든 차트 유형 지원\r
    - emoji: 🏛️\r
      title: 20년 검증된 대표 시각화 패키지
  goal: Matplotlib에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
- id: matplotlib_history\r
  blocks:\r
  - type: sectionHeader\r
    title: 🏛️ Matplotlib의 역사\r
    subtitle: 파이썬 시각화의 뿌리\r
  - type: text\r
    content: |-\r
      Matplotlib은 2003년 John Hunter가 만들었습니다. 당시 그는 뇌전증 환자의 뇌파 데이터를 분석하던 신경생물학자였습니다. MATLAB의 시각화 기능을 파이썬에서 사용하고 싶어서 시작된 프로젝트입니다.\r
\r
      20년이 넘는 시간 동안 과학/공학 분야의 표준 시각화 도구로 자리잡았습니다. Seaborn, Pandas의 plot 기능, 심지어 일부 다른 시각화 라이브러리도 내부적으로 Matplotlib을 기반으로 합니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🔬\r
      title: 과학 커뮤니티 표준\r
      description: Nature, Science 등 학술지 논문의 대부분이 Matplotlib 사용\r
    - emoji: 📚\r
      title: 방대한 문서와 예제\r
      description: 20년간 축적된 튜토리얼, 갤러리, Stack Overflow 답변\r
    - emoji: 🧬\r
      title: 다른 라이브러리의 기반\r
      description: Seaborn, Pandas plot 등이 Matplotlib 위에 구축됨\r
    - emoji: 🔧\r
      title: 완전한 제어권\r
      description: 그래프의 모든 요소를 픽셀 단위로 조정 가능\r
  goal: 🏛️ Matplotlib의 역사에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
- id: visualization_tools\r
  blocks:\r
  - type: sectionHeader\r
    title: 🗺️ 파이썬 시각화 생태계\r
    subtitle: 다양한 도구들의 역할\r
  - type: text\r
    content: 파이썬에는 다양한 시각화 라이브러리가 있습니다. 각각 장단점이 있어서 용도에 맞게 선택하면 됩니다. Matplotlib을 먼저 배우면 다른 라이브러리를 이해하기\r
      쉬워집니다.\r
  - type: table\r
    headers:\r
    - 라이브러리\r
    - 특징\r
    - 주요 용도\r
    rows:\r
    - - Matplotlib\r
      - 정적 차트, 완전한 제어, 논문 품질\r
      - 논문, 보고서, 출판물\r
    - - Seaborn\r
      - 통계 시각화, 예쁜 기본 스타일\r
      - 탐색적 분석, 통계 차트\r
    - - Plotly\r
      - 인터랙티브, 웹 기반, 호버 정보\r
      - 대시보드, 웹 앱\r
    - - Altair\r
      - 선언형 문법, 간결한 코드\r
      - 빠른 프로토타이핑\r
    - - Bokeh\r
      - 대용량 데이터, 스트리밍\r
      - 실시간 대시보드\r
    - - Pandas plot\r
      - DataFrame에서 바로 시각화\r
      - 빠른 탐색\r
  - type: note\r
    style: info\r
    title: Matplotlib이 먼저인 이유\r
    content: Seaborn은 Matplotlib 위에 만들어졌고, Pandas plot도 내부적으로 Matplotlib을 사용합니다. Matplotlib의 Figure, Axes\r
      개념을 이해하면 다른 라이브러리도 쉽게 배울 수 있습니다.\r
  goal: 🗺️ 파이썬 시각화 생태계에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
- id: figure_axes\r
  blocks:\r
  - type: sectionHeader\r
    title: 🖼️ Figure와 Axes 이해하기\r
    subtitle: Matplotlib의 핵심 구조\r
  - type: text\r
    content: |-\r
      Matplotlib을 제대로 사용하려면 Figure와 Axes의 관계를 이해해야 합니다.\r
\r
      Figure는 전체 그림판입니다. 도화지 한 장이라고 생각하세요. Axes는 실제 차트가 그려지는 영역입니다. 하나의 Figure에 여러 개의 Axes를 배치할 수 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🖼️\r
      title: Figure\r
      description: 전체 그림판. 크기, 해상도, 배경색 등을 설정\r
    - emoji: 📊\r
      title: Axes\r
      description: 실제 차트 영역. 데이터, 축, 제목 등을 설정\r
    - emoji: 📐\r
      title: Axis\r
      description: x축, y축. 눈금, 범위, 라벨 설정\r
    - emoji: 🎨\r
      title: Artist\r
      description: 화면에 그려지는 모든 요소 (선, 점, 텍스트 등)\r
  - type: note\r
    style: info\r
    title: pyplot vs 객체 지향\r
    content: plt.plot() 같은 pyplot 방식은 빠르게 그릴 때 편리합니다. fig, ax = plt.subplots() 같은 객체 지향 방식은 복잡한 차트를 세밀하게\r
      제어할 때 사용합니다. 이 과정에서는 두 방식 모두 배웁니다.\r
  goal: 🖼️ Figure와 Axes 이해하기에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
- id: chart_types\r
  blocks:\r
  - type: sectionHeader\r
    title: 📊 지원하는 차트 종류\r
    subtitle: 기본부터 고급까지\r
  - type: table\r
    headers:\r
    - 카테고리\r
    - 차트 종류\r
    - 함수\r
    rows:\r
    - - 기본\r
      - 선 그래프\r
      - plot()\r
    - - 기본\r
      - 산점도\r
      - scatter()\r
    - - 기본\r
      - 막대 그래프\r
      - bar(), barh()\r
    - - 기본\r
      - 히스토그램\r
      - hist()\r
    - - 기본\r
      - 파이 차트\r
      - pie()\r
    - - 분포\r
      - 박스 플롯\r
      - boxplot()\r
    - - 분포\r
      - 바이올린 플롯\r
      - violinplot()\r
    - - 고급\r
      - 히트맵\r
      - imshow(), pcolormesh()\r
    - - 고급\r
      - 등고선\r
      - contour(), contourf()\r
    - - 고급\r
      - 3D 플롯\r
      - Axes3D\r
    - - 고급\r
      - 오차 막대\r
      - errorbar()\r
    - - 특수\r
      - 극좌표\r
      - projection='polar'\r
    - - 특수\r
      - 지도\r
      - Basemap, Cartopy 연동\r
  goal: 📊 지원하는 차트 종류에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
- id: projects_preview\r
  blocks:\r
  - type: sectionHeader\r
    title: 🗺️ 10개 프로젝트 미리보기\r
    subtitle: 이 순서대로 배웁니다\r
  - type: table\r
    headers:\r
    - 단계\r
    - 프로젝트\r
    - 배울 내용\r
    rows:\r
    - - 입문\r
      - 01 주가추세분석\r
      - plot, figure, title, legend, grid\r
    - - 입문\r
      - 02 팁데이터분포탐색\r
      - hist, boxplot, subplots, color\r
    - - 기초\r
      - 03 붓꽃품종산점도\r
      - scatter, legend, marker, text\r
    - - 기초\r
      - 04 대륙별인구비교\r
      - bar, xticks, annotate\r
    - - 기초\r
      - 05 펭귄체중분석\r
      - violin, boxplot, sharex, spines\r
    - - 중급\r
      - 06 상관관계히트맵\r
      - imshow, cmap, colorbar\r
    - - 중급\r
      - 07 시계열다중축차트\r
      - twinx, fill_between, 이중 축\r
    - - 중급\r
      - 08 다중패널대시보드\r
      - GridSpec, style, tight_layout\r
    - - 심화\r
      - 09 고급주석차트\r
      - annotate, LaTeX, bbox, errorbar\r
    - - 심화\r
      - 10 종합분석리포트\r
      - 모든 개념 종합, savefig, dpi\r
  - type: note\r
    style: info\r
    title: 프로젝트 기반 학습\r
    content: 각 프로젝트는 완성된 결과물을 만듭니다. 개념을 배우면서 실제 분석 차트를 그려봅니다.\r
  goal: 🗺️ 10개 프로젝트 미리보기에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
- id: styling\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎨 스타일링 기능\r
    subtitle: 전문가 수준의 차트 디자인\r
  - type: featureCards\r
    cards:\r
    - emoji: 🎨\r
      title: 스타일 시트\r
      description: ggplot, seaborn, dark_background 등 내장 스타일\r
    - emoji: 🖌️\r
      title: 색상 팔레트\r
      description: viridis, plasma, coolwarm 등 과학적 컬러맵\r
    - emoji: ✏️\r
      title: 폰트 설정\r
      description: 글꼴, 크기, 굵기 완전 제어\r
    - emoji: 📏\r
      title: 레이아웃\r
      description: 여백, 간격, 정렬 세밀하게 조정\r
  - type: note\r
    style: tip\r
    title: 스타일 시트 활용\r
    content: plt.style.use('seaborn-v0_8-whitegrid')처럼 한 줄로 전체 스타일을 바꿀 수 있습니다. 직접 모든 걸 설정하지 않아도 됩니다.\r
  goal: 🎨 스타일링 기능에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
- id: save_formats\r
  blocks:\r
  - type: sectionHeader\r
    title: 💾 저장 형식\r
    subtitle: 용도에 맞는 포맷 선택\r
  - type: table\r
    headers:\r
    - 형식\r
    - 특징\r
    - 추천 용도\r
    rows:\r
    - - PNG\r
      - 래스터, 투명 배경 가능\r
      - 웹, 프레젠테이션\r
    - - PDF\r
      - 벡터, 확대해도 선명\r
      - 논문, 출판물\r
    - - SVG\r
      - 벡터, 웹 편집 가능\r
      - 웹, 일러스트레이터\r
    - - EPS\r
      - 벡터, LaTeX 호환\r
      - 학술 논문\r
  - type: note\r
    style: info\r
    title: 해상도 설정\r
    content: plt.savefig('chart.png', dpi=300)으로 고해상도 이미지를 저장할 수 있습니다. 인쇄용은 300dpi, 웹용은 72-150dpi가 적당합니다.\r
  goal: 💾 저장 형식에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
- id: when_to_use\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚖️ 언제 Matplotlib을 선택할까?\r
    subtitle: 상황별 가이드\r
  - type: table\r
    headers:\r
    - 상황\r
    - 적합도\r
    - 이유\r
    rows:\r
    - - 논문/보고서 삽입\r
      - O\r
      - 고품질 정적 이미지 저장\r
    - - 세밀한 커스터마이징\r
      - O\r
      - 모든 요소 픽셀 단위 제어\r
    - - 고해상도 이미지 필요\r
      - O\r
      - 300dpi 이상 출력 가능\r
    - - 3D 시각화\r
      - O\r
      - Axes3D 지원\r
    - - 탐색적 데이터 분석\r
      - △\r
      - 가능하지만 코드가 길어질 수 있음\r
    - - 웹 대시보드\r
      - X\r
      - 정적 이미지만 가능\r
    - - 상호작용 필요\r
      - X\r
      - 줌/팬/호버 미지원\r
  - type: note\r
    style: tip\r
    title: 정적 시각화의 장점\r
    content: 인터랙티브 차트는 웹에서 편리하지만, 논문이나 보고서에 넣을 때는 고해상도 이미지가 필요합니다. Matplotlib은 이런 상황에 최적화되어 있습니다.\r
  goal: ⚖️ 언제 Matplotlib을 선택할까?에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
- id: resources\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 참고 자료\r
    subtitle: 더 깊이 공부하고 싶다면\r
  - type: links\r
    items:\r
    - text: Matplotlib 공식 문서\r
      url: https://matplotlib.org/stable/\r
      icon: 🔗\r
    - text: Matplotlib 갤러리\r
      url: https://matplotlib.org/stable/gallery/\r
      icon: 🔗\r
    - text: Matplotlib Cheatsheets\r
      url: https://matplotlib.org/cheatsheets/\r
      icon: 🔗\r
    - text: Scientific Visualization Book\r
      url: https://github.com/rougier/scientific-visualization-book\r
      icon: 🔗\r
  goal: 📚 참고 자료에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.\r
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.\r
- id: next\r
  blocks:\r
  - type: hero\r
    emoji: 👉\r
    title: '다음: 주가 추세 분석'\r
    subtitle: 선 그래프로 일별 주가 변동을 시각화합니다\r
  goal: '다음: 주가 추세 분석에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.'\r
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