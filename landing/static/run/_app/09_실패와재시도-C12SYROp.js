var e=`meta:
  id: watchSched_09
  title: 실패와 재시도
  order: 9
  category: watchSched
  difficulty: easy
  audience: 폴더 이벤트와 스케줄 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - retry
    - backoff
    - resilience
intro:
  direction: 작업 실패 시 좁힌 예외를 잡고 백오프 시간을 늘려 가며 재시도하는 패턴으로 자동화 안정성을 만든다.
  benefits:
    - try/except로 좁힌 예외를 안전하게 잡는다.
    - 재시도 카운터와 백오프 시간을 함께 관리한다.
    - 최대 시도 횟수를 정해 무한 재시도를 막는다.
    - 종합 결과 dict로 시도와 실패를 분류해 보고한다.
  diagram:
    steps:
      - label: 작업 함수 정의
        detail: 일부러 처음 두 번은 실패하고 세 번째에 성공하는 함수를 만든다.
      - label: 재시도 루프
        detail: try/except 안에서 작업을 호출하고 실패 시 sleep 후 다시 시도한다.
      - label: 백오프 적용
        detail: 시도 횟수에 비례해 sleep 시간을 늘려 외부 자원에 과부하를 막는다.
      - label: 종합 결과 dict
        detail: 시도 횟수와 결과 상태를 dict로 묶어 자동화 보고에 사용한다.
    runtime:
      - label: 표준 라이브러리만
        detail: time과 기본 예외 처리만 사용한다.
      - label: assert 기반 검증
        detail: 시도 횟수와 결과 상태를 assert로 비교한다.
sections:
  - id: flaky-job
    title: 일부러 실패하는 작업
    structuredPrimary: true
    subtitle: 처음 두 번 실패 후 성공
    goal: 같은 인자에 대해 처음 두 호출은 RuntimeError를 일으키고 세 번째 호출은 성공하는 작업 함수를 만든다.
    why: 자동화 재시도 패턴을 학습하려면 실패와 성공을 자유롭게 만들 수 있는 작업 함수가 필요하다.
    explanation: 외부 카운터를 이용해 호출 횟수를 셀 수 있다. counter 값이 3보다 작으면 RuntimeError, 그 외에는 정상 결과를 돌려준다. 같은 함수는 호출 횟수에 따라 다른 분기로 동작해 학습용으로 적합하다.
    tips:
      - 함수 내부에서 nonlocal 변수를 사용하면 호출 횟수를 깔끔하게 관리할 수 있다.
      - 좁힌 예외 RuntimeError는 의도적 실패에 자주 쓰인다.
    snippet: |-
      counter = 0


      def flakyJob() -> str:
          global counter
          counter += 1
          if counter < 3:
              raise RuntimeError(f"attempt {counter}")
          return "done"


      attempts = []
      while True:
          try:
              result = flakyJob()
              attempts.append(("success", result))
              break
          except RuntimeError as exc:
              attempts.append(("fail", str(exc)))

      assert attempts == [("fail", "attempt 1"), ("fail", "attempt 2"), ("success", "done")]
      attempts
    exercise:
      prompt: 같은 함수를 만들되 counter 임계값을 4로 두어 세 번 실패 후 네 번째에 성공하는 결과 리스트가 만들어지는지 검증하세요.
      starterCode: |-
        counter = 0


        def flakyJob() -> str:
            global counter
            counter += 1
            if counter < ___:
                raise RuntimeError(f"attempt {counter}")
            return "done"


        attempts = []
        while True:
            try:
                result = flakyJob()
                attempts.append(("success", result))
                break
            except RuntimeError as exc:
                attempts.append(("fail", str(exc)))

        assert attempts == [
            ("fail", "attempt 1"),
            ("fail", "attempt 2"),
            ("fail", "attempt 3"),
            ("success", "done"),
        ]
        attempts
      solution: |-
        counter = 0


        def flakyJob() -> str:
            global counter
            counter += 1
            if counter < 4:
                raise RuntimeError(f"attempt {counter}")
            return "done"


        attempts = []
        while True:
            try:
                result = flakyJob()
                attempts.append(("success", result))
                break
            except RuntimeError as exc:
                attempts.append(("fail", str(exc)))

        assert attempts == [
            ("fail", "attempt 1"),
            ("fail", "attempt 2"),
            ("fail", "attempt 3"),
            ("success", "done"),
        ]
        attempts
      hints:
        - counter 임계값이 4이면 세 번 실패 후 네 번째에 성공한다.
        - 카운터 1, 2, 3에서는 RuntimeError가 발생한다.
      check:
        type: noError
        noError: while/try 흐름이 RuntimeError로 빠지지 않고 끝나야 한다.
        resultCheck: attempts 리스트가 네 항목을 본문 기대값과 같은 순서로 담아야 한다.
    check:
      noError: 작업 함수와 while/try 흐름이 끝나야 한다.
      resultCheck: attempts가 두 fail과 한 success 세 항목을 정확히 담아야 한다.
  - id: retry-loop
    title: 재시도 루프 만들기
    structuredPrimary: true
    subtitle: 최대 시도 횟수 제한
    goal: 최대 시도 횟수를 정해 정해진 만큼만 재시도하는 함수를 만든다.
    why: 자동화는 무한 재시도가 운영 사고로 이어질 수 있어 항상 최대 시도 횟수를 정해야 한다.
    explanation: retry 함수는 시도 횟수와 작업 함수를 받아 try/except로 호출하고 실패하면 다음 시도로 넘어간다. 최대 시도 횟수가 끝날 때까지 성공이 없으면 마지막 예외를 다시 raise한다. 정상 경로에서는 첫 성공 결과를 즉시 돌려준다.
    tips:
      - 좁힌 예외 RuntimeError로 제한하면 다른 종류 예외는 그대로 전파된다.
      - raise 키워드만 단독으로 쓰면 현재 except 컨텍스트의 마지막 예외가 다시 던져진다.
    snippet: |-
      def retry(maxAttempts: int, job) -> tuple:
          lastError = None
          for attempt in range(1, maxAttempts + 1):
              try:
                  return ("success", attempt, job())
              except RuntimeError as exc:
                  lastError = exc
          raise lastError


      counter = 0


      def flakyJob() -> str:
          global counter
          counter += 1
          if counter < 3:
              raise RuntimeError(f"attempt {counter}")
          return "done"


      outcome = retry(5, flakyJob)

      assert outcome == ("success", 3, "done")
      outcome
    exercise:
      prompt: retry에 maxAttempts=4를 넘기고 counter 임계값이 3인 작업이 정확히 3 번째 시도에 성공하는지 검증하세요.
      starterCode: |-
        def retry(maxAttempts: int, job) -> tuple:
            lastError = None
            for attempt in range(1, maxAttempts + 1):
                try:
                    return ("success", attempt, job())
                except RuntimeError as exc:
                    lastError = exc
            raise lastError


        counter = 0


        def flakyJob() -> str:
            global counter
            counter += 1
            if counter < 3:
                raise RuntimeError(f"attempt {counter}")
            return "done"


        outcome = retry(___, flakyJob)

        assert outcome == ("success", 3, "done")
        outcome
      solution: |-
        def retry(maxAttempts: int, job) -> tuple:
            lastError = None
            for attempt in range(1, maxAttempts + 1):
                try:
                    return ("success", attempt, job())
                except RuntimeError as exc:
                    lastError = exc
            raise lastError


        counter = 0


        def flakyJob() -> str:
            global counter
            counter += 1
            if counter < 3:
                raise RuntimeError(f"attempt {counter}")
            return "done"


        outcome = retry(4, flakyJob)

        assert outcome == ("success", 3, "done")
        outcome
      hints:
        - 최대 시도 횟수는 4여야 세 번째 시도까지 도달한다.
        - 성공한 시도 번호는 정확히 3이다.
      check:
        type: noError
        noError: retry 함수와 작업 호출이 정상적으로 끝나야 한다.
        resultCheck: outcome 튜플이 ("success", 3, "done")이어야 한다.
    check:
      noError: retry 함수 호출과 결과 반환이 끝나야 한다.
      resultCheck: outcome이 success, 3 attempt, done 결과로 채워져야 한다.
  - id: backoff
    title: 백오프 시간 늘리기
    structuredPrimary: true
    subtitle: 지수 백오프
    goal: 시도 횟수에 비례해 sleep 시간을 두 배씩 늘리는 백오프 함수를 작성한다.
    why: 자동화 재시도는 외부 자원에 과부하를 주지 않도록 시간을 점진적으로 늘리는 패턴이 표준이다.
    explanation: 백오프는 sleep 시간을 base에 2의 거듭제곱을 곱해 계산한다. 시도 횟수 1, 2, 3일 때 0.1, 0.2, 0.4초 형태가 된다. 학습에서는 0.05초처럼 짧은 base가 안전하다.
    tips:
      - 실제 운영에서는 max_delay로 최대 대기 시간을 두는 편이 안전하다.
      - 지수 백오프는 외부 API 호출 재시도에서 가장 흔한 패턴이다.
    snippet: |-
      def computeBackoff(attempt: int, base: float) -> float:
          return base * (2 ** (attempt - 1))


      schedule = [computeBackoff(n, 0.05) for n in range(1, 5)]

      assert schedule == [0.05, 0.1, 0.2, 0.4]
      schedule
    exercise:
      prompt: 같은 함수에 base=0.1을 넘겨 시도 1, 2, 3에서 0.1, 0.2, 0.4가 나오는지 검증하세요.
      starterCode: |-
        def computeBackoff(attempt: int, base: float) -> float:
            return base * (2 ** (attempt - ___))


        schedule = [computeBackoff(n, 0.1) for n in range(1, 4)]

        assert schedule == [0.1, 0.2, 0.4]
        schedule
      solution: |-
        def computeBackoff(attempt: int, base: float) -> float:
            return base * (2 ** (attempt - 1))


        schedule = [computeBackoff(n, 0.1) for n in range(1, 4)]

        assert schedule == [0.1, 0.2, 0.4]
        schedule
      hints:
        - 거듭제곱 지수는 attempt에서 1을 뺀 값이다.
        - 시도 3은 4배가 되어 0.4가 된다.
      check:
        type: noError
        noError: computeBackoff 호출이 정상적으로 끝나야 한다.
        resultCheck: schedule 리스트가 [0.1, 0.2, 0.4]여야 한다.
    check:
      noError: computeBackoff 호출과 리스트 컴프리헨션이 끝나야 한다.
      resultCheck: schedule 리스트가 [0.05, 0.1, 0.2, 0.4]여야 한다.
  - id: retry-summary
    title: 종합 재시도 보고
    structuredPrimary: true
    subtitle: 시도 횟수와 결과 상태
    goal: 재시도 흐름의 시도 횟수와 백오프 sleep 합계를 dict로 보고해 자동화 표준 결과를 만든다.
    why: 종합 보고는 운영자가 같은 함수의 동작을 한 화면에서 비교할 수 있게 만들고 사고 추적에 큰 차이를 만든다.
    explanation: retryWithReport 함수는 작업 함수와 최대 시도 횟수, base sleep을 받아 시도와 sleep 합계를 dict로 돌려준다. status 키는 success 또는 exhausted 두 값 중 하나다. exhausted는 모든 시도가 실패한 경우를 표시한다.
    tips:
      - 종합 결과 dict 키 이름은 짧고 명확하게 둔다.
      - exhausted 상태는 운영자에게 즉시 경보 신호다.
    snippet: |-
      def retryWithReport(maxAttempts: int, base: float, job) -> dict:
          attempts = 0
          sleeps = 0.0
          for attempt in range(1, maxAttempts + 1):
              attempts = attempt
              try:
                  result = job()
                  return {"status": "success", "attempts": attempts, "sleeps": sleeps, "result": result}
              except RuntimeError:
                  sleeps += base * (2 ** (attempt - 1))
          return {"status": "exhausted", "attempts": attempts, "sleeps": sleeps, "result": None}


      counter = 0


      def flakyJob() -> str:
          global counter
          counter += 1
          if counter < 3:
              raise RuntimeError(f"attempt {counter}")
          return "done"


      report = retryWithReport(5, 0.05, flakyJob)

      assert report["status"] == "success"
      assert report["attempts"] == 3
      assert report["result"] == "done"
      report
    exercise:
      prompt: 한 번도 성공하지 못하는 작업에 retryWithReport(2, 0.05, ...)를 호출하면 status가 exhausted, attempts가 2, sleeps가 0.15가 되는지 종합 검증하세요.
      starterCode: |-
        def retryWithReport(maxAttempts: int, base: float, job) -> dict:
            attempts = 0
            sleeps = 0.0
            for attempt in range(1, maxAttempts + 1):
                attempts = attempt
                try:
                    result = job()
                    return {"status": "success", "attempts": attempts, "sleeps": sleeps, "result": result}
                except RuntimeError:
                    sleeps += base * (2 ** (attempt - 1))
            return {"status": "___", "attempts": attempts, "sleeps": sleeps, "result": None}


        def alwaysFail() -> str:
            raise RuntimeError("nope")


        report = retryWithReport(2, 0.05, alwaysFail)

        assert report["status"] == "exhausted"
        assert report["attempts"] == 2
        assert abs(report["sleeps"] - 0.15) < 1e-9
        report
      solution: |-
        def retryWithReport(maxAttempts: int, base: float, job) -> dict:
            attempts = 0
            sleeps = 0.0
            for attempt in range(1, maxAttempts + 1):
                attempts = attempt
                try:
                    result = job()
                    return {"status": "success", "attempts": attempts, "sleeps": sleeps, "result": result}
                except RuntimeError:
                    sleeps += base * (2 ** (attempt - 1))
            return {"status": "exhausted", "attempts": attempts, "sleeps": sleeps, "result": None}


        def alwaysFail() -> str:
            raise RuntimeError("nope")


        report = retryWithReport(2, 0.05, alwaysFail)

        assert report["status"] == "exhausted"
        assert report["attempts"] == 2
        assert abs(report["sleeps"] - 0.15) < 1e-9
        report
      hints:
        - 종료 상태 키는 exhausted다.
        - 두 번 실패의 백오프 합은 0.05 + 0.1 = 0.15다.
      check:
        type: noError
        noError: retryWithReport 호출이 종합 정리 흐름으로 끝나야 한다.
        resultCheck: report의 status가 exhausted, attempts가 2, sleeps가 약 0.15여야 한다.
    check:
      noError: retryWithReport 함수와 작업 호출이 끝나야 한다.
      resultCheck: report의 status success, attempts 3, result "done"이 정확히 담겨야 한다.
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
  - id: watchSched_09-scheduled-retry-decision-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - flaky-job
    - retry-summary
    title: schedule job 실패의 재시도·다음 정규 실행 판정하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 실패 class와 idempotency, 정규 fire 충돌을 함께 검사한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 재시도가 다음 정규 fire와 겹치면 별도 run을 만들지 마세요.
    - failure class·idempotency·attempt limit을 모두 통과해야 재시도하세요.
    exercise:
      prompt: decide_scheduled_retry(failure, idempotent, attempt, maximum_attempts, retry_at, next_regular_at)를 완성하세요.
      starterCode: |-
        def decide_scheduled_retry(failure, idempotent, attempt, maximum_attempts, retry_at, next_regular_at):
            raise NotImplementedError
      solution: |
        def decide_scheduled_retry(failure, idempotent, attempt, maximum_attempts, retry_at, next_regular_at):
            retryable = failure in {"timeout", "temporary-unavailable", "resource-busy"}
            reasons = []
            if not retryable:
                reasons.append("failure-class")
            if not idempotent:
                reasons.append("non-idempotent")
            if attempt >= maximum_attempts:
                reasons.append("attempt-limit")
            if retry_at >= next_regular_at:
                reasons.append("regular-fire-conflict")
            return {"retry": not reasons, "reasons": reasons, "attempt": attempt, "retryAt": retry_at if not reasons else None}
      hints: *id001
    check:
      id: python.watchsched.watchSched_09.scheduled-retry-decision.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.watchsched.watchSched_09.scheduled-retry-decision.mastery.behavior.v1.fixture
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
        entry: decide_scheduled_retry
        cases:
        - id: allows-bounded-idempotent-retry
          arguments:
          - value: timeout
          - value: true
          - value: 1
          - value: 3
          - value: 110
          - value: 200
          expectedReturn:
            retry: true
            reasons: []
            attempt: 1
            retryAt: 110
        - id: reports-nonretryable-and-nonidempotent
          arguments:
          - value: invalid-input
          - value: false
          - value: 1
          - value: 3
          - value: 110
          - value: 200
          expectedReturn:
            retry: false
            reasons:
            - failure-class
            - non-idempotent
            attempt: 1
            retryAt: null
        - id: reports-limit-and-regular-conflict
          arguments:
          - value: timeout
          - value: true
          - value: 3
          - value: 3
          - value: 210
          - value: 200
          expectedReturn:
            retry: false
            reasons:
            - attempt-limit
            - regular-fire-conflict
            attempt: 3
            retryAt: null
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: watchSched_09-job-attempt-ledger-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - watchSched_09-scheduled-retry-decision-mastery
    title: 새 job attempt sequence에 중복·최종 상태 감사 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: job ID·scheduled time·attempt 쌍의 유일성과 최종 결과를 계산한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - job ID만으로 attempt를 묶지 말고 scheduled fire identity를 포함하세요.
    - 재시도 뒤 pass라도 모든 attempt 상태를 ledger에 보존하세요.
    exercise:
      prompt: audit_job_attempts(attempts)를 완성하세요.
      starterCode: |-
        def audit_job_attempts(attempts):
            raise NotImplementedError
      solution: |
        def audit_job_attempts(attempts):
            seen = set()
            duplicates = []
            by_fire = {}
            for item in attempts:
                identity = (item["jobId"], item["scheduledAt"], item["attempt"])
                if identity in seen:
                    duplicates.append(f"{item['jobId']}@{item['scheduledAt']}#{item['attempt']}")
                seen.add(identity)
                key = f"{item['jobId']}@{item['scheduledAt']}"
                by_fire.setdefault(key, []).append(item)
            final = {key: sorted(items, key=lambda item: item["attempt"])[-1]["status"] for key, items in sorted(by_fire.items())}
            return {"accepted": not duplicates, "duplicates": duplicates, "finalStatus": final, "attemptCount": len(attempts)}
      hints: *id002
    check:
      id: python.watchsched.watchSched_09.job-attempt-ledger.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.watchsched.watchSched_09.job-attempt-ledger.transfer.behavior.v1.fixture
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
        entry: audit_job_attempts
        cases:
        - id: summarizes-retry-final-status
          arguments:
          - value:
            - jobId: a
              scheduledAt: 100
              attempt: 1
              status: failed
            - jobId: a
              scheduledAt: 100
              attempt: 2
              status: passed
          expectedReturn:
            accepted: true
            duplicates: []
            finalStatus:
              a@100: passed
            attemptCount: 2
        - id: reports-duplicate-attempt
          arguments:
          - value:
            - jobId: a
              scheduledAt: 100
              attempt: 1
              status: failed
            - jobId: a
              scheduledAt: 100
              attempt: 1
              status: passed
          expectedReturn:
            accepted: false
            duplicates:
            - a@100#1
            finalStatus:
              a@100: passed
            attemptCount: 2
        - id: separates-scheduled-fires
          arguments:
          - value:
            - jobId: a
              scheduledAt: 100
              attempt: 1
              status: passed
            - jobId: a
              scheduledAt: 200
              attempt: 1
              status: failed
          expectedReturn:
            accepted: true
            duplicates: []
            finalStatus:
              a@100: passed
              a@200: failed
            attemptCount: 2
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: watchSched_09-schedule-retry-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - watchSched_09-job-attempt-ledger-transfer
    title: schedule 실패·재시도 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: failure class·fire identity·정규 실행 충돌을 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - event나 시간이 발생했다는 사실보다 처리 identity와 결과 evidence를 검증하세요.
    - 중복·지연·재시작 상황에서 같은 업무 결과가 보존되는지 확인하세요.
    exercise:
      prompt: choose_schedule_retry(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_schedule_retry(situation):
            raise NotImplementedError
      solution: |
        def choose_schedule_retry(situation):
            table = {'classify': {'action': 'separate transient and contract failure', 'evidence': 'failure class', 'risk': 'blind retry'}, 'identity': {'action': 'bind job scheduled fire attempt', 'evidence': 'attempt ledger', 'risk': 'duplicate run'}, 'conflict': {'action': 'compare retry with next regular fire', 'evidence': 'two timestamps', 'risk': 'overlapping work'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.watchsched.watchSched_09.schedule-retry-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.watchsched.watchSched_09.schedule-retry-recall.retrieval.behavior.v1.fixture
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
        entry: choose_schedule_retry
        cases:
        - id: recalls-classify
          arguments:
          - value: classify
          expectedReturn:
            action: separate transient and contract failure
            evidence: failure class
            risk: blind retry
        - id: recalls-identity
          arguments:
          - value: identity
          expectedReturn:
            action: bind job scheduled fire attempt
            evidence: attempt ledger
            risk: duplicate run
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};