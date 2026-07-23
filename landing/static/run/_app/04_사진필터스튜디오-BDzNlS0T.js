var e=`meta:\r
  packages:\r
  - numpy\r
  - pillow\r
  - scikit-learn\r
  id: pillow_04\r
  title: 사진필터스튜디오\r
  order: 4\r
  category: pillow\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - Pillow\r
  - ImageFilter\r
  - BLUR\r
  - SHARPEN\r
  - CONTOUR\r
  - EDGE\r
  seo:\r
    title: Pillow 기초 - 사진 필터 스튜디오\r
    description: Pillow ImageFilter로 BLUR/SHARPEN/CONTOUR/EDGE_ENHANCE 효과를 비교 적용하고 픽셀 통계로 정량 검증합니다.\r
    keywords:\r
    - Pillow\r
    - ImageFilter\r
    - BLUR\r
    - SHARPEN\r
    - 필터\r
    - 이미지효과\r
intro:\r
  emoji: 🎭\r
  goal: ImageFilter의 BLUR/SHARPEN/CONTOUR/EDGE_ENHANCE/EMBOSS/SMOOTH 여섯 필터를 같은 입력에 적용해 픽셀 표준편차 변화로 정량 비교합니다.\r
  description: Pillow ImageFilter는 미리 정의된 컨볼루션 커널 모음입니다. filter(name) 한 줄로 적용되지만 효과 강도와 출력 특성은 필터마다 크게 다릅니다.\r
  direction: 합성 입력에 여섯 필터를 적용하고 std/mean 같은 통계 dict로 결과를 비교한 뒤, GaussianBlur 파라미터 효과까지 다룹니다.\r
  benefits:\r
  - filter(ImageFilter.BLUR)와 GaussianBlur(radius) 두 호출 방식을 비교합니다.\r
  - SHARPEN, EDGE_ENHANCE의 결과가 원본보다 표준편차가 크게 나오는 단조성을 확인합니다.\r
  - FIND_EDGES의 결과가 검은 배경 + 흰 윤곽선의 분포를 갖는지 검증합니다.\r
  - validateBlurRadius로 음수 radius를 차단하는 가드 패턴을 잡습니다.\r
  diagram:\r
    steps:\r
    - label: RGB 입력 로드\r
      detail: flower 샘플을 Image.fromarray로 RGB Image로 만듭니다.\r
    - label: BLUR vs GaussianBlur\r
      detail: ImageFilter.BLUR 기본 vs GaussianBlur(radius=N) 파라미터 비교.\r
    - label: SHARPEN과 EDGE_ENHANCE\r
      detail: 경계 강조 필터로 표준편차가 늘어나는지 확인.\r
    - label: CONTOUR와 FIND_EDGES\r
      detail: 윤곽선 추출 필터의 출력 분포 검증.\r
    - label: 비교 dict\r
      detail: 여섯 필터 결과의 std/mean을 한 dict로 정리.\r
    runtime:\r
    - label: pillow + numpy\r
      detail: 필터 결과를 NumPy로 변환해 표준편차/평균 통계를 계산합니다.\r
    - label: 단일 RGB 원본\r
      detail: 첫 셀의 canvas 객체가 이후 모든 필터 셀의 공통 입력.\r
    - label: filter는 새 객체\r
      detail: filter 호출은 새 Image를 돌려주고 원본은 그대로 유지됩니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 필터 원본 만들기\r
  structuredPrimary: true\r
  subtitle: flower RGB Image\r
  goal: flower 샘플을 Pillow Image로 만들고 픽셀 표준편차를 측정해 이후 필터 결과 비교의 기준값을 정합니다.\r
  why: 필터의 효과는 픽셀 분산이 변하는 정도로 측정할 수 있습니다. 원본의 표준편차를 알면 BLUR 후 줄어들었는지, SHARPEN 후 늘었는지를 객관적으로 비교할 수 있습니다.\r
  explanation: |-\r
    sklearn flower 샘플은 색 변화가 풍부한 사진이라 필터 효과가 잘 드러납니다. Image.fromarray로 RGB Image를 만들고, NumPy 통계로 원본의 표준편차를 측정합니다.\r
    이 표준편차가 모든 필터 비교의 기준값입니다. BLUR/SMOOTH는 이 값보다 결과 std가 작아지고, SHARPEN/EDGE_ENHANCE는 더 커집니다.\r
  tips:\r
  - "ImageFilter는 별도 import가 필요합니다: from PIL import Image, ImageFilter."\r
  - getextrema()로 색공간별 (min, max) 범위를 한 번에 얻을 수 있습니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageFilter\r
    from sklearn.datasets import load_sample_image\r
\r
    canvas = Image.fromarray(load_sample_image('flower.jpg'))\r
    canvasArr = np.asarray(canvas)\r
\r
    {\r
        'mode': canvas.mode,\r
        'size': canvas.size,\r
        'baseStd': round(float(canvasArr.std()), 2),\r
        'baseMean': round(float(canvasArr.mean()), 2),\r
    }\r
  exercise:\r
    prompt: china 입력의 표준편차를 측정해 flower의 baseStd와 비교하세요. china가 풍경이라 std가 더 작을 수 있습니다.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      chinaCanvas = Image.fromarray(load_sample_image('___'))\r
      chinaStd = round(float(np.asarray(chinaCanvas).std()), 2)\r
      {'chinaStd': chinaStd}\r
    hints:\r
    - china 파일명을 넣습니다.\r
    - 빈칸에는 china.jpg가 들어갑니다.\r
    check:\r
      noError: load_sample_image와 std 계산이 끝나야 합니다.\r
      resultCheck: chinaStd가 양수여야 합니다.\r
  check:\r
    noError: load_sample_image와 std 계산이 끝나야 합니다.\r
    resultCheck: mode가 'RGB', size가 (640, 427), baseStd가 양수여야 합니다.\r
- id: step2_blur\r
  title: 2단계. BLUR vs GaussianBlur\r
  structuredPrimary: true\r
  subtitle: 기본 vs 파라미터 조절\r
  goal: ImageFilter.BLUR와 GaussianBlur(radius=2/5) 결과의 표준편차를 비교해 radius가 클수록 std가 더 작아지는 단조성을 확인합니다.\r
  why: BLUR는 고정 3×3 커널이라 효과 강도를 조절할 수 없습니다. GaussianBlur는 radius로 강도를 조정할 수 있어 실무에서 훨씬 자주 쓰입니다. 둘을 한 셀에서 비교해 두면 사용처 감각이 잡힙니다.\r
  explanation: |-\r
    ImageFilter.BLUR는 3×3 균등 평균 커널을 적용하는 미리 정의된 필터입니다. radius를 조정할 수 없습니다.\r
    ImageFilter.GaussianBlur(radius)는 가우시안 가중 평균을 적용합니다. radius는 표준편차에 대응되며 클수록 흐림이 강합니다. 결과 std는 radius와 반비례합니다.\r
    검증은 세 결과의 std를 비교합니다. 원본 > BLUR > GaussianBlur(2) > GaussianBlur(5) 순서가 일반적입니다.\r
  tips:\r
  - GaussianBlur(radius=0)은 원본을 그대로 돌려줍니다. radius 1이 매우 약한 블러의 시작점입니다.\r
  - 컬러 입력에서는 채널별로 같은 필터가 적용되므로 mode와 size가 유지됩니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageFilter\r
    from sklearn.datasets import load_sample_image\r
\r
    blurCanvas = Image.fromarray(load_sample_image('flower.jpg'))\r
    baseStd = float(np.asarray(blurCanvas).std())\r
\r
    blurDefault = blurCanvas.filter(ImageFilter.BLUR)\r
    blurGauss2 = blurCanvas.filter(ImageFilter.GaussianBlur(radius=2))\r
    blurGauss5 = blurCanvas.filter(ImageFilter.GaussianBlur(radius=5))\r
\r
    {\r
        'baseStd': round(baseStd, 2),\r
        'defaultStd': round(float(np.asarray(blurDefault).std()), 2),\r
        'gauss2Std': round(float(np.asarray(blurGauss2).std()), 2),\r
        'gauss5Std': round(float(np.asarray(blurGauss5).std()), 2),\r
        'monotonicDecrease': baseStd > float(np.asarray(blurGauss2).std()) > float(np.asarray(blurGauss5).std()),\r
    }\r
  exercise:\r
    prompt: GaussianBlur(radius=10)을 적용해 std가 radius=5보다 더 작은지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageFilter\r
      from sklearn.datasets import load_sample_image\r
\r
      strongBlur = Image.fromarray(load_sample_image('flower.jpg')).filter(ImageFilter.GaussianBlur(radius=___))\r
      {'strongStd': round(float(np.asarray(strongBlur).std()), 2)}\r
    hints:\r
    - radius 인자에 10이 들어갑니다.\r
    - 빈칸에는 10이 들어갑니다.\r
    check:\r
      noError: GaussianBlur 호출이 끝나야 합니다.\r
      resultCheck: strongStd가 양수여야 합니다.\r
  check:\r
    noError: 세 filter 호출이 끝나야 합니다.\r
    resultCheck: monotonicDecrease가 True이고 gauss5Std가 baseStd보다 명백히 작아야 합니다.\r
- id: step3_sharpen\r
  title: 3단계. SHARPEN과 UnsharpMask\r
  structuredPrimary: true\r
  subtitle: 경계 강조 → std 증가\r
  goal: ImageFilter.SHARPEN과 UnsharpMask 결과의 표준편차가 원본보다 커지는지 확인하고, UnsharpMask의 percent 파라미터 효과를 비교합니다.\r
  why: 샤픈은 BLUR의 정반대로 경계 픽셀의 대비를 키웁니다. 효과 강도는 표준편차 증가량으로 측정 가능합니다. UnsharpMask는 사진 보정에서 가장 자주 쓰는 샤픈 함수입니다.\r
  explanation: |-\r
    ImageFilter.SHARPEN은 고정 강도의 샤프닝 필터입니다. UnsharpMask(radius, percent, threshold)는 더 정교한 조절이 가능합니다.\r
    UnsharpMask의 percent는 강도 백분율입니다. 100이 보통, 200이 두 배 강도입니다. threshold는 적용할 최소 픽셀 차이로, 노이즈를 키우지 않으려면 3~5 정도가 안전합니다.\r
    검증은 결과 std가 원본보다 명확히 큰지로 합니다. SHARPEN과 UnsharpMask 모두 std를 증가시켜야 정상 동작입니다.\r
  tips:\r
  - UnsharpMask는 운영에서 사진 톤 보정의 표준 도구입니다. radius=2, percent=150, threshold=3이 사진 일반화 시작점입니다.\r
  - "샤픈을 너무 강하게 주면 노이즈가 함께 커집니다. percent는 200을 잘 넘기지 않습니다."\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageFilter\r
    from sklearn.datasets import load_sample_image\r
\r
    sharpCanvas = Image.fromarray(load_sample_image('flower.jpg'))\r
    baseStd = float(np.asarray(sharpCanvas).std())\r
\r
    sharpened = sharpCanvas.filter(ImageFilter.SHARPEN)\r
    unsharp100 = sharpCanvas.filter(ImageFilter.UnsharpMask(radius=2, percent=100, threshold=3))\r
    unsharp200 = sharpCanvas.filter(ImageFilter.UnsharpMask(radius=2, percent=200, threshold=3))\r
\r
    {\r
        'baseStd': round(baseStd, 2),\r
        'sharpenStd': round(float(np.asarray(sharpened).std()), 2),\r
        'unsharp100Std': round(float(np.asarray(unsharp100).std()), 2),\r
        'unsharp200Std': round(float(np.asarray(unsharp200).std()), 2),\r
        'sharpenIncreases': float(np.asarray(sharpened).std()) > baseStd,\r
        'monotonicIncrease': baseStd <= float(np.asarray(unsharp100).std()) <= float(np.asarray(unsharp200).std()),\r
    }\r
  exercise:\r
    prompt: UnsharpMask percent를 400으로 매우 강하게 주면 결과 std가 200 케이스보다 더 큰지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageFilter\r
      from sklearn.datasets import load_sample_image\r
\r
      extremeCanvas = Image.fromarray(load_sample_image('flower.jpg'))\r
      extreme = extremeCanvas.filter(ImageFilter.UnsharpMask(radius=2, percent=___, threshold=3))\r
      {'extremeStd': round(float(np.asarray(extreme).std()), 2)}\r
    hints:\r
    - percent 인자에 400을 넣습니다.\r
    - 빈칸에는 400이 들어갑니다.\r
    check:\r
      noError: UnsharpMask 호출이 끝나야 합니다.\r
      resultCheck: extremeStd가 양수여야 합니다.\r
  check:\r
    noError: filter 호출들이 끝나야 합니다.\r
    resultCheck: sharpenIncreases가 True이고 monotonicIncrease가 True여야 합니다.\r
- id: step4_edge\r
  title: 4단계. CONTOUR와 FIND_EDGES\r
  structuredPrimary: true\r
  subtitle: 윤곽선 추출 필터\r
  goal: ImageFilter.CONTOUR와 FIND_EDGES 결과의 평균/표준편차를 비교해 검은 배경 + 흰 윤곽선 분포가 만들어지는지 확인합니다.\r
  why: 윤곽선 추출 필터는 입력에서 경계만 강조하고 나머지를 어둡게 만듭니다. 결과 평균이 매우 작아지고(검은 배경) 표준편차는 모서리 분포에 의해 정해지는 분포 특성을 가집니다.\r
  explanation: |-\r
    ImageFilter.CONTOUR는 윤곽선만 남기고 안쪽을 흰색으로 채웁니다. 결과 mean이 원본보다 큽니다(흰색이 많음).\r
    ImageFilter.FIND_EDGES는 Sobel 같은 에지 검출을 적용해 경계만 흰색으로 표시합니다. 결과 mean이 매우 작아지고(검은 배경) std는 모서리 픽셀 분포에 의해 정해집니다.\r
    두 결과는 같은 "윤곽선 강조"지만 출력 분포가 정반대라는 점이 핵심입니다. 자동화에서 어떤 결과가 필요한지에 따라 골라 씁니다.\r
  tips:\r
  - "FIND_EDGES는 컬러 입력에 각 채널별로 적용됩니다. 단채널 입력이 일반적이지만 컬러도 동작합니다."\r
  - CONTOUR + 이진화 조합은 흰 배경에 검은 윤곽선의 그림 같은 효과를 줍니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageFilter\r
    from sklearn.datasets import load_sample_image\r
\r
    edgeCanvas = Image.fromarray(load_sample_image('flower.jpg'))\r
    baseMean = float(np.asarray(edgeCanvas).mean())\r
\r
    contour = edgeCanvas.filter(ImageFilter.CONTOUR)\r
    findEdges = edgeCanvas.filter(ImageFilter.FIND_EDGES)\r
\r
    {\r
        'baseMean': round(baseMean, 2),\r
        'contourMean': round(float(np.asarray(contour).mean()), 2),\r
        'findEdgesMean': round(float(np.asarray(findEdges).mean()), 2),\r
        'contourBrighter': float(np.asarray(contour).mean()) > baseMean,\r
        'findEdgesDarker': float(np.asarray(findEdges).mean()) < baseMean,\r
    }\r
  exercise:\r
    prompt: 그레이스케일로 먼저 변환한 뒤 FIND_EDGES를 적용해 결과 평균이 일반 컬러 입력과 다른지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageFilter\r
      from sklearn.datasets import load_sample_image\r
\r
      grayEdgeCanvas = Image.fromarray(load_sample_image('flower.jpg')).convert('___')\r
      grayEdges = grayEdgeCanvas.filter(ImageFilter.FIND_EDGES)\r
      {'grayEdgesMean': round(float(np.asarray(grayEdges).mean()), 2)}\r
    hints:\r
    - 그레이스케일 mode는 'L'입니다.\r
    - 빈칸에는 L이 들어갑니다.\r
    check:\r
      noError: convert와 filter 호출이 끝나야 합니다.\r
      resultCheck: grayEdgesMean이 0~255 범위 안에 있어야 합니다.\r
  check:\r
    noError: CONTOUR와 FIND_EDGES 호출이 끝나야 합니다.\r
    resultCheck: contourBrighter와 findEdgesDarker 모두 True여야 합니다.\r
- id: step5_emboss\r
  title: 5단계. EMBOSS와 EDGE_ENHANCE\r
  structuredPrimary: true\r
  subtitle: 강조 효과 비교\r
  goal: EMBOSS, EDGE_ENHANCE, EDGE_ENHANCE_MORE 세 필터의 결과 std를 비교해 강조 강도의 단조성을 확인합니다.\r
  why: 강조 필터는 SHARPEN과 비슷하지만 효과 방식이 다릅니다. EMBOSS는 입체감 양각, EDGE_ENHANCE는 경계 강조입니다. 세 필터를 한 셀에서 비교해 둬야 차이가 명확합니다.\r
  explanation: |-\r
    EMBOSS는 양각 효과로 입체감을 만듭니다. 결과는 회색조에 가까운 톤이 됩니다.\r
    EDGE_ENHANCE는 경계선을 약하게 강조합니다. EDGE_ENHANCE_MORE는 더 강한 강조입니다. 두 필터 모두 std가 원본보다 커집니다.\r
    SHARPEN과 EDGE_ENHANCE는 비슷한 효과지만 EDGE_ENHANCE가 더 부드럽고 자연스럽습니다. 사진 보정에서 EDGE_ENHANCE가 더 자주 쓰입니다.\r
  tips:\r
  - EMBOSS는 그래픽 효과로 사용되지만 자동화에서는 거의 쓰이지 않습니다.\r
  - EDGE_ENHANCE_MORE는 노이즈를 함께 키울 수 있어 깨끗한 입력에 한정해 씁니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageFilter\r
    from sklearn.datasets import load_sample_image\r
\r
    enhanceCanvas = Image.fromarray(load_sample_image('flower.jpg'))\r
    baseStd = float(np.asarray(enhanceCanvas).std())\r
\r
    emboss = enhanceCanvas.filter(ImageFilter.EMBOSS)\r
    enhanceWeak = enhanceCanvas.filter(ImageFilter.EDGE_ENHANCE)\r
    enhanceStrong = enhanceCanvas.filter(ImageFilter.EDGE_ENHANCE_MORE)\r
\r
    {\r
        'baseStd': round(baseStd, 2),\r
        'embossStd': round(float(np.asarray(emboss).std()), 2),\r
        'enhanceWeakStd': round(float(np.asarray(enhanceWeak).std()), 2),\r
        'enhanceStrongStd': round(float(np.asarray(enhanceStrong).std()), 2),\r
        'enhanceIncreases': float(np.asarray(enhanceWeak).std()) > baseStd,\r
        'strongerThanWeak': float(np.asarray(enhanceStrong).std()) > float(np.asarray(enhanceWeak).std()),\r
    }\r
  exercise:\r
    prompt: EMBOSS 결과의 평균을 측정해 회색조(127 부근)에 가까운지 확인하세요. 절대 차이가 30 이하면 회색조에 가깝다고 봅니다.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageFilter\r
      from sklearn.datasets import load_sample_image\r
\r
      meanCanvas = Image.fromarray(load_sample_image('flower.jpg')).filter(ImageFilter.EMBOSS)\r
      embossMean = float(np.asarray(meanCanvas).mean())\r
      {'embossMean': round(embossMean, 2), 'closeToGray': abs(embossMean - 127) < ___}\r
    hints:\r
    - 거리 허용 30입니다.\r
    - 빈칸에는 30이 들어갑니다.\r
    check:\r
      noError: EMBOSS 호출이 끝나야 합니다.\r
      resultCheck: closeToGray가 True이거나 False (확인 자체가 의미)여야 합니다.\r
  check:\r
    noError: 세 filter 호출이 끝나야 합니다.\r
    resultCheck: enhanceIncreases가 True이고 strongerThanWeak가 True여야 합니다.\r
- id: step6_smooth\r
  title: 6단계. SMOOTH와 DETAIL\r
  structuredPrimary: true\r
  subtitle: 반대 효과 한 쌍\r
  goal: ImageFilter.SMOOTH, SMOOTH_MORE, DETAIL 세 필터를 적용해 SMOOTH 계열은 std가 줄고 DETAIL은 std가 늘어나는 반대 효과를 확인합니다.\r
  why: SMOOTH는 노이즈 제거에 가깝고 DETAIL은 세부 사항 강조에 가깝습니다. 두 필터가 정반대 방향으로 작용하므로 한 셀에서 비교해 둬야 어떤 입력에 어느 필터가 적합한지 알 수 있습니다.\r
  explanation: |-\r
    SMOOTH/SMOOTH_MORE는 부드럽게 만드는 필터로 BLUR와 비슷하지만 더 약합니다. 결과 std가 약간 줄어듭니다.\r
    DETAIL은 미세한 디테일을 강조해 SHARPEN/EDGE_ENHANCE보다 약한 강도로 작동합니다. 결과 std가 약간 늘어납니다.\r
    이 두 필터는 효과가 약해 사진의 전체 톤을 크게 바꾸지 않으면서 미세 조정에 적합합니다.\r
  tips:\r
  - SMOOTH는 약한 노이즈 제거에 적합합니다. 강한 노이즈에는 GaussianBlur나 cv2.medianBlur가 더 효과적입니다.\r
  - DETAIL은 인물 사진의 피부 디테일을 강조할 때 유용합니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageFilter\r
    from sklearn.datasets import load_sample_image\r
\r
    smoothCanvas = Image.fromarray(load_sample_image('flower.jpg'))\r
    baseStd = float(np.asarray(smoothCanvas).std())\r
\r
    smooth = smoothCanvas.filter(ImageFilter.SMOOTH)\r
    smoothMore = smoothCanvas.filter(ImageFilter.SMOOTH_MORE)\r
    detail = smoothCanvas.filter(ImageFilter.DETAIL)\r
\r
    {\r
        'baseStd': round(baseStd, 2),\r
        'smoothStd': round(float(np.asarray(smooth).std()), 2),\r
        'smoothMoreStd': round(float(np.asarray(smoothMore).std()), 2),\r
        'detailStd': round(float(np.asarray(detail).std()), 2),\r
        'smoothDecreases': float(np.asarray(smoothMore).std()) <= baseStd,\r
        'detailIncreases': float(np.asarray(detail).std()) >= baseStd,\r
    }\r
  exercise:\r
    prompt: SMOOTH 결과에 다시 DETAIL을 적용해 std가 원본 근처로 회복되는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageFilter\r
      from sklearn.datasets import load_sample_image\r
\r
      roundCanvas = Image.fromarray(load_sample_image('flower.jpg'))\r
      baseStd = float(np.asarray(roundCanvas).std())\r
      smoothed = roundCanvas.filter(ImageFilter.SMOOTH)\r
      back = smoothed.filter(ImageFilter.___)\r
      {'backStd': round(float(np.asarray(back).std()), 2), 'baseStd': round(baseStd, 2)}\r
    hints:\r
    - 강조 필터는 DETAIL입니다.\r
    - 빈칸에는 DETAIL이 들어갑니다.\r
    check:\r
      noError: filter 두 호출이 끝나야 합니다.\r
      resultCheck: backStd가 양수여야 합니다.\r
  check:\r
    noError: 세 filter 호출이 끝나야 합니다.\r
    resultCheck: smoothDecreases와 detailIncreases 모두 True여야 합니다.\r
- id: practice\r
  title: 실습 - 종합 필터 진단 함수\r
  structuredPrimary: true\r
  subtitle: 여섯 필터 한 dict\r
  goal: applyFilters(image) 함수가 BLUR/SHARPEN/CONTOUR/FIND_EDGES/SMOOTH/DETAIL 여섯 필터를 모두 적용해 std/mean을 dict로 돌려주도록 만듭니다.\r
  why: 여섯 필터를 한 함수에 묶어 두면 새 입력을 받아도 같은 형식의 dict가 나옵니다. 자동화 보고서와 단위 테스트의 표준 입력이 됩니다.\r
  explanation: |-\r
    applyFilters 함수는 입력 Image에 6개 필터를 차례로 적용하고 각 결과의 std/mean을 dict로 보고합니다. 키는 필터 이름과 일치시켜 가독성을 높입니다.\r
    이 형식 dict는 두 사진을 같은 형식으로 비교할 수 있어 회귀 테스트로 그대로 쓸 수 있습니다. 알고리즘 변경 후 두 사진에 같은 함수를 돌려 dict 차이를 비교하면 변화가 보입니다.\r
    실무에서는 함수에 필터 인자를 추가해 호출자가 선택 가능하게 만드는 것이 일반적입니다.\r
  tips:\r
  - dict 키 이름이 같은 함수 호출 인자에 직접 매핑되도록 설계하면 enum/literal 타이핑이 안전합니다.\r
  - 함수 안에서 NumPy 변환을 자주 하면 비쌉니다. 대량 처리에는 한 번에 변환 후 인덱싱이 더 빠릅니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageFilter\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def applyFilters(image: Image.Image) -> dict:\r
        arr = lambda im: np.asarray(im)\r
        return {\r
            'base': {'std': round(float(arr(image).std()), 2), 'mean': round(float(arr(image).mean()), 2)},\r
            'blur': {'std': round(float(arr(image.filter(ImageFilter.GaussianBlur(radius=3))).std()), 2)},\r
            'sharpen': {'std': round(float(arr(image.filter(ImageFilter.SHARPEN)).std()), 2)},\r
            'contour': {'mean': round(float(arr(image.filter(ImageFilter.CONTOUR)).mean()), 2)},\r
            'findEdges': {'mean': round(float(arr(image.filter(ImageFilter.FIND_EDGES)).mean()), 2)},\r
            'smooth': {'std': round(float(arr(image.filter(ImageFilter.SMOOTH)).std()), 2)},\r
            'detail': {'std': round(float(arr(image.filter(ImageFilter.DETAIL)).std()), 2)},\r
        }\r
\r
\r
    applyFilters(Image.fromarray(load_sample_image('flower.jpg')))\r
  exercise:\r
    prompt: 같은 함수를 china 입력에 적용해 결과의 sharpen std가 base std보다 큰지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageFilter\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def applyFilters(image):\r
          arr = lambda im: np.asarray(im)\r
          return {\r
              'base': {'std': round(float(arr(image).std()), 2)},\r
              'sharpen': {'std': round(float(arr(image.filter(ImageFilter.SHARPEN)).std()), 2)},\r
          }\r
\r
\r
      chinaResult = applyFilters(Image.fromarray(load_sample_image('___')))\r
      {'sharpenIncreases': chinaResult['sharpen']['std'] > chinaResult['base']['std']}\r
    hints:\r
    - china 파일명을 넣습니다.\r
    - 빈칸에는 china.jpg가 들어갑니다.\r
    check:\r
      noError: applyFilters 정의와 호출이 끝나야 합니다.\r
      resultCheck: sharpenIncreases가 True여야 합니다.\r
  check:\r
    noError: applyFilters 정의와 호출이 끝나야 합니다.\r
    resultCheck: 결과 dict가 'base', 'blur', 'sharpen', 'contour', 'findEdges', 'smooth', 'detail' 7개 키를 가져야 합니다.\r
- id: workflow_validation\r
  title: 7단계. blur radius 가드 + 단조성 회귀 테스트\r
  structuredPrimary: true\r
  subtitle: validateBlurRadius + std 단조성\r
  goal: validateBlurRadius 함수가 음수 radius를 ValueError로 차단하고, GaussianBlur 결과의 std가 radius 증가에 따라 단조 감소하는지 회귀 테스트로 확인합니다.\r
  why: GaussianBlur는 음수 radius에 잘못된 결과를 줄 수 있습니다. 함수 입구에서 차단하면 그 사고가 막힙니다. 단조성 검증은 알고리즘이 의도대로 동작하는지의 1줄 회귀 테스트입니다.\r
  explanation: |-\r
    validateBlurRadius는 radius >= 0 한 조건만 검사합니다. 음수면 ValueError를 던지고 메시지에 실제 값을 포함시킵니다.\r
    회귀 테스트는 radius=1과 radius=5의 결과 std를 비교합니다. radius가 클수록 std가 작아져야 정상입니다. 이 단조성이 깨지면 알고리즘에 버그가 있다는 신호입니다.\r
    합성 입력은 ImageDraw로 만든 작은 흑백 이미지로 정답 std를 명시적으로 계산할 수 있어 회귀 테스트로 적합합니다.\r
  tips:\r
  - "ValueError 메시지에 실제 받은 값을 포함시키면 호출자가 즉시 원인을 알 수 있습니다."\r
  - 단조성 회귀 테스트는 알고리즘 변경 후 가장 먼저 돌려 보는 안전망입니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw, ImageFilter\r
\r
\r
    def validateBlurRadius(radius: float) -> bool:\r
        if radius < 0:\r
            raise ValueError(f"blur radius는 0 이상이어야 합니다: {radius}")\r
        return True\r
\r
\r
    filterImage = Image.new('L', (140, 100), 80)\r
    filterDraw = ImageDraw.Draw(filterImage)\r
    filterDraw.rectangle((30, 25, 110, 75), fill=210)\r
    filterDraw.line((30, 25, 110, 75), fill=20, width=4)\r
\r
    baseStd = float(np.asarray(filterImage).std())\r
    validateBlurRadius(2)\r
    blur1 = filterImage.filter(ImageFilter.GaussianBlur(radius=1))\r
    blur5 = filterImage.filter(ImageFilter.GaussianBlur(radius=5))\r
\r
    try:\r
        validateBlurRadius(-1)\r
        negMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        negMessage = str(exc)\r
\r
    {\r
        'baseStd': round(baseStd, 2),\r
        'blur1Std': round(float(np.asarray(blur1).std()), 2),\r
        'blur5Std': round(float(np.asarray(blur5).std()), 2),\r
        'monotonicDecrease': baseStd >= float(np.asarray(blur1).std()) >= float(np.asarray(blur5).std()),\r
        'negMessage': negMessage,\r
    }\r
  exercise:\r
    prompt: validateBlurRadius에 0.0을 넘기면 정상 통과하는지 확인하세요. 0은 음수가 아니므로 ValueError가 나지 않아야 합니다.\r
    starterCode: |-\r
      def validateBlurRadius(radius):\r
          if radius < 0:\r
              raise ValueError(f"blur radius는 0 이상이어야 합니다: {radius}")\r
          return True\r
\r
\r
      zeroResult = validateBlurRadius(___)\r
      {'zeroResult': zeroResult, 'isTrue': zeroResult is True}\r
    hints:\r
    - 0.0을 인자에 넣습니다.\r
    - 빈칸에는 0.0이 들어갑니다.\r
    check:\r
      noError: validateBlurRadius 호출이 끝나야 합니다.\r
      resultCheck: isTrue가 True여야 합니다.\r
  check:\r
    noError: validateBlurRadius와 GaussianBlur 호출이 끝나야 합니다.\r
    resultCheck: monotonicDecrease가 True이고 negMessage에 '0 이상' 단서가 포함되어야 합니다.\r
`;export{e as default};