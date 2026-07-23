var e=`meta:\r
  id: email_08\r
  title: 스크립트 결과 알림\r
  order: 8\r
  category: email\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages: []\r
  tags:\r
    - try/except\r
    - 알림 봇\r
    - 스택트레이스\r
  outcomes:\r
    - automation.email.notify\r
  prerequisites:\r
    - automation.email.send\r
  estimatedMinutes: 45\r
  seo:\r
    title: "스크립트 실패 → SMTP 알림 봇 패턴"\r
    description: "야간 배치 스크립트가 실패하면 즉시 알림 메일을 받는다. 새벽 30분 대응 지연이 즉시 통보로 줄어든다."\r
    keywords:\r
      - 스크립트 실패 알림\r
      - SMTP 알림 봇\r
      - 스택트레이스 첨부\r
\r
intro:\r
  direction: "야간 배치 스크립트의 예외를 잡아 즉시 알림 메일을 보낸다. 평균 30분 대응 지연이 즉시 통보로 줄어든다."\r
  benefits:\r
    - "DevOps 박과장의 야간 장애 대응 지연을 즉시 통보로 줄인다."\r
    - "try/except + sendNotification 패턴이 어떤 스크립트에도 한 줄 추가로 적용."\r
    - "스택트레이스를 본문 또는 첨부로 함께 전송해 디버깅 즉시 가능."\r
  diagram:\r
    steps:\r
      - label: "1. 스크립트 본체"\r
        detail: "원래 하던 일을 함수로 캡슐화."\r
      - label: "2. 예외 캐치"\r
        detail: "try: ... except Exception as exc: sendNotification(exc)."\r
      - label: "3. 스택트레이스 전송"\r
        detail: "traceback.format_exc()로 전체 스택을 본문 또는 첨부."\r
      - label: "4. 데코레이터화"\r
        detail: "@notifyOnFailure 데코레이터로 한 줄 추가만으로 적용."\r
    runtime:\r
      - label: "표준 라이브러리"\r
        detail: "traceback + smtplib + email."\r
      - label: "검증"\r
        detail: "예외 발생 시 알림 함수 호출 여부와 본문 내용 단위 assert."\r
\r
sections:\r
  - id: step1_notify\r
    title: "1단계. 알림 함수 정의"\r
    structuredPrimary: true\r
    subtitle: "예외 정보 → EmailMessage"\r
    goal: "예외 객체와 스크립트 이름을 받아 알림 메시지를 만드는 함수를 작성한다."\r
    why: "본 강의의 핵심 함수입니다. 어떤 스크립트에서도 같은 함수를 호출해 알림 발송."\r
    explanation: |-\r
      buildNotification(scriptName, exc, traceback)이 Subject에 '[FAIL] {script}', 본문에 예외 메시지 + 스택트레이스를 담은 EmailMessage 반환.\r
    tips:\r
      - "예외 메시지가 비어있을 수도 있으니 type(exc).__name__로 클래스명을 함께 표시."\r
    snippet: |-\r
      import traceback\r
      from email.message import EmailMessage\r
\r
      def buildNotification(scriptName, exc, tb=None, toAddr="ops@example.com"):\r
          msg = EmailMessage()\r
          msg["From"] = "alerts@example.com"\r
          msg["To"] = toAddr\r
          msg["Subject"] = f"[FAIL] {scriptName}"\r
          body = (\r
              f"Script: {scriptName}\\n"\r
              f"Error type: {type(exc).__name__}\\n"\r
              f"Error message: {exc}\\n\\n"\r
              f"Traceback:\\n{tb or 'no traceback'}"\r
          )\r
          msg.set_content(body, charset="utf-8")\r
          return msg\r
\r
      try:\r
          raise ValueError("DB connection failed")\r
      except Exception as exc:\r
          alert = buildNotification("nightly_etl", exc, traceback.format_exc())\r
      alert["Subject"], "DB connection" in alert.get_content()\r
    exercise:\r
      prompt: "buildNotification을 직접 작성하세요. Subject는 심각도(severity)에 따라 '[CRITICAL] script' 또는 '[WARN] script' 형식으로, 본문에는 예외 클래스명/메시지/traceback이 모두 들어가야 합니다. severity='critical' 호출 결과로 검증합니다."\r
      starterCode: |-\r
        import traceback\r
        from email.message import EmailMessage\r
\r
        def buildNotification(scriptName, exc, tb=None, severity="critical", toAddr="ops@example.com"):\r
            msg = EmailMessage()\r
            msg["From"] = "alerts@example.com"\r
            msg["To"] = toAddr\r
            prefix = ___\r
            msg["Subject"] = f"{prefix} {scriptName}"\r
            body = ___\r
            msg.set_content(body, charset="utf-8")\r
            return msg\r
\r
        try:\r
            raise ValueError("DB down")\r
        except Exception as exc:\r
            alert = buildNotification("etl", exc, traceback.format_exc(), severity="critical")\r
        assert alert["Subject"].startswith("[CRITICAL]")\r
        assert "ValueError" in alert.get_content()\r
        assert "DB down" in alert.get_content()\r
        alert["Subject"]\r
      hints:\r
        - "prefix: '[CRITICAL]' if severity == 'critical' else '[WARN]'. body: f'{type(exc).__name__}: {exc}\\\\n\\\\n{tb}'."\r
    check:\r
      noError: "f-string 안의 변수 정의."\r
      resultCheck: "True 출력."\r
\r
  - id: step2_decorator\r
    title: "2단계. notifyOnFailure 데코레이터"\r
    structuredPrimary: true\r
    subtitle: "한 줄 추가로 어디든 적용"\r
    goal: "함수에 @notifyOnFailure를 붙이면 예외 발생 시 자동 알림."\r
    why: "기존 스크립트 코드를 거의 안 건드리고 알림을 추가하는 방법입니다."\r
    explanation: |-\r
      notifyOnFailure(toAddr) 데코레이터 팩토리. 내부 wrapper가 try/except로 함수를 감싸고 예외 발생 시 buildNotification → sendMessage 흐름.\r
    tips:\r
      - "데코레이터에서 발생한 예외를 다시 raise해서 호출자도 실패를 인지하도록 하는 게 안전."\r
    snippet: |-\r
      import traceback\r
      from email.message import EmailMessage\r
      from functools import wraps\r
\r
      def buildNotification(scriptName, exc, tb, toAddr):\r
          msg = EmailMessage()\r
          msg["From"] = "alerts@example.com"\r
          msg["To"] = toAddr\r
          msg["Subject"] = f"[FAIL] {scriptName}"\r
          msg.set_content(f"{type(exc).__name__}: {exc}\\n\\n{tb}", charset="utf-8")\r
          return msg\r
\r
      def notifyOnFailure(toAddr, dryRun=True):\r
          def decorator(func):\r
              @wraps(func)\r
              def wrapper(*args, **kwargs):\r
                  try:\r
                      return func(*args, **kwargs)\r
                  except Exception as exc:\r
                      alert = buildNotification(func.__name__, exc, traceback.format_exc(), toAddr)\r
                      if not dryRun:\r
                          pass\r
                      raise\r
              return wrapper\r
          return decorator\r
\r
      collectedMessages = []\r
      def captureMessage(msg):\r
          collectedMessages.append(msg)\r
\r
      @notifyOnFailure("ops@example.com", dryRun=True)\r
      def riskyJob(value):\r
          if value < 0:\r
              raise ValueError("negative input")\r
          return value * 2\r
\r
      try:\r
          riskyJob(-1)\r
      except ValueError:\r
          pass\r
\r
      "decorator ready"\r
    exercise:\r
      prompt: "데코레이터 인자 toAddr를 'devops@example.com'으로 바꾸세요."\r
      starterCode: |-\r
        from functools import wraps\r
\r
        def notifyOnFailure(toAddr, dryRun=True):\r
            def decorator(func):\r
                @wraps(func)\r
                def wrapper(*args, **kwargs):\r
                    try:\r
                        return func(*args, **kwargs)\r
                    except Exception:\r
                        raise\r
                return wrapper\r
            return decorator\r
\r
        @notifyOnFailure(___, dryRun=True)\r
        def job():\r
            return 1\r
\r
        job()\r
      hints:\r
        - "문자열 'devops@example.com'."\r
    check:\r
      noError: "toAddr는 문자열."\r
      resultCheck: "출력 1."\r
\r
  - id: validation\r
    title: "3단계. 검증 루프 - 예외 시 알림 메시지 검증"\r
    structuredPrimary: true\r
    subtitle: "알림 호출 + 본문 내용 단위 assert"\r
    goal: "예외가 발생했을 때 buildNotification이 호출되고 본문에 예외 정보가 들어가는지 검증한다."\r
    why: "알림 누락은 운영 장애의 큰 원인입니다. 데코레이터가 알림을 정확히 호출하는지 단위 검증이 본 강의의 핵심."\r
    explanation: |-\r
      알림 함수를 모킹해서 호출 여부와 본문을 직접 확인. 외부 SMTP 의존 0.\r
    tips:\r
      - "테스트에서는 알림 함수를 callback으로 주입하면 호출을 쉽게 추적할 수 있습니다."\r
    snippet: |-\r
      import traceback\r
      from email.message import EmailMessage\r
      from functools import wraps\r
\r
      def buildNotification(scriptName, exc, tb, toAddr):\r
          msg = EmailMessage()\r
          msg["From"] = "alerts@example.com"\r
          msg["To"] = toAddr\r
          msg["Subject"] = f"[FAIL] {scriptName}"\r
          msg.set_content(f"{type(exc).__name__}: {exc}\\n{tb}", charset="utf-8")\r
          return msg\r
\r
      collected = []\r
      def captureMessage(msg):\r
          collected.append(msg)\r
\r
      def notifyOnFailure(toAddr, onAlert=None):\r
          def decorator(func):\r
              @wraps(func)\r
              def wrapper(*args, **kwargs):\r
                  try:\r
                      return func(*args, **kwargs)\r
                  except Exception as exc:\r
                      alert = buildNotification(func.__name__, exc, traceback.format_exc(), toAddr)\r
                      if onAlert:\r
                          onAlert(alert)\r
                      raise\r
              return wrapper\r
          return decorator\r
\r
      @notifyOnFailure("ops@example.com", onAlert=captureMessage)\r
      def job(value):\r
          if value < 0:\r
              raise ValueError("negative")\r
          return value\r
\r
      try:\r
          job(-5)\r
      except ValueError:\r
          pass\r
\r
      assert len(collected) == 1\r
      assert collected[0]["Subject"] == "[FAIL] job"\r
      assert "negative" in collected[0].get_content()\r
      collected[0]["Subject"]\r
    exercise:\r
      prompt: "job(-10)에서 예외 메시지 'too negative'를 발생시키고 본문에 포함되는지 확인하세요."\r
      starterCode: |-\r
        import traceback\r
        from email.message import EmailMessage\r
        from functools import wraps\r
\r
        def buildNotification(scriptName, exc, tb, toAddr):\r
            msg = EmailMessage()\r
            msg["From"] = "alerts@example.com"\r
            msg["To"] = toAddr\r
            msg["Subject"] = f"[FAIL] {scriptName}"\r
            msg.set_content(f"{exc}\\n{tb}", charset="utf-8")\r
            return msg\r
\r
        collected = []\r
        def captureMessage(msg):\r
            collected.append(msg)\r
\r
        def notifyOnFailure(toAddr, onAlert=None):\r
            def decorator(func):\r
                @wraps(func)\r
                def wrapper(*args, **kwargs):\r
                    try:\r
                        return func(*args, **kwargs)\r
                    except Exception as exc:\r
                        alert = buildNotification(func.__name__, exc, traceback.format_exc(), toAddr)\r
                        if onAlert:\r
                            onAlert(alert)\r
                        raise\r
                return wrapper\r
            return decorator\r
\r
        @notifyOnFailure("ops@example.com", onAlert=captureMessage)\r
        def job(value):\r
            raise ValueError(___)\r
\r
        try:\r
            job(-10)\r
        except ValueError:\r
            pass\r
\r
        "too negative" in collected[0].get_content()\r
      hints:\r
        - "문자열 'too negative'."\r
    check:\r
      noError: "raise는 클래스 인스턴스."\r
      resultCheck: "True 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "야간 배치 알림 래퍼"\r
    goal: "기존 함수에 알림 데코레이터를 적용해 예외 시 자동 알림 흐름을 완성한다."\r
    why: "DevOps 박과장이 야간 ETL 실패를 다음 날 아침에야 발견하던 사이클이 즉시 알림으로 바뀝니다. 데코레이터 한 줄 추가로 어떤 스크립트든 알림 흐름이 붙고, 실패 본문에 traceback이 함께 도착해 새벽 호출 없이도 원인을 즉시 파악합니다. 본 패턴은 10강 주간 발송기에서 실패 시 fallback 알림으로 그대로 재사용됩니다."\r
    explanation: |-\r
      미션: 야간 ETL 함수를 데코레이터로 감싸고 예외 시 알림 메시지가 만들어지는지 검증.\r
    tips:\r
      - "실 발송은 sendMessage(alert, dryRun=False)로 전환만 하면 됩니다."\r
    snippet: |-\r
      import traceback\r
      from email.message import EmailMessage\r
      from functools import wraps\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "@notifyOnFailure로 ETL 함수 감싸고 예외 시 알림 호출 검증."\r
    check:\r
      noError: "데코레이터 적용."\r
      resultCheck: "알림 본문에 예외 메시지 포함."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 야간 ETL 알림"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import traceback\r
              from email.message import EmailMessage\r
              from functools import wraps\r
\r
              def buildNotification(scriptName, exc, tb, toAddr):\r
                  msg = EmailMessage()\r
                  msg["From"] = "alerts@example.com"\r
                  msg["To"] = toAddr\r
                  msg["Subject"] = f"[FAIL] {scriptName}"\r
                  msg.set_content(f"{type(exc).__name__}: {exc}\\n\\n{tb}", charset="utf-8")\r
                  return msg\r
\r
              alertsLog = []\r
              def captureAlert(msg):\r
                  alertsLog.append(msg)\r
\r
              def notifyOnFailure(toAddr, onAlert=None):\r
                  def decorator(func):\r
                      @wraps(func)\r
                      def wrapper(*args, **kwargs):\r
                          try:\r
                              return func(*args, **kwargs)\r
                          except Exception as exc:\r
                              alert = buildNotification(func.__name__, exc, traceback.format_exc(), toAddr)\r
                              if onAlert:\r
                                  onAlert(alert)\r
                              raise\r
                      return wrapper\r
                  return decorator\r
\r
              @notifyOnFailure("devops@example.com", onAlert=captureAlert)\r
              def nightlyEtl(source):\r
                  if source == "broken":\r
                      raise ConnectionError("DB unreachable")\r
                  return "ok"\r
\r
              assert nightlyEtl("good") == "ok"\r
              try:\r
                  nightlyEtl("broken")\r
              except ConnectionError:\r
                  pass\r
\r
              assert len(alertsLog) == 1\r
              assert "DB unreachable" in alertsLog[0].get_content()\r
              assert "[FAIL] nightlyEtl" == alertsLog[0]["Subject"]\r
              alertsLog[0]["Subject"]\r
      - type: expansion\r
        title: "미션2: 로그 첨부 + 재시도 게이트"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import traceback\r
              from email.message import EmailMessage\r
              from functools import wraps\r
\r
              def buildLogAlert(scriptName, exc, tb, logLines, toAddr):\r
                  msg = EmailMessage()\r
                  msg["From"] = "alerts@example.com"\r
                  msg["To"] = toAddr\r
                  msg["Subject"] = f"[FAIL] {scriptName}"\r
                  msg.set_content(f"{type(exc).__name__}: {exc}\\n\\n{tb}", charset="utf-8")\r
                  logBlob = "\\n".join(logLines).encode("utf-8")\r
                  msg.add_attachment(logBlob, maintype="text", subtype="plain", filename=f"{scriptName}.log")\r
                  return msg\r
\r
              def retryWithAlert(maxAttempts, toAddr, onAlert):\r
                  def decorator(func):\r
                      @wraps(func)\r
                      def wrapper(*args, **kwargs):\r
                          logLines = []\r
                          for attempt in range(1, maxAttempts + 1):\r
                              try:\r
                                  logLines.append(f"attempt {attempt}: start")\r
                                  result = func(*args, **kwargs)\r
                                  logLines.append(f"attempt {attempt}: ok")\r
                                  return result\r
                              except Exception as exc:\r
                                  logLines.append(f"attempt {attempt}: {type(exc).__name__}: {exc}")\r
                                  if attempt == maxAttempts:\r
                                      alert = buildLogAlert(func.__name__, exc, traceback.format_exc(), logLines, toAddr)\r
                                      onAlert(alert)\r
                                      raise\r
                      return wrapper\r
                  return decorator\r
\r
              captured = []\r
              attemptsSeen = []\r
\r
              @retryWithAlert(maxAttempts=3, toAddr="devops@example.com", onAlert=captured.append)\r
              def flakyJob():\r
                  attemptsSeen.append(1)\r
                  raise ConnectionError("upstream timeout")\r
\r
              try:\r
                  flakyJob()\r
              except ConnectionError:\r
                  pass\r
\r
              assert len(attemptsSeen) == 3\r
              assert len(captured) == 1\r
              attachments = list(captured[0].iter_attachments())\r
              assert attachments[0].get_filename() == "flakyJob.log"\r
              logText = attachments[0].get_payload(decode=True).decode("utf-8")\r
              assert "attempt 3" in logText\r
              captured[0]["Subject"], attachments[0].get_filename()\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "성공 시에도 요약 알림 (매일 정상 동작 확인)"\r
          - "Slack 웹훅과 동시 전송 (SMTP + HTTP POST)"\r
          - "심각도별 다른 수신자 (Critical → 팀장, Warning → 팀)"\r
          - "재시도 3회 실패 시에만 알림 (false positive 줄이기)"\r
          - "10강 결합 - 주간 발송기 결과에 본 알림 패턴 결합"\r
`;export{e as default};