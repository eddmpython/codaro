var e=`meta:
  packages:
  - numpy
  - pillow
  id: pillow_08
  title: 도형아트생성기
  order: 8
  category: pillow
  difficulty: ⭐⭐⭐
  badge: 중급
  tags:
  - Pillow
  - ImageDraw
  - rectangle
  - ellipse
  - line
  - polygon
  seo:
    title: Pillow 중급 - 도형 아트 생성기
    description: Pillow ImageDraw로 rectangle/ellipse/line/polygon을 그려 합성 아트워크를 만들고 픽셀 통계로 정량 검증합니다.
    keywords:
    - Pillow
    - ImageDraw
    - 도형그리기
    - rectangle
    - ellipse
    - polygon
intro:
  emoji: 🎨
  goal: ImageDraw의 rectangle/ellipse/line/polygon 네 도형을 빈 캔버스에 그리고, 색칠된 픽셀 수와 도형 면적을 비교해 정확히 그려졌는지 검증합니다.
  description: Pillow ImageDraw는 컴퓨터 그래픽스의 기본 도형 그리기 API입니다. 합성 시각화, 도형 마스크 생성, 디버깅 보조에 두루 쓰입니다.
  direction: Image.new로 캔버스 → ImageDraw로 그리기 → 도형별 픽셀 수 검증 → 함수로 묶기.
  benefits:
  - Image.new로 색을 지정한 빈 캔버스를 만드는 흐름을 익힙니다.
  - rectangle/ellipse/line/polygon의 좌표 인자 형식 차이를 손으로 확인합니다.
  - fill과 outline의 픽셀 효과를 정량 비교합니다.
  - drawArt 함수로 도형 여러 개를 한 함수에 묶습니다.
  diagram:
    steps:
    - label: 빈 캔버스 생성
      detail: Image.new('RGB', size, color)로 도형 그리기 베이스 만들기.
    - label: rectangle 그리기
      detail: 두 모서리 (x1, y1, x2, y2)로 사각형 그리고 면적 검증.
    - label: ellipse 그리기
      detail: 외접 사각형 4-tuple로 원/타원 그리기.
    - label: line과 polygon
      detail: 직선과 다각형 꼭짓점 리스트 다루기.
    - label: 합성 아트 함수
      detail: 여러 도형을 한 함수로 묶어 캔버스에 그리기.
    runtime:
    - label: pillow + numpy
      detail: ImageDraw 결과는 NumPy로 픽셀 통계 검증.
    - label: 캔버스는 in-place
      detail: ImageDraw 그리기는 원본 캔버스를 직접 수정.
sections:
- id: step1_canvas
  title: 1단계. 빈 캔버스
  structuredPrimary: true
  subtitle: Image.new(mode, size, color)
  goal: Image.new('RGB', (400, 300), color='white')로 400×300 흰 캔버스를 만들고 size/mode/평균 픽셀 값을 확인합니다.
  why: 도형 그리기는 베이스 캔버스 위에서 시작합니다. Image.new의 3개 인자를 손으로 한 번 짚고 가면 다양한 모드(RGB/RGBA/L)와 색 지정 형식이 명확해집니다.
  explanation: |-
    Image.new(mode, size, color=0)은 빈 Image를 만듭니다. mode는 'RGB'/'RGBA'/'L', size는 (width, height) 튜플, color는 채우기 색입니다.
    color는 문자열 'white', 'red' 또는 RGB 튜플 (R, G, B)로 지정합니다. 생략 시 검정(0)입니다.
    흰 캔버스는 모든 픽셀이 (255, 255, 255)라 평균이 255입니다.
  tips:
  - "L 모드 캔버스는 color=0(검정) 또는 color=255(흰)을 단일 정수로 줍니다."
  - "RGBA는 color=(R, G, B, A) 4-tuple입니다. A=0은 완전 투명."
  snippet: |-
    import numpy as np
    from PIL import Image, ImageDraw

    board = Image.new('RGB', (400, 300), color='white')
    boardArr = np.asarray(board)

    {
        'size': board.size,
        'mode': board.mode,
        'meanPixel': round(float(boardArr.mean()), 1),
        'isAllWhite': float(boardArr.mean()) == 255.0,
    }
  exercise:
    prompt: 검은 RGB 캔버스 (200, 200)을 만들고 mean이 0인지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image

      blackBoard = Image.new('RGB', (200, 200), color='___')
      {'mean': float(np.asarray(blackBoard).mean()), 'isBlack': float(np.asarray(blackBoard).mean()) == 0.0}
    hints:
    - 검정 색 이름.
    - 빈칸에는 black이 들어갑니다.
    check:
      noError: Image.new 호출이 끝나야 합니다.
      resultCheck: isBlack이 True여야 합니다.
  check:
    type: noError
    noError: Image.new와 통계 계산이 끝나야 합니다.
    resultCheck: size가 (400, 300), mode가 'RGB', isAllWhite가 True여야 합니다.
- id: step2_rectangle
  title: 2단계. rectangle 그리기
  structuredPrimary: true
  subtitle: (x1, y1, x2, y2) 두 모서리
  goal: ImageDraw.rectangle((50, 50, 150, 100), fill='red')로 사각형을 그리고 면적이 (150-50)*(100-50)=5000 픽셀인지 ndarray 통계로 검증합니다.
  why: rectangle의 좌표 인자는 (left, top, right, bottom) 4-tuple입니다. crop과 같은 형식이라 좌표 계산이 일관됩니다. 면적을 픽셀 수로 검증하면 좌표가 의도대로 작동했는지 확실해집니다.
  explanation: |-
    ImageDraw.Draw(image).rectangle(xy, fill, outline, width)에서 xy는 (left, top, right, bottom) 4-tuple입니다. 두 모서리가 사각형을 결정합니다.
    fill은 채우기 색, outline은 테두리 색입니다. fill만 주면 채워진 사각형, outline만 주면 빈 사각형, 둘 다 주면 채워진 사각형에 테두리.
    면적 = (right-left) * (bottom-top). 실제 빨강 픽셀 수가 그 값과 일치해야 정상 동작입니다.
  tips:
  - rectangle의 좌표는 양 끝점 모두 포함입니다. crop과 다르게 right와 bottom 픽셀도 채워집니다.
  - 둥근 모서리 사각형은 rounded_rectangle 메서드를 씁니다(Pillow 8.2+).
  snippet: |-
    import numpy as np
    from PIL import Image, ImageDraw

    rectCanvas = Image.new('RGB', (400, 300), color='white')
    ImageDraw.Draw(rectCanvas).rectangle((50, 50, 150, 100), fill='red')

    rectArr = np.asarray(rectCanvas)
    redMask = (rectArr[..., 0] == 255) & (rectArr[..., 1] == 0) & (rectArr[..., 2] == 0)

    {
        'redPixels': int(redMask.sum()),
        'expectedArea': (150 - 50 + 1) * (100 - 50 + 1),
        'closeToExpected': abs(int(redMask.sum()) - (150 - 50 + 1) * (100 - 50 + 1)) < 200,
    }
  exercise:
    prompt: (100, 100, 200, 200) 위치에 녹색 사각형을 그리고 녹색 픽셀 수를 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageDraw

      greenCanvas = Image.new('RGB', (400, 300), color='white')
      ImageDraw.Draw(greenCanvas).rectangle((100, 100, 200, 200), fill='___')
      greenArr = np.asarray(greenCanvas)
      greenMask = (greenArr[..., 0] == 0) & (greenArr[..., 1] >= 128) & (greenArr[..., 2] == 0)
      {'greenPixels': int(greenMask.sum())}
    hints:
    - 녹색 색 이름.
    - 빈칸에는 green이 들어갑니다.
    check:
      noError: rectangle 호출이 끝나야 합니다.
      resultCheck: greenPixels가 양의 정수여야 합니다.
  check:
    type: noError
    noError: rectangle 호출과 마스크 계산이 끝나야 합니다.
    resultCheck: closeToExpected가 True여야 합니다.
- id: step3_ellipse
  title: 3단계. ellipse (원과 타원)
  structuredPrimary: true
  subtitle: 외접 사각형 4-tuple
  goal: ellipse((50, 50, 150, 150), fill='blue')로 원을 그리고 면적이 π·반지름² ≈ 7853에 가까운지 확인합니다.
  why: 원과 타원은 외접 사각형으로 정의합니다. 사각형이 정사각이면 원, 직사각이면 타원입니다. 면적을 픽셀 수로 검증하면 그리기 알고리즘이 정확한지 확인 가능합니다.
  explanation: |-
    ImageDraw.ellipse(xy, fill, outline)에서 xy는 외접 사각형의 (left, top, right, bottom)입니다.
    사각형이 정사각(예 (50, 50, 150, 150))이면 원이 그려지고, 직사각이면 타원이 됩니다.
    원의 면적은 π·반지름² ≈ 3.14159·50² ≈ 7854. Pillow의 anti-aliasing 때문에 픽셀 수는 약간 다르지만 가까운 값이 나옵니다.
  tips:
  - 정확한 원이 필요하면 outline을 함께 그리고 채워서 anti-aliasing 효과를 줄입니다.
  - 타원의 면적 = π·a·b (a, b는 두 반축). 가로 100, 세로 50 타원의 면적은 ≈ 7854.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageDraw

    ellipseCanvas = Image.new('RGB', (400, 300), color='white')
    ImageDraw.Draw(ellipseCanvas).ellipse((50, 50, 150, 150), fill='blue')

    ellipseArr = np.asarray(ellipseCanvas)
    blueMask = (ellipseArr[..., 2] >= 128) & (ellipseArr[..., 0] < 128)

    expectedArea = round(3.14159 * 50 * 50)
    {
        'bluePixels': int(blueMask.sum()),
        'expectedArea': expectedArea,
        'closeToExpected': abs(int(blueMask.sum()) - expectedArea) < expectedArea * 0.1,
    }
  exercise:
    prompt: 가로 100, 세로 50 타원을 (100, 100, 200, 150)에 그리고 면적이 π·50·25 ≈ 3927에 가까운지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageDraw

      ovalCanvas = Image.new('RGB', (400, 300), color='white')
      ImageDraw.Draw(ovalCanvas).ellipse((100, 100, 200, ___), fill='red')
      ovalArr = np.asarray(ovalCanvas)
      redMask = (ovalArr[..., 0] >= 128) & (ovalArr[..., 1] < 128)
      {'redPixels': int(redMask.sum())}
    hints:
    - 세로 끝 좌표 150.
    - 빈칸에는 150이 들어갑니다.
    check:
      noError: ellipse 호출이 끝나야 합니다.
      resultCheck: redPixels가 양의 정수여야 합니다.
  check:
    type: noError
    noError: ellipse 호출과 마스크 계산이 끝나야 합니다.
    resultCheck: closeToExpected가 True여야 합니다.
- id: step4_line
  title: 4단계. line과 polygon
  structuredPrimary: true
  subtitle: 점 리스트 입력
  goal: line([(50, 50), (350, 250)], fill='black', width=3)로 직선을 그리고 polygon([(100, 50), (200, 200), (50, 200)], fill='yellow')로 삼각형을 그려 각 도형의 픽셀 분포를 확인합니다.
  why: line과 polygon은 점 리스트 입력입니다. rectangle/ellipse의 4-tuple과 다른 형식이라 한 번 명확히 해 두면 헷갈리지 않습니다.
  explanation: |-
    ImageDraw.line(xy, fill, width)에서 xy는 [(x1, y1), (x2, y2), ...] 점 리스트입니다. 두 점이면 직선, 더 많으면 꺾인 선.
    ImageDraw.polygon(xy, fill, outline)는 점 리스트로 다각형을 정의합니다. 첫 점과 마지막 점이 자동으로 연결됩니다.
    line의 width 인자는 선 두께(픽셀 단위)입니다. polygon에는 width 인자가 없고 outline만 있습니다.
  tips:
  - 점 리스트 입력은 [(x1, y1), (x2, y2)] 형식이 표준입니다. (x1, y1, x2, y2) 단일 튜플도 line은 받습니다.
  - polygon은 자동으로 첫/마지막 점을 연결합니다. 정의 시 닫지 않아도 됩니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageDraw

    lineCanvas = Image.new('RGB', (400, 300), color='white')
    lineDraw = ImageDraw.Draw(lineCanvas)
    lineDraw.line([(50, 50), (350, 250)], fill='black', width=3)
    lineDraw.polygon([(100, 50), (200, 200), (50, 200)], fill='yellow')

    lineArr = np.asarray(lineCanvas)
    blackMask = (lineArr[..., 0] < 50) & (lineArr[..., 1] < 50) & (lineArr[..., 2] < 50)
    yellowMask = (lineArr[..., 0] > 200) & (lineArr[..., 1] > 200) & (lineArr[..., 2] < 50)

    {
        'blackLinePixels': int(blackMask.sum()),
        'yellowTrianglePixels': int(yellowMask.sum()),
        'bothPresent': int(blackMask.sum()) > 0 and int(yellowMask.sum()) > 0,
    }
  exercise:
    prompt: 사각형 4점으로 polygon을 그리고 결과가 rectangle과 비슷한 픽셀 수를 갖는지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageDraw

      polyCanvas = Image.new('RGB', (400, 300), color='white')
      ImageDraw.Draw(polyCanvas).polygon([(50, 50), (150, 50), (150, 100), (50, 100)], fill='___')
      polyArr = np.asarray(polyCanvas)
      redMask = (polyArr[..., 0] > 200) & (polyArr[..., 1] < 50)
      {'polyPixels': int(redMask.sum())}
    hints:
    - 빨강 색.
    - 빈칸에는 red가 들어갑니다.
    check:
      noError: polygon 호출이 끝나야 합니다.
      resultCheck: polyPixels가 양의 정수여야 합니다.
  check:
    type: noError
    noError: line/polygon 호출이 끝나야 합니다.
    resultCheck: bothPresent가 True여야 합니다.
- id: step5_compose
  title: 5단계. drawArt 함수
  structuredPrimary: true
  subtitle: 여러 도형 합성
  goal: drawArt(canvasSize) 함수가 여러 도형을 한 함수에 묶어 새 캔버스를 만들고 결과 dict로 도형 수와 비어 있지 않은 픽셀 비율을 돌려줍니다.
  why: 도형 그리기를 함수로 묶어 두면 새 크기/색 인자로 같은 흐름을 재사용 가능합니다. 자동화 시각화의 표준 도구가 됩니다.
  explanation: |-
    drawArt 함수는 빈 캔버스를 만들고 여러 도형을 차례로 그립니다. 결과로 Image와 통계 dict를 돌려줍니다.
    "비어 있지 않은 픽셀 비율"은 배경 색이 아닌 픽셀 수 / 전체 픽셀 수입니다. 도형이 얼마나 공간을 채웠는지의 지표입니다.
    같은 함수를 다른 size로 호출하면 같은 구조의 아트가 비율을 유지하면서 다른 크기로 나옵니다.
  tips:
  - 도형 인자(크기, 위치, 색)를 함수 인자로 받으면 더 유연합니다.
  - 합성 아트를 저장하려면 canvas.save('art.png')로 PNG 파일로 내보냅니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageDraw


    def drawArt(canvasSize: tuple) -> dict:
        canvas = Image.new('RGB', canvasSize, color='white')
        draw = ImageDraw.Draw(canvas)
        draw.rectangle((30, 30, 100, 80), fill='red')
        draw.ellipse((150, 30, 220, 100), fill='blue')
        draw.line([(30, 150), (220, 150)], fill='black', width=4)
        draw.polygon([(50, 200), (130, 250), (10, 250)], fill='green')

        arr = np.asarray(canvas)
        whiteMask = (arr[..., 0] == 255) & (arr[..., 1] == 255) & (arr[..., 2] == 255)
        return {
            'size': canvas.size,
            'shapeCount': 4,
            'nonBgRatio': round(float(1 - whiteMask.mean()), 3),
        }


    drawArt((300, 300))
  exercise:
    prompt: drawArt((500, 400))으로 더 큰 캔버스에 호출해 nonBgRatio가 (300, 300) 케이스보다 작은지 확인하세요(같은 도형 크기에 더 넓은 캔버스).
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageDraw


      def drawArt(canvasSize):
          canvas = Image.new('RGB', canvasSize, color='white')
          draw = ImageDraw.Draw(canvas)
          draw.rectangle((30, 30, 100, 80), fill='red')
          arr = np.asarray(canvas)
          whiteMask = (arr[..., 0] == 255) & (arr[..., 1] == 255) & (arr[..., 2] == 255)
          return {'nonBgRatio': round(float(1 - whiteMask.mean()), 3)}


      smallResult = drawArt((300, 300))
      bigResult = drawArt((500, ___))
      {'small': smallResult['nonBgRatio'], 'big': bigResult['nonBgRatio'], 'smallerOnBigger': bigResult['nonBgRatio'] < smallResult['nonBgRatio']}
    hints:
    - 큰 캔버스 height 400.
    - 빈칸에는 400이 들어갑니다.
    check:
      noError: drawArt 정의와 호출이 끝나야 합니다.
      resultCheck: smallerOnBigger가 True여야 합니다.
  check:
    type: noError
    noError: drawArt 정의와 호출이 끝나야 합니다.
    resultCheck: shapeCount가 4이고 nonBgRatio가 0~1 사이여야 합니다.
- id: practice
  title: 실습 - 추상 아트 생성
  structuredPrimary: true
  subtitle: 랜덤 도형 합성
  goal: 시드 고정 난수로 도형 위치와 색을 정해 추상 아트를 만들고 결과 통계 dict를 돌려주는 함수를 만듭니다.
  why: 난수 기반 합성은 알고리즘 아트의 출발점입니다. 시드를 고정하면 같은 결과를 재현할 수 있어 단위 테스트로 활용 가능합니다.
  explanation: |-
    np.random.default_rng(seed)로 시드 고정 난수 생성기를 만듭니다. 같은 시드는 항상 같은 도형 위치/색을 생성합니다.
    도형 N개를 그리고 각 도형의 크기와 색을 난수로 결정합니다. 결과 함수는 nonBgRatio 같은 통계를 돌려줍니다.
    이 패턴은 단위 테스트와 회귀 테스트 모두에 활용됩니다.
  tips:
  - 시드가 다른 두 호출은 다른 결과를 줘야 합니다. 시드가 같으면 정확히 같은 결과를 줘야 합니다.
  - 도형 색은 rng.integers(0, 256, 3) 같은 형식으로 RGB 3채널을 한 번에 생성 가능합니다.
  snippet: |-
    import numpy as np
    from PIL import Image, ImageDraw


    def randomArt(canvasSize: tuple, shapeCount: int, seed: int) -> dict:
        rng = np.random.default_rng(seed)
        canvas = Image.new('RGB', canvasSize, color='white')
        draw = ImageDraw.Draw(canvas)
        for _ in range(shapeCount):
            x = int(rng.integers(0, canvasSize[0] - 50))
            y = int(rng.integers(0, canvasSize[1] - 50))
            w = int(rng.integers(20, 60))
            h = int(rng.integers(20, 60))
            color = tuple(int(c) for c in rng.integers(0, 256, 3))
            draw.ellipse((x, y, x + w, y + h), fill=color)
        arr = np.asarray(canvas)
        whiteMask = (arr[..., 0] == 255) & (arr[..., 1] == 255) & (arr[..., 2] == 255)
        return {'shapeCount': shapeCount, 'nonBgRatio': round(float(1 - whiteMask.mean()), 3)}


    [randomArt((300, 300), 10, seed=42), randomArt((300, 300), 10, seed=42)]
  exercise:
    prompt: 같은 함수에 shapeCount=20을 주면 nonBgRatio가 10 케이스보다 크게 나오는지 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image, ImageDraw


      def randomArt(canvasSize, shapeCount, seed):
          rng = np.random.default_rng(seed)
          canvas = Image.new('RGB', canvasSize, color='white')
          draw = ImageDraw.Draw(canvas)
          for _ in range(shapeCount):
              x = int(rng.integers(0, canvasSize[0] - 50))
              y = int(rng.integers(0, canvasSize[1] - 50))
              draw.ellipse((x, y, x + 40, y + 40), fill=tuple(int(c) for c in rng.integers(0, 256, 3)))
          arr = np.asarray(canvas)
          whiteMask = (arr[..., 0] == 255) & (arr[..., 1] == 255) & (arr[..., 2] == 255)
          return {'nonBgRatio': round(float(1 - whiteMask.mean()), 3)}


      ten = randomArt((300, 300), 10, seed=42)
      twenty = randomArt((300, 300), ___, seed=42)
      {'ten': ten['nonBgRatio'], 'twenty': twenty['nonBgRatio'], 'biggerCovers': twenty['nonBgRatio'] > ten['nonBgRatio']}
    hints:
    - 도형 수 20.
    - 빈칸에는 20이 들어갑니다.
    check:
      noError: randomArt 정의와 두 호출이 끝나야 합니다.
      resultCheck: biggerCovers가 True여야 합니다.
  check:
    type: noError
    noError: randomArt 정의와 두 호출이 끝나야 합니다.
    resultCheck: 두 결과가 같은 형식 dict이고 shapeCount가 10이어야 합니다.
- id: workflow_validation
  title: 6단계. 도형 좌표 가드 + 픽셀 검증
  structuredPrimary: true
  subtitle: validateShapeCoords + 면적 검증
  goal: validateShapeCoords 함수가 좌표 순서가 잘못된 도형을 차단하고, 정상 좌표 사각형의 픽셀 수가 면적과 가까운지 회귀 테스트로 확인합니다.
  why: 도형 좌표는 (left, top, right, bottom) 형식에서 left<right, top<bottom이 필수입니다. 순서 어긋난 좌표는 빈 도형을 만들거나 좌표 해석이 거꾸로 됩니다.
  explanation: |-
    validateShapeCoords는 4-tuple을 받아 (1) 길이가 4인지, (2) left<right, top<bottom인지 검사합니다.
    회귀 테스트는 정상 사각형의 픽셀 수가 (right-left)·(bottom-top)에 가까운지로 합니다. Pillow의 anti-aliasing 때문에 정확히 같지 않을 수 있지만 가까운 값.
  tips:
  - 좌표 가드는 다른 도형 함수의 첫 줄에서 호출하면 입력 안전을 한 번에 보호합니다.
  - "ValueError 메시지에 실제 좌표를 포함시키면 호출자가 즉시 원인을 알 수 있습니다."
  snippet: |-
    import numpy as np
    from PIL import Image, ImageDraw


    def validateShapeCoords(xy: tuple) -> bool:
        if len(xy) != 4:
            raise ValueError(f"도형 좌표는 4-tuple이어야 합니다: {xy}")
        left, top, right, bottom = xy
        if left >= right or top >= bottom:
            raise ValueError(f"좌표 순서 오류: {xy}")
        return True


    okCanvas = Image.new('RGB', (300, 200), color='white')
    okCoords = (50, 50, 150, 100)
    validateShapeCoords(okCoords)
    ImageDraw.Draw(okCanvas).rectangle(okCoords, fill='red')

    arr = np.asarray(okCanvas)
    redMask = (arr[..., 0] == 255) & (arr[..., 1] == 0)

    try:
        validateShapeCoords((150, 50, 50, 100))
        revMsg = 'unexpected pass'
    except ValueError as exc:
        revMsg = str(exc)

    {
        'redPixels': int(redMask.sum()),
        'expectedArea': (150 - 50 + 1) * (100 - 50 + 1),
        'closeToArea': abs(int(redMask.sum()) - (150 - 50 + 1) * (100 - 50 + 1)) < 300,
        'reversedMessage': revMsg,
    }
  exercise:
    prompt: validateShapeCoords에 3원소 튜플 (10, 20, 30)을 넘기면 길이 오류가 잡히는지 확인하세요.
    starterCode: |-
      def validateShapeCoords(xy):
          if len(xy) != 4:
              raise ValueError(f"도형 좌표는 4-tuple이어야 합니다: {xy}")
          left, top, right, bottom = xy
          if left >= right or top >= bottom:
              raise ValueError(f"좌표 순서 오류: {xy}")
          return True


      try:
          validateShapeCoords((10, 20, ___))
          shortMsg = 'unexpected pass'
      except ValueError as exc:
          shortMsg = str(exc)

      {'shortMsg': shortMsg, 'hasLengthHint': '4-tuple' in shortMsg}
    hints:
    - 3원소 튜플이라 세 번째 원소만 넣습니다.
    - 빈칸에는 30이 들어갑니다.
    check:
      noError: validateShapeCoords 정의가 끝나야 합니다.
      resultCheck: hasLengthHint가 True여야 합니다.
  check:
    type: noError
    noError: validateShapeCoords와 rectangle 호출이 끝나야 합니다.
    resultCheck: closeToArea가 True이고 reversedMessage에 '순서' 단서가 포함되어야 합니다.
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
  - id: pillow_08-shape_art-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_canvas
    - workflow_validation
    title: 도형 아트 생성기 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: canvas·color mode·stroke width·shape list 계약을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_shape_art_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_shape_art_contract(value):
            raise NotImplementedError
      solution: |
        def audit_shape_art_contract(value):
            required = ['canvas', 'mode', 'strokeWidth', 'shapes']
            rules = [{'id': 'canvas', 'field': 'canvas', 'kind': 'length', 'value': 2}, {'id': 'mode', 'field': 'mode', 'kind': 'enum', 'values': ['RGB', 'RGBA']}, {'id': 'stroke', 'field': 'strokeWidth', 'kind': 'positive'}, {'id': 'shapes', 'field': 'shapes', 'kind': 'nonempty'}]
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
            return {"accepted": not missing and not violations, "topic": 'shape_art', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.pillow.pillow_08.shape_art-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_08.shape_art-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_shape_art_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              canvas:
              - 800
              - 600
              mode: RGBA
              strokeWidth: 4
              shapes:
              - rectangle
              - ellipse
          expectedReturn:
            accepted: true
            topic: shape_art
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              mode: RGBA
              strokeWidth: 4
              shapes:
              - rectangle
              - ellipse
          expectedReturn:
            accepted: false
            topic: shape_art
            missing:
            - canvas
            violations:
            - canvas
        - id: reports-topic-invariants
          arguments:
          - value:
              canvas:
              - 800
              mode: CMYK
              strokeWidth: 0
              shapes: []
          expectedReturn:
            accepted: false
            topic: shape_art
            missing: []
            violations:
            - canvas
            - mode
            - shapes
            - stroke
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pillow_08-shape_art-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_08-shape_art-contract-audit-mastery
    title: 도형 아트 생성기 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_shape_art_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_shape_art_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_shape_art_result(expected, observed):
            identity = ['recipeHash', 'mode']
            metrics = {'paintedPixels': 0}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'shape_art', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.pillow.pillow_08.shape_art-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_08.shape_art-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_shape_art_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              recipeHash: art-a
              mode: RGBA
              paintedPixels: 12000
          - value:
              recipeHash: art-a
              mode: RGBA
              paintedPixels: 12000
          expectedReturn:
            passed: true
            topic: shape_art
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              recipeHash: art-a
              mode: RGBA
              paintedPixels: 12000
          - value:
              recipeHash: art-b
              mode: RGB
              paintedPixels: 5000
          expectedReturn:
            passed: false
            topic: shape_art
            missing: []
            identityMismatch:
            - mode
            - recipeHash
            metricDrift:
            - paintedPixels
        - id: reports-missing-result-fields
          arguments:
          - value:
              recipeHash: art-a
              mode: RGBA
              paintedPixels: 12000
          - value: {}
          expectedReturn:
            passed: false
            topic: shape_art
            missing:
            - mode
            - paintedPixels
            - recipeHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pillow_08-shape_art-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_08-shape_art-result-reconciliation-transfer
    title: 도형 아트 생성기 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_shape_art_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_shape_art_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_shape_art_evidence(stage):
            stages = {'source': {'action': 'admit shape art source', 'evidence': 'canvas and shape manifest', 'risk': 'unsafe or misread image'}, 'edit': {'action': 'apply bounded shape art edit', 'evidence': 'ordered draw trace', 'risk': 'quality or geometry loss'}, 'artifact': {'action': 'reopen shape art artifact', 'evidence': 'painted pixel count', 'risk': 'corrupt or visually wrong output'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.pillow.pillow_08.shape_art-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_08.shape_art-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_shape_art_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: admit shape art source
            evidence: canvas and shape manifest
            risk: unsafe or misread image
        - id: recalls-edit
          arguments:
          - value: edit
          expectedReturn:
            action: apply bounded shape art edit
            evidence: ordered draw trace
            risk: quality or geometry loss
        - id: recalls-artifact
          arguments:
          - value: artifact
          expectedReturn:
            action: reopen shape art artifact
            evidence: painted pixel count
            risk: corrupt or visually wrong output
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};