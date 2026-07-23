var e=`meta:
  id: visionApps_04
  title: 한국어 OCR
  order: 4
  category: visionApps
  difficulty: ⭐⭐⭐
  badge: 기초
  packages:
  - matplotlib
  - numpy
  - opencv-python
  - easyocr
  - pillow
  tags:
  - easyocr
  - 한국어
  - OCR
  - 다국어
  - 응용
  seo:
    title: 비전 응용 - 한국어 OCR
    description: easyocr로 한국어가 포함된 사진에서 텍스트를 추출합니다.
    keywords:
    - 한국어OCR
    - easyocr
    - 다국어
    - OCR
intro:
  emoji: 🇰🇷
  goal: easyocr로 한국어 텍스트가 포함된 사진을 인식합니다.
  description: |-
    pytesseract도 한국어 모델을 추가하면 동작하지만 설치가 까다롭고 정확도 편차가 큽니다. easyocr는 파이썬 패키지만 설치하면 한국어를 포함한 80+ 언어를 즉시 인식하며 정확도도 준수합니다. 첫 호출 시 모델 가중치(약 100MB) 가 자동 다운로드됩니다.
  direction: PIL로 한국어가 포함된 합성 이미지를 만들고 easyocr Reader로 인식 결과를 받습니다.
  benefits:
  - easyocr.Reader 객체 생성과 호출 흐름을 익힙니다.
  - 결과 튜플(좌표, 텍스트, 신뢰도) 구조를 이해합니다.
  - 다국어 인식의 강점과 한계를 직접 확인합니다.
  diagram:
    steps:
    - label: 1단계. 한국어 폰트 준비
      detail: PIL로 한글 그리기.
    - label: 2단계. Reader 객체 생성
      detail: 첫 호출 시 모델 다운로드.
    - label: 3단계. 인식 호출
      detail: readtext 한 줄.
    - label: 4단계. 결과 시각화
      detail: 박스와 텍스트.
    - label: 5단계. 영어와 한국어 비교
      detail: 두 언어 동시 인식.
    runtime:
    - label: OCR 환경
      detail: easyocr는 첫 호출 시 모델을 자동 다운로드합니다. (~100MB)
    - label: 검증 흐름
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.
sections:
- id: korean_image
  title: 1단계. 한국어 폰트 준비
  structuredPrimary: true
  subtitle: PIL로 한글 그리기
  goal: PIL로 한국어 텍스트가 들어간 합성 이미지를 만듭니다.
  why: cv2.putText는 한국어를 지원하지 않습니다. PIL 또는 한국어 폰트 추가가 필요합니다.
  explanation: |-
    PIL의 ImageDraw로 시스템에 있는 한국어 폰트(예: macOS의 AppleGothic, Windows의 malgun.ttf) 를 사용해 한글을 그립니다. 폰트 경로는 OS마다 다르므로 try/except로 대응합니다.

    학습용 이미지는 이후 OCR이 인식하기 쉬운 굵기와 크기로 그립니다.
  tips:
  - 한국어 폰트 경로는 OS마다 다릅니다. 학습용은 try/except로 fallback 폰트를 두는 패턴이 일반적입니다.
  snippet: |-
    import cv2
    import numpy as np
    import matplotlib.pyplot as plt
    from PIL import Image, ImageDraw, ImageFont

    canvasImg = Image.new('RGB', (500, 200), color=(255, 255, 255))
    draw = ImageDraw.Draw(canvasImg)
    try:
        font = ImageFont.truetype('malgun.ttf', 36)
    except Exception:
        try:
            font = ImageFont.truetype('AppleGothic.ttf', 36)
        except Exception:
            font = ImageFont.load_default()
    draw.text((20, 30), "코다로 비전", font=font, fill=(10, 10, 10))
    draw.text((20, 100), "한국어 OCR 테스트", font=font, fill=(40, 40, 40))
    canvasArray = np.array(canvasImg)
    canvasArray.shape
  exercise:
    prompt: 합성 이미지를 시각화하세요.
    starterCode: |-
      fig = plt.figure(figsize=(7, 3))
      plt.imshow(canvasArray)
      plt.axis('___')
      fig
    hints:
    - 빈칸은 'off' 입니다.
    - 한국어 텍스트가 보여야 합니다.
  check:
    noError: 합성 이미지 생성이 오류 없이 끝나야 합니다.
    resultCheck: canvasArray.shape이 (200, 500, 3) 이어야 합니다.
- id: reader
  title: 2단계. Reader 객체 생성
  structuredPrimary: true
  subtitle: 첫 호출 시 모델 다운로드
  goal: easyocr.Reader 객체를 한국어 + 영어로 설정합니다.
  why: 첫 호출은 시간이 걸리지만 이후의 모든 readtext 호출은 빠릅니다.
  explanation: |-
    \`easyocr.Reader(['ko', 'en'], gpu=False)\` 가 표준입니다. 첫 호출 시 모델 가중치를 자동 다운로드합니다. GPU 없는 환경에서는 gpu=False 를 명시합니다.

    Reader 객체는 한 번 만들어 두고 여러 이미지에 재사용하는 것이 표준입니다.
  tips:
  - 학습 시 첫 호출이 느린 점을 학습자에게 안내하는 것이 좋습니다.
  snippet: |-
    try:
        import easyocr
        reader = easyocr.Reader(['ko', 'en'], gpu=False)
        readerStatus = 'ready'
    except Exception as exc:
        reader = None
        readerStatus = f"failed: {exc.__class__.__name__}"
    readerStatus
  exercise:
    prompt: reader 객체의 타입을 출력하세요.
    starterCode: |-
      if reader is not None:
          status = type(reader).__name__
      else:
          status = ___
      status
    hints:
    - 빈칸은 None 또는 'unavailable' 같은 문자열입니다.
    - 결과는 'Reader' 또는 fallback 문자열입니다.
  check:
    noError: Reader 객체 생성 시도가 오류 없이 끝나야 합니다.
    resultCheck: readerStatus가 문자열이어야 합니다.
- id: read
  title: 3단계. 인식 호출
  structuredPrimary: true
  subtitle: readtext 한 줄
  goal: reader.readtext 한 줄로 인식 결과를 받습니다.
  why: 응용 코드는 한 줄로 끝나야 합니다.
  explanation: |-
    \`reader.readtext(canvasArray)\` 는 \`[(좌표, 텍스트, 신뢰도), ...]\` 리스트를 반환합니다. 좌표는 네 꼭짓점 (x, y) 의 리스트입니다.

    Reader가 None이면 학습 환경에 easyocr이 없는 것이므로 안내 메시지를 출력합니다.
  tips:
  - 결과 텍스트는 줄 단위 또는 그룹 단위로 나뉘어 들어옵니다.
  snippet: |-
    if reader is not None:
        results = reader.readtext(canvasArray)
    else:
        results = []
    len(results), results[0] if results else None
  exercise:
    prompt: 결과 텍스트만 추출해 리스트로 만드세요.
    starterCode: |-
      texts = [item[___] for item in results]
      texts
    hints:
    - 빈칸은 정수 1 입니다(텍스트 위치).
    - 한국어 텍스트들이 정확히 나오면 인식이 성공한 것입니다.
  check:
    noError: 인식 호출 시도가 오류 없이 끝나야 합니다.
    resultCheck: results가 리스트여야 합니다.
- id: visualize
  title: 4단계. 결과 시각화
  structuredPrimary: true
  subtitle: 박스와 텍스트
  goal: 인식된 박스와 텍스트를 사진 위에 그립니다.
  why: 응용 코드의 결과는 시각으로 검증해야 합니다.
  explanation: |-
    각 결과의 좌표 네 꼭짓점을 matplotlib polygon으로 그리고, 박스 위에 텍스트를 표시합니다. 한국어 폰트가 matplotlib에 등록되어 있어야 텍스트가 깨지지 않습니다.

    fontproperties 또는 rcParams['font.family'] 설정이 필요할 수 있습니다.
  tips:
  - 한국어 글꼴이 matplotlib에 없으면 텍스트가 □로 보일 수 있습니다.
  snippet: |-
    from matplotlib.patches import Polygon

    fig, axis = plt.subplots(figsize=(8, 4))
    axis.imshow(canvasArray)
    for item in results:
        coords = np.array(item[0])
        axis.add_patch(Polygon(coords, edgecolor='red', fill=False, linewidth=2))
    axis.axis('off')
    fig
  exercise:
    prompt: 같은 시각화에 텍스트를 각 박스 위에 표시하세요(한국어 폰트가 깨지면 영문으로 대체).
    starterCode: |-
      fig, axis = plt.subplots(figsize=(8, 4))
      axis.imshow(canvasArray)
      for item in results:
          coords = np.array(item[0])
          text = item[1]
          axis.add_patch(Polygon(coords, edgecolor='blue', fill=False, linewidth=2))
          axis.text(coords[0][0], coords[0][1] - 5, text, color='blue', fontsize=___)
      axis.axis('off')
      fig
    hints:
    - 빈칸은 정수 10 입니다.
    - 텍스트가 박스 위에 표시되어야 합니다.
  check:
    noError: 시각화가 오류 없이 끝나야 합니다.
    resultCheck: figure가 마지막 줄에 평가되어야 합니다.
- id: compare_languages
  title: 5단계. 영어와 한국어 비교
  structuredPrimary: true
  subtitle: 두 언어 동시 인식
  goal: 한국어와 영어가 함께 있는 이미지에서 둘 다 인식되는지 확인합니다.
  why: 다국어 인식은 easyocr의 강점입니다.
  explanation: |-
    한국어와 영어를 한 사진에 그리고 같은 reader로 인식을 호출합니다. Reader가 두 언어를 모두 처리하도록 설정되어 있어야 합니다.
  tips:
  - 두 언어가 같은 사진에 있을 때 인식 순서가 좌→우, 상→하로 정렬됩니다.
  snippet: |-
    mixedImg = Image.new('RGB', (500, 200), color=(255, 255, 255))
    drawMixed = ImageDraw.Draw(mixedImg)
    drawMixed.text((20, 30), "Codaro Vision 비전 트랙", font=font, fill=(10, 10, 10))
    drawMixed.text((20, 100), "english + 한글", font=font, fill=(40, 40, 40))
    mixedArray = np.array(mixedImg)
    if reader is not None:
        mixedResults = reader.readtext(mixedArray)
    else:
        mixedResults = []
    len(mixedResults), [item[1] for item in mixedResults]
  exercise:
    prompt: 인식 결과를 박스와 함께 시각화하세요.
    starterCode: |-
      fig, axis = plt.subplots(figsize=(8, 4))
      axis.imshow(mixedArray)
      for item in mixedResults:
          coords = np.array(item[___])
          axis.add_patch(Polygon(coords, edgecolor='green', fill=False, linewidth=2))
      axis.axis('off')
      fig
    hints:
    - 빈칸은 정수 0 입니다(좌표 위치).
    - 영어와 한국어 박스가 모두 그려져야 합니다.
  check:
    noError: 시각화가 오류 없이 끝나야 합니다.
    resultCheck: mixedResults가 리스트여야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 응용 함수
  goal: 이미지 입력 → 인식된 텍스트 리스트의 응용 함수를 만듭니다.
  why: 함수로 묶어 두면 자동화 파이프라인에 즉시 연결할 수 있습니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - reader는 함수 밖에서 한 번만 만들어 인자로 받는 것이 효율적입니다.
  snippet: |-
    def extractTexts(img, readerLocal):
        if readerLocal is None:
            return []
        resultsLocal = readerLocal.readtext(img)
        return [text for _, text, _ in resultsLocal]

    extractTexts(canvasArray, reader)
  exercise:
    prompt: "미션1: canvasArray와 mixedArray에 함수를 적용한 결과를 dict로 정리하세요. 미션2: 신뢰도 0.5 이상인 텍스트만 반환하는 extractConfident 함수를 만들고 두 입력에 적용하세요."
    starterCode: |-
      summary = {
          "korean_only": extractTexts(canvasArray, reader),
          "mixed": extractTexts(___, reader),
      }
      summary
    hints:
    - 빈칸은 mixedArray 변수입니다.
    - "신뢰도는 results 튜플의 마지막 값입니다(item[2])."
  check:
    noError: 응용 함수가 오류 없이 끝나야 합니다.
    resultCheck: summary의 두 키 값이 모두 리스트여야 합니다.
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
  - id: visionApps_04-korean_ocr-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - korean_image
    - practice
    title: 한국어 OCR 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: Korean model·Unicode normalization·dictionary·spacing 정책을 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_korean_ocr_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_korean_ocr_contract(value):
            raise NotImplementedError
      solution: |
        def audit_korean_ocr_contract(value):
            required = ['language', 'unicodeNormalization', 'dictionaryVersion', 'spacingPolicy']
            rules = [{'id': 'language', 'field': 'language', 'kind': 'enum', 'values': ['kor', 'kor+eng']}, {'id': 'unicode', 'field': 'unicodeNormalization', 'kind': 'enum', 'values': ['NFC', 'NFKC']}, {'id': 'dictionary', 'field': 'dictionaryVersion', 'kind': 'nonempty'}, {'id': 'spacing', 'field': 'spacingPolicy', 'kind': 'enum', 'values': ['preserve', 'model-corrected']}]
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
            return {"accepted": not missing and not violations, "topic": 'korean_ocr', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.vision-apps.visionApps_04.korean_ocr-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_04.korean_ocr-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_korean_ocr_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              language: kor+eng
              unicodeNormalization: NFC
              dictionaryVersion: ko-office-v1
              spacingPolicy: preserve
          expectedReturn:
            accepted: true
            topic: korean_ocr
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              unicodeNormalization: NFC
              dictionaryVersion: ko-office-v1
              spacingPolicy: preserve
          expectedReturn:
            accepted: false
            topic: korean_ocr
            missing:
            - language
            violations:
            - language
        - id: reports-topic-invariants
          arguments:
          - value:
              language: jpn
              unicodeNormalization: none
              dictionaryVersion: ''
              spacingPolicy: guess
          expectedReturn:
            accepted: false
            topic: korean_ocr
            missing: []
            violations:
            - dictionary
            - language
            - spacing
            - unicode
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: visionApps_04-korean_ocr-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionApps_04-korean_ocr-contract-audit-mastery
    title: 한국어 OCR 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_korean_ocr_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_korean_ocr_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_korean_ocr_result(expected, observed):
            identity = ['sourceHash', 'ocrEngineHash', 'dictionaryVersion']
            metrics = {'hangulSyllableCount': 2}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'korean_ocr', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.vision-apps.visionApps_04.korean_ocr-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_04.korean_ocr-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_korean_ocr_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceHash: ko1
              ocrEngineHash: ko-a
              dictionaryVersion: ko-office-v1
              hangulSyllableCount: 900
          - value:
              sourceHash: ko1
              ocrEngineHash: ko-a
              dictionaryVersion: ko-office-v1
              hangulSyllableCount: 901
          expectedReturn:
            passed: true
            topic: korean_ocr
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceHash: ko1
              ocrEngineHash: ko-a
              dictionaryVersion: ko-office-v1
              hangulSyllableCount: 900
          - value:
              sourceHash: ko2
              ocrEngineHash: ko-b
              dictionaryVersion: old
              hangulSyllableCount: 300
          expectedReturn:
            passed: false
            topic: korean_ocr
            missing: []
            identityMismatch:
            - dictionaryVersion
            - ocrEngineHash
            - sourceHash
            metricDrift:
            - hangulSyllableCount
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceHash: ko1
              ocrEngineHash: ko-a
              dictionaryVersion: ko-office-v1
              hangulSyllableCount: 900
          - value: {}
          expectedReturn:
            passed: false
            topic: korean_ocr
            missing:
            - dictionaryVersion
            - hangulSyllableCount
            - ocrEngineHash
            - sourceHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: visionApps_04-korean_ocr-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionApps_04-korean_ocr-result-reconciliation-transfer
    title: 한국어 OCR 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_korean_ocr_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_korean_ocr_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_korean_ocr_evidence(stage):
            stages = {'admission': {'action': 'admit Korean OCR input safely', 'evidence': 'language model dictionary identity', 'risk': 'privacy or source error'}, 'process': {'action': 'run bounded Korean OCR workflow', 'evidence': 'Unicode spacing trace', 'risk': 'unbounded or wrong transformation'}, 'release': {'action': 'release verified Korean OCR result', 'evidence': 'syllable coverage and sampled correction', 'risk': 'wrong or sensitive output'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.vision-apps.visionApps_04.korean_ocr-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_04.korean_ocr-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_korean_ocr_evidence
        cases:
        - id: recalls-admission
          arguments:
          - value: admission
          expectedReturn:
            action: admit Korean OCR input safely
            evidence: language model dictionary identity
            risk: privacy or source error
        - id: recalls-process
          arguments:
          - value: process
          expectedReturn:
            action: run bounded Korean OCR workflow
            evidence: Unicode spacing trace
            risk: unbounded or wrong transformation
        - id: recalls-release
          arguments:
          - value: release
          expectedReturn:
            action: release verified Korean OCR result
            evidence: syllable coverage and sampled correction
            risk: wrong or sensitive output
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};