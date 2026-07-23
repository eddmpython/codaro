var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scikit-learn\r
  - seaborn\r
  id: sklearn_05\r
  title: 손글씨숫자인식\r
  order: 5\r
  category: sklearn\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  tags:\r
  - 다중분류\r
  - 이미지\r
  - PCA\r
  - digits\r
  - 시각화\r
  seo:\r
    title: scikit-learn 다중 분류 - 손글씨 숫자 인식\r
    description: 이미지 데이터로 0~9 숫자를 분류합니다. PCA로 고차원 데이터를 시각화합니다.\r
    keywords:\r
    - scikit-learn\r
    - 다중분류\r
    - digits\r
    - PCA\r
    - 이미지\r
intro:\r
  emoji: ✍️\r
  goal: 이미지 데이터로 손글씨 숫자(0~9)를 인식하는 모델을 만듭니다.\r
  description: 64픽셀(8x8) 이미지 데이터로 10개 클래스 분류를 수행합니다. PCA로 고차원 데이터를 2차원으로 축소하여 시각화합니다. 이전 프로젝트의 train_test_split,\r
    StandardScaler, 다중분류 개념을 복습하고 PCA를 새로 배웁니다.\r
  direction: 손글씨숫자인식에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 손글씨숫자인식 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 불러오기 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 이미지 시각화 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 손글씨숫자인식 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: matplotlib, numpy, pandas, scikit-learn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 손글씨숫자인식 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 손글씨숫자인식 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: 손글씨 숫자 인식에 필요한 라이브러리를 불러옵니다. 차원 축소를 위해 PCA를 추가로 임포트합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sklearn.datasets import load_digits\r
    from sklearn.model_selection import train_test_split\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.linear_model import LogisticRegression\r
    from sklearn.metrics import accuracy_score, classification_report, confusion_matrix\r
    from sklearn.decomposition import PCA\r
    import pandas as pd\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    import seaborn as sns\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      from sklearn.datasets import load_digits\r
      from sklearn.model_selection import train_test_split\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.linear_model import LogisticRegression\r
      from sklearn.metrics import accuracy_score, classification_report, confusion_matrix\r
      from sklearn.decomposition import PCA\r
      import pandas as pd\r
      import numpy as np\r
      import matplotlib.pyplot as plt\r
      import seaborn as sns\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.\r
- id: step2_load\r
  title: 2단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: load_digits()\r
  goal: 2단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    손글씨 숫자 데이터셋은 8x8 픽셀 이미지 1,797개를 담고 있습니다. 각 픽셀은 0~16 사이의 밝기값입니다. 이미지가 64차원 벡터로 펼쳐져 있습니다.\r
