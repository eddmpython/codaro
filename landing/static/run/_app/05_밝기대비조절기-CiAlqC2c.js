var e=`meta:
  packages:
  - numpy
  - pillow
  - scikit-learn
  id: pillow_05
  title: 밝기대비조절기
  order: 5
  category: pillow
  difficulty: ⭐⭐
  badge: 기초
  tags:
  - Pillow
  - ImageEnhance
  - Brightness
  - Contrast
  - Color
  - Sharpness
  seo:
    title: Pillow 기초 - 밝기/대비 조절기
    description: Pillow ImageEnhance의 Brightness/Contrast/Color/Sharpness 네 enhancer로 사진 톤을 정량 조절합니다.
    keywords:
    - Pillow
    - ImageEnhance
    - Brightness
    - Contrast
    - 밝기조절
    - 대비조절
intro:
  emoji: ☀️
  goal: ImageEnhance.Brightness/Contrast/Color/Sharpness 네 enhancer의 enhance(factor) 결과를 평균/표준편차 변화로 정량 비교하고, 보정 파이프라인을 만듭니다.
  description: ImageEnhance는 enhance(factor) 한 메서드로 톤을 조절합니다. factor=1.0은 원본, 작으면 약화, 크면 강화. 네 enhancer는 서로 다른 픽셀 통계에 작용합니다.
  direction: Brightness는 평균, Contrast는 표준편차, Color는 채도, Sharpness는 디테일에 각각 영향을 주는지 정량 검증.
  benefits:
  - enhance(0.0)/enhance(1.0)/enhance(2.0) 세 값으로 각 enhancer 효과의 단조성을 확인합니다.
  - Brightness factor 변화가 픽셀 평균에 직선적으로 작용하는지 봅니다.
  - Contrast factor 변화가 표준편차에 작용하는지 봅니다.
  - 네 enhancer를 체이닝한 사진 보정 함수를 만듭니다.
  diagram:
    steps:
    - label: RGB 입력 로드
      detail: china 샘플을 Image.fromarray로 RGB Image로 만듭니다.
    - label: Brightness enhance
      detail: factor 0.5/1.0/1.5로 픽셀 평균 변화 측정.
    - label: Contrast enhance
      detail: factor 0.5/1.0/1.5로 표준편차 변화 측정.
    - label: Color/Sharpness
      detail: 채도와 선명도 변화 검증.
    - label: 보정 체이닝
      detail: 네 enhancer를 함수에 묶어 입력별 같은 흐름을 적용.
    runtime:
    - label: pillow + numpy
      detail: ImageEnhance 결과를 NumPy로 변환해 평균/표준편차 계산.
    - label: 단일 RGB 원본
      detail: 첫 셀의 frame 객체가 이후 모든 셀의 공통 입력.
    - label: enhance는 새 객체
      detail: enhance 호출은 새 Image를 돌려주고 원본은 그대로 유지.
sections:
- id: step1_load
  title: 1단계. 보정 원본 만들기
  structuredPrimary: true
  subtitle: china RGB Image
  goal: china 샘플을 Pillow Image로 만들고 baseline 통계(평균, 표준편차)를 측정해 이후 enhance 결과 비교의 기준값을 정합니다.
  why: enhance의 효과는 평균과 표준편차 변화로 정량 측정할 수 있습니다. 원본의 두 값을 알아야 Brightness/Contrast factor가 의도대로 작용했는지 확인 가능합니다.
  explanation: |-
    sklearn china 사진은 풍경 사진이라 색조와 명도 분포가 다양해 enhance 효과가 잘 드러납니다.
    baseline mean과 std를 NumPy로 측정해 둡니다. 이 두 값이 이후 모든 enhance 비교의 기준입니다.
  tips:
  - "ImageEnhance는 별도 import가 필요합니다: from PIL import Image, ImageEnhance."
  - Brightness/Contrast는 채널별로 동작하므로 컬러 원본에서 전체 통계와 채널별 통계가 모두 의미 있습니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageEnhance
    from sklearn.datasets import load_sample_image

    frame = Image.fromarray(load_sample_image('china.jpg'))
    frameArr = np.asarray(frame)

    {
        'mode': frame.mode,
        'size': frame.size,
        'baseMean': round(float(frameArr.mean()), 2),
        'baseStd': round(float(frameArr.std()), 2),
    }
  exercise:
    prompt: flower 입력의 baseline 평균을 측정해 china와 비교하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image
      from sklearn.datasets import load_sample_image

      flowerFrame = Image.fromarray(load_sample_image('___'))
      flowerMean = round(float(np.asarray(flowerFrame).mean()), 2)
      {'flowerMean': flowerMean}
    hints:
    - flower 파일명을 넣습니다.
    - 빈칸에는 flower.jpg가 들어갑니다.
    check:
      noError: load_sample_image와 mean 계산이 끝나야 합니다.
      resultCheck: flowerMean이 양수여야 합니다.
  check:
    noError: load_sample_image와 통계 계산이 끝나야 합니다.
    resultCheck: mode가 'RGB', size가 (640, 427)이어야 합니다.
- id: step2_brightness
  title: 2단계. Brightness enhancer
  structuredPrimary: true
  subtitle: factor → 평균 변화
  goal: ImageEnhance.Brightness(frame).enhance(factor) 결과의 평균을 factor=0.5/1.0/1.5로 비교해 평균이 factor에 비례하는 단조성을 확인합니다.
  why: Brightness는 모든 픽셀에 같은 비율을 곱합니다. 결과 평균이 입력 평균 × factor에 가까워야 정상 동작입니다. 이 단조성을 확인해 두면 보정 파이프라인의 행동이 예측 가능해집니다.
  explanation: |-
    ImageEnhance.Brightness(image)는 enhancer 객체를 만듭니다. .enhance(factor)로 실제 적용합니다.
    factor=0.0은 완전한 검정(평균 0), factor=1.0은 원본, factor=2.0은 모든 픽셀이 2배(255 cap 적용).
    검증은 결과 평균과 baseMean × factor를 비교합니다. 255 cap 때문에 정확한 비례는 아니지만 근사값입니다.
  tips:
  - 너무 큰 factor는 픽셀이 255에서 잘려 손실이 생깁니다. 사진 보정은 1.0~1.5 범위가 안전합니다.
  - Brightness enhancer 객체는 한 번 만들고 여러 factor에 재사용할 수 있어 효율적입니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageEnhance
    from sklearn.datasets import load_sample_image

    brightFrame = Image.fromarray(load_sample_image('china.jpg'))
    brightener = ImageEnhance.Brightness(brightFrame)
    baseMean = float(np.asarray(brightFrame).mean())

    dim = brightener.enhance(0.5)
    bright = brightener.enhance(1.5)

    {
        'baseMean': round(baseMean, 2),
        'dimMean': round(float(np.asarray(dim).mean()), 2),
        'brightMean': round(float(np.asarray(bright).mean()), 2),
        'dimIsDarker': float(np.asarray(dim).mean()) < baseMean,
        'brightIsBrighter': float(np.asarray(bright).mean()) > baseMean,
    }
  exercise:
    prompt: factor=0.0을 적용해 결과 평균이 0에 가까운지 확인하세요. 모든 픽셀이 0이 되어야 합니다.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageEnhance
      from sklearn.datasets import load_sample_image

      blackBrightener = ImageEnhance.Brightness(Image.fromarray(load_sample_image('china.jpg')))
      blackResult = blackBrightener.enhance(___)
      {'blackMean': round(float(np.asarray(blackResult).mean()), 2)}
    hints:
    - factor 0.0은 완전한 검정.
    - 빈칸에는 0.0이 들어갑니다.
    check:
      noError: enhance 호출이 끝나야 합니다.
      resultCheck: blackMean이 0이어야 합니다.
  check:
    noError: enhance 두 호출이 끝나야 합니다.
    resultCheck: dimIsDarker와 brightIsBrighter 모두 True여야 합니다.
- id: step3_contrast
  title: 3단계. Contrast enhancer
  structuredPrimary: true
  subtitle: factor → 표준편차 변화
  goal: ImageEnhance.Contrast(frame).enhance(factor)의 표준편차가 factor=0.5/1.0/1.5에서 단조 증가하는지 확인합니다.
  why: Contrast는 평균값 주변으로 픽셀을 더 멀리(고대비) 또는 가까이(저대비) 옮깁니다. 결과 표준편차가 factor에 비례합니다. 평균은 거의 그대로 유지됩니다.
  explanation: |-
    Contrast.enhance(factor)는 픽셀 값을 평균 주변으로 (값 - 평균) × factor + 평균 형태로 재배치합니다.
    factor=0.0은 모든 픽셀이 평균 값(완전한 회색). factor=1.0은 원본. factor>1.0은 대비 강화.
    검증은 표준편차가 factor에 비례하는지로 합니다. 평균은 변화가 적습니다. 이 두 가지가 Brightness와 정반대 동작입니다.
  tips:
  - Contrast factor 0.0은 완전한 회색입니다. factor 2.0은 대비를 두 배로 강화합니다.
  - 사진 보정은 1.1~1.3 정도가 자연스럽습니다. 1.5 이상은 노이즈가 보입니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageEnhance
    from sklearn.datasets import load_sample_image

    contrastFrame = Image.fromarray(load_sample_image('china.jpg'))
    contraster = ImageEnhance.Contrast(contrastFrame)
    baseStd = float(np.asarray(contrastFrame).std())
    baseMean = float(np.asarray(contrastFrame).mean())

    soft = contraster.enhance(0.5)
    sharp = contraster.enhance(1.5)

    {
        'baseStd': round(baseStd, 2),
        'softStd': round(float(np.asarray(soft).std()), 2),
        'sharpStd': round(float(np.asarray(sharp).std()), 2),
        'baseMean': round(baseMean, 2),
        'sharpMean': round(float(np.asarray(sharp).mean()), 2),
        'monotonicStd': float(np.asarray(soft).std()) < baseStd < float(np.asarray(sharp).std()),
        'meanMostlyPreserved': abs(float(np.asarray(sharp).mean()) - baseMean) < 10,
    }
  exercise:
    prompt: Contrast factor=0.0이 완전한 회색을 만드는지(표준편차 ≈ 0) 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageEnhance
      from sklearn.datasets import load_sample_image

      grayContraster = ImageEnhance.Contrast(Image.fromarray(load_sample_image('china.jpg')))
      grayResult = grayContraster.enhance(___)
      {'grayStd': round(float(np.asarray(grayResult).std()), 2), 'isZero': float(np.asarray(grayResult).std()) < 0.5}
    hints:
    - factor 0.0은 완전한 회색.
    - 빈칸에는 0.0이 들어갑니다.
    check:
      noError: enhance 호출이 끝나야 합니다.
      resultCheck: isZero가 True여야 합니다.
  check:
    noError: enhance 두 호출이 끝나야 합니다.
    resultCheck: monotonicStd가 True이고 meanMostlyPreserved가 True여야 합니다.
- id: step4_color
  title: 4단계. Color enhancer (채도)
  structuredPrimary: true
  subtitle: 0.0 → 흑백, 1.5 → 진한 색
  goal: ImageEnhance.Color.enhance(0.0)이 흑백에 가까워지고, enhance(1.5)가 채도가 진해지는지 확인합니다.
  why: 채도는 색이 얼마나 강한지의 지표입니다. 채도가 0이면 그레이스케일과 같고, 키우면 색이 더 선명해집니다. 흑백 변환의 대안으로 자주 쓰입니다.
  explanation: |-
    Color.enhance(0.0)은 RGB의 각 채널을 그레이스케일 값으로 통일합니다. 결과는 무채색 RGB(R=G=B).
    Color.enhance(1.0)은 원본 채도 유지. Color.enhance(1.5)는 색을 더 진하게.
    검증은 enhance(0.0) 결과의 R/G/B 채널이 거의 같은지로 합니다. 채널별 평균 차이가 작을수록 무채색에 가깝습니다.
  tips:
  - Color.enhance(0.0)과 convert('L').convert('RGB')는 비슷한 결과를 줍니다. 표현 방식이 다를 뿐입니다.
  - SNS 필터의 "비비드" 모드는 보통 Color.enhance(1.3~1.5)에 가깝습니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageEnhance
    from sklearn.datasets import load_sample_image

    colorFrame = Image.fromarray(load_sample_image('china.jpg'))
    saturator = ImageEnhance.Color(colorFrame)

    grayResult = saturator.enhance(0.0)
    vividResult = saturator.enhance(1.5)

    grayArr = np.asarray(grayResult)
    vividArr = np.asarray(vividResult)
    baseArr = np.asarray(colorFrame)

    {
        'baseChannelMeans': [round(float(baseArr[..., c].mean()), 2) for c in range(3)],
        'grayChannelMeans': [round(float(grayArr[..., c].mean()), 2) for c in range(3)],
        'vividChannelMeans': [round(float(vividArr[..., c].mean()), 2) for c in range(3)],
        'grayChannelsClose': max(abs(float(grayArr[..., c].mean()) - float(grayArr[..., 0].mean())) for c in range(3)) < 0.5,
    }
  exercise:
    prompt: Color.enhance(1.0)이 원본과 동일한 채널 평균을 갖는지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageEnhance
      from sklearn.datasets import load_sample_image

      identitySat = ImageEnhance.Color(Image.fromarray(load_sample_image('china.jpg')))
      identityResult = identitySat.enhance(___)
      baseArr = np.asarray(Image.fromarray(load_sample_image('china.jpg')))
      identArr = np.asarray(identityResult)
      diff = max(abs(float(baseArr[..., c].mean()) - float(identArr[..., c].mean())) for c in range(3))
      {'maxDiff': round(diff, 2), 'isIdentity': diff < 0.5}
    hints:
    - factor 1.0은 원본 유지.
    - 빈칸에는 1.0이 들어갑니다.
    check:
      noError: enhance 호출이 끝나야 합니다.
      resultCheck: isIdentity가 True여야 합니다.
  check:
    noError: enhance 두 호출이 끝나야 합니다.
    resultCheck: grayChannelsClose가 True여야 합니다.
- id: step5_sharpness
  title: 5단계. Sharpness enhancer
  structuredPrimary: true
  subtitle: 0.0 → 블러, 2.0 → 샤프
  goal: ImageEnhance.Sharpness.enhance(0.0)은 블러 효과를, enhance(2.0)은 샤프 효과를 만들어 결과 표준편차의 단조 증가를 확인합니다.
  why: Sharpness enhancer는 0~2 사이 factor로 블러~샤프를 한 메서드로 다룰 수 있습니다. ImageFilter.SHARPEN보다 강도 조절이 정교합니다.
  explanation: |-
    Sharpness.enhance(0.0)은 약한 블러 효과를 줍니다(완전한 블러는 아님).
    Sharpness.enhance(1.0)은 원본 유지.
    Sharpness.enhance(2.0)은 강한 샤픈.
    검증은 표준편차가 factor에 단조 증가하는지로 합니다. 블러는 std를 줄이고, 샤픈은 std를 키웁니다.
  tips:
  - Sharpness는 ImageFilter.SHARPEN보다 부드러운 효과를 줍니다. 인물 사진 보정에 적합합니다.
  - factor 0~1은 블러, 1~2는 샤픈입니다. 0과 2가 극단입니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageEnhance
    from sklearn.datasets import load_sample_image

    sharpFrame = Image.fromarray(load_sample_image('china.jpg'))
    sharpener = ImageEnhance.Sharpness(sharpFrame)
    baseStd = float(np.asarray(sharpFrame).std())

    soft = sharpener.enhance(0.0)
    crisp = sharpener.enhance(2.0)

    {
        'baseStd': round(baseStd, 2),
        'softStd': round(float(np.asarray(soft).std()), 2),
        'crispStd': round(float(np.asarray(crisp).std()), 2),
        'softIsBlurrier': float(np.asarray(soft).std()) <= baseStd,
        'crispIsSharper': float(np.asarray(crisp).std()) >= baseStd,
    }
  exercise:
    prompt: Sharpness.enhance(1.0)이 원본과 동일한 표준편차를 갖는지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageEnhance
      from sklearn.datasets import load_sample_image

      identityFrame = Image.fromarray(load_sample_image('china.jpg'))
      baseStd = float(np.asarray(identityFrame).std())
      identityResult = ImageEnhance.Sharpness(identityFrame).enhance(___)
      identityStd = float(np.asarray(identityResult).std())
      {'baseStd': round(baseStd, 2), 'identityStd': round(identityStd, 2), 'isIdentity': abs(baseStd - identityStd) < 0.5}
    hints:
    - factor 1.0은 원본 유지.
    - 빈칸에는 1.0이 들어갑니다.
    check:
      noError: enhance 호출이 끝나야 합니다.
      resultCheck: isIdentity가 True여야 합니다.
  check:
    noError: enhance 두 호출이 끝나야 합니다.
    resultCheck: softIsBlurrier와 crispIsSharper 모두 True여야 합니다.
- id: step6_combine
  title: 6단계. 보정 체이닝
  structuredPrimary: true
  subtitle: Brightness → Contrast → Color → Sharpness
  goal: 네 enhancer를 순서대로 chaining해 각 단계의 평균/표준편차 변화를 dict로 정리합니다.
  why: 사진 보정의 일반 순서는 밝기 → 대비 → 채도 → 선명도입니다. 한 셀에서 단계별 통계 변화를 확인하면 어느 단계가 어떤 효과를 주는지 명확합니다.
  explanation: |-
    각 enhancer 결과를 다음 enhancer의 입력으로 넘기는 chaining 패턴입니다. enhance는 새 객체를 돌려주므로 안전합니다.
    단계별 dict를 보면 Brightness(1.2)에서 평균이 늘고, Contrast(1.3)에서 std가 늘고, Color(1.1)에서 채도가 진해지는 흐름이 드러납니다.
    실무에서는 이 흐름을 한 함수로 묶어 두는 게 표준입니다. enhanceTone(image) 같은 형식.
  tips:
  - 너무 많은 보정을 누적하면 부자연스러워집니다. 각 단계 factor를 1.1~1.3 범위로 두는 게 안전합니다.
  - 보정 순서를 바꾸면 결과가 다릅니다. Brightness 다음 Contrast가 일반적이지만 입력에 따라 달라집니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageEnhance
    from sklearn.datasets import load_sample_image


    def stage(image, label):
        arr = np.asarray(image)
        return {'label': label, 'mean': round(float(arr.mean()), 2), 'std': round(float(arr.std()), 2)}


    chainFrame = Image.fromarray(load_sample_image('china.jpg'))
    s1 = ImageEnhance.Brightness(chainFrame).enhance(1.2)
    s2 = ImageEnhance.Contrast(s1).enhance(1.3)
    s3 = ImageEnhance.Color(s2).enhance(1.1)
    s4 = ImageEnhance.Sharpness(s3).enhance(1.2)

    [stage(chainFrame, 'base'), stage(s1, 'brightness'), stage(s2, 'contrast'), stage(s3, 'color'), stage(s4, 'sharpness')]
  exercise:
    prompt: Brightness factor를 0.8로 더 어둡게 시작해 첫 단계의 평균이 baseline보다 작아지는지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageEnhance
      from sklearn.datasets import load_sample_image

      darkFrame = Image.fromarray(load_sample_image('china.jpg'))
      baseMean = float(np.asarray(darkFrame).mean())
      darkBrightness = ImageEnhance.Brightness(darkFrame).enhance(___)
      darkMean = float(np.asarray(darkBrightness).mean())
      {'baseMean': round(baseMean, 2), 'darkMean': round(darkMean, 2), 'isDarker': darkMean < baseMean}
    hints:
    - factor 0.8을 넣습니다.
    - 빈칸에는 0.8이 들어갑니다.
    check:
      noError: enhance 호출이 끝나야 합니다.
      resultCheck: isDarker가 True여야 합니다.
  check:
    noError: 네 enhance 호출이 끝나야 합니다.
    resultCheck: 결과 리스트 길이가 5여야 합니다.
- id: practice
  title: 실습 - enhanceTone 함수
  structuredPrimary: true
  subtitle: 입력별 동일 보정
  goal: enhanceTone(image, factors=dict) 함수가 네 enhancer를 사용자 지정 factor로 적용하고 결과를 보고합니다.
  why: 보정 함수를 한 인터페이스로 묶어 두면 새 입력을 받아도 같은 형식의 결과가 나옵니다. 자동화의 표준 보정 도구가 됩니다.
  explanation: |-
    enhanceTone은 image와 factors dict를 받아 네 enhancer를 차례로 적용합니다. dict 키는 'brightness', 'contrast', 'color', 'sharpness' 네 가지.
    함수는 결과 Image와 단계별 통계를 함께 돌려줘 운영에서 어떤 보정이 적용됐는지 추적 가능합니다.
    flower와 china 입력에 같은 factors를 적용하면 같은 형식의 결과가 두 개 나옵니다. 단위 테스트와 CSV 출력 모두에 활용됩니다.
  tips:
  - factors 기본값을 약한 보정(brightness 1.1, contrast 1.2, color 1.1, sharpness 1.1)으로 두면 자연스럽습니다.
  - 함수가 결과 Image 자체를 돌려주지 않고 통계만 보고하면 자동화 코드에서 후속 처리가 가능해집니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageEnhance
    from sklearn.datasets import load_sample_image


    def enhanceTone(image: Image.Image, factors: dict) -> dict:
        bright = ImageEnhance.Brightness(image).enhance(factors['brightness'])
        contrast = ImageEnhance.Contrast(bright).enhance(factors['contrast'])
        color = ImageEnhance.Color(contrast).enhance(factors['color'])
        sharp = ImageEnhance.Sharpness(color).enhance(factors['sharpness'])
        baseArr = np.asarray(image)
        finalArr = np.asarray(sharp)
        return {
            'baseMean': round(float(baseArr.mean()), 2),
            'finalMean': round(float(finalArr.mean()), 2),
            'baseStd': round(float(baseArr.std()), 2),
            'finalStd': round(float(finalArr.std()), 2),
        }


    factors = {'brightness': 1.1, 'contrast': 1.2, 'color': 1.1, 'sharpness': 1.1}
    [
        enhanceTone(Image.fromarray(load_sample_image('flower.jpg')), factors),
        enhanceTone(Image.fromarray(load_sample_image('china.jpg')), factors),
    ]
  exercise:
    prompt: factors의 brightness를 0.8로 바꿔 어둡게 만든 결과의 finalMean이 baseMean보다 작은지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageEnhance
      from sklearn.datasets import load_sample_image


      def enhanceTone(image, factors):
          bright = ImageEnhance.Brightness(image).enhance(factors['brightness'])
          finalArr = np.asarray(bright)
          baseArr = np.asarray(image)
          return {'baseMean': round(float(baseArr.mean()), 2), 'finalMean': round(float(finalArr.mean()), 2)}


      result = enhanceTone(Image.fromarray(load_sample_image('china.jpg')), {'brightness': ___})
      {'result': result, 'isDarker': result['finalMean'] < result['baseMean']}
    hints:
    - factor 0.8을 넣습니다.
    - 빈칸에는 0.8이 들어갑니다.
    check:
      noError: enhanceTone 정의와 호출이 끝나야 합니다.
      resultCheck: isDarker가 True여야 합니다.
  check:
    noError: enhanceTone 정의와 두 호출이 끝나야 합니다.
    resultCheck: 두 결과 모두 baseMean, finalMean, baseStd, finalStd 네 키를 가져야 합니다.
- id: workflow_validation
  title: 7단계. enhance factor 가드 + 효과 회귀 테스트
  structuredPrimary: true
  subtitle: validateEnhanceFactor + 단조성
  goal: validateEnhanceFactor 함수가 음수/0 factor를 ValueError로 차단하고, Brightness factor 1.5가 baseline보다 평균을 명확히 키우는지 회귀 테스트로 확인합니다.
  why: enhance factor는 양수여야 의미가 있습니다. 0이나 음수는 함수 입구에서 차단하면 의도치 않은 결과를 막을 수 있습니다. 단조성 회귀 테스트는 알고리즘 변경 후 즉시 돌릴 수 있는 1줄 검증입니다.
  explanation: |-
    validateEnhanceFactor는 factor > 0 한 조건만 검사합니다. Brightness(0.0)은 의도된 완전 검정 출력이지만, factor < 0이나 None 같은 명시적 오류는 차단합니다.
    회귀 테스트는 Brightness(1.5)의 결과 평균이 baseline보다 명확히 큰지로 합니다. 이 부등식이 깨지면 알고리즘에 버그가 있다는 신호입니다.
  tips:
  - 함수 입구의 가드는 운영 사고를 막는 가장 저렴한 패턴입니다.
  - 단조성 검증은 회귀 테스트로 활용 가능합니다. 알고리즘 변경 후 즉시 결과를 확인할 수 있습니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageEnhance, ImageDraw


    def validateEnhanceFactor(factor: float) -> bool:
        if factor <= 0:
            raise ValueError(f"보정 factor는 양수여야 합니다: {factor}")
        return True


    toneImage = Image.new('RGB', (150, 100), (70, 80, 95))
    toneDraw = ImageDraw.Draw(toneImage)
    toneDraw.rectangle((35, 25, 115, 75), fill=(150, 120, 80))
    baseMean = float(np.asarray(toneImage).mean())

    validateEnhanceFactor(1.2)
    bright = ImageEnhance.Brightness(toneImage).enhance(1.5)

    try:
        validateEnhanceFactor(-1)
        negMessage = 'unexpected pass'
    except ValueError as exc:
        negMessage = str(exc)

    {
        'baseMean': round(baseMean, 2),
        'brightMean': round(float(np.asarray(bright).mean()), 2),
        'brightnessIncreased': float(np.asarray(bright).mean()) > baseMean,
        'negMessage': negMessage,
    }
  exercise:
    prompt: validateEnhanceFactor(0.0)을 호출하면 ValueError가 잡히는지 확인하세요. 0은 양수가 아니므로 차단되어야 합니다.
    starterCode: |-
      def validateEnhanceFactor(factor):
          if factor <= 0:
              raise ValueError(f"보정 factor는 양수여야 합니다: {factor}")
          return True


      try:
          validateEnhanceFactor(___)
          zeroMessage = 'unexpected pass'
      except ValueError as exc:
          zeroMessage = str(exc)

      {'zeroMessage': zeroMessage, 'hasZeroHint': '0' in zeroMessage}
    hints:
    - 0.0을 인자에 넣습니다.
    - 빈칸에는 0.0이 들어갑니다.
    check:
      noError: validateEnhanceFactor 정의가 끝나야 합니다.
      resultCheck: hasZeroHint가 True여야 합니다.
  check:
    noError: validateEnhanceFactor와 enhance 호출이 끝나야 합니다.
    resultCheck: brightnessIncreased가 True이고 negMessage에 '양수' 단서가 포함되어야 합니다.
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
  - id: pillow_05-brightness_contrast-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - workflow_validation
    title: 밝기·대비 조절기 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: brightness·contrast factor와 clip 정책을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_brightness_contrast_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_brightness_contrast_contract(value):
            raise NotImplementedError
      solution: |
        def audit_brightness_contrast_contract(value):
            required = ['brightness', 'contrast', 'clipMode']
            rules = [{'id': 'brightness', 'field': 'brightness', 'kind': 'range', 'min': 0, 'max': 3}, {'id': 'contrast', 'field': 'contrast', 'kind': 'range', 'min': 0, 'max': 3}, {'id': 'clip-mode', 'field': 'clipMode', 'kind': 'enum', 'values': ['saturate']}]
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
            return {"accepted": not missing and not violations, "topic": 'brightness_contrast', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.pillow.pillow_05.brightness_contrast-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_05.brightness_contrast-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_brightness_contrast_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              brightness: 1.1
              contrast: 1.2
              clipMode: saturate
          expectedReturn:
            accepted: true
            topic: brightness_contrast
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              contrast: 1.2
              clipMode: saturate
          expectedReturn:
            accepted: false
            topic: brightness_contrast
            missing:
            - brightness
            violations:
            - brightness
        - id: reports-topic-invariants
          arguments:
          - value:
              brightness: -1
              contrast: 5
              clipMode: wrap
          expectedReturn:
            accepted: false
            topic: brightness_contrast
            missing: []
            violations:
            - brightness
            - clip-mode
            - contrast
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pillow_05-brightness_contrast-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_05-brightness_contrast-contract-audit-mastery
    title: 밝기·대비 조절기 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_brightness_contrast_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_brightness_contrast_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_brightness_contrast_result(expected, observed):
            identity = ['sourceHash', 'recipeHash']
            metrics = {'clippedRatio': 0.01}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'brightness_contrast', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.pillow.pillow_05.brightness_contrast-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_05.brightness_contrast-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_brightness_contrast_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: bc1
              recipeHash: b11-c12
              clippedRatio: 0.04
          - value:
              sourceHash: bc1
              recipeHash: b11-c12
              clippedRatio: 0.045
          expectedReturn:
            passed: true
            topic: brightness_contrast
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: bc1
              recipeHash: b11-c12
              clippedRatio: 0.04
          - value:
              sourceHash: bc2
              recipeHash: bad
              clippedRatio: 0.4
          expectedReturn:
            passed: false
            topic: brightness_contrast
            missing: []
            identityMismatch:
            - recipeHash
            - sourceHash
            metricDrift:
            - clippedRatio
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: bc1
              recipeHash: b11-c12
              clippedRatio: 0.04
          - value: {}
          expectedReturn:
            passed: false
            topic: brightness_contrast
            missing:
            - clippedRatio
            - recipeHash
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pillow_05-brightness_contrast-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_05-brightness_contrast-result-reconciliation-transfer
    title: 밝기·대비 조절기 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_brightness_contrast_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_brightness_contrast_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_brightness_contrast_evidence(stage):
            stages = {'source': {'action': 'admit brightness contrast source', 'evidence': 'factors and clip policy', 'risk': 'unsafe or misread image'}, 'edit': {'action': 'apply bounded brightness contrast edit', 'evidence': 'enhancement trace', 'risk': 'quality or geometry loss'}, 'artifact': {'action': 'reopen brightness contrast artifact', 'evidence': 'histogram and clipped ratio', 'risk': 'corrupt or visually wrong output'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.pillow.pillow_05.brightness_contrast-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_05.brightness_contrast-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_brightness_contrast_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: admit brightness contrast source
            evidence: factors and clip policy
            risk: unsafe or misread image
        - id: recalls-edit
          arguments:
          - value: edit
          expectedReturn:
            action: apply bounded brightness contrast edit
            evidence: enhancement trace
            risk: quality or geometry loss
        - id: recalls-artifact
          arguments:
          - value: artifact
          expectedReturn:
            action: reopen brightness contrast artifact
            evidence: histogram and clipped ratio
            risk: corrupt or visually wrong output
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};