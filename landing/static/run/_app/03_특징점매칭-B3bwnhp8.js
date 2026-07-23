var e=`meta:\r
  id: visionFeatures_03\r
  title: 특징점 매칭\r
  order: 3\r
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
  - 매칭\r
  - BFMatcher\r
  - knnMatch\r
  - Lowe\r
  seo:\r
    title: 비전 특징점 - 특징점 매칭\r
    description: BFMatcher와 Lowe ratio test로 두 사진의 같은 점을 짝지웁니다.\r
    keywords:\r
    - 특징점매칭\r
    - BFMatcher\r
    - knnMatch\r
    - Lowe\r
    - opencv\r
intro:\r
  emoji: 🔗\r
  goal: 두 사진의 같은 부위를 잇는 매칭 한 줄을 익히고 Lowe 비율 테스트로 잘못된 매칭을 거릅니다.\r
  description: |-\r
    같은 풍경을 다른 각도에서 찍은 두 사진의 같은 점을 짝짓는 것이 특징점 매칭입니다. 이 강의는 ORB 디스크립터를 이용해 두 이미지 간 매칭을 수행하고, Lowe ratio test로 잘못된 매칭을 자동으로 제거하는 표준 패턴을 학습합니다.\r
  direction: 두 이미지에서 ORB 디스크립터를 추출하고 매칭, 정렬, 필터링까지의 흐름을 한 셀씩 실행합니다.\r
  benefits:\r
  - cv2.BFMatcher의 match와 knnMatch 차이를 이해합니다.\r
  - Lowe ratio test로 잘못된 매칭을 자동으로 거릅니다.\r
  - cv2.drawMatches로 매칭 결과를 시각적으로 검증할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 매칭용 이미지 쌍 만들기\r
      detail: 같은 사진을 살짝 다른 변환으로 두 장 준비합니다.\r
    - label: 2단계. BFMatcher로 1대1 매칭\r
      detail: match 한 번에 최근접 짝을 얻습니다.\r
    - label: 3단계. 거리 기반 정렬과 시각화\r
      detail: 짧은 거리 매칭부터 그립니다.\r
    - label: 4단계. knnMatch와 Lowe ratio\r
      detail: 1, 2위 매칭의 비율로 잘못된 짝을 거릅니다.\r
    - label: 5단계. 매칭 통계\r
      detail: 매칭 개수와 거리 분포를 정리합니다.\r
    runtime:\r
    - label: 비전 환경\r
      detail: opencv-python ORB와 BFMatcher만으로 학습합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: prepare_pair\r
  title: 1단계. 매칭용 이미지 쌍 만들기\r
  structuredPrimary: true\r
  subtitle: 합성으로 변환 쌍 만들기\r
  goal: 같은 이미지에 살짝 다른 변환을 적용해 매칭 학습용 쌍을 만듭니다.\r
  why: 실험을 통제하려면 알려진 변환을 적용한 이미지 쌍이 가장 깔끔합니다.\r
  explanation: |-\r
    원본과, 원본을 15도 회전하고 평행 이동한 두 번째 이미지를 만듭니다. \`cv2.getRotationMatrix2D\` + \`cv2.warpAffine\` 한 줄이면 됩니다.\r
\r
    이렇게 만든 쌍은 정답(true 변환)을 우리가 알고 있으므로, 매칭이 얼마나 정확한지 검증하기 좋습니다.\r
  tips:\r
  - 회전 각도와 이동량을 너무 크게 잡으면 ORB가 같은 부위를 찾지 못합니다. 15도 정도가 학습용으로 적당합니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    china = load_sample_image('china.jpg')\r
    h, w = china.shape[:2]\r
    rotMat = cv2.getRotationMatrix2D((w / 2, h / 2), angle=15, scale=1.0)\r
    rotMat[:, 2] += [20, -10]\r
    warped = cv2.warpAffine(china, rotMat, (w, h))\r
    warped.shape\r
  exercise:\r
    prompt: 회전 각도를 30도로 바꾼 hardWarped를 만들고 두 이미지를 1x2 그리드로 비교 출력하세요.\r
    starterCode: |-\r
      hardMat = cv2.getRotationMatrix2D((w / 2, h / 2), angle=___, scale=1.0)\r
      hardWarped = cv2.warpAffine(china, hardMat, (w, h))\r
      fig, axes = plt.subplots(1, 2, figsize=(12, 5))\r
      axes[0].imshow(china)\r
      axes[0].set_title('original')\r
      axes[1].imshow(hardWarped)\r
      axes[1].set_title('rotated 30')\r
      for axis in axes:\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - 빈칸은 정수입니다.\r
    - 회전 각이 크면 가장자리에 검정 영역이 더 많이 생깁니다.\r
  check:\r
    noError: warpAffine과 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: warped.shape 이 china.shape 와 같아야 합니다.\r
- id: brute_force_match\r
  title: 2단계. BFMatcher로 1대1 매칭\r
  structuredPrimary: true\r
  subtitle: 가장 단순한 매칭기\r
  goal: cv2.BFMatcher의 match로 모든 키포인트에 대해 가장 가까운 짝을 찾습니다.\r
  why: 매칭 알고리즘의 기준선이며 동작이 직관적이라 결과 해석이 쉽습니다.\r
  explanation: |-\r
    \`cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)\` 는 ORB 디스크립터에 적합한 매칭기입니다. NORM_HAMMING은 비트 차이 거리이고 crossCheck=True는 양방향으로 최근접인 짝만 받아 잘못된 매칭을 줄입니다.\r
\r
    \`match(desc1, desc2)\` 는 \`cv2.DMatch\` 객체 리스트를 반환합니다. 각 객체는 \`.queryIdx\`, \`.trainIdx\`, \`.distance\` 를 가집니다.\r
  tips:\r
  - 거리가 작을수록 좋은 매칭입니다. distance 정렬로 상위 N개만 사용하는 패턴이 자주 쓰입니다.\r
  snippet: |-\r
    orb = cv2.ORB_create(nfeatures=500)\r
    grayA = cv2.cvtColor(china, cv2.COLOR_RGB2GRAY)\r
    grayB = cv2.cvtColor(warped, cv2.COLOR_RGB2GRAY)\r
    kpA, descA = orb.detectAndCompute(grayA, mask=None)\r
    kpB, descB = orb.detectAndCompute(grayB, mask=None)\r
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)\r
    matches = bf.match(descA, descB)\r
    len(matches), matches[0].distance\r
  exercise:\r
    prompt: hardWarped와 china의 매칭 hardMatches를 같은 방식으로 만들고 매칭 개수를 비교하세요.\r
    starterCode: |-\r
      grayHard = cv2.cvtColor(hardWarped, ___)\r
      kpHard, descHard = orb.detectAndCompute(grayHard, mask=None)\r
      hardMatches = bf.match(descA, descHard)\r
      len(matches), len(___)\r
    hints:\r
    - 변환이 클수록 매칭이 줄어듭니다.\r
    - 빈칸은 변수명입니다.\r
  check:\r
    noError: BFMatcher.match가 오류 없이 끝나야 합니다.\r
    resultCheck: len(matches) 가 0보다 커야 합니다.\r
- id: sort_and_draw\r
  title: 3단계. 거리 정렬과 시각화\r
  structuredPrimary: true\r
  subtitle: 가장 좋은 N개 보기\r
  goal: 매칭을 distance로 정렬한 뒤 상위 N개를 cv2.drawMatches로 그립니다.\r
  why: 매칭의 품질은 보지 않고는 평가할 수 없습니다. 그림이 가장 빠른 검증입니다.\r
  explanation: |-\r
    매칭을 거리 오름차순으로 정렬한 뒤 \`cv2.drawMatches(imgA, kpA, imgB, kpB, matches, None)\` 로 두 이미지를 가로로 붙여 짝을 선으로 잇습니다.\r
\r
    좋은 매칭은 두 이미지의 같은 객체 부위를 짧고 평행한 선들로 잇습니다. 선들이 무작위 방향이면 매칭이 잘못된 것입니다.\r
  tips:\r
  - drawMatches의 결과는 BGR이지만 imshow에서 컬러 차이가 미세해 시각화에 큰 영향은 없습니다.\r
  snippet: |-\r
    sortedMatches = sorted(matches, key=lambda m: m.distance)\r
    top = sortedMatches[:40]\r
    drawn = cv2.drawMatches(china, kpA, warped, kpB, top, None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)\r
    fig = plt.figure(figsize=(12, 5))\r
    plt.imshow(drawn)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 상위 100개와 하위 100개 매칭을 1x2 그리드로 시각화해 거리 차이가 시각적으로 어떻게 나타나는지 확인하세요.\r
    starterCode: |-\r
      drawnTop = cv2.drawMatches(china, kpA, warped, kpB, sortedMatches[:100], None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)\r
      drawnBottom = cv2.drawMatches(china, kpA, warped, kpB, sortedMatches[___:], None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)\r
      fig, axes = plt.subplots(2, 1, figsize=(12, 8))\r
      axes[0].imshow(drawnTop)\r
      axes[0].set_title('top 100')\r
      axes[1].imshow(drawnBottom)\r
      axes[1].set_title('bottom 100')\r
      for axis in axes:\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - "-100을 빈칸에 넣으면 하위 100개가 됩니다."\r
    - 하위 매칭은 선이 사방으로 흩어져 보입니다.\r
  check:\r
    noError: 정렬과 drawMatches가 오류 없이 끝나야 합니다.\r
    resultCheck: drawn.shape이 (높이, 너비*2 정도, 3) 형태여야 합니다.\r
- id: knn_lowe\r
  title: 4단계. knnMatch와 Lowe ratio\r
  structuredPrimary: true\r
  subtitle: 두 후보로 잘못된 매칭 거르기\r
  goal: knnMatch로 1위, 2위 후보를 동시에 받고 비율로 잘못된 매칭을 거릅니다.\r
  why: crossCheck보다 정밀하게 잘못된 매칭을 거를 수 있는 표준 패턴입니다.\r
  explanation: |-\r
    \`bf.knnMatch(descA, descB, k=2)\` 는 각 키포인트의 1위, 2위 매칭을 동시에 반환합니다. 두 거리 비가 \`m1.distance < 0.75 * m2.distance\` 면 1위가 충분히 두드러진 좋은 매칭이라고 판단합니다(Lowe ratio test).\r
\r
    임곗값 0.75는 D. Lowe의 SIFT 논문에서 제안된 값이며 ORB에도 흔히 그대로 씁니다.\r
  tips:\r
  - knnMatch와 ratio test는 영상 매칭 거의 모든 파이프라인에서 표준입니다.\r
  snippet: |-\r
    bfNoCross = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)\r
    knn = bfNoCross.knnMatch(descA, descB, k=2)\r
    goodPairs = [m1 for m1, m2 in knn if m1.distance < 0.75 * m2.distance]\r
    len(knn), len(goodPairs)\r
  exercise:\r
    prompt: 임곗값을 0.6과 0.9로 각각 적용해 골라진 매칭 수를 비교하세요.\r
    starterCode: |-\r
      strict = [m1 for m1, m2 in knn if m1.distance < ___ * m2.distance]\r
      loose = [m1 for m1, m2 in knn if m1.distance < ___ * m2.distance]\r
      len(strict), len(loose), len(goodPairs)\r
    hints:\r
    - 0.6은 엄격, 0.9는 느슨한 기준입니다.\r
    - 엄격할수록 좋은 매칭만 남아 개수가 줄어듭니다.\r
  check:\r
    noError: knnMatch와 비율 필터가 오류 없이 끝나야 합니다.\r
    resultCheck: len(strict) 가 len(loose) 보다 적어야 합니다.\r
- id: stats\r
  title: 5단계. 매칭 통계와 시각화\r
  structuredPrimary: true\r
  subtitle: 거리 분포 보기\r
  goal: 매칭 거리 분포를 히스토그램으로 그리고 좋은/나쁜 매칭의 경계를 시각화합니다.\r
  why: 매칭 거리 분포를 보면 다음 단계의 임곗값을 데이터 기반으로 정할 수 있습니다.\r
  explanation: |-\r
    매칭 거리는 보통 두 산을 가진 분포가 됩니다. 왼쪽 산은 좋은 매칭, 오른쪽 산은 잘못된 매칭입니다. 두 산 사이의 골이 자연스러운 임곗값 후보입니다.\r
  tips:\r
  - 분포가 한 산뿐이면 매칭이 거의 다 좋거나(쉬운 쌍) 거의 다 나쁘다(어려운 쌍)는 의미입니다.\r
  snippet: |-\r
    distances = np.array([m.distance for m in matches])\r
    fig = plt.figure(figsize=(7, 4))\r
    plt.hist(distances, bins=30, color='steelblue')\r
    plt.title('match distance distribution')\r
    plt.xlabel('hamming distance')\r
    plt.ylabel('count')\r
    fig\r
  exercise:\r
    prompt: 좋은 매칭(goodPairs)과 전체 매칭의 거리 분포를 같은 차트에 비교 출력하세요.\r
    starterCode: |-\r
      goodDistances = np.array([m.distance for m in goodPairs])\r
      fig2 = plt.figure(figsize=(7, 4))\r
      plt.hist(distances, bins=30, alpha=0.4, label='all', color='gray')\r
      plt.hist(goodDistances, bins=30, alpha=0.6, label='good', color='___')\r
      plt.legend()\r
      plt.xlabel('hamming distance')\r
      fig2\r
    hints:\r
    - "색은 'green' 정도가 무난합니다."\r
    - 좋은 매칭은 거리 분포의 왼쪽에 모여야 합니다.\r
  check:\r
    noError: 통계와 히스토그램이 오류 없이 끝나야 합니다.\r
    resultCheck: distances의 평균이 goodDistances의 평균보다 같거나 커야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 매칭 평가 비교\r
  goal: 두 변환(쉬움/어려움)에서 매칭 품질을 비교합니다.\r
  why: 같은 알고리즘이 변환 강도에 따라 얼마나 다른 결과를 내는지 확인하면 알고리즘의 적용 한계를 가늠하게 됩니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 비교 실험을 자주 만들수록 알고리즘을 제대로 선택할 수 있습니다.\r
  snippet: |-\r
    hardMat = cv2.getRotationMatrix2D((w / 2, h / 2), angle=30, scale=1.0)\r
    hardWarped = cv2.warpAffine(china, hardMat, (w, h))\r
    grayHard = cv2.cvtColor(hardWarped, cv2.COLOR_RGB2GRAY)\r
    kpHard, descHard = orb.detectAndCompute(grayHard, mask=None)\r
\r
    bfTest = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)\r
    easyKnn = bfTest.knnMatch(descA, descB, k=2)\r
    hardKnn = bfTest.knnMatch(descA, descHard, k=2)\r
    easyGood = [m1 for m1, m2 in easyKnn if m1.distance < 0.75 * m2.distance]\r
    hardGood = [m1 for m1, m2 in hardKnn if m1.distance < 0.75 * m2.distance]\r
    {"easy_good": len(easyGood), "hard_good": len(hardGood)}\r
  exercise:\r
    prompt: "미션1: 쉬운 변환과 어려운 변환의 매칭 결과를 1x2 그리드로 drawMatches 시각화하세요. 미션2: 좋은 매칭의 비율(좋은/전체) 을 두 변환에 대해 비교 출력하세요."\r
    starterCode: |-\r
      drawnEasy = cv2.drawMatches(china, kpA, warped, kpB, easyGood[:40], None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)\r
      drawnHard = cv2.drawMatches(china, kpA, hardWarped, kpHard, hardGood[:40], None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)\r
      fig, axes = plt.subplots(2, 1, figsize=(12, 8))\r
      axes[0].imshow(drawnEasy)\r
      axes[0].set_title('easy (15deg)')\r
      axes[1].imshow(drawnHard)\r
      axes[1].set_title('hard (30deg)')\r
      for axis in axes:\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - 어려운 변환에서 매칭이 줄어들고 선이 더 흩어집니다.\r
    - "비율은 len(good) / len(all_knn) 한 줄로 구합니다."\r
  check:\r
    noError: 두 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: len(easyGood)이 len(hardGood)보다 같거나 커야 합니다.\r
`;export{e as default};