var e=`meta:\r
  packages:\r
  - pandas\r
  id: pandas_10\r
  title: 실전종합프로젝트\r
  order: 10\r
  category: pandas\r
  difficulty: ⭐⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - 실전\r
  - API\r
  - JSON\r
  - 프로젝트\r
  - 종합\r
  - 검증\r
  - 통합프로젝트\r
  seo:\r
    title: pandas 실전 프로젝트 - API 응답 분석부터 저장까지\r
    description: API 응답 형태의 JSON 데이터를 pandas로 분석하는 전체 과정을 실습합니다. 데이터 구조 이해, 정제, 분석, 저장까지 완전한 파이프라인을 경험합니다.\r
    keywords:\r
    - pandas API\r
    - JSON\r
    - 응답 데이터\r
    - 실전 프로젝트\r
    - 데이터 파이프라인\r
intro:\r
  emoji: 🚀\r
  goal: API 응답 형태의 JSON 데이터를 정제하고 분석하는 전체 과정을 경험합니다.\r
  description: 지금까지 배운 모든 기술을 총동원합니다. 실제 API 응답과 같은 JSON 구조를 로컬 샘플로 재현하고, 수집 이후의 정제와 분석 워크플로우를 끝까지 익힙니다.\r
  direction: 실전종합프로젝트에서 표 데이터를 불러오고 정제, 집계, 검증 결과까지 연결합니다.\r
  benefits:\r
  - DataFrame 입력 확인 후 정제와 집계에 맞는 코드 입력을 고릅니다.\r
  - 실전종합프로젝트 결과를 행/열 수와 요약값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 데이터 리포트 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. API 개념 입력 확인\r
      detail: 입력 기준(DataFrame 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 확인 처리 실행\r
      detail: 정제와 집계 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 필요한 컬럼 선택 결과 검증\r
      detail: 행/열 수와 요약값 기준으로 실행 결과를 비교합니다.\r
    - label: 실전종합프로젝트 재사용\r
      detail: 완성 코드를 데이터 리포트 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표 데이터 환경\r
      detail: pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 실전종합프로젝트 실행\r
      detail: 셀을 실행해 행/열 수와 요약값와 예외 상태를 확인합니다.\r
    - label: 실전종합프로젝트 완료\r
      detail: 검증된 코드를 데이터 리포트 자동화로 남깁니다.\r
sections:\r
- id: step1_api_concept\r
  title: 1단계. API 개념\r
  structuredPrimary: true\r
  subtitle: 데이터를 가져오는 방법\r
  goal: 1단계. API 개념에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    API(Application Programming Interface)는 다른 서비스의 데이터를 가져오는 창구입니다. 이 수업에서는 GitHub Issues API 응답과 같은 리스트/딕셔너리 구조를 로컬 샘플로 만들고 DataFrame으로 변환합니다. 네트워크, 인증, 호출 제한에 흔들리지 않고 JSON 구조 파악, 컬럼 선택, 날짜 변환, 집계, 저장이라는 핵심 pandas 흐름에 집중합니다.\r
\r
    API 응답은 보통 딕셔너리의 리스트 형태로 들어옵니다. pd.DataFrame()에 이 리스트를 넣으면 각 딕셔너리의 키가 컬럼이 됩니다. 실제 API를 붙일 때도 이 구조를 먼저 이해해야 이후 정제와 분석 코드가 안정적입니다.\r
  tips:\r
  - API 응답은 보통 딕셔너리의 리스트 형태로 들어옵니다. pd.DataFrame()에 이 리스트를 넣으면 각 딕셔너리의 키가 컬럼이 됩니다. 실제 API를 붙일 때도 이 구조를\r
    먼저 이해해야 이후 정제와 분석 코드가 안정적입니다.\r
  snippet: |-\r
    import pandas as pd\r
\r
    def sampleGithubIssues(repo="pandas-dev/pandas"):\r
        project = repo.split("/")[-1]\r
        return [\r
            {\r
                "number": 101,\r
                "title": f"[{project}] Improve groupby documentation for beginners",\r
                "state": "open",\r
                "created_at": "2026-01-15T09:30:00Z",\r
                "comments": 4,\r
                "user": {"login": "dataTeacher"},\r
            },\r
            {\r
                "number": 102,\r
                "title": f"[{project}] Fix read_csv encoding edge case",\r
                "state": "closed",\r
                "created_at": "2026-01-10T12:00:00Z",\r
                "comments": 8,\r
                "user": {"login": "csvMaintainer"},\r
            },\r
            {\r
                "number": 103,\r
                "title": f"[{project}] Add examples for datetime parsing",\r
                "state": "open",\r
                "created_at": "2026-01-08T15:45:00Z",\r
                "comments": 2,\r
                "user": {"login": "timeSeriesFan"},\r
            },\r
            {\r
                "number": 104,\r
                "title": f"[{project}] Clarify nullable integer behavior",\r
                "state": "closed",\r
                "created_at": "2026-01-06T08:10:00Z",\r
                "comments": 12,\r
                "user": {"login": "dtypeReviewer"},\r
            },\r
            {\r
                "number": 105,\r
                "title": f"[{project}] Add cookbook section for joins",\r
                "state": "open",\r
                "created_at": "2026-01-04T14:20:00Z",\r
                "comments": 6,\r
                "user": {"login": "mergeHelper"},\r
            },\r
            {\r
                "number": 106,\r
                "title": f"[{project}] Improve error message for missing columns",\r
                "state": "closed",\r
                "created_at": "2025-12-30T11:05:00Z",\r
                "comments": 3,\r
                "user": {"login": "bugReporter"},\r
            },\r
            {\r
                "number": 107,\r
                "title": f"[{project}] Benchmark rolling window examples",\r
                "state": "open",\r
                "created_at": "2025-12-28T16:40:00Z",\r
                "comments": 10,\r
                "user": {"login": "perfAnalyst"},\r
            },\r
            {\r
                "number": 108,\r
                "title": f"[{project}] Update plotting guide screenshots",\r
                "state": "closed",\r
                "created_at": "2025-12-24T09:00:00Z",\r
                "comments": 1,\r
                "user": {"login": "docsCurator"},\r
            },\r
            {\r
                "number": 109,\r
                "title": f"[{project}] Investigate memory spike in concat",\r
                "state": "open",\r
                "created_at": "2025-12-20T18:25:00Z",\r
                "comments": 15,\r
                "user": {"login": "memoryWatch"},\r
            },\r
            {\r
                "number": 110,\r
                "title": f"[{project}] Add beginner exercise for value_counts",\r
                "state": "closed",\r
                "created_at": "2025-12-18T07:35:00Z",\r
                "comments": 5,\r
                "user": {"login": "courseBuilder"},\r
            },\r
        ]\r
\r
    issueRecords = sampleGithubIssues()\r
    issues = pd.DataFrame(issueRecords)\r
    issues.shape\r
  exercise:\r
    prompt: 1단계. API 개념 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
\r
      def sampleGithubIssues(repo="pandas-dev/pandas"):\r
          project = repo.split("/")[-1]\r
          return [\r
              {\r
                  "number": 101,\r
                  "title": f"[{project}] Improve groupby documentation for beginners",\r
                  "state": "open",\r
                  "created_at": "2026-01-15T09:30:00Z",\r
                  "comments": 4,\r
                  "user": {"login": "dataTeacher"},\r
              },\r
              {\r
                  "number": 102,\r
                  "title": f"[{project}] Fix read_csv encoding edge case",\r
                  "state": "closed",\r
                  "created_at": "2026-01-10T12:00:00Z",\r
                  "comments": 8,\r
                  "user": {"login": "csvMaintainer"},\r
              },\r
              {\r
                  "number": 103,\r
                  "title": f"[{project}] Add examples for datetime parsing",\r
                  "state": "open",\r
                  "created_at": "2026-01-08T15:45:00Z",\r
                  "comments": 2,\r
                  "user": {"login": "timeSeriesFan"},\r
              },\r
              {\r
                  "number": 104,\r
                  "title": f"[{project}] Clarify nullable integer behavior",\r
                  "state": "closed",\r
                  "created_at": "2026-01-06T08:10:00Z",\r
                  "comments": 12,\r
                  "user": {"login": "dtypeReviewer"},\r
              },\r
              {\r
                  "number": 105,\r
                  "title": f"[{project}] Add cookbook section for joins",\r
                  "state": "open",\r
                  "created_at": "2026-01-04T14:20:00Z",\r
                  "comments": 6,\r
                  "user": {"login": "mergeHelper"},\r
              },\r
              {\r
                  "number": 106,\r
                  "title": f"[{project}] Improve error message for missing columns",\r
                  "state": "closed",\r
                  "created_at": "2025-12-30T11:05:00Z",\r
                  "comments": 3,\r
                  "user": {"login": "bugReporter"},\r
              },\r
              {\r
                  "number": 107,\r
                  "title": f"[{project}] Benchmark rolling window examples",\r
                  "state": "open",\r
                  "created_at": "2025-12-28T16:40:00Z",\r
                  "comments": 10,\r
                  "user": {"login": "perfAnalyst"},\r
              },\r
              {\r
                  "number": 108,\r
                  "title": f"[{project}] Update plotting guide screenshots",\r
                  "state": "closed",\r
                  "created_at": "2025-12-24T09:00:00Z",\r
                  "comments": 1,\r
                  "user": {"login": "docsCurator"},\r
              },\r
              {\r
                  "number": 109,\r
                  "title": f"[{project}] Investigate memory spike in concat",\r
                  "state": "open",\r
                  "created_at": "2025-12-20T18:25:00Z",\r
                  "comments": 15,\r
                  "user": {"login": "memoryWatch"},\r
              },\r
              {\r
                  "number": 110,\r
                  "title": f"[{project}] Add beginner exercise for value_counts",\r
                  "state": "closed",\r
                  "created_at": "2025-12-18T07:35:00Z",\r
                  "comments": 5,\r
                  "user": {"login": "courseBuilder"},\r
              },\r
          ]\r
\r
      issueRecords = sampleGithubIssues()\r
      issues = pd.DataFrame(issueRecords)\r
      issues.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. API 개념의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. API 개념 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step2_preview\r
  title: 2단계. 데이터 확인\r
  structuredPrimary: true\r
  subtitle: 컬럼 목록 확인\r
  goal: 2단계. 데이터 확인에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: API 응답 데이터는 컬럼이 매우 많습니다. GitHub Issues API의 경우 30개 이상의 컬럼이 반환됩니다. 모든 컬럼을 사용하면 복잡하고 분석에\r
    불필요한 정보가 많으므로, 목적에 맞는 컬럼만 선택하는 것이 중요합니다. columns.tolist()로 전체 컬럼 목록을 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: issues.columns.tolist()[:10]\r
  exercise:\r
    prompt: 2단계. 데이터 확인 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: issues.columns.tolist()[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 확인의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 2단계. 데이터 확인 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step3_select\r
  title: 3단계. 필요한 컬럼 선택\r
  structuredPrimary: true\r
  subtitle: 분석할 데이터만 추출\r
  goal: 3단계. 필요한 컬럼 선택에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 분석 목적에 맞는 컬럼만 선택합니다. number(이슈 번호), title(제목), state(상태), created_at(생성일), comments(댓글\r
    수) 5가지를 선택합니다. copy()를 붙여서 원본과 분리된 새 DataFrame을 만듭니다. 이렇게 필요한 데이터만 추출하면 메모리를 절약하고 분석이 명확해집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    clean = issues[['number', 'title', 'state', 'created_at', 'comments']].copy()\r
    clean.head()\r
  exercise:\r
    prompt: 3단계. 필요한 컬럼 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      clean = issues[['number', 'title', 'state', 'created_at', 'comments']].copy()\r
      clean.head()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 필요한 컬럼 선택의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 3단계. 필요한 컬럼 선택의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step4_datetime\r
  title: 4단계. 날짜 타입 변환\r
  structuredPrimary: true\r
  subtitle: pd.to_datetime()\r
  goal: 4단계. 날짜 타입 변환에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: API에서 받은 날짜는 '2024-01-15T09:30:00Z' 같은 ISO 8601 형식의 문자열입니다. pd.to_datetime()으로 datetime\r
    타입으로 변환해야 날짜 계산, 기간 필터링, 시계열 분석이 가능합니다. datetime 타입이어야 .dt 접근자로 연도, 월, 요일 등을 추출할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    dated = clean.copy()\r
    dated['created_at'] = pd.to_datetime(dated['created_at'])\r
    dated.dtypes\r
  exercise:\r
    prompt: 4단계. 날짜 타입 변환 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      dated = clean.copy()\r
      dated['created_at'] = pd.to_datetime(dated['created_at'])\r
      dated.dtypes\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 날짜 타입 변환의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. 날짜 타입 변환의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_new_column\r
  title: 5단계. 새 컬럼 추가\r
  structuredPrimary: true\r
  subtitle: 제목 길이 계산\r
  goal: 5단계. 새 컬럼 추가에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 5단계. 새 컬럼 추가의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - str.len()은 문자열 길이를 반환합니다. Series에 .str을 붙이면 각 행에 문자열 메서드를 적용할 수 있습니다. str.upper(), str.lower(), str.contains()\r
    등 다양한 문자열 처리 메서드를 사용할 수 있습니다.\r
  snippet: |-\r
    final = dated.copy()\r
    final['titleLength'] = final['title'].str.len()\r
    final[['title', 'titleLength']].head()\r
  exercise:\r
    prompt: 5단계. 새 컬럼 추가 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      final = dated.copy()\r
      final['titleLength'] = final['title'].str.len()\r
      final[['title', 'titleLength']].head()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 새 컬럼 추가의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 5단계. 새 컬럼 추가의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step6_describe\r
  title: 6단계. 기본 통계\r
  structuredPrimary: true\r
  subtitle: describe()로 분포 확인\r
  goal: 6단계. 기본 통계에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 댓글 수와 제목 길이의 분포를 확인합니다. describe()로 평균, 표준편차, 최소/최대값 등을 한눈에 파악합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: final[['comments', 'titleLength']].describe()\r
  exercise:\r
    prompt: 6단계. 기본 통계 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: final[['comments', 'titleLength']].describe()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 기본 통계의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 6단계. 기본 통계 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step7_value_counts\r
  title: 7단계. 상태별 개수\r
  structuredPrimary: true\r
  subtitle: open vs closed\r
  goal: 7단계. 상태별 개수에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 열린 이슈와 닫힌 이슈의 비율을 확인합니다. value_counts()로 범주형 데이터의 분포를 파악합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: final['state'].value_counts()\r
  exercise:\r
    prompt: 7단계. 상태별 개수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: final['state'].value_counts()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 상태별 개수의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 7단계. 상태별 개수 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step8_top_comments\r
  title: 8단계. 댓글 많은 이슈\r
  structuredPrimary: true\r
  subtitle: nlargest 활용\r
  goal: 8단계. 댓글 많은 이슈에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 댓글이 가장 많은 이슈 5개를 확인합니다. nlargest로 TOP N을 빠르게 찾습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: final.nlargest(5, 'comments')[['number', 'title', 'comments']]\r
  exercise:\r
    prompt: 8단계. 댓글 많은 이슈 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: final.nlargest(5, 'comments')[['number', 'title', 'comments']]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 댓글 많은 이슈의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 8단계. 댓글 많은 이슈 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step9_corr\r
  title: 9단계. 상관관계 분석\r
  structuredPrimary: true\r
  subtitle: 제목 길이 vs 댓글 수\r
  goal: 9단계. 상관관계 분석에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 9단계. 상관관계 분석의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: final[['titleLength', 'comments']].corr()\r
  exercise:\r
    prompt: 9단계. 상관관계 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: final[['titleLength', 'comments']].corr()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 상관관계 분석의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 9단계. 상관관계 분석 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step10_groupby\r
  title: 10단계. 상태별 평균\r
  structuredPrimary: true\r
  subtitle: groupby 활용\r
  goal: 10단계. 상태별 평균에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: open 이슈와 closed 이슈의 평균 댓글 수를 비교합니다. groupby로 그룹별 통계를 계산합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: final.groupby('state')['comments'].mean()\r
  exercise:\r
    prompt: 10단계. 상태별 평균 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: final.groupby('state')['comments'].mean()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 상태별 평균의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 10단계. 상태별 평균 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step11_json_normalize\r
  title: 11단계. 중첩 JSON 펼치기\r
  structuredPrimary: true\r
  subtitle: json_normalize()\r
  goal: 11단계. 중첩 JSON 펼치기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    API 응답에는 중첩된 구조가 많습니다. {'user': {'login': 'name'}} 같은 형태를 user.login처럼 펼쳐서 접근하기 쉽게 만듭니다. json_normalize()가 자동으로 평탄화합니다.\r
\r
    pd.json_normalize()는 중첩된 JSON 구조를 평탄화합니다. max_level로 펼칠 깊이를 조절합니다. user.login처럼 점(.)으로 경로를 표시합니다. 복잡한 API 응답을 DataFrame으로 변환할 때 유용합니다.\r
  tips:\r
  - pd.json_normalize()는 중첩된 JSON 구조를 평탄화합니다. max_level로 펼칠 깊이를 조절합니다. user.login처럼 점(.)으로 경로를 표시합니다.\r
    복잡한 API 응답을 DataFrame으로 변환할 때 유용합니다.\r
  snippet: |-\r
    flat = pd.json_normalize(issueRecords, max_level=1)\r
    flat[['number', 'user.login']].head()\r
  exercise:\r
    prompt: 11단계. 중첩 JSON 펼치기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      flat = pd.json_normalize(issueRecords, max_level=1)\r
      flat[['number', 'user.login']].head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 중첩 JSON 펼치기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 중첩 JSON 펼치기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_save\r
  title: 12단계. CSV 저장\r
  structuredPrimary: true\r
  subtitle: to_csv()\r
  goal: 12단계. CSV 저장에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    분석 결과를 파일로 저장합니다. encoding='utf-8-sig'는 엑셀에서 한글이 깨지지 않게 하는 BOM(Byte Order Mark)을 추가합니다. index=False로 불필요한 인덱스 컬럼을 제외합니다.\r
\r
    to_csv()는 DataFrame을 CSV 파일로 저장합니다. index=False로 인덱스를 제외하고, encoding='utf-8-sig'는 한글이 깨지지 않도록 BOM을 추가합니다. sep 파라미터로 구분자를 변경할 수 있습니다(기본값은 쉼표).\r
  tips:\r
  - to_csv()는 DataFrame을 CSV 파일로 저장합니다. index=False로 인덱스를 제외하고, encoding='utf-8-sig'는 한글이 깨지지 않도록 BOM을\r
    추가합니다. sep 파라미터로 구분자를 변경할 수 있습니다(기본값은 쉼표).\r
  snippet: final.to_csv('github_issues.csv', index=False, encoding='utf-8-sig')\r
  exercise:\r
    prompt: 12단계. CSV 저장 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: final.to_csv('github_issues.csv', index=False, encoding='utf-8-sig')\r
    hints:\r
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.\r
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. CSV 저장의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. CSV 저장의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step13_function\r
  title: 13단계. 재사용 함수 만들기\r
  structuredPrimary: true\r
  subtitle: 파이프라인 자동화\r
  goal: 13단계. 재사용 함수 만들기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 지금까지 한 과정을 함수로 정리하면 같은 응답 구조를 쓰는 다른 리포지토리 샘플에도 쉽게 적용할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def fetchGithubIssues(repo, perPage=10):\r
        records = sampleGithubIssues(repo)[:perPage]\r
        return pd.DataFrame(records)\r
\r
    fetchGithubIssues('numpy/numpy', 5)\r
  exercise:\r
    prompt: 13단계. 재사용 함수 만들기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      def fetchGithubIssues(repo, perPage=10):\r
          records = sampleGithubIssues(repo)[:perPage]\r
          return pd.DataFrame(records)\r
\r
      fetchGithubIssues('numpy/numpy', 5)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 재사용 함수 만들기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 13단계. 재사용 함수 만들기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 이슈 응답을 운영 리포트로 변환'\r
  structuredPrimary: true\r
  subtitle: JSON 정규화, 날짜 변환, groupby, 실패 케이스\r
  goal: '현업 흐름 검증: 이슈 응답을 운영 리포트로 변환에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    실전 프로젝트는 API 호출 자체보다 응답 구조를 안정적으로 표로 바꾸고 검증하는 과정이 중요합니다. 샘플 JSON을 DataFrame으로 변환하고, 상태별 집계와 날짜 파생 컬럼을 확인하세요.\r
\r
    변주 실험\r
    labels를 explode해서 라벨별 이슈 수 리포트를 만들고, 라벨이 없는 이슈를 어떤 그룹으로 처리할지 정책을 정하세요.\r
  tips:\r
  - 변주 실험 labels를 explode해서 라벨별 이슈 수 리포트를 만들고, 라벨이 없는 이슈를 어떤 그룹으로 처리할지 정책을 정하세요.\r
  snippet: |-\r
    import pandas as pd\r
\r
    records = [\r
        {"number": 1, "state": "open", "created_at": "2026-05-01", "labels": ["bug"]},\r
        {"number": 2, "state": "closed", "created_at": "2026-05-03", "labels": ["docs", "good first issue"]},\r
        {"number": 3, "state": "open", "created_at": "2026-05-04", "labels": []},\r
    ]\r
\r
    issues = pd.DataFrame(records)\r
    issues["created_at"] = pd.to_datetime(issues["created_at"])\r
    issues["labelCount"] = issues["labels"].apply(len)\r
    stateReport = issues.groupby("state", as_index=False).agg(\r
        issueCount=("number", "size"),\r
        avgLabels=("labelCount", "mean"),\r
    )\r
\r
    assert issues["created_at"].dt.month.tolist() == [5, 5, 5]\r
    assert stateReport.set_index("state").loc["open", "issueCount"] == 2\r
    assert stateReport["issueCount"].sum() == len(issues)\r
  exercise:\r
    prompt: '현업 흐름 검증: 이슈 응답을 운영 리포트로 변환 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import pandas as pd\r
\r
      records = [\r
          {"number": 1, "state": "open", "created_at": "2026-05-01", "labels": ["bug"]},\r
          {"number": 2, "state": "closed", "created_at": "2026-05-03", "labels": ["docs", "good first issue"]},\r
          {"number": 3, "state": "open", "created_at": "2026-05-04", "labels": []},\r
      ]\r
\r
      issues = pd.DataFrame(records)\r
      issues["created_at"] = pd.to_datetime(issues["created_at"])\r
      issues["labelCount"] = issues["labels"].apply(len)\r
      stateReport = issues.groupby("state", as_index=False).agg(\r
          issueCount=("number", "size"),\r
          avgLabels=("labelCount", "mean"),\r
      )\r
\r
      assert issues["created_at"].dt.month.tolist() == [5, 5, 5]\r
      assert stateReport.set_index("state").loc["open", "issueCount"] == 2\r
      assert stateReport["issueCount"].sum() == len(issues)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 이슈 응답을 운영 리포트로 변환의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.'\r
    resultCheck: '현업 흐름 검증: 이슈 응답을 운영 리포트로 변환의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 실전 분석 프로젝트\r
  goal: 실습에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    다른 리포지토리로 분석해보세요.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
\r
    def sampleGithubIssues(repo="pandas-dev/pandas"):\r
        project = repo.split("/")[-1]\r
        return [\r
            {\r
                "number": 101,\r
                "title": f"[{project}] Improve groupby documentation for beginners",\r
                "state": "open",\r
                "created_at": "2026-01-15T09:30:00Z",\r
                "comments": 4,\r
                "user": {"login": "dataTeacher"},\r
            },\r
            {\r
                "number": 102,\r
                "title": f"[{project}] Fix read_csv encoding edge case",\r
                "state": "closed",\r
                "created_at": "2026-01-10T12:00:00Z",\r
                "comments": 8,\r
                "user": {"login": "csvMaintainer"},\r
            },\r
            {\r
                "number": 103,\r
                "title": f"[{project}] Add examples for datetime parsing",\r
                "state": "open",\r
                "created_at": "2026-01-08T15:45:00Z",\r
                "comments": 2,\r
                "user": {"login": "timeSeriesFan"},\r
            },\r
            {\r
                "number": 104,\r
                "title": f"[{project}] Clarify nullable integer behavior",\r
                "state": "closed",\r
                "created_at": "2026-01-06T08:10:00Z",\r
                "comments": 12,\r
                "user": {"login": "dtypeReviewer"},\r
            },\r
            {\r
                "number": 105,\r
                "title": f"[{project}] Add cookbook section for joins",\r
                "state": "open",\r
                "created_at": "2026-01-04T14:20:00Z",\r
                "comments": 6,\r
                "user": {"login": "mergeHelper"},\r
            },\r
            {\r
                "number": 106,\r
                "title": f"[{project}] Improve error message for missing columns",\r
                "state": "closed",\r
                "created_at": "2025-12-30T11:05:00Z",\r
                "comments": 3,\r
                "user": {"login": "bugReporter"},\r
            },\r
            {\r
                "number": 107,\r
                "title": f"[{project}] Benchmark rolling window examples",\r
                "state": "open",\r
                "created_at": "2025-12-28T16:40:00Z",\r
                "comments": 10,\r
                "user": {"login": "perfAnalyst"},\r
            },\r
            {\r
                "number": 108,\r
                "title": f"[{project}] Update plotting guide screenshots",\r
                "state": "closed",\r
                "created_at": "2025-12-24T09:00:00Z",\r
                "comments": 1,\r
                "user": {"login": "docsCurator"},\r
            },\r
            {\r
                "number": 109,\r
                "title": f"[{project}] Investigate memory spike in concat",\r
                "state": "open",\r
                "created_at": "2025-12-20T18:25:00Z",\r
                "comments": 15,\r
                "user": {"login": "memoryWatch"},\r
            },\r
            {\r
                "number": 110,\r
                "title": f"[{project}] Add beginner exercise for value_counts",\r
                "state": "closed",\r
                "created_at": "2025-12-18T07:35:00Z",\r
                "comments": 5,\r
                "user": {"login": "courseBuilder"},\r
            },\r
        ]\r
\r
    def fetchIssues(repo, perPage=10):\r
        records = sampleGithubIssues(repo)[:perPage]\r
        return pd.DataFrame(records)\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
\r
      def sampleGithubIssues(repo="pandas-dev/pandas"):\r
          project = repo.split("/")[-1]\r
          return [\r
              {\r
                  "number": 101,\r
                  "title": f"[{project}] Improve groupby documentation for beginners",\r
                  "state": "open",\r
                  "created_at": "2026-01-15T09:30:00Z",\r
                  "comments": 4,\r
                  "user": {"login": "dataTeacher"},\r
              },\r
              {\r
                  "number": 102,\r
                  "title": f"[{project}] Fix read_csv encoding edge case",\r
                  "state": "closed",\r
                  "created_at": "2026-01-10T12:00:00Z",\r
                  "comments": 8,\r
                  "user": {"login": "csvMaintainer"},\r
              },\r
              {\r
                  "number": 103,\r
                  "title": f"[{project}] Add examples for datetime parsing",\r
                  "state": "open",\r
                  "created_at": "2026-01-08T15:45:00Z",\r
                  "comments": 2,\r
                  "user": {"login": "timeSeriesFan"},\r
              },\r
              {\r
                  "number": 104,\r
                  "title": f"[{project}] Clarify nullable integer behavior",\r
                  "state": "closed",\r
                  "created_at": "2026-01-06T08:10:00Z",\r
                  "comments": 12,\r
                  "user": {"login": "dtypeReviewer"},\r
              },\r
              {\r
                  "number": 105,\r
                  "title": f"[{project}] Add cookbook section for joins",\r
                  "state": "open",\r
                  "created_at": "2026-01-04T14:20:00Z",\r
                  "comments": 6,\r
                  "user": {"login": "mergeHelper"},\r
              },\r
              {\r
                  "number": 106,\r
                  "title": f"[{project}] Improve error message for missing columns",\r
                  "state": "closed",\r
                  "created_at": "2025-12-30T11:05:00Z",\r
                  "comments": 3,\r
                  "user": {"login": "bugReporter"},\r
              },\r
              {\r
                  "number": 107,\r
                  "title": f"[{project}] Benchmark rolling window examples",\r
                  "state": "open",\r
                  "created_at": "2025-12-28T16:40:00Z",\r
                  "comments": 10,\r
                  "user": {"login": "perfAnalyst"},\r
              },\r
              {\r
                  "number": 108,\r
                  "title": f"[{project}] Update plotting guide screenshots",\r
                  "state": "closed",\r
                  "created_at": "2025-12-24T09:00:00Z",\r
                  "comments": 1,\r
                  "user": {"login": "docsCurator"},\r
              },\r
              {\r
                  "number": 109,\r
                  "title": f"[{project}] Investigate memory spike in concat",\r
                  "state": "open",\r
                  "created_at": "2025-12-20T18:25:00Z",\r
                  "comments": 15,\r
                  "user": {"login": "memoryWatch"},\r
              },\r
              {\r
                  "number": 110,\r
                  "title": f"[{project}] Add beginner exercise for value_counts",\r
                  "state": "closed",\r
                  "created_at": "2025-12-18T07:35:00Z",\r
                  "comments": 5,\r
                  "user": {"login": "courseBuilder"},\r
              },\r
          ]\r
\r
      def fetchIssues(repo, perPage=10):\r
          records = sampleGithubIssues(repo)[:perPage]\r
          return pd.DataFrame(records)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 전체 커리큘럼 완료!\r
  blocks:\r
  - type: text\r
    content: API 응답형 JSON 데이터 파이프라인을 경험했습니다! 구조 파악부터 저장까지 전체 흐름을 익혔습니다.\r
  - type: list\r
    items:\r
    - API 응답 구조 - 리스트/딕셔너리 JSON 형태\r
    - sampleGithubIssues() - 응답 샘플을 재사용 가능한 함수로 준비\r
    - pd.DataFrame(json) - JSON을 DataFrame으로\r
    - pd.to_datetime() - 문자열을 datetime으로\r
    - df['컬럼'].str.len() - 문자열 길이\r
    - pd.json_normalize() - 중첩 JSON 평탄화\r
    - df.to_csv() - CSV 파일로 저장\r
    - 'def 함수(): - 재사용 가능한 함수 정의'\r
  - type: text\r
    content: pandas 전체 과정 완료! 입문(01-02) → 기초(03-05) → 중급(06-08) → 심화(09-10)를 모두 마스터했습니다. 이제 실제 데이터를 다룰\r
      준비가 되었습니다. 공공데이터포털, Kaggle 등에서 데이터를 찾아 분석해보세요!\r
  goal: 정리에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
`;export{e as default};