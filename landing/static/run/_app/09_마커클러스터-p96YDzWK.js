var e=`meta:\r
  packages:\r
  - folium\r
  id: folium_09\r
  title: 마커 클러스터\r
  order: 9\r
  category: folium\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - folium\r
  - MarkerCluster\r
  - 클러스터\r
  - 대량마커\r
  - 그룹화\r
  seo:\r
    title: Folium MarkerCluster - 대량 마커 효율적 표시\r
    description: Folium으로 마커 클러스터를 만듭니다. 수백, 수천 개의 마커를 효율적으로 그룹화합니다.\r
    keywords:\r
    - folium\r
    - MarkerCluster\r
    - 클러스터\r
    - 대량마커\r
    - 줌\r
intro:\r
  emoji: 🔢\r
  goal: 대량의 마커를 클러스터로 효율적으로 표시합니다.\r
  description: 마커가 많으면 지도가 느려지고 보기 어렵습니다. MarkerCluster는 가까운 마커들을 숫자로 그룹화하고, 줌인하면 개별 마커가 나타납니다. 수천 개의\r
    위치도 깔끔하게 표시할 수 있습니다.\r
  direction: 마커 클러스터에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.\r
  benefits:\r
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.\r
  - 마커 클러스터 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기본 클러스터 처리 실행\r
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 대량 데이터 결과 검증\r
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.\r
    - label: 마커 클러스터 재사용\r
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 지도 시각화 환경\r
      detail: folium 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 마커 클러스터 실행\r
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.\r
    - label: 마커 클러스터 완료\r
      detail: 검증된 코드를 위치 기반 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: folium과 MarkerCluster 플러그인을 불러옵니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import folium\r
    from folium.plugins import MarkerCluster\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import folium\r
      from folium.plugins import MarkerCluster\r
    hints:\r
    - 바꿀 지점은 위도/경도 데이터을 만드는 첫 줄과 지도 레이어 구성 줄에서 찾으세요.\r
    - 실행 뒤 마커와 저장 HTML 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 마커와 저장 HTML 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step2_basic_cluster\r
  title: 2단계. 기본 클러스터\r
  structuredPrimary: true\r
  subtitle: MarkerCluster()\r
  goal: 2단계. 기본 클러스터에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    MarkerCluster를 생성하고 마커를 추가합니다. 마커들이 자동으로 그룹화됩니다.\r
\r
    클러스터에 표시된 숫자는 그룹에 포함된 마커 수입니다. 클릭하거나 줌인하면 분리됩니다.\r
  snippet: |-\r
    seoulCenter = [37.5665, 126.9780]\r
    m1 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
    markerCluster = MarkerCluster().add_to(m1)\r
\r
    locations = [\r
        [37.5665, 126.9780],\r
        [37.5670, 126.9785],\r
        [37.5660, 126.9775],\r
        [37.5700, 126.9750],\r
        [37.5710, 126.9760],\r
        [37.5720, 126.9770],\r
        [37.5500, 126.9900],\r
        [37.5510, 126.9910],\r
        [37.5490, 126.9890]\r
    ]\r
\r
    for loc in locations:\r
        folium.Marker(location=loc).add_to(markerCluster)\r
\r
    m1\r
  exercise:\r
    prompt: 2단계. 기본 클러스터 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      seoulCenter = [37.5665, 126.9780]\r
      m1 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
      markerCluster = MarkerCluster().add_to(m1)\r
\r
      locations = [\r
          [37.5665, 126.9780],\r
          [37.5670, 126.9785],\r
          [37.5660, 126.9775],\r
          [37.5700, 126.9750],\r
          [37.5710, 126.9760],\r
          [37.5720, 126.9770],\r
          [37.5500, 126.9900],\r
          [37.5510, 126.9910],\r
          [37.5490, 126.9890]\r
      ]\r
\r
      for loc in locations:\r
          folium.Marker(location=loc).add_to(markerCluster)\r
\r
      m1\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 기본 클러스터의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 2단계. 기본 클러스터 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step3_large_data\r
  title: 3단계. 대량 데이터\r
  structuredPrimary: true\r
  subtitle: 많은 마커\r
  goal: 3단계. 대량 데이터에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    수백 개의 마커를 클러스터로 효율적으로 표시합니다.\r
\r
    200개 마커도 클러스터로 표시하면 지도가 깔끔합니다. 줌인해서 개별 마커를 확인하세요.\r
  snippet: |-\r
    import random\r
\r
    m2 = folium.Map(location=seoulCenter, zoom_start=11)\r
    cluster2 = MarkerCluster().add_to(m2)\r
\r
    for _ in range(200):\r
        lat = 37.5 + random.uniform(-0.1, 0.1)\r
        lon = 127.0 + random.uniform(-0.1, 0.1)\r
        folium.Marker([lat, lon]).add_to(cluster2)\r
\r
    m2\r
  exercise:\r
    prompt: 3단계. 대량 데이터 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import random\r
\r
      m2 = folium.Map(location=seoulCenter, zoom_start=11)\r
      cluster2 = MarkerCluster().add_to(m2)\r
\r
      for _ in range(200):\r
          lat = 37.5 + random.uniform(-0.1, 0.1)\r
          lon = 127.0 + random.uniform(-0.1, 0.1)\r
          folium.Marker([lat, lon]).add_to(cluster2)\r
\r
      m2\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 대량 데이터의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 3단계. 대량 데이터 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step4_popup_tooltip\r
  title: 4단계. 팝업과 툴팁\r
  structuredPrimary: true\r
  subtitle: 마커 정보\r
  goal: 4단계. 팝업과 툴팁에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    클러스터 내 마커에도 팝업과 툴팁을 추가할 수 있습니다.\r
\r
    줌인해서 개별 마커를 클릭하면 팝업이 표시됩니다.\r
  snippet: |-\r
    m3 = folium.Map(location=seoulCenter, zoom_start=13)\r
    cluster3 = MarkerCluster().add_to(m3)\r
\r
    stores = [\r
        {"name": "강남점", "loc": [37.4979, 127.0276]},\r
        {"name": "홍대점", "loc": [37.5563, 126.9236]},\r
        {"name": "명동점", "loc": [37.5636, 126.9869]},\r
        {"name": "시청점", "loc": [37.5665, 126.9780]},\r
        {"name": "여의도점", "loc": [37.5219, 126.9245]},\r
        {"name": "잠실점", "loc": [37.5133, 127.1001]}\r
    ]\r
\r
    for store in stores:\r
        folium.Marker(\r
            location=store["loc"],\r
            popup=f"<b>{store['name']}</b>",\r
            tooltip=store["name"]\r
        ).add_to(cluster3)\r
\r
    m3\r
  exercise:\r
    prompt: 4단계. 팝업과 툴팁 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      m3 = folium.Map(location=seoulCenter, zoom_start=13)\r
      cluster3 = MarkerCluster().add_to(m3)\r
\r
      stores = [\r
          {"name": "강남점", "loc": [37.4979, 127.0276]},\r
          {"name": "홍대점", "loc": [37.5563, 126.9236]},\r
          {"name": "명동점", "loc": [37.5636, 126.9869]},\r
          {"name": "시청점", "loc": [37.5665, 126.9780]},\r
          {"name": "여의도점", "loc": [37.5219, 126.9245]},\r
          {"name": "잠실점", "loc": [37.5133, 127.1001]}\r
      ]\r
\r
      for store in stores:\r
          folium.Marker(\r
              location=store["loc"],\r
              popup=f"<b>{store['name']}</b>",\r
              tooltip=store["name"]\r
          ).add_to(cluster3)\r
\r
      m3\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 팝업과 툴팁의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 4단계. 팝업과 툴팁 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step5_custom_icon\r
  title: 5단계. 커스텀 아이콘\r
  structuredPrimary: true\r
  subtitle: Icon 적용\r
  goal: 5단계. 커스텀 아이콘에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    클러스터 내 마커에 커스텀 아이콘을 적용합니다.\r
\r
    클러스터 아이콘(숫자 원)은 자동 생성되고, 개별 마커는 지정한 아이콘으로 표시됩니다.\r
  snippet: |-\r
    m4 = folium.Map(location=seoulCenter, zoom_start=12)\r
    cluster4 = MarkerCluster().add_to(m4)\r
\r
    cafes = [\r
        {"name": "스타벅스 강남", "loc": [37.4979, 127.0276]},\r
        {"name": "스타벅스 홍대", "loc": [37.5563, 126.9236]},\r
        {"name": "스타벅스 명동", "loc": [37.5636, 126.9869]},\r
        {"name": "스타벅스 시청", "loc": [37.5665, 126.9780]},\r
        {"name": "스타벅스 을지로", "loc": [37.5660, 126.9910]}\r
    ]\r
\r
    for cafe in cafes:\r
        folium.Marker(\r
            location=cafe["loc"],\r
            popup=cafe["name"],\r
            icon=folium.Icon(color="green", icon="cloud")\r
        ).add_to(cluster4)\r
\r
    m4\r
  exercise:\r
    prompt: 5단계. 커스텀 아이콘 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      m4 = folium.Map(location=seoulCenter, zoom_start=12)\r
      cluster4 = MarkerCluster().add_to(m4)\r
\r
      cafes = [\r
          {"name": "스타벅스 강남", "loc": [37.4979, 127.0276]},\r
          {"name": "스타벅스 홍대", "loc": [37.5563, 126.9236]},\r
          {"name": "스타벅스 명동", "loc": [37.5636, 126.9869]},\r
          {"name": "스타벅스 시청", "loc": [37.5665, 126.9780]},\r
          {"name": "스타벅스 을지로", "loc": [37.5660, 126.9910]}\r
      ]\r
\r
      for cafe in cafes:\r
          folium.Marker(\r
              location=cafe["loc"],\r
              popup=cafe["name"],\r
              icon=folium.Icon(color="green", icon="cloud")\r
          ).add_to(cluster4)\r
\r
      m4\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 커스텀 아이콘의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 5단계. 커스텀 아이콘 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step6_multiple_clusters\r
  title: 6단계. 여러 클러스터\r
  structuredPrimary: true\r
  subtitle: 카테고리별 분류\r
  goal: 6단계. 여러 클러스터에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    카테고리별로 별도의 클러스터를 만들어 분류합니다.\r
\r
    LayerControl로 카테고리별 클러스터를 켜고 끌 수 있습니다.\r
  snippet: |-\r
    m5 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
    cafeCluster = MarkerCluster(name="카페").add_to(m5)\r
    restaurantCluster = MarkerCluster(name="음식점").add_to(m5)\r
\r
    cafeLocations = [\r
        [37.5665, 126.9780],\r
        [37.5670, 126.9790],\r
        [37.5660, 126.9770],\r
        [37.5700, 126.9750]\r
    ]\r
\r
    restaurantLocations = [\r
        [37.5600, 126.9850],\r
        [37.5610, 126.9860],\r
        [37.5590, 126.9840],\r
        [37.5620, 126.9870]\r
    ]\r
\r
    for loc in cafeLocations:\r
        folium.Marker(\r
            location=loc,\r
            icon=folium.Icon(color="cadetblue", icon="cloud")\r
        ).add_to(cafeCluster)\r
\r
    for loc in restaurantLocations:\r
        folium.Marker(\r
            location=loc,\r
            icon=folium.Icon(color="red", icon="cutlery")\r
        ).add_to(restaurantCluster)\r
\r
    folium.LayerControl().add_to(m5)\r
\r
    m5\r
  exercise:\r
    prompt: 6단계. 여러 클러스터 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      m5 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
      cafeCluster = MarkerCluster(name="카페").add_to(m5)\r
      restaurantCluster = MarkerCluster(name="음식점").add_to(m5)\r
\r
      cafeLocations = [\r
          [37.5665, 126.9780],\r
          [37.5670, 126.9790],\r
          [37.5660, 126.9770],\r
          [37.5700, 126.9750]\r
      ]\r
\r
      restaurantLocations = [\r
          [37.5600, 126.9850],\r
          [37.5610, 126.9860],\r
          [37.5590, 126.9840],\r
          [37.5620, 126.9870]\r
      ]\r
\r
      for loc in cafeLocations:\r
          folium.Marker(\r
              location=loc,\r
              icon=folium.Icon(color="cadetblue", icon="cloud")\r
          ).add_to(cafeCluster)\r
\r
      for loc in restaurantLocations:\r
          folium.Marker(\r
              location=loc,\r
              icon=folium.Icon(color="red", icon="cutlery")\r
          ).add_to(restaurantCluster)\r
\r
      folium.LayerControl().add_to(m5)\r
\r
      m5\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 여러 클러스터의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 6단계. 여러 클러스터 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step7_cluster_options\r
  title: 7단계. 클러스터 옵션\r
  structuredPrimary: true\r
  subtitle: 동작 설정\r
  goal: 7단계. 클러스터 옵션에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    MarkerCluster에 다양한 옵션을 설정할 수 있습니다.\r
\r
    maxClusterRadius는 클러스터 반경(픽셀), disableClusteringAtZoom은 클러스터링 해제 줌 레벨입니다.\r
  snippet: |-\r
    import random\r
\r
    m6 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
    optionCluster = MarkerCluster(\r
        options={\r
            "maxClusterRadius": 50,\r
            "disableClusteringAtZoom": 15,\r
            "spiderfyOnMaxZoom": True\r
        }\r
    ).add_to(m6)\r
\r
    for _ in range(50):\r
        lat = 37.55 + random.uniform(-0.03, 0.03)\r
        lon = 126.98 + random.uniform(-0.03, 0.03)\r
        folium.Marker([lat, lon]).add_to(optionCluster)\r
\r
    m6\r
  exercise:\r
    prompt: 7단계. 클러스터 옵션 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import random\r
\r
      m6 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
      optionCluster = MarkerCluster(\r
          options={\r
              "maxClusterRadius": 50,\r
              "disableClusteringAtZoom": 15,\r
              "spiderfyOnMaxZoom": True\r
          }\r
      ).add_to(m6)\r
\r
      for _ in range(50):\r
          lat = 37.55 + random.uniform(-0.03, 0.03)\r
          lon = 126.98 + random.uniform(-0.03, 0.03)\r
          folium.Marker([lat, lon]).add_to(optionCluster)\r
\r
      m6\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 클러스터 옵션의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 7단계. 클러스터 옵션 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step8_show_coverage\r
  title: 8단계. 커버리지 표시\r
  structuredPrimary: true\r
  subtitle: 클러스터 범위\r
  goal: 8단계. 커버리지 표시에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    showCoverageOnHover 옵션으로 클러스터의 범위를 시각화합니다.\r
\r
    클러스터 위에 마우스를 올리면 포함된 마커들의 범위가 표시됩니다.\r
  snippet: |-\r
    import random\r
\r
    m7 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
    coverageCluster = MarkerCluster(\r
        options={\r
            "showCoverageOnHover": True\r
        }\r
    ).add_to(m7)\r
\r
    for _ in range(80):\r
        lat = 37.55 + random.uniform(-0.05, 0.05)\r
        lon = 126.98 + random.uniform(-0.05, 0.05)\r
        folium.Marker([lat, lon]).add_to(coverageCluster)\r
\r
    m7\r
  exercise:\r
    prompt: 8단계. 커버리지 표시 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import random\r
\r
      m7 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
      coverageCluster = MarkerCluster(\r
          options={\r
              "showCoverageOnHover": True\r
          }\r
      ).add_to(m7)\r
\r
      for _ in range(80):\r
          lat = 37.55 + random.uniform(-0.05, 0.05)\r
          lon = 126.98 + random.uniform(-0.05, 0.05)\r
          folium.Marker([lat, lon]).add_to(coverageCluster)\r
\r
      m7\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 커버리지 표시의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 8단계. 커버리지 표시 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step9_with_other_elements\r
  title: 9단계. 다른 요소와 조합\r
  structuredPrimary: true\r
  subtitle: 클러스터 + 도형\r
  goal: 9단계. 다른 요소와 조합에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    클러스터와 일반 마커, 도형을 함께 사용합니다.\r
\r
    중요한 위치는 일반 마커로, 대량의 위치는 클러스터로 표시합니다.\r
  snippet: |-\r
    import random\r
\r
    m8 = folium.Map(location=seoulCenter, zoom_start=12, tiles="CartoDB Positron")\r
\r
    hqLocation = [37.5665, 126.9780]\r
\r
    folium.Marker(\r
        location=hqLocation,\r
        popup="<b>본사</b>",\r
        icon=folium.Icon(color="red", icon="home")\r
    ).add_to(m8)\r
\r
    folium.Circle(\r
        location=hqLocation,\r
        radius=3000,\r
        color="red",\r
        fill=True,\r
        fill_opacity=0.1,\r
        popup="서비스 권역"\r
    ).add_to(m8)\r
\r
    branchCluster = MarkerCluster(name="지점").add_to(m8)\r
\r
    for _ in range(40):\r
        lat = 37.55 + random.uniform(-0.04, 0.04)\r
        lon = 126.98 + random.uniform(-0.04, 0.04)\r
        folium.Marker(\r
            [lat, lon],\r
            icon=folium.Icon(color="blue", icon="briefcase")\r
        ).add_to(branchCluster)\r
\r
    m8\r
  exercise:\r
    prompt: 9단계. 다른 요소와 조합 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import random\r
\r
      m8 = folium.Map(location=seoulCenter, zoom_start=12, tiles="CartoDB Positron")\r
\r
      hqLocation = [37.5665, 126.9780]\r
\r
      folium.Marker(\r
          location=hqLocation,\r
          popup="<b>본사</b>",\r
          icon=folium.Icon(color="red", icon="home")\r
      ).add_to(m8)\r
\r
      folium.Circle(\r
          location=hqLocation,\r
          radius=3000,\r
          color="red",\r
          fill=True,\r
          fill_opacity=0.1,\r
          popup="서비스 권역"\r
      ).add_to(m8)\r
\r
      branchCluster = MarkerCluster(name="지점").add_to(m8)\r
\r
      for _ in range(40):\r
          lat = 37.55 + random.uniform(-0.04, 0.04)\r
          lon = 126.98 + random.uniform(-0.04, 0.04)\r
          folium.Marker(\r
              [lat, lon],\r
              icon=folium.Icon(color="blue", icon="briefcase")\r
          ).add_to(branchCluster)\r
\r
      m8\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 다른 요소와 조합의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 다른 요소와 조합 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_complete\r
  title: 10단계. 완성 예제\r
  structuredPrimary: true\r
  subtitle: 전국 매장 지도\r
  goal: 10단계. 완성 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 전국 매장 위치를 클러스터로 표시하는 완성 예제입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import random\r
\r
    storeMap = folium.Map(\r
        location=[36.5, 127.5],\r
        zoom_start=7,\r
        tiles="CartoDB Positron"\r
    )\r
\r
    storeCluster = MarkerCluster(\r
        name="전국 매장",\r
        options={\r
            "maxClusterRadius": 80,\r
            "showCoverageOnHover": True,\r
            "spiderfyOnMaxZoom": True\r
        }\r
    ).add_to(storeMap)\r
\r
    regions = [\r
        {"name": "서울", "center": [37.5665, 126.9780], "count": 50},\r
        {"name": "부산", "center": [35.1796, 129.0756], "count": 30},\r
        {"name": "대전", "center": [36.3504, 127.3845], "count": 20},\r
        {"name": "대구", "center": [35.8714, 128.6014], "count": 25},\r
        {"name": "광주", "center": [35.1595, 126.8526], "count": 15},\r
        {"name": "제주", "center": [33.4996, 126.5312], "count": 10}\r
    ]\r
\r
    for region in regions:\r
        for i in range(region["count"]):\r
            lat = region["center"][0] + random.uniform(-0.05, 0.05)\r
            lon = region["center"][1] + random.uniform(-0.05, 0.05)\r
            folium.Marker(\r
                location=[lat, lon],\r
                popup=f"{region['name']} {i+1}호점",\r
                tooltip=f"{region['name']} 매장",\r
                icon=folium.Icon(color="green", icon="shopping-cart")\r
            ).add_to(storeCluster)\r
\r
    for region in regions:\r
        folium.CircleMarker(\r
            location=region["center"],\r
            radius=8,\r
            color="darkblue",\r
            fill=True,\r
            fill_color="blue",\r
            popup=f"<b>{region['name']}</b><br>매장 수: {region['count']}"\r
        ).add_to(storeMap)\r
\r
    folium.LayerControl().add_to(storeMap)\r
\r
    storeMap\r
  exercise:\r
    prompt: 10단계. 완성 예제 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import random\r
\r
      storeMap = folium.Map(\r
          location=[36.5, 127.5],\r
          zoom_start=7,\r
          tiles="CartoDB Positron"\r
      )\r
\r
      storeCluster = MarkerCluster(\r
          name="전국 매장",\r
          options={\r
              "maxClusterRadius": 80,\r
              "showCoverageOnHover": True,\r
              "spiderfyOnMaxZoom": True\r
          }\r
      ).add_to(storeMap)\r
\r
      regions = [\r
          {"name": "서울", "center": [37.5665, 126.9780], "count": 50},\r
          {"name": "부산", "center": [35.1796, 129.0756], "count": 30},\r
          {"name": "대전", "center": [36.3504, 127.3845], "count": 20},\r
          {"name": "대구", "center": [35.8714, 128.6014], "count": 25},\r
          {"name": "광주", "center": [35.1595, 126.8526], "count": 15},\r
          {"name": "제주", "center": [33.4996, 126.5312], "count": 10}\r
      ]\r
\r
      for region in regions:\r
          for i in range(region["count"]):\r
              lat = region["center"][0] + random.uniform(-0.05, 0.05)\r
              lon = region["center"][1] + random.uniform(-0.05, 0.05)\r
              folium.Marker(\r
                  location=[lat, lon],\r
                  popup=f"{region['name']} {i+1}호점",\r
                  tooltip=f"{region['name']} 매장",\r
                  icon=folium.Icon(color="green", icon="shopping-cart")\r
              ).add_to(storeCluster)\r
\r
      for region in regions:\r
          folium.CircleMarker(\r
              location=region["center"],\r
              radius=8,\r
              color="darkblue",\r
              fill=True,\r
              fill_color="blue",\r
              popup=f"<b>{region['name']}</b><br>매장 수: {region['count']}"\r
          ).add_to(storeMap)\r
\r
      folium.LayerControl().add_to(storeMap)\r
\r
      storeMap\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 완성 예제의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 완성 예제 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step11_workflow\r
  title: 11단계. 실무 클러스터 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → 분류 오류 확인 → 렌더 검증 → 임계값 실험\r
  goal: 11단계. 실무 클러스터 검증에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    마커 클러스터는 대량 위치를 빠르게 보여주지만, 데이터 분류가 틀리면 숫자가 그럴듯해도 업무 판단은 틀립니다. 클러스터에 넣기 전에 좌표와 카테고리를 검증하고, 렌더된 HTML에 지점명과 레이어 이름이 들어갔는지 확인해야 합니다.\r
\r
    클러스터 지도는 마커 수를 줄이는 기술이 아니라 대량 위치 데이터를 운영 단위로 묶는 방법입니다. 좌표, 카테고리, 레이어, 렌더 결과를 검증해야 숫자를 믿고 업무 판단을 내릴 수 있습니다.\r
  tips:\r
  - 클러스터 지도는 마커 수를 줄이는 기술이 아니라 대량 위치 데이터를 운영 단위로 묶는 방법입니다. 좌표, 카테고리, 레이어, 렌더 결과를 검증해야 숫자를 믿고 업무 판단을 내릴\r
    수 있습니다.\r
  snippet: |-\r
    fieldTickets = [\r
        {"id": "T-101", "name": "강남 설치", "loc": [37.4979, 127.0276], "category": "install", "priority": "high"},\r
        {"id": "T-102", "name": "역삼 설치", "loc": [37.5005, 127.0360], "category": "install", "priority": "medium"},\r
        {"id": "T-103", "name": "성수 장애", "loc": [37.5446, 127.0557], "category": "incident", "priority": "high"},\r
        {"id": "T-104", "name": "마포 방문", "loc": [37.5663, 126.9019], "category": "visit", "priority": "low"},\r
        {"id": "T-105", "name": "여의도 장애", "loc": [37.5219, 126.9245], "category": "incident", "priority": "medium"},\r
        {"id": "T-106", "name": "종로 방문", "loc": [37.5796, 126.9770], "category": "visit", "priority": "medium"},\r
    ]\r
\r
    clusterStyle = {\r
        "install": {"layerName": "설치", "color": "blue", "icon": "wrench"},\r
        "incident": {"layerName": "장애", "color": "red", "icon": "exclamation-sign"},\r
        "visit": {"layerName": "방문", "color": "green", "icon": "user"},\r
    }\r
\r
    ticketCountByCategory = {}\r
    for ticket in fieldTickets:\r
        ticketCountByCategory[ticket["category"]] = ticketCountByCategory.get(ticket["category"], 0) + 1\r
\r
    busiestCategory = max(ticketCountByCategory, key=ticketCountByCategory.get)\r
    busiestCategory, ticketCountByCategory\r
  exercise:\r
    prompt: 11단계. 실무 클러스터 검증 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      fieldTickets = [\r
          {"id": "T-101", "name": "강남 설치", "loc": [37.4979, 127.0276], "category": "install", "priority": "high"},\r
          {"id": "T-102", "name": "역삼 설치", "loc": [37.5005, 127.0360], "category": "install", "priority": "medium"},\r
          {"id": "T-103", "name": "성수 장애", "loc": [37.5446, 127.0557], "category": "incident", "priority": "high"},\r
          {"id": "T-104", "name": "마포 방문", "loc": [37.5663, 126.9019], "category": "visit", "priority": "low"},\r
          {"id": "T-105", "name": "여의도 장애", "loc": [37.5219, 126.9245], "category": "incident", "priority": "medium"},\r
          {"id": "T-106", "name": "종로 방문", "loc": [37.5796, 126.9770], "category": "visit", "priority": "medium"},\r
      ]\r
\r
      clusterStyle = {\r
          "install": {"layerName": "설치", "color": "blue", "icon": "wrench"},\r
          "incident": {"layerName": "장애", "color": "red", "icon": "exclamation-sign"},\r
          "visit": {"layerName": "방문", "color": "green", "icon": "user"},\r
      }\r
\r
      ticketCountByCategory = {}\r
      for ticket in fieldTickets:\r
          ticketCountByCategory[ticket["category"]] = ticketCountByCategory.get(ticket["category"], 0) + 1\r
\r
      busiestCategory = max(ticketCountByCategory, key=ticketCountByCategory.get)\r
      busiestCategory, ticketCountByCategory\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 실무 클러스터 검증의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 11단계. 실무 클러스터 검증 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 마커 클러스터\r
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 지금까지 배운 내용을 활용하여 미션을 수행해봅시다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import folium\r
    from folium.plugins import MarkerCluster\r
    import random\r
    convenienceStores = []\r
    for _ in range(100):\r
        lat = 37.55 + random.uniform(-0.05, 0.05)\r
        lon = 126.98 + random.uniform(-0.05, 0.05)\r
        brand = random.choice(["CU", "GS25", "세븐일레븐"])\r
        convenienceStores.append({"loc": [lat, lon], "brand": brand})\r
\r
    len(convenienceStores)\r
  exercise:\r
    prompt: 실습 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import folium\r
      from folium.plugins import MarkerCluster\r
      import random\r
      convenienceStores = []\r
      for _ in range(100):\r
          lat = 37.55 + random.uniform(-0.05, 0.05)\r
          lon = 126.98 + random.uniform(-0.05, 0.05)\r
          brand = random.choice(["CU", "GS25", "세븐일레븐"])\r
          convenienceStores.append({"loc": [lat, lon], "brand": brand})\r
\r
      len(convenienceStores)\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
`;export{e as default};