var e=`meta:
  id: visionBasics_04
  title: 색공간 직관
  order: 4
  category: visionBasics
  difficulty: ⭐⭐
  badge: 입문
  packages:
  - matplotlib
  - numpy
  - scikit-learn
  tags:
  - 색공간
  - RGB
  - HSV
  - Lab
  - 색상모델
  seo:
    title: 이미지 비전 기초 - 색공간 직관
    description: RGB, HSV, Lab 색공간이 각각 어떤 정보를 강조하는지 직접 변환하며 익힙니다.
    keywords:
    - 색공간
    - RGB
    - HSV
    - Lab
    - 색변환
intro:
  emoji: 🌈
  goal: RGB, HSV, Lab 세 색공간의 차이를 직접 변환하며 직관을 만듭니다.
  description: |-
    "노란 차 만 골라내고 싶다", "어두운 부분만 더 밝히고 싶다" 같은 작업은 RGB로는 까다롭지만 HSV에서는 한 줄입니다. 이 강의는 세 색공간의 정의를 짚고, 같은 사진을 세 가지 방식으로 표현해 어떤 작업에 어떤 색공간이 어울리는지 감각을 만듭니다.
  direction: 같은 사진을 RGB, HSV, Lab으로 변환하며 각 색공간이 강조하는 정보를 비교합니다.
  benefits:
  - 색상 필터링이 HSV에서 왜 쉬운지 코드로 확인할 수 있습니다.
  - 밝기·채도·색조라는 인간 친화적 축으로 사진을 분리할 수 있습니다.
  - Lab의 L 채널이 곧 밝기라는 점을 이용해 컬러 그림을 자연스럽게 흑백화할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. RGB의 한계
      detail: 빨간 꽃잎만 고르기를 RGB로 시도해 봅니다.
    - label: 2단계. matplotlib HSV 변환
      detail: rgb_to_hsv 한 줄로 HSV로 옮깁니다.
    - label: 3단계. 색상으로 마스킹
      detail: H 채널의 범위로 특정 색만 골라냅니다.
    - label: 4단계. Lab로 밝기 분리
      detail: skimage 없이 직접 Lab 근사값으로 L 채널을 만듭니다.
    - label: 5단계. 세 색공간 한눈에 비교
      detail: 같은 사진을 세 가지로 분해해 나란히 봅니다.
    runtime:
    - label: numpy 환경
      detail: matplotlib의 colors 모듈로 색공간 변환을 수행합니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: rgb_limit
  title: 1단계. RGB로 빨간 꽃잎 고르기
  structuredPrimary: true
  subtitle: 왜 RGB가 어려운가
  goal: RGB 조건만으로 빨간 영역을 고르는 시도의 한계를 확인합니다.
  why: RGB 한계를 직접 부딪혀 봐야 HSV의 가치가 와닿습니다.
  explanation: |-
    빨간색은 "R이 크고 G와 B가 작다"는 조건으로 표현할 수 있지만, 햇빛에 바랜 빨강은 R도 G도 둘 다 크고, 어두운 빨강은 셋 다 작은 채로 비율만 빨강에 가깝습니다. 임곗값을 어느 정도로 두든 일부 픽셀이 새고 일부가 빠집니다.

    HSV는 색조(H)·채도(S)·명도(V)로 정보를 분리해 "색조가 빨간색 근처에 있는 모든 채도/명도의 픽셀"이라는 표현을 가능하게 합니다.
  tips:
  - 임곗값 조정으로 색을 거르는 것은 항상 임시방편입니다. 색공간을 바꾸는 편이 빠릅니다.
  snippet: |-
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.datasets import load_sample_image

    flower = load_sample_image('flower.jpg')
    redLike = (flower[:, :, 0] > 150) & (flower[:, :, 1] < 100) & (flower[:, :, 2] < 100)
    redLike.sum(), redLike.shape
  exercise:
    prompt: 임곗값을 살짝 낮춰(120, 110, 110으로) 더 많은 픽셀이 잡히는지 확인하고, 결과 mask를 imshow로 보세요.
    starterCode: |-
      looseMask = (flower[:, :, 0] > ___) & (flower[:, :, 1] < ___) & (flower[:, :, 2] < ___)
      fig = plt.figure(figsize=(5, 4))
      plt.imshow(looseMask, cmap='gray')
      plt.axis('off')
      fig
    hints:
    - 마스크는 bool 배열이므로 imshow가 흑백으로 그립니다.
    - 너무 느슨하면 분홍과 주황까지 들어옵니다.
  check:
    noError: bool 마스크 계산이 오류 없이 끝나야 합니다.
    resultCheck: looseMask가 (높이, 너비) shape의 bool 배열이어야 합니다.
- id: rgb_to_hsv
  title: 2단계. RGB를 HSV로
  structuredPrimary: true
  subtitle: matplotlib.colors.rgb_to_hsv
  goal: 0~1 범위로 정규화한 RGB 이미지를 한 줄로 HSV로 바꿉니다.
  why: 색공간 변환은 직접 구현하기 번거롭지만 matplotlib이 한 줄로 제공합니다.
  explanation: |-
    \`matplotlib.colors.rgb_to_hsv\` 는 RGB 입력을 받아 같은 모양의 HSV 배열을 반환합니다. 단, 입력이 0~1 범위의 float이어야 합니다. uint8 그대로 넣으면 잘못된 결과가 나옵니다.

    출력의 마지막 차원도 H, S, V 세 채널입니다. H는 0(빨강)~1(다시 빨강)을 따라 색조를 순회합니다. 0.0과 1.0은 같은 색을 의미합니다.
  tips:
  - HSV의 H는 원형이라는 점이 RGB와 가장 다릅니다. 0과 1이 같은 색이라는 사실이 마스킹 조건에서 중요합니다.
  snippet: |-
    from matplotlib.colors import rgb_to_hsv

    flowerNorm = flower.astype(np.float32) / 255.0
    flowerHsv = rgb_to_hsv(flowerNorm)
    flowerHsv.shape, flowerHsv[0, 0]
  exercise:
    prompt: 같은 방식으로 china 이미지를 HSV로 변환하고 첫 픽셀의 H, S, V 값을 확인하세요.
    starterCode: |-
      china = load_sample_image('china.jpg')
      chinaHsv = rgb_to_hsv(china.astype(np.float32) / ___)
      chinaHsv[0, 0]
    hints:
    - 정규화는 255.0으로 나누는 것입니다.
    - HSV 값은 모두 0~1 사이입니다.
  check:
    noError: rgb_to_hsv 호출이 오류 없이 끝나야 합니다.
    resultCheck: chinaHsv의 모든 값이 0 이상 1 이하여야 합니다.
- id: hue_mask
  title: 3단계. H 채널로 색상 마스킹
  structuredPrimary: true
  subtitle: 빨간 꽃잎 한 줄로 고르기
  goal: H 채널 값 범위로 특정 색조의 픽셀만 골라냅니다.
  why: HSV 마스킹이 얼마나 단순한지 직접 보면 RGB로 헤매던 이유를 알게 됩니다.
  explanation: |-
    빨강은 H가 0.0 또는 1.0 근처입니다. \`H < 0.05\` 또는 \`H > 0.95\` 조건으로 빨간 픽셀을 잡습니다. 채도 S가 낮으면 흰색이나 회색이므로 \`S > 0.3\` 같은 추가 조건을 보통 함께 씁니다.

    필요한 색조를 단순한 부등식 두 개로 표현할 수 있다는 점이 HSV 마스킹의 강점입니다.
  tips:
  - 색조의 임곗값이 H=0과 H=1을 가로지르는 경우 OR 조건으로 두 구간을 합칩니다.
  snippet: |-
    hue = flowerHsv[:, :, 0]
    sat = flowerHsv[:, :, 1]
    redByHue = ((hue < 0.05) | (hue > 0.95)) & (sat > 0.3)
    redByHue.sum()
  exercise:
    prompt: 노란색 픽셀을 고르는 yellowMask를 만드세요(H가 약 0.13~0.2 사이, S가 0.3 이상).
    starterCode: |-
      yellowMask = (hue > ___) & (hue < ___) & (sat > 0.3)
      fig = plt.figure(figsize=(5, 4))
      plt.imshow(yellowMask, cmap='gray')
      plt.axis('off')
      fig
    hints:
    - 색조는 빨강(0) → 노랑(0.16) → 초록(0.33) → 청록(0.5) 순으로 증가합니다.
    - 채도 조건을 빼면 회색 영역이 섞입니다.
  check:
    noError: 마스크 계산이 오류 없이 끝나야 합니다.
    resultCheck: redByHue의 합이 0보다 커야 합니다(빨간 픽셀이 적어도 존재).
- id: lab_lightness
  title: 4단계. Lab의 L 채널로 밝기 분리
  structuredPrimary: true
  subtitle: 색과 밝기 분리하기
  goal: Lab 색공간 근사로 밝기 채널 L만 따로 다룹니다.
  why: 밝기만 조절하고 색은 그대로 두는 처리는 HSV의 V로도 비슷하게 가능하지만, 사람 시각에 더 잘 맞는 것은 Lab의 L입니다.
  explanation: |-
    Lab은 L(밝기)·a(녹↔적)·b(청↔황) 축으로 색을 표현합니다. 사람 시각의 명도 변화와 가장 가까운 색공간이라 사진 보정에 자주 쓰입니다.

    엄밀한 Lab 변환은 sRGB → 선형 RGB → XYZ → Lab의 다단계 변환이 필요합니다. 여기서는 OpenCV가 자주 쓰는 근사식 \`L ≈ 0.2126 * R + 0.7152 * G + 0.0722 * B\` 를 사용합니다. 이 값은 ITU-R BT.709 luminance 계수입니다.
  tips:
  - 강의 4단계에서 본 BT.601 계수와 여기 BT.709 계수는 비슷하지만 다른 표준입니다. 정확한 변환이 필요하면 skimage.color.rgb2lab을 쓰세요.
  snippet: |-
    bt709 = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    L = (flower.astype(np.float32) * bt709).sum(axis=2)
    fig = plt.figure(figsize=(5, 4))
    plt.imshow(L, cmap='gray')
    plt.title('L (BT.709)')
    plt.axis('off')
    fig
  exercise:
    prompt: L 채널만 1.3배 곱한 뒤 0~255로 클립한 이미지 brighter을 만들고 imshow로 비교하세요.
    starterCode: |-
      brighter = (L * ___).clip(0, 255).astype(np.uint8)
      fig2 = plt.figure(figsize=(5, 4))
      plt.imshow(brighter, cmap='gray')
      plt.axis('off')
      fig2
    hints:
    - clip 후 dtype을 다시 uint8로 만드세요.
    - 1.3배 곱은 전체 밝기를 30% 올리는 단순한 방식입니다.
  check:
    noError: 곱셈과 클립이 오류 없이 끝나야 합니다.
    resultCheck: brighter의 dtype이 uint8여야 합니다.
- id: side_by_side
  title: 5단계. 세 색공간 한눈에
  structuredPrimary: true
  subtitle: 같은 사진의 세 가지 모습
  goal: 같은 사진을 RGB, HSV, 그레이로 변환해 나란히 비교합니다.
  why: 정보가 어떻게 다르게 표현되는지 한 화면에 두면 어떤 작업에 어떤 표현이 어울리는지 즉시 보입니다.
  explanation: |-
    H 채널을 색상맵 hsv로, S 채널을 viridis로, V 채널을 gray로 그리면 정보의 종류가 분명히 다르다는 사실이 드러납니다. 같은 사진의 모서리가 어디에 더 잘 보이는지 비교해 보세요.
  tips:
  - 마지막에 어떤 색공간이 어떤 분석에 쓰이는지 한 줄로 요약해 두면 다음 트랙에서 함수 선택이 빨라집니다.
  snippet: |-
    china = load_sample_image('china.jpg')
    chinaHsv = rgb_to_hsv(china.astype(np.float32) / 255.0)

    fig, axes = plt.subplots(2, 2, figsize=(10, 8))
    axes[0, 0].imshow(flower)
    axes[0, 0].set_title('RGB')
    axes[0, 1].imshow(flowerHsv[:, :, 0], cmap='hsv')
    axes[0, 1].set_title('Hue')
    axes[1, 0].imshow(flowerHsv[:, :, 1], cmap='viridis')
    axes[1, 0].set_title('Saturation')
    axes[1, 1].imshow(flowerHsv[:, :, 2], cmap='gray')
    axes[1, 1].set_title('Value')
    for axis in axes.ravel():
        axis.axis('off')
    fig
  exercise:
    prompt: china 이미지로 같은 2x2 그리드를 그리고 H, S, V의 평균값을 print 없이 dict로 출력하세요.
    starterCode: |-
      chinaStats = {
          "hue_mean": float(chinaHsv[:, :, 0].mean()),
          "sat_mean": float(chinaHsv[:, :, 1].mean()),
          "val_mean": float(chinaHsv[:, :, 2].mean()),
      }
      chinaStats
    hints:
    - mean()의 결과는 numpy 스칼라이므로 float()로 감싸야 깔끔합니다.
    - HSV 값 범위는 0~1입니다.
  check:
    noError: 통계 계산이 오류 없이 끝나야 합니다.
    resultCheck: chinaStats의 세 값이 모두 0 이상 1 이하여야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 색공간으로 풀어 보기
  goal: 두 가지 작업을 RGB와 HSV로 각각 풀어 보고 차이를 체감합니다.
  why: 같은 문제를 두 색공간으로 풀어 봐야 어느 쪽이 빠른지 몸으로 알게 됩니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 미션 사이에 변수명을 겹치지 마세요. import 변수만 공유됩니다.
  snippet: |-
    pinkHue = (flowerHsv[:, :, 0] > 0.85) | (flowerHsv[:, :, 0] < 0.03)
    pinkSat = flowerHsv[:, :, 1] > 0.4
    pinkOnly = pinkHue & pinkSat
    pinkOnly.sum()
  exercise:
    prompt: "미션1: china 이미지의 하늘색 영역만 골라내는 skyMask를 HSV로 만드세요(H가 0.5 근처). 미션2: china에서 V > 0.7인 픽셀만 RGB 원본 값으로 남기고 나머지는 검정으로 만든 highlightImage를 만드세요."
    starterCode: |-
      skyMask = (chinaHsv[:, :, 0] > ___) & (chinaHsv[:, :, 0] < ___) & (chinaHsv[:, :, 1] > 0.2)
      fig = plt.figure(figsize=(5, 4))
      plt.imshow(skyMask, cmap='gray')
      plt.axis('off')
      fig
    hints:
    - 하늘은 H가 약 0.5~0.6 근처(청록~파랑) 범위입니다.
    - "highlightImage는 china * brightMask[:, :, None] 같은 브로드캐스팅으로 만들 수 있습니다."
  check:
    noError: 마스크 계산과 시각화가 오류 없이 끝나야 합니다.
    resultCheck: skyMask가 (높이, 너비) bool 배열이고 일부가 True여야 합니다.
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
  - id: visionBasics_04-color_space-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - rgb_limit
    - practice
    title: 색공간 직관 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 입력·출력 색공간과 정규화 범위를 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_color_space_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_color_space_contract(value):
            raise NotImplementedError
      solution: |
        def audit_color_space_contract(value):
            required = ['inputSpace', 'outputSpace', 'valueScale']
            rules = [{'id': 'input-space', 'field': 'inputSpace', 'kind': 'enum', 'values': ['RGB', 'BGR', 'HSV', 'LAB', 'GRAY']}, {'id': 'output-space', 'field': 'outputSpace', 'kind': 'enum', 'values': ['RGB', 'BGR', 'HSV', 'LAB', 'GRAY']}, {'id': 'different-spaces', 'field': 'inputSpace', 'kind': 'not-equal', 'other': 'outputSpace'}, {'id': 'value-scale', 'field': 'valueScale', 'kind': 'enum', 'values': ['uint8-255', 'float-1']}]
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
            return {"accepted": not missing and not violations, "topic": 'color_space', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.vision-basics.visionBasics_04.color_space-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-basics.visionBasics_04.color_space-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_color_space_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              inputSpace: BGR
              outputSpace: HSV
              valueScale: uint8-255
          expectedReturn:
            accepted: true
            topic: color_space
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              outputSpace: HSV
              valueScale: uint8-255
          expectedReturn:
            accepted: false
            topic: color_space
            missing:
            - inputSpace
            violations:
            - input-space
        - id: reports-topic-invariants
          arguments:
          - value:
              inputSpace: RGB
              outputSpace: RGB
              valueScale: unknown
          expectedReturn:
            accepted: false
            topic: color_space
            missing: []
            violations:
            - different-spaces
            - value-scale
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: visionBasics_04-color_space-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionBasics_04-color_space-contract-audit-mastery
    title: 색공간 직관 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_color_space_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_color_space_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_color_space_result(expected, observed):
            identity = ['sourceHash', 'outputSpace']
            metrics = {'maxRoundTripError': 1}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'color_space', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.vision-basics.visionBasics_04.color_space-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-basics.visionBasics_04.color_space-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_color_space_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: cs1
              outputSpace: HSV
              maxRoundTripError: 1
          - value:
              sourceHash: cs1
              outputSpace: HSV
              maxRoundTripError: 2
          expectedReturn:
            passed: true
            topic: color_space
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: cs1
              outputSpace: HSV
              maxRoundTripError: 1
          - value:
              sourceHash: cs2
              outputSpace: LAB
              maxRoundTripError: 12
          expectedReturn:
            passed: false
            topic: color_space
            missing: []
            identityMismatch:
            - outputSpace
            - sourceHash
            metricDrift:
            - maxRoundTripError
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: cs1
              outputSpace: HSV
              maxRoundTripError: 1
          - value: {}
          expectedReturn:
            passed: false
            topic: color_space
            missing:
            - maxRoundTripError
            - outputSpace
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: visionBasics_04-color_space-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionBasics_04-color_space-result-reconciliation-transfer
    title: 색공간 직관 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_color_space_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_color_space_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_color_space_evidence(stage):
            stages = {'input': {'action': 'validate color-space input contract', 'evidence': 'source and target color spaces', 'risk': 'misinterpreted pixels'}, 'process': {'action': 'apply bounded color-space operation', 'evidence': 'conversion parameter trace', 'risk': 'silent shape or range drift'}, 'result': {'action': 'reconcile color-space result', 'evidence': 'round-trip error', 'risk': 'plausible but wrong image'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.vision-basics.visionBasics_04.color_space-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-basics.visionBasics_04.color_space-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_color_space_evidence
        cases:
        - id: recalls-input
          arguments:
          - value: input
          expectedReturn:
            action: validate color-space input contract
            evidence: source and target color spaces
            risk: misinterpreted pixels
        - id: recalls-process
          arguments:
          - value: process
          expectedReturn:
            action: apply bounded color-space operation
            evidence: conversion parameter trace
            risk: silent shape or range drift
        - id: recalls-result
          arguments:
          - value: result
          expectedReturn:
            action: reconcile color-space result
            evidence: round-trip error
            risk: plausible but wrong image
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};