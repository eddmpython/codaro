var e=`meta:\r
  id: email_01\r
  title: 첫 메일 발송\r
  order: 1\r
  category: email\r
  difficulty: ⭐\r
  badge: 입문\r
  packages: []\r
  tags:\r
    - smtplib\r
    - EmailMessage\r
    - dryRun\r
  outcomes:\r
    - automation.email.send\r
  prerequisites:\r
    - automation.email.intro\r
  estimatedMinutes: 40\r
  seo:\r
    title: "smtplib 첫 메일 발송 - EmailMessage + dryRun 안전 패턴"\r
    description: "smtplib.SMTP_SSL과 EmailMessage로 자기 자신에게 메일을 보낸다. dryRun 안전 패턴으로 학습 중 오발송 차단."\r
    keywords:\r
      - smtplib SMTP_SSL\r
      - EmailMessage\r
      - dryRun\r
\r
intro:\r
  direction: "smtplib.SMTP_SSL과 email.message.EmailMessage 두 객체로 첫 메일 발송 함수를 만든다. dryRun 안전 패턴을 처음부터 의무로 적용한다."\r
  benefits:\r
    - "이메일 자동화 전체의 기본 골격이 완성된다. 02-10강이 모두 이 형태에서 확장."\r
    - "EmailMessage 객체 단위 단위 검증 패턴을 익혀 외부 서버 없이 발송 로직 회귀를 잡는다."\r
    - "dryRun 안전 패턴 한 줄로 학습 중 오발송 사고를 사전 차단."\r
  diagram:\r
    steps:\r
      - label: "1. EmailMessage 구성"\r
        elong: "From·To·Subject·본문을 set_content로 채운다."\r
      - label: "2. dryRun 패턴"\r
        elong: "발송 함수는 기본 dryRun=True. 실 발송은 명시 필요."\r
      - label: "3. SMTP_SSL 발송"\r
        elong: "smtplib.SMTP_SSL + login + send_message 3 줄."\r
      - label: "4. assert로 검증"\r
        elong: "EmailMessage 헤더와 콘텐츠를 단위 assert."\r
    runtime:\r
      - label: "환경변수"\r
        detail: "SMTP_USER, SMTP_APP_PASS 두 변수만 있으면 실제 발송 가능. 미설정 시 dryRun 모드로 검증."\r
      - label: "검증"\r
        detail: "외부 서버 없이 EmailMessage 객체 자체에 assert."\r
\r
sections:\r
  - id: step1_email_message\r
    title: "1단계. EmailMessage 만들기"\r
    structuredPrimary: true\r
    subtitle: "EmailMessage, set_content"\r
    goal: "From·To·Subject·본문이 채워진 EmailMessage 객체를 만든다."\r
    why: "실제 발송 전에 메시지 객체를 정확히 만드는 것이 본 트랙의 모든 강의의 출발점입니다."\r
    explanation: |-\r
      EmailMessage()로 객체를 만들고 msg['From']·msg['To']·msg['Subject']에 헤더를 대입한 뒤 msg.set_content(본문, charset='utf-8')로 본문을 채웁니다. 한글 본문은 charset 지정이 안전합니다.\r
    tips:\r
      - "set_content의 charset 인자를 빼면 일부 메일 클라이언트에서 한글이 깨질 수 있습니다."\r
    snippet: |-\r
      from email.message import EmailMessage\r
\r
      msg = EmailMessage()\r
      msg["From"] = "me@example.com"\r
      msg["To"] = "me@example.com"\r
      msg["Subject"] = "Codaro 첫 메일"\r
      msg.set_content("본문입니다. Codaro PDF 트랙 발송 테스트.", charset="utf-8")\r
\r
      msg["From"], msg["To"], msg["Subject"], msg.get_content().strip()\r
    exercise:\r
      prompt: "Subject를 '월간 보고서 발송'으로 바꾸고 본문 끝에 자기 이름을 추가하세요."\r
      starterCode: |-\r
        from email.message import EmailMessage\r
\r
        msg = EmailMessage()\r
        msg["From"] = "me@example.com"\r
        msg["To"] = "me@example.com"\r
        msg["Subject"] = ___\r
        msg.set_content("월간 보고서를 전달합니다. - 김대리", charset="utf-8")\r
        msg["Subject"], msg.get_content().strip()\r
      hints:\r
        - "Subject 문자열 '월간 보고서 발송'."\r
    check:\r
      noError: "헤더 키는 대소문자 구분합니다 - 'Subject'."\r
      resultCheck: "출력 첫 원소가 '월간 보고서 발송'."\r
\r
  - id: step2_dryrun\r
    title: "2단계. dryRun 안전 패턴"\r
    structuredPrimary: true\r
    subtitle: "dryRun=True 기본값, 실 발송은 명시"\r
    goal: "buildMessage 함수와 sendMessage 함수를 분리하고, sendMessage는 기본 dryRun=True."\r
    why: "본 트랙의 핵심 안전 패턴입니다. 마케팅 정주임이 100명 명단으로 dryRun 없이 발송 코드를 돌리면 사고 회수가 불가능합니다. dryRun=True 기본값과 buildMessage/sendMessage 분리가 학습 중 오발송과 실무 사고를 모두 사전 차단하는 같은 패턴이 됩니다."\r
    explanation: |-\r
      buildMessage(to, subject, body) -> EmailMessage가 메시지를 만들고, sendMessage(msg, dryRun=True)가 dryRun이면 메시지 객체만 돌려주고 실 발송은 dryRun=False 명시 시에만 수행합니다.\r
    tips:\r
      - "dryRun=True 결과를 검증해 헤더/본문이 의도대로 구성됐는지 확인한 뒤에만 실 발송을 켜는 워크플로를 권장합니다."\r
    snippet: |-\r
      from email.message import EmailMessage\r
\r
      def buildMessage(toAddr, subject, body):\r
          msg = EmailMessage()\r
          msg["From"] = "me@example.com"\r
          msg["To"] = toAddr\r
          msg["Subject"] = subject\r
          msg.set_content(body, charset="utf-8")\r
          return msg\r
\r
      def sendMessage(msg, dryRun=True):\r
          if dryRun:\r
              return msg\r
          import smtplib, os, ssl\r
          ctx = ssl.create_default_context()\r
          with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as smtp:\r
              smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_APP_PASS"])\r
              smtp.send_message(msg)\r
          return msg\r
\r
      built = buildMessage("me@example.com", "test", "hello")\r
      dryResult = sendMessage(built, dryRun=True)\r
      dryResult["Subject"], dryResult.get_content().strip()\r
    exercise:\r
      prompt: "sendMessage 본문을 직접 완성하세요. dryRun=True이면 (사고 차단을 위해) 즉시 msg를 반환하고, dryRun=False이면 SMTP 연결을 시도해야 한다는 표식으로 RuntimeError('실 발송 경로')를 raise하세요. dryRun=True 호출이 EmailMessage 객체를 돌려주는지 검증합니다."\r
      starterCode: |-\r
        from email.message import EmailMessage\r
\r
        def buildMessage(toAddr, subject, body):\r
            msg = EmailMessage()\r
            msg["From"] = "me@example.com"\r
            msg["To"] = toAddr\r
            msg["Subject"] = subject\r
            msg.set_content(body, charset="utf-8")\r
            return msg\r
\r
        def sendMessage(msg, dryRun=True):\r
            if ___:\r
                return ___\r
            ___\r
\r
        built = buildMessage("a@b.com", "s", "b")\r
        result = sendMessage(built, dryRun=True)\r
        assert isinstance(result, EmailMessage)\r
        try:\r
            sendMessage(built, dryRun=False)\r
            blocked = False\r
        except RuntimeError:\r
            blocked = True\r
        isinstance(result, EmailMessage) and blocked\r
      hints:\r
        - "if 조건은 dryRun, return은 msg, 마지막 줄은 raise RuntimeError('실 발송 경로')."\r
    check:\r
      noError: "두 분기 모두 정의돼야 합니다."\r
      resultCheck: "True 출력."\r
\r
  - id: step3_send\r
    title: "3단계. SMTP_SSL 실 발송 흐름"\r
    structuredPrimary: true\r
    subtitle: "smtplib.SMTP_SSL, login, send_message"\r
    goal: "실 발송 코드를 작성하되 dryRun=True로 호출해 안전하게 흐름만 확인한다."\r
    why: "실제 발송 시도는 환경변수 설정이 필수입니다. 본 강의에서는 코드 작성과 dryRun 검증까지만 학습합니다."\r
    explanation: |-\r
      smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ssl.create_default_context())로 SSL 연결, login(이메일, 앱비밀번호)로 인증, send_message(msg)로 발송. 세 호출이 한 with 블록에 들어갑니다.\r
    tips:\r
      - "Gmail은 465(SSL)/587(STARTTLS) 두 포트를 지원합니다. SSL 직결이 가장 단순해 465 권장."\r
    snippet: |-\r
      import os\r
      import smtplib\r
      import ssl\r
      from email.message import EmailMessage\r
\r
      def sendViaGmail(toAddr, subject, body, dryRun=True):\r
          msg = EmailMessage()\r
          msg["From"] = os.environ.get("SMTP_USER", "me@example.com")\r
          msg["To"] = toAddr\r
          msg["Subject"] = subject\r
          msg.set_content(body, charset="utf-8")\r
          if dryRun:\r
              return msg\r
          ctx = ssl.create_default_context()\r
          with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as smtp:\r
              smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_APP_PASS"])\r
              smtp.send_message(msg)\r
          return msg\r
\r
      dryResult = sendViaGmail("me@example.com", "dry test", "hello dry", dryRun=True)\r
      dryResult["Subject"], dryResult.get_content().strip()\r
    exercise:\r
      prompt: "sendViaGmail을 dryRun=True로 호출해 결과를 받고 To 헤더가 입력값과 같은지 확인하세요."\r
      starterCode: |-\r
        import os\r
        from email.message import EmailMessage\r
\r
        def sendViaGmail(toAddr, subject, body, dryRun=True):\r
            msg = EmailMessage()\r
            msg["From"] = os.environ.get("SMTP_USER", "me@example.com")\r
            msg["To"] = toAddr\r
            msg["Subject"] = subject\r
            msg.set_content(body, charset="utf-8")\r
            if dryRun:\r
                return msg\r
            return msg\r
\r
        result = sendViaGmail("test@example.com", "hi", "body", dryRun=___)\r
        result["To"] == "test@example.com"\r
      hints:\r
        - "dryRun=True 키워드."\r
    check:\r
      noError: "함수가 dryRun 인자를 받아야 합니다."\r
      resultCheck: "True 출력."\r
\r
  - id: validation\r
    title: "4단계. 검증 루프 - EmailMessage 단위 assert"\r
    structuredPrimary: true\r
    subtitle: "헤더 + 본문 통합 assert"\r
    goal: "buildMessage가 만든 객체의 From·To·Subject·본문이 모두 의도와 같은지 한 셀에서 검증한다."\r
    why: "외부 서버 없이도 발송 로직의 정확성을 단위 검증으로 보장할 수 있습니다."\r
    explanation: |-\r
      EmailMessage의 헤더 4개와 본문을 한 묶음 assert로 확인. 본 트랙의 핵심 검증 패턴.\r
    tips:\r
      - "본문을 strip()으로 비교하면 charset 처리 과정에서 추가된 줄바꿈에 흔들리지 않습니다."\r
    snippet: |-\r
      from email.message import EmailMessage\r
\r
      def buildMessage(toAddr, subject, body, fromAddr="me@example.com"):\r
          msg = EmailMessage()\r
          msg["From"] = fromAddr\r
          msg["To"] = toAddr\r
          msg["Subject"] = subject\r
          msg.set_content(body, charset="utf-8")\r
          return msg\r
\r
      built = buildMessage("partner@example.com", "월간 보고서", "첨부 확인 부탁드립니다.", "me@example.com")\r
      assert built["From"] == "me@example.com"\r
      assert built["To"] == "partner@example.com"\r
      assert built["Subject"] == "월간 보고서"\r
      assert "첨부" in built.get_content()\r
      built["Subject"]\r
    exercise:\r
      prompt: "Subject를 '주간 보고서'로, 본문에 '검토 부탁드립니다'를 포함하도록 만들고 검증을 통과시키세요."\r
      starterCode: |-\r
        from email.message import EmailMessage\r
\r
        def buildMessage(toAddr, subject, body, fromAddr="me@example.com"):\r
            msg = EmailMessage()\r
            msg["From"] = fromAddr\r
            msg["To"] = toAddr\r
            msg["Subject"] = subject\r
            msg.set_content(body, charset="utf-8")\r
            return msg\r
\r
        built = buildMessage("partner@example.com", ___, ___)\r
        assert built["Subject"] == "주간 보고서"\r
        assert "검토" in built.get_content()\r
        built["Subject"]\r
      hints:\r
        - "두 문자열: '주간 보고서', '검토 부탁드립니다'."\r
    check:\r
      noError: "set_content 본문은 문자열."\r
      resultCheck: "출력 '주간 보고서'."\r
\r
  - id: misconception\r
    title: "5단계. 흔한 오개념 차단"\r
    subtitle: "코드에 평문 비밀번호, 호스트 오타"\r
    goal: "두 가지 흔한 함정을 차단한다."\r
    why: "평문 비밀번호 커밋은 보안 사고, smtp 호스트 오타는 디버깅 시간 낭비입니다."\r
    explanation: |-\r
      함정1: 코드에 비밀번호를 직접 적으면 git 커밋 시 영구 노출. 항상 os.environ. 함정2: 'smtp.gmail.com' 오타 (smtps, gmail.smtp 같은 오류)는 connect 단계에서 실패. 호스트 상수는 모듈 상단에.\r
    tips:\r
      - "환경변수 미설정 시 KeyError가 나야 함. os.environ.get으로 폴백을 두면 빈 문자열로 잘못 발송 시도할 수 있어 위험."\r
    snippet: |-\r
      import os\r
\r
      SMTP_HOST = "smtp.gmail.com"\r
      SMTP_PORT = 465\r
\r
      def getCredentials():\r
          user = os.environ.get("SMTP_USER")\r
          appPass = os.environ.get("SMTP_APP_PASS")\r
          if not user or not appPass:\r
              raise EnvironmentError("환경변수 SMTP_USER/SMTP_APP_PASS 미설정")\r
          return user, appPass\r
\r
      try:\r
          user, appPass = getCredentials()\r
          state = "ready"\r
      except EnvironmentError:\r
          state = "missing env vars"\r
      state\r
    exercise:\r
      prompt: "SMTP_HOST 상수를 'smtp.naver.com'으로 바꿔 Naver 발송 준비를 하세요."\r
      starterCode: |-\r
        SMTP_HOST = ___\r
        SMTP_PORT = 465\r
        SMTP_HOST.endswith("naver.com")\r
      hints:\r
        - "문자열 'smtp.naver.com'."\r
    check:\r
      noError: "상수는 문자열."\r
      resultCheck: "True 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션 2개"\r
    subtitle: "메시지 빌더와 안전한 발송 래퍼"\r
    goal: "buildMessage와 sendMessage를 직접 작성해 dryRun 패턴이 일관되는지 확인한다."\r
    why: "두 함수가 본 트랙의 모든 강의에서 재사용되는 핵심 빌딩 블록입니다."\r
    explanation: |-\r
      미션1은 다양한 인자(여러 수신자·CC·BCC 포함)를 받는 buildMessage 확장, 미션2는 dryRun에서 실제 발송 결정 로직을 분리한 sendMessage 래퍼입니다.\r
    tips:\r
      - "변수 prefix: bld*(미션1), snd*(미션2)."\r
    snippet: |-\r
      import os\r
      from email.message import EmailMessage\r
    exercise:\r
      prompt: "두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "미션1: buildMessage(toAddr, subject, body, cc=None, bcc=None) -> EmailMessage"\r
        - "미션2: sendMessage(msg, dryRun=True, host='smtp.gmail.com', port=465) -> EmailMessage"\r
    check:\r
      noError: "함수 정의 + dryRun 검증."\r
      resultCheck: "CC/BCC 헤더가 정확히 세팅돼야 합니다."\r
    blocks:\r
      - type: tip\r
        content: "CC와 BCC는 헤더 키가 'Cc', 'Bcc'입니다. 대소문자 주의."\r
      - type: expansion\r
        title: "미션1: buildMessage 확장"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from email.message import EmailMessage\r
\r
              def buildMessage(toAddr, subject, body, cc=None, bcc=None, fromAddr="me@example.com"):\r
                  msg = EmailMessage()\r
                  msg["From"] = fromAddr\r
                  msg["To"] = toAddr\r
                  if cc:\r
                      msg["Cc"] = ", ".join(cc) if isinstance(cc, list) else cc\r
                  if bcc:\r
                      msg["Bcc"] = ", ".join(bcc) if isinstance(bcc, list) else bcc\r
                  msg["Subject"] = subject\r
                  msg.set_content(body, charset="utf-8")\r
                  return msg\r
\r
              built = buildMessage(\r
                  "partner@example.com",\r
                  "월간 보고서",\r
                  "검토 부탁드립니다",\r
                  cc=["lead@example.com", "manager@example.com"],\r
                  bcc="auditor@example.com",\r
              )\r
              assert built["Cc"] == "lead@example.com, manager@example.com"\r
              assert built["Bcc"] == "auditor@example.com"\r
              built["Cc"], built["Bcc"]\r
      - type: expansion\r
        title: "미션2: sendMessage 래퍼"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import os\r
              import smtplib\r
              import ssl\r
              from email.message import EmailMessage\r
\r
              def sendMessage(msg, dryRun=True, host="smtp.gmail.com", port=465):\r
                  if dryRun:\r
                      return msg\r
                  user = os.environ["SMTP_USER"]\r
                  appPass = os.environ["SMTP_APP_PASS"]\r
                  ctx = ssl.create_default_context()\r
                  with smtplib.SMTP_SSL(host, port, context=ctx) as smtp:\r
                      smtp.login(user, appPass)\r
                      smtp.send_message(msg)\r
                  return msg\r
\r
              demo = EmailMessage()\r
              demo["From"] = "me@example.com"\r
              demo["To"] = "me@example.com"\r
              demo["Subject"] = "dry test"\r
              demo.set_content("body", charset="utf-8")\r
\r
              result = sendMessage(demo, dryRun=True)\r
              assert isinstance(result, EmailMessage)\r
              assert result["Subject"] == "dry test"\r
              result["Subject"]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "buildMessage에 Reply-To 헤더 추가 (회신 주소 분리)"\r
          - "Naver 메일 SMTP 호스트로 전환 (smtp.naver.com)"\r
          - "회사 사내 SMTP 릴레이 (인증 없이) 패턴"\r
          - "발송 결과를 로그 파일에 append (성공/실패 시간 기록)"\r
          - "dryRun=True 결과를 .eml 파일로 저장해 검토 후 발송"\r
`;export{e as default};