var e=`meta:\r
  id: visionBasics_08\r
  title: 마스크 사고\r
  order: 8\r
  category: visionBasics\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - scikit-learn\r
  tags:\r
  - numpy\r
  - 마스크\r
  - bool배열\r
  - where\r
  - 합성\r
  seo:\r
    title: 이미지 비전 기초 - 마스크 사고\r
    description: bool 배열을 마스크로 써서 영역별 처리, 합성, 색 추출을 한 줄로 다룹니다.\r
    keywords:\r
    - 마스크\r
    - bool배열\r
    - numpy\r
    - where\r
    - 합성\r
intro:\r
  emoji: 🎭\r
  goal: bool 배열을 이미지 처리의 일등 시민으로 다루는 사고 패턴을 익힙니다.\r
  description: |-\r
    "특정 색만 남기고 나머지는 검정으로", "관심 영역만 어둡게", "두 사진을 마스크 모양대로 섞기" - 이 모든 작업은 마스크 한 장이면 충분합니다. 이 강의는 bool 배열을 만드는 다양한 방법과, 마스크로 이미지를 자르고 합치는 패턴을 정리합니다.\r
  direction: bool 배열을 만들고 적용하며 이미지 처리에서 마스크가 가장 자주 쓰이는 도구라는 점을 체화합니다.\r
  benefits:\r
  - 조건식 한 줄로 마스크를 만들 수 있습니다.\r
  - np.where와 마스크 인덱싱의 차이를 이해하고 적재적소에 씁니다.\r
  - 두 이미지를 마스크 모양대로 합성할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 조건으로 마스크 만들기\r
      detail: 부등식 한 줄로 bool 배열을 얻습니다.\r
    - label: 2단계. 마스크로 픽셀 골라내기\r
      detail: 마스크가 True인 픽셀만 가져옵니다.\r
    - label: 3단계. 마스크에 값 대입\r
      detail: 마스크 영역만 값으로 바꿉니다.\r
    - label: 4단계. np.where 합성\r
      detail: 조건에 따라 두 이미지를 섞습니다.\r
    - label: 5단계. 도형 마스크\r
      detail: 원·사각형 마스크를 직접 그립니다.\r
    runtime:\r
    - label: numpy 환경\r
      detail: numpy의 bool 연산과 인덱싱이 학습 핵심입니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: condition_mask\r
  title: 1단계. 조건으로 마스크 만들기\r
  structuredPrimary: true\r
  subtitle: 부등식이 곧 bool 배열\r
  goal: 이미지에 부등식을 적용해 마스크 한 장을 만듭니다.\r
  why: 마스크의 출발은 조건식입니다. 한 줄로 만들 수 있다는 사실이 가장 중요합니다.\r
  explanation: |-\r
    \`img > 100\` 같은 부등식은 같은 모양의 bool 배열을 만듭니다. 컬러 이미지에 직접 적용하면 채널별로 비교가 일어나 결과도 컬러 모양 bool 배열이 됩니다. 보통은 흑백 변환 후 부등식을 적용합니다.\r
\r
    여러 조건을 조합할 때는 \`&\`(and), \`|\`(or), \`~\`(not) 을 사용합니다. 파이썬의 \`and\`, \`or\` 가 아니라 비트 연산자임에 주의합니다.\r
  tips:\r
  - bool 배열의 sum은 True 개수, mean은 True 비율입니다. 마스크 통계로 즉시 활용할 수 있습니다.\r
  snippet: |-\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    china = load_sample_image('china.jpg')\r
    gray = (china.astype(np.float32) * np.array([0.299, 0.587, 0.114])).sum(axis=2).astype(np.uint8)\r
    brightMask = gray > 180\r
    brightMask.sum(), brightMask.mean()\r
  exercise:\r
    prompt: 어두운 픽셀 마스크 darkMask를 만드세요(gray < 60).\r
    starterCode: |-\r
      darkMask = gray ___ 60\r
      darkMask.sum()\r
    hints:\r
    - "<는 미만, <=는 이하입니다."\r
    - 어두운 픽셀이 적을수록 결과가 작습니다.\r
  check:\r
    noError: 부등식과 sum이 오류 없이 끝나야 합니다.\r
    resultCheck: darkMask가 (높이, 너비) shape의 bool 배열이어야 합니다.\r
- id: mask_select\r
  title: 2단계. 마스크로 픽셀 골라내기\r
  structuredPrimary: true\r
  subtitle: 1차원으로 펴진 픽셀 모음\r
  goal: 마스크로 True인 위치의 픽셀만 모아 새 배열로 만듭니다.\r
  why: 통계나 분포 분석을 할 때는 위치보다 값들 자체가 중요할 때가 많습니다.\r
  explanation: |-\r
    \`gray[brightMask]\` 는 True 위치의 픽셀들을 1차원 배열로 펴서 반환합니다. 이미지의 위치 정보는 사라지지만, 값들의 평균·표준편차·히스토그램 계산이 쉬워집니다.\r
\r
    컬러 이미지에 같은 마스크를 적용하면 결과는 \`(픽셀 개수, 3)\` 모양이 됩니다.\r
  tips:\r
  - 위치 정보가 필요하면 np.where(mask) 가 행과 열 인덱스 두 배열을 돌려줍니다.\r
  snippet: |-\r
    brightPixels = gray[brightMask]\r
    brightPixels.shape, brightPixels.mean()\r
  exercise:\r
    prompt: 밝은 영역에 해당하는 컬러 픽셀 brightColors를 china에서 추출하고 RGB 평균을 구하세요.\r
    starterCode: |-\r
      brightColors = china[___]\r
      brightColors.shape, brightColors.mean(axis=0)\r
    hints:\r
    - 컬러 이미지에 같은 bool 마스크를 그대로 적용해도 됩니다.\r
    - 결과 shape이 (N, 3)이 됩니다.\r
  check:\r
    noError: 마스크 인덱싱이 오류 없이 끝나야 합니다.\r
    resultCheck: brightColors.shape의 마지막 차원이 3이어야 합니다.\r
- id: mask_assign\r
  title: 3단계. 마스크 영역만 값 대입\r
  structuredPrimary: true\r
  subtitle: 특정 영역만 다른 색으로\r
  goal: 마스크가 True인 픽셀에만 새 값을 대입합니다.\r
  why: 영역별 강조, 마스킹 인페인팅, 한 색만 바꾸기 등의 작업이 모두 이 한 줄입니다.\r
  explanation: |-\r
    \`img[mask] = [R, G, B]\` 는 True 위치의 픽셀을 한 색으로 채웁니다. 마스크가 bool 배열이어야 하고, 대입할 값의 shape이 호환되어야 합니다.\r
\r
    원본 보존이 필요하면 항상 .copy()를 먼저 호출합니다.\r
  tips:\r
  - 마스크 대입은 in-place 연산이므로 매우 빠릅니다. 같은 일을 for문으로 하면 수십 배 느립니다.\r
  snippet: |-\r
    highlight = china.copy()\r
    highlight[brightMask] = [255, 0, 255]\r
    fig = plt.figure(figsize=(5, 4))\r
    plt.imshow(highlight)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 어두운 영역을 노란색([255, 220, 0])으로 강조한 darkHighlight를 만드세요.\r
    starterCode: |-\r
      darkHighlight = china.copy()\r
      darkHighlight[darkMask] = [___, ___, ___]\r
      fig2 = plt.figure(figsize=(5, 4))\r
      plt.imshow(darkHighlight)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 노란색은 빨강과 녹색이 큰 값입니다.\r
    - darkMask는 1단계에서 만든 마스크입니다.\r
  check:\r
    noError: 대입과 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: darkHighlight[darkMask][0] 이 [255, 220, 0]이어야 합니다.\r
- id: where_blend\r
  title: 4단계. np.where로 두 이미지 합성\r
  structuredPrimary: true\r
  subtitle: 조건에 따라 다른 픽셀을 고른다\r
  goal: 마스크 위치에 따라 두 이미지 중 하나의 픽셀을 골라 새 이미지를 만듭니다.\r
  why: 마스크 모양 그대로 합성하는 패턴은 그린스크린, 합성 사진, 마스크 인페인팅 등에서 표준입니다.\r
  explanation: |-\r
    \`np.where(mask, a, b)\` 는 마스크가 True면 a, False면 b의 값을 선택합니다. 마스크가 2차원이고 이미지가 3차원이면 broadcasting을 위해 \`mask[:, :, None]\` 으로 마지막 축을 추가해야 합니다.\r
\r
    이 한 줄이 두 이미지의 부드러운 합성을 구현합니다. 알파 합성과 다른 점은 마스크가 0/1 두 값만 갖는다는 것입니다.\r
  tips:\r
  - "mask[:, :, None] 으로 차원을 늘리면 RGB 채널에 자연스럽게 broadcast됩니다."\r
  snippet: |-\r
    flower = load_sample_image('flower.jpg')\r
    h = min(china.shape[0], flower.shape[0])\r
    w = min(china.shape[1], flower.shape[1])\r
    chinaCut = china[:h, :w]\r
    flowerCut = flower[:h, :w]\r
    grayCut = gray[:h, :w]\r
    blendedMask = grayCut > 180\r
    blended = np.where(blendedMask[:, :, None], chinaCut, flowerCut)\r
    fig = plt.figure(figsize=(6, 4))\r
    plt.imshow(blended)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 마스크 조건을 grayCut < 60 로 바꿔 어두운 영역에서 china가 보이도록 합성하세요.\r
    starterCode: |-\r
      reverseMask = grayCut ___ 60\r
      reverseBlend = np.where(reverseMask[:, :, None], chinaCut, flowerCut)\r
      fig2 = plt.figure(figsize=(6, 4))\r
      plt.imshow(reverseBlend)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 부등호만 바꾸면 됩니다.\r
    - 결과는 합성의 방향이 뒤집힙니다.\r
  check:\r
    noError: np.where와 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: blended.shape이 (h, w, 3)이어야 합니다.\r
- id: shape_mask\r
  title: 5단계. 도형 마스크 만들기\r
  structuredPrimary: true\r
  subtitle: 원과 사각형\r
  goal: 좌표 격자로 원·사각형 마스크를 직접 그립니다.\r
  why: 도형 마스크는 비네팅, 비주얼 효과, 관심 영역 강조 등에 자주 쓰입니다.\r
  explanation: |-\r
    \`np.indices((h, w))\` 또는 \`np.mgrid[:h, :w]\` 는 각 픽셀의 (y, x) 좌표 격자를 만들어 줍니다. 이 격자를 이용해 거리 식으로 원 마스크, 부등식 두 개로 사각형 마스크를 만듭니다.\r
\r
    원 마스크: \`(yy - cy) ** 2 + (xx - cx) ** 2 < r ** 2\`\r
  tips:\r
  - 도형 마스크와 색 마스크를 & 연산자로 결합하면 "특정 영역의 특정 색"이라는 정밀한 조건도 만들 수 있습니다.\r
  snippet: |-\r
    yy, xx = np.mgrid[:h, :w]\r
    cy, cx = h // 2, w // 2\r
    radius = min(h, w) // 4\r
    circleMask = (yy - cy) ** 2 + (xx - cx) ** 2 < radius ** 2\r
    vignette = np.where(circleMask[:, :, None], chinaCut, [0, 0, 0])\r
    fig = plt.figure(figsize=(6, 4))\r
    plt.imshow(vignette)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 정중앙에 200x200 정사각형 마스크 squareMask를 만들어 그 영역만 chinaCut, 나머지는 검정인 frame을 만드세요.\r
    starterCode: |-\r
      squareMask = (np.abs(yy - cy) < ___) & (np.abs(xx - cx) < ___)\r
      frame = np.where(squareMask[:, :, None], chinaCut, [0, 0, 0])\r
      fig2 = plt.figure(figsize=(6, 4))\r
      plt.imshow(frame)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 정사각형 한 변의 절반이 빈칸 두 개에 같이 들어갑니다.\r
    - 200x200 정사각형이면 절반이 100입니다.\r
  check:\r
    noError: 마스크 생성과 합성이 오류 없이 끝나야 합니다.\r
    resultCheck: squareMask가 (h, w) shape의 bool 배열이어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 마스크 조합 실험\r
  goal: 색·위치 마스크를 조합한 합성과 비네팅을 직접 만듭니다.\r
  why: 마스크 두세 개를 조합하면 단순 조건으로는 표현 못 하는 영역을 한 줄로 그릴 수 있습니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 비네팅 효과는 마스크 가장자리를 부드럽게 만드는 가우시안과 함께 쓰는 것이 보통이지만, 이 트랙에서는 단순한 원 마스크로 시작합니다.\r
  snippet: |-\r
    band = (np.abs(yy - cy) < h // 6)\r
    bandOnly = np.where(band[:, :, None], chinaCut, [30, 30, 30])\r
    fig = plt.figure(figsize=(6, 4))\r
    plt.imshow(bandOnly)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: "미션1: chinaCut의 밝은 영역(gray > 180) 이면서 동시에 중앙 원 안에 있는 픽셀만 [255, 255, 255]로 표시하고 나머지는 chinaCut 원본을 그대로 두는 spotlight를 만드세요. 미션2: 중심에서 거리 d를 계산해 알파 = (1 - d / d_max)^2 로 만든 부드러운 vignetteSoft 이미지를 만드세요(클립으로 0~1 범위)."\r
    starterCode: |-\r
      colorMask = grayCut > 180\r
      combined = colorMask & circleMask\r
      spotlight = chinaCut.copy()\r
      spotlight[combined] = [255, 255, 255]\r
      spotFig = plt.figure(figsize=(6, 4))\r
      plt.imshow(spotlight)\r
      plt.axis('off')\r
      spotFig\r
    hints:\r
    - 마스크 두 개의 AND는 & 연산자입니다.\r
    - vignetteSoft는 거리 격자를 정규화한 뒤 (1 - d) ** 2 로 만들면 됩니다.\r
  check:\r
    noError: 두 마스크 결합과 대입이 오류 없이 끝나야 합니다.\r
    resultCheck: combined가 (h, w) shape의 bool 배열이어야 합니다.\r
`;export{e as default};