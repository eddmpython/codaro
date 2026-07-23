var e=`meta:\r
  id: word_01\r
  title: 첫 Word 문서 만들기\r
  order: 1\r
  category: word\r
  difficulty: ⭐\r
  badge: 입문\r
  packages:\r
    - python-docx\r
  tags:\r
    - Document\r
    - add_paragraph\r
    - save\r
  outcomes:\r
    - automation.word.paragraphs\r
  prerequisites:\r
    - automation.word.intro\r
  estimatedMinutes: 35\r
  seo:\r
    title: "python-docx 첫 문서 - Document·add_paragraph·save"\r
    description: "python-docx로 첫 docx 파일을 만든다. Document 객체와 단락의 기본 구조를 손에 익힌다."\r
    keywords:\r
      - python-docx Document\r
      - add_paragraph\r
      - docx save\r
\r
intro:\r
  direction: "python-docx의 가장 단순한 흐름 - Document 만들고, 단락 추가하고, 저장. 본 트랙의 모든 강의가 이 형태에서 확장된다."\r
  benefits:\r
    - "Document → 단락 → save 3 단계 흐름이 손에 박힌다."\r
    - "TemporaryDirectory + 재오픈 assert 검증 패턴이 본 강의에 안착."\r
    - "10강까지의 모든 함수가 본 형태를 시작점으로 가짐."\r
  diagram:\r
    steps:\r
      - label: "1. Document 생성"\r
        detail: "Document() 호출로 빈 docx 객체."\r
      - label: "2. 단락 추가"\r
        detail: "doc.add_paragraph(text)로 한 줄씩."\r
      - label: "3. 저장"\r
        detail: "doc.save(path)로 파일 쓰기."\r
      - label: "4. 재오픈 검증"\r
        detail: "Document(path)로 다시 열어 doc.paragraphs로 확인."\r
    runtime:\r
      - label: "외부 의존"\r
        detail: "python-docx만 meta.packages 기준으로 준비합니다."\r
      - label: "검증"\r
        detail: "TemporaryDirectory + Document 재오픈 + paragraphs assert."\r
\r
sections:\r
  - id: step1_create\r
    title: "1단계. Document 만들고 저장"\r
    structuredPrimary: true\r
    subtitle: "Document(), add_paragraph, save"\r
    goal: "단락 두 개가 있는 docx 파일을 임시 폴더에 만든다."\r
    why: "python-docx 모든 자동화의 출발점입니다. 한 함수 호출 안에 Document → 단락 → save 흐름이 들어가는 패턴이 모든 후속 강의의 기본이며, 보고서·계약서·회의록 등 어떤 한국 사무 양식이든 결국 이 세 줄에서 확장됩니다."\r
    explanation: |-\r
      Document()는 빈 워드 문서 객체. add_paragraph(text)는 새 단락을 추가하고 Paragraph 객체를 돌려줍니다. save(path)는 .docx 파일을 디스크에 씁니다.\r
    tips:\r
      - "Document()에 인자 없이 호출하면 빈 새 문서. 인자에 경로를 주면 기존 docx를 엽니다 (07강에서 활용)."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "hello.docx"\r
\r
      doc = Document()\r
      doc.add_paragraph("Hello docx")\r
      doc.add_paragraph("Codaro Word lesson 01")\r
      doc.save(pdfPath)\r
\r
      reopened = Document(pdfPath)\r
      [p.text for p in reopened.paragraphs]\r
    exercise:\r
      prompt: "단락 한 줄 더 추가해 '본문 셋째 줄'을 넣고 paragraphs 길이가 3인지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
\r
        workdir = TemporaryDirectory()\r
        docxPath = Path(workdir.name) / "hello.docx"\r
\r
        doc = Document()\r
        doc.add_paragraph("Hello docx")\r
        doc.add_paragraph("Codaro Word lesson 01")\r
        doc.add_paragraph(___)\r
        doc.save(docxPath)\r
\r
        len(Document(docxPath).paragraphs)\r
      hints:\r
        - "문자열 '본문 셋째 줄'."\r
    check:\r
      noError: "add_paragraph 인자는 문자열."\r
      resultCheck: "출력 3."\r
\r
  - id: step2_paragraph_object\r
    title: "2단계. Paragraph 객체 조작"\r
    structuredPrimary: true\r
    subtitle: "add_paragraph 반환값 활용"\r
    goal: "add_paragraph가 돌려주는 Paragraph 객체로 정렬·style을 지정한다."\r
    why: "Paragraph 객체에 추가 속성을 설정해야 정렬·스타일이 적용됩니다. 변수에 받아 사용하는 패턴."\r
    explanation: |-\r
      p = doc.add_paragraph(text) 후 p.alignment = WD_ALIGN_PARAGRAPH.CENTER로 정렬, p.style = 'Heading 1'로 미리 정의된 스타일 적용.\r
    tips:\r
      - "alignment enum은 from docx.enum.text import WD_ALIGN_PARAGRAPH."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
      from docx.enum.text import WD_ALIGN_PARAGRAPH\r
\r
      workdir = TemporaryDirectory()\r
      docxPath = Path(workdir.name) / "p.docx"\r
\r
      doc = Document()\r
      title = doc.add_paragraph("월간 보고서")\r
      title.alignment = WD_ALIGN_PARAGRAPH.CENTER\r
      body = doc.add_paragraph("본문입니다.")\r
      doc.save(docxPath)\r
\r
      reopened = Document(docxPath)\r
      reopened.paragraphs[0].text, reopened.paragraphs[0].alignment\r
    exercise:\r
      prompt: "본문 단락을 RIGHT 정렬로 바꾸세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
        from docx.enum.text import WD_ALIGN_PARAGRAPH\r
\r
        workdir = TemporaryDirectory()\r
        docxPath = Path(workdir.name) / "p.docx"\r
\r
        doc = Document()\r
        body = doc.add_paragraph("본문")\r
        body.alignment = WD_ALIGN_PARAGRAPH.___\r
        doc.save(docxPath)\r
\r
        Document(docxPath).paragraphs[0].alignment == WD_ALIGN_PARAGRAPH.RIGHT\r
      hints:\r
        - "enum 값 RIGHT."\r
    check:\r
      noError: "WD_ALIGN_PARAGRAPH enum 값."\r
      resultCheck: "True 출력."\r
\r
  - id: validation\r
    title: "3단계. 검증 루프 - 재오픈 + paragraphs assert"\r
    structuredPrimary: true\r
    subtitle: "buildHelloDoc + Document 재오픈"\r
    goal: "buildHelloDoc 함수의 결과를 재오픈해 의도한 단락이 모두 있는지 한 셀에서 검증한다."\r
    why: "Word 자동화의 핵심 검증 패턴 - 저장 후 다시 열어 paragraphs로 확인."\r
    explanation: |-\r
      함수가 docx를 만들고, 결과를 Document로 다시 열어 paragraphs 텍스트와 길이를 한 묶음 assert.\r
    tips:\r
      - "paragraphs 길이는 빈 단락도 포함될 수 있습니다. 검증할 때 strip() 후 비교."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
\r
      def buildHelloDoc(path, lines):\r
          doc = Document()\r
          for line in lines:\r
              doc.add_paragraph(line)\r
          doc.save(path)\r
\r
      vault = TemporaryDirectory()\r
      docxPath = Path(vault.name) / "h.docx"\r
      buildHelloDoc(docxPath, ["alpha", "beta", "gamma"])\r
\r
      reopened = Document(docxPath)\r
      assert len(reopened.paragraphs) == 3\r
      assert reopened.paragraphs[0].text == "alpha"\r
      assert reopened.paragraphs[2].text == "gamma"\r
      [p.text for p in reopened.paragraphs]\r
    exercise:\r
      prompt: "buildLabeledDoc 함수를 완성하세요 - 각 줄 앞에 '[N] '(1부터 시작하는 번호) 접두사를 붙여 단락으로 저장."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
\r
        def buildLabeledDoc(path, lines):\r
            doc = Document()\r
            for idx, line in enumerate(lines, start=1):\r
                ___  # 단락 추가: f"[{idx}] {line}"\r
            doc.save(path)\r
\r
        vault = TemporaryDirectory()\r
        docxPath = Path(vault.name) / "h.docx"\r
        buildLabeledDoc(docxPath, ["alpha", "beta", "gamma"])\r
        [p.text for p in Document(docxPath).paragraphs]\r
      hints:\r
        - "doc.add_paragraph(f'[{idx}] {line}')"\r
        - "f-string으로 번호와 본문을 하나의 문자열로."\r
    check:\r
      noError: "doc.add_paragraph 호출 한 번."\r
      resultCheck: "출력 ['[1] alpha', '[2] beta', '[3] gamma']."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "텍스트 → docx 변환기"\r
    goal: "텍스트 파일의 각 줄을 단락으로 변환하는 함수를 만든다."\r
    why: "텍스트에서 docx로의 변환은 빈도 높은 작업입니다. 회의 메모(.txt)를 양식 docx로 옮기는 첫 단계."\r
    explanation: |-\r
      미션: linesFileToDocx(textPath, docxPath) 함수. 텍스트 파일을 읽고 각 줄을 단락으로 변환.\r
    tips:\r
      - "빈 줄도 단락으로 살릴지 무시할지 선택하세요. 본 미션은 strip 후 빈 줄 무시."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수: linesFileToDocx(textPath, docxPath) -> int (생성된 단락 수)"\r
    check:\r
      noError: "함수 정의 + 검증."\r
      resultCheck: "단락 수가 텍스트 파일 의미 줄 수와 같아야 함."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 텍스트 → docx"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from docx import Document\r
\r
              def linesFileToDocx(textPath, docxPath):\r
                  lines = [line.strip() for line in Path(textPath).read_text(encoding="utf-8").splitlines() if line.strip()]\r
                  doc = Document()\r
                  for line in lines:\r
                      doc.add_paragraph(line)\r
                  doc.save(docxPath)\r
                  return len(lines)\r
\r
              missionDir = TemporaryDirectory()\r
              base = Path(missionDir.name)\r
              textPath = base / "memo.txt"\r
              textPath.write_text("alpha\\n\\nbeta\\ngamma\\n", encoding="utf-8")\r
              docxPath = base / "memo.docx"\r
\r
              count = linesFileToDocx(textPath, docxPath)\r
              assert count == 3\r
              reopened = Document(docxPath)\r
              assert len(reopened.paragraphs) == 3\r
              assert reopened.paragraphs[1].text == "beta"\r
              [p.text for p in reopened.paragraphs]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "마크다운 파일(.md)에서 # 시작 줄은 add_heading, 나머지는 add_paragraph로 변환"\r
          - "URL 자동 감지해 하이퍼링크 단락으로 변환"\r
          - "빈 줄을 명시적 빈 단락(스페이서)으로 살리기"\r
          - "리스트(- item) 표기를 add_paragraph(style='List Bullet')로 변환"\r
          - "여러 텍스트 파일을 한 docx에 묶음 (장(章) 구분 페이지 break)"\r
`;export{e as default};