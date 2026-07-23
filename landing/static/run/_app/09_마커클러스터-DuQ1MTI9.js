var e=`meta:
  packages:
  - folium
  id: folium_09
  title: 마커 클러스터
  order: 9
  category: folium
  difficulty: ⭐⭐⭐⭐
  badge: 심화
  tags:
  - folium
  - MarkerCluster
  - 클러스터
  - 대량마커
  - 그룹화
  seo:
    title: Folium MarkerCluster - 대량 마커 효율적 표시
    description: Folium으로 마커 클러스터를 만듭니다. 수백, 수천 개의 마커를 효율적으로 그룹화합니다.
    keywords:
    - folium
    - MarkerCluster
    - 클러스터
    - 대량마커
    - 줌
intro:
  emoji: 🔢
  goal: 대량의 마커를 클러스터로 효율적으로 표시합니다.
  description: 마커가 많으면 지도가 느려지고 보기 어렵습니다. MarkerCluster는 가까운 마커들을 숫자로 그룹화하고, 줌인하면 개별 마커가 나타납니다. 수천 개의
    위치도 깔끔하게 표시할 수 있습니다.
  direction: 마커 클러스터에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.
  benefits:
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.
  - 마커 클러스터 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 기본 클러스터 처리 실행
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 대량 데이터 결과 검증
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.
    - label: 마커 클러스터 재사용
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 지도 시각화 환경
      detail: folium 기준으로 로컬 Python 실행을 준비합니다.
    - label: 마커 클러스터 실행
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.
    - label: 마커 클러스터 완료
      detail: 검증된 코드를 위치 기반 리포트로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: folium과 MarkerCluster 플러그인을 불러옵니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import folium
    from folium.plugins import MarkerCluster
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: |-
      import folium
      from folium.plugins import MarkerCluster
    hints:
    - 바꿀 지점은 위도/경도 데이터을 만드는 첫 줄과 지도 레이어 구성 줄에서 찾으세요.
    - 실행 뒤 마커와 저장 HTML 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 마커와 저장 HTML 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step2_basic_cluster
  title: 2단계. 기본 클러스터
  structuredPrimary: true
  subtitle: MarkerCluster()
  goal: 2단계. 기본 클러스터에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    MarkerCluster를 생성하고 마커를 추가합니다. 마커들이 자동으로 그룹화됩니다.

    클러스터에 표시된 숫자는 그룹에 포함된 마커 수입니다. 클릭하거나 줌인하면 분리됩니다.
  snippet: |-
    seoulCenter = [37.5665, 126.9780]
    m1 = folium.Map(location=seoulCenter, zoom_start=12)

    markerCluster = MarkerCluster().add_to(m1)

    locations = [
        [37.5665, 126.9780],
        [37.5670, 126.9785],
        [37.5660, 126.9775],
        [37.5700, 126.9750],
        [37.5710, 126.9760],
        [37.5720, 126.9770],
        [37.5500, 126.9900],
        [37.5510, 126.9910],
        [37.5490, 126.9890]
    ]

    for loc in locations:
        folium.Marker(location=loc).add_to(markerCluster)

    m1
  exercise:
    prompt: 2단계. 기본 클러스터 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      seoulCenter = [37.5665, 126.9780]
      m1 = folium.Map(location=seoulCenter, zoom_start=12)

      markerCluster = MarkerCluster().add_to(m1)

      locations = [
          [37.5665, 126.9780],
          [37.5670, 126.9785],
          [37.5660, 126.9775],
          [37.5700, 126.9750],
          [37.5710, 126.9760],
          [37.5720, 126.9770],
          [37.5500, 126.9900],
          [37.5510, 126.9910],
          [37.5490, 126.9890]
      ]

      for loc in locations:
          folium.Marker(location=loc).add_to(markerCluster)

      m1
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 2단계. 기본 클러스터의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 2단계. 기본 클러스터 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step3_large_data
  title: 3단계. 대량 데이터
  structuredPrimary: true
  subtitle: 많은 마커
  goal: 3단계. 대량 데이터에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    수백 개의 마커를 클러스터로 효율적으로 표시합니다.

    200개 마커도 클러스터로 표시하면 지도가 깔끔합니다. 줌인해서 개별 마커를 확인하세요.
  snippet: |-
    import random

    m2 = folium.Map(location=seoulCenter, zoom_start=11)
    cluster2 = MarkerCluster().add_to(m2)

    for _ in range(200):
        lat = 37.5 + random.uniform(-0.1, 0.1)
        lon = 127.0 + random.uniform(-0.1, 0.1)
        folium.Marker([lat, lon]).add_to(cluster2)

    m2
  exercise:
    prompt: 3단계. 대량 데이터 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import random

      m2 = folium.Map(location=seoulCenter, zoom_start=11)
      cluster2 = MarkerCluster().add_to(m2)

      for _ in range(200):
          lat = 37.5 + random.uniform(-0.1, 0.1)
          lon = 127.0 + random.uniform(-0.1, 0.1)
          folium.Marker([lat, lon]).add_to(cluster2)

      m2
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 3단계. 대량 데이터의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 3단계. 대량 데이터 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step4_popup_tooltip
  title: 4단계. 팝업과 툴팁
  structuredPrimary: true
  subtitle: 마커 정보
  goal: 4단계. 팝업과 툴팁에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    클러스터 내 마커에도 팝업과 툴팁을 추가할 수 있습니다.

    줌인해서 개별 마커를 클릭하면 팝업이 표시됩니다.
  snippet: |-
    m3 = folium.Map(location=seoulCenter, zoom_start=13)
    cluster3 = MarkerCluster().add_to(m3)

    stores = [
        {"name": "강남점", "loc": [37.4979, 127.0276]},
        {"name": "홍대점", "loc": [37.5563, 126.9236]},
        {"name": "명동점", "loc": [37.5636, 126.9869]},
        {"name": "시청점", "loc": [37.5665, 126.9780]},
        {"name": "여의도점", "loc": [37.5219, 126.9245]},
        {"name": "잠실점", "loc": [37.5133, 127.1001]}
    ]

    for store in stores:
        folium.Marker(
            location=store["loc"],
            popup=f"<b>{store['name']}</b>",
            tooltip=store["name"]
        ).add_to(cluster3)

    m3
  exercise:
    prompt: 4단계. 팝업과 툴팁 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      m3 = folium.Map(location=seoulCenter, zoom_start=13)
      cluster3 = MarkerCluster().add_to(m3)

      stores = [
          {"name": "강남점", "loc": [37.4979, 127.0276]},
          {"name": "홍대점", "loc": [37.5563, 126.9236]},
          {"name": "명동점", "loc": [37.5636, 126.9869]},
          {"name": "시청점", "loc": [37.5665, 126.9780]},
          {"name": "여의도점", "loc": [37.5219, 126.9245]},
          {"name": "잠실점", "loc": [37.5133, 127.1001]}
      ]

      for store in stores:
          folium.Marker(
              location=store["loc"],
              popup=f"<b>{store['name']}</b>",
              tooltip=store["name"]
          ).add_to(cluster3)

      m3
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 4단계. 팝업과 툴팁의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 4단계. 팝업과 툴팁 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step5_custom_icon
  title: 5단계. 커스텀 아이콘
  structuredPrimary: true
  subtitle: Icon 적용
  goal: 5단계. 커스텀 아이콘에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    클러스터 내 마커에 커스텀 아이콘을 적용합니다.

    클러스터 아이콘(숫자 원)은 자동 생성되고, 개별 마커는 지정한 아이콘으로 표시됩니다.
  snippet: |-
    m4 = folium.Map(location=seoulCenter, zoom_start=12)
    cluster4 = MarkerCluster().add_to(m4)

    cafes = [
        {"name": "스타벅스 강남", "loc": [37.4979, 127.0276]},
        {"name": "스타벅스 홍대", "loc": [37.5563, 126.9236]},
        {"name": "스타벅스 명동", "loc": [37.5636, 126.9869]},
        {"name": "스타벅스 시청", "loc": [37.5665, 126.9780]},
        {"name": "스타벅스 을지로", "loc": [37.5660, 126.9910]}
    ]

    for cafe in cafes:
        folium.Marker(
            location=cafe["loc"],
            popup=cafe["name"],
            icon=folium.Icon(color="green", icon="cloud")
        ).add_to(cluster4)

    m4
  exercise:
    prompt: 5단계. 커스텀 아이콘 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      m4 = folium.Map(location=seoulCenter, zoom_start=12)
      cluster4 = MarkerCluster().add_to(m4)

      cafes = [
          {"name": "스타벅스 강남", "loc": [37.4979, 127.0276]},
          {"name": "스타벅스 홍대", "loc": [37.5563, 126.9236]},
          {"name": "스타벅스 명동", "loc": [37.5636, 126.9869]},
          {"name": "스타벅스 시청", "loc": [37.5665, 126.9780]},
          {"name": "스타벅스 을지로", "loc": [37.5660, 126.9910]}
      ]

      for cafe in cafes:
          folium.Marker(
              location=cafe["loc"],
              popup=cafe["name"],
              icon=folium.Icon(color="green", icon="cloud")
          ).add_to(cluster4)

      m4
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 5단계. 커스텀 아이콘의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 5단계. 커스텀 아이콘 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step6_multiple_clusters
  title: 6단계. 여러 클러스터
  structuredPrimary: true
  subtitle: 카테고리별 분류
  goal: 6단계. 여러 클러스터에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    카테고리별로 별도의 클러스터를 만들어 분류합니다.

    LayerControl로 카테고리별 클러스터를 켜고 끌 수 있습니다.
  snippet: |-
    m5 = folium.Map(location=seoulCenter, zoom_start=12)

    cafeCluster = MarkerCluster(name="카페").add_to(m5)
    restaurantCluster = MarkerCluster(name="음식점").add_to(m5)

    cafeLocations = [
        [37.5665, 126.9780],
        [37.5670, 126.9790],
        [37.5660, 126.9770],
        [37.5700, 126.9750]
    ]

    restaurantLocations = [
        [37.5600, 126.9850],
        [37.5610, 126.9860],
        [37.5590, 126.9840],
        [37.5620, 126.9870]
    ]

    for loc in cafeLocations:
        folium.Marker(
            location=loc,
            icon=folium.Icon(color="cadetblue", icon="cloud")
        ).add_to(cafeCluster)

    for loc in restaurantLocations:
        folium.Marker(
            location=loc,
            icon=folium.Icon(color="red", icon="cutlery")
        ).add_to(restaurantCluster)

    folium.LayerControl().add_to(m5)

    m5
  exercise:
    prompt: 6단계. 여러 클러스터 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      m5 = folium.Map(location=seoulCenter, zoom_start=12)

      cafeCluster = MarkerCluster(name="카페").add_to(m5)
      restaurantCluster = MarkerCluster(name="음식점").add_to(m5)

      cafeLocations = [
          [37.5665, 126.9780],
          [37.5670, 126.9790],
          [37.5660, 126.9770],
          [37.5700, 126.9750]
      ]

      restaurantLocations = [
          [37.5600, 126.9850],
          [37.5610, 126.9860],
          [37.5590, 126.9840],
          [37.5620, 126.9870]
      ]

      for loc in cafeLocations:
          folium.Marker(
              location=loc,
              icon=folium.Icon(color="cadetblue", icon="cloud")
          ).add_to(cafeCluster)

      for loc in restaurantLocations:
          folium.Marker(
              location=loc,
              icon=folium.Icon(color="red", icon="cutlery")
          ).add_to(restaurantCluster)

      folium.LayerControl().add_to(m5)

      m5
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 6단계. 여러 클러스터의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 6단계. 여러 클러스터 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step7_cluster_options
  title: 7단계. 클러스터 옵션
  structuredPrimary: true
  subtitle: 동작 설정
  goal: 7단계. 클러스터 옵션에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    MarkerCluster에 다양한 옵션을 설정할 수 있습니다.

    maxClusterRadius는 클러스터 반경(픽셀), disableClusteringAtZoom은 클러스터링 해제 줌 레벨입니다.
  snippet: |-
    import random

    m6 = folium.Map(location=seoulCenter, zoom_start=12)

    optionCluster = MarkerCluster(
        options={
            "maxClusterRadius": 50,
            "disableClusteringAtZoom": 15,
            "spiderfyOnMaxZoom": True
        }
    ).add_to(m6)

    for _ in range(50):
        lat = 37.55 + random.uniform(-0.03, 0.03)
        lon = 126.98 + random.uniform(-0.03, 0.03)
        folium.Marker([lat, lon]).add_to(optionCluster)

    m6
  exercise:
    prompt: 7단계. 클러스터 옵션 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import random

      m6 = folium.Map(location=seoulCenter, zoom_start=12)

      optionCluster = MarkerCluster(
          options={
              "maxClusterRadius": 50,
              "disableClusteringAtZoom": 15,
              "spiderfyOnMaxZoom": True
          }
      ).add_to(m6)

      for _ in range(50):
          lat = 37.55 + random.uniform(-0.03, 0.03)
          lon = 126.98 + random.uniform(-0.03, 0.03)
          folium.Marker([lat, lon]).add_to(optionCluster)

      m6
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 7단계. 클러스터 옵션의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 7단계. 클러스터 옵션 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step8_show_coverage
  title: 8단계. 커버리지 표시
  structuredPrimary: true
  subtitle: 클러스터 범위
  goal: 8단계. 커버리지 표시에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    showCoverageOnHover 옵션으로 클러스터의 범위를 시각화합니다.

    클러스터 위에 마우스를 올리면 포함된 마커들의 범위가 표시됩니다.
  snippet: |-
    import random

    m7 = folium.Map(location=seoulCenter, zoom_start=12)

    coverageCluster = MarkerCluster(
        options={
            "showCoverageOnHover": True
        }
    ).add_to(m7)

    for _ in range(80):
        lat = 37.55 + random.uniform(-0.05, 0.05)
        lon = 126.98 + random.uniform(-0.05, 0.05)
        folium.Marker([lat, lon]).add_to(coverageCluster)

    m7
  exercise:
    prompt: 8단계. 커버리지 표시 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import random

      m7 = folium.Map(location=seoulCenter, zoom_start=12)

      coverageCluster = MarkerCluster(
          options={
              "showCoverageOnHover": True
          }
      ).add_to(m7)

      for _ in range(80):
          lat = 37.55 + random.uniform(-0.05, 0.05)
          lon = 126.98 + random.uniform(-0.05, 0.05)
          folium.Marker([lat, lon]).add_to(coverageCluster)

      m7
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 8단계. 커버리지 표시의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 8단계. 커버리지 표시 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step9_with_other_elements
  title: 9단계. 다른 요소와 조합
  structuredPrimary: true
  subtitle: 클러스터 + 도형
  goal: 9단계. 다른 요소와 조합에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    클러스터와 일반 마커, 도형을 함께 사용합니다.

    중요한 위치는 일반 마커로, 대량의 위치는 클러스터로 표시합니다.
  snippet: |-
    import random

    m8 = folium.Map(location=seoulCenter, zoom_start=12, tiles="CartoDB Positron")

    hqLocation = [37.5665, 126.9780]

    folium.Marker(
        location=hqLocation,
        popup="<b>본사</b>",
        icon=folium.Icon(color="red", icon="home")
    ).add_to(m8)

    folium.Circle(
        location=hqLocation,
        radius=3000,
        color="red",
        fill=True,
        fill_opacity=0.1,
        popup="서비스 권역"
    ).add_to(m8)

    branchCluster = MarkerCluster(name="지점").add_to(m8)

    for _ in range(40):
        lat = 37.55 + random.uniform(-0.04, 0.04)
        lon = 126.98 + random.uniform(-0.04, 0.04)
        folium.Marker(
            [lat, lon],
            icon=folium.Icon(color="blue", icon="briefcase")
        ).add_to(branchCluster)

    m8
  exercise:
    prompt: 9단계. 다른 요소와 조합 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import random

      m8 = folium.Map(location=seoulCenter, zoom_start=12, tiles="CartoDB Positron")

      hqLocation = [37.5665, 126.9780]

      folium.Marker(
          location=hqLocation,
          popup="<b>본사</b>",
          icon=folium.Icon(color="red", icon="home")
      ).add_to(m8)

      folium.Circle(
          location=hqLocation,
          radius=3000,
          color="red",
          fill=True,
          fill_opacity=0.1,
          popup="서비스 권역"
      ).add_to(m8)

      branchCluster = MarkerCluster(name="지점").add_to(m8)

      for _ in range(40):
          lat = 37.55 + random.uniform(-0.04, 0.04)
          lon = 126.98 + random.uniform(-0.04, 0.04)
          folium.Marker(
              [lat, lon],
              icon=folium.Icon(color="blue", icon="briefcase")
          ).add_to(branchCluster)

      m8
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 9단계. 다른 요소와 조합의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 9단계. 다른 요소와 조합 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step10_complete
  title: 10단계. 완성 예제
  structuredPrimary: true
  subtitle: 전국 매장 지도
  goal: 10단계. 완성 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: 전국 매장 위치를 클러스터로 표시하는 완성 예제입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import random

    storeMap = folium.Map(
        location=[36.5, 127.5],
        zoom_start=7,
        tiles="CartoDB Positron"
    )

    storeCluster = MarkerCluster(
        name="전국 매장",
        options={
            "maxClusterRadius": 80,
            "showCoverageOnHover": True,
            "spiderfyOnMaxZoom": True
        }
    ).add_to(storeMap)

    regions = [
        {"name": "서울", "center": [37.5665, 126.9780], "count": 50},
        {"name": "부산", "center": [35.1796, 129.0756], "count": 30},
        {"name": "대전", "center": [36.3504, 127.3845], "count": 20},
        {"name": "대구", "center": [35.8714, 128.6014], "count": 25},
        {"name": "광주", "center": [35.1595, 126.8526], "count": 15},
        {"name": "제주", "center": [33.4996, 126.5312], "count": 10}
    ]

    for region in regions:
        for i in range(region["count"]):
            lat = region["center"][0] + random.uniform(-0.05, 0.05)
            lon = region["center"][1] + random.uniform(-0.05, 0.05)
            folium.Marker(
                location=[lat, lon],
                popup=f"{region['name']} {i+1}호점",
                tooltip=f"{region['name']} 매장",
                icon=folium.Icon(color="green", icon="shopping-cart")
            ).add_to(storeCluster)

    for region in regions:
        folium.CircleMarker(
            location=region["center"],
            radius=8,
            color="darkblue",
            fill=True,
            fill_color="blue",
            popup=f"<b>{region['name']}</b><br>매장 수: {region['count']}"
        ).add_to(storeMap)

    folium.LayerControl().add_to(storeMap)

    storeMap
  exercise:
    prompt: 10단계. 완성 예제 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import random

      storeMap = folium.Map(
          location=[36.5, 127.5],
          zoom_start=7,
          tiles="CartoDB Positron"
      )

      storeCluster = MarkerCluster(
          name="전국 매장",
          options={
              "maxClusterRadius": 80,
              "showCoverageOnHover": True,
              "spiderfyOnMaxZoom": True
          }
      ).add_to(storeMap)

      regions = [
          {"name": "서울", "center": [37.5665, 126.9780], "count": 50},
          {"name": "부산", "center": [35.1796, 129.0756], "count": 30},
          {"name": "대전", "center": [36.3504, 127.3845], "count": 20},
          {"name": "대구", "center": [35.8714, 128.6014], "count": 25},
          {"name": "광주", "center": [35.1595, 126.8526], "count": 15},
          {"name": "제주", "center": [33.4996, 126.5312], "count": 10}
      ]

      for region in regions:
          for i in range(region["count"]):
              lat = region["center"][0] + random.uniform(-0.05, 0.05)
              lon = region["center"][1] + random.uniform(-0.05, 0.05)
              folium.Marker(
                  location=[lat, lon],
                  popup=f"{region['name']} {i+1}호점",
                  tooltip=f"{region['name']} 매장",
                  icon=folium.Icon(color="green", icon="shopping-cart")
              ).add_to(storeCluster)

      for region in regions:
          folium.CircleMarker(
              location=region["center"],
              radius=8,
              color="darkblue",
              fill=True,
              fill_color="blue",
              popup=f"<b>{region['name']}</b><br>매장 수: {region['count']}"
          ).add_to(storeMap)

      folium.LayerControl().add_to(storeMap)

      storeMap
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 10단계. 완성 예제의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 10단계. 완성 예제 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step11_workflow
  title: 11단계. 실무 클러스터 검증
  structuredPrimary: true
  subtitle: 예측 → 분류 오류 확인 → 렌더 검증 → 임계값 실험
  goal: 11단계. 실무 클러스터 검증에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    마커 클러스터는 대량 위치를 빠르게 보여주지만, 데이터 분류가 틀리면 숫자가 그럴듯해도 업무 판단은 틀립니다. 클러스터에 넣기 전에 좌표와 카테고리를 검증하고, 렌더된 HTML에 지점명과 레이어 이름이 들어갔는지 확인해야 합니다.

    클러스터 지도는 마커 수를 줄이는 기술이 아니라 대량 위치 데이터를 운영 단위로 묶는 방법입니다. 좌표, 카테고리, 레이어, 렌더 결과를 검증해야 숫자를 믿고 업무 판단을 내릴 수 있습니다.
  tips:
  - 클러스터 지도는 마커 수를 줄이는 기술이 아니라 대량 위치 데이터를 운영 단위로 묶는 방법입니다. 좌표, 카테고리, 레이어, 렌더 결과를 검증해야 숫자를 믿고 업무 판단을 내릴
    수 있습니다.
  snippet: |-
    fieldTickets = [
        {"id": "T-101", "name": "강남 설치", "loc": [37.4979, 127.0276], "category": "install", "priority": "high"},
        {"id": "T-102", "name": "역삼 설치", "loc": [37.5005, 127.0360], "category": "install", "priority": "medium"},
        {"id": "T-103", "name": "성수 장애", "loc": [37.5446, 127.0557], "category": "incident", "priority": "high"},
        {"id": "T-104", "name": "마포 방문", "loc": [37.5663, 126.9019], "category": "visit", "priority": "low"},
        {"id": "T-105", "name": "여의도 장애", "loc": [37.5219, 126.9245], "category": "incident", "priority": "medium"},
        {"id": "T-106", "name": "종로 방문", "loc": [37.5796, 126.9770], "category": "visit", "priority": "medium"},
    ]

    clusterStyle = {
        "install": {"layerName": "설치", "color": "blue", "icon": "wrench"},
        "incident": {"layerName": "장애", "color": "red", "icon": "exclamation-sign"},
        "visit": {"layerName": "방문", "color": "green", "icon": "user"},
    }

    ticketCountByCategory = {}
    for ticket in fieldTickets:
        ticketCountByCategory[ticket["category"]] = ticketCountByCategory.get(ticket["category"], 0) + 1

    busiestCategory = max(ticketCountByCategory, key=ticketCountByCategory.get)
    busiestCategory, ticketCountByCategory
  exercise:
    prompt: 11단계. 실무 클러스터 검증 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      fieldTickets = [
          {"id": "T-101", "name": "강남 설치", "loc": [37.4979, 127.0276], "category": "install", "priority": "high"},
          {"id": "T-102", "name": "역삼 설치", "loc": [37.5005, 127.0360], "category": "install", "priority": "medium"},
          {"id": "T-103", "name": "성수 장애", "loc": [37.5446, 127.0557], "category": "incident", "priority": "high"},
          {"id": "T-104", "name": "마포 방문", "loc": [37.5663, 126.9019], "category": "visit", "priority": "low"},
          {"id": "T-105", "name": "여의도 장애", "loc": [37.5219, 126.9245], "category": "incident", "priority": "medium"},
          {"id": "T-106", "name": "종로 방문", "loc": [37.5796, 126.9770], "category": "visit", "priority": "medium"},
      ]

      clusterStyle = {
          "install": {"layerName": "설치", "color": "blue", "icon": "wrench"},
          "incident": {"layerName": "장애", "color": "red", "icon": "exclamation-sign"},
          "visit": {"layerName": "방문", "color": "green", "icon": "user"},
      }

      ticketCountByCategory = {}
      for ticket in fieldTickets:
          ticketCountByCategory[ticket["category"]] = ticketCountByCategory.get(ticket["category"], 0) + 1

      busiestCategory = max(ticketCountByCategory, key=ticketCountByCategory.get)
      busiestCategory, ticketCountByCategory
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 11단계. 실무 클러스터 검증의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 11단계. 실무 클러스터 검증 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 마커 클러스터
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: 지금까지 배운 내용을 활용하여 미션을 수행해봅시다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import folium
    from folium.plugins import MarkerCluster
    import random
    convenienceStores = []
    for _ in range(100):
        lat = 37.55 + random.uniform(-0.05, 0.05)
        lon = 126.98 + random.uniform(-0.05, 0.05)
        brand = random.choice(["CU", "GS25", "세븐일레븐"])
        convenienceStores.append({"loc": [lat, lon], "brand": brand})

    len(convenienceStores)
  exercise:
    prompt: 실습 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import folium
      from folium.plugins import MarkerCluster
      import random
      convenienceStores = []
      for _ in range(100):
          lat = 37.55 + random.uniform(-0.05, 0.05)
          lon = 126.98 + random.uniform(-0.05, 0.05)
          brand = random.choice(["CU", "GS25", "세븐일레븐"])
          convenienceStores.append({"loc": [lat, lon], "brand": brand})

      len(convenienceStores)
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
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
  - id: folium_09-marker-cluster-detail-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - practice
    title: marker cluster 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: cluster count와 개별 marker 상세가 zoom에 따라 보존되는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_marker_cluster_detail(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_marker_cluster_detail(rows):
            raise NotImplementedError
      solution: |
        def prepare_marker_cluster_detail(rows):
            required = ['longitude', 'latitude', 'category']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'category'
            for row in usable:
                key = "all" if group_field is None else str(row[group_field])
                groups[key] = groups.get(key, 0) + 1
            x_values = [row['longitude'] for row in usable]
            y_values = [row['latitude'] for row in usable]
            return {
                "usableCount": len(usable),
                "excludedCount": len(rows) - len(usable),
                "groupCounts": {key: groups[key] for key in sorted(groups)},
                "xExtent": None if not x_values else [min(x_values), max(x_values)],
                "yExtent": None if not y_values else [min(y_values), max(y_values)],
            }
      hints: *id001
    check:
      id: python.folium.folium_09.marker-cluster-detail-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.folium.folium_09.marker-cluster-detail-data-evidence.mastery.behavior.v1.fixture
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
        entry: prepare_marker_cluster_detail
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - longitude: 127.0
              latitude: 37.5
              category: store
            - longitude: 127.001
              latitude: 37.501
              category: store
            - longitude: 129.0
              latitude: 35.2
              category: warehouse
          expectedReturn:
            usableCount: 3
            excludedCount: 0
            groupCounts:
              store: 2
              warehouse: 1
            xExtent:
            - 127.0
            - 129.0
            yExtent:
            - 35.2
            - 37.501
        - id: handles-empty-data
          arguments:
          - value: []
          expectedReturn:
            usableCount: 0
            excludedCount: 0
            groupCounts: {}
            xExtent: null
            yExtent: null
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: folium_09-marker-cluster-detail-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - folium_09-marker-cluster-detail-data-evidence-mastery
    title: marker cluster 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 수천 개 장비 위치를 cluster count와 category detail을 잃지 않게 탐색한다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_marker_cluster_detail(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_marker_cluster_detail(candidate):
            raise NotImplementedError
      solution: |
        def audit_marker_cluster_detail(candidate):
            expected = {'mark': 'marker-cluster', 'x': 'longitude', 'y': 'latitude', 'group': 'category', 'transforms': ['cluster', 'validate-coordinates'], 'interaction': 'cluster-zoom'}
            errors = []
            for name in ["mark", "x", "y", "group", "transforms", "interaction"]:
                actual = sorted(candidate.get(name, [])) if name == "transforms" else candidate.get(name)
                if actual != expected[name]:
                    errors.append(name)
            if not str(candidate.get("description", "")).strip():
                errors.append("description")
            return {"valid": not errors, "errors": errors, "encoding": expected}
      hints: *id002
    check:
      id: python.folium.folium_09.marker-cluster-detail-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.folium.folium_09.marker-cluster-detail-encoding-transfer.transfer.behavior.v1.fixture
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
        entry: audit_marker_cluster_detail
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: marker-cluster
              x: longitude
              y: latitude
              group: category
              transforms:
              - cluster
              - validate-coordinates
              interaction: cluster-zoom
              description: 수천 개 장비 위치를 cluster count와 category detail을 잃지 않게 탐색한다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: marker-cluster
              x: longitude
              y: latitude
              group: category
              transforms:
              - cluster
              - validate-coordinates
              interaction: cluster-zoom
        - id: reports-misleading-encoding
          arguments:
          - value:
              mark: table
              x: latitude
              y: longitude
              group: null
              transforms: []
              interaction: none
              description: ''
          expectedReturn:
            valid: false
            errors:
            - mark
            - x
            - y
            - group
            - transforms
            - interaction
            - description
            encoding:
              mark: marker-cluster
              x: longitude
              y: latitude
              group: category
              transforms:
              - cluster
              - validate-coordinates
              interaction: cluster-zoom
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: folium_09-marker-cluster-detail-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - folium_09-marker-cluster-detail-encoding-transfer-transfer
    title: marker cluster 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: cluster count와 개별 marker 상세가 zoom에 따라 보존되는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_marker_cluster_detail(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_marker_cluster_detail(situation):
            raise NotImplementedError
      solution: |
        def choose_marker_cluster_detail(situation):
            table = {'many-markers': {'encoding': 'marker cluster', 'evidence': 'cluster and total counts', 'risk': 'hidden categories'}, 'aggregate-density': {'encoding': 'heatmap', 'evidence': 'weight definition', 'risk': 'lost identity'}, 'server-scale': {'encoding': 'tile aggregation', 'evidence': 'viewport query', 'risk': 'client overload'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.folium.folium_09.marker-cluster-detail-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.folium.folium_09.marker-cluster-detail-interpretation-retrieval.retrieval.behavior.v1.fixture
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
        entry: choose_marker_cluster_detail
        cases:
        - id: recalls-many-markers
          arguments:
          - value: many-markers
          expectedReturn:
            encoding: marker cluster
            evidence: cluster and total counts
            risk: hidden categories
        - id: recalls-aggregate-density
          arguments:
          - value: aggregate-density
          expectedReturn:
            encoding: heatmap
            evidence: weight definition
            risk: lost identity
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};