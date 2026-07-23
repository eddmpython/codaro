var e=`meta:
  id: deepVision_09
  title: 모델 비교 - 정확도와 속도
  order: 9
  category: deepVision
  difficulty: ⭐⭐⭐
  badge: 기초
  packages:
  - matplotlib
  - numpy
  - pillow
  - scikit-learn
  - torch
  - torchvision
  tags:
  - torchvision
  - 모델비교
  - 정확도
  - 속도
  - 벤치마크
  seo:
    title: 딥러닝 비전 - 모델 비교
    description: ResNet18과 ResNet50의 정확도와 속도를 같은 사진으로 비교합니다.
    keywords:
    - 모델비교
    - 정확도
    - 속도
    - 벤치마크
    - torchvision
intro:
  emoji: ⚖️
  goal: 같은 사진에 두 모델을 적용해 top-1 일치율과 추론 속도를 비교합니다.
  description: |-
    응용에 어떤 모델을 쓸지는 정확도와 속도의 트레이드오프로 결정됩니다. 이 강의는 작은 ResNet18과 큰 ResNet50을 같은 사진에 적용해 두 지표를 직접 측정합니다.
  direction: 두 모델을 같은 이미지에 적용해 top-1 라벨과 추론 시간을 측정해 비교합니다.
  benefits:
  - time.perf_counter로 추론 시간을 측정할 수 있습니다.
  - 두 모델의 top-1 결과를 비교해 일치율을 계산합니다.
  - 표 또는 막대 그래프로 비교 결과를 시각화합니다.
  diagram:
    steps:
    - label: 1단계. 두 모델 로드
      detail: ResNet18과 ResNet50을 모두 사전학습으로 가져옵니다.
    - label: 2단계. 공통 입력 준비
      detail: 같은 사진 두 장을 같은 방식으로 전처리합니다.
    - label: 3단계. 추론 시간 측정
      detail: time.perf_counter로 평균을 잽니다.
    - label: 4단계. top-1 비교
      detail: 두 모델의 결과 라벨이 일치하는지.
    - label: 5단계. 결과 표
      detail: dict 한 줄로 정리.
    runtime:
    - label: PyTorch 환경
      detail: torchvision의 두 ResNet과 time 모듈을 사용합니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: load_models
  title: 1단계. 두 모델 로드
  structuredPrimary: true
  subtitle: ResNet18과 ResNet50
  goal: 두 사전학습 모델을 동시에 로드합니다.
  why: 비교 실험은 두 모델이 동시에 메모리에 있어야 동일 조건에서 측정 가능합니다.
  explanation: |-
    \`resnet18(weights=...)\` 와 \`resnet50(weights=...)\` 두 가지 모델 객체를 만듭니다. 가중치 파일 크기 차이가 크므로 첫 호출 시 시간이 다릅니다(ResNet50이 약 100MB로 더 큼).

    두 모델 모두 eval 모드로 만들어 추론에 통일된 조건을 만듭니다.
  tips:
  - 모델 크기가 차이가 클수록 비교의 의미가 분명해집니다.
  snippet: |-
    import torch
    import torchvision
    import time
    from torchvision.models import resnet18, ResNet18_Weights, resnet50, ResNet50_Weights
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.datasets import load_sample_image

    weights18 = ResNet18_Weights.DEFAULT
    weights50 = ResNet50_Weights.DEFAULT
    model18 = resnet18(weights=weights18)
    model50 = resnet50(weights=weights50)
    model18.eval()
    model50.eval()
    sum(p.numel() for p in model18.parameters()), sum(p.numel() for p in model50.parameters())
  exercise:
    prompt: 두 모델의 카테고리 리스트가 같은지 확인하세요(둘 다 ImageNet 1000).
    starterCode: |-
      cat18 = weights18.meta['categories']
      cat50 = weights50.meta['categories']
      cat18 == ___
    hints:
    - 빈칸은 cat50 변수입니다.
    - 결과는 True여야 합니다.
  check:
    noError: 두 모델 로드가 오류 없이 끝나야 합니다.
    resultCheck: 두 모델 파라미터 수가 모두 0보다 커야 합니다.
- id: shared_input
  title: 2단계. 공통 입력 준비
  structuredPrimary: true
  subtitle: 같은 전처리, 같은 사진
  goal: 두 모델에 같은 입력을 넣어 비교 조건을 통일합니다.
  why: 입력이 다르면 정확도 비교가 무의미합니다.
  explanation: |-
    두 모델의 권장 전처리가 거의 같지만 미세하게 다를 수 있습니다. 비교 실험에서는 한 가지 전처리(보통 ResNet50의 권장)를 두 모델에 모두 적용합니다.

    권장 전처리는 PIL Image나 텐서만 받습니다. \`load_sample_image\` 는 numpy 배열을 주므로 \`Image.fromarray\` 로 PIL Image로 바꿔 넣습니다.

    입력 텐서도 같은 배치로 만들어 비교의 조건을 통일합니다.
  tips:
  - 비교 실험은 입력을 통제하지 않으면 결론이 흔들립니다.
  - 권장 transforms는 numpy 배열을 거부하므로 Image.fromarray로 PIL Image로 변환해 넣습니다.
  snippet: |-
    from PIL import Image

    preprocess = weights50.transforms()
    china = load_sample_image('china.jpg')
    flower = load_sample_image('flower.jpg')
    chinaBatch = preprocess(Image.fromarray(china)).unsqueeze(0)
    flowerBatch = preprocess(Image.fromarray(flower)).unsqueeze(0)
    chinaBatch.shape
  exercise:
    prompt: 두 이미지 텐서의 모양이 같은지 확인하세요.
    starterCode: |-
      chinaBatch.shape == ___.shape
    hints:
    - 빈칸은 flowerBatch 변수입니다.
    - 결과는 True여야 합니다.
  check:
    noError: 전처리가 오류 없이 끝나야 합니다.
    resultCheck: chinaBatch.shape의 첫 차원이 1이어야 합니다.
- id: timing
  title: 3단계. 추론 시간 측정
  structuredPrimary: true
  subtitle: time.perf_counter
  goal: 각 모델로 N회 추론을 반복해 평균 추론 시간을 잽니다.
  why: 한 번의 추론 시간은 측정 노이즈가 큽니다. 여러 번 평균이 신뢰할 만한 지표입니다.
  explanation: |-
    \`time.perf_counter()\` 가 가장 정확한 측정 함수입니다. 첫 추론은 워밍업으로 무시하고 그 이후의 평균을 사용합니다.

    \`torch.inference_mode\` 안에서 측정해야 측정값이 실제 추론과 일치합니다.
  tips:
  - 측정은 5~10회 반복 평균이 적당합니다. 너무 적으면 노이즈가 크고 너무 많으면 학습이 늘어집니다.
  snippet: |-
    def measure(model, batch, repeats=5):
        with torch.inference_mode():
            model(batch)  # warmup
        times = []
        with torch.inference_mode():
            for _ in range(repeats):
                start = time.perf_counter()
                model(batch)
                times.append(time.perf_counter() - start)
        return sum(times) / len(times)

    time18 = measure(model18, chinaBatch)
    time50 = measure(model50, chinaBatch)
    time18, time50
  exercise:
    prompt: flower 사진으로도 같은 측정을 하세요.
    starterCode: |-
      time18Flower = measure(model18, ___)
      time50Flower = measure(model50, flowerBatch)
      time18Flower, time50Flower
    hints:
    - 빈칸은 flowerBatch 변수입니다.
    - 결과는 두 측정값이 비슷한 비율을 보여야 합니다.
  check:
    noError: 측정 함수가 오류 없이 끝나야 합니다.
    resultCheck: time18과 time50이 모두 양수여야 합니다.
- id: top1_compare
  title: 4단계. top-1 비교
  structuredPrimary: true
  subtitle: 두 모델의 라벨 일치
  goal: 두 모델의 top-1 라벨이 같은지 확인합니다.
  why: 일치한다면 두 모델이 같은 결론에 도달한 것이고, 다르면 어느 한쪽이 다른 시선을 보고 있는 것입니다.
  explanation: |-
    두 모델 모두 같은 카테고리 리스트를 사용하므로 인덱스 비교만으로 충분합니다. softmax 없이 argmax만으로 top-1을 얻을 수 있습니다.
  tips:
  - 일치율은 데이터셋 단위로 측정하지만 학습용에서는 두 사진 정도면 충분합니다.
  snippet: |-
    cat18 = weights18.meta['categories']
    cat50 = weights50.meta['categories']
    with torch.inference_mode():
        top18 = int(model18(chinaBatch).argmax(dim=1))
        top50 = int(model50(chinaBatch).argmax(dim=1))
    cat18[top18], cat50[top50], top18 == top50
  exercise:
    prompt: flower 사진에 대해서도 두 모델의 top-1을 비교하세요.
    starterCode: |-
      with torch.inference_mode():
          top18F = int(model18(___).argmax(dim=1))
          top50F = int(model50(flowerBatch).argmax(dim=1))
      cat18[top18F], cat50[top50F]
    hints:
    - 빈칸은 flowerBatch 변수입니다.
    - 두 라벨이 같으면 두 모델이 일치한 것입니다.
  check:
    noError: top-1 비교가 오류 없이 끝나야 합니다.
    resultCheck: top18과 top50이 모두 0 이상 1000 미만 정수여야 합니다.
- id: report
  title: 5단계. 결과 표
  structuredPrimary: true
  subtitle: dict 한 줄
  goal: 두 모델의 측정 결과를 한 dict로 정리해 비교를 명료화합니다.
  why: 결과를 dict 형태로 정리하면 다음 학습에서 결과를 그대로 시각화하거나 저장할 수 있습니다.
  explanation: |-
    측정값과 라벨을 한 dict에 정리합니다. matplotlib bar 그래프로 시각화하면 한눈에 비교가 가능합니다.
  tips:
  - 결과 보고서를 dict로 표준화해 두면 더 많은 모델 비교로 확장하기 쉽습니다.
  snippet: |-
    report = {
        "resnet18": {"time_s": float(time18), "top1": cat18[top18]},
        "resnet50": {"time_s": float(time50), "top1": cat50[top50]},
    }
    report
  exercise:
    prompt: 두 모델의 시간 비교를 막대 그래프로 그리세요.
    starterCode: |-
      fig = plt.figure(figsize=(5, 3))
      plt.bar(['resnet18', 'resnet50'], [time18, ___])
      plt.ylabel('seconds per inference')
      fig
    hints:
    - 빈칸은 time50 변수입니다.
    - 큰 모델의 막대가 더 높게 나와야 정상입니다.
  check:
    noError: 보고서 작성이 오류 없이 끝나야 합니다.
    resultCheck: report에 두 모델 키가 모두 있어야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 일치율 측정
  goal: 두 사진의 두 모델 결과로 일치율을 계산합니다.
  why: 큰 평가의 작은 사례입니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 같은 카테고리를 가진 두 사진이라면 일치율이 100% 일 가능성이 높습니다.
  snippet: |-
    samples = [(chinaBatch, china), (flowerBatch, flower)]
    matches = 0
    for batch, _ in samples:
        with torch.inference_mode():
            a = int(model18(batch).argmax(dim=1))
            b = int(model50(batch).argmax(dim=1))
        if a == b:
            matches += 1
    matches / len(samples)
  exercise:
    prompt: "미션1: 두 모델의 시간 비율(time50 / time18) 을 계산해 출력하세요. 미션2: 같은 사진에 두 모델을 적용한 두 top-3 결과를 dict로 비교 출력하세요."
    starterCode: |-
      ratio = time50 / time18
      ratio
    hints:
    - 비율은 보통 2~4 사이입니다.
    - top-3는 logits.topk(3) 한 줄입니다.
  check:
    noError: 일치율 계산이 오류 없이 끝나야 합니다.
    resultCheck: matches가 0 이상 len(samples) 이하 정수여야 합니다.
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
  - id: deepVision_09-model_comparison-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - load_models
    - practice
    title: 모델 비교 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 동일 dataset·metric·candidate set·budget 계약을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_model_comparison_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_model_comparison_contract(value):
            raise NotImplementedError
      solution: |
        def audit_model_comparison_contract(value):
            required = ['candidates', 'datasetHash', 'metric', 'latencyBudgetMs']
            rules = [{'id': 'candidates', 'field': 'candidates', 'kind': 'nonempty'}, {'id': 'dataset', 'field': 'datasetHash', 'kind': 'nonempty'}, {'id': 'metric', 'field': 'metric', 'kind': 'enum', 'values': ['accuracy', 'f1', 'map', 'iou']}, {'id': 'latency', 'field': 'latencyBudgetMs', 'kind': 'positive'}]
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
            return {"accepted": not missing and not violations, "topic": 'model_comparison', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.deep-vision.deepVision_09.model_comparison-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_09.model_comparison-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_model_comparison_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              candidates:
              - resnet18
              - mobilenet-v3
              datasetHash: holdout-a
              metric: f1
              latencyBudgetMs: 50
          expectedReturn:
            accepted: true
            topic: model_comparison
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              datasetHash: holdout-a
              metric: f1
              latencyBudgetMs: 50
          expectedReturn:
            accepted: false
            topic: model_comparison
            missing:
            - candidates
            violations:
            - candidates
        - id: reports-topic-invariants
          arguments:
          - value:
              candidates: []
              datasetHash: ''
              metric: pretty
              latencyBudgetMs: 0
          expectedReturn:
            accepted: false
            topic: model_comparison
            missing: []
            violations:
            - candidates
            - dataset
            - latency
            - metric
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: deepVision_09-model_comparison-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_09-model_comparison-contract-audit-mastery
    title: 모델 비교 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_model_comparison_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_model_comparison_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_model_comparison_result(expected, observed):
            identity = ['datasetHash', 'benchmarkHash']
            metrics = {'bestScore': 0.001}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'model_comparison', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.deep-vision.deepVision_09.model_comparison-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_09.model_comparison-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_model_comparison_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              datasetHash: holdout-a
              benchmarkHash: bench-v1
              bestScore: 0.91
          - value:
              datasetHash: holdout-a
              benchmarkHash: bench-v1
              bestScore: 0.9105
          expectedReturn:
            passed: true
            topic: model_comparison
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              datasetHash: holdout-a
              benchmarkHash: bench-v1
              bestScore: 0.91
          - value:
              datasetHash: train
              benchmarkHash: bench-v2
              bestScore: 0.99
          expectedReturn:
            passed: false
            topic: model_comparison
            missing: []
            identityMismatch:
            - benchmarkHash
            - datasetHash
            metricDrift:
            - bestScore
        - id: reports-missing-result-fields
          arguments:
          - value:
              datasetHash: holdout-a
              benchmarkHash: bench-v1
              bestScore: 0.91
          - value: {}
          expectedReturn:
            passed: false
            topic: model_comparison
            missing:
            - benchmarkHash
            - bestScore
            - datasetHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: deepVision_09-model_comparison-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_09-model_comparison-result-reconciliation-transfer
    title: 모델 비교 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_model_comparison_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_model_comparison_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_model_comparison_evidence(stage):
            stages = {'source': {'action': 'validate model comparison source and model', 'evidence': 'fixed holdout and candidates', 'risk': 'model-input mismatch'}, 'inference': {'action': 'run bounded model comparison inference', 'evidence': 'warmup latency metric ledger', 'risk': 'nondeterministic or unsafe inference'}, 'result': {'action': 'reconcile model comparison output', 'evidence': 'score-latency tradeoff report', 'risk': 'confident wrong prediction'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.deep-vision.deepVision_09.model_comparison-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_09.model_comparison-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_model_comparison_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate model comparison source and model
            evidence: fixed holdout and candidates
            risk: model-input mismatch
        - id: recalls-inference
          arguments:
          - value: inference
          expectedReturn:
            action: run bounded model comparison inference
            evidence: warmup latency metric ledger
            risk: nondeterministic or unsafe inference
        - id: recalls-result
          arguments:
          - value: result
          expectedReturn:
            action: reconcile model comparison output
            evidence: score-latency tradeoff report
            risk: confident wrong prediction
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};