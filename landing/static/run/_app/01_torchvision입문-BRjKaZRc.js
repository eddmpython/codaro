var e=`meta:\r
  id: deepVision_01\r
  title: torchvision 입문과 텐서 변환\r
  order: 1\r
  category: deepVision\r
  difficulty: ⭐⭐\r
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
  - 텐서\r
  - ToTensor\r
  - normalize\r
  - 사전학습\r
  seo:\r
    title: 딥러닝 비전 - torchvision 입문\r
    description: torchvision의 텐서 변환, 정규화, 사전학습 모델 호출 흐름을 익힙니다.\r
    keywords:\r
    - torchvision\r
    - 텐서\r
    - PyTorch\r
    - 사전학습\r
    - 정규화\r
intro:\r
  emoji: 🧠\r
  goal: numpy 이미지와 torch 텐서 사이를 자유롭게 변환하고 사전학습 모델 호출 형식을 익힙니다.\r
  description: |-\r
    딥러닝 비전 트랙의 첫 강의입니다. 모든 사전학습 모델은 numpy ndarray가 아닌 torch 텐서를 입력으로 받으며, 채널 순서·정규화·차원 순서가 일관되어야 정확히 동작합니다. 이 강의는 그 인터페이스를 익히고 다음 강의의 분류 추론 준비를 마칩니다.\r
  direction: ndarray → tensor → 정규화 → 모델 입력 형식까지의 변환 흐름을 단계별로 만듭니다.\r
  benefits:\r
  - torchvision.transforms로 표준 전처리를 한 줄에 끝낼 수 있습니다.\r
  - 채널 순서 (H, W, C) ↔ (C, H, W) 변환과 dtype 캐스팅을 직접 처리할 수 있습니다.\r
  - 사전학습 가중치 객체에서 권장 transforms와 카테고리 라벨을 꺼낼 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 임포트\r
      detail: torch, torchvision, transforms 모듈을 가져옵니다.\r
    - label: 2단계. ndarray → tensor\r
      detail: ToTensor 한 줄로 0~1 float 텐서로.\r
    - label: 3단계. 차원 순서 이해\r
      detail: (H, W, C) vs (C, H, W) 차이.\r
    - label: 4단계. 정규화 적용\r
      detail: ImageNet 평균·표준편차로 정규화.\r
    - label: 5단계. weights 객체에서 메타 꺼내기\r
      detail: 권장 transforms와 카테고리.\r
    runtime:\r
    - label: PyTorch 환경\r
      detail: torch, torchvision, matplotlib, sklearn 으로 학습합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: imports\r
  title: 1단계. 라이브러리 임포트\r
  structuredPrimary: true\r
  subtitle: torch와 torchvision\r
  goal: 학습에 필요한 모든 라이브러리를 한 번에 가져옵니다.\r
  why: 환경이 갖춰져 있는지 import 한 번으로 빠르게 확인할 수 있습니다.\r
  explanation: |-\r
    \`import torch\` 가 실패하면 PyTorch가 설치되지 않은 환경입니다. \`torchvision\` 은 PyTorch 위에 비전 도구를 얹은 라이브러리이며, transforms 서브모듈에 표준 전처리가 들어 있습니다.\r
\r
    버전을 출력해 두면 환경 디버깅에 유용합니다.\r
  tips:\r
  - PyTorch는 사전학습 가중치를 처음 호출할 때 자동 다운로드합니다. 첫 호출이 느리거나 네트워크 의존이 있다는 점을 기억하세요.\r
  snippet: |-\r
    import torch\r
    import torchvision\r
    from torchvision import transforms\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    torch.__version__, torchvision.__version__\r
  exercise:\r
    prompt: torch가 CPU 모드에서 동작하고 있는지 확인하세요.\r
    starterCode: |-\r
      torch.cuda.is_available(), torch.get_num_threads()\r
    hints:\r
    - is_available은 GPU가 있고 PyTorch가 인식하면 True입니다.\r
    - 스레드 수는 운영체제 코어 수에 따라 다릅니다.\r
  check:\r
    noError: 모든 import가 오류 없이 끝나야 합니다.\r
    resultCheck: torch.__version__이 문자열이어야 합니다.\r
- id: to_tensor\r
  title: 2단계. ndarray → tensor\r
  structuredPrimary: true\r
  subtitle: ToTensor 한 줄\r
  goal: numpy 이미지를 0~1 범위의 float 텐서로 변환합니다.\r
  why: 모든 PyTorch 모델 입력의 첫 단계가 이 변환입니다.\r
  explanation: |-\r
    \`transforms.ToTensor()\` 는 ndarray 또는 PIL Image를 받아 (C, H, W) 모양의 float32 텐서로 만듭니다. 값 범위도 0~255에서 0~1로 자동 정규화됩니다.\r
\r
    같은 일을 직접 하면 \`torch.from_numpy(img).permute(2, 0, 1).float() / 255.0\` 가 됩니다. transforms.ToTensor가 이 패턴을 한 줄로 감춥니다.\r
  tips:\r
  - 차원 순서가 (C, H, W) 로 바뀌었다는 점을 항상 확인하세요. matplotlib으로 직접 imshow하려면 다시 (H, W, C)로 돌려야 합니다.\r
  snippet: |-\r
    china = load_sample_image('china.jpg')\r
    toTensor = transforms.ToTensor()\r
    chinaTensor = toTensor(china)\r
    chinaTensor.shape, chinaTensor.dtype, float(chinaTensor.min()), float(chinaTensor.max())\r
  exercise:\r
    prompt: flower 이미지에도 같은 변환을 적용하고 텐서의 차원 순서를 확인하세요.\r
    starterCode: |-\r
      flower = load_sample_image('flower.jpg')\r
      flowerTensor = toTensor(___)\r
      flowerTensor.shape\r
    hints:\r
    - 빈칸은 변수명입니다.\r
    - 결과 shape의 첫 번째 차원은 채널 수입니다.\r
  check:\r
    noError: ToTensor 적용이 오류 없이 끝나야 합니다.\r
    resultCheck: chinaTensor.dtype이 torch.float32여야 합니다.\r
- id: dim_order\r
  title: 3단계. 차원 순서 이해\r
  structuredPrimary: true\r
  subtitle: (H, W, C) vs (C, H, W)\r
  goal: 두 차원 순서의 차이와 변환 방법을 익힙니다.\r
  why: 차원 순서를 잘못 두면 모델이 깨지거나 시각화에서 색이 뒤섞입니다.\r
  explanation: |-\r
    numpy 이미지는 보통 \`(H, W, C)\`, torch 텐서는 \`(C, H, W)\` 입니다. \`.permute(2, 0, 1)\` 또는 \`.permute(1, 2, 0)\` 으로 순서를 바꿉니다.\r
\r
    matplotlib에 시각화하려면 텐서를 다시 \`(H, W, C)\` 로 돌려놓고 numpy로 변환해야 합니다. 정규화된 텐서는 0~1 범위이므로 imshow가 그대로 받습니다.\r
  tips:\r
  - "permute 인자는 새 차원 순서이고, transpose는 두 축만 바꿉니다."\r
  snippet: |-\r
    backToHwc = chinaTensor.permute(1, 2, 0).numpy()\r
    fig = plt.figure(figsize=(5, 4))\r
    plt.imshow(backToHwc)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: flowerTensor를 (H, W, C) numpy로 되돌려 시각화하세요.\r
    starterCode: |-\r
      flowerHwc = flowerTensor.permute(___, ___, ___).numpy()\r
      fig2 = plt.figure(figsize=(5, 4))\r
      plt.imshow(flowerHwc)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - "permute 인자는 (1, 2, 0) 입니다."\r
    - 결과가 원본 flower와 같은 그림이어야 합니다.\r
  check:\r
    noError: permute와 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: backToHwc.shape의 마지막 차원이 3이어야 합니다.\r
- id: normalize\r
  title: 4단계. 정규화 적용\r
  structuredPrimary: true\r
  subtitle: ImageNet 평균과 표준편차\r
  goal: 사전학습 모델이 기대하는 ImageNet 정규화를 적용합니다.\r
  why: 사전학습 모델은 학습 당시 사용한 정규화와 동일한 전처리를 기대합니다. 정규화를 빠뜨리면 정확도가 크게 떨어집니다.\r
  explanation: |-\r
    \`transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])\` 가 ImageNet 표준입니다. 평균을 빼고 표준편차로 나눕니다.\r
\r
    \`transforms.Compose([ToTensor, Normalize])\` 로 두 단계를 한 함수로 묶을 수 있습니다.\r
  tips:\r
  - 정규화 후 값 범위는 0~1이 아니라 약 -2.5 ~ 2.5 사이입니다. imshow에는 어울리지 않습니다.\r
  snippet: |-\r
    preprocess = transforms.Compose([\r
        transforms.ToTensor(),\r
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),\r
    ])\r
    chinaNorm = preprocess(china)\r
    float(chinaNorm.min()), float(chinaNorm.max()), chinaNorm.shape\r
  exercise:\r
    prompt: 같은 preprocess로 flower를 변환한 flowerNorm을 만들고 값 범위를 확인하세요.\r
    starterCode: |-\r
      flowerNorm = preprocess(___)\r
      float(flowerNorm.min()), float(flowerNorm.max())\r
    hints:\r
    - 빈칸은 변수명입니다.\r
    - 값 범위가 0~1을 벗어나야 정규화가 잘 적용된 것입니다.\r
  check:\r
    noError: 정규화 변환이 오류 없이 끝나야 합니다.\r
    resultCheck: chinaNorm의 최솟값이 0보다 작아야 합니다.\r
- id: weights_meta\r
  title: 5단계. weights 객체에서 메타 꺼내기\r
  structuredPrimary: true\r
  subtitle: 권장 transforms와 카테고리\r
  goal: 사전학습 가중치 객체에서 권장 전처리와 카테고리 라벨을 꺼냅니다.\r
  why: 모델마다 권장 전처리가 다릅니다. weights 객체가 모델과 묶어 제공하므로 그대로 쓰는 것이 안전합니다.\r
  explanation: |-\r
    PyTorch 0.13+ 부터 \`torchvision.models.<Model>_Weights.DEFAULT\` 가 표준 가중치 객체입니다. \`weights.transforms()\` 가 권장 전처리, \`weights.meta['categories']\` 가 클래스 라벨 리스트입니다.\r
\r
    이 메타데이터를 사용하면 모델별로 다른 전처리·라벨을 일관된 방법으로 다룰 수 있습니다. 다만 weights.transforms()는 numpy ndarray가 아니라 PIL Image(또는 텐서)를 입력으로 받으므로, sklearn 샘플 이미지 같은 ndarray는 Image.fromarray()로 변환해 넣습니다.\r
  tips:\r
  - 처음 호출 시 가중치 파일을 자동 다운로드합니다(약 40MB). 네트워크가 차단된 환경에서는 미리 캐시 디렉터리에 받아 두세요.\r
  snippet: |-\r
    from torchvision.models import ResNet18_Weights\r
    from PIL import Image\r
\r
    weights = ResNet18_Weights.DEFAULT\r
    autoPreprocess = weights.transforms()\r
    categories = weights.meta['categories']\r
    chinaAuto = autoPreprocess(Image.fromarray(china))\r
    len(categories), categories[0], categories[1]\r
  exercise:\r
    prompt: autoPreprocess로 china를 변환한 chinaAuto 텐서를 만들고 shape을 확인하세요.\r
    starterCode: |-\r
      chinaAuto = autoPreprocess(Image.fromarray(___))\r
      chinaAuto.shape, chinaAuto.dtype\r
    hints:\r
    - 빈칸은 numpy 이미지 변수(china)입니다. weights.transforms()는 PIL Image를 받으므로 Image.fromarray로 감쌉니다.\r
    - 결과는 자동으로 224x224 정도로 resize된 텐서입니다.\r
  check:\r
    noError: weights 메타데이터 추출이 오류 없이 끝나야 합니다.\r
    resultCheck: len(categories) 가 1000이어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 전처리 비교\r
  goal: 직접 만든 preprocess와 weights.transforms 의 결과를 비교합니다.\r
  why: 두 결과의 차이를 비교해야 함수형 transforms의 미묘한 차이를 안내할 수 있습니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 권장 transforms는 보통 resize와 center crop을 포함합니다.\r
  snippet: |-\r
    customShape = chinaNorm.shape\r
    autoShape = chinaAuto.shape\r
    customShape, autoShape\r
  exercise:\r
    prompt: "미션1: 두 텐서를 (H, W, C)로 다시 돌려 1x2 그리드로 시각화하세요(정규화된 값을 0~1로 클립한 후). 미션2: chinaAuto.mean(dim=(1, 2)) 를 출력해 채널별 평균이 0 근처인지 확인하세요."\r
    starterCode: |-\r
      customVis = chinaNorm.permute(1, 2, 0).numpy()\r
      autoVis = chinaAuto.permute(1, 2, 0).numpy()\r
      fig, axes = plt.subplots(1, 2, figsize=(10, 4))\r
      axes[0].imshow((customVis - customVis.min()) / (customVis.max() - customVis.min()))\r
      axes[0].set_title('custom normalized')\r
      axes[1].imshow((autoVis - autoVis.min()) / (autoVis.max() - autoVis.min()))\r
      axes[1].set_title('auto preprocess')\r
      for axis in axes:\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - 정규화된 값을 시각화하려면 min/max로 다시 0~1로 재정규화하면 됩니다.\r
    - 채널별 평균은 dim=(1, 2) 로 H, W 축 평균입니다.\r
  check:\r
    noError: 두 텐서 비교 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: customShape의 첫 차원과 autoShape의 첫 차원이 모두 3이어야 합니다.\r
`;export{e as default};