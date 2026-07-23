var e=`meta:\r
  packages:\r
  - pandas\r
  - plotly\r
  id: plotly_07\r
  title: 레스토랑매출분석\r
  order: 7\r
  category: plotly\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - tips\r
  - bar\r
  - box\r
  - heatmap\r
  - make_subplots\r
  - 대시보드\r
  seo:\r
    title: Plotly 레스토랑 팁 분석 대시보드 - make_subplots 활용\r
    description: 레스토랑 팁 데이터로 다각도 분석 대시보드를 만듭니다. 막대, 박스, 히트맵 차트와 make_subplots를 활용합니다.\r
    keywords:\r
    - plotly make_subplots\r
    - density_heatmap\r
    - 대시보드\r
    - 팁 분석\r
    - 서브플롯\r
intro:\r
  emoji: 🍽️\r
  goal: 레스토랑 팁 데이터로 "다각도 팁 분석 대시보드"를 만듭니다.\r
  description: 막대, 박스, 히트맵 차트를 개별 분석한 뒤 make_subplots로 하나의 대시보드로 통합합니다.\r
  direction: 레스토랑매출분석에서 데이터를 상호작용 차트로 구성하고 필터와 표시 상태를 검증합니다.\r
  benefits:\r
  - 대시보드 데이터 확인 후 인터랙티브 시각화에 맞는 코드 입력을 고릅니다.\r
  - 레스토랑매출분석 결과를 툴팁과 선택 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 공유 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(대시보드 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 요일별 평균 팁 막대 처리 실행\r
      detail: 인터랙티브 시각화 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 시간대별 팁 분포 결과 검증\r
      detail: 툴팁과 선택 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 레스토랑매출분석 재사용\r
      detail: 완성 코드를 공유 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 인터랙티브 차트 환경\r
      detail: pandas, plotly 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 레스토랑매출분석 실행\r
      detail: 셀을 실행해 툴팁과 선택 상태와 예외 상태를 확인합니다.\r
    - label: 레스토랑매출분석 완료\r
      detail: 검증된 코드를 공유 대시보드로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: tips.csv 로드\r
  goal: 1단계. 데이터 불러오기에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    레스토랑 팁 데이터를 사용합니다. 244명 손님의 결제 금액, 팁, 요일, 시간 등의 정보를 담고 있습니다. 이 데이터는 1990년대 미국 레스토랑에서 수집된 실제 데이터로, 팁에 영향을 미치는 다양한 요인(성별, 흡연 여부, 요일, 시간대, 일행 수)을 분석할 수 있습니다. 레스토랑 운영자는 이런 분석을 통해 직원 배치를 최적화하고, 고객 서비스 전략을 수립하며, 매출 예측 모델을 개선할 수 있습니다. plotly.express뿐 아니라 make_subplots와 graph_objects도 import하여 고급 대시보드를 만들 준비를 합니다. 실무에서는 이처럼 여러 관점에서 데이터를 분석하고 하나의 대시보드로 통합하여 의사결정을 지원하며, 경영진이 한눈에 핵심 지표를 파악할 수 있도록 시각화합니다.\r
\r
    from plotly.subplots import make_subplots는 여러 차트를 하나의 Figure에 배치하는 기능을 제공합니다. plotly.graph_objects는 go로 줄여 쓰며, Bar, Box, Scatter 등 저수준 차트 객체를 직접 생성할 때 사용합니다. px(plotly.express)는 고수준 간편 인터페이스이고, go는 세밀한 제어가 가능한 저수준 인터페이스입니다. 복잡한 대시보드 작업 시 두 방식을 혼용합니다.\r
  tips:\r
  - from plotly.subplots import make_subplots는 여러 차트를 하나의 Figure에 배치하는 기능을 제공합니다. plotly.graph_objects는\r
    go로 줄여 쓰며, Bar, Box, Scatter 등 저수준 차트 객체를 직접 생성할 때 사용합니다. px(plotly.express)는 고수준 간편 인터페이스이고, go는\r
    세밀한 제어가 가능한 저수준 인터페이스입니다. 복잡한 대시보드 작업 시 두 방식을 혼용합니다.\r
  snippet: |-\r
    import plotly.express as px\r
    from plotly.subplots import make_subplots\r
    import plotly.graph_objects as go\r
    import pandas as pd\r
\r
    tips = px.data.tips()\r
    tips\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 \`tips\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      from plotly.subplots import make_subplots\r
      import plotly.graph_objects as go\r
      import pandas as pd\r
\r
      tips = px.data.tips()\r
      tips\r
    hints:\r
    - 바꿀 지점은 \`tips = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`tips\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기에서 \`tips\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기 실행 뒤 \`tips\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step2_bar\r
  title: 2단계. 요일별 평균 팁 막대 그래프\r
  structuredPrimary: true\r
  subtitle: px.bar (반복)\r
  goal: 2단계. 요일별 평균 팁 막대 그래프에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 2단계. 요일별 평균 팁 막대 그래프의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - astype('category').cat.reorder_categories()는 범주형 데이터의 순서를 사용자 정의하는 pandas 메서드입니다. 기본 알파벳 순서가 아닌 의미\r
    있는 순서(시간 순서, 크기 순서 등)로 정렬할 때 사용합니다. 이후 sort_values()로 정렬하면 지정한 순서대로 나타납니다. Plotly 차트에서 x축 순서를 제어하는\r
    가장 확실한 방법입니다.\r
  snippet: |-\r
    tipsByDay = tips.groupby('day', as_index=False)['tip'].mean()\r
    dayOrder = ['Thur', 'Fri', 'Sat', 'Sun']\r
    tipsByDay['day'] = tipsByDay['day'].astype('category').cat.reorder_categories(dayOrder)\r
    tipsByDay = tipsByDay.sort_values('day')\r
\r
    figBar = px.bar(\r
        tipsByDay,\r
        x='day',\r
        y='tip',\r
        color='day',\r
        title='요일별 평균 팁'\r
    )\r
    figBar.update_layout(showlegend=False)\r
    figBar\r
  exercise:\r
    prompt: 2단계. 요일별 평균 팁 막대 그래프 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      tipsByDay = tips.groupby('day', as_index=False)['tip'].mean()\r
      dayOrder = ['Thur', 'Fri', 'Sat', 'Sun']\r
      tipsByDay['day'] = tipsByDay['day'].astype('category').cat.reorder_categories(dayOrder)\r
      tipsByDay = tipsByDay.sort_values('day')\r
\r
      figBar = px.bar(\r
          tipsByDay,\r
          x='day',\r
          y='tip',\r
          color='day',\r
          title='요일별 평균 팁'\r
      )\r
      figBar.update_layout(showlegend=False)\r
      figBar\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 요일별 평균 팁 막대 그래프의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 요일별 평균 팁 막대 그래프의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step3_box\r
  title: 3단계. 시간대별 팁 분포\r
  structuredPrimary: true\r
  subtitle: px.box (반복)\r
  goal: 3단계. 시간대별 팁 분포에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 박스 플롯으로 점심과 저녁의 팁 분포를 비교합니다. 평균 팁은 유사할 수 있지만, 분포의 형태는 매우 다를 수 있기 때문에 박스 플롯이 필요합니다. 박스 플롯은\r
    평균만으로는 알 수 없는 데이터의 전체 분포 형태를 보여주며, 중앙값(median), 사분위수(Q1, Q3), 이상치를 한눈에 파악할 수 있게 합니다. 상자의 중앙선은 중앙값(50\r
    percentile), 상자의 아래/위 경계는 25/75 percentile, 상자의 세로 길이는 사분위 범위(IQR = Q3-Q1)를 나타내며, 수염의 끝은 IQR의 1.5배\r
    범위 내 최소·최대값, 그 밖의 점들은 이상치를 의미합니다. 점심과 저녁의 팁 분포가 어떻게 다른지, 어느 시간대가 변동성이 큰지, 극단값이 많은지를 비교할 수 있습니다. 실무에서는\r
    평균 비교만으로 부족할 때 분포를 함께 확인하여 더 정확한 의사결정을 내리며, 특히 마케팅 전략 수립 시 고객 세그먼트별 분포 분석이 필수적입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figBox = px.box(\r
        tips,\r
        x='time',\r
        y='tip',\r
        color='time',\r
        title='시간대별 팁 분포'\r
    )\r
    figBox.update_layout(showlegend=False)\r
    figBox\r
  exercise:\r
    prompt: 3단계. 시간대별 팁 분포 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBox = px.box(\r
          tips,\r
          x='time',\r
          y='tip',\r
          color='time',\r
          title='시간대별 팁 분포'\r
      )\r
      figBox.update_layout(showlegend=False)\r
      figBox\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 시간대별 팁 분포의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 시간대별 팁 분포의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step4_facet\r
  title: 4단계. 성별/흡연 여부별 분석\r
  structuredPrimary: true\r
  subtitle: facet_col (반복)\r
  goal: 4단계. 성별/흡연 여부별 분석에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: facet_col로 성별에 따라 차트를 나눠서 비교합니다. 하나의 차트에 모든 조건을 표시하면 겹쳐서 보기 어렵기 때문에 패싯으로 분리합니다. facet(패싯)은\r
    하나의 차트를 여러 조건으로 분할하여 나란히 배치하는 기법으로, 조건 간 비교를 직관적으로 만들어줍니다. 여기서는 남성과 여성을 별도 패널로 나누고, 각 패널 내에서 흡연자·비흡연자를\r
    색상으로 구분하여 2차원 분석(성별 × 흡연 여부)을 수행합니다. 이를 통해 "남성 흡연자", "여성 비흡연자" 같은 세분화된 그룹별 팁 패턴을 발견할 수 있습니다. height=400으로\r
    높이를 조정하여 두 패널이 나란히 잘 보이도록 하며, 실무에서는 패싯을 활용해 연령대별, 지역별, 시간대별 등 다차원 비교 분석을 수행합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFacet = px.box(\r
        tips,\r
        x='day',\r
        y='tip',\r
        color='smoker',\r
        facet_col='sex',\r
        title='성별/흡연별 팁 분포'\r
    )\r
    figFacet.update_layout(height=400)\r
    figFacet\r
  exercise:\r
    prompt: 4단계. 성별/흡연 여부별 분석 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFacet = px.box(\r
          tips,\r
          x='day',\r
          y='tip',\r
          color='smoker',\r
          facet_col='sex',\r
          title='성별/흡연별 팁 분포'\r
      )\r
      figFacet.update_layout(height=400)\r
      figFacet\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 성별/흡연 여부별 분석의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 성별/흡연 여부별 분석의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_density_heatmap\r
  title: 5단계. 결제금액-팁 관계 히트맵\r
  structuredPrimary: true\r
  subtitle: px.density_heatmap (신규)\r
  goal: 5단계. 결제금액팁 관계 히트맵에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    density_heatmap은 두 수치 변수의 밀도를 색상으로 표현하는 신규 차트 타입입니다. 결제 금액과 팁의 관계를 시각화하여 "결제 금액이 높으면 팁도 높은가?"라는 질문에 답합니다. 산점도는 점이 많으면 겹쳐서(overplotting) 밀도를 파악하기 어렵지만, 밀도 히트맵은 x, y 축을 격자로 나누고 각 셀에 속하는 데이터 개수를 색상 진하기로 표현하여 패턴이 명확히 드러납니다. nbinsx, nbinsy는 x축과 y축을 몇 개 구간(bin)으로 나눌지 지정하며, 구간이 많을수록 세밀하게 보이지만 너무 많으면(50개 이상) 각 셀의 데이터 개수가 적어져 노이즈가 생기고, 너무 적으면(5개 이하) 디테일이 사라지므로 10~30 사이가 적당합니다. 색이 진한 영역이 데이터가 밀집된 곳이며, 결제 금액이 높을수록 팁도 높아지는지, 선형 관계인지, 이상치는 어디에 있는지 등을 한눈에 파악할 수 있습니다. 실무에서는 수만 건 이상의 대용량 데이터에서 산점도 대신 밀도 히트맵을 사용하여 성능과 가독성을 동시에 확보합니다.\r
\r
    px.density_heatmap은 산점도처럼 두 변수의 관계를 보여주지만, 점 대신 밀도를 색상으로 표현합니다. 데이터가 많이 집중된 영역이 진하게 나타나 패턴을 파악하기 좋습니다. nbinsx, nbinsy로 구간 수를 조절하며, 10~30 사이가 적당합니다. 구간이 너무 적으면 디테일이 사라지고, 너무 많으면 각 셀의 데이터가 부족해 노이즈가 생깁니다. 실무에서는 데이터 크기에 따라 최적의 bin 수를 실험적으로 찾습니다.\r
  tips:\r
  - px.density_heatmap은 산점도처럼 두 변수의 관계를 보여주지만, 점 대신 밀도를 색상으로 표현합니다. 데이터가 많이 집중된 영역이 진하게 나타나 패턴을 파악하기 좋습니다.\r
    nbinsx, nbinsy로 구간 수를 조절하며, 10~30 사이가 적당합니다. 구간이 너무 적으면 디테일이 사라지고, 너무 많으면 각 셀의 데이터가 부족해 노이즈가 생깁니다.\r
    실무에서는 데이터 크기에 따라 최적의 bin 수를 실험적으로 찾습니다.\r
  snippet: |-\r
    figHeatmap = px.density_heatmap(\r
        tips,\r
        x='total_bill',\r
        y='tip',\r
        nbinsx=20,\r
        nbinsy=20,\r
        title='결제금액-팁 관계 히트맵'\r
    )\r
    figHeatmap\r
  exercise:\r
    prompt: 5단계. 결제금액팁 관계 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHeatmap = px.density_heatmap(\r
          tips,\r
          x='total_bill',\r
          y='tip',\r
          nbinsx=20,\r
          nbinsy=20,\r
          title='결제금액-팁 관계 히트맵'\r
      )\r
      figHeatmap\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 결제금액팁 관계 히트맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 결제금액팁 관계 히트맵의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_heatmap_options\r
  title: 6단계. 히트맵 옵션\r
  structuredPrimary: true\r
  subtitle: marginal, color_continuous_scale\r
  goal: 6단계. 히트맵 옵션에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    marginal_x, marginal_y로 축에 히스토그램을 추가하여 차트의 정보량을 높입니다. 2차원 밀도맵만으로는 각 변수의 전체 분포를 파악하기 어렵기 때문입니다. marginal(주변부) 히스토그램은 각 변수의 1차원 분포를 축 옆에 표시하여, 예를 들어 "결제 금액이 10~20달러에 가장 많이 분포한다"는 정보를 한눈에 볼 수 있게 합니다. 2차원 밀도와 1차원 분포를 함께 보면 전체 데이터 구조를 입체적으로 이해할 수 있습니다. color_continuous_scale은 연속형 색상 맵(팔레트)을 지정하며, Plotly는 Viridis, Plasma, Blues, Reds, Cividis, Inferno 등 다양한 팔레트를 제공합니다. Viridis는 색맹 친화적(color-blind friendly)이고 흑백 인쇄 시에도 명암 차이가 선명하게 유지되어 학술 논문과 실무 보고서에서 자주 사용됩니다. 실무에서는 데이터 성격에 따라 팔레트를 선택하며, 중립적 데이터는 Viridis, 온도나 위험도는 RdBu(빨강-파랑 양극), 양수만 있는 데이터는 Blues나 Greens를 사용합니다.\r
\r
    marginal_x와 marginal_y는 축 옆에 추가 차트를 배치합니다. 'histogram', 'box', 'violin', 'rug' 등을 지정할 수 있으며, 각 변수의 1차원 분포를 함께 보여줍니다. color_continuous_scale은 연속형 색상 팔레트를 설정하며, Viridis(보라-노랑), Plasma(보라-핑크-노랑), Blues(파랑 계열), Reds(빨강 계열) 등이 있습니다. 실무 팁: 데이터의 성격에 따라 팔레트를 선택하세요. 중립적인 데이터는 Viridis, 온도는 RdBu(빨강-파랑), 양수만 있으면 Blues를 사용합니다.\r
  tips:\r
  - 'marginal_x와 marginal_y는 축 옆에 추가 차트를 배치합니다. ''histogram'', ''box'', ''violin'', ''rug'' 등을 지정할 수 있으며,\r
    각 변수의 1차원 분포를 함께 보여줍니다. color_continuous_scale은 연속형 색상 팔레트를 설정하며, Viridis(보라-노랑), Plasma(보라-핑크-노랑),\r
    Blues(파랑 계열), Reds(빨강 계열) 등이 있습니다. 실무 팁: 데이터의 성격에 따라 팔레트를 선택하세요. 중립적인 데이터는 Viridis, 온도는 RdBu(빨강-파랑),\r
    양수만 있으면 Blues를 사용합니다.'\r
  snippet: |-\r
    figHeatmapEnhanced = px.density_heatmap(\r
        tips,\r
        x='total_bill',\r
        y='tip',\r
        nbinsx=25,\r
        nbinsy=25,\r
        marginal_x='histogram',\r
        marginal_y='histogram',\r
        color_continuous_scale=px.colors.sequential.Viridis,\r
        title='결제금액-팁 관계 (히스토그램 포함)'\r
    )\r
    figHeatmapEnhanced\r
  exercise:\r
    prompt: 6단계. 히트맵 옵션 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHeatmapEnhanced = px.density_heatmap(\r
          tips,\r
          x='total_bill',\r
          y='tip',\r
          nbinsx=25,\r
          nbinsy=25,\r
          marginal_x='histogram',\r
          marginal_y='histogram',\r
          color_continuous_scale=px.colors.sequential.Viridis,\r
          title='결제금액-팁 관계 (히스토그램 포함)'\r
      )\r
      figHeatmapEnhanced\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 히트맵 옵션의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 히트맵 옵션의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_make_subplots_intro\r
  title: 7단계. make_subplots 기초\r
  structuredPrimary: true\r
  subtitle: from plotly.subplots import make_subplots (신규)\r
  goal: 7단계. makesubplots 기초에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    make_subplots로 여러 차트를 하나의 그림에 배치하는 신규 개념을 배웁니다. 지금까지는 차트를 하나씩 개별적으로 만들었지만, 실무에서는 여러 관점의 분석을 한 화면에 통합한 대시보드가 필요합니다. make_subplots는 Plotly의 핵심 고급 기능으로, 여러 개별 차트를 하나의 Figure 객체로 통합하여 비교 분석을 쉽게 만들어줍니다. rows(행 개수)와 cols(열 개수)로 격자 구조를 정의하고, subplot_titles로 각 서브플롯의 제목을 리스트로 지정합니다. 차트를 추가할 때는 두 가지 방법이 있는데, (1) px로 만든 차트의 data 속성에서 trace를 추출하거나 (2) go(graph_objects)로 차트 객체를 직접 생성하여 add_trace()로 배치합니다. row와 col 파라미터로 격자 내 위치를 지정하며, Python 리스트와 달리 1부터 시작합니다(row=1, col=1이 왼쪽 위). 실무에서는 대시보드, 경영 보고서, 학술 논문 등에서 여러 분석 결과를 한 페이지에 보여줄 때 필수적으로 사용되며, 특히 의사결정자가 다양한 지표를 동시에 비교할 수 있도록 합니다.\r
\r
    make_subplots는 여러 차트를 하나의 Figure에 배치합니다. 핵심 파라미터: rows(행 수), cols(열 수), subplot_titles(각 서브플롯 제목). 차트 추가는 add_trace()와 row, col 파라미터로 위치를 지정합니다. px 차트의 data 속성은 trace 리스트를 포함하므로 for 루프로 추출하여 추가할 수 있습니다. row와 col은 1부터 시작하며, row=1, col=1은 왼쪽 위 첫 번째 서브플롯을 의미합니다. 실무 팁: update_layout(height=...)로 전체 높이를 조정하여 각 서브플롯이 충분한 공간을 갖도록 합니다.\r
  tips:\r
  - 'make_subplots는 여러 차트를 하나의 Figure에 배치합니다. 핵심 파라미터: rows(행 수), cols(열 수), subplot_titles(각 서브플롯 제목).\r
    차트 추가는 add_trace()와 row, col 파라미터로 위치를 지정합니다. px 차트의 data 속성은 trace 리스트를 포함하므로 for 루프로 추출하여 추가할 수\r
    있습니다. row와 col은 1부터 시작하며, row=1, col=1은 왼쪽 위 첫 번째 서브플롯을 의미합니다. 실무 팁: update_layout(height=...)로 전체\r
    높이를 조정하여 각 서브플롯이 충분한 공간을 갖도록 합니다.'\r
  snippet: |-\r
    figSub = make_subplots(\r
        rows=2, cols=1,\r
        subplot_titles=['요일별 평균 팁', '시간대별 팁 분포']\r
    )\r
\r
    for trace in figBar.data:\r
        figSub.add_trace(trace, row=1, col=1)\r
\r
    for trace in figBox.data:\r
        figSub.add_trace(trace, row=2, col=1)\r
\r
    figSub.update_layout(height=600, showlegend=False, title_text='팁 분석 서브플롯')\r
    figSub\r
  exercise:\r
    prompt: 7단계. makesubplots 기초 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figSub = make_subplots(\r
          rows=2, cols=1,\r
          subplot_titles=['요일별 평균 팁', '시간대별 팁 분포']\r
      )\r
\r
      for trace in figBar.data:\r
          figSub.add_trace(trace, row=1, col=1)\r
\r
      for trace in figBox.data:\r
          figSub.add_trace(trace, row=2, col=1)\r
\r
      figSub.update_layout(height=600, showlegend=False, title_text='팁 분석 서브플롯')\r
      figSub\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. makesubplots 기초의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 7단계. makesubplots 기초 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step8_dashboard\r
  title: 8단계. 완성 대시보드\r
  structuredPrimary: true\r
  subtitle: 2x2 그리드 대시보드\r
  goal: 8단계. 완성 대시보드에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    4개의 차트를 2x2 격자에 배치하여 팁 분석 종합 대시보드를 완성합니다. 각 차트는 다른 질문에 답하며, 함께 보면 전체 그림을 이해할 수 있습니다. make_subplots로 2행 2열 구조를 만들고, go.Bar, go.Box, go.Histogram2d 등 graph_objects를 직접 사용하여 각 서브플롯에 차트를 배치합니다. px 대신 go를 사용하는 이유는 서브플롯에 추가할 때 더 세밀한 제어가 가능하고, marker_color, name 등 개별 속성을 직접 지정할 수 있기 때문입니다. specs 파라미터는 각 셀의 차트 타입을 지정하며, 'xy'는 일반 2D 데카르트 좌표계, 'pie'는 파이 차트, 'polar'는 극좌표계를 의미합니다(여기서는 모두 'xy'). 이 대시보드는 (1) 요일별 평균 팁, (2) 시간대별 팁 분포, (3) 성별 팁 비교, (4) 결제금액-팁 관계를 한 화면에 보여주어 팁 데이터를 다각도로 이해할 수 있게 합니다. 실무에서는 이처럼 여러 관점의 분석을 하나의 대시보드로 통합하여 경영진이나 이해관계자에게 제공하며, A4 한 장에 핵심 인사이트를 요약하는 executive summary로 활용됩니다.\r
\r
    go.Bar, go.Box, go.Histogram2d는 plotly.graph_objects의 저수준 차트 객체입니다. px보다 세밀한 제어가 가능하며, make_subplots와 함께 사용할 때 유용합니다. go.Bar는 x, y 파라미터로 데이터를 받고, marker_color로 색상을 지정합니다. go.Box는 y만 지정하면 박스 플롯을 그리며, name으로 범례 이름을 설정합니다. go.Histogram2d는 px.density_heatmap과 유사하지만 colorscale 등 더 많은 옵션을 제공합니다. 실무에서는 px로 빠르게 프로토타입을 만들고, 세밀한 조정이 필요할 때 go를 사용합니다.\r
  tips:\r
  - go.Bar, go.Box, go.Histogram2d는 plotly.graph_objects의 저수준 차트 객체입니다. px보다 세밀한 제어가 가능하며, make_subplots와\r
    함께 사용할 때 유용합니다. go.Bar는 x, y 파라미터로 데이터를 받고, marker_color로 색상을 지정합니다. go.Box는 y만 지정하면 박스 플롯을 그리며, name으로\r
    범례 이름을 설정합니다. go.Histogram2d는 px.density_heatmap과 유사하지만 colorscale 등 더 많은 옵션을 제공합니다. 실무에서는 px로 빠르게\r
    프로토타입을 만들고, 세밀한 조정이 필요할 때 go를 사용합니다.\r
  snippet: |-\r
    dashboard = make_subplots(\r
        rows=2, cols=2,\r
        subplot_titles=[\r
            '요일별 평균 팁',\r
            '시간대별 팁 분포',\r
            '성별 팁 비교',\r
            '결제금액-팁 관계'\r
        ],\r
        specs=[\r
            [{'type': 'xy'}, {'type': 'xy'}],\r
            [{'type': 'xy'}, {'type': 'xy'}]\r
        ]\r
    )\r
\r
    tipsByDay = tips.groupby('day', as_index=False)['tip'].mean()\r
    dashboard.add_trace(\r
        go.Bar(x=tipsByDay['day'], y=tipsByDay['tip'], marker_color='steelblue'),\r
        row=1, col=1\r
    )\r
\r
    for time in ['Lunch', 'Dinner']:\r
        timeData = tips[tips['time'] == time]['tip']\r
        dashboard.add_trace(\r
            go.Box(y=timeData, name=time),\r
            row=1, col=2\r
        )\r
\r
    for sex in ['Male', 'Female']:\r
        sexData = tips[tips['sex'] == sex]['tip']\r
        dashboard.add_trace(\r
            go.Box(y=sexData, name=sex),\r
            row=2, col=1\r
        )\r
\r
    dashboard.add_trace(\r
        go.Histogram2d(\r
            x=tips['total_bill'],\r
            y=tips['tip'],\r
            nbinsx=20,\r
            nbinsy=20,\r
            colorscale='Blues'\r
        ),\r
        row=2, col=2\r
    )\r
\r
    dashboard.update_layout(\r
        height=700,\r
        showlegend=False,\r
        title_text='레스토랑 팁 분석 대시보드'\r
    )\r
    dashboard\r
  exercise:\r
    prompt: 8단계. 완성 대시보드 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      dashboard = make_subplots(\r
          rows=2, cols=2,\r
          subplot_titles=[\r
              '요일별 평균 팁',\r
              '시간대별 팁 분포',\r
              '성별 팁 비교',\r
              '결제금액-팁 관계'\r
          ],\r
          specs=[\r
              [{'type': 'xy'}, {'type': 'xy'}],\r
              [{'type': 'xy'}, {'type': 'xy'}]\r
          ]\r
      )\r
\r
      tipsByDay = tips.groupby('day', as_index=False)['tip'].mean()\r
      dashboard.add_trace(\r
          go.Bar(x=tipsByDay['day'], y=tipsByDay['tip'], marker_color='steelblue'),\r
          row=1, col=1\r
      )\r
\r
      for time in ['Lunch', 'Dinner']:\r
          timeData = tips[tips['time'] == time]['tip']\r
          dashboard.add_trace(\r
              go.Box(y=timeData, name=time),\r
              row=1, col=2\r
          )\r
\r
      for sex in ['Male', 'Female']:\r
          sexData = tips[tips['sex'] == sex]['tip']\r
          dashboard.add_trace(\r
              go.Box(y=sexData, name=sex),\r
              row=2, col=1\r
          )\r
\r
      dashboard.add_trace(\r
          go.Histogram2d(\r
              x=tips['total_bill'],\r
              y=tips['tip'],\r
              nbinsx=20,\r
              nbinsy=20,\r
              colorscale='Blues'\r
          ),\r
          row=2, col=2\r
      )\r
\r
      dashboard.update_layout(\r
          height=700,\r
          showlegend=False,\r
          title_text='레스토랑 팁 분석 대시보드'\r
      )\r
      dashboard\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 완성 대시보드의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 8단계. 완성 대시보드 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step9_layout_polish\r
  title: 9단계. 레이아웃 다듬기\r
  structuredPrimary: true\r
  subtitle: update_layout 심화 (반복)\r
  goal: 9단계. 레이아웃 다듬기에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 대시보드에 배경색, 폰트, 여백 등을 추가하여 전문성과 가독성을 높입니다. 기본 스타일만으로는 브랜드 정체성을 표현하거나 프레젠테이션용으로 사용하기 어렵기\r
    때문입니다. title을 딕셔너리 형태로 지정하여 텍스트, 가로 정렬(x=0.5, 중앙), 폰트 크기를 한번에 설정하며, 문자열 대신 딕셔너리로 전달하면 더 많은 옵션을 제어할\r
    수 있습니다. plot_bgcolor는 차트 영역(그래프 내부)의 배경색, paper_bgcolor는 전체 캔버스(차트 외부 여백 포함)의 배경색입니다. font로 전체 폰트\r
    패밀리(Arial, Helvetica 등)와 기본 크기를 지정하고, margin으로 상하좌우(t, b, l, r) 여백을 픽셀 단위로 조정합니다. update_xaxes와 update_yaxes는\r
    모든 서브플롯의 축에 일괄 적용되며, showgrid=True, gridcolor='lightgray'로 격자선을 추가하면 눈금을 따라 값을 읽기 쉬워집니다. 실무에서는 회사\r
    브랜드 컬러를 배경색에 적용하고, 공식 폰트를 사용하며, 프레젠테이션 템플릿에 맞춘 여백을 설정하여 일관성 있는 전문적인 대시보드를 제작합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    dashboard.update_layout(\r
        title={\r
            'text': '레스토랑 팁 분석 대시보드',\r
            'x': 0.5,\r
            'font': {'size': 20}\r
        },\r
        plot_bgcolor='white',\r
        paper_bgcolor='#f8f9fa',\r
        font={'family': 'Arial', 'size': 12},\r
        margin={'t': 100, 'b': 50, 'l': 50, 'r': 50}\r
    )\r
    dashboard.update_xaxes(showgrid=True, gridcolor='lightgray')\r
    dashboard.update_yaxes(showgrid=True, gridcolor='lightgray')\r
    dashboard\r
  exercise:\r
    prompt: 9단계. 레이아웃 다듬기 예제에서 \`title\`, \`plot_bgcolor\`, \`paper_bgcolor\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      dashboard.update_layout(\r
          title={\r
              'text': '레스토랑 팁 분석 대시보드',\r
              'x': 0.5,\r
              'font': {'size': 20}\r
          },\r
          plot_bgcolor='white',\r
          paper_bgcolor='#f8f9fa',\r
          font={'family': 'Arial', 'size': 12},\r
          margin={'t': 100, 'b': 50, 'l': 50, 'r': 50}\r
      )\r
      dashboard.update_xaxes(showgrid=True, gridcolor='lightgray')\r
      dashboard.update_yaxes(showgrid=True, gridcolor='lightgray')\r
      dashboard\r
    hints:\r
    - 바꿀 지점은 \`title = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`title\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 레이아웃 다듬기에서 \`title\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 레이아웃 다듬기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step10_workflow\r
  title: 10단계. 실무 대시보드 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 확인 → figure 검증 → 운영 기준 실험\r
  goal: 10단계. 실무 대시보드 검증에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 조건 분기는 입력값에 따라 실행 경로가 바뀌므로 결과를 바로 확인해야 합니다.\r
  explanation: 대시보드는 차트 여러 개를 붙였다고 끝나지 않습니다. 실무에서는 핵심 지표가 빠지지 않았는지, trace 수와 타입이 맞는지, 분석 기준을 바꿔도 결과가 말이\r
    되는지 확인해야 합니다. 이번 단계에서는 매출이 가장 높은 요일과 시간대를 먼저 예상합니다. 그다음 일부 trace가 빠진 대시보드를 일부러 실패시킨 뒤, 완성 대시보드의 trace\r
    타입과 데이터 구성을 검증합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    requiredColumns = {"total_bill", "tip", "day", "time", "sex", "smoker", "size"}\r
    missingColumns = requiredColumns - set(tips.columns)\r
    if missingColumns:\r
        raise ValueError(f"tips 데이터에 필요한 컬럼이 없습니다: {sorted(missingColumns)}")\r
\r
    revenueByDay = (\r
        tips.groupby("day", as_index=False)["total_bill"]\r
        .sum()\r
        .sort_values("total_bill", ascending=False)\r
    )\r
    revenueByTime = (\r
        tips.groupby("time", as_index=False)["total_bill"]\r
        .sum()\r
        .sort_values("total_bill", ascending=False)\r
    )\r
\r
    bestRevenueDay = revenueByDay.iloc[0]["day"]\r
    bestRevenueTime = revenueByTime.iloc[0]["time"]\r
\r
    print("예상: 매출 최고 요일/시간대는", bestRevenueDay, bestRevenueTime)\r
    revenueByDay\r
  exercise:\r
    prompt: 10단계. 실무 대시보드 검증 예제에서 조건값을 바꾸고 선택되는 분기와 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      requiredColumns = {"total_bill", "tip", "day", "time", "sex", "smoker", "size"}\r
      missingColumns = requiredColumns - set(tips.columns)\r
      if missingColumns:\r
          raise ValueError(f"tips 데이터에 필요한 컬럼이 없습니다: {sorted(missingColumns)}")\r
\r
      revenueByDay = (\r
          tips.groupby("day", as_index=False)["total_bill"]\r
          .sum()\r
          .sort_values("total_bill", ascending=False)\r
      )\r
      revenueByTime = (\r
          tips.groupby("time", as_index=False)["total_bill"]\r
          .sum()\r
          .sort_values("total_bill", ascending=False)\r
      )\r
\r
      bestRevenueDay = revenueByDay.iloc[0]["day"]\r
      bestRevenueTime = revenueByTime.iloc[0]["time"]\r
\r
      print("예상: 매출 최고 요일/시간대는", bestRevenueDay, bestRevenueTime)\r
      revenueByDay\r
    hints:\r
    - 바꿀 지점은 if 조건식에 들어가는 비교값이나 boolean 값에서 찾으세요.\r
    - 실행 뒤 true/false 분기 중 어떤 코드가 평가됐는지 출력이나 변수값으로 확인하세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 실무 대시보드 검증의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.\r
    resultCheck: 10단계. 실무 대시보드 검증 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 팁 분석 확장 프로젝트\r
  goal: 실습에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    배운 내용으로 추가 분석 대시보드를 만들어봅시다. 이 실습에서는 density_heatmap, box plot, bar chart, make_subplots, 데이터 전처리(파생 변수 생성), 그룹별 집계 등 모든 개념을 종합적으로 활용합니다. 각 미션은 실제 레스토랑 분석 시나리오를 반영하여 구성되었으며, 완성하면 팁에 영향을 미치는 다양한 요인을 깊이 이해할 수 있습니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import plotly.express as px\r
    import pandas as pd\r
\r
    billData = px.data.tips()\r
  exercise:\r
    prompt: 실습 예제에서 \`billData\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      import pandas as pd\r
\r
      billData = px.data.tips()\r
    hints:\r
    - 바꿀 지점은 \`billData = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`billData\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`billData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 \`billData\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: 여러 차트를 조합하여 분석 대시보드를 완성했습니다.\r
  - type: list\r
    items:\r
    - px.bar - 막대 그래프 (반복)\r
    - px.box - 박스 플롯 (반복)\r
    - facet_col - 조건별 분리 차트 (반복)\r
    - px.density_heatmap - 밀도 히트맵 (신규)\r
    - make_subplots - 여러 차트를 한 그림에 배치 (신규)\r
    - go.Bar, go.Box, go.Histogram2d - 저수준 차트 객체 (신규)\r
    - update_layout - 레이아웃 커스터마이징 (반복)\r
  - type: text\r
    content: 다음 시간에는 트리맵과 선버스트로 계층 구조를 시각화합니다.\r
  goal: 정리에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
`;export{e as default};