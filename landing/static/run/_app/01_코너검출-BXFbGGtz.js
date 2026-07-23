var e=`meta:
  id: visionFeatures_01
  title: 코너 검출
  order: 1
  category: visionFeatures
  difficulty: ⭐⭐
  badge: 기초
  packages:
  - matplotlib
  - numpy
  - opencv-python
  - scikit-learn
  tags:
  - opencv
  - 코너
  - Harris
  - goodFeaturesToTrack
  - 특징점
  seo:
    title: 비전 특징점 - 코너 검출
    description: Harris와 goodFeaturesToTrack으로 이미지의 코너점을 찾고 시각화합니다.
    keywords:
    - 코너검출
    - Harris
    - goodFeaturesToTrack
    - 특징점
    - opencv
intro:
  emoji: 📍
  goal: 이미지에서 두드러진 코너점을 자동으로 찾는 두 가지 방법을 익힙니다.
  description: |-
    매칭, 트래킹, 호모그래피 추정 - 거의 모든 비전 응용은 "이미지에서 두드러진 점들"이라는 입력에서 시작합니다. 이 강의는 가장 고전적이고 빠른 두 가지 코너 검출기를 비교하며 특징점이라는 개념을 이해합니다.
  direction: Harris와 goodFeaturesToTrack 으로 같은 이미지의 코너를 찾고 매개변수 조정의 영향을 확인합니다.
  benefits:
  - Harris 코너 점수와 그 의미를 이해합니다.
  - goodFeaturesToTrack의 minDistance, qualityLevel 매개변수를 조정할 수 있습니다.
  - 두 검출기의 결과를 같은 화면에 시각화해 비교할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 회색 이미지 준비
      detail: 코너 검출의 입력은 흑백입니다.
    - label: 2단계. Harris 코너 점수
      detail: 픽셀별 코너 정도를 계산합니다.
    - label: 3단계. goodFeaturesToTrack
      detail: 최적화된 코너 N개를 직접 받습니다.
    - label: 4단계. 결과 시각화
      detail: 원본 위에 코너를 점으로 표시합니다.
    - label: 5단계. 매개변수 비교
      detail: qualityLevel과 minDistance를 바꿔 봅니다.
    runtime:
    - label: 비전 환경
      detail: opencv-python, numpy, matplotlib, scikit-learn 으로 학습합니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: gray_input
  title: 1단계. 회색 이미지 준비
  structuredPrimary: true
  subtitle: 코너 검출의 표준 입력
  goal: 컬러 이미지를 그레이로 변환해 코너 검출의 입력을 만듭니다.
  why: 코너 검출은 밝기 변화를 기준으로 동작하므로 색 정보가 필요 없습니다.
  explanation: |-
    \`cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)\` 가 표준 변환입니다. sklearn 이미지는 RGB이므로 RGB2GRAY 코드를 사용합니다.

    Harris와 goodFeaturesToTrack 모두 그레이 이미지를 입력으로 받습니다. 컬러를 그대로 넣으면 잘못된 결과가 나옵니다.
  tips:
  - OpenCV의 색공간 변환 상수는 입력 → 출력 형식입니다. RGB2GRAY는 RGB 입력에서 그레이 출력이라는 의미입니다.
  snippet: |-
    import cv2
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.datasets import load_sample_image

    china = load_sample_image('china.jpg')
    gray = cv2.cvtColor(china, cv2.COLOR_RGB2GRAY)
    gray.shape, gray.dtype
  exercise:
    prompt: flower 이미지도 같은 방식으로 그레이로 만들고 shape을 확인하세요.
    starterCode: |-
      flower = load_sample_image('flower.jpg')
      flowerGray = cv2.cvtColor(flower, ___)
      flowerGray.shape
    hints:
    - 빈칸에는 cv2.COLOR_RGB2GRAY가 들어갑니다.
    - 결과는 2차원 ndarray가 됩니다.
  check:
    noError: 색공간 변환이 오류 없이 끝나야 합니다.
    resultCheck: gray.ndim 이 2이고 dtype이 uint8이어야 합니다.
- id: harris
  title: 2단계. Harris 코너 점수
  structuredPrimary: true
  subtitle: 픽셀별 코너 정도
  goal: cv2.cornerHarris로 모든 픽셀의 코너 점수를 한 번에 계산합니다.
  why: Harris는 코너 검출의 원조 알고리즘이며 내부 동작이 직관적입니다.
  explanation: |-
    \`cv2.cornerHarris(gray, blockSize, ksize, k)\` 는 각 픽셀의 Harris 응답값을 계산합니다. blockSize는 코너를 검출할 이웃 크기, ksize는 미분 커널 크기, k는 식의 가중치(보통 0.04)입니다.

    출력 값이 큰 위치가 코너입니다. 단순히 임곗값으로 마스크를 만들면 코너 영역이 보입니다.
  tips:
  - Harris 응답은 픽셀별 점수일 뿐 좌표 리스트가 아닙니다. 좌표가 필요하면 numpy where로 추출하거나 goodFeaturesToTrack을 씁니다.
  snippet: |-
    harrisResponse = cv2.cornerHarris(gray, blockSize=2, ksize=3, k=0.04)
    harrisResponse.shape, harrisResponse.dtype, harrisResponse.max()
  exercise:
    prompt: Harris 응답 중 상위 0.5% 영역만 보이는 마스크 harrisMask를 만드세요(percentile 99.5 기준).
    starterCode: |-
      thresh = np.percentile(harrisResponse, ___)
      harrisMask = (harrisResponse > thresh).astype(np.uint8) * 255
      harrisMask.sum() / 255
    hints:
    - 상위 0.5% 는 percentile 99.5 입니다.
    - sum / 255 는 마스크에 포함된 픽셀 개수입니다.
  check:
    noError: cornerHarris와 percentile이 오류 없이 끝나야 합니다.
    resultCheck: harrisResponse가 (높이, 너비) shape의 float 배열이어야 합니다.
- id: good_features
  title: 3단계. goodFeaturesToTrack
  structuredPrimary: true
  subtitle: 최적화된 코너 N개
  goal: cv2.goodFeaturesToTrack으로 코너 N개의 좌표를 직접 받습니다.
  why: Harris와 달리 좌표 리스트를 바로 받을 수 있어 매칭이나 트래킹 입력으로 쓰기 편합니다.
  explanation: |-
    \`cv2.goodFeaturesToTrack(gray, maxCorners, qualityLevel, minDistance)\` 는 강한 코너 N개를 (N, 1, 2) 모양의 float32 배열로 반환합니다. 각 점은 \`[x, y]\` 입니다.

    qualityLevel은 0~1의 상대 임곗값이고 minDistance는 코너 사이 최소 거리입니다. 결과 형식이 OpenCV의 다른 함수(cv2.calcOpticalFlowPyrLK)와 호환되어 트래킹에 그대로 들어갑니다.
  tips:
  - 좌표 형식이 (N, 1, 2)인 점에 주의하세요. 일반 좌표 (N, 2)로 쓰려면 .reshape(-1, 2)로 변환합니다.
  snippet: |-
    corners = cv2.goodFeaturesToTrack(gray, maxCorners=100, qualityLevel=0.01, minDistance=10)
    corners.shape, corners.dtype
  exercise:
    prompt: maxCorners를 30, qualityLevel을 0.05로 바꿔 더 강한 코너만 얻은 strongCorners를 만드세요.
    starterCode: |-
      strongCorners = cv2.goodFeaturesToTrack(gray, maxCorners=___, qualityLevel=___, minDistance=10)
      strongCorners.shape
    hints:
    - qualityLevel을 높이면 약한 코너가 걸러져 코너 수가 줄어듭니다.
    - shape의 첫 번째 차원이 줄어든 코너 개수입니다.
  check:
    noError: goodFeaturesToTrack 호출이 오류 없이 끝나야 합니다.
    resultCheck: corners.shape의 마지막 차원이 2여야 합니다.
- id: draw_corners
  title: 4단계. 코너 시각화
  structuredPrimary: true
  subtitle: 원본 위에 점 표시
  goal: 검출한 코너 좌표를 원본 이미지 위에 그립니다.
  why: 검출 품질은 그림으로 봐야 빠르게 판단됩니다.
  explanation: |-
    matplotlib의 \`scatter\` 로 코너 좌표를 점으로 그립니다. 각 점은 (x, y) 순이며 scatter 인자도 (x, y) 입니다. numpy 인덱스 (y, x) 와 헷갈리지 말아야 합니다.

    OpenCV의 \`cv2.circle(img, (x, y), radius, color, thickness)\` 로 이미지에 직접 그릴 수도 있지만, 시각화만 한다면 matplotlib이 더 간단합니다.
  tips:
  - scatter의 s 인자는 점 크기, c 인자는 색상입니다.
  snippet: |-
    points = corners.reshape(-1, 2)
    fig = plt.figure(figsize=(7, 5))
    plt.imshow(china)
    plt.scatter(points[:, 0], points[:, 1], s=15, c='lime', edgecolors='black')
    plt.title(f'{len(points)} corners')
    plt.axis('off')
    fig
  exercise:
    prompt: strongCorners를 빨강으로 그리고 일반 corners를 노랑으로 그려 한 화면에 비교하세요.
    starterCode: |-
      strongPoints = strongCorners.reshape(-1, 2)
      fig2 = plt.figure(figsize=(7, 5))
      plt.imshow(china)
      plt.scatter(points[:, 0], points[:, 1], s=10, c='yellow')
      plt.scatter(strongPoints[:, 0], strongPoints[:, 1], s=30, c='___')
      plt.axis('off')
      fig2
    hints:
    - 강한 코너가 약한 코너 위에 더 큰 점으로 보여야 비교가 쉽습니다.
    - 색 문자열은 'red'입니다.
  check:
    noError: scatter 호출이 오류 없이 끝나야 합니다.
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.
- id: tune
  title: 5단계. 매개변수 튜닝
  structuredPrimary: true
  subtitle: minDistance가 만드는 분포 차이
  goal: minDistance 매개변수가 코너 분포에 미치는 영향을 직접 비교합니다.
  why: minDistance를 작게 두면 한 영역에 점이 몰리고, 크게 두면 흩어집니다. 응용에 따라 적절히 골라야 합니다.
  explanation: |-
    minDistance가 5인 검출은 강한 영역에 점이 몰립니다. 50으로 두면 균등 분포에 가깝게 흩어집니다. 트래킹용으로는 흩어진 코너가 좋고, 강한 매칭용으로는 몰린 코너가 유리합니다.
  tips:
  - 매개변수 비교는 항상 같은 이미지로, 한 변수만 바꿔서 해야 효과가 분명히 보입니다.
  snippet: |-
    closeCorners = cv2.goodFeaturesToTrack(gray, maxCorners=100, qualityLevel=0.01, minDistance=5)
    farCorners = cv2.goodFeaturesToTrack(gray, maxCorners=100, qualityLevel=0.01, minDistance=50)
    closeCorners.shape, farCorners.shape
  exercise:
    prompt: 두 결과를 1x2 서브플롯으로 나란히 그리고 점 개수를 타이틀에 표시하세요.
    starterCode: |-
      fig, axes = plt.subplots(1, 2, figsize=(12, 5))
      for axis, label, pts in zip(axes, ['min=5', 'min=50'], [closeCorners, farCorners]):
          arr = pts.reshape(___, 2)
          axis.imshow(china)
          axis.scatter(arr[:, 0], arr[:, 1], s=20, c='cyan', edgecolors='black')
          axis.set_title(f'{label} ({len(arr)})')
          axis.axis('off')
      fig
    hints:
    - reshape(-1, 2) 가 표준 패턴입니다.
    - 작은 minDistance에서 점이 강한 영역에 몰립니다.
  check:
    noError: 두 호출과 시각화가 오류 없이 끝나야 합니다.
    resultCheck: farCorners의 점 개수가 closeCorners보다 같거나 적어야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 코너 검출 비교 보고서
  goal: 두 이미지의 코너를 검출해 비교 보고서를 만듭니다.
  why: 같은 알고리즘이 다른 이미지에서 어떻게 다른지 보면 알고리즘의 한계와 강점이 보입니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 실험 코드를 만들 때는 매개변수를 한 곳에 모아 두면 다른 미션에서 재사용이 쉬워집니다.
  snippet: |-
    flower = load_sample_image('flower.jpg')
    chinaCorners = cv2.goodFeaturesToTrack(gray, maxCorners=80, qualityLevel=0.02, minDistance=15)
    flowerGray = cv2.cvtColor(flower, cv2.COLOR_RGB2GRAY)
    flowerCorners = cv2.goodFeaturesToTrack(flowerGray, maxCorners=80, qualityLevel=0.02, minDistance=15)
    chinaCorners.shape, flowerCorners.shape
  exercise:
    prompt: "미션1: china와 flower의 코너를 1x2 그리드로 그리고 각 사진의 점 개수를 타이틀에 표시하세요. 미션2: china를 90도 회전한 rotated 이미지(np.rot90)에 같은 매개변수를 적용해 코너 수가 비슷한지 비교하세요."
    starterCode: |-
      fig, axes = plt.subplots(1, 2, figsize=(12, 5))
      for axis, label, baseImg, baseGray, pts in [
          (axes[0], 'china', china, gray, chinaCorners),
          (axes[1], 'flower', flower, flowerGray, flowerCorners),
      ]:
          arr = pts.reshape(-1, 2)
          axis.imshow(baseImg)
          axis.scatter(arr[:, 0], arr[:, 1], s=18, c='magenta', edgecolors='black')
          axis.set_title(f'{label} ({len(arr)})')
          axis.axis('off')
      fig
    hints:
    - np.rot90으로 90도 회전된 이미지에서 코너가 비슷한 위치(상대적으로)에 나오는지 확인하세요.
    - 회전 후 좌표는 변환되지만 코너의 강도는 비슷합니다.
  check:
    noError: 두 호출과 시각화가 오류 없이 끝나야 합니다.
    resultCheck: 두 결과 모두 0개 이상의 코너가 검출되어야 합니다.
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
  - id: visionFeatures_01-corner_detection-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - gray_input
    - practice
    title: 코너 검출 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: max corner·quality·minimum distance 계약을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_corner_detection_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_corner_detection_contract(value):
            raise NotImplementedError
      solution: |
        def audit_corner_detection_contract(value):
            required = ['maxCorners', 'qualityLevel', 'minDistance', 'blockSize']
            rules = [{'id': 'max-corners', 'field': 'maxCorners', 'kind': 'range', 'min': 1, 'max': 10000}, {'id': 'quality', 'field': 'qualityLevel', 'kind': 'unit-interval'}, {'id': 'distance', 'field': 'minDistance', 'kind': 'positive'}, {'id': 'block', 'field': 'blockSize', 'kind': 'odd'}]
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
            return {"accepted": not missing and not violations, "topic": 'corner_detection', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.vision-features.visionFeatures_01.corner_detection-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_01.corner_detection-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_corner_detection_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              maxCorners: 500
              qualityLevel: 0.01
              minDistance: 10
              blockSize: 3
          expectedReturn:
            accepted: true
            topic: corner_detection
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              qualityLevel: 0.01
              minDistance: 10
              blockSize: 3
          expectedReturn:
            accepted: false
            topic: corner_detection
            missing:
            - maxCorners
            violations:
            - max-corners
        - id: reports-topic-invariants
          arguments:
          - value:
              maxCorners: 0
              qualityLevel: 1.5
              minDistance: 0
              blockSize: 4
          expectedReturn:
            accepted: false
            topic: corner_detection
            missing: []
            violations:
            - block
            - distance
            - max-corners
            - quality
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: visionFeatures_01-corner_detection-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionFeatures_01-corner_detection-contract-audit-mastery
    title: 코너 검출 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_corner_detection_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_corner_detection_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_corner_detection_result(expected, observed):
            identity = ['sourceHash', 'detectorHash']
            metrics = {'cornerCount': 2}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'corner_detection', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.vision-features.visionFeatures_01.corner_detection-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_01.corner_detection-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_corner_detection_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: k1
              detectorHash: gftt-a
              cornerCount: 120
          - value:
              sourceHash: k1
              detectorHash: gftt-a
              cornerCount: 121
          expectedReturn:
            passed: true
            topic: corner_detection
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: k1
              detectorHash: gftt-a
              cornerCount: 120
          - value:
              sourceHash: k2
              detectorHash: bad
              cornerCount: 900
          expectedReturn:
            passed: false
            topic: corner_detection
            missing: []
            identityMismatch:
            - detectorHash
            - sourceHash
            metricDrift:
            - cornerCount
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: k1
              detectorHash: gftt-a
              cornerCount: 120
          - value: {}
          expectedReturn:
            passed: false
            topic: corner_detection
            missing:
            - cornerCount
            - detectorHash
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: visionFeatures_01-corner_detection-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionFeatures_01-corner_detection-result-reconciliation-transfer
    title: 코너 검출 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_corner_detection_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_corner_detection_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_corner_detection_evidence(stage):
            stages = {'source': {'action': 'validate corner frames', 'evidence': 'gray frame and ROI', 'risk': 'wrong frame identity'}, 'estimate': {'action': 'estimate bounded corner', 'evidence': 'corner score parameters', 'risk': 'unstable geometry'}, 'verify': {'action': 'verify corner result', 'evidence': 'count and spatial coverage', 'risk': 'confident but wrong tracking'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.vision-features.visionFeatures_01.corner_detection-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_01.corner_detection-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_corner_detection_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate corner frames
            evidence: gray frame and ROI
            risk: wrong frame identity
        - id: recalls-estimate
          arguments:
          - value: estimate
          expectedReturn:
            action: estimate bounded corner
            evidence: corner score parameters
            risk: unstable geometry
        - id: recalls-verify
          arguments:
          - value: verify
          expectedReturn:
            action: verify corner result
            evidence: count and spatial coverage
            risk: confident but wrong tracking
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};