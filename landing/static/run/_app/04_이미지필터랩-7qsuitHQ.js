var e=`meta:
  packages:
  - numpy
  - opencv-python
  - scikit-learn
  id: opencv_04
  title: 이미지필터랩
  order: 4
  category: opencv
  difficulty: ⭐⭐
  badge: 기초
  tags:
  - OpenCV
  - blur
  - GaussianBlur
  - medianBlur
  - bilateralFilter
  - 필터
  seo:
    title: OpenCV 기초 - 이미지 필터 랩
    description: OpenCV로 평균/가우시안/미디언/양방향 블러를 비교하며 노이즈 제거와 에지 보존을 손으로 다룹니다.
    keywords:
    - OpenCV
    - blur
    - GaussianBlur
    - medianBlur
    - bilateralFilter
intro:
  emoji: 🔮
  goal: 네 가지 블러 필터를 합성 입력에서 직접 적용해 "노이즈가 줄었는지"를 표준편차로 정량 비교합니다.
  description: 모든 블러는 인접 픽셀을 어떻게 묶느냐의 정책입니다. 평균/가중평균/중앙값/색·거리 가중치 네 정책을 한 강의에서 같은 입력 위에서 비교합니다.
  direction: 합성 노이즈 이미지를 만들어 cv2.blur, GaussianBlur, medianBlur, bilateralFilter 결과를 각각 적용하고, 노이즈 표준편차와 에지 보존을 같은 셀에서 평가합니다.
  benefits:
  - 커널 크기와 시그마가 흐림 강도를 어떻게 조절하는지 손으로 확인합니다.
  - salt-and-pepper 노이즈에서 medianBlur가 다른 필터보다 강한 이유를 표준편차로 비교합니다.
  - bilateralFilter가 에지를 보존하는 메커니즘을 수직 경계 패치로 검증합니다.
  - filter 함수의 커널 크기 검증 패턴을 손으로 짜 봅니다.
  diagram:
    steps:
    - label: 합성 입력 만들기
      detail: 균일 배경 + 직사각형 도형 + 가우시안 노이즈를 합쳐 노이즈 표준편차 기준값을 만듭니다.
    - label: 평균 블러
      detail: cv2.blur(img, (k, k))로 단순 평균을 적용해 흐림 강도를 확인합니다.
    - label: 가우시안 블러
      detail: cv2.GaussianBlur로 중심 가중치 평균을 적용해 표준편차 감소를 비교합니다.
    - label: 미디언 블러
      detail: salt-and-pepper 노이즈 입력에서 cv2.medianBlur가 평균 계열보다 우월함을 확인합니다.
    - label: 양방향 필터
      detail: 수직 에지가 있는 패치에서 cv2.bilateralFilter가 에지를 보존하는지 검증합니다.
    runtime:
    - label: opencv-python 패키지
      detail: meta.packages의 opencv-python이 가상환경에 있어야 cv2.blur 등 호출이 가능합니다.
    - label: numpy 난수 시드 고정
      detail: np.random.default_rng(42)로 시드를 고정해 같은 셀이 다른 시점에도 같은 결과를 내게 합니다.
    - label: 흑백 단채널 입력
      detail: 노이즈 표준편차 비교는 단채널이 직관적이라 합성 입력은 (H, W) 흑백으로 만듭니다.
sections:
- id: step1_load
  title: 1단계. 합성 노이즈 입력 만들기
  structuredPrimary: true
  subtitle: 흑백 패치 + 가우시안 노이즈
  goal: 균일 배경에 직사각형 한 개를 그린 깨끗한 패치를 만들고, 그 위에 σ=18의 가우시안 노이즈를 더한 noisy 입력을 함께 보관합니다.
  why: 필터 비교는 정답이 명확한 합성 입력에서 시작해야 합니다. 실제 사진은 정답 표준편차를 알 수 없어 "얼마나 줄었는지"를 정량화하기 어려워서, 알려진 노이즈 σ로 시작합니다.
  explanation: |-
    합성 입력은 두 부분으로 나뉩니다. clean은 균일 배경(120) + 안쪽 직사각형(190) 구조를 가진 흑백 이미지입니다. noise는 평균 0, 표준편차 18의 가우시안 난수입니다.
    np.clip으로 0~255 범위에 가두고 uint8로 캐스팅해 cv2 필터 입력 형식을 맞춥니다. clip 없이 더하면 음수나 256이 나와 wrap-around가 발생합니다.
    노이즈 표준편차의 기대값은 약 18입니다. clean이 평탄한 영역의 noisy 표준편차를 측정하면 그 값에 가깝게 나옵니다. 이 값이 필터 후 얼마나 줄어드는지가 다음 단계의 비교 지표입니다.
  tips:
  - np.random.default_rng(seed)는 시드를 명시적으로 고정해 셀 재실행 때마다 같은 노이즈를 만듭니다.
  - 단채널 흑백 입력은 cv2의 모든 블러 함수가 그대로 받습니다. 컬러로 일반화는 마지막 단계에서 합니다.
  snippet: |-
    import cv2
    import numpy as np

    filterRng = np.random.default_rng(42)
    cleanPatch = np.full((96, 128), 120, dtype=np.uint8)
    cv2.rectangle(cleanPatch, (32, 24), (96, 72), 190, -1)
    rawNoise = filterRng.normal(0, 18, cleanPatch.shape).astype(np.int16)
    noisyPatch = np.clip(cleanPatch.astype(np.int16) + rawNoise, 0, 255).astype(np.uint8)

    flatBgRoi = noisyPatch[5:20, 5:25]

    {
        'shape': noisyPatch.shape,
        'dtype': str(noisyPatch.dtype),
        'flatBgStd': round(float(flatBgRoi.std()), 2),
        'meanDiff': round(float(abs(noisyPatch.astype(int) - cleanPatch.astype(int)).mean()), 2),
    }
  exercise:
    prompt: 같은 패치 위에 σ=8인 더 작은 노이즈를 만들어 flatBgStd가 σ=18 케이스보다 작은지 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np

      smallRng = np.random.default_rng(42)
      smallClean = np.full((96, 128), 120, dtype=np.uint8)
      cv2.rectangle(smallClean, (32, 24), (96, 72), 190, -1)
      smallNoise = smallRng.normal(0, ___, smallClean.shape).astype(np.int16)
      smallNoisy = np.clip(smallClean.astype(np.int16) + smallNoise, 0, 255).astype(np.uint8)

      smallFlatStd = round(float(smallNoisy[5:20, 5:25].std()), 2)
      {'smallFlatStd': smallFlatStd, 'isQuieter': smallFlatStd < 18}
    hints:
    - σ 인자는 normal의 두 번째 위치 인자입니다.
    - 빈칸에는 8이 들어갑니다.
    check:
      noError: rng/normal/clip 흐름이 ValueError 없이 끝나야 합니다.
      resultCheck: smallFlatStd가 약 8 정도이고 isQuieter가 True여야 합니다.
  check:
    noError: 합성 입력 생성과 통계 계산이 끝나야 합니다.
    resultCheck: shape가 (96, 128), dtype이 'uint8', flatBgStd가 약 18에 근접해야 합니다.
- id: step2_blur
  title: 2단계. 평균 블러
  structuredPrimary: true
  subtitle: cv2.blur((k, k))
  goal: noisyPatch에 (3, 3)과 (9, 9) 두 커널 크기로 평균 블러를 적용해 평탄 영역 표준편차가 어떻게 줄어드는지 비교합니다.
  why: 평균 블러는 가장 단순한 필터지만 노이즈 감소 효과는 충분히 큽니다. 커널 크기와 표준편차 감소의 관계를 한 번 봐 두면 다른 필터의 강도 감각이 따라옵니다.
  explanation: |-
    cv2.blur(src, (k, k))는 k×k 정사각형 영역의 픽셀 평균으로 중심 픽셀을 대체합니다. 결과 dtype은 입력과 같은 uint8입니다.
    가우시안 노이즈는 평균이 0이라 평균 필터에 잘 줄어듭니다. 이론적으로 (k, k) 평균 후 표준편차는 σ/k로 줄어듭니다. (3,3)에서는 약 1/3, (9,9)에서는 약 1/9이 됩니다.
    단점은 에지(경계)도 같이 흐려진다는 점입니다. 평탄 영역에서는 좋지만 경계 보존이 필요하면 다음 필터들로 가야 합니다.
  tips:
  - cv2.blur는 cv2.boxFilter(src, -1, ksize)와 동치입니다. 둘 다 평균 필터입니다.
  - 평균 후 표준편차는 σ/k의 이론치에 가깝지만 경계 인근에서는 약간 다릅니다. 평탄 영역 ROI에서만 측정해야 정확합니다.
  snippet: |-
    import cv2
    import numpy as np

    blurRng = np.random.default_rng(42)
    blurClean = np.full((96, 128), 120, dtype=np.uint8)
    cv2.rectangle(blurClean, (32, 24), (96, 72), 190, -1)
    blurNoisy = np.clip(
        blurClean.astype(np.int16) + blurRng.normal(0, 18, blurClean.shape).astype(np.int16),
        0,
        255,
    ).astype(np.uint8)

    blurred3 = cv2.blur(blurNoisy, (3, 3))
    blurred9 = cv2.blur(blurNoisy, (9, 9))

    flatRoiOriginal = blurNoisy[5:20, 5:25].std()
    flatRoi3 = blurred3[5:20, 5:25].std()
    flatRoi9 = blurred9[5:20, 5:25].std()

    {
        'stdOriginal': round(float(flatRoiOriginal), 2),
        'std3x3': round(float(flatRoi3), 2),
        'std9x9': round(float(flatRoi9), 2),
        'monotonicDrop': flatRoiOriginal > flatRoi3 > flatRoi9,
    }
  exercise:
    prompt: 같은 노이지 입력에 (5, 5) 평균 블러를 적용해 std5x5가 std3x3보다 작고 std9x9보다 큰지 단조 감소를 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np

      midRng = np.random.default_rng(42)
      midClean = np.full((96, 128), 120, dtype=np.uint8)
      cv2.rectangle(midClean, (32, 24), (96, 72), 190, -1)
      midNoisy = np.clip(
          midClean.astype(np.int16) + midRng.normal(0, 18, midClean.shape).astype(np.int16),
          0,
          255,
      ).astype(np.uint8)

      midBlurred = cv2.blur(midNoisy, (___, 5))
      midStd = round(float(midBlurred[5:20, 5:25].std()), 2)
      {'midStd': midStd}
    hints:
    - 정사각 커널이라 두 인자 모두 5가 됩니다.
    - 빈칸에 들어갈 값은 5입니다.
    check:
      noError: cv2.blur 호출이 끝나야 합니다.
      resultCheck: midStd가 stdOriginal보다는 작고 1보다는 커야 합니다.
  check:
    noError: cv2.blur 두 번 호출과 std 계산이 끝나야 합니다.
    resultCheck: monotonicDrop이 True이고 std9x9가 stdOriginal보다 크게 작아야 합니다.
- id: step3_gaussian
  title: 3단계. 가우시안 블러
  structuredPrimary: true
  subtitle: GaussianBlur와 sigmaX
  goal: 같은 입력에 GaussianBlur를 적용해 평균 블러와 표준편차 감소를 비교하고, sigmaX=0(자동)일 때 커널에서 계산되는 시그마 값을 확인합니다.
  why: 가우시안은 평균 필터보다 부드럽고 경계가 덜 망가집니다. 같은 커널 크기에서 두 필터의 표준편차를 비교해 두면 시그마 감각이 생깁니다.
  explanation: |-
    cv2.GaussianBlur(src, ksize, sigmaX)는 가우시안 가중치로 평균을 냅니다. 중심에 가까운 픽셀이 더 큰 가중치를 받아 평균 필터보다 자연스러운 흐림을 만듭니다.
    sigmaX=0이면 OpenCV가 커널 크기에서 자동으로 σ을 계산합니다. 공식은 σ = 0.3·((k−1)/2 − 1) + 0.8 입니다. (5,5) 커널이면 σ ≈ 1.1입니다.
    같은 커널 크기에서 평균 필터보다 표준편차 감소가 약간 적습니다. 중심 가중치가 더 크기 때문입니다. 단, 경계 보존은 평균 필터보다 좋아 시각적으로 더 깔끔합니다.
  tips:
  - sigmaX를 명시적으로 크게 주면 ksize와 무관하게 강한 흐림을 얻을 수 있지만, 너무 큰 σ에 작은 ksize는 경계 효과가 잘립니다.
  - GaussianBlur의 ksize는 둘 다 홀수여야 합니다. (5, 5), (7, 7) 식으로 씁니다.
  snippet: |-
    import cv2
    import numpy as np

    gaussRng = np.random.default_rng(42)
    gaussClean = np.full((96, 128), 120, dtype=np.uint8)
    cv2.rectangle(gaussClean, (32, 24), (96, 72), 190, -1)
    gaussNoisy = np.clip(
        gaussClean.astype(np.int16) + gaussRng.normal(0, 18, gaussClean.shape).astype(np.int16),
        0,
        255,
    ).astype(np.uint8)

    gauss5 = cv2.GaussianBlur(gaussNoisy, (5, 5), 0)
    box5 = cv2.blur(gaussNoisy, (5, 5))

    {
        'gaussStd': round(float(gauss5[5:20, 5:25].std()), 2),
        'boxStd': round(float(box5[5:20, 5:25].std()), 2),
        'gaussIsHigher': float(gauss5[5:20, 5:25].std()) > float(box5[5:20, 5:25].std()),
    }
  exercise:
    prompt: sigmaX를 5.0으로 명시적으로 크게 주면 같은 (5, 5) 커널에서 흐림이 강해져 표준편차가 더 작아지는지 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np

      sigmaRng = np.random.default_rng(42)
      sigmaClean = np.full((96, 128), 120, dtype=np.uint8)
      cv2.rectangle(sigmaClean, (32, 24), (96, 72), 190, -1)
      sigmaNoisy = np.clip(
          sigmaClean.astype(np.int16) + sigmaRng.normal(0, 18, sigmaClean.shape).astype(np.int16),
          0,
          255,
      ).astype(np.uint8)

      strongGauss = cv2.GaussianBlur(sigmaNoisy, (5, 5), ___)
      strongStd = round(float(strongGauss[5:20, 5:25].std()), 2)
      {'strongStd': strongStd, 'isStronger': strongStd < 18 / 3}
    hints:
    - sigmaX 위치에 큰 값을 넣으면 흐림이 강해집니다.
    - 빈칸에는 5.0이 들어갑니다.
    check:
      noError: GaussianBlur 호출이 끝나야 합니다.
      resultCheck: strongStd가 6 미만이어야 합니다.
  check:
    noError: GaussianBlur와 cv2.blur 호출이 끝나야 합니다.
    resultCheck: gaussStd와 boxStd 모두 약 4 ~ 7 범위이며, gaussIsHigher가 True여야 합니다.
- id: step4_median
  title: 4단계. 미디언 블러와 salt-and-pepper
  structuredPrimary: true
  subtitle: medianBlur 강점
  goal: salt-and-pepper 노이즈를 인위적으로 뿌린 입력에 평균과 미디언을 모두 적용해, 미디언이 극단값에 강한 이유를 표준편차로 직접 확인합니다.
  why: 평균 계열은 0이나 255 같은 극단값에 약합니다. 미디언은 중앙값이라 극단값을 통째로 무시합니다. 이 한 셀에서 차이를 보면 "어떤 노이즈에 어떤 필터"의 감각이 굳습니다.
  explanation: |-
    salt-and-pepper 노이즈는 픽셀 일부를 0(검정)이나 255(흰색)으로 무작위 치환합니다. 평균 필터는 이 극단값을 그대로 평균에 반영해 회색 점이 남습니다.
    cv2.medianBlur(src, ksize)는 정사각 영역의 중앙값을 돌려줍니다. 극단값이 영역의 절반 미만이면 중앙값은 정상값 안에 머무릅니다.
    예제는 깨끗한 패치의 10%를 salt-and-pepper로 덮은 뒤 두 필터를 비교해, 미디언이 평균보다 노이즈 잔여를 훨씬 작게 만드는 것을 표준편차와 픽셀 일치 비율로 확인합니다.
  tips:
  - medianBlur의 ksize는 홀수 정수 하나만 넣습니다. (5, 5)가 아닌 5 형태입니다.
  - "ksize가 너무 크면 디테일이 사라집니다. 5나 7이 일반적인 시작값입니다."
  snippet: |-
    import cv2
    import numpy as np

    saltRng = np.random.default_rng(42)
    saltClean = np.full((96, 128), 120, dtype=np.uint8)
    cv2.rectangle(saltClean, (32, 24), (96, 72), 190, -1)

    saltPattern = saltRng.random(saltClean.shape)
    saltPepperNoisy = saltClean.copy()
    saltPepperNoisy[saltPattern < 0.05] = 0
    saltPepperNoisy[saltPattern > 0.95] = 255

    avgFiltered = cv2.blur(saltPepperNoisy, (5, 5))
    medianFiltered = cv2.medianBlur(saltPepperNoisy, 5)

    cleanFlat = saltClean[5:20, 5:25]
    {
        'avgDiff': round(float(np.abs(avgFiltered[5:20, 5:25].astype(int) - cleanFlat.astype(int)).mean()), 2),
        'medianDiff': round(float(np.abs(medianFiltered[5:20, 5:25].astype(int) - cleanFlat.astype(int)).mean()), 2),
        'medianBeatsAvg': float(np.abs(medianFiltered.astype(int) - saltClean.astype(int)).mean()) < float(np.abs(avgFiltered.astype(int) - saltClean.astype(int)).mean()),
    }
  exercise:
    prompt: 같은 salt-and-pepper 입력에 ksize=7 미디언을 적용해 깨끗한 원본과의 차이가 ksize=5보다 더 작아지는지 또는 비슷한지 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np

      sevenRng = np.random.default_rng(42)
      sevenClean = np.full((96, 128), 120, dtype=np.uint8)
      cv2.rectangle(sevenClean, (32, 24), (96, 72), 190, -1)
      sevenPattern = sevenRng.random(sevenClean.shape)
      sevenNoisy = sevenClean.copy()
      sevenNoisy[sevenPattern < 0.05] = 0
      sevenNoisy[sevenPattern > 0.95] = 255

      sevenFiltered = cv2.medianBlur(sevenNoisy, ___)
      sevenDiff = round(float(np.abs(sevenFiltered.astype(int) - sevenClean.astype(int)).mean()), 2)
      {'sevenDiff': sevenDiff}
    hints:
    - 빈칸에 들어갈 ksize는 7입니다.
    - "ksize=7은 더 넓은 영역의 중앙값이라 노이즈 잔여가 보통 더 작아집니다."
    check:
      noError: medianBlur 호출이 TypeError 없이 끝나야 합니다.
      resultCheck: sevenDiff가 0~3 사이의 작은 값이어야 합니다.
  check:
    noError: cv2.blur, medianBlur 호출이 끝나야 합니다.
    resultCheck: medianDiff가 avgDiff보다 명백히 작고 medianBeatsAvg가 True여야 합니다.
- id: step5_bilateral
  title: 5단계. 양방향 필터와 에지 보존
  structuredPrimary: true
  subtitle: bilateralFilter
  goal: 수직 경계를 가진 패치에 가우시안과 양방향 필터를 각각 적용한 뒤, 경계 양쪽 평균 차이가 어느 쪽이 더 잘 보존되는지 비교합니다.
  why: 양방향은 색이 다른 영역끼리는 섞지 않고 같은 영역만 평균을 냅니다. 경계가 살아 있는 게 핵심 특성이라 단순 패치에서 가우시안과 비교해 그 차이를 한 번 봐 두면 사용처 감각이 생깁니다.
  explanation: |-
    cv2.bilateralFilter(src, d, sigmaColor, sigmaSpace)는 공간 거리와 색 차이 두 축의 가우시안을 곱한 가중치로 평균합니다. 색이 비슷한 픽셀끼리만 강하게 섞입니다.
    sigmaColor가 크면 더 다른 색까지 한 그룹으로 보고 섞습니다. sigmaSpace가 크면 더 멀리 있는 픽셀도 후보가 됩니다. 둘 다 키우면 일반 가우시안에 가까워집니다.
    예제는 왼쪽 80, 오른쪽 180의 두 영역 패치를 만들고 두 필터를 비교합니다. 경계 양쪽 평균 차이는 원본 100. 가우시안 후에는 양쪽 평균이 가까워져 차이가 줄고, 양방향 후에는 거의 그대로 유지됩니다.
  tips:
  - d가 양수면 그 값이 ksize로 쓰이고, 0이면 sigmaSpace에서 자동 계산됩니다.
  - 양방향 필터는 비용이 큽니다. 작은 sigmaSpace로 시작해 효과를 보고 늘리는 게 좋습니다.
  snippet: |-
    import cv2
    import numpy as np

    edgePatch = np.zeros((40, 80), dtype=np.uint8)
    edgePatch[:, :40] = 80
    edgePatch[:, 40:] = 180

    edgeRng = np.random.default_rng(42)
    edgeNoisy = np.clip(
        edgePatch.astype(np.int16) + edgeRng.normal(0, 15, edgePatch.shape).astype(np.int16),
        0,
        255,
    ).astype(np.uint8)

    gaussEdge = cv2.GaussianBlur(edgeNoisy, (9, 9), 0)
    bilatEdge = cv2.bilateralFilter(edgeNoisy, 9, 50, 9)

    def sideDiff(image):
        return float(image[:, 50:60].mean()) - float(image[:, 20:30].mean())

    {
        'originalDiff': round(sideDiff(edgePatch), 2),
        'gaussDiff': round(sideDiff(gaussEdge), 2),
        'bilatDiff': round(sideDiff(bilatEdge), 2),
        'bilatPreservesEdge': sideDiff(bilatEdge) > sideDiff(gaussEdge),
    }
  exercise:
    prompt: sigmaColor를 200으로 매우 크게 주면 양방향이 가우시안에 가까워져 경계 차이가 줄어드는지 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np

      relaxPatch = np.zeros((40, 80), dtype=np.uint8)
      relaxPatch[:, :40] = 80
      relaxPatch[:, 40:] = 180
      relaxRng = np.random.default_rng(42)
      relaxNoisy = np.clip(
          relaxPatch.astype(np.int16) + relaxRng.normal(0, 15, relaxPatch.shape).astype(np.int16),
          0,
          255,
      ).astype(np.uint8)

      relaxedBilat = cv2.bilateralFilter(relaxNoisy, 9, ___, 9)
      relaxDiff = round(float(relaxedBilat[:, 50:60].mean()) - float(relaxedBilat[:, 20:30].mean()), 2)
      {'relaxDiff': relaxDiff}
    hints:
    - sigmaColor가 매우 크면 색이 달라도 한 그룹으로 묶여 일반 가우시안처럼 동작합니다.
    - 빈칸에는 200이 들어갑니다.
    check:
      noError: bilateralFilter 호출이 끝나야 합니다.
      resultCheck: relaxDiff가 원본 100보다 명백히 작은 값(80 미만)이어야 합니다.
  check:
    noError: bilateralFilter와 GaussianBlur 호출이 끝나야 합니다.
    resultCheck: bilatPreservesEdge가 True이고 bilatDiff가 gaussDiff보다 명백히 커야 합니다.
- id: step6_compare
  title: 6단계. 네 필터 한 줄 비교
  structuredPrimary: true
  subtitle: 같은 입력 × 네 필터 dict
  goal: 같은 가우시안 노이즈 입력에 네 필터를 각각 적용해 평탄 영역 표준편차와 경계 보존 지표를 한 dict로 비교합니다.
  why: 어떤 필터가 더 좋다는 한마디로 결론이 나지 않습니다. 두 지표(노이즈 감소, 경계 보존)를 동시에 보면 상황별 선택 기준이 명확해집니다.
  explanation: |-
    네 필터를 한 셀에서 비교하려면 입력을 한 번만 만들고 결과를 dict로 묶는 게 깔끔합니다. 평탄 영역 표준편차는 "노이즈가 얼마나 줄었는가", 경계 양쪽 평균 차이는 "에지가 얼마나 살아 있는가"를 각각 측정합니다.
    bilateralFilter는 sigmaSpace/sigmaColor가 적당히 작으면 노이즈 감소는 가우시안보다 약하지만 경계 보존은 가장 강한 편입니다. medianBlur는 salt-and-pepper에 특화되어 가우시안 노이즈 입력에서는 평균 필터와 비슷한 노이즈 감소를 보입니다.
    이 dict 형식은 다양한 입력에 같은 함수를 돌려도 비교 가능합니다. 함수로 묶어 두면 회귀 테스트로 그대로 옮길 수 있습니다.
  tips:
  - 노이즈 감소 vs 경계 보존은 거의 trade-off입니다. 둘 다 좋은 필터는 비용이 크고, 빠른 필터는 보통 한쪽을 포기합니다.
  - 실무에서는 입력 노이즈 유형(가우시안인지 salt-and-pepper인지)을 먼저 분석하고 필터를 선택합니다.
  snippet: |-
    import cv2
    import numpy as np

    comparePatch = np.zeros((40, 80), dtype=np.uint8)
    comparePatch[:, :40] = 80
    comparePatch[:, 40:] = 180

    compareRng = np.random.default_rng(42)
    compareNoisy = np.clip(
        comparePatch.astype(np.int16) + compareRng.normal(0, 12, comparePatch.shape).astype(np.int16),
        0,
        255,
    ).astype(np.uint8)


    def measure(image, label):
        flatStd = float(image[:, 5:20].std())
        sideDiff = float(image[:, 50:60].mean()) - float(image[:, 20:30].mean())
        return {'label': label, 'flatStd': round(flatStd, 2), 'sideDiff': round(sideDiff, 2)}


    results = [
        measure(compareNoisy, 'original'),
        measure(cv2.blur(compareNoisy, (5, 5)), 'box'),
        measure(cv2.GaussianBlur(compareNoisy, (5, 5), 0), 'gauss'),
        measure(cv2.medianBlur(compareNoisy, 5), 'median'),
        measure(cv2.bilateralFilter(compareNoisy, 5, 30, 5), 'bilateral'),
    ]
    results
  exercise:
    prompt: 같은 비교에 cv2.boxFilter(noisy, -1, (5,5)) 결과를 추가해 cv2.blur 결과와 거의 같은 flatStd가 나오는지 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np

      boxRng = np.random.default_rng(42)
      boxPatch = np.zeros((40, 80), dtype=np.uint8)
      boxPatch[:, :40] = 80
      boxPatch[:, 40:] = 180
      boxNoisy = np.clip(
          boxPatch.astype(np.int16) + boxRng.normal(0, 12, boxPatch.shape).astype(np.int16),
          0,
          255,
      ).astype(np.uint8)

      blurFilter = cv2.blur(boxNoisy, (5, 5))
      boxFilter = cv2.boxFilter(boxNoisy, -1, (___, 5))

      blurStd = round(float(blurFilter[:, 5:20].std()), 2)
      boxStd = round(float(boxFilter[:, 5:20].std()), 2)
      {'blurStd': blurStd, 'boxStd': boxStd, 'almostSame': abs(blurStd - boxStd) < 0.01}
    hints:
    - "ksize는 (5, 5) 정사각이라 두 값 모두 5입니다."
    - blur와 boxFilter(normalize=True 기본)는 같은 결과를 돌려줍니다.
    check:
      noError: 두 호출이 NameError 없이 끝나야 합니다.
      resultCheck: blurStd와 boxStd가 거의 같고 almostSame이 True여야 합니다.
  check:
    noError: measure 함수 정의와 네 필터 호출이 끝나야 합니다.
    resultCheck: 결과 리스트 길이가 5이고 'original' 항목의 flatStd가 가장 큰 값이어야 합니다.
- id: practice
  title: 실습 - 컬러 필터 일반화
  structuredPrimary: true
  subtitle: 단채널 → 3채널
  goal: 단채널에서 익힌 네 필터를 sklearn flower 컬러 이미지에 그대로 적용해 shape가 (H, W, 3)을 유지하고 결과들이 채널별 통계로 비교 가능한지 확인합니다.
  why: 컬러 일반화는 단순합니다. cv2 함수가 채널별로 같은 연산을 자동 적용해 줘서, 셀에서 정말로 그러한지 직접 검증해 둬야 합니다.
  explanation: |-
    cv2.blur, GaussianBlur, medianBlur, bilateralFilter는 단채널과 3채널 입력을 모두 받습니다. 결과의 shape는 입력과 같습니다.
    채널별 표준편차를 비교하면 컬러 필터의 평균화 효과가 채널마다 비슷하게 나타나는지 확인할 수 있습니다. 차이가 크게 나면 입력 채널 자체에 큰 분산 차이가 있다는 신호입니다.
    실무에서는 GaussianBlur와 bilateralFilter가 컬러 입력에 가장 흔히 쓰입니다. medianBlur는 컬러에서도 동작하지만 임펄스 노이즈가 많은 입력에 한정됩니다.
  tips:
  - 컬러에서 채널별로 다른 필터를 쓰고 싶으면 cv2.split → 각 채널 처리 → cv2.merge 패턴을 씁니다.
  - bilateralFilter의 sigmaColor는 색 거리 기준이라 컬러에서 효과가 단채널보다 두드러집니다.
  snippet: |-
    import cv2
    import numpy as np
    from sklearn.datasets import load_sample_image

    colorBase = cv2.cvtColor(load_sample_image('flower.jpg'), cv2.COLOR_RGB2BGR)
    colorAvg = cv2.blur(colorBase, (5, 5))
    colorGauss = cv2.GaussianBlur(colorBase, (5, 5), 0)
    colorMedian = cv2.medianBlur(colorBase, 5)
    colorBilat = cv2.bilateralFilter(colorBase, 5, 50, 5)


    def perChannelStd(image):
        return tuple(round(float(image[..., c].std()), 1) for c in range(3))


    {
        'baseShape': colorBase.shape,
        'gaussShape': colorGauss.shape,
        'baseStd': perChannelStd(colorBase),
        'gaussStd': perChannelStd(colorGauss),
        'gaussIsSmoother': all(g < b for g, b in zip(perChannelStd(colorGauss), perChannelStd(colorBase))),
    }
  exercise:
    prompt: 같은 컬러 입력에 cv2.bilateralFilter(d=9, sigmaColor=75, sigmaSpace=75)를 적용해 채널별 표준편차가 기본 입력보다 작아지는지 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np
      from sklearn.datasets import load_sample_image

      bilatColor = cv2.cvtColor(load_sample_image('flower.jpg'), cv2.COLOR_RGB2BGR)
      bilatStrong = cv2.bilateralFilter(bilatColor, 9, ___, 75)
      perChannel = tuple(round(float(bilatStrong[..., c].std()), 1) for c in range(3))
      basePerChannel = tuple(round(float(bilatColor[..., c].std()), 1) for c in range(3))
      {'strong': perChannel, 'base': basePerChannel}
    hints:
    - sigmaColor 위치 인자에 75를 넣습니다.
    - 빈칸에는 75가 들어갑니다.
    check:
      noError: bilateralFilter 호출이 끝나야 합니다.
      resultCheck: strong dict의 모든 채널 표준편차가 base보다 작아야 합니다.
  check:
    noError: 네 필터 호출과 perChannelStd 함수가 끝나야 합니다.
    resultCheck: baseShape와 gaussShape가 같고 gaussIsSmoother가 True여야 합니다.
- id: workflow_validation
  title: 7단계. 필터 입력 검증 함수
  structuredPrimary: true
  subtitle: 커널은 ≥3 홀수
  goal: validateOddKernel 함수가 3 미만이나 짝수에 ValueError를 던지는지 정상/실패 두 케이스를 같은 셀에서 검증합니다.
  why: cv2.medianBlur, GaussianBlur는 잘못된 ksize에 OpenCV 내부에서 에러를 던지지만 메시지가 직관적이지 않습니다. 자체 검증 함수를 입구에 두면 에러 메시지가 명확해지고 디버깅 시간이 줄어듭니다.
  explanation: |-
    ksize 조건은 "정수 + 3 이상 + 홀수"입니다. % 2 == 0으로 짝수를 잡고, ≤ 1로 너무 작은 값을 잡습니다.
    ValueError 메시지에 실제 받은 값을 반드시 포함시키면 호출자가 무엇이 잘못됐는지 즉시 알 수 있습니다. f-string 한 줄로 충분합니다.
    이 함수는 다른 필터 함수의 첫 줄에서 항상 호출하는 식으로 사용합니다. 실수로 ksize=4 같은 값이 흘러 들어와도 함수 입구에서 차단됩니다.
  tips:
  - "필터 패키지의 entry point 함수에서 매번 같은 검증을 부르는 게 표준입니다."
  - ValueError 대신 TypeError를 던지면 의미가 흐려집니다. 값이 잘못된 경우는 ValueError가 표준입니다.
  snippet: |-
    def validateOddKernel(kernelSize: int) -> bool:
        if kernelSize <= 1 or kernelSize % 2 == 0:
            raise ValueError(f"커널 크기는 3 이상의 홀수여야 합니다: {kernelSize}")
        return True


    okResult = validateOddKernel(5)

    try:
        validateOddKernel(4)
        evenMessage = 'unexpected pass'
    except ValueError as exc:
        evenMessage = str(exc)

    try:
        validateOddKernel(1)
        tinyMessage = 'unexpected pass'
    except ValueError as exc:
        tinyMessage = str(exc)

    {
        'okResult': okResult,
        'evenMessage': evenMessage,
        'tinyMessage': tinyMessage,
    }
  exercise:
    prompt: validateOddKernel을 한 줄 응용 함수에 결합해 잘못된 ksize면 ValueError가 그대로 전파되는지 확인하세요. ksize=6에 실패해야 합니다.
    starterCode: |-
      import cv2
      import numpy as np


      def validateOddKernel(kernelSize: int) -> bool:
          if kernelSize <= 1 or kernelSize % 2 == 0:
              raise ValueError(f"커널 크기는 3 이상의 홀수여야 합니다: {kernelSize}")
          return True


      def safeMedianBlur(image: np.ndarray, ksize: int) -> np.ndarray:
          validateOddKernel(___)
          return cv2.medianBlur(image, ksize)


      sampleArr = np.zeros((30, 30), dtype=np.uint8)
      okArr = safeMedianBlur(sampleArr, 5)

      try:
          safeMedianBlur(sampleArr, 6)
          chainedMessage = 'unexpected pass'
      except ValueError as exc:
          chainedMessage = str(exc)

      {'okShape': okArr.shape, 'chainedMessage': chainedMessage}
    hints:
    - validateOddKernel에 그대로 ksize 인자를 넘기면 됩니다.
    - 빈칸에는 ksize가 들어갑니다.
    check:
      noError: 함수 정의와 try/except가 끝나야 합니다.
      resultCheck: okShape가 (30, 30)이고 chainedMessage 안에 '6' 단서가 들어 있어야 합니다.
  check:
    noError: validateOddKernel 정의와 세 호출이 끝나야 합니다.
    resultCheck: okResult가 True, evenMessage와 tinyMessage 모두 'unexpected pass'가 아니어야 합니다.
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
  - id: opencv_04-opencv_filter-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - workflow_validation
    title: 이미지 필터 랩 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: filter 종류·홀수 kernel·sigma 범위를 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_opencv_filter_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_opencv_filter_contract(value):
            raise NotImplementedError
      solution: |
        def audit_opencv_filter_contract(value):
            required = ['filter', 'kernelSize', 'sigma']
            rules = [{'id': 'filter', 'field': 'filter', 'kind': 'enum', 'values': ['gaussian', 'median', 'bilateral']}, {'id': 'kernel', 'field': 'kernelSize', 'kind': 'odd'}, {'id': 'sigma', 'field': 'sigma', 'kind': 'range', 'min': 0, 'max': 100}]
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
            return {"accepted": not missing and not violations, "topic": 'opencv_filter', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.opencv.opencv_04.opencv_filter-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.opencv.opencv_04.opencv_filter-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_opencv_filter_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              filter: gaussian
              kernelSize: 5
              sigma: 1.5
          expectedReturn:
            accepted: true
            topic: opencv_filter
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              kernelSize: 5
              sigma: 1.5
          expectedReturn:
            accepted: false
            topic: opencv_filter
            missing:
            - filter
            violations:
            - filter
        - id: reports-topic-invariants
          arguments:
          - value:
              filter: box-magic
              kernelSize: 4
              sigma: 200
          expectedReturn:
            accepted: false
            topic: opencv_filter
            missing: []
            violations:
            - filter
            - kernel
            - sigma
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: opencv_04-opencv_filter-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - opencv_04-opencv_filter-contract-audit-mastery
    title: 이미지 필터 랩 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_opencv_filter_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_opencv_filter_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_opencv_filter_result(expected, observed):
            identity = ['sourceHash', 'filterHash']
            metrics = {'noiseStd': 0.5}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'opencv_filter', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.opencv.opencv_04.opencv_filter-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.opencv.opencv_04.opencv_filter-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_opencv_filter_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: of1
              filterHash: g5-s15
              noiseStd: 8.0
          - value:
              sourceHash: of1
              filterHash: g5-s15
              noiseStd: 8.4
          expectedReturn:
            passed: true
            topic: opencv_filter
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: of1
              filterHash: g5-s15
              noiseStd: 8.0
          - value:
              sourceHash: of2
              filterHash: bad
              noiseStd: 20.0
          expectedReturn:
            passed: false
            topic: opencv_filter
            missing: []
            identityMismatch:
            - filterHash
            - sourceHash
            metricDrift:
            - noiseStd
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: of1
              filterHash: g5-s15
              noiseStd: 8.0
          - value: {}
          expectedReturn:
            passed: false
            topic: opencv_filter
            missing:
            - filterHash
            - noiseStd
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: opencv_04-opencv_filter-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - opencv_04-opencv_filter-result-reconciliation-transfer
    title: 이미지 필터 랩 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_opencv_filter_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_opencv_filter_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_opencv_filter_evidence(stage):
            stages = {'source': {'action': 'validate filter source', 'evidence': 'kernel sigma contract', 'risk': 'invalid image contract'}, 'operation': {'action': 'run bounded filter operation', 'evidence': 'convolution trace', 'risk': 'unstable parameters'}, 'result': {'action': 'reconcile filter result', 'evidence': 'noise and edge preservation', 'risk': 'wrong visual inference'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.opencv.opencv_04.opencv_filter-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.opencv.opencv_04.opencv_filter-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_opencv_filter_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate filter source
            evidence: kernel sigma contract
            risk: invalid image contract
        - id: recalls-operation
          arguments:
          - value: operation
          expectedReturn:
            action: run bounded filter operation
            evidence: convolution trace
            risk: unstable parameters
        - id: recalls-result
          arguments:
          - value: result
          expectedReturn:
            action: reconcile filter result
            evidence: noise and edge preservation
            risk: wrong visual inference
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};