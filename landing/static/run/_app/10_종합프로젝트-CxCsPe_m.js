var e=`meta:
  packages:
  - duckdb
  - pandas
  id: duckdb_10
  title: 종합프로젝트
  order: 10
  category: duckdb
  difficulty: ⭐⭐⭐⭐
  badge: 심화
  tags:
  - tips
  - titanic
  - CTE
  - 윈도우함수
  - 서브쿼리
  - 종합
  seo:
    title: DuckDB 종합 프로젝트 - 실전 분석 파이프라인
    description: tips와 titanic 데이터로 모든 SQL 개념을 종합한 복합 쿼리를 설계합니다. CTE, 윈도우 함수, 서브쿼리까지 총정리합니다.
    keywords:
    - duckdb 종합
    - CTE
    - 윈도우 함수
    - SQL 분석
    - 실전 파이프라인
intro:
  emoji: 🔥
  goal: tips와 titanic 데이터로 "실전 분석 파이프라인"을 완성합니다.
  description: CTE, 윈도우 함수, 서브쿼리, CASE WHEN, GROUP BY, 문자열 함수, JOIN까지 모든 개념을 종합합니다.
  direction: 종합프로젝트에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.
  - 종합프로젝트 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 데이터 불러오기 입력 확인
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 비즈니스 질문 정의 처리 실행
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. CTE로 구조화 결과 검증
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.
    - label: 종합프로젝트 재사용
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.
    runtime:
    - label: SQL 분석 환경
      detail: duckdb, pandas 기준으로 로컬 Python 실행을 준비합니다.
    - label: 종합프로젝트 실행
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.
    - label: 종합프로젝트 완료
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.
sections:
- id: step1_load
  title: 1단계. 데이터 불러오기
  structuredPrimary: true
  subtitle: tips + titanic
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: 두 데이터셋을 불러옵니다. tips는 레스토랑 팁 데이터, titanic은 타이타닉 생존자 데이터입니다. 이 종합 프로젝트에서는 두 데이터로 CTE, 윈도우
    함수, 서브쿼리, CASE WHEN, GROUP BY 등 모든 SQL 개념을 통합하여 실전 분석 파이프라인을 구축합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import pandas as pd
    from codaro.curriculum.localData import loadLocalDataset
    import duckdb

    dfTips = loadLocalDataset("tips")
    dfTitanic = loadLocalDataset("titanic")
    if "name" not in dfTitanic.columns:
        titleCycle = ["Mr.", "Mrs.", "Miss.", "Master.", "Dr.", "Rev."]
        dfTitanic = dfTitanic.copy()
        dfTitanic["name"] = [
            f"Passenger{index:03d}, {titleCycle[index % len(titleCycle)]} Local"
            for index in range(len(dfTitanic))
        ]

    tips = duckdb.from_df(dfTips)
    titanic = duckdb.from_df(dfTitanic)
  exercise:
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import pandas as pd
      from codaro.curriculum.localData import loadLocalDataset
      import duckdb

      dfTips = loadLocalDataset("tips")
      dfTitanic = loadLocalDataset("titanic")
      if "name" not in dfTitanic.columns:
          titleCycle = ["Mr.", "Mrs.", "Miss.", "Master.", "Dr.", "Rev."]
          dfTitanic = dfTitanic.copy()
          dfTitanic["name"] = [
              f"Passenger{index:03d}, {titleCycle[index % len(titleCycle)]} Local"
              for index in range(len(dfTitanic))
          ]

      tips = duckdb.from_df(dfTips)
      titanic = duckdb.from_df(dfTitanic)
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 1단계. 데이터 불러오기의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 1단계. 데이터 불러오기 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step2_business_question
  title: 2단계. 비즈니스 질문 정의
  structuredPrimary: true
  subtitle: 분석 목표 설정
  goal: 2단계. 비즈니스 질문 정의에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: 복잡한 분석은 명확한 질문에서 시작합니다. tips 데이터로 다음을 분석합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        SELECT * FROM tips LIMIT 5
    """)
  exercise:
    prompt: 2단계. 비즈니스 질문 정의 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          SELECT * FROM tips LIMIT 5
      """)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 2단계. 비즈니스 질문 정의의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 2단계. 비즈니스 질문 정의 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step3_cte_basic
  title: 3단계. CTE로 구조화
  structuredPrimary: true
  subtitle: WITH 절 활용
  goal: 3단계. CTE로 구조화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: CTE(Common Table Expression)로 복잡한 쿼리를 단계별로 분리합니다. WITH 절을 사용하면 쿼리를 논리적 단위로 나누어 가독성을 높이고
    재사용할 수 있습니다. 복잡한 비즈니스 로직을 명확하게 표현하는 핵심 기법입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        WITH dailyStats AS (
            SELECT
                day,
                COUNT(*) AS orderCount,
                SUM(total_bill) AS totalSales,
                AVG(tip) AS avgTip
            FROM tips
            GROUP BY day
        )
        SELECT
            day,
            orderCount,
            ROUND(totalSales, 2) AS totalSales,
            ROUND(avgTip, 2) AS avgTip
        FROM dailyStats
        ORDER BY totalSales DESC
    """)
  exercise:
    prompt: 3단계. CTE로 구조화 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          WITH dailyStats AS (
              SELECT
                  day,
                  COUNT(*) AS orderCount,
                  SUM(total_bill) AS totalSales,
                  AVG(tip) AS avgTip
              FROM tips
              GROUP BY day
          )
          SELECT
              day,
              orderCount,
              ROUND(totalSales, 2) AS totalSales,
              ROUND(avgTip, 2) AS avgTip
          FROM dailyStats
          ORDER BY totalSales DESC
      """)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 3단계. CTE로 구조화의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 3단계. CTE로 구조화 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step4_multi_cte
  title: 4단계. 다중 CTE
  structuredPrimary: true
  subtitle: 여러 CTE 연결
  goal: 4단계. 다중 CTE에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: 여러 CTE를 연결하여 단계별로 데이터를 가공합니다. 첫 번째 CTE에서 기본 집계를 하고, 두 번째 CTE에서 순위를 매기는 식으로 파이프라인을 구성합니다.
    각 단계가 명확히 분리되어 디버깅과 유지보수가 쉬워집니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        WITH dailyStats AS (
            SELECT
                day,
                time,
                COUNT(*) AS orderCount,
                SUM(total_bill) AS totalSales
            FROM tips
            GROUP BY day, time
        ),
        ranked AS (
            SELECT
                *,
                RANK() OVER (PARTITION BY time ORDER BY totalSales DESC) AS salesRank
            FROM dailyStats
        )
        SELECT
            day,
            time,
            orderCount,
            ROUND(totalSales, 2) AS totalSales,
            salesRank
        FROM ranked
        WHERE salesRank <= 3
        ORDER BY time, salesRank
    """)
  exercise:
    prompt: 4단계. 다중 CTE 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          WITH dailyStats AS (
              SELECT
                  day,
                  time,
                  COUNT(*) AS orderCount,
                  SUM(total_bill) AS totalSales
              FROM tips
              GROUP BY day, time
          ),
          ranked AS (
              SELECT
                  *,
                  RANK() OVER (PARTITION BY time ORDER BY totalSales DESC) AS salesRank
              FROM dailyStats
          )
          SELECT
              day,
              time,
              orderCount,
              ROUND(totalSales, 2) AS totalSales,
              salesRank
          FROM ranked
          WHERE salesRank <= 3
          ORDER BY time, salesRank
      """)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 4단계. 다중 CTE의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 4단계. 다중 CTE 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step5_window_row_number
  title: 5단계. ROW_NUMBER 활용
  structuredPrimary: true
  subtitle: 순위 번호 부여
  goal: 5단계. ROWNUMBER 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: ROW_NUMBER로 각 그룹 내 순위를 매깁니다. ROW_NUMBER는 같은 값이라도 고유한 번호를 부여하며, PARTITION BY로 그룹을 나누고 ORDER
    BY로 정렬 기준을 정합니다. 각 요일별 팁 상위 3건만 추출하는 등의 분석에 유용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        SELECT
            day,
            total_bill,
            tip,
            ROW_NUMBER() OVER (PARTITION BY day ORDER BY tip DESC) AS tipRank
        FROM tips
        QUALIFY tipRank <= 3
    """)
  exercise:
    prompt: 5단계. ROWNUMBER 활용 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          SELECT
              day,
              total_bill,
              tip,
              ROW_NUMBER() OVER (PARTITION BY day ORDER BY tip DESC) AS tipRank
          FROM tips
          QUALIFY tipRank <= 3
      """)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 5단계. ROWNUMBER 활용의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 5단계. ROWNUMBER 활용 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step6_window_lag
  title: 6단계. LAG 함수
  structuredPrimary: true
  subtitle: 이전 값과 비교
  goal: 6단계. LAG 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: LAG로 이전 행과 비교 분석합니다. titanic 데이터로 나이별 생존율 변화를 봅니다. LAG(컬럼, n)은 n행 앞의 값을 가져오며, 시계열 분석이나
    연속된 그룹 간 차이를 계산할 때 매우 유용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        WITH ageGroup AS (
            SELECT
                CASE
                    WHEN age < 10 THEN '0-9'
                    WHEN age < 20 THEN '10-19'
                    WHEN age < 30 THEN '20-29'
                    WHEN age < 40 THEN '30-39'
                    WHEN age < 50 THEN '40-49'
                    ELSE '50+'
                END AS ageRange,
                survived
            FROM titanic
            WHERE age IS NOT NULL
        ),
        survivalRate AS (
            SELECT
                ageRange,
                COUNT(*) AS total,
                SUM(survived) AS survivors,
                ROUND(100.0 * SUM(survived) / COUNT(*), 1) AS rate
            FROM ageGroup
            GROUP BY ageRange
        )
        SELECT
            ageRange,
            total,
            survivors,
            rate,
            LAG(rate) OVER (ORDER BY ageRange) AS prevRate,
            ROUND(rate - LAG(rate) OVER (ORDER BY ageRange), 1) AS rateDiff
        FROM survivalRate
        ORDER BY ageRange
    """)
  exercise:
    prompt: 6단계. LAG 함수 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          WITH ageGroup AS (
              SELECT
                  CASE
                      WHEN age < 10 THEN '0-9'
                      WHEN age < 20 THEN '10-19'
                      WHEN age < 30 THEN '20-29'
                      WHEN age < 40 THEN '30-39'
                      WHEN age < 50 THEN '40-49'
                      ELSE '50+'
                  END AS ageRange,
                  survived
              FROM titanic
              WHERE age IS NOT NULL
          ),
          survivalRate AS (
              SELECT
                  ageRange,
                  COUNT(*) AS total,
                  SUM(survived) AS survivors,
                  ROUND(100.0 * SUM(survived) / COUNT(*), 1) AS rate
              FROM ageGroup
              GROUP BY ageRange
          )
          SELECT
              ageRange,
              total,
              survivors,
              rate,
              LAG(rate) OVER (ORDER BY ageRange) AS prevRate,
              ROUND(rate - LAG(rate) OVER (ORDER BY ageRange), 1) AS rateDiff
          FROM survivalRate
          ORDER BY ageRange
      """)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 6단계. LAG 함수의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 6단계. LAG 함수 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step7_subquery
  title: 7단계. 서브쿼리 활용
  structuredPrimary: true
  subtitle: 중첩 쿼리
  goal: 7단계. 서브쿼리 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: 서브쿼리로 평균 이상인 데이터를 필터링합니다. WHERE tip > (SELECT AVG(tip) FROM tips)처럼 서브쿼리를 사용하면 하드코딩 없이
    동적 기준으로 필터링할 수 있습니다. 데이터가 변해도 쿼리를 수정할 필요가 없습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        SELECT
            day,
            time,
            total_bill,
            tip,
            ROUND(100.0 * tip / total_bill, 1) AS tipRate
        FROM tips
        WHERE tip > (SELECT AVG(tip) FROM tips)
        ORDER BY tip DESC
        LIMIT 10
    """)
  exercise:
    prompt: 7단계. 서브쿼리 활용 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          SELECT
              day,
              time,
              total_bill,
              tip,
              ROUND(100.0 * tip / total_bill, 1) AS tipRate
          FROM tips
          WHERE tip > (SELECT AVG(tip) FROM tips)
          ORDER BY tip DESC
          LIMIT 10
      """)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 7단계. 서브쿼리 활용의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 7단계. 서브쿼리 활용 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step8_case_when
  title: 8단계. CASE WHEN 분류
  structuredPrimary: true
  subtitle: 조건부 분류
  goal: 8단계. CASE WHEN 분류에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: CASE WHEN으로 데이터를 분류하고 분석합니다. 연속형 변수를 범주형으로 변환하거나, 복잡한 비즈니스 규칙을 적용할 때 필수적입니다. VIP, 우수, 보통
    같은 고객 등급을 만들어 세그먼트별 분석을 수행할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        WITH tipGrade AS (
            SELECT
                *,
                CASE
                    WHEN tip / total_bill >= 0.2 THEN 'VIP'
                    WHEN tip / total_bill >= 0.15 THEN '우수'
                    WHEN tip / total_bill >= 0.1 THEN '보통'
                    ELSE '저조'
                END AS grade
            FROM tips
        )
        SELECT
            grade,
            COUNT(*) AS count,
            ROUND(AVG(total_bill), 2) AS avgBill,
            ROUND(AVG(tip), 2) AS avgTip,
            ROUND(100.0 * AVG(tip / total_bill), 1) AS avgTipRate
        FROM tipGrade
        GROUP BY grade
        ORDER BY avgTipRate DESC
    """)
  exercise:
    prompt: 8단계. CASE WHEN 분류 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          WITH tipGrade AS (
              SELECT
                  *,
                  CASE
                      WHEN tip / total_bill >= 0.2 THEN 'VIP'
                      WHEN tip / total_bill >= 0.15 THEN '우수'
                      WHEN tip / total_bill >= 0.1 THEN '보통'
                      ELSE '저조'
                  END AS grade
              FROM tips
          )
          SELECT
              grade,
              COUNT(*) AS count,
              ROUND(AVG(total_bill), 2) AS avgBill,
              ROUND(AVG(tip), 2) AS avgTip,
              ROUND(100.0 * AVG(tip / total_bill), 1) AS avgTipRate
          FROM tipGrade
          GROUP BY grade
          ORDER BY avgTipRate DESC
      """)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 8단계. CASE WHEN 분류의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 8단계. CASE WHEN 분류 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step9_having
  title: 9단계. GROUP BY + HAVING
  structuredPrimary: true
  subtitle: 집계 후 필터
  goal: 9단계. GROUP BY + HAVING에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: HAVING으로 집계 결과를 필터링합니다. WHERE는 행 단위 필터이고, HAVING은 그룹 단위 필터입니다. COUNT(*) >= 5처럼 집계 함수 결과로
    조건을 걸 때는 반드시 HAVING을 사용해야 합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        SELECT
            day,
            time,
            smoker,
            COUNT(*) AS orderCount,
            ROUND(SUM(total_bill), 2) AS totalSales,
            ROUND(AVG(tip), 2) AS avgTip
        FROM tips
        GROUP BY day, time, smoker
        HAVING COUNT(*) >= 5
        ORDER BY totalSales DESC
    """)
  exercise:
    prompt: 9단계. GROUP BY + HAVING 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          SELECT
              day,
              time,
              smoker,
              COUNT(*) AS orderCount,
              ROUND(SUM(total_bill), 2) AS totalSales,
              ROUND(AVG(tip), 2) AS avgTip
          FROM tips
          GROUP BY day, time, smoker
          HAVING COUNT(*) >= 5
          ORDER BY totalSales DESC
      """)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 9단계. GROUP BY + HAVING의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 9단계. GROUP BY + HAVING 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step10_string_function
  title: 10단계. 문자열 함수
  structuredPrimary: true
  subtitle: 텍스트 가공
  goal: 10단계. 문자열 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: 문자열 함수로 데이터를 가공합니다. SPLIT_PART로 이름에서 호칭을 추출하고, TRIM으로 공백을 제거합니다. 텍스트 데이터를 정제하고 분석 가능한 형태로
    변환하는 것은 실무에서 매우 중요한 스킬입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        WITH titleExtract AS (
            SELECT
                name,
                TRIM(SPLIT_PART(SPLIT_PART(name, ',', 2), '.', 1)) AS title,
                survived,
                sex,
                age
            FROM titanic
        )
        SELECT
            title,
            COUNT(*) AS count,
            ROUND(100.0 * SUM(survived) / COUNT(*), 1) AS survivalRate,
            ROUND(AVG(age), 1) AS avgAge
        FROM titleExtract
        GROUP BY title
        HAVING COUNT(*) >= 5
        ORDER BY survivalRate DESC
    """)
  exercise:
    prompt: 10단계. 문자열 함수 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          WITH titleExtract AS (
              SELECT
                  name,
                  TRIM(SPLIT_PART(SPLIT_PART(name, ',', 2), '.', 1)) AS title,
                  survived,
                  sex,
                  age
              FROM titanic
          )
          SELECT
              title,
              COUNT(*) AS count,
              ROUND(100.0 * SUM(survived) / COUNT(*), 1) AS survivalRate,
              ROUND(AVG(age), 1) AS avgAge
          FROM titleExtract
          GROUP BY title
          HAVING COUNT(*) >= 5
          ORDER BY survivalRate DESC
      """)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 10단계. 문자열 함수의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 10단계. 문자열 함수 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step11_comprehensive_tips
  title: 11단계. Tips 종합 분석
  structuredPrimary: true
  subtitle: 모든 개념 결합
  goal: 11단계. Tips 종합 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: 모든 개념을 결합한 종합 분석 쿼리입니다. 다중 CTE로 기본 데이터 가공 → 세그먼트 집계 → 순위 매기기를 단계별로 수행합니다. 이런 구조화된 쿼리는 복잡한
    비즈니스 요구사항을 명확하게 구현하며, 협업 시 이해하기 쉽습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        WITH baseData AS (
            SELECT
                *,
                ROUND(100.0 * tip / total_bill, 2) AS tipRate,
                CASE
                    WHEN size <= 2 THEN '소규모'
                    WHEN size <= 4 THEN '중규모'
                    ELSE '대규모'
                END AS partySize,
                CASE
                    WHEN tip / total_bill >= 0.2 THEN 'VIP'
                    WHEN tip / total_bill >= 0.15 THEN '우수'
                    ELSE '일반'
                END AS customerGrade
            FROM tips
        ),
        segmentStats AS (
            SELECT
                day,
                time,
                partySize,
                customerGrade,
                COUNT(*) AS orderCount,
                SUM(total_bill) AS totalSales,
                AVG(tipRate) AS avgTipRate
            FROM baseData
            GROUP BY day, time, partySize, customerGrade
        ),
        ranked AS (
            SELECT
                *,
                RANK() OVER (PARTITION BY day ORDER BY totalSales DESC) AS salesRank
            FROM segmentStats
        )
        SELECT
            day,
            time,
            partySize,
            customerGrade,
            orderCount,
            ROUND(totalSales, 2) AS totalSales,
            ROUND(avgTipRate, 1) AS avgTipRate,
            salesRank
        FROM ranked
        WHERE salesRank <= 5
        ORDER BY day, salesRank
    """)
  exercise:
    prompt: 11단계. Tips 종합 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          WITH baseData AS (
              SELECT
                  *,
                  ROUND(100.0 * tip / total_bill, 2) AS tipRate,
                  CASE
                      WHEN size <= 2 THEN '소규모'
                      WHEN size <= 4 THEN '중규모'
                      ELSE '대규모'
                  END AS partySize,
                  CASE
                      WHEN tip / total_bill >= 0.2 THEN 'VIP'
                      WHEN tip / total_bill >= 0.15 THEN '우수'
                      ELSE '일반'
                  END AS customerGrade
              FROM tips
          ),
          segmentStats AS (
              SELECT
                  day,
                  time,
                  partySize,
                  customerGrade,
                  COUNT(*) AS orderCount,
                  SUM(total_bill) AS totalSales,
                  AVG(tipRate) AS avgTipRate
              FROM baseData
              GROUP BY day, time, partySize, customerGrade
          ),
          ranked AS (
              SELECT
                  *,
                  RANK() OVER (PARTITION BY day ORDER BY totalSales DESC) AS salesRank
              FROM segmentStats
          )
          SELECT
              day,
              time,
              partySize,
              customerGrade,
              orderCount,
              ROUND(totalSales, 2) AS totalSales,
              ROUND(avgTipRate, 1) AS avgTipRate,
              salesRank
          FROM ranked
          WHERE salesRank <= 5
          ORDER BY day, salesRank
      """)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 11단계. Tips 종합 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 11단계. Tips 종합 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step12_comprehensive_titanic
  title: 12단계. Titanic 종합 분석
  structuredPrimary: true
  subtitle: 생존 분석 파이프라인
  goal: 12단계. Titanic 종합 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: titanic 데이터로 생존 요인을 종합 분석합니다. 승객 프로필 생성 → 생존율 분석 → 순위 매기기를 3단계 CTE로 구성합니다. 호칭, 나이 그룹, 요금
    등급을 조합하여 생존율에 영향을 미친 복합 요인을 파악합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        WITH passengerProfile AS (
            SELECT
                *,
                TRIM(SPLIT_PART(SPLIT_PART(name, ',', 2), '.', 1)) AS title,
                CASE
                    WHEN age < 18 THEN '미성년'
                    WHEN age < 60 THEN '성인'
                    ELSE '노년'
                END AS ageGroup,
                CASE
                    WHEN fare = 0 THEN '무임'
                    WHEN fare < 20 THEN '저가'
                    WHEN fare < 50 THEN '중가'
                    ELSE '고가'
                END AS fareClass
            FROM titanic
            WHERE age IS NOT NULL
        ),
        survivalAnalysis AS (
            SELECT
                pclass,
                sex,
                ageGroup,
                fareClass,
                COUNT(*) AS total,
                SUM(survived) AS survivors,
                ROUND(100.0 * SUM(survived) / COUNT(*), 1) AS survivalRate
            FROM passengerProfile
            GROUP BY pclass, sex, ageGroup, fareClass
            HAVING COUNT(*) >= 5
        ),
        ranked AS (
            SELECT
                *,
                RANK() OVER (ORDER BY survivalRate DESC) AS overallRank,
                RANK() OVER (PARTITION BY pclass ORDER BY survivalRate DESC) AS classRank
            FROM survivalAnalysis
        )
        SELECT
            pclass,
            sex,
            ageGroup,
            fareClass,
            total,
            survivors,
            survivalRate,
            overallRank,
            classRank
        FROM ranked
        WHERE classRank <= 3
        ORDER BY pclass, classRank
    """)
  exercise:
    prompt: 12단계. Titanic 종합 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          WITH passengerProfile AS (
              SELECT
                  *,
                  TRIM(SPLIT_PART(SPLIT_PART(name, ',', 2), '.', 1)) AS title,
                  CASE
                      WHEN age < 18 THEN '미성년'
                      WHEN age < 60 THEN '성인'
                      ELSE '노년'
                  END AS ageGroup,
                  CASE
                      WHEN fare = 0 THEN '무임'
                      WHEN fare < 20 THEN '저가'
                      WHEN fare < 50 THEN '중가'
                      ELSE '고가'
                  END AS fareClass
              FROM titanic
              WHERE age IS NOT NULL
          ),
          survivalAnalysis AS (
              SELECT
                  pclass,
                  sex,
                  ageGroup,
                  fareClass,
                  COUNT(*) AS total,
                  SUM(survived) AS survivors,
                  ROUND(100.0 * SUM(survived) / COUNT(*), 1) AS survivalRate
              FROM passengerProfile
              GROUP BY pclass, sex, ageGroup, fareClass
              HAVING COUNT(*) >= 5
          ),
          ranked AS (
              SELECT
                  *,
                  RANK() OVER (ORDER BY survivalRate DESC) AS overallRank,
                  RANK() OVER (PARTITION BY pclass ORDER BY survivalRate DESC) AS classRank
              FROM survivalAnalysis
          )
          SELECT
              pclass,
              sex,
              ageGroup,
              fareClass,
              total,
              survivors,
              survivalRate,
              overallRank,
              classRank
          FROM ranked
          WHERE classRank <= 3
          ORDER BY pclass, classRank
      """)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 12단계. Titanic 종합 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 12단계. Titanic 종합 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step13_final_pipeline
  title: 13단계. 최종 파이프라인
  structuredPrimary: true
  subtitle: 분석 보고서 생성
  goal: 13단계. 최종 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: 최종 분석 결과를 보고서 형태로 출력합니다. UNION ALL로 전체 통계와 요일별 통계를 하나의 결과로 합치고, 서브쿼리로 매출 점유율을 계산합니다. 이런
    형태의 요약 보고서는 경영진 보고용으로 자주 활용됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        WITH summary AS (
            SELECT
                '전체' AS category,
                COUNT(*) AS count,
                ROUND(SUM(total_bill), 2) AS totalSales,
                ROUND(AVG(tip), 2) AS avgTip,
                ROUND(100.0 * AVG(tip / total_bill), 1) AS avgTipRate
            FROM tips

            UNION ALL

            SELECT
                day AS category,
                COUNT(*) AS count,
                ROUND(SUM(total_bill), 2) AS totalSales,
                ROUND(AVG(tip), 2) AS avgTip,
                ROUND(100.0 * AVG(tip / total_bill), 1) AS avgTipRate
            FROM tips
            GROUP BY day
        )
        SELECT
            category,
            count,
            totalSales,
            avgTip,
            avgTipRate,
            ROUND(100.0 * totalSales / (SELECT SUM(total_bill) FROM tips), 1) AS salesShare
        FROM summary
        ORDER BY
            CASE WHEN category = '전체' THEN 0 ELSE 1 END,
            totalSales DESC
    """)
  exercise:
    prompt: 13단계. 최종 파이프라인 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          WITH summary AS (
              SELECT
                  '전체' AS category,
                  COUNT(*) AS count,
                  ROUND(SUM(total_bill), 2) AS totalSales,
                  ROUND(AVG(tip), 2) AS avgTip,
                  ROUND(100.0 * AVG(tip / total_bill), 1) AS avgTipRate
              FROM tips

              UNION ALL

              SELECT
                  day AS category,
                  COUNT(*) AS count,
                  ROUND(SUM(total_bill), 2) AS totalSales,
                  ROUND(AVG(tip), 2) AS avgTip,
                  ROUND(100.0 * AVG(tip / total_bill), 1) AS avgTipRate
              FROM tips
              GROUP BY day
          )
          SELECT
              category,
              count,
              totalSales,
              avgTip,
              avgTipRate,
              ROUND(100.0 * totalSales / (SELECT SUM(total_bill) FROM tips), 1) AS salesShare
          FROM summary
          ORDER BY
              CASE WHEN category = '전체' THEN 0 ELSE 1 END,
              totalSales DESC
      """)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 13단계. 최종 파이프라인의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 13단계. 최종 파이프라인 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 심화 미션
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: |-
    모든 개념을 종합하여 복합 분석 쿼리를 작성해봅시다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import pandas as pd
    import duckdb
    data = pd.DataFrame({
        "total_bill": [16.99, 24.59, 32.40, 10.34, 40.17, 21.01, 18.78, 29.85],
        "tip": [1.01, 3.61, 5.15, 1.66, 6.50, 3.50, 2.00, 4.20],
        "sex": ["Female", "Male", "Male", "Female", "Male", "Female", "Female", "Male"],
        "smoker": ["No", "No", "Yes", "No", "Yes", "No", "Yes", "No"],
        "day": ["Sun", "Sat", "Sat", "Thur", "Sun", "Fri", "Thur", "Sat"],
        "time": ["Dinner", "Dinner", "Dinner", "Lunch", "Dinner", "Lunch", "Lunch", "Dinner"],
        "size": [2, 4, 3, 2, 5, 2, 2, 3],
    })
    tbl1 = duckdb.from_df(data)
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import pandas as pd
      import duckdb
      data = pd.DataFrame({
          "total_bill": [16.99, 24.59, 32.40, 10.34, 40.17, 21.01, 18.78, 29.85],
          "tip": [1.01, 3.61, 5.15, 1.66, 6.50, 3.50, 2.00, 4.20],
          "sex": ["Female", "Male", "Male", "Female", "Male", "Female", "Female", "Male"],
          "smoker": ["No", "No", "Yes", "No", "Yes", "No", "Yes", "No"],
          "day": ["Sun", "Sat", "Sat", "Thur", "Sun", "Fri", "Thur", "Sat"],
          "time": ["Dinner", "Dinner", "Dinner", "Lunch", "Dinner", "Lunch", "Lunch", "Dinner"],
          "size": [2, 4, 3, 2, 5, 2, 2, 3],
      })
      tbl1 = duckdb.from_df(data)
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 실습의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 실습 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: summary
  title: 정리
  blocks:
  - type: text
    content: tips와 titanic 데이터로 DuckDB의 모든 개념을 종합한 분석 파이프라인을 완성했습니다!
  - type: list
    items:
    - 'CTE: WITH 절로 쿼리 구조화, 다중 CTE 연결'
    - '윈도우 함수: ROW_NUMBER, RANK, LAG로 순위와 비교'
    - '서브쿼리: 중첩 쿼리로 동적 필터링'
    - 'CASE WHEN: 조건부 분류와 세그먼트 생성'
    - 'GROUP BY + HAVING: 집계와 집계 후 필터'
    - '문자열 함수: SPLIT_PART, TRIM으로 텍스트 가공'
  - type: text
    content: 10개 프로젝트를 완료하며 DuckDB SQL의 핵심 개념을 모두 마스터했습니다. 이제 어떤 데이터든 효과적으로 분석할 수 있습니다!
  goal: 정리에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
- id: workflow_validation
  title: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트'
  structuredPrimary: true
  subtitle: 예측 → 실행 → SQL 오류 수정 → 결과 검증 → 실무 변주
  goal: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: DuckDB 학습은 쿼리 결과를 눈으로 보는 데서 끝나면 실무로 이어지기 어렵습니다. 작은 로컬 테이블을 만들고, 잘못된 컬럼명을 먼저 실패시킨 뒤, 집계
    결과와 기준 변경 실험을 assert로 고정합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import duckdb

    workflowCon = duckdb.connect()
    workflowCon.sql("""
        CREATE OR REPLACE TABLE lessonOrders AS
        SELECT * FROM (VALUES
            ('A-100', 'paid', 50000, 'web'),
            ('A-101', 'pending', 20000, 'app'),
            ('A-102', 'paid', 120000, 'web'),
            ('A-103', 'cancelled', 15000, 'store'),
            ('A-104', 'paid', 62000, 'app')
        ) AS t(orderId, status, amount, channel)
    """)

    expectedPaidRevenue = 232000
    expectedPaidCount = 3
    rowCount = workflowCon.sql("SELECT COUNT(*) FROM lessonOrders").fetchone()[0]

    assert rowCount == 5
    rowCount
  exercise:
    prompt: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'
    starterCode: |-
      import duckdb

      workflowCon = duckdb.connect()
      workflowCon.sql("""
          CREATE OR REPLACE TABLE lessonOrders AS
          SELECT * FROM (VALUES
              ('A-100', 'paid', 50000, 'web'),
              ('A-101', 'pending', 20000, 'app'),
              ('A-102', 'paid', 120000, 'web'),
              ('A-103', 'cancelled', 15000, 'store'),
              ('A-104', 'paid', 62000, 'app')
          ) AS t(orderId, status, amount, channel)
      """)

      expectedPaidRevenue = 232000
      expectedPaidCount = 3
      rowCount = workflowCon.sql("SELECT COUNT(*) FROM lessonOrders").fetchone()[0]

      assert rowCount == 5
      rowCount
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.'
    resultCheck: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.'
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
  - id: duckdb_10-analytics-capstone-report-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - workflow_validation
    title: 집계·window·품질 증거를 한 보고서로 통합하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 지역별 유효 주문의 매출·주문 수·점유율·순위를 계산하고 제외 수를 보존한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 유효 행 filter, region 집계, 전체 대비 share, rank 순서로 단계화하세요.
    - 제외 수와 전체 매출을 보고서 계약에 포함하세요.
    exercise:
      prompt: regional_sales_report(rows)를 완성하세요.
      starterCode: |-
        def regional_sales_report(rows):
            raise NotImplementedError
      solution: |
        def regional_sales_report(rows):
            grouped = {}
            excluded = 0
            for row in rows:
                if row.get("status") != "paid" or row.get("amount") is None or row["amount"] < 0:
                    excluded += 1
                    continue
                bucket = grouped.setdefault(row["region"], {"revenue": 0, "orders": 0})
                bucket["revenue"] += row["amount"]
                bucket["orders"] += 1
            total = sum(bucket["revenue"] for bucket in grouped.values())
            ordered = sorted(grouped.items(), key=lambda item: (-item[1]["revenue"], item[0]))
            regions = [{"region": name, "revenue": bucket["revenue"], "orders": bucket["orders"], "share": 0.0 if total == 0 else round(bucket["revenue"] / total, 3), "rank": index} for index, (name, bucket) in enumerate(ordered, 1)]
            return {"regions": regions, "totalRevenue": total, "excluded": excluded}
      hints: *id001
    check:
      id: python.duckdb.duckdb_10.analytics-capstone-report.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.duckdb.duckdb_10.analytics-capstone-report.mastery.behavior.v1.fixture
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
        entry: regional_sales_report
        cases:
        - id: builds-ranked-report
          arguments:
          - value:
            - region: East
              status: paid
              amount: 30
            - region: West
              status: paid
              amount: 70
            - region: East
              status: open
              amount: 100
          expectedReturn:
            regions:
            - region: West
              revenue: 70
              orders: 1
              share: 0.7
              rank: 1
            - region: East
              revenue: 30
              orders: 1
              share: 0.3
              rank: 2
            totalRevenue: 100
            excluded: 1
        - id: handles-no-valid-sales
          arguments:
          - value:
            - region: X
              status: open
              amount: 2
          expectedReturn:
            regions: []
            totalRevenue: 0
            excluded: 1
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: duckdb_10-idempotent-batch-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - duckdb_10-analytics-capstone-report-mastery
    title: 새 배치 분석에 재실행 안전성 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 입력 batch와 기존 output key를 비교해 write, skip, conflict를 결정한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 key·같은 value는 재실행 시 skip할 수 있습니다.
    - batch 내부 충돌과 기존 output 충돌을 모두 검사하세요.
    exercise:
      prompt: plan_idempotent_batch(rows, existing)를 완성하세요.
      starterCode: |-
        def plan_idempotent_batch(rows, existing):
            raise NotImplementedError
      solution: |
        def plan_idempotent_batch(rows, existing):
            seen = {}
            conflicts = []
            for row in rows:
                key = row["key"]
                value = row["value"]
                if key in seen and seen[key] != value:
                    conflicts.append(key)
                seen[key] = value
            writes = sorted(key for key, value in seen.items() if key not in existing)
            skips = sorted(key for key, value in seen.items() if existing.get(key) == value)
            conflicts += [key for key, value in seen.items() if key in existing and existing[key] != value]
            return {"writes": writes, "skips": skips, "conflicts": sorted(set(conflicts)), "safe": not conflicts}
      hints: *id002
    check:
      id: python.duckdb.duckdb_10.idempotent-batch-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.duckdb.duckdb_10.idempotent-batch-audit.transfer.behavior.v1.fixture
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
        entry: plan_idempotent_batch
        cases:
        - id: separates-write-and-skip
          arguments:
          - value:
            - key: a
              value: 1
            - key: b
              value: 2
          - value:
              a: 1
          expectedReturn:
            writes:
            - b
            skips:
            - a
            conflicts: []
            safe: true
        - id: detects-existing-and-batch-conflicts
          arguments:
          - value:
            - key: a
              value: 1
            - key: a
              value: 2
            - key: b
              value: 3
          - value:
              b: 4
          expectedReturn:
            writes:
            - a
            skips: []
            conflicts:
            - a
            - b
            safe: false
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: duckdb_10-capstone-evidence-chain-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - duckdb_10-idempotent-batch-audit-transfer
    title: 종합 분석의 증거 사슬 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 질문, grain, 품질, 성능, 재실행 증거를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트만으로 정답을 주장하지 말고 metric 계약을 남기세요.
    - 성능과 재현성은 서로 다른 증거입니다.
    exercise:
      prompt: choose_capstone_evidence(situation)를 완성하세요.
      starterCode: |-
        def choose_capstone_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_capstone_evidence(situation):
            table = {'business-question': {'evidence': 'metric definition and denominator', 'stage': 'contract', 'risk': 'answer drift'}, 'query-performance': {'evidence': 'EXPLAIN plan and scanned bytes', 'stage': 'execution', 'risk': 'early materialization'}, 'repeatable-output': {'evidence': 'input hash and output key', 'stage': 'publication', 'risk': 'duplicate write'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.duckdb.duckdb_10.capstone-evidence-chain.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.duckdb.duckdb_10.capstone-evidence-chain.retrieval.behavior.v1.fixture
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
        entry: choose_capstone_evidence
        cases:
        - id: recalls-business-question
          arguments:
          - value: business-question
          expectedReturn:
            evidence: metric definition and denominator
            stage: contract
            risk: answer drift
        - id: recalls-query-performance
          arguments:
          - value: query-performance
          expectedReturn:
            evidence: EXPLAIN plan and scanned bytes
            stage: execution
            risk: early materialization
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};