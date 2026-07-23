var e=`meta:
  packages:
  - numpy
  - pillow
  - scikit-learn
  id: pillow_02
  title: 중국풍경편집기
  order: 2
  category: pillow
  difficulty: ⭐
  badge: 입문
  tags:
  - Pillow
  - crop
  - rotate
  - transpose
  - resize
  seo:
    title: Pillow 입문 - 중국 풍경 편집기
    description: Pillow의 crop/rotate/transpose로 이미지를 정확히 자르고 회전·뒤집기하는 편집 기본을 다룹니다.
    keywords:
    - Pillow
    - crop
    - rotate
    - transpose
    - 이미지편집
    - 회전
intro:
  emoji: 🏯
  goal: china 사진에 crop/rotate/transpose 세 편집 메서드를 적용해 좌표 계약, 회전 후 크기 변화, 정확 변환 vs 임의 각도 회전의 차이를 정량 비교합니다.
  description: Pillow의 편집 메서드는 모두 새 Image를 돌려줍니다. 메서드 체이닝이 자연스럽고, 좌표 계약과 expand 인자의 차이가 핵심 학습 포인트입니다.
  direction: crop의 (left, upper, right, lower) 4-tuple → rotate의 expand 효과 → transpose 90° 정확 변환 → 체이닝 흐름.
  benefits:
  - crop의 box 좌표가 (left, upper, right, lower)인 게 (x1, y1, x2, y2) ndarray 슬라이스와 어떻게 대응되는지 확인합니다.
  - rotate(angle, expand=True)와 expand=False의 결과 size를 비교합니다.
  - transpose의 90도 단위 변환이 모서리 손실 없이 정확함을 검증합니다.
  - 메서드 체이닝으로 crop→rotate→resize 한 줄 흐름을 작성합니다.
  diagram:
    steps:
    - label: china 로드
      detail: load_sample_image → Image.fromarray로 chinaImage를 만듭니다.
    - label: crop으로 영역 추출
      detail: (left, upper, right, lower) 좌표로 가운데 영역을 자르고 size 확인.
    - label: rotate로 임의 각도
      detail: rotate(15)과 rotate(15, expand=True)의 결과 size 비교.
    - label: transpose로 정확 변환
      detail: FLIP_LEFT_RIGHT, ROTATE_90 등 정확 변환의 size 보존 확인.
    - label: 메서드 체이닝
      detail: crop → rotate(expand=True) → resize 한 줄로 한 객체에 묶기.
    runtime:
    - label: pillow 패키지
      detail: meta.packages의 pillow가 가상환경에 있어야 from PIL import Image가 통과합니다.
    - label: 단일 노트북 변수
      detail: 첫 셀에서 chinaImage를 만들고 이후 모든 셀이 그대로 참조.
    - label: 메서드는 새 객체
      detail: crop/rotate/transpose 모두 새 Image를 돌려줘 메서드 체이닝이 안전.
sections:
- id: step1_load
  title: 1단계. china 로드와 size 점검
  structuredPrimary: true
  subtitle: chinaImage 만들기
  goal: china.jpg ndarray를 Image.fromarray로 Pillow Image로 만들고 size가 (640, 427)인지 확인합니다.
  why: 이후 모든 편집 셀이 chinaImage 한 객체를 입력으로 씁니다. 첫 셀에서 size와 mode를 정확히 잡아 두면 다음 셀들의 좌표 계산이 자연스러워집니다.
  explanation: |-
    sklearn china.jpg는 (427, 640, 3) RGB ndarray입니다. Pillow Image로 변환하면 size는 (640, 427) (width, height) 순서입니다.
    이 강의의 모든 좌표는 (width, height) 또는 (x, y) 컨벤션을 따릅니다. NumPy의 (row, col) 또는 (y, x)와 다른 점에 항상 주의합니다.
  tips:
  - china 샘플의 가로:세로 비율은 약 1.5:1입니다.
  - "Pillow size는 (width, height) 순서로 ndarray.shape (height, width, channels)와 정반대입니다."
  snippet: |-
    from PIL import Image
    from sklearn.datasets import load_sample_image

    chinaImage = Image.fromarray(load_sample_image('china.jpg'))

    {
        'size': chinaImage.size,
        'width': chinaImage.size[0],
        'height': chinaImage.size[1],
        'mode': chinaImage.mode,
        'aspectRatio': round(chinaImage.size[0] / chinaImage.size[1], 2),
    }
  exercise:
    prompt: chinaImage의 가로:세로 비율이 1.4~1.6 범위 안에 있는지 한 줄에 확인하세요.
    starterCode: |-
      from PIL import Image
      from sklearn.datasets import load_sample_image

      ratioImage = Image.fromarray(load_sample_image('china.jpg'))
      ratio = ratioImage.size[0] / ratioImage.size[1]
      {'ratio': round(ratio, 2), 'isLandscape': 1.4 <= ratio <= ___}
    hints:
    - 상한 1.6에 들어가는지 확인합니다.
    - 빈칸에는 1.6이 들어갑니다.
    check:
      noError: Image.fromarray가 끝나야 합니다.
      resultCheck: isLandscape가 True여야 합니다.
  check:
    noError: load_sample_image와 Image.fromarray가 끝나야 합니다.
    resultCheck: size가 (640, 427), mode가 'RGB', aspectRatio가 약 1.5여야 합니다.
- id: step2_crop
  title: 2단계. crop으로 가운데 영역
  structuredPrimary: true
  subtitle: (left, upper, right, lower) 좌표
  goal: chinaImage의 가운데 절반 영역을 crop으로 잘라내고, 결과 size가 (320, 214)인지 확인합니다.
  why: crop의 4-tuple은 NumPy 슬라이스와 비슷하지만 인자 순서가 다릅니다. 좌상단 (left, upper)과 우하단 (right, lower)을 직접 계산해 한 번 만들어 두면 좌표 계약이 머리에 들어옵니다.
  explanation: |-
    Image.crop(box)에서 box는 (left, upper, right, lower) 4-tuple입니다. left/right는 x, upper/lower는 y에 해당합니다.
    NumPy 슬라이스 image[upper:lower, left:right]와 같은 영역을 잡습니다. y 인덱스가 먼저 오는 NumPy 컨벤션과 좌표 순서가 다르다는 점이 함정입니다.
    가운데 절반은 width의 1/4부터 3/4까지, height의 1/4부터 3/4까지로 잡습니다. (640, 427) 입력이면 정수 나눗셈 기준 box가 (160, 106, 480, 320)이 되고, 잘라낸 결과는 (320, 214)입니다.
  tips:
  - right와 lower는 포함되지 않는 경계입니다. NumPy 슬라이스와 같은 방식입니다.
  - box 좌표가 이미지 밖이면 빈 영역이 검정으로 채워집니다(예외는 아닙니다). 미리 검증이 필요합니다.
  snippet: |-
    from PIL import Image
    from sklearn.datasets import load_sample_image

    cropImage = Image.fromarray(load_sample_image('china.jpg'))
    cropWidth, cropHeight = cropImage.size
    cropBox = (cropWidth // 4, cropHeight // 4, cropWidth * 3 // 4, cropHeight * 3 // 4)
    cropped = cropImage.crop(cropBox)

    {
        'originalSize': cropImage.size,
        'cropBox': cropBox,
        'croppedSize': cropped.size,
        'matchesHalfQuarter': cropped.size == (320, 214),
    }
  exercise:
    prompt: chinaImage에서 오른쪽 절반만 잘라내는 box를 만들고 결과 size가 (320, 427)인지 확인하세요.
    starterCode: |-
      from PIL import Image
      from sklearn.datasets import load_sample_image

      rightImage = Image.fromarray(load_sample_image('china.jpg'))
      rightWidth, rightHeight = rightImage.size
      rightBox = (rightWidth // ___, 0, rightWidth, rightHeight)
      rightHalf = rightImage.crop(rightBox)

      {'rightSize': rightHalf.size, 'isRightHalf': rightHalf.size == (320, 427)}
    hints:
    - "오른쪽 절반은 width//2부터 시작합니다."
    - 빈칸에는 2가 들어갑니다.
    check:
      noError: crop 호출이 끝나야 합니다.
      resultCheck: isRightHalf가 True여야 합니다.
  check:
    noError: crop 호출과 dict 구성이 끝나야 합니다.
    resultCheck: croppedSize가 약 (320, 213)이고 matchesHalfQuarter가 True여야 합니다.
- id: step3_rotate
  title: 3단계. rotate와 expand
  structuredPrimary: true
  subtitle: 임의 각도 회전의 두 모드
  goal: chinaImage에 rotate(15)과 rotate(15, expand=True)를 각각 적용해 두 결과의 size 차이를 확인합니다.
  why: rotate는 시계 반대 방향 회전입니다. expand 인자에 따라 결과 size가 크게 다르므로, 한 번 비교해 두지 않으면 회전 후 모서리가 잘리는 사고가 자주 납니다.
  explanation: |-
    Image.rotate(angle)는 기본적으로 원본 size를 유지합니다. 회전 후 이미지의 모서리가 원본 박스 밖으로 나가면 잘려서 사라집니다. 빈 영역은 기본 검정으로 채워집니다.
    Image.rotate(angle, expand=True)는 회전된 이미지 전체가 들어가도록 캔버스를 자동으로 키웁니다. 결과 size가 원본보다 커집니다. 모서리 잘림이 없습니다.
    실무에서는 expand=True가 거의 항상 안전한 기본값입니다. expand=False는 회전 각도가 작거나 정확한 크기 보존이 필요할 때만 씁니다.
  tips:
  - angle은 도 단위입니다. 90은 시계 반대 방향 90도 회전입니다.
  - fillcolor 인자로 빈 영역의 색을 지정할 수 있습니다. fillcolor=(255, 255, 255)는 흰색 배경.
  snippet: |-
    from PIL import Image
    from sklearn.datasets import load_sample_image

    rotateImage = Image.fromarray(load_sample_image('china.jpg'))
    rotated15 = rotateImage.rotate(15)
    rotated15Expand = rotateImage.rotate(15, expand=True)

    {
        'originalSize': rotateImage.size,
        'rotatedFixedSize': rotated15.size,
        'rotatedExpandSize': rotated15Expand.size,
        'fixedKeepsSize': rotated15.size == rotateImage.size,
        'expandGrowsSize': rotated15Expand.size[0] > rotateImage.size[0],
    }
  exercise:
    prompt: rotate(90, expand=True)를 적용해 결과 size가 (427, 640)이 되는지 확인하세요. (가로세로가 정확히 뒤집힙니다)
    starterCode: |-
      from PIL import Image
      from sklearn.datasets import load_sample_image

      ninetyImage = Image.fromarray(load_sample_image('china.jpg'))
      ninetyRotated = ninetyImage.rotate(90, expand=___)
      {'size': ninetyRotated.size, 'isSwapped': ninetyRotated.size == (427, 640)}
    hints:
    - expand 인자에는 True가 들어갑니다.
    - 빈칸에는 True가 들어갑니다.
    check:
      noError: rotate 호출이 끝나야 합니다.
      resultCheck: isSwapped가 True여야 합니다.
  check:
    noError: rotate 두 호출이 끝나야 합니다.
    resultCheck: fixedKeepsSize가 True이고 expandGrowsSize가 True여야 합니다.
- id: step4_transpose
  title: 4단계. transpose로 정확 변환
  structuredPrimary: true
  subtitle: 90/180/270 + FLIP
  goal: chinaImage에 transpose의 FLIP_LEFT_RIGHT, ROTATE_90, ROTATE_180을 적용해 각각의 size 변화를 확인합니다.
  why: transpose는 90° 단위 회전과 좌우/상하 반전에 특화된 메서드입니다. rotate(90)와 다르게 모서리 잘림이 전혀 없고, 결과 size가 항상 정확합니다.
  explanation: |-
    Image.transpose(method)는 미리 정의된 정확 변환을 적용합니다. 사용 가능한 method는 FLIP_LEFT_RIGHT, FLIP_TOP_BOTTOM, ROTATE_90, ROTATE_180, ROTATE_270, TRANSPOSE, TRANSVERSE 등입니다.
    ROTATE_90/270은 가로세로를 정확히 뒤집어 size가 (W, H) → (H, W)가 됩니다. ROTATE_180은 size를 유지하고 픽셀만 뒤집습니다.
    FLIP_LEFT_RIGHT는 좌우 거울 반전, FLIP_TOP_BOTTOM은 상하 반전입니다. 둘 다 size를 유지합니다.
    rotate(90)와 transpose(ROTATE_90)는 같은 결과지만 transpose가 약간 빠르고 정확합니다.
  tips:
  - "Pillow 9.1+에서는 Image.Transpose.FLIP_LEFT_RIGHT 같은 enum 형식을 권장합니다. Image.FLIP_LEFT_RIGHT는 deprecated."
  - "두 번 같은 변환을 적용하면 원본과 같아지는지로 idempotence를 검증할 수 있습니다(FLIP은 idempotent, ROTATE_90은 4번 = 원본)."
  snippet: |-
    from PIL import Image
    from sklearn.datasets import load_sample_image

    transposeImage = Image.fromarray(load_sample_image('china.jpg'))
    flipped = transposeImage.transpose(Image.FLIP_LEFT_RIGHT)
    rotated90 = transposeImage.transpose(Image.ROTATE_90)
    rotated180 = transposeImage.transpose(Image.ROTATE_180)

    {
        'originalSize': transposeImage.size,
        'flippedSize': flipped.size,
        'rotated90Size': rotated90.size,
        'rotated180Size': rotated180.size,
        'flipKeepsSize': flipped.size == transposeImage.size,
        'rotate90SwapsSize': rotated90.size == (transposeImage.size[1], transposeImage.size[0]),
        'rotate180KeepsSize': rotated180.size == transposeImage.size,
    }
  exercise:
    prompt: FLIP_LEFT_RIGHT를 두 번 적용하면 원본과 정확히 같은지 ndarray 비교로 확인하세요.
    starterCode: |-
      import numpy as np
      from PIL import Image
      from sklearn.datasets import load_sample_image

      idempotentImage = Image.fromarray(load_sample_image('china.jpg'))
      flipOnce = idempotentImage.transpose(Image.FLIP_LEFT_RIGHT)
      flipTwice = flipOnce.transpose(Image.___)

      isSame = np.array_equal(np.asarray(idempotentImage), np.asarray(flipTwice))
      {'isSame': bool(isSame)}
    hints:
    - 같은 메서드를 한 번 더 적용합니다.
    - 빈칸에는 FLIP_LEFT_RIGHT가 들어갑니다.
    check:
      noError: transpose 두 호출이 끝나야 합니다.
      resultCheck: isSame이 True여야 합니다.
  check:
    noError: 세 transpose 호출이 끝나야 합니다.
    resultCheck: flipKeepsSize, rotate90SwapsSize, rotate180KeepsSize 모두 True여야 합니다.
- id: step5_combine
  title: 5단계. 메서드 체이닝
  structuredPrimary: true
  subtitle: crop → rotate → resize 한 줄
  goal: chinaImage에 crop → rotate(expand=True) → resize 세 변환을 한 줄로 chaining해 최종 size가 (200, 200)인지 확인합니다.
  why: Pillow의 편집 메서드는 모두 새 객체를 돌려줍니다. 체이닝이 자연스럽고 중간 변수가 필요 없어 짧은 코드가 됩니다. 그러나 체이닝이 너무 길면 디버깅이 어려우므로 단계 변수와의 trade-off를 의식해야 합니다.
  explanation: |-
    Image의 crop, rotate, resize, transpose는 모두 새 객체를 돌려줍니다. .crop(...).rotate(...).resize(...) 형식으로 한 줄에 묶을 수 있습니다.
    한 줄 체이닝은 짧고 명확하지만 중간 결과를 검사하기 어렵습니다. 디버깅 단계에서는 각 변환을 변수에 따로 담는 게 안전합니다.
    예제는 chinaImage에서 가운데 크롭 → 15° 회전(expand=True) → 정사각 200x200 resize의 3단계 체인을 만듭니다. 최종 결과는 (200, 200)으로 보장됩니다.
  tips:
  - 체이닝이 너무 길어지면 한 줄에 너무 많은 동작이 들어가 디버깅이 어렵습니다. 3~4단계가 적정선입니다.
  - 메서드 체이닝의 중간 객체는 가비지 컬렉션됩니다. 메모리 절약 효과는 작지만 자동입니다.
  snippet: |-
    from PIL import Image
    from sklearn.datasets import load_sample_image

    chainImage = Image.fromarray(load_sample_image('china.jpg'))
    chainResult = (
        chainImage
        .crop((100, 50, 500, 350))
        .rotate(15, expand=True)
        .resize((200, 200))
    )

    {
        'originalSize': chainImage.size,
        'cropSize': (500 - 100, 350 - 50),
        'finalSize': chainResult.size,
        'isExactly200': chainResult.size == (200, 200),
    }
  exercise:
    prompt: 같은 체이닝에 transpose(FLIP_LEFT_RIGHT)를 마지막에 추가해 size는 그대로지만 픽셀이 좌우 반전되는지 확인하세요.
    starterCode: |-
      from PIL import Image
      from sklearn.datasets import load_sample_image

      flipChainImage = Image.fromarray(load_sample_image('china.jpg'))
      flipChainResult = (
          flipChainImage
          .crop((100, 50, 500, 350))
          .rotate(15, expand=True)
          .resize((200, 200))
          .transpose(Image.___)
      )

      {'size': flipChainResult.size, 'isExactly200': flipChainResult.size == (200, 200)}
    hints:
    - 좌우 반전 메서드는 FLIP_LEFT_RIGHT입니다.
    - 빈칸에는 FLIP_LEFT_RIGHT가 들어갑니다.
    check:
      noError: 체이닝 호출이 끝나야 합니다.
      resultCheck: isExactly200이 True여야 합니다.
  check:
    noError: 체이닝 호출이 끝나야 합니다.
    resultCheck: isExactly200이 True여야 합니다.
- id: practice
  title: 실습 - flower 다양한 편집
  structuredPrimary: true
  subtitle: 같은 함수 다른 입력
  goal: flower 이미지에 동일한 crop/rotate/transpose 변환을 적용해 결과 dict가 같은 형식으로 돌아오는지 확인합니다.
  why: 같은 함수를 다른 입력에 돌리는 일반화는 자동화의 기본 패턴입니다. 같은 형식 dict가 일관되게 돌아오면 후속 처리가 입력별 분기 없이 깔끔해집니다.
  explanation: |-
    flower와 china는 같은 (427, 640, 3) shape이라 같은 변환 코드가 그대로 동작합니다. 결과 size도 동일한 비율로 변합니다.
    함수로 묶어 두면 새 입력을 받아도 같은 형식의 결과 dict가 나옵니다. 자동화 코드의 표준 인터페이스가 됩니다.
    실무에서는 다양한 입력 사진(다른 비율, 다른 크기)이 들어옵니다. 입력 검증 후 변환 적용 → 결과 검증의 흐름이 견고합니다.
  tips:
  - 함수에 입력 size 검증을 추가하면 가정과 다른 입력에 즉시 실패합니다.
  - 결과 dict 키를 일관되게 두면 단위 테스트와 진단 모두 쉬워집니다.
  snippet: |-
    from PIL import Image
    from sklearn.datasets import load_sample_image


    def editImage(image: Image.Image) -> dict:
        cropped = image.crop((100, 50, 500, 350))
        rotated = cropped.rotate(15, expand=True)
        flipped = rotated.transpose(Image.FLIP_LEFT_RIGHT)
        return {
            'inputSize': image.size,
            'cropSize': cropped.size,
            'rotatedSize': rotated.size,
            'flippedSize': flipped.size,
        }


    flowerImage = Image.fromarray(load_sample_image('flower.jpg'))
    chinaImage = Image.fromarray(load_sample_image('china.jpg'))

    [editImage(flowerImage), editImage(chinaImage)]
  exercise:
    prompt: editImage에 'finalResized' 키를 추가해 마지막 결과를 resize((100, 100))으로 줄인 size를 함께 돌려주세요.
    starterCode: |-
      from PIL import Image
      from sklearn.datasets import load_sample_image


      def editImageExtended(image):
          cropped = image.crop((100, 50, 500, 350))
          rotated = cropped.rotate(15, expand=True)
          flipped = rotated.transpose(Image.FLIP_LEFT_RIGHT)
          resized = flipped.resize((___, 100))
          return {
              'inputSize': image.size,
              'finalResized': resized.size,
          }


      editImageExtended(Image.fromarray(load_sample_image('flower.jpg')))
    hints:
    - 정사각 100x100이라 두 인자 모두 100입니다.
    - 빈칸에는 100이 들어갑니다.
    check:
      noError: editImageExtended 정의와 호출이 끝나야 합니다.
      resultCheck: 결과 dict의 finalResized가 (100, 100)이어야 합니다.
  check:
    noError: editImage 정의와 두 호출이 끝나야 합니다.
    resultCheck: 두 결과 모두 같은 4개 키와 cropSize (400, 300)을 가져야 합니다.
- id: workflow_validation
  title: 6단계. crop 좌표와 출력 size 검증
  structuredPrimary: true
  subtitle: validateCropBox + 정수 size 보장
  goal: validateCropBox 함수가 이미지 밖으로 나간 box를 ValueError로 차단하고, 정상 box로 잘라낸 결과의 size가 (right-left, lower-upper)와 정확히 같은지 회귀 테스트로 확인합니다.
  why: crop 좌표는 사람이 자주 실수합니다. 음수, 이미지 밖, left>=right 같은 잘못된 box는 결과가 빈 이미지가 되어 다음 단계가 조용히 실패합니다. 함수 입구 가드가 그 사고를 차단합니다.
  explanation: |-
    validateCropBox는 (1) left/upper가 음수 아님, (2) right<=width, lower<=height, (3) left<right, upper<lower 세 조건을 검사합니다.
    Pillow ImageDraw로 만든 합성 입력(200x120 풍경 그림)은 size가 정확히 알려져 있어 검증에 적합합니다.
    회귀 테스트는 정상 box로 잘라낸 결과의 size가 box의 width/height와 정확히 같은지 확인합니다. Pillow crop은 box 계산에 +1 같은 오차가 없어 size가 (right-left, lower-upper) 그대로 나옵니다.
  tips:
  - "잘못된 crop이 조용히 빈 이미지를 만드는 사고는 운영에서 흔합니다. 가드가 디버깅 시간을 크게 줄입니다."
  - "ValueError 메시지에 실제 받은 box와 이미지 size를 함께 적어 두면 호출자가 즉시 원인을 알 수 있습니다."
  snippet: |-
    from PIL import Image, ImageDraw


    def validateCropBox(image: Image.Image, box: tuple) -> bool:
        left, upper, right, lower = box
        width, height = image.size
        if left < 0 or upper < 0:
            raise ValueError(f"crop 좌표는 음수 불가: box={box}")
        if right > width or lower > height:
            raise ValueError(f"crop이 이미지 밖: box={box}, imageSize={image.size}")
        if left >= right or upper >= lower:
            raise ValueError(f"crop 좌표 순서 오류: box={box}")
        return True


    landscapeImage = Image.new('RGB', (200, 120), (135, 190, 235))
    landscapeDraw = ImageDraw.Draw(landscapeImage)
    landscapeDraw.polygon([(0, 90), (60, 35), (120, 90)], fill=(70, 130, 95))
    landscapeDraw.polygon([(80, 95), (150, 30), (199, 95)], fill=(55, 115, 85))
    landscapeDraw.ellipse((145, 15, 180, 50), fill=(245, 210, 80))

    okBox = (40, 20, 160, 100)
    validateCropBox(landscapeImage, okBox)
    croppedLandscape = landscapeImage.crop(okBox)

    try:
        validateCropBox(landscapeImage, (-5, 20, 100, 100))
        negativeMessage = 'unexpected pass'
    except ValueError as exc:
        negativeMessage = str(exc)

    try:
        validateCropBox(landscapeImage, (10, 10, 250, 100))
        outOfBoundsMessage = 'unexpected pass'
    except ValueError as exc:
        outOfBoundsMessage = str(exc)

    {
        'croppedSize': croppedLandscape.size,
        'expectedSize': (okBox[2] - okBox[0], okBox[3] - okBox[1]),
        'matchesExpected': croppedLandscape.size == (okBox[2] - okBox[0], okBox[3] - okBox[1]),
        'negativeMessage': negativeMessage,
        'outOfBoundsMessage': outOfBoundsMessage,
    }
  exercise:
    prompt: validateCropBox에 left>=right인 box(예 (100, 20, 80, 100))를 넘기면 순서 오류가 잡히는지 확인하세요.
    starterCode: |-
      from PIL import Image


      def validateCropBox(image, box):
          left, upper, right, lower = box
          width, height = image.size
          if left < 0 or upper < 0:
              raise ValueError(f"crop 좌표는 음수 불가: box={box}")
          if right > width or lower > height:
              raise ValueError(f"crop이 이미지 밖: box={box}, imageSize={image.size}")
          if left >= right or upper >= lower:
              raise ValueError(f"crop 좌표 순서 오류: box={box}")
          return True


      orderImage = Image.new('RGB', (200, 120), (255, 255, 255))
      try:
          validateCropBox(orderImage, (___, 20, 80, 100))
          orderMessage = 'unexpected pass'
      except ValueError as exc:
          orderMessage = str(exc)

      {'orderMessage': orderMessage, 'hasOrderHint': '순서' in orderMessage}
    hints:
    - left가 right보다 큰 경우를 만들려면 left에 큰 값(100)을 넣습니다.
    - 빈칸에는 100이 들어갑니다.
    check:
      noError: validateCropBox 정의가 끝나야 합니다.
      resultCheck: hasOrderHint가 True여야 합니다.
  check:
    noError: validateCropBox와 crop 호출이 끝나야 합니다.
    resultCheck: matchesExpected가 True이고 negativeMessage, outOfBoundsMessage 모두 'unexpected pass'가 아니어야 합니다.
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
  - id: pillow_02-landscape_editor-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - workflow_validation
    title: 풍경 사진 편집기 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: crop box·resize filter·output aspect 계약을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_landscape_editor_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_landscape_editor_contract(value):
            raise NotImplementedError
      solution: |
        def audit_landscape_editor_contract(value):
            required = ['cropBox', 'targetWidth', 'targetHeight', 'resample']
            rules = [{'id': 'crop-box', 'field': 'cropBox', 'kind': 'length', 'value': 4}, {'id': 'target-width', 'field': 'targetWidth', 'kind': 'positive'}, {'id': 'target-height', 'field': 'targetHeight', 'kind': 'positive'}, {'id': 'resample', 'field': 'resample', 'kind': 'enum', 'values': ['LANCZOS', 'BICUBIC', 'BILINEAR']}]
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
            return {"accepted": not missing and not violations, "topic": 'landscape_editor', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.pillow.pillow_02.landscape_editor-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_02.landscape_editor-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_landscape_editor_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              cropBox:
              - 10
              - 20
              - 1010
              - 620
              targetWidth: 1000
              targetHeight: 600
              resample: LANCZOS
          expectedReturn:
            accepted: true
            topic: landscape_editor
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              targetWidth: 1000
              targetHeight: 600
              resample: LANCZOS
          expectedReturn:
            accepted: false
            topic: landscape_editor
            missing:
            - cropBox
            violations:
            - crop-box
        - id: reports-topic-invariants
          arguments:
          - value:
              cropBox:
              - 0
              - 0
              targetWidth: 0
              targetHeight: -1
              resample: NEAREST
          expectedReturn:
            accepted: false
            topic: landscape_editor
            missing: []
            violations:
            - crop-box
            - resample
            - target-height
            - target-width
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pillow_02-landscape_editor-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_02-landscape_editor-contract-audit-mastery
    title: 풍경 사진 편집기 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_landscape_editor_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_landscape_editor_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_landscape_editor_result(expected, observed):
            identity = ['sourceHash', 'recipeHash']
            metrics = {'outputPixels': 0}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'landscape_editor', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.pillow.pillow_02.landscape_editor-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_02.landscape_editor-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_landscape_editor_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: e1
              recipeHash: crop-a
              outputPixels: 600000
          - value:
              sourceHash: e1
              recipeHash: crop-a
              outputPixels: 600000
          expectedReturn:
            passed: true
            topic: landscape_editor
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: e1
              recipeHash: crop-a
              outputPixels: 600000
          - value:
              sourceHash: e2
              recipeHash: crop-b
              outputPixels: 500000
          expectedReturn:
            passed: false
            topic: landscape_editor
            missing: []
            identityMismatch:
            - recipeHash
            - sourceHash
            metricDrift:
            - outputPixels
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: e1
              recipeHash: crop-a
              outputPixels: 600000
          - value: {}
          expectedReturn:
            passed: false
            topic: landscape_editor
            missing:
            - outputPixels
            - recipeHash
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pillow_02-landscape_editor-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pillow_02-landscape_editor-result-reconciliation-transfer
    title: 풍경 사진 편집기 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_landscape_editor_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_landscape_editor_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_landscape_editor_evidence(stage):
            stages = {'source': {'action': 'admit landscape edit source', 'evidence': 'crop and target geometry', 'risk': 'unsafe or misread image'}, 'edit': {'action': 'apply bounded landscape edit edit', 'evidence': 'resample recipe', 'risk': 'quality or geometry loss'}, 'artifact': {'action': 'reopen landscape edit artifact', 'evidence': 'reopened output dimensions', 'risk': 'corrupt or visually wrong output'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.pillow.pillow_02.landscape_editor-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pillow.pillow_02.landscape_editor-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_landscape_editor_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: admit landscape edit source
            evidence: crop and target geometry
            risk: unsafe or misread image
        - id: recalls-edit
          arguments:
          - value: edit
          expectedReturn:
            action: apply bounded landscape edit edit
            evidence: resample recipe
            risk: quality or geometry loss
        - id: recalls-artifact
          arguments:
          - value: artifact
          expectedReturn:
            action: reopen landscape edit artifact
            evidence: reopened output dimensions
            risk: corrupt or visually wrong output
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};