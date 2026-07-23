var e=`meta:\r
  packages:\r
  - pandas\r
  - plotly\r
  id: plotly_09\r
  title: 주식시계열분석\r
  order: 9\r
  category: plotly\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - 주식\r
  - 시계열\r
  - line\r
  - template\r
  - subplots\r
  - update_traces\r
  seo:\r
    title: Plotly 주식 시계열 분석 - 다중 주식 비교 차트 만들기\r
    description: 주식 데이터로 시계열 분석을 배웁니다. px.line, make_subplots, update_traces, template을 활용한 다중 주식 비교 차트를\r
      만듭니다.\r
    keywords:\r
    - Plotly\r
    - 주식 분석\r
    - 시계열\r
    - line chart\r
    - subplots\r
    - template\r
intro:\r
  emoji: 📈\r
  goal: 주식 데이터로 다중 주식 비교 차트를 만듭니다.\r
  description: px.data.stocks() 데이터로 여러 종목의 주가 추이를 비교 분석합니다. 선 그래프, 서브플롯, 템플릿 스타일링을 활용합니다.\r
  direction: 주식시계열분석에서 데이터를 상호작용 차트로 구성하고 필터와 표시 상태를 검증합니다.\r
  benefits:\r
  - 대시보드 데이터 확인 후 인터랙티브 시각화에 맞는 코드 입력을 고릅니다.\r
  - 주식시계열분석 결과를 툴팁과 선택 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 공유 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 준비 입력 확인\r
      detail: 입력 기준(대시보드 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 확인 처리 실행\r
      detail: 인터랙티브 시각화 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 기본 선 그래프 결과 검증\r
      detail: 툴팁과 선택 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 주식시계열분석 재사용\r
      detail: 완성 코드를 공유 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 인터랙티브 차트 환경\r
      detail: pandas, plotly 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 주식시계열분석 실행\r
      detail: 셀을 실행해 툴팁과 선택 상태와 예외 상태를 확인합니다.\r
    - label: 주식시계열분석 완료\r
      detail: 검증된 코드를 공유 대시보드로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 데이터 준비\r
  structuredPrimary: true\r
  subtitle: 주식 가격 데이터 로드\r
  goal: 1단계. 데이터 준비에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: px.data.stocks()는 6개 기술주(GOOG, AAPL, AMZN, FB, NFLX, MSFT)의 2018~2020년 일별 주가 데이터입니다. 총\r
    505행, 7컬럼(date + 6종목)으로 구성되어 있습니다. 주가 데이터는 2018년 1월 1일을 기준(1.0)으로 정규화된 상대 가격으로, 각 종목의 수익률을 공정하게 비교할\r
    수 있게 합니다. 예를 들어 값이 1.5면 기준 시점 대비 50% 상승, 0.8이면 20% 하락을 의미합니다. 시계열 데이터 시각화는 금융, 판매, 웹 트래픽, 센서 데이터 등\r
    시간에 따른 변화를 분석하는 모든 분야에서 필수적이며, 추세, 계절성, 이상치를 발견하는 데 핵심 도구입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import plotly.express as px\r
    import plotly.graph_objects as go\r
    from plotly.subplots import make_subplots\r
    import pandas as pd\r
\r
    stocks = px.data.stocks()\r
    stocks.shape\r
  exercise:\r
    prompt: 1단계. 데이터 준비 예제에서 \`stocks\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      import plotly.graph_objects as go\r
      from plotly.subplots import make_subplots\r
      import pandas as pd\r
\r
      stocks = px.data.stocks()\r
      stocks.shape\r
    hints:\r
    - 바꿀 지점은 \`stocks = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`stocks\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 준비에서 \`stocks\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 1단계. 데이터 준비 실행 뒤 \`stocks\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step2_head\r
  title: 2단계. 데이터 확인\r
  structuredPrimary: true\r
  subtitle: 종목별 주가\r
  goal: 2단계. 데이터 확인에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
  explanation: 데이터 구조를 확인하면 date 컬럼과 6개 종목 컬럼이 있습니다. 시계열 분석에서는 데이터 형식 확인이 매우 중요하며, 특히 date 컬럼이 문자열인지 datetime\r
    타입인지 확인해야 합니다. 값은 2018년 1월 1일을 1.0으로 정규화한 상대 가격으로, 절대 가격이 다른 종목들을 동일한 기준선에서 비교할 수 있게 합니다. 예를 들어 아마존\r
    주가가 3000달러, 애플이 150달러라도 수익률로 비교하면 공정합니다. head(10)으로 처음 10행을 보면 초기 데이터가 모두 1.0 근처인 것을 확인할 수 있으며, 시간이\r
    지남에 따라 값이 변화하는 패턴을 관찰할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: stocks.head(10)\r
  exercise:\r
    prompt: 2단계. 데이터 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: stocks.head(10)\r
    hints:\r
    - 바꿀 지점은 대시보드 데이터을 만드는 첫 줄과 인터랙티브 시각화 줄에서 찾으세요.\r
    - 실행 뒤 툴팁과 선택 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 확인의 수정 코드가 인터랙티브 시각화 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 2단계. 데이터 확인 실행 결과가 툴팁과 선택 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step3_basic_line\r
  title: 3단계. 기본 선 그래프\r
  structuredPrimary: true\r
  subtitle: px.line()\r
  goal: 3단계. 기본 선 그래프에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
  explanation: |-\r
    px.line()은 시계열 데이터 시각화의 기본 도구입니다. x축에 시간(date), y축에 값(GOOG 주가)을 지정하면 시간에 따른 변화 추이를 선으로 연결하여 보여줍니다. 선 그래프는 산점도와 달리 데이터 포인트를 순서대로 선으로 연결하여 연속성을 강조하며, 추세, 계절성, 이상치를 발견하는 데 매우 효과적입니다. 주가, 매출, 웹 트래픽, 센서 데이터 등 시간에 따라 변하는 모든 데이터에 사용되며, 실무에서는 시계열 분석의 첫 단계로 선 그래프를 그려 전체적인 패턴을 파악합니다.\r
\r
    px.line() 핵심\r
    x축에 시간, y축에 값을 넣으면 시계열 차트가 됩니다. scatter와 달리 점을 선으로 연결합니다.\r
  tips:\r
  - px.line() 핵심 x축에 시간, y축에 값을 넣으면 시계열 차트가 됩니다. scatter와 달리 점을 선으로 연결합니다.\r
  snippet: px.line(stocks, x='date', y='GOOG', title='구글 주가 추이')\r
  exercise:\r
    prompt: 3단계. 기본 선 그래프 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: px.line(stocks, x='date', y='GOOG', title='구글 주가 추이')\r
    hints:\r
    - 바꿀 지점은 대시보드 데이터을 만드는 첫 줄과 인터랙티브 시각화 줄에서 찾으세요.\r
    - 실행 뒤 툴팁과 선택 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 기본 선 그래프의 수정 코드가 인터랙티브 시각화 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 3단계. 기본 선 그래프 실행 결과가 툴팁과 선택 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step4_multi_line\r
  title: 4단계. 다중 선 그래프\r
  structuredPrimary: true\r
  subtitle: 여러 종목 비교\r
  goal: 4단계. 다중 선 그래프에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 여러 종목을 한 차트에 표시하려면 데이터를 긴 형태(long format)로 변환해야 합니다. pandas의 melt() 함수는 넓은 형태(wide format)의\r
    데이터프레임을 긴 형태로 재구조화하며, id_vars='date'는 유지할 컬럼, var_name='stock'은 종목명을 저장할 새 컬럼명, value_name='price'는\r
    주가를 저장할 새 컬럼명을 지정합니다. 변환 후 color='stock'을 지정하면 Plotly가 각 종목을 다른 색상의 선으로 자동 구분하여 그려줍니다. 이렇게 하면 6개 종목의\r
    수익률을 직접 비교하여 어느 종목이 더 높은 성과를 냈는지, 변동성은 어떤지를 한눈에 파악할 수 있으며, 실무에서는 여러 지표, 여러 지역, 여러 제품의 시계열을 비교할 때 동일한\r
    방법을 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    stocksMelted = stocks.melt(id_vars='date', var_name='stock', value_name='price')\r
    px.line(stocksMelted, x='date', y='price', color='stock', title='6개 종목 주가 비교')\r
  exercise:\r
    prompt: 4단계. 다중 선 그래프 예제에서 \`stocksMelted\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      stocksMelted = stocks.melt(id_vars='date', var_name='stock', value_name='price')\r
      px.line(stocksMelted, x='date', y='price', color='stock', title='6개 종목 주가 비교')\r
    hints:\r
    - 바꿀 지점은 \`stocksMelted = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`stocksMelted\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 다중 선 그래프에서 \`stocksMelted\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 다중 선 그래프 실행 뒤 \`stocksMelted\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step5_facet\r
  title: 5단계. 패싯 분리\r
  structuredPrimary: true\r
  subtitle: facet_col 활용\r
  goal: 5단계. 패싯 분리에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 종목별로 차트를 분리하면 각 종목의 추세를 더 명확히 볼 수 있습니다. facet_col='stock'은 stock 컬럼의 각 고유값(종목)마다 별도의 차트를\r
    생성하여 가로로 배치하며, facet_col_wrap=3은 한 행에 최대 3개 차트를 배치한 후 다음 행으로 넘어가도록 설정합니다. 하나의 차트에 6개 선이 겹치면 개별 패턴이\r
    흐려지지만, 패싯으로 분리하면 각 종목의 고유한 변동성과 추세를 독립적으로 분석할 수 있습니다. 실무에서는 제품별, 지역별, 고객 세그먼트별 시계열을 비교할 때 패싯을 활용하며,\r
    특히 패턴이 크게 다른 여러 그룹을 동시에 분석할 때 필수적입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    px.line(\r
        stocksMelted,\r
        x='date',\r
        y='price',\r
        facet_col='stock',\r
        facet_col_wrap=3,\r
        title='종목별 주가 추이'\r
    )\r
  exercise:\r
    prompt: 5단계. 패싯 분리 예제에서 \`x\`, \`y\`, \`facet_col\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      px.line(\r
          stocksMelted,\r
          x='date',\r
          y='price',\r
          facet_col='stock',\r
          facet_col_wrap=3,\r
          title='종목별 주가 추이'\r
      )\r
    hints:\r
    - 바꿀 지점은 \`x = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`x\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 패싯 분리에서 \`x\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 패싯 분리 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_update_layout\r
  title: 6단계. 레이아웃 수정\r
  structuredPrimary: true\r
  subtitle: update_layout()\r
  goal: 6단계. 레이아웃 수정에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: update_layout()으로 차트 크기, 범례 위치, 배경색 등을 조정하여 가독성과 전문성을 높입니다. legend 파라미터를 딕셔너리로 전달하면 범례의\r
    방향(orientation='h'는 가로 배치), 세로 위치(yanchor='bottom', y=1.02는 차트 상단 바로 위), 가로 위치(xanchor='center', x=0.5는\r
    중앙 정렬)를 세밀하게 제어할 수 있습니다. 범례를 차트 외부 상단에 배치하면 차트 영역을 최대한 활용하면서도 종목 구분을 명확히 할 수 있으며, xaxis_title과 yaxis_title로\r
    축 제목을 명시하여 독자가 데이터를 쉽게 이해하도록 돕습니다. 실무에서는 회사 브랜드 가이드에 맞춰 폰트, 색상, 여백을 조정하며, 프레젠테이션용과 보고서용으로 각기 다른 레이아웃을\r
    적용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figLayout = px.line(stocksMelted, x='date', y='price', color='stock')\r
    figLayout.update_layout(\r
        title='기술주 주가 비교 (2018-2020)',\r
        height=500,\r
        legend=dict(\r
            orientation='h',\r
            yanchor='bottom',\r
            y=1.02,\r
            xanchor='center',\r
            x=0.5\r
        ),\r
        xaxis_title='날짜',\r
        yaxis_title='상대 가격'\r
    )\r
    figLayout\r
  exercise:\r
    prompt: 6단계. 레이아웃 수정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figLayout = px.line(stocksMelted, x='date', y='price', color='stock')\r
      figLayout.update_layout(\r
          title='기술주 주가 비교 (2018-2020)',\r
          height=500,\r
          legend=dict(\r
              orientation='h',\r
              yanchor='bottom',\r
              y=1.02,\r
              xanchor='center',\r
              x=0.5\r
          ),\r
          xaxis_title='날짜',\r
          yaxis_title='상대 가격'\r
      )\r
      figLayout\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 레이아웃 수정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 레이아웃 수정의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_update_traces\r
  title: 7단계. 트레이스 수정\r
  structuredPrimary: true\r
  subtitle: update_traces()\r
  goal: 7단계. 트레이스 수정에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    update_traces()로 선 스타일을 변경합니다. 선 두께, 점 표시 여부 등을 조정합니다.\r
\r
    update_traces() 핵심\r
    모든 트레이스(선)의 스타일을 한번에 변경합니다. line_width로 두께, mode로 선+점 표시를 설정합니다.\r
  tips:\r
  - update_traces() 핵심 모든 트레이스(선)의 스타일을 한번에 변경합니다. line_width로 두께, mode로 선+점 표시를 설정합니다.\r
  snippet: |-\r
    figTraces = px.line(stocksMelted, x='date', y='price', color='stock')\r
    figTraces.update_traces(\r
        line=dict(width=2),\r
        mode='lines+markers',\r
        marker=dict(size=3)\r
    )\r
    figTraces.update_layout(title='선 스타일 커스터마이징')\r
    figTraces\r
  exercise:\r
    prompt: 7단계. 트레이스 수정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figTraces = px.line(stocksMelted, x='date', y='price', color='stock')\r
      figTraces.update_traces(\r
          line=dict(width=2),\r
          mode='lines+markers',\r
          marker=dict(size=3)\r
      )\r
      figTraces.update_layout(title='선 스타일 커스터마이징')\r
      figTraces\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 트레이스 수정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 트레이스 수정의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_template\r
  title: 8단계. 템플릿 적용\r
  structuredPrimary: true\r
  subtitle: 차트 테마 변경\r
  goal: 8단계. 템플릿 적용에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    template으로 차트 전체 테마를 변경합니다. plotly_dark는 어두운 배경의 금융 차트 스타일입니다.\r
\r
    template 종류\r
    plotly, plotly_white, plotly_dark, ggplot2, seaborn, simple_white 등이 있습니다. 금융 차트는 plotly_dark가 인기있습니다.\r
  tips:\r
  - template 종류 plotly, plotly_white, plotly_dark, ggplot2, seaborn, simple_white 등이 있습니다. 금융 차트는 plotly_dark가\r
    인기있습니다.\r
  snippet: |-\r
    figDark = px.line(\r
        stocksMelted,\r
        x='date',\r
        y='price',\r
        color='stock',\r
        template='plotly_dark',\r
        title='기술주 주가 (다크 테마)'\r
    )\r
    figDark\r
  exercise:\r
    prompt: 8단계. 템플릿 적용 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figDark = px.line(\r
          stocksMelted,\r
          x='date',\r
          y='price',\r
          color='stock',\r
          template='plotly_dark',\r
          title='기술주 주가 (다크 테마)'\r
      )\r
      figDark\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 템플릿 적용의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 템플릿 적용의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_subplots\r
  title: 9단계. 서브플롯 생성\r
  structuredPrimary: true\r
  subtitle: make_subplots()\r
  goal: 9단계. 서브플롯 생성에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: make_subplots()로 여러 개의 차트를 하나의 Figure에 배치하여 종합 대시보드를 만듭니다. rows=2, cols=3으로 2행 3열 격자를 정의하고,\r
    subplot_titles로 각 서브플롯의 제목(종목명)을 리스트로 지정합니다. enumerate()와 인덱스 계산(row = i // 3 + 1, col = i % 3 + 1)으로\r
    반복문 내에서 각 종목의 차트를 올바른 위치에 배치하며, go.Scatter는 px.line보다 세밀한 제어가 가능한 저수준 객체입니다. 이렇게 하면 6개 종목을 격자 형태로\r
    나란히 배치하여 한 화면에서 모든 종목의 추이를 비교할 수 있으며, 실무에서는 다양한 지표, 다양한 시점, 다양한 관점의 차트를 하나의 대시보드로 통합하여 의사결정을 지원합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    stockList = ['GOOG', 'AAPL', 'AMZN', 'FB', 'NFLX', 'MSFT']\r
\r
    figSubplots = make_subplots(rows=2, cols=3, subplot_titles=stockList)\r
\r
    for i, stock in enumerate(stockList):\r
        row = i // 3 + 1\r
        col = i % 3 + 1\r
        figSubplots.add_trace(\r
            go.Scatter(x=stocks['date'], y=stocks[stock], name=stock, mode='lines'),\r
            row=row, col=col\r
        )\r
\r
    figSubplots.update_layout(height=600, title_text='종목별 주가 추이')\r
    figSubplots\r
  exercise:\r
    prompt: 9단계. 서브플롯 생성 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      stockList = ['GOOG', 'AAPL', 'AMZN', 'FB', 'NFLX', 'MSFT']\r
\r
      figSubplots = make_subplots(rows=2, cols=3, subplot_titles=stockList)\r
\r
      for i, stock in enumerate(stockList):\r
          row = i // 3 + 1\r
          col = i % 3 + 1\r
          figSubplots.add_trace(\r
              go.Scatter(x=stocks['date'], y=stocks[stock], name=stock, mode='lines'),\r
              row=row, col=col\r
          )\r
\r
      figSubplots.update_layout(height=600, title_text='종목별 주가 추이')\r
      figSubplots\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 서브플롯 생성의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 서브플롯 생성 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_subplots_styled\r
  title: 10단계. 스타일링된 서브플롯\r
  structuredPrimary: true\r
  subtitle: 템플릿 + 서브플롯\r
  goal: 10단계. 스타일링된 서브플롯에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 서브플롯에도 템플릿과 레이아웃 설정을 적용하여 전문적인 대시보드를 완성합니다. 각 종목마다 고유한 색상(colors 리스트)을 지정하여 시각적 구분을 명확히\r
    하고, line=dict(color=colors[i], width=2)로 선 색상과 두께를 개별 제어합니다. template='plotly_dark'는 어두운 배경의 금융 차트\r
    스타일을 적용하여 선이 더 선명하게 보이도록 하며, showlegend=False는 각 서브플롯에 제목이 있어 범례가 불필요하므로 공간을 절약합니다. vertical_spacing=0.12는\r
    행 간격을 조정하여 차트들이 너무 붙지 않도록 하며, 실무에서는 이처럼 색상, 템플릿, 간격을 세밀하게 조정하여 브랜드 정체성을 반영하고 가독성을 극대화합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    colors = ['#00D4FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']\r
\r
    figStyled = make_subplots(rows=2, cols=3, subplot_titles=stockList, vertical_spacing=0.12)\r
\r
    for i, stock in enumerate(stockList):\r
        row = i // 3 + 1\r
        col = i % 3 + 1\r
        figStyled.add_trace(\r
            go.Scatter(\r
                x=stocks['date'],\r
                y=stocks[stock],\r
                name=stock,\r
                mode='lines',\r
                line=dict(color=colors[i], width=2)\r
            ),\r
            row=row, col=col\r
        )\r
\r
    figStyled.update_layout(\r
        height=600,\r
        title_text='기술주 주가 비교 대시보드',\r
        template='plotly_dark',\r
        showlegend=False\r
    )\r
    figStyled\r
  exercise:\r
    prompt: 10단계. 스타일링된 서브플롯 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      colors = ['#00D4FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']\r
\r
      figStyled = make_subplots(rows=2, cols=3, subplot_titles=stockList, vertical_spacing=0.12)\r
\r
      for i, stock in enumerate(stockList):\r
          row = i // 3 + 1\r
          col = i % 3 + 1\r
          figStyled.add_trace(\r
              go.Scatter(\r
                  x=stocks['date'],\r
                  y=stocks[stock],\r
                  name=stock,\r
                  mode='lines',\r
                  line=dict(color=colors[i], width=2)\r
              ),\r
              row=row, col=col\r
          )\r
\r
      figStyled.update_layout(\r
          height=600,\r
          title_text='기술주 주가 비교 대시보드',\r
          template='plotly_dark',\r
          showlegend=False\r
      )\r
      figStyled\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 스타일링된 서브플롯의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 스타일링된 서브플롯 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step11_result\r
  title: 11단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 다중 주식 비교 차트\r
  goal: 11단계. 최종 결과물에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 모든 개념을 종합한 최종 비교 차트입니다. 정규화된 가격으로 수익률을 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal = make_subplots(\r
        rows=2, cols=1,\r
        subplot_titles=['주가 추이 비교', '종목별 개별 추이'],\r
        row_heights=[0.6, 0.4],\r
        vertical_spacing=0.15\r
    )\r
\r
    for i, stock in enumerate(stockList):\r
        figFinal.add_trace(\r
            go.Scatter(\r
                x=stocks['date'],\r
                y=(stocks[stock] - 1) * 100,\r
                name=stock,\r
                mode='lines',\r
                line=dict(width=2)\r
            ),\r
            row=1, col=1\r
        )\r
\r
    for i, stock in enumerate(stockList):\r
        figFinal.add_trace(\r
            go.Scatter(\r
                x=stocks['date'],\r
                y=stocks[stock],\r
                name=stock,\r
                mode='lines',\r
                line=dict(width=1),\r
                showlegend=False\r
            ),\r
            row=2, col=1\r
        )\r
\r
    figFinal.update_layout(\r
        height=800,\r
        title_text='기술주 시계열 분석 대시보드',\r
        template='plotly_dark',\r
        legend=dict(orientation='h', yanchor='bottom', y=1.02, xanchor='center', x=0.5)\r
    )\r
    figFinal.update_yaxes(title_text='수익률 (%)', row=1, col=1)\r
    figFinal.update_yaxes(title_text='상대 가격', row=2, col=1)\r
    figFinal\r
  exercise:\r
    prompt: 11단계. 최종 결과물 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal = make_subplots(\r
          rows=2, cols=1,\r
          subplot_titles=['주가 추이 비교', '종목별 개별 추이'],\r
          row_heights=[0.6, 0.4],\r
          vertical_spacing=0.15\r
      )\r
\r
      for i, stock in enumerate(stockList):\r
          figFinal.add_trace(\r
              go.Scatter(\r
                  x=stocks['date'],\r
                  y=(stocks[stock] - 1) * 100,\r
                  name=stock,\r
                  mode='lines',\r
                  line=dict(width=2)\r
              ),\r
              row=1, col=1\r
          )\r
\r
      for i, stock in enumerate(stockList):\r
          figFinal.add_trace(\r
              go.Scatter(\r
                  x=stocks['date'],\r
                  y=stocks[stock],\r
                  name=stock,\r
                  mode='lines',\r
                  line=dict(width=1),\r
                  showlegend=False\r
              ),\r
              row=2, col=1\r
          )\r
\r
      figFinal.update_layout(\r
          height=800,\r
          title_text='기술주 시계열 분석 대시보드',\r
          template='plotly_dark',\r
          legend=dict(orientation='h', yanchor='bottom', y=1.02, xanchor='center', x=0.5)\r
      )\r
      figFinal.update_yaxes(title_text='수익률 (%)', row=1, col=1)\r
      figFinal.update_yaxes(title_text='상대 가격', row=2, col=1)\r
      figFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 최종 결과물의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 11단계. 최종 결과물 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 주식 분석 프로젝트\r
  goal: 실습에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    배운 내용으로 주식 시계열 분석을 해봅시다. 각 미션은 템플릿 변경, 패싯 활용, 레이아웃 커스터마이징, 서브플롯 비교 등 실전에서 자주 사용하는 기법들을 종합합니다. 완성하면 다양한 스타일의 시계열 차트를 만들고, 여러 종목을 효과적으로 비교 분석할 수 있게 되며, 실무 금융 대시보드 제작에 필요한 모든 스킬을 갖추게 됩니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import plotly.express as px\r
    import pandas as pd\r
\r
    priceData = px.data.stocks()\r
    twoStock = priceData.melt(id_vars='date', value_vars=['AAPL', 'MSFT'], var_name='stock', value_name='price')\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      import pandas as pd\r
\r
      priceData = px.data.stocks()\r
      twoStock = priceData.melt(id_vars='date', value_vars=['AAPL', 'MSFT'], var_name='stock', value_name='price')\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`priceData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: Plotly 주식 시계열 분석을 배웠습니다. px.line으로 시계열 기본을 익히고, 데이터 변환(melt)과 패싯으로 다중 종목 비교를 마스터했으며, update_layout과\r
      update_traces로 세밀한 스타일링을 구현했습니다. 특히 template을 활용한 테마 변경과 make_subplots를 통한 대시보드 구성은 실무 금융 분석에서 필수적인\r
      기술이며, 이 개념들은 주식뿐 아니라 매출, 트래픽, 센서 데이터 등 모든 시계열 분석에 동일하게 적용됩니다.\r
  - type: list\r
    items:\r
    - px.line() - 시계열 선 그래프\r
    - facet_col - 종목별 분리 차트\r
    - update_layout() - 레이아웃 커스터마이징\r
    - update_traces() - 선 스타일 변경\r
    - template - 차트 테마 적용\r
    - make_subplots() - 여러 차트 배치\r
  - type: text\r
    content: 다음 시간에는 모든 개념을 종합한 대시보드 프로젝트를 진행합니다.\r
  goal: 정리에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
