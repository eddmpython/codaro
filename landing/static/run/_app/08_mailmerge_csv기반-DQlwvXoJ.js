var e=`meta:\r
  id: word_08\r
  title: CSV 기반 mail merge\r
  order: 8\r
  category: word\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages:\r
    - python-docx\r
  tags:\r
    - mail merge\r
    - CSV\r
    - 양식 일괄\r
  outcomes:\r
    - automation.word.mailMerge\r
  prerequisites:\r
    - automation.word.edit\r
  estimatedMinutes: 55\r
  seo:\r
    title: "Word CSV mail merge - 200명 가정통신문 자동 생성"\r
    description: "CSV 명단에서 가정통신문 200장을 한 번에 자동 생성. 학교 행정 10시간이 30초로."\r
    keywords:\r
      - mail merge python\r
      - 가정통신문 자동\r
      - CSV docx 양식\r
\r
intro:\r
  direction: "CSV 명단의 각 행으로 양식 docx를 채워 N장을 자동 생성. 학교 행정의 가정통신문 200장이 10시간에서 30초로."\r
  benefits:\r
    - "학교 행정 김선생님의 가정통신문 200장 10시간을 30초로 줄인다."\r
    - "07강 fillTemplate 함수를 그대로 호출해 한 함수 추가로 mail merge 완성."\r
    - "파일명 패턴(학년_반_번호_이름)으로 결과 정리도 자동."\r
  diagram:\r
    steps:\r
      - label: "1. CSV → dict 리스트"\r
        detail: "csv.DictReader로 명단 로드."\r
      - label: "2. 양식 + 자리표시자"\r
        detail: "07강의 fillTemplate 함수 재사용."\r
      - label: "3. 일괄 생성"\r
        detail: "각 dict로 fillTemplate 호출, 파일명 자동 생성."\r
      - label: "4. 결과 폴더"\r
        detail: "outFolder에 N개 docx, 파일명은 데이터 기반."\r
    runtime:\r
      - label: "07강 함수 재사용"\r
        detail: "본 강의는 07강 fillTemplate 함수를 import만 함."\r
      - label: "검증"\r
        detail: "결과 폴더의 파일 수와 각 docx의 자리표시자 잔여 단위 assert."\r
\r
sections:\r
  - id: step1_csv_load\r
    title: "1단계. CSV 명단 로드"\r
    structuredPrimary: true\r
    subtitle: "csv.DictReader"\r
    goal: "학생 명단 CSV를 dict 리스트로 읽는다."\r
    why: "발송 대상이 표 형태로 입력되는 게 일반적입니다. CSV 한 곳이 출처."\r
    snippet: |-\r
      import csv\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
\r
      workdir = TemporaryDirectory()\r
      csvPath = Path(workdir.name) / "students.csv"\r
      csvPath.write_text(\r
          "name,grade,classroom,number,parent\\n"\r
          "김민수,3,1,12,김부모\\n"\r
          "박지영,3,1,13,박부모\\n"\r
          "이수진,3,2,5,이부모\\n",\r
          encoding="utf-8",\r
      )\r
      with open(csvPath, "r", encoding="utf-8") as f:\r
          students = list(csv.DictReader(f))\r
      len(students), students[0]\r
    exercise:\r
      prompt: "한 명 추가하고 학생 수가 4인지 확인하세요."\r
      starterCode: |-\r
        import csv\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
\r
        workdir = TemporaryDirectory()\r
        csvPath = Path(workdir.name) / "students.csv"\r
        csvPath.write_text(\r
            "name,grade,classroom,number,parent\\n"\r
            "김민수,3,1,12,김부모\\n"\r
            "박지영,3,1,13,박부모\\n"\r
            "이수진,3,2,5,이부모\\n"\r
            ___,\r
            encoding="utf-8",\r
        )\r
        with open(csvPath, "r", encoding="utf-8") as f:\r
            students = list(csv.DictReader(f))\r
        len(students)\r
      hints:\r
        - "한 줄 추가. 예: '윤하늘,3,2,7,윤부모\\\\n'."\r
    check:\r
      noError: "CSV 마지막 줄바꿈."\r
      resultCheck: "출력 4."\r
\r
  - id: step2_merge\r
    title: "2단계. 일괄 생성"\r
    structuredPrimary: true\r
    subtitle: "각 학생으로 fillTemplate 호출"\r
    goal: "학생 명단 전체에 대해 양식 docx를 만들고 폴더에 저장한다."\r
    why: "200장 자동 생성이 본 강의의 ROI 핵심입니다."\r
    snippet: |-\r
      import csv\r
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
          doc.save(outPath)\r
\r
      def mailMerge(templatePath, csvPath, outFolder):\r
          Path(outFolder).mkdir(exist_ok=True)\r
          with open(csvPath, "r", encoding="utf-8") as f:\r
              students = list(csv.DictReader(f))\r
          outputs = []\r
          for student in students:\r
              safeName = f"{student['grade']}_{student['classroom']}_{student['number']}_{student['name']}"\r
              outPath = Path(outFolder) / f"{safeName}.docx"\r
              fillTemplate(templatePath, student, outPath)\r
              outputs.append(outPath)\r
          return outputs\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      tplPath = base / "tpl.docx"\r
      seed = Document()\r
      seed.add_paragraph("학년: {{grade}}, 반: {{classroom}}, 번호: {{number}}")\r
      seed.add_paragraph("학생: {{name}}, 학부모: {{parent}}")\r
      seed.add_paragraph("가정통신문 본문입니다.")\r
      seed.save(tplPath)\r
\r
      csvPath = base / "students.csv"\r
      csvPath.write_text(\r
          "name,grade,classroom,number,parent\\n"\r
          "김민수,3,1,12,김부모\\n"\r
          "박지영,3,1,13,박부모\\n",\r
          encoding="utf-8",\r
      )\r
\r
      outputs = mailMerge(tplPath, csvPath, base / "letters")\r
      [p.name for p in outputs]\r
    exercise:\r
      prompt: "CSV에 한 명 더 추가하고 결과 docx 수가 3인지 확인하세요."\r
      starterCode: |-\r
        import csv\r
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
            doc.save(outPath)\r
\r
        def mailMerge(templatePath, csvPath, outFolder):\r
            Path(outFolder).mkdir(exist_ok=True)\r
            with open(csvPath, "r", encoding="utf-8") as f:\r
                students = list(csv.DictReader(f))\r
            outputs = []\r
            for student in students:\r
                safeName = f"{student['grade']}_{student['classroom']}_{student['number']}_{student['name']}"\r
                outPath = Path(outFolder) / f"{safeName}.docx"\r
                fillTemplate(templatePath, student, outPath)\r
                outputs.append(outPath)\r
            return outputs\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        tplPath = base / "t.docx"\r
        seed = Document()\r
        seed.add_paragraph("학생: {{name}}")\r
        seed.save(tplPath)\r
\r
        csvPath = base / "s.csv"\r
        csvPath.write_text(\r
            "name,grade,classroom,number,parent\\n"\r
            "김민수,3,1,12,김부모\\n"\r
            "박지영,3,1,13,박부모\\n"\r
            ___,\r
            encoding="utf-8",\r
        )\r
        len(mailMerge(tplPath, csvPath, base / "out"))\r
      hints:\r
        - "한 줄 추가."\r
    check:\r
      noError: "CSV 마지막 줄바꿈."\r
      resultCheck: "출력 3."\r
\r
  - id: validation\r
    title: "3단계. 검증 - 각 docx 자리표시자 잔여 확인"\r
    structuredPrimary: true\r
    subtitle: "모든 결과의 자리표시자 잔여 검사"\r
    goal: "생성된 모든 docx에 자리표시자가 한 개도 남지 않는지 검증한다."\r
    snippet: |-\r
      import csv\r
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
          doc.save(outPath)\r
\r
      def mailMerge(templatePath, csvPath, outFolder):\r
          Path(outFolder).mkdir(exist_ok=True)\r
          with open(csvPath, "r", encoding="utf-8") as f:\r
              students = list(csv.DictReader(f))\r
          outputs = []\r
          for student in students:\r
              safeName = f"{student['grade']}_{student['classroom']}_{student['number']}_{student['name']}"\r
              outPath = Path(outFolder) / f"{safeName}.docx"\r
              fillTemplate(templatePath, student, outPath)\r
              outputs.append(outPath)\r
          return outputs\r
\r
      vault = TemporaryDirectory()\r
      base = Path(vault.name)\r
      tplPath = base / "tpl.docx"\r
      seed = Document()\r
      seed.add_paragraph("학생: {{name}}, 부모: {{parent}}")\r
      seed.save(tplPath)\r
      csvPath = base / "s.csv"\r
      csvPath.write_text(\r
          "name,grade,classroom,number,parent\\n"\r
          "김민수,3,1,12,김부모\\n"\r
          "박지영,3,1,13,박부모\\n"\r
          "이수진,3,2,5,이부모\\n",\r
          encoding="utf-8",\r
      )\r
\r
      outputs = mailMerge(tplPath, csvPath, base / "out")\r
      assert len(outputs) == 3\r
      for path in outputs:\r
          combined = "\\n".join(p.text for p in Document(path).paragraphs)\r
          assert "{{" not in combined\r
      [p.name for p in outputs]\r
    exercise:\r
      prompt: "verifyAllFilled 함수를 작성하세요 - outputs 리스트의 모든 docx에서 자리표시자 잔여 여부를 검사해 (잔여 없는 파일 수, 잔여 있는 파일 수)를 튜플로 반환."\r
      starterCode: |-\r
        import csv\r
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
            doc.save(outPath)\r
\r
        def mailMerge(templatePath, csvPath, outFolder):\r
            Path(outFolder).mkdir(exist_ok=True)\r
            with open(csvPath, "r", encoding="utf-8") as f:\r
                rows = list(csv.DictReader(f))\r
            outputs = []\r
            for row in rows:\r
                outPath = Path(outFolder) / f"{row['name']}.docx"\r
                fillTemplate(templatePath, row, outPath)\r
                outputs.append(outPath)\r
            return outputs\r
\r
        def verifyAllFilled(outputs):\r
            clean, dirty = 0, 0\r
            for path in outputs:\r
                combined = "\\n".join(p.text for p in Document(path).paragraphs)\r
                ___  # '{{' in combined 면 dirty += 1, 아니면 clean += 1\r
            return clean, dirty\r
\r
        vault = TemporaryDirectory()\r
        base = Path(vault.name)\r
        tplPath = base / "t.docx"\r
        seed = Document()\r
        seed.add_paragraph("학생: {{name}}, 부모: {{parent}}")\r
        seed.save(tplPath)\r
        csvPath = base / "s.csv"\r
        csvPath.write_text(\r
            "name,parent\\n김민수,김부모\\n박지영,\\n이수진,이부모\\n",\r
            encoding="utf-8",\r
        )\r
        outputs = mailMerge(tplPath, csvPath, base / "o")\r
        verifyAllFilled(outputs)\r
      hints:\r
        - "if '{{' in combined: dirty += 1\\\\nelse: clean += 1"\r
        - "빈 문자열은 치환되지만 키 자체가 빠지면 잔여 발생."\r
    check:\r
      noError: "조건 분기로 clean/dirty 카운트."\r
      resultCheck: "(3, 0) 출력 (빈 값이라도 키만 있으면 모두 치환됨)."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "가정통신문 일괄 생성기"\r
    goal: "표 안 자리표시자도 처리하는 mailMerge로 확장."\r
    why: "07강 패턴을 그대로 가져와 mail merge 전 흐름을 완성."\r
    explanation: |-\r
      미션: 표 셀 안 자리표시자도 처리하는 mailMergeFull(templatePath, csvPath, outFolder).\r
    snippet: |-\r
      from docx import Document\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "07강 fillTemplate(표 셀 순회 포함)을 그대로 호출."\r
    check:\r
      noError: "함수 정의."\r
      resultCheck: "표 안 자리표시자 모두 치환."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 표 포함 mail merge"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import csv\r
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
\r
              def mailMergeFull(templatePath, csvPath, outFolder):\r
                  Path(outFolder).mkdir(exist_ok=True)\r
                  with open(csvPath, "r", encoding="utf-8") as f:\r
                      rows = list(csv.DictReader(f))\r
                  outputs = []\r
                  for row in rows:\r
                      outPath = Path(outFolder) / f"{row['name']}.docx"\r
                      fillTemplate(templatePath, row, outPath)\r
                      outputs.append(outPath)\r
                  return outputs\r
\r
              missionDir = TemporaryDirectory()\r
              base = Path(missionDir.name)\r
              tplPath = base / "tpl.docx"\r
              seed = Document()\r
              seed.add_heading("가정통신문", level=0)\r
              seed.add_paragraph("학부모: {{parent}}님께")\r
              tbl = seed.add_table(rows=2, cols=2, style="Table Grid")\r
              tbl.cell(0, 0).text = "학생"\r
              tbl.cell(0, 1).text = "{{name}}"\r
              tbl.cell(1, 0).text = "반"\r
              tbl.cell(1, 1).text = "{{classroom}}반 {{number}}번"\r
              seed.save(tplPath)\r
\r
              csvPath = base / "students.csv"\r
              csvPath.write_text(\r
                  "name,classroom,number,parent\\n"\r
                  "김민수,1,12,김부모\\n"\r
                  "박지영,1,13,박부모\\n",\r
                  encoding="utf-8",\r
              )\r
\r
              outputs = mailMergeFull(tplPath, csvPath, base / "letters")\r
              assert len(outputs) == 2\r
              for path in outputs:\r
                  doc = Document(path)\r
                  combined = "\\n".join(p.text for p in doc.paragraphs)\r
                  combined += "\\n" + "\\n".join(c.text for tbl in doc.tables for row in tbl.rows for c in row.cells)\r
                  assert "{{" not in combined\r
              [p.name for p in outputs]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "Email 트랙 03강과 결합 - 생성된 docx를 학부모에게 자동 발송"\r
          - "PDF 변환 (LibreOffice headless) 후 발송"\r
          - "발송 결과 로그를 CSV에 추가"\r
          - "헤더 매핑 dict로 한국식 컬럼명(이름→name) 자동 변환"\r
          - "조건부 추가 단락 (특정 학년에만 보이는 안내)"\r
`;export{e as default};