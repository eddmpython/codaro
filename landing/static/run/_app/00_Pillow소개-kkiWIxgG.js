var e=`meta:\r
  packages:\r
  - pillow\r
  id: pillow_00\r
  title: Pillow소개\r
  order: 0\r
  category: pillow\r
  badge: 소개\r
  tags:\r
  - Pillow\r
  - PIL\r
  - 이미지처리\r
  - Image\r
  - 필터\r
  - 합성\r
  seo:\r
    title: Pillow 소개 - 파이썬 이미지 처리 라이브러리\r
    description: Pillow로 이미지를 열고, 편집하고, 저장하는 방법을 배웁니다. 크기 조절, 필터, 텍스트 삽입 등 이미지 처리의 기초를 익힙니다.\r
    keywords:\r
    - Pillow\r
    - PIL\r
    - 이미지처리\r
    - Python Image\r
    - 필터\r
    - 리사이즈\r
intro:\r
  direction: Pillow는 이미지를 Image 객체로 다루는 편집·합성 라이브러리입니다. 이 트랙은 mode/size/픽셀 통계를 매 단계 확인하면서 자르기·필터·합성·저장까지 검증하는 흐름을 배웁니다.\r
  benefits:\r
  - 이미지의 mode(L/RGB/RGBA)와 size(width, height)를 코드로 확인합니다.\r
  - crop/rotate/resize/convert가 무엇을 바꾸고 무엇을 그대로 두는지 픽셀로 검증합니다.\r
  - ImageFilter, ImageEnhance, ImageDraw 세 모듈의 역할 분담을 익힙니다.\r
  - 첫 실행 셀에서 mode, size, grayMean을 assert로 고정해 처리 흐름을 확인합니다.\r
  - paste의 mask 인자로 알파 합성이 어떻게 일어나는지 손으로 확인합니다.\r
  diagram:\r
    steps:\r
    - label: 합성 이미지로 입력 만들기\r
      detail: Image.new + ImageDraw로 정답을 알고 있는 입력을 만듭니다.\r
    - label: Pillow 메서드 실행\r
      detail: convert/resize/filter/paste 같은 핵심 메서드를 적용합니다.\r
    - label: 수치로 결과 검증\r
      detail: mode, size, ImageStat.mean, getpixel로 결과를 비교합니다.\r
    - label: 파이프라인 재사용\r
      detail: 검증된 처리 단계를 다음 강의에서 그대로 호출합니다.\r
    runtime:\r
    - label: 이미지 처리 환경\r
      detail: pillow 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: Pillow 셀 실행\r
      detail: 셀을 실행해 mode, size, 픽셀 통계와 예외 상태를 확인합니다.\r
    - label: 다음 강의로 연결\r
      detail: 검증된 결과를 다음 이미지 처리 단계의 입력으로 넘깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 🖼️\r
    title: Pillow\r
    subtitle: 파이썬 이미지 처리 라이브러리\r
  - type: hero\r
    emoji: 🎨\r
    title: 이미지를 코드로 다루다\r
    subtitle: 열기, 편집, 저장까지 한 번에\r
    points:\r
    - emoji: 📷\r
      title: 이미지 열기/저장\r
    - emoji: ✂️\r
      title: 자르기/회전\r
    - emoji: 🎭\r
      title: 필터/효과\r
    - emoji: ✏️\r
      title: 텍스트/도형\r
  goal: 트랙 전체에서 다룰 네 가지 축(열기·저장 / 변형 / 필터 / 그리기)을 한눈에 정리한다.\r
  why: Pillow는 메서드가 많아 처음에는 어느 메서드가 무엇을 하는지 흩어져 보입니다. 네 영역으로 묶어두면 작업에 맞는 메서드를 빠르게 찾을 수 있습니다.\r
- id: pillow_history\r
  blocks:\r
  - type: sectionHeader\r
    title: 🏛️ Pillow란?\r
    subtitle: PIL의 현대적 계승자\r
  - type: text\r
    content: Pillow는 PIL(Python Imaging Library)의 친화적인 포크(fork)입니다. 원본 PIL은 2009년 이후 업데이트가 중단되었지만, Pillow가\r
      이를 이어받아 현재까지 활발히 개발되고 있습니다. 파이썬에서 이미지를 다룰 때 가장 널리 사용되는 라이브러리이며, 설치도 간단하고 사용법도 직관적입니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 📂\r
      title: 다양한 포맷\r
      description: JPEG, PNG, GIF, BMP, TIFF 등 30개 이상의 이미지 포맷을 지원합니다\r
    - emoji: ⚡\r
      title: 간단한 API\r
      description: 직관적인 메서드로 복잡한 이미지 처리를 몇 줄로 해결합니다\r
    - emoji: 🔗\r
      title: NumPy 연동\r
      description: NumPy 배열과 상호 변환이 가능해 과학 계산과 연계됩니다\r
  goal: import PIL과 from PIL import Image가 왜 'PIL'이라는 이름을 그대로 쓰는지 이해한다.\r
  why: 패키지 이름은 pillow인데 import는 PIL인 비대칭이 헷갈리는 첫 지점입니다. 역사적 호환성을 알면 검색 결과의 PIL 코드와 최신 Pillow 코드가 같은 것임을 알 수 있습니다.\r
- id: why_pillow\r
  blocks:\r
  - type: sectionHeader\r
    title: 🚀 왜 Pillow인가?\r
    subtitle: 이미지 처리의 시작점\r
  - type: text\r
    content: 이미지는 본질적으로 픽셀의 2차원 배열입니다. Pillow는 이 픽셀 데이터에 쉽게 접근하고 조작할 수 있게 해줍니다. 웹 개발에서 썸네일 생성, 데이터 분석에서\r
      이미지 전처리, 자동화 스크립트에서 일괄 변환 등 다양한 곳에서 활용됩니다.\r
  - type: note\r
    title: OpenCV와의 차이\r
    content: OpenCV는 컴퓨터 비전과 실시간 영상 처리에 특화되어 있고, Pillow는 정적 이미지 편집에 최적화되어 있습니다. 썸네일 생성, 필터 적용, 텍스트 삽입\r
      같은 작업은 Pillow가 더 간단합니다. 얼굴 인식, 객체 추적 같은 작업은 OpenCV가 적합합니다.\r
  goal: 편집(Pillow) vs 분석(OpenCV)의 경계를 분명히 한다.\r
  why: 도구 선택을 미리 결정해두면 시간을 아낄 수 있습니다. 썸네일 생성·워터마크·텍스트 삽입은 Pillow 한 줄, 얼굴 인식·객체 검출은 OpenCV로 가는 게 자연스럽습니다.\r
- id: image_basics\r
  blocks:\r
  - type: sectionHeader\r
    title: 📦 이미지의 구조\r
    subtitle: 픽셀과 채널\r
  - type: text\r
    content: 디지털 이미지는 픽셀(pixel)의 격자입니다. 각 픽셀은 색상 값을 가지며, 이 값의 구성 방식을 색상 모드(mode)라고 합니다. RGB 모드는 빨강, 초록,\r
      파랑 세 채널로 색을 표현하고, L 모드는 밝기 하나로 흑백을 표현합니다.\r
  - type: table\r
    headers:\r
    - 모드\r
    - 채널 수\r
    - 설명\r
    - 용도\r
    rows:\r
    - - L\r
      - 1\r
      - 그레이스케일 (0-255)\r
      - 흑백 이미지\r
    - - RGB\r
      - 3\r
      - 빨강, 초록, 파랑\r
      - 일반 컬러 이미지\r
    - - RGBA\r
      - 4\r
      - RGB + 알파(투명도)\r
      - 투명 배경이 필요할 때\r
    - - CMYK\r
      - 4\r
      - 시안, 마젠타, 옐로, 블랙\r
      - 인쇄용\r
  - type: note\r
    title: 픽셀 좌표계\r
    content: Pillow에서 좌표 (0, 0)은 이미지의 왼쪽 상단입니다. x는 오른쪽으로, y는 아래쪽으로 증가합니다. (100, 50)은 왼쪽에서 100픽셀, 위에서 50픽셀\r
      떨어진 위치입니다.\r
  goal: mode가 채널 수를 결정하고, 좌표가 왼쪽 위 (0, 0) 기준이라는 두 가지 핵심 관습을 잡는다.\r
  why: mode를 모르면 split이 1개를 반환할지 3개를 반환할지 예측할 수 없고, 좌표 기준을 모르면 crop/paste 위치가 어긋납니다. 매 강의의 출발점입니다.\r
- id: features\r
  blocks:\r
  - type: sectionHeader\r
    title: 🛠️ Pillow 주요 기능\r
    subtitle: 이미지 처리의 모든 것\r
  - type: text\r
    content: Pillow가 제공하는 주요 기능을 살펴봅시다. 기본적인 열기/저장부터 고급 합성까지 다양한 작업을 지원합니다.\r
  - type: table\r
    headers:\r
    - 기능\r
    - 설명\r
    - 메서드/모듈\r
    rows:\r
    - - 열기/저장\r
      - 이미지 파일 읽기와 저장\r
      - Image.open(), save()\r
    - - 크기 조절\r
      - 리사이즈, 썸네일 생성\r
      - resize(), thumbnail()\r
    - - 자르기/회전\r
      - 영역 추출, 각도 회전\r
      - crop(), rotate(), transpose()\r
    - - 색상 변환\r
      - 모드 변경, 채널 분리\r
      - convert(), split(), merge()\r
    - - 필터 적용\r
      - 블러, 샤픈, 엣지 검출\r
      - ImageFilter\r
    - - 색상 조정\r
      - 밝기, 대비, 채도\r
      - ImageEnhance\r
    - - 그리기\r
      - 도형, 텍스트 삽입\r
      - ImageDraw\r
    - - 합성\r
      - 이미지 붙이기, 블렌딩\r
      - paste(), blend(), alpha_composite()\r
  goal: 트랙의 10개 강의에서 사용할 메서드를 한 표로 미리 본다.\r
  why: Pillow 메서드는 Image 객체에 직접 붙은 것(crop/resize/convert)과 별도 모듈로 분리된 것(ImageFilter/ImageEnhance/ImageDraw)이 섞여 있습니다. 분류를 알면 어디서 import할지 빨라집니다.\r
- id: imagefilter\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎭 ImageFilter\r
    subtitle: 다양한 필터 효과\r
  - type: text\r
    content: ImageFilter 모듈은 미리 정의된 필터들을 제공합니다. filter() 메서드에 전달하면 해당 효과가 적용된 새 이미지를 반환합니다.\r
  - type: table\r
    headers:\r
    - 필터\r
    - 효과\r
    rows:\r
    - - BLUR\r
      - 이미지를 부드럽게 흐리게\r
    - - SHARPEN\r
      - 경계를 선명하게\r
    - - CONTOUR\r
      - 윤곽선 추출\r
    - - EDGE_ENHANCE\r
      - 가장자리 강조\r
    - - EMBOSS\r
      - 양각 효과\r
    - - FIND_EDGES\r
      - 에지 검출\r
    - - SMOOTH\r
      - 노이즈 감소\r
  goal: 사전 정의 필터와 GaussianBlur/UnsharpMask 같은 매개변수 필터의 두 갈래를 미리 파악한다.\r
  why: image.filter(ImageFilter.BLUR)처럼 상수만 넘기는 형태와, ImageFilter.GaussianBlur(radius=2)처럼 인스턴스를 넘기는 형태가 섞여 있습니다. 04 강의에서 두 형태를 모두 다룹니다.\r
- id: imageenhance\r
  blocks:\r
  - type: sectionHeader\r
    title: ✨ ImageEnhance\r
    subtitle: 색상 조정\r
  - type: text\r
    content: ImageEnhance 모듈은 밝기, 대비, 색상, 선명도를 조절합니다. 각 조정기의 enhance() 메서드에 배율을 전달합니다. 1.0은 원본, 0.0은 최소,\r
      2.0은 두 배입니다.\r
  - type: table\r
    headers:\r
    - 조정기\r
    - 효과\r
    - 예시 (factor)\r
    rows:\r
    - - Brightness\r
      - 밝기 조절\r
      - 0.5=어둡게, 1.5=밝게\r
    - - Contrast\r
      - 대비 조절\r
      - 0.5=흐릿, 1.5=선명\r
    - - Color\r
      - 채도 조절\r
      - 0.0=흑백, 2.0=채도↑\r
    - - Sharpness\r
      - 선명도 조절\r
      - 0.0=블러, 2.0=샤픈\r
  goal: factor 1.0이 항상 원본이라는 공통 규약을 익히고 네 조정기를 한 묶음으로 본다.\r
  why: factor=1.0이 원본, 0.0이 최소, 2.0이 두 배라는 규약이 네 조정기 모두 동일합니다. 한 번 외우면 새 조정기를 만나도 즉시 사용법을 예측할 수 있습니다.\r
- id: imagedraw\r
  blocks:\r
  - type: sectionHeader\r
    title: ✏️ ImageDraw\r
    subtitle: 도형과 텍스트\r
  - type: text\r
    content: ImageDraw 모듈로 이미지 위에 도형과 텍스트를 그릴 수 있습니다. Draw 객체를 생성한 뒤 메서드를 호출하면 원본 이미지에 직접 그려집니다.\r
  - type: table\r
    headers:\r
    - 메서드\r
    - 기능\r
    - 주요 파라미터\r
    rows:\r
    - - line()\r
      - 선 그리기\r
      - xy, fill, width\r
    - - rectangle()\r
      - 사각형\r
      - xy, fill, outline\r
    - - ellipse()\r
      - 타원/원\r
      - xy, fill, outline\r
    - - polygon()\r
      - 다각형\r
      - xy, fill, outline\r
    - - text()\r
      - 텍스트\r
      - xy, text, fill, font\r
  goal: ImageDraw가 원본 이미지를 직접 변경한다는 사실(in-place)과 좌표 인자 규칙을 파악한다.\r
  why: filter나 enhance가 새 이미지를 반환하는 것과 달리, ImageDraw 메서드는 원본을 직접 수정합니다. 원본 보존이 필요하면 image.copy() 먼저 호출해야 합니다.\r
- id: comparison\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚖️ Pillow vs 다른 도구\r
    subtitle: 적재적소에 맞는 선택\r
  - type: table\r
    headers:\r
    - 도구\r
    - 특징\r
    - 적합한 용도\r
    rows:\r
    - - Pillow\r
      - 간단한 API, 정적 이미지\r
      - 썸네일, 필터, 텍스트 삽입\r
    - - OpenCV\r
      - 실시간 영상, 컴퓨터 비전\r
      - 얼굴 인식, 객체 추적\r
    - - scikit-image\r
      - 과학적 이미지 분석\r
      - 분할, 측정, 복원\r
    - - ImageMagick\r
      - 명령줄 도구, 일괄 처리\r
      - 대량 변환 자동화\r
  goal: 네 도구의 강점이 겹치지 않는다는 점을 표로 본다.\r
  why: 작업마다 자연스러운 도구가 다릅니다. 썸네일은 Pillow, 객체 검출은 OpenCV, 의료 영상 분할은 scikit-image, 수만 장 일괄 변환은 ImageMagick. 미리 알면 시행착오가 줄어듭니다.\r
- id: usecases\r
  blocks:\r
  - type: sectionHeader\r
    title: 💡 활용 분야\r
    subtitle: Pillow가 사용되는 곳\r
  - type: text\r
    content: Pillow는 다양한 분야에서 활용됩니다. 웹 서비스부터 데이터 과학까지 이미지를 다루는 거의 모든 곳에서 만날 수 있습니다.\r
  - type: table\r
    headers:\r
    - 분야\r
    - 활용 예시\r
    rows:\r
    - - 웹 개발\r
      - 업로드 이미지 리사이즈, 썸네일 생성, 워터마크\r
    - - 데이터 전처리\r
      - ML 모델용 이미지 정규화, 증강\r
    - - 자동화\r
      - 대량 이미지 변환, 포맷 통일\r
    - - 문서 처리\r
      - 스캔 이미지 보정, 텍스트 영역 추출\r
    - - 디자인\r
      - 배너 생성, 텍스트 오버레이\r
  goal: 학습한 메서드들이 어떤 실제 시스템에서 어떻게 결합되는지 그린다.\r
  why: 트랙을 마친 뒤 자기 프로젝트를 떠올릴 때 출발점이 됩니다. 웹 업로드 처리라면 open → resize → convert('RGB') → save 흐름이 자연스럽게 떠오릅니다.\r
- id: local_runtime_note\r
  blocks:\r
  - type: sectionHeader\r
    title: 📋 이미지 소스 안내\r
    subtitle: Codaro 로컬 Python 환경에서의 이미지\r
  - type: note\r
    title: 이미지 데이터 소스\r
    content: 이 커리큘럼은 Codaro 로컬 Python 환경에서 실행됩니다. 로컬 파일, 예제 이미지, URL 이미지를 모두 다룰 수 있으며, 재현성을 위해 일부 프로젝트에서는\r
      내장 이미지와 Image.new() 합성 이미지를 함께 사용합니다.\r
  goal: Image.new로 만든 합성 이미지가 학습용 표준 입력이라는 점을 짚는다.\r
  why: 합성 이미지는 정답(픽셀 값, 도형 위치)을 알고 있으므로 결과를 assert로 확정할 수 있습니다. 외부 이미지에 의존하면 변환 결과를 눈으로만 비교하게 됩니다.\r
- id: curriculum\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 커리큘럼\r
    subtitle: 10개 프로젝트로 마스터\r
  - type: text\r
    content: 이 커리큘럼에서는 실제 이미지를 활용한 10개의 프로젝트를 통해 Pillow를 배웁니다.\r
  - type: table\r
    headers:\r
    - 프로젝트\r
    - 데이터\r
    - 핵심 개념\r
    rows:\r
    - - 01. 꽃 사진 탐색기\r
      - sklearn flower\r
      - 이미지 열기, 정보, 썸네일\r
    - - 02. 중국 풍경 편집기\r
      - sklearn china\r
      - 자르기, 회전, 리사이즈\r
    - - 03. 흑백 사진 변환기\r
      - Lorem Picsum\r
      - 색상 모드, 픽셀 연산\r
    - - 04. 사진 필터 스튜디오\r
      - Lorem Picsum\r
      - ImageFilter 활용\r
    - - 05. 밝기/대비 조절기\r
      - sklearn china\r
      - ImageEnhance 활용\r
    - - 06. RGB 채널 분석기\r
      - Lorem Picsum\r
      - 채널 분리, 히스토그램\r
    - - 07. 워터마크 생성기\r
      - sklearn flower\r
      - ImageDraw, 투명도\r
    - - 08. 도형 아트 생성기\r
      - 합성 이미지\r
      - ImageDraw 도형\r
    - - 09. 포토 콜라주 메이커\r
      - Lorem Picsum\r
      - paste, 좌표 계산\r
    - - 10. 종합 이미지 에디터\r
      - 복합\r
      - 전체 개념 종합\r
  goal: 10개 강의가 열기 → 변형 → 모드 → 필터 → 조정 → 채널 → 합성 → 종합 순서로 쌓이는 흐름을 확인한다.\r
  why: 강의 순서는 의존성 그래프입니다. 03 mode 변환이 06 채널 분리의 기반, 07 워터마크가 09 콜라주의 알파 합성에 연결되며 모두 10 종합 프로젝트로 모입니다.\r
- id: start\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎯 시작하기\r
    subtitle: 첫 번째 프로젝트로\r
  - type: text\r
    content: Pillow를 배우면 파이썬으로 이미지를 자유롭게 다룰 수 있습니다. 썸네일 생성, 필터 적용, 워터마크 삽입 등 실용적인 작업을 코드 몇 줄로 해결할 수 있게\r
      됩니다. 첫 번째 프로젝트에서 sklearn의 꽃 이미지를 열어보며 Pillow의 기본을 익혀봅시다.\r
  goal: 다음 강의(01 꽃 사진 탐색기)로 자연스럽게 넘어갈 마음의 준비를 한다.\r
  why: 첫 번째 강의는 Image.open → mode/size → thumbnail → save 흐름부터 시작합니다. Pillow는 결국 Image 객체와 메서드 체이닝이라는 사실을 잡고 들어가야 이후 강의가 빨라집니다.\r
- id: workflow_validation\r
  title: 로컬 이미지 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 합성 이미지를 만들고 Pillow 메서드를 통과시킨 뒤 mode/size/픽셀 통계를 assert로 확정한다.\r
  why: Pillow 학습의 핵심은 메서드 결과를 눈으로만 보지 않고 mode/size/ImageStat로 검증하는 습관입니다. 합성 입력을 쓰면 회귀 테스트처럼 결과를 고정할 수 있습니다.\r
  explanation: |-\r
    Pillow 입문은 이미지를 열고 저장하는 문법보다, 이미지의 mode/size/픽셀 변화가 의도대로 유지되는지 확인하는 습관이 중요합니다. 이 트랙의 모든 강의는 합성 입력을 만들고, Pillow 메서드를 통과시킨 다음, mode/size/ImageStat/getpixel 같은 수치로 결과를 확정합니다.\r
\r
    예제에서는 160x100 흰 캔버스에 파란 사각형과 노란 원을 그리고, validateRgbImage 가드로 입력 계약(RGB + size > 0)을 확인합니다. 그다음 그레이스케일 변환에서 mode가 RGB → L로 바뀌고 채널 수가 줄어드는지, 썸네일에서 size가 줄어드는지를 assert로 확인합니다.\r
\r
    이 패턴은 다음 강의들에서 그대로 반복됩니다 - 입력 만들기 → Pillow 메서드 → assert로 결과 확정.\r
  tips:\r
  - 합성 이미지(Image.new + ImageDraw)는 정답을 알고 있어 회귀 테스트로 쓰기 좋습니다.\r
  - image.size는 (width, height)이고 NumPy로 변환하면 (height, width)로 바뀝니다. 순서가 반대인 점을 기억하세요.\r
  - convert는 새 Image를 반환하고, ImageDraw 메서드는 원본을 직접 수정합니다. 반환값이 있는지 매번 확인하세요.\r
  snippet: |-\r
    from PIL import Image, ImageDraw, ImageStat\r
\r
    introImage = Image.new("RGB", (160, 100), "white")\r
    introDraw = ImageDraw.Draw(introImage)\r
    introDraw.rectangle((20, 20, 140, 80), fill=(80, 140, 220), outline=(20, 60, 120), width=4)\r
    introDraw.ellipse((58, 28, 102, 72), fill=(240, 210, 80))\r
\r
    def validateRgbImage(image):\r
        if image.mode != "RGB":\r
            raise ValueError(f"RGB 이미지가 아닙니다: {image.mode}")\r
        if image.size[0] < 1 or image.size[1] < 1:\r
            raise ValueError(f"이미지 크기가 올바르지 않습니다: {image.size}")\r
        return True\r
\r
    validateRgbImage(introImage)\r
\r
    grayImage = introImage.convert("L")\r
    thumbImage = introImage.copy()\r
    thumbImage.thumbnail((80, 80))\r
\r
    assert grayImage.mode == "L", f"gray mode: {grayImage.mode}"\r
    assert grayImage.size == (160, 100), f"gray size: {grayImage.size}"\r
    assert thumbImage.size[0] <= 80 and thumbImage.size[1] <= 80, f"thumb size too large: {thumbImage.size}"\r
\r
    stat = ImageStat.Stat(grayImage)\r
    assert 0 <= stat.mean[0] <= 255, f"mean out of range: {stat.mean[0]}"\r
\r
    report = {\r
        "originalMode": introImage.mode,\r
        "originalSize": introImage.size,\r
        "grayMean": round(stat.mean[0], 2),\r
        "thumbSize": thumbImage.size,\r
    }\r
    report\r
  exercise:\r
    prompt: 사각형/원의 색이나 크기, thumbnail의 최대 크기를 바꾸고 grayMean과 thumbSize가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image, ImageDraw, ImageStat\r
\r
      introImage = Image.new("RGB", (160, 100), "white")\r
      introDraw = ImageDraw.Draw(introImage)\r
      introDraw.rectangle((20, 20, 140, 80), fill=(___, ___, ___), outline=(20, 60, 120), width=4)\r
      introDraw.ellipse((58, 28, 102, 72), fill=(240, 210, 80))\r
\r
      def validateRgbImage(image):\r
          if image.mode != "RGB":\r
              raise ValueError(f"RGB 이미지가 아닙니다: {image.mode}")\r
          if image.size[0] < 1 or image.size[1] < 1:\r
              raise ValueError(f"이미지 크기가 올바르지 않습니다: {image.size}")\r
          return True\r
\r
      validateRgbImage(introImage)\r
\r
      grayImage = introImage.convert("L")\r
      thumbImage = introImage.copy()\r
      thumbImage.thumbnail((___, ___))\r
\r
      stat = ImageStat.Stat(grayImage)\r
      assert 0 <= stat.mean[0] <= 255\r
\r
      report = {\r
          "grayMean": round(stat.mean[0], 2),\r
          "thumbSize": thumbImage.size,\r
      }\r
      report\r
    hints:\r
    - rectangle fill의 RGB 값을 더 어둡게(0 가까이) 바꾸면 grayMean이 낮아집니다.\r
    - thumbnail은 비율을 유지하므로 (40, 40)을 넘기면 짧은 변이 40에 맞춰 줄어듭니다.\r
  check:\r
    noError: 합성 이미지가 RGB 모드이고 convert/thumbnail이 정상 동작해야 합니다.\r
    resultCheck: grayMean이 0~255 범위 안이고, thumbnail 호출 후 size가 입력한 최대 크기를 넘지 않아야 합니다.\r
`;export{e as default};