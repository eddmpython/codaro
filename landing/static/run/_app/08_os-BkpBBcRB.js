var e=`meta:
  id: 08_os
  title: os - 운영체제 인터페이스
  category: builtins
  outcomes: ["builtins.fileSystem"]
  prerequisites: ["python.modulesAndIo"]
  estimatedMinutes: 35
  tags:
  - os
  - 파일
  - 디렉토리
  - 경로
  - 환경변수
  seo:
    title: 파이썬 os 모듈 완전 정복
    description: os 모듈로 파일 시스템 조작, 경로 처리, 환경 변수 관리를 배웁니다.
    keywords:
    - os
    - 파일시스템
    - 경로
    - 디렉토리
    - 환경변수
    - 파이썬파일
intro:
  emoji: 📁
  points:
  - 경로 조작과 확인
  - 디렉토리 탐색과 조작
  - 파일 정보 확인
  - 환경 변수 관리
  direction: os 운영체제 인터페이스에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - os 운영체제 인터페이스 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: os 모듈 불러오기 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 경로 조작 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: 경로 확인 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: os 운영체제 인터페이스 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: os 운영체제 인터페이스 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: os 운영체제 인터페이스 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- id: module_import
  title: os 모듈 불러오기
  structuredPrimary: true
  subtitle: ⚠️ 가장 먼저 실행하세요
  goal: os 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표준 라이브러리는 외부 의존성 없이 파일, 시간, 문자열, 직렬화 같은 업무 코드를 구성하는 기반입니다.
  explanation: |-
    os는 파이썬 표준 라이브러리입니다. 운영체제 인터페이스를 제공하는 모듈입니다. 파일 시스템 조작, 경로 처리, 환경 변수 관리 등 다양한 기능을 제공합니다. 별도 설치 없이 import만으로 사용할 수 있습니다.

    이 섹션을 먼저 실행하면 아래 모든 예제에서 os 모듈을 사용할 수 있습니다.
  snippet: |-
    import os
    import tempfile

    # 정상 로드 확인
    os.name
  exercise:
    prompt: os 모듈 불러오기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: |-
      import os
      import tempfile

      # 정상 로드 확인
      os.name
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: os 모듈 불러오기의 수정 코드가 모듈 함수 호출 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: os 모듈 불러오기 실행 결과가 반환값, stdout, 객체 상태 기준으로 바꾼 입력값을 반영해야 합니다.
- id: path_manipulation
  title: 경로 조작
  structuredPrimary: true
  subtitle: join, dirname, basename, split
  goal: 경로 조작에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    os.path는 경로 문자열을 조작하는 함수들을 제공합니다. join()으로 경로를 결합하고, dirname()과 basename()으로 경로를 분해합니다. 플랫폼에 관계없이 올바른 경로 구분자를 사용하므로 크로스 플랫폼 코드 작성에 필수적입니다.

    os.path.join()은 운영체제에 맞는 경로 구분자(Windows: \\, Unix: /)를 자동으로 사용합니다.
  snippet: |-
    folderPath = os.path.join('home', 'user', 'documents')
    folderPath
  exercise:
    prompt: 경로 조작 예제에서 \`folderPath\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      folderPath = os.path.join('home', 'user', 'documents')
      folderPath
    hints:
    - 바꿀 지점은 \`folderPath = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`folderPath\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 경로 조작에서 \`folderPath\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 경로 조작 실행 뒤 \`folderPath\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: path_checking
  title: 경로 확인
  structuredPrimary: true
  subtitle: exists, isdir, isfile, isabs
  goal: 경로 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    경로의 존재 여부와 타입을 확인하는 함수들입니다. exists()로 존재 확인, isdir()과 isfile()로 타입 확인, isabs()로 절대경로 여부를 판단합니다. 파일 작업 전 반드시 확인하여 에러를 방지합니다.

    Codaro 로컬 커널에서는 현재 작업 디렉터리와 권한이 허용된 로컬 경로를 다룰 수 있습니다. 예제는 안전한 임시 경로 중심으로 진행합니다.
  snippet: |-
    rootExists = os.path.exists('/')
    rootExists
  exercise:
    prompt: 경로 확인 예제에서 \`rootExists\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      rootExists = os.path.exists('/')
      rootExists
    hints:
    - 바꿀 지점은 \`rootExists = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`rootExists\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 경로 확인에서 \`rootExists\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 경로 확인 실행 뒤 \`rootExists\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: directory_operations
  title: 디렉토리 작업
  structuredPrimary: true
  subtitle: listdir, getcwd, mkdir, rmdir
  goal: 디렉토리 작업에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    디렉토리를 탐색하고 조작하는 함수들입니다. listdir()로 내용을 확인하고, getcwd()로 현재 디렉토리를 얻으며, mkdir()과 rmdir()로 디렉토리를 생성하고 삭제합니다. 파일 관리 스크립트의 핵심 기능입니다.

    Codaro 로컬 커널에서 mkdir/rmdir은 실제 로컬 임시 디렉터리에 적용됩니다. 실습용 경로를 먼저 만들고 삭제 대상을 확인한 뒤 실행하세요.
  snippet: |-
    currentDir = os.getcwd()
    currentDir
  exercise:
    prompt: 디렉토리 작업 예제에서 \`currentDir\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      currentDir = os.getcwd()
      currentDir
    hints:
    - 바꿀 지점은 \`currentDir = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`currentDir\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 디렉토리 작업에서 \`currentDir\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 디렉토리 작업 실행 뒤 \`currentDir\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: file_operations
  title: 파일 작업
  structuredPrimary: true
  subtitle: remove, rename, stat
  goal: 파일 작업에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    파일을 관리하는 함수들입니다. remove()로 파일을 삭제하고, rename()으로 이름을 변경하며, stat()으로 파일 정보를 확인합니다. 파일 크기, 수정 시간 등 메타데이터 접근이 가능합니다.

    remove()는 파일만, rmdir()은 빈 디렉토리만 삭제합니다. 디렉토리와 내용을 함께 삭제하려면 shutil.rmtree()를 사용하세요.
  snippet: |-
    testFile = os.path.join(tempfile.gettempdir(), 'codaro_os_sample.txt')
    with open(testFile, 'w') as f:
        f.write('Hello, World!')
    fileSize = os.path.getsize(testFile)
    fileSize
  exercise:
    prompt: 파일 작업 예제에서 \`testFile\`, \`fileSize\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      testFile = os.path.join(tempfile.gettempdir(), 'codaro_os_sample.txt')
      with open(testFile, 'w') as f:
          f.write('Hello, World!')
      fileSize = os.path.getsize(testFile)
      fileSize
    hints:
    - 바꿀 지점은 \`testFile = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`testFile\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 파일 작업에서 \`testFile\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 파일 작업 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: environment
  title: 환경 변수와 시스템 정보
  structuredPrimary: true
  subtitle: environ, getenv, name
  goal: 환경 변수와 시스템 정보에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    시스템 환경 변수와 정보에 접근하는 방법입니다. environ은 모든 환경 변수를 담은 딕셔너리이고, getenv()로 개별 변수를 가져옵니다. os.name으로 운영체제를 확인할 수 있습니다.

    Codaro 로컬 커널에서는 프로세스 환경 변수를 읽고 현재 실행 프로세스 범위에서 수정할 수 있습니다. 영구 설정은 운영체제 환경 변수 설정에서 관리하세요.
  snippet: |-
    systemName = os.name
    systemName
  exercise:
    prompt: 환경 변수와 시스템 정보 예제에서 \`systemName\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      systemName = os.name
      systemName
    hints:
    - 바꿀 지점은 \`systemName = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`systemName\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 환경 변수와 시스템 정보에서 \`systemName\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 환경 변수와 시스템 정보 실행 뒤 \`systemName\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: workflow_validation
  title: '검증 루프: 파일 수집 자동화'
  structuredPrimary: true
  subtitle: 임시 작업공간, 경로 검증, 안전한 파일 집계
  goal: '검증 루프: 파일 수집 자동화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    os 모듈은 실제 파일시스템을 바꾸기 때문에 실습용 임시 작업공간을 먼저 만들고, 경로가 그 안에 있는지 검증해야 합니다. 파일 크기 집계와 경로 traversal 방어까지 확인하면 로컬 자동화 스크립트로 바로 가져갈 수 있습니다.

    변주 실험
    이름 변경을 실제 실행하지 않고 dry-run 목록만 출력하는 모드를 추가하고, 충돌 파일이 있을 때 실행을 중단하는 검증을 붙이세요.
  tips:
  - 변주 실험 이름 변경을 실제 실행하지 않고 dry-run 목록만 출력하는 모드를 추가하고, 충돌 파일이 있을 때 실행을 중단하는 검증을 붙이세요.
  snippet: |-
    workspaceDir = tempfile.mkdtemp(prefix='codaro_os_workflow_')
    inputDir = os.path.join(workspaceDir, 'input')
    os.makedirs(inputDir, exist_ok=True)

    sampleFiles = {
        'sales.csv': 'id,amount\\n1,100\\n2,150\\n',
        'notes.txt': 'daily notes',
        'error.log': 'ERROR failed\\nINFO ok\\n',
    }

    for filename, content in sampleFiles.items():
        with open(os.path.join(inputDir, filename), 'w', encoding='utf-8') as file:
            file.write(content)

    def summarizeFiles(folder):
        summary = {}
        for filename in os.listdir(folder):
            filePath = os.path.join(folder, filename)
            if not os.path.isfile(filePath):
                continue
            extension = os.path.splitext(filename)[1]
            summary[extension] = summary.get(extension, 0) + os.path.getsize(filePath)
        return summary

    fileSummary = summarizeFiles(inputDir)

    assert set(fileSummary) == {'.csv', '.txt', '.log'}
    assert fileSummary['.csv'] > fileSummary['.txt']
    assert sum(fileSummary.values()) == sum(os.path.getsize(os.path.join(inputDir, name)) for name in sampleFiles)

    fileSummary
  exercise:
    prompt: '검증 루프: 파일 수집 자동화 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      workspaceDir = tempfile.mkdtemp(prefix='codaro_os_workflow_')
      inputDir = os.path.join(workspaceDir, 'input')
      os.makedirs(inputDir, exist_ok=True)

      sampleFiles = {
          'sales.csv': 'id,amount\\n1,100\\n2,150\\n',
          'notes.txt': 'daily notes',
          'error.log': 'ERROR failed\\nINFO ok\\n',
      }

      for filename, content in sampleFiles.items():
          with open(os.path.join(inputDir, filename), 'w', encoding='utf-8') as file:
              file.write(content)

      def summarizeFiles(folder):
          summary = {}
          for filename in os.listdir(folder):
              filePath = os.path.join(folder, filename)
              if not os.path.isfile(filePath):
                  continue
              extension = os.path.splitext(filename)[1]
              summary[extension] = summary.get(extension, 0) + os.path.getsize(filePath)
          return summary

      fileSummary = summarizeFiles(inputDir)

      assert set(fileSummary) == {'.csv', '.txt', '.log'}
      assert fileSummary['.csv'] > fileSummary['.txt']
      assert sum(fileSummary.values()) == sum(os.path.getsize(os.path.join(inputDir, name)) for name in sampleFiles)

      fileSummary
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '검증 루프: 파일 수집 자동화의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '검증 루프: 파일 수집 자동화 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: os 모듈 종합 복습
  structuredPrimary: true
  subtitle: 파일 시스템 마스터하기
  goal: os 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: os 모듈의 다양한 함수를 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    userDocsPath = os.path.join('home', 'user', 'documents')
    userDocsPath
  exercise:
    prompt: os 모듈 종합 복습 예제에서 \`userDocsPath\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      userDocsPath = os.path.join('home', 'user', 'documents')
      userDocsPath
    hints:
    - 바꿀 지점은 \`userDocsPath = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`userDocsPath\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: os 모듈 종합 복습에서 \`userDocsPath\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: os 모듈 종합 복습 실행 뒤 \`userDocsPath\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 08_os-extension-sizes-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - directory_operations
    - file_operations
    - workflow_validation
    title: 폴더 안 파일을 확장자별로 요약하기
    subtitle: listdir, isfile, splitext, getsize 검증
    goal: 지정한 폴더의 파일만 읽어 확장자별 총 바이트 크기를 반환한다.
    why: os 파일 자동화는 실제 파일을 바꾸기 전, 대상이 무엇이고 얼마나 있는지 안전하게 요약하는 단계가 먼저입니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 fixture 파일을 만든 뒤 보이지 않던 폴더 경로로 다시 호출합니다.
    tips:
    - os.listdir(folder) 결과에서 디렉터리는 제외하고 파일만 집계하세요.
    - 확장자가 없는 파일은 "<none>" 키로 모을 수 있게 처리하세요.
    exercise:
      prompt: summarize_extension_sizes(folder)가 파일 확장자별 크기 합계를 dict로 반환하도록 완성하세요.
      starterCode: |-
        def summarize_extension_sizes(folder):
            raise NotImplementedError
      solution: |-
        import os

        def summarize_extension_sizes(folder):
            summary = {}
            for filename in sorted(os.listdir(folder)):
                path = os.path.join(folder, filename)
                if not os.path.isfile(path):
                    continue
                extension = os.path.splitext(filename)[1] or "<none>"
                summary[extension] = summary.get(extension, 0) + os.path.getsize(path)
            return dict(sorted(summary.items()))
      hints:
      - os.path.isfile(path)로 폴더를 건너뛰세요.
      - 같은 확장자가 여러 번 나오면 기존 값에 더해야 합니다.
    check:
      id: python.builtins.os.extension-sizes.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.os.safe-files.mastery.behavior.v1.fixture
      fixtureHash: sha256-oqn6cusCzZpicilKBhtcDZiOREh1ssqsNwS+d1ab4r4=
      fixture:
        directories:
        - input
        - workspace/reports
        - workspace/archive
        env:
          CODARO_STAGE: web
          CODARO_REGION: KR
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/sales.csv
          content: id,amount,1,100,2,150
        - path: input/notes.txt
          content: daily notes
        - path: input/error.log
          content: ERROR failed; INFO ok
        stdin: []
      packageAssets: []
      payload:
        entry: summarize_extension_sizes
        cases:
        - id: fixture-input-folder
          arguments:
          - fixturePath: input
          expectedReturn:
            .csv: 21
            .log: 21
            .txt: 11
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 08_os-env-config-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 08_os-extension-sizes-mastery
    title: 실행 환경 설정을 안전하게 읽기
    subtitle: getenv 기본값으로 누락 처리
    goal: 필요한 환경 변수 목록을 읽고 없으면 지정한 기본값을 넣어 반환한다.
    why: 웹과 로컬 자동화는 같은 코드라도 환경값이 다르므로, 누락을 예외가 아니라 명시적인 설정 상태로 다뤄야 합니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. fixture env에서 제공되는 값과 누락된 값을 함께 처리하세요.
    tips:
    - os.getenv(key, default)는 없는 key에 default를 돌려줍니다.
    - 반환 dict에는 요청받은 key를 모두 포함하세요.
    exercise:
      prompt: collect_env_config(keys, default="missing")가 key별 환경값 또는 기본값을 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def collect_env_config(keys, default="missing"):
            raise NotImplementedError
      solution: |-
        import os

        def collect_env_config(keys, default="missing"):
            return {key: os.getenv(key, default) for key in keys}
      hints:
      - os.environ[key]를 직접 쓰면 누락된 값에서 KeyError가 납니다.
      - default 인자가 호출마다 달라질 수 있습니다.
    check:
      id: python.builtins.os.env-config.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.os.safe-files.mastery.behavior.v1.fixture
      fixtureHash: sha256-oqn6cusCzZpicilKBhtcDZiOREh1ssqsNwS+d1ab4r4=
      fixture:
        directories:
        - input
        - workspace/reports
        - workspace/archive
        env:
          CODARO_STAGE: web
          CODARO_REGION: KR
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/sales.csv
          content: id,amount,1,100,2,150
        - path: input/notes.txt
          content: daily notes
        - path: input/error.log
          content: ERROR failed; INFO ok
        stdin: []
      packageAssets: []
      payload:
        entry: collect_env_config
        cases:
        - id: reads-present-and-missing
          arguments:
          - value:
            - CODARO_STAGE
            - CODARO_REGION
            - CODARO_MODE
          expectedReturn:
            CODARO_STAGE: web
            CODARO_REGION: KR
            CODARO_MODE: missing
        - id: custom-default
          arguments:
          - value:
            - CODARO_MODE
          - value: browser
          expectedReturn:
            CODARO_MODE: browser
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 08_os-safe-join-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 08_os-env-config-transfer
    title: 루트 밖으로 나가지 않는 경로 만들기
    subtitle: abspath와 commonpath로 traversal 차단
    goal: root와 path parts를 결합하되 root 밖으로 나가는 경로는 ValueError로 거부한다.
    why: 로컬 자동화로 이어지는 학습에서는 경로 결합보다 먼저 안전 경계 안에 남는지 증명해야 합니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 문자열 join 결과를 신뢰하지 말고 절대경로와 commonpath를 확인하세요.
    tips:
    - os.path.abspath로 root와 candidate를 모두 정규화하세요.
    - os.path.commonpath([root_path, candidate])가 root_path와 같아야 합니다.
    exercise:
      prompt: safe_join_under_root(root, parts)가 path, basename, parent를 담은 dict를 반환하고 root 밖 경로는 ValueError를 일으키도록 완성하세요.
      starterCode: |-
        def safe_join_under_root(root, parts):
            raise NotImplementedError
      solution: |-
        import os

        def safe_join_under_root(root, parts):
            root_path = os.path.abspath(root)
            candidate = os.path.abspath(os.path.join(root_path, *parts))
            if os.path.commonpath([root_path, candidate]) != root_path:
                raise ValueError("path escapes root")
            return {
                "path": candidate,
                "basename": os.path.basename(candidate),
                "parent": os.path.basename(os.path.dirname(candidate)),
            }
      hints:
      - 상위 폴더로 올라가는 parts는 join 이후에 반드시 정규화해 판단하세요.
      - 반환 path는 절대경로여도 verifier가 fixture root 기준 상대경로로 정규화합니다.
    check:
      id: python.builtins.os.safe-join.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.os.safe-files.mastery.behavior.v1.fixture
      fixtureHash: sha256-oqn6cusCzZpicilKBhtcDZiOREh1ssqsNwS+d1ab4r4=
      fixture:
        directories:
        - input
        - workspace/reports
        - workspace/archive
        env:
          CODARO_STAGE: web
          CODARO_REGION: KR
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/sales.csv
          content: id,amount,1,100,2,150
        - path: input/notes.txt
          content: daily notes
        - path: input/error.log
          content: ERROR failed; INFO ok
        stdin: []
      packageAssets: []
      payload:
        entry: safe_join_under_root
        cases:
        - id: nested-report-path
          arguments:
          - fixturePath: workspace
          - value:
            - reports
            - daily.csv
          expectedReturn:
            path: workspace/reports/daily.csv
            basename: daily.csv
            parent: reports
        - id: deeper-archive-path
          arguments:
          - fixturePath: workspace
          - value:
            - archive
            - '2026'
            - summary.txt
          expectedReturn:
            path: workspace/archive/2026/summary.txt
            basename: summary.txt
            parent: '2026'
        - id: rejects-parent-traversal
          arguments:
          - fixturePath: workspace
          - value:
            - ..
            - outside.txt
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths:
        - path
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