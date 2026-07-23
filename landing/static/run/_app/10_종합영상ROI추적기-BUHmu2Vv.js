var e=`meta:\r
  id: visionFeatures_10\r
  title: 종합 - 영상 ROI 추적기\r
  order: 10\r
  category: visionFeatures\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-contrib-python\r
  tags:\r
  - opencv\r
  - 종합프로젝트\r
  - ROI추적\r
  - 보고서\r
  - 비디오분석\r
  seo:\r
    title: 비전 특징점 - 종합 영상 ROI 추적기\r
    description: 비디오 IO, 광학 흐름, 트래커, 마스크를 한데 모아 영상 분석 보고서 한 장을 만듭니다.\r
    keywords:\r
    - ROI추적\r
    - 영상분석\r
    - 종합프로젝트\r
    - opencv\r
intro:\r
  emoji: 🧰\r
  goal: 6~9강의 도구를 종합해 영상에서 한 객체를 추적하고 보고서 한 장을 만드는 미니 파이프라인을 구현합니다.\r
  description: |-\r
    이 강의는 트랙의 마무리입니다. ROI 선택 → CSRT 트래커 추적 → 박스 시각화 → 면적·중심 통계까지 한 흐름을 함수로 묶어 다른 영상에도 그대로 적용할 수 있게 만듭니다. 결과는 트래킹된 박스가 그려진 마지막 프레임과 시계열 그래프 한 장으로 요약됩니다.\r
  direction: 영상 + 초기 박스를 입력받아 트래킹 결과와 요약 보고서를 반환하는 함수 trackAndReport를 만듭니다.\r
  benefits:\r
  - 영상 처리 파이프라인을 함수로 묶어 재사용할 수 있습니다.\r
  - 보고서 한 장(마지막 프레임 + 시계열) 으로 트래킹 결과를 요약하는 패턴을 익힙니다.\r
  - 향후 응용 트랙(visionApps) 에서 활용할 수 있는 기본 도구를 만듭니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 입력 표준화\r
      detail: 영상 경로와 박스를 함수 인자로 정리합니다.\r
    - label: 2단계. 트래킹 함수\r
      detail: 한 함수로 박스 시퀀스를 얻습니다.\r
    - label: 3단계. 결과 시각화\r
      detail: 마지막 프레임 + 시계열을 한 figure에 그립니다.\r
    - label: 4단계. 새 영상으로 검증\r
      detail: 다른 이동 패턴의 영상을 만들어 적용합니다.\r
    - label: 5단계. 보고서 함수화\r
      detail: trackAndReport 한 호출에 모든 단계를 모읍니다.\r
    runtime:\r
    - label: 비전 환경\r
      detail: opencv-python의 VideoCapture와 TrackerCSRT를 사용합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: input_spec\r
  title: 1단계. 입력 표준화\r
  structuredPrimary: true\r
  subtitle: 영상과 초기 박스\r
  goal: 영상 파일과 초기 박스를 함수 인자로 통일합니다.\r
  why: 다른 영상에 재사용하려면 함수 시그니처가 분명해야 합니다.\r
  explanation: |-\r
    \`trackBoxes(videoPath, initialBox)\` 가 표준 형식입니다. videoPath는 mp4 경로, initialBox는 (x, y, w, h) 튜플입니다.\r
\r
    기본 영상은 6강에서 만든 codaro_demo.mp4입니다.\r
  tips:\r
  - 함수 인자가 명확할수록 다른 영상으로의 확장이 쉽습니다.\r
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
    defaultBox = (40, 100, 40, 40)\r
    defaultBox\r
  exercise:\r
    prompt: 영상이 존재하는지 검사하는 한 줄을 작성하세요.\r
    starterCode: |-\r
      videoPath.___()\r
    hints:\r
    - 빈칸은 Path 객체의 메서드 이름입니다.\r
    - 결과는 True 여야 합니다.\r
  check:\r
    noError: 영상 준비가 오류 없이 끝나야 합니다.\r
    resultCheck: videoPath.exists() 가 True여야 합니다.\r
- id: tracker_function\r
  title: 2단계. 트래킹 함수\r
  structuredPrimary: true\r
  subtitle: 박스 시퀀스 반환\r
  goal: 함수 한 개에 트래킹 흐름을 묶어 박스 시퀀스를 반환합니다.\r
  why: 트래킹 로직을 함수에 모아야 다른 영상에도 같은 결과를 빠르게 얻을 수 있습니다.\r
  explanation: |-\r
    함수 내부에서 트래커 생성, 첫 프레임 init, 프레임 루프 update를 수행합니다. 결과는 \`(ok, (x, y, w, h))\` 튜플 리스트로 반환합니다.\r
  tips:\r
  - 함수가 영상 파일을 열고 반드시 release를 호출해야 합니다.\r
  snippet: |-\r
    def trackBoxes(path, box):\r
        cap = cv2.VideoCapture(str(path))\r
        ok, firstFrame = cap.read()\r
        if not ok:\r
            cap.release()\r
            return []\r
        tracker = cv2.TrackerCSRT_create()\r
        tracker.init(firstFrame, box)\r
        boxes = [(True, tuple(int(v) for v in box))]\r
        while True:\r
            ok, frame = cap.read()\r
            if not ok:\r
                break\r
            success, newBox = tracker.update(frame)\r
            boxes.append((bool(success), tuple(int(round(v)) for v in newBox)))\r
        cap.release()\r
        return boxes\r
\r
    sequence = trackBoxes(videoPath, defaultBox)\r
    len(sequence), sequence[0], sequence[-1]\r
  exercise:\r
    prompt: 같은 함수를 더 작은 박스 (50, 110, 20, 20) 로 호출하고 결과 길이를 확인하세요.\r
    starterCode: |-\r
      smallSequence = trackBoxes(videoPath, (50, ___, 20, 20))\r
      len(smallSequence)\r
    hints:\r
    - 빈칸은 정수 110입니다.\r
    - 작은 박스에서도 합성 영상은 보통 잘 추적됩니다.\r
  check:\r
    noError: 트래킹 함수 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: len(sequence) 가 60 정도여야 합니다.\r
- id: result_panel\r
  title: 3단계. 결과 시각화\r
  structuredPrimary: true\r
  subtitle: 마지막 프레임 + 시계열\r
  goal: 보고서용 figure 한 장에 마지막 프레임 박스와 중심 시계열을 함께 그립니다.\r
  why: 보고서 한 장이면 시각·정량 정보가 모두 들어 있어 빠르게 결과를 공유할 수 있습니다.\r
  explanation: |-\r
    한 figure에 1x2 subplots를 두고 좌측은 마지막 프레임 + 박스, 우측은 시계열 그래프를 그립니다. matplotlib의 GridSpec을 쓰면 비율을 자유롭게 조절할 수 있지만 여기서는 단순한 1x2로 충분합니다.\r
  tips:\r
  - 시계열에 frame index를 x축으로 두면 시간 흐름이 자연스럽게 보입니다.\r
  snippet: |-\r
    cap = cv2.VideoCapture(str(videoPath))\r
    finalBgr = None\r
    while True:\r
        ok, frame = cap.read()\r
        if not ok:\r
            break\r
        finalBgr = frame\r
    cap.release()\r
    centers = np.array([(b[0] + b[2] / 2, b[1] + b[3] / 2) for _, b in sequence])\r
    finalRgb = cv2.cvtColor(finalBgr, cv2.COLOR_BGR2RGB)\r
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))\r
    boxFinal = sequence[-1][1]\r
    x, y, w, h = boxFinal\r
    drawn = finalRgb.copy()\r
    cv2.rectangle(drawn, (x, y), (x + w, y + h), (0, 255, 0), 2)\r
    axes[0].imshow(drawn)\r
    axes[0].set_title('final box')\r
    axes[0].axis('off')\r
    axes[1].plot(centers[:, 0], label='x')\r
    axes[1].plot(centers[:, 1], label='y')\r
    axes[1].set_xlabel('frame')\r
    axes[1].set_ylabel('center')\r
    axes[1].legend()\r
    fig\r
  exercise:\r
    prompt: 같은 figure에 박스 면적(w*h) 시계열을 새 axes로 추가해 1x3 그리드로 만드세요.\r
    starterCode: |-\r
      areas = np.array([b[2] * b[3] for _, b in sequence])\r
      fig, axes = plt.subplots(1, 3, figsize=(16, 4))\r
      axes[0].imshow(drawn)\r
      axes[0].axis('off')\r
      axes[1].plot(centers[:, 0], label='x')\r
      axes[1].plot(centers[:, 1], label='y')\r
      axes[1].legend()\r
      axes[2].plot(___)\r
      axes[2].set_title('area')\r
      fig\r
    hints:\r
    - axes[2].plot(areas) 가 빈칸의 답입니다.\r
    - 합성 영상에서는 박스 면적이 거의 일정해야 합니다.\r
  check:\r
    noError: 보고서 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: centers의 shape 마지막 차원이 2여야 합니다.\r
- id: new_video\r
  title: 4단계. 새 영상으로 검증\r
  structuredPrimary: true\r
  subtitle: 다른 이동 패턴\r
  goal: 다른 이동 패턴의 영상을 만들어 같은 함수로 추적해 봅니다.\r
  why: 같은 함수가 다른 영상에서도 동작해야 진정한 재사용입니다.\r
  explanation: |-\r
    사선으로 이동하는 원을 그린 영상을 만들고 같은 트래킹 함수를 호출합니다. 박스 시퀀스의 중심 시계열이 사선 모양이 되어야 합니다.\r
  tips:\r
  - 합성 영상을 만들 때 객체의 이동 패턴을 명확히 알면 트래킹 평가가 쉬워집니다.\r
  snippet: |-\r
    diagonalPath = Path(tempfile.gettempdir()) / 'codaro_demo_diag.mp4'\r
    width, height = 320, 240\r
    fps = 24\r
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')\r
    writer = cv2.VideoWriter(str(diagonalPath), fourcc, fps, (width, height))\r
    for idx in range(60):\r
        frame = np.zeros((height, width, 3), dtype=np.uint8)\r
        frame[:] = (40, 40, 40)\r
        cv2.circle(frame, (40 + idx * 4, 40 + idx * 2), 18, (0, 200, 255), -1)\r
        writer.write(frame)\r
    writer.release()\r
    diagSequence = trackBoxes(diagonalPath, (20, 20, 40, 40))\r
    len(diagSequence)\r
  exercise:\r
    prompt: diagSequence의 중심 시계열을 그래프로 그리세요.\r
    starterCode: |-\r
      diagCenters = np.array([(b[0] + b[2] / 2, b[1] + b[3] / 2) for _, b in diagSequence])\r
      fig = plt.figure(figsize=(8, 3))\r
      plt.plot(diagCenters[:, 0], label='x')\r
      plt.plot(diagCenters[:, 1], label='___')\r
      plt.legend()\r
      fig\r
    hints:\r
    - 빈칸은 'y' 입니다.\r
    - 결과는 두 선이 함께 우상향해야 합니다.\r
  check:\r
    noError: 영상 생성과 추적이 오류 없이 끝나야 합니다.\r
    resultCheck: len(diagSequence) 가 60 정도여야 합니다.\r
- id: report_function\r
  title: 5단계. 보고서 함수화\r
  structuredPrimary: true\r
  subtitle: 한 호출에 모든 단계\r
  goal: 트래킹과 보고서 생성을 한 함수 trackAndReport로 묶습니다.\r
  why: 외부 호출자에게 단일 진입점을 제공하면 응용 코드가 단순해집니다.\r
  explanation: |-\r
    \`trackAndReport(path, box)\` 는 박스 시퀀스, 중심 시계열, 보고서 figure 세 가지를 반환합니다. 다음 트랙 visionApps에서 이 함수를 그대로 호출할 수 있습니다.\r
  tips:\r
  - 보고서 함수의 반환을 명확히 정의해 두면 후속 코드가 쉽게 붙습니다.\r
  snippet: |-\r
    def trackAndReport(path, box):\r
        sequenceLocal = trackBoxes(path, box)\r
        if not sequenceLocal:\r
            return [], np.empty((0, 2)), None\r
        centersLocal = np.array([(b[0] + b[2] / 2, b[1] + b[3] / 2) for _, b in sequenceLocal])\r
        cap = cv2.VideoCapture(str(path))\r
        finalBgrLocal = None\r
        while True:\r
            okLocal, frameLocal = cap.read()\r
            if not okLocal:\r
                break\r
            finalBgrLocal = frameLocal\r
        cap.release()\r
        finalRgbLocal = cv2.cvtColor(finalBgrLocal, cv2.COLOR_BGR2RGB) if finalBgrLocal is not None else None\r
        figLocal, axesLocal = plt.subplots(1, 2, figsize=(12, 4))\r
        if finalRgbLocal is not None:\r
            drawnLocal = finalRgbLocal.copy()\r
            x2, y2, w2, h2 = sequenceLocal[-1][1]\r
            cv2.rectangle(drawnLocal, (x2, y2), (x2 + w2, y2 + h2), (0, 255, 0), 2)\r
            axesLocal[0].imshow(drawnLocal)\r
        axesLocal[0].set_title('final box')\r
        axesLocal[0].axis('off')\r
        axesLocal[1].plot(centersLocal[:, 0], label='x')\r
        axesLocal[1].plot(centersLocal[:, 1], label='y')\r
        axesLocal[1].set_xlabel('frame')\r
        axesLocal[1].set_ylabel('center')\r
        axesLocal[1].legend()\r
        return sequenceLocal, centersLocal, figLocal\r
\r
    seqA, centersA, figA = trackAndReport(videoPath, defaultBox)\r
    len(seqA), centersA.shape, figA\r
  exercise:\r
    prompt: trackAndReport를 diagonalPath와 (20, 20, 40, 40) 박스로 다시 호출해 결과 figure를 화면에 표시하세요.\r
    starterCode: |-\r
      seqB, centersB, figB = trackAndReport(diagonalPath, (___, 20, 40, 40))\r
      figB\r
    hints:\r
    - 빈칸은 정수 20입니다.\r
    - figB가 마지막 줄로 평가되면 노트북에서 자동 출력됩니다.\r
  check:\r
    noError: 보고서 함수 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: centersA.shape 의 마지막 차원이 2여야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 여러 영상 비교\r
  goal: 두 영상에 같은 함수를 적용한 결과를 한 화면에 비교합니다.\r
  why: 같은 함수의 결과를 두 입력에서 비교하면 결과 해석이 풍부해집니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 다른 영상 추가는 5단계 합성 영상 코드 패턴을 그대로 활용하면 됩니다.\r
  snippet: |-\r
    seqB, centersB, figB = trackAndReport(diagonalPath, (20, 20, 40, 40))\r
\r
    fig = plt.figure(figsize=(8, 3))\r
    plt.plot(centersA[:, 0], label='video1 x')\r
    plt.plot(centersB[:, 0], label='video2 x')\r
    plt.xlabel('frame')\r
    plt.ylabel('center x')\r
    plt.legend()\r
    fig\r
  exercise:\r
    prompt: "미션1: 두 영상의 박스 면적 시계열을 비교하는 차트를 만드세요. 미션2: 두 영상의 마지막 프레임 박스 좌표를 dict로 정리해 출력하세요."\r
    starterCode: |-\r
      areasA = np.array([b[2] * b[3] for _, b in seqA])\r
      areasB = np.array([b[2] * b[3] for _, b in seqB])\r
      fig = plt.figure(figsize=(8, 3))\r
      plt.plot(areasA, label='video1')\r
      plt.plot(areasB, label='video2')\r
      plt.legend()\r
      fig\r
    hints:\r
    - 마지막 박스 좌표는 sequence[-1][1] 입니다.\r
    - 두 비교 결과가 의미 있게 다르면 함수가 잘 동작한 것입니다.\r
  check:\r
    noError: 비교 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: areasA와 areasB의 길이가 양수여야 합니다.\r
`;export{e as default};