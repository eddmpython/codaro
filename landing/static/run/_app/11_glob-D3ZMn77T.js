var e=`meta:
  id: 11_glob
  title: glob - 파일 패턴 매칭
  category: builtins
  tags:
  - glob
  - 패턴
  - 와일드카드
  - 파일검색
  seo:
    title: 파이썬 glob 모듈 완전 정복
    description: glob 모듈로 와일드카드 패턴 매칭과 파일 검색을 배웁니다.
    keywords:
    - glob
    - 패턴매칭
    - 와일드카드
    - 파일검색
    - 파이썬glob
intro:
  emoji: 🔎
  points:
  - 와일드카드 패턴 매칭
  - 재귀적 파일 검색
  - 확장자별 필터링
  - 메모리 효율적 탐색
  direction: glob 파일 패턴 매칭에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - glob 파일 패턴 매칭 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: glob 모듈 불러오기 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 기본 패턴 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: 재귀 검색 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: glob 파일 패턴 매칭 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: glob 파일 패턴 매칭 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: glob 파일 패턴 매칭 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- id: module_import
  title: glob 모듈 불러오기
  structuredPrimary: true
  subtitle: ⚠️ 가장 먼저 실행하세요
  goal: glob 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: glob 모듈 불러오기의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.
  tips:
  - 이 섹션을 먼저 실행하면 아래 모든 예제에서 glob 모듈을 사용할 수 있습니다.
  snippet: |-
    import glob
    import os
    import tempfile
  exercise:
    prompt: glob 모듈 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: |-
      import glob
      import os
      import tempfile
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: glob 모듈 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: glob 모듈 불러오기 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.
- id: basic_patterns
  title: 기본 패턴
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 기본 패턴에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 파일 패턴은 실제 검색 결과를 즉시 확인해야 빠진 파일이나 과도하게 잡힌 파일을 줄일 수 있습니다.
  explanation: 기본 패턴의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.
  tips:
  - Codaro 로컬 커널에서는 현재 작업 디렉터리와 지정한 로컬 경로를 검색합니다. 패턴에 맞는 파일이 없으면 빈 리스트가 반환됩니다.
  snippet: |-
    patternPy = '*.py'
    resultFiles = glob.glob(patternPy)
    resultFiles
  exercise:
    prompt: 기본 패턴 예제에서 확장자 패턴을 바꾸고 glob 결과 파일 목록이 달라지는지 확인하세요.
    starterCode: |-
      patternPy = '*.py'
      resultFiles = glob.glob(patternPy)
      resultFiles
    hints:
    - 바꿀 지점은 \`patternPy\`의 와일드카드와 확장자입니다.
    - 실행 뒤 \`resultFiles\`가 바꾼 파일 패턴에 맞는 경로만 담는지 보세요.
  check:
    type: noError
    noError: 기본 패턴의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 기본 패턴의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: recursive_search
  title: 재귀 검색
  structuredPrimary: true
  subtitle: 하위 디렉토리까지 검색
  goal: 재귀 검색에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 재귀 파일 검색은 범위를 잘못 잡으면 너무 많은 파일을 읽기 때문에 검색 결과를 즉시 확인해야 합니다.
  explanation: |-
    **/ 패턴과 recursive=True 옵션을 사용하면 현재 디렉토리뿐만 아니라 모든 하위 디렉토리까지 검색할 수 있습니다. 대규모 프로젝트에서 특정 확장자 파일을 모두 찾을 때 유용합니다.

    재귀 검색은 파일이 많을 경우 시간이 걸릴 수 있습니다. 가능하면 검색 범위를 제한하세요.
  snippet: |-
    recursivePattern = '**/*.py'
    allPyFiles = glob.glob(recursivePattern, recursive=True)
    allPyFiles
  exercise:
    prompt: 재귀 검색 예제에서 \`**/*.py\` 패턴의 확장자나 하위 경로를 바꾸고 검색 결과가 달라지는지 확인하세요.
    starterCode: |-
      recursivePattern = '**/*.py'
      allPyFiles = glob.glob(recursivePattern, recursive=True)
      allPyFiles
    hints:
    - 바꿀 지점은 \`recursivePattern\`의 \`**/\`, 폴더명, 확장자입니다.
    - 실행 뒤 \`allPyFiles\`가 재귀 옵션과 바꾼 패턴을 반영하는지 보세요.
  check:
    type: noError
    noError: 재귀 검색의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 재귀 검색의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: iglob
  title: 이터레이터 버전
  structuredPrimary: true
  subtitle: 메모리 효율적인 검색
  goal: 이터레이터 버전에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 대량 파일 검색에서는 목록을 한 번에 만들지 않고 이터레이터로 소비해야 메모리 사용을 예측할 수 있습니다.
  explanation: |-
    glob.iglob()는 glob.glob()의 이터레이터 버전입니다. 파일 목록을 한 번에 메모리에 로드하지 않고 순차적으로 처리할 수 있어 메모리 효율적입니다. 대량의 파일을 다룰 때 유용합니다.

    이터레이터는 한 번만 순회할 수 있습니다. 다시 사용하려면 새로 생성해야 합니다.
  snippet: |-
    logPattern = '*.log'
    logIterator = glob.iglob(logPattern)
    logIterator
  exercise:
    prompt: 이터레이터 버전 예제에서 검색 패턴을 바꾸고 iglob 객체를 리스트로 소비했을 때 결과가 달라지는지 확인하세요.
    starterCode: |-
      logPattern = '*.log'
      logIterator = glob.iglob(logPattern)
      logIterator
    hints:
    - 바꿀 지점은 \`logPattern\`의 확장자와 와일드카드입니다.
    - 실행 뒤 이터레이터를 소비한 결과가 바꾼 파일 패턴을 반영하는지 보세요.
  check:
    type: noError
    noError: 이터레이터 버전의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 이터레이터 버전의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: advanced_patterns
  title: 고급 패턴
  structuredPrimary: true
  subtitle: 문자 범위와 복합 패턴
  goal: 고급 패턴에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 문자 범위와 와일드카드가 섞인 파일 패턴은 의도한 명명 규칙만 잡는지 바로 확인해야 합니다.
  explanation: |-
    문자 범위([a-z], [0-9])와 복합 패턴을 사용하여 더 정교한 파일 검색이 가능합니다. 특정 명명 규칙을 따르는 파일을 찾거나 정규식처럼 패턴을 조합할 수 있습니다.

    복잡한 패턴은 정규식보다 간단하지만 제한적입니다. 복잡한 검색은 re 모듈과 결합하세요.
  snippet: |-
    lowerPattern = '[a-z]*.txt'
    lowerFiles = glob.glob(lowerPattern)
    lowerFiles
  exercise:
    prompt: 고급 패턴 예제에서 문자 범위나 확장자를 바꾸고 파일 검색 결과가 달라지는지 확인하세요.
    starterCode: |-
      lowerPattern = '[a-z]*.txt'
      lowerFiles = glob.glob(lowerPattern)
      lowerFiles
    hints:
    - 바꿀 지점은 \`[a-z]\`, \`*\`, \`.txt\` 같은 glob 패턴 조각입니다.
    - 실행 뒤 \`lowerFiles\`가 바꾼 파일명 규칙에 맞는 경로만 담는지 보세요.
  check:
    type: noError
    noError: 고급 패턴의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 고급 패턴의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: practical_use
  title: 실전 활용
  structuredPrimary: true
  subtitle: 실무 파일 검색 패턴
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    glob를 실전에서 활용하는 방법을 살펴봅니다. 여러 확장자 동시 검색, 파일 개수 확인, 최신 파일 찾기 등 실무에서 자주 사용하는 패턴을 학습합니다.

    os.path, pathlib과 함께 사용하면 강력한 파일 관리 도구가 됩니다.
  snippet: |-
    extensions = ['*.py', '*.yaml']
    multiFiles = [f for ext in extensions for f in glob.glob(ext)]
    multiFiles
  exercise:
    prompt: 실전 활용 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      extensions = ['*.py', '*.yaml']
      multiFiles = [f for ext in extensions for f in glob.glob(ext)]
      multiFiles
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실전 활용의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 실전 활용 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '검증 루프: 파일 패턴 수집 리포트'
  structuredPrimary: true
  subtitle: 임시 작업공간, 재귀 검색, 패턴 누락 검증
  goal: '검증 루프: 파일 패턴 수집 리포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    glob 검색은 현재 디렉터리 상태에 영향을 받기 쉽습니다. 실습용 임시 작업공간을 만들고 기대 파일을 고정하면, 패턴이 정확히 무엇을 포함하고 제외하는지 검증할 수 있습니다.

    변주 실험
    \`**/*.log\` 검색에 \`recursive=True\`를 반드시 넘기도록 \`safeGlob\`을 확장하고, 하위 로그 파일 2개가 잡히는지 확인하세요.
  tips:
  - 변주 실험 \`**/*.log\` 검색에 \`recursive=True\`를 반드시 넘기도록 \`safeGlob\`을 확장하고, 하위 로그 파일 2개가 잡히는지 확인하세요.
  snippet: |-
    globRoot = tempfile.mkdtemp(prefix='codaro_glob_workflow_')
    dataDir = os.path.join(globRoot, 'data')
    logsDir = os.path.join(globRoot, 'logs', '2026')
    os.makedirs(dataDir, exist_ok=True)
    os.makedirs(logsDir, exist_ok=True)

    samplePaths = [
        os.path.join(dataDir, 'sales_01.csv'),
        os.path.join(dataDir, 'sales_02.csv'),
        os.path.join(dataDir, 'customers.csv'),
        os.path.join(logsDir, 'app_20260524.log'),
        os.path.join(logsDir, 'app_20260525.log'),
        os.path.join(globRoot, 'README.md'),
    ]

    for path in samplePaths:
        with open(path, 'w', encoding='utf-8') as file:
            file.write(os.path.basename(path))

    csvFiles = sorted(glob.glob(os.path.join(dataDir, '*.csv')))
    logFiles = sorted(glob.glob(os.path.join(globRoot, '**', '*.log'), recursive=True))

    assert [os.path.basename(path) for path in csvFiles] == ['customers.csv', 'sales_01.csv', 'sales_02.csv']
    assert [os.path.basename(path) for path in logFiles] == ['app_20260524.log', 'app_20260525.log']

    {"csv": csvFiles, "logs": logFiles}
  exercise:
    prompt: '검증 루프: 파일 패턴 수집 리포트 예제에서 기대 문자열이나 실제 출력 문구를 바꾸고 assert 비교가 맞는지 확인하세요.'
    starterCode: |-
      globRoot = tempfile.mkdtemp(prefix='codaro_glob_workflow_')
      dataDir = os.path.join(globRoot, 'data')
      logsDir = os.path.join(globRoot, 'logs', '2026')
      os.makedirs(dataDir, exist_ok=True)
      os.makedirs(logsDir, exist_ok=True)

      samplePaths = [
          os.path.join(dataDir, 'sales_01.csv'),
          os.path.join(dataDir, 'sales_02.csv'),
          os.path.join(dataDir, 'customers.csv'),
          os.path.join(logsDir, 'app_20260524.log'),
          os.path.join(logsDir, 'app_20260525.log'),
          os.path.join(globRoot, 'README.md'),
      ]

      for path in samplePaths:
          with open(path, 'w', encoding='utf-8') as file:
              file.write(os.path.basename(path))

      csvFiles = sorted(glob.glob(os.path.join(dataDir, '*.csv')))
      logFiles = sorted(glob.glob(os.path.join(globRoot, '**', '*.log'), recursive=True))

      assert [os.path.basename(path) for path in csvFiles] == ['customers.csv', 'sales_01.csv', 'sales_02.csv']
      assert [os.path.basename(path) for path in logFiles] == ['app_20260524.log', 'app_20260525.log']

      {"csv": csvFiles, "logs": logFiles}
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: '검증 루프: 파일 패턴 수집 리포트의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.'
    resultCheck: '검증 루프: 파일 패턴 수집 리포트 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.'
- id: practice
  title: glob 모듈 종합 복습
  structuredPrimary: true
  subtitle: 파일 패턴 매칭 마스터하기
  goal: glob 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 마지막 표현식 결과를 이해하면 노트북에서 작은 값을 빠르게 확인할 수 있습니다.
  explanation: glob 모듈의 다양한 기능을 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: '''*.html'''
  exercise:
    prompt: glob 모듈 종합 복습 예제에서 마지막 표현식 값을 바꾸고 셀 결과가 새 값으로 표시되는지 확인하세요.
    starterCode: '''*.html'''
    hints:
    - 바꿀 지점은 셀 마지막 줄의 문자열, 숫자, 계산식입니다.
    - 실행 뒤 출력 영역의 마지막 값이 직접 입력한 표현식 결과와 맞는지 보세요.
  check:
    type: noError
    noError: glob 모듈 종합 복습의 마지막 표현식이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: glob 모듈 종합 복습 실행 결과에 직접 바꾼 마지막 표현식 값이 표시되어야 합니다.
assessment:
  masteryVariants:
  - id: 11_glob-basic-names-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - basic_patterns
    - practical_use
    - workflow_validation
    title: 패턴에 맞는 파일명만 고르기
    subtitle: glob 결과를 basename 목록으로 정리
    goal: 지정 폴더와 glob pattern에서 파일만 찾아 정렬된 파일명 목록을 반환한다.
    why: glob 결과를 그대로 보여주면 절대경로와 실행 위치에 묶이므로, 학습자는 먼저 의도한 파일명만 확인할 수 있어야 합니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 fixture 파일을 만든 뒤 보이지 않던 폴더와 pattern으로 다시 호출합니다.
    tips:
    - glob.glob(os.path.join(root, pattern))으로 검색하세요.
    - os.path.isfile(path)로 파일만 남기고 os.path.basename(path)를 반환하세요.
    exercise:
      prompt: match_file_names(root, pattern)가 pattern에 맞는 파일명 목록을 정렬해서 반환하도록 완성하세요.
      starterCode: |-
        def match_file_names(root, pattern):
            raise NotImplementedError
      solution: |-
        import glob
        import os

        def match_file_names(root, pattern):
            matches = glob.glob(os.path.join(root, pattern))
            return sorted(os.path.basename(path) for path in matches if os.path.isfile(path))
      hints:
      - glob 결과에는 경로가 포함되므로 basename으로 정리하세요.
      - 폴더가 pattern에 걸려도 파일만 남겨야 합니다.
    check:
      id: python.builtins.glob.basic-names.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.glob.pattern-report.mastery.behavior.v1.fixture
      fixtureHash: sha256-wnvGWmI/42+y9uLpGf0R+WwjwkSV0m69vEdaaVi/IOo=
      fixture:
        directories:
        - data/archive
        - logs/2026
        - notes
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: data/sales_01.csv
          content: sales01
        - path: data/sales_02.csv
          content: sales02
        - path: data/customers.csv
          content: customers
        - path: data/archive/sales_00.csv
          content: old
        - path: logs/2026/app_20260524.log
          content: log24
        - path: logs/2026/app_20260525.log
          content: log25
        - path: README.md
          content: readme
        - path: notes/todo.txt
          content: todo
        stdin: []
      packageAssets: []
      payload:
        entry: match_file_names
        cases:
        - id: csv-files
          arguments:
          - fixturePath: data
          - value: '*.csv'
          expectedReturn:
          - customers.csv
          - sales_01.csv
          - sales_02.csv
        - id: numbered-sales
          arguments:
          - fixturePath: data
          - value: sales_??.csv
          expectedReturn:
          - sales_01.csv
          - sales_02.csv
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 11_glob-recursive-relative-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 11_glob-basic-names-mastery
    title: 재귀 검색 결과를 상대경로로 반환하기
    subtitle: recursive=True와 relpath 조합
    goal: root 아래에서 recursive pattern에 맞는 파일을 찾아 POSIX 상대경로 목록으로 반환한다.
    why: 재귀 검색은 범위가 넓어지므로 어떤 하위 폴더가 잡혔는지 상대경로로 확인해야 과다 매칭을 빨리 잡을 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 단일 폴더 검색이 아니라 하위 폴더까지 포함하세요.
    tips:
    - glob.glob(full_pattern, recursive=True)를 사용하세요.
    - os.path.relpath 결과의 구분자는 /로 바꿔 반환하세요.
    exercise:
      prompt: recursive_relative_matches(root, pattern)가 recursive glob 결과를 root 기준 POSIX 상대경로 목록으로 반환하도록 완성하세요.
      starterCode: |-
        def recursive_relative_matches(root, pattern):
            raise NotImplementedError
      solution: |-
        import glob
        import os

        def recursive_relative_matches(root, pattern):
            base = os.path.abspath(root)
            full_pattern = os.path.join(base, pattern)
            matches = []
            for path in glob.glob(full_pattern, recursive=True):
                if os.path.isfile(path):
                    matches.append(os.path.relpath(path, base).replace(os.sep, "/"))
            return sorted(matches)
      hints:
      - pattern에 **가 들어가도 recursive=True가 없으면 하위 폴더가 잡히지 않습니다.
      - 절대경로 대신 root 기준 상대경로를 반환하세요.
    check:
      id: python.builtins.glob.recursive-relative.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.glob.pattern-report.mastery.behavior.v1.fixture
      fixtureHash: sha256-wnvGWmI/42+y9uLpGf0R+WwjwkSV0m69vEdaaVi/IOo=
      fixture:
        directories:
        - data/archive
        - logs/2026
        - notes
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: data/sales_01.csv
          content: sales01
        - path: data/sales_02.csv
          content: sales02
        - path: data/customers.csv
          content: customers
        - path: data/archive/sales_00.csv
          content: old
        - path: logs/2026/app_20260524.log
          content: log24
        - path: logs/2026/app_20260525.log
          content: log25
        - path: README.md
          content: readme
        - path: notes/todo.txt
          content: todo
        stdin: []
      packageAssets: []
      payload:
        entry: recursive_relative_matches
        cases:
        - id: recursive-logs
          arguments:
          - fixturePath: .
          - value: '**/*.log'
          expectedReturn:
          - logs/2026/app_20260524.log
          - logs/2026/app_20260525.log
        - id: recursive-csv
          arguments:
          - fixturePath: .
          - value: data/**/*.csv
          expectedReturn:
          - data/archive/sales_00.csv
          - data/customers.csv
          - data/sales_01.csv
          - data/sales_02.csv
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 11_glob-pattern-limit-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 11_glob-recursive-relative-transfer
    title: 여러 패턴을 제한된 목록으로 수집하기
    subtitle: iglob 결과를 중복 없이 제한
    goal: 여러 glob pattern을 순서대로 검색해 중복을 제거하고 limit개까지만 상대경로로 반환한다.
    why: 시간이 지난 뒤에도 glob 학습의 핵심은 많이 찾는 것이 아니라, 너무 많이 찾지 않도록 범위와 limit을 함께 제어하는 것입니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. iglob, dedup, limit 제어를 예시 없이 다시 조립하세요.
    tips:
    - limit이 0 이하이면 ValueError를 일으키세요.
    - 같은 파일이 여러 pattern에 걸려도 한 번만 반환하세요.
    exercise:
      prompt: collect_limited_matches(root, patterns, limit)가 count, matches, truncated를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def collect_limited_matches(root, patterns, limit):
            raise NotImplementedError
      solution: |-
        import glob
        import os

        def collect_limited_matches(root, patterns, limit):
            if limit <= 0:
                raise ValueError("limit must be positive")
            base = os.path.abspath(root)
            seen = set()
            matches = []
            for pattern in patterns:
                full_pattern = os.path.join(base, pattern)
                for path in sorted(glob.iglob(full_pattern, recursive=True)):
                    if not os.path.isfile(path):
                        continue
                    relative = os.path.relpath(path, base).replace(os.sep, "/")
                    if relative in seen:
                        continue
                    seen.add(relative)
                    matches.append(relative)
                    if len(matches) >= limit:
                        return {"count": len(matches), "matches": matches, "truncated": True}
            return {"count": len(matches), "matches": matches, "truncated": False}
      hints:
      - glob.iglob은 이터레이터라 필요한 만큼 소비하는 흐름을 만들 수 있습니다.
      - truncated는 limit 때문에 중간에 멈췄을 때만 True입니다.
    check:
      id: python.builtins.glob.pattern-limit.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.glob.pattern-report.mastery.behavior.v1.fixture
      fixtureHash: sha256-wnvGWmI/42+y9uLpGf0R+WwjwkSV0m69vEdaaVi/IOo=
      fixture:
        directories:
        - data/archive
        - logs/2026
        - notes
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: data/sales_01.csv
          content: sales01
        - path: data/sales_02.csv
          content: sales02
        - path: data/customers.csv
          content: customers
        - path: data/archive/sales_00.csv
          content: old
        - path: logs/2026/app_20260524.log
          content: log24
        - path: logs/2026/app_20260525.log
          content: log25
        - path: README.md
          content: readme
        - path: notes/todo.txt
          content: todo
        stdin: []
      packageAssets: []
      payload:
        entry: collect_limited_matches
        cases:
        - id: truncates-after-four
          arguments:
          - fixturePath: .
          - value:
            - data/*.csv
            - logs/**/*.log
          - value: 4
          expectedReturn:
            count: 4
            matches:
            - data/customers.csv
            - data/sales_01.csv
            - data/sales_02.csv
            - logs/2026/app_20260524.log
            truncated: true
        - id: all-small-patterns
          arguments:
          - fixturePath: .
          - value:
            - README.*
            - notes/*.txt
          - value: 10
          expectedReturn:
            count: 2
            matches:
            - README.md
            - notes/todo.txt
            truncated: false
        - id: rejects-zero-limit
          arguments:
          - fixturePath: .
          - value:
            - '*.md'
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  schemaVersion: 1
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 행동과 데이터 계약을 검증하고, 외부 package·파일 artifact가 필요한 실행은 lesson Run 및 Local
    evidence로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-existing-assessment
    solutionVerification: required
    independentReview: pending
`;export{e as default};