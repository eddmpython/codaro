var e=`meta:\r
  id: visionApps_02\r
  title: QR과 바코드 리더\r
  order: 2\r
  category: visionApps\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  tags:\r
  - opencv\r
  - QR\r
  - 바코드\r
  - QRCodeDetector\r
  - 디코드\r
  seo:\r
    title: 비전 응용 - QR과 바코드 리더\r
    description: opencv 내장 QRCodeDetector로 사진의 QR 코드를 한 줄로 읽습니다.\r
    keywords:\r
    - QR\r
    - 바코드\r
    - 디코드\r
    - QRCodeDetector\r
    - opencv\r
intro:\r
  emoji: 🔳\r
  goal: 사진에서 QR 코드를 자동으로 찾아 디코드 결과를 받습니다.\r
  description: |-\r
    상품 가격, 결제, 자료 링크, Wi-Fi 비밀번호 - QR과 바코드는 일상에 깊이 들어와 있습니다. OpenCV 4.0+ 부터 QRCodeDetector가 내장되어 한 줄 호출로 인코딩과 디코딩이 가능합니다. 이 강의는 QR 합성 → 사진 합성 → 디코드의 흐름으로 응용 코드를 직접 만듭니다.\r
  direction: QR 코드를 만들고 사진에 합성한 뒤 OpenCV로 자동 디코드합니다.\r
  benefits:\r
  - cv2.QRCodeDetector.detectAndDecode를 한 줄로 호출할 수 있습니다.\r
  - QR이 사진 안에 있을 때 검출과 디코딩 결과를 동시에 받습니다.\r
  - 디코드 결과를 시각화에 표시하는 패턴을 익힙니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. QR 인코딩\r
      detail: 텍스트 → QR 이미지.\r
    - label: 2단계. 사진에 QR 합성\r
      detail: 작은 QR을 사진의 일부에 배치.\r
    - label: 3단계. detectAndDecode\r
      detail: 한 줄 호출로 결과 받기.\r
    - label: 4단계. 박스 시각화\r
      detail: 검출된 영역 표시.\r
    - label: 5단계. 여러 QR 처리\r
      detail: detectAndDecodeMulti.\r
    runtime:\r
    - label: 비전 환경\r
      detail: opencv-python 4.0 이상이 필요합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: encode\r
  title: 1단계. QR 인코딩\r
  structuredPrimary: true\r
  subtitle: 텍스트 → QR 이미지\r
  goal: 텍스트를 QR 이미지로 인코딩합니다.\r
  why: 학습 환경에서 외부 QR 파일 없이 즉시 입력을 만들 수 있어야 합니다.\r
  explanation: |-\r
    \`qrEncoder = cv2.QRCodeEncoder.create()\` 객체를 만들고 \`qrEncoder.encode(text)\` 로 흑백 QR 이미지를 얻습니다. 결과는 정사각형 ndarray입니다.\r
\r
    OpenCV 버전이 낮으면 QRCodeEncoder가 없을 수 있습니다. 그럴 때는 직접 만든 QR 이미지 파일을 사용해야 합니다.\r
  tips:\r
  - QR 인코더는 보통 작은 크기로 결과를 만듭니다. cv2.resize로 키울 수 있습니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
\r
    qrEncoder = cv2.QRCodeEncoder.create()\r
    qrSmall = qrEncoder.encode("https://codaro.example")\r
    qrSmall.shape, qrSmall.dtype\r
  exercise:\r
    prompt: 같은 인코더로 다른 텍스트를 인코딩한 qrAnother를 만드세요.\r
    starterCode: |-\r
      qrAnother = qrEncoder.encode("___")\r
      qrAnother.shape\r
    hints:\r
    - '빈칸은 임의 문자열입니다(예: "hello").'\r
    - 짧은 텍스트는 작은 QR이 됩니다.\r
  check:\r
    noError: QR 인코딩이 오류 없이 끝나야 합니다.\r
    resultCheck: qrSmall.ndim이 2여야 합니다.\r
- id: place_on_photo\r
  title: 2단계. 사진에 QR 합성\r
  structuredPrimary: true\r
  subtitle: 사진의 일부에 배치\r
  goal: 흰 캔버스에 QR을 배치해 사진처럼 보이는 입력을 만듭니다.\r
  why: 실제 사진에서 QR을 찾는 시뮬레이션을 위해 캔버스에 합성합니다.\r
  explanation: |-\r
    QR을 큰 크기로 키운 뒤(cv2.resize), 흰 캔버스의 특정 위치에 슬라이싱으로 붙입니다. 가장자리에 여백을 두면 검출이 안정적입니다.\r
\r
    합성 캔버스는 컬러(3채널) 로 만들어야 다음 단계 디코더가 받을 수 있는 형식이 됩니다.\r
  tips:\r
  - QR 주변에 여백이 부족하면 검출 실패율이 올라갑니다. 흰 여백을 충분히 두세요.\r
  snippet: |-\r
    qrBig = cv2.resize(qrSmall, (180, 180), interpolation=cv2.INTER_NEAREST)\r
    qrBig = qrBig if qrBig.ndim == 3 else cv2.cvtColor(qrBig, cv2.COLOR_GRAY2BGR)\r
    canvas = np.full((400, 600, 3), 240, dtype=np.uint8)\r
    cv2.putText(canvas, "Codaro QR demo", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (40, 40, 40), 2)\r
    canvas[120:300, 300:480] = qrBig\r
    canvas.shape\r
  exercise:\r
    prompt: canvas를 시각화하세요.\r
    starterCode: |-\r
      fig = plt.figure(figsize=(7, 4))\r
      plt.imshow(canvas)\r
      plt.axis('___')\r
      fig\r
    hints:\r
    - 빈칸은 'off' 입니다.\r
    - 텍스트와 QR이 모두 보여야 합니다.\r
  check:\r
    noError: 합성이 오류 없이 끝나야 합니다.\r
    resultCheck: canvas.shape이 (400, 600, 3) 이어야 합니다.\r
- id: decode\r
  title: 3단계. detectAndDecode\r
  structuredPrimary: true\r
  subtitle: 한 줄 호출\r
  goal: 합성한 사진에서 QR을 검출하고 디코드합니다.\r
  why: 응용 코드의 핵심은 결국 한 줄 호출입니다.\r
  explanation: |-\r
    \`qrDecoder = cv2.QRCodeDetector()\` 객체를 만들고 \`qrDecoder.detectAndDecode(canvas)\` 를 호출합니다. 결과는 \`(decoded_text, bounding_box, straight_qr)\` 튜플입니다.\r
\r
    decoded_text가 빈 문자열이면 검출은 됐지만 디코드는 실패한 경우입니다.\r
  tips:\r
  - 검출과 디코딩은 단일 호출에 묶여 있어 응용 코드를 단순하게 만듭니다.\r
  snippet: |-\r
    qrDecoder = cv2.QRCodeDetector()\r
    decoded, box, _ = qrDecoder.detectAndDecode(canvas)\r
    decoded, None if box is None else box.shape\r
  exercise:\r
    prompt: QR을 90도 회전한 캔버스 rotatedCanvas로도 디코드를 시도하세요.\r
    starterCode: |-\r
      rotatedCanvas = np.rot90(canvas, k=1).copy()\r
      decodedRot, boxRot, _ = qrDecoder.detectAndDecode(___)\r
      decodedRot\r
    hints:\r
    - 빈칸은 rotatedCanvas 변수입니다.\r
    - QR 디코더는 회전된 QR도 잘 읽어야 합니다.\r
  check:\r
    noError: 디코드가 오류 없이 끝나야 합니다.\r
    resultCheck: decoded가 'https://codaro.example' 와 같아야 합니다(빈 문자열일 수도 있으면 실패).\r
- id: draw_box\r
  title: 4단계. 박스 시각화\r
  structuredPrimary: true\r
  subtitle: 검출 영역 표시\r
  goal: 디코드된 QR의 박스를 원본에 그려 검출 영역을 표시합니다.\r
  why: 다중 QR이나 디버깅 시 검출 영역을 시각화하면 결과가 명료해집니다.\r
  explanation: |-\r
    box는 (1, 4, 2) 모양으로 QR의 네 꼭짓점입니다. cv2.polylines로 한 줄에 그릴 수 있습니다.\r
\r
    matplotlib에서는 patches.Polygon 으로도 그릴 수 있지만 cv2.polylines가 더 간단합니다.\r
  tips:\r
  - 디코드 결과 텍스트도 함께 표시하면 사진 한 장에 결과가 압축됩니다.\r
  snippet: |-\r
    if box is not None:\r
        drawn = canvas.copy()\r
        cv2.polylines(drawn, [box.astype(int)], True, (0, 255, 0), 3)\r
        if decoded:\r
            cv2.putText(drawn, decoded, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 128, 0), 2)\r
    else:\r
        drawn = canvas\r
    fig = plt.figure(figsize=(7, 4))\r
    plt.imshow(drawn)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 회전된 캔버스에 대해서도 같은 시각화를 만드세요.\r
    starterCode: |-\r
      if boxRot is not None:\r
          drawnRot = rotatedCanvas.copy()\r
          cv2.polylines(drawnRot, [boxRot.astype(int)], True, (0, 255, 0), ___)\r
      else:\r
          drawnRot = rotatedCanvas\r
      fig2 = plt.figure(figsize=(4, 6))\r
      plt.imshow(drawnRot)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 빈칸은 정수 3 입니다(선 두께).\r
    - 박스가 QR을 정확히 감싸야 합니다.\r
  check:\r
    noError: 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.\r
- id: multi\r
  title: 5단계. 여러 QR 처리\r
  structuredPrimary: true\r
  subtitle: detectAndDecodeMulti\r
  goal: 한 사진에 여러 QR이 있을 때 모두 찾아 디코드합니다.\r
  why: 실제 응용에서는 한 사진에 여러 코드가 있을 수 있습니다.\r
  explanation: |-\r
    \`detectAndDecodeMulti\` 는 \`(success, decoded_list, boxes, qr_codes)\` 를 반환합니다. decoded_list는 디코드된 문자열 리스트입니다.\r
\r
    여러 QR을 합성한 캔버스로 동작을 확인합니다.\r
  tips:\r
  - 여러 QR 검출은 단일 검출보다 더 큰 캔버스를 입력으로 받는 것이 안정적입니다.\r
  snippet: |-\r
    qrA = cv2.resize(qrEncoder.encode("code-A"), (150, 150), interpolation=cv2.INTER_NEAREST)\r
    qrB = cv2.resize(qrEncoder.encode("code-B"), (150, 150), interpolation=cv2.INTER_NEAREST)\r
    qrA = qrA if qrA.ndim == 3 else cv2.cvtColor(qrA, cv2.COLOR_GRAY2BGR)\r
    qrB = qrB if qrB.ndim == 3 else cv2.cvtColor(qrB, cv2.COLOR_GRAY2BGR)\r
    multiCanvas = np.full((300, 600, 3), 240, dtype=np.uint8)\r
    multiCanvas[60:210, 50:200] = qrA\r
    multiCanvas[60:210, 400:550] = qrB\r
    success, decodedList, boxes, _ = qrDecoder.detectAndDecodeMulti(multiCanvas)\r
    success, decodedList\r
  exercise:\r
    prompt: 검출된 박스를 multiCanvas 위에 그려 시각화하세요.\r
    starterCode: |-\r
      if boxes is not None:\r
          drawnMulti = multiCanvas.copy()\r
          for boxArr in boxes:\r
              cv2.polylines(drawnMulti, [boxArr.astype(int)], True, (255, 0, 0), 2)\r
      else:\r
          drawnMulti = multiCanvas\r
      fig = plt.figure(figsize=(7, 3))\r
      plt.imshow(drawnMulti)\r
      plt.axis('___')\r
      fig\r
    hints:\r
    - 빈칸은 'off' 입니다.\r
    - 두 QR이 모두 박스로 표시되어야 합니다.\r
  check:\r
    noError: 다중 디코드가 오류 없이 끝나야 합니다.\r
    resultCheck: success가 True여야 하고 decodedList의 길이가 2여야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: QR 응용 함수\r
  goal: 사진을 입력으로 받아 디코드된 텍스트 리스트를 반환하는 함수를 만듭니다.\r
  why: 함수로 묶으면 자동 처리 파이프라인에 즉시 연결할 수 있습니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 검출이 실패한 경우 빈 리스트를 반환하는 일관된 인터페이스를 두는 것이 좋습니다.\r
  snippet: |-\r
    def readQrs(img):\r
        decoderLocal = cv2.QRCodeDetector()\r
        success, decodedListLocal, boxesLocal, _ = decoderLocal.detectAndDecodeMulti(img)\r
        if not success:\r
            return []\r
        return [text for text in decodedListLocal if text]\r
\r
    readQrs(multiCanvas)\r
  exercise:\r
    prompt: "미션1: canvas, rotatedCanvas, multiCanvas 세 입력에 readQrs를 적용한 결과를 dict로 정리해 출력하세요. 미션2: QR이 없는 흰 캔버스를 함수에 통과시켜 빈 리스트가 반환되는지 확인하세요."\r
    starterCode: |-\r
      results = {\r
          "canvas": readQrs(canvas),\r
          "rotated": readQrs(rotatedCanvas),\r
          "multi": readQrs(___),\r
      }\r
      results\r
    hints:\r
    - 빈칸은 multiCanvas 변수입니다.\r
    - 결과 dict는 입력별 디코드 리스트입니다.\r
  check:\r
    noError: 응용 함수 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: results의 'multi' 값 길이가 2여야 합니다.\r
`;export{e as default};