var e=`meta:
  id: deepVision_07
  title: Keypoint R-CNN 포즈 추정
  order: 7
  category: deepVision
  difficulty: ⭐⭐⭐⭐
  badge: 중급
  packages:
  - matplotlib
  - numpy
  - scikit-learn
  - torch
  - torchvision
  tags:
  - torchvision
  - 포즈추정
  - keypoint
  - COCO
  - skeleton
  seo:
    title: 딥러닝 비전 - 포즈 추정
    description: torchvision Keypoint R-CNN으로 사람 17포인트 키포인트를 추정합니다.
    keywords:
    - 포즈추정
    - keypoint
    - 스켈레톤
    - torchvision
intro:
  emoji: 🤸
  goal: 사진에서 사람의 17개 관절을 자동으로 추정하는 사전학습 모델을 호출합니다.
  description: |-
    포즈 추정은 사람 동작 분석, 운동 자세 점검, 안무 시각화 등 폭넓게 쓰입니다. 이 강의는 torchvision의 Keypoint R-CNN으로 17 keypoints(COCO 표준) 를 추출하고, 골격 선으로 연결해 시각화합니다. sklearn 이미지에는 사람이 없을 수 있으므로 합성 사람 윤곽(혹은 단순 도형)으로 학습합니다.
  direction: 사람 형태의 합성 이미지 또는 외부 사진에 사전학습 모델을 적용해 키포인트와 골격을 시각화합니다.
  benefits:
  - keypointrcnn_resnet50_fpn 사전학습 가중치 호출 방법을 익힙니다.
  - 출력의 keypoints와 keypoint_scores 의미를 이해합니다.
  - COCO 17 키포인트의 연결 규칙으로 스켈레톤을 그립니다.
  diagram:
    steps:
    - label: 1단계. 사람 사진 준비
      detail: 합성 사람 윤곽 또는 sklearn 이미지.
    - label: 2단계. 모델 로드
      detail: keypointrcnn_resnet50_fpn.
    - label: 3단계. 추론
      detail: keypoints, scores 추출.
    - label: 4단계. 점 시각화
      detail: 17 keypoints scatter.
    - label: 5단계. 스켈레톤 그리기
      detail: COCO 연결 규칙 적용.
    runtime:
    - label: PyTorch 환경
      detail: torchvision detection 모듈을 사용합니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: figure_image
  title: 1단계. 사람 사진 준비
  structuredPrimary: true
  subtitle: 사람 모양 합성
  goal: 사람 윤곽을 단순한 도형으로 그려 학습 입력으로 사용합니다.
  why: 학습 환경이 외부 사진에 의존하지 않도록 합성을 사용합니다.
  explanation: |-
    cv2 없이 numpy 배열에 직접 도형을 그릴 수 있지만, 더 단순하게는 사람 사진 한 장이 있다면 그것을 그대로 사용하면 됩니다. 여기서는 학습이 보장되도록 china 이미지를 그대로 입력으로 씁니다(모델이 사람을 찾지 못해도 출력 형식만 검증).

    실제 사람 사진이 있으면 더 의미 있는 결과를 얻을 수 있습니다.
  tips:
  - 사전학습 모델은 어떤 이미지든 받지만, 사람이 없으면 keypoint 출력이 비거나 의미가 없습니다.
  snippet: |-
    import torch
    import torchvision
    from torchvision.models.detection import keypointrcnn_resnet50_fpn, KeypointRCNN_ResNet50_FPN_Weights
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.datasets import load_sample_image

    sampleImg = load_sample_image('china.jpg')
    sampleImg.shape
  exercise:
    prompt: flower 이미지도 같은 흐름으로 준비하세요.
    starterCode: |-
      flowerImg = load_sample_image('___')
      flowerImg.shape
    hints:
    - 빈칸은 'flower.jpg' 입니다.
    - 결과 shape의 마지막 차원은 3입니다.
  check:
    noError: 이미지 로드가 오류 없이 끝나야 합니다.
    resultCheck: sampleImg.shape의 마지막 차원이 3이어야 합니다.
- id: load_pose
  title: 2단계. 모델 로드
  structuredPrimary: true
  subtitle: keypointrcnn_resnet50_fpn
  goal: 사전학습 포즈 모델을 로드합니다.
  why: COCO 사람 키포인트에 학습된 모델이라 별도 학습 없이 추론이 가능합니다.
  explanation: |-
    \`keypointrcnn_resnet50_fpn(weights=KeypointRCNN_ResNet50_FPN_Weights.DEFAULT)\` 한 줄입니다. 가중치 파일이 큽니다(약 230MB).

    모델은 사람 박스와 그 안의 17 keypoints를 동시에 반환합니다.
  tips:
  - 포즈 모델은 객체 탐지보다 무겁고 가중치 파일도 큽니다. CPU 한 장당 5~15초가 걸릴 수 있습니다.
  snippet: |-
    poseWeights = KeypointRCNN_ResNet50_FPN_Weights.DEFAULT
    poseModel = keypointrcnn_resnet50_fpn(weights=poseWeights, box_score_thresh=0.5)
    poseModel.eval()
    type(poseModel).__name__
  exercise:
    prompt: 모델의 카테고리 라벨이 무엇인지 출력하세요.
    starterCode: |-
      poseWeights.meta['categories'][:___]
    hints:
    - 빈칸은 정수 3입니다.
    - 첫 라벨은 보통 __background__ 일 수 있습니다.
  check:
    noError: 모델 로드가 오류 없이 끝나야 합니다.
    resultCheck: type(poseModel).__name__이 'KeypointRCNN' 이어야 합니다.
- id: infer
  title: 3단계. 추론
  structuredPrimary: true
  subtitle: keypoints, scores
  goal: 모델을 호출해 사람 박스와 keypoints를 동시에 얻습니다.
  why: 포즈 모델의 출력 형식을 이해해야 다음 단계 시각화를 풀 수 있습니다.
  explanation: |-
    \`poseModel([tensor])[0]\` 는 dict로 \`boxes\`, \`scores\`, \`labels\`, \`keypoints\`, \`keypoints_scores\` 를 포함합니다. keypoints shape는 (N, 17, 3) 으로 마지막 차원은 (x, y, visibility) 입니다.
  tips:
  - keypoints의 visibility 값이 작으면 그 관절이 가려져 신뢰도가 낮다는 신호입니다.
  snippet: |-
    inputTensor = torch.from_numpy(sampleImg).permute(2, 0, 1).float() / 255.0
    with torch.inference_mode():
        poseResult = poseModel([inputTensor])[0]
    sorted(poseResult.keys()), poseResult['keypoints'].shape
  exercise:
    prompt: flower 이미지에도 같은 추론을 적용하세요.
    starterCode: |-
      flowerInput = torch.from_numpy(flowerImg).permute(2, 0, 1).float() / 255.0
      with torch.inference_mode():
          flowerPose = poseModel([___])[0]
      flowerPose['keypoints'].shape
    hints:
    - 빈칸은 flowerInput 변수입니다.
    - 결과 shape의 첫 차원이 0이면 사람을 못 찾은 것입니다.
  check:
    noError: 포즈 추론이 오류 없이 끝나야 합니다.
    resultCheck: poseResult['keypoints']가 텐서여야 합니다.
- id: draw_points
  title: 4단계. 점 시각화
  structuredPrimary: true
  subtitle: 17 keypoints scatter
  goal: 검출된 keypoints를 사진 위에 점으로 표시합니다.
  why: 점만 그려도 모델이 무엇을 검출했는지 시각적으로 확인됩니다.
  explanation: |-
    각 사람의 keypoints (17, 3) 를 모두 그립니다. 점수가 낮으면 visibility로 거를 수 있습니다.

    합성 또는 사람이 없는 사진에서는 keypoints가 0개일 수도 있습니다. 그럴 때는 결과 없음 메시지를 출력하면 됩니다.
  tips:
  - keypoint 색은 모든 점에 같은 색을 줘도 좋고, 17개를 색맵으로 다르게 줘도 좋습니다.
  snippet: |-
    fig, axis = plt.subplots(figsize=(8, 6))
    axis.imshow(sampleImg)
    axis.axis('off')
    if poseResult['keypoints'].shape[0] == 0:
        axis.set_title('no person detected')
    else:
        firstPerson = poseResult['keypoints'][0].numpy()
        axis.scatter(firstPerson[:, 0], firstPerson[:, 1], s=40, c='red', edgecolors='black')
        axis.set_title(f"first person {firstPerson.shape[0]} keypoints")
    fig
  exercise:
    prompt: flower 이미지에 대해서도 같은 시각화를 수행하세요.
    starterCode: |-
      fig2, axis2 = plt.subplots(figsize=(8, 6))
      axis2.imshow(flowerImg)
      axis2.axis('off')
      if flowerPose['keypoints'].shape[___] == 0:
          axis2.set_title('no person detected')
      else:
          fp = flowerPose['keypoints'][0].numpy()
          axis2.scatter(fp[:, 0], fp[:, 1], s=40, c='cyan', edgecolors='black')
      fig2
    hints:
    - 빈칸은 정수 0입니다.
    - flower 사진은 보통 사람이 없습니다.
  check:
    noError: 시각화가 오류 없이 끝나야 합니다.
    resultCheck: poseResult가 dict여야 합니다.
- id: skeleton
  title: 5단계. 스켈레톤 그리기
  structuredPrimary: true
  subtitle: COCO 연결 규칙
  goal: 17 keypoints를 COCO 표준 연결로 이어 스켈레톤을 그립니다.
  why: 점만 그리는 것보다 선으로 잇는 것이 자세 정보를 직관적으로 전달합니다.
  explanation: |-
    COCO keypoint 표준 연결(skeleton)은 모델 메타데이터에 들어 있을 수도 있고, 다음과 같은 표준을 직접 두기도 합니다.

    \`[(0,1),(0,2),(1,3),(2,4),(5,6),(5,7),(7,9),(6,8),(8,10),(5,11),(6,12),(11,12),(11,13),(13,15),(12,14),(14,16)]\`

    각 튜플의 두 인덱스 keypoints를 선으로 잇습니다.
  tips:
  - 사람이 검출되지 않으면 스켈레톤이 비어 보일 수 있습니다.
  snippet: |-
    SKELETON = [(0, 1), (0, 2), (1, 3), (2, 4), (5, 6), (5, 7), (7, 9), (6, 8), (8, 10),
                (5, 11), (6, 12), (11, 12), (11, 13), (13, 15), (12, 14), (14, 16)]

    fig, axis = plt.subplots(figsize=(8, 6))
    axis.imshow(sampleImg)
    axis.axis('off')
    if poseResult['keypoints'].shape[0] > 0:
        pts = poseResult['keypoints'][0].numpy()
        axis.scatter(pts[:, 0], pts[:, 1], s=30, c='red', edgecolors='black')
        for a, b in SKELETON:
            axis.plot([pts[a, 0], pts[b, 0]], [pts[a, 1], pts[b, 1]], color='yellow', linewidth=2)
    axis.set_title('skeleton')
    fig
  exercise:
    prompt: flower 이미지에도 같은 흐름을 적용하세요(사람이 없으면 빈 결과 출력).
    starterCode: |-
      fig3, axis3 = plt.subplots(figsize=(8, 6))
      axis3.imshow(flowerImg)
      axis3.axis('off')
      if flowerPose['keypoints'].shape[0] > 0:
          fp = flowerPose['keypoints'][0].numpy()
          axis3.scatter(fp[:, 0], fp[:, 1], s=30, c='cyan')
          for a, b in SKELETON:
              axis3.plot([fp[a, 0], fp[b, 0]], [fp[a, 1], fp[b, 1]], color='magenta', linewidth=___)
      fig3
    hints:
    - 빈칸은 정수 2 입니다.
    - 사람이 없으면 점도 선도 그려지지 않습니다.
  check:
    noError: 스켈레톤 그리기가 오류 없이 끝나야 합니다.
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 사람 박스와 키포인트 모두
  goal: 검출된 사람 박스와 키포인트를 동시에 그립니다.
  why: 박스와 스켈레톤이 함께 있으면 다중 인원 처리 시 어느 박스의 자세인지 명확합니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 사진에 사람이 여러 명이면 keypoints 텐서의 첫 차원이 사람 수가 됩니다.
  snippet: |-
    poseScores = poseResult['scores'].tolist()
    poseBoxes = poseResult['boxes'].tolist()
    list(zip(poseBoxes, poseScores))
  exercise:
    prompt: "미션1: 사람 박스와 스켈레톤을 한 화면에 그리세요(박스는 노랑, 스켈레톤은 자홍). 미션2: 검출된 사람 수와 첫 사람의 평균 keypoint visibility를 출력하세요."
    starterCode: |-
      from matplotlib.patches import Rectangle

      fig, axis = plt.subplots(figsize=(8, 6))
      axis.imshow(sampleImg)
      axis.axis('off')
      if poseResult['keypoints'].shape[0] > 0:
          for box in poseResult['boxes']:
              x1, y1, x2, y2 = box.tolist()
              axis.add_patch(Rectangle((x1, y1), x2 - x1, y2 - y1, edgecolor='yellow', facecolor='none', linewidth=2))
          pts = poseResult['keypoints'][0].numpy()
          for a, b in SKELETON:
              axis.plot([pts[a, 0], pts[b, 0]], [pts[a, 1], pts[b, 1]], color='magenta', linewidth=2)
      fig
    hints:
    - "visibility 평균은 pts[:, 2].mean() 한 줄입니다."
    - 사람 수는 keypoints 텐서의 첫 차원입니다.
  check:
    noError: 박스 + 스켈레톤 시각화가 오류 없이 끝나야 합니다.
    resultCheck: poseResult가 dict이고 keypoints 키를 가져야 합니다.
assessment:
  schemaVersion: 1
  performanceClaim: 웹에서는 외부 패키지 없이 분석 판단과 데이터 계약을 검증하고, 실제 패키지 API와 산출물은 lesson Run 및 Local 실습 증거로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: pending
  masteryVariants:
  - id: deepVision_07-pose_estimation-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - figure_image
    - practice
    title: 포즈 추정 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: joint 수·confidence·skeleton map·person budget를 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_pose_estimation_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_pose_estimation_contract(value):
            raise NotImplementedError
      solution: |
        def audit_pose_estimation_contract(value):
            required = ['jointCount', 'confidenceThreshold', 'skeletonHash', 'maxPeople']
            rules = [{'id': 'joints', 'field': 'jointCount', 'kind': 'range', 'min': 1, 'max': 1000}, {'id': 'confidence', 'field': 'confidenceThreshold', 'kind': 'unit-interval'}, {'id': 'skeleton', 'field': 'skeletonHash', 'kind': 'nonempty'}, {'id': 'people', 'field': 'maxPeople', 'kind': 'range', 'min': 1, 'max': 1000}]
            missing = sorted(field for field in required if field not in value)
            violations = []
            for rule in rules:
                field = rule["field"]
                current = value.get(field)
                kind = rule["kind"]
                failed = False
                if kind == "range":
                    failed = not isinstance(current, (int, float)) or isinstance(current, bool) or current < rule["min"] or current > rule["max"]
                elif kind == "enum":
                    failed = current not in rule["values"]
                elif kind == "odd":
                    failed = not isinstance(current, int) or isinstance(current, bool) or current <= 0 or current % 2 == 0
                elif kind == "positive":
                    failed = not isinstance(current, (int, float)) or isinstance(current, bool) or current <= 0
                elif kind == "unit-interval":
                    failed = not isinstance(current, (int, float)) or isinstance(current, bool) or current < 0 or current > 1
                elif kind == "not-equal":
                    failed = current == value.get(rule["other"])
                elif kind == "ordered":
                    other = value.get(rule["other"])
                    failed = not isinstance(current, (int, float)) or isinstance(current, bool) or not isinstance(other, (int, float)) or isinstance(other, bool) or current >= other
                elif kind == "length":
                    failed = not isinstance(current, (list, tuple)) or len(current) != rule["value"]
                elif kind == "divisible":
                    failed = not isinstance(current, int) or isinstance(current, bool) or current % rule["value"] != 0
                elif kind == "nonempty":
                    failed = not isinstance(current, (str, list, tuple, dict)) or len(current) == 0
                if failed:
                    violations.append(rule["id"])
            violations.sort()
            return {"accepted": not missing and not violations, "topic": 'pose_estimation', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.deep-vision.deepVision_07.pose_estimation-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_07.pose_estimation-contract-audit.mastery.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: audit_pose_estimation_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              jointCount: 17
              confidenceThreshold: 0.4
              skeletonHash: coco-17
              maxPeople: 20
          expectedReturn:
            accepted: true
            topic: pose_estimation
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              confidenceThreshold: 0.4
              skeletonHash: coco-17
              maxPeople: 20
          expectedReturn:
            accepted: false
            topic: pose_estimation
            missing:
            - jointCount
            violations:
            - joints
        - id: reports-topic-invariants
          arguments:
          - value:
              jointCount: 0
              confidenceThreshold: 2
              skeletonHash: ''
              maxPeople: 0
          expectedReturn:
            accepted: false
            topic: pose_estimation
            missing: []
            violations:
            - confidence
            - joints
            - people
            - skeleton
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: deepVision_07-pose_estimation-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_07-pose_estimation-contract-audit-mastery
    title: 포즈 추정 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_pose_estimation_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_pose_estimation_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_pose_estimation_result(expected, observed):
            identity = ['sourceHash', 'modelHash', 'skeletonHash']
            metrics = {'visibleJoints': 1}
            required = set(identity) | set(metrics)
            missing = sorted(required - set(observed))
            identity_mismatch = sorted(field for field in identity if field in observed and observed[field] != expected.get(field))
            metric_drift = []
            for field, tolerance in metrics.items():
                if field not in observed:
                    continue
                actual = observed[field]
                target = expected.get(field)
                if not isinstance(actual, (int, float)) or isinstance(actual, bool) or not isinstance(target, (int, float)) or isinstance(target, bool) or abs(actual - target) > tolerance:
                    metric_drift.append(field)
            metric_drift.sort()
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'pose_estimation', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.deep-vision.deepVision_07.pose_estimation-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_07.pose_estimation-result-reconciliation.transfer.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: reconcile_pose_estimation_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: pose1
              modelHash: pose-a
              skeletonHash: coco-17
              visibleJoints: 14
          - value:
              sourceHash: pose1
              modelHash: pose-a
              skeletonHash: coco-17
              visibleJoints: 15
          expectedReturn:
            passed: true
            topic: pose_estimation
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: pose1
              modelHash: pose-a
              skeletonHash: coco-17
              visibleJoints: 14
          - value:
              sourceHash: pose2
              modelHash: pose-b
              skeletonHash: mpi
              visibleJoints: 5
          expectedReturn:
            passed: false
            topic: pose_estimation
            missing: []
            identityMismatch:
            - modelHash
            - skeletonHash
            - sourceHash
            metricDrift:
            - visibleJoints
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: pose1
              modelHash: pose-a
              skeletonHash: coco-17
              visibleJoints: 14
          - value: {}
          expectedReturn:
            passed: false
            topic: pose_estimation
            missing:
            - modelHash
            - skeletonHash
            - sourceHash
            - visibleJoints
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: deepVision_07-pose_estimation-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_07-pose_estimation-result-reconciliation-transfer
    title: 포즈 추정 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_pose_estimation_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_pose_estimation_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_pose_estimation_evidence(stage):
            stages = {'source': {'action': 'validate pose source and model', 'evidence': 'image model skeleton contract', 'risk': 'model-input mismatch'}, 'inference': {'action': 'run bounded pose inference', 'evidence': 'keypoint confidence trace', 'risk': 'nondeterministic or unsafe inference'}, 'result': {'action': 'reconcile pose output', 'evidence': 'joint bounds and overlay', 'risk': 'confident wrong prediction'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.deep-vision.deepVision_07.pose_estimation-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_07.pose_estimation-evidence-recall.retrieval.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: choose_pose_estimation_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate pose source and model
            evidence: image model skeleton contract
            risk: model-input mismatch
        - id: recalls-inference
          arguments:
          - value: inference
          expectedReturn:
            action: run bounded pose inference
            evidence: keypoint confidence trace
            risk: nondeterministic or unsafe inference
        - id: recalls-result
          arguments:
          - value: result
          expectedReturn:
            action: reconcile pose output
            evidence: joint bounds and overlay
            risk: confident wrong prediction
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};