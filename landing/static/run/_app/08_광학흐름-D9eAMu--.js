var e=`meta:
  id: visionFeatures_08
  title: 광학 흐름으로 점 추적
  order: 8
  category: visionFeatures
  difficulty: ⭐⭐⭐⭐
  badge: 중급
  packages:
  - matplotlib
  - numpy
  - opencv-python
  tags:
  - opencv
  - 광학흐름
  - opticalflow
  - LucasKanade
  - 트래킹
  seo:
    title: 비전 특징점 - 광학 흐름으로 점 추적
    description: Lucas-Kanade 광학 흐름으로 영상에서 코너점이 다음 프레임의 어디로 이동했는지 추적합니다.
    keywords:
    - 광학흐름
    - opticalflow
    - LucasKanade
    - 트래킹
    - opencv
intro:
  emoji: 🌊
  goal: 영상에서 같은 점이 시간이 지나면서 어디로 이동하는지 추적하는 광학 흐름을 익힙니다.
  description: |-
    배경 차분은 어디가 움직였는지 알려주지만 같은 점이 어디로 갔는지는 알려주지 못합니다. 광학 흐름(optical flow) 은 첫 프레임의 점들을 다음 프레임에서 추적해 운동 궤적을 만듭니다. 이 강의는 Lucas-Kanade pyrLK로 점 추적의 기본을 익힙니다.
  direction: 첫 프레임의 코너점을 모아 매 프레임마다 새 위치를 계산해 추적 궤적을 그립니다.
  benefits:
  - cv2.calcOpticalFlowPyrLK로 점들의 다음 위치를 한 줄로 얻습니다.
  - status 배열로 추적 실패한 점을 거를 수 있습니다.
  - 궤적을 시각화해 영상 위에 움직임을 그릴 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 첫 프레임 코너 추출
      detail: goodFeaturesToTrack로 추적 시작점 만들기.
    - label: 2단계. 인접 프레임 흐름 계산
      detail: pyrLK로 다음 위치를 얻기.
    - label: 3단계. status로 실패 점 제외
      detail: 잃어버린 점을 제거.
    - label: 4단계. 궤적 누적
      detail: 모든 프레임의 위치를 모읍니다.
    - label: 5단계. 영상 위에 궤적 그리기
      detail: 마지막 프레임에 궤적을 시각화합니다.
    runtime:
    - label: 비전 환경
      detail: opencv-python의 calcOpticalFlowPyrLK를 사용합니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: first_corners
  title: 1단계. 첫 프레임 코너 추출
  structuredPrimary: true
  subtitle: 추적의 시작점
  goal: 첫 프레임에서 추적할 코너점들을 goodFeaturesToTrack으로 얻습니다.
  why: 광학 흐름의 입력은 정확한 좌표를 가진 코너점입니다.
  explanation: |-
    1강에서 본 \`cv2.goodFeaturesToTrack\` 의 결과가 그대로 pyrLK 입력으로 들어갑니다. 형식이 \`(N, 1, 2) float32\` 이므로 변환 없이 사용 가능합니다.

    합성 영상에는 노란 원이 있으므로 원 가장자리의 코너가 자동으로 검출됩니다.
  tips:
  - 첫 프레임에 코너가 적게 잡히면 추적이 짧게 끝납니다. qualityLevel을 낮춰 더 많은 코너를 받아 두세요.
  snippet: |-
    import cv2
    import numpy as np
    import matplotlib.pyplot as plt
    import tempfile
    from pathlib import Path

    videoPath = Path(tempfile.gettempdir()) / 'codaro_demo.mp4'
    if not videoPath.exists():
        width, height = 320, 240
        fps = 24
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(str(videoPath), fourcc, fps, (width, height))
        for idx in range(60):
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            intensity = int(255 * idx / 59)
            frame[:] = (intensity, 100, 255 - intensity)
            cv2.circle(frame, (60 + idx * 4, 120), 20, (0, 255, 255), -1)
            writer.write(frame)
        writer.release()

    cap = cv2.VideoCapture(str(videoPath))
    ok, firstBgr = cap.read()
    cap.release()
    firstGray = cv2.cvtColor(firstBgr, cv2.COLOR_BGR2GRAY)
    startPoints = cv2.goodFeaturesToTrack(firstGray, maxCorners=40, qualityLevel=0.01, minDistance=10)
    startPoints.shape
  exercise:
    prompt: 첫 프레임의 코너를 시각화하세요.
    starterCode: |-
      pts = startPoints.reshape(-1, 2)
      fig = plt.figure(figsize=(5, 4))
      plt.imshow(cv2.cvtColor(firstBgr, cv2.COLOR_BGR2RGB))
      plt.scatter(pts[:, 0], pts[:, 1], s=30, c='lime', edgecolors='black')
      plt.title(f'{len(pts)} starting points')
      plt.axis('off')
      fig
    hints:
    - "reshape(-1, 2) 표준 패턴입니다."
    - 코너는 원 가장자리에 모여 있어야 합니다.
  check:
    noError: 첫 프레임 코너 추출이 오류 없이 끝나야 합니다.
    resultCheck: startPoints.shape의 마지막 차원이 2여야 합니다.
- id: pyrLK
  title: 2단계. pyrLK로 흐름 계산
  structuredPrimary: true
  subtitle: 한 줄로 다음 위치
  goal: cv2.calcOpticalFlowPyrLK로 다음 프레임에서 각 점의 새 위치를 얻습니다.
  why: pyrLK는 가벼우면서도 잘 동작하는 표준 광학 흐름 알고리즘입니다.
  explanation: |-
    \`cv2.calcOpticalFlowPyrLK(prevGray, curGray, prevPts, None)\` 는 \`(newPoints, status, error)\` 를 반환합니다. status는 (N, 1) 모양의 uint8 배열로 추적 성공이면 1, 실패면 0입니다.

    Lucas-Kanade는 이미지 피라미드를 만들어 큰 움직임도 안정적으로 추적합니다.
  tips:
  - 추적 결과는 float32 좌표입니다. 그리기 전에 int로 변환하면 됩니다.
  snippet: |-
    cap = cv2.VideoCapture(str(videoPath))
    ok, firstBgr = cap.read()
    ok, secondBgr = cap.read()
    cap.release()
    firstGray = cv2.cvtColor(firstBgr, cv2.COLOR_BGR2GRAY)
    secondGray = cv2.cvtColor(secondBgr, cv2.COLOR_BGR2GRAY)
    newPoints, status, error = cv2.calcOpticalFlowPyrLK(firstGray, secondGray, startPoints, None)
    newPoints.shape, status.sum(), status.shape
  exercise:
    prompt: 첫 점과 새 위치의 거리를 계산하세요(첫 5개만).
    starterCode: |-
      diff = newPoints.reshape(-1, 2) - startPoints.reshape(-1, 2)
      distances = np.sqrt((diff ** 2).sum(axis=___))
      distances[:5]
    hints:
    - axis=1로 행 단위 합을 구해 점별 거리가 됩니다.
    - 영상의 객체가 이동했다면 일부 점에서 큰 거리가 나옵니다.
  check:
    noError: pyrLK 호출이 오류 없이 끝나야 합니다.
    resultCheck: newPoints.shape 가 startPoints.shape 와 같아야 합니다.
- id: status_filter
  title: 3단계. status로 실패 점 제외
  structuredPrimary: true
  subtitle: 잃어버린 점 거르기
  goal: status가 1인 점만 골라 다음 단계로 넘깁니다.
  why: 추적 실패 점을 남기면 거짓 궤적이 그려집니다.
  explanation: |-
    status를 bool 마스크로 변환해 인덱싱하면 살아남은 점들만 남습니다. 다음 프레임의 입력으로 이 점들을 그대로 사용합니다.

    추적이 실패하는 원인은 점이 화면을 벗어났거나 텍스처가 부족한 영역으로 이동한 경우입니다.
  tips:
  - status는 (N, 1) 모양이므로 squeeze() 또는 .ravel() 로 1차원으로 만든 뒤 인덱싱에 씁니다.
  snippet: |-
    aliveMask = status.ravel() == 1
    survivors = newPoints[aliveMask]
    int(aliveMask.sum()), survivors.shape
  exercise:
    prompt: 실패한 점만 따로 모아 deadPoints를 만드세요.
    starterCode: |-
      deadMask = status.ravel() == ___
      deadPoints = startPoints[deadMask]
      int(deadMask.sum()), deadPoints.shape
    hints:
    - 실패는 0입니다.
    - 합성 영상에서는 실패가 거의 없을 수 있습니다(0이어도 정상).
  check:
    noError: 마스크 인덱싱이 오류 없이 끝나야 합니다.
    resultCheck: survivors.shape의 마지막 차원이 2여야 합니다.
- id: accumulate
  title: 4단계. 궤적 누적
  structuredPrimary: true
  subtitle: 모든 프레임의 좌표를 모으기
  goal: 영상 전체를 돌면서 각 추적 점의 좌표를 모읍니다.
  why: 궤적은 매 프레임 좌표의 시계열입니다. 시각화와 분석의 입력입니다.
  explanation: |-
    딕셔너리로 점 인덱스 → 좌표 리스트를 관리하는 것이 한 가지 방법입니다. 점이 도중에 사라지면 그 점의 리스트는 거기서 끝납니다.

    좌표는 (x, y) float입니다. 정수 변환은 시각화 시점에만 합니다.
  tips:
  - 궤적 데이터는 list of arrays 또는 dict로 다루면 추가 분석이 쉽습니다.
  snippet: |-
    cap = cv2.VideoCapture(str(videoPath))
    ok, baseBgr = cap.read()
    baseGray = cv2.cvtColor(baseBgr, cv2.COLOR_BGR2GRAY)
    currentPoints = startPoints
    tracks = {idx: [tuple(point.ravel())] for idx, point in enumerate(currentPoints)}
    aliveIdx = list(tracks.keys())
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        nextGray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        nextPts, status, _ = cv2.calcOpticalFlowPyrLK(baseGray, nextGray, currentPoints, None)
        alive = status.ravel() == 1
        currentPoints = nextPts[alive]
        newAliveIdx = [aliveIdx[i] for i, flag in enumerate(alive) if flag]
        for trackIdx, point in zip(newAliveIdx, currentPoints):
            tracks[trackIdx].append(tuple(point.ravel()))
        aliveIdx = newAliveIdx
        baseGray = nextGray
    cap.release()
    len(tracks), max(len(path) for path in tracks.values())
  exercise:
    prompt: 가장 긴 궤적의 좌표 시퀀스 첫 5개를 출력하세요.
    starterCode: |-
      longestIdx = max(tracks, key=lambda key: len(tracks[key]))
      tracks[longestIdx][:___]
    hints:
    - 빈칸은 정수 5입니다.
    - 결과는 (x, y) 튜플 다섯 개입니다.
  check:
    noError: 궤적 누적 루프가 오류 없이 끝나야 합니다.
    resultCheck: tracks의 일부 점 궤적 길이가 1보다 커야 합니다.
- id: draw_tracks
  title: 5단계. 영상 위에 궤적 그리기
  structuredPrimary: true
  subtitle: 마지막 프레임에 선 그리기
  goal: 마지막 프레임 이미지 위에 모든 궤적을 선으로 그립니다.
  why: 궤적 시각화는 광학 흐름 결과의 정성적 평가에서 가장 빠른 방법입니다.
  explanation: |-
    각 점의 좌표 시퀀스를 두 점씩 묶어 선분으로 그립니다. matplotlib의 plot은 (x 리스트, y 리스트) 인자로 한 줄을 그립니다.
  tips:
  - 점이 많으면 선이 빽빽해 보기 어려워집니다. 길이가 일정 이상인 궤적만 그리는 것이 좋습니다.
  snippet: |-
    cap = cv2.VideoCapture(str(videoPath))
    finalBgr = None
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        finalBgr = frame
    cap.release()
    finalRgb = cv2.cvtColor(finalBgr, cv2.COLOR_BGR2RGB)
    fig = plt.figure(figsize=(7, 5))
    plt.imshow(finalRgb)
    for path in tracks.values():
        if len(path) < 3:
            continue
        xs = [pt[0] for pt in path]
        ys = [pt[1] for pt in path]
        plt.plot(xs, ys, color='yellow', linewidth=1.2)
    plt.axis('off')
    fig
  exercise:
    prompt: 궤적 길이가 30 이상인 점들만 굵은 빨강선으로 다시 그리세요.
    starterCode: |-
      fig2 = plt.figure(figsize=(7, 5))
      plt.imshow(finalRgb)
      for path in tracks.values():
          if len(path) < ___:
              continue
          xs = [pt[0] for pt in path]
          ys = [pt[1] for pt in path]
          plt.plot(xs, ys, color='red', linewidth=2)
      plt.axis('off')
      fig2
    hints:
    - 빈칸은 정수 30입니다.
    - 합성 영상에서는 노란 원이 우측으로 이동한 궤적이 도드라집니다.
  check:
    noError: 궤적 그리기가 오류 없이 끝나야 합니다.
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 궤적 통계 분석
  goal: 모든 궤적의 누적 이동 거리를 계산하고 분포를 그립니다.
  why: 궤적 통계는 무엇이 빠르게 움직였는지, 어떤 객체가 천천히 움직였는지 정량화합니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 누적 거리는 연속된 두 점 사이 거리의 합입니다.
  snippet: |-
    def trackLength(path):
        if len(path) < 2:
            return 0.0
        arr = np.array(path)
        diffs = np.diff(arr, axis=0)
        return float(np.sqrt((diffs ** 2).sum(axis=1)).sum())

    lengths = np.array([trackLength(path) for path in tracks.values()])
    fig = plt.figure(figsize=(7, 3))
    plt.hist(lengths, bins=20, color='steelblue')
    plt.xlabel('cumulative distance')
    plt.ylabel('count')
    fig
  exercise:
    prompt: "미션1: 길이 상위 5개 궤적의 좌표 시퀀스를 영상 위에 색깔별로 다른 선으로 그리세요. 미션2: 평균과 중앙값 길이를 출력하세요."
    starterCode: |-
      sortedIdx = sorted(tracks, key=lambda key: -trackLength(tracks[key]))[:5]
      palette = ['red', 'green', 'blue', 'orange', 'magenta']
      fig = plt.figure(figsize=(7, 5))
      plt.imshow(finalRgb)
      for trackIdx, color in zip(sortedIdx, palette):
          path = tracks[trackIdx]
          xs = [pt[0] for pt in path]
          ys = [pt[1] for pt in path]
          plt.plot(xs, ys, color=color, linewidth=2)
      plt.axis('off')
      fig
    hints:
    - 상위 정렬은 -length 키로 내림차순입니다.
    - "중앙값은 np.median(lengths) 한 줄입니다."
  check:
    noError: 궤적 통계와 그리기가 오류 없이 끝나야 합니다.
    resultCheck: lengths의 길이가 tracks의 점 개수와 같아야 합니다.
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
  - id: visionFeatures_08-optical_flow-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - first_corners
    - practice
    title: 광학 흐름 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: window·pyramid·termination 계약을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_optical_flow_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_optical_flow_contract(value):
            raise NotImplementedError
      solution: |
        def audit_optical_flow_contract(value):
            required = ['windowSize', 'pyramidLevels', 'maxIterations', 'epsilon']
            rules = [{'id': 'window', 'field': 'windowSize', 'kind': 'odd'}, {'id': 'levels', 'field': 'pyramidLevels', 'kind': 'range', 'min': 0, 'max': 16}, {'id': 'iterations', 'field': 'maxIterations', 'kind': 'range', 'min': 1, 'max': 1000}, {'id': 'epsilon', 'field': 'epsilon', 'kind': 'positive'}]
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
            return {"accepted": not missing and not violations, "topic": 'optical_flow', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.vision-features.visionFeatures_08.optical_flow-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_08.optical_flow-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_optical_flow_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              windowSize: 21
              pyramidLevels: 3
              maxIterations: 30
              epsilon: 0.01
          expectedReturn:
            accepted: true
            topic: optical_flow
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              pyramidLevels: 3
              maxIterations: 30
              epsilon: 0.01
          expectedReturn:
            accepted: false
            topic: optical_flow
            missing:
            - windowSize
            violations:
            - window
        - id: reports-topic-invariants
          arguments:
          - value:
              windowSize: 20
              pyramidLevels: 20
              maxIterations: 0
              epsilon: 0
          expectedReturn:
            accepted: false
            topic: optical_flow
            missing: []
            violations:
            - epsilon
            - iterations
            - levels
            - window
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: visionFeatures_08-optical_flow-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionFeatures_08-optical_flow-contract-audit-mastery
    title: 광학 흐름 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_optical_flow_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_optical_flow_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_optical_flow_result(expected, observed):
            identity = ['previousFrameHash', 'currentFrameHash']
            metrics = {'trackedRatio': 0.01}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'optical_flow', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.vision-features.visionFeatures_08.optical_flow-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_08.optical_flow-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_optical_flow_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              previousFrameHash: f1
              currentFrameHash: f2
              trackedRatio: 0.85
          - value:
              previousFrameHash: f1
              currentFrameHash: f2
              trackedRatio: 0.855
          expectedReturn:
            passed: true
            topic: optical_flow
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              previousFrameHash: f1
              currentFrameHash: f2
              trackedRatio: 0.85
          - value:
              previousFrameHash: x
              currentFrameHash: f2
              trackedRatio: 0.2
          expectedReturn:
            passed: false
            topic: optical_flow
            missing: []
            identityMismatch:
            - previousFrameHash
            metricDrift:
            - trackedRatio
        - id: reports-missing-result-fields
          arguments:
          - value:
              previousFrameHash: f1
              currentFrameHash: f2
              trackedRatio: 0.85
          - value: {}
          expectedReturn:
            passed: false
            topic: optical_flow
            missing:
            - currentFrameHash
            - previousFrameHash
            - trackedRatio
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: visionFeatures_08-optical_flow-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionFeatures_08-optical_flow-result-reconciliation-transfer
    title: 광학 흐름 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_optical_flow_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_optical_flow_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_optical_flow_evidence(stage):
            stages = {'source': {'action': 'validate optical flow frames', 'evidence': 'ordered frame pair and points', 'risk': 'wrong frame identity'}, 'estimate': {'action': 'estimate bounded optical flow', 'evidence': 'pyramid convergence trace', 'risk': 'unstable geometry'}, 'verify': {'action': 'verify optical flow result', 'evidence': 'tracked ratio and displacement', 'risk': 'confident but wrong tracking'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.vision-features.visionFeatures_08.optical_flow-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_08.optical_flow-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_optical_flow_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate optical flow frames
            evidence: ordered frame pair and points
            risk: wrong frame identity
        - id: recalls-estimate
          arguments:
          - value: estimate
          expectedReturn:
            action: estimate bounded optical flow
            evidence: pyramid convergence trace
            risk: unstable geometry
        - id: recalls-verify
          arguments:
          - value: verify
          expectedReturn:
            action: verify optical flow result
            evidence: tracked ratio and displacement
            risk: confident but wrong tracking
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};