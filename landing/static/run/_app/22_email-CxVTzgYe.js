var e=`meta:\r
  id: 22_email\r
  title: email - 이메일 처리\r
  category: builtins\r
  tags:\r
  - email\r
  - MIME\r
  - EmailMessage\r
  - 메일\r
  - 첨부파일\r
  description: 이메일 메시지 생성과 파싱을 위한 email 모듈\r
  keywords:\r
  - email\r
  - MIME\r
  - EmailMessage\r
  - 메일\r
  - 첨부파일\r
intro:\r
  emoji: 📧\r
  points:\r
  - 이메일 메시지 생성\r
  - MIME 타입 처리\r
  - 첨부 파일 추가\r
  - 이메일 파싱\r
  direction: email 이메일 처리에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - email 이메일 처리 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: email 모듈 불러오기 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 이메일 메시지 기본 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: MIME 타입 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: email 이메일 처리 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: email 이메일 처리 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: email 이메일 처리 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: email 모듈 불러오기\r
  structuredPrimary: true\r
  subtitle: ⚠️ 가장 먼저 실행하세요\r
  goal: email 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표준 라이브러리는 외부 의존성 없이 파일, 시간, 문자열, 직렬화 같은 업무 코드를 구성하는 기반입니다.\r
  explanation: |-\r
    email은 파이썬 표준 라이브러리입니다. 이메일 메시지를 생성하고 파싱하는 기능을 제공합니다. MIME 형식 지원, 첨부 파일 처리, 헤더 관리 등 이메일 작업에 필요한 모든 기능을 포함합니다. 별도 설치 없이 import만으로 사용할 수 있습니다.\r
\r
    이 섹션을 먼저 실행하면 아래 모든 예제에서 email 모듈을 사용할 수 있습니다.\r
  snippet: |-\r
    from email.message import EmailMessage\r
    from email.mime.text import MIMEText\r
    from email.mime.multipart import MIMEMultipart\r
\r
    # 정상 로드 확인\r
    'email 모듈이 정상적으로 로드되었습니다'\r
  exercise:\r
    prompt: email 모듈 불러오기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: |-\r
      from email.message import EmailMessage\r
      from email.mime.text import MIMEText\r
      from email.mime.multipart import MIMEMultipart\r
\r
      # 정상 로드 확인\r
      'email 모듈이 정상적으로 로드되었습니다'\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: email 모듈 불러오기의 수정 코드가 모듈 함수 호출 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: email 모듈 불러오기 실행 결과가 반환값, stdout, 객체 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: message_basics\r
  title: 이메일 메시지 기본\r
  structuredPrimary: true\r
  subtitle: EmailMessage 클래스\r
  goal: 이메일 메시지 기본에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    EmailMessage는 이메일 메시지를 표현하는 기본 클래스입니다. 발신자, 수신자, 제목, 본문 등 이메일의 모든 요소를 관리합니다. 간단한 텍스트 이메일부터 복잡한 MIME 메시지까지 생성할 수 있습니다.\r
\r
    EmailMessage는 Python 3.6+에서 권장되는 최신 API입니다.\r
  snippet: |-\r
    simpleMsg = EmailMessage()\r
    simpleMsg['From'] = 'sender@example.com'\r
    simpleMsg['To'] = 'receiver@example.com'\r
    simpleMsg['Subject'] = 'Hello'\r
    simpleMsg.set_content('This is a test message.')\r
\r
    len(simpleMsg.as_string())\r
  exercise:\r
    prompt: 이메일 메시지 기본 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      simpleMsg = EmailMessage()\r
      simpleMsg['From'] = 'sender@example.com'\r
      simpleMsg['To'] = 'receiver@example.com'\r
      simpleMsg['Subject'] = 'Hello'\r
      simpleMsg.set_content('This is a test message.')\r
\r
      len(simpleMsg.as_string())\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 이메일 메시지 기본에서 \`simpleMsg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 이메일 메시지 기본 실행 뒤 \`simpleMsg\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: mime_types\r
  title: MIME 타입\r
  structuredPrimary: true\r
  subtitle: MIMEText, MIMEMultipart\r
  goal: MIME 타입에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    MIME(Multipurpose Internet Mail Extensions)는 다양한 형식의 콘텐츠를 이메일로 전송할 수 있게 합니다. MIMEText는 텍스트, MIMEMultipart는 여러 파트로 구성된 메시지, MIMEImage는 이미지를 다룹니다. HTML 이메일, 첨부 파일 등에 필수적입니다.\r
\r
    MIMEMultipart를 사용하면 텍스트와 HTML 버전을 함께 보낼 수 있습니다.\r
  snippet: |-\r
    textMsg = MIMEText('Hello, this is plain text.')\r
    textMsg['Subject'] = 'Plain Text'\r
    textMsg['From'] = 'sender@example.com'\r
\r
    textMsg.get_content_type()\r
  exercise:\r
    prompt: MIME 타입 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      textMsg = MIMEText('Hello, this is plain text.')\r
      textMsg['Subject'] = 'Plain Text'\r
      textMsg['From'] = 'sender@example.com'\r
\r
      textMsg.get_content_type()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: MIME 타입에서 \`textMsg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: MIME 타입 실행 뒤 \`textMsg\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: headers\r
  title: 헤더 관리\r
  structuredPrimary: true\r
  subtitle: From, To, Subject, Date\r
  goal: 헤더 관리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    이메일 헤더는 메시지의 메타데이터를 담습니다. From은 발신자, To는 수신자, Subject는 제목, Date는 날짜를 나타냅니다. Cc(참조), Bcc(숨은 참조), Reply-To 등 다양한 헤더를 설정할 수 있습니다.\r
\r
    사용자 정의 헤더는 보통 'X-'로 시작합니다.\r
  snippet: |-\r
    from email.utils import formatdate\r
\r
    headerMsg = EmailMessage()\r
    headerMsg['From'] = 'admin@example.com'\r
    headerMsg['To'] = 'user@example.com'\r
    headerMsg['Subject'] = 'Important Notice'\r
    headerMsg['Date'] = formatdate(localtime=True)\r
\r
    headerMsg['Subject']\r
  exercise:\r
    prompt: 헤더 관리 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from email.utils import formatdate\r
\r
      headerMsg = EmailMessage()\r
      headerMsg['From'] = 'admin@example.com'\r
      headerMsg['To'] = 'user@example.com'\r
      headerMsg['Subject'] = 'Important Notice'\r
      headerMsg['Date'] = formatdate(localtime=True)\r
\r
      headerMsg['Subject']\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 헤더 관리에서 \`headerMsg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 헤더 관리 실행 뒤 \`headerMsg\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: attachments\r
  title: 첨부 파일\r
  structuredPrimary: true\r
  subtitle: add_attachment, get_content\r
  goal: 첨부 파일에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    첨부 파일은 이메일과 함께 전송되는 파일입니다. add_attachment()로 파일을 첨부하고, maintype과 subtype으로 파일 타입을 지정합니다. 텍스트, 이미지, PDF, ZIP 등 모든 형식의 파일을 첨부할 수 있습니다.\r
\r
    첨부 파일은 자동으로 Base64로 인코딩됩니다.\r
  snippet: |-\r
    attachMsg = EmailMessage()\r
    attachMsg['Subject'] = 'File Attached'\r
    attachMsg.set_content('Please see attached file.')\r
\r
    fileContent = 'This is a text file content.'\r
    attachMsg.add_attachment(\r
        fileContent.encode('utf-8'),\r
        maintype='text',\r
        subtype='plain',\r
        filename='document.txt'\r
    )\r
\r
    len(list(attachMsg.iter_attachments()))\r
  exercise:\r
    prompt: 첨부 파일 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      attachMsg = EmailMessage()\r
      attachMsg['Subject'] = 'File Attached'\r
      attachMsg.set_content('Please see attached file.')\r
\r
      fileContent = 'This is a text file content.'\r
      attachMsg.add_attachment(\r
          fileContent.encode('utf-8'),\r
          maintype='text',\r
          subtype='plain',\r
          filename='document.txt'\r
      )\r
\r
      len(list(attachMsg.iter_attachments()))\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 첨부 파일에서 \`attachMsg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 첨부 파일 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: parsing\r
  title: 이메일 파싱\r
  structuredPrimary: true\r
  subtitle: message_from_string, message_from_bytes\r
  goal: 이메일 파싱에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    이메일 파싱은 문자열이나 바이트에서 EmailMessage 객체를 생성합니다. message_from_string()은 문자열을, message_from_bytes()는 바이트를 파싱합니다. 수신한 이메일을 분석하고 헤더와 본문을 추출할 수 있습니다.\r
\r
    walk()는 메시지의 모든 파트를 재귀적으로 순회합니다.\r
  snippet: |-\r
    from email import message_from_string\r
\r
    emailStr = "From: sender@example.com\\nTo: receiver@example.com\\nSubject: Test Email\\n\\nThis is the email body."\r
\r
    parsedMsg = message_from_string(emailStr)\r
    parsedMsg['Subject']\r
  exercise:\r
    prompt: 이메일 파싱 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from email import message_from_string\r
\r
      emailStr = "From: sender@example.com\\nTo: receiver@example.com\\nSubject: Test Email\\n\\nThis is the email body."\r
\r
      parsedMsg = message_from_string(emailStr)\r
      parsedMsg['Subject']\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 이메일 파싱에서 \`emailStr\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 이메일 파싱 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: practical\r
  title: 실전 활용 예제\r
  structuredPrimary: true\r
  subtitle: 실무 이메일 처리\r
  goal: 실전 활용 예제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: email 모듈을 활용한 실전 이메일 처리 예제를 다룹니다. HTML 뉴스레터, 파일 첨부 이메일, 템플릿 메일 등 실무에서 자주 사용하는 패턴을 배웁니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def createNewsletter(recipient, subject, content):\r
        newsletter = MIMEMultipart('alternative')\r
        newsletter['From'] = 'newsletter@example.com'\r
        newsletter['To'] = recipient\r
        newsletter['Subject'] = subject\r
\r
        textPart = MIMEText(f"Newsletter: {content}", 'plain')\r
        htmlPart = MIMEText(f'<html><body><h1>{content}</h1></body></html>', 'html')\r
\r
        newsletter.attach(textPart)\r
        newsletter.attach(htmlPart)\r
\r
        return newsletter\r
\r
    newsMsg = createNewsletter('user@example.com', 'Weekly Update', 'Latest News')\r
    newsMsg['Subject']\r
  exercise:\r
    prompt: 실전 활용 예제 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def createNewsletter(recipient, subject, content):\r
          newsletter = MIMEMultipart('alternative')\r
          newsletter['From'] = 'newsletter@example.com'\r
          newsletter['To'] = recipient\r
          newsletter['Subject'] = subject\r
\r
          textPart = MIMEText(f"Newsletter: {content}", 'plain')\r
          htmlPart = MIMEText(f'<html><body><h1>{content}</h1></body></html>', 'html')\r
\r
          newsletter.attach(textPart)\r
          newsletter.attach(htmlPart)\r
\r
          return newsletter\r
\r
      newsMsg = createNewsletter('user@example.com', 'Weekly Update', 'Latest News')\r
      newsMsg['Subject']\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용 예제의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실전 활용 예제 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 발송 전 이메일 품질 게이트'\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증\r
  goal: '검증 루프: 발송 전 이메일 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    실무 이메일은 생성보다 발송 전 검증이 중요합니다. 필수 헤더, 수신자 주소, 첨부 파일 개수, 직렬화 후 재파싱을 한 번에 확인해야 실제 발송 단계에서 사고를 줄일 수 있습니다.\r
\r
    실무 변주: 수신자 도메인 allowlist, 첨부 파일 크기 제한, 제목 접두어 규칙을 추가해서 발송 전 품질 게이트를 팀 정책으로 확장해 보세요.\r
  snippet: |-\r
    from email import message_from_bytes\r
    from email.utils import parseaddr\r
\r
    def createReportEmail(sender, recipients, subject, body, attachmentBytes):\r
        msg = EmailMessage()\r
        msg['From'] = sender\r
        msg['To'] = ', '.join(recipients)\r
        msg['Subject'] = subject\r
        msg.set_content(body)\r
        msg.add_attachment(\r
            attachmentBytes,\r
            maintype='text',\r
            subtype='csv',\r
            filename='report.csv'\r
        )\r
        return msg\r
\r
    reportMsg = createReportEmail(\r
        'teacher@example.com',\r
        ['learner@example.com', 'reviewer@example.com'],\r
        'Curriculum Report',\r
        'All local checks passed.',\r
        b'id,status\\n1,passed\\n'\r
    )\r
\r
    assert reportMsg['Subject'] == 'Curriculum Report'\r
    assert len(list(reportMsg.iter_attachments())) == 1\r
    reportMsg['To']\r
  exercise:\r
    prompt: '검증 루프: 발송 전 이메일 품질 게이트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      from email import message_from_bytes\r
      from email.utils import parseaddr\r
\r
      def createReportEmail(sender, recipients, subject, body, attachmentBytes):\r
          msg = EmailMessage()\r
          msg['From'] = sender\r
          msg['To'] = ', '.join(recipients)\r
          msg['Subject'] = subject\r
          msg.set_content(body)\r
          msg.add_attachment(\r
              attachmentBytes,\r
              maintype='text',\r
              subtype='csv',\r
              filename='report.csv'\r
          )\r
          return msg\r
\r
      reportMsg = createReportEmail(\r
          'teacher@example.com',\r
          ['learner@example.com', 'reviewer@example.com'],\r
          'Curriculum Report',\r
          'All local checks passed.',\r
          b'id,status\\n1,passed\\n'\r
      )\r
\r
      assert reportMsg['Subject'] == 'Curriculum Report'\r
      assert len(list(reportMsg.iter_attachments())) == 1\r
      reportMsg['To']\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 발송 전 이메일 품질 게이트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: 발송 전 이메일 품질 게이트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: email 모듈 종합 복습\r
  structuredPrimary: true\r
  subtitle: 이메일 처리 마스터하기\r
  goal: email 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: email 모듈의 다양한 기능을 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    basicMsg = EmailMessage()\r
    basicMsg['Subject'] = 'Test'\r
    basicMsg['Subject']\r
  exercise:\r
    prompt: email 모듈 종합 복습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      basicMsg = EmailMessage()\r
      basicMsg['Subject'] = 'Test'\r
      basicMsg['Subject']\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:
    type: noError
    noError: email 모듈 종합 복습에서 \`basicMsg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: email 모듈 종합 복습 실행 뒤 \`basicMsg\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 22_email-report-message-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - workflow_validation
    title: 발송 전 리포트 이메일 구조 검증하기
    subtitle: EmailMessage와 attachment 검사
    goal: 수신자, 제목, 본문, CSV 첨부가 들어간 EmailMessage를 만들고 핵심 구조를 dict로 반환한다.
    why: 숙달 검증은 메일을 보내는 기능이 아니라, 보내기 전 메시지 구조가 안전한지 자동으로 판정하는 능력을 확인합니다.
    explanation: build_report_email(sender, recipients, subject, body, attachment_text)가 EmailMessage를 만들고 header, body, attachment 정보를 반환하게 완성하세요.
    tips:
    - 수신자 목록이 비어 있으면 ValueError로 막으세요.
    - 첨부는 bytes로 넣고 get_filename과 get_content_type으로 검증하세요.
    exercise:
      prompt: build_report_email(sender, recipients, subject, body, attachment_text)를 완성해 이메일 구조 요약을 반환하고 빈 수신자 목록은 거부하세요.
      starterCode: |-
        def build_report_email(sender, recipients, subject, body, attachment_text):
            raise NotImplementedError
      solution: |-
        from email.message import EmailMessage

        def build_report_email(sender, recipients, subject, body, attachment_text):
            if not recipients:
                raise ValueError("at least one recipient required")
            msg = EmailMessage()
            msg["From"] = sender
            msg["To"] = ", ".join(recipients)
            msg["Subject"] = subject
            msg.set_content(body)
            msg.add_attachment(
                attachment_text.encode("utf-8"),
                maintype="text",
                subtype="csv",
                filename="report.csv",
            )
            attachments = list(msg.iter_attachments())
            return {
                "from": msg["From"],
                "to": [address.strip() for address in msg["To"].split(",")],
                "subject": msg["Subject"],
                "body": msg.get_body(preferencelist=("plain",)).get_content().strip(),
                "attachmentCount": len(attachments),
                "attachmentFilename": attachments[0].get_filename(),
                "attachmentContentType": attachments[0].get_content_type(),
            }
      hints:
      - EmailMessage는 header를 dict처럼 읽고 쓸 수 있습니다.
      - "\`iter_attachments()\` 결과를 list로 바꿔 첨부 개수를 확인하세요."
    check:
      id: python.builtins.email.report-message.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.email.empty.behavior.v1.fixture
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
        entry: build_report_email
        cases:
        - id: builds-report-email
          arguments:
          - value: teacher@example.com
          - value:
            - learner@example.com
            - reviewer@example.com
          - value: Weekly curriculum report
          - value: All checks passed.
          - value: |-
              id,status
              1,passed
          expectedReturn:
            from: teacher@example.com
            to:
            - learner@example.com
            - reviewer@example.com
            subject: Weekly curriculum report
            body: All checks passed.
            attachmentCount: 1
            attachmentFilename: report.csv
            attachmentContentType: text/csv
        - id: rejects-empty-recipients
          arguments:
          - value: teacher@example.com
          - value: []
          - value: Weekly curriculum report
          - value: All checks passed.
          - value: id,status
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 22_email-parse-raw-message-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - message_basics
    - headers
    title: 직렬화된 MIME 메시지를 읽어 수신자와 본문 요약하기
    subtitle: Parser와 getaddresses
    goal: raw email 문자열을 파싱해 제목, 발신자, 수신자 목록, plain body, multipart 여부를 반환한다.
    why: 전이 과제에서는 메시지를 만드는 문제에서 이미 만들어진 MIME 메시지를 검사하는 문제로 옮깁니다.
    explanation: summarize_mime_message(raw_message)가 header와 본문을 표준 parser로 읽고, 수신자 주소를 list로 정리하게 만드세요.
    tips:
    - Parser(policy=policy.default).parsestr(...)를 사용하세요.
    - To 헤더는 getaddresses로 이름과 주소를 분리할 수 있습니다.
    exercise:
      prompt: summarize_mime_message(raw_message)를 완성해 raw email 문자열에서 subject, from, recipients, body, isMultipart를 반환하세요.
      starterCode: |-
        def summarize_mime_message(raw_message):
            raise NotImplementedError
      solution: |-
        from email import policy
        from email.parser import Parser
        from email.utils import getaddresses

        def summarize_mime_message(raw_message):
            msg = Parser(policy=policy.default).parsestr(raw_message)
            recipients = [addr for _name, addr in getaddresses(msg.get_all("to", []))]
            body = msg.get_body(preferencelist=("plain",))
            return {
                "subject": msg["Subject"],
                "from": msg["From"],
                "recipients": recipients,
                "body": body.get_content().strip() if body else "",
                "isMultipart": msg.is_multipart(),
            }
      hints:
      - header 이름은 대소문자를 섞어 써도 표준 메시지 객체가 찾아줍니다.
      - body가 없을 수 있으므로 None 경로를 처리하세요.
    check:
      id: python.builtins.email.raw-message.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.email.empty.behavior.v1.fixture
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
        entry: summarize_mime_message
        cases:
        - id: parses-plain-review-message
          arguments:
          - value: |-
              From: Teacher <teacher@example.com>
              To: Learner <learner@example.com>, Reviewer <reviewer@example.com>
              Subject: Review ready
              Content-Type: text/plain; charset="utf-8"

              Please review lesson 22.
          expectedReturn:
            subject: Review ready
            from: Teacher <teacher@example.com>
            recipients:
            - learner@example.com
            - reviewer@example.com
            body: Please review lesson 22.
            isMultipart: false
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 22_email-header-validation-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - headers
    - practice
    title: 발송 헤더에서 필수 값과 수신자 주소 회상 검증하기
    subtitle: getaddresses와 누락 거부
    goal: From, To, Subject를 확인하고 수신자 주소 수와 Reply-To 여부를 반환한다.
    why: 시간이 지나도 남아야 할 email 감각은 메시지를 보내기 전에 필수 헤더와 주소를 자동으로 막는 검증 습관입니다.
    explanation: validate_outbound_headers(headers)가 필수 헤더와 수신자 주소를 검사하고, 누락이나 잘못된 주소는 ValueError로 거부하게 만드세요.
    tips:
    - getaddresses는 이름이 섞인 To 헤더에서도 실제 주소를 뽑아 줍니다.
    - Subject는 strip해서 빈 문자열을 막는 조건으로 확장할 수 있습니다.
    exercise:
      prompt: validate_outbound_headers(headers)를 완성해 sender, recipientCount, subject, hasReplyTo를 반환하고 필수 헤더 누락은 거부하세요.
      starterCode: |-
        def validate_outbound_headers(headers):
            raise NotImplementedError
      solution: |-
        from email.utils import getaddresses

        def validate_outbound_headers(headers):
            required = ("From", "To", "Subject")
            missing = [name for name in required if not headers.get(name)]
            if missing:
                raise ValueError("missing headers: " + ",".join(missing))
            recipients = [addr for _name, addr in getaddresses([headers["To"]])]
            if not recipients or any("@" not in addr for addr in recipients):
                raise ValueError("invalid recipients")
            return {
                "sender": headers["From"],
                "recipientCount": len(recipients),
                "subject": headers["Subject"].strip(),
                "hasReplyTo": bool(headers.get("Reply-To")),
            }
      hints:
      - headers dict에 키가 없을 수 있으므로 get을 먼저 사용하세요.
      - 주소 검증은 최소한 \`@\`가 있는지 확인하고 실패를 조용히 넘기지 마세요.
    check:
      id: python.builtins.email.header-validation.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.email.empty.behavior.v1.fixture
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
        entry: validate_outbound_headers
        cases:
        - id: validates-reply-to-header
          arguments:
          - value:
              From: ops@example.com
              To: A <a@example.com>, b@example.com
              Subject: Deploy report
              Reply-To: support@example.com
          expectedReturn:
            sender: ops@example.com
            recipientCount: 2
            subject: Deploy report
            hasReplyTo: true
        - id: rejects-missing-subject
          arguments:
          - value:
              From: ops@example.com
              To: a@example.com
          expectedException: ValueError
        - id: rejects-invalid-recipient
          arguments:
          - value:
              From: ops@example.com
              To: not-an-address
              Subject: Deploy report
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};