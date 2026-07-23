var e=`meta:
  id: fileOps_04
  title: 복사·이동·이름 변경
  order: 4
  category: fileOps
  difficulty: easy
  audience: 파일 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - shutil
    - pathlib
    - rename
intro:
  direction: shutil과 pathlib을 함께 써서 임시 폴더 안에서 파일을 복제하고 옮기고 이름을 바꾸며 충돌을 처리한다.
  benefits:
    - shutil.copy2로 메타데이터까지 보존한 복사를 한다.
    - shutil.move로 같은 디스크 안에서 파일을 빠르게 이동한다.
    - Path.rename으로 이름과 경로를 한 번에 바꾼다.
    - 이름 충돌 시 번호를 붙여 회피하는 패턴을 직접 작성한다.
  diagram:
    steps:
      - label: 원본과 대상 폴더 준비
        detail: tempfile 안에 source와 archive 폴더를 만들어 실험 공간을 분리한다.
      - label: 메타 보존 복사
        detail: shutil.copy2로 원본 mtime이 대상에 그대로 옮겨지는지 확인한다.
      - label: 폴더 간 이동
        detail: shutil.move로 source에 있던 파일을 archive로 옮긴다.
      - label: 이름 충돌 회피
        detail: 같은 이름이 이미 있으면 _1, _2 같은 접미사를 붙여 새 경로를 만든다.
    runtime:
      - label: 표준 라이브러리 조합
        detail: pathlib, shutil, tempfile 세 모듈만으로 모든 흐름을 구성한다.
      - label: assert 기반 검증
        detail: 복사·이동 후 원본과 대상 상태를 assert로 확인한다.
sections:
  - id: copy-with-meta
    title: 메타데이터까지 복사하기
    structuredPrimary: true
    subtitle: shutil.copy2의 보존 범위
    goal: 원본 파일의 내용과 수정 시각을 보존하면서 대상 폴더로 복사한다.
    why: 자동화 백업이나 보고서 보관에서는 파일이 만들어진 시점을 유지해야 추적이 가능하므로 copy2의 메타데이터 보존이 중요하다.
    explanation: shutil.copy2는 내용은 물론 stat 정보의 mtime과 access time을 가능한 한 보존한다. shutil.copy는 내용만 복사하고 메타데이터는 새로 설정된다. 대상이 디렉터리이면 같은 이름으로 그 안에 저장되고, 파일 경로이면 그 이름으로 새로 만든다.
    tips:
      - copy2의 두 번째 인자는 파일 경로일 수도 폴더 경로일 수도 있다.
      - 같은 파일에 두 번 copy2를 호출하면 두 번째 호출이 첫 번째 결과를 덮어쓴다.
    snippet: |-
      import shutil
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          source = base / "source" / "summary.txt"
          archive = base / "archive"
          source.parent.mkdir()
          archive.mkdir()
          source.write_text("주문 12건", encoding="utf-8")
          copied = Path(shutil.copy2(source, archive / source.name))
          status = {
              "exists": copied.exists(),
              "sameContent": copied.read_text(encoding="utf-8") == "주문 12건",
              "mtimeMatch": copied.stat().st_mtime == source.stat().st_mtime,
          }

      assert status == {"exists": True, "sameContent": True, "mtimeMatch": True}
      status
    exercise:
      prompt: report.csv 파일을 source 폴더에 만들고 archive 폴더 안에 같은 이름으로 copy2를 호출해 status dict에 세 가지 결과가 True로 모이게 하세요.
      starterCode: |-
        import shutil
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            source = base / "source" / "___"
            archive = base / "archive"
            source.parent.mkdir()
            archive.mkdir()
            source.write_text("a,b\\n1,2", encoding="utf-8")
            copied = Path(shutil.___(source, archive / source.name))
            status = {
                "exists": copied.exists(),
                "sameContent": copied.read_text(encoding="utf-8") == "a,b\\n1,2",
                "mtimeMatch": copied.stat().st_mtime == source.stat().st_mtime,
            }

        assert status == {"exists": True, "sameContent": True, "mtimeMatch": True}
        status
      solution: |-
        import shutil
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            source = base / "source" / "report.csv"
            archive = base / "archive"
            source.parent.mkdir()
            archive.mkdir()
            source.write_text("a,b\\n1,2", encoding="utf-8")
            copied = Path(shutil.copy2(source, archive / source.name))
            status = {
                "exists": copied.exists(),
                "sameContent": copied.read_text(encoding="utf-8") == "a,b\\n1,2",
                "mtimeMatch": copied.stat().st_mtime == source.stat().st_mtime,
            }

        assert status == {"exists": True, "sameContent": True, "mtimeMatch": True}
        status
      hints:
        - 파일 이름은 변수로 한 번만 정해서 source와 archive 양쪽에서 같은 이름이 쓰이게 한다.
        - copy2가 정답이며 copy는 mtime이 새로 갱신되어 비교가 실패한다.
      check:
        type: noError
        noError: copy2 호출과 stat 비교가 PermissionError 없이 끝나야 한다.
        resultCheck: status 딕셔너리의 세 키가 모두 True여야 한다.
    check:
      noError: source 작성과 copy2 호출, copied stat 비교가 차례로 끝나야 한다.
      resultCheck: status가 exists, sameContent, mtimeMatch 모두 True인 dict여야 한다.
  - id: move-between-folders
    title: 폴더 간 파일 이동
    structuredPrimary: true
    subtitle: shutil.move로 원본 정리
    goal: 처리한 파일을 결과 폴더로 옮기고 원본 폴더에는 흔적이 남지 않도록 한다.
    why: 자동화 파이프라인은 처리 대기 폴더와 처리 완료 폴더를 분리해 같은 파일을 두 번 처리하지 않게 만들어야 한다.
    explanation: shutil.move는 같은 디스크에서는 rename으로 빠르게 처리하고 다른 디스크에서는 copy2 + 삭제로 동작한다. 원본 파일은 이동 후 사라지므로 처리 완료 표시로 사용할 수 있다. 폴더 자체도 이동할 수 있지만 자동화에서는 파일 단위가 안전하다.
    tips:
      - 이동 후 원본 경로는 더 이상 존재하지 않으므로 read_text 같은 추가 호출을 피한다.
      - 같은 디스크 안의 이동은 매우 빠르며 mtime이 그대로 유지된다.
    snippet: |-
      import shutil
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          inbox = base / "inbox"
          done = base / "done"
          inbox.mkdir()
          done.mkdir()
          incoming = inbox / "order.json"
          incoming.write_text("{}", encoding="utf-8")
          moved = Path(shutil.move(incoming, done / incoming.name))
          status = {"sourceLeft": incoming.exists(), "movedExists": moved.exists()}

      assert status == {"sourceLeft": False, "movedExists": True}
      status
    exercise:
      prompt: backlog 폴더에 ticket.md를 만들고 archive 폴더로 이동시켜 원본은 사라지고 대상만 남는지 검증하세요.
      starterCode: |-
        import shutil
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            backlog = base / "backlog"
            archive = base / "archive"
            backlog.mkdir()
            archive.mkdir()
            incoming = backlog / "___"
            incoming.write_text("# todo", encoding="utf-8")
            moved = Path(shutil.___(incoming, archive / incoming.name))
            status = {"sourceLeft": incoming.exists(), "movedExists": moved.exists()}

        assert status == {"sourceLeft": False, "movedExists": True}
        status
      solution: |-
        import shutil
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            backlog = base / "backlog"
            archive = base / "archive"
            backlog.mkdir()
            archive.mkdir()
            incoming = backlog / "ticket.md"
            incoming.write_text("# todo", encoding="utf-8")
            moved = Path(shutil.move(incoming, archive / incoming.name))
            status = {"sourceLeft": incoming.exists(), "movedExists": moved.exists()}

        assert status == {"sourceLeft": False, "movedExists": True}
        status
      hints:
        - 함수 이름은 shutil.move이고 첫 인자가 원본이며 두 번째 인자가 대상이다.
        - 이동이 끝난 뒤 원본 exists는 False가 되어야 자동화 흐름이 안전하다.
      check:
        type: noError
        noError: shutil.move 호출이 FileExistsError 없이 끝나야 한다.
        resultCheck: status 딕셔너리에서 sourceLeft는 False, movedExists는 True여야 한다.
    check:
      noError: 이동 호출과 양쪽 exists 확인이 격리 공간에서 끝나야 한다.
      resultCheck: status가 원본은 없고 대상만 있는 상태를 명확히 드러내야 한다.
  - id: rename-with-suffix
    title: 이름과 확장자 바꾸기
    structuredPrimary: true
    subtitle: Path.rename + with_suffix
    goal: 한 번의 rename으로 이름과 확장자를 동시에 바꿔 자동화 결과물의 표기를 정리한다.
    why: 자동화 결과 파일은 단계별로 임시 확장자가 붙는 경우가 많아 마지막에 .yaml이나 .csv로 깔끔하게 바꿔 두면 다음 사용자가 헷갈리지 않는다.
    explanation: Path.rename은 같은 디렉터리든 다른 디렉터리든 새 경로로 파일을 이동시키며 결과 Path를 돌려준다. 확장자만 바꾸려면 with_suffix와 결합한다. 이미 같은 이름이 있다면 FileExistsError가 발생하므로 exists로 미리 확인하거나 충돌 회피 패턴을 적용한다.
    tips:
      - rename은 OS의 rename 시스템 콜을 그대로 부르므로 같은 디스크 안에서 매우 빠르다.
      - 결과 Path를 반환받지 못하면 이후 코드가 옛 경로를 그대로 참조해 오류가 난다.
    snippet: |-
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          draft = base / "report.tmp"
          draft.write_text("ok", encoding="utf-8")
          final = draft.rename(draft.with_suffix(".csv"))
          status = {
              "draftGone": draft.exists(),
              "finalExists": final.exists(),
              "finalName": final.name,
          }

      assert status == {"draftGone": False, "finalExists": True, "finalName": "report.csv"}
      status
    exercise:
      prompt: capture.tmp 파일을 capture.png로 바꿔 최종 이름과 사라진 원본을 검증하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            draft = base / "___"
            draft.write_text("png bytes", encoding="utf-8")
            final = draft.rename(draft.with_suffix(".___"))
            status = {
                "draftGone": draft.exists(),
                "finalExists": final.exists(),
                "finalName": final.name,
            }

        assert status == {"draftGone": False, "finalExists": True, "finalName": "capture.png"}
        status
      solution: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            draft = base / "capture.tmp"
            draft.write_text("png bytes", encoding="utf-8")
            final = draft.rename(draft.with_suffix(".png"))
            status = {
                "draftGone": draft.exists(),
                "finalExists": final.exists(),
                "finalName": final.name,
            }

        assert status == {"draftGone": False, "finalExists": True, "finalName": "capture.png"}
        status
      hints:
        - 임시 파일 이름과 with_suffix 인자, assert 마지막 이름이 모두 일치해야 한다.
        - with_suffix는 점을 포함한 문자열을 받으므로 ".png" 형태로 넘긴다.
      check:
        type: noError
        noError: rename과 with_suffix가 OSError 없이 끝나야 한다.
        resultCheck: status에서 finalName이 capture.png이고 draftGone이 False여야 한다.
    check:
      noError: rename 호출과 결과 Path 사용이 정상 흐름으로 끝나야 한다.
      resultCheck: status가 draftGone False, finalExists True, finalName "report.csv"여야 한다.
  - id: collision-strategy
    title: 이름 충돌 회피 종합 정리
    structuredPrimary: true
    subtitle: 접미사 번호로 자동 해소
    goal: 같은 이름이 이미 있을 때 _1, _2 같은 접미사를 자동으로 붙여 새 경로를 만든다.
    why: 자동화가 같은 폴더에 반복 실행되면 이름 충돌이 자주 일어나므로 사람 개입 없이 안전한 새 이름을 만드는 패턴이 필수다.
    explanation: 마지막 섹션은 작은 함수로 충돌 회피 패턴을 정리한다. 대상 파일이 이미 있으면 stem에 _1을 붙여 새 경로를 시도하고, 그것도 있으면 _2로 올린다. while 루프와 with_name 메서드를 결합하면 자동화 안에서 재사용 가능한 유틸리티가 된다.
    tips:
      - with_name은 디렉터리를 유지한 채 파일명만 바꾼 Path를 만든다.
      - 함수형 유틸리티로 분리하면 다음 레슨의 백업 흐름에서 그대로 재사용할 수 있다.
    snippet: |-
      import shutil
      import tempfile
      from pathlib import Path


      def uniqueTarget(target: Path) -> Path:
          if not target.exists():
              return target
          counter = 1
          while True:
              candidate = target.with_name(f"{target.stem}_{counter}{target.suffix}")
              if not candidate.exists():
                  return candidate
              counter += 1


      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          archive = base / "archive"
          archive.mkdir()
          (archive / "report.txt").write_text("first", encoding="utf-8")
          source = base / "report.txt"
          source.write_text("second", encoding="utf-8")
          finalPath = Path(shutil.copy2(source, uniqueTarget(archive / source.name)))
          names = sorted(item.name for item in archive.iterdir())

      assert finalPath.name == "report_1.txt"
      assert names == ["report.txt", "report_1.txt"]
      {"final": finalPath.name, "names": names}
    exercise:
      prompt: archive에 note.md가 이미 있을 때 새 note.md를 복사하면 note_1.md로 저장되고, 같은 단계를 한 번 더 반복하면 note_2.md가 생성되는지 종합 검증하세요.
      starterCode: |-
        import shutil
        import tempfile
        from pathlib import Path


        def uniqueTarget(target: Path) -> Path:
            if not target.exists():
                return target
            counter = 1
            while True:
                candidate = target.with_name(f"{target.stem}_{counter}{target.suffix}")
                if not candidate.exists():
                    return candidate
                counter += 1


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            archive = base / "archive"
            archive.mkdir()
            (archive / "note.md").write_text("first", encoding="utf-8")
            source = base / "note.md"
            source.write_text("second", encoding="utf-8")
            firstFinal = Path(shutil.copy2(source, uniqueTarget(archive / source.name)))
            secondFinal = Path(shutil.copy2(source, uniqueTarget(archive / source.name)))
            names = sorted(item.name for item in archive.iterdir())

        assert firstFinal.name == "___"
        assert secondFinal.name == "___"
        assert names == ["note.md", "note_1.md", "note_2.md"]
        {"first": firstFinal.name, "second": secondFinal.name}
      solution: |-
        import shutil
        import tempfile
        from pathlib import Path


        def uniqueTarget(target: Path) -> Path:
            if not target.exists():
                return target
            counter = 1
            while True:
                candidate = target.with_name(f"{target.stem}_{counter}{target.suffix}")
                if not candidate.exists():
                    return candidate
                counter += 1


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            archive = base / "archive"
            archive.mkdir()
            (archive / "note.md").write_text("first", encoding="utf-8")
            source = base / "note.md"
            source.write_text("second", encoding="utf-8")
            firstFinal = Path(shutil.copy2(source, uniqueTarget(archive / source.name)))
            secondFinal = Path(shutil.copy2(source, uniqueTarget(archive / source.name)))
            names = sorted(item.name for item in archive.iterdir())

        assert firstFinal.name == "note_1.md"
        assert secondFinal.name == "note_2.md"
        assert names == ["note.md", "note_1.md", "note_2.md"]
        {"first": firstFinal.name, "second": secondFinal.name}
      hints:
        - 처음 충돌에서는 _1이 붙고 다음 호출에서는 카운터가 다시 시작해 _2가 붙는다.
        - 파일이 늘어날수록 정렬된 names 결과에 새 이름이 추가된다.
      check:
        type: noError
        noError: uniqueTarget 함수와 copy2 호출이 두 번 모두 통과해야 한다.
        resultCheck: 첫 결과는 note_1.md, 두 번째 결과는 note_2.md여야 한다.
    check:
      noError: 함수 정의와 copy2 호출이 격리 공간에서 정상적으로 끝나야 한다.
      resultCheck: 최종 이름이 report_1.txt이고 archive에 두 파일이 모두 존재해야 한다.
`;export{e as default};