var e=`meta:\r
  packages:\r
  - numpy\r
  - pillow\r
  - scikit-learn\r
  id: pillow_09\r
  title: 포토콜라주메이커\r
  order: 9\r
  category: pillow\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - Pillow\r
  - paste\r
  - collage\r
  - 합성\r
  - resize\r
  - 레이아웃\r
  seo:\r
    title: Pillow 심화 - 포토 콜라주 메이커\r
    description: Pillow paste/resize로 여러 이미지를 격자 레이아웃에 배치한 콜라주를 만들고 좌표/크기를 정량 검증합니다.\r
    keywords:\r
    - Pillow\r
    - 콜라주\r
    - paste\r
    - 이미지합성\r
    - 레이아웃\r
intro:\r
  emoji: 🖼️\r
  goal: 여러 이미지를 정확한 크기로 resize한 뒤 paste로 격자 위치에 배치해 콜라주를 만들고 각 셀 영역의 픽셀 평균으로 정확한 배치를 검증합니다.\r
  description: 콜라주는 여러 사진을 한 캔버스에 배치하는 작업입니다. 셀 크기 계산, 정확한 resize, 좌표 기반 paste가 핵심입니다.\r
  direction: 캔버스 생성 → 셀 크기 계산 → 이미지 resize → paste → 영역별 검증.\r
  benefits:\r
  - 캔버스를 격자로 나누는 셀 크기 계산을 손으로 짭니다.\r
  - resize로 모든 셀 이미지를 동일 크기로 통일하는 흐름을 익힙니다.\r
  - paste의 (x, y) 좌표가 좌상단 기준임을 확인합니다.\r
  - makeCollage 함수로 N×M 격자 콜라주를 한 함수에 묶습니다.\r
  diagram:\r
    steps:\r
    - label: 입력 이미지 준비\r
      detail: flower/china 두 샘플을 Image로 변환.\r
    - label: 캔버스 만들기\r
      detail: Image.new로 콜라주 베이스 캔버스.\r
    - label: 셀 크기 계산\r
      detail: 캔버스 크기 ÷ 격자 크기 = 셀 크기.\r
    - label: resize + paste\r
      detail: 각 셀에 맞춰 resize하고 좌표 위치에 paste.\r
    - label: 영역 검증\r
      detail: 각 셀 위치 픽셀 평균으로 정확한 배치 확인.\r
    runtime:\r
    - label: pillow + numpy\r
      detail: 영역 평균 계산은 NumPy로.\r
    - label: paste는 in-place\r
      detail: paste 호출은 캔버스를 직접 수정. 원본 보존에는 .copy() 필요.\r
sections:\r
- id: step1_images\r
  title: 1단계. 콜라주 소재 이미지\r
  structuredPrimary: true\r
  subtitle: 두 sklearn 샘플\r
  goal: flower와 china 두 이미지를 Image.fromarray로 변환하고 둘 다 같은 size를 가지는지 확인합니다.\r
  why: 콜라주의 입력 이미지들은 보통 크기가 다릅니다. 같은 크기로 통일해야 격자 배치가 자연스럽습니다. 첫 셀에서 입력 size를 점검합니다.\r
  explanation: |-\r
    sklearn flower와 china는 우연히 같은 (640, 427) RGB 이미지입니다. 두 입력의 size가 같다는 것을 확인하면 이후 resize 단계가 단순해집니다.\r
    실무에서는 크기가 다른 사진들이 입력으로 들어옵니다. 함수의 첫 단계에서 size를 정규화하는 게 표준 패턴입니다.\r
  tips:\r
  - 다양한 비율의 사진은 letterbox(공백 채우기)나 center crop으로 통일하는 게 일반적입니다.\r
  - "Image.size는 (width, height) 순서. NumPy shape의 (height, width, channels)와 다름에 주의."\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    flower = Image.fromarray(load_sample_image('flower.jpg'))\r
    china = Image.fromarray(load_sample_image('china.jpg'))\r
\r
    {\r
        'flowerSize': flower.size,\r
        'chinaSize': china.size,\r
        'sameSize': flower.size == china.size,\r
    }\r
  exercise:\r
    prompt: 두 이미지의 mode가 모두 'RGB'인지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      flower = Image.fromarray(load_sample_image('flower.jpg'))\r
      china = Image.fromarray(load_sample_image('china.jpg'))\r
      {'sameMode': flower.mode == china.mode and flower.mode == '___'}\r
    hints:\r
    - RGB mode.\r
    - 빈칸에는 RGB가 들어갑니다.\r
    check:\r
      noError: load 호출이 끝나야 합니다.\r
      resultCheck: sameMode가 True여야 합니다.\r
  check:\r
    noError: load_sample_image와 fromarray가 끝나야 합니다.\r
    resultCheck: sameSize가 True여야 합니다.\r
- id: step2_canvas\r
  title: 2단계. 콜라주 캔버스\r
  structuredPrimary: true\r
  subtitle: 격자 크기 결정\r
  goal: 800×600 흰 캔버스를 만들고, 2×2 격자라면 각 셀이 400×300이 되는 계산을 명시적으로 짭니다.\r
  why: 콜라주 캔버스는 N×M 격자로 나뉩니다. 셀 크기 = 캔버스 크기 ÷ 격자 크기. 이 계산을 정확히 해야 셀이 캔버스를 빈틈없이 채웁니다.\r
  explanation: |-\r
    Image.new('RGB', (canvasWidth, canvasHeight), color='white')로 흰 캔버스를 만듭니다.\r
    셀 크기 = (canvasWidth // gridCols, canvasHeight // gridRows). 격자가 2×2면 셀 크기는 캔버스의 절반.\r
    캔버스 크기가 격자로 나누어떨어지지 않으면 일부 픽셀이 남습니다. 정확한 격자를 위해 (gridRows × cellHeight, gridCols × cellWidth)로 캔버스 크기를 역산하는 게 안전합니다.\r
  tips:\r
  - 셀 사이에 간격(padding)을 두려면 셀 크기를 약간 줄이고 paste 위치를 조정합니다.\r
  - 격자 안에서 셀별로 다른 비율이 필요하면 격자 외에 명시적 셀 좌표가 필요합니다.\r
  snippet: |-\r
    from PIL import Image\r
\r
    canvasWidth = 800\r
    canvasHeight = 600\r
    gridRows = 2\r
    gridCols = 2\r
\r
    canvas = Image.new('RGB', (canvasWidth, canvasHeight), color='white')\r
    cellWidth = canvasWidth // gridCols\r
    cellHeight = canvasHeight // gridRows\r
\r
    {\r
        'canvasSize': canvas.size,\r
        'gridShape': (gridRows, gridCols),\r
        'cellSize': (cellWidth, cellHeight),\r
        'fillsExactly': gridRows * cellHeight == canvasHeight and gridCols * cellWidth == canvasWidth,\r
    }\r
  exercise:\r
    prompt: 3×3 격자로 (900, 600) 캔버스를 만들면 셀 크기가 (300, 200)인지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
\r
      threeCanvas = Image.new('RGB', (900, 600), color='white')\r
      threeCellWidth = 900 // ___\r
      threeCellHeight = 600 // 3\r
      {'cellSize': (threeCellWidth, threeCellHeight), 'isCorrect': (threeCellWidth, threeCellHeight) == (300, 200)}\r
    hints:\r
    - 격자 열 수 3.\r
    - 빈칸에는 3이 들어갑니다.\r
    check:\r
      noError: Image.new 호출이 끝나야 합니다.\r
      resultCheck: isCorrect가 True여야 합니다.\r
  check:\r
    noError: Image.new와 계산이 끝나야 합니다.\r
    resultCheck: cellSize가 (400, 300), fillsExactly가 True여야 합니다.\r
- id: step3_resize\r
  title: 3단계. 셀 크기에 맞춰 resize\r
  structuredPrimary: true\r
  subtitle: 모든 입력을 같은 크기로\r
  goal: flower와 china를 cellWidth×cellHeight로 resize하고 결과가 모두 같은 size인지 확인합니다.\r
  why: paste 호출 시 셀 크기보다 큰 이미지는 넘쳐서 다른 셀을 덮습니다. 정확한 셀 크기로 resize해야 격자가 깔끔합니다.\r
  explanation: |-\r
    Image.resize((width, height))는 정확한 크기로 변환합니다. 비율을 무시하므로 입력 비율이 셀 비율과 다르면 약간 왜곡됩니다.\r
    비율 유지 + 정확 크기가 필요하면 ImageOps.fit 같은 헬퍼를 씁니다. 본 예제는 단순화를 위해 직접 resize를 사용합니다.\r
    검증은 모든 셀 이미지의 size가 (cellWidth, cellHeight)와 같은지로 합니다.\r
  tips:\r
  - ImageOps.fit(image, size)는 비율 유지 + 중앙 crop을 자동으로 해 줘 콜라주에 적합합니다.\r
  - resize 인자는 (width, height) 순서. cellWidth가 먼저 옵니다.\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    canvasWidth, canvasHeight = 800, 600\r
    gridRows, gridCols = 2, 2\r
    cellWidth = canvasWidth // gridCols\r
    cellHeight = canvasHeight // gridRows\r
\r
    flower = Image.fromarray(load_sample_image('flower.jpg'))\r
    china = Image.fromarray(load_sample_image('china.jpg'))\r
\r
    flowerCell = flower.resize((cellWidth, cellHeight))\r
    chinaCell = china.resize((cellWidth, cellHeight))\r
\r
    {\r
        'cellSize': (cellWidth, cellHeight),\r
        'flowerCellSize': flowerCell.size,\r
        'chinaCellSize': chinaCell.size,\r
        'allMatch': flowerCell.size == (cellWidth, cellHeight) == chinaCell.size,\r
    }\r
  exercise:\r
    prompt: cell 크기를 (200, 150)으로 작게 잡아 resize하고 결과 size가 정확한지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      smallFlower = Image.fromarray(load_sample_image('flower.jpg')).resize((200, ___))\r
      {'size': smallFlower.size, 'isExact': smallFlower.size == (200, 150)}\r
    hints:\r
    - cell 높이 150.\r
    - 빈칸에는 150이 들어갑니다.\r
    check:\r
      noError: resize 호출이 끝나야 합니다.\r
      resultCheck: isExact가 True여야 합니다.\r
  check:\r
    noError: resize 두 호출이 끝나야 합니다.\r
    resultCheck: allMatch가 True여야 합니다.\r
- id: step4_paste\r
  title: 4단계. paste로 격자 배치\r
  structuredPrimary: true\r
  subtitle: 4개 셀에 이미지 붙이기\r
  goal: 2×2 격자의 4개 셀에 (flower, china, china, flower) 순서로 이미지를 paste하고 각 셀 영역의 평균이 입력 이미지의 평균에 가까운지 확인합니다.\r
  why: paste의 (x, y) 좌표가 좌상단 기준임을 한 번 명확히 해 두면 더 큰 격자에서도 좌표 계산이 자연스럽습니다.\r
  explanation: |-\r
    canvas.paste(image, (x, y))는 image의 좌상단을 (x, y) 위치에 놓고 붙입니다. image의 size만큼 영역이 덮입니다.\r
    2×2 격자에서 좌표는 (0, 0), (cellWidth, 0), (0, cellHeight), (cellWidth, cellHeight) 네 위치입니다.\r
    검증은 각 셀 영역 (y:y+cellHeight, x:x+cellWidth)의 평균 픽셀이 원본 이미지의 평균과 비슷한지로 합니다.\r
  tips:\r
  - paste는 in-place로 동작. canvas.copy()를 먼저 만들면 안전합니다.\r
  - paste에 mask 인자를 주면 알파 합성. 본 예제는 단순 덮어쓰기.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    canvasWidth, canvasHeight = 800, 600\r
    cellWidth = canvasWidth // 2\r
    cellHeight = canvasHeight // 2\r
\r
    flower = Image.fromarray(load_sample_image('flower.jpg'))\r
    china = Image.fromarray(load_sample_image('china.jpg'))\r
    flowerCell = flower.resize((cellWidth, cellHeight))\r
    chinaCell = china.resize((cellWidth, cellHeight))\r
\r
    canvas = Image.new('RGB', (canvasWidth, canvasHeight), color='white')\r
    canvas.paste(flowerCell, (0, 0))\r
    canvas.paste(chinaCell, (cellWidth, 0))\r
    canvas.paste(chinaCell, (0, cellHeight))\r
    canvas.paste(flowerCell, (cellWidth, cellHeight))\r
\r
    arr = np.asarray(canvas)\r
    topLeftMean = float(arr[0:cellHeight, 0:cellWidth].mean())\r
    bottomRightMean = float(arr[cellHeight:, cellWidth:].mean())\r
    flowerMean = float(np.asarray(flowerCell).mean())\r
\r
    {\r
        'canvasSize': canvas.size,\r
        'topLeftMean': round(topLeftMean, 2),\r
        'bottomRightMean': round(bottomRightMean, 2),\r
        'flowerMean': round(flowerMean, 2),\r
        'topLeftMatchesFlower': abs(topLeftMean - flowerMean) < 5,\r
    }\r
  exercise:\r
    prompt: 4개 셀 모두에 flowerCell을 paste해 4개 영역의 평균이 모두 flowerMean과 비슷한지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      canvasWidth, canvasHeight = 800, 600\r
      cellWidth = canvasWidth // 2\r
      cellHeight = canvasHeight // 2\r
\r
      flower = Image.fromarray(load_sample_image('flower.jpg')).resize((cellWidth, cellHeight))\r
      uniformCanvas = Image.new('RGB', (canvasWidth, canvasHeight), color='white')\r
      for x in [0, cellWidth]:\r
          for y in [0, ___]:\r
              uniformCanvas.paste(flower, (x, y))\r
\r
      arr = np.asarray(uniformCanvas)\r
      flowerMean = float(np.asarray(flower).mean())\r
      diff = abs(float(arr.mean()) - flowerMean)\r
      {'diff': round(diff, 2), 'isUniform': diff < 2}\r
    hints:\r
    - 두 번째 y 좌표 cellHeight.\r
    - 빈칸에는 cellHeight가 들어갑니다.\r
    check:\r
      noError: paste 호출이 끝나야 합니다.\r
      resultCheck: isUniform이 True여야 합니다.\r
  check:\r
    noError: paste 네 호출이 끝나야 합니다.\r
    resultCheck: topLeftMatchesFlower가 True여야 합니다.\r
- id: step5_makecollage\r
  title: 5단계. makeCollage 함수\r
  structuredPrimary: true\r
  subtitle: N×M 격자 일반화\r
  goal: makeCollage(images, gridShape, canvasSize) 함수가 임의 격자 크기에 이미지들을 자동 배치하도록 만들고 결과 size가 의도한 캔버스 크기인지 확인합니다.\r
  why: 콜라주 함수를 일반화하면 2×2 외에도 3×3, 4×2 같은 다양한 레이아웃을 같은 함수로 다룰 수 있습니다. 자동화의 표준 도구.\r
  explanation: |-\r
    makeCollage는 images 리스트와 gridShape (rows, cols)을 받아 자동으로 셀 크기를 계산하고 이미지를 차례로 배치합니다.\r
    images 길이는 rows × cols여야 합니다. 부족하면 일부 셀이 빈 채로, 많으면 초과분은 무시.\r
    셀 인덱스 i에서 row = i // cols, col = i % cols, 좌표는 (col × cellWidth, row × cellHeight).\r
  tips:\r
  - 함수가 부족한 이미지 입력에 RuntimeError를 던지면 자동화 호출자가 즉시 알 수 있습니다.\r
  - 셀 간 padding을 인자로 받으면 더 다양한 레이아웃이 가능합니다.\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def makeCollage(images: list, gridShape: tuple, canvasSize: tuple) -> Image.Image:\r
        rows, cols = gridShape\r
        canvasWidth, canvasHeight = canvasSize\r
        cellWidth = canvasWidth // cols\r
        cellHeight = canvasHeight // rows\r
        canvas = Image.new('RGB', canvasSize, color='white')\r
        for i, img in enumerate(images):\r
            if i >= rows * cols:\r
                break\r
            r, c = i // cols, i % cols\r
            resized = img.resize((cellWidth, cellHeight))\r
            canvas.paste(resized, (c * cellWidth, r * cellHeight))\r
        return canvas\r
\r
\r
    flower = Image.fromarray(load_sample_image('flower.jpg'))\r
    china = Image.fromarray(load_sample_image('china.jpg'))\r
\r
    collage22 = makeCollage([flower, china, china, flower], (2, 2), (800, 600))\r
    collage33 = makeCollage([flower] * 9, (3, 3), (900, 600))\r
\r
    {\r
        'collage22Size': collage22.size,\r
        'collage33Size': collage33.size,\r
        'isCorrect22': collage22.size == (800, 600),\r
        'isCorrect33': collage33.size == (900, 600),\r
    }\r
  exercise:\r
    prompt: makeCollage로 1×3 가로 격자 콜라주를 (900, 300) 캔버스로 만들고 셀 너비가 300인지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def makeCollage(images, gridShape, canvasSize):\r
          rows, cols = gridShape\r
          canvasWidth, canvasHeight = canvasSize\r
          cellWidth = canvasWidth // cols\r
          cellHeight = canvasHeight // rows\r
          canvas = Image.new('RGB', canvasSize, color='white')\r
          for i, img in enumerate(images):\r
              if i >= rows * cols:\r
                  break\r
              r, c = i // cols, i % cols\r
              canvas.paste(img.resize((cellWidth, cellHeight)), (c * cellWidth, r * cellHeight))\r
          return canvas\r
\r
\r
      flower = Image.fromarray(load_sample_image('flower.jpg'))\r
      banner = makeCollage([flower, flower, flower], (1, ___), (900, 300))\r
      {'size': banner.size, 'isBanner': banner.size == (900, 300)}\r
    hints:\r
    - 가로 격자 열 수 3.\r
    - 빈칸에는 3이 들어갑니다.\r
    check:\r
      noError: makeCollage 호출이 끝나야 합니다.\r
      resultCheck: isBanner가 True여야 합니다.\r
  check:\r
    noError: makeCollage 정의와 두 호출이 끝나야 합니다.\r
    resultCheck: isCorrect22와 isCorrect33 모두 True여야 합니다.\r
- id: practice\r
  title: 실습 - 영역 평균 검증\r
  structuredPrimary: true\r
  subtitle: 셀별 통계 분리\r
  goal: 2×2 콜라주의 4개 셀 영역 평균을 NumPy 슬라이싱으로 측정해 각 셀이 의도한 이미지인지 확인하는 검증 함수를 만듭니다.\r
  why: 셀 영역 통계는 콜라주가 정확히 배치됐는지의 직관적 검증 도구입니다. 자동화에서 회귀 테스트로 활용 가능합니다.\r
  explanation: |-\r
    arr[y1:y2, x1:x2].mean()으로 영역 평균을 계산합니다. 2×2 콜라주의 네 영역은 (0:cellH, 0:cellW), (0:cellH, cellW:), (cellH:, 0:cellW), (cellH:, cellW:).\r
    각 영역의 평균을 dict로 정리하면 어느 셀에 어떤 이미지가 들어갔는지 확인 가능합니다.\r
    같은 이미지를 모든 셀에 paste하면 네 영역 평균이 거의 동일해야 합니다.\r
  tips:\r
  - "NumPy 슬라이싱은 [y1:y2, x1:x2] 순서. Pillow의 (x, y)와 반대."\r
  - 영역 평균은 회귀 테스트로 활용. 콜라주 알고리즘 변경 후 다른 결과가 나오면 회귀.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def cellMeans(canvas: Image.Image, gridShape: tuple) -> list:\r
        arr = np.asarray(canvas)\r
        rows, cols = gridShape\r
        canvasWidth, canvasHeight = canvas.size\r
        cellWidth = canvasWidth // cols\r
        cellHeight = canvasHeight // rows\r
        means = []\r
        for r in range(rows):\r
            for c in range(cols):\r
                region = arr[r * cellHeight:(r + 1) * cellHeight, c * cellWidth:(c + 1) * cellWidth]\r
                means.append(round(float(region.mean()), 2))\r
        return means\r
\r
\r
    flower = Image.fromarray(load_sample_image('flower.jpg'))\r
    canvas = Image.new('RGB', (800, 600), color='white')\r
    for r in range(2):\r
        for c in range(2):\r
            canvas.paste(flower.resize((400, 300)), (c * 400, r * 300))\r
\r
    means = cellMeans(canvas, (2, 2))\r
    {\r
        'cellCount': len(means),\r
        'means': means,\r
        'allClose': max(means) - min(means) < 2,\r
    }\r
  exercise:\r
    prompt: 같은 함수를 3×3 격자에 적용해 9개 셀 평균을 측정하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def cellMeans(canvas, gridShape):\r
          arr = np.asarray(canvas)\r
          rows, cols = gridShape\r
          canvasWidth, canvasHeight = canvas.size\r
          cellWidth = canvasWidth // cols\r
          cellHeight = canvasHeight // rows\r
          means = []\r
          for r in range(rows):\r
              for c in range(cols):\r
                  region = arr[r * cellHeight:(r + 1) * cellHeight, c * cellWidth:(c + 1) * cellWidth]\r
                  means.append(round(float(region.mean()), 2))\r
          return means\r
\r
\r
      flower = Image.fromarray(load_sample_image('flower.jpg'))\r
      canvas33 = Image.new('RGB', (900, 600), color='white')\r
      cellW33 = 900 // 3\r
      cellH33 = 600 // ___\r
      for r in range(3):\r
          for c in range(3):\r
              canvas33.paste(flower.resize((cellW33, cellH33)), (c * cellW33, r * cellH33))\r
\r
      means33 = cellMeans(canvas33, (3, 3))\r
      {'count': len(means33), 'isNine': len(means33) == 9}\r
    hints:\r
    - 격자 행 수 3.\r
    - 빈칸에는 3이 들어갑니다.\r
    check:\r
      noError: cellMeans와 paste가 끝나야 합니다.\r
      resultCheck: isNine이 True여야 합니다.\r
  check:\r
    noError: cellMeans 정의와 호출이 끝나야 합니다.\r
    resultCheck: cellCount가 4이고 allClose가 True여야 합니다.\r
- id: workflow_validation\r
  title: 6단계. 격자 일관성 가드\r
  structuredPrimary: true\r
  subtitle: 이미지 수와 격자 일치 검증\r
  goal: validateCollageInput 함수가 이미지 수와 격자 크기의 곱이 일치하는지 검증하고, 정상 입력에서 결과 크기가 캔버스와 같은지 확인합니다.\r
  why: makeCollage에 부족하거나 많은 이미지를 넘기면 일부 셀이 비거나 무시됩니다. 함수 입구에서 검증하면 자동화 사고를 막을 수 있습니다.\r
  explanation: |-\r
    validateCollageInput은 (1) gridShape이 길이 2 tuple, (2) len(images) == rows × cols 두 조건을 검사합니다.\r
    잘못된 입력이면 ValueError에 실제 이미지 수와 격자 크기를 메시지에 포함시켜 호출자가 즉시 원인을 알 수 있게 합니다.\r
  tips:\r
  - 정상 입력에 collage size가 캔버스 size와 일치하는지를 회귀 테스트로 둡니다.\r
  - 결과 크기는 항상 캔버스 크기와 같습니다. 다르면 makeCollage에 버그.\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def validateCollageInput(images: list, gridShape: tuple) -> bool:\r
        if len(gridShape) != 2:\r
            raise ValueError(f"gridShape는 (rows, cols) 2-tuple이어야 합니다: {gridShape}")\r
        rows, cols = gridShape\r
        if len(images) != rows * cols:\r
            raise ValueError(f"이미지 수({len(images)})와 격자 크기({rows*cols}) 불일치")\r
        return True\r
\r
\r
    flower = Image.fromarray(load_sample_image('flower.jpg'))\r
    china = Image.fromarray(load_sample_image('china.jpg'))\r
\r
    okResult = validateCollageInput([flower, china, china, flower], (2, 2))\r
\r
    try:\r
        validateCollageInput([flower, china], (2, 2))\r
        shortMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        shortMessage = str(exc)\r
\r
    try:\r
        validateCollageInput([flower] * 4, (2, 2, 1))\r
        wrongShapeMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        wrongShapeMessage = str(exc)\r
\r
    {\r
        'okResult': okResult,\r
        'shortMessage': shortMessage,\r
        'wrongShapeMessage': wrongShapeMessage,\r
    }\r
  exercise:\r
    prompt: validateCollageInput에 5개 이미지와 (2, 2) 격자를 넘기면 길이 불일치 오류가 잡히는지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def validateCollageInput(images, gridShape):\r
          if len(gridShape) != 2:\r
              raise ValueError(f"gridShape는 (rows, cols) 2-tuple이어야 합니다: {gridShape}")\r
          rows, cols = gridShape\r
          if len(images) != rows * cols:\r
              raise ValueError(f"이미지 수({len(images)})와 격자 크기({rows*cols}) 불일치")\r
          return True\r
\r
\r
      img = Image.fromarray(load_sample_image('flower.jpg'))\r
      try:\r
          validateCollageInput([img] * ___, (2, 2))\r
          msg = 'unexpected pass'\r
      except ValueError as exc:\r
          msg = str(exc)\r
\r
      {'msg': msg, 'hasMismatch': '불일치' in msg}\r
    hints:\r
    - 5개 이미지를 만듭니다.\r
    - 빈칸에는 5가 들어갑니다.\r
    check:\r
      noError: validateCollageInput 정의가 끝나야 합니다.\r
      resultCheck: hasMismatch가 True여야 합니다.\r
  check:\r
    noError: validateCollageInput과 호출들이 끝나야 합니다.\r
    resultCheck: okResult가 True이고 shortMessage에 '불일치', wrongShapeMessage에 '2-tuple' 단서가 포함되어야 합니다.\r
`;export{e as default};