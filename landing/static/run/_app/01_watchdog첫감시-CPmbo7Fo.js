var e=`meta:\r
  id: watchSched_01\r
  title: watchdog 첫 감시\r
  order: 1\r
  category: watchSched\r
  difficulty: easy\r
  audience: 폴더 이벤트와 스케줄 자동화에 입문하는 Python 학습자\r
  packages:\r
    - watchdog\r
  tags:\r
    - watchdog\r
    - observer\r
    - filesystem\r
intro:\r
  direction: watchdog의 Observer와 FileSystemEventHandler로 임시 폴더에서 발생한 파일 생성 이벤트를 짧은 시간 안에 감지하고 즉시 멈춘다.\r
  benefits:\r
    - Observer로 백그라운드 감시 스레드를 만든다.\r
    - FileSystemEventHandler 서브클래스에서 on_created를 구현한다.\r
    - Observer.start와 stop, join을 안전한 순서로 호출한다.\r
    - 감지된 이벤트를 list로 모아 자동화 다음 단계에 넘긴다.\r
  diagram:\r
    steps:\r
      - label: 임시 폴더 준비\r
        detail: tempfile.TemporaryDirectory로 자동 정리되는 감시 대상 폴더를 만든다.\r
      - label: 이벤트 핸들러 정의\r
        detail: FileSystemEventHandler를 상속해 on_created에서 이벤트 src_path를 모은다.\r
      - label: Observer 시작\r
        detail: Observer를 만들고 schedule, start로 백그라운드 감시를 시작한다.\r
      - label: 파일 생성 후 정지\r
        detail: 새 파일을 만든 뒤 짧게 sleep하고 Observer.stop과 join으로 정리한다.\r
    runtime:\r
      - label: watchdog 패키지 필요\r
        detail: meta.packages의 watchdog이 로컬 가상환경에 준비되어야 한다.\r
      - label: assert 기반 검증\r
        detail: 모인 이벤트 경로와 기대값을 assert로 비교한다.\r
sections:\r
  - id: handler-skeleton\r
    title: 이벤트 핸들러 골격 만들기\r
    structuredPrimary: true\r
    subtitle: FileSystemEventHandler 상속\r
    goal: 파일 생성 이벤트를 받아 리스트에 모으는 단순 핸들러를 작성한다.\r
    why: 핸들러 골격이 단순할수록 다음 섹션에서 다양한 이벤트 타입으로 확장하기 쉬워진다.\r
    explanation: FileSystemEventHandler를 상속하면 on_created, on_modified, on_deleted, on_moved 메서드를 오버라이드할 수 있다. 인자는 FileSystemEvent 객체이며 src_path 속성에 경로 문자열이 들어 있다. 자동화에서는 리스트 같은 외부 상태를 핸들러에 주입해 결과를 모은다.\r
    tips:\r
      - 핸들러는 별도 스레드에서 호출되므로 공유 리스트는 미리 만들어 두면 안전하다.\r
      - on_created 메서드는 새 파일과 새 폴더 모두에서 호출된다.\r
    snippet: |-\r
      from watchdog.events import FileSystemEventHandler\r
\r
\r
      class CreatedCollector(FileSystemEventHandler):\r
          def __init__(self, sink: list) -> None:\r
              super().__init__()\r
              self.sink = sink\r
\r
          def on_created(self, event) -> None:\r
              self.sink.append(event.src_path)\r
\r
\r
      sink = []\r
      handler = CreatedCollector(sink)\r
      handler.on_created(type("Event", (), {"src_path": "fake.txt"})())\r
\r
      assert sink == ["fake.txt"]\r
      sink\r
    exercise:\r
      prompt: CreatedCollector를 두 번 호출해 같은 이벤트 src_path가 sink 리스트에 두 번 누적되는지 검증하세요.\r
      starterCode: |-\r
        from watchdog.events import FileSystemEventHandler\r
\r
\r
        class CreatedCollector(FileSystemEventHandler):\r
            def __init__(self, sink: list) -> None:\r
                super().__init__()\r
                self.sink = sink\r
\r
            def on_created(self, event) -> None:\r
                self.sink.append(event.___)\r
\r
\r
        sink = []\r
        handler = CreatedCollector(sink)\r
        handler.on_created(type("Event", (), {"src_path": "first.txt"})())\r
        handler.on_created(type("Event", (), {"src_path": "second.txt"})())\r
\r
        assert sink == ["first.txt", "second.txt"]\r
        sink\r
      solution: |-\r
        from watchdog.events import FileSystemEventHandler\r
\r
\r
        class CreatedCollector(FileSystemEventHandler):\r
            def __init__(self, sink: list) -> None:\r
                super().__init__()\r
                self.sink = sink\r
\r
            def on_created(self, event) -> None:\r
                self.sink.append(event.src_path)\r
\r
\r
        sink = []\r
        handler = CreatedCollector(sink)\r
        handler.on_created(type("Event", (), {"src_path": "first.txt"})())\r
        handler.on_created(type("Event", (), {"src_path": "second.txt"})())\r
\r
        assert sink == ["first.txt", "second.txt"]\r
        sink\r
      hints:\r
        - FileSystemEvent의 경로 속성은 src_path다.\r
        - 두 번 호출하면 sink에 두 항목이 본문 순서대로 들어간다.\r
      check:\r
        noError: 핸들러 정의와 두 번 호출이 정상적으로 끝나야 한다.\r
        resultCheck: sink 리스트가 두 src_path를 본문 순서대로 담아야 한다.\r
    check:\r
      noError: CreatedCollector 정의와 호출이 끝나야 한다.\r
      resultCheck: sink 리스트가 src_path 한 줄을 정확히 담아야 한다.\r
  - id: observer-lifecycle\r
    title: Observer 시작과 정지\r
    structuredPrimary: true\r
    subtitle: schedule, start, stop, join\r
    goal: Observer를 만들어 한 폴더를 감시하고 안전한 순서로 정리한다.\r
    why: Observer는 스레드를 시작하므로 사용 후 stop과 join을 명확히 호출해야 자원 누수가 없다.\r
    explanation: Observer 객체에 핸들러와 폴더 경로를 schedule로 등록한 뒤 start를 호출하면 백그라운드 스레드가 동작한다. stop은 종료 신호, join은 스레드 종료 대기다. 자동화에서는 항상 try/finally 또는 with 컨텍스트로 정리한다.\r
    tips:\r
      - schedule의 첫 인자는 핸들러, 두 번째는 폴더 경로, recursive는 하위 폴더 포함 여부다.\r
      - start와 stop은 즉시 반환되므로 join을 기다려야 안전하게 종료된다.\r
    snippet: |-\r
      import tempfile\r
      import time\r
      from pathlib import Path\r
\r
      from watchdog.events import FileSystemEventHandler\r
      from watchdog.observers import Observer\r
\r
\r
      class CreatedCollector(FileSystemEventHandler):\r
          def __init__(self, sink: list) -> None:\r
              super().__init__()\r
              self.sink = sink\r
\r
          def on_created(self, event) -> None:\r
              if not event.is_directory:\r
                  self.sink.append(Path(event.src_path).name)\r
\r
\r
      sink = []\r
      with tempfile.TemporaryDirectory() as td:\r
          base = Path(td)\r
          observer = Observer()\r
          observer.schedule(CreatedCollector(sink), str(base), recursive=False)\r
          observer.start()\r
          try:\r
              (base / "first.txt").write_text("ok", encoding="utf-8")\r
              time.sleep(0.5)\r
          finally:\r
              observer.stop()\r
              observer.join()\r
\r
      assert "first.txt" in sink\r
      sink\r
    exercise:\r
      prompt: 같은 흐름으로 second.txt 파일을 만들고 sink 리스트가 "second.txt" 한 줄을 포함하는지 검증하세요.\r
      starterCode: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import FileSystemEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        class CreatedCollector(FileSystemEventHandler):\r
            def __init__(self, sink: list) -> None:\r
                super().__init__()\r
                self.sink = sink\r
\r
            def on_created(self, event) -> None:\r
                if not event.is_directory:\r
                    self.sink.append(Path(event.src_path).name)\r
\r
\r
        sink = []\r
        with tempfile.TemporaryDirectory() as td:\r
            base = Path(td)\r
            observer = Observer()\r
            observer.schedule(CreatedCollector(sink), str(base), recursive=___)\r
            observer.start()\r
            try:\r
                (base / "second.txt").write_text("ok", encoding="utf-8")\r
                time.sleep(0.5)\r
            finally:\r
                observer.stop()\r
                observer.join()\r
\r
        assert "second.txt" in sink\r
        sink\r
      solution: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import FileSystemEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        class CreatedCollector(FileSystemEventHandler):\r
            def __init__(self, sink: list) -> None:\r
                super().__init__()\r
                self.sink = sink\r
\r
            def on_created(self, event) -> None:\r
                if not event.is_directory:\r
                    self.sink.append(Path(event.src_path).name)\r
\r
\r
        sink = []\r
        with tempfile.TemporaryDirectory() as td:\r
            base = Path(td)\r
            observer = Observer()\r
            observer.schedule(CreatedCollector(sink), str(base), recursive=False)\r
            observer.start()\r
            try:\r
                (base / "second.txt").write_text("ok", encoding="utf-8")\r
                time.sleep(0.5)\r
            finally:\r
                observer.stop()\r
                observer.join()\r
\r
        assert "second.txt" in sink\r
        sink\r
      hints:\r
        - recursive 인자를 False로 두면 한 폴더만 감시한다.\r
        - try/finally로 stop과 join을 보장해야 자원 누수가 없다.\r
      check:\r
        noError: Observer 시작과 정리가 IOError 없이 끝나야 한다.\r
        resultCheck: sink 리스트에 "second.txt"가 포함되어야 한다.\r
    check:\r
      noError: Observer 생애주기 호출이 try/finally 안에서 끝나야 한다.\r
      resultCheck: sink 리스트가 "first.txt"를 포함해 첫 감시 결과를 보고해야 한다.\r
  - id: multi-file\r
    title: 여러 파일 감지\r
    structuredPrimary: true\r
    subtitle: 같은 폴더의 다중 이벤트\r
    goal: 한 번에 여러 파일이 만들어졌을 때 모든 이벤트가 수집되는지 확인한다.\r
    why: 자동화 감시는 한 사이클에 여러 파일을 다뤄야 하는 경우가 많아 다중 이벤트 처리가 표준이다.\r
    explanation: 같은 핸들러는 여러 파일에 대해 차례로 on_created가 호출된다. 동시 파일 생성에서도 watchdog은 OS 이벤트 큐를 통해 모든 이벤트를 전달한다. 정렬은 보장되지 않으므로 sorted로 비교하는 편이 안전하다.\r
    tips:\r
      - 동시에 만들어진 두 파일은 OS에 따라 도착 순서가 다를 수 있다.\r
      - sorted를 통해 결과를 비교하면 순서 무관 검증이 된다.\r
    snippet: |-\r
      import tempfile\r
      import time\r
      from pathlib import Path\r
\r
      from watchdog.events import FileSystemEventHandler\r
      from watchdog.observers import Observer\r
\r
\r
      class CreatedCollector(FileSystemEventHandler):\r
          def __init__(self, sink: list) -> None:\r
              super().__init__()\r
              self.sink = sink\r
\r
          def on_created(self, event) -> None:\r
              if not event.is_directory:\r
                  self.sink.append(Path(event.src_path).name)\r
\r
\r
      sink = []\r
      with tempfile.TemporaryDirectory() as td:\r
          base = Path(td)\r
          observer = Observer()\r
          observer.schedule(CreatedCollector(sink), str(base), recursive=False)\r
          observer.start()\r
          try:\r
              (base / "alpha.txt").write_text("", encoding="utf-8")\r
              (base / "beta.txt").write_text("", encoding="utf-8")\r
              time.sleep(0.5)\r
          finally:\r
              observer.stop()\r
              observer.join()\r
      collected = sorted(sink)\r
\r
      assert collected == ["alpha.txt", "beta.txt"]\r
      collected\r
    exercise:\r
      prompt: gamma.txt와 delta.txt를 만들어 sorted 결과가 정확히 두 이름을 알파벳 순으로 담는지 검증하세요.\r
      starterCode: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import FileSystemEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        class CreatedCollector(FileSystemEventHandler):\r
            def __init__(self, sink: list) -> None:\r
                super().__init__()\r
                self.sink = sink\r
\r
            def on_created(self, event) -> None:\r
                if not event.is_directory:\r
                    self.sink.append(Path(event.src_path).name)\r
\r
\r
        sink = []\r
        with tempfile.TemporaryDirectory() as td:\r
            base = Path(td)\r
            observer = Observer()\r
            observer.schedule(CreatedCollector(sink), str(base), recursive=False)\r
            observer.start()\r
            try:\r
                (base / "___").write_text("", encoding="utf-8")\r
                (base / "___").write_text("", encoding="utf-8")\r
                time.sleep(0.5)\r
            finally:\r
                observer.stop()\r
                observer.join()\r
        collected = sorted(sink)\r
\r
        assert collected == ["delta.txt", "gamma.txt"]\r
        collected\r
      solution: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import FileSystemEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        class CreatedCollector(FileSystemEventHandler):\r
            def __init__(self, sink: list) -> None:\r
                super().__init__()\r
                self.sink = sink\r
\r
            def on_created(self, event) -> None:\r
                if not event.is_directory:\r
                    self.sink.append(Path(event.src_path).name)\r
\r
\r
        sink = []\r
        with tempfile.TemporaryDirectory() as td:\r
            base = Path(td)\r
            observer = Observer()\r
            observer.schedule(CreatedCollector(sink), str(base), recursive=False)\r
            observer.start()\r
            try:\r
                (base / "gamma.txt").write_text("", encoding="utf-8")\r
                (base / "delta.txt").write_text("", encoding="utf-8")\r
                time.sleep(0.5)\r
            finally:\r
                observer.stop()\r
                observer.join()\r
        collected = sorted(sink)\r
\r
        assert collected == ["delta.txt", "gamma.txt"]\r
        collected\r
      hints:\r
        - 두 파일 이름은 gamma.txt와 delta.txt다.\r
        - sorted 결과는 알파벳 순으로 delta가 먼저 온다.\r
      check:\r
        noError: Observer 흐름과 다중 파일 작성이 끝나야 한다.\r
        resultCheck: collected가 두 파일 이름을 알파벳 순으로 담아야 한다.\r
    check:\r
      noError: 여러 이벤트 수집이 한 사이클에서 끝나야 한다.\r
      resultCheck: collected가 ["alpha.txt", "beta.txt"]로 알파벳 순으로 정렬되어야 한다.\r
  - id: summary-cycle\r
    title: 종합 첫 감시 사이클\r
    structuredPrimary: true\r
    subtitle: 함수로 묶기\r
    goal: 임시 폴더에서 한 사이클의 감시 결과를 dict로 묶어 자동화 표준 보고 형태를 만든다.\r
    why: 자동화 다음 단계는 같은 dict 구조를 기대하므로 첫 감시 사이클부터 일관된 보고 형태를 유지한다.\r
    explanation: observeCreations 함수는 sleep 시간을 인자로 받고 같은 폴더에서 만들어진 파일 이름 리스트를 돌려준다. 함수가 dict로 결과를 묶으면 다음 레슨의 이벤트 타입 구분에서 키만 추가하면 된다. 같은 사이클을 두 번 호출해도 같은 dict 구조가 유지된다.\r
    tips:\r
      - sleep 시간은 0.3에서 0.5초 사이가 일반적으로 안정적이다.\r
      - 결과 dict 키 이름은 created, modified, deleted 같은 표준 단어를 사용한다.\r
    snippet: |-\r
      import tempfile\r
      import time\r
      from pathlib import Path\r
\r
      from watchdog.events import FileSystemEventHandler\r
      from watchdog.observers import Observer\r
\r
\r
      def observeCreations(filenames: list, sleepSeconds: float = 0.5) -> dict:\r
          sink = []\r
\r
          class Collector(FileSystemEventHandler):\r
              def on_created(self, event) -> None:\r
                  if not event.is_directory:\r
                      sink.append(Path(event.src_path).name)\r
\r
          with tempfile.TemporaryDirectory() as td:\r
              base = Path(td)\r
              observer = Observer()\r
              observer.schedule(Collector(), str(base), recursive=False)\r
              observer.start()\r
              try:\r
                  for name in filenames:\r
                      (base / name).write_text("", encoding="utf-8")\r
                  time.sleep(sleepSeconds)\r
              finally:\r
                  observer.stop()\r
                  observer.join()\r
          return {"created": sorted(sink)}\r
\r
\r
      report = observeCreations(["alpha.txt", "beta.txt"])\r
\r
      assert report == {"created": ["alpha.txt", "beta.txt"]}\r
      report\r
    exercise:\r
      prompt: observeCreations에 ["foo.log", "bar.log"]를 넘기면 created 리스트가 알파벳 순으로 두 파일 이름을 담아 종합 결과가 만들어지는지 검증하세요.\r
      starterCode: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import FileSystemEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        def observeCreations(filenames: list, sleepSeconds: float = 0.5) -> dict:\r
            sink = []\r
\r
            class Collector(FileSystemEventHandler):\r
                def on_created(self, event) -> None:\r
                    if not event.is_directory:\r
                        sink.append(Path(event.src_path).name)\r
\r
            with tempfile.TemporaryDirectory() as td:\r
                base = Path(td)\r
                observer = Observer()\r
                observer.schedule(Collector(), str(base), recursive=False)\r
                observer.start()\r
                try:\r
                    for name in filenames:\r
                        (base / name).write_text("", encoding="utf-8")\r
                    time.sleep(sleepSeconds)\r
                finally:\r
                    observer.stop()\r
                    observer.join()\r
            return {"created": ___(sink)}\r
\r
\r
        report = observeCreations(["foo.log", "bar.log"])\r
\r
        assert report == {"created": ["bar.log", "foo.log"]}\r
        report\r
      solution: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import FileSystemEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        def observeCreations(filenames: list, sleepSeconds: float = 0.5) -> dict:\r
            sink = []\r
\r
            class Collector(FileSystemEventHandler):\r
                def on_created(self, event) -> None:\r
                    if not event.is_directory:\r
                        sink.append(Path(event.src_path).name)\r
\r
            with tempfile.TemporaryDirectory() as td:\r
                base = Path(td)\r
                observer = Observer()\r
                observer.schedule(Collector(), str(base), recursive=False)\r
                observer.start()\r
                try:\r
                    for name in filenames:\r
                        (base / name).write_text("", encoding="utf-8")\r
                    time.sleep(sleepSeconds)\r
                finally:\r
                    observer.stop()\r
                    observer.join()\r
            return {"created": sorted(sink)}\r
\r
\r
        report = observeCreations(["foo.log", "bar.log"])\r
\r
        assert report == {"created": ["bar.log", "foo.log"]}\r
        report\r
      hints:\r
        - 정렬 함수 이름은 sorted다.\r
        - 알파벳 순으로 bar.log가 foo.log 앞에 온다.\r
      check:\r
        noError: observeCreations 함수 호출이 종합 정리 흐름으로 끝나야 한다.\r
        resultCheck: report dict의 created 리스트가 두 파일을 정렬된 상태로 담아야 한다.\r
    check:\r
      noError: 종합 감시 함수가 격리 공간에서 끝나야 한다.\r
      resultCheck: report dict의 created 리스트가 두 파일 이름을 정렬된 상태로 담아야 한다.\r
`;export{e as default};