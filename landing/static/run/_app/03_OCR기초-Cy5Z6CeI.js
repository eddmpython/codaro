var e=`meta:\r
  id: visionApps_03\r
  title: OCR 기초\r
  order: 3\r
  category: visionApps\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  - pytesseract\r
  tags:\r
  - pytesseract\r
  - OCR\r
  - 텍스트추출\r
  - 전처리\r
  - 응용\r
  seo:\r
    title: 비전 응용 - OCR 기초\r
    description: pytesseract로 사진의 텍스트를 추출하고, 전처리로 정확도를 끌어올립니다.\r
    keywords:\r
    - OCR\r
    - pytesseract\r
    - 텍스트추출\r
    - 전처리\r
intro:\r
  emoji: 🔠\r
  goal: pytesseract로 사진의 텍스트를 추출하고 전처리로 정확도를 끌어올립니다.\r
  description: |-\r
    pytesseract는 Google이 만든 tesseract OCR 엔진을 파이썬에서 호출하는 래퍼입니다. 사진 한 장 → 텍스트 한 줄로 변환할 수 있어 영수증, 명함, 책 페이지 등의 자동 입력에 자주 쓰입니다. 이 강의는 합성 영문 이미지를 만들어 OCR을 호출하고 전처리로 결과를 개선합니다.\r
  direction: 합성 영문 이미지에 OCR을 적용하고 전처리(흑백·임곗값·확대) 효과를 비교합니다.\r
  benefits:\r
  - pytesseract.image_to_string으로 한 줄 OCR을 수행합니다.\r
  - 흑백·임곗값 전처리가 OCR 정확도에 미치는 영향을 비교합니다.\r
  - image_to_data로 텍스트 위치와 신뢰도를 함께 얻습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. Tesseract 실행 파일 확인
      detail: 시스템 의존성 점검.\r
    - label: 2단계. 합성 텍스트 이미지\r
      detail: 흰 캔버스 + 영문 텍스트.\r
    - label: 3단계. OCR 한 줄 호출\r
      detail: image_to_string.\r
    - label: 4단계. 전처리로 정확도 개선\r
      detail: 그레이 + 임곗값.\r
    - label: 5단계. 위치와 신뢰도\r
      detail: image_to_data dict.\r
    runtime:\r
    - label: OCR 환경\r
      detail: 시스템에 Tesseract OCR 실행 파일이 준비되어 있어야 합니다.
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: tesseract_ready_check
  title: 1단계. Tesseract 실행 파일 확인
  structuredPrimary: true\r
  subtitle: 시스템 의존성 점검\r
  goal: pytesseract가 시스템의 tesseract 바이너리를 찾을 수 있는지 확인합니다.\r
  why: OCR은 pytesseract 라이브러리 + 시스템 tesseract 바이너리 두 가지가 모두 필요합니다.\r
  explanation: |-\r
    \`pytesseract.get_tesseract_version()\` 이 버전 문자열을 돌려주면 시스템 실행 파일 준비가 정상입니다. 실패하면 OS에 Tesseract OCR 엔진을 먼저 준비해야 합니다.

    Windows에서는 설치 후 \`pytesseract.pytesseract.tesseract_cmd\` 에 실행 파일 경로를 명시해야 할 수도 있습니다.
  tips:
  - 시스템 실행 파일 준비가 어려운 환경이면 다음 강의의 easyocr(파이썬 패키지만으로 동작) 가 대안입니다.
  snippet: |-\r
    import pytesseract\r
    import cv2\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
\r
    try:\r
        version = str(pytesseract.get_tesseract_version())\r
    except Exception as exc:\r
        version = f"unavailable: {exc.__class__.__name__}"\r
    version\r
  exercise:\r
    prompt: 같은 호출이 다시 실행되는지 두 번째 호출로 검증하세요.\r
    starterCode: |-\r
      try:\r
          versionSecond = str(pytesseract.get_tesseract_version())\r
      except Exception as exc:\r
          versionSecond = f"unavailable: {exc.__class__.__name__}"\r
      ___\r
    hints:\r
    - 빈칸은 versionSecond 변수입니다.\r
    - 두 번 호출해도 같은 결과여야 합니다.\r
  check:\r
    noError: 버전 호출 시도가 오류 없이 끝나야 합니다.\r
    resultCheck: version이 문자열이어야 합니다.\r
- id: synth_text\r
  title: 2단계. 합성 텍스트 이미지\r
  structuredPrimary: true\r
  subtitle: 흰 캔버스 + 영문 텍스트\r
  goal: cv2.putText로 학습용 영문 이미지를 만듭니다.\r
  why: 외부 사진 없이 OCR 흐름을 학습할 수 있도록 합성을 사용합니다.\r
  explanation: |-\r
    \`cv2.putText\` 의 FONT_HERSHEY_SIMPLEX는 단순한 영문 글꼴입니다. 굵기와 크기를 조절해 OCR이 잘 인식하는 사이즈로 그립니다.\r
\r
    너무 작은 글꼴은 OCR이 어려워합니다. 한 문자가 최소 20 픽셀 이상이 권장입니다.\r
  tips:\r
  - tesseract는 검은 글씨 + 흰 배경에 가장 잘 동작합니다. 합성 시 이 패턴을 유지하세요.\r
  snippet: |-\r
    canvas = np.full((200, 500, 3), 255, dtype=np.uint8)\r
    cv2.putText(canvas, "Hello Codaro Vision", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (10, 10, 10), 2)\r
    cv2.putText(canvas, "OCR test image 2026", (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (40, 40, 40), 2)\r
    canvas.shape\r
  exercise:\r
    prompt: canvas를 시각화하세요.\r
    starterCode: |-\r
      fig = plt.figure(figsize=(7, 3))\r
      plt.imshow(canvas)\r
      plt.axis('___')\r
      fig\r
    hints:\r
    - 빈칸은 'off' 입니다.\r
    - 텍스트가 잘 보여야 합니다.\r
  check:\r
    noError: 합성과 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: canvas.shape이 (200, 500, 3) 이어야 합니다.\r
- id: ocr_call\r
  title: 3단계. OCR 한 줄 호출\r
  structuredPrimary: true\r
  subtitle: image_to_string\r
  goal: pytesseract.image_to_string 한 줄로 텍스트를 추출합니다.\r
  why: OCR의 핵심 호출은 한 줄이며, 결과 후처리가 응용의 본질입니다.\r
  explanation: |-\r
    \`pytesseract.image_to_string(canvas)\` 가 표준 호출입니다. 결과는 한 개 문자열로 줄바꿈으로 텍스트 줄이 구분됩니다.\r
\r
    tesseract가 설치되지 않은 환경에서는 예외가 발생합니다. try/except로 안내 메시지를 두면 안전합니다.\r
  tips:\r
  - 결과 문자열의 앞뒤 공백과 빈 줄을 strip()으로 정리하는 후처리가 표준입니다.\r
  snippet: |-\r
    try:\r
        recognized = pytesseract.image_to_string(canvas)\r
    except Exception as exc:\r
        recognized = f"OCR failed: {exc.__class__.__name__}"\r
    recognized\r
  exercise:\r
    prompt: 결과 텍스트의 줄 수를 출력하세요(strip 후).\r
    starterCode: |-\r
      lines = [line for line in recognized.splitlines() if ___]\r
      len(lines)\r
    hints:\r
    - 빈칸은 line.strip() 입니다.\r
    - 합성 텍스트는 두 줄로 인식되어야 합니다.\r
  check:\r
    noError: OCR 호출 시도가 오류 없이 끝나야 합니다.\r
    resultCheck: recognized가 문자열이어야 합니다.\r
- id: preprocess\r
  title: 4단계. 전처리로 정확도 개선\r
  structuredPrimary: true\r
  subtitle: 그레이 + 임곗값\r
  goal: 흑백 변환과 임곗값 처리로 OCR 정확도를 높입니다.\r
  why: 컬러 사진을 그대로 OCR에 넣는 것보다 흑백 변환이 안정적입니다.\r
  explanation: |-\r
    \`cv2.cvtColor(canvas, cv2.COLOR_BGR2GRAY)\` 후 \`cv2.threshold\` 또는 \`cv2.adaptiveThreshold\` 로 이진화합니다. 이진화 결과를 OCR에 넘기면 더 깔끔한 결과를 얻을 수 있습니다.\r
\r
    이진화 후 noise가 많으면 \`cv2.medianBlur\` 같은 단순 노이즈 제거를 함께 적용합니다.\r
  tips:\r
  - 전처리 효과는 합성 이미지에서는 미미합니다. 실제 사진에서 큰 차이를 만듭니다.\r
  snippet: |-\r
    gray = cv2.cvtColor(canvas, cv2.COLOR_BGR2GRAY)\r
    _, binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)\r
    try:\r
        recognizedBinary = pytesseract.image_to_string(binary)\r
    except Exception as exc:\r
        recognizedBinary = f"OCR failed: {exc.__class__.__name__}"\r
    recognizedBinary\r
  exercise:\r
    prompt: 전처리 전후 결과 길이를 비교하세요.\r
    starterCode: |-\r
      lenOriginal = len(recognized.strip())\r
      lenBinary = len(___.strip())\r
      lenOriginal, lenBinary\r
    hints:\r
    - 빈칸은 recognizedBinary 변수입니다.\r
    - 합성 이미지에서는 두 길이가 비슷할 수 있습니다.\r
  check:\r
    noError: 전처리와 OCR이 오류 없이 끝나야 합니다.\r
    resultCheck: recognizedBinary가 문자열이어야 합니다.\r
- id: data\r
  title: 5단계. 위치와 신뢰도\r
  structuredPrimary: true\r
  subtitle: image_to_data dict\r
  goal: image_to_data로 각 단어의 박스와 신뢰도를 얻습니다.\r
  why: 단어별 위치는 폼 자동 입력, 영역별 텍스트 분리 등의 응용에 필요합니다.\r
  explanation: |-\r
    \`pytesseract.image_to_data(canvas, output_type=pytesseract.Output.DICT)\` 는 dict를 반환합니다. 키는 left, top, width, height, conf, text 등입니다. 같은 인덱스의 값들이 하나의 단어를 가리킵니다.\r
\r
    conf가 -1 또는 매우 낮으면 신뢰할 수 없는 인식입니다.\r
  tips:\r
  - 단어 단위 결과는 zip으로 묶어 다루는 것이 깔끔합니다.\r
  snippet: |-\r
    try:\r
        ocrData = pytesseract.image_to_data(canvas, output_type=pytesseract.Output.DICT)\r
        wordsCount = sum(1 for text in ocrData['text'] if text.strip())\r
    except Exception as exc:\r
        ocrData = None\r
        wordsCount = -1\r
    wordsCount\r
  exercise:\r
    prompt: ocrData에서 처음 5개의 (text, conf) 쌍을 출력하세요.\r
    starterCode: |-\r
      if ocrData is not None:\r
          pairs = [(text, conf) for text, conf in zip(ocrData['text'], ocrData['conf']) if text.strip()][:___]\r
      else:\r
          pairs = []\r
      pairs\r
    hints:\r
    - 빈칸은 정수 5 입니다.\r
    - 결과는 (단어, 신뢰도) 튜플 5개입니다.\r
  check:\r
    noError: image_to_data 호출 시도가 오류 없이 끝나야 합니다.\r
    resultCheck: wordsCount가 -1 또는 정수여야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 박스 시각화\r
  goal: 인식된 단어의 박스를 사진에 그려 위치와 텍스트를 한 화면에 표시합니다.\r
  why: 응용에서는 어떤 텍스트가 어디에 있는지가 정보의 핵심입니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 박스가 너무 작거나 conf가 낮은 결과는 노이즈일 가능성이 큽니다. 필요하면 conf 임곗값으로 거르세요.\r
  snippet: |-\r
    from matplotlib.patches import Rectangle\r
\r
    fig, axis = plt.subplots(figsize=(8, 4))\r
    axis.imshow(canvas)\r
    if ocrData is not None:\r
        for idx, text in enumerate(ocrData['text']):\r
            if not text.strip():\r
                continue\r
            x = ocrData['left'][idx]\r
            y = ocrData['top'][idx]\r
            w = ocrData['width'][idx]\r
            h = ocrData['height'][idx]\r
            axis.add_patch(Rectangle((x, y), w, h, edgecolor='red', facecolor='none', linewidth=1))\r
    axis.axis('off')\r
    fig\r
  exercise:\r
    prompt: "미션1: conf > 60 인 단어만 그리도록 필터를 추가하세요. 미션2: 인식된 단어 텍스트만 모은 리스트를 출력하세요."\r
    starterCode: |-\r
      fig, axis = plt.subplots(figsize=(8, 4))\r
      axis.imshow(canvas)\r
      if ocrData is not None:\r
          for idx, text in enumerate(ocrData['text']):\r
              try:\r
                  confValue = float(ocrData['conf'][idx])\r
              except ValueError:\r
                  confValue = -1\r
              if not text.strip() or confValue < ___:\r
                  continue\r
              x = ocrData['left'][idx]\r
              y = ocrData['top'][idx]\r
              w = ocrData['width'][idx]\r
              h = ocrData['height'][idx]\r
              axis.add_patch(Rectangle((x, y), w, h, edgecolor='green', facecolor='none', linewidth=1))\r
      axis.axis('off')\r
      fig\r
    hints:\r
    - 빈칸은 정수 60 입니다.\r
    - 깨끗한 박스만 남아야 합니다.\r
  check:\r
    noError: 박스 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.\r
`;export{e as default};