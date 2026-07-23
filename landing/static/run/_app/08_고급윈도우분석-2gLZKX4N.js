var e=`meta:\r
  packages:\r
  - duckdb\r
  - pandas\r
  id: duckdb_08\r
  title: 고급윈도우분석\r
  order: 8\r
  category: duckdb\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  dataSource: codaro-local:titanic\r
  tags:\r
  - window\r
  - LAG\r
  - LEAD\r
  - 이동평균\r
  - QUALIFY\r
  - titanic\r
  seo:\r
    title: DuckDB 고급 윈도우 함수 - LAG, LEAD, 이동평균, QUALIFY\r
    description: 타이타닉 데이터로 LAG/LEAD 함수, 이동 평균, QUALIFY 절을 마스터합니다. 이전/다음 행 비교, 이동 통계, 윈도우 필터링까지 실습합니다.\r
    keywords:\r
    - DuckDB LAG\r
    - LEAD\r
    - 이동평균\r
    - QUALIFY\r
    - 윈도우 함수 고급\r
intro:\r
  emoji: 📊\r
  goal: 타이타닉 데이터로 LAG/LEAD, 이동 평균, QUALIFY를 마스터합니다.\r
  description: 고급 윈도우 함수로 이전/다음 행 비교, 이동 평균 계산, 윈도우 결과 필터링을 배웁니다. LAG/LEAD는 시계열 분석의 핵심이며, QUALIFY는 DuckDB의\r
    강력한 확장 기능입니다.\r
  direction: 고급윈도우분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.\r
  - 고급윈도우분석 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 준비 입력 확인\r
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. LAG 이전 값 가져 처리 실행\r
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. LEAD 다음 값 가 결과 검증\r
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.\r
    - label: 고급윈도우분석 재사용\r
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: SQL 분석 환경\r
      detail: duckdb, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 고급윈도우분석 실행\r
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.\r
    - label: 고급윈도우분석 완료\r
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 준비\r
  structuredPrimary: true\r
  subtitle: titanic 데이터 로드\r
  goal: 1단계. 데이터 준비에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 타이타닉 승객 데이터를 불러옵니다. 이번 프로젝트에서는 LAG/LEAD로 행 간 비교, 이동 평균으로 추세 분석, QUALIFY로 윈도우 필터링을 배웁니다.\r
    180명의 로컬 승객 샘플로 나이, 요금 등의 패턴을 분석합니다. 고급 윈도우 함수는 시계열 데이터 분석, 추세 예측, 이상치 탐지 등 실무에서 필수적인 기능입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import duckdb\r
\r
    dfTitanic = loadLocalDataset("titanic")\r
    titanic = duckdb.from_df(dfTitanic)\r
  exercise:\r
    prompt: 1단계. 데이터 준비 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import duckdb\r
\r
      dfTitanic = loadLocalDataset("titanic")\r
      titanic = duckdb.from_df(dfTitanic)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 데이터 준비의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 1단계. 데이터 준비 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step2_lag_intro\r
  title: 2단계. LAG - 이전 값 가져오기\r
  structuredPrimary: true\r
  subtitle: 행 간 비교의 시작\r
  goal: 2단계. LAG 이전 값 가져오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    LAG(column, n)은 현재 행에서 n행 이전의 값을 가져오는 함수입니다. n=1이면 바로 직전 행, n=2이면 2행 전 값을 반환합니다. 현재 값과 이전 값을 비교하여 증감, 차이, 변화율 등을 계산할 수 있습니다. 예를 들어 매출이 전월 대비 얼마나 증가했는지, 주가가 전일 대비 얼마나 변동했는지 분석할 때 LAG가 필수적입니다. 시계열 데이터의 추세 분석, 변화 탐지에 핵심 기능입니다.\r
\r
    LAG(col, 1)은 직전 행, LAG(col, 2)는 2행 전 값을 가져옵니다. PARTITION BY를 사용하면 그룹별로 독립적으로 이전 값을 찾습니다. 첫 번째 행은 이전 값이 없으므로 NULL이 반환됩니다. NULL 대신 기본값을 지정하려면 LAG(col, 1, 0) 형태로 세 번째 인자를 추가합니다.\r
  tips:\r
  - LAG(col, 1)은 직전 행, LAG(col, 2)는 2행 전 값을 가져옵니다. PARTITION BY를 사용하면 그룹별로 독립적으로 이전 값을 찾습니다. 첫 번째 행은 이전\r
    값이 없으므로 NULL이 반환됩니다. NULL 대신 기본값을 지정하려면 LAG(col, 1, 0) 형태로 세 번째 인자를 추가합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            age,\r
            fare,\r
            LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS prevFare,\r
            ROUND(fare - LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age), 2) AS fareDiff\r
        FROM titanic\r
        WHERE age IS NOT NULL AND fare > 0\r
        ORDER BY pclass, age\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 2단계. LAG 이전 값 가져오기 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              age,\r
              fare,\r
              LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS prevFare,\r
              ROUND(fare - LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age), 2) AS fareDiff\r
          FROM titanic\r
          WHERE age IS NOT NULL AND fare > 0\r
          ORDER BY pclass, age\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. LAG 이전 값 가져오기의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 2단계. LAG 이전 값 가져오기 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step3_lead_intro\r
  title: 3단계. LEAD - 다음 값 가져오기\r
  structuredPrimary: true\r
  subtitle: 미래 값 참조\r
  goal: 3단계. LEAD 다음 값 가져오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    LEAD(column, n)은 LAG와 반대로 현재 행에서 n행 다음의 값을 가져옵니다. LAG가 과거를 본다면 LEAD는 미래를 봅니다. 현재 상태와 다음 상태를 비교하거나, 구간을 계산할 때 유용합니다. 예를 들어 "다음 고객의 구매 금액과 비교", "현재 이벤트와 다음 이벤트 사이의 시간 계산" 등에 활용됩니다. LAG와 LEAD를 함께 사용하면 전후 맥락을 모두 분석할 수 있습니다.\r
\r
    LEAD(col, 1)은 다음 행, LEAD(col, 2)는 2행 후 값을 반환합니다. 마지막 행은 다음 값이 없으므로 NULL입니다. LAG와 LEAD를 동시에 사용하면 전후 값을 모두 확인하여 구간 분석이 가능합니다.\r
  tips:\r
  - LEAD(col, 1)은 다음 행, LEAD(col, 2)는 2행 후 값을 반환합니다. 마지막 행은 다음 값이 없으므로 NULL입니다. LAG와 LEAD를 동시에 사용하면 전후\r
    값을 모두 확인하여 구간 분석이 가능합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            age,\r
            fare,\r
            LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS nextFare,\r
            LEAD(fare, 2) OVER(PARTITION BY pclass ORDER BY age) AS next2Fare\r
        FROM titanic\r
        WHERE age IS NOT NULL AND fare > 0\r
        ORDER BY pclass, age\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 3단계. LEAD 다음 값 가져오기 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              age,\r
              fare,\r
              LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS nextFare,\r
              LEAD(fare, 2) OVER(PARTITION BY pclass ORDER BY age) AS next2Fare\r
          FROM titanic\r
          WHERE age IS NOT NULL AND fare > 0\r
          ORDER BY pclass, age\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. LEAD 다음 값 가져오기의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 3단계. LEAD 다음 값 가져오기 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step4_lag_lead_compare\r
  title: 4단계. LAG와 LEAD 동시 사용\r
  structuredPrimary: true\r
  subtitle: 전후 맥락 분석\r
  goal: 4단계. LAG와 LEAD 동시 사용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: LAG와 LEAD를 동시에 사용하면 현재 값을 중심으로 전후 값을 모두 비교할 수 있습니다. 이는 "현재 값이 전후 평균보다 높은가?", "이전 값과 다음\r
    값 사이의 어디에 위치하는가?" 같은 맥락 기반 분석을 가능하게 합니다. 이동 구간, 피크 탐지, 이상치 감지 등 고급 분석 패턴의 기초가 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            age,\r
            fare,\r
            LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS prevFare,\r
            LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS nextFare,\r
            ROUND((COALESCE(LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age), fare) +\r
                   COALESCE(LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY age), fare)) / 2.0, 2) AS avgAround\r
        FROM titanic\r
        WHERE age IS NOT NULL AND fare > 0\r
        ORDER BY pclass, age\r
        LIMIT 12\r
    """).show()\r
  exercise:\r
    prompt: 4단계. LAG와 LEAD 동시 사용 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              age,\r
              fare,\r
              LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS prevFare,\r
              LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS nextFare,\r
              ROUND((COALESCE(LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age), fare) +\r
                     COALESCE(LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY age), fare)) / 2.0, 2) AS avgAround\r
          FROM titanic\r
          WHERE age IS NOT NULL AND fare > 0\r
          ORDER BY pclass, age\r
          LIMIT 12\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. LAG와 LEAD 동시 사용의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 4단계. LAG와 LEAD 동시 사용 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step5_moving_avg_intro\r
  title: 5단계. 이동 평균 기초\r
  structuredPrimary: true\r
  subtitle: ROWS BETWEEN으로 윈도우 프레임 지정\r
  goal: 5단계. 이동 평균 기초에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    이동 평균(Moving Average)은 일정 범위의 값들의 평균을 구하는 기법입니다. ROWS BETWEEN ... AND ... 구문으로 윈도우 프레임(범위)을 지정합니다. 예를 들어 ROWS BETWEEN 2 PRECEDING AND CURRENT ROW는 "이전 2개 행 + 현재 행" 총 3개 행의 평균을 계산합니다. 이동 평균은 노이즈를 제거하고 추세를 파악하는 데 매우 유용합니다. 주가 분석의 이동평균선, 매출 추세, 트래픽 패턴 등에 널리 사용됩니다.\r
\r
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW는 현재 행 포함 최근 3행을 의미합니다. PRECEDING은 '이전', CURRENT ROW는 '현재 행'입니다. 2 PRECEDING은 2행 전부터 시작하므로 총 3행(2행 전, 1행 전, 현재)이 범위에 포함됩니다. 숫자를 바꾸면 윈도우 크기를 조절할 수 있습니다.\r
  tips:\r
  - ROWS BETWEEN 2 PRECEDING AND CURRENT ROW는 현재 행 포함 최근 3행을 의미합니다. PRECEDING은 '이전', CURRENT ROW는 '현재\r
    행'입니다. 2 PRECEDING은 2행 전부터 시작하므로 총 3행(2행 전, 1행 전, 현재)이 범위에 포함됩니다. 숫자를 바꾸면 윈도우 크기를 조절할 수 있습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            age,\r
            fare,\r
            ROUND(AVG(fare) OVER(\r
                PARTITION BY pclass\r
                ORDER BY age\r
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\r
            ), 2) AS movingAvg3\r
        FROM titanic\r
        WHERE age IS NOT NULL AND fare > 0\r
        ORDER BY pclass, age\r
        LIMIT 12\r
    """).show()\r
  exercise:\r
    prompt: 5단계. 이동 평균 기초 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              age,\r
              fare,\r
              ROUND(AVG(fare) OVER(\r
                  PARTITION BY pclass\r
                  ORDER BY age\r
                  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\r
              ), 2) AS movingAvg3\r
          FROM titanic\r
          WHERE age IS NOT NULL AND fare > 0\r
          ORDER BY pclass, age\r
          LIMIT 12\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 이동 평균 기초의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 5단계. 이동 평균 기초 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step6_moving_avg_variants\r
  title: 6단계. 다양한 이동 평균\r
  structuredPrimary: true\r
  subtitle: 윈도우 크기 변경\r
  goal: 6단계. 다양한 이동 평균에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 윈도우 프레임의 크기를 조절하여 다양한 이동 평균을 계산할 수 있습니다. 작은 윈도우(3개)는 최근 변화에 민감하고, 큰 윈도우(5개 이상)는 장기 추세를\r
    보여줍니다. 실무에서는 여러 크기의 이동 평균을 함께 사용하여 단기/중기/장기 추세를 동시에 분석합니다. 주식 시장의 5일/20일/60일 이동평균선이 대표적인 예입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            age,\r
            fare,\r
            ROUND(AVG(fare) OVER(\r
                PARTITION BY pclass\r
                ORDER BY age\r
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\r
            ), 2) AS movingAvg3,\r
            ROUND(AVG(fare) OVER(\r
                PARTITION BY pclass\r
                ORDER BY age\r
                ROWS BETWEEN 4 PRECEDING AND CURRENT ROW\r
            ), 2) AS movingAvg5\r
        FROM titanic\r
        WHERE age IS NOT NULL AND fare > 0\r
        ORDER BY pclass, age\r
        LIMIT 12\r
    """).show()\r
  exercise:\r
    prompt: 6단계. 다양한 이동 평균 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              age,\r
              fare,\r
              ROUND(AVG(fare) OVER(\r
                  PARTITION BY pclass\r
                  ORDER BY age\r
                  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\r
              ), 2) AS movingAvg3,\r
              ROUND(AVG(fare) OVER(\r
                  PARTITION BY pclass\r
                  ORDER BY age\r
                  ROWS BETWEEN 4 PRECEDING AND CURRENT ROW\r
              ), 2) AS movingAvg5\r
          FROM titanic\r
          WHERE age IS NOT NULL AND fare > 0\r
          ORDER BY pclass, age\r
          LIMIT 12\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 다양한 이동 평균의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 6단계. 다양한 이동 평균 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step7_qualify_intro\r
  title: 7단계. QUALIFY 기본\r
  structuredPrimary: true\r
  subtitle: 윈도우 결과 필터링\r
  goal: 7단계. QUALIFY 기본에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    QUALIFY는 DuckDB의 강력한 확장 기능으로, 윈도우 함수 결과를 직접 필터링할 수 있습니다. WHERE는 윈도우 함수 전에 실행되고 HAVING은 GROUP BY에만 사용되지만, QUALIFY는 윈도우 함수 실행 후 필터링합니다. 서브쿼리 없이 깔끔하게 "순위 3위 이하", "누적 합계 100 이상" 같은 조건을 적용할 수 있습니다. 코드가 간결해지고 가독성이 크게 향상됩니다.\r
\r
    QUALIFY는 HAVING처럼 동작하지만 윈도우 함수에 적용됩니다. 윈도우 함수를 WHERE에서 사용할 수 없는 제약을 우회하는 강력한 기능입니다. 서브쿼리 패턴(FROM (SELECT ... ROW_NUMBER) WHERE rn <= 2)을 QUALIFY 한 줄로 대체할 수 있어 코드가 매우 깔끔해집니다.\r
  tips:\r
  - QUALIFY는 HAVING처럼 동작하지만 윈도우 함수에 적용됩니다. 윈도우 함수를 WHERE에서 사용할 수 없는 제약을 우회하는 강력한 기능입니다. 서브쿼리 패턴(FROM (SELECT\r
    ... ROW_NUMBER) WHERE rn <= 2)을 QUALIFY 한 줄로 대체할 수 있어 코드가 매우 깔끔해집니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            sex,\r
            age,\r
            fare,\r
            ROW_NUMBER() OVER(PARTITION BY pclass, sex ORDER BY fare DESC) AS rn\r
        FROM titanic\r
        WHERE age IS NOT NULL\r
        QUALIFY ROW_NUMBER() OVER(PARTITION BY pclass, sex ORDER BY fare DESC) <= 2\r
        ORDER BY pclass, sex, fare DESC\r
    """).show()\r
  exercise:\r
    prompt: 7단계. QUALIFY 기본 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              sex,\r
              age,\r
              fare,\r
              ROW_NUMBER() OVER(PARTITION BY pclass, sex ORDER BY fare DESC) AS rn\r
          FROM titanic\r
          WHERE age IS NOT NULL\r
          QUALIFY ROW_NUMBER() OVER(PARTITION BY pclass, sex ORDER BY fare DESC) <= 2\r
          ORDER BY pclass, sex, fare DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. QUALIFY 기본의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 7단계. QUALIFY 기본 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step8_qualify_advanced\r
  title: 8단계. QUALIFY 고급 활용\r
  structuredPrimary: true\r
  subtitle: 복잡한 조건 필터링\r
  goal: 8단계. QUALIFY 고급 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: QUALIFY는 AND, OR 등 복잡한 조건도 사용할 수 있습니다. 여러 윈도우 함수 결과를 조합하여 "순위 3위 이하이면서 평균 이상" 같은 조건을 표현할\r
    수 있습니다. 실무에서는 이런 복합 조건으로 정교한 필터링을 수행합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            sex,\r
            age,\r
            fare,\r
            RANK() OVER(PARTITION BY pclass ORDER BY fare DESC) AS fareRank\r
        FROM titanic\r
        WHERE survived = 1 AND age IS NOT NULL\r
        QUALIFY RANK() OVER(PARTITION BY pclass ORDER BY fare DESC) <= 3\r
        ORDER BY pclass, fareRank\r
    """).show()\r
  exercise:\r
    prompt: 8단계. QUALIFY 고급 활용 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              sex,\r
              age,\r
              fare,\r
              RANK() OVER(PARTITION BY pclass ORDER BY fare DESC) AS fareRank\r
          FROM titanic\r
          WHERE survived = 1 AND age IS NOT NULL\r
          QUALIFY RANK() OVER(PARTITION BY pclass ORDER BY fare DESC) <= 3\r
          ORDER BY pclass, fareRank\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. QUALIFY 고급 활용의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 8단계. QUALIFY 고급 활용 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step9_cumsum_moving\r
  title: 9단계. 누적 vs 이동 합계\r
  structuredPrimary: true\r
  subtitle: UNBOUNDED vs BOUNDED\r
  goal: 9단계. 누적 vs 이동 합계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    윈도우 프레임은 UNBOUNDED PRECEDING(처음부터)과 n PRECEDING(n개 전부터) 두 가지 방식이 있습니다. UNBOUNDED PRECEDING을 사용하면 누적 합계, n PRECEDING을 사용하면 이동 합계가 됩니다. 누적은 계속 증가하지만, 이동은 일정 범위만 합산하므로 증감을 반복합니다. 용도에 맞게 선택하면 됩니다.\r
\r
    ROWS UNBOUNDED PRECEDING은 '처음부터 현재까지 전부'를 의미하며 누적 합계가 됩니다. ROWS BETWEEN 2 PRECEDING AND CURRENT ROW는 '최근 3개'만 합산하므로 이동 합계가 됩니다. 누적은 계속 증가하지만 이동은 범위가 고정되어 증감을 반복합니다.\r
  tips:\r
  - ROWS UNBOUNDED PRECEDING은 '처음부터 현재까지 전부'를 의미하며 누적 합계가 됩니다. ROWS BETWEEN 2 PRECEDING AND CURRENT ROW는\r
    '최근 3개'만 합산하므로 이동 합계가 됩니다. 누적은 계속 증가하지만 이동은 범위가 고정되어 증감을 반복합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            age,\r
            fare,\r
            ROUND(SUM(fare) OVER(\r
                PARTITION BY pclass ORDER BY age\r
                ROWS UNBOUNDED PRECEDING\r
            ), 2) AS cumSum,\r
            ROUND(SUM(fare) OVER(\r
                PARTITION BY pclass ORDER BY age\r
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\r
            ), 2) AS movingSum3\r
        FROM titanic\r
        WHERE age IS NOT NULL AND fare > 0\r
        ORDER BY pclass, age\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 9단계. 누적 vs 이동 합계 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              age,\r
              fare,\r
              ROUND(SUM(fare) OVER(\r
                  PARTITION BY pclass ORDER BY age\r
                  ROWS UNBOUNDED PRECEDING\r
              ), 2) AS cumSum,\r
              ROUND(SUM(fare) OVER(\r
                  PARTITION BY pclass ORDER BY age\r
                  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\r
              ), 2) AS movingSum3\r
          FROM titanic\r
          WHERE age IS NOT NULL AND fare > 0\r
          ORDER BY pclass, age\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 누적 vs 이동 합계의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 9단계. 누적 vs 이동 합계 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step10_window_alias\r
  title: 10단계. WINDOW 절로 재사용\r
  structuredPrimary: true\r
  subtitle: 윈도우 정의 간소화\r
  goal: 10단계. WINDOW 절로 재사용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    같은 OVER 절을 여러 번 반복하면 코드가 길어집니다. WINDOW 절로 윈도우 정의에 이름을 붙이면 재사용할 수 있습니다. 코드가 간결해지고 수정도 쉬워집니다. 실무에서 복잡한 쿼리를 작성할 때 가독성 향상에 큰 도움이 됩니다.\r
\r
    WINDOW w AS (...)로 정의한 후 OVER w 형태로 재사용합니다. 같은 윈도우를 여러 곳에서 사용할 때 코드 중복을 줄이고 수정을 쉽게 만듭니다. 윈도우 정의가 복잡할수록 WINDOW 절의 효과가 큽니다.\r
  tips:\r
  - WINDOW w AS (...)로 정의한 후 OVER w 형태로 재사용합니다. 같은 윈도우를 여러 곳에서 사용할 때 코드 중복을 줄이고 수정을 쉽게 만듭니다. 윈도우 정의가 복잡할수록\r
    WINDOW 절의 효과가 큽니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            age,\r
            fare,\r
            LAG(fare, 1) OVER w AS prevFare,\r
            ROUND(AVG(fare) OVER(\r
                PARTITION BY pclass ORDER BY age\r
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\r
            ), 2) AS movingAvg,\r
            CASE\r
                WHEN fare > LAG(fare, 1) OVER w THEN '상승'\r
                WHEN fare < LAG(fare, 1) OVER w THEN '하락'\r
                ELSE '유지'\r
            END AS trend\r
        FROM titanic\r
        WHERE age IS NOT NULL AND fare > 0\r
        WINDOW w AS (PARTITION BY pclass ORDER BY age)\r
        ORDER BY pclass, age\r
        LIMIT 12\r
    """).show()\r
  exercise:\r
    prompt: 10단계. WINDOW 절로 재사용 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              age,\r
              fare,\r
              LAG(fare, 1) OVER w AS prevFare,\r
              ROUND(AVG(fare) OVER(\r
                  PARTITION BY pclass ORDER BY age\r
                  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\r
              ), 2) AS movingAvg,\r
              CASE\r
                  WHEN fare > LAG(fare, 1) OVER w THEN '상승'\r
                  WHEN fare < LAG(fare, 1) OVER w THEN '하락'\r
                  ELSE '유지'\r
              END AS trend\r
          FROM titanic\r
          WHERE age IS NOT NULL AND fare > 0\r
          WINDOW w AS (PARTITION BY pclass ORDER BY age)\r
          ORDER BY pclass, age\r
          LIMIT 12\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. WINDOW 절로 재사용의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 10단계. WINDOW 절로 재사용 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step11_final\r
  title: 11단계. 최종 종합 분석\r
  structuredPrimary: true\r
  subtitle: 모든 개념 결합\r
  goal: 11단계. 최종 종합 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: LAG, LEAD, 이동 평균, QUALIFY를 모두 활용한 종합 분석입니다. CTE와 윈도우 함수를 결합하여 복잡한 분석 파이프라인을 구축합니다. 실무에서\r
    이런 패턴으로 시계열 데이터를 분석하고 추세를 예측합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH rankedPassengers AS (\r
            SELECT\r
                pclass,\r
                sex,\r
                age,\r
                fare,\r
                embarked,\r
                ROW_NUMBER() OVER(PARTITION BY pclass ORDER BY fare DESC) AS rn,\r
                LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY fare DESC) AS higherFare,\r
                LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY fare DESC) AS lowerFare,\r
                ROUND(AVG(fare) OVER(\r
                    PARTITION BY pclass ORDER BY fare DESC\r
                    ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING\r
                ), 2) AS movingAvg3\r
            FROM titanic\r
            WHERE survived = 1 AND age IS NOT NULL\r
        )\r
        SELECT\r
            pclass,\r
            sex,\r
            age,\r
            fare,\r
            higherFare,\r
            lowerFare,\r
            movingAvg3,\r
            ROUND(fare - COALESCE(lowerFare, fare), 2) AS diffFromLower\r
        FROM rankedPassengers\r
        WHERE rn <= 5\r
        ORDER BY pclass, rn\r
    """).show()\r
  exercise:\r
    prompt: 11단계. 최종 종합 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH rankedPassengers AS (\r
              SELECT\r
                  pclass,\r
                  sex,\r
                  age,\r
                  fare,\r
                  embarked,\r
                  ROW_NUMBER() OVER(PARTITION BY pclass ORDER BY fare DESC) AS rn,\r
                  LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY fare DESC) AS higherFare,\r
                  LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY fare DESC) AS lowerFare,\r
                  ROUND(AVG(fare) OVER(\r
                      PARTITION BY pclass ORDER BY fare DESC\r
                      ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING\r
                  ), 2) AS movingAvg3\r
              FROM titanic\r
              WHERE survived = 1 AND age IS NOT NULL\r
          )\r
          SELECT\r
              pclass,\r
              sex,\r
              age,\r
              fare,\r
              higherFare,\r
              lowerFare,\r
              movingAvg3,\r
              ROUND(fare - COALESCE(lowerFare, fare), 2) AS diffFromLower\r
          FROM rankedPassengers\r
          WHERE rn <= 5\r
          ORDER BY pclass, rn\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 최종 종합 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 11단계. 최종 종합 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 고급 윈도우 함수 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    고급 윈도우 함수를 종합 활용하여 타이타닉 데이터를 심층 분석해봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    import duckdb\r
    data = pd.DataFrame({\r
        "survived": [0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],\r
        "pclass": [3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 1],\r
        "sex": ["male", "female", "female", "male", "female", "male", "female", "male", "male", "male", "male", "female"],\r
        "age": [22, 38, 18, None, 29, 41, 45, 54, 49, 36, 42, 31],\r
        "fare": [7.25, 71.28, 13.00, 21.08, 76.29, 8.05, 83.47, 26.00, 35.50, 30.50, 13.00, 79.65],\r
        "embarked": ["S", "C", "S", None, "C", "Q", "C", "S", "S", "C", "S", "C"],\r
        "class": ["Third", "First", "Second", "Second", "First", "Third", "First", "Second", "First", "First", "Second", "First"],\r
        "who": ["man", "woman", "woman", "child", "woman", "man", "woman", "man", "man", "man", "man", "woman"],\r
        "name": ["Smith, Mr. John", "Smith, Mrs. Anna", "Smith, Miss. Clara", "Brown, Master. Tim", "Wilson, Mrs. Rose", "Brown, Mr. George", "Doe, Dr. Helen", "Miller, Rev. James", "Stone, Col. Arthur", "Major, Major. Alan", "Taylor, Capt. Mark", "Brown, Miss. Ella"],\r
    })\r
    tbl1 = duckdb.from_df(data)\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import duckdb\r
      data = pd.DataFrame({\r
          "survived": [0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],\r
          "pclass": [3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 1],\r
          "sex": ["male", "female", "female", "male", "female", "male", "female", "male", "male", "male", "male", "female"],\r
          "age": [22, 38, 18, None, 29, 41, 45, 54, 49, 36, 42, 31],\r
          "fare": [7.25, 71.28, 13.00, 21.08, 76.29, 8.05, 83.47, 26.00, 35.50, 30.50, 13.00, 79.65],\r
          "embarked": ["S", "C", "S", None, "C", "Q", "C", "S", "S", "C", "S", "C"],\r
          "class": ["Third", "First", "Second", "Second", "First", "Third", "First", "Second", "First", "First", "Second", "First"],\r
          "who": ["man", "woman", "woman", "child", "woman", "man", "woman", "man", "man", "man", "man", "woman"],\r
          "name": ["Smith, Mr. John", "Smith, Mrs. Anna", "Smith, Miss. Clara", "Brown, Master. Tim", "Wilson, Mrs. Rose", "Brown, Mr. George", "Doe, Dr. Helen", "Miller, Rev. James", "Stone, Col. Arthur", "Major, Major. Alan", "Taylor, Capt. Mark", "Brown, Miss. Ella"],\r
      })\r
      tbl1 = duckdb.from_df(data)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 실습의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 실습 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: 고급 윈도우 함수를 완벽히 마스터했습니다!\r
  - type: list\r
    items:\r
    - LAG(col, n) - n행 이전 값 가져오기\r
    - LEAD(col, n) - n행 다음 값 가져오기\r
    - ROWS BETWEEN ... AND ... - 윈도우 프레임 지정\r
    - 이동 평균 - ROWS BETWEEN n PRECEDING AND CURRENT ROW\r
    - 누적 합계 - ROWS UNBOUNDED PRECEDING\r
    - QUALIFY - 윈도우 함수 결과 직접 필터링\r
    - WINDOW 절 - 윈도우 정의 재사용\r
  - type: text\r
    content: 다음 시간에는 문자열 함수와 정규표현식으로 텍스트 데이터를 처리하는 방법을 배웁니다!\r
  goal: 정리에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트'\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → SQL 오류 수정 → 결과 검증 → 실무 변주\r
  goal: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: DuckDB 학습은 쿼리 결과를 눈으로 보는 데서 끝나면 실무로 이어지기 어렵습니다. 작은 로컬 테이블을 만들고, 잘못된 컬럼명을 먼저 실패시킨 뒤, 집계\r
    결과와 기준 변경 실험을 assert로 고정합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import duckdb\r
\r
    workflowCon = duckdb.connect()\r
    workflowCon.sql("""\r
        CREATE OR REPLACE TABLE lessonOrders AS\r
        SELECT * FROM (VALUES\r
            ('A-100', 'paid', 50000, 'web'),\r
            ('A-101', 'pending', 20000, 'app'),\r
            ('A-102', 'paid', 120000, 'web'),\r
            ('A-103', 'cancelled', 15000, 'store'),\r
            ('A-104', 'paid', 62000, 'app')\r
        ) AS t(orderId, status, amount, channel)\r
    """)\r
\r
    expectedPaidRevenue = 232000\r
    expectedPaidCount = 3\r
    rowCount = workflowCon.sql("SELECT COUNT(*) FROM lessonOrders").fetchone()[0]\r
\r
    assert rowCount == 5\r
    rowCount\r
  exercise:\r
    prompt: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import duckdb\r
\r
      workflowCon = duckdb.connect()\r
      workflowCon.sql("""\r
          CREATE OR REPLACE TABLE lessonOrders AS\r
          SELECT * FROM (VALUES\r
              ('A-100', 'paid', 50000, 'web'),\r
              ('A-101', 'pending', 20000, 'app'),\r
              ('A-102', 'paid', 120000, 'web'),\r
              ('A-103', 'cancelled', 15000, 'store'),\r
              ('A-104', 'paid', 62000, 'app')\r
          ) AS t(orderId, status, amount, channel)\r
      """)\r
\r
      expectedPaidRevenue = 232000\r
      expectedPaidCount = 3\r
      rowCount = workflowCon.sql("SELECT COUNT(*) FROM lessonOrders").fetchone()[0]\r
\r
      assert rowCount == 5\r
      rowCount\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.'\r
    resultCheck: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.'\r
`;export{e as default};