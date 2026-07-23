var e=`meta:\r
  id: email_04\r
  title: 표와 차트가 들어간 일일 메일\r
  order: 4\r
  category: email\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  packages:\r
    - pandas\r
    - matplotlib\r
  tags:\r
    - DataFrame.to_html\r
    - Content-ID\r
    - inline image\r
  outcomes:\r
    - automation.email.attachments\r
  prerequisites:\r
    - automation.email.attachments\r
  estimatedMinutes: 50\r
  seo:\r
    title: "표와 차트가 들어간 일일 메일 - DataFrame.to_html + 인라인 이미지"\r
    description: "운영팀 일일 보고 메일을 DataFrame.to_html 표 + matplotlib png 인라인 이미지로 자동화. 100분/주 작업이 10초로 줄어든다."\r
    keywords:\r
      - DataFrame to_html\r
      - Content-ID inline\r
      - matplotlib png 첨부\r
\r
intro:\r
  direction: "매일 운영 데이터를 표와 차트가 들어간 HTML 메일로 자동 발송한다. 일일 20분 × 5일 = 100분/주가 10초로 줄어든다."\r
  benefits:\r
    - "운영 김대리의 매일 아침 매출 보고 메일을 100분/주에서 10초로 단축."\r
    - "pandas DataFrame.to_html로 표를 HTML 본문에 직접 삽입."\r
    - "matplotlib png를 Content-ID 인라인 이미지로 본문 안에 표시."\r
  diagram:\r
    steps:\r
      - label: "1. DataFrame을 HTML 표로"\r
        detail: "df.to_html(index=False)로 표 HTML 문자열 생성."\r
      - label: "2. matplotlib png 생성"\r
        detail: "fig.savefig로 차트 PNG를 임시 파일에."\r
      - label: "3. HTML 본문 합성"\r
        detail: "표 HTML + <img src='cid:chart'> 태그."\r
      - label: "4. Content-ID 첨부"\r
        detail: "add_attachment에 cid 헤더 지정해 본문 img 태그와 연결."\r
    runtime:\r
      - label: "pandas + matplotlib"\r
        detail: "Codaro 로컬에 이미 설치된 표준 데이터 도구."\r
      - label: "검증"\r
        detail: "메시지 multipart 구조와 인라인 이미지 cid 헤더 단위 assert."\r
\r
sections:\r
  - id: step1_html_table\r
    title: "1단계. DataFrame을 HTML 표로"\r
    structuredPrimary: true\r
    subtitle: "df.to_html(index=False, border=1)"\r
    goal: "pandas DataFrame을 HTML 표 문자열로 변환한다."\r
    why: "DataFrame.to_html은 메일 본문에 표를 직접 넣는 가장 빠른 방법입니다. 별도 템플릿 엔진 없이 표가 완성됩니다."\r
    explanation: |-\r
      df.to_html(index=False)는 <table> ... </table> 문자열을 돌려줍니다. border=1로 가시 선 추가, classes='dataframe' 같은 인자로 CSS 클래스도 지정 가능합니다.\r
    tips:\r
      - "to_html은 안 예쁘게 나옵니다. 이메일 본문엔 충분하지만, 메일 클라이언트별 렌더링 차이가 있습니다. 인라인 style 권장."\r
    snippet: |-\r
      import pandas as pd\r
\r
      df = pd.DataFrame({\r
          "region": ["Seoul", "Busan", "Daegu"],\r
          "amount": [120000, 80000, 60000],\r
      })\r
      html = df.to_html(index=False, border=1)\r
      "Seoul" in html and "<table" in html\r
    exercise:\r
      prompt: "Incheon 행을 추가하고 to_html에 'Incheon'이 들어가는지 확인하세요."\r
      starterCode: |-\r
        import pandas as pd\r
\r
        df = pd.DataFrame({\r
            "region": ["Seoul", "Busan", "Daegu", ___],\r
            "amount": [120000, 80000, 60000, ___],\r
        })\r
        html = df.to_html(index=False)\r
        "Incheon" in html\r
      hints:\r
        - "문자열 'Incheon', 정수 55000."\r
    check:\r
      noError: "리스트 길이가 같아야 합니다."\r
      resultCheck: "True 출력."\r
\r
  - id: step2_matplotlib_png\r
    title: "2단계. matplotlib 차트 PNG 저장"\r
    structuredPrimary: true\r
    subtitle: "fig.savefig + tempfile"\r
    goal: "matplotlib 막대 차트를 임시 PNG 파일로 저장한다."\r
    why: "차트 이미지가 본문에 보이는 메일은 한눈에 핵심을 전달합니다. matplotlib 한 줄로 png가 만들어집니다."\r
    explanation: |-\r
      fig, ax = plt.subplots(); ax.bar(x, y); fig.savefig(path) 패턴. 본 강의에서는 임시 폴더에 저장해 메일 첨부로 사용합니다.\r
    tips:\r
      - "fig.savefig 후 plt.close(fig)로 메모리 해제 권장. 대량 차트 생성 시 메모리 누수 방지."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import matplotlib\r
      matplotlib.use("Agg")\r
      import matplotlib.pyplot as plt\r
\r
      workdir = TemporaryDirectory()\r
      pngPath = Path(workdir.name) / "chart.png"\r
      fig, ax = plt.subplots(figsize=(6, 4))\r
      ax.bar(["Seoul", "Busan", "Daegu"], [120000, 80000, 60000])\r
      ax.set_title("Daily Sales")\r
      fig.savefig(pngPath, bbox_inches="tight")\r
      plt.close(fig)\r
      pngPath.stat().st_size > 0\r
    exercise:\r
      prompt: "ax.set_ylabel('amount (KRW)')를 추가하고 png 크기가 양수인지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import matplotlib\r
        matplotlib.use("Agg")\r
        import matplotlib.pyplot as plt\r
\r
        workdir = TemporaryDirectory()\r
        pngPath = Path(workdir.name) / "chart.png"\r
        fig, ax = plt.subplots(figsize=(6, 4))\r
        ax.bar(["Seoul", "Busan", "Daegu"], [120000, 80000, 60000])\r
        ax.set_title("Daily Sales")\r
        ax.set_ylabel(___)\r
        fig.savefig(pngPath, bbox_inches="tight")\r
        plt.close(fig)\r
        pngPath.stat().st_size > 0\r
      hints:\r
        - "문자열 'amount (KRW)'."\r
    check:\r
      noError: "set_ylabel 인자는 문자열."\r
      resultCheck: "True 출력."\r
\r
  - id: step3_inline_image\r
    title: "3단계. Content-ID 인라인 이미지 첨부"\r
    structuredPrimary: true\r
    subtitle: "add_attachment + cid 헤더"\r
    goal: "PNG를 본문에 인라인 표시되도록 cid로 첨부하고 HTML img 태그와 연결한다."\r
    why: "첨부로 따로 받지 않고 본문에서 바로 보이는 차트는 가독성이 훨씬 높습니다. cid 헤더가 본문 img 태그와 첨부를 연결합니다."\r
    explanation: |-\r
      add_attachment(pngBytes, maintype='image', subtype='png', cid='<chart>')로 첨부에 Content-ID를 지정. 본문 HTML의 <img src='cid:chart'>가 이 첨부를 참조합니다.\r
    tips:\r
      - "cid 값은 '<>' 안에 넣어 지정. 본문 src에서는 cid: 접두만 사용."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from email.message import EmailMessage\r
      import matplotlib\r
      matplotlib.use("Agg")\r
      import matplotlib.pyplot as plt\r
\r
      workdir = TemporaryDirectory()\r
      pngPath = Path(workdir.name) / "c.png"\r
      fig, ax = plt.subplots()\r
      ax.bar(["a", "b"], [1, 2])\r
      fig.savefig(pngPath)\r
      plt.close(fig)\r
\r
      msg = EmailMessage()\r
      msg["From"] = "me@example.com"\r
      msg["To"] = "you@example.com"\r
      msg["Subject"] = "Inline chart"\r
      msg.set_content("text fallback", charset="utf-8")\r
      msg.add_alternative(\r
          '<p>Today chart:</p><img src="cid:chart">',\r
          subtype="html",\r
      )\r
      msg.add_attachment(\r
          pngPath.read_bytes(),\r
          maintype="image",\r
          subtype="png",\r
          cid="<chart>",\r
      )\r
\r
      [(p.get_content_type(), p.get("Content-ID")) for p in msg.iter_parts() if p.get("Content-ID")]\r
    exercise:\r
      prompt: "attachInlineChart(msg, pngPath, cidName) 함수를 직접 작성하세요. HTML 본문을 add_alternative로 추가하고 같은 cidName으로 PNG를 add_attachment해야 합니다. cid 헤더는 항상 '<...>' 형식이 필요한 점이 함정입니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from email.message import EmailMessage\r
        import matplotlib\r
        matplotlib.use("Agg")\r
        import matplotlib.pyplot as plt\r
\r
        workdir = TemporaryDirectory()\r
        pngPath = Path(workdir.name) / "c.png"\r
        fig, ax = plt.subplots()\r
        ax.bar(["a", "b"], [1, 2])\r
        fig.savefig(pngPath)\r
        plt.close(fig)\r
\r
        msg = EmailMessage()\r
        msg["From"] = "me@example.com"\r
        msg["To"] = "you@example.com"\r
        msg["Subject"] = "Chart"\r
        msg.set_content("text", charset="utf-8")\r
\r
        def attachInlineChart(msg, pngPath, cidName):\r
            msg.add_alternative(___, subtype="html")\r
            msg.add_attachment(Path(pngPath).read_bytes(), maintype="image", subtype="png", cid=___)\r
\r
        attachInlineChart(msg, pngPath, "daily-chart")\r
        any("daily-chart" in (p.get("Content-ID") or "") for p in msg.iter_parts())\r
      hints:\r
        - "HTML: f'<img src=\\"cid:{cidName}\\">'. cid 인자: f'<{cidName}>'."\r
    check:\r
      noError: "cid는 '<>' 안에."\r
      resultCheck: "True 출력."\r
\r
  - id: validation\r
    title: "4단계. 검증 루프 - 표 + 차트 일일 메일 통합 assert"\r
    structuredPrimary: true\r
    subtitle: "HTML 본문 + 첨부 cid + 첨부 수"\r
    goal: "buildDailyReport 함수가 만든 메시지의 HTML 표·인라인 이미지·첨부 수를 한 셀에서 검증한다."\r
    why: "운영팀의 일일 보고 메일은 매일 같은 형태로 나가야 합니다. 한 묶음 assert가 회귀를 사전에 잡습니다."\r
    explanation: |-\r
      buildDailyReport(toAddr, df, chartPath)이 표 HTML + cid 인라인 이미지 + (선택) 추가 첨부를 한 메시지로 묶고, 결과의 multipart 구조와 cid 헤더를 검증합니다.\r
    tips:\r
      - "to_html에 escape=False를 주면 데이터 안의 HTML이 그대로 들어가니 주의. 신뢰 데이터에만 사용."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from email.message import EmailMessage\r
      import matplotlib\r
      matplotlib.use("Agg")\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      def buildDailyReport(toAddr, df, chartPath):\r
          msg = EmailMessage()\r
          msg["From"] = "me@example.com"\r
          msg["To"] = toAddr\r
          msg["Subject"] = "Daily Sales"\r
          msg.set_content("HTML 미지원 클라이언트용 본문", charset="utf-8")\r
          tableHtml = df.to_html(index=False, border=1)\r
          msg.add_alternative(\r
              f'<h2>Daily Sales</h2>{tableHtml}<p><img src="cid:chart"></p>',\r
              subtype="html",\r
          )\r
          msg.add_attachment(\r
              Path(chartPath).read_bytes(),\r
              maintype="image",\r
              subtype="png",\r
              cid="<chart>",\r
          )\r
          return msg\r
\r
      vault = TemporaryDirectory()\r
      pngPath = Path(vault.name) / "chart.png"\r
      fig, ax = plt.subplots()\r
      ax.bar(["Seoul", "Busan"], [120, 80])\r
      fig.savefig(pngPath)\r
      plt.close(fig)\r
\r
      df = pd.DataFrame({"region": ["Seoul", "Busan"], "amount": [120000, 80000]})\r
      msg = buildDailyReport("partner@example.com", df, pngPath)\r
\r
      assert msg.is_multipart()\r
      htmlPart = next(p for p in msg.walk() if p.get_content_type() == "text/html")\r
      assert "Seoul" in htmlPart.get_content()\r
      assert any("chart" in (p.get("Content-ID") or "") for p in msg.iter_parts())\r
      msg["Subject"]\r
    exercise:\r
      prompt: "df에 Daegu 60000 행을 추가하고 HTML 본문에 'Daegu'가 들어가는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from email.message import EmailMessage\r
        import matplotlib\r
        matplotlib.use("Agg")\r
        import matplotlib.pyplot as plt\r
        import pandas as pd\r
\r
        def buildDailyReport(toAddr, df, chartPath):\r
            msg = EmailMessage()\r
            msg["From"] = "me@example.com"\r
            msg["To"] = toAddr\r
            msg["Subject"] = "Daily"\r
            msg.set_content("text", charset="utf-8")\r
            tableHtml = df.to_html(index=False, border=1)\r
            msg.add_alternative(f'<h2>D</h2>{tableHtml}<img src="cid:chart">', subtype="html")\r
            msg.add_attachment(Path(chartPath).read_bytes(), maintype="image", subtype="png", cid="<chart>")\r
            return msg\r
\r
        vault = TemporaryDirectory()\r
        pngPath = Path(vault.name) / "c.png"\r
        fig, ax = plt.subplots()\r
        ax.bar(["a", "b"], [1, 2])\r
        fig.savefig(pngPath)\r
        plt.close(fig)\r
\r
        df = pd.DataFrame({"region": ["Seoul", "Busan", ___], "amount": [120000, 80000, ___]})\r
        msg = buildDailyReport("p@x.com", df, pngPath)\r
        htmlPart = next(p for p in msg.walk() if p.get_content_type() == "text/html")\r
        "Daegu" in htmlPart.get_content()\r
      hints:\r
        - "'Daegu' 문자열, 60000 정수."\r
    check:\r
      noError: "리스트 길이 같아야 합니다."\r
      resultCheck: "True 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "일일 보고서 발송기"\r
    goal: "운영팀 일일 보고서를 직접 작성한다."\r
    why: "운영 김대리가 매일 아침 매출 집계를 엑셀로 정리하고 캡쳐해서 팀장에게 메일 보내던 100분/주 작업이 사라집니다. 표 HTML + 인라인 차트 + (선택) PDF 첨부를 한 함수에 묶으면 데이터만 바꿔 매일 같은 메일을 자동 발송할 수 있고, 본 함수가 10강 주간 발송기의 메일 빌더로 그대로 재사용됩니다."\r
    explanation: |-\r
      미션: dailyReportEmail(toAddr, df, chartPath, dryRun=True) -> EmailMessage. 표 + 차트 + 일일 요약 텍스트.\r
    tips:\r
      - "차트 png는 함수 외부에서 생성. 함수는 png 경로만 받음."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from email.message import EmailMessage\r
      import matplotlib\r
      matplotlib.use("Agg")\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수: dailyReportEmail(toAddr, df, chartPath, dryRun=True)"\r
    check:\r
      noError: "함수 정의 + 검증."\r
      resultCheck: "HTML 본문에 표 + cid 이미지 모두 포함."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 일일 보고서 발송기"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import os\r
              import smtplib\r
              import ssl\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from email.message import EmailMessage\r
              import matplotlib\r
              matplotlib.use("Agg")\r
              import matplotlib.pyplot as plt\r
              import pandas as pd\r
\r
              def dailyReportEmail(toAddr, df, chartPath, dryRun=True):\r
                  msg = EmailMessage()\r
                  msg["From"] = "ops@example.com"\r
                  msg["To"] = toAddr\r
                  msg["Subject"] = "일일 매출 보고"\r
                  msg.set_content("HTML 미지원 클라이언트용 본문 - 표와 차트는 HTML 본문에 포함", charset="utf-8")\r
                  tableHtml = df.to_html(index=False, border=1)\r
                  msg.add_alternative(\r
                      f"<h2>일일 매출</h2>{tableHtml}<p><img src=\\"cid:chart\\"></p>",\r
                      subtype="html",\r
                  )\r
                  msg.add_attachment(\r
                      Path(chartPath).read_bytes(),\r
                      maintype="image",\r
                      subtype="png",\r
                      cid="<chart>",\r
                  )\r
                  if dryRun:\r
                      return msg\r
                  ctx = ssl.create_default_context()\r
                  with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as smtp:\r
                      smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_APP_PASS"])\r
                      smtp.send_message(msg)\r
                  return msg\r
\r
              missionDir = TemporaryDirectory()\r
              pngPath = Path(missionDir.name) / "chart.png"\r
              fig, ax = plt.subplots(figsize=(6, 4))\r
              ax.bar(["Seoul", "Busan", "Daegu"], [120000, 80000, 60000])\r
              fig.savefig(pngPath, bbox_inches="tight")\r
              plt.close(fig)\r
\r
              df = pd.DataFrame({"region": ["Seoul", "Busan", "Daegu"], "amount": [120000, 80000, 60000]})\r
              msg = dailyReportEmail("팀장@example.com", df, pngPath, dryRun=True)\r
\r
              htmlPart = next(p for p in msg.walk() if p.get_content_type() == "text/html")\r
              assert "Seoul" in htmlPart.get_content()\r
              assert any("chart" in (p.get("Content-ID") or "") for p in msg.iter_parts())\r
              msg["Subject"]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "여러 차트(매출 + 비용)를 cid 다르게 두 개 인라인"\r
          - "표 색상 강조 (전일 대비 증감 색깔)"\r
          - "수신자별 다른 데이터 cut (지역장별)"\r
          - "10강 결합 - 일일 보고서 + 주간 보고서 자동 분기 발송"\r
          - "PDF 트랙 10강의 청구서 PDF를 첨부로 추가"\r
`;export{e as default};