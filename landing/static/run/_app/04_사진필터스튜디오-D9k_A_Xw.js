var e=`meta:
  packages:
  - numpy
  - pillow
  - scikit-learn
  id: pillow_04
  title: 사진필터스튜디오
  order: 4
  category: pillow
  difficulty: ⭐⭐
  badge: 기초
  tags:
  - Pillow
  - ImageFilter
  - BLUR
  - SHARPEN
  - CONTOUR
  - EDGE
  seo:
    title: Pillow 기초 - 사진 필터 스튜디오
    description: Pillow ImageFilter로 BLUR/SHARPEN/CONTOUR/EDGE_ENHANCE 효과를 비교 적용하고 픽셀 통계로 정량 검증합니다.
    keywords:
    - Pillow
    - ImageFilter
    - BLUR
    - SHARPEN
    - 필터
    - 이미지효과
intro:
  emoji: 🎭
  goal: ImageFilter의 BLUR/SHARPEN/CONTOUR/EDGE_ENHANCE/EMBOSS/SMOOTH 여섯 필터를 같은 입력에 적용해 픽셀 표준편차 변화로 정량 비교합니다.
  description: Pillow ImageFilter는 미리 정의된 컨볼루션 커널 모음입니다. filter(name) 한 줄로 적용되지만 효과 강도와 출력 특성은 필터마다 크게 다릅니다.
  direction: 합성 입력에 여섯 필터를 적용하고 std/mean 같은 통계 dict로 결과를 비교한 뒤, GaussianBlur 파라미터 효과까지 다룹니다.
  benefits:
  - filter(ImageFilter.BLUR)와 GaussianBlur(radius) 두 호출 방식을 비교합니다.
  - SHARPEN, EDGE_ENHANCE의 결과가 원본보다 표준편차가 크게 나오는 단조성을 확인합니다.
  - FIND_EDGES의 결과가 검은 배경 + 흰 윤곽선의 분포를 갖는지 검증합니다.
  - validateBlurRadius로 음수 radius를 차단하는 가드 패턴을 잡습니다.
  diagram:
    steps:
    - label: RGB 입력 로드
      detail: flower 샘플을 Image.fromarray로 RGB Image로 만듭니다.
    - label: BLUR vs GaussianBlur
      detail: ImageFilter.BLUR 기본 vs GaussianBlur(radius=N) 파라미터 비교.
    - label: SHARPEN과 EDGE_ENHANCE
      detail: 경계 강조 필터로 표준편차가 늘어나는지 확인.
    - label: CONTOUR와 FIND_EDGES
      detail: 윤곽선 추출 필터의 출력 분포 검증.
    - label: 비교 dict
      detail: 여섯 필터 결과의 std/mean을 한 dict로 정리.
    runtime:
    - label: pillow + numpy
      detail: 필터 결과를 NumPy로 변환해 표준편차/평균 통계를 계산합니다.
    - label: 단일 RGB 원본
      detail: 첫 셀의 canvas 객체가 이후 모든 필터 셀의 공통 입력.
    - label: filter는 새 객체
      detail: filter 호출은 새 Image를 돌려주고 원본은 그대로 유지됩니다.
sections:
- id: step1_load
  title: 1단계. 필터 원본 만들기
  structuredPrimary: true
  subtitle: flower RGB Image
  goal: flower 샘플을 Pillow Image로 만들고 픽셀 표준편차를 측정해 이후 필터 결과 비교의 기준값을 정합니다.
  why: 필터의 효과는 픽셀 분산이 변하는 정도로 측정할 수 있습니다. 원본의 표준편차를 알면 BLUR 후 줄어들었는지, SHARPEN 후 늘었는지를 객관적으로 비교할 수 있습니다.
  explanation: |-
    sklearn flower 샘플은 색 변화가 풍부한 사진이라 필터 효과가 잘 드러납니다. Image.fromarray로 RGB Image를 만들고, NumPy 통계로 원본의 표준편차를 측정합니다.
    이 표준편차가 모든 필터 비교의 기준값입니다. BLUR/SMOOTH는 이 값보다 결과 std가 작아지고, SHARPEN/EDGE_ENHANCE는 더 커집니다.
  tips:
  - "ImageFilter는 별도 import가 필요합니다: from PIL import Image, ImageFilter."
  - getextrema()로 색공간별 (min, max) 범위를 한 번에 얻을 수 있습니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageFilter
    from sklearn.datasets import load_sample_image

    canvas = Image.fromarray(load_sample_image('flower.jpg'))
    canvasArr = np.asarray(canvas)

    {
        'mode': canvas.mode,
        'size': canvas.size,
        'baseStd': round(float(canvasArr.std()), 2),
        'baseMean': round(float(canvasArr.mean()), 2),
    }
  exercise:
    prompt: china 입력의 표준편차를 측정해 flower의 baseStd와 비교하세요. china가 풍경이라 std가 더 작을 수 있습니다.
    starterCode: |-
      import numpy as np
      from PIL import Image
      from sklearn.datasets import load_sample_image

      chinaCanvas = Image.fromarray(load_sample_image('___'))
      chinaStd = round(float(np.asarray(chinaCanvas).std()), 2)
      {'chinaStd': chinaStd}
    hints:
    - china 파일명을 넣습니다.
    - 빈칸에는 china.jpg가 들어갑니다.
    check:
      noError: load_sample_image와 std 계산이 끝나야 합니다.
      resultCheck: chinaStd가 양수여야 합니다.
  check:
    noError: load_sample_image와 std 계산이 끝나야 합니다.
    resultCheck: mode가 'RGB', size가 (640, 427), baseStd가 양수여야 합니다.
- id: step2_blur
  title: 2단계. BLUR vs GaussianBlur
  structuredPrimary: true
  subtitle: 기본 vs 파라미터 조절
  goal: ImageFilter.BLUR와 GaussianBlur(radius=2/5) 결과의 표준편차를 비교해 radius가 클수록 std가 더 작아지는 단조성을 확인합니다.
  why: BLUR는 고정 3×3 커널이라 효과 강도를 조절할 수 없습니다. GaussianBlur는 radius로 강도를 조정할 수 있어 실무에서 훨씬 자주 쓰입니다. 둘을 한 셀에서 비교해 두면 사용처 감각이 잡힙니다.
  explanation: |-
    ImageFilter.BLUR는 3×3 균등 평균 커널을 적용하는 미리 정의된 필터입니다. radius를 조정할 수 없습니다.
    ImageFilter.GaussianBlur(radius)는 가우시안 가중 평균을 적용합니다. radius는 표준편차에 대응되며 클수록 흐림이 강합니다. 결과 std는 radius와 반비례합니다.
    검증은 세 결과의 std를 비교합니다. 원본 > BLUR > GaussianBlur(2) > GaussianBlur(5) 순서가 일반적입니다.
  tips:
  - GaussianBlur(radius=0)은 원본을 그대로 돌려줍니다. radius 1이 매우 약한 블러의 시작점입니다.
  - 컬러 입력에서는 채널별로 같은 필터가 적용되므로 mode와 size가 유지됩니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageFilter
    from sklearn.datasets import load_sample_image

    blurCanvas = Image.fromarray(load_sample_image('flower.jpg'))
    baseStd = float(np.asarray(blurCanvas).std())

    blurDefault = blurCanvas.filter(ImageFilter.BLUR)
    blurGauss2 = blurCanvas.filter(ImageFilter.GaussianBlur(radius=2))
    blurGauss5 = blurCanvas.filter(ImageFilter.GaussianBlur(radius=5))

    {
        'baseStd': round(baseStd, 2),
        'defaultStd': round(float(np.asarray(blurDefault).std()), 2),
        'gauss2Std': round(float(np.asarray(blurGauss2).std()), 2),
        'gauss5Std': round(float(np.asarray(blurGauss5).std()), 2),
        'monotonicDecrease': baseStd > float(np.asarray(blurGauss2).std()) > float(np.asarray(blurGauss5).std()),
    }
  exercise:
    prompt: GaussianBlur(radius=10)을 적용해 std가 radius=5보다 더 작은지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageFilter
      from sklearn.datasets import load_sample_image

      strongBlur = Image.fromarray(load_sample_image('flower.jpg')).filter(ImageFilter.GaussianBlur(radius=___))
      {'strongStd': round(float(np.asarray(strongBlur).std()), 2)}
    hints:
    - radius 인자에 10이 들어갑니다.
    - 빈칸에는 10이 들어갑니다.
    check:
      noError: GaussianBlur 호출이 끝나야 합니다.
      resultCheck: strongStd가 양수여야 합니다.
  check:
    noError: 세 filter 호출이 끝나야 합니다.
    resultCheck: monotonicDecrease가 True이고 gauss5Std가 baseStd보다 명백히 작아야 합니다.
- id: step3_sharpen
  title: 3단계. SHARPEN과 UnsharpMask
  structuredPrimary: true
  subtitle: 경계 강조 → std 증가
  goal: ImageFilter.SHARPEN과 UnsharpMask 결과의 표준편차가 원본보다 커지는지 확인하고, UnsharpMask의 percent 파라미터 효과를 비교합니다.
  why: 샤픈은 BLUR의 정반대로 경계 픽셀의 대비를 키웁니다. 효과 강도는 표준편차 증가량으로 측정 가능합니다. UnsharpMask는 사진 보정에서 가장 자주 쓰는 샤픈 함수입니다.
  explanation: |-
    ImageFilter.SHARPEN은 고정 강도의 샤프닝 필터입니다. UnsharpMask(radius, percent, threshold)는 더 정교한 조절이 가능합니다.
    UnsharpMask의 percent는 강도 백분율입니다. 100이 보통, 200이 두 배 강도입니다. threshold는 적용할 최소 픽셀 차이로, 노이즈를 키우지 않으려면 3~5 정도가 안전합니다.
    검증은 결과 std가 원본보다 명확히 큰지로 합니다. SHARPEN과 UnsharpMask 모두 std를 증가시켜야 정상 동작입니다.
  tips:
  - UnsharpMask는 운영에서 사진 톤 보정의 표준 도구입니다. radius=2, percent=150, threshold=3이 사진 일반화 시작점입니다.
  - "샤픈을 너무 강하게 주면 노이즈가 함께 커집니다. percent는 200을 잘 넘기지 않습니다."
  snippet: |-
    import numpy as np
    from PIL import Image, ImageFilter
    from sklearn.datasets import load_sample_image

    sharpCanvas = Image.fromarray(load_sample_image('flower.jpg'))
    baseStd = float(np.asarray(sharpCanvas).std())

    sharpened = sharpCanvas.filter(ImageFilter.SHARPEN)
    unsharp100 = sharpCanvas.filter(ImageFilter.UnsharpMask(radius=2, percent=100, threshold=3))
    unsharp200 = sharpCanvas.filter(ImageFilter.UnsharpMask(radius=2, percent=200, threshold=3))

    {
        'baseStd': round(baseStd, 2),
        'sharpenStd': round(float(np.asarray(sharpened).std()), 2),
        'unsharp100Std': round(float(np.asarray(unsharp100).std()), 2),
        'unsharp200Std': round(float(np.asarray(unsharp200).std()), 2),
        'sharpenIncreases': float(np.asarray(sharpened).std()) > baseStd,
        'monotonicIncrease': baseStd <= float(np.asarray(unsharp100).std()) <= float(np.asarray(unsharp200).std()),
    }
  exercise:
    prompt: UnsharpMask percent를 400으로 매우 강하게 주면 결과 std가 200 케이스보다 더 큰지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageFilter
      from sklearn.datasets import load_sample_image

      extremeCanvas = Image.fromarray(load_sample_image('flower.jpg'))
      extreme = extremeCanvas.filter(ImageFilter.UnsharpMask(radius=2, percent=___, threshold=3))
      {'extremeStd': round(float(np.asarray(extreme).std()), 2)}
    hints:
    - percent 인자에 400을 넣습니다.
    - 빈칸에는 400이 들어갑니다.
    check:
      noError: UnsharpMask 호출이 끝나야 합니다.
      resultCheck: extremeStd가 양수여야 합니다.
  check:
    noError: filter 호출들이 끝나야 합니다.
    resultCheck: sharpenIncreases가 True이고 monotonicIncrease가 True여야 합니다.
- id: step4_edge
  title: 4단계. CONTOUR와 FIND_EDGES
  structuredPrimary: true
  subtitle: 윤곽선 추출 필터
  goal: ImageFilter.CONTOUR와 FIND_EDGES 결과의 평균/표준편차를 비교해 검은 배경 + 흰 윤곽선 분포가 만들어지는지 확인합니다.
  why: 윤곽선 추출 필터는 입력에서 경계만 강조하고 나머지를 어둡게 만듭니다. 결과 평균이 매우 작아지고(검은 배경) 표준편차는 모서리 분포에 의해 정해지는 분포 특성을 가집니다.
  explanation: |-
    ImageFilter.CONTOUR는 윤곽선만 남기고 안쪽을 흰색으로 채웁니다. 결과 mean이 원본보다 큽니다(흰색이 많음).
    ImageFilter.FIND_EDGES는 Sobel 같은 에지 검출을 적용해 경계만 흰색으로 표시합니다. 결과 mean이 매우 작아지고(검은 배경) std는 모서리 픽셀 분포에 의해 정해집니다.
    두 결과는 같은 "윤곽선 강조"지만 출력 분포가 정반대라는 점이 핵심입니다. 자동화에서 어떤 결과가 필요한지에 따라 골라 씁니다.
  tips:
  - "FIND_EDGES는 컬러 입력에 각 채널별로 적용됩니다. 단채널 입력이 일반적이지만 컬러도 동작합니다."
  - CONTOUR + 이진화 조합은 흰 배경에 검은 윤곽선의 그림 같은 효과를 줍니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageFilter
    from sklearn.datasets import load_sample_image

    edgeCanvas = Image.fromarray(load_sample_image('flower.jpg'))
    baseMean = float(np.asarray(edgeCanvas).mean())

    contour = edgeCanvas.filter(ImageFilter.CONTOUR)
    findEdges = edgeCanvas.filter(ImageFilter.FIND_EDGES)

    {
        'baseMean': round(baseMean, 2),
        'contourMean': round(float(np.asarray(contour).mean()), 2),
        'findEdgesMean': round(float(np.asarray(findEdges).mean()), 2),
        'contourBrighter': float(np.asarray(contour).mean()) > baseMean,
        'findEdgesDarker': float(np.asarray(findEdges).mean()) < baseMean,
    }
  exercise:
    prompt: 그레이스케일로 먼저 변환한 뒤 FIND_EDGES를 적용해 결과 평균이 일반 컬러 입력과 다른지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageFilter
      from sklearn.datasets import load_sample_image

      grayEdgeCanvas = Image.fromarray(load_sample_image('flower.jpg')).convert('___')
      grayEdges = grayEdgeCanvas.filter(ImageFilter.FIND_EDGES)
      {'grayEdgesMean': round(float(np.asarray(grayEdges).mean()), 2)}
    hints:
    - 그레이스케일 mode는 'L'입니다.
    - 빈칸에는 L이 들어갑니다.
    check:
      noError: convert와 filter 호출이 끝나야 합니다.
      resultCheck: grayEdgesMean이 0~255 범위 안에 있어야 합니다.
  check:
    noError: CONTOUR와 FIND_EDGES 호출이 끝나야 합니다.
    resultCheck: contourBrighter와 findEdgesDarker 모두 True여야 합니다.
- id: step5_emboss
  title: 5단계. EMBOSS와 EDGE_ENHANCE
  structuredPrimary: true
  subtitle: 강조 효과 비교
  goal: EMBOSS, EDGE_ENHANCE, EDGE_ENHANCE_MORE 세 필터의 결과 std를 비교해 강조 강도의 단조성을 확인합니다.
  why: 강조 필터는 SHARPEN과 비슷하지만 효과 방식이 다릅니다. EMBOSS는 입체감 양각, EDGE_ENHANCE는 경계 강조입니다. 세 필터를 한 셀에서 비교해 둬야 차이가 명확합니다.
  explanation: |-
    EMBOSS는 양각 효과로 입체감을 만듭니다. 결과는 회색조에 가까운 톤이 됩니다.
    EDGE_ENHANCE는 경계선을 약하게 강조합니다. EDGE_ENHANCE_MORE는 더 강한 강조입니다. 두 필터 모두 std가 원본보다 커집니다.
    SHARPEN과 EDGE_ENHANCE는 비슷한 효과지만 EDGE_ENHANCE가 더 부드럽고 자연스럽습니다. 사진 보정에서 EDGE_ENHANCE가 더 자주 쓰입니다.
  tips:
  - EMBOSS는 그래픽 효과로 사용되지만 자동화에서는 거의 쓰이지 않습니다.
  - EDGE_ENHANCE_MORE는 노이즈를 함께 키울 수 있어 깨끗한 입력에 한정해 씁니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageFilter
    from sklearn.datasets import load_sample_image

    enhanceCanvas = Image.fromarray(load_sample_image('flower.jpg'))
    baseStd = float(np.asarray(enhanceCanvas).std())

    emboss = enhanceCanvas.filter(ImageFilter.EMBOSS)
    enhanceWeak = enhanceCanvas.filter(ImageFilter.EDGE_ENHANCE)
    enhanceStrong = enhanceCanvas.filter(ImageFilter.EDGE_ENHANCE_MORE)

    {
        'baseStd': round(baseStd, 2),
        'embossStd': round(float(np.asarray(emboss).std()), 2),
        'enhanceWeakStd': round(float(np.asarray(enhanceWeak).std()), 2),
        'enhanceStrongStd': round(float(np.asarray(enhanceStrong).std()), 2),
        'enhanceIncreases': float(np.asarray(enhanceWeak).std()) > baseStd,
        'strongerThanWeak': float(np.asarray(enhanceStrong).std()) > float(np.asarray(enhanceWeak).std()),
    }
  exercise:
    prompt: EMBOSS 결과의 평균을 측정해 회색조(127 부근)에 가까운지 확인하세요. 절대 차이가 30 이하면 회색조에 가깝다고 봅니다.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageFilter
      from sklearn.datasets import load_sample_image

      meanCanvas = Image.fromarray(load_sample_image('flower.jpg')).filter(ImageFilter.EMBOSS)
      embossMean = float(np.asarray(meanCanvas).mean())
      {'embossMean': round(embossMean, 2), 'closeToGray': abs(embossMean - 127) < ___}
    hints:
    - 거리 허용 30입니다.
    - 빈칸에는 30이 들어갑니다.
    check:
      noError: EMBOSS 호출이 끝나야 합니다.
      resultCheck: closeToGray가 True이거나 False (확인 자체가 의미)여야 합니다.
  check:
    noError: 세 filter 호출이 끝나야 합니다.
    resultCheck: enhanceIncreases가 True이고 strongerThanWeak가 True여야 합니다.
- id: step6_smooth
  title: 6단계. SMOOTH와 DETAIL
  structuredPrimary: true
  subtitle: 반대 효과 한 쌍
  goal: ImageFilter.SMOOTH, SMOOTH_MORE, DETAIL 세 필터를 적용해 SMOOTH 계열은 std가 줄고 DETAIL은 std가 늘어나는 반대 효과를 확인합니다.
  why: SMOOTH는 노이즈 제거에 가깝고 DETAIL은 세부 사항 강조에 가깝습니다. 두 필터가 정반대 방향으로 작용하므로 한 셀에서 비교해 둬야 어떤 입력에 어느 필터가 적합한지 알 수 있습니다.
  explanation: |-
    SMOOTH/SMOOTH_MORE는 부드럽게 만드는 필터로 BLUR와 비슷하지만 더 약합니다. 결과 std가 약간 줄어듭니다.
    DETAIL은 미세한 디테일을 강조해 SHARPEN/EDGE_ENHANCE보다 약한 강도로 작동합니다. 결과 std가 약간 늘어납니다.
    이 두 필터는 효과가 약해 사진의 전체 톤을 크게 바꾸지 않으면서 미세 조정에 적합합니다.
  tips:
  - SMOOTH는 약한 노이즈 제거에 적합합니다. 강한 노이즈에는 GaussianBlur나 cv2.medianBlur가 더 효과적입니다.
  - DETAIL은 인물 사진의 피부 디테일을 강조할 때 유용합니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageFilter
    from sklearn.datasets import load_sample_image

    smoothCanvas = Image.fromarray(load_sample_image('flower.jpg'))
    baseStd = float(np.asarray(smoothCanvas).std())

    smooth = smoothCanvas.filter(ImageFilter.SMOOTH)
    smoothMore = smoothCanvas.filter(ImageFilter.SMOOTH_MORE)
    detail = smoothCanvas.filter(ImageFilter.DETAIL)

    {
        'baseStd': round(baseStd, 2),
        'smoothStd': round(float(np.asarray(smooth).std()), 2),
        'smoothMoreStd': round(float(np.asarray(smoothMore).std()), 2),
        'detailStd': round(float(np.asarray(detail).std()), 2),
        'smoothDecreases': float(np.asarray(smoothMore).std()) <= baseStd,
        'detailIncreases': float(np.asarray(detail).std()) >= baseStd,
    }
  exercise:
    prompt: SMOOTH 결과에 다시 DETAIL을 적용해 std가 원본 근처로 회복되는지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageFilter
      from sklearn.datasets import load_sample_image

      roundCanvas = Image.fromarray(load_sample_image('flower.jpg'))
      baseStd = float(np.asarray(roundCanvas).std())
      smoothed = roundCanvas.filter(ImageFilter.SMOOTH)
      back = smoothed.filter(ImageFilter.___)
      {'backStd': round(float(np.asarray(back).std()), 2), 'baseStd': round(baseStd, 2)}
    hints:
    - 강조 필터는 DETAIL입니다.
    - 빈칸에는 DETAIL이 들어갑니다.
    check:
      noError: filter 두 호출이 끝나야 합니다.
      resultCheck: backStd가 양수여야 합니다.
  check:
    noError: 세 filter 호출이 끝나야 합니다.
    resultCheck: smoothDecreases와 detailIncreases 모두 True여야 합니다.
- id: practice
  title: 실습 - 종합 필터 진단 함수
  structuredPrimary: true
  subtitle: 여섯 필터 한 dict
  goal: applyFilters(image) 함수가 BLUR/SHARPEN/CONTOUR/FIND_EDGES/SMOOTH/DETAIL 여섯 필터를 모두 적용해 std/mean을 dict로 돌려주도록 만듭니다.
  why: 여섯 필터를 한 함수에 묶어 두면 새 입력을 받아도 같은 형식의 dict가 나옵니다. 자동화 보고서와 단위 테스트의 표준 입력이 됩니다.
  explanation: |-
    applyFilters 함수는 입력 Image에 6개 필터를 차례로 적용하고 각 결과의 std/mean을 dict로 보고합니다. 키는 필터 이름과 일치시켜 가독성을 높입니다.
    이 형식 dict는 두 사진을 같은 형식으로 비교할 수 있어 회귀 테스트로 그대로 쓸 수 있습니다. 알고리즘 변경 후 두 사진에 같은 함수를 돌려 dict 차이를 비교하면 변화가 보입니다.
    실무에서는 함수에 필터 인자를 추가해 호출자가 선택 가능하게 만드는 것이 일반적입니다.
  tips:
  - dict 키 이름이 같은 함수 호출 인자에 직접 매핑되도록 설계하면 enum/literal 타이핑이 안전합니다.
  - 함수 안에서 NumPy 변환을 자주 하면 비쌉니다. 대량 처리에는 한 번에 변환 후 인덱싱이 더 빠릅니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageFilter
    from sklearn.datasets import load_sample_image


    def applyFilters(image: Image.Image) -> dict:
        arr = lambda im: np.asarray(im)
        return {
            'base': {'std': round(float(arr(image).std()), 2), 'mean': round(float(arr(image).mean()), 2)},
            'blur': {'std': round(float(arr(image.filter(ImageFilter.GaussianBlur(radius=3))).std()), 2)},
            'sharpen': {'std': round(float(arr(image.filter(ImageFilter.SHARPEN)).std()), 2)},
            'contour': {'mean': round(float(arr(image.filter(ImageFilter.CONTOUR)).mean()), 2)},
            'findEdges': {'mean': round(float(arr(image.filter(ImageFilter.FIND_EDGES)).mean()), 2)},
            'smooth': {'std': round(float(arr(image.filter(ImageFilter.SMOOTH)).std()), 2)},
            'detail': {'std': round(float(arr(image.filter(ImageFilter.DETAIL)).std()), 2)},
        }


    applyFilters(Image.fromarray(load_sample_image('flower.jpg')))
  exercise:
    prompt: 같은 함수를 china 입력에 적용해 결과의 sharpen std가 base std보다 큰지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageFilter
      from sklearn.datasets import load_sample_image


      def applyFilters(image):
          arr = lambda im: np.asarray(im)
          return {
              'base': {'std': round(float(arr(image).std()), 2)},
              'sharpen': {'std': round(float(arr(image.filter(ImageFilter.SHARPEN)).std()), 2)},
          }


      chinaResult = applyFilters(Image.fromarray(load_sample_image('___')))
      {'sharpenIncreases': chinaResult['sharpen']['std'] > chinaResult['base']['std']}
    hints:
    - china 파일명을 넣습니다.
    - 빈칸에는 china.jpg가 들어갑니다.
    check:
      noError: applyFilters 정의와 호출이 끝나야 합니다.
      resultCheck: sharpenIncreases가 True여야 합니다.
  check:
    noError: applyFilters 정의와 호출이 끝나야 합니다.
    resultCheck: 결과 dict가 'base', 'blur', 'sharpen', 'contour', 'findEdges', 'smooth', 'detail' 7개 키를 가져야 합니다.
- id: workflow_validation
  title: 7단계. blur radius 가드 + 단조성 회귀 테스트
  structuredPrimary: true
  subtitle: validateBlurRadius + std 단조성
  goal: validateBlurRadius 함수가 음수 radius를 ValueError로 차단하고, GaussianBlur 결과의 std가 radius 증가에 따라 단조 감소하는지 회귀 테스트로 확인합니다.
  why: GaussianBlur는 음수 radius에 잘못된 결과를 줄 수 있습니다. 함수 입구에서 차단하면 그 사고가 막힙니다. 단조성 검증은 알고리즘이 의도대로 동작하는지의 1줄 회귀 테스트입니다.
  explanation: |-
    validateBlurRadius는 radius >= 0 한 조건만 검사합니다. 음수면 ValueError를 던지고 메시지에 실제 값을 포함시킵니다.
    회귀 테스트는 radius=1과 radius=5의 결과 std를 비교합니다. radius가 클수록 std가 작아져야 정상입니다. 이 단조성이 깨지면 알고리즘에 버그가 있다는 신호입니다.
    합성 입력은 ImageDraw로 만든 작은 흑백 이미지로 정답 std를 명시적으로 계산할 수 있어 회귀 테스트로 적합합니다.
  tips:
  - "ValueError 메시지에 실제 받은 값을 포함시키면 호출자가 즉시 원인을 알 수 있습니다."
  - 단조성 회귀 테스트는 알고리즘 변경 후 가장 먼저 돌려 보는 안전망입니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageDraw, ImageFilter


    def validateBlurRadius(radius: float) -> bool:
        if radius < 0:
            raise ValueError(f"blur radius는 0 이상이어야 합니다: {radius}")
        return True


    filterImage = Image.new('L', (140, 100), 80)
    filterDraw = ImageDraw.Draw(filterImage)
    filterDraw.rectangle((30, 25, 110, 75), fill=210)
    filterDraw.line((30, 25, 110, 75), fill=20, width=4)

    baseStd = float(np.asarray(filterImage).std())
    validateBlurRadius(2)
    blur1 = filterImage.filter(ImageFilter.GaussianBlur(radius=1))
    blur5 = filterImage.filter(ImageFilter.GaussianBlur(radius=5))

    try:
        validateBlurRadius(-1)
        negMessage = 'unexpected pass'
    except ValueError as exc:
        negMessage = str(exc)

    {
        'baseStd': round(baseStd, 2),
        'blur1Std': round(float(np.asarray(blur1).std()), 2),
        'blur5Std': round(float(np.asarray(blur5).std()), 2),
        'monotonicDecrease': baseStd >= float(np.asarray(blur1).std()) >= float(np.asarray(blur5).std()),
        'negMessage': negMessage,
    }
  exercise:
    prompt: validateBlurRadius에 0.0을 넘기면 정상 통과하는지 확인하세요. 0은 음수가 아니므로 ValueError가 나지 않아야 합니다.
    starterCode: |-
      def validateBlurRadius(radius):
          if radius < 0:
              raise ValueError(f"blur radius는 0 이상이어야 합니다: {radius}")
          return True


      zeroResult = validateBlurRadius(___)
      {'zeroResult': zeroResult, 'isTrue': zeroResult is True}
    hints:
    - 0.0을 인자에 넣습니다.
    - 빈칸에는 0.0이 들어갑니다.
    check:
      noError: validateBlurRadius 호출이 끝나야 합니다.
      resultCheck: isTrue가 True여야 합니다.
  check:
    noError: validateBlurRadius와 GaussianBlur 호출이 끝나야 합니다.
    resultCheck: monotonicDecrease가 True이고 negMessage에 '0 이상' 단서가 포함되어야 합니다.
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
  - id: pillow_04-photo_filter-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - workflow_validation
    title: 사진 필터 스튜디오 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: filter 종류·홀수 kernel·strength 범위를 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_photo_filter_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_photo_filter_contract(value):
            raise NotImplementedError
      solution: |
        def audit_photo_filter_contract(value):
            required = ['filter', 'kernelSize', 'strength']
            rules = [{'id': 'filter', 'field': 'filter', 'kind': 'enum', 'values': ['blur', 'sharpen', 'detail', 'edge']}, {'id': 'kernel', 'field': 'kernelSize', 'kind': 'odd'}, {'id': 'strength', 'field': 'strength', 'kind': 'range', 'min': 0, 'max': 3}]
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
            return {"accepted": not missing and not violations, "topic": 'photo_filter', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.pillow.pillow_04.photo_filter-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_04.photo_filter-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_photo_filter_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              filter: sharpen
              kernelSize: 3
              strength: 1.2
          expectedReturn:
            accepted: true
            topic: photo_filter
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              kernelSize: 3
              strength: 1.2
          expectedReturn:
            accepted: false
            topic: photo_filter
            missing:
            - filter
            violations:
            - filter
        - id: reports-topic-invariants
          arguments:
          - value:
              filter: magic
              kernelSize: 4
              strength: 5
          expectedReturn:
            accepted: false
            topic: photo_filter
            missing: []
            violations:
            - filter
            - kernel
            - strength
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pillow_04-photo_filter-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_04-photo_filter-contract-audit-mastery
    title: 사진 필터 스튜디오 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_photo_filter_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_photo_filter_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_photo_filter_result(expected, observed):
            identity = ['sourceHash', 'filterId']
            metrics = {'edgeEnergy': 0.5}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'photo_filter', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.pillow.pillow_04.photo_filter-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_04.photo_filter-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_photo_filter_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: pf1
              filterId: sharp-3
              edgeEnergy: 0.7
          - value:
              sourceHash: pf1
              filterId: sharp-3
              edgeEnergy: 0.72
          expectedReturn:
            passed: true
            topic: photo_filter
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: pf1
              filterId: sharp-3
              edgeEnergy: 0.7
          - value:
              sourceHash: pf2
              filterId: blur-4
              edgeEnergy: 0.2
          expectedReturn:
            passed: false
            topic: photo_filter
            missing: []
            identityMismatch:
            - filterId
            - sourceHash
            metricDrift: []
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: pf1
              filterId: sharp-3
              edgeEnergy: 0.7
          - value: {}
          expectedReturn:
            passed: false
            topic: photo_filter
            missing:
            - edgeEnergy
            - filterId
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pillow_04-photo_filter-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_04-photo_filter-result-reconciliation-transfer
    title: 사진 필터 스튜디오 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_photo_filter_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_photo_filter_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_photo_filter_evidence(stage):
            stages = {'source': {'action': 'admit photo filter source', 'evidence': 'filter kernel strength', 'risk': 'unsafe or misread image'}, 'edit': {'action': 'apply bounded photo filter edit', 'evidence': 'bounded convolution recipe', 'risk': 'quality or geometry loss'}, 'artifact': {'action': 'reopen photo filter artifact', 'evidence': 'edge-energy comparison', 'risk': 'corrupt or visually wrong output'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.pillow.pillow_04.photo_filter-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_04.photo_filter-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_photo_filter_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: admit photo filter source
            evidence: filter kernel strength
            risk: unsafe or misread image
        - id: recalls-edit
          arguments:
          - value: edit
          expectedReturn:
            action: apply bounded photo filter edit
            evidence: bounded convolution recipe
            risk: quality or geometry loss
        - id: recalls-artifact
          arguments:
          - value: artifact
          expectedReturn:
            action: reopen photo filter artifact
            evidence: edge-energy comparison
            risk: corrupt or visually wrong output
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};