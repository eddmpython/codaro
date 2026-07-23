var e=`meta:\r
  id: visionApps_07\r
  title: 이미지 중복 검출\r
  order: 7\r
  category: visionApps\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  - pillow\r
  - imagehash\r
  - scikit-learn\r
  tags:\r
  - imagehash\r
  - 중복검출\r
  - phash\r
  - 응용\r
  seo:\r
    title: 비전 응용 - 이미지 중복 검출\r
    description: imagehash로 폴더 안 사진의 perceptual hash를 계산해 중복을 자동으로 찾습니다.\r
    keywords:\r
    - 중복검출\r
    - imagehash\r
    - phash\r
    - 응용\r
intro:\r
  emoji: 🪞\r
  goal: perceptual hash로 폴더 안의 비슷한 사진들을 자동으로 묶습니다.\r
  description: |-\r
    사진 라이브러리에는 같은 사진의 거의 동일한 복사본이 흩어져 있기 마련입니다. imagehash 라이브러리의 phash는 사진의 외형을 64비트 해시로 압축해 두 해시의 해밍 거리가 작으면 비슷한 사진이라고 판단합니다. 이 강의는 임시 폴더를 만들어 같은 사진의 여러 변형을 저장하고 중복을 찾는 응용을 만듭니다.\r
  direction: 임시 폴더에 사진을 만든 뒤 phash를 계산해 거리 임곗값으로 중복 그룹을 만듭니다.\r
  benefits:\r
  - imagehash.phash 한 줄로 사진 외형을 비교 가능한 객체로 만듭니다.\r
  - 해시들 사이의 거리(__sub__) 한 줄로 유사도 비교가 됩니다.\r
  - 폴더 입력 → 중복 그룹 출력의 표준 응용 함수를 만듭니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 임시 폴더 준비\r
      detail: OS temp에 사진을 저장합니다.\r
    - label: 2단계. phash 계산\r
      detail: PIL Image → ImageHash 객체.\r
    - label: 3단계. 거리 비교\r
      detail: hashA - hashB.\r
    - label: 4단계. 중복 그룹화\r
      detail: 임곗값 이하 쌍 묶기.\r
    - label: 5단계. 결과 시각화\r
      detail: 그룹별로 그리드 출력.\r
    runtime:\r
    - label: 비전 환경\r
      detail: imagehash + Pillow + numpy.\r
    - label: 검증 흐름\r
      detail: 해시 거리 비교 결과를 assert와 시각 비교로 기대값과 같은지 확인합니다.\r
sections:\r
- id: prepare_folder\r
  title: 1단계. 임시 폴더 준비\r
  structuredPrimary: true\r
  subtitle: OS temp에 사진 저장\r
  goal: 학습용 임시 폴더에 같은 사진의 변형들과 다른 사진을 저장합니다.\r
  why: 실제 응용에서는 폴더 단위로 사진을 처리하므로 시뮬레이션이 필요합니다.\r
  explanation: |-\r
    \`Path(tempfile.gettempdir()) / 'codaro_apps_07'\` 에 폴더를 만들고 변형 사진 7장을 저장합니다. 같은 사진의 변형(원본, 밝기 조정, 노이즈) 과 다른 사진을 섞어 둡니다.\r
\r
    저장은 PIL의 Image.save 또는 cv2.imwrite로 가능합니다.\r
  tips:\r
  - 임시 폴더는 학습이 끝나면 삭제해도 무방합니다.\r
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
    tempDir = Path(tempfile.gettempdir()) / 'codaro_apps_07'\r
    if tempDir.exists():\r
        shutil.rmtree(tempDir)\r
    tempDir.mkdir()\r
    china = load_sample_image('china.jpg')\r
    flower = load_sample_image('flower.jpg')\r
\r
    def save(img, name):\r
        Image.fromarray(img).save(tempDir / name)\r
\r
    save(china, 'china_orig.png')\r
    save((china.astype(np.float32) * 1.1 + 5).clip(0, 255).astype(np.uint8), 'china_bright.png')\r
    save((china.astype(np.float32) * 0.85 - 5).clip(0, 255).astype(np.uint8), 'china_dim.png')\r
    save(china[:, ::-1].copy(), 'china_flip.png')\r
    save(flower, 'flower_orig.png')\r
    save((flower.astype(np.float32) * 0.95).clip(0, 255).astype(np.uint8), 'flower_dim.png')\r
    save(np.full((300, 400, 3), 100, dtype=np.uint8), 'gray_canvas.png')\r
    sorted(p.name for p in tempDir.iterdir())\r
  exercise:\r
    prompt: 폴더의 파일 개수가 7인지 확인하세요.\r
    starterCode: |-\r
      fileCount = len(list(tempDir.iterdir()))\r
      ___ == 7\r
    hints:\r
    - 빈칸은 fileCount 변수입니다.\r
    - 결과는 True여야 합니다.\r
  check:\r
    noError: 폴더 준비가 오류 없이 끝나야 합니다.\r
    resultCheck: tempDir.exists() 가 True여야 합니다.\r
- id: hash_one\r
  title: 2단계. phash 계산\r
  structuredPrimary: true\r
  subtitle: PIL → ImageHash\r
  goal: 한 사진의 phash를 계산합니다.\r
  why: phash는 perceptual hash로 외형이 비슷하면 비슷한 해시를 만듭니다.\r
  explanation: |-\r
    \`imagehash.phash(PIL.Image)\` 한 줄입니다. 결과는 ImageHash 객체이고 64비트 정수에 해당합니다. 같은 사진의 변형은 보통 해시가 같거나 매우 비슷합니다.\r
  tips:\r
  - phash 외에 ahash(average), dhash(difference), whash(wavelet) 도 같은 인터페이스를 제공합니다.\r
  snippet: |-\r
    import imagehash\r
\r
    chinaImg = Image.open(tempDir / 'china_orig.png')\r
    chinaHash = imagehash.phash(chinaImg)\r
    str(chinaHash)\r
  exercise:\r
    prompt: 같은 china의 밝기 조정 변형 해시를 계산하고 두 해시의 거리를 확인하세요.\r
    starterCode: |-\r
      brightImg = Image.open(tempDir / 'china_bright.png')\r
      brightHash = imagehash.phash(brightImg)\r
      chinaHash - ___\r
    hints:\r
    - 빈칸은 brightHash 변수입니다.\r
    - 결과는 작은 정수(보통 0~5) 여야 합니다.\r
  check:\r
    noError: 해시 계산이 오류 없이 끝나야 합니다.\r
    resultCheck: str(chinaHash) 가 16자리 16진수 문자열이어야 합니다.\r
- id: distance\r
  title: 3단계. 거리 비교\r
  structuredPrimary: true\r
  subtitle: hashA - hashB\r
  goal: 두 해시의 해밍 거리를 한 줄로 얻습니다.\r
  why: 거리 비교 한 줄이 응용의 핵심입니다.\r
  explanation: |-\r
    ImageHash의 \`__sub__\` 가 해밍 거리를 돌려줍니다. 결과는 0~64 정수입니다. 같은 사진의 변형은 보통 5 미만, 완전히 다른 사진은 20 이상이 보통입니다.\r
  tips:\r
  - 거리 임곗값은 데이터셋에 따라 조정합니다. 학습용 합성에서는 5~10이 적당합니다.\r
  snippet: |-\r
    flowerImg = Image.open(tempDir / 'flower_orig.png')\r
    flowerHash = imagehash.phash(flowerImg)\r
    brightImg = Image.open(tempDir / 'china_bright.png')\r
    brightHash = imagehash.phash(brightImg)\r
    sameDistance = chinaHash - brightHash\r
    diffDistance = chinaHash - flowerHash\r
    sameDistance, diffDistance\r
  exercise:\r
    prompt: china_orig와 china_flip의 거리를 확인하세요(좌우 반전된 같은 사진).\r
    starterCode: |-\r
      flipImg = Image.open(tempDir / 'china_flip.png')\r
      flipHash = imagehash.phash(flipImg)\r
      chinaHash - ___\r
    hints:\r
    - 빈칸은 flipHash 변수입니다.\r
    - 좌우 반전은 phash에서 큰 차이를 보일 수 있습니다.\r
  check:\r
    noError: 거리 계산이 오류 없이 끝나야 합니다.\r
    resultCheck: sameDistance가 diffDistance보다 작아야 합니다.\r
- id: group\r
  title: 4단계. 중복 그룹화\r
  structuredPrimary: true\r
  subtitle: 임곗값 이하 쌍 묶기\r
  goal: 폴더의 모든 사진에 대해 해시를 계산하고 임곗값 이하 거리의 사진들을 한 그룹으로 묶습니다.\r
  why: 그룹화는 중복 검출의 표준 결과 형식입니다.\r
  explanation: |-\r
    Union-Find(또는 단순 그래프 BFS) 로 그룹을 만듭니다. 학습용에서는 모든 쌍을 비교해 거리가 임곗값 이하면 같은 그룹으로 합치는 단순 방식이 충분합니다.\r
\r
    그룹 결과는 dict 또는 list of lists로 정리합니다.\r
  tips:\r
  - 단순한 dict로 "이름 → 대표 그룹 ID" 를 관리하면 그룹화 구현이 짧아집니다.\r
  snippet: |-\r
    fileHashes = {p.name: imagehash.phash(Image.open(p)) for p in tempDir.iterdir()}\r
    names = list(fileHashes.keys())\r
    parent = {name: name for name in names}\r
    def find(x):\r
        while parent[x] != x:\r
            parent[x] = parent[parent[x]]\r
            x = parent[x]\r
        return x\r
    def union(a, b):\r
        parent[find(a)] = find(b)\r
    threshold = 10\r
    for i in range(len(names)):\r
        for j in range(i + 1, len(names)):\r
            if fileHashes[names[i]] - fileHashes[names[j]] <= threshold:\r
                union(names[i], names[j])\r
    groups = {}\r
    for name in names:\r
        groups.setdefault(find(name), []).append(name)\r
    list(groups.values())\r
  exercise:\r
    prompt: 임곗값을 4로 좁혀 그룹 결과가 더 세분화되는지 확인하세요.\r
    starterCode: |-\r
      parent2 = {name: name for name in names}\r
      def find2(x):\r
          while parent2[x] != x:\r
              parent2[x] = parent2[parent2[x]]\r
              x = parent2[x]\r
          return x\r
      def union2(a, b):\r
          parent2[find2(a)] = find2(b)\r
      for i in range(len(names)):\r
          for j in range(i + 1, len(names)):\r
              if fileHashes[names[i]] - fileHashes[names[j]] <= ___:\r
                  union2(names[i], names[j])\r
      groupsTight = {}\r
      for name in names:\r
          groupsTight.setdefault(find2(name), []).append(name)\r
      list(groupsTight.values())\r
    hints:\r
    - 빈칸은 정수 4입니다.\r
    - 임곗값이 작아지면 그룹 수가 늘어납니다.\r
  check:\r
    noError: 그룹화가 오류 없이 끝나야 합니다.\r
    resultCheck: groups의 값이 모두 리스트여야 합니다.\r
- id: visualize\r
  title: 5단계. 결과 시각화\r
  structuredPrimary: true\r
  subtitle: 그룹별 그리드\r
  goal: 각 그룹의 사진들을 가로로 나열해 시각적으로 확인합니다.\r
  why: 시각화로 그룹화 품질을 직접 평가할 수 있어야 합니다.\r
  explanation: |-\r
    각 그룹의 첫 사진을 thumbnail로 변환해 plot으로 나란히 그립니다. 그룹별로 행을 다르게 두면 비교가 깔끔합니다.\r
  tips:\r
  - 그룹별 사진 개수가 크게 다르면 격자 크기를 동적으로 잡는 것이 보기 좋습니다.\r
  snippet: |-\r
    groupList = list(groups.values())\r
    fig, axes = plt.subplots(len(groupList), max(len(g) for g in groupList), figsize=(12, 3 * len(groupList)))\r
    if len(groupList) == 1:\r
        axes = np.array([axes])\r
    for rowIdx, group in enumerate(groupList):\r
        for colIdx in range(axes.shape[1] if axes.ndim > 1 else 1):\r
            ax = axes[rowIdx, colIdx] if axes.ndim > 1 else axes[rowIdx]\r
            ax.axis('off')\r
            if colIdx < len(group):\r
                ax.imshow(Image.open(tempDir / group[colIdx]))\r
                ax.set_title(group[colIdx], fontsize=8)\r
    fig\r
  exercise:\r
    prompt: 그룹의 개수와 각 그룹의 사진 개수를 dict로 출력하세요.\r
    starterCode: |-\r
      groupSize = {f"group_{idx}": len(group) for idx, group in enumerate(___)}\r
      groupSize\r
    hints:\r
    - 빈칸은 groupList 변수입니다.\r
    - 결과는 그룹별 사진 수 dict입니다.\r
  check:\r
    noError: 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: len(groupList) 가 1 이상이어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 응용 함수\r
  goal: 폴더 입력 → 중복 그룹 dict 출력의 함수를 만듭니다.\r
  why: 함수로 묶어 두면 자기 폴더에 적용해 즉시 결과를 얻을 수 있습니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 함수 인자에 임곗값을 두면 사용자가 조절할 수 있습니다.\r
  snippet: |-\r
    def findDuplicates(folder, threshold=10):\r
        folderPath = Path(folder)\r
        hashes = {p.name: imagehash.phash(Image.open(p)) for p in folderPath.iterdir() if p.is_file()}\r
        parentLocal = {name: name for name in hashes}\r
        def findLocal(x):\r
            while parentLocal[x] != x:\r
                parentLocal[x] = parentLocal[parentLocal[x]]\r
                x = parentLocal[x]\r
            return x\r
        names2 = list(hashes.keys())\r
        for i in range(len(names2)):\r
            for j in range(i + 1, len(names2)):\r
                if hashes[names2[i]] - hashes[names2[j]] <= threshold:\r
                    parentLocal[findLocal(names2[i])] = findLocal(names2[j])\r
        groupedLocal = {}\r
        for name in names2:\r
            groupedLocal.setdefault(findLocal(name), []).append(name)\r
        return list(groupedLocal.values())\r
\r
    findDuplicates(tempDir)\r
  exercise:\r
    prompt: "미션1: 임곗값 5, 10, 15에서 그룹 수가 어떻게 변하는지 비교하세요. 미션2: 가장 큰 그룹의 첫 사진을 시각화하세요."\r
    starterCode: |-\r
      thresholds = [5, 10, 15]\r
      counts = [len(findDuplicates(tempDir, threshold=t)) for t in ___]\r
      list(zip(thresholds, counts))\r
    hints:\r
    - 빈칸은 thresholds 변수입니다.\r
    - 임곗값이 클수록 그룹 수가 줄어듭니다.\r
  check:\r
    noError: 응용 함수가 오류 없이 끝나야 합니다.\r
    resultCheck: findDuplicates의 결과 길이가 1 이상이어야 합니다.\r
`;export{e as default};