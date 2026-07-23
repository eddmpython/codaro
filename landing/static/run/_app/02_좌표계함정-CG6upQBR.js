var e=`meta:\r
  id: visionBasics_02\r
  title: 좌표계 함정\r
  order: 2\r
  category: visionBasics\r
  difficulty: ⭐\r
  badge: 입문\r
  packages:\r
  - matplotlib\r
  - numpy\r
  tags:\r
  - numpy\r
  - 좌표계\r
  - 인덱싱\r
  - 행렬\r
  - 이미지구조\r
  seo:\r
    title: 이미지 비전 기초 - 좌표계 함정\r
    description: numpy 배열의 (y, x) 인덱싱과 화면 좌표 (x, y)의 차이를 정리합니다.\r
    keywords:\r
    - numpy\r
    - 좌표계\r
    - 인덱싱\r
    - 이미지\r
intro:\r
  emoji: 🧭\r
  goal: numpy 이미지의 (y, x) 인덱싱이 일반 좌표계와 어떻게 다른지 손으로 그려 보며 정리합니다.\r
  description: |-\r
    좌표계는 이미지 비전 입문자가 가장 자주 헤매는 부분입니다. 수학에서 점은 (x, y)이고 y는 위로 갈수록 커지지만, 컴퓨터 이미지에서 픽셀은 \`img[y, x]\`로 접근하고 y는 아래로 갈수록 커집니다. 이 강의는 점, 사각형, 십자, 대각선을 직접 그리며 두 좌표계의 차이를 몸으로 익힙니다.\r
  direction: 같은 위치를 (y, x)와 (x, y)로 번갈아 적어 보며 원점·축 방향·인덱스 순서의 차이를 직접 확인합니다.\r
  benefits:\r
  - 픽셀 접근 시 행과 열의 순서를 헷갈리지 않습니다.\r
  - 사각형, 십자, 대각선을 한 번에 numpy 슬라이싱으로 그릴 수 있습니다.\r
  - OpenCV/Pillow 함수가 (x, y) 인자를 받는 이유와 변환 방법을 이해합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 점 하나 찍기\r
      detail: 같은 위치를 (y, x)와 (x, y)로 적어 비교합니다.\r
    - label: 2단계. 원점이 어디인가\r
      detail: 좌상단이 (0, 0)인 이미지 좌표계를 확인합니다.\r
    - label: 3단계. 사각형 그리기\r
      detail: 슬라이싱으로 사각형 영역을 채워 봅니다.\r
    - label: 4단계. 십자와 대각선\r
      detail: 단일 행, 단일 열, 인덱스 배열로 도형을 그립니다.\r
    runtime:\r
    - label: numpy 환경\r
      detail: numpy + matplotlib로 좌표 감각을 만듭니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: one_pixel\r
  title: 1단계. 점 하나 찍어 보기\r
  structuredPrimary: true\r
  subtitle: 같은 위치를 두 방식으로 적기\r
  goal: 같은 픽셀을 numpy 인덱스 (y, x)와 화면 좌표 (x, y)로 동시에 적어 차이를 인식합니다.\r
  why: 좌표 순서를 헷갈리면 처음 만든 함수가 항상 90도 회전된 결과를 내놓습니다.\r
  explanation: |-\r
    numpy 이미지에서 \`img[10, 20]\`은 10번 행, 20번 열의 픽셀입니다. 이 픽셀의 화면 위치는 가로 20, 세로 10이므로 (x, y) 표기로는 (20, 10)입니다. 같은 점을 부르는 두 가지 방식입니다.\r
\r
    헷갈림을 줄이려면 \`img[y, x]\` 처럼 변수명을 y, x 순으로 쓰는 습관을 들입니다. OpenCV의 \`cv2.circle(img, center=(x, y), ...)\` 같은 함수는 인자가 (x, y)이므로 둘을 섞어 쓸 줄 알아야 합니다.\r
  tips:\r
  - numpy 인덱스는 \`[행, 열]\` 즉 \`[y, x]\` 입니다. 함수 시그니처가 \`(x, y)\`로 보이면 의도된 변환임을 인지하세요.\r
  snippet: |-\r
    import numpy as np\r
\r
    img = np.zeros((50, 80, 3), dtype=np.uint8)\r
    img[10, 60] = [255, 255, 255]\r
    pixel = img[10, 60]\r
    pixel\r
  exercise:\r
    prompt: 화면 좌표 (x=5, y=40) 위치에 청록색([0, 200, 200]) 픽셀을 찍고 numpy 인덱스로 그 값을 다시 읽으세요.\r
    starterCode: |-\r
      img2 = np.zeros((50, 80, 3), dtype=np.uint8)\r
      img2[___, ___] = [0, 200, 200]\r
      img2[___, ___]\r
    hints:\r
    - "(x=5, y=40)에서 x=5는 열 번호, y=40은 행 번호입니다."\r
    - numpy 인덱스는 [행, 열] 순서로 적습니다.\r
  check:\r
    noError: 인덱스 접근과 대입이 IndexError 없이 끝나야 합니다.\r
    resultCheck: 읽어낸 픽셀이 [0, 200, 200]이어야 합니다.\r
- id: origin\r
  title: 2단계. 원점은 좌상단\r
  structuredPrimary: true\r
  subtitle: y축은 아래로 증가\r
  goal: 이미지 좌표계의 원점이 좌상단이며 y가 아래로 갈수록 커진다는 사실을 시각적으로 확인합니다.\r
  why: 수학 그래프와 이미지의 y축 방향이 반대라는 사실을 모르면 위아래 뒤집힌 결과를 디버깅하느라 한참을 헤맵니다.\r
  explanation: |-\r
    \`[0, 0]\`은 항상 이미지의 좌상단 픽셀입니다. 행 인덱스가 커질수록 아래로, 열 인덱스가 커질수록 오른쪽으로 이동합니다. matplotlib의 \`imshow\`는 기본적으로 이 방향을 그대로 표시합니다.\r
\r
    \`plt.imshow(img, origin='lower')\` 옵션을 주면 y축이 위로 가는 수학 좌표계처럼 그려집니다. 하지만 이미지 비전 도구는 거의 모두 좌상단 원점을 기준으로 동작하므로 기본 방향을 그대로 쓰는 것이 표준입니다.\r
  tips:\r
  - imshow에서 점이 의도한 위치에 안 보이면, 행과 열을 바꿔 쓴 것이 아닌지 가장 먼저 확인하세요.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
\r
    grid = np.zeros((100, 100, 3), dtype=np.uint8)\r
    grid[0, 0] = [255, 0, 0]\r
    grid[0, 99] = [0, 255, 0]\r
    grid[99, 0] = [0, 0, 255]\r
    grid[99, 99] = [255, 255, 0]\r
\r
    fig = plt.figure(figsize=(4, 4))\r
    plt.imshow(grid)\r
    plt.title('TL=red, TR=green, BL=blue, BR=yellow')\r
    plt.axis('on')\r
    fig\r
  exercise:\r
    prompt: "grid의 정중앙 픽셀(50, 50)에 흰색을 찍고 다시 imshow로 확인하세요."\r
    starterCode: |-\r
      grid[___, ___] = [255, 255, 255]\r
      fig2 = plt.figure(figsize=(4, 4))\r
      plt.imshow(grid)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 정중앙은 행 50, 열 50입니다.\r
    - 한 셀 안에서는 같은 변수를 수정해도 됩니다.\r
  check:\r
    noError: 픽셀 대입과 figure 평가가 오류 없이 끝나야 합니다.\r
    resultCheck: grid[50, 50]이 [255, 255, 255]여야 합니다.\r
- id: rectangle\r
  title: 3단계. 사각형 영역 채우기\r
  structuredPrimary: true\r
  subtitle: 슬라이싱으로 사각형 그리기\r
  goal: 두 슬라이스 범위를 곱한 사각형 영역에 색을 채웁니다.\r
  why: 사각형 그리기는 객체 박스, 워터마크, 마스크 만들기 등 거의 모든 처리에 등장합니다.\r
  explanation: |-\r
    \`img[y0:y1, x0:x1]\` 는 행 y0 이상 y1 미만, 열 x0 이상 x1 미만의 사각형 슬라이스를 가리킵니다. 이 슬라이스에 색을 대입하면 사각형이 채워집니다.\r
\r
    경계가 헷갈릴 때는 "끝은 포함하지 않는다"를 기억합니다. \`img[0:5, :]\` 는 0, 1, 2, 3, 4 행을 의미하며 5번째 행은 포함되지 않습니다.\r
  tips:\r
  - 사각형 좌표를 함수에 전달할 때는 (x, y, w, h)나 (x1, y1, x2, y2) 같은 다양한 규약이 있으니 어떤 도구의 규약인지 확인하세요.\r
  snippet: |-\r
    board = np.zeros((200, 200, 3), dtype=np.uint8)\r
    board[40:80, 30:170] = [200, 80, 50]\r
    board[100:160, 60:140] = [60, 180, 90]\r
    fig = plt.figure(figsize=(4, 4))\r
    plt.imshow(board)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: board의 우상단 (행 0~30, 열 160~200) 영역에 노란색([255, 220, 0])을 채우세요.\r
    starterCode: |-\r
      board[___:___, ___:___] = [255, 220, 0]\r
      fig2 = plt.figure(figsize=(4, 4))\r
      plt.imshow(board)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 우상단은 행이 작고 열이 큰 영역입니다.\r
    - 가로 30 픽셀짜리 사각형이 됩니다.\r
  check:\r
    noError: 슬라이싱 대입이 ValueError 없이 끝나야 합니다.\r
    resultCheck: board[10, 180] 픽셀이 [255, 220, 0]이어야 합니다.\r
- id: cross_diagonal\r
  title: 4단계. 십자와 대각선\r
  structuredPrimary: true\r
  subtitle: 단일 축과 인덱스 배열\r
  goal: 한 행 전체, 한 열 전체, 대각선을 한 줄로 그립니다.\r
  why: 한 줄로 행과 열, 대각선을 그릴 수 있어야 numpy의 진짜 힘을 쓸 수 있습니다.\r
  explanation: |-\r
    \`img[y, :]\` 는 y번 행 전체를 가리키고 \`img[:, x]\` 는 x번 열 전체를 가리킵니다. 두 슬라이스에 색을 대입하면 가로선과 세로선이 하나씩 그려집니다.\r
\r
    대각선은 같은 길이의 인덱스 두 개로 표현합니다. \`img[np.arange(n), np.arange(n)]\` 는 좌상단에서 우하단으로 가는 대각선 픽셀들을 한꺼번에 지정합니다. 이것이 fancy indexing이며 마스크 트랙에서 자주 쓰입니다.\r
  tips:\r
  - fancy indexing은 같은 모양의 인덱스 배열을 두 개 받아 짝지어 위치를 만듭니다. zip과 같은 동작을 한다고 보면 됩니다.\r
  snippet: |-\r
    plate = np.zeros((150, 150, 3), dtype=np.uint8)\r
    plate[75, :] = [255, 255, 255]\r
    plate[:, 75] = [255, 255, 255]\r
    side = np.arange(150)\r
    plate[side, side] = [255, 60, 60]\r
    fig = plt.figure(figsize=(4, 4))\r
    plt.imshow(plate)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: plate의 반대 방향 대각선(우상단에서 좌하단으로)을 청록색([0, 200, 200])으로 그리세요.\r
    starterCode: |-\r
      reverseSide = np.arange(150)\r
      plate[reverseSide, ___] = [0, 200, 200]\r
      fig2 = plt.figure(figsize=(4, 4))\r
      plt.imshow(plate)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 반대 대각선의 열 인덱스는 149에서 0으로 줄어듭니다.\r
    - "149 - reverseSide 로 계산할 수 있습니다."\r
  check:\r
    noError: fancy indexing 대입이 IndexError 없이 끝나야 합니다.\r
    resultCheck: plate[0, 149]가 [0, 200, 200]이어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 좌표 감각으로 도형 그리기\r
  goal: 좌표계를 직접 다뤄야 풀리는 두 가지 그림을 완성합니다.\r
  why: 좌표는 글로 외우면 잊습니다. 한 장의 그림을 직접 그려 봐야 손에 남습니다.\r
  explanation: |-\r
    아래 두 미션은 좌표계 감각으로만 풀립니다. 각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 사각형 4개로 모서리 표시를 만들 때 같은 (h, w) 패치를 여러 위치에 붙여 보면 좌표 계산이 단순해집니다.\r
  snippet: |-\r
    corners = np.zeros((120, 200, 3), dtype=np.uint8)\r
    patch = np.zeros((20, 20, 3), dtype=np.uint8)\r
    patch[:] = [255, 100, 100]\r
    corners[0:20, 0:20] = patch\r
    corners[0:20, 180:200] = patch\r
    corners[100:120, 0:20] = patch\r
    corners[100:120, 180:200] = patch\r
    fig = plt.figure(figsize=(5, 3))\r
    plt.imshow(corners)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: "미션1: bullseye(200x200x3)에 가운데를 중심으로 한 사각 테두리 세 겹(빨강·녹색·파랑)을 그리세요(바깥부터 가운데 순서). 미션2: 화살표 모양 arrow(100x200x3)를 가로 줄과 두 개의 사선으로 그리세요(우측 끝에서 좌측으로 향하는 화살표)."\r
    starterCode: |-\r
      bullseye = np.zeros((200, 200, 3), dtype=np.uint8)\r
      bullseye[0:200, 0:200] = [255, 0, 0]\r
      bullseye[20:180, 20:180] = [0, 0, 0]\r
      bullseye[40:160, 40:160] = [___, ___, ___]\r
      bullseye[60:140, 60:140] = [0, 0, 0]\r
      bullseye[80:120, 80:120] = [0, 0, 255]\r
      eyeFig = plt.figure(figsize=(4, 4))\r
      plt.imshow(bullseye)\r
      plt.axis('off')\r
      eyeFig\r
    hints:\r
    - 가장 바깥부터 안쪽으로 사각형을 겹쳐 색을 덮어쓰는 방식이 가장 간단합니다.\r
    - 화살표는 가운데 가로 줄 1개 + 우측 끝에서 좌상/좌하로 향하는 두 대각선으로 만들 수 있습니다.\r
  check:\r
    noError: 슬라이싱 대입과 figure 평가가 오류 없이 끝나야 합니다.\r
    resultCheck: bullseye[100, 100]이 [0, 0, 255]여야 합니다.\r
`;export{e as default};