\r
    8x8=64 픽셀이 1차원으로 펼쳐져 있습니다. digits.images를 사용하면 (1797, 8, 8) 형태의 원래 이미지를 볼 수 있습니다.\r
  snippet: |-\r
    digits = load_digits()\r
    X = digits.data\r
    y = digits.target\r
    X.shape\r
  exercise:\r
    prompt: 2단계. 데이터 불러오기 예제에서 \`digits\`, \`X\`, \`y\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      digits = load_digits()\r
      X = digits.data\r
      y = digits.target\r
      X.shape\r
    hints:\r
    - 바꿀 지점은 \`digits = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`digits\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 불러오기에서 \`digits\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 데이터 불러오기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_visualize\r
  title: 3단계. 이미지 시각화\r
  structuredPrimary: true\r
  subtitle: 샘플 확인\r
  goal: 3단계. 이미지 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 이미지 처리는 크기, 채널, 저장 결과를 바로 확인해야 잘못된 변환을 빨리 찾을 수 있습니다.\r
  explanation: 실제 이미지가 어떻게 생겼는지 확인합니다. 8x8 해상도지만 사람이 숫자를 인식할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    fig, axes = plt.subplots(2, 5, figsize=(10, 5))\r
    for i, ax in enumerate(axes.flat):\r
        ax.imshow(digits.images[i], cmap='gray')\r
        ax.set_title(f'Label: {digits.target[i]}')\r
        ax.axis('off')\r
    fig.suptitle('Sample Digit Images')\r
    fig\r
  exercise:\r
    prompt: 3단계. 이미지 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fig, axes = plt.subplots(2, 5, figsize=(10, 5))\r
      for i, ax in enumerate(axes.flat):\r
          ax.imshow(digits.images[i], cmap='gray')\r
          ax.set_title(f'Label: {digits.target[i]}')\r
          ax.axis('off')\r
      fig.suptitle('Sample Digit Images')\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 이미지 시각화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 3단계. 이미지 시각화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step4_split\r
  title: 4단계. 데이터 분할\r
  structuredPrimary: true\r
  subtitle: train_test_split\r
  goal: 4단계. 데이터 분할에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 이전 프로젝트와 동일하게 학습/테스트 데이터로 분할합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42)\r
    xTrain.shape, xTest.shape\r
  exercise:\r
    prompt: 4단계. 데이터 분할 예제에서 \`xTrain\`, \`xTest\`, \`yTrain\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42)\r
      xTrain.shape, xTest.shape\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 데이터 분할에서 \`xTrain\`, \`xTest\`, \`yTrain\` 할당 개수와 값 순서가 맞아야 합니다.\r
    resultCheck: 4단계. 데이터 분할 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_scale\r
  title: 5단계. 스케일링\r
  structuredPrimary: true\r
  subtitle: StandardScaler\r
  goal: 5단계. 스케일링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 픽셀값은 0~16 범위이지만, 스케일링을 적용하면 LogisticRegression의 수렴이 빨라집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    scaler = StandardScaler()\r
    xTrainSc = scaler.fit_transform(xTrain)\r
    xTestSc = scaler.transform(xTest)\r
  exercise:\r
    prompt: 5단계. 스케일링 예제에서 \`scaler\`, \`xTrainSc\`, \`xTestSc\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      scaler = StandardScaler()\r
      xTrainSc = scaler.fit_transform(xTrain)\r
      xTestSc = scaler.transform(xTest)\r
    hints:\r
    - 바꿀 지점은 \`scaler = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`scaler\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 스케일링에서 \`scaler\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 스케일링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_model\r
  title: 6단계. 모델 학습\r
  structuredPrimary: true\r
  subtitle: LogisticRegression\r
  goal: 6단계. 모델 학습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    10개 클래스(0~9)를 분류하는 다중 분류 문제입니다. LogisticRegression은 자동으로 다중 분류를 처리합니다.\r
\r
    LogisticRegression은 기본적으로 OvR(One-vs-Rest) 방식으로 다중 분류를 처리합니다. 각 클래스에 대해 이진 분류기를 학습하고, 가장 높은 확률의 클래스를 선택합니다.\r
  tips:\r
  - LogisticRegression은 기본적으로 OvR(One-vs-Rest) 방식으로 다중 분류를 처리합니다. 각 클래스에 대해 이진 분류기를 학습하고, 가장 높은 확률의 클래스를\r
    선택합니다.\r
  snippet: |-\r
    model = LogisticRegression(max_iter=1000)\r
    model.fit(xTrainSc, yTrain)\r
  exercise:\r
    prompt: 6단계. 모델 학습 예제에서 \`model\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      model = LogisticRegression(max_iter=1000)\r
      model.fit(xTrainSc, yTrain)\r
    hints:\r
    - 바꿀 지점은 \`model = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 모델 학습에서 \`model\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 모델 학습 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step7_evaluate\r
  title: 7단계. 평가\r
  structuredPrimary: true\r
  subtitle: 정확도와 분류 리포트\r
  goal: 7단계. 평가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 10개 클래스의 분류 성능을 평가합니다. 어떤 숫자가 인식하기 어려운지 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    yPred = model.predict(xTestSc)\r
    acc = accuracy_score(yTest, yPred)\r
    f"정확도: {acc:.2%}"\r
  exercise:\r
    prompt: 7단계. 평가 예제에서 \`yPred\`, \`acc\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      yPred = model.predict(xTestSc)\r
      acc = accuracy_score(yTest, yPred)\r
      f"정확도: {acc:.2%}"\r
    hints:\r
    - 바꿀 지점은 \`yPred = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`yPred\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 평가에서 \`yPred\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 평가 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step8_confusion\r
  title: 8단계. 혼동행렬\r
  structuredPrimary: true\r
  subtitle: 오분류 패턴\r
  goal: 8단계. 혼동행렬에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 10x10 혼동행렬로 어떤 숫자가 어떤 숫자로 잘못 인식되는지 확인합니다. 예를 들어 8과 3이 혼동되는 경우가 많습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    cm = confusion_matrix(yTest, yPred)\r
    fig, ax = plt.subplots(figsize=(10, 8))\r
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax)\r
    ax.set_xlabel('Predicted')\r
    ax.set_ylabel('Actual')\r
    ax.set_title('Confusion Matrix - Digits')\r
    fig\r
  exercise:\r
    prompt: 8단계. 혼동행렬 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      cm = confusion_matrix(yTest, yPred)\r
      fig, ax = plt.subplots(figsize=(10, 8))\r
      sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax)\r
      ax.set_xlabel('Predicted')\r
      ax.set_ylabel('Actual')\r
      ax.set_title('Confusion Matrix - Digits')\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 혼동행렬의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 혼동행렬의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_errors\r
  title: 9단계. 오분류 분석\r
  structuredPrimary: true\r
  subtitle: 잘못 예측한 이미지\r
  goal: 9단계. 오분류 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 모델이 잘못 예측한 이미지를 확인합니다. 사람도 헷갈릴 수 있는 필체인지, 모델의 한계인지 파악합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    errors = np.where(yPred != yTest)[0]\r
    fig, axes = plt.subplots(2, 5, figsize=(12, 5))\r
    for i, ax in enumerate(axes.flat):\r
        if i < len(errors):\r
            idx = errors[i]\r
            img = xTest[idx].reshape(8, 8)\r
            ax.imshow(img, cmap='gray')\r
            ax.set_title(f'True: {yTest[idx]}, Pred: {yPred[idx]}')\r
        ax.axis('off')\r
    fig.suptitle('Misclassified Samples')\r
    fig\r
  exercise:\r
    prompt: 9단계. 오분류 분석 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      errors = np.where(yPred != yTest)[0]\r
      fig, axes = plt.subplots(2, 5, figsize=(12, 5))\r
      for i, ax in enumerate(axes.flat):\r
          if i < len(errors):\r
              idx = errors[i]\r
              img = xTest[idx].reshape(8, 8)\r
              ax.imshow(img, cmap='gray')\r
              ax.set_title(f'True: {yTest[idx]}, Pred: {yPred[idx]}')\r
          ax.axis('off')\r
      fig.suptitle('Misclassified Samples')\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 오분류 분석의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 오분류 분석 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_pca_intro\r
  title: 10단계. PCA 소개\r
  structuredPrimary: true\r
  subtitle: 차원 축소\r
  goal: 10단계. PCA 소개에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    PCA(Principal Component Analysis)는 고차원 데이터를 저차원으로 압축합니다. 64차원 데이터를 2차원으로 축소하면 시각화할 수 있습니다. 정보 손실을 최소화하면서 차원을 줄입니다.\r
\r
    PCA는 분산을 최대화하는 방향(주성분)을 찾습니다. 첫 번째 주성분이 가장 많은 분산을 설명하고, 두 번째가 그 다음입니다. n_components로 유지할 주성분 수를 지정합니다.\r
  snippet: |-\r
    pca = PCA(n_components=2)\r
    xPca = pca.fit_transform(xTrainSc)\r
    xPca.shape\r
  exercise:\r
    prompt: 10단계. PCA 소개 예제에서 \`pca\`, \`xPca\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      pca = PCA(n_components=2)\r
      xPca = pca.fit_transform(xTrainSc)\r
      xPca.shape\r
    hints:\r
    - 바꿀 지점은 \`pca = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`pca\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. PCA 소개에서 \`pca\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. PCA 소개 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step11_pca_visualize\r
  title: 11단계. PCA 시각화\r
  structuredPrimary: true\r
  subtitle: 2D 산점도\r
  goal: 11단계. PCA 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    2차원으로 축소된 데이터를 산점도로 시각화합니다. 같은 숫자끼리 군집을 이루는지, 어떤 숫자가 겹치는지 확인합니다.\r
\r
    explained_variance_ratio_는 각 주성분이 전체 분산의 몇 %를 설명하는지 나타냅니다. 2개 주성분으로 약 20~30%를 설명하면, 나머지 70~80%의 정보가 손실됩니다.\r
  tips:\r
  - explained_variance_ratio_는 각 주성분이 전체 분산의 몇 %를 설명하는지 나타냅니다. 2개 주성분으로 약 20~30%를 설명하면, 나머지 70~80%의 정보가\r
    손실됩니다.\r
  snippet: |-\r
    fig, ax = plt.subplots(figsize=(10, 8))\r
    scatter = ax.scatter(xPca[:, 0], xPca[:, 1], c=yTrain, cmap='tab10', alpha=0.6)\r
    ax.set_xlabel('PC1')\r
    ax.set_ylabel('PC2')\r
    ax.set_title('Digits in 2D (PCA)')\r
    cbar = plt.colorbar(scatter, ax=ax)\r
    cbar.set_label('Digit')\r
    fig\r
  exercise:\r
    prompt: 11단계. PCA 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fig, ax = plt.subplots(figsize=(10, 8))\r
      scatter = ax.scatter(xPca[:, 0], xPca[:, 1], c=yTrain, cmap='tab10', alpha=0.6)\r
      ax.set_xlabel('PC1')\r
      ax.set_ylabel('PC2')\r
      ax.set_title('Digits in 2D (PCA)')\r
      cbar = plt.colorbar(scatter, ax=ax)\r
      cbar.set_label('Digit')\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. PCA 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. PCA 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step12_pca_components\r
  title: 12단계. 적정 차원 수\r
  structuredPrimary: true\r
  subtitle: 분산 누적\r
  goal: 12단계. 적정 차원 수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 몇 개의 주성분으로 충분한 정보를 유지할 수 있는지 확인합니다. 보통 95% 분산을 유지하는 차원 수를 선택합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pcaFull = PCA()\r
    pcaFull.fit(xTrainSc)\r
    cumVar = np.cumsum(pcaFull.explained_variance_ratio_)\r
    nFor95 = int(np.argmax(cumVar >= 0.95) + 1)\r
\r
    fig, ax = plt.subplots(figsize=(10, 5))\r
    ax.plot(range(1, 65), cumVar, 'bo-')\r
    ax.axhline(0.95, color='r', linestyle='--', label='95% threshold')\r
    ax.set_xlabel('Number of Components')\r
    ax.set_ylabel('Cumulative Explained Variance')\r
    ax.set_title('PCA - Cumulative Variance')\r
    ax.legend()\r
    fig\r
  exercise:\r
    prompt: 12단계. 적정 차원 수 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      pcaFull = PCA()\r
      pcaFull.fit(xTrainSc)\r
      cumVar = np.cumsum(pcaFull.explained_variance_ratio_)\r
      nFor95 = int(np.argmax(cumVar >= 0.95) + 1)\r
\r
      fig, ax = plt.subplots(figsize=(10, 5))\r
      ax.plot(range(1, 65), cumVar, 'bo-')\r
      ax.axhline(0.95, color='r', linestyle='--', label='95% threshold')\r
      ax.set_xlabel('Number of Components')\r
      ax.set_ylabel('Cumulative Explained Variance')\r
      ax.set_title('PCA - Cumulative Variance')\r
      ax.legend()\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 적정 차원 수의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 12단계. 적정 차원 수의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step13_summary\r
  title: 13단계. 정리\r
  structuredPrimary: true\r
  subtitle: 이미지 분류와 PCA 완료\r
  goal: 13단계. 정리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 이번 프로젝트에서는 손글씨 숫자 인식 모델을 만들어 이미지 분류를 학습했습니다. 64차원 데이터를 PCA로 축소하여 시각화하는 방법을 배웠습니다. 고차원 데이터에서\r
    패턴을 파악하는 데 PCA가 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    summary = pd.DataFrame({\r
        'Item': ['Dataset', 'Features', 'Classes', 'Accuracy', 'PCA for 95%'],\r
        'Value': ['Digits (1,797)', '64 (8x8)', '10 (0-9)', f'{acc:.2%}', f'{nFor95} components']\r
    })\r
    summary\r
  exercise:\r
    prompt: 13단계. 정리 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      summary = pd.DataFrame({\r
          'Item': ['Dataset', 'Features', 'Classes', 'Accuracy', 'PCA for 95%'],\r
          'Value': ['Digits (1,797)', '64 (8x8)', '10 (0-9)', f'{acc:.2%}', f'{nFor95} components']\r
      })\r
      summary\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 13단계. 정리의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 13단계. 정리 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 숫자 인식 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    OCR 개발자가 되어 숫자 인식 시스템을 구축합니다. 각 미션은 데이터 로딩부터 모델 학습, 평가까지 전 과정을 독립적으로 수행합니다. train_test_split, StandardScaler, LogisticRegression, PCA, confusion_matrix를 모두 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from sklearn.datasets import load_digits\r
    from sklearn.model_selection import train_test_split\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.decomposition import PCA\r
    from sklearn.linear_model import LogisticRegression\r
    from sklearn.metrics import accuracy_score\r
    import pandas as pd\r
\r
    data = load_digits()\r
    xData = data.data\r
    yData = data.target\r
\r
    xTr, xTe, yTr, yTe = train_test_split(xData, yData, test_size=0.2, random_state=42)\r
    sc = StandardScaler()\r
    xTrSc = sc.fit_transform(xTr)\r
    xTeSc = sc.transform(xTe)\r
\r
    dims = [2, 5, 10, 20, 30, 64]\r
    results = []\r
\r
    for d in dims:\r
        if d < 64:\r
            pca = PCA(n_components=d)\r
            xTrPca = pca.fit_transform(xTrSc)\r
            xTePca = pca.transform(xTeSc)\r
        else:\r
            xTrPca, xTePca = xTrSc, xTeSc\r
\r
        model = LogisticRegression(max_iter=1000)\r
        model.fit(xTrPca, yTr)\r
        pred = model.predict(xTePca)\r
        results.append({'Dimensions': d, 'Accuracy': accuracy_score(yTe, pred)})\r
\r
    pd.DataFrame(results)\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.datasets import load_digits\r
      from sklearn.model_selection import train_test_split\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.decomposition import PCA\r
      from sklearn.linear_model import LogisticRegression\r
      from sklearn.metrics import accuracy_score\r
      import pandas as pd\r
\r
      data = load_digits()\r
      xData = data.data\r
      yData = data.target\r
\r
      xTr, xTe, yTr, yTe = train_test_split(xData, yData, test_size=0.2, random_state=42)\r
      sc = StandardScaler()\r
      xTrSc = sc.fit_transform(xTr)\r
      xTeSc = sc.transform(xTe)\r
\r
      dims = [2, 5, 10, 20, 30, 64]\r
      results = []\r
\r
      for d in dims:\r
          if d < 64:\r
              pca = PCA(n_components=d)\r
              xTrPca = pca.fit_transform(xTrSc)\r
              xTePca = pca.transform(xTeSc)\r
          else:\r
              xTrPca, xTePca = xTrSc, xTeSc\r
\r
          model = LogisticRegression(max_iter=1000)\r
          model.fit(xTrPca, yTr)\r
          pred = model.predict(xTePca)\r
          results.append({'Dimensions': d, 'Accuracy': accuracy_score(yTe, pred)})\r
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