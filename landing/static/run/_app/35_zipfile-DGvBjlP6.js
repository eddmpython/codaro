var e=`meta:
  id: '35'
  title: zipfile와 tarfile
  day: 35
  category: builtins
  outcomes: ["builtins.archives"]
  prerequisites: ["builtins.fileSystem","builtins.contextManagers"]
  estimatedMinutes: 45
  tags:
  - zipfile
  - tarfile
  - 압축
  - 아카이브
  - 자동화
  seo:
    title: 파이썬 zipfile와 tarfile 표준 라이브러리 - 아카이브 다루기
    description: ZIP 만들기/읽기, ZIP 안 텍스트 파일 다루기, tarfile gzip 압축, namelist로 목록 확인.
    keywords:
    - zipfile
    - tarfile
    - ZipFile
    - 압축
    - 아카이브
intro:
  emoji: 🗜
  points:
  - ZipFile로 ZIP 아카이브 만들기/읽기
  - namelist로 아카이브 안 항목 확인
  - read로 ZIP 안 파일 내용 직접 읽기
  - extractall로 안전하게 전체 추출
  - tarfile + gzip으로 tar.gz 다루기
  direction: zipfile와 tarfile에서 아카이브를 만들고 읽고 추출하는 흐름을 코드로 확인하고 path traversal 같은 위험을 피하는 패턴을 익힙니다.
  benefits:
  - 자동화 결과물을 한 파일로 묶어 배포할 수 있습니다.
  - 외부에서 받은 아카이브를 안전하게 검사한 뒤 추출합니다.
  - 텍스트 파일 모음을 메모리에서 처리할 수 있습니다.
  diagram:
    steps:
    - label: 아카이브 형식 입력 확인
      detail: zip인지 tar.gz인지 입력 형식을 먼저 확인합니다.
    - label: 읽기/쓰기 처리 실행
      detail: ZipFile 또는 tarfile.open으로 컨텍스트 매니저 안에서 작업합니다.
    - label: 내용 검증
      detail: namelist/getnames로 항목을 확인하고 read/extractfile로 내용을 검증합니다.
    - label: 아카이브 패턴 재사용
      detail: 백업/배포/패키지 자동화에 같은 흐름을 그대로 붙입니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: zipfile, tarfile, tempfile만 사용해 추가 패키지 없이 실행합니다.
    - label: 아카이브 실행
      detail: 셀을 실행해 아카이브 생성과 추출 결과를 확인합니다.
    - label: 아카이브 완료
      detail: 검증된 코드를 배포/백업 유틸리티로 남깁니다.
sections:
- id: zip-create
  title: ZIP 아카이브 만들기
  structuredPrimary: true
  subtitle: ZipFile + writestr / write
  goal: ZipFile을 쓰기 모드로 열고 디스크 파일과 메모리 문자열 둘 다 아카이브에 추가합니다.
  why: 자동화 결과물(로그, 리포트, 모델)을 한 파일로 묶어 보관/전송하는 가장 표준 형식이 ZIP입니다.
  explanation: 'zipfile.ZipFile(path, "w", compression=ZIP_DEFLATED)로 ZIP을 만듭니다. write(filepath, arcname)는 디스크 파일을 추가하고 writestr(arcname, data)는 메모리 데이터를 직접 추가합니다. ZIP_DEFLATED는 zlib 압축을 활성화합니다.'
  tips:
  - arcname을 지정하지 않으면 디스크 경로가 그대로 아카이브 안 경로가 됩니다.
  - 압축 없이 ZIP_STORED는 빠르지만 파일 크기가 줄지 않습니다.
  snippet: |-
    import tempfile
    import zipfile
    from pathlib import Path

    with tempfile.TemporaryDirectory() as workspace:
        root = Path(workspace)
        diskFile = root / "report.txt"
        diskFile.write_text("disk content", encoding="utf-8")

        archive = root / "result.zip"
        with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as zip:
            zip.write(diskFile, arcname="report.txt")
            zip.writestr("memory.txt", "in-memory content")

        with zipfile.ZipFile(archive, "r") as zip:
            names = zip.namelist()
            sizeMap = {info.filename: info.file_size for info in zip.infolist()}

    {"names": sorted(names), "memorySize": sizeMap["memory.txt"]}
  exercise:
    prompt: writestr로 세 개의 메모리 데이터(a.txt, b.txt, c.txt)를 한 ZIP에 담고 namelist가 정확히 세 항목을 돌려주는지 확인하세요.
    starterCode: |-
      import tempfile
      import zipfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as workspace:
          archive = Path(workspace) / "bundle.zip"
          with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as zip:
              for name, body in [("a.txt", "alpha"), ("b.txt", "bravo"), ("c.txt", "charlie")]:
                  zip.writestr(name, body)

          with zipfile.ZipFile(archive, "r") as zip:
              names = sorted(zip.namelist())

      names
    hints:
    - writestr은 메모리 문자열을 바로 아카이브에 추가합니다.
    - 같은 이름으로 여러 번 추가하면 ZIP에 중복 항목이 생깁니다.
  check:
    noError: ZipFile 호출이 NameError나 FileNotFoundError 없이 실행되어야 합니다.
    resultCheck: 결과가 정확히 [a.txt, b.txt, c.txt] 세 항목이어야 합니다.
- id: zip-read
  title: ZIP 안 내용 직접 읽기
  structuredPrimary: true
  subtitle: read / open으로 추출 없이 처리
  goal: ZIP을 읽기 모드로 열고 read(name)으로 특정 항목의 내용을 추출 없이 메모리에서 처리합니다.
  why: 모든 항목을 디스크로 추출한 뒤 읽는 것보다 메모리에서 직접 읽는 편이 안전하고 빠릅니다. 임시 폴더가 필요 없고 path traversal 위험도 줄어듭니다.
  explanation: ZipFile.read(name)은 항목의 바이트를 돌려줍니다. ZipFile.open(name)은 파일 객체(read-only)를 돌려주어 큰 항목을 스트리밍할 수 있습니다. 텍스트 항목은 .decode("utf-8")로 문자열로 변환합니다.
  tips:
  - read는 작은 파일에, open은 큰 파일이나 줄 단위 처리에 적합합니다.
  - 항목 이름에 ../가 들어 있으면 path traversal 시도일 수 있습니다.
  snippet: |-
    import tempfile
    import zipfile
    from pathlib import Path

    with tempfile.TemporaryDirectory() as workspace:
        archive = Path(workspace) / "logs.zip"
        with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as zip:
            zip.writestr("log1.txt", "INFO ok\\nWARN slow\\n")
            zip.writestr("log2.txt", "ERROR boom\\n")

        with zipfile.ZipFile(archive, "r") as zip:
            log1 = zip.read("log1.txt").decode("utf-8")
            with zip.open("log2.txt") as handle:
                log2Bytes = handle.read()

    {"log1Lines": log1.splitlines(), "log2": log2Bytes.decode("utf-8").strip()}
  exercise:
    prompt: ZIP을 읽고 모든 항목 안의 텍스트에서 WARN 단어가 몇 번 등장하는지 세는 함수를 만들어 검증하세요.
    starterCode: |-
      import tempfile
      import zipfile
      from pathlib import Path

      def countWarn(archivePath):
          total = 0
          with zipfile.ZipFile(archivePath, "r") as zip:
              for name in zip.namelist():
                  body = zip.read(name).decode("utf-8")
                  total += body.count("WARN")
          return total

      with tempfile.TemporaryDirectory() as workspace:
          archive = Path(workspace) / "logs.zip"
          with zipfile.ZipFile(archive, "w") as zip:
              zip.writestr("a.log", "INFO\\nWARN x\\nWARN y\\n")
              zip.writestr("b.log", "WARN z\\nERROR\\n")

          warnCount = countWarn(archive)

      warnCount
    hints:
    - read는 바이트를 돌려주므로 decode 필요합니다.
    - .count는 부분 문자열의 등장 횟수를 셉니다.
  check:
    noError: countWarn과 ZIP 호출이 NameError나 UnicodeDecodeError 없이 실행되어야 합니다.
    resultCheck: warnCount가 정확히 3이어야 합니다.
- id: extract-all-safe
  title: 안전한 extractall과 path traversal
  structuredPrimary: true
  subtitle: 외부 아카이브를 풀 때
  goal: extractall로 ZIP을 풀되 아카이브 안 항목이 대상 폴더 바깥으로 빠져나가지 않는지 검증합니다.
  why: 외부에서 받은 아카이브가 ../../../etc/passwd 같은 항목을 가지면 추출 시 시스템 파일을 덮을 수 있습니다. 추출 전에 항목 이름을 검증하는 것이 표준 보안 패턴입니다.
  explanation: ZipFile.namelist()로 항목을 미리 확인하고 (target_dir / name).resolve()가 target_dir 안에 있는지 검사합니다. 항목 이름이 절대 경로이거나 .. 컴포넌트를 가지면 거부합니다. 안전한 항목만 남으면 extractall(target_dir)을 호출합니다.
  tips:
  - Path.resolve로 정규화한 뒤 is_relative_to로 검사하는 패턴이 안전합니다.
  - Python 3.12+의 zipfile은 일부 path traversal을 자동으로 막지만 명시 검증이 권장됩니다.
  snippet: |-
    import tempfile
    import zipfile
    from pathlib import Path

    def safeExtract(archivePath, targetDir):
        targetDir = Path(targetDir).resolve()
        with zipfile.ZipFile(archivePath, "r") as zip:
            for name in zip.namelist():
                resolved = (targetDir / name).resolve()
                if not str(resolved).startswith(str(targetDir)):
                    raise ValueError(f"unsafe path in archive: {name}")
            zip.extractall(targetDir)
        return sorted(p.name for p in targetDir.iterdir())

    with tempfile.TemporaryDirectory() as workspace:
        root = Path(workspace)
        archive = root / "package.zip"
        with zipfile.ZipFile(archive, "w") as zip:
            zip.writestr("readme.txt", "hello")
            zip.writestr("data/items.txt", "alpha\\nbravo")

        outDir = root / "out"
        outDir.mkdir()
        items = safeExtract(archive, outDir)

    items
  exercise:
    prompt: 의도적으로 ../escape.txt 항목을 가진 ZIP을 만들고 safeExtract가 ValueError를 일으키는지 확인하세요.
    starterCode: |-
      import tempfile
      import zipfile
      from pathlib import Path

      def safeExtract(archivePath, targetDir):
          targetDir = Path(targetDir).resolve()
          with zipfile.ZipFile(archivePath, "r") as zip:
              for name in zip.namelist():
                  resolved = (targetDir / name).resolve()
                  if not str(resolved).startswith(str(targetDir)):
                      raise ValueError(f"unsafe path: {name}")
              zip.extractall(targetDir)

      with tempfile.TemporaryDirectory() as workspace:
          root = Path(workspace)
          archive = root / "evil.zip"
          with zipfile.ZipFile(archive, "w") as zip:
              zip.writestr("../escape.txt", "I am outside")

          outDir = root / "out"
          outDir.mkdir()
          raised = None
          try:
              safeExtract(archive, outDir)
          except ValueError as exc:
              raised = str(exc)

      raised
    hints:
    - 항목 이름에 ..가 들어 있으면 resolve 결과가 targetDir 바깥을 가리킵니다.
    - ValueError를 catch한 raised에 메시지가 담겨야 합니다.
  check:
    noError: safeExtract 정의와 ValueError 분기가 NameError 없이 실행되어야 합니다.
    resultCheck: raised에 unsafe path 문자열이 포함되어 path traversal이 검출된 것입니다.
- id: tarfile-gz
  title: tarfile + gzip으로 tar.gz
  structuredPrimary: true
  subtitle: 리눅스 표준 아카이브 형식
  goal: tarfile.open("w:gz")로 tar.gz 아카이브를 만들고 다시 열어 getnames와 extractfile로 내용을 확인합니다.
  why: 리눅스/CI/배포에서 가장 자주 보는 아카이브 형식이 tar.gz입니다. zip과 표준 API가 약간 다르므로 별도로 익혀 두는 편이 자동화 코드가 안정적입니다.
  explanation: 'tarfile.open(path, "w:gz")는 gzip 압축 tar를 만듭니다. add(filepath, arcname)는 디스크 파일을 추가하고, tarfile.TarInfo + addfile(info, fileobj)로 메모리 데이터를 추가합니다. 읽기는 open(path, "r:gz")로 열고 getnames / extractfile을 씁니다.'
  tips:
  - w:gz, w:bz2, w:xz로 압축 형식을 선택합니다.
  - getmembers는 TarInfo 객체 목록을 돌려주어 파일 크기/권한도 확인할 수 있습니다.
  snippet: |-
    import io
    import tarfile
    import tempfile
    from pathlib import Path

    with tempfile.TemporaryDirectory() as workspace:
        root = Path(workspace)
        diskFile = root / "note.txt"
        diskFile.write_text("disk note", encoding="utf-8")

        archive = root / "bundle.tar.gz"
        with tarfile.open(archive, "w:gz") as tar:
            tar.add(diskFile, arcname="note.txt")
            memoryBytes = b"in-memory entry"
            info = tarfile.TarInfo(name="memory.txt")
            info.size = len(memoryBytes)
            tar.addfile(info, io.BytesIO(memoryBytes))

        with tarfile.open(archive, "r:gz") as tar:
            names = sorted(tar.getnames())
            extractedNote = tar.extractfile("note.txt").read().decode("utf-8")

    {"names": names, "extractedNote": extractedNote}
  exercise:
    prompt: tar.gz 아카이브에 메모리 텍스트 세 개를 담고 getnames와 extractfile로 모든 항목 내용을 읽어 dict로 모아 보세요.
    starterCode: |-
      import io
      import tarfile
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as workspace:
          archive = Path(workspace) / "items.tar.gz"
          with tarfile.open(archive, "w:gz") as tar:
              for name, body in [("a.txt", "alpha"), ("b.txt", "bravo"), ("c.txt", "charlie")]:
                  payload = body.encode("utf-8")
                  info = tarfile.TarInfo(name=name)
                  info.size = len(payload)
                  tar.addfile(info, io.BytesIO(payload))

          with tarfile.open(archive, "r:gz") as tar:
              contents = {name: tar.extractfile(name).read().decode("utf-8") for name in sorted(tar.getnames())}

      contents
    hints:
    - addfile은 TarInfo와 파일 객체를 받습니다. io.BytesIO가 메모리 파일 객체입니다.
    - extractfile은 파일 객체를 돌려주므로 read()로 바이트를 받습니다.
  check:
    noError: tarfile 호출과 BytesIO 사용이 NameError나 TarError 없이 실행되어야 합니다.
    resultCheck: contents dict가 {a.txt - alpha, b.txt - bravo, c.txt - charlie}로 정확히 세 항목이어야 합니다.
- id: archive-pipeline
  title: 아카이브 자동화 파이프라인
  structuredPrimary: true
  subtitle: 생성 + 검증 + 추출 한 흐름으로
  goal: 디스크 폴더 → ZIP 생성 → 검증 → 추출까지 한 함수에 묶어 자동화 배포 흐름을 표준 형태로 만듭니다.
  why: 분리된 단계로 흩어진 자동화 코드는 실패 분기를 잡기 어렵습니다. 한 함수에 입력/출력 경계와 검증을 모으면 호출자가 결과 dict로 상태를 받습니다.
  explanation: 입력 폴더의 모든 파일을 ZIP에 추가하고, 결과 namelist를 호출자에게 노출하고, 같은 함수의 추출 분기에서 항목을 검증합니다. shutil + zipfile 조합이 가장 일반적인 패턴입니다.
  tips:
  - 입력 폴더와 출력 폴더는 항상 분리하세요.
  - 결과 dict에 항목 수, 총 크기, 압축 비율 같은 통계를 담으면 호출자가 한눈에 점검할 수 있습니다.
  snippet: |-
    import tempfile
    import zipfile
    from pathlib import Path

    def packDirectory(sourceDir, archivePath):
        sourceDir = Path(sourceDir)
        sizeBefore = sum(p.stat().st_size for p in sourceDir.iterdir() if p.is_file())
        with zipfile.ZipFile(archivePath, "w", compression=zipfile.ZIP_DEFLATED) as zip:
            for path in sorted(sourceDir.iterdir()):
                if path.is_file():
                    zip.write(path, arcname=path.name)
        sizeAfter = Path(archivePath).stat().st_size
        with zipfile.ZipFile(archivePath, "r") as zip:
            count = len(zip.namelist())
        return {"items": count, "sizeBefore": sizeBefore, "sizeAfter": sizeAfter}

    with tempfile.TemporaryDirectory() as workspace:
        root = Path(workspace)
        (root / "a.log").write_text("INFO\\n" * 200, encoding="utf-8")
        (root / "b.log").write_text("INFO\\n" * 200, encoding="utf-8")
        result = packDirectory(root, root / "logs.zip")

    result
  exercise:
    prompt: packDirectory를 확장해 압축 비율(sizeAfter/sizeBefore)을 결과 dict에 추가하고 비율이 1보다 작은지 확인하세요.
    starterCode: |-
      import tempfile
      import zipfile
      from pathlib import Path

      def packDirectory(sourceDir, archivePath):
          sourceDir = Path(sourceDir)
          sizeBefore = sum(p.stat().st_size for p in sourceDir.iterdir() if p.is_file())
          with zipfile.ZipFile(archivePath, "w", compression=zipfile.ZIP_DEFLATED) as zip:
              for path in sorted(sourceDir.iterdir()):
                  if path.is_file():
                      zip.write(path, arcname=path.name)
          sizeAfter = Path(archivePath).stat().st_size
          with zipfile.ZipFile(archivePath, "r") as zip:
              count = len(zip.namelist())
          ratio = sizeAfter / sizeBefore if sizeBefore else 0
          return {"items": count, "sizeBefore": sizeBefore, "sizeAfter": sizeAfter, "ratio": ratio}

      with tempfile.TemporaryDirectory() as workspace:
          root = Path(workspace)
          (root / "x.log").write_text("INFO\\n" * 1000, encoding="utf-8")
          (root / "y.log").write_text("INFO\\n" * 1000, encoding="utf-8")
          result = packDirectory(root, root / "out.zip")

      result
    hints:
    - 반복적인 텍스트는 압축이 잘 되어 ratio가 1보다 훨씬 작습니다.
    - 결과 dict 안의 ratio가 0과 1 사이여야 합니다.
  check:
    type: noError
    noError: packDirectory 호출이 NameError나 FileNotFoundError 없이 실행되어야 합니다.
    resultCheck: result dict의 items가 2이고 ratio가 0보다 크고 1보다 작아야 압축이 동작한 것입니다.
assessment:
  masteryVariants:
  - id: 35_zipfile-manifest-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - zip-create
    - zip-read
    - archive-pipeline
    title: ZIP에 메모리 항목을 쓰고 manifest와 내용 검증하기
    subtitle: writestr, namelist, read
    goal: 항목 목록을 ZIP에 writestr로 저장한 뒤 namelist, 파일 크기, 텍스트 내용을 다시 읽어 manifest를 반환한다.
    why: zipfile 숙달은 압축 파일이 만들어졌다는 사실보다, 아카이브 안에 정확한 이름과 내용이 들어갔는지 검증하는 능력입니다.
    explanation: build_zip_manifest(entries)를 완성해 임시 ZIP을 만들고 names, contents, totalUncompressedBytes, warnCount를 반환하세요.
    tips:
    - writestr은 디스크 파일 없이 메모리 문자열을 ZIP에 넣습니다.
    - read(name)는 bytes를 돌려주므로 utf-8 decode가 필요합니다.
    exercise:
      prompt: build_zip_manifest(entries)를 완성해 ZIP 생성 뒤 manifest와 내용 검증 결과를 반환하세요.
      starterCode: |-
        def build_zip_manifest(entries):
            raise NotImplementedError
      solution: |-
        def build_zip_manifest(entries):
            import tempfile
            import zipfile
            from pathlib import Path

            if not entries:
                raise ValueError("entries required")

            with tempfile.TemporaryDirectory() as workspace:
                archive = Path(workspace) / "bundle.zip"
                with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as zip_file:
                    for entry in entries:
                        zip_file.writestr(entry["name"], entry["body"])

                with zipfile.ZipFile(archive, "r") as zip_file:
                    names = sorted(zip_file.namelist())
                    contents = {
                        name: zip_file.read(name).decode("utf-8")
                        for name in names
                    }
                    total_size = sum(info.file_size for info in zip_file.infolist())

            return {
                "names": names,
                "contents": contents,
                "totalUncompressedBytes": total_size,
                "warnCount": sum(body.count("WARN") for body in contents.values()),
            }
      hints:
      - names는 정렬해서 반환하면 검증이 안정적입니다.
      - file_size는 압축 전 크기입니다.
    check:
      id: python.builtins.zipfile.manifest.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.zipfile.empty.behavior.v1.fixture
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
        entry: build_zip_manifest
        cases:
        - id: writes-and-reads-zip-manifest
          arguments:
          - value:
            - name: logs/a.log
              body: |
                INFO
                WARN
            - name: README.txt
              body: hello
          expectedReturn:
            names:
            - README.txt
            - logs/a.log
            contents:
              README.txt: hello
              logs/a.log: |
                INFO
                WARN
            totalUncompressedBytes: 15
            warnCount: 1
        - id: rejects-empty-entry-list
          arguments:
          - value: []
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 35_zipfile-safe-member-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - extract-all-safe
    - zip-read
    title: ZIP 멤버 이름을 추출 전에 안전/위험으로 분류하기
    subtitle: path traversal guard
    goal: 아카이브 멤버 이름 목록을 받아 절대 경로와 .. 경로를 위험 항목으로 분리하고 extractable 여부를 반환한다.
    why: 전이 과제에서는 ZIP을 읽는 기술을 외부 아카이브 방어로 옮깁니다. 추출하기 전에 이름을 거부해야 파일 시스템을 지킬 수 있습니다.
    explanation: classify_zip_members(names)를 완성해 safeNames, unsafeNames, extractable, unsafeCount를 반환하세요.
    tips:
    - ../escape.txt는 대상 폴더 밖으로 나가려는 path traversal입니다.
    - /absolute.txt처럼 절대 경로도 거부하세요.
    exercise:
      prompt: classify_zip_members(names)를 완성해 ZIP 멤버 이름의 path traversal 위험을 판정하세요.
      starterCode: |-
        def classify_zip_members(names):
            raise NotImplementedError
      solution: |-
        def classify_zip_members(names):
            from pathlib import PurePosixPath

            if not names:
                raise ValueError("names required")

            safe_names = []
            unsafe_names = []
            for name in names:
                path = PurePosixPath(name)
                if path.is_absolute() or ".." in path.parts:
                    unsafe_names.append(name)
                else:
                    safe_names.append(name)

            return {
                "safeNames": sorted(safe_names),
                "unsafeNames": sorted(unsafe_names),
                "unsafeCount": len(unsafe_names),
                "extractable": not unsafe_names,
            }
      hints:
      - ZIP 내부 경로는 POSIX 스타일이므로 PurePosixPath가 맞습니다.
      - 안전 항목이 하나라도 있더라도 위험 항목이 있으면 전체 추출은 막아야 합니다.
    check:
      id: python.builtins.zipfile.safe-member.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.zipfile.empty.behavior.v1.fixture
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
        entry: classify_zip_members
        cases:
        - id: separates-safe-and-unsafe-members
          arguments:
          - value:
            - readme.txt
            - data/items.txt
            - ../escape.txt
            - /absolute.txt
          expectedReturn:
            safeNames:
            - data/items.txt
            - readme.txt
            unsafeNames:
            - ../escape.txt
            - /absolute.txt
            unsafeCount: 2
            extractable: false
        - id: rejects-empty-name-list
          arguments:
          - value: []
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 35_zipfile-api-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 35_zipfile-safe-member-transfer
    title: ZIP과 tar.gz 작업별 표준 API 회상하기
    subtitle: ZipFile vs tarfile.open
    goal: archive_format과 operation을 받아 사용할 module, openMode, listingMethod, contentMethod를 반환한다.
    why: 시간이 지나도 남아야 할 아카이브 감각은 ZIP과 tar.gz가 비슷하지만 API 이름과 모드가 다르다는 점입니다.
    explanation: choose_archive_api(archive_format, operation)를 완성해 zip-read, zip-write, tar-gz-read, tar-gz-write 조합의 핵심
      API를 반환하세요.
    tips:
    - ZIP 목록은 namelist, tar 목록은 getnames입니다.
    - tar.gz 쓰기는 mode가 w:gz입니다.
    exercise:
      prompt: choose_archive_api(archive_format, operation)를 완성해 아카이브 형식별 표준 API 선택 결과를 반환하세요.
      starterCode: |-
        def choose_archive_api(archive_format, operation):
            raise NotImplementedError
      solution: |-
        def choose_archive_api(archive_format, operation):
            table = {
                ("zip", "read"): {
                    "module": "zipfile",
                    "openApi": "ZipFile",
                    "openMode": "r",
                    "listingMethod": "namelist",
                    "contentMethod": "read",
                },
                ("zip", "write"): {
                    "module": "zipfile",
                    "openApi": "ZipFile",
                    "openMode": "w",
                    "listingMethod": "namelist",
                    "contentMethod": "writestr",
                },
                ("tar.gz", "read"): {
                    "module": "tarfile",
                    "openApi": "open",
                    "openMode": "r:gz",
                    "listingMethod": "getnames",
                    "contentMethod": "extractfile",
                },
                ("tar.gz", "write"): {
                    "module": "tarfile",
                    "openApi": "open",
                    "openMode": "w:gz",
                    "listingMethod": "getnames",
                    "contentMethod": "addfile",
                },
            }
            key = (archive_format, operation)
            if key not in table:
                raise ValueError("unsupported archive operation")
            return table[key]
      hints:
      - zipfile.ZipFile은 class 이름이고 tarfile.open은 함수입니다.
      - contentMethod는 항목 내용을 실제로 넣거나 읽는 메서드입니다.
    check:
      id: python.builtins.zipfile.api-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.zipfile.empty.behavior.v1.fixture
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
        entry: choose_archive_api
        cases:
        - id: selects-zip-read-api
          arguments:
          - value: zip
          - value: read
          expectedReturn:
            module: zipfile
            openApi: ZipFile
            openMode: r
            listingMethod: namelist
            contentMethod: read
        - id: selects-targz-write-api
          arguments:
          - value: tar.gz
          - value: write
          expectedReturn:
            module: tarfile
            openApi: open
            openMode: w:gz
            listingMethod: getnames
            contentMethod: addfile
        - id: rejects-unsupported-format
          arguments:
          - value: rar
          - value: read
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