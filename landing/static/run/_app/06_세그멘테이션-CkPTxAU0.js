var e=`meta:
  id: deepVision_06
  title: DeepLabV3 세맨틱 세그멘테이션
  order: 6
  category: deepVision
  difficulty: ⭐⭐⭐⭐
  badge: 중급
  packages:
  - matplotlib
  - numpy
  - pillow
  - scikit-learn
  - torch
  - torchvision
  tags:
  - torchvision
  - 세그멘테이션
  - DeepLabV3
  - 픽셀분류
  seo:
    title: 딥러닝 비전 - DeepLabV3 세맨틱 세그멘테이션
    description: torchvision DeepLabV3로 사진 픽셀마다 클래스를 예측해 세그 마스크를 만듭니다.
    keywords:
    - 세그멘테이션
    - DeepLabV3
    - 픽셀분류
    - torchvision
intro:
  emoji: 🧩
  goal: 픽셀 단위로 클래스를 예측하는 세맨틱 세그멘테이션을 사전학습 DeepLabV3로 실행합니다.
  description: |-
    분류는 사진 한 장 → 라벨 한 개, 탐지는 객체 한 개 → 박스 + 라벨이었습니다. 세그멘테이션은 픽셀 한 개 → 라벨 한 개로 가장 세밀한 출력입니다. 이 강의는 사전학습 DeepLabV3로 PASCAL VOC 21클래스 세그를 추론합니다.
  direction: DeepLabV3를 호출해 픽셀별 클래스 예측을 얻고 마스크를 컬러맵으로 시각화합니다.
  benefits:
  - segmentation 모델의 입출력 형식을 익힙니다.
  - argmax로 픽셀별 클래스를 얻고 클래스 마스크를 만듭니다.
  - 원본 위에 반투명 마스크를 덧입혀 시각화하는 표준 패턴을 익힙니다.
  diagram:
    steps:
    - label: 1단계. 모델과 가중치
      detail: deeplabv3_resnet50 로드.
    - label: 2단계. 입력 전처리
      detail: weights.transforms() 활용.
    - label: 3단계. 추론
      detail: dict 출력의 'out' 키.
    - label: 4단계. 픽셀별 클래스
      detail: argmax로 라벨 맵 만들기.
    - label: 5단계. 마스크 오버레이
      detail: 컬러맵과 alpha 합성.
    runtime:
    - label: PyTorch 환경
      detail: torchvision segmentation 모듈을 사용합니다. CPU 한 장당 수 초 소요.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: load_seg
  title: 1단계. 모델과 가중치
  structuredPrimary: true
  subtitle: deeplabv3_resnet50
  goal: 사전학습 DeepLabV3 ResNet50 모델을 로드합니다.
  why: DeepLab은 세그멘테이션 분야에서 가장 잘 알려진 모델 중 하나로 사전학습 가중치 품질이 높습니다.
  explanation: |-
    \`from torchvision.models.segmentation import deeplabv3_resnet50, DeepLabV3_ResNet50_Weights\` 로 가져옵니다. 가중치는 PASCAL VOC 21 클래스에 학습되어 있습니다(배경 포함).

    가중치 파일이 큽니다(약 160MB). 첫 호출 시 자동 다운로드합니다.
  tips:
  - 세그멘테이션 모델은 분류보다 무겁고 출력 크기가 입력 크기와 비슷해 메모리를 많이 씁니다.
  snippet: |-
    import torch
    import torchvision
    from torchvision.models.segmentation import deeplabv3_resnet50, DeepLabV3_ResNet50_Weights
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.datasets import load_sample_image

    segWeights = DeepLabV3_ResNet50_Weights.DEFAULT
    segModel = deeplabv3_resnet50(weights=segWeights)
    segModel.eval()
    type(segModel).__name__
  exercise:
    prompt: 모델의 클래스 라벨 전체 리스트를 출력하세요.
    starterCode: |-
      segCategories = segWeights.meta['categories']
      ___
    hints:
    - 빈칸은 segCategories 변수입니다.
    - 21개 라벨이 출력되어야 합니다.
  check:
    noError: 모델 로드가 오류 없이 끝나야 합니다.
    resultCheck: type(segModel).__name__이 'DeepLabV3' 이어야 합니다.
- id: preprocess_seg
  title: 2단계. 입력 전처리
  structuredPrimary: true
  subtitle: weights.transforms()
  goal: 권장 전처리로 입력 텐서를 만들고 배치 차원을 추가합니다.
  why: 세그멘테이션 모델은 normalize까지 포함된 전처리가 필요합니다.
  explanation: |-
    \`segWeights.transforms()\` 가 권장 전처리입니다. 보통 resize와 normalize가 포함됩니다.

    이 권장 전처리는 PIL Image 또는 텐서만 받습니다. \`load_sample_image\` 는 numpy 배열을 주므로 \`Image.fromarray\` 로 PIL Image로 바꿔 넣습니다.

    배치 차원을 추가해 (1, 3, H, W) 형식으로 만들어야 모델에 넘길 수 있습니다.
  tips:
  - 입력 크기를 너무 크게 두면 CPU 추론이 매우 느려집니다. 권장 transforms가 합리적인 크기로 줄여 줍니다.
  - 권장 transforms는 numpy 배열을 거부하므로 Image.fromarray로 PIL Image로 변환해 넣습니다.
  snippet: |-
    from PIL import Image

    china = load_sample_image('china.jpg')
    segPreprocess = segWeights.transforms()
    inputBatch = segPreprocess(Image.fromarray(china)).unsqueeze(0)
    inputBatch.shape
  exercise:
    prompt: flower 이미지에도 같은 전처리를 적용하세요.
    starterCode: |-
      flower = load_sample_image('flower.jpg')
      flowerBatch = segPreprocess(Image.fromarray(flower)).unsqueeze(___)
      flowerBatch.shape
    hints:
    - 빈칸은 정수 0입니다.
    - 결과는 (1, 3, H, W) 모양입니다.
  check:
    noError: 전처리가 오류 없이 끝나야 합니다.
    resultCheck: inputBatch.shape의 첫 차원이 1이어야 합니다.
- id: inference
  title: 3단계. 추론
  structuredPrimary: true
  subtitle: dict 출력의 'out' 키
  goal: 모델을 호출해 segmentation logits을 얻습니다.
  why: segmentation 모델의 출력 형식을 정확히 이해해야 다음 단계가 가능합니다.
  explanation: |-
    \`segModel(inputBatch)\` 의 결과는 dict로 \`out\` 키가 logits 텐서입니다. shape는 (1, 21, H, W) 입니다. 21은 클래스 수, H와 W는 입력 크기와 같습니다.

    auxiliary loss 출력 등 추가 키가 있을 수 있지만 추론에는 사용하지 않습니다.
  tips:
  - 세그 모델은 분류와 달리 보조 출력이 있는 경우가 많습니다. dict 키 구조를 확인해 두세요.
  snippet: |-
    with torch.inference_mode():
        chinaOut = segModel(inputBatch)
    type(chinaOut), list(chinaOut.keys()), chinaOut['out'].shape
  exercise:
    prompt: flower 이미지에도 같은 추론을 적용하세요.
    starterCode: |-
      with torch.inference_mode():
          flowerOut = segModel(___)
      flowerOut['out'].shape
    hints:
    - 빈칸은 flowerBatch 변수입니다.
    - 결과 shape의 첫 두 차원은 (1, 21) 입니다.
  check:
    noError: 추론 호출이 오류 없이 끝나야 합니다.
    resultCheck: chinaOut['out'].shape의 두 번째 차원이 21이어야 합니다.
- id: argmax
  title: 4단계. 픽셀별 클래스
  structuredPrimary: true
  subtitle: argmax로 라벨 맵
  goal: 픽셀별로 가장 확률 높은 클래스를 골라 라벨 맵을 만듭니다.
  why: logits 자체는 시각화할 수 없으므로 argmax로 한 채널 결과로 만듭니다.
  explanation: |-
    \`chinaOut['out'].argmax(dim=1)\` 가 라벨 맵을 만드는 한 줄입니다. 결과 shape는 (1, H, W) 이고 값은 0~20 사이 정수입니다.

    각 정수가 segCategories의 인덱스와 일치합니다. 0은 보통 배경입니다.
  tips:
  - argmax는 채널(차원 1)을 따라 가장 큰 값의 인덱스를 반환합니다.
  snippet: |-
    chinaLabelMap = chinaOut['out'].argmax(dim=1).squeeze(0)
    chinaLabelMap.shape, int(chinaLabelMap.min()), int(chinaLabelMap.max())
  exercise:
    prompt: flower 이미지의 라벨 맵 flowerLabelMap을 만들고 등장한 클래스 인덱스의 유일값들을 출력하세요.
    starterCode: |-
      flowerLabelMap = flowerOut['out'].argmax(dim=___).squeeze(0)
      flowerUnique = torch.unique(flowerLabelMap).tolist()
      flowerUnique
    hints:
    - argmax의 dim은 1입니다.
    - 결과는 등장한 클래스 인덱스 리스트입니다.
  check:
    noError: argmax가 오류 없이 끝나야 합니다.
    resultCheck: chinaLabelMap.ndim이 2여야 합니다.
- id: overlay
  title: 5단계. 마스크 오버레이
  structuredPrimary: true
  subtitle: 컬러맵 + alpha 합성
  goal: 원본 위에 반투명 라벨 맵을 합성해 시각화합니다.
  why: 마스크 자체보다 원본 위에 겹쳐 보면 어떤 영역이 어떤 클래스인지 즉시 알 수 있습니다.
  explanation: |-
    matplotlib의 imshow에 cmap='tab20' 같은 컬러맵을 주면 정수 라벨 맵을 색으로 변환합니다. alpha=0.5 옵션으로 반투명하게 합성하면 됩니다.

    같은 axis에 imshow를 두 번 호출해 원본 + 마스크를 겹쳐 그립니다. 단, 마스크의 크기가 원본과 일치해야 정확히 겹칩니다.
  tips:
  - 마스크 크기가 원본과 다르면 imshow의 extent 옵션 또는 resize가 필요합니다.
  snippet: |-
    chinaResized = china[:chinaLabelMap.shape[0], :chinaLabelMap.shape[1]]
    fig, axes = plt.subplots(1, 2, figsize=(11, 5))
    axes[0].imshow(chinaResized)
    axes[0].set_title('china')
    axes[0].axis('off')
    axes[1].imshow(chinaResized)
    axes[1].imshow(chinaLabelMap.numpy(), cmap='tab20', alpha=0.5)
    axes[1].set_title('overlay')
    axes[1].axis('off')
    fig
  exercise:
    prompt: flower 이미지에도 같은 오버레이를 적용하세요.
    starterCode: |-
      flowerResized = flower[:flowerLabelMap.shape[0], :flowerLabelMap.shape[1]]
      fig2, axes2 = plt.subplots(1, 2, figsize=(11, 5))
      axes2[0].imshow(flowerResized)
      axes2[0].axis('off')
      axes2[1].imshow(flowerResized)
      axes2[1].imshow(flowerLabelMap.numpy(), cmap='tab20', alpha=___)
      axes2[1].axis('off')
      fig2
    hints:
    - 빈칸은 부동소수 0.5 입니다.
    - 결과에서 객체 영역이 컬러로 칠해져야 합니다.
  check:
    noError: 오버레이 시각화가 오류 없이 끝나야 합니다.
    resultCheck: chinaLabelMap의 shape이 chinaResized의 shape 첫 두 차원과 같아야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 클래스별 마스크 분리
  goal: 라벨 맵에서 특정 클래스만 골라 따로 시각화합니다.
  why: 특정 객체 마스크만 다루어야 하는 응용(인물 추출, 배경 제거 등) 의 출발점이 됩니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - "원본 - 배경 = 객체 마스크 추출이 이 패턴의 자연스러운 응용입니다."
  snippet: |-
    segCategories = segWeights.meta['categories']
    uniqueLabels = torch.unique(chinaLabelMap).tolist()
    summary = {idx: segCategories[idx] for idx in uniqueLabels}
    summary
  exercise:
    prompt: "미션1: 라벨 맵에서 배경(0) 이 아닌 클래스만 흰색으로 표시한 foregroundMask를 시각화하세요. 미션2: 등장한 클래스별 픽셀 개수를 막대 그래프로 표시하세요."
    starterCode: |-
      foregroundMask = (chinaLabelMap != 0).numpy().astype(np.uint8) * 255
      fig = plt.figure(figsize=(5, 4))
      plt.imshow(foregroundMask, cmap='gray')
      plt.axis('off')
      fig
    hints:
    - 배경 인덱스는 보통 0입니다.
    - "클래스별 픽셀 개수는 torch.bincount(chinaLabelMap.flatten()) 한 줄입니다."
  check:
    noError: 클래스 분리가 오류 없이 끝나야 합니다.
    resultCheck: foregroundMask가 (높이, 너비) shape의 uint8 배열이어야 합니다.
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
  - id: deepVision_06-segmentation-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - load_seg
    - practice
    title: 세그멘테이션 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: class count·output stride·mask threshold·ignore index 계약을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_segmentation_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_segmentation_contract(value):
            raise NotImplementedError
      solution: |
        def audit_segmentation_contract(value):
            required = ['classCount', 'outputStride', 'maskThreshold', 'ignoreIndex']
            rules = [{'id': 'classes', 'field': 'classCount', 'kind': 'range', 'min': 2, 'max': 10000}, {'id': 'stride', 'field': 'outputStride', 'kind': 'divisible', 'value': 4}, {'id': 'threshold', 'field': 'maskThreshold', 'kind': 'unit-interval'}, {'id': 'ignore', 'field': 'ignoreIndex', 'kind': 'range', 'min': -1, 'max': 65535}]
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
            return {"accepted": not missing and not violations, "topic": 'segmentation', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.deep-vision.deepVision_06.segmentation-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_06.segmentation-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_segmentation_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              classCount: 21
              outputStride: 16
              maskThreshold: 0.5
              ignoreIndex: 255
          expectedReturn:
            accepted: true
            topic: segmentation
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              outputStride: 16
              maskThreshold: 0.5
              ignoreIndex: 255
          expectedReturn:
            accepted: false
            topic: segmentation
            missing:
            - classCount
            violations:
            - classes
        - id: reports-topic-invariants
          arguments:
          - value:
              classCount: 1
              outputStride: 10
              maskThreshold: 2
              ignoreIndex: -2
          expectedReturn:
            accepted: false
            topic: segmentation
            missing: []
            violations:
            - classes
            - ignore
            - stride
            - threshold
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: deepVision_06-segmentation-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_06-segmentation-contract-audit-mastery
    title: 세그멘테이션 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_segmentation_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_segmentation_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_segmentation_result(expected, observed):
            identity = ['sourceHash', 'modelHash', 'classMapHash']
            metrics = {'foregroundRatio': 0.01}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'segmentation', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.deep-vision.deepVision_06.segmentation-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_06.segmentation-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_segmentation_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: seg1
              modelHash: deeplab-a
              classMapHash: voc-21
              foregroundRatio: 0.34
          - value:
              sourceHash: seg1
              modelHash: deeplab-a
              classMapHash: voc-21
              foregroundRatio: 0.345
          expectedReturn:
            passed: true
            topic: segmentation
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: seg1
              modelHash: deeplab-a
              classMapHash: voc-21
              foregroundRatio: 0.34
          - value:
              sourceHash: seg2
              modelHash: other
              classMapHash: city
              foregroundRatio: 0.8
          expectedReturn:
            passed: false
            topic: segmentation
            missing: []
            identityMismatch:
            - classMapHash
            - modelHash
            - sourceHash
            metricDrift:
            - foregroundRatio
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: seg1
              modelHash: deeplab-a
              classMapHash: voc-21
              foregroundRatio: 0.34
          - value: {}
          expectedReturn:
            passed: false
            topic: segmentation
            missing:
            - classMapHash
            - foregroundRatio
            - modelHash
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: deepVision_06-segmentation-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_06-segmentation-result-reconciliation-transfer
    title: 세그멘테이션 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_segmentation_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_segmentation_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_segmentation_evidence(stage):
            stages = {'source': {'action': 'validate segmentation source and model', 'evidence': 'image model class map', 'risk': 'model-input mismatch'}, 'inference': {'action': 'run bounded segmentation inference', 'evidence': 'logit upsample threshold trace', 'risk': 'nondeterministic or unsafe inference'}, 'result': {'action': 'reconcile segmentation output', 'evidence': 'mask shape labels and coverage', 'risk': 'confident wrong prediction'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.deep-vision.deepVision_06.segmentation-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_06.segmentation-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_segmentation_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate segmentation source and model
            evidence: image model class map
            risk: model-input mismatch
        - id: recalls-inference
          arguments:
          - value: inference
          expectedReturn:
            action: run bounded segmentation inference
            evidence: logit upsample threshold trace
            risk: nondeterministic or unsafe inference
        - id: recalls-result
          arguments:
          - value: result
          expectedReturn:
            action: reconcile segmentation output
            evidence: mask shape labels and coverage
            risk: confident wrong prediction
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};