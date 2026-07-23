var e=`meta:\r
  id: deepVision_08\r
  title: 전이학습 fine-tune\r
  order: 8\r
  category: deepVision\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 중급\r
  packages:\r
  - matplotlib
  - numpy
  - pillow
  - scikit-learn
  - torch\r
  - torchvision\r
  tags:\r
  - torchvision\r
  - 전이학습\r
  - finetune\r
  - requires_grad\r
  - 학습\r
  seo:\r
    title: 딥러닝 비전 - 전이학습 fine-tune\r
    description: 사전학습 ResNet18의 마지막 층만 새 클래스에 맞게 학습하는 전이학습 패턴을 익힙니다.\r
    keywords:\r
    - 전이학습\r
    - finetune\r
    - ResNet\r
    - PyTorch\r
    - 학습\r
intro:\r
  emoji: 🎓\r
  goal: 사전학습 ResNet의 마지막 층만 작은 데이터로 학습해 두 가지 클래스 분류기를 만듭니다.\r
  description: |-\r
    이 강의는 처음으로 모델을 직접 학습시킵니다. 단, 모든 파라미터가 아닌 마지막 분류층만 학습합니다. 입력 데이터는 sklearn의 china와 flower 이미지를 변형해 만든 24장 합성 데이터셋입니다. 3 에폭 안에 끝나는 toy 학습으로 전이학습의 표준 흐름을 익힙니다.\r
  direction: 사전학습 ResNet에서 분류층을 새로 갈아 끼우고 그 층만 학습하는 표준 전이학습 흐름을 구현합니다.\r
  benefits:\r
  - requires_grad 설정으로 일부 파라미터만 학습 대상으로 만듭니다.\r
  - 작은 데이터셋·작은 에폭으로 학습 흐름을 검증합니다.\r
  - 학습 전과 후의 정확도를 비교해 전이학습의 효과를 확인합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 합성 데이터셋 만들기\r
      detail: 두 클래스 각각 12장씩.\r
    - label: 2단계. 모델 준비 + freeze\r
      detail: 분류층을 갈아 끼우고 다른 층은 동결.\r
    - label: 3단계. 학습 루프\r
      detail: 3 에폭, CrossEntropy.\r
    - label: 4단계. 학습 전/후 정확도\r
      detail: 학습 효과 확인.\r
    - label: 5단계. 검증 시각화\r
      detail: 새 사진에 예측 결과.\r
    runtime:\r
    - label: PyTorch 환경\r
      detail: torchvision + torch.optim 사용. CPU에서 3 에폭이 1~2분 안에 끝납니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: build_dataset\r
  title: 1단계. 합성 데이터셋 만들기\r
  structuredPrimary: true\r
  subtitle: 두 클래스 각각 12장\r
  goal: china와 flower 각각에서 변형된 12장씩 모은 데이터셋을 만듭니다.\r
  why: 외부 데이터셋 의존 없이 학습 흐름을 끝까지 실행할 수 있어야 합니다.\r
  explanation: |-\r
    원본 + 회전·뒤집기·노이즈로 12개 변형을 만듭니다. 두 클래스이므로 라벨은 0(china), 1(flower) 입니다.\r
\r
    데이터셋은 (텐서, 라벨) 튜플의 리스트로 만들어 두면 torch.utils.data.DataLoader 없이도 학습이 가능합니다.\r
  tips:\r
  - 합성 데이터셋은 변화량이 작아 학습이 매우 빠릅니다. 실제로는 더 많은 데이터와 더 큰 변화가 필요합니다.\r
  snippet: |-\r
    import torch\r
    import torch.nn as nn\r
    import torch.optim as optim\r
    import torch.nn.functional as F\r
    import torchvision\r
    from torchvision.models import resnet18, ResNet18_Weights\r
    from torchvision import transforms\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    china = load_sample_image('china.jpg')\r
    flower = load_sample_image('flower.jpg')\r
\r
    def augment(img, seed):\r
        rng = np.random.RandomState(seed)\r
        rotated = np.rot90(img, k=rng.choice([0, 1, 2, 3])).copy()\r
        if rng.random() < 0.5:\r
            rotated = rotated[:, ::-1].copy()\r
        noisy = (rotated.astype(np.float32) + rng.normal(0, 8, rotated.shape)).clip(0, 255).astype(np.uint8)\r
        return noisy\r
\r
    chinaSet = [(augment(china, seed=i), 0) for i in range(12)]\r
    flowerSet = [(augment(flower, seed=i + 100), 1) for i in range(12)]\r
    dataset = chinaSet + flowerSet\r
    len(dataset), dataset[0][1], dataset[-1][1]\r
  exercise:\r
    prompt: 데이터셋의 라벨 0 개수와 라벨 1 개수를 출력하세요.\r
    starterCode: |-\r
      labels = [pair[1] for pair in dataset]\r
      labelZero = labels.count(___)\r
      labelOne = labels.count(1)\r
      labelZero, labelOne\r
    hints:\r
    - 빈칸은 정수 0입니다.\r
    - 각 라벨은 12개씩이어야 합니다.\r
  check:\r
    noError: 데이터셋 생성이 오류 없이 끝나야 합니다.\r
    resultCheck: len(dataset) 가 24여야 합니다.\r
- id: prepare_model\r
  title: 2단계. 모델 준비 + freeze\r
  structuredPrimary: true\r
  subtitle: 분류층 교체\r
  goal: 사전학습 ResNet18을 가져와 fc 층을 2클래스용으로 갈아 끼우고 다른 층은 학습에서 제외합니다.\r
  why: 사전학습된 가중치는 그대로 두고 마지막 층만 학습하는 것이 전이학습의 표준입니다.\r
  explanation: |-\r
    \`model.fc = nn.Linear(512, 2)\` 로 분류층을 새 Linear로 교체합니다. 이 층의 파라미터는 자동으로 requires_grad=True 가 됩니다.\r
\r
    다른 층의 파라미터는 \`param.requires_grad = False\` 로 동결합니다. 이렇게 하면 옵티마이저가 학습 가능한 파라미터만 다룹니다.\r
  tips:\r
  - 학습 가능한 파라미터 수를 출력해 두면 freeze가 의도대로 됐는지 확인할 수 있습니다.\r
  snippet: |-\r
    weights = ResNet18_Weights.DEFAULT\r
    model = resnet18(weights=weights)\r
    for param in model.parameters():\r
        param.requires_grad = False\r
    model.fc = nn.Linear(512, 2)\r
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)\r
    total = sum(p.numel() for p in model.parameters())\r
    trainable, total\r
  exercise:\r
    prompt: 학습 가능한 파라미터가 fc 층의 가중치 + bias와 같은지 확인하세요.\r
    starterCode: |-\r
      fcWeight = model.fc.weight.numel()\r
      fcBias = model.fc.bias.numel()\r
      expected = fcWeight + fcBias\r
      trainable == ___\r
    hints:\r
    - 빈칸은 expected 변수입니다.\r
    - 결과는 True여야 합니다.\r
  check:\r
    noError: 모델 교체와 freeze가 오류 없이 끝나야 합니다.\r
    resultCheck: trainable이 1026 정도여야 합니다(512*2 + 2).\r
- id: train_loop\r
  title: 3단계. 학습 루프\r
  structuredPrimary: true\r
  subtitle: 3 에폭 CrossEntropy\r
  goal: 작은 데이터셋과 3 에폭으로 모델을 학습합니다.\r
  why: 학습 루프의 표준 패턴을 직접 한 번 작성해 봐야 학습이 무엇을 하는지 와닿습니다.\r
  explanation: |-\r
    각 에폭마다 데이터셋을 셔플해 한 장씩 (또는 작은 배치) 모델에 통과시키고, CrossEntropyLoss로 손실을 계산하고, optimizer.step으로 가중치를 갱신합니다.\r
\r
    \`weights.transforms()\` 권장 전처리는 PIL Image나 텐서만 받습니다. 데이터셋의 이미지는 numpy 배열이므로 \`Image.fromarray\` 로 PIL Image로 바꿔 넣습니다.\r
\r
    합성 데이터가 단순해 3 에폭 안에 손실이 충분히 줄어듭니다.\r
  tips:\r
  - 학습 시 model.train(), 추론 시 model.eval() 을 호출해 모드를 정확히 맞춥니다.\r
  - 권장 transforms는 numpy 배열을 거부하므로 Image.fromarray로 PIL Image로 변환해 넣습니다.\r
  snippet: |-\r
    from PIL import Image\r
\r
    preprocess = weights.transforms()\r
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-3)\r
    lossFn = nn.CrossEntropyLoss()\r
    losses = []\r
    rng = np.random.RandomState(0)\r
    model.train()\r
    for epoch in range(3):\r
        order = rng.permutation(len(dataset))\r
        for idx in order:\r
            img, label = dataset[idx]\r
            batch = preprocess(Image.fromarray(img)).unsqueeze(0)\r
            target = torch.tensor([label])\r
            optimizer.zero_grad()\r
            logits = model(batch)\r
            loss = lossFn(logits, target)\r
            loss.backward()\r
            optimizer.step()\r
            losses.append(float(loss))\r
    losses[0], losses[-1], len(losses)\r
  exercise:\r
    prompt: 학습 손실의 시계열을 그래프로 그리세요.\r
    starterCode: |-\r
      fig = plt.figure(figsize=(7, 3))\r
      plt.plot(losses)\r
      plt.xlabel('step')\r
      plt.ylabel('___')\r
      fig\r
    hints:\r
    - 빈칸은 'loss' 입니다.\r
    - 손실이 점진적으로 줄어야 합니다.\r
  check:\r
    noError: 학습 루프가 오류 없이 끝나야 합니다.\r
    resultCheck: losses의 길이가 72(=24*3) 여야 합니다.\r
- id: evaluate\r
  title: 4단계. 학습 전/후 정확도\r
  structuredPrimary: true\r
  subtitle: 단순 정확도 비교\r
  goal: 학습 후 모델의 데이터셋 정확도를 측정합니다.\r
  why: 학습 효과를 정량적으로 확인하려면 정확도 비교가 가장 직관적입니다.\r
  explanation: |-\r
    데이터셋의 모든 사진에 추론을 적용해 argmax 라벨이 실제 라벨과 같은지 세면 정확도가 됩니다. 합성 데이터셋이 단순하므로 학습 후 100%에 가깝게 나옵니다.\r
  tips:\r
  - 정확도는 학습이 잘 됐는지 빠르게 확인하는 가장 단순한 지표입니다.\r
  snippet: |-\r
    from PIL import Image\r
\r
    model.eval()\r
    correct = 0\r
    with torch.inference_mode():\r
        for img, label in dataset:\r
            logits = model(preprocess(Image.fromarray(img)).unsqueeze(0))\r
            pred = int(logits.argmax(dim=1))\r
            if pred == label:\r
                correct += 1\r
    accuracy = correct / len(dataset)\r
    accuracy\r
  exercise:\r
    prompt: 학습 가중치를 망가뜨리지 않고 첫 두 사진의 logits을 출력해 모델이 얼마나 자신감 있는지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
\r
      model.eval()\r
      with torch.inference_mode():\r
          logitsA = model(preprocess(Image.fromarray(dataset[0][0])).unsqueeze(0))\r
          logitsB = model(preprocess(Image.fromarray(dataset[___][0])).unsqueeze(0))\r
      logitsA, logitsB\r
    hints:\r
    - 빈칸은 정수 1 입니다.\r
    - 두 logits의 argmax가 실제 라벨과 일치해야 합니다.\r
  check:\r
    noError: 정확도 계산이 오류 없이 끝나야 합니다.\r
    resultCheck: accuracy가 0.5 이상이어야 합니다.\r
- id: visual_check\r
  title: 5단계. 검증 시각화\r
  structuredPrimary: true\r
  subtitle: 새 사진에 예측\r
  goal: 합성 데이터에 없던 변형을 만들어 모델이 일반화되는지 확인합니다.\r
  why: 데이터셋 내부 정확도가 100%여도 새 변형에 약할 수 있습니다.\r
  explanation: |-\r
    새 변형(예: 데이터셋과 다른 seed로 만든 china 변형 한 장) 에 모델을 적용해 예측 라벨을 확인합니다.\r
  tips:\r
  - 작은 데이터셋의 전이학습은 항상 일반화 실패 위험이 있습니다. 새 변형 검증은 그 위험을 빠르게 발견합니다.\r
  snippet: |-\r
    from PIL import Image\r
\r
    newImg = augment(china, seed=999)\r
    with torch.inference_mode():\r
        newLogits = model(preprocess(Image.fromarray(newImg)).unsqueeze(0))\r
    newPred = int(newLogits.argmax(dim=1))\r
    fig, axis = plt.subplots(figsize=(5, 4))\r
    axis.imshow(newImg)\r
    axis.set_title(f'pred={newPred} (0=china, 1=flower)')\r
    axis.axis('off')\r
    fig\r
  exercise:\r
    prompt: 새 flower 변형 한 장으로도 같은 검증을 하세요.\r
    starterCode: |-\r
      from PIL import Image\r
\r
      newFlower = augment(flower, seed=___)\r
      with torch.inference_mode():\r
          newFlowerLogits = model(preprocess(Image.fromarray(newFlower)).unsqueeze(0))\r
      newFlowerPred = int(newFlowerLogits.argmax(dim=1))\r
      fig2, axis2 = plt.subplots(figsize=(5, 4))\r
      axis2.imshow(newFlower)\r
      axis2.set_title(f'pred={newFlowerPred}')\r
      axis2.axis('off')\r
      fig2\r
    hints:\r
    - 빈칸은 새 seed(예: 1000) 입니다.\r
    - 결과가 1이면 flower를 정확히 분류한 것입니다.\r
  check:\r
    noError: 검증 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: newPred가 0 또는 1이어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 학습 동결 효과 비교\r
  goal: freeze 없이 fc만 학습한 모델과 모든 층 학습 모델을 학습 시간으로 비교합니다.\r
  why: 전이학습의 "필요한 만큼만 학습" 철학을 직접 측정으로 확인합니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 학습 가능한 파라미터가 적을수록 1 step의 backward가 빠릅니다.\r
  snippet: |-\r
    paramCounts = {\r
        "frozen": sum(p.numel() for p in model.parameters() if p.requires_grad),\r
        "total": sum(p.numel() for p in model.parameters()),\r
    }\r
    paramCounts\r
  exercise:\r
    prompt: "미션1: 학습 데이터의 분류 정확도와 새 검증(첫 5개 seed) 사진의 정확도를 비교해 출력하세요. 미션2: 모델 fc 층의 가중치 평균과 표준편차를 학습 전과 비교하기 위해 출력하세요(학습 후 값만)."\r
    starterCode: |-\r
      from PIL import Image\r
\r
      correctNew = 0\r
      for seed in range(5):\r
          img = augment(china, seed=2000 + seed)\r
          with torch.inference_mode():\r
              logitsC = model(preprocess(Image.fromarray(img)).unsqueeze(0))\r
          if int(logitsC.argmax(dim=1)) == 0:\r
              correctNew += 1\r
      ratio = correctNew / ___\r
      ratio\r
    hints:\r
    - 빈칸은 정수 5 입니다.\r
    - "결과가 1.0이면 모든 새 china 변형을 정확히 분류한 것입니다."\r
  check:\r
    noError: 비교 검증이 오류 없이 끝나야 합니다.\r
    resultCheck: paramCounts의 frozen이 total보다 작아야 합니다.\r
`;export{e as default};