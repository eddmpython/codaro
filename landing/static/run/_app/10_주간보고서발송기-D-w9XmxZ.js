var e=`meta:\r
  id: email_10\r
  title: 주간 보고서 자동 발송기\r
  order: 10\r
  category: email\r
  difficulty: ⭐⭐⭐⭐⭐\r
  badge: 심화\r
  packages:\r
    - pandas\r
    - matplotlib\r
    - reportlab\r
    - pypdf\r
    - aiosmtpd\r
  tags:\r
    - 종합프로젝트\r
    - 주간보고서\r
    - aiosmtpd\r
    - 통합\r
  outcomes:\r
    - automation.email.report\r
  prerequisites:\r
    - automation.email.bulk\r
    - automation.email.notify\r
    - automation.email.credentials\r
  estimatedMinutes: 90\r
  seo:\r
    title: "주간 보고서 자동 발송기 - CSV → HTML+PDF → 다수 발송 + 알림"\r
    description: "Email 트랙의 모든 패턴을 한 사이클에 결합. CSV → 차트 → HTML 본문 + PDF 첨부 → 다수 발송 + 알림 통합."\r
    keywords:\r
      - 주간 보고서 자동화\r
      - aiosmtpd 검증\r
      - 이메일 통합 발송기\r
\r
intro:\r
  direction: "01-09강의 모든 패턴을 한 사이클에 묶는다. CSV 데이터 → 차트 + PDF → HTML 메일 → 다수 발송 → 알림 모니터링. aiosmtpd로 실 발송 통합 검증."\r
  benefits:\r
    - "운영 김대리의 주간 보고서 발송 90분을 30초로 줄인다."\r
    - "PDF 트랙 10강 청구서 + Email 트랙 모든 패턴이 한 함수에 결합."\r
    - "aiosmtpd 로컬 SMTP 서버로 실 발송 흐름을 외부 의존 없이 통합 검증."\r
  diagram:\r
    steps:\r
      - label: "1. 데이터 → 차트"\r
        detail: "pandas + matplotlib로 주간 차트 PNG."\r
      - label: "2. 차트 → PDF"\r
        detail: "reportlab으로 차트 포함 한 페이지 보고서 PDF."\r
      - label: "3. HTML 메일 구성"\r
        detail: "표 + 인라인 차트 + PDF 첨부."\r
      - label: "4. 다수 발송 + 알림"\r
        detail: "수신자 리스트 순회 + 예외 시 알림."\r
    runtime:\r
      - label: "aiosmtpd 통합 검증"\r
        detail: "dev dep 단 하나. 로컬 SMTP 서버에 자기 자신 발송 후 수신함 검증."\r
      - label: "외부 발송 옵션"\r
        detail: "환경변수 SMTP_USER/SMTP_APP_PASS 설정 + dryRun=False로 실 발송 가능."\r
\r
sections:\r
  - id: step1_data_chart\r
    title: "1단계. 데이터 → 차트 PNG"\r
    structuredPrimary: true\r
    subtitle: "pandas + matplotlib"\r
    goal: "주간 매출 CSV에서 막대 차트 PNG를 생성한다."\r
    why: "보고서의 시각화 핵심입니다. matplotlib png 한 번이 모든 후속 단계의 자료."\r
    explanation: |-\r
      df.groupby('region').sum().plot.bar()로 한 줄 차트, fig.savefig로 PNG 저장.\r
    tips:\r
      - "Agg 백엔드를 강제하면 디스플레이 없는 CI에서도 동작."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import matplotlib\r
      matplotlib.use("Agg")\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      df = pd.DataFrame({\r
          "region": ["Seoul", "Busan", "Daegu", "Incheon"],\r
          "amount": [1200000, 800000, 600000, 550000],\r
      })\r
      fig, ax = plt.subplots(figsize=(8, 4))\r
      df.plot.bar(x="region", y="amount", ax=ax, legend=False)\r
      ax.set_title("Weekly Sales")\r
      ax.set_ylabel("amount")\r
      pngPath = base / "chart.png"\r
      fig.savefig(pngPath, bbox_inches="tight")\r
      plt.close(fig)\r
      pngPath.stat().st_size > 0\r
    exercise:\r
      prompt: "df에 Daejeon 480000 행을 추가하고 차트 png가 만들어지는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import matplotlib\r
        matplotlib.use("Agg")\r
        import matplotlib.pyplot as plt\r
        import pandas as pd\r
\r
        workdir = TemporaryDirectory()\r
        df = pd.DataFrame({\r
            "region": ["Seoul", "Busan", "Daegu", ___],\r
            "amount": [1200000, 800000, 600000, ___],\r
        })\r
        fig, ax = plt.subplots(figsize=(8, 4))\r
        df.plot.bar(x="region", y="amount", ax=ax, legend=False)\r
        pngPath = Path(workdir.name) / "c.png"\r
        fig.savefig(pngPath)\r
        plt.close(fig)\r
        pngPath.stat().st_size > 0\r
      hints:\r
        - "문자열 'Daejeon', 정수 480000."\r
    check:\r
      noError: "리스트 길이 같아야 합니다."\r
      resultCheck: "True 출력."\r
\r
  - id: step2_pdf_report\r
    title: "2단계. 차트 포함 PDF 보고서"\r
    structuredPrimary: true\r
    subtitle: "reportlab Platypus + Image"\r
    goal: "차트 PNG와 데이터 표가 들어간 한 페이지 PDF를 만든다."\r
    why: "PDF 트랙 07강 패턴을 그대로 재사용. 트랙 간 결합이 자연스러움."\r
    explanation: |-\r
      SimpleDocTemplate + Image(차트) + Table(데이터) + Paragraph 헤더로 한 페이지 보고서.\r
    tips:\r
      - "본 함수가 PDF 트랙 10강의 청구서 빌더와 같은 패턴입니다. 한 함수 재사용 가능."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.lib.styles import getSampleStyleSheet\r
      from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
      import matplotlib\r
      matplotlib.use("Agg")\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      def buildWeeklyPdf(path, df, chartPath):\r
          styles = getSampleStyleSheet()\r
          data = [["region", "amount"]] + [[row.region, f"{row.amount:,}"] for row in df.itertuples()]\r
          doc = SimpleDocTemplate(str(path), pagesize=A4)\r
          doc.build([\r
              Paragraph("Weekly Sales Report", styles["Heading1"]),\r
              Spacer(1, 12),\r
              Image(str(chartPath), width=400, height=200),\r
              Spacer(1, 12),\r
              Table(data, colWidths=[200, 100], style=TableStyle([\r
                  ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),\r
                  ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
              ])),\r
          ])\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      df = pd.DataFrame({"region": ["Seoul", "Busan"], "amount": [1200000, 800000]})\r
      fig, ax = plt.subplots(figsize=(6, 3))\r
      df.plot.bar(x="region", y="amount", ax=ax, legend=False)\r
      chartPath = base / "c.png"\r
      fig.savefig(chartPath)\r
      plt.close(fig)\r
\r
      pdfPath = base / "report.pdf"\r
      buildWeeklyPdf(pdfPath, df, chartPath)\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      "Weekly Sales" in body and "Seoul" in body\r
    exercise:\r
      prompt: "df에 Daegu 600000 행을 추가하고 PDF 본문에 'Daegu'가 포함되는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.lib import colors\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.lib.styles import getSampleStyleSheet\r
        from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
        import matplotlib\r
        matplotlib.use("Agg")\r
        import matplotlib.pyplot as plt\r
        import pandas as pd\r
\r
        def buildWeeklyPdf(path, df, chartPath):\r
            styles = getSampleStyleSheet()\r
            data = [["region", "amount"]] + [[r.region, f"{r.amount:,}"] for r in df.itertuples()]\r
            doc = SimpleDocTemplate(str(path), pagesize=A4)\r
            doc.build([\r
                Paragraph("Weekly Sales", styles["Heading1"]),\r
                Image(str(chartPath), width=400, height=200),\r
                Table(data, colWidths=[200, 100], style=TableStyle([("GRID", (0,0), (-1,-1), 0.5, colors.black)])),\r
            ])\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        df = pd.DataFrame({"region": ["Seoul", "Busan", ___], "amount": [1200000, 800000, ___]})\r
        fig, ax = plt.subplots(figsize=(6, 3))\r
        df.plot.bar(x="region", y="amount", ax=ax, legend=False)\r
        chartPath = base / "c.png"\r
        fig.savefig(chartPath)\r
        plt.close(fig)\r
        pdfPath = base / "r.pdf"\r
        buildWeeklyPdf(pdfPath, df, chartPath)\r
        "Daegu" in (PdfReader(pdfPath).pages[0].extract_text() or "")\r
      hints:\r
        - "문자열 'Daegu', 정수 600000."\r
    check:\r
      noError: "리스트 길이 같아야."\r
      resultCheck: "True 출력."\r
\r
  - id: step3_combine_email\r
    title: "3단계. PDF + HTML + 차트 → 메일"\r
    structuredPrimary: true\r
    subtitle: "한 함수에 모든 패턴 결합"\r
    goal: "표 HTML + 인라인 차트 + PDF 첨부 메일을 한 함수에서 만든다."\r
    why: "본 강의의 핵심 통합 함수. 데이터 한 번으로 보고용 PDF와 안내용 메일이 동시에 나옵니다."\r
    explanation: |-\r
      buildWeeklyMail(toAddr, df, chartPath, pdfPath)이 표 + 인라인 차트 + PDF 첨부를 한 EmailMessage로 묶음.\r
    tips:\r
      - "PDF 첨부 파일명을 '주간보고서_YYYYMMDD.pdf'로 동적 생성하면 수신자가 정리하기 쉬움."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from email.message import EmailMessage\r
      import matplotlib\r
      matplotlib.use("Agg")\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
      from pypdf import PdfReader\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.lib.styles import getSampleStyleSheet\r
      from reportlab.platypus import Paragraph, SimpleDocTemplate, Table, TableStyle\r
\r
      def buildWeeklyMail(toAddr, df, chartPath, pdfPath):\r
          msg = EmailMessage()\r
          msg["From"] = "ops@example.com"\r
          msg["To"] = toAddr\r
          msg["Subject"] = "주간 보고서"\r
          msg.set_content("HTML 미지원 클라이언트용 본문", charset="utf-8")\r
          tableHtml = df.to_html(index=False, border=1)\r
          msg.add_alternative(\r
              f'<h2>주간 보고서</h2>{tableHtml}<p><img src="cid:chart"></p>',\r
              subtype="html",\r
          )\r
          msg.add_attachment(Path(chartPath).read_bytes(), maintype="image", subtype="png", cid="<chart>")\r
          msg.add_attachment(\r
              Path(pdfPath).read_bytes(),\r
              maintype="application",\r
              subtype="pdf",\r
              filename="주간보고서.pdf",\r
          )\r
          return msg\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      df = pd.DataFrame({"region": ["Seoul", "Busan"], "amount": [1200000, 800000]})\r
      fig, ax = plt.subplots(figsize=(6, 3))\r
      df.plot.bar(x="region", y="amount", ax=ax, legend=False)\r
      chartPath = base / "c.png"\r
      fig.savefig(chartPath)\r
      plt.close(fig)\r
      pdfPath = base / "r.pdf"\r
      styles = getSampleStyleSheet()\r
      doc = SimpleDocTemplate(str(pdfPath), pagesize=A4)\r
      doc.build([Paragraph("Weekly", styles["Heading1"]), Table([["a"], ["b"]])])\r
\r
      mail = buildWeeklyMail("팀장@example.com", df, chartPath, pdfPath)\r
      mail["Subject"], [p.get_filename() for p in mail.iter_attachments()]\r
    exercise:\r
      prompt: "buildWeeklyMail을 직접 작성하세요. ccAddr이 리스트면 콤마 결합, 문자열이면 그대로 'Cc' 헤더에 넣고, None이면 Cc 헤더를 만들지 마세요. 세 경우(list/str/None)를 한 번에 검증합니다."\r
      starterCode: |-\r
        from email.message import EmailMessage\r
\r
        def buildWeeklyMail(toAddr, ccAddr=None):\r
            msg = EmailMessage()\r
            msg["From"] = "ops@example.com"\r
            msg["To"] = toAddr\r
            ___\r
            msg["Subject"] = "주간"\r
            msg.set_content("body", charset="utf-8")\r
            return msg\r
\r
        listMail = buildWeeklyMail("lead@example.com", ccAddr=["a@x.com", "b@x.com"])\r
        strMail = buildWeeklyMail("lead@example.com", ccAddr="cc@example.com")\r
        noneMail = buildWeeklyMail("lead@example.com")\r
        assert listMail["Cc"] == "a@x.com, b@x.com"\r
        assert strMail["Cc"] == "cc@example.com"\r
        assert noneMail["Cc"] is None\r
        (listMail["Cc"], strMail["Cc"], noneMail["Cc"])\r
      hints:\r
        - "if ccAddr: msg['Cc'] = ', '.join(ccAddr) if isinstance(ccAddr, list) else ccAddr."\r
    check:\r
      noError: "헤더 키는 'Cc'."\r
      resultCheck: "출력 'cc@example.com'."\r
\r
  - id: validation\r
    title: "4단계. 검증 루프 - aiosmtpd 통합 검증"\r
    structuredPrimary: true\r
    subtitle: "로컬 SMTP에 자기 자신 발송"\r
    goal: "aiosmtpd로 로컬 SMTP 서버를 띄우고 자기 자신에게 발송해 수신함 검증."\r
    why: "외부 메일 서버 없이 실 발송 흐름을 통합 검증. CI에서도 동작."\r
    explanation: |-\r
      Controller(handler).start()로 127.0.0.1:8025에 SMTP 서버. smtplib.SMTP(host, port).send_message로 그 서버에 발송. handler에 누적된 메시지를 검증.\r
    tips:\r
      - "aiosmtpd가 설치 안 된 환경에서는 ImportError를 잡아 skip 가능한 패턴으로."\r
    snippet: |-\r
      import asyncio\r
      from email.message import EmailMessage\r
\r
      try:\r
          from aiosmtpd.controller import Controller\r
          available = True\r
      except ImportError:\r
          available = False\r
\r
      if available:\r
          received = []\r
\r
          class Handler:\r
              async def handle_DATA(self, server, session, envelope):\r
                  received.append(envelope.content)\r
                  return "250 OK"\r
\r
          controller = Controller(Handler(), hostname="127.0.0.1", port=8025)\r
          controller.start()\r
          try:\r
              import smtplib\r
              msg = EmailMessage()\r
              msg["From"] = "me@example.com"\r
              msg["To"] = "me@example.com"\r
              msg["Subject"] = "aiosmtpd integration"\r
              msg.set_content("hello", charset="utf-8")\r
              with smtplib.SMTP("127.0.0.1", 8025) as smtp:\r
                  smtp.send_message(msg)\r
              assert len(received) == 1\r
              status = "received"\r
          finally:\r
              controller.stop()\r
      else:\r
          status = "skipped (aiosmtpd not installed)"\r
      status\r
    exercise:\r
      prompt: "발송 메시지 2개를 보내고 received 길이가 2인지 확인하세요."\r
      starterCode: |-\r
        try:\r
            from aiosmtpd.controller import Controller\r
            available = True\r
        except ImportError:\r
            available = False\r
\r
        if available:\r
            received = []\r
\r
            class Handler:\r
                async def handle_DATA(self, server, session, envelope):\r
                    received.append(envelope.content)\r
                    return "250 OK"\r
\r
            controller = Controller(Handler(), hostname="127.0.0.1", port=8025)\r
            controller.start()\r
            try:\r
                import smtplib\r
                from email.message import EmailMessage\r
\r
                for idx in range(___):\r
                    msg = EmailMessage()\r
                    msg["From"] = "me@example.com"\r
                    msg["To"] = "me@example.com"\r
                    msg["Subject"] = f"msg {idx}"\r
                    msg.set_content("body", charset="utf-8")\r
                    with smtplib.SMTP("127.0.0.1", 8025) as smtp:\r
                        smtp.send_message(msg)\r
                result = len(received)\r
            finally:\r
                controller.stop()\r
        else:\r
            result = 0\r
        result\r
      hints:\r
        - "정수 2."\r
    check:\r
      noError: "Controller start/stop 짝맞춤."\r
      resultCheck: "출력 2 (aiosmtpd 설치 시) 또는 0."\r
\r
  - id: practice\r
    title: "실습 - 통합 발송기"\r
    subtitle: "데이터 → 보고서 → 다수 발송 전 파이프라인"\r
    goal: "01-09강의 모든 패턴을 한 함수에 결합한 주간 보고서 발송기를 완성한다."\r
    why: "운영 김대리의 매주 90분 업무가 본 함수 한 번 실행으로 끝납니다."\r
    explanation: |-\r
      미션: weeklyDispatch(df, recipients, dryRun=True) 함수. 데이터 → 차트 → PDF → 메일 → 수신자별 발송 → 실패 시 알림.\r
    tips:\r
      - "dryRun=True에서 모든 메시지를 검토할 수 있어야 안전합니다."\r
    snippet: |-\r
      from email.message import EmailMessage\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수: weeklyDispatch(df, recipients, dryRun=True) -> list[EmailMessage]"\r
    check:\r
      noError: "통합 함수 정의."\r
      resultCheck: "각 수신자별 메시지가 만들어지고 첨부 PDF가 포함."\r
    blocks:\r
      - type: tip\r
        content: "본 강의가 본 트랙의 마지막입니다. 본 함수를 본인 팀 데이터로 변주해 실제 도구로 만드세요."\r
      - type: expansion\r
        title: "미션: 주간 보고서 발송기"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import traceback\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from email.message import EmailMessage\r
              import matplotlib\r
              matplotlib.use("Agg")\r
              import matplotlib.pyplot as plt\r
              import pandas as pd\r
              from reportlab.lib import colors\r
              from reportlab.lib.pagesizes import A4\r
              from reportlab.lib.styles import getSampleStyleSheet\r
              from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
              def weeklyDispatch(df, recipients, dryRun=True):\r
                  workdir = TemporaryDirectory()\r
                  base = Path(workdir.name)\r
                  fig, ax = plt.subplots(figsize=(8, 4))\r
                  df.plot.bar(x="region", y="amount", ax=ax, legend=False)\r
                  ax.set_title("Weekly Sales")\r
                  chartPath = base / "chart.png"\r
                  fig.savefig(chartPath, bbox_inches="tight")\r
                  plt.close(fig)\r
\r
                  pdfPath = base / "weekly.pdf"\r
                  styles = getSampleStyleSheet()\r
                  rows = [["region", "amount"]] + [[r.region, f"{r.amount:,}"] for r in df.itertuples()]\r
                  doc = SimpleDocTemplate(str(pdfPath), pagesize=A4)\r
                  doc.build([\r
                      Paragraph("Weekly Sales Report", styles["Heading1"]),\r
                      Image(str(chartPath), width=400, height=200),\r
                      Spacer(1, 12),\r
                      Table(rows, colWidths=[200, 100], style=TableStyle([\r
                          ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),\r
                          ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
                      ])),\r
                  ])\r
\r
                  messages = []\r
                  for recipient in recipients:\r
                      msg = EmailMessage()\r
                      msg["From"] = "ops@example.com"\r
                      msg["To"] = recipient\r
                      msg["Subject"] = "주간 보고서"\r
                      msg.set_content("HTML 미지원 클라이언트용 본문", charset="utf-8")\r
                      tableHtml = df.to_html(index=False, border=1)\r
                      msg.add_alternative(\r
                          f'<h2>주간 매출</h2>{tableHtml}<p><img src="cid:chart"></p>',\r
                          subtype="html",\r
                      )\r
                      msg.add_attachment(chartPath.read_bytes(), maintype="image", subtype="png", cid="<chart>")\r
                      msg.add_attachment(pdfPath.read_bytes(), maintype="application", subtype="pdf", filename="주간보고서.pdf")\r
                      messages.append(msg)\r
                  return messages\r
\r
              missionDf = pd.DataFrame({"region": ["Seoul", "Busan", "Daegu"], "amount": [1200000, 800000, 600000]})\r
              recipients = ["lead@example.com", "manager@example.com"]\r
              messages = weeklyDispatch(missionDf, recipients, dryRun=True)\r
              assert len(messages) == 2\r
              for m in messages:\r
                  assert m["Subject"] == "주간 보고서"\r
                  attachments = list(m.iter_attachments())\r
                  assert any(att.get_filename() == "주간보고서.pdf" for att in attachments)\r
              [m["To"] for m in messages]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "수신자별 다른 데이터 cut (지역장별 자기 지역 보고서)"\r
          - "발송 결과 로그를 Google Sheets 또는 Slack으로 별도 알림"\r
          - "월간/분기 보고서 자동 분기"\r
          - "PDF 트랙 10강 청구서 PDF를 첨부에 결합"\r
          - "Word 트랙 회의록 docx와 동시 첨부"\r
`;export{e as default};