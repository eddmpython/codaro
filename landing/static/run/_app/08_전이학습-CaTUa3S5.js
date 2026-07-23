var e=`meta:
  id: deepVision_08
  title: 전이학습 fine-tune
  order: 8
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
  - 전이학습
  - finetune
  - requires_grad
  - 학습
  seo:
    title: 딥러닝 비전 - 전이학습 fine-tune
    description: 사전학습 ResNet18의 마지막 층만 새 클래스에 맞게 학습하는 전이학습 패턴을 익힙니다.
    keywords:
    - 전이학습
    - finetune
    - ResNet
    - PyTorch
    - 학습
intro:
  emoji: 🎓
  goal: 사전학습 ResNet의 마지막 층만 작은 데이터로 학습해 두 가지 클래스 분류기를 만듭니다.
  description: |-
    이 강의는 처음으로 모델을 직접 학습시킵니다. 단, 모든 파라미터가 아닌 마지막 분류층만 학습합니다. 입력 데이터는 sklearn의 china와 flower 이미지를 변형해 만든 24장 합성 데이터셋입니다. 3 에폭 안에 끝나는 toy 학습으로 전이학습의 표준 흐름을 익힙니다.
  direction: 사전학습 ResNet에서 분류층을 새로 갈아 끼우고 그 층만 학습하는 표준 전이학습 흐름을 구현합니다.
  benefits:
  - requires_grad 설정으로 일부 파라미터만 학습 대상으로 만듭니다.
  - 작은 데이터셋·작은 에폭으로 학습 흐름을 검증합니다.
  - 학습 전과 후의 정확도를 비교해 전이학습의 효과를 확인합니다.
  diagram:
    steps:
    - label: 1단계. 합성 데이터셋 만들기
      detail: 두 클래스 각각 12장씩.
    - label: 2단계. 모델 준비 + freeze
      detail: 분류층을 갈아 끼우고 다른 층은 동결.
    - label: 3단계. 학습 루프
      detail: 3 에폭, CrossEntropy.
    - label: 4단계. 학습 전/후 정확도
      detail: 학습 효과 확인.
    - label: 5단계. 검증 시각화
      detail: 새 사진에 예측 결과.
    runtime:
    - label: PyTorch 환경
      detail: torchvision + torch.optim 사용. CPU에서 3 에폭이 1~2분 안에 끝납니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: build_dataset
  title: 1단계. 합성 데이터셋 만들기
  structuredPrimary: true
  subtitle: 두 클래스 각각 12장
  goal: china와 flower 각각에서 변형된 12장씩 모은 데이터셋을 만듭니다.
  why: 외부 데이터셋 의존 없이 학습 흐름을 끝까지 실행할 수 있어야 합니다.
  explanation: |-
    원본 + 회전·뒤집기·노이즈로 12개 변형을 만듭니다. 두 클래스이므로 라벨은 0(china), 1(flower) 입니다.

    데이터셋은 (텐서, 라벨) 튜플의 리스트로 만들어 두면 torch.utils.data.DataLoader 없이도 학습이 가능합니다.
  tips:
  - 합성 데이터셋은 변화량이 작아 학습이 매우 빠릅니다. 실제로는 더 많은 데이터와 더 큰 변화가 필요합니다.
  snippet: |-
    import torch
    import torch.nn as nn
    import torch.optim as optim
    import torch.nn.functional as F
    import torchvision
    from torchvision.models import resnet18, ResNet18_Weights
    from torchvision import transforms
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.datasets import load_sample_image

    china = load_sample_image('china.jpg')
    flower = load_sample_image('flower.jpg')

    def augment(img, seed):
        rng = np.random.RandomState(seed)
        rotated = np.rot90(img, k=rng.choice([0, 1, 2, 3])).copy()
        if rng.random() < 0.5:
            rotated = rotated[:, ::-1].copy()
        noisy = (rotated.astype(np.float32) + rng.normal(0, 8, rotated.shape)).clip(0, 255).astype(np.uint8)
        return noisy

    chinaSet = [(augment(china, seed=i), 0) for i in range(12)]
    flowerSet = [(augment(flower, seed=i + 100), 1) for i in range(12)]
    dataset = chinaSet + flowerSet
    len(dataset), dataset[0][1], dataset[-1][1]
  exercise:
    prompt: 데이터셋의 라벨 0 개수와 라벨 1 개수를 출력하세요.
    starterCode: |-
      labels = [pair[1] for pair in dataset]
      labelZero = labels.count(___)
      labelOne = labels.count(1)
      labelZero, labelOne
    hints:
    - 빈칸은 정수 0입니다.
    - 각 라벨은 12개씩이어야 합니다.
  check:
    noError: 데이터셋 생성이 오류 없이 끝나야 합니다.
    resultCheck: len(dataset) 가 24여야 합니다.
- id: prepare_model
  title: 2단계. 모델 준비 + freeze
  structuredPrimary: true
  subtitle: 분류층 교체
  goal: 사전학습 ResNet18을 가져와 fc 층을 2클래스용으로 갈아 끼우고 다른 층은 학습에서 제외합니다.
  why: 사전학습된 가중치는 그대로 두고 마지막 층만 학습하는 것이 전이학습의 표준입니다.
  explanation: |-
    \`model.fc = nn.Linear(512, 2)\` 로 분류층을 새 Linear로 교체합니다. 이 층의 파라미터는 자동으로 requires_grad=True 가 됩니다.

    다른 층의 파라미터는 \`param.requires_grad = False\` 로 동결합니다. 이렇게 하면 옵티마이저가 학습 가능한 파라미터만 다룹니다.
  tips:
  - 학습 가능한 파라미터 수를 출력해 두면 freeze가 의도대로 됐는지 확인할 수 있습니다.
  snippet: |-
    weights = ResNet18_Weights.DEFAULT
    model = resnet18(weights=weights)
    for param in model.parameters():
        param.requires_grad = False
    model.fc = nn.Linear(512, 2)
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    trainable, total
  exercise:
    prompt: 학습 가능한 파라미터가 fc 층의 가중치 + bias와 같은지 확인하세요.
    starterCode: |-
      fcWeight = model.fc.weight.numel()
      fcBias = model.fc.bias.numel()
      expected = fcWeight + fcBias
      trainable == ___
    hints:
    - 빈칸은 expected 변수입니다.
    - 결과는 True여야 합니다.
  check:
    noError: 모델 교체와 freeze가 오류 없이 끝나야 합니다.
    resultCheck: trainable이 1026 정도여야 합니다(512*2 + 2).
- id: train_loop
  title: 3단계. 학습 루프
  structuredPrimary: true
  subtitle: 3 에폭 CrossEntropy
  goal: 작은 데이터셋과 3 에폭으로 모델을 학습합니다.
  why: 학습 루프의 표준 패턴을 직접 한 번 작성해 봐야 학습이 무엇을 하는지 와닿습니다.
  explanation: |-
    각 에폭마다 데이터셋을 셔플해 한 장씩 (또는 작은 배치) 모델에 통과시키고, CrossEntropyLoss로 손실을 계산하고, optimizer.step으로 가중치를 갱신합니다.

    \`weights.transforms()\` 권장 전처리는 PIL Image나 텐서만 받습니다. 데이터셋의 이미지는 numpy 배열이므로 \`Image.fromarray\` 로 PIL Image로 바꿔 넣습니다.

    합성 데이터가 단순해 3 에폭 안에 손실이 충분히 줄어듭니다.
  tips:
  - 학습 시 model.train(), 추론 시 model.eval() 을 호출해 모드를 정확히 맞춥니다.
  - 권장 transforms는 numpy 배열을 거부하므로 Image.fromarray로 PIL Image로 변환해 넣습니다.
  snippet: |-
    from PIL import Image

    preprocess = weights.transforms()
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-3)
    lossFn = nn.CrossEntropyLoss()
    losses = []
    rng = np.random.RandomState(0)
    model.train()
    for epoch in range(3):
        order = rng.permutation(len(dataset))
        for idx in order:
            img, label = dataset[idx]
            batch = preprocess(Image.fromarray(img)).unsqueeze(0)
            target = torch.tensor([label])
            optimizer.zero_grad()
            logits = model(batch)
            loss = lossFn(logits, target)
            loss.backward()
            optimizer.step()
            losses.append(float(loss))
    losses[0], losses[-1], len(losses)
  exercise:
    prompt: 학습 손실의 시계열을 그래프로 그리세요.
    starterCode: |-
      fig = plt.figure(figsize=(7, 3))
      plt.plot(losses)
      plt.xlabel('step')
      plt.ylabel('___')
      fig
    hints:
    - 빈칸은 'loss' 입니다.
    - 손실이 점진적으로 줄어야 합니다.
  check:
    noError: 학습 루프가 오류 없이 끝나야 합니다.
    resultCheck: losses의 길이가 72(=24*3) 여야 합니다.
- id: evaluate
  title: 4단계. 학습 전/후 정확도
  structuredPrimary: true
  subtitle: 단순 정확도 비교
  goal: 학습 후 모델의 데이터셋 정확도를 측정합니다.
  why: 학습 효과를 정량적으로 확인하려면 정확도 비교가 가장 직관적입니다.
  explanation: |-
    데이터셋의 모든 사진에 추론을 적용해 argmax 라벨이 실제 라벨과 같은지 세면 정확도가 됩니다. 합성 데이터셋이 단순하므로 학습 후 100%에 가깝게 나옵니다.
  tips:
  - 정확도는 학습이 잘 됐는지 빠르게 확인하는 가장 단순한 지표입니다.
  snippet: |-
    from PIL import Image

    model.eval()
    correct = 0
    with torch.inference_mode():
        for img, label in dataset:
            logits = model(preprocess(Image.fromarray(img)).unsqueeze(0))
            pred = int(logits.argmax(dim=1))
            if pred == label:
                correct += 1
    accuracy = correct / len(dataset)
    accuracy
  exercise:
    prompt: 학습 가중치를 망가뜨리지 않고 첫 두 사진의 logits을 출력해 모델이 얼마나 자신감 있는지 확인하세요.
    starterCode: |-
      from PIL import Image

      model.eval()
      with torch.inference_mode():
          logitsA = model(preprocess(Image.fromarray(dataset[0][0])).unsqueeze(0))
          logitsB = model(preprocess(Image.fromarray(dataset[___][0])).unsqueeze(0))
      logitsA, logitsB
    hints:
    - 빈칸은 정수 1 입니다.
    - 두 logits의 argmax가 실제 라벨과 일치해야 합니다.
  check:
    noError: 정확도 계산이 오류 없이 끝나야 합니다.
    resultCheck: accuracy가 0.5 이상이어야 합니다.
- id: visual_check
  title: 5단계. 검증 시각화
  structuredPrimary: true
  subtitle: 새 사진에 예측
  goal: 합성 데이터에 없던 변형을 만들어 모델이 일반화되는지 확인합니다.
  why: 데이터셋 내부 정확도가 100%여도 새 변형에 약할 수 있습니다.
  explanation: |-
    새 변형(예: 데이터셋과 다른 seed로 만든 china 변형 한 장) 에 모델을 적용해 예측 라벨을 확인합니다.
  tips:
  - 작은 데이터셋의 전이학습은 항상 일반화 실패 위험이 있습니다. 새 변형 검증은 그 위험을 빠르게 발견합니다.
  snippet: |-
    from PIL import Image

    newImg = augment(china, seed=999)
    with torch.inference_mode():
        newLogits = model(preprocess(Image.fromarray(newImg)).unsqueeze(0))
    newPred = int(newLogits.argmax(dim=1))
    fig, axis = plt.subplots(figsize=(5, 4))
    axis.imshow(newImg)
    axis.set_title(f'pred={newPred} (0=china, 1=flower)')
    axis.axis('off')
    fig
  exercise:
    prompt: 새 flower 변형 한 장으로도 같은 검증을 하세요.
    starterCode: |-
      from PIL import Image

      newFlower = augment(flower, seed=___)
      with torch.inference_mode():
          newFlowerLogits = model(preprocess(Image.fromarray(newFlower)).unsqueeze(0))
      newFlowerPred = int(newFlowerLogits.argmax(dim=1))
      fig2, axis2 = plt.subplots(figsize=(5, 4))
      axis2.imshow(newFlower)
      axis2.set_title(f'pred={newFlowerPred}')
      axis2.axis('off')
      fig2
    hints:
    - 빈칸은 새 seed(예: 1000) 입니다.
    - 결과가 1이면 flower를 정확히 분류한 것입니다.
  check:
    noError: 검증 시각화가 오류 없이 끝나야 합니다.
    resultCheck: newPred가 0 또는 1이어야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 학습 동결 효과 비교
  goal: freeze 없이 fc만 학습한 모델과 모든 층 학습 모델을 학습 시간으로 비교합니다.
  why: 전이학습의 "필요한 만큼만 학습" 철학을 직접 측정으로 확인합니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 학습 가능한 파라미터가 적을수록 1 step의 backward가 빠릅니다.
  snippet: |-
    paramCounts = {
        "frozen": sum(p.numel() for p in model.parameters() if p.requires_grad),
        "total": sum(p.numel() for p in model.parameters()),
    }
    paramCounts
  exercise:
    prompt: "미션1: 학습 데이터의 분류 정확도와 새 검증(첫 5개 seed) 사진의 정확도를 비교해 출력하세요. 미션2: 모델 fc 층의 가중치 평균과 표준편차를 학습 전과 비교하기 위해 출력하세요(학습 후 값만)."
    starterCode: |-
      from PIL import Image

      correctNew = 0
      for seed in range(5):
          img = augment(china, seed=2000 + seed)
          with torch.inference_mode():
              logitsC = model(preprocess(Image.fromarray(img)).unsqueeze(0))
          if int(logitsC.argmax(dim=1)) == 0:
              correctNew += 1
      ratio = correctNew / ___
      ratio
    hints:
    - 빈칸은 정수 5 입니다.
    - "결과가 1.0이면 모든 새 china 변형을 정확히 분류한 것입니다."
  check:
    noError: 비교 검증이 오류 없이 끝나야 합니다.
    resultCheck: paramCounts의 frozen이 total보다 작아야 합니다.
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
  - id: deepVision_08-transfer_learning-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - build_dataset
    - practice
    title: 전이학습 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: dataset split·trainable layer·learning rate·epoch budget를 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_transfer_learning_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_transfer_learning_contract(value):
            raise NotImplementedError
      solution: |
        def audit_transfer_learning_contract(value):
            required = ['splitRatios', 'trainableLayers', 'learningRate', 'epochs']
            rules = [{'id': 'splits', 'field': 'splitRatios', 'kind': 'length', 'value': 3}, {'id': 'layers', 'field': 'trainableLayers', 'kind': 'range', 'min': 1, 'max': 10000}, {'id': 'learning-rate', 'field': 'learningRate', 'kind': 'range', 'min': 1e-07, 'max': 1}, {'id': 'epochs', 'field': 'epochs', 'kind': 'range', 'min': 1, 'max': 10000}]
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
            return {"accepted": not missing and not violations, "topic": 'transfer_learning', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.deep-vision.deepVision_08.transfer_learning-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_08.transfer_learning-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_transfer_learning_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              splitRatios:
              - 0.7
              - 0.15
              - 0.15
              trainableLayers: 10
              learningRate: 0.001
              epochs: 20
          expectedReturn:
            accepted: true
            topic: transfer_learning
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              trainableLayers: 10
              learningRate: 0.001
              epochs: 20
          expectedReturn:
            accepted: false
            topic: transfer_learning
            missing:
            - splitRatios
            violations:
            - splits
        - id: reports-topic-invariants
          arguments:
          - value:
              splitRatios:
              - 0.8
              - 0.2
              trainableLayers: 0
              learningRate: 2
              epochs: 0
          expectedReturn:
            accepted: false
            topic: transfer_learning
            missing: []
            violations:
            - epochs
            - layers
            - learning-rate
            - splits
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: deepVision_08-transfer_learning-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_08-transfer_learning-contract-audit-mastery
    title: 전이학습 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_transfer_learning_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_transfer_learning_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_transfer_learning_result(expected, observed):
            identity = ['datasetHash', 'baseModelHash', 'splitHash']
            metrics = {'validationAccuracy': 0.01}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'transfer_learning', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.deep-vision.deepVision_08.transfer_learning-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_08.transfer_learning-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_transfer_learning_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              datasetHash: ds1
              baseModelHash: resnet-a
              splitHash: split-42
              validationAccuracy: 0.88
          - value:
              datasetHash: ds1
              baseModelHash: resnet-a
              splitHash: split-42
              validationAccuracy: 0.885
          expectedReturn:
            passed: true
            topic: transfer_learning
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              datasetHash: ds1
              baseModelHash: resnet-a
              splitHash: split-42
              validationAccuracy: 0.88
          - value:
              datasetHash: ds2
              baseModelHash: other
              splitHash: leaky
              validationAccuracy: 0.99
          expectedReturn:
            passed: false
            topic: transfer_learning
            missing: []
            identityMismatch:
            - baseModelHash
            - datasetHash
            - splitHash
            metricDrift:
            - validationAccuracy
        - id: reports-missing-result-fields
          arguments:
          - value:
              datasetHash: ds1
              baseModelHash: resnet-a
              splitHash: split-42
              validationAccuracy: 0.88
          - value: {}
          expectedReturn:
            passed: false
            topic: transfer_learning
            missing:
            - baseModelHash
            - datasetHash
            - splitHash
            - validationAccuracy
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: deepVision_08-transfer_learning-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_08-transfer_learning-result-reconciliation-transfer
    title: 전이학습 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_transfer_learning_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_transfer_learning_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_transfer_learning_evidence(stage):
            stages = {'source': {'action': 'validate transfer learning source and model', 'evidence': 'dataset split base model', 'risk': 'model-input mismatch'}, 'inference': {'action': 'run bounded transfer learning inference', 'evidence': 'seeded training ledger', 'risk': 'nondeterministic or unsafe inference'}, 'result': {'action': 'reconcile transfer learning output', 'evidence': 'validation metric and checkpoint', 'risk': 'confident wrong prediction'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.deep-vision.deepVision_08.transfer_learning-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_08.transfer_learning-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_transfer_learning_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate transfer learning source and model
            evidence: dataset split base model
            risk: model-input mismatch
        - id: recalls-inference
          arguments:
          - value: inference
          expectedReturn:
            action: run bounded transfer learning inference
            evidence: seeded training ledger
            risk: nondeterministic or unsafe inference
        - id: recalls-result
          arguments:
          - value: result
          expectedReturn:
            action: reconcile transfer learning output
            evidence: validation metric and checkpoint
            risk: confident wrong prediction
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};