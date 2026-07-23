var e=`meta:\r
  id: visionApps_10\r
  title: 종합 - 사진 자동 정리기\r
  order: 10\r
  category: visionApps\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  - pillow\r
  - imagehash\r
  - scikit-learn\r
  tags:\r
  - 종합프로젝트\r
  - 사진정리\r
  - phash\r
  - 분류\r
  - 응용\r
  seo:\r
    title: 비전 응용 - 종합 사진 정리기\r
    description: phash 중복 검출 + 노출 진단으로 폴더 안 사진을 자동 분류해 폴더 트리로 정리합니다.\r
    keywords:\r
    - 사진정리\r
    - 자동분류\r
    - phash\r
    - 노출진단\r
    - 응용\r
intro:\r
  emoji: 🗂\r
  goal: 폴더 안 사진을 중복 그룹·노출 상태별로 분류해 새 폴더 트리로 정리하는 도구를 만듭니다.\r
  description: |-\r
    이 강의는 visionApps 트랙의 마지막 응용 종합입니다. visionBasics 9강의 노출 진단, visionApps 7강의 중복 검출을 한데 모아 입력 폴더의 사진을 분류된 출력 폴더 트리로 정리하는 미니 도구를 만듭니다. 결과는 사용자 자신의 사진 라이브러리에 즉시 적용할 수 있는 형태입니다.\r
  direction: 임시 입력 폴더의 사진을 노출 진단 + 중복 검출로 분류하고 출력 폴더에 그룹별로 복사합니다.\r
  benefits:\r
  - 여러 응용 도구를 한 파이프라인에 모으는 패턴을 익힙니다.\r
  - 폴더 → 폴더 변환의 응용 함수를 만듭니다.\r
  - 결과 폴더 트리를 보고서 형태로 시각화합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 입력·출력 폴더\r
      detail: OS temp 안에 두 폴더 트리.\r
    - label: 2단계. 노출 진단\r
      detail: visionBasics 9강 패턴.\r
    - label: 3단계. 중복 그룹\r
      detail: visionApps 7강 패턴.\r
    - label: 4단계. 출력 분류\r
      detail: tag 기반 폴더 복사.\r
    - label: 5단계. 결과 보고\r
      detail: 폴더 트리 + 요약.\r
    runtime:\r
    - label: 비전 환경\r
      detail: opencv-python + Pillow + imagehash.\r
    - label: 검증 흐름\r
      detail: 분류 결과 폴더 트리와 그룹 통계를 assert와 시각 비교로 기대값과 같은지 확인합니다.\r
sections:\r
- id: prepare_folders\r
  title: 1단계. 입력·출력 폴더 준비\r
  structuredPrimary: true\r
  subtitle: 두 폴더 트리\r
  goal: OS temp에 입력 폴더(다양한 사진) 와 출력 폴더(빈 트리) 를 만듭니다.\r
  why: 응용 함수의 입력과 출력은 명확히 분리된 두 폴더여야 합니다.\r
  explanation: |-\r
    입력 폴더에는 visionApps 7강 패턴으로 만든 변형 사진 7장 + 노출 다른 사진 두 장을 추가로 둡니다. 출력 폴더는 비어 있는 상태로 시작합니다.\r
  tips:\r
  - 학습용 폴더 트리는 응용 함수가 안정적으로 실행될 수 있는 작은 표본으로 두는 것이 좋습니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    import tempfile\r
    import shutil\r
    from pathlib import Path\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    inputDir = Path(tempfile.gettempdir()) / 'codaro_apps_10_input'\r
    outputDir = Path(tempfile.gettempdir()) / 'codaro_apps_10_output'\r
    for path in [inputDir, outputDir]:\r
        if path.exists():\r
            shutil.rmtree(path)\r
        path.mkdir()\r
    china = load_sample_image('china.jpg')\r
    flower = load_sample_image('flower.jpg')\r
\r
    def write(img, name):\r
        Image.fromarray(img).save(inputDir / name)\r
\r
    write(china, 'china_a.png')\r
    write((china.astype(np.float32) * 1.1 + 5).clip(0, 255).astype(np.uint8), 'china_b.png')\r
    write(flower, 'flower_a.png')\r
    write((flower.astype(np.float32) * 0.92).clip(0, 255).astype(np.uint8), 'flower_b.png')\r
    write((china.astype(np.float32) - 80).clip(0, 255).astype(np.uint8), 'china_dark.png')\r
    write((flower.astype(np.float32) * 1.3 + 30).clip(0, 255).astype(np.uint8), 'flower_bright.png')\r
    sorted(p.name for p in inputDir.iterdir())\r
  exercise:\r
    prompt: 입력 폴더 파일 개수를 확인하세요.\r
    starterCode: |-\r
      count = len(list(inputDir.iterdir()))\r
      ___ == 6\r
    hints:\r
    - 빈칸은 count 변수입니다.\r
    - 결과는 True여야 합니다.\r
  check:\r
    noError: 폴더 준비가 오류 없이 끝나야 합니다.\r
    resultCheck: inputDir.exists() 와 outputDir.exists() 모두 True여야 합니다.\r
- id: exposure\r
  title: 2단계. 노출 진단\r
  structuredPrimary: true\r
  subtitle: visionBasics 9강 패턴\r
  goal: 각 사진의 평균 밝기로 노출 태그를 정합니다.\r
  why: 분류의 첫 기준은 노출 상태입니다.\r
  explanation: |-\r
    평균이 90 미만이면 'dark', 200 초과이면 'bright', 그 외는 'normal' 로 분류합니다. 같은 폴더의 모든 사진에 적용해 태그 dict를 만듭니다.\r
  tips:\r
  - 노출 임곗값은 카메라와 보정 정도에 따라 다릅니다. 학습용 합성에서는 단순 임곗값으로 충분합니다.\r
  snippet: |-\r
    def exposureTag(img):\r
        mean = img.mean()\r
        if mean < 90:\r
            return 'dark'\r
        if mean > 200:\r
            return 'bright'\r
        return 'normal'\r
\r
    exposureTags = {}\r
    for path in inputDir.iterdir():\r
        img = np.array(Image.open(path))\r
        exposureTags[path.name] = exposureTag(img)\r
    exposureTags\r
  exercise:\r
    prompt: exposureTags의 dark, bright, normal 개수를 dict로 출력하세요.\r
    starterCode: |-\r
      from collections import Counter\r
\r
      tagCounts = Counter(exposureTags.___())\r
      tagCounts\r
    hints:\r
    - 빈칸은 'values' 입니다.\r
    - 결과는 각 태그별 카운트 dict입니다.\r
  check:\r
    noError: 노출 진단이 오류 없이 끝나야 합니다.\r
    resultCheck: exposureTags의 키 개수가 inputDir의 파일 개수와 같아야 합니다.\r
- id: duplicate_group\r
  title: 3단계. 중복 그룹\r
  structuredPrimary: true\r
  subtitle: visionApps 7강 패턴\r
  goal: phash 거리로 중복 사진들을 그룹으로 묶습니다.\r
  why: 같은 사진의 변형은 한 그룹으로 묶어 한 번만 보존하는 것이 정리의 핵심입니다.\r
  explanation: |-\r
    7강에서 만든 findDuplicates 패턴을 그대로 사용합니다. 각 사진의 그룹 ID(그룹 내 대표 이름) 를 dict로 만들면 후속 분류가 편합니다.\r
  tips:\r
  - 그룹 ID는 정렬된 첫 사진의 이름으로 두는 것이 결정적이고 깔끔합니다.\r
  snippet: |-\r
    import imagehash\r
\r
    hashes = {p.name: imagehash.phash(Image.open(p)) for p in inputDir.iterdir()}\r
    parent = {name: name for name in hashes}\r
    def find(x):\r
        while parent[x] != x:\r
            parent[x] = parent[parent[x]]\r
            x = parent[x]\r
        return x\r
    threshold = 10\r
    names = list(hashes.keys())\r
    for i in range(len(names)):\r
        for j in range(i + 1, len(names)):\r
            if hashes[names[i]] - hashes[names[j]] <= threshold:\r
                parent[find(names[i])] = find(names[j])\r
    groupId = {name: find(name) for name in names}\r
    sorted(set(groupId.values()))\r
  exercise:\r
    prompt: 각 그룹 ID에 속한 사진 개수를 출력하세요.\r
    starterCode: |-\r
      from collections import Counter\r
\r
      groupSize = Counter(groupId.___())\r
      dict(groupSize)\r
    hints:\r
    - 빈칸은 'values' 입니다.\r
    - 결과는 그룹별 사진 수입니다.\r
  check:\r
    noError: 중복 그룹화가 오류 없이 끝나야 합니다.\r
    resultCheck: groupId의 키 개수가 hashes의 키 개수와 같아야 합니다.\r
- id: organize\r
  title: 4단계. 출력 분류\r
  structuredPrimary: true\r
  subtitle: tag 기반 폴더 복사\r
  goal: 노출 태그와 그룹 ID를 조합한 폴더 트리에 사진을 복사합니다.\r
  why: 정리의 결과는 사람이 바로 사용할 수 있는 폴더 트리입니다.\r
  explanation: |-\r
    출력 폴더 아래 \`<exposureTag>/<groupId>/<filename>\` 형식으로 사진을 복사합니다. 폴더가 존재하지 않으면 자동으로 만듭니다.\r
\r
    shutil.copy 가 단순하지만 같은 효과의 Image.save 또는 cv2.imwrite도 가능합니다.\r
  tips:\r
  - 출력 폴더는 항상 비어 있는 상태에서 시작하는 것이 결과 비교에 깔끔합니다.\r
  snippet: |-\r
    for name in names:\r
        tag = exposureTags[name]\r
        gid = groupId[name].rsplit('.', 1)[0]\r
        destDir = outputDir / tag / gid\r
        destDir.mkdir(parents=True, exist_ok=True)\r
        shutil.copy(inputDir / name, destDir / name)\r
    sorted(str(p.relative_to(outputDir)) for p in outputDir.rglob('*.png'))\r
  exercise:\r
    prompt: 출력 폴더의 모든 폴더 수와 모든 파일 수를 출력하세요.\r
    starterCode: |-\r
      dirCount = sum(1 for _ in outputDir.rglob('*') if _.is_dir())\r
      fileCount = sum(1 for _ in outputDir.rglob('*') if _.___())\r
      dirCount, fileCount\r
    hints:\r
    - 빈칸은 'is_file' 입니다.\r
    - dirCount는 노출 폴더 + 그룹 폴더 수입니다.\r
  check:\r
    noError: 폴더 복사가 오류 없이 끝나야 합니다.\r
    resultCheck: outputDir 안에 png 파일이 존재해야 합니다.\r
- id: report\r
  title: 5단계. 결과 보고\r
  structuredPrimary: true\r
  subtitle: 폴더 트리 + 요약\r
  goal: 정리 결과를 dict 요약과 함께 시각화합니다.\r
  why: 응용의 결과는 결과 폴더 + 요약 보고서 형태가 표준입니다.\r
  explanation: |-\r
    출력 폴더 트리를 dict로 만들고, 각 노출 카테고리별 첫 사진을 1xN 그리드로 시각화합니다. 요약 dict는 사람이 한 줄에서 결과를 볼 수 있게 합니다.\r
  tips:\r
  - 결과 보고서는 dict + figure 가 가장 일반적인 형태입니다.\r
  snippet: |-\r
    summary = {}\r
    for tagDir in sorted(outputDir.iterdir()):\r
        if not tagDir.is_dir():\r
            continue\r
        groupDirs = sorted(d for d in tagDir.iterdir() if d.is_dir())\r
        summary[tagDir.name] = {gd.name: len(list(gd.glob('*.png'))) for gd in groupDirs}\r
    summary\r
  exercise:\r
    prompt: 각 노출 태그의 첫 사진 한 장을 1xN 그리드로 시각화하세요.\r
    starterCode: |-\r
      previewImgs = []\r
      labels = []\r
      for tagDir in sorted(outputDir.iterdir()):\r
          if not tagDir.is_dir():\r
              continue\r
          firstImage = next(tagDir.rglob('*.png'), None)\r
          if firstImage is None:\r
              continue\r
          previewImgs.append(np.array(Image.open(firstImage)))\r
          labels.append(tagDir.name)\r
      fig, axes = plt.subplots(1, max(len(previewImgs), 1), figsize=(4 * max(len(previewImgs), 1), 4))\r
      if len(previewImgs) == 1:\r
          axes = [axes]\r
      for axis, img, label in zip(axes, previewImgs, labels):\r
          axis.imshow(img)\r
          axis.set_title(label)\r
          axis.axis('___')\r
      fig\r
    hints:\r
    - 빈칸은 'off' 입니다.\r
    - 노출 카테고리별 대표 사진이 그려져야 합니다.\r
  check:\r
    noError: 결과 보고 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: summary가 dict여야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 응용 함수화\r
  goal: 입력 폴더 + 출력 폴더 → 정리 dict 한 함수로 묶습니다.\r
  why: 응용은 단일 함수 호출로 시작과 끝이 명확해야 합니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 함수는 부수 효과(폴더 생성, 파일 복사) 와 결과 dict 반환을 함께 합니다.\r
  snippet: |-\r
    def organizePhotos(srcDir, dstDir, threshold=10):\r
        srcLocal = Path(srcDir)\r
        dstLocal = Path(dstDir)\r
        if dstLocal.exists():\r
            shutil.rmtree(dstLocal)\r
        dstLocal.mkdir(parents=True)\r
        hashesLocal = {p.name: imagehash.phash(Image.open(p)) for p in srcLocal.iterdir() if p.is_file()}\r
        namesLocal = list(hashesLocal.keys())\r
        parentLocal = {name: name for name in namesLocal}\r
        def findLocal(x):\r
            while parentLocal[x] != x:\r
                parentLocal[x] = parentLocal[parentLocal[x]]\r
                x = parentLocal[x]\r
            return x\r
        for i in range(len(namesLocal)):\r
            for j in range(i + 1, len(namesLocal)):\r
                if hashesLocal[namesLocal[i]] - hashesLocal[namesLocal[j]] <= threshold:\r
                    parentLocal[findLocal(namesLocal[i])] = findLocal(namesLocal[j])\r
        summaryLocal = {}\r
        for name in namesLocal:\r
            img = np.array(Image.open(srcLocal / name))\r
            tag = exposureTag(img)\r
            gid = findLocal(name).rsplit('.', 1)[0]\r
            destDirLocal = dstLocal / tag / gid\r
            destDirLocal.mkdir(parents=True, exist_ok=True)\r
            shutil.copy(srcLocal / name, destDirLocal / name)\r
            summaryLocal.setdefault(tag, {}).setdefault(gid, []).append(name)\r
        return summaryLocal\r
\r
    altOutput = Path(tempfile.gettempdir()) / 'codaro_apps_10_alt'\r
    altSummary = organizePhotos(inputDir, altOutput, threshold=8)\r
    altSummary\r
  exercise:\r
    prompt: "미션1: threshold를 5, 10, 20에 대해 호출해 그룹 수가 어떻게 변하는지 비교 출력하세요. 미션2: altOutput 디렉터리의 전체 폴더 수와 파일 수를 출력하세요."\r
    starterCode: |-\r
      compareResult = {}\r
      for thr in [5, 10, ___]:\r
          tempOut = Path(tempfile.gettempdir()) / f'codaro_apps_10_t{thr}'\r
          summaryT = organizePhotos(inputDir, tempOut, threshold=thr)\r
          compareResult[thr] = sum(len(groups) for groups in summaryT.values())\r
      compareResult\r
    hints:\r
    - 빈칸은 정수 20 입니다.\r
    - 임곗값이 클수록 그룹 수가 줄어듭니다.\r
  check:\r
    noError: 응용 함수가 오류 없이 끝나야 합니다.\r
    resultCheck: altSummary가 dict여야 합니다.\r
`;export{e as default};