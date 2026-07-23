var e=`meta:\r
  packages:\r
  - numpy\r
  - pillow\r
  - scikit-learn\r
  id: pillow_03\r
  title: 흑백사진변환기\r
  order: 3\r
  category: pillow\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - Pillow\r
  - convert\r
  - grayscale\r
  - sepia\r
  - pixel\r
  seo:\r
    title: Pillow 기초 - 흑백 사진 변환기\r
    description: Pillow convert로 RGB→L 변환, point로 이진화, split/merge로 세피아 톤을 만드는 색 처리 흐름을 정량 검증합니다.\r
    keywords:\r
    - Pillow\r
    - convert\r
    - grayscale\r
    - 흑백\r
    - 세피아\r
    - 픽셀\r
intro:\r
  emoji: 🎞️\r
  goal: Pillow의 convert('L')로 RGB를 흑백으로, point로 이진화, split/merge로 세피아 톤을 만드는 색 변환 흐름을 dict 통계로 정량 검증합니다.\r
  description: 색 모드 변환은 Pillow에서 가장 자주 쓰는 작업입니다. 'RGB'/'L'/'1' 모드 차이와 채널 합성/분해 흐름을 한 강의에서 정리합니다.\r
  direction: convert('L') → point(이진화) → split/merge로 세피아 → mode/픽셀 통계 비교 흐름.\r
  benefits:\r
  - convert('L')이 BT.601 가중치로 RGB를 단채널로 줄이는 흐름을 손으로 확인합니다.\r
  - point(lambda)로 픽셀 단위 변환을 적용하고 이진화 결과가 0과 255만 갖는지 검증합니다.\r
  - split/merge로 R/G/B를 분리해 세피아 톤을 만드는 채널 산술을 직접 짭니다.\r
  - validateRgbSource로 입력 mode 가드 패턴을 잡습니다.\r
  diagram:\r
    steps:\r
    - label: RGB 입력 로드\r
      detail: load_sample_image flower를 Image.fromarray로 RGB Image로 만듭니다.\r
    - label: convert('L') 흑백\r
      detail: 단채널 'L' 모드로 줄여서 픽셀 평균과 비교.\r
    - label: point 이진화\r
      detail: lambda로 임계값 분기를 적용해 결과가 0/255만 갖는지 검증.\r
    - label: split/merge 세피아\r
      detail: R/G/B 채널에 다른 계수를 곱해 세피아 톤을 합성.\r
    - label: 모드 dict 비교\r
      detail: 네 변환 결과의 mode와 픽셀 통계를 한 dict로 정리.\r
    runtime:\r
    - label: pillow + numpy\r
      detail: split/merge 결과를 NumPy로 변환해 통계 비교에 활용합니다.\r
    - label: 한 RGB 원본\r
      detail: 첫 셀의 pic 객체가 이후 모든 셀의 공통 입력입니다.\r
    - label: convert는 새 객체\r
      detail: convert 호출은 새 Image를 돌려주고 원본 mode를 변경하지 않습니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. flower RGB 로드\r
  structuredPrimary: true\r
  subtitle: 색 변환 원본 만들기\r
  goal: flower 샘플을 Image.fromarray로 RGB Image로 만들고 mode가 'RGB', size가 (640, 427)임을 확인합니다.\r
  why: 이후 모든 색 변환 셀이 pic 한 객체를 공통 입력으로 씁니다. 첫 셀에서 mode와 size를 명확히 잡아 두면 다음 셀들의 가정이 분명해집니다.\r
  explanation: |-\r
    sklearn load_sample_image('flower.jpg')는 (427, 640, 3) RGB ndarray를 돌려줍니다. Image.fromarray로 Pillow Image로 감싸면 mode='RGB', size=(640, 427)이 됩니다.\r
    이 객체가 모든 후속 변환의 입력입니다. .convert('L')은 새 객체를 돌려주고 원본은 'RGB' 그대로 유지됩니다.\r
  tips:\r
  - Image.fromarray는 ndarray의 dtype을 보고 mode를 자동 결정합니다. uint8 3채널이면 'RGB'.\r
  - "Pillow의 mode 문자열: 'RGB', 'L'(흑백), 'RGBA'(알파 포함), '1'(1-bit 흑백), 'I'(int 라벨)."\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    pic = Image.fromarray(load_sample_image('flower.jpg'))\r
\r
    {\r
        'mode': pic.mode,\r
        'size': pic.size,\r
        'isRgb': pic.mode == 'RGB',\r
        'pixelCount': pic.size[0] * pic.size[1],\r
    }\r
  exercise:\r
    prompt: china 샘플로 같은 흐름을 만들어 mode가 'RGB'고 size가 (640, 427)인지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      chinaPic = Image.fromarray(load_sample_image('___'))\r
      {'mode': chinaPic.mode, 'size': chinaPic.size, 'matches': chinaPic.size == (640, 427)}\r
    hints:\r
    - china 파일명은 'china.jpg'입니다.\r
    - 빈칸에는 china.jpg가 들어갑니다.\r
    check:\r
      noError: Image.fromarray가 끝나야 합니다.\r
      resultCheck: matches가 True여야 합니다.\r
  check:\r
    noError: load_sample_image와 Image.fromarray가 끝나야 합니다.\r
    resultCheck: mode가 'RGB', size가 (640, 427), pixelCount가 273280이어야 합니다.\r
- id: step2_grayscale\r
  title: 2단계. convert('L')로 흑백\r
  structuredPrimary: true\r
  subtitle: 3채널 → 1채널\r
  goal: pic.convert('L')로 단채널 그레이스케일을 만들고 결과의 mode가 'L'이며 픽셀 평균이 원본 채널 평균과 비슷한지 확인합니다.\r
  why: 흑백 변환은 픽셀 수가 1/3로 줄어 다음 단계 처리가 빨라집니다. convert('L')의 가중치 평균 결과가 단순 채널 평균과 다른 이유를 한 번 봐 두면 색 변환 감각이 잡힙니다.\r
  explanation: |-\r
    Image.convert('L')은 BT.601 표준 가중치 Y = 0.299·R + 0.587·G + 0.114·B로 단채널 밝기를 계산합니다. 결과 mode는 'L', 값 범위는 0~255입니다.\r
    채널별 단순 평균 (R+G+B)/3과 미묘하게 다릅니다. 녹색 영역이 많은 사진은 가중치 평균이 단순 평균보다 약간 큰 값을 줍니다.\r
    검증은 결과 픽셀 평균과 원본 ndarray의 채널별 평균을 비교합니다.\r
  tips:\r
  - convert('L')은 read-only로 동작합니다. 원본은 'RGB' 그대로 남습니다.\r
  - 더 빠른 단순 평균이 필요하면 np.asarray(rgb).mean(axis=2).astype(np.uint8)로 ndarray에서 직접 계산할 수 있습니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    grayPic = Image.fromarray(load_sample_image('flower.jpg'))\r
    gray = grayPic.convert('L')\r
\r
    rgbArr = np.asarray(grayPic)\r
    grayArr = np.asarray(gray)\r
\r
    {\r
        'grayMode': gray.mode,\r
        'graySize': gray.size,\r
        'grayMean': round(float(grayArr.mean()), 1),\r
        'rgbChannelMean': [round(float(rgbArr[..., c].mean()), 1) for c in range(3)],\r
        'sizeUnchanged': gray.size == grayPic.size,\r
    }\r
  exercise:\r
    prompt: 단순 채널 평균으로 grayscale을 만들고 convert('L') 결과 평균과 비교해 차이가 약 1~3 범위인지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      compareRgb = Image.fromarray(load_sample_image('flower.jpg'))\r
      cvMean = float(np.asarray(compareRgb.convert('L')).mean())\r
      simpleMean = float(np.asarray(compareRgb).mean(axis=___).mean())\r
      {'cvMean': round(cvMean, 1), 'simpleMean': round(simpleMean, 1), 'diff': round(abs(cvMean - simpleMean), 1)}\r
    hints:\r
    - 채널 축은 마지막 축인 2입니다.\r
    - 빈칸에는 2가 들어갑니다.\r
    check:\r
      noError: convert와 평균 계산이 끝나야 합니다.\r
      resultCheck: diff가 10 이하여야 합니다.\r
  check:\r
    noError: convert와 통계 계산이 끝나야 합니다.\r
    resultCheck: grayMode가 'L', sizeUnchanged가 True여야 합니다.\r
- id: step3_threshold\r
  title: 3단계. point()로 이진화\r
  structuredPrimary: true\r
  subtitle: lambda 픽셀 변환\r
  goal: gray.point에 lambda를 넘겨 임계값 128 이진화를 만들고 결과 ndarray가 0과 255 두 값만 갖는지 검증합니다.\r
  why: point는 각 픽셀에 함수를 적용하는 유틸리티입니다. 람다 한 줄로 이진화, 감마, 반전 같은 변환을 표현할 수 있어 매우 유용합니다.\r
  explanation: |-\r
    Image.point(lambda x: ...)는 모든 픽셀 값에 함수를 적용합니다. 'L' 모드에서는 0~255 정수 → 0~255 정수 변환입니다.\r
    이진화 람다는 임계값보다 크면 255, 그렇지 않으면 0을 돌려줍니다. 결과는 두 값만 가지는 흑백 이미지입니다.\r
    검증은 np.unique(arr)로 결과의 고유 값을 확인합니다. 정확히 {0, 255}여야 이진화가 의도대로 동작한 것입니다. 임계값에 따라 객체/배경 비율이 달라지는 것도 함께 봅니다.\r
  tips:\r
  - point는 RGB 입력에는 채널별로 적용됩니다. 채널별로 다른 함수를 쓰려면 split 후 처리해야 합니다.\r
  - 더 빠른 이진화는 np.where(arr > threshold, 255, 0).astype(np.uint8)로 NumPy에서 직접 처리합니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    threshPic = Image.fromarray(load_sample_image('flower.jpg')).convert('L')\r
    threshold128 = threshPic.point(lambda x: 255 if x > 128 else 0)\r
    threshold200 = threshPic.point(lambda x: 255 if x > 200 else 0)\r
\r
    {\r
        'mode': threshold128.mode,\r
        'uniqueValues128': sorted(np.unique(np.asarray(threshold128)).tolist()),\r
        'whiteRatio128': round(float((np.asarray(threshold128) == 255).mean()), 3),\r
        'whiteRatio200': round(float((np.asarray(threshold200) == 255).mean()), 3),\r
        'tighterIsFewerWhite': float((np.asarray(threshold200) == 255).mean()) < float((np.asarray(threshold128) == 255).mean()),\r
    }\r
  exercise:\r
    prompt: 임계값 64 이진화를 만들어 흰색 비율이 128 임계값보다 더 큰지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      lowThreshPic = Image.fromarray(load_sample_image('flower.jpg')).convert('L')\r
      threshold64 = lowThreshPic.point(lambda x: 255 if x > ___ else 0)\r
      whiteRatio64 = round(float((np.asarray(threshold64) == 255).mean()), 3)\r
      {'whiteRatio64': whiteRatio64, 'aboveHalf': whiteRatio64 > 0.5}\r
    hints:\r
    - 더 낮은 임계값은 64입니다.\r
    - 빈칸에는 64가 들어갑니다.\r
    check:\r
      noError: point 호출이 끝나야 합니다.\r
      resultCheck: whiteRatio64가 양수이고 0~1 사이여야 합니다.\r
  check:\r
    noError: convert와 point 두 호출이 끝나야 합니다.\r
    resultCheck: uniqueValues128이 [0, 255]이고 tighterIsFewerWhite가 True여야 합니다.\r
- id: step4_sepia\r
  title: 4단계. 세피아 톤 (split/merge)\r
  structuredPrimary: true\r
  subtitle: 채널 산술 합성\r
  goal: 그레이스케일을 RGB로 다시 만든 뒤 R/G/B 채널에 다른 계수를 적용해 세피아 톤(R 큰, B 작은)을 만들고 채널 평균을 비교합니다.\r
  why: 세피아는 흑백을 색이 있는 톤으로 변환하는 표준 효과입니다. split/merge 흐름을 손으로 짜면 채널 분리와 합성의 흐름이 명확해집니다.\r
  explanation: |-\r
    .convert('RGB')로 'L' 이미지를 다시 RGB로 만들면 R=G=B인 무채색 RGB가 됩니다. 여기에 채널별로 다른 가중치를 곱하면 색조가 생깁니다.\r
    세피아 표준 공식 중 하나는 R'=min(255, R*1.07), G'=min(255, G*0.95), B'=min(255, B*0.6)입니다. R은 살짝 키우고 B는 크게 줄이면 따뜻한 갈색 톤이 됩니다.\r
    검증은 결과 ndarray의 채널별 평균을 비교합니다. R > G > B 순서가 되어야 세피아 톤이 만들어진 것입니다.\r
  tips:\r
  - Image.point는 각 채널에 같은 함수를 적용하므로 채널별 다른 가중치는 split → 채널별 point → merge 패턴이 필요합니다.\r
  - ImageOps.colorize 같은 헬퍼도 있지만 손으로 짜 보면 채널 산술이 머리에 잡힙니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    sepiaPic = Image.fromarray(load_sample_image('flower.jpg'))\r
    sepiaGray = sepiaPic.convert('L').convert('RGB')\r
\r
    rCh, gCh, bCh = sepiaGray.split()\r
    rTone = rCh.point(lambda x: min(255, int(x * 1.07)))\r
    gTone = gCh.point(lambda x: min(255, int(x * 0.95)))\r
    bTone = bCh.point(lambda x: min(255, int(x * 0.6)))\r
    sepia = Image.merge('RGB', (rTone, gTone, bTone))\r
\r
    sepiaArr = np.asarray(sepia)\r
    {\r
        'mode': sepia.mode,\r
        'size': sepia.size,\r
        'channelMeans': [round(float(sepiaArr[..., c].mean()), 1) for c in range(3)],\r
        'rIsLargest': float(sepiaArr[..., 0].mean()) > float(sepiaArr[..., 1].mean()) > float(sepiaArr[..., 2].mean()),\r
    }\r
  exercise:\r
    prompt: B 채널 계수를 0.4로 더 강하게 줄이면 결과 톤이 더 따뜻해집니다. B 평균이 step4보다 더 작은지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      warmPic = Image.fromarray(load_sample_image('flower.jpg')).convert('L').convert('RGB')\r
      rCh, gCh, bCh = warmPic.split()\r
      bWarm = bCh.point(lambda x: min(255, int(x * ___)))\r
      warmSepia = Image.merge('RGB', (rCh.point(lambda x: min(255, int(x * 1.07))), gCh.point(lambda x: min(255, int(x * 0.95))), bWarm))\r
      warmArr = np.asarray(warmSepia)\r
      {'bMean': round(float(warmArr[..., 2].mean()), 1)}\r
    hints:\r
    - B 계수는 0.4가 됩니다.\r
    - 빈칸에는 0.4가 들어갑니다.\r
    check:\r
      noError: split/merge 흐름이 끝나야 합니다.\r
      resultCheck: bMean이 0~150 범위 안에 있어야 합니다.\r
  check:\r
    noError: split/point/merge 흐름이 끝나야 합니다.\r
    resultCheck: mode가 'RGB'이고 rIsLargest가 True여야 합니다.\r
- id: step5_compare\r
  title: 5단계. 네 모드 비교 dict\r
  structuredPrimary: true\r
  subtitle: original/gray/binary/sepia 한 줄\r
  goal: 원본/흑백/이진화/세피아 네 결과의 mode와 채널 수를 dict로 묶어 모드 변환 흐름을 한눈에 정리합니다.\r
  why: 색 변환 결과는 mode만 보면 무엇이 적용됐는지 즉시 알 수 있습니다. 자동화 보고서에 mode 비교 dict를 넣으면 변환 단계가 의도대로 진행됐는지 한 줄로 확인됩니다.\r
  explanation: |-\r
    'RGB' 원본, 'L' 흑백, 'L' 이진화, 'RGB' 세피아 네 결과를 한 dict에 모읍니다. 같은 'L' 모드라도 이진화는 값 분포가 0과 255 두 값뿐입니다.\r
    "uniqueCount" 같은 키를 추가하면 같은 mode라도 색상 다양성이 어떻게 다른지 한 줄로 비교할 수 있습니다.\r
    자동화에서 이 형식 dict는 한 사진의 처리 단계 진행 상태를 보고하는 표준 형식이 됩니다.\r
  tips:\r
  - mode 'L'은 픽셀 byte 수가 1이라 RGB의 1/3, RGBA의 1/4입니다.\r
  - "Image.getextrema()는 (min, max) 튜플을 돌려줘 모드별 값 범위를 빠르게 비교할 수 있습니다."\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    summaryPic = Image.fromarray(load_sample_image('flower.jpg'))\r
    summaryGray = summaryPic.convert('L')\r
    summaryBinary = summaryGray.point(lambda x: 255 if x > 128 else 0)\r
\r
    rCh, gCh, bCh = summaryPic.convert('L').convert('RGB').split()\r
    summarySepia = Image.merge('RGB', (\r
        rCh.point(lambda x: min(255, int(x * 1.07))),\r
        gCh.point(lambda x: min(255, int(x * 0.95))),\r
        bCh.point(lambda x: min(255, int(x * 0.6))),\r
    ))\r
\r
    {\r
        'original': {'mode': summaryPic.mode, 'extrema': summaryPic.getextrema()},\r
        'gray': {'mode': summaryGray.mode, 'extrema': summaryGray.getextrema()},\r
        'binary': {'mode': summaryBinary.mode, 'uniqueCount': len(np.unique(np.asarray(summaryBinary)))},\r
        'sepia': {'mode': summarySepia.mode, 'extrema': summarySepia.getextrema()},\r
    }\r
  exercise:\r
    prompt: china 입력에 같은 dict 비교를 만들어 binary uniqueCount가 정확히 2인지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      cmpPic = Image.fromarray(load_sample_image('___'))\r
      cmpGray = cmpPic.convert('L')\r
      cmpBinary = cmpGray.point(lambda x: 255 if x > 128 else 0)\r
\r
      {'binaryUniqueCount': len(np.unique(np.asarray(cmpBinary)))}\r
    hints:\r
    - china 파일명을 넣습니다.\r
    - 빈칸에는 china.jpg가 들어갑니다.\r
    check:\r
      noError: convert와 point 호출이 끝나야 합니다.\r
      resultCheck: binaryUniqueCount가 2여야 합니다.\r
  check:\r
    noError: 네 변환 호출과 dict 구성이 끝나야 합니다.\r
    resultCheck: 네 결과 모두 'mode' 키를 가지고 binary uniqueCount가 2여야 합니다.\r
- id: practice\r
  title: 실습 - bloomTone 함수\r
  structuredPrimary: true\r
  subtitle: 입력별 동일 흐름\r
  goal: bloomTone(image) 함수가 RGB 입력을 받아 gray/binary/sepia 세 결과를 dict로 돌려주도록 만들고, flower와 china 입력에 같은 형식으로 적용합니다.\r
  why: 색 변환 흐름을 함수로 묶어 두면 새 입력을 받아도 같은 형식의 결과를 보장합니다. 자동화 파이프라인의 표준 인터페이스가 됩니다.\r
  explanation: |-\r
    bloomTone 함수는 RGB Image를 받아 gray/binary/sepia 세 변환 결과를 dict로 돌려줍니다. 함수 인터페이스가 일관되므로 자동화 코드에서 다양한 입력에 같은 흐름을 적용할 수 있습니다.\r
    flower와 china 두 입력에 같은 함수를 돌리면 같은 형식의 결과가 두 개 나옵니다. 이 형식은 단위 테스트와 CSV 출력 모두에 그대로 활용됩니다.\r
    실무에서는 함수에 임계값 인자를 추가해 호출자가 조정 가능하게 만드는 것이 일반적입니다.\r
  tips:\r
  - 함수 안에서 split → 채널별 point → merge는 비용이 큽니다. 같은 sepia 변환을 자주 한다면 NumPy 배열 산술로 다시 짜는 게 빠릅니다.\r
  - 함수 시그니처에 threshold=128 같은 기본값을 두면 호출자가 조정할 수 있습니다.\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def bloomTone(image: Image.Image, threshold: int = 128) -> dict:\r
        gray = image.convert('L')\r
        binary = gray.point(lambda x: 255 if x > threshold else 0)\r
        rCh, gCh, bCh = image.convert('L').convert('RGB').split()\r
        sepia = Image.merge('RGB', (\r
            rCh.point(lambda x: min(255, int(x * 1.07))),\r
            gCh.point(lambda x: min(255, int(x * 0.95))),\r
            bCh.point(lambda x: min(255, int(x * 0.6))),\r
        ))\r
        return {\r
            'inputMode': image.mode,\r
            'grayMode': gray.mode,\r
            'binaryMode': binary.mode,\r
            'sepiaMode': sepia.mode,\r
            'threshold': threshold,\r
        }\r
\r
\r
    flowerPic = Image.fromarray(load_sample_image('flower.jpg'))\r
    chinaPic = Image.fromarray(load_sample_image('china.jpg'))\r
    [bloomTone(flowerPic), bloomTone(chinaPic)]\r
  exercise:\r
    prompt: bloomTone에 threshold=200을 넘기면 threshold 키가 200으로 돌아오는지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def bloomToneExtended(image, threshold=128):\r
          gray = image.convert('L')\r
          binary = gray.point(lambda x: 255 if x > threshold else 0)\r
          return {'threshold': threshold, 'binaryMode': binary.mode}\r
\r
\r
      bloomToneExtended(Image.fromarray(load_sample_image('flower.jpg')), threshold=___)\r
    hints:\r
    - threshold 200을 넘깁니다.\r
    - 빈칸에는 200이 들어갑니다.\r
    check:\r
      noError: bloomToneExtended 정의와 호출이 끝나야 합니다.\r
      resultCheck: 결과 dict의 threshold가 200이어야 합니다.\r
  check:\r
    noError: bloomTone 정의와 두 호출이 끝나야 합니다.\r
    resultCheck: 두 결과 모두 같은 키를 가지고 inputMode가 'RGB'여야 합니다.\r
- id: workflow_validation\r
  title: 6단계. RGB 입력 가드 + 변환 검증\r
  structuredPrimary: true\r
  subtitle: validateRgbSource + 결과 모드 회귀 테스트\r
  goal: validateRgbSource 함수가 비 RGB 입력을 ValueError로 차단하고, 정상 입력에서 흑백/이진화 결과의 mode와 unique 값 개수가 정해진 형식인지 회귀 테스트로 확인합니다.\r
  why: 색 변환 함수는 입력 mode 가정에 의존합니다. RGBA나 P 모드 같은 비 RGB 입력이 들어오면 split이 4채널을 돌려줘 후속 처리가 깨집니다. 함수 입구에서 차단하면 그 사고가 막힙니다.\r
  explanation: |-\r
    validateRgbSource는 image.mode != 'RGB'면 ValueError를 던집니다. f-string으로 실제 mode를 포함시켜 호출자가 즉시 원인을 알 수 있게 합니다.\r
    회귀 테스트는 (1) convert('L') 결과 mode가 'L', (2) point 이진화 결과의 unique 값이 정확히 [0, 255] 두 개여야 한다는 두 조건을 assert합니다. 알고리즘 변경 후 즉시 돌려 볼 수 있는 1줄 검증입니다.\r
    Pillow ImageDraw로 만든 합성 입력은 mode/size가 정확히 정해져 회귀 테스트로 적합합니다.\r
  tips:\r
  - L 모드 픽셀의 unique 값 개수는 입력 다양성에 따라 다릅니다. 이진화 후에는 항상 1~2개여야 합니다(임계값 너머/이하 픽셀이 있을 때 2).\r
  - "ValueError 메시지 형식을 일관되게 두면 자동화 로그에서 grep으로 잡기 쉽습니다."\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw\r
\r
\r
    def validateRgbSource(image: Image.Image) -> bool:\r
        if image.mode != 'RGB':\r
            raise ValueError(f"RGB 원본이 필요합니다: mode={image.mode}")\r
        return True\r
\r
\r
    toneImage = Image.new('RGB', (160, 100), (40, 80, 130))\r
    toneDraw = ImageDraw.Draw(toneImage)\r
    toneDraw.rectangle((20, 20, 75, 80), fill=(230, 220, 170))\r
    toneDraw.rectangle((90, 20, 140, 80), fill=(120, 60, 40))\r
\r
    okResult = validateRgbSource(toneImage)\r
    okGray = toneImage.convert('L')\r
    okBinary = okGray.point(lambda x: 255 if x > 128 else 0)\r
\r
    grayscaleImage = toneImage.convert('L')\r
    try:\r
        validateRgbSource(grayscaleImage)\r
        nonRgbMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        nonRgbMessage = str(exc)\r
\r
    {\r
        'okResult': okResult,\r
        'grayMode': okGray.mode,\r
        'binaryUnique': sorted(np.unique(np.asarray(okBinary)).tolist()),\r
        'nonRgbMessage': nonRgbMessage,\r
    }\r
  exercise:\r
    prompt: RGBA 입력에 validateRgbSource를 호출해 mode 오류 메시지에 'RGBA' 단서가 포함되는지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
\r
\r
      def validateRgbSource(image):\r
          if image.mode != 'RGB':\r
              raise ValueError(f"RGB 원본이 필요합니다: mode={image.mode}")\r
          return True\r
\r
\r
      rgbaImage = Image.new('___', (50, 50), (100, 150, 200, 255))\r
      try:\r
          validateRgbSource(rgbaImage)\r
          rgbaMessage = 'unexpected pass'\r
      except ValueError as exc:\r
          rgbaMessage = str(exc)\r
\r
      {'rgbaMessage': rgbaMessage, 'hasRgbaHint': 'RGBA' in rgbaMessage}\r
    hints:\r
    - 4채널 알파 모드 문자열은 'RGBA'입니다.\r
    - 빈칸에는 RGBA가 들어갑니다.\r
    check:\r
      noError: validateRgbSource 정의가 끝나야 합니다.\r
      resultCheck: hasRgbaHint가 True여야 합니다.\r
  check:\r
    noError: validateRgbSource와 변환 호출이 끝나야 합니다.\r
    resultCheck: okResult가 True, grayMode가 'L', binaryUnique가 [0, 255], nonRgbMessage에 'mode' 단서가 포함되어야 합니다.\r
`;export{e as default};