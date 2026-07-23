var e=`meta:
  id: 10_sys
  title: sys - 시스템 파라미터
  category: builtins
  tags:
  - sys
  - 시스템
  - 버전
  - 경로
  - 인터프리터
  seo:
    title: 파이썬 sys 모듈 완전 정복
    description: sys 모듈로 시스템 정보, 모듈 경로, 표준 스트림을 배웁니다.
    keywords:
    - sys
    - 시스템
    - 버전정보
    - path
    - argv
    - 파이썬시스템
intro:
  emoji: ⚙️
  points:
  - 파이썬 버전과 플랫폼 정보
  - 모듈 경로 관리
  - 표준 입출력 스트림
  - 런타임 환경 제어
  direction: sys 시스템 파라미터에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - sys 시스템 파라미터 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: sys 모듈 불러오기 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 버전 정보 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: 모듈 경로 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: sys 시스템 파라미터 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: sys 시스템 파라미터 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: sys 시스템 파라미터 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- id: module_import
  title: sys 모듈 불러오기
  structuredPrimary: true
  subtitle: ⚠️ 가장 먼저 실행하세요
  goal: sys 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: |-
    sys는 파이썬 인터프리터와 관련된 시스템 정보를 제공하는 표준 라이브러리입니다. 버전 정보, 모듈 경로, 표준 스트림 등을 다룹니다.

    이 섹션을 먼저 실행하면 아래 모든 예제에서 sys 모듈을 사용할 수 있습니다.
  snippet: |-
    import sys
    import tempfile
  exercise:
    prompt: sys 모듈 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: |-
      import sys
      import tempfile
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: sys 모듈 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: sys 모듈 불러오기 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.
- id: version_info
  title: 버전 정보
  structuredPrimary: true
  subtitle: 파이썬 버전과 플랫폼 확인
  goal: 버전 정보에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    sys 모듈은 현재 실행 중인 파이썬의 버전 정보를 제공합니다. version_info는 major, minor, micro 버전을 튜플로 제공하며, 버전 비교에 활용할 수 있습니다.

    version_info는 튜플이므로 직접 비교 연산이 가능합니다.
  snippet: |-
    pythonVersion = sys.version
    pythonVersion
  exercise:
    prompt: 버전 정보 예제에서 \`pythonVersion\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      pythonVersion = sys.version
      pythonVersion
    hints:
    - 바꿀 지점은 \`pythonVersion = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`pythonVersion\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 버전 정보에서 \`pythonVersion\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 버전 정보 실행 뒤 \`pythonVersion\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: path_management
  title: 모듈 경로
  structuredPrimary: true
  subtitle: 모듈 검색 경로 관리
  goal: 모듈 경로에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    sys.path는 파이썬이 모듈을 검색하는 디렉토리 목록입니다. sys.modules는 현재 로드된 모듈을 딕셔너리 형태로 관리합니다.

    sys.path를 수정하면 동적으로 모듈 검색 경로를 변경할 수 있습니다.
  snippet: |-
    searchPaths = sys.path
    searchPaths
  exercise:
    prompt: 모듈 경로 예제에서 \`searchPaths\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      searchPaths = sys.path
      searchPaths
    hints:
    - 바꿀 지점은 \`searchPaths = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`searchPaths\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 모듈 경로에서 \`searchPaths\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 모듈 경로 실행 뒤 \`searchPaths\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: standard_streams
  title: 표준 스트림
  structuredPrimary: true
  subtitle: 입출력 스트림 관리
  goal: 표준 스트림에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    sys는 표준 입력, 출력, 에러 스트림을 제공합니다. stdin, stdout, stderr를 통해 입출력을 제어할 수 있습니다.

    Codaro 로컬 커널에서는 표준 스트림이 현재 실행 세션의 입출력 채널과 연결됩니다.
  snippet: |-
    stdoutStream = sys.stdout
    stdoutStream
  exercise:
    prompt: 표준 스트림 예제에서 \`stdoutStream\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      stdoutStream = sys.stdout
      stdoutStream
    hints:
    - 바꿀 지점은 \`stdoutStream = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`stdoutStream\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 표준 스트림에서 \`stdoutStream\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 표준 스트림 실행 뒤 \`stdoutStream\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: runtime_info
  title: 런타임 정보
  structuredPrimary: true
  subtitle: 인터프리터 실행 환경
  goal: 런타임 정보에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    sys 모듈은 파이썬 인터프리터의 실행 환경 정보를 제공합니다. 실행 파일 경로, 설치 위치, 재귀 깊이 등을 확인할 수 있습니다.

    setrecursionlimit()로 재귀 깊이를 변경할 수 있지만 신중히 사용하세요.
  snippet: |-
    executablePath = sys.executable
    executablePath
  exercise:
    prompt: 런타임 정보 예제에서 \`executablePath\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      executablePath = sys.executable
      executablePath
    hints:
    - 바꿀 지점은 \`executablePath = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`executablePath\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 런타임 정보에서 \`executablePath\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 런타임 정보 실행 뒤 \`executablePath\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: exit_and_args
  title: 종료와 인자
  structuredPrimary: true
  subtitle: 명령행 인자와 시스템 정보
  goal: 종료와 인자에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    sys.argv는 명령행 인자를 리스트로 제공합니다. implementation은 파이썬 구현 정보를 담고 있습니다.

    CPython, PyPy, Jython 등 다양한 파이썬 구현체를 구분할 수 있습니다.
  snippet: |-
    commandArgs = sys.argv
    commandArgs
  exercise:
    prompt: 종료와 인자 예제에서 \`commandArgs\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      commandArgs = sys.argv
      commandArgs
    hints:
    - 바꿀 지점은 \`commandArgs = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`commandArgs\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 종료와 인자에서 \`commandArgs\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 종료와 인자 실행 뒤 \`commandArgs\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: workflow_validation
  title: '검증 루프: 실행 환경 진단 리포트'
  structuredPrimary: true
  subtitle: 버전 요구사항, 경로 변경 복구, 인자 파싱 검증
  goal: '검증 루프: 실행 환경 진단 리포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    sys는 실행 환경을 직접 다루므로 상태를 바꾼 뒤 반드시 되돌리는 습관이 필요합니다. 여기서는 런타임 요구사항을 검증하고, sys.path 변경을 복구하고, 명령행 인자 파싱 오류를 명시적으로 잡습니다.

    변주 실험
    \`--input\` 외에 \`--limit\` 옵션을 추가하고, 숫자가 아닌 값이 들어오면 \`ValueError\`로 막는 CLI 검증을 확장하세요.
  tips:
  - 변주 실험 \`--input\` 외에 \`--limit\` 옵션을 추가하고, 숫자가 아닌 값이 들어오면 \`ValueError\`로 막는 CLI 검증을 확장하세요.
  snippet: |-
    def buildRuntimeReport():
        return {
            "python": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "implementation": sys.implementation.name,
            "platform": sys.platform,
            "encoding": sys.stdout.encoding,
            "is64Bit": sys.maxsize > 2 ** 32,
            "recursionLimit": sys.getrecursionlimit(),
        }

    runtimeReport = buildRuntimeReport()

    assert sys.version_info >= (3, 12), runtimeReport["python"]
    assert runtimeReport["implementation"] == "cpython"
    assert runtimeReport["is64Bit"] is True
    assert runtimeReport["recursionLimit"] >= 1000

    runtimeReport
  exercise:
    prompt: '검증 루프: 실행 환경 진단 리포트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      def buildRuntimeReport():
          return {
              "python": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
              "implementation": sys.implementation.name,
              "platform": sys.platform,
              "encoding": sys.stdout.encoding,
              "is64Bit": sys.maxsize > 2 ** 32,
              "recursionLimit": sys.getrecursionlimit(),
          }

      runtimeReport = buildRuntimeReport()

      assert sys.version_info >= (3, 12), runtimeReport["python"]
      assert runtimeReport["implementation"] == "cpython"
      assert runtimeReport["is64Bit"] is True
      assert runtimeReport["recursionLimit"] >= 1000

      runtimeReport
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '검증 루프: 실행 환경 진단 리포트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '검증 루프: 실행 환경 진단 리포트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: sys 모듈 종합 복습
  structuredPrimary: true
  subtitle: 시스템 정보 마스터하기
  goal: sys 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: sys 모듈의 다양한 기능을 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    versionPrefix = sys.version[:5]
    versionPrefix
  exercise:
    prompt: sys 모듈 종합 복습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      versionPrefix = sys.version[:5]
      versionPrefix
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: sys 모듈 종합 복습에서 \`versionPrefix\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: sys 모듈 종합 복습 실행 뒤 \`versionPrefix\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 10_sys-argv-parser-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - exit_and_args
    - workflow_validation
    - practice
    title: 명령행 인자에서 입력 파일과 제한값 읽기
    subtitle: sys.argv 구조를 함수 계약으로 검증
    goal: argv 목록에서 --input과 --limit 값을 찾아 dict로 반환하고 누락이나 잘못된 숫자는 거부한다.
    why: sys.argv는 전역 상태지만, 학습자가 함수 인자로 분리해 검증할 수 있어야 웹과 로컬 자동화가 같은 방식으로 안전해집니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 argv 목록으로 다시 호출합니다.
    tips:
    - argv[0]은 스크립트 이름이므로 옵션 검색은 전체 목록에서 key 위치를 찾아도 됩니다.
    - --limit 값은 int로 변환하고 1 이상인지 확인하세요.
    exercise:
      prompt: parse_cli_args(argv)가 input, limit, extraArgs를 담은 dict를 반환하고 잘못된 argv는 ValueError를 일으키도록 완성하세요.
      starterCode: |-
        def parse_cli_args(argv):
            raise NotImplementedError
      solution: |-
        def parse_cli_args(argv):
            if "--input" not in argv or "--limit" not in argv:
                raise ValueError("required options missing")
            input_index = argv.index("--input") + 1
            limit_index = argv.index("--limit") + 1
            if input_index >= len(argv) or limit_index >= len(argv):
                raise ValueError("option value missing")
            limit = int(argv[limit_index])
            if limit <= 0:
                raise ValueError("limit must be positive")
            consumed = {"--input", argv[input_index], "--limit", argv[limit_index]}
            return {
                "input": argv[input_index],
                "limit": limit,
                "extraArgs": [item for item in argv[1:] if item not in consumed],
            }
      hints:
      - index("--input") + 1 위치가 실제 입력 파일입니다.
      - int 변환이나 양수 검증 실패는 ValueError로 막으세요.
    check:
      id: python.builtins.sys.argv-parser.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.sys.argv-parser.mastery.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: parse_cli_args
        cases:
        - id: basic-options
          arguments:
          - value:
            - report.py
            - --input
            - data.csv
            - --limit
            - '25'
          expectedReturn:
            input: data.csv
            limit: 25
            extraArgs: []
        - id: preserves-extra-args
          arguments:
          - value:
            - report.py
            - --verbose
            - --input
            - orders.csv
            - --limit
            - '5'
          expectedReturn:
            input: orders.csv
            limit: 5
            extraArgs:
            - --verbose
        - id: rejects-missing-limit
          arguments:
          - value:
            - report.py
            - --input
            - data.csv
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 10_sys-path-preview-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 10_sys-argv-parser-mastery
    title: sys.path 변경을 미리 보고 복구하기
    subtitle: 전역 상태를 건드린 뒤 원복
    goal: 주어진 경로들을 sys.path 앞에 넣은 preview를 반환하되 함수 종료 전에 원래 sys.path로 복구한다.
    why: sys.path 수정은 강력하지만 전역 상태를 오염시키므로, 추가와 복구를 한 함수 안에서 다루는 습관이 필요합니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 명령행 인자 대신 모듈 검색 경로 상태 관리로 개념을 옮기세요.
    tips:
    - original = list(sys.path)로 복구용 복사본을 먼저 만드세요.
    - finally에서 sys.path[:] = original로 같은 list 객체 내용을 되돌리세요.
    exercise:
      prompt: preview_sys_path_insert(path_entries)가 preview와 restored를 담은 dict를 반환하고 sys.path를 복구하도록 완성하세요.
      starterCode: |-
        def preview_sys_path_insert(path_entries):
            raise NotImplementedError
      solution: |-
        import sys

        def preview_sys_path_insert(path_entries):
            original = list(sys.path)
            try:
                for entry in reversed(path_entries):
                    if entry not in sys.path:
                        sys.path.insert(0, entry)
                preview = sys.path[:len(path_entries)]
            finally:
                sys.path[:] = original
            return {"preview": preview, "restored": sys.path == original}
      hints:
      - reversed(path_entries)를 쓰면 최종 preview 순서가 입력 순서와 같습니다.
      - return 전에 sys.path가 원래 값과 같아야 합니다.
    check:
      id: python.builtins.sys.path-preview.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.sys.path-preview.transfer.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: preview_sys_path_insert
        cases:
        - id: two-paths
          arguments:
          - value:
            - /app/plugins
            - /app/shared
          expectedReturn:
            preview:
            - /app/plugins
            - /app/shared
            restored: true
        - id: one-path
          arguments:
          - value:
            - /tmp/codaro
          expectedReturn:
            preview:
            - /tmp/codaro
            restored: true
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 10_sys-runtime-report-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 10_sys-path-preview-transfer
    title: 런타임 진단 리포트 다시 구성하기
    subtitle: version_info와 argv를 함께 판정
    goal: 현재 Python이 최소 버전을 만족하는지, 구현체 이름과 argv 요약을 dict로 반환한다.
    why: 하루 뒤에도 정확한 버전 문자열보다 "이 환경에서 실행해도 되는가"를 판정하는 코드가 더 중요합니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 현재 sys 값을 직접 읽되, 비교 결과는 안정적인 boolean으로 반환하세요.
    tips:
    - sys.version_info의 major, minor만 최소 버전과 비교하세요.
    - argv가 비어 있으면 scriptName은 빈 문자열로 처리하세요.
    exercise:
      prompt: build_runtime_report(min_major, min_minor, argv)가 meetsMinimum, implementation, scriptName, argumentCount를 반환하도록
        완성하세요.
      starterCode: |-
        def build_runtime_report(min_major, min_minor, argv):
            raise NotImplementedError
      solution: |-
        import sys

        def build_runtime_report(min_major, min_minor, argv):
            current = (sys.version_info.major, sys.version_info.minor)
            return {
                "meetsMinimum": current >= (min_major, min_minor),
                "implementation": sys.implementation.name,
                "scriptName": argv[0] if argv else "",
                "argumentCount": max(0, len(argv) - 1),
            }
      hints:
      - 현재 버전 tuple과 최소 버전 tuple을 직접 비교할 수 있습니다.
      - argv[0]은 실행 파일 또는 스크립트 이름입니다.
    check:
      id: python.builtins.sys.runtime-report.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.sys.runtime-report.retrieval.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: build_runtime_report
        cases:
        - id: current-version-accepted
          arguments:
          - value: 3
          - value: 10
          - value:
            - report.py
            - --input
            - data.csv
          expectedReturn:
            meetsMinimum: true
            implementation: cpython
            scriptName: report.py
            argumentCount: 2
        - id: impossible-version-rejected
          arguments:
          - value: 99
          - value: 0
          - value: []
          expectedReturn:
            meetsMinimum: false
            implementation: cpython
            scriptName: ''
            argumentCount: 0
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