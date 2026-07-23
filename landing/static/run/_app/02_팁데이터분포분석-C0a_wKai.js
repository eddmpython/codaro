var e=`meta:\r
  packages:\r
  - pandas\r
  - plotly\r
  id: plotly_02\r
  title: 팁데이터분포분석\r
  order: 2\r
  category: plotly\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - histogram\r
  - box\r
  - facet\r
  - tips\r
  - 분포분석\r
  seo:\r
    title: Plotly 히스토그램 박스플롯 - 팁 데이터 분포 분석\r
    description: 레스토랑 팁 데이터로 분포를 시각화합니다. 히스토그램, 박스플롯, facet으로 요일/시간별 패턴을 분석합니다.\r
    keywords:\r
    - Plotly histogram\r
    - box plot\r
    - facet\r
    - 팁 분포\r
    - 데이터 시각화\r
intro:\r
  emoji: 💵\r
  goal: 레스토랑 팁 데이터에서 요일/시간별 팁 분포를 시각화합니다.\r
  description: 팁 데이터의 분포를 다양한 차트로 탐색합니다. 히스토그램으로 전체 분포를, 박스플롯으로 그룹별 비교를, facet으로 다차원 분석을 수행합니다.\r
  direction: 팁데이터분포분석에서 데이터를 상호작용 차트로 구성하고 필터와 표시 상태를 검증합니다.\r
  benefits:\r
  - 대시보드 데이터 확인 후 인터랙티브 시각화에 맞는 코드 입력을 고릅니다.\r
  - 팁데이터분포분석 결과를 툴팁과 선택 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 공유 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(대시보드 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 구조 파악 처리 실행\r
      detail: 인터랙티브 시각화 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 히스토그램 기초 결과 검증\r
      detail: 툴팁과 선택 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 팁데이터분포분석 재사용\r
      detail: 완성 코드를 공유 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 인터랙티브 차트 환경\r
      detail: pandas, plotly 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 팁데이터분포분석 실행\r
      detail: 셀을 실행해 툴팁과 선택 상태와 예외 상태를 확인합니다.\r
    - label: 팁데이터분포분석 완료\r
      detail: 검증된 코드를 공유 대시보드로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: tips 데이터 준비\r
  goal: 1단계. 데이터 불러오기에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 레스토랑 팁 데이터는 실제 식당에서 수집된 244건의 식사 기록을 담고 있습니다. 각 행은 한 건의 식사를 나타내며, 총 결제 금액(total_bill),\r
    팁(tip), 성별(sex), 흡연 여부(smoker), 요일(day), 시간대(time), 일행 수(size) 등의 정보가 포함되어 있습니다. 이 데이터를 통해 어떤 조건에서\r
    팁을 많이 주는지, 팁의 분포는 어떤 패턴을 보이는지 분석할 수 있습니다. 실무에서는 이런 분석으로 레스토랑 운영 전략을 수립하거나 직원 배치를 최적화할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import plotly.express as px\r
    import pandas as pd\r
\r
    tips = px.data.tips()\r
    tips.head()\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 \`tips\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      import pandas as pd\r
\r
      tips = px.data.tips()\r
      tips.head()\r
    hints:\r
    - 바꿀 지점은 \`tips = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`tips\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기에서 \`tips\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기 실행 뒤 \`tips\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step2_explore\r
  title: 2단계. 데이터 구조 파악\r
  structuredPrimary: true\r
  subtitle: 컬럼 확인\r
  goal: 2단계. 데이터 구조 파악에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
  explanation: 데이터 분석을 시작하기 전에 어떤 컬럼이 사용 가능한지 파악하는 것이 중요합니다. tips 데이터셋에는 total_bill(총금액), tip(팁), sex(성별),\r
    smoker(흡연), day(요일), time(시간대), size(인원수) 등 7개의 컬럼이 있습니다. 각 컬럼은 식사 한 건에 대한 서로 다른 측면을 나타내며, 이들의 조합으로\r
    팁 패턴을 다각도로 분석할 수 있습니다. info() 메서드를 사용하면 각 컬럼의 데이터 타입과 결측치 여부까지 한 번에 확인할 수 있어 데이터 품질 점검에 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: tips.info()\r
  exercise:\r
    prompt: 2단계. 데이터 구조 파악 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: tips.info()\r
    hints:\r
    - 바꿀 지점은 대시보드 데이터을 만드는 첫 줄과 인터랙티브 시각화 줄에서 찾으세요.\r
    - 실행 뒤 툴팁과 선택 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 구조 파악의 수정 코드가 인터랙티브 시각화 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 2단계. 데이터 구조 파악 실행 결과가 툴팁과 선택 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step3_histogram_basic\r
  title: 3단계. 히스토그램 기초\r
  structuredPrimary: true\r
  subtitle: 팁 분포 확인\r
  goal: 3단계. 히스토그램 기초에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    히스토그램은 연속형 데이터(숫자)의 분포를 시각적으로 보여주는 가장 기본적인 차트입니다. 데이터를 여러 구간(bin)으로 나누고, 각 구간에 속하는 데이터의 개수를 막대 높이로 표현합니다. 팁 데이터의 히스토그램을 보면 대부분의 팁이 2~3달러 구간에 몰려있고, 5달러 이상은 드물다는 것을 한눈에 알 수 있습니다. 이런 분포 패턴을 파악하면 평균값만으로는 알 수 없는 데이터의 특성을 이해할 수 있습니다. 예를 들어 평균 팁이 3달러라는 정보만으로는 대부분이 3달러 근처인지, 아니면 1달러와 5달러로 양극화되어 있는지 알 수 없습니다. 히스토그램은 이런 분포의 형태(정규분포, 왜도, 첨도)를 시각적으로 보여줍니다. 실무에서는 가격 책정, 재고 관리, 고객 행동 분석, 품질 관리 등에 활용됩니다.\r
\r
    px.histogram(데이터, x='컬럼명')이 기본 형태입니다. x에 지정한 컬럼의 값을 자동으로 구간(bins)으로 나누고, 각 구간의 빈도를 막대로 표현합니다. 막대 높이가 높을수록 해당 구간에 데이터가 많이 몰려있다는 의미입니다. 히스토그램과 막대그래프(bar chart)의 차이는 히스토그램은 연속형 데이터를 구간으로 나눈 것이고, 막대그래프는 범주형 데이터를 표현한다는 점입니다. 히스토그램은 평균, 중앙값, 표준편차와 함께 사용하면 데이터의 전체 모습을 파악하는 데 매우 유용합니다. 통계학에서 기술통계의 핵심 도구입니다.\r
  tips:\r
  - px.histogram(데이터, x='컬럼명')이 기본 형태입니다. x에 지정한 컬럼의 값을 자동으로 구간(bins)으로 나누고, 각 구간의 빈도를 막대로 표현합니다. 막대 높이가\r
    높을수록 해당 구간에 데이터가 많이 몰려있다는 의미입니다. 히스토그램과 막대그래프(bar chart)의 차이는 히스토그램은 연속형 데이터를 구간으로 나눈 것이고, 막대그래프는\r
    범주형 데이터를 표현한다는 점입니다. 히스토그램은 평균, 중앙값, 표준편차와 함께 사용하면 데이터의 전체 모습을 파악하는 데 매우 유용합니다. 통계학에서 기술통계의 핵심 도구입니다.\r
  snippet: |-\r
    figHist = px.histogram(tips, x="tip", title="팁 분포")\r
    figHist\r
  exercise:\r
    prompt: 3단계. 히스토그램 기초 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHist = px.histogram(tips, x="tip", title="팁 분포")\r
      figHist\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 히스토그램 기초의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 히스토그램 기초의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step4_histogram_bins\r
  title: 4단계. 히스토그램 구간 조정\r
  structuredPrimary: true\r
  subtitle: nbins 파라미터\r
  goal: 4단계. 히스토그램 구간 조정에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    히스토그램의 구간 개수(bins)는 데이터 이해에 큰 영향을 미칩니다. nbins 파라미터로 막대 개수를 조정할 수 있습니다. 구간이 너무 많으면 세밀한 변화를 볼 수 있지만 전체 패턴이 흐려지고 노이즈가 많아 보입니다. 반대로 너무 적으면 큰 흐름만 보이고 중요한 디테일을 놓칠 수 있습니다. 일반적으로 데이터 개수의 제곱근 정도를 구간 수로 사용하는 Sturges 규칙이 있습니다. 팁 데이터는 244개 행이므로 sqrt(244) ≈ 15개 정도가 적절하지만, 여러 개를 시도해서 가장 의미 있는 패턴이 보이는 것을 선택하는 것이 실무적입니다. 데이터 탐색 초기에는 여러 nbins 값을 실험해보는 것이 좋습니다.\r
\r
    nbins 파라미터는 히스토그램의 막대(구간) 개수를 지정합니다. nbins=20이면 데이터 범위를 20개 구간으로 나눕니다. 기본값은 Plotly가 자동으로 계산하지만(보통 Freedman-Diaconis 규칙 사용), 데이터 특성에 따라 직접 조정하는 것이 좋습니다. nbins=10(큰 패턴 파악), nbins=30(세밀한 분포 분석)처럼 목적에 맞게 조절합니다. 너무 많으면 과적합(overfitting)처럼 보이고, 너무 적으면 과소적합(underfitting)처럼 정보가 뭉뚱그려집니다. 데이터 분석가는 적절한 균형점을 찾는 것이 중요합니다.\r
  tips:\r
  - nbins 파라미터는 히스토그램의 막대(구간) 개수를 지정합니다. nbins=20이면 데이터 범위를 20개 구간으로 나눕니다. 기본값은 Plotly가 자동으로 계산하지만(보통\r
    Freedman-Diaconis 규칙 사용), 데이터 특성에 따라 직접 조정하는 것이 좋습니다. nbins=10(큰 패턴 파악), nbins=30(세밀한 분포 분석)처럼 목적에\r
    맞게 조절합니다. 너무 많으면 과적합(overfitting)처럼 보이고, 너무 적으면 과소적합(underfitting)처럼 정보가 뭉뚱그려집니다. 데이터 분석가는 적절한 균형점을\r
    찾는 것이 중요합니다.\r
  snippet: |-\r
    figBins = px.histogram(tips, x="tip", nbins=20, title="팁 분포 (20구간)")\r
    figBins\r
  exercise:\r
    prompt: 4단계. 히스토그램 구간 조정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBins = px.histogram(tips, x="tip", nbins=20, title="팁 분포 (20구간)")\r
      figBins\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 히스토그램 구간 조정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 히스토그램 구간 조정의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_histogram_color\r
  title: 5단계. 히스토그램에 색상 추가\r
  structuredPrimary: true\r
  subtitle: color로 그룹 구분\r
  goal: 5단계. 히스토그램에 색상 추가에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: color 파라미터로 그룹별 분포를 비교할 수 있습니다. 점심(Lunch)과 저녁(Dinner) 시간대별로 팁 분포가 어떻게 다른지 한 차트에서 비교합니다.\r
    색상을 추가하면 히스토그램이 겹쳐서(overlay) 또는 쌓여서(stacked) 표시됩니다. 이를 통해 두 그룹의 분포 형태를 직접 비교할 수 있어, 저녁 시간대에 고액 팁이\r
    더 많은지, 점심 시간대 팁이 더 집중적인지 등을 파악할 수 있습니다. 실무에서는 A/B 테스트 결과 비교, 실험군과 대조군 비교, 시즌별 판매 패턴 비교 등에 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figTimeColor = px.histogram(\r
        tips,\r
        x="tip",\r
        color="time",\r
        title="시간대별 팁 분포"\r
    )\r
    figTimeColor\r
  exercise:\r
    prompt: 5단계. 히스토그램에 색상 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figTimeColor = px.histogram(\r
          tips,\r
          x="tip",\r
          color="time",\r
          title="시간대별 팁 분포"\r
      )\r
      figTimeColor\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 히스토그램에 색상 추가의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 히스토그램에 색상 추가의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_box_basic\r
  title: 6단계. 박스플롯 기초\r
  structuredPrimary: true\r
  subtitle: 분포 요약\r
  goal: 6단계. 박스플롯 기초에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    박스플롯(Box Plot)은 데이터의 분포를 5가지 핵심 통계량으로 요약해서 보여주는 차트입니다. 히스토그램이 전체 분포 형태를 보여준다면, 박스플롯은 중앙값, 사분위수, 이상치를 한눈에 파악할 수 있게 해줍니다. 상자 안의 가운데 선은 중앙값(50% 지점), 상자의 아래쪽 경계는 25% 지점(1사분위수), 위쪽 경계는 75% 지점(3사분위수)입니다. 상자에서 뻗어나온 수염은 정상 범위를 나타내고, 수염 밖의 점들은 이상치(outlier)입니다. 여러 그룹을 비교할 때 매우 효과적입니다.\r
\r
    px.box(데이터, y='컬럼명')으로 세로 방향 박스플롯을 만듭니다. x='컬럼명'을 사용하면 가로 방향이 됩니다. 박스플롯 읽는 법은 다음과 같습니다. 1) 상자 가운데 선: 중앙값(median), 2) 상자 범위: 25%~75%(IQR, 데이터의 중간 50%), 3) 수염: 정상 범위(보통 IQR의 1.5배), 4) 개별 점: 이상치(outlier). 박스가 넓을수록 데이터 분산이 크고, 중앙값 위치로 비대칭 정도를 파악할 수 있습니다.\r
  tips:\r
  - 'px.box(데이터, y=''컬럼명'')으로 세로 방향 박스플롯을 만듭니다. x=''컬럼명''을 사용하면 가로 방향이 됩니다. 박스플롯 읽는 법은 다음과 같습니다. 1) 상자\r
    가운데 선: 중앙값(median), 2) 상자 범위: 25%~75%(IQR, 데이터의 중간 50%), 3) 수염: 정상 범위(보통 IQR의 1.5배), 4) 개별 점: 이상치(outlier).\r
    박스가 넓을수록 데이터 분산이 크고, 중앙값 위치로 비대칭 정도를 파악할 수 있습니다.'\r
  snippet: |-\r
    figBox = px.box(tips, y="tip", title="팁 분포 박스플롯")\r
    figBox\r
  exercise:\r
    prompt: 6단계. 박스플롯 기초 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBox = px.box(tips, y="tip", title="팁 분포 박스플롯")\r
      figBox\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 박스플롯 기초의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 박스플롯 기초의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_box_category\r
  title: 7단계. 카테고리별 박스플롯\r
  structuredPrimary: true\r
  subtitle: x축에 그룹 지정\r
  goal: 7단계. 카테고리별 박스플롯에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 박스플롯에서 x축에 카테고리 변수를 지정하면 여러 그룹의 분포를 나란히 비교할 수 있습니다. 요일별 팁 분포를 비교하면 어느 요일에 팁이 많은지, 어느 요일에\r
    팁의 변동성이 큰지 한눈에 파악할 수 있습니다. 예를 들어 주말에는 고액 팁이 많고 평일에는 팁이 일정하다면, 이는 주말 고객층과 평일 고객층이 다르다는 인사이트를 제공합니다.\r
    이런 패턴을 발견하면 요일별 마케팅 전략이나 직원 배치를 최적화할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    px.box(\r
        tips,\r
        x="day",\r
        y="tip",\r
        title="요일별 팁 분포"\r
    )\r
  exercise:\r
    prompt: 7단계. 카테고리별 박스플롯 예제에서 \`x\`, \`y\`, \`title\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      px.box(\r
          tips,\r
          x="day",\r
          y="tip",\r
          title="요일별 팁 분포"\r
      )\r
    hints:\r
    - 바꿀 지점은 \`x = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`x\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 카테고리별 박스플롯에서 \`x\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 카테고리별 박스플롯 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step8_box_color\r
  title: 8단계. 박스플롯에 색상 추가\r
  structuredPrimary: true\r
  subtitle: 이중 비교\r
  goal: 8단계. 박스플롯에 색상 추가에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: '박스플롯에 color 파라미터를 추가하면 한 그래프에서 두 가지 범주형 변수를 동시에 비교할 수 있어 분석의 깊이가 한층 깊어집니다. 예를 들어 요일(x축)과\r
    시간대(color)를 조합하면 목요일 점심, 목요일 저녁, 금요일 점심, 금요일 저녁처럼 세분화된 조건별 팁 분포를 한 번에 비교할 수 있습니다. 이렇게 다차원 비교를 통해 복잡한\r
    패턴(예: 주말 저녁에만 팁이 급증)을 발견할 수 있습니다. 실무에서는 이런 세밀한 분석이 타겟 마케팅이나 운영 최적화의 핵심 근거가 됩니다.'\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    px.box(\r
        tips,\r
        x="day",\r
        y="tip",\r
        color="time",\r
        title="요일/시간대별 팁 분포"\r
    )\r
  exercise:\r
    prompt: 8단계. 박스플롯에 색상 추가 예제에서 \`x\`, \`y\`, \`color\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      px.box(\r
          tips,\r
          x="day",\r
          y="tip",\r
          color="time",\r
          title="요일/시간대별 팁 분포"\r
      )\r
    hints:\r
    - 바꿀 지점은 \`x = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`x\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 박스플롯에 색상 추가에서 \`x\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 박스플롯에 색상 추가 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_facet_intro\r
  title: 9단계. 패싯(Facet) 소개\r
  structuredPrimary: true\r
  subtitle: 그래프 분할\r
  goal: 9단계. 패싯(Facet) 소개에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    패싯(Facet)은 하나의 큰 차트를 여러 개의 작은 차트로 분할하는 강력한 기능입니다. 같은 종류의 차트를 여러 그룹별로 나란히 배치해서 비교할 수 있습니다. 예를 들어 요일별 팁 분포를 한 차트에 색상으로 구분하는 것보다, 요일마다 별도의 히스토그램을 만들면 각 요일의 패턴을 더 명확하게 파악할 수 있습니다. facet_col은 가로 방향으로, facet_row는 세로 방향으로 차트를 나눕니다. 실무에서는 시계열 데이터를 월별로 나누거나, 제품을 카테고리별로 비교할 때 매우 유용합니다.\r
\r
    facet_col='컬럼명'은 해당 컬럼의 고유값마다 가로로 차트를 나눕니다. facet_row='컬럼명'은 세로로 나눕니다. 두 개를 동시에 사용하면 격자 형태가 됩니다. 각 서브플롯은 동일한 축 범위를 공유하므로 직접 비교가 쉽습니다. category_orders={'day': ['Thur', 'Fri', 'Sat', 'Sun']}처럼 순서를 지정할 수도 있습니다.\r
  tips:\r
  - 'facet_col=''컬럼명''은 해당 컬럼의 고유값마다 가로로 차트를 나눕니다. facet_row=''컬럼명''은 세로로 나눕니다. 두 개를 동시에 사용하면 격자 형태가 됩니다.\r
    각 서브플롯은 동일한 축 범위를 공유하므로 직접 비교가 쉽습니다. category_orders={''day'': [''Thur'', ''Fri'', ''Sat'', ''Sun'']}처럼\r
    순서를 지정할 수도 있습니다.'\r
  snippet: |-\r
    figFacetCol = px.histogram(\r
        tips,\r
        x="tip",\r
        facet_col="day",\r
        title="요일별 팁 분포"\r
    )\r
    figFacetCol\r
  exercise:\r
    prompt: 9단계. 패싯(Facet) 소개 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFacetCol = px.histogram(\r
          tips,\r
          x="tip",\r
          facet_col="day",\r
          title="요일별 팁 분포"\r
      )\r
      figFacetCol\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 패싯(Facet) 소개의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 패싯(Facet) 소개의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_facet_row\r
  title: 10단계. 세로 패싯\r
  structuredPrimary: true\r
  subtitle: facet_row\r
  goal: 10단계. 세로 패싯에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: facet_row는 차트를 세로 방향으로 분할합니다. 가로 분할(facet_col)과 달리 위아래로 차트가 나열되어, 같은 x축 범위를 공유하므로 수평 비교가\r
    쉽습니다. 시간대별 팁 분포를 세로로 나열하면 Lunch와 Dinner의 분포 차이를 한눈에 비교할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFacetRow = px.histogram(\r
        tips,\r
        x="tip",\r
        facet_row="time",\r
        title="시간대별 팁 분포"\r
    )\r
    figFacetRow\r
  exercise:\r
    prompt: 10단계. 세로 패싯 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFacetRow = px.histogram(\r
          tips,\r
          x="tip",\r
          facet_row="time",\r
          title="시간대별 팁 분포"\r
      )\r
      figFacetRow\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 세로 패싯의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 세로 패싯의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step11_facet_both\r
  title: 11단계. 가로+세로 패싯\r
  structuredPrimary: true\r
  subtitle: 격자형 비교\r
  goal: 11단계. 가로+세로 패싯에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: facet_col과 facet_row를 동시에 사용하면 2차원 격자형 레이아웃이 만들어집니다. 행(row)과 열(column)을 조합해서 두 가지 범주를 동시에\r
    비교할 수 있습니다. 요일(가로)과 시간대(세로)를 조합하면 총 8개의 서브플롯(4개 요일 x 2개 시간대)이 생성되어, 각 조건별 팁 분포 패턴을 세밀하게 분석할 수 있습니다.\r
    실무에서는 지역별/제품별, 연도별/분기별 등 복잡한 다차원 비교에 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFacetBoth = px.histogram(\r
        tips,\r
        x="tip",\r
        facet_col="day",\r
        facet_row="time",\r
        title="요일/시간대별 팁 분포"\r
    )\r
    figFacetBoth\r
  exercise:\r
    prompt: 11단계. 가로+세로 패싯 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFacetBoth = px.histogram(\r
          tips,\r
          x="tip",\r
          facet_col="day",\r
          facet_row="time",\r
          title="요일/시간대별 팁 분포"\r
      )\r
      figFacetBoth\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 가로+세로 패싯의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 가로+세로 패싯의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step12_box_facet\r
  title: 12단계. 박스플롯 패싯\r
  structuredPrimary: true\r
  subtitle: 그룹 비교\r
  goal: 12단계. 박스플롯 패싯에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 히스토그램뿐만 아니라 박스플롯에도 패싯을 적용할 수 있어 데이터 탐색의 폭이 넓어집니다. 성별에 따른 팁 분포를 요일별로 나누어 비교하면 성별과 요일의 상호작용\r
    효과를 파악할 수 있습니다. 예를 들어 남성은 주말에 팁을 많이 주고 여성은 평일에 팁을 많이 준다면 이는 성별에 따른 외식 패턴 차이를 시사합니다. 이런 다차원 분석은 고객\r
    세분화와 맞춤형 서비스 전략 수립에 매우 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    px.box(\r
        tips,\r
        x="sex",\r
        y="tip",\r
        facet_col="day",\r
        title="성별/요일별 팁 분포"\r
    )\r
  exercise:\r
    prompt: 12단계. 박스플롯 패싯 예제에서 \`x\`, \`y\`, \`facet_col\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      px.box(\r
          tips,\r
          x="sex",\r
          y="tip",\r
          facet_col="day",\r
          title="성별/요일별 팁 분포"\r
      )\r
    hints:\r
    - 바꿀 지점은 \`x = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`x\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 박스플롯 패싯에서 \`x\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 12단계. 박스플롯 패싯 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step13_final\r
  title: 13단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 종합 시각화\r
  goal: 13단계. 최종 결과물에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 기술을 종합하여 완성도 높은 시각화를 만듭니다. 박스플롯으로 분포 요약을 보여주고, color로 성별을 구분하며, facet_col로 시간대별로\r
    나누고, labels로 한글화합니다. 이렇게 하나의 차트에 여러 차원의 정보(요일, 시간대, 성별, 팁 분포)를 담을 수 있습니다. 이 차트를 통해 어느 요일, 어느 시간대에,\r
    어느 성별 고객이 팁을 많이 주는지 한눈에 파악할 수 있습니다. 실무에서는 이런 다차원 분석으로 마케팅 전략이나 운영 의사결정을 내립니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal = px.box(\r
        tips,\r
        x="day",\r
        y="tip",\r
        color="sex",\r
        facet_col="time",\r
        title="요일/시간/성별에 따른 팁 분포",\r
        labels={"day": "요일", "tip": "팁 ($)", "sex": "성별", "time": "시간대"}\r
    )\r
    figFinal\r
  exercise:\r
    prompt: 13단계. 최종 결과물 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal = px.box(\r
          tips,\r
          x="day",\r
          y="tip",\r
          color="sex",\r
          facet_col="time",\r
          title="요일/시간/성별에 따른 팁 분포",\r
          labels={"day": "요일", "tip": "팁 ($)", "sex": "성별", "time": "시간대"}\r
      )\r
      figFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 최종 결과물의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 13단계. 최종 결과물의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 팁 분포 분석 프로젝트\r
  goal: 실습에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 모든 내용을 활용해서 팁 데이터를 심층 분석해봅시다. 히스토그램, 박스플롯, color, facet, labels, nbins 등 모든 기능을 종합적으로 사용합니다. 데이터 전처리(파생 변수 생성)도 포함됩니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import plotly.express as px\r
    import pandas as pd\r
\r
    data = px.data.tips()\r
  exercise:\r
    prompt: 실습 예제에서 \`data\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      import pandas as pd\r
\r
      data = px.data.tips()\r
    hints:\r
    - 바꿀 지점은 \`data = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`data\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`data\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 \`data\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: 분포 시각화 기법을 마스터했습니다.\r
  - type: list\r
    items:\r
    - px.histogram() - 연속형 데이터 분포 시각화\r
    - px.box() - 분포 요약 (중앙값, 사분위수, 이상치)\r
    - color - 그룹별 색상 구분\r
    - title, labels - 제목과 라벨 지정\r
    - facet_col, facet_row - 그래프 분할 비교\r
  - type: text\r
    content: 다음 시간에는 세계 인구 데이터로 지도 시각화를 배웁니다.\r
  goal: 정리에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
- id: workflow_validation\r
  title: 14단계. 팁 분포 Figure 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 14단계. 팁 분포 Figure 검증 루프에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    분포 분석은 bin 개수, 그룹 색상, 이상치 처리에 따라 결론이 달라집니다. 히스토그램과 박스 플롯을 만들고 Figure 내부 구조를 검증합니다.\r
\r
    분포 차트는 bin 설정을 바꾸어도 핵심 결론이 유지되는지 확인해야 실무 보고서에 넣을 수 있습니다.\r
  snippet: |-\r
    import plotly.express as px\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    tipsFlow = loadLocalDataset("tips")\r
    requiredColumns = {"total_bill", "tip", "time", "day", "size"}\r
    missingColumns = requiredColumns - set(tipsFlow.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert tipsFlow["tip"].between(0, tipsFlow["total_bill"]).all()\r
    assert tipsFlow.groupby("time")["tip"].mean()["Dinner"] > tipsFlow.groupby("time")["tip"].mean()["Lunch"]\r
  exercise:\r
    prompt: 14단계. 팁 분포 Figure 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      tipsFlow = loadLocalDataset("tips")\r
      requiredColumns = {"total_bill", "tip", "time", "day", "size"}\r
      missingColumns = requiredColumns - set(tipsFlow.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert tipsFlow["tip"].between(0, tipsFlow["total_bill"]).all()\r
      assert tipsFlow.groupby("time")["tip"].mean()["Dinner"] > tipsFlow.groupby("time")["tip"].mean()["Lunch"]\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 팁 분포 Figure 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 14단계. 팁 분포 Figure 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};