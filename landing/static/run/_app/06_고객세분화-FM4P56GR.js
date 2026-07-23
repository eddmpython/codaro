var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scikit-learn\r
  id: sklearn_06\r
  title: 고객세분화\r
  order: 6\r
  category: sklearn\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - 클러스터링\r
  - KMeans\r
  - 엘보우\r
  - 실루엣\r
  - 세분화\r
  seo:\r
    title: scikit-learn 클러스터링 - K-Means 고객 세분화\r
    description: K-Means로 고객을 군집화합니다. 엘보우 방법과 실루엣 점수로 최적 K를 찾습니다.\r
    keywords:\r
    - scikit-learn\r
    - KMeans\r
    - 클러스터링\r
    - 엘보우\r
    - 실루엣\r
intro:\r
  emoji: 👥\r
  goal: K-Means 클러스터링으로 고객을 세분화합니다.\r
  description: 비지도 학습의 대표 알고리즘인 K-Means를 배웁니다. 엘보우 방법과 실루엣 점수로 최적의 군집 수를 찾고, PCA로 결과를 시각화합니다. 이전 프로젝트의\r
    StandardScaler, PCA를 복습하고 클러스터링을 새로 배웁니다.\r
  direction: 고객세분화에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 고객세분화 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 합성 데이터 생성 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 스케일링 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 고객세분화 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: matplotlib, numpy, pandas, scikit-learn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 고객세분화 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 고객세분화 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: 클러스터링에 필요한 라이브러리를 불러옵니다. KMeans와 실루엣 점수를 추가로 임포트합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sklearn.datasets import make_blobs, make_moons\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.cluster import KMeans\r
    from sklearn.metrics import silhouette_score\r
    from sklearn.decomposition import PCA\r
    import pandas as pd\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      from sklearn.datasets import make_blobs, make_moons\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.cluster import KMeans\r
      from sklearn.metrics import silhouette_score\r
      from sklearn.decomposition import PCA\r
      import pandas as pd\r
      import numpy as np\r
      import matplotlib.pyplot as plt\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.\r
- id: step2_data\r
  title: 2단계. 합성 데이터 생성\r
  structuredPrimary: true\r
  subtitle: make_blobs\r
  goal: 2단계. 합성 데이터 생성에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    make_blobs()로 군집이 있는 합성 데이터를 생성합니다. 실제 고객 데이터 대신 학습용으로 사용합니다. 4개의 군집, 각 군집당 200개 샘플을 생성합니다.\r
