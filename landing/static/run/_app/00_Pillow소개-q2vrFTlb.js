var e=`meta:
  packages:
  - pillow
  id: pillow_00
  title: Pillow소개
  order: 0
  category: pillow
  badge: 소개
  tags:
  - Pillow
  - PIL
  - 이미지처리
  - Image
  - 필터
  - 합성
  seo:
    title: Pillow 소개 - 파이썬 이미지 처리 라이브러리
    description: Pillow로 이미지를 열고, 편집하고, 저장하는 방법을 배웁니다. 크기 조절, 필터, 텍스트 삽입 등 이미지 처리의 기초를 익힙니다.
    keywords:
    - Pillow
    - PIL
    - 이미지처리
    - Python Image
    - 필터
    - 리사이즈
intro:
  direction: Pillow는 이미지를 Image 객체로 다루는 편집·합성 라이브러리입니다. 이 트랙은 mode/size/픽셀 통계를 매 단계 확인하면서 자르기·필터·합성·저장까지 검증하는 흐름을 배웁니다.
  benefits:
  - 이미지의 mode(L/RGB/RGBA)와 size(width, height)를 코드로 확인합니다.
  - crop/rotate/resize/convert가 무엇을 바꾸고 무엇을 그대로 두는지 픽셀로 검증합니다.
  - ImageFilter, ImageEnhance, ImageDraw 세 모듈의 역할 분담을 익힙니다.
  - 첫 실행 셀에서 mode, size, grayMean을 assert로 고정해 처리 흐름을 확인합니다.
  - paste의 mask 인자로 알파 합성이 어떻게 일어나는지 손으로 확인합니다.
  diagram:
    steps:
    - label: 합성 이미지로 입력 만들기
      detail: Image.new + ImageDraw로 정답을 알고 있는 입력을 만듭니다.
    - label: Pillow 메서드 실행
      detail: convert/resize/filter/paste 같은 핵심 메서드를 적용합니다.
    - label: 수치로 결과 검증
      detail: mode, size, ImageStat.mean, getpixel로 결과를 비교합니다.
    - label: 파이프라인 재사용
      detail: 검증된 처리 단계를 다음 강의에서 그대로 호출합니다.
    runtime:
    - label: 이미지 처리 환경
      detail: pillow 기준으로 로컬 Python 실행을 준비합니다.
    - label: Pillow 셀 실행
      detail: 셀을 실행해 mode, size, 픽셀 통계와 예외 상태를 확인합니다.
    - label: 다음 강의로 연결
      detail: 검증된 결과를 다음 이미지 처리 단계의 입력으로 넘깁니다.
sections:
- id: intro
  blocks:
  - type: mainHeader
    emoji: 🖼️
    title: Pillow
    subtitle: 파이썬 이미지 처리 라이브러리
  - type: hero
    emoji: 🎨
    title: 이미지를 코드로 다루다
    subtitle: 열기, 편집, 저장까지 한 번에
    points:
    - emoji: 📷
      title: 이미지 열기/저장
    - emoji: ✂️
      title: 자르기/회전
    - emoji: 🎭
      title: 필터/효과
    - emoji: ✏️
      title: 텍스트/도형
  goal: 트랙 전체에서 다룰 네 가지 축(열기·저장 / 변형 / 필터 / 그리기)을 한눈에 정리한다.
  why: Pillow는 메서드가 많아 처음에는 어느 메서드가 무엇을 하는지 흩어져 보입니다. 네 영역으로 묶어두면 작업에 맞는 메서드를 빠르게 찾을 수 있습니다.
- id: pillow_history
  blocks:
  - type: sectionHeader
    title: 🏛️ Pillow란?
    subtitle: PIL의 현대적 계승자
  - type: text
    content: Pillow는 PIL(Python Imaging Library)의 친화적인 포크(fork)입니다. 원본 PIL은 2009년 이후 업데이트가 중단되었지만, Pillow가
      이를 이어받아 현재까지 활발히 개발되고 있습니다. 파이썬에서 이미지를 다룰 때 가장 널리 사용되는 라이브러리이며, 설치도 간단하고 사용법도 직관적입니다.
  - type: featureCards
    cards:
    - emoji: 📂
      title: 다양한 포맷
      description: JPEG, PNG, GIF, BMP, TIFF 등 30개 이상의 이미지 포맷을 지원합니다
    - emoji: ⚡
      title: 간단한 API
      description: 직관적인 메서드로 복잡한 이미지 처리를 몇 줄로 해결합니다
    - emoji: 🔗
      title: NumPy 연동
      description: NumPy 배열과 상호 변환이 가능해 과학 계산과 연계됩니다
  goal: import PIL과 from PIL import Image가 왜 'PIL'이라는 이름을 그대로 쓰는지 이해한다.
  why: 패키지 이름은 pillow인데 import는 PIL인 비대칭이 헷갈리는 첫 지점입니다. 역사적 호환성을 알면 검색 결과의 PIL 코드와 최신 Pillow 코드가 같은 것임을 알 수 있습니다.
- id: why_pillow
  blocks:
  - type: sectionHeader
    title: 🚀 왜 Pillow인가?
    subtitle: 이미지 처리의 시작점
  - type: text
    content: 이미지는 본질적으로 픽셀의 2차원 배열입니다. Pillow는 이 픽셀 데이터에 쉽게 접근하고 조작할 수 있게 해줍니다. 웹 개발에서 썸네일 생성, 데이터 분석에서
      이미지 전처리, 자동화 스크립트에서 일괄 변환 등 다양한 곳에서 활용됩니다.
  - type: note
    title: OpenCV와의 차이
    content: OpenCV는 컴퓨터 비전과 실시간 영상 처리에 특화되어 있고, Pillow는 정적 이미지 편집에 최적화되어 있습니다. 썸네일 생성, 필터 적용, 텍스트 삽입
      같은 작업은 Pillow가 더 간단합니다. 얼굴 인식, 객체 추적 같은 작업은 OpenCV가 적합합니다.
  goal: 편집(Pillow) vs 분석(OpenCV)의 경계를 분명히 한다.
  why: 도구 선택을 미리 결정해두면 시간을 아낄 수 있습니다. 썸네일 생성·워터마크·텍스트 삽입은 Pillow 한 줄, 얼굴 인식·객체 검출은 OpenCV로 가는 게 자연스럽습니다.
- id: image_basics
  blocks:
  - type: sectionHeader
    title: 📦 이미지의 구조
    subtitle: 픽셀과 채널
  - type: text
    content: 디지털 이미지는 픽셀(pixel)의 격자입니다. 각 픽셀은 색상 값을 가지며, 이 값의 구성 방식을 색상 모드(mode)라고 합니다. RGB 모드는 빨강, 초록,
      파랑 세 채널로 색을 표현하고, L 모드는 밝기 하나로 흑백을 표현합니다.
  - type: table
    headers:
    - 모드
    - 채널 수
    - 설명
    - 용도
    rows:
    - - L
      - 1
      - 그레이스케일 (0-255)
      - 흑백 이미지
    - - RGB
      - 3
      - 빨강, 초록, 파랑
      - 일반 컬러 이미지
    - - RGBA
      - 4
      - RGB + 알파(투명도)
      - 투명 배경이 필요할 때
    - - CMYK
      - 4
      - 시안, 마젠타, 옐로, 블랙
      - 인쇄용
  - type: note
    title: 픽셀 좌표계
    content: Pillow에서 좌표 (0, 0)은 이미지의 왼쪽 상단입니다. x는 오른쪽으로, y는 아래쪽으로 증가합니다. (100, 50)은 왼쪽에서 100픽셀, 위에서 50픽셀
      떨어진 위치입니다.
  goal: mode가 채널 수를 결정하고, 좌표가 왼쪽 위 (0, 0) 기준이라는 두 가지 핵심 관습을 잡는다.
  why: mode를 모르면 split이 1개를 반환할지 3개를 반환할지 예측할 수 없고, 좌표 기준을 모르면 crop/paste 위치가 어긋납니다. 매 강의의 출발점입니다.
- id: features
  blocks:
  - type: sectionHeader
    title: 🛠️ Pillow 주요 기능
    subtitle: 이미지 처리의 모든 것
  - type: text
    content: Pillow가 제공하는 주요 기능을 살펴봅시다. 기본적인 열기/저장부터 고급 합성까지 다양한 작업을 지원합니다.
  - type: table
    headers:
    - 기능
    - 설명
    - 메서드/모듈
    rows:
    - - 열기/저장
      - 이미지 파일 읽기와 저장
      - Image.open(), save()
    - - 크기 조절
      - 리사이즈, 썸네일 생성
      - resize(), thumbnail()
    - - 자르기/회전
      - 영역 추출, 각도 회전
      - crop(), rotate(), transpose()
    - - 색상 변환
      - 모드 변경, 채널 분리
      - convert(), split(), merge()
    - - 필터 적용
      - 블러, 샤픈, 엣지 검출
      - ImageFilter
    - - 색상 조정
      - 밝기, 대비, 채도
      - ImageEnhance
    - - 그리기
      - 도형, 텍스트 삽입
      - ImageDraw
    - - 합성
      - 이미지 붙이기, 블렌딩
      - paste(), blend(), alpha_composite()
  goal: 트랙의 10개 강의에서 사용할 메서드를 한 표로 미리 본다.
  why: Pillow 메서드는 Image 객체에 직접 붙은 것(crop/resize/convert)과 별도 모듈로 분리된 것(ImageFilter/ImageEnhance/ImageDraw)이 섞여 있습니다. 분류를 알면 어디서 import할지 빨라집니다.
- id: imagefilter
  blocks:
  - type: sectionHeader
    title: 🎭 ImageFilter
    subtitle: 다양한 필터 효과
  - type: text
    content: ImageFilter 모듈은 미리 정의된 필터들을 제공합니다. filter() 메서드에 전달하면 해당 효과가 적용된 새 이미지를 반환합니다.
  - type: table
    headers:
    - 필터
    - 효과
    rows:
    - - BLUR
      - 이미지를 부드럽게 흐리게
    - - SHARPEN
      - 경계를 선명하게
    - - CONTOUR
      - 윤곽선 추출
    - - EDGE_ENHANCE
      - 가장자리 강조
    - - EMBOSS
      - 양각 효과
    - - FIND_EDGES
      - 에지 검출
    - - SMOOTH
      - 노이즈 감소
  goal: 사전 정의 필터와 GaussianBlur/UnsharpMask 같은 매개변수 필터의 두 갈래를 미리 파악한다.
  why: image.filter(ImageFilter.BLUR)처럼 상수만 넘기는 형태와, ImageFilter.GaussianBlur(radius=2)처럼 인스턴스를 넘기는 형태가 섞여 있습니다. 04 강의에서 두 형태를 모두 다룹니다.
- id: imageenhance
  blocks:
  - type: sectionHeader
    title: ✨ ImageEnhance
    subtitle: 색상 조정
  - type: text
    content: ImageEnhance 모듈은 밝기, 대비, 색상, 선명도를 조절합니다. 각 조정기의 enhance() 메서드에 배율을 전달합니다. 1.0은 원본, 0.0은 최소,
      2.0은 두 배입니다.
  - type: table
    headers:
    - 조정기
    - 효과
    - 예시 (factor)
    rows:
    - - Brightness
      - 밝기 조절
      - 0.5=어둡게, 1.5=밝게
    - - Contrast
      - 대비 조절
      - 0.5=흐릿, 1.5=선명
    - - Color
      - 채도 조절
      - 0.0=흑백, 2.0=채도↑
    - - Sharpness
      - 선명도 조절
      - 0.0=블러, 2.0=샤픈
  goal: factor 1.0이 항상 원본이라는 공통 규약을 익히고 네 조정기를 한 묶음으로 본다.
  why: factor=1.0이 원본, 0.0이 최소, 2.0이 두 배라는 규약이 네 조정기 모두 동일합니다. 한 번 외우면 새 조정기를 만나도 즉시 사용법을 예측할 수 있습니다.
- id: imagedraw
  blocks:
  - type: sectionHeader
    title: ✏️ ImageDraw
    subtitle: 도형과 텍스트
  - type: text
    content: ImageDraw 모듈로 이미지 위에 도형과 텍스트를 그릴 수 있습니다. Draw 객체를 생성한 뒤 메서드를 호출하면 원본 이미지에 직접 그려집니다.
  - type: table
    headers:
    - 메서드
    - 기능
    - 주요 파라미터
    rows:
    - - line()
      - 선 그리기
      - xy, fill, width
    - - rectangle()
      - 사각형
      - xy, fill, outline
    - - ellipse()
      - 타원/원
      - xy, fill, outline
    - - polygon()
      - 다각형
      - xy, fill, outline
    - - text()
      - 텍스트
      - xy, text, fill, font
  goal: ImageDraw가 원본 이미지를 직접 변경한다는 사실(in-place)과 좌표 인자 규칙을 파악한다.
  why: filter나 enhance가 새 이미지를 반환하는 것과 달리, ImageDraw 메서드는 원본을 직접 수정합니다. 원본 보존이 필요하면 image.copy() 먼저 호출해야 합니다.
- id: comparison
  blocks:
  - type: sectionHeader
    title: ⚖️ Pillow vs 다른 도구
    subtitle: 적재적소에 맞는 선택
  - type: table
    headers:
    - 도구
    - 특징
    - 적합한 용도
    rows:
    - - Pillow
      - 간단한 API, 정적 이미지
      - 썸네일, 필터, 텍스트 삽입
    - - OpenCV
      - 실시간 영상, 컴퓨터 비전
      - 얼굴 인식, 객체 추적
    - - scikit-image
      - 과학적 이미지 분석
      - 분할, 측정, 복원
    - - ImageMagick
      - 명령줄 도구, 일괄 처리
      - 대량 변환 자동화
  goal: 네 도구의 강점이 겹치지 않는다는 점을 표로 본다.
  why: 작업마다 자연스러운 도구가 다릅니다. 썸네일은 Pillow, 객체 검출은 OpenCV, 의료 영상 분할은 scikit-image, 수만 장 일괄 변환은 ImageMagick. 미리 알면 시행착오가 줄어듭니다.
- id: usecases
  blocks:
  - type: sectionHeader
    title: 💡 활용 분야
    subtitle: Pillow가 사용되는 곳
  - type: text
    content: Pillow는 다양한 분야에서 활용됩니다. 웹 서비스부터 데이터 과학까지 이미지를 다루는 거의 모든 곳에서 만날 수 있습니다.
  - type: table
    headers:
    - 분야
    - 활용 예시
    rows:
    - - 웹 개발
      - 업로드 이미지 리사이즈, 썸네일 생성, 워터마크
    - - 데이터 전처리
      - ML 모델용 이미지 정규화, 증강
    - - 자동화
      - 대량 이미지 변환, 포맷 통일
    - - 문서 처리
      - 스캔 이미지 보정, 텍스트 영역 추출
    - - 디자인
      - 배너 생성, 텍스트 오버레이
  goal: 학습한 메서드들이 어떤 실제 시스템에서 어떻게 결합되는지 그린다.
  why: 트랙을 마친 뒤 자기 프로젝트를 떠올릴 때 출발점이 됩니다. 웹 업로드 처리라면 open → resize → convert('RGB') → save 흐름이 자연스럽게 떠오릅니다.
- id: local_runtime_note
  blocks:
  - type: sectionHeader
    title: 📋 이미지 소스 안내
    subtitle: Codaro 로컬 Python 환경에서의 이미지
  - type: note
    title: 이미지 데이터 소스
    content: 이 커리큘럼은 Codaro 로컬 Python 환경에서 실행됩니다. 로컬 파일, 예제 이미지, URL 이미지를 모두 다룰 수 있으며, 재현성을 위해 일부 프로젝트에서는
      내장 이미지와 Image.new() 합성 이미지를 함께 사용합니다.
  goal: Image.new로 만든 합성 이미지가 학습용 표준 입력이라는 점을 짚는다.
  why: 합성 이미지는 정답(픽셀 값, 도형 위치)을 알고 있으므로 결과를 assert로 확정할 수 있습니다. 외부 이미지에 의존하면 변환 결과를 눈으로만 비교하게 됩니다.
- id: curriculum
  blocks:
  - type: sectionHeader
    title: 📚 커리큘럼
    subtitle: 10개 프로젝트로 마스터
  - type: text
    content: 이 커리큘럼에서는 실제 이미지를 활용한 10개의 프로젝트를 통해 Pillow를 배웁니다.
  - type: table
    headers:
    - 프로젝트
    - 데이터
    - 핵심 개념
    rows:
    - - 01. 꽃 사진 탐색기
      - sklearn flower
      - 이미지 열기, 정보, 썸네일
    - - 02. 중국 풍경 편집기
      - sklearn china
      - 자르기, 회전, 리사이즈
    - - 03. 흑백 사진 변환기
      - Lorem Picsum
      - 색상 모드, 픽셀 연산
    - - 04. 사진 필터 스튜디오
      - Lorem Picsum
      - ImageFilter 활용
    - - 05. 밝기/대비 조절기
      - sklearn china
      - ImageEnhance 활용
    - - 06. RGB 채널 분석기
      - Lorem Picsum
      - 채널 분리, 히스토그램
    - - 07. 워터마크 생성기
      - sklearn flower
      - ImageDraw, 투명도
    - - 08. 도형 아트 생성기
      - 합성 이미지
      - ImageDraw 도형
    - - 09. 포토 콜라주 메이커
      - Lorem Picsum
      - paste, 좌표 계산
    - - 10. 종합 이미지 에디터
      - 복합
      - 전체 개념 종합
  goal: 10개 강의가 열기 → 변형 → 모드 → 필터 → 조정 → 채널 → 합성 → 종합 순서로 쌓이는 흐름을 확인한다.
  why: 강의 순서는 의존성 그래프입니다. 03 mode 변환이 06 채널 분리의 기반, 07 워터마크가 09 콜라주의 알파 합성에 연결되며 모두 10 종합 프로젝트로 모입니다.
- id: start
  blocks:
  - type: sectionHeader
    title: 🎯 시작하기
    subtitle: 첫 번째 프로젝트로
  - type: text
    content: Pillow를 배우면 파이썬으로 이미지를 자유롭게 다룰 수 있습니다. 썸네일 생성, 필터 적용, 워터마크 삽입 등 실용적인 작업을 코드 몇 줄로 해결할 수 있게
      됩니다. 첫 번째 프로젝트에서 sklearn의 꽃 이미지를 열어보며 Pillow의 기본을 익혀봅시다.
  goal: 다음 강의(01 꽃 사진 탐색기)로 자연스럽게 넘어갈 마음의 준비를 한다.
  why: 첫 번째 강의는 Image.open → mode/size → thumbnail → save 흐름부터 시작합니다. Pillow는 결국 Image 객체와 메서드 체이닝이라는 사실을 잡고 들어가야 이후 강의가 빨라집니다.
- id: workflow_validation
  title: 로컬 이미지 검증 루프
  structuredPrimary: true
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주
  goal: 합성 이미지를 만들고 Pillow 메서드를 통과시킨 뒤 mode/size/픽셀 통계를 assert로 확정한다.
  why: Pillow 학습의 핵심은 메서드 결과를 눈으로만 보지 않고 mode/size/ImageStat로 검증하는 습관입니다. 합성 입력을 쓰면 회귀 테스트처럼 결과를 고정할 수 있습니다.
  explanation: |-
    Pillow 입문은 이미지를 열고 저장하는 문법보다, 이미지의 mode/size/픽셀 변화가 의도대로 유지되는지 확인하는 습관이 중요합니다. 이 트랙의 모든 강의는 합성 입력을 만들고, Pillow 메서드를 통과시킨 다음, mode/size/ImageStat/getpixel 같은 수치로 결과를 확정합니다.

    예제에서는 160x100 흰 캔버스에 파란 사각형과 노란 원을 그리고, validateRgbImage 가드로 입력 계약(RGB + size > 0)을 확인합니다. 그다음 그레이스케일 변환에서 mode가 RGB → L로 바뀌고 채널 수가 줄어드는지, 썸네일에서 size가 줄어드는지를 assert로 확인합니다.

    이 패턴은 다음 강의들에서 그대로 반복됩니다 - 입력 만들기 → Pillow 메서드 → assert로 결과 확정.
  tips:
  - 합성 이미지(Image.new + ImageDraw)는 정답을 알고 있어 회귀 테스트로 쓰기 좋습니다.
  - image.size는 (width, height)이고 NumPy로 변환하면 (height, width)로 바뀝니다. 순서가 반대인 점을 기억하세요.
  - convert는 새 Image를 반환하고, ImageDraw 메서드는 원본을 직접 수정합니다. 반환값이 있는지 매번 확인하세요.
  snippet: |-
    from PIL import Image, ImageDraw, ImageStat

    introImage = Image.new("RGB", (160, 100), "white")
    introDraw = ImageDraw.Draw(introImage)
    introDraw.rectangle((20, 20, 140, 80), fill=(80, 140, 220), outline=(20, 60, 120), width=4)
    introDraw.ellipse((58, 28, 102, 72), fill=(240, 210, 80))

    def validateRgbImage(image):
        if image.mode != "RGB":
            raise ValueError(f"RGB 이미지가 아닙니다: {image.mode}")
        if image.size[0] < 1 or image.size[1] < 1:
            raise ValueError(f"이미지 크기가 올바르지 않습니다: {image.size}")
        return True

    validateRgbImage(introImage)

    grayImage = introImage.convert("L")
    thumbImage = introImage.copy()
    thumbImage.thumbnail((80, 80))

    assert grayImage.mode == "L", f"gray mode: {grayImage.mode}"
    assert grayImage.size == (160, 100), f"gray size: {grayImage.size}"
    assert thumbImage.size[0] <= 80 and thumbImage.size[1] <= 80, f"thumb size too large: {thumbImage.size}"

    stat = ImageStat.Stat(grayImage)
    assert 0 <= stat.mean[0] <= 255, f"mean out of range: {stat.mean[0]}"

    report = {
        "originalMode": introImage.mode,
        "originalSize": introImage.size,
        "grayMean": round(stat.mean[0], 2),
        "thumbSize": thumbImage.size,
    }
    report
  exercise:
    prompt: 사각형/원의 색이나 크기, thumbnail의 최대 크기를 바꾸고 grayMean과 thumbSize가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      from PIL import Image, ImageDraw, ImageStat

      introImage = Image.new("RGB", (160, 100), "white")
      introDraw = ImageDraw.Draw(introImage)
      introDraw.rectangle((20, 20, 140, 80), fill=(___, ___, ___), outline=(20, 60, 120), width=4)
      introDraw.ellipse((58, 28, 102, 72), fill=(240, 210, 80))

      def validateRgbImage(image):
          if image.mode != "RGB":
              raise ValueError(f"RGB 이미지가 아닙니다: {image.mode}")
          if image.size[0] < 1 or image.size[1] < 1:
              raise ValueError(f"이미지 크기가 올바르지 않습니다: {image.size}")
          return True

      validateRgbImage(introImage)

      grayImage = introImage.convert("L")
      thumbImage = introImage.copy()
      thumbImage.thumbnail((___, ___))

      stat = ImageStat.Stat(grayImage)
      assert 0 <= stat.mean[0] <= 255

      report = {
          "grayMean": round(stat.mean[0], 2),
          "thumbSize": thumbImage.size,
      }
      report
    hints:
    - rectangle fill의 RGB 값을 더 어둡게(0 가까이) 바꾸면 grayMean이 낮아집니다.
    - thumbnail은 비율을 유지하므로 (40, 40)을 넘기면 짧은 변이 40에 맞춰 줄어듭니다.
  check:
    noError: 합성 이미지가 RGB 모드이고 convert/thumbnail이 정상 동작해야 합니다.
    resultCheck: grayMean이 0~255 범위 안이고, thumbnail 호출 후 size가 입력한 최대 크기를 넘지 않아야 합니다.
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
  - id: pillow_00-pillow_runtime-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - intro
    - workflow_validation
    title: Pillow 이미지 artifact 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: format·mode·decompression budget를 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_pillow_runtime_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_pillow_runtime_contract(value):
            raise NotImplementedError
      solution: |
        def audit_pillow_runtime_contract(value):
            required = ['format', 'mode', 'maxPixels']
            rules = [{'id': 'format', 'field': 'format', 'kind': 'enum', 'values': ['JPEG', 'PNG', 'WEBP']}, {'id': 'mode', 'field': 'mode', 'kind': 'enum', 'values': ['L', 'RGB', 'RGBA']}, {'id': 'pixel-budget', 'field': 'maxPixels', 'kind': 'range', 'min': 1, 'max': 100000000}]
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
            return {"accepted": not missing and not violations, "topic": 'pillow_runtime', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.pillow.pillow_00.pillow_runtime-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_00.pillow_runtime-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_pillow_runtime_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              format: PNG
              mode: RGBA
              maxPixels: 20000000
          expectedReturn:
            accepted: true
            topic: pillow_runtime
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              mode: RGBA
              maxPixels: 20000000
          expectedReturn:
            accepted: false
            topic: pillow_runtime
            missing:
            - format
            violations:
            - format
        - id: reports-topic-invariants
          arguments:
          - value:
              format: TIFF
              mode: CMYK
              maxPixels: 0
          expectedReturn:
            accepted: false
            topic: pillow_runtime
            missing: []
            violations:
            - format
            - mode
            - pixel-budget
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pillow_00-pillow_runtime-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_00-pillow_runtime-contract-audit-mastery
    title: Pillow 이미지 artifact 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_pillow_runtime_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_pillow_runtime_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_pillow_runtime_result(expected, observed):
            identity = ['sourceHash', 'format']
            metrics = {'decodedPixels': 0}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'pillow_runtime', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.pillow.pillow_00.pillow_runtime-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_00.pillow_runtime-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_pillow_runtime_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: p0
              format: PNG
              decodedPixels: 1000000
          - value:
              sourceHash: p0
              format: PNG
              decodedPixels: 1000000
          expectedReturn:
            passed: true
            topic: pillow_runtime
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: p0
              format: PNG
              decodedPixels: 1000000
          - value:
              sourceHash: p1
              format: JPEG
              decodedPixels: 120000000
          expectedReturn:
            passed: false
            topic: pillow_runtime
            missing: []
            identityMismatch:
            - format
            - sourceHash
            metricDrift:
            - decodedPixels
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: p0
              format: PNG
              decodedPixels: 1000000
          - value: {}
          expectedReturn:
            passed: false
            topic: pillow_runtime
            missing:
            - decodedPixels
            - format
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pillow_00-pillow_runtime-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_00-pillow_runtime-result-reconciliation-transfer
    title: Pillow 이미지 artifact 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_pillow_runtime_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_pillow_runtime_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_pillow_runtime_evidence(stage):
            stages = {'source': {'action': 'admit Pillow source', 'evidence': 'format mode pixel budget', 'risk': 'unsafe or misread image'}, 'edit': {'action': 'apply bounded Pillow edit', 'evidence': 'decode and save trace', 'risk': 'quality or geometry loss'}, 'artifact': {'action': 'reopen Pillow artifact', 'evidence': 'reopened size mode hash', 'risk': 'corrupt or visually wrong output'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.pillow.pillow_00.pillow_runtime-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_00.pillow_runtime-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_pillow_runtime_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: admit Pillow source
            evidence: format mode pixel budget
            risk: unsafe or misread image
        - id: recalls-edit
          arguments:
          - value: edit
          expectedReturn:
            action: apply bounded Pillow edit
            evidence: decode and save trace
            risk: quality or geometry loss
        - id: recalls-artifact
          arguments:
          - value: artifact
          expectedReturn:
            action: reopen Pillow artifact
            evidence: reopened size mode hash
            risk: corrupt or visually wrong output
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};