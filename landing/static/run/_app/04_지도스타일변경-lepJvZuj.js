var e=`meta:\r
  packages:\r
  - folium\r
  id: folium_04\r
  title: 지도 스타일 변경\r
  order: 4\r
  category: folium\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - folium\r
  - tiles\r
  - TileLayer\r
  - 스타일\r
  - 테마\r
  seo:\r
    title: Folium 지도 스타일 - 타일 레이어 변경\r
    description: Folium으로 지도 스타일을 변경합니다. OpenStreetMap, CartoDB, OpenTopoMap 등 다양한 타일을 사용합니다.\r
    keywords:\r
    - folium\r
    - tiles\r
    - TileLayer\r
    - CartoDB\r
    - OpenTopoMap\r
    - 지도 스타일\r
intro:\r
  emoji: 🎨\r
  goal: 다양한 타일 레이어로 지도 스타일을 변경합니다.\r
  description: Folium은 여러 지도 스타일을 지원합니다. 기본 OpenStreetMap 외에 CartoDB, attribution을 명시한 커스텀 타일을 사용할 수 있습니다.\r
    용도에 맞는 스타일을 선택하여 지도를 꾸밉니다.\r
  direction: 지도 스타일 변경에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.\r
  benefits:\r
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.\r
  - 지도 스타일 변경 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기본 타일 처리 실행\r
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. CartoDB 타일 결과 검증\r
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.\r
    - label: 지도 스타일 변경 재사용\r
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 지도 시각화 환경\r
      detail: folium 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 지도 스타일 변경 실행\r
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.\r
    - label: 지도 스타일 변경 완료\r
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
- id: step2_default_tiles\r
  title: 2단계. 기본 타일\r
  structuredPrimary: true\r
  subtitle: OpenStreetMap\r
  goal: 2단계. 기본 타일에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    기본 타일은 OpenStreetMap입니다. tiles 파라미터를 지정하지 않으면 자동 적용됩니다.\r
\r
    OpenStreetMap은 무료 오픈소스 지도입니다. 상세한 도로, 건물, POI 정보를 제공합니다.\r
  snippet: |-\r
    seoulCenter = [37.5665, 126.9780]\r
    m1 = folium.Map(location=seoulCenter, zoom_start=12)\r
    m1\r
  exercise:\r
    prompt: 2단계. 기본 타일 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      seoulCenter = [37.5665, 126.9780]\r
      m1 = folium.Map(location=seoulCenter, zoom_start=12)\r
      m1\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 기본 타일에서 \`seoulCenter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 기본 타일 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_cartodb\r
  title: 3단계. CartoDB 타일\r
  structuredPrimary: true\r
  subtitle: Positron, DarkMatter\r
  goal: 3단계. CartoDB 타일에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    CartoDB는 깔끔한 스타일의 타일을 제공합니다. Positron은 밝은 테마, DarkMatter는 어두운 테마입니다.\r
\r
    Positron은 데이터 시각화 배경으로 적합합니다. 마커와 도형이 잘 보입니다. DarkMatter는 야간 모드나 밝은 색 데이터에 적합합니다.\r
  snippet: |-\r
    m3 = folium.Map(\r
        location=seoulCenter,\r
        zoom_start=12,\r
        tiles="CartoDB Positron"\r
    )\r
    m3\r
  exercise:\r
    prompt: 3단계. CartoDB 타일 예제에서 \`m3\`, \`location\`, \`zoom_start\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      m3 = folium.Map(\r
          location=seoulCenter,\r
          zoom_start=12,\r
          tiles="CartoDB Positron"\r
      )\r
      m3\r
    hints:\r
    - 바꿀 지점은 \`m3 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`m3\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 3단계. CartoDB 타일에서 \`m3\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. CartoDB 타일 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_custom_tiles\r
  title: 4단계. 커스텀 타일\r
  structuredPrimary: true\r
  subtitle: attribution 있는 외부 타일\r
  goal: 4단계. 커스텀 타일에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    외부 타일 서버를 사용할 때는 URL과 attribution을 함께 지정합니다. attribution이 없으면 최신 Folium에서는 실행 오류가 납니다.\r
\r
    외부 타일은 attr이 필수입니다. 기본 제공 이름이 아닌 URL 템플릿을 쓸 때는 저작권 표시를 반드시 넣으세요.\r
  snippet: |-\r
    m5 = folium.Map(location=[37.6608, 126.9933], zoom_start=12)\r
\r
    folium.TileLayer(\r
        tiles="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",\r
        attr="Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap",\r
        name="OpenTopoMap 지형도"\r
    ).add_to(m5)\r
\r
    m5\r
  exercise:\r
    prompt: 4단계. 커스텀 타일 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m5 = folium.Map(location=[37.6608, 126.9933], zoom_start=12)\r
\r
      folium.TileLayer(\r
          tiles="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",\r
          attr="Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap",\r
          name="OpenTopoMap 지형도"\r
      ).add_to(m5)\r
\r
      m5\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 커스텀 타일에서 \`m5\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 커스텀 타일 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_tile_comparison\r
  title: 5단계. 타일 비교\r
  structuredPrimary: true\r
  subtitle: 같은 위치 다른 스타일\r
  goal: 5단계. 타일 비교에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    동일한 위치를 여러 타일 스타일로 비교해봅니다.\r
\r
    어두운 배경에서는 밝은 색 마커(lightred, lightblue, white)가 잘 보입니다.\r
  snippet: |-\r
    tiles = [\r
        "OpenStreetMap",\r
        "CartoDB Positron",\r
        "CartoDB Dark_Matter",\r
        "OpenTopoMap URL + attr"\r
    ]\r
    tiles\r
  exercise:\r
    prompt: 5단계. 타일 비교 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      tiles = [\r
          "OpenStreetMap",\r
          "CartoDB Positron",\r
          "CartoDB Dark_Matter",\r
          "OpenTopoMap URL + attr"\r
      ]\r
      tiles\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 타일 비교에서 \`tiles\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 타일 비교 실행 뒤 \`tiles\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step6_tilelayer\r
  title: 6단계. TileLayer 추가\r
  structuredPrimary: true\r
  subtitle: TileLayer()\r
  goal: 6단계. TileLayer 추가에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    TileLayer()로 지도에 타일 레이어를 추가합니다. 여러 타일을 겹쳐 사용하거나 전환할 수 있습니다.\r
\r
    tiles=None으로 시작하고 TileLayer를 추가하면 LayerControl과 함께 사용할 수 있습니다.\r
  snippet: |-\r
    m10 = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)\r
\r
    folium.TileLayer("OpenStreetMap").add_to(m10)\r
\r
    m10\r
  exercise:\r
    prompt: 6단계. TileLayer 추가 예제에서 \`m10\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m10 = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)\r
\r
      folium.TileLayer("OpenStreetMap").add_to(m10)\r
\r
      m10\r
    hints:\r
    - 바꿀 지점은 \`m10 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`m10\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 6단계. TileLayer 추가에서 \`m10\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. TileLayer 추가 실행 뒤 \`m10\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step7_custom_tile\r
  title: 7단계. 커스텀 타일 URL\r
  structuredPrimary: true\r
  subtitle: 외부 타일 서버\r
  goal: 7단계. 커스텀 타일 URL에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    URL 템플릿으로 외부 타일 서버를 사용할 수 있습니다. {z}, {x}, {y}는 줌 레벨과 타일 좌표입니다.\r
\r
    attr은 저작권 표시입니다. 타일 제공자의 이용약관에 따라 표시해야 합니다.\r
  snippet: |-\r
    m12 = folium.Map(location=[37.6608, 126.9933], zoom_start=12)\r
\r
    folium.TileLayer(\r
        tiles="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",\r
        attr="OpenTopoMap",\r
        name="지형도"\r
    ).add_to(m12)\r
\r
    m12\r
  exercise:\r
    prompt: 7단계. 커스텀 타일 URL 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m12 = folium.Map(location=[37.6608, 126.9933], zoom_start=12)\r
\r
      folium.TileLayer(\r
          tiles="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",\r
          attr="OpenTopoMap",\r
          name="지형도"\r
      ).add_to(m12)\r
\r
      m12\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 커스텀 타일 URL에서 \`m12\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 커스텀 타일 URL 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step8_tile_opacity\r
  title: 8단계. 타일 투명도\r
  structuredPrimary: true\r
  subtitle: opacity\r
  goal: 8단계. 타일 투명도에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    타일의 투명도를 조절하여 여러 타일을 겹쳐 볼 수 있습니다.\r
\r
    opacity는 0(투명)~1(불투명)입니다. 0.3 정도면 아래 지도가 비쳐 보입니다.\r
  snippet: |-\r
    m13 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
    folium.TileLayer(\r
        tiles="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",\r
        attr="Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap",\r
        opacity=0.3,\r
        name="지형 오버레이"\r
    ).add_to(m13)\r
\r
    m13\r
  exercise:\r
    prompt: 8단계. 타일 투명도 예제에서 \`m13\`, \`tiles\`, \`attr\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      m13 = folium.Map(location=seoulCenter, zoom_start=12)\r
\r
      folium.TileLayer(\r
          tiles="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",\r
          attr="Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap",\r
          opacity=0.3,\r
          name="지형 오버레이"\r
      ).add_to(m13)\r
\r
      m13\r
    hints:\r
    - 바꿀 지점은 \`m13 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`m13\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 타일 투명도에서 \`m13\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 타일 투명도 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_use_cases\r
  title: 9단계. 용도별 추천\r
  structuredPrimary: true\r
  subtitle: 상황에 맞는 타일\r
  goal: 9단계. 용도별 추천에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    용도에 따라 적합한 타일을 선택합니다.\r
\r
    밝은 배경에는 진한 색(blue, red, green), 어두운 배경에는 밝은 색(yellow, orange, white)을 사용하세요.\r
  snippet: |-\r
    dataMap = folium.Map(\r
        location=seoulCenter,\r
        zoom_start=12,\r
        tiles="CartoDB Positron"\r
    )\r
\r
    spots = [\r
        [37.5665, 126.9780],\r
        [37.4979, 127.0276],\r
        [37.5563, 126.9236]\r
    ]\r
\r
    for spot in spots:\r
        folium.CircleMarker(\r
            location=spot,\r
            radius=15,\r
            color="blue",\r
            fill=True,\r
            fill_opacity=0.6\r
        ).add_to(dataMap)\r
\r
    dataMap\r
  exercise:\r
    prompt: 9단계. 용도별 추천 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      dataMap = folium.Map(\r
          location=seoulCenter,\r
          zoom_start=12,\r
          tiles="CartoDB Positron"\r
      )\r
\r
      spots = [\r
          [37.5665, 126.9780],\r
          [37.4979, 127.0276],\r
          [37.5563, 126.9236]\r
      ]\r
\r
      for spot in spots:\r
          folium.CircleMarker(\r
              location=spot,\r
              radius=15,\r
              color="blue",\r
              fill=True,\r
              fill_opacity=0.6\r
          ).add_to(dataMap)\r
\r
      dataMap\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 용도별 추천의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 용도별 추천 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_complete\r
  title: 10단계. 완성 예제\r
  structuredPrimary: true\r
  subtitle: 낮/밤 모드 지도\r
  goal: 10단계. 완성 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    LayerControl로 낮/밤 모드를 전환할 수 있는 지도를 만듭니다.\r
\r
    우측 상단의 레이어 컨트롤에서 낮 모드/밤 모드를 선택할 수 있습니다.\r
  snippet: |-\r
    places = [\r
        {"name": "서울시청", "loc": [37.5665, 126.9780]},\r
        {"name": "강남역", "loc": [37.4979, 127.0276]},\r
        {"name": "홍대입구", "loc": [37.5563, 126.9236]},\r
        {"name": "명동", "loc": [37.5636, 126.9869]}\r
    ]\r
\r
    themeMap = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)\r
\r
    folium.TileLayer(\r
        "CartoDB Positron",\r
        name="낮 모드"\r
    ).add_to(themeMap)\r
\r
    folium.TileLayer(\r
        "CartoDB Dark_Matter",\r
        name="밤 모드"\r
    ).add_to(themeMap)\r
\r
    for place in places:\r
        folium.Marker(\r
            location=place["loc"],\r
            popup=place["name"],\r
            tooltip=place["name"],\r
            icon=folium.Icon(color="red", icon="star")\r
        ).add_to(themeMap)\r
\r
    folium.LayerControl().add_to(themeMap)\r
\r
    themeMap\r
  exercise:\r
    prompt: 10단계. 완성 예제 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      places = [\r
          {"name": "서울시청", "loc": [37.5665, 126.9780]},\r
          {"name": "강남역", "loc": [37.4979, 127.0276]},\r
          {"name": "홍대입구", "loc": [37.5563, 126.9236]},\r
          {"name": "명동", "loc": [37.5636, 126.9869]}\r
      ]\r
\r
      themeMap = folium.Map(location=seoulCenter, zoom_start=12, tiles=None)\r
\r
      folium.TileLayer(\r
          "CartoDB Positron",\r
          name="낮 모드"\r
      ).add_to(themeMap)\r
\r
      folium.TileLayer(\r
          "CartoDB Dark_Matter",\r
          name="밤 모드"\r
      ).add_to(themeMap)\r
\r
      for place in places:\r
          folium.Marker(\r
              location=place["loc"],\r
              popup=place["name"],\r
              tooltip=place["name"],\r
              icon=folium.Icon(color="red", icon="star")\r
          ).add_to(themeMap)\r
\r
      folium.LayerControl().add_to(themeMap)\r
\r
      themeMap\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 완성 예제의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 완성 예제 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step11_workflow\r
  title: 11단계. 실무 타일 선택 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → attribution 오류 확인 → 렌더 검증 → 용도 실험\r
  goal: 11단계. 실무 타일 선택 검증에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지도 스타일은 취향 문제가 아니라 데이터가 잘 읽히는지와 라이선스 표시가 맞는지의 문제입니다. 업무용 지도에서는 타일 프로필을 정의하고, 커스텀 URL에는 attribution이 있는지 검증한 뒤, 레이어 이름이 HTML에 렌더링되는지 확인해야 합니다.\r
\r
    타일 선택은 보기 좋은 배경 고르기가 아닙니다. 데이터 대비, 업무 목적, attribution, LayerControl 렌더링을 함께 검증해야 로컬에서 반복 실행 가능한 지도 커리큘럼이 됩니다.\r
  tips:\r
  - 타일 선택은 보기 좋은 배경 고르기가 아닙니다. 데이터 대비, 업무 목적, attribution, LayerControl 렌더링을 함께 검증해야 로컬에서 반복 실행 가능한 지도\r
    커리큘럼이 됩니다.\r
  snippet: |-\r
    tileProfiles = {\r
        "operations": {"name": "운영 기본", "tiles": "OpenStreetMap", "attr": None, "useCase": "현장 위치 확인"},\r
        "report": {"name": "리포트 배경", "tiles": "CartoDB Positron", "attr": None, "useCase": "데이터 시각화"},\r
        "night": {"name": "야간 관제", "tiles": "CartoDB Dark_Matter", "attr": None, "useCase": "야간 대시보드"},\r
        "terrain": {\r
            "name": "지형 점검",\r
            "tiles": "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",\r
            "attr": "Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap",\r
            "useCase": "산악/고도 맥락",\r
        },\r
    }\r
\r
    recommendedProfile = tileProfiles["report"]\r
    recommendedProfile["name"], recommendedProfile["useCase"]\r
  exercise:\r
    prompt: 11단계. 실무 타일 선택 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      tileProfiles = {\r
          "operations": {"name": "운영 기본", "tiles": "OpenStreetMap", "attr": None, "useCase": "현장 위치 확인"},\r
          "report": {"name": "리포트 배경", "tiles": "CartoDB Positron", "attr": None, "useCase": "데이터 시각화"},\r
          "night": {"name": "야간 관제", "tiles": "CartoDB Dark_Matter", "attr": None, "useCase": "야간 대시보드"},\r
          "terrain": {\r
              "name": "지형 점검",\r
              "tiles": "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",\r
              "attr": "Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap",\r
              "useCase": "산악/고도 맥락",\r
          },\r
      }\r
\r
      recommendedProfile = tileProfiles["report"]\r
      recommendedProfile["name"], recommendedProfile["useCase"]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 11단계. 실무 타일 선택 검증에서 \`tileProfiles\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 11단계. 실무 타일 선택 검증 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 타일 스타일\r
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 지금까지 배운 내용을 활용하여 미션을 수행해봅시다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import folium\r
    mountains = [\r
        {"name": "북한산", "loc": [37.6608, 126.9933]},\r
        {"name": "관악산", "loc": [37.4450, 126.9639]},\r
        {"name": "도봉산", "loc": [37.6985, 127.0145]}\r
    ]\r
    mountains\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import folium\r
      mountains = [\r
          {"name": "북한산", "loc": [37.6608, 126.9933]},\r
          {"name": "관악산", "loc": [37.4450, 126.9639]},\r
          {"name": "도봉산", "loc": [37.6985, 127.0145]}\r
      ]\r
      mountains\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`mountains\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 \`mountains\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
`;export{e as default};