var e=`meta:
  id: fileOps_03
  title: 디렉터리 탐색과 필터
  order: 3
  category: fileOps
  difficulty: easy
  audience: 파일 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - pathlib
    - rglob
    - iterdir
intro:
  direction: tempfile 격리 공간에 가짜 폴더 트리를 만들고 iterdir, rglob, 패턴 필터로 필요한 파일만 골라낸다.
  benefits:
    - iterdir로 한 단계 자식만 빠르게 살핀다.
    - rglob과 glob 패턴으로 다단계 폴더를 한 번에 훑는다.
    - 확장자 또는 이름 패턴으로 자동화 대상만 선별한다.
    - 결과를 정렬해 다음 단계가 안정적인 순서로 동작하게 한다.
  diagram:
    steps:
      - label: 가짜 폴더 트리 구축
        detail: mkdir(parents=True)와 write_text로 다단계 입력을 격리된 폴더에 만든다.
      - label: 한 단계 자식 살피기
        detail: Path.iterdir로 첫 단계 자식만 받아 이름을 정렬한다.
      - label: 다단계 패턴 탐색
        detail: Path.rglob에 *.csv 같은 패턴을 넘겨 깊이 무관하게 매칭한다.
      - label: 종합 결과 표준화
        detail: 같은 폴더에서 두 가지 패턴을 모은 결과 dict로 자동화 입력을 만든다.
    runtime:
      - label: 표준 라이브러리만
        detail: pathlib과 tempfile만 사용하므로 추가 패키지가 필요 없다.
      - label: assert 기준 비교
        detail: 정렬된 리스트와 기대값을 assert로 비교해 탐색 결과를 고정한다.
sections:
  - id: build-tree
    title: 가짜 폴더 트리 만들기
    structuredPrimary: true
    subtitle: 실습용 폴더 구조 준비
    goal: 실습에 사용할 다단계 폴더와 파일을 자동으로 만들어 둔다.
    why: 자동화 코드는 다양한 깊이의 폴더를 만나기 때문에 미리 트리 구조를 준비해 두면 탐색 코드가 어떤 입력에서 작동하는지 확인할 수 있다.
    explanation: Path.mkdir(parents=True)는 중간 폴더가 없으면 함께 만든다. write_text로 빈 내용이라도 한 번 저장하면 파일이 존재 상태로 표시된다. 같은 베이스 폴더에서 sales/2024와 sales/2025 같은 구조를 미리 만들면 다음 섹션의 탐색 코드가 명확해진다.
    tips:
      - mkdir(parents=True, exist_ok=True)을 쓰면 같은 셀을 여러 번 실행해도 오류가 없다.
      - 빈 파일이 필요하면 write_text("")로 흔적만 남겨도 충분하다.
    snippet: |-
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          (base / "sales" / "2024").mkdir(parents=True)
          (base / "sales" / "2025").mkdir(parents=True)
          (base / "sales" / "2024" / "jan.csv").write_text("", encoding="utf-8")
          (base / "sales" / "2025" / "feb.csv").write_text("", encoding="utf-8")
          created = sorted(p.relative_to(base).as_posix() for p in base.rglob("*.csv"))

      assert created == ["sales/2024/jan.csv", "sales/2025/feb.csv"]
      created
    exercise:
      prompt: 같은 base 폴더에 reports/q1과 reports/q2 폴더를 만들고 각각 summary.txt 파일을 둬 created 리스트에 두 경로가 정렬된 상태로 모이게 하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "reports" / "q1").mkdir(___=True)
            (base / "reports" / "q2").mkdir(parents=True)
            (base / "reports" / "q1" / "___").write_text("", encoding="utf-8")
            (base / "reports" / "q2" / "summary.txt").write_text("", encoding="utf-8")
            created = sorted(p.relative_to(base).as_posix() for p in base.rglob("*.txt"))

        assert created == ["reports/q1/summary.txt", "reports/q2/summary.txt"]
        created
      solution: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "reports" / "q1").mkdir(parents=True)
            (base / "reports" / "q2").mkdir(parents=True)
            (base / "reports" / "q1" / "summary.txt").write_text("", encoding="utf-8")
            (base / "reports" / "q2" / "summary.txt").write_text("", encoding="utf-8")
            created = sorted(p.relative_to(base).as_posix() for p in base.rglob("*.txt"))

        assert created == ["reports/q1/summary.txt", "reports/q2/summary.txt"]
        created
      hints:
        - parents 인자를 True로 설정해야 중간 폴더가 한 번에 생긴다.
        - 두 파일 이름을 모두 summary.txt로 두어야 rglob 결과가 기대값과 맞다.
      check:
        type: noError
        noError: mkdir(parents=True)와 write_text가 격리 폴더에서 정상 실행되어야 한다.
        resultCheck: created 리스트가 두 reports 하위 summary.txt 경로를 정렬된 상태로 포함해야 한다.
    check:
      noError: 다단계 폴더 생성과 파일 작성이 격리 공간에서 끝나야 한다.
      resultCheck: created 리스트가 본문에서 만든 두 csv 경로와 정확히 같아야 한다.
  - id: iterdir-first-level
    title: 한 단계 자식 살피기
    structuredPrimary: true
    subtitle: iterdir로 즉시 보이는 것만
    goal: 베이스 폴더의 바로 아래 자식만 골라 정렬된 이름 리스트로 만든다.
    why: 큰 트리에서 첫 단계만 확인하면 어느 폴더가 자동화 대상인지 빠르게 파악할 수 있다.
    explanation: Path.iterdir는 디렉터리의 자식 Path를 한 번에 보여주는 이터레이터를 돌려준다. 자식에는 파일과 폴더가 섞이므로 is_dir로 폴더만 거를 수 있다. 정렬 없이 사용하면 운영체제 순서가 들쭉날쭉할 수 있어 자동화에서는 항상 sorted를 통과시킨다.
    tips:
      - iterdir는 한 번만 소비되는 이터레이터이므로 리스트로 미리 변환해 두면 재사용이 쉽다.
      - is_dir과 is_file로 자식 종류를 분리하면 다음 단계의 필터 조건이 단순해진다.
    snippet: |-
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          (base / "잡일").mkdir()
          (base / "주문").mkdir()
          (base / "안내문.txt").write_text("hi", encoding="utf-8")
          children = sorted(item.name for item in base.iterdir() if item.is_dir())

      assert children == ["잡일", "주문"]
      children
    exercise:
      prompt: 임시 폴더에 archives 폴더와 reports 폴더, 그리고 hello.txt 파일을 만들고 폴더 이름만 정렬해 folders 리스트에 담아 검증하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "___").mkdir()
            (base / "___").mkdir()
            (base / "hello.txt").write_text("hi", encoding="utf-8")
            folders = sorted(item.name for item in base.iterdir() if item.___())

        assert folders == ["archives", "reports"]
        folders
      solution: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "archives").mkdir()
            (base / "reports").mkdir()
            (base / "hello.txt").write_text("hi", encoding="utf-8")
            folders = sorted(item.name for item in base.iterdir() if item.is_dir())

        assert folders == ["archives", "reports"]
        folders
      hints:
        - archives와 reports는 알파벳 순으로 archives가 먼저 온다.
        - 파일을 제외하려면 is_dir 호출 결과로 필터링해야 한다.
      check:
        type: noError
        noError: iterdir 호출과 is_dir 필터가 OSError 없이 동작해야 한다.
        resultCheck: folders 리스트가 두 폴더 이름만 정렬된 상태로 담아야 한다.
    check:
      noError: 다단계 자식 중 폴더만 거르는 코드가 정상적으로 끝나야 한다.
      resultCheck: children 리스트가 본문에서 만든 두 한국어 폴더 이름과 같아야 한다.
  - id: rglob-pattern
    title: rglob로 다단계 패턴 매칭
    structuredPrimary: true
    subtitle: 확장자 기준 깊이 무관 탐색
    goal: 트리 어디에 있든 특정 확장자를 가진 파일을 한 번에 모은다.
    why: 자동화 대상 파일은 보통 분산된 폴더에 있으므로 깊이 제한 없는 패턴 탐색이 필요하다.
    explanation: Path.rglob은 모든 하위 폴더를 재귀로 살피며 패턴과 매칭되는 Path를 돌려준다. *.csv 같은 와일드카드, 2024-*.json 같은 시작 일치, [!_]* 같은 부정 패턴까지 사용할 수 있다. 결과를 sorted로 통과시키면 자동화에서 동일한 순서를 보장한다.
    tips:
      - glob과 rglob의 차이는 재귀 여부다. 같은 패턴이라도 결과가 달라진다.
      - 부정 매칭 [!_]*은 언더스코어로 시작하는 파일을 제외한다.
    snippet: |-
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          (base / "sales" / "2024").mkdir(parents=True)
          (base / "sales" / "2025").mkdir(parents=True)
          (base / "sales" / "2024" / "jan.csv").write_text("", encoding="utf-8")
          (base / "sales" / "2025" / "feb.csv").write_text("", encoding="utf-8")
          (base / "sales" / "2025" / "note.txt").write_text("", encoding="utf-8")
          csvPaths = sorted(p.relative_to(base).as_posix() for p in base.rglob("*.csv"))

      assert csvPaths == ["sales/2024/jan.csv", "sales/2025/feb.csv"]
      csvPaths
    exercise:
      prompt: 같은 트리에서 .txt 확장자를 가진 파일만 골라 txtPaths 리스트에 정렬된 상태로 담고 한 개만 존재함을 검증하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "sales" / "2024").mkdir(parents=True)
            (base / "sales" / "2025").mkdir(parents=True)
            (base / "sales" / "2024" / "jan.csv").write_text("", encoding="utf-8")
            (base / "sales" / "2025" / "feb.csv").write_text("", encoding="utf-8")
            (base / "sales" / "2025" / "note.txt").write_text("", encoding="utf-8")
            txtPaths = sorted(p.relative_to(base).as_posix() for p in base.rglob("*.___"))

        assert txtPaths == ["sales/2025/note.txt"]
        txtPaths
      solution: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "sales" / "2024").mkdir(parents=True)
            (base / "sales" / "2025").mkdir(parents=True)
            (base / "sales" / "2024" / "jan.csv").write_text("", encoding="utf-8")
            (base / "sales" / "2025" / "feb.csv").write_text("", encoding="utf-8")
            (base / "sales" / "2025" / "note.txt").write_text("", encoding="utf-8")
            txtPaths = sorted(p.relative_to(base).as_posix() for p in base.rglob("*.txt"))

        assert txtPaths == ["sales/2025/note.txt"]
        txtPaths
      hints:
        - rglob 패턴에서 확장자 앞의 점을 잊지 말아야 한다.
        - 결과가 비어 있다면 트리에 .txt 파일이 한 개만 있는지 확인한다.
      check:
        type: noError
        noError: rglob와 정렬이 PermissionError 없이 끝나야 한다.
        resultCheck: txtPaths가 단 하나의 sales/2025/note.txt 경로만 포함해야 한다.
    check:
      noError: rglob와 sorted 호출이 IOError 없이 끝나야 한다.
      resultCheck: csvPaths가 두 csv 경로를 정렬된 형태로 포함해야 한다.
  - id: dual-pattern
    title: 두 패턴 종합 정리
    structuredPrimary: true
    subtitle: csv와 txt를 한 딕셔너리에
    goal: 같은 트리에서 두 가지 확장자를 동시에 탐색한 결과를 dict로 묶어 다음 자동화 단계에 넘긴다.
    why: 실제 자동화 입력은 보통 여러 종류 파일이 섞이므로 한 함수에서 두 패턴을 한 번에 정리하면 호출 횟수가 줄고 보고서가 명확해진다.
    explanation: 마지막 섹션은 앞의 rglob 결과를 두 패턴에 대해 모아 같은 dict로 묶는다. 각 키 값은 정렬된 리스트로 두어 자동화에서 항상 같은 순서를 보장한다. 같은 함수 안에서 두 번 rglob을 호출해도 비용이 크지 않으며 결과 dict는 다음 레슨의 복사 작업 입력으로 그대로 쓸 수 있다.
    tips:
      - 두 패턴 결과를 dict로 묶으면 다음 단계 함수에서 key 이름으로 접근하기 쉽다.
      - 결과가 비어 있으면 빈 리스트로 채워야 후속 코드가 KeyError 없이 동작한다.
    snippet: |-
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          (base / "orders" / "2024").mkdir(parents=True)
          (base / "orders" / "2025").mkdir(parents=True)
          (base / "orders" / "2024" / "summary.csv").write_text("", encoding="utf-8")
          (base / "orders" / "2025" / "summary.csv").write_text("", encoding="utf-8")
          (base / "orders" / "2025" / "note.md").write_text("# note", encoding="utf-8")
          summary = {
              "csv": sorted(p.relative_to(base).as_posix() for p in base.rglob("*.csv")),
              "md": sorted(p.relative_to(base).as_posix() for p in base.rglob("*.md")),
          }

      assert summary == {
          "csv": ["orders/2024/summary.csv", "orders/2025/summary.csv"],
          "md": ["orders/2025/note.md"],
      }
      summary
    exercise:
      prompt: 같은 트리에서 png와 json 확장자 결과를 dict로 묶고 png는 두 개, json은 한 개가 모이도록 종합 결과를 정리하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "evidence" / "screens").mkdir(parents=True)
            (base / "evidence" / "logs").mkdir(parents=True)
            (base / "evidence" / "screens" / "first.png").write_text("", encoding="utf-8")
            (base / "evidence" / "screens" / "second.png").write_text("", encoding="utf-8")
            (base / "evidence" / "logs" / "run.json").write_text("{}", encoding="utf-8")
            summary = {
                "png": sorted(p.relative_to(base).as_posix() for p in base.rglob("*.___")),
                "json": sorted(p.relative_to(base).as_posix() for p in base.rglob("*.___")),
            }

        assert summary == {
            "png": ["evidence/screens/first.png", "evidence/screens/second.png"],
            "json": ["evidence/logs/run.json"],
        }
        summary
      solution: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "evidence" / "screens").mkdir(parents=True)
            (base / "evidence" / "logs").mkdir(parents=True)
            (base / "evidence" / "screens" / "first.png").write_text("", encoding="utf-8")
            (base / "evidence" / "screens" / "second.png").write_text("", encoding="utf-8")
            (base / "evidence" / "logs" / "run.json").write_text("{}", encoding="utf-8")
            summary = {
                "png": sorted(p.relative_to(base).as_posix() for p in base.rglob("*.png")),
                "json": sorted(p.relative_to(base).as_posix() for p in base.rglob("*.json")),
            }

        assert summary == {
            "png": ["evidence/screens/first.png", "evidence/screens/second.png"],
            "json": ["evidence/logs/run.json"],
        }
        summary
      hints:
        - 패턴 확장자는 점을 포함해 *.png, *.json 형태로 넣는다.
        - dict 키 이름을 png와 json으로 맞추어야 비교 단계가 통과한다.
      check:
        type: noError
        noError: 두 번의 rglob 호출과 dict 구성이 KeyError 없이 끝나야 한다.
        resultCheck: summary 딕셔너리의 png에 두 png 경로가, json에 한 json 경로가 정렬된 상태로 담겨야 한다.
    check:
      noError: 두 패턴 탐색과 종합 결과 dict 구성이 한 함수 안에서 끝나야 한다.
      resultCheck: summary가 csv와 md 키에 정렬된 경로 리스트를 각각 담아 종합 정리 결과가 안정적이어야 한다.
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
  - id: fileOps_03-directory-inventory-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - build-tree
    - dual-pattern
    title: 디렉터리 entry를 root 상대 artifact inventory로 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: path escape와 symlink를 격리하고 파일별 size·hash를 정렬한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 절대 path 대신 허용 root 상대 path를 artifact identity로 사용하세요.
    - symlink는 resolved target 정책이 없으면 기본 격리하세요.
    exercise:
      prompt: build_directory_inventory(entries, root)를 완성하세요.
      starterCode: |-
        def build_directory_inventory(entries, root):
            raise NotImplementedError
      solution: |
        def build_directory_inventory(entries, root):
            from pathlib import PurePosixPath
            root_path = PurePosixPath(root)
            files = []
            rejected = []
            for entry in entries:
                path = PurePosixPath(entry["path"])
                try:
                    relative = path.relative_to(root_path).as_posix()
                except ValueError:
                    rejected.append({"path": entry["path"], "reason": "root"})
                    continue
                if entry.get("isSymlink", False):
                    rejected.append({"path": entry["path"], "reason": "symlink"})
                elif entry.get("kind") == "file":
                    files.append({"path": relative, "size": entry["size"], "hash": entry["hash"]})
            files.sort(key=lambda item: item["path"])
            return {"files": files, "rejected": rejected, "fileCount": len(files), "totalBytes": sum(item["size"] for item in files)}
      hints: *id001
    check:
      id: python.fileops.fileOps_03.directory-inventory.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_03.directory-inventory.mastery.behavior.v1.fixture
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
        entry: build_directory_inventory
        cases:
        - id: builds-sorted-file-inventory
          arguments:
          - value:
            - path: /root/b.txt
              kind: file
              size: 2
              hash: b
            - path: /root/a.txt
              kind: file
              size: 1
              hash: a
            - path: /root/sub
              kind: directory
          - value: /root
          expectedReturn:
            files:
            - path: a.txt
              size: 1
              hash: a
            - path: b.txt
              size: 2
              hash: b
            rejected: []
            fileCount: 2
            totalBytes: 3
        - id: rejects-symlink-and-outside
          arguments:
          - value:
            - path: /root/link
              kind: file
              size: 1
              hash: x
              isSymlink: true
            - path: /other/x
              kind: file
              size: 1
              hash: y
          - value: /root
          expectedReturn:
            files: []
            rejected:
            - path: /root/link
              reason: symlink
            - path: /other/x
              reason: root
            fileCount: 0
            totalBytes: 0
        - id: handles-empty-directory
          arguments:
          - value: []
          - value: /root
          expectedReturn:
            files: []
            rejected: []
            fileCount: 0
            totalBytes: 0
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: fileOps_03-inventory-diff-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - fileOps_03-directory-inventory-mastery
    title: 새 디렉터리 snapshot에 추가·변경·삭제 diff 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 상대 path와 content hash로 두 inventory를 비교한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - modified time만으로 변경을 판단하지 말고 content hash를 사용하세요.
    - 추가·변경·삭제·동일을 모두 report에 남기세요.
    exercise:
      prompt: diff_directory_inventory(before, after)를 완성하세요.
      starterCode: |-
        def diff_directory_inventory(before, after):
            raise NotImplementedError
      solution: |
        def diff_directory_inventory(before, after):
            before_map = {item["path"]: item["hash"] for item in before}
            after_map = {item["path"]: item["hash"] for item in after}
            added = sorted(set(after_map) - set(before_map))
            removed = sorted(set(before_map) - set(after_map))
            changed = sorted(path for path in set(before_map) & set(after_map) if before_map[path] != after_map[path])
            unchanged = sorted(path for path in set(before_map) & set(after_map) if before_map[path] == after_map[path])
            return {"added": added, "changed": changed, "removed": removed, "unchanged": unchanged}
      hints: *id002
    check:
      id: python.fileops.fileOps_03.inventory-diff.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_03.inventory-diff.transfer.behavior.v1.fixture
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
        entry: diff_directory_inventory
        cases:
        - id: computes-all-diff-kinds
          arguments:
          - value:
            - path: old
              hash: o
            - path: change
              hash: a
            - path: same
              hash: s
          - value:
            - path: new
              hash: n
            - path: change
              hash: b
            - path: same
              hash: s
          expectedReturn:
            added:
            - new
            changed:
            - change
            removed:
            - old
            unchanged:
            - same
        - id: handles-identical-inventories
          arguments:
          - value:
            - path: a
              hash: x
          - value:
            - path: a
              hash: x
          expectedReturn:
            added: []
            changed: []
            removed: []
            unchanged:
            - a
        - id: handles-empty-before
          arguments:
          - value: []
          - value:
            - path: a
              hash: x
          expectedReturn:
            added:
            - a
            changed: []
            removed: []
            unchanged: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: fileOps_03-directory-traversal-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - fileOps_03-inventory-diff-transfer
    title: 디렉터리 탐색 evidence 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: root containment·artifact inventory·snapshot diff를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 파일 action 전에 root·충돌·dry run 계약을 확인하세요.
    - 실행 횟수가 아니라 source와 destination artifact identity로 결과를 판정하세요.
    exercise:
      prompt: choose_directory_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_directory_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_directory_evidence(situation):
            table = {'scope': {'action': 'resolve under allowed root', 'evidence': 'relative path', 'risk': 'path escape'}, 'inventory': {'action': 'record size and content hash', 'evidence': 'sorted artifact descriptors', 'risk': 'metadata-only identity'}, 'diff': {'action': 'compare path and hash maps', 'evidence': 'added changed removed unchanged', 'risk': 'silent deletion'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.fileops.fileOps_03.directory-traversal-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_03.directory-traversal-recall.retrieval.behavior.v1.fixture
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
        entry: choose_directory_evidence
        cases:
        - id: recalls-scope
          arguments:
          - value: scope
          expectedReturn:
            action: resolve under allowed root
            evidence: relative path
            risk: path escape
        - id: recalls-inventory
          arguments:
          - value: inventory
          expectedReturn:
            action: record size and content hash
            evidence: sorted artifact descriptors
            risk: metadata-only identity
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};