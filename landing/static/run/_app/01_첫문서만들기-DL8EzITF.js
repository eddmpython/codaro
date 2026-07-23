var e=`meta:
  id: word_01
  title: 첫 Word 문서 만들기
  order: 1
  category: word
  difficulty: ⭐
  badge: 입문
  packages:
    - python-docx
  tags:
    - Document
    - add_paragraph
    - save
  outcomes:
    - automation.word.paragraphs
  prerequisites:
    - automation.word.intro
  estimatedMinutes: 35
  seo:
    title: "python-docx 첫 문서 - Document·add_paragraph·save"
    description: "python-docx로 첫 docx 파일을 만든다. Document 객체와 단락의 기본 구조를 손에 익힌다."
    keywords:
      - python-docx Document
      - add_paragraph
      - docx save

intro:
  direction: "python-docx의 가장 단순한 흐름 - Document 만들고, 단락 추가하고, 저장. 본 트랙의 모든 강의가 이 형태에서 확장된다."
  benefits:
    - "Document → 단락 → save 3 단계 흐름이 손에 박힌다."
    - "TemporaryDirectory + 재오픈 assert 검증 패턴이 본 강의에 안착."
    - "10강까지의 모든 함수가 본 형태를 시작점으로 가짐."
  diagram:
    steps:
      - label: "1. Document 생성"
        detail: "Document() 호출로 빈 docx 객체."
      - label: "2. 단락 추가"
        detail: "doc.add_paragraph(text)로 한 줄씩."
      - label: "3. 저장"
        detail: "doc.save(path)로 파일 쓰기."
      - label: "4. 재오픈 검증"
        detail: "Document(path)로 다시 열어 doc.paragraphs로 확인."
    runtime:
      - label: "외부 의존"
        detail: "python-docx만 meta.packages 기준으로 준비합니다."
      - label: "검증"
        detail: "TemporaryDirectory + Document 재오픈 + paragraphs assert."

sections:
  - id: step1_create
    title: "1단계. Document 만들고 저장"
    structuredPrimary: true
    subtitle: "Document(), add_paragraph, save"
    goal: "단락 두 개가 있는 docx 파일을 임시 폴더에 만든다."
    why: "python-docx 모든 자동화의 출발점입니다. 한 함수 호출 안에 Document → 단락 → save 흐름이 들어가는 패턴이 모든 후속 강의의 기본이며, 보고서·계약서·회의록 등 어떤 한국 사무 양식이든 결국 이 세 줄에서 확장됩니다."
    explanation: |-
      Document()는 빈 워드 문서 객체. add_paragraph(text)는 새 단락을 추가하고 Paragraph 객체를 돌려줍니다. save(path)는 .docx 파일을 디스크에 씁니다.
    tips:
      - "Document()에 인자 없이 호출하면 빈 새 문서. 인자에 경로를 주면 기존 docx를 엽니다 (07강에서 활용)."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document

      workdir = TemporaryDirectory()
      pdfPath = Path(workdir.name) / "hello.docx"

      doc = Document()
      doc.add_paragraph("Hello docx")
      doc.add_paragraph("Codaro Word lesson 01")
      doc.save(pdfPath)

      reopened = Document(pdfPath)
      [p.text for p in reopened.paragraphs]
    exercise:
      prompt: "단락 한 줄 더 추가해 '본문 셋째 줄'을 넣고 paragraphs 길이가 3인지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document

        workdir = TemporaryDirectory()
        docxPath = Path(workdir.name) / "hello.docx"

        doc = Document()
        doc.add_paragraph("Hello docx")
        doc.add_paragraph("Codaro Word lesson 01")
        doc.add_paragraph(___)
        doc.save(docxPath)

        len(Document(docxPath).paragraphs)
      hints:
        - "문자열 '본문 셋째 줄'."
    check:
      noError: "add_paragraph 인자는 문자열."
      resultCheck: "출력 3."

  - id: step2_paragraph_object
    title: "2단계. Paragraph 객체 조작"
    structuredPrimary: true
    subtitle: "add_paragraph 반환값 활용"
    goal: "add_paragraph가 돌려주는 Paragraph 객체로 정렬·style을 지정한다."
    why: "Paragraph 객체에 추가 속성을 설정해야 정렬·스타일이 적용됩니다. 변수에 받아 사용하는 패턴."
    explanation: |-
      p = doc.add_paragraph(text) 후 p.alignment = WD_ALIGN_PARAGRAPH.CENTER로 정렬, p.style = 'Heading 1'로 미리 정의된 스타일 적용.
    tips:
      - "alignment enum은 from docx.enum.text import WD_ALIGN_PARAGRAPH."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document
      from docx.enum.text import WD_ALIGN_PARAGRAPH

      workdir = TemporaryDirectory()
      docxPath = Path(workdir.name) / "p.docx"

      doc = Document()
      title = doc.add_paragraph("월간 보고서")
      title.alignment = WD_ALIGN_PARAGRAPH.CENTER
      body = doc.add_paragraph("본문입니다.")
      doc.save(docxPath)

      reopened = Document(docxPath)
      reopened.paragraphs[0].text, reopened.paragraphs[0].alignment
    exercise:
      prompt: "본문 단락을 RIGHT 정렬로 바꾸세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document
        from docx.enum.text import WD_ALIGN_PARAGRAPH

        workdir = TemporaryDirectory()
        docxPath = Path(workdir.name) / "p.docx"

        doc = Document()
        body = doc.add_paragraph("본문")
        body.alignment = WD_ALIGN_PARAGRAPH.___
        doc.save(docxPath)

        Document(docxPath).paragraphs[0].alignment == WD_ALIGN_PARAGRAPH.RIGHT
      hints:
        - "enum 값 RIGHT."
    check:
      noError: "WD_ALIGN_PARAGRAPH enum 값."
      resultCheck: "True 출력."

  - id: validation
    title: "3단계. 검증 루프 - 재오픈 + paragraphs assert"
    structuredPrimary: true
    subtitle: "buildHelloDoc + Document 재오픈"
    goal: "buildHelloDoc 함수의 결과를 재오픈해 의도한 단락이 모두 있는지 한 셀에서 검증한다."
    why: "Word 자동화의 핵심 검증 패턴 - 저장 후 다시 열어 paragraphs로 확인."
    explanation: |-
      함수가 docx를 만들고, 결과를 Document로 다시 열어 paragraphs 텍스트와 길이를 한 묶음 assert.
    tips:
      - "paragraphs 길이는 빈 단락도 포함될 수 있습니다. 검증할 때 strip() 후 비교."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document

      def buildHelloDoc(path, lines):
          doc = Document()
          for line in lines:
              doc.add_paragraph(line)
          doc.save(path)

      vault = TemporaryDirectory()
      docxPath = Path(vault.name) / "h.docx"
      buildHelloDoc(docxPath, ["alpha", "beta", "gamma"])

      reopened = Document(docxPath)
      assert len(reopened.paragraphs) == 3
      assert reopened.paragraphs[0].text == "alpha"
      assert reopened.paragraphs[2].text == "gamma"
      [p.text for p in reopened.paragraphs]
    exercise:
      prompt: "buildLabeledDoc 함수를 완성하세요 - 각 줄 앞에 '[N] '(1부터 시작하는 번호) 접두사를 붙여 단락으로 저장."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document

        def buildLabeledDoc(path, lines):
            doc = Document()
            for idx, line in enumerate(lines, start=1):
                ___  # 단락 추가: f"[{idx}] {line}"
            doc.save(path)

        vault = TemporaryDirectory()
        docxPath = Path(vault.name) / "h.docx"
        buildLabeledDoc(docxPath, ["alpha", "beta", "gamma"])
        [p.text for p in Document(docxPath).paragraphs]
      hints:
        - "doc.add_paragraph(f'[{idx}] {line}')"
        - "f-string으로 번호와 본문을 하나의 문자열로."
    check:
      noError: "doc.add_paragraph 호출 한 번."
      resultCheck: "출력 ['[1] alpha', '[2] beta', '[3] gamma']."

  - id: practice
    title: "실습 - 종합 미션"
    subtitle: "텍스트 → docx 변환기"
    goal: "텍스트 파일의 각 줄을 단락으로 변환하는 함수를 만든다."
    why: "텍스트에서 docx로의 변환은 빈도 높은 작업입니다. 회의 메모(.txt)를 양식 docx로 옮기는 첫 단계."
    explanation: |-
      미션: linesFileToDocx(textPath, docxPath) 함수. 텍스트 파일을 읽고 각 줄을 단락으로 변환.
    tips:
      - "빈 줄도 단락으로 살릴지 무시할지 선택하세요. 본 미션은 strip 후 빈 줄 무시."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document
    exercise:
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."
      starterCode: |-
        ___
      hints:
        - "함수: linesFileToDocx(textPath, docxPath) -> int (생성된 단락 수)"
    check:
      noError: "함수 정의 + 검증."
      resultCheck: "단락 수가 텍스트 파일 의미 줄 수와 같아야 함."
    blocks:
      - type: expansion
        title: "미션: 텍스트 → docx"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from docx import Document

              def linesFileToDocx(textPath, docxPath):
                  lines = [line.strip() for line in Path(textPath).read_text(encoding="utf-8").splitlines() if line.strip()]
                  doc = Document()
                  for line in lines:
                      doc.add_paragraph(line)
                  doc.save(docxPath)
                  return len(lines)

              missionDir = TemporaryDirectory()
              base = Path(missionDir.name)
              textPath = base / "memo.txt"
              textPath.write_text("alpha\\n\\nbeta\\ngamma\\n", encoding="utf-8")
              docxPath = base / "memo.docx"

              count = linesFileToDocx(textPath, docxPath)
              assert count == 3
              reopened = Document(docxPath)
              assert len(reopened.paragraphs) == 3
              assert reopened.paragraphs[1].text == "beta"
              [p.text for p in reopened.paragraphs]

  - id: extensions
    title: "확장 변주"
    blocks:
      - type: list
        style: bullet
        items:
          - "마크다운 파일(.md)에서 # 시작 줄은 add_heading, 나머지는 add_paragraph로 변환"
          - "URL 자동 감지해 하이퍼링크 단락으로 변환"
          - "빈 줄을 명시적 빈 단락(스페이서)으로 살리기"
          - "리스트(- item) 표기를 add_paragraph(style='List Bullet')로 변환"
          - "여러 텍스트 파일을 한 docx에 묶음 (장(章) 구분 페이지 break)"
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
  - id: word_01-document-plan-contract-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_create
    - extensions
    title: Word 문서의 문단 계획과 산출물 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 빈 문단·중복 ID·잘못된 확장자를 저장 전에 차단한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 문단마다 안정적인 ID와 비어 있지 않은 text를 요구하세요.
    - 저장 성공은 내용 정확성의 증거가 아니므로 둘을 분리하세요.
    exercise:
      prompt: audit_document_plan(file_name, paragraphs)를 완성하세요.
      starterCode: |-
        def audit_document_plan(file_name, paragraphs):
            raise NotImplementedError
      solution: |
        def audit_document_plan(file_name, paragraphs):
            failures = []
            ids = [item.get("id") for item in paragraphs]
            empty = sorted(item.get("id", "") for item in paragraphs if not str(item.get("text", "")).strip())
            duplicates = sorted({value for value in ids if value and ids.count(value) > 1})
            if not str(file_name).lower().endswith(".docx"):
                failures.append("extension")
            if not paragraphs:
                failures.append("paragraphs")
            if empty:
                failures.append("empty-text")
            if duplicates or any(not value for value in ids):
                failures.append("identity")
            return {"accepted": not failures, "failures": failures, "empty": empty, "duplicates": duplicates, "paragraphCount": len(paragraphs)}
      hints: *id001
    check:
      id: python.word.word_01.document-plan-contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_01.document-plan-contract.mastery.behavior.v1.fixture
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
        entry: audit_document_plan
        cases:
        - id: accepts-bounded-document
          arguments:
          - value: report.docx
          - value:
            - id: p1
              text: 제목
            - id: p2
              text: 본문
          expectedReturn:
            accepted: true
            failures: []
            empty: []
            duplicates: []
            paragraphCount: 2
        - id: reports-empty-and-duplicate
          arguments:
          - value: report.docx
          - value:
            - id: p1
              text: ' '
            - id: p1
              text: 본문
          expectedReturn:
            accepted: false
            failures:
            - empty-text
            - identity
            empty:
            - p1
            duplicates:
            - p1
            paragraphCount: 2
        - id: reports-extension-and-missing-content
          arguments:
          - value: report.txt
          - value: []
          expectedReturn:
            accepted: false
            failures:
            - extension
            - paragraphs
            empty: []
            duplicates: []
            paragraphCount: 0
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: word_01-paragraph-reopen-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - word_01-document-plan-contract-mastery
    title: 재개방한 문단을 원래 계획과 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 순서·텍스트·누락을 분리해 문서 artifact를 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 재개방 결과를 index가 아니라 문단 ID로 먼저 대조하세요.
    - 구성원·텍스트·순서 실패를 따로 보여 주세요.
    exercise:
      prompt: reconcile_paragraphs(planned, observed)를 완성하세요.
      starterCode: |-
        def reconcile_paragraphs(planned, observed):
            raise NotImplementedError
      solution: |
        def reconcile_paragraphs(planned, observed):
            planned_map = {item["id"]: item["text"] for item in planned}
            observed_map = {item["id"]: item["text"] for item in observed}
            missing = sorted(set(planned_map) - set(observed_map))
            extra = sorted(set(observed_map) - set(planned_map))
            changed = sorted(key for key in set(planned_map) & set(observed_map) if planned_map[key] != observed_map[key])
            order_match = [item["id"] for item in planned] == [item["id"] for item in observed]
            failures = []
            if missing or extra:
                failures.append("membership")
            if changed:
                failures.append("text")
            if not order_match:
                failures.append("order")
            return {"passed": not failures, "failures": failures, "missing": missing, "extra": extra, "changed": changed, "orderMatch": order_match}
      hints: *id002
    check:
      id: python.word.word_01.paragraph-reopen-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_01.paragraph-reopen-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_paragraphs
        cases:
        - id: accepts-exact-reopen
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
              text: B
          expectedReturn:
            passed: true
            failures: []
            missing: []
            extra: []
            changed: []
            orderMatch: true
        - id: reports-text-and-order
          arguments:
          - value:
            - id: a
              text: A
            - id: b
              text: B
          - value:
            - id: b
              text: 수정
            - id: a
              text: A
          expectedReturn:
            passed: false
            failures:
            - text
            - order
            missing: []
            extra: []
            changed:
            - b
            orderMatch: false
        - id: reports-membership
          arguments:
          - value:
            - id: a
              text: A
          - value:
            - id: x
              text: X
          expectedReturn:
            passed: false
            failures:
            - membership
            - order
            missing:
            - a
            extra:
            - x
            changed: []
            orderMatch: false
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: word_01-document-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - word_01-paragraph-reopen-reconciliation-transfer
    title: Word 기본 산출물 증거 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 계획·저장·재개방 검증의 차이를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - Web에서는 문서 구조와 업무 불변식을 즉시 검증하세요.
    - Local에서는 저장한 docx를 재개방하고 렌더 결과까지 증거로 남기세요.
    exercise:
      prompt: choose_document_evidence(stage)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_document_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_document_evidence(stage):
            choices = {'plan': {'action': 'define paragraph ids and text', 'evidence': 'document plan', 'risk': 'ambiguous content'}, 'save': {'action': 'write bounded docx', 'evidence': 'path size hash', 'risk': 'partial artifact'}, 'reopen': {'action': 'read paragraphs from saved docx', 'evidence': 'ordered text reconciliation', 'risk': 'valid package with wrong content'}}
            if stage not in choices:
                raise ValueError('unknown stage')
            return choices[stage]
      hints: *id003
    check:
      id: python.word.word_01.document-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_01.document-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_document_evidence
        cases:
        - id: recalls-plan
          arguments:
          - value: plan
          expectedReturn:
            action: define paragraph ids and text
            evidence: document plan
            risk: ambiguous content
        - id: recalls-save
          arguments:
          - value: save
          expectedReturn:
            action: write bounded docx
            evidence: path size hash
            risk: partial artifact
        - id: recalls-final-stage
          arguments:
          - value: reopen
          expectedReturn:
            action: read paragraphs from saved docx
            evidence: ordered text reconciliation
            risk: valid package with wrong content
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};