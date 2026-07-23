var e=`meta:\r
  packages:\r
  - duckdb\r
  - pandas\r
  id: duckdb_04\r
  title: 타이타닉심층분석\r
  order: 4\r
  category: duckdb\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - titanic\r
  - HAVING\r
  - 'NULL'\r
  - GROUP BY\r
  - 집계\r
  seo:\r
    title: DuckDB HAVING과 NULL 처리 - 타이타닉 심층 분석\r
    description: 타이타닉 데이터로 복합 조건 집계와 필터링을 학습합니다. HAVING, IS NULL, IS NOT NULL 사용법을 배웁니다.\r
    keywords:\r
    - DuckDB\r
    - HAVING\r
    - IS NULL\r
    - GROUP BY\r
    - 타이타닉\r
    - SQL 집계\r
intro:\r
  emoji: 🚢\r
  goal: 타이타닉 승객 데이터로 복합 조건 집계와 NULL 처리를 마스터합니다.\r
  description: GROUP BY로 그룹화한 결과를 HAVING으로 필터링하고, NULL 값을 올바르게 처리하는 방법을 배웁니다.\r
  direction: 타이타닉심층분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.\r
  - 타이타닉심층분석 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. NULL 값 확인 처리 실행\r
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. IS NULL로 필터 결과 검증\r
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.\r
    - label: 타이타닉심층분석 재사용\r
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: SQL 분석 환경\r
      detail: duckdb, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 타이타닉심층분석 실행\r
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.\r
    - label: 타이타닉심층분석 완료\r
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 타이타닉 데이터 준비\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 180명의 로컬 타이타닉 승객 샘플을 불러옵니다. 이번 프로젝트에서는 HAVING과 NULL 처리라는 두 가지 핵심 개념을 배웁니다. HAVING은 GROUP\r
    BY 결과를 필터링할 때 사용하고, NULL 처리는 실무 데이터에서 필수적인 결측값 처리 기법입니다. survived, pclass, sex, age, fare 등의 컬럼을 활용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import duckdb\r
\r
    df = loadLocalDataset("titanic")\r
    titanic = duckdb.from_df(df)\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import duckdb\r
\r
      df = loadLocalDataset("titanic")\r
      titanic = duckdb.from_df(df)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 데이터 불러오기의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step2_null_check\r
  title: 2단계. NULL 값 확인\r
  structuredPrimary: true\r
  subtitle: 결측값 탐색\r
  goal: 2단계. NULL 값 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: age 컬럼에 NULL 값이 있는지 확인합니다. 실제 데이터에서 결측값(NULL)은 매우 흔하며, 데이터 품질을 평가하는 첫 번째 단계입니다. COUNT(*)는\r
    모든 행을 세고, COUNT(age)는 NULL을 제외한 행만 셉니다. 로컬 titanic 샘플에서는 age가 모두 채워져 있어 두 값이 같습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            COUNT(*) AS totalCount,\r
            COUNT(age) AS ageNotNull,\r
            COUNT(*) - COUNT(age) AS ageNull\r
        FROM titanic\r
    """).show()\r
  exercise:\r
    prompt: 2단계. NULL 값 확인 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              COUNT(*) AS totalCount,\r
              COUNT(age) AS ageNotNull,\r
              COUNT(*) - COUNT(age) AS ageNull\r
          FROM titanic\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. NULL 값 확인의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 2단계. NULL 값 확인 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step3_is_null\r
  title: 3단계. IS NULL로 필터링\r
  structuredPrimary: true\r
  subtitle: NULL 값만 선택\r
  goal: 3단계. IS NULL로 필터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    IS NULL로 age가 없는 승객만 조회합니다. 로컬 titanic 샘플에서는 age 결측이 없어 결과가 비어 있을 수 있습니다. =로는 NULL을 비교할 수 없습니다. NULL은 '알 수 없는 값'이므로 age = NULL은 항상 FALSE를 반환합니다. 반드시 IS NULL 구문을 사용해야 합니다.\r
\r
    NULL은 '알 수 없음'을 의미합니다. age = NULL은 동작하지 않습니다. 반드시 IS NULL 또는 IS NOT NULL을 사용하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT pclass, sex, fare, embarked\r
        FROM titanic\r
        WHERE age IS NULL\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 3단계. IS NULL로 필터링 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT pclass, sex, fare, embarked\r
          FROM titanic\r
          WHERE age IS NULL\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. IS NULL로 필터링의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 3단계. IS NULL로 필터링 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step4_is_not_null\r
  title: 4단계. IS NOT NULL로 필터링\r
  structuredPrimary: true\r
  subtitle: NULL 제외\r
  goal: 4단계. IS NOT NULL로 필터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: IS NOT NULL로 age가 있는 승객만 조회합니다. 분석에서 결측값을 제외할 때 사용합니다. 평균, 최댓값 같은 통계 분석에서는 NULL을 제거하지 않으면\r
    왜곡된 결과가 나올 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT pclass, sex, age, fare\r
        FROM titanic\r
        WHERE age IS NOT NULL\r
        ORDER BY age\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 4단계. IS NOT NULL로 필터링 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT pclass, sex, age, fare\r
          FROM titanic\r
          WHERE age IS NOT NULL\r
          ORDER BY age\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. IS NOT NULL로 필터링의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 4단계. IS NOT NULL로 필터링 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step5_group_avg\r
  title: 5단계. 그룹별 평균 계산\r
  structuredPrimary: true\r
  subtitle: GROUP BY와 AVG\r
  goal: 5단계. 그룹별 평균 계산에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 객실 등급(pclass)별 평균 나이와 평균 요금을 계산합니다. GROUP BY pclass로 등급별로 묶은 후 AVG 함수로 평균을 구합니다. WHERE\r
    age IS NOT NULL로 나이 정보가 있는 승객만 포함시켜 정확한 통계를 얻습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            COUNT(*) AS passengerCount,\r
            ROUND(AVG(age), 1) AS avgAge,\r
            ROUND(AVG(fare), 2) AS avgFare\r
        FROM titanic\r
        WHERE age IS NOT NULL\r
        GROUP BY pclass\r
        ORDER BY pclass\r
    """).show()\r
  exercise:\r
    prompt: 5단계. 그룹별 평균 계산 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              COUNT(*) AS passengerCount,\r
              ROUND(AVG(age), 1) AS avgAge,\r
              ROUND(AVG(fare), 2) AS avgFare\r
          FROM titanic\r
          WHERE age IS NOT NULL\r
          GROUP BY pclass\r
          ORDER BY pclass\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 그룹별 평균 계산의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 5단계. 그룹별 평균 계산 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step6_having_intro\r
  title: 6단계. HAVING 소개\r
  structuredPrimary: true\r
  subtitle: 그룹 필터링\r
  goal: 6단계. HAVING 소개에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    HAVING은 GROUP BY 결과를 필터링합니다. WHERE가 개별 행을 필터링한다면, HAVING은 그룹을 필터링합니다.\r
\r
    HAVING은 GROUP BY 이후에 실행됩니다. WHERE는 그룹화 전, HAVING은 그룹화 후 필터링입니다. 집계 함수 결과로 필터링할 때는 HAVING을 사용하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            sex,\r
            COUNT(*) AS passengerCount,\r
            ROUND(AVG(fare), 2) AS avgFare\r
        FROM titanic\r
        GROUP BY pclass, sex\r
        HAVING COUNT(*) >= 50\r
        ORDER BY avgFare DESC\r
    """).show()\r
  exercise:\r
    prompt: 6단계. HAVING 소개 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              sex,\r
              COUNT(*) AS passengerCount,\r
              ROUND(AVG(fare), 2) AS avgFare\r
          FROM titanic\r
          GROUP BY pclass, sex\r
          HAVING COUNT(*) >= 50\r
          ORDER BY avgFare DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. HAVING 소개의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 6단계. HAVING 소개 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step7_having_avg\r
  title: 7단계. 평균값으로 필터링\r
  structuredPrimary: true\r
  subtitle: HAVING과 AVG\r
  goal: 7단계. 평균값으로 필터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 평균 요금이 30달러 이상인 그룹만 조회합니다. HAVING은 GROUP BY 이후 집계 결과로 필터링할 때 사용합니다. WHERE는 행 단위 필터이고, HAVING은\r
    그룹 단위 필터입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            embarked,\r
            COUNT(*) AS passengerCount,\r
            ROUND(AVG(fare), 2) AS avgFare\r
        FROM titanic\r
        WHERE embarked IS NOT NULL\r
        GROUP BY pclass, embarked\r
        HAVING AVG(fare) >= 30\r
        ORDER BY avgFare DESC\r
    """).show()\r
  exercise:\r
    prompt: 7단계. 평균값으로 필터링 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              embarked,\r
              COUNT(*) AS passengerCount,\r
              ROUND(AVG(fare), 2) AS avgFare\r
          FROM titanic\r
          WHERE embarked IS NOT NULL\r
          GROUP BY pclass, embarked\r
          HAVING AVG(fare) >= 30\r
          ORDER BY avgFare DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 평균값으로 필터링의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 7단계. 평균값으로 필터링 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step8_survival_analysis\r
  title: 8단계. 생존율 분석\r
  structuredPrimary: true\r
  subtitle: CASE WHEN과 AVG\r
  goal: 8단계. 생존율 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: survived는 1(생존) 또는 0(사망)입니다. AVG(survived)로 생존율을 계산합니다. 0과 1의 평균은 1의 비율과 같으므로, AVG(survived)에\r
    100을 곱하면 퍼센트 생존율이 됩니다. 이 트릭은 이진 데이터의 비율 계산에 자주 사용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            sex,\r
            COUNT(*) AS totalCount,\r
            SUM(survived) AS survivedCount,\r
            ROUND(AVG(survived) * 100, 1) AS survivalRate\r
        FROM titanic\r
        GROUP BY pclass, sex\r
        ORDER BY survivalRate DESC\r
    """).show()\r
  exercise:\r
    prompt: 8단계. 생존율 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              sex,\r
              COUNT(*) AS totalCount,\r
              SUM(survived) AS survivedCount,\r
              ROUND(AVG(survived) * 100, 1) AS survivalRate\r
          FROM titanic\r
          GROUP BY pclass, sex\r
          ORDER BY survivalRate DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 생존율 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 8단계. 생존율 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step9_in_filter\r
  title: 9단계. IN으로 다중 조건\r
  structuredPrimary: true\r
  subtitle: 특정 값들 선택\r
  goal: 9단계. IN으로 다중 조건에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: IN을 사용해 특정 탑승지(embarked)만 분석합니다. S(Southampton), C(Cherbourg)에서 탑승한 승객만 조회합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            embarked,\r
            pclass,\r
            COUNT(*) AS passengerCount,\r
            ROUND(AVG(fare), 2) AS avgFare,\r
            ROUND(AVG(survived) * 100, 1) AS survivalRate\r
        FROM titanic\r
        WHERE embarked IN ('S', 'C')\r
        GROUP BY embarked, pclass\r
        ORDER BY embarked, pclass\r
    """).show()\r
  exercise:\r
    prompt: 9단계. IN으로 다중 조건 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              embarked,\r
              pclass,\r
              COUNT(*) AS passengerCount,\r
              ROUND(AVG(fare), 2) AS avgFare,\r
              ROUND(AVG(survived) * 100, 1) AS survivalRate\r
          FROM titanic\r
          WHERE embarked IN ('S', 'C')\r
          GROUP BY embarked, pclass\r
          ORDER BY embarked, pclass\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. IN으로 다중 조건의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 9단계. IN으로 다중 조건 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step10_complex_having\r
  title: 10단계. 복합 HAVING 조건\r
  structuredPrimary: true\r
  subtitle: AND로 다중 조건\r
  goal: 10단계. 복합 HAVING 조건에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: HAVING에 AND를 사용해 여러 조건을 동시에 적용합니다. 승객 수 30명 이상이면서 생존율 50% 이상인 그룹을 찾습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            sex,\r
            embarked,\r
            COUNT(*) AS passengerCount,\r
            ROUND(AVG(survived) * 100, 1) AS survivalRate\r
        FROM titanic\r
        WHERE age IS NOT NULL AND embarked IS NOT NULL\r
        GROUP BY pclass, sex, embarked\r
        HAVING COUNT(*) >= 30 AND AVG(survived) >= 0.5\r
        ORDER BY survivalRate DESC\r
    """).show()\r
  exercise:\r
    prompt: 10단계. 복합 HAVING 조건 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              sex,\r
              embarked,\r
              COUNT(*) AS passengerCount,\r
              ROUND(AVG(survived) * 100, 1) AS survivalRate\r
          FROM titanic\r
          WHERE age IS NOT NULL AND embarked IS NOT NULL\r
          GROUP BY pclass, sex, embarked\r
          HAVING COUNT(*) >= 30 AND AVG(survived) >= 0.5\r
          ORDER BY survivalRate DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 복합 HAVING 조건의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 10단계. 복합 HAVING 조건 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step11_case_category\r
  title: 11단계. CASE로 카테고리 생성\r
  structuredPrimary: true\r
  subtitle: 나이 그룹 분류\r
  goal: 11단계. CASE로 카테고리 생성에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: CASE WHEN으로 나이를 그룹화하고, 그룹별 생존율을 분석합니다. 연속형 변수인 나이를 범주형으로 변환하면 패턴을 파악하기 쉬워집니다. 미성년자, 성인,\r
    노인 그룹의 생존율 차이를 명확히 비교할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            CASE\r
                WHEN age < 18 THEN '미성년자'\r
                WHEN age < 60 THEN '성인'\r
                ELSE '노인'\r
            END AS ageGroup,\r
            COUNT(*) AS passengerCount,\r
            SUM(survived) AS survivedCount,\r
            ROUND(AVG(survived) * 100, 1) AS survivalRate\r
        FROM titanic\r
        WHERE age IS NOT NULL\r
        GROUP BY ageGroup\r
        ORDER BY survivalRate DESC\r
    """).show()\r
  exercise:\r
    prompt: 11단계. CASE로 카테고리 생성 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              CASE\r
                  WHEN age < 18 THEN '미성년자'\r
                  WHEN age < 60 THEN '성인'\r
                  ELSE '노인'\r
              END AS ageGroup,\r
              COUNT(*) AS passengerCount,\r
              SUM(survived) AS survivedCount,\r
              ROUND(AVG(survived) * 100, 1) AS survivalRate\r
          FROM titanic\r
          WHERE age IS NOT NULL\r
          GROUP BY ageGroup\r
          ORDER BY survivalRate DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. CASE로 카테고리 생성의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 11단계. CASE로 카테고리 생성 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step12_final\r
  title: 12단계. 종합 분석\r
  structuredPrimary: true\r
  subtitle: 모든 개념 활용\r
  goal: 12단계. 종합 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 IS NOT NULL, GROUP BY, HAVING, CASE WHEN, IN을 모두 활용한 종합 분석입니다. 객실 등급, 연령대, 성별 세\r
    가지 기준으로 다중 그룹화하고, 결측치를 제외하며, 충분한 표본(10명 이상)이 있는 그룹만 필터링합니다. 이런 복합 조건 분석을 통해 타이타닉 생존의 핵심 패턴을 도출할 수\r
    있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            CASE\r
                WHEN age < 18 THEN '미성년자'\r
                WHEN age < 60 THEN '성인'\r
                ELSE '노인'\r
            END AS ageGroup,\r
            sex,\r
            COUNT(*) AS passengerCount,\r
            ROUND(AVG(fare), 2) AS avgFare,\r
            ROUND(AVG(survived) * 100, 1) AS survivalRate\r
        FROM titanic\r
        WHERE age IS NOT NULL AND embarked IN ('S', 'C', 'Q')\r
        GROUP BY pclass, ageGroup, sex\r
        HAVING COUNT(*) >= 10\r
        ORDER BY survivalRate DESC, passengerCount DESC\r
    """).show()\r
  exercise:\r
    prompt: 12단계. 종합 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              CASE\r
                  WHEN age < 18 THEN '미성년자'\r
                  WHEN age < 60 THEN '성인'\r
                  ELSE '노인'\r
              END AS ageGroup,\r
              sex,\r
              COUNT(*) AS passengerCount,\r
              ROUND(AVG(fare), 2) AS avgFare,\r
              ROUND(AVG(survived) * 100, 1) AS survivalRate\r
          FROM titanic\r
          WHERE age IS NOT NULL AND embarked IN ('S', 'C', 'Q')\r
          GROUP BY pclass, ageGroup, sex\r
          HAVING COUNT(*) >= 10\r
          ORDER BY survivalRate DESC, passengerCount DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 12단계. 종합 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 12단계. 종합 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 타이타닉 심층 분석 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    HAVING과 NULL 처리, CASE WHEN, IN 연산자를 활용해 타이타닉 데이터를 분석합니다. 실무에서는 결측치 처리와 그룹 필터링이 필수적이며, 이 미션을 통해 이러한 패턴을 연습합니다.\r
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
    content: 복합 조건 집계와 NULL 처리를 마스터했습니다.\r
  - type: list\r
    items:\r
    - IS NULL - NULL 값인 행 선택\r
    - IS NOT NULL - NULL이 아닌 행 선택\r
    - HAVING - GROUP BY 결과 필터링\r
    - HAVING COUNT(*) >= n - 행 수 조건\r
    - HAVING AVG(col) >= n - 평균값 조건\r
    - WHERE vs HAVING - 행 필터 vs 그룹 필터\r
  - type: text\r
    content: 다음 시간에는 서브쿼리를 활용한 고급 필터링을 배웁니다.\r
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