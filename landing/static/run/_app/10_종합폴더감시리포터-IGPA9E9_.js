var e=`meta:
  id: watchSched_10
  title: 종합 폴더 감시 리포터
  order: 10
  category: watchSched
  difficulty: medium
  audience: 폴더 이벤트와 스케줄 자동화에 입문하는 Python 학습자
  packages:
    - watchdog
  tags:
    - watchdog
    - reporting
    - project
intro:
  direction: watchdog 감시, 디바운스, 스케줄, JSON 영속화를 한데 모아 한 사이클의 폴더 변화를 자동 리포트로 남기는 종합 프로젝트를 만든다.
  benefits:
    - 감시 폴더에서 발생한 이벤트를 분류와 디바운스로 안정화한다.
    - 사이클이 끝나면 JSON 리포트로 영속화한다.
    - 같은 사이클을 두 번 실행해도 같은 dict 형태를 유지한다.
    - 운영자가 한 화면에서 사이클 결과를 비교할 수 있는 표준 보고를 만든다.
  diagram:
    steps:
      - label: 감시 폴더 준비
        detail: tempfile 격리 공간에 source 폴더와 reports 폴더를 만든다.
      - label: 이벤트 분류 핸들러
        detail: PatternMatchingEventHandler로 csv 파일만 created 이벤트를 모은다.
      - label: 디바운스 적용
        detail: 같은 파일이 짧은 시간 안에 두 번 이벤트가 들어오면 한 번만 기록한다.
      - label: JSON 리포트 영속화
        detail: 사이클 결과를 reports/last.json에 저장하고 다시 읽어 검증한다.
    runtime:
      - label: watchdog 패키지 필요
        detail: meta.packages의 watchdog이 로컬 가상환경에 준비되어야 한다.
      - label: assert 기반 종합 검증
        detail: 사이클 결과 dict와 저장된 JSON 내용을 assert로 비교한다.
sections:
  - id: cycle-builder
    title: 사이클 빌더 함수
    structuredPrimary: true
    subtitle: csv 이벤트 모으기
    goal: tempfile 격리 폴더에서 csv 파일을 만들 때 발생한 created 이벤트를 dict 리스트로 모은다.
    why: 종합 사이클의 첫 단계는 신뢰할 수 있는 이벤트 수집이므로 패턴 필터와 함께 안정화한다.
    explanation: collectCsvEvents 함수는 파일명 리스트를 받아 Observer를 짧게 가동한 뒤 csv 파일에 대한 created 이벤트만 모은다. 결과는 dict 리스트로 timestamp 없이 이름 순서만 보고한다. tempfile 안에서 동작해 사용자 환경에 영향을 주지 않는다.
    tips:
      - PatternMatchingEventHandler로 csv만 필터링하면 후속 단계가 단순해진다.
      - sleep 시간을 0.5초 정도 두면 이벤트 전파가 안정적이다.
    snippet: |-
      import tempfile
      import time
      from pathlib import Path

      from watchdog.events import PatternMatchingEventHandler
      from watchdog.observers import Observer


      def collectCsvEvents(filenames: list, sleepSeconds: float = 0.5) -> list:
          collected: list[str] = []

          class Collector(PatternMatchingEventHandler):
              def on_created(self, event):
                  collected.append(Path(event.src_path).name)

          with tempfile.TemporaryDirectory() as td:
              base = Path(td)
              observer = Observer()
              observer.schedule(
                  Collector(patterns=["*.csv"], ignore_directories=True),
                  str(base),
                  recursive=False,
              )
              observer.start()
              try:
                  for name in filenames:
                      (base / name).write_text("", encoding="utf-8")
                  time.sleep(sleepSeconds)
              finally:
                  observer.stop()
                  observer.join()
          return sorted(collected)


      events = collectCsvEvents(["a.csv", "b.tmp", "c.csv"])

      assert events == ["a.csv", "c.csv"]
      events
    exercise:
      prompt: collectCsvEvents에 ["first.csv", "second.csv", "scratch.tmp"]를 넘기면 sorted 결과가 두 csv 이름만 담는지 검증하세요.
      starterCode: |-
        import tempfile
        import time
        from pathlib import Path

        from watchdog.events import PatternMatchingEventHandler
        from watchdog.observers import Observer


        def collectCsvEvents(filenames: list, sleepSeconds: float = 0.5) -> list:
            collected: list[str] = []

            class Collector(PatternMatchingEventHandler):
                def on_created(self, event):
                    collected.append(Path(event.src_path).name)

            with tempfile.TemporaryDirectory() as td:
                base = Path(td)
                observer = Observer()
                observer.schedule(
                    Collector(patterns=["___"], ignore_directories=True),
                    str(base),
                    recursive=False,
                )
                observer.start()
                try:
                    for name in filenames:
                        (base / name).write_text("", encoding="utf-8")
                    time.sleep(sleepSeconds)
                finally:
                    observer.stop()
                    observer.join()
            return sorted(collected)


        events = collectCsvEvents(["first.csv", "second.csv", "scratch.tmp"])

        assert events == ["first.csv", "second.csv"]
        events
      solution: |-
        import tempfile
        import time
        from pathlib import Path

        from watchdog.events import PatternMatchingEventHandler
        from watchdog.observers import Observer


        def collectCsvEvents(filenames: list, sleepSeconds: float = 0.5) -> list:
            collected: list[str] = []

            class Collector(PatternMatchingEventHandler):
                def on_created(self, event):
                    collected.append(Path(event.src_path).name)

            with tempfile.TemporaryDirectory() as td:
                base = Path(td)
                observer = Observer()
                observer.schedule(
                    Collector(patterns=["*.csv"], ignore_directories=True),
                    str(base),
                    recursive=False,
                )
                observer.start()
                try:
                    for name in filenames:
                        (base / name).write_text("", encoding="utf-8")
                    time.sleep(sleepSeconds)
                finally:
                    observer.stop()
                    observer.join()
            return sorted(collected)


        events = collectCsvEvents(["first.csv", "second.csv", "scratch.tmp"])

        assert events == ["first.csv", "second.csv"]
        events
      hints:
        - 패턴 필터는 *.csv 한 개 리스트로 둔다.
        - sorted 결과는 알파벳 순으로 first가 second보다 앞에 온다.
      check:
        noError: collectCsvEvents 호출이 IOError 없이 끝나야 한다.
        resultCheck: events 리스트가 두 csv 파일을 정렬된 형태로 담아야 한다.
    check:
      noError: 감시 함수와 자식 파일 작성이 한 사이클에서 끝나야 한다.
      resultCheck: events가 csv 두 파일을 정렬된 형태로 담아야 한다.
  - id: debounce-cycle
    title: 디바운스 적용 사이클
    structuredPrimary: true
    subtitle: 중복 이벤트 정리
    goal: 같은 파일 이름이 짧은 시간 안에 두 번 들어와도 한 번만 결과에 남는 디바운스 사이클을 만든다.
    why: 자동화 사이클은 watchdog이 같은 파일에 여러 이벤트를 보낼 수 있는 OS 동작을 흡수해 결과가 안정되어야 한다.
    explanation: dedupeEvents 함수는 이벤트 리스트와 시간 창을 받아 같은 이름이 시간 창 안에 다시 등장하면 무시한다. 결과는 정렬된 고유 이름 리스트다. 같은 입력을 두 번 호출해도 같은 결과가 나오는 멱등성을 갖는다.
    tips:
      - 디바운스 dict는 함수 안에서 새로 만들어 호출 사이에 상태가 없도록 한다.
      - 정렬된 리스트로 결과를 두면 자동화에서 같은 순서를 보장한다.
    snippet: |-
      def dedupeEvents(events: list[tuple[str, float]], windowSeconds: float) -> list[str]:
          lastSeen: dict[str, float] = {}
          keep: list[str] = []
          for name, timestamp in events:
              if name in lastSeen and timestamp - lastSeen[name] < windowSeconds:
                  continue
              lastSeen[name] = timestamp
              keep.append(name)
          return sorted(set(keep))


      raw = [("a.csv", 0.0), ("a.csv", 0.05), ("b.csv", 0.1), ("a.csv", 0.3)]
      unique = dedupeEvents(raw, windowSeconds=0.2)

      assert unique == ["a.csv", "b.csv"]
      unique
    exercise:
      prompt: dedupeEvents에 [("x.csv", 0.0), ("y.csv", 0.05), ("x.csv", 0.1)]을 넘기고 window=0.2를 두면 결과가 ["x.csv", "y.csv"]가 되는지 검증하세요.
      starterCode: |-
        def dedupeEvents(events: list[tuple[str, float]], windowSeconds: float) -> list[str]:
            lastSeen: dict[str, float] = {}
            keep: list[str] = []
            for name, timestamp in events:
                if name in lastSeen and timestamp - lastSeen[name] < windowSeconds:
                    continue
                lastSeen[name] = timestamp
                keep.append(name)
            return sorted(___(keep))


        raw = [("x.csv", 0.0), ("y.csv", 0.05), ("x.csv", 0.1)]
        unique = dedupeEvents(raw, windowSeconds=0.2)

        assert unique == ["x.csv", "y.csv"]
        unique
      solution: |-
        def dedupeEvents(events: list[tuple[str, float]], windowSeconds: float) -> list[str]:
            lastSeen: dict[str, float] = {}
            keep: list[str] = []
            for name, timestamp in events:
                if name in lastSeen and timestamp - lastSeen[name] < windowSeconds:
                    continue
                lastSeen[name] = timestamp
                keep.append(name)
            return sorted(set(keep))


        raw = [("x.csv", 0.0), ("y.csv", 0.05), ("x.csv", 0.1)]
        unique = dedupeEvents(raw, windowSeconds=0.2)

        assert unique == ["x.csv", "y.csv"]
        unique
      hints:
        - 고유 항목으로 만드는 함수 이름은 set이다.
        - 알파벳 순으로 x.csv가 y.csv보다 앞에 온다.
      check:
        noError: dedupeEvents 호출과 정렬이 끝나야 한다.
        resultCheck: unique 리스트가 두 csv 이름을 정렬된 형태로 담아야 한다.
    check:
      noError: 디바운스 사이클이 끝나야 한다.
      resultCheck: unique 리스트가 두 csv 파일 이름을 정렬된 형태로 담아야 한다.
  - id: persist-cycle
    title: JSON 리포트 영속화
    structuredPrimary: true
    subtitle: reports/last.json
    goal: 사이클 결과를 reports/last.json에 저장하고 다시 읽어 영속성을 확인한다.
    why: 자동화 사이클은 결과가 디스크에 남아야 어제와 오늘을 비교할 수 있고 운영자가 사고를 빠르게 추적한다.
    explanation: persistCycle 함수는 unique 이벤트 리스트와 base 폴더를 받아 reports 디렉터리를 만들고 last.json에 저장한다. payload에는 events와 generatedAt이 들어간다. 같은 셀에서 다시 읽으면 원본 events가 그대로 복원된다.
    tips:
      - generatedAt은 항상 UTC ISO 형식으로 두어 자동화 표준에 맞춘다.
      - reports 디렉터리는 사이클마다 다시 만들어 다른 사이클이 영향을 주지 않게 한다.
    snippet: |-
      import json
      import tempfile
      from datetime import UTC, datetime
      from pathlib import Path


      def persistCycle(events: list[str], base: Path) -> dict:
          reportsDir = base / "reports"
          reportsDir.mkdir(parents=True, exist_ok=True)
          payload = {"events": events, "generatedAt": datetime.now(UTC).isoformat(timespec="seconds")}
          target = reportsDir / "last.json"
          target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
          restored = json.loads(target.read_text(encoding="utf-8"))
          return {"saved": payload, "restored": restored}


      with tempfile.TemporaryDirectory() as td:
          report = persistCycle(["a.csv", "b.csv"], Path(td))

      assert report["saved"]["events"] == report["restored"]["events"]
      assert "generatedAt" in report["restored"]
      report["restored"]["events"]
    exercise:
      prompt: persistCycle에 ["one.csv", "two.csv"]를 넘기면 restored events가 원본과 같고 generatedAt 키가 포함되는지 검증하세요.
      starterCode: |-
        import json
        import tempfile
        from datetime import UTC, datetime
        from pathlib import Path


        def persistCycle(events: list[str], base: Path) -> dict:
            reportsDir = base / "reports"
            reportsDir.mkdir(parents=True, exist_ok=True)
            payload = {"events": events, "generatedAt": datetime.now(UTC).isoformat(timespec="seconds")}
            target = reportsDir / "last.json"
            target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
            restored = json.loads(target.___(encoding="utf-8"))
            return {"saved": payload, "restored": restored}


        with tempfile.TemporaryDirectory() as td:
            report = persistCycle(["one.csv", "two.csv"], Path(td))

        assert report["restored"]["events"] == ["one.csv", "two.csv"]
        assert "generatedAt" in report["restored"]
        report["restored"]["events"]
      solution: |-
        import json
        import tempfile
        from datetime import UTC, datetime
        from pathlib import Path


        def persistCycle(events: list[str], base: Path) -> dict:
            reportsDir = base / "reports"
            reportsDir.mkdir(parents=True, exist_ok=True)
            payload = {"events": events, "generatedAt": datetime.now(UTC).isoformat(timespec="seconds")}
            target = reportsDir / "last.json"
            target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
            restored = json.loads(target.read_text(encoding="utf-8"))
            return {"saved": payload, "restored": restored}


        with tempfile.TemporaryDirectory() as td:
            report = persistCycle(["one.csv", "two.csv"], Path(td))

        assert report["restored"]["events"] == ["one.csv", "two.csv"]
        assert "generatedAt" in report["restored"]
        report["restored"]["events"]
      hints:
        - Path 객체의 텍스트 읽기 메서드는 read_text다.
        - restored events 리스트는 원본 입력과 정확히 같다.
      check:
        noError: persistCycle 호출과 JSON 왕복이 끝나야 한다.
        resultCheck: report.restored.events가 본문 기대값과 같고 generatedAt 키가 포함되어야 한다.
    check:
      noError: 영속 사이클 함수가 격리 공간에서 끝나야 한다.
      resultCheck: restored.events가 원본 events와 같고 generatedAt 키가 포함되어야 한다.
  - id: full-cycle
    title: 종합 사이클 완성
    structuredPrimary: true
    subtitle: 감시 + 디바운스 + 영속화
    goal: 감시, 디바운스, JSON 저장을 한 함수로 묶어 종합 폴더 감시 리포터를 완성한다.
    why: 종합 자동화 프로젝트는 사이클 한 호출로 시작과 끝이 명확해야 운영자가 신뢰할 수 있다.
    explanation: runReporter 함수는 입력 파일 리스트와 시간 창을 받아 collectCsvEvents, dedupeEvents, persistCycle을 차례로 호출한다. 결과는 events와 reportPath 두 키를 가진 dict다. 같은 입력으로 두 번 호출해도 같은 dict 구조를 유지한다.
    tips:
      - 종합 사이클은 한 함수에서 전 단계를 호출해 호출자가 단순해진다.
      - reportPath 키는 자동화 보고서의 영속 위치를 직접 가리킨다.
    snippet: |-
      import json
      import tempfile
      import time
      from datetime import UTC, datetime
      from pathlib import Path

      from watchdog.events import PatternMatchingEventHandler
      from watchdog.observers import Observer


      def runReporter(filenames: list, sleepSeconds: float = 0.5) -> dict:
          collected: list[str] = []

          class Collector(PatternMatchingEventHandler):
              def on_created(self, event):
                  collected.append(Path(event.src_path).name)

          with tempfile.TemporaryDirectory() as td:
              base = Path(td)
              observer = Observer()
              observer.schedule(
                  Collector(patterns=["*.csv"], ignore_directories=True),
                  str(base),
                  recursive=False,
              )
              observer.start()
              try:
                  for name in filenames:
                      (base / name).write_text("", encoding="utf-8")
                  time.sleep(sleepSeconds)
              finally:
                  observer.stop()
                  observer.join()
              unique = sorted(set(collected))
              reportsDir = base / "reports"
              reportsDir.mkdir(parents=True, exist_ok=True)
              payload = {"events": unique, "generatedAt": datetime.now(UTC).isoformat(timespec="seconds")}
              target = reportsDir / "last.json"
              target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
              return {"events": unique, "reportPath": str(target.relative_to(base))}


      report = runReporter(["a.csv", "b.csv", "ignore.tmp"])

      assert report["events"] == ["a.csv", "b.csv"]
      assert report["reportPath"].endswith("last.json")
      report
    exercise:
      prompt: runReporter에 ["alpha.csv", "beta.csv", "garbage.tmp"]를 넘기면 events가 알파벳 순으로 두 csv, reportPath가 last.json으로 끝나는지 종합 검증하세요.
      starterCode: |-
        import json
        import tempfile
        import time
        from datetime import UTC, datetime
        from pathlib import Path

        from watchdog.events import PatternMatchingEventHandler
        from watchdog.observers import Observer


        def runReporter(filenames: list, sleepSeconds: float = 0.5) -> dict:
            collected: list[str] = []

            class Collector(PatternMatchingEventHandler):
                def on_created(self, event):
                    collected.append(Path(event.src_path).name)

            with tempfile.TemporaryDirectory() as td:
                base = Path(td)
                observer = Observer()
                observer.schedule(
                    Collector(patterns=["*.csv"], ignore_directories=True),
                    str(base),
                    recursive=False,
                )
                observer.start()
                try:
                    for name in filenames:
                        (base / name).write_text("", encoding="utf-8")
                    time.sleep(sleepSeconds)
                finally:
                    observer.stop()
                    observer.join()
                unique = sorted(set(collected))
                reportsDir = base / "reports"
                reportsDir.mkdir(parents=True, exist_ok=True)
                payload = {"events": unique, "generatedAt": datetime.now(UTC).isoformat(timespec="seconds")}
                target = reportsDir / "last.json"
                target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                return {"events": unique, "reportPath": str(target.relative_to(base))}


        report = runReporter(["alpha.csv", "beta.csv", "garbage.tmp"])

        assert report["events"] == ["alpha.csv", "beta.csv"]
        assert report["reportPath"].endswith("___")
        report
      solution: |-
        import json
        import tempfile
        import time
        from datetime import UTC, datetime
        from pathlib import Path

        from watchdog.events import PatternMatchingEventHandler
        from watchdog.observers import Observer


        def runReporter(filenames: list, sleepSeconds: float = 0.5) -> dict:
            collected: list[str] = []

            class Collector(PatternMatchingEventHandler):
                def on_created(self, event):
                    collected.append(Path(event.src_path).name)

            with tempfile.TemporaryDirectory() as td:
                base = Path(td)
                observer = Observer()
                observer.schedule(
                    Collector(patterns=["*.csv"], ignore_directories=True),
                    str(base),
                    recursive=False,
                )
                observer.start()
                try:
                    for name in filenames:
                        (base / name).write_text("", encoding="utf-8")
                    time.sleep(sleepSeconds)
                finally:
                    observer.stop()
                    observer.join()
                unique = sorted(set(collected))
                reportsDir = base / "reports"
                reportsDir.mkdir(parents=True, exist_ok=True)
                payload = {"events": unique, "generatedAt": datetime.now(UTC).isoformat(timespec="seconds")}
                target = reportsDir / "last.json"
                target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                return {"events": unique, "reportPath": str(target.relative_to(base))}


        report = runReporter(["alpha.csv", "beta.csv", "garbage.tmp"])

        assert report["events"] == ["alpha.csv", "beta.csv"]
        assert report["reportPath"].endswith("last.json")
        report
      hints:
        - reportPath는 reports/last.json 형태로 끝난다.
        - endswith 인자에 last.json 문자열을 그대로 넣는다.
      check:
        noError: runReporter 호출이 종합 사이클로 끝나야 한다.
        resultCheck: report dict의 events가 두 csv 이름이고 reportPath가 last.json으로 끝나야 한다.
    check:
      noError: 종합 사이클이 격리 공간에서 끝나야 한다.
      resultCheck: report dict가 두 csv 이름과 last.json 경로를 정확히 담아야 한다.
`;export{e as default};