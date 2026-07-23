var e=`meta:\r
  id: deepVision_03\r
  title: 임베딩 벡터 추출\r
  order: 3\r
  category: deepVision\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib
  - numpy
  - pillow
  - scikit-learn
  - torch\r
  - torchvision\r
  tags:\r
  - torchvision\r
  - ResNet\r
  - 임베딩\r
  - feature\r
  - 특징벡터\r
  seo:\r
    title: 딥러닝 비전 - 임베딩 벡터 추출\r
    description: ResNet의 마지막 분류층을 제거하고 사진을 512차원 특징 벡터로 인코딩합니다.\r
    keywords:\r
    - 임베딩\r
    - feature\r
    - ResNet\r
    - 특징벡터\r
    - torchvision\r
intro:\r
  emoji: 🔢\r
  goal: 사전학습 ResNet을 특징 추출기로 변형해 사진을 512차원 벡터로 만듭니다.\r
  description: |-\r
    분류 결과는 1000개 클래스에 대한 확률이지만, 그 직전 단계의 512차원 벡터는 "사진의 의미를 압축한 표현"입니다. 이 벡터는 유사도 검색·클러스터링·다른 작업에 그대로 활용됩니다. 이 강의는 분류층을 제거해 특징 벡터를 직접 꺼내는 패턴을 익힙니다.\r
  direction: 분류층을 제거한 ResNet으로 사진을 벡터로 변환하고, 벡터의 모양과 의미를 확인합니다.\r
  benefits:\r
  - nn.Sequential과 children을 이용해 모델 일부를 떼어낼 수 있습니다.\r
  - 512차원 임베딩의 정규화와 거리 비교를 직접 다룹니다.\r
  - 같은 사진과 다른 사진의 임베딩이 어떻게 다른지 거리로 확인합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. ResNet 구조 살펴보기\r
      detail: children() 으로 레이어를 열거합니다.\r
    - label: 2단계. 마지막 fc 제거\r
      detail: nn.Sequential로 새 모델 만들기.\r
    - label: 3단계. 임베딩 추출\r
      detail: (1, 512) 형태로 벡터를 얻습니다.\r
    - label: 4단계. 정규화\r
      detail: L2 정규화로 코사인 비교 준비.\r
    - label: 5단계. 거리 비교\r
      detail: 같은/다른 사진 거리 비교.\r
    runtime:\r
    - label: PyTorch 환경\r
      detail: torchvision, torch, sklearn, matplotlib.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: inspect_layers\r
  title: 1단계. ResNet 구조 살펴보기\r
  structuredPrimary: true\r
  subtitle: children() 으로 레이어 열거\r
  goal: ResNet18 모델의 자식 모듈을 순서대로 출력해 구조를 파악합니다.\r
  why: 어디를 잘라야 임베딩이 나오는지 알려면 모델 구조를 직접 봐야 합니다.\r
  explanation: |-\r
    \`list(model.children())\` 는 ResNet의 최상위 레이어들을 리스트로 반환합니다. 마지막 두 개는 \`AdaptiveAvgPool2d\` 와 \`Linear(in_features=512, out_features=1000)\` 입니다.\r
\r
    Linear가 분류층이므로 이 직전까지 살리면 512차원 풀링 결과가 됩니다.\r
  tips:\r
  - ResNet18의 임베딩 차원은 512입니다. ResNet50은 2048입니다.\r
  snippet: |-\r
    import torch\r
    import torchvision\r
    from torchvision.models import resnet18, ResNet18_Weights\r
    import torch.nn as nn\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    weights = ResNet18_Weights.DEFAULT\r
    model = resnet18(weights=weights)\r
    model.eval()\r
    layers = list(model.children())\r
    [type(layer).__name__ for layer in layers]\r
  exercise:\r
    prompt: 마지막 두 레이어의 타입을 정확히 출력하세요.\r
    starterCode: |-\r
      lastTwo = [type(layer).__name__ for layer in layers[___:]]\r
      lastTwo\r
    hints:\r
    - "-2 가 마지막 두 개 슬라이스 시작입니다."\r
    - 결과는 AdaptiveAvgPool2d와 Linear입니다.\r
  check:\r
    noError: children 추출이 오류 없이 끝나야 합니다.\r
    resultCheck: layers의 길이가 10 정도여야 합니다.\r
- id: drop_fc\r
  title: 2단계. 마지막 fc 제거\r
  structuredPrimary: true\r
  subtitle: nn.Sequential로 새 모델\r
  goal: 분류층을 빼고 임베딩 추출기 모델을 만듭니다.\r
  why: 임베딩을 얻으려면 fc 직전까지의 결과를 사용해야 합니다.\r
  explanation: |-\r
    \`nn.Sequential(*layers[:-1])\` 는 마지막 fc만 빠진 새 모듈입니다. 출력은 (1, 512, 1, 1) 모양으로, 마지막 두 축은 풀링으로 1이 되어 있습니다.\r
\r
    flatten 또는 squeeze로 (1, 512) 모양으로 만들면 임베딩이 됩니다.\r
  tips:\r
  - layers[:-1] 는 마지막 한 개를 제외한 리스트입니다. 분류층(Linear)만 빠지고 풀링은 남습니다.\r
  snippet: |-\r
    encoder = nn.Sequential(*layers[:-1])\r
    encoder.eval()\r
    type(encoder).__name__, sum(1 for _ in encoder.children())\r
  exercise:\r
    prompt: 새 encoder의 마지막 자식 레이어 타입을 확인하세요.\r
    starterCode: |-\r
      lastChild = list(encoder.children())[___]\r
      type(lastChild).__name__\r
    hints:\r
    - 마지막은 -1입니다.\r
    - 결과는 AdaptiveAvgPool2d 입니다.\r
  check:\r
    noError: Sequential 생성이 오류 없이 끝나야 합니다.\r
    resultCheck: type(encoder).__name__이 'Sequential' 이어야 합니다.\r
- id: extract_embedding\r
  title: 3단계. 임베딩 추출\r
  structuredPrimary: true\r
  subtitle: (1, 512) 형태\r
  goal: 단일 이미지를 encoder에 통과시켜 (1, 512) 임베딩을 얻습니다.\r
  why: 임베딩이 한 줄 호출로 얻어진다는 점을 직접 확인해야 합니다.\r
  explanation: |-\r
    같은 전처리 (weights.transforms) 로 입력을 만든 뒤 encoder를 호출합니다. 결과는 (1, 512, 1, 1) 이므로 \`.flatten(1)\` 으로 (1, 512) 로 펴면 됩니다.\r
\r
    \`weights.transforms()\` 전처리는 PIL Image나 torch Tensor만 받으므로, \`load_sample_image\` 가 준 numpy ndarray는 \`Image.fromarray(...)\` 로 감싸 전달합니다.\r
\r
    numpy로 변환하면 \`.detach().numpy()\` 를 거칩니다.\r
  tips:\r
  - flatten(1) 은 인덱스 1 차원 이후를 모두 한 차원으로 합칩니다. squeeze 보다 안전합니다.\r
  - weights.transforms() 전처리는 ndarray를 거부합니다. Image.fromarray로 PIL Image로 바꿔 넣으세요.\r
  snippet: |-\r
    from PIL import Image\r
\r
    preprocess = weights.transforms()\r
    china = load_sample_image('china.jpg')\r
    batch = preprocess(Image.fromarray(china)).unsqueeze(0)\r
    with torch.inference_mode():\r
        feat = encoder(batch).flatten(1)\r
    feat.shape, feat.dtype\r
  exercise:\r
    prompt: flower 이미지의 임베딩 featFlower 를 같은 방식으로 얻으세요.\r
    starterCode: |-\r
      flower = load_sample_image('flower.jpg')\r
      batchFlower = preprocess(Image.fromarray(flower)).unsqueeze(0)\r
      with torch.inference_mode():\r
          featFlower = encoder(batchFlower).flatten(___)\r
      featFlower.shape\r
    hints:\r
    - 빈칸은 정수 1입니다.\r
    - 결과 shape은 (1, 512) 입니다.\r
  check:\r
    noError: 임베딩 추출이 오류 없이 끝나야 합니다.\r
    resultCheck: feat.shape이 torch.Size([1, 512]) 이어야 합니다.\r
- id: l2_normalize\r
  title: 4단계. L2 정규화\r
  structuredPrimary: true\r
  subtitle: 코사인 비교 준비\r
  goal: 임베딩을 단위 벡터로 만들어 코사인 거리 비교를 준비합니다.\r
  why: 정규화한 두 벡터의 내적이 곧 코사인 유사도이므로 비교가 단순해집니다.\r
  explanation: |-\r
    \`torch.nn.functional.normalize(feat, dim=1)\` 가 L2 정규화의 표준 호출입니다. 결과 벡터의 norm은 정확히 1이 됩니다.\r
\r
    이렇게 정규화한 벡터는 코사인 유사도 = 내적이라는 단순한 관계를 가집니다.\r
  tips:\r
  - L2 정규화는 큰 활성과 작은 활성의 절대 크기 차이를 없애 비교를 일관되게 만듭니다.\r
  snippet: |-\r
    import torch.nn.functional as F\r
\r
    featNorm = F.normalize(feat, dim=1)\r
    float(featNorm.norm())\r
  exercise:\r
    prompt: flower 임베딩을 정규화한 featFlowerNorm을 만들고 norm을 확인하세요.\r
    starterCode: |-\r
      featFlowerNorm = F.normalize(featFlower, dim=___)\r
      float(featFlowerNorm.norm())\r
    hints:\r
    - dim=1로 임베딩 축을 따라 정규화합니다.\r
    - 정규화 후 norm은 1.0 입니다.\r
  check:\r
    noError: 정규화 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: featNorm의 norm이 0.99 < norm < 1.01 사이여야 합니다.\r
- id: distance_compare\r
  title: 5단계. 거리 비교\r
  structuredPrimary: true\r
  subtitle: 같은/다른 사진 거리\r
  goal: china와 flower 임베딩의 코사인 유사도와, 자기 자신과의 유사도를 비교합니다.\r
  why: 같은 사진은 1에 가까운 유사도, 다른 사진은 더 낮은 값이 되어야 합니다.\r
  explanation: |-\r
    정규화된 두 벡터의 내적은 코사인 유사도입니다. 같은 벡터는 1, 완전히 직교하면 0이 됩니다.\r
\r
    같은 사진이라도 약간의 노이즈(전처리, 회전 등)가 있으면 1보다 살짝 작아질 수 있습니다.\r
  tips:\r
  - 코사인 유사도가 모든 사진 쌍에서 0.99 이상이면 모델이 사진을 충분히 구분하지 못한다는 신호일 수 있습니다.\r
  snippet: |-\r
    flower = load_sample_image('flower.jpg')\r
    batchFlower = preprocess(Image.fromarray(flower)).unsqueeze(0)\r
    with torch.inference_mode():\r
        featFlower = encoder(batchFlower).flatten(1)\r
    featFlowerNorm = F.normalize(featFlower, dim=1)\r
\r
    sameSim = float((featNorm * featNorm).sum())\r
    diffSim = float((featNorm * featFlowerNorm).sum())\r
    sameSim, diffSim\r
  exercise:\r
    prompt: china와 china를 좌우 반전한 사진의 임베딩을 만들고 코사인 유사도를 비교하세요.\r
    starterCode: |-\r
      mirrored = china[:, ::-1, :].copy()\r
      batchMirror = preprocess(Image.fromarray(mirrored)).unsqueeze(0)\r
      with torch.inference_mode():\r
          featMirror = encoder(batchMirror).flatten(1)\r
      featMirrorNorm = F.normalize(featMirror, dim=1)\r
      mirrorSim = float((featNorm * featMirrorNorm).sum())\r
      mirrorSim, ___\r
    hints:\r
    - 빈칸은 sameSim 같은 비교 변수입니다.\r
    - mirrored는 ndarray이므로 Image.fromarray로 감싸 전처리에 넣습니다.\r
    - 좌우 반전 사진은 유사도가 1보다 살짝 작아야 정상입니다.\r
  check:\r
    noError: 코사인 계산이 오류 없이 끝나야 합니다.\r
    resultCheck: sameSim이 0.99 이상이어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 임베딩 통계 분석\r
  goal: 임베딩의 분포를 히스토그램으로 그리고 두 사진의 차이를 막대로 비교합니다.\r
  why: 임베딩의 어떤 차원이 두 사진을 구분하는지 시각적으로 봐야 직관이 생깁니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 임베딩 차원의 값들 자체에는 직접적인 의미가 없지만, 분포의 모양과 차이는 분석에 의미가 있습니다.\r
  snippet: |-\r
    chinaArr = featNorm.detach().numpy().ravel()\r
    flowerArr = featFlowerNorm.detach().numpy().ravel()\r
    diff = np.abs(chinaArr - flowerArr)\r
    diff.shape, diff.max(), diff.mean()\r
  exercise:\r
    prompt: "미션1: china와 flower 임베딩의 히스토그램을 1x2 그리드로 그리세요. 미션2: 두 임베딩의 차이가 큰 상위 10개 차원의 인덱스를 출력하세요."\r
    starterCode: |-\r
      fig, axes = plt.subplots(1, 2, figsize=(10, 4))\r
      axes[0].hist(chinaArr, bins=40, color='steelblue')\r
      axes[0].set_title('china embedding')\r
      axes[1].hist(flowerArr, bins=40, color='orange')\r
      axes[1].set_title('flower embedding')\r
      fig\r
    hints:\r
    - "차이 상위 10개 인덱스는 np.argsort(diff)[-10:] 한 줄입니다."\r
    - 히스토그램은 두 분포가 비슷할 수도 있고 다를 수도 있습니다.\r
  check:\r
    noError: 임베딩 분석이 오류 없이 끝나야 합니다.\r
    resultCheck: chinaArr와 flowerArr의 길이가 512여야 합니다.\r
`;export{e as default};