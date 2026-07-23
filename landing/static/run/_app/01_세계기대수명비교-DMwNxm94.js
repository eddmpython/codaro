var e=`meta:
  packages:
  - pandas
  - plotly
  id: plotly_01
  title: 세계기대수명비교
  order: 1
  category: plotly
  difficulty: ⭐
  badge: 입문
  tags:
  - gapminder
  - bar
  - color
  - 기초
  seo:
    title: Plotly Express 막대 그래프 - 대륙별 기대수명 비교
    description: gapminder 데이터로 대륙별 기대수명을 막대 그래프로 시각화합니다. px.bar, color, title 사용법을 배웁니다.
    keywords:
    - plotly express
    - px.bar
    - 막대그래프
    - gapminder
    - 기대수명
intro:
  emoji: 🌍
  goal: 대륙별 평균 기대수명을 막대 그래프로 비교합니다.
  description: Plotly Express로 첫 번째 시각화를 만듭니다. 데이터 로드 → 집계 → 시각화의 흐름을 익힙니다.
  direction: 세계기대수명비교에서 데이터를 상호작용 차트로 구성하고 필터와 표시 상태를 검증합니다.
  benefits:
  - 대시보드 데이터 확인 후 인터랙티브 시각화에 맞는 코드 입력을 고릅니다.
  - 세계기대수명비교 결과를 툴팁과 선택 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 공유 대시보드에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(대시보드 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 데이터 불러오기 처리 실행
      detail: 인터랙티브 시각화 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 데이터 확인 결과 검증
      detail: 툴팁과 선택 상태 기준으로 실행 결과를 비교합니다.
    - label: 세계기대수명비교 재사용
      detail: 완성 코드를 공유 대시보드에 붙일 수 있게 정리합니다.
    runtime:
    - label: 인터랙티브 차트 환경
      detail: pandas, plotly 기준으로 로컬 Python 실행을 준비합니다.
    - label: 세계기대수명비교 실행
      detail: 셀을 실행해 툴팁과 선택 상태와 예외 상태를 확인합니다.
    - label: 세계기대수명비교 완료
      detail: 검증된 코드를 공유 대시보드로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: |-
    Plotly Express는 파이썬에서 인터랙티브 시각화를 만드는 강력한 라이브러리입니다. 정적 이미지만 제공하는 matplotlib와 달리, 마우스로 확대/축소/이동이 가능하고 호버 시 상세 정보를 볼 수 있습니다. Codaro가 pandas와 plotly를 uv로 준비하면 웹 브라우저에서 사용자가 데이터를 탐색할 수 있고, HTML로 저장해 프레젠테이션이나 보고서에 바로 삽입할 수 있습니다. 특히 웹 기반 대시보드나 데이터 탐색에 매우 효과적입니다. pandas는 데이터를 불러오고 가공하는 데 사용하며, Plotly Express와 완벽하게 호환됩니다. 두 라이브러리를 함께 사용하면 데이터 분석부터 시각화까지 한 번에 처리할 수 있습니다. Plotly Express의 px라는 짧은 이름은 데이터 과학 커뮤니티의 표준 관례로, 코드 가독성을 높여줍니다.

    import plotly.express as px는 plotly.express 라이브러리를 px라는 짧은 이름으로 불러오는 관례입니다. px.bar(), px.scatter()처럼 짧고 직관적으로 사용할 수 있습니다. import pandas as pd와 마찬가지로, 데이터 과학 커뮤니티에서 널리 사용하는 표준 방식입니다. as 키워드는 alias(별칭)를 만드는 것으로, plotly.express.bar(...) 대신 px.bar(...)로 간결하게 작성할 수 있어 코드 타이핑을 크게 줄여줍니다. 실무에서는 수십 개의 차트를 만들기 때문에 이런 짧은 표기법이 생산성에 큰 영향을 미칩니다.
  tips:
  - import plotly.express as px는 plotly.express 라이브러리를 px라는 짧은 이름으로 불러오는 관례입니다. px.bar(), px.scatter()처럼
    짧고 직관적으로 사용할 수 있습니다. import pandas as pd와 마찬가지로, 데이터 과학 커뮤니티에서 널리 사용하는 표준 방식입니다. as 키워드는 alias(별칭)를
    만드는 것으로, plotly.express.bar(...) 대신 px.bar(...)로 간결하게 작성할 수 있어 코드 타이핑을 크게 줄여줍니다. 실무에서는 수십 개의 차트를 만들기
    때문에 이런 짧은 표기법이 생산성에 큰 영향을 미칩니다.
  snippet: |-
    import plotly.express as px
    import pandas as pd
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: |-
      import plotly.express as px
      import pandas as pd
    hints:
    - 바꿀 지점은 대시보드 데이터을 만드는 첫 줄과 인터랙티브 시각화 줄에서 찾으세요.
    - 실행 뒤 툴팁과 선택 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 툴팁과 선택 상태 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step2_load
  title: 2단계. 데이터 불러오기
  structuredPrimary: true
  subtitle: px.data.gapminder()
  goal: 2단계. 데이터 불러오기에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    gapminder는 세계 각국의 발전 지표를 담은 유명한 데이터셋입니다. 1952년부터 2007년까지 5년 단위로 기대수명(lifeExp), 인구(pop), 1인당 GDP(gdpPercap) 등이 기록되어 있습니다. 이 데이터는 Hans Rosling 교수가 세계 발전 상황을 설명하는 데 사용했던 것으로, 경제 발전과 건강 수준의 관계를 명확히 보여줍니다. Plotly Express는 이런 유용한 데이터를 내장하고 있어 별도로 CSV를 다운로드하거나 URL을 찾을 필요가 없습니다. 실무에서는 공공 데이터 포털이나 API에서 데이터를 받지만, 학습 단계에서는 이렇게 내장 데이터로 빠르게 시각화 기법을 익힐 수 있습니다.

    px.data.gapminder()는 Plotly Express에 내장된 데이터셋을 불러오는 함수입니다. 괄호()를 붙여야 실제 데이터가 로드됩니다. 다른 내장 데이터로는 px.data.iris()(붓꽃 품종 데이터), px.data.tips()(레스토랑 팁 데이터), px.data.stocks()(주식 시계열 데이터) 등이 있으며, 모두 연습용으로 매우 유용합니다. 각 데이터셋은 특정 시각화 기법을 학습하기에 최적화되어 있어 튜토리얼과 문서 예제에서 널리 사용됩니다.
  tips:
  - px.data.gapminder()는 Plotly Express에 내장된 데이터셋을 불러오는 함수입니다. 괄호()를 붙여야 실제 데이터가 로드됩니다. 다른 내장 데이터로는 px.data.iris()(붓꽃
    품종 데이터), px.data.tips()(레스토랑 팁 데이터), px.data.stocks()(주식 시계열 데이터) 등이 있으며, 모두 연습용으로 매우 유용합니다. 각 데이터셋은
    특정 시각화 기법을 학습하기에 최적화되어 있어 튜토리얼과 문서 예제에서 널리 사용됩니다.
  snippet: df = px.data.gapminder()
  exercise:
    prompt: 2단계. 데이터 불러오기 예제에서 \`df\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: df = px.data.gapminder()
    hints:
    - 바꿀 지점은 \`df = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`df\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 2단계. 데이터 불러오기에서 \`df\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 2단계. 데이터 불러오기 실행 뒤 \`df\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step3_explore
  title: 3단계. 데이터 확인
  structuredPrimary: true
  subtitle: df.head(), df.shape
  goal: 3단계. 데이터 확인에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.
  explanation: |-
    데이터를 분석하기 전에 먼저 구조를 파악하는 것이 중요합니다. head() 메서드는 처음 5개 행을 보여줘서 어떤 형태인지 빠르게 확인할 수 있습니다. gapminder 데이터는 1704개의 행(각 국가의 연도별 기록)과 8개의 열(변수)로 구성되어 있습니다. 주요 컬럼으로는 country(국가명), continent(대륙), year(연도), lifeExp(기대수명), pop(인구), gdpPercap(1인당 GDP) 등이 있습니다. 이 정보를 통해 경제 발전과 건강 수준의 관계를 분석할 수 있습니다.

    head() 메서드는 DataFrame의 처음 5개 행을 반환합니다. 인자를 전달하면 원하는 개수만큼 볼 수 있습니다(예. head(10)). 반대로 tail()은 마지막 N개 행을 보여줍니다. info() 메서드를 사용하면 각 컬럼의 데이터 타입, null 개수, 메모리 사용량 등 더 상세한 정보를 확인할 수 있습니다. describe()는 수치형 컬럼의 평균, 표준편차, 최소값, 최대값, 사분위수를 요약해줍니다. 데이터 탐색의 첫 단계에서는 이 세 가지 메서드(head, info, describe)를 순서대로 사용하는 것이 표준 워크플로우입니다.
  tips:
  - head() 메서드는 DataFrame의 처음 5개 행을 반환합니다. 인자를 전달하면 원하는 개수만큼 볼 수 있습니다(예. head(10)). 반대로 tail()은 마지막 N개
    행을 보여줍니다. info() 메서드를 사용하면 각 컬럼의 데이터 타입, null 개수, 메모리 사용량 등 더 상세한 정보를 확인할 수 있습니다. describe()는 수치형
    컬럼의 평균, 표준편차, 최소값, 최대값, 사분위수를 요약해줍니다. 데이터 탐색의 첫 단계에서는 이 세 가지 메서드(head, info, describe)를 순서대로 사용하는
    것이 표준 워크플로우입니다.
  snippet: df.head()
  exercise:
    prompt: 3단계. 데이터 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: df.head()
    hints:
    - 바꿀 지점은 대시보드 데이터을 만드는 첫 줄과 인터랙티브 시각화 줄에서 찾으세요.
    - 실행 뒤 툴팁과 선택 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 데이터 확인의 수정 코드가 인터랙티브 시각화 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: 3단계. 데이터 확인 실행 결과가 툴팁과 선택 상태 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step4_columns
  title: 4단계. 컬럼 확인
  structuredPrimary: true
  subtitle: df.columns
  goal: 4단계. 컬럼 확인에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.
  explanation: |-
    columns 속성은 DataFrame에 포함된 모든 열(컬럼)의 이름을 보여줍니다. 시각화를 만들 때 정확한 컬럼명을 알아야 x축, y축, 색상 등에 지정할 수 있기 때문에 이 단계는 필수적입니다. 예를 들어 기대수명을 시각화하려면 lifeExp라는 정확한 이름을 사용해야 하며, LifeExp나 life_exp처럼 다르게 쓰면 에러가 발생합니다. Python은 대소문자를 구분하므로 컬럼명을 정확히 기억하거나 복사해서 사용하는 것이 좋습니다. 데이터 탐색의 첫 단계에서 반드시 확인해야 할 정보입니다.

    columns는 DataFrame의 속성으로, 괄호() 없이 사용합니다. Index 객체를 반환하며, 리스트로 변환하려면 df.columns.tolist()를 사용할 수 있습니다. shape 속성은 (행 개수, 열 개수) 튜플을 반환하여 데이터 크기를 파악할 수 있습니다. dtypes 속성은 각 컬럼의 데이터 타입(int64, float64, object 등)을 보여줍니다. 실무에서는 컬럼명이 수십 개일 수 있으므로, 특정 패턴을 포함하는 컬럼을 찾을 때 [col for col in df.columns if 'price' in col]처럼 리스트 컴프리헨션을 사용하기도 합니다.
  tips:
  - columns는 DataFrame의 속성으로, 괄호() 없이 사용합니다. Index 객체를 반환하며, 리스트로 변환하려면 df.columns.tolist()를 사용할 수 있습니다.
    shape 속성은 (행 개수, 열 개수) 튜플을 반환하여 데이터 크기를 파악할 수 있습니다. dtypes 속성은 각 컬럼의 데이터 타입(int64, float64, object
    등)을 보여줍니다. 실무에서는 컬럼명이 수십 개일 수 있으므로, 특정 패턴을 포함하는 컬럼을 찾을 때 [col for col in df.columns if 'price' in
    col]처럼 리스트 컴프리헨션을 사용하기도 합니다.
  snippet: df.columns
  exercise:
    prompt: 4단계. 컬럼 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: df.columns
    hints:
    - 바꿀 지점은 대시보드 데이터을 만드는 첫 줄과 인터랙티브 시각화 줄에서 찾으세요.
    - 실행 뒤 툴팁과 선택 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 4단계. 컬럼 확인의 수정 코드가 인터랙티브 시각화 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: 4단계. 컬럼 확인 실행 결과가 툴팁과 선택 상태 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step5_filter
  title: 5단계. 최근 연도 필터링
  structuredPrimary: true
  subtitle: 조건 필터링
  goal: 5단계. 최근 연도 필터링에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    gapminder 데이터는 1952년부터 2007년까지 여러 연도를 포함하고 있어, 시계열 분석도 가능하지만 여기서는 특정 시점의 스냅샷이 필요합니다. 대륙별 기대수명을 비교하려면 같은 시점의 데이터만 사용해야 공정한 비교가 가능하므로, 가장 최근인 2007년 데이터만 추출합니다. 이렇게 조건 필터링을 하면 142개 국가의 2007년 기록만 남게 되어, 1704개 행이 142개 행으로 줄어듭니다. DataFrame에서 조건 필터링은 df[조건]의 형태로 작성하며, df['year'] == 2007은 year 컬럼 값이 2007과 같은 행만 True로 표시하여 선택하라는 불리언 인덱싱(Boolean Indexing) 방식입니다. 이는 pandas 데이터 처리의 가장 기본적이고 강력한 기능입니다.

    불리언 인덱싱은 df[조건] 형태로 사용하며, 조건에는 비교 연산자(==, !=, >, <, >=, <=)를 사용합니다. 여러 조건을 결합할 때는 &(and), |(or), ~(not)을 사용하며, 각 조건을 괄호로 감싸야 합니다. 예를 들어 df[(df['year'] == 2007) & (df['continent'] == 'Asia')]는 2007년 아시아 데이터만 선택합니다. query() 메서드를 사용하면 더 읽기 쉬운 형태로 작성할 수 있습니다: df.query('year == 2007 and continent == "Asia"'). isin() 메서드로 여러 값 중 하나와 일치하는 행을 선택할 수도 있습니다: df[df['year'].isin([2002, 2007])]. 필터링 후 shape로 행 개수를 확인하는 습관을 들이면 의도대로 필터링되었는지 검증할 수 있습니다.
  tips:
  - '불리언 인덱싱은 df[조건] 형태로 사용하며, 조건에는 비교 연산자(==, !=, >, <, >=, <=)를 사용합니다. 여러 조건을 결합할 때는 &(and), |(or),
    ~(not)을 사용하며, 각 조건을 괄호로 감싸야 합니다. 예를 들어 df[(df[''year''] == 2007) & (df[''continent''] == ''Asia'')]는
    2007년 아시아 데이터만 선택합니다. query() 메서드를 사용하면 더 읽기 쉬운 형태로 작성할 수 있습니다: df.query(''year == 2007 and continent
    == "Asia"''). isin() 메서드로 여러 값 중 하나와 일치하는 행을 선택할 수도 있습니다: df[df[''year''].isin([2002, 2007])]. 필터링
    후 shape로 행 개수를 확인하는 습관을 들이면 의도대로 필터링되었는지 검증할 수 있습니다.'
  snippet: |-
    df2007 = df[df['year'] == 2007]
    df2007.shape
  exercise:
    prompt: 5단계. 최근 연도 필터링 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      df2007 = df[df['year'] == 2007]
      df2007.shape
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 5단계. 최근 연도 필터링에서 \`df2007\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 5단계. 최근 연도 필터링 실행 뒤 \`df2007\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: step6_groupby
  title: 6단계. 대륙별 평균 계산
  structuredPrimary: true
  subtitle: groupby().mean()
  goal: 6단계. 대륙별 평균 계산에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    각 국가의 기대수명을 대륙별로 묶어서 평균을 계산합니다. groupby('continent')는 같은 대륙끼리 그룹화하는 명령이고, ['lifeExp'].mean()은 각 그룹의 기대수명 평균을 구하는 것입니다. 예를 들어 아시아에 속한 모든 국가의 기대수명을 더해서 국가 수로 나누면 아시아의 평균 기대수명이 됩니다. reset_index()는 결과를 깔끔한 DataFrame 형태로 만들어서 시각화하기 쉽게 만듭니다. 이 과정을 통해 142개 국가 데이터가 5개 대륙의 평균 데이터로 요약됩니다.

    groupby()는 pandas의 핵심 기능으로, 특정 컬럼을 기준으로 데이터를 그룹화합니다. groupby('컬럼명')['집계할컬럼'].집계함수() 형태로 사용하며, 집계함수로는 mean()(평균), sum()(합계), count()(개수), max()(최대), min()(최소) 등이 있습니다. reset_index()를 붙이면 인덱스가 초기화되어 일반 컬럼으로 변환됩니다.
  tips:
  - groupby()는 pandas의 핵심 기능으로, 특정 컬럼을 기준으로 데이터를 그룹화합니다. groupby('컬럼명')['집계할컬럼'].집계함수() 형태로 사용하며, 집계함수로는
    mean()(평균), sum()(합계), count()(개수), max()(최대), min()(최소) 등이 있습니다. reset_index()를 붙이면 인덱스가 초기화되어 일반
    컬럼으로 변환됩니다.
  snippet: |-
    continentLife = df2007.groupby('continent')['lifeExp'].mean().reset_index()
    continentLife
  exercise:
    prompt: 6단계. 대륙별 평균 계산 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      continentLife = df2007.groupby('continent')['lifeExp'].mean().reset_index()
      continentLife
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 6단계. 대륙별 평균 계산에서 \`continentLife\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 6단계. 대륙별 평균 계산 실행 뒤 \`continentLife\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: step7_bar
  title: 7단계. 막대 그래프 만들기
  structuredPrimary: true
  subtitle: px.bar()
  goal: 7단계. 막대 그래프 만들기에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    Plotly Express로 막대 그래프를 만드는 것은 매우 간단합니다. px.bar() 함수에 데이터프레임을 전달하고, x축과 y축에 어떤 컬럼을 표시할지만 지정하면 됩니다. 첫 번째 인자는 데이터, x는 가로축에 표시할 범주(여기서는 대륙), y는 세로축에 표시할 수치(여기서는 기대수명)입니다. 이 한 줄의 코드로 인터랙티브한 차트가 자동으로 생성되며, 마우스를 올리면 정확한 값을 확인할 수 있습니다. Plotly의 가장 큰 장점은 코드 한 줄로 완성도 높은 차트를 만들 수 있다는 점입니다. matplotlib처럼 복잡한 설정 없이도 축 라벨, 눈금, 그리드, 호버 기능이 모두 자동으로 제공됩니다.

    px.bar(데이터, x='x축컬럼', y='y축컬럼')이 기본 형태입니다. 첫 번째 인자에는 DataFrame을 넣고, x와 y 파라미터에는 컬럼명을 문자열로 지정합니다. 컬럼명은 따옴표로 감싸야 하며, DataFrame에 실제로 존재하는 컬럼명을 사용해야 합니다. 반환된 차트 객체(Figure)는 변수에 저장하거나 바로 표시할 수 있습니다. Codaro 환경에서는 변수명만 작성하면 자동으로 차트가 렌더링됩니다. 실무에서는 여러 차트를 만들 때 figBar, figLine처럼 차트 종류를 변수명에 포함시켜 구분합니다.
  tips:
  - px.bar(데이터, x='x축컬럼', y='y축컬럼')이 기본 형태입니다. 첫 번째 인자에는 DataFrame을 넣고, x와 y 파라미터에는 컬럼명을 문자열로 지정합니다. 컬럼명은
    따옴표로 감싸야 하며, DataFrame에 실제로 존재하는 컬럼명을 사용해야 합니다. 반환된 차트 객체(Figure)는 변수에 저장하거나 바로 표시할 수 있습니다. Codaro
    환경에서는 변수명만 작성하면 자동으로 차트가 렌더링됩니다. 실무에서는 여러 차트를 만들 때 figBar, figLine처럼 차트 종류를 변수명에 포함시켜 구분합니다.
  snippet: |-
    figBar = px.bar(continentLife, x='continent', y='lifeExp')
    figBar
  exercise:
    prompt: 7단계. 막대 그래프 만들기 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figBar = px.bar(continentLife, x='continent', y='lifeExp')
      figBar
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 7단계. 막대 그래프 만들기의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 7단계. 막대 그래프 만들기의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step8_color
  title: 8단계. 색상으로 구분하기
  structuredPrimary: true
  subtitle: color 파라미터
  goal: 8단계. 색상으로 구분하기에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    막대 그래프에 색상을 추가하면 시각적 구분이 명확해져서 정보 전달력이 높아집니다. color 파라미터에 컬럼명을 지정하면 Plotly가 자동으로 각 값에 서로 다른 색상을 배정합니다. 여기서는 각 대륙마다 고유한 색상이 지정되어 한눈에 구분할 수 있습니다. 또한 자동으로 범례(legend)가 생성되어 어떤 색이 어떤 대륙인지 쉽게 확인할 수 있습니다. 실무에서는 프레젠테이션이나 보고서에 사용할 때 색상을 활용하면 청중의 이해를 크게 높일 수 있습니다. 데이터 시각화 연구에 따르면 색상을 적절히 사용한 차트는 정보 전달 속도가 최대 3배 빨라진다고 합니다. 특히 여러 카테고리를 비교할 때 색상 구분은 필수적입니다.

    color='컬럼명' 형태로 사용하며, 해당 컬럼의 고유한 값마다 자동으로 다른 색상이 배정됩니다. 범주형 데이터(문자열)에는 구분되는 색상이, 연속형 데이터(숫자)에는 그라디언트 색상이 적용됩니다. 범례는 자동으로 생성되며, 클릭하면 해당 항목을 숨기거나 표시할 수 있습니다. 더블클릭하면 해당 항목만 단독으로 표시됩니다. Plotly는 colorblind-friendly 색상 팔레트를 기본으로 사용하여 색맹인 사람도 구분할 수 있도록 배려합니다. color_discrete_sequence 파라미터로 사용자 정의 색상을 지정할 수도 있습니다.
  tips:
  - color='컬럼명' 형태로 사용하며, 해당 컬럼의 고유한 값마다 자동으로 다른 색상이 배정됩니다. 범주형 데이터(문자열)에는 구분되는 색상이, 연속형 데이터(숫자)에는 그라디언트
    색상이 적용됩니다. 범례는 자동으로 생성되며, 클릭하면 해당 항목을 숨기거나 표시할 수 있습니다. 더블클릭하면 해당 항목만 단독으로 표시됩니다. Plotly는 colorblind-friendly
    색상 팔레트를 기본으로 사용하여 색맹인 사람도 구분할 수 있도록 배려합니다. color_discrete_sequence 파라미터로 사용자 정의 색상을 지정할 수도 있습니다.
  snippet: |-
    figColor = px.bar(continentLife, x='continent', y='lifeExp', color='continent')
    figColor
  exercise:
    prompt: 8단계. 색상으로 구분하기 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figColor = px.bar(continentLife, x='continent', y='lifeExp', color='continent')
      figColor
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 8단계. 색상으로 구분하기의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 8단계. 색상으로 구분하기의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step9_labels
  title: 9단계. 축 라벨 변경
  structuredPrimary: true
  subtitle: labels 파라미터
  goal: 9단계. 축 라벨 변경에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    기본적으로 Plotly는 컬럼명을 그대로 축 이름으로 사용합니다. 하지만 continent, lifeExp 같은 영문 컬럼명보다는 한글이나 더 설명적인 이름을 사용하면 차트를 보는 사람이 이해하기 쉽습니다. labels 파라미터는 딕셔너리 형태로 원래 컬럼명(key)과 표시할 이름(value)을 매핑합니다. 예를 들어 {'continent': '대륙'}은 continent라는 컬럼명을 차트에서는 대륙으로 표시하라는 의미입니다. 이는 축 제목뿐만 아니라 호버 정보와 범례에도 적용됩니다.

    labels는 딕셔너리 형태로 작성합니다. labels={'원래컬럼명': '표시할이름'} 형태이며, 여러 개를 동시에 지정할 수 있습니다. 이 설정은 축 제목, 호버 텍스트, 범례 등 모든 곳에 일괄 적용되어 일관성 있는 차트를 만들 수 있습니다.
  tips:
  - 'labels는 딕셔너리 형태로 작성합니다. labels={''원래컬럼명'': ''표시할이름''} 형태이며, 여러 개를 동시에 지정할 수 있습니다. 이 설정은 축 제목, 호버
    텍스트, 범례 등 모든 곳에 일괄 적용되어 일관성 있는 차트를 만들 수 있습니다.'
  snippet: |-
    figLabels = px.bar(
        continentLife,
        x='continent',
        y='lifeExp',
        color='continent',
        labels={'continent': '대륙', 'lifeExp': '평균 기대수명(년)'}
    )
    figLabels
  exercise:
    prompt: 9단계. 축 라벨 변경 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figLabels = px.bar(
          continentLife,
          x='continent',
          y='lifeExp',
          color='continent',
          labels={'continent': '대륙', 'lifeExp': '평균 기대수명(년)'}
      )
      figLabels
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 9단계. 축 라벨 변경의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 9단계. 축 라벨 변경의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step10_title
  title: 10단계. 제목 추가
  structuredPrimary: true
  subtitle: title 파라미터
  goal: 10단계. 제목 추가에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    차트에 제목을 추가하면 무엇을 보여주는 시각화인지 명확하게 전달할 수 있습니다. title 파라미터에 문자열을 지정하면 차트 상단에 제목이 표시됩니다. 좋은 제목은 시간(2007년), 비교 대상(대륙별), 측정 지표(평균 기대수명)를 모두 포함해야 합니다. 이렇게 하면 차트만 봐도 맥락을 이해할 수 있어 보고서나 프레젠테이션에서 매우 유용합니다. 이제 색상, 축 라벨, 제목까지 모두 갖춘 완성도 높은 시각화가 완성되었습니다.

    title 파라미터는 문자열로 지정하며, 차트 상단 중앙에 표시됩니다. 제목은 간결하면서도 핵심 정보(무엇을, 언제, 어떻게)를 담아야 합니다. 나중에 update_layout(title=dict(text='제목', x=0.5, font_size=20))처럼 위치와 스타일을 세밀하게 조정할 수도 있습니다.
  tips:
  - title 파라미터는 문자열로 지정하며, 차트 상단 중앙에 표시됩니다. 제목은 간결하면서도 핵심 정보(무엇을, 언제, 어떻게)를 담아야 합니다. 나중에 update_layout(title=dict(text='제목',
    x=0.5, font_size=20))처럼 위치와 스타일을 세밀하게 조정할 수도 있습니다.
  snippet: |-
    figFinal = px.bar(
        continentLife,
        x='continent',
        y='lifeExp',
        color='continent',
        labels={'continent': '대륙', 'lifeExp': '평균 기대수명(년)'},
        title='2007년 대륙별 평균 기대수명 비교'
    )
    figFinal
  exercise:
    prompt: 10단계. 제목 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figFinal = px.bar(
          continentLife,
          x='continent',
          y='lifeExp',
          color='continent',
          labels={'continent': '대륙', 'lifeExp': '평균 기대수명(년)'},
          title='2007년 대륙별 평균 기대수명 비교'
      )
      figFinal
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 10단계. 제목 추가의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 10단계. 제목 추가의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: workflow_validation
  title: 실무 막대 차트 검증
  structuredPrimary: true
  subtitle: 예측 → 오류 확인 → figure 검증 → 연도 기준 실험
  goal: 실무 막대 차트 검증에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.
  why: 조건 분기는 입력값에 따라 실행 경로가 바뀌므로 결과를 바로 확인해야 합니다.
  explanation: Plotly 차트는 화면에 보이는 것만으로 충분하지 않습니다. 실무 보고서에서는 어떤 연도 데이터인지, 몇 개 대륙이 들어갔는지, 제목·축·색상 그룹이 빠지지
    않았는지 코드로 확인해야 합니다. 이번 단계에서는 기대수명 평균이 가장 높은 대륙을 먼저 예상하고, 색상 그룹이 빠진 차트를 일부러 실패시킵니다. 그다음 Figure 구조를 검증하고,
    분석 연도를 바꿨을 때 결과가 어떻게 달라지는지 실험합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    requiredColumns = {"continent", "year", "lifeExp", "gdpPercap", "country"}
    missingColumns = requiredColumns - set(df.columns)
    if missingColumns:
        raise ValueError(f"gapminder 데이터에 필요한 컬럼이 없습니다: {sorted(missingColumns)}")

    latestYear = int(df["year"].max())
    latestData = df[df["year"] == latestYear].copy()
    latestLifeReport = (
        latestData.groupby("continent", as_index=False)["lifeExp"]
        .mean()
        .sort_values("lifeExp", ascending=False)
    )
    expectedBestContinent = latestLifeReport.iloc[0]["continent"]

    print("예상: 최신 연도 평균 기대수명이 가장 높은 대륙은", expectedBestContinent)
    latestLifeReport
  exercise:
    prompt: 실무 막대 차트 검증 예제에서 조건값을 바꾸고 선택되는 분기와 결과가 달라지는지 확인하세요.
    starterCode: |-
      requiredColumns = {"continent", "year", "lifeExp", "gdpPercap", "country"}
      missingColumns = requiredColumns - set(df.columns)
      if missingColumns:
          raise ValueError(f"gapminder 데이터에 필요한 컬럼이 없습니다: {sorted(missingColumns)}")

      latestYear = int(df["year"].max())
      latestData = df[df["year"] == latestYear].copy()
      latestLifeReport = (
          latestData.groupby("continent", as_index=False)["lifeExp"]
          .mean()
          .sort_values("lifeExp", ascending=False)
      )
      expectedBestContinent = latestLifeReport.iloc[0]["continent"]

      print("예상: 최신 연도 평균 기대수명이 가장 높은 대륙은", expectedBestContinent)
      latestLifeReport
    hints:
    - 바꿀 지점은 if 조건식에 들어가는 비교값이나 boolean 값에서 찾으세요.
    - 실행 뒤 true/false 분기 중 어떤 코드가 평가됐는지 출력이나 변수값으로 확인하세요.
  check:
    type: noError
    noError: 실무 막대 차트 검증의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.
    resultCheck: 실무 막대 차트 검증 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: gapminder 데이터 분석 프로젝트
  goal: 실습에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    지금까지 배운 모든 내용을 활용해서 gapminder 데이터를 다양한 각도로 분석해봅시다. 데이터 필터링, groupby 집계, px.bar 시각화, color/labels/title 설정까지 전 과정을 직접 수행합니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import plotly.express as px
    import pandas as pd

    data = px.data.gapminder()
    data2007 = data[data['year'] == 2007]
    gdpByContinent = data2007.groupby('continent')['gdpPercap'].mean().reset_index()
  exercise:
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      import plotly.express as px
      import pandas as pd

      data = px.data.gapminder()
      data2007 = data[data['year'] == 2007]
      gdpByContinent = data2007.groupby('continent')['gdpPercap'].mean().reset_index()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 실습에서 \`data\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: summary
  title: 정리
  blocks:
  - type: text
    content: Plotly Express로 첫 시각화를 완성했습니다.
  - type: list
    items:
    - import plotly.express as px - Plotly Express 불러오기
    - px.data.gapminder() - 내장 데이터 로드
    - px.bar(df, x, y) - 막대 그래프 기본
    - color='컬럼' - 색상으로 그룹 구분
    - labels={} - 축 라벨 변경
    - title='' - 차트 제목 추가
  - type: text
    content: 다음 시간에는 팁 데이터로 히스토그램과 박스 플롯을 배웁니다.
  goal: 정리에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.
assessment:
  schemaVersion: 1
  performanceClaim: 웹에서는 외부 패키지 없이 분석 판단과 데이터 계약을 검증하고, 실제 패키지 API와 산출물은 lesson Run 및 Local 실습 증거로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: pending
  masteryVariants:
  - id: plotly_01-life-expectancy-comparison-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - summary
    title: 세계 기대수명 비교 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 국가별 비교가 같은 연도와 population context를 쓰는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_life_expectancy_comparison(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_life_expectancy_comparison(rows):
            raise NotImplementedError
      solution: |
        def prepare_life_expectancy_comparison(rows):
            required = ['lifeExpectancy', 'country', 'continent']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'continent'
            for row in usable:
                key = "all" if group_field is None else str(row[group_field])
                groups[key] = groups.get(key, 0) + 1
            x_values = [row['lifeExpectancy'] for row in usable]
            y_values = [row['country'] for row in usable]
            return {
                "usableCount": len(usable),
                "excludedCount": len(rows) - len(usable),
                "groupCounts": {key: groups[key] for key in sorted(groups)},
                "xExtent": None if not x_values else [min(x_values), max(x_values)],
                "yExtent": None if not y_values else [min(y_values), max(y_values)],
            }
      hints: *id001
    check:
      id: python.plotly.plotly_01.life-expectancy-comparison-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.plotly.plotly_01.life-expectancy-comparison-data-evidence.mastery.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: prepare_life_expectancy_comparison
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - lifeExpectancy: 82
              country: A
              continent: Asia
            - lifeExpectancy: 76
              country: B
              continent: Europe
            - lifeExpectancy: null
              country: C
              continent: Africa
          expectedReturn:
            usableCount: 2
            excludedCount: 1
            groupCounts:
              Asia: 1
              Europe: 1
            xExtent:
            - 76
            - 82
            yExtent:
            - A
            - B
        - id: handles-empty-data
          arguments:
          - value: []
          expectedReturn:
            usableCount: 0
            excludedCount: 0
            groupCounts: {}
            xExtent: null
            yExtent: null
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: plotly_01-life-expectancy-comparison-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - plotly_01-life-expectancy-comparison-data-evidence-mastery
    title: 세계 기대수명 비교 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 같은 분기의 국가별 서비스 가용성을 지역 색과 hover 표본 수로 비교한다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_life_expectancy_comparison(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_life_expectancy_comparison(candidate):
            raise NotImplementedError
      solution: |
        def audit_life_expectancy_comparison(candidate):
            expected = {'mark': 'interactive-dot', 'x': 'lifeExpectancy', 'y': 'country', 'group': 'continent', 'transforms': ['filter-year', 'sort-x'], 'interaction': 'hover'}
            errors = []
            for name in ["mark", "x", "y", "group", "transforms", "interaction"]:
                actual = sorted(candidate.get(name, [])) if name == "transforms" else candidate.get(name)
                if actual != expected[name]:
                    errors.append(name)
            if not str(candidate.get("description", "")).strip():
                errors.append("description")
            return {"valid": not errors, "errors": errors, "encoding": expected}
      hints: *id002
    check:
      id: python.plotly.plotly_01.life-expectancy-comparison-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.plotly.plotly_01.life-expectancy-comparison-encoding-transfer.transfer.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: audit_life_expectancy_comparison
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: interactive-dot
              x: lifeExpectancy
              y: country
              group: continent
              transforms:
              - filter-year
              - sort-x
              interaction: hover
              description: 같은 분기의 국가별 서비스 가용성을 지역 색과 hover 표본 수로 비교한다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: interactive-dot
              x: lifeExpectancy
              y: country
              group: continent
              transforms:
              - filter-year
              - sort-x
              interaction: hover
        - id: reports-misleading-encoding
          arguments:
          - value:
              mark: table
              x: country
              y: lifeExpectancy
              group: null
              transforms: []
              interaction: none
              description: ''
          expectedReturn:
            valid: false
            errors:
            - mark
            - x
            - y
            - group
            - transforms
            - interaction
            - description
            encoding:
              mark: interactive-dot
              x: lifeExpectancy
              y: country
              group: continent
              transforms:
              - filter-year
              - sort-x
              interaction: hover
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: plotly_01-life-expectancy-comparison-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - plotly_01-life-expectancy-comparison-encoding-transfer-transfer
    title: 세계 기대수명 비교 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 국가별 비교가 같은 연도와 population context를 쓰는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_life_expectancy_comparison(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_life_expectancy_comparison(situation):
            raise NotImplementedError
      solution: |
        def choose_life_expectancy_comparison(situation):
            table = {'one-year-ranking': {'encoding': 'sorted dots', 'evidence': 'fixed year', 'risk': 'mixed periods'}, 'country-trend': {'encoding': 'line', 'evidence': 'complete year domain', 'risk': 'survivorship'}, 'population-context': {'encoding': 'size or hover', 'evidence': 'population field', 'risk': 'area misread'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.plotly.plotly_01.life-expectancy-comparison-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.plotly.plotly_01.life-expectancy-comparison-interpretation-retrieval.retrieval.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: choose_life_expectancy_comparison
        cases:
        - id: recalls-one-year-ranking
          arguments:
          - value: one-year-ranking
          expectedReturn:
            encoding: sorted dots
            evidence: fixed year
            risk: mixed periods
        - id: recalls-country-trend
          arguments:
          - value: country-trend
          expectedReturn:
            encoding: line
            evidence: complete year domain
            risk: survivorship
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};