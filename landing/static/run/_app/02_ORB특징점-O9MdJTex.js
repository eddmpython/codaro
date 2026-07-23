var e=`meta:
  id: visionFeatures_02
  title: ORB 특징점과 디스크립터
  order: 2
  category: visionFeatures
  difficulty: ⭐⭐⭐
  badge: 기초
  packages:
  - matplotlib
  - numpy
  - opencv-python
  - scikit-learn
  tags:
  - opencv
  - ORB
  - 특징점
  - 디스크립터
  - keypoint
  seo:
    title: 비전 특징점 - ORB 특징점과 디스크립터
    description: ORB로 키포인트와 디스크립터를 추출하고 그 의미를 시각화로 확인합니다.
    keywords:
    - ORB
    - 특징점
    - 디스크립터
    - keypoint
    - opencv
intro:
  emoji: 🔑
  goal: 회전과 크기에 강건한 ORB 특징점 검출기로 키포인트와 디스크립터를 얻습니다.
  description: |-
    코너만으로는 두 사진의 같은 위치를 식별할 수 없습니다. 이 강의는 ORB(Oriented FAST and Rotated BRIEF) 알고리즘으로 각 코너에 "지문" 같은 디스크립터를 붙이는 과정을 익히고, 그 디스크립터가 다음 강의의 매칭에 어떻게 쓰이는지 미리 봅니다.
  direction: ORB로 키포인트와 디스크립터를 추출하고 회전·크기 변화에 강건한지 직접 확인합니다.
  benefits:
  - cv2.ORB_create로 키포인트와 디스크립터를 한 번에 얻을 수 있습니다.
  - 키포인트가 좌표·크기·방향을 모두 가진 객체임을 이해합니다.
  - ORB가 SIFT 대비 어떤 장단점을 가지는지 한 줄로 설명할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. ORB 객체 만들기
      detail: cv2.ORB_create로 검출기를 구성합니다.
    - label: 2단계. 키포인트와 디스크립터 추출
      detail: detectAndCompute 한 번에 둘 다 얻습니다.
    - label: 3단계. 키포인트 시각화
      detail: drawKeypoints로 크기와 방향까지 그립니다.
    - label: 4단계. 디스크립터 구조 보기
      detail: 32바이트 이진 벡터의 정체를 확인합니다.
    - label: 5단계. 회전 강건성 확인
      detail: 회전 후에도 유사한 키포인트가 잡히는지 봅니다.
    runtime:
    - label: 비전 환경
      detail: opencv-python을 meta.packages에 선언하면 ORB가 모듈에 그대로 포함됩니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: orb_create
  title: 1단계. ORB 검출기 만들기
  structuredPrimary: true
  subtitle: cv2.ORB_create
  goal: 적절한 매개변수로 ORB 검출기 객체를 만듭니다.
  why: 검출기는 한 번 만들고 여러 이미지에 재사용하는 것이 표준입니다.
  explanation: |-
    \`cv2.ORB_create(nfeatures=500)\` 는 키포인트를 최대 500개까지 찾는 ORB 검출기를 만듭니다. 한 번 만들고 여러 이미지에 같은 객체를 호출하면 됩니다.

    nfeatures가 너무 작으면 매칭이 빈약하고 너무 크면 매칭 비용이 늘어납니다. 합성 데이터 학습에서는 500이 적당합니다.
  tips:
  - ORB는 OpenCV 코어에 포함되어 별도 설치가 필요 없습니다. SIFT는 일부 환경에서 contrib 모듈을 요구합니다.
  snippet: |-
    import cv2
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.datasets import load_sample_image

    orb = cv2.ORB_create(nfeatures=500)
    type(orb).__name__
  exercise:
    prompt: nfeatures를 200으로 줄인 smallOrb 객체를 만드세요.
    starterCode: |-
      smallOrb = cv2.ORB_create(nfeatures=___)
      type(smallOrb).__name__
    hints:
    - 정수만 들어가면 됩니다.
    - 객체 타입은 ORB로 출력됩니다.
  check:
    noError: 검출기 생성이 오류 없이 끝나야 합니다.
    resultCheck: type(orb).__name__ 이 'ORB'여야 합니다.
- id: detect_compute
  title: 2단계. 키포인트와 디스크립터 추출
  structuredPrimary: true
  subtitle: detectAndCompute 한 번에
  goal: 한 호출로 키포인트 리스트와 디스크립터 배열을 동시에 얻습니다.
  why: 추출 자체는 한 줄이지만 결과 데이터의 구조를 이해해야 다음 단계로 넘어갑니다.
  explanation: |-
    \`orb.detectAndCompute(gray, mask=None)\` 는 \`(keypoints, descriptors)\` 튜플을 돌려줍니다. keypoints는 \`cv2.KeyPoint\` 객체 리스트, descriptors는 \`(N, 32)\` 모양의 uint8 배열입니다.

    KeyPoint 객체는 \`.pt(좌표)\`, \`.size(크기)\`, \`.angle(방향)\`, \`.response(강도)\` 속성을 갖습니다. 좌표는 (x, y) 순입니다.
  tips:
  - 디스크립터의 한 행은 한 키포인트의 32바이트(=256비트) 이진 지문입니다.
  snippet: |-
    china = load_sample_image('china.jpg')
    gray = cv2.cvtColor(china, cv2.COLOR_RGB2GRAY)
    kp, desc = orb.detectAndCompute(gray, mask=None)
    len(kp), desc.shape, desc.dtype
  exercise:
    prompt: flower 이미지에서도 키포인트를 추출하고 각 키포인트의 (x, y) 좌표 첫 다섯 개를 출력하세요.
    starterCode: |-
      flower = load_sample_image('flower.jpg')
      flowerGray = cv2.cvtColor(flower, ___)
      kpFlower, descFlower = orb.detectAndCompute(flowerGray, mask=None)
      [point.pt for point in kpFlower[:___]]
    hints:
    - 빈칸은 색공간 상수와 정수입니다.
    - kpFlower[0].pt 는 첫 키포인트의 (x, y) 좌표입니다.
  check:
    noError: detectAndCompute가 오류 없이 끝나야 합니다.
    resultCheck: desc.shape의 두 번째 차원이 32여야 합니다.
- id: draw_keypoints
  title: 3단계. 키포인트 시각화
  structuredPrimary: true
  subtitle: 크기와 방향까지 그리기
  goal: cv2.drawKeypoints로 키포인트의 위치, 크기, 방향을 한 화면에 그립니다.
  why: 키포인트가 단순 좌표가 아니라 크기·방향까지 가진 풍부한 정보임을 시각적으로 확인합니다.
  explanation: |-
    \`cv2.drawKeypoints(img, keypoints, None, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)\` 는 키포인트를 원으로 그리되 크기와 방향까지 표시합니다.

    원의 반지름이 키포인트의 size, 원 안의 선이 angle 방향입니다. 같은 코너라도 크기가 다른 여러 스케일에서 검출되어 같은 위치에 다른 원이 겹쳐 보일 수 있습니다.
  tips:
  - drawKeypoints는 BGR을 가정하므로 입력이 RGB라면 결과를 다시 변환하거나 그대로 표시해도 됩니다(시각화 색만 살짝 다름).
  snippet: |-
    flower = load_sample_image('flower.jpg')
    flowerGray = cv2.cvtColor(flower, cv2.COLOR_RGB2GRAY)
    kpFlower, descFlower = orb.detectAndCompute(flowerGray, mask=None)

    drawn = cv2.drawKeypoints(china, kp, None, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
    fig = plt.figure(figsize=(8, 5))
    plt.imshow(drawn)
    plt.title(f'{len(kp)} ORB keypoints')
    plt.axis('off')
    fig
  exercise:
    prompt: flower에도 같은 방식으로 시각화하세요.
    starterCode: |-
      drawnFlower = cv2.drawKeypoints(flower, kpFlower, None, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
      fig2 = plt.figure(figsize=(8, 5))
      plt.imshow(drawnFlower)
      plt.title(f'flower {len(kpFlower)} keypoints')
      plt.axis('off')
      fig2
    hints:
    - drawKeypoints의 세 번째 인자가 None이면 함수가 새 이미지를 만들어 반환합니다.
    - flag를 빼면 단순 점만 그려집니다.
  check:
    noError: drawKeypoints가 오류 없이 끝나야 합니다.
    resultCheck: drawn.shape 가 china.shape와 같아야 합니다.
- id: descriptor_inspect
  title: 4단계. 디스크립터 구조 보기
  structuredPrimary: true
  subtitle: 32바이트 이진 벡터
  goal: 디스크립터 배열의 한 행이 무엇인지 직접 확인합니다.
  why: 디스크립터의 정체를 알아야 다음 강의의 해밍 거리 매칭이 어떻게 동작하는지 이해할 수 있습니다.
  explanation: |-
    ORB 디스크립터의 한 행은 32개의 uint8(256비트)입니다. 각 비트는 키포인트 주변 두 픽셀의 밝기 비교 결과입니다. 두 디스크립터의 거리는 비트가 다른 개수(해밍 거리)로 측정합니다.

    이 방식은 단순하지만 매우 빠르고, SIFT의 128차원 float 벡터보다 메모리를 적게 씁니다.
  tips:
  - 디스크립터 차원이 32바이트라는 점을 기억해 두면 데이터 크기 계산이 쉬워집니다(500개 × 32 = 16KB).
  snippet: |-
    firstDesc = desc[0]
    {"len": int(len(firstDesc)), "dtype": str(firstDesc.dtype), "bits_first_byte": format(int(firstDesc[0]), '08b')}
  exercise:
    prompt: 첫 두 디스크립터의 해밍 거리(비트 차이 개수)를 직접 계산하세요.
    starterCode: |-
      xorBytes = desc[0] ^ desc[1]
      bitDiff = int(sum(bin(value).count('1') for value in xorBytes))
      bitDiff
    hints:
    - XOR 후 각 바이트의 1의 개수를 모두 더하면 해밍 거리입니다.
    - bin(x).count('1') 가 빠른 표현입니다.
  check:
    noError: 비트 연산이 오류 없이 끝나야 합니다.
    resultCheck: bitDiff가 0 이상 256 이하 정수여야 합니다.
- id: rotation_robust
  title: 5단계. 회전 강건성 확인
  structuredPrimary: true
  subtitle: 회전된 이미지에서도 비슷한 위치
  goal: 같은 이미지를 90도 회전한 뒤 키포인트가 비슷한 위치(상대적으로)에 잡히는지 확인합니다.
  why: 회전 강건성은 매칭이 가능한 알고리즘의 기본 요건입니다.
  explanation: |-
    \`np.rot90(img, k=1)\` 로 이미지를 90도 반시계 회전한 뒤 다시 ORB를 돌리면, 비슷한 객체 부위에서 키포인트가 잡힙니다. 같은 절대 좌표가 아니라 객체 기준 같은 위치라는 점이 핵심입니다.

    이 강건성 덕분에 회전된 사진 두 장의 같은 점을 매칭할 수 있습니다.
  tips:
  - ORB의 angle은 회전을 반영해 변합니다. 매칭 시 이 각도가 디스크립터 회전 보정에 쓰입니다.
  snippet: |-
    rotated = np.rot90(china, k=1)
    rotatedGray = cv2.cvtColor(rotated, cv2.COLOR_RGB2GRAY)
    kpRot, descRot = orb.detectAndCompute(rotatedGray, mask=None)
    len(kp), len(kpRot)
  exercise:
    prompt: 원본과 회전 이미지의 키포인트를 1x2 그리드로 시각화하세요.
    starterCode: |-
      drawnRot = cv2.drawKeypoints(rotated, kpRot, None, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
      fig, axes = plt.subplots(1, 2, figsize=(12, 5))
      axes[0].imshow(drawn)
      axes[0].set_title('original')
      axes[1].imshow(drawnRot)
      axes[1].set_title('rotated 90')
      for axis in axes:
          axis.axis('off')
      fig
    hints:
    - drawKeypoints는 새 이미지를 반환합니다.
    - 회전된 이미지의 키포인트 좌표가 변하더라도 비슷한 객체 부위에 분포해야 합니다.
  check:
    noError: 회전과 추출이 오류 없이 끝나야 합니다.
    resultCheck: len(kpRot) 가 0보다 커야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 키포인트 비교 분석
  goal: 두 이미지에서 키포인트를 추출하고 강도(response) 분포를 비교합니다.
  why: response 분포는 검출의 품질을 객관적으로 보여 줍니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 키포인트 list comprehension은 [k.response for k in keypoints] 같이 단순합니다.
  snippet: |-
    flower = load_sample_image('flower.jpg')
    flowerGray = cv2.cvtColor(flower, cv2.COLOR_RGB2GRAY)
    kpFlower, descFlower = orb.detectAndCompute(flowerGray, mask=None)

    responses = np.array([point.response for point in kp])
    responses.shape, responses.mean(), responses.max()
  exercise:
    prompt: "미션1: china와 flower의 키포인트 response 분포를 같은 차트에 히스토그램으로 비교하세요. 미션2: 응답이 가장 높은 상위 20개 키포인트를 빨강으로, 나머지를 회색으로 그린 china 시각화를 만드세요."
    starterCode: |-
      flowerResponses = np.array([point.response for point in kpFlower])
      fig = plt.figure(figsize=(7, 4))
      plt.hist(responses, bins=30, alpha=0.5, label='china')
      plt.hist(flowerResponses, bins=30, alpha=0.5, label='flower')
      plt.legend()
      plt.xlabel('response')
      plt.ylabel('count')
      fig
    hints:
    - "top20 = sorted(kp, key=lambda k: -k.response)[:20] 으로 상위 응답 키포인트를 얻을 수 있습니다."
    - scatter로 두 색을 따로 그리면 됩니다.
  check:
    noError: 응답 추출과 히스토그램이 오류 없이 끝나야 합니다.
    resultCheck: responses.shape 가 (len(kp),) 여야 합니다.
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
  - id: visionFeatures_02-orb_features-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - orb_create
    - practice
    title: ORB 특징점 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: feature budget·scale factor·pyramid level을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_orb_features_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_orb_features_contract(value):
            raise NotImplementedError
      solution: |
        def audit_orb_features_contract(value):
            required = ['nFeatures', 'scaleFactor', 'nLevels', 'edgeThreshold']
            rules = [{'id': 'features', 'field': 'nFeatures', 'kind': 'range', 'min': 1, 'max': 10000}, {'id': 'scale-factor', 'field': 'scaleFactor', 'kind': 'range', 'min': 1.01, 'max': 3}, {'id': 'levels', 'field': 'nLevels', 'kind': 'range', 'min': 1, 'max': 32}, {'id': 'edge', 'field': 'edgeThreshold', 'kind': 'range', 'min': 0, 'max': 100}]
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
            return {"accepted": not missing and not violations, "topic": 'orb_features', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.vision-features.visionFeatures_02.orb_features-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_02.orb_features-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_orb_features_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              nFeatures: 1000
              scaleFactor: 1.2
              nLevels: 8
              edgeThreshold: 31
          expectedReturn:
            accepted: true
            topic: orb_features
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              scaleFactor: 1.2
              nLevels: 8
              edgeThreshold: 31
          expectedReturn:
            accepted: false
            topic: orb_features
            missing:
            - nFeatures
            violations:
            - features
        - id: reports-topic-invariants
          arguments:
          - value:
              nFeatures: 0
              scaleFactor: 1
              nLevels: 0
              edgeThreshold: 200
          expectedReturn:
            accepted: false
            topic: orb_features
            missing: []
            violations:
            - edge
            - features
            - levels
            - scale-factor
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: visionFeatures_02-orb_features-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionFeatures_02-orb_features-contract-audit-mastery
    title: ORB 특징점 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_orb_features_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_orb_features_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_orb_features_result(expected, observed):
            identity = ['sourceHash', 'descriptorType']
            metrics = {'descriptorCount': 2}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'orb_features', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.vision-features.visionFeatures_02.orb_features-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_02.orb_features-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_orb_features_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: orb1
              descriptorType: ORB-256
              descriptorCount: 800
          - value:
              sourceHash: orb1
              descriptorType: ORB-256
              descriptorCount: 801
          expectedReturn:
            passed: true
            topic: orb_features
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: orb1
              descriptorType: ORB-256
              descriptorCount: 800
          - value:
              sourceHash: orb2
              descriptorType: SIFT
              descriptorCount: 200
          expectedReturn:
            passed: false
            topic: orb_features
            missing: []
            identityMismatch:
            - descriptorType
            - sourceHash
            metricDrift:
            - descriptorCount
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: orb1
              descriptorType: ORB-256
              descriptorCount: 800
          - value: {}
          expectedReturn:
            passed: false
            topic: orb_features
            missing:
            - descriptorCount
            - descriptorType
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: visionFeatures_02-orb_features-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionFeatures_02-orb_features-result-reconciliation-transfer
    title: ORB 특징점 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_orb_features_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_orb_features_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_orb_features_evidence(stage):
            stages = {'source': {'action': 'validate ORB frames', 'evidence': 'frame pyramid contract', 'risk': 'wrong frame identity'}, 'estimate': {'action': 'estimate bounded ORB', 'evidence': 'keypoint descriptor trace', 'risk': 'unstable geometry'}, 'verify': {'action': 'verify ORB result', 'evidence': 'descriptor count and coverage', 'risk': 'confident but wrong tracking'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.vision-features.visionFeatures_02.orb_features-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_02.orb_features-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_orb_features_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate ORB frames
            evidence: frame pyramid contract
            risk: wrong frame identity
        - id: recalls-estimate
          arguments:
          - value: estimate
          expectedReturn:
            action: estimate bounded ORB
            evidence: keypoint descriptor trace
            risk: unstable geometry
        - id: recalls-verify
          arguments:
          - value: verify
          expectedReturn:
            action: verify ORB result
            evidence: descriptor count and coverage
            risk: confident but wrong tracking
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};