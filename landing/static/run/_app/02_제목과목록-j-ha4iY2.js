var e=`meta:\r
  id: word_02\r
  title: 제목과 목록\r
  order: 2\r
  category: word\r
  difficulty: ⭐\r
  badge: 입문\r
  packages:\r
    - python-docx\r
  tags:\r
    - add_heading\r
    - List Bullet\r
    - List Number\r
  outcomes:\r
    - automation.word.paragraphs\r
  prerequisites:\r
    - automation.word.paragraphs\r
  estimatedMinutes: 35\r
  seo:\r
    title: "Word 제목과 목록 - add_heading + List Bullet/Number"\r
    description: "보고서 목차 골격을 만든다. add_heading 레벨별 제목과 List Bullet/Number 스타일로 정렬된 목록."\r
    keywords:\r
      - python-docx add_heading\r
      - List Bullet\r
      - 목차 골격\r
\r
intro:\r
  direction: "보고서 목차 골격을 코드로 만든다. add_heading 레벨 1-3과 List Bullet/Number 스타일이 한 문서에 결합되는 패턴."\r
  benefits:\r
    - "보고서 목차 자동 생성 - 헤더 + 본문 + 항목 구조를 한 함수 호출로."\r
    - "List Bullet/Number 스타일이 docx 표준 스타일과 일관됨."\r
    - "10강 회의록 자동 생성기의 목차 골격 패턴이 본 강의에서 정착."\r
  diagram:\r
    steps:\r
      - label: "1. add_heading 레벨"\r
        detail: "level 0(제목) ~ 9까지 헤더 단계 지정."\r
      - label: "2. List Bullet/Number"\r
        detail: "add_paragraph(text, style='List Bullet') 또는 'List Number'."\r
      - label: "3. 목차 골격 함수"\r
        detail: "딕셔너리 구조를 받아 헤더 + 항목 묶음 자동 생성."\r
    runtime:\r
      - label: "python-docx 기본 스타일"\r
        detail: "List Bullet, List Number는 미리 정의된 스타일."\r
      - label: "검증"\r
        detail: "paragraphs의 style.name으로 목록 스타일 확인."\r
\r
sections:\r
  - id: step1_heading\r
    title: "1단계. add_heading 레벨"\r
    structuredPrimary: true\r
    subtitle: "doc.add_heading(text, level)"\r
    goal: "제목·소제목·부제목 3 레벨의 헤더가 들어간 문서를 만든다."\r
    why: "보고서 구조의 첫 단계입니다. 레벨이 일관되면 자동 목차 생성도 가능합니다."\r
    explanation: |-\r
      doc.add_heading(text, level=N)은 Heading N 스타일을 적용한 단락 추가. level=0은 Title, 1-9는 Heading 1-9.\r
    tips:\r
      - "Heading 0은 문서 한 번만 사용. level=1부터가 본문 구조의 시작."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
\r
      workdir = TemporaryDirectory()\r
      docxPath = Path(workdir.name) / "headings.docx"\r
\r
      doc = Document()\r
      doc.add_heading("월간 보고서", level=0)\r
      doc.add_heading("1. 매출 현황", level=1)\r
      doc.add_heading("1.1. 지역별", level=2)\r
      doc.add_paragraph("Seoul 1,200,000원")\r
      doc.save(docxPath)\r
\r
      reopened = Document(docxPath)\r
      [(p.text, p.style.name) for p in reopened.paragraphs]\r
    exercise:\r
      prompt: "Heading level 2 한 줄 더 추가('1.2. 분기별')하고 paragraphs가 5개인지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
\r
        workdir = TemporaryDirectory()\r
        docxPath = Path(workdir.name) / "h.docx"\r
\r
        doc = Document()\r
        doc.add_heading("월간 보고서", level=0)\r
        doc.add_heading("1. 매출 현황", level=1)\r
        doc.add_heading("1.1. 지역별", level=2)\r
        doc.add_heading(___, level=2)\r
        doc.add_paragraph("Seoul 1,200,000원")\r
        doc.save(docxPath)\r
\r
        len(Document(docxPath).paragraphs)\r
      hints:\r
        - "문자열 '1.2. 분기별'."\r
    check:\r
      noError: "level은 정수."\r
      resultCheck: "출력 5."\r
\r
  - id: step2_lists\r
    title: "2단계. List Bullet과 List Number"\r
    structuredPrimary: true\r
    subtitle: "style='List Bullet' 또는 'List Number'"\r
    goal: "글머리 기호 목록과 번호 매김 목록을 한 문서에 둔다."\r
    why: "보고서의 행동 항목·결정사항은 거의 항상 목록입니다. 표준 스타일을 쓰면 docx 클라이언트에서 일관되게 보입니다."\r
    explanation: |-\r
      doc.add_paragraph(text, style='List Bullet')은 글머리 기호, style='List Number'는 번호 매김. 같은 스타일을 연속 사용하면 같은 목록으로 그룹화됩니다.\r
    tips:\r
      - "스타일명은 영어. 한글 번들에도 영어 스타일명이 그대로 동작합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
\r
      workdir = TemporaryDirectory()\r
      docxPath = Path(workdir.name) / "lists.docx"\r
\r
      doc = Document()\r
      doc.add_heading("결정 사항", level=1)\r
      doc.add_paragraph("긴급 이슈 우선", style="List Number")\r
      doc.add_paragraph("정기 회의 주 1회", style="List Number")\r
      doc.add_heading("액션 아이템", level=1)\r
      doc.add_paragraph("김대리: 보고서 작성", style="List Bullet")\r
      doc.add_paragraph("박과장: 검토", style="List Bullet")\r
      doc.save(docxPath)\r
\r
      [(p.text, p.style.name) for p in Document(docxPath).paragraphs]\r
    exercise:\r
      prompt: "액션 아이템 목록에 한 줄('이주임: 발송') 더 추가하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
\r
        workdir = TemporaryDirectory()\r
        docxPath = Path(workdir.name) / "l.docx"\r
\r
        doc = Document()\r
        doc.add_heading("결정", level=1)\r
        doc.add_paragraph("a", style="List Number")\r
        doc.add_heading("액션", level=1)\r
        doc.add_paragraph("김대리", style="List Bullet")\r
        doc.add_paragraph(___, style="List Bullet")\r
        doc.save(docxPath)\r
\r
        len(Document(docxPath).paragraphs)\r
      hints:\r
        - "문자열 '이주임: 발송'."\r
    check:\r
      noError: "style 인자는 문자열."\r
      resultCheck: "출력 5."\r
\r
  - id: validation\r
    title: "3단계. 검증 - 목차 골격 통합"\r
    structuredPrimary: true\r
    subtitle: "buildReportSkeleton + 스타일 확인"\r
    goal: "보고서 골격을 만드는 함수 결과의 헤더 레벨과 목록 스타일을 한 셀에서 검증한다."\r
    why: "구조가 정확해야 자동 목차 생성, 후속 단계 가공이 안정적입니다."\r
    explanation: |-\r
      buildReportSkeleton(path, sections)은 sections dict 리스트를 받아 헤더와 항목 목록을 생성. 결과의 style.name이 의도와 같은지 검증.\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
\r
      def buildReportSkeleton(path, sections):\r
          doc = Document()\r
          doc.add_heading("월간 보고서", level=0)\r
          for section in sections:\r
              doc.add_heading(section["title"], level=section.get("level", 1))\r
              for item in section.get("items", []):\r
                  doc.add_paragraph(item, style="List Bullet")\r
          doc.save(path)\r
\r
      vault = TemporaryDirectory()\r
      docxPath = Path(vault.name) / "skel.docx"\r
      buildReportSkeleton(docxPath, [\r
          {"title": "1. 매출", "level": 1, "items": ["Seoul 120만", "Busan 80만"]},\r
          {"title": "2. 비용", "level": 1, "items": ["인건비", "운영비"]},\r
      ])\r
\r
      reopened = Document(docxPath)\r
      assert reopened.paragraphs[0].style.name == "Title"\r
      bullets = [p for p in reopened.paragraphs if p.style.name == "List Bullet"]\r
      assert len(bullets) == 4\r
      [(p.text, p.style.name) for p in reopened.paragraphs]\r
    exercise:\r
      prompt: "buildReportSkeleton 함수의 빈 줄을 채우세요 - 각 section의 items를 List Number 스타일(번호 매김)로 출력하도록."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
\r
        def buildReportSkeleton(path, sections):\r
            doc = Document()\r
            doc.add_heading("월간 보고서", level=0)\r
            for section in sections:\r
                doc.add_heading(section["title"], level=section.get("level", 1))\r
                for item in section.get("items", []):\r
                    ___  # item을 'List Number' 스타일로 단락 추가\r
            doc.save(path)\r
\r
        vault = TemporaryDirectory()\r
        docxPath = Path(vault.name) / "s.docx"\r
        buildReportSkeleton(docxPath, [\r
            {"title": "1. 매출", "level": 1, "items": ["Seoul", "Busan"]},\r
            {"title": "2. 비용", "level": 1, "items": ["인건비", "운영비"]},\r
        ])\r
        numbered = [p for p in Document(docxPath).paragraphs if p.style.name == "List Number"]\r
        len(numbered)\r
      hints:\r
        - "doc.add_paragraph(item, style='List Number')"\r
        - "style 키워드 인자에 'List Number' 전달."\r
    check:\r
      noError: "add_paragraph style 인자 활용."\r
      resultCheck: "출력 4 (List Number 단락 4개)."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "목차 골격 생성기"\r
    goal: "데이터 dict를 받아 헤더 + 본문 + 목록이 들어간 보고서 골격 함수를 만든다."\r
    why: "헤더 + 본문 + 목록이 결합된 골격은 한국식 주간 보고서·임원 브리핑·기획서의 99%가 따르는 형태입니다. 본 강의 패턴이 10강 회의록 생성기의 핵심 구조로 그대로 들어가며, dict → docx 매핑 사고가 모든 문서 자동화의 출발점이 됩니다."\r
    explanation: |-\r
      미션: buildReportSkeleton에 본문 단락(items 외의 'body' 키)도 추가하도록 확장.\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수 시그니처: buildReportSkeleton(path, title, sections) -> None"\r
    check:\r
      noError: "함수 정의."\r
      resultCheck: "title/headings/body/lists 모두 결과에 포함."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 본문 포함 목차 골격"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from docx import Document\r
\r
              def buildReportSkeleton(path, title, sections):\r
                  doc = Document()\r
                  doc.add_heading(title, level=0)\r
                  for section in sections:\r
                      doc.add_heading(section["title"], level=section.get("level", 1))\r
                      if section.get("body"):\r
                          doc.add_paragraph(section["body"])\r
                      for item in section.get("items", []):\r
                          doc.add_paragraph(item, style="List Bullet")\r
                  doc.save(path)\r
\r
              missionDir = TemporaryDirectory()\r
              docxPath = Path(missionDir.name) / "report.docx"\r
              buildReportSkeleton(docxPath, "Codaro 월간 보고", [\r
                  {\r
                      "title": "1. 매출",\r
                      "level": 1,\r
                      "body": "지난 달 대비 +12%",\r
                      "items": ["Seoul 120만", "Busan 80만"],\r
                  },\r
                  {\r
                      "title": "2. 액션",\r
                      "level": 1,\r
                      "items": ["김대리 보고서 작성", "박과장 검토"],\r
                  },\r
              ])\r
\r
              reopened = Document(docxPath)\r
              titles = [p for p in reopened.paragraphs if p.style.name == "Title"]\r
              h1s = [p for p in reopened.paragraphs if p.style.name == "Heading 1"]\r
              bullets = [p for p in reopened.paragraphs if p.style.name == "List Bullet"]\r
              assert len(titles) == 1\r
              assert len(h1s) == 2\r
              assert len(bullets) == 4\r
              [(p.text, p.style.name) for p in reopened.paragraphs]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "헤더 레벨에 따라 자동 들여쓰기 본문"\r
          - "목록을 dict로 받아 중첩 목록 (Level Bullet 2 사용)"\r
          - "각 헤더 끝에 PageBreak 추가 (10강 회의록 결합)"\r
          - "TOC 필드 자동 삽입 (사용자가 Word에서 업데이트)"\r
          - "마크다운 → docx 변환기 (# → Heading, - → List Bullet)"\r
`;export{e as default};