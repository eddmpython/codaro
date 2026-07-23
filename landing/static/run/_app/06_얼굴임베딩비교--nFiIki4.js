var e=`meta:
  id: visionApps_06
  title: 얼굴 임베딩과 동일인 판별
  order: 6
  category: visionApps
  difficulty: ⭐⭐⭐⭐
  badge: 중급
  packages:
  - matplotlib
  - numpy
  - opencv-python
  - pillow
  - torch
  - torchvision
  - scikit-learn
  tags:
  - 얼굴임베딩
  - 동일인판별
  - 임베딩
  - 응용
  seo:
    title: 비전 응용 - 얼굴 임베딩과 동일인 판별
    description: 사전학습 ResNet 임베딩으로 두 사진 속 객체가 같은지 판별합니다.
    keywords:
    - 얼굴임베딩
    - 동일인
    - 임베딩
    - 유사도
intro:
  emoji: 🙇
  goal: 두 사진에서 추출한 임베딩의 코사인 유사도로 같은 객체인지 판별합니다.
  description: |-
    face_recognition 같은 전용 라이브러리는 dlib 의존성이 까다롭습니다. 이 강의는 deepVision 트랙에서 학습한 ResNet 임베딩(일반 사진용) 으로 "같은 사진인가/같은 객체인가" 를 판별하는 응용 패턴을 만듭니다. 얼굴 특화 모델은 아니지만 작은 라이브러리에서는 충분히 동작합니다.
  direction: 두 사진을 같은 인코더에 통과시키고 코사인 유사도와 임곗값으로 동일 객체 판별을 구현합니다.
  benefits:
  - 임베딩 + 임곗값으로 단순한 동일성 판별기를 만들 수 있습니다.
  - 변형(밝기, 회전) 후에도 임베딩이 비슷한지 확인합니다.
  - 임곗값에 따른 정확도-재현율 트레이드오프를 체험합니다.
  diagram:
    steps:
    - label: 1단계. 인코더 준비
      detail: deepVision 3강과 같은 ResNet18 임베딩.
    - label: 2단계. 사진 쌍 만들기
      detail: 같은 사진 변형 + 다른 사진.
    - label: 3단계. 코사인 유사도 함수
      detail: 두 사진 → 단일 점수.
    - label: 4단계. 임곗값 판별
      detail: 0.85 기준 동일/아님 판별.
    - label: 5단계. 다중 쌍 평가
      detail: 표로 정리.
    runtime:
    - label: 비전 환경
      detail: torchvision + numpy + matplotlib.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: encoder
  title: 1단계. 인코더 준비
  structuredPrimary: true
  subtitle: deepVision 3강 임베딩 재사용
  goal: ResNet18 + 분류층 제거로 임베딩 추출기를 만듭니다.
  why: 동일성 판별의 출발은 좋은 임베딩입니다.
  explanation: |-
    deepVision 3강과 같은 패턴입니다. \`nn.Sequential(*list(model.children())[:-1])\` 로 분류층을 제외한 인코더를 만듭니다.

    preprocess는 ResNet18 권장 transforms를 그대로 사용합니다. 이 transforms는 PIL Image를 입력으로 받으므로, numpy 배열 이미지는 \`Image.fromarray(...)\` 로 감싸서 넘깁니다.
  tips:
  - 얼굴 특화 임베딩이 필요하면 facenet-pytorch 같은 별도 패키지를 쓰는 것이 표준입니다. 학습용으로는 일반 임베딩으로 흐름만 익힙니다.
  - load_sample_image는 numpy 배열을 돌려줍니다. preprocess에 넣기 전 \`Image.fromarray(...)\` 로 PIL Image로 변환해야 합니다.
  snippet: |-
    import torch
    import torchvision
    import torch.nn as nn
    import torch.nn.functional as F
    from torchvision.models import resnet18, ResNet18_Weights
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.datasets import load_sample_image
    from PIL import Image
    import cv2

    weights = ResNet18_Weights.DEFAULT
    model = resnet18(weights=weights).eval()
    encoder = nn.Sequential(*list(model.children())[:-1]).eval()
    preprocess = weights.transforms()
    type(encoder).__name__
  exercise:
    prompt: 임베딩 차원이 512인지 확인하세요(china 한 장으로).
    starterCode: |-
      china = load_sample_image('china.jpg')
      with torch.inference_mode():
          feat = encoder(preprocess(Image.fromarray(china)).unsqueeze(0)).flatten(1)
      feat.shape[___]
    hints:
    - 빈칸은 정수 1입니다(두 번째 차원).
    - 결과는 512 입니다.
  check:
    noError: 인코더 준비가 오류 없이 끝나야 합니다.
    resultCheck: type(encoder).__name__이 'Sequential' 이어야 합니다.
- id: pairs
  title: 2단계. 사진 쌍 만들기
  structuredPrimary: true
  subtitle: 같은 / 다른 사진
  goal: 같은 사진의 두 변형과 다른 사진을 모아 쌍을 만듭니다.
  why: 판별기를 평가하려면 같은 쌍과 다른 쌍 모두 필요합니다.
  explanation: |-
    china의 두 변형(밝기 조정), china와 flower 한 쌍을 만듭니다. 같은 쌍은 유사도가 높아야 하고 다른 쌍은 낮아야 합니다.
  tips:
  - 변형이 너무 강하면 같은 쌍도 다르게 인식됩니다. 변형 강도를 조절하면서 임베딩의 강건성을 시험합니다.
  snippet: |-
    china = load_sample_image('china.jpg')
    flower = load_sample_image('flower.jpg')
    chinaBright = (china.astype(np.float32) * 1.1 + 5).clip(0, 255).astype(np.uint8)
    chinaDim = (china.astype(np.float32) * 0.7).clip(0, 255).astype(np.uint8)
    samePair = (chinaBright, chinaDim)
    diffPair = (china, flower)
    samePair[0].shape, diffPair[0].shape
  exercise:
    prompt: 같은 쌍과 다른 쌍을 1x4 그리드로 비교 시각화하세요.
    starterCode: |-
      fig, axes = plt.subplots(1, 4, figsize=(14, 4))
      for axis, (label, img) in zip(axes, [
          ('same A', samePair[0]),
          ('same B', samePair[1]),
          ('diff A', diffPair[0]),
          ('diff B', diffPair[1]),
      ]):
          axis.imshow(img)
          axis.set_title(label)
          axis.axis('___')
      fig
    hints:
    - 빈칸은 'off' 입니다.
    - 네 사진이 모두 화면에 보여야 합니다.
  check:
    noError: 사진 쌍 만들기가 오류 없이 끝나야 합니다.
    resultCheck: samePair와 diffPair 모두 두 이미지의 튜플이어야 합니다.
- id: similarity_fn
  title: 3단계. 코사인 유사도 함수
  structuredPrimary: true
  subtitle: 두 사진 → 단일 점수
  goal: 두 이미지를 입력으로 받아 코사인 유사도 점수를 돌려주는 함수를 만듭니다.
  why: 함수로 묶어야 다양한 쌍에 일관되게 적용할 수 있습니다.
  explanation: |-
    함수 내부에서 각 사진을 \`Image.fromarray\` → preprocess → encoder → flatten → normalize 한 뒤 내적을 계산합니다. preprocess는 PIL Image를 받으므로 numpy 이미지는 먼저 변환합니다. L2 정규화한 두 벡터의 내적이 코사인 유사도입니다.
  tips:
  - 함수 호출 횟수가 많으면 미리 임베딩을 계산해 캐싱하는 것이 효율적입니다.
  snippet: |-
    from PIL import Image

    def cosine(imgA, imgB):
        with torch.inference_mode():
            ea = F.normalize(encoder(preprocess(Image.fromarray(imgA)).unsqueeze(0)).flatten(1), dim=1)
            eb = F.normalize(encoder(preprocess(Image.fromarray(imgB)).unsqueeze(0)).flatten(1), dim=1)
        return float((ea * eb).sum())

    sameScore = cosine(*samePair)
    diffScore = cosine(*diffPair)
    sameScore, diffScore
  exercise:
    prompt: 자기 자신과의 유사도(china, china) 가 1에 가까운지 확인하세요.
    starterCode: |-
      selfScore = cosine(china, ___)
      selfScore
    hints:
    - 빈칸은 china 변수입니다.
    - 자기 자신과는 1에 매우 가까워야 합니다.
  check:
    noError: 함수 호출이 오류 없이 끝나야 합니다.
    resultCheck: sameScore가 diffScore보다 커야 합니다.
- id: threshold
  title: 4단계. 임곗값 판별
  structuredPrimary: true
  subtitle: 0.85 기준
  goal: 임곗값을 두고 두 사진이 같은지 다른지 자동 판별합니다.
  why: 판별기는 임곗값 비교 한 줄로 결정합니다.
  explanation: |-
    \`cosine(a, b) > 0.85\` 이면 같음, 그렇지 않으면 다름으로 판정합니다. 임곗값은 데이터셋과 응용에 따라 다릅니다.

    같은 쌍의 점수는 임곗값 이상, 다른 쌍의 점수는 임곗값 미만이어야 정확한 판별기입니다.
  tips:
  - 임곗값이 너무 높으면 같은 쌍을 놓치고 너무 낮으면 다른 쌍을 같다고 판정합니다.
  snippet: |-
    def isSame(imgA, imgB, threshold=0.85):
        return cosine(imgA, imgB) > threshold

    isSame(*samePair), isSame(*diffPair)
  exercise:
    prompt: 임곗값 0.7로 다시 판별해 결과가 달라지는지 확인하세요.
    starterCode: |-
      isSame(*samePair, threshold=___), isSame(*diffPair, threshold=0.7)
    hints:
    - 빈칸은 부동소수 0.7 입니다.
    - 낮은 임곗값에서 더 관대한 판별이 됩니다.
  check:
    noError: 판별기 호출이 오류 없이 끝나야 합니다.
    resultCheck: isSame(samePair[0], samePair[1]) 가 True여야 합니다.
- id: multi_eval
  title: 5단계. 다중 쌍 평가
  structuredPrimary: true
  subtitle: 표 정리
  goal: 여러 쌍에 함수를 일괄 적용해 결과를 표로 정리합니다.
  why: 한 번의 평가 결과만으로는 임곗값을 정할 수 없습니다.
  explanation: |-
    여러 same 쌍과 여러 diff 쌍을 만들어 모두 점수를 계산하고, 임곗값에 따른 분류 결과를 표로 보여 줍니다.
  tips:
  - 같은 쌍은 변형을 다양하게 두고, 다른 쌍은 카테고리를 분명히 다르게 두어야 평가가 의미 있습니다.
  snippet: |-
    pairs = [
        ('same1', china, chinaBright, 1),
        ('same2', china, chinaDim, 1),
        ('diff1', china, flower, 0),
        ('diff2', chinaBright, flower, 0),
    ]
    report = []
    for name, a, b, label in pairs:
        score = cosine(a, b)
        report.append({"pair": name, "score": round(score, 3), "expected": label, "pred": int(score > 0.85)})
    report
  exercise:
    prompt: report에서 예측이 expected와 일치한 비율(정확도) 을 계산하세요.
    starterCode: |-
      correct = sum(1 for r in report if r['pred'] == r['___'])
      accuracy = correct / len(report)
      accuracy
    hints:
    - 빈칸은 'expected' 입니다.
    - 합성 쌍에서 정확도가 75% 이상이면 무난합니다.
  check:
    noError: 다중 평가가 오류 없이 끝나야 합니다.
    resultCheck: len(report) 가 4여야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 임곗값 스윕
  goal: 여러 임곗값에 대해 정확도를 측정해 가장 좋은 값을 찾습니다.
  why: 임곗값 선택은 응용 성공의 핵심 결정 중 하나입니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 임곗값 스윕은 ROC 곡선의 단순 버전입니다.
  snippet: |-
    thresholds = [0.6, 0.7, 0.8, 0.85, 0.9, 0.95]
    accuracies = []
    for thr in thresholds:
        hits = sum(1 for r in report if int(r['score'] > thr) == r['expected'])
        accuracies.append(hits / len(report))
    list(zip(thresholds, accuracies))
  exercise:
    prompt: "미션1: 임곗값 vs 정확도를 라인 차트로 그리세요. 미션2: 최고 정확도를 만드는 임곗값을 출력하세요."
    starterCode: |-
      fig = plt.figure(figsize=(6, 3))
      plt.plot(thresholds, accuracies, marker='o')
      plt.xlabel('threshold')
      plt.ylabel('___')
      fig
    hints:
    - 빈칸은 'accuracy' 입니다.
    - 라인이 한 점에서 꺾이는 모양이 자연스럽습니다.
  check:
    noError: 스윕이 오류 없이 끝나야 합니다.
    resultCheck: len(accuracies) 가 6 이어야 합니다.
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
  - id: visionApps_06-face_embedding-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - encoder
    - practice
    title: 얼굴 임베딩 비교 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 동의·dimension·metric·match threshold 계약을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_face_embedding_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_face_embedding_contract(value):
            raise NotImplementedError
      solution: |
        def audit_face_embedding_contract(value):
            required = ['consent', 'dimension', 'metric', 'matchThreshold']
            rules = [{'id': 'consent', 'field': 'consent', 'kind': 'enum', 'values': ['explicit-comparison']}, {'id': 'dimension', 'field': 'dimension', 'kind': 'range', 'min': 1, 'max': 100000}, {'id': 'metric', 'field': 'metric', 'kind': 'enum', 'values': ['cosine', 'l2']}, {'id': 'threshold', 'field': 'matchThreshold', 'kind': 'unit-interval'}]
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
            return {"accepted": not missing and not violations, "topic": 'face_embedding', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.vision-apps.visionApps_06.face_embedding-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_06.face_embedding-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_face_embedding_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              consent: explicit-comparison
              dimension: 512
              metric: cosine
              matchThreshold: 0.75
          expectedReturn:
            accepted: true
            topic: face_embedding
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              dimension: 512
              metric: cosine
              matchThreshold: 0.75
          expectedReturn:
            accepted: false
            topic: face_embedding
            missing:
            - consent
            violations:
            - consent
        - id: reports-topic-invariants
          arguments:
          - value:
              consent: scrape
              dimension: 0
              metric: name
              matchThreshold: 2
          expectedReturn:
            accepted: false
            topic: face_embedding
            missing: []
            violations:
            - consent
            - dimension
            - metric
            - threshold
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: visionApps_06-face_embedding-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionApps_06-face_embedding-contract-audit-mastery
    title: 얼굴 임베딩 비교 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_face_embedding_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_face_embedding_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_face_embedding_result(expected, observed):
            identity = ['leftSourceHash', 'rightSourceHash', 'modelHash']
            metrics = {'similarity': 0.01}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'face_embedding', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.vision-apps.visionApps_06.face_embedding-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_06.face_embedding-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_face_embedding_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              leftSourceHash: fl
              rightSourceHash: fr
              modelHash: face-a
              similarity: 0.81
          - value:
              leftSourceHash: fl
              rightSourceHash: fr
              modelHash: face-a
              similarity: 0.815
          expectedReturn:
            passed: true
            topic: face_embedding
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              leftSourceHash: fl
              rightSourceHash: fr
              modelHash: face-a
              similarity: 0.81
          - value:
              leftSourceHash: x
              rightSourceHash: fr
              modelHash: other
              similarity: 0.4
          expectedReturn:
            passed: false
            topic: face_embedding
            missing: []
            identityMismatch:
            - leftSourceHash
            - modelHash
            metricDrift:
            - similarity
        - id: reports-missing-result-fields
          arguments:
          - value:
              leftSourceHash: fl
              rightSourceHash: fr
              modelHash: face-a
              similarity: 0.81
          - value: {}
          expectedReturn:
            passed: false
            topic: face_embedding
            missing:
            - leftSourceHash
            - modelHash
            - rightSourceHash
            - similarity
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: visionApps_06-face_embedding-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionApps_06-face_embedding-result-reconciliation-transfer
    title: 얼굴 임베딩 비교 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_face_embedding_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_face_embedding_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_face_embedding_evidence(stage):
            stages = {'admission': {'action': 'admit face comparison input safely', 'evidence': 'explicit consent and pair identity', 'risk': 'privacy or source error'}, 'process': {'action': 'run bounded face comparison workflow', 'evidence': 'aligned embedding trace', 'risk': 'unbounded or wrong transformation'}, 'release': {'action': 'release verified face comparison result', 'evidence': 'similarity with no raw vector log', 'risk': 'wrong or sensitive output'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.vision-apps.visionApps_06.face_embedding-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_06.face_embedding-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_face_embedding_evidence
        cases:
        - id: recalls-admission
          arguments:
          - value: admission
          expectedReturn:
            action: admit face comparison input safely
            evidence: explicit consent and pair identity
            risk: privacy or source error
        - id: recalls-process
          arguments:
          - value: process
          expectedReturn:
            action: run bounded face comparison workflow
            evidence: aligned embedding trace
            risk: unbounded or wrong transformation
        - id: recalls-release
          arguments:
          - value: release
          expectedReturn:
            action: release verified face comparison result
            evidence: similarity with no raw vector log
            risk: wrong or sensitive output
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};