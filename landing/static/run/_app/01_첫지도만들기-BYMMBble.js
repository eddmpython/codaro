var e=`meta:
  packages:
  - folium
  id: folium_01
  title: 첫지도만들기
  order: 1
  category: folium
  difficulty: ⭐
  badge: 입문
  tags:
  - folium
  - Map
  - Marker
  - 지도
  - 마커
  seo:
    title: Folium 첫걸음 - 지도 생성과 마커 추가
    description: Folium으로 첫 지도를 만듭니다. Map()으로 지도를 생성하고 Marker()로 위치를 표시합니다.
    keywords:
    - folium
    - Map
    - Marker
    - 지도
    - 마커
    - popup
intro:
  emoji: 📍
  goal: 기본 지도를 생성하고 마커를 추가합니다.
  description: Folium의 기본인 지도 생성을 배웁니다. Map()으로 지도를 만들고 location과 zoom_start로 초기 화면을 설정합니다. Marker()로
    특정 위치에 점을 찍고 popup으로 정보를 표시합니다.
  direction: 첫지도만들기에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.
  benefits:
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.
  - 첫지도만들기 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 기본 지도 생성 처리 실행
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 줌 레벨 이해 결과 검증
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.
    - label: 첫지도만들기 재사용
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 지도 시각화 환경
      detail: folium 기준으로 로컬 Python 실행을 준비합니다.
    - label: 첫지도만들기 실행
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.
    - label: 첫지도만들기 완료
      detail: 검증된 코드를 위치 기반 리포트로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: folium과 Codaro를 불러옵니다. Codaro는 지도를 화면에 표시할 때 사용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: import folium
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: import folium
    hints:
    - 바꿀 지점은 위도/경도 데이터을 만드는 첫 줄과 지도 레이어 구성 줄에서 찾으세요.
    - 실행 뒤 마커와 저장 HTML 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 마커와 저장 HTML 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step2_basic_map
  title: 2단계. 기본 지도 생성
  structuredPrimary: true
  subtitle: Map()
  goal: 2단계. 기본 지도 생성에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    Map()으로 지도를 생성합니다. location은 지도 중심 좌표[위도, 경도]이고, zoom_start는 초기 확대 레벨입니다.

    zoom_start는 1(세계)~18(건물) 범위입니다. 도시는 12, 동네는 15, 건물은 17 정도가 적당합니다.
  snippet: |-
    seoulCenter = [37.5665, 126.9780]
    m1 = folium.Map(location=seoulCenter, zoom_start=12)
    m1
  exercise:
    prompt: 2단계. 기본 지도 생성 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      seoulCenter = [37.5665, 126.9780]
      m1 = folium.Map(location=seoulCenter, zoom_start=12)
      m1
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 2단계. 기본 지도 생성에서 \`seoulCenter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 2단계. 기본 지도 생성 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step3_zoom_levels
  title: 3단계. 줌 레벨 이해
  structuredPrimary: true
  subtitle: zoom_start 설정
  goal: 3단계. 줌 레벨 이해에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    줌 레벨에 따라 지도의 상세도가 달라집니다. 용도에 맞는 줌 레벨을 선택하세요.

    마우스 휠이나 +/- 버튼으로 줌을 조절할 수 있습니다. zoom_start는 초기값일 뿐입니다.
  snippet: |-
    m2 = folium.Map(location=seoulCenter, zoom_start=10)
    m2
  exercise:
    prompt: 3단계. 줌 레벨 이해 예제에서 \`m2\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      m2 = folium.Map(location=seoulCenter, zoom_start=10)
      m2
    hints:
    - 바꿀 지점은 \`m2 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`m2\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 3단계. 줌 레벨 이해에서 \`m2\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 3단계. 줌 레벨 이해 실행 뒤 \`m2\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step4_marker
  title: 4단계. 마커 추가
  structuredPrimary: true
  subtitle: Marker()
  goal: 4단계. 마커 추가에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    Marker()로 특정 위치에 마커를 추가합니다. add_to(지도)로 지도에 붙입니다.

    popup은 마커를 클릭하면 나타나는 말풍선입니다. 문자열이나 HTML을 넣을 수 있습니다.
  snippet: |-
    m4 = folium.Map(location=seoulCenter, zoom_start=14)
    folium.Marker(location=seoulCenter).add_to(m4)
    m4
  exercise:
    prompt: 4단계. 마커 추가 예제에서 \`m4\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      m4 = folium.Map(location=seoulCenter, zoom_start=14)
      folium.Marker(location=seoulCenter).add_to(m4)
      m4
    hints:
    - 바꿀 지점은 \`m4 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`m4\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 4단계. 마커 추가에서 \`m4\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 4단계. 마커 추가 실행 뒤 \`m4\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step5_multiple_markers
  title: 5단계. 여러 마커 추가
  structuredPrimary: true
  subtitle: 반복문 활용
  goal: 5단계. 여러 마커 추가에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    여러 위치에 마커를 추가합니다. 좌표와 이름 리스트를 만들고 반복문으로 추가합니다.

    딕셔너리 리스트로 데이터를 관리하면 확장하기 쉽습니다. 나중에 주소, 카테고리 등을 추가할 수 있습니다.
  snippet: |-
    places = [
        {"name": "서울시청", "loc": [37.5665, 126.9780]},
        {"name": "강남역", "loc": [37.4979, 127.0276]},
        {"name": "홍대입구", "loc": [37.5563, 126.9236]},
        {"name": "명동", "loc": [37.5636, 126.9869]},
        {"name": "여의도", "loc": [37.5219, 126.9245]}
    ]

    m6 = folium.Map(location=seoulCenter, zoom_start=12)
    for place in places:
        folium.Marker(
            location=place["loc"],
            popup=place["name"]
        ).add_to(m6)
    m6
  exercise:
    prompt: 5단계. 여러 마커 추가 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      places = [
          {"name": "서울시청", "loc": [37.5665, 126.9780]},
          {"name": "강남역", "loc": [37.4979, 127.0276]},
          {"name": "홍대입구", "loc": [37.5563, 126.9236]},
          {"name": "명동", "loc": [37.5636, 126.9869]},
          {"name": "여의도", "loc": [37.5219, 126.9245]}
      ]

      m6 = folium.Map(location=seoulCenter, zoom_start=12)
      for place in places:
          folium.Marker(
              location=place["loc"],
              popup=place["name"]
          ).add_to(m6)
      m6
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 5단계. 여러 마커 추가의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 5단계. 여러 마커 추가 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step6_tooltip
  title: 6단계. 툴팁 추가
  structuredPrimary: true
  subtitle: tooltip vs popup
  goal: 6단계. 툴팁 추가에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    tooltip은 마우스를 올리면 나타나고, popup은 클릭해야 나타납니다. 둘 다 사용할 수 있습니다.

    tooltip은 빠른 미리보기, popup은 상세 정보에 적합합니다. 보통 tooltip에 이름, popup에 상세 정보를 넣습니다.
  snippet: |-
    m7 = folium.Map(location=seoulCenter, zoom_start=14)
    folium.Marker(
        location=seoulCenter,
        popup="클릭하면 보여요",
        tooltip="마우스 올리면 보여요"
    ).add_to(m7)
    m7
  exercise:
    prompt: 6단계. 툴팁 추가 예제에서 \`m7\`, \`location\`, \`popup\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      m7 = folium.Map(location=seoulCenter, zoom_start=14)
      folium.Marker(
          location=seoulCenter,
          popup="클릭하면 보여요",
          tooltip="마우스 올리면 보여요"
      ).add_to(m7)
      m7
    hints:
    - 바꿀 지점은 \`m7 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`m7\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 6단계. 툴팁 추가에서 \`m7\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 6단계. 툴팁 추가 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step7_marker_color
  title: 7단계. 마커 색상 변경
  structuredPrimary: true
  subtitle: icon 파라미터
  goal: 7단계. 마커 색상 변경에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    Icon()으로 마커 색상과 아이콘을 변경합니다. 기본 색상은 blue입니다.

    사용 가능한 색상은 red, blue, green, purple, orange, darkred, lightred, beige, darkblue, darkgreen, cadetblue, darkpurple, white, pink, lightblue, lightgreen, gray, black, lightgray 입니다.
  tips:
  - 사용 가능한 색상은 red, blue, green, purple, orange, darkred, lightred, beige, darkblue, darkgreen, cadetblue,
    darkpurple, white, pink, lightblue, lightgreen, gray, black, lightgray 입니다.
  snippet: |-
    m8 = folium.Map(location=seoulCenter, zoom_start=13)

    colors = ["red", "blue", "green", "purple", "orange"]
    for i, place in enumerate(places):
        folium.Marker(
            location=place["loc"],
            popup=place["name"],
            icon=folium.Icon(color=colors[i % len(colors)])
        ).add_to(m8)
    m8
  exercise:
    prompt: 7단계. 마커 색상 변경 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      m8 = folium.Map(location=seoulCenter, zoom_start=13)

      colors = ["red", "blue", "green", "purple", "orange"]
      for i, place in enumerate(places):
          folium.Marker(
              location=place["loc"],
              popup=place["name"],
              icon=folium.Icon(color=colors[i % len(colors)])
          ).add_to(m8)
      m8
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 7단계. 마커 색상 변경의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 7단계. 마커 색상 변경 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step8_icon_type
  title: 8단계. 아이콘 모양 변경
  structuredPrimary: true
  subtitle: icon 파라미터
  goal: 8단계. 아이콘 모양 변경에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    Icon()의 icon 파라미터로 마커 안의 아이콘을 변경합니다. Font Awesome과 Glyphicon 아이콘을 사용할 수 있습니다.

    자주 쓰는 아이콘은 home, star, heart, cloud, info-sign, music, camera, user 등입니다.
  snippet: |-
    m9 = folium.Map(location=seoulCenter, zoom_start=13)

    folium.Marker(
        location=[37.5665, 126.9780],
        popup="시청",
        icon=folium.Icon(color="red", icon="info-sign")
    ).add_to(m9)

    folium.Marker(
        location=[37.4979, 127.0276],
        popup="강남역",
        icon=folium.Icon(color="blue", icon="star")
    ).add_to(m9)

    folium.Marker(
        location=[37.5563, 126.9236],
        popup="홍대",
        icon=folium.Icon(color="green", icon="music")
    ).add_to(m9)

    m9
  exercise:
    prompt: 8단계. 아이콘 모양 변경 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      m9 = folium.Map(location=seoulCenter, zoom_start=13)

      folium.Marker(
          location=[37.5665, 126.9780],
          popup="시청",
          icon=folium.Icon(color="red", icon="info-sign")
      ).add_to(m9)

      folium.Marker(
          location=[37.4979, 127.0276],
          popup="강남역",
          icon=folium.Icon(color="blue", icon="star")
      ).add_to(m9)

      folium.Marker(
          location=[37.5563, 126.9236],
          popup="홍대",
          icon=folium.Icon(color="green", icon="music")
      ).add_to(m9)

      m9
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 8단계. 아이콘 모양 변경에서 \`m9\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 8단계. 아이콘 모양 변경 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step9_fit_bounds
  title: 9단계. 자동 줌 맞추기
  structuredPrimary: true
  subtitle: fit_bounds()
  goal: 9단계. 자동 줌 맞추기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    모든 마커가 보이도록 자동으로 줌을 조절합니다. fit_bounds()에 좌표 범위를 전달합니다.

    fit_bounds()는 [[남서 좌표], [북동 좌표]] 또는 좌표 리스트를 받습니다. 모든 마커가 화면에 들어오도록 줌을 조절합니다.
  snippet: |-
    m10 = folium.Map(location=seoulCenter, zoom_start=12)

    allLocs = [place["loc"] for place in places]
    for place in places:
        folium.Marker(
            location=place["loc"],
            popup=place["name"]
        ).add_to(m10)

    m10.fit_bounds(allLocs)
    m10
  exercise:
    prompt: 9단계. 자동 줌 맞추기 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      m10 = folium.Map(location=seoulCenter, zoom_start=12)

      allLocs = [place["loc"] for place in places]
      for place in places:
          folium.Marker(
              location=place["loc"],
              popup=place["name"]
          ).add_to(m10)

      m10.fit_bounds(allLocs)
      m10
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 9단계. 자동 줌 맞추기의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 9단계. 자동 줌 맞추기 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step10_complete
  title: 10단계. 완성 예제
  structuredPrimary: true
  subtitle: 서울 관광지 지도
  goal: 10단계. 완성 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: 지금까지 배운 내용을 종합하여 서울 관광지 지도를 완성합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    tourSpots = [
        {"name": "경복궁", "loc": [37.5796, 126.9770], "color": "red"},
        {"name": "남산타워", "loc": [37.5512, 126.9882], "color": "orange"},
        {"name": "명동", "loc": [37.5636, 126.9869], "color": "blue"},
        {"name": "동대문", "loc": [37.5711, 127.0095], "color": "green"},
        {"name": "이태원", "loc": [37.5340, 126.9948], "color": "purple"}
    ]

    tourMap = folium.Map(location=[37.56, 126.99], zoom_start=13)

    for spot in tourSpots:
        folium.Marker(
            location=spot["loc"],
            popup=f"<b>{spot['name']}</b>",
            tooltip=spot["name"],
            icon=folium.Icon(color=spot["color"], icon="star")
        ).add_to(tourMap)

    tourMap
  exercise:
    prompt: 10단계. 완성 예제 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      tourSpots = [
          {"name": "경복궁", "loc": [37.5796, 126.9770], "color": "red"},
          {"name": "남산타워", "loc": [37.5512, 126.9882], "color": "orange"},
          {"name": "명동", "loc": [37.5636, 126.9869], "color": "blue"},
          {"name": "동대문", "loc": [37.5711, 127.0095], "color": "green"},
          {"name": "이태원", "loc": [37.5340, 126.9948], "color": "purple"}
      ]

      tourMap = folium.Map(location=[37.56, 126.99], zoom_start=13)

      for spot in tourSpots:
          folium.Marker(
              location=spot["loc"],
              popup=f"<b>{spot['name']}</b>",
              tooltip=spot["name"],
              icon=folium.Icon(color=spot["color"], icon="star")
          ).add_to(tourMap)

      tourMap
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 10단계. 완성 예제의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 10단계. 완성 예제 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step11_workflow
  title: 11단계. 실무 위치 지도 검증
  structuredPrimary: true
  subtitle: 예측 → 오류 확인 → 검증
  goal: 11단계. 실무 위치 지도 검증에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    업무 지도는 마커가 보이는지만 확인하면 부족합니다. 좌표가 한국 범위 안에 있는지, 모든 지점 이름이 지도 HTML에 들어갔는지, 새 지점을 추가했을 때 중심과 경계가 어떻게 달라지는지 예측하고 검증해야 합니다.

    Folium 지도는 눈으로 보는 결과물이라 더더욱 데이터 검증이 필요합니다. 좌표 범위, 마커 수, 이름 렌더링을 코드로 확인하면 실무 오류를 빠르게 줄일 수 있습니다.
  snippet: |-
    branchSites = [
        {"name": "강남 상담센터", "loc": [37.4979, 127.0276], "priority": "high"},
        {"name": "홍대 체험존", "loc": [37.5563, 126.9236], "priority": "medium"},
        {"name": "여의도 파트너센터", "loc": [37.5219, 126.9245], "priority": "high"},
    ]

    def validateKoreaCoordinate(site):
        lat, lon = site["loc"]
        if not (33 <= lat <= 39 and 124 <= lon <= 132):
            raise ValueError(f"좌표 범위 오류: {site['name']}")
        return True

    validationResult = [validateKoreaCoordinate(site) for site in branchSites]
    validationResult
  exercise:
    prompt: 11단계. 실무 위치 지도 검증 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      branchSites = [
          {"name": "강남 상담센터", "loc": [37.4979, 127.0276], "priority": "high"},
          {"name": "홍대 체험존", "loc": [37.5563, 126.9236], "priority": "medium"},
          {"name": "여의도 파트너센터", "loc": [37.5219, 126.9245], "priority": "high"},
      ]

      def validateKoreaCoordinate(site):
          lat, lon = site["loc"]
          if not (33 <= lat <= 39 and 124 <= lon <= 132):
              raise ValueError(f"좌표 범위 오류: {site['name']}")
          return True

      validationResult = [validateKoreaCoordinate(site) for site in branchSites]
      validationResult
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: 11단계. 실무 위치 지도 검증의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 11단계. 실무 위치 지도 검증 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 지도 만들기
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    지금까지 배운 내용을 활용하여 미션을 수행해봅시다.

    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.
  snippet: |-
    import folium
    cafes = [
        {"name": "스타벅스 시청점", "loc": [37.5660, 126.9785]},
        {"name": "투썸플레이스 광화문", "loc": [37.5710, 126.9769]},
        {"name": "이디야 을지로", "loc": [37.5660, 126.9910]},
        {"name": "커피빈 명동", "loc": [37.5630, 126.9860]}
    ]
    cafes
  exercise:
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      import folium
      cafes = [
          {"name": "스타벅스 시청점", "loc": [37.5660, 126.9785]},
          {"name": "투썸플레이스 광화문", "loc": [37.5710, 126.9769]},
          {"name": "이디야 을지로", "loc": [37.5660, 126.9910]},
          {"name": "커피빈 명동", "loc": [37.5630, 126.9860]}
      ]
      cafes
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 실습에서 \`cafes\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 실습 실행 뒤 \`cafes\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
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
  - id: folium_01-first-map-view-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - practice
    title: 첫 지도 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 초기 center와 zoom이 모든 위치를 보이게 하는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_first_map_view(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_first_map_view(rows):
            raise NotImplementedError
      solution: |
        def prepare_first_map_view(rows):
            required = ['longitude', 'latitude', 'city']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'city'
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
      id: python.folium.folium_01.first-map-view-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.folium.folium_01.first-map-view-data-evidence.mastery.behavior.v1.fixture
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
        entry: prepare_first_map_view
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - longitude: 126.98
              latitude: 37.57
              city: Seoul
            - longitude: 129.07
              latitude: 35.18
              city: Busan
            - longitude: 127.38
              latitude: 36.35
              city: Daejeon
          expectedReturn:
            usableCount: 3
            excludedCount: 0
            groupCounts:
              Busan: 1
              Daejeon: 1
              Seoul: 1
            xExtent:
            - 126.98
            - 129.07
            yExtent:
            - 35.18
            - 37.57
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
  - id: folium_01-first-map-view-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - folium_01-first-map-view-data-evidence-mastery
    title: 첫 지도 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 세 서비스 센터를 누락 없이 포함하는 initial bounds를 계산한다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_first_map_view(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_first_map_view(candidate):
            raise NotImplementedError
      solution: |
        def audit_first_map_view(candidate):
            expected = {'mark': 'marker-map', 'x': 'longitude', 'y': 'latitude', 'group': 'city', 'transforms': ['fit-bounds', 'validate-coordinates'], 'interaction': 'pan-zoom'}
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
      id: python.folium.folium_01.first-map-view-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.folium.folium_01.first-map-view-encoding-transfer.transfer.behavior.v1.fixture
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
        entry: audit_first_map_view
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: marker-map
              x: longitude
              y: latitude
              group: city
              transforms:
              - fit-bounds
              - validate-coordinates
              interaction: pan-zoom
              description: 세 서비스 센터를 누락 없이 포함하는 initial bounds를 계산한다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: marker-map
              x: longitude
              y: latitude
              group: city
              transforms:
              - fit-bounds
              - validate-coordinates
              interaction: pan-zoom
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
              mark: marker-map
              x: longitude
              y: latitude
              group: city
              transforms:
              - fit-bounds
              - validate-coordinates
              interaction: pan-zoom
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: folium_01-first-map-view-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - folium_01-first-map-view-encoding-transfer-transfer
    title: 첫 지도 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 초기 center와 zoom이 모든 위치를 보이게 하는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_first_map_view(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_first_map_view(situation):
            raise NotImplementedError
      solution: |
        def choose_first_map_view(situation):
            table = {'one-location': {'encoding': 'center plus marker', 'evidence': 'coordinate label', 'risk': 'excessive zoom'}, 'many-locations': {'encoding': 'fit bounds', 'evidence': 'extent', 'risk': 'hidden point'}, 'invalid-coordinate': {'encoding': 'exclude plus report', 'evidence': 'invalid count', 'risk': 'marker at zero'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.folium.folium_01.first-map-view-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.folium.folium_01.first-map-view-interpretation-retrieval.retrieval.behavior.v1.fixture
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
        entry: choose_first_map_view
        cases:
        - id: recalls-one-location
          arguments:
          - value: one-location
          expectedReturn:
            encoding: center plus marker
            evidence: coordinate label
            risk: excessive zoom
        - id: recalls-many-locations
          arguments:
          - value: many-locations
          expectedReturn:
            encoding: fit bounds
            evidence: extent
            risk: hidden point
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};