var e=`meta:
  id: visionApps_03
  title: OCR 기초
  order: 3
  category: visionApps
  difficulty: ⭐⭐⭐
  badge: 기초
  packages:
  - matplotlib
  - numpy
  - opencv-python
  - pytesseract
  tags:
  - pytesseract
  - OCR
  - 텍스트추출
  - 전처리
  - 응용
  seo:
    title: 비전 응용 - OCR 기초
    description: pytesseract로 사진의 텍스트를 추출하고, 전처리로 정확도를 끌어올립니다.
    keywords:
    - OCR
    - pytesseract
    - 텍스트추출
    - 전처리
intro:
  emoji: 🔠
  goal: pytesseract로 사진의 텍스트를 추출하고 전처리로 정확도를 끌어올립니다.
  description: |-
    pytesseract는 Google이 만든 tesseract OCR 엔진을 파이썬에서 호출하는 래퍼입니다. 사진 한 장 → 텍스트 한 줄로 변환할 수 있어 영수증, 명함, 책 페이지 등의 자동 입력에 자주 쓰입니다. 이 강의는 합성 영문 이미지를 만들어 OCR을 호출하고 전처리로 결과를 개선합니다.
  direction: 합성 영문 이미지에 OCR을 적용하고 전처리(흑백·임곗값·확대) 효과를 비교합니다.
  benefits:
  - pytesseract.image_to_string으로 한 줄 OCR을 수행합니다.
  - 흑백·임곗값 전처리가 OCR 정확도에 미치는 영향을 비교합니다.
  - image_to_data로 텍스트 위치와 신뢰도를 함께 얻습니다.
  diagram:
    steps:
    - label: 1단계. Tesseract 실행 파일 확인
      detail: 시스템 의존성 점검.
    - label: 2단계. 합성 텍스트 이미지
      detail: 흰 캔버스 + 영문 텍스트.
    - label: 3단계. OCR 한 줄 호출
      detail: image_to_string.
    - label: 4단계. 전처리로 정확도 개선
      detail: 그레이 + 임곗값.
    - label: 5단계. 위치와 신뢰도
      detail: image_to_data dict.
    runtime:
    - label: OCR 환경
      detail: 시스템에 Tesseract OCR 실행 파일이 준비되어 있어야 합니다.
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: tesseract_ready_check
  title: 1단계. Tesseract 실행 파일 확인
  structuredPrimary: true
  subtitle: 시스템 의존성 점검
  goal: pytesseract가 시스템의 tesseract 바이너리를 찾을 수 있는지 확인합니다.
  why: OCR은 pytesseract 라이브러리 + 시스템 tesseract 바이너리 두 가지가 모두 필요합니다.
  explanation: |-
    \`pytesseract.get_tesseract_version()\` 이 버전 문자열을 돌려주면 시스템 실행 파일 준비가 정상입니다. 실패하면 OS에 Tesseract OCR 엔진을 먼저 준비해야 합니다.

    Windows에서는 설치 후 \`pytesseract.pytesseract.tesseract_cmd\` 에 실행 파일 경로를 명시해야 할 수도 있습니다.
  tips:
  - 시스템 실행 파일 준비가 어려운 환경이면 다음 강의의 easyocr(파이썬 패키지만으로 동작) 가 대안입니다.
  snippet: |-
    import pytesseract
    import cv2
    import numpy as np
    import matplotlib.pyplot as plt

    try:
        version = str(pytesseract.get_tesseract_version())
    except Exception as exc:
        version = f"unavailable: {exc.__class__.__name__}"
    version
  exercise:
    prompt: 같은 호출이 다시 실행되는지 두 번째 호출로 검증하세요.
    starterCode: |-
      try:
          versionSecond = str(pytesseract.get_tesseract_version())
      except Exception as exc:
          versionSecond = f"unavailable: {exc.__class__.__name__}"
      ___
    hints:
    - 빈칸은 versionSecond 변수입니다.
    - 두 번 호출해도 같은 결과여야 합니다.
  check:
    noError: 버전 호출 시도가 오류 없이 끝나야 합니다.
    resultCheck: version이 문자열이어야 합니다.
- id: synth_text
  title: 2단계. 합성 텍스트 이미지
  structuredPrimary: true
  subtitle: 흰 캔버스 + 영문 텍스트
  goal: cv2.putText로 학습용 영문 이미지를 만듭니다.
  why: 외부 사진 없이 OCR 흐름을 학습할 수 있도록 합성을 사용합니다.
  explanation: |-
    \`cv2.putText\` 의 FONT_HERSHEY_SIMPLEX는 단순한 영문 글꼴입니다. 굵기와 크기를 조절해 OCR이 잘 인식하는 사이즈로 그립니다.

    너무 작은 글꼴은 OCR이 어려워합니다. 한 문자가 최소 20 픽셀 이상이 권장입니다.
  tips:
  - tesseract는 검은 글씨 + 흰 배경에 가장 잘 동작합니다. 합성 시 이 패턴을 유지하세요.
  snippet: |-
    canvas = np.full((200, 500, 3), 255, dtype=np.uint8)
    cv2.putText(canvas, "Hello Codaro Vision", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (10, 10, 10), 2)
    cv2.putText(canvas, "OCR test image 2026", (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (40, 40, 40), 2)
    canvas.shape
  exercise:
    prompt: canvas를 시각화하세요.
    starterCode: |-
      fig = plt.figure(figsize=(7, 3))
      plt.imshow(canvas)
      plt.axis('___')
      fig
    hints:
    - 빈칸은 'off' 입니다.
    - 텍스트가 잘 보여야 합니다.
  check:
    noError: 합성과 시각화가 오류 없이 끝나야 합니다.
    resultCheck: canvas.shape이 (200, 500, 3) 이어야 합니다.
- id: ocr_call
  title: 3단계. OCR 한 줄 호출
  structuredPrimary: true
  subtitle: image_to_string
  goal: pytesseract.image_to_string 한 줄로 텍스트를 추출합니다.
  why: OCR의 핵심 호출은 한 줄이며, 결과 후처리가 응용의 본질입니다.
  explanation: |-
    \`pytesseract.image_to_string(canvas)\` 가 표준 호출입니다. 결과는 한 개 문자열로 줄바꿈으로 텍스트 줄이 구분됩니다.

    tesseract가 설치되지 않은 환경에서는 예외가 발생합니다. try/except로 안내 메시지를 두면 안전합니다.
  tips:
  - 결과 문자열의 앞뒤 공백과 빈 줄을 strip()으로 정리하는 후처리가 표준입니다.
  snippet: |-
    try:
        recognized = pytesseract.image_to_string(canvas)
    except Exception as exc:
        recognized = f"OCR failed: {exc.__class__.__name__}"
    recognized
  exercise:
    prompt: 결과 텍스트의 줄 수를 출력하세요(strip 후).
    starterCode: |-
      lines = [line for line in recognized.splitlines() if ___]
      len(lines)
    hints:
    - 빈칸은 line.strip() 입니다.
    - 합성 텍스트는 두 줄로 인식되어야 합니다.
  check:
    noError: OCR 호출 시도가 오류 없이 끝나야 합니다.
    resultCheck: recognized가 문자열이어야 합니다.
- id: preprocess
  title: 4단계. 전처리로 정확도 개선
  structuredPrimary: true
  subtitle: 그레이 + 임곗값
  goal: 흑백 변환과 임곗값 처리로 OCR 정확도를 높입니다.
  why: 컬러 사진을 그대로 OCR에 넣는 것보다 흑백 변환이 안정적입니다.
  explanation: |-
    \`cv2.cvtColor(canvas, cv2.COLOR_BGR2GRAY)\` 후 \`cv2.threshold\` 또는 \`cv2.adaptiveThreshold\` 로 이진화합니다. 이진화 결과를 OCR에 넘기면 더 깔끔한 결과를 얻을 수 있습니다.

    이진화 후 noise가 많으면 \`cv2.medianBlur\` 같은 단순 노이즈 제거를 함께 적용합니다.
  tips:
  - 전처리 효과는 합성 이미지에서는 미미합니다. 실제 사진에서 큰 차이를 만듭니다.
  snippet: |-
    gray = cv2.cvtColor(canvas, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    try:
        recognizedBinary = pytesseract.image_to_string(binary)
    except Exception as exc:
        recognizedBinary = f"OCR failed: {exc.__class__.__name__}"
    recognizedBinary
  exercise:
    prompt: 전처리 전후 결과 길이를 비교하세요.
    starterCode: |-
      lenOriginal = len(recognized.strip())
      lenBinary = len(___.strip())
      lenOriginal, lenBinary
    hints:
    - 빈칸은 recognizedBinary 변수입니다.
    - 합성 이미지에서는 두 길이가 비슷할 수 있습니다.
  check:
    noError: 전처리와 OCR이 오류 없이 끝나야 합니다.
    resultCheck: recognizedBinary가 문자열이어야 합니다.
- id: data
  title: 5단계. 위치와 신뢰도
  structuredPrimary: true
  subtitle: image_to_data dict
  goal: image_to_data로 각 단어의 박스와 신뢰도를 얻습니다.
  why: 단어별 위치는 폼 자동 입력, 영역별 텍스트 분리 등의 응용에 필요합니다.
  explanation: |-
    \`pytesseract.image_to_data(canvas, output_type=pytesseract.Output.DICT)\` 는 dict를 반환합니다. 키는 left, top, width, height, conf, text 등입니다. 같은 인덱스의 값들이 하나의 단어를 가리킵니다.

    conf가 -1 또는 매우 낮으면 신뢰할 수 없는 인식입니다.
  tips:
  - 단어 단위 결과는 zip으로 묶어 다루는 것이 깔끔합니다.
  snippet: |-
    try:
        ocrData = pytesseract.image_to_data(canvas, output_type=pytesseract.Output.DICT)
        wordsCount = sum(1 for text in ocrData['text'] if text.strip())
    except Exception as exc:
        ocrData = None
        wordsCount = -1
    wordsCount
  exercise:
    prompt: ocrData에서 처음 5개의 (text, conf) 쌍을 출력하세요.
    starterCode: |-
      if ocrData is not None:
          pairs = [(text, conf) for text, conf in zip(ocrData['text'], ocrData['conf']) if text.strip()][:___]
      else:
          pairs = []
      pairs
    hints:
    - 빈칸은 정수 5 입니다.
    - 결과는 (단어, 신뢰도) 튜플 5개입니다.
  check:
    noError: image_to_data 호출 시도가 오류 없이 끝나야 합니다.
    resultCheck: wordsCount가 -1 또는 정수여야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 박스 시각화
  goal: 인식된 단어의 박스를 사진에 그려 위치와 텍스트를 한 화면에 표시합니다.
  why: 응용에서는 어떤 텍스트가 어디에 있는지가 정보의 핵심입니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 박스가 너무 작거나 conf가 낮은 결과는 노이즈일 가능성이 큽니다. 필요하면 conf 임곗값으로 거르세요.
  snippet: |-
    from matplotlib.patches import Rectangle

    fig, axis = plt.subplots(figsize=(8, 4))
    axis.imshow(canvas)
    if ocrData is not None:
        for idx, text in enumerate(ocrData['text']):
            if not text.strip():
                continue
            x = ocrData['left'][idx]
            y = ocrData['top'][idx]
            w = ocrData['width'][idx]
            h = ocrData['height'][idx]
            axis.add_patch(Rectangle((x, y), w, h, edgecolor='red', facecolor='none', linewidth=1))
    axis.axis('off')
    fig
  exercise:
    prompt: "미션1: conf > 60 인 단어만 그리도록 필터를 추가하세요. 미션2: 인식된 단어 텍스트만 모은 리스트를 출력하세요."
    starterCode: |-
      fig, axis = plt.subplots(figsize=(8, 4))
      axis.imshow(canvas)
      if ocrData is not None:
          for idx, text in enumerate(ocrData['text']):
              try:
                  confValue = float(ocrData['conf'][idx])
              except ValueError:
                  confValue = -1
              if not text.strip() or confValue < ___:
                  continue
              x = ocrData['left'][idx]
              y = ocrData['top'][idx]
              w = ocrData['width'][idx]
              h = ocrData['height'][idx]
              axis.add_patch(Rectangle((x, y), w, h, edgecolor='green', facecolor='none', linewidth=1))
      axis.axis('off')
      fig
    hints:
    - 빈칸은 정수 60 입니다.
    - 깨끗한 박스만 남아야 합니다.
  check:
    noError: 박스 시각화가 오류 없이 끝나야 합니다.
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.
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
  - id: visionApps_03-ocr_basic-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - tesseract_ready_check
    - practice
    title: OCR 기초 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: language·page segmentation·confidence·character budget를 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_ocr_basic_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_ocr_basic_contract(value):
            raise NotImplementedError
      solution: |
        def audit_ocr_basic_contract(value):
            required = ['language', 'pageSegMode', 'minConfidence', 'maxCharacters']
            rules = [{'id': 'language', 'field': 'language', 'kind': 'nonempty'}, {'id': 'psm', 'field': 'pageSegMode', 'kind': 'range', 'min': 0, 'max': 13}, {'id': 'confidence', 'field': 'minConfidence', 'kind': 'unit-interval'}, {'id': 'characters', 'field': 'maxCharacters', 'kind': 'range', 'min': 1, 'max': 10000000}]
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
            return {"accepted": not missing and not violations, "topic": 'ocr_basic', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.vision-apps.visionApps_03.ocr_basic-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_03.ocr_basic-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_ocr_basic_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              language: eng
              pageSegMode: 6
              minConfidence: 0.6
              maxCharacters: 100000
          expectedReturn:
            accepted: true
            topic: ocr_basic
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              pageSegMode: 6
              minConfidence: 0.6
              maxCharacters: 100000
          expectedReturn:
            accepted: false
            topic: ocr_basic
            missing:
            - language
            violations:
            - language
        - id: reports-topic-invariants
          arguments:
          - value:
              language: ''
              pageSegMode: 20
              minConfidence: 2
              maxCharacters: 0
          expectedReturn:
            accepted: false
            topic: ocr_basic
            missing: []
            violations:
            - characters
            - confidence
            - language
            - psm
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: visionApps_03-ocr_basic-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionApps_03-ocr_basic-contract-audit-mastery
    title: OCR 기초 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_ocr_basic_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_ocr_basic_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_ocr_basic_result(expected, observed):
            identity = ['sourceHash', 'ocrEngineHash', 'language']
            metrics = {'characterCount': 2}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'ocr_basic', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.vision-apps.visionApps_03.ocr_basic-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_03.ocr_basic-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_ocr_basic_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: ocr1
              ocrEngineHash: tess-a
              language: eng
              characterCount: 1200
          - value:
              sourceHash: ocr1
              ocrEngineHash: tess-a
              language: eng
              characterCount: 1201
          expectedReturn:
            passed: true
            topic: ocr_basic
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: ocr1
              ocrEngineHash: tess-a
              language: eng
              characterCount: 1200
          - value:
              sourceHash: ocr2
              ocrEngineHash: other
              language: kor
              characterCount: 4000
          expectedReturn:
            passed: false
            topic: ocr_basic
            missing: []
            identityMismatch:
            - language
            - ocrEngineHash
            - sourceHash
            metricDrift:
            - characterCount
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: ocr1
              ocrEngineHash: tess-a
              language: eng
              characterCount: 1200
          - value: {}
          expectedReturn:
            passed: false
            topic: ocr_basic
            missing:
            - characterCount
            - language
            - ocrEngineHash
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: visionApps_03-ocr_basic-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionApps_03-ocr_basic-result-reconciliation-transfer
    title: OCR 기초 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_ocr_basic_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_ocr_basic_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_ocr_basic_evidence(stage):
            stages = {'admission': {'action': 'admit OCR input safely', 'evidence': 'page image language privacy', 'risk': 'privacy or source error'}, 'process': {'action': 'run bounded OCR workflow', 'evidence': 'segmentation confidence trace', 'risk': 'unbounded or wrong transformation'}, 'release': {'action': 'release verified OCR result', 'evidence': 'text coverage and sample review', 'risk': 'wrong or sensitive output'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.vision-apps.visionApps_03.ocr_basic-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_03.ocr_basic-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_ocr_basic_evidence
        cases:
        - id: recalls-admission
          arguments:
          - value: admission
          expectedReturn:
            action: admit OCR input safely
            evidence: page image language privacy
            risk: privacy or source error
        - id: recalls-process
          arguments:
          - value: process
          expectedReturn:
            action: run bounded OCR workflow
            evidence: segmentation confidence trace
            risk: unbounded or wrong transformation
        - id: recalls-release
          arguments:
          - value: release
          expectedReturn:
            action: release verified OCR result
            evidence: text coverage and sample review
            risk: wrong or sensitive output
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};