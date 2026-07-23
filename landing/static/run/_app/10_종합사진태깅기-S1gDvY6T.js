var e=`meta:\r
  id: deepVision_10\r
  title: 종합 - 사진 자동 태깅기\r
  order: 10\r
  category: deepVision\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  packages:\r
  - matplotlib
  - numpy
  - pillow
  - scikit-learn
  - torch\r
  - torchvision\r
  tags:\r
  - torchvision\r
  - 종합프로젝트\r
  - 분류\r
  - 객체탐지\r
  - 세그멘테이션\r
  seo:\r
    title: 딥러닝 비전 - 종합 사진 자동 태깅기\r
    description: 분류, 객체 탐지, 세그멘테이션 세 모델을 한 사진에 모두 적용해 자동 태그 보고서를 만듭니다.\r
    keywords:\r
    - 종합프로젝트\r
    - 분류\r
    - 객체탐지\r
    - 세그멘테이션\r
    - torchvision\r
intro:\r
  emoji: 🧪\r
  goal: 분류·탐지·세그 세 모델을 한 사진에 적용해 자동 태그 보고서 한 장을 만듭니다.\r
  description: |-\r
    이 강의는 deepVision 트랙의 마무리입니다. 한 사진에 세 가지 사전학습 모델(ResNet18 분류, Faster R-CNN 탐지, DeepLabV3 세그) 을 모두 적용하고, 결과를 한 figure에 모아 자동 태그 보고서를 생성합니다. 이 결과물은 visionApps 트랙(다음 트랙) 의 자동 사진 분류·정리 응용의 핵심 부품입니다.\r
  direction: 세 모델을 동시에 호출해 사진 한 장에서 (라벨, 박스 리스트, 세그 마스크) 세 결과를 모은 보고서를 만듭니다.\r
  benefits:\r
  - 모델 세 개를 한 함수에 모아 호출하는 패턴을 익힙니다.\r
  - 결과 dict를 표준화해 다른 응용에서 재사용할 수 있게 합니다.\r
  - 보고서 figure를 만드는 매트플롯립 레이아웃 패턴을 익힙니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 세 모델 일괄 로드\r
      detail: 분류 + 탐지 + 세그.\r
    - label: 2단계. 분류 결과\r
      detail: top-1 라벨.\r
    - label: 3단계. 탐지 결과\r
      detail: 박스 리스트.\r
    - label: 4단계. 세그 결과\r
      detail: 라벨 맵.\r
    - label: 5단계. 보고서 합치기\r
      detail: 1x4 figure로.\r
    runtime:\r
    - label: PyTorch 환경\r
      detail: torchvision의 세 모델을 동시에 호출합니다. CPU에서 한 사진당 10~30초 정도.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: load_three\r
  title: 1단계. 세 모델 일괄 로드\r
  structuredPrimary: true\r
  subtitle: 분류 + 탐지 + 세그\r
  goal: 세 가지 사전학습 모델을 한꺼번에 로드합니다.\r
  why: 한 사진에 여러 모델을 적용하려면 모든 모델이 미리 준비되어 있어야 합니다.\r
  explanation: |-\r
    각 모델 가중치는 첫 호출 시 다운로드됩니다. 모두 합치면 400MB 이상이 됩니다. 캐시가 한 번 만들어진 뒤에는 빠릅니다.\r
\r
    세 모델 모두 eval 모드로 만듭니다.\r
  tips:\r
  - 세 모델을 동시에 메모리에 두면 메모리 사용량이 큽니다. 작업이 끝나면 del로 정리하는 것도 한 방법입니다.\r
  snippet: |-\r
    import torch\r
    import torchvision\r
    from torchvision.models import resnet18, ResNet18_Weights\r
    from torchvision.models.detection import fasterrcnn_resnet50_fpn, FasterRCNN_ResNet50_FPN_Weights\r
    from torchvision.models.segmentation import deeplabv3_resnet50, DeepLabV3_ResNet50_Weights\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from matplotlib.patches import Rectangle\r
    from sklearn.datasets import load_sample_image\r
\r
    clsWeights = ResNet18_Weights.DEFAULT\r
    detWeights = FasterRCNN_ResNet50_FPN_Weights.DEFAULT\r
    segWeights = DeepLabV3_ResNet50_Weights.DEFAULT\r
    classifier = resnet18(weights=clsWeights).eval()\r
    detector = fasterrcnn_resnet50_fpn(weights=detWeights, box_score_thresh=0.5).eval()\r
    segmenter = deeplabv3_resnet50(weights=segWeights).eval()\r
    type(classifier).__name__, type(detector).__name__, type(segmenter).__name__\r
  exercise:\r
    prompt: 각 모델의 카테고리 리스트 길이를 dict로 출력하세요.\r
    starterCode: |-\r
      {\r
          "cls": len(clsWeights.meta['categories']),\r
          "det": len(detWeights.meta['categories']),\r
          "seg": len(___.meta['categories']),\r
      }\r
    hints:\r
    - 빈칸은 segWeights 변수입니다.\r
    - 세 값이 각각 1000, 91, 21 정도여야 합니다.\r
  check:\r
    noError: 세 모델 로드가 오류 없이 끝나야 합니다.\r
    resultCheck: 세 모델 타입 이름이 각각 다릅니다.\r
- id: classify\r
  title: 2단계. 분류 결과\r
  structuredPrimary: true\r
  subtitle: top-1 라벨\r
  goal: 분류 모델로 사진의 top-1 라벨을 얻습니다.\r
  why: 사진 전체의 카테고리는 다른 결과의 맥락이 됩니다.\r
  explanation: |-\r
    \`clsWeights.transforms()\` 로 전처리한 뒤 추론합니다. 이 권장 전처리는 PIL Image나 텐서만 받으므로 numpy 배열은 \`Image.fromarray\` 로 PIL Image로 바꿔 넣습니다. argmax로 top-1 인덱스를 얻고 카테고리 리스트로 라벨화합니다.\r
  tips:\r
  - 분류 결과는 사진의 "주요" 객체 한 개입니다. 여러 객체가 있어도 한 라벨만 나옵니다.\r
  - 분류·세그 권장 transforms는 numpy 배열을 거부하므로 Image.fromarray로 PIL Image로 변환해 넣습니다.\r
  snippet: |-\r
    from PIL import Image\r
\r
    target = load_sample_image('china.jpg')\r
    clsPreprocess = clsWeights.transforms()\r
    with torch.inference_mode():\r
        clsLogits = classifier(clsPreprocess(Image.fromarray(target)).unsqueeze(0))\r
    clsTopIdx = int(clsLogits.argmax(dim=1))\r
    clsLabel = clsWeights.meta['categories'][clsTopIdx]\r
    clsLabel\r
  exercise:\r
    prompt: flower 사진에도 같은 분류를 적용하세요.\r
    starterCode: |-\r
      from PIL import Image\r
\r
      flowerImg = load_sample_image('flower.jpg')\r
      with torch.inference_mode():\r
          flowerLogits = classifier(clsPreprocess(Image.fromarray(___)).unsqueeze(0))\r
      flowerLabel = clsWeights.meta['categories'][int(flowerLogits.argmax(dim=1))]\r
      flowerLabel\r
    hints:\r
    - 빈칸은 flowerImg 변수입니다.\r
    - 결과는 ImageNet 라벨 문자열입니다.\r
  check:\r
    noError: 분류 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: clsLabel이 문자열이어야 합니다.\r
- id: detect\r
  title: 3단계. 탐지 결과\r
  structuredPrimary: true\r
  subtitle: 박스 리스트\r
  goal: 탐지 모델로 사진의 객체 박스와 라벨을 얻습니다.\r
  why: 사진 안의 개별 객체 위치는 분류만으로는 알 수 없습니다.\r
  explanation: |-\r
    탐지 모델은 normalize 없이 0~1 float 텐서를 받습니다. 결과 dict의 boxes, scores, labels를 후처리합니다.\r
  tips:\r
  - 첫 호출은 워밍업으로 느립니다.\r
  snippet: |-\r
    targetTensor = torch.from_numpy(target).permute(2, 0, 1).float() / 255.0\r
    with torch.inference_mode():\r
        detResult = detector([targetTensor])[0]\r
    keepDet = detResult['scores'] > 0.5\r
    detBoxes = detResult['boxes'][keepDet]\r
    detLabels = [detWeights.meta['categories'][int(i)] for i in detResult['labels'][keepDet]]\r
    len(detLabels), detLabels[:5]\r
  exercise:\r
    prompt: flower 사진에도 같은 탐지를 적용하세요.\r
    starterCode: |-\r
      flowerTensor = torch.from_numpy(flowerImg).permute(2, 0, 1).float() / 255.0\r
      with torch.inference_mode():\r
          flowerDet = detector([___])[0]\r
      flowerKeep = flowerDet['scores'] > 0.5\r
      flowerBoxes = flowerDet['boxes'][flowerKeep]\r
      flowerBoxes.shape\r
    hints:\r
    - 빈칸은 flowerTensor 변수입니다.\r
    - flower 사진에는 객체가 없거나 적을 수 있습니다.\r
  check:\r
    noError: 탐지 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: detBoxes.shape의 마지막 차원이 4여야 합니다.\r
- id: segment\r
  title: 4단계. 세그 결과\r
  structuredPrimary: true\r
  subtitle: 라벨 맵\r
  goal: 세그 모델로 픽셀별 클래스 라벨 맵을 얻습니다.\r
  why: 세그는 객체 영역의 정확한 모양을 알려주는 가장 세밀한 정보입니다.\r
  explanation: |-\r
    \`segWeights.transforms()\` 가 권장 전처리입니다. 분류와 마찬가지로 numpy 배열은 \`Image.fromarray\` 로 PIL Image로 바꿔 넣습니다. 모델 호출 후 \`out\` 키의 argmax로 라벨 맵을 얻습니다.\r
  tips:\r
  - 세그 결과 라벨 맵의 크기가 원본과 다를 수 있습니다. 시각화 시 원본을 같은 크기로 잘라 맞춥니다.\r
  snippet: |-\r
    from PIL import Image\r
\r
    segPreprocess = segWeights.transforms()\r
    with torch.inference_mode():\r
        segOut = segmenter(segPreprocess(Image.fromarray(target)).unsqueeze(0))\r
    segLabelMap = segOut['out'].argmax(dim=1).squeeze(0)\r
    segLabelMap.shape, int(segLabelMap.max())\r
  exercise:\r
    prompt: flower 사진에도 같은 세그를 적용하세요.\r
    starterCode: |-\r
      from PIL import Image\r
\r
      flowerImg = load_sample_image('flower.jpg')\r
      with torch.inference_mode():\r
          flowerSegOut = segmenter(segPreprocess(Image.fromarray(flowerImg)).unsqueeze(___))\r
      flowerSegLabelMap = flowerSegOut['out'].argmax(dim=1).squeeze(0)\r
      flowerSegLabelMap.shape\r
    hints:\r
    - 빈칸은 정수 0입니다.\r
    - 결과는 (H, W) 라벨 맵입니다.\r
  check:\r
    noError: 세그 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: segLabelMap.ndim이 2여야 합니다.\r
- id: report\r
  title: 5단계. 보고서 합치기\r
  structuredPrimary: true\r
  subtitle: 1x4 figure\r
  goal: 분류 + 탐지 + 세그 결과를 한 figure에 모아 보고서를 만듭니다.\r
  why: 세 결과를 한눈에 보여줘야 사진 한 장의 "전체 의미"가 전달됩니다.\r
  explanation: |-\r
    1x3 subplots를 만들어 좌측은 분류 라벨이 적힌 원본, 가운데는 탐지 박스가 그려진 사진, 우측은 세그 오버레이가 들어가게 합니다. 분류 라벨은 figure 제목으로 두면 깔끔합니다.\r
  tips:\r
  - 보고서 함수는 입력 사진을 받아 figure를 반환하는 형식이면 다음 트랙에서 그대로 활용할 수 있습니다.\r
  snippet: |-\r
    targetResized = target[:segLabelMap.shape[0], :segLabelMap.shape[1]]\r
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))\r
    fig.suptitle(f'Classification: {clsLabel}', fontsize=14)\r
    axes[0].imshow(target)\r
    axes[0].set_title('original')\r
    axes[0].axis('off')\r
    axes[1].imshow(target)\r
    for box, name in zip(detBoxes, detLabels):\r
        x1, y1, x2, y2 = box.tolist()\r
        axes[1].add_patch(Rectangle((x1, y1), x2 - x1, y2 - y1, edgecolor='lime', facecolor='none', linewidth=2))\r
        axes[1].text(x1, max(y1 - 5, 0), name, color='black', backgroundcolor='lime', fontsize=8)\r
    axes[1].set_title('detection')\r
    axes[1].axis('off')\r
    axes[2].imshow(targetResized)\r
    axes[2].imshow(segLabelMap.numpy(), cmap='tab20', alpha=0.5)\r
    axes[2].set_title('segmentation')\r
    axes[2].axis('off')\r
    fig\r
  exercise:\r
    prompt: flower 사진에 대해서도 같은 보고서를 만드세요.\r
    starterCode: |-\r
      flowerResized = flowerImg[:flowerSegLabelMap.shape[0], :flowerSegLabelMap.shape[1]]\r
      fig2, axes2 = plt.subplots(1, 3, figsize=(15, 5))\r
      fig2.suptitle(f'Classification: {flowerLabel}', fontsize=14)\r
      axes2[0].imshow(flowerImg)\r
      axes2[0].axis('off')\r
      axes2[1].imshow(flowerImg)\r
      for box in flowerBoxes:\r
          x1, y1, x2, y2 = box.tolist()\r
          axes2[1].add_patch(Rectangle((x1, y1), x2 - x1, y2 - y1, edgecolor='cyan', facecolor='none', linewidth=2))\r
      axes2[1].axis('off')\r
      axes2[2].imshow(flowerResized)\r
      axes2[2].imshow(flowerSegLabelMap.numpy(), cmap='tab20', alpha=___)\r
      axes2[2].axis('off')\r
      fig2\r
    hints:\r
    - 빈칸은 부동소수 0.5 입니다.\r
    - flower 보고서는 탐지 박스가 없거나 적을 수 있습니다.\r
  check:\r
    noError: 보고서 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 함수화\r
  goal: 분류 + 탐지 + 세그를 한 함수로 묶고 dict 결과를 반환합니다.\r
  why: 함수로 묶어 두면 visionApps 트랙에서 그대로 호출할 수 있습니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 함수 반환을 표준 dict로 두면 후속 응용에서 재사용이 쉽습니다.\r
  snippet: |-\r
    from PIL import Image\r
\r
    flowerImg = load_sample_image('flower.jpg')\r
\r
    def autoTag(img):\r
        clsLogitsLocal = classifier(clsPreprocess(Image.fromarray(img)).unsqueeze(0))\r
        tensorLocal = torch.from_numpy(img).permute(2, 0, 1).float() / 255.0\r
        detLocal = detector([tensorLocal])[0]\r
        segLocal = segmenter(segPreprocess(Image.fromarray(img)).unsqueeze(0))\r
        return {\r
            "label": clsWeights.meta['categories'][int(clsLogitsLocal.argmax(dim=1))],\r
            "boxes": [b.tolist() for b in detLocal['boxes'][detLocal['scores'] > 0.5]],\r
            "labels": [detWeights.meta['categories'][int(i)] for i in detLocal['labels'][detLocal['scores'] > 0.5]],\r
            "seg_map_shape": tuple(segLocal['out'].argmax(dim=1).squeeze(0).shape),\r
        }\r
\r
    with torch.inference_mode():\r
        chinaTag = autoTag(target)\r
        flowerTag = autoTag(flowerImg)\r
    chinaTag, flowerTag\r
  exercise:\r
    prompt: "미션1: autoTag 결과를 노출시켜 'label'과 detection 'labels' 의 첫 3개만 출력하세요. 미션2: 두 사진의 결과 dict를 한 dict로 합쳐 출력하세요."\r
    starterCode: |-\r
      summary = {\r
          "china": {"label": chinaTag['label'], "detected": chinaTag['labels'][:3]},\r
          "flower": {"label": flowerTag['label'], "detected": ___['labels'][:3]},\r
      }\r
      summary\r
    hints:\r
    - 빈칸은 flowerTag 변수입니다.\r
    - 결과는 두 사진 비교가 명확히 담긴 dict입니다.\r
  check:\r
    noError: 함수 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: chinaTag와 flowerTag 모두 'label' 키를 가져야 합니다.\r
`;export{e as default};