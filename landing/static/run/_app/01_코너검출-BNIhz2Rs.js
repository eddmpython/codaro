var e=`meta:\r
  id: visionFeatures_01\r
  title: 코너 검출\r
  order: 1\r
  category: visionFeatures\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  - scikit-learn\r
  tags:\r
  - opencv\r
  - 코너\r
  - Harris\r
  - goodFeaturesToTrack\r
  - 특징점\r
  seo:\r
    title: 비전 특징점 - 코너 검출\r
    description: Harris와 goodFeaturesToTrack으로 이미지의 코너점을 찾고 시각화합니다.\r
    keywords:\r
    - 코너검출\r
    - Harris\r
    - goodFeaturesToTrack\r
    - 특징점\r
    - opencv\r
intro:\r
  emoji: 📍\r
  goal: 이미지에서 두드러진 코너점을 자동으로 찾는 두 가지 방법을 익힙니다.\r
  description: |-\r
    매칭, 트래킹, 호모그래피 추정 - 거의 모든 비전 응용은 "이미지에서 두드러진 점들"이라는 입력에서 시작합니다. 이 강의는 가장 고전적이고 빠른 두 가지 코너 검출기를 비교하며 특징점이라는 개념을 이해합니다.\r
  direction: Harris와 goodFeaturesToTrack 으로 같은 이미지의 코너를 찾고 매개변수 조정의 영향을 확인합니다.\r
  benefits:\r
  - Harris 코너 점수와 그 의미를 이해합니다.\r
  - goodFeaturesToTrack의 minDistance, qualityLevel 매개변수를 조정할 수 있습니다.\r
  - 두 검출기의 결과를 같은 화면에 시각화해 비교할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 회색 이미지 준비\r
      detail: 코너 검출의 입력은 흑백입니다.\r
    - label: 2단계. Harris 코너 점수\r
      detail: 픽셀별 코너 정도를 계산합니다.\r
    - label: 3단계. goodFeaturesToTrack\r
      detail: 최적화된 코너 N개를 직접 받습니다.\r
    - label: 4단계. 결과 시각화\r
      detail: 원본 위에 코너를 점으로 표시합니다.\r
    - label: 5단계. 매개변수 비교\r
      detail: qualityLevel과 minDistance를 바꿔 봅니다.\r
    runtime:\r
    - label: 비전 환경\r
      detail: opencv-python, numpy, matplotlib, scikit-learn 으로 학습합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: gray_input\r
  title: 1단계. 회색 이미지 준비\r
  structuredPrimary: true\r
  subtitle: 코너 검출의 표준 입력\r
  goal: 컬러 이미지를 그레이로 변환해 코너 검출의 입력을 만듭니다.\r
  why: 코너 검출은 밝기 변화를 기준으로 동작하므로 색 정보가 필요 없습니다.\r
  explanation: |-\r
    \`cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)\` 가 표준 변환입니다. sklearn 이미지는 RGB이므로 RGB2GRAY 코드를 사용합니다.\r
\r
    Harris와 goodFeaturesToTrack 모두 그레이 이미지를 입력으로 받습니다. 컬러를 그대로 넣으면 잘못된 결과가 나옵니다.\r
  tips:\r
  - OpenCV의 색공간 변환 상수는 입력 → 출력 형식입니다. RGB2GRAY는 RGB 입력에서 그레이 출력이라는 의미입니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    china = load_sample_image('china.jpg')\r
    gray = cv2.cvtColor(china, cv2.COLOR_RGB2GRAY)\r
    gray.shape, gray.dtype\r
  exercise:\r
    prompt: flower 이미지도 같은 방식으로 그레이로 만들고 shape을 확인하세요.\r
    starterCode: |-\r
      flower = load_sample_image('flower.jpg')\r
      flowerGray = cv2.cvtColor(flower, ___)\r
      flowerGray.shape\r
    hints:\r
    - 빈칸에는 cv2.COLOR_RGB2GRAY가 들어갑니다.\r
    - 결과는 2차원 ndarray가 됩니다.\r
  check:\r
    noError: 색공간 변환이 오류 없이 끝나야 합니다.\r
    resultCheck: gray.ndim 이 2이고 dtype이 uint8이어야 합니다.\r
- id: harris\r
  title: 2단계. Harris 코너 점수\r
  structuredPrimary: true\r
  subtitle: 픽셀별 코너 정도\r
  goal: cv2.cornerHarris로 모든 픽셀의 코너 점수를 한 번에 계산합니다.\r
  why: Harris는 코너 검출의 원조 알고리즘이며 내부 동작이 직관적입니다.\r
  explanation: |-\r
    \`cv2.cornerHarris(gray, blockSize, ksize, k)\` 는 각 픽셀의 Harris 응답값을 계산합니다. blockSize는 코너를 검출할 이웃 크기, ksize는 미분 커널 크기, k는 식의 가중치(보통 0.04)입니다.\r
\r
    출력 값이 큰 위치가 코너입니다. 단순히 임곗값으로 마스크를 만들면 코너 영역이 보입니다.\r
  tips:\r
  - Harris 응답은 픽셀별 점수일 뿐 좌표 리스트가 아닙니다. 좌표가 필요하면 numpy where로 추출하거나 goodFeaturesToTrack을 씁니다.\r
  snippet: |-\r
    harrisResponse = cv2.cornerHarris(gray, blockSize=2, ksize=3, k=0.04)\r
    harrisResponse.shape, harrisResponse.dtype, harrisResponse.max()\r
  exercise:\r
    prompt: Harris 응답 중 상위 0.5% 영역만 보이는 마스크 harrisMask를 만드세요(percentile 99.5 기준).\r
    starterCode: |-\r
      thresh = np.percentile(harrisResponse, ___)\r
      harrisMask = (harrisResponse > thresh).astype(np.uint8) * 255\r
      harrisMask.sum() / 255\r
    hints:\r
    - 상위 0.5% 는 percentile 99.5 입니다.\r
    - sum / 255 는 마스크에 포함된 픽셀 개수입니다.\r
  check:\r
    noError: cornerHarris와 percentile이 오류 없이 끝나야 합니다.\r
    resultCheck: harrisResponse가 (높이, 너비) shape의 float 배열이어야 합니다.\r
- id: good_features\r
  title: 3단계. goodFeaturesToTrack\r
  structuredPrimary: true\r
  subtitle: 최적화된 코너 N개\r
  goal: cv2.goodFeaturesToTrack으로 코너 N개의 좌표를 직접 받습니다.\r
  why: Harris와 달리 좌표 리스트를 바로 받을 수 있어 매칭이나 트래킹 입력으로 쓰기 편합니다.\r
  explanation: |-\r
    \`cv2.goodFeaturesToTrack(gray, maxCorners, qualityLevel, minDistance)\` 는 강한 코너 N개를 (N, 1, 2) 모양의 float32 배열로 반환합니다. 각 점은 \`[x, y]\` 입니다.\r
\r
    qualityLevel은 0~1의 상대 임곗값이고 minDistance는 코너 사이 최소 거리입니다. 결과 형식이 OpenCV의 다른 함수(cv2.calcOpticalFlowPyrLK)와 호환되어 트래킹에 그대로 들어갑니다.\r
  tips:\r
  - 좌표 형식이 (N, 1, 2)인 점에 주의하세요. 일반 좌표 (N, 2)로 쓰려면 .reshape(-1, 2)로 변환합니다.\r
  snippet: |-\r
    corners = cv2.goodFeaturesToTrack(gray, maxCorners=100, qualityLevel=0.01, minDistance=10)\r
    corners.shape, corners.dtype\r
  exercise:\r
    prompt: maxCorners를 30, qualityLevel을 0.05로 바꿔 더 강한 코너만 얻은 strongCorners를 만드세요.\r
    starterCode: |-\r
      strongCorners = cv2.goodFeaturesToTrack(gray, maxCorners=___, qualityLevel=___, minDistance=10)\r
      strongCorners.shape\r
    hints:\r
    - qualityLevel을 높이면 약한 코너가 걸러져 코너 수가 줄어듭니다.\r
    - shape의 첫 번째 차원이 줄어든 코너 개수입니다.\r
  check:\r
    noError: goodFeaturesToTrack 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: corners.shape의 마지막 차원이 2여야 합니다.\r
- id: draw_corners\r
  title: 4단계. 코너 시각화\r
  structuredPrimary: true\r
  subtitle: 원본 위에 점 표시\r
  goal: 검출한 코너 좌표를 원본 이미지 위에 그립니다.\r
  why: 검출 품질은 그림으로 봐야 빠르게 판단됩니다.\r
  explanation: |-\r
    matplotlib의 \`scatter\` 로 코너 좌표를 점으로 그립니다. 각 점은 (x, y) 순이며 scatter 인자도 (x, y) 입니다. numpy 인덱스 (y, x) 와 헷갈리지 말아야 합니다.\r
\r
    OpenCV의 \`cv2.circle(img, (x, y), radius, color, thickness)\` 로 이미지에 직접 그릴 수도 있지만, 시각화만 한다면 matplotlib이 더 간단합니다.\r
  tips:\r
  - scatter의 s 인자는 점 크기, c 인자는 색상입니다.\r
  snippet: |-\r
    points = corners.reshape(-1, 2)\r
    fig = plt.figure(figsize=(7, 5))\r
    plt.imshow(china)\r
    plt.scatter(points[:, 0], points[:, 1], s=15, c='lime', edgecolors='black')\r
    plt.title(f'{len(points)} corners')\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: strongCorners를 빨강으로 그리고 일반 corners를 노랑으로 그려 한 화면에 비교하세요.\r
    starterCode: |-\r
      strongPoints = strongCorners.reshape(-1, 2)\r
      fig2 = plt.figure(figsize=(7, 5))\r
      plt.imshow(china)\r
      plt.scatter(points[:, 0], points[:, 1], s=10, c='yellow')\r
      plt.scatter(strongPoints[:, 0], strongPoints[:, 1], s=30, c='___')\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 강한 코너가 약한 코너 위에 더 큰 점으로 보여야 비교가 쉽습니다.\r
    - 색 문자열은 'red'입니다.\r
  check:\r
    noError: scatter 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.\r
- id: tune\r
  title: 5단계. 매개변수 튜닝\r
  structuredPrimary: true\r
  subtitle: minDistance가 만드는 분포 차이\r
  goal: minDistance 매개변수가 코너 분포에 미치는 영향을 직접 비교합니다.\r
  why: minDistance를 작게 두면 한 영역에 점이 몰리고, 크게 두면 흩어집니다. 응용에 따라 적절히 골라야 합니다.\r
  explanation: |-\r
    minDistance가 5인 검출은 강한 영역에 점이 몰립니다. 50으로 두면 균등 분포에 가깝게 흩어집니다. 트래킹용으로는 흩어진 코너가 좋고, 강한 매칭용으로는 몰린 코너가 유리합니다.\r
  tips:\r
  - 매개변수 비교는 항상 같은 이미지로, 한 변수만 바꿔서 해야 효과가 분명히 보입니다.\r
  snippet: |-\r
    closeCorners = cv2.goodFeaturesToTrack(gray, maxCorners=100, qualityLevel=0.01, minDistance=5)\r
    farCorners = cv2.goodFeaturesToTrack(gray, maxCorners=100, qualityLevel=0.01, minDistance=50)\r
    closeCorners.shape, farCorners.shape\r
  exercise:\r
    prompt: 두 결과를 1x2 서브플롯으로 나란히 그리고 점 개수를 타이틀에 표시하세요.\r
    starterCode: |-\r
      fig, axes = plt.subplots(1, 2, figsize=(12, 5))\r
      for axis, label, pts in zip(axes, ['min=5', 'min=50'], [closeCorners, farCorners]):\r
          arr = pts.reshape(___, 2)\r
          axis.imshow(china)\r
          axis.scatter(arr[:, 0], arr[:, 1], s=20, c='cyan', edgecolors='black')\r
          axis.set_title(f'{label} ({len(arr)})')\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - reshape(-1, 2) 가 표준 패턴입니다.\r
    - 작은 minDistance에서 점이 강한 영역에 몰립니다.\r
  check:\r
    noError: 두 호출과 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: farCorners의 점 개수가 closeCorners보다 같거나 적어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 코너 검출 비교 보고서\r
  goal: 두 이미지의 코너를 검출해 비교 보고서를 만듭니다.\r
  why: 같은 알고리즘이 다른 이미지에서 어떻게 다른지 보면 알고리즘의 한계와 강점이 보입니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 실험 코드를 만들 때는 매개변수를 한 곳에 모아 두면 다른 미션에서 재사용이 쉬워집니다.\r
  snippet: |-\r
    flower = load_sample_image('flower.jpg')\r
    chinaCorners = cv2.goodFeaturesToTrack(gray, maxCorners=80, qualityLevel=0.02, minDistance=15)\r
    flowerGray = cv2.cvtColor(flower, cv2.COLOR_RGB2GRAY)\r
    flowerCorners = cv2.goodFeaturesToTrack(flowerGray, maxCorners=80, qualityLevel=0.02, minDistance=15)\r
    chinaCorners.shape, flowerCorners.shape\r
  exercise:\r
    prompt: "미션1: china와 flower의 코너를 1x2 그리드로 그리고 각 사진의 점 개수를 타이틀에 표시하세요. 미션2: china를 90도 회전한 rotated 이미지(np.rot90)에 같은 매개변수를 적용해 코너 수가 비슷한지 비교하세요."\r
    starterCode: |-\r
      fig, axes = plt.subplots(1, 2, figsize=(12, 5))\r
      for axis, label, baseImg, baseGray, pts in [\r
          (axes[0], 'china', china, gray, chinaCorners),\r
          (axes[1], 'flower', flower, flowerGray, flowerCorners),\r
      ]:\r
          arr = pts.reshape(-1, 2)\r
          axis.imshow(baseImg)\r
          axis.scatter(arr[:, 0], arr[:, 1], s=18, c='magenta', edgecolors='black')\r
          axis.set_title(f'{label} ({len(arr)})')\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - np.rot90으로 90도 회전된 이미지에서 코너가 비슷한 위치(상대적으로)에 나오는지 확인하세요.\r
    - 회전 후 좌표는 변환되지만 코너의 강도는 비슷합니다.\r
  check:\r
    noError: 두 호출과 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: 두 결과 모두 0개 이상의 코너가 검출되어야 합니다.\r
`;export{e as default};