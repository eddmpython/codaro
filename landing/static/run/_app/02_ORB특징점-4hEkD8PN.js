var e=`meta:\r
  id: visionFeatures_02\r
  title: ORB 특징점과 디스크립터\r
  order: 2\r
  category: visionFeatures\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  - scikit-learn\r
  tags:\r
  - opencv\r
  - ORB\r
  - 특징점\r
  - 디스크립터\r
  - keypoint\r
  seo:\r
    title: 비전 특징점 - ORB 특징점과 디스크립터\r
    description: ORB로 키포인트와 디스크립터를 추출하고 그 의미를 시각화로 확인합니다.\r
    keywords:\r
    - ORB\r
    - 특징점\r
    - 디스크립터\r
    - keypoint\r
    - opencv\r
intro:\r
  emoji: 🔑\r
  goal: 회전과 크기에 강건한 ORB 특징점 검출기로 키포인트와 디스크립터를 얻습니다.\r
  description: |-\r
    코너만으로는 두 사진의 같은 위치를 식별할 수 없습니다. 이 강의는 ORB(Oriented FAST and Rotated BRIEF) 알고리즘으로 각 코너에 "지문" 같은 디스크립터를 붙이는 과정을 익히고, 그 디스크립터가 다음 강의의 매칭에 어떻게 쓰이는지 미리 봅니다.\r
  direction: ORB로 키포인트와 디스크립터를 추출하고 회전·크기 변화에 강건한지 직접 확인합니다.\r
  benefits:\r
  - cv2.ORB_create로 키포인트와 디스크립터를 한 번에 얻을 수 있습니다.\r
  - 키포인트가 좌표·크기·방향을 모두 가진 객체임을 이해합니다.\r
  - ORB가 SIFT 대비 어떤 장단점을 가지는지 한 줄로 설명할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. ORB 객체 만들기\r
      detail: cv2.ORB_create로 검출기를 구성합니다.\r
    - label: 2단계. 키포인트와 디스크립터 추출\r
      detail: detectAndCompute 한 번에 둘 다 얻습니다.\r
    - label: 3단계. 키포인트 시각화\r
      detail: drawKeypoints로 크기와 방향까지 그립니다.\r
    - label: 4단계. 디스크립터 구조 보기\r
      detail: 32바이트 이진 벡터의 정체를 확인합니다.\r
    - label: 5단계. 회전 강건성 확인\r
      detail: 회전 후에도 유사한 키포인트가 잡히는지 봅니다.\r
    runtime:\r
    - label: 비전 환경\r
      detail: opencv-python을 meta.packages에 선언하면 ORB가 모듈에 그대로 포함됩니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: orb_create\r
  title: 1단계. ORB 검출기 만들기\r
  structuredPrimary: true\r
  subtitle: cv2.ORB_create\r
  goal: 적절한 매개변수로 ORB 검출기 객체를 만듭니다.\r
  why: 검출기는 한 번 만들고 여러 이미지에 재사용하는 것이 표준입니다.\r
  explanation: |-\r
    \`cv2.ORB_create(nfeatures=500)\` 는 키포인트를 최대 500개까지 찾는 ORB 검출기를 만듭니다. 한 번 만들고 여러 이미지에 같은 객체를 호출하면 됩니다.\r
\r
    nfeatures가 너무 작으면 매칭이 빈약하고 너무 크면 매칭 비용이 늘어납니다. 합성 데이터 학습에서는 500이 적당합니다.\r
  tips:\r
  - ORB는 OpenCV 코어에 포함되어 별도 설치가 필요 없습니다. SIFT는 일부 환경에서 contrib 모듈을 요구합니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    orb = cv2.ORB_create(nfeatures=500)\r
    type(orb).__name__\r
  exercise:\r
    prompt: nfeatures를 200으로 줄인 smallOrb 객체를 만드세요.\r
    starterCode: |-\r
      smallOrb = cv2.ORB_create(nfeatures=___)\r
      type(smallOrb).__name__\r
    hints:\r
    - 정수만 들어가면 됩니다.\r
    - 객체 타입은 ORB로 출력됩니다.\r
  check:\r
    noError: 검출기 생성이 오류 없이 끝나야 합니다.\r
    resultCheck: type(orb).__name__ 이 'ORB'여야 합니다.\r
- id: detect_compute\r
  title: 2단계. 키포인트와 디스크립터 추출\r
  structuredPrimary: true\r
  subtitle: detectAndCompute 한 번에\r
  goal: 한 호출로 키포인트 리스트와 디스크립터 배열을 동시에 얻습니다.\r
  why: 추출 자체는 한 줄이지만 결과 데이터의 구조를 이해해야 다음 단계로 넘어갑니다.\r
  explanation: |-\r
    \`orb.detectAndCompute(gray, mask=None)\` 는 \`(keypoints, descriptors)\` 튜플을 돌려줍니다. keypoints는 \`cv2.KeyPoint\` 객체 리스트, descriptors는 \`(N, 32)\` 모양의 uint8 배열입니다.\r
\r
    KeyPoint 객체는 \`.pt(좌표)\`, \`.size(크기)\`, \`.angle(방향)\`, \`.response(강도)\` 속성을 갖습니다. 좌표는 (x, y) 순입니다.\r
  tips:\r
  - 디스크립터의 한 행은 한 키포인트의 32바이트(=256비트) 이진 지문입니다.\r
  snippet: |-\r
    china = load_sample_image('china.jpg')\r
    gray = cv2.cvtColor(china, cv2.COLOR_RGB2GRAY)\r
    kp, desc = orb.detectAndCompute(gray, mask=None)\r
    len(kp), desc.shape, desc.dtype\r
  exercise:\r
    prompt: flower 이미지에서도 키포인트를 추출하고 각 키포인트의 (x, y) 좌표 첫 다섯 개를 출력하세요.\r
    starterCode: |-\r
      flower = load_sample_image('flower.jpg')\r
      flowerGray = cv2.cvtColor(flower, ___)\r
      kpFlower, descFlower = orb.detectAndCompute(flowerGray, mask=None)\r
      [point.pt for point in kpFlower[:___]]\r
    hints:\r
    - 빈칸은 색공간 상수와 정수입니다.\r
    - kpFlower[0].pt 는 첫 키포인트의 (x, y) 좌표입니다.\r
  check:\r
    noError: detectAndCompute가 오류 없이 끝나야 합니다.\r
    resultCheck: desc.shape의 두 번째 차원이 32여야 합니다.\r
- id: draw_keypoints\r
  title: 3단계. 키포인트 시각화\r
  structuredPrimary: true\r
  subtitle: 크기와 방향까지 그리기\r
  goal: cv2.drawKeypoints로 키포인트의 위치, 크기, 방향을 한 화면에 그립니다.\r
  why: 키포인트가 단순 좌표가 아니라 크기·방향까지 가진 풍부한 정보임을 시각적으로 확인합니다.\r
  explanation: |-\r
    \`cv2.drawKeypoints(img, keypoints, None, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)\` 는 키포인트를 원으로 그리되 크기와 방향까지 표시합니다.\r
\r
    원의 반지름이 키포인트의 size, 원 안의 선이 angle 방향입니다. 같은 코너라도 크기가 다른 여러 스케일에서 검출되어 같은 위치에 다른 원이 겹쳐 보일 수 있습니다.\r
  tips:\r
  - drawKeypoints는 BGR을 가정하므로 입력이 RGB라면 결과를 다시 변환하거나 그대로 표시해도 됩니다(시각화 색만 살짝 다름).\r
  snippet: |-\r
    flower = load_sample_image('flower.jpg')\r
    flowerGray = cv2.cvtColor(flower, cv2.COLOR_RGB2GRAY)\r
    kpFlower, descFlower = orb.detectAndCompute(flowerGray, mask=None)\r
\r
    drawn = cv2.drawKeypoints(china, kp, None, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)\r
    fig = plt.figure(figsize=(8, 5))\r
    plt.imshow(drawn)\r
    plt.title(f'{len(kp)} ORB keypoints')\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: flower에도 같은 방식으로 시각화하세요.\r
    starterCode: |-\r
      drawnFlower = cv2.drawKeypoints(flower, kpFlower, None, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)\r
      fig2 = plt.figure(figsize=(8, 5))\r
      plt.imshow(drawnFlower)\r
      plt.title(f'flower {len(kpFlower)} keypoints')\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - drawKeypoints의 세 번째 인자가 None이면 함수가 새 이미지를 만들어 반환합니다.\r
    - flag를 빼면 단순 점만 그려집니다.\r
  check:\r
    noError: drawKeypoints가 오류 없이 끝나야 합니다.\r
    resultCheck: drawn.shape 가 china.shape와 같아야 합니다.\r
- id: descriptor_inspect\r
  title: 4단계. 디스크립터 구조 보기\r
  structuredPrimary: true\r
  subtitle: 32바이트 이진 벡터\r
  goal: 디스크립터 배열의 한 행이 무엇인지 직접 확인합니다.\r
  why: 디스크립터의 정체를 알아야 다음 강의의 해밍 거리 매칭이 어떻게 동작하는지 이해할 수 있습니다.\r
  explanation: |-\r
    ORB 디스크립터의 한 행은 32개의 uint8(256비트)입니다. 각 비트는 키포인트 주변 두 픽셀의 밝기 비교 결과입니다. 두 디스크립터의 거리는 비트가 다른 개수(해밍 거리)로 측정합니다.\r
\r
    이 방식은 단순하지만 매우 빠르고, SIFT의 128차원 float 벡터보다 메모리를 적게 씁니다.\r
  tips:\r
  - 디스크립터 차원이 32바이트라는 점을 기억해 두면 데이터 크기 계산이 쉬워집니다(500개 × 32 = 16KB).\r
  snippet: |-\r
    firstDesc = desc[0]\r
    {"len": int(len(firstDesc)), "dtype": str(firstDesc.dtype), "bits_first_byte": format(int(firstDesc[0]), '08b')}\r
  exercise:\r
    prompt: 첫 두 디스크립터의 해밍 거리(비트 차이 개수)를 직접 계산하세요.\r
    starterCode: |-\r
      xorBytes = desc[0] ^ desc[1]\r
      bitDiff = int(sum(bin(value).count('1') for value in xorBytes))\r
      bitDiff\r
    hints:\r
    - XOR 후 각 바이트의 1의 개수를 모두 더하면 해밍 거리입니다.\r
    - bin(x).count('1') 가 빠른 표현입니다.\r
  check:\r
    noError: 비트 연산이 오류 없이 끝나야 합니다.\r
    resultCheck: bitDiff가 0 이상 256 이하 정수여야 합니다.\r
- id: rotation_robust\r
  title: 5단계. 회전 강건성 확인\r
  structuredPrimary: true\r
  subtitle: 회전된 이미지에서도 비슷한 위치\r
  goal: 같은 이미지를 90도 회전한 뒤 키포인트가 비슷한 위치(상대적으로)에 잡히는지 확인합니다.\r
  why: 회전 강건성은 매칭이 가능한 알고리즘의 기본 요건입니다.\r
  explanation: |-\r
    \`np.rot90(img, k=1)\` 로 이미지를 90도 반시계 회전한 뒤 다시 ORB를 돌리면, 비슷한 객체 부위에서 키포인트가 잡힙니다. 같은 절대 좌표가 아니라 객체 기준 같은 위치라는 점이 핵심입니다.\r
\r
    이 강건성 덕분에 회전된 사진 두 장의 같은 점을 매칭할 수 있습니다.\r
  tips:\r
  - ORB의 angle은 회전을 반영해 변합니다. 매칭 시 이 각도가 디스크립터 회전 보정에 쓰입니다.\r
  snippet: |-\r
    rotated = np.rot90(china, k=1)\r
    rotatedGray = cv2.cvtColor(rotated, cv2.COLOR_RGB2GRAY)\r
    kpRot, descRot = orb.detectAndCompute(rotatedGray, mask=None)\r
    len(kp), len(kpRot)\r
  exercise:\r
    prompt: 원본과 회전 이미지의 키포인트를 1x2 그리드로 시각화하세요.\r
    starterCode: |-\r
      drawnRot = cv2.drawKeypoints(rotated, kpRot, None, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)\r
      fig, axes = plt.subplots(1, 2, figsize=(12, 5))\r
      axes[0].imshow(drawn)\r
      axes[0].set_title('original')\r
      axes[1].imshow(drawnRot)\r
      axes[1].set_title('rotated 90')\r
      for axis in axes:\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - drawKeypoints는 새 이미지를 반환합니다.\r
    - 회전된 이미지의 키포인트 좌표가 변하더라도 비슷한 객체 부위에 분포해야 합니다.\r
  check:\r
    noError: 회전과 추출이 오류 없이 끝나야 합니다.\r
    resultCheck: len(kpRot) 가 0보다 커야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 키포인트 비교 분석\r
  goal: 두 이미지에서 키포인트를 추출하고 강도(response) 분포를 비교합니다.\r
  why: response 분포는 검출의 품질을 객관적으로 보여 줍니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 키포인트 list comprehension은 [k.response for k in keypoints] 같이 단순합니다.\r
  snippet: |-\r
    flower = load_sample_image('flower.jpg')\r
    flowerGray = cv2.cvtColor(flower, cv2.COLOR_RGB2GRAY)\r
    kpFlower, descFlower = orb.detectAndCompute(flowerGray, mask=None)\r
\r
    responses = np.array([point.response for point in kp])\r
    responses.shape, responses.mean(), responses.max()\r
  exercise:\r
    prompt: "미션1: china와 flower의 키포인트 response 분포를 같은 차트에 히스토그램으로 비교하세요. 미션2: 응답이 가장 높은 상위 20개 키포인트를 빨강으로, 나머지를 회색으로 그린 china 시각화를 만드세요."\r
    starterCode: |-\r
      flowerResponses = np.array([point.response for point in kpFlower])\r
      fig = plt.figure(figsize=(7, 4))\r
      plt.hist(responses, bins=30, alpha=0.5, label='china')\r
      plt.hist(flowerResponses, bins=30, alpha=0.5, label='flower')\r
      plt.legend()\r
      plt.xlabel('response')\r
      plt.ylabel('count')\r
      fig\r
    hints:\r
    - "top20 = sorted(kp, key=lambda k: -k.response)[:20] 으로 상위 응답 키포인트를 얻을 수 있습니다."\r
    - scatter로 두 색을 따로 그리면 됩니다.\r
  check:\r
    noError: 응답 추출과 히스토그램이 오류 없이 끝나야 합니다.\r
    resultCheck: responses.shape 가 (len(kp),) 여야 합니다.\r
`;export{e as default};