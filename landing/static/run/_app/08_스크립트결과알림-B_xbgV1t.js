var e=`meta:
  id: email_08
  title: 스크립트 결과 알림
  order: 8
  category: email
  difficulty: ⭐⭐⭐
  badge: 중급
  packages: []
  tags:
    - try/except
    - 알림 봇
    - 스택트레이스
  outcomes:
    - automation.email.notify
  prerequisites:
    - automation.email.send
  estimatedMinutes: 45
  seo:
    title: "스크립트 실패 → SMTP 알림 봇 패턴"
    description: "야간 배치 스크립트가 실패하면 즉시 알림 메일을 받는다. 새벽 30분 대응 지연이 즉시 통보로 줄어든다."
    keywords:
      - 스크립트 실패 알림
      - SMTP 알림 봇
      - 스택트레이스 첨부

intro:
  direction: "야간 배치 스크립트의 예외를 잡아 즉시 알림 메일을 보낸다. 평균 30분 대응 지연이 즉시 통보로 줄어든다."
  benefits:
    - "DevOps 박과장의 야간 장애 대응 지연을 즉시 통보로 줄인다."
    - "try/except + sendNotification 패턴이 어떤 스크립트에도 한 줄 추가로 적용."
    - "스택트레이스를 본문 또는 첨부로 함께 전송해 디버깅 즉시 가능."
  diagram:
    steps:
      - label: "1. 스크립트 본체"
        detail: "원래 하던 일을 함수로 캡슐화."
      - label: "2. 예외 캐치"
        detail: "try: ... except Exception as exc: sendNotification(exc)."
      - label: "3. 스택트레이스 전송"
        detail: "traceback.format_exc()로 전체 스택을 본문 또는 첨부."
      - label: "4. 데코레이터화"
        detail: "@notifyOnFailure 데코레이터로 한 줄 추가만으로 적용."
    runtime:
      - label: "표준 라이브러리"
        detail: "traceback + smtplib + email."
      - label: "검증"
        detail: "예외 발생 시 알림 함수 호출 여부와 본문 내용 단위 assert."

sections:
  - id: step1_notify
    title: "1단계. 알림 함수 정의"
    structuredPrimary: true
    subtitle: "예외 정보 → EmailMessage"
    goal: "예외 객체와 스크립트 이름을 받아 알림 메시지를 만드는 함수를 작성한다."
    why: "본 강의의 핵심 함수입니다. 어떤 스크립트에서도 같은 함수를 호출해 알림 발송."
    explanation: |-
      buildNotification(scriptName, exc, traceback)이 Subject에 '[FAIL] {script}', 본문에 예외 메시지 + 스택트레이스를 담은 EmailMessage 반환.
    tips:
      - "예외 메시지가 비어있을 수도 있으니 type(exc).__name__로 클래스명을 함께 표시."
    snippet: |-
      import traceback
      from email.message import EmailMessage

      def buildNotification(scriptName, exc, tb=None, toAddr="ops@example.com"):
          msg = EmailMessage()
          msg["From"] = "alerts@example.com"
          msg["To"] = toAddr
          msg["Subject"] = f"[FAIL] {scriptName}"
          body = (
              f"Script: {scriptName}\\n"
              f"Error type: {type(exc).__name__}\\n"
              f"Error message: {exc}\\n\\n"
              f"Traceback:\\n{tb or 'no traceback'}"
          )
          msg.set_content(body, charset="utf-8")
          return msg

      try:
          raise ValueError("DB connection failed")
      except Exception as exc:
          alert = buildNotification("nightly_etl", exc, traceback.format_exc())
      alert["Subject"], "DB connection" in alert.get_content()
    exercise:
      prompt: "buildNotification을 직접 작성하세요. Subject는 심각도(severity)에 따라 '[CRITICAL] script' 또는 '[WARN] script' 형식으로, 본문에는 예외 클래스명/메시지/traceback이 모두 들어가야 합니다. severity='critical' 호출 결과로 검증합니다."
      starterCode: |-
        import traceback
        from email.message import EmailMessage

        def buildNotification(scriptName, exc, tb=None, severity="critical", toAddr="ops@example.com"):
            msg = EmailMessage()
            msg["From"] = "alerts@example.com"
            msg["To"] = toAddr
            prefix = ___
            msg["Subject"] = f"{prefix} {scriptName}"
            body = ___
            msg.set_content(body, charset="utf-8")
            return msg

        try:
            raise ValueError("DB down")
        except Exception as exc:
            alert = buildNotification("etl", exc, traceback.format_exc(), severity="critical")
        assert alert["Subject"].startswith("[CRITICAL]")
        assert "ValueError" in alert.get_content()
        assert "DB down" in alert.get_content()
        alert["Subject"]
      hints:
        - "prefix: '[CRITICAL]' if severity == 'critical' else '[WARN]'. body: f'{type(exc).__name__}: {exc}\\\\n\\\\n{tb}'."
    check:
      noError: "f-string 안의 변수 정의."
      resultCheck: "True 출력."

  - id: step2_decorator
    title: "2단계. notifyOnFailure 데코레이터"
    structuredPrimary: true
    subtitle: "한 줄 추가로 어디든 적용"
    goal: "함수에 @notifyOnFailure를 붙이면 예외 발생 시 자동 알림."
    why: "기존 스크립트 코드를 거의 안 건드리고 알림을 추가하는 방법입니다."
    explanation: |-
      notifyOnFailure(toAddr) 데코레이터 팩토리. 내부 wrapper가 try/except로 함수를 감싸고 예외 발생 시 buildNotification → sendMessage 흐름.
    tips:
      - "데코레이터에서 발생한 예외를 다시 raise해서 호출자도 실패를 인지하도록 하는 게 안전."
    snippet: |-
      import traceback
      from email.message import EmailMessage
      from functools import wraps

      def buildNotification(scriptName, exc, tb, toAddr):
          msg = EmailMessage()
          msg["From"] = "alerts@example.com"
          msg["To"] = toAddr
          msg["Subject"] = f"[FAIL] {scriptName}"
          msg.set_content(f"{type(exc).__name__}: {exc}\\n\\n{tb}", charset="utf-8")
          return msg

      def notifyOnFailure(toAddr, dryRun=True):
          def decorator(func):
              @wraps(func)
              def wrapper(*args, **kwargs):
                  try:
                      return func(*args, **kwargs)
                  except Exception as exc:
                      alert = buildNotification(func.__name__, exc, traceback.format_exc(), toAddr)
                      if not dryRun:
                          pass
                      raise
              return wrapper
          return decorator

      collectedMessages = []
      def captureMessage(msg):
          collectedMessages.append(msg)

      @notifyOnFailure("ops@example.com", dryRun=True)
      def riskyJob(value):
          if value < 0:
              raise ValueError("negative input")
          return value * 2

      try:
          riskyJob(-1)
      except ValueError:
          pass

      "decorator ready"
    exercise:
      prompt: "데코레이터 인자 toAddr를 'devops@example.com'으로 바꾸세요."
      starterCode: |-
        from functools import wraps

        def notifyOnFailure(toAddr, dryRun=True):
            def decorator(func):
                @wraps(func)
                def wrapper(*args, **kwargs):
                    try:
                        return func(*args, **kwargs)
                    except Exception:
                        raise
                return wrapper
            return decorator

        @notifyOnFailure(___, dryRun=True)
        def job():
            return 1

        job()
      hints:
        - "문자열 'devops@example.com'."
    check:
      noError: "toAddr는 문자열."
      resultCheck: "출력 1."

  - id: validation
    title: "3단계. 검증 루프 - 예외 시 알림 메시지 검증"
    structuredPrimary: true
    subtitle: "알림 호출 + 본문 내용 단위 assert"
    goal: "예외가 발생했을 때 buildNotification이 호출되고 본문에 예외 정보가 들어가는지 검증한다."
    why: "알림 누락은 운영 장애의 큰 원인입니다. 데코레이터가 알림을 정확히 호출하는지 단위 검증이 본 강의의 핵심."
    explanation: |-
      알림 함수를 모킹해서 호출 여부와 본문을 직접 확인. 외부 SMTP 의존 0.
    tips:
      - "테스트에서는 알림 함수를 callback으로 주입하면 호출을 쉽게 추적할 수 있습니다."
    snippet: |-
      import traceback
      from email.message import EmailMessage
      from functools import wraps

      def buildNotification(scriptName, exc, tb, toAddr):
          msg = EmailMessage()
          msg["From"] = "alerts@example.com"
          msg["To"] = toAddr
          msg["Subject"] = f"[FAIL] {scriptName}"
          msg.set_content(f"{type(exc).__name__}: {exc}\\n{tb}", charset="utf-8")
          return msg

      collected = []
      def captureMessage(msg):
          collected.append(msg)

      def notifyOnFailure(toAddr, onAlert=None):
          def decorator(func):
              @wraps(func)
              def wrapper(*args, **kwargs):
                  try:
                      return func(*args, **kwargs)
                  except Exception as exc:
                      alert = buildNotification(func.__name__, exc, traceback.format_exc(), toAddr)
                      if onAlert:
                          onAlert(alert)
                      raise
              return wrapper
          return decorator

      @notifyOnFailure("ops@example.com", onAlert=captureMessage)
      def job(value):
          if value < 0:
              raise ValueError("negative")
          return value

      try:
          job(-5)
      except ValueError:
          pass

      assert len(collected) == 1
      assert collected[0]["Subject"] == "[FAIL] job"
      assert "negative" in collected[0].get_content()
      collected[0]["Subject"]
    exercise:
      prompt: "job(-10)에서 예외 메시지 'too negative'를 발생시키고 본문에 포함되는지 확인하세요."
      starterCode: |-
        import traceback
        from email.message import EmailMessage
        from functools import wraps

        def buildNotification(scriptName, exc, tb, toAddr):
            msg = EmailMessage()
            msg["From"] = "alerts@example.com"
            msg["To"] = toAddr
            msg["Subject"] = f"[FAIL] {scriptName}"
            msg.set_content(f"{exc}\\n{tb}", charset="utf-8")
            return msg

        collected = []
        def captureMessage(msg):
            collected.append(msg)

        def notifyOnFailure(toAddr, onAlert=None):
            def decorator(func):
                @wraps(func)
                def wrapper(*args, **kwargs):
                    try:
                        return func(*args, **kwargs)
                    except Exception as exc:
                        alert = buildNotification(func.__name__, exc, traceback.format_exc(), toAddr)
                        if onAlert:
                            onAlert(alert)
                        raise
                return wrapper
            return decorator

        @notifyOnFailure("ops@example.com", onAlert=captureMessage)
        def job(value):
            raise ValueError(___)

        try:
            job(-10)
        except ValueError:
            pass

        "too negative" in collected[0].get_content()
      hints:
        - "문자열 'too negative'."
    check:
      noError: "raise는 클래스 인스턴스."
      resultCheck: "True 출력."

  - id: practice
    title: "실습 - 종합 미션"
    subtitle: "야간 배치 알림 래퍼"
    goal: "기존 함수에 알림 데코레이터를 적용해 예외 시 자동 알림 흐름을 완성한다."
    why: "DevOps 박과장이 야간 ETL 실패를 다음 날 아침에야 발견하던 사이클이 즉시 알림으로 바뀝니다. 데코레이터 한 줄 추가로 어떤 스크립트든 알림 흐름이 붙고, 실패 본문에 traceback이 함께 도착해 새벽 호출 없이도 원인을 즉시 파악합니다. 본 패턴은 10강 주간 발송기에서 실패 시 fallback 알림으로 그대로 재사용됩니다."
    explanation: |-
      미션: 야간 ETL 함수를 데코레이터로 감싸고 예외 시 알림 메시지가 만들어지는지 검증.
    tips:
      - "실 발송은 sendMessage(alert, dryRun=False)로 전환만 하면 됩니다."
    snippet: |-
      import traceback
      from email.message import EmailMessage
      from functools import wraps
    exercise:
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."
      starterCode: |-
        ___
      hints:
        - "@notifyOnFailure로 ETL 함수 감싸고 예외 시 알림 호출 검증."
    check:
      noError: "데코레이터 적용."
      resultCheck: "알림 본문에 예외 메시지 포함."
    blocks:
      - type: expansion
        title: "미션: 야간 ETL 알림"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              import traceback
              from email.message import EmailMessage
              from functools import wraps

              def buildNotification(scriptName, exc, tb, toAddr):
                  msg = EmailMessage()
                  msg["From"] = "alerts@example.com"
                  msg["To"] = toAddr
                  msg["Subject"] = f"[FAIL] {scriptName}"
                  msg.set_content(f"{type(exc).__name__}: {exc}\\n\\n{tb}", charset="utf-8")
                  return msg

              alertsLog = []
              def captureAlert(msg):
                  alertsLog.append(msg)

              def notifyOnFailure(toAddr, onAlert=None):
                  def decorator(func):
                      @wraps(func)
                      def wrapper(*args, **kwargs):
                          try:
                              return func(*args, **kwargs)
                          except Exception as exc:
                              alert = buildNotification(func.__name__, exc, traceback.format_exc(), toAddr)
                              if onAlert:
                                  onAlert(alert)
                              raise
                      return wrapper
                  return decorator

              @notifyOnFailure("devops@example.com", onAlert=captureAlert)
              def nightlyEtl(source):
                  if source == "broken":
                      raise ConnectionError("DB unreachable")
                  return "ok"

              assert nightlyEtl("good") == "ok"
              try:
                  nightlyEtl("broken")
              except ConnectionError:
                  pass

              assert len(alertsLog) == 1
              assert "DB unreachable" in alertsLog[0].get_content()
              assert "[FAIL] nightlyEtl" == alertsLog[0]["Subject"]
              alertsLog[0]["Subject"]
      - type: expansion
        title: "미션2: 로그 첨부 + 재시도 게이트"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              import traceback
              from email.message import EmailMessage
              from functools import wraps

              def buildLogAlert(scriptName, exc, tb, logLines, toAddr):
                  msg = EmailMessage()
                  msg["From"] = "alerts@example.com"
                  msg["To"] = toAddr
                  msg["Subject"] = f"[FAIL] {scriptName}"
                  msg.set_content(f"{type(exc).__name__}: {exc}\\n\\n{tb}", charset="utf-8")
                  logBlob = "\\n".join(logLines).encode("utf-8")
                  msg.add_attachment(logBlob, maintype="text", subtype="plain", filename=f"{scriptName}.log")
                  return msg

              def retryWithAlert(maxAttempts, toAddr, onAlert):
                  def decorator(func):
                      @wraps(func)
                      def wrapper(*args, **kwargs):
                          logLines = []
                          for attempt in range(1, maxAttempts + 1):
                              try:
                                  logLines.append(f"attempt {attempt}: start")
                                  result = func(*args, **kwargs)
                                  logLines.append(f"attempt {attempt}: ok")
                                  return result
                              except Exception as exc:
                                  logLines.append(f"attempt {attempt}: {type(exc).__name__}: {exc}")
                                  if attempt == maxAttempts:
                                      alert = buildLogAlert(func.__name__, exc, traceback.format_exc(), logLines, toAddr)
                                      onAlert(alert)
                                      raise
                      return wrapper
                  return decorator

              captured = []
              attemptsSeen = []

              @retryWithAlert(maxAttempts=3, toAddr="devops@example.com", onAlert=captured.append)
              def flakyJob():
                  attemptsSeen.append(1)
                  raise ConnectionError("upstream timeout")

              try:
                  flakyJob()
              except ConnectionError:
                  pass

              assert len(attemptsSeen) == 3
              assert len(captured) == 1
              attachments = list(captured[0].iter_attachments())
              assert attachments[0].get_filename() == "flakyJob.log"
              logText = attachments[0].get_payload(decode=True).decode("utf-8")
              assert "attempt 3" in logText
              captured[0]["Subject"], attachments[0].get_filename()

  - id: extensions
    title: "확장 변주"
    blocks:
      - type: list
        style: bullet
        items:
          - "성공 시에도 요약 알림 (매일 정상 동작 확인)"
          - "Slack 웹훅과 동시 전송 (SMTP + HTTP POST)"
          - "심각도별 다른 수신자 (Critical → 팀장, Warning → 팀)"
          - "재시도 3회 실패 시에만 알림 (false positive 줄이기)"
          - "10강 결합 - 주간 발송기 결과에 본 알림 패턴 결합"
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
  - id: email_08-script-notification-decision-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_notify
    - extensions
    title: 스크립트 결과를 severity·변화 기준으로 알림할지 판정하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 성공 spam을 줄이고 새 실패·복구·임계 변화만 message로 만든다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 모든 성공 실행을 메일로 보내지 말고 상태 변화와 임계 변화만 알리세요.
    - 새 실패와 복구를 다른 severity와 reason으로 기록하세요.
    exercise:
      prompt: decide_script_notification(current, previous, policy)를 완성하세요.
      starterCode: |-
        def decide_script_notification(current, previous, policy):
            raise NotImplementedError
      solution: |
        def decide_script_notification(current, previous, policy):
            reasons = []
            if current["status"] == "failed" and previous.get("status") != "failed":
                reasons.append("new-failure")
            if current["status"] == "passed" and previous.get("status") == "failed":
                reasons.append("recovery")
            if abs(current.get("metric", 0) - previous.get("metric", 0)) >= policy.get("minimumMetricChange", float("inf")):
                reasons.append("metric-change")
            notify = bool(reasons)
            severity = "critical" if "new-failure" in reasons else "info"
            return {"notify": notify, "severity": severity if notify else None, "reasons": reasons}
      hints: *id001
    check:
      id: python.email.email_08.script-notification-decision.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.email.email_08.script-notification-decision.mastery.behavior.v1.fixture
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
        entry: decide_script_notification
        cases:
        - id: notifies-new-failure
          arguments:
          - value:
              status: failed
              metric: 1
          - value:
              status: passed
              metric: 1
          - value:
              minimumMetricChange: 10
          expectedReturn:
            notify: true
            severity: critical
            reasons:
            - new-failure
        - id: notifies-recovery-and-metric-change
          arguments:
          - value:
              status: passed
              metric: 20
          - value:
              status: failed
              metric: 5
          - value:
              minimumMetricChange: 10
          expectedReturn:
            notify: true
            severity: info
            reasons:
            - recovery
            - metric-change
        - id: suppresses-unchanged-success
          arguments:
          - value:
              status: passed
              metric: 5
          - value:
              status: passed
              metric: 4
          - value:
              minimumMetricChange: 10
          expectedReturn:
            notify: false
            severity: null
            reasons: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: email_08-notification-dedupe-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - email_08-script-notification-decision-mastery
    title: 새 알림 queue에 사건 fingerprint·cooldown dedupe 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 같은 사건의 반복 메일을 cooldown 안에서 하나로 합친다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - subject 문자열이 아니라 사건 fingerprint로 알림을 dedupe하세요.
    - suppressed 알림 ID도 ledger에 남겨 관측 손실을 막으세요.
    exercise:
      prompt: dedupe_notifications(notifications, cooldown_seconds)를 완성하세요.
      starterCode: |-
        def dedupe_notifications(notifications, cooldown_seconds):
            raise NotImplementedError
      solution: |
        def dedupe_notifications(notifications, cooldown_seconds):
            if cooldown_seconds < 0:
                raise ValueError("negative cooldown")
            last_sent = {}
            send = []
            suppressed = []
            for item in sorted(notifications, key=lambda value: (value["at"], value["id"])):
                previous = last_sent.get(item["fingerprint"])
                if previous is not None and item["at"] - previous < cooldown_seconds:
                    suppressed.append(item["id"])
                else:
                    send.append(item["id"])
                    last_sent[item["fingerprint"]] = item["at"]
            return {"send": send, "suppressed": suppressed}
      hints: *id002
    check:
      id: python.email.email_08.notification-dedupe-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.email.email_08.notification-dedupe-audit.transfer.behavior.v1.fixture
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
        entry: dedupe_notifications
        cases:
        - id: suppresses-within-cooldown
          arguments:
          - value:
            - id: a
              fingerprint: f
              at: 0
            - id: b
              fingerprint: f
              at: 10
          - value: 30
          expectedReturn:
            send:
            - a
            suppressed:
            - b
        - id: sends-after-cooldown
          arguments:
          - value:
            - id: a
              fingerprint: f
              at: 0
            - id: b
              fingerprint: f
              at: 30
          - value: 30
          expectedReturn:
            send:
            - a
            - b
            suppressed: []
        - id: keeps-distinct-fingerprints
          arguments:
          - value:
            - id: a
              fingerprint: f1
              at: 0
            - id: b
              fingerprint: f2
              at: 1
          - value: 30
          expectedReturn:
            send:
            - a
            - b
            suppressed: []
        - id: rejects-negative-cooldown
          arguments:
          - value: []
          - value: -1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: email_08-script-alert-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - email_08-notification-dedupe-audit-transfer
    title: 스크립트 결과 알림 품질 기준 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 상태 변화·severity·dedupe evidence를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 메일 API 성공과 올바른 수신자·내용·첨부 전달을 분리해 검증하세요.
    - 실제 발송 전 dry run과 idempotency identity, 비밀정보 redaction을 적용하세요.
    exercise:
      prompt: choose_script_alert_policy(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_script_alert_policy(situation):
            raise NotImplementedError
      solution: |
        def choose_script_alert_policy(situation):
            table = {'trigger': {'action': 'notify on failure recovery or material change', 'evidence': 'reason list', 'risk': 'success spam'}, 'severity': {'action': 'map incident meaning', 'evidence': 'severity contract', 'risk': 'everything critical'}, 'dedupe': {'action': 'apply fingerprint cooldown', 'evidence': 'sent and suppressed IDs', 'risk': 'alert flood'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.email.email_08.script-alert-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.email.email_08.script-alert-recall.retrieval.behavior.v1.fixture
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
        entry: choose_script_alert_policy
        cases:
        - id: recalls-trigger
          arguments:
          - value: trigger
          expectedReturn:
            action: notify on failure recovery or material change
            evidence: reason list
            risk: success spam
        - id: recalls-severity
          arguments:
          - value: severity
          expectedReturn:
            action: map incident meaning
            evidence: severity contract
            risk: everything critical
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};