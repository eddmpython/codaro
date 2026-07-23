var e=`meta:\r
  packages:\r
  - pandas\r
  - plotly\r
  id: plotly_01\r
  title: 세계기대수명비교\r
  order: 1\r
  category: plotly\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - gapminder\r
  - bar\r
  - color\r
  - 기초\r
  seo:\r
    title: Plotly Express 막대 그래프 - 대륙별 기대수명 비교\r
    description: gapminder 데이터로 대륙별 기대수명을 막대 그래프로 시각화합니다. px.bar, color, title 사용법을 배웁니다.\r
    keywords:\r
    - plotly express\r
    - px.bar\r
    - 막대그래프\r
    - gapminder\r
    - 기대수명\r
intro:\r
  emoji: 🌍\r
  goal: 대륙별 평균 기대수명을 막대 그래프로 비교합니다.\r
  description: Plotly Express로 첫 번째 시각화를 만듭니다. 데이터 로드 → 집계 → 시각화의 흐름을 익힙니다.\r
  direction: 세계기대수명비교에서 데이터를 상호작용 차트로 구성하고 필터와 표시 상태를 검증합니다.\r
  benefits:\r
  - 대시보드 데이터 확인 후 인터랙티브 시각화에 맞는 코드 입력을 고릅니다.\r
  - 세계기대수명비교 결과를 툴팁과 선택 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 공유 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(대시보드 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 불러오기 처리 실행\r
      detail: 인터랙티브 시각화 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 데이터 확인 결과 검증\r
      detail: 툴팁과 선택 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 세계기대수명비교 재사용\r
      detail: 완성 코드를 공유 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 인터랙티브 차트 환경\r
      detail: pandas, plotly 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 세계기대수명비교 실행\r
      detail: 셀을 실행해 툴팁과 선택 상태와 예외 상태를 확인합니다.\r
    - label: 세계기대수명비교 완료\r
      detail: 검증된 코드를 공유 대시보드로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    Plotly Express는 파이썬에서 인터랙티브 시각화를 만드는 강력한 라이브러리입니다. 정적 이미지만 제공하는 matplotlib와 달리, 마우스로 확대/축소/이동이 가능하고 호버 시 상세 정보를 볼 수 있습니다. Codaro가 pandas와 plotly를 uv로 준비하면 웹 브라우저에서 사용자가 데이터를 탐색할 수 있고, HTML로 저장해 프레젠테이션이나 보고서에 바로 삽입할 수 있습니다. 특히 웹 기반 대시보드나 데이터 탐색에 매우 효과적입니다. pandas는 데이터를 불러오고 가공하는 데 사용하며, Plotly Express와 완벽하게 호환됩니다. 두 라이브러리를 함께 사용하면 데이터 분석부터 시각화까지 한 번에 처리할 수 있습니다. Plotly Express의 px라는 짧은 이름은 데이터 과학 커뮤니티의 표준 관례로, 코드 가독성을 높여줍니다.\r
\r
    import plotly.express as px는 plotly.express 라이브러리를 px라는 짧은 이름으로 불러오는 관례입니다. px.bar(), px.scatter()처럼 짧고 직관적으로 사용할 수 있습니다. import pandas as pd와 마찬가지로, 데이터 과학 커뮤니티에서 널리 사용하는 표준 방식입니다. as 키워드는 alias(별칭)를 만드는 것으로, plotly.express.bar(...) 대신 px.bar(...)로 간결하게 작성할 수 있어 코드 타이핑을 크게 줄여줍니다. 실무에서는 수십 개의 차트를 만들기 때문에 이런 짧은 표기법이 생산성에 큰 영향을 미칩니다.\r
  tips:\r
  - import plotly.express as px는 plotly.express 라이브러리를 px라는 짧은 이름으로 불러오는 관례입니다. px.bar(), px.scatter()처럼\r
    짧고 직관적으로 사용할 수 있습니다. import pandas as pd와 마찬가지로, 데이터 과학 커뮤니티에서 널리 사용하는 표준 방식입니다. as 키워드는 alias(별칭)를\r
    만드는 것으로, plotly.express.bar(...) 대신 px.bar(...)로 간결하게 작성할 수 있어 코드 타이핑을 크게 줄여줍니다. 실무에서는 수십 개의 차트를 만들기\r
    때문에 이런 짧은 표기법이 생산성에 큰 영향을 미칩니다.\r
  snippet: |-\r
    import plotly.express as px\r
    import pandas as pd\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      import pandas as pd\r
    hints:\r
    - 바꿀 지점은 대시보드 데이터을 만드는 첫 줄과 인터랙티브 시각화 줄에서 찾으세요.\r
    - 실행 뒤 툴팁과 선택 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 툴팁과 선택 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step2_load\r
  title: 2단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: px.data.gapminder()\r
  goal: 2단계. 데이터 불러오기에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    gapminder는 세계 각국의 발전 지표를 담은 유명한 데이터셋입니다. 1952년부터 2007년까지 5년 단위로 기대수명(lifeExp), 인구(pop), 1인당 GDP(gdpPercap) 등이 기록되어 있습니다. 이 데이터는 Hans Rosling 교수가 세계 발전 상황을 설명하는 데 사용했던 것으로, 경제 발전과 건강 수준의 관계를 명확히 보여줍니다. Plotly Express는 이런 유용한 데이터를 내장하고 있어 별도로 CSV를 다운로드하거나 URL을 찾을 필요가 없습니다. 실무에서는 공공 데이터 포털이나 API에서 데이터를 받지만, 학습 단계에서는 이렇게 내장 데이터로 빠르게 시각화 기법을 익힐 수 있습니다.\r
\r
    px.data.gapminder()는 Plotly Express에 내장된 데이터셋을 불러오는 함수입니다. 괄호()를 붙여야 실제 데이터가 로드됩니다. 다른 내장 데이터로는 px.data.iris()(붓꽃 품종 데이터), px.data.tips()(레스토랑 팁 데이터), px.data.stocks()(주식 시계열 데이터) 등이 있으며, 모두 연습용으로 매우 유용합니다. 각 데이터셋은 특정 시각화 기법을 학습하기에 최적화되어 있어 튜토리얼과 문서 예제에서 널리 사용됩니다.\r
  tips:\r
  - px.data.gapminder()는 Plotly Express에 내장된 데이터셋을 불러오는 함수입니다. 괄호()를 붙여야 실제 데이터가 로드됩니다. 다른 내장 데이터로는 px.data.iris()(붓꽃\r
    품종 데이터), px.data.tips()(레스토랑 팁 데이터), px.data.stocks()(주식 시계열 데이터) 등이 있으며, 모두 연습용으로 매우 유용합니다. 각 데이터셋은\r
    특정 시각화 기법을 학습하기에 최적화되어 있어 튜토리얼과 문서 예제에서 널리 사용됩니다.\r
  snippet: df = px.data.gapminder()\r
  exercise:\r
    prompt: 2단계. 데이터 불러오기 예제에서 \`df\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: df = px.data.gapminder()\r
    hints:\r
    - 바꿀 지점은 \`df = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`df\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 불러오기에서 \`df\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 데이터 불러오기 실행 뒤 \`df\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step3_explore\r
  title: 3단계. 데이터 확인\r
  structuredPrimary: true\r
  subtitle: df.head(), df.shape\r
  goal: 3단계. 데이터 확인에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
  explanation: |-\r
    데이터를 분석하기 전에 먼저 구조를 파악하는 것이 중요합니다. head() 메서드는 처음 5개 행을 보여줘서 어떤 형태인지 빠르게 확인할 수 있습니다. gapminder 데이터는 1704개의 행(각 국가의 연도별 기록)과 8개의 열(변수)로 구성되어 있습니다. 주요 컬럼으로는 country(국가명), continent(대륙), year(연도), lifeExp(기대수명), pop(인구), gdpPercap(1인당 GDP) 등이 있습니다. 이 정보를 통해 경제 발전과 건강 수준의 관계를 분석할 수 있습니다.\r
\r
    head() 메서드는 DataFrame의 처음 5개 행을 반환합니다. 인자를 전달하면 원하는 개수만큼 볼 수 있습니다(예. head(10)). 반대로 tail()은 마지막 N개 행을 보여줍니다. info() 메서드를 사용하면 각 컬럼의 데이터 타입, null 개수, 메모리 사용량 등 더 상세한 정보를 확인할 수 있습니다. describe()는 수치형 컬럼의 평균, 표준편차, 최소값, 최대값, 사분위수를 요약해줍니다. 데이터 탐색의 첫 단계에서는 이 세 가지 메서드(head, info, describe)를 순서대로 사용하는 것이 표준 워크플로우입니다.\r
  tips:\r
  - head() 메서드는 DataFrame의 처음 5개 행을 반환합니다. 인자를 전달하면 원하는 개수만큼 볼 수 있습니다(예. head(10)). 반대로 tail()은 마지막 N개\r
    행을 보여줍니다. info() 메서드를 사용하면 각 컬럼의 데이터 타입, null 개수, 메모리 사용량 등 더 상세한 정보를 확인할 수 있습니다. describe()는 수치형\r
    컬럼의 평균, 표준편차, 최소값, 최대값, 사분위수를 요약해줍니다. 데이터 탐색의 첫 단계에서는 이 세 가지 메서드(head, info, describe)를 순서대로 사용하는\r
    것이 표준 워크플로우입니다.\r
  snippet: df.head()\r
  exercise:\r
    prompt: 3단계. 데이터 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: df.head()\r
    hints:\r
    - 바꿀 지점은 대시보드 데이터을 만드는 첫 줄과 인터랙티브 시각화 줄에서 찾으세요.\r
    - 실행 뒤 툴팁과 선택 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 데이터 확인의 수정 코드가 인터랙티브 시각화 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 3단계. 데이터 확인 실행 결과가 툴팁과 선택 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step4_columns\r
  title: 4단계. 컬럼 확인\r
  structuredPrimary: true\r
  subtitle: df.columns\r
  goal: 4단계. 컬럼 확인에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
  explanation: |-\r
    columns 속성은 DataFrame에 포함된 모든 열(컬럼)의 이름을 보여줍니다. 시각화를 만들 때 정확한 컬럼명을 알아야 x축, y축, 색상 등에 지정할 수 있기 때문에 이 단계는 필수적입니다. 예를 들어 기대수명을 시각화하려면 lifeExp라는 정확한 이름을 사용해야 하며, LifeExp나 life_exp처럼 다르게 쓰면 에러가 발생합니다. Python은 대소문자를 구분하므로 컬럼명을 정확히 기억하거나 복사해서 사용하는 것이 좋습니다. 데이터 탐색의 첫 단계에서 반드시 확인해야 할 정보입니다.\r
\r
    columns는 DataFrame의 속성으로, 괄호() 없이 사용합니다. Index 객체를 반환하며, 리스트로 변환하려면 df.columns.tolist()를 사용할 수 있습니다. shape 속성은 (행 개수, 열 개수) 튜플을 반환하여 데이터 크기를 파악할 수 있습니다. dtypes 속성은 각 컬럼의 데이터 타입(int64, float64, object 등)을 보여줍니다. 실무에서는 컬럼명이 수십 개일 수 있으므로, 특정 패턴을 포함하는 컬럼을 찾을 때 [col for col in df.columns if 'price' in col]처럼 리스트 컴프리헨션을 사용하기도 합니다.\r
  tips:\r
  - columns는 DataFrame의 속성으로, 괄호() 없이 사용합니다. Index 객체를 반환하며, 리스트로 변환하려면 df.columns.tolist()를 사용할 수 있습니다.\r
    shape 속성은 (행 개수, 열 개수) 튜플을 반환하여 데이터 크기를 파악할 수 있습니다. dtypes 속성은 각 컬럼의 데이터 타입(int64, float64, object\r
    등)을 보여줍니다. 실무에서는 컬럼명이 수십 개일 수 있으므로, 특정 패턴을 포함하는 컬럼을 찾을 때 [col for col in df.columns if 'price' in\r
    col]처럼 리스트 컴프리헨션을 사용하기도 합니다.\r
  snippet: df.columns\r
  exercise:\r
    prompt: 4단계. 컬럼 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: df.columns\r
    hints:\r
    - 바꿀 지점은 대시보드 데이터을 만드는 첫 줄과 인터랙티브 시각화 줄에서 찾으세요.\r
    - 실행 뒤 툴팁과 선택 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 컬럼 확인의 수정 코드가 인터랙티브 시각화 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 4단계. 컬럼 확인 실행 결과가 툴팁과 선택 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step5_filter\r
  title: 5단계. 최근 연도 필터링\r
  structuredPrimary: true\r
  subtitle: 조건 필터링\r
  goal: 5단계. 최근 연도 필터링에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    gapminder 데이터는 1952년부터 2007년까지 여러 연도를 포함하고 있어, 시계열 분석도 가능하지만 여기서는 특정 시점의 스냅샷이 필요합니다. 대륙별 기대수명을 비교하려면 같은 시점의 데이터만 사용해야 공정한 비교가 가능하므로, 가장 최근인 2007년 데이터만 추출합니다. 이렇게 조건 필터링을 하면 142개 국가의 2007년 기록만 남게 되어, 1704개 행이 142개 행으로 줄어듭니다. DataFrame에서 조건 필터링은 df[조건]의 형태로 작성하며, df['year'] == 2007은 year 컬럼 값이 2007과 같은 행만 True로 표시하여 선택하라는 불리언 인덱싱(Boolean Indexing) 방식입니다. 이는 pandas 데이터 처리의 가장 기본적이고 강력한 기능입니다.\r
\r
    불리언 인덱싱은 df[조건] 형태로 사용하며, 조건에는 비교 연산자(==, !=, >, <, >=, <=)를 사용합니다. 여러 조건을 결합할 때는 &(and), |(or), ~(not)을 사용하며, 각 조건을 괄호로 감싸야 합니다. 예를 들어 df[(df['year'] == 2007) & (df['continent'] == 'Asia')]는 2007년 아시아 데이터만 선택합니다. query() 메서드를 사용하면 더 읽기 쉬운 형태로 작성할 수 있습니다: df.query('year == 2007 and continent == "Asia"'). isin() 메서드로 여러 값 중 하나와 일치하는 행을 선택할 수도 있습니다: df[df['year'].isin([2002, 2007])]. 필터링 후 shape로 행 개수를 확인하는 습관을 들이면 의도대로 필터링되었는지 검증할 수 있습니다.\r
  tips:\r
  - '불리언 인덱싱은 df[조건] 형태로 사용하며, 조건에는 비교 연산자(==, !=, >, <, >=, <=)를 사용합니다. 여러 조건을 결합할 때는 &(and), |(or),\r
    ~(not)을 사용하며, 각 조건을 괄호로 감싸야 합니다. 예를 들어 df[(df[''year''] == 2007) & (df[''continent''] == ''Asia'')]는\r
    2007년 아시아 데이터만 선택합니다. query() 메서드를 사용하면 더 읽기 쉬운 형태로 작성할 수 있습니다: df.query(''year == 2007 and continent\r
    == "Asia"''). isin() 메서드로 여러 값 중 하나와 일치하는 행을 선택할 수도 있습니다: df[df[''year''].isin([2002, 2007])]. 필터링\r
    후 shape로 행 개수를 확인하는 습관을 들이면 의도대로 필터링되었는지 검증할 수 있습니다.'\r
  snippet: |-\r
    df2007 = df[df['year'] == 2007]\r
    df2007.shape\r
  exercise:\r
    prompt: 5단계. 최근 연도 필터링 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      df2007 = df[df['year'] == 2007]\r
      df2007.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 최근 연도 필터링에서 \`df2007\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 최근 연도 필터링 실행 뒤 \`df2007\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step6_groupby\r
  title: 6단계. 대륙별 평균 계산\r
  structuredPrimary: true\r
  subtitle: groupby().mean()\r
  goal: 6단계. 대륙별 평균 계산에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    각 국가의 기대수명을 대륙별로 묶어서 평균을 계산합니다. groupby('continent')는 같은 대륙끼리 그룹화하는 명령이고, ['lifeExp'].mean()은 각 그룹의 기대수명 평균을 구하는 것입니다. 예를 들어 아시아에 속한 모든 국가의 기대수명을 더해서 국가 수로 나누면 아시아의 평균 기대수명이 됩니다. reset_index()는 결과를 깔끔한 DataFrame 형태로 만들어서 시각화하기 쉽게 만듭니다. 이 과정을 통해 142개 국가 데이터가 5개 대륙의 평균 데이터로 요약됩니다.\r
\r
    groupby()는 pandas의 핵심 기능으로, 특정 컬럼을 기준으로 데이터를 그룹화합니다. groupby('컬럼명')['집계할컬럼'].집계함수() 형태로 사용하며, 집계함수로는 mean()(평균), sum()(합계), count()(개수), max()(최대), min()(최소) 등이 있습니다. reset_index()를 붙이면 인덱스가 초기화되어 일반 컬럼으로 변환됩니다.\r
  tips:\r
  - groupby()는 pandas의 핵심 기능으로, 특정 컬럼을 기준으로 데이터를 그룹화합니다. groupby('컬럼명')['집계할컬럼'].집계함수() 형태로 사용하며, 집계함수로는\r
    mean()(평균), sum()(합계), count()(개수), max()(최대), min()(최소) 등이 있습니다. reset_index()를 붙이면 인덱스가 초기화되어 일반\r
    컬럼으로 변환됩니다.\r
  snippet: |-\r
    continentLife = df2007.groupby('continent')['lifeExp'].mean().reset_index()\r
    continentLife\r
  exercise:\r
    prompt: 6단계. 대륙별 평균 계산 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      continentLife = df2007.groupby('continent')['lifeExp'].mean().reset_index()\r
      continentLife\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 대륙별 평균 계산에서 \`continentLife\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 대륙별 평균 계산 실행 뒤 \`continentLife\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step7_bar\r
  title: 7단계. 막대 그래프 만들기\r
  structuredPrimary: true\r
  subtitle: px.bar()\r
  goal: 7단계. 막대 그래프 만들기에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    Plotly Express로 막대 그래프를 만드는 것은 매우 간단합니다. px.bar() 함수에 데이터프레임을 전달하고, x축과 y축에 어떤 컬럼을 표시할지만 지정하면 됩니다. 첫 번째 인자는 데이터, x는 가로축에 표시할 범주(여기서는 대륙), y는 세로축에 표시할 수치(여기서는 기대수명)입니다. 이 한 줄의 코드로 인터랙티브한 차트가 자동으로 생성되며, 마우스를 올리면 정확한 값을 확인할 수 있습니다. Plotly의 가장 큰 장점은 코드 한 줄로 완성도 높은 차트를 만들 수 있다는 점입니다. matplotlib처럼 복잡한 설정 없이도 축 라벨, 눈금, 그리드, 호버 기능이 모두 자동으로 제공됩니다.\r
\r
    px.bar(데이터, x='x축컬럼', y='y축컬럼')이 기본 형태입니다. 첫 번째 인자에는 DataFrame을 넣고, x와 y 파라미터에는 컬럼명을 문자열로 지정합니다. 컬럼명은 따옴표로 감싸야 하며, DataFrame에 실제로 존재하는 컬럼명을 사용해야 합니다. 반환된 차트 객체(Figure)는 변수에 저장하거나 바로 표시할 수 있습니다. Codaro 환경에서는 변수명만 작성하면 자동으로 차트가 렌더링됩니다. 실무에서는 여러 차트를 만들 때 figBar, figLine처럼 차트 종류를 변수명에 포함시켜 구분합니다.\r
  tips:\r
  - px.bar(데이터, x='x축컬럼', y='y축컬럼')이 기본 형태입니다. 첫 번째 인자에는 DataFrame을 넣고, x와 y 파라미터에는 컬럼명을 문자열로 지정합니다. 컬럼명은\r
    따옴표로 감싸야 하며, DataFrame에 실제로 존재하는 컬럼명을 사용해야 합니다. 반환된 차트 객체(Figure)는 변수에 저장하거나 바로 표시할 수 있습니다. Codaro\r
    환경에서는 변수명만 작성하면 자동으로 차트가 렌더링됩니다. 실무에서는 여러 차트를 만들 때 figBar, figLine처럼 차트 종류를 변수명에 포함시켜 구분합니다.\r
  snippet: |-\r
    figBar = px.bar(continentLife, x='continent', y='lifeExp')\r
    figBar\r
  exercise:\r
    prompt: 7단계. 막대 그래프 만들기 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBar = px.bar(continentLife, x='continent', y='lifeExp')\r
      figBar\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 막대 그래프 만들기의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 막대 그래프 만들기의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_color\r
  title: 8단계. 색상으로 구분하기\r
  structuredPrimary: true\r
  subtitle: color 파라미터\r
  goal: 8단계. 색상으로 구분하기에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    막대 그래프에 색상을 추가하면 시각적 구분이 명확해져서 정보 전달력이 높아집니다. color 파라미터에 컬럼명을 지정하면 Plotly가 자동으로 각 값에 서로 다른 색상을 배정합니다. 여기서는 각 대륙마다 고유한 색상이 지정되어 한눈에 구분할 수 있습니다. 또한 자동으로 범례(legend)가 생성되어 어떤 색이 어떤 대륙인지 쉽게 확인할 수 있습니다. 실무에서는 프레젠테이션이나 보고서에 사용할 때 색상을 활용하면 청중의 이해를 크게 높일 수 있습니다. 데이터 시각화 연구에 따르면 색상을 적절히 사용한 차트는 정보 전달 속도가 최대 3배 빨라진다고 합니다. 특히 여러 카테고리를 비교할 때 색상 구분은 필수적입니다.\r
\r
    color='컬럼명' 형태로 사용하며, 해당 컬럼의 고유한 값마다 자동으로 다른 색상이 배정됩니다. 범주형 데이터(문자열)에는 구분되는 색상이, 연속형 데이터(숫자)에는 그라디언트 색상이 적용됩니다. 범례는 자동으로 생성되며, 클릭하면 해당 항목을 숨기거나 표시할 수 있습니다. 더블클릭하면 해당 항목만 단독으로 표시됩니다. Plotly는 colorblind-friendly 색상 팔레트를 기본으로 사용하여 색맹인 사람도 구분할 수 있도록 배려합니다. color_discrete_sequence 파라미터로 사용자 정의 색상을 지정할 수도 있습니다.\r
  tips:\r
  - color='컬럼명' 형태로 사용하며, 해당 컬럼의 고유한 값마다 자동으로 다른 색상이 배정됩니다. 범주형 데이터(문자열)에는 구분되는 색상이, 연속형 데이터(숫자)에는 그라디언트\r
    색상이 적용됩니다. 범례는 자동으로 생성되며, 클릭하면 해당 항목을 숨기거나 표시할 수 있습니다. 더블클릭하면 해당 항목만 단독으로 표시됩니다. Plotly는 colorblind-friendly\r
    색상 팔레트를 기본으로 사용하여 색맹인 사람도 구분할 수 있도록 배려합니다. color_discrete_sequence 파라미터로 사용자 정의 색상을 지정할 수도 있습니다.\r
  snippet: |-\r
    figColor = px.bar(continentLife, x='continent', y='lifeExp', color='continent')\r
    figColor\r
  exercise:\r
    prompt: 8단계. 색상으로 구분하기 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figColor = px.bar(continentLife, x='continent', y='lifeExp', color='continent')\r
      figColor\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 색상으로 구분하기의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 색상으로 구분하기의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_labels\r
  title: 9단계. 축 라벨 변경\r
  structuredPrimary: true\r
  subtitle: labels 파라미터\r
  goal: 9단계. 축 라벨 변경에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    기본적으로 Plotly는 컬럼명을 그대로 축 이름으로 사용합니다. 하지만 continent, lifeExp 같은 영문 컬럼명보다는 한글이나 더 설명적인 이름을 사용하면 차트를 보는 사람이 이해하기 쉽습니다. labels 파라미터는 딕셔너리 형태로 원래 컬럼명(key)과 표시할 이름(value)을 매핑합니다. 예를 들어 {'continent': '대륙'}은 continent라는 컬럼명을 차트에서는 대륙으로 표시하라는 의미입니다. 이는 축 제목뿐만 아니라 호버 정보와 범례에도 적용됩니다.\r
\r
    labels는 딕셔너리 형태로 작성합니다. labels={'원래컬럼명': '표시할이름'} 형태이며, 여러 개를 동시에 지정할 수 있습니다. 이 설정은 축 제목, 호버 텍스트, 범례 등 모든 곳에 일괄 적용되어 일관성 있는 차트를 만들 수 있습니다.\r
  tips:\r
  - 'labels는 딕셔너리 형태로 작성합니다. labels={''원래컬럼명'': ''표시할이름''} 형태이며, 여러 개를 동시에 지정할 수 있습니다. 이 설정은 축 제목, 호버\r
    텍스트, 범례 등 모든 곳에 일괄 적용되어 일관성 있는 차트를 만들 수 있습니다.'\r
  snippet: |-\r
    figLabels = px.bar(\r
        continentLife,\r
        x='continent',\r
        y='lifeExp',\r
        color='continent',\r
        labels={'continent': '대륙', 'lifeExp': '평균 기대수명(년)'}\r
    )\r
    figLabels\r
  exercise:\r
    prompt: 9단계. 축 라벨 변경 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figLabels = px.bar(\r
          continentLife,\r
          x='continent',\r
          y='lifeExp',\r
          color='continent',\r
          labels={'continent': '대륙', 'lifeExp': '평균 기대수명(년)'}\r
      )\r
      figLabels\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 축 라벨 변경의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 축 라벨 변경의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_title\r
  title: 10단계. 제목 추가\r
  structuredPrimary: true\r
  subtitle: title 파라미터\r
  goal: 10단계. 제목 추가에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    차트에 제목을 추가하면 무엇을 보여주는 시각화인지 명확하게 전달할 수 있습니다. title 파라미터에 문자열을 지정하면 차트 상단에 제목이 표시됩니다. 좋은 제목은 시간(2007년), 비교 대상(대륙별), 측정 지표(평균 기대수명)를 모두 포함해야 합니다. 이렇게 하면 차트만 봐도 맥락을 이해할 수 있어 보고서나 프레젠테이션에서 매우 유용합니다. 이제 색상, 축 라벨, 제목까지 모두 갖춘 완성도 높은 시각화가 완성되었습니다.\r
\r
    title 파라미터는 문자열로 지정하며, 차트 상단 중앙에 표시됩니다. 제목은 간결하면서도 핵심 정보(무엇을, 언제, 어떻게)를 담아야 합니다. 나중에 update_layout(title=dict(text='제목', x=0.5, font_size=20))처럼 위치와 스타일을 세밀하게 조정할 수도 있습니다.\r
  tips:\r
  - title 파라미터는 문자열로 지정하며, 차트 상단 중앙에 표시됩니다. 제목은 간결하면서도 핵심 정보(무엇을, 언제, 어떻게)를 담아야 합니다. 나중에 update_layout(title=dict(text='제목',\r
    x=0.5, font_size=20))처럼 위치와 스타일을 세밀하게 조정할 수도 있습니다.\r
  snippet: |-\r
    figFinal = px.bar(\r
        continentLife,\r
        x='continent',\r
        y='lifeExp',\r
        color='continent',\r
        labels={'continent': '대륙', 'lifeExp': '평균 기대수명(년)'},\r
        title='2007년 대륙별 평균 기대수명 비교'\r
    )\r
    figFinal\r
  exercise:\r
    prompt: 10단계. 제목 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal = px.bar(\r
          continentLife,\r
          x='continent',\r
          y='lifeExp',\r
          color='continent',\r
          labels={'continent': '대륙', 'lifeExp': '평균 기대수명(년)'},\r
          title='2007년 대륙별 평균 기대수명 비교'\r
      )\r
      figFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 제목 추가의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 제목 추가의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: workflow_validation\r
  title: 실무 막대 차트 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 확인 → figure 검증 → 연도 기준 실험\r
  goal: 실무 막대 차트 검증에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 조건 분기는 입력값에 따라 실행 경로가 바뀌므로 결과를 바로 확인해야 합니다.\r
  explanation: Plotly 차트는 화면에 보이는 것만으로 충분하지 않습니다. 실무 보고서에서는 어떤 연도 데이터인지, 몇 개 대륙이 들어갔는지, 제목·축·색상 그룹이 빠지지\r
    않았는지 코드로 확인해야 합니다. 이번 단계에서는 기대수명 평균이 가장 높은 대륙을 먼저 예상하고, 색상 그룹이 빠진 차트를 일부러 실패시킵니다. 그다음 Figure 구조를 검증하고,\r
    분석 연도를 바꿨을 때 결과가 어떻게 달라지는지 실험합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    requiredColumns = {"continent", "year", "lifeExp", "gdpPercap", "country"}\r
    missingColumns = requiredColumns - set(df.columns)\r
    if missingColumns:\r
        raise ValueError(f"gapminder 데이터에 필요한 컬럼이 없습니다: {sorted(missingColumns)}")\r
\r
    latestYear = int(df["year"].max())\r
    latestData = df[df["year"] == latestYear].copy()\r
    latestLifeReport = (\r
        latestData.groupby("continent", as_index=False)["lifeExp"]\r
        .mean()\r
        .sort_values("lifeExp", ascending=False)\r
    )\r
    expectedBestContinent = latestLifeReport.iloc[0]["continent"]\r
\r
    print("예상: 최신 연도 평균 기대수명이 가장 높은 대륙은", expectedBestContinent)\r
    latestLifeReport\r
  exercise:\r
    prompt: 실무 막대 차트 검증 예제에서 조건값을 바꾸고 선택되는 분기와 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      requiredColumns = {"continent", "year", "lifeExp", "gdpPercap", "country"}\r
      missingColumns = requiredColumns - set(df.columns)\r
      if missingColumns:\r
          raise ValueError(f"gapminder 데이터에 필요한 컬럼이 없습니다: {sorted(missingColumns)}")\r
\r
      latestYear = int(df["year"].max())\r
      latestData = df[df["year"] == latestYear].copy()\r
      latestLifeReport = (\r
          latestData.groupby("continent", as_index=False)["lifeExp"]\r
          .mean()\r
          .sort_values("lifeExp", ascending=False)\r
      )\r
      expectedBestContinent = latestLifeReport.iloc[0]["continent"]\r
\r
      print("예상: 최신 연도 평균 기대수명이 가장 높은 대륙은", expectedBestContinent)\r
      latestLifeReport\r
    hints:\r
    - 바꿀 지점은 if 조건식에 들어가는 비교값이나 boolean 값에서 찾으세요.\r
    - 실행 뒤 true/false 분기 중 어떤 코드가 평가됐는지 출력이나 변수값으로 확인하세요.\r
  check:\r
    type: noError\r
    noError: 실무 막대 차트 검증의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.\r
    resultCheck: 실무 막대 차트 검증 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: gapminder 데이터 분석 프로젝트\r
  goal: 실습에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 모든 내용을 활용해서 gapminder 데이터를 다양한 각도로 분석해봅시다. 데이터 필터링, groupby 집계, px.bar 시각화, color/labels/title 설정까지 전 과정을 직접 수행합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import plotly.express as px\r
    import pandas as pd\r
\r
    data = px.data.gapminder()\r
    data2007 = data[data['year'] == 2007]\r
    gdpByContinent = data2007.groupby('continent')['gdpPercap'].mean().reset_index()\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      import pandas as pd\r
\r
      data = px.data.gapminder()\r
      data2007 = data[data['year'] == 2007]\r
      gdpByContinent = data2007.groupby('continent')['gdpPercap'].mean().reset_index()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`data\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: Plotly Express로 첫 시각화를 완성했습니다.\r
  - type: list\r
    items:\r
    - import plotly.express as px - Plotly Express 불러오기\r
    - px.data.gapminder() - 내장 데이터 로드\r
    - px.bar(df, x, y) - 막대 그래프 기본\r
    - color='컬럼' - 색상으로 그룹 구분\r
    - labels={} - 축 라벨 변경\r
    - title='' - 차트 제목 추가\r
  - type: text\r
    content: 다음 시간에는 팁 데이터로 히스토그램과 박스 플롯을 배웁니다.\r
  goal: 정리에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
`;export{e as default};