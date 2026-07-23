var e=`meta:
  id: email_04
  title: 표와 차트가 들어간 일일 메일
  order: 4
  category: email
  difficulty: ⭐⭐
  badge: 기초
  packages:
    - pandas
    - matplotlib
  tags:
    - DataFrame.to_html
    - Content-ID
    - inline image
  outcomes:
    - automation.email.attachments
  prerequisites:
    - automation.email.attachments
  estimatedMinutes: 50
  seo:
    title: "표와 차트가 들어간 일일 메일 - DataFrame.to_html + 인라인 이미지"
    description: "운영팀 일일 보고 메일을 DataFrame.to_html 표 + matplotlib png 인라인 이미지로 자동화. 100분/주 작업이 10초로 줄어든다."
    keywords:
      - DataFrame to_html
      - Content-ID inline
      - matplotlib png 첨부

intro:
  direction: "매일 운영 데이터를 표와 차트가 들어간 HTML 메일로 자동 발송한다. 일일 20분 × 5일 = 100분/주가 10초로 줄어든다."
  benefits:
    - "운영 김대리의 매일 아침 매출 보고 메일을 100분/주에서 10초로 단축."
    - "pandas DataFrame.to_html로 표를 HTML 본문에 직접 삽입."
    - "matplotlib png를 Content-ID 인라인 이미지로 본문 안에 표시."
  diagram:
    steps:
      - label: "1. DataFrame을 HTML 표로"
        detail: "df.to_html(index=False)로 표 HTML 문자열 생성."
      - label: "2. matplotlib png 생성"
        detail: "fig.savefig로 차트 PNG를 임시 파일에."
      - label: "3. HTML 본문 합성"
        detail: "표 HTML + <img src='cid:chart'> 태그."
      - label: "4. Content-ID 첨부"
        detail: "add_attachment에 cid 헤더 지정해 본문 img 태그와 연결."
    runtime:
      - label: "pandas + matplotlib"
        detail: "Codaro 로컬에 이미 설치된 표준 데이터 도구."
      - label: "검증"
        detail: "메시지 multipart 구조와 인라인 이미지 cid 헤더 단위 assert."

sections:
  - id: step1_html_table
    title: "1단계. DataFrame을 HTML 표로"
    structuredPrimary: true
    subtitle: "df.to_html(index=False, border=1)"
    goal: "pandas DataFrame을 HTML 표 문자열로 변환한다."
    why: "DataFrame.to_html은 메일 본문에 표를 직접 넣는 가장 빠른 방법입니다. 별도 템플릿 엔진 없이 표가 완성됩니다."
    explanation: |-
      df.to_html(index=False)는 <table> ... </table> 문자열을 돌려줍니다. border=1로 가시 선 추가, classes='dataframe' 같은 인자로 CSS 클래스도 지정 가능합니다.
    tips:
      - "to_html은 안 예쁘게 나옵니다. 이메일 본문엔 충분하지만, 메일 클라이언트별 렌더링 차이가 있습니다. 인라인 style 권장."
    snippet: |-
      import pandas as pd

      df = pd.DataFrame({
          "region": ["Seoul", "Busan", "Daegu"],
          "amount": [120000, 80000, 60000],
      })
      html = df.to_html(index=False, border=1)
      "Seoul" in html and "<table" in html
    exercise:
      prompt: "Incheon 행을 추가하고 to_html에 'Incheon'이 들어가는지 확인하세요."
      starterCode: |-
        import pandas as pd

        df = pd.DataFrame({
            "region": ["Seoul", "Busan", "Daegu", ___],
            "amount": [120000, 80000, 60000, ___],
        })
        html = df.to_html(index=False)
        "Incheon" in html
      hints:
        - "문자열 'Incheon', 정수 55000."
    check:
      noError: "리스트 길이가 같아야 합니다."
      resultCheck: "True 출력."

  - id: step2_matplotlib_png
    title: "2단계. matplotlib 차트 PNG 저장"
    structuredPrimary: true
    subtitle: "fig.savefig + tempfile"
    goal: "matplotlib 막대 차트를 임시 PNG 파일로 저장한다."
    why: "차트 이미지가 본문에 보이는 메일은 한눈에 핵심을 전달합니다. matplotlib 한 줄로 png가 만들어집니다."
    explanation: |-
      fig, ax = plt.subplots(); ax.bar(x, y); fig.savefig(path) 패턴. 본 강의에서는 임시 폴더에 저장해 메일 첨부로 사용합니다.
    tips:
      - "fig.savefig 후 plt.close(fig)로 메모리 해제 권장. 대량 차트 생성 시 메모리 누수 방지."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      import matplotlib
      matplotlib.use("Agg")
      import matplotlib.pyplot as plt

      workdir = TemporaryDirectory()
      pngPath = Path(workdir.name) / "chart.png"
      fig, ax = plt.subplots(figsize=(6, 4))
      ax.bar(["Seoul", "Busan", "Daegu"], [120000, 80000, 60000])
      ax.set_title("Daily Sales")
      fig.savefig(pngPath, bbox_inches="tight")
      plt.close(fig)
      pngPath.stat().st_size > 0
    exercise:
      prompt: "ax.set_ylabel('amount (KRW)')를 추가하고 png 크기가 양수인지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        workdir = TemporaryDirectory()
        pngPath = Path(workdir.name) / "chart.png"
        fig, ax = plt.subplots(figsize=(6, 4))
        ax.bar(["Seoul", "Busan", "Daegu"], [120000, 80000, 60000])
        ax.set_title("Daily Sales")
        ax.set_ylabel(___)
        fig.savefig(pngPath, bbox_inches="tight")
        plt.close(fig)
        pngPath.stat().st_size > 0
      hints:
        - "문자열 'amount (KRW)'."
    check:
      noError: "set_ylabel 인자는 문자열."
      resultCheck: "True 출력."

  - id: step3_inline_image
    title: "3단계. Content-ID 인라인 이미지 첨부"
    structuredPrimary: true
    subtitle: "add_attachment + cid 헤더"
    goal: "PNG를 본문에 인라인 표시되도록 cid로 첨부하고 HTML img 태그와 연결한다."
    why: "첨부로 따로 받지 않고 본문에서 바로 보이는 차트는 가독성이 훨씬 높습니다. cid 헤더가 본문 img 태그와 첨부를 연결합니다."
    explanation: |-
      add_attachment(pngBytes, maintype='image', subtype='png', cid='<chart>')로 첨부에 Content-ID를 지정. 본문 HTML의 <img src='cid:chart'>가 이 첨부를 참조합니다.
    tips:
      - "cid 값은 '<>' 안에 넣어 지정. 본문 src에서는 cid: 접두만 사용."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from email.message import EmailMessage
      import matplotlib
      matplotlib.use("Agg")
      import matplotlib.pyplot as plt

      workdir = TemporaryDirectory()
      pngPath = Path(workdir.name) / "c.png"
      fig, ax = plt.subplots()
      ax.bar(["a", "b"], [1, 2])
      fig.savefig(pngPath)
      plt.close(fig)

      msg = EmailMessage()
      msg["From"] = "me@example.com"
      msg["To"] = "you@example.com"
      msg["Subject"] = "Inline chart"
      msg.set_content("text fallback", charset="utf-8")
      msg.add_alternative(
          '<p>Today chart:</p><img src="cid:chart">',
          subtype="html",
      )
      msg.add_attachment(
          pngPath.read_bytes(),
          maintype="image",
          subtype="png",
          cid="<chart>",
      )

      [(p.get_content_type(), p.get("Content-ID")) for p in msg.iter_parts() if p.get("Content-ID")]
    exercise:
      prompt: "attachInlineChart(msg, pngPath, cidName) 함수를 직접 작성하세요. HTML 본문을 add_alternative로 추가하고 같은 cidName으로 PNG를 add_attachment해야 합니다. cid 헤더는 항상 '<...>' 형식이 필요한 점이 함정입니다."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from email.message import EmailMessage
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        workdir = TemporaryDirectory()
        pngPath = Path(workdir.name) / "c.png"
        fig, ax = plt.subplots()
        ax.bar(["a", "b"], [1, 2])
        fig.savefig(pngPath)
        plt.close(fig)

        msg = EmailMessage()
        msg["From"] = "me@example.com"
        msg["To"] = "you@example.com"
        msg["Subject"] = "Chart"
        msg.set_content("text", charset="utf-8")

        def attachInlineChart(msg, pngPath, cidName):
            msg.add_alternative(___, subtype="html")
            msg.add_attachment(Path(pngPath).read_bytes(), maintype="image", subtype="png", cid=___)

        attachInlineChart(msg, pngPath, "daily-chart")
        any("daily-chart" in (p.get("Content-ID") or "") for p in msg.iter_parts())
      hints:
        - "HTML: f'<img src=\\"cid:{cidName}\\">'. cid 인자: f'<{cidName}>'."
    check:
      noError: "cid는 '<>' 안에."
      resultCheck: "True 출력."

  - id: validation
    title: "4단계. 검증 루프 - 표 + 차트 일일 메일 통합 assert"
    structuredPrimary: true
    subtitle: "HTML 본문 + 첨부 cid + 첨부 수"
    goal: "buildDailyReport 함수가 만든 메시지의 HTML 표·인라인 이미지·첨부 수를 한 셀에서 검증한다."
    why: "운영팀의 일일 보고 메일은 매일 같은 형태로 나가야 합니다. 한 묶음 assert가 회귀를 사전에 잡습니다."
    explanation: |-
      buildDailyReport(toAddr, df, chartPath)이 표 HTML + cid 인라인 이미지 + (선택) 추가 첨부를 한 메시지로 묶고, 결과의 multipart 구조와 cid 헤더를 검증합니다.
    tips:
      - "to_html에 escape=False를 주면 데이터 안의 HTML이 그대로 들어가니 주의. 신뢰 데이터에만 사용."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from email.message import EmailMessage
      import matplotlib
      matplotlib.use("Agg")
      import matplotlib.pyplot as plt
      import pandas as pd

      def buildDailyReport(toAddr, df, chartPath):
          msg = EmailMessage()
          msg["From"] = "me@example.com"
          msg["To"] = toAddr
          msg["Subject"] = "Daily Sales"
          msg.set_content("HTML 미지원 클라이언트용 본문", charset="utf-8")
          tableHtml = df.to_html(index=False, border=1)
          msg.add_alternative(
              f'<h2>Daily Sales</h2>{tableHtml}<p><img src="cid:chart"></p>',
              subtype="html",
          )
          msg.add_attachment(
              Path(chartPath).read_bytes(),
              maintype="image",
              subtype="png",
              cid="<chart>",
          )
          return msg

      vault = TemporaryDirectory()
      pngPath = Path(vault.name) / "chart.png"
      fig, ax = plt.subplots()
      ax.bar(["Seoul", "Busan"], [120, 80])
      fig.savefig(pngPath)
      plt.close(fig)

      df = pd.DataFrame({"region": ["Seoul", "Busan"], "amount": [120000, 80000]})
      msg = buildDailyReport("partner@example.com", df, pngPath)

      assert msg.is_multipart()
      htmlPart = next(p for p in msg.walk() if p.get_content_type() == "text/html")
      assert "Seoul" in htmlPart.get_content()
      assert any("chart" in (p.get("Content-ID") or "") for p in msg.iter_parts())
      msg["Subject"]
    exercise:
      prompt: "df에 Daegu 60000 행을 추가하고 HTML 본문에 'Daegu'가 들어가는지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from email.message import EmailMessage
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        import pandas as pd

        def buildDailyReport(toAddr, df, chartPath):
            msg = EmailMessage()
            msg["From"] = "me@example.com"
            msg["To"] = toAddr
            msg["Subject"] = "Daily"
            msg.set_content("text", charset="utf-8")
            tableHtml = df.to_html(index=False, border=1)
            msg.add_alternative(f'<h2>D</h2>{tableHtml}<img src="cid:chart">', subtype="html")
            msg.add_attachment(Path(chartPath).read_bytes(), maintype="image", subtype="png", cid="<chart>")
            return msg

        vault = TemporaryDirectory()
        pngPath = Path(vault.name) / "c.png"
        fig, ax = plt.subplots()
        ax.bar(["a", "b"], [1, 2])
        fig.savefig(pngPath)
        plt.close(fig)

        df = pd.DataFrame({"region": ["Seoul", "Busan", ___], "amount": [120000, 80000, ___]})
        msg = buildDailyReport("p@x.com", df, pngPath)
        htmlPart = next(p for p in msg.walk() if p.get_content_type() == "text/html")
        "Daegu" in htmlPart.get_content()
      hints:
        - "'Daegu' 문자열, 60000 정수."
    check:
      noError: "리스트 길이 같아야 합니다."
      resultCheck: "True 출력."

  - id: practice
    title: "실습 - 종합 미션"
    subtitle: "일일 보고서 발송기"
    goal: "운영팀 일일 보고서를 직접 작성한다."
    why: "운영 김대리가 매일 아침 매출 집계를 엑셀로 정리하고 캡쳐해서 팀장에게 메일 보내던 100분/주 작업이 사라집니다. 표 HTML + 인라인 차트 + (선택) PDF 첨부를 한 함수에 묶으면 데이터만 바꿔 매일 같은 메일을 자동 발송할 수 있고, 본 함수가 10강 주간 발송기의 메일 빌더로 그대로 재사용됩니다."
    explanation: |-
      미션: dailyReportEmail(toAddr, df, chartPath, dryRun=True) -> EmailMessage. 표 + 차트 + 일일 요약 텍스트.
    tips:
      - "차트 png는 함수 외부에서 생성. 함수는 png 경로만 받음."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from email.message import EmailMessage
      import matplotlib
      matplotlib.use("Agg")
      import matplotlib.pyplot as plt
      import pandas as pd
    exercise:
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."
      starterCode: |-
        ___
      hints:
        - "함수: dailyReportEmail(toAddr, df, chartPath, dryRun=True)"
    check:
      noError: "함수 정의 + 검증."
      resultCheck: "HTML 본문에 표 + cid 이미지 모두 포함."
    blocks:
      - type: expansion
        title: "미션: 일일 보고서 발송기"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              import os
              import smtplib
              import ssl
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from email.message import EmailMessage
              import matplotlib
              matplotlib.use("Agg")
              import matplotlib.pyplot as plt
              import pandas as pd

              def dailyReportEmail(toAddr, df, chartPath, dryRun=True):
                  msg = EmailMessage()
                  msg["From"] = "ops@example.com"
                  msg["To"] = toAddr
                  msg["Subject"] = "일일 매출 보고"
                  msg.set_content("HTML 미지원 클라이언트용 본문 - 표와 차트는 HTML 본문에 포함", charset="utf-8")
                  tableHtml = df.to_html(index=False, border=1)
                  msg.add_alternative(
                      f"<h2>일일 매출</h2>{tableHtml}<p><img src=\\"cid:chart\\"></p>",
                      subtype="html",
                  )
                  msg.add_attachment(
                      Path(chartPath).read_bytes(),
                      maintype="image",
                      subtype="png",
                      cid="<chart>",
                  )
                  if dryRun:
                      return msg
                  ctx = ssl.create_default_context()
                  with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as smtp:
                      smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_APP_PASS"])
                      smtp.send_message(msg)
                  return msg

              missionDir = TemporaryDirectory()
              pngPath = Path(missionDir.name) / "chart.png"
              fig, ax = plt.subplots(figsize=(6, 4))
              ax.bar(["Seoul", "Busan", "Daegu"], [120000, 80000, 60000])
              fig.savefig(pngPath, bbox_inches="tight")
              plt.close(fig)

              df = pd.DataFrame({"region": ["Seoul", "Busan", "Daegu"], "amount": [120000, 80000, 60000]})
              msg = dailyReportEmail("팀장@example.com", df, pngPath, dryRun=True)

              htmlPart = next(p for p in msg.walk() if p.get_content_type() == "text/html")
              assert "Seoul" in htmlPart.get_content()
              assert any("chart" in (p.get("Content-ID") or "") for p in msg.iter_parts())
              msg["Subject"]

  - id: extensions
    title: "확장 변주"
    blocks:
      - type: list
        style: bullet
        items:
          - "여러 차트(매출 + 비용)를 cid 다르게 두 개 인라인"
          - "표 색상 강조 (전일 대비 증감 색깔)"
          - "수신자별 다른 데이터 cut (지역장별)"
          - "10강 결합 - 일일 보고서 + 주간 보고서 자동 분기 발송"
          - "PDF 트랙 10강의 청구서 PDF를 첨부로 추가"
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
  - id: email_04-inline-report-media-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_html_table
    - extensions
    title: 메일 표·차트 inline media의 content ID·alt text 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: HTML 참조와 MIME content ID, 이미지 설명·크기를 대조한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - HTML \`cid:\` 참조와 MIME content ID를 양방향으로 대조하세요.
    - inline chart에도 alt text와 byte budget을 적용하세요.
    exercise:
      prompt: audit_inline_media(html_refs, media, maximum_bytes)를 완성하세요.
      starterCode: |-
        def audit_inline_media(html_refs, media, maximum_bytes):
            raise NotImplementedError
      solution: |
        def audit_inline_media(html_refs, media, maximum_bytes):
            media_map = {item["contentId"]: item for item in media}
            missing = sorted(set(html_refs) - set(media_map))
            unused = sorted(set(media_map) - set(html_refs))
            invalid = []
            for content_id, item in sorted(media_map.items()):
                reasons = []
                if not item.get("altText"):
                    reasons.append("alt-text")
                if item.get("byteLength", 0) > maximum_bytes:
                    reasons.append("size")
                if not str(item.get("contentType", "")).startswith("image/"):
                    reasons.append("content-type")
                if reasons:
                    invalid.append({"contentId": content_id, "reasons": reasons})
            return {"accepted": not missing and not unused and not invalid, "missing": missing, "unused": unused, "invalid": invalid}
      hints: *id001
    check:
      id: python.email.email_04.inline-report-media.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.email.email_04.inline-report-media.mastery.behavior.v1.fixture
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
        entry: audit_inline_media
        cases:
        - id: accepts-referenced-chart
          arguments:
          - value:
            - chart-1
          - value:
            - contentId: chart-1
              altText: Monthly sales chart
              byteLength: 100
              contentType: image/png
          - value: 1000
          expectedReturn:
            accepted: true
            missing: []
            unused: []
            invalid: []
        - id: reports-missing-and-unused-media
          arguments:
          - value:
            - wanted
          - value:
            - contentId: unused
              altText: x
              byteLength: 1
              contentType: image/png
          - value: 100
          expectedReturn:
            accepted: false
            missing:
            - wanted
            unused:
            - unused
            invalid: []
        - id: reports-invalid-inline-media
          arguments:
          - value:
            - x
          - value:
            - contentId: x
              altText: ''
              byteLength: 200
              contentType: text/plain
          - value: 100
          expectedReturn:
            accepted: false
            missing: []
            unused: []
            invalid:
            - contentId: x
              reasons:
              - alt-text
              - size
              - content-type
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: email_04-email-table-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - email_04-inline-report-media-mastery
    title: 새 HTML 표에 source row reconciliation 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: primary key와 row hash로 메일 표와 원천 데이터를 대조한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 렌더된 표의 행 수만 보지 말고 key·row hash로 원천과 대조하세요.
    - 표와 chart가 같은 source snapshot을 사용하는지 source hash를 공유하세요.
    exercise:
      prompt: reconcile_email_table(source_rows, rendered_rows, key_field)를 완성하세요.
      starterCode: |-
        def reconcile_email_table(source_rows, rendered_rows, key_field):
            raise NotImplementedError
      solution: |
        def reconcile_email_table(source_rows, rendered_rows, key_field):
            source = {row[key_field]: row["rowHash"] for row in source_rows}
            rendered = {row[key_field]: row["rowHash"] for row in rendered_rows}
            missing = sorted(set(source) - set(rendered))
            unexpected = sorted(set(rendered) - set(source))
            changed = sorted(key for key in set(source) & set(rendered) if source[key] != rendered[key])
            return {"passed": not missing and not unexpected and not changed, "missing": missing, "unexpected": unexpected, "changed": changed}
      hints: *id002
    check:
      id: python.email.email_04.email-table-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.email.email_04.email-table-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_email_table
        cases:
        - id: accepts-reordered-table-rows
          arguments:
          - value:
            - id: a
              rowHash: x
            - id: b
              rowHash: y
          - value:
            - id: b
              rowHash: y
            - id: a
              rowHash: x
          - value: id
          expectedReturn:
            passed: true
            missing: []
            unexpected: []
            changed: []
        - id: reports-table-row-drift
          arguments:
          - value:
            - id: a
              rowHash: x
            - id: b
              rowHash: y
          - value:
            - id: a
              rowHash: z
            - id: c
              rowHash: q
          - value: id
          expectedReturn:
            passed: false
            missing:
            - b
            unexpected:
            - c
            changed:
            - a
        - id: handles-empty-table
          arguments:
          - value: []
          - value: []
          - value: id
          expectedReturn:
            passed: true
            missing: []
            unexpected: []
            changed: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: email_04-email-report-media-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - email_04-email-table-reconciliation-transfer
    title: 메일 표·차트 품질 기준 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: table reconciliation·content ID·alt text 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 메일 API 성공과 올바른 수신자·내용·첨부 전달을 분리해 검증하세요.
    - 실제 발송 전 dry run과 idempotency identity, 비밀정보 redaction을 적용하세요.
    exercise:
      prompt: choose_email_report_media(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_email_report_media(situation):
            raise NotImplementedError
      solution: |
        def choose_email_report_media(situation):
            table = {'table': {'action': 'reconcile key and row hash', 'evidence': 'missing unexpected changed rows', 'risk': 'wrong report data'}, 'chart': {'action': 'bind HTML cid to MIME part', 'evidence': 'content ID mapping', 'risk': 'broken inline image'}, 'accessibility': {'action': 'provide alt text and plain summary', 'evidence': 'text alternative', 'risk': 'image-only meaning'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.email.email_04.email-report-media-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.email.email_04.email-report-media-recall.retrieval.behavior.v1.fixture
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
        entry: choose_email_report_media
        cases:
        - id: recalls-table
          arguments:
          - value: table
          expectedReturn:
            action: reconcile key and row hash
            evidence: missing unexpected changed rows
            risk: wrong report data
        - id: recalls-chart
          arguments:
          - value: chart
          expectedReturn:
            action: bind HTML cid to MIME part
            evidence: content ID mapping
            risk: broken inline image
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};