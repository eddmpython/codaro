var e=`meta:
  id: watchSched_04
  title: 재귀 감시와 패턴 필터
  order: 4
  category: watchSched
  difficulty: easy
  audience: 폴더 이벤트와 스케줄 자동화에 입문하는 Python 학습자
  packages:
    - watchdog
  tags:
    - watchdog
    - recursive
    - patterns
intro:
  direction: watchdog의 PatternMatchingEventHandler로 재귀 감시 트리에서 원하는 확장자 패턴만 골라 자동화 입력으로 받는다.
  benefits:
    - schedule recursive=True로 자식 디렉터리까지 감시한다.
    - PatternMatchingEventHandler로 와일드카드 필터를 적용한다.
    - 무시 패턴으로 자동화 대상에서 제외할 파일을 명시한다.
    - 종합 결과로 필터링된 이벤트만 dict에 모은다.
  diagram:
    steps:
      - label: 다단계 폴더 트리 준비
        detail: 임시 폴더 안에 children 폴더를 만들고 다른 깊이의 파일들을 둔다.
      - label: PatternMatchingEventHandler 구성
        detail: patterns에 *.csv를 두고 ignore_patterns로 임시 파일을 제외한다.
      - label: 재귀 감시 시작
        detail: schedule에 recursive=True를 주어 자식 디렉터리까지 감시한다.
      - label: 종합 결과 분류
        detail: 매칭된 파일만 dict에 모아 자동화 입력으로 그대로 사용한다.
    runtime:
      - label: watchdog 패키지 필요
        detail: meta.packages의 watchdog이 로컬 가상환경에 준비되어야 한다.
      - label: assert 기반 검증
        detail: 분류 결과와 필터 동작을 assert로 비교한다.
sections:
  - id: pattern-handler
    title: 패턴 매칭 핸들러
    structuredPrimary: true
    subtitle: PatternMatchingEventHandler 사용
    goal: csv 파일만 처리하고 tmp 파일은 무시하는 핸들러를 만든다.
    why: 자동화는 보통 한 가지 파일 형식만 다루므로 핸들러 단계에서 미리 거르면 후속 단계가 단순해진다.
    explanation: watchdog.events.PatternMatchingEventHandler는 patterns와 ignore_patterns를 받아 매칭되는 이벤트만 콜백에 전달한다. patterns는 *.csv 같은 와일드카드 리스트, ignore_patterns는 같은 형식의 제외 목록이다. ignore_directories=True를 두면 디렉터리 이벤트를 한 번에 무시한다.
    tips:
      - 패턴은 글로브 스타일이며 대소문자 구분은 case_sensitive 인자로 제어한다.
      - ignore_patterns는 patterns 매칭 후 다시 한 번 거르는 단계다.
    snippet: |-
      from watchdog.events import FileCreatedEvent, PatternMatchingEventHandler


      collected: list[str] = []


      class CsvCollector(PatternMatchingEventHandler):
          def on_created(self, event):
              collected.append(event.src_path)


      handler = CsvCollector(patterns=["*.csv"], ignore_patterns=["*.tmp"], ignore_directories=True)
      handler.dispatch(FileCreatedEvent("report.csv"))
      handler.dispatch(FileCreatedEvent("scratch.tmp"))

      assert collected == ["report.csv"]
      collected
    exercise:
      prompt: CsvCollector에 두 csv 이벤트를 보내 collected 리스트가 두 경로를 본문 순서대로 담는지 검증하세요.
      starterCode: |-
        from watchdog.events import FileCreatedEvent, PatternMatchingEventHandler


        collected: list[str] = []


        class CsvCollector(PatternMatchingEventHandler):
            def on_created(self, event):
                collected.append(event.src_path)


        handler = CsvCollector(patterns=["___"], ignore_patterns=["*.tmp"], ignore_directories=True)
        handler.dispatch(FileCreatedEvent("first.csv"))
        handler.dispatch(FileCreatedEvent("second.csv"))

        assert collected == ["first.csv", "second.csv"]
        collected
      solution: |-
        from watchdog.events import FileCreatedEvent, PatternMatchingEventHandler


        collected: list[str] = []


        class CsvCollector(PatternMatchingEventHandler):
            def on_created(self, event):
                collected.append(event.src_path)


        handler = CsvCollector(patterns=["*.csv"], ignore_patterns=["*.tmp"], ignore_directories=True)
        handler.dispatch(FileCreatedEvent("first.csv"))
        handler.dispatch(FileCreatedEvent("second.csv"))

        assert collected == ["first.csv", "second.csv"]
        collected
      hints:
        - patterns는 와일드카드 *.csv 한 개를 가진 리스트다.
        - 두 csv 이벤트가 본문 순서대로 collected에 모인다.
      check:
        noError: PatternMatchingEventHandler 호출이 정상적으로 끝나야 한다.
        resultCheck: collected 리스트가 두 csv 경로를 정확히 담아야 한다.
    check:
      noError: 패턴 핸들러와 두 이벤트 처리가 끝나야 한다.
      resultCheck: collected가 csv 경로만 담고 tmp 경로는 무시되어야 한다.
  - id: recursive-watch
    title: 재귀 감시 활성화
    structuredPrimary: true
    subtitle: schedule(recursive=True)
    goal: 자식 폴더에 만들어진 csv 파일도 핸들러가 받는다.
    why: 자동화 입력은 보통 하위 폴더에 흩어져 있으므로 재귀 감시가 기본이다.
    explanation: Observer.schedule(handler, base, recursive=True)는 base의 모든 자식 디렉터리에서 발생한 이벤트도 핸들러에 전달한다. 자식이 만들어진 직후에도 같은 핸들러가 동작한다. recursive=False와 비교하면 차이가 명확하다.
    tips:
      - 너무 깊은 트리는 OS의 inotify 한도를 초과할 수 있으니 적정 깊이를 유지한다.
      - 자식 폴더가 사라지면 그 폴더 안의 추가 이벤트는 더 이상 도착하지 않는다.
    snippet: |-
      import tempfile
      import time
      from pathlib import Path

      from watchdog.events import PatternMatchingEventHandler
      from watchdog.observers import Observer


      collected: list[str] = []


      class CsvCollector(PatternMatchingEventHandler):
          def on_created(self, event):
              collected.append(Path(event.src_path).name)


      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          (base / "deep" / "deeper").mkdir(parents=True)
          observer = Observer()
          observer.schedule(
              CsvCollector(patterns=["*.csv"], ignore_directories=True),
              str(base),
              recursive=True,
          )
          observer.start()
          try:
              (base / "deep" / "deeper" / "leaf.csv").write_text("a,b", encoding="utf-8")
              time.sleep(0.6)
          finally:
              observer.stop()
              observer.join()

      assert "leaf.csv" in collected
      collected
    exercise:
      prompt: recursive=True로 잡힌 트리에서 nested/sub/data.csv 파일이 collected 리스트에 포함되는지 검증하세요.
      starterCode: |-
        import tempfile
        import time
        from pathlib import Path

        from watchdog.events import PatternMatchingEventHandler
        from watchdog.observers import Observer


        collected: list[str] = []


        class CsvCollector(PatternMatchingEventHandler):
            def on_created(self, event):
                collected.append(Path(event.src_path).name)


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "nested" / "sub").mkdir(parents=True)
            observer = Observer()
            observer.schedule(
                CsvCollector(patterns=["*.csv"], ignore_directories=True),
                str(base),
                recursive=___,
            )
            observer.start()
            try:
                (base / "nested" / "sub" / "data.csv").write_text("a,b", encoding="utf-8")
                time.sleep(0.6)
            finally:
                observer.stop()
                observer.join()

        assert "data.csv" in collected
        collected
      solution: |-
        import tempfile
        import time
        from pathlib import Path

        from watchdog.events import PatternMatchingEventHandler
        from watchdog.observers import Observer


        collected: list[str] = []


        class CsvCollector(PatternMatchingEventHandler):
            def on_created(self, event):
                collected.append(Path(event.src_path).name)


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "nested" / "sub").mkdir(parents=True)
            observer = Observer()
            observer.schedule(
                CsvCollector(patterns=["*.csv"], ignore_directories=True),
                str(base),
                recursive=True,
            )
            observer.start()
            try:
                (base / "nested" / "sub" / "data.csv").write_text("a,b", encoding="utf-8")
                time.sleep(0.6)
            finally:
                observer.stop()
                observer.join()

        assert "data.csv" in collected
        collected
      hints:
        - recursive 인자는 True여야 자식 폴더의 이벤트도 잡힌다.
        - 자식 폴더는 mkdir(parents=True)로 두 단계 미리 만든다.
      check:
        noError: 재귀 감시 흐름이 격리 공간에서 정상적으로 끝나야 한다.
        resultCheck: collected에 data.csv가 포함되어야 한다.
    check:
      noError: 재귀 감시와 깊은 파일 작성이 끝나야 한다.
      resultCheck: collected에 leaf.csv가 포함되어야 한다.
  - id: ignore-rules
    title: 무시 패턴 적용
    structuredPrimary: true
    subtitle: 임시 파일 자동 제외
    goal: ignore_patterns로 .tmp와 .lock 같은 임시 파일을 자동으로 거른다.
    why: 자동화 입력은 보통 다른 도구가 만드는 임시 파일과 섞이므로 처음부터 거르면 후속 단계가 안전하다.
    explanation: PatternMatchingEventHandler의 ignore_patterns 인자는 patterns로 매칭된 후 한 번 더 제외 단계를 둔다. *.tmp와 *.lock 같은 흔한 임시 패턴을 함께 두면 자동화 대상이 깔끔해진다. 같은 매칭은 case_sensitive=False로 두면 확장자 대소문자 차이도 무시할 수 있다.
    tips:
      - 흔한 무시 패턴은 *.tmp, *.lock, *~, .DS_Store다.
      - 무시 규칙은 한 곳에 모아 자동화 정책으로 관리한다.
    snippet: |-
      from watchdog.events import FileCreatedEvent, PatternMatchingEventHandler


      collected: list[str] = []


      class CsvCollector(PatternMatchingEventHandler):
          def on_created(self, event):
              collected.append(event.src_path)


      handler = CsvCollector(patterns=["*.csv"], ignore_patterns=["*.tmp", "*.lock"], ignore_directories=True)
      handler.dispatch(FileCreatedEvent("report.csv"))
      handler.dispatch(FileCreatedEvent("scratch.tmp"))
      handler.dispatch(FileCreatedEvent("session.lock"))

      assert collected == ["report.csv"]
      collected
    exercise:
      prompt: 같은 핸들러에 csv 이벤트 한 개와 lock 이벤트 한 개를 보내 csv만 남는지 검증하세요.
      starterCode: |-
        from watchdog.events import FileCreatedEvent, PatternMatchingEventHandler


        collected: list[str] = []


        class CsvCollector(PatternMatchingEventHandler):
            def on_created(self, event):
                collected.append(event.src_path)


        handler = CsvCollector(patterns=["*.csv"], ignore_patterns=["*.tmp", "*.___"], ignore_directories=True)
        handler.dispatch(FileCreatedEvent("data.csv"))
        handler.dispatch(FileCreatedEvent("ignore.lock"))

        assert collected == ["data.csv"]
        collected
      solution: |-
        from watchdog.events import FileCreatedEvent, PatternMatchingEventHandler


        collected: list[str] = []


        class CsvCollector(PatternMatchingEventHandler):
            def on_created(self, event):
                collected.append(event.src_path)


        handler = CsvCollector(patterns=["*.csv"], ignore_patterns=["*.tmp", "*.lock"], ignore_directories=True)
        handler.dispatch(FileCreatedEvent("data.csv"))
        handler.dispatch(FileCreatedEvent("ignore.lock"))

        assert collected == ["data.csv"]
        collected
      hints:
        - 무시 패턴 두 번째는 *.lock이다.
        - lock 이벤트는 ignore_patterns 매칭으로 제외된다.
      check:
        noError: PatternMatchingEventHandler 호출이 정상적으로 끝나야 한다.
        resultCheck: collected가 data.csv 한 개만 담아야 한다.
    check:
      noError: 무시 패턴 적용이 두 이벤트에 대해 끝나야 한다.
      resultCheck: collected가 report.csv만 담고 tmp와 lock은 무시되어야 한다.
  - id: filter-summary
    title: 종합 필터링 결과
    structuredPrimary: true
    subtitle: 함수로 묶기
    goal: 재귀 감시와 패턴 필터를 한 함수로 묶어 자동화 표준 결과 dict를 만든다.
    why: 종합 함수는 다음 자동화 단계에 일관된 결과를 전달하는 표준이므로 반드시 정리해 둔다.
    explanation: watchPatterns 함수는 base 폴더와 패턴 리스트를 받아 재귀 감시 후 매칭된 파일 경로 리스트를 돌려준다. 결과 dict는 patterns 키와 matched 키를 가지며 다음 사이클의 입력으로 그대로 사용된다. 같은 함수는 빈 결과에 대해서도 안전하게 동작한다.
    tips:
      - 함수 인자에 sleep 시간을 두면 테스트 환경별로 조정이 쉽다.
      - matched 리스트는 정렬된 형태로 두어 자동화에서 같은 순서를 보장한다.
    snippet: |-
      import tempfile
      import time
      from pathlib import Path

      from watchdog.events import PatternMatchingEventHandler
      from watchdog.observers import Observer


      def watchPatterns(filenames: list, patterns: list, sleepSeconds: float = 0.6) -> dict:
          matched: list[str] = []

          class Collector(PatternMatchingEventHandler):
              def on_created(self, event):
                  matched.append(Path(event.src_path).name)

          with tempfile.TemporaryDirectory() as td:
              base = Path(td)
              (base / "deep").mkdir()
              observer = Observer()
              observer.schedule(
                  Collector(patterns=patterns, ignore_directories=True),
                  str(base),
                  recursive=True,
              )
              observer.start()
              try:
                  for name in filenames:
                      (base / "deep" / name).write_text("", encoding="utf-8")
                  time.sleep(sleepSeconds)
              finally:
                  observer.stop()
                  observer.join()
          return {"patterns": patterns, "matched": sorted(matched)}


      report = watchPatterns(["a.csv", "b.tmp", "c.csv"], patterns=["*.csv"])

      assert report["matched"] == ["a.csv", "c.csv"]
      report
    exercise:
      prompt: watchPatterns에 ["one.csv", "two.lock", "three.csv"]를 넘기고 patterns=["*.csv"]로 필터하면 종합 결과 matched가 정렬된 두 csv 이름인지 검증하세요.
      starterCode: |-
        import tempfile
        import time
        from pathlib import Path

        from watchdog.events import PatternMatchingEventHandler
        from watchdog.observers import Observer


        def watchPatterns(filenames: list, patterns: list, sleepSeconds: float = 0.6) -> dict:
            matched: list[str] = []

            class Collector(PatternMatchingEventHandler):
                def on_created(self, event):
                    matched.append(Path(event.src_path).name)

            with tempfile.TemporaryDirectory() as td:
                base = Path(td)
                (base / "deep").mkdir()
                observer = Observer()
                observer.schedule(
                    Collector(patterns=patterns, ignore_directories=True),
                    str(base),
                    recursive=True,
                )
                observer.start()
                try:
                    for name in filenames:
                        (base / "deep" / name).write_text("", encoding="utf-8")
                    time.sleep(sleepSeconds)
                finally:
                    observer.stop()
                    observer.join()
            return {"patterns": patterns, "matched": ___(matched)}


        report = watchPatterns(["one.csv", "two.lock", "three.csv"], patterns=["*.csv"])

        assert report["matched"] == ["one.csv", "three.csv"]
        report
      solution: |-
        import tempfile
        import time
        from pathlib import Path

        from watchdog.events import PatternMatchingEventHandler
        from watchdog.observers import Observer


        def watchPatterns(filenames: list, patterns: list, sleepSeconds: float = 0.6) -> dict:
            matched: list[str] = []

            class Collector(PatternMatchingEventHandler):
                def on_created(self, event):
                    matched.append(Path(event.src_path).name)

            with tempfile.TemporaryDirectory() as td:
                base = Path(td)
                (base / "deep").mkdir()
                observer = Observer()
                observer.schedule(
                    Collector(patterns=patterns, ignore_directories=True),
                    str(base),
                    recursive=True,
                )
                observer.start()
                try:
                    for name in filenames:
                        (base / "deep" / name).write_text("", encoding="utf-8")
                    time.sleep(sleepSeconds)
                finally:
                    observer.stop()
                    observer.join()
            return {"patterns": patterns, "matched": sorted(matched)}


        report = watchPatterns(["one.csv", "two.lock", "three.csv"], patterns=["*.csv"])

        assert report["matched"] == ["one.csv", "three.csv"]
        report
      hints:
        - 정렬 함수 이름은 sorted다.
        - 알파벳 순으로 one.csv가 three.csv보다 앞에 온다.
      check:
        noError: watchPatterns 함수 호출과 종합 결과 dict 반환이 끝나야 한다.
        resultCheck: report["matched"]가 두 csv 파일을 정렬된 형태로 담아야 한다.
    check:
      noError: 종합 패턴 함수와 자식 파일 작성이 끝나야 한다.
      resultCheck: report dict의 matched가 csv 두 개만 정렬된 형태로 담아야 한다.
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
  - id: watchSched_04-recursive-watch-filter-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pattern-handler
    - filter-summary
    title: 재귀 감시 path의 include·exclude·depth 판정하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: root 상대 path를 기준으로 directory 제외와 최대 depth를 적용한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 문자열 prefix가 아니라 root 상대 path 구조로 scope를 검사하세요.
    - 생성 output directory와 최대 재귀 depth를 명시하세요.
    exercise:
      prompt: filter_recursive_paths(paths, root, excluded_parts, maximum_depth)를 완성하세요.
      starterCode: |-
        def filter_recursive_paths(paths, root, excluded_parts, maximum_depth):
            raise NotImplementedError
      solution: |
        def filter_recursive_paths(paths, root, excluded_parts, maximum_depth):
            from pathlib import PurePosixPath
            root_path = PurePosixPath(root)
            accepted = []
            rejected = []
            for value in paths:
                path = PurePosixPath(value)
                try:
                    relative = path.relative_to(root_path)
                except ValueError:
                    rejected.append({"path": value, "reason": "root"})
                    continue
                if any(part in excluded_parts for part in relative.parts[:-1]):
                    rejected.append({"path": value, "reason": "excluded"})
                elif len(relative.parts) - 1 > maximum_depth:
                    rejected.append({"path": value, "reason": "depth"})
                else:
                    accepted.append(value)
            return {"accepted": accepted, "rejected": rejected}
      hints: *id001
    check:
      id: python.watchsched.watchSched_04.recursive-watch-filter.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.watchsched.watchSched_04.recursive-watch-filter.mastery.behavior.v1.fixture
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
        entry: filter_recursive_paths
        cases:
        - id: accepts-within-depth
          arguments:
          - value:
            - /root/a.txt
            - /root/sub/b.txt
          - value: /root
          - value:
            - output
          - value: 1
          expectedReturn:
            accepted:
            - /root/a.txt
            - /root/sub/b.txt
            rejected: []
        - id: rejects-excluded-directory
          arguments:
          - value:
            - /root/output/a.txt
          - value: /root
          - value:
            - output
          - value: 3
          expectedReturn:
            accepted: []
            rejected:
            - path: /root/output/a.txt
              reason: excluded
        - id: rejects-depth-and-root
          arguments:
          - value:
            - /root/a/b/c.txt
            - /other/x.txt
          - value: /root
          - value: []
          - value: 1
          expectedReturn:
            accepted: []
            rejected:
            - path: /root/a/b/c.txt
              reason: depth
            - path: /other/x.txt
              reason: root
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: watchSched_04-symlink-watch-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - watchSched_04-recursive-watch-filter-mastery
    title: 새 재귀 감시에 symlink 경계 감사 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: resolved target이 허용 root 밖이거나 cycle identity를 만들면 차단한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - symlink path가 root 안이어도 resolved target을 다시 검사하세요.
    - 같은 target으로 이어지는 중복 link는 반복 감시를 막기 위해 격리하세요.
    exercise:
      prompt: audit_watch_links(links, allowed_root)를 완성하세요.
      starterCode: |-
        def audit_watch_links(links, allowed_root):
            raise NotImplementedError
      solution: |
        def audit_watch_links(links, allowed_root):
            accepted = []
            rejected = []
            seen_targets = set()
            prefix = allowed_root.rstrip("/") + "/"
            for link in links:
                target = link["target"]
                if not (target == allowed_root or target.startswith(prefix)):
                    rejected.append({"path": link["path"], "reason": "target-outside-root"})
                elif target in seen_targets:
                    rejected.append({"path": link["path"], "reason": "duplicate-target"})
                else:
                    accepted.append(link["path"])
                    seen_targets.add(target)
            return {"accepted": accepted, "rejected": rejected}
      hints: *id002
    check:
      id: python.watchsched.watchSched_04.symlink-watch-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.watchsched.watchSched_04.symlink-watch-audit.transfer.behavior.v1.fixture
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
        entry: audit_watch_links
        cases:
        - id: accepts-in-root-link
          arguments:
          - value:
            - path: /root/link
              target: /root/data
          - value: /root
          expectedReturn:
            accepted:
            - /root/link
            rejected: []
        - id: rejects-outside-target
          arguments:
          - value:
            - path: /root/link
              target: /secret
          - value: /root
          expectedReturn:
            accepted: []
            rejected:
            - path: /root/link
              reason: target-outside-root
        - id: rejects-duplicate-target
          arguments:
          - value:
            - path: /root/a
              target: /root/data
            - path: /root/b
              target: /root/data
          - value: /root
          expectedReturn:
            accepted:
            - /root/a
            rejected:
            - path: /root/b
              reason: duplicate-target
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: watchSched_04-recursive-watch-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - watchSched_04-symlink-watch-audit-transfer
    title: 재귀 감시 경계 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: depth·exclude·symlink target 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - event나 시간이 발생했다는 사실보다 처리 identity와 결과 evidence를 검증하세요.
    - 중복·지연·재시작 상황에서 같은 업무 결과가 보존되는지 확인하세요.
    exercise:
      prompt: choose_recursive_watch_gate(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_recursive_watch_gate(situation):
            raise NotImplementedError
      solution: |
        def choose_recursive_watch_gate(situation):
            table = {'depth': {'action': 'bound root-relative depth', 'evidence': 'relative parts', 'risk': 'unbounded tree'}, 'exclude': {'action': 'exclude output cache temp', 'evidence': 'directory allow and deny list', 'risk': 'self-trigger loop'}, 'symlink': {'action': 'resolve and deduplicate target', 'evidence': 'link and target identities', 'risk': 'root escape or cycle'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.watchsched.watchSched_04.recursive-watch-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.watchsched.watchSched_04.recursive-watch-recall.retrieval.behavior.v1.fixture
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
        entry: choose_recursive_watch_gate
        cases:
        - id: recalls-depth
          arguments:
          - value: depth
          expectedReturn:
            action: bound root-relative depth
            evidence: relative parts
            risk: unbounded tree
        - id: recalls-exclude
          arguments:
          - value: exclude
          expectedReturn:
            action: exclude output cache temp
            evidence: directory allow and deny list
            risk: self-trigger loop
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};