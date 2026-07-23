var e=`meta:\r
  packages:\r
  - duckdb\r
  - pandas\r
  id: duckdb_01\r
  title: 레스토랑팁기초\r
  order: 1\r
  category: duckdb\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - DuckDB\r
  - SELECT\r
  - WHERE\r
  - SQL기초\r
  - tips\r
  seo:\r
    title: DuckDB SQL 기초 - 레스토랑 팁 데이터 필터링\r
    description: DuckDB로 SQL 기초를 배웁니다. SELECT, WHERE, 비교/논리 연산자로 레스토랑 팁 데이터를 조건별로 필터링합니다.\r
    keywords:\r
    - DuckDB\r
    - SQL\r
    - SELECT\r
    - WHERE\r
    - 데이터 필터링\r
intro:\r
  emoji: 🍽️\r
  goal: 레스토랑 팁 데이터에서 조건별로 데이터를 필터링합니다.\r
  description: SQL의 기본인 SELECT와 WHERE를 마스터합니다. 비교 연산자, 논리 연산자, BETWEEN, IN을 활용해 원하는 데이터만 추출하는 방법을 배웁니다.\r
  direction: 레스토랑팁기초에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.\r
  - 레스토랑팁기초 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 전체 데이터 조회 처리 실행\r
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 행 수 제한 결과 검증\r
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.\r
    - label: 레스토랑팁기초 재사용\r
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: SQL 분석 환경\r
      detail: duckdb, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 레스토랑팁기초 실행\r
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.\r
    - label: 레스토랑팁기초 완료\r
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: pandas와 DuckDB 연동\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    DuckDB로 SQL 분석을 시작하기 전에 먼저 데이터를 준비해야 합니다. pandas로 CSV 파일을 읽어온 후, duckdb.from_df() 함수를 사용해 DuckDB 테이블로 변환합니다. 이렇게 변환된 테이블에서는 SQL 쿼리를 실행할 수 있습니다. DuckDB는 SQL 기반의 강력한 분석 엔진으로, pandas보다 대용량 데이터 처리가 빠르며 표준 SQL 문법을 그대로 사용할 수 있어 데이터베이스 경험이 있다면 매우 친숙합니다.\r
\r
    DuckDB는 duckdb.read_csv('파일.csv')나 SQL의 read_csv_auto() 함수로 로컬 파일과 URL을 직접 읽을 수 있습니다. 이 레슨은 pandas로 데이터를 먼저 확인한 뒤 duckdb.from_df()로 넘기는 흐름을 보여주며, 로컬 파일을 다룰 때는 DuckDB의 직접 읽기 기능도 함께 활용할 수 있습니다.\r
  tips:\r
  - DuckDB는 duckdb.read_csv('파일.csv')나 SQL의 read_csv_auto() 함수로 로컬 파일과 URL을 직접 읽을 수 있습니다. 이 레슨은 pandas로\r
    데이터를 먼저 확인한 뒤 duckdb.from_df()로 넘기는 흐름을 보여주며, 로컬 파일을 다룰 때는 DuckDB의 직접 읽기 기능도 함께 활용할 수 있습니다.\r
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
- id: step2_select_all\r
  title: 2단계. 전체 데이터 조회\r
  structuredPrimary: true\r
  subtitle: SELECT * FROM\r
  goal: 2단계. 전체 데이터 조회에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    SQL의 가장 기본이 되는 SELECT 문을 배워봅니다. SELECT는 '선택하다'라는 뜻으로, 데이터베이스에서 원하는 데이터를 가져오는 명령입니다. *(별표, asterisk)는 '모든 열'을 의미하며, FROM 뒤에는 데이터를 가져올 테이블 이름을 지정합니다. 즉, "tips_table이라는 테이블에서 모든 열을 가져와라"라는 의미입니다. 이 쿼리는 pandas의 df 변수명만 입력하는 것과 비슷한 결과를 보여줍니다.\r
\r
    SELECT * FROM 테이블명은 SQL의 가장 기본 구문입니다. *는 wildcard로 '모든 열'을 의미합니다. 실무에서는 필요한 열만 명시하는 것이 좋지만, 데이터 구조를 파악할 때는 *를 사용하면 편리합니다.\r
  tips:\r
  - SELECT * FROM 테이블명은 SQL의 가장 기본 구문입니다. *는 wildcard로 '모든 열'을 의미합니다. 실무에서는 필요한 열만 명시하는 것이 좋지만, 데이터 구조를\r
    파악할 때는 *를 사용하면 편리합니다.\r
  snippet: tips.query("tips_table", "SELECT * FROM tips_table")\r
  exercise:\r
    prompt: 2단계. 전체 데이터 조회 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: tips.query("tips_table", "SELECT * FROM tips_table")\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 전체 데이터 조회의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 2단계. 전체 데이터 조회 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step3_limit\r
  title: 3단계. 행 수 제한\r
  structuredPrimary: true\r
  subtitle: LIMIT\r
  goal: 3단계. 행 수 제한에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    데이터가 수백만 건일 때 전체를 다 출력하면 시간도 오래 걸리고 화면도 복잡해집니다. LIMIT 절은 출력할 행의 개수를 제한하는 역할을 합니다. 쿼리 끝에 LIMIT 5를 붙이면 상위 5개 행만 보여줍니다. 이는 pandas의 head() 메서드와 비슷한 기능입니다. 대용량 데이터를 다룰 때 데이터 구조를 빠르게 파악하거나, 쿼리가 제대로 작동하는지 테스트할 때 매우 유용합니다.\r
\r
    LIMIT n은 결과의 상위 n개 행만 반환합니다. LIMIT는 쿼리의 가장 마지막에 위치하며, ORDER BY와 함께 사용하면 정렬된 결과에서 상위 n개를 가져올 수 있습니다. 일부 데이터베이스에서는 TOP n 또는 FETCH FIRST n ROWS 문법을 사용하기도 하지만, DuckDB는 LIMIT을 사용합니다.\r
  tips:\r
  - LIMIT n은 결과의 상위 n개 행만 반환합니다. LIMIT는 쿼리의 가장 마지막에 위치하며, ORDER BY와 함께 사용하면 정렬된 결과에서 상위 n개를 가져올 수 있습니다.\r
    일부 데이터베이스에서는 TOP n 또는 FETCH FIRST n ROWS 문법을 사용하기도 하지만, DuckDB는 LIMIT을 사용합니다.\r
  snippet: tips.query("tips_table", "SELECT * FROM tips_table LIMIT 5")\r
  exercise:\r
    prompt: 3단계. 행 수 제한 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: tips.query("tips_table", "SELECT * FROM tips_table LIMIT 5")\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 행 수 제한의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 3단계. 행 수 제한 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step4_select_columns\r
  title: 4단계. 특정 열 선택\r
  structuredPrimary: true\r
  subtitle: SELECT col1, col2\r
  goal: 4단계. 특정 열 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    항상 모든 열이 필요한 것은 아닙니다. 분석 목적에 따라 필요한 열만 선택하면 데이터 처리 속도가 빨라지고 결과도 깔끔해집니다. SELECT 뒤에 열 이름을 콤마(,)로 구분해서 나열하면 해당 열만 가져옵니다. 예를 들어 총 결제금액(total_bill)과 팁(tip)만 보고 싶다면 "SELECT total_bill, tip"이라고 작성합니다. 이는 pandas의 df[['total_bill', 'tip']] 문법과 비슷한 기능입니다.\r
\r
    SELECT에서 열 이름을 직접 나열하면 해당 열만 반환됩니다. 열 순서도 나열한 순서대로 출력됩니다. 예를 들어 SELECT tip, total_bill로 순서를 바꾸면 팁 열이 먼저 나옵니다. 실무에서는 *보다 명시적인 열 선택이 권장됩니다.\r
  tips:\r
  - SELECT에서 열 이름을 직접 나열하면 해당 열만 반환됩니다. 열 순서도 나열한 순서대로 출력됩니다. 예를 들어 SELECT tip, total_bill로 순서를 바꾸면 팁\r
    열이 먼저 나옵니다. 실무에서는 *보다 명시적인 열 선택이 권장됩니다.\r
  snippet: tips.query("tips_table", "SELECT total_bill, tip FROM tips_table LIMIT 5")\r
  exercise:\r
    prompt: 4단계. 특정 열 선택 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: tips.query("tips_table", "SELECT total_bill, tip FROM tips_table LIMIT 5")\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 특정 열 선택의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 4단계. 특정 열 선택 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step5_alias\r
  title: 5단계. 별칭 지정\r
  structuredPrimary: true\r
  subtitle: AS alias\r
  goal: 5단계. 별칭 지정에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    SQL 쿼리 결과를 볼 때 열 이름이 영문이거나 복잡한 수식이면 이해하기 어렵습니다. AS 키워드를 사용하면 열에 별칭(alias)을 붙여 결과를 더 읽기 쉽게 만들 수 있습니다. 예를 들어 total_bill을 '총금액'이라는 한글 별칭으로 바꾸거나, 계산식의 결과에 의미 있는 이름을 붙일 수 있습니다. 별칭은 해당 쿼리 결과에만 적용되며 원본 테이블의 열 이름은 변경되지 않습니다. 이는 pandas의 df.rename()과 비슷하지만, SQL에서는 쿼리마다 동적으로 적용할 수 있어 더 유연합니다.\r
\r
    AS는 열이나 테이블에 임시 이름(별칭)을 부여합니다. 'SELECT total_bill AS 총금액'처럼 사용하며, 결과 컬럼명이 총금액으로 표시됩니다. 계산식에도 사용할 수 있어 'SELECT tip * 2 AS 두배팁'처럼 표현할 수 있습니다. AS는 생략 가능하지만 가독성을 위해 쓰는 것이 좋습니다.\r
  tips:\r
  - AS는 열이나 테이블에 임시 이름(별칭)을 부여합니다. 'SELECT total_bill AS 총금액'처럼 사용하며, 결과 컬럼명이 총금액으로 표시됩니다. 계산식에도 사용할 수\r
    있어 'SELECT tip * 2 AS 두배팁'처럼 표현할 수 있습니다. AS는 생략 가능하지만 가독성을 위해 쓰는 것이 좋습니다.\r
  snippet: |-\r
    tips.query("tips_table", """\r
        SELECT\r
            total_bill AS 총금액,\r
            tip AS 팁\r
        FROM tips_table\r
        LIMIT 5\r
    """)\r
  exercise:\r
    prompt: 5단계. 별칭 지정 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      tips.query("tips_table", """\r
          SELECT\r
              total_bill AS 총금액,\r
              tip AS 팁\r
          FROM tips_table\r
          LIMIT 5\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 별칭 지정의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 5단계. 별칭 지정 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step6_where_basic\r
  title: 6단계. 조건 필터링\r
  structuredPrimary: true\r
  subtitle: WHERE\r
  goal: 6단계. 조건 필터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    실제 분석에서는 전체 데이터가 아닌 특정 조건을 만족하는 데이터만 필요한 경우가 많습니다. WHERE 절은 조건을 지정해서 원하는 행만 필터링하는 역할을 합니다. 예를 들어 "저녁 시간대(Dinner) 데이터만 보고 싶다"면 WHERE time = 'Dinner'라고 조건을 지정합니다. WHERE는 FROM 뒤에 위치하며, 각 행을 하나씩 검사해서 조건이 참(True)인 행만 결과에 포함시킵니다. 이는 pandas의 df[df['time'] == 'Dinner'] 불린 인덱싱과 동일한 개념입니다.\r
\r
    WHERE 절은 조건에 맞는 행만 필터링합니다. SQL 실행 순서상 FROM → WHERE → SELECT 순서로 처리되므로, WHERE는 SELECT보다 먼저 실행됩니다. 문자열 조건은 작은따옴표('')로 감싸야 하며, 대소문자를 구분합니다. WHERE time = 'dinner'는 매칭되지 않습니다.\r
  tips:\r
  - WHERE 절은 조건에 맞는 행만 필터링합니다. SQL 실행 순서상 FROM → WHERE → SELECT 순서로 처리되므로, WHERE는 SELECT보다 먼저 실행됩니다. 문자열\r
    조건은 작은따옴표('')로 감싸야 하며, 대소문자를 구분합니다. WHERE time = 'dinner'는 매칭되지 않습니다.\r
  snippet: |-\r
    tips.query("tips_table", """\r
        SELECT * FROM tips_table\r
        WHERE time = 'Dinner'\r
        LIMIT 5\r
    """)\r
  exercise:\r
    prompt: 6단계. 조건 필터링 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      tips.query("tips_table", """\r
          SELECT * FROM tips_table\r
          WHERE time = 'Dinner'\r
          LIMIT 5\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 조건 필터링의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 6단계. 조건 필터링 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step7_comparison\r
  title: 7단계. 비교 연산자\r
  structuredPrimary: true\r
  subtitle: =, !=, >, <, >=, <=\r
  goal: 7단계. 비교 연산자에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    WHERE 절에서 다양한 비교 연산자를 사용해 조건을 만들 수 있습니다. 숫자 데이터의 경우 크기 비교가 가능하며, 문자열은 같은지 다른지를 비교할 수 있습니다. SQL에서 사용하는 비교 연산자는 =(같다), !=(다르다), >(크다), <(작다), >=(크거나 같다), <=(작거나 같다)입니다. 주의할 점은 Python의 ==가 아닌 =를 사용한다는 것입니다. 팁이 5달러 이상인 고객을 찾으려면 WHERE tip >= 5라고 작성합니다.\r
\r
    SQL 비교 연산자는 Python과 약간 다릅니다. Python은 ==를 사용하지만 SQL은 =를 사용합니다. != 대신 <>를 쓸 수도 있으며 둘 다 '같지 않다'를 의미합니다. 숫자 비교는 직관적이지만, 문자열 비교는 사전순으로 처리됩니다. 날짜/시간 타입도 비교 연산자로 범위를 지정할 수 있습니다.\r
  tips:\r
  - SQL 비교 연산자는 Python과 약간 다릅니다. Python은 ==를 사용하지만 SQL은 =를 사용합니다. != 대신 <>를 쓸 수도 있으며 둘 다 '같지 않다'를 의미합니다.\r
    숫자 비교는 직관적이지만, 문자열 비교는 사전순으로 처리됩니다. 날짜/시간 타입도 비교 연산자로 범위를 지정할 수 있습니다.\r
  snippet: |-\r
    tips.query("tips_table", """\r
        SELECT * FROM tips_table\r
        WHERE tip >= 5\r
    """)\r
  exercise:\r
    prompt: 7단계. 비교 연산자 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      tips.query("tips_table", """\r
          SELECT * FROM tips_table\r
          WHERE tip >= 5\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 비교 연산자의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 7단계. 비교 연산자 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step8_and\r
  title: 8단계. AND 연산자\r
  structuredPrimary: true\r
  subtitle: 여러 조건 모두 만족\r
  goal: 8단계. AND 연산자에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    실무에서는 하나의 조건만으로는 부족한 경우가 많습니다. "저녁 시간대이면서 팁이 5달러 이상인 데이터"처럼 여러 조건을 동시에 만족하는 데이터가 필요할 때 AND 연산자를 사용합니다. AND는 논리곱(logical AND)으로, 연결된 모든 조건이 참이어야 해당 행이 결과에 포함됩니다. 조건 1개만 거짓이어도 그 행은 제외됩니다. WHERE 조건1 AND 조건2 AND 조건3 형태로 여러 개를 연결할 수 있습니다. AND를 사용할수록 결과 범위가 좁아집니다.\r
\r
    AND는 논리곱 연산자로, 모든 조건이 참(TRUE)일 때만 해당 행을 반환합니다. 조건을 추가할수록 결과 데이터는 줄어듭니다. 예를 들어 WHERE A AND B AND C는 A, B, C가 모두 참인 행만 선택합니다. pandas의 df[(조건1) & (조건2)]와 동일한 개념입니다.\r
  tips:\r
  - AND는 논리곱 연산자로, 모든 조건이 참(TRUE)일 때만 해당 행을 반환합니다. 조건을 추가할수록 결과 데이터는 줄어듭니다. 예를 들어 WHERE A AND B AND C는\r
    A, B, C가 모두 참인 행만 선택합니다. pandas의 df[(조건1) & (조건2)]와 동일한 개념입니다.\r
  snippet: |-\r
    tips.query("tips_table", """\r
        SELECT * FROM tips_table\r
        WHERE time = 'Dinner' AND tip >= 5\r
    """)\r
  exercise:\r
    prompt: 8단계. AND 연산자 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      tips.query("tips_table", """\r
          SELECT * FROM tips_table\r
          WHERE time = 'Dinner' AND tip >= 5\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. AND 연산자의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 8단계. AND 연산자 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step9_or\r
  title: 9단계. OR 연산자\r
  structuredPrimary: true\r
  subtitle: 조건 중 하나라도 만족\r
  goal: 9단계. OR 연산자에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    AND와 반대로 OR 연산자는 여러 조건 중 하나라도 만족하면 결과에 포함시킵니다. "토요일이거나 일요일인 데이터"처럼 선택지를 넓힐 때 사용합니다. OR는 논리합(logical OR)으로, 연결된 조건 중 하나만 참이어도 해당 행이 선택됩니다. WHERE day = 'Sat' OR day = 'Sun'은 토요일 또는 일요일 데이터를 모두 가져옵니다. AND는 결과를 좁히고, OR는 결과를 넓힙니다. AND와 OR를 함께 사용할 때는 괄호로 우선순위를 명확히 하는 것이 좋습니다.\r
\r
    OR는 논리합 연산자로, 조건 중 하나라도 참이면 해당 행을 반환합니다. WHERE A OR B는 A가 참이거나 B가 참인 모든 행을 선택합니다. AND와 OR를 혼합할 때는 괄호를 사용하세요. WHERE (A OR B) AND C는 (A 또는 B)이면서 C인 조건입니다.\r
  tips:\r
  - OR는 논리합 연산자로, 조건 중 하나라도 참이면 해당 행을 반환합니다. WHERE A OR B는 A가 참이거나 B가 참인 모든 행을 선택합니다. AND와 OR를 혼합할 때는\r
    괄호를 사용하세요. WHERE (A OR B) AND C는 (A 또는 B)이면서 C인 조건입니다.\r
  snippet: |-\r
    tips.query("tips_table", """\r
        SELECT * FROM tips_table\r
        WHERE day = 'Sat' OR day = 'Sun'\r
    """)\r
  exercise:\r
    prompt: 9단계. OR 연산자 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      tips.query("tips_table", """\r
          SELECT * FROM tips_table\r
          WHERE day = 'Sat' OR day = 'Sun'\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. OR 연산자의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 9단계. OR 연산자 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step10_between\r
  title: 10단계. 범위 조건\r
  structuredPrimary: true\r
  subtitle: BETWEEN\r
  goal: 10단계. 범위 조건에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    숫자 범위를 지정할 때 BETWEEN 키워드를 사용하면 코드가 간결해집니다. "총 결제 금액이 20달러 이상 30달러 이하"라는 조건을 WHERE total_bill >= 20 AND total_bill <= 30으로 쓸 수 있지만, BETWEEN을 사용하면 WHERE total_bill BETWEEN 20 AND 30으로 더 읽기 쉽게 표현할 수 있습니다. 중요한 점은 BETWEEN은 양 끝값을 포함(inclusive)한다는 것입니다. 즉, 20과 30도 결과에 포함됩니다. 날짜 범위 지정에도 자주 사용됩니다.\r
\r
    BETWEEN a AND b는 a 이상(>=) b 이하(<=)를 의미합니다. 양 끝값이 포함되므로 BETWEEN 1 AND 10은 1, 2, ..., 10을 모두 포함합니다. WHERE col >= a AND col <= b와 완전히 동일하지만 BETWEEN이 더 간결합니다. NOT BETWEEN으로 범위 밖 값을 선택할 수도 있습니다.\r
  tips:\r
  - BETWEEN a AND b는 a 이상(>=) b 이하(<=)를 의미합니다. 양 끝값이 포함되므로 BETWEEN 1 AND 10은 1, 2, ..., 10을 모두 포함합니다.\r
    WHERE col >= a AND col <= b와 완전히 동일하지만 BETWEEN이 더 간결합니다. NOT BETWEEN으로 범위 밖 값을 선택할 수도 있습니다.\r
  snippet: |-\r
    tips.query("tips_table", """\r
        SELECT * FROM tips_table\r
        WHERE total_bill BETWEEN 20 AND 30\r
    """)\r
  exercise:\r
    prompt: 10단계. 범위 조건 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      tips.query("tips_table", """\r
          SELECT * FROM tips_table\r
          WHERE total_bill BETWEEN 20 AND 30\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 범위 조건의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 10단계. 범위 조건 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step11_in\r
  title: 11단계. 목록 조건\r
  structuredPrimary: true\r
  subtitle: IN\r
  goal: 11단계. 목록 조건에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    특정 값 목록 중 하나와 일치하는 데이터를 선택할 때 IN 연산자를 사용합니다. 예를 들어 토요일과 일요일 데이터만 필요하다면 WHERE day = 'Sat' OR day = 'Sun'처럼 OR를 반복하는 대신, WHERE day IN ('Sat', 'Sun')으로 간결하게 표현할 수 있습니다. IN 뒤의 괄호 안에 값들을 콤마로 구분해서 나열하면, 컬럼 값이 목록 중 하나와 일치하는 모든 행이 선택됩니다. 값이 3개 이상일 때 특히 유용하며, 가독성이 크게 향상됩니다.\r
\r
    IN (값1, 값2, ...)는 컬럼 값이 괄호 안 목록 중 하나와 일치하면 참입니다. WHERE day IN ('Sat', 'Sun', 'Fri')는 WHERE day = 'Sat' OR day = 'Sun' OR day = 'Fri'와 동일하지만 훨씬 간결합니다. NOT IN으로 목록에 없는 값을 선택할 수도 있습니다.\r
  tips:\r
  - IN (값1, 값2, ...)는 컬럼 값이 괄호 안 목록 중 하나와 일치하면 참입니다. WHERE day IN ('Sat', 'Sun', 'Fri')는 WHERE day = 'Sat'\r
    OR day = 'Sun' OR day = 'Fri'와 동일하지만 훨씬 간결합니다. NOT IN으로 목록에 없는 값을 선택할 수도 있습니다.\r
  snippet: |-\r
    tips.query("tips_table", """\r
        SELECT * FROM tips_table\r
        WHERE day IN ('Sat', 'Sun')\r
    """)\r
  exercise:\r
    prompt: 11단계. 목록 조건 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      tips.query("tips_table", """\r
          SELECT * FROM tips_table\r
          WHERE day IN ('Sat', 'Sun')\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 목록 조건의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 11단계. 목록 조건 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step12_arithmetic\r
  title: 12단계. 산술 연산\r
  structuredPrimary: true\r
  subtitle: +, -, *, /\r
  goal: 12단계. 산술 연산에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    SQL은 단순히 데이터를 조회하는 것뿐만 아니라 계산도 수행할 수 있습니다. SELECT 절에서 +, -, *, / 같은 산술 연산자를 사용해 새로운 값을 만들 수 있습니다. 예를 들어 팁이 전체 결제금액의 몇 퍼센트인지 계산하려면 tip / total_bill * 100 같은 수식을 작성합니다. 이렇게 계산된 결과는 새로운 열로 표시되며, AS로 의미 있는 별칭을 붙이면 결과를 이해하기 쉬워집니다. pandas의 df['new_col'] = df['col1'] / df['col2']와 비슷하지만, SQL은 원본 테이블을 변경하지 않고 쿼리 결과에만 나타납니다.\r
\r
    SELECT 절에서 산술 연산자(+, -, *, /)를 사용해 열 간 계산을 수행할 수 있습니다. tip / total_bill * 100은 팁 비율을 퍼센트로 계산합니다. 계산 결과에는 반드시 AS로 별칭을 붙여주세요. 괄호로 연산 우선순위를 명확히 할 수 있습니다: (tip + 5) * 2\r
  tips:\r
  - 'SELECT 절에서 산술 연산자(+, -, *, /)를 사용해 열 간 계산을 수행할 수 있습니다. tip / total_bill * 100은 팁 비율을 퍼센트로 계산합니다.\r
    계산 결과에는 반드시 AS로 별칭을 붙여주세요. 괄호로 연산 우선순위를 명확히 할 수 있습니다: (tip + 5) * 2'\r
  snippet: |-\r
    tips.query("tips_table", """\r
        SELECT\r
            total_bill,\r
            tip,\r
            tip / total_bill * 100 AS tipPct\r
        FROM tips_table\r
        LIMIT 5\r
    """)\r
  exercise:\r
    prompt: 12단계. 산술 연산 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      tips.query("tips_table", """\r
          SELECT\r
              total_bill,\r
              tip,\r
              tip / total_bill * 100 AS tipPct\r
          FROM tips_table\r
          LIMIT 5\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 12단계. 산술 연산의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 12단계. 산술 연산 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step13_round\r
  title: 13단계. 반올림\r
  structuredPrimary: true\r
  subtitle: ROUND\r
  goal: 13단계. 반올림에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    산술 연산 결과는 종종 소수점이 너무 길어서 보기 불편합니다. ROUND 함수를 사용하면 소수점 자릿수를 조절해 결과를 깔끔하게 만들 수 있습니다. ROUND(값, 자릿수) 형태로 사용하며, 첫 번째 인자는 반올림할 값(열이나 계산식), 두 번째 인자는 남길 소수점 자릿수입니다. 예를 들어 ROUND(3.14159, 2)는 3.14가 되고, ROUND(15.7, 0)은 16이 됩니다. 팁 비율처럼 퍼센트를 표시할 때는 소수점 1~2자리만 남기는 것이 일반적입니다.\r
\r
    ROUND(값, 자릿수)는 반올림 함수입니다. 두 번째 인자로 소수점 자릿수를 지정합니다. ROUND(3.14159, 2)는 3.14, ROUND(3.14159, 0)은 3입니다. 자릿수를 음수로 하면 정수 부분을 반올림할 수도 있습니다. ROUND(1234, -2)는 1200입니다.\r
  tips:\r
  - ROUND(값, 자릿수)는 반올림 함수입니다. 두 번째 인자로 소수점 자릿수를 지정합니다. ROUND(3.14159, 2)는 3.14, ROUND(3.14159, 0)은 3입니다.\r
    자릿수를 음수로 하면 정수 부분을 반올림할 수도 있습니다. ROUND(1234, -2)는 1200입니다.\r
  snippet: |-\r
    tips.query("tips_table", """\r
        SELECT\r
            total_bill,\r
            tip,\r
            ROUND(tip / total_bill * 100, 1) AS tipPct\r
        FROM tips_table\r
        LIMIT 5\r
    """)\r
  exercise:\r
    prompt: 13단계. 반올림 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      tips.query("tips_table", """\r
          SELECT\r
              total_bill,\r
              tip,\r
              ROUND(tip / total_bill * 100, 1) AS tipPct\r
          FROM tips_table\r
          LIMIT 5\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 13단계. 반올림의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 13단계. 반올림 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step14_final\r
  title: 14단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 조건별 팁 데이터 필터링\r
  goal: 14단계. 최종 결과물에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 SQL 기초 개념을 종합하여 실전 분석 쿼리를 작성해봅니다. SELECT로 필요한 열을 선택하고, AS로 한글 별칭을 붙이며, WHERE절에\r
    AND, IN, BETWEEN을 조합해 복합 조건을 설정합니다. 산술 연산으로 팁 비율을 계산하고 ROUND로 소수점을 정리합니다. 이런 식으로 여러 개념을 조합하면 복잡한 비즈니스\r
    요구사항도 하나의 SQL 쿼리로 해결할 수 있습니다. "주말 저녁에 20~50달러를 결제하고 5달러 이상 팁을 준 고객"같은 구체적인 분석이 가능합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    tips.query("tips_table", """\r
        SELECT\r
            day AS 요일,\r
            total_bill AS 총금액,\r
            tip AS 팁,\r
            ROUND(tip / total_bill * 100, 1) AS 팁비율,\r
            size AS 인원\r
        FROM tips_table\r
        WHERE day IN ('Sat', 'Sun')\r
          AND time = 'Dinner'\r
          AND tip >= 5\r
          AND total_bill BETWEEN 20 AND 50\r
    """)\r
  exercise:\r
    prompt: 14단계. 최종 결과물 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      tips.query("tips_table", """\r
          SELECT\r
              day AS 요일,\r
              total_bill AS 총금액,\r
              tip AS 팁,\r
              ROUND(tip / total_bill * 100, 1) AS 팁비율,\r
              size AS 인원\r
          FROM tips_table\r
          WHERE day IN ('Sat', 'Sun')\r
            AND time = 'Dinner'\r
            AND tip >= 5\r
            AND total_bill BETWEEN 20 AND 50\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 14단계. 최종 결과물의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 14단계. 최종 결과물 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 조건별 필터링 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    배운 SELECT, WHERE, 연산자를 활용해 다양한 조건으로 데이터를 필터링합니다.\r
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
    tbl = duckdb.from_df(data)\r
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
      tbl = duckdb.from_df(data)\r
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
    content: SQL 기초 쿼리를 마스터했습니다.\r
  - type: list\r
    items:\r
    - SELECT * FROM - 전체 데이터 조회\r
    - SELECT col1, col2 - 특정 열 선택\r
    - AS alias - 별칭 지정\r
    - WHERE - 조건 필터링\r
    - LIMIT - 행 수 제한\r
    - =, !=, >, <, >=, <= - 비교 연산자\r
    - AND, OR - 논리 연산자\r
    - BETWEEN - 범위 조건\r
    - IN - 목록 조건\r
    - +, -, *, / - 산술 연산\r
    - ROUND - 반올림\r
  - type: text\r
    content: 다음 시간에는 ORDER BY와 집계 함수를 배웁니다.\r
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