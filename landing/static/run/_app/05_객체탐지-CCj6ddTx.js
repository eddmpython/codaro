var e=`meta:
  id: deepVision_05
  title: Faster R-CNN 객체 탐지
  order: 5
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
  - 객체탐지
  - FasterRCNN
  - bbox
  - COCO
  seo:
    title: 딥러닝 비전 - Faster R-CNN 객체 탐지
    description: torchvision의 사전학습 Faster R-CNN으로 사진에서 객체 박스를 검출합니다.
    keywords:
    - 객체탐지
    - FasterRCNN
    - bbox
    - COCO
    - torchvision
intro:
  emoji: 📦
  goal: 사전학습 Faster R-CNN으로 사진에서 객체 박스, 점수, 라벨을 한 번에 얻습니다.
  description: |-
    객체 탐지는 분류와 달리 한 사진에 여러 객체가 등장할 수 있고, 각 객체의 위치(박스)와 라벨이 함께 필요합니다. torchvision은 COCO 80클래스에 학습된 Faster R-CNN을 제공합니다. 이 강의는 그 모델을 그대로 호출해 박스를 그리는 흐름을 익힙니다.
  direction: 사전학습 Faster R-CNN으로 사진을 추론하고 점수 임곗값으로 결과를 필터링해 박스를 시각화합니다.
  benefits:
  - torchvision의 detection 모델 호출 형식을 익힙니다.
  - 출력의 boxes, scores, labels 의미를 이해합니다.
  - 점수 임곗값과 NMS 결과를 시각화로 확인합니다.
  diagram:
    steps:
    - label: 1단계. 모델 로드
      detail: fasterrcnn_resnet50_fpn 사전학습.
    - label: 2단계. 입력 텐서 변환
      detail: detection은 normalize를 모델 내부에서 함.
    - label: 3단계. 추론 호출
      detail: 리스트 출력 형식 이해.
    - label: 4단계. 점수 임곗값 필터
      detail: score > threshold만 남기기.
    - label: 5단계. 박스 시각화
      detail: matplotlib Rectangle.
    runtime:
    - label: PyTorch 환경
      detail: torchvision detection 모듈을 사용합니다. CPU 추론은 한 장당 수 초 걸립니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: load_detector
  title: 1단계. 모델 로드
  structuredPrimary: true
  subtitle: Faster R-CNN ResNet50 FPN
  goal: 사전학습 Faster R-CNN 모델을 로드합니다.
  why: COCO 80 클래스에 학습되어 있어 일상 객체(사람, 차, 동물 등)를 즉시 검출합니다.
  explanation: |-
    \`from torchvision.models.detection import fasterrcnn_resnet50_fpn, FasterRCNN_ResNet50_FPN_Weights\` 로 가져옵니다. 가중치 파일이 큽니다(약 160MB). 첫 호출 시 다운로드합니다.

    이 모델은 분류 모델과 달리 입력에 자체적으로 정규화를 적용하므로 별도 normalize 없이 (C, H, W) float 텐서만 넘기면 됩니다.
  tips:
  - detection 모델은 분류보다 무겁습니다. CPU에서 한 장 추론에 수 초가 걸린다는 점을 학습자에게 알리세요.
  snippet: |-
    import torch
    import torchvision
    from torchvision.models.detection import fasterrcnn_resnet50_fpn, FasterRCNN_ResNet50_FPN_Weights
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.datasets import load_sample_image

    detWeights = FasterRCNN_ResNet50_FPN_Weights.DEFAULT
    detector = fasterrcnn_resnet50_fpn(weights=detWeights, box_score_thresh=0.5)
    detector.eval()
    type(detector).__name__
  exercise:
    prompt: 모델의 카테고리 라벨 첫 10개를 출력하세요.
    starterCode: |-
      detCategories = detWeights.meta['categories']
      detCategories[:___]
    hints:
    - 빈칸은 정수 10입니다.
    - 첫 라벨은 __background__ 일 수 있습니다.
  check:
    noError: 모델 로드가 오류 없이 끝나야 합니다.
    resultCheck: type(detector).__name__이 'FasterRCNN' 이어야 합니다.
- id: prepare_input
  title: 2단계. 입력 텐서 변환
  structuredPrimary: true
  subtitle: float 텐서 한 줄
  goal: numpy 이미지를 detection 모델 입력 형식으로 변환합니다.
  why: detection 모델은 분류와 입력 규약이 다릅니다(normalize 미적용, 리스트 입력).
  explanation: |-
    \`torch.from_numpy(img).permute(2, 0, 1).float() / 255.0\` 가 detection 모델용 한 줄 변환입니다. 모델 호출 시 입력은 텐서들의 리스트로 넘깁니다(\`detector([tensor])\`).

    리스트 형식은 한 번의 forward에서 여러 사진을 동시에 처리할 수 있게 합니다.
  tips:
  - detection 모델 입력 텐서는 (3, H, W) float 0~1 범위가 표준입니다.
  snippet: |-
    china = load_sample_image('china.jpg')
    chinaTensor = torch.from_numpy(china).permute(2, 0, 1).float() / 255.0
    chinaTensor.shape, chinaTensor.dtype
  exercise:
    prompt: flower 이미지에도 같은 변환을 적용하세요.
    starterCode: |-
      flower = load_sample_image('flower.jpg')
      flowerTensor = torch.from_numpy(flower).permute(___, ___, ___).float() / 255.0
      flowerTensor.shape
    hints:
    - "permute (2, 0, 1) 이 (H, W, C) → (C, H, W) 변환입니다."
    - 결과 shape의 첫 차원은 3입니다.
  check:
    noError: 텐서 변환이 오류 없이 끝나야 합니다.
    resultCheck: chinaTensor.shape의 첫 차원이 3이어야 합니다.
- id: inference
  title: 3단계. 추론 호출
  structuredPrimary: true
  subtitle: 리스트 입력 / 리스트 출력
  goal: 모델을 호출해 단일 이미지의 검출 결과 dict를 얻습니다.
  why: detection 모델의 출력 형식은 분류와 매우 다릅니다.
  explanation: |-
    \`detector([chinaTensor])\` 의 결과는 dict의 리스트입니다. 한 사진당 하나의 dict가 들어 있고 각 dict는 \`boxes\`, \`scores\`, \`labels\` 키를 가집니다.

    boxes는 (N, 4) float, 각 행은 [x1, y1, x2, y2]. scores는 (N,) float, labels는 (N,) int입니다.
  tips:
  - 첫 추론은 가중치 로딩과 워밍업 때문에 더 느립니다. 두 번째 추론부터가 정상 속도입니다.
  snippet: |-
    with torch.inference_mode():
        chinaResult = detector([chinaTensor])[0]
    sorted(chinaResult.keys()), chinaResult['boxes'].shape, chinaResult['scores'].shape
  exercise:
    prompt: flower 이미지에도 같은 추론을 적용해 flowerResult를 얻으세요.
    starterCode: |-
      with torch.inference_mode():
          flowerResult = detector([___])[0]
      sorted(flowerResult.keys()), flowerResult['scores'].shape
    hints:
    - 빈칸은 flowerTensor 변수입니다.
    - 결과는 같은 키 구조의 dict입니다.
  check:
    noError: 추론 호출이 오류 없이 끝나야 합니다.
    resultCheck: chinaResult가 dict이고 boxes 키가 있어야 합니다.
- id: score_filter
  title: 4단계. 점수 임곗값 필터
  structuredPrimary: true
  subtitle: 자신감 낮은 검출 거르기
  goal: scores 값으로 임곗값 이상의 박스만 남깁니다.
  why: 모델은 자신감이 낮은 후보도 함께 반환합니다. 임곗값으로 정밀도를 조절합니다.
  explanation: |-
    \`mask = chinaResult['scores'] > 0.7\` 같은 bool 마스크로 한 번에 필터링합니다. 보통 0.5~0.9 범위가 무난한 임곗값입니다.

    임곗값을 낮추면 검출 개수가 늘지만 거짓 양성도 증가합니다.
  tips:
  - 모델 생성 시 box_score_thresh를 미리 설정해 두면 이 단계가 생략됩니다.
  snippet: |-
    keep = chinaResult['scores'] > 0.7
    chinaBoxes = chinaResult['boxes'][keep]
    chinaScores = chinaResult['scores'][keep]
    chinaLabels = chinaResult['labels'][keep]
    chinaBoxes.shape, chinaScores.tolist(), chinaLabels.tolist()
  exercise:
    prompt: 임곗값을 0.5로 낮춰 더 많은 박스를 받는 chinaBoxesLoose를 만드세요.
    starterCode: |-
      keepLoose = chinaResult['scores'] > ___
      chinaBoxesLoose = chinaResult['boxes'][keepLoose]
      chinaBoxesLoose.shape
    hints:
    - 빈칸은 부동소수 0.5입니다.
    - 결과 박스 수가 strict보다 같거나 많아야 합니다.
  check:
    noError: 필터링이 오류 없이 끝나야 합니다.
    resultCheck: chinaBoxes.shape의 마지막 차원이 4여야 합니다.
- id: draw_boxes
  title: 5단계. 박스 시각화
  structuredPrimary: true
  subtitle: matplotlib Rectangle
  goal: 검출된 박스를 원본 이미지 위에 그립니다.
  why: 객체 탐지 결과는 시각화로 즉시 평가됩니다.
  explanation: |-
    \`matplotlib.patches.Rectangle\` 로 박스를 그립니다. 각 박스마다 좌상단 (x1, y1) 과 너비·높이 (x2-x1, y2-y1) 을 지정합니다.

    라벨을 박스 위에 텍스트로 함께 그리면 검출 결과의 의미가 분명해집니다.
  tips:
  - matplotlib Rectangle은 채워지지 않은 박스를 만들 때 fill=False를 지정합니다.
  snippet: |-
    from matplotlib.patches import Rectangle

    detCategories = detWeights.meta['categories']
    fig, axis = plt.subplots(figsize=(8, 6))
    axis.imshow(china)
    for box, score, labelIdx in zip(chinaBoxes, chinaScores, chinaLabels):
        x1, y1, x2, y2 = box.tolist()
        axis.add_patch(Rectangle((x1, y1), x2 - x1, y2 - y1, edgecolor='lime', facecolor='none', linewidth=2))
        labelName = detCategories[int(labelIdx)]
        axis.text(x1, max(y1 - 5, 0), f'{labelName} {float(score):.2f}', color='black', backgroundcolor='lime', fontsize=8)
    axis.axis('off')
    fig
  exercise:
    prompt: flower 이미지의 검출 결과도 같은 패턴으로 시각화하세요.
    starterCode: |-
      keepFlower = flowerResult['scores'] > 0.5
      flowerBoxes = flowerResult['boxes'][keepFlower]
      flowerScores = flowerResult['scores'][keepFlower]
      flowerLabels = flowerResult['labels'][keepFlower]
      fig2, axis2 = plt.subplots(figsize=(8, 6))
      axis2.imshow(flower)
      for box, score, labelIdx in zip(flowerBoxes, flowerScores, flowerLabels):
          x1, y1, x2, y2 = box.tolist()
          axis2.add_patch(Rectangle((x1, y1), x2 - x1, y2 - y1, edgecolor='red', facecolor='none', linewidth=2))
          name = detCategories[int(labelIdx)]
          axis2.text(x1, max(y1 - 5, 0), f'{name} {float(score):.2f}', color='white', backgroundcolor='red', fontsize=8)
      axis2.axis('___')
      fig2
    hints:
    - 빈칸은 문자열 'off' 입니다.
    - flower 사진에는 객체가 잡힐 수도 안 잡힐 수도 있습니다.
  check:
    noError: 박스 시각화가 오류 없이 끝나야 합니다.
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 임곗값 영향 비교
  goal: 같은 사진에 임곗값 0.3, 0.5, 0.7을 적용해 박스 수가 어떻게 변하는지 비교합니다.
  why: 임곗값 튜닝이 정밀도-재현율 트레이드오프를 만든다는 점을 직접 확인합니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 임곗값을 너무 낮추면 중복 검출이 늘어 노이즈가 됩니다.
  snippet: |-
    thresholds = [0.3, 0.5, 0.7]
    counts = []
    for thr in thresholds:
        keepCur = chinaResult['scores'] > thr
        counts.append(int(keepCur.sum()))
    list(zip(thresholds, counts))
  exercise:
    prompt: "미션1: 세 임곗값의 박스를 1x3 그리드로 시각화하세요. 미션2: chinaResult의 모든 라벨(필터 없이) 의 분포를 막대 그래프로 출력하세요."
    starterCode: |-
      fig, axes = plt.subplots(1, 3, figsize=(15, 5))
      for axis, thr in zip(axes, thresholds):
          axis.imshow(china)
          keepCur = chinaResult['scores'] > thr
          for box, score, labelIdx in zip(chinaResult['boxes'][keepCur], chinaResult['scores'][keepCur], chinaResult['labels'][keepCur]):
              x1, y1, x2, y2 = box.tolist()
              axis.add_patch(Rectangle((x1, y1), x2 - x1, y2 - y1, edgecolor='cyan', facecolor='none', linewidth=2))
          axis.set_title(f'threshold {thr}')
          axis.axis('off')
      fig
    hints:
    - 임곗값이 낮으면 박스가 많이 보입니다.
    - 라벨 분포는 collections.Counter 한 줄로 구할 수 있습니다.
  check:
    noError: 임곗값 비교가 오류 없이 끝나야 합니다.
    resultCheck: counts의 길이가 3이어야 합니다.
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
  - id: deepVision_05-object_detection-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - load_detector
    - practice
    title: 객체 탐지 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: confidence·NMS IoU·max detection·label map 계약을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_object_detection_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_object_detection_contract(value):
            raise NotImplementedError
      solution: |
        def audit_object_detection_contract(value):
            required = ['confidenceThreshold', 'nmsIouThreshold', 'maxDetections', 'labelMapHash']
            rules = [{'id': 'confidence', 'field': 'confidenceThreshold', 'kind': 'unit-interval'}, {'id': 'nms', 'field': 'nmsIouThreshold', 'kind': 'unit-interval'}, {'id': 'max-detections', 'field': 'maxDetections', 'kind': 'range', 'min': 1, 'max': 10000}, {'id': 'labels', 'field': 'labelMapHash', 'kind': 'nonempty'}]
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
            return {"accepted": not missing and not violations, "topic": 'object_detection', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.deep-vision.deepVision_05.object_detection-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_05.object_detection-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_object_detection_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              confidenceThreshold: 0.5
              nmsIouThreshold: 0.45
              maxDetections: 100
              labelMapHash: coco-80
          expectedReturn:
            accepted: true
            topic: object_detection
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              nmsIouThreshold: 0.45
              maxDetections: 100
              labelMapHash: coco-80
          expectedReturn:
            accepted: false
            topic: object_detection
            missing:
            - confidenceThreshold
            violations:
            - confidence
        - id: reports-topic-invariants
          arguments:
          - value:
              confidenceThreshold: -1
              nmsIouThreshold: 2
              maxDetections: 0
              labelMapHash: ''
          expectedReturn:
            accepted: false
            topic: object_detection
            missing: []
            violations:
            - confidence
            - labels
            - max-detections
            - nms
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: deepVision_05-object_detection-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_05-object_detection-contract-audit-mastery
    title: 객체 탐지 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_object_detection_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_object_detection_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_object_detection_result(expected, observed):
            identity = ['sourceHash', 'modelHash', 'labelMapHash']
            metrics = {'detectionCount': 1}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'object_detection', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.deep-vision.deepVision_05.object_detection-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_05.object_detection-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_object_detection_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: det1
              modelHash: yolo-a
              labelMapHash: coco-80
              detectionCount: 8
          - value:
              sourceHash: det1
              modelHash: yolo-a
              labelMapHash: coco-80
              detectionCount: 9
          expectedReturn:
            passed: true
            topic: object_detection
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: det1
              modelHash: yolo-a
              labelMapHash: coco-80
              detectionCount: 8
          - value:
              sourceHash: det2
              modelHash: yolo-b
              labelMapHash: other
              detectionCount: 40
          expectedReturn:
            passed: false
            topic: object_detection
            missing: []
            identityMismatch:
            - labelMapHash
            - modelHash
            - sourceHash
            metricDrift:
            - detectionCount
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: det1
              modelHash: yolo-a
              labelMapHash: coco-80
              detectionCount: 8
          - value: {}
          expectedReturn:
            passed: false
            topic: object_detection
            missing:
            - detectionCount
            - labelMapHash
            - modelHash
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: deepVision_05-object_detection-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_05-object_detection-result-reconciliation-transfer
    title: 객체 탐지 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_object_detection_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_object_detection_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_object_detection_evidence(stage):
            stages = {'source': {'action': 'validate detection source and model', 'evidence': 'image model labels thresholds', 'risk': 'model-input mismatch'}, 'inference': {'action': 'run bounded detection inference', 'evidence': 'decode confidence NMS trace', 'risk': 'nondeterministic or unsafe inference'}, 'result': {'action': 'reconcile detection output', 'evidence': 'box count and overlay geometry', 'risk': 'confident wrong prediction'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.deep-vision.deepVision_05.object_detection-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_05.object_detection-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_object_detection_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate detection source and model
            evidence: image model labels thresholds
            risk: model-input mismatch
        - id: recalls-inference
          arguments:
          - value: inference
          expectedReturn:
            action: run bounded detection inference
            evidence: decode confidence NMS trace
            risk: nondeterministic or unsafe inference
        - id: recalls-result
          arguments:
          - value: result
          expectedReturn:
            action: reconcile detection output
            evidence: box count and overlay geometry
            risk: confident wrong prediction
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};