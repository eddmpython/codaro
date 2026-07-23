var e=`meta:\r
  packages:\r
  - opencv-python\r
  - numpy\r
  id: opencv_00\r
  title: OpenCV소개\r
  order: 0\r
  category: opencv\r
  badge: 소개\r
  tags:\r
  - OpenCV\r
  - cv2\r
  - 컴퓨터비전\r
  - 이미지처리\r
  - 에지검출\r
  - 컨투어\r
  seo:\r
    title: OpenCV 소개 - 파이썬 컴퓨터 비전 라이브러리\r
    description: OpenCV로 이미지 분석, 에지 검출, 컨투어 추출 등 컴퓨터 비전의 기초를 배웁니다.\r
    keywords:\r
    - OpenCV\r
    - cv2\r
    - 컴퓨터비전\r
    - 에지검출\r
    - Canny\r
    - 컨투어\r
intro:\r
  direction: OpenCV는 이미지를 NumPy 배열로 다루는 컴퓨터 비전 라이브러리입니다. 이 트랙은 배열 shape/dtype/채널을 매 단계마다 확인하면서 검출 결과까지 검증하는 흐름을 배웁니다.\r
  benefits:\r
  - 이미지가 (높이, 너비, 채널) ndarray로 표현된다는 사실을 코드로 확인합니다.\r
  - BGR/Gray/HSV 색공간 차이와 변환 시 채널 수가 어떻게 달라지는지 파악합니다.\r
  - Canny 에지, findContours 컨투어, morphologyEx 모폴로지 같은 핵심 함수의 입력/출력 계약을 이해합니다.\r
  - 첫 실행 셀에서 shape, dtype, edgePixelCount를 assert로 고정해 검출 흐름을 확인합니다.\r
  - 검출 결과를 픽셀 수, 컨투어 개수처럼 수치로 검증하는 습관을 들입니다.\r
  diagram:\r
    steps:\r
    - label: 합성 이미지로 입력 만들기\r
      detail: np.zeros + cv2.rectangle 등으로 정답을 알고 있는 입력을 만듭니다.\r
    - label: cv2 함수 실행\r
      detail: cvtColor / Canny / findContours 같은 핵심 함수를 적용합니다.\r
    - label: 수치로 결과 검증\r
      detail: shape, dtype, 채널 수, 검출된 컨투어 개수로 결과를 비교합니다.\r
    - label: 파이프라인 재사용\r
      detail: 검증된 처리 단계를 다음 강의에서 그대로 호출합니다.\r
    runtime:\r
    - label: 컴퓨터 비전 환경\r
      detail: opencv-python, numpy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: OpenCV 셀 실행\r
      detail: 셀을 실행해 shape, dtype, 채널 수와 예외 상태를 확인합니다.\r
    - label: 다음 강의로 연결\r
      detail: 검증된 결과를 다음 비전 처리 단계의 입력으로 넘깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 👁️\r
    title: OpenCV\r
    subtitle: 파이썬 컴퓨터 비전 라이브러리\r
  - type: hero\r
    emoji: 🔍\r
    title: 이미지를 분석하고 이해하다\r
    subtitle: 에지 검출부터 객체 인식까지\r
    points:\r
    - emoji: 📐\r
      title: 에지 검출\r
    - emoji: 🔲\r
      title: 컨투어 추출\r
    - emoji: 🎨\r
      title: 색공간 변환\r
    - emoji: ⚙️\r
      title: 형태학적 연산\r
  goal: 트랙 전체에서 다룰 네 가지 축(에지/컨투어/색공간/모폴로지)을 한눈에 정리한다.\r
  why: OpenCV는 함수 수가 많아 처음에는 어디서 무엇을 쓰는지 헷갈리기 쉽습니다. 네 영역으로 묶어두면 새 함수를 만났을 때 어디에 속하는지 빠르게 분류할 수 있습니다.\r
- id: opencv_history\r
  blocks:\r
  - type: sectionHeader\r
    title: 🏛️ OpenCV란?\r
    subtitle: 컴퓨터 비전의 표준\r
  - type: text\r
    content: OpenCV(Open Source Computer Vision Library)는 2000년 인텔에서 시작된 오픈소스 컴퓨터 비전 라이브러리입니다. 현재 2500개\r
      이상의 최적화된 알고리즘을 제공하며, 얼굴 인식, 객체 추적, 의료 영상 분석 등 다양한 분야에서 활용됩니다. C++로 작성되어 매우 빠르고, Python 바인딩(cv2)으로\r
      쉽게 사용할 수 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: ⚡\r
      title: 고성능\r
      description: C++로 작성되어 실시간 영상 처리가 가능한 속도를 제공합니다\r
    - emoji: 🔬\r
      title: 풍부한 알고리즘\r
      description: 에지 검출, 특징점 추출, 객체 인식 등 2500+ 알고리즘을 제공합니다\r
    - emoji: 🌐\r
      title: 크로스 플랫폼\r
      description: Windows, Linux, macOS, Android, iOS 등 다양한 플랫폼을 지원합니다\r
  goal: cv2 모듈이 어떤 배경에서 만들어졌고 왜 C++ 백엔드에 Python 바인딩이 얹힌 구조인지 이해한다.\r
  why: 동일 연산을 NumPy로 직접 짜는 것보다 cv2 함수가 수십 배 빠른 이유를 알아야 어떤 작업을 직접 짜고 어떤 작업을 cv2에 위임할지 판단할 수 있습니다.\r
- id: why_opencv\r
  blocks:\r
  - type: sectionHeader\r
    title: 🚀 왜 OpenCV인가?\r
    subtitle: 이미지 처리를 넘어 비전으로\r
  - type: text\r
    content: Pillow가 이미지 편집에 특화되어 있다면, OpenCV는 이미지 분석과 컴퓨터 비전에 특화되어 있습니다. 이미지에서 경계선을 찾고, 물체의 윤곽을 추출하고,\r
      특정 색상 영역을 분리하는 등 '이미지를 이해'하는 작업에 강점이 있습니다.\r
  - type: note\r
    title: 컴퓨터 비전이란?\r
    content: 컴퓨터가 디지털 이미지나 비디오를 '보고' 이해하도록 하는 기술입니다. 단순히 픽셀 값을 조작하는 것을 넘어, 이미지에서 의미 있는 정보를 추출합니다. 예를 들어\r
      사진에서 얼굴 위치를 찾거나, 자동차 번호판 문자를 인식하거나, 불량품을 검출하는 것이 컴퓨터 비전입니다.\r
  goal: 편집(Pillow) vs 분석(OpenCV)의 경계를 구분한다.\r
  why: 같은 작업도 어떤 라이브러리로 푸는 게 자연스러운지 미리 알면 도구 선택에 시간을 낭비하지 않습니다. 워터마크는 Pillow가, 객체 검출은 OpenCV가 한 줄 차이로 갈립니다.\r
- id: bgr_order\r
  blocks:\r
  - type: sectionHeader\r
    title: 🔴🟢🔵 BGR 색순서\r
    subtitle: OpenCV의 특징\r
  - type: text\r
    content: OpenCV는 역사적 이유로 RGB가 아닌 BGR 순서를 사용합니다. 이미지를 읽으면 Blue, Green, Red 순서로 채널이 배치됩니다. matplotlib이나\r
      다른 라이브러리와 함께 사용할 때는 cvtColor()로 RGB로 변환해야 올바른 색상이 표시됩니다.\r
  - type: table\r
    headers:\r
    - 라이브러리\r
    - 색순서\r
    - 변환 필요\r
    rows:\r
    - - OpenCV (cv2)\r
      - BGR\r
      - matplotlib 출력 시 RGB로 변환\r
    - - Pillow\r
      - RGB\r
      - 변환 불필요\r
    - - matplotlib\r
      - RGB\r
      - 변환 불필요\r
    - - NumPy (sklearn 이미지)\r
      - RGB\r
      - cv2 사용 시 BGR로 변환\r
  - type: note\r
    title: 왜 BGR인가?\r
    content: OpenCV가 처음 개발될 당시(2000년경) 널리 사용되던 카메라와 비디오 장치들이 BGR 순서를 사용했기 때문입니다. 호환성을 위해 이 순서가 유지되고 있습니다.\r
  goal: cv2의 채널 순서가 다른 라이브러리와 반대라는 사실과 변환 지점을 미리 익혀둔다.\r
  why: BGR/RGB 혼동은 OpenCV 초보가 가장 흔히 겪는 버그입니다. 빨간 사과가 파랗게 표시되면 거의 색순서 문제이며, cvtColor(image, cv2.COLOR_BGR2RGB) 한 줄로 해결됩니다.\r
- id: ndarray\r
  blocks:\r
  - type: sectionHeader\r
    title: 📦 이미지 = NumPy 배열\r
    subtitle: OpenCV의 데이터 구조\r
  - type: text\r
    content: OpenCV에서 이미지는 NumPy의 ndarray입니다. Pillow의 Image 객체와 달리, NumPy 배열이므로 배열 연산을 직접 적용할 수 있습니다.\r
      shape은 (높이, 너비, 채널) 순서이고, dtype은 보통 uint8(0-255)입니다.\r
  - type: table\r
    headers:\r
    - 속성\r
    - 의미\r
    - 예시\r
    rows:\r
    - - shape\r
      - (높이, 너비, 채널)\r
      - (480, 640, 3)\r
    - - dtype\r
      - 데이터 타입\r
      - uint8\r
    - - size\r
      - 전체 픽셀 수\r
      - 921600 (480×640×3)\r
    - - ndim\r
      - 차원 수\r
      - 3 (컬러), 2 (흑백)\r
  goal: cv2 이미지가 곧 ndarray라는 사실과 (height, width) 순서가 Pillow의 (width, height)와 반대인 점을 분명히 한다.\r
  why: shape이 (h, w)이고 size가 (w, h)인 차이는 자르기 좌표, 리사이즈 인자, 회전 행렬에서 매번 등장합니다. 처음에 한 번 외워두면 이후 모든 강의에서 인덱싱 오류가 줄어듭니다.\r
- id: features\r
  blocks:\r
  - type: sectionHeader\r
    title: 🛠️ OpenCV 주요 기능\r
    subtitle: 컴퓨터 비전의 모든 것\r
  - type: text\r
    content: OpenCV가 제공하는 주요 기능을 살펴봅시다. 기본적인 이미지 처리부터 고급 컴퓨터 비전까지 폭넓게 지원합니다.\r
  - type: table\r
    headers:\r
    - 기능\r
    - 설명\r
    - 함수\r
    rows:\r
    - - 색공간 변환\r
      - BGR, RGB, Gray, HSV 등 변환\r
      - cvtColor()\r
    - - 기하학적 변환\r
      - 크기 조절, 회전, 뒤집기\r
      - resize(), rotate(), flip()\r
    - - 필터링\r
      - 블러, 샤프닝, 노이즈 제거\r
      - blur(), GaussianBlur(), medianBlur()\r
    - - 에지 검출\r
      - 경계선 찾기\r
      - Canny(), Sobel(), Laplacian()\r
    - - 임계값 처리\r
      - 이진화, 적응형 임계값\r
      - threshold(), adaptiveThreshold()\r
    - - 모폴로지\r
      - 침식, 팽창, 열기, 닫기\r
      - erode(), dilate(), morphologyEx()\r
    - - 컨투어\r
      - 윤곽선 검출 및 분석\r
      - findContours(), drawContours()\r
    - - 히스토그램\r
      - 밝기 분포 분석\r
      - calcHist(), equalizeHist()\r
  goal: 트랙의 10개 강의에서 다룰 주요 함수 카테고리를 한 표로 본다.\r
  why: 함수가 어느 카테고리에 속하는지 알면 모르는 함수를 만났을 때 비슷한 카테고리의 다른 함수에서 사용법을 유추할 수 있습니다.\r
- id: edge_detection\r
  blocks:\r
  - type: sectionHeader\r
    title: 📐 에지 검출\r
    subtitle: 경계를 찾아내다\r
  - type: text\r
    content: 에지(edge)는 이미지에서 밝기가 급격히 변하는 곳입니다. 물체의 경계, 텍스처의 변화 등이 에지로 나타납니다. 에지 검출은 컴퓨터 비전의 가장 기본적인 작업\r
      중 하나이며, 객체 인식의 첫 단계로 자주 사용됩니다.\r
  - type: table\r
    headers:\r
    - 알고리즘\r
    - 특징\r
    - 용도\r
    rows:\r
    - - Canny\r
      - 가장 널리 사용, 두 개의 임계값 사용\r
      - 범용 에지 검출\r
    - - Sobel\r
      - X 또는 Y 방향 미분\r
      - 방향성 에지 검출\r
    - - Laplacian\r
      - 2차 미분, 모든 방향\r
      - 세밀한 에지 검출\r
  goal: 에지 검출 3대장(Canny/Sobel/Laplacian)이 어떻게 다른지 미리 파악한다.\r
  why: 같은 입력 이미지에서 알고리즘마다 결과가 완전히 다릅니다. 어떤 알고리즘을 언제 쓰는지 알면 시행착오 횟수가 줄어듭니다 - Canny는 윤곽선, Sobel은 방향, Laplacian은 노이즈에 민감.\r
- id: contour\r
  blocks:\r
  - type: sectionHeader\r
    title: 🔲 컨투어\r
    subtitle: 물체의 윤곽\r
  - type: text\r
    content: 컨투어(contour)는 같은 색이나 밝기를 가진 연속적인 점들의 곡선입니다. 이진화된 이미지에서 물체의 외곽선을 추출할 때 사용합니다. 컨투어를 분석하면 물체의\r
      면적, 둘레, 무게중심 등을 계산할 수 있습니다.\r
  - type: table\r
    headers:\r
    - 함수\r
    - 기능\r
    rows:\r
    - - findContours()\r
      - 이진 이미지에서 컨투어 검출\r
    - - drawContours()\r
      - 컨투어를 이미지에 그리기\r
    - - contourArea()\r
      - 컨투어 면적 계산\r
    - - arcLength()\r
      - 컨투어 둘레 계산\r
    - - boundingRect()\r
      - 컨투어를 감싸는 사각형\r
    - - minEnclosingCircle()\r
      - 컨투어를 감싸는 최소 원\r
  goal: 컨투어가 단순한 점 리스트가 아니라 면적/둘레/형태 분석으로 이어진다는 사실을 본다.\r
  why: findContours로 끝나는 게 아니라 그 뒤의 contourArea, boundingRect까지가 한 세트입니다. 객체 개수 세기, 크기 필터링은 모두 이 조합으로 해결됩니다.\r
- id: morphology\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚙️ 모폴로지 연산\r
    subtitle: 형태학적 변환\r
  - type: text\r
    content: 모폴로지(morphology) 연산은 이진 이미지의 형태를 변형하는 연산입니다. 노이즈 제거, 물체 분리, 구멍 채우기 등에 사용됩니다. 기본 연산인 침식과 팽창을\r
      조합하여 열기, 닫기 등의 연산을 수행합니다.\r
  - type: table\r
    headers:\r
    - 연산\r
    - 효과\r
    - 용도\r
    rows:\r
    - - 침식 (Erosion)\r
      - 물체 경계를 깎아냄\r
      - 노이즈 제거, 물체 분리\r
    - - 팽창 (Dilation)\r
      - 물체 경계를 확장\r
      - 구멍 채우기, 연결\r
    - - 열기 (Opening)\r
      - 침식 후 팽창\r
      - 작은 돌출부 제거\r
    - - 닫기 (Closing)\r
      - 팽창 후 침식\r
      - 작은 구멍 채우기\r
  goal: 침식/팽창의 조합으로 열기/닫기가 만들어진다는 구조를 파악한다.\r
  why: 모폴로지는 이진화 결과의 노이즈를 정리하는 마무리 단계입니다. 점 노이즈는 열기로, 구멍은 닫기로 - 이 두 패턴만 알아도 컨투어 검출 품질이 크게 개선됩니다.\r
- id: comparison\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚖️ OpenCV vs Pillow\r
    subtitle: 목적에 맞는 선택\r
  - type: table\r
    headers:\r
    - 항목\r
    - OpenCV\r
    - Pillow\r
    rows:\r
    - - 주요 용도\r
      - 컴퓨터 비전, 분석\r
      - 이미지 편집\r
    - - 색순서\r
      - BGR\r
      - RGB\r
    - - 자료형\r
      - numpy.ndarray\r
      - PIL.Image\r
    - - 에지 검출\r
      - Canny, Sobel, Laplacian\r
      - FIND_EDGES (기본만)\r
    - - 컨투어\r
      - findContours (강력)\r
      - 미지원\r
    - - 모폴로지\r
      - erode, dilate, morphologyEx\r
      - 미지원\r
    - - 텍스트 삽입\r
      - putText (기본 폰트)\r
      - ImageDraw (폰트 지원)\r
    - - 학습 난이도\r
      - 중간\r
      - 쉬움\r
  goal: 두 라이브러리의 강점이 정확히 반대 영역이라는 점을 표로 확인한다.\r
  why: 둘 다 쓸 일이 많고 함께 쓰는 일도 많습니다. cv2로 검출하고 Pillow로 텍스트 박는 식의 조합이 흔합니다 - 어느 단계에서 어느 도구를 쓸지 미리 결정해두면 코드가 단순해집니다.\r
- id: usecases\r
  blocks:\r
  - type: sectionHeader\r
    title: 💡 활용 분야\r
    subtitle: OpenCV가 사용되는 곳\r
  - type: text\r
    content: OpenCV는 산업, 의료, 보안, 자율주행 등 다양한 분야에서 활용됩니다.\r
  - type: table\r
    headers:\r
    - 분야\r
    - 활용 예시\r
    rows:\r
    - - 제조업\r
      - 불량품 검출, 부품 검사, 치수 측정\r
    - - 의료\r
      - X-ray 분석, 세포 계수, 종양 검출\r
    - - 보안\r
      - 얼굴 인식, 움직임 감지, 번호판 인식\r
    - - 자율주행\r
      - 차선 인식, 표지판 인식, 장애물 감지\r
    - - 농업\r
      - 작물 상태 분석, 수확 시기 판단\r
    - - 문서 처리\r
      - OCR 전처리, 문서 스캔 보정\r
  goal: 학습한 함수들이 어떤 실제 시스템에서 어떻게 결합되는지 머릿속에 그린다.\r
  why: 트랙을 마친 뒤 자기 프로젝트를 떠올릴 때 출발점이 됩니다. 불량품 검출이라면 이진화 → 모폴로지 → 컨투어 → 면적 필터링 같은 식으로 함수 조합이 떠오릅니다.\r
- id: local_runtime_note\r
  blocks:\r
  - type: sectionHeader\r
    title: 📋 시각화 안내\r
    subtitle: Codaro 로컬 Python 환경에서의 출력\r
  - type: note\r
    title: matplotlib으로 출력\r
    content: 이 커리큘럼은 Codaro 로컬 Python 환경에서 실행됩니다. 결과 확인은 배열 shape, 픽셀 통계, 저장 파일, matplotlib 출력처럼 재현 가능한\r
      방식으로 진행합니다. 컬러 이미지를 matplotlib으로 볼 때는 BGR을 RGB로 변환해야 올바른 색상이 표시됩니다.\r
  goal: 결과 확인은 imshow GUI가 아니라 수치 + matplotlib + 저장 파일로 한다는 학습 방식을 짚는다.\r
  why: cv2.imshow는 로컬 데스크톱 환경에서 동작하지만 노트북에서는 일관되지 않습니다. shape/통계/저장으로 검증하는 습관이 자동화·테스트로 그대로 이어집니다.\r
- id: curriculum\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 커리큘럼\r
    subtitle: 10개 프로젝트로 마스터\r
  - type: text\r
    content: 이 커리큘럼에서는 10개의 프로젝트를 통해 OpenCV를 배웁니다.\r
  - type: table\r
    headers:\r
    - 프로젝트\r
    - 데이터\r
    - 핵심 개념\r
    rows:\r
    - - 01. 이미지 구조 탐색기\r
      - sklearn flower\r
      - shape, dtype, BGR/RGB\r
    - - 02. 색공간 변환기\r
      - sklearn china\r
      - cvtColor, Gray, HSV\r
    - - 03. 기하학적 변환기\r
      - Lorem Picsum\r
      - resize, rotate, flip\r
    - - 04. 이미지 필터 랩\r
      - Lorem Picsum\r
      - blur, GaussianBlur\r
    - - 05. 에지 검출기\r
      - sklearn china\r
      - Canny, Sobel, Laplacian\r
    - - 06. 이진화 스튜디오\r
      - Lorem Picsum\r
      - threshold, adaptiveThreshold\r
    - - 07. 모폴로지 연산기\r
      - 합성 이미지\r
      - erode, dilate, morphologyEx\r
    - - 08. 히스토그램 분석기\r
      - sklearn flower\r
      - calcHist, equalizeHist\r
    - - 09. 컨투어 탐지기\r
      - 합성 이미지\r
      - findContours, drawContours\r
    - - 10. 종합 비전 프로젝트\r
      - 복합\r
      - 전체 개념 종합\r
  goal: 10개 강의가 입력 구조 → 변환 → 필터 → 검출 → 종합 순서로 쌓이는 흐름을 확인한다.\r
  why: 강의 순서는 무작위가 아니라 의존성 그래프입니다. 02 색공간이 05 에지의 입력, 06 이진화가 07 모폴로지의 입력, 모든 과정이 10 종합 프로젝트로 모입니다.\r
- id: start\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎯 시작하기\r
    subtitle: 첫 번째 프로젝트로\r
  - type: text\r
    content: OpenCV를 배우면 이미지를 단순히 보는 것을 넘어 분석하고 이해할 수 있습니다. 에지 검출로 물체의 경계를 찾고, 컨투어로 윤곽을 추출하고, 색상 필터링으로\r
      특정 영역을 분리하는 등 컴퓨터 비전의 핵심 기술을 익힐 수 있습니다. 첫 번째 프로젝트에서 이미지가 NumPy 배열로 어떻게 표현되는지 알아봅시다.\r
  goal: 다음 강의(01 이미지 구조 탐색기)로 자연스럽게 넘어갈 마음의 준비를 한다.\r
  why: 첫 번째 강의는 shape/dtype/픽셀 인덱싱부터 시작합니다. OpenCV의 모든 기능은 결국 ndarray 위에서 일어난다는 사실을 잡고 들어가야 이후 강의가 빨라집니다.\r
- id: workflow_validation\r
  title: 로컬 비전 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 합성 이미지를 만들고 cv2 함수를 통과시킨 뒤 결과 shape/dtype/검출 개수를 assert로 확정한다.\r
  why: OpenCV 학습의 핵심은 함수 결과를 눈으로만 확인하지 않고 수치로 검증하는 습관입니다. 입력 조건을 알고 있는 합성 이미지를 쓰면 회귀 테스트처럼 결과를 고정할 수 있습니다.\r
  explanation: |-\r
    OpenCV는 화면에 이미지를 띄우는 도구가 아니라 배열을 입력받아 검증 가능한 결과를 만드는 로컬 비전 파이프라인입니다. 이 트랙의 모든 강의는 합성 입력을 만들고, cv2 함수를 통과시킨 다음, shape/dtype/픽셀 합/검출 개수 같은 수치로 결과를 확정합니다.\r
\r
    예제에서는 96x144 검정 캔버스에 흰 사각형을 그리고, validateBgrImage 가드로 입력 계약(uint8 + 3채널)을 확인합니다. 그다음 BGR을 그레이로 변환해 채널 수가 3에서 사라지는지, Canny로 에지를 뽑아 흰색 픽셀이 0보다 많은지를 assert로 확인합니다.\r
\r
    이 패턴은 다음 강의들에서 그대로 반복됩니다 - 입력 만들기 → cv2 함수 → assert로 결과 확정.\r
  tips:\r
  - 합성 이미지(np.zeros + cv2.rectangle 등)는 정답을 알고 있어 회귀 테스트로 쓰기 좋습니다.\r
  - shape이 (h, w, c)인지 (h, w)인지 매번 확인하면 채널 수 실수를 미리 잡을 수 있습니다.\r
  - cv2 함수는 dtype에 민감합니다. Canny 같은 함수는 uint8을 요구하므로 dtype을 먼저 확인하세요.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
\r
    introImage = np.zeros((96, 144, 3), dtype=np.uint8)\r
    cv2.rectangle(introImage, (20, 24), (124, 72), (255, 255, 255), -1)\r
    cv2.line(introImage, (20, 24), (124, 72), (0, 0, 255), 3)\r
\r
    def validateBgrImage(image):\r
        if image.dtype != np.uint8:\r
            raise ValueError(f"uint8 이미지가 아닙니다: {image.dtype}")\r
        if image.ndim != 3 or image.shape[2] != 3:\r
            raise ValueError(f"BGR 3채널 이미지가 아닙니다: {image.shape}")\r
        return True\r
\r
    validateBgrImage(introImage)\r
\r
    gray = cv2.cvtColor(introImage, cv2.COLOR_BGR2GRAY)\r
    edges = cv2.Canny(gray, 80, 160)\r
\r
    assert gray.shape == (96, 144), f"gray shape: {gray.shape}"\r
    assert gray.ndim == 2, f"gray ndim: {gray.ndim}"\r
    assert edges.dtype == np.uint8, f"edges dtype: {edges.dtype}"\r
    assert int((edges > 0).sum()) > 0, "에지 픽셀이 검출되지 않았습니다"\r
\r
    report = {\r
        "inputShape": tuple(introImage.shape),\r
        "grayShape": tuple(gray.shape),\r
        "edgePixelCount": int((edges > 0).sum()),\r
    }\r
    report\r
  exercise:\r
    prompt: 사각형 좌표나 Canny 임계값을 바꾸고 edgePixelCount가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import cv2\r
      import numpy as np\r
\r
      introImage = np.zeros((96, 144, 3), dtype=np.uint8)\r
      cv2.rectangle(introImage, (20, 24), (124, 72), (255, 255, 255), -1)\r
      cv2.line(introImage, (20, 24), (124, 72), (0, 0, 255), 3)\r
\r
      def validateBgrImage(image):\r
          if image.dtype != np.uint8:\r
              raise ValueError(f"uint8 이미지가 아닙니다: {image.dtype}")\r
          if image.ndim != 3 or image.shape[2] != 3:\r
              raise ValueError(f"BGR 3채널 이미지가 아닙니다: {image.shape}")\r
          return True\r
\r
      validateBgrImage(introImage)\r
\r
      gray = cv2.cvtColor(introImage, cv2.COLOR_BGR2GRAY)\r
      edges = cv2.Canny(gray, ___, ___)\r
\r
      assert gray.shape == (96, 144)\r
      assert gray.ndim == 2\r
      assert int((edges > 0).sum()) > 0\r
\r
      report = {\r
          "edgePixelCount": int((edges > 0).sum()),\r
          "low": ___,\r
          "high": ___,\r
      }\r
      report\r
    hints:\r
    - Canny는 low/high 두 임계값을 받습니다. 보통 high가 low의 2~3배입니다.\r
    - 임계값을 낮추면 약한 에지도 잡혀 edgePixelCount가 늘어납니다.\r
  check:\r
    noError: 합성 이미지가 uint8 BGR 3채널이고 Canny가 정상적으로 에지를 반환해야 합니다.\r
    resultCheck: edgePixelCount가 0보다 크고, 임계값을 바꾸면 그 값이 달라져야 합니다.\r
`;export{e as default};