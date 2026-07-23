var e=`meta:\r
  id: 16_struct\r
  title: struct - 바이너리 데이터\r
  category: builtins\r
  tags:\r
  - struct\r
  - 바이너리\r
  - pack\r
  - unpack\r
  seo:\r
    title: 파이썬 struct 모듈 완전 정복\r
    description: struct 모듈로 바이너리 데이터 pack/unpack, 포맷 문자열을 배웁니다.\r
    keywords:\r
    - struct\r
    - 바이너리\r
    - pack\r
    - unpack\r
    - 포맷\r
    - 파이썬struct\r
intro:\r
  emoji: 🔢\r
  points:\r
  - 바이너리 데이터 변환\r
  - pack/unpack 사용법\r
  - 포맷 문자열 이해\r
  - 파일 포맷과 프로토콜 처리\r
  direction: struct 바이너리 데이터에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - struct 바이너리 데이터 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: struct 모듈 불러오기 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 바이너리로 변환 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 바이너리 읽기 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: struct 바이너리 데이터 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: struct 바이너리 데이터 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: struct 바이너리 데이터 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: struct 모듈 불러오기\r
  structuredPrimary: true\r
  subtitle: ⚠️ 가장 먼저 실행하세요\r
  goal: struct 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    struct는 파이썬 표준 라이브러리입니다. Python 값과 C 구조체 형태의 바이너리 데이터 간 변환을 제공하는 모듈입니다. 별도 설치 없이 import만으로 사용할 수 있습니다.\r
\r
    이 섹션을 먼저 실행하면 아래 모든 예제에서 struct 모듈을 사용할 수 있습니다.\r
  snippet: |-\r
    import struct\r
    import tempfile\r
    from pathlib import Path\r
\r
    structScratch = Path(tempfile.gettempdir()) / 'codaro_struct_scratch'\r
    structScratch.mkdir(parents=True, exist_ok=True)\r
\r
    'struct 모듈이 정상적으로 로드되었습니다'\r
  exercise:\r
    prompt: struct 모듈 불러오기 예제에서 \`structScratch\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import struct\r
      import tempfile\r
      from pathlib import Path\r
\r
      structScratch = Path(tempfile.gettempdir()) / 'codaro_struct_scratch'\r
      structScratch.mkdir(parents=True, exist_ok=True)\r
\r
      'struct 모듈이 정상적으로 로드되었습니다'\r
    hints:\r
    - 바꿀 지점은 \`structScratch = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`structScratch\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: struct 모듈 불러오기에서 \`structScratch\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: struct 모듈 불러오기 실행 뒤 \`structScratch\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: basic_packing\r
  title: 바이너리로 변환\r
  structuredPrimary: true\r
  subtitle: pack으로 인코딩\r
  goal: 바이너리로 변환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    struct.pack()은 Python 값을 바이너리 데이터로 변환합니다. 포맷 문자열로 데이터 타입과 순서를 지정하면 C 구조체처럼 메모리에 바이트로 배치됩니다. 네트워크 프로토콜, 바이너리 파일 포맷, 임베디드 시스템 통신에 필수적입니다.\r
\r
    포맷 문자: i=정수(4바이트), f=float(4바이트), d=double(8바이트), c=문자(1바이트)\r
  snippet: |-\r
    numberValue = 42\r
    packedInt = struct.pack('i', numberValue)\r
    packedInt\r
  exercise:\r
    prompt: 바이너리로 변환 예제에서 \`numberValue\`, \`packedInt\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      numberValue = 42\r
      packedInt = struct.pack('i', numberValue)\r
      packedInt\r
    hints:\r
    - 바꿀 지점은 \`numberValue = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`numberValue\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 바이너리로 변환에서 \`numberValue\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 바이너리로 변환 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: basic_unpacking\r
  title: 바이너리 읽기\r
  structuredPrimary: true\r
  subtitle: unpack으로 디코딩\r
  goal: 바이너리 읽기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    struct.unpack()은 바이너리 데이터를 Python 값으로 변환합니다. pack()과 동일한 포맷 문자열을 사용하여 바이트를 해석하고 튜플로 반환합니다. 바이너리 파일 읽기, 네트워크 패킷 파싱, 프로토콜 디코딩에 활용됩니다.\r
\r
    unpack()은 항상 튜플을 반환하므로 단일 값도 [0]으로 접근해야 합니다.\r
  snippet: |-\r
    binaryData = struct.pack('i', 100)\r
    unpackedInt = struct.unpack('i', binaryData)\r
    unpackedInt[0]\r
  exercise:\r
    prompt: 바이너리 읽기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      binaryData = struct.pack('i', 100)\r
      unpackedInt = struct.unpack('i', binaryData)\r
      unpackedInt[0]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 바이너리 읽기에서 \`binaryData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 바이너리 읽기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: format_strings\r
  title: 포맷 문자열\r
  structuredPrimary: true\r
  subtitle: 데이터 타입 지정\r
  goal: 포맷 문자열에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    포맷 문자열은 데이터의 타입, 크기, 순서를 지정합니다. c는 1바이트 문자, h는 2바이트 정수, i는 4바이트 정수, f는 4바이트 실수입니다. 반복 횟수를 숫자로 지정할 수 있으며, 다양한 타입을 조합하여 복잡한 구조체를 표현합니다.\r
\r
    포맷과 실제 데이터 개수가 일치하지 않으면 에러가 발생합니다.\r
  snippet: |-\r
    mixedData = struct.pack('cif', b'A', 42, 3.14)\r
    len(mixedData)\r
  exercise:\r
    prompt: 포맷 문자열 예제에서 \`mixedData\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      mixedData = struct.pack('cif', b'A', 42, 3.14)\r
      len(mixedData)\r
    hints:\r
    - 바꿀 지점은 \`mixedData = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`mixedData\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 포맷 문자열에서 \`mixedData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 포맷 문자열 실행 뒤 \`mixedData\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: byte_order\r
  title: 바이트 순서\r
  structuredPrimary: true\r
  subtitle: 엔디안 지정\r
  goal: 바이트 순서에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    바이트 순서는 다중 바이트 값을 메모리에 저장하는 방식입니다. 네이티브(@), 리틀엔디안(<), 빅엔디안(>)을 포맷 앞에 지정할 수 있습니다. 네트워크 프로토콜은 보통 빅엔디안을 사용하며, Intel CPU는 리틀엔디안입니다.\r
\r
    네트워크 통신에는 '>' 또는 '!'를 사용하여 플랫폼에 관계없이 일관된 바이트 순서를 유지하세요.\r
  snippet: |-\r
    nativeBytes = struct.pack('@i', 1000)\r
    nativeBytes\r
  exercise:\r
    prompt: 바이트 순서 예제에서 \`nativeBytes\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      nativeBytes = struct.pack('@i', 1000)\r
      nativeBytes\r
    hints:\r
    - 바꿀 지점은 \`nativeBytes = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`nativeBytes\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 바이트 순서에서 \`nativeBytes\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 바이트 순서 실행 뒤 \`nativeBytes\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: advanced_formats\r
  title: 고급 포맷\r
  structuredPrimary: true\r
  subtitle: 문자열과 패딩\r
  goal: 고급 포맷에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    struct는 고정 길이 문자열과 패딩을 지원합니다. s는 고정 길이 문자열, x는 패딩 바이트를 나타냅니다. 바이너리 파일 헤더나 고정 크기 레코드를 다룰 때 유용하며, 메모리 정렬을 맞추는 데도 사용됩니다.\r
\r
    문자열은 바이트 객체여야 하며, 길이가 부족하면 null 바이트로 채워집니다.\r
  snippet: |-\r
    textBytes = struct.pack('10s', b'Hello')\r
    textBytes\r
  exercise:\r
    prompt: 고급 포맷 예제에서 \`textBytes\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      textBytes = struct.pack('10s', b'Hello')\r
      textBytes\r
    hints:\r
    - 바꿀 지점은 \`textBytes = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`textBytes\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 고급 포맷에서 \`textBytes\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 고급 포맷 실행 뒤 \`textBytes\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: practical\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: 파일 헤더와 프로토콜\r
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    실무에서 자주 사용하는 struct 활용 패턴을 살펴봅니다. 바이너리 파일 헤더 읽기/쓰기, 네트워크 프로토콜 구현, 센서 데이터 파싱 등 다양한 시나리오에서 struct를 효과적으로 사용할 수 있습니다.\r
\r
    바이너리 파일을 읽을 때는 정확한 포맷을 알아야 하므로, 파일 형식 문서를 잘 관리하세요.\r
  snippet: |-\r
    magicNumber = 0x12345678\r
    version = 1\r
    dataSize = 1024\r
    headerBytes = struct.pack('>III', magicNumber, version, dataSize)\r
    len(headerBytes)\r
  exercise:\r
    prompt: 실전 활용 예제에서 \`magicNumber\`, \`version\`, \`dataSize\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      magicNumber = 0x12345678\r
      version = 1\r
      dataSize = 1024\r
      headerBytes = struct.pack('>III', magicNumber, version, dataSize)\r
      len(headerBytes)\r
    hints:\r
    - 바꿀 지점은 \`magicNumber = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`magicNumber\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용에서 \`magicNumber\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실전 활용 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 바이너리 레코드 품질 게이트'\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증\r
  goal: '검증 루프: 바이너리 레코드 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: struct는 바이트 길이와 엔디안이 하나만 어긋나도 데이터를 잘못 해석합니다. 여기서는 센서 패킷 포맷을 미리 정의하고, 잘린 패킷과 잘못된 매직 넘버를\r
    실패시킨 뒤, 정상 레코드를 파일로 저장하고 다시 검증합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    structWorkflowRoot = Path(tempfile.mkdtemp(prefix='codaro_struct_workflow_'))\r
    packetFormat = '>4sBIfH'\r
    packetSize = struct.calcsize(packetFormat)\r
    magicBytes = b'CDRO'\r
\r
    def encodeSensorPacket(sensorId, temperature, humidity):\r
        assert 0 <= humidity <= 100, 'humidity는 0~100 범위여야 합니다'\r
        return struct.pack(packetFormat, magicBytes, 1, sensorId, temperature, humidity)\r
\r
    def decodeSensorPacket(packet):\r
        assert len(packet) == packetSize, '패킷 길이가 포맷과 다릅니다'\r
        magic, version, sensorId, temperature, humidity = struct.unpack(packetFormat, packet)\r
        assert magic == magicBytes, '매직 넘버가 다릅니다'\r
        assert version == 1, '지원하지 않는 버전입니다'\r
        return {\r
            'sensorId': sensorId,\r
            'temperature': round(temperature, 2),\r
            'humidity': humidity\r
        }\r
\r
    sensorPacket = encodeSensorPacket(7, 23.5, 45)\r
    decodedSensor = decodeSensorPacket(sensorPacket)\r
    assert decodedSensor['sensorId'] == 7\r
    decodedSensor\r
  exercise:\r
    prompt: '검증 루프: 바이너리 레코드 품질 게이트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      structWorkflowRoot = Path(tempfile.mkdtemp(prefix='codaro_struct_workflow_'))\r
      packetFormat = '>4sBIfH'\r
      packetSize = struct.calcsize(packetFormat)\r
      magicBytes = b'CDRO'\r
\r
      def encodeSensorPacket(sensorId, temperature, humidity):\r
          assert 0 <= humidity <= 100, 'humidity는 0~100 범위여야 합니다'\r
          return struct.pack(packetFormat, magicBytes, 1, sensorId, temperature, humidity)\r
\r
      def decodeSensorPacket(packet):\r
          assert len(packet) == packetSize, '패킷 길이가 포맷과 다릅니다'\r
          magic, version, sensorId, temperature, humidity = struct.unpack(packetFormat, packet)\r
          assert magic == magicBytes, '매직 넘버가 다릅니다'\r
          assert version == 1, '지원하지 않는 버전입니다'\r
          return {\r
              'sensorId': sensorId,\r
              'temperature': round(temperature, 2),\r
              'humidity': humidity\r
          }\r
\r
      sensorPacket = encodeSensorPacket(7, 23.5, 45)\r
      decodedSensor = decodeSensorPacket(sensorPacket)\r
      assert decodedSensor['sensorId'] == 7\r
      decodedSensor\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 바이너리 레코드 품질 게이트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: 바이너리 레코드 품질 게이트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: struct 모듈 종합 복습\r
  structuredPrimary: true\r
  subtitle: 바이너리 데이터 마스터하기\r
  goal: struct 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: struct 모듈의 다양한 기능을 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    intVal = 123\r
    intPacked = struct.pack('i', intVal)\r
    len(intPacked)\r
  exercise:\r
    prompt: struct 모듈 종합 복습 예제에서 \`intVal\`, \`intPacked\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      intVal = 123\r
      intPacked = struct.pack('i', intVal)\r
      len(intPacked)\r
    hints:\r
    - 바꿀 지점은 \`intVal = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`intVal\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:
    type: noError
    noError: struct 모듈 종합 복습에서 \`intVal\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: struct 모듈 종합 복습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 16_struct-sensor-packet-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - basic_packing
    - byte_order
    - workflow_validation
    title: 센서 레코드를 고정 길이 packet으로 저장하기
    subtitle: pack, endian, 길이 검증
    goal: 센서 reading 목록을 빅엔디안 바이너리 packet으로 저장하고 packet 수, byteLength, 첫 sensorId를 반환한다.
    why: struct 학습은 pack 결과를 눈으로 보는 데서 끝나지 않고, 정해진 포맷 길이와 값 범위를 지키는 파일을 만들 때 실무 가치가 생깁니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않는 target path와 reading 목록을 넘겨 정상 저장과 실패 케이스를 함께 검증합니다.
    tips:
    - format은 \`>4sBIfH\`를 쓰고 magic은 \`b"CDRO"\`로 고정하세요.
    - humidity는 0부터 100까지만 허용하세요.
    exercise:
      prompt: write_sensor_packets(target_path, readings)가 path, packetCount, byteLength, firstSensorId를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def write_sensor_packets(target_path, readings):
            raise NotImplementedError
      solution: |-
        import struct
        from pathlib import Path

        PACKET_FORMAT = ">4sBIfH"
        MAGIC = b"CDRO"

        def write_sensor_packets(target_path, readings):
            target = Path(target_path)
            target.parent.mkdir(parents=True, exist_ok=True)
            packets = []
            for reading in readings:
                sensor_id = int(reading["sensorId"])
                temperature = float(reading["temperature"])
                humidity = int(reading["humidity"])
                if not 0 <= humidity <= 100:
                    raise ValueError("humidity must be between 0 and 100")
                packets.append(struct.pack(PACKET_FORMAT, MAGIC, 1, sensor_id, temperature, humidity))
            payload = b"".join(packets)
            target.write_bytes(payload)
            first_sensor_id = struct.unpack(PACKET_FORMAT, payload[:struct.calcsize(PACKET_FORMAT)])[2] if packets else None
            return {
                "path": str(target),
                "packetCount": len(packets),
                "byteLength": len(payload),
                "firstSensorId": first_sensor_id,
            }
      hints:
      - struct.calcsize(PACKET_FORMAT)로 packet 하나의 길이를 계산할 수 있습니다.
      - 반환 path는 verifier가 fixture root 기준 상대경로로 정규화합니다.
    check:
      id: python.builtins.struct.sensor-packet.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.struct.binary-packet.behavior.v1.fixture
      fixtureHash: sha256-A0orzacqMjbHW3HLQRlXPKIijw0Haby6TkFZ8lPUjH0=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/sensors.bin
          contentBase64: Q0RSTwEAAAAHQbwAAAAtQ0RSTwEAAAAIQZ4AAAAy
        - path: input/bad_magic.bin
          contentBase64: QkFEIQEAAAAHQbwAAAAt
        - path: input/header.bin
          contentBase64: EjRWeAAAAAIAABAA
        - path: input/short_header.bin
          contentBase64: EjRWeAAAAAI=
        stdin: []
      packageAssets: []
      payload:
        entry: write_sensor_packets
        cases:
        - id: writes-two-sensor-packets
          arguments:
          - fixturePath: output/sensors.bin
          - value:
            - sensorId: 7
              temperature: 23.5
              humidity: 45
            - sensorId: 8
              temperature: 19.75
              humidity: 50
          expectedReturn:
            path: output/sensors.bin
            packetCount: 2
            byteLength: 30
            firstSensorId: 7
        - id: rejects-invalid-humidity
          arguments:
          - fixturePath: output/bad-sensors.bin
          - value:
            - sensorId: 9
              temperature: 21.0
              humidity: 101
          expectedException: ValueError
        expectedPaths:
        - path: output/sensors.bin
          kind: file
        normalizeReturnPaths:
        - path
  transferVariants:
  - id: 16_struct-read-sensor-file-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 16_struct-sensor-packet-mastery
    - basic_unpacking
    title: 바이너리 센서 파일을 chunk 단위로 요약하기
    subtitle: calcsize와 unpack 반복
    goal: 고정 길이 sensor packet 파일을 읽어 sensorId, 온도, 습도 요약을 반환하고 잘못된 magic은 거부한다.
    why: 바이너리 파일 자동화는 한 packet만 unpack하는 예제보다, 전체 파일을 포맷 길이로 나눠 검증하며 읽는 흐름을 익혀야 실무에 이어집니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 이번에는 직접 만든 파일이 아니라 fixture의 unseen binary 파일을 읽으세요.
    tips:
    - 파일 길이가 packet 크기의 배수가 아니면 ValueError를 내세요.
    - unpack 결과의 magic과 version을 각 packet마다 확인하세요.
    exercise:
      prompt: summarize_sensor_file(path)가 packetCount, sensorIds, temperaturesCenti, maxHumidity를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def summarize_sensor_file(path):
            raise NotImplementedError
      solution: |-
        import struct
        from pathlib import Path

        PACKET_FORMAT = ">4sBIfH"
        MAGIC = b"CDRO"
        PACKET_SIZE = struct.calcsize(PACKET_FORMAT)

        def summarize_sensor_file(path):
            data = Path(path).read_bytes()
            if len(data) % PACKET_SIZE != 0:
                raise ValueError("sensor file has a partial packet")
            records = []
            for offset in range(0, len(data), PACKET_SIZE):
                magic, version, sensor_id, temperature, humidity = struct.unpack(PACKET_FORMAT, data[offset:offset + PACKET_SIZE])
                if magic != MAGIC or version != 1:
                    raise ValueError("unsupported sensor packet")
                records.append({
                    "sensorId": sensor_id,
                    "temperatureCenti": round(temperature * 100),
                    "humidity": humidity,
                })
            return {
                "packetCount": len(records),
                "sensorIds": [record["sensorId"] for record in records],
                "temperaturesCenti": [record["temperatureCenti"] for record in records],
                "maxHumidity": max((record["humidity"] for record in records), default=0),
            }
      hints:
      - range(0, len(data), PACKET_SIZE)로 chunk 시작점을 만들 수 있습니다.
      - float 비교 대신 centi 정수로 바꿔 반환하면 검증이 안정됩니다.
    check:
      id: python.builtins.struct.read-sensor-file.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.struct.binary-packet.behavior.v1.fixture
      fixtureHash: sha256-A0orzacqMjbHW3HLQRlXPKIijw0Haby6TkFZ8lPUjH0=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/sensors.bin
          contentBase64: Q0RSTwEAAAAHQbwAAAAtQ0RSTwEAAAAIQZ4AAAAy
        - path: input/bad_magic.bin
          contentBase64: QkFEIQEAAAAHQbwAAAAt
        - path: input/header.bin
          contentBase64: EjRWeAAAAAIAABAA
        - path: input/short_header.bin
          contentBase64: EjRWeAAAAAI=
        stdin: []
      packageAssets: []
      payload:
        entry: summarize_sensor_file
        cases:
        - id: summarizes-sensor-file
          arguments:
          - fixturePath: input/sensors.bin
          expectedReturn:
            packetCount: 2
            sensorIds:
            - 7
            - 8
            temperaturesCenti:
            - 2350
            - 1975
            maxHumidity: 50
        - id: rejects-bad-magic
          arguments:
          - fixturePath: input/bad_magic.bin
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 16_struct-header-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 16_struct-sensor-packet-mastery
    - practical
    title: 파일 헤더를 다시 읽어 포맷 경계를 확인하기
    subtitle: 12바이트 header와 빅엔디안 정수
    goal: 12바이트 header에서 magic, version, dataSize를 읽고 짧은 header는 ValueError로 거부한다.
    why: 시간이 지나도 struct에서 남아야 할 감각은 값 하나를 pack하는 법보다, byteLength와 endian을 먼저 고정한 뒤 해석하는 습관입니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. payload 본문이 아니라 header만 보고 파일 형식 경계를 판정하세요.
    tips:
    - header format은 \`>III\`이고 길이는 struct.calcsize로 확인하세요.
    - magic은 8자리 16진수 문자열로 반환하세요.
    exercise:
      prompt: read_codaro_header(path)가 magicHex, version, dataSize, byteLength를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def read_codaro_header(path):
            raise NotImplementedError
      solution: |-
        import struct
        from pathlib import Path

        HEADER_FORMAT = ">III"
        HEADER_SIZE = struct.calcsize(HEADER_FORMAT)

        def read_codaro_header(path):
            data = Path(path).read_bytes()
            if len(data) != HEADER_SIZE:
                raise ValueError("header must be exactly 12 bytes")
            magic, version, data_size = struct.unpack(HEADER_FORMAT, data)
            if magic != 0x12345678:
                raise ValueError("unexpected magic")
            return {
                "magicHex": f"0x{magic:08x}",
                "version": version,
                "dataSize": data_size,
                "byteLength": len(data),
            }
      hints:
      - len(data)와 struct.calcsize 결과를 먼저 비교하세요.
      - '\`f"0x{magic:08x}"\`는 leading zero가 필요한 header에도 안전합니다.'
    check:
      id: python.builtins.struct.header.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.struct.binary-packet.behavior.v1.fixture
      fixtureHash: sha256-A0orzacqMjbHW3HLQRlXPKIijw0Haby6TkFZ8lPUjH0=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/sensors.bin
          contentBase64: Q0RSTwEAAAAHQbwAAAAtQ0RSTwEAAAAIQZ4AAAAy
        - path: input/bad_magic.bin
          contentBase64: QkFEIQEAAAAHQbwAAAAt
        - path: input/header.bin
          contentBase64: EjRWeAAAAAIAABAA
        - path: input/short_header.bin
          contentBase64: EjRWeAAAAAI=
        stdin: []
      packageAssets: []
      payload:
        entry: read_codaro_header
        cases:
        - id: reads-big-endian-header
          arguments:
          - fixturePath: input/header.bin
          expectedReturn:
            magicHex: '0x12345678'
            version: 2
            dataSize: 4096
            byteLength: 12
        - id: rejects-short-header
          arguments:
          - fixturePath: input/short_header.bin
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};