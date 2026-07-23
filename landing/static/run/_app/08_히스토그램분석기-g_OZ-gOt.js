var e=`meta:\r
  packages:\r
  - numpy\r
  - opencv-python\r
  - scikit-learn\r
  id: opencv_08\r
  title: 히스토그램분석기\r
  order: 8\r
  category: opencv\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - OpenCV\r
  - calcHist\r
  - equalizeHist\r
  - CLAHE\r
  - 히스토그램\r
  seo:\r
    title: OpenCV 중급 - 히스토그램 분석기\r
    description: OpenCV의 calcHist/equalizeHist/CLAHE로 밝기 분포를 분석하고 대비를 정량적으로 향상시킵니다.\r
    keywords:\r
    - OpenCV\r
    - calcHist\r
    - equalizeHist\r
    - CLAHE\r
    - 히스토그램\r
intro:\r
  emoji: 📊\r
  goal: calcHist로 밝기 분포를 측정하고 equalizeHist/CLAHE로 대비를 향상시킨 뒤 표준편차 같은 수치 지표로 개선 정도를 정량 평가합니다.\r
  description: 히스토그램은 이미지의 "밝기 가구 분포"입니다. 평활화는 그 분포를 0~255에 고르게 펴서 대비를 키우는 작업입니다.\r
  direction: 합성 저대비 입력에서 평활화 전후 표준편차를 비교하고, LAB 색공간을 거쳐 컬러 이미지에 안전하게 적용하는 흐름을 다룹니다.\r
  benefits:\r
  - calcHist의 256-bin 출력이 (256, 1) shape로 나오는 형식을 직접 확인합니다.\r
  - equalizeHist 전후 표준편차로 대비 향상이 정말 일어났는지 검증합니다.\r
  - CLAHE의 clipLimit과 tileGridSize가 결과에 어떻게 작용하는지 비교합니다.\r
  - 컬러 평활화는 LAB의 L 채널에만 적용하는 패턴을 손으로 구현합니다.\r
  diagram:\r
    steps:\r
    - label: 그레이스케일 입력 준비\r
      detail: sklearn flower RGB → BGR → GRAY 흐름으로 단채널 입력을 만듭니다.\r
    - label: calcHist\r
      detail: 256-bin 히스토그램을 계산해 분포 dict로 정리합니다.\r
    - label: equalizeHist\r
      detail: 전역 평활화로 표준편차가 늘어나는지 측정합니다.\r
    - label: CLAHE\r
      detail: 적응형 평활화로 지역 대비를 살리며 전역 평활화의 과도함을 피합니다.\r
    - label: LAB 컬러 적용\r
      detail: 컬러 입력은 L 채널만 평활화하고 다시 BGR로 되돌립니다.\r
    runtime:\r
    - label: opencv-python 패키지\r
      detail: meta.packages의 opencv-python이 가상환경에 있어야 calcHist/equalizeHist/createCLAHE가 import됩니다.\r
    - label: 단채널 입력\r
      detail: equalizeHist와 CLAHE는 단채널만 받습니다. 컬러는 LAB의 L에 적용한 뒤 merge합니다.\r
    - label: 합성 저대비 입력\r
      detail: 95~155 같은 좁은 범위에 모인 합성 입력으로 평활화 효과를 정량적으로 비교합니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 저대비 합성 입력\r
  structuredPrimary: true\r
  subtitle: 95~155 좁은 범위\r
  goal: linspace(95, 155, 160)을 100행 반복해 가로 그래디언트 + 한가운데 직사각형이 있는 저대비 흑백 입력을 만들고 픽셀 범위/표준편차를 확인합니다.\r
  why: 평활화 효과는 입력의 동적 범위가 좁을 때 가장 잘 보입니다. 0~255 전 범위에 펴진 입력은 이미 대비가 좋아 평활화 효과가 약합니다. 좁은 범위 합성 입력으로 시작하면 알고리즘의 작동을 명확히 볼 수 있습니다.\r
  explanation: |-\r
    np.tile(np.linspace(95, 155, 160), (100, 1))는 (100, 160) 모양으로 95~155 값이 가로로 균일하게 펼쳐진 ndarray입니다. 거기에 한가운데 직사각형을 그려서 살짝 다른 영역을 만듭니다.\r
    이 입력의 표준편차는 약 17 정도로 낮습니다. 평활화 후에는 60~70대까지 늘어나는 게 일반적입니다. 표준편차의 변화량이 대비 향상의 정량 지표입니다.\r
    실무에서는 이런 저대비 사진(흐린 날, 안개, 저조도)에 평활화를 자주 씁니다. 합성 입력으로 알고리즘 동작을 검증한 뒤 실제 사진으로 일반화합니다.\r
  tips:\r
  - np.linspace(start, stop, num)은 균등 간격 ndarray를 만듭니다. dtype을 명시하지 않으면 float64가 기본입니다.\r
  - np.tile(a, reps)은 ndarray를 reps만큼 반복해 더 큰 ndarray를 만듭니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
\r
    histCanvas = np.tile(np.linspace(95, 155, 160, dtype=np.uint8), (100, 1))\r
    cv2.rectangle(histCanvas, (45, 25), (115, 75), 135, -1)\r
\r
    {\r
        'shape': histCanvas.shape,\r
        'dtype': str(histCanvas.dtype),\r
        'minMax': (int(histCanvas.min()), int(histCanvas.max())),\r
        'std': round(float(histCanvas.std()), 2),\r
    }\r
  exercise:\r
    prompt: 같은 패턴으로 더 좁은 110~140 범위 입력을 만들어 표준편차가 step1보다 작은지 확인하세요.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
\r
      narrowCanvas = np.tile(np.linspace(110, ___, 160, dtype=np.uint8), (100, 1))\r
      cv2.rectangle(narrowCanvas, (45, 25), (115, 75), 130, -1)\r
\r
      {'minMax': (int(narrowCanvas.min()), int(narrowCanvas.max())), 'std': round(float(narrowCanvas.std()), 2)}\r
    hints:\r
    - 범위는 110~140이라 stop은 140입니다.\r
    - 빈칸에는 140이 들어갑니다.\r
    check:\r
      noError: linspace와 rectangle 호출이 끝나야 합니다.\r
      resultCheck: minMax의 두 값이 110~140 범위 안에 있고 std가 양수여야 합니다.\r
  check:\r
    noError: linspace와 rectangle 호출이 끝나야 합니다.\r
    resultCheck: shape가 (100, 160), minMax가 (95, 155) 범위 안에 있어야 합니다.\r
- id: step2_calc\r
  title: 2단계. calcHist 256-bin\r
  structuredPrimary: true\r
  subtitle: 분포 측정 한 함수\r
  goal: 합성 입력에 cv2.calcHist를 적용해 (256, 1) shape의 히스토그램을 얻고, 가장 빈도가 높은 bin 인덱스와 빈도 합계가 전체 픽셀 수와 같은지 확인합니다.\r
  why: 평활화 알고리즘이 어떻게 작동하는지 이해하려면 입력 분포를 먼저 정확히 알아야 합니다. calcHist는 그 분포를 256-bin 배열로 돌려줘 분석의 기본 도구입니다.\r
  explanation: |-\r
    cv2.calcHist([images], [channels], mask, [histSize], [ranges])는 리스트로 인자를 받는 게 특징입니다. 단일 이미지여도 [image] 같이 감싸야 합니다.\r
    histSize=[256]이면 256개 bin으로 나눠 0~255 각 값의 픽셀 수를 셉니다. 결과 shape은 (256, 1)이라 squeeze로 (256,)로 만드는 게 다루기 편합니다.\r
    히스토그램의 합(.sum())은 항상 전체 픽셀 수와 같습니다. 이 관계가 깨지면 mask 인자가 의도와 다르게 작동한 신호입니다.\r
  tips:\r
  - calcHist는 mask 인자로 일부 영역만 분석할 수 있습니다. None은 전체 이미지를 의미합니다.\r
  - np.histogram(image, bins=256, range=(0, 256))도 비슷한 결과를 줍니다. OpenCV는 더 빠르고 다채널 처리가 직관적입니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
\r
    calcCanvas = np.tile(np.linspace(95, 155, 160, dtype=np.uint8), (100, 1))\r
    cv2.rectangle(calcCanvas, (45, 25), (115, 75), 135, -1)\r
\r
    hist = cv2.calcHist([calcCanvas], [0], None, [256], [0, 256])\r
\r
    {\r
        'histShape': hist.shape,\r
        'totalPixelsFromHist': int(hist.sum()),\r
        'totalPixelsFromSize': int(calcCanvas.size),\r
        'dominantBin': int(np.argmax(hist.squeeze())),\r
    }\r
  exercise:\r
    prompt: mask 인자로 직사각형 영역(50:75, 50:110)만 분석한 히스토그램의 dominantBin을 확인하세요. 직사각형 값이 135이므로 결과는 135 부근이 됩니다.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
\r
      maskCanvas = np.tile(np.linspace(95, 155, 160, dtype=np.uint8), (100, 1))\r
      cv2.rectangle(maskCanvas, (45, 25), (115, 75), 135, -1)\r
\r
      maskOnly = np.zeros_like(maskCanvas)\r
      maskOnly[30:70, 50:110] = ___\r
\r
      maskedHist = cv2.calcHist([maskCanvas], [0], maskOnly, [256], [0, 256])\r
      maskedDominant = int(np.argmax(maskedHist.squeeze()))\r
      {'maskedDominant': maskedDominant, 'isNearRect': abs(maskedDominant - 135) <= 5}\r
    hints:\r
    - mask는 0 또는 255 값을 가집니다. 0이 아닌 픽셀만 히스토그램에 포함됩니다.\r
    - 빈칸에는 255가 들어갑니다.\r
    check:\r
      noError: calcHist 호출이 끝나야 합니다.\r
      resultCheck: isNearRect가 True이고 maskedDominant가 130~140 범위에 있어야 합니다.\r
  check:\r
    noError: calcHist 호출과 통계 계산이 끝나야 합니다.\r
    resultCheck: histShape가 (256, 1)이고 totalPixelsFromHist == totalPixelsFromSize여야 합니다.\r
- id: step3_equalize\r
  title: 3단계. equalizeHist로 전역 평활화\r
  structuredPrimary: true\r
  subtitle: 표준편차 변화 측정\r
  goal: 저대비 입력에 cv2.equalizeHist를 적용해 결과의 표준편차가 원본보다 크게 늘어나고 min/max 범위가 0~255로 펴지는지 확인합니다.\r
  why: 평활화의 효과를 "보기에 좋아졌다"가 아니라 표준편차와 범위라는 수치로 검증해야 알고리즘이 정말 동작했는지 확신할 수 있습니다. 표준편차는 픽셀 값의 흩어짐 정도라 대비의 직관적 지표입니다.\r
  explanation: |-\r
    cv2.equalizeHist(src)는 단채널 uint8 입력을 받아 같은 크기 결과를 돌려줍니다. 내부적으로 누적분포함수(CDF)를 계산해 픽셀 값을 0~255 전 범위에 고르게 재분배합니다.\r
    저대비 입력(95~155 좁은 범위)이 평활화 후 보통 0~255 전체로 펴집니다. 표준편차는 약 3~4배 늘어나는 게 일반적입니다.\r
    원본 분포의 형태(직사각형, 봉우리, 가우시안 등)는 결과에 영향을 줍니다. 단봉우리 분포가 가장 자연스럽게 평활화됩니다.\r
  tips:\r
  - equalizeHist는 컬러 입력을 직접 받지 않습니다. 채널별로 분리해서 적용하면 색이 왜곡되니 LAB의 L에 적용하는 게 표준입니다(5단계 참고).\r
  - 결과의 min은 거의 항상 0, max는 거의 항상 255가 됩니다. 입력 분포의 양끝 픽셀이 양끝 값으로 매핑됩니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
\r
    eqCanvas = np.tile(np.linspace(95, 155, 160, dtype=np.uint8), (100, 1))\r
    cv2.rectangle(eqCanvas, (45, 25), (115, 75), 135, -1)\r
\r
    eqResult = cv2.equalizeHist(eqCanvas)\r
\r
    {\r
        'beforeStd': round(float(eqCanvas.std()), 2),\r
        'afterStd': round(float(eqResult.std()), 2),\r
        'beforeRange': (int(eqCanvas.min()), int(eqCanvas.max())),\r
        'afterRange': (int(eqResult.min()), int(eqResult.max())),\r
        'stdIncreased': float(eqResult.std()) > float(eqCanvas.std()),\r
    }\r
  exercise:\r
    prompt: 결과의 max가 정확히 255가 되는지, min이 0에 가까운지 확인하세요. 평활화는 입력의 양끝을 0과 255에 매핑하는 성질이 있습니다.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
\r
      maxCanvas = np.tile(np.linspace(95, 155, 160, dtype=np.uint8), (100, 1))\r
      cv2.rectangle(maxCanvas, (45, 25), (115, 75), 135, -1)\r
      maxResult = cv2.equalizeHist(maxCanvas)\r
\r
      {'min': int(maxResult.min()), 'max': int(maxResult.___()), 'isFullRange': int(maxResult.max()) == 255}\r
    hints:\r
    - ndarray의 최댓값 메서드는 .max()입니다.\r
    - 빈칸에는 max가 들어갑니다.\r
    check:\r
      noError: equalizeHist 호출이 끝나야 합니다.\r
      resultCheck: isFullRange가 True여야 합니다.\r
  check:\r
    noError: equalizeHist 호출이 끝나야 합니다.\r
    resultCheck: stdIncreased가 True이고 afterStd > beforeStd * 2여야 합니다.\r
- id: step4_clahe\r
  title: 4단계. CLAHE 적응형 평활화\r
  structuredPrimary: true\r
  subtitle: createCLAHE + .apply\r
  goal: 같은 입력에 cv2.createCLAHE로 만든 CLAHE 객체의 .apply를 호출해 결과를 얻고, equalizeHist와 표준편차/범위를 비교합니다.\r
  why: 전역 평활화(equalizeHist)는 입력 전체 분포 한 번으로 결정해 지역 변화에 둔감합니다. CLAHE는 작은 타일별로 평활화해 지역 대비를 살리면서도 clipLimit으로 과도한 증폭을 막아 일반적으로 더 자연스럽습니다.\r
  explanation: |-\r
    cv2.createCLAHE(clipLimit, tileGridSize)는 CLAHE 객체를 만듭니다. .apply(image)로 실제 적용합니다.\r
    clipLimit은 한 bin의 픽셀 수가 그 값을 넘으면 자르고 나머지 bin에 재분배합니다. 값이 클수록 대비가 강해지고 노이즈가 같이 증폭됩니다. 보통 2~4가 안전한 시작점입니다.\r
    tileGridSize는 이미지를 분할할 격자 크기입니다. (8, 8)은 이미지를 8×8 영역으로 나눠 각 영역의 평활화를 따로 합니다. 영역 경계에서는 bilinear 보간으로 자연스럽게 이어집니다.\r
  tips:\r
  - "CLAHE 객체는 한 번 만들면 여러 이미지에 재사용할 수 있어 효율적입니다."\r
  - tileGridSize가 너무 작으면(예 (2, 2)) 전역 평활화에 가까워집니다. 너무 크면 노이즈가 증폭됩니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
\r
    claheCanvas = np.tile(np.linspace(95, 155, 160, dtype=np.uint8), (100, 1))\r
    cv2.rectangle(claheCanvas, (45, 25), (115, 75), 135, -1)\r
\r
    eqResult = cv2.equalizeHist(claheCanvas)\r
    claheObject = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))\r
    claheResult = claheObject.apply(claheCanvas)\r
\r
    {\r
        'beforeStd': round(float(claheCanvas.std()), 2),\r
        'eqStd': round(float(eqResult.std()), 2),\r
        'claheStd': round(float(claheResult.std()), 2),\r
        'eqRange': (int(eqResult.min()), int(eqResult.max())),\r
        'claheRange': (int(claheResult.min()), int(claheResult.max())),\r
        'bothIncreasedContrast': float(eqResult.std()) > float(claheCanvas.std()) and float(claheResult.std()) > float(claheCanvas.std()),\r
    }\r
  exercise:\r
    prompt: clipLimit을 4.0으로 더 강하게 주면 같은 입력에서 결과 표준편차가 clipLimit=2.0보다 커지는지 확인하세요.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
\r
      strongCanvas = np.tile(np.linspace(95, 155, 160, dtype=np.uint8), (100, 1))\r
      cv2.rectangle(strongCanvas, (45, 25), (115, 75), 135, -1)\r
\r
      strongClahe = cv2.createCLAHE(clipLimit=___, tileGridSize=(8, 8))\r
      strongResult = strongClahe.apply(strongCanvas)\r
\r
      {'strongStd': round(float(strongResult.std()), 2)}\r
    hints:\r
    - clipLimit 인자에 4.0을 넣습니다.\r
    - 빈칸에는 4.0이 들어갑니다.\r
    check:\r
      noError: createCLAHE와 .apply 호출이 끝나야 합니다.\r
      resultCheck: strongStd가 원본 표준편차(약 17)보다 명백히 커야 합니다.\r
  check:\r
    noError: createCLAHE와 .apply 호출이 끝나야 합니다.\r
    resultCheck: bothIncreasedContrast가 True이고 eqStd, claheStd 모두 beforeStd보다 커야 합니다.\r
- id: step5_color\r
  title: 5단계. LAB 색공간 컬러 평활화\r
  structuredPrimary: true\r
  subtitle: L 채널에만 적용\r
  goal: flower 컬러 이미지를 BGR→LAB으로 변환해 L 채널만 평활화한 뒤 다시 BGR로 되돌려 색이 왜곡되지 않으면서 대비가 향상되는지 확인합니다.\r
  why: 컬러 이미지의 각 채널(B/G/R)에 따로 평활화를 적용하면 채널 균형이 깨져 색이 부자연스럽게 변합니다. LAB 색공간에서 L(밝기)만 평활화하면 색상(a, b)이 유지되어 색은 그대로지만 대비가 향상됩니다.\r
  explanation: |-\r
    cv2.split(labImage)로 L, a, b 세 채널을 분리합니다. L에만 cv2.equalizeHist 또는 CLAHE를 적용합니다.\r
    수정된 L과 원래 a, b를 cv2.merge로 다시 합칩니다. 그 결과를 LAB→BGR로 변환하면 색은 거의 그대로지만 밝기 분포가 평활화된 결과를 얻습니다.\r
    검증은 원본과 결과의 채널별 평균을 비교합니다. L 채널은 변하지만 a, b 채널의 평균은 거의 동일해야 합니다. 비교는 보통 ±2 이내면 색 왜곡이 미미하다고 봅니다.\r
  tips:\r
  - 컬러 평활화에는 LAB가 표준입니다. HSV의 V도 가능하지만 LAB가 인지적으로 더 자연스럽다고 알려져 있습니다.\r
  - 채널별로 따로 평활화하면 빨강과 파랑 영역의 균형이 깨져 색이 푸르거나 붉게 보입니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    from sklearn.datasets import load_sample_image\r
\r
    colorBgr = cv2.cvtColor(load_sample_image('flower.jpg'), cv2.COLOR_RGB2BGR)\r
    colorLab = cv2.cvtColor(colorBgr, cv2.COLOR_BGR2LAB)\r
    lCh, aCh, bCh = cv2.split(colorLab)\r
\r
    lEqualized = cv2.equalizeHist(lCh)\r
    mergedLab = cv2.merge([lEqualized, aCh, bCh])\r
    enhancedBgr = cv2.cvtColor(mergedLab, cv2.COLOR_LAB2BGR)\r
\r
    enhancedLab = cv2.cvtColor(enhancedBgr, cv2.COLOR_BGR2LAB)\r
    _, aChAfter, bChAfter = cv2.split(enhancedLab)\r
\r
    {\r
        'shape': enhancedBgr.shape,\r
        'lStdBefore': round(float(lCh.std()), 2),\r
        'lStdAfter': round(float(lEqualized.std()), 2),\r
        'aMeanDiff': round(abs(float(aCh.mean()) - float(aChAfter.mean())), 2),\r
        'bMeanDiff': round(abs(float(bCh.mean()) - float(bChAfter.mean())), 2),\r
        'lImproved': float(lEqualized.std()) > float(lCh.std()),\r
    }\r
  exercise:\r
    prompt: equalizeHist 대신 createCLAHE(2.0, (8, 8)).apply()를 L 채널에 적용해 같은 흐름을 만들고, 결과 BGR shape가 (427, 640, 3)인지 확인하세요.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
      from sklearn.datasets import load_sample_image\r
\r
      clColorBgr = cv2.cvtColor(load_sample_image('flower.jpg'), cv2.COLOR_RGB2BGR)\r
      clColorLab = cv2.cvtColor(clColorBgr, cv2.COLOR_BGR2LAB)\r
      clL, clA, clB = cv2.split(clColorLab)\r
\r
      clClahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))\r
      clLEnhanced = clClahe.___(clL)\r
      clMerged = cv2.merge([clLEnhanced, clA, clB])\r
      clBgr = cv2.cvtColor(clMerged, cv2.COLOR_LAB2BGR)\r
\r
      {'shape': clBgr.shape, 'isCorrectShape': clBgr.shape == (427, 640, 3)}\r
    hints:\r
    - CLAHE 객체의 적용 메서드는 .apply()입니다.\r
    - 빈칸에는 apply가 들어갑니다.\r
    check:\r
      noError: split/CLAHE/merge/cvtColor 흐름이 끝나야 합니다.\r
      resultCheck: isCorrectShape가 True여야 합니다.\r
  check:\r
    noError: split/equalizeHist/merge/cvtColor 흐름이 끝나야 합니다.\r
    resultCheck: lImproved가 True이고 aMeanDiff/bMeanDiff 모두 5 이하여야 합니다.\r
- id: step6_params\r
  title: 6단계. CLAHE 파라미터 효과\r
  structuredPrimary: true\r
  subtitle: clipLimit 1/4/8 비교\r
  goal: 같은 입력에 clipLimit을 1/4/8 세 값으로 두고 결과 표준편차가 증가하는 단조성을 확인합니다.\r
  why: clipLimit이 높을수록 대비가 강해지지만 노이즈도 함께 증폭됩니다. 단순히 큰 값이 좋은 게 아니라 입력의 노이즈 수준과 사용 용도에 따라 절충해야 합니다. 세 값을 한 번에 비교해 보면 감각이 잡힙니다.\r
  explanation: |-\r
    clipLimit=1.0은 거의 평활화 효과가 없습니다. 노이즈 증가도 거의 없지만 대비 향상도 약합니다.\r
    clipLimit=4.0은 일반적인 시작점입니다. 대비 향상이 명확하면서 노이즈 증가는 허용 범위 안입니다.\r
    clipLimit=8.0은 강한 평활화입니다. 저대비 의료/위성 영상 같은 특수 경우에 쓰이고, 일반 사진에는 노이즈가 두드러져 부적합한 경우가 많습니다.\r
    표준편차의 단조성(작은 clipLimit < 큰 clipLimit)이 알고리즘이 의도대로 동작하는지의 직관적 회귀 테스트입니다.\r
  tips:\r
  - clipLimit은 float입니다. 정수만 받는 것이 아닙니다. 1.5, 2.5 같은 값도 자주 씁니다.\r
  - 같은 clipLimit에 tileGridSize를 (4, 4) → (16, 16)으로 키워도 결과가 달라집니다. 둘 다 실험할 가치가 있습니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
\r
    paramCanvas = np.tile(np.linspace(95, 155, 160, dtype=np.uint8), (100, 1))\r
    cv2.rectangle(paramCanvas, (45, 25), (115, 75), 135, -1)\r
\r
    claheLow = cv2.createCLAHE(clipLimit=1.0, tileGridSize=(8, 8)).apply(paramCanvas)\r
    claheMid = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8, 8)).apply(paramCanvas)\r
    claheHigh = cv2.createCLAHE(clipLimit=8.0, tileGridSize=(8, 8)).apply(paramCanvas)\r
\r
    {\r
        'stdLow': round(float(claheLow.std()), 2),\r
        'stdMid': round(float(claheMid.std()), 2),\r
        'stdHigh': round(float(claheHigh.std()), 2),\r
        'monotonicGrowth': float(claheLow.std()) <= float(claheMid.std()) <= float(claheHigh.std()),\r
    }\r
  exercise:\r
    prompt: clipLimit은 4.0 고정으로 두고 tileGridSize를 (4, 4)와 (16, 16) 두 값으로 바꿔 결과 표준편차가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
\r
      tileCanvas = np.tile(np.linspace(95, 155, 160, dtype=np.uint8), (100, 1))\r
      cv2.rectangle(tileCanvas, (45, 25), (115, 75), 135, -1)\r
\r
      claheSmall = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(4, 4)).apply(tileCanvas)\r
      claheLarge = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(___, 16)).apply(tileCanvas)\r
\r
      {'stdSmall': round(float(claheSmall.std()), 2), 'stdLarge': round(float(claheLarge.std()), 2)}\r
    hints:\r
    - 정사각 격자라 두 인자 모두 16입니다.\r
    - 빈칸에는 16이 들어갑니다.\r
    check:\r
      noError: 두 CLAHE 호출이 끝나야 합니다.\r
      resultCheck: stdSmall과 stdLarge 모두 양수여야 합니다.\r
  check:\r
    noError: 세 CLAHE 호출이 끝나야 합니다.\r
    resultCheck: monotonicGrowth가 True이고 stdHigh가 stdLow보다 명백히 커야 합니다.\r
- id: practice\r
  title: 실습 - china 사진 대비 향상\r
  structuredPrimary: true\r
  subtitle: 컬러 LAB CLAHE\r
  goal: china 컬러 사진의 L 채널을 저대비 범위로 압축한 뒤 LAB 색공간에서 CLAHE를 적용해, 색 보존과 대비 회복 여부를 검증합니다.\r
  why: 원본 china 사진은 이미 L 채널 표준편차가 커서 CLAHE 뒤 표준편차가 내려갈 수 있습니다. 학습용으로는 같은 사진의 색상 구조를 유지하되 L 채널만 저대비로 눌러, CLAHE가 어떤 입력에서 효과를 내는지 분명히 보여 줘야 합니다.\r
  explanation: |-\r
    먼저 china 사진의 LAB L 채널을 95~155 범위로 압축해 저대비 입력을 만듭니다. 그 뒤 L 채널에 CLAHE를 적용하면 지역 대비가 회복되고, a/b 색상 채널은 그대로 유지됩니다.\r
    검증은 저대비 입력과 결과의 L 채널 표준편차를 비교합니다. 이 비교는 원본 사진이 아니라 CLAHE를 적용하기 직전의 저대비 입력을 기준으로 해야 합니다.\r
    실무에서는 이 패턴을 함수로 묶어 두고 새 사진마다 호출합니다. 병렬 처리에서는 공유 객체의 안전성을 가정하지 말고 함수 안이나 워커별로 CLAHE 객체를 만듭니다.\r
  tips:\r
  - 병렬 처리에서는 CLAHE 객체를 워커별로 만들거나 함수 안에서 생성해 공유 상태를 피하세요.\r
  - 사진의 노이즈 수준이 높으면 clipLimit을 낮춰 노이즈 증폭을 피합니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def makeLowContrastBgr(bgr: np.ndarray) -> np.ndarray:\r
        lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)\r
        lCh, aCh, bCh = cv2.split(lab)\r
        lLow = cv2.normalize(lCh, None, 95, 155, cv2.NORM_MINMAX).astype(np.uint8)\r
        return cv2.cvtColor(cv2.merge([lLow, aCh, bCh]), cv2.COLOR_LAB2BGR)\r
\r
\r
    def claheEnhanceBgr(bgr: np.ndarray, clipLimit: float = 2.0) -> np.ndarray:\r
        lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)\r
        lCh, aCh, bCh = cv2.split(lab)\r
        clahe = cv2.createCLAHE(clipLimit=clipLimit, tileGridSize=(8, 8))\r
        return cv2.cvtColor(cv2.merge([clahe.apply(lCh), aCh, bCh]), cv2.COLOR_LAB2BGR)\r
\r
\r
    chinaBgr = makeLowContrastBgr(cv2.cvtColor(load_sample_image('china.jpg'), cv2.COLOR_RGB2BGR))\r
    enhancedChinaBgr = claheEnhanceBgr(chinaBgr, clipLimit=3.0)\r
\r
    originalLChannel = cv2.cvtColor(chinaBgr, cv2.COLOR_BGR2LAB)[..., 0]\r
    enhancedLChannel = cv2.cvtColor(enhancedChinaBgr, cv2.COLOR_BGR2LAB)[..., 0]\r
\r
    {\r
        'originalLStd': round(float(originalLChannel.std()), 2),\r
        'enhancedLStd': round(float(enhancedLChannel.std()), 2),\r
        'shapePreserved': enhancedChinaBgr.shape == chinaBgr.shape,\r
        'contrastImproved': float(enhancedLChannel.std()) > float(originalLChannel.std()),\r
    }\r
  exercise:\r
    prompt: 저대비 china 입력에 claheEnhanceBgr를 clipLimit=1.0으로 적용해 표준편차가 적용 전보다 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def makeLowContrastBgr(bgr: np.ndarray) -> np.ndarray:\r
          lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)\r
          lCh, aCh, bCh = cv2.split(lab)\r
          lLow = cv2.normalize(lCh, None, 95, 155, cv2.NORM_MINMAX).astype(np.uint8)\r
          return cv2.cvtColor(cv2.merge([lLow, aCh, bCh]), cv2.COLOR_LAB2BGR)\r
\r
\r
      def claheEnhanceBgr(bgr: np.ndarray, clipLimit: float = 2.0) -> np.ndarray:\r
          lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)\r
          lCh, aCh, bCh = cv2.split(lab)\r
          clahe = cv2.createCLAHE(clipLimit=clipLimit, tileGridSize=(8, 8))\r
          return cv2.cvtColor(cv2.merge([clahe.apply(lCh), aCh, bCh]), cv2.COLOR_LAB2BGR)\r
\r
\r
      weakBase = makeLowContrastBgr(cv2.cvtColor(load_sample_image('china.jpg'), cv2.COLOR_RGB2BGR))\r
      weakResult = claheEnhanceBgr(weakBase, clipLimit=___)\r
      weakLAfter = cv2.cvtColor(weakResult, cv2.COLOR_BGR2LAB)[..., 0]\r
      weakLBefore = cv2.cvtColor(weakBase, cv2.COLOR_BGR2LAB)[..., 0]\r
      {'beforeStd': round(float(weakLBefore.std()), 2), 'afterStd': round(float(weakLAfter.std()), 2)}\r
    hints:\r
    - clipLimit 1.0은 매우 약한 평활화입니다.\r
    - 빈칸에는 1.0이 들어갑니다.\r
    check:\r
      noError: claheEnhanceBgr 정의와 호출이 끝나야 합니다.\r
      resultCheck: afterStd가 beforeStd보다 약간 크거나 비슷해야 합니다.\r
  check:\r
    noError: claheEnhanceBgr 정의와 호출이 끝나야 합니다.\r
    resultCheck: shapePreserved가 True이고 contrastImproved가 True여야 합니다.\r
- id: workflow_validation\r
  title: 7단계. 입력 채널 가드와 대비 개선 검증\r
  structuredPrimary: true\r
  subtitle: 그레이스케일 강제 + std 비교\r
  goal: validateGrayImage 함수가 컬러 입력을 ValueError로 차단하고, 정상 입력에서는 평활화 후 표준편차가 명확히 증가하는지 회귀 테스트로 확인합니다.\r
  why: equalizeHist는 컬러 입력에 ndim 오류 같은 명확하지 않은 메시지로 실패합니다. 함수 입구에서 "그레이스케일이 아니면 ValueError"로 명시하면 호출자가 즉시 원인을 안다. 그리고 평활화의 본질인 대비 증가가 정말 일어났는지 한 줄로 검증합니다.\r
  explanation: |-\r
    validateGrayImage는 image.ndim != 2를 검사합니다. 메시지에 실제 shape를 포함시켜 호출자가 무엇이 잘못됐는지 즉시 알 수 있게 합니다.\r
    회귀 테스트는 enhanced.std() > original.std() 한 줄입니다. 평활화의 본질은 대비 증가이므로 이 부등식이 깨지면 알고리즘이 의도와 다르게 동작한 신호입니다.\r
    이 두 가드를 결합한 패턴이 평활화 코드를 다른 사람이 안전하게 호출할 수 있는 인터페이스를 만듭니다.\r
  tips:\r
  - 컬러 입력을 평활화하고 싶다면 LAB의 L 채널에 적용하는 5단계 패턴을 함수 안에 포함시키는 게 표준입니다.\r
  - 표준편차 비교는 절대값보다 비율(after / before)이 더 안정적인 회귀 테스트입니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
\r
\r
    def validateGrayImage(image: np.ndarray) -> bool:\r
        if image.ndim != 2:\r
            raise ValueError(f"히스토그램 평활화는 그레이스케일 입력이 필요합니다: shape {image.shape}")\r
        return True\r
\r
\r
    def safeEqualize(image: np.ndarray) -> dict:\r
        validateGrayImage(image)\r
        enhanced = cv2.equalizeHist(image)\r
        return {\r
            'originalStd': round(float(image.std()), 2),\r
            'enhancedStd': round(float(enhanced.std()), 2),\r
            'contrastImproved': float(enhanced.std()) > float(image.std()),\r
        }\r
\r
\r
    safeCanvas = np.tile(np.linspace(95, 155, 160, dtype=np.uint8), (100, 1))\r
    cv2.rectangle(safeCanvas, (45, 25), (115, 75), 135, -1)\r
\r
    okResult = safeEqualize(safeCanvas)\r
\r
    try:\r
        safeEqualize(np.zeros((50, 50, 3), dtype=np.uint8))\r
        colorMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        colorMessage = str(exc)\r
\r
    {\r
        'okResult': okResult,\r
        'colorMessage': colorMessage,\r
    }\r
  exercise:\r
    prompt: safeEqualize에 1차원 ndarray(np.zeros(100, dtype=np.uint8))를 넘기면 ndim 오류 메시지가 나오는지, 그 메시지에 '(100,)' shape 단서가 포함되는지 확인하세요.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
\r
\r
      def validateGrayImage(image: np.ndarray) -> bool:\r
          if image.ndim != 2:\r
              raise ValueError(f"히스토그램 평활화는 그레이스케일 입력이 필요합니다: shape {image.shape}")\r
          return True\r
\r
\r
      try:\r
          validateGrayImage(np.zeros(100, dtype=np.uint8))\r
          oneDimMessage = 'unexpected pass'\r
      except ValueError as exc:\r
          oneDimMessage = str(exc)\r
\r
      {'oneDimMessage': oneDimMessage, 'hasShapeHint': '(___,)' in oneDimMessage}\r
    hints:\r
    - 1차원 100원소 ndarray의 shape는 (100,)입니다.\r
    - 빈칸에는 100이 들어갑니다.\r
    check:\r
      noError: validateGrayImage 정의가 끝나야 합니다.\r
      resultCheck: hasShapeHint가 True여야 합니다.\r
  check:\r
    noError: validateGrayImage와 safeEqualize 정의가 끝나야 합니다.\r
    resultCheck: okResult의 contrastImproved가 True이고 colorMessage에 'shape' 단서가 포함되어야 합니다.\r
`;export{e as default};