var e=`meta:\r
  id: visionFeatures_06\r
  title: 비디오 입출력\r
  order: 6\r
  category: visionFeatures\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  tags:\r
  - opencv\r
  - 비디오\r
  - VideoCapture\r
  - VideoWriter\r
  - 프레임\r
  seo:\r
    title: 비전 특징점 - 비디오 입출력\r
    description: cv2.VideoWriter로 합성 mp4를 만들고 VideoCapture로 한 프레임씩 읽습니다.\r
    keywords:\r
    - opencv\r
    - 비디오\r
    - VideoCapture\r
    - VideoWriter\r
    - 프레임\r
intro:\r
  emoji: 🎞\r
  goal: 비디오 파일을 만들고 프레임 단위로 읽는 OpenCV의 표준 입출력을 익힙니다.\r
  description: |-\r
    이 강의는 visionFeatures 트랙의 비디오 파트를 여는 입문 강의입니다. 외부 동영상에 의존하지 않도록 numpy로 합성 프레임을 만들어 mp4로 저장하고, 다시 읽어 한 프레임씩 분석하는 흐름을 배웁니다. 다음 강의들의 모든 영상 처리가 이 패턴 위에서 동작합니다.\r
  direction: 합성 mp4를 만든 뒤 VideoCapture로 한 프레임씩 읽어 분석합니다.\r
  benefits:\r
  - cv2.VideoWriter로 mp4 파일을 만들 수 있습니다.\r
  - cv2.VideoCapture로 프레임을 한 장씩 읽을 수 있습니다.\r
  - 프레임 인덱스, FPS, 총 프레임 수 등 메타데이터를 읽을 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 임시 경로 준비\r
      detail: OS temp 디렉터리에 mp4 경로를 만듭니다.\r
    - label: 2단계. VideoWriter 만들기\r
      detail: fourcc, fps, frame size를 정합니다.\r
    - label: 3단계. 합성 프레임 쓰기\r
      detail: 색이 천천히 변하는 프레임을 N장 기록합니다.\r
    - label: 4단계. VideoCapture로 메타데이터\r
      detail: fps, 총 프레임, 크기를 읽습니다.\r
    - label: 5단계. 프레임 루프와 시각화\r
      detail: 한 프레임씩 가져와 분석합니다.\r
    runtime:\r
    - label: 비전 환경\r
      detail: opencv-python의 VideoWriter/VideoCapture를 사용합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: temp_path\r
  title: 1단계. 임시 경로 준비\r
  structuredPrimary: true\r
  subtitle: OS temp 디렉터리에 mp4 경로\r
  goal: OS temp 디렉터리에 동영상 파일 경로를 만듭니다.\r
  why: 학습 산출물이 저장소 루트를 오염시키지 않도록 OS 임시 경로에 둡니다.\r
  explanation: |-\r
    \`Path(tempfile.gettempdir()) / 'codaro_demo.mp4'\` 가 표준 패턴입니다. 학습용 동영상은 학습이 끝나면 삭제해도 되므로 OS가 관리하는 임시 디렉터리가 적합합니다.\r
\r
    macOS는 보통 \`/var/folders/...\`, Windows는 \`C:\\Users\\...\\AppData\\Local\\Temp\\\`, Linux는 \`/tmp\` 입니다.\r
  tips:\r
  - 임시 파일 경로는 Path 객체로 다루면 join과 출력이 깔끔합니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    import tempfile\r
    from pathlib import Path\r
\r
    videoPath = Path(tempfile.gettempdir()) / 'codaro_demo.mp4'\r
    str(videoPath)\r
  exercise:\r
    prompt: 별도 파일명 codaro_demo2.mp4를 가리키는 secondaryPath를 만드세요.\r
    starterCode: |-\r
      secondaryPath = Path(tempfile.gettempdir()) / ___\r
      str(secondaryPath)\r
    hints:\r
    - 빈칸은 따옴표를 포함한 파일명입니다.\r
    - 결과는 OS 임시 디렉터리 안의 두 번째 경로 문자열입니다.\r
  check:\r
    noError: 경로 생성이 오류 없이 끝나야 합니다.\r
    resultCheck: 결과 문자열이 'codaro_demo.mp4'로 끝나야 합니다.\r
- id: writer\r
  title: 2단계. VideoWriter 만들기\r
  structuredPrimary: true\r
  subtitle: fourcc, fps, frame size\r
  goal: VideoWriter 객체를 만들어 동영상 파일을 쓸 준비를 합니다.\r
  why: VideoWriter의 인자가 출력 동영상의 포맷·속도·해상도를 모두 결정합니다.\r
  explanation: |-\r
    \`cv2.VideoWriter_fourcc(*'mp4v')\` 는 mp4 코덱 코드입니다. \`cv2.VideoWriter(path, fourcc, fps, (w, h))\` 로 객체를 만듭니다. (w, h) 는 (가로, 세로) 순서입니다(이미지와 반대).\r
\r
    \`writer.isOpened()\` 가 False면 코덱이 시스템에 없는 등의 이유로 파일이 열리지 않은 것입니다.\r
  tips:\r
  - VideoWriter의 frame size는 모든 프레임이 동일해야 합니다. 다른 크기 프레임을 쓰면 무시되거나 깨집니다.\r
  snippet: |-\r
    width, height = 320, 240\r
    fps = 24\r
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')\r
    writer = cv2.VideoWriter(str(videoPath), fourcc, fps, (width, height))\r
    writer.isOpened()\r
  exercise:\r
    prompt: fps를 30으로, 크기를 (640, 360)으로 바꾼 writerHd를 만드세요(파일명은 secondaryPath).\r
    starterCode: |-\r
      writerHd = cv2.VideoWriter(str(secondaryPath), fourcc, ___, (___, ___))\r
      writerHd.isOpened()\r
    hints:\r
    - fps는 정수입니다.\r
    - 가로 세로 순서를 헷갈리지 마세요.\r
  check:\r
    noError: VideoWriter 생성이 오류 없이 끝나야 합니다.\r
    resultCheck: writer.isOpened() 가 True여야 합니다.\r
- id: write_frames\r
  title: 3단계. 합성 프레임 쓰기\r
  structuredPrimary: true\r
  subtitle: 천천히 변하는 색 프레임\r
  goal: 색이 천천히 변하는 합성 프레임 N장을 동영상에 기록합니다.\r
  why: 학습용 동영상을 외부 파일 없이 만들 수 있다는 점이 핵심입니다.\r
  explanation: |-\r
    각 프레임을 numpy로 만들어 \`writer.write(frame)\` 으로 추가합니다. OpenCV는 BGR을 기대하므로 색을 정할 때 (B, G, R) 순서로 채웁니다.\r
\r
    마지막에 \`writer.release()\` 를 호출해 버퍼를 비우고 파일을 닫습니다. 호출하지 않으면 파일이 깨집니다.\r
  tips:\r
  - 프레임마다 변화를 한 픽셀이라도 주면 다음 강의의 차분 검출에서 의미 있는 결과가 나옵니다.\r
  snippet: |-\r
    totalFrames = 60\r
    for idx in range(totalFrames):\r
        frame = np.zeros((height, width, 3), dtype=np.uint8)\r
        intensity = int(255 * idx / max(totalFrames - 1, 1))\r
        frame[:] = (intensity, 100, 255 - intensity)\r
        cv2.circle(frame, (60 + idx * 4, 120), 20, (0, 255, 255), -1)\r
        writer.write(frame)\r
    writer.release()\r
    videoPath.exists(), videoPath.stat().st_size\r
  exercise:\r
    prompt: writerHd에도 같은 패턴으로 90 프레임을 쓰고 파일 크기를 확인하세요.\r
    starterCode: |-\r
      hdFrames = ___\r
      for idx in range(hdFrames):\r
          frame = np.zeros((360, 640, 3), dtype=np.uint8)\r
          intensity = int(255 * idx / max(hdFrames - 1, 1))\r
          frame[:] = (intensity, 50, 255 - intensity)\r
          writerHd.write(frame)\r
      writerHd.release()\r
      secondaryPath.exists(), secondaryPath.stat().st_size\r
    hints:\r
    - 정수 90을 빈칸에 넣으세요.\r
    - 파일 크기는 코덱 압축률에 따라 달라집니다.\r
  check:\r
    noError: write/release 루프가 오류 없이 끝나야 합니다.\r
    resultCheck: videoPath의 파일 크기가 0보다 커야 합니다.\r
- id: capture_meta\r
  title: 4단계. VideoCapture로 메타데이터\r
  structuredPrimary: true\r
  subtitle: fps, 총 프레임, 크기\r
  goal: cv2.VideoCapture 객체에서 동영상의 기본 정보를 읽습니다.\r
  why: 처리 전에 메타데이터를 확인하면 잘못된 입력에 의한 버그를 빨리 잡습니다.\r
  explanation: |-\r
    \`cap = cv2.VideoCapture(str(path))\` 로 열고, \`cap.get(cv2.CAP_PROP_FPS)\`, \`cap.get(cv2.CAP_PROP_FRAME_COUNT)\`, \`cap.get(cv2.CAP_PROP_FRAME_WIDTH)\` 같은 속성을 조회합니다.\r
\r
    조회만 한다면 \`cap.release()\` 도 깔끔히 호출하는 것이 좋습니다.\r
  tips:\r
  - 일부 mp4 파일은 인덱스 손상으로 FRAME_COUNT가 0이 나올 수 있습니다. 그럴 땐 직접 루프를 돌려 셉니다.\r
  snippet: |-\r
    cap = cv2.VideoCapture(str(videoPath))\r
    info = {\r
        "fps": float(cap.get(cv2.CAP_PROP_FPS)),\r
        "count": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),\r
        "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),\r
        "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),\r
    }\r
    cap.release()\r
    info\r
  exercise:\r
    prompt: secondaryPath의 메타데이터를 같은 방식으로 읽으세요.\r
    starterCode: |-\r
      capHd = cv2.VideoCapture(str(___))\r
      infoHd = {\r
          "fps": float(capHd.get(cv2.CAP_PROP_FPS)),\r
          "count": int(capHd.get(cv2.CAP_PROP_FRAME_COUNT)),\r
      }\r
      capHd.release()\r
      infoHd\r
    hints:\r
    - 빈칸은 경로 변수명입니다.\r
    - HD 동영상의 fps와 프레임 수가 의도와 같은지 확인하세요.\r
  check:\r
    noError: VideoCapture 열기/닫기가 오류 없이 끝나야 합니다.\r
    resultCheck: info의 fps와 count가 0보다 커야 합니다.\r
- id: frame_loop\r
  title: 5단계. 프레임 루프와 시각화\r
  structuredPrimary: true\r
  subtitle: 한 프레임씩 분석\r
  goal: 동영상을 처음부터 끝까지 읽으며 첫·중간·마지막 프레임을 시각화합니다.\r
  why: 프레임 루프는 모든 영상 처리 코드의 척추입니다.\r
  explanation: |-\r
    표준 패턴은 \`while True: ok, frame = cap.read(); if not ok: break\` 입니다. 프레임을 읽은 뒤 분석하거나 변환하고 다음 프레임으로 넘어갑니다.\r
\r
    프레임은 BGR이므로 matplotlib으로 표시하려면 \`cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)\` 가 필요합니다.\r
  tips:\r
  - 영상 처리 코드는 메모리 효율을 위해 한 번에 한 프레임만 보관하는 것이 표준입니다.\r
  snippet: |-\r
    cap = cv2.VideoCapture(str(videoPath))\r
    samples = []\r
    idx = 0\r
    while True:\r
        ok, frame = cap.read()\r
        if not ok:\r
            break\r
        if idx in (0, totalFrames // 2, totalFrames - 1):\r
            samples.append((idx, cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)))\r
        idx += 1\r
    cap.release()\r
    [s[0] for s in samples], len(samples)\r
  exercise:\r
    prompt: samples 리스트의 세 프레임을 1x3 그리드로 그리세요.\r
    starterCode: |-\r
      fig, axes = plt.subplots(1, 3, figsize=(12, 4))\r
      for axis, (sIdx, sFrame) in zip(axes, samples):\r
          axis.imshow(sFrame)\r
          axis.set_title(f'frame {sIdx}')\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - 시각화는 imshow와 axis off 한 줄씩이면 충분합니다.\r
    - 세 프레임의 색이 분명히 달라야 합니다.\r
  check:\r
    noError: 프레임 루프와 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: len(samples) 가 3이어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 합성 영상 분석 보고서\r
  goal: 합성한 영상의 모든 프레임 평균을 시간순으로 그래프로 그립니다.\r
  why: 프레임별 통계를 시간순으로 보면 영상에서 무엇이 변하는지 한눈에 봅니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 프레임별 통계는 영상 처리 디버깅의 첫 단계입니다.\r
  snippet: |-\r
    cap = cv2.VideoCapture(str(videoPath))\r
    means = []\r
    while True:\r
        ok, frame = cap.read()\r
        if not ok:\r
            break\r
        means.append(float(frame.mean()))\r
    cap.release()\r
    fig = plt.figure(figsize=(7, 3))\r
    plt.plot(means)\r
    plt.xlabel('frame')\r
    plt.ylabel('mean brightness')\r
    fig\r
  exercise:\r
    prompt: "미션1: 채널별 평균(B, G, R)을 시간순으로 같은 차트에 세 색으로 그리세요. 미션2: 동영상에서 6프레임 간격으로 첫 12개 샘플을 골라 2x6 그리드로 시각화하세요."\r
    starterCode: |-\r
      cap = cv2.VideoCapture(str(videoPath))\r
      blue, green, red = [], [], []\r
      while True:\r
          ok, frame = cap.read()\r
          if not ok:\r
              break\r
          blue.append(float(frame[:, :, 0].mean()))\r
          green.append(float(frame[:, :, 1].mean()))\r
          red.append(float(frame[:, :, 2].mean()))\r
      cap.release()\r
      fig = plt.figure(figsize=(7, 3))\r
      plt.plot(blue, label='B', color='blue')\r
      plt.plot(green, label='G', color='green')\r
      plt.plot(red, label='R', color='red')\r
      plt.legend()\r
      fig\r
    hints:\r
    - 합성 프레임의 R, G, B 평균은 강의 3단계의 패턴에 따라 시간순으로 단조 변화합니다.\r
    - 그리드 시각화는 set() 같은 함수를 미리 호출해 두면 깔끔해집니다.\r
  check:\r
    noError: 프레임 루프와 그래프 그리기가 오류 없이 끝나야 합니다.\r
    resultCheck: means의 길이가 totalFrames와 같아야 합니다.\r
`;export{e as default};