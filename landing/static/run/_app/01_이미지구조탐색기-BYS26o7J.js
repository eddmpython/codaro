var e=`meta:
  packages:
  - numpy
  - opencv-python
  - scikit-learn
  id: opencv_01
  title: 이미지구조탐색기
  order: 1
  category: opencv
  difficulty: ⭐
  badge: 입문
  tags:
  - OpenCV
  - cv2
  - ndarray
  - shape
  - dtype
  - BGR
  - RGB
  seo:
    title: OpenCV 입문 - 이미지 구조 탐색기
    description: OpenCV에서 이미지가 NumPy 배열로 어떻게 표현되는지 배웁니다. shape, dtype, BGR 순서를 이해합니다.
    keywords:
    - OpenCV
    - cv2
    - ndarray
    - shape
    - dtype
    - BGR
intro:
  emoji: 🔬
  goal: OpenCV에서 이미지가 NumPy 배열로 어떻게 표현되는지 한 단계씩 직접 들여다봅니다.
  description: shape, dtype, 채널 순서 같은 "이 배열이 뭔지"를 먼저 정확히 잡으면 이후의 색공간 변환, 필터, 검출이 안전해집니다.
  direction: load_sample_image로 받은 ndarray의 shape/dtype/채널을 직접 출력하고, BGR↔RGB 변환을 손으로 확인합니다.
  benefits:
  - ndarray.shape를 (높이, 너비, 채널)로 해석하는 사고를 굳힙니다.
  - dtype=uint8의 0~255 범위가 픽셀 밝기와 어떻게 대응되는지 확인합니다.
  - cvtColor로 BGR↔RGB를 양방향 변환하며 색이 뒤집히는 현상을 직접 봅니다.
  - 인덱싱과 슬라이싱으로 픽셀 하나와 ROI 영역을 추출합니다.
  diagram:
    steps:
    - label: 샘플 이미지 로드
      detail: sklearn.datasets.load_sample_image으로 RGB ndarray를 받습니다.
    - label: 배열 구조 확인
      detail: shape, dtype, 채널 수를 출력해 입력 형식이 기대대로인지 점검합니다.
    - label: 색공간 변환
      detail: cv2.cvtColor로 RGB↔BGR을 왕복하며 같은 픽셀이 다른 순서로 저장됨을 확인합니다.
    - label: 인덱싱과 ROI
      detail: img[y, x]로 한 픽셀, img[y1:y2, x1:x2]로 사각형 ROI를 잘라 봅니다.
    - label: 구조 검증 함수
      detail: validate 함수로 shape/dtype 기대값을 assert해 다음 단계 입력을 보장합니다.
    runtime:
    - label: opencv-python 패키지
      detail: meta.packages의 opencv-python이 가상환경에 준비돼야 cv2 import가 통과합니다.
    - label: matplotlib 표시
      detail: plt.imshow는 RGB를 기대하므로 OpenCV가 만든 BGR을 그리면 색이 뒤집힙니다.
    - label: 셀 간 변수 공유
      detail: 같은 노트북 위에서 img 같은 변수는 다음 셀에서도 그대로 보입니다.
sections:
- id: step1_load
  title: 1단계. 샘플 이미지 로드
  structuredPrimary: true
  subtitle: sklearn 샘플로 시작
  goal: sklearn의 flower 샘플을 ndarray로 받고 type/shape/dtype을 한 번에 확인합니다.
  why: OpenCV 학습을 파일 다운로드 없이 시작하려면 sklearn 샘플이 가장 짧은 경로입니다. 이 단계에서 "이미지가 곧 ndarray"라는 첫 번째 멘탈 모델을 굳혀야 이후 모든 cv2 함수의 인자가 자연스럽게 해석됩니다.
  explanation: |-
    sklearn.datasets.load_sample_image('flower.jpg')는 (높이, 너비, 3) 모양의 RGB uint8 ndarray를 돌려줍니다. 별도 디스크 I/O 없이 sklearn 패키지에 묶여 배포되는 이미지를 즉시 메모리에 올려 줍니다.
    OpenCV(cv2)에서 cv2.imread를 쓰면 BGR로 받지만, sklearn 샘플은 RGB라는 점이 중요합니다. 같은 픽셀이라도 라이브러리에 따라 채널 순서가 달라서, 어떤 함수에 넘기느냐에 따라 변환이 필요합니다.
    이 셀에서 우선 type, shape, dtype 세 가지만 동시에 출력해 "받은 객체의 정체"를 한 줄로 정리해 둡니다.
  tips:
  - sklearn 샘플은 RGB 순서라 matplotlib.pyplot.imshow로 바로 그릴 수 있습니다.
  - cv2.imread는 BGR 순서라 sklearn 샘플과 정반대입니다. 두 경로를 섞어 쓰면 cvtColor가 반드시 필요합니다.
  snippet: |-
    from sklearn.datasets import load_sample_image

    flowerRgb = load_sample_image('flower.jpg')

    {
        'type': type(flowerRgb).__name__,
        'shape': flowerRgb.shape,
        'dtype': str(flowerRgb.dtype),
    }
  exercise:
    prompt: flower 대신 'china.jpg' 샘플을 로드하고 같은 dict 형태로 type/shape/dtype을 돌려주세요.
    starterCode: |-
      from sklearn.datasets import load_sample_image

      chinaRgb = load_sample_image('___')

      {
          'type': type(chinaRgb).__name__,
          'shape': chinaRgb.shape,
          'dtype': str(chinaRgb.dtype),
      }
    hints:
    - 빈칸에 들어갈 파일명은 'china.jpg'입니다.
    - china 샘플의 shape는 (427, 640, 3)입니다.
    check:
      noError: load_sample_image 호출이 NameError, FileNotFoundError 없이 끝나야 합니다.
      resultCheck: 결과 dict의 type이 'ndarray', shape의 마지막 요소가 3, dtype이 'uint8'이어야 합니다.
  check:
    noError: load_sample_image 호출과 dict 구성이 NameError 없이 끝나야 합니다.
    resultCheck: 결과 dict의 type이 'ndarray', shape의 마지막 요소가 3, dtype이 'uint8'이어야 합니다.
- id: step2_shape
  title: 2단계. shape 분해
  structuredPrimary: true
  subtitle: 높이, 너비, 채널 동시 분해
  goal: ndarray.shape를 (height, width, channels)로 분해하고 각 의미를 dict로 묶어 확인합니다.
  why: shape의 첫 축이 높이라는 사실은 cv2.rectangle(img, (x, y), ...) 같은 좌표 인자와 정반대 순서라 가장 자주 실수가 나는 부분입니다. 명시적으로 변수 이름을 붙여 두면 이후 코드에서 헷갈리지 않습니다.
  explanation: |-
    이미지 ndarray의 shape는 (높이, 너비, 채널) 3원소 튜플입니다. 흑백 이미지면 채널 차원이 없고 (높이, 너비) 2원소가 됩니다.
    "높이가 먼저"는 NumPy의 행렬 컨벤션(행, 열)을 그대로 따른 결과입니다. 반면 cv2.rectangle, cv2.line 같은 그리기 함수의 좌표는 (x, y) 순서를 씁니다. 이 두 컨벤션이 같은 코드 안에서 충돌하므로 항상 의식해야 합니다.
    이 셀은 변수에 height/width/channels라는 이름을 명시적으로 붙여 둬서, 이후 셀에서 ROI 슬라이싱 인자를 만들 때 의미가 흐려지지 않게 합니다.
  tips:
  - Pillow의 Image.size는 (너비, 높이)라 반대 순서입니다. 두 라이브러리를 섞을 때 자주 실수합니다.
  - 채널이 4이면 알파가 포함된 RGBA/BGRA입니다. cv2.imread(path, cv2.IMREAD_UNCHANGED)로 받았을 때 자주 나옵니다.
  snippet: |-
    from sklearn.datasets import load_sample_image

    shapeFlower = load_sample_image('flower.jpg')
    flowerHeight, flowerWidth, flowerChannels = shapeFlower.shape

    {
        'height': flowerHeight,
        'width': flowerWidth,
        'channels': flowerChannels,
    }
  exercise:
    prompt: china.jpg를 로드해 height/width/channels를 분해한 뒤 width가 height보다 큰지를 isLandscape 키로 함께 돌려주세요.
    starterCode: |-
      from sklearn.datasets import load_sample_image

      shapeChina = load_sample_image('china.jpg')
      chinaHeight, chinaWidth, chinaChannels = shapeChina.shape

      {
          'height': chinaHeight,
          'width': chinaWidth,
          'channels': chinaChannels,
          'isLandscape': chinaWidth ___ chinaHeight,
      }
    hints:
    - "isLandscape는 가로가 세로보다 큰지를 묻는 부울이므로 비교 연산자 '>'가 들어갑니다."
    - china 샘플은 가로가 더 긴 풍경 사진입니다.
    check:
      noError: shape 분해와 비교 연산이 ValueError 없이 끝나야 합니다.
      resultCheck: 결과 dict의 height가 427, width가 640, isLandscape가 True여야 합니다.
  check:
    noError: shape 분해와 dict 구성이 ValueError 없이 끝나야 합니다.
    resultCheck: 결과 dict의 height가 427, width가 640, channels가 3이어야 합니다.
- id: step3_dtype
  title: 3단계. dtype과 값 범위
  structuredPrimary: true
  subtitle: uint8의 0~255
  goal: ndarray.dtype과 min/max 값을 동시에 확인해 픽셀 범위가 0~255 안에 들어 있는지 검사합니다.
  why: dtype을 잘못 알면 산술 연산에서 값이 잘리거나 오버플로가 납니다. uint8 + uint8이 256이면 0이 되는 wrap-around가 대표적이라 이 단계에서 범위 감각을 굳혀야 합니다.
  explanation: |-
    OpenCV가 다루는 일반 이미지의 dtype은 uint8입니다. unsigned 8-bit integer로 0~255 256단계가 픽셀 한 칸당 한 채널의 밝기를 나타냅니다.
    딥러닝 입력처럼 0.0~1.0 float이 필요한 경우 img.astype(np.float32) / 255.0으로 변환합니다. 이 변환을 잊고 cv2 함수에 float을 넘기면 함수에 따라 결과가 제대로 안 나오거나 에러가 납니다.
    범위 검증은 img.min(), img.max()로 한 줄에 확인합니다. 정상 범위가 [0, 255]를 벗어나면 dtype 변환을 거치다 손상된 이미지일 가능성이 큽니다.
  tips:
  - uint8 산술은 wrap-around가 일어납니다. 250 + 10이 4로 떨어집니다. 안전하게 더하려면 cv2.add 또는 int 변환 후 np.clip을 씁니다.
  - cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX)는 값 범위를 [0, 255]로 다시 펴 줄 때 유용합니다.
  snippet: |-
    import numpy as np
    from sklearn.datasets import load_sample_image

    dtypeFlower = load_sample_image('flower.jpg')

    {
        'dtype': str(dtypeFlower.dtype),
        'min': int(dtypeFlower.min()),
        'max': int(dtypeFlower.max()),
        'isUint8': dtypeFlower.dtype == np.uint8,
    }
  exercise:
    prompt: dtypeFlower를 float32로 변환해 0.0~1.0 범위로 정규화한 뒤 같은 dict 형태로 dtype/min/max를 돌려주세요.
    starterCode: |-
      import numpy as np
      from sklearn.datasets import load_sample_image

      normFlower = load_sample_image('flower.jpg').astype(np.___) / 255.0

      {
          'dtype': str(normFlower.dtype),
          'min': float(normFlower.min()),
          'max': float(normFlower.max()),
      }
    hints:
    - 빈칸에는 float32가 들어갑니다.
    - 255로 나눈 결과의 max는 정확히 1.0입니다.
    check:
      noError: astype 변환이 TypeError 없이 끝나야 합니다.
      resultCheck: 결과 dict의 dtype이 'float32', max가 1.0과 거의 같아야 합니다.
  check:
    noError: dtype/min/max 호출이 NameError 없이 끝나야 합니다.
    resultCheck: 결과 dict의 dtype이 'uint8', max가 255, isUint8이 True여야 합니다.
- id: step4_bgr
  title: 4단계. BGR↔RGB 변환
  structuredPrimary: true
  subtitle: cv2.cvtColor로 색 순서 뒤집기
  goal: RGB 이미지를 BGR로 변환하고 다시 RGB로 되돌려 와도 픽셀이 정확히 같은지 확인합니다.
  why: OpenCV는 BGR, matplotlib과 sklearn은 RGB를 씁니다. 변환을 한 번 빼먹으면 빨강이 파랑으로 보이는 버그가 나기 쉽습니다. 왕복 변환이 idempotent인지 직접 검사해 두면 어디서 색이 뒤집혔는지 빠르게 잡을 수 있습니다.
  explanation: |-
    cv2.cvtColor(src, code)에서 code 자리에 cv2.COLOR_RGB2BGR이나 cv2.COLOR_BGR2RGB을 넘기면 채널 축의 0번과 2번이 서로 자리를 바꿉니다. 메모리에는 새 ndarray가 만들어집니다.
    같은 변환을 두 번 적용하면 원본과 비트 단위로 같아야 합니다. np.array_equal로 검증할 수 있고, 이 검증이 실패하면 변환 단계 외에 어딘가에서 값이 변형됐다는 신호입니다.
    plt.imshow는 항상 RGB로 그립니다. BGR 이미지를 그리면 색이 뒤집힌 채로 나오는데, 이 시각적 단서가 잘못된 변환을 빠르게 찾는 데 도움이 됩니다.
  tips:
  - cv2.cvtColor는 새 배열을 만들므로 원본은 변하지 않습니다. 메모리가 신경 쓰이면 in-place로 쓸 수 있는 함수는 따로 없어 cv2.merge나 인덱싱을 검토해야 합니다.
  - "OpenCV의 cv2.imshow는 반대로 BGR을 기대합니다. matplotlib(RGB)과 정반대라 헷갈리기 쉽습니다."
  snippet: |-
    import cv2
    import numpy as np
    from sklearn.datasets import load_sample_image

    bgrFlower = cv2.cvtColor(load_sample_image('flower.jpg'), cv2.COLOR_RGB2BGR)
    backToRgbFlower = cv2.cvtColor(bgrFlower, cv2.COLOR_BGR2RGB)

    {
        'firstPixelRgb': load_sample_image('flower.jpg')[0, 0].tolist(),
        'firstPixelBgr': bgrFlower[0, 0].tolist(),
        'roundTripEqual': np.array_equal(load_sample_image('flower.jpg'), backToRgbFlower),
    }
  exercise:
    prompt: cv2.cvtColor 대신 채널 인덱싱(img[..., ::-1])으로 RGB→BGR을 만들고 cvtColor 결과와 비트 단위로 같은지 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np
      from sklearn.datasets import load_sample_image

      rgbSource = load_sample_image('flower.jpg')
      bgrByCvt = cv2.cvtColor(rgbSource, cv2.COLOR_RGB2BGR)
      bgrBySlice = rgbSource[..., ___]

      {
          'shapeBySlice': bgrBySlice.shape,
          'sameAsCvt': np.array_equal(bgrByCvt, bgrBySlice),
      }
    hints:
    - 마지막 축의 순서를 뒤집는 슬라이스는 ::-1입니다.
    - 채널 축만 뒤집고 행/열은 그대로 두어야 하므로 ... (Ellipsis)을 함께 씁니다.
    check:
      noError: 슬라이싱과 array_equal 호출이 IndexError 없이 끝나야 합니다.
      resultCheck: 결과 dict의 shapeBySlice가 (427, 640, 3), sameAsCvt가 True여야 합니다.
  check:
    noError: cvtColor 두 번 호출이 NameError 없이 끝나야 합니다.
    resultCheck: firstPixelRgb와 firstPixelBgr이 정확히 역순이고 roundTripEqual이 True여야 합니다.
- id: step5_pixel
  title: 5단계. 한 픽셀 접근
  structuredPrimary: true
  subtitle: img[y, x]로 한 값 읽기
  goal: 임의 좌표 (y, x)의 픽셀을 [R, G, B] 리스트로 읽고 채널별 값이 어떤 색을 의미하는지 손으로 풀어 봅니다.
  why: 픽셀 한 칸을 정확히 읽는 능력은 모든 검출/필터 디버깅의 출발입니다. 좌표 순서 (y, x)와 채널 순서가 같이 헷갈리기 때문에 작은 좌표에서 한 번 명확히 잡고 가야 합니다.
  explanation: |-
    NumPy 인덱싱 img[y, x]는 (행, 열) 컨벤션이라 첫 인덱스가 y(높이 방향), 두 번째가 x(너비 방향)입니다. 반환값은 채널 개수만큼의 길이를 가진 1차원 ndarray입니다.
    .tolist()로 Python 리스트로 바꾸면 노트북에서 값을 그대로 출력하기 좋습니다. 채널이 RGB냐 BGR이냐는 받은 이미지에 따라 다릅니다. 이 셀의 소스는 sklearn → RGB라 [R, G, B] 순서입니다.
    여러 픽셀을 같은 모양으로 비교하려면 좌표 리스트를 만들어 dict로 묶어 두는 편이 디버깅에 좋습니다.
  tips:
  - img[y, x, c]로 채널 c 한 개만 꺼낼 수도 있습니다. img[y, x][0]보다 약간 빠릅니다.
  - cv2.imread로 받은 BGR 이미지에서 같은 코드를 돌리면 같은 위치라도 [R, G, B] 순서가 [B, G, R]로 뒤집힙니다.
  snippet: |-
    from sklearn.datasets import load_sample_image

    pixelFlower = load_sample_image('flower.jpg')

    {
        'topLeft': pixelFlower[0, 0].tolist(),
        'center': pixelFlower[pixelFlower.shape[0] // 2, pixelFlower.shape[1] // 2].tolist(),
        'bottomRight': pixelFlower[-1, -1].tolist(),
    }
  exercise:
    prompt: pixelFlower의 좌표 (50, 100), (200, 300), (400, 600) 세 픽셀을 읽어 dict의 'samples' 키에 리스트로 묶어 돌려주세요.
    starterCode: |-
      from sklearn.datasets import load_sample_image

      sampleFlower = load_sample_image('flower.jpg')

      {
          'samples': [
              sampleFlower[___, ___].tolist(),
              sampleFlower[200, 300].tolist(),
              sampleFlower[400, 600].tolist(),
          ],
      }
    hints:
    - 첫 빈칸 쌍에는 (50, 100)이 들어갑니다.
    - 각 픽셀은 [R, G, B] 3원소 리스트입니다.
    check:
      noError: 픽셀 인덱싱이 IndexError 없이 끝나야 합니다.
      resultCheck: samples 리스트가 3개 요소이고, 각 요소가 길이 3 정수 리스트여야 합니다.
  check:
    noError: 픽셀 인덱싱이 IndexError 없이 끝나야 합니다.
    resultCheck: 세 픽셀 모두 길이 3 정수 리스트로 돌아와야 합니다.
- id: step6_slice
  title: 6단계. ROI 슬라이싱
  structuredPrimary: true
  subtitle: 사각형 영역 잘라내기
  goal: 이미지 가운데를 중심으로 200×300 ROI를 잘라 shape, dtype, 평균 밝기를 한 번에 점검합니다.
  why: ROI는 검출/추적/분류의 기본 단위입니다. 슬라이스 한 줄로 정확한 직사각형을 떼어낼 수 있는지가 이후 모든 모델 입력의 품질을 결정합니다.
  explanation: |-
    NumPy 슬라이싱 img[y1:y2, x1:x2]는 y1≤y<y2, x1≤x<x2인 직사각형을 새 view로 돌려줍니다. 메모리를 새로 잡지 않고 원본과 같은 버퍼를 공유합니다.
    공유 버퍼라 ROI에 값을 쓰면 원본이 함께 변합니다. 변경 가능성이 있으면 .copy()로 떨어트려야 합니다. 본 예제는 통계만 보므로 view 그대로 씁니다.
    실무에서는 좌표가 음수나 이미지 밖으로 나가지 않게 np.clip이나 max(0, ...) 패턴으로 보호합니다. 본 예제는 가운데 기준이라 그 위험이 없습니다.
  tips:
  - 슬라이스는 view, 인덱스 배열(img[[1,2,3]])은 copy입니다. 두 동작 차이를 의식하지 못하면 디버깅 시간이 길어집니다.
  - ROI의 평균은 .mean()으로 한 줄에 얻습니다. axis=(0,1)을 주면 채널별 평균이 나옵니다.
  snippet: |-
    from sklearn.datasets import load_sample_image

    roiFlower = load_sample_image('flower.jpg')
    roiHeight, roiWidth, _ = roiFlower.shape
    roiCenterY = roiHeight // 2
    roiCenterX = roiWidth // 2

    centerRoi = roiFlower[roiCenterY - 100:roiCenterY + 100, roiCenterX - 150:roiCenterX + 150]

    {
        'shape': centerRoi.shape,
        'dtype': str(centerRoi.dtype),
        'meanPerChannel': centerRoi.mean(axis=(0, 1)).round(1).tolist(),
    }
  exercise:
    prompt: ROI 크기를 100×200(높이×너비)으로 줄여 잘라 보고, 같은 dict 형태로 shape와 채널별 평균을 돌려주세요.
    starterCode: |-
      from sklearn.datasets import load_sample_image

      smallSource = load_sample_image('flower.jpg')
      smallHeight, smallWidth, _ = smallSource.shape
      smallCenterY = smallHeight // 2
      smallCenterX = smallWidth // 2

      smallRoi = smallSource[smallCenterY - ___:smallCenterY + ___, smallCenterX - 100:smallCenterX + 100]

      {
          'shape': smallRoi.shape,
          'meanPerChannel': smallRoi.mean(axis=(0, 1)).round(1).tolist(),
      }
    hints:
    - "ROI 높이 100을 만들려면 위/아래 각각 50씩 잡으면 됩니다."
    - 슬라이스의 마지막 인덱스는 포함되지 않으므로 (center-50, center+50)이 정확히 100픽셀입니다.
    check:
      noError: 슬라이싱과 mean 호출이 IndexError 없이 끝나야 합니다.
      resultCheck: smallRoi.shape가 (100, 200, 3)이고 meanPerChannel이 3원소 리스트여야 합니다.
  check:
    noError: 슬라이싱과 mean 호출이 IndexError 없이 끝나야 합니다.
    resultCheck: centerRoi.shape가 (200, 300, 3)이고 meanPerChannel 리스트 길이가 3이어야 합니다.
- id: step7_draw
  title: 7단계. 도형 그려 좌표 확인
  structuredPrimary: true
  subtitle: cv2.rectangle로 (x, y) 검증
  goal: 빈 canvas에 직사각형을 그려서 그리기 함수의 (x, y) 좌표가 ndarray 인덱싱 (y, x)와 어떻게 다른지 직접 비교합니다.
  why: cv2.rectangle((x1, y1), (x2, y2), color, thickness)의 좌표 순서는 NumPy 인덱싱과 정반대라 가장 자주 실수가 나는 부분입니다. 작은 canvas에 한 번 그려 두면 평생 가는 감각이 생깁니다.
  explanation: |-
    그리기 함수에 넣는 color는 BGR 튜플입니다. (0, 255, 0)이 녹색, (0, 0, 255)가 빨강, (255, 0, 0)이 파랑입니다. matplotlib으로 그대로 imshow하면 색이 뒤집혀 보이므로 검증은 인덱스로 합니다.
    thickness가 양수면 선 두께, -1이면 채우기입니다. 본 예제는 직사각형 안을 채워 인덱싱으로 "안쪽 픽셀이 정말 그 색인지" 명확히 확인합니다.
    검증 시 rectangle의 (x, y)와 인덱싱의 [y, x]가 바뀐다는 점을 보는 게 핵심입니다. 본 예제는 (왼쪽위 x=20, y=10)부터 (오른쪽아래 x=80, y=40)까지 채우고 안쪽 한 점 [25, 30]이 녹색인지 확인합니다.
  tips:
  - 그리기 함수는 in-place로 동작합니다. 원본을 보존하려면 호출 전에 .copy()를 두세요.
  - color 인자가 (0, 255, 0)인데 빨강으로 보이면 RGB 이미지에 BGR 색을 넣은 흔한 실수입니다.
  snippet: |-
    import cv2
    import numpy as np

    drawCanvas = np.zeros((50, 100, 3), dtype=np.uint8)
    cv2.rectangle(drawCanvas, (20, 10), (80, 40), (0, 255, 0), thickness=-1)

    insidePixel = drawCanvas[25, 30].tolist()
    outsidePixel = drawCanvas[5, 5].tolist()

    {
        'insidePixel': insidePixel,
        'outsidePixel': outsidePixel,
        'rectangleFilled': insidePixel == [0, 255, 0],
    }
  exercise:
    prompt: 같은 canvas 크기에 빨강(BGR (0, 0, 255)) 직사각형을 (x=5, y=5)부터 (x=15, y=25)까지 그리고, 가운데 픽셀이 정말 빨강인지 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np

      redCanvas = np.zeros((50, 100, 3), dtype=np.uint8)
      cv2.rectangle(redCanvas, (5, 5), (15, 25), (___, ___, ___), thickness=-1)

      redInside = redCanvas[15, 10].tolist()
      {
          'redInside': redInside,
          'isRed': redInside == [0, 0, 255],
      }
    hints:
    - BGR 빨강은 (0, 0, 255)입니다.
    - rectangle의 (x, y)와 인덱싱의 [y, x] 순서가 반대라는 점에 주의합니다.
    check:
      noError: cv2.rectangle 호출이 TypeError 없이 끝나야 합니다.
      resultCheck: redInside가 [0, 0, 255]이고 isRed가 True여야 합니다.
  check:
    noError: cv2.rectangle 호출이 TypeError 없이 끝나야 합니다.
    resultCheck: insidePixel이 [0, 255, 0]이고 outsidePixel이 [0, 0, 0]이며 rectangleFilled가 True여야 합니다.
- id: practice
  title: 실습 - china 이미지 한눈 분석
  structuredPrimary: true
  subtitle: 구조 정보 한 번에
  goal: china.jpg에 대해 shape, dtype, 채널별 평균, 가운데 픽셀, ROI 평균을 dict 한 개로 묶어 돌려주는 손 함수를 만듭니다.
  why: 새 이미지가 들어왔을 때 "이게 어떤 데이터인지" 한 번에 보고 받을 수 있는 진단 함수를 손으로 짜 보는 것이 이번 강의의 마지막 정리입니다.
  explanation: |-
    실무에서 새 이미지 입력이 들어오면 가장 먼저 하는 일은 shape/dtype/대표 픽셀 값을 한 번에 보는 것입니다. 이 함수를 미리 만들어 두면 어떤 입력이 와도 같은 형식의 진단 결과를 얻을 수 있습니다.
    함수는 read-only로 동작합니다. 원본을 건드리지 않고 view 슬라이스로만 통계를 계산합니다.
    ROI 평균을 가운데 100×100으로 잡아 둬서 sky/foreground 비교 같은 후속 분석에 그대로 들어갈 수 있게 합니다.
  tips:
  - 진단 함수는 dict 키 이름을 일관되게 두는 게 중요합니다. 다른 이미지에 같은 함수를 돌려도 비교 가능합니다.
  - .round(1)은 평균값이 7.342341 같은 긴 부동소수점으로 보이는 걸 막아 줍니다.
  snippet: |-
    import numpy as np
    from sklearn.datasets import load_sample_image


    def describeImage(image: np.ndarray) -> dict:
        height, width = image.shape[:2]
        centerY, centerX = height // 2, width // 2
        centerRoi = image[centerY - 50:centerY + 50, centerX - 50:centerX + 50]
        return {
            'shape': image.shape,
            'dtype': str(image.dtype),
            'meanPerChannel': image.mean(axis=(0, 1)).round(1).tolist(),
            'centerPixel': image[centerY, centerX].tolist(),
            'centerRoiMean': centerRoi.mean(axis=(0, 1)).round(1).tolist(),
        }


    describeImage(load_sample_image('china.jpg'))
  exercise:
    prompt: describeImage에 'isUint8' 키를 추가해 image.dtype == np.uint8 결과를 함께 돌려주도록 확장하세요. china 결과에서 isUint8이 True인지 확인합니다.
    starterCode: |-
      import numpy as np
      from sklearn.datasets import load_sample_image


      def describeImageExtended(image: np.ndarray) -> dict:
          height, width = image.shape[:2]
          centerY, centerX = height // 2, width // 2
          centerRoi = image[centerY - 50:centerY + 50, centerX - 50:centerX + 50]
          return {
              'shape': image.shape,
              'dtype': str(image.dtype),
              'meanPerChannel': image.mean(axis=(0, 1)).round(1).tolist(),
              'centerPixel': image[centerY, centerX].tolist(),
              'centerRoiMean': centerRoi.mean(axis=(0, 1)).round(1).tolist(),
              'isUint8': image.dtype == np.___,
          }


      describeImageExtended(load_sample_image('china.jpg'))
    hints:
    - dtype 비교에는 np.uint8을 그대로 씁니다.
    - 빈칸에는 uint8이 들어갑니다.
    check:
      noError: describeImageExtended 정의와 호출이 NameError 없이 끝나야 합니다.
      resultCheck: 결과 dict의 isUint8이 True이고 shape가 (427, 640, 3)이어야 합니다.
  check:
    noError: describeImage 정의와 호출이 NameError 없이 끝나야 합니다.
    resultCheck: 결과 dict의 shape가 (427, 640, 3), dtype이 'uint8', meanPerChannel 리스트 길이가 3이어야 합니다.
- id: workflow_validation
  title: 8단계. 구조 검증 함수
  structuredPrimary: true
  subtitle: assert로 입력 보장
  goal: 다음 단계에 들어가기 전 입력 ndarray가 (H, W, 3) uint8인지 검증하는 함수를 만들고, 의도적으로 잘못된 입력을 넣어 실패가 잡히는지 확인합니다.
  why: 운영에서는 입력 형식이 가끔 바뀝니다. 흑백이 섞여 들어오거나 dtype이 float인 경우, 다음 단계에서 이상한 결과가 나오는 대신 함수 입구에서 명확한 ValueError로 멈추는 게 훨씬 안전합니다.
  explanation: |-
    validate 함수는 두 가지를 확인합니다. ndim이 3이고 마지막 축이 3채널인지, 그리고 dtype이 np.uint8인지입니다. 두 조건이 모두 맞으면 True를 돌려주고, 아니면 명확한 메시지의 ValueError를 던집니다.
    오류 메시지에 실제 받은 값을 함께 넣어 두면 디버깅이 즉시 가능합니다. f"3채널 이미지가 아닙니다: {image.shape}" 같은 형태가 좋은 예입니다.
    검증 코드는 try/except 한 번으로 "정상 입력 통과" + "잘못된 입력 거부" 두 케이스를 한 셀에서 확인합니다. 이 흐름은 단위 테스트로 바로 옮길 수 있습니다.
  tips:
  - 검증 함수에 print 대신 ValueError를 쓰면 호출자가 try/except로 명확히 처리할 수 있습니다.
  - 입력 검증은 가능한 한 함수 첫 줄에서 끝내야 디버깅이 쉽습니다.
  snippet: |-
    import numpy as np
    from sklearn.datasets import load_sample_image


    def validateStructure(image: np.ndarray) -> bool:
        if image.ndim != 3 or image.shape[2] != 3:
            raise ValueError(f"3채널 이미지가 아닙니다: {image.shape}")
        if image.dtype != np.uint8:
            raise ValueError(f"uint8 이미지가 아닙니다: {image.dtype}")
        return True


    okResult = validateStructure(load_sample_image('flower.jpg'))

    try:
        validateStructure(np.zeros((10, 10), dtype=np.uint8))
        grayMessage = 'unexpected pass'
    except ValueError as exc:
        grayMessage = str(exc)

    try:
        validateStructure(load_sample_image('flower.jpg').astype(np.float32))
        floatMessage = 'unexpected pass'
    except ValueError as exc:
        floatMessage = str(exc)

    {
        'okResult': okResult,
        'grayMessage': grayMessage,
        'floatMessage': floatMessage,
    }
  exercise:
    prompt: validateStructure에 width 인자(int)를 추가해 image.shape[1] == width가 아니면 ValueError를 던지도록 확장하세요. flower(width=640) 입력에 정상 통과, width=100 요청에 실패를 확인합니다.
    starterCode: |-
      import numpy as np
      from sklearn.datasets import load_sample_image


      def validateWithWidth(image: np.ndarray, width: int) -> bool:
          if image.ndim != 3 or image.shape[2] != 3:
              raise ValueError(f"3채널 이미지가 아닙니다: {image.shape}")
          if image.shape[1] != ___:
              raise ValueError(f"width 불일치: 기대 {width}, 실제 {image.shape[1]}")
          return True


      flowerOk = validateWithWidth(load_sample_image('flower.jpg'), 640)
      try:
          validateWithWidth(load_sample_image('flower.jpg'), 100)
          widthMessage = 'unexpected pass'
      except ValueError as exc:
          widthMessage = str(exc)

      {'flowerOk': flowerOk, 'widthMessage': widthMessage}
    hints:
    - 빈칸에 들어갈 변수는 width입니다.
    - 메시지에 실제 width(640)와 기대 width(100)가 모두 포함되어야 디버깅이 쉽습니다.
    check:
      noError: validateWithWidth 정의와 두 호출이 끝나야 합니다.
      resultCheck: flowerOk가 True이고 widthMessage 안에 '640'과 '100'이 모두 포함되어야 합니다.
  check:
    noError: validateStructure 정의와 정상/실패 두 케이스가 처리되어야 합니다.
    resultCheck: okResult가 True이고 grayMessage/floatMessage에 'shape' 또는 'dtype' 단서가 들어 있어야 합니다.
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
  - id: opencv_01-opencv_structure-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - workflow_validation
    title: 이미지 구조 탐색기 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: rows·cols·channels와 memory continuity를 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_opencv_structure_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_opencv_structure_contract(value):
            raise NotImplementedError
      solution: |
        def audit_opencv_structure_contract(value):
            required = ['rows', 'cols', 'channels', 'contiguous']
            rules = [{'id': 'rows', 'field': 'rows', 'kind': 'positive'}, {'id': 'cols', 'field': 'cols', 'kind': 'positive'}, {'id': 'channels', 'field': 'channels', 'kind': 'enum', 'values': [1, 3, 4]}, {'id': 'contiguous', 'field': 'contiguous', 'kind': 'enum', 'values': [True, False]}]
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
            return {"accepted": not missing and not violations, "topic": 'opencv_structure', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.opencv.opencv_01.opencv_structure-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.opencv.opencv_01.opencv_structure-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_opencv_structure_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              rows: 480
              cols: 640
              channels: 3
              contiguous: true
          expectedReturn:
            accepted: true
            topic: opencv_structure
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              cols: 640
              channels: 3
              contiguous: true
          expectedReturn:
            accepted: false
            topic: opencv_structure
            missing:
            - rows
            violations:
            - rows
        - id: reports-topic-invariants
          arguments:
          - value:
              rows: 0
              cols: -1
              channels: 2
              contiguous: 'yes'
          expectedReturn:
            accepted: false
            topic: opencv_structure
            missing: []
            violations:
            - channels
            - cols
            - contiguous
            - rows
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: opencv_01-opencv_structure-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - opencv_01-opencv_structure-contract-audit-mastery
    title: 이미지 구조 탐색기 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_opencv_structure_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_opencv_structure_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_opencv_structure_result(expected, observed):
            identity = ['sourceHash', 'layout']
            metrics = {'byteCount': 0}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'opencv_structure', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.opencv.opencv_01.opencv_structure-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.opencv.opencv_01.opencv_structure-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_opencv_structure_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: os1
              layout: HWC
              byteCount: 921600
          - value:
              sourceHash: os1
              layout: HWC
              byteCount: 921600
          expectedReturn:
            passed: true
            topic: opencv_structure
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: os1
              layout: HWC
              byteCount: 921600
          - value:
              sourceHash: os2
              layout: CHW
              byteCount: 900000
          expectedReturn:
            passed: false
            topic: opencv_structure
            missing: []
            identityMismatch:
            - layout
            - sourceHash
            metricDrift:
            - byteCount
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: os1
              layout: HWC
              byteCount: 921600
          - value: {}
          expectedReturn:
            passed: false
            topic: opencv_structure
            missing:
            - byteCount
            - layout
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: opencv_01-opencv_structure-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - opencv_01-opencv_structure-result-reconciliation-transfer
    title: 이미지 구조 탐색기 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_opencv_structure_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_opencv_structure_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_opencv_structure_evidence(stage):
            stages = {'source': {'action': 'validate image structure source', 'evidence': 'rows cols channels stride', 'risk': 'invalid image contract'}, 'operation': {'action': 'run bounded image structure operation', 'evidence': 'memory layout trace', 'risk': 'unstable parameters'}, 'result': {'action': 'reconcile image structure result', 'evidence': 'byte-count reconciliation', 'risk': 'wrong visual inference'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.opencv.opencv_01.opencv_structure-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.opencv.opencv_01.opencv_structure-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_opencv_structure_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate image structure source
            evidence: rows cols channels stride
            risk: invalid image contract
        - id: recalls-operation
          arguments:
          - value: operation
          expectedReturn:
            action: run bounded image structure operation
            evidence: memory layout trace
            risk: unstable parameters
        - id: recalls-result
          arguments:
          - value: result
          expectedReturn:
            action: reconcile image structure result
            evidence: byte-count reconciliation
            risk: wrong visual inference
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};