- id: workflow_validation\r
  title: 12단계. 주식 시계열 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 12단계. 주식 시계열 검증 루프에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    시계열 선 그래프는 날짜 정렬과 종목 컬럼 검증이 먼저입니다. Figure trace가 종목 수와 맞는지 확인하고, 수익률 기준으로 변주합니다.\r
\r
    시계열 차트는 trace가 보이는지만 보지 말고 날짜 정렬, 누락, 수익률 기준을 함께 검증해야 합니다.\r
  snippet: |-\r
    import plotly.express as px\r
\r
    stockFlow = px.data.stocks()\r
    stockColumns = ["GOOG", "AAPL", "AMZN", "FB", "NFLX", "MSFT"]\r
    requiredColumns = {"date", *stockColumns}\r
    missingColumns = requiredColumns - set(stockFlow.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert stockFlow[stockColumns].gt(0).all().all()\r
    assert stockFlow["date"].is_monotonic_increasing\r
  exercise:\r
    prompt: 12단계. 주식 시계열 검증 루프 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
\r
      stockFlow = px.data.stocks()\r
      stockColumns = ["GOOG", "AAPL", "AMZN", "FB", "NFLX", "MSFT"]\r
      requiredColumns = {"date", *stockColumns}\r
      missingColumns = requiredColumns - set(stockFlow.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert stockFlow[stockColumns].gt(0).all().all()\r
      assert stockFlow["date"].is_monotonic_increasing\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 주식 시계열 검증 루프에서 \`stockFlow\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 12단계. 주식 시계열 검증 루프에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
`;export{e as default};