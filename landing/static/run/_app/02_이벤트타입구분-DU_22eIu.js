var e=`meta:\r
  id: watchSched_02\r
  title: 이벤트 타입 구분\r
  order: 2\r
  category: watchSched\r
  difficulty: easy\r
  audience: 폴더 이벤트와 스케줄 자동화에 입문하는 Python 학습자\r
  packages:\r
    - watchdog\r
  tags:\r
    - watchdog\r
    - events\r
    - classify\r
intro:\r
  direction: watchdog의 on_created, on_modified, on_deleted, on_moved 콜백을 모두 구현해 한 폴더 안에서 일어나는 모든 변화를 분류한다.\r
  benefits:\r
    - 네 가지 이벤트 타입을 분리해 분류 dict를 만든다.\r
    - 자식 디렉터리 이벤트와 파일 이벤트를 구분한다.\r
    - 자동화 보고용 표준 이벤트 dict 구조를 정한다.\r
    - 종합 감시 함수가 모든 이벤트 타입을 한 번에 처리한다.\r
  diagram:\r
    steps:\r
      - label: 분류 핸들러 정의\r
        detail: FileSystemEventHandler를 상속해 네 콜백을 모두 구현한다.\r
      - label: 파일 생성과 수정\r
        detail: write_text 두 번으로 created와 modified를 함께 발생시킨다.\r
      - label: 삭제와 이동\r
        detail: unlink와 rename으로 deleted와 moved를 발생시킨다.\r
      - label: 종합 분류 결과\r
        detail: 모인 이벤트를 type별 리스트로 묶은 dict로 종합 정리한다.\r
    runtime:\r
      - label: watchdog 패키지 필요\r
        detail: meta.packages의 watchdog이 로컬 가상환경에 준비되어야 한다.\r
      - label: assert 기반 검증\r
        detail: 분류 dict의 각 키 리스트와 기대값을 assert로 비교한다.\r
sections:\r
  - id: classify-handler\r
    title: 분류 핸들러 만들기\r
    structuredPrimary: true\r
    subtitle: 네 콜백 한 곳에서\r
    goal: 네 가지 이벤트 콜백을 가진 단일 핸들러로 모든 변화를 한 dict에 분류한다.\r
    why: 자동화 감시는 이벤트 타입별로 다른 처리를 해야 하므로 분류 핸들러가 표준 시작점이다.\r
    explanation: FileSystemEventHandler의 네 메서드를 모두 오버라이드해 같은 events dict에 type별 리스트로 누적한다. 각 콜백은 type 이름 키에 src_path를 append한다. 이 dict가 종합 보고서의 표준 입력이 된다.\r
    tips:\r
      - 콜백 안에서는 무거운 작업을 피하고 데이터 수집만 한다.\r
      - is_directory가 True인 이벤트는 별도 처리할지 결정한다.\r
    snippet: |-\r
      from watchdog.events import FileSystemEventHandler\r
\r
\r
      class EventClassifier(FileSystemEventHandler):\r
          def __init__(self) -> None:\r
              super().__init__()\r
              self.events = {"created": [], "modified": [], "deleted": [], "moved": []}\r
\r
          def on_created(self, event):\r
              self.events["created"].append(event.src_path)\r
\r
          def on_modified(self, event):\r
              self.events["modified"].append(event.src_path)\r
\r
          def on_deleted(self, event):\r
              self.events["deleted"].append(event.src_path)\r
\r
          def on_moved(self, event):\r
              self.events["moved"].append((event.src_path, event.dest_path))\r
\r
\r
      classifier = EventClassifier()\r
      classifier.on_created(type("E", (), {"src_path": "a"})())\r
      classifier.on_deleted(type("E", (), {"src_path": "a"})())\r
\r
      assert classifier.events["created"] == ["a"]\r
      assert classifier.events["deleted"] == ["a"]\r
      classifier.events\r
    exercise:\r
      prompt: EventClassifier로 modified와 moved 콜백을 한 번씩 호출해 두 키 리스트가 본문 기대값과 같은지 검증하세요.\r
      starterCode: |-\r
        from watchdog.events import FileSystemEventHandler\r
\r
\r
        class EventClassifier(FileSystemEventHandler):\r
            def __init__(self) -> None:\r
                super().__init__()\r
                self.events = {"created": [], "modified": [], "deleted": [], "moved": []}\r
\r
            def on_created(self, event):\r
                self.events["created"].append(event.src_path)\r
\r
            def on_modified(self, event):\r
                self.events["___"].append(event.src_path)\r
\r
            def on_deleted(self, event):\r
                self.events["deleted"].append(event.src_path)\r
\r
            def on_moved(self, event):\r
                self.events["moved"].append((event.src_path, event.dest_path))\r
\r
\r
        classifier = EventClassifier()\r
        classifier.on_modified(type("E", (), {"src_path": "x"})())\r
        classifier.on_moved(type("E", (), {"src_path": "x", "dest_path": "y"})())\r
\r
        assert classifier.events["modified"] == ["x"]\r
        assert classifier.events["moved"] == [("x", "y")]\r
        classifier.events\r
      solution: |-\r
        from watchdog.events import FileSystemEventHandler\r
\r
\r
        class EventClassifier(FileSystemEventHandler):\r
            def __init__(self) -> None:\r
                super().__init__()\r
                self.events = {"created": [], "modified": [], "deleted": [], "moved": []}\r
\r
            def on_created(self, event):\r
                self.events["created"].append(event.src_path)\r
\r
            def on_modified(self, event):\r
                self.events["modified"].append(event.src_path)\r
\r
            def on_deleted(self, event):\r
                self.events["deleted"].append(event.src_path)\r
\r
            def on_moved(self, event):\r
                self.events["moved"].append((event.src_path, event.dest_path))\r
\r
\r
        classifier = EventClassifier()\r
        classifier.on_modified(type("E", (), {"src_path": "x"})())\r
        classifier.on_moved(type("E", (), {"src_path": "x", "dest_path": "y"})())\r
\r
        assert classifier.events["modified"] == ["x"]\r
        assert classifier.events["moved"] == [("x", "y")]\r
        classifier.events\r
      hints:\r
        - modified 키는 events dict에서 동일 문자열 modified다.\r
        - moved 콜백은 src와 dest를 튜플로 모은다.\r
      check:\r
        noError: 분류 핸들러 메서드 호출이 정상적으로 끝나야 한다.\r
        resultCheck: events dict의 modified와 moved가 기대값과 같아야 한다.\r
    check:\r
      noError: 분류 핸들러 콜백 두 번 호출이 끝나야 한다.\r
      resultCheck: events dict의 created와 deleted가 한 src_path씩 담아야 한다.\r
  - id: create-modify\r
    title: 파일 생성과 수정 감지\r
    structuredPrimary: true\r
    subtitle: write_text 두 번\r
    goal: 같은 파일에 두 번 write_text를 호출해 created와 modified 이벤트가 모두 발생하는지 확인한다.\r
    why: 자동화는 같은 파일이 새로 만들어졌는지 갱신됐는지 구분해야 하므로 두 이벤트 차이를 직접 확인한다.\r
    explanation: 첫 write_text는 파일이 없으면 created를 발생시키고, 같은 파일을 한 번 더 쓰면 modified가 발생한다. Observer는 두 이벤트를 모두 핸들러에 전달한다. 파일 시스템 캐시에 따라 modified가 여러 번 발생할 수도 있어 in 비교로 검증한다.\r
    tips:\r
      - sleep 시간을 1초 가까이 두면 이벤트 전파가 안정적이다.\r
      - modified 이벤트는 OS에 따라 여러 번 발생할 수 있어 set 비교가 안전하다.\r
    snippet: |-\r
      import tempfile\r
      import time\r
      from pathlib import Path\r
\r
      from watchdog.events import FileSystemEventHandler\r
      from watchdog.observers import Observer\r
\r
\r
      class EventClassifier(FileSystemEventHandler):\r
          def __init__(self):\r
              super().__init__()\r
              self.events = {"created": [], "modified": [], "deleted": [], "moved": []}\r
\r
          def on_created(self, event):\r
              self.events["created"].append(Path(event.src_path).name)\r
\r
          def on_modified(self, event):\r
              if not event.is_directory:\r
                  self.events["modified"].append(Path(event.src_path).name)\r
\r
          def on_deleted(self, event):\r
              self.events["deleted"].append(Path(event.src_path).name)\r
\r
          def on_moved(self, event):\r
              self.events["moved"].append((Path(event.src_path).name, Path(event.dest_path).name))\r
\r
\r
      classifier = EventClassifier()\r
      with tempfile.TemporaryDirectory() as td:\r
          base = Path(td)\r
          observer = Observer()\r
          observer.schedule(classifier, str(base), recursive=False)\r
          observer.start()\r
          try:\r
              (base / "note.txt").write_text("first", encoding="utf-8")\r
              time.sleep(0.6)\r
              (base / "note.txt").write_text("second", encoding="utf-8")\r
              time.sleep(0.6)\r
          finally:\r
              observer.stop()\r
              observer.join()\r
\r
      assert "note.txt" in classifier.events["created"]\r
      assert "note.txt" in classifier.events["modified"]\r
      classifier.events["modified"][:3]\r
    exercise:\r
      prompt: 같은 흐름으로 daily.log 파일에 두 번 write_text를 호출해 created와 modified 양쪽에서 daily.log가 발견되는지 검증하세요.\r
      starterCode: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import FileSystemEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        class EventClassifier(FileSystemEventHandler):\r
            def __init__(self):\r
                super().__init__()\r
                self.events = {"created": [], "modified": [], "deleted": [], "moved": []}\r
\r
            def on_created(self, event):\r
                self.events["created"].append(Path(event.src_path).name)\r
\r
            def on_modified(self, event):\r
                if not event.is_directory:\r
                    self.events["modified"].append(Path(event.src_path).name)\r
\r
            def on_deleted(self, event):\r
                self.events["deleted"].append(Path(event.src_path).name)\r
\r
            def on_moved(self, event):\r
                self.events["moved"].append((Path(event.src_path).name, Path(event.dest_path).name))\r
\r
\r
        classifier = EventClassifier()\r
        with tempfile.TemporaryDirectory() as td:\r
            base = Path(td)\r
            observer = Observer()\r
            observer.schedule(classifier, str(base), recursive=False)\r
            observer.start()\r
            try:\r
                (base / "___").write_text("a", encoding="utf-8")\r
                time.sleep(0.6)\r
                (base / "daily.log").write_text("b", encoding="utf-8")\r
                time.sleep(0.6)\r
            finally:\r
                observer.stop()\r
                observer.join()\r
\r
        assert "daily.log" in classifier.events["created"]\r
        assert "daily.log" in classifier.events["modified"]\r
        classifier.events["modified"][:3]\r
      solution: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import FileSystemEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        class EventClassifier(FileSystemEventHandler):\r
            def __init__(self):\r
                super().__init__()\r
                self.events = {"created": [], "modified": [], "deleted": [], "moved": []}\r
\r
            def on_created(self, event):\r
                self.events["created"].append(Path(event.src_path).name)\r
\r
            def on_modified(self, event):\r
                if not event.is_directory:\r
                    self.events["modified"].append(Path(event.src_path).name)\r
\r
            def on_deleted(self, event):\r
                self.events["deleted"].append(Path(event.src_path).name)\r
\r
            def on_moved(self, event):\r
                self.events["moved"].append((Path(event.src_path).name, Path(event.dest_path).name))\r
\r
\r
        classifier = EventClassifier()\r
        with tempfile.TemporaryDirectory() as td:\r
            base = Path(td)\r
            observer = Observer()\r
            observer.schedule(classifier, str(base), recursive=False)\r
            observer.start()\r
            try:\r
                (base / "daily.log").write_text("a", encoding="utf-8")\r
                time.sleep(0.6)\r
                (base / "daily.log").write_text("b", encoding="utf-8")\r
                time.sleep(0.6)\r
            finally:\r
                observer.stop()\r
                observer.join()\r
\r
        assert "daily.log" in classifier.events["created"]\r
        assert "daily.log" in classifier.events["modified"]\r
        classifier.events["modified"][:3]\r
      hints:\r
        - 두 write_text 모두 daily.log 동일 파일에 대해 호출되어야 한다.\r
        - 첫 write는 created를, 두 번째 write는 modified를 발생시킨다.\r
      check:\r
        noError: 두 번의 write_text와 Observer 정리가 끝나야 한다.\r
        resultCheck: classifier.events["created"]와 ["modified"] 모두 daily.log를 포함해야 한다.\r
    check:\r
      noError: Observer 흐름과 두 번의 write_text가 정상적으로 끝나야 한다.\r
      resultCheck: events의 created와 modified 모두 note.txt를 포함해야 한다.\r
  - id: delete-move\r
    title: 삭제와 이동 감지\r
    structuredPrimary: true\r
    subtitle: unlink와 rename\r
    goal: unlink와 rename으로 deleted와 moved 이벤트를 각각 발생시키고 분류 dict에 모인다.\r
    why: 자동화 감시는 파일이 사라지거나 이동했을 때도 정확히 추적해야 운영자가 사고를 빨리 파악할 수 있다.\r
    explanation: Path.unlink는 deleted 이벤트, Path.rename은 moved 이벤트를 발생시킨다. moved 이벤트는 src와 dest 두 경로를 포함하므로 핸들러가 튜플로 모은다. 짧은 sleep 후 정리하면 두 이벤트가 모두 전달된다.\r
    tips:\r
      - rename은 OS에 따라 deleted와 created 두 이벤트로 표현될 수도 있다.\r
      - moved 콜백이 호출되지 않으면 deleted와 created 두 이벤트를 합쳐 처리한다.\r
    snippet: |-\r
      import tempfile\r
      import time\r
      from pathlib import Path\r
\r
      from watchdog.events import FileSystemEventHandler\r
      from watchdog.observers import Observer\r
\r
\r
      class EventClassifier(FileSystemEventHandler):\r
          def __init__(self):\r
              super().__init__()\r
              self.events = {"created": [], "modified": [], "deleted": [], "moved": []}\r
\r
          def on_created(self, event):\r
              self.events["created"].append(Path(event.src_path).name)\r
\r
          def on_deleted(self, event):\r
              self.events["deleted"].append(Path(event.src_path).name)\r
\r
          def on_moved(self, event):\r
              self.events["moved"].append((Path(event.src_path).name, Path(event.dest_path).name))\r
\r
\r
      classifier = EventClassifier()\r
      with tempfile.TemporaryDirectory() as td:\r
          base = Path(td)\r
          target = base / "ticket.md"\r
          target.write_text("draft", encoding="utf-8")\r
          time.sleep(0.4)\r
          observer = Observer()\r
          observer.schedule(classifier, str(base), recursive=False)\r
          observer.start()\r
          try:\r
              target.rename(base / "ticket.archived.md")\r
              time.sleep(0.6)\r
              (base / "ticket.archived.md").unlink()\r
              time.sleep(0.6)\r
          finally:\r
              observer.stop()\r
              observer.join()\r
      summary = {\r
          "movedFound": bool(classifier.events["moved"] or "ticket.md" in classifier.events["deleted"]),\r
          "deletedFound": "ticket.archived.md" in classifier.events["deleted"] or "ticket.md" in classifier.events["deleted"],\r
      }\r
\r
      assert summary["movedFound"] is True\r
      assert summary["deletedFound"] is True\r
      summary\r
    exercise:\r
      prompt: 같은 핸들러로 stale.log를 만들고 rename과 unlink를 호출해 분류 결과의 movedFound와 deletedFound가 모두 True가 되는지 검증하세요.\r
      starterCode: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import FileSystemEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        class EventClassifier(FileSystemEventHandler):\r
            def __init__(self):\r
                super().__init__()\r
                self.events = {"created": [], "modified": [], "deleted": [], "moved": []}\r
\r
            def on_created(self, event):\r
                self.events["created"].append(Path(event.src_path).name)\r
\r
            def on_deleted(self, event):\r
                self.events["deleted"].append(Path(event.src_path).name)\r
\r
            def on_moved(self, event):\r
                self.events["moved"].append((Path(event.src_path).name, Path(event.dest_path).name))\r
\r
\r
        classifier = EventClassifier()\r
        with tempfile.TemporaryDirectory() as td:\r
            base = Path(td)\r
            target = base / "___"\r
            target.write_text("draft", encoding="utf-8")\r
            time.sleep(0.4)\r
            observer = Observer()\r
            observer.schedule(classifier, str(base), recursive=False)\r
            observer.start()\r
            try:\r
                target.rename(base / "stale.archived.log")\r
                time.sleep(0.6)\r
                (base / "stale.archived.log").unlink()\r
                time.sleep(0.6)\r
            finally:\r
                observer.stop()\r
                observer.join()\r
        summary = {\r
            "movedFound": bool(classifier.events["moved"] or "stale.log" in classifier.events["deleted"]),\r
            "deletedFound": "stale.archived.log" in classifier.events["deleted"] or "stale.log" in classifier.events["deleted"],\r
        }\r
\r
        assert summary == {"movedFound": True, "deletedFound": True}\r
        summary\r
      solution: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import FileSystemEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        class EventClassifier(FileSystemEventHandler):\r
            def __init__(self):\r
                super().__init__()\r
                self.events = {"created": [], "modified": [], "deleted": [], "moved": []}\r
\r
            def on_created(self, event):\r
                self.events["created"].append(Path(event.src_path).name)\r
\r
            def on_deleted(self, event):\r
                self.events["deleted"].append(Path(event.src_path).name)\r
\r
            def on_moved(self, event):\r
                self.events["moved"].append((Path(event.src_path).name, Path(event.dest_path).name))\r
\r
\r
        classifier = EventClassifier()\r
        with tempfile.TemporaryDirectory() as td:\r
            base = Path(td)\r
            target = base / "stale.log"\r
            target.write_text("draft", encoding="utf-8")\r
            time.sleep(0.4)\r
            observer = Observer()\r
            observer.schedule(classifier, str(base), recursive=False)\r
            observer.start()\r
            try:\r
                target.rename(base / "stale.archived.log")\r
                time.sleep(0.6)\r
                (base / "stale.archived.log").unlink()\r
                time.sleep(0.6)\r
            finally:\r
                observer.stop()\r
                observer.join()\r
        summary = {\r
            "movedFound": bool(classifier.events["moved"] or "stale.log" in classifier.events["deleted"]),\r
            "deletedFound": "stale.archived.log" in classifier.events["deleted"] or "stale.log" in classifier.events["deleted"],\r
        }\r
\r
        assert summary == {"movedFound": True, "deletedFound": True}\r
        summary\r
      hints:\r
        - 첫 파일 이름을 stale.log로 두면 rename 결과는 stale.archived.log가 된다.\r
        - OS에 따라 moved 또는 deleted/created 분기 둘 다 허용해야 안정적이다.\r
      check:\r
        noError: rename과 unlink 호출이 Observer 안에서 끝나야 한다.\r
        resultCheck: summary의 두 키가 모두 True여야 한다.\r
    check:\r
      noError: 삭제와 이동 호출이 한 Observer 사이클에서 끝나야 한다.\r
      resultCheck: summary의 movedFound와 deletedFound가 True여야 한다.\r
  - id: classify-summary\r
    title: 분류 결과 종합 정리\r
    structuredPrimary: true\r
    subtitle: 한 dict로 모든 이벤트\r
    goal: 한 사이클의 모든 이벤트를 type별 dict로 묶어 자동화 보고의 표준 형태를 완성한다.\r
    why: 종합 정리는 다음 자동화 단계가 같은 dict 구조를 신뢰할 수 있게 만드므로 핵심 표준이다.\r
    explanation: 마지막 섹션은 classify 결과를 종합 리포트로 만든다. created, modified, deleted, moved 키를 모두 가지며 빈 리스트라도 그대로 두어 후속 코드의 KeyError를 막는다. 같은 핸들러는 두 번 호출해도 같은 dict 형태를 유지한다.\r
    tips:\r
      - 종합 리포트의 빈 리스트는 일부 이벤트가 발생하지 않았다는 명확한 신호다.\r
      - 운영자는 modified 길이가 비정상적으로 길다면 자동화 입력에 문제가 있음을 알 수 있다.\r
    snippet: |-\r
      from watchdog.events import FileSystemEventHandler\r
\r
\r
      class EventClassifier(FileSystemEventHandler):\r
          def __init__(self):\r
              super().__init__()\r
              self.events = {"created": [], "modified": [], "deleted": [], "moved": []}\r
\r
          def on_created(self, event):\r
              self.events["created"].append("c")\r
\r
          def on_modified(self, event):\r
              self.events["modified"].append("m")\r
\r
          def on_deleted(self, event):\r
              self.events["deleted"].append("d")\r
\r
          def on_moved(self, event):\r
              self.events["moved"].append(("s", "t"))\r
\r
\r
      classifier = EventClassifier()\r
      classifier.on_created(None)\r
      classifier.on_modified(None)\r
      classifier.on_deleted(None)\r
      classifier.on_moved(None)\r
      summary = {key: len(value) for key, value in classifier.events.items()}\r
\r
      assert summary == {"created": 1, "modified": 1, "deleted": 1, "moved": 1}\r
      summary\r
    exercise:\r
      prompt: 같은 분류 핸들러에 created를 두 번, deleted를 한 번 호출해 종합 summary가 created 2, deleted 1, 나머지는 0이 되는지 검증하세요.\r
      starterCode: |-\r
        from watchdog.events import FileSystemEventHandler\r
\r
\r
        class EventClassifier(FileSystemEventHandler):\r
            def __init__(self):\r
                super().__init__()\r
                self.events = {"created": [], "modified": [], "deleted": [], "moved": []}\r
\r
            def on_created(self, event):\r
                self.events["created"].append("c")\r
\r
            def on_modified(self, event):\r
                self.events["modified"].append("m")\r
\r
            def on_deleted(self, event):\r
                self.events["deleted"].append("d")\r
\r
            def on_moved(self, event):\r
                self.events["moved"].append(("s", "t"))\r
\r
\r
        classifier = EventClassifier()\r
        classifier.on_created(None)\r
        classifier.on_created(None)\r
        classifier.on_deleted(None)\r
        summary = {key: len(value) for key, value in classifier.events.___()}\r
\r
        assert summary == {"created": 2, "modified": 0, "deleted": 1, "moved": 0}\r
        summary\r
      solution: |-\r
        from watchdog.events import FileSystemEventHandler\r
\r
\r
        class EventClassifier(FileSystemEventHandler):\r
            def __init__(self):\r
                super().__init__()\r
                self.events = {"created": [], "modified": [], "deleted": [], "moved": []}\r
\r
            def on_created(self, event):\r
                self.events["created"].append("c")\r
\r
            def on_modified(self, event):\r
                self.events["modified"].append("m")\r
\r
            def on_deleted(self, event):\r
                self.events["deleted"].append("d")\r
\r
            def on_moved(self, event):\r
                self.events["moved"].append(("s", "t"))\r
\r
\r
        classifier = EventClassifier()\r
        classifier.on_created(None)\r
        classifier.on_created(None)\r
        classifier.on_deleted(None)\r
        summary = {key: len(value) for key, value in classifier.events.items()}\r
\r
        assert summary == {"created": 2, "modified": 0, "deleted": 1, "moved": 0}\r
        summary\r
      hints:\r
        - dict의 (key, value) 쌍 이터레이션은 items 메서드로 얻는다.\r
        - 발생하지 않은 이벤트의 길이는 0이 된다.\r
      check:\r
        noError: 분류 핸들러 호출과 dict 컴프리헨션이 끝나야 한다.\r
        resultCheck: summary가 created 2와 deleted 1, 나머지는 0을 정확히 담아야 한다.\r
    check:\r
      noError: 분류 핸들러 호출과 dict 압축이 한 흐름에서 끝나야 한다.\r
      resultCheck: summary가 네 키 모두 1로 채워져 종합 분류가 표준 형태로 완성되어야 한다.\r
`;export{e as default};