\r
    make_blobs는 중심점(centers)과 표준편차(cluster_std)를 지정하여 군집 데이터를 생성합니다. yTrue는 실제 군집 레이블이지만, 클러스터링은 레이블 없이 학습하는 비지도 학습입니다.\r
  tips:\r
  - make_blobs는 중심점(centers)과 표준편차(cluster_std)를 지정하여 군집 데이터를 생성합니다. yTrue는 실제 군집 레이블이지만, 클러스터링은 레이블 없이\r
    학습하는 비지도 학습입니다.\r
  snippet: |-\r
    X, yTrue = make_blobs(n_samples=800, centers=4, cluster_std=1.0, random_state=42)\r
    X.shape\r
  exercise:\r
    prompt: 2단계. 합성 데이터 생성 예제에서 \`X\`, \`yTrue\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      X, yTrue = make_blobs(n_samples=800, centers=4, cluster_std=1.0, random_state=42)\r
      X.shape\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 합성 데이터 생성에서 \`X\`, \`yTrue\` 할당 개수와 값 순서가 맞아야 합니다.\r
    resultCheck: 2단계. 합성 데이터 생성 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_scale\r
  title: 3단계. 스케일링\r
  structuredPrimary: true\r
  subtitle: StandardScaler\r
  goal: 3단계. 스케일링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: K-Means는 유클리드 거리를 사용하므로 스케일링이 중요합니다. 특성 간 스케일이 다르면 거리 계산이 왜곡됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    scaler = StandardScaler()\r
    xSc = scaler.fit_transform(X)\r
  exercise:\r
    prompt: 3단계. 스케일링 예제에서 \`scaler\`, \`xSc\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      scaler = StandardScaler()\r
      xSc = scaler.fit_transform(X)\r
    hints:\r
    - 바꿀 지점은 \`scaler = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`scaler\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 스케일링에서 \`scaler\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 스케일링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_kmeans\r
  title: 4단계. K-Means 기본\r
  structuredPrimary: true\r
  subtitle: n_clusters=4\r
  goal: 4단계. KMeans 기본에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    K-Means는 K개의 군집 중심(centroid)을 찾아 데이터를 가장 가까운 중심에 할당합니다. n_clusters로 군집 수를 지정합니다. 실제로는 최적 K를 모르므로 여러 값을 시도해야 합니다.\r
\r
    fit_predict()는 fit()과 predict()를 한 번에 수행합니다. n_init=10은 서로 다른 초기화로 10번 실행하여 가장 좋은 결과를 선택합니다.\r
  snippet: |-\r
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)\r
    labels = kmeans.fit_predict(xSc)\r
    labels[:20]\r
  exercise:\r
    prompt: 4단계. KMeans 기본 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)\r
      labels = kmeans.fit_predict(xSc)\r
      labels[:20]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. KMeans 기본에서 \`kmeans\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. KMeans 기본 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_visualize\r
  title: 5단계. 결과 시각화\r
  structuredPrimary: true\r
  subtitle: 군집과 중심점\r
  goal: 5단계. 결과 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 클러스터링 결과를 시각화합니다. 군집 중심(centroid)도 함께 표시합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    fig, ax = plt.subplots(figsize=(8, 6))\r
    scatter = ax.scatter(xSc[:, 0], xSc[:, 1], c=labels, cmap='viridis', alpha=0.6)\r
    centers = kmeans.cluster_centers_\r
    ax.scatter(centers[:, 0], centers[:, 1], c='red', marker='X', s=200, label='Centroids')\r
    ax.set_xlabel('Feature 1')\r
    ax.set_ylabel('Feature 2')\r
    ax.set_title('K-Means Clustering Result')\r
    ax.legend()\r
    fig\r
  exercise:\r
    prompt: 5단계. 결과 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fig, ax = plt.subplots(figsize=(8, 6))\r
      scatter = ax.scatter(xSc[:, 0], xSc[:, 1], c=labels, cmap='viridis', alpha=0.6)\r
      centers = kmeans.cluster_centers_\r
      ax.scatter(centers[:, 0], centers[:, 1], c='red', marker='X', s=200, label='Centroids')\r
      ax.set_xlabel('Feature 1')\r
      ax.set_ylabel('Feature 2')\r
      ax.set_title('K-Means Clustering Result')\r
      ax.legend()\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 결과 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 결과 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_inertia\r
  title: 6단계. Inertia\r
  structuredPrimary: true\r
  subtitle: 군집 내 거리 합\r
  goal: 6단계. Inertia에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Inertia는 각 데이터 포인트와 해당 군집 중심 사이 거리의 제곱합입니다. 값이 작을수록 군집이 촘촘합니다. K가 증가하면 inertia는 항상 감소합니다.\r
\r
    Inertia = Σ(각 점과 군집 중심 사이 거리²). K=n이면 inertia=0이 됩니다. 따라서 inertia만으로 최적 K를 정하면 안 됩니다.\r
  snippet: |-\r
    inertia = kmeans.inertia_\r
    f"Inertia: {inertia:.2f}"\r
  exercise:\r
    prompt: 6단계. Inertia 예제에서 \`inertia\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      inertia = kmeans.inertia_\r
      f"Inertia: {inertia:.2f}"\r
    hints:\r
    - 바꿀 지점은 \`inertia = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`inertia\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. Inertia에서 \`inertia\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. Inertia 실행 뒤 \`inertia\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step7_elbow\r
  title: 7단계. 엘보우 방법\r
  structuredPrimary: true\r
  subtitle: 최적 K 찾기\r
  goal: 7단계. 엘보우 방법에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    엘보우 방법은 K를 1부터 증가시키며 inertia를 그래프로 그립니다. 급격히 감소하다가 완만해지는 지점(팔꿈치)이 최적 K입니다.\r
\r
    그래프에서 "팔꿈치" 모양이 나타나는 지점을 찾습니다. 이 예시에서는 K=4 근처에서 기울기가 완만해집니다. 명확하지 않을 때는 실루엣 점수를 함께 사용합니다.\r
  snippet: |-\r
    inertias = []\r
    kRange = range(1, 11)\r
\r
    for k in kRange:\r
        km = KMeans(n_clusters=k, random_state=42, n_init=10)\r
        km.fit(xSc)\r
        inertias.append(km.inertia_)\r
\r
    fig, ax = plt.subplots(figsize=(8, 5))\r
    ax.plot(kRange, inertias, 'bo-')\r
    ax.set_xlabel('Number of Clusters (K)')\r
    ax.set_ylabel('Inertia')\r
    ax.set_title('Elbow Method')\r
    fig\r
  exercise:\r
    prompt: 7단계. 엘보우 방법 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      inertias = []\r
      kRange = range(1, 11)\r
\r
      for k in kRange:\r
          km = KMeans(n_clusters=k, random_state=42, n_init=10)\r
          km.fit(xSc)\r
          inertias.append(km.inertia_)\r
\r
      fig, ax = plt.subplots(figsize=(8, 5))\r
      ax.plot(kRange, inertias, 'bo-')\r
      ax.set_xlabel('Number of Clusters (K)')\r
      ax.set_ylabel('Inertia')\r
      ax.set_title('Elbow Method')\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 엘보우 방법의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 7단계. 엘보우 방법 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step8_silhouette\r
  title: 8단계. 실루엣 점수\r
  structuredPrimary: true\r
  subtitle: 군집 품질 평가\r
  goal: 8단계. 실루엣 점수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    실루엣 점수는 군집이 얼마나 잘 분리되어 있는지 측정합니다. -1~1 사이 값으로, 1에 가까울수록 군집이 잘 나뉘어 있습니다. 0은 군집 경계에 있음, 음수는 잘못된 군집을 의미합니다.\r
\r
    실루엣 점수가 가장 높은 K를 선택합니다. 엘보우와 실루엣이 다른 K를 제안하면, 도메인 지식과 함께 판단합니다.\r
  snippet: |-\r
    silScore = silhouette_score(xSc, labels)\r
    f"실루엣 점수: {silScore:.4f}"\r
  exercise:\r
    prompt: 8단계. 실루엣 점수 예제에서 \`silScore\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      silScore = silhouette_score(xSc, labels)\r
      f"실루엣 점수: {silScore:.4f}"\r
    hints:\r
    - 바꿀 지점은 \`silScore = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`silScore\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 실루엣 점수에서 \`silScore\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 실루엣 점수 실행 뒤 \`silScore\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step9_optimal\r
  title: 9단계. 최적 K 선택\r
  structuredPrimary: true\r
  subtitle: 종합 분석\r
  goal: 9단계. 최적 K 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 엘보우와 실루엣 결과를 종합하여 최적 K를 선택합니다. 두 방법이 같은 K를 제안하면 더 신뢰할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    kRange2 = range(2, 11)\r
    silScores = []\r
    for k in kRange2:\r
        km = KMeans(n_clusters=k, random_state=42, n_init=10)\r
        kLabels = km.fit_predict(xSc)\r
        silScores.append(silhouette_score(xSc, kLabels))\r
\r
    optimalK = list(kRange2)[silScores.index(max(silScores))]\r
\r
    resultDf = pd.DataFrame({\r
        'K': list(kRange2),\r
        'Silhouette': silScores,\r
        'Inertia': inertias[1:]\r
    })\r
    resultDf\r
  exercise:\r
    prompt: 9단계. 최적 K 선택 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      kRange2 = range(2, 11)\r
      silScores = []\r
      for k in kRange2:\r
          km = KMeans(n_clusters=k, random_state=42, n_init=10)\r
          kLabels = km.fit_predict(xSc)\r
          silScores.append(silhouette_score(xSc, kLabels))\r
\r
      optimalK = list(kRange2)[silScores.index(max(silScores))]\r
\r
      resultDf = pd.DataFrame({\r
          'K': list(kRange2),\r
          'Silhouette': silScores,\r
          'Inertia': inertias[1:]\r
      })\r
      resultDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 최적 K 선택의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 9단계. 최적 K 선택의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step10_moons\r
  title: 10단계. 비선형 데이터\r
  structuredPrimary: true\r
  subtitle: make_moons\r
  goal: 10단계. 비선형 데이터에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    K-Means는 구형 군집에 적합합니다. 초승달 모양처럼 비선형 군집에는 잘 작동하지 않습니다. DBSCAN 같은 다른 알고리즘이 필요합니다.\r
\r
    K-Means는 군집 중심(centroid)을 기준으로 하므로 볼록한(convex) 군집에만 잘 작동합니다. 복잡한 형태의 군집에는 DBSCAN, Spectral Clustering 등을 사용합니다.\r
  tips:\r
  - K-Means는 군집 중심(centroid)을 기준으로 하므로 볼록한(convex) 군집에만 잘 작동합니다. 복잡한 형태의 군집에는 DBSCAN, Spectral Clustering\r
    등을 사용합니다.\r
  snippet: |-\r
    xMoon, yMoon = make_moons(n_samples=500, noise=0.1, random_state=42)\r
    scMoon = StandardScaler()\r
    xMoonSc = scMoon.fit_transform(xMoon)\r
\r
    kmMoon = KMeans(n_clusters=2, random_state=42, n_init=10)\r
    moonLabels = kmMoon.fit_predict(xMoonSc)\r
\r
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))\r
    axes[0].scatter(xMoon[:, 0], xMoon[:, 1], c=yMoon, cmap='viridis', alpha=0.6)\r
    axes[0].set_title('Ground Truth')\r
    axes[1].scatter(xMoon[:, 0], xMoon[:, 1], c=moonLabels, cmap='viridis', alpha=0.6)\r
    axes[1].set_title('K-Means Result')\r
    fig\r
  exercise:\r
    prompt: 10단계. 비선형 데이터 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      xMoon, yMoon = make_moons(n_samples=500, noise=0.1, random_state=42)\r
      scMoon = StandardScaler()\r
      xMoonSc = scMoon.fit_transform(xMoon)\r
\r
      kmMoon = KMeans(n_clusters=2, random_state=42, n_init=10)\r
      moonLabels = kmMoon.fit_predict(xMoonSc)\r
\r
      fig, axes = plt.subplots(1, 2, figsize=(12, 5))\r
      axes[0].scatter(xMoon[:, 0], xMoon[:, 1], c=yMoon, cmap='viridis', alpha=0.6)\r
      axes[0].set_title('Ground Truth')\r
      axes[1].scatter(xMoon[:, 0], xMoon[:, 1], c=moonLabels, cmap='viridis', alpha=0.6)\r
      axes[1].set_title('K-Means Result')\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 비선형 데이터의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 비선형 데이터의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step11_pca\r
  title: 11단계. 고차원 클러스터링\r
  structuredPrimary: true\r
  subtitle: PCA로 시각화\r
  goal: 11단계. 고차원 클러스터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 실제 데이터는 고차원인 경우가 많습니다. 클러스터링 결과를 PCA로 2차원에 투영하여 시각화합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    xHigh, yHigh = make_blobs(n_samples=500, n_features=5, centers=3, random_state=42)\r
    scHigh = StandardScaler()\r
    xHighSc = scHigh.fit_transform(xHigh)\r
\r
    kmHigh = KMeans(n_clusters=3, random_state=42, n_init=10)\r
    highLabels = kmHigh.fit_predict(xHighSc)\r
\r
    pca = PCA(n_components=2)\r
    xHighPca = pca.fit_transform(xHighSc)\r
\r
    fig, ax = plt.subplots(figsize=(8, 6))\r
    scatter = ax.scatter(xHighPca[:, 0], xHighPca[:, 1], c=highLabels, cmap='viridis', alpha=0.6)\r
    ax.set_xlabel('PC1')\r
    ax.set_ylabel('PC2')\r
    ax.set_title('5D Data Clustered, Visualized in 2D')\r
    plt.colorbar(scatter, ax=ax)\r
    fig\r
  exercise:\r
    prompt: 11단계. 고차원 클러스터링 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      xHigh, yHigh = make_blobs(n_samples=500, n_features=5, centers=3, random_state=42)\r
      scHigh = StandardScaler()\r
      xHighSc = scHigh.fit_transform(xHigh)\r
\r
      kmHigh = KMeans(n_clusters=3, random_state=42, n_init=10)\r
      highLabels = kmHigh.fit_predict(xHighSc)\r
\r
      pca = PCA(n_components=2)\r
      xHighPca = pca.fit_transform(xHighSc)\r
\r
      fig, ax = plt.subplots(figsize=(8, 6))\r
      scatter = ax.scatter(xHighPca[:, 0], xHighPca[:, 1], c=highLabels, cmap='viridis', alpha=0.6)\r
      ax.set_xlabel('PC1')\r
      ax.set_ylabel('PC2')\r
      ax.set_title('5D Data Clustered, Visualized in 2D')\r
      plt.colorbar(scatter, ax=ax)\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 고차원 클러스터링의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 고차원 클러스터링의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step12_summary\r
  title: 12단계. 정리\r
  structuredPrimary: true\r
  subtitle: 클러스터링 완료\r
  goal: 12단계. 정리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 이번 프로젝트에서는 K-Means 클러스터링으로 데이터를 군집화하는 방법을 배웠습니다. 엘보우 방법과 실루엣 점수로 최적 K를 찾고, PCA로 결과를 시각화했습니다.\r
    비지도 학습의 핵심 개념을 익혔습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    summary = pd.DataFrame({\r
        'Item': ['Algorithm', 'Optimal K', 'Silhouette', 'Method'],\r
        'Value': ['K-Means', str(optimalK), f'{max(silScores):.4f}', 'Elbow + Silhouette']\r
    })\r
    summary\r
  exercise:\r
    prompt: 12단계. 정리 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      summary = pd.DataFrame({\r
          'Item': ['Algorithm', 'Optimal K', 'Silhouette', 'Method'],\r
          'Value': ['K-Means', str(optimalK), f'{max(silScores):.4f}', 'Elbow + Silhouette']\r
      })\r
      summary\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 12단계. 정리의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 정리의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 고객 세분화 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    마케팅 분석가가 되어 고객 세분화 시스템을 구축합니다. 각 미션은 데이터 생성부터 클러스터링, 평가까지 전 과정을 독립적으로 수행합니다. make_blobs, StandardScaler, KMeans, silhouette_score, PCA를 모두 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from sklearn.datasets import make_blobs\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.cluster import KMeans\r
    from sklearn.metrics import silhouette_score\r
    import pandas as pd\r
\r
    results = []\r
    centersList = [3, 5, 7]\r
\r
    for c in centersList:\r
        xData, yData = make_blobs(n_samples=600, centers=c, cluster_std=1.0, random_state=42)\r
        sc = StandardScaler()\r
        xSc = sc.fit_transform(xData)\r
\r
        silScores = []\r
        for k in range(2, 10):\r
            km = KMeans(n_clusters=k, random_state=42, n_init=10)\r
            pred = km.fit_predict(xSc)\r
            silScores.append(silhouette_score(xSc, pred))\r
\r
        optK = range(2, 10)[silScores.index(max(silScores))]\r
        results.append({'True Centers': c, 'Optimal K': optK, 'Best Silhouette': max(silScores)})\r
\r
    pd.DataFrame(results)\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.datasets import make_blobs\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.cluster import KMeans\r
      from sklearn.metrics import silhouette_score\r
      import pandas as pd\r
\r
      results = []\r
      centersList = [3, 5, 7]\r
\r
      for c in centersList:\r
          xData, yData = make_blobs(n_samples=600, centers=c, cluster_std=1.0, random_state=42)\r
          sc = StandardScaler()\r
          xSc = sc.fit_transform(xData)\r
\r
          silScores = []\r
          for k in range(2, 10):\r
              km = KMeans(n_clusters=k, random_state=42, n_init=10)\r
              pred = km.fit_predict(xSc)\r
              silScores.append(silhouette_score(xSc, pred))\r
\r
          optK = range(2, 10)[silScores.index(max(silScores))]\r
          results.append({'True Centers': c, 'Optimal K': optK, 'Best Silhouette': max(silScores)})\r
\r
      pd.DataFrame(results)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: 업무 흐름 검증\r
  structuredPrimary: true\r
  subtitle: 예측 모델 품질 게이트\r
  goal: 업무 흐름 검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 실무 머신러닝은 모델을 fit하는 데서 끝나지 않습니다. 먼저 어떤 성능이 나올지 예측하고, 학습/평가 데이터를 분리한 뒤, 잘못된 입력을 명확한 오류로 막고,\r
    정확도와 F1 점수를 assert로 검증해야 합니다. 마지막에는 하이퍼파라미터를 바꾸는 변주로 성능과 안정성을 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sklearn.datasets import make_classification\r
    from sklearn.model_selection import train_test_split\r
    from sklearn.pipeline import Pipeline\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.linear_model import LogisticRegression\r
    from sklearn.metrics import accuracy_score, f1_score\r
\r
    features, target = make_classification(\r
        n_samples=240,\r
        n_features=6,\r
        n_informative=4,\r
        n_redundant=0,\r
        class_sep=1.4,\r
        random_state=42,\r
    )\r
    xTrain, xTest, yTrain, yTest = train_test_split(\r
        features, target, test_size=0.25, random_state=42, stratify=target\r
    )\r
\r
    riskPipeline = Pipeline([\r
        ("scaler", StandardScaler()),\r
        ("classifier", LogisticRegression(max_iter=1000, random_state=42)),\r
    ])\r
\r
    def fitRiskModel(pipeline, featureMatrix, labels):\r
        pipeline.fit(featureMatrix, labels)\r
        return pipeline\r
\r
    riskModel = fitRiskModel(riskPipeline, xTrain, yTrain)\r
    riskPred = riskModel.predict(xTest)\r
    riskAccuracy = accuracy_score(yTest, riskPred)\r
    riskF1 = f1_score(yTest, riskPred)\r
    xTrain.shape, xTest.shape\r
  exercise:\r
    prompt: 업무 흐름 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      conservativePipeline = Pipeline([\r
          ("scaler", StandardScaler()),\r
          ("classifier", LogisticRegression(C=0.3, max_iter=1000, random_state=42)),\r
      ])\r
      conservativeModel = fitRiskModel(conservativePipeline, xTrain, yTrain)\r
      conservativePred = conservativeModel.predict(xTest)\r
      conservativeAccuracy = accuracy_score(yTest, conservativePred)\r
      conservativeF1 = f1_score(yTest, conservativePred)\r
\r
      assert conservativeAccuracy >= 0.75\r
      {\r
          "baselineAccuracy": round(riskAccuracy, 3),\r
          "baselineF1": round(riskF1, 3),\r
          "conservativeAccuracy": round(conservativeAccuracy, 3),\r
          "conservativeF1": round(conservativeF1, 3),\r
          "accuracyDelta": round(conservativeAccuracy - riskAccuracy, 3),\r
      }\r
    solution: |-\r
      from sklearn.datasets import make_classification\r
      from sklearn.model_selection import train_test_split\r
      from sklearn.pipeline import Pipeline\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.linear_model import LogisticRegression\r
      from sklearn.metrics import accuracy_score, f1_score\r
\r
      features, target = make_classification(\r
          n_samples=240,\r
          n_features=6,\r
          n_informative=4,\r
          n_redundant=0,\r
          class_sep=1.4,\r
          random_state=42,\r
      )\r
      xTrain, xTest, yTrain, yTest = train_test_split(\r
          features, target, test_size=0.25, random_state=42, stratify=target\r
      )\r
\r
      riskPipeline = Pipeline([\r
          ("scaler", StandardScaler()),\r
          ("classifier", LogisticRegression(max_iter=1000, random_state=42)),\r
      ])\r
      xTrain.shape, xTest.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 업무 흐름 검증에서 \`conservativePipeline\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 업무 흐름 검증에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
`;export{e as default};