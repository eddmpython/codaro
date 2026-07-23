var e=`meta:\r
  id: visionApps_09\r
  title: 화면 캡처 분석\r
  order: 9\r
  category: visionApps\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  - mss\r
  tags:\r
  - mss\r
  - 화면캡처\r
  - 모니터링\r
  - 응용\r
  seo:\r
    title: 비전 응용 - 화면 캡처 분석\r
    description: mss로 화면 일부를 캡처해 opencv로 분석합니다.\r
    keywords:\r
    - 화면캡처\r
    - mss\r
    - 모니터링\r
    - 응용\r
intro:\r
  emoji: 🖥\r
  goal: mss로 화면 영역을 캡처해 opencv로 분석하는 응용 패턴을 익힙니다.\r
  description: |-\r
    화면의 특정 영역을 정기적으로 캡처해 변화를 감지하거나 색을 분석하는 응용은 데스크톱 자동화의 핵심입니다. mss는 빠르고 가벼운 화면 캡처 라이브러리로 모든 OS에서 동작합니다. 이 강의는 mss 사용법과 캡처 결과를 opencv 입력으로 다루는 흐름을 익힙니다.\r
  direction: mss로 화면 일부를 캡처한 뒤 색 분석과 변화 감지를 적용합니다.\r
  benefits:\r
  - mss.mss 컨텍스트로 화면 캡처를 한 줄로 호출합니다.\r
  - 캡처 결과를 numpy 배열 → opencv 입력으로 변환합니다.\r
  - 캡처 후 평균 색, 통계, 차분을 적용해 모니터링 응용을 구현합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. mss 사용\r
      detail: 모니터 정보와 기본 캡처.\r
    - label: 2단계. 영역 캡처\r
      detail: top, left, width, height.\r
    - label: 3단계. 캡처 → numpy\r
      detail: BGRA 결과를 BGR로.\r
    - label: 4단계. 단순 분석\r
      detail: 평균 색, 통계.\r
    - label: 5단계. 반복 캡처와 변화 감지\r
      detail: absdiff로 시계열.\r
    runtime:\r
    - label: 비전 환경\r
      detail: mss가 헤드리스(서버) 환경에서 동작하지 않을 수 있습니다. 데스크톱 환경에서 학습하세요.\r
    - label: 검증 흐름\r
      detail: 캡처된 이미지 크기와 변화 감지 결과를 assert와 시각 비교로 기대값과 같은지 확인합니다.\r
sections:\r
- id: mss_intro\r
  title: 1단계. mss 사용\r
  structuredPrimary: true\r
  subtitle: 모니터 정보\r
  goal: mss 컨텍스트를 만들고 모니터 목록을 확인합니다.\r
  why: 캡처할 모니터와 영역을 정확히 지정해야 합니다.\r
  explanation: |-\r
    \`with mss.mss() as sct:\` 가 표준 패턴입니다. \`sct.monitors\` 는 모든 모니터의 정보 dict 리스트입니다. 0번 인덱스는 전체 가상 화면, 1번부터가 개별 모니터입니다.\r
\r
    헤드리스 환경(예: CI 서버) 에서는 mss가 디스플레이를 찾지 못해 예외를 발생시킵니다. 그럴 때는 학습 환경을 데스크톱으로 옮기세요.\r
  tips:\r
  - mss는 가볍고 빠르지만 일부 OS에서 추가 의존성이 필요할 수 있습니다(macOS의 권한 설정 등).\r
  snippet: |-\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    import cv2\r
\r
    try:\r
        import mss\r
        with mss.mss() as sct:\r
            monitorsInfo = list(sct.monitors)\r
        mssStatus = 'ready'\r
    except Exception as exc:\r
        monitorsInfo = []\r
        mssStatus = f"failed: {exc.__class__.__name__}"\r
    mssStatus, len(monitorsInfo)\r
  exercise:\r
    prompt: 첫 번째 실제 모니터(인덱스 1) 의 크기 정보를 출력하세요.\r
    starterCode: |-\r
      if len(monitorsInfo) > 1:\r
          firstMonitor = monitorsInfo[___]\r
      else:\r
          firstMonitor = None\r
      firstMonitor\r
    hints:\r
    - 빈칸은 정수 1 입니다.\r
    - 결과는 dict 또는 None입니다.\r
  check:\r
    noError: mss 초기화 시도가 오류 없이 끝나야 합니다.\r
    resultCheck: mssStatus가 문자열이어야 합니다.\r
- id: capture_area\r
  title: 2단계. 영역 캡처\r
  structuredPrimary: true\r
  subtitle: top, left, width, height\r
  goal: 화면의 특정 영역을 dict로 지정해 캡처합니다.\r
  why: 응용에서는 화면 전체가 아닌 특정 영역만 모니터링하는 경우가 일반적입니다.\r
  explanation: |-\r
    \`sct.grab({"top": 100, "left": 100, "width": 300, "height": 200})\` 가 영역 캡처입니다. 결과는 mss의 ScreenShot 객체로 width, height, raw 속성을 가집니다.\r
\r
    화면에 그 영역이 존재해야 합니다(다른 모니터 너머의 좌표를 지정하면 빈 캡처가 됩니다).\r
  tips:\r
  - 영역 좌표는 모니터 단위가 아닌 가상 데스크톱 좌표입니다. 여러 모니터에서는 음수 좌표가 나올 수도 있습니다.\r
  snippet: |-\r
    if mssStatus == 'ready':\r
        with mss.mss() as sct:\r
            shot = sct.grab({"top": 0, "left": 0, "width": 300, "height": 200})\r
        shotInfo = (shot.width, shot.height)\r
    else:\r
        shot = None\r
        shotInfo = None\r
    shotInfo\r
  exercise:\r
    prompt: 캡처 영역을 (400, 300) 으로 키운 bigShot을 시도하세요.\r
    starterCode: |-\r
      if mssStatus == 'ready':\r
          with mss.mss() as sct:\r
              bigShot = sct.grab({"top": 0, "left": 0, "width": ___, "height": 300})\r
          bigShotInfo = (bigShot.width, bigShot.height)\r
      else:\r
          bigShot = None\r
          bigShotInfo = None\r
      bigShotInfo\r
    hints:\r
    - 빈칸은 정수 400 입니다.\r
    - 결과는 (400, 300) 입니다.\r
  check:\r
    noError: 캡처 시도가 오류 없이 끝나야 합니다.\r
    resultCheck: mssStatus가 'ready' 일 때 shotInfo가 (300, 200) 이어야 합니다.\r
- id: to_numpy\r
  title: 3단계. 캡처 → numpy\r
  structuredPrimary: true\r
  subtitle: BGRA → BGR\r
  goal: ScreenShot 객체를 numpy 배열로 변환하고 BGRA 채널 순서를 BGR로 통일합니다.\r
  why: opencv의 다른 함수는 BGR을 기대하므로 채널 순서를 맞춰야 합니다.\r
  explanation: |-\r
    \`np.array(shot)\` 는 (H, W, 4) BGRA 배열을 만듭니다. \`cv2.cvtColor(arr, cv2.COLOR_BGRA2BGR)\` 로 알파 채널을 제거하면 표준 BGR 배열이 됩니다.\r
\r
    matplotlib 표시를 위해서는 마지막에 BGR → RGB 한 번 더 변환합니다.\r
  tips:\r
  - 화면 캡처의 알파 채널은 보통 의미가 없습니다. 즉시 제거하는 것이 일반적입니다.\r
  snippet: |-\r
    if shot is not None:\r
        arr = np.array(shot)\r
        bgr = cv2.cvtColor(arr, cv2.COLOR_BGRA2BGR)\r
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)\r
    else:\r
        arr = None\r
        bgr = None\r
        rgb = None\r
    None if rgb is None else rgb.shape\r
  exercise:\r
    prompt: rgb가 None이 아니면 시각화하세요(헤드리스에서는 그냥 통과).\r
    starterCode: |-\r
      if rgb is not None:\r
          fig = plt.figure(figsize=(6, 4))\r
          plt.imshow(rgb)\r
          plt.axis('___')\r
      else:\r
          fig = None\r
      fig\r
    hints:\r
    - 빈칸은 'off' 입니다.\r
    - 캡처한 화면 영역이 보여야 합니다.\r
  check:\r
    noError: 캡처 변환이 오류 없이 끝나야 합니다.\r
    resultCheck: mssStatus가 'ready' 일 때 bgr이 ndarray여야 합니다.\r
- id: analyze\r
  title: 4단계. 단순 분석\r
  structuredPrimary: true\r
  subtitle: 평균 색과 통계\r
  goal: 캡처한 영역의 평균 색과 통계를 계산합니다.\r
  why: 응용은 캡처 자체가 아니라 캡처에서 정보를 추출하는 데 의의가 있습니다.\r
  explanation: |-\r
    visionBasics 9강의 패턴이 그대로 적용됩니다. 평균 색은 영역의 전반적인 색감을, 표준편차는 영역의 복잡도를 알려줍니다.\r
\r
    이 정보를 시계열로 모으면 화면 영역의 변화 패턴을 추적할 수 있습니다.\r
  tips:\r
  - 캡처한 화면 영역의 평균 색은 모니터의 색감, 환경에 따라 다릅니다.\r
  snippet: |-\r
    if rgb is not None:\r
        stats = {\r
            "mean": rgb.mean(axis=(0, 1)).tolist(),\r
            "std": float(rgb.std()),\r
        }\r
    else:\r
        stats = None\r
    stats\r
  exercise:\r
    prompt: rgb가 있으면 채널별 표준편차도 출력하세요.\r
    starterCode: |-\r
      if rgb is not None:\r
          channelStd = rgb.std(axis=(___, ___)).tolist()\r
      else:\r
          channelStd = None\r
      channelStd\r
    hints:\r
    - axis 인자는 (0, 1) 입니다.\r
    - 결과는 길이 3 리스트입니다.\r
  check:\r
    noError: 통계 계산이 오류 없이 끝나야 합니다.\r
    resultCheck: mssStatus가 'ready' 일 때 stats에 mean 키가 있어야 합니다.\r
- id: monitor_loop\r
  title: 5단계. 반복 캡처와 변화 감지\r
  structuredPrimary: true\r
  subtitle: absdiff로 시계열\r
  goal: 짧은 간격으로 두 캡처를 떠 차분을 계산합니다.\r
  why: 응용은 보통 정기적으로 화면을 캡처해 변화를 감지합니다.\r
  explanation: |-\r
    실시간 무한 루프는 학습용으로 부적합합니다. 여기서는 두 번 캡처해 단일 차분만 확인합니다. 실제 응용에서는 time.sleep + 루프로 정기 캡처를 합니다.\r
  tips:\r
  - 캡처 사이에 변화가 없는 화면이면 차분이 0에 가깝습니다.\r
  snippet: |-\r
    if mssStatus == 'ready':\r
        with mss.mss() as sct:\r
            firstShot = np.array(sct.grab({"top": 0, "left": 0, "width": 300, "height": 200}))\r
            secondShot = np.array(sct.grab({"top": 0, "left": 0, "width": 300, "height": 200}))\r
        diff = cv2.absdiff(firstShot, secondShot)\r
        diffMean = float(diff.mean())\r
    else:\r
        diffMean = None\r
    diffMean\r
  exercise:\r
    prompt: 캡처 영역을 (200, 150) 으로 줄여 같은 차분 계산을 하세요.\r
    starterCode: |-\r
      if mssStatus == 'ready':\r
          with mss.mss() as sct:\r
              shotA = np.array(sct.grab({"top": 0, "left": 0, "width": ___, "height": 150}))\r
              shotB = np.array(sct.grab({"top": 0, "left": 0, "width": 200, "height": 150}))\r
          smallDiff = float(cv2.absdiff(shotA, shotB).mean())\r
      else:\r
          smallDiff = None\r
      smallDiff\r
    hints:\r
    - 빈칸은 정수 200 입니다.\r
    - 결과는 작은 부동소수입니다.\r
  check:\r
    noError: 차분 계산이 오류 없이 끝나야 합니다.\r
    resultCheck: diffMean이 None 또는 부동소수여야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 응용 함수\r
  goal: 영역 dict → 분석 결과 dict의 응용 함수를 만듭니다.\r
  why: 함수로 묶어 두면 자동화 스크립트에서 즉시 호출할 수 있습니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 응용 함수는 헤드리스 환경에서도 깨지지 않게 try/except로 감싸는 것이 안전합니다.\r
  snippet: |-\r
    def analyzeRegion(region):\r
        try:\r
            with mss.mss() as sctLocal:\r
                shotLocal = np.array(sctLocal.grab(region))\r
            bgrLocal = cv2.cvtColor(shotLocal, cv2.COLOR_BGRA2BGR)\r
            return {\r
                "shape": bgrLocal.shape,\r
                "mean": bgrLocal.mean(axis=(0, 1)).tolist(),\r
                "std": float(bgrLocal.std()),\r
            }\r
        except Exception as exc:\r
            return {"error": exc.__class__.__name__}\r
\r
    analyzeRegion({"top": 0, "left": 0, "width": 250, "height": 180})\r
  exercise:\r
    prompt: "미션1: 두 영역에 함수를 적용해 결과를 dict로 합치세요. 미션2: 두 캡처 결과의 평균 색 차이를 출력하세요."\r
    starterCode: |-\r
      regions = {\r
          "topLeft": {"top": 0, "left": 0, "width": 200, "height": 150},\r
          "topMid": {"top": 0, "left": 200, "width": 200, "height": 150},\r
      }\r
      compare = {name: analyzeRegion(area) for name, area in ___.items()}\r
      compare\r
    hints:\r
    - 빈칸은 regions 변수입니다.\r
    - 결과는 두 영역의 분석 dict가 들어 있는 dict입니다.\r
  check:\r
    noError: 응용 함수가 오류 없이 끝나야 합니다.\r
    resultCheck: analyzeRegion 결과가 dict여야 합니다.\r
`;export{e as default};