var e=`meta:\r
  packages:\r
  - altair\r
  - pandas\r
  id: altair_10\r
  title: 종합대시보드\r
  order: 10\r
  category: altair\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - dashboard\r
  - interactive\r
  - concat\r
  - layer\r
  - transform\r
  seo:\r
    title: Altair 종합 대시보드 - 전체 기능 통합\r
    description: Altair로 완성된 인터랙티브 대시보드를 만듭니다. 모든 기능을 통합해 종합 분석 도구를 구현합니다.\r
    keywords:\r
    - altair dashboard\r
    - interactive\r
    - concat\r
    - layer\r
    - comprehensive\r
intro:\r
  emoji: 🎯\r
  goal: 지금까지 배운 모든 Altair 기능을 종합해 완성된 인터랙티브 대시보드를 만듭니다.\r
  description: 마크, 인코딩, 변환, 선택, 레이어, 연결을 모두 활용한 종합 프로젝트입니다.\r
  direction: 종합대시보드에서 데이터와 인코딩 규칙을 분리해 재사용 가능한 차트를 구성합니다.\r
  benefits:\r
  - 정리된 테이블 확인 후 채널 인코딩에 맞는 코드 입력을 고릅니다.\r
  - 종합대시보드 결과를 스케일과 마크 매핑 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 선언형 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(정리된 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 대시보드 구조 처리 실행\r
      detail: 채널 인코딩 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 메인 산점도 결과 검증\r
      detail: 스케일과 마크 매핑 기준으로 실행 결과를 비교합니다.\r
    - label: 종합대시보드 재사용\r
      detail: 완성 코드를 선언형 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 선언형 차트 환경\r
      detail: altair, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 종합대시보드 실행\r
      detail: 셀을 실행해 스케일과 마크 매핑와 예외 상태를 확인합니다.\r
    - label: 종합대시보드 완료\r
      detail: 검증된 코드를 선언형 대시보드로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: seaborn-data\r
  goal: 1단계. 데이터 불러오기에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 'Codaro 로컬 데이터셋에서 mpg 데이터를 불러옵니다. 이 프로젝트는 Altair 과정의 최종 종합 프로젝트입니다. 지금까지 배운 모든 개념을 하나로\r
    합칩니다: 마크(mark), 인코딩(encode), 인터랙션(selection), 차트 조합(|, &), 데이터 변환(transform), 레이어(layer) 등 모든 기능을\r
    사용합니다. 완성된 대시보드에는 여러 차트가 동시에 표시되고, 사용자가 드롭다운과 브러싱으로 데이터를 필터링하며, 모든 차트가 서로 연동됩니다.'\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import altair as alt\r
    import pandas as pd\r
    import warnings\r
    warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    mpg = loadLocalDataset("mpg")\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      import pandas as pd\r
      import warnings\r
      warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      mpg = loadLocalDataset("mpg")\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_overview\r
  title: 2단계. 대시보드 구조\r
  structuredPrimary: true\r
  subtitle: 컴포넌트 설계\r
  goal: 2단계. 대시보드 구조에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 대시보드 구조는 selection과 파라미터를 먼저 고정해야 뒤의 차트들이 같은 필터 상태를 공유할 수 있습니다.\r
  explanation: '대시보드를 만들기 전에 먼저 전체 구조를 설계합니다. 4개의 차트를 배치할 것입니다: 1. 산점도: 마력 vs 연비 (중심 차트, 가장 크게) 2. 막대\r
    차트: 생산국별 평균 연비 (비교용) 3. 라인 차트: 연도별 추이 (시간 흐름 보기) 4. 히스토그램: 연비 분포 (전체 분포 파악) 공통 selection을 먼저 만들어둡니다.\r
    brush는 드래그 선택, dropdown은 생산국 필터입니다. 이 두 가지를 모든 차트에서 공유하면 차트들이 연동됩니다.'\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    brush = alt.selection_interval(name='overviewBrush')\r
\r
    origins = ['usa', 'europe', 'japan']\r
    dropdown = alt.binding_select(options=[None] + origins, labels=['전체'] + origins, name='생산국: ')\r
    originSelect = alt.param(name='origin_filter', bind=dropdown)\r
  exercise:\r
    prompt: 2단계. 대시보드 구조 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      brush = alt.selection_interval(name='overviewBrush')\r
\r
      origins = ['usa', 'europe', 'japan']\r
      dropdown = alt.binding_select(options=[None] + origins, labels=['전체'] + origins, name='생산국: ')\r
      originSelect = alt.param(name='origin_filter', bind=dropdown)\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 대시보드 구조의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 2단계. 대시보드 구조 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step3_scatter\r
  title: 3단계. 메인 산점도\r
  structuredPrimary: true\r
  subtitle: 마력 vs 연비\r
  goal: 3단계. 메인 산점도에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 메인 산점도는 대시보드의 기준 뷰이므로 축, 색상, 브러시 조건이 다른 차트와 맞게 연결돼야 합니다.\r
  explanation: 메인 차트로 마력과 연비의 관계를 산점도로 표현합니다. 브러싱과 드롭다운 필터가 모두 적용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    scatterMain = alt.Chart(mpg).mark_circle(size=60).encode(\r
        x=alt.X('horsepower:Q', title='마력'),\r
        y=alt.Y('mpg:Q', title='연비 (MPG)'),\r
        color=alt.when(brush).then('origin:N').otherwise(alt.value('lightgray')),\r
        opacity=alt.when(\r
            (originSelect == None) | (alt.datum.origin == originSelect)\r
        ).then(alt.value(0.8)).otherwise(alt.value(0.1)),\r
        tooltip=['name', 'origin', 'horsepower', 'mpg', 'cylinders', 'model_year']\r
    ).add_params(brush, originSelect).properties(\r
        width=400,\r
        height=300,\r
        title='마력 vs 연비 (드래그로 선택)'\r
    )\r
    scatterMain\r
  exercise:\r
    prompt: 3단계. 메인 산점도 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      scatterMain = alt.Chart(mpg).mark_circle(size=60).encode(\r
          x=alt.X('horsepower:Q', title='마력'),\r
          y=alt.Y('mpg:Q', title='연비 (MPG)'),\r
          color=alt.when(brush).then('origin:N').otherwise(alt.value('lightgray')),\r
          opacity=alt.when(\r
              (originSelect == None) | (alt.datum.origin == originSelect)\r
          ).then(alt.value(0.8)).otherwise(alt.value(0.1)),\r
          tooltip=['name', 'origin', 'horsepower', 'mpg', 'cylinders', 'model_year']\r
      ).add_params(brush, originSelect).properties(\r
          width=400,\r
          height=300,\r
          title='마력 vs 연비 (드래그로 선택)'\r
      )\r
      scatterMain\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 메인 산점도의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 3단계. 메인 산점도 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step4_bar\r
  title: 4단계. 생산국별 막대 차트\r
  structuredPrimary: true\r
  subtitle: 평균 연비 비교\r
  goal: 4단계. 생산국별 막대 차트에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 생산국별 평균 연비를 막대 차트로 표현합니다. 산점도의 브러싱에 연동됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    barOrigin = alt.Chart(mpg).mark_bar().encode(\r
        x=alt.X('origin:N', title='생산국'),\r
        y=alt.Y('mean(mpg):Q', title='평균 연비'),\r
        color=alt.when(brush).then('origin:N').otherwise(alt.value('lightgray'))\r
    ).properties(\r
        width=150,\r
        height=200,\r
        title='생산국별 평균 연비'\r
    )\r
    barOrigin\r
  exercise:\r
    prompt: 4단계. 생산국별 막대 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      barOrigin = alt.Chart(mpg).mark_bar().encode(\r
          x=alt.X('origin:N', title='생산국'),\r
          y=alt.Y('mean(mpg):Q', title='평균 연비'),\r
          color=alt.when(brush).then('origin:N').otherwise(alt.value('lightgray'))\r
      ).properties(\r
          width=150,\r
          height=200,\r
          title='생산국별 평균 연비'\r
      )\r
      barOrigin\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 생산국별 막대 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 생산국별 막대 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_line\r
  title: 5단계. 연도별 라인 차트\r
  structuredPrimary: true\r
  subtitle: 연비 추이\r
  goal: 5단계. 연도별 라인 차트에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 시간 흐름 차트는 같은 데이터셋과 필터 상태를 공유해야 대시보드 안에서 다른 뷰와 해석이 어긋나지 않습니다.\r
  explanation: 연도별 평균 연비 추이를 라인 차트로 표현합니다. 시간에 따른 연비 개선 추세를 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    lineYear = alt.Chart(mpg).mark_line(point=True).encode(\r
        x=alt.X('model_year:O', title='연도'),\r
        y=alt.Y('mean(mpg):Q', title='평균 연비'),\r
        color='origin:N',\r
        opacity=alt.when(\r
            (originSelect == None) | (alt.datum.origin == originSelect)\r
        ).then(alt.value(1)).otherwise(alt.value(0.2))\r
    ).properties(\r
        width=350,\r
        height=200,\r
        title='연도별 평균 연비 추이'\r
    )\r
    lineYear\r
  exercise:\r
    prompt: 5단계. 연도별 라인 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      lineYear = alt.Chart(mpg).mark_line(point=True).encode(\r
          x=alt.X('model_year:O', title='연도'),\r
          y=alt.Y('mean(mpg):Q', title='평균 연비'),\r
          color='origin:N',\r
          opacity=alt.when(\r
              (originSelect == None) | (alt.datum.origin == originSelect)\r
          ).then(alt.value(1)).otherwise(alt.value(0.2))\r
      ).properties(\r
          width=350,\r
          height=200,\r
          title='연도별 평균 연비 추이'\r
      )\r
      lineYear\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 연도별 라인 차트의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 5단계. 연도별 라인 차트 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step6_histogram\r
  title: 6단계. 연비 히스토그램\r
  structuredPrimary: true\r
  subtitle: 분포 확인\r
  goal: 6단계. 연비 히스토그램에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 연비 분포를 히스토그램으로 표현합니다. 브러싱으로 선택된 데이터의 분포를 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    histMpg = alt.Chart(mpg).mark_bar().encode(\r
        x=alt.X('mpg:Q', bin=alt.Bin(maxbins=20), title='연비'),\r
        y=alt.Y('count()', title='개수'),\r
        color=alt.when(brush).then('origin:N').otherwise(alt.value('lightgray'))\r
    ).properties(\r
        width=200,\r
        height=150,\r
        title='연비 분포'\r
    )\r
    histMpg\r
  exercise:\r
    prompt: 6단계. 연비 히스토그램 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      histMpg = alt.Chart(mpg).mark_bar().encode(\r
          x=alt.X('mpg:Q', bin=alt.Bin(maxbins=20), title='연비'),\r
          y=alt.Y('count()', title='개수'),\r
          color=alt.when(brush).then('origin:N').otherwise(alt.value('lightgray'))\r
      ).properties(\r
          width=200,\r
          height=150,\r
          title='연비 분포'\r
      )\r
      histMpg\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 연비 히스토그램의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 연비 히스토그램의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_layer\r
  title: 7단계. 레이어 추가\r
  structuredPrimary: true\r
  subtitle: 평균선 표시\r
  goal: 7단계. 레이어 추가에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 차트에 추가 정보를 겹쳐서 표시하는 방법을 배웁니다. 레이어(layer)는 "층"이라는 뜻으로, 여러 차트를 겹쳐 그립니다. mark_rule()은 기준선(수평선\r
    또는 수직선)을 그리는 마크입니다. strokeDash=[5, 5]는 점선 스타일(5픽셀 그리고 5픽셀 비우기 반복)입니다. + 연산자로 두 차트를 겹칩니다. scatterMain\r
    + avgLine은 "산점도 위에 평균선을 겹쳐서 그려라"는 뜻입니다. 기준선이 있으면 데이터가 평균보다 높은지 낮은지 쉽게 비교할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    avgLine = alt.Chart(mpg).mark_rule(color='red', strokeDash=[5, 5]).encode(\r
        y='mean(mpg):Q'\r
    )\r
\r
    scatterWithLine = scatterMain + avgLine\r
    scatterWithLine\r
  exercise:\r
    prompt: 7단계. 레이어 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      avgLine = alt.Chart(mpg).mark_rule(color='red', strokeDash=[5, 5]).encode(\r
          y='mean(mpg):Q'\r
      )\r
\r
      scatterWithLine = scatterMain + avgLine\r
      scatterWithLine\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 레이어 추가의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 레이어 추가의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_compose\r
  title: 8단계. 대시보드 조합\r
  structuredPrimary: true\r
  subtitle: hconcat + vconcat\r
  goal: 8단계. 대시보드 조합에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 이제 만든 차트들을 모두 조합해서 최종 레이아웃을 만듭니다. | 와 & 연산자를 사용합니다. topRow는 윗줄입니다. scatterWithLine(산점도+평균선)을\r
    왼쪽에, barOrigin과 histMpg를 세로로 쌓아(&) 오른쪽에 배치합니다. 괄호 안을 먼저 계산하므로 막대와 히스토그램이 먼저 세로로 쌓이고, 그것이 산점도 옆에 붙습니다.\r
    bottomRow는 아랫줄로 lineYear(라인 차트)를 배치합니다. topRow & bottomRow로 윗줄과 아랫줄을 세로로 쌓으면 완성입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    topRow = scatterWithLine | (barOrigin & histMpg)\r
    bottomRow = lineYear\r
\r
    dashboard = topRow & bottomRow\r
    dashboard\r
  exercise:\r
    prompt: 8단계. 대시보드 조합 예제에서 \`topRow\`, \`bottomRow\`, \`dashboard\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      topRow = scatterWithLine | (barOrigin & histMpg)\r
      bottomRow = lineYear\r
\r
      dashboard = topRow & bottomRow\r
      dashboard\r
    hints:\r
    - 바꿀 지점은 \`topRow = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`topRow\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 대시보드 조합에서 \`topRow\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 대시보드 조합 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_final\r
  title: 9단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 완성된 대시보드\r
  goal: 9단계. 최종 결과물에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    모든 기능을 통합한 최종 대시보드를 완성합니다. 드롭다운, 브러싱, 레이어, 다중 차트가 모두 연동됩니다.\r
\r
    완성된 대시보드에서: - 드롭다운으로 생산국 필터링 - 산점도 드래그로 영역 선택 - 선택된 데이터가 모든 차트에 연동 - 빨간 점선은 전체 평균 연비 - 연도별 추이로 개선 트렌드 확인\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    brushFinal = alt.selection_interval(name='dashboardBrush')\r
    originsFinal = ['usa', 'europe', 'japan']\r
    dropdownFinal = alt.binding_select(options=[None] + originsFinal, labels=['전체'] + originsFinal, name='생산국: ')\r
    originFinal = alt.param(name='origin', bind=dropdownFinal)\r
  exercise:\r
    prompt: 9단계. 최종 결과물 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      brushFinal = alt.selection_interval(name='dashboardBrush')\r
      originsFinal = ['usa', 'europe', 'japan']\r
      dropdownFinal = alt.binding_select(options=[None] + originsFinal, labels=['전체'] + originsFinal, name='생산국: ')\r
      originFinal = alt.param(name='origin', bind=dropdownFinal)\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 최종 결과물의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 최종 결과물의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 대시보드 확장 프로젝트\r
  goal: 실습에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    이 프로젝트에서 배운 내용을 정리하면: selection_interval/binding_select로 인터랙션, when().then().otherwise()로 조건부 스타일, + 연산자로 레이어 겹치기, | 와 & 로 차트 배치, add_params()로 여러 파라미터 추가, 공통 selection을 공유해 차트 연동입니다. 이제 Altair의 모든 기능을 마스터했습니다. 배운 개념들을 자유롭게 조합해 나만의 대시보드를 만들어봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import altair as alt\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
    car = loadLocalDataset("mpg")\r
    drag = alt.selection_interval(name='missionDrag')\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
      car = loadLocalDataset("mpg")\r
      drag = alt.selection_interval(name='missionDrag')\r
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
    content: Altair 전체 과정을 마스터했습니다!\r
  - type: list\r
    items:\r
    - '마크: mark_point, mark_bar, mark_line, mark_area, mark_rect, mark_circle, mark_rule, mark_text'\r
    - '인코딩: x, y, color, size, shape, opacity, tooltip, row, column'\r
    - '데이터 타입: :Q(수량형), :N(명목형), :O(순서형), :T(시계열)'\r
    - '변환: transform_calculate, transform_aggregate, transform_window, transform_fold, transform_filter'\r
    - '선택: selection_interval, selection_point, when().then().otherwise()'\r
    - '바인딩: binding_range, binding_select'\r
    - '조합: layer(+), hconcat(|), vconcat(&), repeat, facet'\r
  - type: text\r
    content: |-\r
      이제 Altair로 다양한 데이터 시각화와 인터랙티브 대시보드를 만들 수 있습니다.\r
\r
      실제 프로젝트에서 이 기술들을 활용해보세요!\r
  goal: 정리에서 정리된 테이블을 바꿨을 때 스케일과 마크 매핑가 어떻게 달라지는지 확인한다.\r
  why: 선언형 차트는 데이터 필드와 시각 표현의 관계를 명확하게 관리하게 해줍니다.\r
- id: workflow_validation\r
  title: 10단계. Altair 대시보드 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 10단계. Altair 대시보드 검증 루프에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    대시보드는 여러 차트를 묶는 만큼 입력 데이터, selection, concat 구조가 모두 맞아야 합니다. 완성 spec을 검사하는 루프를 추가합니다.\r
\r
    Altair 대시보드의 품질은 concat과 selection이 spec으로 검증될 때 올라갑니다.\r
  snippet: |-\r
    import altair as alt\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    mpgDashboard = loadLocalDataset("mpg")\r
    requiredColumns = {"mpg", "horsepower", "weight", "origin", "model_year"}\r
    missingColumns = requiredColumns - set(mpgDashboard.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert mpgDashboard[["mpg", "horsepower", "weight"]].gt(0).all().all()\r
    assert mpgDashboard["origin"].nunique() == 3\r
  exercise:\r
    prompt: 10단계. Altair 대시보드 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      mpgDashboard = loadLocalDataset("mpg")\r
      requiredColumns = {"mpg", "horsepower", "weight", "origin", "model_year"}\r
      missingColumns = requiredColumns - set(mpgDashboard.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert mpgDashboard[["mpg", "horsepower", "weight"]].gt(0).all().all()\r
      assert mpgDashboard["origin"].nunique() == 3\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. Altair 대시보드 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. Altair 대시보드 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};