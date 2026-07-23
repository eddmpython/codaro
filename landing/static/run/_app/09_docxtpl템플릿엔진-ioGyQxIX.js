var e=`meta:
  id: word_09
  title: docxtpl 템플릿 엔진
  order: 9
  category: word
  difficulty: ⭐⭐⭐⭐
  badge: 심화
  packages:
    - python-docx
    - docxtpl
  tags:
    - docxtpl
    - Jinja
    - for-loop
    - 영업 제안서
  outcomes:
    - automation.word.template
  prerequisites:
    - automation.word.edit
  estimatedMinutes: 60
  seo:
    title: "docxtpl로 Jinja 템플릿 채우기 - 영업 제안서 for-loop"
    description: "docxtpl로 {{ }}, {% for %} 같은 Jinja 문법을 docx 안에 직접 사용. 견적 항목 for-loop이 압권."
    keywords:
      - docxtpl
      - Jinja docx
      - 영업 제안서 자동화

intro:
  direction: "docxtpl로 Jinja2 문법을 docx 안에 직접 사용한다. {{ }} 단일 치환부터 {% for %} 루프까지."
  benefits:
    - "영업 박과장의 제안서 5건 × 30분이 5건 × 10초로 줄어든다."
    - "견적 항목 표를 Jinja for-loop으로 동적 생성 - python-docx로는 복잡한 작업."
    - "07강 단순 치환 한계(같은 단락 안 두 run 분리 자리표시자)도 docxtpl이 자동 처리."
  diagram:
    steps:
      - label: "1. docxtpl 양식"
        detail: "Word에서 {{ name }}, {% for %} 같은 Jinja 문법을 그대로 적기."
      - label: "2. render(context)"
        detail: "DocxTemplate(path).render(context dict)로 채움."
      - label: "3. save"
        detail: "tpl.save(outPath)로 결과 저장."
    runtime:
      - label: "docxtpl 준비"
        detail: "LGPL 라이선스."
      - label: "검증"
        detail: "결과 docx에 자리표시자 잔여 없고 데이터가 정확히 반영됐는지 assert."

sections:
  - id: step1_simple
    title: "1단계. 단순 치환"
    structuredPrimary: true
    subtitle: "DocxTemplate.render(context)"
    goal: "{{ name }} 단순 자리표시자 양식을 docxtpl로 채운다."
    why: "docxtpl의 가장 단순한 동작입니다. 같은 자리표시자가 여러 run으로 쪼개져 있어도 안전히 처리."
    explanation: |-
      Word(또는 python-docx)로 양식을 만들고 {{ name }} 자리표시자 삽입. DocxTemplate(path).render({'name': '김대리'}) 후 save.
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document
      from docxtpl import DocxTemplate

      workdir = TemporaryDirectory()
      base = Path(workdir.name)
      tplPath = base / "tpl.docx"

      seed = Document()
      seed.add_paragraph("계약자: {{ name }}")
      seed.add_paragraph("직급: {{ role }}")
      seed.save(tplPath)

      tpl = DocxTemplate(str(tplPath))
      tpl.render({"name": "김대리", "role": "대리"})
      outPath = base / "filled.docx"
      tpl.save(outPath)

      [p.text for p in Document(outPath).paragraphs]
    exercise:
      prompt: "context를 박과장/과장으로 바꾸고 결과 단락에 '박과장'이 들어가는지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document
        from docxtpl import DocxTemplate

        workdir = TemporaryDirectory()
        base = Path(workdir.name)
        tplPath = base / "tpl.docx"

        seed = Document()
        seed.add_paragraph("계약자: {{ name }}")
        seed.add_paragraph("직급: {{ role }}")
        seed.save(tplPath)

        tpl = DocxTemplate(str(tplPath))
        tpl.render({"name": ___, "role": ___})
        outPath = base / "f.docx"
        tpl.save(outPath)
        "박과장" in "\\n".join(p.text for p in Document(outPath).paragraphs)
      hints:
        - "두 문자열: '박과장', '과장'."
    check:
      noError: "render 인자는 dict."
      resultCheck: "True 출력."

  - id: step2_for_loop
    title: "2단계. {% for %} 루프"
    structuredPrimary: true
    subtitle: "Jinja for-loop으로 견적 항목"
    goal: "items 리스트를 for-loop으로 단락마다 출력한다."
    why: "영업 제안서의 견적 항목은 N개입니다. 단순 자리표시자로는 표현 불가. Jinja for-loop이 핵심."
    explanation: |-
      양식에 {% for item in items %}{{ item.name }}: {{ item.price }}{% endfor %} 패턴. context의 items 리스트가 자동 반복.
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document
      from docxtpl import DocxTemplate

      workdir = TemporaryDirectory()
      base = Path(workdir.name)
      tplPath = base / "tpl.docx"

      seed = Document()
      seed.add_paragraph("견적서")
      seed.add_paragraph("{% for item in items %}")
      seed.add_paragraph("{{ item.name }}: {{ item.price }}원")
      seed.add_paragraph("{% endfor %}")
      seed.save(tplPath)

      tpl = DocxTemplate(str(tplPath))
      tpl.render({"items": [
          {"name": "구독", "price": "50,000"},
          {"name": "온보딩", "price": "200,000"},
          {"name": "지원", "price": "30,000"},
      ]})
      outPath = base / "filled.docx"
      tpl.save(outPath)

      [p.text for p in Document(outPath).paragraphs]
    exercise:
      prompt: "items에 하나(Service A, 100,000)를 더 추가해 결과 단락 수가 늘어나는지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document
        from docxtpl import DocxTemplate

        workdir = TemporaryDirectory()
        base = Path(workdir.name)
        tplPath = base / "tpl.docx"

        seed = Document()
        seed.add_paragraph("{% for item in items %}")
        seed.add_paragraph("{{ item.name }}: {{ item.price }}원")
        seed.add_paragraph("{% endfor %}")
        seed.save(tplPath)

        tpl = DocxTemplate(str(tplPath))
        tpl.render({"items": [
            {"name": "구독", "price": "50,000"},
            {"name": "온보딩", "price": "200,000"},
            ___,
        ]})
        outPath = base / "f.docx"
        tpl.save(outPath)
        "Service A" in "\\n".join(p.text for p in Document(outPath).paragraphs)
      hints:
        - "dict {'name': 'Service A', 'price': '100,000'}."
    check:
      noError: "items 리스트 원소는 dict."
      resultCheck: "True 출력."

  - id: validation
    title: "3단계. 검증 - 영업 제안서 자동 생성"
    structuredPrimary: true
    subtitle: "단순 + for-loop 결합"
    goal: "고객사·담당자·견적 항목이 모두 들어간 제안서가 정확히 만들어지는지 검증."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document
      from docxtpl import DocxTemplate

      def buildProposalTemplate(path):
          seed = Document()
          seed.add_heading("영업 제안서", level=0)
          seed.add_paragraph("고객사: {{ customer }}")
          seed.add_paragraph("담당자: {{ contact }}")
          seed.add_paragraph("견적 항목:")
          seed.add_paragraph("{% for item in items %}")
          seed.add_paragraph("- {{ item.name }}: {{ item.price }}원")
          seed.add_paragraph("{% endfor %}")
          seed.add_paragraph("합계: {{ total }}원")
          seed.save(path)

      def renderProposal(templatePath, context, outPath):
          tpl = DocxTemplate(str(templatePath))
          tpl.render(context)
          tpl.save(outPath)

      vault = TemporaryDirectory()
      base = Path(vault.name)
      tplPath = base / "proposal_tpl.docx"
      buildProposalTemplate(tplPath)

      outPath = base / "proposal.docx"
      renderProposal(tplPath, {
          "customer": "Acme Corp",
          "contact": "홍대표",
          "items": [
              {"name": "구독", "price": "50,000"},
              {"name": "온보딩", "price": "200,000"},
          ],
          "total": "250,000",
      }, outPath)

      combined = "\\n".join(p.text for p in Document(outPath).paragraphs)
      assert "Acme Corp" in combined
      assert "홍대표" in combined
      assert "구독" in combined and "온보딩" in combined
      assert "250,000" in combined
      assert "{{" not in combined
      combined.strip().splitlines()[:5]
    exercise:
      prompt: "buildProposalTemplate과 renderProposal 본체를 완성하세요 - 양식에는 {% for %} 루프로 items를 출력하고, render는 합계까지 계산해 context에 주입."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document
        from docxtpl import DocxTemplate

        def buildProposalTemplate(path):
            seed = Document()
            seed.add_paragraph("고객: {{ customer }}")
            seed.add_paragraph("{% for item in items %}")
            seed.add_paragraph("- {{ item.name }}: {{ item.price }}원")
            seed.add_paragraph("{% endfor %}")
            seed.add_paragraph("합계: {{ total }}원")
            seed.save(path)

        def renderProposalWithTotal(templatePath, customer, items, outPath):
            total = ___  # items의 각 price(int) 합을 천 단위 구분자 포함 문자열로
            tpl = DocxTemplate(str(templatePath))
            ___  # tpl.render에 customer/items/total dict 전달
            tpl.save(outPath)

        vault = TemporaryDirectory()
        base = Path(vault.name)
        tplPath = base / "t.docx"
        buildProposalTemplate(tplPath)
        outPath = base / "f.docx"

        items = [{"name": "구독", "price": 50000}, {"name": "온보딩", "price": 200000}]
        renderProposalWithTotal(tplPath, "Acme", items, outPath)
        combined = "\\n".join(p.text for p in Document(outPath).paragraphs)
        "Acme" in combined, "250,000" in combined, "{{" not in combined
      hints:
        - "total = f'{sum(item[\\"price\\"] for item in items):,}'"
        - "tpl.render({'customer': customer, 'items': items, 'total': total})"
    check:
      noError: "sum + f-string의 천 단위 포맷 + render dict."
      resultCheck: "(True, True, True) 출력."

  - id: practice
    title: "실습 - 종합 미션"
    subtitle: "다수 제안서 일괄 생성"
    goal: "여러 고객사용 제안서를 한 번에 만든다."
    snippet: |-
      from docxtpl import DocxTemplate
    exercise:
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."
      starterCode: |-
        ___
      hints:
        - "함수: bulkRenderProposals(templatePath, customers, outFolder) -> list[Path]"
    check:
      noError: "함수 정의."
      resultCheck: "고객사별 docx 생성."
    blocks:
      - type: expansion
        title: "미션: 다수 제안서"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from docx import Document
              from docxtpl import DocxTemplate

              def bulkRenderProposals(templatePath, customers, outFolder):
                  Path(outFolder).mkdir(exist_ok=True)
                  outputs = []
                  for customer in customers:
                      tpl = DocxTemplate(str(templatePath))
                      tpl.render(customer)
                      outPath = Path(outFolder) / f"{customer['customer']}.docx"
                      tpl.save(outPath)
                      outputs.append(outPath)
                  return outputs

              missionDir = TemporaryDirectory()
              base = Path(missionDir.name)
              tplPath = base / "tpl.docx"

              seed = Document()
              seed.add_paragraph("고객: {{ customer }}")
              seed.add_paragraph("{% for item in items %}{{ item.name }}: {{ item.price }}원{% endfor %}")
              seed.save(tplPath)

              customers = [
                  {"customer": "AcmeCorp", "items": [{"name": "Sub", "price": "50,000"}]},
                  {"customer": "BetaInc", "items": [{"name": "Sub", "price": "50,000"}, {"name": "Sup", "price": "30,000"}]},
              ]

              outputs = bulkRenderProposals(tplPath, customers, base / "proposals")
              assert len(outputs) == 2
              for path in outputs:
                  combined = "\\n".join(p.text for p in Document(path).paragraphs)
                  assert "{{" not in combined
              [p.name for p in outputs]

  - id: extensions
    title: "확장 변주"
    blocks:
      - type: list
        style: bullet
        items:
          - "{% if %} 조건부 단락 (특정 고객에게만 보이는 안내)"
          - "필터 (date 포맷, 천 단위 구분자)"
          - "표 행 동적 추가 ({% tr for %})"
          - "이미지 동적 삽입 ({{ logo | image }})"
          - "08강 mailMerge와 결합 - docxtpl 기반 N장 생성"
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
  - id: word_09-template-placeholder-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_simple
    - extensions
    title: docxtpl placeholder 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 미정의·미사용·민감 placeholder를 렌더 전에 찾는다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - template field 집합과 context key 집합을 양방향 비교하세요.
    - 민감 필드는 명시적 allowlist 없이는 템플릿 context에 넣지 마세요.
    exercise:
      prompt: audit_placeholders(template_fields, context, allowed_sensitive_fields)를 완성하세요.
      starterCode: |-
        def audit_placeholders(template_fields, context, allowed_sensitive_fields):
            raise NotImplementedError
      solution: |
        def audit_placeholders(template_fields, context, allowed_sensitive_fields):
            fields = set(template_fields)
            keys = set(context)
            missing = sorted(fields - keys)
            extra = sorted(keys - fields)
            sensitive = sorted(key for key in keys if key.lower() in {"password", "token", "secret", "ssn"} and key not in allowed_sensitive_fields)
            failures = []
            if missing:
                failures.append("missing-context")
            if extra:
                failures.append("unused-context")
            if sensitive:
                failures.append("sensitive-field")
            return {"accepted": not failures, "failures": failures, "missing": missing, "extra": extra, "sensitive": sensitive}
      hints: *id001
    check:
      id: python.word.word_09.template-placeholder-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_09.template-placeholder-audit.mastery.behavior.v1.fixture
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
        entry: audit_placeholders
        cases:
        - id: accepts-complete-context
          arguments:
          - value:
            - name
            - date
          - value:
              name: A
              date: '2026-07-22'
          - value: []
          expectedReturn:
            accepted: true
            failures: []
            missing: []
            extra: []
            sensitive: []
        - id: reports-missing-and-extra
          arguments:
          - value:
            - name
            - date
          - value:
              name: A
              note: N
          - value: []
          expectedReturn:
            accepted: false
            failures:
            - missing-context
            - unused-context
            missing:
            - date
            extra:
            - note
            sensitive: []
        - id: reports-sensitive-key
          arguments:
          - value:
            - name
            - token
          - value:
              name: A
              token: raw
          - value: []
          expectedReturn:
            accepted: false
            failures:
            - sensitive-field
            missing: []
            extra: []
            sensitive:
            - token
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: word_09-template-render-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - word_09-template-placeholder-audit-mastery
    title: 다른 템플릿의 렌더 결과 완전성 검증하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 남은 placeholder·필수 문구·페이지 수를 함께 검사한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 렌더 뒤 \`{{ ... }}\` 잔여 패턴을 자동 검사하세요.
    - XML 텍스트뿐 아니라 실제 페이지 수와 필수 문구를 검증하세요.
    exercise:
      prompt: audit_template_render(text, required_phrases, page_count, max_pages)를 완성하세요.
      starterCode: |-
        def audit_template_render(text, required_phrases, page_count, max_pages):
            raise NotImplementedError
      solution: |
        def audit_template_render(text, required_phrases, page_count, max_pages):
            import re
            unresolved = sorted(set(re.findall(r"{{\\s*([^{}]+?)\\s*}}", text)))
            missing_phrases = sorted(phrase for phrase in required_phrases if phrase not in text)
            failures = []
            if unresolved:
                failures.append("placeholders")
            if missing_phrases:
                failures.append("required-text")
            if page_count < 1 or page_count > max_pages:
                failures.append("pagination")
            return {"passed": not failures, "failures": failures, "unresolved": unresolved, "missingPhrases": missing_phrases, "pageCount": page_count}
      hints: *id002
    check:
      id: python.word.word_09.template-render-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_09.template-render-audit.transfer.behavior.v1.fixture
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
        entry: audit_template_render
        cases:
        - id: accepts-complete-render
          arguments:
          - value: '계약서

              고객 A

              서명'
          - value:
            - 계약서
            - 서명
          - value: 2
          - value: 3
          expectedReturn:
            passed: true
            failures: []
            unresolved: []
            missingPhrases: []
            pageCount: 2
        - id: reports-placeholder-and-text
          arguments:
          - value: 고객 {{ name }}
          - value:
            - 서명
          - value: 1
          - value: 2
          expectedReturn:
            passed: false
            failures:
            - placeholders
            - required-text
            unresolved:
            - name
            missingPhrases:
            - 서명
            pageCount: 1
        - id: reports-pagination
          arguments:
          - value: 완료
          - value: []
          - value: 5
          - value: 3
          expectedReturn:
            passed: false
            failures:
            - pagination
            unresolved: []
            missingPhrases: []
            pageCount: 5
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: word_09-template-release-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - word_09-template-render-audit-transfer
    title: Word 템플릿 릴리스 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: schema·context·render 검증을 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - Web에서는 문서 구조와 업무 불변식을 즉시 검증하세요.
    - Local에서는 저장한 docx를 재개방하고 렌더 결과까지 증거로 남기세요.
    exercise:
      prompt: choose_template_evidence(stage)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_template_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_template_evidence(stage):
            choices = {'schema': {'action': 'extract template field set', 'evidence': 'placeholder schema', 'risk': 'unknown inputs'}, 'context': {'action': 'allow only required safe keys', 'evidence': 'context audit', 'risk': 'secret leakage'}, 'render': {'action': 'scan text and pages after render', 'evidence': 'placeholder and pagination report', 'risk': 'unfinished document'}}
            if stage not in choices:
                raise ValueError('unknown stage')
            return choices[stage]
      hints: *id003
    check:
      id: python.word.word_09.template-release-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_09.template-release-recall.retrieval.behavior.v1.fixture
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
        entry: choose_template_evidence
        cases:
        - id: recalls-schema
          arguments:
          - value: schema
          expectedReturn:
            action: extract template field set
            evidence: placeholder schema
            risk: unknown inputs
        - id: recalls-context
          arguments:
          - value: context
          expectedReturn:
            action: allow only required safe keys
            evidence: context audit
            risk: secret leakage
        - id: recalls-final-stage
          arguments:
          - value: render
          expectedReturn:
            action: scan text and pages after render
            evidence: placeholder and pagination report
            risk: unfinished document
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};