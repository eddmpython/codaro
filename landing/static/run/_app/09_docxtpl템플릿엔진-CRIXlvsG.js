var e=`meta:\r
  id: word_09\r
  title: docxtpl 템플릿 엔진\r
  order: 9\r
  category: word\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  packages:\r
    - python-docx\r
    - docxtpl\r
  tags:\r
    - docxtpl\r
    - Jinja\r
    - for-loop\r
    - 영업 제안서\r
  outcomes:\r
    - automation.word.template\r
  prerequisites:\r
    - automation.word.edit\r
  estimatedMinutes: 60\r
  seo:\r
    title: "docxtpl로 Jinja 템플릿 채우기 - 영업 제안서 for-loop"\r
    description: "docxtpl로 {{ }}, {% for %} 같은 Jinja 문법을 docx 안에 직접 사용. 견적 항목 for-loop이 압권."\r
    keywords:\r
      - docxtpl\r
      - Jinja docx\r
      - 영업 제안서 자동화\r
\r
intro:\r
  direction: "docxtpl로 Jinja2 문법을 docx 안에 직접 사용한다. {{ }} 단일 치환부터 {% for %} 루프까지."\r
  benefits:\r
    - "영업 박과장의 제안서 5건 × 30분이 5건 × 10초로 줄어든다."\r
    - "견적 항목 표를 Jinja for-loop으로 동적 생성 - python-docx로는 복잡한 작업."\r
    - "07강 단순 치환 한계(같은 단락 안 두 run 분리 자리표시자)도 docxtpl이 자동 처리."\r
  diagram:\r
    steps:\r
      - label: "1. docxtpl 양식"\r
        detail: "Word에서 {{ name }}, {% for %} 같은 Jinja 문법을 그대로 적기."\r
      - label: "2. render(context)"\r
        detail: "DocxTemplate(path).render(context dict)로 채움."\r
      - label: "3. save"\r
        detail: "tpl.save(outPath)로 결과 저장."\r
    runtime:\r
      - label: "docxtpl 준비"\r
        detail: "LGPL 라이선스."\r
      - label: "검증"\r
        detail: "결과 docx에 자리표시자 잔여 없고 데이터가 정확히 반영됐는지 assert."\r
\r
sections:\r
  - id: step1_simple\r
    title: "1단계. 단순 치환"\r
    structuredPrimary: true\r
    subtitle: "DocxTemplate.render(context)"\r
    goal: "{{ name }} 단순 자리표시자 양식을 docxtpl로 채운다."\r
    why: "docxtpl의 가장 단순한 동작입니다. 같은 자리표시자가 여러 run으로 쪼개져 있어도 안전히 처리."\r
    explanation: |-\r
      Word(또는 python-docx)로 양식을 만들고 {{ name }} 자리표시자 삽입. DocxTemplate(path).render({'name': '김대리'}) 후 save.\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
      from docxtpl import DocxTemplate\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      tplPath = base / "tpl.docx"\r
\r
      seed = Document()\r
      seed.add_paragraph("계약자: {{ name }}")\r
      seed.add_paragraph("직급: {{ role }}")\r
      seed.save(tplPath)\r
\r
      tpl = DocxTemplate(str(tplPath))\r
      tpl.render({"name": "김대리", "role": "대리"})\r
      outPath = base / "filled.docx"\r
      tpl.save(outPath)\r
\r
      [p.text for p in Document(outPath).paragraphs]\r
    exercise:\r
      prompt: "context를 박과장/과장으로 바꾸고 결과 단락에 '박과장'이 들어가는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
        from docxtpl import DocxTemplate\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        tplPath = base / "tpl.docx"\r
\r
        seed = Document()\r
        seed.add_paragraph("계약자: {{ name }}")\r
        seed.add_paragraph("직급: {{ role }}")\r
        seed.save(tplPath)\r
\r
        tpl = DocxTemplate(str(tplPath))\r
        tpl.render({"name": ___, "role": ___})\r
        outPath = base / "f.docx"\r
        tpl.save(outPath)\r
        "박과장" in "\\n".join(p.text for p in Document(outPath).paragraphs)\r
      hints:\r
        - "두 문자열: '박과장', '과장'."\r
    check:\r
      noError: "render 인자는 dict."\r
      resultCheck: "True 출력."\r
\r
  - id: step2_for_loop\r
    title: "2단계. {% for %} 루프"\r
    structuredPrimary: true\r
    subtitle: "Jinja for-loop으로 견적 항목"\r
    goal: "items 리스트를 for-loop으로 단락마다 출력한다."\r
    why: "영업 제안서의 견적 항목은 N개입니다. 단순 자리표시자로는 표현 불가. Jinja for-loop이 핵심."\r
    explanation: |-\r
      양식에 {% for item in items %}{{ item.name }}: {{ item.price }}{% endfor %} 패턴. context의 items 리스트가 자동 반복.\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
      from docxtpl import DocxTemplate\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      tplPath = base / "tpl.docx"\r
\r
      seed = Document()\r
      seed.add_paragraph("견적서")\r
      seed.add_paragraph("{% for item in items %}")\r
      seed.add_paragraph("{{ item.name }}: {{ item.price }}원")\r
      seed.add_paragraph("{% endfor %}")\r
      seed.save(tplPath)\r
\r
      tpl = DocxTemplate(str(tplPath))\r
      tpl.render({"items": [\r
          {"name": "구독", "price": "50,000"},\r
          {"name": "온보딩", "price": "200,000"},\r
          {"name": "지원", "price": "30,000"},\r
      ]})\r
      outPath = base / "filled.docx"\r
      tpl.save(outPath)\r
\r
      [p.text for p in Document(outPath).paragraphs]\r
    exercise:\r
      prompt: "items에 하나(Service A, 100,000)를 더 추가해 결과 단락 수가 늘어나는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
        from docxtpl import DocxTemplate\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        tplPath = base / "tpl.docx"\r
\r
        seed = Document()\r
        seed.add_paragraph("{% for item in items %}")\r
        seed.add_paragraph("{{ item.name }}: {{ item.price }}원")\r
        seed.add_paragraph("{% endfor %}")\r
        seed.save(tplPath)\r
\r
        tpl = DocxTemplate(str(tplPath))\r
        tpl.render({"items": [\r
            {"name": "구독", "price": "50,000"},\r
            {"name": "온보딩", "price": "200,000"},\r
            ___,\r
        ]})\r
        outPath = base / "f.docx"\r
        tpl.save(outPath)\r
        "Service A" in "\\n".join(p.text for p in Document(outPath).paragraphs)\r
      hints:\r
        - "dict {'name': 'Service A', 'price': '100,000'}."\r
    check:\r
      noError: "items 리스트 원소는 dict."\r
      resultCheck: "True 출력."\r
\r
  - id: validation\r
    title: "3단계. 검증 - 영업 제안서 자동 생성"\r
    structuredPrimary: true\r
    subtitle: "단순 + for-loop 결합"\r
    goal: "고객사·담당자·견적 항목이 모두 들어간 제안서가 정확히 만들어지는지 검증."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
      from docxtpl import DocxTemplate\r
\r
      def buildProposalTemplate(path):\r
          seed = Document()\r
          seed.add_heading("영업 제안서", level=0)\r
          seed.add_paragraph("고객사: {{ customer }}")\r
          seed.add_paragraph("담당자: {{ contact }}")\r
          seed.add_paragraph("견적 항목:")\r
          seed.add_paragraph("{% for item in items %}")\r
          seed.add_paragraph("- {{ item.name }}: {{ item.price }}원")\r
          seed.add_paragraph("{% endfor %}")\r
          seed.add_paragraph("합계: {{ total }}원")\r
          seed.save(path)\r
\r
      def renderProposal(templatePath, context, outPath):\r
          tpl = DocxTemplate(str(templatePath))\r
          tpl.render(context)\r
          tpl.save(outPath)\r
\r
      vault = TemporaryDirectory()\r
      base = Path(vault.name)\r
      tplPath = base / "proposal_tpl.docx"\r
      buildProposalTemplate(tplPath)\r
\r
      outPath = base / "proposal.docx"\r
      renderProposal(tplPath, {\r
          "customer": "Acme Corp",\r
          "contact": "홍대표",\r
          "items": [\r
              {"name": "구독", "price": "50,000"},\r
              {"name": "온보딩", "price": "200,000"},\r
          ],\r
          "total": "250,000",\r
      }, outPath)\r
\r
      combined = "\\n".join(p.text for p in Document(outPath).paragraphs)\r
      assert "Acme Corp" in combined\r
      assert "홍대표" in combined\r
      assert "구독" in combined and "온보딩" in combined\r
      assert "250,000" in combined\r
      assert "{{" not in combined\r
      combined.strip().splitlines()[:5]\r
    exercise:\r
      prompt: "buildProposalTemplate과 renderProposal 본체를 완성하세요 - 양식에는 {% for %} 루프로 items를 출력하고, render는 합계까지 계산해 context에 주입."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
        from docxtpl import DocxTemplate\r
\r
        def buildProposalTemplate(path):\r
            seed = Document()\r
            seed.add_paragraph("고객: {{ customer }}")\r
            seed.add_paragraph("{% for item in items %}")\r
            seed.add_paragraph("- {{ item.name }}: {{ item.price }}원")\r
            seed.add_paragraph("{% endfor %}")\r
            seed.add_paragraph("합계: {{ total }}원")\r
            seed.save(path)\r
\r
        def renderProposalWithTotal(templatePath, customer, items, outPath):\r
            total = ___  # items의 각 price(int) 합을 천 단위 구분자 포함 문자열로\r
            tpl = DocxTemplate(str(templatePath))\r
            ___  # tpl.render에 customer/items/total dict 전달\r
            tpl.save(outPath)\r
\r
        vault = TemporaryDirectory()\r
        base = Path(vault.name)\r
        tplPath = base / "t.docx"\r
        buildProposalTemplate(tplPath)\r
        outPath = base / "f.docx"\r
\r
        items = [{"name": "구독", "price": 50000}, {"name": "온보딩", "price": 200000}]\r
        renderProposalWithTotal(tplPath, "Acme", items, outPath)\r
        combined = "\\n".join(p.text for p in Document(outPath).paragraphs)\r
        "Acme" in combined, "250,000" in combined, "{{" not in combined\r
      hints:\r
        - "total = f'{sum(item[\\"price\\"] for item in items):,}'"\r
        - "tpl.render({'customer': customer, 'items': items, 'total': total})"\r
    check:\r
      noError: "sum + f-string의 천 단위 포맷 + render dict."\r
      resultCheck: "(True, True, True) 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "다수 제안서 일괄 생성"\r
    goal: "여러 고객사용 제안서를 한 번에 만든다."\r
    snippet: |-\r
      from docxtpl import DocxTemplate\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수: bulkRenderProposals(templatePath, customers, outFolder) -> list[Path]"\r
    check:\r
      noError: "함수 정의."\r
      resultCheck: "고객사별 docx 생성."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 다수 제안서"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from docx import Document\r
              from docxtpl import DocxTemplate\r
\r
              def bulkRenderProposals(templatePath, customers, outFolder):\r
                  Path(outFolder).mkdir(exist_ok=True)\r
                  outputs = []\r
                  for customer in customers:\r
                      tpl = DocxTemplate(str(templatePath))\r
                      tpl.render(customer)\r
                      outPath = Path(outFolder) / f"{customer['customer']}.docx"\r
                      tpl.save(outPath)\r
                      outputs.append(outPath)\r
                  return outputs\r
\r
              missionDir = TemporaryDirectory()\r
              base = Path(missionDir.name)\r
              tplPath = base / "tpl.docx"\r
\r
              seed = Document()\r
              seed.add_paragraph("고객: {{ customer }}")\r
              seed.add_paragraph("{% for item in items %}{{ item.name }}: {{ item.price }}원{% endfor %}")\r
              seed.save(tplPath)\r
\r
              customers = [\r
                  {"customer": "AcmeCorp", "items": [{"name": "Sub", "price": "50,000"}]},\r
                  {"customer": "BetaInc", "items": [{"name": "Sub", "price": "50,000"}, {"name": "Sup", "price": "30,000"}]},\r
              ]\r
\r
              outputs = bulkRenderProposals(tplPath, customers, base / "proposals")\r
              assert len(outputs) == 2\r
              for path in outputs:\r
                  combined = "\\n".join(p.text for p in Document(path).paragraphs)\r
                  assert "{{" not in combined\r
              [p.name for p in outputs]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "{% if %} 조건부 단락 (특정 고객에게만 보이는 안내)"\r
          - "필터 (date 포맷, 천 단위 구분자)"\r
          - "표 행 동적 추가 ({% tr for %})"\r
          - "이미지 동적 삽입 ({{ logo | image }})"\r
          - "08강 mailMerge와 결합 - docxtpl 기반 N장 생성"\r
`;export{e as default};