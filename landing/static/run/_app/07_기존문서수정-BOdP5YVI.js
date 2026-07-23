var e=`meta:
  id: word_07
  title: 기존 문서 수정과 자리표시자 치환
  order: 7
  category: word
  difficulty: ⭐⭐⭐
  badge: 중급
  packages:
    - python-docx
  tags:
    - Document open
    - 자리표시자
    - 치환
  outcomes:
    - automation.word.edit
  prerequisites:
    - automation.word.styles
  estimatedMinutes: 45
  seo:
    title: "Word 자리표시자 치환 - Document(path) + {{name}} 치환"
    description: "기존 docx를 열어 {{name}} 형태 자리표시자를 데이터로 치환. mail merge의 단순 패턴."
    keywords:
      - python-docx open
      - 자리표시자 치환
      - mail merge 단순

intro:
  direction: "기존 docx 양식을 열어 {{name}} 형태 자리표시자를 데이터로 치환한다. 09강 docxtpl의 단순 버전."
  benefits:
    - "양식을 한 번 만들어두면 데이터 dict로 N장 자동 채우기."
    - "{{name}} 자리표시자는 09강 docxtpl과 동일한 문법 - 일관성."
    - "08강 CSV mail merge의 기반 함수가 본 강의에서 만들어짐."
  diagram:
    steps:
      - label: "1. Document(path)로 양식 열기"
        detail: "기존 docx를 객체로."
      - label: "2. 단락·셀 순회"
        detail: "doc.paragraphs와 doc.tables 모두 순회."
      - label: "3. {{key}} 치환"
        detail: "run.text를 replace로 교체."
    runtime:
      - label: "양식 준비"
        detail: "본 강의에서는 양식을 코드로 즉석 생성한 뒤 자리표시자 치환."
      - label: "검증"
        detail: "치환 후 paragraphs.text에 자리표시자가 남지 않는지 assert."

sections:
  - id: step1_open
    title: "1단계. 기존 docx 열기"
    structuredPrimary: true
    subtitle: "Document(path)"
    goal: "Document에 path를 넘겨 기존 docx를 객체로 연다."
    why: "본 강의의 출발점. 만들기와 다른 점은 첫 줄에서 끝납니다. 디자인팀이 만든 사내 표준 양식을 그대로 사용하면서 데이터만 코드로 채우는 패턴 - Word 자동화 현장에서 가장 자주 쓰이는 흐름입니다."
    explanation: |-
      Document() 인자 없이는 빈 새 문서. Document(path)는 기존 docx 객체로 로드. paragraphs/tables/sections 모두 그대로 접근 가능.
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document

      workdir = TemporaryDirectory()
      base = Path(workdir.name)
      templatePath = base / "tpl.docx"

      seed = Document()
      seed.add_paragraph("계약서 양식")
      seed.add_paragraph("성명: {{name}}")
      seed.add_paragraph("입사일: {{join_date}}")
      seed.save(templatePath)

      opened = Document(templatePath)
      [p.text for p in opened.paragraphs]
    exercise:
      prompt: "양식 단락 한 줄 더 추가('연봉: {{salary}}')."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document

        workdir = TemporaryDirectory()
        base = Path(workdir.name)
        templatePath = base / "tpl.docx"

        seed = Document()
        seed.add_paragraph("계약서 양식")
        seed.add_paragraph("성명: {{name}}")
        seed.add_paragraph(___)
        seed.save(templatePath)

        len(Document(templatePath).paragraphs)
      hints:
        - "문자열 '연봉: {{salary}}'."
    check:
      noError: "add_paragraph 인자는 문자열."
      resultCheck: "출력 3."

  - id: step2_replace
    title: "2단계. 자리표시자 치환"
    structuredPrimary: true
    subtitle: "run.text replace"
    goal: "단락 안 run의 text에서 {{name}}을 실제 이름으로 교체한다."
    why: "Word docx는 같은 단락 안에서도 텍스트가 여러 run으로 쪼개질 수 있습니다. run 단위로 치환해야 안전합니다."
    explanation: |-
      run.text = run.text.replace('{{name}}', actualName). 단락 모든 run을 순회해 모든 자리표시자 처리.
    tips:
      - "자리표시자가 두 run에 걸쳐 있으면 단순 replace로 안 잡힙니다. 09강 docxtpl이 이를 안전하게 처리."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document

      def replaceInDoc(path, replacements, outPath):
          doc = Document(path)
          for p in doc.paragraphs:
              for run in p.runs:
                  for key, value in replacements.items():
                      placeholder = f"{{{{{key}}}}}"
                      if placeholder in run.text:
                          run.text = run.text.replace(placeholder, value)
          doc.save(outPath)

      workdir = TemporaryDirectory()
      base = Path(workdir.name)
      tplPath = base / "tpl.docx"
      seed = Document()
      seed.add_paragraph("성명: {{name}}")
      seed.add_paragraph("입사일: {{join_date}}")
      seed.save(tplPath)

      outPath = base / "filled.docx"
      replaceInDoc(tplPath, {"name": "김대리", "join_date": "2026-05-28"}, outPath)

      filled = Document(outPath)
      [p.text for p in filled.paragraphs]
    exercise:
      prompt: "이름을 '박과장', 입사일을 '2026-06-01'로 치환하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document

        def replaceInDoc(path, replacements, outPath):
            doc = Document(path)
            for p in doc.paragraphs:
                for run in p.runs:
                    for key, value in replacements.items():
                        placeholder = f"{{{{{key}}}}}"
                        if placeholder in run.text:
                            run.text = run.text.replace(placeholder, value)
            doc.save(outPath)

        workdir = TemporaryDirectory()
        base = Path(workdir.name)
        tplPath = base / "t.docx"
        seed = Document()
        seed.add_paragraph("성명: {{name}}")
        seed.add_paragraph("입사일: {{join_date}}")
        seed.save(tplPath)
        outPath = base / "f.docx"

        replaceInDoc(tplPath, {"name": ___, "join_date": ___}, outPath)
        [p.text for p in Document(outPath).paragraphs]
      hints:
        - "두 문자열: '박과장', '2026-06-01'."
    check:
      noError: "dict 값은 문자열."
      resultCheck: "치환 후 자리표시자가 사라져야 함."

  - id: validation
    title: "3단계. 검증 - 자리표시자 잔여 확인"
    structuredPrimary: true
    subtitle: "치환 후 paragraphs.text에 {{ }} 없음"
    goal: "치환 후 결과 docx에 자리표시자가 한 개도 남지 않는지 확인한다."
    why: "치환 누락은 잘못된 양식 발송으로 이어집니다. 잔여 자리표시자 검사가 안전망."
    explanation: |-
      모든 paragraphs.text를 join하고 '{{' 또는 '}}' 잔여 여부를 assert.
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document

      def replaceInDoc(path, replacements, outPath):
          doc = Document(path)
          for p in doc.paragraphs:
              for run in p.runs:
                  for key, value in replacements.items():
                      placeholder = f"{{{{{key}}}}}"
                      if placeholder in run.text:
                          run.text = run.text.replace(placeholder, value)
          doc.save(outPath)

      vault = TemporaryDirectory()
      base = Path(vault.name)
      tplPath = base / "tpl.docx"
      seed = Document()
      for line in ["성명: {{name}}", "입사일: {{join_date}}", "직급: {{role}}"]:
          seed.add_paragraph(line)
      seed.save(tplPath)

      outPath = base / "filled.docx"
      replaceInDoc(tplPath, {"name": "김대리", "join_date": "2026-05-28", "role": "대리"}, outPath)

      filled = Document(outPath)
      combined = "\\n".join(p.text for p in filled.paragraphs)
      assert "{{" not in combined
      assert "{{name}}" not in combined
      assert "김대리" in combined
      combined
    exercise:
      prompt: "findMissingPlaceholders 함수를 작성하세요 - 치환 후 결과 docx에서 남아 있는 모든 자리표시자(예: '{{role}}')를 set으로 반환."
      starterCode: |-
        import re
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document

        def replaceInDoc(path, replacements, outPath):
            doc = Document(path)
            for p in doc.paragraphs:
                for run in p.runs:
                    for key, value in replacements.items():
                        placeholder = f"{{{{{key}}}}}"
                        if placeholder in run.text:
                            run.text = run.text.replace(placeholder, value)
            doc.save(outPath)

        def findMissingPlaceholders(docPath):
            doc = Document(docPath)
            combined = "\\n".join(p.text for p in doc.paragraphs)
            ___  # re.findall로 r"\\{\\{[^{}]+\\}\\}" 패턴을 찾아 set으로 반환

        vault = TemporaryDirectory()
        base = Path(vault.name)
        tplPath = base / "t.docx"
        seed = Document()
        for line in ["성명: {{name}}", "직급: {{role}}", "부서: {{team}}"]:
            seed.add_paragraph(line)
        seed.save(tplPath)
        outPath = base / "f.docx"

        replaceInDoc(tplPath, {"name": "김대리"}, outPath)
        sorted(findMissingPlaceholders(outPath))
      hints:
        - "return set(re.findall(r'\\\\{\\\\{[^{}]+\\\\}\\\\}', combined))"
        - "정규식으로 '{{...}}' 형태 모두 모아 set 반환."
    check:
      noError: "re.findall + set 반환."
      resultCheck: "['{{role}}', '{{team}}'] 출력."

  - id: practice
    title: "실습 - 종합 미션"
    subtitle: "양식 채움 함수"
    goal: "단락 + 표 안의 자리표시자를 모두 치환하는 fillTemplate 함수."
    why: "표 셀에 자리표시자가 있는 경우가 많습니다. 단락만 다루면 부족합니다."
    snippet: |-
      from docx import Document
    exercise:
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."
      starterCode: |-
        ___
      hints:
        - "함수: fillTemplate(templatePath, replacements, outPath)"
        - "doc.paragraphs와 doc.tables의 모든 cell.paragraphs 순회."
    check:
      noError: "표 안 셀 순회."
      resultCheck: "자리표시자 잔여 없음."
    blocks:
      - type: expansion
        title: "미션: 단락 + 표 동시 치환"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from docx import Document

              def replaceInRuns(paragraph, replacements):
                  for run in paragraph.runs:
                      for key, value in replacements.items():
                          placeholder = f"{{{{{key}}}}}"
                          if placeholder in run.text:
                              run.text = run.text.replace(placeholder, value)

              def fillTemplate(templatePath, replacements, outPath):
                  doc = Document(templatePath)
                  for p in doc.paragraphs:
                      replaceInRuns(p, replacements)
                  for tbl in doc.tables:
                      for row in tbl.rows:
                          for cell in row.cells:
                              for p in cell.paragraphs:
                                  replaceInRuns(p, replacements)
                  doc.save(outPath)
                  return outPath

              missionDir = TemporaryDirectory()
              base = Path(missionDir.name)
              tplPath = base / "tpl.docx"
              seed = Document()
              seed.add_paragraph("성명: {{name}}")
              tbl = seed.add_table(rows=2, cols=2, style="Table Grid")
              tbl.cell(0, 0).text = "직급"
              tbl.cell(0, 1).text = "{{role}}"
              tbl.cell(1, 0).text = "연봉"
              tbl.cell(1, 1).text = "{{salary}}"
              seed.save(tplPath)

              outPath = base / "filled.docx"
              fillTemplate(tplPath, {"name": "김대리", "role": "대리", "salary": "4,200만"}, outPath)

              filled = Document(outPath)
              combined = "\\n".join(p.text for p in filled.paragraphs)
              combined += "\\n" + "\\n".join(c.text for tbl in filled.tables for row in tbl.rows for c in row.cells)
              assert "{{" not in combined
              assert "김대리" in combined and "대리" in combined and "4,200만" in combined
              combined

  - id: extensions
    title: "확장 변주"
    blocks:
      - type: list
        style: bullet
        items:
          - "머리말·꼬리말 안 자리표시자도 치환"
          - "이미지 자리표시자 ({{logo}} → 실제 이미지 삽입)"
          - "표 행 동적 추가 ({{#each items}} 패턴 - 09강 docxtpl이 더 강력)"
          - "조건부 단락 삭제 ({{#if condition}} 형태)"
          - "08강과 결합 - CSV의 각 행으로 fillTemplate 호출"
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
  - id: word_07-document-patch-plan-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_open
    - extensions
    title: 기존 문서 수정 계획의 대상과 안전장치 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 모호한 대상·원본 덮어쓰기·검증 없는 patch를 차단한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 수정 전에 원본 hash와 새 output path를 고정하세요.
    - 문자열 match count가 정확히 1인지 먼저 검사하세요.
    exercise:
      prompt: audit_patch_plan(plan)를 완성하세요.
      starterCode: |-
        def audit_patch_plan(plan):
            raise NotImplementedError
      solution: |
        def audit_patch_plan(plan):
            required = {"sourceHash", "outputPath", "operations", "reopenVerification"}
            missing = sorted(required - set(plan))
            failures = []
            ambiguous = sorted(op.get("id", "") for op in plan.get("operations", []) if op.get("matchCount") != 1)
            if plan.get("outputPath") == plan.get("sourcePath"):
                failures.append("overwrite")
            if ambiguous:
                failures.append("ambiguous-target")
            if not plan.get("reopenVerification", False):
                failures.append("reopen")
            return {"ready": not missing and not failures, "missing": missing, "failures": failures, "ambiguousOperations": ambiguous}
      hints: *id001
    check:
      id: python.word.word_07.document-patch-plan.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_07.document-patch-plan.mastery.behavior.v1.fixture
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
        entry: audit_patch_plan
        cases:
        - id: accepts-versioned-patch
          arguments:
          - value:
              sourcePath: v1.docx
              sourceHash: sha256:a
              outputPath: v2.docx
              operations:
              - id: op1
                matchCount: 1
              reopenVerification: true
          expectedReturn:
            ready: true
            missing: []
            failures: []
            ambiguousOperations: []
        - id: reports-overwrite-and-ambiguity
          arguments:
          - value:
              sourcePath: report.docx
              sourceHash: sha256:a
              outputPath: report.docx
              operations:
              - id: op1
                matchCount: 2
              reopenVerification: true
          expectedReturn:
            ready: false
            missing: []
            failures:
            - overwrite
            - ambiguous-target
            ambiguousOperations:
            - op1
        - id: reports-missing-and-reopen
          arguments:
          - value:
              sourcePath: a.docx
              outputPath: b.docx
              operations: []
              reopenVerification: false
          expectedReturn:
            ready: false
            missing:
            - sourceHash
            failures:
            - reopen
            ambiguousOperations: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: word_07-document-change-diff-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - word_07-document-patch-plan-mastery
    title: 수정 전후 문서의 의미 diff 계산하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 문단 ID 기준으로 추가·삭제·변경을 분류한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 위치 index 대신 안정적인 문단 ID로 비교하세요.
    - 예상 change count를 release 계약에 포함하세요.
    exercise:
      prompt: document_diff(before, after)를 완성하세요.
      starterCode: |-
        def document_diff(before, after):
            raise NotImplementedError
      solution: |
        def document_diff(before, after):
            old = {item["id"]: item["text"] for item in before}
            new = {item["id"]: item["text"] for item in after}
            added = sorted(set(new) - set(old))
            removed = sorted(set(old) - set(new))
            changed = sorted(key for key in set(old) & set(new) if old[key] != new[key])
            unchanged = sorted(key for key in set(old) & set(new) if old[key] == new[key])
            return {"added": added, "removed": removed, "changed": changed, "unchanged": unchanged, "changeCount": len(added) + len(removed) + len(changed)}
      hints: *id002
    check:
      id: python.word.word_07.document-change-diff.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_07.document-change-diff.transfer.behavior.v1.fixture
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
        entry: document_diff
        cases:
        - id: reports-bounded-change
          arguments:
          - value:
            - id: a
              text: A
            - id: b
              text: B
          - value:
            - id: a
              text: A
            - id: b
              text: B2
            - id: c
              text: C
          expectedReturn:
            added:
            - c
            removed: []
            changed:
            - b
            unchanged:
            - a
            changeCount: 2
        - id: reports-removal
          arguments:
          - value:
            - id: a
              text: A
          - value: []
          expectedReturn:
            added: []
            removed:
            - a
            changed: []
            unchanged: []
            changeCount: 1
        - id: reports-no-change
          arguments:
          - value:
            - id: a
              text: A
          - value:
            - id: a
              text: A
          expectedReturn:
            added: []
            removed: []
            changed: []
            unchanged:
            - a
            changeCount: 0
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: word_07-document-edit-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - word_07-document-change-diff-transfer
    title: 기존 문서 수정 안전 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 원본 고정·대상 식별·diff 검증을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - Web에서는 문서 구조와 업무 불변식을 즉시 검증하세요.
    - Local에서는 저장한 docx를 재개방하고 렌더 결과까지 증거로 남기세요.
    exercise:
      prompt: choose_edit_evidence(stage)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_edit_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_edit_evidence(stage):
            choices = {'source': {'action': 'pin source hash and version', 'evidence': 'immutable input manifest', 'risk': 'editing stale input'}, 'target': {'action': 'require one exact match', 'evidence': 'operation match count', 'risk': 'wrong paragraph changed'}, 'diff': {'action': 'compare semantic before and after', 'evidence': 'bounded change set', 'risk': 'collateral edits'}}
            if stage not in choices:
                raise ValueError('unknown stage')
            return choices[stage]
      hints: *id003
    check:
      id: python.word.word_07.document-edit-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_07.document-edit-recall.retrieval.behavior.v1.fixture
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
        entry: choose_edit_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: pin source hash and version
            evidence: immutable input manifest
            risk: editing stale input
        - id: recalls-target
          arguments:
          - value: target
          expectedReturn:
            action: require one exact match
            evidence: operation match count
            risk: wrong paragraph changed
        - id: recalls-final-stage
          arguments:
          - value: diff
          expectedReturn:
            action: compare semantic before and after
            evidence: bounded change set
            risk: collateral edits
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};