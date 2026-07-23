var e=`meta:\r
  packages:\r
  - numpy\r
  - pillow\r
  id: pillow_08\r
  title: 도형아트생성기\r
  order: 8\r
  category: pillow\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - Pillow\r
  - ImageDraw\r
  - rectangle\r
  - ellipse\r
  - line\r
  - polygon\r
  seo:\r
    title: Pillow 중급 - 도형 아트 생성기\r
    description: Pillow ImageDraw로 rectangle/ellipse/line/polygon을 그려 합성 아트워크를 만들고 픽셀 통계로 정량 검증합니다.\r
    keywords:\r
    - Pillow\r
    - ImageDraw\r
    - 도형그리기\r
    - rectangle\r
    - ellipse\r
    - polygon\r
intro:\r
  emoji: 🎨\r
  goal: ImageDraw의 rectangle/ellipse/line/polygon 네 도형을 빈 캔버스에 그리고, 색칠된 픽셀 수와 도형 면적을 비교해 정확히 그려졌는지 검증합니다.\r
  description: Pillow ImageDraw는 컴퓨터 그래픽스의 기본 도형 그리기 API입니다. 합성 시각화, 도형 마스크 생성, 디버깅 보조에 두루 쓰입니다.\r
  direction: Image.new로 캔버스 → ImageDraw로 그리기 → 도형별 픽셀 수 검증 → 함수로 묶기.\r
  benefits:\r
  - Image.new로 색을 지정한 빈 캔버스를 만드는 흐름을 익힙니다.\r
  - rectangle/ellipse/line/polygon의 좌표 인자 형식 차이를 손으로 확인합니다.\r
  - fill과 outline의 픽셀 효과를 정량 비교합니다.\r
  - drawArt 함수로 도형 여러 개를 한 함수에 묶습니다.\r
  diagram:\r
    steps:\r
    - label: 빈 캔버스 생성\r
      detail: Image.new('RGB', size, color)로 도형 그리기 베이스 만들기.\r
    - label: rectangle 그리기\r
      detail: 두 모서리 (x1, y1, x2, y2)로 사각형 그리고 면적 검증.\r
    - label: ellipse 그리기\r
      detail: 외접 사각형 4-tuple로 원/타원 그리기.\r
    - label: line과 polygon\r
      detail: 직선과 다각형 꼭짓점 리스트 다루기.\r
    - label: 합성 아트 함수\r
      detail: 여러 도형을 한 함수로 묶어 캔버스에 그리기.\r
    runtime:\r
    - label: pillow + numpy\r
      detail: ImageDraw 결과는 NumPy로 픽셀 통계 검증.\r
    - label: 캔버스는 in-place\r
      detail: ImageDraw 그리기는 원본 캔버스를 직접 수정.\r
sections:\r
- id: step1_canvas\r
  title: 1단계. 빈 캔버스\r
  structuredPrimary: true\r
  subtitle: Image.new(mode, size, color)\r
  goal: Image.new('RGB', (400, 300), color='white')로 400×300 흰 캔버스를 만들고 size/mode/평균 픽셀 값을 확인합니다.\r
  why: 도형 그리기는 베이스 캔버스 위에서 시작합니다. Image.new의 3개 인자를 손으로 한 번 짚고 가면 다양한 모드(RGB/RGBA/L)와 색 지정 형식이 명확해집니다.\r
  explanation: |-\r
    Image.new(mode, size, color=0)은 빈 Image를 만듭니다. mode는 'RGB'/'RGBA'/'L', size는 (width, height) 튜플, color는 채우기 색입니다.\r
    color는 문자열 'white', 'red' 또는 RGB 튜플 (R, G, B)로 지정합니다. 생략 시 검정(0)입니다.\r
    흰 캔버스는 모든 픽셀이 (255, 255, 255)라 평균이 255입니다.\r
  tips:\r
  - "L 모드 캔버스는 color=0(검정) 또는 color=255(흰)을 단일 정수로 줍니다."\r
  - "RGBA는 color=(R, G, B, A) 4-tuple입니다. A=0은 완전 투명."\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw\r
\r
    board = Image.new('RGB', (400, 300), color='white')\r
    boardArr = np.asarray(board)\r
\r
    {\r
        'size': board.size,\r
        'mode': board.mode,\r
        'meanPixel': round(float(boardArr.mean()), 1),\r
        'isAllWhite': float(boardArr.mean()) == 255.0,\r
    }\r
  exercise:\r
    prompt: 검은 RGB 캔버스 (200, 200)을 만들고 mean이 0인지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
\r
      blackBoard = Image.new('RGB', (200, 200), color='___')\r
      {'mean': float(np.asarray(blackBoard).mean()), 'isBlack': float(np.asarray(blackBoard).mean()) == 0.0}\r
    hints:\r
    - 검정 색 이름.\r
    - 빈칸에는 black이 들어갑니다.\r
    check:\r
      noError: Image.new 호출이 끝나야 합니다.\r
      resultCheck: isBlack이 True여야 합니다.\r
  check:\r
    type: noError\r
    noError: Image.new와 통계 계산이 끝나야 합니다.\r
    resultCheck: size가 (400, 300), mode가 'RGB', isAllWhite가 True여야 합니다.\r
- id: step2_rectangle\r
  title: 2단계. rectangle 그리기\r
  structuredPrimary: true\r
  subtitle: (x1, y1, x2, y2) 두 모서리\r
  goal: ImageDraw.rectangle((50, 50, 150, 100), fill='red')로 사각형을 그리고 면적이 (150-50)*(100-50)=5000 픽셀인지 ndarray 통계로 검증합니다.\r
  why: rectangle의 좌표 인자는 (left, top, right, bottom) 4-tuple입니다. crop과 같은 형식이라 좌표 계산이 일관됩니다. 면적을 픽셀 수로 검증하면 좌표가 의도대로 작동했는지 확실해집니다.\r
  explanation: |-\r
    ImageDraw.Draw(image).rectangle(xy, fill, outline, width)에서 xy는 (left, top, right, bottom) 4-tuple입니다. 두 모서리가 사각형을 결정합니다.\r
    fill은 채우기 색, outline은 테두리 색입니다. fill만 주면 채워진 사각형, outline만 주면 빈 사각형, 둘 다 주면 채워진 사각형에 테두리.\r
    면적 = (right-left) * (bottom-top). 실제 빨강 픽셀 수가 그 값과 일치해야 정상 동작입니다.\r
  tips:\r
  - rectangle의 좌표는 양 끝점 모두 포함입니다. crop과 다르게 right와 bottom 픽셀도 채워집니다.\r
  - 둥근 모서리 사각형은 rounded_rectangle 메서드를 씁니다(Pillow 8.2+).\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw\r
\r
    rectCanvas = Image.new('RGB', (400, 300), color='white')\r
    ImageDraw.Draw(rectCanvas).rectangle((50, 50, 150, 100), fill='red')\r
\r
    rectArr = np.asarray(rectCanvas)\r
    redMask = (rectArr[..., 0] == 255) & (rectArr[..., 1] == 0) & (rectArr[..., 2] == 0)\r
\r
    {\r
        'redPixels': int(redMask.sum()),\r
        'expectedArea': (150 - 50 + 1) * (100 - 50 + 1),\r
        'closeToExpected': abs(int(redMask.sum()) - (150 - 50 + 1) * (100 - 50 + 1)) < 200,\r
    }\r
  exercise:\r
    prompt: (100, 100, 200, 200) 위치에 녹색 사각형을 그리고 녹색 픽셀 수를 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageDraw\r
\r
      greenCanvas = Image.new('RGB', (400, 300), color='white')\r
      ImageDraw.Draw(greenCanvas).rectangle((100, 100, 200, 200), fill='___')\r
      greenArr = np.asarray(greenCanvas)\r
      greenMask = (greenArr[..., 0] == 0) & (greenArr[..., 1] >= 128) & (greenArr[..., 2] == 0)\r
      {'greenPixels': int(greenMask.sum())}\r
    hints:\r
    - 녹색 색 이름.\r
    - 빈칸에는 green이 들어갑니다.\r
    check:\r
      noError: rectangle 호출이 끝나야 합니다.\r
      resultCheck: greenPixels가 양의 정수여야 합니다.\r
  check:\r
    type: noError\r
    noError: rectangle 호출과 마스크 계산이 끝나야 합니다.\r
    resultCheck: closeToExpected가 True여야 합니다.\r
- id: step3_ellipse\r
  title: 3단계. ellipse (원과 타원)\r
  structuredPrimary: true\r
  subtitle: 외접 사각형 4-tuple\r
  goal: ellipse((50, 50, 150, 150), fill='blue')로 원을 그리고 면적이 π·반지름² ≈ 7853에 가까운지 확인합니다.\r
  why: 원과 타원은 외접 사각형으로 정의합니다. 사각형이 정사각이면 원, 직사각이면 타원입니다. 면적을 픽셀 수로 검증하면 그리기 알고리즘이 정확한지 확인 가능합니다.\r
  explanation: |-\r
    ImageDraw.ellipse(xy, fill, outline)에서 xy는 외접 사각형의 (left, top, right, bottom)입니다.\r
    사각형이 정사각(예 (50, 50, 150, 150))이면 원이 그려지고, 직사각이면 타원이 됩니다.\r
    원의 면적은 π·반지름² ≈ 3.14159·50² ≈ 7854. Pillow의 anti-aliasing 때문에 픽셀 수는 약간 다르지만 가까운 값이 나옵니다.\r
  tips:\r
  - 정확한 원이 필요하면 outline을 함께 그리고 채워서 anti-aliasing 효과를 줄입니다.\r
  - 타원의 면적 = π·a·b (a, b는 두 반축). 가로 100, 세로 50 타원의 면적은 ≈ 7854.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw\r
\r
    ellipseCanvas = Image.new('RGB', (400, 300), color='white')\r
    ImageDraw.Draw(ellipseCanvas).ellipse((50, 50, 150, 150), fill='blue')\r
\r
    ellipseArr = np.asarray(ellipseCanvas)\r
    blueMask = (ellipseArr[..., 2] >= 128) & (ellipseArr[..., 0] < 128)\r
\r
    expectedArea = round(3.14159 * 50 * 50)\r
    {\r
        'bluePixels': int(blueMask.sum()),\r
        'expectedArea': expectedArea,\r
        'closeToExpected': abs(int(blueMask.sum()) - expectedArea) < expectedArea * 0.1,\r
    }\r
  exercise:\r
    prompt: 가로 100, 세로 50 타원을 (100, 100, 200, 150)에 그리고 면적이 π·50·25 ≈ 3927에 가까운지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageDraw\r
\r
      ovalCanvas = Image.new('RGB', (400, 300), color='white')\r
      ImageDraw.Draw(ovalCanvas).ellipse((100, 100, 200, ___), fill='red')\r
      ovalArr = np.asarray(ovalCanvas)\r
      redMask = (ovalArr[..., 0] >= 128) & (ovalArr[..., 1] < 128)\r
      {'redPixels': int(redMask.sum())}\r
    hints:\r
    - 세로 끝 좌표 150.\r
    - 빈칸에는 150이 들어갑니다.\r
    check:\r
      noError: ellipse 호출이 끝나야 합니다.\r
      resultCheck: redPixels가 양의 정수여야 합니다.\r
  check:\r
    type: noError\r
    noError: ellipse 호출과 마스크 계산이 끝나야 합니다.\r
    resultCheck: closeToExpected가 True여야 합니다.\r
- id: step4_line\r
  title: 4단계. line과 polygon\r
  structuredPrimary: true\r
  subtitle: 점 리스트 입력\r
  goal: line([(50, 50), (350, 250)], fill='black', width=3)로 직선을 그리고 polygon([(100, 50), (200, 200), (50, 200)], fill='yellow')로 삼각형을 그려 각 도형의 픽셀 분포를 확인합니다.\r
  why: line과 polygon은 점 리스트 입력입니다. rectangle/ellipse의 4-tuple과 다른 형식이라 한 번 명확히 해 두면 헷갈리지 않습니다.\r
  explanation: |-\r
    ImageDraw.line(xy, fill, width)에서 xy는 [(x1, y1), (x2, y2), ...] 점 리스트입니다. 두 점이면 직선, 더 많으면 꺾인 선.\r
    ImageDraw.polygon(xy, fill, outline)는 점 리스트로 다각형을 정의합니다. 첫 점과 마지막 점이 자동으로 연결됩니다.\r
    line의 width 인자는 선 두께(픽셀 단위)입니다. polygon에는 width 인자가 없고 outline만 있습니다.\r
  tips:\r
  - 점 리스트 입력은 [(x1, y1), (x2, y2)] 형식이 표준입니다. (x1, y1, x2, y2) 단일 튜플도 line은 받습니다.\r
  - polygon은 자동으로 첫/마지막 점을 연결합니다. 정의 시 닫지 않아도 됩니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw\r
\r
    lineCanvas = Image.new('RGB', (400, 300), color='white')\r
    lineDraw = ImageDraw.Draw(lineCanvas)\r
    lineDraw.line([(50, 50), (350, 250)], fill='black', width=3)\r
    lineDraw.polygon([(100, 50), (200, 200), (50, 200)], fill='yellow')\r
\r
    lineArr = np.asarray(lineCanvas)\r
    blackMask = (lineArr[..., 0] < 50) & (lineArr[..., 1] < 50) & (lineArr[..., 2] < 50)\r
    yellowMask = (lineArr[..., 0] > 200) & (lineArr[..., 1] > 200) & (lineArr[..., 2] < 50)\r
\r
    {\r
        'blackLinePixels': int(blackMask.sum()),\r
        'yellowTrianglePixels': int(yellowMask.sum()),\r
        'bothPresent': int(blackMask.sum()) > 0 and int(yellowMask.sum()) > 0,\r
    }\r
  exercise:\r
    prompt: 사각형 4점으로 polygon을 그리고 결과가 rectangle과 비슷한 픽셀 수를 갖는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageDraw\r
\r
      polyCanvas = Image.new('RGB', (400, 300), color='white')\r
      ImageDraw.Draw(polyCanvas).polygon([(50, 50), (150, 50), (150, 100), (50, 100)], fill='___')\r
      polyArr = np.asarray(polyCanvas)\r
      redMask = (polyArr[..., 0] > 200) & (polyArr[..., 1] < 50)\r
      {'polyPixels': int(redMask.sum())}\r
    hints:\r
    - 빨강 색.\r
    - 빈칸에는 red가 들어갑니다.\r
    check:\r
      noError: polygon 호출이 끝나야 합니다.\r
      resultCheck: polyPixels가 양의 정수여야 합니다.\r
  check:\r
    type: noError\r
    noError: line/polygon 호출이 끝나야 합니다.\r
    resultCheck: bothPresent가 True여야 합니다.\r
- id: step5_compose\r
  title: 5단계. drawArt 함수\r
  structuredPrimary: true\r
  subtitle: 여러 도형 합성\r
  goal: drawArt(canvasSize) 함수가 여러 도형을 한 함수에 묶어 새 캔버스를 만들고 결과 dict로 도형 수와 비어 있지 않은 픽셀 비율을 돌려줍니다.\r
  why: 도형 그리기를 함수로 묶어 두면 새 크기/색 인자로 같은 흐름을 재사용 가능합니다. 자동화 시각화의 표준 도구가 됩니다.\r
  explanation: |-\r
    drawArt 함수는 빈 캔버스를 만들고 여러 도형을 차례로 그립니다. 결과로 Image와 통계 dict를 돌려줍니다.\r
    "비어 있지 않은 픽셀 비율"은 배경 색이 아닌 픽셀 수 / 전체 픽셀 수입니다. 도형이 얼마나 공간을 채웠는지의 지표입니다.\r
    같은 함수를 다른 size로 호출하면 같은 구조의 아트가 비율을 유지하면서 다른 크기로 나옵니다.\r
  tips:\r
  - 도형 인자(크기, 위치, 색)를 함수 인자로 받으면 더 유연합니다.\r
  - 합성 아트를 저장하려면 canvas.save('art.png')로 PNG 파일로 내보냅니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw\r
\r
\r
    def drawArt(canvasSize: tuple) -> dict:\r
        canvas = Image.new('RGB', canvasSize, color='white')\r
        draw = ImageDraw.Draw(canvas)\r
        draw.rectangle((30, 30, 100, 80), fill='red')\r
        draw.ellipse((150, 30, 220, 100), fill='blue')\r
        draw.line([(30, 150), (220, 150)], fill='black', width=4)\r
        draw.polygon([(50, 200), (130, 250), (10, 250)], fill='green')\r
\r
        arr = np.asarray(canvas)\r
        whiteMask = (arr[..., 0] == 255) & (arr[..., 1] == 255) & (arr[..., 2] == 255)\r
        return {\r
            'size': canvas.size,\r
            'shapeCount': 4,\r
            'nonBgRatio': round(float(1 - whiteMask.mean()), 3),\r
        }\r
\r
\r
    drawArt((300, 300))\r
  exercise:\r
    prompt: drawArt((500, 400))으로 더 큰 캔버스에 호출해 nonBgRatio가 (300, 300) 케이스보다 작은지 확인하세요(같은 도형 크기에 더 넓은 캔버스).\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageDraw\r
\r
\r
      def drawArt(canvasSize):\r
          canvas = Image.new('RGB', canvasSize, color='white')\r
          draw = ImageDraw.Draw(canvas)\r
          draw.rectangle((30, 30, 100, 80), fill='red')\r
          arr = np.asarray(canvas)\r
          whiteMask = (arr[..., 0] == 255) & (arr[..., 1] == 255) & (arr[..., 2] == 255)\r
          return {'nonBgRatio': round(float(1 - whiteMask.mean()), 3)}\r
\r
\r
      smallResult = drawArt((300, 300))\r
      bigResult = drawArt((500, ___))\r
      {'small': smallResult['nonBgRatio'], 'big': bigResult['nonBgRatio'], 'smallerOnBigger': bigResult['nonBgRatio'] < smallResult['nonBgRatio']}\r
    hints:\r
    - 큰 캔버스 height 400.\r
    - 빈칸에는 400이 들어갑니다.\r
    check:\r
      noError: drawArt 정의와 호출이 끝나야 합니다.\r
      resultCheck: smallerOnBigger가 True여야 합니다.\r
  check:\r
    type: noError\r
    noError: drawArt 정의와 호출이 끝나야 합니다.\r
    resultCheck: shapeCount가 4이고 nonBgRatio가 0~1 사이여야 합니다.\r
- id: practice\r
  title: 실습 - 추상 아트 생성\r
  structuredPrimary: true\r
  subtitle: 랜덤 도형 합성\r
  goal: 시드 고정 난수로 도형 위치와 색을 정해 추상 아트를 만들고 결과 통계 dict를 돌려주는 함수를 만듭니다.\r
  why: 난수 기반 합성은 알고리즘 아트의 출발점입니다. 시드를 고정하면 같은 결과를 재현할 수 있어 단위 테스트로 활용 가능합니다.\r
  explanation: |-\r
    np.random.default_rng(seed)로 시드 고정 난수 생성기를 만듭니다. 같은 시드는 항상 같은 도형 위치/색을 생성합니다.\r
    도형 N개를 그리고 각 도형의 크기와 색을 난수로 결정합니다. 결과 함수는 nonBgRatio 같은 통계를 돌려줍니다.\r
    이 패턴은 단위 테스트와 회귀 테스트 모두에 활용됩니다.\r
  tips:\r
  - 시드가 다른 두 호출은 다른 결과를 줘야 합니다. 시드가 같으면 정확히 같은 결과를 줘야 합니다.\r
  - 도형 색은 rng.integers(0, 256, 3) 같은 형식으로 RGB 3채널을 한 번에 생성 가능합니다.\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw\r
\r
\r
    def randomArt(canvasSize: tuple, shapeCount: int, seed: int) -> dict:\r
        rng = np.random.default_rng(seed)\r
        canvas = Image.new('RGB', canvasSize, color='white')\r
        draw = ImageDraw.Draw(canvas)\r
        for _ in range(shapeCount):\r
            x = int(rng.integers(0, canvasSize[0] - 50))\r
            y = int(rng.integers(0, canvasSize[1] - 50))\r
            w = int(rng.integers(20, 60))\r
            h = int(rng.integers(20, 60))\r
            color = tuple(int(c) for c in rng.integers(0, 256, 3))\r
            draw.ellipse((x, y, x + w, y + h), fill=color)\r
        arr = np.asarray(canvas)\r
        whiteMask = (arr[..., 0] == 255) & (arr[..., 1] == 255) & (arr[..., 2] == 255)\r
        return {'shapeCount': shapeCount, 'nonBgRatio': round(float(1 - whiteMask.mean()), 3)}\r
\r
\r
    [randomArt((300, 300), 10, seed=42), randomArt((300, 300), 10, seed=42)]\r
  exercise:\r
    prompt: 같은 함수에 shapeCount=20을 주면 nonBgRatio가 10 케이스보다 크게 나오는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image, ImageDraw\r
\r
\r
      def randomArt(canvasSize, shapeCount, seed):\r
          rng = np.random.default_rng(seed)\r
          canvas = Image.new('RGB', canvasSize, color='white')\r
          draw = ImageDraw.Draw(canvas)\r
          for _ in range(shapeCount):\r
              x = int(rng.integers(0, canvasSize[0] - 50))\r
              y = int(rng.integers(0, canvasSize[1] - 50))\r
              draw.ellipse((x, y, x + 40, y + 40), fill=tuple(int(c) for c in rng.integers(0, 256, 3)))\r
          arr = np.asarray(canvas)\r
          whiteMask = (arr[..., 0] == 255) & (arr[..., 1] == 255) & (arr[..., 2] == 255)\r
          return {'nonBgRatio': round(float(1 - whiteMask.mean()), 3)}\r
\r
\r
      ten = randomArt((300, 300), 10, seed=42)\r
      twenty = randomArt((300, 300), ___, seed=42)\r
      {'ten': ten['nonBgRatio'], 'twenty': twenty['nonBgRatio'], 'biggerCovers': twenty['nonBgRatio'] > ten['nonBgRatio']}\r
    hints:\r
    - 도형 수 20.\r
    - 빈칸에는 20이 들어갑니다.\r
    check:\r
      noError: randomArt 정의와 두 호출이 끝나야 합니다.\r
      resultCheck: biggerCovers가 True여야 합니다.\r
  check:\r
    type: noError\r
    noError: randomArt 정의와 두 호출이 끝나야 합니다.\r
    resultCheck: 두 결과가 같은 형식 dict이고 shapeCount가 10이어야 합니다.\r
- id: workflow_validation\r
  title: 6단계. 도형 좌표 가드 + 픽셀 검증\r
  structuredPrimary: true\r
  subtitle: validateShapeCoords + 면적 검증\r
  goal: validateShapeCoords 함수가 좌표 순서가 잘못된 도형을 차단하고, 정상 좌표 사각형의 픽셀 수가 면적과 가까운지 회귀 테스트로 확인합니다.\r
  why: 도형 좌표는 (left, top, right, bottom) 형식에서 left<right, top<bottom이 필수입니다. 순서 어긋난 좌표는 빈 도형을 만들거나 좌표 해석이 거꾸로 됩니다.\r
  explanation: |-\r
    validateShapeCoords는 4-tuple을 받아 (1) 길이가 4인지, (2) left<right, top<bottom인지 검사합니다.\r
    회귀 테스트는 정상 사각형의 픽셀 수가 (right-left)·(bottom-top)에 가까운지로 합니다. Pillow의 anti-aliasing 때문에 정확히 같지 않을 수 있지만 가까운 값.\r
  tips:\r
  - 좌표 가드는 다른 도형 함수의 첫 줄에서 호출하면 입력 안전을 한 번에 보호합니다.\r
  - "ValueError 메시지에 실제 좌표를 포함시키면 호출자가 즉시 원인을 알 수 있습니다."\r
  snippet: |-\r
    import numpy as np\r
    from PIL import Image, ImageDraw\r
\r
\r
    def validateShapeCoords(xy: tuple) -> bool:\r
        if len(xy) != 4:\r
            raise ValueError(f"도형 좌표는 4-tuple이어야 합니다: {xy}")\r
        left, top, right, bottom = xy\r
        if left >= right or top >= bottom:\r
            raise ValueError(f"좌표 순서 오류: {xy}")\r
        return True\r
\r
\r
    okCanvas = Image.new('RGB', (300, 200), color='white')\r
    okCoords = (50, 50, 150, 100)\r
    validateShapeCoords(okCoords)\r
    ImageDraw.Draw(okCanvas).rectangle(okCoords, fill='red')\r
\r
    arr = np.asarray(okCanvas)\r
    redMask = (arr[..., 0] == 255) & (arr[..., 1] == 0)\r
\r
    try:\r
        validateShapeCoords((150, 50, 50, 100))\r
        revMsg = 'unexpected pass'\r
    except ValueError as exc:\r
        revMsg = str(exc)\r
\r
    {\r
        'redPixels': int(redMask.sum()),\r
        'expectedArea': (150 - 50 + 1) * (100 - 50 + 1),\r
        'closeToArea': abs(int(redMask.sum()) - (150 - 50 + 1) * (100 - 50 + 1)) < 300,\r
        'reversedMessage': revMsg,\r
    }\r
  exercise:\r
    prompt: validateShapeCoords에 3원소 튜플 (10, 20, 30)을 넘기면 길이 오류가 잡히는지 확인하세요.\r
    starterCode: |-\r
      def validateShapeCoords(xy):\r
          if len(xy) != 4:\r
              raise ValueError(f"도형 좌표는 4-tuple이어야 합니다: {xy}")\r
          left, top, right, bottom = xy\r
          if left >= right or top >= bottom:\r
              raise ValueError(f"좌표 순서 오류: {xy}")\r
          return True\r
\r
\r
      try:\r
          validateShapeCoords((10, 20, ___))\r
          shortMsg = 'unexpected pass'\r
      except ValueError as exc:\r
          shortMsg = str(exc)\r
\r
      {'shortMsg': shortMsg, 'hasLengthHint': '4-tuple' in shortMsg}\r
    hints:\r
    - 3원소 튜플이라 세 번째 원소만 넣습니다.\r
    - 빈칸에는 30이 들어갑니다.\r
    check:\r
      noError: validateShapeCoords 정의가 끝나야 합니다.\r
      resultCheck: hasLengthHint가 True여야 합니다.\r
  check:\r
    type: noError\r
    noError: validateShapeCoords와 rectangle 호출이 끝나야 합니다.\r
    resultCheck: closeToArea가 True이고 reversedMessage에 '순서' 단서가 포함되어야 합니다.\r
`;export{e as default};