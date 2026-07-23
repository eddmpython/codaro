var e=`meta:\r
  id: visionApps_06\r
  title: 얼굴 임베딩과 동일인 판별\r
  order: 6\r
  category: visionApps\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 중급\r
  packages:\r
  - matplotlib
  - numpy
  - opencv-python
  - pillow
  - torch
  - torchvision\r
  - scikit-learn\r
  tags:\r
  - 얼굴임베딩\r
  - 동일인판별\r
  - 임베딩\r
  - 응용\r
  seo:\r
    title: 비전 응용 - 얼굴 임베딩과 동일인 판별\r
    description: 사전학습 ResNet 임베딩으로 두 사진 속 객체가 같은지 판별합니다.\r
    keywords:\r
    - 얼굴임베딩\r
    - 동일인\r
    - 임베딩\r
    - 유사도\r
intro:\r
  emoji: 🙇\r
  goal: 두 사진에서 추출한 임베딩의 코사인 유사도로 같은 객체인지 판별합니다.\r
  description: |-\r
    face_recognition 같은 전용 라이브러리는 dlib 의존성이 까다롭습니다. 이 강의는 deepVision 트랙에서 학습한 ResNet 임베딩(일반 사진용) 으로 "같은 사진인가/같은 객체인가" 를 판별하는 응용 패턴을 만듭니다. 얼굴 특화 모델은 아니지만 작은 라이브러리에서는 충분히 동작합니다.\r
  direction: 두 사진을 같은 인코더에 통과시키고 코사인 유사도와 임곗값으로 동일 객체 판별을 구현합니다.\r
  benefits:\r
  - 임베딩 + 임곗값으로 단순한 동일성 판별기를 만들 수 있습니다.\r
  - 변형(밝기, 회전) 후에도 임베딩이 비슷한지 확인합니다.\r
  - 임곗값에 따른 정확도-재현율 트레이드오프를 체험합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 인코더 준비\r
      detail: deepVision 3강과 같은 ResNet18 임베딩.\r
    - label: 2단계. 사진 쌍 만들기\r
      detail: 같은 사진 변형 + 다른 사진.\r
    - label: 3단계. 코사인 유사도 함수\r
      detail: 두 사진 → 단일 점수.\r
    - label: 4단계. 임곗값 판별\r
      detail: 0.85 기준 동일/아님 판별.\r
    - label: 5단계. 다중 쌍 평가\r
      detail: 표로 정리.\r
    runtime:\r
    - label: 비전 환경\r
      detail: torchvision + numpy + matplotlib.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: encoder\r
  title: 1단계. 인코더 준비\r
  structuredPrimary: true\r
  subtitle: deepVision 3강 임베딩 재사용\r
  goal: ResNet18 + 분류층 제거로 임베딩 추출기를 만듭니다.\r
  why: 동일성 판별의 출발은 좋은 임베딩입니다.\r
  explanation: |-\r
    deepVision 3강과 같은 패턴입니다. \`nn.Sequential(*list(model.children())[:-1])\` 로 분류층을 제외한 인코더를 만듭니다.\r
\r
    preprocess는 ResNet18 권장 transforms를 그대로 사용합니다. 이 transforms는 PIL Image를 입력으로 받으므로, numpy 배열 이미지는 \`Image.fromarray(...)\` 로 감싸서 넘깁니다.\r
  tips:\r
  - 얼굴 특화 임베딩이 필요하면 facenet-pytorch 같은 별도 패키지를 쓰는 것이 표준입니다. 학습용으로는 일반 임베딩으로 흐름만 익힙니다.\r
  - load_sample_image는 numpy 배열을 돌려줍니다. preprocess에 넣기 전 \`Image.fromarray(...)\` 로 PIL Image로 변환해야 합니다.\r
  snippet: |-\r
    import torch\r
    import torchvision\r
    import torch.nn as nn\r
    import torch.nn.functional as F\r
    from torchvision.models import resnet18, ResNet18_Weights\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
    from PIL import Image\r
    import cv2\r
\r
    weights = ResNet18_Weights.DEFAULT\r
    model = resnet18(weights=weights).eval()\r
    encoder = nn.Sequential(*list(model.children())[:-1]).eval()\r
    preprocess = weights.transforms()\r
    type(encoder).__name__\r
  exercise:\r
    prompt: 임베딩 차원이 512인지 확인하세요(china 한 장으로).\r
    starterCode: |-\r
      china = load_sample_image('china.jpg')\r
      with torch.inference_mode():\r
          feat = encoder(preprocess(Image.fromarray(china)).unsqueeze(0)).flatten(1)\r
      feat.shape[___]\r
    hints:\r
    - 빈칸은 정수 1입니다(두 번째 차원).\r
    - 결과는 512 입니다.\r
  check:\r
    noError: 인코더 준비가 오류 없이 끝나야 합니다.\r
    resultCheck: type(encoder).__name__이 'Sequential' 이어야 합니다.\r
- id: pairs\r
  title: 2단계. 사진 쌍 만들기\r
  structuredPrimary: true\r
  subtitle: 같은 / 다른 사진\r
  goal: 같은 사진의 두 변형과 다른 사진을 모아 쌍을 만듭니다.\r
  why: 판별기를 평가하려면 같은 쌍과 다른 쌍 모두 필요합니다.\r
  explanation: |-\r
    china의 두 변형(밝기 조정), china와 flower 한 쌍을 만듭니다. 같은 쌍은 유사도가 높아야 하고 다른 쌍은 낮아야 합니다.\r
  tips:\r
  - 변형이 너무 강하면 같은 쌍도 다르게 인식됩니다. 변형 강도를 조절하면서 임베딩의 강건성을 시험합니다.\r
  snippet: |-\r
    china = load_sample_image('china.jpg')\r
    flower = load_sample_image('flower.jpg')\r
    chinaBright = (china.astype(np.float32) * 1.1 + 5).clip(0, 255).astype(np.uint8)\r
    chinaDim = (china.astype(np.float32) * 0.7).clip(0, 255).astype(np.uint8)\r
    samePair = (chinaBright, chinaDim)\r
    diffPair = (china, flower)\r
    samePair[0].shape, diffPair[0].shape\r
  exercise:\r
    prompt: 같은 쌍과 다른 쌍을 1x4 그리드로 비교 시각화하세요.\r
    starterCode: |-\r
      fig, axes = plt.subplots(1, 4, figsize=(14, 4))\r
      for axis, (label, img) in zip(axes, [\r
          ('same A', samePair[0]),\r
          ('same B', samePair[1]),\r
          ('diff A', diffPair[0]),\r
          ('diff B', diffPair[1]),\r
      ]):\r
          axis.imshow(img)\r
          axis.set_title(label)\r
          axis.axis('___')\r
      fig\r
    hints:\r
    - 빈칸은 'off' 입니다.\r
    - 네 사진이 모두 화면에 보여야 합니다.\r
  check:\r
    noError: 사진 쌍 만들기가 오류 없이 끝나야 합니다.\r
    resultCheck: samePair와 diffPair 모두 두 이미지의 튜플이어야 합니다.\r
- id: similarity_fn\r
  title: 3단계. 코사인 유사도 함수\r
  structuredPrimary: true\r
  subtitle: 두 사진 → 단일 점수\r
  goal: 두 이미지를 입력으로 받아 코사인 유사도 점수를 돌려주는 함수를 만듭니다.\r
  why: 함수로 묶어야 다양한 쌍에 일관되게 적용할 수 있습니다.\r
  explanation: |-\r
    함수 내부에서 각 사진을 \`Image.fromarray\` → preprocess → encoder → flatten → normalize 한 뒤 내적을 계산합니다. preprocess는 PIL Image를 받으므로 numpy 이미지는 먼저 변환합니다. L2 정규화한 두 벡터의 내적이 코사인 유사도입니다.\r
  tips:\r
  - 함수 호출 횟수가 많으면 미리 임베딩을 계산해 캐싱하는 것이 효율적입니다.\r
  snippet: |-\r
    from PIL import Image\r
\r
    def cosine(imgA, imgB):\r
        with torch.inference_mode():\r
            ea = F.normalize(encoder(preprocess(Image.fromarray(imgA)).unsqueeze(0)).flatten(1), dim=1)\r
            eb = F.normalize(encoder(preprocess(Image.fromarray(imgB)).unsqueeze(0)).flatten(1), dim=1)\r
        return float((ea * eb).sum())\r
\r
    sameScore = cosine(*samePair)\r
    diffScore = cosine(*diffPair)\r
    sameScore, diffScore\r
  exercise:\r
    prompt: 자기 자신과의 유사도(china, china) 가 1에 가까운지 확인하세요.\r
    starterCode: |-\r
      selfScore = cosine(china, ___)\r
      selfScore\r
    hints:\r
    - 빈칸은 china 변수입니다.\r
    - 자기 자신과는 1에 매우 가까워야 합니다.\r
  check:\r
    noError: 함수 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: sameScore가 diffScore보다 커야 합니다.\r
- id: threshold\r
  title: 4단계. 임곗값 판별\r
  structuredPrimary: true\r
  subtitle: 0.85 기준\r
  goal: 임곗값을 두고 두 사진이 같은지 다른지 자동 판별합니다.\r
  why: 판별기는 임곗값 비교 한 줄로 결정합니다.\r
  explanation: |-\r
    \`cosine(a, b) > 0.85\` 이면 같음, 그렇지 않으면 다름으로 판정합니다. 임곗값은 데이터셋과 응용에 따라 다릅니다.\r
\r
    같은 쌍의 점수는 임곗값 이상, 다른 쌍의 점수는 임곗값 미만이어야 정확한 판별기입니다.\r
  tips:\r
  - 임곗값이 너무 높으면 같은 쌍을 놓치고 너무 낮으면 다른 쌍을 같다고 판정합니다.\r
  snippet: |-\r
    def isSame(imgA, imgB, threshold=0.85):\r
        return cosine(imgA, imgB) > threshold\r
\r
    isSame(*samePair), isSame(*diffPair)\r
  exercise:\r
    prompt: 임곗값 0.7로 다시 판별해 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      isSame(*samePair, threshold=___), isSame(*diffPair, threshold=0.7)\r
    hints:\r
    - 빈칸은 부동소수 0.7 입니다.\r
    - 낮은 임곗값에서 더 관대한 판별이 됩니다.\r
  check:\r
    noError: 판별기 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: isSame(samePair[0], samePair[1]) 가 True여야 합니다.\r
- id: multi_eval\r
  title: 5단계. 다중 쌍 평가\r
  structuredPrimary: true\r
  subtitle: 표 정리\r
  goal: 여러 쌍에 함수를 일괄 적용해 결과를 표로 정리합니다.\r
  why: 한 번의 평가 결과만으로는 임곗값을 정할 수 없습니다.\r
  explanation: |-\r
    여러 same 쌍과 여러 diff 쌍을 만들어 모두 점수를 계산하고, 임곗값에 따른 분류 결과를 표로 보여 줍니다.\r
  tips:\r
  - 같은 쌍은 변형을 다양하게 두고, 다른 쌍은 카테고리를 분명히 다르게 두어야 평가가 의미 있습니다.\r
  snippet: |-\r
    pairs = [\r
        ('same1', china, chinaBright, 1),\r
        ('same2', china, chinaDim, 1),\r
        ('diff1', china, flower, 0),\r
        ('diff2', chinaBright, flower, 0),\r
    ]\r
    report = []\r
    for name, a, b, label in pairs:\r
        score = cosine(a, b)\r
        report.append({"pair": name, "score": round(score, 3), "expected": label, "pred": int(score > 0.85)})\r
    report\r
  exercise:\r
    prompt: report에서 예측이 expected와 일치한 비율(정확도) 을 계산하세요.\r
    starterCode: |-\r
      correct = sum(1 for r in report if r['pred'] == r['___'])\r
      accuracy = correct / len(report)\r
      accuracy\r
    hints:\r
    - 빈칸은 'expected' 입니다.\r
    - 합성 쌍에서 정확도가 75% 이상이면 무난합니다.\r
  check:\r
    noError: 다중 평가가 오류 없이 끝나야 합니다.\r
    resultCheck: len(report) 가 4여야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 임곗값 스윕\r
  goal: 여러 임곗값에 대해 정확도를 측정해 가장 좋은 값을 찾습니다.\r
  why: 임곗값 선택은 응용 성공의 핵심 결정 중 하나입니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 임곗값 스윕은 ROC 곡선의 단순 버전입니다.\r
  snippet: |-\r
    thresholds = [0.6, 0.7, 0.8, 0.85, 0.9, 0.95]\r
    accuracies = []\r
    for thr in thresholds:\r
        hits = sum(1 for r in report if int(r['score'] > thr) == r['expected'])\r
        accuracies.append(hits / len(report))\r
    list(zip(thresholds, accuracies))\r
  exercise:\r
    prompt: "미션1: 임곗값 vs 정확도를 라인 차트로 그리세요. 미션2: 최고 정확도를 만드는 임곗값을 출력하세요."\r
    starterCode: |-\r
      fig = plt.figure(figsize=(6, 3))\r
      plt.plot(thresholds, accuracies, marker='o')\r
      plt.xlabel('threshold')\r
      plt.ylabel('___')\r
      fig\r
    hints:\r
    - 빈칸은 'accuracy' 입니다.\r
    - 라인이 한 점에서 꺾이는 모양이 자연스럽습니다.\r
  check:\r
    noError: 스윕이 오류 없이 끝나야 합니다.\r
    resultCheck: len(accuracies) 가 6 이어야 합니다.\r
`;export{e as default};