var e=`meta:\r
  packages:\r
  - duckdb\r
  - pandas\r
  id: duckdb_07\r
  title: 윈도우함수기초\r
  order: 7\r
  category: duckdb\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  dataSource: codaro-local:tips\r
  tags:\r
  - window\r
  - ROW_NUMBER\r
  - RANK\r
  - PARTITION BY\r
  - 누적합계\r
  seo:\r
    title: DuckDB 윈도우 함수 기초 - ROW_NUMBER, RANK, 누적합계\r
    description: 레스토랑 팁 데이터로 SQL 윈도우 함수를 배웁니다. ROW_NUMBER, RANK, DENSE_RANK, PARTITION BY, 누적합계를 실습합니다.\r
    keywords:\r
    - DuckDB window\r
    - ROW_NUMBER\r
    - RANK\r
    - PARTITION BY\r
    - SQL 윈도우함수\r
intro:\r
  emoji: 🏆\r
  goal: 팁 데이터에서 요일별 순위와 누적 합계를 계산합니다.\r
  description: 윈도우 함수는 GROUP BY와 달리 행을 줄이지 않고 각 행에 집계 결과를 붙입니다. 순위 매기기, 누적 합계, 그룹 내 비교에 필수적인 기능입니다.\r
  direction: 윈도우함수기초에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.\r
  - 윈도우함수기초 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 준비 입력 확인\r
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 윈도우 함수란? 처리 실행\r
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. ROWNUMBER 결과 검증\r
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.\r
    - label: 윈도우함수기초 재사용\r
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: SQL 분석 환경\r
      detail: duckdb, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 윈도우함수기초 실행\r
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.\r
    - label: 윈도우함수기초 완료\r
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 준비\r
  structuredPrimary: true\r
  subtitle: tips 데이터 로드\r
  goal: 1단계. 데이터 준비에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 레스토랑 팁 데이터를 DuckDB로 불러옵니다. 이번 프로젝트에서는 윈도우 함수(Window Function)를 배우게 됩니다. 윈도우 함수는 SQL에서 가장\r
    강력한 기능 중 하나로, 순위 매기기, 누적 합계, 이동 평균 등 고급 분석에 필수적입니다. pandas로 CSV 파일을 읽은 후 duckdb.from_df()로 DuckDB\r
    테이블로 변환하면 즉시 SQL 쿼리를 실행할 수 있습니다. 120명의 로컬 레스토랑 손님 데이터로 요일별 팁 순위, 누적 합계 등 다양한 분석을 수행합니다.\r
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
- id: step2_window_intro\r
  title: 2단계. 윈도우 함수란?\r
  structuredPrimary: true\r
  subtitle: GROUP BY와의 차이\r
  goal: 2단계. 윈도우 함수란?에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    윈도우 함수는 GROUP BY와 완전히 다른 방식으로 동작합니다. GROUP BY는 그룹당 한 행으로 줄여버리지만, 윈도우 함수는 모든 행을 유지하면서 각 행에 집계 결과를 추가합니다. 예를 들어 GROUP BY day로 요일별 평균 팁을 구하면 요일 수만큼만 나오지만, 윈도우 함수를 사용하면 120개 행 모두 유지하면서 각 행에 "전체 평균", "해당 요일 평균" 등을 추가할 수 있습니다. 이는 "원본 데이터 + 집계 정보"를 동시에 보고 싶을 때 매우 유용합니다. 윈도우 함수 없이는 서브쿼리나 JOIN으로 복잡하게 처리해야 합니다.\r
\r
    OVER() 절이 윈도우 함수의 핵심입니다. AVG(tip) OVER()는 전체 데이터의 평균을, AVG(tip) OVER(PARTITION BY day)는 각 요일별 평균을 계산합니다. 괄호가 비어있으면 전체, PARTITION BY가 있으면 그룹별로 계산됩니다. 일반 집계 함수와 달리 행이 줄어들지 않고 모든 행에 결과가 추가됩니다.\r
  tips:\r
  - OVER() 절이 윈도우 함수의 핵심입니다. AVG(tip) OVER()는 전체 데이터의 평균을, AVG(tip) OVER(PARTITION BY day)는 각 요일별 평균을\r
    계산합니다. 괄호가 비어있으면 전체, PARTITION BY가 있으면 그룹별로 계산됩니다. 일반 집계 함수와 달리 행이 줄어들지 않고 모든 행에 결과가 추가됩니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            tip,\r
            AVG(tip) OVER() AS avgAll,\r
            AVG(tip) OVER(PARTITION BY day) AS avgByDay\r
        FROM tips\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 2단계. 윈도우 함수란? 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              tip,\r
              AVG(tip) OVER() AS avgAll,\r
              AVG(tip) OVER(PARTITION BY day) AS avgByDay\r
          FROM tips\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 윈도우 함수란?의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 2단계. 윈도우 함수란? 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step3_row_number\r
  title: 3단계. ROW_NUMBER\r
  structuredPrimary: true\r
  subtitle: 행 번호 매기기\r
  goal: 3단계. ROWNUMBER에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    ROW_NUMBER()는 각 행에 순차적인 번호를 부여하는 윈도우 함수입니다. 1부터 시작하여 1씩 증가합니다. ORDER BY 절로 정렬 기준을 지정하면 그 순서대로 번호가 매겨집니다. 예를 들어 ORDER BY tip DESC는 팁이 높은 순서대로 1, 2, 3... 번호를 부여합니다. 동점(같은 값)이 있어도 ROW_NUMBER는 각 행에 고유한 번호를 부여하므로 중복이 없습니다. 페이지네이션(1-10위, 11-20위 등)이나 Top N 추출에 자주 사용됩니다.\r
\r
    ROW_NUMBER() OVER(ORDER BY col)은 col 기준으로 정렬한 후 순서대로 번호를 매깁니다. 동점이어도 각 행에 고유한 번호를 부여합니다. 예를 들어 팁이 5.0으로 같은 두 행이 있어도 하나는 1위, 다른 하나는 2위가 됩니다. 정렬 순서를 바꾸면 번호도 바뀔 수 있으므로 정렬 기준이 중요합니다.\r
  tips:\r
  - ROW_NUMBER() OVER(ORDER BY col)은 col 기준으로 정렬한 후 순서대로 번호를 매깁니다. 동점이어도 각 행에 고유한 번호를 부여합니다. 예를 들어 팁이\r
    5.0으로 같은 두 행이 있어도 하나는 1위, 다른 하나는 2위가 됩니다. 정렬 순서를 바꾸면 번호도 바뀔 수 있으므로 정렬 기준이 중요합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            tip,\r
            total_bill,\r
            ROW_NUMBER() OVER(ORDER BY tip DESC) AS rowNum\r
        FROM tips\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 3단계. ROWNUMBER 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              tip,\r
              total_bill,\r
              ROW_NUMBER() OVER(ORDER BY tip DESC) AS rowNum\r
          FROM tips\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. ROWNUMBER의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 3단계. ROWNUMBER 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step4_partition_row_number\r
  title: 4단계. PARTITION BY + ROW_NUMBER\r
  structuredPrimary: true\r
  subtitle: 그룹 내 순번\r
  goal: 4단계. PARTITION BY + ROWNUMBER에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    PARTITION BY를 추가하면 그룹별로 윈도우가 나뉘어 각 그룹 내에서 번호가 1부터 다시 시작됩니다. 예를 들어 PARTITION BY day를 사용하면 월요일 그룹에서 1,2,3..., 화요일 그룹에서 다시 1,2,3... 이런 식으로 요일마다 독립적인 순위가 매겨집니다. 이는 "카테고리별 Top N"을 구할 때 핵심 패턴입니다. 전체 Top 10이 아니라 "각 요일의 Top 3", "각 제품군의 Top 5" 같은 분석에 필수적입니다. PARTITION BY가 없으면 전체 데이터에 대해 순위가 매겨집니다.\r
\r
    PARTITION BY는 그룹을 나누고, ORDER BY는 그 안에서 정렬합니다. 각 요일마다 순위가 1부터 다시 시작됩니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            tip,\r
            total_bill,\r
            ROW_NUMBER() OVER(PARTITION BY day ORDER BY tip DESC) AS dayRank\r
        FROM tips\r
        ORDER BY day, dayRank\r
        LIMIT 16\r
    """).show()\r
  exercise:\r
    prompt: 4단계. PARTITION BY + ROWNUMBER 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              tip,\r
              total_bill,\r
              ROW_NUMBER() OVER(PARTITION BY day ORDER BY tip DESC) AS dayRank\r
          FROM tips\r
          ORDER BY day, dayRank\r
          LIMIT 16\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. PARTITION BY + ROWNUMBER의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 4단계. PARTITION BY + ROWNUMBER 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step5_rank\r
  title: 5단계. RANK\r
  structuredPrimary: true\r
  subtitle: 동점 처리\r
  goal: 5단계. RANK에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    RANK()는 ROW_NUMBER와 달리 동점 처리가 가능한 순위 함수입니다. 같은 값을 가진 행들에게 같은 순위를 부여하고, 다음 순위는 건너뜁니다. 예를 들어 팁이 5.0으로 같은 두 행이 있으면 둘 다 1위가 되고, 다음 행은 3위가 됩니다(2위는 건너뜀). 이는 올림픽 메달 순위와 같은 방식입니다. 동점자가 2명이면 2등이 없고 1등 다음이 3등이 됩니다. 실제 순위를 매길 때는 ROW_NUMBER보다 RANK가 더 공정하고 자연스럽습니다.\r
\r
    RANK는 동점이면 같은 순위를 주고 다음 순위를 건너뜁니다. 예: 1, 2, 2, 4 (3등이 없음)\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            tip,\r
            ROW_NUMBER() OVER(PARTITION BY day ORDER BY tip DESC) AS rowNum,\r
            RANK() OVER(PARTITION BY day ORDER BY tip DESC) AS tipRank\r
        FROM tips\r
        WHERE tip >= 5\r
        ORDER BY day, tipRank\r
    """).show()\r
  exercise:\r
    prompt: 5단계. RANK 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              tip,\r
              ROW_NUMBER() OVER(PARTITION BY day ORDER BY tip DESC) AS rowNum,\r
              RANK() OVER(PARTITION BY day ORDER BY tip DESC) AS tipRank\r
          FROM tips\r
          WHERE tip >= 5\r
          ORDER BY day, tipRank\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. RANK의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 5단계. RANK 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step6_dense_rank\r
  title: 6단계. DENSE_RANK\r
  structuredPrimary: true\r
  subtitle: 순위 건너뛰기 없음\r
  goal: 6단계. DENSERANK에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    DENSE_RANK()는 RANK와 비슷하지만 동점이 있어도 다음 순위를 건너뛰지 않습니다. 연속된 순위 번호를 원할 때 사용합니다. 예를 들어 1등이 2명 있으면 RANK는 1,1,3이 되지만, DENSE_RANK는 1,1,2가 됩니다. 순위 사이에 구멍이 없어서 "촘촘한(dense)" 순위라고 부릅니다. 리더보드나 등급 시스템에서 "몇 등급이 존재하는가"를 세고 싶을 때는 DENSE_RANK를 사용하고, "전체 몇 명 중 몇 등인가"를 표현할 때는 RANK를 사용합니다. 용도에 따라 적절히 선택하면 됩니다.\r
\r
    DENSE_RANK는 동점이어도 순위를 건너뛰지 않습니다. 예: 1, 2, 2, 3 (3등이 있음)\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            ROUND(tip, 0) AS tipRounded,\r
            RANK() OVER(PARTITION BY day ORDER BY ROUND(tip, 0) DESC) AS rankVal,\r
            DENSE_RANK() OVER(PARTITION BY day ORDER BY ROUND(tip, 0) DESC) AS denseRankVal\r
        FROM tips\r
        WHERE tip >= 4\r
        ORDER BY day, tipRounded DESC\r
    """).show()\r
  exercise:\r
    prompt: 6단계. DENSERANK 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              ROUND(tip, 0) AS tipRounded,\r
              RANK() OVER(PARTITION BY day ORDER BY ROUND(tip, 0) DESC) AS rankVal,\r
              DENSE_RANK() OVER(PARTITION BY day ORDER BY ROUND(tip, 0) DESC) AS denseRankVal\r
          FROM tips\r
          WHERE tip >= 4\r
          ORDER BY day, tipRounded DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. DENSERANK의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 6단계. DENSERANK 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step7_running_total\r
  title: 7단계. 누적 합계\r
  structuredPrimary: true\r
  subtitle: SUM() OVER(ORDER BY)\r
  goal: 7단계. 누적 합계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    누적 합계(Running Total)는 윈도우 함수의 강력한 활용 사례입니다. SUM()에 ORDER BY를 추가하면 정렬 순서대로 위에서부터 합계를 누적합니다. 예를 들어 첫 번째 행은 자기 자신만, 두 번째 행은 첫 번째+두 번째, 세 번째 행은 첫 번째+두 번째+세 번째... 이런 식으로 계속 누적됩니다. 매출 누적, 방문자 누적, 재고 누적 등 시계열 데이터에서 "지금까지 총 얼마인가"를 보여줄 때 필수적입니다. 일반 SUM은 전체 합계 하나만 나오지만, 윈도우 SUM은 각 행마다 "그 시점까지의 합계"를 보여줍니다.\r
\r
    SUM() OVER(ORDER BY col)은 col 기준 정렬 후 위에서부터 합계를 누적합니다. 각 행에서 자신까지의 합계를 보여줍니다. ORDER BY가 없으면 전체 합계가 모든 행에 동일하게 나오지만, ORDER BY를 추가하면 누적 합계가 됩니다. 이는 엑셀의 '누계' 기능과 동일합니다.\r
  tips:\r
  - SUM() OVER(ORDER BY col)은 col 기준 정렬 후 위에서부터 합계를 누적합니다. 각 행에서 자신까지의 합계를 보여줍니다. ORDER BY가 없으면 전체 합계가\r
    모든 행에 동일하게 나오지만, ORDER BY를 추가하면 누적 합계가 됩니다. 이는 엑셀의 '누계' 기능과 동일합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            tip,\r
            SUM(tip) OVER(ORDER BY tip) AS cumSum\r
        FROM tips\r
        WHERE day = 'Sun'\r
        ORDER BY tip\r
        LIMIT 15\r
    """).show()\r
  exercise:\r
    prompt: 7단계. 누적 합계 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              tip,\r
              SUM(tip) OVER(ORDER BY tip) AS cumSum\r
          FROM tips\r
          WHERE day = 'Sun'\r
          ORDER BY tip\r
          LIMIT 15\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 누적 합계의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 7단계. 누적 합계 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step8_partition_cumsum\r
  title: 8단계. 그룹별 누적 합계\r
  structuredPrimary: true\r
  subtitle: PARTITION BY + ORDER BY\r
  goal: 8단계. 그룹별 누적 합계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    PARTITION BY와 ORDER BY를 함께 사용하면 그룹별로 독립적인 누적 합계를 계산합니다. 각 그룹에서 누적 합계가 1부터 다시 시작됩니다. 예를 들어 PARTITION BY day를 추가하면 월요일은 월요일대로, 화요일은 화요일대로 누적 합계를 계산합니다. 요일이 바뀌면 누적이 리셋됩니다. 이는 "카테고리별 누적 현황"을 보고 싶을 때 유용합니다. 제품별 누적 판매량, 지역별 누적 매출 등 그룹마다 독립적으로 추적할 때 이 패턴을 사용합니다. PARTITION BY 없는 누적 합계와 비교하면 차이를 확실히 알 수 있습니다.\r
\r
    dayCumSum은 요일별로 누적 합계, dayTotal은 요일별 전체 합계입니다. 같은 요일 내에서는 dayCumSum이 계속 증가하다가 dayTotal에 도달하고, 다음 요일로 넘어가면 누적이 다시 0부터 시작됩니다. PARTITION BY 덕분에 각 요일이 독립적인 윈도우로 분리됩니다.\r
  tips:\r
  - dayCumSum은 요일별로 누적 합계, dayTotal은 요일별 전체 합계입니다. 같은 요일 내에서는 dayCumSum이 계속 증가하다가 dayTotal에 도달하고, 다음 요일로\r
    넘어가면 누적이 다시 0부터 시작됩니다. PARTITION BY 덕분에 각 요일이 독립적인 윈도우로 분리됩니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            tip,\r
            SUM(tip) OVER(PARTITION BY day ORDER BY tip) AS dayCumSum,\r
            SUM(tip) OVER(PARTITION BY day) AS dayTotal\r
        FROM tips\r
        ORDER BY day, tip\r
        LIMIT 20\r
    """).show()\r
  exercise:\r
    prompt: 8단계. 그룹별 누적 합계 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              tip,\r
              SUM(tip) OVER(PARTITION BY day ORDER BY tip) AS dayCumSum,\r
              SUM(tip) OVER(PARTITION BY day) AS dayTotal\r
          FROM tips\r
          ORDER BY day, tip\r
          LIMIT 20\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 그룹별 누적 합계의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 8단계. 그룹별 누적 합계 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step9_percent_rank\r
  title: 9단계. 비율 순위\r
  structuredPrimary: true\r
  subtitle: 상위 몇 %?\r
  goal: 9단계. 비율 순위에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    누적 합계를 전체 합계로 나누면 누적 비율(Cumulative Percentage)을 구할 수 있습니다. 이는 "상위 몇 %가 전체의 몇 %를 차지하는가"를 분석하는 핵심 지표입니다. 예를 들어 팁이 높은 순서대로 누적하면 "상위 20%가 전체 팁의 50%를 차지한다" 같은 인사이트를 얻을 수 있습니다. 파레토 분석(80/20 법칙), ABC 분석 등에 활용됩니다. 두 개의 윈도우 함수를 나누기로 연결하는 패턴이며, 실무에서 고객 세그먼트 분석, VIP 고객 기여도 분석 등에 자주 사용됩니다.\r
\r
    100.0을 곱한 후 나누는 것이 정확한 퍼센트 계산 방법입니다. 정수 나누기는 소수점이 잘릴 수 있으므로 반드시 100.0처럼 실수로 만들어야 합니다. cumPct가 50이면 상위 n개 항목이 전체의 50%를 차지한다는 의미입니다.\r
  tips:\r
  - 100.0을 곱한 후 나누는 것이 정확한 퍼센트 계산 방법입니다. 정수 나누기는 소수점이 잘릴 수 있으므로 반드시 100.0처럼 실수로 만들어야 합니다. cumPct가 50이면\r
    상위 n개 항목이 전체의 50%를 차지한다는 의미입니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            tip,\r
            SUM(tip) OVER(PARTITION BY day ORDER BY tip DESC) AS cumSum,\r
            SUM(tip) OVER(PARTITION BY day) AS dayTotal,\r
            ROUND(\r
                SUM(tip) OVER(PARTITION BY day ORDER BY tip DESC) * 100.0 /\r
                SUM(tip) OVER(PARTITION BY day),\r
                1\r
            ) AS cumPct\r
        FROM tips\r
        ORDER BY day, tip DESC\r
        LIMIT 16\r
    """).show()\r
  exercise:\r
    prompt: 9단계. 비율 순위 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              tip,\r
              SUM(tip) OVER(PARTITION BY day ORDER BY tip DESC) AS cumSum,\r
              SUM(tip) OVER(PARTITION BY day) AS dayTotal,\r
              ROUND(\r
                  SUM(tip) OVER(PARTITION BY day ORDER BY tip DESC) * 100.0 /\r
                  SUM(tip) OVER(PARTITION BY day),\r
                  1\r
              ) AS cumPct\r
          FROM tips\r
          ORDER BY day, tip DESC\r
          LIMIT 16\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 비율 순위의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 9단계. 비율 순위 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step10_top_n\r
  title: 10단계. 그룹별 Top N\r
  structuredPrimary: true\r
  subtitle: 서브쿼리 활용\r
  goal: 10단계. 그룹별 Top N에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    윈도우 함수 결과를 서브쿼리로 감싸서 그룹별 상위 N개를 추출하는 실전 패턴입니다. 윈도우 함수는 WHERE 절에서 직접 사용할 수 없으므로, 서브쿼리에서 순위를 먼저 계산한 후 외부 쿼리의 WHERE로 필터링합니다. 예를 들어 "각 요일의 Top 3 팁"을 구하려면 요일별 순위를 매긴 후 순위가 3 이하인 행만 선택합니다. 이 패턴은 "카테고리별 베스트 상품", "부서별 우수 사원", "지역별 인기 매장" 등 그룹 내 상위 항목을 찾을 때 필수적입니다. CTE를 사용하면 더 깔끔하게 작성할 수 있습니다.\r
\r
    서브쿼리 패턴은 (1) 내부 쿼리에서 윈도우 함수로 순위 계산 → (2) 외부 쿼리에서 WHERE로 필터링 순서입니다. WHERE dayRank <= 3은 1, 2, 3위만 선택합니다. DuckDB에서는 QUALIFY 절로 더 간단하게 작성할 수도 있지만, 서브쿼리 패턴이 표준 SQL이라 다른 DB에서도 호환됩니다.\r
  tips:\r
  - 서브쿼리 패턴은 (1) 내부 쿼리에서 윈도우 함수로 순위 계산 → (2) 외부 쿼리에서 WHERE로 필터링 순서입니다. WHERE dayRank <= 3은 1, 2, 3위만 선택합니다.\r
    DuckDB에서는 QUALIFY 절로 더 간단하게 작성할 수도 있지만, 서브쿼리 패턴이 표준 SQL이라 다른 DB에서도 호환됩니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT day, tip, total_bill, dayRank\r
        FROM (\r
            SELECT\r
                day,\r
                tip,\r
                total_bill,\r
                ROW_NUMBER() OVER(PARTITION BY day ORDER BY tip DESC) AS dayRank\r
            FROM tips\r
        ) ranked\r
        WHERE dayRank <= 3\r
        ORDER BY day, dayRank\r
    """).show()\r
  exercise:\r
    prompt: 10단계. 그룹별 Top N 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT day, tip, total_bill, dayRank\r
          FROM (\r
              SELECT\r
                  day,\r
                  tip,\r
                  total_bill,\r
                  ROW_NUMBER() OVER(PARTITION BY day ORDER BY tip DESC) AS dayRank\r
              FROM tips\r
          ) ranked\r
          WHERE dayRank <= 3\r
          ORDER BY day, dayRank\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 그룹별 Top N의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 10단계. 그룹별 Top N 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step11_final\r
  title: 11단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 종합 분석\r
  goal: 11단계. 최종 결과물에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 윈도우 함수를 종합 활용하여 요일별 팁 순위와 누적 통계를 한 번에 분석하는 최종 쿼리입니다. ROW_NUMBER로 순위를 매기고, SUM OVER(ORDER\r
    BY)로 누적 합계를 구하며, 비율 계산까지 한 쿼리에서 모두 수행합니다. 이렇게 여러 윈도우 함수를 조합하면 복잡한 분석도 간결하게 표현할 수 있습니다. 실무에서는 대시보드나\r
    리포트를 위해 이런 종합 쿼리를 작성하게 됩니다. 윈도우 함수는 처음에는 어렵지만 익숙해지면 SQL의 표현력을 10배 이상 높여주는 강력한 도구입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            day,\r
            tip,\r
            total_bill,\r
            ROW_NUMBER() OVER(PARTITION BY day ORDER BY tip DESC) AS dayRank,\r
            ROUND(SUM(tip) OVER(PARTITION BY day ORDER BY tip DESC), 2) AS cumTip,\r
            ROUND(\r
                SUM(tip) OVER(PARTITION BY day ORDER BY tip DESC) * 100.0 /\r
                SUM(tip) OVER(PARTITION BY day),\r
                1\r
            ) AS cumPct\r
        FROM tips\r
        ORDER BY day, dayRank\r
        LIMIT 20\r
    """).show()\r
  exercise:\r
    prompt: 11단계. 최종 결과물 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              day,\r
              tip,\r
              total_bill,\r
              ROW_NUMBER() OVER(PARTITION BY day ORDER BY tip DESC) AS dayRank,\r
              ROUND(SUM(tip) OVER(PARTITION BY day ORDER BY tip DESC), 2) AS cumTip,\r
              ROUND(\r
                  SUM(tip) OVER(PARTITION BY day ORDER BY tip DESC) * 100.0 /\r
                  SUM(tip) OVER(PARTITION BY day),\r
                  1\r
              ) AS cumPct\r
          FROM tips\r
          ORDER BY day, dayRank\r
          LIMIT 20\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 최종 결과물의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 11단계. 최종 결과물 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 윈도우 함수 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    윈도우 함수를 종합 활용하여 팁 데이터를 심층 분석해봅시다.\r
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
    content: SQL 윈도우 함수의 기초를 마스터했습니다.\r
  - type: list\r
    items:\r
    - ROW_NUMBER() OVER() - 순차 번호 부여\r
    - RANK() - 동점 시 같은 순위, 다음 순위 건너뜀\r
    - DENSE_RANK() - 동점 시 같은 순위, 건너뛰지 않음\r
    - OVER(PARTITION BY col) - 그룹별로 윈도우 적용\r
    - OVER(ORDER BY col) - 정렬 순서로 집계\r
    - SUM() OVER(ORDER BY) - 누적 합계 계산\r
    - 윈도우 함수 vs GROUP BY - 행 유지 vs 행 축소\r
  - type: text\r
    content: 다음 시간에는 LAG/LEAD, 이동 평균, QUALIFY 등 고급 윈도우 함수를 배웁니다.\r
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