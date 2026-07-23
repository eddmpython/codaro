var e=`meta:\r
  packages:\r
  - folium\r
  id: folium_08\r
  title: 히트맵\r
  order: 8\r
  category: folium\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - folium\r
  - HeatMap\r
  - 히트맵\r
  - 밀도\r
  - 시각화\r
  seo:\r
    title: Folium HeatMap - 밀도 시각화\r
    description: Folium으로 히트맵을 만듭니다. 포인트 데이터의 밀도를 색상으로 시각화합니다.\r
    keywords:\r
    - folium\r
    - HeatMap\r
    - 히트맵\r
    - 밀도\r
    - gradient\r
intro:\r
  emoji: 🔥\r
  goal: 포인트 데이터를 히트맵으로 시각화합니다.\r
  description: 히트맵은 데이터의 밀집도를 색상으로 표현합니다. 많은 포인트가 모인 곳은 빨갛게, 적은 곳은 파랗게 표시됩니다. 인구 밀도, 매장 분포, 범죄 발생 지역 등을\r
    시각화할 때 사용합니다.\r
  direction: 히트맵에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.\r
  benefits:\r
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.\r
  - 히트맵 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기본 히트맵 처리 실행\r
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. radius와 blu 결과 검증\r
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.\r
    - label: 히트맵 재사용\r
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 지도 시각화 환경\r
      detail: folium 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 히트맵 실행\r
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.\r
    - label: 히트맵 완료\r
      detail: 검증된 코드를 위치 기반 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: folium과 HeatMap 플러그인을 불러옵니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import folium\r
    from folium.plugins import HeatMap\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import folium\r
      from folium.plugins import HeatMap\r
    hints:\r
    - 바꿀 지점은 위도/경도 데이터을 만드는 첫 줄과 지도 레이어 구성 줄에서 찾으세요.\r
    - 실행 뒤 마커와 저장 HTML 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 마커와 저장 HTML 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step2_basic_heatmap\r
  title: 2단계. 기본 히트맵\r
  structuredPrimary: true\r
  subtitle: HeatMap()\r
  goal: 2단계. 기본 히트맵에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    HeatMap은 좌표 리스트를 받아 밀도를 시각화합니다. 좌표가 많이 모인 곳이 더 진하게 표시됩니다.\r
\r
    좌표가 밀집된 곳(시청 근처)이 더 진한 색으로 표시됩니다.\r
  snippet: |-\r
    seoulCenter = [37.5665, 126.9780]\r
    m1 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    heatData = [\r
        [37.5665, 126.9780],\r
        [37.5670, 126.9785],\r
        [37.5660, 126.9775],\r
        [37.5668, 126.9782],\r
        [37.5663, 126.9778],\r
        [37.5700, 126.9750],\r
        [37.5705, 126.9755],\r
        [37.5630, 126.9820],\r
        [37.5632, 126.9825]\r
    ]\r
\r
    HeatMap(heatData).add_to(m1)\r
\r
    m1\r
  exercise:\r
    prompt: 2단계. 기본 히트맵 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      seoulCenter = [37.5665, 126.9780]\r
      m1 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      heatData = [\r
          [37.5665, 126.9780],\r
          [37.5670, 126.9785],\r
          [37.5660, 126.9775],\r
          [37.5668, 126.9782],\r
          [37.5663, 126.9778],\r
          [37.5700, 126.9750],\r
          [37.5705, 126.9755],\r
          [37.5630, 126.9820],\r
          [37.5632, 126.9825]\r
      ]\r
\r
      HeatMap(heatData).add_to(m1)\r
\r
      m1\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 기본 히트맵에서 \`seoulCenter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 기본 히트맵 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_radius_blur\r
  title: 3단계. radius와 blur\r
  structuredPrimary: true\r
  subtitle: 크기 조절\r
  goal: 3단계. radius와 blur에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    radius는 각 포인트의 영향 범위, blur는 경계의 부드러움을 조절합니다.\r
\r
    radius를 크게 하면 넓게 퍼지고, blur를 높이면 경계가 부드러워집니다. 기본값은 radius=25, blur=15입니다.\r
  snippet: |-\r
    m2 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    HeatMap(\r
        heatData,\r
        radius=25\r
    ).add_to(m2)\r
\r
    m2\r
  exercise:\r
    prompt: 3단계. radius와 blur 예제에서 \`m2\`, \`radius\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      m2 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      HeatMap(\r
          heatData,\r
          radius=25\r
      ).add_to(m2)\r
\r
      m2\r
    hints:\r
    - 바꿀 지점은 \`m2 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`m2\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 3단계. radius와 blur에서 \`m2\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. radius와 blur 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_gradient\r
  title: 4단계. 색상 그라데이션\r
  structuredPrimary: true\r
  subtitle: gradient\r
  goal: 4단계. 색상 그라데이션에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    gradient로 색상 구간을 지정합니다. 0~1 사이 값에 색상을 매핑합니다.\r
\r
    gradient 키는 0~1 사이 값이고, 밀도가 높을수록 1에 가까운 색상이 적용됩니다.\r
  snippet: |-\r
    m4 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    customGradient = {\r
        0.2: "blue",\r
        0.4: "lime",\r
        0.6: "yellow",\r
        0.8: "orange",\r
        1.0: "red"\r
    }\r
\r
    HeatMap(\r
        heatData,\r
        gradient=customGradient,\r
        radius=25\r
    ).add_to(m4)\r
\r
    m4\r
  exercise:\r
    prompt: 4단계. 색상 그라데이션 예제에서 \`m4\`, \`customGradient\`, \`gradient\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      m4 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      customGradient = {\r
          0.2: "blue",\r
          0.4: "lime",\r
          0.6: "yellow",\r
          0.8: "orange",\r
          1.0: "red"\r
      }\r
\r
      HeatMap(\r
          heatData,\r
          gradient=customGradient,\r
          radius=25\r
      ).add_to(m4)\r
\r
      m4\r
    hints:\r
    - 바꿀 지점은 \`m4 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`m4\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 색상 그라데이션에서 \`m4\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 색상 그라데이션 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_weighted_heatmap\r
  title: 5단계. 가중치 히트맵\r
  structuredPrimary: true\r
  subtitle: weight\r
  goal: 5단계. 가중치 히트맵에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    좌표에 가중치를 추가하면 특정 포인트를 더 강조할 수 있습니다. [위도, 경도, 가중치] 형태로 데이터를 전달합니다.\r
\r
    가중치가 1에 가까울수록 더 진하게 표시됩니다. 매출액, 인구수 등을 가중치로 사용합니다.\r
  snippet: |-\r
    m6 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    weightedData = [\r
        [37.5665, 126.9780, 1.0],\r
        [37.5670, 126.9785, 0.8],\r
        [37.5660, 126.9775, 0.5],\r
        [37.5700, 126.9750, 0.3],\r
        [37.5630, 126.9820, 0.2]\r
    ]\r
\r
    HeatMap(weightedData, radius=30).add_to(m6)\r
\r
    m6\r
  exercise:\r
    prompt: 5단계. 가중치 히트맵 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m6 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      weightedData = [\r
          [37.5665, 126.9780, 1.0],\r
          [37.5670, 126.9785, 0.8],\r
          [37.5660, 126.9775, 0.5],\r
          [37.5700, 126.9750, 0.3],\r
          [37.5630, 126.9820, 0.2]\r
      ]\r
\r
      HeatMap(weightedData, radius=30).add_to(m6)\r
\r
      m6\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 가중치 히트맵에서 \`m6\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 가중치 히트맵 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_min_opacity\r
  title: 6단계. 최소 투명도\r
  structuredPrimary: true\r
  subtitle: min_opacity\r
  goal: 6단계. 최소 투명도에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    min_opacity로 낮은 밀도 영역의 최소 투명도를 설정합니다.\r
\r
    min_opacity를 높이면 낮은 밀도 영역도 보입니다. 기본값은 0.5입니다.\r
  snippet: |-\r
    m7 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    HeatMap(\r
        heatData,\r
        min_opacity=0.3,\r
        radius=25\r
    ).add_to(m7)\r
\r
    m7\r
  exercise:\r
    prompt: 6단계. 최소 투명도 예제에서 \`m7\`, \`min_opacity\`, \`radius\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      m7 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      HeatMap(\r
          heatData,\r
          min_opacity=0.3,\r
          radius=25\r
      ).add_to(m7)\r
\r
      m7\r
    hints:\r
    - 바꿀 지점은 \`m7 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`m7\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 최소 투명도에서 \`m7\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 최소 투명도 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step7_max_zoom\r
  title: 7단계. 줌 레벨 설정\r
  structuredPrimary: true\r
  subtitle: max_zoom\r
  goal: 7단계. 줌 레벨 설정에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    max_zoom으로 히트맵이 표시되는 최대 줌 레벨을 설정합니다. 높은 줌에서는 포인트가 분산됩니다.\r
\r
    줌을 많이 확대하면 포인트들이 분산되어 히트맵 효과가 줄어듭니다.\r
  snippet: |-\r
    m8 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    HeatMap(\r
        heatData,\r
        max_zoom=15,\r
        radius=25\r
    ).add_to(m8)\r
\r
    m8\r
  exercise:\r
    prompt: 7단계. 줌 레벨 설정 예제에서 \`m8\`, \`max_zoom\`, \`radius\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      m8 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      HeatMap(\r
          heatData,\r
          max_zoom=15,\r
          radius=25\r
      ).add_to(m8)\r
\r
      m8\r
    hints:\r
    - 바꿀 지점은 \`m8 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`m8\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 줌 레벨 설정에서 \`m8\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 줌 레벨 설정 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step8_large_data\r
  title: 8단계. 대량 데이터\r
  structuredPrimary: true\r
  subtitle: 많은 포인트\r
  goal: 8단계. 대량 데이터에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    히트맵은 대량의 포인트 데이터에서 진가를 발휘합니다. 랜덤 데이터로 테스트합니다.\r
\r
    특정 위치에 포인트를 집중시키면 그 영역이 더 진하게 표시됩니다.\r
  snippet: |-\r
    import random\r
\r
    m9 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
    largeData = []\r
    for _ in range(100):\r
        lat = 37.5 + random.uniform(-0.05, 0.05)\r
        lon = 126.95 + random.uniform(-0.05, 0.05)\r
        largeData.append([lat, lon])\r
\r
    for _ in range(50):\r
        lat = 37.5665 + random.uniform(-0.01, 0.01)\r
        lon = 126.9780 + random.uniform(-0.01, 0.01)\r
        largeData.append([lat, lon])\r
\r
    HeatMap(largeData, radius=15).add_to(m9)\r
\r
    m9\r
  exercise:\r
    prompt: 8단계. 대량 데이터 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import random\r
\r
      m9 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
      largeData = []\r
      for _ in range(100):\r
          lat = 37.5 + random.uniform(-0.05, 0.05)\r
          lon = 126.95 + random.uniform(-0.05, 0.05)\r
          largeData.append([lat, lon])\r
\r
      for _ in range(50):\r
          lat = 37.5665 + random.uniform(-0.01, 0.01)\r
          lon = 126.9780 + random.uniform(-0.01, 0.01)\r
          largeData.append([lat, lon])\r
\r
      HeatMap(largeData, radius=15).add_to(m9)\r
\r
      m9\r
    hints:\r
    - 바꿀 지점은 \`largeData\`를 만드는 반복 횟수, 좌표 범위, HeatMap의 radius 값입니다.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 대량 데이터의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 8단계. 대량 데이터 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step9_with_markers\r
  title: 9단계. 마커와 조합\r
  structuredPrimary: true\r
  subtitle: 히트맵 + 마커\r
  goal: 9단계. 마커와 조합에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    히트맵 위에 마커를 추가하여 주요 위치를 강조합니다.\r
\r
    밝은 배경(CartoDB Positron)에서 히트맵이 더 잘 보입니다.\r
  snippet: |-\r
    m10 = folium.Map(location=seoulCenter, zoom_start=13, tiles="CartoDB Positron")\r
\r
    storeLocations = []\r
    for _ in range(30):\r
        lat = 37.5665 + random.uniform(-0.02, 0.02)\r
        lon = 126.9780 + random.uniform(-0.02, 0.02)\r
        storeLocations.append([lat, lon])\r
\r
    for _ in range(20):\r
        lat = 37.5500 + random.uniform(-0.01, 0.01)\r
        lon = 126.9900 + random.uniform(-0.01, 0.01)\r
        storeLocations.append([lat, lon])\r
\r
    HeatMap(\r
        storeLocations,\r
        radius=20,\r
        gradient={0.4: "yellow", 0.6: "orange", 1: "red"}\r
    ).add_to(m10)\r
\r
    folium.Marker(\r
        seoulCenter,\r
        popup="본사",\r
        icon=folium.Icon(color="blue", icon="home")\r
    ).add_to(m10)\r
\r
    m10\r
  exercise:\r
    prompt: 9단계. 마커와 조합 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      m10 = folium.Map(location=seoulCenter, zoom_start=13, tiles="CartoDB Positron")\r
\r
      storeLocations = []\r
      for _ in range(30):\r
          lat = 37.5665 + random.uniform(-0.02, 0.02)\r
          lon = 126.9780 + random.uniform(-0.02, 0.02)\r
          storeLocations.append([lat, lon])\r
\r
      for _ in range(20):\r
          lat = 37.5500 + random.uniform(-0.01, 0.01)\r
          lon = 126.9900 + random.uniform(-0.01, 0.01)\r
          storeLocations.append([lat, lon])\r
\r
      HeatMap(\r
          storeLocations,\r
          radius=20,\r
          gradient={0.4: "yellow", 0.6: "orange", 1: "red"}\r
      ).add_to(m10)\r
\r
      folium.Marker(\r
          seoulCenter,\r
          popup="본사",\r
          icon=folium.Icon(color="blue", icon="home")\r
      ).add_to(m10)\r
\r
      m10\r
    hints:\r
    - 바꿀 지점은 \`complaintHeatRows\`의 \`district\`, \`loc\`, \`weight\` 값입니다.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 마커와 조합의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 마커와 조합 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_complete\r
  title: 10단계. 완성 예제\r
  structuredPrimary: true\r
  subtitle: 인구 밀도 지도\r
  goal: 10단계. 완성 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 서울 주요 지역의 인구 밀도를 히트맵으로 시각화합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import random\r
\r
    densityMap = folium.Map(\r
        location=[37.55, 126.98],\r
        zoom_start=12,\r
        tiles="CartoDB Dark_Matter"\r
    )\r
\r
    densityData = []\r
\r
    gangnam = [37.4979, 127.0276]\r
    for _ in range(80):\r
        lat = gangnam[0] + random.uniform(-0.015, 0.015)\r
        lon = gangnam[1] + random.uniform(-0.015, 0.015)\r
        densityData.append([lat, lon, 0.8])\r
\r
    myeongdong = [37.5636, 126.9869]\r
    for _ in range(60):\r
        lat = myeongdong[0] + random.uniform(-0.01, 0.01)\r
        lon = myeongdong[1] + random.uniform(-0.01, 0.01)\r
        densityData.append([lat, lon, 0.9])\r
\r
    hongdae = [37.5563, 126.9236]\r
    for _ in range(50):\r
        lat = hongdae[0] + random.uniform(-0.012, 0.012)\r
        lon = hongdae[1] + random.uniform(-0.012, 0.012)\r
        densityData.append([lat, lon, 0.7])\r
\r
    for _ in range(100):\r
        lat = 37.55 + random.uniform(-0.08, 0.08)\r
        lon = 126.98 + random.uniform(-0.08, 0.08)\r
        densityData.append([lat, lon, 0.2])\r
\r
    densityGradient = {\r
        0.2: "#0000ff",\r
        0.4: "#00ffff",\r
        0.6: "#00ff00",\r
        0.8: "#ffff00",\r
        1.0: "#ff0000"\r
    }\r
\r
    HeatMap(\r
        densityData,\r
        radius=25,\r
        blur=20,\r
        gradient=densityGradient,\r
        min_opacity=0.4\r
    ).add_to(densityMap)\r
\r
    hotspots = [\r
        {"name": "강남", "loc": gangnam},\r
        {"name": "명동", "loc": myeongdong},\r
        {"name": "홍대", "loc": hongdae}\r
    ]\r
\r
    for spot in hotspots:\r
        folium.Marker(\r
            location=spot["loc"],\r
            popup=spot["name"],\r
            icon=folium.Icon(color="white", icon="star")\r
        ).add_to(densityMap)\r
\r
    densityMap\r
  exercise:\r
    prompt: 10단계. 완성 예제 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import random\r
\r
      densityMap = folium.Map(\r
          location=[37.55, 126.98],\r
          zoom_start=12,\r
          tiles="CartoDB Dark_Matter"\r
      )\r
\r
      densityData = []\r
\r
      gangnam = [37.4979, 127.0276]\r
      for _ in range(80):\r
          lat = gangnam[0] + random.uniform(-0.015, 0.015)\r
          lon = gangnam[1] + random.uniform(-0.015, 0.015)\r
          densityData.append([lat, lon, 0.8])\r
\r
      myeongdong = [37.5636, 126.9869]\r
      for _ in range(60):\r
          lat = myeongdong[0] + random.uniform(-0.01, 0.01)\r
          lon = myeongdong[1] + random.uniform(-0.01, 0.01)\r
          densityData.append([lat, lon, 0.9])\r
\r
      hongdae = [37.5563, 126.9236]\r
      for _ in range(50):\r
          lat = hongdae[0] + random.uniform(-0.012, 0.012)\r
          lon = hongdae[1] + random.uniform(-0.012, 0.012)\r
          densityData.append([lat, lon, 0.7])\r
\r
      for _ in range(100):\r
          lat = 37.55 + random.uniform(-0.08, 0.08)\r
          lon = 126.98 + random.uniform(-0.08, 0.08)\r
          densityData.append([lat, lon, 0.2])\r
\r
      densityGradient = {\r
          0.2: "#0000ff",\r
          0.4: "#00ffff",\r
          0.6: "#00ff00",\r
          0.8: "#ffff00",\r
          1.0: "#ff0000"\r
      }\r
\r
      HeatMap(\r
          densityData,\r
          radius=25,\r
          blur=20,\r
          gradient=densityGradient,\r
          min_opacity=0.4\r
      ).add_to(densityMap)\r
\r
      hotspots = [\r
          {"name": "강남", "loc": gangnam},\r
          {"name": "명동", "loc": myeongdong},\r
          {"name": "홍대", "loc": hongdae}\r
      ]\r
\r
      for spot in hotspots:\r
          folium.Marker(\r
              location=spot["loc"],\r
              popup=spot["name"],\r
              icon=folium.Icon(color="white", icon="star")\r
          ).add_to(densityMap)\r
\r
      densityMap\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 완성 예제의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 완성 예제 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step11_workflow\r
  title: 11단계. 실무 히트맵 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → 데이터 오류 확인 → 렌더 검증 → 기준 실험\r
  goal: 11단계. 실무 히트맵 검증에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 히트맵은 좌표와 가중치가 조금만 틀려도 밀집 지역 해석이 달라지므로 데이터 행과 집계 결과를 함께 확인해야 합니다.\r
  explanation: |-\r
    히트맵은 색이 진한 곳을 보는 도구지만, 실무에서는 그 색이 믿을 만한 데이터에서 나온 것인지가 먼저입니다. 좌표 범위, 가중치 범위, 권역별 합계, 렌더 결과를 검증한 뒤 radius와 임계값을 바꿔 해석이 어떻게 달라지는지 실험해야 합니다.\r
\r
    히트맵은 색보다 데이터 계약이 먼저입니다. 좌표, 가중치, 권역 합계, 렌더 결과를 검증하면 밀도 지도를 업무 리포트의 근거로 사용할 수 있습니다.\r
  snippet: |-\r
    complaintHeatRows = [\r
        {"district": "강남", "loc": [37.4979, 127.0276], "weight": 0.95, "type": "배송지연"},\r
        {"district": "강남", "loc": [37.5010, 127.0310], "weight": 0.80, "type": "재고부족"},\r
        {"district": "강남", "loc": [37.4930, 127.0240], "weight": 0.70, "type": "배송지연"},\r
        {"district": "홍대", "loc": [37.5563, 126.9236], "weight": 0.65, "type": "응대지연"},\r
        {"district": "홍대", "loc": [37.5580, 126.9255], "weight": 0.55, "type": "응대지연"},\r
        {"district": "여의도", "loc": [37.5219, 126.9245], "weight": 0.45, "type": "배송지연"},\r
        {"district": "여의도", "loc": [37.5260, 126.9290], "weight": 0.35, "type": "문의증가"},\r
    ]\r
\r
    districtHeatScore = {}\r
    for row in complaintHeatRows:\r
        districtHeatScore[row["district"]] = districtHeatScore.get(row["district"], 0) + row["weight"]\r
\r
    hottestDistrict = max(districtHeatScore, key=districtHeatScore.get)\r
    hottestDistrict, round(districtHeatScore[hottestDistrict], 2)\r
  exercise:\r
    prompt: 11단계. 실무 히트맵 검증 예제에서 민원 좌표, 구 이름, 가중치를 바꾸고 가장 뜨거운 구 집계가 달라지는지 확인하세요.\r
    starterCode: |-\r
      complaintHeatRows = [\r
          {"district": "강남", "loc": [37.4979, 127.0276], "weight": 0.95, "type": "배송지연"},\r
          {"district": "강남", "loc": [37.5010, 127.0310], "weight": 0.80, "type": "재고부족"},\r
          {"district": "강남", "loc": [37.4930, 127.0240], "weight": 0.70, "type": "배송지연"},\r
          {"district": "홍대", "loc": [37.5563, 126.9236], "weight": 0.65, "type": "응대지연"},\r
          {"district": "홍대", "loc": [37.5580, 126.9255], "weight": 0.55, "type": "응대지연"},\r
          {"district": "여의도", "loc": [37.5219, 126.9245], "weight": 0.45, "type": "배송지연"},\r
          {"district": "여의도", "loc": [37.5260, 126.9290], "weight": 0.35, "type": "문의증가"},\r
      ]\r
\r
      districtHeatScore = {}\r
      for row in complaintHeatRows:\r
          districtHeatScore[row["district"]] = districtHeatScore.get(row["district"], 0) + row["weight"]\r
\r
      hottestDistrict = max(districtHeatScore, key=districtHeatScore.get)\r
      hottestDistrict, round(districtHeatScore[hottestDistrict], 2)\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 구별 누적 점수와 \`hottestDistrict\`가 바꾼 히트맵 입력을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 실무 히트맵 검증의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 11단계. 실무 히트맵 검증 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 히트맵\r
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 지금까지 배운 내용을 활용하여 미션을 수행해봅시다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import folium\r
    from folium.plugins import HeatMap\r
    import random\r
    incidentData = []\r
    hotspot1 = [37.57, 126.98]\r
    for _ in range(40):\r
        lat = hotspot1[0] + random.uniform(-0.008, 0.008)\r
        lon = hotspot1[1] + random.uniform(-0.008, 0.008)\r
        incidentData.append([lat, lon])\r
\r
    hotspot2 = [37.56, 126.99]\r
    for _ in range(25):\r
        lat = hotspot2[0] + random.uniform(-0.006, 0.006)\r
        lon = hotspot2[1] + random.uniform(-0.006, 0.006)\r
        incidentData.append([lat, lon])\r
\r
    len(incidentData)\r
  exercise:\r
    prompt: 실습 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import folium\r
      from folium.plugins import HeatMap\r
      import random\r
      incidentData = []\r
      hotspot1 = [37.57, 126.98]\r
      for _ in range(40):\r
          lat = hotspot1[0] + random.uniform(-0.008, 0.008)\r
          lon = hotspot1[1] + random.uniform(-0.008, 0.008)\r
          incidentData.append([lat, lon])\r
\r
      hotspot2 = [37.56, 126.99]\r
      for _ in range(25):\r
          lat = hotspot2[0] + random.uniform(-0.006, 0.006)\r
          lon = hotspot2[1] + random.uniform(-0.006, 0.006)\r
          incidentData.append([lat, lon])\r
\r
      len(incidentData)\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
`;export{e as default};