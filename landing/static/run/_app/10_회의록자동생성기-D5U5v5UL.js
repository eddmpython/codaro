var e=`meta:\r
  id: word_10\r
  title: 회의록 자동 생성기\r
  order: 10\r
  category: word\r
  difficulty: ⭐⭐⭐⭐⭐\r
  badge: 심화\r
  packages:\r
    - python-docx\r
    - docxtpl\r
  tags:\r
    - 종합프로젝트\r
    - 회의록\r
    - JSON 기반\r
  outcomes:\r
    - automation.word.report\r
  prerequisites:\r
    - automation.word.tables\r
    - automation.word.media\r
    - automation.word.styles\r
    - automation.word.template\r
  estimatedMinutes: 90\r
  seo:\r
    title: "회의록 자동 생성기 - 회의 메모 JSON → 양식 회의록 docx"\r
    description: "Word 트랙 모든 패턴을 한 함수에 결합. 회의 메모 JSON에서 표·머리말·서명란 회의록 docx 자동 생성."\r
    keywords:\r
      - 회의록 자동\r
      - 한국 회의록 양식\r
      - JSON to docx\r
\r
intro:\r
  direction: "01-09강 모든 패턴을 한 사이클에 묶는다. 회의 메모(JSON)에서 한국 컨설팅 회의록 양식 docx를 한 함수 호출로 생성."\r
  benefits:\r
    - "컨설팅 이대표의 매주 회의록 40분이 8초로 줄어든다."\r
    - "Heading + 표(참석자) + 본문(결정사항) + 머리말(회사) + 서명란이 모두 한 함수에."\r
    - "Email 트랙 03강과 결합 시 회의록이 즉시 참석자에게 자동 발송."\r
  diagram:\r
    steps:\r
      - label: "1. 데이터 모델"\r
        detail: "회의록 JSON: 일시·장소·참석자·안건·결정사항·액션."\r
      - label: "2. 양식 함수"\r
        detail: "Codaro 양식 스타일 + 표 + 본문 + 머리말 결합."\r
      - label: "3. 일괄 생성"\r
        detail: "여러 회의록 메모 → 폴더에 N개 docx."\r
      - label: "4. PDF 변환 안내"\r
        detail: "LibreOffice headless 명령 한 줄 안내 (트랙 범위 밖)."\r
    runtime:\r
      - label: "전 강의 패턴 통합"\r
        detail: "03강 East Asian font, 04강 표, 05강 머리말, 06강 스타일, 09강 docxtpl 옵션."\r
      - label: "검증"\r
        detail: "결과 docx의 단락·표·머리말 단위 assert."\r
\r
sections:\r
  - id: step1_model\r
    title: "1단계. 회의록 데이터 모델"\r
    structuredPrimary: true\r
    subtitle: "JSON 구조"\r
    goal: "회의록 메모 데이터 dict 구조를 정의한다."\r
    why: "자동화의 시작은 데이터 모양을 고정하는 것입니다. 한 회의록 = 한 dict."\r
    snippet: |-\r
      meetingNote = {\r
          "title": "Codaro 주간 동기화",\r
          "date": "2026-05-28",\r
          "location": "회의실 A",\r
          "attendees": [\r
              {"name": "김대리", "role": "기획"},\r
              {"name": "박과장", "role": "개발"},\r
              {"name": "이팀장", "role": "리드"},\r
          ],\r
          "agenda": [\r
              "1Q 매출 리뷰",\r
              "신기능 출시 일정",\r
              "다음 분기 계획",\r
          ],\r
          "decisions": [\r
              "신기능은 5월 31일 출시",\r
              "마케팅 캠페인 6월 1일 시작",\r
          ],\r
          "actions": [\r
              {"who": "김대리", "what": "PRD 작성", "due": "2026-05-30"},\r
              {"who": "박과장", "what": "QA 진행", "due": "2026-05-31"},\r
          ],\r
      }\r
      meetingNote["title"], len(meetingNote["attendees"])\r
    exercise:\r
      prompt: "attendees에 한 명 더 추가하고 길이가 4인지 확인하세요."\r
      starterCode: |-\r
        meetingNote = {\r
            "title": "주간",\r
            "attendees": [\r
                {"name": "김대리", "role": "기획"},\r
                {"name": "박과장", "role": "개발"},\r
                {"name": "이팀장", "role": "리드"},\r
                ___,\r
            ],\r
        }\r
        len(meetingNote["attendees"])\r
      hints:\r
        - "dict 한 개. 예: {'name': '윤주임', 'role': '디자인'}."\r
    check:\r
      noError: "리스트 원소는 dict."\r
      resultCheck: "출력 4."\r
\r
  - id: step2_builder\r
    title: "2단계. 회의록 docx 빌더"\r
    structuredPrimary: true\r
    subtitle: "양식 스타일 + 표 + 본문 결합"\r
    goal: "회의록 dict → docx 함수를 만든다."\r
    why: "본 강의의 핵심 함수. 컨설팅 이대표가 그대로 가져갈 수 있는 도구."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
      from docx.enum.style import WD_STYLE_TYPE\r
      from docx.oxml.ns import qn\r
      from docx.shared import Inches, Pt\r
\r
      def applyCodaroStyles(doc):\r
          for name, size, bold in [("CodaroBody", 11, False), ("CodaroHeading", 14, True)]:\r
              if name in doc.styles:\r
                  continue\r
              style = doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)\r
              style.font.name = "맑은 고딕"\r
              style.font.size = Pt(size)\r
              style.font.bold = bold\r
              style.element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")\r
          for side in ("top_margin", "bottom_margin", "left_margin", "right_margin"):\r
              setattr(doc.sections[0], side, Inches(0.8))\r
          return doc\r
\r
      def buildMinutes(path, note):\r
          doc = Document()\r
          applyCodaroStyles(doc)\r
          doc.sections[0].header.paragraphs[0].text = "주식회사 Codaro"\r
\r
          doc.add_heading(note["title"], level=0)\r
          doc.add_paragraph(f"일시: {note['date']}, 장소: {note['location']}", style="CodaroBody")\r
\r
          doc.add_heading("참석자", level=1)\r
          attendeesTable = doc.add_table(rows=len(note["attendees"]) + 1, cols=2, style="Table Grid")\r
          attendeesTable.cell(0, 0).text = "성명"\r
          attendeesTable.cell(0, 1).text = "역할"\r
          for idx, attendee in enumerate(note["attendees"], start=1):\r
              attendeesTable.cell(idx, 0).text = attendee["name"]\r
              attendeesTable.cell(idx, 1).text = attendee["role"]\r
\r
          doc.add_heading("안건", level=1)\r
          for item in note["agenda"]:\r
              doc.add_paragraph(item, style="List Number")\r
\r
          doc.add_heading("결정 사항", level=1)\r
          for decision in note["decisions"]:\r
              doc.add_paragraph(decision, style="List Bullet")\r
\r
          doc.add_heading("액션 아이템", level=1)\r
          actionTable = doc.add_table(rows=len(note["actions"]) + 1, cols=3, style="Table Grid")\r
          for colIdx, header in enumerate(["담당", "내용", "마감"]):\r
              actionTable.cell(0, colIdx).text = header\r
          for idx, action in enumerate(note["actions"], start=1):\r
              actionTable.cell(idx, 0).text = action["who"]\r
              actionTable.cell(idx, 1).text = action["what"]\r
              actionTable.cell(idx, 2).text = action["due"]\r
\r
          doc.add_heading("서명", level=1)\r
          doc.add_paragraph("작성자: ____________  검토자: ____________", style="CodaroBody")\r
\r
          doc.save(path)\r
          return path\r
\r
      workdir = TemporaryDirectory()\r
      docxPath = Path(workdir.name) / "minutes.docx"\r
      buildMinutes(docxPath, {\r
          "title": "주간 동기화",\r
          "date": "2026-05-28",\r
          "location": "회의실 A",\r
          "attendees": [{"name": "김대리", "role": "기획"}, {"name": "박과장", "role": "개발"}],\r
          "agenda": ["1. 매출", "2. 일정"],\r
          "decisions": ["5월 31일 출시"],\r
          "actions": [{"who": "김대리", "what": "PRD", "due": "2026-05-30"}],\r
      })\r
      reopened = Document(docxPath)\r
      reopened.paragraphs[0].text, len(reopened.tables)\r
    exercise:\r
      prompt: "buildMinutes에 한 액션 더 추가하고 actions 표 행 수가 3인지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
        from docx.enum.style import WD_STYLE_TYPE\r
        from docx.oxml.ns import qn\r
        from docx.shared import Inches, Pt\r
\r
        def applyCodaroStyles(doc):\r
            for name, size, bold in [("CodaroBody", 11, False), ("CodaroHeading", 14, True)]:\r
                if name in doc.styles:\r
                    continue\r
                style = doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)\r
                style.font.name = "맑은 고딕"\r
                style.font.size = Pt(size)\r
                style.font.bold = bold\r
                style.element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")\r
            return doc\r
\r
        def buildMinutes(path, note):\r
            doc = Document()\r
            applyCodaroStyles(doc)\r
            doc.add_heading(note["title"], level=0)\r
            actionTable = doc.add_table(rows=len(note["actions"]) + 1, cols=3, style="Table Grid")\r
            for colIdx, header in enumerate(["담당", "내용", "마감"]):\r
                actionTable.cell(0, colIdx).text = header\r
            for idx, action in enumerate(note["actions"], start=1):\r
                actionTable.cell(idx, 0).text = action["who"]\r
                actionTable.cell(idx, 1).text = action["what"]\r
                actionTable.cell(idx, 2).text = action["due"]\r
            doc.save(path)\r
\r
        workdir = TemporaryDirectory()\r
        docxPath = Path(workdir.name) / "m.docx"\r
        buildMinutes(docxPath, {\r
            "title": "주간",\r
            "actions": [\r
                {"who": "김대리", "what": "PRD", "due": "2026-05-30"},\r
                ___,\r
            ],\r
        })\r
        len(Document(docxPath).tables[0].rows)\r
      hints:\r
        - "dict {'who': '박과장', 'what': 'QA', 'due': '2026-05-31'}."\r
    check:\r
      noError: "리스트 원소는 dict."\r
      resultCheck: "출력 3."\r
\r
  - id: validation\r
    title: "3단계. 검증 - 회의록 통합 검증"\r
    structuredPrimary: true\r
    subtitle: "단락 + 표 + 머리말 일괄 assert"\r
    goal: "buildMinutes 결과의 모든 요소를 한 셀에서 검증."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
      from docx.enum.style import WD_STYLE_TYPE\r
      from docx.oxml.ns import qn\r
      from docx.shared import Inches, Pt\r
\r
      def applyCodaroStyles(doc):\r
          for name, size, bold in [("CodaroBody", 11, False), ("CodaroHeading", 14, True)]:\r
              if name in doc.styles:\r
                  continue\r
              style = doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)\r
              style.font.name = "맑은 고딕"\r
              style.font.size = Pt(size)\r
              style.font.bold = bold\r
              style.element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")\r
          for side in ("top_margin", "bottom_margin", "left_margin", "right_margin"):\r
              setattr(doc.sections[0], side, Inches(0.8))\r
          return doc\r
\r
      def buildMinutes(path, note):\r
          doc = Document()\r
          applyCodaroStyles(doc)\r
          doc.sections[0].header.paragraphs[0].text = note.get("company", "Codaro")\r
          doc.add_heading(note["title"], level=0)\r
          doc.add_paragraph(f"일시: {note['date']}, 장소: {note['location']}", style="CodaroBody")\r
          doc.add_heading("참석자", level=1)\r
          tbl = doc.add_table(rows=len(note["attendees"]) + 1, cols=2, style="Table Grid")\r
          tbl.cell(0, 0).text = "성명"\r
          tbl.cell(0, 1).text = "역할"\r
          for idx, attendee in enumerate(note["attendees"], start=1):\r
              tbl.cell(idx, 0).text = attendee["name"]\r
              tbl.cell(idx, 1).text = attendee["role"]\r
          doc.add_heading("결정 사항", level=1)\r
          for decision in note["decisions"]:\r
              doc.add_paragraph(decision, style="List Bullet")\r
          doc.save(path)\r
          return path\r
\r
      vault = TemporaryDirectory()\r
      docxPath = Path(vault.name) / "v.docx"\r
      buildMinutes(docxPath, {\r
          "company": "주식회사 Codaro",\r
          "title": "주간 동기화",\r
          "date": "2026-05-28",\r
          "location": "회의실 A",\r
          "attendees": [{"name": "김대리", "role": "기획"}, {"name": "박과장", "role": "개발"}],\r
          "decisions": ["신기능 5월 31일 출시", "마케팅 6월 1일"],\r
      })\r
\r
      reopened = Document(docxPath)\r
      assert reopened.sections[0].header.paragraphs[0].text == "주식회사 Codaro"\r
      assert reopened.paragraphs[0].text == "주간 동기화"\r
      attendeesTable = reopened.tables[0]\r
      assert attendeesTable.cell(1, 0).text == "김대리"\r
      decisions = [p.text for p in reopened.paragraphs if p.style.name == "List Bullet"]\r
      assert len(decisions) == 2\r
      reopened.paragraphs[0].text, attendeesTable.cell(2, 0).text\r
    exercise:\r
      prompt: "buildMinutes에 액션 아이템 표(3컬럼: 담당/내용/마감)를 추가하는 로직을 작성하세요. 헤더 행 + actions 각 dict를 행으로 채워야 합니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
        from docx.enum.style import WD_STYLE_TYPE\r
        from docx.oxml.ns import qn\r
        from docx.shared import Pt\r
\r
        def applyCodaroStyles(doc):\r
            for name, size, bold in [("CodaroBody", 11, False), ("CodaroHeading", 14, True)]:\r
                if name in doc.styles:\r
                    continue\r
                style = doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)\r
                style.font.name = "맑은 고딕"\r
                style.font.size = Pt(size)\r
                style.font.bold = bold\r
                style.element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")\r
            return doc\r
\r
        def buildMinutes(path, note):\r
            doc = Document()\r
            applyCodaroStyles(doc)\r
            doc.add_heading(note["title"], level=0)\r
            doc.add_heading("액션 아이템", level=1)\r
            actions = note["actions"]\r
            actionTable = doc.add_table(rows=len(actions) + 1, cols=3, style="Table Grid")\r
            for colIdx, header in enumerate(["담당", "내용", "마감"]):\r
                actionTable.cell(0, colIdx).text = header\r
            for idx, action in enumerate(actions, start=1):\r
                ___  # action['who']/['what']/['due']를 각 셀에 채우기 (3줄)\r
            doc.save(path)\r
\r
        vault = TemporaryDirectory()\r
        docxPath = Path(vault.name) / "v.docx"\r
        buildMinutes(docxPath, {\r
            "title": "주간",\r
            "actions": [\r
                {"who": "김대리", "what": "PRD 작성", "due": "2026-05-30"},\r
                {"who": "박과장", "what": "QA 진행", "due": "2026-05-31"},\r
            ],\r
        })\r
        tbl = Document(docxPath).tables[0]\r
        tbl.cell(1, 0).text, tbl.cell(2, 1).text, tbl.cell(2, 2).text\r
      hints:\r
        - "actionTable.cell(idx, 0).text = action['who']"\r
        - "actionTable.cell(idx, 1).text = action['what']"\r
        - "actionTable.cell(idx, 2).text = action['due']"\r
    check:\r
      noError: "세 셀을 모두 채우는 3줄 로직."\r
      resultCheck: "('김대리', 'QA 진행', '2026-05-31') 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "다수 회의록 일괄 생성기"\r
    goal: "여러 회의 메모를 받아 폴더에 N개 회의록 docx를 만든다."\r
    explanation: |-\r
      미션: bulkBuildMinutes(notes, outFolder) -> list[Path]. 회의록 파일명은 'YYYY-MM-DD_제목.docx'.\r
    snippet: |-\r
      from docx import Document\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수: bulkBuildMinutes(notes, outFolder) -> list[Path]"\r
    check:\r
      noError: "함수 정의 + 폴더 생성."\r
      resultCheck: "각 메모마다 docx 1개."\r
    blocks:\r
      - type: tip\r
        content: "본 강의가 Word 트랙의 마지막입니다. 본인 팀의 실제 회의 메모로 함수를 시도해 보세요."\r
      - type: expansion\r
        title: "미션: 다수 회의록"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from docx import Document\r
              from docx.enum.style import WD_STYLE_TYPE\r
              from docx.oxml.ns import qn\r
              from docx.shared import Pt\r
\r
              def applyCodaroStyles(doc):\r
                  for name, size, bold in [("CodaroBody", 11, False), ("CodaroHeading", 14, True)]:\r
                      if name in doc.styles:\r
                          continue\r
                      style = doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)\r
                      style.font.name = "맑은 고딕"\r
                      style.font.size = Pt(size)\r
                      style.font.bold = bold\r
                      style.element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")\r
                  return doc\r
\r
              def buildMinutes(path, note):\r
                  doc = Document()\r
                  applyCodaroStyles(doc)\r
                  doc.add_heading(note["title"], level=0)\r
                  doc.add_paragraph(f"일시: {note['date']}", style="CodaroBody")\r
                  for decision in note.get("decisions", []):\r
                      doc.add_paragraph(decision, style="List Bullet")\r
                  doc.save(path)\r
                  return path\r
\r
              def bulkBuildMinutes(notes, outFolder):\r
                  Path(outFolder).mkdir(exist_ok=True)\r
                  outputs = []\r
                  for note in notes:\r
                      safeTitle = note["title"].replace(" ", "_")\r
                      outPath = Path(outFolder) / f"{note['date']}_{safeTitle}.docx"\r
                      buildMinutes(outPath, note)\r
                      outputs.append(outPath)\r
                  return outputs\r
\r
              missionDir = TemporaryDirectory()\r
              base = Path(missionDir.name)\r
              notes = [\r
                  {"title": "주간 동기화", "date": "2026-05-28", "decisions": ["a", "b"]},\r
                  {"title": "킥오프", "date": "2026-05-29", "decisions": ["c"]},\r
                  {"title": "회고", "date": "2026-05-30", "decisions": ["d", "e"]},\r
              ]\r
              outputs = bulkBuildMinutes(notes, base / "minutes")\r
              assert len(outputs) == 3\r
              for path in outputs:\r
                  doc = Document(path)\r
                  assert len(doc.paragraphs) > 0\r
              [p.name for p in outputs]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: text\r
        content: |-\r
          본 트랙의 마무리 강의 응용 아이디어입니다. 한 가지를 골라 본인 업무에 적용해 보세요.\r
      - type: list\r
        style: bullet\r
        items:\r
          - "Email 트랙 03강과 결합 - 회의록 docx를 참석자에게 자동 발송"\r
          - "PDF 변환 (\`soffice --headless --convert-to pdf minutes.docx\`)"\r
          - "회의록 → 캘린더 ics (다음 회의 일정 자동)"\r
          - "회의록에서 액션 아이템만 추출해 별도 docx (todo 목록)"\r
          - "회의 녹음 → llmBasics로 자동 메모 → 본 함수에 dict 주입"\r
`;export{e as default};