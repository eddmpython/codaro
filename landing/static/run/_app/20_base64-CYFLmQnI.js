var e=`meta:\r
  id: 20_base64\r
  title: base64 - Base64 인코딩\r
  category: builtins\r
  tags:\r
  - base64\r
  - b64encode\r
  - b64decode\r
  - urlsafe\r
  - encoding\r
  description: 바이너리 데이터를 ASCII 문자열로 인코딩하는 base64 모듈\r
  keywords:\r
  - base64\r
  - b64encode\r
  - b64decode\r
  - urlsafe\r
  - encoding\r
intro:\r
  direction: base64 Base64 인코딩에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - base64 Base64 인코딩 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: base64 모듈 임포트 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 표준 Base64 인코딩 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: URL 안전 Base64 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: base64 Base64 인코 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: base64 Base64 인코 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: base64 Base64 인코 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- title: ⚠️ base64 모듈 임포트\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: ⚠️ base64 모듈 임포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    표준 라이브러리 임포트\r
    base64는 Python 표준 라이브러리이므로 별도 설치 없이 사용할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import base64\r
    import binascii\r
  exercise:\r
    prompt: ⚠️ base64 모듈 임포트 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import base64\r
      import binascii\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: ⚠️ base64 모듈 임포트의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: ⚠️ base64 모듈 임포트 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.\r
  name: module_import\r
- title: 표준 Base64 인코딩\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 표준 Base64 인코딩에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    b64encode와 b64decode\r
    표준 Base64 인코딩은 바이너리 데이터를 64개의 ASCII 문자로 표현합니다.\r
\r
    바이트 변환\r
    base64는 bytes 객체를 입력받고 bytes를 반환합니다.\r
  tips:\r
  - 바이트 변환 base64는 bytes 객체를 입력받고 bytes를 반환합니다.\r
  snippet: |-\r
    message = "Hello World"\r
    messageBytes = message.encode('utf-8')\r
    encodedBytes = base64.b64encode(messageBytes)\r
    encodedStr = encodedBytes.decode('utf-8')\r
    encodedStr\r
  exercise:\r
    prompt: 표준 Base64 인코딩 예제에서 \`message\`, \`messageBytes\`, \`encodedBytes\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      message = "Hello World"\r
      messageBytes = message.encode('utf-8')\r
      encodedBytes = base64.b64encode(messageBytes)\r
      encodedStr = encodedBytes.decode('utf-8')\r
      encodedStr\r
    hints:\r
    - 바꿀 지점은 \`message = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`message\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 표준 Base64 인코딩에서 \`message\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 표준 Base64 인코딩 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
  name: standard_base64\r
- title: URL 안전 Base64\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: URL 안전 Base64에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    urlsafe_b64encode와 urlsafe_b64decode\r
    URL 안전 Base64는 +와 /를 -와 _로 대체하여 URL에 안전하게 사용할 수 있습니다.\r
\r
    URL 파라미터\r
    URL 파라미터나 쿼리 스트링에 인코딩된 데이터를 포함할 때 유용합니다.\r
  tips:\r
  - URL 파라미터 URL 파라미터나 쿼리 스트링에 인코딩된 데이터를 포함할 때 유용합니다.\r
  snippet: |-\r
    data = "subject=test&value=123"\r
    dataBytes = data.encode('utf-8')\r
\r
    standardEncoded = base64.b64encode(dataBytes).decode('utf-8')\r
    urlsafeEncoded = base64.urlsafe_b64encode(dataBytes).decode('utf-8')\r
\r
    {\r
        "standard": standardEncoded,\r
        "urlsafe": urlsafeEncoded\r
    }\r
  exercise:\r
    prompt: URL 안전 Base64 예제에서 \`data\`, \`dataBytes\`, \`standardEncoded\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      data = "subject=test&value=123"\r
      dataBytes = data.encode('utf-8')\r
\r
      standardEncoded = base64.b64encode(dataBytes).decode('utf-8')\r
      urlsafeEncoded = base64.urlsafe_b64encode(dataBytes).decode('utf-8')\r
\r
      {\r
          "standard": standardEncoded,\r
          "urlsafe": urlsafeEncoded\r
      }\r
    hints:\r
    - 바꿀 지점은 \`data = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`data\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: URL 안전 Base64에서 \`data\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: URL 안전 Base64 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
  name: urlsafe_base64\r
- title: 기타 인코딩 방식\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 기타 인코딩 방식에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Base32와 Base16\r
    Base32는 32개 문자를 사용하고, Base16은 16개 문자(hex)를 사용합니다.\r
\r
    Base32 특징\r
    대소문자 구분 없이 사용할 수 있어 사용자 입력에 유용합니다.\r
  tips:\r
  - Base32 특징 대소문자 구분 없이 사용할 수 있어 사용자 입력에 유용합니다.\r
  snippet: |-\r
    data = "Hello"\r
    encoded = base64.b32encode(data.encode('utf-8'))\r
    decoded = base64.b32decode(encoded)\r
\r
    {\r
        "original": data,\r
        "encoded": encoded.decode('utf-8'),\r
        "decoded": decoded.decode('utf-8')\r
    }\r
  exercise:\r
    prompt: 기타 인코딩 방식 예제에서 \`data\`, \`encoded\`, \`decoded\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      data = "Hello"\r
      encoded = base64.b32encode(data.encode('utf-8'))\r
      decoded = base64.b32decode(encoded)\r
\r
      {\r
          "original": data,\r
          "encoded": encoded.decode('utf-8'),\r
          "decoded": decoded.decode('utf-8')\r
      }\r
    hints:\r
    - 바꿀 지점은 \`data = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`data\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기타 인코딩 방식에서 \`data\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 기타 인코딩 방식 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
  name: other_encodings\r
- title: ASCII85와 Base85\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: ASCII85와 Base85에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    고효율 인코딩\r
    ASCII85와 Base85는 Base64보다 효율적인 인코딩 방식입니다.\r
\r
    ASCII85 사용처\r
    PostScript와 PDF 파일에서 주로 사용됩니다.\r
  tips:\r
  - ASCII85 사용처 PostScript와 PDF 파일에서 주로 사용됩니다.\r
  snippet: |-\r
    data = "Hello World"\r
    encoded = base64.a85encode(data.encode('utf-8'))\r
    decoded = base64.a85decode(encoded)\r
\r
    {\r
        "original": data,\r
        "encoded": encoded.decode('utf-8'),\r
        "decoded": decoded.decode('utf-8')\r
    }\r
  exercise:\r
    prompt: ASCII85와 Base85 예제에서 \`data\`, \`encoded\`, \`decoded\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      data = "Hello World"\r
      encoded = base64.a85encode(data.encode('utf-8'))\r
      decoded = base64.a85decode(encoded)\r
\r
      {\r
          "original": data,\r
          "encoded": encoded.decode('utf-8'),\r
          "decoded": decoded.decode('utf-8')\r
      }\r
    hints:\r
    - 바꿀 지점은 \`data = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`data\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: ASCII85와 Base85에서 \`data\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: ASCII85와 Base85 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
  name: ascii85_base85\r
- title: 인코딩 옵션\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 인코딩 옵션에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    고급 옵션\r
    인코딩 함수는 다양한 옵션을 제공하여 동작을 세밀하게 제어할 수 있습니다.\r
\r
    altchars 용도\r
    특정 환경에 맞는 문자 세트를 사용할 수 있습니다.\r
  tips:\r
  - altchars 용도 특정 환경에 맞는 문자 세트를 사용할 수 있습니다.\r
  snippet: |-\r
    data = b"test data"\r
\r
    standard = base64.b64encode(data)\r
    customChars = base64.b64encode(data, altchars=b'-_')\r
\r
    {\r
        "standard": standard.decode('utf-8'),\r
        "custom": customChars.decode('utf-8')\r
    }\r
  exercise:\r
    prompt: 인코딩 옵션 예제에서 \`data\`, \`standard\`, \`customChars\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      data = b"test data"\r
\r
      standard = base64.b64encode(data)\r
      customChars = base64.b64encode(data, altchars=b'-_')\r
\r
      {\r
          "standard": standard.decode('utf-8'),\r
          "custom": customChars.decode('utf-8')\r
      }\r
    hints:\r
    - 바꿀 지점은 \`data = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`data\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 인코딩 옵션에서 \`data\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 인코딩 옵션 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
  name: encoding_options\r
- title: 실전 활용 예제\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: base64.b64encode로 바이너리 데이터를 텍스트로 인코딩하고 b64decode로 왕복해 원본과 비트 단위로 같은지 확인하는 실전 시나리오를 만듭니다.\r
  why: 이메일 첨부, JSON 안의 이진 데이터, JWT 페이로드 등 텍스트 채널로 바이너리를 옮기는 모든 곳에서 base64가 쓰입니다. 왕복이 정확히 동일한지 검증해야 데이터 손상이 없습니다.\r
  explanation: |-\r
    실무 시나리오\r
    base64를 활용한 실전 데이터 인코딩 예제를 다룹니다.\r
\r
    보안 주의\r
    실제 인증에는 서명이나 암호화가 추가로 필요합니다.\r
  tips:\r
  - 보안 주의 실제 인증에는 서명이나 암호화가 추가로 필요합니다.\r
  snippet: |-\r
    def createDataUrl(imageBytes, mimeType="image/png"):\r
        encoded = base64.b64encode(imageBytes).decode('utf-8')\r
        dataUrl = f"data:{mimeType};base64,{encoded}"\r
        return dataUrl\r
\r
    sampleImageData = bytes([137, 80, 78, 71, 13, 10, 26, 10])\r
    dataUrl = createDataUrl(sampleImageData)\r
\r
    {\r
        "data_url_length": len(dataUrl),\r
        "preview": dataUrl[:50] + "..."\r
    }\r
  exercise:\r
    prompt: 실전 활용 예제 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def createDataUrl(imageBytes, mimeType="image/png"):\r
          encoded = base64.b64encode(imageBytes).decode('utf-8')\r
          dataUrl = f"data:{mimeType};base64,{encoded}"\r
          return dataUrl\r
\r
      sampleImageData = bytes([137, 80, 78, 71, 13, 10, 26, 10])\r
      dataUrl = createDataUrl(sampleImageData)\r
\r
      {\r
          "data_url_length": len(dataUrl),\r
          "preview": dataUrl[:50] + "..."\r
      }\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용 예제의 입력 데이터와 처리 인자가 다음 단계까지 도달해야 합니다.\r
    resultCheck: 실전 활용 예제 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
  name: practical\r
- title: '검증 루프: 안전한 텍스트 전송 페이로드'\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: '검증 루프: 안전한 텍스트 전송 페이로드에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    인코딩은 무결성 검증과 함께\r
    Base64는 암호화가 아니라 전송 형식입니다. 따라서 원본 복원, 유효성 검사, 패딩 복구, 크기 증가를 함께 확인해야 실무에서 안전하게 사용할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import json\r
\r
    payload = {\r
        "lesson": "base64",\r
        "status": "verified",\r
        "scores": [95, 88, 91]\r
    }\r
\r
    def encodePayload(data):\r
        raw = json.dumps(data, ensure_ascii=False, sort_keys=True).encode("utf-8")\r
        encoded = base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")\r
        return encoded\r
\r
    def decodePayload(encoded):\r
        padding = (-len(encoded)) % 4\r
        restored = encoded + ("=" * padding)\r
        raw = base64.urlsafe_b64decode(restored.encode("ascii"))\r
        return json.loads(raw.decode("utf-8"))\r
\r
    encodedPayload = encodePayload(payload)\r
    decodedPayload = decodePayload(encodedPayload)\r
    assert decodedPayload == payload\r
    encodedPayload\r
  exercise:\r
    prompt: '검증 루프: 안전한 텍스트 전송 페이로드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      import json\r
\r
      payload = {\r
          "lesson": "base64",\r
          "status": "verified",\r
          "scores": [95, 88, 91]\r
      }\r
\r
      def encodePayload(data):\r
          raw = json.dumps(data, ensure_ascii=False, sort_keys=True).encode("utf-8")\r
          encoded = base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")\r
          return encoded\r
\r
      def decodePayload(encoded):\r
          padding = (-len(encoded)) % 4\r
          restored = encoded + ("=" * padding)\r
          raw = base64.urlsafe_b64decode(restored.encode("ascii"))\r
          return json.loads(raw.decode("utf-8"))\r
\r
      encodedPayload = encodePayload(payload)\r
      decodedPayload = decodePayload(encodedPayload)\r
      assert decodedPayload == payload\r
      encodedPayload\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 안전한 텍스트 전송 페이로드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: 안전한 텍스트 전송 페이로드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
  name: workflow_validation\r
- title: 연습 문제\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 연습 문제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 연습 문제의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    text = "Hello Python"\r
    encoded = base64.b64encode(text.encode('utf-8')).decode('utf-8')\r
    encoded\r
  exercise:\r
    prompt: 연습 문제 예제에서 \`text\`, \`encoded\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      text = "Hello Python"\r
      encoded = base64.b64encode(text.encode('utf-8')).decode('utf-8')\r
      encoded\r
    hints:\r
    - 바꿀 지점은 \`text = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`text\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:
    type: noError
    noError: 연습 문제에서 \`text\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 연습 문제 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
  name: practice
assessment:
  masteryVariants:
  - id: 20_base64-data-url-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - standard_base64
    - practical
    - workflow_validation
    title: 바이너리 파일을 data URL로 만들고 왕복 검증하기
    subtitle: b64encode와 strict decode
    goal: 이미지 bytes를 Base64 data URL로 만들고 decode 결과가 원본 bytes와 같은지 반환한다.
    why: base64 학습은 문자열 인코딩을 보는 데서 끝나지 않고, 텍스트 채널로 옮긴 바이너리가 손상 없이 복원되는지 검증할 때 실무 가치가 생깁니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않는 binary fixture 파일을 넘겨 data URL과 왕복 검증을 함께 확인합니다.
    tips:
    - 파일은 read_bytes로 읽고 b64encode 결과는 ascii 문자열로 바꾸세요.
    - 검증 decode에는 validate=True를 사용하세요.
    exercise:
      prompt: create_data_url_summary(path, mime_type='image/png')가 dataUrl, mimeType, byteLength, decodedMatches를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def create_data_url_summary(path, mime_type="image/png"):
            raise NotImplementedError
      solution: |-
        import base64
        from pathlib import Path

        def create_data_url_summary(path, mime_type="image/png"):
            raw = Path(path).read_bytes()
            encoded = base64.b64encode(raw).decode("ascii")
            data_url = f"data:{mime_type};base64,{encoded}"
            restored = base64.b64decode(encoded.encode("ascii"), validate=True)
            return {
                "dataUrl": data_url,
                "mimeType": mime_type,
                "byteLength": len(raw),
                "decodedMatches": restored == raw,
            }
      hints:
      - data URL은 \`data:{mime_type};base64,{encoded}\` 형식입니다.
      - encoded 문자열을 다시 decode해 원본 bytes와 비교하세요.
    check:
      id: python.builtins.base64.data-url.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.base64.payload.behavior.v1.fixture
      fixtureHash: sha256-QhxVZYje40b77PdWWmQBwfDikvD1zzNcQ+YHXm8tE/I=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/sample.png
          contentBase64: iVBORw0KGgo=
        stdin: []
      packageAssets: []
      payload:
        entry: create_data_url_summary
        cases:
        - id: creates-png-data-url
          arguments:
          - fixturePath: input/sample.png
          - value: image/png
          expectedReturn:
            dataUrl: data:image/png;base64,iVBORw0KGgo=
            mimeType: image/png
            byteLength: 8
            decodedMatches: true
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 20_base64-url-token-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 20_base64-data-url-mastery
    - urlsafe_base64
    title: URL-safe JSON token을 패딩 없이 만들고 복원하기
    subtitle: urlsafe_b64encode와 padding 복구
    goal: JSON payload를 정렬된 bytes로 만들고 padding 없는 URL-safe Base64 token으로 인코딩한 뒤 복원 결과를 반환한다.
    why: 전이 과제에서는 이미지 data URL이 아니라 쿼리 문자열·토큰 전달 문제로 옮겨, padding 복구와 JSON 왕복을 함께 다룹니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. padding을 제거해 반환하되 decode할 때는 길이에 맞게 복구하세요.
    tips:
    - json.dumps에는 sort_keys=True와 separators를 써서 bytes를 안정화하세요.
    - padding 길이는 \`(-len(token)) % 4\`로 계산할 수 있습니다.
    exercise:
      prompt: encode_payload_token(data)가 token, paddingLength, restored, rawByteLength를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def encode_payload_token(data):
            raise NotImplementedError
      solution: |-
        import base64
        import json

        def encode_payload_token(data):
            raw = json.dumps(
                data,
                ensure_ascii=False,
                sort_keys=True,
                separators=(",", ":"),
            ).encode("utf-8")
            token = base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")
            padding = (-len(token)) % 4
            restored_raw = base64.urlsafe_b64decode((token + "=" * padding).encode("ascii"))
            return {
                "token": token,
                "paddingLength": padding,
                "restored": json.loads(restored_raw.decode("utf-8")),
                "rawByteLength": len(raw),
            }
      hints:
      - URL-safe token에서는 \`+\`, \`/\` 대신 \`-\`, \`_\`가 쓰입니다.
      - decode 전에 필요한 \`=\` padding을 다시 붙이세요.
    check:
      id: python.builtins.base64.url-token.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.base64.payload.behavior.v1.fixture
      fixtureHash: sha256-QhxVZYje40b77PdWWmQBwfDikvD1zzNcQ+YHXm8tE/I=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/sample.png
          contentBase64: iVBORw0KGgo=
        stdin: []
      packageAssets: []
      payload:
        entry: encode_payload_token
        cases:
        - id: encodes-json-token
          arguments:
          - value:
              lesson: base64
              status: verified
              scores:
              - 95
              - 88
              - 91
          expectedReturn:
            token: eyJsZXNzb24iOiJiYXNlNjQiLCJzY29yZXMiOls5NSw4OCw5MV0sInN0YXR1cyI6InZlcmlmaWVkIn0
            paddingLength: 1
            restored:
              lesson: base64
              scores:
              - 95
              - 88
              - 91
              status: verified
            rawByteLength: 59
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 20_base64-strict-decode-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 20_base64-data-url-mastery
    - standard_base64
    title: Base64 문자열을 엄격하게 복원하고 fingerprint 확인하기
    subtitle: validate=True와 오류 변환
    goal: encoded 문자열을 bytes로 복원해 byteLength, text, sha256 prefix를 반환하고 잘못된 문자는 ValueError로 거부한다.
    why: 시간이 지나도 base64에서 남아야 할 감각은 인코딩 결과보다, 손상된 입력을 조용히 통과시키지 않는 strict decode 습관입니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 이번에는 fixture 파일이 아니라 encoded 문자열 자체를 검증하세요.
    tips:
    - 표준 Base64 decode에는 validate=True를 쓰세요.
    - binascii.Error를 ValueError로 감싸면 호출자가 실패 경로를 단순하게 다룰 수 있습니다.
    exercise:
      prompt: inspect_base64_blob(encoded)가 byteLength, text, sha256을 담은 dict를 반환하고 invalid payload는 ValueError로 막도록 완성하세요.
      starterCode: |-
        def inspect_base64_blob(encoded):
            raise NotImplementedError
      solution: |-
        import base64
        import binascii
        import hashlib

        def inspect_base64_blob(encoded):
            try:
                raw = base64.b64decode(encoded.encode("ascii"), validate=True)
            except (binascii.Error, ValueError) as exc:
                raise ValueError("invalid base64 payload") from exc
            return {
                "byteLength": len(raw),
                "text": raw.decode("utf-8"),
                "sha256": hashlib.sha256(raw).hexdigest()[:16],
            }
      hints:
      - encoded 입력은 ascii로 바꾼 뒤 decode하세요.
      - hash 전체가 아니라 앞 16자리만 반환해도 fingerprint 비교에 충분합니다.
    check:
      id: python.builtins.base64.strict-decode.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.base64.payload.behavior.v1.fixture
      fixtureHash: sha256-QhxVZYje40b77PdWWmQBwfDikvD1zzNcQ+YHXm8tE/I=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/sample.png
          contentBase64: iVBORw0KGgo=
        stdin: []
      packageAssets: []
      payload:
        entry: inspect_base64_blob
        cases:
        - id: decodes-valid-text
          arguments:
          - value: SGVsbG8gUHl0aG9u
          expectedReturn:
            byteLength: 12
            text: Hello Python
            sha256: d20d392094845f2d
        - id: rejects-invalid-base64
          arguments:
          - value: SGVsbG8*
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};