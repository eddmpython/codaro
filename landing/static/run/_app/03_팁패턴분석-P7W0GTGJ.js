var e=`meta:\r
  packages:\r
  - duckdb\r
  - pandas\r
  id: duckdb_03\r
  title: 팁패턴분석\r
  order: 3\r
  category: duckdb\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - tips\r
  - CASE WHEN\r
  - ORDER BY\r
  - GROUP BY\r
  - 조건분류\r
  seo:\r
    title: DuckDB CASE WHEN 조건분류 - 팁 패턴 분석\r
    description: 레스토랑 팁 데이터로 조건부 분류를 학습합니다. CASE WHEN으로 팁 등급을 나누고 ORDER BY로 다중 정렬을 수행합니다.\r
    keywords:\r
    - DuckDB CASE WHEN\r
    - ORDER BY\r
    - GROUP BY\r
    - 팁 분석\r
    - 조건부 분류\r
intro:\r
  emoji: 💵\r
  goal: 팁을 등급(낮음/중간/높음)으로 분류하고 요일/시간별 패턴을 분석합니다.\r
  description: CASE WHEN으로 조건부 값을 만들고, 복합 정렬로 데이터를 정리합니다. 이전에 배운 GROUP BY, AVG, ROUND를 함께 활용합니다.\r
  direction: 팁패턴분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.\r
  - 팁패턴분석 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 팁 분포 확인 처리 실행\r
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 팁 등급 분류 결과 검증\r
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.\r
    - label: 팁패턴분석 재사용\r
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: SQL 분석 환경\r
      detail: duckdb, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 팁패턴분석 실행\r
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.\r
    - label: 팁패턴분석 완료\r
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: tips 데이터 준비\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 레스토랑 팁 데이터를 DuckDB에 로드합니다. tips 데이터셋은 고객의 결제 금액, 팁, 요일, 시간대, 파티 크기 등의 정보를 담고 있습니다. 이 데이터로\r
    팁 패턴을 분석하여 매출 증대 인사이트를 얻을 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import duckdb\r
\r
    df = loadLocalDataset("tips")\r
    tips = duckdb.from_df(df)\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import duckdb\r
\r
      df = loadLocalDataset("tips")\r
      tips = duckdb.from_df(df)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 데이터 불러오기의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step2_explore\r
  title: 2단계. 팁 분포 확인\r
  structuredPrimary: true\r
  subtitle: 팁 통계 보기\r
  goal: 2단계. 팁 분포 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 팁의 최소, 최대, 평균을 확인하여 등급 기준을 설정합니다. MIN, MAX, AVG 함수로 데이터의 범위와 중심 경향을 파악하면 어떤 기준으로 low/mid/high를\r
    나눌지 합리적으로 결정할 수 있습니다. 탐색적 분석의 첫 단계로 데이터의 전체적인 분포를 이해하는 것이 중요합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            MIN(tip) AS minTip,\r
            MAX(tip) AS maxTip,\r
            ROUND(AVG(tip), 2) AS avgTip\r
        FROM tips\r
    """)\r
  exercise:\r
    prompt: 2단계. 팁 분포 확인 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              MIN(tip) AS minTip,\r
              MAX(tip) AS maxTip,\r
              ROUND(AVG(tip), 2) AS avgTip\r
          FROM tips\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 팁 분포 확인의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 2단계. 팁 분포 확인 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step3_case_when\r
  title: 3단계. 팁 등급 분류\r
  structuredPrimary: true\r
  subtitle: CASE WHEN 사용\r
  goal: 3단계. 팁 등급 분류에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    CASE WHEN 구문으로 팁을 3등급(low/mid/high)으로 분류합니다. SQL에서 조건부 값을 생성하는 가장 강력한 도구로, 복잡한 비즈니스 로직을 쿼리 안에서 처리할 수 있습니다. 2달러 미만은 low, 4달러 이상은 high, 그 사이는 mid로 분류하여 고객 세그먼트를 만듭니다.\r
\r
    CASE WHEN 조건 THEN 값 ELSE 기본값 END 형태로 조건부 값을 만듭니다. 여러 조건은 WHEN을 추가합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            total_bill,\r
            tip,\r
            CASE\r
                WHEN tip < 2 THEN 'low'\r
                WHEN tip >= 4 THEN 'high'\r
                ELSE 'mid'\r
            END AS tipLevel\r
        FROM tips\r
        LIMIT 10\r
    """)\r
  exercise:\r
    prompt: 3단계. 팁 등급 분류 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              total_bill,\r
              tip,\r
              CASE\r
                  WHEN tip < 2 THEN 'low'\r
                  WHEN tip >= 4 THEN 'high'\r
                  ELSE 'mid'\r
              END AS tipLevel\r
          FROM tips\r
          LIMIT 10\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 팁 등급 분류의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 3단계. 팁 등급 분류 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step4_count_level\r
  title: 4단계. 등급별 건수\r
  structuredPrimary: true\r
  subtitle: 그룹화 집계\r
  goal: 4단계. 등급별 건수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 각 등급에 몇 건이 있는지 세어봅니다. COUNT(*)로 등급별 건수를 집계하면 팁 분포를 한눈에 파악할 수 있습니다. 이를 통해 어떤 등급의 고객이 가장\r
    많은지, 등급 불균형이 있는지 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            CASE\r
                WHEN tip < 2 THEN 'low'\r
                WHEN tip >= 4 THEN 'high'\r
                ELSE 'mid'\r
            END AS tipLevel,\r
            COUNT(*) AS cnt\r
        FROM tips\r
        GROUP BY tipLevel\r
    """)\r
  exercise:\r
    prompt: 4단계. 등급별 건수 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              CASE\r
                  WHEN tip < 2 THEN 'low'\r
                  WHEN tip >= 4 THEN 'high'\r
                  ELSE 'mid'\r
              END AS tipLevel,\r
              COUNT(*) AS cnt\r
          FROM tips\r
          GROUP BY tipLevel\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 등급별 건수의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 4단계. 등급별 건수 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step5_order_single\r
  title: 5단계. 단일 정렬\r
  structuredPrimary: true\r
  subtitle: ORDER BY 기본\r
  goal: 5단계. 단일 정렬에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 팁이 높은 순서대로 정렬합니다. ORDER BY tip DESC를 사용하면 가장 후한 팁을 준 고객부터 확인할 수 있습니다. 내림차순(DESC) 정렬로 최댓값을\r
    먼저 보여줍니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT total_bill, tip, day, time\r
        FROM tips\r
        ORDER BY tip DESC\r
        LIMIT 10\r
    """)\r
  exercise:\r
    prompt: 5단계. 단일 정렬 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT total_bill, tip, day, time\r
          FROM tips\r
          ORDER BY tip DESC\r
          LIMIT 10\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 단일 정렬의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 5단계. 단일 정렬 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step6_order_multi\r
  title: 6단계. 다중 정렬\r
  structuredPrimary: true\r
  subtitle: 여러 기준 정렬\r
  goal: 6단계. 다중 정렬에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    다중 컬럼 정렬로 데이터를 더 세밀하게 정리합니다. 먼저 요일로 정렬한 후 같은 요일 내에서 팁이 높은 순으로 정렬하면 요일별로 그룹화된 상태에서 최고 팁을 쉽게 찾을 수 있습니다. 실무에서 리포트 작성 시 이런 다중 정렬이 자주 사용됩니다.\r
\r
    ORDER BY col1, col2 DESC는 col1 오름차순 후 col2 내림차순입니다. 각 컬럼마다 ASC/DESC를 지정할 수 있습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT day, time, total_bill, tip\r
        FROM tips\r
        ORDER BY day, tip DESC\r
        LIMIT 15\r
    """)\r
  exercise:\r
    prompt: 6단계. 다중 정렬 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT day, time, total_bill, tip\r
          FROM tips\r
          ORDER BY day, tip DESC\r
          LIMIT 15\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 다중 정렬의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 6단계. 다중 정렬 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step7_day_avg\r
  title: 7단계. 요일별 평균 팁\r
  structuredPrimary: true\r
  subtitle: 요일 패턴 분석\r
  goal: 7단계. 요일별 평균 팁에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 요일별로 평균 팁을 구하고 높은 순으로 정렬합니다. GROUP BY day로 요일별로 묶은 후 AVG(tip)으로 평균을 계산합니다. 어느 요일에 팁이 가장\r
    많이 나오는지 파악하여 마케팅 전략을 수립할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            ROUND(AVG(tip), 2) AS avgTip,\r
            COUNT(*) AS cnt\r
        FROM tips\r
        GROUP BY day\r
        ORDER BY avgTip DESC\r
    """)\r
  exercise:\r
    prompt: 7단계. 요일별 평균 팁 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              ROUND(AVG(tip), 2) AS avgTip,\r
              COUNT(*) AS cnt\r
          FROM tips\r
          GROUP BY day\r
          ORDER BY avgTip DESC\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 요일별 평균 팁의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 7단계. 요일별 평균 팁 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step8_time_pattern\r
  title: 8단계. 시간대별 패턴\r
  structuredPrimary: true\r
  subtitle: 점심 vs 저녁\r
  goal: 8단계. 시간대별 패턴에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 점심과 저녁 시간대별 팁 패턴을 비교합니다. time 컬럼으로 그룹화하면 Lunch와 Dinner의 평균 팁과 결제 금액을 비교할 수 있습니다. 이를 통해\r
    시간대별 매출 특성과 고객 성향을 파악합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            time,\r
            ROUND(AVG(tip), 2) AS avgTip,\r
            ROUND(AVG(total_bill), 2) AS avgBill,\r
            COUNT(*) AS cnt\r
        FROM tips\r
        GROUP BY time\r
        ORDER BY avgTip DESC\r
    """)\r
  exercise:\r
    prompt: 8단계. 시간대별 패턴 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              time,\r
              ROUND(AVG(tip), 2) AS avgTip,\r
              ROUND(AVG(total_bill), 2) AS avgBill,\r
              COUNT(*) AS cnt\r
          FROM tips\r
          GROUP BY time\r
          ORDER BY avgTip DESC\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 시간대별 패턴의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 8단계. 시간대별 패턴 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step9_day_time\r
  title: 9단계. 요일+시간대 분석\r
  structuredPrimary: true\r
  subtitle: 이중 그룹화\r
  goal: 9단계. 요일+시간대 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 요일과 시간대를 함께 고려해 더 세밀하게 분석합니다. GROUP BY day, time으로 다중 그룹화하면 '목요일 저녁', '토요일 점심' 같은 세부 패턴을\r
    발견할 수 있습니다. 이는 요일만, 시간대만 본 것보다 훨씬 정교한 인사이트를 제공합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            time,\r
            ROUND(AVG(tip), 2) AS avgTip,\r
            COUNT(*) AS cnt\r
        FROM tips\r
        GROUP BY day, time\r
        ORDER BY day, avgTip DESC\r
    """)\r
  exercise:\r
    prompt: 9단계. 요일+시간대 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              time,\r
              ROUND(AVG(tip), 2) AS avgTip,\r
              COUNT(*) AS cnt\r
          FROM tips\r
          GROUP BY day, time\r
          ORDER BY day, avgTip DESC\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 요일+시간대 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 9단계. 요일+시간대 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step10_level_pattern\r
  title: 10단계. 등급별 요일 패턴\r
  structuredPrimary: true\r
  subtitle: 종합 분석\r
  goal: 10단계. 등급별 요일 패턴에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 팁 등급별로 어느 요일에 많이 나오는지 분석합니다. CASE WHEN으로 만든 등급과 요일을 함께 그룹화하면 '높은 팁은 주말에 많다' 같은 패턴을 발견할\r
    수 있습니다. 등급별 평균 결제 금액도 함께 보면 고객 세그먼트를 이해하는 데 도움이 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            CASE\r
                WHEN tip < 2 THEN 'low'\r
                WHEN tip >= 4 THEN 'high'\r
                ELSE 'mid'\r
            END AS tipLevel,\r
            day,\r
            COUNT(*) AS cnt,\r
            ROUND(AVG(total_bill), 2) AS avgBill\r
        FROM tips\r
        GROUP BY tipLevel, day\r
        ORDER BY tipLevel, cnt DESC\r
    """)\r
  exercise:\r
    prompt: 10단계. 등급별 요일 패턴 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              CASE\r
                  WHEN tip < 2 THEN 'low'\r
                  WHEN tip >= 4 THEN 'high'\r
                  ELSE 'mid'\r
              END AS tipLevel,\r
              day,\r
              COUNT(*) AS cnt,\r
              ROUND(AVG(total_bill), 2) AS avgBill\r
          FROM tips\r
          GROUP BY tipLevel, day\r
          ORDER BY tipLevel, cnt DESC\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 등급별 요일 패턴의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 10단계. 등급별 요일 패턴 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step11_final\r
  title: 11단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 팁 패턴 종합 리포트\r
  goal: 11단계. 최종 결과물에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 요일/시간대별로 팁 등급 분포와 평균을 보여주는 종합 리포트입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            time,\r
            ROUND(AVG(tip), 2) AS avgTip,\r
            ROUND(AVG(total_bill), 2) AS avgBill,\r
            SUM(CASE WHEN tip < 2 THEN 1 ELSE 0 END) AS lowCnt,\r
            SUM(CASE WHEN tip >= 2 AND tip < 4 THEN 1 ELSE 0 END) AS midCnt,\r
            SUM(CASE WHEN tip >= 4 THEN 1 ELSE 0 END) AS highCnt,\r
            COUNT(*) AS totalCnt\r
        FROM tips\r
        GROUP BY day, time\r
        ORDER BY day, time\r
    """)\r
  exercise:\r
    prompt: 11단계. 최종 결과물 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              time,\r
              ROUND(AVG(tip), 2) AS avgTip,\r
              ROUND(AVG(total_bill), 2) AS avgBill,\r
              SUM(CASE WHEN tip < 2 THEN 1 ELSE 0 END) AS lowCnt,\r
              SUM(CASE WHEN tip >= 2 AND tip < 4 THEN 1 ELSE 0 END) AS midCnt,\r
              SUM(CASE WHEN tip >= 4 THEN 1 ELSE 0 END) AS highCnt,\r
              COUNT(*) AS totalCnt\r
          FROM tips\r
          GROUP BY day, time\r
          ORDER BY day, time\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 최종 결과물의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 11단계. 최종 결과물 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: workflow_validation\r
  title: 12단계. 실무 CASE 리포트 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → SQL 오류 확인 → 집계 검증 → 기준 실험\r
  goal: 12단계. 실무 CASE 리포트 검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: CASE WHEN 리포트는 결과 표가 그럴듯해 보여도 분류 기준이 빠지거나 행 수가 틀어질 수 있습니다. 실무에서는 쿼리 오류를 명확히 잡고, 등급별 합계가\r
    전체 건수와 맞는지 검증해야 합니다. 이번 단계에서는 팁 비율이 가장 높은 요일·시간대를 먼저 예상하고, 잘못된 컬럼명을 쓴 SQL을 일부러 실패시킵니다. 그다음 CASE WHEN\r
    리포트의 행 수와 등급 합계를 검증하고, high 기준을 바꿔 세그먼트가 어떻게 줄어드는지 실험합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    workflowCon = duckdb.connect()\r
    workflowCon.register("tipsWorkflow", df)\r
\r
    tipRatePrediction = workflowCon.sql("""\r
        SELECT\r
            day,\r
            time,\r
            ROUND(AVG(tip / total_bill), 4) AS avgTipRate,\r
            COUNT(*) AS cnt\r
        FROM tipsWorkflow\r
        GROUP BY day, time\r
        ORDER BY avgTipRate DESC\r
    """).df()\r
\r
    predictedBestSegment = tipRatePrediction.iloc[0]\r
    print(\r
        "예상 최고 팁 비율:",\r
        predictedBestSegment["day"],\r
        predictedBestSegment["time"],\r
        predictedBestSegment["avgTipRate"],\r
    )\r
  exercise:\r
    prompt: 12단계. 실무 CASE 리포트 검증 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      workflowCon = duckdb.connect()\r
      workflowCon.register("tipsWorkflow", df)\r
\r
      tipRatePrediction = workflowCon.sql("""\r
          SELECT\r
              day,\r
              time,\r
              ROUND(AVG(tip / total_bill), 4) AS avgTipRate,\r
              COUNT(*) AS cnt\r
          FROM tipsWorkflow\r
          GROUP BY day, time\r
          ORDER BY avgTipRate DESC\r
      """).df()\r
\r
      predictedBestSegment = tipRatePrediction.iloc[0]\r
      print(\r
          "예상 최고 팁 비율:",\r
          predictedBestSegment["day"],\r
          predictedBestSegment["time"],\r
          predictedBestSegment["avgTipRate"],\r
      )\r
    hints:\r
    - 바꿀 지점은 SELECT 컬럼, WHERE 비교값, GROUP BY/HAVING 기준입니다.\r
    - 실행 뒤 결과 행 수, 컬럼명, 집계값이 바꾼 쿼리 조건과 맞는지 보세요.\r
  check:\r
    noError: 12단계. 실무 CASE 리포트 검증의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 12단계. 실무 CASE 리포트 검증 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 팁 패턴 분석 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    CASE WHEN과 ORDER BY를 활용해 팁 데이터를 분석합니다. 조건부 분류로 복잡한 비즈니스 로직을 구현하고, 정렬로 우선순위를 명확히 합니다. 이 두 개념을 마스터하면 실무에서 대부분의 데이터 분류와 정렬 요구사항을 처리할 수 있습니다.\r
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
    content: 조건부 분류와 복합 정렬을 마스터했습니다.\r
  - type: list\r
    items:\r
    - CASE WHEN 조건 THEN 값 ELSE 기본값 END - 조건부 값 생성\r
    - ORDER BY col1, col2 DESC - 다중 컬럼 정렬\r
    - GROUP BY + CASE WHEN - 조건부 집계\r
    - SUM(CASE WHEN ...) - 조건별 카운트\r
  - type: text\r
    content: 다음 시간에는 WHERE와 HAVING으로 조건 필터링을 배웁니다.\r
  goal: 정리에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
`;export{e as default};