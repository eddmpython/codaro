var e=`meta:
  packages:
  - duckdb
  - pandas
  id: duckdb_08
  title: 고급윈도우분석
  order: 8
  category: duckdb
  difficulty: ⭐⭐⭐
  badge: 중급
  dataSource: codaro-local:titanic
  tags:
  - window
  - LAG
  - LEAD
  - 이동평균
  - QUALIFY
  - titanic
  seo:
    title: DuckDB 고급 윈도우 함수 - LAG, LEAD, 이동평균, QUALIFY
    description: 타이타닉 데이터로 LAG/LEAD 함수, 이동 평균, QUALIFY 절을 마스터합니다. 이전/다음 행 비교, 이동 통계, 윈도우 필터링까지 실습합니다.
    keywords:
    - DuckDB LAG
    - LEAD
    - 이동평균
    - QUALIFY
    - 윈도우 함수 고급
intro:
  emoji: 📊
  goal: 타이타닉 데이터로 LAG/LEAD, 이동 평균, QUALIFY를 마스터합니다.
  description: 고급 윈도우 함수로 이전/다음 행 비교, 이동 평균 계산, 윈도우 결과 필터링을 배웁니다. LAG/LEAD는 시계열 분석의 핵심이며, QUALIFY는 DuckDB의
    강력한 확장 기능입니다.
  direction: 고급윈도우분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.
  - 고급윈도우분석 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 데이터 준비 입력 확인
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. LAG 이전 값 가져 처리 실행
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. LEAD 다음 값 가 결과 검증
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.
    - label: 고급윈도우분석 재사용
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.
    runtime:
    - label: SQL 분석 환경
      detail: duckdb, pandas 기준으로 로컬 Python 실행을 준비합니다.
    - label: 고급윈도우분석 실행
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.
    - label: 고급윈도우분석 완료
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.
sections:
- id: step1_load
  title: 1단계. 데이터 준비
  structuredPrimary: true
  subtitle: titanic 데이터 로드
  goal: 1단계. 데이터 준비에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: 타이타닉 승객 데이터를 불러옵니다. 이번 프로젝트에서는 LAG/LEAD로 행 간 비교, 이동 평균으로 추세 분석, QUALIFY로 윈도우 필터링을 배웁니다.
    180명의 로컬 승객 샘플로 나이, 요금 등의 패턴을 분석합니다. 고급 윈도우 함수는 시계열 데이터 분석, 추세 예측, 이상치 탐지 등 실무에서 필수적인 기능입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import pandas as pd
    from codaro.curriculum.localData import loadLocalDataset
    import duckdb

    dfTitanic = loadLocalDataset("titanic")
    titanic = duckdb.from_df(dfTitanic)
  exercise:
    prompt: 1단계. 데이터 준비 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import pandas as pd
      from codaro.curriculum.localData import loadLocalDataset
      import duckdb

      dfTitanic = loadLocalDataset("titanic")
      titanic = duckdb.from_df(dfTitanic)
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 1단계. 데이터 준비의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 1단계. 데이터 준비 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step2_lag_intro
  title: 2단계. LAG - 이전 값 가져오기
  structuredPrimary: true
  subtitle: 행 간 비교의 시작
  goal: 2단계. LAG 이전 값 가져오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: |-
    LAG(column, n)은 현재 행에서 n행 이전의 값을 가져오는 함수입니다. n=1이면 바로 직전 행, n=2이면 2행 전 값을 반환합니다. 현재 값과 이전 값을 비교하여 증감, 차이, 변화율 등을 계산할 수 있습니다. 예를 들어 매출이 전월 대비 얼마나 증가했는지, 주가가 전일 대비 얼마나 변동했는지 분석할 때 LAG가 필수적입니다. 시계열 데이터의 추세 분석, 변화 탐지에 핵심 기능입니다.

    LAG(col, 1)은 직전 행, LAG(col, 2)는 2행 전 값을 가져옵니다. PARTITION BY를 사용하면 그룹별로 독립적으로 이전 값을 찾습니다. 첫 번째 행은 이전 값이 없으므로 NULL이 반환됩니다. NULL 대신 기본값을 지정하려면 LAG(col, 1, 0) 형태로 세 번째 인자를 추가합니다.
  tips:
  - LAG(col, 1)은 직전 행, LAG(col, 2)는 2행 전 값을 가져옵니다. PARTITION BY를 사용하면 그룹별로 독립적으로 이전 값을 찾습니다. 첫 번째 행은 이전
    값이 없으므로 NULL이 반환됩니다. NULL 대신 기본값을 지정하려면 LAG(col, 1, 0) 형태로 세 번째 인자를 추가합니다.
  snippet: |-
    duckdb.sql("""
        SELECT
            pclass,
            age,
            fare,
            LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS prevFare,
            ROUND(fare - LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age), 2) AS fareDiff
        FROM titanic
        WHERE age IS NOT NULL AND fare > 0
        ORDER BY pclass, age
        LIMIT 10
    """).show()
  exercise:
    prompt: 2단계. LAG 이전 값 가져오기 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          SELECT
              pclass,
              age,
              fare,
              LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS prevFare,
              ROUND(fare - LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age), 2) AS fareDiff
          FROM titanic
          WHERE age IS NOT NULL AND fare > 0
          ORDER BY pclass, age
          LIMIT 10
      """).show()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 2단계. LAG 이전 값 가져오기의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 2단계. LAG 이전 값 가져오기 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step3_lead_intro
  title: 3단계. LEAD - 다음 값 가져오기
  structuredPrimary: true
  subtitle: 미래 값 참조
  goal: 3단계. LEAD 다음 값 가져오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: |-
    LEAD(column, n)은 LAG와 반대로 현재 행에서 n행 다음의 값을 가져옵니다. LAG가 과거를 본다면 LEAD는 미래를 봅니다. 현재 상태와 다음 상태를 비교하거나, 구간을 계산할 때 유용합니다. 예를 들어 "다음 고객의 구매 금액과 비교", "현재 이벤트와 다음 이벤트 사이의 시간 계산" 등에 활용됩니다. LAG와 LEAD를 함께 사용하면 전후 맥락을 모두 분석할 수 있습니다.

    LEAD(col, 1)은 다음 행, LEAD(col, 2)는 2행 후 값을 반환합니다. 마지막 행은 다음 값이 없으므로 NULL입니다. LAG와 LEAD를 동시에 사용하면 전후 값을 모두 확인하여 구간 분석이 가능합니다.
  tips:
  - LEAD(col, 1)은 다음 행, LEAD(col, 2)는 2행 후 값을 반환합니다. 마지막 행은 다음 값이 없으므로 NULL입니다. LAG와 LEAD를 동시에 사용하면 전후
    값을 모두 확인하여 구간 분석이 가능합니다.
  snippet: |-
    duckdb.sql("""
        SELECT
            pclass,
            age,
            fare,
            LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS nextFare,
            LEAD(fare, 2) OVER(PARTITION BY pclass ORDER BY age) AS next2Fare
        FROM titanic
        WHERE age IS NOT NULL AND fare > 0
        ORDER BY pclass, age
        LIMIT 10
    """).show()
  exercise:
    prompt: 3단계. LEAD 다음 값 가져오기 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          SELECT
              pclass,
              age,
              fare,
              LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS nextFare,
              LEAD(fare, 2) OVER(PARTITION BY pclass ORDER BY age) AS next2Fare
          FROM titanic
          WHERE age IS NOT NULL AND fare > 0
          ORDER BY pclass, age
          LIMIT 10
      """).show()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 3단계. LEAD 다음 값 가져오기의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 3단계. LEAD 다음 값 가져오기 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step4_lag_lead_compare
  title: 4단계. LAG와 LEAD 동시 사용
  structuredPrimary: true
  subtitle: 전후 맥락 분석
  goal: 4단계. LAG와 LEAD 동시 사용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: LAG와 LEAD를 동시에 사용하면 현재 값을 중심으로 전후 값을 모두 비교할 수 있습니다. 이는 "현재 값이 전후 평균보다 높은가?", "이전 값과 다음
    값 사이의 어디에 위치하는가?" 같은 맥락 기반 분석을 가능하게 합니다. 이동 구간, 피크 탐지, 이상치 감지 등 고급 분석 패턴의 기초가 됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        SELECT
            pclass,
            age,
            fare,
            LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS prevFare,
            LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS nextFare,
            ROUND((COALESCE(LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age), fare) +
                   COALESCE(LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY age), fare)) / 2.0, 2) AS avgAround
        FROM titanic
        WHERE age IS NOT NULL AND fare > 0
        ORDER BY pclass, age
        LIMIT 12
    """).show()
  exercise:
    prompt: 4단계. LAG와 LEAD 동시 사용 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          SELECT
              pclass,
              age,
              fare,
              LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS prevFare,
              LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY age) AS nextFare,
              ROUND((COALESCE(LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY age), fare) +
                     COALESCE(LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY age), fare)) / 2.0, 2) AS avgAround
          FROM titanic
          WHERE age IS NOT NULL AND fare > 0
          ORDER BY pclass, age
          LIMIT 12
      """).show()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 4단계. LAG와 LEAD 동시 사용의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 4단계. LAG와 LEAD 동시 사용 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step5_moving_avg_intro
  title: 5단계. 이동 평균 기초
  structuredPrimary: true
  subtitle: ROWS BETWEEN으로 윈도우 프레임 지정
  goal: 5단계. 이동 평균 기초에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: |-
    이동 평균(Moving Average)은 일정 범위의 값들의 평균을 구하는 기법입니다. ROWS BETWEEN ... AND ... 구문으로 윈도우 프레임(범위)을 지정합니다. 예를 들어 ROWS BETWEEN 2 PRECEDING AND CURRENT ROW는 "이전 2개 행 + 현재 행" 총 3개 행의 평균을 계산합니다. 이동 평균은 노이즈를 제거하고 추세를 파악하는 데 매우 유용합니다. 주가 분석의 이동평균선, 매출 추세, 트래픽 패턴 등에 널리 사용됩니다.

    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW는 현재 행 포함 최근 3행을 의미합니다. PRECEDING은 '이전', CURRENT ROW는 '현재 행'입니다. 2 PRECEDING은 2행 전부터 시작하므로 총 3행(2행 전, 1행 전, 현재)이 범위에 포함됩니다. 숫자를 바꾸면 윈도우 크기를 조절할 수 있습니다.
  tips:
  - ROWS BETWEEN 2 PRECEDING AND CURRENT ROW는 현재 행 포함 최근 3행을 의미합니다. PRECEDING은 '이전', CURRENT ROW는 '현재
    행'입니다. 2 PRECEDING은 2행 전부터 시작하므로 총 3행(2행 전, 1행 전, 현재)이 범위에 포함됩니다. 숫자를 바꾸면 윈도우 크기를 조절할 수 있습니다.
  snippet: |-
    duckdb.sql("""
        SELECT
            pclass,
            age,
            fare,
            ROUND(AVG(fare) OVER(
                PARTITION BY pclass
                ORDER BY age
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
            ), 2) AS movingAvg3
        FROM titanic
        WHERE age IS NOT NULL AND fare > 0
        ORDER BY pclass, age
        LIMIT 12
    """).show()
  exercise:
    prompt: 5단계. 이동 평균 기초 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          SELECT
              pclass,
              age,
              fare,
              ROUND(AVG(fare) OVER(
                  PARTITION BY pclass
                  ORDER BY age
                  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
              ), 2) AS movingAvg3
          FROM titanic
          WHERE age IS NOT NULL AND fare > 0
          ORDER BY pclass, age
          LIMIT 12
      """).show()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 5단계. 이동 평균 기초의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 5단계. 이동 평균 기초 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step6_moving_avg_variants
  title: 6단계. 다양한 이동 평균
  structuredPrimary: true
  subtitle: 윈도우 크기 변경
  goal: 6단계. 다양한 이동 평균에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: 윈도우 프레임의 크기를 조절하여 다양한 이동 평균을 계산할 수 있습니다. 작은 윈도우(3개)는 최근 변화에 민감하고, 큰 윈도우(5개 이상)는 장기 추세를
    보여줍니다. 실무에서는 여러 크기의 이동 평균을 함께 사용하여 단기/중기/장기 추세를 동시에 분석합니다. 주식 시장의 5일/20일/60일 이동평균선이 대표적인 예입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        SELECT
            pclass,
            age,
            fare,
            ROUND(AVG(fare) OVER(
                PARTITION BY pclass
                ORDER BY age
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
            ), 2) AS movingAvg3,
            ROUND(AVG(fare) OVER(
                PARTITION BY pclass
                ORDER BY age
                ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
            ), 2) AS movingAvg5
        FROM titanic
        WHERE age IS NOT NULL AND fare > 0
        ORDER BY pclass, age
        LIMIT 12
    """).show()
  exercise:
    prompt: 6단계. 다양한 이동 평균 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          SELECT
              pclass,
              age,
              fare,
              ROUND(AVG(fare) OVER(
                  PARTITION BY pclass
                  ORDER BY age
                  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
              ), 2) AS movingAvg3,
              ROUND(AVG(fare) OVER(
                  PARTITION BY pclass
                  ORDER BY age
                  ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
              ), 2) AS movingAvg5
          FROM titanic
          WHERE age IS NOT NULL AND fare > 0
          ORDER BY pclass, age
          LIMIT 12
      """).show()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 6단계. 다양한 이동 평균의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 6단계. 다양한 이동 평균 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step7_qualify_intro
  title: 7단계. QUALIFY 기본
  structuredPrimary: true
  subtitle: 윈도우 결과 필터링
  goal: 7단계. QUALIFY 기본에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: |-
    QUALIFY는 DuckDB의 강력한 확장 기능으로, 윈도우 함수 결과를 직접 필터링할 수 있습니다. WHERE는 윈도우 함수 전에 실행되고 HAVING은 GROUP BY에만 사용되지만, QUALIFY는 윈도우 함수 실행 후 필터링합니다. 서브쿼리 없이 깔끔하게 "순위 3위 이하", "누적 합계 100 이상" 같은 조건을 적용할 수 있습니다. 코드가 간결해지고 가독성이 크게 향상됩니다.

    QUALIFY는 HAVING처럼 동작하지만 윈도우 함수에 적용됩니다. 윈도우 함수를 WHERE에서 사용할 수 없는 제약을 우회하는 강력한 기능입니다. 서브쿼리 패턴(FROM (SELECT ... ROW_NUMBER) WHERE rn <= 2)을 QUALIFY 한 줄로 대체할 수 있어 코드가 매우 깔끔해집니다.
  tips:
  - QUALIFY는 HAVING처럼 동작하지만 윈도우 함수에 적용됩니다. 윈도우 함수를 WHERE에서 사용할 수 없는 제약을 우회하는 강력한 기능입니다. 서브쿼리 패턴(FROM (SELECT
    ... ROW_NUMBER) WHERE rn <= 2)을 QUALIFY 한 줄로 대체할 수 있어 코드가 매우 깔끔해집니다.
  snippet: |-
    duckdb.sql("""
        SELECT
            pclass,
            sex,
            age,
            fare,
            ROW_NUMBER() OVER(PARTITION BY pclass, sex ORDER BY fare DESC) AS rn
        FROM titanic
        WHERE age IS NOT NULL
        QUALIFY ROW_NUMBER() OVER(PARTITION BY pclass, sex ORDER BY fare DESC) <= 2
        ORDER BY pclass, sex, fare DESC
    """).show()
  exercise:
    prompt: 7단계. QUALIFY 기본 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          SELECT
              pclass,
              sex,
              age,
              fare,
              ROW_NUMBER() OVER(PARTITION BY pclass, sex ORDER BY fare DESC) AS rn
          FROM titanic
          WHERE age IS NOT NULL
          QUALIFY ROW_NUMBER() OVER(PARTITION BY pclass, sex ORDER BY fare DESC) <= 2
          ORDER BY pclass, sex, fare DESC
      """).show()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 7단계. QUALIFY 기본의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 7단계. QUALIFY 기본 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step8_qualify_advanced
  title: 8단계. QUALIFY 고급 활용
  structuredPrimary: true
  subtitle: 복잡한 조건 필터링
  goal: 8단계. QUALIFY 고급 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: QUALIFY는 AND, OR 등 복잡한 조건도 사용할 수 있습니다. 여러 윈도우 함수 결과를 조합하여 "순위 3위 이하이면서 평균 이상" 같은 조건을 표현할
    수 있습니다. 실무에서는 이런 복합 조건으로 정교한 필터링을 수행합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        SELECT
            pclass,
            sex,
            age,
            fare,
            RANK() OVER(PARTITION BY pclass ORDER BY fare DESC) AS fareRank
        FROM titanic
        WHERE survived = 1 AND age IS NOT NULL
        QUALIFY RANK() OVER(PARTITION BY pclass ORDER BY fare DESC) <= 3
        ORDER BY pclass, fareRank
    """).show()
  exercise:
    prompt: 8단계. QUALIFY 고급 활용 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          SELECT
              pclass,
              sex,
              age,
              fare,
              RANK() OVER(PARTITION BY pclass ORDER BY fare DESC) AS fareRank
          FROM titanic
          WHERE survived = 1 AND age IS NOT NULL
          QUALIFY RANK() OVER(PARTITION BY pclass ORDER BY fare DESC) <= 3
          ORDER BY pclass, fareRank
      """).show()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 8단계. QUALIFY 고급 활용의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 8단계. QUALIFY 고급 활용 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step9_cumsum_moving
  title: 9단계. 누적 vs 이동 합계
  structuredPrimary: true
  subtitle: UNBOUNDED vs BOUNDED
  goal: 9단계. 누적 vs 이동 합계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: |-
    윈도우 프레임은 UNBOUNDED PRECEDING(처음부터)과 n PRECEDING(n개 전부터) 두 가지 방식이 있습니다. UNBOUNDED PRECEDING을 사용하면 누적 합계, n PRECEDING을 사용하면 이동 합계가 됩니다. 누적은 계속 증가하지만, 이동은 일정 범위만 합산하므로 증감을 반복합니다. 용도에 맞게 선택하면 됩니다.

    ROWS UNBOUNDED PRECEDING은 '처음부터 현재까지 전부'를 의미하며 누적 합계가 됩니다. ROWS BETWEEN 2 PRECEDING AND CURRENT ROW는 '최근 3개'만 합산하므로 이동 합계가 됩니다. 누적은 계속 증가하지만 이동은 범위가 고정되어 증감을 반복합니다.
  tips:
  - ROWS UNBOUNDED PRECEDING은 '처음부터 현재까지 전부'를 의미하며 누적 합계가 됩니다. ROWS BETWEEN 2 PRECEDING AND CURRENT ROW는
    '최근 3개'만 합산하므로 이동 합계가 됩니다. 누적은 계속 증가하지만 이동은 범위가 고정되어 증감을 반복합니다.
  snippet: |-
    duckdb.sql("""
        SELECT
            pclass,
            age,
            fare,
            ROUND(SUM(fare) OVER(
                PARTITION BY pclass ORDER BY age
                ROWS UNBOUNDED PRECEDING
            ), 2) AS cumSum,
            ROUND(SUM(fare) OVER(
                PARTITION BY pclass ORDER BY age
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
            ), 2) AS movingSum3
        FROM titanic
        WHERE age IS NOT NULL AND fare > 0
        ORDER BY pclass, age
        LIMIT 10
    """).show()
  exercise:
    prompt: 9단계. 누적 vs 이동 합계 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          SELECT
              pclass,
              age,
              fare,
              ROUND(SUM(fare) OVER(
                  PARTITION BY pclass ORDER BY age
                  ROWS UNBOUNDED PRECEDING
              ), 2) AS cumSum,
              ROUND(SUM(fare) OVER(
                  PARTITION BY pclass ORDER BY age
                  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
              ), 2) AS movingSum3
          FROM titanic
          WHERE age IS NOT NULL AND fare > 0
          ORDER BY pclass, age
          LIMIT 10
      """).show()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 9단계. 누적 vs 이동 합계의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 9단계. 누적 vs 이동 합계 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step10_window_alias
  title: 10단계. WINDOW 절로 재사용
  structuredPrimary: true
  subtitle: 윈도우 정의 간소화
  goal: 10단계. WINDOW 절로 재사용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: |-
    같은 OVER 절을 여러 번 반복하면 코드가 길어집니다. WINDOW 절로 윈도우 정의에 이름을 붙이면 재사용할 수 있습니다. 코드가 간결해지고 수정도 쉬워집니다. 실무에서 복잡한 쿼리를 작성할 때 가독성 향상에 큰 도움이 됩니다.

    WINDOW w AS (...)로 정의한 후 OVER w 형태로 재사용합니다. 같은 윈도우를 여러 곳에서 사용할 때 코드 중복을 줄이고 수정을 쉽게 만듭니다. 윈도우 정의가 복잡할수록 WINDOW 절의 효과가 큽니다.
  tips:
  - WINDOW w AS (...)로 정의한 후 OVER w 형태로 재사용합니다. 같은 윈도우를 여러 곳에서 사용할 때 코드 중복을 줄이고 수정을 쉽게 만듭니다. 윈도우 정의가 복잡할수록
    WINDOW 절의 효과가 큽니다.
  snippet: |-
    duckdb.sql("""
        SELECT
            pclass,
            age,
            fare,
            LAG(fare, 1) OVER w AS prevFare,
            ROUND(AVG(fare) OVER(
                PARTITION BY pclass ORDER BY age
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
            ), 2) AS movingAvg,
            CASE
                WHEN fare > LAG(fare, 1) OVER w THEN '상승'
                WHEN fare < LAG(fare, 1) OVER w THEN '하락'
                ELSE '유지'
            END AS trend
        FROM titanic
        WHERE age IS NOT NULL AND fare > 0
        WINDOW w AS (PARTITION BY pclass ORDER BY age)
        ORDER BY pclass, age
        LIMIT 12
    """).show()
  exercise:
    prompt: 10단계. WINDOW 절로 재사용 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          SELECT
              pclass,
              age,
              fare,
              LAG(fare, 1) OVER w AS prevFare,
              ROUND(AVG(fare) OVER(
                  PARTITION BY pclass ORDER BY age
                  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
              ), 2) AS movingAvg,
              CASE
                  WHEN fare > LAG(fare, 1) OVER w THEN '상승'
                  WHEN fare < LAG(fare, 1) OVER w THEN '하락'
                  ELSE '유지'
              END AS trend
          FROM titanic
          WHERE age IS NOT NULL AND fare > 0
          WINDOW w AS (PARTITION BY pclass ORDER BY age)
          ORDER BY pclass, age
          LIMIT 12
      """).show()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 10단계. WINDOW 절로 재사용의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 10단계. WINDOW 절로 재사용 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: step11_final
  title: 11단계. 최종 종합 분석
  structuredPrimary: true
  subtitle: 모든 개념 결합
  goal: 11단계. 최종 종합 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: LAG, LEAD, 이동 평균, QUALIFY를 모두 활용한 종합 분석입니다. CTE와 윈도우 함수를 결합하여 복잡한 분석 파이프라인을 구축합니다. 실무에서
    이런 패턴으로 시계열 데이터를 분석하고 추세를 예측합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    duckdb.sql("""
        WITH rankedPassengers AS (
            SELECT
                pclass,
                sex,
                age,
                fare,
                embarked,
                ROW_NUMBER() OVER(PARTITION BY pclass ORDER BY fare DESC) AS rn,
                LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY fare DESC) AS higherFare,
                LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY fare DESC) AS lowerFare,
                ROUND(AVG(fare) OVER(
                    PARTITION BY pclass ORDER BY fare DESC
                    ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
                ), 2) AS movingAvg3
            FROM titanic
            WHERE survived = 1 AND age IS NOT NULL
        )
        SELECT
            pclass,
            sex,
            age,
            fare,
            higherFare,
            lowerFare,
            movingAvg3,
            ROUND(fare - COALESCE(lowerFare, fare), 2) AS diffFromLower
        FROM rankedPassengers
        WHERE rn <= 5
        ORDER BY pclass, rn
    """).show()
  exercise:
    prompt: 11단계. 최종 종합 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.
    starterCode: |-
      duckdb.sql("""
          WITH rankedPassengers AS (
              SELECT
                  pclass,
                  sex,
                  age,
                  fare,
                  embarked,
                  ROW_NUMBER() OVER(PARTITION BY pclass ORDER BY fare DESC) AS rn,
                  LAG(fare, 1) OVER(PARTITION BY pclass ORDER BY fare DESC) AS higherFare,
                  LEAD(fare, 1) OVER(PARTITION BY pclass ORDER BY fare DESC) AS lowerFare,
                  ROUND(AVG(fare) OVER(
                      PARTITION BY pclass ORDER BY fare DESC
                      ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
                  ), 2) AS movingAvg3
              FROM titanic
              WHERE survived = 1 AND age IS NOT NULL
          )
          SELECT
              pclass,
              sex,
              age,
              fare,
              higherFare,
              lowerFare,
              movingAvg3,
              ROUND(fare - COALESCE(lowerFare, fare), 2) AS diffFromLower
          FROM rankedPassengers
          WHERE rn <= 5
          ORDER BY pclass, rn
      """).show()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 11단계. 최종 종합 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.
    resultCheck: 11단계. 최종 종합 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 고급 윈도우 함수 프로젝트
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
  explanation: |-
    고급 윈도우 함수를 종합 활용하여 타이타닉 데이터를 심층 분석해봅시다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import pandas as pd
    import duckdb
    data = pd.DataFrame({
        "survived": [0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
        "pclass": [3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 1],
        "sex": ["male", "female", "female", "male", "female", "male", "female", "male", "male", "male", "male", "female"],
        "age": [22, 38, 18, None, 29, 41, 45, 54, 49, 36, 42, 31],
        "fare": [7.25, 71.28, 13.00, 21.08, 76.29, 8.05, 83.47, 26.00, 35.50, 30.50, 13.00, 79.65],
        "embarked": ["S", "C", "S", None, "C", "Q", "C", "S", "S", "C", "S", "C"],
        "class": ["Third", "First", "Second", "Second", "First", "Third", "First", "Second", "First", "First", "Second", "First"],
        "who": ["man", "woman", "woman", "child", "woman", "man", "woman", "man", "man", "man", "man", "woman"],
        "name": ["Smith, Mr. John", "Smith, Mrs. Anna", "Smith, Miss. Clara", "Brown, Master. Tim", "Wilson, Mrs. Rose", "Brown, Mr. George", "Doe, Dr. Helen", "Miller, Rev. James", "Stone, Col. Arthur", "Major, Major. Alan", "Taylor, Capt. Mark", "Brown, Miss. Ella"],
    })
    tbl1 = duckdb.from_df(data)
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import pandas as pd
      import duckdb
      data = pd.DataFrame({
          "survived": [0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
          "pclass": [3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 1],
          "sex": ["male", "female", "female", "male", "female", "male", "female", "male", "male", "male", "male", "female"],
          "age": [22, 38, 18, None, 29, 41, 45, 54, 49, 36, 42, 31],
          "fare": [7.25, 71.28, 13.00, 21.08, 76.29, 8.05, 83.47, 26.00, 35.50, 30.50, 13.00, 79.65],
          "embarked": ["S", "C", "S", None, "C", "Q", "C", "S", "S", "C", "S", "C"],
          "class": ["Third", "First", "Second", "Second", "First", "Third", "First", "Second", "First", "First", "Second", "First"],
          "who": ["man", "woman", "woman", "child", "woman", "man", "woman", "man", "man", "man", "man", "woman"],
          "name": ["Smith, Mr. John", "Smith, Mrs. Anna", "Smith, Miss. Clara", "Brown, Master. Tim", "Wilson, Mrs. Rose", "Brown, Mr. George", "Doe, Dr. Helen", "Miller, Rev. James", "Stone, Col. Arthur", "Major, Major. Alan", "Taylor, Capt. Mark", "Brown, Miss. Ella"],
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
    content: 고급 윈도우 함수를 완벽히 마스터했습니다!
  - type: list
    items:
    - LAG(col, n) - n행 이전 값 가져오기
    - LEAD(col, n) - n행 다음 값 가져오기
    - ROWS BETWEEN ... AND ... - 윈도우 프레임 지정
    - 이동 평균 - ROWS BETWEEN n PRECEDING AND CURRENT ROW
    - 누적 합계 - ROWS UNBOUNDED PRECEDING
    - QUALIFY - 윈도우 함수 결과 직접 필터링
    - WINDOW 절 - 윈도우 정의 재사용
  - type: text
    content: 다음 시간에는 문자열 함수와 정규표현식으로 텍스트 데이터를 처리하는 방법을 배웁니다!
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
  - id: duckdb_08-lag-moving-window-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - workflow_validation
    title: LAG와 이동 평균을 같은 시간축에 계산하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 센서별 시각 순서에서 이전 값 차이와 현재 포함 3개 이동 평균을 반환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - LAG 첫 행은 이전 값이 없으므로 None입니다.
    - ROWS 2 PRECEDING 프레임은 최대 현재 포함 3개입니다.
    exercise:
      prompt: sensor_windows(rows)를 완성하세요.
      starterCode: |-
        def sensor_windows(rows):
            raise NotImplementedError
      solution: |
        def sensor_windows(rows):
            grouped = {}
            for row in rows:
                grouped.setdefault(row["sensor"], []).append(row)
            result = []
            for sensor in sorted(grouped):
                values = []
                for row in sorted(grouped[sensor], key=lambda item: item["time"]):
                    previous = values[-1] if values else None
                    values.append(row["value"])
                    frame = values[-3:]
                    result.append({"sensor": sensor, "time": row["time"], "delta": None if previous is None else row["value"] - previous, "movingMean": round(sum(frame) / len(frame), 2)})
            return result
      hints: *id001
    check:
      id: python.duckdb.duckdb_08.lag-moving-window.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.duckdb.duckdb_08.lag-moving-window.mastery.behavior.v1.fixture
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
        entry: sensor_windows
        cases:
        - id: computes-lag-and-bounded-frame
          arguments:
          - value:
            - sensor: a
              time: 1
              value: 3
            - sensor: a
              time: 2
              value: 6
            - sensor: a
              time: 3
              value: 9
            - sensor: a
              time: 4
              value: 12
          expectedReturn:
          - sensor: a
            time: 1
            delta: null
            movingMean: 3.0
          - sensor: a
            time: 2
            delta: 3
            movingMean: 4.5
          - sensor: a
            time: 3
            delta: 3
            movingMean: 6.0
          - sensor: a
            time: 4
            delta: 3
            movingMean: 9.0
        - id: resets-partition
          arguments:
          - value:
            - sensor: b
              time: 1
              value: 7
          expectedReturn:
          - sensor: b
            time: 1
            delta: null
            movingMean: 7.0
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: duckdb_08-qualify-change-events-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - duckdb_08-lag-moving-window-mastery
    title: 새 가격 데이터에 QUALIFY 패턴 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 상품별 이전 가격과 비교해 threshold 이상의 변화 행만 남긴다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 먼저 LAG를 계산하고 그 결과를 QUALIFY 조건으로 거르세요.
    - partition 사이의 이전 값을 섞지 마세요.
    exercise:
      prompt: significant_price_changes(rows, threshold)를 완성하세요.
      starterCode: |-
        def significant_price_changes(rows, threshold):
            raise NotImplementedError
      solution: |
        def significant_price_changes(rows, threshold):
            grouped = {}
            for row in rows:
                grouped.setdefault(row["product"], []).append(row)
            result = []
            for product in sorted(grouped):
                previous = None
                for row in sorted(grouped[product], key=lambda item: item["date"]):
                    if previous is not None:
                        change = row["price"] - previous
                        if abs(change) >= threshold:
                            result.append({"product": product, "date": row["date"], "change": change})
                    previous = row["price"]
            return result
      hints: *id002
    check:
      id: python.duckdb.duckdb_08.qualify-change-events.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.duckdb.duckdb_08.qualify-change-events.transfer.behavior.v1.fixture
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
        entry: significant_price_changes
        cases:
        - id: filters-after-lag
          arguments:
          - value:
            - product: A
              date: 1
              price: 10
            - product: A
              date: 2
              price: 12
            - product: A
              date: 3
              price: 8
          - value: 3
          expectedReturn:
          - product: A
            date: 3
            change: -4
        - id: does-not-cross-products
          arguments:
          - value:
            - product: A
              date: 1
              price: 100
            - product: B
              date: 1
              price: 1
          - value: 1
          expectedReturn: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: duckdb_08-advanced-window-frame-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - duckdb_08-qualify-change-events-transfer
    title: 고급 window frame 선택 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: LAG, rolling ROWS, QUALIFY의 책임을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - ROWS frame은 달력 기간이 아니라 행 개수입니다.
    - window alias 필터는 QUALIFY 단계에서 수행하세요.
    exercise:
      prompt: choose_advanced_window(situation)를 완성하세요.
      starterCode: |-
        def choose_advanced_window(situation):
            raise NotImplementedError
      solution: |
        def choose_advanced_window(situation):
            table = {'previous-event': {'function': 'LAG', 'frame': 'ordered partition', 'risk': 'missing order'}, 'last-seven-rows': {'function': 'AVG', 'frame': 'ROWS 6 PRECEDING', 'risk': 'date gaps'}, 'filter-window-rank': {'function': 'QUALIFY', 'frame': 'after window', 'risk': 'WHERE too early'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.duckdb.duckdb_08.advanced-window-frame.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.duckdb.duckdb_08.advanced-window-frame.retrieval.behavior.v1.fixture
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
        entry: choose_advanced_window
        cases:
        - id: recalls-previous-event
          arguments:
          - value: previous-event
          expectedReturn:
            function: LAG
            frame: ordered partition
            risk: missing order
        - id: recalls-last-seven-rows
          arguments:
          - value: last-seven-rows
          expectedReturn:
            function: AVG
            frame: ROWS 6 PRECEDING
            risk: date gaps
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};