var e=`meta:
  id: word_02
  title: 제목과 목록
  order: 2
  category: word
  difficulty: ⭐
  badge: 입문
  packages:
    - python-docx
  tags:
    - add_heading
    - List Bullet
    - List Number
  outcomes:
    - automation.word.paragraphs
  prerequisites:
    - automation.word.paragraphs
  estimatedMinutes: 35
  seo:
    title: "Word 제목과 목록 - add_heading + List Bullet/Number"
    description: "보고서 목차 골격을 만든다. add_heading 레벨별 제목과 List Bullet/Number 스타일로 정렬된 목록."
    keywords:
      - python-docx add_heading
      - List Bullet
      - 목차 골격

intro:
  direction: "보고서 목차 골격을 코드로 만든다. add_heading 레벨 1-3과 List Bullet/Number 스타일이 한 문서에 결합되는 패턴."
  benefits:
    - "보고서 목차 자동 생성 - 헤더 + 본문 + 항목 구조를 한 함수 호출로."
    - "List Bullet/Number 스타일이 docx 표준 스타일과 일관됨."
    - "10강 회의록 자동 생성기의 목차 골격 패턴이 본 강의에서 정착."
  diagram:
    steps:
      - label: "1. add_heading 레벨"
        detail: "level 0(제목) ~ 9까지 헤더 단계 지정."
      - label: "2. List Bullet/Number"
        detail: "add_paragraph(text, style='List Bullet') 또는 'List Number'."
      - label: "3. 목차 골격 함수"
        detail: "딕셔너리 구조를 받아 헤더 + 항목 묶음 자동 생성."
    runtime:
      - label: "python-docx 기본 스타일"
        detail: "List Bullet, List Number는 미리 정의된 스타일."
      - label: "검증"
        detail: "paragraphs의 style.name으로 목록 스타일 확인."

sections:
  - id: step1_heading
    title: "1단계. add_heading 레벨"
    structuredPrimary: true
    subtitle: "doc.add_heading(text, level)"
    goal: "제목·소제목·부제목 3 레벨의 헤더가 들어간 문서를 만든다."
    why: "보고서 구조의 첫 단계입니다. 레벨이 일관되면 자동 목차 생성도 가능합니다."
    explanation: |-
      doc.add_heading(text, level=N)은 Heading N 스타일을 적용한 단락 추가. level=0은 Title, 1-9는 Heading 1-9.
    tips:
      - "Heading 0은 문서 한 번만 사용. level=1부터가 본문 구조의 시작."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document

      workdir = TemporaryDirectory()
      docxPath = Path(workdir.name) / "headings.docx"

      doc = Document()
      doc.add_heading("월간 보고서", level=0)
      doc.add_heading("1. 매출 현황", level=1)
      doc.add_heading("1.1. 지역별", level=2)
      doc.add_paragraph("Seoul 1,200,000원")
      doc.save(docxPath)

      reopened = Document(docxPath)
      [(p.text, p.style.name) for p in reopened.paragraphs]
    exercise:
      prompt: "Heading level 2 한 줄 더 추가('1.2. 분기별')하고 paragraphs가 5개인지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document

        workdir = TemporaryDirectory()
        docxPath = Path(workdir.name) / "h.docx"

        doc = Document()
        doc.add_heading("월간 보고서", level=0)
        doc.add_heading("1. 매출 현황", level=1)
        doc.add_heading("1.1. 지역별", level=2)
        doc.add_heading(___, level=2)
        doc.add_paragraph("Seoul 1,200,000원")
        doc.save(docxPath)

        len(Document(docxPath).paragraphs)
      hints:
        - "문자열 '1.2. 분기별'."
    check:
      noError: "level은 정수."
      resultCheck: "출력 5."

  - id: step2_lists
    title: "2단계. List Bullet과 List Number"
    structuredPrimary: true
    subtitle: "style='List Bullet' 또는 'List Number'"
    goal: "글머리 기호 목록과 번호 매김 목록을 한 문서에 둔다."
    why: "보고서의 행동 항목·결정사항은 거의 항상 목록입니다. 표준 스타일을 쓰면 docx 클라이언트에서 일관되게 보입니다."
    explanation: |-
      doc.add_paragraph(text, style='List Bullet')은 글머리 기호, style='List Number'는 번호 매김. 같은 스타일을 연속 사용하면 같은 목록으로 그룹화됩니다.
    tips:
      - "스타일명은 영어. 한글 번들에도 영어 스타일명이 그대로 동작합니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document

      workdir = TemporaryDirectory()
      docxPath = Path(workdir.name) / "lists.docx"

      doc = Document()
      doc.add_heading("결정 사항", level=1)
      doc.add_paragraph("긴급 이슈 우선", style="List Number")
      doc.add_paragraph("정기 회의 주 1회", style="List Number")
      doc.add_heading("액션 아이템", level=1)
      doc.add_paragraph("김대리: 보고서 작성", style="List Bullet")
      doc.add_paragraph("박과장: 검토", style="List Bullet")
      doc.save(docxPath)

      [(p.text, p.style.name) for p in Document(docxPath).paragraphs]
    exercise:
      prompt: "액션 아이템 목록에 한 줄('이주임: 발송') 더 추가하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document

        workdir = TemporaryDirectory()
        docxPath = Path(workdir.name) / "l.docx"

        doc = Document()
        doc.add_heading("결정", level=1)
        doc.add_paragraph("a", style="List Number")
        doc.add_heading("액션", level=1)
        doc.add_paragraph("김대리", style="List Bullet")
        doc.add_paragraph(___, style="List Bullet")
        doc.save(docxPath)

        len(Document(docxPath).paragraphs)
      hints:
        - "문자열 '이주임: 발송'."
    check:
      noError: "style 인자는 문자열."
      resultCheck: "출력 5."

  - id: validation
    title: "3단계. 검증 - 목차 골격 통합"
    structuredPrimary: true
    subtitle: "buildReportSkeleton + 스타일 확인"
    goal: "보고서 골격을 만드는 함수 결과의 헤더 레벨과 목록 스타일을 한 셀에서 검증한다."
    why: "구조가 정확해야 자동 목차 생성, 후속 단계 가공이 안정적입니다."
    explanation: |-
      buildReportSkeleton(path, sections)은 sections dict 리스트를 받아 헤더와 항목 목록을 생성. 결과의 style.name이 의도와 같은지 검증.
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document

      def buildReportSkeleton(path, sections):
          doc = Document()
          doc.add_heading("월간 보고서", level=0)
          for section in sections:
              doc.add_heading(section["title"], level=section.get("level", 1))
              for item in section.get("items", []):
                  doc.add_paragraph(item, style="List Bullet")
          doc.save(path)

      vault = TemporaryDirectory()
      docxPath = Path(vault.name) / "skel.docx"
      buildReportSkeleton(docxPath, [
          {"title": "1. 매출", "level": 1, "items": ["Seoul 120만", "Busan 80만"]},
          {"title": "2. 비용", "level": 1, "items": ["인건비", "운영비"]},
      ])

      reopened = Document(docxPath)
      assert reopened.paragraphs[0].style.name == "Title"
      bullets = [p for p in reopened.paragraphs if p.style.name == "List Bullet"]
      assert len(bullets) == 4
      [(p.text, p.style.name) for p in reopened.paragraphs]
    exercise:
      prompt: "buildReportSkeleton 함수의 빈 줄을 채우세요 - 각 section의 items를 List Number 스타일(번호 매김)로 출력하도록."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document

        def buildReportSkeleton(path, sections):
            doc = Document()
            doc.add_heading("월간 보고서", level=0)
            for section in sections:
                doc.add_heading(section["title"], level=section.get("level", 1))
                for item in section.get("items", []):
                    ___  # item을 'List Number' 스타일로 단락 추가
            doc.save(path)

        vault = TemporaryDirectory()
        docxPath = Path(vault.name) / "s.docx"
        buildReportSkeleton(docxPath, [
            {"title": "1. 매출", "level": 1, "items": ["Seoul", "Busan"]},
            {"title": "2. 비용", "level": 1, "items": ["인건비", "운영비"]},
        ])
        numbered = [p for p in Document(docxPath).paragraphs if p.style.name == "List Number"]
        len(numbered)
      hints:
        - "doc.add_paragraph(item, style='List Number')"
        - "style 키워드 인자에 'List Number' 전달."
    check:
      noError: "add_paragraph style 인자 활용."
      resultCheck: "출력 4 (List Number 단락 4개)."

  - id: practice
    title: "실습 - 종합 미션"
    subtitle: "목차 골격 생성기"
    goal: "데이터 dict를 받아 헤더 + 본문 + 목록이 들어간 보고서 골격 함수를 만든다."
    why: "헤더 + 본문 + 목록이 결합된 골격은 한국식 주간 보고서·임원 브리핑·기획서의 99%가 따르는 형태입니다. 본 강의 패턴이 10강 회의록 생성기의 핵심 구조로 그대로 들어가며, dict → docx 매핑 사고가 모든 문서 자동화의 출발점이 됩니다."
    explanation: |-
      미션: buildReportSkeleton에 본문 단락(items 외의 'body' 키)도 추가하도록 확장.
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document
    exercise:
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."
      starterCode: |-
        ___
      hints:
        - "함수 시그니처: buildReportSkeleton(path, title, sections) -> None"
    check:
      noError: "함수 정의."
      resultCheck: "title/headings/body/lists 모두 결과에 포함."
    blocks:
      - type: expansion
        title: "미션: 본문 포함 목차 골격"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from docx import Document

              def buildReportSkeleton(path, title, sections):
                  doc = Document()
                  doc.add_heading(title, level=0)
                  for section in sections:
                      doc.add_heading(section["title"], level=section.get("level", 1))
                      if section.get("body"):
                          doc.add_paragraph(section["body"])
                      for item in section.get("items", []):
                          doc.add_paragraph(item, style="List Bullet")
                  doc.save(path)

              missionDir = TemporaryDirectory()
              docxPath = Path(missionDir.name) / "report.docx"
              buildReportSkeleton(docxPath, "Codaro 월간 보고", [
                  {
                      "title": "1. 매출",
                      "level": 1,
                      "body": "지난 달 대비 +12%",
                      "items": ["Seoul 120만", "Busan 80만"],
                  },
                  {
                      "title": "2. 액션",
                      "level": 1,
                      "items": ["김대리 보고서 작성", "박과장 검토"],
                  },
              ])

              reopened = Document(docxPath)
              titles = [p for p in reopened.paragraphs if p.style.name == "Title"]
              h1s = [p for p in reopened.paragraphs if p.style.name == "Heading 1"]
              bullets = [p for p in reopened.paragraphs if p.style.name == "List Bullet"]
              assert len(titles) == 1
              assert len(h1s) == 2
              assert len(bullets) == 4
              [(p.text, p.style.name) for p in reopened.paragraphs]

  - id: extensions
    title: "확장 변주"
    blocks:
      - type: list
        style: bullet
        items:
          - "헤더 레벨에 따라 자동 들여쓰기 본문"
          - "목록을 dict로 받아 중첩 목록 (Level Bullet 2 사용)"
          - "각 헤더 끝에 PageBreak 추가 (10강 회의록 결합)"
          - "TOC 필드 자동 삽입 (사용자가 Word에서 업데이트)"
          - "마크다운 → docx 변환기 (# → Heading, - → List Bullet)"
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
  - id: word_02-outline-hierarchy-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_heading
    - extensions
    title: 제목과 목록의 계층 구조 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: heading level 점프와 고아 목록 항목을 차단한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - heading level은 한 단계씩 깊어져야 문서 탐색이 안정적입니다.
    - 목록은 의미를 주는 앞선 heading 아래에 두세요.
    exercise:
      prompt: audit_outline(blocks)를 완성하세요.
      starterCode: |-
        def audit_outline(blocks):
            raise NotImplementedError
      solution: |
        def audit_outline(blocks):
            failures = []
            heading_jumps = []
            orphan_lists = []
            previous_level = 0
            seen_heading = False
            for index, block in enumerate(blocks):
                kind = block.get("kind")
                if kind == "heading":
                    level = int(block.get("level", 0))
                    if level < 1 or level > 9 or (previous_level and level > previous_level + 1):
                        heading_jumps.append(index)
                    previous_level = level
                    seen_heading = True
                elif kind == "list" and not seen_heading:
                    orphan_lists.append(index)
            if not blocks:
                failures.append("empty")
            if heading_jumps:
                failures.append("heading-level")
            if orphan_lists:
                failures.append("orphan-list")
            return {"accepted": not failures, "failures": failures, "headingJumps": heading_jumps, "orphanLists": orphan_lists}
      hints: *id001
    check:
      id: python.word.word_02.outline-hierarchy-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_02.outline-hierarchy-audit.mastery.behavior.v1.fixture
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
        entry: audit_outline
        cases:
        - id: accepts-readable-outline
          arguments:
          - value:
            - kind: heading
              level: 1
            - kind: heading
              level: 2
            - kind: list
          expectedReturn:
            accepted: true
            failures: []
            headingJumps: []
            orphanLists: []
        - id: reports-level-jump
          arguments:
          - value:
            - kind: heading
              level: 1
            - kind: heading
              level: 3
          expectedReturn:
            accepted: false
            failures:
            - heading-level
            headingJumps:
            - 1
            orphanLists: []
        - id: reports-orphan-and-empty
          arguments:
          - value:
            - kind: list
          expectedReturn:
            accepted: false
            failures:
            - orphan-list
            headingJumps: []
            orphanLists:
            - 0
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: word_02-outline-navigation-map-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - word_02-outline-hierarchy-audit-mastery
    title: 다른 보고서의 목차 탐색 맵 만들기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: heading 경로와 목록 번호를 결정론적으로 계산한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - heading stack을 level에 맞춰 잘라 경로를 만드세요.
    - 번호는 시각적 glyph가 아니라 구조에서 계산하세요.
    exercise:
      prompt: build_outline_map(blocks)를 완성하세요.
      starterCode: |-
        def build_outline_map(blocks):
            raise NotImplementedError
      solution: |
        def build_outline_map(blocks):
            path = []
            result = []
            counters = {}
            for block in blocks:
                if block["kind"] == "heading":
                    level = block["level"]
                    path = path[:level - 1] + [block["text"]]
                    counters = {key: value for key, value in counters.items() if key < level}
                    result.append({"kind": "heading", "path": " > ".join(path)})
                else:
                    level = len(path)
                    counters[level] = counters.get(level, 0) + 1
                    result.append({"kind": "list", "path": " > ".join(path), "number": counters[level]})
            return result
      hints: *id002
    check:
      id: python.word.word_02.outline-navigation-map.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_02.outline-navigation-map.transfer.behavior.v1.fixture
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
        entry: build_outline_map
        cases:
        - id: maps-section-list
          arguments:
          - value:
            - kind: heading
              level: 1
              text: 요약
            - kind: list
              text: A
            - kind: list
              text: B
          expectedReturn:
          - kind: heading
            path: 요약
          - kind: list
            path: 요약
            number: 1
          - kind: list
            path: 요약
            number: 2
        - id: maps-nested-heading
          arguments:
          - value:
            - kind: heading
              level: 1
              text: 보고
            - kind: heading
              level: 2
              text: 위험
            - kind: list
              text: R
          expectedReturn:
          - kind: heading
            path: 보고
          - kind: heading
            path: 보고 > 위험
          - kind: list
            path: 보고 > 위험
            number: 1
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: word_02-outline-rule-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - word_02-outline-navigation-map-transfer
    title: Word 개요 구조 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 제목·목록·목차의 역할을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - Web에서는 문서 구조와 업무 불변식을 즉시 검증하세요.
    - Local에서는 저장한 docx를 재개방하고 렌더 결과까지 증거로 남기세요.
    exercise:
      prompt: choose_outline_rule(stage)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_outline_rule(stage):
            raise NotImplementedError
      solution: |
        def choose_outline_rule(stage):
            choices = {'heading': {'action': 'use semantic heading levels', 'evidence': 'outline path', 'risk': 'visual-only hierarchy'}, 'list': {'action': 'bind items to a section', 'evidence': 'list parent and order', 'risk': 'orphan items'}, 'navigation': {'action': 'inspect generated outline', 'evidence': 'reopened heading map', 'risk': 'unscannable document'}}
            if stage not in choices:
                raise ValueError('unknown stage')
            return choices[stage]
      hints: *id003
    check:
      id: python.word.word_02.outline-rule-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_02.outline-rule-recall.retrieval.behavior.v1.fixture
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
        entry: choose_outline_rule
        cases:
        - id: recalls-heading
          arguments:
          - value: heading
          expectedReturn:
            action: use semantic heading levels
            evidence: outline path
            risk: visual-only hierarchy
        - id: recalls-list
          arguments:
          - value: list
          expectedReturn:
            action: bind items to a section
            evidence: list parent and order
            risk: orphan items
        - id: recalls-final-stage
          arguments:
          - value: navigation
          expectedReturn:
            action: inspect generated outline
            evidence: reopened heading map
            risk: unscannable document
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};