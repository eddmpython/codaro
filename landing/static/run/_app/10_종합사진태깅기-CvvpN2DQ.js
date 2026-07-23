var e=`meta:
  id: deepVision_10
  title: 종합 - 사진 자동 태깅기
  order: 10
  category: deepVision
  difficulty: ⭐⭐⭐⭐
  badge: 심화
  packages:
  - matplotlib
  - numpy
  - pillow
  - scikit-learn
  - torch
  - torchvision
  tags:
  - torchvision
  - 종합프로젝트
  - 분류
  - 객체탐지
  - 세그멘테이션
  seo:
    title: 딥러닝 비전 - 종합 사진 자동 태깅기
    description: 분류, 객체 탐지, 세그멘테이션 세 모델을 한 사진에 모두 적용해 자동 태그 보고서를 만듭니다.
    keywords:
    - 종합프로젝트
    - 분류
    - 객체탐지
    - 세그멘테이션
    - torchvision
intro:
  emoji: 🧪
  goal: 분류·탐지·세그 세 모델을 한 사진에 적용해 자동 태그 보고서 한 장을 만듭니다.
  description: |-
    이 강의는 deepVision 트랙의 마무리입니다. 한 사진에 세 가지 사전학습 모델(ResNet18 분류, Faster R-CNN 탐지, DeepLabV3 세그) 을 모두 적용하고, 결과를 한 figure에 모아 자동 태그 보고서를 생성합니다. 이 결과물은 visionApps 트랙(다음 트랙) 의 자동 사진 분류·정리 응용의 핵심 부품입니다.
  direction: 세 모델을 동시에 호출해 사진 한 장에서 (라벨, 박스 리스트, 세그 마스크) 세 결과를 모은 보고서를 만듭니다.
  benefits:
  - 모델 세 개를 한 함수에 모아 호출하는 패턴을 익힙니다.
  - 결과 dict를 표준화해 다른 응용에서 재사용할 수 있게 합니다.
  - 보고서 figure를 만드는 매트플롯립 레이아웃 패턴을 익힙니다.
  diagram:
    steps:
    - label: 1단계. 세 모델 일괄 로드
      detail: 분류 + 탐지 + 세그.
    - label: 2단계. 분류 결과
      detail: top-1 라벨.
    - label: 3단계. 탐지 결과
      detail: 박스 리스트.
    - label: 4단계. 세그 결과
      detail: 라벨 맵.
    - label: 5단계. 보고서 합치기
      detail: 1x4 figure로.
    runtime:
    - label: PyTorch 환경
      detail: torchvision의 세 모델을 동시에 호출합니다. CPU에서 한 사진당 10~30초 정도.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: load_three
  title: 1단계. 세 모델 일괄 로드
  structuredPrimary: true
  subtitle: 분류 + 탐지 + 세그
  goal: 세 가지 사전학습 모델을 한꺼번에 로드합니다.
  why: 한 사진에 여러 모델을 적용하려면 모든 모델이 미리 준비되어 있어야 합니다.
  explanation: |-
    각 모델 가중치는 첫 호출 시 다운로드됩니다. 모두 합치면 400MB 이상이 됩니다. 캐시가 한 번 만들어진 뒤에는 빠릅니다.

    세 모델 모두 eval 모드로 만듭니다.
  tips:
  - 세 모델을 동시에 메모리에 두면 메모리 사용량이 큽니다. 작업이 끝나면 del로 정리하는 것도 한 방법입니다.
  snippet: |-
    import torch
    import torchvision
    from torchvision.models import resnet18, ResNet18_Weights
    from torchvision.models.detection import fasterrcnn_resnet50_fpn, FasterRCNN_ResNet50_FPN_Weights
    from torchvision.models.segmentation import deeplabv3_resnet50, DeepLabV3_ResNet50_Weights
    import numpy as np
    import matplotlib.pyplot as plt
    from matplotlib.patches import Rectangle
    from sklearn.datasets import load_sample_image

    clsWeights = ResNet18_Weights.DEFAULT
    detWeights = FasterRCNN_ResNet50_FPN_Weights.DEFAULT
    segWeights = DeepLabV3_ResNet50_Weights.DEFAULT
    classifier = resnet18(weights=clsWeights).eval()
    detector = fasterrcnn_resnet50_fpn(weights=detWeights, box_score_thresh=0.5).eval()
    segmenter = deeplabv3_resnet50(weights=segWeights).eval()
    type(classifier).__name__, type(detector).__name__, type(segmenter).__name__
  exercise:
    prompt: 각 모델의 카테고리 리스트 길이를 dict로 출력하세요.
    starterCode: |-
      {
          "cls": len(clsWeights.meta['categories']),
          "det": len(detWeights.meta['categories']),
          "seg": len(___.meta['categories']),
      }
    hints:
    - 빈칸은 segWeights 변수입니다.
    - 세 값이 각각 1000, 91, 21 정도여야 합니다.
  check:
    noError: 세 모델 로드가 오류 없이 끝나야 합니다.
    resultCheck: 세 모델 타입 이름이 각각 다릅니다.
- id: classify
  title: 2단계. 분류 결과
  structuredPrimary: true
  subtitle: top-1 라벨
  goal: 분류 모델로 사진의 top-1 라벨을 얻습니다.
  why: 사진 전체의 카테고리는 다른 결과의 맥락이 됩니다.
  explanation: |-
    \`clsWeights.transforms()\` 로 전처리한 뒤 추론합니다. 이 권장 전처리는 PIL Image나 텐서만 받으므로 numpy 배열은 \`Image.fromarray\` 로 PIL Image로 바꿔 넣습니다. argmax로 top-1 인덱스를 얻고 카테고리 리스트로 라벨화합니다.
  tips:
  - 분류 결과는 사진의 "주요" 객체 한 개입니다. 여러 객체가 있어도 한 라벨만 나옵니다.
  - 분류·세그 권장 transforms는 numpy 배열을 거부하므로 Image.fromarray로 PIL Image로 변환해 넣습니다.
  snippet: |-
    from PIL import Image

    target = load_sample_image('china.jpg')
    clsPreprocess = clsWeights.transforms()
    with torch.inference_mode():
        clsLogits = classifier(clsPreprocess(Image.fromarray(target)).unsqueeze(0))
    clsTopIdx = int(clsLogits.argmax(dim=1))
    clsLabel = clsWeights.meta['categories'][clsTopIdx]
    clsLabel
  exercise:
    prompt: flower 사진에도 같은 분류를 적용하세요.
    starterCode: |-
      from PIL import Image

      flowerImg = load_sample_image('flower.jpg')
      with torch.inference_mode():
          flowerLogits = classifier(clsPreprocess(Image.fromarray(___)).unsqueeze(0))
      flowerLabel = clsWeights.meta['categories'][int(flowerLogits.argmax(dim=1))]
      flowerLabel
    hints:
    - 빈칸은 flowerImg 변수입니다.
    - 결과는 ImageNet 라벨 문자열입니다.
  check:
    noError: 분류 호출이 오류 없이 끝나야 합니다.
    resultCheck: clsLabel이 문자열이어야 합니다.
- id: detect
  title: 3단계. 탐지 결과
  structuredPrimary: true
  subtitle: 박스 리스트
  goal: 탐지 모델로 사진의 객체 박스와 라벨을 얻습니다.
  why: 사진 안의 개별 객체 위치는 분류만으로는 알 수 없습니다.
  explanation: |-
    탐지 모델은 normalize 없이 0~1 float 텐서를 받습니다. 결과 dict의 boxes, scores, labels를 후처리합니다.
  tips:
  - 첫 호출은 워밍업으로 느립니다.
  snippet: |-
    targetTensor = torch.from_numpy(target).permute(2, 0, 1).float() / 255.0
    with torch.inference_mode():
        detResult = detector([targetTensor])[0]
    keepDet = detResult['scores'] > 0.5
    detBoxes = detResult['boxes'][keepDet]
    detLabels = [detWeights.meta['categories'][int(i)] for i in detResult['labels'][keepDet]]
    len(detLabels), detLabels[:5]
  exercise:
    prompt: flower 사진에도 같은 탐지를 적용하세요.
    starterCode: |-
      flowerTensor = torch.from_numpy(flowerImg).permute(2, 0, 1).float() / 255.0
      with torch.inference_mode():
          flowerDet = detector([___])[0]
      flowerKeep = flowerDet['scores'] > 0.5
      flowerBoxes = flowerDet['boxes'][flowerKeep]
      flowerBoxes.shape
    hints:
    - 빈칸은 flowerTensor 변수입니다.
    - flower 사진에는 객체가 없거나 적을 수 있습니다.
  check:
    noError: 탐지 호출이 오류 없이 끝나야 합니다.
    resultCheck: detBoxes.shape의 마지막 차원이 4여야 합니다.
- id: segment
  title: 4단계. 세그 결과
  structuredPrimary: true
  subtitle: 라벨 맵
  goal: 세그 모델로 픽셀별 클래스 라벨 맵을 얻습니다.
  why: 세그는 객체 영역의 정확한 모양을 알려주는 가장 세밀한 정보입니다.
  explanation: |-
    \`segWeights.transforms()\` 가 권장 전처리입니다. 분류와 마찬가지로 numpy 배열은 \`Image.fromarray\` 로 PIL Image로 바꿔 넣습니다. 모델 호출 후 \`out\` 키의 argmax로 라벨 맵을 얻습니다.
  tips:
  - 세그 결과 라벨 맵의 크기가 원본과 다를 수 있습니다. 시각화 시 원본을 같은 크기로 잘라 맞춥니다.
  snippet: |-
    from PIL import Image

    segPreprocess = segWeights.transforms()
    with torch.inference_mode():
        segOut = segmenter(segPreprocess(Image.fromarray(target)).unsqueeze(0))
    segLabelMap = segOut['out'].argmax(dim=1).squeeze(0)
    segLabelMap.shape, int(segLabelMap.max())
  exercise:
    prompt: flower 사진에도 같은 세그를 적용하세요.
    starterCode: |-
      from PIL import Image

      flowerImg = load_sample_image('flower.jpg')
      with torch.inference_mode():
          flowerSegOut = segmenter(segPreprocess(Image.fromarray(flowerImg)).unsqueeze(___))
      flowerSegLabelMap = flowerSegOut['out'].argmax(dim=1).squeeze(0)
      flowerSegLabelMap.shape
    hints:
    - 빈칸은 정수 0입니다.
    - 결과는 (H, W) 라벨 맵입니다.
  check:
    noError: 세그 호출이 오류 없이 끝나야 합니다.
    resultCheck: segLabelMap.ndim이 2여야 합니다.
- id: report
  title: 5단계. 보고서 합치기
  structuredPrimary: true
  subtitle: 1x4 figure
  goal: 분류 + 탐지 + 세그 결과를 한 figure에 모아 보고서를 만듭니다.
  why: 세 결과를 한눈에 보여줘야 사진 한 장의 "전체 의미"가 전달됩니다.
  explanation: |-
    1x3 subplots를 만들어 좌측은 분류 라벨이 적힌 원본, 가운데는 탐지 박스가 그려진 사진, 우측은 세그 오버레이가 들어가게 합니다. 분류 라벨은 figure 제목으로 두면 깔끔합니다.
  tips:
  - 보고서 함수는 입력 사진을 받아 figure를 반환하는 형식이면 다음 트랙에서 그대로 활용할 수 있습니다.
  snippet: |-
    targetResized = target[:segLabelMap.shape[0], :segLabelMap.shape[1]]
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    fig.suptitle(f'Classification: {clsLabel}', fontsize=14)
    axes[0].imshow(target)
    axes[0].set_title('original')
    axes[0].axis('off')
    axes[1].imshow(target)
    for box, name in zip(detBoxes, detLabels):
        x1, y1, x2, y2 = box.tolist()
        axes[1].add_patch(Rectangle((x1, y1), x2 - x1, y2 - y1, edgecolor='lime', facecolor='none', linewidth=2))
        axes[1].text(x1, max(y1 - 5, 0), name, color='black', backgroundcolor='lime', fontsize=8)
    axes[1].set_title('detection')
    axes[1].axis('off')
    axes[2].imshow(targetResized)
    axes[2].imshow(segLabelMap.numpy(), cmap='tab20', alpha=0.5)
    axes[2].set_title('segmentation')
    axes[2].axis('off')
    fig
  exercise:
    prompt: flower 사진에 대해서도 같은 보고서를 만드세요.
    starterCode: |-
      flowerResized = flowerImg[:flowerSegLabelMap.shape[0], :flowerSegLabelMap.shape[1]]
      fig2, axes2 = plt.subplots(1, 3, figsize=(15, 5))
      fig2.suptitle(f'Classification: {flowerLabel}', fontsize=14)
      axes2[0].imshow(flowerImg)
      axes2[0].axis('off')
      axes2[1].imshow(flowerImg)
      for box in flowerBoxes:
          x1, y1, x2, y2 = box.tolist()
          axes2[1].add_patch(Rectangle((x1, y1), x2 - x1, y2 - y1, edgecolor='cyan', facecolor='none', linewidth=2))
      axes2[1].axis('off')
      axes2[2].imshow(flowerResized)
      axes2[2].imshow(flowerSegLabelMap.numpy(), cmap='tab20', alpha=___)
      axes2[2].axis('off')
      fig2
    hints:
    - 빈칸은 부동소수 0.5 입니다.
    - flower 보고서는 탐지 박스가 없거나 적을 수 있습니다.
  check:
    noError: 보고서 시각화가 오류 없이 끝나야 합니다.
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 함수화
  goal: 분류 + 탐지 + 세그를 한 함수로 묶고 dict 결과를 반환합니다.
  why: 함수로 묶어 두면 visionApps 트랙에서 그대로 호출할 수 있습니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 함수 반환을 표준 dict로 두면 후속 응용에서 재사용이 쉽습니다.
  snippet: |-
    from PIL import Image

    flowerImg = load_sample_image('flower.jpg')

    def autoTag(img):
        clsLogitsLocal = classifier(clsPreprocess(Image.fromarray(img)).unsqueeze(0))
        tensorLocal = torch.from_numpy(img).permute(2, 0, 1).float() / 255.0
        detLocal = detector([tensorLocal])[0]
        segLocal = segmenter(segPreprocess(Image.fromarray(img)).unsqueeze(0))
        return {
            "label": clsWeights.meta['categories'][int(clsLogitsLocal.argmax(dim=1))],
            "boxes": [b.tolist() for b in detLocal['boxes'][detLocal['scores'] > 0.5]],
            "labels": [detWeights.meta['categories'][int(i)] for i in detLocal['labels'][detLocal['scores'] > 0.5]],
            "seg_map_shape": tuple(segLocal['out'].argmax(dim=1).squeeze(0).shape),
        }

    with torch.inference_mode():
        chinaTag = autoTag(target)
        flowerTag = autoTag(flowerImg)
    chinaTag, flowerTag
  exercise:
    prompt: "미션1: autoTag 결과를 노출시켜 'label'과 detection 'labels' 의 첫 3개만 출력하세요. 미션2: 두 사진의 결과 dict를 한 dict로 합쳐 출력하세요."
    starterCode: |-
      summary = {
          "china": {"label": chinaTag['label'], "detected": chinaTag['labels'][:3]},
          "flower": {"label": flowerTag['label'], "detected": ___['labels'][:3]},
      }
      summary
    hints:
    - 빈칸은 flowerTag 변수입니다.
    - 결과는 두 사진 비교가 명확히 담긴 dict입니다.
  check:
    noError: 함수 호출이 오류 없이 끝나야 합니다.
    resultCheck: chinaTag와 flowerTag 모두 'label' 키를 가져야 합니다.
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
  - id: deepVision_10-photo_tagger-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - load_three
    - practice
    title: 종합 사진 태깅기 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: pipeline·tag threshold·max tag·privacy policy를 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_photo_tagger_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_photo_tagger_contract(value):
            raise NotImplementedError
      solution: |
        def audit_photo_tagger_contract(value):
            required = ['steps', 'tagThreshold', 'maxTags', 'privacyPolicy']
            rules = [{'id': 'steps', 'field': 'steps', 'kind': 'nonempty'}, {'id': 'threshold', 'field': 'tagThreshold', 'kind': 'unit-interval'}, {'id': 'max-tags', 'field': 'maxTags', 'kind': 'range', 'min': 1, 'max': 1000}, {'id': 'privacy', 'field': 'privacyPolicy', 'kind': 'enum', 'values': ['local-only', 'consented-upload']}]
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
            return {"accepted": not missing and not violations, "topic": 'photo_tagger', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.deep-vision.deepVision_10.photo_tagger-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_10.photo_tagger-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_photo_tagger_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              steps:
              - decode
              - classify
              - detect
              - dedupe
              - write-manifest
              tagThreshold: 0.6
              maxTags: 20
              privacyPolicy: local-only
          expectedReturn:
            accepted: true
            topic: photo_tagger
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              tagThreshold: 0.6
              maxTags: 20
              privacyPolicy: local-only
          expectedReturn:
            accepted: false
            topic: photo_tagger
            missing:
            - steps
            violations:
            - steps
        - id: reports-topic-invariants
          arguments:
          - value:
              steps: []
              tagThreshold: 2
              maxTags: 0
              privacyPolicy: public
          expectedReturn:
            accepted: false
            topic: photo_tagger
            missing: []
            violations:
            - max-tags
            - privacy
            - steps
            - threshold
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: deepVision_10-photo_tagger-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_10-photo_tagger-contract-audit-mastery
    title: 종합 사진 태깅기 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_photo_tagger_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_photo_tagger_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_photo_tagger_result(expected, observed):
            identity = ['sourceHash', 'pipelineHash', 'modelBundleHash']
            metrics = {'tagCount': 1}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'photo_tagger', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.deep-vision.deepVision_10.photo_tagger-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_10.photo_tagger-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_photo_tagger_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: tag1
              pipelineHash: v1
              modelBundleHash: bundle-a
              tagCount: 8
          - value:
              sourceHash: tag1
              pipelineHash: v1
              modelBundleHash: bundle-a
              tagCount: 9
          expectedReturn:
            passed: true
            topic: photo_tagger
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: tag1
              pipelineHash: v1
              modelBundleHash: bundle-a
              tagCount: 8
          - value:
              sourceHash: tag2
              pipelineHash: v2
              modelBundleHash: bundle-b
              tagCount: 50
          expectedReturn:
            passed: false
            topic: photo_tagger
            missing: []
            identityMismatch:
            - modelBundleHash
            - pipelineHash
            - sourceHash
            metricDrift:
            - tagCount
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: tag1
              pipelineHash: v1
              modelBundleHash: bundle-a
              tagCount: 8
          - value: {}
          expectedReturn:
            passed: false
            topic: photo_tagger
            missing:
            - modelBundleHash
            - pipelineHash
            - sourceHash
            - tagCount
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: deepVision_10-photo_tagger-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_10-photo_tagger-result-reconciliation-transfer
    title: 종합 사진 태깅기 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_photo_tagger_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_photo_tagger_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_photo_tagger_evidence(stage):
            stages = {'source': {'action': 'validate photo tagging source and model', 'evidence': 'source model bundle privacy', 'risk': 'model-input mismatch'}, 'inference': {'action': 'run bounded photo tagging inference', 'evidence': 'multi-stage inference ledger', 'risk': 'nondeterministic or unsafe inference'}, 'result': {'action': 'reconcile photo tagging output', 'evidence': 'tag manifest and sampled review', 'risk': 'confident wrong prediction'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.deep-vision.deepVision_10.photo_tagger-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_10.photo_tagger-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_photo_tagger_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate photo tagging source and model
            evidence: source model bundle privacy
            risk: model-input mismatch
        - id: recalls-inference
          arguments:
          - value: inference
          expectedReturn:
            action: run bounded photo tagging inference
            evidence: multi-stage inference ledger
            risk: nondeterministic or unsafe inference
        - id: recalls-result
          arguments:
          - value: result
          expectedReturn:
            action: reconcile photo tagging output
            evidence: tag manifest and sampled review
            risk: confident wrong prediction
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};