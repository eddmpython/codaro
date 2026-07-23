var e=`meta:\r
  id: email_02\r
  title: HTML 메일과 첨부\r
  order: 2\r
  category: email\r
  difficulty: ⭐\r
  badge: 입문\r
  packages:\r
    - reportlab\r
  tags:\r
    - EmailMessage\r
    - add_alternative\r
    - add_attachment\r
  outcomes:\r
    - automation.email.attachments\r
  prerequisites:\r
    - automation.email.send\r
  estimatedMinutes: 45\r
  seo:\r
    title: "HTML 메일과 PDF 첨부 - EmailMessage add_attachment"\r
    description: "EmailMessage.add_alternative로 HTML 본문을, add_attachment로 PDF/이미지 첨부를 자동화한다. 한글 파일명 깨짐도 해결."\r
    keywords:\r
      - EmailMessage HTML\r
      - add_attachment\r
      - 한글 파일명\r
      - 멀티파트 메일\r
\r
intro:\r
  direction: "HTML 본문과 PDF 첨부가 들어간 메일을 EmailMessage 한 객체로 만든다. 한글 파일명 깨짐 함정도 같이 해결한다."\r
  benefits:\r
    - "마케팅 정주임의 HTML 안내 메일 + 보고서 PDF 첨부 작업이 한 함수 호출로 끝난다."\r
    - "EmailMessage가 자동으로 multipart/alternative + multipart/mixed 구조를 만들어 별도 MIME 클래스를 직접 다루지 않아도 된다."\r
    - "한글 파일명이 깨지는 가장 흔한 첨부 사고를 사전 차단."\r
  diagram:\r
    steps:\r
      - label: "1. set_content 본문"\r
        detail: "텍스트 폴백 본문을 먼저."\r
      - label: "2. add_alternative HTML"\r
        detail: "subtype='html'로 HTML 본문 추가."\r
      - label: "3. add_attachment"\r
        detail: "PDF/PNG 등 파일 첨부. filename 인자로 한글 파일명 처리."\r
      - label: "4. 검증"\r
        detail: "iter_attachments로 첨부 목록과 filename, content_type 확인."\r
    runtime:\r
      - label: "샘플 첨부"\r
        detail: "reportlab으로 즉석 PDF를 만들거나 임시 PNG를 생성."\r
      - label: "검증"\r
        detail: "EmailMessage 객체의 multipart 구조와 첨부 메타 단위 assert."\r
\r
sections:\r
  - id: step1_html_body\r
    title: "1단계. HTML 본문 추가"\r
    structuredPrimary: true\r
    subtitle: "set_content + add_alternative(subtype='html')"\r
    goal: "텍스트 본문 + HTML 본문을 가진 multipart/alternative 메일을 만든다."\r
    why: "마케팅 메일은 HTML이 표준입니다. 텍스트 폴백을 같이 두면 텍스트 전용 클라이언트에서도 깨지지 않습니다."\r
    explanation: |-\r
      EmailMessage의 set_content가 텍스트 본문을 세팅하고, add_alternative(html_body, subtype='html')가 HTML 본문을 같은 메시지에 추가합니다. 두 본문이 모두 들어가면 자동으로 multipart/alternative 구조가 됩니다.\r
    tips:\r
      - "이메일 클라이언트가 HTML을 보여줄 수 있으면 HTML, 아니면 텍스트로 자동 선택합니다."\r
    snippet: |-\r
      from email.message import EmailMessage\r
\r
      msg = EmailMessage()\r
      msg["From"] = "me@example.com"\r
      msg["To"] = "you@example.com"\r
      msg["Subject"] = "HTML 안내"\r
      msg.set_content("HTML을 지원하지 않는 클라이언트용 본문입니다.", charset="utf-8")\r
      msg.add_alternative(\r
          "<h1>Codaro</h1><p>HTML 본문입니다.</p>",\r
          subtype="html",\r
      )\r
      msg.get_content_type(), [p.get_content_type() for p in msg.iter_parts()]\r
    exercise:\r
      prompt: "HTML 본문에 <p>월간 보고서 도착</p>가 들어가도록 바꾸세요."\r
      starterCode: |-\r
        from email.message import EmailMessage\r
\r
        msg = EmailMessage()\r
        msg["From"] = "me@example.com"\r
        msg["To"] = "you@example.com"\r
        msg["Subject"] = "HTML 안내"\r
        msg.set_content("text fallback", charset="utf-8")\r
        msg.add_alternative(___, subtype="html")\r
        any("월간 보고서" in p.get_content() for p in msg.iter_parts() if p.get_content_type() == "text/html")\r
      hints:\r
        - "문자열 '<h1>Codaro</h1><p>월간 보고서 도착</p>'."\r
    check:\r
      noError: "add_alternative의 subtype은 문자열."\r
      resultCheck: "True 출력."\r
\r
  - id: step2_attach\r
    title: "2단계. 파일 첨부"\r
    structuredPrimary: true\r
    subtitle: "add_attachment(data, maintype, subtype, filename)"\r
    goal: "임시 PDF를 만들어 메일에 첨부한다."\r
    why: "보고서·견적서 첨부는 사무 메일의 핵심입니다. add_attachment 한 줄로 처리됩니다."\r
    explanation: |-\r
      파일을 바이트로 읽어 add_attachment(data, maintype='application', subtype='pdf', filename='report.pdf')로 첨부합니다. filename이 수신자가 보는 파일명이 됩니다.\r
    tips:\r
      - "maintype/subtype은 MIME 타입에 맞춰 지정. PDF는 application/pdf, PNG는 image/png."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from email.message import EmailMessage\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "report.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      canvas.drawString(72, 720, "monthly report")\r
      canvas.showPage()\r
      canvas.save()\r
\r
      msg = EmailMessage()\r
      msg["From"] = "me@example.com"\r
      msg["To"] = "partner@example.com"\r
      msg["Subject"] = "월간 보고서"\r
      msg.set_content("첨부 확인 부탁드립니다.", charset="utf-8")\r
      msg.add_attachment(\r
          pdfPath.read_bytes(),\r
          maintype="application",\r
          subtype="pdf",\r
          filename="report.pdf",\r
      )\r
\r
      [(part.get_filename(), part.get_content_type()) for part in msg.iter_attachments()]\r
    exercise:\r
      prompt: "첨부 파일명을 'monthly_report_2026_05.pdf'로 바꾸세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from email.message import EmailMessage\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "r.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        canvas.drawString(72, 720, "x")\r
        canvas.showPage()\r
        canvas.save()\r
\r
        msg = EmailMessage()\r
        msg["From"] = "me@example.com"\r
        msg["To"] = "partner@example.com"\r
        msg["Subject"] = "월간 보고서"\r
        msg.set_content("body", charset="utf-8")\r
        msg.add_attachment(pdfPath.read_bytes(), maintype="application", subtype="pdf", filename=___)\r
        [p.get_filename() for p in msg.iter_attachments()]\r
      hints:\r
        - "문자열 'monthly_report_2026_05.pdf'."\r
    check:\r
      noError: "filename은 문자열."\r
      resultCheck: "출력 ['monthly_report_2026_05.pdf']."\r
\r
  - id: step3_korean_filename\r
    title: "3단계. 한글 파일명 깨짐 해결"\r
    structuredPrimary: true\r
    subtitle: "add_attachment의 filename 한글 자동 처리"\r
    goal: "한글 파일명으로 첨부하고 iter_attachments에서 한글 그대로 복원되는지 확인한다."\r
    why: "한글 파일명이 깨지는 사고는 첨부에서 가장 흔합니다. Python의 EmailMessage는 RFC2231 인코딩을 자동 처리하므로 사용자 코드는 그대로 한글 문자열만 넘기면 됩니다."\r
    explanation: |-\r
      filename='월간보고서.pdf'를 그대로 넘기면 EmailMessage가 자동으로 RFC2231 형식으로 인코딩합니다. 수신자 클라이언트(Gmail/Outlook 등)는 인코딩을 풀어 한글로 보여줍니다.\r
    tips:\r
      - "iter_attachments().get_filename()은 자동으로 디코딩된 한글을 돌려줍니다. 발송 시에는 인코딩된 형태로 헤더에 들어갑니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from email.message import EmailMessage\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "report.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      canvas.drawString(72, 720, "report body")\r
      canvas.showPage()\r
      canvas.save()\r
\r
      msg = EmailMessage()\r
      msg["From"] = "me@example.com"\r
      msg["To"] = "you@example.com"\r
      msg["Subject"] = "보고서"\r
      msg.set_content("첨부 확인", charset="utf-8")\r
      msg.add_attachment(\r
          pdfPath.read_bytes(),\r
          maintype="application",\r
          subtype="pdf",\r
          filename="월간보고서_2026년5월.pdf",\r
      )\r
\r
      [part.get_filename() for part in msg.iter_attachments()]\r
    exercise:\r
      prompt: "파일명을 '회계_청구서_홍길동.pdf'로 바꾸고 한글이 그대로 복원되는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from email.message import EmailMessage\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "r.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        canvas.drawString(72, 720, "x")\r
        canvas.showPage()\r
        canvas.save()\r
\r
        msg = EmailMessage()\r
        msg["From"] = "me@example.com"\r
        msg["To"] = "you@example.com"\r
        msg["Subject"] = "청구"\r
        msg.set_content("body", charset="utf-8")\r
        msg.add_attachment(pdfPath.read_bytes(), maintype="application", subtype="pdf", filename=___)\r
        [p.get_filename() for p in msg.iter_attachments()]\r
      hints:\r
        - "한글 문자열 '회계_청구서_홍길동.pdf'."\r
    check:\r
      noError: "filename 인자는 키워드."\r
      resultCheck: "출력 ['회계_청구서_홍길동.pdf']."\r
\r
  - id: validation\r
    title: "4단계. 검증 루프 - HTML + 첨부 통합 assert"\r
    structuredPrimary: true\r
    subtitle: "메시지 구조 + 첨부 메타 일괄"\r
    goal: "buildEmailWithAttachment 함수가 만든 메시지의 콘텐츠 타입과 첨부 파일명을 한 셀에서 검증한다."\r
    why: "HTML + 첨부 흐름은 회귀가 잦은 영역입니다. 한 묶음 assert로 회귀 사전 차단."\r
    explanation: |-\r
      buildEmailWithAttachment(to, subject, htmlBody, pdfPath, filename)이 한 함수에 패턴을 묶고, 결과의 multipart 구조와 첨부 파일명을 같이 확인합니다.\r
    tips:\r
      - "multipart 구조는 msg.is_multipart()로도 확인 가능."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from email.message import EmailMessage\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def buildEmailWithAttachment(toAddr, subject, htmlBody, pdfPath, filename):\r
          msg = EmailMessage()\r
          msg["From"] = "me@example.com"\r
          msg["To"] = toAddr\r
          msg["Subject"] = subject\r
          msg.set_content("HTML 미지원 클라이언트용 본문", charset="utf-8")\r
          msg.add_alternative(htmlBody, subtype="html")\r
          msg.add_attachment(Path(pdfPath).read_bytes(), maintype="application", subtype="pdf", filename=filename)\r
          return msg\r
\r
      vault = TemporaryDirectory()\r
      pdfPath = Path(vault.name) / "report.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      canvas.drawString(72, 720, "report")\r
      canvas.showPage()\r
      canvas.save()\r
\r
      msg = buildEmailWithAttachment(\r
          "partner@example.com",\r
          "월간 보고서",\r
          "<h1>월간 보고서</h1>",\r
          pdfPath,\r
          "보고서.pdf",\r
      )\r
\r
      assert msg.is_multipart()\r
      attachments = list(msg.iter_attachments())\r
      assert len(attachments) == 1\r
      assert attachments[0].get_filename() == "보고서.pdf"\r
      assert attachments[0].get_content_type() == "application/pdf"\r
      msg["Subject"], attachments[0].get_filename()\r
    exercise:\r
      prompt: "함수에 csv 인자가 들어왔을 때만 두 번째 첨부를 추가하는 분기를 직접 작성하세요. 빈 자리에 if 가드와 add_attachment 호출(maintype='text', subtype='csv', filename=csvFilename)을 채워 첨부 수가 정확히 2가 되도록 합니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from email.message import EmailMessage\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def buildEmailWithAttachment(toAddr, subject, htmlBody, pdfPath, filename, csvPath=None, csvFilename=None):\r
            msg = EmailMessage()\r
            msg["From"] = "me@example.com"\r
            msg["To"] = toAddr\r
            msg["Subject"] = subject\r
            msg.set_content("text", charset="utf-8")\r
            msg.add_alternative(htmlBody, subtype="html")\r
            msg.add_attachment(Path(pdfPath).read_bytes(), maintype="application", subtype="pdf", filename=filename)\r
            ___\r
            return msg\r
\r
        vault = TemporaryDirectory()\r
        base = Path(vault.name)\r
        pdfPath = base / "r.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        canvas.drawString(72, 720, "x")\r
        canvas.showPage()\r
        canvas.save()\r
        csvPath = base / "d.csv"\r
        csvPath.write_text("a,b\\n1,2\\n", encoding="utf-8")\r
\r
        msg = buildEmailWithAttachment("p@x.com", "s", "<p>h</p>", pdfPath, "r.pdf", csvPath, "data.csv")\r
        len(list(msg.iter_attachments()))\r
      hints:\r
        - "빈 자리: if csvPath: msg.add_attachment(Path(csvPath).read_bytes(), maintype='text', subtype='csv', filename=csvFilename)."\r
    check:\r
      noError: "함수 인자가 모두 채워져야 합니다."\r
      resultCheck: "출력 2."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "마케팅 안내 메일 빌더"\r
    goal: "HTML 본문 + 한글 첨부 PDF가 들어간 안내 메일 빌더를 직접 작성한다."\r
    why: "마케팅 정주임의 실무 메일 패턴 그대로입니다. 함수 하나로 모든 안내 메일을 일관되게 만듭니다."\r
    explanation: |-\r
      미션은 마케팅 안내 메일 빌더 함수입니다. 한글 제목, HTML 본문, 한글 파일명 첨부가 모두 정상 처리되는지 검증합니다.\r
    tips:\r
      - "한글 처리는 EmailMessage가 거의 자동입니다. 사용자 코드는 깨끗하게 한글 그대로."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from email.message import EmailMessage\r
      from reportlab.pdfgen.canvas import Canvas\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수 시그니처: buildCampaignEmail(toAddr, subject, htmlBody, pdfPath, filename) -> EmailMessage"\r
    check:\r
      noError: "함수 정의 + 검증."\r
      resultCheck: "한글 제목/파일명이 모두 복원되어야 합니다."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 한글 안내 메일 빌더"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from email.message import EmailMessage\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              def buildCampaignEmail(toAddr, subject, htmlBody, pdfPath, filename):\r
                  msg = EmailMessage()\r
                  msg["From"] = "marketing@codaro.dev"\r
                  msg["To"] = toAddr\r
                  msg["Subject"] = subject\r
                  msg.set_content("HTML 미지원 클라이언트용 본문입니다.", charset="utf-8")\r
                  msg.add_alternative(htmlBody, subtype="html")\r
                  msg.add_attachment(\r
                      Path(pdfPath).read_bytes(),\r
                      maintype="application",\r
                      subtype="pdf",\r
                      filename=filename,\r
                  )\r
                  return msg\r
\r
              missionDir = TemporaryDirectory()\r
              missionPdf = Path(missionDir.name) / "guide.pdf"\r
              canvas = Canvas(str(missionPdf))\r
              canvas.drawString(72, 720, "guide")\r
              canvas.showPage()\r
              canvas.save()\r
\r
              msg = buildCampaignEmail(\r
                  "customer@example.com",\r
                  "Codaro 5월 안내 - 신기능 출시",\r
                  "<h1>Codaro 5월</h1><p>새 기능을 확인하세요</p>",\r
                  missionPdf,\r
                  "Codaro_5월_안내.pdf",\r
              )\r
              assert msg["Subject"] == "Codaro 5월 안내 - 신기능 출시"\r
              attachments = list(msg.iter_attachments())\r
              assert attachments[0].get_filename() == "Codaro_5월_안내.pdf"\r
              msg["Subject"], attachments[0].get_filename()\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "첨부 여러 개 (CSV + PDF + 이미지) 동시 발송"\r
          - "HTML 본문에 회사 로고를 인라인 이미지(Content-ID)로 삽입 (04강 미리보기)"\r
          - "수신자별로 다른 첨부 (개인화 청구서) - 03강 결합"\r
          - "첨부 크기 제한 (Gmail 25MB) 체크 함수"\r
          - "첨부 파일명을 회사명+날짜 패턴으로 자동 생성"\r
`;export{e as default};