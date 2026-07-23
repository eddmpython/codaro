var e=`meta:
  id: visionApps_02
  title: QR과 바코드 리더
  order: 2
  category: visionApps
  difficulty: ⭐⭐
  badge: 기초
  packages:
  - matplotlib
  - numpy
  - opencv-python
  tags:
  - opencv
  - QR
  - 바코드
  - QRCodeDetector
  - 디코드
  seo:
    title: 비전 응용 - QR과 바코드 리더
    description: opencv 내장 QRCodeDetector로 사진의 QR 코드를 한 줄로 읽습니다.
    keywords:
    - QR
    - 바코드
    - 디코드
    - QRCodeDetector
    - opencv
intro:
  emoji: 🔳
  goal: 사진에서 QR 코드를 자동으로 찾아 디코드 결과를 받습니다.
  description: |-
    상품 가격, 결제, 자료 링크, Wi-Fi 비밀번호 - QR과 바코드는 일상에 깊이 들어와 있습니다. OpenCV 4.0+ 부터 QRCodeDetector가 내장되어 한 줄 호출로 인코딩과 디코딩이 가능합니다. 이 강의는 QR 합성 → 사진 합성 → 디코드의 흐름으로 응용 코드를 직접 만듭니다.
  direction: QR 코드를 만들고 사진에 합성한 뒤 OpenCV로 자동 디코드합니다.
  benefits:
  - cv2.QRCodeDetector.detectAndDecode를 한 줄로 호출할 수 있습니다.
  - QR이 사진 안에 있을 때 검출과 디코딩 결과를 동시에 받습니다.
  - 디코드 결과를 시각화에 표시하는 패턴을 익힙니다.
  diagram:
    steps:
    - label: 1단계. QR 인코딩
      detail: 텍스트 → QR 이미지.
    - label: 2단계. 사진에 QR 합성
      detail: 작은 QR을 사진의 일부에 배치.
    - label: 3단계. detectAndDecode
      detail: 한 줄 호출로 결과 받기.
    - label: 4단계. 박스 시각화
      detail: 검출된 영역 표시.
    - label: 5단계. 여러 QR 처리
      detail: detectAndDecodeMulti.
    runtime:
    - label: 비전 환경
      detail: opencv-python 4.0 이상이 필요합니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: encode
  title: 1단계. QR 인코딩
  structuredPrimary: true
  subtitle: 텍스트 → QR 이미지
  goal: 텍스트를 QR 이미지로 인코딩합니다.
  why: 학습 환경에서 외부 QR 파일 없이 즉시 입력을 만들 수 있어야 합니다.
  explanation: |-
    \`qrEncoder = cv2.QRCodeEncoder.create()\` 객체를 만들고 \`qrEncoder.encode(text)\` 로 흑백 QR 이미지를 얻습니다. 결과는 정사각형 ndarray입니다.

    OpenCV 버전이 낮으면 QRCodeEncoder가 없을 수 있습니다. 그럴 때는 직접 만든 QR 이미지 파일을 사용해야 합니다.
  tips:
  - QR 인코더는 보통 작은 크기로 결과를 만듭니다. cv2.resize로 키울 수 있습니다.
  snippet: |-
    import cv2
    import numpy as np
    import matplotlib.pyplot as plt

    qrEncoder = cv2.QRCodeEncoder.create()
    qrSmall = qrEncoder.encode("https://codaro.example")
    qrSmall.shape, qrSmall.dtype
  exercise:
    prompt: 같은 인코더로 다른 텍스트를 인코딩한 qrAnother를 만드세요.
    starterCode: |-
      qrAnother = qrEncoder.encode("___")
      qrAnother.shape
    hints:
    - '빈칸은 임의 문자열입니다(예: "hello").'
    - 짧은 텍스트는 작은 QR이 됩니다.
  check:
    noError: QR 인코딩이 오류 없이 끝나야 합니다.
    resultCheck: qrSmall.ndim이 2여야 합니다.
- id: place_on_photo
  title: 2단계. 사진에 QR 합성
  structuredPrimary: true
  subtitle: 사진의 일부에 배치
  goal: 흰 캔버스에 QR을 배치해 사진처럼 보이는 입력을 만듭니다.
  why: 실제 사진에서 QR을 찾는 시뮬레이션을 위해 캔버스에 합성합니다.
  explanation: |-
    QR을 큰 크기로 키운 뒤(cv2.resize), 흰 캔버스의 특정 위치에 슬라이싱으로 붙입니다. 가장자리에 여백을 두면 검출이 안정적입니다.

    합성 캔버스는 컬러(3채널) 로 만들어야 다음 단계 디코더가 받을 수 있는 형식이 됩니다.
  tips:
  - QR 주변에 여백이 부족하면 검출 실패율이 올라갑니다. 흰 여백을 충분히 두세요.
  snippet: |-
    qrBig = cv2.resize(qrSmall, (180, 180), interpolation=cv2.INTER_NEAREST)
    qrBig = qrBig if qrBig.ndim == 3 else cv2.cvtColor(qrBig, cv2.COLOR_GRAY2BGR)
    canvas = np.full((400, 600, 3), 240, dtype=np.uint8)
    cv2.putText(canvas, "Codaro QR demo", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (40, 40, 40), 2)
    canvas[120:300, 300:480] = qrBig
    canvas.shape
  exercise:
    prompt: canvas를 시각화하세요.
    starterCode: |-
      fig = plt.figure(figsize=(7, 4))
      plt.imshow(canvas)
      plt.axis('___')
      fig
    hints:
    - 빈칸은 'off' 입니다.
    - 텍스트와 QR이 모두 보여야 합니다.
  check:
    noError: 합성이 오류 없이 끝나야 합니다.
    resultCheck: canvas.shape이 (400, 600, 3) 이어야 합니다.
- id: decode
  title: 3단계. detectAndDecode
  structuredPrimary: true
  subtitle: 한 줄 호출
  goal: 합성한 사진에서 QR을 검출하고 디코드합니다.
  why: 응용 코드의 핵심은 결국 한 줄 호출입니다.
  explanation: |-
    \`qrDecoder = cv2.QRCodeDetector()\` 객체를 만들고 \`qrDecoder.detectAndDecode(canvas)\` 를 호출합니다. 결과는 \`(decoded_text, bounding_box, straight_qr)\` 튜플입니다.

    decoded_text가 빈 문자열이면 검출은 됐지만 디코드는 실패한 경우입니다.
  tips:
  - 검출과 디코딩은 단일 호출에 묶여 있어 응용 코드를 단순하게 만듭니다.
  snippet: |-
    qrDecoder = cv2.QRCodeDetector()
    decoded, box, _ = qrDecoder.detectAndDecode(canvas)
    decoded, None if box is None else box.shape
  exercise:
    prompt: QR을 90도 회전한 캔버스 rotatedCanvas로도 디코드를 시도하세요.
    starterCode: |-
      rotatedCanvas = np.rot90(canvas, k=1).copy()
      decodedRot, boxRot, _ = qrDecoder.detectAndDecode(___)
      decodedRot
    hints:
    - 빈칸은 rotatedCanvas 변수입니다.
    - QR 디코더는 회전된 QR도 잘 읽어야 합니다.
  check:
    noError: 디코드가 오류 없이 끝나야 합니다.
    resultCheck: decoded가 'https://codaro.example' 와 같아야 합니다(빈 문자열일 수도 있으면 실패).
- id: draw_box
  title: 4단계. 박스 시각화
  structuredPrimary: true
  subtitle: 검출 영역 표시
  goal: 디코드된 QR의 박스를 원본에 그려 검출 영역을 표시합니다.
  why: 다중 QR이나 디버깅 시 검출 영역을 시각화하면 결과가 명료해집니다.
  explanation: |-
    box는 (1, 4, 2) 모양으로 QR의 네 꼭짓점입니다. cv2.polylines로 한 줄에 그릴 수 있습니다.

    matplotlib에서는 patches.Polygon 으로도 그릴 수 있지만 cv2.polylines가 더 간단합니다.
  tips:
  - 디코드 결과 텍스트도 함께 표시하면 사진 한 장에 결과가 압축됩니다.
  snippet: |-
    if box is not None:
        drawn = canvas.copy()
        cv2.polylines(drawn, [box.astype(int)], True, (0, 255, 0), 3)
        if decoded:
            cv2.putText(drawn, decoded, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 128, 0), 2)
    else:
        drawn = canvas
    fig = plt.figure(figsize=(7, 4))
    plt.imshow(drawn)
    plt.axis('off')
    fig
  exercise:
    prompt: 회전된 캔버스에 대해서도 같은 시각화를 만드세요.
    starterCode: |-
      if boxRot is not None:
          drawnRot = rotatedCanvas.copy()
          cv2.polylines(drawnRot, [boxRot.astype(int)], True, (0, 255, 0), ___)
      else:
          drawnRot = rotatedCanvas
      fig2 = plt.figure(figsize=(4, 6))
      plt.imshow(drawnRot)
      plt.axis('off')
      fig2
    hints:
    - 빈칸은 정수 3 입니다(선 두께).
    - 박스가 QR을 정확히 감싸야 합니다.
  check:
    noError: 시각화가 오류 없이 끝나야 합니다.
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.
- id: multi
  title: 5단계. 여러 QR 처리
  structuredPrimary: true
  subtitle: detectAndDecodeMulti
  goal: 한 사진에 여러 QR이 있을 때 모두 찾아 디코드합니다.
  why: 실제 응용에서는 한 사진에 여러 코드가 있을 수 있습니다.
  explanation: |-
    \`detectAndDecodeMulti\` 는 \`(success, decoded_list, boxes, qr_codes)\` 를 반환합니다. decoded_list는 디코드된 문자열 리스트입니다.

    여러 QR을 합성한 캔버스로 동작을 확인합니다.
  tips:
  - 여러 QR 검출은 단일 검출보다 더 큰 캔버스를 입력으로 받는 것이 안정적입니다.
  snippet: |-
    qrA = cv2.resize(qrEncoder.encode("code-A"), (150, 150), interpolation=cv2.INTER_NEAREST)
    qrB = cv2.resize(qrEncoder.encode("code-B"), (150, 150), interpolation=cv2.INTER_NEAREST)
    qrA = qrA if qrA.ndim == 3 else cv2.cvtColor(qrA, cv2.COLOR_GRAY2BGR)
    qrB = qrB if qrB.ndim == 3 else cv2.cvtColor(qrB, cv2.COLOR_GRAY2BGR)
    multiCanvas = np.full((300, 600, 3), 240, dtype=np.uint8)
    multiCanvas[60:210, 50:200] = qrA
    multiCanvas[60:210, 400:550] = qrB
    success, decodedList, boxes, _ = qrDecoder.detectAndDecodeMulti(multiCanvas)
    success, decodedList
  exercise:
    prompt: 검출된 박스를 multiCanvas 위에 그려 시각화하세요.
    starterCode: |-
      if boxes is not None:
          drawnMulti = multiCanvas.copy()
          for boxArr in boxes:
              cv2.polylines(drawnMulti, [boxArr.astype(int)], True, (255, 0, 0), 2)
      else:
          drawnMulti = multiCanvas
      fig = plt.figure(figsize=(7, 3))
      plt.imshow(drawnMulti)
      plt.axis('___')
      fig
    hints:
    - 빈칸은 'off' 입니다.
    - 두 QR이 모두 박스로 표시되어야 합니다.
  check:
    noError: 다중 디코드가 오류 없이 끝나야 합니다.
    resultCheck: success가 True여야 하고 decodedList의 길이가 2여야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: QR 응용 함수
  goal: 사진을 입력으로 받아 디코드된 텍스트 리스트를 반환하는 함수를 만듭니다.
  why: 함수로 묶으면 자동 처리 파이프라인에 즉시 연결할 수 있습니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 검출이 실패한 경우 빈 리스트를 반환하는 일관된 인터페이스를 두는 것이 좋습니다.
  snippet: |-
    def readQrs(img):
        decoderLocal = cv2.QRCodeDetector()
        success, decodedListLocal, boxesLocal, _ = decoderLocal.detectAndDecodeMulti(img)
        if not success:
            return []
        return [text for text in decodedListLocal if text]

    readQrs(multiCanvas)
  exercise:
    prompt: "미션1: canvas, rotatedCanvas, multiCanvas 세 입력에 readQrs를 적용한 결과를 dict로 정리해 출력하세요. 미션2: QR이 없는 흰 캔버스를 함수에 통과시켜 빈 리스트가 반환되는지 확인하세요."
    starterCode: |-
      results = {
          "canvas": readQrs(canvas),
          "rotated": readQrs(rotatedCanvas),
          "multi": readQrs(___),
      }
      results
    hints:
    - 빈칸은 multiCanvas 변수입니다.
    - 결과 dict는 입력별 디코드 리스트입니다.
  check:
    noError: 응용 함수 호출이 오류 없이 끝나야 합니다.
    resultCheck: results의 'multi' 값 길이가 2여야 합니다.
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
  - id: visionApps_02-qr_barcode-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - encode
    - practice
    title: QR·바코드 리더 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 허용 format·code budget·checksum·ROI 계약을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_qr_barcode_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_qr_barcode_contract(value):
            raise NotImplementedError
      solution: |
        def audit_qr_barcode_contract(value):
            required = ['formats', 'maxCodes', 'requireChecksum', 'roi']
            rules = [{'id': 'formats', 'field': 'formats', 'kind': 'nonempty'}, {'id': 'max-codes', 'field': 'maxCodes', 'kind': 'range', 'min': 1, 'max': 1000}, {'id': 'checksum', 'field': 'requireChecksum', 'kind': 'enum', 'values': [True, False]}, {'id': 'roi', 'field': 'roi', 'kind': 'length', 'value': 4}]
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
            return {"accepted": not missing and not violations, "topic": 'qr_barcode', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.vision-apps.visionApps_02.qr_barcode-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_02.qr_barcode-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_qr_barcode_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              formats:
              - QR_CODE
              - EAN_13
              maxCodes: 20
              requireChecksum: true
              roi:
              - 0
              - 0
              - 1920
              - 1080
          expectedReturn:
            accepted: true
            topic: qr_barcode
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              maxCodes: 20
              requireChecksum: true
              roi:
              - 0
              - 0
              - 1920
              - 1080
          expectedReturn:
            accepted: false
            topic: qr_barcode
            missing:
            - formats
            violations:
            - formats
        - id: reports-topic-invariants
          arguments:
          - value:
              formats: []
              maxCodes: 0
              requireChecksum: 'yes'
              roi:
              - 0
              - 0
          expectedReturn:
            accepted: false
            topic: qr_barcode
            missing: []
            violations:
            - checksum
            - formats
            - max-codes
            - roi
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: visionApps_02-qr_barcode-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionApps_02-qr_barcode-contract-audit-mastery
    title: QR·바코드 리더 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_qr_barcode_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_qr_barcode_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_qr_barcode_result(expected, observed):
            identity = ['sourceHash', 'decoderVersion']
            metrics = {'decodedCount': 0}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'qr_barcode', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.vision-apps.visionApps_02.qr_barcode-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_02.qr_barcode-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_qr_barcode_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: qr1
              decoderVersion: zbar-a
              decodedCount: 3
          - value:
              sourceHash: qr1
              decoderVersion: zbar-a
              decodedCount: 3
          expectedReturn:
            passed: true
            topic: qr_barcode
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: qr1
              decoderVersion: zbar-a
              decodedCount: 3
          - value:
              sourceHash: qr2
              decoderVersion: other
              decodedCount: 20
          expectedReturn:
            passed: false
            topic: qr_barcode
            missing: []
            identityMismatch:
            - decoderVersion
            - sourceHash
            metricDrift:
            - decodedCount
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: qr1
              decoderVersion: zbar-a
              decodedCount: 3
          - value: {}
          expectedReturn:
            passed: false
            topic: qr_barcode
            missing:
            - decodedCount
            - decoderVersion
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: visionApps_02-qr_barcode-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionApps_02-qr_barcode-result-reconciliation-transfer
    title: QR·바코드 리더 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_qr_barcode_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_qr_barcode_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_qr_barcode_evidence(stage):
            stages = {'admission': {'action': 'admit barcode input safely', 'evidence': 'image ROI format allowlist', 'risk': 'privacy or source error'}, 'process': {'action': 'run bounded barcode workflow', 'evidence': 'decode and checksum trace', 'risk': 'unbounded or wrong transformation'}, 'release': {'action': 'release verified barcode result', 'evidence': 'redacted payload manifest', 'risk': 'wrong or sensitive output'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.vision-apps.visionApps_02.qr_barcode-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_02.qr_barcode-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_qr_barcode_evidence
        cases:
        - id: recalls-admission
          arguments:
          - value: admission
          expectedReturn:
            action: admit barcode input safely
            evidence: image ROI format allowlist
            risk: privacy or source error
        - id: recalls-process
          arguments:
          - value: process
          expectedReturn:
            action: run bounded barcode workflow
            evidence: decode and checksum trace
            risk: unbounded or wrong transformation
        - id: recalls-release
          arguments:
          - value: release
          expectedReturn:
            action: release verified barcode result
            evidence: redacted payload manifest
            risk: wrong or sensitive output
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};