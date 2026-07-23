var e=`meta:\r
  id: 12_shutil\r
  title: shutil - 파일 연산\r
  category: builtins\r
  tags:\r
  - shutil\r
  - 파일\r
  - 복사\r
  - 이동\r
  - 압축\r
  seo:\r
    title: 파이썬 shutil 모듈 완전 정복\r
    description: shutil 모듈로 파일 복사, 이동, 압축을 배웁니다.\r
    keywords:\r
    - shutil\r
    - 파일복사\r
    - 파일이동\r
    - 압축\r
    - 파이썬파일\r
intro:\r
  emoji: 📋\r
  points:\r
  - 파일 복사와 이동\r
  - 디렉토리 전체 작업\r
  - 압축 파일 생성/해제\r
  - 디스크 사용량 확인\r
  direction: shutil 파일 연산에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - shutil 파일 연산 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: shutil 모듈 불러오기 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 파일 복사/이동 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 디렉토리 작업 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: shutil 파일 연산 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: shutil 파일 연산 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: shutil 파일 연산 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: shutil 모듈 불러오기\r
  structuredPrimary: true\r
  subtitle: ⚠️ 가장 먼저 실행하세요\r
  goal: shutil 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: shutil은 파일과 디렉토리를 고수준으로 다루는 모듈입니다. 복사, 이동, 삭제, 압축 등의 작업을 간단하게 수행할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: import shutil\r
  exercise:\r
    prompt: shutil 모듈 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: import shutil\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: shutil 모듈 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: shutil 모듈 불러오기 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.\r
- id: file_operations\r
  title: 파일 복사/이동\r
  structuredPrimary: true\r
  subtitle: 파일 단위 작업\r
  goal: 파일 복사/이동에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: copy는 파일을 복사하고, copy2는 메타데이터도 복사합니다. move는 파일을 이동하거나 이름을 변경합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import shutil\r
    import tempfile\r
    import os\r
\r
    tempDir = tempfile.mkdtemp()\r
    sourceFile = os.path.join(tempDir, "source.txt")\r
    with open(sourceFile, "w") as f:\r
        f.write("Original content")\r
\r
    destFile = os.path.join(tempDir, "dest.txt")\r
    shutil.copy(sourceFile, destFile)\r
    os.path.exists(destFile)\r
  exercise:\r
    prompt: 파일 복사/이동 예제에서 \`tempDir\`, \`sourceFile\`, \`destFile\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import shutil\r
      import tempfile\r
      import os\r
\r
      tempDir = tempfile.mkdtemp()\r
      sourceFile = os.path.join(tempDir, "source.txt")\r
      with open(sourceFile, "w") as f:\r
          f.write("Original content")\r
\r
      destFile = os.path.join(tempDir, "dest.txt")\r
      shutil.copy(sourceFile, destFile)\r
      os.path.exists(destFile)\r
    hints:\r
    - 바꿀 지점은 \`tempDir = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`tempDir\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 파일 복사/이동에서 \`tempDir\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 파일 복사/이동 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: directory_operations\r
  title: 디렉토리 작업\r
  structuredPrimary: true\r
  subtitle: 디렉토리 단위 작업\r
  goal: 디렉토리 작업에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: copytree는 디렉토리를 재귀적으로 복사합니다. rmtree는 디렉토리와 내용을 모두 삭제합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import shutil\r
    import tempfile\r
    import os\r
\r
    tempDir = tempfile.mkdtemp()\r
    srcDir = os.path.join(tempDir, "source")\r
    os.makedirs(srcDir)\r
    with open(os.path.join(srcDir, "file.txt"), "w") as f:\r
        f.write("Data")\r
\r
    dstDir = os.path.join(tempDir, "destination")\r
    shutil.copytree(srcDir, dstDir)\r
    os.path.exists(dstDir)\r
  exercise:\r
    prompt: 디렉토리 작업 예제에서 \`tempDir\`, \`srcDir\`, \`dstDir\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import shutil\r
      import tempfile\r
      import os\r
\r
      tempDir = tempfile.mkdtemp()\r
      srcDir = os.path.join(tempDir, "source")\r
      os.makedirs(srcDir)\r
      with open(os.path.join(srcDir, "file.txt"), "w") as f:\r
          f.write("Data")\r
\r
      dstDir = os.path.join(tempDir, "destination")\r
      shutil.copytree(srcDir, dstDir)\r
      os.path.exists(dstDir)\r
    hints:\r
    - 바꿀 지점은 \`tempDir = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`tempDir\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 디렉토리 작업에서 \`tempDir\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 디렉토리 작업 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: archive_operations\r
  title: 압축 파일\r
  structuredPrimary: true\r
  subtitle: 압축 생성 및 해제\r
  goal: 압축 파일에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: make_archive는 압축 파일을 생성합니다. unpack_archive는 압축 파일을 해제합니다. Codaro 로컬 커널에서는 임시 디렉터리에서 안전하게\r
    생성과 해제를 실습할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import shutil\r
    import tempfile\r
    import os\r
\r
    tempDir = tempfile.mkdtemp()\r
    sourceDir = os.path.join(tempDir, "data")\r
    os.makedirs(sourceDir)\r
    with open(os.path.join(sourceDir, "file.txt"), "w") as f:\r
        f.write("Archive me")\r
\r
    archivePath = os.path.join(tempDir, "archive")\r
    result = shutil.make_archive(archivePath, 'zip', sourceDir)\r
    os.path.exists(result)\r
  exercise:\r
    prompt: 압축 파일 예제에서 \`tempDir\`, \`sourceDir\`, \`archivePath\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import shutil\r
      import tempfile\r
      import os\r
\r
      tempDir = tempfile.mkdtemp()\r
      sourceDir = os.path.join(tempDir, "data")\r
      os.makedirs(sourceDir)\r
      with open(os.path.join(sourceDir, "file.txt"), "w") as f:\r
          f.write("Archive me")\r
\r
      archivePath = os.path.join(tempDir, "archive")\r
      result = shutil.make_archive(archivePath, 'zip', sourceDir)\r
      os.path.exists(result)\r
    hints:\r
    - 바꿀 지점은 \`tempDir = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`tempDir\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 압축 파일에서 \`tempDir\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 압축 파일 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: disk_usage\r
  title: 디스크 사용량\r
  structuredPrimary: true\r
  subtitle: 디스크 정보 확인\r
  goal: 디스크 사용량에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: disk_usage는 디스크 사용량 정보를 반환합니다. total, used, free 값을 튜플로 제공하며, Codaro 로컬 커널에서는 지정한 로컬 경로가\r
    위치한 디스크 기준으로 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import shutil\r
    usageInfo = shutil.disk_usage("/")\r
    type(usageInfo).__name__\r
  exercise:\r
    prompt: 디스크 사용량 예제에서 \`usageInfo\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import shutil\r
      usageInfo = shutil.disk_usage("/")\r
      type(usageInfo).__name__\r
    hints:\r
    - 바꿀 지점은 \`usageInfo = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`usageInfo\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 디스크 사용량에서 \`usageInfo\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 디스크 사용량 실행 뒤 \`usageInfo\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: practical_use\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: 실무 계산 예제\r
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: shutil을 활용한 백업, 배포, 정리 작업 예제입니다. 실무에서 자주 사용되는 패턴을 학습합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import shutil\r
    import tempfile\r
    import os\r
\r
    tempDir = tempfile.mkdtemp()\r
    projectDir = os.path.join(tempDir, "project")\r
    os.makedirs(projectDir)\r
    with open(os.path.join(projectDir, "main.py"), "w") as f:\r
        f.write("code")\r
\r
    backupDir = os.path.join(tempDir, "backup")\r
    shutil.copytree(projectDir, backupDir)\r
    os.path.exists(backupDir)\r
  exercise:\r
    prompt: 실전 활용 예제에서 \`tempDir\`, \`projectDir\`, \`backupDir\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import shutil\r
      import tempfile\r
      import os\r
\r
      tempDir = tempfile.mkdtemp()\r
      projectDir = os.path.join(tempDir, "project")\r
      os.makedirs(projectDir)\r
      with open(os.path.join(projectDir, "main.py"), "w") as f:\r
          f.write("code")\r
\r
      backupDir = os.path.join(tempDir, "backup")\r
      shutil.copytree(projectDir, backupDir)\r
      os.path.exists(backupDir)\r
    hints:\r
    - 바꿀 지점은 \`tempDir = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`tempDir\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용에서 \`tempDir\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실전 활용 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 안전한 백업 파이프라인'\r
  structuredPrimary: true\r
  subtitle: 복사, 압축, 검증, _backup 이동\r
  goal: '검증 루프: 안전한 백업 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    shutil은 실제 파일을 복사·이동·삭제할 수 있으므로 실무에서는 작업공간을 먼저 격리하고, 복사 전후 파일 수와 압축 결과를 검증해야 합니다. 삭제 대신 _backup 이동 패턴을 사용하면 되돌릴 여지도 남길 수 있습니다.\r
\r
    변주 실험\r
    압축 파일 이름에 날짜를 붙이고, 같은 이름이 이미 있으면 덮어쓰기 대신 새 버전을 만들도록 백업 정책을 확장하세요.\r
  tips:\r
  - 변주 실험 압축 파일 이름에 날짜를 붙이고, 같은 이름이 이미 있으면 덮어쓰기 대신 새 버전을 만들도록 백업 정책을 확장하세요.\r
  snippet: |-\r
    import os\r
    import shutil\r
    import tempfile\r
\r
    backupRoot = tempfile.mkdtemp(prefix='codaro_shutil_workflow_')\r
    projectDir = os.path.join(backupRoot, 'project')\r
    os.makedirs(os.path.join(projectDir, 'src'), exist_ok=True)\r
    os.makedirs(os.path.join(projectDir, 'data'), exist_ok=True)\r
\r
    projectFiles = {\r
        os.path.join(projectDir, 'src', 'main.py'): "print('hello')\\n",\r
        os.path.join(projectDir, 'src', 'utils.py'): "VALUE = 42\\n",\r
        os.path.join(projectDir, 'data', 'sample.csv'): "id,value\\n1,10\\n",\r
    }\r
\r
    for path, content in projectFiles.items():\r
        with open(path, 'w', encoding='utf-8') as file:\r
            file.write(content)\r
\r
    def countFiles(folder):\r
        total = 0\r
        for root, dirs, files in os.walk(folder):\r
            total += len(files)\r
        return total\r
\r
    sourceFileCount = countFiles(projectDir)\r
\r
    assert sourceFileCount == 3\r
    assert os.path.exists(os.path.join(projectDir, 'src', 'main.py'))\r
\r
    sourceFileCount\r
  exercise:\r
    prompt: '검증 루프: 안전한 백업 파이프라인 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      import os\r
      import shutil\r
      import tempfile\r
\r
      backupRoot = tempfile.mkdtemp(prefix='codaro_shutil_workflow_')\r
      projectDir = os.path.join(backupRoot, 'project')\r
      os.makedirs(os.path.join(projectDir, 'src'), exist_ok=True)\r
      os.makedirs(os.path.join(projectDir, 'data'), exist_ok=True)\r
\r
      projectFiles = {\r
          os.path.join(projectDir, 'src', 'main.py'): "print('hello')\\n",\r
          os.path.join(projectDir, 'src', 'utils.py'): "VALUE = 42\\n",\r
          os.path.join(projectDir, 'data', 'sample.csv'): "id,value\\n1,10\\n",\r
      }\r
\r
      for path, content in projectFiles.items():\r
          with open(path, 'w', encoding='utf-8') as file:\r
              file.write(content)\r
\r
      def countFiles(folder):\r
          total = 0\r
          for root, dirs, files in os.walk(folder):\r
              total += len(files)\r
          return total\r
\r
      sourceFileCount = countFiles(projectDir)\r
\r
      assert sourceFileCount == 3\r
      assert os.path.exists(os.path.join(projectDir, 'src', 'main.py'))\r
\r
      sourceFileCount\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 안전한 백업 파이프라인의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: 안전한 백업 파이프라인 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: shutil 모듈 종합 복습\r
  structuredPrimary: true\r
  subtitle: 파일 연산 마스터하기\r
  goal: shutil 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 지금까지 배운 shutil 모듈의 모든 기능을 복습합니다. 🟢 기초 5개, 🟡 중급 5개, 🔴 고급 10개 문제를 풀어보세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import shutil\r
    import tempfile\r
    import os\r
\r
    tempDir = tempfile.mkdtemp()\r
    sourceFile = os.path.join(tempDir, "source.txt")\r
    with open(sourceFile, "w") as f:\r
        f.write("data")\r
\r
    backupFile = os.path.join(tempDir, "backup.txt")\r
    shutil.copy(sourceFile, backupFile)\r
    os.path.exists(backupFile)\r
  exercise:\r
    prompt: shutil 모듈 종합 복습 예제에서 \`tempDir\`, \`sourceFile\`, \`backupFile\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import shutil\r
      import tempfile\r
      import os\r
\r
      tempDir = tempfile.mkdtemp()\r
      sourceFile = os.path.join(tempDir, "source.txt")\r
      with open(sourceFile, "w") as f:\r
          f.write("data")\r
\r
      backupFile = os.path.join(tempDir, "backup.txt")\r
      shutil.copy(sourceFile, backupFile)\r
      os.path.exists(backupFile)\r
    hints:\r
    - 바꿀 지점은 \`tempDir = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`tempDir\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:
    type: noError
    noError: shutil 모듈 종합 복습에서 \`tempDir\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: shutil 모듈 종합 복습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 12_shutil-copy-selected-files-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - file_operations
    - practical_use
    - workflow_validation
    title: 선택한 파일만 안전하게 복사하기
    subtitle: copy2와 대상 폴더 검증
    goal: source 폴더에서 지정한 파일만 dest 폴더로 복사하고 복사된 파일 목록과 개수를 반환한다.
    why: shutil 학습은 전체 폴더를 무작정 복제하기보다, 어떤 파일을 어디로 복사했는지 증거를 남길 때 자동화로 이어집니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 fixture 프로젝트를 만든 뒤 보이지 않던 source와 dest 경로로 다시 호출합니다.
    tips:
    - os.makedirs(dest_dir, exist_ok=True)로 대상 폴더를 먼저 준비하세요.
    - shutil.copy2는 파일 내용과 메타데이터 복사를 함께 처리합니다.
    exercise:
      prompt: copy_selected_files(source_dir, dest_dir, names)가 copied, destFiles, fileCount를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def copy_selected_files(source_dir, dest_dir, names):
            raise NotImplementedError
      solution: |-
        import os
        import shutil

        def copy_selected_files(source_dir, dest_dir, names):
            os.makedirs(dest_dir, exist_ok=True)
            copied = []
            for name in names:
                source = os.path.join(source_dir, name)
                if not os.path.isfile(source):
                    raise FileNotFoundError(name)
                shutil.copy2(source, os.path.join(dest_dir, name))
                copied.append(name)
            return {
                "copied": copied,
                "destFiles": sorted(os.listdir(dest_dir)),
                "fileCount": len(copied),
            }
      hints:
      - source에 없는 파일은 조용히 건너뛰지 말고 실패시켜야 합니다.
      - destFiles는 실제 복사 결과를 다시 읽어 반환하세요.
    check:
      id: python.builtins.shutil.copy-selected-files.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.shutil.project-backup.mastery.behavior.v1.fixture
      fixtureHash: sha256-0LzM86cVBIXv7A+z/Zq3j0GxAOJ43Zq+zA7RCaHy4Kk=
      fixture:
        directories:
        - project/src
        - project/data
        - output
        - archives
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: project/src/main.py
          content: print('hello')
        - path: project/src/utils.py
          content: VALUE = 42
        - path: project/data/sample.csv
          content: id,value,1,10
        - path: project/README.md
          content: project readme
        stdin: []
      packageAssets: []
      payload:
        entry: copy_selected_files
        cases:
        - id: copy-python-files
          arguments:
          - fixturePath: project/src
          - fixturePath: output/src-copy
          - value:
            - main.py
            - utils.py
          expectedReturn:
            copied:
            - main.py
            - utils.py
            destFiles:
            - main.py
            - utils.py
            fileCount: 2
        - id: rejects-missing-file
          arguments:
          - fixturePath: project/src
          - fixturePath: output/missing-copy
          - value:
            - missing.py
          expectedException: FileNotFoundError
        expectedPaths:
        - path: output/src-copy/main.py
          kind: file
        - path: output/src-copy/utils.py
          kind: file
        normalizeReturnPaths: []
  transferVariants:
  - id: 12_shutil-zip-archive-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 12_shutil-copy-selected-files-mastery
    title: 프로젝트 폴더를 zip 아카이브로 만들기
    subtitle: make_archive 결과 경로 검증
    goal: source 폴더를 zip으로 압축하고 생성된 archive 경로와 포함 파일 수를 반환한다.
    why: 백업 자동화는 압축 파일이 생성됐다는 사실과 압축 대상 파일 수를 함께 확인해야 신뢰할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 복사 대신 압축 결과물을 만들어 검증하세요.
    tips:
    - archive_base에는 .zip 확장자를 붙이지 않고 shutil.make_archive에 넘깁니다.
    - 파일 수는 source_dir을 os.walk로 다시 세어 반환하세요.
    exercise:
      prompt: make_project_zip(source_dir, archive_base)가 path, exists, sourceFileCount를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def make_project_zip(source_dir, archive_base):
            raise NotImplementedError
      solution: |-
        import os
        import shutil

        def make_project_zip(source_dir, archive_base):
            file_count = sum(len(files) for _, _, files in os.walk(source_dir))
            archive_path = shutil.make_archive(archive_base, "zip", source_dir)
            return {
                "path": archive_path,
                "exists": os.path.exists(archive_path),
                "sourceFileCount": file_count,
            }
      hints:
      - make_archive가 실제 생성한 경로를 반환값으로 받으세요.
      - archive_base는 fixture 안의 archives 폴더 아래로 넘겨집니다.
    check:
      id: python.builtins.shutil.zip-archive.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.shutil.project-backup.mastery.behavior.v1.fixture
      fixtureHash: sha256-0LzM86cVBIXv7A+z/Zq3j0GxAOJ43Zq+zA7RCaHy4Kk=
      fixture:
        directories:
        - project/src
        - project/data
        - output
        - archives
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: project/src/main.py
          content: print('hello')
        - path: project/src/utils.py
          content: VALUE = 42
        - path: project/data/sample.csv
          content: id,value,1,10
        - path: project/README.md
          content: project readme
        stdin: []
      packageAssets: []
      payload:
        entry: make_project_zip
        cases:
        - id: archive-project
          arguments:
          - fixturePath: project
          - fixturePath: archives/project-backup
          expectedReturn:
            path: archives/project-backup.zip
            exists: true
            sourceFileCount: 4
        expectedPaths:
        - path: archives/project-backup.zip
          kind: file
        normalizeReturnPaths:
        - path
  retrievalVariants:
  - id: 12_shutil-backup-copytree-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 12_shutil-copy-selected-files-mastery
    title: 기존 백업을 덮어쓰지 않고 staging하기
    subtitle: copytree 충돌 방지와 결과 검증
    goal: root 아래 source_dir_name을 backup_name으로 copytree하되 대상이 이미 있으면 ValueError를 일으킨다.
    why: 시간이 지난 뒤에도 shutil의 핵심은 빠른 복사보다 되돌릴 수 없는 덮어쓰기를 막는 백업 정책입니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 대상 존재 여부를 먼저 확인하고 copytree 결과를 검증하세요.
    tips:
    - destination.exists()가 True이면 copytree를 호출하지 말고 실패시키세요.
    - 반환 path는 verifier가 fixture root 기준 상대경로로 정규화합니다.
    exercise:
      prompt: stage_backup(root, source_dir_name, backup_name)가 path, fileCount, copied를 담은 dict를 반환하고 기존 대상은 거부하도록 완성하세요.
      starterCode: |-
        def stage_backup(root, source_dir_name, backup_name):
            raise NotImplementedError
      solution: |-
        from pathlib import Path
        import shutil

        def stage_backup(root, source_dir_name, backup_name):
            root_path = Path(root)
            source = root_path / source_dir_name
            destination = root_path / backup_name
            if destination.exists():
                raise ValueError("backup already exists")
            shutil.copytree(source, destination)
            file_count = sum(1 for path in destination.rglob("*") if path.is_file())
            return {"path": str(destination), "fileCount": file_count, "copied": destination.exists()}
      hints:
      - copytree는 대상 폴더가 이미 있으면 실패하므로 그 전에 명시적으로 검사하세요.
      - rglob("*")와 is_file()로 복사된 파일 수를 세세요.
    check:
      id: python.builtins.shutil.backup-copytree.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.shutil.project-backup.mastery.behavior.v1.fixture
      fixtureHash: sha256-0LzM86cVBIXv7A+z/Zq3j0GxAOJ43Zq+zA7RCaHy4Kk=
      fixture:
        directories:
        - project/src
        - project/data
        - output
        - archives
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: project/src/main.py
          content: print('hello')
        - path: project/src/utils.py
          content: VALUE = 42
        - path: project/data/sample.csv
          content: id,value,1,10
        - path: project/README.md
          content: project readme
        stdin: []
      packageAssets: []
      payload:
        entry: stage_backup
        cases:
        - id: creates-project-backup
          arguments:
          - fixturePath: .
          - value: project
          - value: output/project-backup
          expectedReturn:
            path: output/project-backup
            fileCount: 4
            copied: true
        - id: rejects-existing-backup
          arguments:
          - fixturePath: .
          - value: project
          - value: output/project-backup
          expectedException: ValueError
        expectedPaths:
        - path: output/project-backup/src/main.py
          kind: file
        - path: output/project-backup/data/sample.csv
          kind: file
        normalizeReturnPaths:
        - path
    minimumDelayHours: 24
`;export{e as default};