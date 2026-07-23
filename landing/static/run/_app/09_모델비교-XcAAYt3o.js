var e=`meta:\r
  id: deepVision_09\r
  title: 모델 비교 - 정확도와 속도\r
  order: 9\r
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
  - 모델비교\r
  - 정확도\r
  - 속도\r
  - 벤치마크\r
  seo:\r
    title: 딥러닝 비전 - 모델 비교\r
    description: ResNet18과 ResNet50의 정확도와 속도를 같은 사진으로 비교합니다.\r
    keywords:\r
    - 모델비교\r
    - 정확도\r
    - 속도\r
    - 벤치마크\r
    - torchvision\r
intro:\r
  emoji: ⚖️\r
  goal: 같은 사진에 두 모델을 적용해 top-1 일치율과 추론 속도를 비교합니다.\r
  description: |-\r
    응용에 어떤 모델을 쓸지는 정확도와 속도의 트레이드오프로 결정됩니다. 이 강의는 작은 ResNet18과 큰 ResNet50을 같은 사진에 적용해 두 지표를 직접 측정합니다.\r
  direction: 두 모델을 같은 이미지에 적용해 top-1 라벨과 추론 시간을 측정해 비교합니다.\r
  benefits:\r
  - time.perf_counter로 추론 시간을 측정할 수 있습니다.\r
  - 두 모델의 top-1 결과를 비교해 일치율을 계산합니다.\r
  - 표 또는 막대 그래프로 비교 결과를 시각화합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 두 모델 로드\r
      detail: ResNet18과 ResNet50을 모두 사전학습으로 가져옵니다.\r
    - label: 2단계. 공통 입력 준비\r
      detail: 같은 사진 두 장을 같은 방식으로 전처리합니다.\r
    - label: 3단계. 추론 시간 측정\r
      detail: time.perf_counter로 평균을 잽니다.\r
    - label: 4단계. top-1 비교\r
      detail: 두 모델의 결과 라벨이 일치하는지.\r
    - label: 5단계. 결과 표\r
      detail: dict 한 줄로 정리.\r
    runtime:\r
    - label: PyTorch 환경\r
      detail: torchvision의 두 ResNet과 time 모듈을 사용합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: load_models\r
  title: 1단계. 두 모델 로드\r
  structuredPrimary: true\r
  subtitle: ResNet18과 ResNet50\r
  goal: 두 사전학습 모델을 동시에 로드합니다.\r
  why: 비교 실험은 두 모델이 동시에 메모리에 있어야 동일 조건에서 측정 가능합니다.\r
  explanation: |-\r
    \`resnet18(weights=...)\` 와 \`resnet50(weights=...)\` 두 가지 모델 객체를 만듭니다. 가중치 파일 크기 차이가 크므로 첫 호출 시 시간이 다릅니다(ResNet50이 약 100MB로 더 큼).\r
\r
    두 모델 모두 eval 모드로 만들어 추론에 통일된 조건을 만듭니다.\r
  tips:\r
  - 모델 크기가 차이가 클수록 비교의 의미가 분명해집니다.\r
  snippet: |-\r
    import torch\r
    import torchvision\r
    import time\r
    from torchvision.models import resnet18, ResNet18_Weights, resnet50, ResNet50_Weights\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    weights18 = ResNet18_Weights.DEFAULT\r
    weights50 = ResNet50_Weights.DEFAULT\r
    model18 = resnet18(weights=weights18)\r
    model50 = resnet50(weights=weights50)\r
    model18.eval()\r
    model50.eval()\r
    sum(p.numel() for p in model18.parameters()), sum(p.numel() for p in model50.parameters())\r
  exercise:\r
    prompt: 두 모델의 카테고리 리스트가 같은지 확인하세요(둘 다 ImageNet 1000).\r
    starterCode: |-\r
      cat18 = weights18.meta['categories']\r
      cat50 = weights50.meta['categories']\r
      cat18 == ___\r
    hints:\r
    - 빈칸은 cat50 변수입니다.\r
    - 결과는 True여야 합니다.\r
  check:\r
    noError: 두 모델 로드가 오류 없이 끝나야 합니다.\r
    resultCheck: 두 모델 파라미터 수가 모두 0보다 커야 합니다.\r
- id: shared_input\r
  title: 2단계. 공통 입력 준비\r
  structuredPrimary: true\r
  subtitle: 같은 전처리, 같은 사진\r
  goal: 두 모델에 같은 입력을 넣어 비교 조건을 통일합니다.\r
  why: 입력이 다르면 정확도 비교가 무의미합니다.\r
  explanation: |-\r
    두 모델의 권장 전처리가 거의 같지만 미세하게 다를 수 있습니다. 비교 실험에서는 한 가지 전처리(보통 ResNet50의 권장)를 두 모델에 모두 적용합니다.\r
\r
    권장 전처리는 PIL Image나 텐서만 받습니다. \`load_sample_image\` 는 numpy 배열을 주므로 \`Image.fromarray\` 로 PIL Image로 바꿔 넣습니다.\r
\r
    입력 텐서도 같은 배치로 만들어 비교의 조건을 통일합니다.\r
  tips:\r
  - 비교 실험은 입력을 통제하지 않으면 결론이 흔들립니다.\r
  - 권장 transforms는 numpy 배열을 거부하므로 Image.fromarray로 PIL Image로 변환해 넣습니다.\r
  snippet: |-\r
    from PIL import Image\r
\r
    preprocess = weights50.transforms()\r
    china = load_sample_image('china.jpg')\r
    flower = load_sample_image('flower.jpg')\r
    chinaBatch = preprocess(Image.fromarray(china)).unsqueeze(0)\r
    flowerBatch = preprocess(Image.fromarray(flower)).unsqueeze(0)\r
    chinaBatch.shape\r
  exercise:\r
    prompt: 두 이미지 텐서의 모양이 같은지 확인하세요.\r
    starterCode: |-\r
      chinaBatch.shape == ___.shape\r
    hints:\r
    - 빈칸은 flowerBatch 변수입니다.\r
    - 결과는 True여야 합니다.\r
  check:\r
    noError: 전처리가 오류 없이 끝나야 합니다.\r
    resultCheck: chinaBatch.shape의 첫 차원이 1이어야 합니다.\r
- id: timing\r
  title: 3단계. 추론 시간 측정\r
  structuredPrimary: true\r
  subtitle: time.perf_counter\r
  goal: 각 모델로 N회 추론을 반복해 평균 추론 시간을 잽니다.\r
  why: 한 번의 추론 시간은 측정 노이즈가 큽니다. 여러 번 평균이 신뢰할 만한 지표입니다.\r
  explanation: |-\r
    \`time.perf_counter()\` 가 가장 정확한 측정 함수입니다. 첫 추론은 워밍업으로 무시하고 그 이후의 평균을 사용합니다.\r
\r
    \`torch.inference_mode\` 안에서 측정해야 측정값이 실제 추론과 일치합니다.\r
  tips:\r
  - 측정은 5~10회 반복 평균이 적당합니다. 너무 적으면 노이즈가 크고 너무 많으면 학습이 늘어집니다.\r
  snippet: |-\r
    def measure(model, batch, repeats=5):\r
        with torch.inference_mode():\r
            model(batch)  # warmup\r
        times = []\r
        with torch.inference_mode():\r
            for _ in range(repeats):\r
                start = time.perf_counter()\r
                model(batch)\r
                times.append(time.perf_counter() - start)\r
        return sum(times) / len(times)\r
\r
    time18 = measure(model18, chinaBatch)\r
    time50 = measure(model50, chinaBatch)\r
    time18, time50\r
  exercise:\r
    prompt: flower 사진으로도 같은 측정을 하세요.\r
    starterCode: |-\r
      time18Flower = measure(model18, ___)\r
      time50Flower = measure(model50, flowerBatch)\r
      time18Flower, time50Flower\r
    hints:\r
    - 빈칸은 flowerBatch 변수입니다.\r
    - 결과는 두 측정값이 비슷한 비율을 보여야 합니다.\r
  check:\r
    noError: 측정 함수가 오류 없이 끝나야 합니다.\r
    resultCheck: time18과 time50이 모두 양수여야 합니다.\r
- id: top1_compare\r
  title: 4단계. top-1 비교\r
  structuredPrimary: true\r
  subtitle: 두 모델의 라벨 일치\r
  goal: 두 모델의 top-1 라벨이 같은지 확인합니다.\r
  why: 일치한다면 두 모델이 같은 결론에 도달한 것이고, 다르면 어느 한쪽이 다른 시선을 보고 있는 것입니다.\r
  explanation: |-\r
    두 모델 모두 같은 카테고리 리스트를 사용하므로 인덱스 비교만으로 충분합니다. softmax 없이 argmax만으로 top-1을 얻을 수 있습니다.\r
  tips:\r
  - 일치율은 데이터셋 단위로 측정하지만 학습용에서는 두 사진 정도면 충분합니다.\r
  snippet: |-\r
    cat18 = weights18.meta['categories']\r
    cat50 = weights50.meta['categories']\r
    with torch.inference_mode():\r
        top18 = int(model18(chinaBatch).argmax(dim=1))\r
        top50 = int(model50(chinaBatch).argmax(dim=1))\r
    cat18[top18], cat50[top50], top18 == top50\r
  exercise:\r
    prompt: flower 사진에 대해서도 두 모델의 top-1을 비교하세요.\r
    starterCode: |-\r
      with torch.inference_mode():\r
          top18F = int(model18(___).argmax(dim=1))\r
          top50F = int(model50(flowerBatch).argmax(dim=1))\r
      cat18[top18F], cat50[top50F]\r
    hints:\r
    - 빈칸은 flowerBatch 변수입니다.\r
    - 두 라벨이 같으면 두 모델이 일치한 것입니다.\r
  check:\r
    noError: top-1 비교가 오류 없이 끝나야 합니다.\r
    resultCheck: top18과 top50이 모두 0 이상 1000 미만 정수여야 합니다.\r
- id: report\r
  title: 5단계. 결과 표\r
  structuredPrimary: true\r
  subtitle: dict 한 줄\r
  goal: 두 모델의 측정 결과를 한 dict로 정리해 비교를 명료화합니다.\r
  why: 결과를 dict 형태로 정리하면 다음 학습에서 결과를 그대로 시각화하거나 저장할 수 있습니다.\r
  explanation: |-\r
    측정값과 라벨을 한 dict에 정리합니다. matplotlib bar 그래프로 시각화하면 한눈에 비교가 가능합니다.\r
  tips:\r
  - 결과 보고서를 dict로 표준화해 두면 더 많은 모델 비교로 확장하기 쉽습니다.\r
  snippet: |-\r
    report = {\r
        "resnet18": {"time_s": float(time18), "top1": cat18[top18]},\r
        "resnet50": {"time_s": float(time50), "top1": cat50[top50]},\r
    }\r
    report\r
  exercise:\r
    prompt: 두 모델의 시간 비교를 막대 그래프로 그리세요.\r
    starterCode: |-\r
      fig = plt.figure(figsize=(5, 3))\r
      plt.bar(['resnet18', 'resnet50'], [time18, ___])\r
      plt.ylabel('seconds per inference')\r
      fig\r
    hints:\r
    - 빈칸은 time50 변수입니다.\r
    - 큰 모델의 막대가 더 높게 나와야 정상입니다.\r
  check:\r
    noError: 보고서 작성이 오류 없이 끝나야 합니다.\r
    resultCheck: report에 두 모델 키가 모두 있어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 일치율 측정\r
  goal: 두 사진의 두 모델 결과로 일치율을 계산합니다.\r
  why: 큰 평가의 작은 사례입니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 같은 카테고리를 가진 두 사진이라면 일치율이 100% 일 가능성이 높습니다.\r
  snippet: |-\r
    samples = [(chinaBatch, china), (flowerBatch, flower)]\r
    matches = 0\r
    for batch, _ in samples:\r
        with torch.inference_mode():\r
            a = int(model18(batch).argmax(dim=1))\r
            b = int(model50(batch).argmax(dim=1))\r
        if a == b:\r
            matches += 1\r
    matches / len(samples)\r
  exercise:\r
    prompt: "미션1: 두 모델의 시간 비율(time50 / time18) 을 계산해 출력하세요. 미션2: 같은 사진에 두 모델을 적용한 두 top-3 결과를 dict로 비교 출력하세요."\r
    starterCode: |-\r
      ratio = time50 / time18\r
      ratio\r
    hints:\r
    - 비율은 보통 2~4 사이입니다.\r
    - top-3는 logits.topk(3) 한 줄입니다.\r
  check:\r
    noError: 일치율 계산이 오류 없이 끝나야 합니다.\r
    resultCheck: matches가 0 이상 len(samples) 이하 정수여야 합니다.\r
`;export{e as default};