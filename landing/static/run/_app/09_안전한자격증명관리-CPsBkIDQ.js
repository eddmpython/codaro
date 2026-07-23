var e=`meta:\r
  id: email_09\r
  title: 안전한 자격증명 관리\r
  order: 9\r
  category: email\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  packages: []\r
  tags:\r
    - os.environ\r
    - dryRun\r
    - .env\r
    - 보안\r
  outcomes:\r
    - automation.email.credentials\r
  prerequisites:\r
    - automation.email.send\r
  estimatedMinutes: 45\r
  seo:\r
    title: "안전한 자격증명 관리 - 환경변수 + dryRun 일관 패턴"\r
    description: "발송·수신 모듈에 자격증명을 안전하게 관리. .env 활용, dryRun 일관 패턴, 환경 검증."\r
    keywords:\r
      - 환경변수 관리\r
      - dotenv\r
      - dryRun 패턴\r
      - SMTP 자격증명\r
\r
intro:\r
  direction: "발송·수신 모듈의 자격증명을 환경변수와 dryRun으로 일관되게 관리한다. 평문 비밀번호 사고와 .env 커밋 사고를 모두 차단."\r
  benefits:\r
    - "한 모듈로 모든 강의의 자격증명을 통합 관리해 사고 위험을 한 곳에 격리."\r
    - ".env 파일 + .gitignore + load_dotenv 패턴이 본 강의로 안착."\r
    - "dryRun 정책을 함수 시그니처 수준에서 강제."\r
  diagram:\r
    steps:\r
      - label: "1. 환경변수 로드"\r
        detail: ".env 파일에서 os.environ으로 자동 로드 (외부 dotenv 불필요한 표준 구현)."\r
      - label: "2. validateCredentials"\r
        detail: "필수 변수 누락 시 명확한 에러."\r
      - label: "3. dryRun 강제"\r
        detail: "함수 표면에서 dryRun=True 기본값 일관 적용."\r
      - label: "4. .gitignore 안내"\r
        detail: ".env 파일은 절대 커밋하지 않도록."\r
    runtime:\r
      - label: "표준만"\r
        detail: "외부 python-dotenv 대신 표준 라이브러리로 간단 구현."\r
      - label: "검증"\r
        detail: "환경변수 가드와 dryRun 흐름을 단위 assert."\r
\r
sections:\r
  - id: step1_load_env\r
    title: "1단계. .env 파일 로드 (표준만)"\r
    structuredPrimary: true\r
    subtitle: "임시 .env 작성 + 수동 파싱"\r
    goal: "key=value 형태의 .env 파일을 읽어 os.environ에 주입한다."\r
    why: "외부 dotenv 의존 없이 표준만으로 .env 로드 가능. 본 트랙의 외부 의존 0 정책 일관."\r
    explanation: |-\r
      .env 파일은 KEY=VALUE 줄들. 파싱은 strip().split('=', 1)으로 충분. 줄 시작이 #이면 주석.\r
    tips:\r
      - "값에 따옴표가 있으면 strip하는 정도면 충분. 본격 dotenv는 python-dotenv 추천."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import os\r
\r
      def loadEnvFile(path):\r
          loaded = {}\r
          for raw in Path(path).read_text(encoding="utf-8").splitlines():\r
              line = raw.strip()\r
              if not line or line.startswith("#"):\r
                  continue\r
              key, _, value = line.partition("=")\r
              loaded[key.strip()] = value.strip().strip('"').strip("'")\r
          for key, value in loaded.items():\r
              os.environ[key] = value\r
          return list(loaded.keys())\r
\r
      workdir = TemporaryDirectory()\r
      envPath = Path(workdir.name) / ".env"\r
      envPath.write_text(\r
          "# Codaro Email\\n"\r
          "SMTP_USER=me@example.com\\n"\r
          'SMTP_APP_PASS="app pass 16자"\\n',\r
          encoding="utf-8",\r
      )\r
      keys = loadEnvFile(envPath)\r
      keys, os.environ.get("SMTP_USER")\r
    exercise:\r
      prompt: ".env에 IMAP_USER 한 줄 더 추가하고 loaded keys 길이가 3인지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import os\r
\r
        def loadEnvFile(path):\r
            loaded = {}\r
            for raw in Path(path).read_text(encoding="utf-8").splitlines():\r
                line = raw.strip()\r
                if not line or line.startswith("#"):\r
                    continue\r
                key, _, value = line.partition("=")\r
                loaded[key.strip()] = value.strip().strip('"').strip("'")\r
            for key, value in loaded.items():\r
                os.environ[key] = value\r
            return list(loaded.keys())\r
\r
        workdir = TemporaryDirectory()\r
        envPath = Path(workdir.name) / ".env"\r
        envPath.write_text(\r
            "SMTP_USER=me@example.com\\n"\r
            "SMTP_APP_PASS=secret\\n"\r
            ___,\r
            encoding="utf-8",\r
        )\r
        len(loadEnvFile(envPath))\r
      hints:\r
        - "추가 줄. 예: 'IMAP_USER=me@example.com\\\\n'."\r
    check:\r
      noError: "줄 끝 줄바꿈."\r
      resultCheck: "출력 3."\r
\r
  - id: step2_validate\r
    title: "2단계. 자격증명 검증"\r
    structuredPrimary: true\r
    subtitle: "필수 변수 가드"\r
    goal: "필요한 환경변수가 모두 있는지 확인하고 누락 시 명확한 에러를 낸다."\r
    why: "환경변수 누락이 디버깅 시간을 가장 많이 잡아먹습니다. 시작 단계에서 한 번 검증하면 끝까지 안전."\r
    explanation: |-\r
      validateCredentials(required=['SMTP_USER', 'SMTP_APP_PASS'])이 누락된 변수 리스트를 돌려주고, 누락이 있으면 EnvironmentError로 명확히 알림.\r
    tips:\r
      - "에러 메시지에 누락 변수 이름을 명시적으로 적어주면 사용자가 바로 해결 가능."\r
    snippet: |-\r
      import os\r
\r
      def validateCredentials(required):\r
          missing = [key for key in required if not os.environ.get(key)]\r
          if missing:\r
              raise EnvironmentError(f"필수 환경변수 누락: {', '.join(missing)}")\r
          return True\r
\r
      os.environ["SMTP_USER"] = "me@example.com"\r
      os.environ["SMTP_APP_PASS"] = "secret"\r
      try:\r
          validateCredentials(["SMTP_USER", "SMTP_APP_PASS"])\r
          state = "valid"\r
      except EnvironmentError as exc:\r
          state = str(exc)\r
      state\r
    exercise:\r
      prompt: "필수에 'IMAP_USER'를 추가하고, 환경변수가 없으면 에러 메시지에 'IMAP_USER'가 포함되는지 확인하세요."\r
      starterCode: |-\r
        import os\r
\r
        def validateCredentials(required):\r
            missing = [key for key in required if not os.environ.get(key)]\r
            if missing:\r
                raise EnvironmentError(f"missing: {', '.join(missing)}")\r
            return True\r
\r
        os.environ.pop("IMAP_USER", None)\r
        try:\r
            validateCredentials(["SMTP_USER", ___])\r
            state = "ok"\r
        except EnvironmentError as exc:\r
            state = str(exc)\r
        "IMAP_USER" in state\r
      hints:\r
        - "문자열 'IMAP_USER'."\r
    check:\r
      noError: "리스트 원소는 문자열."\r
      resultCheck: "True 출력."\r
\r
  - id: step3_dryrun_module\r
    title: "3단계. 통합 발송 모듈"\r
    structuredPrimary: true\r
    subtitle: "환경 + dryRun + 발송 패턴 통합"\r
    goal: "자격증명 검증 + dryRun + 실 발송이 한 모듈에 들어간다."\r
    why: "본 모듈 하나가 본 트랙의 모든 강의 발송 표면입니다. 한 곳에서 보안과 안전 모두 관리."\r
    explanation: |-\r
      sendEmail(toAddr, subject, body, dryRun=True)이 검증 → 메시지 빌드 → dryRun 분기 → 실 발송 흐름을 한 함수에 묶음.\r
    tips:\r
      - "dryRun=True를 절대 기본값에서 빼지 마세요. 변경 시 안전 정책이 깨집니다."\r
    snippet: |-\r
      import os\r
      import smtplib\r
      import ssl\r
      from email.message import EmailMessage\r
\r
      def sendEmail(toAddr, subject, body, dryRun=True):\r
          if not dryRun:\r
              required = ["SMTP_USER", "SMTP_APP_PASS"]\r
              missing = [key for key in required if not os.environ.get(key)]\r
              if missing:\r
                  raise EnvironmentError(f"missing: {', '.join(missing)}")\r
          msg = EmailMessage()\r
          msg["From"] = os.environ.get("SMTP_USER", "me@example.com")\r
          msg["To"] = toAddr\r
          msg["Subject"] = subject\r
          msg.set_content(body, charset="utf-8")\r
          if dryRun:\r
              return msg\r
          ctx = ssl.create_default_context()\r
          with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as smtp:\r
              smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_APP_PASS"])\r
              smtp.send_message(msg)\r
          return msg\r
\r
      result = sendEmail("partner@example.com", "test", "body", dryRun=True)\r
      result["Subject"], result.get_content().strip()\r
    exercise:\r
      prompt: "sendEmail을 직접 작성하세요. dryRun=False일 때 SMTP_USER/SMTP_APP_PASS 누락이면 EnvironmentError를 raise하고, dryRun=True일 때는 환경변수 누락이어도 EmailMessage만 만들어 반환해야 합니다. 두 경로를 모두 검증합니다."\r
      starterCode: |-\r
        import os\r
        from email.message import EmailMessage\r
\r
        def sendEmail(toAddr, subject, body, dryRun=True):\r
            if not dryRun:\r
                missing = ___\r
                if missing:\r
                    raise EnvironmentError(f"missing: {', '.join(missing)}")\r
            msg = EmailMessage()\r
            msg["From"] = os.environ.get("SMTP_USER", "me@example.com")\r
            msg["To"] = toAddr\r
            msg["Subject"] = subject\r
            msg.set_content(body, charset="utf-8")\r
            if dryRun:\r
                return msg\r
            raise RuntimeError("실 발송 경로")\r
\r
        savedUser = os.environ.pop("SMTP_USER", None)\r
        savedPass = os.environ.pop("SMTP_APP_PASS", None)\r
        try:\r
            dry = sendEmail("partner@example.com", "월간 보고서", "body", dryRun=True)\r
            assert dry["Subject"] == "월간 보고서"\r
            try:\r
                sendEmail("partner@example.com", "x", "y", dryRun=False)\r
                guarded = False\r
            except EnvironmentError:\r
                guarded = True\r
        finally:\r
            if savedUser is not None:\r
                os.environ["SMTP_USER"] = savedUser\r
            if savedPass is not None:\r
                os.environ["SMTP_APP_PASS"] = savedPass\r
        (dry["Subject"], guarded)\r
      hints:\r
        - "missing: [k for k in ('SMTP_USER', 'SMTP_APP_PASS') if not os.environ.get(k)]."\r
    check:\r
      noError: "Subject는 문자열."\r
      resultCheck: "출력 '월간 보고서'."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "환경 격리 발송 모듈"\r
    goal: "loadEnvFile + validate + sendEmail을 한 모듈로 묶어 환경 격리된 안전 발송기 완성."\r
    why: "회사 PC에 평문 비밀번호가 박힌 스크립트가 git에 커밋되면 보안 사고와 계정 정지로 직결됩니다. .env 파일 + load → validate → dryRun 흐름을 한 모듈에 모으면 자격증명 관리 정책이 한 곳에서 강제되고, 10강 주간 보고서 발송기는 이 모듈을 그대로 백엔드로 사용해 보안과 안전 모두를 한 줄로 처리합니다."\r
    explanation: |-\r
      미션: 환경 가드, 검증, dryRun을 모두 갖춘 sendEmailModule(toAddr, subject, body, dryRun=True) 함수 작성.\r
    tips:\r
      - ".env는 절대 git 커밋 금지. .gitignore에 추가 필수."\r
    snippet: |-\r
      import os\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수: sendEmailModule(toAddr, subject, body, dryRun=True) -> EmailMessage"\r
    check:\r
      noError: "환경 가드 + dryRun."\r
      resultCheck: "dryRun=True에서 EmailMessage 반환."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 환경 격리 발송 모듈"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import os\r
              import smtplib\r
              import ssl\r
              from email.message import EmailMessage\r
\r
              def validateCredentials(required):\r
                  missing = [key for key in required if not os.environ.get(key)]\r
                  if missing:\r
                      raise EnvironmentError(f"필수 환경변수 누락: {', '.join(missing)}")\r
                  return True\r
\r
              def sendEmailModule(toAddr, subject, body, dryRun=True, fromAddr=None):\r
                  msg = EmailMessage()\r
                  msg["From"] = fromAddr or os.environ.get("SMTP_USER", "me@example.com")\r
                  msg["To"] = toAddr\r
                  msg["Subject"] = subject\r
                  msg.set_content(body, charset="utf-8")\r
                  if dryRun:\r
                      return msg\r
                  validateCredentials(["SMTP_USER", "SMTP_APP_PASS"])\r
                  ctx = ssl.create_default_context()\r
                  with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as smtp:\r
                      smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_APP_PASS"])\r
                      smtp.send_message(msg)\r
                  return msg\r
\r
              result = sendEmailModule(\r
                  "partner@example.com",\r
                  "월간 보고서 발송",\r
                  "검토 부탁드립니다.",\r
                  dryRun=True,\r
              )\r
              assert result["Subject"] == "월간 보고서 발송"\r
              assert result["To"] == "partner@example.com"\r
              assert "검토" in result.get_content()\r
              result["Subject"]\r
      - type: expansion\r
        title: "미션2: 환경 프로필 스위처"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import os\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
\r
              def loadProfile(envDir, profile):\r
                  path = Path(envDir) / f".env.{profile}"\r
                  if not path.exists():\r
                      raise FileNotFoundError(f"프로필 없음: {path}")\r
                  values = {}\r
                  for raw in path.read_text(encoding="utf-8").splitlines():\r
                      line = raw.strip()\r
                      if not line or line.startswith("#"):\r
                          continue\r
                      key, _, value = line.partition("=")\r
                      values[key.strip()] = value.strip().strip('"').strip("'")\r
                  return values\r
\r
              def applyProfile(values, required):\r
                  missing = [k for k in required if not values.get(k)]\r
                  if missing:\r
                      raise EnvironmentError(f"프로필 누락 변수: {', '.join(missing)}")\r
                  for key, value in values.items():\r
                      os.environ[key] = value\r
                  return sorted(values.keys())\r
\r
              workdir = TemporaryDirectory()\r
              base = Path(workdir.name)\r
              (base / ".env.dev").write_text(\r
                  "SMTP_USER=dev@example.com\\nSMTP_APP_PASS=dev-pass\\n",\r
                  encoding="utf-8",\r
              )\r
              (base / ".env.prod").write_text(\r
                  "SMTP_USER=ops@example.com\\nSMTP_APP_PASS=prod-pass\\n",\r
                  encoding="utf-8",\r
              )\r
\r
              savedUser = os.environ.pop("SMTP_USER", None)\r
              savedPass = os.environ.pop("SMTP_APP_PASS", None)\r
              try:\r
                  devKeys = applyProfile(loadProfile(base, "dev"), ["SMTP_USER", "SMTP_APP_PASS"])\r
                  assert os.environ["SMTP_USER"] == "dev@example.com"\r
                  prodKeys = applyProfile(loadProfile(base, "prod"), ["SMTP_USER", "SMTP_APP_PASS"])\r
                  assert os.environ["SMTP_USER"] == "ops@example.com"\r
                  try:\r
                      loadProfile(base, "missing")\r
                      missingGuarded = False\r
                  except FileNotFoundError:\r
                      missingGuarded = True\r
              finally:\r
                  os.environ.pop("SMTP_USER", None)\r
                  os.environ.pop("SMTP_APP_PASS", None)\r
                  if savedUser is not None:\r
                      os.environ["SMTP_USER"] = savedUser\r
                  if savedPass is not None:\r
                      os.environ["SMTP_APP_PASS"] = savedPass\r
              (devKeys, prodKeys, missingGuarded)\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "여러 계정 (개인/회사) 환경변수 분리"\r
          - "OAuth2 토큰 refresh 자동화 (Outlook M365)"\r
          - "비밀번호를 OS 키체인(macOS Keychain, Windows Credential)에 저장"\r
          - ".env 검증 CLI 도구 (필수 변수 보고)"\r
          - "환경별 .env (.env.dev, .env.prod) 분기"\r
`;export{e as default};