var e=`meta:\r
  id: visionBasics_07\r
  title: 룩업 테이블\r
  order: 7\r
  category: visionBasics\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - scikit-learn\r
  tags:\r
  - numpy\r
  - LUT\r
  - 감마보정\r
  - 톤매핑\r
  - np.take\r
  seo:\r
    title: 이미지 비전 기초 - 룩업 테이블\r
    description: 0~255 → 0~255 매핑을 미리 계산해 두는 LUT으로 감마 보정, 톤 매핑, 반전 등을 한 줄로 적용합니다.\r
    keywords:\r
    - 룩업테이블\r
    - LUT\r
    - 감마보정\r
    - 톤매핑\r
    - np.take\r
intro:\r
  emoji: 📈\r
  goal: 픽셀 값 0~255를 미리 계산된 표로 변환하는 LUT(Lookup Table) 패턴을 익힙니다.\r
  description: |-\r
    감마 보정처럼 픽셀 한 개당 거듭제곱 한 번씩을 해야 하는 함수는 큰 이미지에서 느립니다. LUT은 0~255 각 값의 결과를 미리 계산해 둔 256칸짜리 표를 만들어 두고, 픽셀 값을 표에서 조회하는 방식입니다. 이 강의는 LUT을 만들고, 감마·반전·톤매핑·이진화 등 다양한 변환을 LUT 한 줄로 적용합니다.\r
  direction: 256칸 표를 직접 만들어 픽셀에 적용하고, 동일 변환을 LUT 없이 한 결과와 속도를 비교합니다.\r
  benefits:\r
  - 픽셀별 비선형 변환을 한 줄 인덱싱으로 가속할 수 있습니다.\r
  - 감마 보정, 반전, 포스터화를 표 한 줄로 표현할 수 있습니다.\r
  - OpenCV의 cv2.LUT 함수가 무엇을 감추는지 이해합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 항등 LUT\r
      detail: 입력 그대로 돌려주는 표를 만듭니다.\r
    - label: 2단계. 반전 LUT\r
      detail: 255 - x 한 줄로 색을 뒤집습니다.\r
    - label: 3단계. 감마 보정\r
      detail: 거듭제곱 식을 LUT으로 압축합니다.\r
    - label: 4단계. 포스터화\r
      detail: 값 범위를 묶어 색 단순화를 만듭니다.\r
    - label: 5단계. 그레이 채널 LUT 활용\r
      detail: 명도 채널만 LUT으로 보정하는 패턴을 실험합니다.\r
    runtime:\r
    - label: numpy 환경\r
      detail: numpy의 fancy indexing이 사실상의 LUT 적용 연산입니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: identity_lut\r
  title: 1단계. 항등 LUT\r
  structuredPrimary: true\r
  subtitle: 입력 그대로 돌려주는 표\r
  goal: 0~255 입력을 그대로 돌려주는 가장 단순한 LUT을 만들고 적용해 봅니다.\r
  why: LUT 적용이 이미지의 모양도 dtype도 바꾸지 않는다는 사실을 먼저 확인하면 다음 단계가 쉽게 따라옵니다.\r
  explanation: |-\r
    \`identityLut = np.arange(256, dtype=np.uint8)\` 는 인덱스 i가 i를 가리키는 표입니다. 이미지를 인덱스로 사용해 \`identityLut[img]\` 처럼 호출하면 결과는 원본과 똑같습니다.\r
\r
    이 fancy indexing이 LUT 적용의 본질입니다. OpenCV의 \`cv2.LUT(img, lut)\` 도 같은 일을 합니다.\r
  tips:\r
  - LUT의 길이는 항상 256이어야 합니다. 0~255 픽셀 값으로 인덱싱하기 때문입니다.\r
  snippet: |-\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    china = load_sample_image('china.jpg')\r
    identityLut = np.arange(256, dtype=np.uint8)\r
    sameAsOriginal = identityLut[china]\r
    np.array_equal(sameAsOriginal, china)\r
  exercise:\r
    prompt: identityLut의 5번째 칸 값을 7로 바꾸고 다시 적용한 뒤, 원본 픽셀 값이 5였던 위치가 7로 바뀌었는지 확인하세요(china에 그런 픽셀이 있을 수도 있고 없을 수도 있습니다).\r
    starterCode: |-\r
      patchedLut = identityLut.copy()\r
      patchedLut[5] = ___\r
      patched = patchedLut[china]\r
      mask = china == 5\r
      mask.sum(), patched[mask].max() if mask.any() else None\r
    hints:\r
    - patchedLut[5]는 0~255 정수만 받을 수 있습니다.\r
    - mask가 비어 있으면 결과는 None이 됩니다.\r
  check:\r
    noError: copy와 인덱싱이 오류 없이 끝나야 합니다.\r
    resultCheck: sameAsOriginal 비교에서 True가 반환되어야 합니다.\r
- id: invert_lut\r
  title: 2단계. 반전 LUT\r
  structuredPrimary: true\r
  subtitle: 255 - x 한 줄\r
  goal: 색을 반전시키는 LUT을 만들고 적용합니다.\r
  why: 반전은 가장 단순한 비선형 변환의 예이며 LUT의 표현력을 직관적으로 보여 줍니다.\r
  explanation: |-\r
    \`invertLut = 255 - np.arange(256, dtype=np.uint8)\` 는 입력 0이 255로, 255가 0으로 가는 표입니다. 이를 이미지에 적용하면 검정과 흰색이 뒤집힌 이미지가 됩니다.\r
\r
    OpenCV의 \`cv2.bitwise_not(img)\` 가 같은 결과를 냅니다. 함수 호출과 LUT 적용이 같은 일이라는 점을 확인하세요.\r
  tips:\r
  - 반전은 비트 NOT 연산과 같습니다. 단순하지만 시각적으로 인상적입니다.\r
  snippet: |-\r
    invertLut = 255 - np.arange(256, dtype=np.uint8)\r
    inverted = invertLut[china]\r
    fig = plt.figure(figsize=(5, 4))\r
    plt.imshow(inverted)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 부분 반전 LUT을 만드세요(0~127은 그대로, 128~255만 반전).\r
    starterCode: |-\r
      partialLut = np.arange(256, dtype=np.uint8)\r
      partialLut[128:] = ___ - partialLut[128:]\r
      partial = partialLut[china]\r
      fig2 = plt.figure(figsize=(5, 4))\r
      plt.imshow(partial)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 반전은 255에서 값을 빼는 것입니다.\r
    - 결과의 어두운 영역은 그대로이고 밝은 영역만 뒤집힙니다.\r
  check:\r
    noError: LUT 생성과 적용이 오류 없이 끝나야 합니다.\r
    resultCheck: invertLut[0] 이 255, invertLut[255] 가 0이어야 합니다.\r
- id: gamma\r
  title: 3단계. 감마 보정\r
  structuredPrimary: true\r
  subtitle: x ** gamma를 LUT으로\r
  goal: 감마 보정 공식을 LUT으로 한 번에 계산해 둡니다.\r
  why: 감마 보정은 어두운 디테일을 살리거나 모니터 출력에 맞추는 표준 보정입니다.\r
  explanation: |-\r
    감마 보정 공식은 \`out = 255 * (in / 255) ** gamma\` 입니다. gamma가 1보다 작으면 어두운 영역이 밝아지고, 1보다 크면 더 어두워집니다.\r
\r
    LUT을 만들어 두면 큰 사진에서도 단일 인덱싱 한 번으로 적용됩니다. 한 픽셀씩 거듭제곱하는 코드보다 훨씬 빠릅니다.\r
  tips:\r
  - 감마 0.5는 어두운 영역을 강조하고, 감마 2.0은 밝은 영역을 강조합니다.\r
  snippet: |-\r
    def buildGammaLut(gammaValue):\r
        norm = np.arange(256, dtype=np.float32) / 255.0\r
        return (255.0 * np.power(norm, gammaValue)).clip(0, 255).astype(np.uint8)\r
\r
    lutGammaHalf = buildGammaLut(0.5)\r
    brightDark = lutGammaHalf[china]\r
    fig = plt.figure(figsize=(5, 4))\r
    plt.imshow(brightDark)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 같은 함수로 감마 2.2 LUT을 만들어 적용한 dim22 이미지를 만들고 비교 출력하세요.\r
    starterCode: |-\r
      lutGammaHigh = buildGammaLut(___)\r
      dim22 = lutGammaHigh[china]\r
      fig2, axes2 = plt.subplots(1, 2, figsize=(10, 4))\r
      axes2[0].imshow(brightDark)\r
      axes2[0].set_title('gamma=0.5')\r
      axes2[1].imshow(dim22)\r
      axes2[1].set_title('gamma=2.2')\r
      for axis in axes2:\r
          axis.axis('off')\r
      fig2\r
    hints:\r
    - 감마 2.2는 sRGB의 표준 보정값과 같습니다.\r
    - 결과가 전체적으로 어두워져야 합니다.\r
  check:\r
    noError: 함수 정의와 적용이 오류 없이 끝나야 합니다.\r
    resultCheck: dim22.mean() 이 brightDark.mean() 보다 작아야 합니다.\r
- id: posterize\r
  title: 4단계. 포스터화\r
  structuredPrimary: true\r
  subtitle: 값 범위를 묶어 색 단순화\r
  goal: 256가지 값을 8가지로 줄이는 단순화 LUT을 만듭니다.\r
  why: 포스터화는 색을 단순화해 일러스트 같은 효과를 만들거나 색 영역을 추출할 때 쓰입니다.\r
  explanation: |-\r
    \`(input // 32) * 32\` 는 입력을 32단위로 묶습니다. 256 / 32 = 8 단계만 남게 됩니다. LUT으로 미리 계산해 두면 빠릅니다.\r
\r
    단계 수를 바꿔 보면 분위기가 달라집니다. 단계 수가 적을수록 그림이 추상화됩니다.\r
  tips:\r
  - 단계 수는 항상 256의 약수로 두는 것이 자연스럽습니다(2, 4, 8, 16, 32, 64).\r
  snippet: |-\r
    def buildPosterizeLut(levels):\r
        step = 256 // levels\r
        bucketed = (np.arange(256, dtype=np.int32) // step) * step\r
        return bucketed.clip(0, 255).astype(np.uint8)\r
\r
    lutEight = buildPosterizeLut(8)\r
    poster = lutEight[china]\r
    fig = plt.figure(figsize=(5, 4))\r
    plt.imshow(poster)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 레벨을 4와 16으로 각각 적용한 두 결과를 비교 출력하세요.\r
    starterCode: |-\r
      lutFour = buildPosterizeLut(4)\r
      lutSixteen = buildPosterizeLut(___)\r
      fig2, axes2 = plt.subplots(1, 2, figsize=(10, 4))\r
      axes2[0].imshow(lutFour[china])\r
      axes2[0].set_title('4 levels')\r
      axes2[1].imshow(lutSixteen[china])\r
      axes2[1].set_title('16 levels')\r
      for axis in axes2:\r
          axis.axis('off')\r
      fig2\r
    hints:\r
    - 레벨 4 는 색 단계가 4개뿐입니다.\r
    - 레벨 16은 거의 원본에 가깝게 보입니다.\r
  check:\r
    noError: LUT 생성과 적용이 오류 없이 끝나야 합니다.\r
    resultCheck: poster의 고유 픽셀 값 개수가 china보다 적어야 합니다.\r
- id: lut_gray\r
  title: 5단계. 그레이 채널에만 LUT 적용\r
  structuredPrimary: true\r
  subtitle: HSV의 V 채널만 보정\r
  goal: 컬러 이미지의 명도만 LUT으로 보정하고 색상은 보존합니다.\r
  why: 색을 망치지 않고 밝기만 다듬는 보정은 사진 후처리의 기본기입니다.\r
  explanation: |-\r
    HSV로 변환해 V 채널만 LUT으로 바꾸고 다시 RGB로 되돌리면 색조와 채도는 유지하면서 밝기만 바뀝니다. matplotlib의 \`hsv_to_rgb\` 가 역변환을 담당합니다.\r
\r
    이 강의에서 변환은 한 줄이지만, 내부에서는 부동소수 정규화·LUT 적용·역변환의 세 단계가 일어납니다.\r
  tips:\r
  - V 채널은 0~1 범위 float이므로 LUT 적용 전 *255 후 uint8로, 적용 후 /255로 되돌려야 합니다.\r
  snippet: |-\r
    from matplotlib.colors import rgb_to_hsv, hsv_to_rgb\r
\r
    chinaHsv = rgb_to_hsv(china.astype(np.float32) / 255.0)\r
    valueChannel = (chinaHsv[:, :, 2] * 255).astype(np.uint8)\r
    brightenedValue = lutGammaHalf[valueChannel].astype(np.float32) / 255.0\r
    blended = chinaHsv.copy()\r
    blended[:, :, 2] = brightenedValue\r
    out = (hsv_to_rgb(blended) * 255).clip(0, 255).astype(np.uint8)\r
    fig = plt.figure(figsize=(5, 4))\r
    plt.imshow(out)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 같은 방식으로 감마 1.5 LUT을 V에만 적용한 darkValue 이미지를 만드세요.\r
    starterCode: |-\r
      lutGamma15 = buildGammaLut(___)\r
      darkValueChannel = lutGamma15[valueChannel].astype(np.float32) / 255.0\r
      darkBlend = chinaHsv.copy()\r
      darkBlend[:, :, 2] = darkValueChannel\r
      darkValue = (hsv_to_rgb(darkBlend) * 255).clip(0, 255).astype(np.uint8)\r
      fig2 = plt.figure(figsize=(5, 4))\r
      plt.imshow(darkValue)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 감마 1.5는 어둡게 만드는 값입니다.\r
    - 색조는 변하지 않아야 합니다.\r
  check:\r
    noError: HSV 변환과 역변환이 오류 없이 끝나야 합니다.\r
    resultCheck: darkValue.mean() 이 china.mean() 보다 작아야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: LUT 패턴 묶기\r
  goal: 다양한 변환 LUT을 하나의 비교 그리드로 묶습니다.\r
  why: 여러 LUT을 한 화면에 모아 보면 어떤 변환이 어떤 효과를 내는지 한눈에 정리됩니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - LUT은 함수처럼 생각하면 다루기 쉽습니다(입력 → 표를 거쳐 출력).\r
  snippet: |-\r
    def buildThresholdLut(threshold):\r
        table = np.zeros(256, dtype=np.uint8)\r
        table[threshold:] = 255\r
        return table\r
\r
    lutBinary = buildThresholdLut(128)\r
    binarized = lutBinary[china]\r
    binarized.dtype, binarized.shape\r
  exercise:\r
    prompt: "미션1: 4개 LUT(원본, 감마0.5, 감마2.0, 포스터8단계)를 2x2 그리드로 출력하세요. 미션2: 임곗값 80, 130, 180에 대한 세 개의 이진화 결과를 1x3 그리드로 그리세요."\r
    starterCode: |-\r
      fig, axes = plt.subplots(2, 2, figsize=(10, 8))\r
      axes[0, 0].imshow(china)\r
      axes[0, 0].set_title('original')\r
      axes[0, 1].imshow(brightDark)\r
      axes[0, 1].set_title('gamma=0.5')\r
      axes[1, 0].imshow(buildGammaLut(2.0)[china])\r
      axes[1, 0].set_title('gamma=2.0')\r
      axes[1, 1].imshow(poster)\r
      axes[1, 1].set_title('posterize=8')\r
      for axis in axes.ravel():\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - LUT 함수를 인라인으로 호출해 임시 LUT을 만들어도 됩니다.\r
    - 이진화 미션은 buildThresholdLut(N) 으로 표를 세 번 만들어 적용합니다.\r
  check:\r
    noError: 그리드 출력이 오류 없이 끝나야 합니다.\r
    resultCheck: 4개 셀이 모두 다른 이미지로 출력되어야 합니다.\r
`;export{e as default};