var e=`meta:\r
  id: email_05\r
  title: IMAP으로 받기\r
  order: 5\r
  category: email\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  packages: []\r
  tags:\r
    - imaplib\r
    - IMAP4_SSL\r
    - select\r
    - search\r
  outcomes:\r
    - automation.email.receive\r
  prerequisites:\r
    - automation.email.send\r
  estimatedMinutes: 50\r
  seo:\r
    title: "imaplib로 메일 받기 - IMAP4_SSL, select, search, fetch"\r
    description: "imaplib.IMAP4_SSL로 메일함을 코드로 다룬다. 최근 N일 메일 검색 후 제목 목록을 만든다. 본인 메일 계정 환경변수 필수."\r
    keywords:\r
      - imaplib\r
      - IMAP4_SSL\r
      - 메일 받기 자동화\r
\r
intro:\r
  direction: "imaplib.IMAP4_SSL로 메일함에 접속해 검색·조회한다. 본인 메일 계정 환경변수가 필요하며, 항상 별도 폴더(INBOX/CodaroTest)에서만 작업."\r
  benefits:\r
    - "사장님의 매일 30분 메일 분류를 위한 첫 단계 - 받은 메일 목록을 코드로 다루기."\r
    - "imaplib는 표준. 외부 패키지 0개로 IMAP 전 흐름 처리."\r
    - "Gmail·Naver·Outlook IMAP4 모두 같은 패턴으로 접속."\r
  diagram:\r
    steps:\r
      - label: "1. 연결과 로그인"\r
        detail: "IMAP4_SSL(host) + login(user, appPass)."\r
      - label: "2. 폴더 선택"\r
        detail: "select('INBOX') 또는 select('INBOX/CodaroTest')."\r
      - label: "3. 검색"\r
        detail: "search(None, criteria)로 UID 리스트 반환."\r
      - label: "4. 본문 조회"\r
        detail: "fetch(uid, '(RFC822)')로 메시지 바이트 가져오기."\r
    runtime:\r
      - label: "본인 메일 계정 필요"\r
        detail: "환경변수 IMAP_USER, IMAP_APP_PASS 미설정 시 본 강의는 skip. 코드 패턴만 학습 가능."\r
      - label: "안전 정책"\r
        detail: "항상 별도 폴더에서만 작업. INBOX 직접 삭제 절대 금지."\r
\r
sections:\r
  - id: step1_connect\r
    title: "1단계. IMAP 연결과 로그인"\r
    structuredPrimary: true\r
    subtitle: "imaplib.IMAP4_SSL(host), login(user, appPass)"\r
    goal: "환경변수가 설정된 경우에만 IMAP4_SSL로 연결하고 로그인한다."\r
    why: "IMAP 모든 작업의 출발점입니다. 환경변수 가드를 두면 CI나 다른 환경에서 안전하게 skip 됩니다."\r
    explanation: |-\r
      IMAP4_SSL은 SSL로 직결합니다 (포트 993). login은 (이메일, 앱비밀번호) 형태. 환경변수 미설정 시 명확한 메시지로 skip.\r
    tips:\r
      - "Naver는 imap.naver.com, Gmail은 imap.gmail.com. 호스트 상수 사용."\r
    snippet: |-\r
      import imaplib\r
      import os\r
\r
      IMAP_HOST = "imap.gmail.com"\r
\r
      def connectImap():\r
          user = os.environ.get("IMAP_USER")\r
          appPass = os.environ.get("IMAP_APP_PASS")\r
          if not user or not appPass:\r
              return None\r
          conn = imaplib.IMAP4_SSL(IMAP_HOST)\r
          conn.login(user, appPass)\r
          return conn\r
\r
      conn = connectImap()\r
      state = "connected" if conn else "skipped (no env vars)"\r
      if conn:\r
          conn.logout()\r
      state\r
    exercise:\r
      prompt: "IMAP_HOST를 'imap.naver.com'으로 바꿔 Naver IMAP 준비를 하세요."\r
      starterCode: |-\r
        import imaplib\r
        import os\r
\r
        IMAP_HOST = ___\r
\r
        def connectImap():\r
            user = os.environ.get("IMAP_USER")\r
            if not user:\r
                return None\r
            return imaplib.IMAP4_SSL(IMAP_HOST)\r
\r
        IMAP_HOST\r
      hints:\r
        - "문자열 'imap.naver.com'."\r
    check:\r
      noError: "IMAP_HOST는 문자열."\r
      resultCheck: "출력 'imap.naver.com'."\r
\r
  - id: step2_select\r
    title: "2단계. 폴더 선택과 안전 정책"\r
    structuredPrimary: true\r
    subtitle: "conn.select('INBOX/CodaroTest')"\r
    goal: "INBOX/CodaroTest 폴더만 선택해 실수로 inbox 본문에 접근하지 않게 한다."\r
    why: "본 트랙 안전 정책 - IMAP 작업은 항상 별도 폴더에서. 학습 중 inbox 메일을 실수로 삭제하는 사고를 사전 차단합니다."\r
    explanation: |-\r
      conn.select(폴더명)을 호출하면 그 폴더가 활성화됩니다. 없는 폴더면 자동 생성되지 않으므로 conn.create('INBOX.CodaroTest')로 미리 생성. Gmail은 INBOX/CodaroTest, 일반 IMAP은 INBOX.CodaroTest 표기 차이.\r
    tips:\r
      - "Gmail의 라벨은 IMAP 폴더로 매핑됩니다. 라벨 'CodaroTest'를 만들면 IMAP에서 그 폴더에 접근 가능."\r
    snippet: |-\r
      import imaplib\r
      import os\r
\r
      IMAP_HOST = "imap.gmail.com"\r
      SAFE_FOLDER = "INBOX/CodaroTest"\r
\r
      def selectSafeFolder():\r
          user = os.environ.get("IMAP_USER")\r
          appPass = os.environ.get("IMAP_APP_PASS")\r
          if not user or not appPass:\r
              return "skipped"\r
          conn = imaplib.IMAP4_SSL(IMAP_HOST)\r
          conn.login(user, appPass)\r
          try:\r
              conn.create(SAFE_FOLDER)\r
          except imaplib.IMAP4.error:\r
              pass\r
          status, _ = conn.select(SAFE_FOLDER)\r
          conn.logout()\r
          return status\r
\r
      selectSafeFolder()\r
    exercise:\r
      prompt: "SAFE_FOLDER를 'INBOX/CodaroLesson'으로 바꾸세요."\r
      starterCode: |-\r
        SAFE_FOLDER = ___\r
        SAFE_FOLDER.endswith("Lesson")\r
      hints:\r
        - "문자열 'INBOX/CodaroLesson'."\r
    check:\r
      noError: "문자열."\r
      resultCheck: "True 출력."\r
\r
  - id: step3_search\r
    title: "3단계. 검색과 조회"\r
    structuredPrimary: true\r
    subtitle: "search(None, criteria), fetch(uid, '(RFC822)')"\r
    goal: "최근 N일 메일을 검색해 제목 목록을 만드는 함수의 형태를 정의한다."\r
    why: "검색 → 조회는 IMAP의 가장 흔한 흐름입니다. SINCE 기준 검색 패턴을 손에 익혀야 후속 강의 분류·이동이 자연스럽습니다."\r
    explanation: |-\r
      conn.search(None, 'SINCE', date)는 (status, [uid_string]) 튜플 반환. uid_string을 split해 UID 리스트로 만들고, conn.fetch(uid, '(RFC822)')로 각 메시지를 가져옵니다.\r
    tips:\r
      - "SINCE 날짜 형식은 '15-Jan-2026' 같은 영문 월. datetime.strftime('%d-%b-%Y')로 변환."\r
    snippet: |-\r
      import imaplib\r
      import os\r
      from datetime import datetime, timedelta\r
\r
      IMAP_HOST = "imap.gmail.com"\r
      SAFE_FOLDER = "INBOX/CodaroTest"\r
\r
      def recentSubjects(days=7):\r
          user = os.environ.get("IMAP_USER")\r
          appPass = os.environ.get("IMAP_APP_PASS")\r
          if not user or not appPass:\r
              return []\r
          conn = imaplib.IMAP4_SSL(IMAP_HOST)\r
          conn.login(user, appPass)\r
          try:\r
              conn.create(SAFE_FOLDER)\r
          except imaplib.IMAP4.error:\r
              pass\r
          conn.select(SAFE_FOLDER)\r
          since = (datetime.utcnow() - timedelta(days=days)).strftime("%d-%b-%Y")\r
          status, uidData = conn.search(None, "SINCE", since)\r
          subjects = []\r
          if status == "OK":\r
              for uid in uidData[0].split():\r
                  fStatus, fData = conn.fetch(uid, "(BODY[HEADER.FIELDS (SUBJECT)])")\r
                  if fStatus == "OK":\r
                      subjects.append(fData[0][1].decode("utf-8", errors="replace").strip())\r
          conn.logout()\r
          return subjects\r
\r
      "function defined: recentSubjects"\r
    exercise:\r
      prompt: "days 인자 기본값을 14로 바꾸세요."\r
      starterCode: |-\r
        import imaplib\r
        import os\r
        from datetime import datetime, timedelta\r
\r
        def recentSubjects(days=___):\r
            user = os.environ.get("IMAP_USER")\r
            if not user:\r
                return []\r
            return []\r
\r
        recentSubjects()\r
      hints:\r
        - "정수 14."\r
    check:\r
      noError: "기본값은 정수."\r
      resultCheck: "빈 리스트 출력."\r
\r
  - id: validation\r
    title: "4단계. 검증 루프 - 환경 가드 자동 검증"\r
    structuredPrimary: true\r
    subtitle: "환경변수 가드 + 함수 시그니처 단위 검증"\r
    goal: "환경변수가 없을 때 함수가 안전하게 빈 리스트를 돌려주는지 한 셀에서 검증한다."\r
    why: "IMAP 본문 검증은 실 환경 의존이지만, 환경 가드 자체는 단위 검증 가능합니다. CI에서도 통과합니다."\r
    explanation: |-\r
      환경변수 IMAP_USER가 없는 상태에서 recentSubjects 호출이 [] 반환하는지 확인. 이 가드가 본 트랙 안전 정책의 일관 검증입니다.\r
    tips:\r
      - "테스트 안에서 os.environ.pop으로 변수를 잠시 제거하면 환경 가드를 격리 검증할 수 있습니다."\r
    snippet: |-\r
      import imaplib\r
      import os\r
      from datetime import datetime, timedelta\r
\r
      IMAP_HOST = "imap.gmail.com"\r
\r
      def recentSubjects(days=7):\r
          user = os.environ.get("IMAP_USER")\r
          appPass = os.environ.get("IMAP_APP_PASS")\r
          if not user or not appPass:\r
              return []\r
          return ["would-call-imap"]\r
\r
      savedUser = os.environ.pop("IMAP_USER", None)\r
      savedPass = os.environ.pop("IMAP_APP_PASS", None)\r
      try:\r
          result = recentSubjects()\r
          assert result == []\r
      finally:\r
          if savedUser is not None:\r
              os.environ["IMAP_USER"] = savedUser\r
          if savedPass is not None:\r
              os.environ["IMAP_APP_PASS"] = savedPass\r
      result\r
    exercise:\r
      prompt: "recentSubjects 본체를 직접 작성하세요. IMAP_USER가 비어있으면 빈 리스트를 반환하고, 있으면 (실제 IMAP 호출 자리표시로) ['stub-subject']를 반환해야 합니다. 본 트랙의 안전 가드 패턴이 함수에 묶이는 흐름을 직접 짭니다."\r
      starterCode: |-\r
        import os\r
\r
        def recentSubjects(days=7):\r
            ___\r
\r
        savedUser = os.environ.pop("IMAP_USER", None)\r
        try:\r
            withoutEnv = recentSubjects()\r
            os.environ["IMAP_USER"] = "demo@example.com"\r
            withEnv = recentSubjects()\r
            assert withoutEnv == []\r
            assert withEnv == ["stub-subject"]\r
        finally:\r
            os.environ.pop("IMAP_USER", None)\r
            if savedUser is not None:\r
                os.environ["IMAP_USER"] = savedUser\r
        (withoutEnv, withEnv)\r
      hints:\r
        - "본체: if not os.environ.get('IMAP_USER'): return []  / 그 뒤 return ['stub-subject']."\r
    check:\r
      noError: "빈 리스트 []."\r
      resultCheck: "출력 []."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "최근 메일 제목 모으기 도구"\r
    goal: "IMAP 패턴을 함수로 묶어 본인 계정 또는 환경 가드 동작을 검증한다."\r
    why: "검색 + 조회 + 환경 가드 세 가지가 한 함수에 모이면 06강 첨부 자동 저장과 07강 룰 기반 분류가 같은 진입점에서 시작합니다. 환경변수가 없는 CI에서는 자동 skip, 본인 계정에서는 실 IMAP 호출이 같은 코드 경로로 흐르는 게 본 강의의 도착점입니다."\r
    explanation: |-\r
      미션: fetchRecentSubjects(days, host, folder) -> list[str]. 환경 가드, 폴더 안전 처리, SINCE 검색, fetch까지.\r
    tips:\r
      - "본인 계정으로 시도하려면 환경변수 IMAP_USER, IMAP_APP_PASS 설정."\r
    snippet: |-\r
      import imaplib\r
      import os\r
      from datetime import datetime, timedelta\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수: fetchRecentSubjects(days=7, host='imap.gmail.com', folder='INBOX/CodaroTest') -> list[str]"\r
    check:\r
      noError: "환경 가드 + IMAP 흐름."\r
      resultCheck: "환경변수 없으면 [], 있으면 제목 리스트."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 최근 메일 제목 도구"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import imaplib\r
              import os\r
              from datetime import datetime, timedelta\r
\r
              def fetchRecentSubjects(days=7, host="imap.gmail.com", folder="INBOX/CodaroTest"):\r
                  user = os.environ.get("IMAP_USER")\r
                  appPass = os.environ.get("IMAP_APP_PASS")\r
                  if not user or not appPass:\r
                      return []\r
                  conn = imaplib.IMAP4_SSL(host)\r
                  conn.login(user, appPass)\r
                  try:\r
                      conn.create(folder)\r
                  except imaplib.IMAP4.error:\r
                      pass\r
                  conn.select(folder)\r
                  since = (datetime.utcnow() - timedelta(days=days)).strftime("%d-%b-%Y")\r
                  status, uidData = conn.search(None, "SINCE", since)\r
                  subjects = []\r
                  if status == "OK":\r
                      for uid in uidData[0].split():\r
                          fStatus, fData = conn.fetch(uid, "(BODY[HEADER.FIELDS (SUBJECT)])")\r
                          if fStatus == "OK":\r
                              subjects.append(fData[0][1].decode("utf-8", errors="replace").strip())\r
                  conn.logout()\r
                  return subjects\r
\r
              savedUser = os.environ.pop("IMAP_USER", None)\r
              savedPass = os.environ.pop("IMAP_APP_PASS", None)\r
              try:\r
                  result = fetchRecentSubjects()\r
                  assert result == []\r
              finally:\r
                  if savedUser is not None:\r
                      os.environ["IMAP_USER"] = savedUser\r
                  if savedPass is not None:\r
                      os.environ["IMAP_APP_PASS"] = savedPass\r
              result\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "검색 조건 확장 (FROM, SUBJECT, UNSEEN 조합)"\r
          - "결과 캐싱 (UID 기록 후 다음 호출에 SEEN 표시)"\r
          - "여러 폴더 동시 조회 (CodaroTest + Archive)"\r
          - "Naver IMAP으로 동일 패턴 전환"\r
          - "06강 결합 - 검색 결과를 첨부 저장 함수로 넘기기"\r
`;export{e as default};