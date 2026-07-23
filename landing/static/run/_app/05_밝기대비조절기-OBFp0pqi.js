var e=`meta:\r
  packages:\r
  - numpy\r
  - pillow\r
  - scikit-learn\r
  id: pillow_05\r
  title: 밝기대비조절기\r
  order: 5\r
  category: pillow\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - Pillow\r
  - ImageEnhance\r
  - Brightness\r
  - Contrast\r
  - Color\r
  - Sharpness\r
  seo:\r
    title: Pillow 기초 - 밝기/대비 조절기\r
    description: Pillow ImageEnhance의 Brightness/Contrast/Color/Sharpness 네 enhancer로 사진 톤을 정량 조절합니다.\r
    keywords:\r
    - Pillow\r
    - ImageEnhance\r
    - Brightness\r
    - Contrast\r
    - 밝기조절\r
    - 대비조절\r
intro:\r
  emoji: ☀️\r
  goal: ImageEnhance.Brightness/Contrast/Color/Sharpness 네 enhancer의 enhance(factor) 결과를 평균/표준편차 변화로 정량 비교하고, 보정 파이프라인을 만듭니다.\r
  description: ImageEnhance는 enhance(factor) 한 메서드로 톤을 조절합니다. factor=1.0은 원본, 작으면 약화, 크면 강화. 네 enhancer는 서로 다른 픽셀 통계에 작용합니다.\r
  direction: Brightness는 평균, Contrast는 표준편차, Color는 채도, Sharpness는 디테일에 각각 영향을 주는지 정량 검증.\r
  benefits:\r
  - enhance(0.0)/enhance(1.0)/enhance(2.0) 세 값으로 각 enhancer 효과의 단조성을 확인합니다.\r
  - Brightness factor 변화가 픽셀 평균에 직선적으로 작용하는지 봅니다.\r
  - Contrast factor 변화가 표준편차에 작용하는지 봅니다.\r
  - 네 enhancer를 체이닝한 사진 보정 함수를 만듭니다.\r
  diagram:\r
    steps:\r
    - label: RGB 입력 로드\r
      detail: china 샘플을 Image.fromarray로 RGB Image로 만듭니다.\r
    - label: Brightness enhance\r
      detail: factor 0.5/1.0/1.5로 픽셀 평균 변화 측정.\r
    - label: Contrast enhance\r
      detail: factor 0.5/1.0/1.5로 표준편차 변화 측정.\r
    - label: Color/Sharpness\r
      detail: 채도와 선명도 변화 검증.\r
    - label: 보정 체이닝\r
      detail: 네 enhancer를 함수에 묶어 입력별 같은 흐름을 적용.\r
    runtime:\r
    - label: pillow + numpy\r
      detail: ImageEnhance 결과를 NumPy로 변환해 평균/표준편차 계산.\r
    - label: 단일 RGB 원본\r
      detail: 첫 셀의 frame 객체가 이후 모든 셀의 공통 입력.\r
    - label: enhance는 새 객체\r
      detail: enhance 호출은 새 Image를 돌려주고 원본은 그대로 유지.\r
sections:\r
- id: step1_load\r
  title: 1단계. 보정 원본 만들기\r
  structuredPrimary: true\r
  subtitle: china RGB Image\r
  goal: china 샘플을 Pillow Image로 만들고 baseline 통계(평균, 표준편차)를 측정해 이후 enhance 결과 비교의 기준값을 정합니다.\r
  why: enhance의 효과는 평균과 표준편차 변화로 정량 측정할 수 있습니다. 원본의 두 값을 알아야 Brightness/Contrast factor가 의도대로 작용했는지 확인 가능합니다.\r
  explanation: |-\r
    sklearn china 사진은 풍경 사진이라 색조와 명도 분포가 다양해 enhance 효과가 잘 드러납니다.\r
    baseline mean과 std를 NumPy로 측정해 둡니다. 이 두 값이 이후 모든 enhance 비교의 기준입니다.\r
  tips:\r
  - "ImageEnhance는 별도 import가 필요합니다: from PIL import Image, ImageEnhance."\r
  - Brightness/Contrast는 채널별로 동작하므로 컬러 원본에서 전체 통계와 채널별 통계가 모두 의미 있습니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageEnhance\r
    from sklearn.datasets import load_sample_image\r
\r
    frame = Image.fromarray(load_sample_image('china.jpg'))\r
    frameArr = np.asarray(frame)\r
\r
    {\r
        'mode': frame.mode,\r
        'size': frame.size,\r
        'baseMean': round(float(frameArr.mean()), 2),\r
        'baseStd': round(float(frameArr.std()), 2),\r
    }\r
  exercise:\r
    prompt: flower 입력의 baseline 평균을 측정해 china와 비교하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      flowerFrame = Image.fromarray(load_sample_image('___'))\r
      flowerMean = round(float(np.asarray(flowerFrame).mean()), 2)\r
      {'flowerMean': flowerMean}\r
    hints:\r
    - flower 파일명을 넣습니다.\r
    - 빈칸에는 flower.jpg가 들어갑니다.\r
    check:\r
      noError: load_sample_image와 mean 계산이 끝나야 합니다.\r
      resultCheck: flowerMean이 양수여야 합니다.\r
  check:\r
    noError: load_sample_image와 통계 계산이 끝나야 합니다.\r
    resultCheck: mode가 'RGB', size가 (640, 427)이어야 합니다.\r
- id: step2_brightness\r
  title: 2단계. Brightness enhancer\r
  structuredPrimary: true\r
  subtitle: factor → 평균 변화\r
  goal: ImageEnhance.Brightness(frame).enhance(factor) 결과의 평균을 factor=0.5/1.0/1.5로 비교해 평균이 factor에 비례하는 단조성을 확인합니다.\r
  why: Brightness는 모든 픽셀에 같은 비율을 곱합니다. 결과 평균이 입력 평균 × factor에 가까워야 정상 동작입니다. 이 단조성을 확인해 두면 보정 파이프라인의 행동이 예측 가능해집니다.\r
  explanation: |-\r
    ImageEnhance.Brightness(image)는 enhancer 객체를 만듭니다. .enhance(factor)로 실제 적용합니다.\r
    factor=0.0은 완전한 검정(평균 0), factor=1.0은 원본, factor=2.0은 모든 픽셀이 2배(255 cap 적용).\r
    검증은 결과 평균과 baseMean × factor를 비교합니다. 255 cap 때문에 정확한 비례는 아니지만 근사값입니다.\r
  tips:\r
  - 너무 큰 factor는 픽셀이 255에서 잘려 손실이 생깁니다. 사진 보정은 1.0~1.5 범위가 안전합니다.\r
  - Brightness enhancer 객체는 한 번 만들고 여러 factor에 재사용할 수 있어 효율적입니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageEnhance\r
    from sklearn.datasets import load_sample_image\r
\r
    brightFrame = Image.fromarray(load_sample_image('china.jpg'))\r
    brightener = ImageEnhance.Brightness(brightFrame)\r
    baseMean = float(np.asarray(brightFrame).mean())\r
\r
    dim = brightener.enhance(0.5)\r
    bright = brightener.enhance(1.5)\r
\r
    {\r
        'baseMean': round(baseMean, 2),\r
        'dimMean': round(float(np.asarray(dim).mean()), 2),\r
        'brightMean': round(float(np.asarray(bright).mean()), 2),\r
        'dimIsDarker': float(np.asarray(dim).mean()) < baseMean,\r
        'brightIsBrighter': float(np.asarray(bright).mean()) > baseMean,\r
    }\r
  exercise:\r
    prompt: factor=0.0을 적용해 결과 평균이 0에 가까운지 확인하세요. 모든 픽셀이 0이 되어야 합니다.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageEnhance\r
      from sklearn.datasets import load_sample_image\r
\r
      blackBrightener = ImageEnhance.Brightness(Image.fromarray(load_sample_image('china.jpg')))\r
      blackResult = blackBrightener.enhance(___)\r
      {'blackMean': round(float(np.asarray(blackResult).mean()), 2)}\r
    hints:\r
    - factor 0.0은 완전한 검정.\r
    - 빈칸에는 0.0이 들어갑니다.\r
    check:\r
      noError: enhance 호출이 끝나야 합니다.\r
      resultCheck: blackMean이 0이어야 합니다.\r
  check:\r
    noError: enhance 두 호출이 끝나야 합니다.\r
    resultCheck: dimIsDarker와 brightIsBrighter 모두 True여야 합니다.\r
- id: step3_contrast\r
  title: 3단계. Contrast enhancer\r
  structuredPrimary: true\r
  subtitle: factor → 표준편차 변화\r
  goal: ImageEnhance.Contrast(frame).enhance(factor)의 표준편차가 factor=0.5/1.0/1.5에서 단조 증가하는지 확인합니다.\r
  why: Contrast는 평균값 주변으로 픽셀을 더 멀리(고대비) 또는 가까이(저대비) 옮깁니다. 결과 표준편차가 factor에 비례합니다. 평균은 거의 그대로 유지됩니다.\r
  explanation: |-\r
    Contrast.enhance(factor)는 픽셀 값을 평균 주변으로 (값 - 평균) × factor + 평균 형태로 재배치합니다.\r
    factor=0.0은 모든 픽셀이 평균 값(완전한 회색). factor=1.0은 원본. factor>1.0은 대비 강화.\r
    검증은 표준편차가 factor에 비례하는지로 합니다. 평균은 변화가 적습니다. 이 두 가지가 Brightness와 정반대 동작입니다.\r
  tips:\r
  - Contrast factor 0.0은 완전한 회색입니다. factor 2.0은 대비를 두 배로 강화합니다.\r
  - 사진 보정은 1.1~1.3 정도가 자연스럽습니다. 1.5 이상은 노이즈가 보입니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageEnhance\r
    from sklearn.datasets import load_sample_image\r
\r
    contrastFrame = Image.fromarray(load_sample_image('china.jpg'))\r
    contraster = ImageEnhance.Contrast(contrastFrame)\r
    baseStd = float(np.asarray(contrastFrame).std())\r
    baseMean = float(np.asarray(contrastFrame).mean())\r
\r
    soft = contraster.enhance(0.5)\r
    sharp = contraster.enhance(1.5)\r
\r
    {\r
        'baseStd': round(baseStd, 2),\r
        'softStd': round(float(np.asarray(soft).std()), 2),\r
        'sharpStd': round(float(np.asarray(sharp).std()), 2),\r
        'baseMean': round(baseMean, 2),\r
        'sharpMean': round(float(np.asarray(sharp).mean()), 2),\r
        'monotonicStd': float(np.asarray(soft).std()) < baseStd < float(np.asarray(sharp).std()),\r
        'meanMostlyPreserved': abs(float(np.asarray(sharp).mean()) - baseMean) < 10,\r
    }\r
  exercise:\r
    prompt: Contrast factor=0.0이 완전한 회색을 만드는지(표준편차 ≈ 0) 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageEnhance\r
      from sklearn.datasets import load_sample_image\r
\r
      grayContraster = ImageEnhance.Contrast(Image.fromarray(load_sample_image('china.jpg')))\r
      grayResult = grayContraster.enhance(___)\r
      {'grayStd': round(float(np.asarray(grayResult).std()), 2), 'isZero': float(np.asarray(grayResult).std()) < 0.5}\r
    hints:\r
    - factor 0.0은 완전한 회색.\r
    - 빈칸에는 0.0이 들어갑니다.\r
    check:\r
      noError: enhance 호출이 끝나야 합니다.\r
      resultCheck: isZero가 True여야 합니다.\r
  check:\r
    noError: enhance 두 호출이 끝나야 합니다.\r
    resultCheck: monotonicStd가 True이고 meanMostlyPreserved가 True여야 합니다.\r
- id: step4_color\r
  title: 4단계. Color enhancer (채도)\r
  structuredPrimary: true\r
  subtitle: 0.0 → 흑백, 1.5 → 진한 색\r
  goal: ImageEnhance.Color.enhance(0.0)이 흑백에 가까워지고, enhance(1.5)가 채도가 진해지는지 확인합니다.\r
  why: 채도는 색이 얼마나 강한지의 지표입니다. 채도가 0이면 그레이스케일과 같고, 키우면 색이 더 선명해집니다. 흑백 변환의 대안으로 자주 쓰입니다.\r
  explanation: |-\r
    Color.enhance(0.0)은 RGB의 각 채널을 그레이스케일 값으로 통일합니다. 결과는 무채색 RGB(R=G=B).\r
    Color.enhance(1.0)은 원본 채도 유지. Color.enhance(1.5)는 색을 더 진하게.\r
    검증은 enhance(0.0) 결과의 R/G/B 채널이 거의 같은지로 합니다. 채널별 평균 차이가 작을수록 무채색에 가깝습니다.\r
  tips:\r
  - Color.enhance(0.0)과 convert('L').convert('RGB')는 비슷한 결과를 줍니다. 표현 방식이 다를 뿐입니다.\r
  - SNS 필터의 "비비드" 모드는 보통 Color.enhance(1.3~1.5)에 가깝습니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageEnhance\r
    from sklearn.datasets import load_sample_image\r
\r
    colorFrame = Image.fromarray(load_sample_image('china.jpg'))\r
    saturator = ImageEnhance.Color(colorFrame)\r
\r
    grayResult = saturator.enhance(0.0)\r
    vividResult = saturator.enhance(1.5)\r
\r
    grayArr = np.asarray(grayResult)\r
    vividArr = np.asarray(vividResult)\r
    baseArr = np.asarray(colorFrame)\r
\r
    {\r
        'baseChannelMeans': [round(float(baseArr[..., c].mean()), 2) for c in range(3)],\r
        'grayChannelMeans': [round(float(grayArr[..., c].mean()), 2) for c in range(3)],\r
        'vividChannelMeans': [round(float(vividArr[..., c].mean()), 2) for c in range(3)],\r
        'grayChannelsClose': max(abs(float(grayArr[..., c].mean()) - float(grayArr[..., 0].mean())) for c in range(3)) < 0.5,\r
    }\r
  exercise:\r
    prompt: Color.enhance(1.0)이 원본과 동일한 채널 평균을 갖는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageEnhance\r
      from sklearn.datasets import load_sample_image\r
\r
      identitySat = ImageEnhance.Color(Image.fromarray(load_sample_image('china.jpg')))\r
      identityResult = identitySat.enhance(___)\r
      baseArr = np.asarray(Image.fromarray(load_sample_image('china.jpg')))\r
      identArr = np.asarray(identityResult)\r
      diff = max(abs(float(baseArr[..., c].mean()) - float(identArr[..., c].mean())) for c in range(3))\r
      {'maxDiff': round(diff, 2), 'isIdentity': diff < 0.5}\r
    hints:\r
    - factor 1.0은 원본 유지.\r
    - 빈칸에는 1.0이 들어갑니다.\r
    check:\r
      noError: enhance 호출이 끝나야 합니다.\r
      resultCheck: isIdentity가 True여야 합니다.\r
  check:\r
    noError: enhance 두 호출이 끝나야 합니다.\r
    resultCheck: grayChannelsClose가 True여야 합니다.\r
- id: step5_sharpness\r
  title: 5단계. Sharpness enhancer\r
  structuredPrimary: true\r
  subtitle: 0.0 → 블러, 2.0 → 샤프\r
  goal: ImageEnhance.Sharpness.enhance(0.0)은 블러 효과를, enhance(2.0)은 샤프 효과를 만들어 결과 표준편차의 단조 증가를 확인합니다.\r
  why: Sharpness enhancer는 0~2 사이 factor로 블러~샤프를 한 메서드로 다룰 수 있습니다. ImageFilter.SHARPEN보다 강도 조절이 정교합니다.\r
  explanation: |-\r
    Sharpness.enhance(0.0)은 약한 블러 효과를 줍니다(완전한 블러는 아님).\r
    Sharpness.enhance(1.0)은 원본 유지.\r
    Sharpness.enhance(2.0)은 강한 샤픈.\r
    검증은 표준편차가 factor에 단조 증가하는지로 합니다. 블러는 std를 줄이고, 샤픈은 std를 키웁니다.\r
  tips:\r
  - Sharpness는 ImageFilter.SHARPEN보다 부드러운 효과를 줍니다. 인물 사진 보정에 적합합니다.\r
  - factor 0~1은 블러, 1~2는 샤픈입니다. 0과 2가 극단입니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageEnhance\r
    from sklearn.datasets import load_sample_image\r
\r
    sharpFrame = Image.fromarray(load_sample_image('china.jpg'))\r
    sharpener = ImageEnhance.Sharpness(sharpFrame)\r
    baseStd = float(np.asarray(sharpFrame).std())\r
\r
    soft = sharpener.enhance(0.0)\r
    crisp = sharpener.enhance(2.0)\r
\r
    {\r
        'baseStd': round(baseStd, 2),\r
        'softStd': round(float(np.asarray(soft).std()), 2),\r
        'crispStd': round(float(np.asarray(crisp).std()), 2),\r
        'softIsBlurrier': float(np.asarray(soft).std()) <= baseStd,\r
        'crispIsSharper': float(np.asarray(crisp).std()) >= baseStd,\r
    }\r
  exercise:\r
    prompt: Sharpness.enhance(1.0)이 원본과 동일한 표준편차를 갖는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageEnhance\r
      from sklearn.datasets import load_sample_image\r
\r
      identityFrame = Image.fromarray(load_sample_image('china.jpg'))\r
      baseStd = float(np.asarray(identityFrame).std())\r
      identityResult = ImageEnhance.Sharpness(identityFrame).enhance(___)\r
      identityStd = float(np.asarray(identityResult).std())\r
      {'baseStd': round(baseStd, 2), 'identityStd': round(identityStd, 2), 'isIdentity': abs(baseStd - identityStd) < 0.5}\r
    hints:\r
    - factor 1.0은 원본 유지.\r
    - 빈칸에는 1.0이 들어갑니다.\r
    check:\r
      noError: enhance 호출이 끝나야 합니다.\r
      resultCheck: isIdentity가 True여야 합니다.\r
  check:\r
    noError: enhance 두 호출이 끝나야 합니다.\r
    resultCheck: softIsBlurrier와 crispIsSharper 모두 True여야 합니다.\r
- id: step6_combine\r
  title: 6단계. 보정 체이닝\r
  structuredPrimary: true\r
  subtitle: Brightness → Contrast → Color → Sharpness\r
  goal: 네 enhancer를 순서대로 chaining해 각 단계의 평균/표준편차 변화를 dict로 정리합니다.\r
  why: 사진 보정의 일반 순서는 밝기 → 대비 → 채도 → 선명도입니다. 한 셀에서 단계별 통계 변화를 확인하면 어느 단계가 어떤 효과를 주는지 명확합니다.\r
  explanation: |-\r
    각 enhancer 결과를 다음 enhancer의 입력으로 넘기는 chaining 패턴입니다. enhance는 새 객체를 돌려주므로 안전합니다.\r
    단계별 dict를 보면 Brightness(1.2)에서 평균이 늘고, Contrast(1.3)에서 std가 늘고, Color(1.1)에서 채도가 진해지는 흐름이 드러납니다.\r
    실무에서는 이 흐름을 한 함수로 묶어 두는 게 표준입니다. enhanceTone(image) 같은 형식.\r
  tips:\r
  - 너무 많은 보정을 누적하면 부자연스러워집니다. 각 단계 factor를 1.1~1.3 범위로 두는 게 안전합니다.\r
  - 보정 순서를 바꾸면 결과가 다릅니다. Brightness 다음 Contrast가 일반적이지만 입력에 따라 달라집니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageEnhance\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def stage(image, label):\r
        arr = np.asarray(image)\r
        return {'label': label, 'mean': round(float(arr.mean()), 2), 'std': round(float(arr.std()), 2)}\r
\r
\r
    chainFrame = Image.fromarray(load_sample_image('china.jpg'))\r
    s1 = ImageEnhance.Brightness(chainFrame).enhance(1.2)\r
    s2 = ImageEnhance.Contrast(s1).enhance(1.3)\r
    s3 = ImageEnhance.Color(s2).enhance(1.1)\r
    s4 = ImageEnhance.Sharpness(s3).enhance(1.2)\r
\r
    [stage(chainFrame, 'base'), stage(s1, 'brightness'), stage(s2, 'contrast'), stage(s3, 'color'), stage(s4, 'sharpness')]\r
  exercise:\r
    prompt: Brightness factor를 0.8로 더 어둡게 시작해 첫 단계의 평균이 baseline보다 작아지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageEnhance\r
      from sklearn.datasets import load_sample_image\r
\r
      darkFrame = Image.fromarray(load_sample_image('china.jpg'))\r
      baseMean = float(np.asarray(darkFrame).mean())\r
      darkBrightness = ImageEnhance.Brightness(darkFrame).enhance(___)\r
      darkMean = float(np.asarray(darkBrightness).mean())\r
      {'baseMean': round(baseMean, 2), 'darkMean': round(darkMean, 2), 'isDarker': darkMean < baseMean}\r
    hints:\r
    - factor 0.8을 넣습니다.\r
    - 빈칸에는 0.8이 들어갑니다.\r
    check:\r
      noError: enhance 호출이 끝나야 합니다.\r
      resultCheck: isDarker가 True여야 합니다.\r
  check:\r
    noError: 네 enhance 호출이 끝나야 합니다.\r
    resultCheck: 결과 리스트 길이가 5여야 합니다.\r
- id: practice\r
  title: 실습 - enhanceTone 함수\r
  structuredPrimary: true\r
  subtitle: 입력별 동일 보정\r
  goal: enhanceTone(image, factors=dict) 함수가 네 enhancer를 사용자 지정 factor로 적용하고 결과를 보고합니다.\r
  why: 보정 함수를 한 인터페이스로 묶어 두면 새 입력을 받아도 같은 형식의 결과가 나옵니다. 자동화의 표준 보정 도구가 됩니다.\r
  explanation: |-\r
    enhanceTone은 image와 factors dict를 받아 네 enhancer를 차례로 적용합니다. dict 키는 'brightness', 'contrast', 'color', 'sharpness' 네 가지.\r
    함수는 결과 Image와 단계별 통계를 함께 돌려줘 운영에서 어떤 보정이 적용됐는지 추적 가능합니다.\r
    flower와 china 입력에 같은 factors를 적용하면 같은 형식의 결과가 두 개 나옵니다. 단위 테스트와 CSV 출력 모두에 활용됩니다.\r
  tips:\r
  - factors 기본값을 약한 보정(brightness 1.1, contrast 1.2, color 1.1, sharpness 1.1)으로 두면 자연스럽습니다.\r
  - 함수가 결과 Image 자체를 돌려주지 않고 통계만 보고하면 자동화 코드에서 후속 처리가 가능해집니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageEnhance\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def enhanceTone(image: Image.Image, factors: dict) -> dict:\r
        bright = ImageEnhance.Brightness(image).enhance(factors['brightness'])\r
        contrast = ImageEnhance.Contrast(bright).enhance(factors['contrast'])\r
        color = ImageEnhance.Color(contrast).enhance(factors['color'])\r
        sharp = ImageEnhance.Sharpness(color).enhance(factors['sharpness'])\r
        baseArr = np.asarray(image)\r
        finalArr = np.asarray(sharp)\r
        return {\r
            'baseMean': round(float(baseArr.mean()), 2),\r
            'finalMean': round(float(finalArr.mean()), 2),\r
            'baseStd': round(float(baseArr.std()), 2),\r
            'finalStd': round(float(finalArr.std()), 2),\r
        }\r
\r
\r
    factors = {'brightness': 1.1, 'contrast': 1.2, 'color': 1.1, 'sharpness': 1.1}\r
    [\r
        enhanceTone(Image.fromarray(load_sample_image('flower.jpg')), factors),\r
        enhanceTone(Image.fromarray(load_sample_image('china.jpg')), factors),\r
    ]\r
  exercise:\r
    prompt: factors의 brightness를 0.8로 바꿔 어둡게 만든 결과의 finalMean이 baseMean보다 작은지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageEnhance\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def enhanceTone(image, factors):\r
          bright = ImageEnhance.Brightness(image).enhance(factors['brightness'])\r
          finalArr = np.asarray(bright)\r
          baseArr = np.asarray(image)\r
          return {'baseMean': round(float(baseArr.mean()), 2), 'finalMean': round(float(finalArr.mean()), 2)}\r
\r
\r
      result = enhanceTone(Image.fromarray(load_sample_image('china.jpg')), {'brightness': ___})\r
      {'result': result, 'isDarker': result['finalMean'] < result['baseMean']}\r
    hints:\r
    - factor 0.8을 넣습니다.\r
    - 빈칸에는 0.8이 들어갑니다.\r
    check:\r
      noError: enhanceTone 정의와 호출이 끝나야 합니다.\r
      resultCheck: isDarker가 True여야 합니다.\r
  check:\r
    noError: enhanceTone 정의와 두 호출이 끝나야 합니다.\r
    resultCheck: 두 결과 모두 baseMean, finalMean, baseStd, finalStd 네 키를 가져야 합니다.\r
- id: workflow_validation\r
  title: 7단계. enhance factor 가드 + 효과 회귀 테스트\r
  structuredPrimary: true\r
  subtitle: validateEnhanceFactor + 단조성\r
  goal: validateEnhanceFactor 함수가 음수/0 factor를 ValueError로 차단하고, Brightness factor 1.5가 baseline보다 평균을 명확히 키우는지 회귀 테스트로 확인합니다.\r
  why: enhance factor는 양수여야 의미가 있습니다. 0이나 음수는 함수 입구에서 차단하면 의도치 않은 결과를 막을 수 있습니다. 단조성 회귀 테스트는 알고리즘 변경 후 즉시 돌릴 수 있는 1줄 검증입니다.\r
  explanation: |-\r
    validateEnhanceFactor는 factor > 0 한 조건만 검사합니다. Brightness(0.0)은 의도된 완전 검정 출력이지만, factor < 0이나 None 같은 명시적 오류는 차단합니다.\r
    회귀 테스트는 Brightness(1.5)의 결과 평균이 baseline보다 명확히 큰지로 합니다. 이 부등식이 깨지면 알고리즘에 버그가 있다는 신호입니다.\r
  tips:\r
  - 함수 입구의 가드는 운영 사고를 막는 가장 저렴한 패턴입니다.\r
  - 단조성 검증은 회귀 테스트로 활용 가능합니다. 알고리즘 변경 후 즉시 결과를 확인할 수 있습니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageEnhance, ImageDraw\r
\r
\r
    def validateEnhanceFactor(factor: float) -> bool:\r
        if factor <= 0:\r
            raise ValueError(f"보정 factor는 양수여야 합니다: {factor}")\r
        return True\r
\r
\r
    toneImage = Image.new('RGB', (150, 100), (70, 80, 95))\r
    toneDraw = ImageDraw.Draw(toneImage)\r
    toneDraw.rectangle((35, 25, 115, 75), fill=(150, 120, 80))\r
    baseMean = float(np.asarray(toneImage).mean())\r
\r
    validateEnhanceFactor(1.2)\r
    bright = ImageEnhance.Brightness(toneImage).enhance(1.5)\r
\r
    try:\r
        validateEnhanceFactor(-1)\r
        negMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        negMessage = str(exc)\r
\r
    {\r
        'baseMean': round(baseMean, 2),\r
        'brightMean': round(float(np.asarray(bright).mean()), 2),\r
        'brightnessIncreased': float(np.asarray(bright).mean()) > baseMean,\r
        'negMessage': negMessage,\r
    }\r
  exercise:\r
    prompt: validateEnhanceFactor(0.0)을 호출하면 ValueError가 잡히는지 확인하세요. 0은 양수가 아니므로 차단되어야 합니다.\r
    starterCode: |-\r
      def validateEnhanceFactor(factor):\r
          if factor <= 0:\r
              raise ValueError(f"보정 factor는 양수여야 합니다: {factor}")\r
          return True\r
\r
\r
      try:\r
          validateEnhanceFactor(___)\r
          zeroMessage = 'unexpected pass'\r
      except ValueError as exc:\r
          zeroMessage = str(exc)\r
\r
      {'zeroMessage': zeroMessage, 'hasZeroHint': '0' in zeroMessage}\r
    hints:\r
    - 0.0을 인자에 넣습니다.\r
    - 빈칸에는 0.0이 들어갑니다.\r
    check:\r
      noError: validateEnhanceFactor 정의가 끝나야 합니다.\r
      resultCheck: hasZeroHint가 True여야 합니다.\r
  check:\r
    noError: validateEnhanceFactor와 enhance 호출이 끝나야 합니다.\r
    resultCheck: brightnessIncreased가 True이고 negMessage에 '양수' 단서가 포함되어야 합니다.\r
`;export{e as default};