var e=`meta:\r
  id: email_07\r
  title: 규칙 기반 자동 분류\r
  order: 7\r
  category: email\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages: []\r
  tags:\r
    - IMAP MOVE\r
    - 발신자 룰\r
    - 자동 분류\r
  outcomes:\r
    - automation.email.classify\r
  prerequisites:\r
    - automation.email.receive\r
  estimatedMinutes: 50\r
  seo:\r
    title: "메일 룰 기반 자동 분류 - 발신자/제목 → 폴더 이동"\r
    description: "발신자와 제목 룰을 정의해 받은 메일을 자동으로 폴더 분류. inbox zero를 코드로 달성."\r
    keywords:\r
      - 메일 자동 분류\r
      - IMAP MOVE\r
      - inbox zero\r
\r
intro:\r
  direction: "발신자·제목 룰로 메일을 자동 폴더에 분류한다. 사장님의 매일 30분 분류 작업이 5초로 줄어든다."\r
  benefits:\r
    - "발신자별 자동 폴더 분류로 inbox zero를 코드로 달성."\r
    - "룰 dict 한 번 정의로 모든 받은 메일에 일관 적용."\r
    - "본인 IMAP 계정에서만 실 동작. 환경 가드로 CI 안전."\r
  diagram:\r
    steps:\r
      - label: "1. 룰 정의"\r
        detail: "{발신자/제목 키워드: 목적 폴더} dict."\r
      - label: "2. 메일 순회"\r
        detail: "INBOX의 최근 UID 리스트 → fetch."\r
      - label: "3. 룰 매칭"\r
        detail: "From, Subject에서 룰 키워드 검색."\r
      - label: "4. MOVE/COPY"\r
        detail: "매칭되면 conn.move 또는 copy+expunge."\r
    runtime:\r
      - label: "본인 메일 계정 필요"\r
        detail: "환경 가드로 CI에서는 룰 매칭 로직만 단위 검증."\r
      - label: "안전 정책"\r
        detail: "INBOX 메일은 이동만, 삭제 절대 금지. dry-run 옵션 제공."\r
\r
sections:\r
  - id: step1_rules\r
    title: "1단계. 분류 룰 정의"\r
    structuredPrimary: true\r
    subtitle: "dict 기반 룰셋"\r
    goal: "발신자·제목 키워드 → 목적 폴더 매핑 dict를 정의한다."\r
    why: "룰 자체를 코드와 분리하면 정책 변경이 쉽습니다. dict 한 곳만 고치면 됩니다."\r
    explanation: |-\r
      rules = [{"keyword": "@gov.kr", "field": "from", "folder": "Government"}, ...] 형태. field는 'from' 또는 'subject'. 우선 매칭 룰부터 적용.\r
    tips:\r
      - "리스트는 우선순위. 위에서부터 매칭되는 첫 룰 적용. 더 구체적 룰을 위로."\r
    snippet: |-\r
      rules = [\r
          {"keyword": "@nts.go.kr", "field": "from", "folder": "TaxOffice"},\r
          {"keyword": "세금계산서", "field": "subject", "folder": "Invoices"},\r
          {"keyword": "@vendor.com", "field": "from", "folder": "Vendors"},\r
      ]\r
\r
      def matchRule(rules, sender, subject):\r
          for rule in rules:\r
              if rule["field"] == "from" and rule["keyword"] in sender:\r
                  return rule["folder"]\r
              if rule["field"] == "subject" and rule["keyword"] in subject:\r
                  return rule["folder"]\r
          return None\r
\r
      matchRule(rules, "office@nts.go.kr", "민원 통보"), matchRule(rules, "billing@vendor.com", "월간 세금계산서 첨부")\r
    exercise:\r
      prompt: "matchRule 함수를 직접 작성하세요. rules 리스트를 순회하며 field='from'이면 sender, field='subject'이면 subject에 keyword가 포함되는지 검사하고, 첫 매치의 folder를 반환합니다. 매치가 없으면 None. 두 룰과 세 케이스로 검증합니다."\r
      starterCode: |-\r
        rules = [\r
            {"keyword": "@nts.go.kr", "field": "from", "folder": "TaxOffice"},\r
            {"keyword": "@codaro.dev", "field": "from", "folder": "Codaro"},\r
        ]\r
\r
        def matchRule(rules, sender, subject):\r
            ___\r
\r
        assert matchRule(rules, "office@nts.go.kr", "x") == "TaxOffice"\r
        assert matchRule(rules, "team@codaro.dev", "x") == "Codaro"\r
        assert matchRule(rules, "stranger@example.com", "x") is None\r
        matchRule(rules, "team@codaro.dev", "안내")\r
      hints:\r
        - "for rule in rules: 안에서 field 분기 후 keyword in sender/subject 시 folder 반환. 끝까지 못 찾으면 return None."\r
    check:\r
      noError: "dict 키는 문자열."\r
      resultCheck: "출력 'Codaro'."\r
\r
  - id: step2_classify\r
    title: "2단계. 분류 흐름"\r
    structuredPrimary: true\r
    subtitle: "환경 가드 + 룰 적용"\r
    goal: "환경 가드와 룰을 결합해 분류 함수 골격을 정의한다."\r
    why: "환경 가드로 CI에서 안전하게 단위 검증, 본인 계정에서는 실제 IMAP 호출 흐름이 같은 함수에 들어갑니다."\r
    explanation: |-\r
      classifyInbox(rules, dryRun=True)이 환경 가드 후 IMAP 연결, 최근 메일 순회, 매칭 룰 적용. dryRun=True에서는 매칭 결과만 돌려주고 실제 MOVE는 dryRun=False일 때만.\r
    tips:\r
      - "본인 계정에서 dryRun=True 결과를 먼저 출력해 검토한 후 dryRun=False로 실행."\r
    snippet: |-\r
      import imaplib\r
      import os\r
      from email.parser import BytesParser\r
      from email.policy import default\r
\r
      IMAP_HOST = "imap.gmail.com"\r
\r
      def classifyInbox(rules, dryRun=True, folder="INBOX/CodaroTest"):\r
          user = os.environ.get("IMAP_USER")\r
          appPass = os.environ.get("IMAP_APP_PASS")\r
          if not user or not appPass:\r
              return []\r
          conn = imaplib.IMAP4_SSL(IMAP_HOST)\r
          conn.login(user, appPass)\r
          conn.select(folder)\r
          status, uidData = conn.search(None, "ALL")\r
          plan = []\r
          if status == "OK":\r
              for uid in uidData[0].split():\r
                  fStatus, fData = conn.fetch(uid, "(BODY[HEADER.FIELDS (FROM SUBJECT)])")\r
                  if fStatus != "OK":\r
                      continue\r
                  headers = BytesParser(policy=default).parsebytes(fData[0][1])\r
                  target = matchRule(rules, headers.get("From", ""), headers.get("Subject", ""))\r
                  if target:\r
                      plan.append({"uid": uid.decode(), "target": target})\r
                      if not dryRun:\r
                          conn.move(uid, target)\r
          conn.logout()\r
          return plan\r
\r
      def matchRule(rules, sender, subject):\r
          for rule in rules:\r
              if rule["field"] == "from" and rule["keyword"] in sender:\r
                  return rule["folder"]\r
              if rule["field"] == "subject" and rule["keyword"] in subject:\r
                  return rule["folder"]\r
          return None\r
\r
      "function defined"\r
    exercise:\r
      prompt: "함수 기본값 folder를 'INBOX/CodaroLesson'으로 바꾸세요."\r
      starterCode: |-\r
        import os\r
\r
        def classifyInbox(rules, dryRun=True, folder=___):\r
            if not os.environ.get("IMAP_USER"):\r
                return []\r
            return []\r
\r
        classifyInbox([])\r
      hints:\r
        - "문자열 'INBOX/CodaroLesson'."\r
    check:\r
      noError: "기본값은 문자열."\r
      resultCheck: "출력 []."\r
\r
  - id: validation\r
    title: "3단계. 검증 루프 - 룰 매칭 단위 검증"\r
    structuredPrimary: true\r
    subtitle: "matchRule을 단위 assert"\r
    goal: "다양한 발신자/제목 조합으로 matchRule이 의도대로 분류하는지 검증한다."\r
    why: "IMAP 본문 검증은 환경 의존이지만 matchRule은 순수 함수라 깔끔히 검증 가능합니다."\r
    explanation: |-\r
      여러 (발신자, 제목, 기대 폴더) 케이스로 matchRule을 호출해 결과를 한 묶음 assert.\r
    tips:\r
      - "엣지 케이스: 룰 매칭 없는 메일은 None을 반환해야 합니다."\r
    snippet: |-\r
      def matchRule(rules, sender, subject):\r
          for rule in rules:\r
              if rule["field"] == "from" and rule["keyword"] in sender:\r
                  return rule["folder"]\r
              if rule["field"] == "subject" and rule["keyword"] in subject:\r
                  return rule["folder"]\r
          return None\r
\r
      rules = [\r
          {"keyword": "@nts.go.kr", "field": "from", "folder": "TaxOffice"},\r
          {"keyword": "세금계산서", "field": "subject", "folder": "Invoices"},\r
      ]\r
      cases = [\r
          ("office@nts.go.kr", "민원", "TaxOffice"),\r
          ("billing@vendor.com", "월간 세금계산서", "Invoices"),\r
          ("friend@example.com", "안부", None),\r
      ]\r
      for sender, subject, expected in cases:\r
          result = matchRule(rules, sender, subject)\r
          assert result == expected, f"{sender}/{subject} -> {result} != {expected}"\r
      "all rules pass"\r
    exercise:\r
      prompt: "추가 룰(@codaro.dev → 'Codaro')과 케이스를 추가해 검증을 통과시키세요."\r
      starterCode: |-\r
        def matchRule(rules, sender, subject):\r
            for rule in rules:\r
                if rule["field"] == "from" and rule["keyword"] in sender:\r
                    return rule["folder"]\r
                if rule["field"] == "subject" and rule["keyword"] in subject:\r
                    return rule["folder"]\r
            return None\r
\r
        rules = [\r
            {"keyword": "@nts.go.kr", "field": "from", "folder": "TaxOffice"},\r
            {"keyword": ___, "field": "from", "folder": ___},\r
        ]\r
        cases = [\r
            ("office@nts.go.kr", "x", "TaxOffice"),\r
            ("dev@codaro.dev", "x", "Codaro"),\r
        ]\r
        for sender, subject, expected in cases:\r
            assert matchRule(rules, sender, subject) == expected\r
        "ok"\r
      hints:\r
        - "두 문자열: '@codaro.dev', 'Codaro'."\r
    check:\r
      noError: "리스트 dict 키 일치."\r
      resultCheck: "'ok' 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "발신자 도메인별 자동 분류 도구"\r
    goal: "발신자 도메인을 자동 추출해 폴더로 분류하는 함수를 만든다."\r
    why: "1인 사장님이 매일 30분씩 손으로 받은 메일을 폴더로 옮기는 사이클이 사라집니다. 발신자 도메인 → 폴더 룰 하나로 거래처·관공서·뉴스레터 분류가 한 번에 끝나고, 본 트랙 후반의 dryRun → 실행 패턴과 결합하면 inbox zero가 코드로 매일 자동 유지됩니다."\r
    explanation: |-\r
      미션: classifyByDomain(rules, sender) -> str. 발신자 이메일의 @ 뒤 도메인을 추출해 룰 dict와 매칭.\r
    tips:\r
      - "발신자 형식이 'Name <email@domain>'일 수 있습니다. email.utils.parseaddr 활용."\r
    snippet: |-\r
      from email.utils import parseaddr\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수: classifyByDomain(rules, sender) -> str"\r
    check:\r
      noError: "parseaddr 활용."\r
      resultCheck: "도메인 추출 후 룰 매칭."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 도메인별 분류"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from email.utils import parseaddr\r
\r
              def classifyByDomain(rules, sender):\r
                  _, address = parseaddr(sender)\r
                  if "@" not in address:\r
                      return None\r
                  domain = address.split("@", 1)[1].lower()\r
                  return rules.get(domain)\r
\r
              rules = {\r
                  "nts.go.kr": "TaxOffice",\r
                  "codaro.dev": "Codaro",\r
                  "vendor.com": "Vendors",\r
              }\r
              cases = [\r
                  ("office@nts.go.kr", "TaxOffice"),\r
                  ("Codaro Team <team@codaro.dev>", "Codaro"),\r
                  ("billing@vendor.com", "Vendors"),\r
                  ("friend@example.com", None),\r
              ]\r
              for sender, expected in cases:\r
                  assert classifyByDomain(rules, sender) == expected\r
              [classifyByDomain(rules, s) for s, _ in cases]\r
      - type: expansion\r
        title: "미션2: dryRun 분류 플랜 생성기"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from email.utils import parseaddr\r
\r
              def planMoves(messages, rules, default="Inbox/Misc"):\r
                  plan = []\r
                  for entry in messages:\r
                      _, address = parseaddr(entry.get("from", ""))\r
                      domain = address.split("@", 1)[-1].lower() if "@" in address else ""\r
                      folder = rules.get(domain, default)\r
                      plan.append({"uid": entry["uid"], "from": entry["from"], "target": folder})\r
                  return plan\r
\r
              rules = {"nts.go.kr": "TaxOffice", "vendor.com": "Vendors"}\r
              sample = [\r
                  {"uid": "101", "from": "office@nts.go.kr"},\r
                  {"uid": "102", "from": "Vendor <billing@vendor.com>"},\r
                  {"uid": "103", "from": "friend@example.com"},\r
              ]\r
              plan = planMoves(sample, rules)\r
              assert plan[0]["target"] == "TaxOffice"\r
              assert plan[1]["target"] == "Vendors"\r
              assert plan[2]["target"] == "Inbox/Misc"\r
              [(p["uid"], p["target"]) for p in plan]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "발신자 화이트리스트/블랙리스트 룰"\r
          - "특정 키워드(긴급, 장애) → 우선순위 폴더로"\r
          - "첨부 유무에 따라 다른 분류"\r
          - "LLM 분류로 업그레이드 (llmBasics 트랙 결합)"\r
          - "분류 결과를 매일 보고서로 메일 발송 (08강 알림 패턴 결합)"\r
`;export{e as default};