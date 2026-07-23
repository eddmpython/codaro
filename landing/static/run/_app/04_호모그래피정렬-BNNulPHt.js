var e=`meta:\r
  id: visionFeatures_04\r
  title: 호모그래피로 이미지 정렬\r
  order: 4\r
  category: visionFeatures\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 중급\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - opencv-python\r
  - scikit-learn\r
  tags:\r
  - opencv\r
  - 호모그래피\r
  - findHomography\r
  - warpPerspective\r
  - 정렬\r
  seo:\r
    title: 비전 특징점 - 호모그래피로 이미지 정렬\r
    description: 매칭 점들로 호모그래피를 추정하고 warpPerspective로 두 사진을 같은 좌표계에 맞춥니다.\r
    keywords:\r
    - 호모그래피\r
    - findHomography\r
    - warpPerspective\r
    - 이미지정렬\r
    - opencv\r
intro:\r
  emoji: 🧮\r
  goal: 매칭된 점들로 한 사진을 다른 사진의 좌표계로 옮기는 호모그래피 변환을 익힙니다.\r
  description: |-\r
    "두 사진의 같은 영역을 정확히 겹쳐 놓고 싶다" - 이것이 호모그래피의 출발입니다. 매칭으로 얻은 점들에서 RANSAC으로 변환 행렬을 추정하고, warpPerspective로 한 사진을 다른 좌표계로 옮깁니다. 다음 강의 파노라마 스티칭의 직전 단계입니다.\r
  direction: 매칭 점들에서 호모그래피를 추정하고 warpPerspective로 정렬해 두 사진을 한 좌표계에 겹칩니다.\r
  benefits:\r
  - findHomography의 RANSAC inlier 마스크를 이해합니다.\r
  - 호모그래피 행렬 H를 직접 다루고 의미를 해석합니다.\r
  - warpPerspective로 한 사진을 변환해 정렬 결과를 시각화합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 매칭 점 좌표 추출\r
      detail: DMatch 객체에서 (x, y) 쌍을 뽑습니다.\r
    - label: 2단계. findHomography로 H 추정\r
      detail: RANSAC으로 잘못된 매칭을 자동으로 거릅니다.\r
    - label: 3단계. inlier 매칭 시각화\r
      detail: 좋은 매칭만 골라 그립니다.\r
    - label: 4단계. warpPerspective 적용\r
      detail: 한 사진을 다른 사진 좌표계로 옮깁니다.\r
    - label: 5단계. 두 사진 겹치기\r
      detail: 정렬 후 평균 합성으로 겹쳐 봅니다.\r
    runtime:\r
    - label: 비전 환경\r
      detail: opencv-python의 findHomography, warpPerspective를 사용합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: extract_points\r
  title: 1단계. 매칭 점 좌표 추출\r
  structuredPrimary: true\r
  subtitle: DMatch에서 (x, y) 쌍\r
  goal: knnMatch 결과에서 두 이미지의 매칭 좌표 쌍을 numpy 배열로 만듭니다.\r
  why: 호모그래피 함수는 좌표 배열을 입력으로 받으므로 DMatch에서 좌표만 추출해야 합니다.\r
  explanation: |-\r
    각 DMatch는 \`.queryIdx\` (첫 이미지 키포인트 인덱스)와 \`.trainIdx\` (두 번째 이미지 키포인트 인덱스)를 가집니다. 키포인트 리스트와 인덱스를 결합해 좌표를 얻습니다.\r
\r
    findHomography가 기대하는 형식은 \`(N, 1, 2)\` float32 배열입니다. 다음 코드는 그 형식으로 만듭니다.\r
  tips:\r
  - reshape(-1, 1, 2) 가 OpenCV 함수가 원하는 표준 형식입니다.\r
  snippet: |-\r
    import cv2\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    china = load_sample_image('china.jpg')\r
    h, w = china.shape[:2]\r
    rotMat = cv2.getRotationMatrix2D((w / 2, h / 2), angle=18, scale=1.0)\r
    rotMat[:, 2] += [25, 12]\r
    warped = cv2.warpAffine(china, rotMat, (w, h))\r
\r
    orb = cv2.ORB_create(nfeatures=1000)\r
    grayA = cv2.cvtColor(china, cv2.COLOR_RGB2GRAY)\r
    grayB = cv2.cvtColor(warped, cv2.COLOR_RGB2GRAY)\r
    kpA, descA = orb.detectAndCompute(grayA, mask=None)\r
    kpB, descB = orb.detectAndCompute(grayB, mask=None)\r
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)\r
    knn = bf.knnMatch(descA, descB, k=2)\r
    good = [m1 for m1, m2 in knn if m1.distance < 0.75 * m2.distance]\r
    srcPts = np.array([kpA[m.queryIdx].pt for m in good], dtype=np.float32).reshape(-1, 1, 2)\r
    dstPts = np.array([kpB[m.trainIdx].pt for m in good], dtype=np.float32).reshape(-1, 1, 2)\r
    srcPts.shape, dstPts.shape\r
  exercise:\r
    prompt: 매칭 점 첫 5개의 (x, y) 좌표를 깔끔하게 출력하세요.\r
    starterCode: |-\r
      [(srcPts[i, 0].tolist(), dstPts[i, 0].tolist()) for i in range(___)]\r
    hints:\r
    - 빈칸은 정수입니다.\r
    - 결과는 (src, dst) 좌표 쌍 다섯 개입니다.\r
  check:\r
    noError: 좌표 추출이 오류 없이 끝나야 합니다.\r
    resultCheck: srcPts.shape의 마지막 차원이 2여야 합니다.\r
- id: find_homography\r
  title: 2단계. findHomography로 H 추정\r
  structuredPrimary: true\r
  subtitle: RANSAC 한 줄\r
  goal: cv2.findHomography로 두 점 집합에서 3x3 변환 행렬과 inlier 마스크를 얻습니다.\r
  why: 매칭에 잘못된 짝이 섞여 있어도 RANSAC이 자동으로 거르고 유효한 변환만 남깁니다.\r
  explanation: |-\r
    \`cv2.findHomography(srcPts, dstPts, cv2.RANSAC, ransacReprojThreshold=4.0)\` 는 3x3 변환 행렬 H와 inlier mask를 돌려줍니다. 마스크는 (N, 1) 모양의 uint8 배열로 1이 inlier, 0이 outlier입니다.\r
\r
    임곗값 4.0은 변환 후 거리 오차 4픽셀까지를 inlier로 인정한다는 의미입니다.\r
  tips:\r
  - findHomography 결과가 None이면 매칭이 너무 적거나 변환이 잡히지 않는다는 뜻입니다. 최소 4쌍이 필요합니다.\r
  snippet: |-\r
    H, inlierMask = cv2.findHomography(srcPts, dstPts, cv2.RANSAC, 4.0)\r
    H.shape, int(inlierMask.sum()), len(good)\r
  exercise:\r
    prompt: 임곗값을 1.0(엄격)과 10.0(느슨)으로 각각 적용해 inlier 개수가 어떻게 바뀌는지 비교하세요.\r
    starterCode: |-\r
      _, strictMask = cv2.findHomography(srcPts, dstPts, cv2.RANSAC, ___)\r
      _, looseMask = cv2.findHomography(srcPts, dstPts, cv2.RANSAC, ___)\r
      int(strictMask.sum()), int(looseMask.sum())\r
    hints:\r
    - 1.0이 엄격, 10.0이 느슨입니다.\r
    - 엄격할수록 inlier가 줄어듭니다.\r
  check:\r
    noError: findHomography가 오류 없이 끝나야 합니다.\r
    resultCheck: H.shape이 (3, 3)이어야 합니다.\r
- id: draw_inliers\r
  title: 3단계. inlier 매칭 시각화\r
  structuredPrimary: true\r
  subtitle: 좋은 매칭만 그리기\r
  goal: inlier로 표시된 매칭만 골라 drawMatches로 시각화합니다.\r
  why: RANSAC이 어떤 매칭을 좋다고 골랐는지 시각적으로 확인하는 것이 표준 디버깅입니다.\r
  explanation: |-\r
    inlierMask의 1번 위치만 골라 \`good\` 매칭에서 추출합니다. drawMatches에 inlier 리스트만 전달하면 좋은 짝만 선으로 이어집니다.\r
\r
    좋은 결과는 inlier 비율이 60%~90%입니다. 50% 미만이면 매칭이 빈약하거나 변환이 호모그래피로 표현되지 않습니다.\r
  tips:\r
  - inlier 비율은 매칭 품질의 핵심 지표입니다. 비율이 낮으면 변환 모델을 의심해야 합니다.\r
  snippet: |-\r
    inliers = [match for match, flag in zip(good, inlierMask.ravel()) if flag == 1]\r
    drawn = cv2.drawMatches(china, kpA, warped, kpB, inliers, None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)\r
    fig = plt.figure(figsize=(12, 5))\r
    plt.imshow(drawn)\r
    plt.title(f'inliers {len(inliers)} / {len(good)}')\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: outlier만 골라 따로 시각화하세요.\r
    starterCode: |-\r
      outliers = [match for match, flag in zip(good, inlierMask.ravel()) if flag == ___]\r
      drawnOut = cv2.drawMatches(china, kpA, warped, kpB, outliers, None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)\r
      fig2 = plt.figure(figsize=(12, 5))\r
      plt.imshow(drawnOut)\r
      plt.title(f'outliers {len(outliers)}')\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - outlier는 flag == 0 입니다.\r
    - 결과의 선들이 무작위 방향이어야 정상입니다.\r
  check:\r
    noError: 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: len(inliers) 가 0보다 커야 합니다.\r
- id: warp_perspective\r
  title: 4단계. warpPerspective 적용\r
  structuredPrimary: true\r
  subtitle: 한 사진을 다른 좌표계로\r
  goal: 호모그래피 H로 첫 이미지를 두 번째 이미지 좌표계로 옮깁니다.\r
  why: 정렬 결과를 직접 보면 H의 의미가 분명해집니다.\r
  explanation: |-\r
    \`cv2.warpPerspective(china, H, (w, h))\` 는 china를 H로 변환해 (w, h) 크기 캔버스에 그립니다. 결과는 warped와 같은 좌표계가 되어 같은 객체가 같은 위치에 있어야 합니다.\r
\r
    가장자리의 검은 영역은 변환 후 데이터가 없는 부분입니다.\r
  tips:\r
  - warpPerspective의 출력 크기는 결과 캔버스 크기입니다. 입력 이미지 크기와 다를 수도 있습니다.\r
  snippet: |-\r
    aligned = cv2.warpPerspective(china, H, (w, h))\r
    fig = plt.figure(figsize=(8, 5))\r
    plt.imshow(aligned)\r
    plt.title('china warped to match warped')\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 역변환을 적용해 warped를 china 좌표계로 옮긴 inverseAligned 이미지를 만드세요.\r
    starterCode: |-\r
      H_inv = np.linalg.inv(H)\r
      inverseAligned = cv2.warpPerspective(warped, ___, (w, h))\r
      fig2 = plt.figure(figsize=(8, 5))\r
      plt.imshow(inverseAligned)\r
      plt.axis('off')\r
      fig2\r
    hints:\r
    - 빈칸은 역행렬 변수입니다.\r
    - 결과가 원본 china와 비슷한 모양이어야 합니다.\r
  check:\r
    noError: 변환과 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: aligned.shape 이 warped.shape 와 같아야 합니다.\r
- id: overlay\r
  title: 5단계. 두 사진 겹치기\r
  structuredPrimary: true\r
  subtitle: 정렬 후 평균 합성\r
  goal: 정렬된 china와 warped를 평균 합성해 정렬 품질을 시각적으로 확인합니다.\r
  why: 평균 합성이 흐릿하지 않게 보이면 정렬이 잘 된 것입니다. 흐려 보이면 정렬에 오차가 있습니다.\r
  explanation: |-\r
    \`((aligned.astype(float) + warped.astype(float)) / 2).clip(0, 255).astype(np.uint8)\` 한 줄로 평균 합성을 만듭니다. 두 사진이 정확히 정렬되어 있으면 평균이 원본과 거의 같게 보입니다.\r
  tips:\r
  - 정렬 평가는 평균 합성 + 시각 비교가 가장 빠릅니다. 숫자 평가도 가능하지만 시간 대비 효과는 시각화가 큽니다.\r
  snippet: |-\r
    overlay = ((aligned.astype(np.float32) + warped.astype(np.float32)) / 2.0).clip(0, 255).astype(np.uint8)\r
    fig = plt.figure(figsize=(8, 5))\r
    plt.imshow(overlay)\r
    plt.title('aligned + warped average')\r
    plt.axis('off')\r
    fig\r
  exercise:\r
    prompt: 정렬을 적용하지 않은 china + warped 평균 badOverlay 이미지를 만들어 비교 출력하세요.\r
    starterCode: |-\r
      badOverlay = ((china.astype(np.float32) + warped.astype(np.float32)) / ___).clip(0, 255).astype(np.uint8)\r
      fig2, axes2 = plt.subplots(1, 2, figsize=(12, 5))\r
      axes2[0].imshow(overlay)\r
      axes2[0].set_title('aligned')\r
      axes2[1].imshow(badOverlay)\r
      axes2[1].set_title('not aligned')\r
      for axis in axes2:\r
          axis.axis('off')\r
      fig2\r
    hints:\r
    - 빈칸은 2 입니다.\r
    - badOverlay는 더 흐려 보여야 합니다.\r
  check:\r
    noError: 평균 합성과 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: overlay.shape 이 china.shape 와 같아야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 호모그래피 분해 분석\r
  goal: 호모그래피 행렬 H를 직접 분해해 회전·이동 성분을 들여다봅니다.\r
  why: 행렬 안에 들어 있는 변환 의미를 알면 디버깅이 빨라집니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - H의 첫 두 행 첫 두 열이 회전·스케일을 담고, 마지막 열이 평행 이동을 담습니다.\r
  snippet: |-\r
    print_H = {"H": H.tolist()}\r
    print_H\r
  exercise:\r
    prompt: "미션1: china의 네 모서리 (0,0), (w,0), (w,h), (0,h) 를 H로 변환해 corners_after를 얻고, warped 좌표계에서 어디로 갔는지 점으로 그리세요. 미션2: warped 위에 변환된 네 모서리를 선으로 이어 사각형을 그리세요(cv2.polylines)."\r
    starterCode: |-\r
      corners = np.array([[0, 0], [w, 0], [w, h], [0, h]], dtype=np.float32).reshape(-1, 1, 2)\r
      corners_after = cv2.perspectiveTransform(corners, H).reshape(-1, 2)\r
      fig = plt.figure(figsize=(8, 5))\r
      plt.imshow(warped)\r
      plt.scatter(corners_after[:, 0], corners_after[:, 1], s=80, c='red', edgecolors='black')\r
      plt.axis('off')\r
      fig\r
    hints:\r
    - cv2.perspectiveTransform 이 점 좌표 변환의 표준 함수입니다.\r
    - polylines는 cv2.polylines(img, [pts], isClosed=True, color, thickness) 형식입니다.\r
  check:\r
    noError: 모서리 변환과 시각화가 오류 없이 끝나야 합니다.\r
    resultCheck: corners_after.shape 이 (4, 2) 여야 합니다.\r
`;export{e as default};