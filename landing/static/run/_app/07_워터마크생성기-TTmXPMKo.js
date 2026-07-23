var e=`meta:\r
  packages:\r
  - numpy\r
  - pillow\r
  - scikit-learn\r
  id: pillow_07\r
  title: 워터마크생성기\r
  order: 7\r
  category: pillow\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - Pillow\r
  - ImageDraw\r
  - text\r
  - paste\r
  - RGBA\r
  - alpha\r
  - 워터마크\r
  seo:\r
    title: Pillow 중급 - 워터마크 생성기\r
    description: Pillow ImageDraw로 텍스트 그리기, RGBA 알파 채널로 반투명 워터마크를 합성합니다.\r
    keywords:\r
    - Pillow\r
    - 워터마크\r
    - ImageDraw\r
    - text\r
    - 투명도\r
    - alpha\r
intro:\r
  emoji: 💧\r
  goal: ImageDraw로 텍스트를 그리고 RGBA mode + paste(mask=alpha)로 반투명 워터마크를 합성하는 흐름을 정량 검증합니다.\r
  description: 워터마크는 RGBA 알파 채널로 투명도를 다루는 표준 사례입니다. ImageDraw.text와 paste의 mask 인자 두 도구가 핵심입니다.\r
  direction: ImageDraw.text → RGBA 변환 → alpha 마스크로 paste → 위치 정렬 흐름.\r
  benefits:\r
  - ImageDraw.text의 (x, y)와 fill 인자 동작을 확인합니다.\r
  - convert('RGBA')로 알파 채널을 추가하는 흐름을 봅니다.\r
  - paste(image, position, mask)의 mask가 픽셀별 합성 강도를 결정함을 검증합니다.\r
  - textbbox로 텍스트 크기를 측정해 위치를 자동 정렬합니다.\r
  diagram:\r
    steps:\r
    - label: 베이스 이미지\r
      detail: flower 샘플을 RGBA로 변환해 알파 합성에 적합한 형식으로 준비.\r
    - label: ImageDraw.text\r
      detail: 텍스트를 RGBA Image에 그려 워터마크 레이어 생성.\r
    - label: 알파 채널로 합성\r
      detail: paste(layer, position, mask=layer)로 반투명 합성.\r
    - label: 텍스트 박스 정렬\r
      detail: textbbox로 텍스트 크기를 재 우측 하단에 자동 배치.\r
    - label: 가드 함수\r
      detail: alpha 값이 0~255 범위인지 검증.\r
    runtime:\r
    - label: pillow + numpy\r
      detail: 합성 결과 픽셀을 NumPy로 검증.\r
    - label: RGBA 모드 필수\r
      detail: 알파 합성은 RGBA에서만 동작. RGB는 convert('RGBA')로 변환.\r
sections:\r
- id: step1_load\r
  title: 1단계. RGBA 베이스 만들기\r
  structuredPrimary: true\r
  subtitle: convert('RGBA')\r
  goal: flower 샘플을 RGB로 받아 convert('RGBA')로 알파 채널 추가 후 mode가 'RGBA', 채널이 4개인지 확인합니다.\r
  why: 알파 합성은 RGBA 모드에서만 안전하게 동작합니다. RGB 베이스에 직접 paste(mask=...)를 호출하면 의도와 다른 결과가 나옵니다. 첫 셀에서 변환을 명시적으로 해 둡니다.\r
  explanation: |-\r
    sklearn flower는 (640, 427, 3) RGB ndarray입니다. Image.fromarray로 RGB Image를 만들고 convert('RGBA')로 알파 채널을 추가합니다.\r
    결과 mode는 'RGBA', size는 그대로 (640, 427), 채널이 4개로 늘어납니다. 알파 채널의 초기값은 255 (완전 불투명).\r
  tips:\r
  - convert('RGBA')는 알파 채널을 255로 채웁니다. RGB 정보는 그대로 유지됩니다.\r
  - 알파 합성 후 RGB로 다시 돌리려면 convert('RGB')를 호출합니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    base = Image.fromarray(load_sample_image('flower.jpg')).convert('RGBA')\r
    baseArr = np.asarray(base)\r
\r
    {\r
        'mode': base.mode,\r
        'size': base.size,\r
        'channelCount': baseArr.shape[2],\r
        'alphaInitial': int(baseArr[..., 3].mean()),\r
    }\r
  exercise:\r
    prompt: china 입력을 같은 흐름으로 RGBA로 변환해 channelCount가 4인지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      chinaBase = Image.fromarray(load_sample_image('china.jpg')).convert('___')\r
      {'mode': chinaBase.mode, 'channelCount': np.asarray(chinaBase).shape[2]}\r
    hints:\r
    - 알파 포함 mode는 'RGBA'.\r
    - 빈칸에는 RGBA가 들어갑니다.\r
    check:\r
      noError: convert 호출이 끝나야 합니다.\r
      resultCheck: channelCount가 4여야 합니다.\r
  check:\r
    noError: convert와 통계 계산이 끝나야 합니다.\r
    resultCheck: mode가 'RGBA', channelCount가 4, alphaInitial이 255여야 합니다.\r
- id: step2_simple_text\r
  title: 2단계. ImageDraw.text\r
  structuredPrimary: true\r
  subtitle: 좌표와 fill 색상\r
  goal: ImageDraw.Draw(rgba)로 그리기 객체를 만들고 .text((x, y), msg, fill=color)로 텍스트를 그린 뒤 텍스트 영역의 픽셀 변화량을 확인합니다.\r
  why: ImageDraw.text는 모든 텍스트 워터마크의 출발점입니다. (x, y) 좌표가 텍스트 왼쪽 위 모서리이고 fill이 색상이라는 두 인자의 동작을 손으로 확인하면 워터마크 위치 정렬이 자연스러워집니다.\r
  explanation: |-\r
    ImageDraw.Draw(image)는 image에 in-place 그리기를 가능하게 합니다. 결과는 별도 객체 없이 원본이 직접 수정됩니다.\r
    .text((x, y), text, fill=(r, g, b, a))로 텍스트를 그립니다. (x, y)는 텍스트 시작 위치(왼쪽 상단), fill은 (R, G, B, A) 튜플.\r
    검증은 텍스트가 그려진 영역의 픽셀이 원본과 다른지로 합니다. 기본 폰트는 글리프가 작아 특정 한 픽셀만 찍으면 빗나갈 수 있으므로, 그리기 전후 배열 차이로 확인하는 편이 안정적입니다.\r
  tips:\r
  - 기본 폰트는 매우 작습니다. ImageFont.truetype으로 폰트와 크기를 명시하는 게 표준입니다.\r
  - ImageDraw는 in-place라 .copy()를 먼저 만들어야 원본이 보존됩니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw\r
    from sklearn.datasets import load_sample_image\r
\r
    textCanvas = Image.fromarray(load_sample_image('flower.jpg')).convert('RGBA').copy()\r
    textDraw = ImageDraw.Draw(textCanvas)\r
    textBefore = np.asarray(textCanvas).copy()\r
    textDraw.text((10, 10), '워터마크 테스트', fill=(255, 255, 255, 255))\r
\r
    textAfter = np.asarray(textCanvas)\r
    textDiff = np.abs(textAfter.astype(int) - textBefore.astype(int))\r
    {\r
        'size': textCanvas.size,\r
        'changedPixels': int((textDiff.sum(axis=2) > 0).sum()),\r
        'isLightFromWhiteText': int(textDiff.sum()) > 0,\r
    }\r
  exercise:\r
    prompt: 빨강 텍스트를 (100, 100)에 그리고 그 픽셀의 R 채널이 200 이상인지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageDraw\r
      from sklearn.datasets import load_sample_image\r
\r
      redCanvas = Image.fromarray(load_sample_image('flower.jpg')).convert('RGBA').copy()\r
      redDraw = ImageDraw.Draw(redCanvas)\r
      before = np.asarray(redCanvas).copy()\r
      redDraw.text((100, 100), 'RED', fill=(___, 0, 0, 255))\r
\r
      after = np.asarray(redCanvas)\r
      regionDiff = np.abs(after[95:125, 95:145].astype(int) - before[95:125, 95:145].astype(int))\r
      {'changedPixels': int((regionDiff.sum(axis=2) > 0).sum()), 'isRed': int(regionDiff[..., 0].sum()) > 0}\r
    hints:\r
    - 빨강 채널 값 255를 넣습니다.\r
    - 빈칸에는 255가 들어갑니다.\r
    check:\r
      noError: text 호출이 끝나야 합니다.\r
      resultCheck: isRed가 True여야 합니다.\r
  check:\r
    noError: ImageDraw.text 호출이 끝나야 합니다.\r
    resultCheck: isLightFromWhiteText가 True여야 합니다.\r
- id: step3_alpha_layer\r
  title: 3단계. 알파 레이어와 paste\r
  structuredPrimary: true\r
  subtitle: paste(layer, position, mask=layer)\r
  goal: 투명한 RGBA 레이어에 반투명 텍스트를 그리고 base.paste(layer, (0, 0), mask=layer)로 합성한 뒤 워터마크 영역의 픽셀이 베이스와 텍스트의 블렌딩으로 바뀌었는지 확인합니다.\r
  why: paste의 mask 인자가 알파 합성을 결정합니다. layer 자체를 mask로 주면 알파 채널 값에 따라 픽셀별 합성 강도가 정해집니다. 이 패턴이 반투명 워터마크의 표준 구현입니다.\r
  explanation: |-\r
    Image.new('RGBA', size, (0, 0, 0, 0))으로 완전 투명한 빈 레이어를 만듭니다. 모든 픽셀이 (0, 0, 0, 0).\r
    ImageDraw.Draw(layer).text(..., fill=(255, 255, 255, 128))로 반투명 흰 텍스트를 그립니다. 알파=128은 50% 투명.\r
    base.paste(layer, (0, 0), mask=layer)는 layer의 알파에 비례한 합성을 base에 적용합니다. base는 in-place 변경됩니다.\r
    결과 픽셀이 base와 다른지로 합성이 일어났는지 확인할 수 있습니다.\r
  tips:\r
  - paste의 mask 인자는 L 모드(단채널) 또는 RGBA(알파 채널만) Image를 받습니다. RGBA를 그대로 주면 알파 채널만 사용됩니다.\r
  - paste는 in-place로 동작합니다. base.copy()를 먼저 만들어야 원본이 보존됩니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw\r
    from sklearn.datasets import load_sample_image\r
\r
    pasteBase = Image.fromarray(load_sample_image('flower.jpg')).convert('RGBA').copy()\r
    pasteLayer = Image.new('RGBA', pasteBase.size, (0, 0, 0, 0))\r
    pasteDraw = ImageDraw.Draw(pasteLayer)\r
    pasteDraw.text((50, 50), 'WATERMARK', fill=(255, 255, 255, 128))\r
\r
    baseBefore = np.asarray(pasteBase).copy()\r
    pasteBase.paste(pasteLayer, (0, 0), mask=pasteLayer)\r
    baseAfter = np.asarray(pasteBase)\r
\r
    diff = np.abs(baseAfter.astype(int) - baseBefore.astype(int))\r
    {\r
        'shape': baseAfter.shape,\r
        'pixelChanged': int(diff.sum()) > 0,\r
        'maxDiff': int(diff.max()),\r
    }\r
  exercise:\r
    prompt: 알파 값을 64(더 투명)로 낮춰 합성하면 변화량 합이 알파=128 케이스보다 작은지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageDraw\r
      from sklearn.datasets import load_sample_image\r
\r
      sheerBase = Image.fromarray(load_sample_image('flower.jpg')).convert('RGBA').copy()\r
      sheerLayer = Image.new('RGBA', sheerBase.size, (0, 0, 0, 0))\r
      ImageDraw.Draw(sheerLayer).text((50, 50), 'SHEER', fill=(255, 255, 255, ___))\r
      before = np.asarray(sheerBase).copy()\r
      sheerBase.paste(sheerLayer, (0, 0), mask=sheerLayer)\r
      diff = int(np.abs(np.asarray(sheerBase).astype(int) - before.astype(int)).sum())\r
      {'diffSum': diff}\r
    hints:\r
    - 알파 64는 더 투명.\r
    - 빈칸에는 64가 들어갑니다.\r
    check:\r
      noError: paste 호출이 끝나야 합니다.\r
      resultCheck: diffSum이 0 이상이어야 합니다.\r
  check:\r
    noError: paste 호출과 비교가 끝나야 합니다.\r
    resultCheck: pixelChanged가 True여야 합니다.\r
- id: step4_textbbox\r
  title: 4단계. textbbox로 자동 정렬\r
  structuredPrimary: true\r
  subtitle: 우측 하단 배치\r
  goal: ImageDraw.textbbox로 텍스트 박스 크기를 측정해 우측 하단에서 padding 만큼 떨어진 위치에 자동 정렬해 그립니다.\r
  why: 워터마크는 보통 우측 하단에 배치합니다. 텍스트 크기와 이미지 크기가 다르므로 자동 정렬이 필요합니다. textbbox가 그 계산을 가능하게 합니다.\r
  explanation: |-\r
    ImageDraw.textbbox((x, y), text, font=font)는 텍스트가 차지할 (left, top, right, bottom) 박스를 돌려줍니다. 박스 크기 = (right-left, bottom-top).\r
    이미지 크기와 박스 크기, padding을 사용해 우측 하단 (이미지.W - 박스.W - padding, 이미지.H - 박스.H - padding) 좌표를 계산합니다.\r
    이 계산을 함수로 묶어 두면 다양한 텍스트 길이에 자동 적용 가능합니다.\r
  tips:\r
  - 기본 폰트의 textbbox는 폰트 크기에 따라 다른 결과를 줍니다. truetype 폰트를 쓰면 더 안정적입니다.\r
  - getbbox는 deprecated 메서드입니다. textbbox 사용이 표준입니다.\r
  snippet: |-\r
    from PIL import Image, ImageDraw\r
    from sklearn.datasets import load_sample_image\r
\r
    bboxBase = Image.fromarray(load_sample_image('flower.jpg')).convert('RGBA').copy()\r
    bboxDraw = ImageDraw.Draw(bboxBase)\r
    bboxText = '@codaro'\r
    bboxPadding = 20\r
\r
    bbox = bboxDraw.textbbox((0, 0), bboxText)\r
    textWidth = bbox[2] - bbox[0]\r
    textHeight = bbox[3] - bbox[1]\r
    posX = bboxBase.size[0] - textWidth - bboxPadding\r
    posY = bboxBase.size[1] - textHeight - bboxPadding\r
\r
    bboxDraw.text((posX, posY), bboxText, fill=(255, 255, 255, 200))\r
\r
    {\r
        'imageSize': bboxBase.size,\r
        'textBbox': bbox,\r
        'textWidth': textWidth,\r
        'textHeight': textHeight,\r
        'position': (posX, posY),\r
        'isInBottomRight': posX > bboxBase.size[0] // 2 and posY > bboxBase.size[1] // 2,\r
    }\r
  exercise:\r
    prompt: 같은 함수로 좌측 상단 (padding, padding) 위치에 워터마크를 그리세요. 박스 좌표 계산 없이 padding 두 값만 위치로 줍니다.\r
    starterCode: |-\r
      from PIL import Image, ImageDraw\r
      from sklearn.datasets import load_sample_image\r
\r
      topLeftBase = Image.fromarray(load_sample_image('flower.jpg')).convert('RGBA').copy()\r
      topLeftDraw = ImageDraw.Draw(topLeftBase)\r
      topLeftDraw.text((___, 20), 'top-left', fill=(255, 255, 255, 200))\r
      {'topLeftCorner': (20, 20)}\r
    hints:\r
    - 좌측 padding 20.\r
    - 빈칸에는 20이 들어갑니다.\r
    check:\r
      noError: text 호출이 끝나야 합니다.\r
      resultCheck: topLeftCorner가 (20, 20)이어야 합니다.\r
  check:\r
    noError: textbbox와 text 호출이 끝나야 합니다.\r
    resultCheck: isInBottomRight가 True여야 합니다.\r
- id: step5_compose\r
  title: 5단계. 합성 함수\r
  structuredPrimary: true\r
  subtitle: addWatermark\r
  goal: addWatermark(image, text, alpha, position) 함수가 입력 RGB Image에 반투명 워터마크를 합성한 RGBA 결과를 돌려주도록 만들고, alpha 값에 따라 합성 강도가 달라지는지 확인합니다.\r
  why: 워터마크 합성을 함수로 묶어 두면 어떤 이미지에든 같은 인터페이스로 적용할 수 있습니다. alpha 인자로 투명도를 조절 가능합니다.\r
  explanation: |-\r
    addWatermark는 RGB 입력을 받아 RGBA로 변환 → 텍스트 레이어 그리기 → paste 합성을 순차적으로 수행합니다. 결과는 RGBA Image.\r
    alpha 인자(0~255)로 워터마크의 투명도를 제어합니다. alpha=0은 보이지 않음, alpha=255는 완전 불투명.\r
    검증은 같은 입력에 alpha=128과 alpha=64를 적용해 결과 픽셀 변화량이 alpha에 비례하는지로 합니다.\r
  tips:\r
  - 함수 인터페이스에 fontSize 인자를 추가하면 더 유연합니다. truetype 폰트 경로도 함께.\r
  - 결과를 파일로 저장할 때는 convert('RGB')로 알파 채널을 제거합니다(JPG는 알파 불지원).\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def addWatermark(image: Image.Image, text: str, alpha: int, position: tuple) -> Image.Image:\r
        rgba = image.convert('RGBA').copy()\r
        layer = Image.new('RGBA', rgba.size, (0, 0, 0, 0))\r
        ImageDraw.Draw(layer).text(position, text, fill=(255, 255, 255, alpha))\r
        rgba.paste(layer, (0, 0), mask=layer)\r
        return rgba\r
\r
\r
    composeBase = Image.fromarray(load_sample_image('flower.jpg'))\r
    weak = addWatermark(composeBase, 'WEAK', alpha=64, position=(50, 50))\r
    strong = addWatermark(composeBase, 'STRONG', alpha=200, position=(50, 50))\r
\r
    baseArr = np.asarray(composeBase.convert('RGBA'))\r
    weakDiff = int(np.abs(np.asarray(weak).astype(int) - baseArr.astype(int)).sum())\r
    strongDiff = int(np.abs(np.asarray(strong).astype(int) - baseArr.astype(int)).sum())\r
\r
    {\r
        'weakDiff': weakDiff,\r
        'strongDiff': strongDiff,\r
        'strongerHasMoreDiff': strongDiff > weakDiff,\r
        'resultMode': weak.mode,\r
    }\r
  exercise:\r
    prompt: alpha=255 (완전 불투명) 워터마크의 변화량이 alpha=200보다 더 큰지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageDraw\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def addWatermark(image, text, alpha, position):\r
          rgba = image.convert('RGBA').copy()\r
          layer = Image.new('RGBA', rgba.size, (0, 0, 0, 0))\r
          ImageDraw.Draw(layer).text(position, text, fill=(255, 255, 255, alpha))\r
          rgba.paste(layer, (0, 0), mask=layer)\r
          return rgba\r
\r
\r
      maxBase = Image.fromarray(load_sample_image('flower.jpg'))\r
      maxResult = addWatermark(maxBase, 'MAX', alpha=___, position=(50, 50))\r
      maxDiff = int(np.abs(np.asarray(maxResult).astype(int) - np.asarray(maxBase.convert('RGBA')).astype(int)).sum())\r
      {'maxDiff': maxDiff}\r
    hints:\r
    - 완전 불투명은 255.\r
    - 빈칸에는 255가 들어갑니다.\r
    check:\r
      noError: addWatermark 정의와 호출이 끝나야 합니다.\r
      resultCheck: maxDiff가 양의 정수여야 합니다.\r
  check:\r
    noError: addWatermark 정의와 두 호출이 끝나야 합니다.\r
    resultCheck: strongerHasMoreDiff가 True여야 합니다.\r
- id: practice\r
  title: 실습 - china에 워터마크\r
  structuredPrimary: true\r
  subtitle: 다른 입력 일반화\r
  goal: 같은 addWatermark 함수를 china 사진에 적용해 결과 dict가 같은 형식으로 돌아오는지 확인합니다.\r
  why: 함수 재사용은 자동화의 핵심입니다. 같은 함수를 다른 입력에 돌려도 같은 형식 결과가 나오면 후속 처리가 일관됩니다.\r
  explanation: |-\r
    addWatermark는 입력 size에 무관하게 동작합니다. flower (640, 427)나 china (640, 427) 모두 같은 흐름을 따라 결과가 만들어집니다.\r
    실무에서는 함수에 폰트 경로, fontSize, color 인자를 추가해 유연성을 높입니다. 본 예제는 핵심 로직만 다룹니다.\r
    함수 결과는 RGBA Image이므로 PNG로 저장하면 알파가 유지됩니다. JPG로 저장하려면 convert('RGB')로 알파를 합쳐야 합니다.\r
  tips:\r
  - "워터마크 위치는 우측 하단이 표준입니다. 좌측 상단은 사용자 작업 영역을 가리는 경우가 많습니다."\r
  - 알파를 너무 작게(예 30 이하) 주면 워터마크가 거의 안 보입니다. 100~180이 적정선.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def addWatermark(image: Image.Image, text: str, alpha: int, position: tuple) -> Image.Image:\r
        rgba = image.convert('RGBA').copy()\r
        layer = Image.new('RGBA', rgba.size, (0, 0, 0, 0))\r
        ImageDraw.Draw(layer).text(position, text, fill=(255, 255, 255, alpha))\r
        rgba.paste(layer, (0, 0), mask=layer)\r
        return rgba\r
\r
\r
    chinaBase = Image.fromarray(load_sample_image('china.jpg'))\r
    chinaResult = addWatermark(chinaBase, '@photo', alpha=150, position=(500, 400))\r
\r
    {\r
        'mode': chinaResult.mode,\r
        'size': chinaResult.size,\r
        'isRGBA': chinaResult.mode == 'RGBA',\r
        'sizeMatches': chinaResult.size == chinaBase.size,\r
    }\r
  exercise:\r
    prompt: addWatermark에 alpha=0을 넘기면 입력과 거의 동일한 결과(변화량 0)가 나오는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageDraw\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def addWatermark(image, text, alpha, position):\r
          rgba = image.convert('RGBA').copy()\r
          layer = Image.new('RGBA', rgba.size, (0, 0, 0, 0))\r
          ImageDraw.Draw(layer).text(position, text, fill=(255, 255, 255, alpha))\r
          rgba.paste(layer, (0, 0), mask=layer)\r
          return rgba\r
\r
\r
      invisibleBase = Image.fromarray(load_sample_image('flower.jpg'))\r
      invisibleResult = addWatermark(invisibleBase, 'INVISIBLE', alpha=___, position=(100, 100))\r
      diff = int(np.abs(np.asarray(invisibleResult).astype(int) - np.asarray(invisibleBase.convert('RGBA')).astype(int)).sum())\r
      {'diff': diff, 'isInvisible': diff == 0}\r
    hints:\r
    - 완전 투명은 0.\r
    - 빈칸에는 0이 들어갑니다.\r
    check:\r
      noError: addWatermark 호출이 끝나야 합니다.\r
      resultCheck: isInvisible이 True여야 합니다.\r
  check:\r
    noError: addWatermark 정의와 호출이 끝나야 합니다.\r
    resultCheck: isRGBA와 sizeMatches 모두 True여야 합니다.\r
- id: workflow_validation\r
  title: 6단계. alpha 가드 + 합성 검증\r
  structuredPrimary: true\r
  subtitle: validateAlpha + 합성 강도 회귀\r
  goal: validateAlpha 함수가 0~255 범위 밖 alpha를 ValueError로 차단하고, alpha 변화에 따라 합성 강도가 단조 변화하는지 회귀 테스트로 확인합니다.\r
  why: alpha는 정확히 0~255 정수여야 의미가 있습니다. 음수나 256 이상은 paste가 조용히 잘못된 결과를 줍니다. 함수 입구 가드가 그 사고를 차단합니다.\r
  explanation: |-\r
    validateAlpha는 (1) 0 <= alpha <= 255, (2) 정수형 두 조건을 검사합니다. 둘 중 하나라도 깨지면 ValueError.\r
    회귀 테스트는 alpha=50과 alpha=200의 합성 변화량을 비교합니다. 큰 alpha가 더 큰 변화를 줘야 정상.\r
  tips:\r
  - "alpha=0은 보이지 않는 워터마크입니다. 의미 없지만 차단 대상은 아닙니다."\r
  - "ValueError 메시지에 실제 alpha를 포함시키면 호출자가 즉시 원인을 알 수 있습니다."\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw\r
\r
\r
    def validateAlpha(alpha: int) -> bool:\r
        if not isinstance(alpha, int):\r
            raise ValueError(f"alpha는 정수여야 합니다: type={type(alpha).__name__}")\r
        if not (0 <= alpha <= 255):\r
            raise ValueError(f"alpha는 0~255 범위여야 합니다: {alpha}")\r
        return True\r
\r
\r
    validImage = Image.new('RGBA', (100, 80), (255, 255, 255, 255))\r
\r
    okResult = validateAlpha(128)\r
\r
    try:\r
        validateAlpha(300)\r
        outOfRangeMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        outOfRangeMessage = str(exc)\r
\r
    try:\r
        validateAlpha(1.5)\r
        floatMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        floatMessage = str(exc)\r
\r
    {\r
        'okResult': okResult,\r
        'outOfRangeMessage': outOfRangeMessage,\r
        'floatMessage': floatMessage,\r
    }\r
  exercise:\r
    prompt: validateAlpha에 -10을 넘기면 ValueError가 잡히는지 확인하세요.\r
    starterCode: |-\r
      def validateAlpha(alpha):\r
          if not isinstance(alpha, int):\r
              raise ValueError(f"alpha는 정수여야 합니다: type={type(alpha).__name__}")\r
          if not (0 <= alpha <= 255):\r
              raise ValueError(f"alpha는 0~255 범위여야 합니다: {alpha}")\r
          return True\r
\r
\r
      try:\r
          validateAlpha(___)\r
          negMessage = 'unexpected pass'\r
      except ValueError as exc:\r
          negMessage = str(exc)\r
\r
      {'negMessage': negMessage, 'caught': '범위' in negMessage}\r
    hints:\r
    - 음수 -10.\r
    - 빈칸에는 -10이 들어갑니다.\r
    check:\r
      noError: validateAlpha 정의가 끝나야 합니다.\r
      resultCheck: caught가 True여야 합니다.\r
  check:\r
    noError: validateAlpha와 세 호출이 끝나야 합니다.\r
    resultCheck: okResult가 True이고 outOfRangeMessage에 '300', floatMessage에 'type' 단서가 포함되어야 합니다.\r
`;export{e as default};