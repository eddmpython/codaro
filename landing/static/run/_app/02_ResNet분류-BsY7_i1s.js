var e=`meta:\r
  id: deepVision_02\r
  title: ResNet 사전학습 분류\r
  order: 2\r
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
  - 사전학습\r
  - 분류\r
  - ImageNet\r
  seo:\r
    title: 딥러닝 비전 - ResNet 사전학습 분류\r
    description: torchvision ResNet18로 ImageNet 1000클래스 분류 추론을 한 줄로 호출합니다.\r
    keywords:\r
    - ResNet\r
    - 사전학습\r
    - 분류\r
    - ImageNet\r
    - torchvision\r
intro:\r
  emoji: 🏷\r
  goal: 사전학습된 ResNet으로 사진 한 장의 ImageNet 클래스를 추론하고 상위 5개를 출력합니다.\r
  description: |-\r
    PyTorch의 사전학습 모델은 손쉽게 호출할 수 있는 강력한 도구입니다. 이 강의는 ResNet18 가중치를 가져와 단일 이미지에 추론을 적용하고, logits에서 top-5 클래스를 뽑는 표준 패턴을 익힙니다.\r
  direction: 모델을 평가 모드로 만들고, 단일 이미지를 전처리해 추론한 뒤 top-5 라벨을 표시합니다.\r
  benefits:\r
  - models.resnet18 한 줄로 사전학습 모델을 받습니다.\r
  - model.eval과 torch.inference_mode로 추론 모드를 정합니다.\r
  - logits에서 softmax 확률 top-5를 뽑는 패턴을 익힙니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 모델 로드\r
      detail: ResNet18을 사전학습 가중치로 만듭니다.\r
    - label: 2단계. 평가 모드 + inference_mode\r
      detail: 추론 모드 두 가지 설정.\r
    - label: 3단계. 단일 이미지 추론\r
      detail: 입력 텐서 (1, 3, H, W) 형식 만들기.\r
    - label: 4단계. top-5 클래스\r
      detail: softmax + topk + 라벨.\r
    - label: 5단계. 결과 시각화\r
      detail: 이미지 + 막대 그래프.\r
    runtime:\r
    - label: PyTorch 환경\r
      detail: torchvision, torch, sklearn, matplotlib.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: load_model\r
  title: 1단계. 모델 로드\r
  structuredPrimary: true\r
  subtitle: ResNet18 사전학습 가중치\r
  goal: torchvision.models.resnet18을 사전학습 가중치로 불러옵니다.\r
  why: 사전학습 모델은 직접 학습 없이 즉시 강력한 추론 능력을 제공합니다.\r
  explanation: |-\r
    \`from torchvision.models import resnet18, ResNet18_Weights\` 로 모델 클래스와 가중치 객체를 가져옵니다. \`resnet18(weights=ResNet18_Weights.DEFAULT)\` 호출이 사전학습 ResNet을 만들어 반환합니다.\r
\r
    처음 호출 시 가중치 파일을 다운로드합니다(약 45MB). 캐시 위치는 보통 \`~/.cache/torch/hub/checkpoints/\` 입니다.\r
  tips:\r
  - 모델 객체는 nn.Module의 서브클래스입니다. 일반 함수처럼 호출하면 forward 메서드가 실행됩니다.\r
  snippet: |-\r
    import torch\r
    import torchvision\r
    from torchvision.models import resnet18, ResNet18_Weights\r
    from torchvision import transforms\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    weights = ResNet18_Weights.DEFAULT\r
    model = resnet18(weights=weights)\r
    type(model).__name__\r
  exercise:\r
    prompt: 모델의 총 파라미터 수를 계산하세요.\r
    starterCode: |-\r
      paramCount = sum(p.numel() for p in model.___())\r
      paramCount\r
    hints:\r
    - 빈칸은 모듈의 파라미터 이터레이터를 반환하는 메서드 이름입니다.\r
    - ResNet18은 보통 11~12M 파라미터입니다.\r
  check:\r
    noError: 모델 로드가 오류 없이 끝나야 합니다.\r
    resultCheck: type(model).__name__이 'ResNet' 이어야 합니다.\r
- id: eval_mode\r
  title: 2단계. 평가 모드와 inference_mode\r
  structuredPrimary: true\r
  subtitle: 추론을 위한 두 설정\r
  goal: model.eval과 torch.inference_mode 두 가지를 함께 사용합니다.\r
  why: 두 설정 모두 추론 시 필요한 표준 패턴입니다.\r
  explanation: |-\r
    \`model.eval()\` 은 dropout과 batchnorm을 추론 모드로 바꿉니다. \`torch.inference_mode()\` 는 autograd 그래프를 만들지 않아 메모리와 속도를 최적화합니다.\r
\r
    두 설정을 빠뜨리면 동작은 하지만 결과가 다르거나 추론이 느려집니다.\r
  tips:\r
  - eval과 inference_mode는 서로 다른 일을 합니다. 둘 다 호출하는 것이 표준입니다.\r
  snippet: |-\r
    model.eval()\r
    isTraining = model.training\r
    isTraining\r
  exercise:\r
    prompt: inference_mode 컨텍스트 안에서 torch.tensor(1.0).requires_grad 가 False임을 확인하세요.\r
    starterCode: |-\r
      with torch.inference_mode():\r
          x = torch.tensor(1.0)\r
          flag = x.requires_grad\r
      ___\r
    hints:\r
    - 빈칸은 flag 변수입니다.\r
    - 결과는 False여야 합니다.\r
  check:\r
    noError: 평가 모드 설정이 오류 없이 끝나야 합니다.\r
    resultCheck: isTraining이 False여야 합니다.\r
- id: single_inference\r
  title: 3단계. 단일 이미지 추론\r
  structuredPrimary: true\r
  subtitle: (1, 3, H, W) 형식\r
  goal: 단일 이미지를 전처리해 배치 차원을 추가한 뒤 모델에 통과시킵니다.\r
  why: PyTorch 모델은 배치 차원을 항상 기대합니다. 단일 이미지도 (1, C, H, W) 형식이어야 합니다.\r
  explanation: |-\r
    \`preprocess(img)\` 결과는 (C, H, W)입니다. \`unsqueeze(0)\` 으로 맨 앞에 차원을 추가해 (1, C, H, W)로 만들면 됩니다.\r
\r
    \`weights.transforms()\` 가 만든 전처리는 PIL Image나 torch Tensor만 받습니다. \`load_sample_image\` 는 numpy ndarray를 반환하므로 \`Image.fromarray(...)\` 로 PIL Image로 감싼 뒤 전달합니다.\r
\r
    모델 호출 결과는 logits 텐서 (1, 1000) 입니다. 1000은 ImageNet 클래스 수입니다.\r
  tips:\r
  - torch.inference_mode 컨텍스트 안에서 모델을 호출하는 것을 잊지 마세요.\r
  - weights.transforms() 전처리는 ndarray를 거부합니다. Image.fromarray로 PIL Image로 바꿔 넣으세요.\r
  snippet: |-\r
    from PIL import Image\r
\r
    preprocess = weights.transforms()\r
    china = load_sample_image('china.jpg')\r
    batch = preprocess(Image.fromarray(china)).unsqueeze(0)\r
    with torch.inference_mode():\r
        logits = model(batch)\r
    batch.shape, logits.shape\r
  exercise:\r
    prompt: flower 이미지에도 같은 흐름을 적용해 logitsFlower를 얻으세요.\r
    starterCode: |-\r
      flower = load_sample_image('flower.jpg')\r
      batchFlower = preprocess(Image.fromarray(flower)).___(0)\r
      with torch.inference_mode():\r
          logitsFlower = model(batchFlower)\r
      logitsFlower.shape\r
    hints:\r
    - 빈칸은 batch 차원을 추가하는 메서드 이름입니다.\r
    - 결과 logits의 shape은 (1, 1000) 입니다.\r
  check:\r
    noError: 추론 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: logits.shape이 torch.Size([1, 1000]) 이어야 합니다.\r
- id: top5\r
  title: 4단계. top-5 클래스 뽑기\r
  structuredPrimary: true\r
  subtitle: softmax + topk + 라벨\r
  goal: logits에서 softmax 확률을 구하고 상위 5개 클래스를 라벨과 함께 출력합니다.\r
  why: 모델 결과를 사람이 읽을 수 있는 형식으로 변환하는 표준 패턴입니다.\r
  explanation: |-\r
    logits에 \`softmax(dim=1)\` 를 적용해 확률로 만들고, \`topk(5)\` 로 상위 5개 값과 인덱스를 얻습니다. 인덱스를 \`weights.meta['categories']\` 의 인덱스로 사용해 라벨로 변환합니다.\r
\r
    결과는 \`[(라벨, 확률), ...]\` 리스트로 정리하면 깔끔합니다.\r
  tips:\r
  - softmax는 logits을 0~1 범위 확률로 만듭니다. 합은 1이 됩니다.\r
  snippet: |-\r
    categories = weights.meta['categories']\r
    probs = torch.softmax(logits, dim=1).squeeze(0)\r
    topProbs, topIdx = probs.topk(5)\r
    chinaTop5 = [(categories[int(idx)], float(p)) for idx, p in zip(topIdx, topProbs)]\r
    chinaTop5\r
  exercise:\r
    prompt: flower 이미지의 top-3 라벨을 출력하세요.\r
    starterCode: |-\r
      probsFlower = torch.softmax(logitsFlower, dim=1).squeeze(0)\r
      topPF, topIF = probsFlower.topk(___)\r
      [(categories[int(i)], float(p)) for i, p in zip(topIF, topPF)]\r
    hints:\r
    - 빈칸은 정수 3입니다.\r
    - 결과는 라벨-확률 튜플 세 개입니다.\r
  check:\r
    noError: top-k 추출이 오류 없이 끝나야 합니다.\r
    resultCheck: chinaTop5의 길이가 5여야 합니다.\r
- id: visualize\r
  title: 5단계. 결과 시각화\r
  structuredPrimary: true\r
  subtitle: 이미지 + 막대 그래프\r
  goal: 입력 이미지와 top-5 확률 막대를 한 figure에 함께 그립니다.\r
  why: 결과를 한 화면에 모으면 모델의 자신감과 입력을 동시에 평가할 수 있습니다.\r
  explanation: |-\r
    1x2 subplots를 만들고 좌측에 이미지, 우측에 top-5 막대 그래프를 그립니다. matplotlib의 barh를 쓰면 가로 막대가 되어 라벨 길이가 길어도 깔끔합니다.\r
  tips:\r
  - barh의 y 인자는 위에서 아래로 그려지므로 결과 표시 순서가 거꾸로 보일 수 있습니다. 필요하면 invert_yaxis로 뒤집습니다.\r
  snippet: |-\r
    fig, axes = plt.subplots(1, 2, figsize=(11, 5))\r
    axes[0].imshow(china)\r
    axes[0].set_title('china')\r
    axes[0].axis('off')\r
    labels = [t[0] for t in chinaTop5]\r
    values = [t[1] for t in chinaTop5]\r
    axes[1].barh(range(5), values)\r
    axes[1].set_yticks(range(5))\r
    axes[1].set_yticklabels(labels)\r
    axes[1].invert_yaxis()\r
    axes[1].set_xlabel('probability')\r
    fig\r
  exercise:\r
    prompt: flower 이미지에 같은 패턴을 적용하세요.\r
    starterCode: |-\r
      flowerTop5 = [(categories[int(i)], float(p)) for i, p in zip(*probsFlower.topk(5))]\r
      fig2, axes2 = plt.subplots(1, 2, figsize=(11, 5))\r
      axes2[0].imshow(flower)\r
      axes2[0].axis('off')\r
      labelsF = [t[0] for t in flowerTop5]\r
      valuesF = [t[1] for t in flowerTop5]\r
      axes2[1].barh(range(5), valuesF)\r
      axes2[1].set_yticks(range(5))\r
      axes2[1].set_yticklabels(labelsF)\r
      axes2[1].invert_yaxis()\r
      ___\r
    hints:\r
    - 빈칸은 fig2 입니다.\r
    - 결과가 노트북에 인라인으로 출력됩니다.\r
  check:\r
    noError: 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: 5개 막대가 출력되어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 두 이미지 비교\r
  goal: 두 이미지의 top-5 결과를 한 화면에 비교합니다.\r
  why: 두 이미지를 비교하면 모델이 무엇을 다르게 보는지가 분명해집니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 모델 자신감이 낮은(top-1 확률이 작은) 이미지는 사진의 카테고리가 ImageNet 1000 클래스에 잘 매핑되지 않는다는 신호입니다.\r
  snippet: |-\r
    flower = load_sample_image('flower.jpg')\r
    batchFlower = preprocess(Image.fromarray(flower)).unsqueeze(0)\r
    with torch.inference_mode():\r
        logitsFlower = model(batchFlower)\r
    probsFlower = torch.softmax(logitsFlower, dim=1).squeeze(0)\r
    flowerTop5 = [(categories[int(i)], float(p)) for i, p in zip(*probsFlower.topk(5))]\r
\r
    chinaTop1 = chinaTop5[0]\r
    flowerTop1 = flowerTop5[0]\r
    {"china": chinaTop1, "flower": flowerTop1}\r
  exercise:\r
    prompt: "미션1: 두 이미지를 2x2 그리드로(좌측 사진, 우측 top-5 막대) 비교 출력하세요. 미션2: 두 이미지의 top-1 확률이 어느 쪽이 더 높은지 자동으로 텍스트로 출력하세요."\r
    starterCode: |-\r
      fig, axes = plt.subplots(2, 2, figsize=(11, 8))\r
      for row, (name, img, top) in enumerate([('china', china, chinaTop5), ('flower', flower, flowerTop5)]):\r
          axes[row, 0].imshow(img)\r
          axes[row, 0].set_title(name)\r
          axes[row, 0].axis('off')\r
          labelsR = [t[0] for t in top]\r
          valuesR = [t[1] for t in top]\r
          axes[row, 1].barh(range(5), valuesR)\r
          axes[row, 1].set_yticks(range(5))\r
          axes[row, 1].set_yticklabels(labelsR)\r
          axes[row, 1].invert_yaxis()\r
      fig\r
    hints:\r
    - 두 사진의 자신감 차이는 카테고리 적합성을 반영합니다.\r
    - 텍스트 출력은 f-string으로 짧게 합니다.\r
  check:\r
    noError: 비교 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: chinaTop1과 flowerTop1 모두 (str, float) 튜플이어야 합니다.\r
`;export{e as default};