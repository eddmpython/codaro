var e=`meta:\r
  id: visionApps_04\r
  title: 한국어 OCR\r
  order: 4\r
  category: visionApps\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  - easyocr\r
  - pillow\r
  tags:\r
  - easyocr\r
  - 한국어\r
  - OCR\r
  - 다국어\r
  - 응용\r
  seo:\r
    title: 비전 응용 - 한국어 OCR\r
    description: easyocr로 한국어가 포함된 사진에서 텍스트를 추출합니다.\r
    keywords:\r
    - 한국어OCR\r
    - easyocr\r
    - 다국어\r
    - OCR\r
intro:\r
  emoji: 🇰🇷\r
  goal: easyocr로 한국어 텍스트가 포함된 사진을 인식합니다.\r
  description: |-\r
    pytesseract도 한국어 모델을 추가하면 동작하지만 설치가 까다롭고 정확도 편차가 큽니다. easyocr는 파이썬 패키지만 설치하면 한국어를 포함한 80+ 언어를 즉시 인식하며 정확도도 준수합니다. 첫 호출 시 모델 가중치(약 100MB) 가 자동 다운로드됩니다.\r
  direction: PIL로 한국어가 포함된 합성 이미지를 만들고 easyocr Reader로 인식 결과를 받습니다.\r
  benefits:\r
  - easyocr.Reader 객체 생성과 호출 흐름을 익힙니다.\r
  - 결과 튜플(좌표, 텍스트, 신뢰도) 구조를 이해합니다.\r
  - 다국어 인식의 강점과 한계를 직접 확인합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 한국어 폰트 준비\r
      detail: PIL로 한글 그리기.\r
    - label: 2단계. Reader 객체 생성\r
      detail: 첫 호출 시 모델 다운로드.\r
    - label: 3단계. 인식 호출\r
      detail: readtext 한 줄.\r
    - label: 4단계. 결과 시각화\r
      detail: 박스와 텍스트.\r
    - label: 5단계. 영어와 한국어 비교\r
      detail: 두 언어 동시 인식.\r
    runtime:\r
    - label: OCR 환경\r
      detail: easyocr는 첫 호출 시 모델을 자동 다운로드합니다. (~100MB)\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: korean_image\r
  title: 1단계. 한국어 폰트 준비\r
  structuredPrimary: true\r
  subtitle: PIL로 한글 그리기\r
  goal: PIL로 한국어 텍스트가 들어간 합성 이미지를 만듭니다.\r
  why: cv2.putText는 한국어를 지원하지 않습니다. PIL 또는 한국어 폰트 추가가 필요합니다.\r
  explanation: |-\r
    PIL의 ImageDraw로 시스템에 있는 한국어 폰트(예: macOS의 AppleGothic, Windows의 malgun.ttf) 를 사용해 한글을 그립니다. 폰트 경로는 OS마다 다르므로 try/except로 대응합니다.\r
\r
    학습용 이미지는 이후 OCR이 인식하기 쉬운 굵기와 크기로 그립니다.\r
  tips:\r
  - 한국어 폰트 경로는 OS마다 다릅니다. 학습용은 try/except로 fallback 폰트를 두는 패턴이 일반적입니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from PIL import Image, ImageDraw, ImageFont\r
\r
    canvasImg = Image.new('RGB', (500, 200), color=(255, 255, 255))\r
    draw = ImageDraw.Draw(canvasImg)\r
    try:\r
        font = ImageFont.truetype('malgun.ttf', 36)\r
    except Exception:\r
        try:\r
            font = ImageFont.truetype('AppleGothic.ttf', 36)\r
        except Exception:\r
            font = ImageFont.load_default()\r
    draw.text((20, 30), "코다로 비전", font=font, fill=(10, 10, 10))\r
    draw.text((20, 100), "한국어 OCR 테스트", font=font, fill=(40, 40, 40))\r
    canvasArray = np.array(canvasImg)\r
    canvasArray.shape\r
  exercise:\r
    prompt: 합성 이미지를 시각화하세요.\r
    starterCode: |-\r
      fig = plt.figure(figsize=(7, 3))\r
      plt.imshow(canvasArray)\r
      plt.axis('___')\r
      fig\r
    hints:\r
    - 빈칸은 'off' 입니다.\r
    - 한국어 텍스트가 보여야 합니다.\r
  check:\r
    noError: 합성 이미지 생성이 오류 없이 끝나야 합니다.\r
    resultCheck: canvasArray.shape이 (200, 500, 3) 이어야 합니다.\r
- id: reader\r
  title: 2단계. Reader 객체 생성\r
  structuredPrimary: true\r
  subtitle: 첫 호출 시 모델 다운로드\r
  goal: easyocr.Reader 객체를 한국어 + 영어로 설정합니다.\r
  why: 첫 호출은 시간이 걸리지만 이후의 모든 readtext 호출은 빠릅니다.\r
  explanation: |-\r
    \`easyocr.Reader(['ko', 'en'], gpu=False)\` 가 표준입니다. 첫 호출 시 모델 가중치를 자동 다운로드합니다. GPU 없는 환경에서는 gpu=False 를 명시합니다.\r
\r
    Reader 객체는 한 번 만들어 두고 여러 이미지에 재사용하는 것이 표준입니다.\r
  tips:\r
  - 학습 시 첫 호출이 느린 점을 학습자에게 안내하는 것이 좋습니다.\r
  snippet: |-\r
    try:\r
        import easyocr\r
        reader = easyocr.Reader(['ko', 'en'], gpu=False)\r
        readerStatus = 'ready'\r
    except Exception as exc:\r
        reader = None\r
        readerStatus = f"failed: {exc.__class__.__name__}"\r
    readerStatus\r
  exercise:\r
    prompt: reader 객체의 타입을 출력하세요.\r
    starterCode: |-\r
      if reader is not None:\r
          status = type(reader).__name__\r
      else:\r
          status = ___\r
      status\r
    hints:\r
    - 빈칸은 None 또는 'unavailable' 같은 문자열입니다.\r
    - 결과는 'Reader' 또는 fallback 문자열입니다.\r
  check:\r
    noError: Reader 객체 생성 시도가 오류 없이 끝나야 합니다.\r
    resultCheck: readerStatus가 문자열이어야 합니다.\r
- id: read\r
  title: 3단계. 인식 호출\r
  structuredPrimary: true\r
  subtitle: readtext 한 줄\r
  goal: reader.readtext 한 줄로 인식 결과를 받습니다.\r
  why: 응용 코드는 한 줄로 끝나야 합니다.\r
  explanation: |-\r
    \`reader.readtext(canvasArray)\` 는 \`[(좌표, 텍스트, 신뢰도), ...]\` 리스트를 반환합니다. 좌표는 네 꼭짓점 (x, y) 의 리스트입니다.\r
\r
    Reader가 None이면 학습 환경에 easyocr이 없는 것이므로 안내 메시지를 출력합니다.\r
  tips:\r
  - 결과 텍스트는 줄 단위 또는 그룹 단위로 나뉘어 들어옵니다.\r
  snippet: |-\r
    if reader is not None:\r
        results = reader.readtext(canvasArray)\r
    else:\r
        results = []\r
    len(results), results[0] if results else None\r
  exercise:\r
    prompt: 결과 텍스트만 추출해 리스트로 만드세요.\r
    starterCode: |-\r
      texts = [item[___] for item in results]\r
      texts\r
    hints:\r
    - 빈칸은 정수 1 입니다(텍스트 위치).\r
    - 한국어 텍스트들이 정확히 나오면 인식이 성공한 것입니다.\r
  check:\r
    noError: 인식 호출 시도가 오류 없이 끝나야 합니다.\r
    resultCheck: results가 리스트여야 합니다.\r
- id: visualize\r
  title: 4단계. 결과 시각화\r
  structuredPrimary: true\r
  subtitle: 박스와 텍스트\r
  goal: 인식된 박스와 텍스트를 사진 위에 그립니다.\r
  why: 응용 코드의 결과는 시각으로 검증해야 합니다.\r
  explanation: |-\r
    각 결과의 좌표 네 꼭짓점을 matplotlib polygon으로 그리고, 박스 위에 텍스트를 표시합니다. 한국어 폰트가 matplotlib에 등록되어 있어야 텍스트가 깨지지 않습니다.\r
\r
    fontproperties 또는 rcParams['font.family'] 설정이 필요할 수 있습니다.\r
  tips:\r
  - 한국어 글꼴이 matplotlib에 없으면 텍스트가 □로 보일 수 있습니다.\r
  snippet: |-\r
    from matplotlib.patches import Polygon\r
\r
    fig, axis = plt.subplots(figsize=(8, 4))\r
    axis.imshow(canvasArray)\r
    for item in results:\r
        coords = np.array(item[0])\r
        axis.add_patch(Polygon(coords, edgecolor='red', fill=False, linewidth=2))\r
    axis.axis('off')\r
    fig\r
  exercise:\r
    prompt: 같은 시각화에 텍스트를 각 박스 위에 표시하세요(한국어 폰트가 깨지면 영문으로 대체).\r
    starterCode: |-\r
      fig, axis = plt.subplots(figsize=(8, 4))\r
      axis.imshow(canvasArray)\r
      for item in results:\r
          coords = np.array(item[0])\r
          text = item[1]\r
          axis.add_patch(Polygon(coords, edgecolor='blue', fill=False, linewidth=2))\r
          axis.text(coords[0][0], coords[0][1] - 5, text, color='blue', fontsize=___)\r
      axis.axis('off')\r
      fig\r
    hints:\r
    - 빈칸은 정수 10 입니다.\r
    - 텍스트가 박스 위에 표시되어야 합니다.\r
  check:\r
    noError: 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.\r
- id: compare_languages\r
  title: 5단계. 영어와 한국어 비교\r
  structuredPrimary: true\r
  subtitle: 두 언어 동시 인식\r
  goal: 한국어와 영어가 함께 있는 이미지에서 둘 다 인식되는지 확인합니다.\r
  why: 다국어 인식은 easyocr의 강점입니다.\r
  explanation: |-\r
    한국어와 영어를 한 사진에 그리고 같은 reader로 인식을 호출합니다. Reader가 두 언어를 모두 처리하도록 설정되어 있어야 합니다.\r
  tips:\r
  - 두 언어가 같은 사진에 있을 때 인식 순서가 좌→우, 상→하로 정렬됩니다.\r
  snippet: |-\r
    mixedImg = Image.new('RGB', (500, 200), color=(255, 255, 255))\r
    drawMixed = ImageDraw.Draw(mixedImg)\r
    drawMixed.text((20, 30), "Codaro Vision 비전 트랙", font=font, fill=(10, 10, 10))\r
    drawMixed.text((20, 100), "english + 한글", font=font, fill=(40, 40, 40))\r
    mixedArray = np.array(mixedImg)\r
    if reader is not None:\r
        mixedResults = reader.readtext(mixedArray)\r
    else:\r
        mixedResults = []\r
    len(mixedResults), [item[1] for item in mixedResults]\r
  exercise:\r
    prompt: 인식 결과를 박스와 함께 시각화하세요.\r
    starterCode: |-\r
      fig, axis = plt.subplots(figsize=(8, 4))\r
      axis.imshow(mixedArray)\r
      for item in mixedResults:\r
          coords = np.array(item[___])\r
          axis.add_patch(Polygon(coords, edgecolor='green', fill=False, linewidth=2))\r
      axis.axis('off')\r
      fig\r
    hints:\r
    - 빈칸은 정수 0 입니다(좌표 위치).\r
    - 영어와 한국어 박스가 모두 그려져야 합니다.\r
  check:\r
    noError: 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: mixedResults가 리스트여야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 응용 함수\r
  goal: 이미지 입력 → 인식된 텍스트 리스트의 응용 함수를 만듭니다.\r
  why: 함수로 묶어 두면 자동화 파이프라인에 즉시 연결할 수 있습니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - reader는 함수 밖에서 한 번만 만들어 인자로 받는 것이 효율적입니다.\r
  snippet: |-\r
    def extractTexts(img, readerLocal):\r
        if readerLocal is None:\r
            return []\r
        resultsLocal = readerLocal.readtext(img)\r
        return [text for _, text, _ in resultsLocal]\r
\r
    extractTexts(canvasArray, reader)\r
  exercise:\r
    prompt: "미션1: canvasArray와 mixedArray에 함수를 적용한 결과를 dict로 정리하세요. 미션2: 신뢰도 0.5 이상인 텍스트만 반환하는 extractConfident 함수를 만들고 두 입력에 적용하세요."\r
    starterCode: |-\r
      summary = {\r
          "korean_only": extractTexts(canvasArray, reader),\r
          "mixed": extractTexts(___, reader),\r
      }\r
      summary\r
    hints:\r
    - 빈칸은 mixedArray 변수입니다.\r
    - "신뢰도는 results 튜플의 마지막 값입니다(item[2])."\r
  check:\r
    noError: 응용 함수가 오류 없이 끝나야 합니다.\r
    resultCheck: summary의 두 키 값이 모두 리스트여야 합니다.\r
`;export{e as default};