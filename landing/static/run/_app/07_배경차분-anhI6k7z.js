var e=`meta:\r
  id: visionFeatures_07\r
  title: 배경 차분으로 움직임 검출\r
  order: 7\r
  category: visionFeatures\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  tags:\r
  - opencv\r
  - 배경차분\r
  - absdiff\r
  - MOG2\r
  - 움직임검출\r
  seo:\r
    title: 비전 특징점 - 배경 차분으로 움직임 검출\r
    description: 두 프레임의 차이로 움직임을 검출하고, MOG2 배경 모델로 정교한 마스크를 만듭니다.\r
    keywords:\r
    - 배경차분\r
    - absdiff\r
    - MOG2\r
    - 움직임검출\r
    - opencv\r
intro:\r
  emoji: 🚦\r
  goal: 영상에서 움직이는 영역만 골라내는 두 가지 방법을 비교합니다.\r
  description: |-\r
    감시 카메라, 행동 검출, 영상 통계 같은 응용은 모두 "이전 프레임과 무엇이 달라졌는지"에서 출발합니다. 이 강의는 단순 차분(absdiff)부터 통계적 배경 모델(MOG2)까지 두 방법을 직접 비교하며 움직임 검출의 기본을 익힙니다.\r
  direction: 두 프레임의 차이를 임곗값으로 마스크화하고, MOG2 모델로 같은 영상에서 더 정교한 결과를 얻습니다.\r
  benefits:\r
  - 두 프레임의 차이를 한 줄로 마스크화할 수 있습니다.\r
  - MOG2 객체로 자기 적응적인 배경 모델을 만들 수 있습니다.\r
  - 두 방법의 장단점을 한 영상에서 비교할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 영상 준비\r
      detail: 움직이는 원이 포함된 합성 영상을 준비합니다.\r
    - label: 2단계. 두 프레임 absdiff\r
      detail: 인접 프레임의 차이로 마스크를 만듭니다.\r
    - label: 3단계. 임곗값 이진화\r
      detail: 노이즈를 거르는 임곗값을 정합니다.\r
    - label: 4단계. MOG2 배경 모델\r
      detail: 한 줄로 통계 기반 마스크를 얻습니다.\r
    - label: 5단계. 결과 비교\r
      detail: 두 방법의 마스크를 시간순으로 그립니다.\r
    runtime:\r
    - label: 비전 환경\r
      detail: opencv-python의 absdiff와 BackgroundSubtractorMOG2를 사용합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: prepare_video\r
  title: 1단계. 영상 준비\r
  structuredPrimary: true\r
  subtitle: 6강에서 만든 영상 재사용\r
  goal: 6강에서 만든 codaro_demo.mp4를 그대로 사용해 환경을 준비합니다.\r
  why: 같은 데이터로 다른 알고리즘을 비교하려면 공통 입력이 필요합니다.\r
  explanation: |-\r
    파일이 존재하지 않으면 즉석에서 같은 형식의 합성 영상을 다시 만듭니다. 강의 6의 흐름과 호환되도록 같은 경로와 같은 해상도를 사용합니다.\r
\r
    영상의 움직이는 객체는 노란 원입니다. 원의 위치가 프레임마다 4픽셀씩 우측으로 이동하므로 차분 마스크에 띠 모양이 나타나야 합니다.\r
  tips:\r
  - 합성 영상을 항상 같은 코드로 재생산할 수 있게 두면 학습 환경이 안정됩니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    import tempfile\r
    from pathlib import Path\r
\r
    videoPath = Path(tempfile.gettempdir()) / 'codaro_demo.mp4'\r
    if not videoPath.exists():\r
        width, height = 320, 240\r
        fps = 24\r
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')\r
        writer = cv2.VideoWriter(str(videoPath), fourcc, fps, (width, height))\r
        for idx in range(60):\r
            frame = np.zeros((height, width, 3), dtype=np.uint8)\r
            intensity = int(255 * idx / 59)\r
            frame[:] = (intensity, 100, 255 - intensity)\r
            cv2.circle(frame, (60 + idx * 4, 120), 20, (0, 255, 255), -1)\r
            writer.write(frame)\r
        writer.release()\r
    videoPath.exists()\r
  exercise:\r
    prompt: VideoCapture로 영상의 총 프레임 수를 다시 확인하세요.\r
    starterCode: |-\r
      cap = cv2.VideoCapture(str(videoPath))\r
      totalFrames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))\r
      cap.___()\r
      totalFrames\r
    hints:\r
    - VideoCapture 사용 후 release를 호출하세요.\r
    - 강의 6에서 만든 영상은 60 프레임입니다.\r
  check:\r
    noError: 영상 준비와 메타데이터 조회가 오류 없이 끝나야 합니다.\r
    resultCheck: videoPath.exists() 가 True여야 합니다.\r
- id: absdiff\r
  title: 2단계. 두 프레임 absdiff\r
  structuredPrimary: true\r
  subtitle: 인접 프레임의 차이\r
  goal: cv2.absdiff로 두 프레임의 절댓값 차이를 계산해 움직임 마스크를 만듭니다.\r
  why: 가장 단순한 방법이며 동작이 직관적이라 차분 결과를 해석하기 좋습니다.\r
  explanation: |-\r
    \`cv2.absdiff(frame1, frame2)\` 는 두 이미지의 픽셀별 절댓값 차이를 반환합니다. 같으면 0, 다르면 큰 값이 됩니다.\r
\r
    그레이로 변환한 뒤 차분하면 노이즈가 줄어들고 연산이 빠릅니다. 컬러 차분은 색이 약간만 변해도 큰 값이 나오므로 일반적으로는 그레이 차분을 씁니다.\r
  tips:\r
  - absdiff의 결과 dtype은 입력과 같습니다. uint8 두 장의 차분 결과도 uint8입니다.\r
  snippet: |-\r
    cap = cv2.VideoCapture(str(videoPath))\r
    ok, prev = cap.read()\r
    ok, current = cap.read()\r
    cap.release()\r
    grayPrev = cv2.cvtColor(prev, cv2.COLOR_BGR2GRAY)\r
    grayCur = cv2.cvtColor(current, cv2.COLOR_BGR2GRAY)\r
    diff = cv2.absdiff(grayPrev, grayCur)\r
    diff.shape, diff.max()\r
  exercise:\r
    prompt: 두 프레임 차분의 평균과 최댓값을 출력하세요.\r
    starterCode: |-\r
      diffMean = float(diff.___())\r
      diffMax = int(diff.___())\r
      diffMean, diffMax\r
    hints:\r
    - 빈칸은 메서드 이름 한 단어입니다.\r
    - 평균은 작고 최댓값은 큰 분포가 일반적입니다.\r
  check:\r
    noError: absdiff와 통계가 오류 없이 끝나야 합니다.\r
    resultCheck: diff가 (높이, 너비) shape의 uint8 배열이어야 합니다.\r
- id: binarize\r
  title: 3단계. 임곗값 이진화\r
  structuredPrimary: true\r
  subtitle: 노이즈 거르는 한 줄\r
  goal: 차분 마스크에 임곗값을 적용해 움직임 영역만 흰색으로 남깁니다.\r
  why: 차분 결과는 회색 톤이므로 그대로 쓰면 노이즈가 섞입니다. 임곗값 한 줄이 마스크를 명확하게 만듭니다.\r
  explanation: |-\r
    \`cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)\` 는 25 미만은 0, 이상은 255로 만듭니다. 임곗값을 낮추면 미세한 움직임도 잡지만 노이즈가 같이 들어옵니다.\r
\r
    적절한 임곗값은 영상마다 다릅니다. 차분 분포를 보고 데이터에 맞게 정합니다.\r
  tips:\r
  - threshold의 첫 반환값은 이진화에 사용된 임곗값 자체입니다.\r
  snippet: |-\r
    _, motionMask = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)\r
    motionMask.sum() / 255\r
  exercise:\r
    prompt: 임곗값을 10과 80으로 각각 적용해 마스크의 흰색 픽셀 개수를 비교하세요.\r
    starterCode: |-\r
      _, lowMask = cv2.threshold(diff, ___, 255, cv2.THRESH_BINARY)\r
      _, highMask = cv2.threshold(diff, ___, 255, cv2.THRESH_BINARY)\r
      lowMask.sum() / 255, highMask.sum() / 255\r
    hints:\r
    - 10이 낮은 임곗값, 80이 높은 임곗값입니다.\r
    - 낮을수록 마스크가 커집니다.\r
  check:\r
    noError: 두 임곗값 적용이 오류 없이 끝나야 합니다.\r
    resultCheck: motionMask가 (높이, 너비) shape의 uint8 배열이어야 합니다.\r
- id: mog2\r
  title: 4단계. MOG2 배경 모델\r
  structuredPrimary: true\r
  subtitle: 한 줄로 적응형 마스크\r
  goal: cv2.createBackgroundSubtractorMOG2로 통계 기반 배경 마스크를 만듭니다.\r
  why: MOG2는 시간이 지나면서 배경을 학습해 카메라가 흔들리거나 조명이 변해도 적응합니다.\r
  explanation: |-\r
    \`bs = cv2.createBackgroundSubtractorMOG2(history=30, varThreshold=16, detectShadows=False)\` 로 객체를 만든 뒤 매 프레임마다 \`mask = bs.apply(frame)\` 을 호출합니다. 처음 몇 프레임은 배경 학습 중이라 마스크가 정확하지 않습니다.\r
\r
    detectShadows=True 이면 그림자를 별도 회색 값으로 표시합니다. 학습용으로는 False가 깔끔합니다.\r
  tips:\r
  - MOG2는 객체 내부가 다 채워지지 않는 경우가 있습니다. 후처리로 닫힘 연산을 적용하면 깔끔해집니다.\r
  snippet: |-\r
    bs = cv2.createBackgroundSubtractorMOG2(history=30, varThreshold=16, detectShadows=False)\r
    cap = cv2.VideoCapture(str(videoPath))\r
    mogMasks = []\r
    while True:\r
        ok, frame = cap.read()\r
        if not ok:\r
            break\r
        mask = bs.apply(frame)\r
        mogMasks.append(mask)\r
    cap.release()\r
    len(mogMasks), mogMasks[-1].shape\r
  exercise:\r
    prompt: 마지막 프레임의 MOG2 마스크를 시각화하세요.\r
    starterCode: |-\r
      finalMask = mogMasks[___]\r
      fig = plt.figure(figsize=(5, 4))\r
      plt.imshow(finalMask, cmap='gray')\r
      plt.title('MOG2 last frame mask')\r
      plt.axis('off')\r
      fig\r
    hints:\r
    - "-1 은 마지막 인덱스입니다."\r
    - 마스크는 흑백입니다.\r
  check:\r
    noError: MOG2 적용이 오류 없이 끝나야 합니다.\r
    resultCheck: len(mogMasks) 가 60 정도여야 합니다.\r
- id: compare\r
  title: 5단계. 두 방법 비교\r
  structuredPrimary: true\r
  subtitle: 마스크 시계열 그리기\r
  goal: absdiff 기반 마스크와 MOG2 마스크를 같은 프레임에서 비교합니다.\r
  why: 두 방법의 강약점은 같은 입력에서 비교해야 분명히 보입니다.\r
  explanation: |-\r
    같은 프레임 인덱스에서 두 마스크를 나란히 두면 어떤 방법이 어떤 종류의 노이즈에 약한지 시각적으로 명확합니다.\r
\r
    합성 영상에서는 두 방법 모두 잘 동작하지만 실제 영상에서는 MOG2가 보통 우위입니다.\r
  tips:\r
  - 합성 영상에서 두 결과가 너무 비슷하면 임곗값을 바꿔 차이를 만들어 보세요.\r
  snippet: |-\r
    cap = cv2.VideoCapture(str(videoPath))\r
    absMasks = []\r
    prevGray = None\r
    while True:\r
        ok, frame = cap.read()\r
        if not ok:\r
            break\r
        cur = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\r
        if prevGray is None:\r
            absMasks.append(np.zeros_like(cur))\r
        else:\r
            d = cv2.absdiff(prevGray, cur)\r
            _, m = cv2.threshold(d, 25, 255, cv2.THRESH_BINARY)\r
            absMasks.append(m)\r
        prevGray = cur\r
    cap.release()\r
    len(absMasks)\r
  exercise:\r
    prompt: '동일 인덱스(예: 30, 45)에서 두 마스크를 2x2 그리드로 비교 출력하세요.'\r
    starterCode: |-\r
      fig, axes = plt.subplots(2, 2, figsize=(8, 6))\r
      for axis, (idx, label) in zip(axes.ravel(), [(30, 'absdiff'), (30, 'MOG2'), (45, 'absdiff'), (45, 'MOG2')]):\r
          mask = absMasks[idx] if label == 'absdiff' else mogMasks[idx]\r
          axis.imshow(mask, cmap='gray')\r
          axis.set_title(f'{label} frame {idx}')\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - zip의 두 번째 인자가 라벨 리스트입니다.\r
    - 같은 프레임의 두 마스크가 다를 수 있습니다.\r
  check:\r
    noError: 비교 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: len(absMasks) 가 len(mogMasks) 와 같아야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 움직임 면적 시계열\r
  goal: 영상 전체에 걸쳐 마스크의 흰색 면적을 시간순으로 그래프로 그립니다.\r
  why: 면적 시계열은 어떤 시점에 객체가 움직였는지를 한눈에 보여줍니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 면적 시계열은 후속 강의의 트래커가 언제 시작·종료해야 하는지 결정하는 단서로도 쓰입니다.\r
  snippet: |-\r
    absAreas = np.array([m.sum() / 255 for m in absMasks])\r
    mogAreas = np.array([m.sum() / 255 for m in mogMasks])\r
    fig = plt.figure(figsize=(8, 3))\r
    plt.plot(absAreas, label='absdiff', alpha=0.8)\r
    plt.plot(mogAreas, label='MOG2', alpha=0.8)\r
    plt.xlabel('frame')\r
    plt.ylabel('motion pixels')\r
    plt.legend()\r
    fig\r
  exercise:\r
    prompt: "미션1: MOG2 마스크의 첫·중간·마지막 프레임을 1x3 그리드로 그리세요. 미션2: absMasks와 mogMasks의 평균 면적을 비교 출력하세요."\r
    starterCode: |-\r
      fig, axes = plt.subplots(1, 3, figsize=(12, 4))\r
      indexes = [0, len(mogMasks) // 2, len(mogMasks) - 1]\r
      for axis, idx in zip(axes, indexes):\r
          axis.imshow(mogMasks[idx], cmap='gray')\r
          axis.set_title(f'MOG2 frame {idx}')\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - "indexes = [0, mid, last] 패턴으로 깔끔하게 나열할 수 있습니다."\r
    - 평균 면적은 .mean() 한 줄입니다.\r
  check:\r
    noError: 면적 계산과 그리기가 오류 없이 끝나야 합니다.\r
    resultCheck: absAreas와 mogAreas의 길이가 같아야 합니다.\r
`;export{e as default};