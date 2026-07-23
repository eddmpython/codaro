var e=`meta:
  packages:
  - numpy
  - pillow
  - scikit-learn
  id: pillow_03
  title: 흑백사진변환기
  order: 3
  category: pillow
  difficulty: ⭐⭐
  badge: 기초
  tags:
  - Pillow
  - convert
  - grayscale
  - sepia
  - pixel
  seo:
    title: Pillow 기초 - 흑백 사진 변환기
    description: Pillow convert로 RGB→L 변환, point로 이진화, split/merge로 세피아 톤을 만드는 색 처리 흐름을 정량 검증합니다.
    keywords:
    - Pillow
    - convert
    - grayscale
    - 흑백
    - 세피아
    - 픽셀
intro:
  emoji: 🎞️
  goal: Pillow의 convert('L')로 RGB를 흑백으로, point로 이진화, split/merge로 세피아 톤을 만드는 색 변환 흐름을 dict 통계로 정량 검증합니다.
  description: 색 모드 변환은 Pillow에서 가장 자주 쓰는 작업입니다. 'RGB'/'L'/'1' 모드 차이와 채널 합성/분해 흐름을 한 강의에서 정리합니다.
  direction: convert('L') → point(이진화) → split/merge로 세피아 → mode/픽셀 통계 비교 흐름.
  benefits:
  - convert('L')이 BT.601 가중치로 RGB를 단채널로 줄이는 흐름을 손으로 확인합니다.
  - point(lambda)로 픽셀 단위 변환을 적용하고 이진화 결과가 0과 255만 갖는지 검증합니다.
  - split/merge로 R/G/B를 분리해 세피아 톤을 만드는 채널 산술을 직접 짭니다.
  - validateRgbSource로 입력 mode 가드 패턴을 잡습니다.
  diagram:
    steps:
    - label: RGB 입력 로드
      detail: load_sample_image flower를 Image.fromarray로 RGB Image로 만듭니다.
    - label: convert('L') 흑백
      detail: 단채널 'L' 모드로 줄여서 픽셀 평균과 비교.
    - label: point 이진화
      detail: lambda로 임계값 분기를 적용해 결과가 0/255만 갖는지 검증.
    - label: split/merge 세피아
      detail: R/G/B 채널에 다른 계수를 곱해 세피아 톤을 합성.
    - label: 모드 dict 비교
      detail: 네 변환 결과의 mode와 픽셀 통계를 한 dict로 정리.
    runtime:
    - label: pillow + numpy
      detail: split/merge 결과를 NumPy로 변환해 통계 비교에 활용합니다.
    - label: 한 RGB 원본
      detail: 첫 셀의 pic 객체가 이후 모든 셀의 공통 입력입니다.
    - label: convert는 새 객체
      detail: convert 호출은 새 Image를 돌려주고 원본 mode를 변경하지 않습니다.
sections:
- id: step1_load
  title: 1단계. flower RGB 로드
  structuredPrimary: true
  subtitle: 색 변환 원본 만들기
  goal: flower 샘플을 Image.fromarray로 RGB Image로 만들고 mode가 'RGB', size가 (640, 427)임을 확인합니다.
  why: 이후 모든 색 변환 셀이 pic 한 객체를 공통 입력으로 씁니다. 첫 셀에서 mode와 size를 명확히 잡아 두면 다음 셀들의 가정이 분명해집니다.
  explanation: |-
    sklearn load_sample_image('flower.jpg')는 (427, 640, 3) RGB ndarray를 돌려줍니다. Image.fromarray로 Pillow Image로 감싸면 mode='RGB', size=(640, 427)이 됩니다.
    이 객체가 모든 후속 변환의 입력입니다. .convert('L')은 새 객체를 돌려주고 원본은 'RGB' 그대로 유지됩니다.
  tips:
  - Image.fromarray는 ndarray의 dtype을 보고 mode를 자동 결정합니다. uint8 3채널이면 'RGB'.
  - "Pillow의 mode 문자열: 'RGB', 'L'(흑백), 'RGBA'(알파 포함), '1'(1-bit 흑백), 'I'(int 라벨)."
  snippet: |-
    from PIL import Image
    from sklearn.datasets import load_sample_image

    pic = Image.fromarray(load_sample_image('flower.jpg'))

    {
        'mode': pic.mode,
        'size': pic.size,
        'isRgb': pic.mode == 'RGB',
        'pixelCount': pic.size[0] * pic.size[1],
    }
  exercise:
    prompt: china 샘플로 같은 흐름을 만들어 mode가 'RGB'고 size가 (640, 427)인지 확인하세요.
    starterCode: |-
      from PIL import Image
      from sklearn.datasets import load_sample_image

      chinaPic = Image.fromarray(load_sample_image('___'))
      {'mode': chinaPic.mode, 'size': chinaPic.size, 'matches': chinaPic.size == (640, 427)}
    hints:
    - china 파일명은 'china.jpg'입니다.
    - 빈칸에는 china.jpg가 들어갑니다.
    check:
      noError: Image.fromarray가 끝나야 합니다.
      resultCheck: matches가 True여야 합니다.
  check:
    noError: load_sample_image와 Image.fromarray가 끝나야 합니다.
    resultCheck: mode가 'RGB', size가 (640, 427), pixelCount가 273280이어야 합니다.
- id: step2_grayscale
  title: 2단계. convert('L')로 흑백
  structuredPrimary: true
  subtitle: 3채널 → 1채널
  goal: pic.convert('L')로 단채널 그레이스케일을 만들고 결과의 mode가 'L'이며 픽셀 평균이 원본 채널 평균과 비슷한지 확인합니다.
  why: 흑백 변환은 픽셀 수가 1/3로 줄어 다음 단계 처리가 빨라집니다. convert('L')의 가중치 평균 결과가 단순 채널 평균과 다른 이유를 한 번 봐 두면 색 변환 감각이 잡힙니다.
  explanation: |-
    Image.convert('L')은 BT.601 표준 가중치 Y = 0.299·R + 0.587·G + 0.114·B로 단채널 밝기를 계산합니다. 결과 mode는 'L', 값 범위는 0~255입니다.
    채널별 단순 평균 (R+G+B)/3과 미묘하게 다릅니다. 녹색 영역이 많은 사진은 가중치 평균이 단순 평균보다 약간 큰 값을 줍니다.
    검증은 결과 픽셀 평균과 원본 ndarray의 채널별 평균을 비교합니다.
  tips:
  - convert('L')은 read-only로 동작합니다. 원본은 'RGB' 그대로 남습니다.
  - 더 빠른 단순 평균이 필요하면 np.asarray(rgb).mean(axis=2).astype(np.uint8)로 ndarray에서 직접 계산할 수 있습니다.
  snippet: |-
    import numpy as np
    from PIL import Image
    from sklearn.datasets import load_sample_image

    grayPic = Image.fromarray(load_sample_image('flower.jpg'))
    gray = grayPic.convert('L')

    rgbArr = np.asarray(grayPic)
    grayArr = np.asarray(gray)

    {
        'grayMode': gray.mode,
        'graySize': gray.size,
        'grayMean': round(float(grayArr.mean()), 1),
        'rgbChannelMean': [round(float(rgbArr[..., c].mean()), 1) for c in range(3)],
        'sizeUnchanged': gray.size == grayPic.size,
    }
  exercise:
    prompt: 단순 채널 평균으로 grayscale을 만들고 convert('L') 결과 평균과 비교해 차이가 약 1~3 범위인지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image
      from sklearn.datasets import load_sample_image

      compareRgb = Image.fromarray(load_sample_image('flower.jpg'))
      cvMean = float(np.asarray(compareRgb.convert('L')).mean())
      simpleMean = float(np.asarray(compareRgb).mean(axis=___).mean())
      {'cvMean': round(cvMean, 1), 'simpleMean': round(simpleMean, 1), 'diff': round(abs(cvMean - simpleMean), 1)}
    hints:
    - 채널 축은 마지막 축인 2입니다.
    - 빈칸에는 2가 들어갑니다.
    check:
      noError: convert와 평균 계산이 끝나야 합니다.
      resultCheck: diff가 10 이하여야 합니다.
  check:
    noError: convert와 통계 계산이 끝나야 합니다.
    resultCheck: grayMode가 'L', sizeUnchanged가 True여야 합니다.
- id: step3_threshold
  title: 3단계. point()로 이진화
  structuredPrimary: true
  subtitle: lambda 픽셀 변환
  goal: gray.point에 lambda를 넘겨 임계값 128 이진화를 만들고 결과 ndarray가 0과 255 두 값만 갖는지 검증합니다.
  why: point는 각 픽셀에 함수를 적용하는 유틸리티입니다. 람다 한 줄로 이진화, 감마, 반전 같은 변환을 표현할 수 있어 매우 유용합니다.
  explanation: |-
    Image.point(lambda x: ...)는 모든 픽셀 값에 함수를 적용합니다. 'L' 모드에서는 0~255 정수 → 0~255 정수 변환입니다.
    이진화 람다는 임계값보다 크면 255, 그렇지 않으면 0을 돌려줍니다. 결과는 두 값만 가지는 흑백 이미지입니다.
    검증은 np.unique(arr)로 결과의 고유 값을 확인합니다. 정확히 {0, 255}여야 이진화가 의도대로 동작한 것입니다. 임계값에 따라 객체/배경 비율이 달라지는 것도 함께 봅니다.
  tips:
  - point는 RGB 입력에는 채널별로 적용됩니다. 채널별로 다른 함수를 쓰려면 split 후 처리해야 합니다.
  - 더 빠른 이진화는 np.where(arr > threshold, 255, 0).astype(np.uint8)로 NumPy에서 직접 처리합니다.
  snippet: |-
    import numpy as np
    from PIL import Image
    from sklearn.datasets import load_sample_image

    threshPic = Image.fromarray(load_sample_image('flower.jpg')).convert('L')
    threshold128 = threshPic.point(lambda x: 255 if x > 128 else 0)
    threshold200 = threshPic.point(lambda x: 255 if x > 200 else 0)

    {
        'mode': threshold128.mode,
        'uniqueValues128': sorted(np.unique(np.asarray(threshold128)).tolist()),
        'whiteRatio128': round(float((np.asarray(threshold128) == 255).mean()), 3),
        'whiteRatio200': round(float((np.asarray(threshold200) == 255).mean()), 3),
        'tighterIsFewerWhite': float((np.asarray(threshold200) == 255).mean()) < float((np.asarray(threshold128) == 255).mean()),
    }
  exercise:
    prompt: 임계값 64 이진화를 만들어 흰색 비율이 128 임계값보다 더 큰지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image
      from sklearn.datasets import load_sample_image

      lowThreshPic = Image.fromarray(load_sample_image('flower.jpg')).convert('L')
      threshold64 = lowThreshPic.point(lambda x: 255 if x > ___ else 0)
      whiteRatio64 = round(float((np.asarray(threshold64) == 255).mean()), 3)
      {'whiteRatio64': whiteRatio64, 'aboveHalf': whiteRatio64 > 0.5}
    hints:
    - 더 낮은 임계값은 64입니다.
    - 빈칸에는 64가 들어갑니다.
    check:
      noError: point 호출이 끝나야 합니다.
      resultCheck: whiteRatio64가 양수이고 0~1 사이여야 합니다.
  check:
    noError: convert와 point 두 호출이 끝나야 합니다.
    resultCheck: uniqueValues128이 [0, 255]이고 tighterIsFewerWhite가 True여야 합니다.
- id: step4_sepia
  title: 4단계. 세피아 톤 (split/merge)
  structuredPrimary: true
  subtitle: 채널 산술 합성
  goal: 그레이스케일을 RGB로 다시 만든 뒤 R/G/B 채널에 다른 계수를 적용해 세피아 톤(R 큰, B 작은)을 만들고 채널 평균을 비교합니다.
  why: 세피아는 흑백을 색이 있는 톤으로 변환하는 표준 효과입니다. split/merge 흐름을 손으로 짜면 채널 분리와 합성의 흐름이 명확해집니다.
  explanation: |-
    .convert('RGB')로 'L' 이미지를 다시 RGB로 만들면 R=G=B인 무채색 RGB가 됩니다. 여기에 채널별로 다른 가중치를 곱하면 색조가 생깁니다.
    세피아 표준 공식 중 하나는 R'=min(255, R*1.07), G'=min(255, G*0.95), B'=min(255, B*0.6)입니다. R은 살짝 키우고 B는 크게 줄이면 따뜻한 갈색 톤이 됩니다.
    검증은 결과 ndarray의 채널별 평균을 비교합니다. R > G > B 순서가 되어야 세피아 톤이 만들어진 것입니다.
  tips:
  - Image.point는 각 채널에 같은 함수를 적용하므로 채널별 다른 가중치는 split → 채널별 point → merge 패턴이 필요합니다.
  - ImageOps.colorize 같은 헬퍼도 있지만 손으로 짜 보면 채널 산술이 머리에 잡힙니다.
  snippet: |-
    import numpy as np
    from PIL import Image
    from sklearn.datasets import load_sample_image

    sepiaPic = Image.fromarray(load_sample_image('flower.jpg'))
    sepiaGray = sepiaPic.convert('L').convert('RGB')

    rCh, gCh, bCh = sepiaGray.split()
    rTone = rCh.point(lambda x: min(255, int(x * 1.07)))
    gTone = gCh.point(lambda x: min(255, int(x * 0.95)))
    bTone = bCh.point(lambda x: min(255, int(x * 0.6)))
    sepia = Image.merge('RGB', (rTone, gTone, bTone))

    sepiaArr = np.asarray(sepia)
    {
        'mode': sepia.mode,
        'size': sepia.size,
        'channelMeans': [round(float(sepiaArr[..., c].mean()), 1) for c in range(3)],
        'rIsLargest': float(sepiaArr[..., 0].mean()) > float(sepiaArr[..., 1].mean()) > float(sepiaArr[..., 2].mean()),
    }
  exercise:
    prompt: B 채널 계수를 0.4로 더 강하게 줄이면 결과 톤이 더 따뜻해집니다. B 평균이 step4보다 더 작은지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image
      from sklearn.datasets import load_sample_image

      warmPic = Image.fromarray(load_sample_image('flower.jpg')).convert('L').convert('RGB')
      rCh, gCh, bCh = warmPic.split()
      bWarm = bCh.point(lambda x: min(255, int(x * ___)))
      warmSepia = Image.merge('RGB', (rCh.point(lambda x: min(255, int(x * 1.07))), gCh.point(lambda x: min(255, int(x * 0.95))), bWarm))
      warmArr = np.asarray(warmSepia)
      {'bMean': round(float(warmArr[..., 2].mean()), 1)}
    hints:
    - B 계수는 0.4가 됩니다.
    - 빈칸에는 0.4가 들어갑니다.
    check:
      noError: split/merge 흐름이 끝나야 합니다.
      resultCheck: bMean이 0~150 범위 안에 있어야 합니다.
  check:
    noError: split/point/merge 흐름이 끝나야 합니다.
    resultCheck: mode가 'RGB'이고 rIsLargest가 True여야 합니다.
- id: step5_compare
  title: 5단계. 네 모드 비교 dict
  structuredPrimary: true
  subtitle: original/gray/binary/sepia 한 줄
  goal: 원본/흑백/이진화/세피아 네 결과의 mode와 채널 수를 dict로 묶어 모드 변환 흐름을 한눈에 정리합니다.
  why: 색 변환 결과는 mode만 보면 무엇이 적용됐는지 즉시 알 수 있습니다. 자동화 보고서에 mode 비교 dict를 넣으면 변환 단계가 의도대로 진행됐는지 한 줄로 확인됩니다.
  explanation: |-
    'RGB' 원본, 'L' 흑백, 'L' 이진화, 'RGB' 세피아 네 결과를 한 dict에 모읍니다. 같은 'L' 모드라도 이진화는 값 분포가 0과 255 두 값뿐입니다.
    "uniqueCount" 같은 키를 추가하면 같은 mode라도 색상 다양성이 어떻게 다른지 한 줄로 비교할 수 있습니다.
    자동화에서 이 형식 dict는 한 사진의 처리 단계 진행 상태를 보고하는 표준 형식이 됩니다.
  tips:
  - mode 'L'은 픽셀 byte 수가 1이라 RGB의 1/3, RGBA의 1/4입니다.
  - "Image.getextrema()는 (min, max) 튜플을 돌려줘 모드별 값 범위를 빠르게 비교할 수 있습니다."
  snippet: |-
    import numpy as np
    from PIL import Image
    from sklearn.datasets import load_sample_image

    summaryPic = Image.fromarray(load_sample_image('flower.jpg'))
    summaryGray = summaryPic.convert('L')
    summaryBinary = summaryGray.point(lambda x: 255 if x > 128 else 0)

    rCh, gCh, bCh = summaryPic.convert('L').convert('RGB').split()
    summarySepia = Image.merge('RGB', (
        rCh.point(lambda x: min(255, int(x * 1.07))),
        gCh.point(lambda x: min(255, int(x * 0.95))),
        bCh.point(lambda x: min(255, int(x * 0.6))),
    ))

    {
        'original': {'mode': summaryPic.mode, 'extrema': summaryPic.getextrema()},
        'gray': {'mode': summaryGray.mode, 'extrema': summaryGray.getextrema()},
        'binary': {'mode': summaryBinary.mode, 'uniqueCount': len(np.unique(np.asarray(summaryBinary)))},
        'sepia': {'mode': summarySepia.mode, 'extrema': summarySepia.getextrema()},
    }
  exercise:
    prompt: china 입력에 같은 dict 비교를 만들어 binary uniqueCount가 정확히 2인지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image
      from sklearn.datasets import load_sample_image

      cmpPic = Image.fromarray(load_sample_image('___'))
      cmpGray = cmpPic.convert('L')
      cmpBinary = cmpGray.point(lambda x: 255 if x > 128 else 0)

      {'binaryUniqueCount': len(np.unique(np.asarray(cmpBinary)))}
    hints:
    - china 파일명을 넣습니다.
    - 빈칸에는 china.jpg가 들어갑니다.
    check:
      noError: convert와 point 호출이 끝나야 합니다.
      resultCheck: binaryUniqueCount가 2여야 합니다.
  check:
    noError: 네 변환 호출과 dict 구성이 끝나야 합니다.
    resultCheck: 네 결과 모두 'mode' 키를 가지고 binary uniqueCount가 2여야 합니다.
- id: practice
  title: 실습 - bloomTone 함수
  structuredPrimary: true
  subtitle: 입력별 동일 흐름
  goal: bloomTone(image) 함수가 RGB 입력을 받아 gray/binary/sepia 세 결과를 dict로 돌려주도록 만들고, flower와 china 입력에 같은 형식으로 적용합니다.
  why: 색 변환 흐름을 함수로 묶어 두면 새 입력을 받아도 같은 형식의 결과를 보장합니다. 자동화 파이프라인의 표준 인터페이스가 됩니다.
  explanation: |-
    bloomTone 함수는 RGB Image를 받아 gray/binary/sepia 세 변환 결과를 dict로 돌려줍니다. 함수 인터페이스가 일관되므로 자동화 코드에서 다양한 입력에 같은 흐름을 적용할 수 있습니다.
    flower와 china 두 입력에 같은 함수를 돌리면 같은 형식의 결과가 두 개 나옵니다. 이 형식은 단위 테스트와 CSV 출력 모두에 그대로 활용됩니다.
    실무에서는 함수에 임계값 인자를 추가해 호출자가 조정 가능하게 만드는 것이 일반적입니다.
  tips:
  - 함수 안에서 split → 채널별 point → merge는 비용이 큽니다. 같은 sepia 변환을 자주 한다면 NumPy 배열 산술로 다시 짜는 게 빠릅니다.
  - 함수 시그니처에 threshold=128 같은 기본값을 두면 호출자가 조정할 수 있습니다.
  snippet: |-
    from PIL import Image
    from sklearn.datasets import load_sample_image


    def bloomTone(image: Image.Image, threshold: int = 128) -> dict:
        gray = image.convert('L')
        binary = gray.point(lambda x: 255 if x > threshold else 0)
        rCh, gCh, bCh = image.convert('L').convert('RGB').split()
        sepia = Image.merge('RGB', (
            rCh.point(lambda x: min(255, int(x * 1.07))),
            gCh.point(lambda x: min(255, int(x * 0.95))),
            bCh.point(lambda x: min(255, int(x * 0.6))),
        ))
        return {
            'inputMode': image.mode,
            'grayMode': gray.mode,
            'binaryMode': binary.mode,
            'sepiaMode': sepia.mode,
            'threshold': threshold,
        }


    flowerPic = Image.fromarray(load_sample_image('flower.jpg'))
    chinaPic = Image.fromarray(load_sample_image('china.jpg'))
    [bloomTone(flowerPic), bloomTone(chinaPic)]
  exercise:
    prompt: bloomTone에 threshold=200을 넘기면 threshold 키가 200으로 돌아오는지 확인하세요.
    starterCode: |-
      from PIL import Image
      from sklearn.datasets import load_sample_image


      def bloomToneExtended(image, threshold=128):
          gray = image.convert('L')
          binary = gray.point(lambda x: 255 if x > threshold else 0)
          return {'threshold': threshold, 'binaryMode': binary.mode}


      bloomToneExtended(Image.fromarray(load_sample_image('flower.jpg')), threshold=___)
    hints:
    - threshold 200을 넘깁니다.
    - 빈칸에는 200이 들어갑니다.
    check:
      noError: bloomToneExtended 정의와 호출이 끝나야 합니다.
      resultCheck: 결과 dict의 threshold가 200이어야 합니다.
  check:
    noError: bloomTone 정의와 두 호출이 끝나야 합니다.
    resultCheck: 두 결과 모두 같은 키를 가지고 inputMode가 'RGB'여야 합니다.
- id: workflow_validation
  title: 6단계. RGB 입력 가드 + 변환 검증
  structuredPrimary: true
  subtitle: validateRgbSource + 결과 모드 회귀 테스트
  goal: validateRgbSource 함수가 비 RGB 입력을 ValueError로 차단하고, 정상 입력에서 흑백/이진화 결과의 mode와 unique 값 개수가 정해진 형식인지 회귀 테스트로 확인합니다.
  why: 색 변환 함수는 입력 mode 가정에 의존합니다. RGBA나 P 모드 같은 비 RGB 입력이 들어오면 split이 4채널을 돌려줘 후속 처리가 깨집니다. 함수 입구에서 차단하면 그 사고가 막힙니다.
  explanation: |-
    validateRgbSource는 image.mode != 'RGB'면 ValueError를 던집니다. f-string으로 실제 mode를 포함시켜 호출자가 즉시 원인을 알 수 있게 합니다.
    회귀 테스트는 (1) convert('L') 결과 mode가 'L', (2) point 이진화 결과의 unique 값이 정확히 [0, 255] 두 개여야 한다는 두 조건을 assert합니다. 알고리즘 변경 후 즉시 돌려 볼 수 있는 1줄 검증입니다.
    Pillow ImageDraw로 만든 합성 입력은 mode/size가 정확히 정해져 회귀 테스트로 적합합니다.
  tips:
  - L 모드 픽셀의 unique 값 개수는 입력 다양성에 따라 다릅니다. 이진화 후에는 항상 1~2개여야 합니다(임계값 너머/이하 픽셀이 있을 때 2).
  - "ValueError 메시지 형식을 일관되게 두면 자동화 로그에서 grep으로 잡기 쉽습니다."
  snippet: |-
    import numpy as np
    from PIL import Image, ImageDraw


    def validateRgbSource(image: Image.Image) -> bool:
        if image.mode != 'RGB':
            raise ValueError(f"RGB 원본이 필요합니다: mode={image.mode}")
        return True


    toneImage = Image.new('RGB', (160, 100), (40, 80, 130))
    toneDraw = ImageDraw.Draw(toneImage)
    toneDraw.rectangle((20, 20, 75, 80), fill=(230, 220, 170))
    toneDraw.rectangle((90, 20, 140, 80), fill=(120, 60, 40))

    okResult = validateRgbSource(toneImage)
    okGray = toneImage.convert('L')
    okBinary = okGray.point(lambda x: 255 if x > 128 else 0)

    grayscaleImage = toneImage.convert('L')
    try:
        validateRgbSource(grayscaleImage)
        nonRgbMessage = 'unexpected pass'
    except ValueError as exc:
        nonRgbMessage = str(exc)

    {
        'okResult': okResult,
        'grayMode': okGray.mode,
        'binaryUnique': sorted(np.unique(np.asarray(okBinary)).tolist()),
        'nonRgbMessage': nonRgbMessage,
    }
  exercise:
    prompt: RGBA 입력에 validateRgbSource를 호출해 mode 오류 메시지에 'RGBA' 단서가 포함되는지 확인하세요.
    starterCode: |-
      from PIL import Image


      def validateRgbSource(image):
          if image.mode != 'RGB':
              raise ValueError(f"RGB 원본이 필요합니다: mode={image.mode}")
          return True


      rgbaImage = Image.new('___', (50, 50), (100, 150, 200, 255))
      try:
          validateRgbSource(rgbaImage)
          rgbaMessage = 'unexpected pass'
      except ValueError as exc:
          rgbaMessage = str(exc)

      {'rgbaMessage': rgbaMessage, 'hasRgbaHint': 'RGBA' in rgbaMessage}
    hints:
    - 4채널 알파 모드 문자열은 'RGBA'입니다.
    - 빈칸에는 RGBA가 들어갑니다.
    check:
      noError: validateRgbSource 정의가 끝나야 합니다.
      resultCheck: hasRgbaHint가 True여야 합니다.
  check:
    noError: validateRgbSource와 변환 호출이 끝나야 합니다.
    resultCheck: okResult가 True, grayMode가 'L', binaryUnique가 [0, 255], nonRgbMessage에 'mode' 단서가 포함되어야 합니다.
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
  - id: pillow_03-grayscale_conversion-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - workflow_validation
    title: 흑백 사진 변환기 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: source mode·target L mode·alpha 처리 정책을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_grayscale_conversion_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_grayscale_conversion_contract(value):
            raise NotImplementedError
      solution: |
        def audit_grayscale_conversion_contract(value):
            required = ['sourceMode', 'targetMode', 'alphaPolicy']
            rules = [{'id': 'source-mode', 'field': 'sourceMode', 'kind': 'enum', 'values': ['RGB', 'RGBA']}, {'id': 'target-mode', 'field': 'targetMode', 'kind': 'enum', 'values': ['L']}, {'id': 'alpha-policy', 'field': 'alphaPolicy', 'kind': 'enum', 'values': ['drop', 'preserve-separate']}]
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
            return {"accepted": not missing and not violations, "topic": 'grayscale_conversion', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.pillow.pillow_03.grayscale_conversion-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_03.grayscale_conversion-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_grayscale_conversion_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              sourceMode: RGBA
              targetMode: L
              alphaPolicy: preserve-separate
          expectedReturn:
            accepted: true
            topic: grayscale_conversion
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              targetMode: L
              alphaPolicy: preserve-separate
          expectedReturn:
            accepted: false
            topic: grayscale_conversion
            missing:
            - sourceMode
            violations:
            - source-mode
        - id: reports-topic-invariants
          arguments:
          - value:
              sourceMode: CMYK
              targetMode: RGB
              alphaPolicy: ignore
          expectedReturn:
            accepted: false
            topic: grayscale_conversion
            missing: []
            violations:
            - alpha-policy
            - source-mode
            - target-mode
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pillow_03-grayscale_conversion-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_03-grayscale_conversion-contract-audit-mastery
    title: 흑백 사진 변환기 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_grayscale_conversion_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_grayscale_conversion_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_grayscale_conversion_result(expected, observed):
            identity = ['sourceHash', 'targetMode']
            metrics = {'meanLuma': 0.5}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'grayscale_conversion', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.pillow.pillow_03.grayscale_conversion-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_03.grayscale_conversion-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_grayscale_conversion_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: g1
              targetMode: L
              meanLuma: 126.0
          - value:
              sourceHash: g1
              targetMode: L
              meanLuma: 126.4
          expectedReturn:
            passed: true
            topic: grayscale_conversion
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: g1
              targetMode: L
              meanLuma: 126.0
          - value:
              sourceHash: g2
              targetMode: RGB
              meanLuma: 140.0
          expectedReturn:
            passed: false
            topic: grayscale_conversion
            missing: []
            identityMismatch:
            - sourceHash
            - targetMode
            metricDrift:
            - meanLuma
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: g1
              targetMode: L
              meanLuma: 126.0
          - value: {}
          expectedReturn:
            passed: false
            topic: grayscale_conversion
            missing:
            - meanLuma
            - sourceHash
            - targetMode
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pillow_03-grayscale_conversion-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_03-grayscale_conversion-result-reconciliation-transfer
    title: 흑백 사진 변환기 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_grayscale_conversion_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_grayscale_conversion_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_grayscale_conversion_evidence(stage):
            stages = {'source': {'action': 'admit grayscale source', 'evidence': 'mode and alpha policy', 'risk': 'unsafe or misread image'}, 'edit': {'action': 'apply bounded grayscale edit', 'evidence': 'luma conversion trace', 'risk': 'quality or geometry loss'}, 'artifact': {'action': 'reopen grayscale artifact', 'evidence': 'L-mode histogram', 'risk': 'corrupt or visually wrong output'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.pillow.pillow_03.grayscale_conversion-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_03.grayscale_conversion-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_grayscale_conversion_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: admit grayscale source
            evidence: mode and alpha policy
            risk: unsafe or misread image
        - id: recalls-edit
          arguments:
          - value: edit
          expectedReturn:
            action: apply bounded grayscale edit
            evidence: luma conversion trace
            risk: quality or geometry loss
        - id: recalls-artifact
          arguments:
          - value: artifact
          expectedReturn:
            action: reopen grayscale artifact
            evidence: L-mode histogram
            risk: corrupt or visually wrong output
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};