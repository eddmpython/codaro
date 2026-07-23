var e=`meta:\r
  packages:\r
  - numpy\r
  - pillow\r
  - scikit-learn\r
  id: pillow_02\r
  title: 중국풍경편집기\r
  order: 2\r
  category: pillow\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - Pillow\r
  - crop\r
  - rotate\r
  - transpose\r
  - resize\r
  seo:\r
    title: Pillow 입문 - 중국 풍경 편집기\r
    description: Pillow의 crop/rotate/transpose로 이미지를 정확히 자르고 회전·뒤집기하는 편집 기본을 다룹니다.\r
    keywords:\r
    - Pillow\r
    - crop\r
    - rotate\r
    - transpose\r
    - 이미지편집\r
    - 회전\r
intro:\r
  emoji: 🏯\r
  goal: china 사진에 crop/rotate/transpose 세 편집 메서드를 적용해 좌표 계약, 회전 후 크기 변화, 정확 변환 vs 임의 각도 회전의 차이를 정량 비교합니다.\r
  description: Pillow의 편집 메서드는 모두 새 Image를 돌려줍니다. 메서드 체이닝이 자연스럽고, 좌표 계약과 expand 인자의 차이가 핵심 학습 포인트입니다.\r
  direction: crop의 (left, upper, right, lower) 4-tuple → rotate의 expand 효과 → transpose 90° 정확 변환 → 체이닝 흐름.\r
  benefits:\r
  - crop의 box 좌표가 (left, upper, right, lower)인 게 (x1, y1, x2, y2) ndarray 슬라이스와 어떻게 대응되는지 확인합니다.\r
  - rotate(angle, expand=True)와 expand=False의 결과 size를 비교합니다.\r
  - transpose의 90도 단위 변환이 모서리 손실 없이 정확함을 검증합니다.\r
  - 메서드 체이닝으로 crop→rotate→resize 한 줄 흐름을 작성합니다.\r
  diagram:\r
    steps:\r
    - label: china 로드\r
      detail: load_sample_image → Image.fromarray로 chinaImage를 만듭니다.\r
    - label: crop으로 영역 추출\r
      detail: (left, upper, right, lower) 좌표로 가운데 영역을 자르고 size 확인.\r
    - label: rotate로 임의 각도\r
      detail: rotate(15)과 rotate(15, expand=True)의 결과 size 비교.\r
    - label: transpose로 정확 변환\r
      detail: FLIP_LEFT_RIGHT, ROTATE_90 등 정확 변환의 size 보존 확인.\r
    - label: 메서드 체이닝\r
      detail: crop → rotate(expand=True) → resize 한 줄로 한 객체에 묶기.\r
    runtime:\r
    - label: pillow 패키지\r
      detail: meta.packages의 pillow가 가상환경에 있어야 from PIL import Image가 통과합니다.\r
    - label: 단일 노트북 변수\r
      detail: 첫 셀에서 chinaImage를 만들고 이후 모든 셀이 그대로 참조.\r
    - label: 메서드는 새 객체\r
      detail: crop/rotate/transpose 모두 새 Image를 돌려줘 메서드 체이닝이 안전.\r
sections:\r
- id: step1_load\r
  title: 1단계. china 로드와 size 점검\r
  structuredPrimary: true\r
  subtitle: chinaImage 만들기\r
  goal: china.jpg ndarray를 Image.fromarray로 Pillow Image로 만들고 size가 (640, 427)인지 확인합니다.\r
  why: 이후 모든 편집 셀이 chinaImage 한 객체를 입력으로 씁니다. 첫 셀에서 size와 mode를 정확히 잡아 두면 다음 셀들의 좌표 계산이 자연스러워집니다.\r
  explanation: |-\r
    sklearn china.jpg는 (427, 640, 3) RGB ndarray입니다. Pillow Image로 변환하면 size는 (640, 427) (width, height) 순서입니다.\r
    이 강의의 모든 좌표는 (width, height) 또는 (x, y) 컨벤션을 따릅니다. NumPy의 (row, col) 또는 (y, x)와 다른 점에 항상 주의합니다.\r
  tips:\r
  - china 샘플의 가로:세로 비율은 약 1.5:1입니다.\r
  - "Pillow size는 (width, height) 순서로 ndarray.shape (height, width, channels)와 정반대입니다."\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    chinaImage = Image.fromarray(load_sample_image('china.jpg'))\r
\r
    {\r
        'size': chinaImage.size,\r
        'width': chinaImage.size[0],\r
        'height': chinaImage.size[1],\r
        'mode': chinaImage.mode,\r
        'aspectRatio': round(chinaImage.size[0] / chinaImage.size[1], 2),\r
    }\r
  exercise:\r
    prompt: chinaImage의 가로:세로 비율이 1.4~1.6 범위 안에 있는지 한 줄에 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      ratioImage = Image.fromarray(load_sample_image('china.jpg'))\r
      ratio = ratioImage.size[0] / ratioImage.size[1]\r
      {'ratio': round(ratio, 2), 'isLandscape': 1.4 <= ratio <= ___}\r
    hints:\r
    - 상한 1.6에 들어가는지 확인합니다.\r
    - 빈칸에는 1.6이 들어갑니다.\r
    check:\r
      noError: Image.fromarray가 끝나야 합니다.\r
      resultCheck: isLandscape가 True여야 합니다.\r
  check:\r
    noError: load_sample_image와 Image.fromarray가 끝나야 합니다.\r
    resultCheck: size가 (640, 427), mode가 'RGB', aspectRatio가 약 1.5여야 합니다.\r
- id: step2_crop\r
  title: 2단계. crop으로 가운데 영역\r
  structuredPrimary: true\r
  subtitle: (left, upper, right, lower) 좌표\r
  goal: chinaImage의 가운데 절반 영역을 crop으로 잘라내고, 결과 size가 (320, 214)인지 확인합니다.\r
  why: crop의 4-tuple은 NumPy 슬라이스와 비슷하지만 인자 순서가 다릅니다. 좌상단 (left, upper)과 우하단 (right, lower)을 직접 계산해 한 번 만들어 두면 좌표 계약이 머리에 들어옵니다.\r
  explanation: |-\r
    Image.crop(box)에서 box는 (left, upper, right, lower) 4-tuple입니다. left/right는 x, upper/lower는 y에 해당합니다.\r
    NumPy 슬라이스 image[upper:lower, left:right]와 같은 영역을 잡습니다. y 인덱스가 먼저 오는 NumPy 컨벤션과 좌표 순서가 다르다는 점이 함정입니다.\r
    가운데 절반은 width의 1/4부터 3/4까지, height의 1/4부터 3/4까지로 잡습니다. (640, 427) 입력이면 정수 나눗셈 기준 box가 (160, 106, 480, 320)이 되고, 잘라낸 결과는 (320, 214)입니다.\r
  tips:\r
  - right와 lower는 포함되지 않는 경계입니다. NumPy 슬라이스와 같은 방식입니다.\r
  - box 좌표가 이미지 밖이면 빈 영역이 검정으로 채워집니다(예외는 아닙니다). 미리 검증이 필요합니다.\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    cropImage = Image.fromarray(load_sample_image('china.jpg'))\r
    cropWidth, cropHeight = cropImage.size\r
    cropBox = (cropWidth // 4, cropHeight // 4, cropWidth * 3 // 4, cropHeight * 3 // 4)\r
    cropped = cropImage.crop(cropBox)\r
\r
    {\r
        'originalSize': cropImage.size,\r
        'cropBox': cropBox,\r
        'croppedSize': cropped.size,\r
        'matchesHalfQuarter': cropped.size == (320, 214),\r
    }\r
  exercise:\r
    prompt: chinaImage에서 오른쪽 절반만 잘라내는 box를 만들고 결과 size가 (320, 427)인지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      rightImage = Image.fromarray(load_sample_image('china.jpg'))\r
      rightWidth, rightHeight = rightImage.size\r
      rightBox = (rightWidth // ___, 0, rightWidth, rightHeight)\r
      rightHalf = rightImage.crop(rightBox)\r
\r
      {'rightSize': rightHalf.size, 'isRightHalf': rightHalf.size == (320, 427)}\r
    hints:\r
    - "오른쪽 절반은 width//2부터 시작합니다."\r
    - 빈칸에는 2가 들어갑니다.\r
    check:\r
      noError: crop 호출이 끝나야 합니다.\r
      resultCheck: isRightHalf가 True여야 합니다.\r
  check:\r
    noError: crop 호출과 dict 구성이 끝나야 합니다.\r
    resultCheck: croppedSize가 약 (320, 213)이고 matchesHalfQuarter가 True여야 합니다.\r
- id: step3_rotate\r
  title: 3단계. rotate와 expand\r
  structuredPrimary: true\r
  subtitle: 임의 각도 회전의 두 모드\r
  goal: chinaImage에 rotate(15)과 rotate(15, expand=True)를 각각 적용해 두 결과의 size 차이를 확인합니다.\r
  why: rotate는 시계 반대 방향 회전입니다. expand 인자에 따라 결과 size가 크게 다르므로, 한 번 비교해 두지 않으면 회전 후 모서리가 잘리는 사고가 자주 납니다.\r
  explanation: |-\r
    Image.rotate(angle)는 기본적으로 원본 size를 유지합니다. 회전 후 이미지의 모서리가 원본 박스 밖으로 나가면 잘려서 사라집니다. 빈 영역은 기본 검정으로 채워집니다.\r
    Image.rotate(angle, expand=True)는 회전된 이미지 전체가 들어가도록 캔버스를 자동으로 키웁니다. 결과 size가 원본보다 커집니다. 모서리 잘림이 없습니다.\r
    실무에서는 expand=True가 거의 항상 안전한 기본값입니다. expand=False는 회전 각도가 작거나 정확한 크기 보존이 필요할 때만 씁니다.\r
  tips:\r
  - angle은 도 단위입니다. 90은 시계 반대 방향 90도 회전입니다.\r
  - fillcolor 인자로 빈 영역의 색을 지정할 수 있습니다. fillcolor=(255, 255, 255)는 흰색 배경.\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    rotateImage = Image.fromarray(load_sample_image('china.jpg'))\r
    rotated15 = rotateImage.rotate(15)\r
    rotated15Expand = rotateImage.rotate(15, expand=True)\r
\r
    {\r
        'originalSize': rotateImage.size,\r
        'rotatedFixedSize': rotated15.size,\r
        'rotatedExpandSize': rotated15Expand.size,\r
        'fixedKeepsSize': rotated15.size == rotateImage.size,\r
        'expandGrowsSize': rotated15Expand.size[0] > rotateImage.size[0],\r
    }\r
  exercise:\r
    prompt: rotate(90, expand=True)를 적용해 결과 size가 (427, 640)이 되는지 확인하세요. (가로세로가 정확히 뒤집힙니다)\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      ninetyImage = Image.fromarray(load_sample_image('china.jpg'))\r
      ninetyRotated = ninetyImage.rotate(90, expand=___)\r
      {'size': ninetyRotated.size, 'isSwapped': ninetyRotated.size == (427, 640)}\r
    hints:\r
    - expand 인자에는 True가 들어갑니다.\r
    - 빈칸에는 True가 들어갑니다.\r
    check:\r
      noError: rotate 호출이 끝나야 합니다.\r
      resultCheck: isSwapped가 True여야 합니다.\r
  check:\r
    noError: rotate 두 호출이 끝나야 합니다.\r
    resultCheck: fixedKeepsSize가 True이고 expandGrowsSize가 True여야 합니다.\r
- id: step4_transpose\r
  title: 4단계. transpose로 정확 변환\r
  structuredPrimary: true\r
  subtitle: 90/180/270 + FLIP\r
  goal: chinaImage에 transpose의 FLIP_LEFT_RIGHT, ROTATE_90, ROTATE_180을 적용해 각각의 size 변화를 확인합니다.\r
  why: transpose는 90° 단위 회전과 좌우/상하 반전에 특화된 메서드입니다. rotate(90)와 다르게 모서리 잘림이 전혀 없고, 결과 size가 항상 정확합니다.\r
  explanation: |-\r
    Image.transpose(method)는 미리 정의된 정확 변환을 적용합니다. 사용 가능한 method는 FLIP_LEFT_RIGHT, FLIP_TOP_BOTTOM, ROTATE_90, ROTATE_180, ROTATE_270, TRANSPOSE, TRANSVERSE 등입니다.\r
    ROTATE_90/270은 가로세로를 정확히 뒤집어 size가 (W, H) → (H, W)가 됩니다. ROTATE_180은 size를 유지하고 픽셀만 뒤집습니다.\r
    FLIP_LEFT_RIGHT는 좌우 거울 반전, FLIP_TOP_BOTTOM은 상하 반전입니다. 둘 다 size를 유지합니다.\r
    rotate(90)와 transpose(ROTATE_90)는 같은 결과지만 transpose가 약간 빠르고 정확합니다.\r
  tips:\r
  - "Pillow 9.1+에서는 Image.Transpose.FLIP_LEFT_RIGHT 같은 enum 형식을 권장합니다. Image.FLIP_LEFT_RIGHT는 deprecated."\r
  - "두 번 같은 변환을 적용하면 원본과 같아지는지로 idempotence를 검증할 수 있습니다(FLIP은 idempotent, ROTATE_90은 4번 = 원본)."\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    transposeImage = Image.fromarray(load_sample_image('china.jpg'))\r
    flipped = transposeImage.transpose(Image.FLIP_LEFT_RIGHT)\r
    rotated90 = transposeImage.transpose(Image.ROTATE_90)\r
    rotated180 = transposeImage.transpose(Image.ROTATE_180)\r
\r
    {\r
        'originalSize': transposeImage.size,\r
        'flippedSize': flipped.size,\r
        'rotated90Size': rotated90.size,\r
        'rotated180Size': rotated180.size,\r
        'flipKeepsSize': flipped.size == transposeImage.size,\r
        'rotate90SwapsSize': rotated90.size == (transposeImage.size[1], transposeImage.size[0]),\r
        'rotate180KeepsSize': rotated180.size == transposeImage.size,\r
    }\r
  exercise:\r
    prompt: FLIP_LEFT_RIGHT를 두 번 적용하면 원본과 정확히 같은지 ndarray 비교로 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      idempotentImage = Image.fromarray(load_sample_image('china.jpg'))\r
      flipOnce = idempotentImage.transpose(Image.FLIP_LEFT_RIGHT)\r
      flipTwice = flipOnce.transpose(Image.___)\r
\r
      isSame = np.array_equal(np.asarray(idempotentImage), np.asarray(flipTwice))\r
      {'isSame': bool(isSame)}\r
    hints:\r
    - 같은 메서드를 한 번 더 적용합니다.\r
    - 빈칸에는 FLIP_LEFT_RIGHT가 들어갑니다.\r
    check:\r
      noError: transpose 두 호출이 끝나야 합니다.\r
      resultCheck: isSame이 True여야 합니다.\r
  check:\r
    noError: 세 transpose 호출이 끝나야 합니다.\r
    resultCheck: flipKeepsSize, rotate90SwapsSize, rotate180KeepsSize 모두 True여야 합니다.\r
- id: step5_combine\r
  title: 5단계. 메서드 체이닝\r
  structuredPrimary: true\r
  subtitle: crop → rotate → resize 한 줄\r
  goal: chinaImage에 crop → rotate(expand=True) → resize 세 변환을 한 줄로 chaining해 최종 size가 (200, 200)인지 확인합니다.\r
  why: Pillow의 편집 메서드는 모두 새 객체를 돌려줍니다. 체이닝이 자연스럽고 중간 변수가 필요 없어 짧은 코드가 됩니다. 그러나 체이닝이 너무 길면 디버깅이 어려우므로 단계 변수와의 trade-off를 의식해야 합니다.\r
  explanation: |-\r
    Image의 crop, rotate, resize, transpose는 모두 새 객체를 돌려줍니다. .crop(...).rotate(...).resize(...) 형식으로 한 줄에 묶을 수 있습니다.\r
    한 줄 체이닝은 짧고 명확하지만 중간 결과를 검사하기 어렵습니다. 디버깅 단계에서는 각 변환을 변수에 따로 담는 게 안전합니다.\r
    예제는 chinaImage에서 가운데 크롭 → 15° 회전(expand=True) → 정사각 200x200 resize의 3단계 체인을 만듭니다. 최종 결과는 (200, 200)으로 보장됩니다.\r
  tips:\r
  - 체이닝이 너무 길어지면 한 줄에 너무 많은 동작이 들어가 디버깅이 어렵습니다. 3~4단계가 적정선입니다.\r
  - 메서드 체이닝의 중간 객체는 가비지 컬렉션됩니다. 메모리 절약 효과는 작지만 자동입니다.\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    chainImage = Image.fromarray(load_sample_image('china.jpg'))\r
    chainResult = (\r
        chainImage\r
        .crop((100, 50, 500, 350))\r
        .rotate(15, expand=True)\r
        .resize((200, 200))\r
    )\r
\r
    {\r
        'originalSize': chainImage.size,\r
        'cropSize': (500 - 100, 350 - 50),\r
        'finalSize': chainResult.size,\r
        'isExactly200': chainResult.size == (200, 200),\r
    }\r
  exercise:\r
    prompt: 같은 체이닝에 transpose(FLIP_LEFT_RIGHT)를 마지막에 추가해 size는 그대로지만 픽셀이 좌우 반전되는지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
      flipChainImage = Image.fromarray(load_sample_image('china.jpg'))\r
      flipChainResult = (\r
          flipChainImage\r
          .crop((100, 50, 500, 350))\r
          .rotate(15, expand=True)\r
          .resize((200, 200))\r
          .transpose(Image.___)\r
      )\r
\r
      {'size': flipChainResult.size, 'isExactly200': flipChainResult.size == (200, 200)}\r
    hints:\r
    - 좌우 반전 메서드는 FLIP_LEFT_RIGHT입니다.\r
    - 빈칸에는 FLIP_LEFT_RIGHT가 들어갑니다.\r
    check:\r
      noError: 체이닝 호출이 끝나야 합니다.\r
      resultCheck: isExactly200이 True여야 합니다.\r
  check:\r
    noError: 체이닝 호출이 끝나야 합니다.\r
    resultCheck: isExactly200이 True여야 합니다.\r
- id: practice\r
  title: 실습 - flower 다양한 편집\r
  structuredPrimary: true\r
  subtitle: 같은 함수 다른 입력\r
  goal: flower 이미지에 동일한 crop/rotate/transpose 변환을 적용해 결과 dict가 같은 형식으로 돌아오는지 확인합니다.\r
  why: 같은 함수를 다른 입력에 돌리는 일반화는 자동화의 기본 패턴입니다. 같은 형식 dict가 일관되게 돌아오면 후속 처리가 입력별 분기 없이 깔끔해집니다.\r
  explanation: |-\r
    flower와 china는 같은 (427, 640, 3) shape이라 같은 변환 코드가 그대로 동작합니다. 결과 size도 동일한 비율로 변합니다.\r
    함수로 묶어 두면 새 입력을 받아도 같은 형식의 결과 dict가 나옵니다. 자동화 코드의 표준 인터페이스가 됩니다.\r
    실무에서는 다양한 입력 사진(다른 비율, 다른 크기)이 들어옵니다. 입력 검증 후 변환 적용 → 결과 검증의 흐름이 견고합니다.\r
  tips:\r
  - 함수에 입력 size 검증을 추가하면 가정과 다른 입력에 즉시 실패합니다.\r
  - 결과 dict 키를 일관되게 두면 단위 테스트와 진단 모두 쉬워집니다.\r
  snippet: |-\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
\r
    def editImage(image: Image.Image) -> dict:\r
        cropped = image.crop((100, 50, 500, 350))\r
        rotated = cropped.rotate(15, expand=True)\r
        flipped = rotated.transpose(Image.FLIP_LEFT_RIGHT)\r
        return {\r
            'inputSize': image.size,\r
            'cropSize': cropped.size,\r
            'rotatedSize': rotated.size,\r
            'flippedSize': flipped.size,\r
        }\r
\r
\r
    flowerImage = Image.fromarray(load_sample_image('flower.jpg'))\r
    chinaImage = Image.fromarray(load_sample_image('china.jpg'))\r
\r
    [editImage(flowerImage), editImage(chinaImage)]\r
  exercise:\r
    prompt: editImage에 'finalResized' 키를 추가해 마지막 결과를 resize((100, 100))으로 줄인 size를 함께 돌려주세요.\r
    starterCode: |-\r
      from PIL import Image\r
      from sklearn.datasets import load_sample_image\r
\r
\r
      def editImageExtended(image):\r
          cropped = image.crop((100, 50, 500, 350))\r
          rotated = cropped.rotate(15, expand=True)\r
          flipped = rotated.transpose(Image.FLIP_LEFT_RIGHT)\r
          resized = flipped.resize((___, 100))\r
          return {\r
              'inputSize': image.size,\r
              'finalResized': resized.size,\r
          }\r
\r
\r
      editImageExtended(Image.fromarray(load_sample_image('flower.jpg')))\r
    hints:\r
    - 정사각 100x100이라 두 인자 모두 100입니다.\r
    - 빈칸에는 100이 들어갑니다.\r
    check:\r
      noError: editImageExtended 정의와 호출이 끝나야 합니다.\r
      resultCheck: 결과 dict의 finalResized가 (100, 100)이어야 합니다.\r
  check:\r
    noError: editImage 정의와 두 호출이 끝나야 합니다.\r
    resultCheck: 두 결과 모두 같은 4개 키와 cropSize (400, 300)을 가져야 합니다.\r
- id: workflow_validation\r
  title: 6단계. crop 좌표와 출력 size 검증\r
  structuredPrimary: true\r
  subtitle: validateCropBox + 정수 size 보장\r
  goal: validateCropBox 함수가 이미지 밖으로 나간 box를 ValueError로 차단하고, 정상 box로 잘라낸 결과의 size가 (right-left, lower-upper)와 정확히 같은지 회귀 테스트로 확인합니다.\r
  why: crop 좌표는 사람이 자주 실수합니다. 음수, 이미지 밖, left>=right 같은 잘못된 box는 결과가 빈 이미지가 되어 다음 단계가 조용히 실패합니다. 함수 입구 가드가 그 사고를 차단합니다.\r
  explanation: |-\r
    validateCropBox는 (1) left/upper가 음수 아님, (2) right<=width, lower<=height, (3) left<right, upper<lower 세 조건을 검사합니다.\r
    Pillow ImageDraw로 만든 합성 입력(200x120 풍경 그림)은 size가 정확히 알려져 있어 검증에 적합합니다.\r
    회귀 테스트는 정상 box로 잘라낸 결과의 size가 box의 width/height와 정확히 같은지 확인합니다. Pillow crop은 box 계산에 +1 같은 오차가 없어 size가 (right-left, lower-upper) 그대로 나옵니다.\r
  tips:\r
  - "잘못된 crop이 조용히 빈 이미지를 만드는 사고는 운영에서 흔합니다. 가드가 디버깅 시간을 크게 줄입니다."\r
  - "ValueError 메시지에 실제 받은 box와 이미지 size를 함께 적어 두면 호출자가 즉시 원인을 알 수 있습니다."\r
  snippet: |-\r
    from PIL import Image, ImageDraw\r
\r
\r
    def validateCropBox(image: Image.Image, box: tuple) -> bool:\r
        left, upper, right, lower = box\r
        width, height = image.size\r
        if left < 0 or upper < 0:\r
            raise ValueError(f"crop 좌표는 음수 불가: box={box}")\r
        if right > width or lower > height:\r
            raise ValueError(f"crop이 이미지 밖: box={box}, imageSize={image.size}")\r
        if left >= right or upper >= lower:\r
            raise ValueError(f"crop 좌표 순서 오류: box={box}")\r
        return True\r
\r
\r
    landscapeImage = Image.new('RGB', (200, 120), (135, 190, 235))\r
    landscapeDraw = ImageDraw.Draw(landscapeImage)\r
    landscapeDraw.polygon([(0, 90), (60, 35), (120, 90)], fill=(70, 130, 95))\r
    landscapeDraw.polygon([(80, 95), (150, 30), (199, 95)], fill=(55, 115, 85))\r
    landscapeDraw.ellipse((145, 15, 180, 50), fill=(245, 210, 80))\r
\r
    okBox = (40, 20, 160, 100)\r
    validateCropBox(landscapeImage, okBox)\r
    croppedLandscape = landscapeImage.crop(okBox)\r
\r
    try:\r
        validateCropBox(landscapeImage, (-5, 20, 100, 100))\r
        negativeMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        negativeMessage = str(exc)\r
\r
    try:\r
        validateCropBox(landscapeImage, (10, 10, 250, 100))\r
        outOfBoundsMessage = 'unexpected pass'\r
    except ValueError as exc:\r
        outOfBoundsMessage = str(exc)\r
\r
    {\r
        'croppedSize': croppedLandscape.size,\r
        'expectedSize': (okBox[2] - okBox[0], okBox[3] - okBox[1]),\r
        'matchesExpected': croppedLandscape.size == (okBox[2] - okBox[0], okBox[3] - okBox[1]),\r
        'negativeMessage': negativeMessage,\r
        'outOfBoundsMessage': outOfBoundsMessage,\r
    }\r
  exercise:\r
    prompt: validateCropBox에 left>=right인 box(예 (100, 20, 80, 100))를 넘기면 순서 오류가 잡히는지 확인하세요.\r
    starterCode: |-\r
      from PIL import Image\r
\r
\r
      def validateCropBox(image, box):\r
          left, upper, right, lower = box\r
          width, height = image.size\r
          if left < 0 or upper < 0:\r
              raise ValueError(f"crop 좌표는 음수 불가: box={box}")\r
          if right > width or lower > height:\r
              raise ValueError(f"crop이 이미지 밖: box={box}, imageSize={image.size}")\r
          if left >= right or upper >= lower:\r
              raise ValueError(f"crop 좌표 순서 오류: box={box}")\r
          return True\r
\r
\r
      orderImage = Image.new('RGB', (200, 120), (255, 255, 255))\r
      try:\r
          validateCropBox(orderImage, (___, 20, 80, 100))\r
          orderMessage = 'unexpected pass'\r
      except ValueError as exc:\r
          orderMessage = str(exc)\r
\r
      {'orderMessage': orderMessage, 'hasOrderHint': '순서' in orderMessage}\r
    hints:\r
    - left가 right보다 큰 경우를 만들려면 left에 큰 값(100)을 넣습니다.\r
    - 빈칸에는 100이 들어갑니다.\r
    check:\r
      noError: validateCropBox 정의가 끝나야 합니다.\r
      resultCheck: hasOrderHint가 True여야 합니다.\r
  check:\r
    noError: validateCropBox와 crop 호출이 끝나야 합니다.\r
    resultCheck: matchesExpected가 True이고 negativeMessage, outOfBoundsMessage 모두 'unexpected pass'가 아니어야 합니다.\r
`;export{e as default};