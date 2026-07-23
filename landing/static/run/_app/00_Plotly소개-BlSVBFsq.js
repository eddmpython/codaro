var e=`meta:\r
  packages:\r
  - pandas\r
  - plotly\r
  id: plotly_00\r
  title: Plotly소개\r
  order: 0\r
  category: plotly\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - Plotly\r
  - Plotly Express\r
  - 시각화\r
  - 대화형 차트\r
  - 인터랙티브\r
  seo:\r
    title: Plotly Express 입문 - 대화형 데이터 시각화\r
    description: Plotly Express로 대화형 차트를 만들어보세요. 마우스 호버, 줌, 필터링이 가능한 인터랙티브 시각화를 경험합니다.\r
    keywords:\r
    - Plotly\r
    - Plotly Express\r
    - 대화형 차트\r
    - 인터랙티브\r
    - 데이터 시각화\r
intro:\r
  direction: Plotly소개에서 데이터를 상호작용 차트로 구성하고 필터와 표시 상태를 검증합니다.\r
  benefits:\r
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.\r
  - 대시보드 데이터 확인 후 인터랙티브 시각화에 맞는 코드 입력을 고릅니다.\r
  - Plotly소개 결과를 툴팁과 선택 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 공유 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 10단계. Plotly 학습 입력 확인\r
      detail: 입력 기준(대시보드 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 인터랙티브 시각화 처리 실행\r
      detail: 인터랙티브 시각화 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 툴팁과 선택 상태 결과 검증\r
      detail: 툴팁과 선택 상태 기준으로 실행 결과를 비교합니다.\r
    - label: Plotly소개 재사용\r
      detail: 완성 코드를 공유 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 인터랙티브 차트 환경\r
      detail: pandas, plotly 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: Plotly소개 실행\r
      detail: 셀을 실행해 툴팁과 선택 상태와 예외 상태를 확인합니다.\r
    - label: Plotly소개 완료\r
      detail: 검증된 코드를 공유 대시보드로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 📊\r
    title: Plotly Express??\r
    subtitle: matplotlib 말고 뭐가 더 있어?\r
  - type: hero\r
    emoji: ✨\r
    title: 대화형 차트의 세계\r
    subtitle: 마우스로 탐색하는 시각화\r
    points:\r
    - emoji: 🖱️\r
      title: 마우스 호버로 상세 정보\r
    - emoji: 🔍\r
      title: 줌인/줌아웃 자유자재\r
    - emoji: 📸\r
      title: 이미지로 바로 저장\r
    - emoji: 🎬\r
      title: 애니메이션 차트\r
  - type: image\r
    src: https://images.plot.ly/plotly-documentation/thumbnail/plotly-express.png\r
  goal: Plotly Express??에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
- id: why_plotly\r
  blocks:\r
  - type: sectionHeader\r
    title: 🤔 matplotlib으로 충분하지 않나요?\r
    subtitle: 정적 차트 vs 대화형 차트\r
  - type: compare\r
    left:\r
      title: matplotlib\r
      subtitle: 전통적인 방식\r
      icon: 📄\r
      color: gray\r
      items:\r
      - 이미지로 저장\r
      - 보는 것만 가능\r
      - 확대하면 깨짐\r
      - 세부 정보 확인 어려움\r
      - 코드가 길어짐\r
      infoBox: 논문, 보고서에 적합\r
    right:\r
      title: Plotly Express\r
      subtitle: 현대적인 방식\r
      icon: ✨\r
      color: green\r
      items:\r
      - 웹에서 바로 상호작용\r
      - 마우스 호버로 정보 확인\r
      - 확대/축소 자유자재\r
      - 클릭으로 필터링\r
      - 한 줄로 완성\r
      infoBox: 웹, 대시보드에 적합\r
  goal: 🤔 matplotlib으로 충분하지 않나요?에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
- id: plotly_express\r
  blocks:\r
  - type: sectionHeader\r
    title: 🚀 Plotly Express란?\r
    subtitle: Plotly를 쉽게 쓰는 방법\r
  - type: note\r
    style: info\r
    title: Plotly vs Plotly Express\r
    content: Plotly는 저수준 라이브러리이고, Plotly Express는 고수준 래퍼입니다. seaborn이 matplotlib을 쉽게 만들어준 것처럼, Plotly\r
      Express가 Plotly를 쉽게 만들어줍니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🎯\r
      title: 한 줄 코드\r
      description: px.scatter(df, x='col1', y='col2')처럼 한 줄로 차트 완성\r
    - emoji: 📊\r
      title: 30+ 차트 종류\r
      description: 산점도, 막대, 선, 히트맵, 지도, 3D까지 모두 지원\r
    - emoji: 🎨\r
      title: 자동 스타일링\r
      description: 색상, 범례, 축 라벨을 자동으로 설정\r
    - emoji: 🔗\r
      title: DataFrame 친화적\r
      description: pandas DataFrame을 바로 넣으면 됨\r
  goal: 🚀 Plotly Express란?에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
- id: builtin_data\r
  blocks:\r
  - type: sectionHeader\r
    title: 📦 px.data 내장 데이터\r
    subtitle: uv 준비 후 바로 사용하는 연습용 데이터\r
  - type: table\r
    headers:\r
    - 데이터\r
    - 설명\r
    - 행 수\r
    - 주요 컬럼\r
    rows:\r
    - - gapminder()\r
      - 세계 발전 지표\r
      - 1,704\r
      - country, year, lifeExp, pop, gdpPercap\r
    - - iris()\r
      - 붓꽃 품종\r
      - '150'\r
      - sepal_length, petal_width, species\r
    - - tips()\r
      - 레스토랑 팁\r
      - '244'\r
      - total_bill, tip, day, time, size\r
    - - stocks()\r
      - 주식 시세\r
      - '505'\r
      - date, GOOG, AAPL, AMZN, FB, NFLX, MSFT\r
    - - carshare()\r
      - 카쉐어링\r
      - '249'\r
      - centroid_lat, centroid_lon, peak_hour\r
    - - wind()\r
      - 풍향/풍속\r
      - '128'\r
      - direction, strength, frequency\r
    - - election()\r
      - 선거 결과\r
      - '58'\r
      - district, winner, result\r
    - - medals_long()\r
      - 올림픽 메달\r
      - '9'\r
      - nation, medal, count\r
  - type: note\r
    style: tip\r
    title: 인터넷 연결 필요 없음\r
    content: px.data 데이터는 라이브러리에 내장되어 있어서 인터넷 연결 없이도 사용할 수 있습니다. 학습용으로 완벽합니다.\r
  goal: 📦 px.data 내장 데이터에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
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
      - 01 기본차트입문\r
      - scatter, line, bar, histogram 기초\r
    - - 초급\r
      - 02 팁데이터분석\r
      - box, violin, facet으로 분포 비교\r
    - - 초급\r
      - 03 세계인구분석\r
      - color, size, hover로 다차원 표현\r
    - - 중급\r
      - 04 애니메이션차트\r
      - animation_frame으로 시간 변화\r
    - - 중급\r
      - 05 붓꽃상관분석\r
      - trendline, 산점도 매트릭스\r
    - - 중급\r
      - 06 설문조사분석\r
      - pie, 누적 bar, 비율 시각화\r
    - - 고급\r
      - 07 센서데이터분석\r
      - line, area, 시계열 패턴\r
    - - 고급\r
      - 08 마케팅퍼널분석\r
      - funnel, treemap, sunburst\r
    - - 고급\r
      - 09 주가차트분석\r
      - candlestick, OHLC, 금융 차트\r
    - - 종합\r
      - 10 대시보드프로젝트\r
      - subplots로 종합 대시보드\r
  - type: note\r
    style: info\r
    title: 프로젝트 기반 학습\r
    content: 각 프로젝트는 완성된 결과물을 만듭니다. 개념만 배우는 게 아니라 실제 분석을 수행합니다.\r
  goal: 🗺️ 10개 프로젝트 미리보기에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
- id: interactive_features\r
  blocks:\r
  - type: sectionHeader\r
    title: 🖱️ 대화형 차트의 기능\r
    subtitle: Plotly 차트에서 할 수 있는 것들\r
  - type: featureCards\r
    cards:\r
    - emoji: 🔍\r
      title: 줌\r
      description: 드래그해서 특정 영역 확대. 더블클릭하면 원래대로\r
    - emoji: 🖱️\r
      title: 호버\r
      description: 마우스를 올리면 데이터 포인트 상세 정보 표시\r
    - emoji: 📷\r
      title: 다운로드\r
      description: 차트 우측 상단 카메라 아이콘으로 PNG 저장\r
    - emoji: 🔲\r
      title: 범례 필터\r
      description: 범례 클릭으로 특정 카테고리 숨기기/표시\r
    - emoji: ✋\r
      title: 팬\r
      description: 확대 상태에서 드래그로 이동\r
    - emoji: 📦\r
      title: 선택\r
      description: 박스/올가미로 데이터 포인트 선택\r
  goal: 🖱️ 대화형 차트의 기능에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
- id: comparison_chart\r
  blocks:\r
  - type: sectionHeader\r
    title: 📊 Python 시각화 라이브러리 비교\r
    subtitle: 어떤 상황에 어떤 도구?\r
  - type: table\r
    headers:\r
    - 라이브러리\r
    - 특징\r
    - 추천 상황\r
    rows:\r
    - - matplotlib\r
      - 가장 기본, 세밀한 커스텀\r
      - 논문, 출판물, 완전한 제어\r
    - - seaborn\r
      - 통계 시각화, 예쁜 기본값\r
      - EDA, 통계 분석\r
    - - Plotly Express\r
      - 대화형, 웹 친화적\r
      - 대시보드, 웹앱, 탐색적 분석\r
    - - Altair\r
      - 선언적 문법, 간결함\r
      - 빠른 프로토타이핑\r
    - - Bokeh\r
      - 대용량 대화형\r
      - 실시간 스트리밍\r
  - type: note\r
    style: tip\r
    title: 정답은 없습니다\r
    content: 상황에 맞는 도구를 선택하세요. 이 과정에서는 Plotly Express로 대화형 시각화의 매력을 경험합니다.\r
  goal: 📊 Python 시각화 라이브러리 비교에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
- id: resources\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 참고 자료\r
    subtitle: 더 깊이 공부하고 싶다면\r
  - type: links\r
    items:\r
    - text: Plotly Express 공식 문서\r
      url: https://plotly.com/python/plotly-express/\r
      icon: 🔗\r
    - text: px.data 내장 데이터셋\r
      url: https://plotly.com/python-api-reference/generated/plotly.express.data.html\r
      icon: 🔗\r
    - text: Plotly Express Cheat Sheet\r
      url: https://www.datacamp.com/cheat-sheet/plotly-express-cheat-sheet\r
      icon: 🔗\r
  goal: 📚 참고 자료에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
- id: workflow_validation\r
  title: 10단계. Plotly 학습 흐름 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 10단계. Plotly 학습 흐름 검증에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    Plotly 입문은 인터랙티브라는 특징을 말로 아는 데서 끝나지 않습니다. 로컬 데이터로 Figure를 만들고, trace와 layout이 분석 질문을 제대로 담는지 확인해야 합니다.\r
\r
    Plotly도 Figure 객체를 검증하면 “보이는 차트”를 넘어 재사용 가능한 분석 산출물이 됩니다.\r
  snippet: |-\r
    import plotly.express as px\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    plotlyTips = loadLocalDataset("tips")\r
    requiredColumns = {"total_bill", "tip", "time", "day"}\r
    missingColumns = requiredColumns - set(plotlyTips.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert plotlyTips["total_bill"].gt(plotlyTips["tip"]).all()\r
\r
    billTipCorrelation = plotlyTips[["total_bill", "tip"]].corr().loc["total_bill", "tip"]\r
    assert billTipCorrelation > 0.6\r
    round(float(billTipCorrelation), 3)\r
  exercise:\r
    prompt: 10단계. Plotly 학습 흐름 검증 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      plotlyTips = loadLocalDataset("tips")\r
      requiredColumns = {"total_bill", "tip", "time", "day"}\r
      missingColumns = requiredColumns - set(plotlyTips.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert plotlyTips["total_bill"].gt(plotlyTips["tip"]).all()\r
\r
      billTipCorrelation = plotlyTips[["total_bill", "tip"]].corr().loc["total_bill", "tip"]\r
      assert billTipCorrelation > 0.6\r
      round(float(billTipCorrelation), 3)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. Plotly 학습 흐름 검증의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. Plotly 학습 흐름 검증의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: next\r
  blocks:\r
  - type: hero\r
    emoji: 👉\r
    title: '다음: 기본 차트 입문'\r
    subtitle: 산점도, 선 그래프, 막대 그래프, 히스토그램을 한 번에 배웁니다\r
  goal: '다음: 기본 차트 입문에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.'\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
`;export{e as default};