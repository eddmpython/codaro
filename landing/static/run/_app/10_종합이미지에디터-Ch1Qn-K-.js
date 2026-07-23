var e=`meta:\r
  packages:\r
  - numpy\r
  - pillow\r
  - scikit-learn\r
  id: pillow_10\r
  title: 종합이미지에디터\r
  order: 10\r
  category: pillow\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - Pillow\r
  - 종합\r
  - 에디터\r
  - 필터\r
  - 텍스트\r
  - 합성\r
  seo:\r
    title: Pillow 심화 - 종합 이미지 에디터\r
    description: Pillow 모든 기능을 결합해 crop→filter→enhance→watermark→save 파이프라인 한 함수를 만듭니다.\r
    keywords:\r
    - Pillow\r
    - 이미지에디터\r
    - 종합\r
    - 필터\r
    - 합성\r
    - 텍스트\r
intro:\r
  emoji: 🎬\r
  goal: 01~09에서 익힌 Pillow 기능들을 editPhoto 함수 한 개로 결합해 crop→filter→enhance→watermark 흐름을 합성 입력 검증 후 실제 사진에 일반화합니다.\r
  description: 종합 강의는 각 강의의 단편을 한 함수에 묶는 작업입니다. 인터페이스가 일관되면 자동화 파이프라인이 됩니다.\r
  direction: 각 단계를 dict로 보고하는 editPhoto 함수 → 합성 입력 검증 → china/flower 일반화 → 가드 함수.\r
  benefits:\r
  - crop/resize/filter/enhance/watermark 다섯 작업을 한 함수에 결합합니다.\r
  - 단계별 통계 dict로 자동화 보고 형식을 만듭니다.\r
  - 함수의 인자 인터페이스로 유연한 보정 흐름을 제공합니다.\r
  - validateEditConfig로 잘못된 인자 차단.\r
  diagram:\r
    steps:\r
    - label: 원본 로드\r
      detail: china를 Image로 변환.\r
    - label: editPhoto 한 줄\r
      detail: crop→resize→filter→enhance→watermark.\r
    - label: 단계별 통계\r
      detail: 각 단계 후 표준편차/평균 변화 보고.\r
    - label: 다른 입력 적용\r
      detail: flower에 같은 함수 적용해 일반화 검증.\r
    - label: 가드 함수\r
      detail: validateEditConfig로 dict 인자 안전성 확인.\r
    runtime:\r
    - label: pillow + numpy\r
      detail: 단계별 통계 계산.\r
    - label: 함수형 흐름\r
      detail: 각 단계가 새 Image를 돌려줘 원본 보존.\r
sections:\r
- id: step1_load\r
  title: 1단계. 종합 입력 준비\r
  structuredPrimary: true\r
  subtitle: china 원본\r
  goal: china 샘플을 Pillow Image로 만들고 baseline 통계를 측정해 이후 모든 편집 단계의 비교 기준값을 정합니다.\r
  why: 종합 에디터는 여러 단계가 누적됩니다. baseline 통계를 먼저 잡으면 각 단계의 효과를 정확히 비교할 수 있습니다.\r
  explanation: |-\r
    china는 풍경 사진이라 여러 보정 효과가 잘 드러납니다.\r
    baseline mean과 std를 NumPy로 측정해 둡니다. 이 값들이 이후 편집 단계의 비교 기준입니다.\r
  tips:\r
  - "from PIL import Image, ImageFilter, ImageEnhance, ImageDraw로 한꺼번에 import."\r
  - "ndarray ↔ Image 변환은 비용이 적습니다. 자주 써도 안전."\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageFilter, ImageEnhance, ImageDraw\r
    from sklearn.datasets import load_sample_image\r
\r
    original = Image.fromarray(load_sample_image('china.jpg'))\r
    originalArr = np.asarray(original)\r
\r
    {\r
        'mode': original.mode,\r
        'size': original.size,\r
        'baseMean': round(float(originalArr.mean()), 2),\r
        'baseStd': round(float(originalArr.std()), 2),\r
    }\r
  exercise:\r
    prompt: flower 입력으로 같은 baseline을 측정하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      flower = Image.fromarray(load_sample_image('___'))\r
      {'mean': round(float(np.asarray(flower).mean()), 2)}\r
    hints:\r
    - flower 파일.\r
    - 빈칸에는 flower.jpg가 들어갑니다.\r
    check:\r
      noError: load_sample_image가 끝나야 합니다.\r
      resultCheck: mean이 양수여야 합니다.\r
  check:\r
    noError: load와 통계 계산이 끝나야 합니다.\r
    resultCheck: mode가 'RGB', size가 (640, 427)이어야 합니다.\r
- id: step2_crop_resize\r
  title: 2단계. crop과 resize 단계\r
  structuredPrimary: true\r
  subtitle: 가운데 영역 + 표준 크기\r
  goal: china 가운데 절반 영역을 crop으로 자르고 (320, 240) 표준 크기로 resize한 결과의 size가 정확한지 확인합니다.\r
  why: 종합 에디터의 첫 단계는 보통 입력 정규화(crop + resize)입니다. 표준 크기로 통일하면 다음 단계 처리가 일관됩니다.\r
  explanation: |-\r
    crop ((left, upper, right, lower) 4-tuple)으로 가운데 영역만 추출.\r
    resize ((width, height) 2-tuple)로 표준 크기로 통일.\r
    두 단계는 메서드 체이닝이 자연스럽습니다.\r
  tips:\r
  - 입력 사진의 비율이 다르면 letterbox나 center crop이 필요합니다.\r
  - 표준 크기는 도메인에 따라 다릅니다. 모바일 썸네일은 (300, 300), 인쇄용은 더 큰 크기.\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    cropResize = Image.fromarray(load_sample_image('china.jpg'))\r
    w, h = cropResize.size\r
    centerCrop = cropResize.crop((w // 4, h // 4, w * 3 // 4, h * 3 // 4))\r
    standardSize = centerCrop.resize((320, 240))\r
\r
    {\r
        'originalSize': cropResize.size,\r
        'cropSize': centerCrop.size,\r
        'standardSize': standardSize.size,\r
        'isStandard': standardSize.size == (320, 240),\r
    }\r
  exercise:\r
    prompt: 같은 흐름을 (200, 150) 작은 표준 크기에 적용해 결과 size를 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      small = Image.fromarray(load_sample_image('china.jpg')).crop((100, 50, 500, 350)).resize((200, ___))\r
      {'size': small.size}\r
    hints:\r
    - 높이 150.\r
    - 빈칸에는 150이 들어갑니다.\r
    check:\r
      noError: crop과 resize가 끝나야 합니다.\r
      resultCheck: size가 (200, 150)이어야 합니다.\r
  check:\r
    noError: crop과 resize가 끝나야 합니다.\r
    resultCheck: isStandard가 True여야 합니다.\r
- id: step3_filter_enhance\r
  title: 3단계. filter와 enhance 결합\r
  structuredPrimary: true\r
  subtitle: GaussianBlur + Sharpness\r
  goal: 표준 크기 이미지에 GaussianBlur(radius=1)로 노이즈를 살짝 줄이고 Sharpness.enhance(1.3)으로 선명도를 강화한 뒤 표준편차 변화로 효과를 확인합니다.\r
  why: 노이즈 제거(약한 blur) + 선명도 강화는 사진 보정의 흔한 조합입니다. 두 단계를 결합해 표준편차 변화를 측정하면 효과의 균형을 확인할 수 있습니다.\r
  explanation: |-\r
    약한 GaussianBlur(radius=1)는 미세 노이즈를 줄이지만 디테일은 거의 보존합니다.\r
    Sharpness.enhance(1.3)으로 약하게 선명도를 강화하면 보정 후 결과가 자연스럽습니다.\r
    두 단계의 결과 표준편차를 baseline과 비교합니다. 합산 효과로 std는 약간 늘어나는 경향이 일반적입니다.\r
  tips:\r
  - blur radius=1과 Sharpness 1.3은 거의 모든 사진에 안전한 시작값입니다.\r
  - 더 강한 보정이 필요하면 radius=3, Sharpness=1.5 정도까지 시도.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageFilter, ImageEnhance\r
    from sklearn.datasets import load_sample_image\r
\r
    filterFrame = Image.fromarray(load_sample_image('china.jpg')).resize((320, 240))\r
    baseStd = float(np.asarray(filterFrame).std())\r
\r
    blurred = filterFrame.filter(ImageFilter.GaussianBlur(radius=1))\r
    sharpened = ImageEnhance.Sharpness(blurred).enhance(1.3)\r
\r
    {\r
        'baseStd': round(baseStd, 2),\r
        'blurStd': round(float(np.asarray(blurred).std()), 2),\r
        'sharpStd': round(float(np.asarray(sharpened).std()), 2),\r
    }\r
  exercise:\r
    prompt: GaussianBlur radius=3으로 더 강하게 적용해 결과 std가 radius=1보다 작은지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageFilter\r
      from sklearn.datasets import load_sample_image\r
\r
      strongBlurred = Image.fromarray(load_sample_image('china.jpg')).resize((320, 240)).filter(ImageFilter.GaussianBlur(radius=___))\r
      {'strongStd': round(float(np.asarray(strongBlurred).std()), 2)}\r
    hints:\r
    - radius 3.\r
    - 빈칸에는 3이 들어갑니다.\r
    check:\r
      noError: filter 호출이 끝나야 합니다.\r
      resultCheck: strongStd가 양수여야 합니다.\r
  check:\r
    noError: filter/enhance 호출이 끝나야 합니다.\r
    resultCheck: blurStd가 baseStd 이하여야 합니다.\r
- id: step4_watermark\r
  title: 4단계. 텍스트 워터마크\r
  structuredPrimary: true\r
  subtitle: RGBA + paste\r
  goal: 보정된 이미지에 RGBA 변환 후 ImageDraw로 우측 하단 워터마크를 그리고 alpha 합성으로 자연스럽게 통합합니다.\r
  why: 워터마크는 종합 에디터의 마지막 단계가 흔합니다. 알파 합성으로 자연스럽게 통합되도록 RGBA 흐름이 필요합니다.\r
  explanation: |-\r
    convert('RGBA')로 알파 채널 추가.\r
    텍스트 레이어를 만들고 paste(layer, (0, 0), mask=layer)로 합성.\r
    "@codaro" 같은 짧은 워터마크가 우측 하단에 그려집니다.\r
  tips:\r
  - 워터마크는 보통 alpha=128~200 정도가 자연스럽습니다.\r
  - 우측 하단 좌표는 (canvas.size[0] - padding - textWidth, canvas.size[1] - padding - textHeight).\r
  snippet: |-\r
    from PIL import Image, ImageDraw\r
    from sklearn.datasets import load_sample_image\r
\r
    waterFrame = Image.fromarray(load_sample_image('china.jpg')).resize((320, 240)).convert('RGBA').copy()\r
    waterLayer = Image.new('RGBA', waterFrame.size, (0, 0, 0, 0))\r
    waterDraw = ImageDraw.Draw(waterLayer)\r
    waterDraw.text((220, 220), '@codaro', fill=(255, 255, 255, 160))\r
    waterFrame.paste(waterLayer, (0, 0), mask=waterLayer)\r
\r
    {\r
        'mode': waterFrame.mode,\r
        'size': waterFrame.size,\r
        'isRGBA': waterFrame.mode == 'RGBA',\r
    }\r
  exercise:\r
    prompt: 워터마크 텍스트를 'edit'로 바꿔 같은 흐름을 실행하세요.\r
    starterCode: |-\r
      from PIL import Image, ImageDraw\r
      from sklearn.datasets import load_sample_image\r
\r
      editFrame = Image.fromarray(load_sample_image('china.jpg')).resize((320, 240)).convert('RGBA').copy()\r
      editLayer = Image.new('RGBA', editFrame.size, (0, 0, 0, 0))\r
      ImageDraw.Draw(editLayer).text((220, 220), '___', fill=(255, 255, 255, 160))\r
      editFrame.paste(editLayer, (0, 0), mask=editLayer)\r
      {'mode': editFrame.mode}\r
    hints:\r
    - 워터마크 텍스트 edit.\r
    - 빈칸에는 edit가 들어갑니다.\r
    check:\r
      noError: paste 호출이 끝나야 합니다.\r
      resultCheck: mode가 'RGBA'여야 합니다.\r
  check:\r
    noError: paste 호출이 끝나야 합니다.\r
    resultCheck: isRGBA가 True여야 합니다.\r
- id: step5_editphoto\r
  title: 5단계. editPhoto 종합 함수\r
  structuredPrimary: true\r
  subtitle: 모든 단계 결합\r
  goal: editPhoto(image, config) 함수가 crop→resize→filter→enhance→watermark를 한 번에 적용하고 단계별 통계를 dict로 보고합니다.\r
  why: 종합 함수가 자동화 파이프라인의 표준 도구입니다. 같은 함수를 다양한 입력에 적용해 일관된 결과를 얻을 수 있습니다.\r
  explanation: |-\r
    editPhoto는 RGB Image와 config dict를 받아 보정된 RGBA Image와 단계별 통계를 돌려줍니다.\r
    config는 cropBox, standardSize, blurRadius, sharpness, watermarkText 키를 가집니다.\r
    각 단계 결과의 통계(mean, std)를 함께 보고하면 자동화 로그로 활용 가능합니다.\r
  tips:\r
  - config 키에 기본값을 두면 호출자가 일부만 지정해도 됩니다.\r
  - 결과 Image와 함께 단계별 통계를 보고하는 dict 패턴이 자동화 보고서에 표준입니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageFilter, ImageEnhance, ImageDraw\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def editPhoto(image: Image.Image, config: dict) -> dict:\r
        cropped = image.crop(config['cropBox'])\r
        resized = cropped.resize(config['standardSize'])\r
        blurred = resized.filter(ImageFilter.GaussianBlur(radius=config['blurRadius']))\r
        sharpened = ImageEnhance.Sharpness(blurred).enhance(config['sharpness'])\r
        rgba = sharpened.convert('RGBA').copy()\r
        layer = Image.new('RGBA', rgba.size, (0, 0, 0, 0))\r
        draw = ImageDraw.Draw(layer)\r
        bbox = draw.textbbox((0, 0), config['watermarkText'])\r
        textWidth = bbox[2] - bbox[0]\r
        textHeight = bbox[3] - bbox[1]\r
        wmPos = (rgba.size[0] - textWidth - 12, rgba.size[1] - textHeight - 12)\r
        draw.text(wmPos, config['watermarkText'], fill=(255, 255, 255, 160))\r
        rgba.paste(layer, (0, 0), mask=layer)\r
        return {\r
            'finalSize': rgba.size,\r
            'finalMode': rgba.mode,\r
            'baseMean': round(float(np.asarray(image).mean()), 2),\r
            'finalMean': round(float(np.asarray(rgba).mean()), 2),\r
        }\r
\r
\r
    chinaInput = Image.fromarray(load_sample_image('china.jpg'))\r
    config = {\r
        'cropBox': (100, 50, 500, 350),\r
        'standardSize': (320, 240),\r
        'blurRadius': 1,\r
        'sharpness': 1.3,\r
        'watermarkText': '@codaro',\r
    }\r
    editPhoto(chinaInput, config)\r
  exercise:\r
    prompt: editPhoto에 다른 standardSize (200, 150)을 넘기면 finalSize가 그대로 (200, 150)인지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageFilter, ImageEnhance, ImageDraw\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def editPhoto(image, config):\r
          cropped = image.crop(config['cropBox'])\r
          resized = cropped.resize(config['standardSize'])\r
          return {'finalSize': resized.size}\r
\r
\r
      smallConfig = {\r
          'cropBox': (100, 50, 500, 350),\r
          'standardSize': (200, ___),\r
      }\r
      result = editPhoto(Image.fromarray(load_sample_image('china.jpg')), smallConfig)\r
      {'finalSize': result['finalSize'], 'isExact': result['finalSize'] == (200, 150)}\r
    hints:\r
    - 높이 150.\r
    - 빈칸에는 150이 들어갑니다.\r
    check:\r
      noError: editPhoto 정의와 호출이 끝나야 합니다.\r
      resultCheck: isExact가 True여야 합니다.\r
  check:\r
    noError: editPhoto 정의와 호출이 끝나야 합니다.\r
    resultCheck: finalSize가 (320, 240), finalMode가 'RGBA'여야 합니다.\r
- id: practice\r
  title: 실습 - flower에 같은 함수\r
  structuredPrimary: true\r
  subtitle: 일반화 검증\r
  goal: 같은 editPhoto 함수와 config를 flower 입력에 적용해 결과 dict가 같은 형식으로 돌아오는지 확인합니다.\r
  why: 함수가 다양한 입력에 같은 형식으로 결과를 돌려준다는 것이 자동화 도구의 핵심 가치입니다.\r
  explanation: |-\r
    flower 입력은 china와 같은 (640, 427) 크기지만 색조가 다릅니다.\r
    같은 config로 editPhoto를 호출하면 결과 dict 키는 동일하고 값(평균/std)만 다른 결과가 나옵니다.\r
    이 일관성이 자동화 코드에서 입력별 분기 없이 같은 처리 흐름을 가능하게 합니다.\r
  tips:\r
  - 결과 dict 형식이 같으면 단위 테스트와 비교 분석이 쉬워집니다.\r
  - 함수가 인자 검증을 함수 입구에서 하면 잘못된 호출이 조기 차단됩니다(6단계 참고).\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageFilter, ImageEnhance, ImageDraw\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def editPhoto(image: Image.Image, config: dict) -> dict:\r
        cropped = image.crop(config['cropBox'])\r
        resized = cropped.resize(config['standardSize'])\r
        blurred = resized.filter(ImageFilter.GaussianBlur(radius=config['blurRadius']))\r
        sharpened = ImageEnhance.Sharpness(blurred).enhance(config['sharpness'])\r
        rgba = sharpened.convert('RGBA').copy()\r
        layer = Image.new('RGBA', rgba.size, (0, 0, 0, 0))\r
        draw = ImageDraw.Draw(layer)\r
        bbox = draw.textbbox((0, 0), config['watermarkText'])\r
        textWidth = bbox[2] - bbox[0]\r
        textHeight = bbox[3] - bbox[1]\r
        wmPos = (rgba.size[0] - textWidth - 12, rgba.size[1] - textHeight - 12)\r
        draw.text(wmPos, config['watermarkText'], fill=(255, 255, 255, 160))\r
        rgba.paste(layer, (0, 0), mask=layer)\r
        return {\r
            'finalSize': rgba.size,\r
            'finalMode': rgba.mode,\r
            'baseMean': round(float(np.asarray(image).mean()), 2),\r
            'finalMean': round(float(np.asarray(rgba).mean()), 2),\r
        }\r
\r
\r
    config = {\r
        'cropBox': (100, 50, 500, 350),\r
        'standardSize': (320, 240),\r
        'blurRadius': 1,\r
        'sharpness': 1.3,\r
        'watermarkText': '@codaro',\r
    }\r
    flowerResult = editPhoto(Image.fromarray(load_sample_image('flower.jpg')), config)\r
    chinaResult = editPhoto(Image.fromarray(load_sample_image('china.jpg')), config)\r
    [flowerResult, chinaResult]\r
  exercise:\r
    prompt: 두 결과가 모두 같은 키를 가지는지 sorted(dict.keys()) 비교로 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageFilter, ImageEnhance, ImageDraw\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def editPhoto(image, config):\r
          cropped = image.crop(config['cropBox'])\r
          resized = cropped.resize(config['standardSize'])\r
          return {'finalSize': resized.size, 'baseMean': round(float(np.asarray(image).mean()), 2)}\r
\r
\r
      config = {'cropBox': (100, 50, 500, 350), 'standardSize': (320, 240)}\r
      r1 = editPhoto(Image.fromarray(load_sample_image('china.jpg')), config)\r
      r2 = editPhoto(Image.fromarray(load_sample_image('flower.jpg')), config)\r
      {'sameKeys': sorted(r1.keys()) == sorted(r2.___())}\r
    hints:\r
    - dict.keys() 메서드.\r
    - 빈칸에는 keys가 들어갑니다.\r
    check:\r
      noError: editPhoto와 두 호출이 끝나야 합니다.\r
      resultCheck: sameKeys가 True여야 합니다.\r
  check:\r
    noError: editPhoto와 두 호출이 끝나야 합니다.\r
    resultCheck: 두 결과 모두 4개 키 (finalSize, finalMode, baseMean, finalMean)를 가져야 합니다.\r
- id: workflow_validation\r
  title: 6단계. config 가드 함수\r
  structuredPrimary: true\r
  subtitle: validateEditConfig\r
  goal: validateEditConfig 함수가 필수 키 누락이나 잘못된 타입을 ValueError로 차단하는지 검증합니다.\r
  why: config dict는 자주 손으로 쓰는 인자라 키 오타나 누락이 흔합니다. 함수 입구에서 검증하면 그 사고가 즉시 차단됩니다.\r
  explanation: |-\r
    validateEditConfig는 (1) 필수 키가 모두 있는지, (2) cropBox가 4-tuple인지, (3) standardSize가 2-tuple인지 검사합니다.\r
    누락이나 타입 오류면 ValueError에 실제 받은 값을 메시지에 포함시킵니다.\r
    호출자가 config를 작성할 때 즉시 피드백을 받아 디버깅이 빨라집니다.\r
  tips:\r
  - "필수 키 검증은 set 차집합(set(required) - set(config))으로 간단히 표현할 수 있습니다."\r
  - "validateEditConfig는 editPhoto 함수의 첫 줄에서 호출해 입력 안전을 보장하는 게 표준."\r
  snippet: |-\r
    REQUIRED_KEYS = {'cropBox', 'standardSize', 'blurRadius', 'sharpness', 'watermarkText'}\r
\r
\r
    def validateEditConfig(config: dict) -> bool:\r
        missing = REQUIRED_KEYS - set(config.keys())\r
        if missing:\r
            raise ValueError(f"필수 키 누락: {sorted(missing)}")\r
        if not isinstance(config['cropBox'], tuple) or len(config['cropBox']) != 4:\r
            raise ValueError(f"cropBox는 4-tuple이어야 합니다: {config['cropBox']}")\r
        if not isinstance(config['standardSize'], tuple) or len(config['standardSize']) != 2:\r
            raise ValueError(f"standardSize는 2-tuple이어야 합니다: {config['standardSize']}")\r
        return True\r
\r
\r
    okConfig = {\r
        'cropBox': (100, 50, 500, 350),\r
        'standardSize': (320, 240),\r
        'blurRadius': 1,\r
        'sharpness': 1.3,\r
        'watermarkText': '@codaro',\r
    }\r
    okResult = validateEditConfig(okConfig)\r
\r
    try:\r
        validateEditConfig({'cropBox': (1, 2, 3, 4)})\r
        missingMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        missingMessage = str(exc)\r
\r
    try:\r
        validateEditConfig({**okConfig, 'cropBox': (1, 2, 3)})\r
        cropMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        cropMessage = str(exc)\r
\r
    {\r
        'okResult': okResult,\r
        'missingMessage': missingMessage,\r
        'cropMessage': cropMessage,\r
    }\r
  exercise:\r
    prompt: validateEditConfig에 standardSize가 길이 3 tuple인 잘못된 config를 넘기면 오류가 잡히는지 확인하세요.\r
    starterCode: |-\r
      REQUIRED_KEYS = {'cropBox', 'standardSize', 'blurRadius', 'sharpness', 'watermarkText'}\r
\r
\r
      def validateEditConfig(config):\r
          missing = REQUIRED_KEYS - set(config.keys())\r
          if missing:\r
              raise ValueError(f"필수 키 누락: {sorted(missing)}")\r
          if not isinstance(config['cropBox'], tuple) or len(config['cropBox']) != 4:\r
              raise ValueError(f"cropBox는 4-tuple이어야 합니다: {config['cropBox']}")\r
          if not isinstance(config['standardSize'], tuple) or len(config['standardSize']) != 2:\r
              raise ValueError(f"standardSize는 2-tuple이어야 합니다: {config['standardSize']}")\r
          return True\r
\r
\r
      badConfig = {\r
          'cropBox': (1, 2, 3, 4),\r
          'standardSize': (320, 240, ___),\r
          'blurRadius': 1,\r
          'sharpness': 1.3,\r
          'watermarkText': '@x',\r
      }\r
      try:\r
          validateEditConfig(badConfig)\r
          msg = 'unexpected pass'\r
      except ValueError as exc:\r
          msg = str(exc)\r
      {'msg': msg, 'caught': 'standardSize' in msg}\r
    hints:\r
    - 3원소 standardSize의 세 번째 값.\r
    - 빈칸에는 1이 들어갑니다.\r
    check:\r
      noError: validateEditConfig 정의가 끝나야 합니다.\r
      resultCheck: caught가 True여야 합니다.\r
  check:\r
    noError: validateEditConfig 정의와 세 호출이 끝나야 합니다.\r
    resultCheck: okResult가 True, missingMessage에 '누락', cropMessage에 'cropBox' 단서가 포함되어야 합니다.\r
`;export{e as default};