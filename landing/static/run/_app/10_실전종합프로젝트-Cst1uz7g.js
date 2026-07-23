var e=`meta:
  packages:
  - pandas
  id: pandas_10
  title: 실전종합프로젝트
  order: 10
  category: pandas
  difficulty: ⭐⭐⭐⭐⭐
  badge: 심화
  outcomes: ["pandas.report"]
  prerequisites: ["pandas.aggregate","pandas.merge"]
  estimatedMinutes: 90
  tags:
  - 실전
  - API
  - JSON
  - 프로젝트
  - 종합
  - 검증
  - 통합프로젝트
  seo:
    title: pandas 실전 프로젝트 - API 응답 분석부터 저장까지
    description: API 응답 형태의 JSON 데이터를 pandas로 분석하는 전체 과정을 실습합니다. 데이터 구조 이해, 정제, 분석, 저장까지 완전한 파이프라인을 경험합니다.
    keywords:
    - pandas API
    - JSON
    - 응답 데이터
    - 실전 프로젝트
    - 데이터 파이프라인
intro:
  emoji: 🚀
  goal: API 응답 형태의 JSON 데이터를 정제하고 분석하는 전체 과정을 경험합니다.
  description: 지금까지 배운 모든 기술을 총동원합니다. 실제 API 응답과 같은 JSON 구조를 로컬 샘플로 재현하고, 수집 이후의 정제와 분석 워크플로우를 끝까지 익힙니다.
  direction: 실전종합프로젝트에서 표 데이터를 불러오고 정제, 집계, 검증 결과까지 연결합니다.
  benefits:
  - DataFrame 입력 확인 후 정제와 집계에 맞는 코드 입력을 고릅니다.
  - 실전종합프로젝트 결과를 행/열 수와 요약값 기준으로 즉시 점검합니다.
  - 완료한 코드를 데이터 리포트 자동화에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. API 개념 입력 확인
      detail: 입력 기준(DataFrame 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 데이터 확인 처리 실행
      detail: 정제와 집계 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 필요한 컬럼 선택 결과 검증
      detail: 행/열 수와 요약값 기준으로 실행 결과를 비교합니다.
    - label: 실전종합프로젝트 재사용
      detail: 완성 코드를 데이터 리포트 자동화에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표 데이터 환경
      detail: pandas 기준으로 로컬 Python 실행을 준비합니다.
    - label: 실전종합프로젝트 실행
      detail: 셀을 실행해 행/열 수와 요약값와 예외 상태를 확인합니다.
    - label: 실전종합프로젝트 완료
      detail: 검증된 코드를 데이터 리포트 자동화로 남깁니다.
sections:
- id: step1_api_concept
  title: 1단계. API 개념
  structuredPrimary: true
  subtitle: 데이터를 가져오는 방법
  goal: 1단계. API 개념에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    API(Application Programming Interface)는 다른 서비스의 데이터를 가져오는 창구입니다. 이 수업에서는 GitHub Issues API 응답과 같은 리스트/딕셔너리 구조를 로컬 샘플로 만들고 DataFrame으로 변환합니다. 네트워크, 인증, 호출 제한에 흔들리지 않고 JSON 구조 파악, 컬럼 선택, 날짜 변환, 집계, 저장이라는 핵심 pandas 흐름에 집중합니다.

    API 응답은 보통 딕셔너리의 리스트 형태로 들어옵니다. pd.DataFrame()에 이 리스트를 넣으면 각 딕셔너리의 키가 컬럼이 됩니다. 실제 API를 붙일 때도 이 구조를 먼저 이해해야 이후 정제와 분석 코드가 안정적입니다.
  tips:
  - API 응답은 보통 딕셔너리의 리스트 형태로 들어옵니다. pd.DataFrame()에 이 리스트를 넣으면 각 딕셔너리의 키가 컬럼이 됩니다. 실제 API를 붙일 때도 이 구조를
    먼저 이해해야 이후 정제와 분석 코드가 안정적입니다.
  snippet: |-
    import pandas as pd

    def sampleGithubIssues(repo="pandas-dev/pandas"):
        project = repo.split("/")[-1]
        return [
            {
                "number": 101,
                "title": f"[{project}] Improve groupby documentation for beginners",
                "state": "open",
                "created_at": "2026-01-15T09:30:00Z",
                "comments": 4,
                "user": {"login": "dataTeacher"},
            },
            {
                "number": 102,
                "title": f"[{project}] Fix read_csv encoding edge case",
                "state": "closed",
                "created_at": "2026-01-10T12:00:00Z",
                "comments": 8,
                "user": {"login": "csvMaintainer"},
            },
            {
                "number": 103,
                "title": f"[{project}] Add examples for datetime parsing",
                "state": "open",
                "created_at": "2026-01-08T15:45:00Z",
                "comments": 2,
                "user": {"login": "timeSeriesFan"},
            },
            {
                "number": 104,
                "title": f"[{project}] Clarify nullable integer behavior",
                "state": "closed",
                "created_at": "2026-01-06T08:10:00Z",
                "comments": 12,
                "user": {"login": "dtypeReviewer"},
            },
            {
                "number": 105,
                "title": f"[{project}] Add cookbook section for joins",
                "state": "open",
                "created_at": "2026-01-04T14:20:00Z",
                "comments": 6,
                "user": {"login": "mergeHelper"},
            },
            {
                "number": 106,
                "title": f"[{project}] Improve error message for missing columns",
                "state": "closed",
                "created_at": "2025-12-30T11:05:00Z",
                "comments": 3,
                "user": {"login": "bugReporter"},
            },
            {
                "number": 107,
                "title": f"[{project}] Benchmark rolling window examples",
                "state": "open",
                "created_at": "2025-12-28T16:40:00Z",
                "comments": 10,
                "user": {"login": "perfAnalyst"},
            },
            {
                "number": 108,
                "title": f"[{project}] Update plotting guide screenshots",
                "state": "closed",
                "created_at": "2025-12-24T09:00:00Z",
                "comments": 1,
                "user": {"login": "docsCurator"},
            },
            {
                "number": 109,
                "title": f"[{project}] Investigate memory spike in concat",
                "state": "open",
                "created_at": "2025-12-20T18:25:00Z",
                "comments": 15,
                "user": {"login": "memoryWatch"},
            },
            {
                "number": 110,
                "title": f"[{project}] Add beginner exercise for value_counts",
                "state": "closed",
                "created_at": "2025-12-18T07:35:00Z",
                "comments": 5,
                "user": {"login": "courseBuilder"},
            },
        ]

    issueRecords = sampleGithubIssues()
    issues = pd.DataFrame(issueRecords)
    issues.shape
  exercise:
    prompt: 1단계. API 개념 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import pandas as pd

      def sampleGithubIssues(repo="pandas-dev/pandas"):
          project = repo.split("/")[-1]
          return [
              {
                  "number": 101,
                  "title": f"[{project}] Improve groupby documentation for beginners",
                  "state": "open",
                  "created_at": "2026-01-15T09:30:00Z",
                  "comments": 4,
                  "user": {"login": "dataTeacher"},
              },
              {
                  "number": 102,
                  "title": f"[{project}] Fix read_csv encoding edge case",
                  "state": "closed",
                  "created_at": "2026-01-10T12:00:00Z",
                  "comments": 8,
                  "user": {"login": "csvMaintainer"},
              },
              {
                  "number": 103,
                  "title": f"[{project}] Add examples for datetime parsing",
                  "state": "open",
                  "created_at": "2026-01-08T15:45:00Z",
                  "comments": 2,
                  "user": {"login": "timeSeriesFan"},
              },
              {
                  "number": 104,
                  "title": f"[{project}] Clarify nullable integer behavior",
                  "state": "closed",
                  "created_at": "2026-01-06T08:10:00Z",
                  "comments": 12,
                  "user": {"login": "dtypeReviewer"},
              },
              {
                  "number": 105,
                  "title": f"[{project}] Add cookbook section for joins",
                  "state": "open",
                  "created_at": "2026-01-04T14:20:00Z",
                  "comments": 6,
                  "user": {"login": "mergeHelper"},
              },
              {
                  "number": 106,
                  "title": f"[{project}] Improve error message for missing columns",
                  "state": "closed",
                  "created_at": "2025-12-30T11:05:00Z",
                  "comments": 3,
                  "user": {"login": "bugReporter"},
              },
              {
                  "number": 107,
                  "title": f"[{project}] Benchmark rolling window examples",
                  "state": "open",
                  "created_at": "2025-12-28T16:40:00Z",
                  "comments": 10,
                  "user": {"login": "perfAnalyst"},
              },
              {
                  "number": 108,
                  "title": f"[{project}] Update plotting guide screenshots",
                  "state": "closed",
                  "created_at": "2025-12-24T09:00:00Z",
                  "comments": 1,
                  "user": {"login": "docsCurator"},
              },
              {
                  "number": 109,
                  "title": f"[{project}] Investigate memory spike in concat",
                  "state": "open",
                  "created_at": "2025-12-20T18:25:00Z",
                  "comments": 15,
                  "user": {"login": "memoryWatch"},
              },
              {
                  "number": 110,
                  "title": f"[{project}] Add beginner exercise for value_counts",
                  "state": "closed",
                  "created_at": "2025-12-18T07:35:00Z",
                  "comments": 5,
                  "user": {"login": "courseBuilder"},
              },
          ]

      issueRecords = sampleGithubIssues()
      issues = pd.DataFrame(issueRecords)
      issues.shape
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. API 개념의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 1단계. API 개념 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: step2_preview
  title: 2단계. 데이터 확인
  structuredPrimary: true
  subtitle: 컬럼 목록 확인
  goal: 2단계. 데이터 확인에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: API 응답 데이터는 컬럼이 매우 많습니다. GitHub Issues API의 경우 30개 이상의 컬럼이 반환됩니다. 모든 컬럼을 사용하면 복잡하고 분석에
    불필요한 정보가 많으므로, 목적에 맞는 컬럼만 선택하는 것이 중요합니다. columns.tolist()로 전체 컬럼 목록을 확인합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: issues.columns.tolist()[:10]
  exercise:
    prompt: 2단계. 데이터 확인 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: issues.columns.tolist()[:10]
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 2단계. 데이터 확인의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 2단계. 데이터 확인 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step3_select
  title: 3단계. 필요한 컬럼 선택
  structuredPrimary: true
  subtitle: 분석할 데이터만 추출
  goal: 3단계. 필요한 컬럼 선택에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 분석 목적에 맞는 컬럼만 선택합니다. number(이슈 번호), title(제목), state(상태), created_at(생성일), comments(댓글
    수) 5가지를 선택합니다. copy()를 붙여서 원본과 분리된 새 DataFrame을 만듭니다. 이렇게 필요한 데이터만 추출하면 메모리를 절약하고 분석이 명확해집니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    clean = issues[['number', 'title', 'state', 'created_at', 'comments']].copy()
    clean.head()
  exercise:
    prompt: 3단계. 필요한 컬럼 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      clean = issues[['number', 'title', 'state', 'created_at', 'comments']].copy()
      clean.head()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 3단계. 필요한 컬럼 선택의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 3단계. 필요한 컬럼 선택의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step4_datetime
  title: 4단계. 날짜 타입 변환
  structuredPrimary: true
  subtitle: pd.to_datetime()
  goal: 4단계. 날짜 타입 변환에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: API에서 받은 날짜는 '2024-01-15T09:30:00Z' 같은 ISO 8601 형식의 문자열입니다. pd.to_datetime()으로 datetime
    타입으로 변환해야 날짜 계산, 기간 필터링, 시계열 분석이 가능합니다. datetime 타입이어야 .dt 접근자로 연도, 월, 요일 등을 추출할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    dated = clean.copy()
    dated['created_at'] = pd.to_datetime(dated['created_at'])
    dated.dtypes
  exercise:
    prompt: 4단계. 날짜 타입 변환 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      dated = clean.copy()
      dated['created_at'] = pd.to_datetime(dated['created_at'])
      dated.dtypes
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 4단계. 날짜 타입 변환의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 4단계. 날짜 타입 변환의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step5_new_column
  title: 5단계. 새 컬럼 추가
  structuredPrimary: true
  subtitle: 제목 길이 계산
  goal: 5단계. 새 컬럼 추가에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 5단계. 새 컬럼 추가의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.
  tips:
  - str.len()은 문자열 길이를 반환합니다. Series에 .str을 붙이면 각 행에 문자열 메서드를 적용할 수 있습니다. str.upper(), str.lower(), str.contains()
    등 다양한 문자열 처리 메서드를 사용할 수 있습니다.
  snippet: |-
    final = dated.copy()
    final['titleLength'] = final['title'].str.len()
    final[['title', 'titleLength']].head()
  exercise:
    prompt: 5단계. 새 컬럼 추가 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      final = dated.copy()
      final['titleLength'] = final['title'].str.len()
      final[['title', 'titleLength']].head()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 5단계. 새 컬럼 추가의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 5단계. 새 컬럼 추가의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step6_describe
  title: 6단계. 기본 통계
  structuredPrimary: true
  subtitle: describe()로 분포 확인
  goal: 6단계. 기본 통계에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 댓글 수와 제목 길이의 분포를 확인합니다. describe()로 평균, 표준편차, 최소/최대값 등을 한눈에 파악합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: final[['comments', 'titleLength']].describe()
  exercise:
    prompt: 6단계. 기본 통계 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: final[['comments', 'titleLength']].describe()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 6단계. 기본 통계의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 6단계. 기본 통계 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step7_value_counts
  title: 7단계. 상태별 개수
  structuredPrimary: true
  subtitle: open vs closed
  goal: 7단계. 상태별 개수에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 열린 이슈와 닫힌 이슈의 비율을 확인합니다. value_counts()로 범주형 데이터의 분포를 파악합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: final['state'].value_counts()
  exercise:
    prompt: 7단계. 상태별 개수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: final['state'].value_counts()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 7단계. 상태별 개수의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 7단계. 상태별 개수 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step8_top_comments
  title: 8단계. 댓글 많은 이슈
  structuredPrimary: true
  subtitle: nlargest 활용
  goal: 8단계. 댓글 많은 이슈에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 댓글이 가장 많은 이슈 5개를 확인합니다. nlargest로 TOP N을 빠르게 찾습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: final.nlargest(5, 'comments')[['number', 'title', 'comments']]
  exercise:
    prompt: 8단계. 댓글 많은 이슈 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: final.nlargest(5, 'comments')[['number', 'title', 'comments']]
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 8단계. 댓글 많은 이슈의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 8단계. 댓글 많은 이슈 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step9_corr
  title: 9단계. 상관관계 분석
  structuredPrimary: true
  subtitle: 제목 길이 vs 댓글 수
  goal: 9단계. 상관관계 분석에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 9단계. 상관관계 분석의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: final[['titleLength', 'comments']].corr()
  exercise:
    prompt: 9단계. 상관관계 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: final[['titleLength', 'comments']].corr()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 9단계. 상관관계 분석의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 9단계. 상관관계 분석 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step10_groupby
  title: 10단계. 상태별 평균
  structuredPrimary: true
  subtitle: groupby 활용
  goal: 10단계. 상태별 평균에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: open 이슈와 closed 이슈의 평균 댓글 수를 비교합니다. groupby로 그룹별 통계를 계산합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: final.groupby('state')['comments'].mean()
  exercise:
    prompt: 10단계. 상태별 평균 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: final.groupby('state')['comments'].mean()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 10단계. 상태별 평균의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 10단계. 상태별 평균 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step11_json_normalize
  title: 11단계. 중첩 JSON 펼치기
  structuredPrimary: true
  subtitle: json_normalize()
  goal: 11단계. 중첩 JSON 펼치기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    API 응답에는 중첩된 구조가 많습니다. {'user': {'login': 'name'}} 같은 형태를 user.login처럼 펼쳐서 접근하기 쉽게 만듭니다. json_normalize()가 자동으로 평탄화합니다.

    pd.json_normalize()는 중첩된 JSON 구조를 평탄화합니다. max_level로 펼칠 깊이를 조절합니다. user.login처럼 점(.)으로 경로를 표시합니다. 복잡한 API 응답을 DataFrame으로 변환할 때 유용합니다.
  tips:
  - pd.json_normalize()는 중첩된 JSON 구조를 평탄화합니다. max_level로 펼칠 깊이를 조절합니다. user.login처럼 점(.)으로 경로를 표시합니다.
    복잡한 API 응답을 DataFrame으로 변환할 때 유용합니다.
  snippet: |-
    flat = pd.json_normalize(issueRecords, max_level=1)
    flat[['number', 'user.login']].head()
  exercise:
    prompt: 11단계. 중첩 JSON 펼치기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      flat = pd.json_normalize(issueRecords, max_level=1)
      flat[['number', 'user.login']].head()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 11단계. 중첩 JSON 펼치기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 11단계. 중첩 JSON 펼치기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step12_save
  title: 12단계. CSV 저장
  structuredPrimary: true
  subtitle: to_csv()
  goal: 12단계. CSV 저장에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    분석 결과를 파일로 저장합니다. encoding='utf-8-sig'는 엑셀에서 한글이 깨지지 않게 하는 BOM(Byte Order Mark)을 추가합니다. index=False로 불필요한 인덱스 컬럼을 제외합니다.

    to_csv()는 DataFrame을 CSV 파일로 저장합니다. index=False로 인덱스를 제외하고, encoding='utf-8-sig'는 한글이 깨지지 않도록 BOM을 추가합니다. sep 파라미터로 구분자를 변경할 수 있습니다(기본값은 쉼표).
  tips:
  - to_csv()는 DataFrame을 CSV 파일로 저장합니다. index=False로 인덱스를 제외하고, encoding='utf-8-sig'는 한글이 깨지지 않도록 BOM을
    추가합니다. sep 파라미터로 구분자를 변경할 수 있습니다(기본값은 쉼표).
  snippet: final.to_csv('github_issues.csv', index=False, encoding='utf-8-sig')
  exercise:
    prompt: 12단계. CSV 저장 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: final.to_csv('github_issues.csv', index=False, encoding='utf-8-sig')
    hints:
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 12단계. CSV 저장의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 12단계. CSV 저장의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step13_function
  title: 13단계. 재사용 함수 만들기
  structuredPrimary: true
  subtitle: 파이프라인 자동화
  goal: 13단계. 재사용 함수 만들기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 지금까지 한 과정을 함수로 정리하면 같은 응답 구조를 쓰는 다른 리포지토리 샘플에도 쉽게 적용할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def fetchGithubIssues(repo, perPage=10):
        records = sampleGithubIssues(repo)[:perPage]
        return pd.DataFrame(records)

    fetchGithubIssues('numpy/numpy', 5)
  exercise:
    prompt: 13단계. 재사용 함수 만들기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      def fetchGithubIssues(repo, perPage=10):
          records = sampleGithubIssues(repo)[:perPage]
          return pd.DataFrame(records)

      fetchGithubIssues('numpy/numpy', 5)
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 13단계. 재사용 함수 만들기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 13단계. 재사용 함수 만들기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 이슈 응답을 운영 리포트로 변환'
  structuredPrimary: true
  subtitle: JSON 정규화, 날짜 변환, groupby, 실패 케이스
  goal: '현업 흐름 검증: 이슈 응답을 운영 리포트로 변환에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    실전 프로젝트는 API 호출 자체보다 응답 구조를 안정적으로 표로 바꾸고 검증하는 과정이 중요합니다. 샘플 JSON을 DataFrame으로 변환하고, 상태별 집계와 날짜 파생 컬럼을 확인하세요.

    변주 실험
    labels를 explode해서 라벨별 이슈 수 리포트를 만들고, 라벨이 없는 이슈를 어떤 그룹으로 처리할지 정책을 정하세요.
  tips:
  - 변주 실험 labels를 explode해서 라벨별 이슈 수 리포트를 만들고, 라벨이 없는 이슈를 어떤 그룹으로 처리할지 정책을 정하세요.
  snippet: |-
    import pandas as pd

    records = [
        {"number": 1, "state": "open", "created_at": "2026-05-01", "labels": ["bug"]},
        {"number": 2, "state": "closed", "created_at": "2026-05-03", "labels": ["docs", "good first issue"]},
        {"number": 3, "state": "open", "created_at": "2026-05-04", "labels": []},
    ]

    issues = pd.DataFrame(records)
    issues["created_at"] = pd.to_datetime(issues["created_at"])
    issues["labelCount"] = issues["labels"].apply(len)
    stateReport = issues.groupby("state", as_index=False).agg(
        issueCount=("number", "size"),
        avgLabels=("labelCount", "mean"),
    )

    assert issues["created_at"].dt.month.tolist() == [5, 5, 5]
    assert stateReport.set_index("state").loc["open", "issueCount"] == 2
    assert stateReport["issueCount"].sum() == len(issues)
  exercise:
    prompt: '현업 흐름 검증: 이슈 응답을 운영 리포트로 변환 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.'
    starterCode: |-
      import pandas as pd

      records = [
          {"number": 1, "state": "open", "created_at": "2026-05-01", "labels": ["bug"]},
          {"number": 2, "state": "closed", "created_at": "2026-05-03", "labels": ["docs", "good first issue"]},
          {"number": 3, "state": "open", "created_at": "2026-05-04", "labels": []},
      ]

      issues = pd.DataFrame(records)
      issues["created_at"] = pd.to_datetime(issues["created_at"])
      issues["labelCount"] = issues["labels"].apply(len)
      stateReport = issues.groupby("state", as_index=False).agg(
          issueCount=("number", "size"),
          avgLabels=("labelCount", "mean"),
      )

      assert issues["created_at"].dt.month.tolist() == [5, 5, 5]
      assert stateReport.set_index("state").loc["open", "issueCount"] == 2
      assert stateReport["issueCount"].sum() == len(issues)
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 이슈 응답을 운영 리포트로 변환의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.'
    resultCheck: '현업 흐름 검증: 이슈 응답을 운영 리포트로 변환의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.'
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 실전 분석 프로젝트
  goal: 실습에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    다른 리포지토리로 분석해보세요.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import pandas as pd

    def sampleGithubIssues(repo="pandas-dev/pandas"):
        project = repo.split("/")[-1]
        return [
            {
                "number": 101,
                "title": f"[{project}] Improve groupby documentation for beginners",
                "state": "open",
                "created_at": "2026-01-15T09:30:00Z",
                "comments": 4,
                "user": {"login": "dataTeacher"},
            },
            {
                "number": 102,
                "title": f"[{project}] Fix read_csv encoding edge case",
                "state": "closed",
                "created_at": "2026-01-10T12:00:00Z",
                "comments": 8,
                "user": {"login": "csvMaintainer"},
            },
            {
                "number": 103,
                "title": f"[{project}] Add examples for datetime parsing",
                "state": "open",
                "created_at": "2026-01-08T15:45:00Z",
                "comments": 2,
                "user": {"login": "timeSeriesFan"},
            },
            {
                "number": 104,
                "title": f"[{project}] Clarify nullable integer behavior",
                "state": "closed",
                "created_at": "2026-01-06T08:10:00Z",
                "comments": 12,
                "user": {"login": "dtypeReviewer"},
            },
            {
                "number": 105,
                "title": f"[{project}] Add cookbook section for joins",
                "state": "open",
                "created_at": "2026-01-04T14:20:00Z",
                "comments": 6,
                "user": {"login": "mergeHelper"},
            },
            {
                "number": 106,
                "title": f"[{project}] Improve error message for missing columns",
                "state": "closed",
                "created_at": "2025-12-30T11:05:00Z",
                "comments": 3,
                "user": {"login": "bugReporter"},
            },
            {
                "number": 107,
                "title": f"[{project}] Benchmark rolling window examples",
                "state": "open",
                "created_at": "2025-12-28T16:40:00Z",
                "comments": 10,
                "user": {"login": "perfAnalyst"},
            },
            {
                "number": 108,
                "title": f"[{project}] Update plotting guide screenshots",
                "state": "closed",
                "created_at": "2025-12-24T09:00:00Z",
                "comments": 1,
                "user": {"login": "docsCurator"},
            },
            {
                "number": 109,
                "title": f"[{project}] Investigate memory spike in concat",
                "state": "open",
                "created_at": "2025-12-20T18:25:00Z",
                "comments": 15,
                "user": {"login": "memoryWatch"},
            },
            {
                "number": 110,
                "title": f"[{project}] Add beginner exercise for value_counts",
                "state": "closed",
                "created_at": "2025-12-18T07:35:00Z",
                "comments": 5,
                "user": {"login": "courseBuilder"},
            },
        ]

    def fetchIssues(repo, perPage=10):
        records = sampleGithubIssues(repo)[:perPage]
        return pd.DataFrame(records)
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import pandas as pd

      def sampleGithubIssues(repo="pandas-dev/pandas"):
          project = repo.split("/")[-1]
          return [
              {
                  "number": 101,
                  "title": f"[{project}] Improve groupby documentation for beginners",
                  "state": "open",
                  "created_at": "2026-01-15T09:30:00Z",
                  "comments": 4,
                  "user": {"login": "dataTeacher"},
              },
              {
                  "number": 102,
                  "title": f"[{project}] Fix read_csv encoding edge case",
                  "state": "closed",
                  "created_at": "2026-01-10T12:00:00Z",
                  "comments": 8,
                  "user": {"login": "csvMaintainer"},
              },
              {
                  "number": 103,
                  "title": f"[{project}] Add examples for datetime parsing",
                  "state": "open",
                  "created_at": "2026-01-08T15:45:00Z",
                  "comments": 2,
                  "user": {"login": "timeSeriesFan"},
              },
              {
                  "number": 104,
                  "title": f"[{project}] Clarify nullable integer behavior",
                  "state": "closed",
                  "created_at": "2026-01-06T08:10:00Z",
                  "comments": 12,
                  "user": {"login": "dtypeReviewer"},
              },
              {
                  "number": 105,
                  "title": f"[{project}] Add cookbook section for joins",
                  "state": "open",
                  "created_at": "2026-01-04T14:20:00Z",
                  "comments": 6,
                  "user": {"login": "mergeHelper"},
              },
              {
                  "number": 106,
                  "title": f"[{project}] Improve error message for missing columns",
                  "state": "closed",
                  "created_at": "2025-12-30T11:05:00Z",
                  "comments": 3,
                  "user": {"login": "bugReporter"},
              },
              {
                  "number": 107,
                  "title": f"[{project}] Benchmark rolling window examples",
                  "state": "open",
                  "created_at": "2025-12-28T16:40:00Z",
                  "comments": 10,
                  "user": {"login": "perfAnalyst"},
              },
              {
                  "number": 108,
                  "title": f"[{project}] Update plotting guide screenshots",
                  "state": "closed",
                  "created_at": "2025-12-24T09:00:00Z",
                  "comments": 1,
                  "user": {"login": "docsCurator"},
              },
              {
                  "number": 109,
                  "title": f"[{project}] Investigate memory spike in concat",
                  "state": "open",
                  "created_at": "2025-12-20T18:25:00Z",
                  "comments": 15,
                  "user": {"login": "memoryWatch"},
              },
              {
                  "number": 110,
                  "title": f"[{project}] Add beginner exercise for value_counts",
                  "state": "closed",
                  "created_at": "2025-12-18T07:35:00Z",
                  "comments": 5,
                  "user": {"login": "courseBuilder"},
              },
          ]

      def fetchIssues(repo, perPage=10):
          records = sampleGithubIssues(repo)[:perPage]
          return pd.DataFrame(records)
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 실습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: summary
  title: 정리
  subtitle: 전체 커리큘럼 완료!
  blocks:
  - type: text
    content: API 응답형 JSON 데이터 파이프라인을 경험했습니다! 구조 파악부터 저장까지 전체 흐름을 익혔습니다.
  - type: list
    items:
    - API 응답 구조 - 리스트/딕셔너리 JSON 형태
    - sampleGithubIssues() - 응답 샘플을 재사용 가능한 함수로 준비
    - pd.DataFrame(json) - JSON을 DataFrame으로
    - pd.to_datetime() - 문자열을 datetime으로
    - df['컬럼'].str.len() - 문자열 길이
    - pd.json_normalize() - 중첩 JSON 평탄화
    - df.to_csv() - CSV 파일로 저장
    - 'def 함수(): - 재사용 가능한 함수 정의'
  - type: text
    content: pandas 전체 과정 완료! 입문(01-02) → 기초(03-05) → 중급(06-08) → 심화(09-10)를 모두 마스터했습니다. 이제 실제 데이터를 다룰
      준비가 되었습니다. 공공데이터포털, Kaggle 등에서 데이터를 찾아 분석해보세요!
  goal: 정리에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
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
  - id: pandas_10-analysis-report-pipeline-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_api_concept
    - summary
    title: 판매 레코드를 정제·집계해 보고서 계약 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 유효 행과 거절 행을 분리하고 카테고리 합계와 최고 카테고리를 하나의 결과로 만든다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 반환 집계와 별개로 각 sourceIndex의 채택 상태와 거절 이유를 CSV에 보존하세요.
    - 빈 입력도 header가 있는 empty-report.csv를 남겨 무산출과 0건 결과를 구분하세요.
    exercise:
      prompt: build_sales_report(rows, output_path)를 완성해 acceptedCount, rejectedIndexes, totals, leader를 반환하세요. output_path에는
        sourceIndex, status, category, amount, reason 열로 모든 입력 행의 채택·거절 근거를 CSV로 저장하세요.
      starterCode: |-
        def build_sales_report(rows, output_path=None):
            raise NotImplementedError
      solution: |
        import csv
        from pathlib import Path


        def build_sales_report(rows, output_path=None):
            totals = {}
            rejected = []
            accepted = 0
            artifact_rows = []
            for index, row in enumerate(rows):
                if not row.get("category") or not isinstance(row.get("amount"), (int, float)) or isinstance(row.get("amount"), bool) or row["amount"] < 0:
                    rejected.append(index)
                    artifact_rows.append({
                        "sourceIndex": index,
                        "status": "rejected",
                        "category": row.get("category"),
                        "amount": row.get("amount"),
                        "reason": "category-or-nonnegative-amount",
                    })
                    continue
                accepted += 1
                totals[row["category"]] = totals.get(row["category"], 0) + row["amount"]
                artifact_rows.append({
                    "sourceIndex": index,
                    "status": "accepted",
                    "category": row["category"],
                    "amount": row["amount"],
                    "reason": "",
                })
            ordered = {key: totals[key] for key in sorted(totals)}
            leader = max(totals, key=lambda key: (totals[key], key)) if totals else None
            result = {"acceptedCount": accepted, "rejectedIndexes": rejected, "totals": ordered, "leader": leader}
            output_path = Path(output_path or ("output/sales-report.csv" if ordered else "output/empty-report.csv"))
            output_path.parent.mkdir(parents=True, exist_ok=True)
            columns = ["sourceIndex", "status", "category", "amount", "reason"]
            with output_path.open("w", encoding="utf-8", newline="") as stream:
                writer = csv.DictWriter(stream, fieldnames=columns)
                writer.writeheader()
                writer.writerows(artifact_rows)
            return result
      hints: *id001
    check:
      id: python.pandas.pandas_10.analysis-report-pipeline.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pandas.pandas_10.analysis-report-pipeline.mastery.behavior.v1.fixture
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
        entry: build_sales_report
        cases:
        - id: builds-auditable-report
          arguments:
          - value:
            - category: book
              amount: 10
            - category: music
              amount: 20
            - category: book
              amount: 5
            - category: ''
              amount: 8
            - category: music
              amount: bad
          - value: output/sales-report.csv
          expectedReturn:
            acceptedCount: 3
            rejectedIndexes:
            - 3
            - 4
            totals:
              book: 15
              music: 20
            leader: music
        - id: reports-no-valid-rows
          arguments:
          - value: []
          - value: output/empty-report.csv
          expectedReturn:
            acceptedCount: 0
            rejectedIndexes: []
            totals: {}
            leader: null
        expectedPaths:
        - path: output/sales-report.csv
          kind: table
          origin: created
          format: csv
          columns:
          - sourceIndex
          - status
          - category
          - amount
          - reason
        - path: output/empty-report.csv
          kind: table
          origin: created
          format: csv
          columns:
          - sourceIndex
          - status
          - category
          - amount
          - reason
        normalizeReturnPaths: []
  transferVariants:
  - id: pandas_10-configurable-group-report-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pandas_10-analysis-report-pipeline-mastery
    title: 새 비용 데이터에 재사용 가능한 그룹 보고서 적용하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 판매 전용 파이프라인을 그룹 열·값 열·최소값이 다른 보고서로 전이한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 업무 열 이름을 함수 안에 하드코딩하지 마세요.
    - 제외 건수를 별도로 계산해 필터 조건의 영향을 드러내세요.
    exercise:
      prompt: group_report(rows, group_key, value_key, minimum)를 완성해 groups, includedCount, excludedCount를 반환하세요.
      starterCode: |-
        def group_report(rows, group_key, value_key, minimum):
            raise NotImplementedError
      solution: |
        def group_report(rows, group_key, value_key, minimum):
            groups = {}
            included = 0
            for row in rows:
                value = row.get(value_key)
                if not isinstance(value, (int, float)) or isinstance(value, bool) or value < minimum:
                    continue
                included += 1
                groups[str(row[group_key])] = groups.get(str(row[group_key]), 0) + value
            return {
                "groups": {key: groups[key] for key in sorted(groups)},
                "includedCount": included,
                "excludedCount": len(rows) - included,
            }
      hints: *id002
    check:
      id: python.pandas.pandas_10.configurable-group-report.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pandas.pandas_10.configurable-group-report.transfer.behavior.v1.fixture
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
        entry: group_report
        cases:
        - id: reuses-report-contract
          arguments:
          - value:
            - team: A
              cost: 5
            - team: A
              cost: 20
            - team: B
              cost: 30
            - team: B
              cost: null
          - value: team
          - value: cost
          - value: 10
          expectedReturn:
            groups:
              A: 20
              B: 30
            includedCount: 2
            excludedCount: 2
        - id: handles-empty-report
          arguments:
          - value: []
          - value: team
          - value: cost
          - value: 0
          expectedReturn:
            groups: {}
            includedCount: 0
            excludedCount: 0
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pandas_10-report-evidence-contract-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pandas_10-configurable-group-report-transfer
    title: 재현 가능한 분석 보고서의 필수 증거 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 단계별로 필요한 입력, 변환, 결과 증거와 누락 위험을 선택한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 보고서는 최종 숫자만이 아니라 입력과 변환 근거를 함께 보존해야 합니다.
    - 파일을 썼다는 사실보다 다시 읽어 계약을 검증한 증거가 강합니다.
    exercise:
      prompt: choose_report_evidence(stage)를 완성해 evidence, check, risk를 반환하세요.
      starterCode: |-
        def choose_report_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_report_evidence(stage):
            table = {
                "input": {"evidence": "schema and row count", "check": "required columns and types", "risk": "silent source drift"},
                "transform": {"evidence": "rule and rejected rows", "check": "before and after counts", "risk": "hidden data loss"},
                "aggregate": {"evidence": "group key and metric", "check": "recomputed totals", "risk": "wrong denominator"},
                "export": {"evidence": "artifact hash and schema", "check": "read-back validation", "risk": "corrupt report"},
            }
            if stage not in table:
                raise ValueError("unknown report stage")
            return table[stage]
      hints: *id003
    check:
      id: python.pandas.pandas_10.report-evidence-contract.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pandas.pandas_10.report-evidence-contract.retrieval.behavior.v1.fixture
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
        entry: choose_report_evidence
        cases:
        - id: recalls-transform-evidence
          arguments:
          - value: transform
          expectedReturn:
            evidence: rule and rejected rows
            check: before and after counts
            risk: hidden data loss
        - id: recalls-export-readback
          arguments:
          - value: export
          expectedReturn:
            evidence: artifact hash and schema
            check: read-back validation
            risk: corrupt report
        - id: rejects-decoration-stage
          arguments:
          - value: make-pretty
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};