var e=`meta:\r
  id: visionApps_05\r
  title: 얼굴 검출과 모자이크\r
  order: 5\r
  category: visionApps\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  - scikit-learn\r
  tags:\r
  - opencv\r
  - 얼굴검출\r
  - 모자이크\r
  - 익명화\r
  - haar\r
  seo:\r
    title: 비전 응용 - 얼굴 검출과 모자이크\r
    description: opencv 내장 Haar 캐스케이드로 얼굴을 검출하고 모자이크로 익명화합니다.\r
    keywords:\r
    - 얼굴검출\r
    - 모자이크\r
    - 익명화\r
    - haar\r
    - opencv\r
intro:\r
  emoji: 🙈\r
  goal: 얼굴 영역을 자동으로 찾고 모자이크로 익명화합니다.\r
  description: |-\r
    얼굴 모자이크는 SNS 사진 익명화, 영상 후처리 등에 자주 쓰입니다. OpenCV는 빠른 Haar 캐스케이드 얼굴 검출기를 내장해 별도 모델 다운로드 없이 즉시 사용할 수 있습니다. 이 강의는 sklearn 이미지로 얼굴 검출의 동작을 확인하고 모자이크 함수까지 만듭니다.\r
  direction: Haar 캐스케이드로 얼굴 박스를 검출하고 박스 영역에 모자이크를 적용합니다.\r
  benefits:\r
  - cv2.CascadeClassifier 호출 흐름을 익힙니다.\r
  - 얼굴이 없는 사진과 있는 사진을 모두 처리합니다.\r
  - 모자이크 함수를 만들어 박스 영역에만 효과를 적용합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. Haar 캐스케이드 로드\r
      detail: 내장된 xml 파일 사용.\r
    - label: 2단계. 검출 호출\r
      detail: detectMultiScale.\r
    - label: 3단계. 검출 시각화\r
      detail: 박스 그리기.\r
    - label: 4단계. 모자이크 함수\r
      detail: 박스 영역만 픽셀화.\r
    - label: 5단계. 영상 / 일괄 처리\r
      detail: 함수형 패턴으로 응용 확장.\r
    runtime:\r
    - label: 비전 환경\r
      detail: opencv-python에 내장된 haarcascade_frontalface_default.xml을 사용합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: load_cascade\r
  title: 1단계. Haar 캐스케이드 로드\r
  structuredPrimary: true\r
  subtitle: 내장 xml 파일\r
  goal: opencv 내장 얼굴 검출기 xml을 로드합니다.\r
  why: 검출기가 정상적으로 로드되어야 다음 단계의 추론이 가능합니다.\r
  explanation: |-\r
    \`cv2.data.haarcascades\` 는 opencv 설치에 포함된 xml 파일 디렉터리 경로입니다. \`haarcascade_frontalface_default.xml\` 이 정면 얼굴 검출용입니다.\r
\r
    \`cv2.CascadeClassifier(path)\` 로 검출기를 만들고 \`.empty()\` 가 False면 정상 로드입니다.\r
  tips:\r
  - Haar 캐스케이드는 가볍고 빠르지만 정확도는 딥러닝 검출기에 비해 낮습니다. 학습용으로는 충분합니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    cascadePath = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'\r
    detector = cv2.CascadeClassifier(cascadePath)\r
    not detector.empty()\r
  exercise:\r
    prompt: "같은 디렉터리에 들어 있는 다른 캐스케이드(예: 눈) 의 경로를 만들어 보세요."\r
    starterCode: |-\r
      eyePath = cv2.data.haarcascades + ___\r
      eyePath\r
    hints:\r
    - 빈칸은 'haarcascade_eye.xml' 입니다.\r
    - 결과는 존재하는 파일 경로 문자열입니다.\r
  check:\r
    noError: 캐스케이드 로드가 오류 없이 끝나야 합니다.\r
    resultCheck: detector.empty() 가 False여야 합니다.\r
- id: detect\r
  title: 2단계. 검출 호출\r
  structuredPrimary: true\r
  subtitle: detectMultiScale\r
  goal: detector.detectMultiScale 한 줄로 얼굴 박스를 얻습니다.\r
  why: 응용 코드의 핵심 호출은 한 줄입니다.\r
  explanation: |-\r
    Haar 검출기는 그레이 이미지를 입력으로 받습니다. \`detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)\` 가 표준 호출입니다.\r
\r
    결과는 \`(N, 4)\` ndarray로 각 행이 (x, y, w, h) 입니다. 얼굴이 없으면 빈 튜플이 반환됩니다.\r
  tips:\r
  - sklearn의 china와 flower 이미지에는 사람 얼굴이 없습니다. 검출 결과가 비어 있는 것이 정상입니다.\r
  snippet: |-\r
    china = load_sample_image('china.jpg')\r
    grayChina = cv2.cvtColor(china, cv2.COLOR_RGB2GRAY)\r
    faces = detector.detectMultiScale(grayChina, scaleFactor=1.1, minNeighbors=5)\r
    type(faces).__name__, len(faces)\r
  exercise:\r
    prompt: flower 이미지에도 같은 검출을 적용해 결과 개수를 확인하세요.\r
    starterCode: |-\r
      flower = load_sample_image('flower.jpg')\r
      grayFlower = cv2.cvtColor(flower, ___)\r
      facesFlower = detector.detectMultiScale(grayFlower, scaleFactor=1.1, minNeighbors=5)\r
      len(facesFlower)\r
    hints:\r
    - 빈칸은 cv2.COLOR_RGB2GRAY 입니다.\r
    - flower에도 얼굴이 없으므로 결과는 0 또는 매우 작습니다.\r
  check:\r
    noError: 검출 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: faces가 ndarray 또는 빈 튜플이어야 합니다.\r
- id: synth_face\r
  title: 3단계. 학습용 얼굴 합성\r
  structuredPrimary: true\r
  subtitle: 단순 얼굴 형태\r
  goal: 검출이 동작함을 확인하기 위해 매우 단순한 얼굴 형태를 합성합니다.\r
  why: sklearn 이미지에 얼굴이 없어 검출 결과를 확인할 입력이 필요합니다.\r
  explanation: |-\r
    Haar 캐스케이드는 실제 사람 얼굴에 학습되어 단순 도형은 거의 검출하지 못합니다. 따라서 학습용에서는 "검출이 빈 결과를 돌려주는 것이 정상" 임을 확인하고 모자이크 함수의 동작은 가상 박스로 검증합니다.\r
\r
    실제 응용에서는 사람 사진을 입력으로 받습니다.\r
  tips:\r
  - "학습 환경에 사진 한 장이 있다면 imread로 읽어 사용하세요: cv2.imread('photo.jpg')"\r
  snippet: |-\r
    placeholder = np.full((400, 400, 3), 220, dtype=np.uint8)\r
    cv2.circle(placeholder, (200, 200), 80, (200, 180, 160), -1)\r
    cv2.circle(placeholder, (175, 180), 8, (40, 40, 40), -1)\r
    cv2.circle(placeholder, (225, 180), 8, (40, 40, 40), -1)\r
    cv2.ellipse(placeholder, (200, 230), (30, 10), 0, 0, 180, (80, 30, 30), 3)\r
    placeholder.shape\r
  exercise:\r
    prompt: placeholder를 시각화하세요.\r
    starterCode: |-\r
      fig = plt.figure(figsize=(4, 4))\r
      plt.imshow(placeholder)\r
      plt.axis('___')\r
      fig\r
    hints:\r
    - 빈칸은 'off' 입니다.\r
    - 단순 얼굴 형태가 보여야 합니다.\r
  check:\r
    noError: 합성이 오류 없이 끝나야 합니다.\r
    resultCheck: placeholder.shape이 (400, 400, 3) 이어야 합니다.\r
- id: mosaic_fn\r
  title: 4단계. 모자이크 함수\r
  structuredPrimary: true\r
  subtitle: 박스 영역만 픽셀화\r
  goal: 박스 좌표를 입력으로 받아 그 영역을 모자이크 처리하는 함수를 만듭니다.\r
  why: 함수로 만들면 검출 결과의 박스 리스트에 일괄 적용할 수 있습니다.\r
  explanation: |-\r
    visionBasics 5강에서 본 모자이크 패턴을 함수로 정리합니다. ROI를 추출해 cv2.resize로 작게 줄였다가 같은 크기로 다시 키우면 자연스러운 모자이크가 됩니다.\r
\r
    interpolation=cv2.INTER_NEAREST가 픽셀화 효과를 만듭니다.\r
  tips:\r
  - 모자이크 강도는 축소 크기로 조절합니다. 작게 축소할수록 픽셀이 커집니다.\r
  snippet: |-\r
    def applyMosaic(img, box, strength=10):\r
        x, y, w, h = box\r
        roi = img[y:y + h, x:x + w]\r
        if roi.size == 0:\r
            return img\r
        small = cv2.resize(roi, (max(w // strength, 1), max(h // strength, 1)), interpolation=cv2.INTER_LINEAR)\r
        big = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)\r
        out = img.copy()\r
        out[y:y + h, x:x + w] = big\r
        return out\r
\r
    fakeBox = (140, 140, 120, 120)\r
    mosaicked = applyMosaic(placeholder, fakeBox)\r
    fig = plt.figure(figsize=(4, 4))\r
    plt.imshow(mosaicked)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: strength를 4로 약하게 적용한 mosaicSoft를 만들어 비교 출력하세요.\r
    starterCode: |-\r
      mosaicSoft = applyMosaic(placeholder, fakeBox, strength=___)\r
      fig2, axes2 = plt.subplots(1, 2, figsize=(8, 4))\r
      axes2[0].imshow(mosaicked)\r
      axes2[0].set_title('strength 10')\r
      axes2[1].imshow(mosaicSoft)\r
      axes2[1].set_title('strength 4')\r
      for axis in axes2:\r
          axis.axis('off')\r
      fig2\r
    hints:\r
    - 빈칸은 정수 4 입니다.\r
    - strength가 작을수록 모자이크가 부드러워집니다.\r
  check:\r
    noError: 모자이크 함수가 오류 없이 끝나야 합니다.\r
    resultCheck: mosaicked.shape이 placeholder.shape와 같아야 합니다.\r
- id: batch\r
  title: 5단계. 함수형 일괄 처리\r
  structuredPrimary: true\r
  subtitle: 박스 리스트에 일괄 적용\r
  goal: 검출 결과 박스 리스트를 받아 모두 모자이크 처리하는 함수를 만듭니다.\r
  why: 실제 검출 결과는 여러 박스이므로 일괄 처리가 표준입니다.\r
  explanation: |-\r
    함수 안에서 박스를 차례로 모자이크 처리합니다. 각 처리에 .copy() 가 들어 있으므로 매번 새 이미지를 만들지 않도록 누적 처리합니다.\r
  tips:\r
  - 박스 개수가 많으면 reduce 또는 단순 for문으로 처리합니다.\r
  snippet: |-\r
    def anonymize(img, boxes, strength=10):\r
        out = img.copy()\r
        for box in boxes:\r
            x, y, w, h = box\r
            roi = out[y:y + h, x:x + w]\r
            if roi.size == 0:\r
                continue\r
            small = cv2.resize(roi, (max(w // strength, 1), max(h // strength, 1)), interpolation=cv2.INTER_LINEAR)\r
            big = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)\r
            out[y:y + h, x:x + w] = big\r
        return out\r
\r
    syntheticBoxes = [(80, 80, 100, 100), (220, 60, 80, 80)]\r
    multi = anonymize(placeholder, syntheticBoxes)\r
    fig = plt.figure(figsize=(4, 4))\r
    plt.imshow(multi)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 실제 얼굴이 있는 사진이 있다면 이 함수로 익명화할 수 있다는 점을 확인하기 위해, placeholder에 가상 박스 리스트를 더 만들어 적용하세요.\r
    starterCode: |-\r
      extraBoxes = [(60, 200, 60, 60), (___, 250, 70, 70)]\r
      multiPlus = anonymize(placeholder, extraBoxes)\r
      fig2 = plt.figure(figsize=(4, 4))\r
      plt.imshow(multiPlus)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 빈칸은 정수(예: 260) 입니다.\r
    - 여러 영역에 모자이크가 적용됩니다.\r
  check:\r
    noError: 일괄 처리 함수가 오류 없이 끝나야 합니다.\r
    resultCheck: multi.shape이 placeholder.shape와 같아야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 실제 검출 흐름\r
  goal: 검출 → 모자이크의 한 흐름을 함수에 모읍니다.\r
  why: 응용 함수는 외부 호출자에게 단순한 인터페이스를 제공해야 합니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 응용 함수는 입력 이미지 → 익명화된 이미지 한 줄로 표현되어야 학습자가 사용하기 쉽습니다.\r
  snippet: |-\r
    def detectAndMosaic(img, scaleFactor=1.1, minNeighbors=5, strength=10):\r
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)\r
        boxes = detector.detectMultiScale(gray, scaleFactor=scaleFactor, minNeighbors=minNeighbors)\r
        return anonymize(img, boxes, strength=strength)\r
\r
    chinaAnon = detectAndMosaic(china)\r
    chinaAnon.shape, np.array_equal(chinaAnon, china)\r
  exercise:\r
    prompt: "미션1: china에 검출이 0개이므로 같은 이미지가 반환됩니다. flower에도 적용해 같은 결과를 확인하세요. 미션2: placeholder에 fakeBox를 가상으로 anonymize에 넘긴 결과를 detectAndMosaic의 결과와 비교 출력하세요."\r
    starterCode: |-\r
      flowerAnon = detectAndMosaic(flower)\r
      np.array_equal(flowerAnon, flower), ___.shape\r
    hints:\r
    - 빈칸은 flowerAnon 변수입니다.\r
    - 결과는 두 이미지가 같음을 의미하는 True와 shape입니다.\r
  check:\r
    noError: 검출 + 모자이크 흐름이 오류 없이 끝나야 합니다.\r
    resultCheck: chinaAnon.shape이 china.shape와 같아야 합니다.\r
`;export{e as default};