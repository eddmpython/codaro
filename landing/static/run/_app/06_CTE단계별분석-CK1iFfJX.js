var e=`meta:\r
  packages:\r
  - duckdb\r
  - pandas\r
  id: duckdb_06\r
  title: CTE단계별분석\r
  order: 6\r
  category: duckdb\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - CTE\r
  - WITH\r
  - INNER JOIN\r
  - tips\r
  - titanic\r
  - 가독성\r
  seo:\r
    title: DuckDB CTE 완벽 가이드 - WITH 절로 단계별 분석\r
    description: CTE(Common Table Expression)로 복잡한 쿼리를 단계별로 구조화합니다. WITH 절, 다중 CTE, JOIN 조합을 마스터합니다.\r
    keywords:\r
    - DuckDB CTE\r
    - WITH 절\r
    - Common Table Expression\r
    - SQL 가독성\r
    - 쿼리 구조화\r
intro:\r
  emoji: 🔗\r
  goal: CTE로 복잡한 쿼리를 가독성 높게 구조화하고 tips+titanic 데이터를 분석합니다.\r
  description: CTE(Common Table Expression)는 쿼리를 논리적 단계로 나누어 가독성을 높입니다. 서브쿼리보다 읽기 쉽고, 재사용 가능하며, 디버깅이 용이합니다.\r
    WITH 절로 임시 결과에 이름을 붙이고 여러 CTE를 연결하는 방법을 배웁니다.\r
  direction: CTE단계별분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.\r
  - CTE단계별분석 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 준비 입력 확인\r
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. CTE란? 처리 실행\r
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. CTE의 장점 결과 검증\r
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.\r
    - label: CTE단계별분석 재사용\r
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: SQL 분석 환경\r
      detail: duckdb, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: CTE단계별분석 실행\r
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.\r
    - label: CTE단계별분석 완료\r
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 준비\r
  structuredPrimary: true\r
  subtitle: tips + titanic\r
  goal: 1단계. 데이터 준비에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 이번 프로젝트에서는 두 데이터셋을 불러와 CTE(Common Table Expression) 활용법을 학습합니다. tips 데이터는 레스토랑 팁 정보 120건,\r
    titanic 데이터는 타이타닉 승객 정보 891건을 담고 있습니다. DuckDB는 pandas DataFrame을 바로 SQL로 쿼리할 수 있어 데이터 분석이 매우 편리합니다.\r
    duckdb.from_df()로 DataFrame을 DuckDB 테이블로 변환하면 즉시 SQL 문법을 사용할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import duckdb\r
\r
    dfTips = loadLocalDataset("tips")\r
    dfTitanic = loadLocalDataset("titanic")\r
    tips = duckdb.from_df(dfTips)\r
    titanic = duckdb.from_df(dfTitanic)\r
  exercise:\r
    prompt: 1단계. 데이터 준비 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import duckdb\r
\r
      dfTips = loadLocalDataset("tips")\r
      dfTitanic = loadLocalDataset("titanic")\r
      tips = duckdb.from_df(dfTips)\r
      titanic = duckdb.from_df(dfTitanic)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 데이터 준비의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 1단계. 데이터 준비 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step2_cte_intro\r
  title: 2단계. CTE란?\r
  structuredPrimary: true\r
  subtitle: WITH 절 소개\r
  goal: 2단계. CTE란?에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    CTE(Common Table Expression)는 WITH 절로 시작하는 임시 결과 집합입니다. 복잡한 쿼리를 읽기 쉽게 만드는 핵심 도구로, 마치 요리할 때 재료를 미리 준비해두는 것과 같습니다. 서브쿼리는 괄호 안에 중첩되어 읽기 어렵지만, CTE는 위에서 아래로 단계별로 흐름이 명확합니다. 예를 들어 "팁이 5달러 이상인 데이터"를 highTips라는 이름으로 정의하면, 이후 쿼리에서 highTips를 일반 테이블처럼 사용할 수 있습니다. 디버깅할 때도 CTE 각 단계를 개별적으로 실행해볼 수 있어 문제를 찾기 쉽습니다.\r
\r
    WITH name AS (SELECT ...)는 서브쿼리에 이름을 붙입니다. 이후 쿼리에서 name을 일반 테이블처럼 사용할 수 있습니다. 서브쿼리는 SELECT * FROM (SELECT ...) nested 형태로 괄호 속 괄호가 중첩되어 복잡하지만, CTE는 위에서 아래로 읽는 순서대로 작성되어 가독성이 훨씬 좋습니다. 실무에서는 3단계 이상 중첩되는 복잡한 쿼리에서 CTE를 필수적으로 사용합니다.\r
  tips:\r
  - WITH name AS (SELECT ...)는 서브쿼리에 이름을 붙입니다. 이후 쿼리에서 name을 일반 테이블처럼 사용할 수 있습니다. 서브쿼리는 SELECT * FROM\r
    (SELECT ...) nested 형태로 괄호 속 괄호가 중첩되어 복잡하지만, CTE는 위에서 아래로 읽는 순서대로 작성되어 가독성이 훨씬 좋습니다. 실무에서는 3단계 이상\r
    중첩되는 복잡한 쿼리에서 CTE를 필수적으로 사용합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH highTips AS (\r
            SELECT *\r
            FROM tips\r
            WHERE tip > 5\r
        )\r
        SELECT day, COUNT(*) AS cnt, ROUND(AVG(tip), 2) AS avgTip\r
        FROM highTips\r
        GROUP BY day\r
        ORDER BY avgTip DESC\r
    """).show()\r
  exercise:\r
    prompt: 2단계. CTE란? 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH highTips AS (\r
              SELECT *\r
              FROM tips\r
              WHERE tip > 5\r
          )\r
          SELECT day, COUNT(*) AS cnt, ROUND(AVG(tip), 2) AS avgTip\r
          FROM highTips\r
          GROUP BY day\r
          ORDER BY avgTip DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. CTE란?의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 2단계. CTE란? 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step3_cte_benefits\r
  title: 3단계. CTE의 장점\r
  structuredPrimary: true\r
  subtitle: 왜 CTE를 사용하나?\r
  goal: 3단계. CTE의 장점에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    CTE는 다음 3가지 이유로 서브쿼리보다 훨씬 우수합니다. 첫째, 가독성입니다. 서브쿼리는 안쪽부터 읽어야 하지만 CTE는 위에서 아래로 자연스럽게 읽힙니다. 둘째, 재사용성입니다. 같은 서브쿼리를 여러 번 작성할 필요 없이 CTE를 한 번 정의하면 여러 곳에서 참조할 수 있습니다. 셋째, 디버깅 용이성입니다. 복잡한 쿼리가 에러를 내면 어디가 문제인지 찾기 어렵지만, CTE는 각 단계를 개별적으로 실행해서 중간 결과를 확인할 수 있습니다. 실무에서 팀원들과 협업할 때 CTE로 작성된 쿼리가 훨씬 이해하기 쉽고 유지보수가 편합니다.\r
\r
    CTE를 사용하면 복잡한 쿼리를 논리적 단계로 나눌 수 있습니다. 예를 들어 '필터링 → 집계 → 정렬' 순서를 각각 CTE로 만들면 각 단계의 의도가 명확해집니다. 서브쿼리로 작성하면 중첩이 깊어져 어디서 무엇을 하는지 파악하기 어렵습니다.\r
  tips:\r
  - CTE를 사용하면 복잡한 쿼리를 논리적 단계로 나눌 수 있습니다. 예를 들어 '필터링 → 집계 → 정렬' 순서를 각각 CTE로 만들면 각 단계의 의도가 명확해집니다. 서브쿼리로\r
    작성하면 중첩이 깊어져 어디서 무엇을 하는지 파악하기 어렵습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH highTips AS (\r
            SELECT * FROM tips WHERE tip > 5\r
        )\r
        SELECT day, COUNT(*) AS highTipCount\r
        FROM highTips\r
        GROUP BY day\r
    """).show()\r
  exercise:\r
    prompt: 3단계. CTE의 장점 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH highTips AS (\r
              SELECT * FROM tips WHERE tip > 5\r
          )\r
          SELECT day, COUNT(*) AS highTipCount\r
          FROM highTips\r
          GROUP BY day\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. CTE의 장점의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 3단계. CTE의 장점 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step4_multi_cte\r
  title: 4단계. 여러 CTE 연결\r
  structuredPrimary: true\r
  subtitle: 콤마로 구분\r
  goal: 4단계. 여러 CTE 연결에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    한 번의 쿼리에서 여러 CTE를 콤마(,)로 구분하여 정의할 수 있습니다. 각 CTE는 독립적인 분석 단계를 나타내며, 마지막 SELECT에서 이들을 UNION이나 JOIN으로 결합합니다. 예를 들어 "요일별 통계"와 "시간대별 통계"를 각각 별도의 CTE로 만든 후, UNION ALL로 세로로 합쳐서 한 번에 비교할 수 있습니다. 이렇게 하면 같은 형식의 여러 집계 결과를 효율적으로 얻을 수 있습니다.\r
\r
    WITH a AS (...), b AS (...)처럼 콤마로 여러 CTE를 정의합니다. 각 CTE는 독립적으로 실행되며, 최종 SELECT에서 원하는 CTE를 사용합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH\r
        daySummary AS (\r
            SELECT day, COUNT(*) AS cnt, SUM(total_bill) AS totalSales\r
            FROM tips\r
            GROUP BY day\r
        ),\r
        timeSummary AS (\r
            SELECT time, COUNT(*) AS cnt, SUM(total_bill) AS totalSales\r
            FROM tips\r
            GROUP BY time\r
        )\r
        SELECT 'day' AS category, day AS name, cnt, ROUND(totalSales, 2) AS sales FROM daySummary\r
        UNION ALL\r
        SELECT 'time' AS category, time AS name, cnt, ROUND(totalSales, 2) AS sales FROM timeSummary\r
        ORDER BY category, sales DESC\r
    """).show()\r
  exercise:\r
    prompt: 4단계. 여러 CTE 연결 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH\r
          daySummary AS (\r
              SELECT day, COUNT(*) AS cnt, SUM(total_bill) AS totalSales\r
              FROM tips\r
              GROUP BY day\r
          ),\r
          timeSummary AS (\r
              SELECT time, COUNT(*) AS cnt, SUM(total_bill) AS totalSales\r
              FROM tips\r
              GROUP BY time\r
          )\r
          SELECT 'day' AS category, day AS name, cnt, ROUND(totalSales, 2) AS sales FROM daySummary\r
          UNION ALL\r
          SELECT 'time' AS category, time AS name, cnt, ROUND(totalSales, 2) AS sales FROM timeSummary\r
          ORDER BY category, sales DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 여러 CTE 연결의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 4단계. 여러 CTE 연결 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step5_cte_chain\r
  title: 5단계. CTE 체이닝\r
  structuredPrimary: true\r
  subtitle: 이전 CTE 참조하기\r
  goal: 5단계. CTE 체이닝에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    앞에서 정의한 CTE를 다음 CTE에서 참조할 수 있습니다. 이를 CTE 체이닝(chaining)이라고 하며, 복잡한 분석을 단계별로 쪼개는 핵심 기법입니다. 마치 레고 블록을 쌓듯이 step1 결과를 step2에서 사용하고, step2 결과를 step3에서 사용하는 방식입니다. 예를 들어 "집계 → 비율 계산 → 순위 매기기" 3단계를 각각 CTE로 분리하면 각 단계가 무엇을 하는지 명확해지고, 중간 결과도 쉽게 확인할 수 있습니다. 실무에서 10단계 이상의 복잡한 분석도 CTE 체이닝으로 관리 가능합니다.\r
\r
    CTE 체이닝의 장점: 각 단계를 개별적으로 실행해서 중간 결과를 확인할 수 있습니다. 복잡한 쿼리를 디버깅할 때 매우 유용합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH\r
        step1 AS (\r
            SELECT day, sex, COUNT(*) AS cnt, SUM(tip) AS totalTip\r
            FROM tips\r
            GROUP BY day, sex\r
        ),\r
        step2 AS (\r
            SELECT day, sex, cnt, totalTip,\r
                   ROUND(totalTip / cnt, 2) AS avgTip\r
            FROM step1\r
        ),\r
        step3 AS (\r
            SELECT *,\r
                   RANK() OVER(PARTITION BY day ORDER BY avgTip DESC) AS tipRank\r
            FROM step2\r
        )\r
        SELECT day, sex, cnt, ROUND(totalTip, 2) AS totalTip, avgTip, tipRank\r
        FROM step3\r
        WHERE tipRank = 1\r
        ORDER BY avgTip DESC\r
    """).show()\r
  exercise:\r
    prompt: 5단계. CTE 체이닝 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH\r
          step1 AS (\r
              SELECT day, sex, COUNT(*) AS cnt, SUM(tip) AS totalTip\r
              FROM tips\r
              GROUP BY day, sex\r
          ),\r
          step2 AS (\r
              SELECT day, sex, cnt, totalTip,\r
                     ROUND(totalTip / cnt, 2) AS avgTip\r
              FROM step1\r
          ),\r
          step3 AS (\r
              SELECT *,\r
                     RANK() OVER(PARTITION BY day ORDER BY avgTip DESC) AS tipRank\r
              FROM step2\r
          )\r
          SELECT day, sex, cnt, ROUND(totalTip, 2) AS totalTip, avgTip, tipRank\r
          FROM step3\r
          WHERE tipRank = 1\r
          ORDER BY avgTip DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. CTE 체이닝의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 5단계. CTE 체이닝 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step6_join_intro\r
  title: 6단계. INNER JOIN 기본\r
  structuredPrimary: true\r
  subtitle: 두 테이블 합치기\r
  goal: 6단계. INNER JOIN 기본에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    INNER JOIN은 두 테이블을 공통 키(key)로 연결하여 합치는 연산입니다. 양쪽 테이블에 모두 존재하는 행만 결과에 포함되므로 교집합 개념과 같습니다. 예를 들어 "요일별 평균 결제금액" 테이블과 "요일별 평균 팁" 테이블을 요일(day) 컬럼으로 JOIN하면, 같은 요일의 두 통계를 나란히 비교할 수 있습니다. CTE와 함께 사용하면 각 집계를 별도 CTE로 만들고 JOIN으로 결합하여 복잡한 비교 분석이 가능합니다. LEFT JOIN, RIGHT JOIN도 있지만 INNER JOIN이 가장 기본이고 많이 사용됩니다.\r
\r
    INNER JOIN ... ON 조건은 조건을 만족하는 행만 결합합니다. 한쪽에만 있는 데이터는 결과에서 제외됩니다. 예를 들어 d.day = t.day 조건은 '요일이 같은' 행끼리만 연결합니다. 테이블 별칭(d, t)을 사용하면 컬럼명이 겹칠 때 어느 테이블의 컬럼인지 명확하게 구분할 수 있습니다.\r
  tips:\r
  - INNER JOIN ... ON 조건은 조건을 만족하는 행만 결합합니다. 한쪽에만 있는 데이터는 결과에서 제외됩니다. 예를 들어 d.day = t.day 조건은 '요일이 같은'\r
    행끼리만 연결합니다. 테이블 별칭(d, t)을 사용하면 컬럼명이 겹칠 때 어느 테이블의 컬럼인지 명확하게 구분할 수 있습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH\r
        daySummary AS (\r
            SELECT day, ROUND(AVG(total_bill), 2) AS avgBill\r
            FROM tips\r
            GROUP BY day\r
        ),\r
        dayTipSummary AS (\r
            SELECT day, ROUND(AVG(tip), 2) AS avgTip\r
            FROM tips\r
            GROUP BY day\r
        )\r
        SELECT d.day, d.avgBill, t.avgTip,\r
               ROUND(t.avgTip / d.avgBill * 100, 1) AS tipPercent\r
        FROM daySummary d\r
        INNER JOIN dayTipSummary t ON d.day = t.day\r
        ORDER BY tipPercent DESC\r
    """).show()\r
  exercise:\r
    prompt: 6단계. INNER JOIN 기본 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH\r
          daySummary AS (\r
              SELECT day, ROUND(AVG(total_bill), 2) AS avgBill\r
              FROM tips\r
              GROUP BY day\r
          ),\r
          dayTipSummary AS (\r
              SELECT day, ROUND(AVG(tip), 2) AS avgTip\r
              FROM tips\r
              GROUP BY day\r
          )\r
          SELECT d.day, d.avgBill, t.avgTip,\r
                 ROUND(t.avgTip / d.avgBill * 100, 1) AS tipPercent\r
          FROM daySummary d\r
          INNER JOIN dayTipSummary t ON d.day = t.day\r
          ORDER BY tipPercent DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. INNER JOIN 기본의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 6단계. INNER JOIN 기본 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step7_tips_analysis\r
  title: 7단계. Tips 성별 비교 분석\r
  structuredPrimary: true\r
  subtitle: CTE + JOIN 실전\r
  goal: 7단계. Tips 성별 비교 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    남성과 여성의 요일별 팁 패턴을 비교하는 실전 분석입니다. 각 성별의 통계를 별도 CTE로 만든 후 JOIN으로 합쳐 나란히 비교합니다. 이렇게 하면 "남성은 어느 요일에 팁을 많이 주는가?", "여성과 비교하면 어떤 차이가 있는가?"를 한눈에 파악할 수 있습니다. 두 그룹을 따로 집계한 후 합치는 패턴은 A/B 테스트, 실험군/대조군 비교 등 실무에서 매우 자주 사용됩니다.\r
\r
    WHERE 절로 필터링한 후 GROUP BY로 집계하는 패턴을 각 성별마다 별도 CTE로 만들었습니다. 이렇게 하면 남성/여성 통계를 독립적으로 계산한 후 JOIN으로 병합하여 차이(tipDiff)를 쉽게 계산할 수 있습니다. 한 쿼리에서 CASE WHEN으로 처리할 수도 있지만, CTE로 나누면 각 그룹의 중간 결과를 명확하게 볼 수 있어 디버깅과 검증이 훨씬 쉽습니다.\r
  tips:\r
  - WHERE 절로 필터링한 후 GROUP BY로 집계하는 패턴을 각 성별마다 별도 CTE로 만들었습니다. 이렇게 하면 남성/여성 통계를 독립적으로 계산한 후 JOIN으로 병합하여\r
    차이(tipDiff)를 쉽게 계산할 수 있습니다. 한 쿼리에서 CASE WHEN으로 처리할 수도 있지만, CTE로 나누면 각 그룹의 중간 결과를 명확하게 볼 수 있어 디버깅과\r
    검증이 훨씬 쉽습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH\r
        maleStats AS (\r
            SELECT day,\r
                   COUNT(*) AS maleCnt,\r
                   ROUND(AVG(tip), 2) AS maleAvgTip\r
            FROM tips\r
            WHERE sex = 'Male'\r
            GROUP BY day\r
        ),\r
        femaleStats AS (\r
            SELECT day,\r
                   COUNT(*) AS femaleCnt,\r
                   ROUND(AVG(tip), 2) AS femaleAvgTip\r
            FROM tips\r
            WHERE sex = 'Female'\r
            GROUP BY day\r
        )\r
        SELECT m.day,\r
               m.maleCnt, m.maleAvgTip,\r
               f.femaleCnt, f.femaleAvgTip,\r
               ROUND(m.maleAvgTip - f.femaleAvgTip, 2) AS tipDiff\r
        FROM maleStats m\r
        INNER JOIN femaleStats f ON m.day = f.day\r
        ORDER BY tipDiff DESC\r
    """).show()\r
  exercise:\r
    prompt: 7단계. Tips 성별 비교 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH\r
          maleStats AS (\r
              SELECT day,\r
                     COUNT(*) AS maleCnt,\r
                     ROUND(AVG(tip), 2) AS maleAvgTip\r
              FROM tips\r
              WHERE sex = 'Male'\r
              GROUP BY day\r
          ),\r
          femaleStats AS (\r
              SELECT day,\r
                     COUNT(*) AS femaleCnt,\r
                     ROUND(AVG(tip), 2) AS femaleAvgTip\r
              FROM tips\r
              WHERE sex = 'Female'\r
              GROUP BY day\r
          )\r
          SELECT m.day,\r
                 m.maleCnt, m.maleAvgTip,\r
                 f.femaleCnt, f.femaleAvgTip,\r
                 ROUND(m.maleAvgTip - f.femaleAvgTip, 2) AS tipDiff\r
          FROM maleStats m\r
          INNER JOIN femaleStats f ON m.day = f.day\r
          ORDER BY tipDiff DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. Tips 성별 비교 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 7단계. Tips 성별 비교 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step8_titanic_survival\r
  title: 8단계. Titanic 생존율 분석\r
  structuredPrimary: true\r
  subtitle: 클래스별 생존 통계\r
  goal: 8단계. Titanic 생존율 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    타이타닉 데이터로 객실 등급(pclass)별 생존자와 사망자를 분석합니다. 전체 승객 수와 생존자 수를 각각 별도 CTE로 만든 후 JOIN하여 생존율을 계산하는 패턴입니다. 이 방식은 "전체 중 일부"를 분석할 때 매우 유용합니다. 예를 들어 전체 주문 중 완료된 주문, 전체 회원 중 활성 회원 등을 비율로 분석할 때 동일한 구조를 사용할 수 있습니다. CTE 덕분에 전체 집계와 조건부 집계를 명확히 분리하여 계산할 수 있습니다.\r
\r
    두 CTE를 pclass로 JOIN하여 등급별 생존율을 계산했습니다. survived = 1 조건으로 생존자만 세고, 전체에서 생존자를 빼면 사망자 수가 됩니다. 100.0을 곱해 소수점을 유지한 후 나누는 것이 정확한 비율 계산 패턴입니다. 정수 나누기(/)는 소수점이 잘릴 수 있으므로 주의해야 합니다.\r
  tips:\r
  - 두 CTE를 pclass로 JOIN하여 등급별 생존율을 계산했습니다. survived = 1 조건으로 생존자만 세고, 전체에서 생존자를 빼면 사망자 수가 됩니다. 100.0을\r
    곱해 소수점을 유지한 후 나누는 것이 정확한 비율 계산 패턴입니다. 정수 나누기(/)는 소수점이 잘릴 수 있으므로 주의해야 합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH\r
        totalByClass AS (\r
            SELECT pclass, COUNT(*) AS total\r
            FROM titanic\r
            GROUP BY pclass\r
        ),\r
        survivedByClass AS (\r
            SELECT pclass, COUNT(*) AS survived\r
            FROM titanic\r
            WHERE survived = 1\r
            GROUP BY pclass\r
        )\r
        SELECT t.pclass,\r
               t.total,\r
               s.survived,\r
               t.total - s.survived AS died,\r
               ROUND(s.survived * 100.0 / t.total, 1) AS survivalRate\r
        FROM totalByClass t\r
        INNER JOIN survivedByClass s ON t.pclass = s.pclass\r
        ORDER BY t.pclass\r
    """).show()\r
  exercise:\r
    prompt: 8단계. Titanic 생존율 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH\r
          totalByClass AS (\r
              SELECT pclass, COUNT(*) AS total\r
              FROM titanic\r
              GROUP BY pclass\r
          ),\r
          survivedByClass AS (\r
              SELECT pclass, COUNT(*) AS survived\r
              FROM titanic\r
              WHERE survived = 1\r
              GROUP BY pclass\r
          )\r
          SELECT t.pclass,\r
                 t.total,\r
                 s.survived,\r
                 t.total - s.survived AS died,\r
                 ROUND(s.survived * 100.0 / t.total, 1) AS survivalRate\r
          FROM totalByClass t\r
          INNER JOIN survivedByClass s ON t.pclass = s.pclass\r
          ORDER BY t.pclass\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. Titanic 생존율 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 8단계. Titanic 생존율 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step9_complex_analysis\r
  title: 9단계. Titanic 복합 분석\r
  structuredPrimary: true\r
  subtitle: 클래스-성별 생존율\r
  goal: 9단계. Titanic 복합 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    객실 등급과 성별을 동시에 고려한 복합 생존율 분석입니다. CTE 체이닝으로 "집계 → 비율 계산 → 순위 매기기" 3단계를 명확히 분리합니다. 첫 번째 CTE는 pclass와 sex로 그룹화하여 기본 집계를 수행하고, 두 번째 CTE는 생존율을 계산하며, 세 번째 CTE는 전체 순위를 매깁니다. 이렇게 단계를 나누면 각 단계의 로직이 단순해지고, 중간 결과를 확인하며 검증할 수 있습니다. 복잡한 비즈니스 로직을 CTE 체이닝으로 구조화하는 것이 실무의 핵심 패턴입니다.\r
\r
    3단계 CTE 체이닝의 장점은 각 단계를 독립적으로 테스트할 수 있다는 것입니다. groupStats만 실행해보고, 그 다음 groupRates를 추가하고, 마지막으로 ranked를 추가하는 식으로 점진적으로 쿼리를 완성할 수 있습니다. 한 번에 복잡한 쿼리를 작성하면 에러가 나도 어디가 문제인지 찾기 어렵지만, CTE로 나누면 어느 단계에서 문제가 생겼는지 쉽게 파악할 수 있습니다.\r
  tips:\r
  - 3단계 CTE 체이닝의 장점은 각 단계를 독립적으로 테스트할 수 있다는 것입니다. groupStats만 실행해보고, 그 다음 groupRates를 추가하고, 마지막으로 ranked를\r
    추가하는 식으로 점진적으로 쿼리를 완성할 수 있습니다. 한 번에 복잡한 쿼리를 작성하면 에러가 나도 어디가 문제인지 찾기 어렵지만, CTE로 나누면 어느 단계에서 문제가 생겼는지\r
    쉽게 파악할 수 있습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH\r
        groupStats AS (\r
            SELECT pclass, sex,\r
                   COUNT(*) AS total,\r
                   SUM(survived) AS survived\r
            FROM titanic\r
            GROUP BY pclass, sex\r
        ),\r
        groupRates AS (\r
            SELECT pclass, sex, total, survived,\r
                   ROUND(survived * 100.0 / total, 1) AS survivalRate\r
            FROM groupStats\r
        ),\r
        ranked AS (\r
            SELECT *,\r
                   RANK() OVER(ORDER BY survivalRate DESC) AS overallRank\r
            FROM groupRates\r
        )\r
        SELECT pclass, sex, total, survived, survivalRate, overallRank\r
        FROM ranked\r
        ORDER BY overallRank\r
    """).show()\r
  exercise:\r
    prompt: 9단계. Titanic 복합 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH\r
          groupStats AS (\r
              SELECT pclass, sex,\r
                     COUNT(*) AS total,\r
                     SUM(survived) AS survived\r
              FROM titanic\r
              GROUP BY pclass, sex\r
          ),\r
          groupRates AS (\r
              SELECT pclass, sex, total, survived,\r
                     ROUND(survived * 100.0 / total, 1) AS survivalRate\r
              FROM groupStats\r
          ),\r
          ranked AS (\r
              SELECT *,\r
                     RANK() OVER(ORDER BY survivalRate DESC) AS overallRank\r
              FROM groupRates\r
          )\r
          SELECT pclass, sex, total, survived, survivalRate, overallRank\r
          FROM ranked\r
          ORDER BY overallRank\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. Titanic 복합 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 9단계. Titanic 복합 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step10_cte_join_combo\r
  title: 10단계. CTE와 JOIN 종합\r
  structuredPrimary: true\r
  subtitle: 모든 개념 결합\r
  goal: 10단계. CTE와 JOIN 종합에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    CTE, 윈도우 함수, JOIN, CASE WHEN을 모두 활용한 종합 분석입니다. 요일+시간대별 팁 통계를 계산하고, 이를 요일 전체 평균과 비교하여 "평균 이상인지 이하인지" 판단합니다. 첫 번째 CTE는 요일+시간대로 집계하고, 두 번째 CTE는 요일별 평균을 계산한 후, JOIN으로 두 결과를 결합하여 비교합니다. 이런 패턴은 "개별 값 vs 그룹 평균" 비교에 자주 사용되며, 예를 들어 개인 성과 vs 팀 평균, 지점 매출 vs 전체 평균 등을 분석할 때 유용합니다.\r
\r
    CASE WHEN을 사용해 조건부 분류를 수행했습니다. t.avgTip > d.dayAvgTip 조건으로 '평균 이상'과 '평균 이하'를 구분합니다. 이렇게 숫자를 범주로 변환하면 데이터를 이해하기 쉽고, 시각화나 보고서 작성 시에도 유용합니다. CTE + JOIN + CASE의 조합은 실무에서 가장 자주 사용하는 분석 패턴 중 하나입니다.\r
  tips:\r
  - CASE WHEN을 사용해 조건부 분류를 수행했습니다. t.avgTip > d.dayAvgTip 조건으로 '평균 이상'과 '평균 이하'를 구분합니다. 이렇게 숫자를 범주로 변환하면\r
    데이터를 이해하기 쉽고, 시각화나 보고서 작성 시에도 유용합니다. CTE + JOIN + CASE의 조합은 실무에서 가장 자주 사용하는 분석 패턴 중 하나입니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH\r
        tipStats AS (\r
            SELECT day, time,\r
                   COUNT(*) AS cnt,\r
                   ROUND(AVG(tip), 2) AS avgTip\r
            FROM tips\r
            GROUP BY day, time\r
        ),\r
        dayAvg AS (\r
            SELECT day, ROUND(AVG(avgTip), 2) AS dayAvgTip\r
            FROM tipStats\r
            GROUP BY day\r
        )\r
        SELECT t.day, t.time, t.cnt, t.avgTip,\r
               d.dayAvgTip,\r
               CASE\r
                   WHEN t.avgTip > d.dayAvgTip THEN '평균 이상'\r
                   ELSE '평균 이하'\r
               END AS comparison\r
        FROM tipStats t\r
        INNER JOIN dayAvg d ON t.day = d.day\r
        ORDER BY t.day, t.time\r
    """).show()\r
  exercise:\r
    prompt: 10단계. CTE와 JOIN 종합 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH\r
          tipStats AS (\r
              SELECT day, time,\r
                     COUNT(*) AS cnt,\r
                     ROUND(AVG(tip), 2) AS avgTip\r
              FROM tips\r
              GROUP BY day, time\r
          ),\r
          dayAvg AS (\r
              SELECT day, ROUND(AVG(avgTip), 2) AS dayAvgTip\r
              FROM tipStats\r
              GROUP BY day\r
          )\r
          SELECT t.day, t.time, t.cnt, t.avgTip,\r
                 d.dayAvgTip,\r
                 CASE\r
                     WHEN t.avgTip > d.dayAvgTip THEN '평균 이상'\r
                     ELSE '평균 이하'\r
                 END AS comparison\r
          FROM tipStats t\r
          INNER JOIN dayAvg d ON t.day = d.day\r
          ORDER BY t.day, t.time\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. CTE와 JOIN 종합의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 10단계. CTE와 JOIN 종합 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step11_final\r
  title: 11단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: CTE 실전 패턴\r
  goal: 11단계. 최종 결과물에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: CTE를 활용한 실전 분석 패턴을 완성했습니다! 복잡한 쿼리를 논리적 단계로 나누어 가독성과 유지보수성을 크게 높였습니다. 이제 단일 CTE, 다중 CTE,\r
    CTE 체이닝, CTE+JOIN 모든 패턴을 활용할 수 있습니다. 실무에서는 이런 패턴들을 조합하여 10단계 이상의 복잡한 분석 파이프라인도 구축할 수 있습니다. CTE는 SQL\r
    가독성을 높이는 가장 강력한 도구이며, 팀 협업과 코드 리뷰에서 필수적입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            'WITH name AS (...)' AS pattern,\r
            '단일 CTE' AS usage,\r
            '서브쿼리에 이름 부여' AS benefit\r
        UNION ALL\r
        SELECT\r
            'WITH a AS (...), b AS (...)',\r
            '다중 CTE',\r
            '여러 단계 정의'\r
        UNION ALL\r
        SELECT\r
            'CTE1 → CTE2 → CTE3',\r
            'CTE 체이닝',\r
            '단계별 분석 + 디버깅 용이'\r
        UNION ALL\r
        SELECT\r
            'CTE + INNER JOIN',\r
            'CTE 결합',\r
            '복잡한 집계 결과 비교'\r
    """).show()\r
  exercise:\r
    prompt: 11단계. 최종 결과물 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              'WITH name AS (...)' AS pattern,\r
              '단일 CTE' AS usage,\r
              '서브쿼리에 이름 부여' AS benefit\r
          UNION ALL\r
          SELECT\r
              'WITH a AS (...), b AS (...)',\r
              '다중 CTE',\r
              '여러 단계 정의'\r
          UNION ALL\r
          SELECT\r
              'CTE1 → CTE2 → CTE3',\r
              'CTE 체이닝',\r
              '단계별 분석 + 디버깅 용이'\r
          UNION ALL\r
          SELECT\r
              'CTE + INNER JOIN',\r
              'CTE 결합',\r
              '복잡한 집계 결과 비교'\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 최종 결과물의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 최종 결과물의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: CTE 종합 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    CTE 패턴을 종합 활용하여 복잡한 분석 쿼리를 작성해봅시다.\r
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
    content: CTE(Common Table Expression)를 완벽하게 마스터했습니다!\r
  - type: list\r
    items:\r
    - WITH name AS (SELECT ...) - CTE 기본 구조\r
    - 다중 CTE - WITH a AS (...), b AS (...) 콤마로 구분\r
    - CTE 체이닝 - 이전 CTE를 다음 CTE에서 참조\r
    - CTE + INNER JOIN - 두 CTE 결과를 결합\r
    - 가독성 - 서브쿼리보다 읽기 쉬운 구조\r
    - 디버깅 - 각 CTE를 개별 실행 가능\r
  - type: text\r
    content: 다음 시간에는 윈도우 함수로 순위와 누적 합계를 계산하는 방법을 배웁니다!\r
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