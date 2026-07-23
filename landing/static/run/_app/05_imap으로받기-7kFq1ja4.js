var e=`meta:
  id: email_05
  title: IMAP으로 받기
  order: 5
  category: email
  difficulty: ⭐⭐
  badge: 기초
  packages: []
  tags:
    - imaplib
    - IMAP4_SSL
    - select
    - search
  outcomes:
    - automation.email.receive
  prerequisites:
    - automation.email.send
  estimatedMinutes: 50
  seo:
    title: "imaplib로 메일 받기 - IMAP4_SSL, select, search, fetch"
    description: "imaplib.IMAP4_SSL로 메일함을 코드로 다룬다. 최근 N일 메일 검색 후 제목 목록을 만든다. 본인 메일 계정 환경변수 필수."
    keywords:
      - imaplib
      - IMAP4_SSL
      - 메일 받기 자동화

intro:
  direction: "imaplib.IMAP4_SSL로 메일함에 접속해 검색·조회한다. 본인 메일 계정 환경변수가 필요하며, 항상 별도 폴더(INBOX/CodaroTest)에서만 작업."
  benefits:
    - "사장님의 매일 30분 메일 분류를 위한 첫 단계 - 받은 메일 목록을 코드로 다루기."
    - "imaplib는 표준. 외부 패키지 0개로 IMAP 전 흐름 처리."
    - "Gmail·Naver·Outlook IMAP4 모두 같은 패턴으로 접속."
  diagram:
    steps:
      - label: "1. 연결과 로그인"
        detail: "IMAP4_SSL(host) + login(user, appPass)."
      - label: "2. 폴더 선택"
        detail: "select('INBOX') 또는 select('INBOX/CodaroTest')."
      - label: "3. 검색"
        detail: "search(None, criteria)로 UID 리스트 반환."
      - label: "4. 본문 조회"
        detail: "fetch(uid, '(RFC822)')로 메시지 바이트 가져오기."
    runtime:
      - label: "본인 메일 계정 필요"
        detail: "환경변수 IMAP_USER, IMAP_APP_PASS 미설정 시 본 강의는 skip. 코드 패턴만 학습 가능."
      - label: "안전 정책"
        detail: "항상 별도 폴더에서만 작업. INBOX 직접 삭제 절대 금지."

sections:
  - id: step1_connect
    title: "1단계. IMAP 연결과 로그인"
    structuredPrimary: true
    subtitle: "imaplib.IMAP4_SSL(host), login(user, appPass)"
    goal: "환경변수가 설정된 경우에만 IMAP4_SSL로 연결하고 로그인한다."
    why: "IMAP 모든 작업의 출발점입니다. 환경변수 가드를 두면 CI나 다른 환경에서 안전하게 skip 됩니다."
    explanation: |-
      IMAP4_SSL은 SSL로 직결합니다 (포트 993). login은 (이메일, 앱비밀번호) 형태. 환경변수 미설정 시 명확한 메시지로 skip.
    tips:
      - "Naver는 imap.naver.com, Gmail은 imap.gmail.com. 호스트 상수 사용."
    snippet: |-
      import imaplib
      import os

      IMAP_HOST = "imap.gmail.com"

      def connectImap():
          user = os.environ.get("IMAP_USER")
          appPass = os.environ.get("IMAP_APP_PASS")
          if not user or not appPass:
              return None
          conn = imaplib.IMAP4_SSL(IMAP_HOST)
          conn.login(user, appPass)
          return conn

      conn = connectImap()
      state = "connected" if conn else "skipped (no env vars)"
      if conn:
          conn.logout()
      state
    exercise:
      prompt: "IMAP_HOST를 'imap.naver.com'으로 바꿔 Naver IMAP 준비를 하세요."
      starterCode: |-
        import imaplib
        import os

        IMAP_HOST = ___

        def connectImap():
            user = os.environ.get("IMAP_USER")
            if not user:
                return None
            return imaplib.IMAP4_SSL(IMAP_HOST)

        IMAP_HOST
      hints:
        - "문자열 'imap.naver.com'."
    check:
      noError: "IMAP_HOST는 문자열."
      resultCheck: "출력 'imap.naver.com'."

  - id: step2_select
    title: "2단계. 폴더 선택과 안전 정책"
    structuredPrimary: true
    subtitle: "conn.select('INBOX/CodaroTest')"
    goal: "INBOX/CodaroTest 폴더만 선택해 실수로 inbox 본문에 접근하지 않게 한다."
    why: "본 트랙 안전 정책 - IMAP 작업은 항상 별도 폴더에서. 학습 중 inbox 메일을 실수로 삭제하는 사고를 사전 차단합니다."
    explanation: |-
      conn.select(폴더명)을 호출하면 그 폴더가 활성화됩니다. 없는 폴더면 자동 생성되지 않으므로 conn.create('INBOX.CodaroTest')로 미리 생성. Gmail은 INBOX/CodaroTest, 일반 IMAP은 INBOX.CodaroTest 표기 차이.
    tips:
      - "Gmail의 라벨은 IMAP 폴더로 매핑됩니다. 라벨 'CodaroTest'를 만들면 IMAP에서 그 폴더에 접근 가능."
    snippet: |-
      import imaplib
      import os

      IMAP_HOST = "imap.gmail.com"
      SAFE_FOLDER = "INBOX/CodaroTest"

      def selectSafeFolder():
          user = os.environ.get("IMAP_USER")
          appPass = os.environ.get("IMAP_APP_PASS")
          if not user or not appPass:
              return "skipped"
          conn = imaplib.IMAP4_SSL(IMAP_HOST)
          conn.login(user, appPass)
          try:
              conn.create(SAFE_FOLDER)
          except imaplib.IMAP4.error:
              pass
          status, _ = conn.select(SAFE_FOLDER)
          conn.logout()
          return status

      selectSafeFolder()
    exercise:
      prompt: "SAFE_FOLDER를 'INBOX/CodaroLesson'으로 바꾸세요."
      starterCode: |-
        SAFE_FOLDER = ___
        SAFE_FOLDER.endswith("Lesson")
      hints:
        - "문자열 'INBOX/CodaroLesson'."
    check:
      noError: "문자열."
      resultCheck: "True 출력."

  - id: step3_search
    title: "3단계. 검색과 조회"
    structuredPrimary: true
    subtitle: "search(None, criteria), fetch(uid, '(RFC822)')"
    goal: "최근 N일 메일을 검색해 제목 목록을 만드는 함수의 형태를 정의한다."
    why: "검색 → 조회는 IMAP의 가장 흔한 흐름입니다. SINCE 기준 검색 패턴을 손에 익혀야 후속 강의 분류·이동이 자연스럽습니다."
    explanation: |-
      conn.search(None, 'SINCE', date)는 (status, [uid_string]) 튜플 반환. uid_string을 split해 UID 리스트로 만들고, conn.fetch(uid, '(RFC822)')로 각 메시지를 가져옵니다.
    tips:
      - "SINCE 날짜 형식은 '15-Jan-2026' 같은 영문 월. datetime.strftime('%d-%b-%Y')로 변환."
    snippet: |-
      import imaplib
      import os
      from datetime import datetime, timedelta

      IMAP_HOST = "imap.gmail.com"
      SAFE_FOLDER = "INBOX/CodaroTest"

      def recentSubjects(days=7):
          user = os.environ.get("IMAP_USER")
          appPass = os.environ.get("IMAP_APP_PASS")
          if not user or not appPass:
              return []
          conn = imaplib.IMAP4_SSL(IMAP_HOST)
          conn.login(user, appPass)
          try:
              conn.create(SAFE_FOLDER)
          except imaplib.IMAP4.error:
              pass
          conn.select(SAFE_FOLDER)
          since = (datetime.utcnow() - timedelta(days=days)).strftime("%d-%b-%Y")
          status, uidData = conn.search(None, "SINCE", since)
          subjects = []
          if status == "OK":
              for uid in uidData[0].split():
                  fStatus, fData = conn.fetch(uid, "(BODY[HEADER.FIELDS (SUBJECT)])")
                  if fStatus == "OK":
                      subjects.append(fData[0][1].decode("utf-8", errors="replace").strip())
          conn.logout()
          return subjects

      "function defined: recentSubjects"
    exercise:
      prompt: "days 인자 기본값을 14로 바꾸세요."
      starterCode: |-
        import imaplib
        import os
        from datetime import datetime, timedelta

        def recentSubjects(days=___):
            user = os.environ.get("IMAP_USER")
            if not user:
                return []
            return []

        recentSubjects()
      hints:
        - "정수 14."
    check:
      noError: "기본값은 정수."
      resultCheck: "빈 리스트 출력."

  - id: validation
    title: "4단계. 검증 루프 - 환경 가드 자동 검증"
    structuredPrimary: true
    subtitle: "환경변수 가드 + 함수 시그니처 단위 검증"
    goal: "환경변수가 없을 때 함수가 안전하게 빈 리스트를 돌려주는지 한 셀에서 검증한다."
    why: "IMAP 본문 검증은 실 환경 의존이지만, 환경 가드 자체는 단위 검증 가능합니다. CI에서도 통과합니다."
    explanation: |-
      환경변수 IMAP_USER가 없는 상태에서 recentSubjects 호출이 [] 반환하는지 확인. 이 가드가 본 트랙 안전 정책의 일관 검증입니다.
    tips:
      - "테스트 안에서 os.environ.pop으로 변수를 잠시 제거하면 환경 가드를 격리 검증할 수 있습니다."
    snippet: |-
      import imaplib
      import os
      from datetime import datetime, timedelta

      IMAP_HOST = "imap.gmail.com"

      def recentSubjects(days=7):
          user = os.environ.get("IMAP_USER")
          appPass = os.environ.get("IMAP_APP_PASS")
          if not user or not appPass:
              return []
          return ["would-call-imap"]

      savedUser = os.environ.pop("IMAP_USER", None)
      savedPass = os.environ.pop("IMAP_APP_PASS", None)
      try:
          result = recentSubjects()
          assert result == []
      finally:
          if savedUser is not None:
              os.environ["IMAP_USER"] = savedUser
          if savedPass is not None:
              os.environ["IMAP_APP_PASS"] = savedPass
      result
    exercise:
      prompt: "recentSubjects 본체를 직접 작성하세요. IMAP_USER가 비어있으면 빈 리스트를 반환하고, 있으면 (실제 IMAP 호출 자리표시로) ['stub-subject']를 반환해야 합니다. 본 트랙의 안전 가드 패턴이 함수에 묶이는 흐름을 직접 짭니다."
      starterCode: |-
        import os

        def recentSubjects(days=7):
            ___

        savedUser = os.environ.pop("IMAP_USER", None)
        try:
            withoutEnv = recentSubjects()
            os.environ["IMAP_USER"] = "demo@example.com"
            withEnv = recentSubjects()
            assert withoutEnv == []
            assert withEnv == ["stub-subject"]
        finally:
            os.environ.pop("IMAP_USER", None)
            if savedUser is not None:
                os.environ["IMAP_USER"] = savedUser
        (withoutEnv, withEnv)
      hints:
        - "본체: if not os.environ.get('IMAP_USER'): return []  / 그 뒤 return ['stub-subject']."
    check:
      noError: "빈 리스트 []."
      resultCheck: "출력 []."

  - id: practice
    title: "실습 - 종합 미션"
    subtitle: "최근 메일 제목 모으기 도구"
    goal: "IMAP 패턴을 함수로 묶어 본인 계정 또는 환경 가드 동작을 검증한다."
    why: "검색 + 조회 + 환경 가드 세 가지가 한 함수에 모이면 06강 첨부 자동 저장과 07강 룰 기반 분류가 같은 진입점에서 시작합니다. 환경변수가 없는 CI에서는 자동 skip, 본인 계정에서는 실 IMAP 호출이 같은 코드 경로로 흐르는 게 본 강의의 도착점입니다."
    explanation: |-
      미션: fetchRecentSubjects(days, host, folder) -> list[str]. 환경 가드, 폴더 안전 처리, SINCE 검색, fetch까지.
    tips:
      - "본인 계정으로 시도하려면 환경변수 IMAP_USER, IMAP_APP_PASS 설정."
    snippet: |-
      import imaplib
      import os
      from datetime import datetime, timedelta
    exercise:
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."
      starterCode: |-
        ___
      hints:
        - "함수: fetchRecentSubjects(days=7, host='imap.gmail.com', folder='INBOX/CodaroTest') -> list[str]"
    check:
      noError: "환경 가드 + IMAP 흐름."
      resultCheck: "환경변수 없으면 [], 있으면 제목 리스트."
    blocks:
      - type: expansion
        title: "미션: 최근 메일 제목 도구"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              import imaplib
              import os
              from datetime import datetime, timedelta

              def fetchRecentSubjects(days=7, host="imap.gmail.com", folder="INBOX/CodaroTest"):
                  user = os.environ.get("IMAP_USER")
                  appPass = os.environ.get("IMAP_APP_PASS")
                  if not user or not appPass:
                      return []
                  conn = imaplib.IMAP4_SSL(host)
                  conn.login(user, appPass)
                  try:
                      conn.create(folder)
                  except imaplib.IMAP4.error:
                      pass
                  conn.select(folder)
                  since = (datetime.utcnow() - timedelta(days=days)).strftime("%d-%b-%Y")
                  status, uidData = conn.search(None, "SINCE", since)
                  subjects = []
                  if status == "OK":
                      for uid in uidData[0].split():
                          fStatus, fData = conn.fetch(uid, "(BODY[HEADER.FIELDS (SUBJECT)])")
                          if fStatus == "OK":
                              subjects.append(fData[0][1].decode("utf-8", errors="replace").strip())
                  conn.logout()
                  return subjects

              savedUser = os.environ.pop("IMAP_USER", None)
              savedPass = os.environ.pop("IMAP_APP_PASS", None)
              try:
                  result = fetchRecentSubjects()
                  assert result == []
              finally:
                  if savedUser is not None:
                      os.environ["IMAP_USER"] = savedUser
                  if savedPass is not None:
                      os.environ["IMAP_APP_PASS"] = savedPass
              result

  - id: extensions
    title: "확장 변주"
    blocks:
      - type: list
        style: bullet
        items:
          - "검색 조건 확장 (FROM, SUBJECT, UNSEEN 조합)"
          - "결과 캐싱 (UID 기록 후 다음 호출에 SEEN 표시)"
          - "여러 폴더 동시 조회 (CodaroTest + Archive)"
          - "Naver IMAP으로 동일 패턴 전환"
          - "06강 결합 - 검색 결과를 첨부 저장 함수로 넘기기"
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
  - id: email_05-imap-cursor-plan-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_connect
    - extensions
    title: IMAP UID cursor로 새 메일만 읽는 계획 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: UIDVALIDITY와 마지막 UID를 기준으로 중복 없는 fetch range를 계산한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 메시지 sequence number가 아니라 UID와 UIDVALIDITY를 cursor로 사용하세요.
    - UIDVALIDITY 변경은 cursor reset event로 명시적으로 기록하세요.
    exercise:
      prompt: plan_imap_fetch(cursor, mailbox_state)를 완성하세요.
      starterCode: |-
        def plan_imap_fetch(cursor, mailbox_state):
            raise NotImplementedError
      solution: |
        def plan_imap_fetch(cursor, mailbox_state):
            reset = cursor.get("uidValidity") != mailbox_state["uidValidity"]
            start_uid = 1 if reset else cursor.get("lastUid", 0) + 1
            end_uid = mailbox_state.get("highestUid", 0)
            fetch = list(range(start_uid, end_uid + 1)) if start_uid <= end_uid else []
            return {"reset": reset, "fetchUids": fetch, "nextCursor": {"uidValidity": mailbox_state["uidValidity"], "lastUid": end_uid if fetch else cursor.get("lastUid", 0)}}
      hints: *id001
    check:
      id: python.email.email_05.imap-cursor-plan.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.email.email_05.imap-cursor-plan.mastery.behavior.v1.fixture
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
        entry: plan_imap_fetch
        cases:
        - id: fetches-uids-after-cursor
          arguments:
          - value:
              uidValidity: 10
              lastUid: 3
          - value:
              uidValidity: 10
              highestUid: 5
          expectedReturn:
            reset: false
            fetchUids:
            - 4
            - 5
            nextCursor:
              uidValidity: 10
              lastUid: 5
        - id: resets-on-uidvalidity-change
          arguments:
          - value:
              uidValidity: 9
              lastUid: 100
          - value:
              uidValidity: 10
              highestUid: 2
          expectedReturn:
            reset: true
            fetchUids:
            - 1
            - 2
            nextCursor:
              uidValidity: 10
              lastUid: 2
        - id: handles-no-new-mail
          arguments:
          - value:
              uidValidity: 10
              lastUid: 5
          - value:
              uidValidity: 10
              highestUid: 5
          expectedReturn:
            reset: false
            fetchUids: []
            nextCursor:
              uidValidity: 10
              lastUid: 5
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: email_05-imap-message-admission-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - email_05-imap-cursor-plan-mastery
    title: 새 IMAP message에 sender·date·folder admission 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 허용 sender domain과 수신 시각, 중복 Message-ID를 검사한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - fetch 성공 뒤 sender·date·Message-ID admission을 별도로 적용하세요.
    - 같은 batch 안의 중복 Message-ID도 두 번째부터 거부하세요.
    exercise:
      prompt: admit_imap_messages(messages, allowed_domains, minimum_received_at, processed_ids)를 완성하세요.
      starterCode: |-
        def admit_imap_messages(messages, allowed_domains, minimum_received_at, processed_ids):
            raise NotImplementedError
      solution: |
        def admit_imap_messages(messages, allowed_domains, minimum_received_at, processed_ids):
            processed = set(processed_ids)
            accepted = []
            rejected = []
            for message in messages:
                reasons = []
                domain = message["from"].lower().rsplit("@", 1)[-1]
                if domain not in allowed_domains:
                    reasons.append("sender")
                if message["receivedAt"] < minimum_received_at:
                    reasons.append("date")
                if message["messageId"] in processed:
                    reasons.append("duplicate")
                if reasons:
                    rejected.append({"messageId": message["messageId"], "reasons": reasons})
                else:
                    accepted.append(message["messageId"])
                    processed.add(message["messageId"])
            return {"accepted": accepted, "rejected": rejected}
      hints: *id002
    check:
      id: python.email.email_05.imap-message-admission.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.email.email_05.imap-message-admission.transfer.behavior.v1.fixture
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
        entry: admit_imap_messages
        cases:
        - id: accepts-new-allowed-message
          arguments:
          - value:
            - messageId: m1
              from: a@example.test
              receivedAt: 100
          - value:
            - example.test
          - value: 90
          - value: []
          expectedReturn:
            accepted:
            - m1
            rejected: []
        - id: reports-sender-date-and-duplicate
          arguments:
          - value:
            - messageId: m1
              from: a@other.test
              receivedAt: 80
          - value:
            - example.test
          - value: 90
          - value:
            - m1
          expectedReturn:
            accepted: []
            rejected:
            - messageId: m1
              reasons:
              - sender
              - date
              - duplicate
        - id: deduplicates-within-batch
          arguments:
          - value:
            - messageId: m1
              from: a@example.test
              receivedAt: 100
            - messageId: m1
              from: a@example.test
              receivedAt: 100
          - value:
            - example.test
          - value: 90
          - value: []
          expectedReturn:
            accepted:
            - m1
            rejected:
            - messageId: m1
              reasons:
              - duplicate
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: email_05-imap-reading-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - email_05-imap-message-admission-transfer
    title: IMAP 새 메일 읽기 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: UID cursor·UIDVALIDITY·Message-ID dedupe 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 메일 API 성공과 올바른 수신자·내용·첨부 전달을 분리해 검증하세요.
    - 실제 발송 전 dry run과 idempotency identity, 비밀정보 redaction을 적용하세요.
    exercise:
      prompt: choose_imap_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_imap_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_imap_evidence(situation):
            table = {'cursor': {'action': 'fetch UID after last cursor', 'evidence': 'UID range', 'risk': 'sequence renumbering'}, 'reset': {'action': 'handle UIDVALIDITY change', 'evidence': 'mailbox reset event', 'risk': 'missed mail'}, 'dedupe': {'action': 'claim Message-ID ledger', 'evidence': 'processed identity', 'risk': 'duplicate processing'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.email.email_05.imap-reading-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.email.email_05.imap-reading-recall.retrieval.behavior.v1.fixture
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
        entry: choose_imap_evidence
        cases:
        - id: recalls-cursor
          arguments:
          - value: cursor
          expectedReturn:
            action: fetch UID after last cursor
            evidence: UID range
            risk: sequence renumbering
        - id: recalls-reset
          arguments:
          - value: reset
          expectedReturn:
            action: handle UIDVALIDITY change
            evidence: mailbox reset event
            risk: missed mail
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};