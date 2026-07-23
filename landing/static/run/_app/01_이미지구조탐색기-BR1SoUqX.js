var e=`meta:\r
  packages:\r
  - numpy\r
  - opencv-python\r
  - scikit-learn\r
  id: opencv_01\r
  title: 이미지구조탐색기\r
  order: 1\r
  category: opencv\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - OpenCV\r
  - cv2\r
  - ndarray\r
  - shape\r
  - dtype\r
  - BGR\r
  - RGB\r
  seo:\r
    title: OpenCV 입문 - 이미지 구조 탐색기\r
    description: OpenCV에서 이미지가 NumPy 배열로 어떻게 표현되는지 배웁니다. shape, dtype, BGR 순서를 이해합니다.\r
    keywords:\r
    - OpenCV\r
    - cv2\r
    - ndarray\r
    - shape\r
    - dtype\r
    - BGR\r
intro:\r
  emoji: 🔬\r
  goal: OpenCV에서 이미지가 NumPy 배열로 어떻게 표현되는지 한 단계씩 직접 들여다봅니다.\r
  description: shape, dtype, 채널 순서 같은 "이 배열이 뭔지"를 먼저 정확히 잡으면 이후의 색공간 변환, 필터, 검출이 안전해집니다.\r
  direction: load_sample_image로 받은 ndarray의 shape/dtype/채널을 직접 출력하고, BGR↔RGB 변환을 손으로 확인합니다.\r
  benefits:\r
  - ndarray.shape를 (높이, 너비, 채널)로 해석하는 사고를 굳힙니다.\r
  - dtype=uint8의 0~255 범위가 픽셀 밝기와 어떻게 대응되는지 확인합니다.\r
  - cvtColor로 BGR↔RGB를 양방향 변환하며 색이 뒤집히는 현상을 직접 봅니다.\r
  - 인덱싱과 슬라이싱으로 픽셀 하나와 ROI 영역을 추출합니다.\r
  diagram:\r
    steps:\r
    - label: 샘플 이미지 로드\r
      detail: sklearn.datasets.load_sample_image으로 RGB ndarray를 받습니다.\r
    - label: 배열 구조 확인\r
      detail: shape, dtype, 채널 수를 출력해 입력 형식이 기대대로인지 점검합니다.\r
    - label: 색공간 변환\r
      detail: cv2.cvtColor로 RGB↔BGR을 왕복하며 같은 픽셀이 다른 순서로 저장됨을 확인합니다.\r
    - label: 인덱싱과 ROI\r
      detail: img[y, x]로 한 픽셀, img[y1:y2, x1:x2]로 사각형 ROI를 잘라 봅니다.\r
    - label: 구조 검증 함수\r
      detail: validate 함수로 shape/dtype 기대값을 assert해 다음 단계 입력을 보장합니다.\r
    runtime:\r
    - label: opencv-python 패키지\r
      detail: meta.packages의 opencv-python이 가상환경에 준비돼야 cv2 import가 통과합니다.\r
    - label: matplotlib 표시\r
      detail: plt.imshow는 RGB를 기대하므로 OpenCV가 만든 BGR을 그리면 색이 뒤집힙니다.\r
    - label: 셀 간 변수 공유\r
      detail: 같은 노트북 위에서 img 같은 변수는 다음 셀에서도 그대로 보입니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 샘플 이미지 로드\r
  structuredPrimary: true\r
  subtitle: sklearn 샘플로 시작\r
  goal: sklearn의 flower 샘플을 ndarray로 받고 type/shape/dtype을 한 번에 확인합니다.\r
  why: OpenCV 학습을 파일 다운로드 없이 시작하려면 sklearn 샘플이 가장 짧은 경로입니다. 이 단계에서 "이미지가 곧 ndarray"라는 첫 번째 멘탈 모델을 굳혀야 이후 모든 cv2 함수의 인자가 자연스럽게 해석됩니다.\r
  explanation: |-\r
    sklearn.datasets.load_sample_image('flower.jpg')는 (높이, 너비, 3) 모양의 RGB uint8 ndarray를 돌려줍니다. 별도 디스크 I/O 없이 sklearn 패키지에 묶여 배포되는 이미지를 즉시 메모리에 올려 줍니다.\r
    OpenCV(cv2)에서 cv2.imread를 쓰면 BGR로 받지만, sklearn 샘플은 RGB라는 점이 중요합니다. 같은 픽셀이라도 라이브러리에 따라 채널 순서가 달라서, 어떤 함수에 넘기느냐에 따라 변환이 필요합니다.\r
    이 셀에서 우선 type, shape, dtype 세 가지만 동시에 출력해 "받은 객체의 정체"를 한 줄로 정리해 둡니다.\r
  tips:\r
  - sklearn 샘플은 RGB 순서라 matplotlib.pyplot.imshow로 바로 그릴 수 있습니다.\r
  - cv2.imread는 BGR 순서라 sklearn 샘플과 정반대입니다. 두 경로를 섞어 쓰면 cvtColor가 반드시 필요합니다.\r
  snippet: |-\r
    from sklearn.datasets import load_sample_image\r
\r
    flowerRgb = load_sample_image('flower.jpg')\r
\r
    {\r
        'type': type(flowerRgb).__name__,\r
        'shape': flowerRgb.shape,\r
        'dtype': str(flowerRgb.dtype),\r
    }\r
  exercise:\r
    prompt: flower 대신 'china.jpg' 샘플을 로드하고 같은 dict 형태로 type/shape/dtype을 돌려주세요.\r
    starterCode: |-\r
      from sklearn.datasets import load_sample_image\r
\r
      chinaRgb = load_sample_image('___')\r
\r
      {\r
          'type': type(chinaRgb).__name__,\r
          'shape': chinaRgb.shape,\r
          'dtype': str(chinaRgb.dtype),\r
      }\r
    hints:\r
    - 빈칸에 들어갈 파일명은 'china.jpg'입니다.\r
    - china 샘플의 shape는 (427, 640, 3)입니다.\r
    check:\r
      noError: load_sample_image 호출이 NameError, FileNotFoundError 없이 끝나야 합니다.\r
      resultCheck: 결과 dict의 type이 'ndarray', shape의 마지막 요소가 3, dtype이 'uint8'이어야 합니다.\r
  check:\r
    noError: load_sample_image 호출과 dict 구성이 NameError 없이 끝나야 합니다.\r
    resultCheck: 결과 dict의 type이 'ndarray', shape의 마지막 요소가 3, dtype이 'uint8'이어야 합니다.\r
- id: step2_shape\r
  title: 2단계. shape 분해\r
  structuredPrimary: true\r
  subtitle: 높이, 너비, 채널 동시 분해\r
  goal: ndarray.shape를 (height, width, channels)로 분해하고 각 의미를 dict로 묶어 확인합니다.\r
  why: shape의 첫 축이 높이라는 사실은 cv2.rectangle(img, (x, y), ...) 같은 좌표 인자와 정반대 순서라 가장 자주 실수가 나는 부분입니다. 명시적으로 변수 이름을 붙여 두면 이후 코드에서 헷갈리지 않습니다.\r
  explanation: |-\r
    이미지 ndarray의 shape는 (높이, 너비, 채널) 3원소 튜플입니다. 흑백 이미지면 채널 차원이 없고 (높이, 너비) 2원소가 됩니다.\r
    "높이가 먼저"는 NumPy의 행렬 컨벤션(행, 열)을 그대로 따른 결과입니다. 반면 cv2.rectangle, cv2.line 같은 그리기 함수의 좌표는 (x, y) 순서를 씁니다. 이 두 컨벤션이 같은 코드 안에서 충돌하므로 항상 의식해야 합니다.\r
    이 셀은 변수에 height/width/channels라는 이름을 명시적으로 붙여 둬서, 이후 셀에서 ROI 슬라이싱 인자를 만들 때 의미가 흐려지지 않게 합니다.\r
  tips:\r
  - Pillow의 Image.size는 (너비, 높이)라 반대 순서입니다. 두 라이브러리를 섞을 때 자주 실수합니다.\r
  - 채널이 4이면 알파가 포함된 RGBA/BGRA입니다. cv2.imread(path, cv2.IMREAD_UNCHANGED)로 받았을 때 자주 나옵니다.\r
  snippet: |-\r
    from sklearn.datasets import load_sample_image\r
\r
    shapeFlower = load_sample_image('flower.jpg')\r
    flowerHeight, flowerWidth, flowerChannels = shapeFlower.shape\r
\r
    {\r
        'height': flowerHeight,\r
        'width': flowerWidth,\r
        'channels': flowerChannels,\r
    }\r
  exercise:\r
    prompt: china.jpg를 로드해 height/width/channels를 분해한 뒤 width가 height보다 큰지를 isLandscape 키로 함께 돌려주세요.\r
    starterCode: |-\r
      from sklearn.datasets import load_sample_image\r
\r
      shapeChina = load_sample_image('china.jpg')\r
      chinaHeight, chinaWidth, chinaChannels = shapeChina.shape\r
\r
      {\r
          'height': chinaHeight,\r
          'width': chinaWidth,\r
          'channels': chinaChannels,\r
          'isLandscape': chinaWidth ___ chinaHeight,\r
      }\r
    hints:\r
    - "isLandscape는 가로가 세로보다 큰지를 묻는 부울이므로 비교 연산자 '>'가 들어갑니다."\r
    - china 샘플은 가로가 더 긴 풍경 사진입니다.\r
    check:\r
      noError: shape 분해와 비교 연산이 ValueError 없이 끝나야 합니다.\r
      resultCheck: 결과 dict의 height가 427, width가 640, isLandscape가 True여야 합니다.\r
  check:\r
    noError: shape 분해와 dict 구성이 ValueError 없이 끝나야 합니다.\r
    resultCheck: 결과 dict의 height가 427, width가 640, channels가 3이어야 합니다.\r
- id: step3_dtype\r
  title: 3단계. dtype과 값 범위\r
  structuredPrimary: true\r
  subtitle: uint8의 0~255\r
  goal: ndarray.dtype과 min/max 값을 동시에 확인해 픽셀 범위가 0~255 안에 들어 있는지 검사합니다.\r
  why: dtype을 잘못 알면 산술 연산에서 값이 잘리거나 오버플로가 납니다. uint8 + uint8이 256이면 0이 되는 wrap-around가 대표적이라 이 단계에서 범위 감각을 굳혀야 합니다.\r
  explanation: |-\r
    OpenCV가 다루는 일반 이미지의 dtype은 uint8입니다. unsigned 8-bit integer로 0~255 256단계가 픽셀 한 칸당 한 채널의 밝기를 나타냅니다.\r
    딥러닝 입력처럼 0.0~1.0 float이 필요한 경우 img.astype(np.float32) / 255.0으로 변환합니다. 이 변환을 잊고 cv2 함수에 float을 넘기면 함수에 따라 결과가 제대로 안 나오거나 에러가 납니다.\r
    범위 검증은 img.min(), img.max()로 한 줄에 확인합니다. 정상 범위가 [0, 255]를 벗어나면 dtype 변환을 거치다 손상된 이미지일 가능성이 큽니다.\r
  tips:\r
  - uint8 산술은 wrap-around가 일어납니다. 250 + 10이 4로 떨어집니다. 안전하게 더하려면 cv2.add 또는 int 변환 후 np.clip을 씁니다.\r
  - cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX)는 값 범위를 [0, 255]로 다시 펴 줄 때 유용합니다.\r
  snippet: |-\r
    import numpy as np\r
    from sklearn.datasets import load_sample_image\r
\r
    dtypeFlower = load_sample_image('flower.jpg')\r
\r
    {\r
        'dtype': str(dtypeFlower.dtype),\r
        'min': int(dtypeFlower.min()),\r
        'max': int(dtypeFlower.max()),\r
        'isUint8': dtypeFlower.dtype == np.uint8,\r
    }\r
  exercise:\r
    prompt: dtypeFlower를 float32로 변환해 0.0~1.0 범위로 정규화한 뒤 같은 dict 형태로 dtype/min/max를 돌려주세요.\r
    starterCode: |-\r
      import numpy as np\r
      from sklearn.datasets import load_sample_image\r
\r
      normFlower = load_sample_image('flower.jpg').astype(np.___) / 255.0\r
\r
      {\r
          'dtype': str(normFlower.dtype),\r
          'min': float(normFlower.min()),\r
          'max': float(normFlower.max()),\r
      }\r
    hints:\r
    - 빈칸에는 float32가 들어갑니다.\r
    - 255로 나눈 결과의 max는 정확히 1.0입니다.\r
    check:\r
      noError: astype 변환이 TypeError 없이 끝나야 합니다.\r
      resultCheck: 결과 dict의 dtype이 'float32', max가 1.0과 거의 같아야 합니다.\r
  check:\r
    noError: dtype/min/max 호출이 NameError 없이 끝나야 합니다.\r
    resultCheck: 결과 dict의 dtype이 'uint8', max가 255, isUint8이 True여야 합니다.\r
- id: step4_bgr\r
  title: 4단계. BGR↔RGB 변환\r
  structuredPrimary: true\r
  subtitle: cv2.cvtColor로 색 순서 뒤집기\r
  goal: RGB 이미지를 BGR로 변환하고 다시 RGB로 되돌려 와도 픽셀이 정확히 같은지 확인합니다.\r
  why: OpenCV는 BGR, matplotlib과 sklearn은 RGB를 씁니다. 변환을 한 번 빼먹으면 빨강이 파랑으로 보이는 버그가 나기 쉽습니다. 왕복 변환이 idempotent인지 직접 검사해 두면 어디서 색이 뒤집혔는지 빠르게 잡을 수 있습니다.\r
  explanation: |-\r
    cv2.cvtColor(src, code)에서 code 자리에 cv2.COLOR_RGB2BGR이나 cv2.COLOR_BGR2RGB을 넘기면 채널 축의 0번과 2번이 서로 자리를 바꿉니다. 메모리에는 새 ndarray가 만들어집니다.\r
    같은 변환을 두 번 적용하면 원본과 비트 단위로 같아야 합니다. np.array_equal로 검증할 수 있고, 이 검증이 실패하면 변환 단계 외에 어딘가에서 값이 변형됐다는 신호입니다.\r
    plt.imshow는 항상 RGB로 그립니다. BGR 이미지를 그리면 색이 뒤집힌 채로 나오는데, 이 시각적 단서가 잘못된 변환을 빠르게 찾는 데 도움이 됩니다.\r
  tips:\r
  - cv2.cvtColor는 새 배열을 만들므로 원본은 변하지 않습니다. 메모리가 신경 쓰이면 in-place로 쓸 수 있는 함수는 따로 없어 cv2.merge나 인덱싱을 검토해야 합니다.\r
  - "OpenCV의 cv2.imshow는 반대로 BGR을 기대합니다. matplotlib(RGB)과 정반대라 헷갈리기 쉽습니다."\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    from sklearn.datasets import load_sample_image\r
\r
    bgrFlower = cv2.cvtColor(load_sample_image('flower.jpg'), cv2.COLOR_RGB2BGR)\r
    backToRgbFlower = cv2.cvtColor(bgrFlower, cv2.COLOR_BGR2RGB)\r
\r
    {\r
        'firstPixelRgb': load_sample_image('flower.jpg')[0, 0].tolist(),\r
        'firstPixelBgr': bgrFlower[0, 0].tolist(),\r
        'roundTripEqual': np.array_equal(load_sample_image('flower.jpg'), backToRgbFlower),\r
    }\r
  exercise:\r
    prompt: cv2.cvtColor 대신 채널 인덱싱(img[..., ::-1])으로 RGB→BGR을 만들고 cvtColor 결과와 비트 단위로 같은지 확인하세요.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
      from sklearn.datasets import load_sample_image\r
\r
      rgbSource = load_sample_image('flower.jpg')\r
      bgrByCvt = cv2.cvtColor(rgbSource, cv2.COLOR_RGB2BGR)\r
      bgrBySlice = rgbSource[..., ___]\r
\r
      {\r
          'shapeBySlice': bgrBySlice.shape,\r
          'sameAsCvt': np.array_equal(bgrByCvt, bgrBySlice),\r
      }\r
    hints:\r
    - 마지막 축의 순서를 뒤집는 슬라이스는 ::-1입니다.\r
    - 채널 축만 뒤집고 행/열은 그대로 두어야 하므로 ... (Ellipsis)을 함께 씁니다.\r
    check:\r
      noError: 슬라이싱과 array_equal 호출이 IndexError 없이 끝나야 합니다.\r
      resultCheck: 결과 dict의 shapeBySlice가 (427, 640, 3), sameAsCvt가 True여야 합니다.\r
  check:\r
    noError: cvtColor 두 번 호출이 NameError 없이 끝나야 합니다.\r
    resultCheck: firstPixelRgb와 firstPixelBgr이 정확히 역순이고 roundTripEqual이 True여야 합니다.\r
- id: step5_pixel\r
  title: 5단계. 한 픽셀 접근\r
  structuredPrimary: true\r
  subtitle: img[y, x]로 한 값 읽기\r
  goal: 임의 좌표 (y, x)의 픽셀을 [R, G, B] 리스트로 읽고 채널별 값이 어떤 색을 의미하는지 손으로 풀어 봅니다.\r
  why: 픽셀 한 칸을 정확히 읽는 능력은 모든 검출/필터 디버깅의 출발입니다. 좌표 순서 (y, x)와 채널 순서가 같이 헷갈리기 때문에 작은 좌표에서 한 번 명확히 잡고 가야 합니다.\r
  explanation: |-\r
    NumPy 인덱싱 img[y, x]는 (행, 열) 컨벤션이라 첫 인덱스가 y(높이 방향), 두 번째가 x(너비 방향)입니다. 반환값은 채널 개수만큼의 길이를 가진 1차원 ndarray입니다.\r
    .tolist()로 Python 리스트로 바꾸면 노트북에서 값을 그대로 출력하기 좋습니다. 채널이 RGB냐 BGR이냐는 받은 이미지에 따라 다릅니다. 이 셀의 소스는 sklearn → RGB라 [R, G, B] 순서입니다.\r
    여러 픽셀을 같은 모양으로 비교하려면 좌표 리스트를 만들어 dict로 묶어 두는 편이 디버깅에 좋습니다.\r
  tips:\r
  - img[y, x, c]로 채널 c 한 개만 꺼낼 수도 있습니다. img[y, x][0]보다 약간 빠릅니다.\r
  - cv2.imread로 받은 BGR 이미지에서 같은 코드를 돌리면 같은 위치라도 [R, G, B] 순서가 [B, G, R]로 뒤집힙니다.\r
  snippet: |-\r
    from sklearn.datasets import load_sample_image\r
\r
    pixelFlower = load_sample_image('flower.jpg')\r
\r
    {\r
        'topLeft': pixelFlower[0, 0].tolist(),\r
        'center': pixelFlower[pixelFlower.shape[0] // 2, pixelFlower.shape[1] // 2].tolist(),\r
        'bottomRight': pixelFlower[-1, -1].tolist(),\r
    }\r
  exercise:\r
    prompt: pixelFlower의 좌표 (50, 100), (200, 300), (400, 600) 세 픽셀을 읽어 dict의 'samples' 키에 리스트로 묶어 돌려주세요.\r
    starterCode: |-\r
      from sklearn.datasets import load_sample_image\r
\r
      sampleFlower = load_sample_image('flower.jpg')\r
\r
      {\r
          'samples': [\r
              sampleFlower[___, ___].tolist(),\r
              sampleFlower[200, 300].tolist(),\r
              sampleFlower[400, 600].tolist(),\r
          ],\r
      }\r
    hints:\r
    - 첫 빈칸 쌍에는 (50, 100)이 들어갑니다.\r
    - 각 픽셀은 [R, G, B] 3원소 리스트입니다.\r
    check:\r
      noError: 픽셀 인덱싱이 IndexError 없이 끝나야 합니다.\r
      resultCheck: samples 리스트가 3개 요소이고, 각 요소가 길이 3 정수 리스트여야 합니다.\r
  check:\r
    noError: 픽셀 인덱싱이 IndexError 없이 끝나야 합니다.\r
    resultCheck: 세 픽셀 모두 길이 3 정수 리스트로 돌아와야 합니다.\r
- id: step6_slice\r
  title: 6단계. ROI 슬라이싱\r
  structuredPrimary: true\r
  subtitle: 사각형 영역 잘라내기\r
  goal: 이미지 가운데를 중심으로 200×300 ROI를 잘라 shape, dtype, 평균 밝기를 한 번에 점검합니다.\r
  why: ROI는 검출/추적/분류의 기본 단위입니다. 슬라이스 한 줄로 정확한 직사각형을 떼어낼 수 있는지가 이후 모든 모델 입력의 품질을 결정합니다.\r
  explanation: |-\r
    NumPy 슬라이싱 img[y1:y2, x1:x2]는 y1≤y<y2, x1≤x<x2인 직사각형을 새 view로 돌려줍니다. 메모리를 새로 잡지 않고 원본과 같은 버퍼를 공유합니다.\r
    공유 버퍼라 ROI에 값을 쓰면 원본이 함께 변합니다. 변경 가능성이 있으면 .copy()로 떨어트려야 합니다. 본 예제는 통계만 보므로 view 그대로 씁니다.\r
    실무에서는 좌표가 음수나 이미지 밖으로 나가지 않게 np.clip이나 max(0, ...) 패턴으로 보호합니다. 본 예제는 가운데 기준이라 그 위험이 없습니다.\r
  tips:\r
  - 슬라이스는 view, 인덱스 배열(img[[1,2,3]])은 copy입니다. 두 동작 차이를 의식하지 못하면 디버깅 시간이 길어집니다.\r
  - ROI의 평균은 .mean()으로 한 줄에 얻습니다. axis=(0,1)을 주면 채널별 평균이 나옵니다.\r
  snippet: |-\r
    from sklearn.datasets import load_sample_image\r
\r
    roiFlower = load_sample_image('flower.jpg')\r
    roiHeight, roiWidth, _ = roiFlower.shape\r
    roiCenterY = roiHeight // 2\r
    roiCenterX = roiWidth // 2\r
\r
    centerRoi = roiFlower[roiCenterY - 100:roiCenterY + 100, roiCenterX - 150:roiCenterX + 150]\r
\r
    {\r
        'shape': centerRoi.shape,\r
        'dtype': str(centerRoi.dtype),\r
        'meanPerChannel': centerRoi.mean(axis=(0, 1)).round(1).tolist(),\r
    }\r
  exercise:\r
    prompt: ROI 크기를 100×200(높이×너비)으로 줄여 잘라 보고, 같은 dict 형태로 shape와 채널별 평균을 돌려주세요.\r
    starterCode: |-\r
      from sklearn.datasets import load_sample_image\r
\r
      smallSource = load_sample_image('flower.jpg')\r
      smallHeight, smallWidth, _ = smallSource.shape\r
      smallCenterY = smallHeight // 2\r
      smallCenterX = smallWidth // 2\r
\r
      smallRoi = smallSource[smallCenterY - ___:smallCenterY + ___, smallCenterX - 100:smallCenterX + 100]\r
\r
      {\r
          'shape': smallRoi.shape,\r
          'meanPerChannel': smallRoi.mean(axis=(0, 1)).round(1).tolist(),\r
      }\r
    hints:\r
    - "ROI 높이 100을 만들려면 위/아래 각각 50씩 잡으면 됩니다."\r
    - 슬라이스의 마지막 인덱스는 포함되지 않으므로 (center-50, center+50)이 정확히 100픽셀입니다.\r
    check:\r
      noError: 슬라이싱과 mean 호출이 IndexError 없이 끝나야 합니다.\r
      resultCheck: smallRoi.shape가 (100, 200, 3)이고 meanPerChannel이 3원소 리스트여야 합니다.\r
  check:\r
    noError: 슬라이싱과 mean 호출이 IndexError 없이 끝나야 합니다.\r
    resultCheck: centerRoi.shape가 (200, 300, 3)이고 meanPerChannel 리스트 길이가 3이어야 합니다.\r
- id: step7_draw\r
  title: 7단계. 도형 그려 좌표 확인\r
  structuredPrimary: true\r
  subtitle: cv2.rectangle로 (x, y) 검증\r
  goal: 빈 canvas에 직사각형을 그려서 그리기 함수의 (x, y) 좌표가 ndarray 인덱싱 (y, x)와 어떻게 다른지 직접 비교합니다.\r
  why: cv2.rectangle((x1, y1), (x2, y2), color, thickness)의 좌표 순서는 NumPy 인덱싱과 정반대라 가장 자주 실수가 나는 부분입니다. 작은 canvas에 한 번 그려 두면 평생 가는 감각이 생깁니다.\r
  explanation: |-\r
    그리기 함수에 넣는 color는 BGR 튜플입니다. (0, 255, 0)이 녹색, (0, 0, 255)가 빨강, (255, 0, 0)이 파랑입니다. matplotlib으로 그대로 imshow하면 색이 뒤집혀 보이므로 검증은 인덱스로 합니다.\r
    thickness가 양수면 선 두께, -1이면 채우기입니다. 본 예제는 직사각형 안을 채워 인덱싱으로 "안쪽 픽셀이 정말 그 색인지" 명확히 확인합니다.\r
    검증 시 rectangle의 (x, y)와 인덱싱의 [y, x]가 바뀐다는 점을 보는 게 핵심입니다. 본 예제는 (왼쪽위 x=20, y=10)부터 (오른쪽아래 x=80, y=40)까지 채우고 안쪽 한 점 [25, 30]이 녹색인지 확인합니다.\r
  tips:\r
  - 그리기 함수는 in-place로 동작합니다. 원본을 보존하려면 호출 전에 .copy()를 두세요.\r
  - color 인자가 (0, 255, 0)인데 빨강으로 보이면 RGB 이미지에 BGR 색을 넣은 흔한 실수입니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
\r
    drawCanvas = np.zeros((50, 100, 3), dtype=np.uint8)\r
    cv2.rectangle(drawCanvas, (20, 10), (80, 40), (0, 255, 0), thickness=-1)\r
\r
    insidePixel = drawCanvas[25, 30].tolist()\r
    outsidePixel = drawCanvas[5, 5].tolist()\r
\r
    {\r
        'insidePixel': insidePixel,\r
        'outsidePixel': outsidePixel,\r
        'rectangleFilled': insidePixel == [0, 255, 0],\r
    }\r
  exercise:\r
    prompt: 같은 canvas 크기에 빨강(BGR (0, 0, 255)) 직사각형을 (x=5, y=5)부터 (x=15, y=25)까지 그리고, 가운데 픽셀이 정말 빨강인지 확인하세요.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
\r
      redCanvas = np.zeros((50, 100, 3), dtype=np.uint8)\r
      cv2.rectangle(redCanvas, (5, 5), (15, 25), (___, ___, ___), thickness=-1)\r
\r
      redInside = redCanvas[15, 10].tolist()\r
      {\r
          'redInside': redInside,\r
          'isRed': redInside == [0, 0, 255],\r
      }\r
    hints:\r
    - BGR 빨강은 (0, 0, 255)입니다.\r
    - rectangle의 (x, y)와 인덱싱의 [y, x] 순서가 반대라는 점에 주의합니다.\r
    check:\r
      noError: cv2.rectangle 호출이 TypeError 없이 끝나야 합니다.\r
      resultCheck: redInside가 [0, 0, 255]이고 isRed가 True여야 합니다.\r
  check:\r
    noError: cv2.rectangle 호출이 TypeError 없이 끝나야 합니다.\r
    resultCheck: insidePixel이 [0, 255, 0]이고 outsidePixel이 [0, 0, 0]이며 rectangleFilled가 True여야 합니다.\r
- id: practice\r
  title: 실습 - china 이미지 한눈 분석\r
  structuredPrimary: true\r
  subtitle: 구조 정보 한 번에\r
  goal: china.jpg에 대해 shape, dtype, 채널별 평균, 가운데 픽셀, ROI 평균을 dict 한 개로 묶어 돌려주는 손 함수를 만듭니다.\r
  why: 새 이미지가 들어왔을 때 "이게 어떤 데이터인지" 한 번에 보고 받을 수 있는 진단 함수를 손으로 짜 보는 것이 이번 강의의 마지막 정리입니다.\r
  explanation: |-\r
    실무에서 새 이미지 입력이 들어오면 가장 먼저 하는 일은 shape/dtype/대표 픽셀 값을 한 번에 보는 것입니다. 이 함수를 미리 만들어 두면 어떤 입력이 와도 같은 형식의 진단 결과를 얻을 수 있습니다.\r
    함수는 read-only로 동작합니다. 원본을 건드리지 않고 view 슬라이스로만 통계를 계산합니다.\r
    ROI 평균을 가운데 100×100으로 잡아 둬서 sky/foreground 비교 같은 후속 분석에 그대로 들어갈 수 있게 합니다.\r
  tips:\r
  - 진단 함수는 dict 키 이름을 일관되게 두는 게 중요합니다. 다른 이미지에 같은 함수를 돌려도 비교 가능합니다.\r
  - .round(1)은 평균값이 7.342341 같은 긴 부동소수점으로 보이는 걸 막아 줍니다.\r
  snippet: |-\r
    import numpy as np\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def describeImage(image: np.ndarray) -> dict:\r
        height, width = image.shape[:2]\r
        centerY, centerX = height // 2, width // 2\r
        centerRoi = image[centerY - 50:centerY + 50, centerX - 50:centerX + 50]\r
        return {\r
            'shape': image.shape,\r
            'dtype': str(image.dtype),\r
            'meanPerChannel': image.mean(axis=(0, 1)).round(1).tolist(),\r
            'centerPixel': image[centerY, centerX].tolist(),\r
            'centerRoiMean': centerRoi.mean(axis=(0, 1)).round(1).tolist(),\r
        }\r
\r
\r
    describeImage(load_sample_image('china.jpg'))\r
  exercise:\r
    prompt: describeImage에 'isUint8' 키를 추가해 image.dtype == np.uint8 결과를 함께 돌려주도록 확장하세요. china 결과에서 isUint8이 True인지 확인합니다.\r
    starterCode: |-\r
      import numpy as np\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def describeImageExtended(image: np.ndarray) -> dict:\r
          height, width = image.shape[:2]\r
          centerY, centerX = height // 2, width // 2\r
          centerRoi = image[centerY - 50:centerY + 50, centerX - 50:centerX + 50]\r
          return {\r
              'shape': image.shape,\r
              'dtype': str(image.dtype),\r
              'meanPerChannel': image.mean(axis=(0, 1)).round(1).tolist(),\r
              'centerPixel': image[centerY, centerX].tolist(),\r
              'centerRoiMean': centerRoi.mean(axis=(0, 1)).round(1).tolist(),\r
              'isUint8': image.dtype == np.___,\r
          }\r
\r
\r
      describeImageExtended(load_sample_image('china.jpg'))\r
    hints:\r
    - dtype 비교에는 np.uint8을 그대로 씁니다.\r
    - 빈칸에는 uint8이 들어갑니다.\r
    check:\r
      noError: describeImageExtended 정의와 호출이 NameError 없이 끝나야 합니다.\r
      resultCheck: 결과 dict의 isUint8이 True이고 shape가 (427, 640, 3)이어야 합니다.\r
  check:\r
    noError: describeImage 정의와 호출이 NameError 없이 끝나야 합니다.\r
    resultCheck: 결과 dict의 shape가 (427, 640, 3), dtype이 'uint8', meanPerChannel 리스트 길이가 3이어야 합니다.\r
- id: workflow_validation\r
  title: 8단계. 구조 검증 함수\r
  structuredPrimary: true\r
  subtitle: assert로 입력 보장\r
  goal: 다음 단계에 들어가기 전 입력 ndarray가 (H, W, 3) uint8인지 검증하는 함수를 만들고, 의도적으로 잘못된 입력을 넣어 실패가 잡히는지 확인합니다.\r
  why: 운영에서는 입력 형식이 가끔 바뀝니다. 흑백이 섞여 들어오거나 dtype이 float인 경우, 다음 단계에서 이상한 결과가 나오는 대신 함수 입구에서 명확한 ValueError로 멈추는 게 훨씬 안전합니다.\r
  explanation: |-\r
    validate 함수는 두 가지를 확인합니다. ndim이 3이고 마지막 축이 3채널인지, 그리고 dtype이 np.uint8인지입니다. 두 조건이 모두 맞으면 True를 돌려주고, 아니면 명확한 메시지의 ValueError를 던집니다.\r
    오류 메시지에 실제 받은 값을 함께 넣어 두면 디버깅이 즉시 가능합니다. f"3채널 이미지가 아닙니다: {image.shape}" 같은 형태가 좋은 예입니다.\r
    검증 코드는 try/except 한 번으로 "정상 입력 통과" + "잘못된 입력 거부" 두 케이스를 한 셀에서 확인합니다. 이 흐름은 단위 테스트로 바로 옮길 수 있습니다.\r
  tips:\r
  - 검증 함수에 print 대신 ValueError를 쓰면 호출자가 try/except로 명확히 처리할 수 있습니다.\r
  - 입력 검증은 가능한 한 함수 첫 줄에서 끝내야 디버깅이 쉽습니다.\r
  snippet: |-\r
    import numpy as np\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def validateStructure(image: np.ndarray) -> bool:\r
        if image.ndim != 3 or image.shape[2] != 3:\r
            raise ValueError(f"3채널 이미지가 아닙니다: {image.shape}")\r
        if image.dtype != np.uint8:\r
            raise ValueError(f"uint8 이미지가 아닙니다: {image.dtype}")\r
        return True\r
\r
\r
    okResult = validateStructure(load_sample_image('flower.jpg'))\r
\r
    try:\r
        validateStructure(np.zeros((10, 10), dtype=np.uint8))\r
        grayMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        grayMessage = str(exc)\r
\r
    try:\r
        validateStructure(load_sample_image('flower.jpg').astype(np.float32))\r
        floatMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        floatMessage = str(exc)\r
\r
    {\r
        'okResult': okResult,\r
        'grayMessage': grayMessage,\r
        'floatMessage': floatMessage,\r
    }\r
  exercise:\r
    prompt: validateStructure에 width 인자(int)를 추가해 image.shape[1] == width가 아니면 ValueError를 던지도록 확장하세요. flower(width=640) 입력에 정상 통과, width=100 요청에 실패를 확인합니다.\r
    starterCode: |-\r
      import numpy as np\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def validateWithWidth(image: np.ndarray, width: int) -> bool:\r
          if image.ndim != 3 or image.shape[2] != 3:\r
              raise ValueError(f"3채널 이미지가 아닙니다: {image.shape}")\r
          if image.shape[1] != ___:\r
              raise ValueError(f"width 불일치: 기대 {width}, 실제 {image.shape[1]}")\r
          return True\r
\r
\r
      flowerOk = validateWithWidth(load_sample_image('flower.jpg'), 640)\r
      try:\r
          validateWithWidth(load_sample_image('flower.jpg'), 100)\r
          widthMessage = 'unexpected pass'\r
      except ValueError as exc:\r
          widthMessage = str(exc)\r
\r
      {'flowerOk': flowerOk, 'widthMessage': widthMessage}\r
    hints:\r
    - 빈칸에 들어갈 변수는 width입니다.\r
    - 메시지에 실제 width(640)와 기대 width(100)가 모두 포함되어야 디버깅이 쉽습니다.\r
    check:\r
      noError: validateWithWidth 정의와 두 호출이 끝나야 합니다.\r
      resultCheck: flowerOk가 True이고 widthMessage 안에 '640'과 '100'이 모두 포함되어야 합니다.\r
  check:\r
    noError: validateStructure 정의와 정상/실패 두 케이스가 처리되어야 합니다.\r
    resultCheck: okResult가 True이고 grayMessage/floatMessage에 'shape' 또는 'dtype' 단서가 들어 있어야 합니다.\r
`;export{e as default};