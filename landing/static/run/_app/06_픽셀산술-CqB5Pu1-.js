var e=`meta:\r
  id: visionBasics_06\r
  title: 픽셀 산술\r
  order: 6\r
  category: visionBasics\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - scikit-learn\r
  tags:\r
  - numpy\r
  - 밝기\r
  - 대비\r
  - clip\r
  - 산술연산\r
  seo:\r
    title: 이미지 비전 기초 - 픽셀 산술\r
    description: 밝기, 대비, 평균을 numpy 산술 한 줄로 표현하고 clip으로 오버플로우를 막습니다.\r
    keywords:\r
    - numpy\r
    - 밝기조정\r
    - 대비조정\r
    - clip\r
    - 이미지처리\r
intro:\r
  emoji: 🔢\r
  goal: 밝기·대비 보정이 단순한 numpy 산술이라는 점을 직접 식으로 풀어 봅니다.\r
  description: |-\r
    "밝기를 +30 올린다", "대비를 1.2배 늘린다" 같은 보정은 모두 픽셀 값에 사칙연산을 적용한 결과입니다. 이 강의는 이 식을 직접 적고, uint8 자료형에서 생기는 오버플로우를 clip으로 막는 패턴을 익힙니다.\r
  direction: 밝기·대비·평균 합성을 모두 산술식으로 표현하고 clip으로 0~255 범위에 가둡니다.\r
  benefits:\r
  - 밝기와 대비를 한 줄 산술로 조정할 수 있습니다.\r
  - uint8 오버플로우의 원인을 알고 float 캐스팅으로 회피할 수 있습니다.\r
  - 두 이미지의 평균과 차이를 한 줄로 만들 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. uint8 오버플로우\r
      detail: 그냥 더하면 어떤 일이 일어나는지 확인합니다.\r
    - label: 2단계. float 캐스팅 + clip\r
      detail: 안전하게 더하는 표준 패턴을 익힙니다.\r
    - label: 3단계. 대비 조정\r
      detail: 평균값을 기준으로 픽셀을 확대·축소합니다.\r
    - label: 4단계. 두 이미지 평균\r
      detail: 두 사진을 균등하게 섞습니다.\r
    - label: 5단계. 가중 평균\r
      detail: 알파 한 줄로 부드러운 합성을 만듭니다.\r
    runtime:\r
    - label: numpy 환경\r
      detail: numpy 산술과 clip만으로 학습합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: overflow\r
  title: 1단계. uint8 오버플로우 체험\r
  structuredPrimary: true\r
  subtitle: 255 + 50 = 49?\r
  goal: uint8 자료형으로 직접 덧셈을 해서 오버플로우 결과를 눈으로 확인합니다.\r
  why: 한번 직접 부딪혀 봐야 왜 float 캐스팅이 필요한지 잊지 않게 됩니다.\r
  explanation: |-\r
    uint8은 0~255의 8비트 부호 없는 정수입니다. 250 + 30 처럼 결과가 255를 넘어가면 numpy는 wrap-around를 수행해 24 같은 작은 값을 돌려줍니다. 사진에서 이것이 일어나면 밝아야 할 영역이 갑자기 어두워집니다.\r
\r
    이 함정은 입문자 코드의 단골 버그입니다. 직접 한 줄로 만든 뒤 다음 섹션에서 해결합니다.\r
  tips:\r
  - numpy의 산술 결과 dtype은 입력에 따라 결정됩니다. uint8 + uint8 = uint8 입니다.\r
  snippet: |-\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    china = load_sample_image('china.jpg')\r
\r
    bright = np.array([240, 250, 255], dtype=np.uint8)\r
    overflow = bright + np.uint8(30)\r
    overflow\r
  exercise:\r
    prompt: china 이미지에 그대로 +50을 더한 결과 wrong을 만들고 imshow로 어떤 모습이 되는지 확인하세요.\r
    starterCode: |-\r
      china = load_sample_image('china.jpg')\r
      wrong = china + np.uint8(___)\r
      fig = plt.figure(figsize=(5, 4))\r
      plt.imshow(wrong)\r
      plt.axis('off')\r
      fig\r
    hints:\r
    - 결과는 의도와 다르게 어둡거나 색이 깨져 보입니다.\r
    - 그래도 이미지 모양은 유지됩니다.\r
  check:\r
    noError: 덧셈과 imshow가 오류 없이 끝나야 합니다.\r
    resultCheck: wrong과 china의 일부 픽셀 값이 의도와 다르게 작아진 것을 확인할 수 있어야 합니다.\r
- id: safe_add\r
  title: 2단계. 안전한 더하기\r
  structuredPrimary: true\r
  subtitle: float 캐스팅 + clip + uint8\r
  goal: 오버플로우를 막는 표준 패턴 (float 변환 → 연산 → clip → uint8) 을 익힙니다.\r
  why: 이 세 줄 패턴은 비전 코드에서 거의 모든 산술의 표준입니다.\r
  explanation: |-\r
    \`(img.astype(np.float32) + 50).clip(0, 255).astype(np.uint8)\` 가 정석입니다. float으로 잠시 옮겨서 더하면 더 큰 값도 손실 없이 표현되고, clip으로 255 위는 잘라낸 뒤 다시 uint8로 돌립니다.\r
\r
    이 패턴을 알면 어떤 산술 보정도 같은 틀로 풀 수 있습니다.\r
  tips:\r
  - clip의 두 번째 인자는 최댓값입니다. 음수가 나올 수 있는 경우 clip(0, 255) 가 음수도 0으로 잘라 줍니다.\r
  snippet: |-\r
    safe = (china.astype(np.float32) + 50).clip(0, 255).astype(np.uint8)\r
    fig = plt.figure(figsize=(5, 4))\r
    plt.imshow(safe)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 밝기를 -60 만큼 어둡게 하는 dim 이미지를 같은 패턴으로 만드세요.\r
    starterCode: |-\r
      dim = (china.astype(np.float32) ___).clip(0, 255).astype(np.uint8)\r
      fig2 = plt.figure(figsize=(5, 4))\r
      plt.imshow(dim)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 어둡게 만들려면 음수를 더하거나 양수를 뺍니다.\r
    - clip의 하한 0이 음수 결과를 잘라줍니다.\r
  check:\r
    noError: 캐스팅과 clip이 오류 없이 끝나야 합니다.\r
    resultCheck: dim.mean() 이 china.mean() 보다 작아야 합니다.\r
- id: contrast\r
  title: 3단계. 대비 조정\r
  structuredPrimary: true\r
  subtitle: 평균을 기준으로 확대·축소\r
  goal: 픽셀 값을 평균으로부터 멀리 밀어내거나 모아 대비를 조정합니다.\r
  why: 사진의 디테일이 흐릿할 때 가장 먼저 시도하는 보정이 대비입니다.\r
  explanation: |-\r
    대비 조정 공식은 \`(pixel - mean) * alpha + mean\` 입니다. alpha가 1보다 크면 대비가 강해지고, 1보다 작으면 부드러워집니다. mean은 보통 128(중간 회색) 또는 이미지 전체 평균을 씁니다.\r
\r
    OpenCV의 \`cv2.convertScaleAbs(img, alpha=1.2, beta=0)\` 가 비슷한 일을 합니다. 손으로 한 번 식을 적어 보면 함수가 무엇을 감추는지 알게 됩니다.\r
  tips:\r
  - 대비를 너무 강하게(alpha > 2) 주면 클립으로 흰색/검정 픽셀이 많아져 디테일이 사라집니다.\r
  snippet: |-\r
    base = china.astype(np.float32)\r
    alpha = 1.4\r
    midGray = 128.0\r
    boosted = ((base - midGray) * alpha + midGray).clip(0, 255).astype(np.uint8)\r
    fig = plt.figure(figsize=(5, 4))\r
    plt.imshow(boosted)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: alpha=0.6 으로 대비를 부드럽게 만든 softened를 만들고 원본과 비교 출력하세요.\r
    starterCode: |-\r
      softened = ((base - midGray) * ___ + midGray).clip(0, 255).astype(np.uint8)\r
      fig2, axes2 = plt.subplots(1, 2, figsize=(10, 4))\r
      axes2[0].imshow(china)\r
      axes2[0].set_title('original')\r
      axes2[1].imshow(softened)\r
      axes2[1].set_title('alpha=0.6')\r
      for axis in axes2:\r
          axis.axis('off')\r
      fig2\r
    hints:\r
    - alpha < 1 은 대비를 줄입니다.\r
    - 결과는 안개 낀 듯한 느낌이 됩니다.\r
  check:\r
    noError: 대비 계산과 두 그래프 그리기가 오류 없이 끝나야 합니다.\r
    resultCheck: softened.std() 가 china.std() 보다 작아야 합니다.\r
- id: average_two\r
  title: 4단계. 두 이미지의 평균\r
  structuredPrimary: true\r
  subtitle: 합성의 가장 단순한 형태\r
  goal: 같은 크기 두 이미지를 균등하게 섞습니다.\r
  why: 평균 합성은 노출 다른 두 사진을 합치는 HDR의 기본 아이디어와 같습니다.\r
  explanation: |-\r
    같은 크기의 두 이미지를 평균하려면 \`((a.astype(float) + b.astype(float)) * 0.5).clip(0, 255).astype(np.uint8)\` 입니다. 두 이미지의 크기가 다르면 미리 잘라 맞추거나 다음 트랙의 resize를 써야 합니다.\r
  tips:\r
  - 평균 합성의 결과는 두 사진의 디테일이 동시에 흐려진 듯한 이미지가 됩니다.\r
  snippet: |-\r
    flower = load_sample_image('flower.jpg')\r
    h = min(china.shape[0], flower.shape[0])\r
    w = min(china.shape[1], flower.shape[1])\r
    aCut = china[:h, :w].astype(np.float32)\r
    bCut = flower[:h, :w].astype(np.float32)\r
    averaged = ((aCut + bCut) * 0.5).clip(0, 255).astype(np.uint8)\r
    fig = plt.figure(figsize=(6, 4))\r
    plt.imshow(averaged)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 두 이미지에 각각 다른 가중치(0.8, 0.2)를 곱해 chinaHeavy 이미지를 만드세요.\r
    starterCode: |-\r
      chinaHeavy = (aCut * ___ + bCut * ___).clip(0, 255).astype(np.uint8)\r
      fig2 = plt.figure(figsize=(6, 4))\r
      plt.imshow(chinaHeavy)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 두 가중치의 합이 1이어야 평균에 가깝게 보입니다.\r
    - "0.8과 0.2를 빈칸에 넣어 보세요."\r
  check:\r
    noError: 가중치 합성이 오류 없이 끝나야 합니다.\r
    resultCheck: 'chinaHeavy의 픽셀 분포가 china에 더 가까워야 합니다(예: chinaHeavy의 평균이 china의 평균에 더 가깝다).'\r
- id: weighted_blend\r
  title: 5단계. 픽셀별 가중치 합성\r
  structuredPrimary: true\r
  subtitle: 알파 한 줄로 부드러운 페이드\r
  goal: 가중치가 픽셀별로 달라지는 합성을 한 줄로 표현합니다.\r
  why: 한쪽 끝에서 다른 사진으로 부드럽게 전환되는 페이드 효과는 비전 데모와 광고에 자주 등장합니다.\r
  explanation: |-\r
    \`alpha\` 가 같은 크기의 float 배열이면 픽셀별 가중치 합성이 됩니다. 좌측은 0, 우측은 1이 되도록 만들면 좌→우로 페이드되는 합성이 만들어집니다.\r
\r
    실제로는 알파를 3채널로 broadcast해야 RGB와 곱이 됩니다. \`alpha[:, :, None]\` 트릭으로 마지막 축을 추가합니다.\r
  tips:\r
  - "alpha[:, :, None] 은 (H, W) 배열을 (H, W, 1)로 만들어 RGB 곱에 자연스럽게 들어갑니다."\r
  snippet: |-\r
    weight = np.linspace(0, 1, w, dtype=np.float32)\r
    weight = np.broadcast_to(weight, (h, w))\r
    fade = (aCut * (1 - weight[:, :, None]) + bCut * weight[:, :, None]).clip(0, 255).astype(np.uint8)\r
    fig = plt.figure(figsize=(6, 4))\r
    plt.imshow(fade)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 위에서 아래로 가는 세로 페이드 verticalFade를 만드세요(상단은 china, 하단은 flower).\r
    starterCode: |-\r
      vWeight = np.linspace(0, 1, h, dtype=np.float32)\r
      vWeight = np.broadcast_to(vWeight[:, None], (h, w))\r
      verticalFade = (aCut * (1 - vWeight[:, :, None]) + bCut * vWeight[:, :, None]).clip(0, 255).astype(np.uint8)\r
      fig2 = plt.figure(figsize=(6, 4))\r
      plt.imshow(verticalFade)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 세로 방향 가중치는 처음 None 인덱스를 행 축에 추가해 만듭니다.\r
    - 상단이 0이면 china가 강하고 하단이 1이면 flower가 강해집니다.\r
  check:\r
    noError: broadcast와 가중치 합성이 오류 없이 끝나야 합니다.\r
    resultCheck: verticalFade의 상단 평균과 하단 평균이 서로 달라야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 산술로 보정 도구 만들기\r
  goal: 보정 공식을 함수로 묶고 비교 그리드를 만듭니다.\r
  why: 보정 함수를 만들면 같은 패턴을 매개변수만 바꿔 반복할 수 있습니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 함수 매개변수에 기본값을 두면 호출이 짧아집니다.\r
  snippet: |-\r
    def adjust(img, brightness=0.0, contrast=1.0, mid=128.0):\r
        base = img.astype(np.float32)\r
        out = (base - mid) * contrast + mid + brightness\r
        return out.clip(0, 255).astype(np.uint8)\r
\r
    sample = adjust(china, brightness=20, contrast=1.2)\r
    sample.dtype, sample.shape\r
  exercise:\r
    prompt: "미션1: 위 adjust 함수를 그대로 사용해 (brightness, contrast) 조합 4개를 2x2 그리드로 시각화하세요. 미션2: 두 이미지를 가로 페이드한 fadeImage와 그 결과에 adjust(contrast=1.3) 을 적용한 enhanced를 만들어 비교 출력하세요."\r
    starterCode: |-\r
      fig, axes = plt.subplots(2, 2, figsize=(10, 8))\r
      configs = [(0, 1.0), (40, 1.0), (0, 1.5), (40, 1.5)]\r
      for axis, (bVal, cVal) in zip(axes.ravel(), configs):\r
          axis.imshow(adjust(china, brightness=bVal, contrast=cVal))\r
          axis.set_title(f"b={bVal}, c={cVal}")\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - 함수 호출은 키워드 인자로 두면 가독성이 좋습니다.\r
    - 두 이미지를 합치는 페이드는 5단계와 같은 패턴을 씁니다.\r
  check:\r
    noError: 함수 정의와 그리드 출력이 오류 없이 끝나야 합니다.\r
    resultCheck: 4개 셀의 이미지가 서로 다른 밝기/대비로 출력되어야 합니다.\r
`;export{e as default};