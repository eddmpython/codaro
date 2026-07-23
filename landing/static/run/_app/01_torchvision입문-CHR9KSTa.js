var e=`meta:
  id: deepVision_01
  title: torchvision 입문과 텐서 변환
  order: 1
  category: deepVision
  difficulty: ⭐⭐
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
  - 텐서
  - ToTensor
  - normalize
  - 사전학습
  seo:
    title: 딥러닝 비전 - torchvision 입문
    description: torchvision의 텐서 변환, 정규화, 사전학습 모델 호출 흐름을 익힙니다.
    keywords:
    - torchvision
    - 텐서
    - PyTorch
    - 사전학습
    - 정규화
intro:
  emoji: 🧠
  goal: numpy 이미지와 torch 텐서 사이를 자유롭게 변환하고 사전학습 모델 호출 형식을 익힙니다.
  description: |-
    딥러닝 비전 트랙의 첫 강의입니다. 모든 사전학습 모델은 numpy ndarray가 아닌 torch 텐서를 입력으로 받으며, 채널 순서·정규화·차원 순서가 일관되어야 정확히 동작합니다. 이 강의는 그 인터페이스를 익히고 다음 강의의 분류 추론 준비를 마칩니다.
  direction: ndarray → tensor → 정규화 → 모델 입력 형식까지의 변환 흐름을 단계별로 만듭니다.
  benefits:
  - torchvision.transforms로 표준 전처리를 한 줄에 끝낼 수 있습니다.
  - 채널 순서 (H, W, C) ↔ (C, H, W) 변환과 dtype 캐스팅을 직접 처리할 수 있습니다.
  - 사전학습 가중치 객체에서 권장 transforms와 카테고리 라벨을 꺼낼 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 임포트
      detail: torch, torchvision, transforms 모듈을 가져옵니다.
    - label: 2단계. ndarray → tensor
      detail: ToTensor 한 줄로 0~1 float 텐서로.
    - label: 3단계. 차원 순서 이해
      detail: (H, W, C) vs (C, H, W) 차이.
    - label: 4단계. 정규화 적용
      detail: ImageNet 평균·표준편차로 정규화.
    - label: 5단계. weights 객체에서 메타 꺼내기
      detail: 권장 transforms와 카테고리.
    runtime:
    - label: PyTorch 환경
      detail: torch, torchvision, matplotlib, sklearn 으로 학습합니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: imports
  title: 1단계. 라이브러리 임포트
  structuredPrimary: true
  subtitle: torch와 torchvision
  goal: 학습에 필요한 모든 라이브러리를 한 번에 가져옵니다.
  why: 환경이 갖춰져 있는지 import 한 번으로 빠르게 확인할 수 있습니다.
  explanation: |-
    \`import torch\` 가 실패하면 PyTorch가 설치되지 않은 환경입니다. \`torchvision\` 은 PyTorch 위에 비전 도구를 얹은 라이브러리이며, transforms 서브모듈에 표준 전처리가 들어 있습니다.

    버전을 출력해 두면 환경 디버깅에 유용합니다.
  tips:
  - PyTorch는 사전학습 가중치를 처음 호출할 때 자동 다운로드합니다. 첫 호출이 느리거나 네트워크 의존이 있다는 점을 기억하세요.
  snippet: |-
    import torch
    import torchvision
    from torchvision import transforms
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.datasets import load_sample_image

    torch.__version__, torchvision.__version__
  exercise:
    prompt: torch가 CPU 모드에서 동작하고 있는지 확인하세요.
    starterCode: |-
      torch.cuda.is_available(), torch.get_num_threads()
    hints:
    - is_available은 GPU가 있고 PyTorch가 인식하면 True입니다.
    - 스레드 수는 운영체제 코어 수에 따라 다릅니다.
  check:
    noError: 모든 import가 오류 없이 끝나야 합니다.
    resultCheck: torch.__version__이 문자열이어야 합니다.
- id: to_tensor
  title: 2단계. ndarray → tensor
  structuredPrimary: true
  subtitle: ToTensor 한 줄
  goal: numpy 이미지를 0~1 범위의 float 텐서로 변환합니다.
  why: 모든 PyTorch 모델 입력의 첫 단계가 이 변환입니다.
  explanation: |-
    \`transforms.ToTensor()\` 는 ndarray 또는 PIL Image를 받아 (C, H, W) 모양의 float32 텐서로 만듭니다. 값 범위도 0~255에서 0~1로 자동 정규화됩니다.

    같은 일을 직접 하면 \`torch.from_numpy(img).permute(2, 0, 1).float() / 255.0\` 가 됩니다. transforms.ToTensor가 이 패턴을 한 줄로 감춥니다.
  tips:
  - 차원 순서가 (C, H, W) 로 바뀌었다는 점을 항상 확인하세요. matplotlib으로 직접 imshow하려면 다시 (H, W, C)로 돌려야 합니다.
  snippet: |-
    china = load_sample_image('china.jpg')
    toTensor = transforms.ToTensor()
    chinaTensor = toTensor(china)
    chinaTensor.shape, chinaTensor.dtype, float(chinaTensor.min()), float(chinaTensor.max())
  exercise:
    prompt: flower 이미지에도 같은 변환을 적용하고 텐서의 차원 순서를 확인하세요.
    starterCode: |-
      flower = load_sample_image('flower.jpg')
      flowerTensor = toTensor(___)
      flowerTensor.shape
    hints:
    - 빈칸은 변수명입니다.
    - 결과 shape의 첫 번째 차원은 채널 수입니다.
  check:
    noError: ToTensor 적용이 오류 없이 끝나야 합니다.
    resultCheck: chinaTensor.dtype이 torch.float32여야 합니다.
- id: dim_order
  title: 3단계. 차원 순서 이해
  structuredPrimary: true
  subtitle: (H, W, C) vs (C, H, W)
  goal: 두 차원 순서의 차이와 변환 방법을 익힙니다.
  why: 차원 순서를 잘못 두면 모델이 깨지거나 시각화에서 색이 뒤섞입니다.
  explanation: |-
    numpy 이미지는 보통 \`(H, W, C)\`, torch 텐서는 \`(C, H, W)\` 입니다. \`.permute(2, 0, 1)\` 또는 \`.permute(1, 2, 0)\` 으로 순서를 바꿉니다.

    matplotlib에 시각화하려면 텐서를 다시 \`(H, W, C)\` 로 돌려놓고 numpy로 변환해야 합니다. 정규화된 텐서는 0~1 범위이므로 imshow가 그대로 받습니다.
  tips:
  - "permute 인자는 새 차원 순서이고, transpose는 두 축만 바꿉니다."
  snippet: |-
    backToHwc = chinaTensor.permute(1, 2, 0).numpy()
    fig = plt.figure(figsize=(5, 4))
    plt.imshow(backToHwc)
    plt.axis('off')
    fig
  exercise:
    prompt: flowerTensor를 (H, W, C) numpy로 되돌려 시각화하세요.
    starterCode: |-
      flowerHwc = flowerTensor.permute(___, ___, ___).numpy()
      fig2 = plt.figure(figsize=(5, 4))
      plt.imshow(flowerHwc)
      plt.axis('off')
      fig2
    hints:
    - "permute 인자는 (1, 2, 0) 입니다."
    - 결과가 원본 flower와 같은 그림이어야 합니다.
  check:
    noError: permute와 시각화가 오류 없이 끝나야 합니다.
    resultCheck: backToHwc.shape의 마지막 차원이 3이어야 합니다.
- id: normalize
  title: 4단계. 정규화 적용
  structuredPrimary: true
  subtitle: ImageNet 평균과 표준편차
  goal: 사전학습 모델이 기대하는 ImageNet 정규화를 적용합니다.
  why: 사전학습 모델은 학습 당시 사용한 정규화와 동일한 전처리를 기대합니다. 정규화를 빠뜨리면 정확도가 크게 떨어집니다.
  explanation: |-
    \`transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])\` 가 ImageNet 표준입니다. 평균을 빼고 표준편차로 나눕니다.

    \`transforms.Compose([ToTensor, Normalize])\` 로 두 단계를 한 함수로 묶을 수 있습니다.
  tips:
  - 정규화 후 값 범위는 0~1이 아니라 약 -2.5 ~ 2.5 사이입니다. imshow에는 어울리지 않습니다.
  snippet: |-
    preprocess = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    chinaNorm = preprocess(china)
    float(chinaNorm.min()), float(chinaNorm.max()), chinaNorm.shape
  exercise:
    prompt: 같은 preprocess로 flower를 변환한 flowerNorm을 만들고 값 범위를 확인하세요.
    starterCode: |-
      flowerNorm = preprocess(___)
      float(flowerNorm.min()), float(flowerNorm.max())
    hints:
    - 빈칸은 변수명입니다.
    - 값 범위가 0~1을 벗어나야 정규화가 잘 적용된 것입니다.
  check:
    noError: 정규화 변환이 오류 없이 끝나야 합니다.
    resultCheck: chinaNorm의 최솟값이 0보다 작아야 합니다.
- id: weights_meta
  title: 5단계. weights 객체에서 메타 꺼내기
  structuredPrimary: true
  subtitle: 권장 transforms와 카테고리
  goal: 사전학습 가중치 객체에서 권장 전처리와 카테고리 라벨을 꺼냅니다.
  why: 모델마다 권장 전처리가 다릅니다. weights 객체가 모델과 묶어 제공하므로 그대로 쓰는 것이 안전합니다.
  explanation: |-
    PyTorch 0.13+ 부터 \`torchvision.models.<Model>_Weights.DEFAULT\` 가 표준 가중치 객체입니다. \`weights.transforms()\` 가 권장 전처리, \`weights.meta['categories']\` 가 클래스 라벨 리스트입니다.

    이 메타데이터를 사용하면 모델별로 다른 전처리·라벨을 일관된 방법으로 다룰 수 있습니다. 다만 weights.transforms()는 numpy ndarray가 아니라 PIL Image(또는 텐서)를 입력으로 받으므로, sklearn 샘플 이미지 같은 ndarray는 Image.fromarray()로 변환해 넣습니다.
  tips:
  - 처음 호출 시 가중치 파일을 자동 다운로드합니다(약 40MB). 네트워크가 차단된 환경에서는 미리 캐시 디렉터리에 받아 두세요.
  snippet: |-
    from torchvision.models import ResNet18_Weights
    from PIL import Image

    weights = ResNet18_Weights.DEFAULT
    autoPreprocess = weights.transforms()
    categories = weights.meta['categories']
    chinaAuto = autoPreprocess(Image.fromarray(china))
    len(categories), categories[0], categories[1]
  exercise:
    prompt: autoPreprocess로 china를 변환한 chinaAuto 텐서를 만들고 shape을 확인하세요.
    starterCode: |-
      chinaAuto = autoPreprocess(Image.fromarray(___))
      chinaAuto.shape, chinaAuto.dtype
    hints:
    - 빈칸은 numpy 이미지 변수(china)입니다. weights.transforms()는 PIL Image를 받으므로 Image.fromarray로 감쌉니다.
    - 결과는 자동으로 224x224 정도로 resize된 텐서입니다.
  check:
    noError: weights 메타데이터 추출이 오류 없이 끝나야 합니다.
    resultCheck: len(categories) 가 1000이어야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 전처리 비교
  goal: 직접 만든 preprocess와 weights.transforms 의 결과를 비교합니다.
  why: 두 결과의 차이를 비교해야 함수형 transforms의 미묘한 차이를 안내할 수 있습니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 권장 transforms는 보통 resize와 center crop을 포함합니다.
  snippet: |-
    customShape = chinaNorm.shape
    autoShape = chinaAuto.shape
    customShape, autoShape
  exercise:
    prompt: "미션1: 두 텐서를 (H, W, C)로 다시 돌려 1x2 그리드로 시각화하세요(정규화된 값을 0~1로 클립한 후). 미션2: chinaAuto.mean(dim=(1, 2)) 를 출력해 채널별 평균이 0 근처인지 확인하세요."
    starterCode: |-
      customVis = chinaNorm.permute(1, 2, 0).numpy()
      autoVis = chinaAuto.permute(1, 2, 0).numpy()
      fig, axes = plt.subplots(1, 2, figsize=(10, 4))
      axes[0].imshow((customVis - customVis.min()) / (customVis.max() - customVis.min()))
      axes[0].set_title('custom normalized')
      axes[1].imshow((autoVis - autoVis.min()) / (autoVis.max() - autoVis.min()))
      axes[1].set_title('auto preprocess')
      for axis in axes:
          axis.axis('off')
      fig
    hints:
    - 정규화된 값을 시각화하려면 min/max로 다시 0~1로 재정규화하면 됩니다.
    - 채널별 평균은 dim=(1, 2) 로 H, W 축 평균입니다.
  check:
    noError: 두 텐서 비교 시각화가 오류 없이 끝나야 합니다.
    resultCheck: customShape의 첫 차원과 autoShape의 첫 차원이 모두 3이어야 합니다.
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
  - id: deepVision_01-torchvision_runtime-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - imports
    - practice
    title: torchvision 입문 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: dataset·transform·device·seed 실행 계약을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_torchvision_runtime_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_torchvision_runtime_contract(value):
            raise NotImplementedError
      solution: |
        def audit_torchvision_runtime_contract(value):
            required = ['datasetHash', 'transformHash', 'device', 'seed']
            rules = [{'id': 'dataset', 'field': 'datasetHash', 'kind': 'nonempty'}, {'id': 'transform', 'field': 'transformHash', 'kind': 'nonempty'}, {'id': 'device', 'field': 'device', 'kind': 'enum', 'values': ['cpu', 'cuda', 'mps']}, {'id': 'seed', 'field': 'seed', 'kind': 'range', 'min': 0, 'max': 4294967295}]
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
            return {"accepted": not missing and not violations, "topic": 'torchvision_runtime', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.deep-vision.deepVision_01.torchvision_runtime-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_01.torchvision_runtime-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_torchvision_runtime_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              datasetHash: ds-a
              transformHash: resize-normalize-v1
              device: cpu
              seed: 42
          expectedReturn:
            accepted: true
            topic: torchvision_runtime
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              transformHash: resize-normalize-v1
              device: cpu
              seed: 42
          expectedReturn:
            accepted: false
            topic: torchvision_runtime
            missing:
            - datasetHash
            violations:
            - dataset
        - id: reports-topic-invariants
          arguments:
          - value:
              datasetHash: ''
              transformHash: ''
              device: tpu
              seed: -1
          expectedReturn:
            accepted: false
            topic: torchvision_runtime
            missing: []
            violations:
            - dataset
            - device
            - seed
            - transform
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: deepVision_01-torchvision_runtime-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_01-torchvision_runtime-contract-audit-mastery
    title: torchvision 입문 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_torchvision_runtime_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_torchvision_runtime_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_torchvision_runtime_result(expected, observed):
            identity = ['modelHash', 'transformHash']
            metrics = {'batchCount': 0}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'torchvision_runtime', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.deep-vision.deepVision_01.torchvision_runtime-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_01.torchvision_runtime-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_torchvision_runtime_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              modelHash: m1
              transformHash: resize-normalize-v1
              batchCount: 10
          - value:
              modelHash: m1
              transformHash: resize-normalize-v1
              batchCount: 10
          expectedReturn:
            passed: true
            topic: torchvision_runtime
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              modelHash: m1
              transformHash: resize-normalize-v1
              batchCount: 10
          - value:
              modelHash: m2
              transformHash: other
              batchCount: 8
          expectedReturn:
            passed: false
            topic: torchvision_runtime
            missing: []
            identityMismatch:
            - modelHash
            - transformHash
            metricDrift:
            - batchCount
        - id: reports-missing-result-fields
          arguments:
          - value:
              modelHash: m1
              transformHash: resize-normalize-v1
              batchCount: 10
          - value: {}
          expectedReturn:
            passed: false
            topic: torchvision_runtime
            missing:
            - batchCount
            - modelHash
            - transformHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: deepVision_01-torchvision_runtime-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - deepVision_01-torchvision_runtime-result-reconciliation-transfer
    title: torchvision 입문 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_torchvision_runtime_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_torchvision_runtime_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_torchvision_runtime_evidence(stage):
            stages = {'source': {'action': 'validate torchvision source and model', 'evidence': 'dataset model transform hashes', 'risk': 'model-input mismatch'}, 'inference': {'action': 'run bounded torchvision inference', 'evidence': 'device seed batch trace', 'risk': 'nondeterministic or unsafe inference'}, 'result': {'action': 'reconcile torchvision output', 'evidence': 'batch shape and count', 'risk': 'confident wrong prediction'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.deep-vision.deepVision_01.torchvision_runtime-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.deep-vision.deepVision_01.torchvision_runtime-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_torchvision_runtime_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate torchvision source and model
            evidence: dataset model transform hashes
            risk: model-input mismatch
        - id: recalls-inference
          arguments:
          - value: inference
          expectedReturn:
            action: run bounded torchvision inference
            evidence: device seed batch trace
            risk: nondeterministic or unsafe inference
        - id: recalls-result
          arguments:
          - value: result
          expectedReturn:
            action: reconcile torchvision output
            evidence: batch shape and count
            risk: confident wrong prediction
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};