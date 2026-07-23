var e=`meta:\r
  packages:\r
  - altair\r
  - pandas\r
  id: altair_03\r
  title: 팁데이터분석\r
  order: 3\r
  category: altair\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - mark_bar\r
  - aggregate\r
  - mean\r
  - count\r
  - properties\r
  seo:\r
    title: Altair 막대 차트 - 팁 데이터 집계 분석\r
    description: Altair로 막대 차트를 만들고 집계 함수를 활용합니다. mark_bar, count, mean 등 집계 개념을 배웁니다.\r
    keywords:\r
    - altair bar\r
    - mark_bar\r
    - aggregate\r
    - count\r
    - mean\r
intro:\r
  emoji: 💵\r
  goal: 레스토랑 팁 데이터를 막대 차트로 시각화하고 집계 함수를 활용합니다.\r
  description: mark_bar()로 막대 차트를 만들고, count(), mean() 등 집계 함수로 데이터를 요약합니다.\r
  direction: 팁데이터분석에서 데이터와 인코딩 규칙을 분리해 재사용 가능한 차트를 구성합니다.\r
  benefits:\r
  - 정리된 테이블 확인 후 채널 인코딩에 맞는 코드 입력을 고릅니다.\r
  - 팁데이터분석 결과를 스케일과 마크 매핑 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 선언형 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(정리된 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 개수 세기 처리 실행\r
      detail: 채널 인코딩 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 평균 계산 결과 검증\r
      detail: 스케일과 마크 매핑 기준으로 실행 결과를 비교합니다.\r
    - label: 팁데이터분석 재사용\r
      detail: 완성 코드를 선언형 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 선언형 차트 환경\r
      detail: altair, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 팁데이터분석 실행\r
      detail: 셀을 실행해 스케일과 마크 매핑와 예외 상태를 확인합니다.\r
    - label: 팁데이터분석 완료\r
      detail: 검증된 코드를 선언형 대시보드로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: seaborn-data\r
  goal: 1단계. 데이터 불러오기에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: Codaro 로컬 데이터셋에서 tips 데이터를 불러옵니다. 레스토랑 결제와 팁 패턴을 담은 예제 데이터입니다. total_bill(총 금액), tip(팁),\r
    sex(성별), smoker(흡연여부), day(요일), time(시간대), size(인원수) 컬럼이 있습니다.\r
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
- id: step2_count_bar\r
  title: 2단계. 개수 세기\r
  structuredPrimary: true\r
  subtitle: count() 집계\r
  goal: 2단계. 개수 세기에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    막대 차트의 기본은 카테고리별 개수를 세는 것입니다. mark_bar()를 사용하면 막대 그래프를 그립니다. 요일(day)별로 데이터가 몇 건인지 막대 차트로 표현합니다. x축에 요일, y축에 개수를 배치합니다. y에 'count()'를 사용하면 자동으로 개수를 셉니다. count()는 집계 함수로, 데이터를 세어주는 역할을 합니다. 괄호 안이 비어있는 것은 "전체 개수를 세라"는 의미입니다.\r
\r
    집계 함수는 여러 데이터를 하나로 요약하는 함수입니다. count()는 개수를 세고, mean()은 평균을 구하고, sum()은 합계를 구합니다. 'count()'는 작은따옴표로 감싸야 합니다. 문자열(텍스트)로 전달해야 Altair가 이것을 집계 함수로 인식합니다.\r
  tips:\r
  - 집계 함수는 여러 데이터를 하나로 요약하는 함수입니다. count()는 개수를 세고, mean()은 평균을 구하고, sum()은 합계를 구합니다. 'count()'는 작은따옴표로\r
    감싸야 합니다. 문자열(텍스트)로 전달해야 Altair가 이것을 집계 함수로 인식합니다.\r
  snippet: |-\r
    chartCount = alt.Chart(tips).mark_bar().encode(\r
        x='day:N',\r
        y='count()'\r
    )\r
    chartCount\r
  exercise:\r
    prompt: 2단계. 개수 세기 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartCount = alt.Chart(tips).mark_bar().encode(\r
          x='day:N',\r
          y='count()'\r
      )\r
      chartCount\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 개수 세기의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 개수 세기의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step3_mean_bar\r
  title: 3단계. 평균 계산\r
  structuredPrimary: true\r
  subtitle: mean() 집계\r
  goal: 3단계. 평균 계산에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    count() 외에도 mean(), sum(), median() 등 다양한 집계 함수를 사용할 수 있습니다. 요일별 평균 팁을 계산해봅니다. y에 'mean(tip)'을 지정하면 tip 컬럼의 평균값을 구합니다. mean() 괄호 안에 컬럼명을 넣으면 그 컬럼의 평균을 계산합니다. 'mean(tip):Q'처럼 :Q를 붙여 수량형 데이터임을 명시합니다.\r
\r
    mean(tip)은 tip 컬럼의 평균을 계산합니다. sum(tip)은 합계, median(tip)은 중앙값, min(tip)/max(tip)은 최솟값/최댓값입니다.\r
  snippet: |-\r
    chartMean = alt.Chart(tips).mark_bar().encode(\r
        x='day:N',\r
        y='mean(tip):Q'\r
    )\r
    chartMean\r
  exercise:\r
    prompt: 3단계. 평균 계산 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartMean = alt.Chart(tips).mark_bar().encode(\r
          x='day:N',\r
          y='mean(tip):Q'\r
      )\r
      chartMean\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 평균 계산의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 평균 계산의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step4_color_group\r
  title: 4단계. 색상으로 그룹 분리\r
  structuredPrimary: true\r
  subtitle: color 인코딩\r
  goal: 4단계. 색상으로 그룹 분리에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    막대 차트에도 color 인코딩을 적용할 수 있습니다. 요일별 건수를 성별(sex)로 구분해봅니다. 같은 요일 안에서 남녀 비율을 확인할 수 있습니다.\r
\r
    color를 추가하면 스택(stacked) 막대 차트가 됩니다. 각 요일 막대 안에서 성별이 쌓여서 표시됩니다.\r
  snippet: |-\r
    chartGrouped = alt.Chart(tips).mark_bar().encode(\r
        x='day:N',\r
        y='count()',\r
        color='sex:N'\r
    )\r
    chartGrouped\r
  exercise:\r
    prompt: 4단계. 색상으로 그룹 분리 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartGrouped = alt.Chart(tips).mark_bar().encode(\r
          x='day:N',\r
          y='count()',\r
          color='sex:N'\r
      )\r
      chartGrouped\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 색상으로 그룹 분리의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 색상으로 그룹 분리의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_ordinal\r
  title: 5단계. 순서형 데이터\r
  structuredPrimary: true\r
  subtitle: :O 타입\r
  goal: 5단계. 순서형 데이터에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    요일에는 자연스러운 순서가 있습니다. Thur → Fri → Sat → Sun 순으로 정렬하면 더 직관적입니다. :O(Ordinal, 순서형) 타입을 사용하면 순서가 있는 카테고리를 표현할 수 있습니다. :N(명목형)과 달리 :O는 순서를 지정할 수 있습니다. 먼저 dayOrder라는 변수에 요일 순서를 리스트로 저장합니다. 그다음 alt.X() 함수에서 sort=dayOrder로 이 순서를 적용합니다.\r
\r
    같은 셀 안에서 변수를 여러 개 만들 수 있습니다. dayOrder = [...] 후 chartOrdered = alt.Chart(...)처럼 두 변수를 선언합니다. 하지만 마지막 줄에는 하나의 변수(chartOrdered)만 써야 그것이 출력됩니다. dayOrder를 쓰면 요일 리스트가, chartOrdered를 쓰면 차트가 출력됩니다.\r
  tips:\r
  - 같은 셀 안에서 변수를 여러 개 만들 수 있습니다. dayOrder = [...] 후 chartOrdered = alt.Chart(...)처럼 두 변수를 선언합니다. 하지만 마지막\r
    줄에는 하나의 변수(chartOrdered)만 써야 그것이 출력됩니다. dayOrder를 쓰면 요일 리스트가, chartOrdered를 쓰면 차트가 출력됩니다.\r
  snippet: |-\r
    dayOrder = ['Thur', 'Fri', 'Sat', 'Sun']\r
    chartOrdered = alt.Chart(tips).mark_bar().encode(\r
        x=alt.X('day:O', sort=dayOrder),\r
        y='count()',\r
        color='sex:N'\r
    )\r
    chartOrdered\r
  exercise:\r
    prompt: 5단계. 순서형 데이터 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      dayOrder = ['Thur', 'Fri', 'Sat', 'Sun']\r
      chartOrdered = alt.Chart(tips).mark_bar().encode(\r
          x=alt.X('day:O', sort=dayOrder),\r
          y='count()',\r
          color='sex:N'\r
      )\r
      chartOrdered\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 순서형 데이터의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 순서형 데이터의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_horizontal\r
  title: 6단계. 가로 막대 차트\r
  structuredPrimary: true\r
  subtitle: x와 y 교환\r
  goal: 6단계. 가로 막대 차트에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: x와 y를 바꾸면 가로 막대 차트가 됩니다. x축에 숫자(평균 금액)를, y축에 카테고리(요일)를 배치합니다. 카테고리 이름이 길거나 항목이 많을 때 가로\r
    막대가 읽기 쉽습니다. 여기서는 'mean(total_bill):Q'로 총 금액의 평균을 계산하고, time(시간대)으로 색상을 구분합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartHorizontal = alt.Chart(tips).mark_bar().encode(\r
        x='mean(total_bill):Q',\r
        y='day:O',\r
        color='time:N'\r
    )\r
    chartHorizontal\r
  exercise:\r
    prompt: 6단계. 가로 막대 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartHorizontal = alt.Chart(tips).mark_bar().encode(\r
          x='mean(total_bill):Q',\r
          y='day:O',\r
          color='time:N'\r
      )\r
      chartHorizontal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 가로 막대 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 가로 막대 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_properties\r
  title: 7단계. 차트 속성 설정\r
  structuredPrimary: true\r
  subtitle: properties()\r
  goal: 7단계. 차트 속성 설정에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: properties()로 차트 제목, 너비, 높이를 설정합니다. properties()는 차트 전체 속성을 조정하는 함수입니다. title 파라미터로 차트\r
    상단에 표시될 제목을 지정합니다. 문자열(작은따옴표로 감싼 텍스트)로 전달합니다. width는 차트 너비, height는 차트 높이를 픽셀 단위로 지정합니다. 숫자만 쓰면 됩니다(따옴표\r
    없이). 여기서는 alt.X()의 title 파라미터로 축 제목도 한글로 바꿨습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartStyled = alt.Chart(tips).mark_bar().encode(\r
        x=alt.X('day:O', sort=['Thur', 'Fri', 'Sat', 'Sun'], title='요일'),\r
        y=alt.Y('mean(tip):Q', title='평균 팁 ($)'),\r
        color='sex:N'\r
    ).properties(\r
        title='요일별 평균 팁 (성별 구분)',\r
        width=400,\r
        height=300\r
    )\r
    chartStyled\r
  exercise:\r
    prompt: 7단계. 차트 속성 설정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartStyled = alt.Chart(tips).mark_bar().encode(\r
          x=alt.X('day:O', sort=['Thur', 'Fri', 'Sat', 'Sun'], title='요일'),\r
          y=alt.Y('mean(tip):Q', title='평균 팁 ($)'),\r
          color='sex:N'\r
      ).properties(\r
          title='요일별 평균 팁 (성별 구분)',\r
          width=400,\r
          height=300\r
      )\r
      chartStyled\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 차트 속성 설정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 차트 속성 설정의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_final\r
  title: 8단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 팁 분석 대시보드\r
  goal: 8단계. 최종 결과물에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 내용을 종합해 팁 데이터 분석 차트를 완성합니다. 시간대(Lunch/Dinner)와 흡연 여부별 평균 금액을 비교합니다.\r
\r
    Dinner 시간대의 평균 금액이 Lunch보다 높습니다. 흡연자와 비흡연자 간 차이도 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartFinal = alt.Chart(tips).mark_bar().encode(\r
        x=alt.X('time:N', title='시간대'),\r
        y=alt.Y('mean(total_bill):Q', title='평균 금액 ($)'),\r
        color=alt.Color('smoker:N', title='흡연 여부'),\r
        tooltip=['time', 'smoker', 'mean(total_bill)', 'count()']\r
    ).properties(title='시간대별 평균 금액 (흡연 여부)', width=350, height=300)\r
    chartFinal\r
  exercise:\r
    prompt: 8단계. 최종 결과물 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartFinal = alt.Chart(tips).mark_bar().encode(\r
          x=alt.X('time:N', title='시간대'),\r
          y=alt.Y('mean(total_bill):Q', title='평균 금액 ($)'),\r
          color=alt.Color('smoker:N', title='흡연 여부'),\r
          tooltip=['time', 'smoker', 'mean(total_bill)', 'count()']\r
      ).properties(title='시간대별 평균 금액 (흡연 여부)', width=350, height=300)\r
      chartFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 최종 결과물의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 최종 결과물의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: workflow_validation\r
  title: 9단계. 실무 집계 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → spec 검증 → 오류 수정 → 기준 실험\r
  goal: 9단계. 실무 집계 검증 루프에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    업무용 차트는 막대가 그려졌다는 사실만으로 충분하지 않습니다. 원본 데이터 구조가 맞는지, 집계 결과가 예상한 방향인지, Altair spec에 집계 함수와 그룹 인코딩이 들어갔는지 확인해야 합니다. 이 단계에서는 Dinner의 평균 결제 금액이 Lunch보다 높을 것이라고 먼저 예측합니다. 그런 다음 pandas 집계와 Altair spec을 함께 검증해, 보고서에 넣을 수 있는 차트인지 확인합니다.\r
\r
    집계 차트는 원본 데이터 계약, 집계 방향, 차트 spec을 함께 검증해야 합니다. 이렇게 만들면 수업 예제가 보고서 자동화 코드로도 이어집니다.\r
  snippet: |-\r
    requiredColumns = {"total_bill", "tip", "sex", "smoker", "day", "time", "size"}\r
    missingColumns = requiredColumns - set(tips.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert tips.shape == (120, 7)\r
    assert set(tips["time"].unique()) == {"Lunch", "Dinner"}\r
\r
    timeSummary = tips.groupby("time")["total_bill"].agg(["mean", "count"]).round(2)\r
\r
    predictedHigherTime = "Dinner"\r
    actualHigherTime = timeSummary["mean"].idxmax()\r
\r
    assert actualHigherTime == predictedHigherTime\r
    assert timeSummary.loc["Dinner", "count"] > timeSummary.loc["Lunch", "count"]\r
\r
    timeSummary\r
  exercise:\r
    prompt: 9단계. 실무 집계 검증 루프 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      requiredColumns = {"total_bill", "tip", "sex", "smoker", "day", "time", "size"}\r
      missingColumns = requiredColumns - set(tips.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert tips.shape == (120, 7)\r
      assert set(tips["time"].unique()) == {"Lunch", "Dinner"}\r
\r
      timeSummary = tips.groupby("time")["total_bill"].agg(["mean", "count"]).round(2)\r
\r
      predictedHigherTime = "Dinner"\r
      actualHigherTime = timeSummary["mean"].idxmax()\r
\r
      assert actualHigherTime == predictedHigherTime\r
      assert timeSummary.loc["Dinner", "count"] > timeSummary.loc["Lunch", "count"]\r
\r
      timeSummary\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 실무 집계 검증 루프에서 \`requiredColumns\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 실무 집계 검증 루프에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 팁 데이터 막대 차트 프로젝트\r
  goal: 실습에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    이 프로젝트에서 배운 내용을 정리합니다. mark_bar()로 막대 차트를 그렸습니다. count()로 개수를, mean()으로 평균을 계산했습니다. 집계 함수는 여러 데이터를 하나의 값으로 요약합니다. :O(순서형) 타입과 sort로 카테고리 순서를 지정했습니다. properties()로 차트 제목과 크기를 설정했습니다. 각 미션에서 이 개념들을 활용해봅시다.\r
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
    content: Altair로 막대 차트와 집계 함수를 마스터했습니다!\r
  - type: list\r
    items:\r
    - mark_bar() - 막대 차트 마크\r
    - count() - 개수 세기 집계\r
    - mean(컬럼) - 평균 계산 집계\r
    - sum(컬럼), median(컬럼) - 합계, 중앙값\r
    - :O - 순서형(Ordinal) 데이터 타입\r
    - sort=[...] - 카테고리 정렬 순서 지정\r
    - properties(title, width, height) - 차트 속성 설정\r
  - type: text\r
    content: 다음 프로젝트에서는 펭귄 데이터로 영역 차트와 스택 시각화를 배웁니다.\r
  goal: 정리에서 정리된 테이블을 바꿨을 때 스케일과 마크 매핑가 어떻게 달라지는지 확인한다.\r
  why: 선언형 차트는 데이터 필드와 시각 표현의 관계를 명확하게 관리하게 해줍니다.\r
`;export{e as default};