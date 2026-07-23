var e=`meta:
  packages:
  - numpy
  - opencv-python
  - scikit-learn
  id: opencv_07
  title: 모폴로지연산기
  order: 7
  category: opencv
  difficulty: ⭐⭐⭐
  badge: 중급
  tags:
  - OpenCV
  - erode
  - dilate
  - morphologyEx
  - 모폴로지
  seo:
    title: OpenCV 중급 - 모폴로지 연산기
    description: OpenCV erode/dilate/MORPH_OPEN/MORPH_CLOSE로 이진 이미지의 형태를 정량적으로 변형합니다.
    keywords:
    - OpenCV
    - erode
    - dilate
    - morphologyEx
    - 모폴로지
intro:
  emoji: 🔲
  goal: erode/dilate/open/close 네 모폴로지 연산을 합성 입력에 적용해 흰 영역 면적 변화를 정량 비교하고, 노이즈 제거와 구멍 메우기를 손으로 검증합니다.
  description: 모폴로지는 형태학 연산입니다. 커널을 픽셀 위로 슬라이드시키며 그 영역의 최소/최대를 가져와 이진 이미지의 형태를 바꿉니다.
  direction: 합성 입력에 점 노이즈와 구멍을 의도적으로 넣고, 각 연산 후 흰 픽셀 수가 어떻게 변하는지 dict로 비교합니다.
  benefits:
  - erode는 최소값 → 흰 영역이 줄어든다는 사실을 픽셀 수로 확인합니다.
  - dilate는 최대값 → 흰 영역이 커진다는 사실을 픽셀 수로 확인합니다.
  - MORPH_OPEN(erode→dilate)이 점 노이즈를 정리하고 원본 크기를 회복하는 것을 봅니다.
  - MORPH_CLOSE(dilate→erode)가 작은 구멍을 메우는 것을 봅니다.
  diagram:
    steps:
    - label: 합성 입력 만들기
      detail: 직사각형 + 작은 점 노이즈 + 내부 구멍이 있는 이진 입력으로 정답 픽셀 수를 정합니다.
    - label: 구조 요소
      detail: cv2.getStructuringElement로 (5, 5) MORPH_RECT/MORPH_ELLIPSE/MORPH_CROSS를 만들어 모양을 비교합니다.
    - label: erode / dilate
      detail: 각 연산 후 흰 픽셀 수를 측정해 erode<원본<dilate 순서가 되는지 확인합니다.
    - label: open / close
      detail: open은 점 노이즈 제거, close는 구멍 메우기에 효과적인지 픽셀 수로 검증합니다.
    - label: 커널 가드 함수
      detail: makeMorphKernel 함수가 짝수/너무 작은 크기를 ValueError로 차단합니다.
    runtime:
    - label: opencv-python 패키지
      detail: meta.packages의 opencv-python이 가상환경에 있어야 cv2.erode/dilate/morphologyEx가 import됩니다.
    - label: 단채널 uint8
      detail: 모폴로지는 단채널 입력이 표준입니다. 다채널도 지원하지만 채널별로 따로 적용됩니다.
    - label: 0/255 이진 입력
      detail: 일반 그레이스케일에도 동작하지만 이진(0/255) 입력에서 효과가 가장 직관적입니다.
sections:
- id: step1_create
  title: 1단계. 합성 입력 만들기
  structuredPrimary: true
  subtitle: 노이즈 + 구멍 포함
  goal: 흰 직사각형 + 점 노이즈 + 검은 구멍이 있는 (100, 140) 이진 입력을 만들고 각 요소가 차지하는 픽셀 수를 정확히 셉니다.
  why: 모폴로지는 형태를 다루는 연산이라 결과가 좋아 보이는지를 눈으로 판단하기 어렵습니다. 합성 입력은 정답 픽셀 수를 사람이 미리 계산할 수 있어 알고리즘 검증의 출발점으로 좋습니다.
  explanation: |-
    배경은 0(검정), 직사각형은 255(흰색)로 채웁니다. 직사각형 안쪽에 작은 검은 원(구멍)을 그리고, 바깥에는 단일 픽셀 흰 점들을 점 노이즈로 박습니다.
    "객체 픽셀 수"는 (image == 255).sum()으로 셉니다. 직사각형 면적에서 구멍 면적을 빼고 점 노이즈 개수를 더한 값과 일치해야 합니다.
    이 합성 입력 한 개가 이후 모든 모폴로지 셀의 공통 입력입니다. 정답을 알고 시작하므로 각 연산의 효과를 숫자로 검증할 수 있습니다.
  tips:
  - cv2.rectangle/circle은 in-place로 동작해 원본을 직접 수정합니다.
  - 점 노이즈는 image[y, x] = 255로 직접 한 픽셀씩 박는 것이 가장 단순합니다.
  snippet: |-
    import cv2
    import numpy as np

    morphCanvas = np.zeros((100, 140), dtype=np.uint8)
    cv2.rectangle(morphCanvas, (30, 25), (100, 75), 255, -1)
    cv2.circle(morphCanvas, (65, 50), 10, 0, -1)
    morphCanvas[10, 10] = 255
    morphCanvas[15, 130] = 255
    morphCanvas[90, 20] = 255
    morphCanvas[85, 125] = 255

    {
        'shape': morphCanvas.shape,
        'whitePixels': int((morphCanvas == 255).sum()),
        'singlePointNoise': int(morphCanvas[10, 10]),
        'insideHoleIsBlack': int(morphCanvas[50, 65]) == 0,
    }
  exercise:
    prompt: 같은 캔버스에 점 노이즈 2개를 추가해 (5, 5)와 (95, 135) 위치에 흰 점을 더 박고, 흰 픽셀 수가 step1보다 2 증가했는지 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np

      extraCanvas = np.zeros((100, 140), dtype=np.uint8)
      cv2.rectangle(extraCanvas, (30, 25), (100, 75), 255, -1)
      cv2.circle(extraCanvas, (65, 50), 10, 0, -1)
      extraCanvas[10, 10] = 255
      extraCanvas[15, 130] = 255
      extraCanvas[90, 20] = 255
      extraCanvas[85, 125] = 255
      extraCanvas[5, 5] = ___
      extraCanvas[95, 135] = 255

      {'whitePixels': int((extraCanvas == 255).sum())}
    hints:
    - 흰 픽셀 값은 255입니다.
    - 빈칸에는 255가 들어갑니다.
    check:
      noError: 픽셀 할당이 IndexError 없이 끝나야 합니다.
      resultCheck: whitePixels가 양의 정수여야 합니다.
  check:
    noError: 합성 입력 생성과 통계 계산이 끝나야 합니다.
    resultCheck: shape가 (100, 140), singlePointNoise가 255, insideHoleIsBlack이 True여야 합니다.
- id: step2_kernel
  title: 2단계. 구조 요소 세 모양
  structuredPrimary: true
  subtitle: MORPH_RECT/ELLIPSE/CROSS
  goal: cv2.getStructuringElement로 (5, 5) 정사각/타원/십자 세 커널을 만들고 각 커널의 흰 픽셀 패턴이 어떻게 다른지 출력으로 확인합니다.
  why: 모폴로지 연산의 결과는 커널 모양에 크게 의존합니다. 같은 (5, 5)라도 정사각/타원/십자 중 어느 모양을 쓰는지에 따라 erode/dilate가 잡는 영역의 형태가 달라집니다.
  explanation: |-
    cv2.getStructuringElement(shape, ksize)는 0/1 패턴의 ndarray를 돌려줍니다. shape에 MORPH_RECT를 주면 모든 칸이 1인 정사각, MORPH_ELLIPSE는 타원, MORPH_CROSS는 가운데 줄만 1인 십자가 됩니다.
    모서리가 둥글어야 하는 객체는 타원 커널, 직각이 살아야 하는 객체는 사각 커널이 적합합니다. 십자 커널은 가로/세로 방향 처리에 특히 강합니다.
    커널의 합(np.sum())이 커널의 "면적"입니다. 정사각은 가장 큰 면적, 십자는 가장 작은 면적이라 같은 ksize라도 효과 강도가 다릅니다.
  tips:
  - 비대칭 커널(예 (3, 7))로 가로/세로 비대칭 객체에 강한 효과를 낼 수 있습니다.
  - 직접 만든 ndarray도 커널로 쓸 수 있습니다. cv2.getStructuringElement는 자주 쓰는 모양의 단축 함수일 뿐입니다.
  snippet: |-
    import cv2

    kernelRect = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    kernelEllipse = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    kernelCross = cv2.getStructuringElement(cv2.MORPH_CROSS, (5, 5))

    {
        'rectShape': kernelRect.shape,
        'rectArea': int(kernelRect.sum()),
        'ellipseArea': int(kernelEllipse.sum()),
        'crossArea': int(kernelCross.sum()),
        'rectIsBiggest': int(kernelRect.sum()) > int(kernelEllipse.sum()) > int(kernelCross.sum()),
    }
  exercise:
    prompt: ksize를 (7, 7)로 키워 세 커널을 만들고 각 면적을 dict로 돌려주세요. rect는 49, cross는 13이 됩니다.
    starterCode: |-
      import cv2

      bigRect = cv2.getStructuringElement(cv2.MORPH_RECT, (___, 7))
      bigEllipse = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
      bigCross = cv2.getStructuringElement(cv2.MORPH_CROSS, (7, 7))

      {'rectArea': int(bigRect.sum()), 'ellipseArea': int(bigEllipse.sum()), 'crossArea': int(bigCross.sum())}
    hints:
    - 정사각 ksize라 두 인자 모두 7입니다.
    - 빈칸에는 7이 들어갑니다.
    check:
      noError: 세 getStructuringElement 호출이 끝나야 합니다.
      resultCheck: rectArea가 49, crossArea가 13이어야 합니다.
  check:
    noError: 세 getStructuringElement 호출이 끝나야 합니다.
    resultCheck: rectIsBiggest가 True이고 rectArea가 25여야 합니다.
- id: step3_erode
  title: 3단계. erode로 흰 영역 깎기
  structuredPrimary: true
  subtitle: 침식 = 최소값 필터
  goal: 합성 입력에 (3, 3) erode를 한 번 적용해 점 노이즈와 직사각형 모서리가 깎이는지, 흰 픽셀 수가 원본보다 줄어드는지 확인합니다.
  why: erode는 커널 영역의 최소값을 가져옵니다. 이진 입력에서는 커널 안에 0이 하나라도 있으면 중심이 0이 됩니다. 결과적으로 점 노이즈는 사라지고 모서리가 안쪽으로 깎입니다.
  explanation: |-
    cv2.erode(src, kernel, iterations=1)는 새 ndarray를 돌려줍니다. iterations를 늘리면 같은 erode가 여러 번 적용되어 효과가 누적됩니다.
    점 노이즈는 한 픽셀짜리라 (3, 3) 커널의 erode 한 번에 즉시 사라집니다. 직사각형 같은 큰 객체는 모서리만 1픽셀씩 안쪽으로 깎입니다.
    검증은 흰 픽셀 수의 변화로 합니다. 노이즈 4개 제거 + 직사각형 둘레 1픽셀 침식이 합쳐져 결과 흰 픽셀 수가 원본보다 작아야 합니다.
  tips:
  - 점 노이즈만 빠르게 지우려면 (3, 3) 1회 erode가 충분합니다. 큰 객체 보존에도 영향이 작습니다.
  - 같은 효과를 morphologyEx(MORPH_ERODE, ...)로도 얻을 수 있지만 erode 직접 호출이 더 간단합니다.
  snippet: |-
    import cv2
    import numpy as np

    erodeCanvas = np.zeros((100, 140), dtype=np.uint8)
    cv2.rectangle(erodeCanvas, (30, 25), (100, 75), 255, -1)
    cv2.circle(erodeCanvas, (65, 50), 10, 0, -1)
    erodeCanvas[10, 10] = 255
    erodeCanvas[15, 130] = 255

    erodeKernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    eroded = cv2.erode(erodeCanvas, erodeKernel, iterations=1)

    {
        'originalWhite': int((erodeCanvas == 255).sum()),
        'erodedWhite': int((eroded == 255).sum()),
        'noiseRemoved': int(eroded[10, 10]) == 0 and int(eroded[15, 130]) == 0,
        'objectShrunk': int((eroded == 255).sum()) < int((erodeCanvas == 255).sum()),
    }
  exercise:
    prompt: iterations=3으로 같은 erode를 3번 누적 적용하면 흰 픽셀 수가 1회 erode보다 더 작아지는지 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np

      heavyCanvas = np.zeros((100, 140), dtype=np.uint8)
      cv2.rectangle(heavyCanvas, (30, 25), (100, 75), 255, -1)
      cv2.circle(heavyCanvas, (65, 50), 10, 0, -1)

      heavyKernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
      heavy1 = cv2.erode(heavyCanvas, heavyKernel, iterations=1)
      heavy3 = cv2.erode(heavyCanvas, heavyKernel, iterations=___)

      {'count1': int((heavy1 == 255).sum()), 'count3': int((heavy3 == 255).sum()), 'heavyIsSmaller': int((heavy3 == 255).sum()) < int((heavy1 == 255).sum())}
    hints:
    - iterations 위치 인자는 3을 넣습니다.
    - 빈칸에는 3이 들어갑니다.
    check:
      noError: erode 두 호출이 끝나야 합니다.
      resultCheck: heavyIsSmaller가 True이고 count3 < count1이어야 합니다.
  check:
    noError: erode 호출과 카운트가 끝나야 합니다.
    resultCheck: noiseRemoved가 True이고 objectShrunk가 True여야 합니다.
- id: step4_dilate
  title: 4단계. dilate로 흰 영역 확장
  structuredPrimary: true
  subtitle: 팽창 = 최대값 필터
  goal: 같은 합성 입력에 (3, 3) dilate를 적용해 직사각형 모서리가 바깥으로 확장되고 안쪽 구멍이 작아지는지 확인합니다.
  why: dilate는 erode의 정반대입니다. 커널 안에 255가 하나라도 있으면 중심이 255가 됩니다. 객체 경계가 바깥으로 확장되고 내부 구멍은 작아집니다. 끊어진 선 연결과 구멍 메우기에 쓰입니다.
  explanation: |-
    cv2.dilate(src, kernel, iterations=1)는 erode와 같은 시그니처입니다. (3, 3) 커널이면 한 번 적용에 1픽셀씩 객체가 확장됩니다.
    이진 입력에서 구멍 주변이 흰색이라면, 구멍 가장자리부터 안쪽으로 흰색이 채워집니다. 작은 구멍은 dilate 1회로도 사라질 수 있고, 큰 구멍은 여러 번 반복하거나 더 큰 커널이 필요합니다.
    검증은 흰 픽셀 수와 구멍 중심 픽셀의 색으로 합니다. 흰 픽셀 수는 원본보다 늘어나야 하고, 구멍 중심이 흰색이 되었는지로 구멍이 메워졌는지 알 수 있습니다.
  tips:
  - 점 노이즈를 dilate하면 작은 점이 작은 원으로 자랍니다. 노이즈 제거에는 erode가 정답입니다.
  - 글자처럼 가는 선을 굵게 만들 때 dilate가 자주 쓰입니다.
  snippet: |-
    import cv2
    import numpy as np

    dilateCanvas = np.zeros((100, 140), dtype=np.uint8)
    cv2.rectangle(dilateCanvas, (30, 25), (100, 75), 255, -1)
    cv2.circle(dilateCanvas, (65, 50), 10, 0, -1)

    dilateKernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    dilated = cv2.dilate(dilateCanvas, dilateKernel, iterations=1)

    {
        'originalWhite': int((dilateCanvas == 255).sum()),
        'dilatedWhite': int((dilated == 255).sum()),
        'holeCenterAfter': int(dilated[50, 65]),
        'objectGrew': int((dilated == 255).sum()) > int((dilateCanvas == 255).sum()),
    }
  exercise:
    prompt: iterations=5로 dilate를 5번 누적 적용해 구멍 중심이 흰색으로 완전히 메워지는지 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np

      fillCanvas = np.zeros((100, 140), dtype=np.uint8)
      cv2.rectangle(fillCanvas, (30, 25), (100, 75), 255, -1)
      cv2.circle(fillCanvas, (65, 50), 10, 0, -1)

      fillKernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
      filled = cv2.dilate(fillCanvas, fillKernel, iterations=___)

      {'centerAfterFill': int(filled[50, 65]), 'isFilled': int(filled[50, 65]) == 255}
    hints:
    - 반복 횟수 5를 iterations 자리에 넣습니다.
    - 빈칸에는 5가 들어갑니다.
    check:
      noError: dilate 호출이 끝나야 합니다.
      resultCheck: isFilled가 True이고 centerAfterFill이 255여야 합니다.
  check:
    noError: dilate 호출과 카운트가 끝나야 합니다.
    resultCheck: objectGrew가 True이고 dilatedWhite가 originalWhite보다 명백히 커야 합니다.
- id: step5_open
  title: 5단계. MORPH_OPEN으로 점 노이즈 제거
  structuredPrimary: true
  subtitle: erode → dilate 한 줄
  goal: 점 노이즈가 있는 합성 입력에 MORPH_OPEN을 적용해 노이즈는 사라지고 큰 객체 면적이 거의 유지되는지 확인합니다.
  why: erode 한 번으로 노이즈를 제거하면 큰 객체도 함께 깎입니다. 그 뒤 dilate로 같은 양만큼 다시 키우면 큰 객체는 원래 크기에 가까워지고 노이즈는 이미 사라진 상태로 유지됩니다. 이게 OPEN 한 줄의 효과입니다.
  explanation: |-
    cv2.morphologyEx(src, cv2.MORPH_OPEN, kernel)는 erode → dilate 두 연산을 한 번에 적용합니다. 결과는 erode 후 dilate를 따로 호출한 것과 정확히 같습니다.
    점 노이즈는 erode 단계에서 즉시 사라지므로 그 뒤 dilate에서도 다시 살아나지 않습니다. 직사각형 같은 큰 객체는 erode로 1픽셀 깎였다가 dilate로 1픽셀 회복되어 흰 픽셀 수가 거의 원래대로 돌아옵니다.
    검증은 결과의 흰 픽셀 수가 "원본 - 노이즈 픽셀 수"에 가까운지로 합니다. 노이즈 픽셀 수만 정확히 빠진 게 OPEN의 이상적 동작입니다.
  tips:
  - OPEN은 "외부 흰 노이즈 제거"에 표준입니다. 작은 흰 점이 많은 사진의 첫 단계로 자주 씁니다.
  - 더 큰 노이즈에는 더 큰 커널을 쓰지만, 큰 객체 손상이 같이 커지므로 trade-off가 있습니다.
  snippet: |-
    import cv2
    import numpy as np

    openCanvas = np.zeros((100, 140), dtype=np.uint8)
    cv2.rectangle(openCanvas, (30, 25), (100, 75), 255, -1)
    for noisePos in [(10, 10), (15, 130), (90, 20), (85, 125)]:
        openCanvas[noisePos] = 255

    openKernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    opened = cv2.morphologyEx(openCanvas, cv2.MORPH_OPEN, openKernel)

    {
        'originalWhite': int((openCanvas == 255).sum()),
        'openedWhite': int((opened == 255).sum()),
        'noiseGone': int(opened[10, 10]) == 0 and int(opened[15, 130]) == 0,
        'closeToOriginalMinusNoise': abs(int((opened == 255).sum()) - (int((openCanvas == 255).sum()) - 4)) < 50,
    }
  exercise:
    prompt: morphologyEx 대신 cv2.erode 후 cv2.dilate를 따로 호출해 같은 결과(np.array_equal)가 나오는지 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np

      manualCanvas = np.zeros((100, 140), dtype=np.uint8)
      cv2.rectangle(manualCanvas, (30, 25), (100, 75), 255, -1)
      manualCanvas[10, 10] = 255

      manualKernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
      stepwise = cv2.dilate(cv2.erode(manualCanvas, manualKernel), manualKernel)
      morphed = cv2.morphologyEx(manualCanvas, cv2.MORPH____, manualKernel)

      {'stepwiseShape': stepwise.shape, 'isSame': bool(np.array_equal(stepwise, morphed))}
    hints:
    - MORPH_OPEN 플래그를 morphologyEx에 줍니다.
    - 빈칸에는 OPEN이 들어갑니다.
    check:
      noError: 두 흐름이 끝나야 합니다.
      resultCheck: isSame이 True여야 합니다.
  check:
    noError: morphologyEx 호출과 카운트가 끝나야 합니다.
    resultCheck: noiseGone이 True이고 closeToOriginalMinusNoise가 True여야 합니다.
- id: step6_close
  title: 6단계. MORPH_CLOSE로 구멍 메우기
  structuredPrimary: true
  subtitle: dilate → erode 한 줄
  goal: 내부 구멍이 있는 합성 입력에 MORPH_CLOSE를 적용해 구멍이 메워지고 외곽선 위치가 거의 유지되는지 확인합니다.
  why: dilate 한 번으로 구멍을 메우면 객체 외곽도 함께 부풀어 오릅니다. 그 뒤 erode로 같은 양만큼 다시 깎으면 외곽선은 원래대로 돌아오고 안쪽 구멍은 이미 메워진 상태로 유지됩니다. 이게 CLOSE의 효과입니다.
  explanation: |-
    cv2.morphologyEx(src, cv2.MORPH_CLOSE, kernel)는 dilate → erode 두 연산을 한 번에 적용합니다. OPEN의 정반대 순서입니다.
    내부 구멍이 dilate 단계에서 가장자리부터 채워지고, erode가 외곽을 다시 깎아도 안쪽은 흰색을 유지합니다. 큰 구멍은 한 번의 CLOSE로 부족하면 iterations나 커널 크기를 키웁니다.
    검증은 구멍 중심이 흰색이 되었는지와 외곽 모서리 픽셀이 거의 유지되는지로 합니다.
  tips:
  - CLOSE는 "객체 내부 구멍 메우기"에 표준입니다. 텍스트 인식 전처리, 분할 마스크 정리에 자주 씁니다.
  - 너무 큰 커널은 작은 빈 공간끼리 연결시켜 의도와 다른 결과를 만듭니다.
  snippet: |-
    import cv2
    import numpy as np

    closeCanvas = np.zeros((100, 140), dtype=np.uint8)
    cv2.rectangle(closeCanvas, (30, 25), (100, 75), 255, -1)
    cv2.circle(closeCanvas, (65, 50), 6, 0, -1)

    closeKernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    closed = cv2.morphologyEx(closeCanvas, cv2.MORPH_CLOSE, closeKernel)

    {
        'centerBefore': int(closeCanvas[50, 65]),
        'centerAfter': int(closed[50, 65]),
        'edgePreserved': int(closed[25, 30]) == int(closeCanvas[25, 30]),
        'holeFilled': int(closed[50, 65]) == 255 and int(closeCanvas[50, 65]) == 0,
    }
  exercise:
    prompt: 더 큰 구멍(반지름 15)에는 (5, 5) CLOSE 한 번으로 부족합니다. (11, 11) 커널로 다시 시도해 구멍이 메워지는지 확인하세요.
    starterCode: |-
      import cv2
      import numpy as np

      bigHoleCanvas = np.zeros((100, 140), dtype=np.uint8)
      cv2.rectangle(bigHoleCanvas, (30, 25), (100, 75), 255, -1)
      cv2.circle(bigHoleCanvas, (65, 50), 15, 0, -1)

      bigKernel = cv2.getStructuringElement(cv2.MORPH_RECT, (___, 11))
      bigClosed = cv2.morphologyEx(bigHoleCanvas, cv2.MORPH_CLOSE, bigKernel)

      {'centerAfter': int(bigClosed[50, 65]), 'filled': int(bigClosed[50, 65]) == 255}
    hints:
    - 정사각 커널이라 두 인자 모두 11입니다.
    - 빈칸에는 11이 들어갑니다.
    check:
      noError: morphologyEx 호출이 끝나야 합니다.
      resultCheck: filled가 True이고 centerAfter가 255여야 합니다.
  check:
    noError: morphologyEx 호출과 카운트가 끝나야 합니다.
    resultCheck: holeFilled가 True이고 edgePreserved가 True여야 합니다.
- id: practice
  title: 실습 - flower OTSU + open/close 정리
  structuredPrimary: true
  subtitle: 실제 사진의 모폴로지 후처리
  goal: flower 사진을 그레이스케일 → OTSU 이진화한 뒤 OPEN과 CLOSE를 차례로 적용해 마스크 픽셀 수가 어떻게 변하는지 확인합니다.
  why: 실제 사진의 이진 마스크는 보통 점 노이즈와 구멍이 함께 있습니다. OPEN으로 외부 노이즈를 정리하고 CLOSE로 내부 구멍을 메우는 흐름이 표준 후처리입니다. 직접 적용해 보면 모폴로지 한 줄 추가가 결과를 얼마나 깔끔하게 만드는지 보입니다.
  explanation: |-
    OTSU 이진화 결과는 객체 경계 부근에 작은 노이즈가 남기 쉽고, 객체 내부에 작은 검은 점이 남기도 합니다. 둘 다 모폴로지로 정리할 수 있습니다.
    OPEN은 외부 흰 노이즈, CLOSE는 내부 검은 구멍을 다룹니다. 둘을 차례로 적용하면 마스크가 매우 깔끔해집니다.
    실무에서는 OPEN → CLOSE 순서가 일반적이지만 입력에 따라 순서를 바꾸기도 합니다. 마스크 픽셀 수 변화를 보면 어느 단계에서 얼마나 정리됐는지 알 수 있습니다.
  tips:
  - 마스크 픽셀 비율은 (mask == 255).sum() / mask.size로 한 줄에 측정합니다.
  - OPEN 다음 CLOSE 순서가 일반적이지만, 입력에 작은 구멍이 많고 외부 노이즈가 적다면 CLOSE 먼저가 적합한 경우도 있습니다.
  snippet: |-
    import cv2
    from sklearn.datasets import load_sample_image

    practiceBgr = cv2.cvtColor(load_sample_image('flower.jpg'), cv2.COLOR_RGB2BGR)
    practiceGray = cv2.cvtColor(practiceBgr, cv2.COLOR_BGR2GRAY)
    _, practiceBin = cv2.threshold(practiceGray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    practiceKernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    practiceOpened = cv2.morphologyEx(practiceBin, cv2.MORPH_OPEN, practiceKernel)
    practiceCleaned = cv2.morphologyEx(practiceOpened, cv2.MORPH_CLOSE, practiceKernel)

    {
        'binWhite': int((practiceBin == 255).sum()),
        'openedWhite': int((practiceOpened == 255).sum()),
        'cleanedWhite': int((practiceCleaned == 255).sum()),
        'shape': practiceCleaned.shape,
    }
  exercise:
    prompt: OPEN의 커널 크기를 (9, 9)로 키워 더 강하게 노이즈를 제거했을 때 openedWhite가 (5, 5) 케이스보다 더 작은지 확인하세요.
    starterCode: |-
      import cv2
      from sklearn.datasets import load_sample_image

      strongBgr = cv2.cvtColor(load_sample_image('flower.jpg'), cv2.COLOR_RGB2BGR)
      strongGray = cv2.cvtColor(strongBgr, cv2.COLOR_BGR2GRAY)
      _, strongBin = cv2.threshold(strongGray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
      strongKernel = cv2.getStructuringElement(cv2.MORPH_RECT, (___, 9))
      strongOpened = cv2.morphologyEx(strongBin, cv2.MORPH_OPEN, strongKernel)

      {'strongOpenedWhite': int((strongOpened == 255).sum())}
    hints:
    - 정사각 커널이라 두 인자 모두 9입니다.
    - 빈칸에는 9가 들어갑니다.
    check:
      noError: morphologyEx 호출이 끝나야 합니다.
      resultCheck: strongOpenedWhite가 양의 정수여야 합니다.
  check:
    noError: OTSU와 morphologyEx 두 호출이 끝나야 합니다.
    resultCheck: binWhite, openedWhite, cleanedWhite 모두 양의 정수이고 shape가 (427, 640)이어야 합니다.
- id: workflow_validation
  title: 8단계. 커널 가드 + 픽셀 수 검증
  structuredPrimary: true
  subtitle: makeMorphKernel + 변화량 측정
  goal: makeMorphKernel 함수가 짝수와 너무 작은 커널을 ValueError로 차단하고, 정상 입력에서 erode/dilate 결과의 흰 픽셀 변화량이 예측 부호와 맞는지 확인합니다.
  why: 커널 크기를 잘못 주면 cv2 함수가 조용히 통과하지만 결과가 의도와 다릅니다. 함수 입구에서 명확한 ValueError를 던지면 한 줄에서 잘못된 호출이 막힙니다. 결과 검증으로는 erode<원본<dilate 부호 관계를 회귀 테스트로 둡니다.
  explanation: |-
    makeMorphKernel은 (size, size) 정사각 커널을 만듭니다. size가 1 이하면 무의미하고, 짝수면 OpenCV 함수가 동작은 하지만 효과의 중심이 비대칭이라 직관과 어긋납니다. 두 조건을 모두 ValueError로 차단합니다.
    회귀 테스트는 erode 결과의 흰 픽셀 수가 원본보다 작고, dilate 결과는 원본보다 크다는 단조성을 확인합니다. 한 줄 assert로 표현되며 알고리즘 변경 후 즉시 돌릴 수 있습니다.
    이 검증 패턴은 새로 도입한 모폴로지 코드가 기대한 부호 관계를 깨는지 빠르게 잡습니다.
  tips:
  - 짝수 커널은 OpenCV가 허용하지만 사용자가 의도한 동작이 아닐 가능성이 높습니다.
  - ValueError에 실제 받은 값을 포함시키면 호출자가 메시지만 보고 원인을 짐작할 수 있습니다.
  snippet: |-
    import cv2
    import numpy as np


    def makeMorphKernel(size: int) -> np.ndarray:
        if size <= 1:
            raise ValueError(f"커널 크기는 3 이상이어야 합니다: {size}")
        if size % 2 == 0:
            raise ValueError(f"커널 크기는 홀수여야 합니다: {size}")
        return np.ones((size, size), dtype=np.uint8)


    validateCanvas = np.zeros((50, 70), dtype=np.uint8)
    cv2.rectangle(validateCanvas, (15, 12), (55, 38), 255, -1)

    okKernel = makeMorphKernel(3)
    erodedTest = cv2.erode(validateCanvas, okKernel)
    dilatedTest = cv2.dilate(validateCanvas, okKernel)

    try:
        makeMorphKernel(4)
        evenMessage = 'unexpected pass'
    except ValueError as exc:
        evenMessage = str(exc)

    {
        'erodeIsSmaller': int((erodedTest == 255).sum()) < int((validateCanvas == 255).sum()),
        'dilateIsBigger': int((dilatedTest == 255).sum()) > int((validateCanvas == 255).sum()),
        'evenMessage': evenMessage,
    }
  exercise:
    prompt: makeMorphKernel에 1을 넣으면 너무 작아서 차단되는지, 메시지에 '3 이상' 단서가 포함되는지 확인하세요.
    starterCode: |-
      import numpy as np


      def makeMorphKernel(size: int) -> np.ndarray:
          if size <= 1:
              raise ValueError(f"커널 크기는 3 이상이어야 합니다: {size}")
          if size % 2 == 0:
              raise ValueError(f"커널 크기는 홀수여야 합니다: {size}")
          return np.ones((size, size), dtype=np.uint8)


      try:
          makeMorphKernel(___)
          tinyMessage = 'unexpected pass'
      except ValueError as exc:
          tinyMessage = str(exc)

      {'tinyMessage': tinyMessage, 'hasMinHint': '3 이상' in tinyMessage}
    hints:
    - size 1은 첫 번째 분기에서 잡힙니다.
    - 빈칸에는 1이 들어갑니다.
    check:
      noError: makeMorphKernel 정의가 끝나야 합니다.
      resultCheck: hasMinHint가 True이고 tinyMessage 안에 '1'이 포함되어야 합니다.
  check:
    noError: makeMorphKernel과 erode/dilate 호출이 끝나야 합니다.
    resultCheck: erodeIsSmaller, dilateIsBigger, evenMessage에 '홀수' 단서가 모두 True/포함되어야 합니다.
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
  - id: opencv_07-morphology-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_create
    - workflow_validation
    title: 모폴로지 연산기 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: operation·홀수 kernel·iteration budget를 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_morphology_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_morphology_contract(value):
            raise NotImplementedError
      solution: |
        def audit_morphology_contract(value):
            required = ['operation', 'kernelSize', 'iterations', 'kernelShape']
            rules = [{'id': 'operation', 'field': 'operation', 'kind': 'enum', 'values': ['erode', 'dilate', 'open', 'close', 'gradient']}, {'id': 'kernel-size', 'field': 'kernelSize', 'kind': 'odd'}, {'id': 'iterations', 'field': 'iterations', 'kind': 'range', 'min': 1, 'max': 20}, {'id': 'kernel-shape', 'field': 'kernelShape', 'kind': 'enum', 'values': ['rect', 'ellipse', 'cross']}]
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
            return {"accepted": not missing and not violations, "topic": 'morphology', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.opencv.opencv_07.morphology-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.opencv.opencv_07.morphology-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_morphology_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              operation: close
              kernelSize: 5
              iterations: 2
              kernelShape: ellipse
          expectedReturn:
            accepted: true
            topic: morphology
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              kernelSize: 5
              iterations: 2
              kernelShape: ellipse
          expectedReturn:
            accepted: false
            topic: morphology
            missing:
            - operation
            violations:
            - operation
        - id: reports-topic-invariants
          arguments:
          - value:
              operation: blur
              kernelSize: 4
              iterations: 0
              kernelShape: star
          expectedReturn:
            accepted: false
            topic: morphology
            missing: []
            violations:
            - iterations
            - kernel-shape
            - kernel-size
            - operation
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: opencv_07-morphology-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - opencv_07-morphology-contract-audit-mastery
    title: 모폴로지 연산기 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_morphology_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_morphology_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_morphology_result(expected, observed):
            identity = ['sourceHash', 'morphologyHash']
            metrics = {'componentCount': 1}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'morphology', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.opencv.opencv_07.morphology-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.opencv.opencv_07.morphology-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_morphology_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: mo1
              morphologyHash: close-e5-2
              componentCount: 12
          - value:
              sourceHash: mo1
              morphologyHash: close-e5-2
              componentCount: 13
          expectedReturn:
            passed: true
            topic: morphology
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: mo1
              morphologyHash: close-e5-2
              componentCount: 12
          - value:
              sourceHash: mo2
              morphologyHash: bad
              componentCount: 30
          expectedReturn:
            passed: false
            topic: morphology
            missing: []
            identityMismatch:
            - morphologyHash
            - sourceHash
            metricDrift:
            - componentCount
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: mo1
              morphologyHash: close-e5-2
              componentCount: 12
          - value: {}
          expectedReturn:
            passed: false
            topic: morphology
            missing:
            - componentCount
            - morphologyHash
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: opencv_07-morphology-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - opencv_07-morphology-result-reconciliation-transfer
    title: 모폴로지 연산기 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_morphology_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_morphology_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_morphology_evidence(stage):
            stages = {'source': {'action': 'validate morphology source', 'evidence': 'operation kernel iterations', 'risk': 'invalid image contract'}, 'operation': {'action': 'run bounded morphology operation', 'evidence': 'binary morphology trace', 'risk': 'unstable parameters'}, 'result': {'action': 'reconcile morphology result', 'evidence': 'component count change', 'risk': 'wrong visual inference'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.opencv.opencv_07.morphology-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.opencv.opencv_07.morphology-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_morphology_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate morphology source
            evidence: operation kernel iterations
            risk: invalid image contract
        - id: recalls-operation
          arguments:
          - value: operation
          expectedReturn:
            action: run bounded morphology operation
            evidence: binary morphology trace
            risk: unstable parameters
        - id: recalls-result
          arguments:
          - value: result
          expectedReturn:
            action: reconcile morphology result
            evidence: component count change
            risk: wrong visual inference
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};