var e=`meta:\r
  id: deepVision_04\r
  title: 이미지 유사도 검색\r
  order: 4\r
  category: deepVision\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  packages:\r
  - matplotlib
  - numpy
  - pillow
  - scikit-learn
  - torch\r
  - torchvision\r
  tags:\r
  - torchvision\r
  - 임베딩\r
  - 코사인유사도\r
  - 검색\r
  - top-N\r
  seo:\r
    title: 딥러닝 비전 - 이미지 유사도 검색\r
    description: 임베딩 + 코사인 유사도로 작은 이미지 라이브러리 검색을 구현합니다.\r
    keywords:\r
    - 임베딩\r
    - 유사도검색\r
    - 코사인유사도\r
    - 이미지검색\r
    - torchvision\r
intro:\r
  emoji: 🔎\r
  goal: 임베딩 벡터로 작은 이미지 라이브러리에서 가장 비슷한 사진 N장을 찾는 검색 기능을 만듭니다.\r
  description: |-\r
    임베딩의 가장 직관적인 응용은 검색입니다. 작은 라이브러리의 모든 사진을 임베딩으로 변환해 두고, 질의 사진의 임베딩과 코사인 유사도로 비교하면 비슷한 사진을 즉시 찾을 수 있습니다. 이 강의는 그 흐름을 합성 라이브러리로 직접 구현합니다.\r
  direction: 다양한 변형이 가해진 사진 라이브러리를 만들고, 질의 사진과 비슷한 N장을 코사인 유사도로 검색합니다.\r
  benefits:\r
  - 라이브러리 사진 N장의 임베딩을 한 번에 계산해 행렬로 보관합니다.\r
  - 코사인 유사도를 행렬 곱 한 번으로 계산합니다.\r
  - 결과를 query 사진과 함께 시각화하는 표준 검색 결과 화면을 만듭니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 만들기\r
      detail: 변형된 사진 N장을 합성합니다.\r
    - label: 2단계. 임베딩 일괄 계산\r
      detail: 배치 추론으로 (N, 512) 행렬을 얻습니다.\r
    - label: 3단계. 질의 임베딩\r
      detail: 검색할 사진의 벡터를 만듭니다.\r
    - label: 4단계. 코사인 유사도와 top-N\r
      detail: 한 번의 곱셈으로 결과를 얻습니다.\r
    - label: 5단계. 결과 시각화\r
      detail: query + 상위 N장.\r
    runtime:\r
    - label: PyTorch 환경\r
      detail: torchvision encoder + numpy 행렬 연산.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: build_library\r
  title: 1단계. 라이브러리 만들기\r
  structuredPrimary: true\r
  subtitle: 변형 사진 6장\r
  goal: china와 flower에 다양한 변형을 적용해 6장짜리 작은 라이브러리를 만듭니다.\r
  why: 합성 라이브러리는 실제 데이터 없이도 검색 흐름을 검증할 수 있게 해 줍니다.\r
  explanation: |-\r
    원본 두 장 + 회전 두 장 + 노이즈 두 장으로 6장을 만듭니다. 각 사진에 짧은 이름을 붙여 결과 시각화에서 라벨로 씁니다.\r
\r
    노이즈는 가우시안 노이즈(평균 0, 표준편차 15)를 더한 뒤 클립해 만듭니다.\r
  tips:\r
  - 검색 라이브러리의 변형을 다양하게 두면 알고리즘이 어떤 차이에 강한지 확인할 수 있습니다.\r
  snippet: |-\r
    import torch\r
    import torchvision\r
    import torch.nn as nn\r
    import torch.nn.functional as F\r
    from torchvision.models import resnet18, ResNet18_Weights\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from PIL import Image\r
    from sklearn.datasets import load_sample_image\r
\r
    china = load_sample_image('china.jpg')\r
    flower = load_sample_image('flower.jpg')\r
\r
    def addNoise(img, sigma):\r
        noise = np.random.RandomState(42).normal(0, sigma, img.shape)\r
        return (img.astype(np.float32) + noise).clip(0, 255).astype(np.uint8)\r
\r
    library = [\r
        ('china', china),\r
        ('china_rot', np.rot90(china, k=1).copy()),\r
        ('china_noisy', addNoise(china, 15)),\r
        ('flower', flower),\r
        ('flower_rot', np.rot90(flower, k=1).copy()),\r
        ('flower_noisy', addNoise(flower, 15)),\r
    ]\r
    len(library), library[0][0]\r
  exercise:\r
    prompt: 라이브러리의 모든 사진을 2x3 그리드로 시각화하세요.\r
    starterCode: |-\r
      fig, axes = plt.subplots(2, 3, figsize=(12, 6))\r
      for axis, (name, img) in zip(axes.ravel(), library):\r
          axis.imshow(img)\r
          axis.set_title(name)\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - axes.ravel은 2x3 그리드를 1차원으로 펴 줍니다.\r
    - 6장이 모두 화면에 출력되어야 합니다.\r
  check:\r
    noError: 라이브러리 생성과 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: library의 길이가 6이어야 합니다.\r
- id: batch_embedding\r
  title: 2단계. 임베딩 일괄 계산\r
  structuredPrimary: true\r
  subtitle: 배치 추론\r
  goal: 라이브러리의 모든 사진을 한 번에 인코더에 통과시켜 (N, 512) 행렬을 얻습니다.\r
  why: 배치 추론이 한 장씩 호출하는 것보다 빠르고 코드도 단순합니다.\r
  explanation: |-\r
    각 사진을 preprocess로 변환한 뒤 \`torch.stack(...)\` 으로 배치 텐서를 만듭니다. 인코더에 통과시키고 flatten하면 (N, 512) 행렬이 됩니다.\r
\r
    \`weights.transforms()\` 전처리는 PIL Image나 torch Tensor만 받습니다. 라이브러리 사진은 numpy ndarray이므로 \`Image.fromarray(...)\` 로 감싸 전달합니다.\r
\r
    L2 정규화한 행렬을 보관하면 이후 검색이 단순해집니다.\r
  tips:\r
  - 라이브러리가 큰 경우 메모리 사용량이 커집니다. 적절한 배치 크기로 나누어 처리하는 것이 표준입니다.\r
  - weights.transforms() 전처리는 ndarray를 거부합니다. Image.fromarray로 PIL Image로 바꿔 넣으세요.\r
  snippet: |-\r
    from PIL import Image\r
\r
    weights = ResNet18_Weights.DEFAULT\r
    model = resnet18(weights=weights)\r
    encoder = nn.Sequential(*list(model.children())[:-1])\r
    encoder.eval()\r
    preprocess = weights.transforms()\r
\r
    batch = torch.stack([preprocess(Image.fromarray(item[1])) for item in library])\r
    with torch.inference_mode():\r
        libFeat = encoder(batch).flatten(1)\r
    libFeatNorm = F.normalize(libFeat, dim=1)\r
    libFeatNorm.shape\r
  exercise:\r
    prompt: 라이브러리의 첫 두 사진 임베딩 사이의 코사인 유사도를 계산하세요.\r
    starterCode: |-\r
      simFirstTwo = float((libFeatNorm[___] * libFeatNorm[1]).sum())\r
      simFirstTwo\r
    hints:\r
    - 첫 사진의 인덱스는 0입니다.\r
    - 같은 china의 두 변형이라 유사도가 높아야 합니다.\r
  check:\r
    noError: 배치 추론이 오류 없이 끝나야 합니다.\r
    resultCheck: libFeatNorm.shape이 torch.Size([6, 512]) 이어야 합니다.\r
- id: query\r
  title: 3단계. 질의 임베딩\r
  structuredPrimary: true\r
  subtitle: 검색할 사진 한 장\r
  goal: 질의 사진의 임베딩을 만들고 정규화합니다.\r
  why: 검색은 항상 질의 임베딩 한 개와 라이브러리 N개의 비교입니다.\r
  explanation: |-\r
    질의는 라이브러리에 없는 새 사진이어야 의미 있는 검증이 됩니다. 여기서는 china에 색 보정을 살짝 가한 사진을 질의로 씁니다.\r
\r
    질의 사진도 numpy ndarray이므로 \`weights.transforms()\` 전처리에 넣기 전 \`Image.fromarray(...)\` 로 PIL Image로 감쌉니다.\r
  tips:\r
  - 질의 사진은 라이브러리에 들어가지 않아야 검색 평가가 공정합니다.\r
  - weights.transforms() 전처리는 ndarray를 거부합니다. Image.fromarray로 PIL Image로 바꿔 넣으세요.\r
  snippet: |-\r
    queryImg = (china.astype(np.float32) * 1.1 + 5).clip(0, 255).astype(np.uint8)\r
    queryBatch = preprocess(Image.fromarray(queryImg)).unsqueeze(0)\r
    with torch.inference_mode():\r
        queryFeat = encoder(queryBatch).flatten(1)\r
    queryFeatNorm = F.normalize(queryFeat, dim=1)\r
    queryFeatNorm.shape\r
  exercise:\r
    prompt: flower 기반의 질의 queryFlower를 만들고 임베딩을 얻으세요.\r
    starterCode: |-\r
      queryFlower = (flower.astype(np.float32) * 0.9 + 10).clip(0, 255).astype(np.uint8)\r
      queryFlowerBatch = preprocess(Image.fromarray(queryFlower)).unsqueeze(0)\r
      with torch.inference_mode():\r
          queryFlowerFeat = encoder(queryFlowerBatch).flatten(___)\r
      queryFlowerNorm = F.normalize(queryFlowerFeat, dim=1)\r
      queryFlowerNorm.shape\r
    hints:\r
    - 빈칸은 정수 1입니다.\r
    - 질의 임베딩도 (1, 512) 모양입니다.\r
  check:\r
    noError: 질의 임베딩 추출이 오류 없이 끝나야 합니다.\r
    resultCheck: queryFeatNorm.shape이 torch.Size([1, 512]) 이어야 합니다.\r
- id: top_n\r
  title: 4단계. 코사인 유사도와 top-N\r
  structuredPrimary: true\r
  subtitle: 행렬 곱 한 번\r
  goal: 질의 벡터와 라이브러리 행렬을 곱해 모든 유사도를 한 번에 얻고 상위 N개를 추출합니다.\r
  why: 임베딩이 정규화되어 있으면 검색이 행렬 곱 한 줄입니다.\r
  explanation: |-\r
    \`sims = queryFeatNorm @ libFeatNorm.T\` 는 (1, N) 결과를 만듭니다. \`squeeze(0)\` 후 \`topk(k)\` 로 상위 k개의 인덱스와 점수를 얻습니다.\r
\r
    검색 결과의 일부는 질의 자신과 비슷한 변형, 일부는 다른 카테고리 사진일 수 있습니다.\r
  tips:\r
  - 큰 라이브러리는 FAISS 같은 인덱싱 라이브러리를 쓰지만, 학습용에서는 numpy 행렬 곱으로 충분합니다.\r
  snippet: |-\r
    sims = (queryFeatNorm @ libFeatNorm.T).squeeze(0)\r
    topVals, topIdx = sims.topk(3)\r
    [(library[int(i)][0], float(v)) for i, v in zip(topIdx, topVals)]\r
  exercise:\r
    prompt: queryFlower에 대해서도 top-3 결과를 얻으세요.\r
    starterCode: |-\r
      simsFlower = (queryFlowerNorm @ libFeatNorm.T).squeeze(___)\r
      topF, topIF = simsFlower.topk(3)\r
      [(library[int(i)][0], float(v)) for i, v in zip(topIF, topF)]\r
    hints:\r
    - 빈칸은 0입니다.\r
    - flower 계열 사진이 상위에 나와야 정상입니다.\r
  check:\r
    noError: 행렬 곱과 topk가 오류 없이 끝나야 합니다.\r
    resultCheck: topVals의 길이가 3이어야 합니다.\r
- id: visualize\r
  title: 5단계. 결과 시각화\r
  structuredPrimary: true\r
  subtitle: query + top-3\r
  goal: 질의 사진과 상위 3장을 한 화면에 시각화합니다.\r
  why: 검색 결과 화면은 정확성을 사람이 즉시 평가할 수 있는 표준 UX입니다.\r
  explanation: |-\r
    1x4 subplots를 만들어 좌측에 질의, 우측 세 칸에 상위 결과를 그립니다. 각 결과 타이틀에 사진 이름과 유사도 점수를 표시합니다.\r
  tips:\r
  - 검색 결과 화면은 학습용 코드에서도 표준 패턴을 따르면 다른 응용에 그대로 활용할 수 있습니다.\r
  snippet: |-\r
    queryFlower = (flower.astype(np.float32) * 0.9 + 10).clip(0, 255).astype(np.uint8)\r
    queryFlowerBatch = preprocess(Image.fromarray(queryFlower)).unsqueeze(0)\r
    with torch.inference_mode():\r
        queryFlowerFeat = encoder(queryFlowerBatch).flatten(1)\r
    queryFlowerNorm = F.normalize(queryFlowerFeat, dim=1)\r
    simsFlower = (queryFlowerNorm @ libFeatNorm.T).squeeze(0)\r
    topF, topIF = simsFlower.topk(3)\r
\r
    fig, axes = plt.subplots(1, 4, figsize=(14, 4))\r
    axes[0].imshow(queryImg)\r
    axes[0].set_title('query')\r
    axes[0].axis('off')\r
    for axis, (idx, score) in zip(axes[1:], zip(topIdx.tolist(), topVals.tolist())):\r
        name, img = library[int(idx)]\r
        axis.imshow(img)\r
        axis.set_title(f'{name}\\n{score:.3f}')\r
        axis.axis('off')\r
    fig\r
  exercise:\r
    prompt: queryFlower의 결과도 같은 패턴으로 시각화하세요.\r
    starterCode: |-\r
      fig2, axes2 = plt.subplots(1, 4, figsize=(14, 4))\r
      axes2[0].imshow(queryFlower)\r
      axes2[0].set_title('query: flower')\r
      axes2[0].axis('off')\r
      for axis, (idx, score) in zip(axes2[1:], zip(topIF.tolist(), topF.tolist())):\r
          name, img = library[int(idx)]\r
          axis.imshow(img)\r
          axis.set_title(f'{name}\\n{score:.3f}')\r
          axis.axis('off')\r
      fig2\r
    hints:\r
    - 같은 패턴을 그대로 적용하면 됩니다.\r
    - flower 계열이 상위에 나와야 합니다.\r
  check:\r
    noError: 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: 두 시각화 모두 4장의 사진이 출력되어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 검색 평가\r
  goal: 라이브러리의 사진들을 질의로 사용해 검색 정확도를 평가합니다.\r
  why: 자기 자신을 질의로 사용하는 leave-one-out 평가는 검색 성능의 표준 지표입니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - 같은 카테고리 사진들이 상위에 나오면 임베딩이 의미를 잘 잡고 있다는 신호입니다.\r
  snippet: |-\r
    selfSims = libFeatNorm @ libFeatNorm.T\r
    np.fill_diagonal(selfSims.numpy(), -1.0)\r
    bestIdx = selfSims.argmax(dim=1)\r
    for srcIdx, hitIdx in enumerate(bestIdx.tolist()):\r
        print(library[srcIdx][0], '→', library[hitIdx][0])\r
    selfSims.shape\r
  exercise:\r
    prompt: "미션1: 위 결과에서 같은 카테고리(접두사 china/flower)가 매칭된 비율을 출력하세요. 미션2: 라이브러리 안의 모든 쌍의 유사도 행렬을 imshow로 시각화하세요."\r
    starterCode: |-\r
      sameCategoryHits = 0\r
      for srcIdx, hitIdx in enumerate(bestIdx.tolist()):\r
          prefSrc = library[srcIdx][0].split('_')[0]\r
          prefHit = library[hitIdx][0].split('_')[0]\r
          if prefSrc == prefHit:\r
              sameCategoryHits += 1\r
      accuracy = sameCategoryHits / ___\r
      accuracy\r
    hints:\r
    - 분모는 라이브러리 크기입니다.\r
    - accuracy는 0~1 사이여야 합니다.\r
  check:\r
    noError: 검색 평가가 오류 없이 끝나야 합니다.\r
    resultCheck: selfSims.shape이 (6, 6)이어야 합니다.\r
`;export{e as default};