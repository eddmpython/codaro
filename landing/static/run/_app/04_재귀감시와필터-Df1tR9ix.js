var e=`meta:\r
  id: watchSched_04\r
  title: 재귀 감시와 패턴 필터\r
  order: 4\r
  category: watchSched\r
  difficulty: easy\r
  audience: 폴더 이벤트와 스케줄 자동화에 입문하는 Python 학습자\r
  packages:\r
    - watchdog\r
  tags:\r
    - watchdog\r
    - recursive\r
    - patterns\r
intro:\r
  direction: watchdog의 PatternMatchingEventHandler로 재귀 감시 트리에서 원하는 확장자 패턴만 골라 자동화 입력으로 받는다.\r
  benefits:\r
    - schedule recursive=True로 자식 디렉터리까지 감시한다.\r
    - PatternMatchingEventHandler로 와일드카드 필터를 적용한다.\r
    - 무시 패턴으로 자동화 대상에서 제외할 파일을 명시한다.\r
    - 종합 결과로 필터링된 이벤트만 dict에 모은다.\r
  diagram:\r
    steps:\r
      - label: 다단계 폴더 트리 준비\r
        detail: 임시 폴더 안에 children 폴더를 만들고 다른 깊이의 파일들을 둔다.\r
      - label: PatternMatchingEventHandler 구성\r
        detail: patterns에 *.csv를 두고 ignore_patterns로 임시 파일을 제외한다.\r
      - label: 재귀 감시 시작\r
        detail: schedule에 recursive=True를 주어 자식 디렉터리까지 감시한다.\r
      - label: 종합 결과 분류\r
        detail: 매칭된 파일만 dict에 모아 자동화 입력으로 그대로 사용한다.\r
    runtime:\r
      - label: watchdog 패키지 필요\r
        detail: meta.packages의 watchdog이 로컬 가상환경에 준비되어야 한다.\r
      - label: assert 기반 검증\r
        detail: 분류 결과와 필터 동작을 assert로 비교한다.\r
sections:\r
  - id: pattern-handler\r
    title: 패턴 매칭 핸들러\r
    structuredPrimary: true\r
    subtitle: PatternMatchingEventHandler 사용\r
    goal: csv 파일만 처리하고 tmp 파일은 무시하는 핸들러를 만든다.\r
    why: 자동화는 보통 한 가지 파일 형식만 다루므로 핸들러 단계에서 미리 거르면 후속 단계가 단순해진다.\r
    explanation: watchdog.events.PatternMatchingEventHandler는 patterns와 ignore_patterns를 받아 매칭되는 이벤트만 콜백에 전달한다. patterns는 *.csv 같은 와일드카드 리스트, ignore_patterns는 같은 형식의 제외 목록이다. ignore_directories=True를 두면 디렉터리 이벤트를 한 번에 무시한다.\r
    tips:\r
      - 패턴은 글로브 스타일이며 대소문자 구분은 case_sensitive 인자로 제어한다.\r
      - ignore_patterns는 patterns 매칭 후 다시 한 번 거르는 단계다.\r
    snippet: |-\r
      from watchdog.events import FileCreatedEvent, PatternMatchingEventHandler\r
\r
\r
      collected: list[str] = []\r
\r
\r
      class CsvCollector(PatternMatchingEventHandler):\r
          def on_created(self, event):\r
              collected.append(event.src_path)\r
\r
\r
      handler = CsvCollector(patterns=["*.csv"], ignore_patterns=["*.tmp"], ignore_directories=True)\r
      handler.dispatch(FileCreatedEvent("report.csv"))\r
      handler.dispatch(FileCreatedEvent("scratch.tmp"))\r
\r
      assert collected == ["report.csv"]\r
      collected\r
    exercise:\r
      prompt: CsvCollector에 두 csv 이벤트를 보내 collected 리스트가 두 경로를 본문 순서대로 담는지 검증하세요.\r
      starterCode: |-\r
        from watchdog.events import FileCreatedEvent, PatternMatchingEventHandler\r
\r
\r
        collected: list[str] = []\r
\r
\r
        class CsvCollector(PatternMatchingEventHandler):\r
            def on_created(self, event):\r
                collected.append(event.src_path)\r
\r
\r
        handler = CsvCollector(patterns=["___"], ignore_patterns=["*.tmp"], ignore_directories=True)\r
        handler.dispatch(FileCreatedEvent("first.csv"))\r
        handler.dispatch(FileCreatedEvent("second.csv"))\r
\r
        assert collected == ["first.csv", "second.csv"]\r
        collected\r
      solution: |-\r
        from watchdog.events import FileCreatedEvent, PatternMatchingEventHandler\r
\r
\r
        collected: list[str] = []\r
\r
\r
        class CsvCollector(PatternMatchingEventHandler):\r
            def on_created(self, event):\r
                collected.append(event.src_path)\r
\r
\r
        handler = CsvCollector(patterns=["*.csv"], ignore_patterns=["*.tmp"], ignore_directories=True)\r
        handler.dispatch(FileCreatedEvent("first.csv"))\r
        handler.dispatch(FileCreatedEvent("second.csv"))\r
\r
        assert collected == ["first.csv", "second.csv"]\r
        collected\r
      hints:\r
        - patterns는 와일드카드 *.csv 한 개를 가진 리스트다.\r
        - 두 csv 이벤트가 본문 순서대로 collected에 모인다.\r
      check:\r
        noError: PatternMatchingEventHandler 호출이 정상적으로 끝나야 한다.\r
        resultCheck: collected 리스트가 두 csv 경로를 정확히 담아야 한다.\r
    check:\r
      noError: 패턴 핸들러와 두 이벤트 처리가 끝나야 한다.\r
      resultCheck: collected가 csv 경로만 담고 tmp 경로는 무시되어야 한다.\r
  - id: recursive-watch\r
    title: 재귀 감시 활성화\r
    structuredPrimary: true\r
    subtitle: schedule(recursive=True)\r
    goal: 자식 폴더에 만들어진 csv 파일도 핸들러가 받는다.\r
    why: 자동화 입력은 보통 하위 폴더에 흩어져 있으므로 재귀 감시가 기본이다.\r
    explanation: Observer.schedule(handler, base, recursive=True)는 base의 모든 자식 디렉터리에서 발생한 이벤트도 핸들러에 전달한다. 자식이 만들어진 직후에도 같은 핸들러가 동작한다. recursive=False와 비교하면 차이가 명확하다.\r
    tips:\r
      - 너무 깊은 트리는 OS의 inotify 한도를 초과할 수 있으니 적정 깊이를 유지한다.\r
      - 자식 폴더가 사라지면 그 폴더 안의 추가 이벤트는 더 이상 도착하지 않는다.\r
    snippet: |-\r
      import tempfile\r
      import time\r
      from pathlib import Path\r
\r
      from watchdog.events import PatternMatchingEventHandler\r
      from watchdog.observers import Observer\r
\r
\r
      collected: list[str] = []\r
\r
\r
      class CsvCollector(PatternMatchingEventHandler):\r
          def on_created(self, event):\r
              collected.append(Path(event.src_path).name)\r
\r
\r
      with tempfile.TemporaryDirectory() as td:\r
          base = Path(td)\r
          (base / "deep" / "deeper").mkdir(parents=True)\r
          observer = Observer()\r
          observer.schedule(\r
              CsvCollector(patterns=["*.csv"], ignore_directories=True),\r
              str(base),\r
              recursive=True,\r
          )\r
          observer.start()\r
          try:\r
              (base / "deep" / "deeper" / "leaf.csv").write_text("a,b", encoding="utf-8")\r
              time.sleep(0.6)\r
          finally:\r
              observer.stop()\r
              observer.join()\r
\r
      assert "leaf.csv" in collected\r
      collected\r
    exercise:\r
      prompt: recursive=True로 잡힌 트리에서 nested/sub/data.csv 파일이 collected 리스트에 포함되는지 검증하세요.\r
      starterCode: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import PatternMatchingEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        collected: list[str] = []\r
\r
\r
        class CsvCollector(PatternMatchingEventHandler):\r
            def on_created(self, event):\r
                collected.append(Path(event.src_path).name)\r
\r
\r
        with tempfile.TemporaryDirectory() as td:\r
            base = Path(td)\r
            (base / "nested" / "sub").mkdir(parents=True)\r
            observer = Observer()\r
            observer.schedule(\r
                CsvCollector(patterns=["*.csv"], ignore_directories=True),\r
                str(base),\r
                recursive=___,\r
            )\r
            observer.start()\r
            try:\r
                (base / "nested" / "sub" / "data.csv").write_text("a,b", encoding="utf-8")\r
                time.sleep(0.6)\r
            finally:\r
                observer.stop()\r
                observer.join()\r
\r
        assert "data.csv" in collected\r
        collected\r
      solution: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import PatternMatchingEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        collected: list[str] = []\r
\r
\r
        class CsvCollector(PatternMatchingEventHandler):\r
            def on_created(self, event):\r
                collected.append(Path(event.src_path).name)\r
\r
\r
        with tempfile.TemporaryDirectory() as td:\r
            base = Path(td)\r
            (base / "nested" / "sub").mkdir(parents=True)\r
            observer = Observer()\r
            observer.schedule(\r
                CsvCollector(patterns=["*.csv"], ignore_directories=True),\r
                str(base),\r
                recursive=True,\r
            )\r
            observer.start()\r
            try:\r
                (base / "nested" / "sub" / "data.csv").write_text("a,b", encoding="utf-8")\r
                time.sleep(0.6)\r
            finally:\r
                observer.stop()\r
                observer.join()\r
\r
        assert "data.csv" in collected\r
        collected\r
      hints:\r
        - recursive 인자는 True여야 자식 폴더의 이벤트도 잡힌다.\r
        - 자식 폴더는 mkdir(parents=True)로 두 단계 미리 만든다.\r
      check:\r
        noError: 재귀 감시 흐름이 격리 공간에서 정상적으로 끝나야 한다.\r
        resultCheck: collected에 data.csv가 포함되어야 한다.\r
    check:\r
      noError: 재귀 감시와 깊은 파일 작성이 끝나야 한다.\r
      resultCheck: collected에 leaf.csv가 포함되어야 한다.\r
  - id: ignore-rules\r
    title: 무시 패턴 적용\r
    structuredPrimary: true\r
    subtitle: 임시 파일 자동 제외\r
    goal: ignore_patterns로 .tmp와 .lock 같은 임시 파일을 자동으로 거른다.\r
    why: 자동화 입력은 보통 다른 도구가 만드는 임시 파일과 섞이므로 처음부터 거르면 후속 단계가 안전하다.\r
    explanation: PatternMatchingEventHandler의 ignore_patterns 인자는 patterns로 매칭된 후 한 번 더 제외 단계를 둔다. *.tmp와 *.lock 같은 흔한 임시 패턴을 함께 두면 자동화 대상이 깔끔해진다. 같은 매칭은 case_sensitive=False로 두면 확장자 대소문자 차이도 무시할 수 있다.\r
    tips:\r
      - 흔한 무시 패턴은 *.tmp, *.lock, *~, .DS_Store다.\r
      - 무시 규칙은 한 곳에 모아 자동화 정책으로 관리한다.\r
    snippet: |-\r
      from watchdog.events import FileCreatedEvent, PatternMatchingEventHandler\r
\r
\r
      collected: list[str] = []\r
\r
\r
      class CsvCollector(PatternMatchingEventHandler):\r
          def on_created(self, event):\r
              collected.append(event.src_path)\r
\r
\r
      handler = CsvCollector(patterns=["*.csv"], ignore_patterns=["*.tmp", "*.lock"], ignore_directories=True)\r
      handler.dispatch(FileCreatedEvent("report.csv"))\r
      handler.dispatch(FileCreatedEvent("scratch.tmp"))\r
      handler.dispatch(FileCreatedEvent("session.lock"))\r
\r
      assert collected == ["report.csv"]\r
      collected\r
    exercise:\r
      prompt: 같은 핸들러에 csv 이벤트 한 개와 lock 이벤트 한 개를 보내 csv만 남는지 검증하세요.\r
      starterCode: |-\r
        from watchdog.events import FileCreatedEvent, PatternMatchingEventHandler\r
\r
\r
        collected: list[str] = []\r
\r
\r
        class CsvCollector(PatternMatchingEventHandler):\r
            def on_created(self, event):\r
                collected.append(event.src_path)\r
\r
\r
        handler = CsvCollector(patterns=["*.csv"], ignore_patterns=["*.tmp", "*.___"], ignore_directories=True)\r
        handler.dispatch(FileCreatedEvent("data.csv"))\r
        handler.dispatch(FileCreatedEvent("ignore.lock"))\r
\r
        assert collected == ["data.csv"]\r
        collected\r
      solution: |-\r
        from watchdog.events import FileCreatedEvent, PatternMatchingEventHandler\r
\r
\r
        collected: list[str] = []\r
\r
\r
        class CsvCollector(PatternMatchingEventHandler):\r
            def on_created(self, event):\r
                collected.append(event.src_path)\r
\r
\r
        handler = CsvCollector(patterns=["*.csv"], ignore_patterns=["*.tmp", "*.lock"], ignore_directories=True)\r
        handler.dispatch(FileCreatedEvent("data.csv"))\r
        handler.dispatch(FileCreatedEvent("ignore.lock"))\r
\r
        assert collected == ["data.csv"]\r
        collected\r
      hints:\r
        - 무시 패턴 두 번째는 *.lock이다.\r
        - lock 이벤트는 ignore_patterns 매칭으로 제외된다.\r
      check:\r
        noError: PatternMatchingEventHandler 호출이 정상적으로 끝나야 한다.\r
        resultCheck: collected가 data.csv 한 개만 담아야 한다.\r
    check:\r
      noError: 무시 패턴 적용이 두 이벤트에 대해 끝나야 한다.\r
      resultCheck: collected가 report.csv만 담고 tmp와 lock은 무시되어야 한다.\r
  - id: filter-summary\r
    title: 종합 필터링 결과\r
    structuredPrimary: true\r
    subtitle: 함수로 묶기\r
    goal: 재귀 감시와 패턴 필터를 한 함수로 묶어 자동화 표준 결과 dict를 만든다.\r
    why: 종합 함수는 다음 자동화 단계에 일관된 결과를 전달하는 표준이므로 반드시 정리해 둔다.\r
    explanation: watchPatterns 함수는 base 폴더와 패턴 리스트를 받아 재귀 감시 후 매칭된 파일 경로 리스트를 돌려준다. 결과 dict는 patterns 키와 matched 키를 가지며 다음 사이클의 입력으로 그대로 사용된다. 같은 함수는 빈 결과에 대해서도 안전하게 동작한다.\r
    tips:\r
      - 함수 인자에 sleep 시간을 두면 테스트 환경별로 조정이 쉽다.\r
      - matched 리스트는 정렬된 형태로 두어 자동화에서 같은 순서를 보장한다.\r
    snippet: |-\r
      import tempfile\r
      import time\r
      from pathlib import Path\r
\r
      from watchdog.events import PatternMatchingEventHandler\r
      from watchdog.observers import Observer\r
\r
\r
      def watchPatterns(filenames: list, patterns: list, sleepSeconds: float = 0.6) -> dict:\r
          matched: list[str] = []\r
\r
          class Collector(PatternMatchingEventHandler):\r
              def on_created(self, event):\r
                  matched.append(Path(event.src_path).name)\r
\r
          with tempfile.TemporaryDirectory() as td:\r
              base = Path(td)\r
              (base / "deep").mkdir()\r
              observer = Observer()\r
              observer.schedule(\r
                  Collector(patterns=patterns, ignore_directories=True),\r
                  str(base),\r
                  recursive=True,\r
              )\r
              observer.start()\r
              try:\r
                  for name in filenames:\r
                      (base / "deep" / name).write_text("", encoding="utf-8")\r
                  time.sleep(sleepSeconds)\r
              finally:\r
                  observer.stop()\r
                  observer.join()\r
          return {"patterns": patterns, "matched": sorted(matched)}\r
\r
\r
      report = watchPatterns(["a.csv", "b.tmp", "c.csv"], patterns=["*.csv"])\r
\r
      assert report["matched"] == ["a.csv", "c.csv"]\r
      report\r
    exercise:\r
      prompt: watchPatterns에 ["one.csv", "two.lock", "three.csv"]를 넘기고 patterns=["*.csv"]로 필터하면 종합 결과 matched가 정렬된 두 csv 이름인지 검증하세요.\r
      starterCode: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import PatternMatchingEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        def watchPatterns(filenames: list, patterns: list, sleepSeconds: float = 0.6) -> dict:\r
            matched: list[str] = []\r
\r
            class Collector(PatternMatchingEventHandler):\r
                def on_created(self, event):\r
                    matched.append(Path(event.src_path).name)\r
\r
            with tempfile.TemporaryDirectory() as td:\r
                base = Path(td)\r
                (base / "deep").mkdir()\r
                observer = Observer()\r
                observer.schedule(\r
                    Collector(patterns=patterns, ignore_directories=True),\r
                    str(base),\r
                    recursive=True,\r
                )\r
                observer.start()\r
                try:\r
                    for name in filenames:\r
                        (base / "deep" / name).write_text("", encoding="utf-8")\r
                    time.sleep(sleepSeconds)\r
                finally:\r
                    observer.stop()\r
                    observer.join()\r
            return {"patterns": patterns, "matched": ___(matched)}\r
\r
\r
        report = watchPatterns(["one.csv", "two.lock", "three.csv"], patterns=["*.csv"])\r
\r
        assert report["matched"] == ["one.csv", "three.csv"]\r
        report\r
      solution: |-\r
        import tempfile\r
        import time\r
        from pathlib import Path\r
\r
        from watchdog.events import PatternMatchingEventHandler\r
        from watchdog.observers import Observer\r
\r
\r
        def watchPatterns(filenames: list, patterns: list, sleepSeconds: float = 0.6) -> dict:\r
            matched: list[str] = []\r
\r
            class Collector(PatternMatchingEventHandler):\r
                def on_created(self, event):\r
                    matched.append(Path(event.src_path).name)\r
\r
            with tempfile.TemporaryDirectory() as td:\r
                base = Path(td)\r
                (base / "deep").mkdir()\r
                observer = Observer()\r
                observer.schedule(\r
                    Collector(patterns=patterns, ignore_directories=True),\r
                    str(base),\r
                    recursive=True,\r
                )\r
                observer.start()\r
                try:\r
                    for name in filenames:\r
                        (base / "deep" / name).write_text("", encoding="utf-8")\r
                    time.sleep(sleepSeconds)\r
                finally:\r
                    observer.stop()\r
                    observer.join()\r
            return {"patterns": patterns, "matched": sorted(matched)}\r
\r
\r
        report = watchPatterns(["one.csv", "two.lock", "three.csv"], patterns=["*.csv"])\r
\r
        assert report["matched"] == ["one.csv", "three.csv"]\r
        report\r
      hints:\r
        - 정렬 함수 이름은 sorted다.\r
        - 알파벳 순으로 one.csv가 three.csv보다 앞에 온다.\r
      check:\r
        noError: watchPatterns 함수 호출과 종합 결과 dict 반환이 끝나야 한다.\r
        resultCheck: report["matched"]가 두 csv 파일을 정렬된 형태로 담아야 한다.\r
    check:\r
      noError: 종합 패턴 함수와 자식 파일 작성이 끝나야 한다.\r
      resultCheck: report dict의 matched가 csv 두 개만 정렬된 형태로 담아야 한다.\r
`;export{e as default};