var e=`meta:\r
  packages:\r
  - duckdb\r
  - pandas\r
  id: duckdb_10\r
  title: 종합프로젝트\r
  order: 10\r
  category: duckdb\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - tips\r
  - titanic\r
  - CTE\r
  - 윈도우함수\r
  - 서브쿼리\r
  - 종합\r
  seo:\r
    title: DuckDB 종합 프로젝트 - 실전 분석 파이프라인\r
    description: tips와 titanic 데이터로 모든 SQL 개념을 종합한 복합 쿼리를 설계합니다. CTE, 윈도우 함수, 서브쿼리까지 총정리합니다.\r
    keywords:\r
    - duckdb 종합\r
    - CTE\r
    - 윈도우 함수\r
    - SQL 분석\r
    - 실전 파이프라인\r
intro:\r
  emoji: 🔥\r
  goal: tips와 titanic 데이터로 "실전 분석 파이프라인"을 완성합니다.\r
  description: CTE, 윈도우 함수, 서브쿼리, CASE WHEN, GROUP BY, 문자열 함수, JOIN까지 모든 개념을 종합합니다.\r
  direction: 종합프로젝트에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.\r
  - 종합프로젝트 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 비즈니스 질문 정의 처리 실행\r
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. CTE로 구조화 결과 검증\r
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.\r
    - label: 종합프로젝트 재사용\r
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: SQL 분석 환경\r
      detail: duckdb, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 종합프로젝트 실행\r
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.\r
    - label: 종합프로젝트 완료\r
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: tips + titanic\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 두 데이터셋을 불러옵니다. tips는 레스토랑 팁 데이터, titanic은 타이타닉 생존자 데이터입니다. 이 종합 프로젝트에서는 두 데이터로 CTE, 윈도우\r
    함수, 서브쿼리, CASE WHEN, GROUP BY 등 모든 SQL 개념을 통합하여 실전 분석 파이프라인을 구축합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import duckdb\r
\r
    dfTips = loadLocalDataset("tips")\r
    dfTitanic = loadLocalDataset("titanic")\r
    if "name" not in dfTitanic.columns:\r
        titleCycle = ["Mr.", "Mrs.", "Miss.", "Master.", "Dr.", "Rev."]\r
        dfTitanic = dfTitanic.copy()\r
        dfTitanic["name"] = [\r
            f"Passenger{index:03d}, {titleCycle[index % len(titleCycle)]} Local"\r
            for index in range(len(dfTitanic))\r
        ]\r
\r
    tips = duckdb.from_df(dfTips)\r
    titanic = duckdb.from_df(dfTitanic)\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import duckdb\r
\r
      dfTips = loadLocalDataset("tips")\r
      dfTitanic = loadLocalDataset("titanic")\r
      if "name" not in dfTitanic.columns:\r
          titleCycle = ["Mr.", "Mrs.", "Miss.", "Master.", "Dr.", "Rev."]\r
          dfTitanic = dfTitanic.copy()\r
          dfTitanic["name"] = [\r
              f"Passenger{index:03d}, {titleCycle[index % len(titleCycle)]} Local"\r
              for index in range(len(dfTitanic))\r
          ]\r
\r
      tips = duckdb.from_df(dfTips)\r
      titanic = duckdb.from_df(dfTitanic)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 데이터 불러오기의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step2_business_question\r
  title: 2단계. 비즈니스 질문 정의\r
  structuredPrimary: true\r
  subtitle: 분석 목표 설정\r
  goal: 2단계. 비즈니스 질문 정의에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 복잡한 분석은 명확한 질문에서 시작합니다. tips 데이터로 다음을 분석합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT * FROM tips LIMIT 5\r
    """)\r
  exercise:\r
    prompt: 2단계. 비즈니스 질문 정의 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT * FROM tips LIMIT 5\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 비즈니스 질문 정의의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 2단계. 비즈니스 질문 정의 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step3_cte_basic\r
  title: 3단계. CTE로 구조화\r
  structuredPrimary: true\r
  subtitle: WITH 절 활용\r
  goal: 3단계. CTE로 구조화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: CTE(Common Table Expression)로 복잡한 쿼리를 단계별로 분리합니다. WITH 절을 사용하면 쿼리를 논리적 단위로 나누어 가독성을 높이고\r
    재사용할 수 있습니다. 복잡한 비즈니스 로직을 명확하게 표현하는 핵심 기법입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH dailyStats AS (\r
            SELECT\r
                day,\r
                COUNT(*) AS orderCount,\r
                SUM(total_bill) AS totalSales,\r
                AVG(tip) AS avgTip\r
            FROM tips\r
            GROUP BY day\r
        )\r
        SELECT\r
            day,\r
            orderCount,\r
            ROUND(totalSales, 2) AS totalSales,\r
            ROUND(avgTip, 2) AS avgTip\r
        FROM dailyStats\r
        ORDER BY totalSales DESC\r
    """)\r
  exercise:\r
    prompt: 3단계. CTE로 구조화 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH dailyStats AS (\r
              SELECT\r
                  day,\r
                  COUNT(*) AS orderCount,\r
                  SUM(total_bill) AS totalSales,\r
                  AVG(tip) AS avgTip\r
              FROM tips\r
              GROUP BY day\r
          )\r
          SELECT\r
              day,\r
              orderCount,\r
              ROUND(totalSales, 2) AS totalSales,\r
              ROUND(avgTip, 2) AS avgTip\r
          FROM dailyStats\r
          ORDER BY totalSales DESC\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. CTE로 구조화의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 3단계. CTE로 구조화 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step4_multi_cte\r
  title: 4단계. 다중 CTE\r
  structuredPrimary: true\r
  subtitle: 여러 CTE 연결\r
  goal: 4단계. 다중 CTE에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 여러 CTE를 연결하여 단계별로 데이터를 가공합니다. 첫 번째 CTE에서 기본 집계를 하고, 두 번째 CTE에서 순위를 매기는 식으로 파이프라인을 구성합니다.\r
    각 단계가 명확히 분리되어 디버깅과 유지보수가 쉬워집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH dailyStats AS (\r
            SELECT\r
                day,\r
                time,\r
                COUNT(*) AS orderCount,\r
                SUM(total_bill) AS totalSales\r
            FROM tips\r
            GROUP BY day, time\r
        ),\r
        ranked AS (\r
            SELECT\r
                *,\r
                RANK() OVER (PARTITION BY time ORDER BY totalSales DESC) AS salesRank\r
            FROM dailyStats\r
        )\r
        SELECT\r
            day,\r
            time,\r
            orderCount,\r
            ROUND(totalSales, 2) AS totalSales,\r
            salesRank\r
        FROM ranked\r
        WHERE salesRank <= 3\r
        ORDER BY time, salesRank\r
    """)\r
  exercise:\r
    prompt: 4단계. 다중 CTE 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH dailyStats AS (\r
              SELECT\r
                  day,\r
                  time,\r
                  COUNT(*) AS orderCount,\r
                  SUM(total_bill) AS totalSales\r
              FROM tips\r
              GROUP BY day, time\r
          ),\r
          ranked AS (\r
              SELECT\r
                  *,\r
                  RANK() OVER (PARTITION BY time ORDER BY totalSales DESC) AS salesRank\r
              FROM dailyStats\r
          )\r
          SELECT\r
              day,\r
              time,\r
              orderCount,\r
              ROUND(totalSales, 2) AS totalSales,\r
              salesRank\r
          FROM ranked\r
          WHERE salesRank <= 3\r
          ORDER BY time, salesRank\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 다중 CTE의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 4단계. 다중 CTE 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step5_window_row_number\r
  title: 5단계. ROW_NUMBER 활용\r
  structuredPrimary: true\r
  subtitle: 순위 번호 부여\r
  goal: 5단계. ROWNUMBER 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: ROW_NUMBER로 각 그룹 내 순위를 매깁니다. ROW_NUMBER는 같은 값이라도 고유한 번호를 부여하며, PARTITION BY로 그룹을 나누고 ORDER\r
    BY로 정렬 기준을 정합니다. 각 요일별 팁 상위 3건만 추출하는 등의 분석에 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            total_bill,\r
            tip,\r
            ROW_NUMBER() OVER (PARTITION BY day ORDER BY tip DESC) AS tipRank\r
        FROM tips\r
        QUALIFY tipRank <= 3\r
    """)\r
  exercise:\r
    prompt: 5단계. ROWNUMBER 활용 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              total_bill,\r
              tip,\r
              ROW_NUMBER() OVER (PARTITION BY day ORDER BY tip DESC) AS tipRank\r
          FROM tips\r
          QUALIFY tipRank <= 3\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. ROWNUMBER 활용의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 5단계. ROWNUMBER 활용 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step6_window_lag\r
  title: 6단계. LAG 함수\r
  structuredPrimary: true\r
  subtitle: 이전 값과 비교\r
  goal: 6단계. LAG 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: LAG로 이전 행과 비교 분석합니다. titanic 데이터로 나이별 생존율 변화를 봅니다. LAG(컬럼, n)은 n행 앞의 값을 가져오며, 시계열 분석이나\r
    연속된 그룹 간 차이를 계산할 때 매우 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH ageGroup AS (\r
            SELECT\r
                CASE\r
                    WHEN age < 10 THEN '0-9'\r
                    WHEN age < 20 THEN '10-19'\r
                    WHEN age < 30 THEN '20-29'\r
                    WHEN age < 40 THEN '30-39'\r
                    WHEN age < 50 THEN '40-49'\r
                    ELSE '50+'\r
                END AS ageRange,\r
                survived\r
            FROM titanic\r
            WHERE age IS NOT NULL\r
        ),\r
        survivalRate AS (\r
            SELECT\r
                ageRange,\r
                COUNT(*) AS total,\r
                SUM(survived) AS survivors,\r
                ROUND(100.0 * SUM(survived) / COUNT(*), 1) AS rate\r
            FROM ageGroup\r
            GROUP BY ageRange\r
        )\r
        SELECT\r
            ageRange,\r
            total,\r
            survivors,\r
            rate,\r
            LAG(rate) OVER (ORDER BY ageRange) AS prevRate,\r
            ROUND(rate - LAG(rate) OVER (ORDER BY ageRange), 1) AS rateDiff\r
        FROM survivalRate\r
        ORDER BY ageRange\r
    """)\r
  exercise:\r
    prompt: 6단계. LAG 함수 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH ageGroup AS (\r
              SELECT\r
                  CASE\r
                      WHEN age < 10 THEN '0-9'\r
                      WHEN age < 20 THEN '10-19'\r
                      WHEN age < 30 THEN '20-29'\r
                      WHEN age < 40 THEN '30-39'\r
                      WHEN age < 50 THEN '40-49'\r
                      ELSE '50+'\r
                  END AS ageRange,\r
                  survived\r
              FROM titanic\r
              WHERE age IS NOT NULL\r
          ),\r
          survivalRate AS (\r
              SELECT\r
                  ageRange,\r
                  COUNT(*) AS total,\r
                  SUM(survived) AS survivors,\r
                  ROUND(100.0 * SUM(survived) / COUNT(*), 1) AS rate\r
              FROM ageGroup\r
              GROUP BY ageRange\r
          )\r
          SELECT\r
              ageRange,\r
              total,\r
              survivors,\r
              rate,\r
              LAG(rate) OVER (ORDER BY ageRange) AS prevRate,\r
              ROUND(rate - LAG(rate) OVER (ORDER BY ageRange), 1) AS rateDiff\r
          FROM survivalRate\r
          ORDER BY ageRange\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. LAG 함수의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 6단계. LAG 함수 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step7_subquery\r
  title: 7단계. 서브쿼리 활용\r
  structuredPrimary: true\r
  subtitle: 중첩 쿼리\r
  goal: 7단계. 서브쿼리 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 서브쿼리로 평균 이상인 데이터를 필터링합니다. WHERE tip > (SELECT AVG(tip) FROM tips)처럼 서브쿼리를 사용하면 하드코딩 없이\r
    동적 기준으로 필터링할 수 있습니다. 데이터가 변해도 쿼리를 수정할 필요가 없습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            time,\r
            total_bill,\r
            tip,\r
            ROUND(100.0 * tip / total_bill, 1) AS tipRate\r
        FROM tips\r
        WHERE tip > (SELECT AVG(tip) FROM tips)\r
        ORDER BY tip DESC\r
        LIMIT 10\r
    """)\r
  exercise:\r
    prompt: 7단계. 서브쿼리 활용 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              time,\r
              total_bill,\r
              tip,\r
              ROUND(100.0 * tip / total_bill, 1) AS tipRate\r
          FROM tips\r
          WHERE tip > (SELECT AVG(tip) FROM tips)\r
          ORDER BY tip DESC\r
          LIMIT 10\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 서브쿼리 활용의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 7단계. 서브쿼리 활용 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step8_case_when\r
  title: 8단계. CASE WHEN 분류\r
  structuredPrimary: true\r
  subtitle: 조건부 분류\r
  goal: 8단계. CASE WHEN 분류에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: CASE WHEN으로 데이터를 분류하고 분석합니다. 연속형 변수를 범주형으로 변환하거나, 복잡한 비즈니스 규칙을 적용할 때 필수적입니다. VIP, 우수, 보통\r
    같은 고객 등급을 만들어 세그먼트별 분석을 수행할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH tipGrade AS (\r
            SELECT\r
                *,\r
                CASE\r
                    WHEN tip / total_bill >= 0.2 THEN 'VIP'\r
                    WHEN tip / total_bill >= 0.15 THEN '우수'\r
                    WHEN tip / total_bill >= 0.1 THEN '보통'\r
                    ELSE '저조'\r
                END AS grade\r
            FROM tips\r
        )\r
        SELECT\r
            grade,\r
            COUNT(*) AS count,\r
            ROUND(AVG(total_bill), 2) AS avgBill,\r
            ROUND(AVG(tip), 2) AS avgTip,\r
            ROUND(100.0 * AVG(tip / total_bill), 1) AS avgTipRate\r
        FROM tipGrade\r
        GROUP BY grade\r
        ORDER BY avgTipRate DESC\r
    """)\r
  exercise:\r
    prompt: 8단계. CASE WHEN 분류 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH tipGrade AS (\r
              SELECT\r
                  *,\r
                  CASE\r
                      WHEN tip / total_bill >= 0.2 THEN 'VIP'\r
                      WHEN tip / total_bill >= 0.15 THEN '우수'\r
                      WHEN tip / total_bill >= 0.1 THEN '보통'\r
                      ELSE '저조'\r
                  END AS grade\r
              FROM tips\r
          )\r
          SELECT\r
              grade,\r
              COUNT(*) AS count,\r
              ROUND(AVG(total_bill), 2) AS avgBill,\r
              ROUND(AVG(tip), 2) AS avgTip,\r
              ROUND(100.0 * AVG(tip / total_bill), 1) AS avgTipRate\r
          FROM tipGrade\r
          GROUP BY grade\r
          ORDER BY avgTipRate DESC\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. CASE WHEN 분류의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 8단계. CASE WHEN 분류 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step9_having\r
  title: 9단계. GROUP BY + HAVING\r
  structuredPrimary: true\r
  subtitle: 집계 후 필터\r
  goal: 9단계. GROUP BY + HAVING에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: HAVING으로 집계 결과를 필터링합니다. WHERE는 행 단위 필터이고, HAVING은 그룹 단위 필터입니다. COUNT(*) >= 5처럼 집계 함수 결과로\r
    조건을 걸 때는 반드시 HAVING을 사용해야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            time,\r
            smoker,\r
            COUNT(*) AS orderCount,\r
            ROUND(SUM(total_bill), 2) AS totalSales,\r
            ROUND(AVG(tip), 2) AS avgTip\r
        FROM tips\r
        GROUP BY day, time, smoker\r
        HAVING COUNT(*) >= 5\r
        ORDER BY totalSales DESC\r
    """)\r
  exercise:\r
    prompt: 9단계. GROUP BY + HAVING 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              time,\r
              smoker,\r
              COUNT(*) AS orderCount,\r
              ROUND(SUM(total_bill), 2) AS totalSales,\r
              ROUND(AVG(tip), 2) AS avgTip\r
          FROM tips\r
          GROUP BY day, time, smoker\r
          HAVING COUNT(*) >= 5\r
          ORDER BY totalSales DESC\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. GROUP BY + HAVING의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 9단계. GROUP BY + HAVING 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step10_string_function\r
  title: 10단계. 문자열 함수\r
  structuredPrimary: true\r
  subtitle: 텍스트 가공\r
  goal: 10단계. 문자열 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 문자열 함수로 데이터를 가공합니다. SPLIT_PART로 이름에서 호칭을 추출하고, TRIM으로 공백을 제거합니다. 텍스트 데이터를 정제하고 분석 가능한 형태로\r
    변환하는 것은 실무에서 매우 중요한 스킬입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH titleExtract AS (\r
            SELECT\r
                name,\r
                TRIM(SPLIT_PART(SPLIT_PART(name, ',', 2), '.', 1)) AS title,\r
                survived,\r
                sex,\r
                age\r
            FROM titanic\r
        )\r
        SELECT\r
            title,\r
            COUNT(*) AS count,\r
            ROUND(100.0 * SUM(survived) / COUNT(*), 1) AS survivalRate,\r
            ROUND(AVG(age), 1) AS avgAge\r
        FROM titleExtract\r
        GROUP BY title\r
        HAVING COUNT(*) >= 5\r
        ORDER BY survivalRate DESC\r
    """)\r
  exercise:\r
    prompt: 10단계. 문자열 함수 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH titleExtract AS (\r
              SELECT\r
                  name,\r
                  TRIM(SPLIT_PART(SPLIT_PART(name, ',', 2), '.', 1)) AS title,\r
                  survived,\r
                  sex,\r
                  age\r
              FROM titanic\r
          )\r
          SELECT\r
              title,\r
              COUNT(*) AS count,\r
              ROUND(100.0 * SUM(survived) / COUNT(*), 1) AS survivalRate,\r
              ROUND(AVG(age), 1) AS avgAge\r
          FROM titleExtract\r
          GROUP BY title\r
          HAVING COUNT(*) >= 5\r
          ORDER BY survivalRate DESC\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 문자열 함수의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 10단계. 문자열 함수 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step11_comprehensive_tips\r
  title: 11단계. Tips 종합 분석\r
  structuredPrimary: true\r
  subtitle: 모든 개념 결합\r
  goal: 11단계. Tips 종합 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 모든 개념을 결합한 종합 분석 쿼리입니다. 다중 CTE로 기본 데이터 가공 → 세그먼트 집계 → 순위 매기기를 단계별로 수행합니다. 이런 구조화된 쿼리는 복잡한\r
    비즈니스 요구사항을 명확하게 구현하며, 협업 시 이해하기 쉽습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH baseData AS (\r
            SELECT\r
                *,\r
                ROUND(100.0 * tip / total_bill, 2) AS tipRate,\r
                CASE\r
                    WHEN size <= 2 THEN '소규모'\r
                    WHEN size <= 4 THEN '중규모'\r
                    ELSE '대규모'\r
                END AS partySize,\r
                CASE\r
                    WHEN tip / total_bill >= 0.2 THEN 'VIP'\r
                    WHEN tip / total_bill >= 0.15 THEN '우수'\r
                    ELSE '일반'\r
                END AS customerGrade\r
            FROM tips\r
        ),\r
        segmentStats AS (\r
            SELECT\r
                day,\r
                time,\r
                partySize,\r
                customerGrade,\r
                COUNT(*) AS orderCount,\r
                SUM(total_bill) AS totalSales,\r
                AVG(tipRate) AS avgTipRate\r
            FROM baseData\r
            GROUP BY day, time, partySize, customerGrade\r
        ),\r
        ranked AS (\r
            SELECT\r
                *,\r
                RANK() OVER (PARTITION BY day ORDER BY totalSales DESC) AS salesRank\r
            FROM segmentStats\r
        )\r
        SELECT\r
            day,\r
            time,\r
            partySize,\r
            customerGrade,\r
            orderCount,\r
            ROUND(totalSales, 2) AS totalSales,\r
            ROUND(avgTipRate, 1) AS avgTipRate,\r
            salesRank\r
        FROM ranked\r
        WHERE salesRank <= 5\r
        ORDER BY day, salesRank\r
    """)\r
  exercise:\r
    prompt: 11단계. Tips 종합 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH baseData AS (\r
              SELECT\r
                  *,\r
                  ROUND(100.0 * tip / total_bill, 2) AS tipRate,\r
                  CASE\r
                      WHEN size <= 2 THEN '소규모'\r
                      WHEN size <= 4 THEN '중규모'\r
                      ELSE '대규모'\r
                  END AS partySize,\r
                  CASE\r
                      WHEN tip / total_bill >= 0.2 THEN 'VIP'\r
                      WHEN tip / total_bill >= 0.15 THEN '우수'\r
                      ELSE '일반'\r
                  END AS customerGrade\r
              FROM tips\r
          ),\r
          segmentStats AS (\r
              SELECT\r
                  day,\r
                  time,\r
                  partySize,\r
                  customerGrade,\r
                  COUNT(*) AS orderCount,\r
                  SUM(total_bill) AS totalSales,\r
                  AVG(tipRate) AS avgTipRate\r
              FROM baseData\r
              GROUP BY day, time, partySize, customerGrade\r
          ),\r
          ranked AS (\r
              SELECT\r
                  *,\r
                  RANK() OVER (PARTITION BY day ORDER BY totalSales DESC) AS salesRank\r
              FROM segmentStats\r
          )\r
          SELECT\r
              day,\r
              time,\r
              partySize,\r
              customerGrade,\r
              orderCount,\r
              ROUND(totalSales, 2) AS totalSales,\r
              ROUND(avgTipRate, 1) AS avgTipRate,\r
              salesRank\r
          FROM ranked\r
          WHERE salesRank <= 5\r
          ORDER BY day, salesRank\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. Tips 종합 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 11단계. Tips 종합 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step12_comprehensive_titanic\r
  title: 12단계. Titanic 종합 분석\r
  structuredPrimary: true\r
  subtitle: 생존 분석 파이프라인\r
  goal: 12단계. Titanic 종합 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: titanic 데이터로 생존 요인을 종합 분석합니다. 승객 프로필 생성 → 생존율 분석 → 순위 매기기를 3단계 CTE로 구성합니다. 호칭, 나이 그룹, 요금\r
    등급을 조합하여 생존율에 영향을 미친 복합 요인을 파악합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH passengerProfile AS (\r
            SELECT\r
                *,\r
                TRIM(SPLIT_PART(SPLIT_PART(name, ',', 2), '.', 1)) AS title,\r
                CASE\r
                    WHEN age < 18 THEN '미성년'\r
                    WHEN age < 60 THEN '성인'\r
                    ELSE '노년'\r
                END AS ageGroup,\r
                CASE\r
                    WHEN fare = 0 THEN '무임'\r
                    WHEN fare < 20 THEN '저가'\r
                    WHEN fare < 50 THEN '중가'\r
                    ELSE '고가'\r
                END AS fareClass\r
            FROM titanic\r
            WHERE age IS NOT NULL\r
        ),\r
        survivalAnalysis AS (\r
            SELECT\r
                pclass,\r
                sex,\r
                ageGroup,\r
                fareClass,\r
                COUNT(*) AS total,\r
                SUM(survived) AS survivors,\r
                ROUND(100.0 * SUM(survived) / COUNT(*), 1) AS survivalRate\r
            FROM passengerProfile\r
            GROUP BY pclass, sex, ageGroup, fareClass\r
            HAVING COUNT(*) >= 5\r
        ),\r
        ranked AS (\r
            SELECT\r
                *,\r
                RANK() OVER (ORDER BY survivalRate DESC) AS overallRank,\r
                RANK() OVER (PARTITION BY pclass ORDER BY survivalRate DESC) AS classRank\r
            FROM survivalAnalysis\r
        )\r
        SELECT\r
            pclass,\r
            sex,\r
            ageGroup,\r
            fareClass,\r
            total,\r
            survivors,\r
            survivalRate,\r
            overallRank,\r
            classRank\r
        FROM ranked\r
        WHERE classRank <= 3\r
        ORDER BY pclass, classRank\r
    """)\r
  exercise:\r
    prompt: 12단계. Titanic 종합 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH passengerProfile AS (\r
              SELECT\r
                  *,\r
                  TRIM(SPLIT_PART(SPLIT_PART(name, ',', 2), '.', 1)) AS title,\r
                  CASE\r
                      WHEN age < 18 THEN '미성년'\r
                      WHEN age < 60 THEN '성인'\r
                      ELSE '노년'\r
                  END AS ageGroup,\r
                  CASE\r
                      WHEN fare = 0 THEN '무임'\r
                      WHEN fare < 20 THEN '저가'\r
                      WHEN fare < 50 THEN '중가'\r
                      ELSE '고가'\r
                  END AS fareClass\r
              FROM titanic\r
              WHERE age IS NOT NULL\r
          ),\r
          survivalAnalysis AS (\r
              SELECT\r
                  pclass,\r
                  sex,\r
                  ageGroup,\r
                  fareClass,\r
                  COUNT(*) AS total,\r
                  SUM(survived) AS survivors,\r
                  ROUND(100.0 * SUM(survived) / COUNT(*), 1) AS survivalRate\r
              FROM passengerProfile\r
              GROUP BY pclass, sex, ageGroup, fareClass\r
              HAVING COUNT(*) >= 5\r
          ),\r
          ranked AS (\r
              SELECT\r
                  *,\r
                  RANK() OVER (ORDER BY survivalRate DESC) AS overallRank,\r
                  RANK() OVER (PARTITION BY pclass ORDER BY survivalRate DESC) AS classRank\r
              FROM survivalAnalysis\r
          )\r
          SELECT\r
              pclass,\r
              sex,\r
              ageGroup,\r
              fareClass,\r
              total,\r
              survivors,\r
              survivalRate,\r
              overallRank,\r
              classRank\r
          FROM ranked\r
          WHERE classRank <= 3\r
          ORDER BY pclass, classRank\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 12단계. Titanic 종합 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 12단계. Titanic 종합 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step13_final_pipeline\r
  title: 13단계. 최종 파이프라인\r
  structuredPrimary: true\r
  subtitle: 분석 보고서 생성\r
  goal: 13단계. 최종 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 최종 분석 결과를 보고서 형태로 출력합니다. UNION ALL로 전체 통계와 요일별 통계를 하나의 결과로 합치고, 서브쿼리로 매출 점유율을 계산합니다. 이런\r
    형태의 요약 보고서는 경영진 보고용으로 자주 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH summary AS (\r
            SELECT\r
                '전체' AS category,\r
                COUNT(*) AS count,\r
                ROUND(SUM(total_bill), 2) AS totalSales,\r
                ROUND(AVG(tip), 2) AS avgTip,\r
                ROUND(100.0 * AVG(tip / total_bill), 1) AS avgTipRate\r
            FROM tips\r
\r
            UNION ALL\r
\r
            SELECT\r
                day AS category,\r
                COUNT(*) AS count,\r
                ROUND(SUM(total_bill), 2) AS totalSales,\r
                ROUND(AVG(tip), 2) AS avgTip,\r
                ROUND(100.0 * AVG(tip / total_bill), 1) AS avgTipRate\r
            FROM tips\r
            GROUP BY day\r
        )\r
        SELECT\r
            category,\r
            count,\r
            totalSales,\r
            avgTip,\r
            avgTipRate,\r
            ROUND(100.0 * totalSales / (SELECT SUM(total_bill) FROM tips), 1) AS salesShare\r
        FROM summary\r
        ORDER BY\r
            CASE WHEN category = '전체' THEN 0 ELSE 1 END,\r
            totalSales DESC\r
    """)\r
  exercise:\r
    prompt: 13단계. 최종 파이프라인 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH summary AS (\r
              SELECT\r
                  '전체' AS category,\r
                  COUNT(*) AS count,\r
                  ROUND(SUM(total_bill), 2) AS totalSales,\r
                  ROUND(AVG(tip), 2) AS avgTip,\r
                  ROUND(100.0 * AVG(tip / total_bill), 1) AS avgTipRate\r
              FROM tips\r
\r
              UNION ALL\r
\r
              SELECT\r
                  day AS category,\r
                  COUNT(*) AS count,\r
                  ROUND(SUM(total_bill), 2) AS totalSales,\r
                  ROUND(AVG(tip), 2) AS avgTip,\r
                  ROUND(100.0 * AVG(tip / total_bill), 1) AS avgTipRate\r
              FROM tips\r
              GROUP BY day\r
          )\r
          SELECT\r
              category,\r
              count,\r
              totalSales,\r
              avgTip,\r
              avgTipRate,\r
              ROUND(100.0 * totalSales / (SELECT SUM(total_bill) FROM tips), 1) AS salesShare\r
          FROM summary\r
          ORDER BY\r
              CASE WHEN category = '전체' THEN 0 ELSE 1 END,\r
              totalSales DESC\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 13단계. 최종 파이프라인의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 13단계. 최종 파이프라인 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 심화 미션\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    모든 개념을 종합하여 복합 분석 쿼리를 작성해봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    import duckdb\r
    data = pd.DataFrame({\r
        "total_bill": [16.99, 24.59, 32.40, 10.34, 40.17, 21.01, 18.78, 29.85],\r
        "tip": [1.01, 3.61, 5.15, 1.66, 6.50, 3.50, 2.00, 4.20],\r
        "sex": ["Female", "Male", "Male", "Female", "Male", "Female", "Female", "Male"],\r
        "smoker": ["No", "No", "Yes", "No", "Yes", "No", "Yes", "No"],\r
        "day": ["Sun", "Sat", "Sat", "Thur", "Sun", "Fri", "Thur", "Sat"],\r
        "time": ["Dinner", "Dinner", "Dinner", "Lunch", "Dinner", "Lunch", "Lunch", "Dinner"],\r
        "size": [2, 4, 3, 2, 5, 2, 2, 3],\r
    })\r
    tbl1 = duckdb.from_df(data)\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import duckdb\r
      data = pd.DataFrame({\r
          "total_bill": [16.99, 24.59, 32.40, 10.34, 40.17, 21.01, 18.78, 29.85],\r
          "tip": [1.01, 3.61, 5.15, 1.66, 6.50, 3.50, 2.00, 4.20],\r
          "sex": ["Female", "Male", "Male", "Female", "Male", "Female", "Female", "Male"],\r
          "smoker": ["No", "No", "Yes", "No", "Yes", "No", "Yes", "No"],\r
          "day": ["Sun", "Sat", "Sat", "Thur", "Sun", "Fri", "Thur", "Sat"],\r
          "time": ["Dinner", "Dinner", "Dinner", "Lunch", "Dinner", "Lunch", "Lunch", "Dinner"],\r
          "size": [2, 4, 3, 2, 5, 2, 2, 3],\r
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
    content: tips와 titanic 데이터로 DuckDB의 모든 개념을 종합한 분석 파이프라인을 완성했습니다!\r
  - type: list\r
    items:\r
    - 'CTE: WITH 절로 쿼리 구조화, 다중 CTE 연결'\r
    - '윈도우 함수: ROW_NUMBER, RANK, LAG로 순위와 비교'\r
    - '서브쿼리: 중첩 쿼리로 동적 필터링'\r
    - 'CASE WHEN: 조건부 분류와 세그먼트 생성'\r
    - 'GROUP BY + HAVING: 집계와 집계 후 필터'\r
    - '문자열 함수: SPLIT_PART, TRIM으로 텍스트 가공'\r
  - type: text\r
    content: 10개 프로젝트를 완료하며 DuckDB SQL의 핵심 개념을 모두 마스터했습니다. 이제 어떤 데이터든 효과적으로 분석할 수 있습니다!\r
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