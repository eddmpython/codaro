var e=`meta:
  id: fileOps_10
  title: 종합 다운로드 폴더 정리 프로젝트
  order: 10
  category: fileOps
  difficulty: medium
  audience: 파일 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - project
    - cleanup
    - report
intro:
  direction: tempfile 안에 가짜 다운로드 폴더를 만들고 분류, 백업, 빈 폴더 정리, JSON 리포트 저장까지 한 사이클을 종합 프로젝트로 묶는다.
  benefits:
    - 분류 규칙과 백업 정책을 한 함수에서 함께 적용한다.
    - dry-run 모드로 실제 변경 전에 결과를 미리 본다.
    - 종합 리포트를 JSON으로 저장해 다음 사이클이 비교할 수 있게 한다.
    - 두 번 실행해도 같은 결과가 나오는 멱등 사이클을 완성한다.
  diagram:
    steps:
      - label: 가짜 다운로드 트리 생성
        detail: csv, png, log, docx 파일을 한 폴더에 만들어 실제 상황을 재현한다.
      - label: 분류 함수 호출
        detail: 확장자 규칙을 적용해 파일을 카테고리 폴더로 옮긴다.
      - label: 백업과 빈 폴더 정리
        detail: 정리 결과를 archive 폴더로 복제하고 비어 버린 폴더는 제거한다.
      - label: JSON 리포트 작성
        detail: moved, backed-up, removed, generated-at 키를 가진 dict를 JSON으로 저장한다.
      - label: 멱등 사이클 검증
        detail: 같은 사이클을 다시 실행했을 때 moved와 removed가 빈 리스트가 되는지 확인한다.
    runtime:
      - label: 표준 라이브러리만
        detail: pathlib, shutil, json, tempfile, hashlib만으로 종합 함수를 만든다.
      - label: assert 기반 검증
        detail: 첫 사이클과 두 번째 사이클 리포트를 assert로 비교한다.
sections:
  - id: build-environment
    title: 가짜 다운로드 트리 만들기
    structuredPrimary: true
    subtitle: 실제 상황 재현
    goal: csv, png, log, docx 네 종류 파일을 한 폴더에 만들어 자동화 입력을 재현한다.
    why: 종합 프로젝트는 다양한 확장자가 섞인 실제 입력에서 흐름이 동작해야 의미가 있다.
    explanation: 시작 단계는 임시 디렉터리에 4개의 파일을 만들어 둔다. 각 파일은 작은 텍스트나 바이트로 채워 mtime과 size가 의미를 갖게 한다. 이렇게 만든 폴더는 종합 사이클의 입력이 되어 다음 섹션에서 그대로 사용된다.
    tips:
      - 다양한 확장자가 섞여 있어야 _other 폴더로 가는 경로까지 검증할 수 있다.
      - 파일 이름은 직관적으로 두어 결과 리포트를 사람이 읽기 쉽게 만든다.
    snippet: |-
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          (base / "report.csv").write_text("a,b\\n1,2", encoding="utf-8")
          (base / "photo.png").write_bytes(b"\\x89PNGfake")
          (base / "today.log").write_text("ok", encoding="utf-8")
          (base / "memo.docx").write_text("draft", encoding="utf-8")
          initial = sorted(p.name for p in base.iterdir())

      assert initial == ["memo.docx", "photo.png", "report.csv", "today.log"]
      initial
    exercise:
      prompt: 같은 폴더에 invoice.json을 한 개 더 추가해 initial 리스트가 다섯 이름을 정렬된 상태로 포함하는지 검증하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "report.csv").write_text("a,b\\n1,2", encoding="utf-8")
            (base / "photo.png").write_bytes(b"\\x89PNGfake")
            (base / "today.log").write_text("ok", encoding="utf-8")
            (base / "memo.docx").write_text("draft", encoding="utf-8")
            (base / "___").write_text("{}", encoding="utf-8")
            initial = sorted(p.name for p in base.iterdir())

        assert initial == ["invoice.json", "memo.docx", "photo.png", "report.csv", "today.log"]
        initial
      solution: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "report.csv").write_text("a,b\\n1,2", encoding="utf-8")
            (base / "photo.png").write_bytes(b"\\x89PNGfake")
            (base / "today.log").write_text("ok", encoding="utf-8")
            (base / "memo.docx").write_text("draft", encoding="utf-8")
            (base / "invoice.json").write_text("{}", encoding="utf-8")
            initial = sorted(p.name for p in base.iterdir())

        assert initial == ["invoice.json", "memo.docx", "photo.png", "report.csv", "today.log"]
        initial
      hints:
        - 새 파일 이름은 invoice.json으로 두어 자동화 입력의 다양성을 확보한다.
        - 정렬 결과는 알파벳 순으로 invoice가 가장 먼저 나온다.
      check:
        type: noError
        noError: 다섯 파일을 차례로 만들고 iterdir로 정렬하는 코드가 끝나야 한다.
        resultCheck: initial 리스트가 다섯 파일 이름을 정렬된 형태로 담아야 한다.
    check:
      noError: 네 파일을 만들고 정렬된 이름을 모으는 코드가 끝나야 한다.
      resultCheck: initial 리스트가 네 파일 이름을 정렬된 상태로 정확히 담아야 한다.
  - id: organize-cycle
    title: 분류 함수와 백업 합치기
    structuredPrimary: true
    subtitle: organize + archive
    goal: 분류 결과를 archive 폴더에 복제해 원본 정리와 백업이 한 사이클에서 함께 끝나도록 한다.
    why: 자동화 정리는 한 번에 정리와 백업을 함께 수행해야 다음 사이클에서 원본이 사라져도 archive에서 복구할 수 있다.
    explanation: organizeAndBackup 함수는 rules dict로 분류한 뒤 같은 결과를 archive 폴더에 한 번 더 복제한다. archive 폴더는 분류 폴더와 같은 base 안에 두어 동일 디스크의 빠른 복사를 활용한다. 결과 dict는 어떤 파일이 어디로 갔고 어떤 백업이 만들어졌는지 동시에 보여 준다.
    tips:
      - archive 안에는 분류 폴더 구조를 그대로 복제해야 검색이 쉽다.
      - 백업 사이클은 절대로 원본을 다시 만들지 않으므로 원본 일관성이 유지된다.
    snippet: |-
      import shutil
      import tempfile
      from pathlib import Path


      rules = {".csv": "tabular", ".json": "tabular", ".png": "images", ".log": "logs"}


      def organizeAndBackup(base: Path, archive: Path) -> dict:
          report = {"moved": [], "archived": []}
          archive.mkdir(parents=True, exist_ok=True)
          for path in sorted(base.iterdir()):
              if not path.is_file():
                  continue
              category = rules.get(path.suffix.lower(), "_other")
              destination = base / category / path.name
              destination.parent.mkdir(parents=True, exist_ok=True)
              shutil.move(path, destination)
              report["moved"].append(f"{category}/{path.name}")
              archived = archive / category / path.name
              archived.parent.mkdir(parents=True, exist_ok=True)
              shutil.copy2(destination, archived)
              report["archived"].append(f"{category}/{path.name}")
          return report


      with tempfile.TemporaryDirectory() as td:
          base = Path(td) / "downloads"
          archive = Path(td) / "archive"
          base.mkdir()
          (base / "metric.csv").write_text("a,b", encoding="utf-8")
          (base / "photo.png").write_bytes(b"\\x89PNGfake")
          report = organizeAndBackup(base, archive)

      assert report == {
          "moved": ["tabular/metric.csv", "images/photo.png"],
          "archived": ["tabular/metric.csv", "images/photo.png"],
      }
      report
    exercise:
      prompt: 같은 사이클에 stale.log 파일을 추가하면 logs/stale.log가 moved와 archived 양쪽에 모두 들어가는지 검증하세요.
      starterCode: |-
        import shutil
        import tempfile
        from pathlib import Path


        rules = {".csv": "tabular", ".png": "images", "___": "logs"}


        def organizeAndBackup(base: Path, archive: Path) -> dict:
            report = {"moved": [], "archived": []}
            archive.mkdir(parents=True, exist_ok=True)
            for path in sorted(base.iterdir()):
                if not path.is_file():
                    continue
                category = rules.get(path.suffix.lower(), "_other")
                destination = base / category / path.name
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(path, destination)
                report["moved"].append(f"{category}/{path.name}")
                archived = archive / category / path.name
                archived.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(destination, archived)
                report["archived"].append(f"{category}/{path.name}")
            return report


        with tempfile.TemporaryDirectory() as td:
            base = Path(td) / "downloads"
            archive = Path(td) / "archive"
            base.mkdir()
            (base / "metric.csv").write_text("a,b", encoding="utf-8")
            (base / "stale.log").write_text("err", encoding="utf-8")
            report = organizeAndBackup(base, archive)

        assert report == {
            "moved": ["tabular/metric.csv", "logs/stale.log"],
            "archived": ["tabular/metric.csv", "logs/stale.log"],
        }
        report
      solution: |-
        import shutil
        import tempfile
        from pathlib import Path


        rules = {".csv": "tabular", ".png": "images", ".log": "logs"}


        def organizeAndBackup(base: Path, archive: Path) -> dict:
            report = {"moved": [], "archived": []}
            archive.mkdir(parents=True, exist_ok=True)
            for path in sorted(base.iterdir()):
                if not path.is_file():
                    continue
                category = rules.get(path.suffix.lower(), "_other")
                destination = base / category / path.name
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(path, destination)
                report["moved"].append(f"{category}/{path.name}")
                archived = archive / category / path.name
                archived.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(destination, archived)
                report["archived"].append(f"{category}/{path.name}")
            return report


        with tempfile.TemporaryDirectory() as td:
            base = Path(td) / "downloads"
            archive = Path(td) / "archive"
            base.mkdir()
            (base / "metric.csv").write_text("a,b", encoding="utf-8")
            (base / "stale.log").write_text("err", encoding="utf-8")
            report = organizeAndBackup(base, archive)

        assert report == {
            "moved": ["tabular/metric.csv", "logs/stale.log"],
            "archived": ["tabular/metric.csv", "logs/stale.log"],
        }
        report
      hints:
        - rules dict에 ".log" 키를 추가해야 logs 폴더로 분류된다.
        - 정렬된 iterdir 결과는 csv가 먼저 log가 뒤로 처리된다.
      check:
        type: noError
        noError: organizeAndBackup 함수 호출이 PermissionError 없이 끝나야 한다.
        resultCheck: report.moved와 report.archived가 같은 두 경로를 본문 순서대로 담아야 한다.
    check:
      noError: 분류와 백업이 한 함수 호출에서 끝나야 한다.
      resultCheck: report dict가 moved와 archived 두 키에 동일한 결과를 담아야 한다.
  - id: report-save
    title: JSON 리포트 저장
    structuredPrimary: true
    subtitle: generatedAt 포함 dict
    goal: 분류와 백업 결과를 JSON 리포트로 저장해 다음 사이클이 비교할 수 있게 한다.
    why: 자동화 리포트가 영속화되어 있어야 운영자가 어제와 오늘의 차이를 볼 수 있고 사고가 났을 때 추적이 가능하다.
    explanation: 리포트 dict는 generatedAt, moved, archived 세 키를 가진다. datetime.now(UTC).isoformat으로 표준 ISO 시각을 만들고 json.dumps(ensure_ascii=False, indent=2)로 사람이 읽을 수 있게 저장한다. 같은 폴더에 reports/last.json 파일을 두면 다음 사이클이 그것을 읽어 비교할 수 있다.
    tips:
      - generatedAt 키는 항상 UTC로 두어 다른 머신과 비교가 쉽다.
      - JSON 저장 후 같은 셀에서 다시 읽으면 직렬화가 무결한지 즉시 검증할 수 있다.
    snippet: |-
      import json
      import tempfile
      from datetime import UTC, datetime
      from pathlib import Path


      def saveReport(base: Path, payload: dict) -> Path:
          reportsDir = base / "reports"
          reportsDir.mkdir(parents=True, exist_ok=True)
          payload = dict(payload)
          payload["generatedAt"] = datetime.now(UTC).isoformat(timespec="seconds")
          target = reportsDir / "last.json"
          target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
          return target


      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          target = saveReport(base, {"moved": ["a"], "archived": ["a"]})
          restored = json.loads(target.read_text(encoding="utf-8"))

      assert restored["moved"] == ["a"]
      assert restored["archived"] == ["a"]
      assert "generatedAt" in restored
      restored
    exercise:
      prompt: saveReport에 moved에 두 경로, archived에 같은 두 경로를 넘기고 generatedAt이 누락되지 않는지 검증하세요.
      starterCode: |-
        import json
        import tempfile
        from datetime import UTC, datetime
        from pathlib import Path


        def saveReport(base: Path, payload: dict) -> Path:
            reportsDir = base / "reports"
            reportsDir.mkdir(parents=True, exist_ok=True)
            payload = dict(payload)
            payload["___"] = datetime.now(UTC).isoformat(timespec="seconds")
            target = reportsDir / "last.json"
            target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
            return target


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            target = saveReport(base, {"moved": ["x", "y"], "archived": ["x", "y"]})
            restored = json.loads(target.read_text(encoding="utf-8"))

        assert restored["moved"] == ["x", "y"]
        assert restored["archived"] == ["x", "y"]
        assert "generatedAt" in restored
        restored
      solution: |-
        import json
        import tempfile
        from datetime import UTC, datetime
        from pathlib import Path


        def saveReport(base: Path, payload: dict) -> Path:
            reportsDir = base / "reports"
            reportsDir.mkdir(parents=True, exist_ok=True)
            payload = dict(payload)
            payload["generatedAt"] = datetime.now(UTC).isoformat(timespec="seconds")
            target = reportsDir / "last.json"
            target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
            return target


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            target = saveReport(base, {"moved": ["x", "y"], "archived": ["x", "y"]})
            restored = json.loads(target.read_text(encoding="utf-8"))

        assert restored["moved"] == ["x", "y"]
        assert restored["archived"] == ["x", "y"]
        assert "generatedAt" in restored
        restored
      hints:
        - generatedAt 키 이름은 camelCase로 통일한다.
        - 리포트 dict는 함수 안에서 복사해 둬야 호출자의 payload가 변경되지 않는다.
      check:
        type: noError
        noError: saveReport 호출과 JSON 왕복이 IOError 없이 끝나야 한다.
        resultCheck: restored 딕셔너리가 두 키와 generatedAt까지 정확히 채워져야 한다.
    check:
      noError: JSON 직렬화와 디스크 쓰기, 다시 읽기가 끝나야 한다.
      resultCheck: restored 딕셔너리가 moved, archived, generatedAt 세 키를 모두 가져야 한다.
  - id: idempotent-cycle
    title: 멱등 사이클 종합 완성
    structuredPrimary: true
    subtitle: 같은 입력 두 번 실행
    goal: 분류와 백업, 리포트 저장까지 묶은 종합 함수가 두 번째 실행에서는 moved가 비어 있는 안정 상태로 마무리한다.
    why: 자동화 정리 사이클은 두 번째 실행이 첫 번째와 같은 결과를 만들어야 하며, 그렇지 않으면 운영자가 안심하고 스케줄에 올릴 수 없다.
    explanation: cleanupOnce 함수는 폴더에 정리되지 않은 파일이 있을 때만 분류와 백업을 진행한다. 모든 파일이 이미 카테고리 폴더 안에 있으면 moved가 비어 있는 보고가 만들어진다. 두 번째 호출에서 빈 moved가 나오면 사이클이 멱등하게 안정화되었음을 의미한다.
    tips:
      - 두 번째 사이클의 moved가 비어 있다면 이전 결과가 그대로 유지된 안정 상태다.
      - 사이클 종합 리포트는 archived 리스트가 누적되지 않게 매 호출마다 새로 만든다.
    snippet: |-
      import json
      import shutil
      import tempfile
      from datetime import UTC, datetime
      from pathlib import Path


      rules = {".csv": "tabular", ".png": "images", ".log": "logs"}


      def cleanupOnce(base: Path, archive: Path) -> dict:
          report = {"moved": [], "archived": []}
          archive.mkdir(parents=True, exist_ok=True)
          for path in sorted(base.iterdir()):
              if not path.is_file():
                  continue
              category = rules.get(path.suffix.lower(), "_other")
              destination = base / category / path.name
              destination.parent.mkdir(parents=True, exist_ok=True)
              shutil.move(path, destination)
              report["moved"].append(f"{category}/{path.name}")
              archived = archive / category / path.name
              archived.parent.mkdir(parents=True, exist_ok=True)
              shutil.copy2(destination, archived)
              report["archived"].append(f"{category}/{path.name}")
          report["generatedAt"] = datetime.now(UTC).isoformat(timespec="seconds")
          return report


      with tempfile.TemporaryDirectory() as td:
          base = Path(td) / "downloads"
          archive = Path(td) / "archive"
          base.mkdir()
          (base / "metric.csv").write_text("", encoding="utf-8")
          (base / "photo.png").write_bytes(b"x")
          firstReport = cleanupOnce(base, archive)
          secondReport = cleanupOnce(base, archive)

      assert firstReport["moved"] == ["tabular/metric.csv", "images/photo.png"]
      assert secondReport["moved"] == []
      assert secondReport["archived"] == []
      {"first": firstReport["moved"], "second": secondReport["moved"]}
    exercise:
      prompt: cleanupOnce를 두 번 호출한 뒤 두 번째 보고의 moved와 archived가 모두 빈 리스트가 되어 종합 사이클이 멱등하게 마무리되는지 검증하세요.
      starterCode: |-
        import json
        import shutil
        import tempfile
        from datetime import UTC, datetime
        from pathlib import Path


        rules = {".csv": "tabular", ".png": "images", ".log": "logs"}


        def cleanupOnce(base: Path, archive: Path) -> dict:
            report = {"moved": [], "archived": []}
            archive.mkdir(parents=True, exist_ok=True)
            for path in sorted(base.iterdir()):
                if not path.is_file():
                    continue
                category = rules.get(path.suffix.lower(), "_other")
                destination = base / category / path.name
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(path, destination)
                report["moved"].append(f"{category}/{path.name}")
                archived = archive / category / path.name
                archived.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(destination, archived)
                report["archived"].append(f"{category}/{path.name}")
            report["generatedAt"] = datetime.now(UTC).isoformat(timespec="seconds")
            return report


        with tempfile.TemporaryDirectory() as td:
            base = Path(td) / "downloads"
            archive = Path(td) / "archive"
            base.mkdir()
            (base / "metric.csv").write_text("", encoding="utf-8")
            (base / "stale.log").write_text("", encoding="utf-8")
            firstReport = cleanupOnce(base, archive)
            secondReport = cleanupOnce(base, archive)

        assert firstReport["moved"] == ["tabular/metric.csv", "logs/stale.log"]
        assert secondReport["moved"] == ___
        assert secondReport["archived"] == []
        {"first": firstReport["moved"], "second": secondReport["moved"]}
      solution: |-
        import json
        import shutil
        import tempfile
        from datetime import UTC, datetime
        from pathlib import Path


        rules = {".csv": "tabular", ".png": "images", ".log": "logs"}


        def cleanupOnce(base: Path, archive: Path) -> dict:
            report = {"moved": [], "archived": []}
            archive.mkdir(parents=True, exist_ok=True)
            for path in sorted(base.iterdir()):
                if not path.is_file():
                    continue
                category = rules.get(path.suffix.lower(), "_other")
                destination = base / category / path.name
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(path, destination)
                report["moved"].append(f"{category}/{path.name}")
                archived = archive / category / path.name
                archived.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(destination, archived)
                report["archived"].append(f"{category}/{path.name}")
            report["generatedAt"] = datetime.now(UTC).isoformat(timespec="seconds")
            return report


        with tempfile.TemporaryDirectory() as td:
            base = Path(td) / "downloads"
            archive = Path(td) / "archive"
            base.mkdir()
            (base / "metric.csv").write_text("", encoding="utf-8")
            (base / "stale.log").write_text("", encoding="utf-8")
            firstReport = cleanupOnce(base, archive)
            secondReport = cleanupOnce(base, archive)

        assert firstReport["moved"] == ["tabular/metric.csv", "logs/stale.log"]
        assert secondReport["moved"] == []
        assert secondReport["archived"] == []
        {"first": firstReport["moved"], "second": secondReport["moved"]}
      hints:
        - 두 번째 사이클은 base에 정리되지 않은 파일이 없어 moved 리스트가 빈 상태가 된다.
        - assert에서 빈 리스트는 그냥 []로 비교한다.
      check:
        type: noError
        noError: cleanupOnce 두 번 호출이 격리 공간에서 끝나야 한다.
        resultCheck: 두 번째 보고의 moved와 archived가 모두 빈 리스트로 종합 사이클의 멱등성을 보여야 한다.
    check:
      noError: cleanupOnce 두 번 호출과 dict 비교가 끝나야 한다.
      resultCheck: firstReport는 두 항목을 담고 secondReport는 빈 리스트를 담아 종합 멱등 사이클이 완성되어야 한다.
`;export{e as default};