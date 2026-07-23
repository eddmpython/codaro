var e=`meta:\r
  packages:\r
  - numpy\r
  - pillow\r
  - scikit-learn\r
  id: pillow_06\r
  title: RGB채널분석기\r
  order: 6\r
  category: pillow\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - Pillow\r
  - split\r
  - merge\r
  - histogram\r
  - RGB\r
  - 채널\r
  seo:\r
    title: Pillow 중급 - RGB 채널 분석기\r
    description: Pillow split/merge/histogram으로 RGB 채널을 분리하고 색 분포를 정량 분석합니다.\r
    keywords:\r
    - Pillow\r
    - split\r
    - merge\r
    - histogram\r
    - RGB채널\r
    - 색상분석\r
intro:\r
  emoji: 🎨\r
  goal: split으로 RGB 채널을 분리해 채널별 평균/histogram을 측정하고 merge로 채널 교환 효과를 만든 뒤, validateRgbMode 가드까지 짭니다.\r
  description: RGB 분석은 자동화에서 색 기반 분류와 필터링의 기본입니다. split/merge/histogram 세 메서드 흐름을 정량 검증합니다.\r
  direction: split → 채널별 평균/histogram → merge로 채널 교환 → 가드 함수.\r
  benefits:\r
  - split 결과가 3개의 'L' 모드 단채널 Image라는 점을 확인합니다.\r
  - histogram 길이가 RGB는 768 (256×3), L은 256임을 검증합니다.\r
  - merge로 채널 순서 교환 (R↔B)이 색을 어떻게 뒤집는지 봅니다.\r
  - validateRgbMode로 비 RGB 입력 차단.\r
  diagram:\r
    steps:\r
    - label: RGB 입력\r
      detail: china 샘플을 Image.fromarray로 RGB Image로 만듭니다.\r
    - label: split\r
      detail: 세 채널을 분리해 각 채널이 'L' 모드인지 확인.\r
    - label: histogram\r
      detail: RGB histogram 길이 768, 채널별 길이 256 검증.\r
    - label: 평균 분석\r
      detail: 채널별 평균으로 이미지 색조 파악.\r
    - label: merge 채널 교환\r
      detail: R↔B 교환으로 색이 뒤집히는 효과 확인.\r
    runtime:\r
    - label: pillow + numpy\r
      detail: 채널 통계는 NumPy로 빠르게 계산.\r
    - label: 단일 RGB 입력\r
      detail: 첫 셀의 source 객체가 이후 모든 셀의 공통 입력.\r
    - label: split은 새 객체\r
      detail: 각 채널 결과는 독립 Image 객체로 원본과 공유 없음.\r
sections:\r
- id: step1_load\r
  title: 1단계. RGB 분석 입력\r
  structuredPrimary: true\r
  subtitle: china 컬러 사진\r
  goal: china 샘플을 RGB Image로 만들고 mode/size를 확인합니다.\r
  why: RGB 채널 분석은 입력이 정확히 'RGB' mode일 때만 의미가 있습니다. 첫 셀에서 mode를 점검해 두면 다음 셀들의 가정이 분명해집니다.\r
  explanation: |-\r
    sklearn china 풍경 사진은 (640, 427) 크기에 RGB 채널이 균형 있게 분포해 채널 분석에 적합합니다.\r
    Image.fromarray로 변환한 결과의 mode는 'RGB'입니다. 이후 split 호출이 3개 채널을 돌려줘야 합니다.\r
  tips:\r
  - Pillow의 일반 컬러 사진은 거의 항상 'RGB' mode입니다. 'RGBA'는 알파 채널 포함.\r
  - mode가 'P'인 인덱스 컬러 이미지는 split이 다르게 동작합니다. convert('RGB')로 먼저 바꾸세요.\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    source = Image.fromarray(load_sample_image('china.jpg'))\r
\r
    {\r
        'mode': source.mode,\r
        'size': source.size,\r
        'pixelCount': source.size[0] * source.size[1],\r
    }\r
  exercise:\r
    prompt: flower 입력의 mode와 size를 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      flowerSource = Image.fromarray(load_sample_image('___'))\r
      {'mode': flowerSource.mode, 'size': flowerSource.size}\r
    hints:\r
    - flower 파일명.\r
    - 빈칸에는 flower.jpg가 들어갑니다.\r
    check:\r
      noError: load_sample_image와 Image.fromarray가 끝나야 합니다.\r
      resultCheck: mode가 'RGB'여야 합니다.\r
  check:\r
    noError: load_sample_image와 Image.fromarray가 끝나야 합니다.\r
    resultCheck: mode가 'RGB', size가 (640, 427), pixelCount가 273280이어야 합니다.\r
- id: step2_split\r
  title: 2단계. split으로 채널 분리\r
  structuredPrimary: true\r
  subtitle: 3개의 'L' 모드 Image\r
  goal: source.split()로 R/G/B 세 채널을 분리하고 각 결과가 'L' 모드, 원본과 같은 size인지 확인합니다.\r
  why: split은 RGB 채널을 독립적으로 다루는 표준 도구입니다. 각 채널의 mode가 'L'이라는 점을 확인하면 후속 처리에 어떤 함수가 적합한지(예 ImageFilter 단채널 입력) 즉시 알 수 있습니다.\r
  explanation: |-\r
    Image.split()은 채널 수만큼의 Image 튜플을 돌려줍니다. RGB는 3개 (R, G, B), RGBA는 4개 (R, G, B, A).\r
    각 채널은 'L' mode(단채널 그레이스케일) Image입니다. 픽셀 값은 해당 채널의 밝기로, R 채널이 밝으면 그 위치에 빨강이 강합니다.\r
    각 채널 Image의 size는 원본과 동일합니다.\r
  tips:\r
  - "split은 비용이 적습니다(메모리 복사). 자주 써도 안전합니다."\r
  - 채널만 빠르게 접근하려면 np.asarray(image)[..., 0]으로 NumPy 인덱싱이 더 빠릅니다.\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    splitSource = Image.fromarray(load_sample_image('china.jpg'))\r
    redChannel, greenChannel, blueChannel = splitSource.split()\r
\r
    {\r
        'channelCount': 3,\r
        'redMode': redChannel.mode,\r
        'greenMode': greenChannel.mode,\r
        'blueMode': blueChannel.mode,\r
        'redSizeMatchesOriginal': redChannel.size == splitSource.size,\r
    }\r
  exercise:\r
    prompt: split 결과의 len이 3인지 확인하세요. tuple unpacking 대신 변수 한 개로 받아 len()을 측정합니다.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      channelTuple = Image.fromarray(load_sample_image('china.jpg')).___()\r
      {'count': len(channelTuple), 'isThree': len(channelTuple) == 3}\r
    hints:\r
    - 분리 메서드는 split입니다.\r
    - 빈칸에는 split이 들어갑니다.\r
    check:\r
      noError: split 호출이 끝나야 합니다.\r
      resultCheck: isThree가 True여야 합니다.\r
  check:\r
    noError: split 호출과 dict 구성이 끝나야 합니다.\r
    resultCheck: redMode/greenMode/blueMode 모두 'L', redSizeMatchesOriginal이 True여야 합니다.\r
- id: step3_visualize\r
  title: 3단계. 채널 시각화\r
  structuredPrimary: true\r
  subtitle: 한 채널만 살린 RGB\r
  goal: 빈 단채널 Image와 red 채널을 merge해 "R만 살린 RGB" 이미지를 만들고 결과 채널별 평균이 R만 양수인지 확인합니다.\r
  why: 채널을 색으로 시각화하려면 다른 채널을 0으로 채우고 merge합니다. 결과 이미지는 빨강만 살아있는 사진이 되어 R 채널의 분포를 색으로 직관적으로 볼 수 있습니다.\r
  explanation: |-\r
    Image.new('L', size, 0)으로 모든 픽셀이 0인 단채널 Image를 만듭니다. 이게 G와 B 채널의 자리 채움.\r
    Image.merge('RGB', (red, zero, zero))로 R만 원본 값, G와 B는 0인 RGB Image를 만듭니다. 결과는 빨강 만 살아있는 사진입니다.\r
    검증은 결과 ndarray의 G와 B 채널 평균이 0인지로 합니다.\r
  tips:\r
  - 같은 패턴을 G와 B에 적용해 세 채널 시각화 세트를 만들 수 있습니다.\r
  - 시각화 결과는 plt.imshow로 바로 그릴 수 있습니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    visSource = Image.fromarray(load_sample_image('china.jpg'))\r
    red, green, blue = visSource.split()\r
    blackChannel = Image.new('L', visSource.size, 0)\r
\r
    redOnly = Image.merge('RGB', (red, blackChannel, blackChannel))\r
    redOnlyArr = np.asarray(redOnly)\r
\r
    {\r
        'mode': redOnly.mode,\r
        'size': redOnly.size,\r
        'rMean': round(float(redOnlyArr[..., 0].mean()), 2),\r
        'gMean': round(float(redOnlyArr[..., 1].mean()), 2),\r
        'bMean': round(float(redOnlyArr[..., 2].mean()), 2),\r
        'onlyRedSurvived': float(redOnlyArr[..., 1].mean()) == 0 and float(redOnlyArr[..., 2].mean()) == 0,\r
    }\r
  exercise:\r
    prompt: 같은 패턴으로 G만 살린 RGB 이미지를 만들어 R/B 평균이 0인지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      greenSource = Image.fromarray(load_sample_image('china.jpg'))\r
      _, green, _ = greenSource.split()\r
      blackG = Image.new('L', greenSource.size, 0)\r
      greenOnly = Image.merge('RGB', (blackG, green, ___))\r
      greenArr = np.asarray(greenOnly)\r
      {'rMean': round(float(greenArr[..., 0].mean()), 2), 'bMean': round(float(greenArr[..., 2].mean()), 2)}\r
    hints:\r
    - 마지막 자리에 검정 채널을 넣습니다.\r
    - 빈칸에는 blackG가 들어갑니다.\r
    check:\r
      noError: merge 호출이 끝나야 합니다.\r
      resultCheck: rMean이 0이고 bMean이 0이어야 합니다.\r
  check:\r
    noError: split/merge가 끝나야 합니다.\r
    resultCheck: onlyRedSurvived가 True여야 합니다.\r
- id: step4_histogram\r
  title: 4단계. histogram 길이와 분포\r
  structuredPrimary: true\r
  subtitle: RGB 768 vs L 256\r
  goal: source.histogram() 길이가 768(256×3), source.convert('L').histogram() 길이가 256인지 확인하고, 채널별 histogram의 합이 전체 픽셀 수와 같은지 검증합니다.\r
  why: histogram은 색 분포 분석의 1차 도구입니다. 길이와 합 관계를 손으로 한 번 확인해 두면 후속 분석(평균, 중앙값, 모드)에서 헷갈리지 않습니다.\r
  explanation: |-\r
    Image.histogram()은 모든 채널을 한 리스트에 연결한 결과를 돌려줍니다. RGB는 768 길이, L은 256, RGBA는 1024.\r
    리스트를 256씩 슬라이스해 채널별로 분리할 수 있습니다. histR = hist[0:256], histG = hist[256:512], histB = hist[512:768].\r
    각 채널 histogram의 합은 전체 픽셀 수와 같습니다. 이 관계가 깨지면 mask가 적용됐거나 일부 영역만 측정했다는 신호입니다.\r
  tips:\r
  - histogram은 mask 인자를 받지 않습니다. 일부 영역 분석에는 crop 후 histogram 호출이 표준입니다.\r
  - numpy bincount나 calcHist가 더 빠르지만 Pillow 단독으로는 histogram이 표준 도구입니다.\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    histSource = Image.fromarray(load_sample_image('china.jpg'))\r
    rgbHist = histSource.histogram()\r
    grayHist = histSource.convert('L').histogram()\r
\r
    histR = rgbHist[0:256]\r
    histG = rgbHist[256:512]\r
    histB = rgbHist[512:768]\r
    totalPixels = histSource.size[0] * histSource.size[1]\r
\r
    {\r
        'rgbHistLength': len(rgbHist),\r
        'grayHistLength': len(grayHist),\r
        'isRgb768': len(rgbHist) == 768,\r
        'isGray256': len(grayHist) == 256,\r
        'rChannelSum': sum(histR),\r
        'sumEqualsPixels': sum(histR) == totalPixels,\r
    }\r
  exercise:\r
    prompt: G 채널 histogram의 합도 전체 픽셀 수와 같은지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      gSource = Image.fromarray(load_sample_image('china.jpg'))\r
      gHist = gSource.histogram()[___:512]\r
      gTotal = gSource.size[0] * gSource.size[1]\r
      {'gSum': sum(gHist), 'gMatch': sum(gHist) == gTotal}\r
    hints:\r
    - G 채널은 hist 인덱스 256부터 시작합니다.\r
    - 빈칸에는 256이 들어갑니다.\r
    check:\r
      noError: histogram 호출이 끝나야 합니다.\r
      resultCheck: gMatch가 True여야 합니다.\r
  check:\r
    noError: histogram 두 호출이 끝나야 합니다.\r
    resultCheck: isRgb768과 isGray256과 sumEqualsPixels 모두 True여야 합니다.\r
- id: step5_analysis\r
  title: 5단계. 채널별 평균과 색조\r
  structuredPrimary: true\r
  subtitle: histogram → mean\r
  goal: histogram으로 R/G/B 채널별 평균을 계산하고 어느 채널이 가장 강한지 분류해 이미지의 전체 색조를 파악합니다.\r
  why: 채널별 평균은 이미지의 색조를 한 수로 표현하는 표준 지표입니다. R>G>B면 따뜻한 사진, B>G>R면 차가운 사진. 자동화 분류의 기본 신호입니다.\r
  explanation: |-\r
    histogram에서 평균 = sum(i * histogram[i]) / totalPixels. 256개 항목에 가중치를 곱한 합을 픽셀 수로 나눕니다.\r
    더 빠른 방법은 NumPy로 변환 후 .mean(axis=(0, 1))을 호출하는 것입니다. 결과는 (R, G, B) 평균.\r
    풍경 사진은 보통 G가 가장 큰 경향, 일몰은 R, 바다는 B가 큰 경향이 있습니다. 이 분류는 단순한 색조 인덱스 역할을 합니다.\r
  tips:\r
  - histogram 기반 평균은 모든 픽셀을 한 번씩만 처리해 빠릅니다.\r
  - "더 정확한 색조 분석은 HSV의 H 채널 히스토그램이 더 적합합니다."\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    analyzeSource = Image.fromarray(load_sample_image('china.jpg'))\r
    analyzeArr = np.asarray(analyzeSource)\r
\r
    rMean = float(analyzeArr[..., 0].mean())\r
    gMean = float(analyzeArr[..., 1].mean())\r
    bMean = float(analyzeArr[..., 2].mean())\r
\r
    dominantChannel = max(('R', rMean), ('G', gMean), ('B', bMean), key=lambda pair: pair[1])\r
\r
    {\r
        'channelMeans': [round(rMean, 2), round(gMean, 2), round(bMean, 2)],\r
        'dominantChannel': dominantChannel[0],\r
        'isLandscapeGreen': dominantChannel[0] == 'G' or gMean > 100,\r
    }\r
  exercise:\r
    prompt: flower 입력의 채널별 평균을 측정해 가장 강한 채널을 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      flowerArr = np.asarray(Image.fromarray(load_sample_image('___')))\r
      rM = float(flowerArr[..., 0].mean())\r
      gM = float(flowerArr[..., 1].mean())\r
      bM = float(flowerArr[..., 2].mean())\r
      {'channels': [round(rM, 2), round(gM, 2), round(bM, 2)]}\r
    hints:\r
    - flower 파일명을 넣습니다.\r
    - 빈칸에는 flower.jpg가 들어갑니다.\r
    check:\r
      noError: mean 계산이 끝나야 합니다.\r
      resultCheck: channels 길이가 3이어야 합니다.\r
  check:\r
    noError: 통계 계산이 끝나야 합니다.\r
    resultCheck: dominantChannel이 R/G/B 중 하나이고 isLandscapeGreen이 True여야 합니다.\r
- id: step6_swap\r
  title: 6단계. merge로 채널 교환\r
  structuredPrimary: true\r
  subtitle: R↔B 뒤집기\r
  goal: merge('RGB', (blue, green, red))로 R과 B 채널을 교환한 결과의 채널 평균이 원본의 R/B 평균과 정확히 반대로 매핑되는지 확인합니다.\r
  why: 채널 교환은 색을 의도적으로 뒤집는 효과를 만듭니다. cv2 BGR/RGB 변환과 비슷한 원리지만 임의 순서가 가능합니다. 자동화에서 색 보정 실험의 기본 도구입니다.\r
  explanation: |-\r
    Image.merge('RGB', (newR, newG, newB))는 세 단채널을 새 RGB Image로 합칩니다. 순서가 그대로 R, G, B 자리가 됩니다.\r
    원래 R/G/B를 받아 (B, G, R) 순서로 merge하면 결과의 R = 원본 B, B = 원본 R이 됩니다.\r
    검증은 결과 ndarray의 R 평균이 원본 B 평균과 같고, B 평균이 원본 R 평균과 같은지로 합니다.\r
  tips:\r
  - cv2.cvtColor(img, cv2.COLOR_BGR2RGB)와 동일한 효과를 Pillow merge로 만들 수 있습니다.\r
  - 채널 순서를 (G, B, R)로 바꾸면 더 독특한 색 효과를 얻을 수 있습니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    swapSource = Image.fromarray(load_sample_image('china.jpg'))\r
    red, green, blue = swapSource.split()\r
    swapped = Image.merge('RGB', (blue, green, red))\r
\r
    sourceArr = np.asarray(swapSource)\r
    swappedArr = np.asarray(swapped)\r
\r
    {\r
        'originalRMean': round(float(sourceArr[..., 0].mean()), 2),\r
        'originalBMean': round(float(sourceArr[..., 2].mean()), 2),\r
        'swappedRMean': round(float(swappedArr[..., 0].mean()), 2),\r
        'swappedBMean': round(float(swappedArr[..., 2].mean()), 2),\r
        'rIsNowOriginalB': abs(float(swappedArr[..., 0].mean()) - float(sourceArr[..., 2].mean())) < 0.5,\r
        'bIsNowOriginalR': abs(float(swappedArr[..., 2].mean()) - float(sourceArr[..., 0].mean())) < 0.5,\r
    }\r
  exercise:\r
    prompt: (G, B, R) 순서로 merge해서 결과의 R 평균이 원본 G 평균과 같은지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      gbrSource = Image.fromarray(load_sample_image('china.jpg'))\r
      red, green, blue = gbrSource.split()\r
      gbr = Image.merge('RGB', (green, blue, ___))\r
      sourceArr = np.asarray(gbrSource)\r
      gbrArr = np.asarray(gbr)\r
      {'gbrRMean': round(float(gbrArr[..., 0].mean()), 2), 'sourceGMean': round(float(sourceArr[..., 1].mean()), 2), 'matches': abs(float(gbrArr[..., 0].mean()) - float(sourceArr[..., 1].mean())) < 0.5}\r
    hints:\r
    - 마지막 자리에 red 채널.\r
    - 빈칸에는 red가 들어갑니다.\r
    check:\r
      noError: merge 호출이 끝나야 합니다.\r
      resultCheck: matches가 True여야 합니다.\r
  check:\r
    noError: split/merge가 끝나야 합니다.\r
    resultCheck: rIsNowOriginalB와 bIsNowOriginalR 모두 True여야 합니다.\r
- id: practice\r
  title: 실습 - analyzeChannels 함수\r
  structuredPrimary: true\r
  subtitle: 통합 채널 진단\r
  goal: analyzeChannels(image) 함수가 split→평균→dominant 채널까지 한 dict로 묶어 보고하고, flower와 china 두 입력에 같은 형식으로 적용합니다.\r
  why: 채널 분석은 자주 반복되는 작업이라 함수로 묶어 두면 자동화가 쉽습니다. 같은 dict 형식이 일관되게 돌아오면 단위 테스트와 비교 분석에 활용 가능합니다.\r
  explanation: |-\r
    analyzeChannels는 RGB Image를 받아 channelMeans와 dominantChannel을 dict로 돌려줍니다.\r
    NumPy로 변환 후 channel별 평균을 한 번에 계산하는 것이 효율적입니다. histogram 기반 계산은 더 느립니다.\r
    flower와 china 두 입력에 적용해 비교하면 두 사진의 색조 차이가 즉시 보입니다.\r
  tips:\r
  - 함수 안에서 image.mode를 먼저 확인해 RGB만 처리하도록 가드를 두는 게 안전합니다(7단계 참고).\r
  - 채널별 평균은 자동화 보고서의 표준 출력 형식입니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def analyzeChannels(image: Image.Image) -> dict:\r
        arr = np.asarray(image)\r
        means = [round(float(arr[..., c].mean()), 2) for c in range(3)]\r
        labels = ['R', 'G', 'B']\r
        dominantIdx = means.index(max(means))\r
        return {\r
            'channelMeans': means,\r
            'dominantChannel': labels[dominantIdx],\r
            'dominantValue': means[dominantIdx],\r
        }\r
\r
\r
    flowerPic = Image.fromarray(load_sample_image('flower.jpg'))\r
    chinaPic = Image.fromarray(load_sample_image('china.jpg'))\r
\r
    [analyzeChannels(flowerPic), analyzeChannels(chinaPic)]\r
  exercise:\r
    prompt: analyzeChannels에 'isWarm' 키를 추가해 R 평균이 B 평균보다 크면 True를 돌려주는 분류 함수로 확장하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def analyzeChannelsExtended(image):\r
          arr = np.asarray(image)\r
          rMean = float(arr[..., 0].mean())\r
          bMean = float(arr[..., 2].mean())\r
          return {'rMean': round(rMean, 2), 'bMean': round(bMean, 2), 'isWarm': rMean > ___}\r
\r
\r
      analyzeChannelsExtended(Image.fromarray(load_sample_image('flower.jpg')))\r
    hints:\r
    - R이 B보다 크면 warm.\r
    - 빈칸에는 bMean이 들어갑니다.\r
    check:\r
      noError: analyzeChannelsExtended 정의와 호출이 끝나야 합니다.\r
      resultCheck: 결과 dict에 isWarm 키가 있어야 합니다.\r
  check:\r
    noError: analyzeChannels 정의와 두 호출이 끝나야 합니다.\r
    resultCheck: 두 결과 모두 channelMeans 3원소와 dominantChannel을 가져야 합니다.\r
- id: workflow_validation\r
  title: 7단계. RGB 가드 + 채널 합 검증\r
  structuredPrimary: true\r
  subtitle: validateRgbMode + histogram 검증\r
  goal: validateRgbMode가 비 RGB 입력을 차단하고, RGB histogram의 길이/합이 정해진 형식인지 회귀 테스트로 확인합니다.\r
  why: 채널 분석은 RGB 입력 가정에 의존합니다. RGBA, L, P 모드 입력은 다른 채널 수를 줘서 후속 처리가 깨집니다. 함수 입구 가드가 그 사고를 차단합니다.\r
  explanation: |-\r
    validateRgbMode는 image.mode != 'RGB'면 ValueError를 던집니다. 메시지에 실제 mode를 포함시켜 호출자가 즉시 원인을 알 수 있습니다.\r
    회귀 테스트는 (1) histogram 길이가 768, (2) 각 채널 합이 totalPixels라는 두 조건입니다. 알고리즘 변경 후 즉시 돌릴 수 있는 1줄 검증입니다.\r
    Pillow 합성 입력으로 정답 픽셀 수를 정확히 알 수 있어 검증에 적합합니다.\r
  tips:\r
  - "validateRgbMode는 다른 채널 분석 함수의 첫 줄에서 호출하면 입력 안전을 한 번에 보호할 수 있습니다."\r
  - "Pillow Image.new('RGB', size)는 (0, 0, 0) 기본 검정으로 채웁니다. 다른 색이 필요하면 fill 인자를 줍니다."\r
  snippet: |-\r
    from PIL import Image\r
\r
\r
    def validateRgbMode(image: Image.Image) -> bool:\r
        if image.mode != 'RGB':\r
            raise ValueError(f"RGB 이미지가 필요합니다: mode={image.mode}")\r
        return True\r
\r
\r
    channelImage = Image.new('RGB', (120, 90))\r
    for x in range(120):\r
        for y in range(90):\r
            if x < 40:\r
                channelImage.putpixel((x, y), (220, 40, 40))\r
            elif x < 80:\r
                channelImage.putpixel((x, y), (40, 220, 40))\r
            else:\r
                channelImage.putpixel((x, y), (40, 40, 220))\r
\r
    okResult = validateRgbMode(channelImage)\r
    okHist = channelImage.histogram()\r
    totalPixels = channelImage.size[0] * channelImage.size[1]\r
\r
    grayImage = channelImage.convert('L')\r
    try:\r
        validateRgbMode(grayImage)\r
        grayMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        grayMessage = str(exc)\r
\r
    {\r
        'okResult': okResult,\r
        'histLength': len(okHist),\r
        'totalPixels': totalPixels,\r
        'rChannelSum': sum(okHist[0:256]),\r
        'rSumMatches': sum(okHist[0:256]) == totalPixels,\r
        'grayMessage': grayMessage,\r
    }\r
  exercise:\r
    prompt: RGBA 입력에 validateRgbMode를 호출해 메시지에 'RGBA' 단서가 포함되는지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
\r
\r
      def validateRgbMode(image):\r
          if image.mode != 'RGB':\r
              raise ValueError(f"RGB 이미지가 필요합니다: mode={image.mode}")\r
          return True\r
\r
\r
      rgbaImage = Image.new('___', (50, 50), (100, 150, 200, 255))\r
      try:\r
          validateRgbMode(rgbaImage)\r
          rgbaMessage = 'unexpected pass'\r
      except ValueError as exc:\r
          rgbaMessage = str(exc)\r
\r
      {'hasRgba': 'RGBA' in rgbaMessage}\r
    hints:\r
    - 4채널 mode는 'RGBA'.\r
    - 빈칸에는 RGBA가 들어갑니다.\r
    check:\r
      noError: validateRgbMode 정의가 끝나야 합니다.\r
      resultCheck: hasRgba가 True여야 합니다.\r
  check:\r
    noError: validateRgbMode와 histogram 호출이 끝나야 합니다.\r
    resultCheck: okResult가 True, histLength가 768, rSumMatches가 True여야 합니다.\r
`;export{e as default};