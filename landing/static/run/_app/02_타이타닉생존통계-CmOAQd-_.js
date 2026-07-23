var e=`meta:\r
  packages:\r
  - duckdb\r
  - pandas\r
  id: duckdb_02\r
  title: 타이타닉생존통계\r
  order: 2\r
  category: duckdb\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - duckdb\r
  - GROUP BY\r
  - 집계함수\r
  - titanic\r
  - 생존율\r
  seo:\r
    title: DuckDB GROUP BY 집계 - 타이타닉 생존 통계 분석\r
    description: DuckDB로 타이타닉 생존 데이터를 분석합니다. GROUP BY, COUNT, AVG, SUM으로 그룹별 생존율을 집계합니다.\r
    keywords:\r
    - DuckDB\r
    - GROUP BY\r
    - 집계함수\r
    - 타이타닉\r
    - 생존율 분석\r
intro:\r
  emoji: 🚢\r
  goal: 타이타닉 승객 데이터에서 그룹별 생존율을 집계합니다.\r
  description: GROUP BY와 집계 함수로 객실 등급별, 성별, 연령대별 생존율을 분석합니다. SQL 집계의 핵심을 마스터합니다.\r
  direction: 타이타닉생존통계에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.\r
  - 타이타닉생존통계 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 구조 파악 처리 실행\r
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 전체 승객 수 세기 결과 검증\r
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.\r
    - label: 타이타닉생존통계 재사용\r
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: SQL 분석 환경\r
      detail: duckdb, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 타이타닉생존통계 실행\r
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.\r
    - label: 타이타닉생존통계 완료\r
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: titanic 데이터 준비\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 타이타닉 승객 데이터를 불러옵니다. 로컬 샘플에는 180명 승객 정보가 담겨 있으며, 생존 여부, 객실 등급, 성별, 나이, 요금 등의 변수를\r
    포함합니다. 이 데이터로 "누가 생존했고, 어떤 요인이 생존에 영향을 미쳤는지"를 분석하는 것이 이번 프로젝트의 목표입니다.\r
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
- id: step2_explore\r
  title: 2단계. 데이터 구조 파악\r
  structuredPrimary: true\r
  subtitle: 컬럼 확인\r
  goal: 2단계. 데이터 구조 파악에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 데이터의 구조와 컬럼을 파악합니다. survived(생존여부, 0/1), pclass(객실등급, 1/2/3등석), sex(성별), age(나이), fare(요금),\r
    embarked(승선항) 등의 컬럼이 있습니다. 분석 전에 데이터 구조를 먼저 확인하는 것은 필수적인 단계입니다. 어떤 변수가 있고, 어떤 타입인지 알아야 적절한 분석 방법을\r
    선택할 수 있기 때문입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: duckdb.sql("SELECT * FROM titanic LIMIT 10")\r
  exercise:\r
    prompt: 2단계. 데이터 구조 파악 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: duckdb.sql("SELECT * FROM titanic LIMIT 10")\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 데이터 구조 파악의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 2단계. 데이터 구조 파악 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step3_count_basic\r
  title: 3단계. 전체 승객 수 세기\r
  structuredPrimary: true\r
  subtitle: COUNT(*)\r
  goal: 3단계. 전체 승객 수 세기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    COUNT(*)는 테이블의 전체 행 수를 셉니다. 집계 함수 중 가장 기본이 되는 함수로, 데이터가 몇 건인지 빠르게 파악할 때 사용합니다. 타이타닉 데이터에 몇 명의 승객이 기록되어 있는지 확인해봅시다. 이 정보는 이후 생존율 계산의 분모가 됩니다.\r
\r
    COUNT(*)는 NULL 포함 모든 행을 셉니다. COUNT(컬럼명)은 해당 컬럼이 NULL이 아닌 행만 셉니다.\r
  snippet: duckdb.sql("SELECT COUNT(*) AS totalPassengers FROM titanic")\r
  exercise:\r
    prompt: 3단계. 전체 승객 수 세기 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: duckdb.sql("SELECT COUNT(*) AS totalPassengers FROM titanic")\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 전체 승객 수 세기의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 3단계. 전체 승객 수 세기 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step4_count_column\r
  title: 4단계. 특정 컬럼 행 수 세기\r
  structuredPrimary: true\r
  subtitle: COUNT(col)\r
  goal: 4단계. 특정 컬럼 행 수 세기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: COUNT(컬럼명)은 해당 컬럼에서 NULL이 아닌 값만 셉니다. 실제 데이터에는 누락된 값(NULL)이 있을 수 있으며, 이를 파악하는 것이 데이터 품질 확인의 첫\r
    단계입니다. 로컬 titanic 샘플에서는 age가 모두 채워져 있어 COUNT(*)와 COUNT(age)가 같습니다. 결측 예시는 deck 같은 컬럼에서 따로 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            COUNT(*) AS totalRows,\r
            COUNT(age) AS ageNotNull\r
        FROM titanic\r
    """)\r
  exercise:\r
    prompt: 4단계. 특정 컬럼 행 수 세기 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              COUNT(*) AS totalRows,\r
              COUNT(age) AS ageNotNull\r
          FROM titanic\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 특정 컬럼 행 수 세기의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 4단계. 특정 컬럼 행 수 세기 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step5_distinct\r
  title: 5단계. 고유 값 확인\r
  structuredPrimary: true\r
  subtitle: DISTINCT\r
  goal: 5단계. 고유 값 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    DISTINCT는 중복을 제거한 고유 값만 반환합니다. 데이터에 어떤 값들이 존재하는지 파악할 때 유용합니다. 객실 등급(pclass)이 몇 종류인지, 어떤 값들인지 확인해봅시다. 타이타닉에는 1등석, 2등석, 3등석 세 가지 등급이 있으며, 등급에 따라 생존율이 크게 달랐습니다.\r
\r
    DISTINCT는 SELECT 바로 뒤에 위치합니다. 여러 컬럼을 지정하면 조합의 고유값을 반환합니다.\r
  snippet: duckdb.sql("SELECT DISTINCT pclass FROM titanic ORDER BY pclass")\r
  exercise:\r
    prompt: 5단계. 고유 값 확인 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: duckdb.sql("SELECT DISTINCT pclass FROM titanic ORDER BY pclass")\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 고유 값 확인의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 5단계. 고유 값 확인 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step6_groupby_basic\r
  title: 6단계. GROUP BY 기초\r
  structuredPrimary: true\r
  subtitle: 그룹별 집계\r
  goal: 6단계. GROUP BY 기초에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    GROUP BY는 데이터를 특정 컬럼 기준으로 그룹화하여 집계합니다. 엑셀의 피벗 테이블과 비슷한 개념으로, 범주별 통계를 낼 때 필수적입니다. 객실 등급별로 승객이 몇 명인지 세어봅시다. 1등석, 2등석, 3등석 승객 수의 차이를 통해 당시 사회 구조를 엿볼 수 있습니다.\r
\r
    GROUP BY에 지정한 컬럼은 SELECT에도 포함해야 합니다. 집계함수와 함께 사용합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT pclass, COUNT(*) AS passengers\r
        FROM titanic\r
        GROUP BY pclass\r
    """)\r
  exercise:\r
    prompt: 6단계. GROUP BY 기초 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT pclass, COUNT(*) AS passengers\r
          FROM titanic\r
          GROUP BY pclass\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. GROUP BY 기초의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 6단계. GROUP BY 기초 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step7_sum\r
  title: 7단계. 합계 구하기\r
  structuredPrimary: true\r
  subtitle: SUM()\r
  goal: 7단계. 합계 구하기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    SUM() 함수는 숫자 컬럼의 합계를 계산합니다. survived 컬럼은 생존=1, 사망=0으로 코딩되어 있으므로, SUM(survived)는 곧 생존자 수가 됩니다. 객실 등급별 생존자 수를 계산해봅시다. 이 결과를 보면 1등석 승객의 생존자가 많다는 것을 알 수 있지만, 정확한 비교를 위해서는 생존율(비율)을 계산해야 합니다.\r
\r
    survived 컬럼은 0(사망)과 1(생존)로 구성됩니다. SUM(survived)은 생존자 수와 같습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT pclass, SUM(survived) AS survivors\r
        FROM titanic\r
        GROUP BY pclass\r
    """)\r
  exercise:\r
    prompt: 7단계. 합계 구하기 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT pclass, SUM(survived) AS survivors\r
          FROM titanic\r
          GROUP BY pclass\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 합계 구하기의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 7단계. 합계 구하기 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step8_avg\r
  title: 8단계. 평균 구하기\r
  structuredPrimary: true\r
  subtitle: AVG()\r
  goal: 8단계. 평균 구하기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    AVG() 함수로 평균을 계산합니다. survived 컬럼이 0과 1로만 이루어져 있으므로, AVG(survived)는 1의 비율, 즉 생존율이 됩니다. 예를 들어 10명 중 6명이 생존했다면 평균은 0.6이고, 이는 60% 생존율을 의미합니다. 100을 곱하면 퍼센트로 표시됩니다. 이 방법은 이진(0/1) 데이터의 비율을 계산하는 표준적인 SQL 패턴입니다.\r
\r
    AVG(survived)는 0과 1의 평균이므로 생존 비율이 됩니다. 100을 곱하면 퍼센트로 표현됩니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            ROUND(AVG(survived) * 100, 1) AS survivalRate\r
        FROM titanic\r
        GROUP BY pclass\r
    """)\r
  exercise:\r
    prompt: 8단계. 평균 구하기 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              ROUND(AVG(survived) * 100, 1) AS survivalRate\r
          FROM titanic\r
          GROUP BY pclass\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 평균 구하기의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 8단계. 평균 구하기 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step9_minmax\r
  title: 9단계. 최소/최대 구하기\r
  structuredPrimary: true\r
  subtitle: MIN(), MAX()\r
  goal: 9단계. 최소/최대 구하기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    MIN()과 MAX() 함수로 최소값과 최대값을 구합니다. 데이터의 범위를 파악하는 데 유용하며, 이상치를 탐지하는 데도 활용됩니다. 객실 등급별 요금(fare) 범위를 확인해봅시다. 1등석은 최저 0달러부터 최고 500달러가 넘는 요금까지 분포하며, 3등석은 상대적으로 좁은 범위를 가집니다.\r
\r
    MIN, MAX는 숫자뿐 아니라 문자열, 날짜에도 사용할 수 있습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            MIN(fare) AS minFare,\r
            MAX(fare) AS maxFare,\r
            ROUND(AVG(fare), 2) AS avgFare\r
        FROM titanic\r
        GROUP BY pclass\r
    """)\r
  exercise:\r
    prompt: 9단계. 최소/최대 구하기 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              MIN(fare) AS minFare,\r
              MAX(fare) AS maxFare,\r
              ROUND(AVG(fare), 2) AS avgFare\r
          FROM titanic\r
          GROUP BY pclass\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 최소/최대 구하기의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 9단계. 최소/최대 구하기 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step10_orderby\r
  title: 10단계. 결과 정렬\r
  structuredPrimary: true\r
  subtitle: ORDER BY\r
  goal: 10단계. 결과 정렬에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    ORDER BY 절은 쿼리 결과를 특정 컬럼 기준으로 정렬합니다. 기본적으로 오름차순(ASC, 작은 값 먼저)으로 정렬되며, 데이터를 보기 좋게 정리하거나 상위/하위 항목을 찾을 때 필수입니다. 생존율이 낮은 순서부터 높은 순서로 정렬해봅시다. 어느 등급의 생존율이 가장 낮았는지 명확하게 볼 수 있습니다.\r
\r
    ORDER BY는 기본 오름차순(ASC)입니다. 컬럼명이나 SELECT 절의 별칭을 사용할 수 있습니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            COUNT(*) AS passengers,\r
            ROUND(AVG(survived) * 100, 1) AS survivalRate\r
        FROM titanic\r
        GROUP BY pclass\r
        ORDER BY survivalRate\r
    """)\r
  exercise:\r
    prompt: 10단계. 결과 정렬 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              COUNT(*) AS passengers,\r
              ROUND(AVG(survived) * 100, 1) AS survivalRate\r
          FROM titanic\r
          GROUP BY pclass\r
          ORDER BY survivalRate\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 결과 정렬의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 10단계. 결과 정렬 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step11_desc\r
  title: 11단계. 내림차순 정렬\r
  structuredPrimary: true\r
  subtitle: DESC\r
  goal: 11단계. 내림차순 정렬에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    DESC(descending)를 ORDER BY 뒤에 붙이면 내림차순(큰 값 먼저)으로 정렬됩니다. 실무에서는 "상위 10개", "가장 많이 팔린 상품" 같은 분석에 DESC를 자주 사용합니다. 생존율이 높은 등급부터 표시해봅시다. 1등석 승객의 생존율이 가장 높고, 3등석이 가장 낮다는 것을 명확하게 확인할 수 있습니다.\r
\r
    DESC는 descending(내림차순)의 약자입니다. ORDER BY 컬럼명 DESC 형태로 사용합니다.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            COUNT(*) AS passengers,\r
            ROUND(AVG(survived) * 100, 1) AS survivalRate\r
        FROM titanic\r
        GROUP BY pclass\r
        ORDER BY survivalRate DESC\r
    """)\r
  exercise:\r
    prompt: 11단계. 내림차순 정렬 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              COUNT(*) AS passengers,\r
              ROUND(AVG(survived) * 100, 1) AS survivalRate\r
          FROM titanic\r
          GROUP BY pclass\r
          ORDER BY survivalRate DESC\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 내림차순 정렬의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 11단계. 내림차순 정렬 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step12_groupby_multi\r
  title: 12단계. 다중 그룹화\r
  structuredPrimary: true\r
  subtitle: 여러 컬럼으로 GROUP BY\r
  goal: 12단계. 다중 그룹화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: GROUP BY에 여러 컬럼을 콤마로 구분하여 나열하면 다중 그룹화가 가능합니다. 등급별 분석만으로는 놓치는 패턴이 있을 수 있습니다. 등급과 성별을 함께\r
    그룹화하면 "1등석 여성", "3등석 남성" 같은 세부 그룹별 통계를 얻을 수 있습니다. 실제로 타이타닉에서 "여성과 아이 먼저" 정책으로 인해 성별에 따른 생존율 차이가 매우\r
    컸습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            pclass,\r
            sex,\r
            COUNT(*) AS passengers,\r
            SUM(survived) AS survivors,\r
            ROUND(AVG(survived) * 100, 1) AS survivalRate\r
        FROM titanic\r
        GROUP BY pclass, sex\r
        ORDER BY pclass, sex\r
    """)\r
  exercise:\r
    prompt: 12단계. 다중 그룹화 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              pclass,\r
              sex,\r
              COUNT(*) AS passengers,\r
              SUM(survived) AS survivors,\r
              ROUND(AVG(survived) * 100, 1) AS survivalRate\r
          FROM titanic\r
          GROUP BY pclass, sex\r
          ORDER BY pclass, sex\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 12단계. 다중 그룹화의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 12단계. 다중 그룹화 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: step13_final\r
  title: 13단계. 최종 분석\r
  structuredPrimary: true\r
  subtitle: 종합 생존 통계\r
  goal: 13단계. 최종 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 COUNT, SUM, AVG, MIN, MAX, GROUP BY, ORDER BY를 모두 활용한 종합 분석입니다. 성별에 따른 생존 통계를 정리하면\r
    타이타닉 생존의 핵심 패턴이 드러납니다. 로컬 샘플에서는 여성 생존율 100%, 남성 생존율 25%로 큰 차이가 나도록 설계되어 있습니다. 성별 그룹을 나누어 집계하면 이런 차이를 바로 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    duckdb.sql("""\r
        SELECT\r
            sex,\r
            COUNT(*) AS totalPassengers,\r
            COUNT(age) AS ageKnown,\r
            SUM(survived) AS survivors,\r
            COUNT(*) - SUM(survived) AS deceased,\r
            ROUND(AVG(survived) * 100, 1) AS survivalRate,\r
            ROUND(AVG(age), 1) AS avgAge,\r
            ROUND(AVG(fare), 2) AS avgFare\r
        FROM titanic\r
        GROUP BY sex\r
        ORDER BY survivalRate DESC\r
    """)\r
  exercise:\r
    prompt: 13단계. 최종 분석 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.\r
    starterCode: |-\r
      duckdb.sql("""\r
          SELECT\r
              sex,\r
              COUNT(*) AS totalPassengers,\r
              COUNT(age) AS ageKnown,\r
              SUM(survived) AS survivors,\r
              COUNT(*) - SUM(survived) AS deceased,\r
              ROUND(AVG(survived) * 100, 1) AS survivalRate,\r
              ROUND(AVG(age), 1) AS avgAge,\r
              ROUND(AVG(fare), 2) AS avgFare\r
          FROM titanic\r
          GROUP BY sex\r
          ORDER BY survivalRate DESC\r
      """)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 13단계. 최종 분석의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.\r
    resultCheck: 13단계. 최종 분석 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 타이타닉 생존 분석 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
  explanation: |-\r
    배운 GROUP BY와 집계 함수를 활용하여 타이타닉 데이터를 다양한 관점에서 분석합니다. COUNT, SUM, AVG, MIN, MAX를 적절히 조합하고 ORDER BY로 결과를 정렬하면 의미 있는 인사이트를 도출할 수 있습니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    import duckdb\r
    data = pd.DataFrame({\r
        "survived": [0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],\r
        "pclass": [3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 1],\r
        "sex": ["male", "female", "female", "male", "female", "male", "female", "male", "male", "male", "male", "female"],\r
        "age": [22, 38, 18, 8, 29, 41, 45, 54, 49, 36, 42, 31],\r
        "fare": [7.25, 71.28, 13.00, 21.08, 76.29, 8.05, 83.47, 26.00, 35.50, 30.50, 13.00, 79.65],\r
        "class": ["Third", "First", "Second", "Second", "First", "Third", "First", "Second", "First", "First", "Second", "First"],\r
        "who": ["man", "woman", "woman", "child", "woman", "man", "woman", "man", "man", "man", "man", "woman"],\r
        "embark_town": ["Southampton", "Cherbourg", "Southampton", "Southampton", "Cherbourg", "Queenstown", "Cherbourg", "Southampton", "Southampton", "Cherbourg", "Southampton", "Cherbourg"],\r
        "name": ["Smith, Mr. John", "Smith, Mrs. Anna", "Smith, Miss. Clara", "Brown, Master. Tim", "Wilson, Mrs. Rose", "Brown, Mr. George", "Doe, Dr. Helen", "Miller, Rev. James", "Stone, Col. Arthur", "Major, Major. Alan", "Taylor, Capt. Mark", "Brown, Miss. Ella"],\r
    })\r
    tbl = duckdb.from_df(data)\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import duckdb\r
      data = pd.DataFrame({\r
          "survived": [0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],\r
          "pclass": [3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 1],\r
          "sex": ["male", "female", "female", "male", "female", "male", "female", "male", "male", "male", "male", "female"],\r
          "age": [22, 38, 18, 8, 29, 41, 45, 54, 49, 36, 42, 31],\r
          "fare": [7.25, 71.28, 13.00, 21.08, 76.29, 8.05, 83.47, 26.00, 35.50, 30.50, 13.00, 79.65],\r
          "class": ["Third", "First", "Second", "Second", "First", "Third", "First", "Second", "First", "First", "Second", "First"],\r
          "who": ["man", "woman", "woman", "child", "woman", "man", "woman", "man", "man", "man", "man", "woman"],\r
          "embark_town": ["Southampton", "Cherbourg", "Southampton", "Southampton", "Cherbourg", "Queenstown", "Cherbourg", "Southampton", "Southampton", "Cherbourg", "Southampton", "Cherbourg"],\r
          "name": ["Smith, Mr. John", "Smith, Mrs. Anna", "Smith, Miss. Clara", "Brown, Master. Tim", "Wilson, Mrs. Rose", "Brown, Mr. George", "Doe, Dr. Helen", "Miller, Rev. James", "Stone, Col. Arthur", "Major, Major. Alan", "Taylor, Capt. Mark", "Brown, Miss. Ella"],\r
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
    content: GROUP BY와 집계 함수를 마스터했습니다.\r
  - type: list\r
    items:\r
    - COUNT(*) - 전체 행 수\r
    - COUNT(col) - NULL 제외 행 수\r
    - SUM(col) - 합계\r
    - AVG(col) - 평균\r
    - MIN(col), MAX(col) - 최소/최대\r
    - DISTINCT - 중복 제거\r
    - GROUP BY - 그룹별 집계\r
    - ORDER BY - 정렬\r
    - DESC - 내림차순\r
  - type: text\r
    content: 다음 시간에는 WHERE 조건과 HAVING으로 필터링을 배웁니다.\r
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