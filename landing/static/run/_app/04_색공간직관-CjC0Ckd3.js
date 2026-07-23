var e=`meta:\r
  id: visionBasics_04\r
  title: 색공간 직관\r
  order: 4\r
  category: visionBasics\r
  difficulty: ⭐⭐\r
  badge: 입문\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - scikit-learn\r
  tags:\r
  - 색공간\r
  - RGB\r
  - HSV\r
  - Lab\r
  - 색상모델\r
  seo:\r
    title: 이미지 비전 기초 - 색공간 직관\r
    description: RGB, HSV, Lab 색공간이 각각 어떤 정보를 강조하는지 직접 변환하며 익힙니다.\r
    keywords:\r
    - 색공간\r
    - RGB\r
    - HSV\r
    - Lab\r
    - 색변환\r
intro:\r
  emoji: 🌈\r
  goal: RGB, HSV, Lab 세 색공간의 차이를 직접 변환하며 직관을 만듭니다.\r
  description: |-\r
    "노란 차 만 골라내고 싶다", "어두운 부분만 더 밝히고 싶다" 같은 작업은 RGB로는 까다롭지만 HSV에서는 한 줄입니다. 이 강의는 세 색공간의 정의를 짚고, 같은 사진을 세 가지 방식으로 표현해 어떤 작업에 어떤 색공간이 어울리는지 감각을 만듭니다.\r
  direction: 같은 사진을 RGB, HSV, Lab으로 변환하며 각 색공간이 강조하는 정보를 비교합니다.\r
  benefits:\r
  - 색상 필터링이 HSV에서 왜 쉬운지 코드로 확인할 수 있습니다.\r
  - 밝기·채도·색조라는 인간 친화적 축으로 사진을 분리할 수 있습니다.\r
  - Lab의 L 채널이 곧 밝기라는 점을 이용해 컬러 그림을 자연스럽게 흑백화할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. RGB의 한계\r
      detail: 빨간 꽃잎만 고르기를 RGB로 시도해 봅니다.\r
    - label: 2단계. matplotlib HSV 변환\r
      detail: rgb_to_hsv 한 줄로 HSV로 옮깁니다.\r
    - label: 3단계. 색상으로 마스킹\r
      detail: H 채널의 범위로 특정 색만 골라냅니다.\r
    - label: 4단계. Lab로 밝기 분리\r
      detail: skimage 없이 직접 Lab 근사값으로 L 채널을 만듭니다.\r
    - label: 5단계. 세 색공간 한눈에 비교\r
      detail: 같은 사진을 세 가지로 분해해 나란히 봅니다.\r
    runtime:\r
    - label: numpy 환경\r
      detail: matplotlib의 colors 모듈로 색공간 변환을 수행합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: rgb_limit\r
  title: 1단계. RGB로 빨간 꽃잎 고르기\r
  structuredPrimary: true\r
  subtitle: 왜 RGB가 어려운가\r
  goal: RGB 조건만으로 빨간 영역을 고르는 시도의 한계를 확인합니다.\r
  why: RGB 한계를 직접 부딪혀 봐야 HSV의 가치가 와닿습니다.\r
  explanation: |-\r
    빨간색은 "R이 크고 G와 B가 작다"는 조건으로 표현할 수 있지만, 햇빛에 바랜 빨강은 R도 G도 둘 다 크고, 어두운 빨강은 셋 다 작은 채로 비율만 빨강에 가깝습니다. 임곗값을 어느 정도로 두든 일부 픽셀이 새고 일부가 빠집니다.\r
\r
    HSV는 색조(H)·채도(S)·명도(V)로 정보를 분리해 "색조가 빨간색 근처에 있는 모든 채도/명도의 픽셀"이라는 표현을 가능하게 합니다.\r
  tips:\r
  - 임곗값 조정으로 색을 거르는 것은 항상 임시방편입니다. 색공간을 바꾸는 편이 빠릅니다.\r
  snippet: |-\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    flower = load_sample_image('flower.jpg')\r
    redLike = (flower[:, :, 0] > 150) & (flower[:, :, 1] < 100) & (flower[:, :, 2] < 100)\r
    redLike.sum(), redLike.shape\r
  exercise:\r
    prompt: 임곗값을 살짝 낮춰(120, 110, 110으로) 더 많은 픽셀이 잡히는지 확인하고, 결과 mask를 imshow로 보세요.\r
    starterCode: |-\r
      looseMask = (flower[:, :, 0] > ___) & (flower[:, :, 1] < ___) & (flower[:, :, 2] < ___)\r
      fig = plt.figure(figsize=(5, 4))\r
      plt.imshow(looseMask, cmap='gray')\r
      plt.axis('off')\r
      fig\r
    hints:\r
    - 마스크는 bool 배열이므로 imshow가 흑백으로 그립니다.\r
    - 너무 느슨하면 분홍과 주황까지 들어옵니다.\r
  check:\r
    noError: bool 마스크 계산이 오류 없이 끝나야 합니다.\r
    resultCheck: looseMask가 (높이, 너비) shape의 bool 배열이어야 합니다.\r
- id: rgb_to_hsv\r
  title: 2단계. RGB를 HSV로\r
  structuredPrimary: true\r
  subtitle: matplotlib.colors.rgb_to_hsv\r
  goal: 0~1 범위로 정규화한 RGB 이미지를 한 줄로 HSV로 바꿉니다.\r
  why: 색공간 변환은 직접 구현하기 번거롭지만 matplotlib이 한 줄로 제공합니다.\r
  explanation: |-\r
    \`matplotlib.colors.rgb_to_hsv\` 는 RGB 입력을 받아 같은 모양의 HSV 배열을 반환합니다. 단, 입력이 0~1 범위의 float이어야 합니다. uint8 그대로 넣으면 잘못된 결과가 나옵니다.\r
\r
    출력의 마지막 차원도 H, S, V 세 채널입니다. H는 0(빨강)~1(다시 빨강)을 따라 색조를 순회합니다. 0.0과 1.0은 같은 색을 의미합니다.\r
  tips:\r
  - HSV의 H는 원형이라는 점이 RGB와 가장 다릅니다. 0과 1이 같은 색이라는 사실이 마스킹 조건에서 중요합니다.\r
  snippet: |-\r
    from matplotlib.colors import rgb_to_hsv\r
\r
    flowerNorm = flower.astype(np.float32) / 255.0\r
    flowerHsv = rgb_to_hsv(flowerNorm)\r
    flowerHsv.shape, flowerHsv[0, 0]\r
  exercise:\r
    prompt: 같은 방식으로 china 이미지를 HSV로 변환하고 첫 픽셀의 H, S, V 값을 확인하세요.\r
    starterCode: |-\r
      china = load_sample_image('china.jpg')\r
      chinaHsv = rgb_to_hsv(china.astype(np.float32) / ___)\r
      chinaHsv[0, 0]\r
    hints:\r
    - 정규화는 255.0으로 나누는 것입니다.\r
    - HSV 값은 모두 0~1 사이입니다.\r
  check:\r
    noError: rgb_to_hsv 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: chinaHsv의 모든 값이 0 이상 1 이하여야 합니다.\r
- id: hue_mask\r
  title: 3단계. H 채널로 색상 마스킹\r
  structuredPrimary: true\r
  subtitle: 빨간 꽃잎 한 줄로 고르기\r
  goal: H 채널 값 범위로 특정 색조의 픽셀만 골라냅니다.\r
  why: HSV 마스킹이 얼마나 단순한지 직접 보면 RGB로 헤매던 이유를 알게 됩니다.\r
  explanation: |-\r
    빨강은 H가 0.0 또는 1.0 근처입니다. \`H < 0.05\` 또는 \`H > 0.95\` 조건으로 빨간 픽셀을 잡습니다. 채도 S가 낮으면 흰색이나 회색이므로 \`S > 0.3\` 같은 추가 조건을 보통 함께 씁니다.\r
\r
    필요한 색조를 단순한 부등식 두 개로 표현할 수 있다는 점이 HSV 마스킹의 강점입니다.\r
  tips:\r
  - 색조의 임곗값이 H=0과 H=1을 가로지르는 경우 OR 조건으로 두 구간을 합칩니다.\r
  snippet: |-\r
    hue = flowerHsv[:, :, 0]\r
    sat = flowerHsv[:, :, 1]\r
    redByHue = ((hue < 0.05) | (hue > 0.95)) & (sat > 0.3)\r
    redByHue.sum()\r
  exercise:\r
    prompt: 노란색 픽셀을 고르는 yellowMask를 만드세요(H가 약 0.13~0.2 사이, S가 0.3 이상).\r
    starterCode: |-\r
      yellowMask = (hue > ___) & (hue < ___) & (sat > 0.3)\r
      fig = plt.figure(figsize=(5, 4))\r
      plt.imshow(yellowMask, cmap='gray')\r
      plt.axis('off')\r
      fig\r
    hints:\r
    - 색조는 빨강(0) → 노랑(0.16) → 초록(0.33) → 청록(0.5) 순으로 증가합니다.\r
    - 채도 조건을 빼면 회색 영역이 섞입니다.\r
  check:\r
    noError: 마스크 계산이 오류 없이 끝나야 합니다.\r
    resultCheck: redByHue의 합이 0보다 커야 합니다(빨간 픽셀이 적어도 존재).\r
- id: lab_lightness\r
  title: 4단계. Lab의 L 채널로 밝기 분리\r
  structuredPrimary: true\r
  subtitle: 색과 밝기 분리하기\r
  goal: Lab 색공간 근사로 밝기 채널 L만 따로 다룹니다.\r
  why: 밝기만 조절하고 색은 그대로 두는 처리는 HSV의 V로도 비슷하게 가능하지만, 사람 시각에 더 잘 맞는 것은 Lab의 L입니다.\r
  explanation: |-\r
    Lab은 L(밝기)·a(녹↔적)·b(청↔황) 축으로 색을 표현합니다. 사람 시각의 명도 변화와 가장 가까운 색공간이라 사진 보정에 자주 쓰입니다.\r
\r
    엄밀한 Lab 변환은 sRGB → 선형 RGB → XYZ → Lab의 다단계 변환이 필요합니다. 여기서는 OpenCV가 자주 쓰는 근사식 \`L ≈ 0.2126 * R + 0.7152 * G + 0.0722 * B\` 를 사용합니다. 이 값은 ITU-R BT.709 luminance 계수입니다.\r
  tips:\r
  - 강의 4단계에서 본 BT.601 계수와 여기 BT.709 계수는 비슷하지만 다른 표준입니다. 정확한 변환이 필요하면 skimage.color.rgb2lab을 쓰세요.\r
  snippet: |-\r
    bt709 = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)\r
    L = (flower.astype(np.float32) * bt709).sum(axis=2)\r
    fig = plt.figure(figsize=(5, 4))\r
    plt.imshow(L, cmap='gray')\r
    plt.title('L (BT.709)')\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: L 채널만 1.3배 곱한 뒤 0~255로 클립한 이미지 brighter을 만들고 imshow로 비교하세요.\r
    starterCode: |-\r
      brighter = (L * ___).clip(0, 255).astype(np.uint8)\r
      fig2 = plt.figure(figsize=(5, 4))\r
      plt.imshow(brighter, cmap='gray')\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - clip 후 dtype을 다시 uint8로 만드세요.\r
    - 1.3배 곱은 전체 밝기를 30% 올리는 단순한 방식입니다.\r
  check:\r
    noError: 곱셈과 클립이 오류 없이 끝나야 합니다.\r
    resultCheck: brighter의 dtype이 uint8여야 합니다.\r
- id: side_by_side\r
  title: 5단계. 세 색공간 한눈에\r
  structuredPrimary: true\r
  subtitle: 같은 사진의 세 가지 모습\r
  goal: 같은 사진을 RGB, HSV, 그레이로 변환해 나란히 비교합니다.\r
  why: 정보가 어떻게 다르게 표현되는지 한 화면에 두면 어떤 작업에 어떤 표현이 어울리는지 즉시 보입니다.\r
  explanation: |-\r
    H 채널을 색상맵 hsv로, S 채널을 viridis로, V 채널을 gray로 그리면 정보의 종류가 분명히 다르다는 사실이 드러납니다. 같은 사진의 모서리가 어디에 더 잘 보이는지 비교해 보세요.\r
  tips:\r
  - 마지막에 어떤 색공간이 어떤 분석에 쓰이는지 한 줄로 요약해 두면 다음 트랙에서 함수 선택이 빨라집니다.\r
  snippet: |-\r
    china = load_sample_image('china.jpg')\r
    chinaHsv = rgb_to_hsv(china.astype(np.float32) / 255.0)\r
\r
    fig, axes = plt.subplots(2, 2, figsize=(10, 8))\r
    axes[0, 0].imshow(flower)\r
    axes[0, 0].set_title('RGB')\r
    axes[0, 1].imshow(flowerHsv[:, :, 0], cmap='hsv')\r
    axes[0, 1].set_title('Hue')\r
    axes[1, 0].imshow(flowerHsv[:, :, 1], cmap='viridis')\r
    axes[1, 0].set_title('Saturation')\r
    axes[1, 1].imshow(flowerHsv[:, :, 2], cmap='gray')\r
    axes[1, 1].set_title('Value')\r
    for axis in axes.ravel():\r
        axis.axis('off')\r
    fig\r
  exercise:\r
    prompt: china 이미지로 같은 2x2 그리드를 그리고 H, S, V의 평균값을 print 없이 dict로 출력하세요.\r
    starterCode: |-\r
      chinaStats = {\r
          "hue_mean": float(chinaHsv[:, :, 0].mean()),\r
          "sat_mean": float(chinaHsv[:, :, 1].mean()),\r
          "val_mean": float(chinaHsv[:, :, 2].mean()),\r
      }\r
      chinaStats\r
    hints:\r
    - mean()의 결과는 numpy 스칼라이므로 float()로 감싸야 깔끔합니다.\r
    - HSV 값 범위는 0~1입니다.\r
  check:\r
    noError: 통계 계산이 오류 없이 끝나야 합니다.\r
    resultCheck: chinaStats의 세 값이 모두 0 이상 1 이하여야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 색공간으로 풀어 보기\r
  goal: 두 가지 작업을 RGB와 HSV로 각각 풀어 보고 차이를 체감합니다.\r
  why: 같은 문제를 두 색공간으로 풀어 봐야 어느 쪽이 빠른지 몸으로 알게 됩니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 미션 사이에 변수명을 겹치지 마세요. import 변수만 공유됩니다.\r
  snippet: |-\r
    pinkHue = (flowerHsv[:, :, 0] > 0.85) | (flowerHsv[:, :, 0] < 0.03)\r
    pinkSat = flowerHsv[:, :, 1] > 0.4\r
    pinkOnly = pinkHue & pinkSat\r
    pinkOnly.sum()\r
  exercise:\r
    prompt: "미션1: china 이미지의 하늘색 영역만 골라내는 skyMask를 HSV로 만드세요(H가 0.5 근처). 미션2: china에서 V > 0.7인 픽셀만 RGB 원본 값으로 남기고 나머지는 검정으로 만든 highlightImage를 만드세요."\r
    starterCode: |-\r
      skyMask = (chinaHsv[:, :, 0] > ___) & (chinaHsv[:, :, 0] < ___) & (chinaHsv[:, :, 1] > 0.2)\r
      fig = plt.figure(figsize=(5, 4))\r
      plt.imshow(skyMask, cmap='gray')\r
      plt.axis('off')\r
      fig\r
    hints:\r
    - 하늘은 H가 약 0.5~0.6 근처(청록~파랑) 범위입니다.\r
    - "highlightImage는 china * brightMask[:, :, None] 같은 브로드캐스팅으로 만들 수 있습니다."\r
  check:\r
    noError: 마스크 계산과 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: skyMask가 (높이, 너비) bool 배열이고 일부가 True여야 합니다.\r
`;export{e as default};