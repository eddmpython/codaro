var e=`meta:\r
  packages:\r
  - altair\r
  - pandas\r
  id: altair_09\r
  title: 고급데이터변환\r
  order: 9\r
  category: altair\r
  difficulty: ⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - transform_calculate\r
  - transform_aggregate\r
  - transform_window\r
  - transform_fold\r
  seo:\r
    title: Altair 데이터 변환 - calculate, aggregate, window\r
    description: Altair로 데이터를 변환합니다. calculate, aggregate, window, fold로 고급 분석을 배웁니다.\r
    keywords:\r
    - altair transform\r
    - calculate\r
    - aggregate\r
    - window\r
    - fold\r
intro:\r
  emoji: 🔄\r
  goal: 팁 데이터를 다양한 방식으로 변환하고 집계하여 고급 분석 차트를 만듭니다.\r
  description: transform_calculate, transform_aggregate, transform_window, transform_fold로 데이터를 가공합니다.\r
  direction: 고급데이터변환에서 데이터와 인코딩 규칙을 분리해 재사용 가능한 차트를 구성합니다.\r
  benefits:\r
  - 정리된 테이블 확인 후 채널 인코딩에 맞는 코드 입력을 고릅니다.\r
  - 고급데이터변환 결과를 스케일과 마크 매핑 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 선언형 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(정리된 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 계산 필드 생성 처리 실행\r
      detail: 채널 인코딩 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 조건부 계산 결과 검증\r
      detail: 스케일과 마크 매핑 기준으로 실행 결과를 비교합니다.\r
    - label: 고급데이터변환 재사용\r
      detail: 완성 코드를 선언형 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 선언형 차트 환경\r
      detail: altair, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 고급데이터변환 실행\r
      detail: 셀을 실행해 스케일과 마크 매핑와 예외 상태를 확인합니다.\r
    - label: 고급데이터변환 완료\r
      detail: 검증된 코드를 선언형 대시보드로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: seaborn-data\r
  goal: 1단계. 데이터 불러오기에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: Codaro 로컬 데이터셋에서 tips(팁) 데이터를 불러옵니다. 레스토랑에서 고객들이 낸 팁을 기록한 데이터입니다. total_bill은 총 계산 금액,\r
    tip은 팁 금액, sex는 성별, smoker는 흡연 여부, day는 요일, time은 시간대(Lunch/Dinner), size는 일행 수입니다. 이 프로젝트에서는 데이터를\r
    차트에 표시하기 전에 먼저 가공하는 방법을 배웁니다. 새로운 값을 계산하거나, 그룹별로 집계하거나, 순위를 매기는 등의 변환 작업을 수행합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import altair as alt\r
    import pandas as pd\r
    import warnings\r
    warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    tips = loadLocalDataset("tips")\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      import pandas as pd\r
      import warnings\r
      warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      tips = loadLocalDataset("tips")\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_calculate\r
  title: 2단계. 계산 필드 생성\r
  structuredPrimary: true\r
  subtitle: transform_calculate\r
  goal: 2단계. 계산 필드 생성에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    데이터에 없는 새로운 값을 계산해서 추가할 수 있습니다. transform_calculate()는 "계산해서 변환하라"는 명령입니다. 팁 비율(tip_pct)을 계산합니다. tip_pct = 'datum.tip / datum.total_bill * 100'은 "팁을 총 금액으로 나누고 100을 곱하라(퍼센트로 만들기)"는 의미입니다. datum.컬럼명으로 각 행의 값에 접근합니다. 계산식은 JavaScript 문법으로 작성하며, 따옴표 안에 넣습니다. 계산된 tip_pct 필드를 마치 원래 있던 컬럼처럼 encode()에서 사용할 수 있습니다.\r
\r
    transform_calculate()는 메서드 체이닝으로 연결됩니다. alt.Chart().mark_point().encode().transform_calculate() 순서로 이어집니다. 계산식 안에서 사용하는 연산자: / 는 나누기, * 는 곱하기, + 는 더하기, - 는 빼기입니다. JavaScript 문법이지만 일반적인 수학 기호와 같습니다.\r
  tips:\r
  - 'transform_calculate()는 메서드 체이닝으로 연결됩니다. alt.Chart().mark_point().encode().transform_calculate() 순서로\r
    이어집니다. 계산식 안에서 사용하는 연산자: / 는 나누기, * 는 곱하기, + 는 더하기, - 는 빼기입니다. JavaScript 문법이지만 일반적인 수학 기호와 같습니다.'\r
  snippet: |-\r
    chartCalc = alt.Chart(tips).mark_point().encode(\r
        x='total_bill:Q',\r
        y='tip_pct:Q',\r
        color='day:N'\r
    ).transform_calculate(\r
        tip_pct='datum.tip / datum.total_bill * 100'\r
    ).properties(\r
        width=400,\r
        height=300,\r
        title='금액 대비 팁 비율'\r
    )\r
    chartCalc\r
  exercise:\r
    prompt: 2단계. 계산 필드 생성 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartCalc = alt.Chart(tips).mark_point().encode(\r
          x='total_bill:Q',\r
          y='tip_pct:Q',\r
          color='day:N'\r
      ).transform_calculate(\r
          tip_pct='datum.tip / datum.total_bill * 100'\r
      ).properties(\r
          width=400,\r
          height=300,\r
          title='금액 대비 팁 비율'\r
      )\r
      chartCalc\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 계산 필드 생성의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 계산 필드 생성의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step3_calculate_condition\r
  title: 3단계. 조건부 계산\r
  structuredPrimary: true\r
  subtitle: 삼항 연산자\r
  goal: 3단계. 조건부 계산에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 3단계. 조건부 계산의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartCondCalc = alt.Chart(tips).mark_bar().encode(\r
        x='tip_category:N',\r
        y='count()',\r
        color='tip_category:N'\r
    ).transform_calculate(\r
        tip_pct='datum.tip / datum.total_bill * 100',\r
        tip_category='datum.tip / datum.total_bill >= 0.15 ? "관대함" : "보통"'\r
    ).properties(\r
        title='팁 비율 카테고리별 분포'\r
    )\r
    chartCondCalc\r
  exercise:\r
    prompt: 3단계. 조건부 계산 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartCondCalc = alt.Chart(tips).mark_bar().encode(\r
          x='tip_category:N',\r
          y='count()',\r
          color='tip_category:N'\r
      ).transform_calculate(\r
          tip_pct='datum.tip / datum.total_bill * 100',\r
          tip_category='datum.tip / datum.total_bill >= 0.15 ? "관대함" : "보통"'\r
      ).properties(\r
          title='팁 비율 카테고리별 분포'\r
      )\r
      chartCondCalc\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 조건부 계산의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 조건부 계산의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step4_aggregate\r
  title: 4단계. 그룹별 집계\r
  structuredPrimary: true\r
  subtitle: transform_aggregate\r
  goal: 4단계. 그룹별 집계에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    이번에는 데이터를 그룹으로 묶어서 요약하는 방법을 배웁니다. transform_aggregate()는 "집계해서 변환하라"는 명령입니다. aggregate는 "모으다, 합치다"라는 뜻입니다. 여러 행을 하나로 모아서 평균, 합계, 개수 등을 계산합니다. avg_tip='mean(tip)'은 "tip 컬럼의 평균(mean)을 계산해서 avg_tip이라는 이름으로 저장하라"는 뜻입니다. groupby=['day']는 "day(요일)별로 그룹을 나눠서 계산하라"는 의미입니다. 월요일 그룹, 화요일 그룹 등 각각의 평균을 구합니다.\r
\r
    사용 가능한 집계 함수: mean(평균), sum(합계), count(개수), median(중앙값), min(최솟값), max(최댓값), stdev(표준편차) 등이 있습니다. groupby에는 여러 컬럼을 넣을 수 있습니다. groupby=['day', 'time']은 "요일과 시간대 조합별로 그룹을 나눠라"는 뜻입니다. 예: 월요일 점심, 월요일 저녁, 화요일 점심...\r
  tips:\r
  - '사용 가능한 집계 함수: mean(평균), sum(합계), count(개수), median(중앙값), min(최솟값), max(최댓값), stdev(표준편차) 등이 있습니다.\r
    groupby에는 여러 컬럼을 넣을 수 있습니다. groupby=[''day'', ''time'']은 "요일과 시간대 조합별로 그룹을 나눠라"는 뜻입니다. 예: 월요일 점심,\r
    월요일 저녁, 화요일 점심...'\r
  snippet: |-\r
    chartAgg = alt.Chart(tips).mark_bar().encode(\r
        x='day:N',\r
        y='avg_tip:Q',\r
        color='day:N'\r
    ).transform_aggregate(\r
        avg_tip='mean(tip)',\r
        avg_bill='mean(total_bill)',\r
        groupby=['day']\r
    ).properties(\r
        title='요일별 평균 팁'\r
    )\r
    chartAgg\r
  exercise:\r
    prompt: 4단계. 그룹별 집계 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartAgg = alt.Chart(tips).mark_bar().encode(\r
          x='day:N',\r
          y='avg_tip:Q',\r
          color='day:N'\r
      ).transform_aggregate(\r
          avg_tip='mean(tip)',\r
          avg_bill='mean(total_bill)',\r
          groupby=['day']\r
      ).properties(\r
          title='요일별 평균 팁'\r
      )\r
      chartAgg\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 그룹별 집계의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 그룹별 집계의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_multi_aggregate\r
  title: 5단계. 다중 그룹 집계\r
  structuredPrimary: true\r
  subtitle: 여러 기준으로 집계\r
  goal: 5단계. 다중 그룹 집계에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 여러 컬럼으로 그룹화할 수 있습니다. 요일과 시간대별 평균 금액을 계산합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartMultiAgg = alt.Chart(tips).mark_rect().encode(\r
        x='day:O',\r
        y='time:N',\r
        color='avg_bill:Q'\r
    ).transform_aggregate(\r
        avg_bill='mean(total_bill)',\r
        groupby=['day', 'time']\r
    ).properties(\r
        width=300,\r
        height=150,\r
        title='요일-시간대별 평균 금액'\r
    )\r
    chartMultiAgg\r
  exercise:\r
    prompt: 5단계. 다중 그룹 집계 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartMultiAgg = alt.Chart(tips).mark_rect().encode(\r
          x='day:O',\r
          y='time:N',\r
          color='avg_bill:Q'\r
      ).transform_aggregate(\r
          avg_bill='mean(total_bill)',\r
          groupby=['day', 'time']\r
      ).properties(\r
          width=300,\r
          height=150,\r
          title='요일-시간대별 평균 금액'\r
      )\r
      chartMultiAgg\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 다중 그룹 집계의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 다중 그룹 집계의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_window\r
  title: 6단계. 윈도우 함수\r
  structuredPrimary: true\r
  subtitle: transform_window\r
  goal: 6단계. 윈도우 함수에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    윈도우 함수는 각 행마다 주변 행들을 "창문(window)"처럼 보면서 계산하는 기능입니다. 순위, 누적합, 이동평균 등을 구할 때 사용합니다. transform_window()는 "윈도우 함수로 변환하라"는 명령입니다. rank='rank()'는 "순위를 매겨서 rank라는 필드에 저장하라"는 뜻입니다. sort=[alt.SortField('tip', order='descending')]은 "tip을 내림차순(descending, 큰 것부터)으로 정렬해서 순위를 매기라"는 의미입니다. groupby=['day']는 "각 요일 안에서 따로 순위를 매기라"입니다. transform_filter()로 상위 5개만 남깁니다.\r
\r
    윈도우 함수 종류: rank()는 순위(동점일 때 다음 순위 건너뜀), row_number()는 행 번호(무조건 1, 2, 3...), dense_rank()는 빽빽한 순위(동점 다음이 바로 이어짐)입니다. transform_filter(alt.datum.rank <= 5)는 "rank 값이 5 이하인 행만 남기라"는 뜻입니다. 각 그룹의 상위 5개씩만 차트에 표시됩니다.\r
  tips:\r
  - '윈도우 함수 종류: rank()는 순위(동점일 때 다음 순위 건너뜀), row_number()는 행 번호(무조건 1, 2, 3...), dense_rank()는 빽빽한 순위(동점\r
    다음이 바로 이어짐)입니다. transform_filter(alt.datum.rank <= 5)는 "rank 값이 5 이하인 행만 남기라"는 뜻입니다. 각 그룹의 상위 5개씩만\r
    차트에 표시됩니다.'\r
  snippet: |-\r
    chartWindow = alt.Chart(tips).mark_point().encode(\r
        x='rank:O',\r
        y='tip:Q',\r
        color='day:N'\r
    ).transform_window(\r
        rank='rank()',\r
        sort=[alt.SortField('tip', order='descending')],\r
        groupby=['day']\r
    ).transform_filter(\r
        alt.datum.rank <= 5\r
    ).properties(\r
        title='요일별 팁 Top 5'\r
    )\r
    chartWindow\r
  exercise:\r
    prompt: 6단계. 윈도우 함수 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartWindow = alt.Chart(tips).mark_point().encode(\r
          x='rank:O',\r
          y='tip:Q',\r
          color='day:N'\r
      ).transform_window(\r
          rank='rank()',\r
          sort=[alt.SortField('tip', order='descending')],\r
          groupby=['day']\r
      ).transform_filter(\r
          alt.datum.rank <= 5\r
      ).properties(\r
          title='요일별 팁 Top 5'\r
      )\r
      chartWindow\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 윈도우 함수의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 윈도우 함수의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_cumulative\r
  title: 7단계. 누적 계산\r
  structuredPrimary: true\r
  subtitle: 누적합/누적평균\r
  goal: 7단계. 누적 계산에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 윈도우 함수로 누적합이나 이동 평균을 계산할 수 있습니다. 금액순 누적 팁을 계산합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartCumulative = alt.Chart(tips).mark_line().encode(\r
        x='row_num:Q',\r
        y='cumulative_tip:Q'\r
    ).transform_window(\r
        row_num='row_number()',\r
        cumulative_tip='sum(tip)',\r
        sort=[alt.SortField('total_bill', order='ascending')]\r
    ).properties(\r
        width=400,\r
        height=250,\r
        title='금액순 누적 팁'\r
    )\r
    chartCumulative\r
  exercise:\r
    prompt: 7단계. 누적 계산 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartCumulative = alt.Chart(tips).mark_line().encode(\r
          x='row_num:Q',\r
          y='cumulative_tip:Q'\r
      ).transform_window(\r
          row_num='row_number()',\r
          cumulative_tip='sum(tip)',\r
          sort=[alt.SortField('total_bill', order='ascending')]\r
      ).properties(\r
          width=400,\r
          height=250,\r
          title='금액순 누적 팁'\r
      )\r
      chartCumulative\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 누적 계산의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 누적 계산의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_fold\r
  title: 8단계. 데이터 피벗\r
  structuredPrimary: true\r
  subtitle: transform_fold\r
  goal: 8단계. 데이터 피벗에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    데이터 구조를 변경하는 방법을 배웁니다. fold는 "접다"라는 뜻으로, 여러 컬럼을 하나의 긴 형태로 변환합니다. transform_fold(['total_bill', 'tip'], as_=['key', 'value'])는 "total_bill과 tip 두 컬럼을 key와 value 두 컬럼으로 변환하라"는 뜻입니다. 원래 데이터가 total_bill=10, tip=2 형태였다면, 변환 후에는 (key='total_bill', value=10), (key='tip', value=2) 두 행으로 나뉩니다. 이렇게 하면 두 컬럼을 하나의 차트에 나란히 비교할 수 있습니다. xOffset='key:N'으로 막대를 옆으로 배치합니다.\r
\r
    wide(넓은) 형식은 컬럼이 많고 행이 적은 형태입니다. long(긴) 형식은 컬럼이 적고 행이 많은 형태입니다. fold는 wide를 long으로 바꿉니다. as_=['key', 'value']는 "새로 만들 컬럼 이름을 key와 value로 하라"는 뜻입니다. 원하는 이름으로 바꿀 수 있습니다(예: as_=['항목', '값']).\r
  tips:\r
  - 'wide(넓은) 형식은 컬럼이 많고 행이 적은 형태입니다. long(긴) 형식은 컬럼이 적고 행이 많은 형태입니다. fold는 wide를 long으로 바꿉니다. as_=[''key'',\r
    ''value'']는 "새로 만들 컬럼 이름을 key와 value로 하라"는 뜻입니다. 원하는 이름으로 바꿀 수 있습니다(예: as_=[''항목'', ''값'']).'\r
  snippet: |-\r
    chartFold = alt.Chart(tips).mark_bar().encode(\r
        x='day:N',\r
        y='mean(value):Q',\r
        color='key:N',\r
        xOffset='key:N'\r
    ).transform_fold(\r
        ['total_bill', 'tip'],\r
        as_=['key', 'value']\r
    ).properties(\r
        width=350,\r
        height=250,\r
        title='요일별 금액 vs 팁 비교'\r
    )\r
    chartFold\r
  exercise:\r
    prompt: 8단계. 데이터 피벗 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartFold = alt.Chart(tips).mark_bar().encode(\r
          x='day:N',\r
          y='mean(value):Q',\r
          color='key:N',\r
          xOffset='key:N'\r
      ).transform_fold(\r
          ['total_bill', 'tip'],\r
          as_=['key', 'value']\r
      ).properties(\r
          width=350,\r
          height=250,\r
          title='요일별 금액 vs 팁 비교'\r
      )\r
      chartFold\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 데이터 피벗의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 데이터 피벗의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_final\r
  title: 9단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 복합 변환 차트\r
  goal: 9단계. 최종 결과물에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 변환 기법을 종합해 분석 차트를 완성합니다. 팁 비율을 계산하고, 그룹별로 집계한 뒤 시각화합니다.\r
\r
    calculate로 팁 비율을 계산하고, aggregate로 요일-시간대별 평균을 집계했습니다. Dinner 시간대의 팁 비율이 Lunch보다 약간 높습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartFinal = alt.Chart(tips).mark_bar().encode(\r
        x=alt.X('day:O', sort=['Thur', 'Fri', 'Sat', 'Sun'], title='요일'),\r
        y=alt.Y('avg_tip_pct:Q', title='평균 팁 비율 (%)'),\r
        color=alt.Color('time:N', title='시간대'),\r
        xOffset='time:N',\r
        tooltip=[\r
            alt.Tooltip('day:O', title='요일'),\r
            alt.Tooltip('time:N', title='시간대'),\r
            alt.Tooltip('avg_tip_pct:Q', title='평균 팁 비율', format='.1f'),\r
            alt.Tooltip('count:Q', title='건수')\r
        ]\r
    ).transform_calculate(\r
        tip_pct='datum.tip / datum.total_bill * 100'\r
    ).transform_aggregate(\r
        avg_tip_pct='mean(tip_pct)',\r
        count='count()',\r
        groupby=['day', 'time']\r
    ).properties(\r
        width=400,\r
        height=300,\r
        title='요일-시간대별 평균 팁 비율'\r
    )\r
    chartFinal\r
  exercise:\r
    prompt: 9단계. 최종 결과물 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartFinal = alt.Chart(tips).mark_bar().encode(\r
          x=alt.X('day:O', sort=['Thur', 'Fri', 'Sat', 'Sun'], title='요일'),\r
          y=alt.Y('avg_tip_pct:Q', title='평균 팁 비율 (%)'),\r
          color=alt.Color('time:N', title='시간대'),\r
          xOffset='time:N',\r
          tooltip=[\r
              alt.Tooltip('day:O', title='요일'),\r
              alt.Tooltip('time:N', title='시간대'),\r
              alt.Tooltip('avg_tip_pct:Q', title='평균 팁 비율', format='.1f'),\r
              alt.Tooltip('count:Q', title='건수')\r
          ]\r
      ).transform_calculate(\r
          tip_pct='datum.tip / datum.total_bill * 100'\r
      ).transform_aggregate(\r
          avg_tip_pct='mean(tip_pct)',\r
          count='count()',\r
          groupby=['day', 'time']\r
      ).properties(\r
          width=400,\r
          height=300,\r
          title='요일-시간대별 평균 팁 비율'\r
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
  subtitle: 데이터 변환 프로젝트\r
  goal: 실습에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    이 프로젝트에서 배운 내용을 정리하면: transform_calculate()로 새 필드 계산, 삼항 연산자(?:)로 조건부 값 지정, transform_aggregate()로 그룹별 집계, groupby로 그룹 기준 지정, transform_window()로 순위와 누적 계산, transform_fold()로 wide를 long으로 변환입니다. 이제 배운 변환 기법들을 조합해 데이터를 다양하게 분석해봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import altair as alt\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
    bill = loadLocalDataset("tips")\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
      bill = loadLocalDataset("tips")\r
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
    content: Altair로 고급 데이터 변환을 마스터했습니다!\r
  - type: list\r
    items:\r
    - transform_calculate(필드='표현식') - 새 계산 필드 생성\r
    - datum.컬럼명 - 각 행의 값 접근\r
    - transform_aggregate(집계필드, groupby) - 그룹별 집계\r
    - transform_window(함수, sort, groupby) - 윈도우 함수\r
    - rank(), row_number(), sum() - 윈도우 함수 종류\r
    - transform_fold([컬럼], as_) - wide to long 변환\r
  - type: text\r
    content: 다음 프로젝트에서는 모든 기법을 종합한 대시보드를 만듭니다.\r
  goal: 정리에서 정리된 테이블을 바꿨을 때 스케일과 마크 매핑가 어떻게 달라지는지 확인한다.\r
  why: 선언형 차트는 데이터 필드와 시각 표현의 관계를 명확하게 관리하게 해줍니다.\r
- id: workflow_validation\r
  title: 10단계. 데이터 변환 spec 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 10단계. 데이터 변환 spec 검증 루프에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    Altair transform은 pandas 전처리와 Vega-Lite 사양의 경계입니다. calculate, aggregate, window가 spec에 정확히 들어갔는지 확인합니다.\r
\r
    Transform 레슨은 차트가 보이는지보다 transform 사양이 의도대로 남았는지 검증해야 업무 자동화에 쓸 수 있습니다.\r
  snippet: |-\r
    import altair as alt\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    tipsTransform = loadLocalDataset("tips")\r
    requiredColumns = {"total_bill", "tip", "time", "day"}\r
    missingColumns = requiredColumns - set(tipsTransform.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert tipsTransform["total_bill"].gt(0).all()\r
    assert (tipsTransform["tip"] / tipsTransform["total_bill"]).between(0, 1).all()\r
  exercise:\r
    prompt: 10단계. 데이터 변환 spec 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      tipsTransform = loadLocalDataset("tips")\r
      requiredColumns = {"total_bill", "tip", "time", "day"}\r
      missingColumns = requiredColumns - set(tipsTransform.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert tipsTransform["total_bill"].gt(0).all()\r
      assert (tipsTransform["tip"] / tipsTransform["total_bill"]).between(0, 1).all()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 데이터 변환 spec 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. 데이터 변환 spec 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};