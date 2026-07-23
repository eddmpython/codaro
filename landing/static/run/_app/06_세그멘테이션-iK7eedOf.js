var e=`meta:\r
  id: deepVision_06\r
  title: DeepLabV3 세맨틱 세그멘테이션\r
  order: 6\r
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
  - 세그멘테이션\r
  - DeepLabV3\r
  - 픽셀분류\r
  seo:\r
    title: 딥러닝 비전 - DeepLabV3 세맨틱 세그멘테이션\r
    description: torchvision DeepLabV3로 사진 픽셀마다 클래스를 예측해 세그 마스크를 만듭니다.\r
    keywords:\r
    - 세그멘테이션\r
    - DeepLabV3\r
    - 픽셀분류\r
    - torchvision\r
intro:\r
  emoji: 🧩\r
  goal: 픽셀 단위로 클래스를 예측하는 세맨틱 세그멘테이션을 사전학습 DeepLabV3로 실행합니다.\r
  description: |-\r
    분류는 사진 한 장 → 라벨 한 개, 탐지는 객체 한 개 → 박스 + 라벨이었습니다. 세그멘테이션은 픽셀 한 개 → 라벨 한 개로 가장 세밀한 출력입니다. 이 강의는 사전학습 DeepLabV3로 PASCAL VOC 21클래스 세그를 추론합니다.\r
  direction: DeepLabV3를 호출해 픽셀별 클래스 예측을 얻고 마스크를 컬러맵으로 시각화합니다.\r
  benefits:\r
  - segmentation 모델의 입출력 형식을 익힙니다.\r
  - argmax로 픽셀별 클래스를 얻고 클래스 마스크를 만듭니다.\r
  - 원본 위에 반투명 마스크를 덧입혀 시각화하는 표준 패턴을 익힙니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 모델과 가중치\r
      detail: deeplabv3_resnet50 로드.\r
    - label: 2단계. 입력 전처리\r
      detail: weights.transforms() 활용.\r
    - label: 3단계. 추론\r
      detail: dict 출력의 'out' 키.\r
    - label: 4단계. 픽셀별 클래스\r
      detail: argmax로 라벨 맵 만들기.\r
    - label: 5단계. 마스크 오버레이\r
      detail: 컬러맵과 alpha 합성.\r
    runtime:\r
    - label: PyTorch 환경\r
      detail: torchvision segmentation 모듈을 사용합니다. CPU 한 장당 수 초 소요.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: load_seg\r
  title: 1단계. 모델과 가중치\r
  structuredPrimary: true\r
  subtitle: deeplabv3_resnet50\r
  goal: 사전학습 DeepLabV3 ResNet50 모델을 로드합니다.\r
  why: DeepLab은 세그멘테이션 분야에서 가장 잘 알려진 모델 중 하나로 사전학습 가중치 품질이 높습니다.\r
  explanation: |-\r
    \`from torchvision.models.segmentation import deeplabv3_resnet50, DeepLabV3_ResNet50_Weights\` 로 가져옵니다. 가중치는 PASCAL VOC 21 클래스에 학습되어 있습니다(배경 포함).\r
\r
    가중치 파일이 큽니다(약 160MB). 첫 호출 시 자동 다운로드합니다.\r
  tips:\r
  - 세그멘테이션 모델은 분류보다 무겁고 출력 크기가 입력 크기와 비슷해 메모리를 많이 씁니다.\r
  snippet: |-\r
    import torch\r
    import torchvision\r
    from torchvision.models.segmentation import deeplabv3_resnet50, DeepLabV3_ResNet50_Weights\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    segWeights = DeepLabV3_ResNet50_Weights.DEFAULT\r
    segModel = deeplabv3_resnet50(weights=segWeights)\r
    segModel.eval()\r
    type(segModel).__name__\r
  exercise:\r
    prompt: 모델의 클래스 라벨 전체 리스트를 출력하세요.\r
    starterCode: |-\r
      segCategories = segWeights.meta['categories']\r
      ___\r
    hints:\r
    - 빈칸은 segCategories 변수입니다.\r
    - 21개 라벨이 출력되어야 합니다.\r
  check:\r
    noError: 모델 로드가 오류 없이 끝나야 합니다.\r
    resultCheck: type(segModel).__name__이 'DeepLabV3' 이어야 합니다.\r
- id: preprocess_seg\r
  title: 2단계. 입력 전처리\r
  structuredPrimary: true\r
  subtitle: weights.transforms()\r
  goal: 권장 전처리로 입력 텐서를 만들고 배치 차원을 추가합니다.\r
  why: 세그멘테이션 모델은 normalize까지 포함된 전처리가 필요합니다.\r
  explanation: |-\r
    \`segWeights.transforms()\` 가 권장 전처리입니다. 보통 resize와 normalize가 포함됩니다.\r
\r
    이 권장 전처리는 PIL Image 또는 텐서만 받습니다. \`load_sample_image\` 는 numpy 배열을 주므로 \`Image.fromarray\` 로 PIL Image로 바꿔 넣습니다.\r
\r
    배치 차원을 추가해 (1, 3, H, W) 형식으로 만들어야 모델에 넘길 수 있습니다.\r
  tips:\r
  - 입력 크기를 너무 크게 두면 CPU 추론이 매우 느려집니다. 권장 transforms가 합리적인 크기로 줄여 줍니다.\r
  - 권장 transforms는 numpy 배열을 거부하므로 Image.fromarray로 PIL Image로 변환해 넣습니다.\r
  snippet: |-\r
    from PIL import Image\r
\r
    china = load_sample_image('china.jpg')\r
    segPreprocess = segWeights.transforms()\r
    inputBatch = segPreprocess(Image.fromarray(china)).unsqueeze(0)\r
    inputBatch.shape\r
  exercise:\r
    prompt: flower 이미지에도 같은 전처리를 적용하세요.\r
    starterCode: |-\r
      flower = load_sample_image('flower.jpg')\r
      flowerBatch = segPreprocess(Image.fromarray(flower)).unsqueeze(___)\r
      flowerBatch.shape\r
    hints:\r
    - 빈칸은 정수 0입니다.\r
    - 결과는 (1, 3, H, W) 모양입니다.\r
  check:\r
    noError: 전처리가 오류 없이 끝나야 합니다.\r
    resultCheck: inputBatch.shape의 첫 차원이 1이어야 합니다.\r
- id: inference\r
  title: 3단계. 추론\r
  structuredPrimary: true\r
  subtitle: dict 출력의 'out' 키\r
  goal: 모델을 호출해 segmentation logits을 얻습니다.\r
  why: segmentation 모델의 출력 형식을 정확히 이해해야 다음 단계가 가능합니다.\r
  explanation: |-\r
    \`segModel(inputBatch)\` 의 결과는 dict로 \`out\` 키가 logits 텐서입니다. shape는 (1, 21, H, W) 입니다. 21은 클래스 수, H와 W는 입력 크기와 같습니다.\r
\r
    auxiliary loss 출력 등 추가 키가 있을 수 있지만 추론에는 사용하지 않습니다.\r
  tips:\r
  - 세그 모델은 분류와 달리 보조 출력이 있는 경우가 많습니다. dict 키 구조를 확인해 두세요.\r
  snippet: |-\r
    with torch.inference_mode():\r
        chinaOut = segModel(inputBatch)\r
    type(chinaOut), list(chinaOut.keys()), chinaOut['out'].shape\r
  exercise:\r
    prompt: flower 이미지에도 같은 추론을 적용하세요.\r
    starterCode: |-\r
      with torch.inference_mode():\r
          flowerOut = segModel(___)\r
      flowerOut['out'].shape\r
    hints:\r
    - 빈칸은 flowerBatch 변수입니다.\r
    - 결과 shape의 첫 두 차원은 (1, 21) 입니다.\r
  check:\r
    noError: 추론 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: chinaOut['out'].shape의 두 번째 차원이 21이어야 합니다.\r
- id: argmax\r
  title: 4단계. 픽셀별 클래스\r
  structuredPrimary: true\r
  subtitle: argmax로 라벨 맵\r
  goal: 픽셀별로 가장 확률 높은 클래스를 골라 라벨 맵을 만듭니다.\r
  why: logits 자체는 시각화할 수 없으므로 argmax로 한 채널 결과로 만듭니다.\r
  explanation: |-\r
    \`chinaOut['out'].argmax(dim=1)\` 가 라벨 맵을 만드는 한 줄입니다. 결과 shape는 (1, H, W) 이고 값은 0~20 사이 정수입니다.\r
\r
    각 정수가 segCategories의 인덱스와 일치합니다. 0은 보통 배경입니다.\r
  tips:\r
  - argmax는 채널(차원 1)을 따라 가장 큰 값의 인덱스를 반환합니다.\r
  snippet: |-\r
    chinaLabelMap = chinaOut['out'].argmax(dim=1).squeeze(0)\r
    chinaLabelMap.shape, int(chinaLabelMap.min()), int(chinaLabelMap.max())\r
  exercise:\r
    prompt: flower 이미지의 라벨 맵 flowerLabelMap을 만들고 등장한 클래스 인덱스의 유일값들을 출력하세요.\r
    starterCode: |-\r
      flowerLabelMap = flowerOut['out'].argmax(dim=___).squeeze(0)\r
      flowerUnique = torch.unique(flowerLabelMap).tolist()\r
      flowerUnique\r
    hints:\r
    - argmax의 dim은 1입니다.\r
    - 결과는 등장한 클래스 인덱스 리스트입니다.\r
  check:\r
    noError: argmax가 오류 없이 끝나야 합니다.\r
    resultCheck: chinaLabelMap.ndim이 2여야 합니다.\r
- id: overlay\r
  title: 5단계. 마스크 오버레이\r
  structuredPrimary: true\r
  subtitle: 컬러맵 + alpha 합성\r
  goal: 원본 위에 반투명 라벨 맵을 합성해 시각화합니다.\r
  why: 마스크 자체보다 원본 위에 겹쳐 보면 어떤 영역이 어떤 클래스인지 즉시 알 수 있습니다.\r
  explanation: |-\r
    matplotlib의 imshow에 cmap='tab20' 같은 컬러맵을 주면 정수 라벨 맵을 색으로 변환합니다. alpha=0.5 옵션으로 반투명하게 합성하면 됩니다.\r
\r
    같은 axis에 imshow를 두 번 호출해 원본 + 마스크를 겹쳐 그립니다. 단, 마스크의 크기가 원본과 일치해야 정확히 겹칩니다.\r
  tips:\r
  - 마스크 크기가 원본과 다르면 imshow의 extent 옵션 또는 resize가 필요합니다.\r
  snippet: |-\r
    chinaResized = china[:chinaLabelMap.shape[0], :chinaLabelMap.shape[1]]\r
    fig, axes = plt.subplots(1, 2, figsize=(11, 5))\r
    axes[0].imshow(chinaResized)\r
    axes[0].set_title('china')\r
    axes[0].axis('off')\r
    axes[1].imshow(chinaResized)\r
    axes[1].imshow(chinaLabelMap.numpy(), cmap='tab20', alpha=0.5)\r
    axes[1].set_title('overlay')\r
    axes[1].axis('off')\r
    fig\r
  exercise:\r
    prompt: flower 이미지에도 같은 오버레이를 적용하세요.\r
    starterCode: |-\r
      flowerResized = flower[:flowerLabelMap.shape[0], :flowerLabelMap.shape[1]]\r
      fig2, axes2 = plt.subplots(1, 2, figsize=(11, 5))\r
      axes2[0].imshow(flowerResized)\r
      axes2[0].axis('off')\r
      axes2[1].imshow(flowerResized)\r
      axes2[1].imshow(flowerLabelMap.numpy(), cmap='tab20', alpha=___)\r
      axes2[1].axis('off')\r
      fig2\r
    hints:\r
    - 빈칸은 부동소수 0.5 입니다.\r
    - 결과에서 객체 영역이 컬러로 칠해져야 합니다.\r
  check:\r
    noError: 오버레이 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: chinaLabelMap의 shape이 chinaResized의 shape 첫 두 차원과 같아야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 클래스별 마스크 분리\r
  goal: 라벨 맵에서 특정 클래스만 골라 따로 시각화합니다.\r
  why: 특정 객체 마스크만 다루어야 하는 응용(인물 추출, 배경 제거 등) 의 출발점이 됩니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - "원본 - 배경 = 객체 마스크 추출이 이 패턴의 자연스러운 응용입니다."\r
  snippet: |-\r
    segCategories = segWeights.meta['categories']\r
    uniqueLabels = torch.unique(chinaLabelMap).tolist()\r
    summary = {idx: segCategories[idx] for idx in uniqueLabels}\r
    summary\r
  exercise:\r
    prompt: "미션1: 라벨 맵에서 배경(0) 이 아닌 클래스만 흰색으로 표시한 foregroundMask를 시각화하세요. 미션2: 등장한 클래스별 픽셀 개수를 막대 그래프로 표시하세요."\r
    starterCode: |-\r
      foregroundMask = (chinaLabelMap != 0).numpy().astype(np.uint8) * 255\r
      fig = plt.figure(figsize=(5, 4))\r
      plt.imshow(foregroundMask, cmap='gray')\r
      plt.axis('off')\r
      fig\r
    hints:\r
    - 배경 인덱스는 보통 0입니다.\r
    - "클래스별 픽셀 개수는 torch.bincount(chinaLabelMap.flatten()) 한 줄입니다."\r
  check:\r
    noError: 클래스 분리가 오류 없이 끝나야 합니다.\r
    resultCheck: foregroundMask가 (높이, 너비) shape의 uint8 배열이어야 합니다.\r
`;export{e as default};