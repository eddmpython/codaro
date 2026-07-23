var e=`meta:\r
  id: email_03\r
  title: 다수 수신자와 개인화\r
  order: 3\r
  category: email\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  packages: []\r
  tags:\r
    - To\r
    - CC\r
    - BCC\r
    - Template\r
    - mail merge\r
  outcomes:\r
    - automation.email.bulk\r
  prerequisites:\r
    - automation.email.send\r
  estimatedMinutes: 50\r
  seo:\r
    title: "다수 수신자와 개인화 - CSV → 100명 안내 메일"\r
    description: "string.Template로 본문을 치환해 CSV 명단에서 100명에게 개인화 메일을 일괄 발송. dryRun으로 안전 검증."\r
    keywords:\r
      - 메일 mail merge\r
      - string.Template\r
      - 다수 발송\r
\r
intro:\r
  direction: "CSV 명단을 받아 string.Template로 본문을 치환하고, 100명에게 개인화된 메일을 안전하게 발송한다. 60분 손작업이 5초가 된다."\r
  benefits:\r
    - "마케팅 정주임의 100명 개인화 발송 60분을 5초로 줄인다."\r
    - "string.Template는 표준 라이브러리. Jinja2 같은 외부 의존이 필요 없다."\r
    - "dryRun으로 100건 본문을 모두 미리 검증한 뒤 실 발송 결정."\r
  diagram:\r
    steps:\r
      - label: "1. CSV 명단 로드"\r
        detail: "csv.DictReader로 (name, email, role) 같은 dict 리스트로 변환."\r
      - label: "2. Template 본문"\r
        detail: "string.Template로 $name, $role 자리표시자 치환."\r
      - label: "3. 개인화 발송"\r
        detail: "각 수신자별 buildMessage → sendMessage."\r
      - label: "4. dryRun 검증"\r
        detail: "전 명단 메시지 객체를 먼저 생성·검증, 실 발송은 마지막."\r
    runtime:\r
      - label: "표준 라이브러리만"\r
        detail: "csv, string, email, smtplib - 모두 표준."\r
      - label: "검증"\r
        detail: "각 메시지의 To와 본문 치환 결과를 assert."\r
\r
sections:\r
  - id: step1_csv_load\r
    title: "1단계. CSV 명단 로드"\r
    structuredPrimary: true\r
    subtitle: "csv.DictReader → dict 리스트"\r
    goal: "name, email, role 컬럼이 있는 CSV를 dict 리스트로 읽는다."\r
    why: "발송 대상 명단은 CSV·엑셀이 표준입니다. DictReader로 한 줄에 한 명씩 깨끗한 dict로 받아오는 패턴이 시작점입니다."\r
    explanation: |-\r
      csv.DictReader는 첫 행을 헤더로 사용해 각 행을 dict로 돌려줍니다. with open(..., encoding='utf-8') 컨텍스트에서 list comprehension으로 dict 리스트로 변환합니다.\r
    tips:\r
      - "CSV 인코딩이 EUC-KR이면 UnicodeDecodeError. 명시적으로 encoding='utf-8' 또는 'euc-kr' 지정 필수."\r
    snippet: |-\r
      import csv\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
\r
      workdir = TemporaryDirectory()\r
      csvPath = Path(workdir.name) / "list.csv"\r
      csvPath.write_text(\r
          "name,email,role\\n"\r
          "김대리,kim@example.com,대리\\n"\r
          "박과장,park@example.com,과장\\n"\r
          "이주임,lee@example.com,주임\\n",\r
          encoding="utf-8",\r
      )\r
\r
      with open(csvPath, "r", encoding="utf-8") as f:\r
          recipients = list(csv.DictReader(f))\r
      len(recipients), recipients[0]\r
    exercise:\r
      prompt: "CSV에 한 명 추가(윤대리, yoon@example.com, 대리)하고 길이가 4인지 확인하세요."\r
      starterCode: |-\r
        import csv\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
\r
        workdir = TemporaryDirectory()\r
        csvPath = Path(workdir.name) / "list.csv"\r
        csvPath.write_text(\r
            "name,email,role\\n"\r
            "김대리,kim@example.com,대리\\n"\r
            "박과장,park@example.com,과장\\n"\r
            "이주임,lee@example.com,주임\\n"\r
            ___,\r
            encoding="utf-8",\r
        )\r
        with open(csvPath, "r", encoding="utf-8") as f:\r
            recipients = list(csv.DictReader(f))\r
        len(recipients)\r
      hints:\r
        - "CSV 한 줄. 예: '윤대리,yoon@example.com,대리\\\\n'."\r
    check:\r
      noError: "CSV 마지막에 줄바꿈."\r
      resultCheck: "출력 4."\r
\r
  - id: step2_template\r
    title: "2단계. string.Template로 본문 개인화"\r
    structuredPrimary: true\r
    subtitle: "$name, $role 자리표시자 치환"\r
    goal: "$name 님 안녕하세요 패턴의 본문을 한 수신자 데이터로 치환한다."\r
    why: "f-string은 미리 데이터가 있어야 동작합니다. Template은 본문 템플릿을 한 번 정의하고 데이터를 나중에 주입하는 mail merge 패턴에 적합합니다."\r
    explanation: |-\r
      string.Template('$name 님, $role 안내드립니다.').substitute(name='김', role='월간')처럼 호출하면 자리표시자가 치환된 문자열이 나옵니다. substitute는 missing key가 있으면 KeyError, safe_substitute는 그대로 둡니다.\r
    tips:\r
      - "f-string과 달리 $자리표시자는 본문 안에 있어도 그 자리에서 평가되지 않아 안전합니다."\r
    snippet: |-\r
      from string import Template\r
\r
      bodyTemplate = Template(\r
          "$name 님 안녕하세요.\\n\\n"\r
          "$role 자리에 보고드릴 $topic 자료를 첨부합니다.\\n\\n"\r
          "감사합니다."\r
      )\r
\r
      body = bodyTemplate.substitute(name="김대리", role="대리", topic="월간 보고서")\r
      body\r
    exercise:\r
      prompt: "renderBody(recipient) 함수를 직접 작성하세요. dict 하나를 받아 위 Template을 safe_substitute로 채워 문자열을 반환해야 합니다. (safe_substitute는 키가 없으면 자리표시자를 그대로 두므로 부분 데이터에도 안전합니다.) 박과장 데이터로 호출해 첫 줄이 '박과장 님 안녕하세요.'인지 검증합니다."\r
      starterCode: |-\r
        from string import Template\r
\r
        bodyTemplate = Template(\r
            "$name 님 안녕하세요.\\n\\n"\r
            "$role 자리에 보고드릴 $topic 자료를 첨부합니다."\r
        )\r
\r
        def renderBody(recipient):\r
            ___\r
\r
        body = renderBody({"name": "박과장", "role": "과장", "topic": "주간 보고서"})\r
        body.splitlines()[0]\r
      hints:\r
        - "return bodyTemplate.safe_substitute(**recipient)."\r
    check:\r
      noError: "substitute 인자는 키워드."\r
      resultCheck: "출력 '박과장 님 안녕하세요.'."\r
\r
  - id: step3_bulk_build\r
    title: "3단계. 명단 전체에 개인화 메시지 생성"\r
    structuredPrimary: true\r
    subtitle: "CSV + Template + buildMessage 결합"\r
    goal: "CSV의 모든 수신자에 대해 개인화된 EmailMessage 리스트를 만든다."\r
    why: "100명 발송의 진짜 가치는 일괄 생성에 있습니다. 한 함수 호출로 100개 메시지가 메모리에 만들어집니다."\r
    explanation: |-\r
      buildPersonalizedMessages(recipients, subject, bodyTemplate)이 dict 리스트 + Template을 받아 EmailMessage 리스트를 돌려줍니다. dryRun으로 결과를 먼저 검증한 뒤 실 발송.\r
    tips:\r
      - "1000건 이상은 메모리 부담이 있습니다. 그 경우 generator로 yield하는 패턴으로 변경."\r
    snippet: |-\r
      import csv\r
      from pathlib import Path\r
      from string import Template\r
      from tempfile import TemporaryDirectory\r
      from email.message import EmailMessage\r
\r
      def buildPersonalizedMessages(recipients, subject, bodyTemplate, fromAddr="me@example.com"):\r
          messages = []\r
          for recipient in recipients:\r
              msg = EmailMessage()\r
              msg["From"] = fromAddr\r
              msg["To"] = recipient["email"]\r
              msg["Subject"] = subject\r
              msg.set_content(bodyTemplate.substitute(**recipient), charset="utf-8")\r
              messages.append(msg)\r
          return messages\r
\r
      workdir = TemporaryDirectory()\r
      csvPath = Path(workdir.name) / "list.csv"\r
      csvPath.write_text(\r
          "name,email,role\\n"\r
          "김대리,kim@example.com,대리\\n"\r
          "박과장,park@example.com,과장\\n",\r
          encoding="utf-8",\r
      )\r
      with open(csvPath, "r", encoding="utf-8") as f:\r
          recipients = list(csv.DictReader(f))\r
\r
      template = Template("$name 님 ($role), 보고드립니다.")\r
      messages = buildPersonalizedMessages(recipients, "월간 보고", template)\r
\r
      [(m["To"], m.get_content().strip()) for m in messages]\r
    exercise:\r
      prompt: "CSV에 한 명(이주임) 추가하고 messages 길이가 3인지 확인하세요."\r
      starterCode: |-\r
        import csv\r
        from pathlib import Path\r
        from string import Template\r
        from tempfile import TemporaryDirectory\r
        from email.message import EmailMessage\r
\r
        def buildPersonalizedMessages(recipients, subject, bodyTemplate, fromAddr="me@example.com"):\r
            messages = []\r
            for recipient in recipients:\r
                msg = EmailMessage()\r
                msg["From"] = fromAddr\r
                msg["To"] = recipient["email"]\r
                msg["Subject"] = subject\r
                msg.set_content(bodyTemplate.substitute(**recipient), charset="utf-8")\r
                messages.append(msg)\r
            return messages\r
\r
        workdir = TemporaryDirectory()\r
        csvPath = Path(workdir.name) / "list.csv"\r
        csvPath.write_text(\r
            "name,email,role\\n"\r
            "김대리,kim@example.com,대리\\n"\r
            "박과장,park@example.com,과장\\n"\r
            ___,\r
            encoding="utf-8",\r
        )\r
        with open(csvPath, "r", encoding="utf-8") as f:\r
            recipients = list(csv.DictReader(f))\r
        template = Template("$name 님 ($role) 안내")\r
        len(buildPersonalizedMessages(recipients, "s", template))\r
      hints:\r
        - "한 줄 추가. '이주임,lee@example.com,주임\\\\n'."\r
    check:\r
      noError: "CSV 마지막 줄바꿈."\r
      resultCheck: "출력 3."\r
\r
  - id: validation\r
    title: "4단계. 검증 루프 - 100건 본문 자동 검증"\r
    structuredPrimary: true\r
    subtitle: "모든 메시지 To + 본문 키워드 일괄 assert"\r
    goal: "buildPersonalizedMessages 결과의 각 메시지가 의도한 수신자와 개인화 본문을 가지는지 한 셀에서 검증한다."\r
    why: "100건 발송 전 dryRun 검증이 본 트랙의 안전 원칙입니다. 본문 치환이 의도대로 됐는지 코드가 확인."\r
    explanation: |-\r
      각 메시지의 To 헤더가 recipient['email']과 같고, 본문에 recipient['name']이 포함됨을 한 묶음 assert로 확인합니다.\r
    tips:\r
      - "수신자 이름에 자리표시자에 없는 단어가 들어가도 같은 패턴으로 검증 가능."\r
    snippet: |-\r
      import csv\r
      from pathlib import Path\r
      from string import Template\r
      from tempfile import TemporaryDirectory\r
      from email.message import EmailMessage\r
\r
      def buildPersonalizedMessages(recipients, subject, bodyTemplate, fromAddr="me@example.com"):\r
          messages = []\r
          for recipient in recipients:\r
              msg = EmailMessage()\r
              msg["From"] = fromAddr\r
              msg["To"] = recipient["email"]\r
              msg["Subject"] = subject\r
              msg.set_content(bodyTemplate.substitute(**recipient), charset="utf-8")\r
              messages.append(msg)\r
          return messages\r
\r
      vault = TemporaryDirectory()\r
      csvPath = Path(vault.name) / "list.csv"\r
      csvPath.write_text(\r
          "name,email,role\\n"\r
          "김대리,kim@example.com,대리\\n"\r
          "박과장,park@example.com,과장\\n"\r
          "이주임,lee@example.com,주임\\n",\r
          encoding="utf-8",\r
      )\r
      with open(csvPath, "r", encoding="utf-8") as f:\r
          recipients = list(csv.DictReader(f))\r
\r
      template = Template("$name 님 ($role), 월간 보고드립니다.")\r
      messages = buildPersonalizedMessages(recipients, "월간 보고", template)\r
\r
      for message, recipient in zip(messages, recipients):\r
          assert message["To"] == recipient["email"]\r
          assert recipient["name"] in message.get_content()\r
      len(messages)\r
    exercise:\r
      prompt: "CSV에 두 명 추가해 검증을 통과시키세요."\r
      starterCode: |-\r
        import csv\r
        from pathlib import Path\r
        from string import Template\r
        from tempfile import TemporaryDirectory\r
        from email.message import EmailMessage\r
\r
        def buildPersonalizedMessages(recipients, subject, bodyTemplate, fromAddr="me@example.com"):\r
            messages = []\r
            for recipient in recipients:\r
                msg = EmailMessage()\r
                msg["From"] = fromAddr\r
                msg["To"] = recipient["email"]\r
                msg["Subject"] = subject\r
                msg.set_content(bodyTemplate.substitute(**recipient), charset="utf-8")\r
                messages.append(msg)\r
            return messages\r
\r
        vault = TemporaryDirectory()\r
        csvPath = Path(vault.name) / "list.csv"\r
        csvPath.write_text(\r
            "name,email,role\\n"\r
            "김대리,kim@example.com,대리\\n"\r
            "박과장,park@example.com,과장\\n"\r
            ___,\r
            encoding="utf-8",\r
        )\r
        with open(csvPath, "r", encoding="utf-8") as f:\r
            recipients = list(csv.DictReader(f))\r
        template = Template("$name 님 안내")\r
        messages = buildPersonalizedMessages(recipients, "s", template)\r
        for m, r in zip(messages, recipients):\r
            assert m["To"] == r["email"]\r
            assert r["name"] in m.get_content()\r
        len(messages)\r
      hints:\r
        - "두 줄 추가. 예: '이주임,lee@x.com,주임\\\\n윤대리,yoon@x.com,대리\\\\n'."\r
    check:\r
      noError: "마지막 줄바꿈 잊지 말 것."\r
      resultCheck: "출력 4."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "안내 메일 일괄 발송기"\r
    goal: "CSV + Template + dryRun 패턴을 함수로 묶어 일괄 발송기 완성."\r
    why: "마케팅 정주임이 그대로 가져갈 수 있는 도구가 본 강의의 도착점입니다."\r
    explanation: |-\r
      미션: bulkSend(csvPath, subject, bodyTemplate, dryRun=True) -> list[EmailMessage] 함수. dryRun=True에서 메시지 리스트만 돌려주고, dryRun=False에서 실제 발송.\r
    tips:\r
      - "기본 dryRun=True 유지. 실 발송은 학습 후 본인 명단에서."\r
    snippet: |-\r
      import csv\r
      from pathlib import Path\r
      from string import Template\r
      from tempfile import TemporaryDirectory\r
      from email.message import EmailMessage\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수 시그니처: bulkSend(csvPath, subject, bodyTemplate, dryRun=True) -> list"\r
    check:\r
      noError: "함수 정의 + dryRun 검증."\r
      resultCheck: "결과 메시지 수 = CSV 행 수."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 일괄 발송기"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import csv\r
              import os\r
              import smtplib\r
              import ssl\r
              from pathlib import Path\r
              from string import Template\r
              from tempfile import TemporaryDirectory\r
              from email.message import EmailMessage\r
\r
              def bulkSend(csvPath, subject, bodyTemplate, dryRun=True, fromAddr="me@example.com"):\r
                  with open(csvPath, "r", encoding="utf-8") as f:\r
                      recipients = list(csv.DictReader(f))\r
                  messages = []\r
                  for recipient in recipients:\r
                      msg = EmailMessage()\r
                      msg["From"] = fromAddr\r
                      msg["To"] = recipient["email"]\r
                      msg["Subject"] = subject\r
                      msg.set_content(bodyTemplate.substitute(**recipient), charset="utf-8")\r
                      messages.append(msg)\r
                  if dryRun:\r
                      return messages\r
                  ctx = ssl.create_default_context()\r
                  with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as smtp:\r
                      smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_APP_PASS"])\r
                      for msg in messages:\r
                          smtp.send_message(msg)\r
                  return messages\r
\r
              missionDir = TemporaryDirectory()\r
              csvPath = Path(missionDir.name) / "list.csv"\r
              csvPath.write_text(\r
                  "name,email,role\\n"\r
                  "김대리,kim@example.com,대리\\n"\r
                  "박과장,park@example.com,과장\\n",\r
                  encoding="utf-8",\r
              )\r
              template = Template("$name 님 ($role), 안내드립니다.")\r
              messages = bulkSend(csvPath, "월간 안내", template, dryRun=True)\r
              assert len(messages) == 2\r
              assert messages[0]["To"] == "kim@example.com"\r
              assert "김대리" in messages[0].get_content()\r
              [m["To"] for m in messages]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "Template 본문에 $today, $deadline 같은 동적 필드 추가"\r
          - "발송 결과 (성공/실패) 로그를 CSV로 저장"\r
          - "수신자별로 다른 첨부 파일 (개인 청구서 PDF) 결합 - PDF 10강과 연결"\r
          - "CC/BCC 컬럼을 CSV에 추가해 한 번에 처리"\r
          - "한국식 직급 매핑: role='대리'면 '대리님', '과장'이면 '과장님'으로 자동 변환"\r
`;export{e as default};