var e=`meta:
  packages:
  - numpy
  - pillow
  - scikit-learn
  id: pillow_10
  title: 종합이미지에디터
  order: 10
  category: pillow
  difficulty: ⭐⭐⭐⭐
  badge: 심화
  tags:
  - Pillow
  - 종합
  - 에디터
  - 필터
  - 텍스트
  - 합성
  seo:
    title: Pillow 심화 - 종합 이미지 에디터
    description: Pillow 모든 기능을 결합해 crop→filter→enhance→watermark→save 파이프라인 한 함수를 만듭니다.
    keywords:
    - Pillow
    - 이미지에디터
    - 종합
    - 필터
    - 합성
    - 텍스트
intro:
  emoji: 🎬
  goal: 01~09에서 익힌 Pillow 기능들을 editPhoto 함수 한 개로 결합해 crop→filter→enhance→watermark 흐름을 합성 입력 검증 후 실제 사진에 일반화합니다.
  description: 종합 강의는 각 강의의 단편을 한 함수에 묶는 작업입니다. 인터페이스가 일관되면 자동화 파이프라인이 됩니다.
  direction: 각 단계를 dict로 보고하는 editPhoto 함수 → 합성 입력 검증 → china/flower 일반화 → 가드 함수.
  benefits:
  - crop/resize/filter/enhance/watermark 다섯 작업을 한 함수에 결합합니다.
  - 단계별 통계 dict로 자동화 보고 형식을 만듭니다.
  - 함수의 인자 인터페이스로 유연한 보정 흐름을 제공합니다.
  - validateEditConfig로 잘못된 인자 차단.
  diagram:
    steps:
    - label: 원본 로드
      detail: china를 Image로 변환.
    - label: editPhoto 한 줄
      detail: crop→resize→filter→enhance→watermark.
    - label: 단계별 통계
      detail: 각 단계 후 표준편차/평균 변화 보고.
    - label: 다른 입력 적용
      detail: flower에 같은 함수 적용해 일반화 검증.
    - label: 가드 함수
      detail: validateEditConfig로 dict 인자 안전성 확인.
    runtime:
    - label: pillow + numpy
      detail: 단계별 통계 계산.
    - label: 함수형 흐름
      detail: 각 단계가 새 Image를 돌려줘 원본 보존.
sections:
- id: step1_load
  title: 1단계. 종합 입력 준비
  structuredPrimary: true
  subtitle: china 원본
  goal: china 샘플을 Pillow Image로 만들고 baseline 통계를 측정해 이후 모든 편집 단계의 비교 기준값을 정합니다.
  why: 종합 에디터는 여러 단계가 누적됩니다. baseline 통계를 먼저 잡으면 각 단계의 효과를 정확히 비교할 수 있습니다.
  explanation: |-
    china는 풍경 사진이라 여러 보정 효과가 잘 드러납니다.
    baseline mean과 std를 NumPy로 측정해 둡니다. 이 값들이 이후 편집 단계의 비교 기준입니다.
  tips:
  - "from PIL import Image, ImageFilter, ImageEnhance, ImageDraw로 한꺼번에 import."
  - "ndarray ↔ Image 변환은 비용이 적습니다. 자주 써도 안전."
  snippet: |-
    import numpy as np
    from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
    from sklearn.datasets import load_sample_image

    original = Image.fromarray(load_sample_image('china.jpg'))
    originalArr = np.asarray(original)

    {
        'mode': original.mode,
        'size': original.size,
        'baseMean': round(float(originalArr.mean()), 2),
        'baseStd': round(float(originalArr.std()), 2),
    }
  exercise:
    prompt: flower 입력으로 같은 baseline을 측정하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image
      from sklearn.datasets import load_sample_image

      flower = Image.fromarray(load_sample_image('___'))
      {'mean': round(float(np.asarray(flower).mean()), 2)}
    hints:
    - flower 파일.
    - 빈칸에는 flower.jpg가 들어갑니다.
    check:
      noError: load_sample_image가 끝나야 합니다.
      resultCheck: mean이 양수여야 합니다.
  check:
    noError: load와 통계 계산이 끝나야 합니다.
    resultCheck: mode가 'RGB', size가 (640, 427)이어야 합니다.
- id: step2_crop_resize
  title: 2단계. crop과 resize 단계
  structuredPrimary: true
  subtitle: 가운데 영역 + 표준 크기
  goal: china 가운데 절반 영역을 crop으로 자르고 (320, 240) 표준 크기로 resize한 결과의 size가 정확한지 확인합니다.
  why: 종합 에디터의 첫 단계는 보통 입력 정규화(crop + resize)입니다. 표준 크기로 통일하면 다음 단계 처리가 일관됩니다.
  explanation: |-
    crop ((left, upper, right, lower) 4-tuple)으로 가운데 영역만 추출.
    resize ((width, height) 2-tuple)로 표준 크기로 통일.
    두 단계는 메서드 체이닝이 자연스럽습니다.
  tips:
  - 입력 사진의 비율이 다르면 letterbox나 center crop이 필요합니다.
  - 표준 크기는 도메인에 따라 다릅니다. 모바일 썸네일은 (300, 300), 인쇄용은 더 큰 크기.
  snippet: |-
    from PIL import Image
    from sklearn.datasets import load_sample_image

    cropResize = Image.fromarray(load_sample_image('china.jpg'))
    w, h = cropResize.size
    centerCrop = cropResize.crop((w // 4, h // 4, w * 3 // 4, h * 3 // 4))
    standardSize = centerCrop.resize((320, 240))

    {
        'originalSize': cropResize.size,
        'cropSize': centerCrop.size,
        'standardSize': standardSize.size,
        'isStandard': standardSize.size == (320, 240),
    }
  exercise:
    prompt: 같은 흐름을 (200, 150) 작은 표준 크기에 적용해 결과 size를 확인하세요.
    starterCode: |-
      from PIL import Image
      from sklearn.datasets import load_sample_image

      small = Image.fromarray(load_sample_image('china.jpg')).crop((100, 50, 500, 350)).resize((200, ___))
      {'size': small.size}
    hints:
    - 높이 150.
    - 빈칸에는 150이 들어갑니다.
    check:
      noError: crop과 resize가 끝나야 합니다.
      resultCheck: size가 (200, 150)이어야 합니다.
  check:
    noError: crop과 resize가 끝나야 합니다.
    resultCheck: isStandard가 True여야 합니다.
- id: step3_filter_enhance
  title: 3단계. filter와 enhance 결합
  structuredPrimary: true
  subtitle: GaussianBlur + Sharpness
  goal: 표준 크기 이미지에 GaussianBlur(radius=1)로 노이즈를 살짝 줄이고 Sharpness.enhance(1.3)으로 선명도를 강화한 뒤 표준편차 변화로 효과를 확인합니다.
  why: 노이즈 제거(약한 blur) + 선명도 강화는 사진 보정의 흔한 조합입니다. 두 단계를 결합해 표준편차 변화를 측정하면 효과의 균형을 확인할 수 있습니다.
  explanation: |-
    약한 GaussianBlur(radius=1)는 미세 노이즈를 줄이지만 디테일은 거의 보존합니다.
    Sharpness.enhance(1.3)으로 약하게 선명도를 강화하면 보정 후 결과가 자연스럽습니다.
    두 단계의 결과 표준편차를 baseline과 비교합니다. 합산 효과로 std는 약간 늘어나는 경향이 일반적입니다.
  tips:
  - blur radius=1과 Sharpness 1.3은 거의 모든 사진에 안전한 시작값입니다.
  - 더 강한 보정이 필요하면 radius=3, Sharpness=1.5 정도까지 시도.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageFilter, ImageEnhance
    from sklearn.datasets import load_sample_image

    filterFrame = Image.fromarray(load_sample_image('china.jpg')).resize((320, 240))
    baseStd = float(np.asarray(filterFrame).std())

    blurred = filterFrame.filter(ImageFilter.GaussianBlur(radius=1))
    sharpened = ImageEnhance.Sharpness(blurred).enhance(1.3)

    {
        'baseStd': round(baseStd, 2),
        'blurStd': round(float(np.asarray(blurred).std()), 2),
        'sharpStd': round(float(np.asarray(sharpened).std()), 2),
    }
  exercise:
    prompt: GaussianBlur radius=3으로 더 강하게 적용해 결과 std가 radius=1보다 작은지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageFilter
      from sklearn.datasets import load_sample_image

      strongBlurred = Image.fromarray(load_sample_image('china.jpg')).resize((320, 240)).filter(ImageFilter.GaussianBlur(radius=___))
      {'strongStd': round(float(np.asarray(strongBlurred).std()), 2)}
    hints:
    - radius 3.
    - 빈칸에는 3이 들어갑니다.
    check:
      noError: filter 호출이 끝나야 합니다.
      resultCheck: strongStd가 양수여야 합니다.
  check:
    noError: filter/enhance 호출이 끝나야 합니다.
    resultCheck: blurStd가 baseStd 이하여야 합니다.
- id: step4_watermark
  title: 4단계. 텍스트 워터마크
  structuredPrimary: true
  subtitle: RGBA + paste
  goal: 보정된 이미지에 RGBA 변환 후 ImageDraw로 우측 하단 워터마크를 그리고 alpha 합성으로 자연스럽게 통합합니다.
  why: 워터마크는 종합 에디터의 마지막 단계가 흔합니다. 알파 합성으로 자연스럽게 통합되도록 RGBA 흐름이 필요합니다.
  explanation: |-
    convert('RGBA')로 알파 채널 추가.
    텍스트 레이어를 만들고 paste(layer, (0, 0), mask=layer)로 합성.
    "@codaro" 같은 짧은 워터마크가 우측 하단에 그려집니다.
  tips:
  - 워터마크는 보통 alpha=128~200 정도가 자연스럽습니다.
  - 우측 하단 좌표는 (canvas.size[0] - padding - textWidth, canvas.size[1] - padding - textHeight).
  snippet: |-
    from PIL import Image, ImageDraw
    from sklearn.datasets import load_sample_image

    waterFrame = Image.fromarray(load_sample_image('china.jpg')).resize((320, 240)).convert('RGBA').copy()
    waterLayer = Image.new('RGBA', waterFrame.size, (0, 0, 0, 0))
    waterDraw = ImageDraw.Draw(waterLayer)
    waterDraw.text((220, 220), '@codaro', fill=(255, 255, 255, 160))
    waterFrame.paste(waterLayer, (0, 0), mask=waterLayer)

    {
        'mode': waterFrame.mode,
        'size': waterFrame.size,
        'isRGBA': waterFrame.mode == 'RGBA',
    }
  exercise:
    prompt: 워터마크 텍스트를 'edit'로 바꿔 같은 흐름을 실행하세요.
    starterCode: |-
      from PIL import Image, ImageDraw
      from sklearn.datasets import load_sample_image

      editFrame = Image.fromarray(load_sample_image('china.jpg')).resize((320, 240)).convert('RGBA').copy()
      editLayer = Image.new('RGBA', editFrame.size, (0, 0, 0, 0))
      ImageDraw.Draw(editLayer).text((220, 220), '___', fill=(255, 255, 255, 160))
      editFrame.paste(editLayer, (0, 0), mask=editLayer)
      {'mode': editFrame.mode}
    hints:
    - 워터마크 텍스트 edit.
    - 빈칸에는 edit가 들어갑니다.
    check:
      noError: paste 호출이 끝나야 합니다.
      resultCheck: mode가 'RGBA'여야 합니다.
  check:
    noError: paste 호출이 끝나야 합니다.
    resultCheck: isRGBA가 True여야 합니다.
- id: step5_editphoto
  title: 5단계. editPhoto 종합 함수
  structuredPrimary: true
  subtitle: 모든 단계 결합
  goal: editPhoto(image, config) 함수가 crop→resize→filter→enhance→watermark를 한 번에 적용하고 단계별 통계를 dict로 보고합니다.
  why: 종합 함수가 자동화 파이프라인의 표준 도구입니다. 같은 함수를 다양한 입력에 적용해 일관된 결과를 얻을 수 있습니다.
  explanation: |-
    editPhoto는 RGB Image와 config dict를 받아 보정된 RGBA Image와 단계별 통계를 돌려줍니다.
    config는 cropBox, standardSize, blurRadius, sharpness, watermarkText 키를 가집니다.
    각 단계 결과의 통계(mean, std)를 함께 보고하면 자동화 로그로 활용 가능합니다.
  tips:
  - config 키에 기본값을 두면 호출자가 일부만 지정해도 됩니다.
  - 결과 Image와 함께 단계별 통계를 보고하는 dict 패턴이 자동화 보고서에 표준입니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
    from sklearn.datasets import load_sample_image


    def editPhoto(image: Image.Image, config: dict) -> dict:
        cropped = image.crop(config['cropBox'])
        resized = cropped.resize(config['standardSize'])
        blurred = resized.filter(ImageFilter.GaussianBlur(radius=config['blurRadius']))
        sharpened = ImageEnhance.Sharpness(blurred).enhance(config['sharpness'])
        rgba = sharpened.convert('RGBA').copy()
        layer = Image.new('RGBA', rgba.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer)
        bbox = draw.textbbox((0, 0), config['watermarkText'])
        textWidth = bbox[2] - bbox[0]
        textHeight = bbox[3] - bbox[1]
        wmPos = (rgba.size[0] - textWidth - 12, rgba.size[1] - textHeight - 12)
        draw.text(wmPos, config['watermarkText'], fill=(255, 255, 255, 160))
        rgba.paste(layer, (0, 0), mask=layer)
        return {
            'finalSize': rgba.size,
            'finalMode': rgba.mode,
            'baseMean': round(float(np.asarray(image).mean()), 2),
            'finalMean': round(float(np.asarray(rgba).mean()), 2),
        }


    chinaInput = Image.fromarray(load_sample_image('china.jpg'))
    config = {
        'cropBox': (100, 50, 500, 350),
        'standardSize': (320, 240),
        'blurRadius': 1,
        'sharpness': 1.3,
        'watermarkText': '@codaro',
    }
    editPhoto(chinaInput, config)
  exercise:
    prompt: editPhoto에 다른 standardSize (200, 150)을 넘기면 finalSize가 그대로 (200, 150)인지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
      from sklearn.datasets import load_sample_image


      def editPhoto(image, config):
          cropped = image.crop(config['cropBox'])
          resized = cropped.resize(config['standardSize'])
          return {'finalSize': resized.size}


      smallConfig = {
          'cropBox': (100, 50, 500, 350),
          'standardSize': (200, ___),
      }
      result = editPhoto(Image.fromarray(load_sample_image('china.jpg')), smallConfig)
      {'finalSize': result['finalSize'], 'isExact': result['finalSize'] == (200, 150)}
    hints:
    - 높이 150.
    - 빈칸에는 150이 들어갑니다.
    check:
      noError: editPhoto 정의와 호출이 끝나야 합니다.
      resultCheck: isExact가 True여야 합니다.
  check:
    noError: editPhoto 정의와 호출이 끝나야 합니다.
    resultCheck: finalSize가 (320, 240), finalMode가 'RGBA'여야 합니다.
- id: practice
  title: 실습 - flower에 같은 함수
  structuredPrimary: true
  subtitle: 일반화 검증
  goal: 같은 editPhoto 함수와 config를 flower 입력에 적용해 결과 dict가 같은 형식으로 돌아오는지 확인합니다.
  why: 함수가 다양한 입력에 같은 형식으로 결과를 돌려준다는 것이 자동화 도구의 핵심 가치입니다.
  explanation: |-
    flower 입력은 china와 같은 (640, 427) 크기지만 색조가 다릅니다.
    같은 config로 editPhoto를 호출하면 결과 dict 키는 동일하고 값(평균/std)만 다른 결과가 나옵니다.
    이 일관성이 자동화 코드에서 입력별 분기 없이 같은 처리 흐름을 가능하게 합니다.
  tips:
  - 결과 dict 형식이 같으면 단위 테스트와 비교 분석이 쉬워집니다.
  - 함수가 인자 검증을 함수 입구에서 하면 잘못된 호출이 조기 차단됩니다(6단계 참고).
  snippet: |-
    import numpy as np
    from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
    from sklearn.datasets import load_sample_image


    def editPhoto(image: Image.Image, config: dict) -> dict:
        cropped = image.crop(config['cropBox'])
        resized = cropped.resize(config['standardSize'])
        blurred = resized.filter(ImageFilter.GaussianBlur(radius=config['blurRadius']))
        sharpened = ImageEnhance.Sharpness(blurred).enhance(config['sharpness'])
        rgba = sharpened.convert('RGBA').copy()
        layer = Image.new('RGBA', rgba.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer)
        bbox = draw.textbbox((0, 0), config['watermarkText'])
        textWidth = bbox[2] - bbox[0]
        textHeight = bbox[3] - bbox[1]
        wmPos = (rgba.size[0] - textWidth - 12, rgba.size[1] - textHeight - 12)
        draw.text(wmPos, config['watermarkText'], fill=(255, 255, 255, 160))
        rgba.paste(layer, (0, 0), mask=layer)
        return {
            'finalSize': rgba.size,
            'finalMode': rgba.mode,
            'baseMean': round(float(np.asarray(image).mean()), 2),
            'finalMean': round(float(np.asarray(rgba).mean()), 2),
        }


    config = {
        'cropBox': (100, 50, 500, 350),
        'standardSize': (320, 240),
        'blurRadius': 1,
        'sharpness': 1.3,
        'watermarkText': '@codaro',
    }
    flowerResult = editPhoto(Image.fromarray(load_sample_image('flower.jpg')), config)
    chinaResult = editPhoto(Image.fromarray(load_sample_image('china.jpg')), config)
    [flowerResult, chinaResult]
  exercise:
    prompt: 두 결과가 모두 같은 키를 가지는지 sorted(dict.keys()) 비교로 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
      from sklearn.datasets import load_sample_image


      def editPhoto(image, config):
          cropped = image.crop(config['cropBox'])
          resized = cropped.resize(config['standardSize'])
          return {'finalSize': resized.size, 'baseMean': round(float(np.asarray(image).mean()), 2)}


      config = {'cropBox': (100, 50, 500, 350), 'standardSize': (320, 240)}
      r1 = editPhoto(Image.fromarray(load_sample_image('china.jpg')), config)
      r2 = editPhoto(Image.fromarray(load_sample_image('flower.jpg')), config)
      {'sameKeys': sorted(r1.keys()) == sorted(r2.___())}
    hints:
    - dict.keys() 메서드.
    - 빈칸에는 keys가 들어갑니다.
    check:
      noError: editPhoto와 두 호출이 끝나야 합니다.
      resultCheck: sameKeys가 True여야 합니다.
  check:
    noError: editPhoto와 두 호출이 끝나야 합니다.
    resultCheck: 두 결과 모두 4개 키 (finalSize, finalMode, baseMean, finalMean)를 가져야 합니다.
- id: workflow_validation
  title: 6단계. config 가드 함수
  structuredPrimary: true
  subtitle: validateEditConfig
  goal: validateEditConfig 함수가 필수 키 누락이나 잘못된 타입을 ValueError로 차단하는지 검증합니다.
  why: config dict는 자주 손으로 쓰는 인자라 키 오타나 누락이 흔합니다. 함수 입구에서 검증하면 그 사고가 즉시 차단됩니다.
  explanation: |-
    validateEditConfig는 (1) 필수 키가 모두 있는지, (2) cropBox가 4-tuple인지, (3) standardSize가 2-tuple인지 검사합니다.
    누락이나 타입 오류면 ValueError에 실제 받은 값을 메시지에 포함시킵니다.
    호출자가 config를 작성할 때 즉시 피드백을 받아 디버깅이 빨라집니다.
  tips:
  - "필수 키 검증은 set 차집합(set(required) - set(config))으로 간단히 표현할 수 있습니다."
  - "validateEditConfig는 editPhoto 함수의 첫 줄에서 호출해 입력 안전을 보장하는 게 표준."
  snippet: |-
    REQUIRED_KEYS = {'cropBox', 'standardSize', 'blurRadius', 'sharpness', 'watermarkText'}


    def validateEditConfig(config: dict) -> bool:
        missing = REQUIRED_KEYS - set(config.keys())
        if missing:
            raise ValueError(f"필수 키 누락: {sorted(missing)}")
        if not isinstance(config['cropBox'], tuple) or len(config['cropBox']) != 4:
            raise ValueError(f"cropBox는 4-tuple이어야 합니다: {config['cropBox']}")
        if not isinstance(config['standardSize'], tuple) or len(config['standardSize']) != 2:
            raise ValueError(f"standardSize는 2-tuple이어야 합니다: {config['standardSize']}")
        return True


    okConfig = {
        'cropBox': (100, 50, 500, 350),
        'standardSize': (320, 240),
        'blurRadius': 1,
        'sharpness': 1.3,
        'watermarkText': '@codaro',
    }
    okResult = validateEditConfig(okConfig)

    try:
        validateEditConfig({'cropBox': (1, 2, 3, 4)})
        missingMessage = 'unexpected pass'
    except ValueError as exc:
        missingMessage = str(exc)

    try:
        validateEditConfig({**okConfig, 'cropBox': (1, 2, 3)})
        cropMessage = 'unexpected pass'
    except ValueError as exc:
        cropMessage = str(exc)

    {
        'okResult': okResult,
        'missingMessage': missingMessage,
        'cropMessage': cropMessage,
    }
  exercise:
    prompt: validateEditConfig에 standardSize가 길이 3 tuple인 잘못된 config를 넘기면 오류가 잡히는지 확인하세요.
    starterCode: |-
      REQUIRED_KEYS = {'cropBox', 'standardSize', 'blurRadius', 'sharpness', 'watermarkText'}


      def validateEditConfig(config):
          missing = REQUIRED_KEYS - set(config.keys())
          if missing:
              raise ValueError(f"필수 키 누락: {sorted(missing)}")
          if not isinstance(config['cropBox'], tuple) or len(config['cropBox']) != 4:
              raise ValueError(f"cropBox는 4-tuple이어야 합니다: {config['cropBox']}")
          if not isinstance(config['standardSize'], tuple) or len(config['standardSize']) != 2:
              raise ValueError(f"standardSize는 2-tuple이어야 합니다: {config['standardSize']}")
          return True


      badConfig = {
          'cropBox': (1, 2, 3, 4),
          'standardSize': (320, 240, ___),
          'blurRadius': 1,
          'sharpness': 1.3,
          'watermarkText': '@x',
      }
      try:
          validateEditConfig(badConfig)
          msg = 'unexpected pass'
      except ValueError as exc:
          msg = str(exc)
      {'msg': msg, 'caught': 'standardSize' in msg}
    hints:
    - 3원소 standardSize의 세 번째 값.
    - 빈칸에는 1이 들어갑니다.
    check:
      noError: validateEditConfig 정의가 끝나야 합니다.
      resultCheck: caught가 True여야 합니다.
  check:
    noError: validateEditConfig 정의와 세 호출이 끝나야 합니다.
    resultCheck: okResult가 True, missingMessage에 '누락', cropMessage에 'cropBox' 단서가 포함되어야 합니다.
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
  - id: pillow_10-image_editor-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - workflow_validation
    title: 종합 이미지 에디터 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 편집 operation DAG·output format·quality budget를 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_image_editor_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_image_editor_contract(value):
            raise NotImplementedError
      solution: |
        def audit_image_editor_contract(value):
            required = ['operations', 'outputFormat', 'quality', 'maxPixels']
            rules = [{'id': 'operations', 'field': 'operations', 'kind': 'nonempty'}, {'id': 'output-format', 'field': 'outputFormat', 'kind': 'enum', 'values': ['PNG', 'JPEG', 'WEBP']}, {'id': 'quality', 'field': 'quality', 'kind': 'range', 'min': 1, 'max': 100}, {'id': 'pixel-budget', 'field': 'maxPixels', 'kind': 'range', 'min': 1, 'max': 100000000}]
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
            return {"accepted": not missing and not violations, "topic": 'image_editor', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.pillow.pillow_10.image_editor-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_10.image_editor-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_image_editor_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              operations:
              - orient
              - crop
              - enhance
              - watermark
              outputFormat: WEBP
              quality: 88
              maxPixels: 20000000
          expectedReturn:
            accepted: true
            topic: image_editor
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              outputFormat: WEBP
              quality: 88
              maxPixels: 20000000
          expectedReturn:
            accepted: false
            topic: image_editor
            missing:
            - operations
            violations:
            - operations
        - id: reports-topic-invariants
          arguments:
          - value:
              operations: []
              outputFormat: BMP
              quality: 0
              maxPixels: 200000000
          expectedReturn:
            accepted: false
            topic: image_editor
            missing: []
            violations:
            - operations
            - output-format
            - pixel-budget
            - quality
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pillow_10-image_editor-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_10-image_editor-contract-audit-mastery
    title: 종합 이미지 에디터 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_image_editor_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_image_editor_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_image_editor_result(expected, observed):
            identity = ['sourceHash', 'recipeHash']
            metrics = {'outputBytes': 100}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'image_editor', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.pillow.pillow_10.image_editor-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_10.image_editor-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_image_editor_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: ed1
              recipeHash: v1
              outputBytes: 250000
          - value:
              sourceHash: ed1
              recipeHash: v1
              outputBytes: 250050
          expectedReturn:
            passed: true
            topic: image_editor
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: ed1
              recipeHash: v1
              outputBytes: 250000
          - value:
              sourceHash: ed2
              recipeHash: v2
              outputBytes: 900000
          expectedReturn:
            passed: false
            topic: image_editor
            missing: []
            identityMismatch:
            - recipeHash
            - sourceHash
            metricDrift:
            - outputBytes
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: ed1
              recipeHash: v1
              outputBytes: 250000
          - value: {}
          expectedReturn:
            passed: false
            topic: image_editor
            missing:
            - outputBytes
            - recipeHash
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pillow_10-image_editor-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_10-image_editor-result-reconciliation-transfer
    title: 종합 이미지 에디터 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_image_editor_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_image_editor_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_image_editor_evidence(stage):
            stages = {'source': {'action': 'admit image editor source', 'evidence': 'source recipe output budget', 'risk': 'unsafe or misread image'}, 'edit': {'action': 'apply bounded image editor edit', 'evidence': 'ordered operation ledger', 'risk': 'quality or geometry loss'}, 'artifact': {'action': 'reopen image editor artifact', 'evidence': 'reopened artifact hash and render', 'risk': 'corrupt or visually wrong output'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.pillow.pillow_10.image_editor-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_10.image_editor-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_image_editor_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: admit image editor source
            evidence: source recipe output budget
            risk: unsafe or misread image
        - id: recalls-edit
          arguments:
          - value: edit
          expectedReturn:
            action: apply bounded image editor edit
            evidence: ordered operation ledger
            risk: quality or geometry loss
        - id: recalls-artifact
          arguments:
          - value: artifact
          expectedReturn:
            action: reopen image editor artifact
            evidence: reopened artifact hash and render
            risk: corrupt or visually wrong output
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};