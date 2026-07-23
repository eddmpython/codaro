var e=`meta:
  id: visionApps_07
  title: 이미지 중복 검출
  order: 7
  category: visionApps
  difficulty: ⭐⭐⭐
  badge: 기초
  packages:
  - matplotlib
  - numpy
  - opencv-python
  - pillow
  - imagehash
  - scikit-learn
  tags:
  - imagehash
  - 중복검출
  - phash
  - 응용
  seo:
    title: 비전 응용 - 이미지 중복 검출
    description: imagehash로 폴더 안 사진의 perceptual hash를 계산해 중복을 자동으로 찾습니다.
    keywords:
    - 중복검출
    - imagehash
    - phash
    - 응용
intro:
  emoji: 🪞
  goal: perceptual hash로 폴더 안의 비슷한 사진들을 자동으로 묶습니다.
  description: |-
    사진 라이브러리에는 같은 사진의 거의 동일한 복사본이 흩어져 있기 마련입니다. imagehash 라이브러리의 phash는 사진의 외형을 64비트 해시로 압축해 두 해시의 해밍 거리가 작으면 비슷한 사진이라고 판단합니다. 이 강의는 임시 폴더를 만들어 같은 사진의 여러 변형을 저장하고 중복을 찾는 응용을 만듭니다.
  direction: 임시 폴더에 사진을 만든 뒤 phash를 계산해 거리 임곗값으로 중복 그룹을 만듭니다.
  benefits:
  - imagehash.phash 한 줄로 사진 외형을 비교 가능한 객체로 만듭니다.
  - 해시들 사이의 거리(__sub__) 한 줄로 유사도 비교가 됩니다.
  - 폴더 입력 → 중복 그룹 출력의 표준 응용 함수를 만듭니다.
  diagram:
    steps:
    - label: 1단계. 임시 폴더 준비
      detail: OS temp에 사진을 저장합니다.
    - label: 2단계. phash 계산
      detail: PIL Image → ImageHash 객체.
    - label: 3단계. 거리 비교
      detail: hashA - hashB.
    - label: 4단계. 중복 그룹화
      detail: 임곗값 이하 쌍 묶기.
    - label: 5단계. 결과 시각화
      detail: 그룹별로 그리드 출력.
    runtime:
    - label: 비전 환경
      detail: imagehash + Pillow + numpy.
    - label: 검증 흐름
      detail: 해시 거리 비교 결과를 assert와 시각 비교로 기대값과 같은지 확인합니다.
sections:
- id: prepare_folder
  title: 1단계. 임시 폴더 준비
  structuredPrimary: true
  subtitle: OS temp에 사진 저장
  goal: 학습용 임시 폴더에 같은 사진의 변형들과 다른 사진을 저장합니다.
  why: 실제 응용에서는 폴더 단위로 사진을 처리하므로 시뮬레이션이 필요합니다.
  explanation: |-
    \`Path(tempfile.gettempdir()) / 'codaro_apps_07'\` 에 폴더를 만들고 변형 사진 7장을 저장합니다. 같은 사진의 변형(원본, 밝기 조정, 노이즈) 과 다른 사진을 섞어 둡니다.

    저장은 PIL의 Image.save 또는 cv2.imwrite로 가능합니다.
  tips:
  - 임시 폴더는 학습이 끝나면 삭제해도 무방합니다.
  snippet: |-
    import cv2
    import numpy as np
    import matplotlib.pyplot as plt
    import tempfile
    import shutil
    from pathlib import Path
    from PIL import Image
    from sklearn.datasets import load_sample_image

    tempDir = Path(tempfile.gettempdir()) / 'codaro_apps_07'
    if tempDir.exists():
        shutil.rmtree(tempDir)
    tempDir.mkdir()
    china = load_sample_image('china.jpg')
    flower = load_sample_image('flower.jpg')

    def save(img, name):
        Image.fromarray(img).save(tempDir / name)

    save(china, 'china_orig.png')
    save((china.astype(np.float32) * 1.1 + 5).clip(0, 255).astype(np.uint8), 'china_bright.png')
    save((china.astype(np.float32) * 0.85 - 5).clip(0, 255).astype(np.uint8), 'china_dim.png')
    save(china[:, ::-1].copy(), 'china_flip.png')
    save(flower, 'flower_orig.png')
    save((flower.astype(np.float32) * 0.95).clip(0, 255).astype(np.uint8), 'flower_dim.png')
    save(np.full((300, 400, 3), 100, dtype=np.uint8), 'gray_canvas.png')
    sorted(p.name for p in tempDir.iterdir())
  exercise:
    prompt: 폴더의 파일 개수가 7인지 확인하세요.
    starterCode: |-
      fileCount = len(list(tempDir.iterdir()))
      ___ == 7
    hints:
    - 빈칸은 fileCount 변수입니다.
    - 결과는 True여야 합니다.
  check:
    noError: 폴더 준비가 오류 없이 끝나야 합니다.
    resultCheck: tempDir.exists() 가 True여야 합니다.
- id: hash_one
  title: 2단계. phash 계산
  structuredPrimary: true
  subtitle: PIL → ImageHash
  goal: 한 사진의 phash를 계산합니다.
  why: phash는 perceptual hash로 외형이 비슷하면 비슷한 해시를 만듭니다.
  explanation: |-
    \`imagehash.phash(PIL.Image)\` 한 줄입니다. 결과는 ImageHash 객체이고 64비트 정수에 해당합니다. 같은 사진의 변형은 보통 해시가 같거나 매우 비슷합니다.
  tips:
  - phash 외에 ahash(average), dhash(difference), whash(wavelet) 도 같은 인터페이스를 제공합니다.
  snippet: |-
    import imagehash

    chinaImg = Image.open(tempDir / 'china_orig.png')
    chinaHash = imagehash.phash(chinaImg)
    str(chinaHash)
  exercise:
    prompt: 같은 china의 밝기 조정 변형 해시를 계산하고 두 해시의 거리를 확인하세요.
    starterCode: |-
      brightImg = Image.open(tempDir / 'china_bright.png')
      brightHash = imagehash.phash(brightImg)
      chinaHash - ___
    hints:
    - 빈칸은 brightHash 변수입니다.
    - 결과는 작은 정수(보통 0~5) 여야 합니다.
  check:
    noError: 해시 계산이 오류 없이 끝나야 합니다.
    resultCheck: str(chinaHash) 가 16자리 16진수 문자열이어야 합니다.
- id: distance
  title: 3단계. 거리 비교
  structuredPrimary: true
  subtitle: hashA - hashB
  goal: 두 해시의 해밍 거리를 한 줄로 얻습니다.
  why: 거리 비교 한 줄이 응용의 핵심입니다.
  explanation: |-
    ImageHash의 \`__sub__\` 가 해밍 거리를 돌려줍니다. 결과는 0~64 정수입니다. 같은 사진의 변형은 보통 5 미만, 완전히 다른 사진은 20 이상이 보통입니다.
  tips:
  - 거리 임곗값은 데이터셋에 따라 조정합니다. 학습용 합성에서는 5~10이 적당합니다.
  snippet: |-
    flowerImg = Image.open(tempDir / 'flower_orig.png')
    flowerHash = imagehash.phash(flowerImg)
    brightImg = Image.open(tempDir / 'china_bright.png')
    brightHash = imagehash.phash(brightImg)
    sameDistance = chinaHash - brightHash
    diffDistance = chinaHash - flowerHash
    sameDistance, diffDistance
  exercise:
    prompt: china_orig와 china_flip의 거리를 확인하세요(좌우 반전된 같은 사진).
    starterCode: |-
      flipImg = Image.open(tempDir / 'china_flip.png')
      flipHash = imagehash.phash(flipImg)
      chinaHash - ___
    hints:
    - 빈칸은 flipHash 변수입니다.
    - 좌우 반전은 phash에서 큰 차이를 보일 수 있습니다.
  check:
    noError: 거리 계산이 오류 없이 끝나야 합니다.
    resultCheck: sameDistance가 diffDistance보다 작아야 합니다.
- id: group
  title: 4단계. 중복 그룹화
  structuredPrimary: true
  subtitle: 임곗값 이하 쌍 묶기
  goal: 폴더의 모든 사진에 대해 해시를 계산하고 임곗값 이하 거리의 사진들을 한 그룹으로 묶습니다.
  why: 그룹화는 중복 검출의 표준 결과 형식입니다.
  explanation: |-
    Union-Find(또는 단순 그래프 BFS) 로 그룹을 만듭니다. 학습용에서는 모든 쌍을 비교해 거리가 임곗값 이하면 같은 그룹으로 합치는 단순 방식이 충분합니다.

    그룹 결과는 dict 또는 list of lists로 정리합니다.
  tips:
  - 단순한 dict로 "이름 → 대표 그룹 ID" 를 관리하면 그룹화 구현이 짧아집니다.
  snippet: |-
    fileHashes = {p.name: imagehash.phash(Image.open(p)) for p in tempDir.iterdir()}
    names = list(fileHashes.keys())
    parent = {name: name for name in names}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    def union(a, b):
        parent[find(a)] = find(b)
    threshold = 10
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            if fileHashes[names[i]] - fileHashes[names[j]] <= threshold:
                union(names[i], names[j])
    groups = {}
    for name in names:
        groups.setdefault(find(name), []).append(name)
    list(groups.values())
  exercise:
    prompt: 임곗값을 4로 좁혀 그룹 결과가 더 세분화되는지 확인하세요.
    starterCode: |-
      parent2 = {name: name for name in names}
      def find2(x):
          while parent2[x] != x:
              parent2[x] = parent2[parent2[x]]
              x = parent2[x]
          return x
      def union2(a, b):
          parent2[find2(a)] = find2(b)
      for i in range(len(names)):
          for j in range(i + 1, len(names)):
              if fileHashes[names[i]] - fileHashes[names[j]] <= ___:
                  union2(names[i], names[j])
      groupsTight = {}
      for name in names:
          groupsTight.setdefault(find2(name), []).append(name)
      list(groupsTight.values())
    hints:
    - 빈칸은 정수 4입니다.
    - 임곗값이 작아지면 그룹 수가 늘어납니다.
  check:
    noError: 그룹화가 오류 없이 끝나야 합니다.
    resultCheck: groups의 값이 모두 리스트여야 합니다.
- id: visualize
  title: 5단계. 결과 시각화
  structuredPrimary: true
  subtitle: 그룹별 그리드
  goal: 각 그룹의 사진들을 가로로 나열해 시각적으로 확인합니다.
  why: 시각화로 그룹화 품질을 직접 평가할 수 있어야 합니다.
  explanation: |-
    각 그룹의 첫 사진을 thumbnail로 변환해 plot으로 나란히 그립니다. 그룹별로 행을 다르게 두면 비교가 깔끔합니다.
  tips:
  - 그룹별 사진 개수가 크게 다르면 격자 크기를 동적으로 잡는 것이 보기 좋습니다.
  snippet: |-
    groupList = list(groups.values())
    fig, axes = plt.subplots(len(groupList), max(len(g) for g in groupList), figsize=(12, 3 * len(groupList)))
    if len(groupList) == 1:
        axes = np.array([axes])
    for rowIdx, group in enumerate(groupList):
        for colIdx in range(axes.shape[1] if axes.ndim > 1 else 1):
            ax = axes[rowIdx, colIdx] if axes.ndim > 1 else axes[rowIdx]
            ax.axis('off')
            if colIdx < len(group):
                ax.imshow(Image.open(tempDir / group[colIdx]))
                ax.set_title(group[colIdx], fontsize=8)
    fig
  exercise:
    prompt: 그룹의 개수와 각 그룹의 사진 개수를 dict로 출력하세요.
    starterCode: |-
      groupSize = {f"group_{idx}": len(group) for idx, group in enumerate(___)}
      groupSize
    hints:
    - 빈칸은 groupList 변수입니다.
    - 결과는 그룹별 사진 수 dict입니다.
  check:
    noError: 시각화가 오류 없이 끝나야 합니다.
    resultCheck: len(groupList) 가 1 이상이어야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 응용 함수
  goal: 폴더 입력 → 중복 그룹 dict 출력의 함수를 만듭니다.
  why: 함수로 묶어 두면 자기 폴더에 적용해 즉시 결과를 얻을 수 있습니다.
  explanation: |-
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.
  tips:
  - 함수 인자에 임곗값을 두면 사용자가 조절할 수 있습니다.
  snippet: |-
    def findDuplicates(folder, threshold=10):
        folderPath = Path(folder)
        hashes = {p.name: imagehash.phash(Image.open(p)) for p in folderPath.iterdir() if p.is_file()}
        parentLocal = {name: name for name in hashes}
        def findLocal(x):
            while parentLocal[x] != x:
                parentLocal[x] = parentLocal[parentLocal[x]]
                x = parentLocal[x]
            return x
        names2 = list(hashes.keys())
        for i in range(len(names2)):
            for j in range(i + 1, len(names2)):
                if hashes[names2[i]] - hashes[names2[j]] <= threshold:
                    parentLocal[findLocal(names2[i])] = findLocal(names2[j])
        groupedLocal = {}
        for name in names2:
            groupedLocal.setdefault(findLocal(name), []).append(name)
        return list(groupedLocal.values())

    findDuplicates(tempDir)
  exercise:
    prompt: "미션1: 임곗값 5, 10, 15에서 그룹 수가 어떻게 변하는지 비교하세요. 미션2: 가장 큰 그룹의 첫 사진을 시각화하세요."
    starterCode: |-
      thresholds = [5, 10, 15]
      counts = [len(findDuplicates(tempDir, threshold=t)) for t in ___]
      list(zip(thresholds, counts))
    hints:
    - 빈칸은 thresholds 변수입니다.
    - 임곗값이 클수록 그룹 수가 줄어듭니다.
  check:
    noError: 응용 함수가 오류 없이 끝나야 합니다.
    resultCheck: findDuplicates의 결과 길이가 1 이상이어야 합니다.
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
  - id: visionApps_07-image_duplicate-contract-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - prepare_folder
    - practice
    title: 이미지 중복 검출 입력 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: hash method·distance threshold·candidate budget·verification policy를 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.
    - Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.
    exercise:
      prompt: audit_image_duplicate_contract(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.
      starterCode: |-
        def audit_image_duplicate_contract(value):
            raise NotImplementedError
      solution: |
        def audit_image_duplicate_contract(value):
            required = ['hashMethod', 'distanceThreshold', 'maxCandidates', 'verifyPixels']
            rules = [{'id': 'hash', 'field': 'hashMethod', 'kind': 'enum', 'values': ['phash', 'dhash', 'whash']}, {'id': 'distance', 'field': 'distanceThreshold', 'kind': 'range', 'min': 0, 'max': 64}, {'id': 'candidates', 'field': 'maxCandidates', 'kind': 'range', 'min': 1, 'max': 1000000}, {'id': 'verify', 'field': 'verifyPixels', 'kind': 'enum', 'values': [True]}]
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
            return {"accepted": not missing and not violations, "topic": 'image_duplicate', "missing": missing, "violations": violations}
      hints: *id001
    check:
      id: python.vision-apps.visionApps_07.image_duplicate-contract-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_07.image_duplicate-contract-audit.mastery.behavior.v1.fixture
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
        entry: audit_image_duplicate_contract
        cases:
        - id: accepts-valid-contract
          arguments:
          - value:
              hashMethod: phash
              distanceThreshold: 6
              maxCandidates: 10000
              verifyPixels: true
          expectedReturn:
            accepted: true
            topic: image_duplicate
            missing: []
            violations: []
        - id: reports-missing-field
          arguments:
          - value:
              distanceThreshold: 6
              maxCandidates: 10000
              verifyPixels: true
          expectedReturn:
            accepted: false
            topic: image_duplicate
            missing:
            - hashMethod
            violations:
            - hash
        - id: reports-topic-invariants
          arguments:
          - value:
              hashMethod: md5-name
              distanceThreshold: 100
              maxCandidates: 0
              verifyPixels: false
          expectedReturn:
            accepted: false
            topic: image_duplicate
            missing: []
            violations:
            - candidates
            - distance
            - hash
            - verify
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: visionApps_07-image_duplicate-result-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionApps_07-image_duplicate-contract-audit-mastery
    title: 이미지 중복 검출 결과를 새 입력에 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.
    - 정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.
    exercise:
      prompt: reconcile_image_duplicate_result(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_image_duplicate_result(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_image_duplicate_result(expected, observed):
            identity = ['sourceSetHash', 'hashMethod']
            metrics = {'duplicatePairCount': 0}
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
            return {"passed": not missing and not identity_mismatch and not metric_drift, "topic": 'image_duplicate', "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}
      hints: *id002
    check:
      id: python.vision-apps.visionApps_07.image_duplicate-result-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_07.image_duplicate-result-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_image_duplicate_result
        cases:
        - id: accepts-reconciled-result
          arguments:
          - value:
              sourceSetHash: dup1
              hashMethod: phash
              duplicatePairCount: 12
          - value:
              sourceSetHash: dup1
              hashMethod: phash
              duplicatePairCount: 12
          expectedReturn:
            passed: true
            topic: image_duplicate
            missing: []
            identityMismatch: []
            metricDrift: []
        - id: reports-identity-or-metric-drift
          arguments:
          - value:
              sourceSetHash: dup1
              hashMethod: phash
              duplicatePairCount: 12
          - value:
              sourceSetHash: dup2
              hashMethod: dhash
              duplicatePairCount: 80
          expectedReturn:
            passed: false
            topic: image_duplicate
            missing: []
            identityMismatch:
            - hashMethod
            - sourceSetHash
            metricDrift:
            - duplicatePairCount
        - id: reports-missing-result-fields
          arguments:
          - value:
              sourceSetHash: dup1
              hashMethod: phash
              duplicatePairCount: 12
          - value: {}
          expectedReturn:
            passed: false
            topic: image_duplicate
            missing:
            - duplicatePairCount
            - hashMethod
            - sourceSetHash
            identityMismatch: []
            metricDrift: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: visionApps_07-image_duplicate-evidence-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - visionApps_07-image_duplicate-result-reconciliation-transfer
    title: 이미지 중복 검출 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.
    - 패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.
    exercise:
      prompt: choose_image_duplicate_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_image_duplicate_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_image_duplicate_evidence(stage):
            stages = {'admission': {'action': 'admit duplicate detection input safely', 'evidence': 'bounded source set and hash plan', 'risk': 'privacy or source error'}, 'process': {'action': 'run bounded duplicate detection workflow', 'evidence': 'candidate and pixel verification trace', 'risk': 'unbounded or wrong transformation'}, 'release': {'action': 'release verified duplicate detection result', 'evidence': 'pair manifest without deletion', 'risk': 'wrong or sensitive output'}}
            if stage not in stages:
                raise ValueError('unknown vision stage')
            return stages[stage]
      hints: *id003
    check:
      id: python.vision-apps.visionApps_07.image_duplicate-evidence-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.vision-apps.visionApps_07.image_duplicate-evidence-recall.retrieval.behavior.v1.fixture
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
        entry: choose_image_duplicate_evidence
        cases:
        - id: recalls-admission
          arguments:
          - value: admission
          expectedReturn:
            action: admit duplicate detection input safely
            evidence: bounded source set and hash plan
            risk: privacy or source error
        - id: recalls-process
          arguments:
          - value: process
          expectedReturn:
            action: run bounded duplicate detection workflow
            evidence: candidate and pixel verification trace
            risk: unbounded or wrong transformation
        - id: recalls-release
          arguments:
          - value: release
          expectedReturn:
            action: release verified duplicate detection result
            evidence: pair manifest without deletion
            risk: wrong or sensitive output
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};