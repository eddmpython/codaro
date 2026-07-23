var e=`meta:
  id: visionFeatures_10
  title: 종합 - 영상 ROI 추적기
  order: 10
  category: visionFeatures
  difficulty: ⭐⭐⭐⭐
  badge: 심화
  packages:
  - matplotlib
  - numpy
  - opencv-contrib-python
  tags:
  - opencv
  - 종합프로젝트
  - ROI추적
  - 보고서
  - 비디오분석
  seo:
    title: 비전 특징점 - 종합 영상 ROI 추적기
    description: 비디오 IO, 광학 흐름, 트래커, 마스크를 한데 모아 영상 분석 보고서 한 장을 만듭니다.
    keywords:
    - ROI추적
    - 영상분석
    - 종합프로젝트
    - opencv
intro:
  emoji: 🧰
  goal: 6~9강의 도구를 종합해 영상에서 한 객체를 추적하고 보고서 한 장을 만드는 미니 파이프라인을 구현합니다.
  description: |-
    이 강의는 트랙의 마무리입니다. ROI 선택 → CSRT 트래커 추적 → 박스 시각화 → 면적·중심 통계까지 한 흐름을 함수로 묶어 다른 영상에도 그대로 적용할 수 있게 만듭니다. 결과는 트래킹된 박스가 그려진 마지막 프레임과 시계열 그래프 한 장으로 요약됩니다.
  direction: 영상 + 초기 박스를 입력받아 트래킹 결과와 요약 보고서를 반환하는 함수 trackAndReport를 만듭니다.
  benefits:
  - 영상 처리 파이프라인을 함수로 묶어 재사용할 수 있습니다.
  - 보고서 한 장(마지막 프레임 + 시계열) 으로 트래킹 결과를 요약하는 패턴을 익힙니다.
  - 향후 응용 트랙(visionApps) 에서 활용할 수 있는 기본 도구를 만듭니다.
  diagram:
    steps:
    - label: 1단계. 입력 표준화
      detail: 영상 경로와 박스를 함수 인자로 정리합니다.
    - label: 2단계. 트래킹 함수
      detail: 한 함수로 박스 시퀀스를 얻습니다.
    - label: 3단계. 결과 시각화
      detail: 마지막 프레임 + 시계열을 한 figure에 그립니다.
    - label: 4단계. 새 영상으로 검증
      detail: 다른 이동 패턴의 영상을 만들어 적용합니다.
    - label: 5단계. 보고서 함수화
      detail: trackAndReport 한 호출에 모든 단계를 모읍니다.
    runtime:
    - label: 비전 환경
      detail: opencv-python의 VideoCapture와 TrackerCSRT를 사용합니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: input_spec
  title: 1단계. 입력 표준화
  structuredPrimary: true
  subtitle: 영상과 초기 박스
  goal: 영상 파일과 초기 박스를 함수 인자로 통일합니다.
  why: 다른 영상에 재사용하려면 함수 시그니처가 분명해야 합니다.
  explanation: |-
    \`trackBoxes(videoPath, initialBox)\` 가 표준 형식입니다. videoPath는 mp4 경로, initialBox는 (x, y, w, h) 튜플입니다.

    기본 영상은 6강에서 만든 codaro_demo.mp4입니다.
  tips:
  - 함수 인자가 명확할수록 다른 영상으로의 확장이 쉽습니다.
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

    defaultBox = (40, 100, 40, 40)
    defaultBox
  exercise:
    prompt: 영상이 존재하는지 검사하는 한 줄을 작성하세요.
    starterCode: |-
      videoPath.___()
    hints:
    - 빈칸은 Path 객체의 메서드 이름입니다.
    - 결과는 True 여야 합니다.
  check:
    noError: 영상 준비가 오류 없이 끝나야 합니다.
    resultCheck: videoPath.exists() 가 True여야 합니다.
- id: tracker_function
  title: 2단계. 트래킹 함수
  structuredPrimary: true
  subtitle: 박스 시퀀스 반환
  goal: 함수 한 개에 트래킹 흐름을 묶어 박스 시퀀스를 반환합니다.
  why: 트래킹 로직을 함수에 모아야 다른 영상에도 같은 결과를 빠르게 얻을 수 있습니다.
  explanation: |-
    함수 내부에서 트래커 생성, 첫 프레임 init, 프레임 루프 update를 수행합니다. 결과는 \`(ok, (x, y, w, h))\` 튜플 리스트로 반환합니다.
  tips:
  - 함수가 영상 파일을 열고 반드시 release를 호출해야 합니다.
  snippet: |-
    def trackBoxes(path, box):
        cap = cv2.VideoCapture(str(path))
        ok, firstFrame = cap.read()
        if not ok:
            cap.release()
            return []
        tracker = cv2.TrackerCSRT_create()
        tracker.init(firstFrame, box)
        boxes = [(True, tuple(int(v) for v in box))]
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            success, newBox = tracker.update(frame)
            boxes.append((bool(success), tuple(int(round(v)) for v in newBox)))
        cap.release()
        return boxes

    sequence = trackBoxes(videoPath, defaultBox)
    len(sequence), sequence[0], sequence[-1]
  exercise:
    prompt: 같은 함수를 더 작은 박스 (50, 110, 20, 20) 로 호출하고 결과 길이를 확인하세요.
    starterCode: |-
      smallSequence = trackBoxes(videoPath, (50, ___, 20, 20))
      len(smallSequence)
    hints:
    - 빈칸은 정수 110입니다.
    - 작은 박스에서도 합성 영상은 보통 잘 추적됩니다.
  check:
    noError: 트래킹 함수 호출이 오류 없이 끝나야 합니다.
    resultCheck: len(sequence) 가 60 정도여야 합니다.
- id: result_panel
  title: 3단계. 결과 시각화
  structuredPrimary: true
  subtitle: 마지막 프레임 + 시계열
  goal: 보고서용 figure 한 장에 마지막 프레임 박스와 중심 시계열을 함께 그립니다.
  why: 보고서 한 장이면 시각·정량 정보가 모두 들어 있어 빠르게 결과를 공유할 수 있습니다.
  explanation: |-
    한 figure에 1x2 subplots를 두고 좌측은 마지막 프레임 + 박스, 우측은 시계열 그래프를 그립니다. matplotlib의 GridSpec을 쓰면 비율을 자유롭게 조절할 수 있지만 여기서는 단순한 1x2로 충분합니다.
  tips:
  - 시계열에 frame index를 x축으로 두면 시간 흐름이 자연스럽게 보입니다.
  snippet: |-
    cap = cv2.VideoCapture(str(videoPath))
    finalBgr = None
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        finalBgr = frame
    cap.release()
    centers = np.array([(b[0] + b[2] / 2, b[1] + b[3] / 2) for _, b in sequence])
    finalRgb = cv2.cvtColor(finalBgr, cv2.COLOR_BGR2RGB)
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))
    boxFinal = sequence[-1][1]
    x, y, w, h = boxFinal
    drawn = finalRgb.copy()
    cv2.rectangle(drawn, (x, y), (x + w, y + h), (0, 255, 0), 2)
    axes[0].imshow(drawn)
    axes[0].set_title('final box')
    axes[0].axis('off')
    axes[1].plot(centers[:, 0], label='x')
    axes[1].plot(centers[:, 1], label='y')
    axes[1].set_xlabel('frame')
    axes[1].set_ylabel('center')
    axes[1].legend()
    fig
  exercise:
    prompt: 같은 figure에 박스 면적(w*h) 시계열을 새 axes로 추가해 1x3 그리드로 만드세요.
    starterCode: |-
      areas = np.array([b[2] * b[3] for _, b in sequence])
      fig, axes = plt.subplots(1, 3, figsize=(16, 4))
      axes[0].imshow(drawn)
      axes[0].axis('off')
      axes[1].plot(centers[:, 0], label='x')
      axes[1].plot(centers[:, 1], label='y')
      axes[1].legend()
      axes[2].plot(___)
      axes[2].set_title('area')
      fig
    hints:
    - axes[2].plot(areas) 가 빈칸의 답입니다.
    - 합성 영상에서는 박스 면적이 거의 일정해야 합니다.
  check:
    noError: 보고서 시각화가 오류 없이 끝나야 합니다.
    resultCheck: centers의 shape 마지막 차원이 2여야 합니다.
- id: new_video
  title: 4단계. 새 영상으로 검증
  structuredPrimary: true
  subtitle: 다른 이동 패턴
  goal: 다른 이동 패턴의 영상을 만들어 같은 함수로 추적해 봅니다.
  why: 같은 함수가 다른 영상에서도 동작해야 진정한 재사용입니다.
  explanation: |-
    사선으로 이동하는 원을 그린 영상을 만들고 같은 트래킹 함수를 호출합니다. 박스 시퀀스의 중심 시계열이 사선 모양이 되어야 합니다.
  tips:
  - 합성 영상을 만들 때 객체의 이동 패턴을 명확히 알면 트래킹 평가가 쉬워집니다.
  snippet: |-
    diagonalPath = Path(tempfile.gettempdir()) / 'codaro_demo_diag.mp4'
    width, height = 320, 240
    fps = 24
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(str(diagonalPath), fourcc, fps, (width, height))
    for idx in range(60):
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[:] = (40, 40, 40)
        cv2.circle(frame, (40 + idx * 4, 40 + idx * 2), 18, (0, 200, 255), -1)
        writer.write(frame)
    writer.release()
    diagSequence = trackBoxes(diagonalPath, (20, 20, 40, 40))
    len(diagSequence)
  exercise:
    prompt: diagSequence의 중심 시계열을 그래프로 그리세요.
    starterCode: |-
      diagCenters = np.array([(b[0] + b[2] / 2, b[1] + b[3] / 2) for _, b in diagSequence])
      fig = plt.figure(figsize=(8, 3))
      plt.plot(diagCenters[:, 0], label='x')
      plt.plot(diagCenters[:, 1], label='___')
      plt.legend()
      fig
    hints:
    - 빈칸은 'y' 입니다.
    - 결과는 두 선이 함께 우상향해야 합니다.
  check:
    noError: 영상 생성과 추적이 오류 없이 끝나야 합니다.
    resultCheck: len(diagSequence) 가 60 정도여야 합니다.
- id: report_function
  title: 5단계. 보고서 함수화
  structuredPrimary: true
  subtitle: 한 호출에 모든 단계
  goal: 트래킹과 보고서 생성을 한 함수 trackAndReport로 묶습니다.
  why: 외부 호출자에게 단일 진입점을 제공하면 응용 코드가 단순해집니다.
  explanation: |-
    \`trackAndReport(path, box)\` 는 박스 시퀀스, 중심 시계열, 보고서 figure 세 가지를 반환합니다. 다음 트랙 visionApps에서 이 함수를 그대로 호출할 수 있습니다.
  tips:
  - 보고서 함수의 반환을 명확히 정의해 두면 후속 코드가 쉽게 붙습니다.
  snippet: |-
    def trackAndReport(path, box):
        sequenceLocal = trackBoxes(path, box)
        if not sequenceLocal:
            return [], np.empty((0, 2)), None
        centersLocal = np.array([(b[0] + b[2] / 2, b[1] + b[3] / 2) for _, b in sequenceLocal])
        cap = cv2.VideoCapture(str(path))
        finalBgrLocal = None
        while True:
            okLocal, frameLocal = cap.read()
            if not okLocal:
                break
            finalBgrLocal = frameLocal
        cap.release()
        finalRgbLocal = cv2.cvtColor(finalBgrLocal, cv2.COLOR_BGR2RGB) if finalBgrLocal is not None else None
        figLocal, axesLocal = plt.subplots(1, 2, figsize=(12, 4))
        if finalRgbLocal is not None:
            drawnLocal = finalRgbLocal.copy()
            x2, y2, w2, h2 = sequenceLocal[-1][1]
            cv2.rectangle(drawnLocal, (x2, y2), (x2 + w2, y2 + h2), (0, 255, 0), 2)
            axesLocal[0].imshow(drawnLocal)
        axesLocal[0].set_title('final box')
        axesLocal[0].axis('off')
        axesLocal[1].plot(centersLocal[:, 0], label='x')
        axesLocal[1].plot(centersLocal[:, 1], label='y')
        axesLocal[1].set_xlabel('frame')
        axesLocal[1].set_ylabel('center')
        axesLocal[1].legend()
        return sequenceLocal, centersLocal, figLocal

    seqA, centersA, figA = trackAndReport(videoPath, defaultBox)
    len(seqA), centersA.shape, figA
  exercise:
    prompt: trackAndReport를 diagonalPath와 (20, 20, 40, 40) 박스로 다시 호출해 결과 figure를 화면에 표시하세요.
    starterCode: |-
      seqB, centersB, figB = trackAndReport(diagonalPath, (___, 20, 40, 40))
      figB
    hints:
    - 빈칸은 정수 20입니다.
    - figB가 마지막 줄로 평가되면 노트북에서 자동 출력됩니다.
  check:
    noError: 보고서 함수 호출이 오류 없이 끝나야 합니다.
    resultCheck: centersA.shape 의 마지막 차원이 2여야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 여러 영상 비교
  goal: 두 영상에 같은 함수를 적용한 결과를 한 화면에 비교합니다.
  why: 같은 함수의 결과를 두 입력에서 비교하면 결과 해석이 풍부해집니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 다른 영상 추가는 5단계 합성 영상 코드 패턴을 그대로 활용하면 됩니다.
  snippet: |-
    seqB, centersB, figB = trackAndReport(diagonalPath, (20, 20, 40, 40))

    fig = plt.figure(figsize=(8, 3))
    plt.plot(centersA[:, 0], label='video1 x')
    plt.plot(centersB[:, 0], label='video2 x')
    plt.xlabel('frame')
    plt.ylabel('center x')
    plt.legend()
    fig
  exercise:
    prompt: "미션1: 두 영상의 박스 면적 시계열을 비교하는 차트를 만드세요. 미션2: 두 영상의 마지막 프레임 박스 좌표를 dict로 정리해 출력하세요."
    starterCode: |-
      areasA = np.array([b[2] * b[3] for _, b in seqA])
      areasB = np.array([b[2] * b[3] for _, b in seqB])
      fig = plt.figure(figsize=(8, 3))
      plt.plot(areasA, label='video1')
      plt.plot(areasB, label='video2')
      plt.legend()
      fig
    hints:
    - 마지막 박스 좌표는 sequence[-1][1] 입니다.
    - 두 비교 결과가 의미 있게 다르면 함수가 잘 동작한 것입니다.
  check:
    noError: 비교 시각화가 오류 없이 끝나야 합니다.
    resultCheck: areasA와 areasB의 길이가 양수여야 합니다.
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
  - id: visionFeatures_10-video_roi_capstone-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - input_spec
    - practice
    title: 영상 ROI 추적기 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: ROI·frame budget·evidence cadence·fallback 계약을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_video_roi_capstone_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_video_roi_capstone_contract(value):
            raise NotImplementedError
      solution: |
        def audit_video_roi_capstone_contract(value):
            required = ['roi', 'maxFrames', 'evidenceInterval', 'fallback']
            rules = [{'id': 'roi', 'field': 'roi', 'kind': 'length', 'value': 4}, {'id': 'frame-budget', 'field': 'maxFrames', 'kind': 'range', 'min': 1, 'max': 1000000}, {'id': 'evidence-interval', 'field': 'evidenceInterval', 'kind': 'range', 'min': 1, 'max': 10000}, {'id': 'fallback', 'field': 'fallback', 'kind': 'enum', 'values': ['redetect', 'stop-and-report']}]
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
            return {"accepted": not missing and not violations, "topic": 'video_roi_capstone', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.vision-features.visionFeatures_10.video_roi_capstone-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_10.video_roi_capstone-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_video_roi_capstone_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              roi:
              - 100
              - 80
              - 200
              - 160
              maxFrames: 1800
              evidenceInterval: 60
              fallback: redetect
          expectedReturn:
            accepted: true
            topic: video_roi_capstone
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              maxFrames: 1800
              evidenceInterval: 60
              fallback: redetect
          expectedReturn:
            accepted: false
            topic: video_roi_capstone
            missing:
            - roi
            violations:
            - roi
        - id: reports-topic-invariants
          arguments:
          - value:
              roi:
              - 100
              - 80
              maxFrames: 0
              evidenceInterval: 0
              fallback: guess
          expectedReturn:
            accepted: false
            topic: video_roi_capstone
            missing: []
            violations:
            - evidence-interval
            - fallback
            - frame-budget
            - roi
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: visionFeatures_10-video_roi_capstone-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionFeatures_10-video_roi_capstone-contract-audit-mastery
    title: 영상 ROI 추적기 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_video_roi_capstone_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_video_roi_capstone_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_video_roi_capstone_result(expected, observed):
            identity = ['videoHash', 'trackId']
            metrics = {'evidenceFrames': 1}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'video_roi_capstone', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.vision-features.visionFeatures_10.video_roi_capstone-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_10.video_roi_capstone-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_video_roi_capstone_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              videoHash: roi1
              trackId: asset-1
              evidenceFrames: 30
          - value:
              videoHash: roi1
              trackId: asset-1
              evidenceFrames: 31
          expectedReturn:
            passed: true
            topic: video_roi_capstone
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              videoHash: roi1
              trackId: asset-1
              evidenceFrames: 30
          - value:
              videoHash: roi2
              trackId: asset-2
              evidenceFrames: 4
          expectedReturn:
            passed: false
            topic: video_roi_capstone
            missing: []
            identityMismatch:
            - trackId
            - videoHash
            metricDrift:
            - evidenceFrames
        - id: reports-missing-result-fields
          arguments:
          - value:
              videoHash: roi1
              trackId: asset-1
              evidenceFrames: 30
          - value: {}
          expectedReturn:
            passed: false
            topic: video_roi_capstone
            missing:
            - evidenceFrames
            - trackId
            - videoHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: visionFeatures_10-video_roi_capstone-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionFeatures_10-video_roi_capstone-result-reconciliation-transfer
    title: 영상 ROI 추적기 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_video_roi_capstone_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_video_roi_capstone_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_video_roi_capstone_evidence(stage):
            stages = {'source': {'action': 'validate ROI tracker frames', 'evidence': 'video ROI and budget', 'risk': 'wrong frame identity'}, 'estimate': {'action': 'estimate bounded ROI tracker', 'evidence': 'track-fallback state ledger', 'risk': 'unstable geometry'}, 'verify': {'action': 'verify ROI tracker result', 'evidence': 'sampled overlays and completion', 'risk': 'confident but wrong tracking'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.vision-features.visionFeatures_10.video_roi_capstone-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_10.video_roi_capstone-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_video_roi_capstone_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate ROI tracker frames
            evidence: video ROI and budget
            risk: wrong frame identity
        - id: recalls-estimate
          arguments:
          - value: estimate
          expectedReturn:
            action: estimate bounded ROI tracker
            evidence: track-fallback state ledger
            risk: unstable geometry
        - id: recalls-verify
          arguments:
          - value: verify
          expectedReturn:
            action: verify ROI tracker result
            evidence: sampled overlays and completion
            risk: confident but wrong tracking
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};