var e=`meta:\r
  id: watchSched_06\r
  title: APScheduler 소개\r
  order: 6\r
  category: watchSched\r
  difficulty: easy\r
  audience: 폴더 이벤트와 스케줄 자동화에 입문하는 Python 학습자\r
  packages:\r
  - apscheduler
  tags:\r
    - apscheduler\r
    - background\r
    - jobs\r
intro:\r
  direction: APScheduler의 BlockingScheduler를 짧게 가동해 백그라운드 작업 등록과 안전한 종료 흐름을 셀에서 확인한다.\r
  benefits:\r
    - BackgroundScheduler를 시작과 정지로 안전하게 다룬다.\r
    - add_job으로 함수를 등록하고 즉시 트리거한다.\r
    - 작업 결과를 외부 리스트에 누적해 검증한다.\r
    - 종합 스케줄러 정리로 자동화 표준 흐름을 만든다.\r
  diagram:\r
    steps:\r
      - label: BackgroundScheduler 만들기\r
        detail: 인자 없이 BackgroundScheduler를 생성해 셀에서 직접 제어한다.\r
      - label: 작업 등록\r
        detail: add_job에 함수와 trigger="date"를 주어 즉시 실행되도록 등록한다.\r
      - label: start와 shutdown\r
        detail: start로 백그라운드 스레드를 띄우고 결과를 받은 뒤 shutdown으로 정리한다.\r
      - label: 종합 작업 dict\r
        detail: 실행 시각과 결과를 dict로 묶어 자동화 보고에 사용한다.\r
    runtime:\r
      - label: APScheduler 패키지 필요\r
        detail: meta.packages의 APScheduler가 로컬 가상환경에 준비되어야 한다.\r
      - label: assert 기반 검증\r
        detail: 실행 카운트와 종료 상태를 assert로 비교한다.\r
sections:\r
  - id: build-scheduler\r
    title: BackgroundScheduler 만들기\r
    structuredPrimary: true\r
    subtitle: 셀에서 안전한 시작\r
    goal: BackgroundScheduler를 만들고 start, shutdown 두 메서드를 호출한다.\r
    why: 자동화 학습에서는 스케줄러 객체를 만들고 정리하는 흐름을 가장 먼저 확인해 자원 누수를 막아야 한다.\r
    explanation: BackgroundScheduler는 별도 스레드에서 동작한다. start로 가동하고 shutdown으로 안전히 종료한다. 인자 없이 만들면 메모리 jobstore와 단일 스레드 executor가 기본이라 학습에 충분하다.\r
    tips:\r
      - shutdown은 wait=True가 기본이라 진행 중 작업을 끝까지 기다린다.\r
      - 같은 셀에서 두 번 start를 호출하면 RuntimeError가 발생한다.\r
    snippet: |-\r
      from apscheduler.schedulers.background import BackgroundScheduler\r
\r
      scheduler = BackgroundScheduler()\r
      scheduler.start()\r
      isRunning = scheduler.running\r
      scheduler.shutdown()\r
\r
      assert isRunning is True\r
      assert scheduler.running is False\r
      isRunning\r
    exercise:\r
      prompt: BackgroundScheduler를 start와 shutdown 두 단계로 다루고 시작과 종료 시점의 running 상태가 각각 True와 False인지 검증하세요.\r
      starterCode: |-\r
        from apscheduler.schedulers.background import BackgroundScheduler\r
\r
        scheduler = BackgroundScheduler()\r
        scheduler.___()\r
        isRunning = scheduler.running\r
        scheduler.___()\r
\r
        assert isRunning is True\r
        assert scheduler.running is False\r
        isRunning\r
      solution: |-\r
        from apscheduler.schedulers.background import BackgroundScheduler\r
\r
        scheduler = BackgroundScheduler()\r
        scheduler.start()\r
        isRunning = scheduler.running\r
        scheduler.shutdown()\r
\r
        assert isRunning is True\r
        assert scheduler.running is False\r
        isRunning\r
      hints:\r
        - 시작 메서드 이름은 start이며 인자가 없다.\r
        - 종료 메서드 이름은 shutdown이며 진행 작업을 기다린다.\r
      check:\r
        noError: start와 shutdown 호출이 정상적으로 끝나야 한다.\r
        resultCheck: isRunning이 True이고 종료 후 running이 False여야 한다.\r
    check:\r
      noError: BackgroundScheduler 생명주기 호출이 끝나야 한다.\r
      resultCheck: isRunning이 True이고 종료 후 running 속성이 False여야 한다.\r
  - id: register-job\r
    title: 즉시 실행 작업 등록\r
    structuredPrimary: true\r
    subtitle: trigger="date" 사용\r
    goal: add_job으로 함수를 즉시 실행 트리거로 등록하고 결과 리스트가 채워지는 것을 확인한다.\r
    why: 자동화는 한 번만 실행되는 작업도 자주 만나므로 즉시 실행 트리거가 표준 도구다.\r
    explanation: trigger="date"는 지정한 시각에 한 번 실행한다. run_date를 주지 않으면 즉시 실행이다. add_job은 Job 객체를 돌려준다. 짧은 sleep 후 결과 리스트를 확인하면 백그라운드 실행이 끝났음을 알 수 있다.\r
    tips:\r
      - 즉시 실행은 add_job(trigger="date", run_date=None)으로 표현된다.\r
      - 학습에서는 시간 sleep을 0.3초 정도로 두면 안정적이다.\r
    snippet: |-\r
      import time\r
\r
      from apscheduler.schedulers.background import BackgroundScheduler\r
\r
      results: list[int] = []\r
\r
\r
      def job() -> None:\r
          results.append(1)\r
\r
\r
      scheduler = BackgroundScheduler()\r
      scheduler.start()\r
      try:\r
          scheduler.add_job(job, trigger="date")\r
          time.sleep(0.3)\r
      finally:\r
          scheduler.shutdown()\r
\r
      assert results == [1]\r
      results\r
    exercise:\r
      prompt: add_job을 두 번 등록해 results 리스트가 [1, 1]로 채워지는지 검증하세요.\r
      starterCode: |-\r
        import time\r
\r
        from apscheduler.schedulers.background import BackgroundScheduler\r
\r
        results: list[int] = []\r
\r
\r
        def job() -> None:\r
            results.append(___)\r
\r
\r
        scheduler = BackgroundScheduler()\r
        scheduler.start()\r
        try:\r
            scheduler.add_job(job, trigger="date")\r
            scheduler.add_job(job, trigger="date")\r
            time.sleep(0.3)\r
        finally:\r
            scheduler.shutdown()\r
\r
        assert results == [1, 1]\r
        results\r
      solution: |-\r
        import time\r
\r
        from apscheduler.schedulers.background import BackgroundScheduler\r
\r
        results: list[int] = []\r
\r
\r
        def job() -> None:\r
            results.append(1)\r
\r
\r
        scheduler = BackgroundScheduler()\r
        scheduler.start()\r
        try:\r
            scheduler.add_job(job, trigger="date")\r
            scheduler.add_job(job, trigger="date")\r
            time.sleep(0.3)\r
        finally:\r
            scheduler.shutdown()\r
\r
        assert results == [1, 1]\r
        results\r
      hints:\r
        - 작업이 results에 추가하는 값은 정수 1이다.\r
        - 두 번 등록하면 [1, 1] 두 항목이 모인다.\r
      check:\r
        noError: 두 번의 add_job 호출과 shutdown이 정상적으로 끝나야 한다.\r
        resultCheck: results 리스트가 [1, 1]이어야 한다.\r
    check:\r
      noError: add_job과 sleep 후 shutdown이 끝나야 한다.\r
      resultCheck: results가 [1] 한 항목을 담아야 한다.\r
  - id: job-args\r
    title: 작업 인자 전달\r
    structuredPrimary: true\r
    subtitle: args와 kwargs 분리\r
    goal: add_job에 args와 kwargs를 분리해 같은 함수가 다른 결과를 만드는 것을 확인한다.\r
    why: 자동화는 같은 함수를 다른 인자로 여러 번 등록해야 하는 경우가 흔하므로 인자 전달 방식을 명확히 알아야 한다.\r
    explanation: add_job의 args 인자는 위치 인자 튜플, kwargs는 키워드 인자 dict다. 등록 시점에 인자가 캡처되므로 실행 시점의 변수 상태와 무관하다. 같은 함수를 다른 인자로 두 번 등록하면 두 다른 결과가 생긴다.\r
    tips:\r
      - args는 항상 튜플 또는 리스트로 두어 단일 인자도 인자 모음으로 다룬다.\r
      - kwargs는 dict로 두어 명시적인 키 이름을 함수에 전달한다.\r
    snippet: |-\r
      import time\r
\r
      from apscheduler.schedulers.background import BackgroundScheduler\r
\r
      results: list[tuple] = []\r
\r
\r
      def job(name: str, value: int) -> None:\r
          results.append((name, value))\r
\r
\r
      scheduler = BackgroundScheduler()\r
      scheduler.start()\r
      try:\r
          scheduler.add_job(job, trigger="date", args=("first", 10))\r
          scheduler.add_job(job, trigger="date", kwargs={"name": "second", "value": 20})\r
          time.sleep(0.3)\r
      finally:\r
          scheduler.shutdown()\r
      collected = sorted(results)\r
\r
      assert collected == [("first", 10), ("second", 20)]\r
      collected\r
    exercise:\r
      prompt: '같은 작업을 args=("alpha", 1)과 kwargs={"name": "beta", "value": 2}로 등록해 sorted 결과가 본문 기대값과 같은지 검증하세요.'\r
      starterCode: |-\r
        import time\r
\r
        from apscheduler.schedulers.background import BackgroundScheduler\r
\r
        results: list[tuple] = []\r
\r
\r
        def job(name: str, value: int) -> None:\r
            results.append((name, value))\r
\r
\r
        scheduler = BackgroundScheduler()\r
        scheduler.start()\r
        try:\r
            scheduler.add_job(job, trigger="date", args=("alpha", 1))\r
            scheduler.add_job(job, trigger="date", kwargs={"name": "beta", "value": ___})\r
            time.sleep(0.3)\r
        finally:\r
            scheduler.shutdown()\r
        collected = sorted(results)\r
\r
        assert collected == [("alpha", 1), ("beta", 2)]\r
        collected\r
      solution: |-\r
        import time\r
\r
        from apscheduler.schedulers.background import BackgroundScheduler\r
\r
        results: list[tuple] = []\r
\r
\r
        def job(name: str, value: int) -> None:\r
            results.append((name, value))\r
\r
\r
        scheduler = BackgroundScheduler()\r
        scheduler.start()\r
        try:\r
            scheduler.add_job(job, trigger="date", args=("alpha", 1))\r
            scheduler.add_job(job, trigger="date", kwargs={"name": "beta", "value": 2})\r
            time.sleep(0.3)\r
        finally:\r
            scheduler.shutdown()\r
        collected = sorted(results)\r
\r
        assert collected == [("alpha", 1), ("beta", 2)]\r
        collected\r
      hints:\r
        - kwargs의 value 키 값은 정수 2다.\r
        - sorted는 튜플을 알파벳 순으로 정렬한다.\r
      check:\r
        noError: 두 add_job 호출과 shutdown이 정상적으로 끝나야 한다.\r
        resultCheck: collected가 두 튜플을 본문 기대값과 같은 순서로 담아야 한다.\r
    check:\r
      noError: 두 인자 패턴 호출과 sort가 끝나야 한다.\r
      resultCheck: collected가 두 튜플을 알파벳 순으로 담아야 한다.\r
  - id: scheduler-cycle\r
    title: 종합 스케줄러 사이클\r
    structuredPrimary: true\r
    subtitle: 함수로 묶기\r
    goal: 스케줄러 시작, 작업 등록, 결과 수집, 종료를 한 함수로 묶어 자동화 표준 흐름을 만든다.\r
    why: 종합 사이클을 함수로 두면 호출자가 한 줄로 자동화 작업을 시작하고 같은 dict 결과를 받을 수 있다.\r
    explanation: runOnce 함수는 작업 함수와 인자 리스트를 받아 BackgroundScheduler를 짧게 가동해 결과를 모은다. 결과 dict는 jobCount와 results 키를 가진다. 같은 함수는 두 번 호출해도 같은 dict 형태를 유지하므로 자동화 표준에 적합하다.\r
    tips:\r
      - try/finally로 shutdown을 보장하면 예외가 발생해도 자원이 정리된다.\r
      - results 리스트는 정렬하면 자동화에서 일관된 순서를 가진다.\r
    snippet: |-\r
      import time\r
\r
      from apscheduler.schedulers.background import BackgroundScheduler\r
\r
\r
      def runOnce(items: list[int]) -> dict:\r
          collected: list[int] = []\r
\r
          def job(value: int) -> None:\r
              collected.append(value * 10)\r
\r
          scheduler = BackgroundScheduler()\r
          scheduler.start()\r
          try:\r
              for value in items:\r
                  scheduler.add_job(job, trigger="date", args=(value,))\r
              time.sleep(0.3)\r
          finally:\r
              scheduler.shutdown()\r
          return {"jobCount": len(items), "results": sorted(collected)}\r
\r
\r
      report = runOnce([1, 2, 3])\r
\r
      assert report == {"jobCount": 3, "results": [10, 20, 30]}\r
      report\r
    exercise:\r
      prompt: runOnce에 [4, 5]를 넘기면 jobCount가 2이고 results가 [40, 50] 종합 결과를 보고하는지 검증하세요.\r
      starterCode: |-\r
        import time\r
\r
        from apscheduler.schedulers.background import BackgroundScheduler\r
\r
\r
        def runOnce(items: list[int]) -> dict:\r
            collected: list[int] = []\r
\r
            def job(value: int) -> None:\r
                collected.append(value * ___)\r
\r
            scheduler = BackgroundScheduler()\r
            scheduler.start()\r
            try:\r
                for value in items:\r
                    scheduler.add_job(job, trigger="date", args=(value,))\r
                time.sleep(0.3)\r
            finally:\r
                scheduler.shutdown()\r
            return {"jobCount": len(items), "results": sorted(collected)}\r
\r
\r
        report = runOnce([4, 5])\r
\r
        assert report == {"jobCount": 2, "results": [40, 50]}\r
        report\r
      solution: |-\r
        import time\r
\r
        from apscheduler.schedulers.background import BackgroundScheduler\r
\r
\r
        def runOnce(items: list[int]) -> dict:\r
            collected: list[int] = []\r
\r
            def job(value: int) -> None:\r
                collected.append(value * 10)\r
\r
            scheduler = BackgroundScheduler()\r
            scheduler.start()\r
            try:\r
                for value in items:\r
                    scheduler.add_job(job, trigger="date", args=(value,))\r
                time.sleep(0.3)\r
            finally:\r
                scheduler.shutdown()\r
            return {"jobCount": len(items), "results": sorted(collected)}\r
\r
\r
        report = runOnce([4, 5])\r
\r
        assert report == {"jobCount": 2, "results": [40, 50]}\r
        report\r
      hints:\r
        - 작업 안 곱셈 인자는 정수 10이다.\r
        - '[4, 5]는 각각 40과 50이 되어 results 리스트에 모인다.'\r
      check:\r
        noError: runOnce 호출이 종합 흐름으로 끝나야 한다.\r
        resultCheck: report dict가 jobCount 2와 results [40, 50]을 정확히 담아야 한다.\r
    check:\r
      noError: 종합 스케줄러 함수가 자원 정리까지 끝나야 한다.\r
      resultCheck: report dict가 jobCount 3와 정렬된 results [10, 20, 30]을 담아야 한다.\r
`;export{e as default};