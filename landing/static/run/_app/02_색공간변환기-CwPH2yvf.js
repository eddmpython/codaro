var e=`meta:\r
  packages:\r
  - numpy\r
  - opencv-python\r
  - scikit-learn\r
  id: opencv_02\r
  title: 색공간변환기\r
  order: 2\r
  category: opencv\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - OpenCV\r
  - cvtColor\r
  - BGR\r
  - RGB\r
  - Gray\r
  - HSV\r
  - LAB\r
  seo:\r
    title: OpenCV 입문 - 색공간 변환기\r
    description: OpenCV cvtColor로 BGR, RGB, Gray, HSV, LAB 등 다양한 색공간을 변환하고 활용합니다.\r
    keywords:\r
    - OpenCV\r
    - cvtColor\r
    - 색공간\r
    - HSV\r
    - Gray\r
    - LAB\r
intro:\r
  emoji: 🌈\r
  goal: 같은 이미지를 BGR/Gray/HSV/LAB 네 색공간으로 직접 변환하며 각각이 어떤 정보를 강조하는지 손으로 비교합니다.\r
  description: 색공간은 픽셀 값을 표현하는 좌표계입니다. 어떤 좌표계에서 보는가에 따라 같은 사진이 "밝기", "색상", "지각 거리"로 다르게 해석됩니다.\r
  direction: cvtColor로 색공간을 바꾼 뒤 split으로 채널을 분리하고, HSV 마스크로 특정 색을 추출하는 흐름까지 한 강의에서 끝냅니다.\r
  benefits:\r
  - cv2.cvtColor의 code 인자 의미를 BGR2GRAY, BGR2HSV, BGR2LAB 세 개로 정리합니다.\r
  - HSV의 H/S/V 각 채널이 색상/채도/명도 중 무엇을 담는지 직접 출력합니다.\r
  - LAB의 L 채널을 그레이스케일과 비교해 "지각적 밝기"가 무엇인지 확인합니다.\r
  - cv2.inRange로 색상 마스크를 만들어 특정 색만 골라내는 흐름을 익힙니다.\r
  diagram:\r
    steps:\r
    - label: 기준 BGR 만들기\r
      detail: sklearn RGB 샘플을 cvtColor로 BGR로 뒤집어 OpenCV 입력 형식을 만듭니다.\r
    - label: Gray 변환\r
      detail: COLOR_BGR2GRAY로 1채널로 줄여 shape이 (H, W)가 되는 것을 확인합니다.\r
    - label: HSV 변환\r
      detail: COLOR_BGR2HSV로 H(0~179), S(0~255), V(0~255) 세 채널을 만들고 split으로 분리합니다.\r
    - label: LAB 변환\r
      detail: COLOR_BGR2LAB으로 L/a/b 채널을 만들고 L 채널을 그레이스케일과 시각 비교합니다.\r
    - label: HSV 색 마스크\r
      detail: cv2.inRange로 H 구간을 잡아 특정 색만 추출합니다.\r
    runtime:\r
    - label: opencv-python 패키지\r
      detail: meta.packages의 opencv-python이 가상환경에 있어야 cv2.cvtColor가 import됩니다.\r
    - label: 한 노트북 변수 공유\r
      detail: 한 셀에서 만든 photoBgr 같은 변수를 다음 셀에서 그대로 참조합니다.\r
    - label: 표시는 RGB로\r
      detail: matplotlib는 RGB만 그립니다. BGR 이미지를 imshow하면 색이 뒤집혀 보이므로 변환 후 보여줍니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 기준 BGR 만들기\r
  structuredPrimary: true\r
  subtitle: sklearn RGB → cv2 BGR\r
  goal: china 샘플을 RGB로 로드한 뒤 cvtColor로 BGR로 변환해 OpenCV 함수의 표준 입력 형태로 만듭니다.\r
  why: 이후 모든 cvtColor 호출은 BGR을 출발점으로 합니다. 처음에 BGR 한 줄을 정확히 만들어 두지 않으면 같은 함수 호출에서도 결과 색이 한 번씩 뒤집힙니다.\r
  explanation: |-\r
    sklearn.datasets.load_sample_image는 RGB ndarray를 돌려줍니다. OpenCV의 cv2 함수 군은 거의 모두 BGR을 가정하므로 처음에 한 번 cvtColor(src, cv2.COLOR_RGB2BGR)로 뒤집어 놓는 것이 표준입니다.\r
    뒤집은 결과의 shape, dtype은 그대로입니다. 단지 마지막 축의 0번과 2번 채널이 자리를 바꿉니다. 첫 픽셀의 RGB와 BGR 값을 함께 출력해 두면 변환이 정말 일어났는지 한눈에 확인할 수 있습니다.\r
    이렇게 만든 photoBgr 변수가 이후 모든 색공간 변환의 입력입니다.\r
  tips:\r
  - cv2.imread로 파일에서 직접 읽으면 처음부터 BGR이라 cvtColor가 필요 없습니다. sklearn 샘플을 쓰는 경우에만 이 변환이 필요합니다.\r
  - cvtColor는 새 ndarray를 만들어 돌려줍니다. 원본은 변하지 않습니다.\r
  snippet: |-\r
    import cv2\r
    from sklearn.datasets import load_sample_image\r
\r
    photoRgb = load_sample_image('china.jpg')\r
    photoBgr = cv2.cvtColor(photoRgb, cv2.COLOR_RGB2BGR)\r
\r
    {\r
        'shape': photoBgr.shape,\r
        'dtype': str(photoBgr.dtype),\r
        'firstPixelRgb': photoRgb[0, 0].tolist(),\r
        'firstPixelBgr': photoBgr[0, 0].tolist(),\r
    }\r
  exercise:\r
    prompt: 같은 흐름을 flower.jpg에 적용해 flowerBgr을 만들고 첫 픽셀의 RGB/BGR 쌍이 정말 역순인지 확인하세요.\r
    starterCode: |-\r
      import cv2\r
      from sklearn.datasets import load_sample_image\r
\r
      flowerRgb = load_sample_image('flower.jpg')\r
      flowerBgr = cv2.cvtColor(flowerRgb, cv2.COLOR_RGB2___)\r
\r
      {\r
          'firstPixelRgb': flowerRgb[0, 0].tolist(),\r
          'firstPixelBgr': flowerBgr[0, 0].tolist(),\r
          'reversed': flowerRgb[0, 0].tolist() == flowerBgr[0, 0].tolist()[::-1],\r
      }\r
    hints:\r
    - 빈칸에는 BGR이 들어갑니다.\r
    - 같은 픽셀의 RGB와 BGR은 마지막 축이 역순이어야 합니다.\r
    check:\r
      noError: cvtColor 호출이 NameError 없이 끝나야 합니다.\r
      resultCheck: 결과 dict의 reversed가 True여야 합니다.\r
  check:\r
    noError: cvtColor와 dict 구성이 NameError 없이 끝나야 합니다.\r
    resultCheck: firstPixelRgb와 firstPixelBgr이 길이 3이고 마지막 축이 역순이어야 합니다.\r
- id: step2_gray\r
  title: 2단계. 그레이스케일 변환\r
  structuredPrimary: true\r
  subtitle: COLOR_BGR2GRAY\r
  goal: photoBgr를 그레이스케일로 변환하고 결과의 shape가 2차원이 되며 평균 밝기가 원본 채널 평균과 다르게 가중치 적용된 값임을 확인합니다.\r
  why: 그레이스케일은 검출/필터/이진화 같은 후속 알고리즘의 기본 입력입니다. 단순 평균이 아니라 BT.601 가중치를 쓴다는 사실을 모르면 값을 직접 만들었을 때 OpenCV 결과와 미묘하게 달라집니다.\r
  explanation: |-\r
    cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)는 (H, W, 3) BGR을 (H, W) uint8로 줄여 줍니다. 채널 축이 사라지는 것이 핵심입니다.\r
    계산식은 Y = 0.299·R + 0.587·G + 0.114·B (BT.601 표준)입니다. 인간의 눈이 녹색에 가장 민감하고 파란색에 가장 둔감하다는 시각 특성을 반영한 가중치입니다. 단순 평균과 다르므로, 값이 미묘하게 다를 수 있습니다.\r
    plt.imshow로 그릴 때는 cmap='gray'를 줘야 회색조로 보입니다. 안 주면 matplotlib가 viridis(파랑-노랑) 색상표를 적용해 색이 이상해 보입니다.\r
  tips:\r
  - 단순 평균 그레이스케일이 필요하면 photoBgr.mean(axis=2).astype(np.uint8)로 만들 수 있습니다. OpenCV 표준과는 미세하게 달라집니다.\r
  - 그레이스케일을 다시 3채널로 복원하려면 cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)을 씁니다. 단, 한 번 흑백이 된 정보는 색이 복원되지 않습니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    from sklearn.datasets import load_sample_image\r
\r
    grayPhotoBgr = cv2.cvtColor(load_sample_image('china.jpg'), cv2.COLOR_RGB2BGR)\r
    grayPhoto = cv2.cvtColor(grayPhotoBgr, cv2.COLOR_BGR2GRAY)\r
\r
    {\r
        'grayShape': grayPhoto.shape,\r
        'grayDtype': str(grayPhoto.dtype),\r
        'grayMean': round(float(grayPhoto.mean()), 1),\r
        'simpleMean': round(float(grayPhotoBgr.mean()), 1),\r
    }\r
  exercise:\r
    prompt: COLOR_BGR2GRAY 대신 직접 BT.601 가중치를 적용해 같은 그레이스케일을 만들고, cv2 결과와 절대 차이의 최댓값이 작은지 확인하세요.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
      from sklearn.datasets import load_sample_image\r
\r
      manualBgr = cv2.cvtColor(load_sample_image('china.jpg'), cv2.COLOR_RGB2BGR)\r
      cvGray = cv2.cvtColor(manualBgr, cv2.COLOR_BGR2GRAY)\r
\r
      manualGray = (\r
          0.114 * manualBgr[..., 0] + 0.587 * manualBgr[..., 1] + 0.___ * manualBgr[..., 2]\r
      ).astype(np.uint8)\r
\r
      diffMax = int(np.abs(manualGray.astype(int) - cvGray.astype(int)).max())\r
      {'shape': manualGray.shape, 'diffMax': diffMax}\r
    hints:\r
    - "R 채널 가중치는 0.299입니다."\r
    - cv2 내부 반올림과 미세 차이로 diffMax는 0~2 사이가 일반적입니다.\r
    check:\r
      noError: 가중합 계산과 astype이 ValueError 없이 끝나야 합니다.\r
      resultCheck: shape가 (427, 640)이고 diffMax가 3 이하여야 합니다.\r
  check:\r
    noError: cvtColor 호출과 통계 계산이 끝나야 합니다.\r
    resultCheck: grayShape가 (427, 640), grayDtype이 'uint8'이어야 합니다.\r
- id: step3_hsv\r
  title: 3단계. HSV 분해\r
  structuredPrimary: true\r
  subtitle: H/S/V 채널 분리\r
  goal: photoBgr을 HSV로 바꾼 뒤 split으로 H/S/V 세 채널을 분리하고 각 채널의 값 범위와 의미를 확인합니다.\r
  why: 색 기반 필터링과 추적은 거의 항상 HSV에서 합니다. H 한 값으로 색상 종류를 식별할 수 있다는 점이 RGB와 결정적으로 다른 장점이라 이 단계에서 채널 분리 감각을 굳혀야 합니다.\r
  explanation: |-\r
    cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)는 결과를 uint8로 돌려줍니다. OpenCV의 H는 표준 0~360°를 절반(0~179)으로 압축해 uint8 한 칸에 넣은 것입니다. S와 V는 그대로 0~255로 표시됩니다.\r
    cv2.split(hsv)은 (H, S, V) 세 개의 (H_img, W_img) 단채널 이미지를 돌려줍니다. 각각을 따로 시각화하면 H는 색상이 비슷한 영역, S는 채도가 높은 영역, V는 밝은 영역을 강조하는 그림이 됩니다.\r
    H의 대표 값은 빨강 0, 노랑 30, 초록 60, 청록 90, 파랑 120, 자홍 150 (OpenCV 기준)입니다. 빨강이 0과 179 양 끝에 동시에 있는 것이 H의 특징입니다.\r
  tips:\r
  - cv2.split은 메모리를 새로 잡으니 큰 이미지에서는 hsv[..., 0] 같은 view 슬라이싱이 더 빠릅니다.\r
  - H 채널만 시각화할 때는 cmap='hsv'를 쓰면 색상이 직관적으로 표현됩니다.\r
  snippet: |-\r
    import cv2\r
    from sklearn.datasets import load_sample_image\r
\r
    hsvSourceBgr = cv2.cvtColor(load_sample_image('china.jpg'), cv2.COLOR_RGB2BGR)\r
    hsvPhoto = cv2.cvtColor(hsvSourceBgr, cv2.COLOR_BGR2HSV)\r
    hueChannel, satChannel, valChannel = cv2.split(hsvPhoto)\r
\r
    {\r
        'shape': hsvPhoto.shape,\r
        'hueRange': (int(hueChannel.min()), int(hueChannel.max())),\r
        'satRange': (int(satChannel.min()), int(satChannel.max())),\r
        'valRange': (int(valChannel.min()), int(valChannel.max())),\r
    }\r
  exercise:\r
    prompt: H 채널의 평균을 정수로 반올림한 뒤 H 값이 가장 많이 나오는 정수 bin이 무엇인지 numpy.bincount로 찾아 dominantHue를 dict로 돌려주세요.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
      from sklearn.datasets import load_sample_image\r
\r
      dominantSourceBgr = cv2.cvtColor(load_sample_image('china.jpg'), cv2.COLOR_RGB2BGR)\r
      dominantHsv = cv2.cvtColor(dominantSourceBgr, cv2.COLOR_BGR2HSV)\r
      dominantHue = int(np.bincount(dominantHsv[..., ___].ravel()).argmax())\r
\r
      {'dominantHue': dominantHue}\r
    hints:\r
    - HSV 배열의 채널 인덱스에서 H는 0입니다.\r
    - bincount는 0~max(value) 길이의 카운트 배열을 돌려주고 argmax로 최빈값을 찾습니다.\r
    check:\r
      noError: cvtColor와 bincount 호출이 IndexError 없이 끝나야 합니다.\r
      resultCheck: dominantHue가 0~179 사이 정수여야 합니다.\r
  check:\r
    noError: cvtColor와 split이 NameError 없이 끝나야 합니다.\r
    resultCheck: hueRange의 최댓값이 179 이하, satRange/valRange의 최댓값이 255 이하여야 합니다.\r
- id: step4_lab\r
  title: 4단계. LAB의 L 채널\r
  structuredPrimary: true\r
  subtitle: 지각 밝기 vs 그레이스케일\r
  goal: photoBgr을 LAB로 바꾼 뒤 L 채널을 분리해 BT.601 그레이스케일과 평균을 비교해 두 "밝기"가 다른 것임을 확인합니다.\r
  why: LAB의 L은 인간의 지각적 밝기를 모델링한 값이라 단순 가중합 그레이스케일과 다릅니다. 콘트라스트 보정(CLAHE)이나 색 분리 작업의 표준 채널이라 차이를 한 번 직접 봐 두는 게 좋습니다.\r
  explanation: |-\r
    cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)는 (H, W, 3) LAB을 uint8로 돌려줍니다. L은 0~255로 정규화되어 들어가고, a와 b는 -128~127 범위를 0~255로 오프셋한 형태입니다(128이 중립).\r
    L 채널만 시각화하면 그레이스케일과 비슷해 보이지만, 같은 밝기를 다르게 평가합니다. 평균값을 비교해 보면 일치하지 않는 경우가 많습니다. 콘트라스트 향상은 LAB의 L에 적용한 뒤 다시 BGR로 되돌리는 게 색을 안 망가뜨리는 표준 패턴입니다.\r
    a와 b는 색 정보만 담아 0에 가까울수록 무채색입니다. 색의 거리 계산이 필요한 경우(예: 색 클러스터링)에는 LAB의 (a, b) 평면이 유클리드 거리에 가까워 RGB보다 안정적입니다.\r
  tips:\r
  - LAB의 a, b 채널 평균은 무채색 이미지에서 128에 가깝게 나옵니다. 값이 128에서 크게 벗어나면 채색이 강한 영역이 있다는 신호입니다.\r
  - CLAHE 보정은 L 채널에만 적용하는 게 표준입니다. RGB 직접 보정은 색이 튑니다.\r
  snippet: |-\r
    import cv2\r
    from sklearn.datasets import load_sample_image\r
\r
    labSourceBgr = cv2.cvtColor(load_sample_image('china.jpg'), cv2.COLOR_RGB2BGR)\r
    labPhoto = cv2.cvtColor(labSourceBgr, cv2.COLOR_BGR2LAB)\r
    lChannel, aChannel, bChannel = cv2.split(labPhoto)\r
\r
    grayBt601 = cv2.cvtColor(labSourceBgr, cv2.COLOR_BGR2GRAY)\r
\r
    {\r
        'lShape': lChannel.shape,\r
        'lMean': round(float(lChannel.mean()), 1),\r
        'bt601Mean': round(float(grayBt601.mean()), 1),\r
        'aBMidpoint': (round(float(aChannel.mean()), 1), round(float(bChannel.mean()), 1)),\r
    }\r
  exercise:\r
    prompt: a와 b 채널의 평균이 128에 얼마나 가까운지 확인하고, 두 값이 모두 110~146 안에 들어가면 isMostlyNeutral을 True로 돌려주세요.\r
    starterCode: |-\r
      import cv2\r
      from sklearn.datasets import load_sample_image\r
\r
      neutralBgr = cv2.cvtColor(load_sample_image('china.jpg'), cv2.COLOR_RGB2BGR)\r
      neutralLab = cv2.cvtColor(neutralBgr, cv2.COLOR_BGR2LAB)\r
      neutralA = float(neutralLab[..., 1].mean())\r
      neutralB = float(neutralLab[..., 2].mean())\r
\r
      isMostlyNeutral = 110 <= neutralA <= 146 and 110 <= neutralB <= ___\r
\r
      {'a': round(neutralA, 1), 'b': round(neutralB, 1), 'isMostlyNeutral': isMostlyNeutral}\r
    hints:\r
    - 빈칸에 들어갈 값은 146입니다.\r
    - china 사진은 풍경이라 a, b 평균이 128 부근에 모입니다.\r
    check:\r
      noError: cvtColor와 mean 호출이 NameError 없이 끝나야 합니다.\r
      resultCheck: isMostlyNeutral이 True여야 합니다.\r
  check:\r
    noError: LAB 변환과 split이 NameError 없이 끝나야 합니다.\r
    resultCheck: lShape가 (427, 640), lMean과 bt601Mean이 정수로 다르게 나와야 합니다.\r
- id: step5_compare\r
  title: 5단계. 네 색공간 한 줄 비교\r
  structuredPrimary: true\r
  subtitle: shape/mean/dtype 비교 dict\r
  goal: 같은 photoBgr에 대해 RGB/Gray/HSV/LAB 네 색공간의 shape, mean을 한 dict로 묶어 색공간이 정보를 어떻게 다르게 표현하는지 한눈에 비교합니다.\r
  why: 색공간 선택은 후속 작업의 성패를 좌우합니다. 같은 입력을 네 가지로 펼쳐 놓은 진단표가 있으면 "이 작업엔 어떤 색공간이 적합한가"를 빠르게 결정할 수 있습니다.\r
  explanation: |-\r
    네 색공간을 동시에 비교할 때 키는 shape(차원 정보), mean(전체 분포의 무게중심), 채널 수입니다. shape의 차원이 3에서 2로 줄어든 것이 그레이스케일의 특징입니다.\r
    HSV의 mean을 그대로 보면 H/S/V 평균이 한 값으로 묶여 의미가 흐려지므로 axis=(0,1)로 채널별 평균을 따로 봅니다. LAB도 마찬가지입니다.\r
    이 형식의 dict는 자동화 도구에서 "어떤 사진은 색조가 진한가, 채도가 낮은가" 같은 헤더 정보로 그대로 활용할 수 있습니다.\r
  tips:\r
  - dict 키 이름을 일관되게 두면 여러 이미지를 같은 형식으로 비교할 수 있습니다.\r
  - 채널별 평균 계산은 image.mean(axis=(0, 1))이 표준입니다. axis=2면 픽셀별 평균이 되어 모양이 (H, W)가 됩니다.\r
  snippet: |-\r
    import cv2\r
    from sklearn.datasets import load_sample_image\r
\r
    compareBgr = cv2.cvtColor(load_sample_image('china.jpg'), cv2.COLOR_RGB2BGR)\r
    compareGray = cv2.cvtColor(compareBgr, cv2.COLOR_BGR2GRAY)\r
    compareHsv = cv2.cvtColor(compareBgr, cv2.COLOR_BGR2HSV)\r
    compareLab = cv2.cvtColor(compareBgr, cv2.COLOR_BGR2LAB)\r
\r
    {\r
        'BGR': {'shape': compareBgr.shape, 'mean': compareBgr.mean(axis=(0, 1)).round(1).tolist()},\r
        'Gray': {'shape': compareGray.shape, 'mean': round(float(compareGray.mean()), 1)},\r
        'HSV': {'shape': compareHsv.shape, 'mean': compareHsv.mean(axis=(0, 1)).round(1).tolist()},\r
        'LAB': {'shape': compareLab.shape, 'mean': compareLab.mean(axis=(0, 1)).round(1).tolist()},\r
    }\r
  exercise:\r
    prompt: 같은 비교를 flower.jpg에 적용해 네 색공간 dict를 만들고, 'channelCount' 키에 BGR/Gray/HSV/LAB 채널 수를 함께 돌려주세요.\r
    starterCode: |-\r
      import cv2\r
      from sklearn.datasets import load_sample_image\r
\r
      flowerBgr = cv2.cvtColor(load_sample_image('flower.jpg'), cv2.COLOR_RGB2BGR)\r
      flowerGray = cv2.cvtColor(flowerBgr, cv2.COLOR_BGR2GRAY)\r
      flowerHsv = cv2.cvtColor(flowerBgr, cv2.COLOR_BGR2HSV)\r
      flowerLab = cv2.cvtColor(flowerBgr, cv2.COLOR_BGR2LAB)\r
\r
      {\r
          'channelCount': {\r
              'BGR': flowerBgr.shape[2],\r
              'Gray': 1 if flowerGray.ndim == 2 else flowerGray.shape[2],\r
              'HSV': flowerHsv.shape[2],\r
              'LAB': flowerLab.shape[___],\r
          },\r
      }\r
    hints:\r
    - LAB shape는 (H, W, 3) 형태라 채널 수는 인덱스 2 위치에 있습니다.\r
    - 빈칸에는 2가 들어갑니다.\r
    check:\r
      noError: 네 cvtColor와 dict 구성이 NameError 없이 끝나야 합니다.\r
      resultCheck: channelCount의 Gray가 1, 나머지가 3이어야 합니다.\r
  check:\r
    noError: 네 cvtColor 호출이 끝나야 합니다.\r
    resultCheck: 네 색공간 모두 'shape', 'mean' 키를 가져야 하고 Gray만 mean이 float이어야 합니다.\r
- id: step6_back\r
  title: 6단계. 왕복 변환과 손실\r
  structuredPrimary: true\r
  subtitle: BGR→HSV→BGR roundtrip\r
  goal: BGR→HSV→BGR 왕복 변환 결과를 원본과 절대 차이로 비교해 양자화 오차가 어느 정도인지 직접 측정합니다.\r
  why: 색공간 왕복은 보통 가역이지만 uint8 양자화 때문에 0이 아닌 미세 오차가 생깁니다. 이 오차의 크기를 알면 "왕복 후 다시 비교" 같은 검증 코드의 허용 오차를 합리적으로 정할 수 있습니다.\r
  explanation: |-\r
    cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)와 cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)는 짝을 이룹니다. 두 번 적용해 BGR로 돌아오면 원본과 거의 같지만 정확히 같지는 않습니다.\r
    차이는 uint8 → float → uint8 단계에서의 반올림에서 옵니다. 절대 차이의 최댓값은 보통 1~3 정도이고, 평균 차이는 1 미만으로 떨어집니다.\r
    이 결과를 알고 있으면 "왕복 변환 후 동일성 검사" 같은 단위 테스트에서 np.array_equal 대신 (diff < 5).all() 형태의 허용 오차 비교를 쓰는 게 표준이 됩니다.\r
  tips:\r
  - HSV→BGR 후 다시 BGR→RGB로 한 단계 더 돌려야 plt.imshow로 정확한 색으로 볼 수 있습니다.\r
  - 정확한 왕복이 필요하면 cv2.cvtColor 대신 float64 색공간 계산을 직접 구현해야 합니다. 비용이 큽니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    from sklearn.datasets import load_sample_image\r
\r
    rtBgr = cv2.cvtColor(load_sample_image('china.jpg'), cv2.COLOR_RGB2BGR)\r
    rtHsv = cv2.cvtColor(rtBgr, cv2.COLOR_BGR2HSV)\r
    rtBack = cv2.cvtColor(rtHsv, cv2.COLOR_HSV2BGR)\r
\r
    diff = np.abs(rtBgr.astype(int) - rtBack.astype(int))\r
\r
    {\r
        'diffMax': int(diff.max()),\r
        'diffMean': round(float(diff.mean()), 3),\r
        'isExactly': bool(np.array_equal(rtBgr, rtBack)),\r
    }\r
  exercise:\r
    prompt: 같은 측정을 LAB 왕복(BGR→LAB→BGR)에 적용해 diffMax와 diffMean을 돌려주고, HSV 왕복과 어느 쪽 오차가 더 작은지 직접 보세요.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
      from sklearn.datasets import load_sample_image\r
\r
      labRtBgr = cv2.cvtColor(load_sample_image('china.jpg'), cv2.COLOR_RGB2BGR)\r
      labRtLab = cv2.cvtColor(labRtBgr, cv2.COLOR_BGR2LAB)\r
      labRtBack = cv2.cvtColor(labRtLab, cv2.COLOR_LAB2___)\r
\r
      labDiff = np.abs(labRtBgr.astype(int) - labRtBack.astype(int))\r
      {'diffMax': int(labDiff.max()), 'diffMean': round(float(labDiff.mean()), 3)}\r
    hints:\r
    - 빈칸에는 BGR이 들어갑니다.\r
    - LAB 왕복은 보통 HSV 왕복보다 약간 큰 오차가 나옵니다.\r
    check:\r
      noError: 세 cvtColor 호출과 차이 계산이 끝나야 합니다.\r
      resultCheck: diffMax가 10 이하의 작은 정수여야 합니다.\r
  check:\r
    noError: 세 cvtColor 호출과 차이 계산이 NameError 없이 끝나야 합니다.\r
    resultCheck: diffMax가 5 이하, diffMean이 1 미만, isExactly가 False여야 합니다.\r
- id: practice\r
  title: 실습 - HSV 색 추출\r
  structuredPrimary: true\r
  subtitle: cv2.inRange로 특정 색 마스크\r
  goal: 사람이 만든 작은 컬러 패치 이미지에서 빨강만 골라내는 HSV 마스크를 만들고, 추출된 픽셀 수가 기대값과 같은지 확인합니다.\r
  why: 색 추출은 자동화의 흔한 입력 단계입니다. 사진에서 표시등, 옷 색, 표지판처럼 특정 색만 골라낼 때 HSV 마스크는 가장 짧고 안정적인 경로라 손으로 한 번 정확히 짜 봐야 합니다.\r
  explanation: |-\r
    cv2.inRange(hsv, lowerBound, upperBound)는 각 채널이 동시에 범위 안에 들어 있는 픽셀에만 255를 찍은 단채널 마스크를 돌려줍니다. 모양은 입력과 같은 (H, W)입니다.\r
    빨강은 H가 0과 179 양 끝에 있으므로, 두 범위의 마스크를 따로 만들어 OR로 합칩니다. 예제에서는 한쪽(0~10) 범위만 다뤄 단순화합니다.\r
    실무에서는 채도 S와 명도 V도 최소값을 둬서 회색 픽셀이 잘못 잡히는 걸 막습니다. S>=80, V>=80 같은 임계값이 시작점으로 자주 쓰입니다.\r
  tips:\r
  - 마스크 픽셀 수는 (mask == 255).sum()으로 얻습니다.\r
  - 빨강이 양 끝에 있는 특성 때문에 cv2.inRange를 두 번 호출해 cv2.bitwise_or로 합치는 패턴이 표준입니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
\r
    patchBgr = np.zeros((30, 90, 3), dtype=np.uint8)\r
    patchBgr[:, :30] = [0, 0, 255]\r
    patchBgr[:, 30:60] = [0, 255, 0]\r
    patchBgr[:, 60:] = [255, 0, 0]\r
\r
    patchHsv = cv2.cvtColor(patchBgr, cv2.COLOR_BGR2HSV)\r
    redMask = cv2.inRange(patchHsv, (0, 80, 80), (10, 255, 255))\r
\r
    {\r
        'maskShape': redMask.shape,\r
        'maskNonZero': int((redMask == 255).sum()),\r
        'expectedRedPixels': 30 * 30,\r
    }\r
  exercise:\r
    prompt: 같은 patchBgr에서 녹색을 추출하는 마스크를 만들고 추출된 픽셀 수가 30*30과 같은지 확인하세요. 녹색의 H는 약 60 부근입니다.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
\r
      greenPatch = np.zeros((30, 90, 3), dtype=np.uint8)\r
      greenPatch[:, :30] = [0, 0, 255]\r
      greenPatch[:, 30:60] = [0, 255, 0]\r
      greenPatch[:, 60:] = [255, 0, 0]\r
\r
      greenHsv = cv2.cvtColor(greenPatch, cv2.COLOR_BGR2HSV)\r
      greenMask = cv2.inRange(greenHsv, (___, 80, 80), (70, 255, 255))\r
\r
      {\r
          'maskNonZero': int((greenMask == 255).sum()),\r
          'isExactly900': int((greenMask == 255).sum()) == 30 * 30,\r
      }\r
    hints:\r
    - "녹색 H의 하한은 약 50입니다."\r
    - 마스크 픽셀 수가 정확히 900이어야 합니다.\r
    check:\r
      noError: inRange 호출이 TypeError 없이 끝나야 합니다.\r
      resultCheck: maskNonZero가 900이고 isExactly900이 True여야 합니다.\r
  check:\r
    noError: inRange와 마스크 카운트가 끝나야 합니다.\r
    resultCheck: maskShape가 (30, 90), maskNonZero가 정확히 900이어야 합니다.\r
- id: workflow_validation\r
  title: 8단계. 색 추출 검증 루프\r
  structuredPrimary: true\r
  subtitle: 합성 입력으로 결과 보장\r
  goal: 합성한 컬러 패치 입력의 정답 픽셀 수를 미리 계산해 두고, 각 색의 inRange 마스크가 정확히 그 픽셀 수를 잡는지 assert로 검증합니다.\r
  why: HSV 임계값은 사진마다 손보게 됩니다. 합성 입력에 대해서는 정답이 정확히 정해지므로, 임계값을 바꾼 뒤 합성 입력을 통과하는지를 회귀 테스트처럼 활용할 수 있습니다.\r
  explanation: |-\r
    합성 입력은 각 색의 픽셀 수를 직접 결정할 수 있어 정답이 명확합니다. 빨강 30×30=900, 녹색 30×30=900, 파랑 30×30=900처럼 미리 계산해 두면 검증이 단순해집니다.\r
    extractByHue는 한 색의 마스크 픽셀 수를 돌려주는 작은 함수입니다. 함수로 묶어 두면 임계값 변주 실험이 깔끔해집니다.\r
    assert로 정답과 비교한 뒤 dict로 결과를 함께 돌려주면 회귀 테스트와 셀 출력 두 용도로 같이 씁니다.\r
  tips:\r
  - 합성 입력 단위 테스트는 임계값/알고리즘 변경 후 가장 먼저 돌려 보는 안전망이 됩니다.\r
  - 실제 사진에 임계값을 적용하기 전 합성 입력으로 알고리즘을 통과시키면 디버깅 시간이 크게 줄어듭니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
\r
\r
    def extractByHue(image: np.ndarray, hueLow: int, hueHigh: int) -> int:\r
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)\r
        mask = cv2.inRange(hsv, (hueLow, 80, 80), (hueHigh, 255, 255))\r
        return int((mask == 255).sum())\r
\r
\r
    canvas = np.zeros((30, 90, 3), dtype=np.uint8)\r
    canvas[:, :30] = [0, 0, 255]\r
    canvas[:, 30:60] = [0, 255, 0]\r
    canvas[:, 60:] = [255, 0, 0]\r
\r
    redCount = extractByHue(canvas, 0, 10)\r
    greenCount = extractByHue(canvas, 50, 70)\r
    blueCount = extractByHue(canvas, 110, 130)\r
\r
    assert redCount == 900\r
    assert greenCount == 900\r
    assert blueCount == 900\r
\r
    {'red': redCount, 'green': greenCount, 'blue': blueCount}\r
  exercise:\r
    prompt: extractByHue 함수의 S/V 임계값을 60으로 낮추면 마스크 결과가 어떻게 변하는지 빨강 한 색에 적용해 확인하세요. 정답 900이 유지되어야 합니다.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
\r
\r
      def extractByHueRelaxed(image: np.ndarray, hueLow: int, hueHigh: int) -> int:\r
          hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)\r
          mask = cv2.inRange(hsv, (hueLow, ___, 60), (hueHigh, 255, 255))\r
          return int((mask == 255).sum())\r
\r
\r
      relaxedCanvas = np.zeros((30, 90, 3), dtype=np.uint8)\r
      relaxedCanvas[:, :30] = [0, 0, 255]\r
      relaxedCanvas[:, 30:60] = [0, 255, 0]\r
      relaxedCanvas[:, 60:] = [255, 0, 0]\r
\r
      redRelaxed = extractByHueRelaxed(relaxedCanvas, 0, 10)\r
      {'redRelaxed': redRelaxed, 'sameAsBefore': redRelaxed == 900}\r
    hints:\r
    - S 하한 자리에 60을 넣습니다.\r
    - 순색 빨강은 S=255라 임계값을 60까지 낮춰도 결과가 같습니다.\r
    check:\r
      noError: extractByHueRelaxed 정의와 호출이 NameError 없이 끝나야 합니다.\r
      resultCheck: redRelaxed가 900이고 sameAsBefore가 True여야 합니다.\r
  check:\r
    noError: extractByHue 정의와 세 색 호출이 AssertionError 없이 끝나야 합니다.\r
    resultCheck: red/green/blue 모두 900이어야 합니다.\r
`;export{e as default};