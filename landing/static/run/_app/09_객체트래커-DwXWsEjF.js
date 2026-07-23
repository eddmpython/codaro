var e=`meta:\r
  id: visionFeatures_09\r
  title: 객체 트래커\r
  order: 9\r
  category: visionFeatures\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-contrib-python\r
  tags:\r
  - opencv\r
  - 트래커\r
  - CSRT\r
  - KCF\r
  - 객체추적\r
  seo:\r
    title: 비전 특징점 - 객체 트래커\r
    description: cv2 TrackerCSRT, TrackerKCF로 영상에서 한 객체를 끝까지 추적합니다.\r
    keywords:\r
    - 트래커\r
    - CSRT\r
    - KCF\r
    - 객체추적\r
    - opencv\r
intro:\r
  emoji: 🎯\r
  goal: 영상의 한 객체에 bounding box를 잡아 끝까지 따라가는 트래커를 익힙니다.\r
  description: |-\r
    광학 흐름은 점 단위 추적이고 객체 트래커는 영역 단위 추적입니다. 박스로 객체를 한 번 표시하면 트래커는 매 프레임 박스를 갱신합니다. 이 강의는 CSRT와 KCF 두 트래커를 같은 영상에 적용해 비교합니다.\r
  direction: 첫 프레임에서 박스를 정해 트래커를 초기화하고, 매 프레임 박스를 갱신해 시각화합니다.\r
  benefits:\r
  - cv2.TrackerCSRT, TrackerKCF의 init/update 흐름을 익힙니다.\r
  - 두 트래커의 정확도와 속도 차이를 직접 확인합니다.\r
  - 추적 박스 시퀀스를 시각화하고 분석합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 영상과 초기 박스\r
      detail: 첫 프레임에서 객체 박스를 정합니다.\r
    - label: 2단계. CSRT 트래커 초기화\r
      detail: init 한 번이면 끝입니다.\r
    - label: 3단계. 프레임별 update\r
      detail: 매 프레임 새 박스를 받습니다.\r
    - label: 4단계. KCF 트래커와 비교\r
      detail: 같은 영상에 다른 트래커를 적용합니다.\r
    - label: 5단계. 박스 시퀀스 시각화\r
      detail: 매 프레임 박스를 그려 결과를 확인합니다.\r
    runtime:\r
    - label: 비전 환경\r
      detail: opencv-python의 TrackerCSRT_create, TrackerKCF_create를 사용합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: initial_box\r
  title: 1단계. 영상과 초기 박스\r
  structuredPrimary: true\r
  subtitle: 첫 프레임 객체 박스\r
  goal: 첫 프레임에서 추적할 객체의 (x, y, w, h) 박스를 정합니다.\r
  why: 트래커는 초기 박스를 기준으로 외형 모델을 학습합니다. 박스가 부정확하면 추적도 부정확합니다.\r
  explanation: |-\r
    OpenCV 트래커의 박스 형식은 \`(x, y, w, h)\` 입니다. 화면 좌표 x, y가 좌상단이고 w, h는 가로·세로 크기입니다.\r
\r
    합성 영상의 노란 원은 첫 프레임에 (60, 120) 중심, 반지름 20입니다. 따라서 박스 (40, 100, 40, 40) 정도가 적당합니다.\r
  tips:\r
  - 트래커마다 초기 박스를 약간 크게 또는 작게 잡았을 때 결과가 크게 달라질 수 있습니다.\r
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
    ok, firstFrame = cap.read()\r
    cap.release()\r
    initialBox = (40, 100, 40, 40)\r
    initialBox\r
  exercise:\r
    prompt: 첫 프레임에 박스를 그려 위치가 의도와 맞는지 확인하세요.\r
    starterCode: |-\r
      preview = firstFrame.copy()\r
      x, y, w, h = initialBox\r
      cv2.rectangle(preview, (x, y), (x + w, y + h), (0, 255, 0), 2)\r
      fig = plt.figure(figsize=(5, 4))\r
      plt.imshow(cv2.cvtColor(preview, ___))\r
      plt.axis('off')\r
      fig\r
    hints:\r
    - 빈칸은 색공간 상수입니다.\r
    - 박스가 노란 원을 감싸야 합니다.\r
  check:\r
    noError: 박스 그리기가 오류 없이 끝나야 합니다.\r
    resultCheck: initialBox의 길이가 4여야 합니다.\r
- id: csrt_init\r
  title: 2단계. CSRT 트래커 초기화\r
  structuredPrimary: true\r
  subtitle: 정확도 중심 트래커\r
  goal: TrackerCSRT_create와 init 호출로 트래커를 초기화합니다.\r
  why: CSRT는 OpenCV가 제공하는 트래커 중 정확도가 가장 높습니다.\r
  explanation: |-\r
    \`cv2.TrackerCSRT_create()\` 로 객체를 만들고 \`tracker.init(firstFrame, initialBox)\` 로 첫 프레임의 박스를 학습시킵니다. init 호출은 한 번뿐이고 이후에는 update만 호출합니다.\r
\r
    OpenCV 버전에 따라 일부 트래커는 cv2.legacy 네임스페이스에 있을 수 있습니다. CSRT는 cv2 메인에서 보통 사용 가능합니다.\r
  tips:\r
  - init 직후 첫 update의 결과는 입력 박스와 거의 같습니다. 모델이 처음 적용되는 시점입니다.\r
  snippet: |-\r
    tracker = cv2.TrackerCSRT_create()\r
    tracker.init(firstFrame, initialBox)\r
    type(tracker).__name__\r
  exercise:\r
    prompt: 같은 트래커 객체를 다시 만들어 새 박스(60, 110, 30, 30)로 초기화한 secondaryTracker를 만드세요.\r
    starterCode: |-\r
      secondaryTracker = cv2.TrackerCSRT_create()\r
      secondaryTracker.init(firstFrame, (60, ___, 30, 30))\r
      type(secondaryTracker).__name__\r
    hints:\r
    - 빈칸은 정수 110입니다.\r
    - init은 부울을 반환하지만 보통은 무시합니다.\r
  check:\r
    noError: 트래커 초기화가 오류 없이 끝나야 합니다.\r
    resultCheck: 트래커 타입 이름에 'CSRT'가 들어가야 합니다.\r
- id: update_loop\r
  title: 3단계. 프레임별 update\r
  structuredPrimary: true\r
  subtitle: 매 프레임 박스 갱신\r
  goal: 영상의 모든 프레임을 돌면서 tracker.update로 새 박스를 받습니다.\r
  why: 추적 결과를 모아 시각화하거나 분석할 수 있습니다.\r
  explanation: |-\r
    \`ok, box = tracker.update(frame)\` 가 표준 호출입니다. ok가 False면 추적 실패입니다. box는 float 튜플 \`(x, y, w, h)\` 입니다.\r
\r
    실패 후에도 update를 계속 호출하면 잘못된 결과가 누적될 수 있습니다. 보통은 추적 실패 시 객체를 다시 검출하는 재초기화 로직을 둡니다.\r
  tips:\r
  - 박스 좌표가 영상 경계를 벗어나면 그리기 전에 clip 처리를 하는 것이 안전합니다.\r
  snippet: |-\r
    cap = cv2.VideoCapture(str(videoPath))\r
    boxesCsrt = []\r
    while True:\r
        ok, frame = cap.read()\r
        if not ok:\r
            break\r
        success, box = tracker.update(frame)\r
        boxesCsrt.append((bool(success), tuple(int(round(value)) for value in box)))\r
    cap.release()\r
    len(boxesCsrt), boxesCsrt[0], boxesCsrt[-1]\r
  exercise:\r
    prompt: 추적 실패가 한 번이라도 있었는지 확인하세요.\r
    starterCode: |-\r
      failures = [b for ok, b in boxesCsrt if not ___]\r
      len(failures)\r
    hints:\r
    - 빈칸은 ok 변수입니다.\r
    - 합성 영상은 객체가 단순해 실패가 없을 가능성이 높습니다.\r
  check:\r
    noError: 트래커 update 루프가 오류 없이 끝나야 합니다.\r
    resultCheck: len(boxesCsrt) 가 0보다 커야 합니다.\r
- id: kcf_compare\r
  title: 4단계. KCF 트래커\r
  structuredPrimary: true\r
  subtitle: 속도 중심 트래커\r
  goal: TrackerKCF_create로 같은 영상에 KCF를 적용해 결과를 비교합니다.\r
  why: 두 트래커의 결과 차이를 비교해야 응용 상황에 맞는 트래커를 고를 수 있습니다.\r
  explanation: |-\r
    \`cv2.TrackerKCF_create()\` 로 객체를 만들고 같은 init/update 흐름을 따릅니다. KCF는 CSRT보다 빠르지만 외형 변화에 약합니다.\r
\r
    합성 영상은 외형 변화가 거의 없으므로 두 트래커가 비슷한 결과를 낼 수 있습니다. 실제 영상에서는 차이가 분명해집니다.\r
  tips:\r
  - KCF가 일부 환경에서 cv2.legacy.TrackerKCF_create로만 제공되는 경우가 있습니다. 에러가 나면 그 네임스페이스를 시도하세요.\r
  snippet: |-\r
    kcfTracker = cv2.TrackerKCF_create()\r
    kcfTracker.init(firstFrame, initialBox)\r
    cap = cv2.VideoCapture(str(videoPath))\r
    boxesKcf = []\r
    while True:\r
        ok, frame = cap.read()\r
        if not ok:\r
            break\r
        success, box = kcfTracker.update(frame)\r
        boxesKcf.append((bool(success), tuple(int(round(value)) for value in box)))\r
    cap.release()\r
    len(boxesKcf), boxesKcf[0], boxesKcf[-1]\r
  exercise:\r
    prompt: 두 트래커의 마지막 프레임 박스 중심을 비교하세요.\r
    starterCode: |-\r
      def center(box):\r
          x, y, w, h = box\r
          return (x + w / 2, y + h / 2)\r
\r
      csrtCenter = center(boxesCsrt[-1][1])\r
      kcfCenter = center(boxesKcf[-1][1])\r
      csrtCenter, ___\r
    hints:\r
    - 빈칸은 kcfCenter 변수명입니다.\r
    - 두 중심이 매우 가까우면 합성 영상에서 두 트래커가 비슷하게 동작한 것입니다.\r
  check:\r
    noError: KCF 적용이 오류 없이 끝나야 합니다.\r
    resultCheck: len(boxesKcf) 가 len(boxesCsrt) 와 같아야 합니다.\r
- id: visualize\r
  title: 5단계. 박스 시퀀스 시각화\r
  structuredPrimary: true\r
  subtitle: 시간순으로 박스 보기\r
  goal: 영상의 일부 프레임에 추적 박스를 그려 시간순으로 시각화합니다.\r
  why: 트래킹의 품질은 시각화로 한눈에 평가됩니다.\r
  explanation: |-\r
    같은 영상에서 첫·중간·마지막 프레임을 가져와 박스를 그립니다. 박스가 객체를 잘 따라가면 트래커가 잘 동작한 것입니다.\r
  tips:\r
  - 박스가 객체 밖으로 새는 경우 init 박스가 너무 작거나 너무 크지 않은지 다시 검토하세요.\r
  snippet: |-\r
    cap = cv2.VideoCapture(str(videoPath))\r
    snapshots = {}\r
    targetIdx = {0, 30, 59}\r
    idx = 0\r
    while True:\r
        ok, frame = cap.read()\r
        if not ok:\r
            break\r
        if idx in targetIdx:\r
            snapshots[idx] = frame\r
        idx += 1\r
    cap.release()\r
    fig, axes = plt.subplots(1, 3, figsize=(12, 4))\r
    for axis, key in zip(axes, sorted(snapshots)):\r
        previewFrame = snapshots[key].copy()\r
        ok, box = boxesCsrt[key]\r
        x, y, w, h = box\r
        cv2.rectangle(previewFrame, (x, y), (x + w, y + h), (0, 255, 0), 2)\r
        axis.imshow(cv2.cvtColor(previewFrame, cv2.COLOR_BGR2RGB))\r
        axis.set_title(f'CSRT frame {key}')\r
        axis.axis('off')\r
    fig\r
  exercise:\r
    prompt: 같은 세 프레임에 KCF 박스를 그려 1x3 그리드로 비교 출력하세요.\r
    starterCode: |-\r
      fig2, axes2 = plt.subplots(1, 3, figsize=(12, 4))\r
      for axis, key in zip(axes2, sorted(snapshots)):\r
          previewFrame = snapshots[key].copy()\r
          ok, box = boxesKcf[___]\r
          x, y, w, h = box\r
          cv2.rectangle(previewFrame, (x, y), (x + w, y + h), (255, 0, 0), 2)\r
          axis.imshow(cv2.cvtColor(previewFrame, cv2.COLOR_BGR2RGB))\r
          axis.set_title(f'KCF frame {key}')\r
          axis.axis('off')\r
      fig2\r
    hints:\r
    - 빈칸은 key 변수입니다.\r
    - CSRT는 녹색, KCF는 빨강으로 구분합니다.\r
  check:\r
    noError: 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: snapshots에 0, 30, 59 키가 모두 있어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 트래커 비교 보고서\r
  goal: 두 트래커의 박스 중심을 시계열로 그려 비교합니다.\r
  why: 시계열 비교는 시각 비교보다 정량적입니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 시계열 차이가 크면 두 트래커 중 어느 쪽이 진실에 더 가까운지 분리해 평가해야 합니다.\r
  snippet: |-\r
    csrtCenters = np.array([(b[0] + b[2] / 2, b[1] + b[3] / 2) for _, b in boxesCsrt])\r
    kcfCenters = np.array([(b[0] + b[2] / 2, b[1] + b[3] / 2) for _, b in boxesKcf])\r
    fig = plt.figure(figsize=(8, 3))\r
    plt.plot(csrtCenters[:, 0], label='CSRT x', color='green')\r
    plt.plot(kcfCenters[:, 0], label='KCF x', color='red')\r
    plt.xlabel('frame')\r
    plt.ylabel('center x')\r
    plt.legend()\r
    fig\r
  exercise:\r
    prompt: "미션1: y 중심도 같은 차트에 비교 그리세요(점선 등으로 구분). 미션2: 두 트래커의 박스 면적(w*h)을 시계열로 그리세요."\r
    starterCode: |-\r
      fig = plt.figure(figsize=(8, 3))\r
      plt.plot(csrtCenters[:, 1], label='CSRT y', color='green', linestyle='dotted')\r
      plt.plot(kcfCenters[:, 1], label='KCF y', color='red', linestyle='dotted')\r
      plt.xlabel('frame')\r
      plt.ylabel('center y')\r
      plt.legend()\r
      fig\r
    hints:\r
    - linestyle 인자로 점선을 만들 수 있습니다.\r
    - 면적은 list comprehension 한 줄로 계산할 수 있습니다.\r
  check:\r
    noError: 시계열 그리기가 오류 없이 끝나야 합니다.\r
    resultCheck: csrtCenters와 kcfCenters의 모양이 같아야 합니다.\r
`;export{e as default};