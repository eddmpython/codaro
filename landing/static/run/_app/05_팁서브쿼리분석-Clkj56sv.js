var e=`meta:\r
  packages:\r
  - duckdb\r
  - pandas\r
  id: duckdb_05\r
  title: 팁서브쿼리분석\r
  order: 5\r
  category: duckdb\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - tips\r
  - 서브쿼리\r
  - 스칼라\r
  - WHERE IN\r
  - FROM\r
  - 평균비교\r
  seo:\r
    title: DuckDB 서브쿼리 기초 - 팁 서브쿼리 분석\r
    description: 레스토랑 팁 데이터로 서브쿼리 패턴을 배웁니다. 스칼라 서브쿼리, WHERE 서브쿼리, FROM 서브쿼리를 실습합니다.\r
    keywords:\r
    - DuckDB\r
    - 서브쿼리\r
    - 스칼라 서브쿼리\r
    - WHERE IN\r
    - SQL 중첩 쿼리\r
intro:\r
  emoji: 🔍\r
  goal: 팁 데이터에서 서브쿼리로 전체 평균과 비교하고 고급 필터링을 수행합니다.\r
  description: 서브쿼리는 쿼리 안에 또 다른 쿼리를 넣는 기법입니다. 동적인 조건 필터링, 집계 결과 활용, 복잡한 비교 분석에 필수적입니다.\r
  direction: 팁서브쿼리분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.\r
  - 팁서브쿼리분석 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 준비 입력 확인\r
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 서브쿼리란? 처리 실행\r
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 스칼라 서브쿼리 결과 검증\r
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.\r
    - label: 팁서브쿼리분석 재사용\r
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: SQL 분석 환경\r
      detail: duckdb, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 팁서브쿼리분석 실행\r
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.\r
    - label: 팁서브쿼리분석 완료\r
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 준비\r
  structuredPrimary: true\r
  subtitle: tips 데이터 로드\r
  goal: 1단계. 데이터 준비에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 레스토랑 팁 데이터를 불러옵니다. 서브쿼리를 활용해 평균과 비교하고 고급 필터링을 수행합니다. 서브쿼리는 쿼리 안에 쿼리를 중첩하는 강력한 기법으로, 동적\r
    조건 필터링과 복잡한 집계 분석을 가능하게 합니다.\r
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
    prompt: 1단계. 데이터 준비 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
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
    noError: 1단계. 데이터 준비의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 1단계. 데이터 준비 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step2_subquery_intro\r
  title: 2단계. 서브쿼리란?\r
  structuredPrimary: true\r
  subtitle: 쿼리 안의 쿼리\r
  goal: 2단계. 서브쿼리란?에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 서브쿼리는 SELECT 문 안에 또 다른 SELECT 문을 넣는 것입니다. 크게 3가지 패턴이 있습니다. 1) 스칼라 서브쿼리 (SELECT 절에 사용),\r
    2) WHERE 서브쿼리 (조건 필터링에 사용), 3) FROM 서브쿼리 (집계 결과를 테이블처럼 사용).\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT AVG(tip) AS avgTip\r
        FROM tips\r
    """).show()\r
  exercise:\r
    prompt: 2단계. 서브쿼리란? 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT AVG(tip) AS avgTip\r
          FROM tips\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 서브쿼리란?의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 2단계. 서브쿼리란? 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step3_scalar_subquery\r
  title: 3단계. 스칼라 서브쿼리\r
  structuredPrimary: true\r
  subtitle: SELECT 절 안에 서브쿼리\r
  goal: 3단계. 스칼라 서브쿼리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    스칼라 서브쿼리는 SELECT 절에 서브쿼리를 넣어 단일 값(1행 1열)을 가져옵니다. 각 행마다 전체 평균과 비교할 때 매우 유용합니다. 예를 들어 "이 고객의 팁이 전체 평균보다 높은가?"라는 질문에 답할 수 있습니다. 서브쿼리는 메인 쿼리가 실행될 때마다 평가되어 동적인 비교가 가능합니다.\r
\r
    스칼라 서브쿼리는 반드시 단일 값(1행 1열)을 반환해야 합니다. (SELECT AVG(...) FROM ...)처럼 집계 함수를 사용하면 안전합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            total_bill,\r
            tip,\r
            (SELECT AVG(tip) FROM tips) AS avgTip,\r
            tip - (SELECT AVG(tip) FROM tips) AS diffFromAvg\r
        FROM tips\r
        ORDER BY tip DESC\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 3단계. 스칼라 서브쿼리 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              total_bill,\r
              tip,\r
              (SELECT AVG(tip) FROM tips) AS avgTip,\r
              tip - (SELECT AVG(tip) FROM tips) AS diffFromAvg\r
          FROM tips\r
          ORDER BY tip DESC\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 스칼라 서브쿼리의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 3단계. 스칼라 서브쿼리 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step4_scalar_tip_rate\r
  title: 4단계. 팁 비율 비교\r
  structuredPrimary: true\r
  subtitle: 스칼라 서브쿼리 활용\r
  goal: 4단계. 팁 비율 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 각 고객의 팁 비율을 전체 평균 팁 비율과 비교합니다. 평균보다 후하게 팁을 준 고객을 찾을 수 있습니다. 스칼라 서브쿼리는 매 행마다 평균값을 참조하여 개별\r
    데이터와 전체 통계를 동시에 볼 수 있게 해줍니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            total_bill,\r
            tip,\r
            ROUND(tip / total_bill * 100, 1) AS tipPct,\r
            ROUND((SELECT AVG(tip / total_bill) * 100 FROM tips), 1) AS avgTipPct\r
        FROM tips\r
        ORDER BY tipPct DESC\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 4단계. 팁 비율 비교 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              total_bill,\r
              tip,\r
              ROUND(tip / total_bill * 100, 1) AS tipPct,\r
              ROUND((SELECT AVG(tip / total_bill) * 100 FROM tips), 1) AS avgTipPct\r
          FROM tips\r
          ORDER BY tipPct DESC\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 팁 비율 비교의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 4단계. 팁 비율 비교 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step5_where_subquery\r
  title: 5단계. WHERE 서브쿼리\r
  structuredPrimary: true\r
  subtitle: 동적 조건 필터링\r
  goal: 5단계. WHERE 서브쿼리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    WHERE 절에 서브쿼리를 사용하면 하드코딩 없이 동적으로 조건을 설정할 수 있습니다. 평균 이상인 데이터만 필터링해봅니다.\r
\r
    WHERE 서브쿼리는 데이터 기반 필터링을 가능하게 합니다. WHERE tip > 3 대신 WHERE tip > (SELECT AVG(...))로 평균이 바뀌어도 자동 적용됩니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT *\r
        FROM tips\r
        WHERE tip > (SELECT AVG(tip) FROM tips)\r
        ORDER BY tip DESC\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 5단계. WHERE 서브쿼리 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT *\r
          FROM tips\r
          WHERE tip > (SELECT AVG(tip) FROM tips)\r
          ORDER BY tip DESC\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. WHERE 서브쿼리의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 5단계. WHERE 서브쿼리 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step6_where_in\r
  title: 6단계. WHERE IN 서브쿼리\r
  structuredPrimary: true\r
  subtitle: 목록 필터링\r
  goal: 6단계. WHERE IN 서브쿼리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    WHERE IN 서브쿼리로 특정 조건을 만족하는 그룹의 데이터만 선택할 수 있습니다. 평균 팁이 3달러 이상인 요일의 데이터만 조회합니다.\r
\r
    WHERE col IN (서브쿼리)는 서브쿼리 결과 목록에 포함된 값만 선택합니다. 서브쿼리는 단일 컬럼을 반환해야 합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            COUNT(*) AS cnt,\r
            ROUND(AVG(tip), 2) AS avgTip\r
        FROM tips\r
        WHERE day IN (\r
            SELECT day\r
            FROM tips\r
            GROUP BY day\r
            HAVING AVG(tip) > 3\r
        )\r
        GROUP BY day\r
        ORDER BY avgTip DESC\r
    """).show()\r
  exercise:\r
    prompt: 6단계. WHERE IN 서브쿼리 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              COUNT(*) AS cnt,\r
              ROUND(AVG(tip), 2) AS avgTip\r
          FROM tips\r
          WHERE day IN (\r
              SELECT day\r
              FROM tips\r
              GROUP BY day\r
              HAVING AVG(tip) > 3\r
          )\r
          GROUP BY day\r
          ORDER BY avgTip DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. WHERE IN 서브쿼리의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 6단계. WHERE IN 서브쿼리 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step7_from_subquery\r
  title: 7단계. FROM 서브쿼리\r
  structuredPrimary: true\r
  subtitle: 집계 결과를 테이블처럼 사용\r
  goal: 7단계. FROM 서브쿼리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    FROM 절에 서브쿼리를 넣으면 집계 결과를 마치 테이블처럼 사용할 수 있습니다. 복잡한 집계를 단계적으로 수행할 때 유용합니다.\r
\r
    FROM 서브쿼리는 반드시 AS로 별칭을 지정해야 합니다. 별칭 없이는 컬럼을 참조할 수 없습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            sub.day,\r
            sub.avgTip,\r
            sub.maxTip,\r
            sub.cnt\r
        FROM (\r
            SELECT\r
                day,\r
                ROUND(AVG(tip), 2) AS avgTip,\r
                MAX(tip) AS maxTip,\r
                COUNT(*) AS cnt\r
            FROM tips\r
            GROUP BY day\r
        ) AS sub\r
        ORDER BY sub.avgTip DESC\r
    """).show()\r
  exercise:\r
    prompt: 7단계. FROM 서브쿼리 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              sub.day,\r
              sub.avgTip,\r
              sub.maxTip,\r
              sub.cnt\r
          FROM (\r
              SELECT\r
                  day,\r
                  ROUND(AVG(tip), 2) AS avgTip,\r
                  MAX(tip) AS maxTip,\r
                  COUNT(*) AS cnt\r
              FROM tips\r
              GROUP BY day\r
          ) AS sub\r
          ORDER BY sub.avgTip DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. FROM 서브쿼리의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 7단계. FROM 서브쿼리 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step8_from_rank\r
  title: 8단계. FROM 서브쿼리 + 윈도우 함수\r
  structuredPrimary: true\r
  subtitle: 순위 매긴 후 조회\r
  goal: 8단계. FROM 서브쿼리 + 윈도우 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: FROM 서브쿼리와 윈도우 함수를 조합하면 순위를 매긴 후 특정 순위만 추출할 수 있습니다. 윈도우 함수는 WHERE 절에 직접 사용할 수 없으므로, FROM\r
    서브쿼리로 한 번 감싸서 결과를 필터링합니다. 이 패턴은 'TOP N' 쿼리에서 자주 사용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            sub.day,\r
            sub.avgTip,\r
            sub.tipRank\r
        FROM (\r
            SELECT\r
                day,\r
                ROUND(AVG(tip), 2) AS avgTip,\r
                RANK() OVER(ORDER BY AVG(tip) DESC) AS tipRank\r
            FROM tips\r
            GROUP BY day\r
        ) AS sub\r
        ORDER BY sub.tipRank\r
    """).show()\r
  exercise:\r
    prompt: 8단계. FROM 서브쿼리 + 윈도우 함수 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              sub.day,\r
              sub.avgTip,\r
              sub.tipRank\r
          FROM (\r
              SELECT\r
                  day,\r
                  ROUND(AVG(tip), 2) AS avgTip,\r
                  RANK() OVER(ORDER BY AVG(tip) DESC) AS tipRank\r
              FROM tips\r
              GROUP BY day\r
          ) AS sub\r
          ORDER BY sub.tipRank\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. FROM 서브쿼리 + 윈도우 함수의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 8단계. FROM 서브쿼리 + 윈도우 함수 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step9_complex_subquery\r
  title: 9단계. 복합 서브쿼리\r
  structuredPrimary: true\r
  subtitle: 그룹 평균과 비교\r
  goal: 9단계. 복합 서브쿼리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 서브쿼리를 JOIN과 결합하면 각 그룹의 평균과 개별 값을 비교할 수 있습니다. 요일별 평균보다 높은 팁만 추출합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            t.day,\r
            t.total_bill,\r
            t.tip,\r
            dayAvg.avgTip AS dayAvgTip,\r
            ROUND(t.tip - dayAvg.avgTip, 2) AS diffFromDayAvg\r
        FROM tips t\r
        JOIN (\r
            SELECT day, AVG(tip) AS avgTip\r
            FROM tips\r
            GROUP BY day\r
        ) AS dayAvg ON t.day = dayAvg.day\r
        WHERE t.tip > dayAvg.avgTip\r
        ORDER BY diffFromDayAvg DESC\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 9단계. 복합 서브쿼리 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              t.day,\r
              t.total_bill,\r
              t.tip,\r
              dayAvg.avgTip AS dayAvgTip,\r
              ROUND(t.tip - dayAvg.avgTip, 2) AS diffFromDayAvg\r
          FROM tips t\r
          JOIN (\r
              SELECT day, AVG(tip) AS avgTip\r
              FROM tips\r
              GROUP BY day\r
          ) AS dayAvg ON t.day = dayAvg.day\r
          WHERE t.tip > dayAvg.avgTip\r
          ORDER BY diffFromDayAvg DESC\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 복합 서브쿼리의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 9단계. 복합 서브쿼리 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step10_time_analysis\r
  title: 10단계. 시간대별 복합 분석\r
  structuredPrimary: true\r
  subtitle: 다중 서브쿼리\r
  goal: 10단계. 시간대별 복합 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 전체 평균과 시간대별 평균을 동시에 비교하여 팁 성향을 분석합니다. 스칼라 서브쿼리와 FROM 서브쿼리를 함께 사용하면 여러 층위의 통계를 한 번에 비교할\r
    수 있습니다. 개별 데이터가 그룹 평균 및 전체 평균과 어떻게 다른지 한눈에 파악할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            t.time,\r
            t.day,\r
            t.tip,\r
            (SELECT AVG(tip) FROM tips) AS totalAvg,\r
            timeAvg.avgTip AS timeAvgTip,\r
            CASE\r
                WHEN t.tip > timeAvg.avgTip THEN '평균 이상'\r
                ELSE '평균 이하'\r
            END AS category\r
        FROM tips t\r
        JOIN (\r
            SELECT time, AVG(tip) AS avgTip\r
            FROM tips\r
            GROUP BY time\r
        ) AS timeAvg ON t.time = timeAvg.time\r
        ORDER BY t.tip DESC\r
        LIMIT 12\r
    """).show()\r
  exercise:\r
    prompt: 10단계. 시간대별 복합 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              t.time,\r
              t.day,\r
              t.tip,\r
              (SELECT AVG(tip) FROM tips) AS totalAvg,\r
              timeAvg.avgTip AS timeAvgTip,\r
              CASE\r
                  WHEN t.tip > timeAvg.avgTip THEN '평균 이상'\r
                  ELSE '평균 이하'\r
              END AS category\r
          FROM tips t\r
          JOIN (\r
              SELECT time, AVG(tip) AS avgTip\r
              FROM tips\r
              GROUP BY time\r
          ) AS timeAvg ON t.time = timeAvg.time\r
          ORDER BY t.tip DESC\r
          LIMIT 12\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 시간대별 복합 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 10단계. 시간대별 복합 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step11_final\r
  title: 11단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 서브쿼리 패턴 정리\r
  goal: 11단계. 최종 결과물에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 3가지 서브쿼리 패턴을 정리합니다. 스칼라 서브쿼리는 단일 값 반환, WHERE 서브쿼리는 조건 필터링, FROM 서브쿼리는 집계 결과를 테이블처럼\r
    사용합니다. 각 패턴의 특성을 이해하면 상황에 맞는 최적의 쿼리를 작성할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            '스칼라' AS pattern,\r
            'SELECT (SELECT ...) FROM ...' AS syntax,\r
            '단일 값 반환' AS description\r
        UNION ALL\r
        SELECT\r
            'WHERE',\r
            'WHERE col IN/>/< (SELECT ...)',\r
            '조건 필터링'\r
        UNION ALL\r
        SELECT\r
            'FROM',\r
            'FROM (SELECT ...) AS sub',\r
            '집계 결과 테이블화'\r
    """).show()\r
  exercise:\r
    prompt: 11단계. 최종 결과물 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              '스칼라' AS pattern,\r
              'SELECT (SELECT ...) FROM ...' AS syntax,\r
              '단일 값 반환' AS description\r
          UNION ALL\r
          SELECT\r
              'WHERE',\r
              'WHERE col IN/>/< (SELECT ...)',\r
              '조건 필터링'\r
          UNION ALL\r
          SELECT\r
              'FROM',\r
              'FROM (SELECT ...) AS sub',\r
              '집계 결과 테이블화'\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 최종 결과물의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 최종 결과물의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: workflow_validation\r
  title: 12단계. 실무 서브쿼리 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → 스칼라 오류 확인 → 결과 검증 → 기준 실험\r
  goal: 12단계. 실무 서브쿼리 검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    서브쿼리는 결과가 나왔다고 끝이 아닙니다. 실무에서는 스칼라 서브쿼리가 정말 1행 1열인지, 동적 기준이 예상한 그룹을 고르는지, 최종 결과가 전체 평균과 그룹 평균을 모두 넘는지 검증해야 합니다.\r
\r
    서브쿼리 학습은 문법 암기가 아니라 기준을 코드로 고정하는 연습입니다. 오류가 나는 서브쿼리와 통과해야 하는 결과를 함께 검증하면 SQL을 업무 리포트에 사용할 수 있습니다.\r
  snippet: |-\r
    dayTipSummary = duckdb.sql("""\r
        SELECT\r
            day,\r
            ROUND(AVG(tip), 2) AS avgTip,\r
            COUNT(*) AS orderCount\r
        FROM tips\r
        GROUP BY day\r
        ORDER BY avgTip DESC\r
    """).df()\r
\r
    aboveTotalAvgCount = duckdb.sql("""\r
        SELECT COUNT(*) AS cnt\r
        FROM tips\r
        WHERE tip > (SELECT AVG(tip) FROM tips)\r
    """).fetchone()[0]\r
\r
    bestTipDay = dayTipSummary.iloc[0]["day"]\r
    bestTipDay, aboveTotalAvgCount, dayTipSummary.to_dict("records")\r
  exercise:\r
    prompt: 12단계. 실무 서브쿼리 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      dayTipSummary = duckdb.sql("""\r
          SELECT\r
              day,\r
              ROUND(AVG(tip), 2) AS avgTip,\r
              COUNT(*) AS orderCount\r
          FROM tips\r
          GROUP BY day\r
          ORDER BY avgTip DESC\r
      """).df()\r
\r
      aboveTotalAvgCount = duckdb.sql("""\r
          SELECT COUNT(*) AS cnt\r
          FROM tips\r
          WHERE tip > (SELECT AVG(tip) FROM tips)\r
      """).fetchone()[0]\r
\r
      bestTipDay = dayTipSummary.iloc[0]["day"]\r
      bestTipDay, aboveTotalAvgCount, dayTipSummary.to_dict("records")\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 12단계. 실무 서브쿼리 검증의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 12단계. 실무 서브쿼리 검증 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 서브쿼리 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    배운 서브쿼리 패턴을 활용해 팁 데이터를 분석합니다. 스칼라 서브쿼리로 전체 평균을 계산하고, WHERE 서브쿼리로 조건 비교를 수행합니다. 서브쿼리는 복잡한 비교 분석의 핵심 도구입니다.\r
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
    content: 서브쿼리 3가지 패턴을 마스터했습니다.\r
  - type: list\r
    items:\r
    - '스칼라 서브쿼리 - SELECT (SELECT ...) : 단일 값 반환'\r
    - 'WHERE 서브쿼리 - WHERE col > (SELECT ...) : 동적 필터링'\r
    - 'WHERE IN 서브쿼리 - WHERE col IN (SELECT ...) : 목록 필터링'\r
    - 'FROM 서브쿼리 - FROM (SELECT ...) AS sub : 집계 결과 재사용'\r
    - 서브쿼리 + JOIN - 그룹별 평균과 비교 분석\r
  - type: text\r
    content: 다음 시간에는 CTE(WITH 절)로 더 가독성 높은 쿼리를 작성하는 방법을 배웁니다.\r
  goal: 정리에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
`;export{e as default};