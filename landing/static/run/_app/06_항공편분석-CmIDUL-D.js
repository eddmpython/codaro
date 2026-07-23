var e=`meta:\r
  packages:\r
  - altair\r
  - pandas\r
  id: altair_06\r
  title: 항공편분석\r
  order: 6\r
  category: altair\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - mark_rect\r
  - heatmap\r
  - mark_line\r
  - scale\r
  - flights\r
  seo:\r
    title: Altair 히트맵 - 항공편 승객 분석\r
    description: Altair로 히트맵을 만들고 색상 스케일을 커스터마이징합니다. mark_rect, scale, scheme을 배웁니다.\r
    keywords:\r
    - altair heatmap\r
    - mark_rect\r
    - color scale\r
    - flights\r
intro:\r
  emoji: ✈️\r
  goal: 항공편 승객 데이터로 히트맵과 라인 차트를 만들어 시계열 패턴을 분석합니다.\r
  description: mark_rect()로 히트맵을 만들고, scale로 색상을 커스터마이징합니다.\r
  direction: 항공편분석에서 데이터와 인코딩 규칙을 분리해 재사용 가능한 차트를 구성합니다.\r
  benefits:\r
  - 정리된 테이블 확인 후 채널 인코딩에 맞는 코드 입력을 고릅니다.\r
  - 항공편분석 결과를 스케일과 마크 매핑 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 선언형 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(정리된 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 라인 차트 처리 실행\r
      detail: 채널 인코딩 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 다중 라인 결과 검증\r
      detail: 스케일과 마크 매핑 기준으로 실행 결과를 비교합니다.\r
    - label: 항공편분석 재사용\r
      detail: 완성 코드를 선언형 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 선언형 차트 환경\r
      detail: altair, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 항공편분석 실행\r
      detail: 셀을 실행해 스케일과 마크 매핑와 예외 상태를 확인합니다.\r
    - label: 항공편분석 완료\r
      detail: 검증된 코드를 선언형 대시보드로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: seaborn-data\r
  goal: 1단계. 데이터 불러오기에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: Codaro 로컬 데이터셋에서 flights 데이터를 불러옵니다. 1949년부터 1960년까지 12년간 매월 비행기를 탄 사람 수를 기록한 데이터입니다. year는\r
    연도(1949~1960), month는 월(Jan, Feb 등), passengers는 승객 수(천 명 단위)를 나타냅니다. 12년 × 12개월 = 총 144개 행이 있습니다.\r
    import는 라이브러리를 가져오는 명령어입니다. altair는 시각화, pandas는 데이터 처리, warnings는 경고 메시지 관리를 담당합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import altair as alt\r
    import pandas as pd\r
    import warnings\r
    warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    flights = loadLocalDataset("flights")\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      import pandas as pd\r
      import warnings\r
      warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      flights = loadLocalDataset("flights")\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_line_chart\r
  title: 2단계. 라인 차트\r
  structuredPrimary: true\r
  subtitle: mark_line()\r
  goal: 2단계. 라인 차트에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    먼저 연도별 총 승객 수 추이를 라인 차트로 확인합니다. 라인 차트는 시간에 따른 변화를 선으로 연결해 보여주는 차트입니다. mark_line()은 "선 모양으로 그려라"는 뜻입니다. mark는 "표시하다", line은 "선"을 의미합니다. encode() 안에는 x축과 y축에 무엇을 표시할지 지정합니다. sum(passengers)는 "승객 수를 모두 더하라"는 의미입니다. 같은 연도의 모든 월 데이터를 합산합니다.\r
\r
    year:O에서 :O는 "Ordinal(순서형)"이라는 뜻입니다. 연도는 숫자지만 1949, 1950, 1951처럼 순서가 있는 범주로 취급합니다. 콜론(:) 뒤에 데이터 타입을 적어주는 것이 Altair의 규칙입니다. :Q는 수량형, :N은 명목형, :O는 순서형입니다.\r
  tips:\r
  - year:O에서 :O는 "Ordinal(순서형)"이라는 뜻입니다. 연도는 숫자지만 1949, 1950, 1951처럼 순서가 있는 범주로 취급합니다. 콜론(:) 뒤에 데이터 타입을\r
    적어주는 것이 Altair의 규칙입니다. :Q는 수량형, :N은 명목형, :O는 순서형입니다.\r
  snippet: |-\r
    chartLine = alt.Chart(flights).mark_line().encode(\r
        x='year:O',\r
        y='sum(passengers):Q'\r
    )\r
    chartLine\r
  exercise:\r
    prompt: 2단계. 라인 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartLine = alt.Chart(flights).mark_line().encode(\r
          x='year:O',\r
          y='sum(passengers):Q'\r
      )\r
      chartLine\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 라인 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 라인 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step3_multi_line\r
  title: 3단계. 다중 라인\r
  structuredPrimary: true\r
  subtitle: 월별 비교\r
  goal: 3단계. 다중 라인에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 이번에는 여러 개의 라인을 한 차트에 그려봅니다. color 인코딩을 추가하면 카테고리별로 색상을 달리해 여러 라인을 구분할 수 있습니다. color='month:N'은\r
    "월(month)마다 다른 색상을 지정하라"는 의미입니다. 1월은 파란색, 2월은 주황색 이런 식으로 자동으로 색이 배정됩니다. 이렇게 하면 각 월이 연도별로 어떻게 변했는지\r
    한눈에 비교할 수 있습니다. 예를 들어 7월 라인과 1월 라인을 보면 여름철이 겨울철보다 승객이 많다는 것을 알 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartMultiLine = alt.Chart(flights).mark_line().encode(\r
        x='year:O',\r
        y='passengers:Q',\r
        color='month:N'\r
    )\r
    chartMultiLine\r
  exercise:\r
    prompt: 3단계. 다중 라인 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartMultiLine = alt.Chart(flights).mark_line().encode(\r
          x='year:O',\r
          y='passengers:Q',\r
          color='month:N'\r
      )\r
      chartMultiLine\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 다중 라인의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 다중 라인의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step4_heatmap_intro\r
  title: 4단계. 히트맵 기초\r
  structuredPrimary: true\r
  subtitle: mark_rect()\r
  goal: 4단계. 히트맵 기초에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    히트맵은 2차원 데이터를 색상의 진하기로 표현하는 차트입니다. 숫자가 클수록 진한 색, 작을수록 옅은 색으로 표시됩니다. mark_rect()는 "사각형 모양으로 그려라"는 뜻입니다. rect는 rectangle(사각형)의 줄임말입니다. x축에 연도, y축에 월을 배치하고, color에 승객 수를 넣으면 각 칸의 색상이 승객 수에 따라 달라집니다. 이렇게 하면 어느 연도 어느 달에 승객이 많았는지 색상만으로도 한눈에 파악할 수 있습니다.\r
\r
    히트맵은 2차원 데이터를 색상으로 표현합니다. 여름철(6-8월) 승객이 많고, 연도가 지날수록 전체 승객이 증가합니다.\r
  snippet: |-\r
    chartHeatmap = alt.Chart(flights).mark_rect().encode(\r
        x='year:O',\r
        y='month:O',\r
        color='passengers:Q'\r
    )\r
    chartHeatmap\r
  exercise:\r
    prompt: 4단계. 히트맵 기초 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartHeatmap = alt.Chart(flights).mark_rect().encode(\r
          x='year:O',\r
          y='month:O',\r
          color='passengers:Q'\r
      )\r
      chartHeatmap\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 히트맵 기초의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 히트맵 기초의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_month_order\r
  title: 5단계. 월 순서 정렬\r
  structuredPrimary: true\r
  subtitle: sort 파라미터\r
  goal: 5단계. 월 순서 정렬에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 기본 히트맵을 보면 월 순서가 Apr, Aug, Dec... 처럼 알파벳 순서로 되어있습니다. 이것을 1월, 2월, 3월 순으로 정렬해야 읽기 쉽습니다. 리스트는\r
    여러 값을 순서대로 담는 상자입니다. 대괄호 []로 만들며, 쉼표로 값을 구분합니다. monthOrder 변수에 1월부터 12월까지 순서대로 저장합니다. alt.Y()는 y축\r
    설정을 세밀하게 조정할 때 사용합니다. 괄호 안에 첫 번째 인자로 컬럼명('month:O')을, sort 파라미터로 원하는 순서(monthOrder)를 지정하면 그 순서대로 표시됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',\r
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']\r
\r
    chartOrdered = alt.Chart(flights).mark_rect().encode(\r
        x='year:O',\r
        y=alt.Y('month:O', sort=monthOrder),\r
        color='passengers:Q'\r
    )\r
    chartOrdered\r
  exercise:\r
    prompt: 5단계. 월 순서 정렬 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',\r
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']\r
\r
      chartOrdered = alt.Chart(flights).mark_rect().encode(\r
          x='year:O',\r
          y=alt.Y('month:O', sort=monthOrder),\r
          color='passengers:Q'\r
      )\r
      chartOrdered\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 월 순서 정렬의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 월 순서 정렬의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_color_scale\r
  title: 6단계. 색상 스케일\r
  structuredPrimary: true\r
  subtitle: scale(scheme)\r
  goal: 6단계. 색상 스케일에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    지금까지는 Altair가 자동으로 색상을 정해줬습니다. 이번에는 원하는 색상 조합(팔레트)을 직접 지정해봅니다. alt.Color()는 색상 설정을 세밀하게 조정할 때 사용합니다. 첫 번째 인자로 컬럼명('passengers:Q')을 주고, scale 파라미터에 alt.Scale()을 넣습니다. alt.Scale(scheme='viridis')에서 scheme은 "색상 조합"이라는 뜻입니다. viridis는 보라색에서 노란색으로 변하는 색상 조합으로, 데이터 분석에서 많이 사용됩니다.\r
\r
    다른 팔레트: 'blues', 'greens', 'oranges', 'reds', 'purples', 'plasma', 'inferno', 'magma' 등이 있습니다.\r
  tips:\r
  - '다른 팔레트: ''blues'', ''greens'', ''oranges'', ''reds'', ''purples'', ''plasma'', ''inferno'', ''magma''\r
    등이 있습니다.'\r
  snippet: |-\r
    chartScale = alt.Chart(flights).mark_rect().encode(\r
        x='year:O',\r
        y=alt.Y('month:O', sort=monthOrder),\r
        color=alt.Color('passengers:Q', scale=alt.Scale(scheme='viridis'))\r
    )\r
    chartScale\r
  exercise:\r
    prompt: 6단계. 색상 스케일 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartScale = alt.Chart(flights).mark_rect().encode(\r
          x='year:O',\r
          y=alt.Y('month:O', sort=monthOrder),\r
          color=alt.Color('passengers:Q', scale=alt.Scale(scheme='viridis'))\r
      )\r
      chartScale\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 색상 스케일의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 색상 스케일의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_legend\r
  title: 7단계. 범례 커스터마이징\r
  structuredPrimary: true\r
  subtitle: legend 설정\r
  goal: 7단계. 범례 커스터마이징에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 범례는 차트 옆에 나타나는 색상 설명 박스입니다. "이 색은 무엇을 의미하는가"를 알려주는 가이드 역할을 합니다. legend 파라미터로 범례를 커스터마이징할\r
    수 있습니다. alt.Legend() 괄호 안에 title로 제목을, orient로 위치를 지정합니다. orient='bottom'은 "방향을 아래쪽으로"라는 뜻입니다. 범례가\r
    차트 하단에 가로로 배치됩니다. 'right'로 바꾸면 오른쪽에 세로로 나타납니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartLegend = alt.Chart(flights).mark_rect().encode(\r
        x='year:O',\r
        y=alt.Y('month:O', sort=monthOrder),\r
        color=alt.Color(\r
            'passengers:Q',\r
            scale=alt.Scale(scheme='blues'),\r
            legend=alt.Legend(title='승객 수', orient='bottom')\r
        )\r
    )\r
    chartLegend\r
  exercise:\r
    prompt: 7단계. 범례 커스터마이징 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartLegend = alt.Chart(flights).mark_rect().encode(\r
          x='year:O',\r
          y=alt.Y('month:O', sort=monthOrder),\r
          color=alt.Color(\r
              'passengers:Q',\r
              scale=alt.Scale(scheme='blues'),\r
              legend=alt.Legend(title='승객 수', orient='bottom')\r
          )\r
      )\r
      chartLegend\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 범례 커스터마이징의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 범례 커스터마이징의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_tooltip\r
  title: 8단계. 툴팁 추가\r
  structuredPrimary: true\r
  subtitle: 상세 정보\r
  goal: 8단계. 툴팁 추가에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: tooltip은 "툴팁", 즉 마우스를 올렸을 때 나타나는 작은 정보 상자입니다. 차트 위에 마우스를 가져가면 정확한 숫자를 볼 수 있습니다. tooltip에\r
    리스트(대괄호 [])로 컬럼명들을 나열하면, 해당 정보들이 모두 툴팁에 표시됩니다. 히트맵은 색상으로 대략적인 크기를 보여주지만, 정확한 승객 수는 툴팁으로 확인해야 합니다.\r
    예를 들어 1960년 7월에 정확히 몇 명이 탔는지 알 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartTooltip = alt.Chart(flights).mark_rect().encode(\r
        x='year:O',\r
        y=alt.Y('month:O', sort=monthOrder),\r
        color=alt.Color('passengers:Q', scale=alt.Scale(scheme='oranges')),\r
        tooltip=['year', 'month', 'passengers']\r
    )\r
    chartTooltip\r
  exercise:\r
    prompt: 8단계. 툴팁 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartTooltip = alt.Chart(flights).mark_rect().encode(\r
          x='year:O',\r
          y=alt.Y('month:O', sort=monthOrder),\r
          color=alt.Color('passengers:Q', scale=alt.Scale(scheme='oranges')),\r
          tooltip=['year', 'month', 'passengers']\r
      )\r
      chartTooltip\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 툴팁 추가의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 툴팁 추가의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_final\r
  title: 9단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 항공 승객 히트맵\r
  goal: 9단계. 최종 결과물에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    이제 지금까지 배운 모든 개념을 하나로 합쳐 완성도 높은 히트맵을 만듭니다. 월 순서 정렬, 색상 팔레트, 범례, 툴팁이 모두 포함됩니다. properties() 메서드는 차트의 전체적인 속성을 설정합니다. title로 제목을, width와 height로 크기를 지정합니다. alt.Tooltip()을 사용하면 툴팁에 표시될 이름(title)도 바꿀 수 있습니다. 예를 들어 'year:O' 대신 '연도'라고 표시됩니다.\r
\r
    1950년대 후반으로 갈수록 승객이 급증하고, 여름(7-8월)에 승객이 가장 많습니다. 항공 산업의 성장과 계절적 패턴이 명확히 보입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartFinal = alt.Chart(flights).mark_rect().encode(\r
        x=alt.X('year:O', title='연도'),\r
        y=alt.Y('month:O', sort=monthOrder, title='월'),\r
        color=alt.Color(\r
            'passengers:Q',\r
            scale=alt.Scale(scheme='viridis'),\r
            legend=alt.Legend(title='승객 수 (천명)')\r
        ),\r
        tooltip=[\r
            alt.Tooltip('year:O', title='연도'),\r
            alt.Tooltip('month:O', title='월'),\r
            alt.Tooltip('passengers:Q', title='승객 수')\r
        ]\r
    ).properties(\r
        title='1949-1960년 월별 항공 승객 수',\r
        width=400,\r
        height=300\r
    )\r
    chartFinal\r
  exercise:\r
    prompt: 9단계. 최종 결과물 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartFinal = alt.Chart(flights).mark_rect().encode(\r
          x=alt.X('year:O', title='연도'),\r
          y=alt.Y('month:O', sort=monthOrder, title='월'),\r
          color=alt.Color(\r
              'passengers:Q',\r
              scale=alt.Scale(scheme='viridis'),\r
              legend=alt.Legend(title='승객 수 (천명)')\r
          ),\r
          tooltip=[\r
              alt.Tooltip('year:O', title='연도'),\r
              alt.Tooltip('month:O', title='월'),\r
              alt.Tooltip('passengers:Q', title='승객 수')\r
          ]\r
      ).properties(\r
          title='1949-1960년 월별 항공 승객 수',\r
          width=400,\r
          height=300\r
      )\r
      chartFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 최종 결과물의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 최종 결과물의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 항공 데이터 시각화 프로젝트\r
  goal: 실습에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    이 프로젝트에서 배운 내용을 정리하면: mark_rect()로 히트맵 그리기, mark_line()으로 라인 차트 그리기, sort로 순서 정렬, scale로 색상 변경, legend로 범례 설정, tooltip으로 상세 정보 표시입니다. 이제 배운 개념들을 직접 조합해서 새로운 차트를 만들어봅시다. 미션마다 어떤 개념을 사용하는지 확인하세요.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import altair as alt\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
    air = loadLocalDataset("flights")\r
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
      air = loadLocalDataset("flights")\r
      months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: Altair로 히트맵과 색상 스케일을 마스터했습니다!\r
  - type: list\r
    items:\r
    - mark_rect() - 사각형 마크로 히트맵 생성\r
    - mark_line() - 라인 차트로 시계열 표현\r
    - scale=alt.Scale(scheme='...') - 색상 팔레트 변경\r
    - legend=alt.Legend(title, orient) - 범례 커스터마이징\r
    - sort=[...] - 축 순서 지정\r
    - alt.Tooltip() - 툴팁 상세 설정\r
  - type: text\r
    content: 다음 프로젝트에서는 인터랙티브 필터와 선택 기능을 배웁니다.\r
  goal: 정리에서 정리된 테이블을 바꿨을 때 스케일과 마크 매핑가 어떻게 달라지는지 확인한다.\r
  why: 선언형 차트는 데이터 필드와 시각 표현의 관계를 명확하게 관리하게 해줍니다.\r
- id: workflow_validation\r
  title: 10단계. 항공편 Heatmap 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 10단계. 항공편 Heatmap 검증 루프에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    항공편 시계열은 연도와 월 조합이 정확해야 heatmap이 의미를 가집니다. 키 중복과 색상 인코딩을 함께 검증합니다.\r
\r
    Heatmap은 예쁘게 보이기 전에 키 유일성과 색상 값의 의미를 검증해야 합니다.\r
  snippet: |-\r
    import altair as alt\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    flightFlow = loadLocalDataset("flights")\r
    requiredColumns = {"year", "month", "passengers"}\r
    missingColumns = requiredColumns - set(flightFlow.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert flightFlow["month"].nunique() == 12\r
    assert flightFlow["year"].nunique() == 12\r
    assert flightFlow.groupby("year")["passengers"].sum().iloc[-1] > flightFlow.groupby("year")["passengers"].sum().iloc[0]\r
  exercise:\r
    prompt: 10단계. 항공편 Heatmap 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      flightFlow = loadLocalDataset("flights")\r
      requiredColumns = {"year", "month", "passengers"}\r
      missingColumns = requiredColumns - set(flightFlow.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert flightFlow["month"].nunique() == 12\r
      assert flightFlow["year"].nunique() == 12\r
      assert flightFlow.groupby("year")["passengers"].sum().iloc[-1] > flightFlow.groupby("year")["passengers"].sum().iloc[0]\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 항공편 Heatmap 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. 항공편 Heatmap 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};