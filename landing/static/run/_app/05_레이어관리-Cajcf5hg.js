var e=`meta:\r
  packages:\r
  - folium\r
  id: folium_05\r
  title: 레이어 관리\r
  order: 5\r
  category: folium\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - folium\r
  - FeatureGroup\r
  - LayerControl\r
  - 레이어\r
  - 그룹\r
  seo:\r
    title: Folium 레이어 관리 - FeatureGroup과 LayerControl\r
    description: Folium으로 레이어를 그룹화하고 토글합니다. FeatureGroup과 LayerControl로 지도 요소를 관리합니다.\r
    keywords:\r
    - folium\r
    - FeatureGroup\r
    - LayerControl\r
    - 레이어\r
    - 그룹화\r
intro:\r
  emoji: 📚\r
  goal: 여러 레이어를 그룹으로 관리하고 토글합니다.\r
  description: 지도에 많은 요소가 있으면 관리가 어렵습니다. FeatureGroup으로 요소를 그룹화하고 LayerControl로 켜고 끌 수 있게 합니다. 카테고리별로\r
    마커를 분류하고 사용자가 원하는 것만 표시합니다.\r
  direction: 레이어 관리에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.\r
  benefits:\r
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.\r
  - 레이어 관리 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. FeatureGrou 처리 실행\r
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 여러 그룹 만들기 결과 검증\r
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.\r
    - label: 레이어 관리 재사용\r
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 지도 시각화 환경\r
      detail: folium 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 레이어 관리 실행\r
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.\r
    - label: 레이어 관리 완료\r
      detail: 검증된 코드를 위치 기반 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: folium과 Codaro를 불러옵니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: import folium\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: import folium\r
    hints:\r
    - 바꿀 지점은 위도/경도 데이터을 만드는 첫 줄과 지도 레이어 구성 줄에서 찾으세요.\r
    - 실행 뒤 마커와 저장 HTML 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 마커와 저장 HTML 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step2_feature_group\r
  title: 2단계. FeatureGroup 생성\r
  structuredPrimary: true\r
  subtitle: FeatureGroup()\r
  goal: 2단계. FeatureGroup 생성에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    FeatureGroup()은 여러 요소를 하나의 그룹으로 묶습니다. 그룹 단위로 표시/숨김을 제어할 수 있습니다.\r
\r
    마커를 그룹에 추가하고(add_to(group)), 그룹을 지도에 추가합니다(add_to(map)).\r
  snippet: |-\r
    seoulCenter = [37.5665, 126.9780]\r
    m1 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    cafeGroup = folium.FeatureGroup(name="카페")\r
\r
    cafes = [\r
        [37.5665, 126.9780],\r
        [37.5700, 126.9750],\r
        [37.5630, 126.9820]\r
    ]\r
\r
    for loc in cafes:\r
        folium.Marker(\r
            location=loc,\r
            icon=folium.Icon(color="cadetblue", icon="cloud")\r
        ).add_to(cafeGroup)\r
\r
    cafeGroup.add_to(m1)\r
\r
    m1\r
  exercise:\r
    prompt: 2단계. FeatureGroup 생성 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      seoulCenter = [37.5665, 126.9780]\r
      m1 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      cafeGroup = folium.FeatureGroup(name="카페")\r
\r
      cafes = [\r
          [37.5665, 126.9780],\r
          [37.5700, 126.9750],\r
          [37.5630, 126.9820]\r
      ]\r
\r
      for loc in cafes:\r
          folium.Marker(\r
              location=loc,\r
              icon=folium.Icon(color="cadetblue", icon="cloud")\r
          ).add_to(cafeGroup)\r
\r
      cafeGroup.add_to(m1)\r
\r
      m1\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. FeatureGroup 생성의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 2단계. FeatureGroup 생성 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step3_multiple_groups\r
  title: 3단계. 여러 그룹 만들기\r
  structuredPrimary: true\r
  subtitle: 카테고리별 분류\r
  goal: 3단계. 여러 그룹 만들기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    여러 FeatureGroup을 만들어 카테고리별로 마커를 분류합니다.\r
\r
    그룹별로 아이콘 색상을 다르게 하면 구분하기 쉽습니다.\r
  snippet: |-\r
    m2 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    restaurantGroup = folium.FeatureGroup(name="음식점")\r
    cafeGroup2 = folium.FeatureGroup(name="카페")\r
\r
    restaurants = [\r
        {"name": "한식당", "loc": [37.5680, 126.9760]},\r
        {"name": "일식당", "loc": [37.5650, 126.9800]},\r
        {"name": "양식당", "loc": [37.5620, 126.9750]}\r
    ]\r
\r
    cafes2 = [\r
        {"name": "스타벅스", "loc": [37.5670, 126.9820]},\r
        {"name": "투썸", "loc": [37.5640, 126.9770]},\r
        {"name": "이디야", "loc": [37.5690, 126.9790]}\r
    ]\r
\r
    for r in restaurants:\r
        folium.Marker(\r
            location=r["loc"],\r
            popup=r["name"],\r
            icon=folium.Icon(color="red", icon="cutlery")\r
        ).add_to(restaurantGroup)\r
\r
    for c in cafes2:\r
        folium.Marker(\r
            location=c["loc"],\r
            popup=c["name"],\r
            icon=folium.Icon(color="blue", icon="cloud")\r
        ).add_to(cafeGroup2)\r
\r
    restaurantGroup.add_to(m2)\r
    cafeGroup2.add_to(m2)\r
\r
    m2\r
  exercise:\r
    prompt: 3단계. 여러 그룹 만들기 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      m2 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      restaurantGroup = folium.FeatureGroup(name="음식점")\r
      cafeGroup2 = folium.FeatureGroup(name="카페")\r
\r
      restaurants = [\r
          {"name": "한식당", "loc": [37.5680, 126.9760]},\r
          {"name": "일식당", "loc": [37.5650, 126.9800]},\r
          {"name": "양식당", "loc": [37.5620, 126.9750]}\r
      ]\r
\r
      cafes2 = [\r
          {"name": "스타벅스", "loc": [37.5670, 126.9820]},\r
          {"name": "투썸", "loc": [37.5640, 126.9770]},\r
          {"name": "이디야", "loc": [37.5690, 126.9790]}\r
      ]\r
\r
      for r in restaurants:\r
          folium.Marker(\r
              location=r["loc"],\r
              popup=r["name"],\r
              icon=folium.Icon(color="red", icon="cutlery")\r
          ).add_to(restaurantGroup)\r
\r
      for c in cafes2:\r
          folium.Marker(\r
              location=c["loc"],\r
              popup=c["name"],\r
              icon=folium.Icon(color="blue", icon="cloud")\r
          ).add_to(cafeGroup2)\r
\r
      restaurantGroup.add_to(m2)\r
      cafeGroup2.add_to(m2)\r
\r
      m2\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 여러 그룹 만들기의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 3단계. 여러 그룹 만들기 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step4_layer_control\r
  title: 4단계. LayerControl 추가\r
  structuredPrimary: true\r
  subtitle: LayerControl()\r
  goal: 4단계. LayerControl 추가에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    LayerControl()을 추가하면 우측 상단에 레이어 토글 버튼이 생깁니다.\r
\r
    우측 상단 아이콘을 클릭하면 레이어 목록이 나타납니다. 체크박스로 레이어를 켜고 끌 수 있습니다.\r
  snippet: |-\r
    m3 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    restaurantGroup2 = folium.FeatureGroup(name="음식점")\r
    cafeGroup3 = folium.FeatureGroup(name="카페")\r
\r
    for r in restaurants:\r
        folium.Marker(\r
            location=r["loc"],\r
            popup=r["name"],\r
            icon=folium.Icon(color="red", icon="cutlery")\r
        ).add_to(restaurantGroup2)\r
\r
    for c in cafes2:\r
        folium.Marker(\r
            location=c["loc"],\r
            popup=c["name"],\r
            icon=folium.Icon(color="blue", icon="cloud")\r
        ).add_to(cafeGroup3)\r
\r
    restaurantGroup2.add_to(m3)\r
    cafeGroup3.add_to(m3)\r
\r
    folium.LayerControl().add_to(m3)\r
\r
    m3\r
  exercise:\r
    prompt: 4단계. LayerControl 추가 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      m3 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      restaurantGroup2 = folium.FeatureGroup(name="음식점")\r
      cafeGroup3 = folium.FeatureGroup(name="카페")\r
\r
      for r in restaurants:\r
          folium.Marker(\r
              location=r["loc"],\r
              popup=r["name"],\r
              icon=folium.Icon(color="red", icon="cutlery")\r
          ).add_to(restaurantGroup2)\r
\r
      for c in cafes2:\r
          folium.Marker(\r
              location=c["loc"],\r
              popup=c["name"],\r
              icon=folium.Icon(color="blue", icon="cloud")\r
          ).add_to(cafeGroup3)\r
\r
      restaurantGroup2.add_to(m3)\r
      cafeGroup3.add_to(m3)\r
\r
      folium.LayerControl().add_to(m3)\r
\r
      m3\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. LayerControl 추가의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 4단계. LayerControl 추가 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step5_overlay_vs_base\r
  title: 5단계. 오버레이 vs 베이스 레이어\r
  structuredPrimary: true\r
  subtitle: 레이어 종류\r
  goal: 5단계. 오버레이 vs 베이스 레이어에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    베이스 레이어는 라디오 버튼(하나만 선택), 오버레이는 체크박스(다중 선택)입니다. FeatureGroup은 기본적으로 오버레이입니다.\r
\r
    타일 레이어는 베이스(라디오), FeatureGroup은 오버레이(체크박스)로 표시됩니다.\r
  snippet: |-\r
    m4 = folium.Map(location=seoulCenter, zoom_start=13, tiles=None)\r
\r
    folium.TileLayer("OpenStreetMap", name="기본 지도").add_to(m4)\r
    folium.TileLayer("CartoDB Positron", name="심플 지도").add_to(m4)\r
\r
    markerGroup = folium.FeatureGroup(name="마커")\r
    folium.Marker(seoulCenter, popup="시청").add_to(markerGroup)\r
    markerGroup.add_to(m4)\r
\r
    circleGroup = folium.FeatureGroup(name="영역")\r
    folium.Circle(seoulCenter, radius=500, color="blue").add_to(circleGroup)\r
    circleGroup.add_to(m4)\r
\r
    folium.LayerControl().add_to(m4)\r
\r
    m4\r
  exercise:\r
    prompt: 5단계. 오버레이 vs 베이스 레이어 예제에서 \`m4\`, \`markerGroup\`, \`circleGroup\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      m4 = folium.Map(location=seoulCenter, zoom_start=13, tiles=None)\r
\r
      folium.TileLayer("OpenStreetMap", name="기본 지도").add_to(m4)\r
      folium.TileLayer("CartoDB Positron", name="심플 지도").add_to(m4)\r
\r
      markerGroup = folium.FeatureGroup(name="마커")\r
      folium.Marker(seoulCenter, popup="시청").add_to(markerGroup)\r
      markerGroup.add_to(m4)\r
\r
      circleGroup = folium.FeatureGroup(name="영역")\r
      folium.Circle(seoulCenter, radius=500, color="blue").add_to(circleGroup)\r
      circleGroup.add_to(m4)\r
\r
      folium.LayerControl().add_to(m4)\r
\r
      m4\r
    hints:\r
    - 바꿀 지점은 \`m4 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`m4\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 오버레이 vs 베이스 레이어에서 \`m4\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 오버레이 vs 베이스 레이어 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_show_option\r
  title: 6단계. 기본 표시 설정\r
  structuredPrimary: true\r
  subtitle: show 파라미터\r
  goal: 6단계. 기본 표시 설정에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    show=False로 설정하면 처음에는 숨겨진 상태로 시작합니다.\r
\r
    선택적 정보(주차장, 화장실 등)는 show=False로 숨겨두면 지도가 깔끔합니다.\r
  snippet: |-\r
    m5 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    visibleGroup = folium.FeatureGroup(name="기본 표시", show=True)\r
    hiddenGroup = folium.FeatureGroup(name="숨김 시작", show=False)\r
\r
    folium.Marker(\r
        [37.5665, 126.9750],\r
        popup="항상 보임",\r
        icon=folium.Icon(color="green")\r
    ).add_to(visibleGroup)\r
\r
    folium.Marker(\r
        [37.5665, 126.9810],\r
        popup="레이어 켜야 보임",\r
        icon=folium.Icon(color="gray")\r
    ).add_to(hiddenGroup)\r
\r
    visibleGroup.add_to(m5)\r
    hiddenGroup.add_to(m5)\r
\r
    folium.LayerControl().add_to(m5)\r
\r
    m5\r
  exercise:\r
    prompt: 6단계. 기본 표시 설정 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m5 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      visibleGroup = folium.FeatureGroup(name="기본 표시", show=True)\r
      hiddenGroup = folium.FeatureGroup(name="숨김 시작", show=False)\r
\r
      folium.Marker(\r
          [37.5665, 126.9750],\r
          popup="항상 보임",\r
          icon=folium.Icon(color="green")\r
      ).add_to(visibleGroup)\r
\r
      folium.Marker(\r
          [37.5665, 126.9810],\r
          popup="레이어 켜야 보임",\r
          icon=folium.Icon(color="gray")\r
      ).add_to(hiddenGroup)\r
\r
      visibleGroup.add_to(m5)\r
      hiddenGroup.add_to(m5)\r
\r
      folium.LayerControl().add_to(m5)\r
\r
      m5\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 기본 표시 설정에서 \`m5\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 기본 표시 설정 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step7_shapes_grouping\r
  title: 7단계. 도형 그룹화\r
  structuredPrimary: true\r
  subtitle: 도형별 레이어\r
  goal: 7단계. 도형 그룹화에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    마커뿐 아니라 원, 폴리곤 등 모든 요소를 그룹에 넣을 수 있습니다.\r
\r
    마커와 영역을 별도 그룹으로 분리하면 사용자가 원하는 정보만 볼 수 있습니다.\r
  snippet: |-\r
    m6 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    spotGroup = folium.FeatureGroup(name="관광지")\r
    areaGroup = folium.FeatureGroup(name="관광 구역")\r
\r
    spots = [\r
        {"name": "경복궁", "loc": [37.5796, 126.9770]},\r
        {"name": "명동", "loc": [37.5636, 126.9869]},\r
        {"name": "남산타워", "loc": [37.5512, 126.9882]}\r
    ]\r
\r
    for spot in spots:\r
        folium.Marker(\r
            location=spot["loc"],\r
            popup=spot["name"],\r
            icon=folium.Icon(color="red", icon="star")\r
        ).add_to(spotGroup)\r
\r
        folium.Circle(\r
            location=spot["loc"],\r
            radius=300,\r
            color="orange",\r
            fill=True,\r
            fill_opacity=0.2\r
        ).add_to(areaGroup)\r
\r
    spotGroup.add_to(m6)\r
    areaGroup.add_to(m6)\r
\r
    folium.LayerControl().add_to(m6)\r
\r
    m6\r
  exercise:\r
    prompt: 7단계. 도형 그룹화 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      m6 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      spotGroup = folium.FeatureGroup(name="관광지")\r
      areaGroup = folium.FeatureGroup(name="관광 구역")\r
\r
      spots = [\r
          {"name": "경복궁", "loc": [37.5796, 126.9770]},\r
          {"name": "명동", "loc": [37.5636, 126.9869]},\r
          {"name": "남산타워", "loc": [37.5512, 126.9882]}\r
      ]\r
\r
      for spot in spots:\r
          folium.Marker(\r
              location=spot["loc"],\r
              popup=spot["name"],\r
              icon=folium.Icon(color="red", icon="star")\r
          ).add_to(spotGroup)\r
\r
          folium.Circle(\r
              location=spot["loc"],\r
              radius=300,\r
              color="orange",\r
              fill=True,\r
              fill_opacity=0.2\r
          ).add_to(areaGroup)\r
\r
      spotGroup.add_to(m6)\r
      areaGroup.add_to(m6)\r
\r
      folium.LayerControl().add_to(m6)\r
\r
      m6\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 도형 그룹화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 7단계. 도형 그룹화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step8_collapsed\r
  title: 8단계. 컨트롤 옵션\r
  structuredPrimary: true\r
  subtitle: collapsed\r
  goal: 8단계. 컨트롤 옵션에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    LayerControl의 collapsed 옵션으로 기본 펼침/접힘 상태를 설정합니다.\r
\r
    collapsed=False면 처음부터 레이어 목록이 펼쳐져 있습니다. 레이어가 중요할 때 사용합니다.\r
  snippet: |-\r
    m7 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    group1 = folium.FeatureGroup(name="그룹1")\r
    group2 = folium.FeatureGroup(name="그룹2")\r
\r
    folium.Marker([37.5665, 126.9750]).add_to(group1)\r
    folium.Marker([37.5665, 126.9810]).add_to(group2)\r
\r
    group1.add_to(m7)\r
    group2.add_to(m7)\r
\r
    folium.LayerControl(collapsed=False).add_to(m7)\r
\r
    m7\r
  exercise:\r
    prompt: 8단계. 컨트롤 옵션 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m7 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      group1 = folium.FeatureGroup(name="그룹1")\r
      group2 = folium.FeatureGroup(name="그룹2")\r
\r
      folium.Marker([37.5665, 126.9750]).add_to(group1)\r
      folium.Marker([37.5665, 126.9810]).add_to(group2)\r
\r
      group1.add_to(m7)\r
      group2.add_to(m7)\r
\r
      folium.LayerControl(collapsed=False).add_to(m7)\r
\r
      m7\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 컨트롤 옵션에서 \`m7\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 컨트롤 옵션 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_complex_example\r
  title: 9단계. 복잡한 레이어 구조\r
  structuredPrimary: true\r
  subtitle: 다중 카테고리\r
  goal: 9단계. 복잡한 레이어 구조에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    여러 카테고리와 타일을 조합한 복잡한 레이어 구조를 만듭니다.\r
\r
    베이스 레이어(타일)와 오버레이(마커 그룹)를 조합하면 유연한 지도를 만들 수 있습니다.\r
  snippet: |-\r
    m8 = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)\r
\r
    folium.TileLayer("CartoDB Positron", name="밝은 지도").add_to(m8)\r
    folium.TileLayer("CartoDB Dark_Matter", name="어두운 지도").add_to(m8)\r
\r
    historyGroup = folium.FeatureGroup(name="역사 유적")\r
    shoppingGroup = folium.FeatureGroup(name="쇼핑")\r
    foodGroup = folium.FeatureGroup(name="맛집", show=False)\r
\r
    historySites = [\r
        {"name": "경복궁", "loc": [37.5796, 126.9770]},\r
        {"name": "창덕궁", "loc": [37.5794, 126.9910]}\r
    ]\r
\r
    shoppingSites = [\r
        {"name": "명동", "loc": [37.5636, 126.9869]},\r
        {"name": "동대문", "loc": [37.5711, 127.0095]}\r
    ]\r
\r
    foodSites = [\r
        {"name": "광장시장", "loc": [37.5701, 126.9995]},\r
        {"name": "을지로 골목", "loc": [37.5660, 126.9910]}\r
    ]\r
\r
    for site in historySites:\r
        folium.Marker(\r
            location=site["loc"],\r
            popup=site["name"],\r
            icon=folium.Icon(color="purple", icon="tower")\r
        ).add_to(historyGroup)\r
\r
    for site in shoppingSites:\r
        folium.Marker(\r
            location=site["loc"],\r
            popup=site["name"],\r
            icon=folium.Icon(color="pink", icon="shopping-cart")\r
        ).add_to(shoppingGroup)\r
\r
    for site in foodSites:\r
        folium.Marker(\r
            location=site["loc"],\r
            popup=site["name"],\r
            icon=folium.Icon(color="orange", icon="cutlery")\r
        ).add_to(foodGroup)\r
\r
    historyGroup.add_to(m8)\r
    shoppingGroup.add_to(m8)\r
    foodGroup.add_to(m8)\r
\r
    folium.LayerControl().add_to(m8)\r
\r
    m8\r
  exercise:\r
    prompt: 9단계. 복잡한 레이어 구조 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      m8 = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)\r
\r
      folium.TileLayer("CartoDB Positron", name="밝은 지도").add_to(m8)\r
      folium.TileLayer("CartoDB Dark_Matter", name="어두운 지도").add_to(m8)\r
\r
      historyGroup = folium.FeatureGroup(name="역사 유적")\r
      shoppingGroup = folium.FeatureGroup(name="쇼핑")\r
      foodGroup = folium.FeatureGroup(name="맛집", show=False)\r
\r
      historySites = [\r
          {"name": "경복궁", "loc": [37.5796, 126.9770]},\r
          {"name": "창덕궁", "loc": [37.5794, 126.9910]}\r
      ]\r
\r
      shoppingSites = [\r
          {"name": "명동", "loc": [37.5636, 126.9869]},\r
          {"name": "동대문", "loc": [37.5711, 127.0095]}\r
      ]\r
\r
      foodSites = [\r
          {"name": "광장시장", "loc": [37.5701, 126.9995]},\r
          {"name": "을지로 골목", "loc": [37.5660, 126.9910]}\r
      ]\r
\r
      for site in historySites:\r
          folium.Marker(\r
              location=site["loc"],\r
              popup=site["name"],\r
              icon=folium.Icon(color="purple", icon="tower")\r
          ).add_to(historyGroup)\r
\r
      for site in shoppingSites:\r
          folium.Marker(\r
              location=site["loc"],\r
              popup=site["name"],\r
              icon=folium.Icon(color="pink", icon="shopping-cart")\r
          ).add_to(shoppingGroup)\r
\r
      for site in foodSites:\r
          folium.Marker(\r
              location=site["loc"],\r
              popup=site["name"],\r
              icon=folium.Icon(color="orange", icon="cutlery")\r
          ).add_to(foodGroup)\r
\r
      historyGroup.add_to(m8)\r
      shoppingGroup.add_to(m8)\r
      foodGroup.add_to(m8)\r
\r
      folium.LayerControl().add_to(m8)\r
\r
      m8\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 복잡한 레이어 구조의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 복잡한 레이어 구조 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_complete\r
  title: 10단계. 완성 예제\r
  structuredPrimary: true\r
  subtitle: 관광지 필터 지도\r
  goal: 10단계. 완성 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 카테고리별 필터 기능이 있는 서울 관광 지도를 완성합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    filterMap = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)\r
\r
    folium.TileLayer("CartoDB Positron", name="기본").add_to(filterMap)\r
    folium.TileLayer("OpenStreetMap", name="도로").add_to(filterMap)\r
\r
    palaceGroup = folium.FeatureGroup(name="궁궐")\r
    parkGroup = folium.FeatureGroup(name="공원")\r
    stationGroup = folium.FeatureGroup(name="지하철역", show=False)\r
\r
    palaces = [\r
        {"name": "경복궁", "loc": [37.5796, 126.9770]},\r
        {"name": "창덕궁", "loc": [37.5794, 126.9910]},\r
        {"name": "덕수궁", "loc": [37.5658, 126.9750]}\r
    ]\r
\r
    parks = [\r
        {"name": "남산공원", "loc": [37.5512, 126.9882]},\r
        {"name": "올림픽공원", "loc": [37.5200, 127.1212]},\r
        {"name": "한강공원", "loc": [37.5283, 126.9340]}\r
    ]\r
\r
    stations = [\r
        {"name": "서울역", "loc": [37.5547, 126.9707]},\r
        {"name": "강남역", "loc": [37.4979, 127.0276]},\r
        {"name": "홍대입구역", "loc": [37.5563, 126.9236]}\r
    ]\r
\r
    for p in palaces:\r
        folium.Marker(\r
            location=p["loc"],\r
            popup=f"<b>{p['name']}</b>",\r
            tooltip=p["name"],\r
            icon=folium.Icon(color="red", icon="star")\r
        ).add_to(palaceGroup)\r
\r
    for p in parks:\r
        folium.Marker(\r
            location=p["loc"],\r
            popup=f"<b>{p['name']}</b>",\r
            tooltip=p["name"],\r
            icon=folium.Icon(color="green", icon="tree-deciduous")\r
        ).add_to(parkGroup)\r
\r
    for s in stations:\r
        folium.CircleMarker(\r
            location=s["loc"],\r
            radius=8,\r
            color="blue",\r
            fill=True,\r
            popup=s["name"]\r
        ).add_to(stationGroup)\r
\r
    palaceGroup.add_to(filterMap)\r
    parkGroup.add_to(filterMap)\r
    stationGroup.add_to(filterMap)\r
\r
    folium.LayerControl(collapsed=False).add_to(filterMap)\r
\r
    filterMap\r
  exercise:\r
    prompt: 10단계. 완성 예제 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      filterMap = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)\r
\r
      folium.TileLayer("CartoDB Positron", name="기본").add_to(filterMap)\r
      folium.TileLayer("OpenStreetMap", name="도로").add_to(filterMap)\r
\r
      palaceGroup = folium.FeatureGroup(name="궁궐")\r
      parkGroup = folium.FeatureGroup(name="공원")\r
      stationGroup = folium.FeatureGroup(name="지하철역", show=False)\r
\r
      palaces = [\r
          {"name": "경복궁", "loc": [37.5796, 126.9770]},\r
          {"name": "창덕궁", "loc": [37.5794, 126.9910]},\r
          {"name": "덕수궁", "loc": [37.5658, 126.9750]}\r
      ]\r
\r
      parks = [\r
          {"name": "남산공원", "loc": [37.5512, 126.9882]},\r
          {"name": "올림픽공원", "loc": [37.5200, 127.1212]},\r
          {"name": "한강공원", "loc": [37.5283, 126.9340]}\r
      ]\r
\r
      stations = [\r
          {"name": "서울역", "loc": [37.5547, 126.9707]},\r
          {"name": "강남역", "loc": [37.4979, 127.0276]},\r
          {"name": "홍대입구역", "loc": [37.5563, 126.9236]}\r
      ]\r
\r
      for p in palaces:\r
          folium.Marker(\r
              location=p["loc"],\r
              popup=f"<b>{p['name']}</b>",\r
              tooltip=p["name"],\r
              icon=folium.Icon(color="red", icon="star")\r
          ).add_to(palaceGroup)\r
\r
      for p in parks:\r
          folium.Marker(\r
              location=p["loc"],\r
              popup=f"<b>{p['name']}</b>",\r
              tooltip=p["name"],\r
              icon=folium.Icon(color="green", icon="tree-deciduous")\r
          ).add_to(parkGroup)\r
\r
      for s in stations:\r
          folium.CircleMarker(\r
              location=s["loc"],\r
              radius=8,\r
              color="blue",\r
              fill=True,\r
              popup=s["name"]\r
          ).add_to(stationGroup)\r
\r
      palaceGroup.add_to(filterMap)\r
      parkGroup.add_to(filterMap)\r
      stationGroup.add_to(filterMap)\r
\r
      folium.LayerControl(collapsed=False).add_to(filterMap)\r
\r
      filterMap\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 완성 예제의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 완성 예제 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step11_workflow\r
  title: 11단계. 운영 레이어 검증\r
  structuredPrimary: true\r
  subtitle: 카테고리 누락과 표시 상태 확인\r
  goal: 11단계. 운영 레이어 검증에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 지도 레이어는 좌표 데이터와 표시 상태를 함께 확인해야 운영 지도에서 누락이나 과표시를 줄일 수 있습니다.\r
  explanation: |-\r
    레이어 지도는 정보가 많아질수록 누락과 과표시가 생기기 쉽습니다. 업무용 운영 지도에서는 시설, 리스크, 고객 접점을 분리하고, 어떤 레이어가 기본으로 보일지 예측한 뒤 HTML 렌더 결과로 검증합니다.\r
\r
    레이어 관리는 지도 꾸미기가 아니라 정보 과밀도를 제어하는 설계입니다. 기본 표시, 숨김 표시, 미분류 오류를 코드로 검증해야 운영 지도가 믿을 만해집니다.\r
  snippet: |-\r
    operationSites = [\r
        {"name": "강남 고객센터", "category": "support", "loc": [37.4979, 127.0276]},\r
        {"name": "홍대 체험존", "category": "showroom", "loc": [37.5563, 126.9236]},\r
        {"name": "여의도 장애 접수", "category": "risk", "loc": [37.5219, 126.9245]},\r
        {"name": "종로 교육장", "category": "training", "loc": [37.5796, 126.9770]},\r
    ]\r
\r
    layerConfig = {\r
        "support": {"label": "고객센터", "color": "blue", "show": True},\r
        "showroom": {"label": "체험존", "color": "green", "show": True},\r
        "training": {"label": "교육장", "color": "purple", "show": True},\r
        "risk": {"label": "리스크", "color": "red", "show": False},\r
    }\r
\r
    sorted(layerConfig)\r
  exercise:\r
    prompt: 11단계. 운영 레이어 검증 예제에서 사이트 카테고리, 좌표, 기본 표시 설정을 바꾸고 레이어 구성이 달라지는지 확인하세요.\r
    starterCode: |-\r
      operationSites = [\r
          {"name": "강남 고객센터", "category": "support", "loc": [37.4979, 127.0276]},\r
          {"name": "홍대 체험존", "category": "showroom", "loc": [37.5563, 126.9236]},\r
          {"name": "여의도 장애 접수", "category": "risk", "loc": [37.5219, 126.9245]},\r
          {"name": "종로 교육장", "category": "training", "loc": [37.5796, 126.9770]},\r
      ]\r
\r
      layerConfig = {\r
          "support": {"label": "고객센터", "color": "blue", "show": True},\r
          "showroom": {"label": "체험존", "color": "green", "show": True},\r
          "training": {"label": "교육장", "color": "purple", "show": True},\r
          "risk": {"label": "리스크", "color": "red", "show": False},\r
      }\r
\r
      sorted(layerConfig)\r
    hints:\r
    - 바꿀 지점은 \`operationSites\`의 category/loc, \`layerConfig\`의 label/color/show 값입니다.\r
    - 실행 뒤 분류 누락 여부와 기본 표시 레이어가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 운영 레이어 검증의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 운영 레이어 검증의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 레이어 관리\r
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 지금까지 배운 내용을 활용하여 미션을 수행해봅시다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import folium\r
    toilets = [\r
        {"name": "시청 화장실", "loc": [37.5665, 126.9780]},\r
        {"name": "광화문 화장실", "loc": [37.5725, 126.9768]}\r
    ]\r
    parking = [\r
        {"name": "시청 주차장", "loc": [37.5655, 126.9790]},\r
        {"name": "세종로 주차장", "loc": [37.5710, 126.9760]}\r
    ]\r
    data = {"toilets": toilets, "parking": parking}\r
    data\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import folium\r
      toilets = [\r
          {"name": "시청 화장실", "loc": [37.5665, 126.9780]},\r
          {"name": "광화문 화장실", "loc": [37.5725, 126.9768]}\r
      ]\r
      parking = [\r
          {"name": "시청 주차장", "loc": [37.5655, 126.9790]},\r
          {"name": "세종로 주차장", "loc": [37.5710, 126.9760]}\r
      ]\r
      data = {"toilets": toilets, "parking": parking}\r
      data\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`toilets\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
`;export{e as default};