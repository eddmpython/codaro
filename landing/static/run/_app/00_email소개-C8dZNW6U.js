var e=`meta:\r
  id: email_00\r
  title: 이메일 자동화 소개\r
  order: 0\r
  category: email\r
  badge: 읽기\r
  packages: []\r
  tags:\r
    - email\r
    - smtplib\r
    - imaplib\r
    - 표준라이브러리\r
  outcomes:\r
    - automation.email.intro\r
  prerequisites:\r
    - python.functions\r
    - python.modulesAndIo\r
  estimatedMinutes: 25\r
  seo:\r
    title: "이메일 자동화 소개 - 표준 라이브러리로 발송·수신·분류"\r
    description: "smtplib·imaplib·email 세 표준 모듈로 메일 발송·수신·분류를 자동화한다. 외부 의존 0개, 10개 프로젝트로 주간 8시간 절감 목표."\r
    keywords:\r
      - 이메일 자동화\r
      - smtplib\r
      - imaplib\r
      - 앱 비밀번호\r
      - dryRun 패턴\r
\r
intro:\r
  direction: "매일 받은편지함 정리와 정기 보고서 발송을 Python 표준 라이브러리만으로 자동화한다. 외부 패키지 0개로 회사 보안 정책에 막힐 일이 없다."\r
  benefits:\r
    - "주간 8시간 이상 절감 - CS 분류, 정기 보고서 발송, 첨부 정리, 알림 봇."\r
    - "외부 의존 0개 - smtplib·imaplib·email 세 표준 모듈로 전 과정 처리."\r
    - "dryRun 안전 패턴이 모든 강의 첫 셀에 들어가 학습 중 오발송 사고를 사전 차단."\r
  diagram:\r
    steps:\r
      - label: "1. SMTP로 발송"\r
        detail: "smtplib.SMTP_SSL + EmailMessage로 한 줄 발송 → HTML+첨부 → 다수 개인화."\r
      - label: "2. IMAP로 수신"\r
        detail: "imaplib.IMAP4_SSL로 메일함을 코드로 다룸. 검색·첨부 저장·이동."\r
      - label: "3. 규칙 기반 분류"\r
        detail: "발신자·제목 룰로 메일을 자동 폴더 이동."\r
      - label: "4. 통합 발송기"\r
        detail: "CSV 데이터 → 차트·표 HTML 본문 + PDF 첨부 → 다수 발송 + 알림."\r
    runtime:\r
      - label: "Python 표준 라이브러리"\r
        detail: "smtplib, imaplib, email - 외부 패키지 0개. 회사 PC에서 추가 설치 없이 즉시 시작."\r
      - label: "안전 검증"\r
        detail: "01-09강은 EmailMessage 객체 단위 assert. 10강만 aiosmtpd로 로컬 SMTP 띄워 실제 송신 검증."\r
\r
sections:\r
  - id: position\r
    title: "1. 이메일 자동화가 차지하는 자리"\r
    blocks:\r
      - type: text\r
        content: |-\r
          이메일은 직장인이 가장 자주 다루는 인터페이스입니다. 매주 100명 고객에게 안내 메일을 보내거나, 매일 CS 메일을 분류하거나, 매월 정기 보고서를 발송하는 작업이 모두 손작업이라면 매주 8시간 이상이 빠집니다. Python 표준 라이브러리만으로 이 시간을 거의 0초에 가깝게 만들 수 있습니다.\r
      - type: text\r
        content: |-\r
          이 트랙은 외부 패키지 0개라는 정책을 가집니다. smtplib(발송), imaplib(수신), email(MIME 메시지 구성) 세 표준 모듈로 전 과정을 다룹니다. 회사 보안 정책이 엄격해 외부 패키지 설치가 막힌 환경에서도 그대로 동작합니다. 단 10강 통합 검증에만 aiosmtpd라는 dev dependency를 사용합니다.\r
      - type: text\r
        content: |-\r
          dryRun이라는 안전 패턴이 트랙 전체에 의무로 들어갑니다. 모든 발송 함수는 기본 dryRun=True로 시작해 실제 발송을 명시적으로 켜야만 합니다. 학습 중 100명 명단에 실수로 메일이 나가는 사고가 원천적으로 차단됩니다.\r
\r
  - id: library_map\r
    title: "2. 세 표준 모듈의 자리"\r
    blocks:\r
      - type: table\r
        headers: ["모듈", "역할", "사용 강의"]\r
        rows:\r
          - ["smtplib.SMTP_SSL", "발송 (465 포트)", "01·02·03·04·08·09·10"]\r
          - ["email.message.EmailMessage", "MIME 메시지 구성", "01·02·03·04·08·10"]\r
          - ["email.mime.*", "첨부·인라인 이미지 (EmailMessage로 부족할 때)", "02·04"]\r
          - ["imaplib.IMAP4_SSL", "수신·검색·이동", "05·06·07"]\r
          - ["email.parser.BytesParser", "받은 메일 파싱", "06"]\r
          - ["ssl", "TLS 컨텍스트", "01-10 공통"]\r
      - type: note\r
        title: "왜 yagmail·sendgrid를 쓰지 않나"\r
        content: "yagmail은 3줄 발송이 가능하지만 dryRun·환경변수 안전 가드를 우회합니다. 학습 가치가 떨어지고 실무 트러블슈팅에서도 표준이 보편적입니다. sendgrid·mailgun은 외부 API 가입과 과금이 필요해 학습 진입장벽이 됩니다. 본 트랙은 표준만으로 완결합니다."\r
\r
  - id: persona_match\r
    title: "3. 누가 어느 강의에서 답을 얻나"\r
    blocks:\r
      - type: text\r
        content: |-\r
          네 페르소나를 기준으로 강의가 설계됐습니다. 본인 업무와 가까운 곳부터 우선 가져갈 수 있습니다.\r
      - type: table\r
        headers: ["페르소나", "주간 메일 작업", "이 트랙 졸업 시 산출물"]\r
        rows:\r
          - ["마케팅 정주임", "매주 100명 고객에게 개인화 안내 수동 발송", "03·04강 - CSV → 개인화 HTML 메일 일괄"]\r
          - ["사장님 (1인 기업)", "CS 메일 분류 (문의/주문/스팸) 매일 30분", "07강 - 발신자/제목 룰 기반 자동 분류"]\r
          - ["운영 김대리", "매일 아침 매출 집계 → 팀장에게 보고", "04·10강 - 차트 인라인 + PDF 첨부 자동 발송"]\r
          - ["DevOps 박과장", "야간 배치 실패 시 새벽 수동 확인", "08강 - 예외 → SMTP 알림 + 로그 첨부"]\r
\r
  - id: capability_map\r
    title: "4. 10개 프로젝트로 다루는 능력"\r
    blocks:\r
      - type: table\r
        headers: ["프로젝트", "핵심 능력", "산출물"]\r
        rows:\r
          - ["01 첫 메일 발송", "SMTP_SSL, login, EmailMessage", "자기 자신에게 텍스트 메일"]\r
          - ["02 HTML과 첨부", "add_alternative HTML, add_attachment", "HTML 메일 + PDF 첨부"]\r
          - ["03 다수 수신자와 개인화", "To/CC/BCC, string.Template", "CSV → 100명 개인화 발송"]\r
          - ["04 표와 차트 삽입", "Content-ID, DataFrame.to_html", "표+차트 일일 메일"]\r
          - ["05 IMAP으로 받기", "IMAP4_SSL, select, search, fetch", "최근 7일 메일 제목"]\r
          - ["06 첨부 자동 저장", "BytesParser, walk, disposition", "세금계산서 첨부 → 폴더 정리"]\r
          - ["07 규칙 기반 분류", "IMAP MOVE, 발신자/제목 룰", "발신자별 자동 폴더 분류"]\r
          - ["08 스크립트 결과 알림", "예외 → 알림 함수, 로그 첨부", "실패 시 스택트레이스 메일"]\r
          - ["09 안전한 자격증명 관리", "os.environ, .env, dryRun 일관", "환경 격리 발송 모듈"]\r
          - ["10 주간 보고서 발송기", "전 개념 종합 + aiosmtpd", "CSV → HTML+PDF → 다수 발송 + 알림"]\r
\r
  - id: safety_policy\r
    title: "5. 트랙 전체에 적용되는 안전 정책"\r
    blocks:\r
      - type: text\r
        content: |-\r
          이메일 자동화는 실수 비용이 가장 큰 자동화 영역입니다. 잘못 보낸 메일은 회수 불가, 대량 발송은 스팸 차단·계정 정지의 원인이 됩니다. 다음 네 가지가 모든 강의 첫 셀에 의무로 들어갑니다.\r
      - type: list\r
        style: check\r
        items:\r
          - "자격증명은 환경변수만 - 코드에 평문 비밀번호 금지. os.environ['SMTP_APP_PASS']."\r
          - "앱 비밀번호 또는 OAuth만 - Gmail/Naver 모두 일반 비밀번호 차단."\r
          - "dryRun 플래그 의무화 - 모든 발송 함수는 기본 dryRun=True. 실 발송은 명시적으로 dryRun=False를 넘겨야만 동작."\r
          - "IMAP 작업은 별도 폴더에서만 - INBOX/CodaroTest 같은 전용 폴더 생성 후 그 안에서만. inbox 메일 삭제 절대 금지."\r
      - type: note\r
        title: "Gmail 앱 비밀번호 발급 절차"\r
        content: "Google 계정 → 보안 → 2단계 인증 켜기 → 앱 비밀번호 생성. 16자 임의 문자열이 생성되며 한 번만 표시됩니다. 환경변수 SMTP_USER에 이메일 주소, SMTP_APP_PASS에 16자 문자열을 저장하고 코드는 os.environ으로 읽습니다."\r
\r
  - id: contract\r
    title: "6. 학습 계약"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "모든 발송 함수는 dryRun=True 기본값. 실 발송은 dryRun=False 명시 필요."\r
          - "01-09강은 EmailMessage 객체 단위 assert로 검증. 외부 서버 의존 0."\r
          - "10강만 aiosmtpd 로컬 SMTP 서버를 띄워 실제 송신을 검증."\r
          - "IMAP 강의(05-07)는 학습자 본인 계정에서만 실행 가능. CI 환경에서는 skip."\r
          - "환경변수 SMTP_USER/SMTP_APP_PASS 미설정 시 통합 테스트는 자동 skip."\r
      - type: tip\r
        content: "본 트랙을 시작하기 전에 Gmail 또는 Naver의 앱 비밀번호를 미리 발급하고 환경변수에 저장해 두세요. 01강의 자기 자신 발송 테스트가 즉시 가능해집니다."\r
`;export{e as default};