var e=`meta:\r
  id: 09_pathlib\r
  title: pathlib - 객체지향 경로\r
  category: builtins\r
  tags:\r
  - pathlib\r
  - Path\r
  - 경로\r
  - 파일\r
  - 객체지향\r
  seo:\r
    title: 파이썬 pathlib 모듈 완전 정복\r
    description: pathlib Path 객체로 객체지향 경로 처리를 배웁니다.\r
    keywords:\r
    - pathlib\r
    - Path\r
    - 경로처리\r
    - 파일\r
    - 디렉토리\r
    - 파이썬경로\r
intro:\r
  emoji: 🗂️\r
  points:\r
  - Path 객체 생성과 조작\r
  - 경로 탐색과 검색\r
  - 파일 읽기/쓰기\r
  - 객체지향 경로 처리\r
  direction: pathlib 객체지향 경로에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - pathlib 객체지향 경로 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: pathlib 모듈 불러오기 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: Path 객체 기초 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 경로 조작 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: pathlib 객체지향 경로 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: pathlib 객체지향 경로 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: pathlib 객체지향 경로 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: pathlib 모듈 불러오기\r
  structuredPrimary: true\r
  subtitle: ⚠️ 가장 먼저 실행하세요\r
  goal: pathlib 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    pathlib는 파이썬의 객체지향 경로 처리 라이브러리입니다. Path 클래스를 통해 os.path보다 직관적인 API를 제공합니다. 별도 설치 없이 import만으로 사용할 수 있습니다.\r
\r
    이 섹션을 먼저 실행하면 아래 모든 예제에서 Path 클래스를 사용할 수 있습니다.\r
  snippet: |-\r
    import tempfile\r
    from pathlib import Path\r
\r
    currentPath = Path('.')\r
    currentPath\r
  exercise:\r
    prompt: pathlib 모듈 불러오기 예제에서 \`currentPath\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import tempfile\r
      from pathlib import Path\r
\r
      currentPath = Path('.')\r
      currentPath\r
    hints:\r
    - 바꿀 지점은 \`currentPath = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`currentPath\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: pathlib 모듈 불러오기에서 \`currentPath\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: pathlib 모듈 불러오기 실행 뒤 \`currentPath\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: path_basics\r
  title: Path 객체 기초\r
  structuredPrimary: true\r
  subtitle: 경로 생성과 변환\r
  goal: Path 객체 기초에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Path 객체는 경로를 문자열이 아닌 객체로 다룹니다. 절대 경로 변환, 경로 구성요소 분리, 파일명과 확장자 추출 등 다양한 속성과 메서드를 제공합니다.\r
\r
    parts는 경로를 튜플로 분리하며, parent는 바로 위 디렉토리, parents는 모든 상위 디렉토리를 반환합니다.\r
  snippet: |-\r
    absolutePath = Path('.').resolve()\r
    absolutePath\r
  exercise:\r
    prompt: Path 객체 기초 예제에서 \`absolutePath\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      absolutePath = Path('.').resolve()\r
      absolutePath\r
    hints:\r
    - 바꿀 지점은 \`absolutePath = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`absolutePath\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: Path 객체 기초에서 \`absolutePath\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: Path 객체 기초 실행 뒤 \`absolutePath\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: path_operations\r
  title: 경로 조작\r
  structuredPrimary: true\r
  subtitle: 경로 결합과 변경\r
  goal: 경로 조작에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Path 객체는 / 연산자로 경로를 결합하고, with_name()과 with_suffix()로 파일명과 확장자를 변경할 수 있습니다. relative_to()로 상대 경로를 계산합니다.\r
\r
    / 연산자와 joinpath()는 동일한 결과를 반환합니다. with_name()과 with_suffix()는 원본을 변경하지 않고 새 Path 객체를 반환합니다.\r
  snippet: |-\r
    basePath = Path('/home/user')\r
    newPath = basePath / 'documents' / 'file.txt'\r
    newPath\r
  exercise:\r
    prompt: 경로 조작 예제에서 \`basePath\`, \`newPath\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      basePath = Path('/home/user')\r
      newPath = basePath / 'documents' / 'file.txt'\r
      newPath\r
    hints:\r
    - 바꿀 지점은 \`basePath = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`basePath\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 경로 조작에서 \`basePath\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 경로 조작 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: path_checking\r
  title: 경로 확인\r
  structuredPrimary: true\r
  subtitle: 파일과 디렉토리 검증\r
  goal: 경로 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Path 객체는 경로의 존재 여부, 타입(파일/디렉토리), 절대 경로 여부 등을 확인하는 메서드를 제공합니다. 모든 메서드는 True/False를 반환합니다.\r
\r
    Codaro 로컬 커널에서는 로컬 파일시스템 경로를 다룹니다. Windows에서 절대 경로는 C:\\로 시작하고, Unix에서는 /로 시작합니다.\r
  snippet: |-\r
    checkPath = Path('.')\r
    checkPath.exists()\r
  exercise:\r
    prompt: 경로 확인 예제에서 \`checkPath\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      checkPath = Path('.')\r
      checkPath.exists()\r
    hints:\r
    - 바꿀 지점은 \`checkPath = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`checkPath\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 경로 확인에서 \`checkPath\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 경로 확인 실행 뒤 \`checkPath\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: directory_navigation\r
  title: 디렉토리 탐색\r
  structuredPrimary: true\r
  subtitle: 파일 검색과 필터링\r
  goal: 디렉토리 탐색에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    Path 객체는 디렉토리의 내용을 나열하고, 패턴에 맞는 파일을 검색하는 강력한 기능을 제공합니다. iterdir()은 현재 디렉토리를, glob()과 rglob()은 패턴 매칭 검색을 수행합니다.\r
\r
    glob()은 현재 디렉토리만 검색하고, rglob()은 **/ 패턴을 자동으로 적용하여 모든 하위 디렉토리를 검색합니다.\r
  snippet: |-\r
    currentDir = Path('.')\r
    [item.name for item in currentDir.iterdir()][:10]\r
  exercise:\r
    prompt: 디렉토리 탐색 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      currentDir = Path('.')\r
      [item.name for item in currentDir.iterdir()][:10]\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 디렉토리 탐색의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 디렉토리 탐색 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: file_operations\r
  title: 파일 읽기/쓰기\r
  structuredPrimary: true\r
  subtitle: 간편한 파일 처리\r
  goal: 파일 읽기/쓰기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Path 객체는 read_text(), write_text()로 텍스트 파일을, read_bytes(), write_bytes()로 바이너리 파일을 간단히 처리합니다. 파일을 자동으로 열고 닫아 안전합니다.\r
\r
    Codaro 로컬 커널에서는 지정한 로컬 경로에 저장됩니다. write_text()와 write_bytes()는 기존 파일을 덮어쓰므로 실습용 경로에서 실행하세요.\r
  snippet: |-\r
    pathlibScratch = Path(tempfile.gettempdir()) / 'codaro_pathlib_scratch'\r
    pathlibScratch.mkdir(parents=True, exist_ok=True)\r
    textFile = pathlibScratch / 'sample.txt'\r
    textFile.write_text('Hello from pathlib!')\r
    textFile.read_text()\r
  exercise:\r
    prompt: 파일 읽기/쓰기 예제에서 \`pathlibScratch\`, \`textFile\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      pathlibScratch = Path(tempfile.gettempdir()) / 'codaro_pathlib_scratch'\r
      pathlibScratch.mkdir(parents=True, exist_ok=True)\r
      textFile = pathlibScratch / 'sample.txt'\r
      textFile.write_text('Hello from pathlib!')\r
      textFile.read_text()\r
    hints:\r
    - 바꿀 지점은 \`pathlibScratch = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`pathlibScratch\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 파일 읽기/쓰기에서 \`pathlibScratch\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 파일 읽기/쓰기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: Path 기반 파일 파이프라인'\r
  structuredPrimary: true\r
  subtitle: 작업공간 격리, 파일 매니페스트, 경로 traversal 검증\r
  goal: '검증 루프: Path 기반 파일 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    pathlib는 경로를 객체로 다루기 때문에 파일 파이프라인을 읽기 쉽게 만들 수 있습니다. 임시 작업공간에 데이터를 만들고, 매니페스트를 검증하고, 사용자 입력 경로가 작업공간 밖으로 나가지 않는지 확인합니다.\r
\r
    변주 실험\r
    출력 파일명을 날짜별 하위 폴더로 바꾸고, \`relative_to()\` 결과가 여전히 \`pipelineRoot\` 아래에 있는지 검증하세요.\r
  tips:\r
  - 변주 실험 출력 파일명을 날짜별 하위 폴더로 바꾸고, \`relative_to()\` 결과가 여전히 \`pipelineRoot\` 아래에 있는지 검증하세요.\r
  snippet: |-\r
    pipelineRoot = Path(tempfile.mkdtemp(prefix='codaro_pathlib_workflow_'))\r
    inputPath = pipelineRoot / 'input'\r
    inputPath.mkdir(parents=True, exist_ok=True)\r
\r
    (inputPath / 'sales.csv').write_text('id,amount\\n1,100\\n2,150\\n', encoding='utf-8')\r
    (inputPath / 'README.md').write_text('# dataset\\n', encoding='utf-8')\r
    (inputPath / 'errors.log').write_text('ERROR timeout\\nINFO recovered\\n', encoding='utf-8')\r
\r
    def buildFileManifest(folder):\r
        return [\r
            {\r
                "name": path.name,\r
                "suffix": path.suffix,\r
                "size": path.stat().st_size,\r
            }\r
            for path in sorted(folder.iterdir())\r
            if path.is_file()\r
        ]\r
\r
    manifest = buildFileManifest(inputPath)\r
\r
    assert sorted(item["name"] for item in manifest) == ["README.md", "errors.log", "sales.csv"]\r
    assert sum(item["size"] for item in manifest) == sum(path.stat().st_size for path in inputPath.iterdir())\r
\r
    manifest\r
  exercise:\r
    prompt: '검증 루프: Path 기반 파일 파이프라인 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      pipelineRoot = Path(tempfile.mkdtemp(prefix='codaro_pathlib_workflow_'))\r
      inputPath = pipelineRoot / 'input'\r
      inputPath.mkdir(parents=True, exist_ok=True)\r
\r
      (inputPath / 'sales.csv').write_text('id,amount\\n1,100\\n2,150\\n', encoding='utf-8')\r
      (inputPath / 'README.md').write_text('# dataset\\n', encoding='utf-8')\r
      (inputPath / 'errors.log').write_text('ERROR timeout\\nINFO recovered\\n', encoding='utf-8')\r
\r
      def buildFileManifest(folder):\r
          return [\r
              {\r
                  "name": path.name,\r
                  "suffix": path.suffix,\r
                  "size": path.stat().st_size,\r
              }\r
              for path in sorted(folder.iterdir())\r
              if path.is_file()\r
          ]\r
\r
      manifest = buildFileManifest(inputPath)\r
\r
      assert sorted(item["name"] for item in manifest) == ["README.md", "errors.log", "sales.csv"]\r
      assert sum(item["size"] for item in manifest) == sum(path.stat().st_size for path in inputPath.iterdir())\r
\r
      manifest\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: Path 기반 파일 파이프라인의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: Path 기반 파일 파이프라인 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: pathlib 모듈 종합 복습\r
  structuredPrimary: true\r
  subtitle: Path 객체 마스터하기\r
  goal: pathlib 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: pathlib 모듈의 다양한 기능을 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    currentWorkingDir = Path('.')\r
    currentWorkingDir\r
  exercise:\r
    prompt: pathlib 모듈 종합 복습 예제에서 \`currentWorkingDir\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      currentWorkingDir = Path('.')\r
      currentWorkingDir\r
    hints:\r
    - 바꿀 지점은 \`currentWorkingDir = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`currentWorkingDir\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:
    type: noError
    noError: pathlib 모듈 종합 복습에서 \`currentWorkingDir\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: pathlib 모듈 종합 복습 실행 뒤 \`currentWorkingDir\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 09_pathlib-file-manifest-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - directory_navigation
    - file_operations
    - workflow_validation
    title: Path로 파일 매니페스트 만들기
    subtitle: iterdir와 stat 결과를 구조화
    goal: 지정 폴더의 파일만 골라 이름, suffix, size를 담은 manifest 목록을 반환한다.
    why: pathlib 학습은 경로 객체를 예쁘게 쓰는 데서 끝나지 않고, 파일 파이프라인의 입력 원장을 만들 수 있어야 의미가 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 fixture 파일을 만든 뒤 보이지 않던 Path로 다시 호출합니다.
    tips:
    - Path(folder).iterdir()로 바로 아래 항목을 순회하세요.
    - path.is_file()이 아닌 항목은 manifest에서 제외하세요.
    exercise:
      prompt: build_file_manifest(folder)가 name, suffix, size를 담은 dict 목록을 이름 순서로 반환하도록 완성하세요.
      starterCode: |-
        def build_file_manifest(folder):
            raise NotImplementedError
      solution: |-
        from pathlib import Path

        def build_file_manifest(folder):
            base = Path(folder)
            return [
                {"name": path.name, "suffix": path.suffix, "size": path.stat().st_size}
                for path in sorted(base.iterdir(), key=lambda item: item.name)
                if path.is_file()
            ]
      hints:
      - nested 폴더는 파일이 아니므로 제외되어야 합니다.
      - size는 path.stat().st_size로 읽습니다.
    check:
      id: python.builtins.pathlib.file-manifest.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.pathlib.file-pipeline.mastery.behavior.v1.fixture
      fixtureHash: sha256-g3RHVPHPt8KBgScH9xTnojaPLTEoqo85ntc71a5LFo4=
      fixture:
        directories:
        - input/nested
        - workspace/reports
        - workspace/archive
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/sales.csv
          content: id,amount,1,100,2,150
        - path: input/README.md
          content: '# dataset'
        - path: input/nested/errors.log
          content: ERROR timeout; INFO recovered
        - path: input/nested/raw.csv
          content: x,y,1,2
        stdin: []
      packageAssets: []
      payload:
        entry: build_file_manifest
        cases:
        - id: immediate-files-only
          arguments:
          - fixturePath: input
          expectedReturn:
          - name: README.md
            suffix: .md
            size: 9
          - name: sales.csv
            suffix: .csv
            size: 21
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 09_pathlib-recursive-suffix-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 09_pathlib-file-manifest-mastery
    title: 하위 폴더까지 suffix로 파일 찾기
    subtitle: rglob 결과를 상대경로로 반환
    goal: root 아래에서 suffix가 일치하는 파일을 모두 찾아 POSIX 상대경로 목록으로 반환한다.
    why: 웹 학습에서도 로컬 자동화에서도 절대경로를 그대로 보여주기보다 작업 루트 기준 상대경로를 쓰는 편이 안전합니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 바로 아래 파일만 보지 말고 rglob로 하위 폴더까지 찾으세요.
    tips:
    - Path(root).rglob(f"*{suffix}")로 재귀 검색을 시작하세요.
    - 반환값은 Path 객체가 아니라 as_posix() 문자열 목록이어야 합니다.
    exercise:
      prompt: find_files_by_suffix(root, suffix)가 suffix와 일치하는 파일의 root 기준 상대경로 목록을 반환하도록 완성하세요.
      starterCode: |-
        def find_files_by_suffix(root, suffix):
            raise NotImplementedError
      solution: |-
        from pathlib import Path

        def find_files_by_suffix(root, suffix):
            base = Path(root)
            matches = [
                path.relative_to(base).as_posix()
                for path in base.rglob(f"*{suffix}")
                if path.is_file()
            ]
            return sorted(matches)
      hints:
      - glob는 현재 폴더만 보고 rglob는 하위 폴더까지 봅니다.
      - relative_to(base)를 먼저 적용한 뒤 as_posix()로 문자열화하세요.
    check:
      id: python.builtins.pathlib.recursive-suffix.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.pathlib.file-pipeline.mastery.behavior.v1.fixture
      fixtureHash: sha256-g3RHVPHPt8KBgScH9xTnojaPLTEoqo85ntc71a5LFo4=
      fixture:
        directories:
        - input/nested
        - workspace/reports
        - workspace/archive
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/sales.csv
          content: id,amount,1,100,2,150
        - path: input/README.md
          content: '# dataset'
        - path: input/nested/errors.log
          content: ERROR timeout; INFO recovered
        - path: input/nested/raw.csv
          content: x,y,1,2
        stdin: []
      packageAssets: []
      payload:
        entry: find_files_by_suffix
        cases:
        - id: csv-files
          arguments:
          - fixturePath: input
          - value: .csv
          expectedReturn:
          - nested/raw.csv
          - sales.csv
        - id: log-files
          arguments:
          - fixturePath: input
          - value: .log
          expectedReturn:
          - nested/errors.log
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 09_pathlib-safe-output-path-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 09_pathlib-file-manifest-mastery
    title: 안전한 출력 경로 다시 만들기
    subtitle: resolve와 relative_to로 경계 확인
    goal: root 아래의 출력 경로만 허용하고 path, parent, suffix, stem 정보를 반환한다.
    why: 파일을 쓰는 자동화는 좋은 경로 API보다 안전한 쓰기 경계를 먼저 증명해야 합니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. Path.resolve와 relative_to로 root 밖 이동을 차단하세요.
    tips:
    - candidate.relative_to(root_path)가 실패하면 root 밖 경로입니다.
    - 반환 path는 절대경로여도 verifier가 fixture root 기준 상대경로로 정규화합니다.
    exercise:
      prompt: safe_output_path(root, parts)가 path, parent, suffix, stem을 담은 dict를 반환하고 root 밖 경로는 ValueError를 일으키도록 완성하세요.
      starterCode: |-
        def safe_output_path(root, parts):
            raise NotImplementedError
      solution: |-
        from pathlib import Path

        def safe_output_path(root, parts):
            root_path = Path(root).resolve()
            candidate = root_path.joinpath(*parts).resolve()
            try:
                candidate.relative_to(root_path)
            except ValueError as exc:
                raise ValueError("path escapes root") from exc
            return {
                "path": str(candidate),
                "parent": candidate.parent.name,
                "suffix": candidate.suffix,
                "stem": candidate.stem,
            }
      hints:
      - joinpath 뒤 resolve를 적용해야 상위 폴더 이동이 정리됩니다.
      - relative_to는 성공하면 경계 안, ValueError면 경계 밖입니다.
    check:
      id: python.builtins.pathlib.safe-output-path.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.pathlib.file-pipeline.mastery.behavior.v1.fixture
      fixtureHash: sha256-g3RHVPHPt8KBgScH9xTnojaPLTEoqo85ntc71a5LFo4=
      fixture:
        directories:
        - input/nested
        - workspace/reports
        - workspace/archive
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/sales.csv
          content: id,amount,1,100,2,150
        - path: input/README.md
          content: '# dataset'
        - path: input/nested/errors.log
          content: ERROR timeout; INFO recovered
        - path: input/nested/raw.csv
          content: x,y,1,2
        stdin: []
      packageAssets: []
      payload:
        entry: safe_output_path
        cases:
        - id: report-output
          arguments:
          - fixturePath: workspace
          - value:
            - reports
            - daily.txt
          expectedReturn:
            path: workspace/reports/daily.txt
            parent: reports
            suffix: .txt
            stem: daily
        - id: nested-archive-output
          arguments:
          - fixturePath: workspace
          - value:
            - archive
            - '2026'
            - summary.csv
          expectedReturn:
            path: workspace/archive/2026/summary.csv
            parent: '2026'
            suffix: .csv
            stem: summary
        - id: rejects-root-escape
          arguments:
          - fixturePath: workspace
          - value:
            - ..
            - outside.txt
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths:
        - path
    minimumDelayHours: 24
`;export{e as default};