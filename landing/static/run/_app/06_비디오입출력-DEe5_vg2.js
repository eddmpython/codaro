var e=`meta:
  id: visionFeatures_06
  title: 비디오 입출력
  order: 6
  category: visionFeatures
  difficulty: ⭐⭐
  badge: 기초
  packages:
  - matplotlib
  - numpy
  - opencv-python
  tags:
  - opencv
  - 비디오
  - VideoCapture
  - VideoWriter
  - 프레임
  seo:
    title: 비전 특징점 - 비디오 입출력
    description: cv2.VideoWriter로 합성 mp4를 만들고 VideoCapture로 한 프레임씩 읽습니다.
    keywords:
    - opencv
    - 비디오
    - VideoCapture
    - VideoWriter
    - 프레임
intro:
  emoji: 🎞
  goal: 비디오 파일을 만들고 프레임 단위로 읽는 OpenCV의 표준 입출력을 익힙니다.
  description: |-
    이 강의는 visionFeatures 트랙의 비디오 파트를 여는 입문 강의입니다. 외부 동영상에 의존하지 않도록 numpy로 합성 프레임을 만들어 mp4로 저장하고, 다시 읽어 한 프레임씩 분석하는 흐름을 배웁니다. 다음 강의들의 모든 영상 처리가 이 패턴 위에서 동작합니다.
  direction: 합성 mp4를 만든 뒤 VideoCapture로 한 프레임씩 읽어 분석합니다.
  benefits:
  - cv2.VideoWriter로 mp4 파일을 만들 수 있습니다.
  - cv2.VideoCapture로 프레임을 한 장씩 읽을 수 있습니다.
  - 프레임 인덱스, FPS, 총 프레임 수 등 메타데이터를 읽을 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 임시 경로 준비
      detail: OS temp 디렉터리에 mp4 경로를 만듭니다.
    - label: 2단계. VideoWriter 만들기
      detail: fourcc, fps, frame size를 정합니다.
    - label: 3단계. 합성 프레임 쓰기
      detail: 색이 천천히 변하는 프레임을 N장 기록합니다.
    - label: 4단계. VideoCapture로 메타데이터
      detail: fps, 총 프레임, 크기를 읽습니다.
    - label: 5단계. 프레임 루프와 시각화
      detail: 한 프레임씩 가져와 분석합니다.
    runtime:
    - label: 비전 환경
      detail: opencv-python의 VideoWriter/VideoCapture를 사용합니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: temp_path
  title: 1단계. 임시 경로 준비
  structuredPrimary: true
  subtitle: OS temp 디렉터리에 mp4 경로
  goal: OS temp 디렉터리에 동영상 파일 경로를 만듭니다.
  why: 학습 산출물이 저장소 루트를 오염시키지 않도록 OS 임시 경로에 둡니다.
  explanation: |-
    \`Path(tempfile.gettempdir()) / 'codaro_demo.mp4'\` 가 표준 패턴입니다. 학습용 동영상은 학습이 끝나면 삭제해도 되므로 OS가 관리하는 임시 디렉터리가 적합합니다.

    macOS는 보통 \`/var/folders/...\`, Windows는 \`C:\\Users\\...\\AppData\\Local\\Temp\\\`, Linux는 \`/tmp\` 입니다.
  tips:
  - 임시 파일 경로는 Path 객체로 다루면 join과 출력이 깔끔합니다.
  snippet: |-
    import cv2
    import numpy as np
    import matplotlib.pyplot as plt
    import tempfile
    from pathlib import Path

    videoPath = Path(tempfile.gettempdir()) / 'codaro_demo.mp4'
    str(videoPath)
  exercise:
    prompt: 별도 파일명 codaro_demo2.mp4를 가리키는 secondaryPath를 만드세요.
    starterCode: |-
      secondaryPath = Path(tempfile.gettempdir()) / ___
      str(secondaryPath)
    hints:
    - 빈칸은 따옴표를 포함한 파일명입니다.
    - 결과는 OS 임시 디렉터리 안의 두 번째 경로 문자열입니다.
  check:
    noError: 경로 생성이 오류 없이 끝나야 합니다.
    resultCheck: 결과 문자열이 'codaro_demo.mp4'로 끝나야 합니다.
- id: writer
  title: 2단계. VideoWriter 만들기
  structuredPrimary: true
  subtitle: fourcc, fps, frame size
  goal: VideoWriter 객체를 만들어 동영상 파일을 쓸 준비를 합니다.
  why: VideoWriter의 인자가 출력 동영상의 포맷·속도·해상도를 모두 결정합니다.
  explanation: |-
    \`cv2.VideoWriter_fourcc(*'mp4v')\` 는 mp4 코덱 코드입니다. \`cv2.VideoWriter(path, fourcc, fps, (w, h))\` 로 객체를 만듭니다. (w, h) 는 (가로, 세로) 순서입니다(이미지와 반대).

    \`writer.isOpened()\` 가 False면 코덱이 시스템에 없는 등의 이유로 파일이 열리지 않은 것입니다.
  tips:
  - VideoWriter의 frame size는 모든 프레임이 동일해야 합니다. 다른 크기 프레임을 쓰면 무시되거나 깨집니다.
  snippet: |-
    width, height = 320, 240
    fps = 24
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(str(videoPath), fourcc, fps, (width, height))
    writer.isOpened()
  exercise:
    prompt: fps를 30으로, 크기를 (640, 360)으로 바꾼 writerHd를 만드세요(파일명은 secondaryPath).
    starterCode: |-
      writerHd = cv2.VideoWriter(str(secondaryPath), fourcc, ___, (___, ___))
      writerHd.isOpened()
    hints:
    - fps는 정수입니다.
    - 가로 세로 순서를 헷갈리지 마세요.
  check:
    noError: VideoWriter 생성이 오류 없이 끝나야 합니다.
    resultCheck: writer.isOpened() 가 True여야 합니다.
- id: write_frames
  title: 3단계. 합성 프레임 쓰기
  structuredPrimary: true
  subtitle: 천천히 변하는 색 프레임
  goal: 색이 천천히 변하는 합성 프레임 N장을 동영상에 기록합니다.
  why: 학습용 동영상을 외부 파일 없이 만들 수 있다는 점이 핵심입니다.
  explanation: |-
    각 프레임을 numpy로 만들어 \`writer.write(frame)\` 으로 추가합니다. OpenCV는 BGR을 기대하므로 색을 정할 때 (B, G, R) 순서로 채웁니다.

    마지막에 \`writer.release()\` 를 호출해 버퍼를 비우고 파일을 닫습니다. 호출하지 않으면 파일이 깨집니다.
  tips:
  - 프레임마다 변화를 한 픽셀이라도 주면 다음 강의의 차분 검출에서 의미 있는 결과가 나옵니다.
  snippet: |-
    totalFrames = 60
    for idx in range(totalFrames):
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        intensity = int(255 * idx / max(totalFrames - 1, 1))
        frame[:] = (intensity, 100, 255 - intensity)
        cv2.circle(frame, (60 + idx * 4, 120), 20, (0, 255, 255), -1)
        writer.write(frame)
    writer.release()
    videoPath.exists(), videoPath.stat().st_size
  exercise:
    prompt: writerHd에도 같은 패턴으로 90 프레임을 쓰고 파일 크기를 확인하세요.
    starterCode: |-
      hdFrames = ___
      for idx in range(hdFrames):
          frame = np.zeros((360, 640, 3), dtype=np.uint8)
          intensity = int(255 * idx / max(hdFrames - 1, 1))
          frame[:] = (intensity, 50, 255 - intensity)
          writerHd.write(frame)
      writerHd.release()
      secondaryPath.exists(), secondaryPath.stat().st_size
    hints:
    - 정수 90을 빈칸에 넣으세요.
    - 파일 크기는 코덱 압축률에 따라 달라집니다.
  check:
    noError: write/release 루프가 오류 없이 끝나야 합니다.
    resultCheck: videoPath의 파일 크기가 0보다 커야 합니다.
- id: capture_meta
  title: 4단계. VideoCapture로 메타데이터
  structuredPrimary: true
  subtitle: fps, 총 프레임, 크기
  goal: cv2.VideoCapture 객체에서 동영상의 기본 정보를 읽습니다.
  why: 처리 전에 메타데이터를 확인하면 잘못된 입력에 의한 버그를 빨리 잡습니다.
  explanation: |-
    \`cap = cv2.VideoCapture(str(path))\` 로 열고, \`cap.get(cv2.CAP_PROP_FPS)\`, \`cap.get(cv2.CAP_PROP_FRAME_COUNT)\`, \`cap.get(cv2.CAP_PROP_FRAME_WIDTH)\` 같은 속성을 조회합니다.

    조회만 한다면 \`cap.release()\` 도 깔끔히 호출하는 것이 좋습니다.
  tips:
  - 일부 mp4 파일은 인덱스 손상으로 FRAME_COUNT가 0이 나올 수 있습니다. 그럴 땐 직접 루프를 돌려 셉니다.
  snippet: |-
    cap = cv2.VideoCapture(str(videoPath))
    info = {
        "fps": float(cap.get(cv2.CAP_PROP_FPS)),
        "count": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
        "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
    }
    cap.release()
    info
  exercise:
    prompt: secondaryPath의 메타데이터를 같은 방식으로 읽으세요.
    starterCode: |-
      capHd = cv2.VideoCapture(str(___))
      infoHd = {
          "fps": float(capHd.get(cv2.CAP_PROP_FPS)),
          "count": int(capHd.get(cv2.CAP_PROP_FRAME_COUNT)),
      }
      capHd.release()
      infoHd
    hints:
    - 빈칸은 경로 변수명입니다.
    - HD 동영상의 fps와 프레임 수가 의도와 같은지 확인하세요.
  check:
    noError: VideoCapture 열기/닫기가 오류 없이 끝나야 합니다.
    resultCheck: info의 fps와 count가 0보다 커야 합니다.
- id: frame_loop
  title: 5단계. 프레임 루프와 시각화
  structuredPrimary: true
  subtitle: 한 프레임씩 분석
  goal: 동영상을 처음부터 끝까지 읽으며 첫·중간·마지막 프레임을 시각화합니다.
  why: 프레임 루프는 모든 영상 처리 코드의 척추입니다.
  explanation: |-
    표준 패턴은 \`while True: ok, frame = cap.read(); if not ok: break\` 입니다. 프레임을 읽은 뒤 분석하거나 변환하고 다음 프레임으로 넘어갑니다.

    프레임은 BGR이므로 matplotlib으로 표시하려면 \`cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)\` 가 필요합니다.
  tips:
  - 영상 처리 코드는 메모리 효율을 위해 한 번에 한 프레임만 보관하는 것이 표준입니다.
  snippet: |-
    cap = cv2.VideoCapture(str(videoPath))
    samples = []
    idx = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if idx in (0, totalFrames // 2, totalFrames - 1):
            samples.append((idx, cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)))
        idx += 1
    cap.release()
    [s[0] for s in samples], len(samples)
  exercise:
    prompt: samples 리스트의 세 프레임을 1x3 그리드로 그리세요.
    starterCode: |-
      fig, axes = plt.subplots(1, 3, figsize=(12, 4))
      for axis, (sIdx, sFrame) in zip(axes, samples):
          axis.imshow(sFrame)
          axis.set_title(f'frame {sIdx}')
          axis.axis('off')
      fig
    hints:
    - 시각화는 imshow와 axis off 한 줄씩이면 충분합니다.
    - 세 프레임의 색이 분명히 달라야 합니다.
  check:
    noError: 프레임 루프와 시각화가 오류 없이 끝나야 합니다.
    resultCheck: len(samples) 가 3이어야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 합성 영상 분석 보고서
  goal: 합성한 영상의 모든 프레임 평균을 시간순으로 그래프로 그립니다.
  why: 프레임별 통계를 시간순으로 보면 영상에서 무엇이 변하는지 한눈에 봅니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 프레임별 통계는 영상 처리 디버깅의 첫 단계입니다.
  snippet: |-
    cap = cv2.VideoCapture(str(videoPath))
    means = []
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        means.append(float(frame.mean()))
    cap.release()
    fig = plt.figure(figsize=(7, 3))
    plt.plot(means)
    plt.xlabel('frame')
    plt.ylabel('mean brightness')
    fig
  exercise:
    prompt: "미션1: 채널별 평균(B, G, R)을 시간순으로 같은 차트에 세 색으로 그리세요. 미션2: 동영상에서 6프레임 간격으로 첫 12개 샘플을 골라 2x6 그리드로 시각화하세요."
    starterCode: |-
      cap = cv2.VideoCapture(str(videoPath))
      blue, green, red = [], [], []
      while True:
          ok, frame = cap.read()
          if not ok:
              break
          blue.append(float(frame[:, :, 0].mean()))
          green.append(float(frame[:, :, 1].mean()))
          red.append(float(frame[:, :, 2].mean()))
      cap.release()
      fig = plt.figure(figsize=(7, 3))
      plt.plot(blue, label='B', color='blue')
      plt.plot(green, label='G', color='green')
      plt.plot(red, label='R', color='red')
      plt.legend()
      fig
    hints:
    - 합성 프레임의 R, G, B 평균은 강의 3단계의 패턴에 따라 시간순으로 단조 변화합니다.
    - 그리드 시각화는 set() 같은 함수를 미리 호출해 두면 깔끔해집니다.
  check:
    noError: 프레임 루프와 그래프 그리기가 오류 없이 끝나야 합니다.
    resultCheck: means의 길이가 totalFrames와 같아야 합니다.
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
  - id: visionFeatures_06-video_io-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - temp_path
    - practice
    title: 비디오 입출력 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: FPS·frame size·codec·frame budget를 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_video_io_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_video_io_contract(value):
            raise NotImplementedError
      solution: |
        def audit_video_io_contract(value):
            required = ['fps', 'frameSize', 'codec', 'maxFrames']
            rules = [{'id': 'fps', 'field': 'fps', 'kind': 'range', 'min': 0.1, 'max': 240}, {'id': 'frame-size', 'field': 'frameSize', 'kind': 'length', 'value': 2}, {'id': 'codec', 'field': 'codec', 'kind': 'enum', 'values': ['mp4v', 'avc1', 'MJPG', 'VP80']}, {'id': 'frame-budget', 'field': 'maxFrames', 'kind': 'range', 'min': 1, 'max': 1000000}]
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
            return {"accepted": not missing and not violations, "topic": 'video_io', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.vision-features.visionFeatures_06.video_io-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_06.video_io-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_video_io_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              fps: 30
              frameSize:
              - 1920
              - 1080
              codec: mp4v
              maxFrames: 18000
          expectedReturn:
            accepted: true
            topic: video_io
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              frameSize:
              - 1920
              - 1080
              codec: mp4v
              maxFrames: 18000
          expectedReturn:
            accepted: false
            topic: video_io
            missing:
            - fps
            violations:
            - fps
        - id: reports-topic-invariants
          arguments:
          - value:
              fps: 0
              frameSize:
              - 1920
              codec: raw
              maxFrames: 0
          expectedReturn:
            accepted: false
            topic: video_io
            missing: []
            violations:
            - codec
            - fps
            - frame-budget
            - frame-size
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: visionFeatures_06-video_io-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionFeatures_06-video_io-contract-audit-mastery
    title: 비디오 입출력 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_video_io_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_video_io_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_video_io_result(expected, observed):
            identity = ['videoHash', 'codec']
            metrics = {'writtenFrames': 0}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'video_io', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.vision-features.visionFeatures_06.video_io-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_06.video_io-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_video_io_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              videoHash: v1
              codec: mp4v
              writtenFrames: 900
          - value:
              videoHash: v1
              codec: mp4v
              writtenFrames: 900
          expectedReturn:
            passed: true
            topic: video_io
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              videoHash: v1
              codec: mp4v
              writtenFrames: 900
          - value:
              videoHash: v2
              codec: raw
              writtenFrames: 850
          expectedReturn:
            passed: false
            topic: video_io
            missing: []
            identityMismatch:
            - codec
            - videoHash
            metricDrift:
            - writtenFrames
        - id: reports-missing-result-fields
          arguments:
          - value:
              videoHash: v1
              codec: mp4v
              writtenFrames: 900
          - value: {}
          expectedReturn:
            passed: false
            topic: video_io
            missing:
            - codec
            - videoHash
            - writtenFrames
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: visionFeatures_06-video_io-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionFeatures_06-video_io-result-reconciliation-transfer
    title: 비디오 입출력 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_video_io_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_video_io_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_video_io_evidence(stage):
            stages = {'source': {'action': 'validate video IO frames', 'evidence': 'container fps frame geometry', 'risk': 'wrong frame identity'}, 'estimate': {'action': 'estimate bounded video IO', 'evidence': 'decode-encode counters', 'risk': 'unstable geometry'}, 'verify': {'action': 'verify video IO result', 'evidence': 'reopened frame count and duration', 'risk': 'confident but wrong tracking'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.vision-features.visionFeatures_06.video_io-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-features.visionFeatures_06.video_io-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_video_io_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: validate video IO frames
            evidence: container fps frame geometry
            risk: wrong frame identity
        - id: recalls-estimate
          arguments:
          - value: estimate
          expectedReturn:
            action: estimate bounded video IO
            evidence: decode-encode counters
            risk: unstable geometry
        - id: recalls-verify
          arguments:
          - value: verify
          expectedReturn:
            action: verify video IO result
            evidence: reopened frame count and duration
            risk: confident but wrong tracking
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};