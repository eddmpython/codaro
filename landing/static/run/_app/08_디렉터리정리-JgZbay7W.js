var e=`meta:
  id: fileOps_08
  title: 디렉터리 정리
  order: 8
  category: fileOps
  difficulty: easy
  audience: 파일 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - pathlib
    - shutil
    - rules
intro:
  direction: 임시 폴더 안에서 확장자 규칙으로 파일을 분류하고 빈 폴더를 정리해 어수선한 다운로드 폴더를 자동으로 깨끗하게 만든다.
  benefits:
    - 확장자별 분류 규칙을 dict로 선언적으로 관리한다.
    - 정의되지 않은 확장자는 기타 폴더로 안전하게 모은다.
    - 자식이 사라진 빈 폴더는 한 번의 패스로 제거한다.
    - 모든 작업이 멱등하게 종료되도록 종합 정리 함수를 짠다.
  diagram:
    steps:
      - label: 분류 규칙 정의
        detail: 확장자와 대상 폴더를 dict로 묶어 분류 정책을 한 곳에 모은다.
      - label: 파일 분류 실행
        detail: rglob로 모든 파일을 훑어 규칙에 따라 shutil.move로 옮긴다.
      - label: 미지정 처리
        detail: 규칙에 없는 확장자는 _other 폴더로 모아 흔적이 사라지지 않게 한다.
      - label: 빈 폴더 회수
        detail: 정렬된 폴더 리스트를 거꾸로 돌며 자식이 없는 폴더를 rmdir로 정리한다.
    runtime:
      - label: 표준 라이브러리만
        detail: pathlib, shutil, tempfile만으로 정리 함수를 완성한다.
      - label: assert 기반 종합 검증
        detail: 정리 후 폴더 구조와 파일 위치를 assert로 비교한다.
sections:
  - id: rules-map
    title: 확장자 규칙 정의
    structuredPrimary: true
    subtitle: dict로 분류 정책 선언
    goal: 확장자와 대상 폴더를 한 dict로 정의해 분류 규칙을 코드 전체에서 일관되게 사용한다.
    why: 분류 규칙을 흩어 놓으면 새로운 확장자가 등장할 때 한 곳만 고치기 어렵기 때문에 한 dict로 모으는 편이 유지보수에 좋다.
    explanation: 'rules dict는 ".csv": "tabular" 같은 형태로 확장자에서 대상 폴더 이름으로 가는 매핑을 정의한다. lookup은 lower로 정규화한 확장자를 키로 사용해 대소문자에 흔들리지 않게 한다. 정의되지 않은 키는 기본값으로 처리한다.'
    tips:
      - 확장자를 항상 소문자로 정규화하면 사진 파일의 .JPG와 .jpg가 같은 폴더로 들어간다.
      - 정책을 함수 인자로 받으면 단위 테스트에서 다른 규칙을 쉽게 주입할 수 있다.
    snippet: |-
      rules = {".csv": "tabular", ".json": "tabular", ".png": "images", ".log": "logs"}


      def classify(suffix: str) -> str:
          return rules.get(suffix.lower(), "_other")


      assert classify(".CSV") == "tabular"
      assert classify(".PNG") == "images"
      assert classify(".xyz") == "_other"
      [classify(".CSV"), classify(".png"), classify(".xyz")]
    exercise:
      prompt: rules에 ".md"를 "notes"로 추가하고, classify(".MD")가 "notes"를 돌려주는지 검증하세요.
      starterCode: |-
        rules = {".csv": "tabular", ".json": "tabular", ".png": "images", ".log": "logs"}
        rules["___"] = "notes"


        def classify(suffix: str) -> str:
            return rules.get(suffix.___(), "_other")


        assert classify(".MD") == "notes"
        assert classify(".PNG") == "images"
        assert classify(".unknown") == "_other"
        [classify(".MD"), classify(".PNG"), classify(".unknown")]
      solution: |-
        rules = {".csv": "tabular", ".json": "tabular", ".png": "images", ".log": "logs"}
        rules[".md"] = "notes"


        def classify(suffix: str) -> str:
            return rules.get(suffix.lower(), "_other")


        assert classify(".MD") == "notes"
        assert classify(".PNG") == "images"
        assert classify(".unknown") == "_other"
        [classify(".MD"), classify(".PNG"), classify(".unknown")]
      hints:
        - 새 확장자 키를 추가할 때 점을 잊지 말고 소문자로 통일한다.
        - 인자로 받은 suffix는 lower 메서드로 정규화해야 대소문자가 같은 결과를 만든다.
      check:
        type: noError
        noError: rules dict 변경과 classify 호출 세 번이 모두 통과해야 한다.
        resultCheck: classify(".MD")가 "notes"이고 모르는 확장자는 "_other"여야 한다.
    check:
      noError: classify 함수 호출이 KeyError 없이 끝나야 한다.
      resultCheck: 정의된 확장자는 매핑 폴더로, 미정의는 "_other"로 분류되어야 한다.
  - id: classify-move
    title: 파일 분류 실행
    structuredPrimary: true
    subtitle: rglob + shutil.move
    goal: 다운로드 폴더 흉내 트리를 만들고 분류 규칙에 따라 파일을 대상 폴더로 옮긴다.
    why: 자동화의 핵심 단계는 한 함수에서 분류 정책과 이동을 함께 처리하면서 동일 입력에서 동일 결과를 보장하는 것이다.
    explanation: 분류 함수는 file 단위로 동작한다. 결과 폴더를 mkdir(parents=True, exist_ok=True)로 보장하고 shutil.move로 옮긴다. 정리 후 결과 dict는 어떤 파일이 어느 폴더로 갔는지 추적할 수 있도록 정렬된 리스트를 담는다.
    tips:
      - 이동 전에 대상 폴더가 없다면 mkdir로 만들어야 FileNotFoundError가 나지 않는다.
      - 결과를 정렬된 리스트로 모으면 다음 단계 자동화가 안정적으로 같은 순서를 받는다.
    snippet: |-
      import shutil
      import tempfile
      from pathlib import Path


      rules = {".csv": "tabular", ".json": "tabular", ".png": "images", ".log": "logs"}


      def organize(base: Path) -> dict:
          report = {"moved": []}
          for path in sorted(base.iterdir()):
              if not path.is_file():
                  continue
              target = base / rules.get(path.suffix.lower(), "_other")
              target.mkdir(parents=True, exist_ok=True)
              shutil.move(path, target / path.name)
              report["moved"].append(f"{path.name} -> {target.name}/{path.name}")
          return report


      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          (base / "data.csv").write_text("", encoding="utf-8")
          (base / "image.png").write_bytes(b"\\x89PNG")
          (base / "stale.log").write_text("", encoding="utf-8")
          report = organize(base)

      assert report == {"moved": [
          "data.csv -> tabular/data.csv",
          "image.png -> images/image.png",
          "stale.log -> logs/stale.log",
      ]}
      report
    exercise:
      prompt: '같은 base 폴더에 notes.md 파일을 추가하고 rules에 ".md": "notes"를 미리 정의한 뒤 organize가 notes/notes.md로 분류하는지 검증하세요.'
      starterCode: |-
        import shutil
        import tempfile
        from pathlib import Path


        rules = {".csv": "tabular", ".png": "images", "___": "notes"}


        def organize(base: Path) -> dict:
            report = {"moved": []}
            for path in sorted(base.iterdir()):
                if not path.is_file():
                    continue
                target = base / rules.get(path.suffix.lower(), "_other")
                target.mkdir(parents=True, exist_ok=True)
                shutil.move(path, target / path.name)
                report["moved"].append(f"{path.name} -> {target.name}/{path.name}")
            return report


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "data.csv").write_text("", encoding="utf-8")
            (base / "notes.md").write_text("# todo", encoding="utf-8")
            report = organize(base)

        assert report == {"moved": [
            "data.csv -> tabular/data.csv",
            "notes.md -> notes/notes.md",
        ]}
        report
      solution: |-
        import shutil
        import tempfile
        from pathlib import Path


        rules = {".csv": "tabular", ".png": "images", ".md": "notes"}


        def organize(base: Path) -> dict:
            report = {"moved": []}
            for path in sorted(base.iterdir()):
                if not path.is_file():
                    continue
                target = base / rules.get(path.suffix.lower(), "_other")
                target.mkdir(parents=True, exist_ok=True)
                shutil.move(path, target / path.name)
                report["moved"].append(f"{path.name} -> {target.name}/{path.name}")
            return report


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "data.csv").write_text("", encoding="utf-8")
            (base / "notes.md").write_text("# todo", encoding="utf-8")
            report = organize(base)

        assert report == {"moved": [
            "data.csv -> tabular/data.csv",
            "notes.md -> notes/notes.md",
        ]}
        report
      hints:
        - 새 확장자 키는 정확히 ".md" 형태로 점을 포함한다.
        - 정렬된 base.iterdir 순서로 인해 csv가 먼저 md가 뒤에 처리된다.
      check:
        type: noError
        noError: shutil.move 호출이 FileExistsError 없이 끝나야 한다.
        resultCheck: report.moved에 csv와 md 두 줄이 본문 순서대로 들어가야 한다.
    check:
      noError: organize 함수와 shutil.move 호출이 격리 공간에서 끝나야 한다.
      resultCheck: report.moved가 세 파일에 대해 분류 규칙대로의 결과 줄을 담아야 한다.
  - id: other-bucket
    title: 미지정 확장자 격리
    structuredPrimary: true
    subtitle: _other 폴더로 흔적 보존
    goal: 규칙에 없는 확장자는 _other 폴더로 모아 자동화 중 데이터가 사라지지 않게 한다.
    why: 새 확장자가 등장했을 때 정책을 업데이트하기 전까지도 사용자 파일이 사라지지 않게 만드는 것이 자동화 신뢰의 핵심이다.
    explanation: '분류 함수는 rules에 없는 확장자에 대해 기본값 "_other"를 사용한다. 운영 단계에서는 _other 폴더가 일정 크기 이상 쌓이면 알림을 띄워 규칙을 보강하면 된다. 이 패턴은 정책 업데이트 시점을 데이터를 잃지 않고 미룰 수 있게 해 준다.'
    tips:
      - '"_other"는 단순 이름이라 운영자가 폴더만 봐도 의미를 알 수 있다.'
      - 정기적으로 _other 폴더 크기를 모니터링하면 정책이 어디서 부족한지 알게 된다.
    snippet: |-
      import shutil
      import tempfile
      from pathlib import Path


      rules = {".csv": "tabular", ".log": "logs"}


      def organize(base: Path) -> dict:
          report = {"moved": []}
          for path in sorted(base.iterdir()):
              if not path.is_file():
                  continue
              target = base / rules.get(path.suffix.lower(), "_other")
              target.mkdir(parents=True, exist_ok=True)
              shutil.move(path, target / path.name)
              report["moved"].append(f"{path.name} -> {target.name}/{path.name}")
          return report


      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          (base / "metric.csv").write_text("", encoding="utf-8")
          (base / "stale.log").write_text("", encoding="utf-8")
          (base / "draft.docx").write_text("", encoding="utf-8")
          report = organize(base)
          structure = sorted(p.relative_to(base).as_posix() for p in base.rglob("*"))

      assert "_other/draft.docx" in structure
      assert "tabular/metric.csv" in structure
      assert "logs/stale.log" in structure
      structure
    exercise:
      prompt: 위 organize 함수에 mystery.bin 파일을 더해 _other 폴더에 mystery.bin이 모이는지 검증하세요.
      starterCode: |-
        import shutil
        import tempfile
        from pathlib import Path


        rules = {".csv": "tabular", ".log": "logs"}


        def organize(base: Path) -> dict:
            report = {"moved": []}
            for path in sorted(base.iterdir()):
                if not path.is_file():
                    continue
                target = base / rules.get(path.suffix.lower(), "___")
                target.mkdir(parents=True, exist_ok=True)
                shutil.move(path, target / path.name)
                report["moved"].append(f"{path.name} -> {target.name}/{path.name}")
            return report


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "metric.csv").write_text("", encoding="utf-8")
            (base / "mystery.bin").write_bytes(b"\\x00")
            report = organize(base)
            structure = sorted(p.relative_to(base).as_posix() for p in base.rglob("*"))

        assert "_other/mystery.bin" in structure
        assert "tabular/metric.csv" in structure
        structure
      solution: |-
        import shutil
        import tempfile
        from pathlib import Path


        rules = {".csv": "tabular", ".log": "logs"}


        def organize(base: Path) -> dict:
            report = {"moved": []}
            for path in sorted(base.iterdir()):
                if not path.is_file():
                    continue
                target = base / rules.get(path.suffix.lower(), "_other")
                target.mkdir(parents=True, exist_ok=True)
                shutil.move(path, target / path.name)
                report["moved"].append(f"{path.name} -> {target.name}/{path.name}")
            return report


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "metric.csv").write_text("", encoding="utf-8")
            (base / "mystery.bin").write_bytes(b"\\x00")
            report = organize(base)
            structure = sorted(p.relative_to(base).as_posix() for p in base.rglob("*"))

        assert "_other/mystery.bin" in structure
        assert "tabular/metric.csv" in structure
        structure
      hints:
        - rules.get의 두 번째 인자가 _other 문자열이어야 미지정 확장자를 보존한다.
        - structure는 새로 만든 두 폴더 모두를 정렬해 보여 줘야 한다.
      check:
        type: noError
        noError: organize 호출과 rglob 정렬이 격리 공간에서 끝나야 한다.
        resultCheck: structure 리스트가 _other와 tabular 두 경로를 모두 포함해야 한다.
    check:
      noError: 미지정 확장자 분류 흐름이 IOError 없이 끝나야 한다.
      resultCheck: _other 폴더에 draft.docx가 모이고 다른 파일은 각자 규칙 폴더로 이동해야 한다.
  - id: empty-folder-sweep
    title: 빈 폴더 회수 종합
    structuredPrimary: true
    subtitle: 정렬 역순으로 rmdir
    goal: 분류가 끝난 뒤 자식이 없는 폴더를 깔끔하게 제거해 종합 정리 결과가 명확해진다.
    why: 자동화 정리 흐름은 빈 폴더를 남기지 않아야 다음 사이클에서 새 폴더와 옛 폴더가 섞이지 않고 운영자가 폴더 트리만 봐도 상태를 알 수 있다.
    explanation: rglob 결과를 디렉터리만 골라 길이가 긴 경로부터 처리하면 깊은 폴더가 먼저 사라지고 상위 폴더가 자연스럽게 비워진다. Path.rmdir은 비어 있을 때만 동작하므로 안전하다. 마지막 종합 정리 함수는 organize 후 sweepEmpty를 호출해 한 사이클을 마무리한다.
    tips:
      - sorted를 reverse=True와 함께 쓰면 깊은 폴더가 먼저 처리된다.
      - rmdir은 비어 있지 않은 폴더에 대해 OSError를 일으키므로 try로 감싸도 좋다.
    snippet: |-
      import shutil
      import tempfile
      from pathlib import Path


      def sweepEmpty(base: Path) -> list[str]:
          removed = []
          for path in sorted(base.rglob("*"), key=lambda p: len(p.parts), reverse=True):
              if path.is_dir() and not any(path.iterdir()):
                  removed.append(path.relative_to(base).as_posix())
                  path.rmdir()
          return removed


      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          (base / "old" / "deep").mkdir(parents=True)
          (base / "keep").mkdir()
          (base / "keep" / "note.txt").write_text("", encoding="utf-8")
          removed = sweepEmpty(base)
          remaining = sorted(p.relative_to(base).as_posix() for p in base.rglob("*"))

      assert removed == ["old/deep", "old"]
      assert remaining == ["keep", "keep/note.txt"]
      {"removed": removed, "remaining": remaining}
    exercise:
      prompt: a/b/c와 a/d 폴더를 만든 뒤 빈 폴더 모두가 sweepEmpty에 의해 제거되어 remaining이 빈 리스트가 되는지 종합 검증하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path


        def sweepEmpty(base: Path) -> list[str]:
            removed = []
            for path in sorted(base.rglob("*"), key=lambda p: len(p.parts), reverse=___):
                if path.is_dir() and not any(path.iterdir()):
                    removed.append(path.relative_to(base).as_posix())
                    path.rmdir()
            return removed


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "a" / "b" / "c").mkdir(parents=True)
            (base / "a" / "d").mkdir()
            removed = sweepEmpty(base)
            remaining = sorted(p.relative_to(base).as_posix() for p in base.rglob("*"))

        assert removed == ["a/b/c", "a/b", "a/d", "a"]
        assert remaining == []
        {"removed": removed, "remaining": remaining}
      solution: |-
        import tempfile
        from pathlib import Path


        def sweepEmpty(base: Path) -> list[str]:
            removed = []
            for path in sorted(base.rglob("*"), key=lambda p: len(p.parts), reverse=True):
                if path.is_dir() and not any(path.iterdir()):
                    removed.append(path.relative_to(base).as_posix())
                    path.rmdir()
            return removed


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "a" / "b" / "c").mkdir(parents=True)
            (base / "a" / "d").mkdir()
            removed = sweepEmpty(base)
            remaining = sorted(p.relative_to(base).as_posix() for p in base.rglob("*"))

        assert removed == ["a/b/c", "a/b", "a/d", "a"]
        assert remaining == []
        {"removed": removed, "remaining": remaining}
      hints:
        - reverse=True를 주어야 가장 깊은 폴더부터 정리된다.
        - 모든 폴더가 비어 있으므로 a/b/c, a/b, a/d, a 순으로 제거된다.
      check:
        type: noError
        noError: sweepEmpty 함수 호출이 OSError 없이 끝나야 한다.
        resultCheck: removed 리스트가 네 폴더를 깊은 순서대로 담아야 한다.
    check:
      noError: sweepEmpty 호출 후 rglob가 종합 정리 결과를 그대로 반영해야 한다.
      resultCheck: remaining 리스트가 keep 폴더와 note.txt만 남긴 상태여야 한다.
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
  - id: fileOps_08-directory-organization-plan-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - rules-map
    - empty-folder-sweep
    title: 확장자 규칙으로 디렉터리 정리 dry-run 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 분류되지 않은 파일과 destination 충돌을 숨기지 않고 move plan을 만든다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 정리 계획은 항상 dry run으로 먼저 보여주고 destination 충돌을 차단하세요.
    - 분류되지 않은 확장자는 기타 폴더로 추측 이동하지 말고 남겨 두세요.
    exercise:
      prompt: plan_directory_organization(files, rules, existing_destinations)를 완성하세요.
      starterCode: |-
        def plan_directory_organization(files, rules, existing_destinations):
            raise NotImplementedError
      solution: |
        def plan_directory_organization(files, rules, existing_destinations):
            existing = set(existing_destinations)
            moves = []
            unclassified = []
            conflicts = []
            for file in files:
                suffix = file["suffix"].lower()
                category = rules.get(suffix)
                if not category:
                    unclassified.append(file["path"])
                    continue
                name = file["path"].rsplit("/", 1)[-1]
                destination = f"{category}/{name}"
                if destination in existing:
                    conflicts.append({"source": file["path"], "destination": destination})
                else:
                    moves.append({"source": file["path"], "destination": destination})
                    existing.add(destination)
            return {"ready": not conflicts, "moves": moves, "unclassified": unclassified, "conflicts": conflicts, "dryRun": True}
      hints: *id001
    check:
      id: python.fileops.fileOps_08.directory-organization-plan.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_08.directory-organization-plan.mastery.behavior.v1.fixture
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
        entry: plan_directory_organization
        cases:
        - id: plans-classified-moves
          arguments:
          - value:
            - path: /in/a.PDF
              suffix: .PDF
            - path: /in/b.jpg
              suffix: .jpg
          - value:
              .pdf: docs
              .jpg: images
          - value: []
          expectedReturn:
            ready: true
            moves:
            - source: /in/a.PDF
              destination: docs/a.PDF
            - source: /in/b.jpg
              destination: images/b.jpg
            unclassified: []
            conflicts: []
            dryRun: true
        - id: reports-unclassified-file
          arguments:
          - value:
            - path: /in/a.bin
              suffix: .bin
          - value:
              .txt: text
          - value: []
          expectedReturn:
            ready: true
            moves: []
            unclassified:
            - /in/a.bin
            conflicts: []
            dryRun: true
        - id: reports-destination-conflict
          arguments:
          - value:
            - path: /in/a.txt
              suffix: .txt
          - value:
              .txt: text
          - value:
            - text/a.txt
          expectedReturn:
            ready: false
            moves: []
            unclassified: []
            conflicts:
            - source: /in/a.txt
              destination: text/a.txt
            dryRun: true
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: fileOps_08-organization-result-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - fileOps_08-directory-organization-plan-mastery
    title: 새 디렉터리 정리 결과에 move reconciliation 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 계획된 source·destination 쌍과 실제 artifact를 정확히 대조한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 파일 수만 비교하지 말고 source·destination·hash 쌍을 reconcile하세요.
    - 계획에 없던 이동도 unexpected artifact로 실패시키세요.
    exercise:
      prompt: audit_organization_result(planned, observed)를 완성하세요.
      starterCode: |-
        def audit_organization_result(planned, observed):
            raise NotImplementedError
      solution: |
        def audit_organization_result(planned, observed):
            planned_ids = {(item["source"], item["destination"], item["hash"]) for item in planned}
            observed_ids = {(item["source"], item["destination"], item["hash"]) for item in observed}
            missing = sorted([list(item) for item in planned_ids - observed_ids])
            unexpected = sorted([list(item) for item in observed_ids - planned_ids])
            return {"passed": not missing and not unexpected, "missing": missing, "unexpected": unexpected, "plannedCount": len(planned_ids), "observedCount": len(observed_ids)}
      hints: *id002
    check:
      id: python.fileops.fileOps_08.organization-result-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_08.organization-result-audit.transfer.behavior.v1.fixture
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
        entry: audit_organization_result
        cases:
        - id: accepts-exact-observation
          arguments:
          - value:
            - source: a
              destination: docs/a
              hash: x
          - value:
            - source: a
              destination: docs/a
              hash: x
          expectedReturn:
            passed: true
            missing: []
            unexpected: []
            plannedCount: 1
            observedCount: 1
        - id: reports-missing-and-unexpected
          arguments:
          - value:
            - source: a
              destination: docs/a
              hash: x
          - value:
            - source: b
              destination: docs/b
              hash: y
          expectedReturn:
            passed: false
            missing:
            - - a
              - docs/a
              - x
            unexpected:
            - - b
              - docs/b
              - y
            plannedCount: 1
            observedCount: 1
        - id: handles-empty-plan
          arguments:
          - value: []
          - value: []
          expectedReturn:
            passed: true
            missing: []
            unexpected: []
            plannedCount: 0
            observedCount: 0
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: fileOps_08-directory-organization-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - fileOps_08-organization-result-audit-transfer
    title: 디렉터리 정리 품질 기준 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 분류·충돌·dry run·reconciliation 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 파일 action 전에 root·충돌·dry run 계약을 확인하세요.
    - 실행 횟수가 아니라 source와 destination artifact identity로 결과를 판정하세요.
    exercise:
      prompt: choose_organization_gate(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_organization_gate(situation):
            raise NotImplementedError
      solution: |
        def choose_organization_gate(situation):
            table = {'classify': {'action': 'apply explicit suffix rules', 'evidence': 'classified and unclassified lists', 'risk': 'guessed category'}, 'plan': {'action': 'detect destination conflicts in dry run', 'evidence': 'move plan', 'risk': 'overwrite'}, 'verify': {'action': 'reconcile source destination hash', 'evidence': 'artifact pairs', 'risk': 'partial organization'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.fileops.fileOps_08.directory-organization-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_08.directory-organization-recall.retrieval.behavior.v1.fixture
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
        entry: choose_organization_gate
        cases:
        - id: recalls-classify
          arguments:
          - value: classify
          expectedReturn:
            action: apply explicit suffix rules
            evidence: classified and unclassified lists
            risk: guessed category
        - id: recalls-plan
          arguments:
          - value: plan
          expectedReturn:
            action: detect destination conflicts in dry run
            evidence: move plan
            risk: overwrite
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};