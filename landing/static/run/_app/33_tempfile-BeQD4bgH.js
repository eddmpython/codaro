var e=`meta:\r
  id: '33'\r
  title: tempfile\r
  day: 33\r
  category: builtins\r
  tags:\r
  - tempfile\r
  - TemporaryDirectory\r
  - NamedTemporaryFile\r
  - 안전한IO\r
  - 학습실습\r
  seo:\r
    title: 파이썬 tempfile 표준 라이브러리 - 임시 파일·디렉터리 안전 사용\r
    description: TemporaryDirectory, NamedTemporaryFile, mkdtemp, mkstemp 차이와 자동 정리 패턴.\r
    keywords:\r
    - tempfile\r
    - TemporaryDirectory\r
    - NamedTemporaryFile\r
    - mkdtemp\r
    - 자동 정리\r
intro:\r
  emoji: 🗃\r
  points:\r
  - TemporaryDirectory로 컨텍스트 단위 임시 폴더 만들기\r
  - NamedTemporaryFile로 임시 파일 + 자동 삭제\r
  - mkstemp/mkdtemp로 명시적 라이프사이클 다루기\r
  - delete=False와 try/finally 패턴\r
  - 안전한 학습 실습/테스트 IO 패턴\r
  direction: tempfile에서 자원 정리가 보장된 임시 파일·디렉터리를 만들어 실습/테스트 IO가 워크스페이스를 더럽히지 않도록 합니다.\r
  benefits:\r
  - 학습 실습이 저장소 루트나 사용자 폴더를 더럽히지 않게 합니다.\r
  - 테스트 데이터를 격리된 임시 폴더에서 생성·검증·정리합니다.\r
  - 임시 파일의 자동 삭제와 명시 정리 두 패턴을 선택할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 작업 분류 입력 확인\r
      detail: 한 함수 안에서 끝나는 작업인지(컨텍스트) 또는 라이프사이클이 긴지(mk*) 먼저 판단합니다.\r
    - label: tempfile 호출 처리 실행\r
      detail: TemporaryDirectory/NamedTemporaryFile을 with 문에서 사용하거나 mkdtemp/mkstemp로 명시 생성합니다.\r
    - label: 정리 결과 검증\r
      detail: with 블록 종료 후 폴더/파일이 정말 삭제되었는지 확인합니다.\r
    - label: tempfile 패턴 재사용\r
      detail: 같은 패턴을 단위 테스트와 학습 실습에 그대로 붙입니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: tempfile과 pathlib만 사용해 추가 패키지 없이 실행합니다.\r
    - label: tempfile 실행\r
      detail: 셀을 실행해 임시 자원 생성/사용/정리 흐름을 확인합니다.\r
    - label: tempfile 완료\r
      detail: 검증된 패턴을 IO 실습 유틸리티로 남깁니다.\r
sections:\r
- id: temp-directory\r
  title: TemporaryDirectory로 컨텍스트 단위 폴더\r
  structuredPrimary: true\r
  subtitle: with 블록 종료 시 자동 삭제\r
  goal: tempfile.TemporaryDirectory로 임시 폴더를 만들고 with 블록 종료 후 폴더가 자동으로 삭제됨을 확인합니다.\r
  why: 학습 실습이나 테스트가 만든 파일을 사용자 작업 폴더에 흘리면 정리가 어렵고 root-clean 게이트가 깨집니다. 임시 폴더는 정리 비용을 0으로 만듭니다.\r
  explanation: TemporaryDirectory는 OS 임시 폴더 안에 고유 이름의 디렉터리를 만들고 with 종료 시 트리 전체를 삭제합니다. 폴더 경로는 with as 절로 받습니다. Path로 감싸 사용하면 자식 파일 경로를 깔끔하게 조합할 수 있습니다.\r
  tips:\r
  - with 블록 안에서만 폴더가 존재합니다. 블록 바깥에서 경로를 참조하면 FileNotFoundError가 납니다.\r
  - 같은 폴더 경로를 자식 프로세스에 넘기는 경우에는 mkdtemp로 명시 라이프사이클이 더 안전합니다.\r
  snippet: |-\r
    import tempfile\r
    from pathlib import Path\r
\r
    with tempfile.TemporaryDirectory() as workspace:\r
        root = Path(workspace)\r
        (root / "input.txt").write_text("hello", encoding="utf-8")\r
        (root / "result.txt").write_text("ok", encoding="utf-8")\r
        snapshot = sorted(p.name for p in root.iterdir())\r
\r
    cleanedUp = not Path(workspace).exists()\r
    {"snapshot": snapshot, "cleanedUp": cleanedUp}\r
  exercise:\r
    prompt: TemporaryDirectory 안에 하위 폴더 sub와 그 안의 파일을 만들고 with 종료 후 root.exists()가 False인지 검증하세요.\r
    starterCode: |-\r
      import tempfile\r
      from pathlib import Path\r
\r
      with tempfile.TemporaryDirectory() as workspace:\r
          root = Path(workspace)\r
          subDir = root / "sub"\r
          subDir.mkdir()\r
          (subDir / "note.txt").write_text("nested", encoding="utf-8")\r
          nestedExists = (subDir / "note.txt").exists()\r
\r
      cleanedUp = not root.exists()\r
      {"nestedExists": nestedExists, "cleanedUp": cleanedUp}\r
    hints:\r
    - mkdir로 하위 폴더를 만든 뒤 write_text로 파일을 씁니다.\r
    - with 종료 시 트리 전체가 삭제되므로 root.exists()는 False입니다.\r
  check:\r
    type: noError\r
    noError: TemporaryDirectory와 Path 조합이 NameError나 FileNotFoundError 없이 실행되어야 합니다.\r
    resultCheck: nestedExists가 True이고 cleanedUp이 True여야 with 블록 안에서는 파일이 있고 종료 후 삭제된 것입니다.\r
- id: named-temp-file\r
  title: NamedTemporaryFile로 임시 파일\r
  structuredPrimary: true\r
  subtitle: 이름이 있는 임시 파일과 자동 정리\r
  goal: NamedTemporaryFile로 임시 파일을 만들어 외부 프로세스나 다른 함수에 경로를 넘기는 흐름을 확인합니다.\r
  why: 외부 명령(subprocess) 같은 코드는 파일 경로를 요구합니다. NamedTemporaryFile은 이름이 있는 임시 파일을 보장하면서 정리도 자동으로 처리합니다.\r
  explanation: 'NamedTemporaryFile(mode="w+", delete=True, suffix=".log")로 파일을 만들면 with 블록 종료 시 자동 삭제됩니다. delete=False로 두면 호출자가 명시적으로 unlink해야 합니다(Windows에서는 다른 프로세스가 동시에 열어야 할 때 필요).'\r
  tips:\r
  - Windows에서 다른 프로세스가 동시에 같은 파일을 열려면 delete=False가 필요한 경우가 있습니다.\r
  - mode와 encoding을 명시하면 텍스트 IO가 안전합니다.\r
  snippet: |-\r
    import tempfile\r
    from pathlib import Path\r
\r
    with tempfile.NamedTemporaryFile(mode="w+", delete=True, suffix=".log", encoding="utf-8") as handle:\r
        handle.write("line 1\\n")\r
        handle.write("line 2\\n")\r
        handle.flush()\r
        handle.seek(0)\r
        readBack = handle.read().splitlines()\r
        path = Path(handle.name)\r
        existsDuring = path.exists()\r
\r
    cleanedUp = not path.exists()\r
    {"readBack": readBack, "existsDuring": existsDuring, "cleanedUp": cleanedUp}\r
  exercise:\r
    prompt: delete=False로 임시 파일을 만들고 with 종료 후에도 파일이 남는지 확인한 뒤 명시적으로 unlink하세요.\r
    starterCode: |-\r
      import tempfile\r
      from pathlib import Path\r
\r
      with tempfile.NamedTemporaryFile(mode="w+", delete=False, suffix=".log", encoding="utf-8") as handle:\r
          handle.write("persist after block\\n")\r
          path = Path(handle.name)\r
\r
      existsAfterBlock = path.exists()\r
      path.unlink()\r
      cleanedUp = not path.exists()\r
      {"existsAfterBlock": existsAfterBlock, "cleanedUp": cleanedUp}\r
    hints:\r
    - delete=False로 두면 with 종료 후에도 파일이 남습니다.\r
    - 호출자가 unlink로 명시 삭제해야 정리가 끝납니다.\r
  check:\r
    noError: NamedTemporaryFile과 Path.unlink가 NameError나 FileNotFoundError 없이 실행되어야 합니다.\r
    resultCheck: existsAfterBlock이 True이고 cleanedUp이 True여야 delete=False의 의도와 명시 정리가 맞는 것입니다.\r
- id: mkdtemp-mkstemp\r
  title: mkdtemp / mkstemp로 명시 라이프사이클\r
  structuredPrimary: true\r
  subtitle: with 컨텍스트가 맞지 않는 경우의 대안\r
  goal: mkdtemp와 mkstemp로 임시 자원을 만들어 호출자가 정리 시점을 직접 제어하는 흐름을 확인합니다.\r
  why: 자원 라이프사이클이 한 함수 호출 범위를 넘어서면(예 - 서버 시작 시 임시 폴더 생성, 종료 시 정리) with 블록이 맞지 않습니다. mk* 함수가 그 경우의 표준 도구입니다.\r
  explanation: 'tempfile.mkdtemp(prefix=...)는 임시 폴더 경로를 문자열로 돌려주고 호출자가 shutil.rmtree로 정리합니다. tempfile.mkstemp(suffix=...)는 (fd, path) 튜플을 돌려주고, fd를 os.close로 닫고 path를 os.unlink로 정리합니다. try/finally가 표준 패턴입니다.'\r
  tips:\r
  - mk* 함수는 자동 정리가 없습니다. try/finally를 잊으면 임시 자원이 누적됩니다.\r
  - prefix 인자로 디버깅 가독성을 높일 수 있습니다(예 - codaro_test_).\r
  snippet: |-\r
    import os\r
    import shutil\r
    import tempfile\r
    from pathlib import Path\r
\r
    workspace = tempfile.mkdtemp(prefix="codaro_demo_")\r
    try:\r
        target = Path(workspace) / "note.txt"\r
        target.write_text("manual cleanup", encoding="utf-8")\r
        existsDuring = target.exists()\r
    finally:\r
        shutil.rmtree(workspace)\r
\r
    cleanedUp = not Path(workspace).exists()\r
    {"existsDuring": existsDuring, "cleanedUp": cleanedUp, "prefixMatched": "codaro_demo_" in workspace}\r
  exercise:\r
    prompt: mkstemp로 임시 파일을 만들어 fd로 한 줄을 쓰고 os.close + os.unlink로 명시 정리하는 흐름을 만들어 보세요.\r
    starterCode: |-\r
      import os\r
      import tempfile\r
\r
      fd, path = tempfile.mkstemp(suffix=".tmp", prefix="codaro_")\r
      try:\r
          with os.fdopen(fd, mode="w", encoding="utf-8") as handle:\r
              handle.write("manual fd write\\n")\r
          existsDuring = os.path.exists(path)\r
      finally:\r
          os.unlink(path)\r
\r
      cleanedUp = not os.path.exists(path)\r
      {"existsDuring": existsDuring, "cleanedUp": cleanedUp}\r
    hints:\r
    - os.fdopen으로 fd를 파이썬 파일 객체로 감싸면 with 블록을 쓸 수 있습니다.\r
    - try/finally가 없으면 예외 경로에서 파일이 남습니다.\r
  check:\r
    noError: mkstemp와 os.fdopen 호출이 NameError나 OSError 없이 실행되어야 합니다.\r
    resultCheck: existsDuring이 True이고 cleanedUp이 True여야 명시 라이프사이클 패턴이 동작하는 것입니다.\r
- id: failure-cleanup\r
  title: 예외 경로의 정리 보장\r
  structuredPrimary: true\r
  subtitle: 작업 실패해도 자원 누수 없이\r
  goal: with 블록 안에서 의도적으로 예외를 발생시키고도 임시 자원이 정리되는 흐름을 확인합니다.\r
  why: 자동화 코드의 실패 경로가 임시 자원을 누적시키면 디스크가 가득 차거나 후속 실행이 더러워집니다. 컨텍스트 매니저의 예외 안전성을 코드로 확인해야 안심할 수 있습니다.\r
  explanation: TemporaryDirectory와 NamedTemporaryFile의 __exit__는 with 블록 안 예외와 무관하게 자원을 정리합니다. mkdtemp/mkstemp 패턴은 try/finally로 같은 보장을 만듭니다. 두 패턴 모두 호출자가 예외를 잡고 보고하는 분리된 책임을 가져야 합니다.\r
  tips:\r
  - 컨텍스트 매니저의 정리 코드는 예외 경로에서도 항상 실행됩니다.\r
  - mk* 패턴은 try/finally 안의 정리 코드 자체가 실패할 수 있으므로 좁힌 except로 로깅을 권장합니다.\r
  snippet: |-\r
    import tempfile\r
    from pathlib import Path\r
\r
    capturedPath = None\r
    raised = None\r
    try:\r
        with tempfile.TemporaryDirectory() as workspace:\r
            capturedPath = Path(workspace)\r
            (capturedPath / "partial.txt").write_text("started", encoding="utf-8")\r
            raise RuntimeError("simulated failure")\r
    except RuntimeError as exc:\r
        raised = str(exc)\r
\r
    cleanedUpAfterError = not capturedPath.exists()\r
    {"raised": raised, "cleanedUpAfterError": cleanedUpAfterError}\r
  exercise:\r
    prompt: mkdtemp 패턴에 try/finally를 적용하고 예외가 발생해도 폴더가 정리되는지, finally가 빠진 경우와 비교하세요.\r
    starterCode: |-\r
      import shutil\r
      import tempfile\r
      from pathlib import Path\r
\r
      workspace = tempfile.mkdtemp(prefix="codaro_fail_")\r
      capturedPath = Path(workspace)\r
      raised = None\r
      try:\r
          (capturedPath / "partial.txt").write_text("started", encoding="utf-8")\r
          raise RuntimeError("simulated failure")\r
      except RuntimeError as exc:\r
          raised = str(exc)\r
      finally:\r
          shutil.rmtree(workspace, ignore_errors=True)\r
\r
      cleanedUpAfterError = not capturedPath.exists()\r
      {"raised": raised, "cleanedUpAfterError": cleanedUpAfterError}\r
    hints:\r
    - try 본문에서 예외가 나도 finally가 실행됩니다.\r
    - shutil.rmtree(ignore_errors=True)는 부분적으로 만들어진 폴더도 안전하게 정리합니다.\r
  check:\r
    type: noError\r
    noError: TemporaryDirectory와 try/finally가 NameError나 OSError 없이 실행되어야 합니다.\r
    resultCheck: raised가 simulated failure이고 cleanedUpAfterError가 True여야 예외 안전성이 보장된 것입니다.\r
- id: practice-pattern\r
  title: 학습 실습/테스트의 표준 IO 패턴\r
  structuredPrimary: true\r
  subtitle: 워크스페이스를 더럽히지 않는 작업 흐름\r
  goal: 학습 실습/단위 테스트에서 표준이 되는 tempfile + Path 조합 패턴을 적용해 입력 준비, 작업 실행, 결과 검증을 한 자리에 모읍니다.\r
  why: 저장소 루트와 사용자 폴더를 깨끗하게 유지하는 것이 자동화/학습 도구의 기본 전제입니다. 임시 자원 안에서 입력 준비와 검증까지 끝내면 사고를 사전에 막을 수 있습니다.\r
  explanation: 입력 데이터를 TemporaryDirectory 안에 쓰고, 처리 함수를 호출하고, 결과 파일을 같은 폴더에서 검증합니다. 호출자가 결과를 호출 결과로 받아 들이면 with 블록 종료 후 폴더는 자동으로 정리됩니다.\r
  tips:\r
  - 입력/출력 폴더를 분리하지 않고 한 폴더에서 단계별 파일 이름으로 구분하는 것도 가능합니다.\r
  - 결과 데이터를 함수 반환으로 호출자에 노출하면 with 종료 후에도 검증할 수 있습니다.\r
  snippet: |-\r
    import tempfile\r
    from pathlib import Path\r
\r
    def summarizeLog(rootPath, logName):\r
        logPath = rootPath / logName\r
        lines = logPath.read_text(encoding="utf-8").splitlines()\r
        warnings = sum(1 for line in lines if "WARN" in line)\r
        errors = sum(1 for line in lines if "ERROR" in line)\r
        return {"warnings": warnings, "errors": errors, "total": len(lines)}\r
\r
    with tempfile.TemporaryDirectory() as workspace:\r
        root = Path(workspace)\r
        (root / "today.log").write_text("INFO ok\\nWARN slow\\nERROR boom\\nINFO done\\n", encoding="utf-8")\r
        summary = summarizeLog(root, "today.log")\r
\r
    summary\r
  exercise:\r
    prompt: 같은 패턴으로 두 로그 파일(yesterday.log, today.log)을 만들고, 두 파일을 합쳐 처리한 결과 dict를 돌려주는 흐름을 만들어 보세요.\r
    starterCode: |-\r
      import tempfile\r
      from pathlib import Path\r
\r
      def summarizeAll(rootPath):\r
          totals = {"warnings": 0, "errors": 0, "total": 0}\r
          for logPath in sorted(rootPath.glob("*.log")):\r
              lines = logPath.read_text(encoding="utf-8").splitlines()\r
              totals["warnings"] += sum(1 for line in lines if "WARN" in line)\r
              totals["errors"] += sum(1 for line in lines if "ERROR" in line)\r
              totals["total"] += len(lines)\r
          return totals\r
\r
      with tempfile.TemporaryDirectory() as workspace:\r
          root = Path(workspace)\r
          (root / "yesterday.log").write_text("INFO\\nERROR x\\n", encoding="utf-8")\r
          (root / "today.log").write_text("WARN y\\nWARN z\\nINFO ok\\n", encoding="utf-8")\r
          summary = summarizeAll(root)\r
\r
      summary\r
    hints:\r
    - glob으로 같은 패턴의 파일을 한 번에 모읍니다.\r
    - 결과 dict를 함수 반환으로 받아두면 with 종료 후에도 검증할 수 있습니다.\r
  check:
    type: noError
    noError: summarizeAll과 TemporaryDirectory 조합이 NameError나 FileNotFoundError 없이 실행되어야 합니다.
    resultCheck: summary가 warnings 2, errors 1, total 5를 정확히 담아야 두 파일이 합쳐 처리된 것입니다.
assessment:
  masteryVariants:
  - id: 33_tempfile-workspace-cleanup-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - temp-directory
    - practice-pattern
    title: TemporaryDirectory 안에서 로그를 처리하고 cleanup 증명하기
    subtitle: isolated workspace
    goal: TemporaryDirectory에 입력 파일과 summary 파일을 만들고 with 종료 후 임시 폴더가 삭제되었는지 반환한다.
    why: tempfile의 숙달 기준은 파일을 만들었다가 아니라, 학습/테스트 IO가 저장소 밖 격리 공간에서 끝나고 흔적이 남지 않는 것입니다.
    explanation: summarize_log_in_temp_workspace(log_text)를 완성해 임시 폴더 안에서 로그를 집계하고 filesDuring, summary, cleanedUpAfterBlock을 반환하세요.
    tips:
    - with 블록 안에서만 root.iterdir()를 호출하세요.
    - with 종료 뒤에는 Path(workspace).exists()가 False여야 합니다.
    exercise:
      prompt: summarize_log_in_temp_workspace(log_text)를 완성해 임시 workspace에서 로그를 처리하고 cleanup 여부를 반환하세요.
      starterCode: |-
        def summarize_log_in_temp_workspace(log_text):
            raise NotImplementedError
      solution: |-
        def summarize_log_in_temp_workspace(log_text):
            import tempfile
            from pathlib import Path

            if not log_text.strip():
                raise ValueError("log_text required")

            with tempfile.TemporaryDirectory() as workspace:
                root = Path(workspace)
                log_path = root / "input.log"
                summary_path = root / "summary.txt"
                log_path.write_text(log_text, encoding="utf-8")
                lines = log_path.read_text(encoding="utf-8").splitlines()
                summary = {
                    "warnings": sum(1 for line in lines if "WARN" in line),
                    "errors": sum(1 for line in lines if "ERROR" in line),
                    "total": len(lines),
                }
                summary_path.write_text(str(summary), encoding="utf-8")
                files_during = sorted(path.name for path in root.iterdir())
                root_exists_during = root.exists()

            return {
                "summary": summary,
                "filesDuring": files_during,
                "rootExistsDuring": root_exists_during,
                "cleanedUpAfterBlock": not Path(workspace).exists(),
            }
      hints:
      - summary는 with 안에서 계산하고 반환값에 저장해 두세요.
      - cleanup 확인은 with 바깥에서 해야 합니다.
    check:
      id: python.builtins.tempfile.workspace-cleanup.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.tempfile.empty.behavior.v1.fixture
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
        entry: summarize_log_in_temp_workspace
        cases:
        - id: summarizes-and-cleans-temp-workspace
          arguments:
          - value: "INFO start\\nWARN slow\\nERROR boom\\nINFO done\\n"
          expectedReturn:
            summary:
              warnings: 1
              errors: 1
              total: 4
            filesDuring:
            - input.log
            - summary.txt
            rootExistsDuring: true
            cleanedUpAfterBlock: true
        - id: rejects-empty-log-text
          arguments:
          - value: "   "
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 33_tempfile-named-file-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - named-temp-file
    - failure-cleanup
    title: delete=False 임시 파일을 명시적으로 정리하기
    subtitle: named file lifecycle
    goal: NamedTemporaryFile(delete=False)로 경로가 필요한 임시 파일을 만들고 with 종료 후 직접 unlink해 정리 여부를 반환한다.
    why: 전이 과제에서는 자동 삭제 파일에서 외부 도구가 경로를 필요로 하는 흐름으로 옮깁니다. 이때 호출자가 cleanup 책임을 져야 합니다.
    explanation: write_named_temp_then_cleanup(contents, suffix=".log")를 완성해 파일을 쓰고, with 이후 존재 여부를 확인한 뒤 unlink로 정리하세요.
    tips:
    - delete=False는 with 종료 후 파일이 남습니다.
    - cleanup은 finally나 명시 unlink로 끝까지 보장해야 합니다.
    exercise:
      prompt: write_named_temp_then_cleanup(contents, suffix=".log")를 완성해 delete=False 파일의 명시 정리 결과를 반환하세요.
      starterCode: |-
        def write_named_temp_then_cleanup(contents, suffix=".log"):
            raise NotImplementedError
      solution: |-
        def write_named_temp_then_cleanup(contents, suffix=".log"):
            import tempfile
            from pathlib import Path

            if not suffix.startswith("."):
                raise ValueError("suffix must start with dot")

            path = None
            try:
                with tempfile.NamedTemporaryFile(mode="w+", delete=False, suffix=suffix, encoding="utf-8") as handle:
                    handle.write(contents)
                    handle.flush()
                    handle.seek(0)
                    read_back = handle.read().splitlines()
                    path = Path(handle.name)
                exists_after_block = path.exists()
                suffix_matched = path.name.endswith(suffix)
                return {
                    "readBack": read_back,
                    "existsAfterBlock": exists_after_block,
                    "suffixMatched": suffix_matched,
                    "cleanedUp": cleanup_temp_path(path),
                }
            finally:
                if path is not None and path.exists():
                    path.unlink()

        def cleanup_temp_path(path):
            path.unlink()
            return not path.exists()
      hints:
      - read_back은 with 안에서 읽어 두세요.
      - finally는 반환 중간에 예외가 나도 파일이 남지 않게 합니다.
    check:
      id: python.builtins.tempfile.named-file.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.tempfile.empty.behavior.v1.fixture
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
        entry: write_named_temp_then_cleanup
        cases:
        - id: writes-reads-and-unlinks-named-temp-file
          arguments:
          - value: "alpha\\nbeta\\n"
          - value: .trace
          expectedReturn:
            readBack:
            - alpha
            - beta
            existsAfterBlock: true
            suffixMatched: true
            cleanedUp: true
        - id: rejects-suffix-without-dot
          arguments:
          - value: data
          - value: log
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 33_tempfile-strategy-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - temp-directory
    - named-temp-file
    - mkdtemp-mkstemp
    title: 임시 자원 목적에 맞는 tempfile 도구 회상하기
    subtitle: auto cleanup vs manual lifecycle
    goal: 작업 범위와 경로 필요 여부를 받아 TemporaryDirectory, NamedTemporaryFile, mkdtemp 중 맞는 전략을 반환한다.
    why: 시간이 지나도 남아야 할 tempfile 감각은 자동 정리가 필요한지, 이름 있는 파일이 필요한지, 수명이 with 블록을 넘는지를 구분하는 것입니다.
    explanation: choose_tempfile_strategy(scope, needs_path) 를 완성해 with-block, named-file, long-lived-dir 상황별 도구와 cleanup 주체를 반환하세요.
    tips:
    - 한 함수 안에서 끝나는 폴더 작업은 TemporaryDirectory가 기본입니다.
    - with 블록 밖까지 살아야 하는 디렉터리는 mkdtemp와 명시 cleanup이 필요합니다.
    exercise:
      prompt: choose_tempfile_strategy(scope, needs_path)를 완성해 임시 자원 전략과 cleanup 책임을 반환하세요.
      starterCode: |-
        def choose_tempfile_strategy(scope, needs_path):
            raise NotImplementedError
      solution: |-
        def choose_tempfile_strategy(scope, needs_path):
            if scope == "long-lived-dir":
                return {
                    "tool": "mkdtemp",
                    "autoCleanup": False,
                    "cleanupOwner": "caller",
                    "reason": "lifecycle crosses one with block",
                }
            if scope == "single-file" and needs_path:
                return {
                    "tool": "NamedTemporaryFile",
                    "autoCleanup": True,
                    "cleanupOwner": "context-manager",
                    "reason": "file path is needed during one block",
                }
            if scope == "with-block":
                return {
                    "tool": "TemporaryDirectory",
                    "autoCleanup": True,
                    "cleanupOwner": "context-manager",
                    "reason": "isolated workspace ends inside one block",
                }
            raise ValueError("unknown tempfile strategy")
      hints:
      - needs_path는 파일 경로를 다른 함수나 외부 도구에 넘기는지 판단하는 신호입니다.
      - mkdtemp는 자동 정리가 없다는 점을 반환값에 드러내세요.
    check:
      id: python.builtins.tempfile.strategy.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.tempfile.empty.behavior.v1.fixture
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
        entry: choose_tempfile_strategy
        cases:
        - id: selects-manual-cleanup-for-long-lived-dir
          arguments:
          - value: long-lived-dir
          - value: true
          expectedReturn:
            tool: mkdtemp
            autoCleanup: false
            cleanupOwner: caller
            reason: lifecycle crosses one with block
        - id: selects-context-managed-named-file
          arguments:
          - value: single-file
          - value: true
          expectedReturn:
            tool: NamedTemporaryFile
            autoCleanup: true
            cleanupOwner: context-manager
            reason: file path is needed during one block
        - id: rejects-unknown-strategy
          arguments:
          - value: permanent-output
          - value: false
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};