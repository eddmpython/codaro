var e=`meta:\r
  packages:\r
  - duckdb\r
  - pandas\r
  id: duckdb_09\r
  title: 문자열과패턴\r
  order: 9\r
  category: duckdb\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  dataSource: codaro-local:titanic\r
  tags:\r
  - string\r
  - LIKE\r
  - CONCAT\r
  - REGEXP\r
  - 문자열함수\r
  - titanic\r
  seo:\r
    title: DuckDB 문자열 함수와 패턴 매칭 - LIKE, REGEXP, CONCAT\r
    description: 타이타닉 이름 데이터로 문자열 함수를 마스터합니다. LIKE 패턴, 정규표현식, CONCAT, SPLIT_PART 등 텍스트 처리 기법을 실습합니다.\r
    keywords:\r
    - DuckDB 문자열\r
    - LIKE\r
    - 정규표현식\r
    - CONCAT\r
    - 문자열 함수\r
intro:\r
  emoji: ✍️\r
  goal: 타이타닉 이름 데이터로 문자열 함수와 패턴 매칭을 마스터합니다.\r
  description: 문자열 처리는 실무 데이터 정제의 핵심입니다. LIKE로 패턴 검색, CONCAT으로 결합, SUBSTR로 추출, REGEXP_EXTRACT로 정규표현식 사용까지\r
    배웁니다. 이름에서 호칭 추출, 패턴 분석 등 실전 기법을 익힙니다.\r
  direction: 문자열과패턴에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.\r
  - 문자열과패턴 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 준비 입력 확인\r
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. LIKE 패턴 매칭 처리 실행\r
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 다양한 LIKE 패턴 결과 검증\r
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.\r
    - label: 문자열과패턴 재사용\r
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: SQL 분석 환경\r
      detail: duckdb, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 문자열과패턴 실행\r
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.\r
    - label: 문자열과패턴 완료\r
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 준비\r
  structuredPrimary: true\r
  subtitle: titanic 데이터 로드\r
  goal: 1단계. 데이터 준비에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 타이타닉 승객 데이터를 불러옵니다. 이번 프로젝트에서는 name 컬럼의 텍스트 데이터를 분석합니다. 승객 이름에는 "Mr.", "Mrs.", "Miss."\r
    같은 호칭이 포함되어 있고, 이를 추출하여 생존율 등을 분석할 수 있습니다. 문자열 함수는 실무에서 데이터 정제, 전처리, 패턴 추출에 필수적입니다. 이메일에서 도메인 추출,\r
    주소에서 지역 분리, 상품명에서 브랜드 파싱 등 다양하게 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import duckdb\r
\r
    dfTitanic = loadLocalDataset("titanic")\r
    if "name" not in dfTitanic.columns:\r
        titleCycle = ["Mr.", "Mrs.", "Miss.", "Master.", "Dr.", "Rev."]\r
        dfTitanic = dfTitanic.copy()\r
        dfTitanic["name"] = [\r
            f"Passenger{index:03d}, {titleCycle[index % len(titleCycle)]} Local"\r
            for index in range(len(dfTitanic))\r
        ]\r
\r
    titanic = duckdb.from_df(dfTitanic)\r
  exercise:\r
    prompt: 1단계. 데이터 준비 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import duckdb\r
\r
      dfTitanic = loadLocalDataset("titanic")\r
      if "name" not in dfTitanic.columns:\r
          titleCycle = ["Mr.", "Mrs.", "Miss.", "Master.", "Dr.", "Rev."]\r
          dfTitanic = dfTitanic.copy()\r
          dfTitanic["name"] = [\r
              f"Passenger{index:03d}, {titleCycle[index % len(titleCycle)]} Local"\r
              for index in range(len(dfTitanic))\r
          ]\r
\r
      titanic = duckdb.from_df(dfTitanic)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 데이터 준비의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 1단계. 데이터 준비 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step2_like_intro\r
  title: 2단계. LIKE 패턴 매칭\r
  structuredPrimary: true\r
  subtitle: 문자열 검색의 기본\r
  goal: 2단계. LIKE 패턴 매칭에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    LIKE는 문자열 패턴을 검색하는 기본 연산자입니다. %는 임의 길이의 문자열(0개 이상), _는 정확히 1개의 문자를 의미합니다. 예를 들어 LIKE '%Mr.%'는 "Mr."이 포함된 모든 문자열을 찾습니다. LIKE는 간단한 패턴 검색에 유용하며, 정규표현식보다 성능이 좋고 직관적입니다. 이름, 주소, 상품명 등에서 특정 키워드를 찾을 때 자주 사용됩니다.\r
\r
    LIKE '%pattern%'은 pattern이 문자열 어디든 포함되면 매칭됩니다. LIKE 'pattern%'은 pattern으로 시작, LIKE '%pattern'은 pattern으로 끝나는 문자열을 찾습니다. _ 는 정확히 1개 문자를 의미하므로 LIKE '___'은 정확히 3글자인 문자열을 찾습니다.\r
  tips:\r
  - LIKE '%pattern%'은 pattern이 문자열 어디든 포함되면 매칭됩니다. LIKE 'pattern%'은 pattern으로 시작, LIKE '%pattern'은 pattern으로\r
    끝나는 문자열을 찾습니다. _ 는 정확히 1개 문자를 의미하므로 LIKE '___'은 정확히 3글자인 문자열을 찾습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT name\r
        FROM titanic\r
        WHERE name LIKE '%Mr.%'\r
        LIMIT 5\r
    """).show()\r
  exercise:\r
    prompt: 2단계. LIKE 패턴 매칭 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT name\r
          FROM titanic\r
          WHERE name LIKE '%Mr.%'\r
          LIMIT 5\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. LIKE 패턴 매칭의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 2단계. LIKE 패턴 매칭 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step3_like_variants\r
  title: 3단계. 다양한 LIKE 패턴\r
  structuredPrimary: true\r
  subtitle: Mrs., Miss., Master.\r
  goal: 3단계. 다양한 LIKE 패턴에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 타이타닉 이름 데이터에서 다양한 호칭을 검색합니다. Mrs.는 기혼 여성, Miss.는 미혼 여성, Master.는 소년을 나타냅니다. LIKE 패턴으로 각\r
    호칭을 가진 승객을 필터링할 수 있습니다. 여러 패턴을 OR로 연결하거나 CASE WHEN으로 분류할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            CASE\r
                WHEN name LIKE '%Mr.%' THEN 'Mr.'\r
                WHEN name LIKE '%Mrs.%' THEN 'Mrs.'\r
                WHEN name LIKE '%Miss.%' THEN 'Miss.'\r
                WHEN name LIKE '%Master.%' THEN 'Master.'\r
                ELSE 'Other'\r
            END AS title,\r
            COUNT(*) AS cnt\r
        FROM titanic\r
        GROUP BY title\r
        ORDER BY cnt DESC\r
    """).show()\r
  exercise:\r
    prompt: 3단계. 다양한 LIKE 패턴 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              CASE\r
                  WHEN name LIKE '%Mr.%' THEN 'Mr.'\r
                  WHEN name LIKE '%Mrs.%' THEN 'Mrs.'\r
                  WHEN name LIKE '%Miss.%' THEN 'Miss.'\r
                  WHEN name LIKE '%Master.%' THEN 'Master.'\r
                  ELSE 'Other'\r
              END AS title,\r
              COUNT(*) AS cnt\r
          FROM titanic\r
          GROUP BY title\r
          ORDER BY cnt DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 다양한 LIKE 패턴의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 3단계. 다양한 LIKE 패턴 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step4_concat_intro\r
  title: 4단계. CONCAT - 문자열 결합\r
  structuredPrimary: true\r
  subtitle: 여러 컬럼 합치기\r
  goal: 4단계. CONCAT 문자열 결합에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    CONCAT 함수는 여러 문자열을 하나로 합칩니다. CONCAT(a, b, c)는 a, b, c를 순서대로 연결합니다. || 연산자도 동일한 기능을 합니다. 예를 들어 성과 이름을 합치거나, 여러 컬럼을 조합하여 새로운 식별자를 만들 때 사용합니다. 실무에서는 보고서용 라벨 생성, 전체 주소 조합, ID 생성 등에 활용됩니다.\r
\r
    CONCAT(a, b, c)는 a || b || c와 동일합니다. ||는 SQL 표준 문자열 연결 연산자입니다. NULL을 포함하면 결과도 NULL이 되므로 COALESCE로 기본값을 지정하는 것이 안전합니다. 예: CONCAT(COALESCE(col1, ''), col2)\r
  tips:\r
  - 'CONCAT(a, b, c)는 a || b || c와 동일합니다. ||는 SQL 표준 문자열 연결 연산자입니다. NULL을 포함하면 결과도 NULL이 되므로 COALESCE로\r
    기본값을 지정하는 것이 안전합니다. 예: CONCAT(COALESCE(col1, ''''), col2)'\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            CONCAT(class, ' - ', who) AS classInfo,\r
            name\r
        FROM titanic\r
        LIMIT 5\r
    """).show()\r
  exercise:\r
    prompt: 4단계. CONCAT 문자열 결합 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              CONCAT(class, ' - ', who) AS classInfo,\r
              name\r
          FROM titanic\r
          LIMIT 5\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. CONCAT 문자열 결합의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 4단계. CONCAT 문자열 결합 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step5_substr_intro\r
  title: 5단계. SUBSTR - 부분 문자열 추출\r
  structuredPrimary: true\r
  subtitle: 문자열 자르기\r
  goal: 5단계. SUBSTR 부분 문자열 추출에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    SUBSTR(문자열, 시작위치, 길이)는 문자열의 일부를 추출합니다. 시작위치는 1부터 시작하며(0이 아님), 길이만큼 잘라냅니다. 예를 들어 SUBSTR('Hello', 1, 2)는 'He'를 반환합니다. 긴 텍스트를 요약하거나 고정 길이 필드에서 특정 부분만 추출할 때 유용합니다. 주민등록번호에서 생년월일, 전화번호에서 지역번호 추출 등에 사용됩니다.\r
\r
    SUBSTR(str, start, len)의 start는 1부터 시작합니다. SUBSTR(str, 1, 10)은 첫 10글자를 추출합니다. len을 생략하면 start부터 끝까지 모두 가져옵니다. SUBSTR(str, -5)는 뒤에서 5글자를 의미하는 DB도 있지만 DuckDB는 양수만 지원합니다.\r
  tips:\r
  - SUBSTR(str, start, len)의 start는 1부터 시작합니다. SUBSTR(str, 1, 10)은 첫 10글자를 추출합니다. len을 생략하면 start부터 끝까지\r
    모두 가져옵니다. SUBSTR(str, -5)는 뒤에서 5글자를 의미하는 DB도 있지만 DuckDB는 양수만 지원합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            name,\r
            SUBSTR(name, 1, 20) AS shortName\r
        FROM titanic\r
        LIMIT 5\r
    """).show()\r
  exercise:\r
    prompt: 5단계. SUBSTR 부분 문자열 추출 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              name,\r
              SUBSTR(name, 1, 20) AS shortName\r
          FROM titanic\r
          LIMIT 5\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. SUBSTR 부분 문자열 추출의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 5단계. SUBSTR 부분 문자열 추출 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step6_upper_lower\r
  title: 6단계. UPPER, LOWER - 대소문자 변환\r
  structuredPrimary: true\r
  subtitle: 대소문자 통일\r
  goal: 6단계. UPPER, LOWER 대소문자 변환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    UPPER는 모든 문자를 대문자로, LOWER는 모든 문자를 소문자로 변환합니다. 대소문자 구분 없이 비교하거나 데이터를 정규화할 때 필수적입니다. 예를 들어 사용자 입력('seoul', 'Seoul', 'SEOUL')을 모두 소문자로 통일하면 비교가 쉬워집니다. 실무에서는 중복 제거, 그룹화, 검색 전처리에 자주 사용됩니다.\r
\r
    UPPER와 LOWER는 영문자만 변환하고 숫자나 특수문자는 그대로 유지합니다. 대소문자 구분 없이 비교하려면 WHERE LOWER(col) = LOWER('pattern')처럼 양쪽을 모두 변환해야 합니다. 성능을 위해 WHERE 절에서는 함수 호출을 최소화하는 것이 좋습니다.\r
  tips:\r
  - UPPER와 LOWER는 영문자만 변환하고 숫자나 특수문자는 그대로 유지합니다. 대소문자 구분 없이 비교하려면 WHERE LOWER(col) = LOWER('pattern')처럼\r
    양쪽을 모두 변환해야 합니다. 성능을 위해 WHERE 절에서는 함수 호출을 최소화하는 것이 좋습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            embark_town,\r
            UPPER(embark_town) AS upperTown,\r
            LOWER(embark_town) AS lowerTown\r
        FROM titanic\r
        WHERE embark_town IS NOT NULL\r
        LIMIT 5\r
    """).show()\r
  exercise:\r
    prompt: 6단계. UPPER, LOWER 대소문자 변환 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              embark_town,\r
              UPPER(embark_town) AS upperTown,\r
              LOWER(embark_town) AS lowerTown\r
          FROM titanic\r
          WHERE embark_town IS NOT NULL\r
          LIMIT 5\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. UPPER, LOWER 대소문자 변환의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 6단계. UPPER, LOWER 대소문자 변환 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step7_trim\r
  title: 7단계. TRIM - 공백 제거\r
  structuredPrimary: true\r
  subtitle: 앞뒤 공백 정리\r
  goal: 7단계. TRIM 공백 제거에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    TRIM은 문자열 앞뒤의 공백을 제거합니다. LTRIM은 왼쪽, RTRIM은 오른쪽만 제거합니다. 사용자 입력이나 파일에서 읽은 데이터는 불필요한 공백이 포함되는 경우가 많아 TRIM으로 정제해야 합니다. 공백 때문에 같은 값이 다르게 인식되는 문제를 방지할 수 있습니다. 실무 데이터 정제의 기본 단계입니다.\r
\r
    TRIM은 공백(스페이스, 탭, 줄바꿈)을 제거합니다. TRIM(BOTH ' ' FROM col)처럼 제거할 문자를 명시할 수도 있습니다. 데이터를 비교하거나 그룹화하기 전에 TRIM을 적용하면 공백으로 인한 불일치를 방지할 수 있습니다.\r
  tips:\r
  - TRIM은 공백(스페이스, 탭, 줄바꿈)을 제거합니다. TRIM(BOTH ' ' FROM col)처럼 제거할 문자를 명시할 수도 있습니다. 데이터를 비교하거나 그룹화하기 전에\r
    TRIM을 적용하면 공백으로 인한 불일치를 방지할 수 있습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            TRIM('  Hello World  ') AS trimmed,\r
            LTRIM('  Hello World  ') AS leftTrimmed,\r
            RTRIM('  Hello World  ') AS rightTrimmed\r
    """).show()\r
  exercise:\r
    prompt: 7단계. TRIM 공백 제거 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              TRIM('  Hello World  ') AS trimmed,\r
              LTRIM('  Hello World  ') AS leftTrimmed,\r
              RTRIM('  Hello World  ') AS rightTrimmed\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. TRIM 공백 제거의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 7단계. TRIM 공백 제거 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step8_length\r
  title: 8단계. LENGTH - 문자열 길이\r
  structuredPrimary: true\r
  subtitle: 글자 수 세기\r
  goal: 8단계. LENGTH 문자열 길이에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    LENGTH는 문자열의 길이(글자 수)를 반환합니다. 바이트가 아닌 문자 개수를 세므로 한글도 1글자로 계산됩니다. 문자열 검증(최소/최대 길이 확인), 정렬, 필터링에 사용됩니다. 예를 들어 비밀번호 길이 검증, 트윗 140자 제한, 상품명 길이 분석 등에 활용됩니다.\r
\r
    LENGTH는 문자 개수를 반환합니다. 공백도 1글자로 계산됩니다. 바이트 길이가 필요하면 OCTET_LENGTH를 사용합니다. 한글, 이모지 등 멀티바이트 문자는 LENGTH와 OCTET_LENGTH가 다를 수 있습니다.\r
  tips:\r
  - LENGTH는 문자 개수를 반환합니다. 공백도 1글자로 계산됩니다. 바이트 길이가 필요하면 OCTET_LENGTH를 사용합니다. 한글, 이모지 등 멀티바이트 문자는 LENGTH와\r
    OCTET_LENGTH가 다를 수 있습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            name,\r
            LENGTH(name) AS nameLength\r
        FROM titanic\r
        ORDER BY nameLength DESC\r
        LIMIT 5\r
    """).show()\r
  exercise:\r
    prompt: 8단계. LENGTH 문자열 길이 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              name,\r
              LENGTH(name) AS nameLength\r
          FROM titanic\r
          ORDER BY nameLength DESC\r
          LIMIT 5\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. LENGTH 문자열 길이의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 8단계. LENGTH 문자열 길이 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step9_replace\r
  title: 9단계. REPLACE - 문자열 치환\r
  structuredPrimary: true\r
  subtitle: 패턴 바꾸기\r
  goal: 9단계. REPLACE 문자열 치환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    REPLACE(문자열, 찾을값, 바꿀값)는 문자열 내 특정 패턴을 다른 값으로 치환합니다. 모든 일치 항목을 변경하므로 일괄 수정에 유용합니다. 예를 들어 전화번호 형식 변경, 특수문자 제거, 오타 일괄 수정 등에 사용됩니다. 데이터 정제와 표준화의 핵심 함수입니다.\r
\r
    REPLACE는 대소문자를 구분합니다. 'Southampton'와 'southampton'은 다릅니다. 대소문자 구분 없이 치환하려면 LOWER나 UPPER로 먼저 변환해야 합니다. 여러 패턴을 치환하려면 REPLACE를 중첩하거나 REGEXP_REPLACE를 사용합니다.\r
  tips:\r
  - REPLACE는 대소문자를 구분합니다. 'Southampton'와 'southampton'은 다릅니다. 대소문자 구분 없이 치환하려면 LOWER나 UPPER로 먼저 변환해야 합니다.\r
    여러 패턴을 치환하려면 REPLACE를 중첩하거나 REGEXP_REPLACE를 사용합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            embark_town,\r
            REPLACE(embark_town, 'Southampton', 'S-town') AS replaced\r
        FROM titanic\r
        WHERE embark_town IS NOT NULL\r
        LIMIT 5\r
    """).show()\r
  exercise:\r
    prompt: 9단계. REPLACE 문자열 치환 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              embark_town,\r
              REPLACE(embark_town, 'Southampton', 'S-town') AS replaced\r
          FROM titanic\r
          WHERE embark_town IS NOT NULL\r
          LIMIT 5\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. REPLACE 문자열 치환의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 9단계. REPLACE 문자열 치환 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step10_split_part\r
  title: 10단계. SPLIT_PART - 문자열 분리\r
  structuredPrimary: true\r
  subtitle: 구분자로 나누기\r
  goal: 10단계. SPLITPART 문자열 분리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    SPLIT_PART(문자열, 구분자, 위치)는 구분자로 문자열을 나누고 특정 위치의 부분을 반환합니다. 예를 들어 'a,b,c'를 콤마로 나누면 SPLIT_PART(..., ',', 1)은 'a', SPLIT_PART(..., ',', 2)는 'b'를 반환합니다. 타이타닉 이름 데이터는 "성, 호칭. 이름" 형식이므로 콤마와 점으로 분리하여 호칭을 추출할 수 있습니다. CSV 파싱, 경로 분해, 구조화된 텍스트 추출에 매우 유용합니다.\r
\r
    SPLIT_PART의 위치는 1부터 시작합니다. 존재하지 않는 위치를 지정하면 빈 문자열을 반환합니다. 여러 단계로 분리하려면 SPLIT_PART를 중첩합니다. 예: SPLIT_PART(SPLIT_PART(str, ',', 2), '.', 1)은 먼저 콤마로 나누고 그 결과를 점으로 다시 나눕니다.\r
  tips:\r
  - 'SPLIT_PART의 위치는 1부터 시작합니다. 존재하지 않는 위치를 지정하면 빈 문자열을 반환합니다. 여러 단계로 분리하려면 SPLIT_PART를 중첩합니다. 예: SPLIT_PART(SPLIT_PART(str,\r
    '','', 2), ''.'', 1)은 먼저 콤마로 나누고 그 결과를 점으로 다시 나눕니다.'\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            name,\r
            TRIM(SPLIT_PART(SPLIT_PART(name, ',', 2), '.', 1)) AS title\r
        FROM titanic\r
        LIMIT 5\r
    """).show()\r
  exercise:\r
    prompt: 10단계. SPLITPART 문자열 분리 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              name,\r
              TRIM(SPLIT_PART(SPLIT_PART(name, ',', 2), '.', 1)) AS title\r
          FROM titanic\r
          LIMIT 5\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. SPLITPART 문자열 분리의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 10단계. SPLITPART 문자열 분리 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step11_regexp_intro\r
  title: 11단계. 정규표현식 기초\r
  structuredPrimary: true\r
  subtitle: REGEXP_MATCHES 패턴 체크\r
  goal: 11단계. 정규표현식 기초에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 11단계. 정규표현식 기초의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            name,\r
            REGEXP_MATCHES(name, 'Mr\\\\.') AS hasMr,\r
            REGEXP_MATCHES(name, 'Mrs?\\\\.')  AS hasMrOrMrs\r
        FROM titanic\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 11단계. 정규표현식 기초 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              name,\r
              REGEXP_MATCHES(name, 'Mr\\\\.') AS hasMr,\r
              REGEXP_MATCHES(name, 'Mrs?\\\\.')  AS hasMrOrMrs\r
          FROM titanic\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 정규표현식 기초의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 정규표현식 기초의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step12_regexp_extract\r
  title: 12단계. REGEXP_EXTRACT - 패턴 추출\r
  structuredPrimary: true\r
  subtitle: 정규표현식으로 값 뽑기\r
  goal: 12단계. REGEXPEXTRACT 패턴 추출에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: REGEXP_EXTRACT는 정규표현식 패턴에 일치하는 부분을 추출합니다. SPLIT_PART보다 복잡한 패턴을 다룰 수 있습니다. 괄호()로 그룹을 지정하면\r
    해당 부분만 추출할 수 있습니다. 실무에서 이메일 주소에서 도메인 추출, URL에서 파라미터 파싱, 로그에서 특정 값 추출 등에 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            name,\r
            REGEXP_EXTRACT(name, '(Mr|Mrs|Miss|Master)\\\\.') AS title\r
        FROM titanic\r
        WHERE REGEXP_MATCHES(name, '(Mr|Mrs|Miss|Master)\\\\.')\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 12단계. REGEXPEXTRACT 패턴 추출 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              name,\r
              REGEXP_EXTRACT(name, '(Mr|Mrs|Miss|Master)\\\\.') AS title\r
          FROM titanic\r
          WHERE REGEXP_MATCHES(name, '(Mr|Mrs|Miss|Master)\\\\.')\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 12단계. REGEXPEXTRACT 패턴 추출의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 12단계. REGEXPEXTRACT 패턴 추출의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step13_title_analysis\r
  title: 13단계. 호칭별 생존율 분석\r
  structuredPrimary: true\r
  subtitle: 문자열 추출 + 집계\r
  goal: 13단계. 호칭별 생존율 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 이름에서 호칭을 추출하여 호칭별 생존율을 분석합니다. 문자열 함수로 데이터를 정제한 후 GROUP BY로 집계하는 전형적인 실무 패턴입니다. 호칭은 나이와\r
    성별 정보를 내포하므로 생존율에 큰 영향을 미칩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            CASE\r
                WHEN name LIKE '%Mr.%' THEN 'Mr.'\r
                WHEN name LIKE '%Mrs.%' THEN 'Mrs.'\r
                WHEN name LIKE '%Miss.%' THEN 'Miss.'\r
                WHEN name LIKE '%Master.%' THEN 'Master.'\r
                ELSE 'Other'\r
            END AS title,\r
            COUNT(*) AS total,\r
            SUM(survived) AS survivors,\r
            ROUND(AVG(survived) * 100, 1) AS survivalRate\r
        FROM titanic\r
        GROUP BY title\r
        ORDER BY survivalRate DESC\r
    """).show()\r
  exercise:\r
    prompt: 13단계. 호칭별 생존율 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              CASE\r
                  WHEN name LIKE '%Mr.%' THEN 'Mr.'\r
                  WHEN name LIKE '%Mrs.%' THEN 'Mrs.'\r
                  WHEN name LIKE '%Miss.%' THEN 'Miss.'\r
                  WHEN name LIKE '%Master.%' THEN 'Master.'\r
                  ELSE 'Other'\r
              END AS title,\r
              COUNT(*) AS total,\r
              SUM(survived) AS survivors,\r
              ROUND(AVG(survived) * 100, 1) AS survivalRate\r
          FROM titanic\r
          GROUP BY title\r
          ORDER BY survivalRate DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 13단계. 호칭별 생존율 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 13단계. 호칭별 생존율 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step14_length_analysis\r
  title: 14단계. 이름 길이별 분석\r
  structuredPrimary: true\r
  subtitle: LENGTH + CASE WHEN\r
  goal: 14단계. 이름 길이별 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 이름 길이를 기준으로 분류하여 생존율을 분석합니다. LENGTH로 길이를 구하고 CASE WHEN으로 범주화한 후 집계합니다. 이름이 긴 사람은 귀족일 가능성이\r
    높아 생존율이 다를 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            CASE\r
                WHEN LENGTH(name) < 25 THEN 'Short'\r
                WHEN LENGTH(name) < 40 THEN 'Medium'\r
                ELSE 'Long'\r
            END AS nameCategory,\r
            COUNT(*) AS total,\r
            ROUND(AVG(survived) * 100, 1) AS survivalRate\r
        FROM titanic\r
        GROUP BY nameCategory\r
        ORDER BY survivalRate DESC\r
    """).show()\r
  exercise:\r
    prompt: 14단계. 이름 길이별 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              CASE\r
                  WHEN LENGTH(name) < 25 THEN 'Short'\r
                  WHEN LENGTH(name) < 40 THEN 'Medium'\r
                  ELSE 'Long'\r
              END AS nameCategory,\r
              COUNT(*) AS total,\r
              ROUND(AVG(survived) * 100, 1) AS survivalRate\r
          FROM titanic\r
          GROUP BY nameCategory\r
          ORDER BY survivalRate DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 14단계. 이름 길이별 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 14단계. 이름 길이별 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step15_complex_string\r
  title: 15단계. 복합 문자열 처리\r
  structuredPrimary: true\r
  subtitle: CONCAT + UPPER + CASE\r
  goal: 15단계. 복합 문자열 처리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 여러 문자열 함수를 조합하여 복잡한 문자열을 생성합니다. CONCAT, UPPER, CASE WHEN 등을 결합하여 보고서용 라벨을 만드는 실전 패턴입니다.\r
    실무에서는 이런 조합으로 다양한 형식의 출력물을 생성합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            CONCAT(\r
                UPPER(class),\r
                ' | ',\r
                who,\r
                ' | ',\r
                CASE WHEN survived = 1 THEN 'Survived' ELSE 'Died' END\r
            ) AS passengerSummary,\r
            name\r
        FROM titanic\r
        LIMIT 10\r
    """).show()\r
  exercise:\r
    prompt: 15단계. 복합 문자열 처리 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              CONCAT(\r
                  UPPER(class),\r
                  ' | ',\r
                  who,\r
                  ' | ',\r
                  CASE WHEN survived = 1 THEN 'Survived' ELSE 'Died' END\r
              ) AS passengerSummary,\r
              name\r
          FROM titanic\r
          LIMIT 10\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 15단계. 복합 문자열 처리의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 15단계. 복합 문자열 처리 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step16_final\r
  title: 16단계. 최종 종합 분석\r
  structuredPrimary: true\r
  subtitle: 모든 문자열 기법 활용\r
  goal: 16단계. 최종 종합 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: SPLIT_PART로 호칭을 정교하게 추출하고, CASE WHEN으로 그룹화한 후 생존율을 분석하는 종합 쿼리입니다. 실무에서 이런 패턴으로 텍스트 데이터를\r
    정제하고 인사이트를 도출합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        WITH titleExtract AS (\r
            SELECT\r
                *,\r
                TRIM(SPLIT_PART(SPLIT_PART(name, ',', 2), '.', 1)) AS title\r
            FROM titanic\r
        ),\r
        titleGroup AS (\r
            SELECT\r
                CASE\r
                    WHEN title IN ('Mr', 'Mrs', 'Miss', 'Master') THEN title\r
                    WHEN title IN ('Dr', 'Rev') THEN '전문직'\r
                    WHEN title IN ('Col', 'Major', 'Capt') THEN '군인'\r
                    ELSE '귀족/기타'\r
                END AS titleCategory,\r
                survived,\r
                age,\r
                fare\r
            FROM titleExtract\r
        )\r
        SELECT\r
            titleCategory,\r
            COUNT(*) AS total,\r
            SUM(survived) AS survivors,\r
            ROUND(AVG(survived) * 100, 1) AS survivalRate,\r
            ROUND(AVG(age), 1) AS avgAge,\r
            ROUND(AVG(fare), 2) AS avgFare\r
        FROM titleGroup\r
        GROUP BY titleCategory\r
        ORDER BY survivalRate DESC\r
    """).show()\r
  exercise:\r
    prompt: 16단계. 최종 종합 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          WITH titleExtract AS (\r
              SELECT\r
                  *,\r
                  TRIM(SPLIT_PART(SPLIT_PART(name, ',', 2), '.', 1)) AS title\r
              FROM titanic\r
          ),\r
          titleGroup AS (\r
              SELECT\r
                  CASE\r
                      WHEN title IN ('Mr', 'Mrs', 'Miss', 'Master') THEN title\r
                      WHEN title IN ('Dr', 'Rev') THEN '전문직'\r
                      WHEN title IN ('Col', 'Major', 'Capt') THEN '군인'\r
                      ELSE '귀족/기타'\r
                  END AS titleCategory,\r
                  survived,\r
                  age,\r
                  fare\r
              FROM titleExtract\r
          )\r
          SELECT\r
              titleCategory,\r
              COUNT(*) AS total,\r
              SUM(survived) AS survivors,\r
              ROUND(AVG(survived) * 100, 1) AS survivalRate,\r
              ROUND(AVG(age), 1) AS avgAge,\r
              ROUND(AVG(fare), 2) AS avgFare\r
          FROM titleGroup\r
          GROUP BY titleCategory\r
          ORDER BY survivalRate DESC\r
      """).show()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 16단계. 최종 종합 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 16단계. 최종 종합 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 문자열 함수 종합 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    문자열 함수를 종합 활용하여 타이타닉 데이터를 심층 분석해봅시다.\r
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
        "class": ["Third", "First", "Second", "Second", "First", "Third", "First", "Second", "First", "First", "Second", "First"],\r
        "who": ["man", "woman", "woman", "child", "woman", "man", "woman", "man", "man", "man", "man", "woman"],\r
        "embark_town": ["Southampton", "Cherbourg", "Southampton", None, "Cherbourg", "Queenstown", "Cherbourg", "Southampton", "Southampton", "Cherbourg", "Southampton", "Cherbourg"],\r
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
          "class": ["Third", "First", "Second", "Second", "First", "Third", "First", "Second", "First", "First", "Second", "First"],\r
          "who": ["man", "woman", "woman", "child", "woman", "man", "woman", "man", "man", "man", "man", "woman"],\r
          "embark_town": ["Southampton", "Cherbourg", "Southampton", None, "Cherbourg", "Queenstown", "Cherbourg", "Southampton", "Southampton", "Cherbourg", "Southampton", "Cherbourg"],\r
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
    content: 문자열 함수와 패턴 매칭을 완벽히 마스터했습니다!\r
  - type: list\r
    items:\r
    - LIKE - 간단한 패턴 검색 (%는 임의 문자열, _는 1개 문자)\r
    - CONCAT - 문자열 결합 (|| 연산자와 동일)\r
    - SUBSTR - 부분 문자열 추출 (시작위치 1부터)\r
    - UPPER, LOWER - 대소문자 변환\r
    - TRIM - 공백 제거 (LTRIM, RTRIM)\r
    - LENGTH - 문자열 길이\r
    - REPLACE - 문자열 치환\r
    - SPLIT_PART - 구분자로 분리 후 추출\r
    - REGEXP_MATCHES - 정규표현식 패턴 체크\r
    - REGEXP_EXTRACT - 정규표현식으로 값 추출\r
  - type: text\r
    content: 다음 시간에는 모든 개념을 종합한 최종 프로젝트를 진행합니다!\r
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