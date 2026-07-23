var e=`meta:\r
  id: word_07\r
  title: 기존 문서 수정과 자리표시자 치환\r
  order: 7\r
  category: word\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages:\r
    - python-docx\r
  tags:\r
    - Document open\r
    - 자리표시자\r
    - 치환\r
  outcomes:\r
    - automation.word.edit\r
  prerequisites:\r
    - automation.word.styles\r
  estimatedMinutes: 45\r
  seo:\r
    title: "Word 자리표시자 치환 - Document(path) + {{name}} 치환"\r
    description: "기존 docx를 열어 {{name}} 형태 자리표시자를 데이터로 치환. mail merge의 단순 패턴."\r
    keywords:\r
      - python-docx open\r
      - 자리표시자 치환\r
      - mail merge 단순\r
\r
intro:\r
  direction: "기존 docx 양식을 열어 {{name}} 형태 자리표시자를 데이터로 치환한다. 09강 docxtpl의 단순 버전."\r
  benefits:\r
    - "양식을 한 번 만들어두면 데이터 dict로 N장 자동 채우기."\r
    - "{{name}} 자리표시자는 09강 docxtpl과 동일한 문법 - 일관성."\r
    - "08강 CSV mail merge의 기반 함수가 본 강의에서 만들어짐."\r
  diagram:\r
    steps:\r
      - label: "1. Document(path)로 양식 열기"\r
        detail: "기존 docx를 객체로."\r
      - label: "2. 단락·셀 순회"\r
        detail: "doc.paragraphs와 doc.tables 모두 순회."\r
      - label: "3. {{key}} 치환"\r
        detail: "run.text를 replace로 교체."\r
    runtime:\r
      - label: "양식 준비"\r
        detail: "본 강의에서는 양식을 코드로 즉석 생성한 뒤 자리표시자 치환."\r
      - label: "검증"\r
        detail: "치환 후 paragraphs.text에 자리표시자가 남지 않는지 assert."\r
\r
sections:\r
  - id: step1_open\r
    title: "1단계. 기존 docx 열기"\r
    structuredPrimary: true\r
    subtitle: "Document(path)"\r
    goal: "Document에 path를 넘겨 기존 docx를 객체로 연다."\r
    why: "본 강의의 출발점. 만들기와 다른 점은 첫 줄에서 끝납니다. 디자인팀이 만든 사내 표준 양식을 그대로 사용하면서 데이터만 코드로 채우는 패턴 - Word 자동화 현장에서 가장 자주 쓰이는 흐름입니다."\r
    explanation: |-\r
      Document() 인자 없이는 빈 새 문서. Document(path)는 기존 docx 객체로 로드. paragraphs/tables/sections 모두 그대로 접근 가능.\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      templatePath = base / "tpl.docx"\r
\r
      seed = Document()\r
      seed.add_paragraph("계약서 양식")\r
      seed.add_paragraph("성명: {{name}}")\r
      seed.add_paragraph("입사일: {{join_date}}")\r
      seed.save(templatePath)\r
\r
      opened = Document(templatePath)\r
      [p.text for p in opened.paragraphs]\r
    exercise:\r
      prompt: "양식 단락 한 줄 더 추가('연봉: {{salary}}')."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        templatePath = base / "tpl.docx"\r
\r
        seed = Document()\r
        seed.add_paragraph("계약서 양식")\r
        seed.add_paragraph("성명: {{name}}")\r
        seed.add_paragraph(___)\r
        seed.save(templatePath)\r
\r
        len(Document(templatePath).paragraphs)\r
      hints:\r
        - "문자열 '연봉: {{salary}}'."\r
    check:\r
      noError: "add_paragraph 인자는 문자열."\r
      resultCheck: "출력 3."\r
\r
  - id: step2_replace\r
    title: "2단계. 자리표시자 치환"\r
    structuredPrimary: true\r
    subtitle: "run.text replace"\r
    goal: "단락 안 run의 text에서 {{name}}을 실제 이름으로 교체한다."\r
    why: "Word docx는 같은 단락 안에서도 텍스트가 여러 run으로 쪼개질 수 있습니다. run 단위로 치환해야 안전합니다."\r
    explanation: |-\r
      run.text = run.text.replace('{{name}}', actualName). 단락 모든 run을 순회해 모든 자리표시자 처리.\r
    tips:\r
      - "자리표시자가 두 run에 걸쳐 있으면 단순 replace로 안 잡힙니다. 09강 docxtpl이 이를 안전하게 처리."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
\r
      def replaceInDoc(path, replacements, outPath):\r
          doc = Document(path)\r
          for p in doc.paragraphs:\r
              for run in p.runs:\r
                  for key, value in replacements.items():\r
                      placeholder = f"{{{{{key}}}}}"\r
                      if placeholder in run.text:\r
                          run.text = run.text.replace(placeholder, value)\r
          doc.save(outPath)\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      tplPath = base / "tpl.docx"\r
      seed = Document()\r
      seed.add_paragraph("성명: {{name}}")\r
      seed.add_paragraph("입사일: {{join_date}}")\r
      seed.save(tplPath)\r
\r
      outPath = base / "filled.docx"\r
      replaceInDoc(tplPath, {"name": "김대리", "join_date": "2026-05-28"}, outPath)\r
\r
      filled = Document(outPath)\r
      [p.text for p in filled.paragraphs]\r
    exercise:\r
      prompt: "이름을 '박과장', 입사일을 '2026-06-01'로 치환하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
\r
        def replaceInDoc(path, replacements, outPath):\r
            doc = Document(path)\r
            for p in doc.paragraphs:\r
                for run in p.runs:\r
                    for key, value in replacements.items():\r
                        placeholder = f"{{{{{key}}}}}"\r
                        if placeholder in run.text:\r
                            run.text = run.text.replace(placeholder, value)\r
            doc.save(outPath)\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        tplPath = base / "t.docx"\r
        seed = Document()\r
        seed.add_paragraph("성명: {{name}}")\r
        seed.add_paragraph("입사일: {{join_date}}")\r
        seed.save(tplPath)\r
        outPath = base / "f.docx"\r
\r
        replaceInDoc(tplPath, {"name": ___, "join_date": ___}, outPath)\r
        [p.text for p in Document(outPath).paragraphs]\r
      hints:\r
        - "두 문자열: '박과장', '2026-06-01'."\r
    check:\r
      noError: "dict 값은 문자열."\r
      resultCheck: "치환 후 자리표시자가 사라져야 함."\r
\r
  - id: validation\r
    title: "3단계. 검증 - 자리표시자 잔여 확인"\r
    structuredPrimary: true\r
    subtitle: "치환 후 paragraphs.text에 {{ }} 없음"\r
    goal: "치환 후 결과 docx에 자리표시자가 한 개도 남지 않는지 확인한다."\r
    why: "치환 누락은 잘못된 양식 발송으로 이어집니다. 잔여 자리표시자 검사가 안전망."\r
    explanation: |-\r
      모든 paragraphs.text를 join하고 '{{' 또는 '}}' 잔여 여부를 assert.\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
\r
      def replaceInDoc(path, replacements, outPath):\r
          doc = Document(path)\r
          for p in doc.paragraphs:\r
              for run in p.runs:\r
                  for key, value in replacements.items():\r
                      placeholder = f"{{{{{key}}}}}"\r
                      if placeholder in run.text:\r
                          run.text = run.text.replace(placeholder, value)\r
          doc.save(outPath)\r
\r
      vault = TemporaryDirectory()\r
      base = Path(vault.name)\r
      tplPath = base / "tpl.docx"\r
      seed = Document()\r
      for line in ["성명: {{name}}", "입사일: {{join_date}}", "직급: {{role}}"]:\r
          seed.add_paragraph(line)\r
      seed.save(tplPath)\r
\r
      outPath = base / "filled.docx"\r
      replaceInDoc(tplPath, {"name": "김대리", "join_date": "2026-05-28", "role": "대리"}, outPath)\r
\r
      filled = Document(outPath)\r
      combined = "\\n".join(p.text for p in filled.paragraphs)\r
      assert "{{" not in combined\r
      assert "{{name}}" not in combined\r
      assert "김대리" in combined\r
      combined\r
    exercise:\r
      prompt: "findMissingPlaceholders 함수를 작성하세요 - 치환 후 결과 docx에서 남아 있는 모든 자리표시자(예: '{{role}}')를 set으로 반환."\r
      starterCode: |-\r
        import re\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
\r
        def replaceInDoc(path, replacements, outPath):\r
            doc = Document(path)\r
            for p in doc.paragraphs:\r
                for run in p.runs:\r
                    for key, value in replacements.items():\r
                        placeholder = f"{{{{{key}}}}}"\r
                        if placeholder in run.text:\r
                            run.text = run.text.replace(placeholder, value)\r
            doc.save(outPath)\r
\r
        def findMissingPlaceholders(docPath):\r
            doc = Document(docPath)\r
            combined = "\\n".join(p.text for p in doc.paragraphs)\r
            ___  # re.findall로 r"\\{\\{[^{}]+\\}\\}" 패턴을 찾아 set으로 반환\r
\r
        vault = TemporaryDirectory()\r
        base = Path(vault.name)\r
        tplPath = base / "t.docx"\r
        seed = Document()\r
        for line in ["성명: {{name}}", "직급: {{role}}", "부서: {{team}}"]:\r
            seed.add_paragraph(line)\r
        seed.save(tplPath)\r
        outPath = base / "f.docx"\r
\r
        replaceInDoc(tplPath, {"name": "김대리"}, outPath)\r
        sorted(findMissingPlaceholders(outPath))\r
      hints:\r
        - "return set(re.findall(r'\\\\{\\\\{[^{}]+\\\\}\\\\}', combined))"\r
        - "정규식으로 '{{...}}' 형태 모두 모아 set 반환."\r
    check:\r
      noError: "re.findall + set 반환."\r
      resultCheck: "['{{role}}', '{{team}}'] 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "양식 채움 함수"\r
    goal: "단락 + 표 안의 자리표시자를 모두 치환하는 fillTemplate 함수."\r
    why: "표 셀에 자리표시자가 있는 경우가 많습니다. 단락만 다루면 부족합니다."\r
    snippet: |-\r
      from docx import Document\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수: fillTemplate(templatePath, replacements, outPath)"\r
        - "doc.paragraphs와 doc.tables의 모든 cell.paragraphs 순회."\r
    check:\r
      noError: "표 안 셀 순회."\r
      resultCheck: "자리표시자 잔여 없음."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 단락 + 표 동시 치환"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from docx import Document\r
\r
              def replaceInRuns(paragraph, replacements):\r
                  for run in paragraph.runs:\r
                      for key, value in replacements.items():\r
                          placeholder = f"{{{{{key}}}}}"\r
                          if placeholder in run.text:\r
                              run.text = run.text.replace(placeholder, value)\r
\r
              def fillTemplate(templatePath, replacements, outPath):\r
                  doc = Document(templatePath)\r
                  for p in doc.paragraphs:\r
                      replaceInRuns(p, replacements)\r
                  for tbl in doc.tables:\r
                      for row in tbl.rows:\r
                          for cell in row.cells:\r
                              for p in cell.paragraphs:\r
                                  replaceInRuns(p, replacements)\r
                  doc.save(outPath)\r
                  return outPath\r
\r
              missionDir = TemporaryDirectory()\r
              base = Path(missionDir.name)\r
              tplPath = base / "tpl.docx"\r
              seed = Document()\r
              seed.add_paragraph("성명: {{name}}")\r
              tbl = seed.add_table(rows=2, cols=2, style="Table Grid")\r
              tbl.cell(0, 0).text = "직급"\r
              tbl.cell(0, 1).text = "{{role}}"\r
              tbl.cell(1, 0).text = "연봉"\r
              tbl.cell(1, 1).text = "{{salary}}"\r
              seed.save(tplPath)\r
\r
              outPath = base / "filled.docx"\r
              fillTemplate(tplPath, {"name": "김대리", "role": "대리", "salary": "4,200만"}, outPath)\r
\r
              filled = Document(outPath)\r
              combined = "\\n".join(p.text for p in filled.paragraphs)\r
              combined += "\\n" + "\\n".join(c.text for tbl in filled.tables for row in tbl.rows for c in row.cells)\r
              assert "{{" not in combined\r
              assert "김대리" in combined and "대리" in combined and "4,200만" in combined\r
              combined\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "머리말·꼬리말 안 자리표시자도 치환"\r
          - "이미지 자리표시자 ({{logo}} → 실제 이미지 삽입)"\r
          - "표 행 동적 추가 ({{#each items}} 패턴 - 09강 docxtpl이 더 강력)"\r
          - "조건부 단락 삭제 ({{#if condition}} 형태)"\r
          - "08강과 결합 - CSV의 각 행으로 fillTemplate 호출"\r
`;export{e as default};