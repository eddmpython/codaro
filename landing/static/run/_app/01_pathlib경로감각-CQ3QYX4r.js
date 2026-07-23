var e=`meta:
  id: fileOps_01
  title: pathlib 경로 감각
  order: 1
  category: fileOps
  difficulty: easy
  audience: 파일 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - pathlib
    - tempfile
    - path
intro:
  direction: tempfile 기반 작업 폴더에서 pathlib.Path로 경로를 만들고 조각으로 분해해 파일 시스템을 다룰 감각을 잡는다.
  benefits:
    - 문자열 경로 대신 Path 객체로 안전하게 경로를 조합할 수 있다.
    - 운영체제마다 다른 구분자를 신경 쓰지 않고 자동화 코드를 작성한다.
    - 절대 경로와 상대 경로의 차이를 의도적으로 사용한다.
    - 실습 코드가 사용자 홈을 건드리지 않도록 tempfile 안에 격리한다.
  diagram:
    steps:
      - label: 임시 작업 폴더 확보
        detail: tempfile.TemporaryDirectory로 자동 정리되는 격리 폴더를 만든다.
      - label: Path 조합과 분해
        detail: Path 객체에 / 연산자, parts, suffix, stem을 적용해 경로를 분리한다.
      - label: 절대 경로 변환
        detail: Path.resolve로 상대 경로를 절대 경로로 바꿔 모호함을 없앤다.
      - label: 결과 딕셔너리 정리
        detail: 같은 파일을 가리키는 다양한 경로 표현을 한 객체로 묶어 다음 레슨에서 재사용한다.
    runtime:
      - label: 로컬 표준 라이브러리
        detail: pathlib과 tempfile만 사용하므로 별도 패키지 설치가 필요 없다.
      - label: assert 기반 검증
        detail: 각 섹션은 expected 값과 actual 값을 assert로 비교한다.
sections:
  - id: temp-base
    title: 임시 작업 폴더 만들기
    structuredPrimary: true
    subtitle: tempfile로 안전한 실험 공간 확보
    goal: 사용자 홈을 건드리지 않는 격리된 폴더 안에서 파일 자동화 실습을 시작한다.
    why: 자동화 코드를 작성하다 실수로 실제 사용자 파일을 덮어쓰는 사고를 막으려면 매번 일회용 작업 폴더를 쓰는 습관이 핵심이다.
    explanation: tempfile.TemporaryDirectory는 컨텍스트가 끝나면 폴더와 안의 모든 파일을 자동으로 정리한다. with 블록 안에서 Path 객체로 감싸 두면 이후 모든 경로 조작이 Path API로 일관된다. base 경로를 변수에 보관해 두면 섹션 사이에서 같은 격리 공간을 이어 쓸 수 있다.
    tips:
      - tempfile은 OS의 임시 디렉터리에 폴더를 만들고 with가 끝날 때 즉시 삭제한다.
      - Path(td)로 감싸야 이후에 / 연산자로 자연스럽게 하위 경로를 만들 수 있다.
    snippet: |-
      from pathlib import Path

      def create_order_workspace(base: Path):
          (base / "주문").mkdir()
          return sorted(item.name for item in base.iterdir())

      # 실제 학습 검증기는 새 임시 workspace를 base로 넘겨 호출한다.
    exercise:
      prompt: 전달받은 base 안에 주문과 배송 폴더를 만들고 정렬된 이름 목록을 반환하는 create_order_workspace 함수를 완성하세요. 실행하면 새 임시 workspace에서 함수 반환값과 실제 폴더를 자동 검증합니다.
      starterCode: |-
        from pathlib import Path

        def create_order_workspace(base: Path):
            (base / "___").___()
            (base / "___").___()
            return sorted(item.name for item in base.iterdir())
      solution: |-
        from pathlib import Path

        def create_order_workspace(base: Path):
            (base / "주문").mkdir()
            (base / "배송").mkdir()
            return sorted(item.name for item in base.iterdir())
      hints:
        - base / "폴더명"으로 하위 Path를 만든 뒤 mkdir을 호출하세요.
        - 두 폴더를 만든 다음 base.iterdir()의 name을 정렬해 반환하세요.
    check:
      id: python.pathlib.create-order-workspace.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pathlib.create-order-workspace.fixture.v1
      fixtureHash: sha256-tr7LliTKvbwyo1aWJAWF2G/rBCZwjbs/VtBoLVzWkUQ=
      fixture:
        directories:
          - workspace
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      payload:
        entry: create_order_workspace
        cases:
          - id: creates-two-folders
            arguments:
              - fixturePath: workspace
            expectedReturn:
              - 배송
              - 주문
        expectedPaths:
          - path: workspace/배송
            kind: directory
            origin: created
          - path: workspace/주문
            kind: directory
            origin: created
  - id: path-parts
    title: 경로 조각으로 분해하기
    structuredPrimary: true
    subtitle: name, stem, suffix, parts
    goal: 파일 이름의 본체와 확장자를 분리해 자동화 규칙에 활용할 수 있게 한다.
    why: 파일을 확장자별로 분류하거나 이름 일부만 바꿔 다른 폴더로 옮기는 작업은 이름 분해가 첫걸음이다.
    explanation: Path.name은 마지막 경로 요소, Path.stem은 확장자를 뺀 본체, Path.suffix는 마지막 점 이하의 확장자를 돌려준다. with_suffix는 확장자만 바꾼 새 Path를 만든다. parts는 경로를 디렉터리 단위로 나눠 튜플로 보여준다.
    tips:
      - 점이 두 개인 .tar.gz 같은 경우 suffix는 .gz, suffixes는 [".tar", ".gz"]가 된다.
      - with_suffix("")를 호출하면 확장자가 사라진 Path를 만들 수 있다.
    snippet: |-
      from pathlib import Path

      def create_report_versions(base: Path):
          csv_path = base / "reports" / "2024" / "orderSummary.csv"
          csv_path.parent.mkdir(parents=True)
          csv_path.write_text("order,total\\nA,10\\n", encoding="utf-8")
          json_path = csv_path.with_suffix(".json")
          json_path.write_text('{"order":"A","total":10}', encoding="utf-8")
          return {"csv": csv_path.name, "json": json_path.name}
    exercise:
      prompt: 전달받은 base 아래 reports/2025에 invoice.json과 같은 stem의 invoice.yaml을 만들고, 두 이름과 JSON 경로 조각을 반환하는 create_invoice_versions 함수를 완성하세요.
      starterCode: |-
        from pathlib import Path

        def create_invoice_versions(base: Path):
            json_path = base / "___" / "___" / "___"
            json_path.parent.___(parents=True)
            json_path.write_text("{}", encoding="utf-8")
            yaml_path = json_path.___(".yaml")
            yaml_path.write_text("invoice: true\\n", encoding="utf-8")
            return {
                "jsonName": json_path.name,
                "yamlName": yaml_path.name,
                "parts": list(json_path.relative_to(base).parts),
            }
      solution: |-
        from pathlib import Path

        def create_invoice_versions(base: Path):
            json_path = base / "reports" / "2025" / "invoice.json"
            json_path.parent.mkdir(parents=True)
            json_path.write_text("{}", encoding="utf-8")
            yaml_path = json_path.with_suffix(".yaml")
            yaml_path.write_text("invoice: true\\n", encoding="utf-8")
            return {
                "jsonName": json_path.name,
                "yamlName": yaml_path.name,
                "parts": list(json_path.relative_to(base).parts),
            }
      hints:
        - reports, 2025, invoice.json을 / 연산자로 이어 붙이고 parent.mkdir(parents=True)를 호출하세요.
        - 확장자를 바꿀 때는 with_suffix(".yaml")을 사용하세요.
    check:
      id: python.pathlib.create-invoice-versions.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pathlib.create-invoice-versions.fixture.v1
      fixtureHash: sha256-tr7LliTKvbwyo1aWJAWF2G/rBCZwjbs/VtBoLVzWkUQ=
      fixture:
        directories:
          - workspace
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      payload:
        entry: create_invoice_versions
        cases:
          - id: creates-json-and-yaml
            arguments:
              - fixturePath: workspace
            expectedReturn:
              jsonName: invoice.json
              yamlName: invoice.yaml
              parts:
                - reports
                - '2025'
                - invoice.json
        expectedPaths:
          - path: workspace/reports/2025/invoice.json
            kind: file
            origin: created
          - path: workspace/reports/2025/invoice.yaml
            kind: file
            origin: created
  - id: relative-absolute
    title: 상대 경로와 절대 경로
    structuredPrimary: true
    subtitle: resolve로 모호함 제거
    goal: 같은 파일을 상대 경로와 절대 경로 두 표현으로 다루고 서로 변환한다.
    why: 자동화 스크립트가 어디서 실행되든 같은 파일을 가리키게 하려면 상대 경로를 절대 경로로 고정하는 절차가 필요하다.
    explanation: Path.cwd는 현재 작업 디렉터리를 절대 경로로 돌려준다. Path("a/b")는 상대 경로지만 Path("a/b").resolve를 호출하면 cwd를 기준으로 절대 경로가 된다. 절대 경로끼리 비교하면 다른 두 표현이 같은 파일을 가리키는지 확실히 알 수 있다.
    tips:
      - Path.is_absolute로 경로가 이미 절대 경로인지 먼저 확인할 수 있다.
      - resolve는 존재하지 않는 경로에도 호출할 수 있으며 cwd만 사용해 변환한다.
    snippet: |-
      from pathlib import Path

      def resolve_inside(base: Path, candidate: str):
          relative = Path(candidate)
          if relative.is_absolute() or ".." in relative.parts:
              raise ValueError("상대 경로만 사용할 수 있습니다")
          root = base.resolve()
          resolved = (root / relative).resolve()
          if not resolved.is_relative_to(root):
              raise ValueError("작업 폴더 밖 경로입니다")
          return {"absolute": str(resolved), "relative": relative.as_posix()}

      # checker가 정상 경로와 traversal/absolute 경로를 서로 다른 case로 호출한다.
    exercise:
      prompt: base 안의 상대 경로만 resolve하고, ../ traversal과 절대 경로는 ValueError로 거부하는 resolve_report 함수를 완성하세요. 정상 경로, 다른 파일, traversal, absolute 네 case가 Run 뒤 자동 검증됩니다.
      starterCode: |-
        from pathlib import Path

        def resolve_report(base: Path, candidate: str):
            relative = Path(candidate)
            if relative.___() or "___" in relative.parts:
                raise ValueError("상대 경로만 사용할 수 있습니다")
            root = base.___()
            resolved = (root / relative).___()
            if not resolved.is_relative_to(root):
                raise ValueError("작업 폴더 밖 경로입니다")
            target = (root / "reports" / "today.log").resolve()
            return {"matches": resolved == target, "posix": relative.as_posix()}
      solution: |-
        from pathlib import Path

        def resolve_report(base: Path, candidate: str):
            relative = Path(candidate)
            if relative.is_absolute() or ".." in relative.parts:
                raise ValueError("상대 경로만 사용할 수 있습니다")
            root = base.resolve()
            resolved = (root / relative).resolve()
            if not resolved.is_relative_to(root):
                raise ValueError("작업 폴더 밖 경로입니다")
            target = (root / "reports" / "today.log").resolve()
            return {"matches": resolved == target, "posix": relative.as_posix()}
      hints:
        - Path.is_absolute와 relative.parts 안의 ".."를 base와 합치기 전에 확인하세요.
        - resolve한 뒤에도 resolved.is_relative_to(root)로 작업 폴더 안인지 확인하세요.
    check:
      id: python.pathlib.resolve-report.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pathlib.resolve-report.fixture.v1
      fixtureHash: sha256-p8WrBOlz/UaReR0B+sr7pv/on4YWt794fEKpUULt6Bo=
      fixture:
        directories:
          - workspace/reports
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
          - path: workspace/reports/today.log
            content: daily
        stdin: []
      payload:
        entry: resolve_report
        cases:
          - id: existing-relative-file
            arguments:
              - fixturePath: workspace
              - value: reports/today.log
            expectedReturn:
              matches: true
              posix: reports/today.log
          - id: other-relative-file
            arguments:
              - fixturePath: workspace
              - value: reports/tomorrow.log
            expectedReturn:
              matches: false
              posix: reports/tomorrow.log
          - id: rejects-traversal
            arguments:
              - fixturePath: workspace
              - value: ../secret.txt
            expectedException: ValueError
          - id: rejects-absolute
            arguments:
              - fixturePath: workspace
              - value: /tmp/secret.txt
            expectedException: ValueError
        expectedPaths:
          - path: workspace/reports/today.log
            kind: file
            origin: fixture
  - id: identity-summary
    title: 경로 정체성 종합 정리
    structuredPrimary: true
    subtitle: 같은 파일을 여러 표현으로 묶기
    goal: 한 파일을 가리키는 절대 경로, 상대 경로, 이름 조각을 한 딕셔너리로 정리해 다음 자동화 단계에 넘긴다.
    why: 자동화는 경로 표현을 자주 바꾸므로 정체성 정보를 한 객체로 묶어 두면 이후 복사나 이름 변경 단계에서 안전하게 재사용할 수 있다.
    explanation: 마지막 섹션은 앞 세 섹션에서 익힌 메서드를 모아 결과 객체를 만든다. 절대 경로는 자동화 결과 보고에 쓰고, 상대 경로는 사용자에게 보여줄 때 쓰며, stem과 suffix는 분류 규칙을 만들 때 쓴다. 이 패턴은 다음 레슨의 파일 읽기와 쓰기 흐름에서 같은 키 이름으로 이어진다.
    tips:
      - 결과 딕셔너리 키 이름은 자동화 리포트의 열 이름이 되므로 의미 있게 고른다.
      - 검증할 때 expected 딕셔너리를 먼저 만들어 두면 실패 지점을 빨리 찾을 수 있다.
    snippet: |-
      from pathlib import Path

      def build_snapshot_identity(base: Path):
          target = base / "snapshots" / "march" / "report.json"
          target.parent.mkdir(parents=True)
          target.write_text("{}", encoding="utf-8")
          return {
              "absolute": str(target),
              "relative": target.relative_to(base).as_posix(),
              "stem": target.stem,
              "suffix": target.suffix,
          }
    exercise:
      prompt: 전달받은 base 아래 archives/april/finalSummary.txt를 만들고 absolute, relative, stem, suffix를 반환하는 build_archive_identity 함수를 완성하세요. absolute가 fixture 밖을 가리키면 검증에 실패합니다.
      starterCode: |-
        from pathlib import Path

        def build_archive_identity(base: Path):
            target = base / "___" / "___" / "___"
            target.parent.___(parents=True)
            target.write_text("done", encoding="utf-8")
            return {
                "absolute": str(target),
                "relative": target.___(base).as_posix(),
                "stem": target.___,
                "suffix": target.___,
            }
      solution: |-
        from pathlib import Path

        def build_archive_identity(base: Path):
            target = base / "archives" / "april" / "finalSummary.txt"
            target.parent.mkdir(parents=True)
            target.write_text("done", encoding="utf-8")
            return {
                "absolute": str(target),
                "relative": target.relative_to(base).as_posix(),
                "stem": target.stem,
                "suffix": target.suffix,
            }
      hints:
        - parents=True를 mkdir에 넘겨야 archives/april 두 단계가 한 번에 생긴다.
        - stem은 메서드가 아니라 속성이므로 괄호 없이 target.stem으로 접근한다.
    check:
      id: python.pathlib.build-archive-identity.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pathlib.build-archive-identity.fixture.v1
      fixtureHash: sha256-tr7LliTKvbwyo1aWJAWF2G/rBCZwjbs/VtBoLVzWkUQ=
      fixture:
        directories:
          - workspace
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      payload:
        entry: build_archive_identity
        cases:
          - id: builds-portable-identity
            arguments:
              - fixturePath: workspace
            expectedReturn:
              absolute: workspace/archives/april/finalSummary.txt
              relative: archives/april/finalSummary.txt
              stem: finalSummary
              suffix: .txt
        expectedPaths:
          - path: workspace/archives/april/finalSummary.txt
            kind: file
            origin: created
        normalizeReturnPaths:
          - absolute
assessment:
  masteryVariants:
    - id: pathlib-safe-relative-mastery
      mode: mastery
      unseen: false
      sourceSectionIds:
        - temp-base
        - relative-absolute
      title: 작업 폴더 안의 상대 경로만 허용하기
      subtitle: 예시 없이 경로 경계를 완성
      goal: 상대 경로는 정규화하고 absolute와 상위 폴더 이동은 거부한다.
      why: 파일 자동화는 올바른 결과뿐 아니라 작업 폴더 밖을 건드리지 않는 경계가 함께 검증돼야 안전하다.
      explanation: 함수 본문을 완성하면 정상 중첩 경로 두 개와 traversal, absolute 경로를 서로 다른 case로 다시 호출한다.
      tips:
        - Path.parts에서 상위 폴더 이동 조각을 먼저 찾으세요.
        - 반환값은 운영체제와 무관한 POSIX 상대 경로여야 합니다.
      exercise:
        prompt: safe_relative_target(base, raw)가 안전한 상대 경로를 POSIX 문자열로 반환하고 absolute 또는 .. 경로에는 ValueError를 내도록 완성하세요.
        starterCode: |-
          from pathlib import Path

          def safe_relative_target(base, raw):
              raise NotImplementedError
        solution: |-
          from pathlib import Path

          def safe_relative_target(base, raw):
              normalized = str(raw).replace("\\\\", "/")
              candidate = Path(raw)
              has_drive_prefix = len(normalized) >= 3 and normalized[1:3] == ":/"
              if candidate.is_absolute() or normalized.startswith("/") or has_drive_prefix or ".." in candidate.parts:
                  raise ValueError("workspace 밖 경로는 허용하지 않습니다")
              target = (Path(base) / candidate).resolve()
              return target.relative_to(Path(base).resolve()).as_posix()
        hints:
          - candidate.is_absolute(), 앞쪽 /, drive prefix, candidate.parts를 각각 검사하세요.
          - base와 결합해 resolve한 뒤 relative_to(base.resolve())로 경계를 확정하세요.
      check:
        id: python.pathlib.safe-relative-target.mastery.behavior.v1
        version: 1
        kind: behavior
        strength: strong
        executor: browser-worker
        timeoutMs: 8000
        fixtureId: python.pathlib.safe-relative-target.mastery.fixture.v1
        fixtureHash: sha256-tr7LliTKvbwyo1aWJAWF2G/rBCZwjbs/VtBoLVzWkUQ=
        fixture:
          directories:
            - workspace
          env:
            LANG: C.UTF-8
            TZ: UTC
          files: []
          stdin: []
        packageAssets: []
        payload:
          entry: safe_relative_target
          cases:
            - id: nested-report
              arguments:
                - fixturePath: workspace
                - value: reports/2026/today.csv
              expectedReturn: reports/2026/today.csv
            - id: unicode-name
              arguments:
                - fixturePath: workspace
                - value: 결과/주문.json
              expectedReturn: 결과/주문.json
            - id: rejects-traversal
              arguments:
                - fixturePath: workspace
                - value: ../secret.txt
              expectedException: ValueError
            - id: rejects-absolute
              arguments:
                - fixturePath: workspace
                - value: C:/outside.txt
              expectedException: ValueError
          expectedPaths:
            - path: workspace
              kind: directory
              origin: fixture
          normalizeReturnPaths: []
  transferVariants:
    - id: pathlib-group-suffix-transfer
      mode: transfer
      unseen: true
      sourceSectionIds:
        - pathlib-safe-relative-mastery
        - path-parts
      title: 낯선 파일 목록을 확장자별로 묶기
      subtitle: 경로 분해를 분류 규칙에 적용
      goal: 여러 상대 경로를 suffix 기준으로 분류하고 이름을 정렬한다.
      why: 하나의 파일 경로를 읽는 법을 실제 정리 자동화에 옮기려면 다양한 폴더와 대소문자 확장자를 같은 규칙으로 처리해야 한다.
      explanation: 입력 목록과 확장자 조합을 바꾼 hidden case가 같은 함수를 다시 호출하므로 예시 목록을 하드코딩할 수 없다.
      tips:
        - suffix는 소문자로 통일하고 확장자가 없으면 <none>으로 묶으세요.
        - 각 그룹 안의 경로도 정렬해야 입력 순서가 달라도 결과가 안정적입니다.
      exercise:
        prompt: group_paths_by_suffix(paths)가 안전한 상대 경로를 확장자별 dict로 묶고 각 목록을 정렬하도록 완성하세요.
        starterCode: |-
          from pathlib import Path

          def group_paths_by_suffix(paths):
              raise NotImplementedError
        solution: |-
          from pathlib import Path

          def group_paths_by_suffix(paths):
              groups = {}
              for raw in paths:
                  path = Path(raw)
                  if path.is_absolute() or ".." in path.parts:
                      raise ValueError("상대 경로만 허용합니다")
                  key = path.suffix.lower() or "<none>"
                  groups.setdefault(key, []).append(path.as_posix())
              return {key: sorted(values) for key, values in sorted(groups.items())}
        hints:
          - key는 path.suffix.lower() or "<none>"으로 만들 수 있습니다.
          - setdefault로 목록을 만든 뒤 마지막에 key와 value를 각각 정렬하세요.
      check:
        id: python.pathlib.group-paths-by-suffix.transfer.behavior.v1
        version: 1
        kind: behavior
        strength: strong
        executor: browser-worker
        timeoutMs: 8000
        fixtureId: python.pathlib.group-paths-by-suffix.transfer.fixture.v1
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
          entry: group_paths_by_suffix
          cases:
            - id: mixed-report-files
              arguments:
                - value:
                    - reports/b.CSV
                    - notes/readme
                    - reports/a.csv
                    - logs/today.txt
              expectedReturn:
                .csv:
                  - reports/a.csv
                  - reports/b.CSV
                .txt:
                  - logs/today.txt
                <none>:
                  - notes/readme
            - id: rejects-parent-hop
              arguments:
                - value:
                    - safe.txt
                    - ../outside.csv
              expectedException: ValueError
          expectedPaths: []
          normalizeReturnPaths: []
  retrievalVariants:
    - id: pathlib-replace-suffixes-retrieval
      mode: retrieval
      unseen: true
      minimumDelayHours: 24
      sourceSectionIds:
        - pathlib-safe-relative-mastery
        - path-parts
      title: 하루 뒤 여러 경로의 확장자 바꾸기
      subtitle: 경로 변환 규칙을 기억에서 복원
      goal: 안전한 상대 경로 목록의 확장자를 바꾸되 폴더 구조와 stem을 보존한다.
      why: 시간이 지난 뒤에도 Path 변환과 경계 검사를 함께 재구성해야 실무 자동화에서 문자열 치환으로 돌아가지 않는다.
      explanation: 정상 확장자 두 종류와 잘못된 새 확장자, traversal 입력을 독립 case로 검사한다.
      tips:
        - 새 확장자는 점으로 시작해야 하며 with_suffix는 원래 stem과 parent를 보존합니다.
        - 목록을 변환하기 전에 모든 입력이 상대 경로인지 확인하세요.
      exercise:
        prompt: replace_suffixes(paths, new_suffix)가 각 안전한 상대 경로의 확장자를 바꾼 POSIX 목록을 반환하고 잘못된 입력은 ValueError로 거부하도록 완성하세요.
        starterCode: |-
          from pathlib import Path

          def replace_suffixes(paths, new_suffix):
              raise NotImplementedError
        solution: |-
          from pathlib import Path

          def replace_suffixes(paths, new_suffix):
              if not isinstance(new_suffix, str) or not new_suffix.startswith("."):
                  raise ValueError("확장자는 점으로 시작해야 합니다")
              result = []
              for raw in paths:
                  path = Path(raw)
                  if path.is_absolute() or ".." in path.parts:
                      raise ValueError("상대 경로만 허용합니다")
                  result.append(path.with_suffix(new_suffix).as_posix())
              return result
        hints:
          - new_suffix의 첫 글자를 검사한 뒤 입력 경로를 순회하세요.
          - path.with_suffix(new_suffix).as_posix()를 결과 목록에 추가하세요.
      check:
        id: python.pathlib.replace-suffixes.retrieval.behavior.v1
        version: 1
        kind: behavior
        strength: strong
        executor: browser-worker
        timeoutMs: 8000
        fixtureId: python.pathlib.replace-suffixes.retrieval.fixture.v1
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
          entry: replace_suffixes
          cases:
            - id: report-formats
              arguments:
                - value:
                    - reports/daily.csv
                    - reports/archive.tar.gz
                - value: .json
              expectedReturn:
                - reports/daily.json
                - reports/archive.tar.json
            - id: rejects-missing-dot
              arguments:
                - value:
                    - reports/daily.csv
                - value: json
              expectedException: ValueError
            - id: rejects-traversal
              arguments:
                - value:
                    - ../daily.csv
                - value: .json
              expectedException: ValueError
          expectedPaths: []
          normalizeReturnPaths: []
`;export{e as default};