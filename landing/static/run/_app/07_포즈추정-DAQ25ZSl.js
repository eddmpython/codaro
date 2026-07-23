var e=`meta:\r
  id: deepVision_07\r
  title: Keypoint R-CNN 포즈 추정\r
  order: 7\r
  category: deepVision\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 중급\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - scikit-learn\r
  - torch\r
  - torchvision\r
  tags:\r
  - torchvision\r
  - 포즈추정\r
  - keypoint\r
  - COCO\r
  - skeleton\r
  seo:\r
    title: 딥러닝 비전 - 포즈 추정\r
    description: torchvision Keypoint R-CNN으로 사람 17포인트 키포인트를 추정합니다.\r
    keywords:\r
    - 포즈추정\r
    - keypoint\r
    - 스켈레톤\r
    - torchvision\r
intro:\r
  emoji: 🤸\r
  goal: 사진에서 사람의 17개 관절을 자동으로 추정하는 사전학습 모델을 호출합니다.\r
  description: |-\r
    포즈 추정은 사람 동작 분석, 운동 자세 점검, 안무 시각화 등 폭넓게 쓰입니다. 이 강의는 torchvision의 Keypoint R-CNN으로 17 keypoints(COCO 표준) 를 추출하고, 골격 선으로 연결해 시각화합니다. sklearn 이미지에는 사람이 없을 수 있으므로 합성 사람 윤곽(혹은 단순 도형)으로 학습합니다.\r
  direction: 사람 형태의 합성 이미지 또는 외부 사진에 사전학습 모델을 적용해 키포인트와 골격을 시각화합니다.\r
  benefits:\r
  - keypointrcnn_resnet50_fpn 사전학습 가중치 호출 방법을 익힙니다.\r
  - 출력의 keypoints와 keypoint_scores 의미를 이해합니다.\r
  - COCO 17 키포인트의 연결 규칙으로 스켈레톤을 그립니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 사람 사진 준비\r
      detail: 합성 사람 윤곽 또는 sklearn 이미지.\r
    - label: 2단계. 모델 로드\r
      detail: keypointrcnn_resnet50_fpn.\r
    - label: 3단계. 추론\r
      detail: keypoints, scores 추출.\r
    - label: 4단계. 점 시각화\r
      detail: 17 keypoints scatter.\r
    - label: 5단계. 스켈레톤 그리기\r
      detail: COCO 연결 규칙 적용.\r
    runtime:\r
    - label: PyTorch 환경\r
      detail: torchvision detection 모듈을 사용합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: figure_image\r
  title: 1단계. 사람 사진 준비\r
  structuredPrimary: true\r
  subtitle: 사람 모양 합성\r
  goal: 사람 윤곽을 단순한 도형으로 그려 학습 입력으로 사용합니다.\r
  why: 학습 환경이 외부 사진에 의존하지 않도록 합성을 사용합니다.\r
  explanation: |-\r
    cv2 없이 numpy 배열에 직접 도형을 그릴 수 있지만, 더 단순하게는 사람 사진 한 장이 있다면 그것을 그대로 사용하면 됩니다. 여기서는 학습이 보장되도록 china 이미지를 그대로 입력으로 씁니다(모델이 사람을 찾지 못해도 출력 형식만 검증).\r
\r
    실제 사람 사진이 있으면 더 의미 있는 결과를 얻을 수 있습니다.\r
  tips:\r
  - 사전학습 모델은 어떤 이미지든 받지만, 사람이 없으면 keypoint 출력이 비거나 의미가 없습니다.\r
  snippet: |-\r
    import torch\r
    import torchvision\r
    from torchvision.models.detection import keypointrcnn_resnet50_fpn, KeypointRCNN_ResNet50_FPN_Weights\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    sampleImg = load_sample_image('china.jpg')\r
    sampleImg.shape\r
  exercise:\r
    prompt: flower 이미지도 같은 흐름으로 준비하세요.\r
    starterCode: |-\r
      flowerImg = load_sample_image('___')\r
      flowerImg.shape\r
    hints:\r
    - 빈칸은 'flower.jpg' 입니다.\r
    - 결과 shape의 마지막 차원은 3입니다.\r
  check:\r
    noError: 이미지 로드가 오류 없이 끝나야 합니다.\r
    resultCheck: sampleImg.shape의 마지막 차원이 3이어야 합니다.\r
- id: load_pose\r
  title: 2단계. 모델 로드\r
  structuredPrimary: true\r
  subtitle: keypointrcnn_resnet50_fpn\r
  goal: 사전학습 포즈 모델을 로드합니다.\r
  why: COCO 사람 키포인트에 학습된 모델이라 별도 학습 없이 추론이 가능합니다.\r
  explanation: |-\r
    \`keypointrcnn_resnet50_fpn(weights=KeypointRCNN_ResNet50_FPN_Weights.DEFAULT)\` 한 줄입니다. 가중치 파일이 큽니다(약 230MB).\r
\r
    모델은 사람 박스와 그 안의 17 keypoints를 동시에 반환합니다.\r
  tips:\r
  - 포즈 모델은 객체 탐지보다 무겁고 가중치 파일도 큽니다. CPU 한 장당 5~15초가 걸릴 수 있습니다.\r
  snippet: |-\r
    poseWeights = KeypointRCNN_ResNet50_FPN_Weights.DEFAULT\r
    poseModel = keypointrcnn_resnet50_fpn(weights=poseWeights, box_score_thresh=0.5)\r
    poseModel.eval()\r
    type(poseModel).__name__\r
  exercise:\r
    prompt: 모델의 카테고리 라벨이 무엇인지 출력하세요.\r
    starterCode: |-\r
      poseWeights.meta['categories'][:___]\r
    hints:\r
    - 빈칸은 정수 3입니다.\r
    - 첫 라벨은 보통 __background__ 일 수 있습니다.\r
  check:\r
    noError: 모델 로드가 오류 없이 끝나야 합니다.\r
    resultCheck: type(poseModel).__name__이 'KeypointRCNN' 이어야 합니다.\r
- id: infer\r
  title: 3단계. 추론\r
  structuredPrimary: true\r
  subtitle: keypoints, scores\r
  goal: 모델을 호출해 사람 박스와 keypoints를 동시에 얻습니다.\r
  why: 포즈 모델의 출력 형식을 이해해야 다음 단계 시각화를 풀 수 있습니다.\r
  explanation: |-\r
    \`poseModel([tensor])[0]\` 는 dict로 \`boxes\`, \`scores\`, \`labels\`, \`keypoints\`, \`keypoints_scores\` 를 포함합니다. keypoints shape는 (N, 17, 3) 으로 마지막 차원은 (x, y, visibility) 입니다.\r
  tips:\r
  - keypoints의 visibility 값이 작으면 그 관절이 가려져 신뢰도가 낮다는 신호입니다.\r
  snippet: |-\r
    inputTensor = torch.from_numpy(sampleImg).permute(2, 0, 1).float() / 255.0\r
    with torch.inference_mode():\r
        poseResult = poseModel([inputTensor])[0]\r
    sorted(poseResult.keys()), poseResult['keypoints'].shape\r
  exercise:\r
    prompt: flower 이미지에도 같은 추론을 적용하세요.\r
    starterCode: |-\r
      flowerInput = torch.from_numpy(flowerImg).permute(2, 0, 1).float() / 255.0\r
      with torch.inference_mode():\r
          flowerPose = poseModel([___])[0]\r
      flowerPose['keypoints'].shape\r
    hints:\r
    - 빈칸은 flowerInput 변수입니다.\r
    - 결과 shape의 첫 차원이 0이면 사람을 못 찾은 것입니다.\r
  check:\r
    noError: 포즈 추론이 오류 없이 끝나야 합니다.\r
    resultCheck: poseResult['keypoints']가 텐서여야 합니다.\r
- id: draw_points\r
  title: 4단계. 점 시각화\r
  structuredPrimary: true\r
  subtitle: 17 keypoints scatter\r
  goal: 검출된 keypoints를 사진 위에 점으로 표시합니다.\r
  why: 점만 그려도 모델이 무엇을 검출했는지 시각적으로 확인됩니다.\r
  explanation: |-\r
    각 사람의 keypoints (17, 3) 를 모두 그립니다. 점수가 낮으면 visibility로 거를 수 있습니다.\r
\r
    합성 또는 사람이 없는 사진에서는 keypoints가 0개일 수도 있습니다. 그럴 때는 결과 없음 메시지를 출력하면 됩니다.\r
  tips:\r
  - keypoint 색은 모든 점에 같은 색을 줘도 좋고, 17개를 색맵으로 다르게 줘도 좋습니다.\r
  snippet: |-\r
    fig, axis = plt.subplots(figsize=(8, 6))\r
    axis.imshow(sampleImg)\r
    axis.axis('off')\r
    if poseResult['keypoints'].shape[0] == 0:\r
        axis.set_title('no person detected')\r
    else:\r
        firstPerson = poseResult['keypoints'][0].numpy()\r
        axis.scatter(firstPerson[:, 0], firstPerson[:, 1], s=40, c='red', edgecolors='black')\r
        axis.set_title(f"first person {firstPerson.shape[0]} keypoints")\r
    fig\r
  exercise:\r
    prompt: flower 이미지에 대해서도 같은 시각화를 수행하세요.\r
    starterCode: |-\r
      fig2, axis2 = plt.subplots(figsize=(8, 6))\r
      axis2.imshow(flowerImg)\r
      axis2.axis('off')\r
      if flowerPose['keypoints'].shape[___] == 0:\r
          axis2.set_title('no person detected')\r
      else:\r
          fp = flowerPose['keypoints'][0].numpy()\r
          axis2.scatter(fp[:, 0], fp[:, 1], s=40, c='cyan', edgecolors='black')\r
      fig2\r
    hints:\r
    - 빈칸은 정수 0입니다.\r
    - flower 사진은 보통 사람이 없습니다.\r
  check:\r
    noError: 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: poseResult가 dict여야 합니다.\r
- id: skeleton\r
  title: 5단계. 스켈레톤 그리기\r
  structuredPrimary: true\r
  subtitle: COCO 연결 규칙\r
  goal: 17 keypoints를 COCO 표준 연결로 이어 스켈레톤을 그립니다.\r
  why: 점만 그리는 것보다 선으로 잇는 것이 자세 정보를 직관적으로 전달합니다.\r
  explanation: |-\r
    COCO keypoint 표준 연결(skeleton)은 모델 메타데이터에 들어 있을 수도 있고, 다음과 같은 표준을 직접 두기도 합니다.\r
\r
    \`[(0,1),(0,2),(1,3),(2,4),(5,6),(5,7),(7,9),(6,8),(8,10),(5,11),(6,12),(11,12),(11,13),(13,15),(12,14),(14,16)]\`\r
\r
    각 튜플의 두 인덱스 keypoints를 선으로 잇습니다.\r
  tips:\r
  - 사람이 검출되지 않으면 스켈레톤이 비어 보일 수 있습니다.\r
  snippet: |-\r
    SKELETON = [(0, 1), (0, 2), (1, 3), (2, 4), (5, 6), (5, 7), (7, 9), (6, 8), (8, 10),\r
                (5, 11), (6, 12), (11, 12), (11, 13), (13, 15), (12, 14), (14, 16)]\r
\r
    fig, axis = plt.subplots(figsize=(8, 6))\r
    axis.imshow(sampleImg)\r
    axis.axis('off')\r
    if poseResult['keypoints'].shape[0] > 0:\r
        pts = poseResult['keypoints'][0].numpy()\r
        axis.scatter(pts[:, 0], pts[:, 1], s=30, c='red', edgecolors='black')\r
        for a, b in SKELETON:\r
            axis.plot([pts[a, 0], pts[b, 0]], [pts[a, 1], pts[b, 1]], color='yellow', linewidth=2)\r
    axis.set_title('skeleton')\r
    fig\r
  exercise:\r
    prompt: flower 이미지에도 같은 흐름을 적용하세요(사람이 없으면 빈 결과 출력).\r
    starterCode: |-\r
      fig3, axis3 = plt.subplots(figsize=(8, 6))\r
      axis3.imshow(flowerImg)\r
      axis3.axis('off')\r
      if flowerPose['keypoints'].shape[0] > 0:\r
          fp = flowerPose['keypoints'][0].numpy()\r
          axis3.scatter(fp[:, 0], fp[:, 1], s=30, c='cyan')\r
          for a, b in SKELETON:\r
              axis3.plot([fp[a, 0], fp[b, 0]], [fp[a, 1], fp[b, 1]], color='magenta', linewidth=___)\r
      fig3\r
    hints:\r
    - 빈칸은 정수 2 입니다.\r
    - 사람이 없으면 점도 선도 그려지지 않습니다.\r
  check:\r
    noError: 스켈레톤 그리기가 오류 없이 끝나야 합니다.\r
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 사람 박스와 키포인트 모두\r
  goal: 검출된 사람 박스와 키포인트를 동시에 그립니다.\r
  why: 박스와 스켈레톤이 함께 있으면 다중 인원 처리 시 어느 박스의 자세인지 명확합니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 사진에 사람이 여러 명이면 keypoints 텐서의 첫 차원이 사람 수가 됩니다.\r
  snippet: |-\r
    poseScores = poseResult['scores'].tolist()\r
    poseBoxes = poseResult['boxes'].tolist()\r
    list(zip(poseBoxes, poseScores))\r
  exercise:\r
    prompt: "미션1: 사람 박스와 스켈레톤을 한 화면에 그리세요(박스는 노랑, 스켈레톤은 자홍). 미션2: 검출된 사람 수와 첫 사람의 평균 keypoint visibility를 출력하세요."\r
    starterCode: |-\r
      from matplotlib.patches import Rectangle\r
\r
      fig, axis = plt.subplots(figsize=(8, 6))\r
      axis.imshow(sampleImg)\r
      axis.axis('off')\r
      if poseResult['keypoints'].shape[0] > 0:\r
          for box in poseResult['boxes']:\r
              x1, y1, x2, y2 = box.tolist()\r
              axis.add_patch(Rectangle((x1, y1), x2 - x1, y2 - y1, edgecolor='yellow', facecolor='none', linewidth=2))\r
          pts = poseResult['keypoints'][0].numpy()\r
          for a, b in SKELETON:\r
              axis.plot([pts[a, 0], pts[b, 0]], [pts[a, 1], pts[b, 1]], color='magenta', linewidth=2)\r
      fig\r
    hints:\r
    - "visibility 평균은 pts[:, 2].mean() 한 줄입니다."\r
    - 사람 수는 keypoints 텐서의 첫 차원입니다.\r
  check:\r
    noError: 박스 + 스켈레톤 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: poseResult가 dict이고 keypoints 키를 가져야 합니다.\r
`;export{e as default};