var e=`meta:
  id: visionBasics_08
  title: 마스크 사고
  order: 8
  category: visionBasics
  difficulty: ⭐⭐⭐
  badge: 기초
  packages:
  - matplotlib
  - numpy
  - scikit-learn
  tags:
  - numpy
  - 마스크
  - bool배열
  - where
  - 합성
  seo:
    title: 이미지 비전 기초 - 마스크 사고
    description: bool 배열을 마스크로 써서 영역별 처리, 합성, 색 추출을 한 줄로 다룹니다.
    keywords:
    - 마스크
    - bool배열
    - numpy
    - where
    - 합성
intro:
  emoji: 🎭
  goal: bool 배열을 이미지 처리의 일등 시민으로 다루는 사고 패턴을 익힙니다.
  description: |-
    "특정 색만 남기고 나머지는 검정으로", "관심 영역만 어둡게", "두 사진을 마스크 모양대로 섞기" - 이 모든 작업은 마스크 한 장이면 충분합니다. 이 강의는 bool 배열을 만드는 다양한 방법과, 마스크로 이미지를 자르고 합치는 패턴을 정리합니다.
  direction: bool 배열을 만들고 적용하며 이미지 처리에서 마스크가 가장 자주 쓰이는 도구라는 점을 체화합니다.
  benefits:
  - 조건식 한 줄로 마스크를 만들 수 있습니다.
  - np.where와 마스크 인덱싱의 차이를 이해하고 적재적소에 씁니다.
  - 두 이미지를 마스크 모양대로 합성할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 조건으로 마스크 만들기
      detail: 부등식 한 줄로 bool 배열을 얻습니다.
    - label: 2단계. 마스크로 픽셀 골라내기
      detail: 마스크가 True인 픽셀만 가져옵니다.
    - label: 3단계. 마스크에 값 대입
      detail: 마스크 영역만 값으로 바꿉니다.
    - label: 4단계. np.where 합성
      detail: 조건에 따라 두 이미지를 섞습니다.
    - label: 5단계. 도형 마스크
      detail: 원·사각형 마스크를 직접 그립니다.
    runtime:
    - label: numpy 환경
      detail: numpy의 bool 연산과 인덱싱이 학습 핵심입니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: condition_mask
  title: 1단계. 조건으로 마스크 만들기
  structuredPrimary: true
  subtitle: 부등식이 곧 bool 배열
  goal: 이미지에 부등식을 적용해 마스크 한 장을 만듭니다.
  why: 마스크의 출발은 조건식입니다. 한 줄로 만들 수 있다는 사실이 가장 중요합니다.
  explanation: |-
    \`img > 100\` 같은 부등식은 같은 모양의 bool 배열을 만듭니다. 컬러 이미지에 직접 적용하면 채널별로 비교가 일어나 결과도 컬러 모양 bool 배열이 됩니다. 보통은 흑백 변환 후 부등식을 적용합니다.

    여러 조건을 조합할 때는 \`&\`(and), \`|\`(or), \`~\`(not) 을 사용합니다. 파이썬의 \`and\`, \`or\` 가 아니라 비트 연산자임에 주의합니다.
  tips:
  - bool 배열의 sum은 True 개수, mean은 True 비율입니다. 마스크 통계로 즉시 활용할 수 있습니다.
  snippet: |-
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.datasets import load_sample_image

    china = load_sample_image('china.jpg')
    gray = (china.astype(np.float32) * np.array([0.299, 0.587, 0.114])).sum(axis=2).astype(np.uint8)
    brightMask = gray > 180
    brightMask.sum(), brightMask.mean()
  exercise:
    prompt: 어두운 픽셀 마스크 darkMask를 만드세요(gray < 60).
    starterCode: |-
      darkMask = gray ___ 60
      darkMask.sum()
    hints:
    - "<는 미만, <=는 이하입니다."
    - 어두운 픽셀이 적을수록 결과가 작습니다.
  check:
    noError: 부등식과 sum이 오류 없이 끝나야 합니다.
    resultCheck: darkMask가 (높이, 너비) shape의 bool 배열이어야 합니다.
- id: mask_select
  title: 2단계. 마스크로 픽셀 골라내기
  structuredPrimary: true
  subtitle: 1차원으로 펴진 픽셀 모음
  goal: 마스크로 True인 위치의 픽셀만 모아 새 배열로 만듭니다.
  why: 통계나 분포 분석을 할 때는 위치보다 값들 자체가 중요할 때가 많습니다.
  explanation: |-
    \`gray[brightMask]\` 는 True 위치의 픽셀들을 1차원 배열로 펴서 반환합니다. 이미지의 위치 정보는 사라지지만, 값들의 평균·표준편차·히스토그램 계산이 쉬워집니다.

    컬러 이미지에 같은 마스크를 적용하면 결과는 \`(픽셀 개수, 3)\` 모양이 됩니다.
  tips:
  - 위치 정보가 필요하면 np.where(mask) 가 행과 열 인덱스 두 배열을 돌려줍니다.
  snippet: |-
    brightPixels = gray[brightMask]
    brightPixels.shape, brightPixels.mean()
  exercise:
    prompt: 밝은 영역에 해당하는 컬러 픽셀 brightColors를 china에서 추출하고 RGB 평균을 구하세요.
    starterCode: |-
      brightColors = china[___]
      brightColors.shape, brightColors.mean(axis=0)
    hints:
    - 컬러 이미지에 같은 bool 마스크를 그대로 적용해도 됩니다.
    - 결과 shape이 (N, 3)이 됩니다.
  check:
    noError: 마스크 인덱싱이 오류 없이 끝나야 합니다.
    resultCheck: brightColors.shape의 마지막 차원이 3이어야 합니다.
- id: mask_assign
  title: 3단계. 마스크 영역만 값 대입
  structuredPrimary: true
  subtitle: 특정 영역만 다른 색으로
  goal: 마스크가 True인 픽셀에만 새 값을 대입합니다.
  why: 영역별 강조, 마스킹 인페인팅, 한 색만 바꾸기 등의 작업이 모두 이 한 줄입니다.
  explanation: |-
    \`img[mask] = [R, G, B]\` 는 True 위치의 픽셀을 한 색으로 채웁니다. 마스크가 bool 배열이어야 하고, 대입할 값의 shape이 호환되어야 합니다.

    원본 보존이 필요하면 항상 .copy()를 먼저 호출합니다.
  tips:
  - 마스크 대입은 in-place 연산이므로 매우 빠릅니다. 같은 일을 for문으로 하면 수십 배 느립니다.
  snippet: |-
    highlight = china.copy()
    highlight[brightMask] = [255, 0, 255]
    fig = plt.figure(figsize=(5, 4))
    plt.imshow(highlight)
    plt.axis('off')
    fig
  exercise:
    prompt: 어두운 영역을 노란색([255, 220, 0])으로 강조한 darkHighlight를 만드세요.
    starterCode: |-
      darkHighlight = china.copy()
      darkHighlight[darkMask] = [___, ___, ___]
      fig2 = plt.figure(figsize=(5, 4))
      plt.imshow(darkHighlight)
      plt.axis('off')
      fig2
    hints:
    - 노란색은 빨강과 녹색이 큰 값입니다.
    - darkMask는 1단계에서 만든 마스크입니다.
  check:
    noError: 대입과 시각화가 오류 없이 끝나야 합니다.
    resultCheck: darkHighlight[darkMask][0] 이 [255, 220, 0]이어야 합니다.
- id: where_blend
  title: 4단계. np.where로 두 이미지 합성
  structuredPrimary: true
  subtitle: 조건에 따라 다른 픽셀을 고른다
  goal: 마스크 위치에 따라 두 이미지 중 하나의 픽셀을 골라 새 이미지를 만듭니다.
  why: 마스크 모양 그대로 합성하는 패턴은 그린스크린, 합성 사진, 마스크 인페인팅 등에서 표준입니다.
  explanation: |-
    \`np.where(mask, a, b)\` 는 마스크가 True면 a, False면 b의 값을 선택합니다. 마스크가 2차원이고 이미지가 3차원이면 broadcasting을 위해 \`mask[:, :, None]\` 으로 마지막 축을 추가해야 합니다.

    이 한 줄이 두 이미지의 부드러운 합성을 구현합니다. 알파 합성과 다른 점은 마스크가 0/1 두 값만 갖는다는 것입니다.
  tips:
  - "mask[:, :, None] 으로 차원을 늘리면 RGB 채널에 자연스럽게 broadcast됩니다."
  snippet: |-
    flower = load_sample_image('flower.jpg')
    h = min(china.shape[0], flower.shape[0])
    w = min(china.shape[1], flower.shape[1])
    chinaCut = china[:h, :w]
    flowerCut = flower[:h, :w]
    grayCut = gray[:h, :w]
    blendedMask = grayCut > 180
    blended = np.where(blendedMask[:, :, None], chinaCut, flowerCut)
    fig = plt.figure(figsize=(6, 4))
    plt.imshow(blended)
    plt.axis('off')
    fig
  exercise:
    prompt: 마스크 조건을 grayCut < 60 로 바꿔 어두운 영역에서 china가 보이도록 합성하세요.
    starterCode: |-
      reverseMask = grayCut ___ 60
      reverseBlend = np.where(reverseMask[:, :, None], chinaCut, flowerCut)
      fig2 = plt.figure(figsize=(6, 4))
      plt.imshow(reverseBlend)
      plt.axis('off')
      fig2
    hints:
    - 부등호만 바꾸면 됩니다.
    - 결과는 합성의 방향이 뒤집힙니다.
  check:
    noError: np.where와 시각화가 오류 없이 끝나야 합니다.
    resultCheck: blended.shape이 (h, w, 3)이어야 합니다.
- id: shape_mask
  title: 5단계. 도형 마스크 만들기
  structuredPrimary: true
  subtitle: 원과 사각형
  goal: 좌표 격자로 원·사각형 마스크를 직접 그립니다.
  why: 도형 마스크는 비네팅, 비주얼 효과, 관심 영역 강조 등에 자주 쓰입니다.
  explanation: |-
    \`np.indices((h, w))\` 또는 \`np.mgrid[:h, :w]\` 는 각 픽셀의 (y, x) 좌표 격자를 만들어 줍니다. 이 격자를 이용해 거리 식으로 원 마스크, 부등식 두 개로 사각형 마스크를 만듭니다.

    원 마스크: \`(yy - cy) ** 2 + (xx - cx) ** 2 < r ** 2\`
  tips:
  - 도형 마스크와 색 마스크를 & 연산자로 결합하면 "특정 영역의 특정 색"이라는 정밀한 조건도 만들 수 있습니다.
  snippet: |-
    yy, xx = np.mgrid[:h, :w]
    cy, cx = h // 2, w // 2
    radius = min(h, w) // 4
    circleMask = (yy - cy) ** 2 + (xx - cx) ** 2 < radius ** 2
    vignette = np.where(circleMask[:, :, None], chinaCut, [0, 0, 0])
    fig = plt.figure(figsize=(6, 4))
    plt.imshow(vignette)
    plt.axis('off')
    fig
  exercise:
    prompt: 정중앙에 200x200 정사각형 마스크 squareMask를 만들어 그 영역만 chinaCut, 나머지는 검정인 frame을 만드세요.
    starterCode: |-
      squareMask = (np.abs(yy - cy) < ___) & (np.abs(xx - cx) < ___)
      frame = np.where(squareMask[:, :, None], chinaCut, [0, 0, 0])
      fig2 = plt.figure(figsize=(6, 4))
      plt.imshow(frame)
      plt.axis('off')
      fig2
    hints:
    - 정사각형 한 변의 절반이 빈칸 두 개에 같이 들어갑니다.
    - 200x200 정사각형이면 절반이 100입니다.
  check:
    noError: 마스크 생성과 합성이 오류 없이 끝나야 합니다.
    resultCheck: squareMask가 (h, w) shape의 bool 배열이어야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 마스크 조합 실험
  goal: 색·위치 마스크를 조합한 합성과 비네팅을 직접 만듭니다.
  why: 마스크 두세 개를 조합하면 단순 조건으로는 표현 못 하는 영역을 한 줄로 그릴 수 있습니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 비네팅 효과는 마스크 가장자리를 부드럽게 만드는 가우시안과 함께 쓰는 것이 보통이지만, 이 트랙에서는 단순한 원 마스크로 시작합니다.
  snippet: |-
    band = (np.abs(yy - cy) < h // 6)
    bandOnly = np.where(band[:, :, None], chinaCut, [30, 30, 30])
    fig = plt.figure(figsize=(6, 4))
    plt.imshow(bandOnly)
    plt.axis('off')
    fig
  exercise:
    prompt: "미션1: chinaCut의 밝은 영역(gray > 180) 이면서 동시에 중앙 원 안에 있는 픽셀만 [255, 255, 255]로 표시하고 나머지는 chinaCut 원본을 그대로 두는 spotlight를 만드세요. 미션2: 중심에서 거리 d를 계산해 알파 = (1 - d / d_max)^2 로 만든 부드러운 vignetteSoft 이미지를 만드세요(클립으로 0~1 범위)."
    starterCode: |-
      colorMask = grayCut > 180
      combined = colorMask & circleMask
      spotlight = chinaCut.copy()
      spotlight[combined] = [255, 255, 255]
      spotFig = plt.figure(figsize=(6, 4))
      plt.imshow(spotlight)
      plt.axis('off')
      spotFig
    hints:
    - 마스크 두 개의 AND는 & 연산자입니다.
    - vignetteSoft는 거리 격자를 정규화한 뒤 (1 - d) ** 2 로 만들면 됩니다.
  check:
    noError: 두 마스크 결합과 대입이 오류 없이 끝나야 합니다.
    resultCheck: combined가 (h, w) shape의 bool 배열이어야 합니다.
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
  - id: visionBasics_08-image_mask-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - condition_mask
    - practice
    title: 마스크 사고 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: mask shape·dtype·foreground 비율 계약을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_image_mask_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_image_mask_contract(value):
            raise NotImplementedError
      solution: |
        def audit_image_mask_contract(value):
            required = ['shape', 'dtype', 'foregroundRatio']
            rules = [{'id': 'mask-rank', 'field': 'shape', 'kind': 'length', 'value': 2}, {'id': 'mask-dtype', 'field': 'dtype', 'kind': 'enum', 'values': ['bool', 'uint8']}, {'id': 'foreground-ratio', 'field': 'foregroundRatio', 'kind': 'unit-interval'}]
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
            return {"accepted": not missing and not violations, "topic": 'image_mask', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.vision-basics.visionBasics_08.image_mask-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-basics.visionBasics_08.image_mask-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_image_mask_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              shape:
              - 480
              - 640
              dtype: bool
              foregroundRatio: 0.25
          expectedReturn:
            accepted: true
            topic: image_mask
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              dtype: bool
              foregroundRatio: 0.25
          expectedReturn:
            accepted: false
            topic: image_mask
            missing:
            - shape
            violations:
            - mask-rank
        - id: reports-topic-invariants
          arguments:
          - value:
              shape:
              - 480
              - 640
              - 1
              dtype: float32
              foregroundRatio: 1.5
          expectedReturn:
            accepted: false
            topic: image_mask
            missing: []
            violations:
            - foreground-ratio
            - mask-dtype
            - mask-rank
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: visionBasics_08-image_mask-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionBasics_08-image_mask-contract-audit-mastery
    title: 마스크 사고 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_image_mask_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_image_mask_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_image_mask_result(expected, observed):
            identity = ['sourceHash', 'maskHash']
            metrics = {'foregroundCount': 0}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'image_mask', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.vision-basics.visionBasics_08.image_mask-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-basics.visionBasics_08.image_mask-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_image_mask_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: m1
              maskHash: mask-a
              foregroundCount: 76800
          - value:
              sourceHash: m1
              maskHash: mask-a
              foregroundCount: 76800
          expectedReturn:
            passed: true
            topic: image_mask
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: m1
              maskHash: mask-a
              foregroundCount: 76800
          - value:
              sourceHash: m2
              maskHash: mask-b
              foregroundCount: 70000
          expectedReturn:
            passed: false
            topic: image_mask
            missing: []
            identityMismatch:
            - maskHash
            - sourceHash
            metricDrift:
            - foregroundCount
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: m1
              maskHash: mask-a
              foregroundCount: 76800
          - value: {}
          expectedReturn:
            passed: false
            topic: image_mask
            missing:
            - foregroundCount
            - maskHash
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: visionBasics_08-image_mask-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionBasics_08-image_mask-result-reconciliation-transfer
    title: 마스크 사고 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_image_mask_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_image_mask_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_image_mask_evidence(stage):
            stages = {'input': {'action': 'validate mask input contract', 'evidence': 'shape dtype foreground ratio', 'risk': 'misinterpreted pixels'}, 'process': {'action': 'apply bounded mask operation', 'evidence': 'boolean selection trace', 'risk': 'silent shape or range drift'}, 'result': {'action': 'reconcile mask result', 'evidence': 'foreground count', 'risk': 'plausible but wrong image'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.vision-basics.visionBasics_08.image_mask-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-basics.visionBasics_08.image_mask-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_image_mask_evidence
        cases:
        - id: recalls-input
          arguments:
          - value: input
          expectedReturn:
            action: validate mask input contract
            evidence: shape dtype foreground ratio
            risk: misinterpreted pixels
        - id: recalls-process
          arguments:
          - value: process
          expectedReturn:
            action: apply bounded mask operation
            evidence: boolean selection trace
            risk: silent shape or range drift
        - id: recalls-result
          arguments:
          - value: result
          expectedReturn:
            action: reconcile mask result
            evidence: foreground count
            risk: plausible but wrong image
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};