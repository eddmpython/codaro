var e=`meta:\r
  id: visionApps_08\r
  title: 영상 자동 썸네일\r
  order: 8\r
  category: visionApps\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  tags:\r
  - opencv\r
  - 썸네일\r
  - 비디오\r
  - scene\r
  - 응용\r
  seo:\r
    title: 비전 응용 - 영상 자동 썸네일\r
    description: 프레임 차분으로 영상에서 대표 N장의 썸네일을 자동으로 뽑아냅니다.\r
    keywords:\r
    - 썸네일\r
    - scene\r
    - 비디오\r
    - 응용\r
intro:\r
  emoji: 🎬\r
  goal: 영상에서 대표 N장의 썸네일을 자동으로 추출하는 응용을 만듭니다.\r
  description: |-\r
    영상의 모든 프레임이 의미 있지는 않습니다. 장면 전환이 일어난 프레임 또는 일정 간격의 프레임만 추리면 영상을 한 화면에 요약할 수 있습니다. 이 강의는 visionFeatures 6~7강의 비디오 IO와 차분 패턴을 응용해 자동 썸네일 추출기를 만듭니다.\r
  direction: 영상을 처음부터 끝까지 읽으며 차분값이 큰 N개 프레임을 골라 썸네일로 저장합니다.\r
  benefits:\r
  - 프레임 차분의 시계열을 분석해 변화가 큰 시점을 식별합니다.\r
  - argsort로 상위 N개 인덱스를 골라 썸네일을 추출합니다.\r
  - 결과를 격자로 그리거나 파일로 저장하는 패턴을 익힙니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 영상 준비\r
      detail: codaro_demo.mp4 재사용.\r
    - label: 2단계. 차분 시계열\r
      detail: 인접 프레임 absdiff 면적.\r
    - label: 3단계. 상위 N 인덱스\r
      detail: argsort로 큰 변화 시점.\r
    - label: 4단계. 썸네일 추출\r
      detail: 해당 인덱스의 프레임 저장.\r
    - label: 5단계. 격자 시각화\r
      detail: N장을 한 화면에.\r
    runtime:\r
    - label: 비전 환경\r
      detail: opencv-python의 VideoCapture와 absdiff.\r
    - label: 검증 흐름\r
      detail: 프레임 변화도와 추출된 키프레임 수를 assert와 시각 비교로 기대값과 같은지 확인합니다.\r
sections:\r
- id: prepare\r
  title: 1단계. 영상 준비\r
  structuredPrimary: true\r
  subtitle: codaro_demo.mp4 재사용\r
  goal: visionFeatures 6강에서 만든 영상을 사용합니다(없으면 즉석 합성).\r
  why: 같은 영상으로 강의를 진행해 결과를 비교 가능하게 만듭니다.\r
  explanation: |-\r
    합성 영상은 노란 원이 우측으로 이동합니다. 인접 프레임 차분은 원의 이동 영역을 마스크화합니다. 모든 프레임의 차분이 비슷한 면적을 가지므로 단순 변화량 기반 썸네일에서는 균등한 간격으로 N장이 골라집니다.\r
  tips:\r
  - 실제 영상은 장면 전환이 강한 시점에 차분이 급증합니다. 합성 영상에서는 그 패턴이 약합니다.\r
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
    prompt: 영상 총 프레임 수를 확인하세요.\r
    starterCode: |-\r
      cap = cv2.VideoCapture(str(videoPath))\r
      total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))\r
      cap.___()\r
      total\r
    hints:\r
    - 빈칸은 release 메서드 이름입니다.\r
    - 결과는 60 입니다.\r
  check:\r
    noError: 영상 준비가 오류 없이 끝나야 합니다.\r
    resultCheck: videoPath.exists() 가 True여야 합니다.\r
- id: diff_series\r
  title: 2단계. 차분 시계열\r
  structuredPrimary: true\r
  subtitle: 인접 프레임 absdiff 면적\r
  goal: 인접 프레임 차분 후 임곗값 마스크의 면적을 시계열로 계산합니다.\r
  why: 면적 시계열은 변화 강도를 정량적으로 표현합니다.\r
  explanation: |-\r
    visionFeatures 7강의 absdiff 패턴을 그대로 응용합니다. 차이가 큰 픽셀 수를 시계열로 모으면 첫 인덱스는 0(이전 프레임 없음) 으로 두는 것이 일반적입니다.\r
  tips:\r
  - 시계열에 0이 섞이면 시각화나 분석에서 노이즈가 됩니다. 첫 인덱스는 빼고 다루는 것이 안전합니다.\r
  snippet: |-\r
    cap = cv2.VideoCapture(str(videoPath))\r
    prevGray = None\r
    diffs = []\r
    while True:\r
        ok, frame = cap.read()\r
        if not ok:\r
            break\r
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\r
        if prevGray is None:\r
            diffs.append(0)\r
        else:\r
            mask = cv2.absdiff(prevGray, gray) > 20\r
            diffs.append(int(mask.sum()))\r
        prevGray = gray\r
    cap.release()\r
    len(diffs), diffs[1], diffs[-1]\r
  exercise:\r
    prompt: 차분 면적의 평균과 최댓값을 출력하세요.\r
    starterCode: |-\r
      arr = np.array(diffs[___:])\r
      arr.mean(), arr.max()\r
    hints:\r
    - 빈칸은 정수 1입니다(첫 인덱스 제외).\r
    - 평균과 최대값이 모두 양수여야 합니다.\r
  check:\r
    noError: 차분 시계열 계산이 오류 없이 끝나야 합니다.\r
    resultCheck: len(diffs) 가 60 정도여야 합니다.\r
- id: top_n\r
  title: 3단계. 상위 N 인덱스\r
  structuredPrimary: true\r
  subtitle: argsort로 큰 변화 시점\r
  goal: 차분 면적이 큰 N개 프레임 인덱스를 추출합니다.\r
  why: 대표 썸네일은 변화가 큰 시점에서 고르는 것이 자연스럽습니다.\r
  explanation: |-\r
    \`np.argsort(diffs)[-N:]\` 가 상위 N개의 인덱스입니다. 결과는 오름차순이므로 시간순으로 정렬하려면 \`sorted\` 를 한 번 더 적용합니다.\r
  tips:\r
  - argsort 결과는 작은 값부터 큰 값으로의 순서입니다. 끝에서 N개가 가장 큰 값들의 인덱스입니다.\r
  snippet: |-\r
    diffArr = np.array(diffs)\r
    topN = 4\r
    topIdx = sorted(np.argsort(diffArr)[-topN:].tolist())\r
    topIdx, [diffArr[i] for i in topIdx]\r
  exercise:\r
    prompt: N=8로 변경해 더 많은 썸네일 후보를 만드세요.\r
    starterCode: |-\r
      eightIdx = sorted(np.argsort(diffArr)[___:].tolist())\r
      eightIdx\r
    hints:\r
    - 빈칸은 -8 입니다.\r
    - 결과는 8개 인덱스 리스트입니다.\r
  check:\r
    noError: 인덱스 추출이 오류 없이 끝나야 합니다.\r
    resultCheck: len(topIdx) 가 4 여야 합니다.\r
- id: extract\r
  title: 4단계. 썸네일 추출\r
  structuredPrimary: true\r
  subtitle: 해당 인덱스의 프레임 저장\r
  goal: 인덱스에 해당하는 프레임을 다시 읽어 dict로 모읍니다.\r
  why: 인덱스만 있고 실제 프레임이 없으면 시각화도 저장도 못합니다.\r
  explanation: |-\r
    \`cap.set(cv2.CAP_PROP_POS_FRAMES, idx)\` 로 특정 프레임으로 점프할 수 있지만, 일부 코덱에서는 정확하지 않습니다. 순차 읽기로 원하는 인덱스만 모으는 것이 안정적입니다.\r
  tips:\r
  - 순차 읽기는 안전하지만 큰 영상에서는 느립니다. 인덱싱이 가능한 영상이면 set 방식이 더 빠릅니다.\r
  snippet: |-\r
    cap = cv2.VideoCapture(str(videoPath))\r
    targetSet = set(topIdx)\r
    thumbnails = {}\r
    idx = 0\r
    while True:\r
        ok, frame = cap.read()\r
        if not ok:\r
            break\r
        if idx in targetSet:\r
            thumbnails[idx] = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)\r
        idx += 1\r
    cap.release()\r
    sorted(thumbnails.keys()), len(thumbnails)\r
  exercise:\r
    prompt: eightIdx 인덱스로도 같은 패턴을 적용해 thumbnailsEight를 만드세요.\r
    starterCode: |-\r
      cap = cv2.VideoCapture(str(videoPath))\r
      eightSet = set(eightIdx)\r
      thumbnailsEight = {}\r
      idx = 0\r
      while True:\r
          ok, frame = cap.read()\r
          if not ok:\r
              break\r
          if idx in eightSet:\r
              thumbnailsEight[idx] = cv2.cvtColor(frame, ___)\r
          idx += 1\r
      cap.release()\r
      len(thumbnailsEight)\r
    hints:\r
    - 빈칸은 cv2.COLOR_BGR2RGB 입니다.\r
    - 결과는 8 입니다.\r
  check:\r
    noError: 썸네일 추출이 오류 없이 끝나야 합니다.\r
    resultCheck: len(thumbnails) 가 len(topIdx) 와 같아야 합니다.\r
- id: grid\r
  title: 5단계. 격자 시각화\r
  structuredPrimary: true\r
  subtitle: N장을 한 화면에\r
  goal: 추출한 썸네일을 격자로 그려 한눈에 봅니다.\r
  why: 영상 한 편의 요약 화면을 만드는 것이 응용의 목표입니다.\r
  explanation: |-\r
    N장의 썸네일이라면 1xN 또는 2x(N/2) 격자가 자연스럽습니다. 각 칸에 프레임 인덱스를 타이틀로 표시합니다.\r
  tips:\r
  - 영상 길이가 길어지면 N을 동적으로 조절(예: 길이의 5%) 하는 것이 좋습니다.\r
  snippet: |-\r
    fig, axes = plt.subplots(1, len(thumbnails), figsize=(4 * len(thumbnails), 4))\r
    for axis, key in zip(axes, sorted(thumbnails)):\r
        axis.imshow(thumbnails[key])\r
        axis.set_title(f'frame {key}')\r
        axis.axis('off')\r
    fig\r
  exercise:\r
    prompt: thumbnailsEight를 2x4 격자로 시각화하세요.\r
    starterCode: |-\r
      fig, axes = plt.subplots(2, 4, figsize=(14, 6))\r
      keysSorted = sorted(thumbnailsEight)\r
      for axis, key in zip(axes.ravel(), keysSorted):\r
          axis.imshow(thumbnailsEight[key])\r
          axis.set_title(f'frame {key}')\r
          axis.axis('___')\r
      fig\r
    hints:\r
    - 빈칸은 'off' 입니다.\r
    - 8장이 모두 출력되어야 합니다.\r
  check:\r
    noError: 격자 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 함수화\r
  goal: 영상 경로와 N → 썸네일 dict 한 함수에 모읍니다.\r
  why: 함수로 묶어 두면 다른 영상에 즉시 적용할 수 있습니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 함수 반환을 dict(인덱스 → ndarray) 로 두면 후속 처리가 편합니다.\r
  snippet: |-\r
    def extractThumbnails(path, n=4, diffThreshold=20):\r
        capLocal = cv2.VideoCapture(str(path))\r
        diffsLocal = []\r
        prevLocal = None\r
        framesLocal = []\r
        while True:\r
            ok, frame = capLocal.read()\r
            if not ok:\r
                break\r
            grayLocal = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\r
            if prevLocal is None:\r
                diffsLocal.append(0)\r
            else:\r
                maskLocal = cv2.absdiff(prevLocal, grayLocal) > diffThreshold\r
                diffsLocal.append(int(maskLocal.sum()))\r
            framesLocal.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))\r
            prevLocal = grayLocal\r
        capLocal.release()\r
        if not framesLocal:\r
            return {}\r
        topIdxLocal = sorted(np.argsort(np.array(diffsLocal))[-n:].tolist())\r
        return {idx: framesLocal[idx] for idx in topIdxLocal}\r
\r
    extractThumbnails(videoPath, n=4).keys()\r
  exercise:\r
    prompt: "미션1: N=2, 4, 6에 대해 추출된 인덱스가 시간순으로 어떻게 변하는지 비교 출력하세요. 미션2: extractThumbnails(videoPath, n=4) 결과를 1x4 격자로 시각화하세요."\r
    starterCode: |-\r
      compare = {n: list(extractThumbnails(videoPath, n=n).keys()) for n in [___, 4, 6]}\r
      compare\r
    hints:\r
    - 빈칸은 정수 2 입니다.\r
    - 결과 dict의 값 길이가 N과 같아야 합니다.\r
  check:\r
    noError: 함수 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: extractThumbnails(videoPath).keys() 의 길이가 4 여야 합니다.\r
`;export{e as default};