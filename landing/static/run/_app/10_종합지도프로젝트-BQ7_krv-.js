var e=`meta:\r
  packages:\r
  - branca\r
  - folium\r
  id: folium_10\r
  title: 종합 지도 프로젝트\r
  order: 10\r
  category: folium\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - folium\r
  - 종합\r
  - 프로젝트\r
  - 인터랙티브\r
  - 대시보드\r
  seo:\r
    title: Folium 종합 프로젝트 - 서울 관광 지도\r
    description: Folium의 모든 기능을 종합한 인터랙티브 지도를 만듭니다. 마커, 히트맵, 클러스터, GeoJSON을 조합합니다.\r
    keywords:\r
    - folium\r
    - 종합\r
    - 프로젝트\r
    - 인터랙티브\r
    - 관광지도\r
intro:\r
  emoji: 🏆\r
  goal: 모든 기능을 종합한 인터랙티브 지도를 제작합니다.\r
  description: 지금까지 배운 모든 내용을 활용합니다. 마커, 클러스터, 히트맵, GeoJSON, 레이어 컨트롤을 조합하여 완성도 높은 지도를 만듭니다. 서울 관광 종합 지도를\r
    예제로 구현합니다.\r
  direction: 종합 지도 프로젝트에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.\r
  benefits:\r
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.\r
  - 종합 지도 프로젝트 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 베이스 맵 설정 처리 실행\r
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 주요 랜드마크 결과 검증\r
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.\r
    - label: 종합 지도 프로젝트 재사용\r
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 지도 시각화 환경\r
      detail: branca, folium 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 종합 지도 프로젝트 실행\r
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.\r
    - label: 종합 지도 프로젝트 완료\r
      detail: 검증된 코드를 위치 기반 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: 모든 플러그인 import\r
  goal: 1단계. 라이브러리 불러오기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: 필요한 모든 라이브러리와 플러그인을 불러옵니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import folium\r
    from folium.plugins import HeatMap, MarkerCluster\r
    import branca.colormap as cm\r
    import random\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import folium\r
      from folium.plugins import HeatMap, MarkerCluster\r
      import branca.colormap as cm\r
      import random\r
    hints:\r
    - 바꿀 지점은 위도/경도 데이터을 만드는 첫 줄과 지도 레이어 구성 줄에서 찾으세요.\r
    - 실행 뒤 마커와 저장 HTML 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 마커와 저장 HTML 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step2_base_map\r
  title: 2단계. 베이스 맵 설정\r
  structuredPrimary: true\r
  subtitle: 기본 지도\r
  goal: 2단계. 베이스 맵 설정에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    다중 타일 레이어를 지원하는 베이스 맵을 만듭니다.\r
\r
    여러 타일을 추가하면 LayerControl에서 전환할 수 있습니다.\r
  snippet: |-\r
    seoulCenter = [37.5665, 126.9780]\r
\r
    tourMap = folium.Map(\r
        location=seoulCenter,\r
        zoom_start=12,\r
        tiles=None\r
    )\r
\r
    folium.TileLayer(\r
        "CartoDB Positron",\r
        name="밝은 지도"\r
    ).add_to(tourMap)\r
\r
    folium.TileLayer(\r
        "CartoDB Dark_Matter",\r
        name="어두운 지도"\r
    ).add_to(tourMap)\r
\r
    folium.TileLayer(\r
        "OpenStreetMap",\r
        name="상세 지도"\r
    ).add_to(tourMap)\r
\r
    tourMap\r
  exercise:\r
    prompt: 2단계. 베이스 맵 설정 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      seoulCenter = [37.5665, 126.9780]\r
\r
      tourMap = folium.Map(\r
          location=seoulCenter,\r
          zoom_start=12,\r
          tiles=None\r
      )\r
\r
      folium.TileLayer(\r
          "CartoDB Positron",\r
          name="밝은 지도"\r
      ).add_to(tourMap)\r
\r
      folium.TileLayer(\r
          "CartoDB Dark_Matter",\r
          name="어두운 지도"\r
      ).add_to(tourMap)\r
\r
      folium.TileLayer(\r
          "OpenStreetMap",\r
          name="상세 지도"\r
      ).add_to(tourMap)\r
\r
      tourMap\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 베이스 맵 설정에서 \`seoulCenter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 베이스 맵 설정 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_landmark_markers\r
  title: 3단계. 주요 랜드마크\r
  structuredPrimary: true\r
  subtitle: 개별 마커\r
  goal: 3단계. 주요 랜드마크에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    주요 랜드마크는 개별 마커로 강조합니다.\r
\r
    중요한 위치는 개별 마커로 표시하여 클러스터에 묻히지 않게 합니다.\r
  snippet: |-\r
    landmarks = [\r
        {"name": "경복궁", "loc": [37.5796, 126.9770], "desc": "조선 왕궁", "icon": "tower"},\r
        {"name": "남산타워", "loc": [37.5512, 126.9882], "desc": "서울 랜드마크", "icon": "signal"},\r
        {"name": "광화문", "loc": [37.5760, 126.9769], "desc": "조선 정문", "icon": "flag"},\r
        {"name": "동대문DDP", "loc": [37.5673, 127.0095], "desc": "디자인플라자", "icon": "th-large"}\r
    ]\r
    landmarks\r
  exercise:\r
    prompt: 3단계. 주요 랜드마크 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      landmarks = [\r
          {"name": "경복궁", "loc": [37.5796, 126.9770], "desc": "조선 왕궁", "icon": "tower"},\r
          {"name": "남산타워", "loc": [37.5512, 126.9882], "desc": "서울 랜드마크", "icon": "signal"},\r
          {"name": "광화문", "loc": [37.5760, 126.9769], "desc": "조선 정문", "icon": "flag"},\r
          {"name": "동대문DDP", "loc": [37.5673, 127.0095], "desc": "디자인플라자", "icon": "th-large"}\r
      ]\r
      landmarks\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 주요 랜드마크에서 \`landmarks\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 주요 랜드마크 실행 뒤 \`landmarks\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step4_cafe_cluster\r
  title: 4단계. 카페 클러스터\r
  structuredPrimary: true\r
  subtitle: MarkerCluster\r
  goal: 4단계. 카페 클러스터에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    카페 위치를 클러스터로 표시합니다. 대량 데이터를 효율적으로 관리합니다.\r
\r
    60개 카페가 클러스터로 깔끔하게 표시됩니다.\r
  snippet: |-\r
    cafeCluster = MarkerCluster(name="카페")\r
\r
    cafeAreas = [\r
        [37.5796, 126.9770],\r
        [37.5636, 126.9869],\r
        [37.5563, 126.9236],\r
        [37.4979, 127.0276]\r
    ]\r
\r
    for area in cafeAreas:\r
        for i in range(15):\r
            lat = area[0] + random.uniform(-0.008, 0.008)\r
            lon = area[1] + random.uniform(-0.008, 0.008)\r
            folium.Marker(\r
                location=[lat, lon],\r
                popup=f"카페 {i+1}",\r
                icon=folium.Icon(color="cadetblue", icon="cloud")\r
            ).add_to(cafeCluster)\r
\r
    cafeCluster.add_to(tourMap)\r
\r
    tourMap\r
  exercise:\r
    prompt: 4단계. 카페 클러스터 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      cafeCluster = MarkerCluster(name="카페")\r
\r
      cafeAreas = [\r
          [37.5796, 126.9770],\r
          [37.5636, 126.9869],\r
          [37.5563, 126.9236],\r
          [37.4979, 127.0276]\r
      ]\r
\r
      for area in cafeAreas:\r
          for i in range(15):\r
              lat = area[0] + random.uniform(-0.008, 0.008)\r
              lon = area[1] + random.uniform(-0.008, 0.008)\r
              folium.Marker(\r
                  location=[lat, lon],\r
                  popup=f"카페 {i+1}",\r
                  icon=folium.Icon(color="cadetblue", icon="cloud")\r
              ).add_to(cafeCluster)\r
\r
      cafeCluster.add_to(tourMap)\r
\r
      tourMap\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 카페 클러스터의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 4단계. 카페 클러스터 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step5_restaurant_cluster\r
  title: 5단계. 음식점 클러스터\r
  structuredPrimary: true\r
  subtitle: 별도 클러스터\r
  goal: 5단계. 음식점 클러스터에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    음식점용 별도 클러스터를 만들어 카테고리를 분리합니다.\r
\r
    show=False로 기본 숨김 상태입니다. LayerControl에서 켤 수 있습니다.\r
  snippet: |-\r
    restaurantCluster = MarkerCluster(name="음식점", show=False)\r
\r
    restaurantAreas = [\r
        [37.5636, 126.9869],\r
        [37.5701, 126.9995],\r
        [37.5660, 126.9910]\r
    ]\r
\r
    for area in restaurantAreas:\r
        for i in range(20):\r
            lat = area[0] + random.uniform(-0.006, 0.006)\r
            lon = area[1] + random.uniform(-0.006, 0.006)\r
            folium.Marker(\r
                location=[lat, lon],\r
                popup=f"맛집 {i+1}",\r
                icon=folium.Icon(color="orange", icon="cutlery")\r
            ).add_to(restaurantCluster)\r
\r
    restaurantCluster.add_to(tourMap)\r
\r
    tourMap\r
  exercise:\r
    prompt: 5단계. 음식점 클러스터 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      restaurantCluster = MarkerCluster(name="음식점", show=False)\r
\r
      restaurantAreas = [\r
          [37.5636, 126.9869],\r
          [37.5701, 126.9995],\r
          [37.5660, 126.9910]\r
      ]\r
\r
      for area in restaurantAreas:\r
          for i in range(20):\r
              lat = area[0] + random.uniform(-0.006, 0.006)\r
              lon = area[1] + random.uniform(-0.006, 0.006)\r
              folium.Marker(\r
                  location=[lat, lon],\r
                  popup=f"맛집 {i+1}",\r
                  icon=folium.Icon(color="orange", icon="cutlery")\r
              ).add_to(restaurantCluster)\r
\r
      restaurantCluster.add_to(tourMap)\r
\r
      tourMap\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 음식점 클러스터의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 5단계. 음식점 클러스터 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step6_heatmap\r
  title: 6단계. 관광객 밀도 히트맵\r
  structuredPrimary: true\r
  subtitle: HeatMap\r
  goal: 6단계. 관광객 밀도 히트맵에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    관광객 밀도를 히트맵으로 시각화합니다.\r
\r
    히트맵도 FeatureGroup에 넣으면 레이어 컨트롤로 제어됩니다.\r
  snippet: |-\r
    densityGroup = folium.FeatureGroup(name="관광객 밀도", show=False)\r
\r
    densityData = []\r
\r
    hotspots = [\r
        {"loc": [37.5796, 126.9770], "weight": 1.0},\r
        {"loc": [37.5636, 126.9869], "weight": 0.9},\r
        {"loc": [37.5512, 126.9882], "weight": 0.8},\r
        {"loc": [37.5563, 126.9236], "weight": 0.7}\r
    ]\r
\r
    for hs in hotspots:\r
        for _ in range(50):\r
            lat = hs["loc"][0] + random.uniform(-0.01, 0.01)\r
            lon = hs["loc"][1] + random.uniform(-0.01, 0.01)\r
            densityData.append([lat, lon, hs["weight"]])\r
\r
    HeatMap(\r
        densityData,\r
        radius=20,\r
        blur=15,\r
        gradient={0.4: "blue", 0.6: "lime", 0.8: "yellow", 1: "red"}\r
    ).add_to(densityGroup)\r
\r
    densityGroup.add_to(tourMap)\r
\r
    tourMap\r
  exercise:\r
    prompt: 6단계. 관광객 밀도 히트맵 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      densityGroup = folium.FeatureGroup(name="관광객 밀도", show=False)\r
\r
      densityData = []\r
\r
      hotspots = [\r
          {"loc": [37.5796, 126.9770], "weight": 1.0},\r
          {"loc": [37.5636, 126.9869], "weight": 0.9},\r
          {"loc": [37.5512, 126.9882], "weight": 0.8},\r
          {"loc": [37.5563, 126.9236], "weight": 0.7}\r
      ]\r
\r
      for hs in hotspots:\r
          for _ in range(50):\r
              lat = hs["loc"][0] + random.uniform(-0.01, 0.01)\r
              lon = hs["loc"][1] + random.uniform(-0.01, 0.01)\r
              densityData.append([lat, lon, hs["weight"]])\r
\r
      HeatMap(\r
          densityData,\r
          radius=20,\r
          blur=15,\r
          gradient={0.4: "blue", 0.6: "lime", 0.8: "yellow", 1: "red"}\r
      ).add_to(densityGroup)\r
\r
      densityGroup.add_to(tourMap)\r
\r
      tourMap\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 관광객 밀도 히트맵의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 6단계. 관광객 밀도 히트맵 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step7_gu_boundaries\r
  title: 7단계. 구 경계 GeoJSON\r
  structuredPrimary: true\r
  subtitle: 행정구역\r
  goal: 7단계. 구 경계 GeoJSON에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    서울의 주요 구 경계를 GeoJSON으로 표시합니다.\r
\r
    컬러맵 범례가 우측 하단에 표시됩니다.\r
  snippet: |-\r
    guBoundaries = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "종로구", "visitors": 85000},\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.96, 37.57], [127.00, 37.57],\r
                        [127.00, 37.60], [126.96, 37.60], [126.96, 37.57]\r
                    ]]\r
                }\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "중구", "visitors": 120000},\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.96, 37.54], [127.00, 37.54],\r
                        [127.00, 37.57], [126.96, 37.57], [126.96, 37.54]\r
                    ]]\r
                }\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "용산구", "visitors": 65000},\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.96, 37.51], [127.00, 37.51],\r
                        [127.00, 37.54], [126.96, 37.54], [126.96, 37.51]\r
                    ]]\r
                }\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "마포구", "visitors": 75000},\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.90, 37.54], [126.96, 37.54],\r
                        [126.96, 37.57], [126.90, 37.57], [126.90, 37.54]\r
                    ]]\r
                }\r
            }\r
        ]\r
    }\r
    guBoundaries\r
  exercise:\r
    prompt: 7단계. 구 경계 GeoJSON 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      guBoundaries = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "종로구", "visitors": 85000},\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.96, 37.57], [127.00, 37.57],\r
                          [127.00, 37.60], [126.96, 37.60], [126.96, 37.57]\r
                      ]]\r
                  }\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "중구", "visitors": 120000},\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.96, 37.54], [127.00, 37.54],\r
                          [127.00, 37.57], [126.96, 37.57], [126.96, 37.54]\r
                      ]]\r
                  }\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "용산구", "visitors": 65000},\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.96, 37.51], [127.00, 37.51],\r
                          [127.00, 37.54], [126.96, 37.54], [126.96, 37.51]\r
                      ]]\r
                  }\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "마포구", "visitors": 75000},\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.90, 37.54], [126.96, 37.54],\r
                          [126.96, 37.57], [126.90, 37.57], [126.90, 37.54]\r
                      ]]\r
                  }\r
              }\r
          ]\r
      }\r
      guBoundaries\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 구 경계 GeoJSON에서 \`guBoundaries\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 구 경계 GeoJSON 실행 뒤 \`guBoundaries\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step8_routes\r
  title: 8단계. 관광 코스\r
  structuredPrimary: true\r
  subtitle: PolyLine\r
  goal: 8단계. 관광 코스에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    추천 관광 코스를 경로로 표시합니다.\r
\r
    실선과 점선으로 코스를 구분합니다.\r
  snippet: |-\r
    routeGroup = folium.FeatureGroup(name="추천 코스", show=False)\r
\r
    palaceRoute = [\r
        [37.5796, 126.9770],\r
        [37.5794, 126.9910],\r
        [37.5826, 126.9831],\r
        [37.5760, 126.9769]\r
    ]\r
\r
    folium.PolyLine(\r
        locations=palaceRoute,\r
        color="purple",\r
        weight=5,\r
        opacity=0.8,\r
        popup="궁궐 투어 (2시간)"\r
    ).add_to(routeGroup)\r
\r
    shoppingRoute = [\r
        [37.5636, 126.9869],\r
        [37.5673, 127.0095],\r
        [37.5701, 126.9995]\r
    ]\r
\r
    folium.PolyLine(\r
        locations=shoppingRoute,\r
        color="pink",\r
        weight=5,\r
        opacity=0.8,\r
        dash_array="10",\r
        popup="쇼핑 투어 (3시간)"\r
    ).add_to(routeGroup)\r
\r
    routeGroup.add_to(tourMap)\r
\r
    tourMap\r
  exercise:\r
    prompt: 8단계. 관광 코스 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      routeGroup = folium.FeatureGroup(name="추천 코스", show=False)\r
\r
      palaceRoute = [\r
          [37.5796, 126.9770],\r
          [37.5794, 126.9910],\r
          [37.5826, 126.9831],\r
          [37.5760, 126.9769]\r
      ]\r
\r
      folium.PolyLine(\r
          locations=palaceRoute,\r
          color="purple",\r
          weight=5,\r
          opacity=0.8,\r
          popup="궁궐 투어 (2시간)"\r
      ).add_to(routeGroup)\r
\r
      shoppingRoute = [\r
          [37.5636, 126.9869],\r
          [37.5673, 127.0095],\r
          [37.5701, 126.9995]\r
      ]\r
\r
      folium.PolyLine(\r
          locations=shoppingRoute,\r
          color="pink",\r
          weight=5,\r
          opacity=0.8,\r
          dash_array="10",\r
          popup="쇼핑 투어 (3시간)"\r
      ).add_to(routeGroup)\r
\r
      routeGroup.add_to(tourMap)\r
\r
      tourMap\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 관광 코스에서 \`routeGroup\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 관광 코스 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_layer_control\r
  title: 9단계. 레이어 컨트롤\r
  structuredPrimary: true\r
  subtitle: LayerControl\r
  goal: 9단계. 레이어 컨트롤에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 지도 시각화는 위치가 중요한 데이터를 실제 공간 맥락으로 검토하게 해줍니다.\r
  explanation: |-\r
    LayerControl을 추가하여 모든 레이어를 제어합니다.\r
\r
    collapsed=False로 항상 펼쳐진 상태로 표시됩니다.\r
  snippet: |-\r
    folium.LayerControl(collapsed=False).add_to(tourMap)\r
\r
    tourMap\r
  exercise:\r
    prompt: 9단계. 레이어 컨트롤 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: |-\r
      folium.LayerControl(collapsed=False).add_to(tourMap)\r
\r
      tourMap\r
    hints:\r
    - 바꿀 지점은 위도/경도 데이터을 만드는 첫 줄과 지도 레이어 구성 줄에서 찾으세요.\r
    - 실행 뒤 마커와 저장 HTML 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 레이어 컨트롤의 수정 코드가 지도 레이어 구성 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 9단계. 레이어 컨트롤 실행 결과가 마커와 저장 HTML 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step10_complete\r
  title: 10단계. 완성 코드\r
  structuredPrimary: true\r
  subtitle: 전체 종합\r
  goal: 10단계. 완성 코드에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 지금까지 작성한 모든 코드를 하나로 합친 완성 버전입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import folium\r
    from folium.plugins import HeatMap, MarkerCluster\r
    import branca.colormap as cm\r
    import random\r
    seoulCenter = [37.5665, 126.9780]\r
    finalMap = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)\r
\r
    folium.TileLayer("CartoDB Positron", name="밝은 지도").add_to(finalMap)\r
    folium.TileLayer("CartoDB Dark_Matter", name="어두운 지도").add_to(finalMap)\r
\r
    landmarks = [\r
        {"name": "경복궁", "loc": [37.5796, 126.9770], "icon": "tower"},\r
        {"name": "남산타워", "loc": [37.5512, 126.9882], "icon": "signal"},\r
        {"name": "광화문", "loc": [37.5760, 126.9769], "icon": "flag"},\r
        {"name": "동대문DDP", "loc": [37.5673, 127.0095], "icon": "th-large"}\r
    ]\r
\r
    lmGroup = folium.FeatureGroup(name="랜드마크")\r
    for lm in landmarks:\r
        folium.Marker(\r
            location=lm["loc"],\r
            popup=f"<b>{lm['name']}</b>",\r
            tooltip=lm["name"],\r
            icon=folium.Icon(color="red", icon=lm["icon"])\r
        ).add_to(lmGroup)\r
    lmGroup.add_to(finalMap)\r
\r
    cafeCluster = MarkerCluster(name="카페")\r
    cafeAreas = [[37.5796, 126.9770], [37.5636, 126.9869], [37.5563, 126.9236]]\r
    for area in cafeAreas:\r
        for i in range(10):\r
            lat = area[0] + random.uniform(-0.006, 0.006)\r
            lon = area[1] + random.uniform(-0.006, 0.006)\r
            folium.Marker(\r
                [lat, lon],\r
                popup=f"카페",\r
                icon=folium.Icon(color="cadetblue", icon="cloud")\r
            ).add_to(cafeCluster)\r
    cafeCluster.add_to(finalMap)\r
\r
    densityGroup = folium.FeatureGroup(name="관광객 밀도", show=False)\r
    densityData = []\r
    for area in cafeAreas:\r
        for _ in range(30):\r
            lat = area[0] + random.uniform(-0.01, 0.01)\r
            lon = area[1] + random.uniform(-0.01, 0.01)\r
            densityData.append([lat, lon, 0.8])\r
    HeatMap(densityData, radius=20, blur=15).add_to(densityGroup)\r
    densityGroup.add_to(finalMap)\r
\r
    guGeo = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "종로구", "score": 90},\r
                "geometry": {"type": "Polygon", "coordinates": [[\r
                    [126.96, 37.57], [127.00, 37.57],\r
                    [127.00, 37.60], [126.96, 37.60], [126.96, 37.57]\r
                ]]}\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "중구", "score": 85},\r
                "geometry": {"type": "Polygon", "coordinates": [[\r
                    [126.96, 37.54], [127.00, 37.54],\r
                    [127.00, 37.57], [126.96, 37.57], [126.96, 37.54]\r
                ]]}\r
            }\r
        ]\r
    }\r
\r
    guGroup = folium.FeatureGroup(name="구 경계", show=False)\r
    scoreColormap = cm.LinearColormap(\r
        ["#fee8c8", "#e74c3c"],\r
        vmin=70, vmax=100,\r
        caption="관광 만족도"\r
    )\r
    folium.GeoJson(\r
        guGeo,\r
        style_function=lambda f: {\r
            "fillColor": scoreColormap(f["properties"]["score"]),\r
            "color": "white", "weight": 2, "fillOpacity": 0.5\r
        },\r
        tooltip=folium.GeoJsonTooltip(fields=["name", "score"])\r
    ).add_to(guGroup)\r
    guGroup.add_to(finalMap)\r
    scoreColormap.add_to(finalMap)\r
\r
    routeGroup = folium.FeatureGroup(name="추천 코스", show=False)\r
    folium.PolyLine(\r
        [[37.5796, 126.9770], [37.5760, 126.9769], [37.5636, 126.9869]],\r
        color="purple", weight=4, popup="궁궐-명동 코스"\r
    ).add_to(routeGroup)\r
    routeGroup.add_to(finalMap)\r
\r
    folium.LayerControl(collapsed=False).add_to(finalMap)\r
\r
    finalMap\r
  exercise:\r
    prompt: 10단계. 완성 코드 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import folium\r
      from folium.plugins import HeatMap, MarkerCluster\r
      import branca.colormap as cm\r
      import random\r
      seoulCenter = [37.5665, 126.9780]\r
      finalMap = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)\r
\r
      folium.TileLayer("CartoDB Positron", name="밝은 지도").add_to(finalMap)\r
      folium.TileLayer("CartoDB Dark_Matter", name="어두운 지도").add_to(finalMap)\r
\r
      landmarks = [\r
          {"name": "경복궁", "loc": [37.5796, 126.9770], "icon": "tower"},\r
          {"name": "남산타워", "loc": [37.5512, 126.9882], "icon": "signal"},\r
          {"name": "광화문", "loc": [37.5760, 126.9769], "icon": "flag"},\r
          {"name": "동대문DDP", "loc": [37.5673, 127.0095], "icon": "th-large"}\r
      ]\r
\r
      lmGroup = folium.FeatureGroup(name="랜드마크")\r
      for lm in landmarks:\r
          folium.Marker(\r
              location=lm["loc"],\r
              popup=f"<b>{lm['name']}</b>",\r
              tooltip=lm["name"],\r
              icon=folium.Icon(color="red", icon=lm["icon"])\r
          ).add_to(lmGroup)\r
      lmGroup.add_to(finalMap)\r
\r
      cafeCluster = MarkerCluster(name="카페")\r
      cafeAreas = [[37.5796, 126.9770], [37.5636, 126.9869], [37.5563, 126.9236]]\r
      for area in cafeAreas:\r
          for i in range(10):\r
              lat = area[0] + random.uniform(-0.006, 0.006)\r
              lon = area[1] + random.uniform(-0.006, 0.006)\r
              folium.Marker(\r
                  [lat, lon],\r
                  popup=f"카페",\r
                  icon=folium.Icon(color="cadetblue", icon="cloud")\r
              ).add_to(cafeCluster)\r
      cafeCluster.add_to(finalMap)\r
\r
      densityGroup = folium.FeatureGroup(name="관광객 밀도", show=False)\r
      densityData = []\r
      for area in cafeAreas:\r
          for _ in range(30):\r
              lat = area[0] + random.uniform(-0.01, 0.01)\r
              lon = area[1] + random.uniform(-0.01, 0.01)\r
              densityData.append([lat, lon, 0.8])\r
      HeatMap(densityData, radius=20, blur=15).add_to(densityGroup)\r
      densityGroup.add_to(finalMap)\r
\r
      guGeo = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "종로구", "score": 90},\r
                  "geometry": {"type": "Polygon", "coordinates": [[\r
                      [126.96, 37.57], [127.00, 37.57],\r
                      [127.00, 37.60], [126.96, 37.60], [126.96, 37.57]\r
                  ]]}\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "중구", "score": 85},\r
                  "geometry": {"type": "Polygon", "coordinates": [[\r
                      [126.96, 37.54], [127.00, 37.54],\r
                      [127.00, 37.57], [126.96, 37.57], [126.96, 37.54]\r
                  ]]}\r
              }\r
          ]\r
      }\r
\r
      guGroup = folium.FeatureGroup(name="구 경계", show=False)\r
      scoreColormap = cm.LinearColormap(\r
          ["#fee8c8", "#e74c3c"],\r
          vmin=70, vmax=100,\r
          caption="관광 만족도"\r
      )\r
      folium.GeoJson(\r
          guGeo,\r
          style_function=lambda f: {\r
              "fillColor": scoreColormap(f["properties"]["score"]),\r
              "color": "white", "weight": 2, "fillOpacity": 0.5\r
          },\r
          tooltip=folium.GeoJsonTooltip(fields=["name", "score"])\r
      ).add_to(guGroup)\r
      guGroup.add_to(finalMap)\r
      scoreColormap.add_to(finalMap)\r
\r
      routeGroup = folium.FeatureGroup(name="추천 코스", show=False)\r
      folium.PolyLine(\r
          [[37.5796, 126.9770], [37.5760, 126.9769], [37.5636, 126.9869]],\r
          color="purple", weight=4, popup="궁궐-명동 코스"\r
      ).add_to(routeGroup)\r
      routeGroup.add_to(finalMap)\r
\r
      folium.LayerControl(collapsed=False).add_to(finalMap)\r
\r
      finalMap\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 완성 코드의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 완성 코드 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: 11단계. 종합 지도 품질 검증\r
  structuredPrimary: true\r
  subtitle: 데이터 계약과 레이어 렌더 확인\r
  goal: 11단계. 종합 지도 품질 검증에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 종합 지도는 위치 데이터, GeoJSON, 레이어 표시 의도를 함께 확인해야 화면 완성 뒤에도 데이터 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    종합 지도는 기능을 많이 붙이는 과제가 아니라, 데이터 계약과 레이어 의도가 깨지지 않는지 검증하는 프로젝트입니다. 마커, 클러스터, 히트맵, GeoJSON, 경로가 서로 다른 데이터 구조를 쓰므로 먼저 검증 기준을 만들고 마지막에 렌더 결과를 확인합니다.\r
\r
    종합 프로젝트는 화면 완성도가 아니라 검증 가능한 데이터-지도 파이프라인으로 평가해야 합니다.\r
  snippet: |-\r
    import folium\r
    from folium.plugins import HeatMap, MarkerCluster\r
    import branca.colormap as cm\r
\r
    projectSites = [\r
        {"name": "경복궁", "category": "landmark", "loc": [37.5796, 126.9770], "visitors": 90},\r
        {"name": "남산타워", "category": "landmark", "loc": [37.5512, 126.9882], "visitors": 85},\r
        {"name": "명동 카페", "category": "cafe", "loc": [37.5636, 126.9869], "visitors": 70},\r
        {"name": "홍대 카페", "category": "cafe", "loc": [37.5563, 126.9236], "visitors": 75},\r
        {"name": "종로 맛집", "category": "restaurant", "loc": [37.5701, 126.9995], "visitors": 65},\r
    ]\r
\r
    projectGeo = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "중심 관광권", "score": 92},\r
                "geometry": {"type": "Polygon", "coordinates": [[\r
                    [126.96, 37.56], [127.00, 37.56],\r
                    [127.00, 37.60], [126.96, 37.60], [126.96, 37.56]\r
                ]]},\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "동부 관광권", "score": 78},\r
                "geometry": {"type": "Polygon", "coordinates": [[\r
                    [127.00, 37.54], [127.04, 37.54],\r
                    [127.04, 37.58], [127.00, 37.58], [127.00, 37.54]\r
                ]]},\r
            },\r
        ],\r
    }\r
\r
    routePoints = [\r
        [37.5796, 126.9770],\r
        [37.5760, 126.9769],\r
        [37.5636, 126.9869],\r
    ]\r
\r
    categoryConfig = {\r
        "landmark": {"label": "랜드마크", "color": "red", "show": True},\r
        "cafe": {"label": "카페", "color": "cadetblue", "show": True},\r
        "restaurant": {"label": "음식점", "color": "orange", "show": False},\r
    }\r
\r
    len(projectSites), len(projectGeo["features"]), len(routePoints)\r
  exercise:\r
    prompt: 11단계. 종합 지도 품질 검증 예제에서 관광지, GeoJSON feature, 경로 좌표, 카테고리 표시 설정을 바꾸고 검증 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import folium\r
      from folium.plugins import HeatMap, MarkerCluster\r
      import branca.colormap as cm\r
\r
      projectSites = [\r
          {"name": "경복궁", "category": "landmark", "loc": [37.5796, 126.9770], "visitors": 90},\r
          {"name": "남산타워", "category": "landmark", "loc": [37.5512, 126.9882], "visitors": 85},\r
          {"name": "명동 카페", "category": "cafe", "loc": [37.5636, 126.9869], "visitors": 70},\r
          {"name": "홍대 카페", "category": "cafe", "loc": [37.5563, 126.9236], "visitors": 75},\r
          {"name": "종로 맛집", "category": "restaurant", "loc": [37.5701, 126.9995], "visitors": 65},\r
      ]\r
\r
      projectGeo = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "중심 관광권", "score": 92},\r
                  "geometry": {"type": "Polygon", "coordinates": [[\r
                      [126.96, 37.56], [127.00, 37.56],\r
                      [127.00, 37.60], [126.96, 37.60], [126.96, 37.56]\r
                  ]]},\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "동부 관광권", "score": 78},\r
                  "geometry": {"type": "Polygon", "coordinates": [[\r
                      [127.00, 37.54], [127.04, 37.54],\r
                      [127.04, 37.58], [127.00, 37.58], [127.00, 37.54]\r
                  ]]},\r
              },\r
          ],\r
      }\r
\r
      routePoints = [\r
          [37.5796, 126.9770],\r
          [37.5760, 126.9769],\r
          [37.5636, 126.9869],\r
      ]\r
\r
      categoryConfig = {\r
          "landmark": {"label": "랜드마크", "color": "red", "show": True},\r
          "cafe": {"label": "카페", "color": "cadetblue", "show": True},\r
          "restaurant": {"label": "음식점", "color": "orange", "show": False},\r
      }\r
\r
      len(projectSites), len(projectGeo["features"]), len(routePoints)\r
    hints:\r
    - 바꿀 지점은 \`projectSites\`, \`projectGeo\`, \`routePoints\`, \`categoryConfig\`의 좌표와 카테고리 값입니다.\r
    - 실행 뒤 개수 검증, 카테고리 설정, 레이어 구성 기준이 바꾼 지도 데이터를 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 종합 지도 품질 검증의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 종합 지도 품질 검증의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 종합 프로젝트\r
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 지금까지 배운 내용을 활용하여 나만의 종합 지도를 만들어봅시다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import folium\r
    from folium.plugins import HeatMap, MarkerCluster\r
    import branca.colormap as cm\r
    import random\r
    gangnamCenter = [37.4979, 127.0276]\r
    realEstateMap = folium.Map(location=gangnamCenter, zoom_start=14, tiles="CartoDB Positron")\r
\r
    priceGeo = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "역삼동", "price": 15},\r
                "geometry": {"type": "Polygon", "coordinates": [[\r
                    [127.02, 37.49], [127.04, 37.49],\r
                    [127.04, 37.51], [127.02, 37.51], [127.02, 37.49]\r
                ]]}\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "삼성동", "price": 18},\r
                "geometry": {"type": "Polygon", "coordinates": [[\r
                    [127.04, 37.49], [127.06, 37.49],\r
                    [127.06, 37.51], [127.04, 37.51], [127.04, 37.49]\r
                ]]}\r
            }\r
        ]\r
    }\r
\r
    priceColormap = cm.LinearColormap(\r
        ["#fee8c8", "#e74c3c"],\r
        vmin=10, vmax=20,\r
        caption="평당 가격(억원)"\r
    )\r
\r
    priceGroup = folium.FeatureGroup(name="시세")\r
    folium.GeoJson(\r
        priceGeo,\r
        style_function=lambda f: {\r
            "fillColor": priceColormap(f["properties"]["price"]),\r
            "color": "white", "weight": 2, "fillOpacity": 0.6\r
        },\r
        tooltip=folium.GeoJsonTooltip(\r
            fields=["name", "price"],\r
            aliases=["동:", "평당가:"]\r
        )\r
    ).add_to(priceGroup)\r
    priceGroup.add_to(realEstateMap)\r
    priceColormap.add_to(realEstateMap)\r
\r
    aptCluster = MarkerCluster(name="아파트")\r
    for _ in range(30):\r
        lat = 37.50 + random.uniform(-0.015, 0.015)\r
        lon = 127.03 + random.uniform(-0.02, 0.02)\r
        folium.Marker(\r
            [lat, lon],\r
            icon=folium.Icon(color="blue", icon="home")\r
        ).add_to(aptCluster)\r
    aptCluster.add_to(realEstateMap)\r
\r
    infraGroup = folium.FeatureGroup(name="인프라")\r
    infras = [\r
        {"name": "강남역", "loc": [37.4979, 127.0276]},\r
        {"name": "선릉역", "loc": [37.5045, 127.0490]}\r
    ]\r
    for inf in infras:\r
        folium.CircleMarker(\r
            location=inf["loc"],\r
            radius=10,\r
            color="green",\r
            fill=True,\r
            popup=inf["name"]\r
        ).add_to(infraGroup)\r
    infraGroup.add_to(realEstateMap)\r
\r
    folium.LayerControl().add_to(realEstateMap)\r
\r
    realEstateMap\r
  exercise:\r
    prompt: 실습 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import folium\r
      from folium.plugins import HeatMap, MarkerCluster\r
      import branca.colormap as cm\r
      import random\r
      gangnamCenter = [37.4979, 127.0276]\r
      realEstateMap = folium.Map(location=gangnamCenter, zoom_start=14, tiles="CartoDB Positron")\r
\r
      priceGeo = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "역삼동", "price": 15},\r
                  "geometry": {"type": "Polygon", "coordinates": [[\r
                      [127.02, 37.49], [127.04, 37.49],\r
                      [127.04, 37.51], [127.02, 37.51], [127.02, 37.49]\r
                  ]]}\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "삼성동", "price": 18},\r
                  "geometry": {"type": "Polygon", "coordinates": [[\r
                      [127.04, 37.49], [127.06, 37.49],\r
                      [127.06, 37.51], [127.04, 37.51], [127.04, 37.49]\r
                  ]]}\r
              }\r
          ]\r
      }\r
\r
      priceColormap = cm.LinearColormap(\r
          ["#fee8c8", "#e74c3c"],\r
          vmin=10, vmax=20,\r
          caption="평당 가격(억원)"\r
      )\r
\r
      priceGroup = folium.FeatureGroup(name="시세")\r
      folium.GeoJson(\r
          priceGeo,\r
          style_function=lambda f: {\r
              "fillColor": priceColormap(f["properties"]["price"]),\r
              "color": "white", "weight": 2, "fillOpacity": 0.6\r
          },\r
          tooltip=folium.GeoJsonTooltip(\r
              fields=["name", "price"],\r
              aliases=["동:", "평당가:"]\r
          )\r
      ).add_to(priceGroup)\r
      priceGroup.add_to(realEstateMap)\r
      priceColormap.add_to(realEstateMap)\r
\r
      aptCluster = MarkerCluster(name="아파트")\r
      for _ in range(30):\r
          lat = 37.50 + random.uniform(-0.015, 0.015)\r
          lon = 127.03 + random.uniform(-0.02, 0.02)\r
          folium.Marker(\r
              [lat, lon],\r
              icon=folium.Icon(color="blue", icon="home")\r
          ).add_to(aptCluster)\r
      aptCluster.add_to(realEstateMap)\r
\r
      infraGroup = folium.FeatureGroup(name="인프라")\r
      infras = [\r
          {"name": "강남역", "loc": [37.4979, 127.0276]},\r
          {"name": "선릉역", "loc": [37.5045, 127.0490]}\r
      ]\r
      for inf in infras:\r
          folium.CircleMarker(\r
              location=inf["loc"],\r
              radius=10,\r
              color="green",\r
              fill=True,\r
              popup=inf["name"]\r
          ).add_to(infraGroup)\r
      infraGroup.add_to(realEstateMap)\r
\r
      folium.LayerControl().add_to(realEstateMap)\r
\r
      realEstateMap\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
`;export{e as default};