var e=`meta:\r
  packages:\r
  - folium\r
  id: folium_01\r
  title: 첫지도만들기\r
  order: 1\r
  category: folium\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - folium\r
  - Map\r
  - Marker\r
  - 지도\r
  - 마커\r
  seo:\r
    title: Folium 첫걸음 - 지도 생성과 마커 추가\r
    description: Folium으로 첫 지도를 만듭니다. Map()으로 지도를 생성하고 Marker()로 위치를 표시합니다.\r
    keywords:\r
    - folium\r
    - Map\r
    - Marker\r
    - 지도\r
    - 마커\r
    - popup\r
intro:\r
  emoji: 📍\r
  goal: 기본 지도를 생성하고 마커를 추가합니다.\r
  description: Folium의 기본인 지도 생성을 배웁니다. Map()으로 지도를 만들고 location과 zoom_start로 초기 화면을 설정합니다. Marker()로\r
    특정 위치에 점을 찍고 popup으로 정보를 표시합니다.\r
  direction: 첫지도만들기에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.\r
  benefits:\r
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.\r
  - 첫지도만들기 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기본 지도 생성 처리 실행\r
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 줌 레벨 이해 결과 검증\r
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.\r
    - label: 첫지도만들기 재사용\r
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 지도 시각화 환경\r
      detail: folium 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 첫지도만들기 실행\r
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.\r
    - label: 첫지도만들기 완료\r
      detail: 검증된 코드를 위치 기반 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: folium과 Codaro를 불러옵니다. Codaro는 지도를 화면에 표시할 때 사용합니다.\r
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
- id: step2_basic_map\r
  title: 2단계. 기본 지도 생성\r
  structuredPrimary: true\r
  subtitle: Map()\r
  goal: 2단계. 기본 지도 생성에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Map()으로 지도를 생성합니다. location은 지도 중심 좌표[위도, 경도]이고, zoom_start는 초기 확대 레벨입니다.\r
\r
    zoom_start는 1(세계)~18(건물) 범위입니다. 도시는 12, 동네는 15, 건물은 17 정도가 적당합니다.\r
  snippet: |-\r
    seoulCenter = [37.5665, 126.9780]\r
    m1 = folium.Map(location=seoulCenter, zoom_start=12)\r
    m1\r
  exercise:\r
    prompt: 2단계. 기본 지도 생성 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      seoulCenter = [37.5665, 126.9780]\r
      m1 = folium.Map(location=seoulCenter, zoom_start=12)\r
      m1\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 기본 지도 생성에서 \`seoulCenter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 기본 지도 생성 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_zoom_levels\r
  title: 3단계. 줌 레벨 이해\r
  structuredPrimary: true\r
  subtitle: zoom_start 설정\r
  goal: 3단계. 줌 레벨 이해에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    줌 레벨에 따라 지도의 상세도가 달라집니다. 용도에 맞는 줌 레벨을 선택하세요.\r
\r
    마우스 휠이나 +/- 버튼으로 줌을 조절할 수 있습니다. zoom_start는 초기값일 뿐입니다.\r
  snippet: |-\r
    m2 = folium.Map(location=seoulCenter, zoom_start=10)\r
    m2\r
  exercise:\r
    prompt: 3단계. 줌 레벨 이해 예제에서 \`m2\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m2 = folium.Map(location=seoulCenter, zoom_start=10)\r
      m2\r
    hints:\r
    - 바꿀 지점은 \`m2 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`m2\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 줌 레벨 이해에서 \`m2\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 줌 레벨 이해 실행 뒤 \`m2\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step4_marker\r
  title: 4단계. 마커 추가\r
  structuredPrimary: true\r
  subtitle: Marker()\r
  goal: 4단계. 마커 추가에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Marker()로 특정 위치에 마커를 추가합니다. add_to(지도)로 지도에 붙입니다.\r
\r
    popup은 마커를 클릭하면 나타나는 말풍선입니다. 문자열이나 HTML을 넣을 수 있습니다.\r
  snippet: |-\r
    m4 = folium.Map(location=seoulCenter, zoom_start=14)\r
    folium.Marker(location=seoulCenter).add_to(m4)\r
    m4\r
  exercise:\r
    prompt: 4단계. 마커 추가 예제에서 \`m4\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m4 = folium.Map(location=seoulCenter, zoom_start=14)\r
      folium.Marker(location=seoulCenter).add_to(m4)\r
      m4\r
    hints:\r
    - 바꿀 지점은 \`m4 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`m4\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 마커 추가에서 \`m4\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 마커 추가 실행 뒤 \`m4\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step5_multiple_markers\r
  title: 5단계. 여러 마커 추가\r
  structuredPrimary: true\r
  subtitle: 반복문 활용\r
  goal: 5단계. 여러 마커 추가에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    여러 위치에 마커를 추가합니다. 좌표와 이름 리스트를 만들고 반복문으로 추가합니다.\r
\r
    딕셔너리 리스트로 데이터를 관리하면 확장하기 쉽습니다. 나중에 주소, 카테고리 등을 추가할 수 있습니다.\r
  snippet: |-\r
    places = [\r
        {"name": "서울시청", "loc": [37.5665, 126.9780]},\r
        {"name": "강남역", "loc": [37.4979, 127.0276]},\r
        {"name": "홍대입구", "loc": [37.5563, 126.9236]},\r
        {"name": "명동", "loc": [37.5636, 126.9869]},\r
        {"name": "여의도", "loc": [37.5219, 126.9245]}\r
    ]\r
\r
    m6 = folium.Map(location=seoulCenter, zoom_start=12)\r
    for place in places:\r
        folium.Marker(\r
            location=place["loc"],\r
            popup=place["name"]\r
        ).add_to(m6)\r
    m6\r
  exercise:\r
    prompt: 5단계. 여러 마커 추가 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      places = [\r
          {"name": "서울시청", "loc": [37.5665, 126.9780]},\r
          {"name": "강남역", "loc": [37.4979, 127.0276]},\r
          {"name": "홍대입구", "loc": [37.5563, 126.9236]},\r
          {"name": "명동", "loc": [37.5636, 126.9869]},\r
          {"name": "여의도", "loc": [37.5219, 126.9245]}\r
      ]\r
\r
      m6 = folium.Map(location=seoulCenter, zoom_start=12)\r
      for place in places:\r
          folium.Marker(\r
              location=place["loc"],\r
              popup=place["name"]\r
          ).add_to(m6)\r
      m6\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 여러 마커 추가의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 5단계. 여러 마커 추가 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step6_tooltip\r
  title: 6단계. 툴팁 추가\r
  structuredPrimary: true\r
  subtitle: tooltip vs popup\r
  goal: 6단계. 툴팁 추가에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    tooltip은 마우스를 올리면 나타나고, popup은 클릭해야 나타납니다. 둘 다 사용할 수 있습니다.\r
\r
    tooltip은 빠른 미리보기, popup은 상세 정보에 적합합니다. 보통 tooltip에 이름, popup에 상세 정보를 넣습니다.\r
  snippet: |-\r
    m7 = folium.Map(location=seoulCenter, zoom_start=14)\r
    folium.Marker(\r
        location=seoulCenter,\r
        popup="클릭하면 보여요",\r
        tooltip="마우스 올리면 보여요"\r
    ).add_to(m7)\r
    m7\r
  exercise:\r
    prompt: 6단계. 툴팁 추가 예제에서 \`m7\`, \`location\`, \`popup\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      m7 = folium.Map(location=seoulCenter, zoom_start=14)\r
      folium.Marker(\r
          location=seoulCenter,\r
          popup="클릭하면 보여요",\r
          tooltip="마우스 올리면 보여요"\r
      ).add_to(m7)\r
      m7\r
    hints:\r
    - 바꿀 지점은 \`m7 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`m7\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 툴팁 추가에서 \`m7\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 툴팁 추가 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step7_marker_color\r
  title: 7단계. 마커 색상 변경\r
  structuredPrimary: true\r
  subtitle: icon 파라미터\r
  goal: 7단계. 마커 색상 변경에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    Icon()으로 마커 색상과 아이콘을 변경합니다. 기본 색상은 blue입니다.\r
\r
    사용 가능한 색상은 red, blue, green, purple, orange, darkred, lightred, beige, darkblue, darkgreen, cadetblue, darkpurple, white, pink, lightblue, lightgreen, gray, black, lightgray 입니다.\r
  tips:\r
  - 사용 가능한 색상은 red, blue, green, purple, orange, darkred, lightred, beige, darkblue, darkgreen, cadetblue,\r
    darkpurple, white, pink, lightblue, lightgreen, gray, black, lightgray 입니다.\r
  snippet: |-\r
    m8 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    colors = ["red", "blue", "green", "purple", "orange"]\r
    for i, place in enumerate(places):\r
        folium.Marker(\r
            location=place["loc"],\r
            popup=place["name"],\r
            icon=folium.Icon(color=colors[i % len(colors)])\r
        ).add_to(m8)\r
    m8\r
  exercise:\r
    prompt: 7단계. 마커 색상 변경 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      m8 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      colors = ["red", "blue", "green", "purple", "orange"]\r
      for i, place in enumerate(places):\r
          folium.Marker(\r
              location=place["loc"],\r
              popup=place["name"],\r
              icon=folium.Icon(color=colors[i % len(colors)])\r
          ).add_to(m8)\r
      m8\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 마커 색상 변경의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 7단계. 마커 색상 변경 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step8_icon_type\r
  title: 8단계. 아이콘 모양 변경\r
  structuredPrimary: true\r
  subtitle: icon 파라미터\r
  goal: 8단계. 아이콘 모양 변경에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Icon()의 icon 파라미터로 마커 안의 아이콘을 변경합니다. Font Awesome과 Glyphicon 아이콘을 사용할 수 있습니다.\r
\r
    자주 쓰는 아이콘은 home, star, heart, cloud, info-sign, music, camera, user 등입니다.\r
  snippet: |-\r
    m9 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    folium.Marker(\r
        location=[37.5665, 126.9780],\r
        popup="시청",\r
        icon=folium.Icon(color="red", icon="info-sign")\r
    ).add_to(m9)\r
\r
    folium.Marker(\r
        location=[37.4979, 127.0276],\r
        popup="강남역",\r
        icon=folium.Icon(color="blue", icon="star")\r
    ).add_to(m9)\r
\r
    folium.Marker(\r
        location=[37.5563, 126.9236],\r
        popup="홍대",\r
        icon=folium.Icon(color="green", icon="music")\r
    ).add_to(m9)\r
\r
    m9\r
  exercise:\r
    prompt: 8단계. 아이콘 모양 변경 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m9 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      folium.Marker(\r
          location=[37.5665, 126.9780],\r
          popup="시청",\r
          icon=folium.Icon(color="red", icon="info-sign")\r
      ).add_to(m9)\r
\r
      folium.Marker(\r
          location=[37.4979, 127.0276],\r
          popup="강남역",\r
          icon=folium.Icon(color="blue", icon="star")\r
      ).add_to(m9)\r
\r
      folium.Marker(\r
          location=[37.5563, 126.9236],\r
          popup="홍대",\r
          icon=folium.Icon(color="green", icon="music")\r
      ).add_to(m9)\r
\r
      m9\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 아이콘 모양 변경에서 \`m9\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 아이콘 모양 변경 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_fit_bounds\r
  title: 9단계. 자동 줌 맞추기\r
  structuredPrimary: true\r
  subtitle: fit_bounds()\r
  goal: 9단계. 자동 줌 맞추기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    모든 마커가 보이도록 자동으로 줌을 조절합니다. fit_bounds()에 좌표 범위를 전달합니다.\r
\r
    fit_bounds()는 [[남서 좌표], [북동 좌표]] 또는 좌표 리스트를 받습니다. 모든 마커가 화면에 들어오도록 줌을 조절합니다.\r
  snippet: |-\r
    m10 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
    allLocs = [place["loc"] for place in places]\r
    for place in places:\r
        folium.Marker(\r
            location=place["loc"],\r
            popup=place["name"]\r
        ).add_to(m10)\r
\r
    m10.fit_bounds(allLocs)\r
    m10\r
  exercise:\r
    prompt: 9단계. 자동 줌 맞추기 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      m10 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
      allLocs = [place["loc"] for place in places]\r
      for place in places:\r
          folium.Marker(\r
              location=place["loc"],\r
              popup=place["name"]\r
          ).add_to(m10)\r
\r
      m10.fit_bounds(allLocs)\r
      m10\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 자동 줌 맞추기의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 자동 줌 맞추기 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_complete\r
  title: 10단계. 완성 예제\r
  structuredPrimary: true\r
  subtitle: 서울 관광지 지도\r
  goal: 10단계. 완성 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 지금까지 배운 내용을 종합하여 서울 관광지 지도를 완성합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    tourSpots = [\r
        {"name": "경복궁", "loc": [37.5796, 126.9770], "color": "red"},\r
        {"name": "남산타워", "loc": [37.5512, 126.9882], "color": "orange"},\r
        {"name": "명동", "loc": [37.5636, 126.9869], "color": "blue"},\r
        {"name": "동대문", "loc": [37.5711, 127.0095], "color": "green"},\r
        {"name": "이태원", "loc": [37.5340, 126.9948], "color": "purple"}\r
    ]\r
\r
    tourMap = folium.Map(location=[37.56, 126.99], zoom_start=13)\r
\r
    for spot in tourSpots:\r
        folium.Marker(\r
            location=spot["loc"],\r
            popup=f"<b>{spot['name']}</b>",\r
            tooltip=spot["name"],\r
            icon=folium.Icon(color=spot["color"], icon="star")\r
        ).add_to(tourMap)\r
\r
    tourMap\r
  exercise:\r
    prompt: 10단계. 완성 예제 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      tourSpots = [\r
          {"name": "경복궁", "loc": [37.5796, 126.9770], "color": "red"},\r
          {"name": "남산타워", "loc": [37.5512, 126.9882], "color": "orange"},\r
          {"name": "명동", "loc": [37.5636, 126.9869], "color": "blue"},\r
          {"name": "동대문", "loc": [37.5711, 127.0095], "color": "green"},\r
          {"name": "이태원", "loc": [37.5340, 126.9948], "color": "purple"}\r
      ]\r
\r
      tourMap = folium.Map(location=[37.56, 126.99], zoom_start=13)\r
\r
      for spot in tourSpots:\r
          folium.Marker(\r
              location=spot["loc"],\r
              popup=f"<b>{spot['name']}</b>",\r
              tooltip=spot["name"],\r
              icon=folium.Icon(color=spot["color"], icon="star")\r
          ).add_to(tourMap)\r
\r
      tourMap\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 완성 예제의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 완성 예제 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step11_workflow\r
  title: 11단계. 실무 위치 지도 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 확인 → 검증\r
  goal: 11단계. 실무 위치 지도 검증에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    업무 지도는 마커가 보이는지만 확인하면 부족합니다. 좌표가 한국 범위 안에 있는지, 모든 지점 이름이 지도 HTML에 들어갔는지, 새 지점을 추가했을 때 중심과 경계가 어떻게 달라지는지 예측하고 검증해야 합니다.\r
\r
    Folium 지도는 눈으로 보는 결과물이라 더더욱 데이터 검증이 필요합니다. 좌표 범위, 마커 수, 이름 렌더링을 코드로 확인하면 실무 오류를 빠르게 줄일 수 있습니다.\r
  snippet: |-\r
    branchSites = [\r
        {"name": "강남 상담센터", "loc": [37.4979, 127.0276], "priority": "high"},\r
        {"name": "홍대 체험존", "loc": [37.5563, 126.9236], "priority": "medium"},\r
        {"name": "여의도 파트너센터", "loc": [37.5219, 126.9245], "priority": "high"},\r
    ]\r
\r
    def validateKoreaCoordinate(site):\r
        lat, lon = site["loc"]\r
        if not (33 <= lat <= 39 and 124 <= lon <= 132):\r
            raise ValueError(f"좌표 범위 오류: {site['name']}")\r
        return True\r
\r
    validationResult = [validateKoreaCoordinate(site) for site in branchSites]\r
    validationResult\r
  exercise:\r
    prompt: 11단계. 실무 위치 지도 검증 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      branchSites = [\r
          {"name": "강남 상담센터", "loc": [37.4979, 127.0276], "priority": "high"},\r
          {"name": "홍대 체험존", "loc": [37.5563, 126.9236], "priority": "medium"},\r
          {"name": "여의도 파트너센터", "loc": [37.5219, 126.9245], "priority": "high"},\r
      ]\r
\r
      def validateKoreaCoordinate(site):\r
          lat, lon = site["loc"]\r
          if not (33 <= lat <= 39 and 124 <= lon <= 132):\r
              raise ValueError(f"좌표 범위 오류: {site['name']}")\r
          return True\r
\r
      validationResult = [validateKoreaCoordinate(site) for site in branchSites]\r
      validationResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 11단계. 실무 위치 지도 검증의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 11단계. 실무 위치 지도 검증 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 지도 만들기\r
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 내용을 활용하여 미션을 수행해봅시다.\r
\r
    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  snippet: |-\r
    import folium\r
    cafes = [\r
        {"name": "스타벅스 시청점", "loc": [37.5660, 126.9785]},\r
        {"name": "투썸플레이스 광화문", "loc": [37.5710, 126.9769]},\r
        {"name": "이디야 을지로", "loc": [37.5660, 126.9910]},\r
        {"name": "커피빈 명동", "loc": [37.5630, 126.9860]}\r
    ]\r
    cafes\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import folium\r
      cafes = [\r
          {"name": "스타벅스 시청점", "loc": [37.5660, 126.9785]},\r
          {"name": "투썸플레이스 광화문", "loc": [37.5710, 126.9769]},\r
          {"name": "이디야 을지로", "loc": [37.5660, 126.9910]},\r
          {"name": "커피빈 명동", "loc": [37.5630, 126.9860]}\r
      ]\r
      cafes\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`cafes\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 \`cafes\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
`;export{e as default};