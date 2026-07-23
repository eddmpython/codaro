var e=`meta:
  id: visionFeatures_03
  title: 특징점 매칭
  order: 3
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
  - 매칭
  - BFMatcher
  - knnMatch
  - Lowe
  seo:
    title: 비전 특징점 - 특징점 매칭
    description: BFMatcher와 Lowe ratio test로 두 사진의 같은 점을 짝지웁니다.
    keywords:
    - 특징점매칭
    - BFMatcher
    - knnMatch
    - Lowe
    - opencv
intro:
  emoji: 🔗
  goal: 두 사진의 같은 부위를 잇는 매칭 한 줄을 익히고 Lowe 비율 테스트로 잘못된 매칭을 거릅니다.
  description: |-
    같은 풍경을 다른 각도에서 찍은 두 사진의 같은 점을 짝짓는 것이 특징점 매칭입니다. 이 강의는 ORB 디스크립터를 이용해 두 이미지 간 매칭을 수행하고, Lowe ratio test로 잘못된 매칭을 자동으로 제거하는 표준 패턴을 학습합니다.
  direction: 두 이미지에서 ORB 디스크립터를 추출하고 매칭, 정렬, 필터링까지의 흐름을 한 셀씩 실행합니다.
  benefits:
  - cv2.BFMatcher의 match와 knnMatch 차이를 이해합니다.
  - Lowe ratio test로 잘못된 매칭을 자동으로 거릅니다.
  - cv2.drawMatches로 매칭 결과를 시각적으로 검증할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 매칭용 이미지 쌍 만들기
      detail: 같은 사진을 살짝 다른 변환으로 두 장 준비합니다.
    - label: 2단계. BFMatcher로 1대1 매칭
      detail: match 한 번에 최근접 짝을 얻습니다.
    - label: 3단계. 거리 기반 정렬과 시각화
      detail: 짧은 거리 매칭부터 그립니다.
    - label: 4단계. knnMatch와 Lowe ratio
      detail: 1, 2위 매칭의 비율로 잘못된 짝을 거릅니다.
    - label: 5단계. 매칭 통계
      detail: 매칭 개수와 거리 분포를 정리합니다.
    runtime:
    - label: 비전 환경
      detail: opencv-python ORB와 BFMatcher만으로 학습합니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: prepare_pair
  title: 1단계. 매칭용 이미지 쌍 만들기
  structuredPrimary: true
  subtitle: 합성으로 변환 쌍 만들기
  goal: 같은 이미지에 살짝 다른 변환을 적용해 매칭 학습용 쌍을 만듭니다.
  why: 실험을 통제하려면 알려진 변환을 적용한 이미지 쌍이 가장 깔끔합니다.
  explanation: |-
    원본과, 원본을 15도 회전하고 평행 이동한 두 번째 이미지를 만듭니다. \`cv2.getRotationMatrix2D\` + \`cv2.warpAffine\` 한 줄이면 됩니다.

    이렇게 만든 쌍은 정답(true 변환)을 우리가 알고 있으므로, 매칭이 얼마나 정확한지 검증하기 좋습니다.
  tips:
  - 회전 각도와 이동량을 너무 크게 잡으면 ORB가 같은 부위를 찾지 못합니다. 15도 정도가 학습용으로 적당합니다.
  snippet: |-
    import cv2
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.datasets import load_sample_image

    china = load_sample_image('china.jpg')
    h, w = china.shape[:2]
    rotMat = cv2.getRotationMatrix2D((w / 2, h / 2), angle=15, scale=1.0)
    rotMat[:, 2] += [20, -10]
    warped = cv2.warpAffine(china, rotMat, (w, h))
    warped.shape
  exercise:
    prompt: 회전 각도를 30도로 바꾼 hardWarped를 만들고 두 이미지를 1x2 그리드로 비교 출력하세요.
    starterCode: |-
      hardMat = cv2.getRotationMatrix2D((w / 2, h / 2), angle=___, scale=1.0)
      hardWarped = cv2.warpAffine(china, hardMat, (w, h))
      fig, axes = plt.subplots(1, 2, figsize=(12, 5))
      axes[0].imshow(china)
      axes[0].set_title('original')
      axes[1].imshow(hardWarped)
      axes[1].set_title('rotated 30')
      for axis in axes:
          axis.axis('off')
      fig
    hints:
    - 빈칸은 정수입니다.
    - 회전 각이 크면 가장자리에 검정 영역이 더 많이 생깁니다.
  check:
    noError: warpAffine과 시각화가 오류 없이 끝나야 합니다.
    resultCheck: warped.shape 이 china.shape 와 같아야 합니다.
- id: brute_force_match
  title: 2단계. BFMatcher로 1대1 매칭
  structuredPrimary: true
  subtitle: 가장 단순한 매칭기
  goal: cv2.BFMatcher의 match로 모든 키포인트에 대해 가장 가까운 짝을 찾습니다.
  why: 매칭 알고리즘의 기준선이며 동작이 직관적이라 결과 해석이 쉽습니다.
  explanation: |-
    \`cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)\` 는 ORB 디스크립터에 적합한 매칭기입니다. NORM_HAMMING은 비트 차이 거리이고 crossCheck=True는 양방향으로 최근접인 짝만 받아 잘못된 매칭을 줄입니다.

    \`match(desc1, desc2)\` 는 \`cv2.DMatch\` 객체 리스트를 반환합니다. 각 객체는 \`.queryIdx\`, \`.trainIdx\`, \`.distance\` 를 가집니다.
  tips:
  - 거리가 작을수록 좋은 매칭입니다. distance 정렬로 상위 N개만 사용하는 패턴이 자주 쓰입니다.
  snippet: |-
    orb = cv2.ORB_create(nfeatures=500)
    grayA = cv2.cvtColor(china, cv2.COLOR_RGB2GRAY)
    grayB = cv2.cvtColor(warped, cv2.COLOR_RGB2GRAY)
    kpA, descA = orb.detectAndCompute(grayA, mask=None)
    kpB, descB = orb.detectAndCompute(grayB, mask=None)
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(descA, descB)
    len(matches), matches[0].distance
  exercise:
    prompt: hardWarped와 china의 매칭 hardMatches를 같은 방식으로 만들고 매칭 개수를 비교하세요.
    starterCode: |-
      grayHard = cv2.cvtColor(hardWarped, ___)
      kpHard, descHard = orb.detectAndCompute(grayHard, mask=None)
      hardMatches = bf.match(descA, descHard)
      len(matches), len(___)
    hints:
    - 변환이 클수록 매칭이 줄어듭니다.
    - 빈칸은 변수명입니다.
  check:
    noError: BFMatcher.match가 오류 없이 끝나야 합니다.
    resultCheck: len(matches) 가 0보다 커야 합니다.
- id: sort_and_draw
  title: 3단계. 거리 정렬과 시각화
  structuredPrimary: true
  subtitle: 가장 좋은 N개 보기
  goal: 매칭을 distance로 정렬한 뒤 상위 N개를 cv2.drawMatches로 그립니다.
  why: 매칭의 품질은 보지 않고는 평가할 수 없습니다. 그림이 가장 빠른 검증입니다.
  explanation: |-
    매칭을 거리 오름차순으로 정렬한 뒤 \`cv2.drawMatches(imgA, kpA, imgB, kpB, matches, None)\` 로 두 이미지를 가로로 붙여 짝을 선으로 잇습니다.

    좋은 매칭은 두 이미지의 같은 객체 부위를 짧고 평행한 선들로 잇습니다. 선들이 무작위 방향이면 매칭이 잘못된 것입니다.
  tips:
  - drawMatches의 결과는 BGR이지만 imshow에서 컬러 차이가 미세해 시각화에 큰 영향은 없습니다.
  snippet: |-
    sortedMatches = sorted(matches, key=lambda m: m.distance)
    top = sortedMatches[:40]
    drawn = cv2.drawMatches(china, kpA, warped, kpB, top, None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
    fig = plt.figure(figsize=(12, 5))
    plt.imshow(drawn)
    plt.axis('off')
    fig
  exercise:
    prompt: 상위 100개와 하위 100개 매칭을 1x2 그리드로 시각화해 거리 차이가 시각적으로 어떻게 나타나는지 확인하세요.
    starterCode: |-
      drawnTop = cv2.drawMatches(china, kpA, warped, kpB, sortedMatches[:100], None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
      drawnBottom = cv2.drawMatches(china, kpA, warped, kpB, sortedMatches[___:], None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
      fig, axes = plt.subplots(2, 1, figsize=(12, 8))
      axes[0].imshow(drawnTop)
      axes[0].set_title('top 100')
      axes[1].imshow(drawnBottom)
      axes[1].set_title('bottom 100')
      for axis in axes:
          axis.axis('off')
      fig
    hints:
    - "-100을 빈칸에 넣으면 하위 100개가 됩니다."
    - 하위 매칭은 선이 사방으로 흩어져 보입니다.
  check:
    noError: 정렬과 drawMatches가 오류 없이 끝나야 합니다.
    resultCheck: drawn.shape이 (높이, 너비*2 정도, 3) 형태여야 합니다.
- id: knn_lowe
  title: 4단계. knnMatch와 Lowe ratio
  structuredPrimary: true
  subtitle: 두 후보로 잘못된 매칭 거르기
  goal: knnMatch로 1위, 2위 후보를 동시에 받고 비율로 잘못된 매칭을 거릅니다.
  why: crossCheck보다 정밀하게 잘못된 매칭을 거를 수 있는 표준 패턴입니다.
  explanation: |-
    \`bf.knnMatch(descA, descB, k=2)\` 는 각 키포인트의 1위, 2위 매칭을 동시에 반환합니다. 두 거리 비가 \`m1.distance < 0.75 * m2.distance\` 면 1위가 충분히 두드러진 좋은 매칭이라고 판단합니다(Lowe ratio test).

    임곗값 0.75는 D. Lowe의 SIFT 논문에서 제안된 값이며 ORB에도 흔히 그대로 씁니다.
  tips:
  - knnMatch와 ratio test는 영상 매칭 거의 모든 파이프라인에서 표준입니다.
  snippet: |-
    bfNoCross = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    knn = bfNoCross.knnMatch(descA, descB, k=2)
    goodPairs = [m1 for m1, m2 in knn if m1.distance < 0.75 * m2.distance]
    len(knn), len(goodPairs)
  exercise:
    prompt: 임곗값을 0.6과 0.9로 각각 적용해 골라진 매칭 수를 비교하세요.
    starterCode: |-
      strict = [m1 for m1, m2 in knn if m1.distance < ___ * m2.distance]
      loose = [m1 for m1, m2 in knn if m1.distance < ___ * m2.distance]
      len(strict), len(loose), len(goodPairs)
    hints:
    - 0.6은 엄격, 0.9는 느슨한 기준입니다.
    - 엄격할수록 좋은 매칭만 남아 개수가 줄어듭니다.
  check:
    noError: knnMatch와 비율 필터가 오류 없이 끝나야 합니다.
    resultCheck: len(strict) 가 len(loose) 보다 적어야 합니다.
- id: stats
  title: 5단계. 매칭 통계와 시각화
  structuredPrimary: true
  subtitle: 거리 분포 보기
  goal: 매칭 거리 분포를 히스토그램으로 그리고 좋은/나쁜 매칭의 경계를 시각화합니다.
  why: 매칭 거리 분포를 보면 다음 단계의 임곗값을 데이터 기반으로 정할 수 있습니다.
  explanation: |-
    매칭 거리는 보통 두 산을 가진 분포가 됩니다. 왼쪽 산은 좋은 매칭, 오른쪽 산은 잘못된 매칭입니다. 두 산 사이의 골이 자연스러운 임곗값 후보입니다.
  tips:
  - 분포가 한 산뿐이면 매칭이 거의 다 좋거나(쉬운 쌍) 거의 다 나쁘다(어려운 쌍)는 의미입니다.
  snippet: |-
    distances = np.array([m.distance for m in matches])
    fig = plt.figure(figsize=(7, 4))
    plt.hist(distances, bins=30, color='steelblue')
    plt.title('match distance distribution')
    plt.xlabel('hamming distance')
    plt.ylabel('count')
    fig
  exercise:
    prompt: 좋은 매칭(goodPairs)과 전체 매칭의 거리 분포를 같은 차트에 비교 출력하세요.
    starterCode: |-
      goodDistances = np.array([m.distance for m in goodPairs])
      fig2 = plt.figure(figsize=(7, 4))
      plt.hist(distances, bins=30, alpha=0.4, label='all', color='gray')
      plt.hist(goodDistances, bins=30, alpha=0.6, label='good', color='___')
      plt.legend()
      plt.xlabel('hamming distance')
      fig2
    hints:
    - "색은 'green' 정도가 무난합니다."
    - 좋은 매칭은 거리 분포의 왼쪽에 모여야 합니다.
  check:
    noError: 통계와 히스토그램이 오류 없이 끝나야 합니다.
    resultCheck: distances의 평균이 goodDistances의 평균보다 같거나 커야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 매칭 평가 비교
  goal: 두 변환(쉬움/어려움)에서 매칭 품질을 비교합니다.
  why: 같은 알고리즘이 변환 강도에 따라 얼마나 다른 결과를 내는지 확인하면 알고리즘의 적용 한계를 가늠하게 됩니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 비교 실험을 자주 만들수록 알고리즘을 제대로 선택할 수 있습니다.
  snippet: |-
    hardMat = cv2.getRotationMatrix2D((w / 2, h / 2), angle=30, scale=1.0)
    hardWarped = cv2.warpAffine(china, hardMat, (w, h))
    grayHard = cv2.cvtColor(hardWarped, cv2.COLOR_RGB2GRAY)
    kpHard, descHard = orb.detectAndCompute(grayHard, mask=None)

    bfTest = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    easyKnn = bfTest.knnMatch(descA, descB, k=2)
    hardKnn = bfTest.knnMatch(descA, descHard, k=2)
    easyGood = [m1 for m1, m2 in easyKnn if m1.distance < 0.75 * m2.distance]
    hardGood = [m1 for m1, m2 in hardKnn if m1.distance < 0.75 * m2.distance]
    {"easy_good": len(easyGood), "hard_good": len(hardGood)}
  exercise:
    prompt: "미션1: 쉬운 변환과 어려운 변환의 매칭 결과를 1x2 그리드로 drawMatches 시각화하세요. 미션2: 좋은 매칭의 비율(좋은/전체) 을 두 변환에 대해 비교 출력하세요."
    starterCode: |-
      drawnEasy = cv2.drawMatches(china, kpA, warped, kpB, easyGood[:40], None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
      drawnHard = cv2.drawMatches(china, kpA, hardWarped, kpHard, hardGood[:40], None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
      fig, axes = plt.subplots(2, 1, figsize=(12, 8))
      axes[0].imshow(drawnEasy)
      axes[0].set_title('easy (15deg)')
      axes[1].imshow(drawnHard)
      axes[1].set_title('hard (30deg)')
      for axis in axes:
          axis.axis('off')
      fig
    hints:
    - 어려운 변환에서 매칭이 줄어들고 선이 더 흩어집니다.
    - "비율은 len(good) / len(all_knn) 한 줄로 구합니다."
  check:
    noError: 두 시각화가 오류 없이 끝나야 합니다.
    resultCheck: len(easyGood)이 len(hardGood)보다 같거나 커야 합니다.
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
  - id: visionFeatures_03-feature_matching-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - prepare_pair
    - practice
    title: 특징점 매칭 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: descriptor norm·ratio test·cross-check 계약을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_feature_matching_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_feature_matching_contract(value):
            raise NotImplementedError
      solution: |
        def audit_feature_matching_contract(value):
            required = ['norm', 'ratioThreshold', 'crossCheck', 'maxMatches']
            rules = [{'id': 'norm', 'field': 'norm', 'kind': 'enum', 'values': ['hamming', 'l2']}, {'id': 'ratio', 'field': 'ratioThreshold', 'kind': 'unit-interval'}, {'id': 'cross-check', 'field': 'crossCheck', 'kind': 'enum', 'values': [True, False]}, {'id': 'max-matches', 'field': 'maxMatches', 'kind': 'range', 'min': 1, 'max': 10000}]
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
            return {"accepted": not missing and not violations, "topic": 'feature_matching', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.vision-features.visionFeatures_03.feature_matching-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_03.feature_matching-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_feature_matching_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              norm: hamming
              ratioThreshold: 0.75
              crossCheck: false
              maxMatches: 500
          expectedReturn:
            accepted: true
            topic: feature_matching
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              ratioThreshold: 0.75
              crossCheck: false
              maxMatches: 500
          expectedReturn:
            accepted: false
            topic: feature_matching
            missing:
            - norm
            violations:
            - norm
        - id: reports-topic-invariants
          arguments:
          - value:
              norm: cosine
              ratioThreshold: 1.5
              crossCheck: 'yes'
              maxMatches: 0
          expectedReturn:
            accepted: false
            topic: feature_matching
            missing: []
            violations:
            - cross-check
            - max-matches
            - norm
            - ratio
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: visionFeatures_03-feature_matching-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionFeatures_03-feature_matching-contract-audit-mastery
    title: 특징점 매칭 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_feature_matching_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_feature_matching_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_feature_matching_result(expected, observed):
            identity = ['queryHash', 'trainHash']
            metrics = {'inlierRatio': 0.01}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'feature_matching', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.vision-features.visionFeatures_03.feature_matching-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_03.feature_matching-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_feature_matching_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              queryHash: q1
              trainHash: t1
              inlierRatio: 0.7
          - value:
              queryHash: q1
              trainHash: t1
              inlierRatio: 0.705
          expectedReturn:
            passed: true
            topic: feature_matching
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              queryHash: q1
              trainHash: t1
              inlierRatio: 0.7
          - value:
              queryHash: q2
              trainHash: t2
              inlierRatio: 0.2
          expectedReturn:
            passed: false
            topic: feature_matching
            missing: []
            identityMismatch:
            - queryHash
            - trainHash
            metricDrift:
            - inlierRatio
        - id: reports-missing-result-fields
          arguments:
          - value:
              queryHash: q1
              trainHash: t1
              inlierRatio: 0.7
          - value: {}
          expectedReturn:
            passed: false
            topic: feature_matching
            missing:
            - inlierRatio
            - queryHash
            - trainHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: visionFeatures_03-feature_matching-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionFeatures_03-feature_matching-result-reconciliation-transfer
    title: 특징점 매칭 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_feature_matching_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_feature_matching_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_feature_matching_evidence(stage):
            stages = {'source': {'action': 'validate feature match frames', 'evidence': 'descriptor identity and type', 'risk': 'wrong frame identity'}, 'estimate': {'action': 'estimate bounded feature match', 'evidence': 'ratio and symmetry trace', 'risk': 'unstable geometry'}, 'verify': {'action': 'verify feature match result', 'evidence': 'inlier ratio and match overlay', 'risk': 'confident but wrong tracking'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.vision-features.visionFeatures_03.feature_matching-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_03.feature_matching-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_feature_matching_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate feature match frames
            evidence: descriptor identity and type
            risk: wrong frame identity
        - id: recalls-estimate
          arguments:
          - value: estimate
          expectedReturn:
            action: estimate bounded feature match
            evidence: ratio and symmetry trace
            risk: unstable geometry
        - id: recalls-verify
          arguments:
          - value: verify
          expectedReturn:
            action: verify feature match result
            evidence: inlier ratio and match overlay
            risk: confident but wrong tracking
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};