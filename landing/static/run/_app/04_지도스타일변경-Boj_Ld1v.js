var e=`meta:
  packages:
  - folium
  id: folium_04
  title: 지도 스타일 변경
  order: 4
  category: folium
  difficulty: ⭐⭐
  badge: 기초
  tags:
  - folium
  - tiles
  - TileLayer
  - 스타일
  - 테마
  seo:
    title: Folium 지도 스타일 - 타일 레이어 변경
    description: Folium으로 지도 스타일을 변경합니다. OpenStreetMap, CartoDB, OpenTopoMap 등 다양한 타일을 사용합니다.
    keywords:
    - folium
    - tiles
    - TileLayer
    - CartoDB
    - OpenTopoMap
    - 지도 스타일
intro:
  emoji: 🎨
  goal: 다양한 타일 레이어로 지도 스타일을 변경합니다.
  description: Folium은 여러 지도 스타일을 지원합니다. 기본 OpenStreetMap 외에 CartoDB, attribution을 명시한 커스텀 타일을 사용할 수 있습니다.
    용도에 맞는 스타일을 선택하여 지도를 꾸밉니다.
  direction: 지도 스타일 변경에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.
  benefits:
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.
  - 지도 스타일 변경 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 기본 타일 처리 실행
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. CartoDB 타일 결과 검증
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.
    - label: 지도 스타일 변경 재사용
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 지도 시각화 환경
      detail: folium 기준으로 로컬 Python 실행을 준비합니다.
    - label: 지도 스타일 변경 실행
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.
    - label: 지도 스타일 변경 완료
      detail: 검증된 코드를 위치 기반 리포트로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: folium과 Codaro를 불러옵니다.
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
- id: step2_default_tiles
  title: 2단계. 기본 타일
  structuredPrimary: true
  subtitle: OpenStreetMap
  goal: 2단계. 기본 타일에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    기본 타일은 OpenStreetMap입니다. tiles 파라미터를 지정하지 않으면 자동 적용됩니다.

    OpenStreetMap은 무료 오픈소스 지도입니다. 상세한 도로, 건물, POI 정보를 제공합니다.
  snippet: |-
    seoulCenter = [37.5665, 126.9780]
    m1 = folium.Map(location=seoulCenter, zoom_start=12)
    m1
  exercise:
    prompt: 2단계. 기본 타일 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      seoulCenter = [37.5665, 126.9780]
      m1 = folium.Map(location=seoulCenter, zoom_start=12)
      m1
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 2단계. 기본 타일에서 \`seoulCenter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 2단계. 기본 타일 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step3_cartodb
  title: 3단계. CartoDB 타일
  structuredPrimary: true
  subtitle: Positron, DarkMatter
  goal: 3단계. CartoDB 타일에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    CartoDB는 깔끔한 스타일의 타일을 제공합니다. Positron은 밝은 테마, DarkMatter는 어두운 테마입니다.

    Positron은 데이터 시각화 배경으로 적합합니다. 마커와 도형이 잘 보입니다. DarkMatter는 야간 모드나 밝은 색 데이터에 적합합니다.
  snippet: |-
    m3 = folium.Map(
        location=seoulCenter,
        zoom_start=12,
        tiles="CartoDB Positron"
    )
    m3
  exercise:
    prompt: 3단계. CartoDB 타일 예제에서 \`m3\`, \`location\`, \`zoom_start\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      m3 = folium.Map(
          location=seoulCenter,
          zoom_start=12,
          tiles="CartoDB Positron"
      )
      m3
    hints:
    - 바꿀 지점은 \`m3 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`m3\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 3단계. CartoDB 타일에서 \`m3\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 3단계. CartoDB 타일 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step4_custom_tiles
  title: 4단계. 커스텀 타일
  structuredPrimary: true
  subtitle: attribution 있는 외부 타일
  goal: 4단계. 커스텀 타일에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    외부 타일 서버를 사용할 때는 URL과 attribution을 함께 지정합니다. attribution이 없으면 최신 Folium에서는 실행 오류가 납니다.

    외부 타일은 attr이 필수입니다. 기본 제공 이름이 아닌 URL 템플릿을 쓸 때는 저작권 표시를 반드시 넣으세요.
  snippet: |-
    m5 = folium.Map(location=[37.6608, 126.9933], zoom_start=12)

    folium.TileLayer(
        tiles="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attr="Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap",
        name="OpenTopoMap 지형도"
    ).add_to(m5)

    m5
  exercise:
    prompt: 4단계. 커스텀 타일 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      m5 = folium.Map(location=[37.6608, 126.9933], zoom_start=12)

      folium.TileLayer(
          tiles="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attr="Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap",
          name="OpenTopoMap 지형도"
      ).add_to(m5)

      m5
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 4단계. 커스텀 타일에서 \`m5\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 4단계. 커스텀 타일 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step5_tile_comparison
  title: 5단계. 타일 비교
  structuredPrimary: true
  subtitle: 같은 위치 다른 스타일
  goal: 5단계. 타일 비교에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    동일한 위치를 여러 타일 스타일로 비교해봅니다.

    어두운 배경에서는 밝은 색 마커(lightred, lightblue, white)가 잘 보입니다.
  snippet: |-
    tiles = [
        "OpenStreetMap",
        "CartoDB Positron",
        "CartoDB Dark_Matter",
        "OpenTopoMap URL + attr"
    ]
    tiles
  exercise:
    prompt: 5단계. 타일 비교 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      tiles = [
          "OpenStreetMap",
          "CartoDB Positron",
          "CartoDB Dark_Matter",
          "OpenTopoMap URL + attr"
      ]
      tiles
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 5단계. 타일 비교에서 \`tiles\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 5단계. 타일 비교 실행 뒤 \`tiles\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: step6_tilelayer
  title: 6단계. TileLayer 추가
  structuredPrimary: true
  subtitle: TileLayer()
  goal: 6단계. TileLayer 추가에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    TileLayer()로 지도에 타일 레이어를 추가합니다. 여러 타일을 겹쳐 사용하거나 전환할 수 있습니다.

    tiles=None으로 시작하고 TileLayer를 추가하면 LayerControl과 함께 사용할 수 있습니다.
  snippet: |-
    m10 = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)

    folium.TileLayer("OpenStreetMap").add_to(m10)

    m10
  exercise:
    prompt: 6단계. TileLayer 추가 예제에서 \`m10\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      m10 = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)

      folium.TileLayer("OpenStreetMap").add_to(m10)

      m10
    hints:
    - 바꿀 지점은 \`m10 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`m10\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 6단계. TileLayer 추가에서 \`m10\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 6단계. TileLayer 추가 실행 뒤 \`m10\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step7_custom_tile
  title: 7단계. 커스텀 타일 URL
  structuredPrimary: true
  subtitle: 외부 타일 서버
  goal: 7단계. 커스텀 타일 URL에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    URL 템플릿으로 외부 타일 서버를 사용할 수 있습니다. {z}, {x}, {y}는 줌 레벨과 타일 좌표입니다.

    attr은 저작권 표시입니다. 타일 제공자의 이용약관에 따라 표시해야 합니다.
  snippet: |-
    m12 = folium.Map(location=[37.6608, 126.9933], zoom_start=12)

    folium.TileLayer(
        tiles="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attr="OpenTopoMap",
        name="지형도"
    ).add_to(m12)

    m12
  exercise:
    prompt: 7단계. 커스텀 타일 URL 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      m12 = folium.Map(location=[37.6608, 126.9933], zoom_start=12)

      folium.TileLayer(
          tiles="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attr="OpenTopoMap",
          name="지형도"
      ).add_to(m12)

      m12
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 7단계. 커스텀 타일 URL에서 \`m12\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 7단계. 커스텀 타일 URL 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step8_tile_opacity
  title: 8단계. 타일 투명도
  structuredPrimary: true
  subtitle: opacity
  goal: 8단계. 타일 투명도에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    타일의 투명도를 조절하여 여러 타일을 겹쳐 볼 수 있습니다.

    opacity는 0(투명)~1(불투명)입니다. 0.3 정도면 아래 지도가 비쳐 보입니다.
  snippet: |-
    m13 = folium.Map(location=seoulCenter, zoom_start=12)

    folium.TileLayer(
        tiles="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attr="Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap",
        opacity=0.3,
        name="지형 오버레이"
    ).add_to(m13)

    m13
  exercise:
    prompt: 8단계. 타일 투명도 예제에서 \`m13\`, \`tiles\`, \`attr\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      m13 = folium.Map(location=seoulCenter, zoom_start=12)

      folium.TileLayer(
          tiles="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attr="Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap",
          opacity=0.3,
          name="지형 오버레이"
      ).add_to(m13)

      m13
    hints:
    - 바꿀 지점은 \`m13 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`m13\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 8단계. 타일 투명도에서 \`m13\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 8단계. 타일 투명도 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step9_use_cases
  title: 9단계. 용도별 추천
  structuredPrimary: true
  subtitle: 상황에 맞는 타일
  goal: 9단계. 용도별 추천에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    용도에 따라 적합한 타일을 선택합니다.

    밝은 배경에는 진한 색(blue, red, green), 어두운 배경에는 밝은 색(yellow, orange, white)을 사용하세요.
  snippet: |-
    dataMap = folium.Map(
        location=seoulCenter,
        zoom_start=12,
        tiles="CartoDB Positron"
    )

    spots = [
        [37.5665, 126.9780],
        [37.4979, 127.0276],
        [37.5563, 126.9236]
    ]

    for spot in spots:
        folium.CircleMarker(
            location=spot,
            radius=15,
            color="blue",
            fill=True,
            fill_opacity=0.6
        ).add_to(dataMap)

    dataMap
  exercise:
    prompt: 9단계. 용도별 추천 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      dataMap = folium.Map(
          location=seoulCenter,
          zoom_start=12,
          tiles="CartoDB Positron"
      )

      spots = [
          [37.5665, 126.9780],
          [37.4979, 127.0276],
          [37.5563, 126.9236]
      ]

      for spot in spots:
          folium.CircleMarker(
              location=spot,
              radius=15,
              color="blue",
              fill=True,
              fill_opacity=0.6
          ).add_to(dataMap)

      dataMap
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 9단계. 용도별 추천의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 9단계. 용도별 추천 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step10_complete
  title: 10단계. 완성 예제
  structuredPrimary: true
  subtitle: 낮/밤 모드 지도
  goal: 10단계. 완성 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    LayerControl로 낮/밤 모드를 전환할 수 있는 지도를 만듭니다.

    우측 상단의 레이어 컨트롤에서 낮 모드/밤 모드를 선택할 수 있습니다.
  snippet: |-
    places = [
        {"name": "서울시청", "loc": [37.5665, 126.9780]},
        {"name": "강남역", "loc": [37.4979, 127.0276]},
        {"name": "홍대입구", "loc": [37.5563, 126.9236]},
        {"name": "명동", "loc": [37.5636, 126.9869]}
    ]

    themeMap = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)

    folium.TileLayer(
        "CartoDB Positron",
        name="낮 모드"
    ).add_to(themeMap)

    folium.TileLayer(
        "CartoDB Dark_Matter",
        name="밤 모드"
    ).add_to(themeMap)

    for place in places:
        folium.Marker(
            location=place["loc"],
            popup=place["name"],
            tooltip=place["name"],
            icon=folium.Icon(color="red", icon="star")
        ).add_to(themeMap)

    folium.LayerControl().add_to(themeMap)

    themeMap
  exercise:
    prompt: 10단계. 완성 예제 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      places = [
          {"name": "서울시청", "loc": [37.5665, 126.9780]},
          {"name": "강남역", "loc": [37.4979, 127.0276]},
          {"name": "홍대입구", "loc": [37.5563, 126.9236]},
          {"name": "명동", "loc": [37.5636, 126.9869]}
      ]

      themeMap = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)

      folium.TileLayer(
          "CartoDB Positron",
          name="낮 모드"
      ).add_to(themeMap)

      folium.TileLayer(
          "CartoDB Dark_Matter",
          name="밤 모드"
      ).add_to(themeMap)

      for place in places:
          folium.Marker(
              location=place["loc"],
              popup=place["name"],
              tooltip=place["name"],
              icon=folium.Icon(color="red", icon="star")
          ).add_to(themeMap)

      folium.LayerControl().add_to(themeMap)

      themeMap
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 10단계. 완성 예제의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 10단계. 완성 예제 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step11_workflow
  title: 11단계. 실무 타일 선택 검증
  structuredPrimary: true
  subtitle: 예측 → attribution 오류 확인 → 렌더 검증 → 용도 실험
  goal: 11단계. 실무 타일 선택 검증에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    지도 스타일은 취향 문제가 아니라 데이터가 잘 읽히는지와 라이선스 표시가 맞는지의 문제입니다. 업무용 지도에서는 타일 프로필을 정의하고, 커스텀 URL에는 attribution이 있는지 검증한 뒤, 레이어 이름이 HTML에 렌더링되는지 확인해야 합니다.

    타일 선택은 보기 좋은 배경 고르기가 아닙니다. 데이터 대비, 업무 목적, attribution, LayerControl 렌더링을 함께 검증해야 로컬에서 반복 실행 가능한 지도 커리큘럼이 됩니다.
  tips:
  - 타일 선택은 보기 좋은 배경 고르기가 아닙니다. 데이터 대비, 업무 목적, attribution, LayerControl 렌더링을 함께 검증해야 로컬에서 반복 실행 가능한 지도
    커리큘럼이 됩니다.
  snippet: |-
    tileProfiles = {
        "operations": {"name": "운영 기본", "tiles": "OpenStreetMap", "attr": None, "useCase": "현장 위치 확인"},
        "report": {"name": "리포트 배경", "tiles": "CartoDB Positron", "attr": None, "useCase": "데이터 시각화"},
        "night": {"name": "야간 관제", "tiles": "CartoDB Dark_Matter", "attr": None, "useCase": "야간 대시보드"},
        "terrain": {
            "name": "지형 점검",
            "tiles": "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
            "attr": "Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap",
            "useCase": "산악/고도 맥락",
        },
    }

    recommendedProfile = tileProfiles["report"]
    recommendedProfile["name"], recommendedProfile["useCase"]
  exercise:
    prompt: 11단계. 실무 타일 선택 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      tileProfiles = {
          "operations": {"name": "운영 기본", "tiles": "OpenStreetMap", "attr": None, "useCase": "현장 위치 확인"},
          "report": {"name": "리포트 배경", "tiles": "CartoDB Positron", "attr": None, "useCase": "데이터 시각화"},
          "night": {"name": "야간 관제", "tiles": "CartoDB Dark_Matter", "attr": None, "useCase": "야간 대시보드"},
          "terrain": {
              "name": "지형 점검",
              "tiles": "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
              "attr": "Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap",
              "useCase": "산악/고도 맥락",
          },
      }

      recommendedProfile = tileProfiles["report"]
      recommendedProfile["name"], recommendedProfile["useCase"]
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 11단계. 실무 타일 선택 검증에서 \`tileProfiles\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 11단계. 실무 타일 선택 검증 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 타일 스타일
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 지금까지 배운 내용을 활용하여 미션을 수행해봅시다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import folium
    mountains = [
        {"name": "북한산", "loc": [37.6608, 126.9933]},
        {"name": "관악산", "loc": [37.4450, 126.9639]},
        {"name": "도봉산", "loc": [37.6985, 127.0145]}
    ]
    mountains
  exercise:
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      import folium
      mountains = [
          {"name": "북한산", "loc": [37.6608, 126.9933]},
          {"name": "관악산", "loc": [37.4450, 126.9639]},
          {"name": "도봉산", "loc": [37.6985, 127.0145]}
      ]
      mountains
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 실습에서 \`mountains\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 실습 실행 뒤 \`mountains\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
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
  - id: folium_04-tile-style-access-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - practice
    title: 지도 style 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: basemap style이 overlay 대비와 attribution을 해치지 않는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_tile_style_access(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_tile_style_access(rows):
            raise NotImplementedError
      solution: |
        def prepare_tile_style_access(rows):
            required = ['longitude', 'latitude', 'tile']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'tile'
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
      id: python.folium.folium_04.tile-style-access-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.folium.folium_04.tile-style-access-data-evidence.mastery.behavior.v1.fixture
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
        entry: prepare_tile_style_access
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - longitude: 127.0
              latitude: 37.5
              tile: light
            - longitude: 129.0
              latitude: 35.2
              tile: light
            - longitude: 126.7
              latitude: 37.4
              tile: dark
          expectedReturn:
            usableCount: 3
            excludedCount: 0
            groupCounts:
              dark: 1
              light: 2
            xExtent:
            - 126.7
            - 129.0
            yExtent:
            - 35.2
            - 37.5
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
  - id: folium_04-tile-style-access-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - folium_04-tile-style-access-data-evidence-mastery
    title: 지도 style 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 시설 overlay와 충분한 contrast를 가진 tile을 attribution과 함께 제공한다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_tile_style_access(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_tile_style_access(candidate):
            raise NotImplementedError
      solution: |
        def audit_tile_style_access(candidate):
            expected = {'mark': 'styled-map', 'x': 'longitude', 'y': 'latitude', 'group': 'tile', 'transforms': ['attribution', 'contrast-check'], 'interaction': 'layer-toggle'}
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
      id: python.folium.folium_04.tile-style-access-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.folium.folium_04.tile-style-access-encoding-transfer.transfer.behavior.v1.fixture
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
        entry: audit_tile_style_access
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: styled-map
              x: longitude
              y: latitude
              group: tile
              transforms:
              - attribution
              - contrast-check
              interaction: layer-toggle
              description: 시설 overlay와 충분한 contrast를 가진 tile을 attribution과 함께 제공한다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: styled-map
              x: longitude
              y: latitude
              group: tile
              transforms:
              - attribution
              - contrast-check
              interaction: layer-toggle
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
              mark: styled-map
              x: longitude
              y: latitude
              group: tile
              transforms:
              - attribution
              - contrast-check
              interaction: layer-toggle
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: folium_04-tile-style-access-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - folium_04-tile-style-access-encoding-transfer-transfer
    title: 지도 style 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: basemap style이 overlay 대비와 attribution을 해치지 않는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_tile_style_access(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_tile_style_access(situation):
            raise NotImplementedError
      solution: |
        def choose_tile_style_access(situation):
            table = {'dense-overlay': {'encoding': 'quiet basemap', 'evidence': 'contrast audit', 'risk': 'visual competition'}, 'custom-tiles': {'encoding': 'tile URL plus attribution', 'evidence': 'license text', 'risk': 'missing attribution'}, 'dark-mode': {'encoding': 'tested dark tiles', 'evidence': 'marker contrast', 'risk': 'invisible labels'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.folium.folium_04.tile-style-access-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.folium.folium_04.tile-style-access-interpretation-retrieval.retrieval.behavior.v1.fixture
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
        entry: choose_tile_style_access
        cases:
        - id: recalls-dense-overlay
          arguments:
          - value: dense-overlay
          expectedReturn:
            encoding: quiet basemap
            evidence: contrast audit
            risk: visual competition
        - id: recalls-custom-tiles
          arguments:
          - value: custom-tiles
          expectedReturn:
            encoding: tile URL plus attribution
            evidence: license text
            risk: missing attribution
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};