var e=`meta:\r
  id: visionFeatures_08\r
  title: 광학 흐름으로 점 추적\r
  order: 8\r
  category: visionFeatures\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 중급\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  tags:\r
  - opencv\r
  - 광학흐름\r
  - opticalflow\r
  - LucasKanade\r
  - 트래킹\r
  seo:\r
    title: 비전 특징점 - 광학 흐름으로 점 추적\r
    description: Lucas-Kanade 광학 흐름으로 영상에서 코너점이 다음 프레임의 어디로 이동했는지 추적합니다.\r
    keywords:\r
    - 광학흐름\r
    - opticalflow\r
    - LucasKanade\r
    - 트래킹\r
    - opencv\r
intro:\r
  emoji: 🌊\r
  goal: 영상에서 같은 점이 시간이 지나면서 어디로 이동하는지 추적하는 광학 흐름을 익힙니다.\r
  description: |-\r
    배경 차분은 어디가 움직였는지 알려주지만 같은 점이 어디로 갔는지는 알려주지 못합니다. 광학 흐름(optical flow) 은 첫 프레임의 점들을 다음 프레임에서 추적해 운동 궤적을 만듭니다. 이 강의는 Lucas-Kanade pyrLK로 점 추적의 기본을 익힙니다.\r
  direction: 첫 프레임의 코너점을 모아 매 프레임마다 새 위치를 계산해 추적 궤적을 그립니다.\r
  benefits:\r
  - cv2.calcOpticalFlowPyrLK로 점들의 다음 위치를 한 줄로 얻습니다.\r
  - status 배열로 추적 실패한 점을 거를 수 있습니다.\r
  - 궤적을 시각화해 영상 위에 움직임을 그릴 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 첫 프레임 코너 추출\r
      detail: goodFeaturesToTrack로 추적 시작점 만들기.\r
    - label: 2단계. 인접 프레임 흐름 계산\r
      detail: pyrLK로 다음 위치를 얻기.\r
    - label: 3단계. status로 실패 점 제외\r
      detail: 잃어버린 점을 제거.\r
    - label: 4단계. 궤적 누적\r
      detail: 모든 프레임의 위치를 모읍니다.\r
    - label: 5단계. 영상 위에 궤적 그리기\r
      detail: 마지막 프레임에 궤적을 시각화합니다.\r
    runtime:\r
    - label: 비전 환경\r
      detail: opencv-python의 calcOpticalFlowPyrLK를 사용합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: first_corners\r
  title: 1단계. 첫 프레임 코너 추출\r
  structuredPrimary: true\r
  subtitle: 추적의 시작점\r
  goal: 첫 프레임에서 추적할 코너점들을 goodFeaturesToTrack으로 얻습니다.\r
  why: 광학 흐름의 입력은 정확한 좌표를 가진 코너점입니다.\r
  explanation: |-\r
    1강에서 본 \`cv2.goodFeaturesToTrack\` 의 결과가 그대로 pyrLK 입력으로 들어갑니다. 형식이 \`(N, 1, 2) float32\` 이므로 변환 없이 사용 가능합니다.\r
\r
    합성 영상에는 노란 원이 있으므로 원 가장자리의 코너가 자동으로 검출됩니다.\r
  tips:\r
  - 첫 프레임에 코너가 적게 잡히면 추적이 짧게 끝납니다. qualityLevel을 낮춰 더 많은 코너를 받아 두세요.\r
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
\r
    cap = cv2.VideoCapture(str(videoPath))\r
    ok, firstBgr = cap.read()\r
    cap.release()\r
    firstGray = cv2.cvtColor(firstBgr, cv2.COLOR_BGR2GRAY)\r
    startPoints = cv2.goodFeaturesToTrack(firstGray, maxCorners=40, qualityLevel=0.01, minDistance=10)\r
    startPoints.shape\r
  exercise:\r
    prompt: 첫 프레임의 코너를 시각화하세요.\r
    starterCode: |-\r
      pts = startPoints.reshape(-1, 2)\r
      fig = plt.figure(figsize=(5, 4))\r
      plt.imshow(cv2.cvtColor(firstBgr, cv2.COLOR_BGR2RGB))\r
      plt.scatter(pts[:, 0], pts[:, 1], s=30, c='lime', edgecolors='black')\r
      plt.title(f'{len(pts)} starting points')\r
      plt.axis('off')\r
      fig\r
    hints:\r
    - "reshape(-1, 2) 표준 패턴입니다."\r
    - 코너는 원 가장자리에 모여 있어야 합니다.\r
  check:\r
    noError: 첫 프레임 코너 추출이 오류 없이 끝나야 합니다.\r
    resultCheck: startPoints.shape의 마지막 차원이 2여야 합니다.\r
- id: pyrLK\r
  title: 2단계. pyrLK로 흐름 계산\r
  structuredPrimary: true\r
  subtitle: 한 줄로 다음 위치\r
  goal: cv2.calcOpticalFlowPyrLK로 다음 프레임에서 각 점의 새 위치를 얻습니다.\r
  why: pyrLK는 가벼우면서도 잘 동작하는 표준 광학 흐름 알고리즘입니다.\r
  explanation: |-\r
    \`cv2.calcOpticalFlowPyrLK(prevGray, curGray, prevPts, None)\` 는 \`(newPoints, status, error)\` 를 반환합니다. status는 (N, 1) 모양의 uint8 배열로 추적 성공이면 1, 실패면 0입니다.\r
\r
    Lucas-Kanade는 이미지 피라미드를 만들어 큰 움직임도 안정적으로 추적합니다.\r
  tips:\r
  - 추적 결과는 float32 좌표입니다. 그리기 전에 int로 변환하면 됩니다.\r
  snippet: |-\r
    cap = cv2.VideoCapture(str(videoPath))\r
    ok, firstBgr = cap.read()\r
    ok, secondBgr = cap.read()\r
    cap.release()\r
    firstGray = cv2.cvtColor(firstBgr, cv2.COLOR_BGR2GRAY)\r
    secondGray = cv2.cvtColor(secondBgr, cv2.COLOR_BGR2GRAY)\r
    newPoints, status, error = cv2.calcOpticalFlowPyrLK(firstGray, secondGray, startPoints, None)\r
    newPoints.shape, status.sum(), status.shape\r
  exercise:\r
    prompt: 첫 점과 새 위치의 거리를 계산하세요(첫 5개만).\r
    starterCode: |-\r
      diff = newPoints.reshape(-1, 2) - startPoints.reshape(-1, 2)\r
      distances = np.sqrt((diff ** 2).sum(axis=___))\r
      distances[:5]\r
    hints:\r
    - axis=1로 행 단위 합을 구해 점별 거리가 됩니다.\r
    - 영상의 객체가 이동했다면 일부 점에서 큰 거리가 나옵니다.\r
  check:\r
    noError: pyrLK 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: newPoints.shape 가 startPoints.shape 와 같아야 합니다.\r
- id: status_filter\r
  title: 3단계. status로 실패 점 제외\r
  structuredPrimary: true\r
  subtitle: 잃어버린 점 거르기\r
  goal: status가 1인 점만 골라 다음 단계로 넘깁니다.\r
  why: 추적 실패 점을 남기면 거짓 궤적이 그려집니다.\r
  explanation: |-\r
    status를 bool 마스크로 변환해 인덱싱하면 살아남은 점들만 남습니다. 다음 프레임의 입력으로 이 점들을 그대로 사용합니다.\r
\r
    추적이 실패하는 원인은 점이 화면을 벗어났거나 텍스처가 부족한 영역으로 이동한 경우입니다.\r
  tips:\r
  - status는 (N, 1) 모양이므로 squeeze() 또는 .ravel() 로 1차원으로 만든 뒤 인덱싱에 씁니다.\r
  snippet: |-\r
    aliveMask = status.ravel() == 1\r
    survivors = newPoints[aliveMask]\r
    int(aliveMask.sum()), survivors.shape\r
  exercise:\r
    prompt: 실패한 점만 따로 모아 deadPoints를 만드세요.\r
    starterCode: |-\r
      deadMask = status.ravel() == ___\r
      deadPoints = startPoints[deadMask]\r
      int(deadMask.sum()), deadPoints.shape\r
    hints:\r
    - 실패는 0입니다.\r
    - 합성 영상에서는 실패가 거의 없을 수 있습니다(0이어도 정상).\r
  check:\r
    noError: 마스크 인덱싱이 오류 없이 끝나야 합니다.\r
    resultCheck: survivors.shape의 마지막 차원이 2여야 합니다.\r
- id: accumulate\r
  title: 4단계. 궤적 누적\r
  structuredPrimary: true\r
  subtitle: 모든 프레임의 좌표를 모으기\r
  goal: 영상 전체를 돌면서 각 추적 점의 좌표를 모읍니다.\r
  why: 궤적은 매 프레임 좌표의 시계열입니다. 시각화와 분석의 입력입니다.\r
  explanation: |-\r
    딕셔너리로 점 인덱스 → 좌표 리스트를 관리하는 것이 한 가지 방법입니다. 점이 도중에 사라지면 그 점의 리스트는 거기서 끝납니다.\r
\r
    좌표는 (x, y) float입니다. 정수 변환은 시각화 시점에만 합니다.\r
  tips:\r
  - 궤적 데이터는 list of arrays 또는 dict로 다루면 추가 분석이 쉽습니다.\r
  snippet: |-\r
    cap = cv2.VideoCapture(str(videoPath))\r
    ok, baseBgr = cap.read()\r
    baseGray = cv2.cvtColor(baseBgr, cv2.COLOR_BGR2GRAY)\r
    currentPoints = startPoints\r
    tracks = {idx: [tuple(point.ravel())] for idx, point in enumerate(currentPoints)}\r
    aliveIdx = list(tracks.keys())\r
    while True:\r
        ok, frame = cap.read()\r
        if not ok:\r
            break\r
        nextGray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\r
        nextPts, status, _ = cv2.calcOpticalFlowPyrLK(baseGray, nextGray, currentPoints, None)\r
        alive = status.ravel() == 1\r
        currentPoints = nextPts[alive]\r
        newAliveIdx = [aliveIdx[i] for i, flag in enumerate(alive) if flag]\r
        for trackIdx, point in zip(newAliveIdx, currentPoints):\r
            tracks[trackIdx].append(tuple(point.ravel()))\r
        aliveIdx = newAliveIdx\r
        baseGray = nextGray\r
    cap.release()\r
    len(tracks), max(len(path) for path in tracks.values())\r
  exercise:\r
    prompt: 가장 긴 궤적의 좌표 시퀀스 첫 5개를 출력하세요.\r
    starterCode: |-\r
      longestIdx = max(tracks, key=lambda key: len(tracks[key]))\r
      tracks[longestIdx][:___]\r
    hints:\r
    - 빈칸은 정수 5입니다.\r
    - 결과는 (x, y) 튜플 다섯 개입니다.\r
  check:\r
    noError: 궤적 누적 루프가 오류 없이 끝나야 합니다.\r
    resultCheck: tracks의 일부 점 궤적 길이가 1보다 커야 합니다.\r
- id: draw_tracks\r
  title: 5단계. 영상 위에 궤적 그리기\r
  structuredPrimary: true\r
  subtitle: 마지막 프레임에 선 그리기\r
  goal: 마지막 프레임 이미지 위에 모든 궤적을 선으로 그립니다.\r
  why: 궤적 시각화는 광학 흐름 결과의 정성적 평가에서 가장 빠른 방법입니다.\r
  explanation: |-\r
    각 점의 좌표 시퀀스를 두 점씩 묶어 선분으로 그립니다. matplotlib의 plot은 (x 리스트, y 리스트) 인자로 한 줄을 그립니다.\r
  tips:\r
  - 점이 많으면 선이 빽빽해 보기 어려워집니다. 길이가 일정 이상인 궤적만 그리는 것이 좋습니다.\r
  snippet: |-\r
    cap = cv2.VideoCapture(str(videoPath))\r
    finalBgr = None\r
    while True:\r
        ok, frame = cap.read()\r
        if not ok:\r
            break\r
        finalBgr = frame\r
    cap.release()\r
    finalRgb = cv2.cvtColor(finalBgr, cv2.COLOR_BGR2RGB)\r
    fig = plt.figure(figsize=(7, 5))\r
    plt.imshow(finalRgb)\r
    for path in tracks.values():\r
        if len(path) < 3:\r
            continue\r
        xs = [pt[0] for pt in path]\r
        ys = [pt[1] for pt in path]\r
        plt.plot(xs, ys, color='yellow', linewidth=1.2)\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 궤적 길이가 30 이상인 점들만 굵은 빨강선으로 다시 그리세요.\r
    starterCode: |-\r
      fig2 = plt.figure(figsize=(7, 5))\r
      plt.imshow(finalRgb)\r
      for path in tracks.values():\r
          if len(path) < ___:\r
              continue\r
          xs = [pt[0] for pt in path]\r
          ys = [pt[1] for pt in path]\r
          plt.plot(xs, ys, color='red', linewidth=2)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 빈칸은 정수 30입니다.\r
    - 합성 영상에서는 노란 원이 우측으로 이동한 궤적이 도드라집니다.\r
  check:\r
    noError: 궤적 그리기가 오류 없이 끝나야 합니다.\r
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 궤적 통계 분석\r
  goal: 모든 궤적의 누적 이동 거리를 계산하고 분포를 그립니다.\r
  why: 궤적 통계는 무엇이 빠르게 움직였는지, 어떤 객체가 천천히 움직였는지 정량화합니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 누적 거리는 연속된 두 점 사이 거리의 합입니다.\r
  snippet: |-\r
    def trackLength(path):\r
        if len(path) < 2:\r
            return 0.0\r
        arr = np.array(path)\r
        diffs = np.diff(arr, axis=0)\r
        return float(np.sqrt((diffs ** 2).sum(axis=1)).sum())\r
\r
    lengths = np.array([trackLength(path) for path in tracks.values()])\r
    fig = plt.figure(figsize=(7, 3))\r
    plt.hist(lengths, bins=20, color='steelblue')\r
    plt.xlabel('cumulative distance')\r
    plt.ylabel('count')\r
    fig\r
  exercise:\r
    prompt: "미션1: 길이 상위 5개 궤적의 좌표 시퀀스를 영상 위에 색깔별로 다른 선으로 그리세요. 미션2: 평균과 중앙값 길이를 출력하세요."\r
    starterCode: |-\r
      sortedIdx = sorted(tracks, key=lambda key: -trackLength(tracks[key]))[:5]\r
      palette = ['red', 'green', 'blue', 'orange', 'magenta']\r
      fig = plt.figure(figsize=(7, 5))\r
      plt.imshow(finalRgb)\r
      for trackIdx, color in zip(sortedIdx, palette):\r
          path = tracks[trackIdx]\r
          xs = [pt[0] for pt in path]\r
          ys = [pt[1] for pt in path]\r
          plt.plot(xs, ys, color=color, linewidth=2)\r
      plt.axis('off')\r
      fig\r
    hints:\r
    - 상위 정렬은 -length 키로 내림차순입니다.\r
    - "중앙값은 np.median(lengths) 한 줄입니다."\r
  check:\r
    noError: 궤적 통계와 그리기가 오류 없이 끝나야 합니다.\r
    resultCheck: lengths의 길이가 tracks의 점 개수와 같아야 합니다.\r
`;export{e as default};